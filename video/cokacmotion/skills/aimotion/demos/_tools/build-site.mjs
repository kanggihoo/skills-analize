#!/usr/bin/env node
// _tools/build-site.mjs — build the static preview site published on GitHub Pages:
//   npm ci && node _tools/build-site.mjs [outDir]        (default outDir: <repo>/_site)
// Copies every demo and _lib, plus only the node_modules files the demos actually load — the ES-module graph
// from each page's imports and import map, the woff2 files of every font CSS a demo links, and data files
// named by path — then writes a gallery index.html. Every link is relative, so the site works under any
// sub-path (https://<user>.github.io/<repo>/) and from _tools/serve.mjs alike. Verify with _tools/check-site.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEMOS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = path.dirname(DEMOS);
const REPO = path.resolve(SKILL, '..', '..');
const NM = path.join(DEMOS, 'node_modules');
const OUT = path.resolve(process.argv[2] || path.join(REPO, '_site'));
const MARK = '.aimotion-site';
const REPO_URL = 'https://github.com/kstost/cokacmotion';
const NOTES_URL = (id) => `${REPO_URL}/blob/main/skills/aimotion/demos/${id}/NOTES.md`;

const index = JSON.parse(fs.readFileSync(path.join(SKILL, 'index.json'), 'utf8'));
if (!fs.existsSync(NM)) fail('node_modules is missing — run `npm ci` in skills/aimotion/demos first');

// ── out dir: only ever clear a directory this script made (it keeps .git so a gh-pages worktree survives)
if (fs.existsSync(OUT)) {
  const left = fs.readdirSync(OUT).filter((f) => f !== '.git');
  if (left.length && !left.includes(MARK)) fail(`${OUT} is not empty and was not made by this script — choose another folder`);
  for (const f of left) fs.rmSync(path.join(OUT, f), { recursive: true, force: true });
} else fs.mkdirSync(OUT, { recursive: true });

const warnings = [];
const missing = [];
const rel = (p) => path.relative(DEMOS, p);

// ── 1. demos and _lib: everything except the notes (linked on GitHub) and the contact sheet
const SKIP = new Set(['NOTES.md', path.join('out', 'sheet.jpg')]);
const roots = [];   // text files whose references we follow
function copyTree(src, dst, base = src) {
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (SKIP.has(path.relative(base, s)) || e.name === '.DS_Store') continue;
    if (e.isDirectory()) { copyTree(s, d, base); continue; }
    fs.mkdirSync(dst, { recursive: true });
    fs.copyFileSync(s, d);
    if (/\.(html|m?js|css)$/.test(e.name)) roots.push(s);
  }
}
for (const d of index.demos) {
  const dir = path.join(DEMOS, d.id);
  if (!fs.existsSync(path.join(dir, 'index.html'))) fail(`demo ${d.id} has no index.html`);
  copyTree(dir, path.join(OUT, d.id));
}
copyTree(path.join(DEMOS, '_lib'), path.join(OUT, '_lib'));

// ── 2. import maps (one union map; the demos agree on every key)
const importMap = {};
for (const f of roots.filter((f) => f.endsWith('.html'))) {
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/<script\s+type=["']importmap["'][^>]*>([\s\S]*?)<\/script>/g)) {
    for (const [k, v] of Object.entries(JSON.parse(m[1]).imports || {})) {
      const abs = path.resolve(path.dirname(f), v) + (v.endsWith('/') ? path.sep : '');
      if (importMap[k] && importMap[k] !== abs) warnings.push(`import map key "${k}" differs between demos (${rel(f)})`);
      importMap[k] = abs;
    }
  }
}
function resolveBare(spec) {
  if (importMap[spec]) return importMap[spec];
  const pre = Object.keys(importMap).filter((k) => k.endsWith('/') && spec.startsWith(k)).sort((a, b) => b.length - a.length)[0];
  return pre ? importMap[pre] + spec.slice(pre.length) : null;
}

// ── 3. follow references into node_modules
const need = new Set();
const queue = [];
function want(abs, from, strict = true) {
  if (!abs.startsWith(NM + path.sep)) return;          // inside a demo or _lib: copied already
  abs = abs.split(/[?#]/)[0];
  let st; try { st = fs.statSync(abs); } catch { st = null; }
  if (!st || !st.isFile()) { (strict ? missing : warnings).push(`${rel(abs)}  ← ${rel(from)}`); return; }
  if (need.has(abs)) return;
  need.add(abs);
  if (/\.(m?js|css)$/.test(abs)) queue.push(abs);
}
/** a path that holds a template literal (`…/${w}.css`): every file it can name */
function expand(dir, p) {
  const parts = p.split('/').filter((s) => s && s !== '.');
  let cur = [dir];
  for (const part of parts) {
    if (part === '..') { cur = cur.map((c) => path.dirname(c)); continue; }
    if (!part.includes('${')) { cur = cur.map((c) => path.join(c, part)); continue; }
    const re = new RegExp('^' + part.split(/\$\{[^}]*\}/).map((s) => s.replace(/[.*+?^()|[\]\\]/g, '\\$&')).join('[^/]*') + '$');
    cur = cur.flatMap((c) => { try { return fs.readdirSync(c).filter((n) => re.test(n)).map((n) => path.join(c, n)); } catch { return []; } });
  }
  return cur;
}
function scanJs(file, src, isRoot) {
  const dir = path.dirname(file);
  const specs = new Set();
  for (const re of [
    /(?:^|[^.\w$])import\s*(?:[\w$*{}\s,]+?\s*from\s*)?(['"])([^'"\n]+)\1/g,
    /(?:^|[^.\w$])export\s*(?:\*(?:\s*as\s+[\w$]+)?|\{[^}]*\})\s*from\s*(['"])([^'"\n]+)\1/g,
    /(?:^|[^.\w$])import\(\s*(['"])([^'"\n]+)\1\s*\)/g,
    /new URL\(\s*(['"`])([^'"`\n]+)\1\s*,\s*import\.meta\.url/g,
  ]) for (const m of src.matchAll(re)) specs.add(m[2]);
  for (const s of specs) {
    if (/^(https?:|data:|blob:)/.test(s)) { if (/^https?:/.test(s)) warnings.push(`external import ${s}  ← ${rel(file)}`); continue; }
    if (s.includes('${')) {   // a computed path: follow it in demo code; inside a library it is usually a CDN template
      if (isRoot) { const hits = expand(dir, s); if (!hits.length) missing.push(`${s}  ← ${rel(file)}`); hits.forEach((f) => want(f, file)); }
      else warnings.push(`computed import "${s}"  ← ${rel(file)}`);
      continue;
    }
    const abs = /^\.{0,2}\//.test(s) ? path.resolve(dir, s) : resolveBare(s);
    // a bare name with no import-map entry fails in the browser too — unless the "import" sat in a string or comment
    if (!abs) { (isRoot ? missing : warnings).push(`unresolved import "${s}"  ← ${rel(file)}`); continue; }
    want(abs, file, isRoot);
  }
}
function scanCss(file, src) {
  const dir = path.dirname(file);
  const urls = [];
  // in a src: list the browser takes the first format it supports — fontsource lists woff2 first, so skip the woff fallbacks
  src = src.replace(/src\s*:\s*([^;}]+)/g, (_, v) => { const u = v.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/); if (u) urls.push(u[1]); return ''; });
  for (const m of src.matchAll(/@import\s+(?:url\(\s*)?['"]?([^'")\s;]+)/g)) urls.push(m[1]);
  for (const m of src.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) urls.push(m[1]);
  for (const u of urls) if (!/^(data:|https?:|#)/.test(u)) want(path.resolve(dir, u), file);
}
function scan(file, isRoot) {
  const src = fs.readFileSync(file, 'utf8');
  // any path literal into node_modules: <script src>, <link href>, font CSS lists, fetch(), new URL()
  for (const m of src.matchAll(/(?:\.\.\/)+node_modules\/[^'"`)\s]+/g)) {
    const p = m[0];
    if (p.endsWith('/')) continue;                              // an import-map prefix, resolved per import
    if (p.includes('${')) {
      const hits = expand(path.dirname(file), p).filter((f) => fs.statSync(f).isFile());
      if (!hits.length) (isRoot ? missing : warnings).push(`${p}  ← ${rel(file)}`);
      hits.forEach((f) => want(f, file, isRoot));
    }
    else want(path.resolve(path.dirname(file), p), file, isRoot);
  }
  if (/\.m?js$/.test(file)) scanJs(file, src, isRoot);
  else if (file.endsWith('.css')) scanCss(file, src);
}
for (const f of roots) scan(f, true);
while (queue.length) scan(queue.shift(), false);

// ── 4. copy what was reached, with each package's licence
const pkgs = new Set();
for (const f of need) {
  const r = path.relative(NM, f).split(path.sep);
  pkgs.add(r[0].startsWith('@') ? path.join(r[0], r[1]) : r[0]);
  copy(f);
}
for (const p of pkgs) {
  const dir = path.join(NM, p);
  for (const n of fs.readdirSync(dir)) if (/^(licen[cs]e|copying|notice)/i.test(n) && fs.statSync(path.join(dir, n)).isFile()) copy(path.join(dir, n));
}
function copy(f) {
  const d = path.join(OUT, path.relative(DEMOS, f));
  fs.mkdirSync(path.dirname(d), { recursive: true });
  fs.copyFileSync(f, d);
}

// ── 5. gallery page
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const groups = index.groups.map((g, i) => ({ ...g, anchor: `g${i + 1}`, demos: index.demos.filter((d) => d.group === g.name) }));
const strays = index.demos.filter((d) => !index.groups.some((g) => g.name === d.group));
if (strays.length) warnings.push(`demos without a known group: ${strays.map((d) => d.id).join(', ')}`);
const card = (d) => {
  const num = String(d.number).padStart(2, '0');
  const hay = [num, d.title, d.tech, d.group, d.scene, ...(d.points || []), ...(d.libraries || [])].join(' ').toLowerCase();
  return `<li class="card" data-q="${esc(hay)}">
<a class="play" href="./${d.id}/" aria-label="${esc(`${num} ${d.title} 재생`)}">${d.poster ? `<img src="./${d.id}/out/poster.jpg" alt="" loading="lazy" decoding="async" width="540" height="960">` : '<span class="noposter"></span>'}</a>
<div class="meta"><a class="name" href="./${d.id}/"><b>${num}</b> ${esc(d.title)}</a><p>${esc(d.tech)}</p><a class="notes" href="${NOTES_URL(d.id)}">구현 노트</a></div>
</li>`;
};
const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>aimotion — 웹 그래픽 표현 기법 데모 ${index.count}편</title>
<meta name="description" content="${esc(index.description)}">
<link rel="stylesheet" href="./_lib/fonts.css">
<style>
:root{--bg:#0d0d0f;--panel:#17171b;--line:#2a2a31;--fg:#ececf0;--dim:#9a9aa6;--accent:#ffcf5a;color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.55 "Pretendard Variable",Pretendard,system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}
a{color:inherit}
.wrap{max-width:1240px;margin:0 auto;padding:0 20px}
header.wrap{padding-top:56px;padding-bottom:24px}
h1{font-size:clamp(30px,5vw,46px);line-height:1.1;margin:0 0 12px;letter-spacing:-.02em}
h1 small{font-size:.5em;color:var(--dim);font-weight:500;letter-spacing:0;margin-left:.4em}
.lead{color:var(--dim);margin:0;max-width:62ch}
.lead a{color:var(--fg)}
.tools{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);padding:12px 0}
.tools .wrap{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
input[type=search]{flex:1 1 220px;min-width:0;background:var(--panel);border:1px solid var(--line);color:var(--fg);border-radius:10px;padding:10px 14px;font:inherit}
input[type=search]:focus{outline:2px solid var(--accent);outline-offset:-1px}
nav{display:flex;gap:6px;flex-wrap:wrap}
nav a{font-size:13px;text-decoration:none;color:var(--dim);border:1px solid var(--line);border-radius:999px;padding:4px 10px;white-space:nowrap}
nav a:hover{color:var(--fg);border-color:var(--dim)}
section{padding:36px 0 8px}
section[hidden]{display:none}
h2{font-size:22px;margin:0 0 4px;letter-spacing:-.01em}
h2 span{color:var(--dim);font-weight:500;font-size:15px;margin-left:6px}
.gdesc{color:var(--dim);margin:0 0 18px;font-size:14px}
ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:18px}
.card[hidden]{display:none}
.play{display:block;aspect-ratio:9/16;border-radius:10px;overflow:hidden;background:var(--panel);border:1px solid var(--line)}
.play img,.noposter{display:block;width:100%;height:100%;object-fit:cover;transition:transform .25s}
.play:hover img{transform:scale(1.03)}
.play:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.meta{padding:8px 2px 0}
.name{display:block;text-decoration:none;font-weight:650;line-height:1.35}
.name b{color:var(--accent);font-variant-numeric:tabular-nums;margin-right:2px}
.meta p{margin:3px 0 4px;color:var(--dim);font-size:12.5px;line-height:1.4}
.notes{font-size:12.5px;color:var(--dim)}
.notes:hover{color:var(--fg)}
.empty{color:var(--dim);padding:40px 0}
footer.wrap{color:var(--dim);font-size:13px;padding-top:28px;padding-bottom:64px;border-top:1px solid var(--line);margin-top:40px}
footer p{margin:0 0 6px;max-width:80ch}
@media (max-width:720px){nav{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin:0 -20px;padding:0 20px;width:calc(100% + 40px)}nav::-webkit-scrollbar{display:none}}
@media (max-width:520px){ul{grid-template-columns:repeat(2,1fr);gap:14px}header.wrap{padding-top:36px}}
</style>
</head>
<body>
<header class="wrap">
<h1>aimotion<small>데모 ${index.count}편 · ${groups.length}개 분류</small></h1>
<p class="lead">${esc(index.description)}. 그림을 누르면 데모가 브라우저에서 재생되고, ‘구현 노트’는 원리와 구현을 설명한다. 재생 중 스페이스·클릭 = 재생/멈춤, ←/→ = ±0.5초, H = 재생 막대 숨기기. 소스와 설치 방법은 <a href="${REPO_URL}">GitHub</a>에.</p>
</header>
<div class="tools"><div class="wrap">
<input type="search" id="q" placeholder="찾기: 잉크, 셰이더, GSAP, 자막 …" aria-label="데모 찾기">
<nav>${groups.map((g) => `<a href="#${g.anchor}">${esc(g.name)}</a>`).join('')}</nav>
</div></div>
<main class="wrap">
${groups.map((g) => `<section id="${g.anchor}">
<h2>${esc(g.name)}<span>${g.demos.length}편</span></h2>
<p class="gdesc">${esc(g.description)}</p>
<ul>
${g.demos.map(card).join('\n')}
</ul>
</section>`).join('\n')}
<p class="empty" id="empty" hidden>찾는 데모가 없다.</p>
</main>
<footer class="wrap">
<p>${esc(index.principle)}</p>
<p>모든 데모는 시각 t의 순수 함수로 그린다. 주소에 <code>?t=3.2</code>를 붙이면 그 시각부터 재생한다. 무거운 셰이더·시뮬레이션 데모는 기기 성능에 따라 프레임이 떨어질 수 있다.</p>
<p>MIT · 데모가 쓰는 라이브러리와 글꼴은 각자의 라이선스를 따른다 (각 <code>node_modules/&lt;패키지&gt;/</code> 안).</p>
</footer>
<script>
const q = document.getElementById('q'), cards = [...document.querySelectorAll('.card')], secs = [...document.querySelectorAll('main section')];
function filter() {
  const words = q.value.trim().toLowerCase().split(/\\s+/).filter(Boolean);
  for (const c of cards) c.hidden = !words.every((w) => c.dataset.q.includes(w));
  let any = false;
  for (const s of secs) { const v = s.querySelector('.card:not([hidden])'); s.hidden = !v; any ||= !!v; }
  document.getElementById('empty').hidden = any;
}
q.addEventListener('input', filter);
if (q.value) filter();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(OUT, 'index.html'), html);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');   // Jekyll would drop _lib/
fs.writeFileSync(path.join(OUT, MARK), 'built by skills/aimotion/demos/_tools/build-site.mjs — this folder is cleared on every build\n');

// ── report
const size = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => e.name === '.git' ? n : n + (e.isDirectory() ? size(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size), 0);
const mb = (b) => (b / 1048576).toFixed(1) + ' MB';
console.log(`site: ${OUT}`);
console.log(`  ${index.demos.length} demos, ${need.size} files from ${pkgs.size} packages`);
console.log(`  total ${mb(size(OUT))} (node_modules ${mb(size(path.join(OUT, 'node_modules')))})`);
for (const w of warnings) console.log('  warn:', w);
if (missing.length) { for (const m of missing) console.error('  MISSING:', m); process.exit(1); }

function fail(msg) { console.error('build-site:', msg); process.exit(1); }
