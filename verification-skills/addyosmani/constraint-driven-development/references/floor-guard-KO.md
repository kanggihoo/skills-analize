# Floor guard: 참조 구현

`CONSTRAINTS.md`의 번호가 매겨진 모든 차원은 사실상 표준(de facto) 도구에 대응한다(Step 4). **하한선(floor)**은 그렇지 않다. 하한선은 Step 6의 다섯 가지 움직임에 대한 diff 범위 검사이며, 배포된 참조 구현이 없으면 모든 에이전트가 각자 자기 것을 만들어 내서, 두 번의 실행(또는 Python 저장소와 Go 저장소)이 서로 다른 두 가드를 만든다. 이것이 바로 이 스킬이 제거하려는 비결정성이다.

이것이 참조 구현이다. 패턴은 스택에 맞게 조정하되, 계약은 동일하게 유지하라.

## 계약(Contract)

- **입력:** 머지 베이스와 워킹 트리 사이의 diff(추가된 라인 *및* 제거된 라인, 그리고 추적되지 않는 파일). `git diff`만 읽는 가드는 새 파일과 스테이징되었지만 커밋되지 않은 작업을 놓친다.
- **Step 6의 다섯 가지 움직임을 탐지한다:** `CONSTRAINTS.md`에서 약해진 임계값, 쉬워진 테스트(`.skip`, 삭제된 테스트 파일, 남아 있는 테스트에서 제거된 assertion), 침묵당한 검사기(새로운 억제 주석), 미완성 작업(스텁 또는 빈 `catch`), 새로운 Exceptions 행.
- **종료 코드:** `0`은 깨끗함, `1`은 하한선 위반이 최소 하나(변경을 차단), `2`는 가드를 실행할 수 없음(머지 베이스 없음, git 저장소가 아님). `2`가 `0`으로 읽히게 하지 마라.
- **규칙과 위치를 보고하며, 매치된 시크릿 값은 절대 보고하지 않는다.** 마스킹(redaction)은 선택 사항이 아니다(Step 4).
- **조이는 것은 조용히, 느슨하게 하는 것은 시끄럽게:** 기준을 낮추는 움직임만 드러낸다.

## Reference (Node, 스택 독립에 가까운 패턴)

```js
#!/usr/bin/env node
// floor-guard.mjs — diff-scoped enforcement of the CONSTRAINTS.md floor.
// Usage: node floor-guard.mjs [--base <ref>]   (default base: origin/main)
import { execFileSync } from 'node:child_process';

const base = (() => {
  const i = process.argv.indexOf('--base');
  return i > -1 ? process.argv[i + 1] : 'origin/main';
})();

const git = (args) => {
  try { return execFileSync('git', args, { encoding: 'utf8' }); }
  catch { return null; }
};

// Merge base; bail to exit 2 rather than pretending a shallow/rootless clone is clean.
const mergeBase = git(['merge-base', base, 'HEAD'])?.trim();
if (!mergeBase) { console.error('floor-guard: no merge base against ' + base); process.exit(2); }

// Unified diff plus untracked files (git diff alone cannot see new files).
const tracked = git(['diff', '--unified=0', mergeBase, '--']) ?? '';
const untracked = (git(['ls-files', '--others', '--exclude-standard']) ?? '')
  .split('\n').filter(Boolean)
  .map((f) => git(['diff', '--no-index', '--unified=0', '/dev/null', f]) ?? '')
  .join('\n');
const diff = tracked + '\n' + untracked;

const added = [], removed = [];
let file = '';
for (const line of diff.split('\n')) {
  if (line.startsWith('+++ ')) file = line.slice(6);
  else if (line.startsWith('+') && !line.startsWith('+++')) added.push({ file, text: line.slice(1) });
  else if (line.startsWith('-') && !line.startsWith('---')) removed.push({ file, text: line.slice(1) });
}

const findings = [];
const flag = (rule, f, text) => findings.push({ rule, file: f, text: text.trim().slice(0, 120) });

// 1. Silenced checker — extend this list for your ecosystem.
const SUPPRESSIONS = /@ts-ignore|@ts-nocheck|eslint-disable|biome-ignore|# *noqa|# *type: *ignore|istanbul ignore|nosemgrep|gitleaks:allow|Stryker disable/;
// 4. Unfinished work.
const STUBS = /throw new (Error|NotImplemented).*[Nn]ot implemented|catch\s*\(\w*\)\s*\{\s*\}|catch\s*\{\s*\}|\bTODO\b|\bpass\s*# *stub/;
// 2. A test made easier (added skips).
const SKIPS = /\.(skip|todo)\b|\bxit\(|\bxdescribe\(|@pytest\.mark\.skip|t\.Skip\(/;

for (const { file, text } of added) {
  if (SUPPRESSIONS.test(text)) flag('silenced-checker', file, text);
  if (STUBS.test(text)) flag('unfinished-work', file, text);
  if (SKIPS.test(text)) flag('test-made-easier', file, text);
  if (/CONSTRAINTS\.md$/.test(file) && /^\| *(W|E)\d+ *\|/.test(text)) flag('new-exception', file, text);
}

// 2b. Assertion removed from a test file that still exists.
for (const { file, text } of removed) {
  if (/\.(test|spec)\.|_test\.|test_/.test(file) && /\b(expect|assert|should)\b/.test(text)) {
    flag('assertion-removed', file, text);
  }
}

// 1b/2c. Weakened threshold: a number in CONSTRAINTS.md that went down, or a floor bullet deleted.
const nums = (s) => (s.match(/\d+(\.\d+)?/g) || []).map(Number);
const removedConstraints = removed.filter((l) => /CONSTRAINTS\.md$/.test(l.file));
const addedConstraints = added.filter((l) => /CONSTRAINTS\.md$/.test(l.file));
for (const r of removedConstraints) {
  const a = addedConstraints.find((x) => x.text.split(/[|:]/)[0] === r.text.split(/[|:]/)[0]);
  if (a && nums(a.text).some((n, i) => nums(r.text)[i] !== undefined && n < nums(r.text)[i])) {
    flag('threshold-lowered', r.file, r.text + '  ->  ' + a.text);
  }
}

if (findings.length === 0) { console.log('floor-guard: clean'); process.exit(0); }
console.error('floor-guard: ' + findings.length + ' floor violation(s):');
for (const f of findings) console.error(`  [${f.rule}] ${f.file}: ${f.text}`);
console.error('\nEach is a move that lowers the bar. Fix the code, or route it through a tracked exception.');
process.exit(1);
```

## 조정 방법

- **패턴만이 스택에 종속되는 유일한 부분이다.** 세 개의 정규식에 사용하는 언어의 억제 주석과 스텁 형태를 추가하라. diff 처리 로직, CONSTRAINTS.md 검사, 종료 코드는 그대로 둔다.
- **`.constraintsignore`**(한 줄에 glob 하나)를 쓰면 가드가 플래그를 세웠을 경로를 제외할 수 있다. 플래그를 세우기 전에 추가된 각 라인의 파일을 이 파일과 대조하라. 그러면 진짜 예외가 규칙을 느슨하게 하는 것이 아니라 추적되는 파일이 된다.
- **이것은 출발점이지 완성된 도구가 아니다.** 의도적으로 정규식 수준에 머물러 있다. 에이전트가 실제로 취하는 green으로 가는 싼 길의 움직임은 잡아내지만, 변경을 숨기려는 작정한 사람은 잡지 못한다. 모든 diff에서 실행되는 검사로서는 이것이 맞는 절충이다. 이를 넘어서면 실제 러너(Escalation Path 3단계)로 옮겨라.
