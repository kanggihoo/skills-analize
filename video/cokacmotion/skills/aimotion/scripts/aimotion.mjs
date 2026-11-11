#!/usr/bin/env node
// aimotion.mjs — find techniques in the aimotion demos inside this skill and print their notes and source.
// Reads only the files of this skill (index.json, demos/); no network.
//   search <words…> [--limit N]     demos ranked by title, tech, key points, libraries, group, scene
//   list                            every demo, by group
//   show <id> [--notes | --code]    the demo's NOTES.md and source as text (or one of the two)
//   path <id>                       the demo's folder and files (open them, poster.jpg and sheet.jpg directly)
//   common                          the shared code every demo loads (demos/_lib)
// <id> is the folder name (03-coral-growth) or just its number (3).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEMOS = path.join(SKILL, 'demos');
const [cmd, ...rest] = process.argv.slice(2);
const flags = new Set(rest.filter((a) => a.startsWith('--')));
const args = rest.filter((a, i) => !a.startsWith('--') && rest[i - 1] !== '--limit');

const die = (msg) => { console.error(msg); process.exit(1); };
const index = () => JSON.parse(fs.readFileSync(path.join(SKILL, 'index.json'), 'utf8'));
const read = (f) => fs.readFileSync(f, 'utf8');
const needDemo = () => {
  const id = args[0];
  if (!id) die('demo id가 필요하다 (예: 03-coral-growth 또는 3)');
  const d = index().demos.find((x) => x.id === id || (/^\d+$/.test(id) && x.number === Number(id)));
  if (!d) die(`없다: ${id} — id는 \`node ${path.basename(process.argv[1])} search …\`나 \`list\`로 찾는다`);
  return d;
};
const line = (d) => `${d.id}  ${d.title} — ${d.tech}`;
const dump = (name, body) => `======== ${name} (${body.split('\n').length - (body.endsWith('\n') ? 1 : 0)}줄) ========\n${body.replace(/\n?$/, '\n')}`;

const commands = {
  search() {
    const words = args.map((w) => w.toLowerCase()).filter(Boolean);
    if (!words.length) die('찾을 말이 필요하다 (예: search 잉크 번짐)');
    const limit = Number(rest[rest.indexOf('--limit') + 1]) || 8;
    const { demos } = index();
    const fields = (d) => [[d.title, 3], [d.tech, 3], [d.points.join(' '), 2], [d.libraries.join(' '), 2], [d.id, 2], [d.group, 1], [d.scene, 1]];
    const ranked = demos.map((d) => ({ d, score: words.reduce((s, w) => s + fields(d).reduce((a, [text, k]) => a + (String(text).toLowerCase().includes(w) ? k : 0), 0), 0) }))
      .filter((x) => x.score > 0).sort((a, b) => b.score - a.score || a.d.number - b.d.number).slice(0, limit);
    if (!ranked.length) die(`"${args.join(' ')}"에 맞는 데모가 없다. 다른 말로 찾거나 list로 전체를 본다.`);
    for (const { d } of ranked) {
      console.log(`\n${line(d)}\n  분류: ${d.group}`);
      if (d.scene) console.log(`  데모 장면(예시, 옮기지 않음): ${d.scene}`);
      if (d.points.length) console.log(`  배울 점: ${d.points.join(' · ')}`);
      console.log(`  라이브러리: ${d.libraries.join(', ') || '없음 (브라우저 기능만)'}`);
      for (const c of d.cautions) console.log(`  영상: ${c}`);
      console.log(`  폴더: ${path.join(DEMOS, d.id)}`);
      if (d.poster) console.log(`  그림: ${path.join(DEMOS, d.id, 'out', 'poster.jpg')}`);
    }
    console.log(`\n"데모 장면"은 기법을 보여 준 예다. 영상에는 기술만 옮기고, 장면은 영상의 대본으로 새로 짓는다.`);
    console.log(`다음: node ${path.basename(process.argv[1])} show <id> --notes`);
  },
  list() {
    const { demos, groups, principle } = index();
    console.log(`# 가장 중요한 규칙: ${principle}`);
    for (const g of groups) {
      console.log(`\n## ${g.name} — ${g.description}`);
      for (const d of demos.filter((x) => x.group === g.name)) console.log(line(d));
    }
  },
  show() {
    const d = needDemo();
    const dir = path.join(DEMOS, d.id);
    const out = [`# ${line(d)}`, `# 가장 중요한 규칙: ${index().principle}`,
      '# 노트의 "화면"은 이 데모가 그린 것이다. 기법을 보여 준 예일 뿐, 영상에 옮기지 않는다.',
      `# 폴더: ${dir} (공통 코드 ../_lib/: ${path.join(DEMOS, '_lib')})`, ''];
    const both = !flags.has('--notes') && !flags.has('--code');
    if (both || flags.has('--notes')) out.push(dump('NOTES.md', read(path.join(dir, 'NOTES.md'))));
    if (both || flags.has('--code')) for (const f of d.files) out.push(dump(f, read(path.join(dir, f))));
    process.stdout.write(out.join('\n'));
  },
  path() {
    const d = needDemo();
    const dir = path.join(DEMOS, d.id);
    console.log(dir);
    for (const f of ['NOTES.md', ...d.files, ...(d.poster ? ['out/poster.jpg'] : []), ...(d.sheet ? ['out/sheet.jpg'] : [])]) console.log(`  ${f}`);
    console.log(`# 가장 중요한 규칙: ${index().principle}`);
  },
  common() {
    const lib = path.join(DEMOS, '_lib');
    const files = fs.readdirSync(lib).filter((f) => /\.(m?js|css)$/.test(f)).sort((a, b) => /\.css$/.test(a) - /\.css$/.test(b) || a.localeCompare(b));
    process.stdout.write([`# aimotion 공통 코드 (${lib})`, '# 모든 데모가 ../_lib/에서 부르는 파일이다.', '', ...files.map((f) => dump(`_lib/${f}`, read(path.join(lib, f))))].join('\n'));
  },
};

if (!commands[cmd]) {
  console.log(read(fileURLToPath(import.meta.url)).split('\n').slice(1, 9).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(cmd ? 1 : 0);
}
commands[cmd]();
