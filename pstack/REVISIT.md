# pstack 나중에 다시 볼 목록

pstack 스킬을 하나씩 읽으면서, 나중에 다시 읽고 실제 작업에 적용해 볼 것을 골라 정리한 노트다. 스킬 원문이 아니라 학습 기록이다. 기록 시작은 2026-11-05이고 마지막 갱신은 2026-11-10이다.

표기 규칙은 두 가지다. "원문"은 해당 `SKILL.md`나 플레이북에 적힌 내용이다. "해석"은 읽으면서 내가 덧붙인 판단이고, 원문이 말하지 않는다. 원문에 없는 것은 "원문에 명시 없음"으로 적는다.

## 목록 (21개)

| 묶음 | 항목 |
|---|---|
| 허브와 기록 | `poteto-mode`, `show-me-your-work` |
| 먼저 이해하기 | `why`, `recall`, `blast-radius` |
| 설계와 리뷰 | `arena`, `swarm`, `interrogate` |
| 검증 도구 | `create-verification-skill`, `maintain-verification-skill`, `benchmark-checklist` |
| 개선 | `correct`, `reflect`, `automate-me` |
| 원칙과 언어 규칙 | `principle-prove-it-works`, `principle-subtract-before-you-add`, `principle-laziness-protocol`, `principle-encode-lessons-in-structure`, `principle-build-the-lever`, `principle-type-system-discipline`, `typescript-best-practices` |

## 허브와 기록

### poteto-mode
pstack의 허브다. 사용자가 `/poteto-mode`를 켜면 이 파일이 먼저 컨텍스트에 올라온다. 안에 들어 있는 것은 다음과 같다.

- **Non-negotiables**: 상황별 트리거와 그때 쓸 스킬 목록. 예를 들어 코드를 쓰면 데이터 모양을 먼저 명명하고, 함수 경계를 넘으면 `architect`를 쓰고, 병렬이면 `swarm`이나 `arena`를 쓴다.
- **Principles**: 원칙 24개의 이름과 "언제 적용하는가" 한 줄. 본문은 각 `principle-*/SKILL.md`에 있다.
- **Autonomy**: 되돌릴 수 있는 작업은 묻지 않고 하고(Just do it), 되돌릴 수 없는 작업(force-push, 배포, 데이터 삭제, 고객 메시지)은 멈춘다(Always pause).
- **Subagents, Writing the reply, Comments**: 서브에이전트 기본값과 답변 문체 규칙.
- **Playbooks**: 작업 종류별 절차서 23개(직접 세어 확인).

적용해 볼 방법은 실제 작업 하나에 `/poteto-mode`를 켜고, 에이전트가 만드는 todolist가 플레이북 단계를 그대로 복사하는지 보는 것이다.

### show-me-your-work
자율 주행한 작업의 결정 기록을 TSV로 남기고, 그 기록을 대화 기록과 대조해 감사하며, 별도 모델이 리뷰하는 Attention 절이 있다. 사람이 자리를 비운 긴 작업에서 "무엇을 왜 결정했나"를 나중에 확인하려는 용도다.

## 먼저 이해하기

### why
"왜 이 코드가 이렇게 짜였나"를 한 곳이 아니라 여러 출처에서 찾는다. git과 `gh`, 그리고 MCP로 연결된 외부 서비스 6개 범주를 쓴다. 조사자 여러 명이 찾고 합성자가 합친다.

### recall
최근 작업 맥락을 대화 기록과 공유 기록에서 복원한다. 대화 기록은 `.jsonl` 파일이고, 파싱 스크립트 없이 에이전트가 직접 읽는다(원문에 파서 없음).

### blast-radius
작은 변경이 diff 밖에서 무엇을 깨뜨리는지 찾고, 안전하다는 사실 하나를 실제 코드를 돌려서 증명한다. `grep`은 호출 위치는 보여 주지만 동적 호출이나 문자열 참조로 인한 깨짐은 보여 주지 못한다. 증명 스크립트를 테스트로 남길지 일회성으로 둘지는 원문에 명시 없음.

## 설계와 리뷰

### arena
후보 N개를 병렬로 만들고, 교차 심사해서 기본안(base)을 고르고, 나머지의 장점을 접붙이고(graft), 검증한다. 에이전트끼리는 직접 대화하지 않고 부모 에이전트와 파일 경로로만 소통한다.

### swarm
병렬로 fan out해서 N개 작업자를 돌리고 결과를 하나의 보고서로 합친다. 커버리지 매트릭스, 경쟁(race), 가운틀릿, 탐색 분할에 쓴다.

### interrogate
여러 모델이 서로 다른 각도에서 적대적으로 리뷰한다. 리뷰어는 심각도(`critical`, `warning`, `nit`)를 주고, 부모가 lead judgment 규칙으로 `Act on` / `Consider` / `Noted` / `Dismissed`를 정한다. lead judgment에는 "리뷰어가 가정한 입력이 실제 코드 구조에서 들어올 수 있는가"를 따지는 기준과, 문제가 없어도 뭔가를 보고하려고 부풀리는 경향("nitpick 중력")을 걸러 내는 기준이 있다.

## 검증 도구

### create-verification-skill
저장소를 읽어서 프로젝트용 검증 스킬 `.cursor/skills/verify-<app>/`를 만든다. 스킬은 앱당 하나이고, 안에 `SKILL.md`(Launch, Doctor, Drive, Evidence, Cleanup, Helpers)와 `features/` 폴더(기능마다 `.md` 한 개)가 생긴다. 만든 뒤 기능 하나를 실제로 돌려 보고 증거가 정리 후에도 남는지 확인해야 납품물이다. `references/feature-map-example/`의 `create-note.md`와 `search.md`는 가상의 Notes 앱을 쓴 견본이고, 실제 결과물에 복사되지 않는다. 기능 파일의 형식은 H2 네 개(`Sub-features`, `How to get to it (user POV)`, `Driving it with <harness>`, `Gotchas`)로 고정이다.

### maintain-verification-skill
앱이 바뀌어 낡은 검증 스킬과 기능 지도를 점검해 고친다. 기능 파일마다 읽기 전용 서브에이전트가 소스를 읽고, 라이브 조작은 부모 한 명이 전부 하며, 고치는 범위는 검증 스킬 폴더뿐이고(제품 코드는 안 건드림), 결과는 PR 하나이거나 PR 없음이다. 결과는 `clean` / `changed` / `blocked` 중 하나로 선언한다.

### benchmark-checklist
성능 숫자를 보고하기 전에 점검하는 일곱 질문이다. 1) 왜 두 배가 아닌가(제한 요인), 2) 튜닝됐나, 3) 한계를 넘었나(산수), 4) 에러가 났나, 5) 재현되나(5회 이상, 번갈아), 6) 전체에서 의미가 있나, 7) 작업이 실제로 일어났나. `principle-explain-the-number`가 이유라면 이 스킬은 절차다. `hillclimb` 플레이북이 하네스를 동결하기 전에 이 스킬로 점검하라고 한다. 도구 이름이 Linux 중심(`uptime`, `nproc`, `pidstat`, `strace -c`)이라 Windows 대응은 원문에 없다.

## 개선

### correct
에이전트가 한 저장소에서 반복하는 실수를 찾아서 가장 높은 수준에서 막는다. 수준 순서는 구조 > 타입과 린트(오류 메시지가 고치는 법을 알려 줌) > 테스트 > 문서(마지막)다. 규칙 표를 유지한다.

### reflect
한 세션의 대화 기록을 세 리뷰어(judgment, tooling, divergent)가 병렬로 보고, 종합자가 Accepted / Rejected / Backlog로 분류해서 기존 스킬의 수정점으로 연결한다. 린트나 스크립트가 더 확실한 항목은 Backlog로 옮기는 구조 점검 단계가 있고, 적용은 사용자 승인 뒤에만 한다.

### automate-me
여러 대화 기록에서 사용자의 습관을 뽑고, 사용자에게 직접 물어, `poteto-mode` 같은 개인용 `-mode` 스킬을 만든다. 0단계 기존 스킬 확인, 1단계 기록 조사, 2단계 질문, 3단계 묶기, 4단계 초안, 5단계 `unslop`으로 다듬기, 6단계 워크트리와 PR(main에 직접 push 금지)이다. 둘 이상의 구간에서 반복된 신호만 확신 높음으로 친다. `reflect`와 비교하면 `reflect`는 한 세션에서 스킬 수정점을, `automate-me`는 여러 세션에서 사용자 취향을 뽑는다(해석).

## 원칙과 언어 규칙

| 항목 | 한 줄 요약 | 플레이북 연결 |
|---|---|---|
| `principle-prove-it-works` | 완료 선언 전에 실제 산출물을 직접 확인하고, 가능하면 스크립트로 확인 | 6곳 |
| `principle-subtract-before-you-add` | 짓기 전에 죽은 코드, 중복 검증, 고아 참조를 먼저 지움 | `refactoring` |
| `principle-laziness-protocol` | 삭제 우선, diff 최소, 새 신호를 여러 층에 통과시키라는 요청은 의심 | `hillclimb`, `refactoring` |
| `principle-encode-lessons-in-structure` | 같은 지시를 두 번째 쓰게 되면 린트, 스크립트, 타입으로 굳힘 | 4곳 |
| `principle-build-the-lever` | 사소하지 않은 작업은 codemod, generator, sqlite 쿼리, 다시 돌릴 수 있는 검사를 만들어서 함 | `hillclimb`, `worktree-cleanup` |
| `principle-type-system-discipline` | 불가능한 상태를 표현 불가능하게, 캐스트 금지, 변형 전수 매칭 | 없음 |
| `typescript-best-practices` | 위 원칙의 TypeScript 규칙 16개와 예시(`references/patterns.md`) | 없음 |

`build-the-lever`에는 검사 가능한 문장이 있다. 이 원칙을 인용했는데 diff에 스크립트나 codemod가 없으면 적용하지 않은 것이다. `type-system-discipline`은 정적 타입 언어에만 해당한다. Python에 대응시키면 `pyright`(타입 검사), `ruff`(린트), `pydantic`(경계 파싱)이 되는데, 이 대응은 해석이고 원문에 Python은 없다.

## 구조 메모

### 원칙은 세 번에 나뉘어 읽힌다
1. 허브(`poteto-mode/SKILL.md`)에 원칙 이름과 "언제 적용하는가" 한 줄이 올라온다.
2. 작업에 맞는 플레이북 파일을 열면, 단계 문장이 원칙 이름을 직접 가리킨다. 예를 들어 `refactoring.md` 6단계가 `principle-prove-it-works`를 부른다.
3. 에이전트가 원칙을 적용할 때 그 원칙의 leaf `SKILL.md` 전체를 읽는다. 허브는 "적용하는 원칙의 leaf를 끝까지 읽어라"고 하고, 읽은 원칙만 답변에서 인용하게 한다.

### 24개 중 플레이북이 이름으로 부르는 것은 15개
나머지 9개는 허브 목록 한 줄 말고는 플레이북이 부르지 않는다. `attack-the-premise`, `boundary-discipline`, `experience-first`, `explain-the-number`, `fix-root-causes`, `make-operations-idempotent`, `outcome-oriented-execution`, `test-behavior-not-implementation`, `type-system-discipline`이다. 이 9개는 에이전트가 목록의 "언제 적용하는가"를 보고 스스로 찾아 읽어야 한다. 이름 검색으로 센 값이라, 이름 없이 같은 취지를 말로 풀어 쓴 곳은 세지 않았다.

### 원칙 우선순위 (내 판단)
측정이 아닌 판단이다. 기준은 AI의 흔한 실수를 겨냥하는가, 지켰는지 확인할 수 있는가, 다른 사람이 가져가도 부작용이 적은가였다.

1. `prove-it-works`
2. `test-behavior-not-implementation`
3. `fix-root-causes`
4. `sequence-verifiable-units`
5. `laziness-protocol`과 `subtract-before-you-add`
6. `encode-lessons-in-structure`
7. `build-the-lever`
8. `boundary-discipline`
9. `type-system-discipline`

조건부로는 `explain-the-number`(성능 측정할 때), `separate-before-serializing-shared-state`(에이전트를 병렬로 돌릴 때), `guard-the-context-window`, `never-block-on-the-human`(자율을 얼마나 줄지에 따라), `model-the-domain`(`if/else`가 계속 늘어날 때)이다. 위 21개 목록은 이 순위와 다르다. `test-behavior-not-implementation`과 `fix-root-causes`는 21개에 넣지 않았다.

## 열린 질문

원문에서 풀리지 않은 것들이다.

- **`arena` 6단계(검증)**: 부모가 자신이 접붙인 합성물을 직접 검증한다. `arena` 안에 독립 검증은 없고, `show-me-your-work`나 `figure-it-out`이 바깥 리뷰를 더한다.
- **`blast-radius`**: 증명 스크립트가 영구 테스트로 남는지 일회성인지 원문에 명시 없음.
- **`figure-it-out`**: 설계한 맞춤 플레이북은 그 작업의 todolist와 답변에만 남고 `poteto-mode`의 플레이북 목록에 추가되지 않는다.
- **user-invoked 스킬 호출**: pstack 스킬 대부분이 `disable-model-invocation: true`다. 다른 스킬이 그런 스킬을 부를 수 있는지는 확인하지 못했다. 이슈 `kanggihoo/my-skills#9`에서 추적한다. 같은 종류로 `setup-pstack` 7단계가 `/create-verification-skill`을 호출하고, 원칙 파일은 허브가 "읽어라"고 해서 도구 호출인지 파일 읽기인지 불분명하다.
- **`maintain-verification-skill`의 실행 시점**: pstack 어디에도 주기나 트리거가 없다. 사용자가 직접 호출해야만 돈다. 낡음 감지가 수동이라 `principle-encode-lessons-in-structure`와 어긋난다(해석). PR을 누가 머지하는지, "최근 변경"의 기간, 서브에이전트 모델 역할 줄도 명시 없음.
- **`setup-pstack`**: 형식이 Cursor 전용이다(`~/.cursor/rules/pstack-models.mdc`, `alwaysApply`, Cursor 모델 이름, `Task`와 `AskQuestion` 도구). 역할별 모델 표라는 아이디어는 이식 가능하다.
- **대화 기록 경로**: `reflect`, `recall`, `show-me-your-work`, `automate-me`가 Cursor의 `~/.cursor/projects/<slug>/agent-transcripts/`를 가정한다. 이 컴퓨터에는 그 폴더가 없다. Claude Code는 `~/.claude/projects/<slug>/<session-id>.jsonl`에 둔다. 이슈 #9에는 아직 추가하지 않았다.
- **`automate-me`**: 사용자 핸들을 알아내는 방법과, `poteto-mode` frontmatter의 `mode: true`가 하는 일은 원문에 설명이 없다.
- **`correct`**: 실수 종류를 찾는 방법이 출처 목록(커밋, revert, 리뷰 코멘트, 지침 파일, 우회 주석)뿐이고 구체적인 방법은 없다.
- **`hillclimb` 하네스**: 동결하는 측정 장치를 만드는 도구(예: `k6`, Playwright)는 원문이 지정하지 않는다. 민감도를 증명하는 기준도 없다.
- **원칙 간 충돌**: `laziness-protocol`의 최소 변경과 `redesign-from-first-principles`의 전면 재설계가 부딪힐 때 어느 쪽을 따르는지에 대한 일반 규칙이 없다.
- **`typescript-best-practices`**: frontmatter의 `paths: ["**/*.ts", "**/*.tsx"]`가 하는 일, 그리고 `disable-model-invocation: true`와 "`.ts`를 읽거나 고칠 때 쓴다"는 description이 함께 있을 때 실제 로딩 방식은 확인하지 못했다.

## 아직 안 본 것
- 독립 스킬: `poteto-help`. (`bro`와 `make-bot-ui`는 보지 않기로 했다. `unslop`은 이미 알고 있어 건너뛰었다.)
- 원칙 중 뒤로 미룬 `migrate-callers-then-delete-legacy-apis`, `outcome-oriented-execution`. 둘 다 외부 사용자가 없을 때만 안전하다는 조건이 원문에 있다.
- 그 밖에 이 목록에 넣지 않은 스킬과 플레이북은 `skill-explainers/pstack/relations.md`의 표를 본다.
