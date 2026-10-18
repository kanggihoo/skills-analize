# Floor guard: 참조 구현

`CONSTRAINTS.md`의 번호가 매겨진 각 차원은 de facto 도구에 대응한다(Step 4). 그러나 **floor**는 그렇지 않다. floor는 Step 6의 다섯 가지 동작을 대상으로 하는 diff 범위 검사이며, 참조 구현이 제공되지 않으면 에이전트마다 자기만의 검사기를 새로 만들게 된다. 그러면 같은 저장소를 두 번 실행하거나 Python 저장소와 Go 저장소에 대해 서로 다른 가드가 만들어진다. 이 스킬이 제거하려는 바로 그 비결정성이다.

이것이 참조 구현이다. 스택에 맞게 패턴을 조정하되 계약은 동일하게 유지한다.

## 계약

- **입력:** merge base와 작업 트리 사이의 diff(추가된 줄과 삭제된 줄, 그리고 추적되지 않은 파일 포함). `git diff`만 읽는 가드는 새 파일과 스테이징되었지만 커밋되지 않은 작업을 놓친다.
- **Step 6의 다섯 가지 동작을 탐지한다:** `CONSTRAINTS.md`에서 낮아진 임계값, 쉬워진 테스트(`.skip`, 삭제된 테스트 파일, 남아 있는 테스트에서 제거된 assert), 침묵된 검사기(새로 추가된 suppression 주석), 미완성 작업(스텁 또는 빈 `catch`), 새로 추가된 Exceptions 행.
- **종료 코드:** `0` 정상, `1` 최소 하나의 floor 위반(변경 차단), `2` 가드를 실행할 수 없음(merge base 없음, git 저장소가 아님). `2`가 `0`으로 읽히는 일이 없어야 한다.
- **규칙과 위치만 보고하며, 일치한 비밀 값은 절대 보고하지 않는다.** 마스킹은 선택 사항이 아니다(Step 4).
- **강화는 조용히, 완화는 시끄럽게:** 기준을 낮추는 동작만 드러낸다.

## 참조 구현 (Node, 대체로 스택에 독립적인 패턴)

```js
#!/usr/bin/env node
// floor-guard.mjs — CONSTRAINTS.md floor를 diff 범위로 강제한다.
// 사용법: node floor-guard.mjs [--base <ref>]   (기본 base: origin/main)
import { execFileSync } from 'node:child_process';

const base = (() => {
  const i = process.argv.indexOf('--base');
  return i > -1 ? process.argv[i + 1] : 'origin/main';
})();

// `git diff --no-index`는 두 쪽이 다를 때마다(새 파일의 일반적인 경우) 1로 종료한다.
// 그래서 그 출력은 유지한다. 다른 실패는 null이 되며, null은 절대 정상으로 읽히지 않는다.
const git = (args, { diffExit = false } = {}) => {
  try { return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { return diffExit && e.status === 1 && typeof e.stdout === 'string' ? e.stdout : null; }
};
const bail = (msg) => { console.error('floor-guard: ' + msg); process.exit(2); };

// 작업 트리의 최상위에서 실행한다. `git ls-files`는 현재 디렉터리의 하위 트리만 상대 경로로 나열하므로,
// 하위 폴더에서 시작한 가드는 다른 곳의 추적되지 않은 파일을 놓치고, `git diff`는 항상 전체 트리를 다루므로 이름도 다르게 보고한다.
const top = git(['rev-parse', '--show-toplevel'])?.trim();
if (!top) bail('not inside a git work tree');
process.chdir(top);

// Merge base. 얕은 클론이나 루트가 없는 클론을 깨끗한 것처럼 가장하지 않고 exit 2로 중단한다.
const mergeBase = git(['merge-base', base, 'HEAD'])?.trim();
if (!mergeBase) bail('no merge base against ' + base);

// 통합 diff와 추적되지 않은 파일(git diff만으로는 새 파일을 볼 수 없다).
const tracked = git(['diff', '--unified=0', mergeBase, '--']);
if (tracked === null) bail('could not diff against ' + mergeBase);
const untrackedFiles = git(['ls-files', '--others', '--exclude-standard']);
if (untrackedFiles === null) bail('could not list untracked files');
const untracked = untrackedFiles.split('\n').filter(Boolean).map((f) => {
  const d = git(['diff', '--no-index', '--unified=0', '/dev/null', f], { diffExit: true });
  if (d === null) bail('could not diff untracked file ' + f);
  return d;
}).join('\n');
const diff = tracked + '\n' + untracked;

// diff를 순회한다. `---`와 `+++`는 파일의 `diff` 줄과 첫 `@@` hunk 사이에서만 파일 헤더다. hunk 안의 모든 줄은 내용이므로,
// 추가된 `++i`(`+++i`로 표시됨)나 삭제된 `-- comment`는 헤더가 아니라 변경이다. 두 헤더 모두 파일 이름을 담고 있으므로,
// 삭제(`+++ /dev/null`)도 이름을 유지한다.
const added = [], removed = [], deleted = [];
const pathOf = (s) => s.replace(/^[ab]\//, '');
let file = '', oldFile = '', inHeader = false;
for (const line of diff.split('\n')) {
  if (line.startsWith('diff ')) inHeader = true;
  else if (line.startsWith('@@')) inHeader = false;
  else if (inHeader) {
    if (line.startsWith('--- ')) oldFile = pathOf(line.slice(4));
    else if (line.startsWith('+++ ')) {
      const newFile = pathOf(line.slice(4));
      file = newFile === '/dev/null' ? oldFile : newFile;
      if (newFile === '/dev/null') deleted.push(file);
    }
  }
  else if (line.startsWith('+')) added.push({ file, text: line.slice(1) });
  else if (line.startsWith('-')) removed.push({ file, text: line.slice(1) });
}

const findings = [];
const flag = (rule, f, text) => findings.push({ rule, file: f, text: text.trim().slice(0, 120) });
const isTest = (f) => /\.(test|spec)\.|_test\.|test_/.test(f);
const isConstraints = (f) => /CONSTRAINTS\.md$/.test(f);

// 1. 침묵된 검사기 — 생태계에 맞게 이 목록을 확장한다.
const SUPPRESSIONS = /@ts-ignore|@ts-nocheck|eslint-disable|biome-ignore|# *noqa|# *type: *ignore|istanbul ignore|nosemgrep|gitleaks:allow|Stryker disable/;
// 4. 미완성 작업.
const STUBS = /throw new (Error|NotImplemented).*[Nn]ot implemented|catch\s*\(\w*\)\s*\{\s*\}|catch\s*\{\s*\}|\bTODO\b|\bpass\s*# *stub/;
// 2. 쉬워진 테스트(추가된 skip).
const SKIPS = /\.(skip|todo)\b|\bxit\(|\bxdescribe\(|@pytest\.mark\.skip|t\.Skip\(/;

for (const { file, text } of added) {
  if (SUPPRESSIONS.test(text)) flag('silenced-checker', file, text);
  if (STUBS.test(text)) flag('unfinished-work', file, text);
  if (SKIPS.test(text)) flag('test-made-easier', file, text);
  if (isConstraints(file) && /^\| *(W|E)\d+ *\|/.test(text)) flag('new-exception', file, text);
}

// 2b. 삭제된 테스트 파일, 또는 여전히 존재하는 테스트 파일에서 제거된 assert.
for (const f of deleted) if (isTest(f)) flag('test-deleted', f, 'file deleted');
for (const { file, text } of removed) {
  if (isTest(file) && !deleted.includes(file) && /\b(expect|assert|should)\b/.test(text)) {
    flag('assertion-removed', file, text);
  }
}

// 1b/2c. CONSTRAINTS.md의 규칙이 약해지거나 제거됨. 규칙은 floor 항목 또는 표의 행이며, 항목의 첫 콜론 앞 텍스트 또는 행의 첫 셀로 식별한다.
// 각 숫자의 방향은 주변 단어로부터 읽는다. 최소값(>=, at least, must not fall)은 낮아지면 완화되고,
// 최대값(<=, at most, under, must not grow)은 높아지면 완화된다. 방향을 읽을 수 없는 숫자는 바뀔 때마다 보고한다.
// 가드는 강화와 완화를 구별할 수 없으므로, 조용히 있는 것이 잘못된 기본값이기 때문이다.
// 숫자는 방향 안에서 짝지어진다(첫 번째 최소값과 첫 번째 최소값, 이하 동일). 그래서 텍스트의 다른 곳에 추가된 숫자가 짝짓기를 밀어내지 않는다.
// 수정 후 짝이 없는 임계값은 제거된 것이며, 추가된 임계값은 강화된 것이다.
const ruleKey = (t) => {
  const s = t.trim();
  if (s.startsWith('|')) return s.split('|').map((c) => c.trim()).filter(Boolean)[0] ?? '';
  if (/^[-*] /.test(s)) return s.slice(2).split(':')[0].trim();
  return null; // 산문, 제목, 날짜: 규칙이 아님
};
const isException = (t) => /^\| *(W|E)\d+ *\|/.test(t.trim());
const MIN_BEFORE = /(>=|>|≥|at least|minimum|\bmin\b|no less than|not fall|not drop)\s*$/;
const MAX_BEFORE = /(<=|<|≤|at most|maximum|\bmax\b|no more than|under|below|not grow|not exceed)\s*$/;
const MIN_AFTER = /^\s*\S*\s*(or more|or higher|must not fall|must not drop)/;
const MAX_AFTER = /^\s*\S*\s*(or less|or lower|must not grow|must not exceed)/;
const thresholds = (t) => {
  const out = [], re = /\d+(?:\.\d+)?/g;
  let m;
  while ((m = re.exec(t))) {
    const before = t.slice(Math.max(0, m.index - 24), m.index).toLowerCase();
    const after = t.slice(m.index + m[0].length, m.index + m[0].length + 40).toLowerCase();
    const dir = MIN_BEFORE.test(before) || MIN_AFTER.test(after) ? 'min'
      : MAX_BEFORE.test(before) || MAX_AFTER.test(after) ? 'max' : null;
    out.push({ n: Number(m[0]), dir });
  }
  return out;
};
const removedRules = removed.filter((l) => isConstraints(l.file) && ruleKey(l.text) !== null);
const addedRules = added.filter((l) => isConstraints(l.file) && ruleKey(l.text) !== null);
for (const r of removedRules) {
  const a = addedRules.find((x) => ruleKey(x.text) === ruleKey(r.text));
  if (!a) {
    if (!isException(r.text)) flag('rule-removed', r.file, r.text); // 예외를 제거하는 것은 강화이므로 조용히 넘어감
    continue;
  }
  const before = thresholds(r.text), after = thresholds(a.text);
  let verdict = null;
  for (const dir of ['min', 'max', null]) {
    const was = before.filter((x) => x.dir === dir), now = after.filter((x) => x.dir === dir);
    was.forEach((b, i) => {
      const n = now[i];
      if (verdict) return;
      if (!n) verdict = 'threshold-removed';
      else if (n.n === b.n) return;
      else if (dir === 'min' ? n.n < b.n : dir === 'max' ? n.n > b.n : true) {
        verdict = dir ? 'threshold-loosened' : 'threshold-changed';
      }
    });
  }
  if (verdict) flag(verdict, r.file, r.text + '  ->  ' + a.text);
}

if (findings.length === 0) { console.log('floor-guard: clean'); process.exit(0); }
console.error('floor-guard: ' + findings.length + ' floor violation(s):');
for (const f of findings) console.error(`  [${f.rule}] ${f.file}: ${f.text}`);
if (findings.some((f) => f.rule === 'rule-removed')) {
  console.error('\nA rule-removed finding can also mean the rule\'s label changed: rename a rule in one commit and change its thresholds in another.');
}
if (findings.some((f) => f.rule === 'threshold-removed')) {
  console.error('\nA threshold-removed finding can also mean a number gained or lost its direction words (">= 80%" becoming "80%", or the reverse): compare the two lines before assuming a threshold was deleted.');
}
console.error('\nEach is a move that lowers the bar. Fix the code, or route it through a tracked exception.');
process.exit(1);
```

## 적용 방법

- **패턴만이 스택별로 다른 부분이다.** 언어별 suppression과 스텁 형태를 세 개의 정규식에 추가하면 된다. diff 처리, CONSTRAINTS.md 검사, 종료 코드는 그대로 둔다.
- **`.constraintsignore`**(한 줄에 glob 하나)를 사용하면 가드가 플래그하는 경로를 면제할 수 있다. 플래그하기 전에 추가된 각 줄의 파일이 이 목록에 있는지 확인하면, 정당한 예외는 완화된 규칙이 아니라 추적되는 파일이 된다.
- **이것은 완성된 도구가 아니라 출발점이다.** 의도적으로 정규식 수준으로 얕게 만들었다. 에이전트가 실제로 취하는 값싼 녹색 불 통과 동작은 잡지만, 변경을 숨기려는 결심이 굳은 사람은 잡지 못한다. 모든 diff에서 실행되는 검사로서는 올바른 절충이다. 이 도구가 부족해지면 실제 러너로 옮긴다(Escalation Path 3단계).
