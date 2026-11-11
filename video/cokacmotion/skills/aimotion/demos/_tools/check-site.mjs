#!/usr/bin/env node
// _tools/check-site.mjs — open every demo of a built site in headless Chromium and report what failed to load:
//   node _tools/check-site.mjs [siteDir] [--only 01-svg-ink,05-fbm-nebula] [--jobs 4]
// siteDir defaults to <repo>/_site; pass the demos folder itself for a baseline with the full node_modules.
// The site is served under /cokacmotion/ like GitHub Pages serves a project site. Each demo runs with ?render=1,
// waits for setup, then seeks to its middle and end so files loaded later are requested too.
// A 404 or failed request inside the site is a build bug (exit 1). Script errors are listed apart: headless
// Chromium renders WebGL on the CPU and has no WebGPU, so compare them with a run on the demos folder.
// Chromium: playwright-core's own, or PLAYWRIGHT_CHROMIUM=/path/to/chrome.
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const DEMOS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const only = opt('--only', '');
const JOBS = Number(opt('--jobs', 4));
const SITE = path.resolve(args[0] || path.join(DEMOS, '..', '..', '..', '_site'));
const BASE = '/cokacmotion/';
const index = JSON.parse(fs.readFileSync(path.join(DEMOS, '..', 'index.json'), 'utf8'));
const ids = only ? only.split(',') : index.demos.map((d) => d.id);

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.wasm': 'application/wasm', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!u.startsWith(BASE)) { res.writeHead(404).end(); return; }
  const p = path.normalize(path.join(SITE, u.slice(BASE.length)));
  if (!p.startsWith(SITE)) { res.writeHead(403).end(); return; }
  fs.stat(p, (e, st) => {
    const f = !e && st.isDirectory() ? path.join(p, 'index.html') : p;
    fs.readFile(f, (err, buf) => {
      if (err) { res.writeHead(404).end('not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }).end(buf);
    });
  });
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

function findChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM;
  const root = path.join(os.homedir(), '.cache', 'ms-playwright');
  try { if (fs.existsSync(chromium.executablePath())) return undefined; } catch { /* not installed */ }
  const dirs = fs.existsSync(root) ? fs.readdirSync(root).filter((d) => d.startsWith('chromium_headless_shell-')).sort().reverse() : [];
  for (const d of dirs) for (const sub of fs.readdirSync(path.join(root, d))) {
    const exe = path.join(root, d, sub, 'chrome-headless-shell');
    if (fs.existsSync(exe)) return exe;
  }
  return undefined;
}
const browser = await chromium.launch({ executablePath: findChromium(), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

async function check(id) {
  const r = { id, missing: new Set(), external: new Set(), errors: [] };
  const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
  page.on('response', (res) => { if (res.status() >= 400 && res.url().startsWith(ORIGIN)) r.missing.add(res.url().slice(ORIGIN.length + BASE.length)); });
  page.on('requestfailed', (req) => {
    const u = req.url();
    if (u.startsWith(ORIGIN)) r.missing.add(`${u.slice(ORIGIN.length + BASE.length)} (${req.failure()?.errorText})`);
    else if (/^https?:/.test(u)) r.external.add(u);
  });
  page.on('request', (req) => { const u = req.url(); if (/^https?:/.test(u) && !u.startsWith(ORIGIN)) r.external.add(u); });
  page.on('pageerror', (e) => r.errors.push(String(e.message || e).split('\n')[0]));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) r.errors.push(m.text().split('\n')[0]); });
  try {
    await page.goto(`${ORIGIN}${BASE}${id}/?render=1`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(() => window.__video && (window.__video.ready || window.__video.error), null, { timeout: 180000 });
    const v = await page.evaluate(() => ({ ready: window.__video.ready, error: window.__video.error, duration: window.__video.duration }));
    if (v.ready) {
      for (const t of [v.duration / 2, v.duration - 0.05]) await page.evaluate((x) => window.__video.seek(x), t);
    } else r.errors.push(`setup failed: ${String(v.error).split('\n')[0]}`);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  } catch (e) {
    r.errors.push(`check: ${String(e.message || e).split('\n')[0]}`);
  }
  await page.close();
  return r;
}

// the gallery: every poster and demo link resolves
const galleryMissing = [];
const gallery = fs.readFileSync(path.join(SITE, 'index.html'), 'utf8');
for (const m of gallery.matchAll(/(?:src|href)="\.\/([^"]*)"/g)) {
  const f = path.join(SITE, m[1]);
  if (!fs.existsSync(m[1].endsWith('/') || !m[1] ? path.join(f, 'index.html') : f)) galleryMissing.push(m[1]);
}

const results = [];
let next = 0, done = 0;
await Promise.all(Array.from({ length: Math.min(JOBS, ids.length) }, async () => {
  while (next < ids.length) {
    const r = await check(ids[next++]);
    results.push(r);
    const bad = r.missing.size ? 'MISSING' : r.errors.length ? 'error' : 'ok';
    process.stdout.write(`[${++done}/${ids.length}] ${r.id} ${bad}\n`);
  }
}));
await browser.close();
server.close();

results.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
const miss = results.filter((r) => r.missing.size), errs = results.filter((r) => r.errors.length), ext = results.filter((r) => r.external.size);
console.log(`\n${SITE}: ${results.length} demos — ${results.length - miss.length - errs.filter((r) => !r.missing.size).length} clean, ${miss.length} with missing files, ${errs.length} with script errors`);
if (galleryMissing.length) console.log('gallery links that do not resolve:', galleryMissing.join(', '));
for (const r of miss) console.log(`MISSING ${r.id}:\n  ${[...r.missing].join('\n  ')}`);
for (const r of errs) console.log(`errors ${r.id}:\n  ${[...new Set(r.errors)].slice(0, 5).join('\n  ')}`);
for (const r of ext) console.log(`external ${r.id}: ${[...r.external].join(', ')}`);
process.exit(miss.length || galleryMissing.length ? 1 : 0);
