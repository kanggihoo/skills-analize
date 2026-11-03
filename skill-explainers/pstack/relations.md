# pstack 관계 원장
분석 커밋: 5760176b35b502da0f3c9da759c48b4f2fb553c9

- 범위: `pstack/` 아래 `SKILL.md` 50개. 번역본(`*.KO.md`)은 열지 않았다.
- 분석 대상에서 뺀 것: `pstack/.archify/explainer-pstack-skill-map-20261030-215518/`. 예전에 만든 pstack 스킬 지도 explainer 결과물이며 스킬이 아니다.
- 출처 줄 표기: `<스킬>/SKILL.md:<줄>`은 줄여서 `<스킬>:<줄>`로 적는다. 플레이북 등 다른 파일은 스킬 폴더 기준 경로로 적는다.
- 모든 스킬에 `disable-model-invocation: true`가 있다. 단, `setup-pstack`에는 없다(`setup-pstack:1-4`). 그래서 `poteto-help`는 "사용자 말만으로 켜지는 스킬은 `/setup-pstack`뿐"이라고 쓴다(`poteto-help:36`).

## 스킬

| 경로 ID | 한 줄 요약 | 조사 상태 | 원문 비교 | 소속 묶음 | 역할 |
|---|---|---|---|---|---|
| pstack/poteto-mode | 요청을 플레이북에 맞추고 필요한 스킬과 원칙을 불러 일을 끝까지 돌리는 작업 모드 | 완료 | - | run | 단계(허브: 플레이북 고르기, 다른 스킬 호출) |
| pstack/poteto-help | pstack 설정, 스킬·플레이북 고르기를 안내하고 보낼 프롬프트를 건넨다 | 완료 | - | run | 안내 |
| pstack/setup-pstack | 역할별로 쓸 모델과 추론 예산을 정해 규칙 파일에 적는다 | 완료 | - | run, verify-harness | 단계(준비) |
| pstack/figure-it-out | 맞는 플레이북이 없는 큰 작업에 맞춤 플레이북을 설계해 돌린다 | 완료 | - | run | 선택지(맞는 플레이북이 없을 때) |
| pstack/show-me-your-work | 긴 작업의 결정을 한 줄씩 TSV로 기록하고 끝에 감사한다 | 완료 | 원문 동일: reporting-skills/pstack/show-me-your-work (스크립트·템플릿 포함) | run | 단계(결정 기록) |
| pstack/how | 서브에이전트로 코드를 조사해 "어떻게 동작하나"를 설명한다 | 완료 | - | understand | 단계 |
| pstack/why | git·티켓·문서·채팅 등 근거 갈래를 병렬로 뒤져 "왜 이렇게 생겼나"를 확신도와 함께 답한다 | 완료 | - | understand | 단계 |
| pstack/teach | how와 why 결과를 엮어 사람이 이해하도록 쉽게 설명한다 | 완료 | 동명·내용 다름: learning/teach | understand | 단계(how·why 위에 얹힘) |
| pstack/recall | 최근 대화 기록과 공유 기록으로 내 작업 맥락을 복원해 요약한다 | 완료 | - | understand | 선택지 |
| pstack/blast-radius | 작은 변경이 diff 밖에서 무엇을 깨뜨릴지 찾고 안전 근거를 실행으로 증명한다 | 완료 | 원문 동일: verification-skills/pstack/blast-radius | understand | 선택지 |
| pstack/architect | 코드 전에 타입·시그니처·모듈 구조를 병렬로 설계하고 구현까지 따라간다 | 완료 | - | design-review | 단계 |
| pstack/arena | 같은 과제를 여러 후보에게 맡겨 기반을 고르고 좋은 부분을 접붙인다 | 완료 | - | design-review | 단계 |
| pstack/swarm | 작업을 조각이나 경주로 나눠 병렬로 돌리고 보고서 하나로 모은다 | 완료 | - | design-review | 선택지 |
| pstack/interrogate | 여러 모델 리뷰어가 변경을 서로 다른 각도에서 공격적으로 리뷰한다 | 완료 | 원문 동일: verification-skills/pstack/interrogate (참조 4개 포함) | design-review | 단계 |
| pstack/no-comments | 리뷰 전에 별도 리뷰어로 불필요한 주석을 지우고 지적을 고친다 | 완료 | - | design-review | 단계 |
| pstack/create-verification-skill | 앱을 사용자처럼 조작해 동작을 증명하는 프로젝트용 검증 스킬을 만든다 | 완료 | 원문 동일: verification-skills/pstack/create-verification-skill (참조 3개 포함) | verify-harness | 단계 |
| pstack/maintain-verification-skill | 검증 스킬과 기능 지도가 실제 앱과 맞는지 주기적으로 점검해 고친다 | 완료 | 원문 동일: verification-skills/pstack/maintain-verification-skill | verify-harness | 단계 |
| pstack/benchmark-checklist | 잰 성능 수치를 보고하기 전에 병목·오류·반복성을 점검한다 | 완료 | 원문 동일: reporting-skills/pstack/benchmark-checklist | - | 단계 |
| pstack/unslop | 글에서 AI 티 나는 표현을 걷어낸다 | 완료 | 원문 동일: reporting-skills/pstack/unslop | - | 단계(여러 스킬이 글쓰기에 적용) |
| pstack/technical-writing | 문서·RFC·PR 설명·커밋 메시지를 4단계 기준으로 쓴다 | 완료 | 원문 동일: reporting-skills/pstack/technical-writing | - | 단계 |
| pstack/bro | 직전 답변을 전문 용어 없이 쉬운 말로 다시 말한다 | 완료 | - | - | 단계 |
| pstack/correct | 에이전트가 반복하는 실수를 찾아 구조·타입·린트·테스트로 막는다 | 완료 | 원문 동일: verification-skills/pstack/correct | - | 단계 |
| pstack/reflect | 대화 기록을 세 리뷰어가 살펴 배운 점을 기존 스킬 수정으로 옮긴다 | 완료 | - | - | 단계 |
| pstack/automate-me | 사용자의 작업 습관을 기록에서 뽑아 개인 모드 스킬로 만든다 | 완료 | - | - | 단계 |
| pstack/make-bot-ui | Grok Bot을 웹훅으로 깨우는 버튼 페이지를 만들고 키를 안전하게 둔다 | 완료 | - | - | 단계 |
| pstack/typescript-best-practices | .ts·.tsx 작업에 TypeScript 규칙을 적용한다 | 완료 | - | - | 단계 |
| pstack/principle-attack-the-premise | 같은 전제의 수정이 두 번 이상 실패하면 전제 자체를 의심한다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-boundary-discipline | 검증·오류 처리는 시스템 경계에 모으고 안쪽은 믿는다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-build-the-lever | 손으로 하지 말고 일을 하거나 증명하는 도구를 만든다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-encode-lessons-in-structure | 같은 지시를 두 번 쓰게 되면 린트·검사·스크립트로 굳힌다 | 완료 | 원문 동일: verification-skills/pstack/principle-encode-lessons-in-structure | principles | 선택지(조건부 원칙) |
| pstack/principle-exhaust-the-design-space | 선례 없는 결정이면 시제품 2~3개를 비교한 뒤 고른다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-experience-first | 구현 편의보다 사용자 경험을 고른다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-explain-the-number | 잰 수치를 믿기 전에 무엇이 그 값을 제한하는지 밝힌다 | 완료 | 원문 동일: reporting-skills/pstack/principle-explain-the-number | principles | 선택지(조건부 원칙) |
| pstack/principle-fix-root-causes | 증상을 덮지 말고 재현한 뒤 근본 원인을 고친다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-foundational-thinking | 로직보다 먼저 핵심 타입과 자료 구조를 정한다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-guard-the-context-window | 큰 출력은 서브에이전트에 넘기고 본 대화에는 요약만 둔다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-laziness-protocol | 추상화를 더하기보다 지우고 가장 작은 변경을 고른다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-make-operations-idempotent | 여러 번 돌거나 중간에 죽어도 같은 상태로 수렴하게 만든다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-migrate-callers-then-delete-legacy-apis | 새 API를 들이면 호출자를 옮기고 옛 API를 같은 차례에 지운다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-minimize-reader-load | 읽는 사람이 따라갈 계층과 숨은 상태를 줄인다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-model-the-domain | 흩어진 조건문 대신 도메인을 구조(상태 기계, 타입 등)로 표현한다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-never-block-on-the-human | 되돌릴 수 있는 일은 묻지 말고 해 보고 결과를 보여 준다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-outcome-oriented-execution | 계획된 이전에서는 중간 호환 상태 대신 목표 구조로 바로 간다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-prove-it-works | 완료 선언 전에 실제 산출물로 동작을 확인한다 | 완료 | 원문 동일: reporting-skills/pstack/principle-prove-it-works, verification-skills/pstack/principle-prove-it-works | principles | 선택지(조건부 원칙) |
| pstack/principle-redesign-from-first-principles | 새 요구를 덧붙이지 말고 처음부터 있던 것처럼 다시 설계한다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-separate-before-serializing-shared-state | 동시 실행자가 같은 것을 쓰면 먼저 공유를 없앤다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-sequence-verifiable-units | 일을 검사로 끝나는 작은 단위로 나눠 순서대로 확인한다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-subtract-before-you-add | 더하기 전에 죽은 코드와 군더더기를 먼저 지운다 | 완료 | - | principles | 선택지(조건부 원칙) |
| pstack/principle-test-behavior-not-implementation | 테스트는 사용자처럼 호출하고 실제 값으로 결과를 확인한다 | 완료 | 원문 동일: verification-skills/pstack/principle-test-behavior-not-implementation | principles | 선택지(조건부 원칙) |
| pstack/principle-type-system-discipline | 잘못된 상태를 타입으로 표현할 수 없게 만든다 | 완료 | - | principles | 선택지(조건부 원칙) |

원문 비교는 `SKILL.md`의 `shasum`으로 했다. 괄호 안에 "포함"이라고 적은 스킬은 참조 파일까지 같음을 확인했다. 나머지는 참조 자료까지 같은지 확인하지 않았다.

`make-bot-ui`의 `name` 필드는 `Make Bot UI`로 폴더 이름과 다르다(make-bot-ui:2). `poteto-help`는 `/make-bot-ui`로 적는다(poteto-help:85). `poteto-mode`도 `name: Poteto Mode`다(poteto-mode:2).

## 관계

### poteto-mode가 일으키는 관계

`poteto-mode`의 Non-negotiables 목록은 "조건 → 스킬" 형태다(`poteto-mode:17-36`). 이 목록의 화살표는 의무형 지시다. 각 스킬은 실행된 뒤 `poteto-mode`의 플레이북 단계로 돌아온다.

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r01 | poteto-mode | how | 내부 위임 | 명시-이름 | 사소하지 않은 변경, 아키텍처 결정, "확실해?"일 때(의무형) | 조사 질문 → 설명 | - | 범위 내 | poteto-mode:19; how:3 |
| r02 | poteto-mode | architect | 내부 위임 | 명시-이름 | 함수 경계를 넘는 코드일 때. 구현 전에 병렬 설계 탐색 | 설계 과제 → 확정 설계 | - | 범위 내 | poteto-mode:22; architect:3 |
| r03 | poteto-mode | swarm | 내부 위임 | 명시-이름 | 병렬 분산(커버리지, 경주, 관문, 탐색 분할) | 작업 조각 → 보고서 1개 | - | 범위 내 | poteto-mode:23; swarm:3 |
| r04 | poteto-mode | arena | 내부 위임 | 명시-이름 | 설계나 코드의 경합(기반 선택·접붙이기)일 때 | 같은 과제 → 합쳐진 결과 | - | 범위 내 | poteto-mode:23; arena:3 |
| r05 | poteto-mode | interrogate | 내부 위임 | 명시-이름 | 설계에 이견이 있을 때 출시 전 | 변경 → 리뷰 결과 | - | 범위 내 | poteto-mode:24; interrogate:3 |
| r06 | poteto-mode | unslop | 내부 위임 | 명시-이름 | 모든 산문. 답변도 산문으로 본다 | 글 → 다듬은 글 | - | 범위 내 | poteto-mode:26,107; unslop:3,18 |
| r07 | poteto-mode | technical-writing | 내부 위임 | 명시-이름 | 문서, RFC, README, PR 설명, 커밋 메시지 | 글 → 기준에 맞춘 글 | - | 범위 내 | poteto-mode:27; technical-writing:3 |
| r08 | poteto-mode | no-comments | 내부 위임 | 명시-이름 | 리뷰 전 | diff → 주석 정리된 diff | - | 범위 내 | poteto-mode:29; no-comments:3 |
| r09 | poteto-mode | benchmark-checklist | 내부 위임 | 명시-이름 | 직접 잰 성능 수치를 보고하거나 그에 따라 행동하기 전 | 측정값 → 검증된 측정값 | - | 범위 내 | poteto-mode:31; benchmark-checklist:3 |
| r10 | poteto-mode | show-me-your-work | 내부 위임 | 명시-이름 | 길거나 자율적이거나 여러 단계인 작업, 사용자가 자리를 비우는 작업. 위험이 크면 커밋, 아니면 로컬 | 결정 → TSV 기록 | - | 범위 내 | poteto-mode:36; show-me-your-work:3 |
| r11 | poteto-mode | figure-it-out | 넘김 | 명시-이름 | 크고 여러 곳에 걸친 작업이나 자리 비운 뒤 검토할 작업이면, 좁은 플레이북이 맞아도 넘긴다. 맞는 플레이북이 없을 때도 넘긴다. 여러 날짜 프로그램은 Orchestrate 플레이북으로 간다 | 과제 → 맞춤 플레이북 | - | 범위 내 | poteto-mode:123; figure-it-out:3 |
| r12 | poteto-mode | principle-* (24개) | 참고 | 명시-이름 | 원칙을 적용하면 그 원칙의 `SKILL.md`를 끝까지 읽어야 한다. 답변에는 결정에 영향을 준 원칙과 바뀐 선택을 밝힌다. 이번 세션에 읽은 원칙만 인용한다(의무형). 원칙별 조건은 아래 표 | 원칙 이름 → 답변 속 인용 | - | 범위 내 | poteto-mode:15,40,42-79 |
| r13 | poteto-mode | principle-model-the-domain | 참고 | 명시-이름 | 코드를 쓸 때는 먼저 데이터 모양을 정하고 구조를 이 원칙에 따라 고른다(의무형) | - | - | 범위 내 | poteto-mode:21; principle-model-the-domain:3 |
| r14 | setup-pstack | poteto-mode | 공유 상태 | 명시-이름 | `poteto-mode`의 서브에이전트 모델 기본값을 `/setup-pstack` 규칙의 역할 줄이 덮어쓴다 | 역할별 모델 | `~/.cursor/rules/pstack-models.mdc` | 범위 내 | poteto-mode:95; setup-pstack:39 |
| r15 | poteto-mode | reflect | 미확인 | 미확인 | `reflect`가 "라우팅되는 워크플로 스킬" 목록에 이름만 있다. 호출 조건이 없다 | - | - | 범위 내 | poteto-mode:93 |
| r16 | poteto-mode | deslop, create-skill, control-cli, control-ui | 내부 위임 | 명시-이름 | 커밋 전(`deslop`), 에이전트용 글(`create-skill`), UI·CLI 출시(`control-*`) | - | - | 범위 밖 | poteto-mode:26,28,30 |

플레이북(`poteto-mode/playbooks/*.md`)도 다른 스킬을 부른다. 단계마다 생기는 관계는 `poteto-mode` 페이지에서 플레이북별로 다룬다. 원장에는 플레이북별로 가리키는 스킬과 줄 번호만 기록한다(근거 방식: 명시-이름).

| 플레이북 | 가리키는 스킬(줄) | 범위 밖 |
|---|---|---|
| authoring-a-skill | principle-encode-lessons-in-structure(10) | create-skill(5) |
| autonomous-run | principle-sequence-verifiable-units(8), show-me-your-work(10) | - |
| autopilot-full | no-comments(6), principle-prove-it-works(6), show-me-your-work(6), swarm(8) | control-cli(8), control-ui(8), deslop(6) |
| autopilot-stack | no-comments(5), show-me-your-work(5) | deslop(5) |
| babysit | - | - |
| bug-fix | architect(9), how(8), interrogate(8), principle-sequence-verifiable-units(12), why(8) | tdd(11) |
| eval | arena(7,20,21) | - |
| feature | architect(6), arena(12), how(5), interrogate(16), principle-laziness-protocol(12), principle-model-the-domain(12), principle-separate-before-serializing-shared-state(10), principle-sequence-verifiable-units(15) | - |
| hillclimb | benchmark-checklist(8), how(7), principle-build-the-lever(8), principle-guard-the-context-window(12), principle-laziness-protocol(17), principle-prove-it-works(5), principle-separate-before-serializing-shared-state(12), principle-sequence-verifiable-units(16), show-me-your-work(9) | - |
| investigation | architect(12), how(7,9), unslop(10), why(7) | - |
| multi-phase-plan | how(152), interrogate(152), no-comments(59), principle-encode-lessons-in-structure(10), principle-guard-the-context-window(7), principle-never-block-on-the-human(6), principle-prove-it-works(13), principle-sequence-verifiable-units(8), show-me-your-work(152), swarm(13,37,65,76), technical-writing(9), unslop(9) | control-cli(15,71), control-ui(15,71), deslop(59) |
| opening-a-pr | interrogate(36), no-comments(9,36), technical-writing(9), unslop(9) | deslop(9,36) |
| orchestrate | arena(60), figure-it-out(3), principle-encode-lessons-in-structure(25), principle-separate-before-serializing-shared-state(17), show-me-your-work(31,61,66) | control-cli(17), control-ui(17) |
| pause-safely | show-me-your-work(8) | - |
| perf-issue | architect(17), benchmark-checklist(5), how(6), principle-sequence-verifiable-units(18) | - |
| prototype | architect(12), principle-exhaust-the-design-space(10), principle-laziness-protocol(5) | - |
| refactoring | architect(9), figure-it-out(5), how(7), principle-foundational-thinking(9), principle-laziness-protocol(10), principle-migrate-callers-then-delete-legacy-apis(11), principle-minimize-reader-load(13), principle-model-the-domain(8), principle-prove-it-works(12), principle-redesign-from-first-principles(9), principle-sequence-verifiable-units(14), principle-subtract-before-you-add(10) | - |
| runtime-forensics | principle-guard-the-context-window(6) | - |
| session-pickup | principle-guard-the-context-window(5), principle-prove-it-works(9) | - |
| shipping | - | control-cli(7), control-ui(7) |
| trace-forensics | principle-guard-the-context-window(7) | - |
| visual-parity | principle-separate-before-serializing-shared-state(7) | - |
| worktree-cleanup | principle-build-the-lever(5), principle-encode-lessons-in-structure(5), principle-guard-the-context-window(7), principle-prove-it-works(6) | - |

검색 방식: 하이픈이 든 이름은 그대로, `how`·`why` 같은 한 단어 이름은 굵은 글씨·백틱·슬래시·"the X skill" 형태만, 원칙은 접두어 없는 이름(`**laziness-protocol**`)과 제목형("Laziness Protocol")까지 찾았다. 1차 원장은 접두어 없는 이름을 놓쳤고, 스킬 페이지 작성 중 서브에이전트들이 찾아 바로잡았다. 플레이북은 자기 파일 경로를 `pstack/skills/poteto-mode/...`로 적는다(multi-phase-plan.md:10, autopilot-full.md:10). 이 저장소의 실제 경로는 `pstack/poteto-mode/...`다.

### poteto-help(안내)

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r20 | poteto-help | poteto-mode | 넘김 | 명시-이름 | 도움 질문이 아니라 일을 시키는 메시지면 `poteto-mode`를 읽고 그 아래에서 일한다. 도움 질문이면 일을 시작하지 않는다 | 사용자 요청 | - | 범위 내 | poteto-help:9,11; poteto-mode:3 |
| r21 | poteto-help | setup-pstack | 참고 | 명시-이름 | 설치 안내 2단계. 규칙 파일이 없으면 모든 역할이 기본 모델을 쓴다고 알린다 | - | `~/.cursor/rules/pstack-models.mdc` | 범위 내 | poteto-help:27,33; setup-pstack:8 |
| r22 | poteto-help | 형제 스킬 25개 | 참고 | 명시-이름 | "상황 → 스킬" 표(27줄 중 자기 자신과 폴더 없는 `/tdd`를 빼면 25개). 원칙이 아닌 형제 스킬은 모두 있다. 추천 전에 그 스킬을 읽는다 | - | - | 범위 내 | poteto-help:56-86 |
| r23 | poteto-help | tdd | 참고 | 명시-이름 | 표에 `[/tdd](../tdd/SKILL.md)`가 있으나 `pstack/tdd/` 폴더가 없다 | - | - | 불명 | poteto-help:70 |
| r24 | poteto-help | create-verification-skill | 참고 | 명시-이름 | 프로젝트에 `verify-*` 스킬이 없고 질문이 "변경이 동작함을 증명"에 관한 것일 때만 언급 | - | - | 범위 내 | poteto-help:28; create-verification-skill:3 |
| r25 | poteto-help | deslop, control-cli, control-ui, loop, create-skill | 참고 | 명시-이름 | "pstack에 없음"으로 안내 | - | - | 범위 밖 | poteto-help:99-103 |

### 공유 상태: 역할별 모델 규칙

`setup-pstack`이 `~/.cursor/rules/pstack-models.mdc`를 쓴다(`setup-pstack:8,39`). 다른 스킬은 서브에이전트를 띄울 때 이 파일의 역할 줄을 읽는다. 파일이나 줄이 없으면 각 스킬의 기본 모델을 쓴다.

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r30 | setup-pstack | how | 공유 상태 | 명시-이름 | `how explorer`, `how explainer` 줄 | 모델 이름 | `pstack-models.mdc` | 범위 내 | setup-pstack:55-56; how:11 |
| r31 | setup-pstack | why | 공유 상태 | 명시-이름 | `why investigators`, `why synthesizer` 줄 | 모델 이름 | `pstack-models.mdc` | 범위 내 | setup-pstack:57-58; why:13 |
| r32 | setup-pstack | arena | 공유 상태 | 명시-이름 | `arena runners`, `arena cross-judge pool` 줄 | 모델 목록 | `pstack-models.mdc` | 범위 내 | setup-pstack:61-62; arena:28,41 |
| r33 | setup-pstack | swarm | 공유 상태 | 명시-이름 | `swarm workers` 줄 | 모델 이름 | `pstack-models.mdc` | 범위 내 | setup-pstack:63; swarm:25 |
| r34 | setup-pstack | architect | 공유 상태 | 명시-이름 | `architect runners` 줄(`arena runners` 대신) | 모델 목록 | `pstack-models.mdc` | 범위 내 | setup-pstack:64; architect:33 |
| r35 | setup-pstack | interrogate | 공유 상태 | 명시-이름 | `interrogate reviewers` 줄 | 모델 목록 | `pstack-models.mdc` | 범위 내 | setup-pstack:65; interrogate:36 |
| r36 | setup-pstack | reflect | 공유 상태 | 명시-이름 | `reflect tooling`, `reflect judgment, divergent, synthesizer` 줄 | 모델 이름 | `pstack-models.mdc` | 범위 내 | setup-pstack:59-60; reflect:33 |
| r37 | setup-pstack | create-verification-skill | 넘김 | 명시-이름 | 앱을 직접 돌릴 수단이 없으면 한 번만 제안. 사용자가 예라고 하면 실행, 아니면 넘어간다(선택 단계) | - | - | 범위 내 | setup-pstack:72-74; create-verification-skill:3 |

### 코드 이해(how, why, teach, recall, blast-radius)

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r40 | how | why | 참고 | 명시-이름 | 동기를 묻는 질문은 `why`로 | - | - | 범위 내 | how:3; why:3 |
| r41 | why | how | 참고 | 명시-이름 | `how`의 짝. `how`는 무엇을·어떻게, `why`는 왜 | - | - | 범위 내 | why:11; how:3 |
| r42 | teach | how | 내부 위임 | 명시-이름 | 실제로 스킬을 실행한다. `why`와 병렬로 돌린다. 작은 변경이면 하나만 써도 된다 | 질문 → 동작 설명 | - | 범위 내 | teach:11,14; how:3 |
| r43 | teach | why | 내부 위임 | 명시-이름 | 기본은 좁게 묻는다(전체 조사는 느림). `why`의 확신도 표현은 고치지 않고 유지한다 | 좁힌 질문 → 근거 있는 이유 | - | 범위 내 | teach:11,14; why:3 |
| r44 | teach | unslop | 내부 위임 | 명시-이름 | 모든 응답 | 글 | - | 범위 내 | teach:19; unslop:3 |
| r45 | recall | why | 내부 위임 | 명시-이름 | 주제가 기능·파일·하위 시스템·버그를 가리키면 기본으로 실행. `why` 전체가 아니라 조사 담당(source investigators)과 갈래별 플레이북만 빌린다. 질문은 "지금 무엇이 열려 있나"로 바꿔서 넘긴다. 종합 단계를 거치는지는 원문에 명시 없음 | why 조사 담당 → 공유 기록 조사 결과 | - | 범위 내 | recall:20; why:3 |
| r46 | recall | poteto-mode(session-pickup 플레이북), automate-me | 넘김 | 명시-이름 | 먼저 분류한다. 특정 채팅 하나를 이어받는 일은 session-pickup, 습관을 스킬로 굳히는 일은 automate-me | 요청 | - | 범위 내 | recall:17; poteto-mode:143; automate-me:3 |
| r47 | recall | unslop | 내부 위임 | 명시-이름 | 요약 작성 | 글 | - | 범위 내 | recall:33; unslop:3 |
| r48 | blast-radius | how, why | 참고 | 명시-이름 | 짝 스킬. `how`=무엇을 하나, `why`=왜, blast-radius=다른 곳에서 무엇이 깨지나 | - | - | 범위 내 | blast-radius:11 |
| r49 | blast-radius | why | 내부 위임 | 명시-역할 | `why` 2단계(코드 기준점 만들기)를 써서 PR과 커밋을 가져온다. 위험 판단도 `why`와 같은 규칙 | 변경 → PR·커밋 목록 | - | 범위 내 | blast-radius:33,36; why:25-56 |
| r50 | blast-radius | arena | 내부 위임 | 명시-이름 | 크거나 넓은 변경일 때만 | 같은 질문 → 합친 답 | - | 범위 내 | blast-radius:38; arena:3 |
| r51 | blast-radius | unslop | 내부 위임 | 명시-이름 | 보고서 작성 | 글 | - | 범위 내 | blast-radius:48; unslop:3 |

### 설계·병렬 시도·리뷰(architect, arena, swarm, interrogate, no-comments)

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r60 | architect | how | 내부 위임 | 명시-이름 | Phase A에서 새 코드가 닿는 모든 시스템에 실행. 구현이 어긋나면 다시 실행 | 하위 시스템 → 추적한 모델 | - | 범위 내 | architect:23,25,76; how:3 |
| r61 | architect | why | 내부 위임 | 명시-이름 | 설계가 소유권이나 계층을 다시 정할 때만 | 기존 모양 → 제약 | - | 범위 내 | architect:25; why:3 |
| r62 | architect | arena | 내부 위임 | 명시-이름 | Phase B. `references/runner-prompt.md`를 각 러너 프롬프트로 넘긴다. 러너 모델은 `architect runners` 줄. 구현이 어긋나면 Phase B로 돌아가 다시 실행 | 설계 과제 + 근거 자료 → 설계 후보와 접붙인 결과 | - | 범위 내 | architect:31,33,79; arena:3 |
| r63 | architect | interrogate | 내부 위임 | 명시-이름 | 구현 전에 설계에 적대적 압박을 가하고 싶을 때(선택) | 설계 초안 → 리뷰 | - | 범위 내 | architect:49; interrogate:3 |
| r64 | architect | principle-foundational-thinking, principle-outcome-oriented-execution | 참고 | 명시-이름 | 골격 먼저 커밋, 계획된 중간 파손 허용의 근거 | - | - | 범위 내 | architect:49 |
| r65 | arena | principle-separate-before-serializing-shared-state | 참고 | 명시-이름 | 후보마다 출력 위치를 따로 준다(worktree 또는 `/tmp/arena-<slug>/candidate-<n>/`) | - | - | 범위 내 | arena:29 |
| r66 | no-comments | architect | 내부 위임 | 명시-이름 | 수정 중 하나라도 모양을 정해야 하면, 받아들인 지적 전체에 대해 한 번 실행하고 스케치에서 멈춘다. 구현은 no-comments 4단계가 한다 | 지적 목록 → 설계 스케치 | - | 범위 내 | no-comments:21; architect:3 |
| r67 | no-comments | principle-fix-root-causes, principle-redesign-from-first-principles | 참고 | 명시-이름 | 의도만 안내한다. 범위 밖 수정을 허락하지 않는다 | - | - | 범위 내 | no-comments:22 |
| r68 | figure-it-out | poteto-mode | 참고 | 명시-이름 | 할 일 목록 첫 항목이 `poteto-mode`의 Principles 절 읽기(의무형) | - | - | 범위 내 | figure-it-out:13; poteto-mode:38-79 |
| r69 | figure-it-out | architect | 내부 위임 | 명시-이름 | 되돌리기 어려운 설계 결정일 때. 모양이 이미 정해진 기계적 작업이면 건너뛴다. 정해진 설계에 arena를 또 돌리지 않는다 | 설계 결정 → 확정 설계 | - | 범위 내 | figure-it-out:30; architect:3 |
| r70 | figure-it-out | show-me-your-work | 내부 위임 | 명시-이름 | 실행 기록을 남긴다. 보통 커밋해서 PR에서 읽게 한다 | 결정 → 기록 | - | 범위 내 | figure-it-out:47; show-me-your-work:3 |
| r71 | figure-it-out | principle-laziness-protocol | 참고 | 명시-이름 | 두 번째 arena는 과설계라는 근거 | - | - | 범위 내 | figure-it-out:30 |

### 검증 도구(create-verification-skill, maintain-verification-skill)

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r80 | create-verification-skill | maintain-verification-skill | 넘김 | 명시-이름 | 앱이 바뀔 때 기능 지도를 맞게 유지하려면 사용자에게 안내. 주기는 물을 때만 제안 | 생성된 검증 스킬 | - | 범위 내 | create-verification-skill:44; maintain-verification-skill:9 |
| r81 | create-verification-skill | maintain-verification-skill | 공유 상태 | 명시-이름 | create가 쓰고 maintain이 찾아 고친다 | `.cursor/skills/verify-<app>/SKILL.md`, `features/*.md` | 대상 프로젝트 저장소 | 범위 내 | create-verification-skill:25,36; maintain-verification-skill:25,27 |
| r82 | maintain-verification-skill | create-verification-skill | 넘김 | 명시-이름 | 대상 검증 스킬이 없으면 멈추고 create를 안내한다. 후보가 여럿이면 사용자에게 묻는다 | - | - | 범위 내 | maintain-verification-skill:25 |

### 글쓰기, 측정, 기타

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r90 | technical-writing | unslop | 내부 위임 | 명시-이름 | 이 스킬이 다루는 모든 문서에 적용. 새 금지 표현은 unslop 목록에 추가하자고 제안 | 글 | - | 범위 내 | technical-writing:19,93; unslop:3 |
| r91 | show-me-your-work | unslop | 내부 위임 | 명시-이름 | 기록 문장에도 적용 | 글 | - | 범위 내 | show-me-your-work:36; unslop:3 |
| r92 | automate-me | unslop, create-skill | 내부 위임 | 명시-이름 | 마이닝 → `create-skill` 작성 → unslop 순으로 엮는다. `create-skill`은 Cursor 내장 | 습관 근거 → `-mode` 스킬 초안 | - | unslop 범위 내, create-skill 범위 밖 | automate-me:11,67,77 |
| r93 | automate-me | poteto-mode | 참고 | 명시-이름 | 모드 스킬의 세밀함을 보려고 읽는다. 내용은 베끼지 않는다 | - | - | 범위 내 | automate-me:63 |
| r94 | benchmark-checklist | principle-explain-the-number | 참고 | 명시-이름 | 왜 필요한지는 그 원칙이 말한다 | - | - | 범위 내 | benchmark-checklist:9 |
| r95 | principle-explain-the-number | benchmark-checklist | 넘김 | 명시-이름 | 성능 수치면 전체 절차를 그 스킬로 실행한다 | 측정값 | - | 범위 내 | principle-explain-the-number:19 |
| r96 | principle-prove-it-works | show-me-your-work | 참고 | 명시-이름 | 크거나 복잡한 작업이라 나중에 감사할 기록이 필요할 때만 커밋 | - | - | 범위 내 | principle-prove-it-works:22 |
| r97 | principle-type-system-discipline | typescript-best-practices | 참고 | 명시-이름 | 특정 언어 문법으로 구체화하는 스킬의 예 | - | - | 범위 내 | principle-type-system-discipline:11 |
| r98 | reflect | create-skill | 내부 위임 | 명시-이름 | 10줄 넘는 기존 스킬 수정, description 조정, 새 스킬은 `create-skill`에 넘긴다. 한 줄짜리는 부모가 직접 | 승인된 항목 → 스킬 수정 | - | 범위 밖 | reflect:59-62 |

### 스킬 페이지 작성 중 추가한 관계

1차 원장 확정 뒤 서브에이전트들이 원문에서 찾아 보고한 관계다. 조정자가 해당 줄을 기준으로 정리했다.

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r110 | no-comments | how, why | 내부 위임 | 명시-이름 | 2단계에서 판정 근거가 얇은 심볼에만 실행 | 심볼 → 동작·이유 | - | 범위 내 | no-comments:20 |
| r111 | architect | principle-exhaust-the-design-space, principle-fix-root-causes, principle-redesign-from-first-principles, principle-subtract-before-you-add, principle-separate-before-serializing-shared-state, principle-encode-lessons-in-structure, principle-boundary-discipline, principle-make-operations-idempotent, principle-laziness-protocol, principle-minimize-reader-load | 참고 | 명시-이름 | 본문과 러너 프롬프트·근거 템플릿에서 설계 판단 근거로 지목 | - | - | 범위 내 | architect:35,61,77,78; references/runner-prompt.md:12-18; references/rationale-template.md:15 |
| r112 | arena | principle-laziness-protocol, principle-redesign-from-first-principles, principle-prove-it-works | 참고 | 명시-이름 | 접붙이기·검증 판단 근거 | - | - | 범위 내 | arena:49,57,65 |
| r113 | figure-it-out | principle-prove-it-works, principle-never-block-on-the-human, principle-foundational-thinking, principle-separate-before-serializing-shared-state, principle-sequence-verifiable-units, principle-encode-lessons-in-structure | 참고 | 명시-이름 | 맞춤 플레이북 설계 단계별 근거 | - | - | 범위 내 | figure-it-out:19,23,27,31,39,51 |
| r114 | show-me-your-work | principle-encode-lessons-in-structure | 참고 | 명시-이름 | 기록 감사에서 반복 실수를 구조로 옮길 때 | - | - | 범위 내 | show-me-your-work:53 |
| r115 | reflect | principle-encode-lessons-in-structure | 참고 | 명시-이름 | 구조적 검사 단계 | - | - | 범위 내 | reflect:49 |
| r116 | typescript-best-practices | principle-type-system-discipline | 참고 | 명시-이름 | 이 원칙을 먼저 적용한다(의무형). r97의 반대 방향 | - | - | 범위 내 | typescript-best-practices:10; references/patterns.md:3 |
| r117 | typescript-best-practices | principle-boundary-discipline | 참고 | 명시-이름 | 경계에서 외부 데이터 파싱 | - | - | 범위 내 | typescript-best-practices:25; references/patterns.md:3,272 |
| r118 | benchmark-checklist | poteto-mode(opening-a-pr, perf-issue, hillclimb 플레이북) | 참고 | 명시-이름 | 이 체크리스트를 쓰는 플레이북을 지목 | - | - | 범위 내 | benchmark-checklist:34,38,39 |
| r119 | poteto-help | principle-prove-it-works | 참고 | 명시-이름 | "초록 빌드로 성공을 주장"하는 증상의 처방 | - | - | 범위 내 | poteto-help:133 |
| r120 | principle-sequence-verifiable-units | principle-build-the-lever, principle-prove-it-works | 참고 | 명시-이름 | 각 단위의 검사 방법 | - | - | 범위 내 | principle-sequence-verifiable-units:17 |
| r121 | principle-type-system-discipline | principle-boundary-discipline, principle-encode-lessons-in-structure | 참고 | 명시-이름 | 경계에서 외부 데이터 파싱(18줄), 권위 있는 스키마에서 타입 끌어오기(21줄) | - | - | 범위 내 | principle-type-system-discipline:18,21 |
| r122 | principle-experience-first | principle-foundational-thinking | 참고 | 명시-이름 | 링크 없이 원칙 제목만 쓴다 | - | - | 범위 내 | principle-experience-first:19 |

### 원문끼리 충돌하는 곳

어느 쪽이 우선인지 원문에 명시가 없어 페이지에 충돌을 그대로 보여 준 곳이다.

| 충돌 | 한쪽 | 다른 쪽 |
|---|---|---|
| 괄호 사용 | `unslop`: 대시 대신 괄호도 쓰지 않는다(unslop:36) | `technical-writing`: 문법 단위를 이루는 괄호는 허용(technical-writing:86) |
| 결정 기록의 칸 | `show-me-your-work`: 다른 스킬이 칸을 다시 정의하지 않는다(show-me-your-work:82) | hillclimb 플레이북: `decision.tsv`에 별도 칸 정의(hillclimb.md:9) |
| PR을 여는가 | `poteto-mode`: Opening a PR은 모든 플레이북 끝에 실행(poteto-mode:147) | investigation 플레이북: "No PR"(investigation.md:12) |
| `gt` 사용 | 여러 플레이북: `gt`를 요구하지 않는다 | orchestrate 플레이북과 `scripts/orch/store.ts`: `gt`를 쓴다 |
| 승인 단계 이름 | `architect` 본문: Phase C에서 승인(architect:43-47) | 근거 템플릿: "Phase D sign-off"(references/rationale-template.md:35) |
| 후보 작업 폴더 | `arena`: `/tmp/arena-<slug>/candidate-<n>/`(arena:29) | architect 러너 프롬프트: 스케치 폴더 아래 러너별 하위 폴더(references/runner-prompt.md:3) |
| `why` 건너뛰기 사유 | `teach`: 좁게 부르고 건너뛴 갈래를 기록(teach:14) | `why`: 인정하는 사유는 "서버 없음"과 "무관함 증명" 둘뿐(why:114-121) |
| 자동 실행 여부 | `correct` description: 운영자가 고칠 때마다 반복(correct:3) | `disable-model-invocation: true`(correct:4) |

### 원칙끼리의 참고

| rel-id | from | to | 종류 | 근거 방식 | 조건 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|
| r100 | principle-attack-the-premise | principle-build-the-lever | 참고 | 명시-이름 | 집계를 다시 돌릴 수 있는 스크립트로 쓴다 | 범위 내 | principle-attack-the-premise:15 |
| r101 | principle-attack-the-premise | principle-fix-root-causes | 참고 | 명시-이름 | 역할을 주는 것이 다음 "왜" | 범위 내 | principle-attack-the-premise:16 |
| r102 | principle-attack-the-premise | principle-laziness-protocol | 참고 | 명시-이름 | 보정하지 말고 비대칭을 없앤다 | 범위 내 | principle-attack-the-premise:17 |
| r103 | principle-attack-the-premise | principle-redesign-from-first-principles | 참고 | 명시-이름 | 구별: 저쪽은 새 요구로 재설계, 이쪽은 가정 자체를 의심 | 범위 내 | principle-attack-the-premise:23 |
| r104 | principle-build-the-lever | principle-laziness-protocol | 참고 | 명시-이름 | 프레임워크 말고 가장 작은 스크립트 | 범위 내 | principle-build-the-lever:21 |
| r105 | principle-build-the-lever | principle-encode-lessons-in-structure, principle-prove-it-works | 참고 | 명시-이름 | 구별(반복 지시의 영구 장치 / 검증 스크립트) | 범위 내 | principle-build-the-lever:23 |
| r106 | principle-explain-the-number | principle-prove-it-works | 참고 | 명시-이름 | 구별: 저쪽은 출력이 진짜인지, 이쪽은 수치가 그 뜻인지 | 범위 내 | principle-explain-the-number:23 |
| r107 | principle-minimize-reader-load | principle-guard-the-context-window | 참고 | 명시-이름 | 사람 독자판 대응 원칙 | 범위 내 | principle-minimize-reader-load:13 |

### poteto-mode가 원칙을 꺼내는 조건(r12 세부)

| 원칙 | 분류 | 조건 | 출처 |
|---|---|---|---|
| principle-laziness-protocol | Core | 리팩터링, diff 크기 판단, 추상화·계층 추가 유혹 | poteto-mode:44 |
| principle-foundational-thinking | Core | 로직 작성 전: 핵심 타입, 골격과 기능의 순서, 동시 실행자가 공유하는 것 | poteto-mode:45 |
| principle-redesign-from-first-principles | Core | 기존 설계에 새 요구 통합 | poteto-mode:46 |
| principle-attack-the-premise | Core | 같은 전제를 공유한 수정 2개 이상이 같은 관문에서 실패 | poteto-mode:47 |
| principle-subtract-before-you-add | Core | 추가·리팩터링·재작성 순서 정하기 | poteto-mode:48 |
| principle-minimize-reader-load | Core | 따라가기 어려운 코드 리뷰나 정리 | poteto-mode:49 |
| principle-outcome-oriented-execution | Core | 단계 경계가 명시된 계획된 재작성·이전 | poteto-mode:50 |
| principle-experience-first | Core | 제품·UX·기능 범위 절충 | poteto-mode:51 |
| principle-exhaust-the-design-space | Core | 선례 없는 상호작용이나 아키텍처 결정 | poteto-mode:52 |
| principle-build-the-lever | Core | 사소하지 않은 모든 작업 | poteto-mode:53 |
| principle-model-the-domain | Architecture | 상태 있는 로직, 분기가 많거나 모양 가정이 여러 파일에 반복 | poteto-mode:57 |
| principle-boundary-discipline | Architecture | 검증·오류 처리·프레임워크 어댑터 연결 | poteto-mode:58 |
| principle-type-system-discipline | Architecture | 타입 언어에서 타입이나 시그니처 설계 | poteto-mode:59 |
| principle-make-operations-idempotent | Architecture | 충돌·재시도 속에서 도는 명령, 수명 주기 단계, 루프 | poteto-mode:60 |
| principle-migrate-callers-then-delete-legacy-apis | Architecture | 옛 호출자가 남은 채 새 내부 API 도입 | poteto-mode:61 |
| principle-separate-before-serializing-shared-state | Architecture | 동시 실행자가 같은 파일·브랜치·키·객체에 쓸 수 있음 | poteto-mode:62 |
| principle-prove-it-works | Verification | 작업 후 완료 선언 전 | poteto-mode:66 |
| principle-fix-root-causes | Verification | 디버깅 | poteto-mode:67 |
| principle-sequence-verifiable-units | Verification | 여러 단계 작업, 커밋·PR 쌓기 | poteto-mode:68 |
| principle-test-behavior-not-implementation | Verification | 테스트를 쓰거나 바꾸거나 남길 때 | poteto-mode:69 |
| principle-explain-the-number | Verification | 잰 수치를 믿거나 보고하거나 행동하기 전 | poteto-mode:70 |
| principle-guard-the-context-window | Delegation | 컨텍스트가 찰 때 | poteto-mode:74 |
| principle-never-block-on-the-human | Delegation | 되돌릴 수 있는 일에 "해도 될까요?"를 묻고 싶을 때 | poteto-mode:75 |
| principle-encode-lessons-in-structure | Meta | 같은 지시를 두 번째로 쓰고 있을 때 | poteto-mode:79 |

## 묶음

| group-id | 작업 목표 | 구성 스킬과 역할 | 그림 |
|---|---|---|---|
| run | 작업 하나를 pstack 방식으로 끝까지 돌린다 | setup-pstack(준비), poteto-help(안내), poteto-mode(허브), figure-it-out(맞는 플레이북이 없을 때), show-me-your-work(결정 기록) | `@workflow`: 준비 → 요청 분류 → 플레이북 또는 figure-it-out → 트리거별 스킬 → 기록 → 답변 |
| understand | 코드를 바꾸기 전에 이해한다 | how(동작), why(이유), teach(둘을 엮어 설명), recall(최근 작업 맥락 복원), blast-radius(diff 밖 영향) | `@workflow` 위임 관계 + 비교표 |
| design-review | 구현 전에 모양을 정하고, 여러 번 시도하고, 리뷰한다 | architect(설계), arena(같은 과제 여러 후보), swarm(조각 나눠 병렬), interrogate(다중 모델 리뷰), no-comments(리뷰 전 주석 정리) | `@workflow`: architect → how/why → arena → (interrogate) → 구현 |
| verify-harness | 앱을 사용자처럼 직접 돌려 증명할 도구를 만들고 유지한다 | setup-pstack(제안), create-verification-skill(생성), maintain-verification-skill(유지) | `@workflow` + 공유 상태 표 |
| principles | `poteto-mode`가 판단 근거로 읽고 인용하는 한 줄 원칙 24개 | principle-*(조건부 원칙) | 분류별 표 + 원칙끼리 참고 관계 |

독립 스킬(묶음 없음): `benchmark-checklist`, `unslop`, `technical-writing`, `bro`, `correct`, `reflect`, `automate-me`, `make-bot-ui`, `typescript-best-practices`. 다른 스킬과의 관계는 위 표에 있지만, 하나의 작업 목표로 묶을 만한 흐름은 없다(판정). `unslop`은 여러 스킬이 글을 쓸 때 공통으로 적용하는 규칙이다(r06, r44, r47, r51, r90, r91, r92).
