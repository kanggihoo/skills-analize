# poteto-mode 스킬은 에이전트를 어떻게 바꾸나 {#poteto-mode-skill}

`poteto-mode`가 켜지면 에이전트는 플레이북을 따르는 리드가 된다. 요청을 플레이북 23개 중 하나에 맞추고, 그 단계를 할 일 목록 맨 앞에 그대로 옮긴 뒤, 조건마다 정해진 형제 스킬을 부르며 진행한다.[](source:pb-copy)

- 조건과 스킬을 짝지은 목록(Non-negotiables)이 `how`, `architect`, `unslop` 같은 스킬 호출을 의무로 만든다.[](source:nn-head)
- 되돌릴 수 있는 일은 묻지 않고 한다. 공유 브랜치 force-push, 배포, 데이터 삭제, 고객 메시지에서만 멈춘다.[](source:autonomy)
- 코드는 서브에이전트에게 맡긴다. 리드는 변경분을 직접 리뷰하고 요약도 직접 쓴다.[](source:subagent-own)
- PR 상태 확인, 장기 프로그램 장부, 계획서 검사, 워크트리 감사에는 전용 스크립트를 쓴다.[](source:pb-babysit-watch)[](source:orch-store)

@answer scope="pstack/poteto-mode · 원본 텍스트 파일 44개(326,154B) · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/poteto-mode/SKILL.md · 20559B · frontmatter" path=pstack/poteto-mode/SKILL.md lines=1:9
@source nn-head title="SKILL.md · Non-negotiables 도입" path=pstack/poteto-mode/SKILL.md lines=13:17
@source nn-how title="SKILL.md · how 트리거" path=pstack/poteto-mode/SKILL.md lines=19:19
@source nn-ask title="SKILL.md · 질문 분류 트리거" path=pstack/poteto-mode/SKILL.md lines=20:20
@source nn-code title="SKILL.md · 코드 관련 트리거" path=pstack/poteto-mode/SKILL.md lines=21:25
@source nn-prose title="SKILL.md · 글쓰기·커밋·리뷰 트리거" path=pstack/poteto-mode/SKILL.md lines=26:29
@source nn-ship title="SKILL.md · 출시·측정·PR 트리거" path=pstack/poteto-mode/SKILL.md lines=30:33
@source nn-rest title="SKILL.md · Bugbot·깨진 스킬·결정 기록 트리거" path=pstack/poteto-mode/SKILL.md lines=34:36
@source principles title="SKILL.md · Principles" path=pstack/poteto-mode/SKILL.md lines=38:79
@source autonomy title="SKILL.md · Autonomy" path=pstack/poteto-mode/SKILL.md lines=81:89
@source subagent-type title="SKILL.md · Subagents 종류" path=pstack/poteto-mode/SKILL.md lines=93:93
@source subagent-defaults title="SKILL.md · Task 기본값과 모델" path=pstack/poteto-mode/SKILL.md lines=95:95
@source subagent-own title="SKILL.md · 결과 책임과 새 서브에이전트" path=pstack/poteto-mode/SKILL.md lines=97:99
@source reply title="SKILL.md · Writing the reply" path=pstack/poteto-mode/SKILL.md lines=101:113
@source comments title="SKILL.md · Comments" path=pstack/poteto-mode/SKILL.md lines=115:117
@source pb-copy title="SKILL.md · 플레이북 고르기와 복사" path=pstack/poteto-mode/SKILL.md lines=119:123
@source pb-list title="SKILL.md · 플레이북 목록" path=pstack/poteto-mode/SKILL.md lines=125:147
@source pb-investigation title="playbooks/investigation.md · 928B" path=pstack/poteto-mode/playbooks/investigation.md lines=1:14
@source pb-bugfix title="playbooks/bug-fix.md · 2255B" path=pstack/poteto-mode/playbooks/bug-fix.md lines=1:15
@source pb-perf title="playbooks/perf-issue.md · 1446B" path=pstack/poteto-mode/playbooks/perf-issue.md lines=1:25
@source pb-hill title="playbooks/hillclimb.md · 4403B" path=pstack/poteto-mode/playbooks/hillclimb.md lines=1:21
@source pb-runtime title="playbooks/runtime-forensics.md · 1210B" path=pstack/poteto-mode/playbooks/runtime-forensics.md lines=1:11
@source pb-trace title="playbooks/trace-forensics.md · 1865B" path=pstack/poteto-mode/playbooks/trace-forensics.md lines=1:14
@source pb-feature title="playbooks/feature.md · 2766B" path=pstack/poteto-mode/playbooks/feature.md lines=1:21
@source pb-refactor title="playbooks/refactoring.md · 3211B" path=pstack/poteto-mode/playbooks/refactoring.md lines=1:16
@source pb-proto title="playbooks/prototype.md · 2161B" path=pstack/poteto-mode/playbooks/prototype.md lines=1:14
@source pb-visual title="playbooks/visual-parity.md · 1197B" path=pstack/poteto-mode/playbooks/visual-parity.md lines=1:11
@source pb-skill title="playbooks/authoring-a-skill.md · 831B" path=pstack/poteto-mode/playbooks/authoring-a-skill.md lines=1:12
@source pb-eval title="playbooks/eval.md · 2524B" path=pstack/poteto-mode/playbooks/eval.md lines=1:25
@source pb-babysit-mode title="playbooks/babysit.md · 8289B · 모드와 frontier" path=pstack/poteto-mode/playbooks/babysit.md lines=1:11
@source pb-babysit-watch title="playbooks/babysit.md · watcher, 멈춤 조건" path=pstack/poteto-mode/playbooks/babysit.md lines=12:20
@source pb-babysit-ci title="playbooks/babysit.md · CI·Bugbot·사람 경계" path=pstack/poteto-mode/playbooks/babysit.md lines=21:27
@source pb-ship title="playbooks/shipping.md · 5439B" path=pstack/poteto-mode/playbooks/shipping.md lines=1:17
@source pb-auto title="playbooks/autonomous-run.md · 1878B" path=pstack/poteto-mode/playbooks/autonomous-run.md lines=1:13
@source orch-head title="playbooks/orchestrate.md · 16779B · 범위와 역할" path=pstack/poteto-mode/playbooks/orchestrate.md lines=1:19
@source orch-store title="playbooks/orchestrate.md · 스토어와 브리프" path=pstack/poteto-mode/playbooks/orchestrate.md lines=21:56
@source orch-steps title="playbooks/orchestrate.md · 단계와 드레인" path=pstack/poteto-mode/playbooks/orchestrate.md lines=58:75
@source orch-stack title="playbooks/orchestrate.md · 스택·검증·실패" path=pstack/poteto-mode/playbooks/orchestrate.md lines=77:101
@source orch-esc title="playbooks/orchestrate.md · Escalation" path=pstack/poteto-mode/playbooks/orchestrate.md lines=103:111
@source pb-apfull title="playbooks/autopilot-full.md · 9431B" path=pstack/poteto-mode/playbooks/autopilot-full.md lines=1:13
@source pb-apstack title="playbooks/autopilot-stack.md · 5031B" path=pstack/poteto-mode/playbooks/autopilot-stack.md lines=1:16
@source pb-pickup title="playbooks/session-pickup.md · 1678B" path=pstack/poteto-mode/playbooks/session-pickup.md lines=1:11
@source pb-pause title="playbooks/pause-safely.md · 1135B" path=pstack/poteto-mode/playbooks/pause-safely.md lines=1:10
@source pb-plan title="playbooks/multi-phase-plan.md · 12977B · 단계와 검증 규칙" path=pstack/poteto-mode/playbooks/multi-phase-plan.md lines=1:15
@source pb-plan-skel title="playbooks/multi-phase-plan.md · 계획서 뼈대" path=pstack/poteto-mode/playbooks/multi-phase-plan.md lines=17:155
@source pb-wt title="playbooks/worktree-cleanup.md · 2932B" path=pstack/poteto-mode/playbooks/worktree-cleanup.md lines=1:14
@source pb-openpr title="playbooks/opening-a-pr.md · 6142B" path=pstack/poteto-mode/playbooks/opening-a-pr.md lines=1:32
@source pb-openpr-babysit title="playbooks/opening-a-pr.md · Babysit 절" path=pstack/poteto-mode/playbooks/opening-a-pr.md lines=34:36
@source bugbot title="references/bugbot-triage.md · 9629B · 분류 기준" path=pstack/poteto-mode/references/bugbot-triage.md lines=1:29
@source bugbot-ask title="references/bugbot-triage.md · 기본적으로 묻기" path=pstack/poteto-mode/references/bugbot-triage.md lines=75:88
@source s-pkg title="scripts/package.json · 352B" path=pstack/poteto-mode/scripts/package.json lines=1:16
@source s-boot title="scripts/bootstrap.ts · 1737B" path=pstack/poteto-mode/scripts/bootstrap.ts lines=17:61
@source s-check title="scripts/check-plan.mjs · 7594B · 문체·구조 규칙" path=pstack/poteto-mode/scripts/check-plan.mjs lines=5:61
@source s-check-out title="scripts/check-plan.mjs · 출력과 종료 코드" path=pstack/poteto-mode/scripts/check-plan.mjs lines=182:185
@source s-wta title="scripts/worktree-audit.sh · 3984B · 입력" path=pstack/poteto-mode/scripts/worktree-audit.sh lines=1:30
@source s-wta-bucket title="scripts/worktree-audit.sh · 버킷 규칙" path=pstack/poteto-mode/scripts/worktree-audit.sh lines=63:80
@source s-orch title="scripts/orch/orch.ts · 15511B · CLI 옵션" path=pstack/poteto-mode/scripts/orch/orch.ts lines=254:268
@source s-orch-status title="scripts/orch/orch.ts · status 세 줄" path=pstack/poteto-mode/scripts/orch/orch.ts lines=175:188
@source s-store-init title="scripts/orch/store.ts · 42927B · init" path=pstack/poteto-mode/scripts/orch/store.ts lines=1576:1587
@source s-store-ledger title="scripts/orch/store.ts · ledger" path=pstack/poteto-mode/scripts/orch/store.ts lines=1332:1372
@source s-store-lock title="scripts/orch/store.ts · 잠금" path=pstack/poteto-mode/scripts/orch/store.ts lines=381:428
@source s-store-gt title="scripts/orch/store.ts · gt로 frontier 계산" path=pstack/poteto-mode/scripts/orch/store.ts lines=1106:1131
@source s-store-frontier title="scripts/orch/store.ts · frontier set" path=pstack/poteto-mode/scripts/orch/store.ts lines=1484:1511
@source s-watch-entry title="scripts/watch-pr/watch-pr · 211B" path=pstack/poteto-mode/scripts/watch-pr/watch-pr lines=1:6
@source s-watch-cli title="scripts/watch-pr/cli.ts · 6983B · 옵션과 기본값" path=pstack/poteto-mode/scripts/watch-pr/cli.ts lines=86:131
@source s-watch-gh title="scripts/watch-pr/github.ts · 24072B · gh 호출" path=pstack/poteto-mode/scripts/watch-pr/github.ts lines=453:536
@source s-watch-gate title="scripts/watch-pr/github.ts · Code Review Gate 제외" path=pstack/poteto-mode/scripts/watch-pr/github.ts lines=252:272
@source s-watch-bugbot title="scripts/watch-pr/github.ts · Bugbot 회차 세기" path=pstack/poteto-mode/scripts/watch-pr/github.ts lines=333:400
@source s-watch-policy title="scripts/watch-pr/policy.ts · 25132B · 차단 요인 순서" path=pstack/poteto-mode/scripts/watch-pr/policy.ts lines=214:265
@source s-watch-types title="scripts/watch-pr/types.ts · 12359B · 판정과 종료 코드" path=pstack/poteto-mode/scripts/watch-pr/types.ts lines=304:364
@source s-watch-render title="scripts/watch-pr/render.ts · 7083B · 4열 표" path=pstack/poteto-mode/scripts/watch-pr/render.ts lines=45:54
@source help-work title="pstack/poteto-help/SKILL.md · 일 요청 처리" path=pstack/poteto-help/SKILL.md lines=9:11
@source setup-rule title="pstack/setup-pstack/SKILL.md · 규칙 파일 쓰기" path=pstack/setup-pstack/SKILL.md lines=37:39
@source recall-route title="pstack/recall/SKILL.md · 분류" path=pstack/recall/SKILL.md lines=17:17
@source fio-start title="pstack/figure-it-out/SKILL.md · 시작" path=pstack/figure-it-out/SKILL.md lines=11:13
@source automate-read title="pstack/automate-me/SKILL.md · poteto-mode 참고" path=pstack/automate-me/SKILL.md lines=63:63

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 사용자가 `/poteto-mode`를 입력하거나, 다른 스킬이 이 스킬을 읽으라고 할 때 켜진다. `description`은 어떤 요청을 다루는지 알려 주는 설명이다. "poteto", `/poteto-mode`, 이 방식으로 일해 달라는 요청을 든다.

| 필드 | 원문이 말하는 것 | 분석 |
| --- | --- | --- |
| `mode: true` | 값만 있고 설명은 없다[](source:fm) | 판정: 모드 스킬(mode skill), 즉 Cursor 앱의 Custom Mode 기능으로 켜 두는 스킬 표시다. `poteto-help`가 "Custom Mode 기능으로 켜 두면 계속 유지된다"고 쓴다[](source:help-work) |
| `reminder` | 새 작업이 플레이북에 맞거나 엄밀함이 필요하면 적용한다. 가벼운 대화거나 사용자가 빼 달라고 하면 적용하지 않는다[](source:fm) | 판정: 모드가 켜져 있어도 턴마다 적용 여부를 다시 고르라는 줄이다. 이 줄을 언제 보여 주는지는 원문에 명시 없음 |
| `icon`, `color` | `crown`, `yellow`[](source:fm) | 표시용으로 보인다. 원문에 설명 없음 |

| 누가 켜나 | 조건 | rel-id |
| --- | --- | --- |
| 사용자 | `/poteto-mode` 입력, 또는 Custom Mode 설정으로 켜 둠 | - |
| `poteto-help` | 도움 질문이 아니라 일을 시키는 메시지면 `poteto-mode`를 읽고 그 아래에서 일한다[](source:help-work) | r20 |
| `recall` | 특정 채팅 하나를 이어받는 일이면 Session pickup 플레이북으로 보낸다[](source:recall-route) | r46 |
| `figure-it-out` | 할 일 목록 첫 항목이 Principles 절 읽기다. 모드 전체를 켜지는 않는다[](source:fio-start) | r68 |
| `automate-me` | 모드 스킬의 세밀함을 보려고 읽기만 한다[](source:automate-read) | r93 |

## 어떤 조건에서 어떤 스킬을 부르나 {#non-negotiables}

Non-negotiables 절은 "조건 → 할 일" 목록이다. 절 이름 그대로 빼먹을 수 없는 규칙이다.[](source:nn-head) 맨 앞에는 원칙 인용 규칙이 있다.

- 답변에 결정을 바꾼 원칙과, 그 원칙이 바꾼 선택을 밝힌다.[](source:nn-head)
- 이번 세션에 그 원칙의 `SKILL.md`를 끝까지 읽은 경우만 인용한다.[](source:principles)

| 조건 | 할 일 | rel-id |
| --- | --- | --- |
| 사소하지 않은 변경, 아키텍처 결정, "확실해?" | `how` 실행[](source:nn-how) | r01 |
| "어떤 방식으로?" 같은 갈림길에서 질문하려 할 때 | 먼저 분류한다. 실행해서 볼 수 있는 사실이면 Prototype 플레이북으로 확인한다. 읽기 전용 Investigation이면 근거로 답한다[](source:nn-ask) | - |
| 모든 코드 | 데이터 모양부터 정하고 `principle-model-the-domain`으로 구조를 고른다[](source:nn-code) | r13 |
| 함수 경계를 넘는 코드 | 구현 전에 `architect`로 병렬 설계 탐색[](source:nn-code) | r02 |
| 병렬 분산 | 커버리지·경주·관문·탐색 분할은 `swarm`, 설계·코드 겨루기는 `arena`[](source:nn-code) | r03, r04 |
| 설계에 이견 | 출시 전 `interrogate`[](source:nn-code) | r05 |
| 사소하지 않은 여러 단계 작업 | 처리량 점검(Feature 3단계)을 쓴다[](source:nn-code) | - |
| 모든 산문(답변 포함) | `unslop`. 에이전트가 읽을 글은 Cursor 내장 `create-skill`도 따른다[](source:nn-prose) | r06, r16 |
| 문서, RFC, README, PR 설명, 커밋 메시지 | `technical-writing`[](source:nn-prose) | r07 |
| 커밋 전 / 리뷰 전 | `deslop`(cursor-team-kit, 범위 밖) / `no-comments`[](source:nn-prose) | r16, r08 |
| UI·IDE·CLI 출시 | `control-ui` 또는 `control-cli`(범위 밖). 버그는 같은 표면에서 직접 먼저 재현한다[](source:nn-ship) | r16 |
| 직접 잰 성능 수치 | 보고하거나 행동하기 전에 `benchmark-checklist`[](source:nn-ship) | r09 |
| PR 상태 요청 | Babysit 플레이북. 이름이 같은 Cursor 내장 babysit 스킬이 아니다. PR을 열기만 해서는 켜지지 않는다[](source:nn-ship) | - |
| 초록 스택 병합 요청 | Shipping 플레이북. 초록은 안전하다는 뜻이 아니다[](source:nn-ship) | - |
| Bugbot·보안 리뷰 댓글 | 회의적으로 본다. `references/bugbot-triage.md` 기준으로 `fix`·`dismiss`·`ask`를 가른다[](source:nn-rest) | - |
| 작업 중 깨진 스킬 | 별도 PR로 고친다. 막히지도, 몰래 우회하지도 않는다[](source:nn-rest) | - |
| 길거나 자율적이거나 여러 단계, 사용자가 자리를 비움 | `show-me-your-work` 결정 기록. 감사 기록이 필요하면 커밋, 아니면 로컬[](source:nn-rest) | r10 |

원칙 24개는 Core 10개, Architecture 6개, Verification 5개, Delegation 2개, Meta 1개로 나뉜다.[](source:principles) 원칙마다 적용 조건이 붙어 있다. 조건 목록은 `pstack/relations.md`의 r12 세부 표에 있다.

## 플레이북을 어떻게 고르고 옮기나 {#routing}

@workflow id=pm-route title="플레이북 고르기"
| req | 새 작업 | external |
| prog | 장기 프로그램? | backend |
| big | 크거나 부재? | backend |
| match | 맞는 것 있나? | backend |
| orch | Orchestrate | backend |
| fio | figure-it-out | backend |
| copy | 단계 복사 | backend |
| reply | 답변 | frontend |
| req > prog | | |
| prog > orch | 예 | |
| prog > big | 아니오 | |
| big > fio | 예 | |
| big > match | 아니오 | |
| match > fio | 아니오 | |
| match > copy | 예 | emphasis |
| copy > reply | | emphasis |

@steps id=pm-route-steps
| st-prog | 장기 프로그램? | 여러 날, 쌓인 PR 다수, 조정자 하나 아래 서브에이전트 수십~수백이면 Orchestrate 플레이북으로 간다. 한 에이전트가 세션 예산 안에 끝낼 수 있는 일은 표현이 거창해도 프로그램이 아니다. | pm-route | prog |
| st-big | 크거나 부재? | 여러 호출 지점에 걸친 이전, 여러 부분으로 된 큰 변경, 사용자가 자리를 비우고 나중에 믿고 볼 일이면 Feature 플레이북이 맞아도 `figure-it-out`으로 넘긴다. | pm-route | big |
| st-match | 맞는 것 있나? | 아래 플레이북 표에서 고른다. 맞는 것이 없으면 `figure-it-out`이 맞춤 플레이북을 설계한다. | pm-route | match |
| st-copy | 단계 복사 | 할 일 목록을 연다. 고른 플레이북 단계를 그대로 맨 앞에 복사하고, 작업별 할 일은 그 뒤에 둔다. 하지 않을 단계도 지우지 않고 `skip: <이유>` 한 줄을 남긴다. | pm-route | copy |
| st-reply | 답변 | 진행 중에는 Non-negotiables 조건마다 해당 스킬을 부른다. 마지막 답변은 답변 작성 규칙과 그 플레이북의 Reply 줄을 따른다. PR 링크는 `https://github.com/<owner>/<repo>/pull/<number>` 형식이다. | pm-route | reply |

판정: 원문은 세 갈래의 검사 순서를 번호로 정하지 않는다. 원문의 `routes to **Orchestrate** instead` 문장을 근거로 프로그램 검사를 앞에 두었다.[](source:pb-copy) `figure-it-out`은 맞춤 실행 한 번을 설계하고, Orchestrate 플레이북은 프로그램 전체를 돌린다.[](source:pb-copy)

@callout level=open-question title="Opening a PR 단계는 정말 모든 플레이북 끝에 오나"
`SKILL.md`와 `opening-a-pr.md`는 "다른 모든 플레이북 끝에서 부른다"고 쓴다.[](source:pb-list)[](source:pb-openpr)
그런데 Investigation 플레이북은 "PR 없음"을 명시한다. 두 forensics, Prototype, Multi-phase plan도 PR을 만들지 않는다.[](source:pb-investigation)[](source:pb-runtime)[](source:pb-plan)
판정: 실제 기준은 각 플레이북 단계 안에 Opening a PR 단계가 있는지다. 우선순위는 원문에 명시 없음.

## 플레이북 23개는 각각 언제 쓰나 {#playbooks}

| 플레이북 | 이런 요청 | 남기는 것 | PR |
| --- | --- | --- | --- |
| Investigation | "X는 어떻게 동작하나", "왜 이렇게 만들었나", "확실해?", "X와 Y 중 무엇?" | `how` 모양의 설명, 또는 절충표가 붙은 추천[](source:pb-investigation) | 없음 |
| Bug fix | 보고된 결함 | 재현, 이분 탐색으로 찾은 원인, 수정, 실패→통과 재현 출력[](source:pb-bugfix) | 있음 |
| Perf issue | 잰 느림을 한 번 고치기 | 기준선, 수정 후 수치, 차이, 아티팩트 경로[](source:pb-perf) | 있음 |
| Hillclimb | 지표 하나를 목표까지 반복 개선 | `decision.tsv`, 받아들인 개선마다 커밋 하나[](source:pb-hill) | 있음 |
| Runtime forensics | 살아 있는 증상(누수, 유휴 CPU, 화면 깨짐) | 계측으로 증명한 진단. 수정 없음[](source:pb-runtime) | 없음 |
| Trace forensics | 이미 받은 cpuprofile, trace, spindump, heap snapshot | 소스 위치까지 짚은 진단. 짝 캡처로 확인했는지 표시[](source:pb-trace) | 없음 |
| Feature | 새 동작, 바뀐 동작 | 이름 붙인 데이터 모양, 처리량 점검 4항목, 열린 결정[](source:pb-feature) | 있음 |
| Refactoring | 동작은 그대로 두고 구조만 바꾸기(중소 규모) | 고정한 동작 계약, 동등성 증명, 읽기 부담 변화[](source:pb-refactor) | 있음 |
| Prototype | "프로토타입", "목업", "이 배치로 해 봐", 관찰로 정할 갈림길 | 결정과 버리는 산출물. 실제 구현은 Feature로[](source:pb-proto) | 없음 |
| Visual parity | 픽셀 단위로 같은 UI, 스타일 체계 이전 | 컴포넌트별 이미지 diff 결과[](source:pb-visual) | 컴포넌트·묶음별 |
| Authoring a skill | `SKILL.md` 작성·수정 | `create-skill`로 쓴 스킬, 검증 메모[](source:pb-skill) | 있음 |
| Eval | 스킬·구조·프롬프트 변경을 승격 전에 시험 | 블라인드 후보 N개, 다른 계열 심사 1명, 승격 추천[](source:pb-eval) | 없음 |
| Babysit | "babysit this", "초록으로 만들어", "bugbot 댓글 처리", "X 확인해 줘" | merge-ready 상태와 4열 상태표. 병합하지 않는다[](source:pb-babysit-ci) | 기존 PR |
| Shipping | 초록 스택을 병합해 내보내기 | PR별 독립 판정과 병합된 연속 구간[](source:pb-ship) | 기존 PR 병합 |
| Autonomous run | "끝날 때까지 돌려", "/loop until X" | 확인 가능한 완료 조건과 반복 기록[](source:pb-auto) | 곁가지 수정은 별도 PR |
| Orchestrate | "이 프로젝트 전체", "이 이전 작업을 끝까지 맡아" | 스토어, 검증 장부, frontier. 조정자는 코드를 쓰지 않는다[](source:orch-head) | 단위 작업마다 |
| Autopilot-full | 독립 PR 큐를 전권 자율로 | PR별 소유자가 병합까지. 루트는 판정만[](source:pb-apfull) | 소유자가 병합 |
| Autopilot-stack | "쌓기만 해, 병합은 내가" | 검증된 선형 스택 하나. 운영자가 병합[](source:pb-apstack) | 운영자가 병합 |
| Session pickup | 대화 기록, 클라우드 에이전트 URL, 푸시된 브랜치 이어받기 | 재개 지점. 이전 기록을 믿고 다시 하지 않는다[](source:pb-pickup) | 넘겨받은 플레이북이 정함 |
| Pause safely | 명시적 멈춤, 오프라인, Cursor 재시작, 컨텍스트 압축 임박 | `wip:` 커밋, 재개 메모[](source:pb-pause) | 없음 |
| Multi-phase plan | 여러 단계·여러 PR에 걸친 일 | 계획서만. 구현하지 않는다[](source:pb-plan) | 없음 |
| Worktree cleanup | "디스크 뭐가 차지해", "워크트리 정리", "시뮬레이터 지워" | 정리 전후 `df -h /`, 남긴 이유[](source:pb-wt) | 없음 |
| Opening a PR | 다른 플레이북의 마지막 단계 | 제목·본문·준비 상태 규칙을 지킨 PR[](source:pb-openpr) | 자체 |

이름이 비슷해서 헷갈리는 짝은 아래 기준으로 가른다.

| 헷갈리는 짝 | 가르는 기준 |
| --- | --- |
| Babysit / Shipping | Babysit 플레이북은 `merge-ready` 상태에서 멈추고 병합 권한이 없다. 사용자가 `merge`·`land`·`ship`을 명시하면 Shipping이다[](source:pb-babysit-ci) |
| Perf issue / Hillclimb | 한 번 고치기 / 목표와 완료 조건이 있는 반복 루프[](source:pb-perf)[](source:pb-hill) |
| Runtime / Trace forensics | 살아 있는 프로세스를 계측 / 이미 있는 캡처를 다시 돌리지 않고 읽음[](source:pb-trace) |
| Autonomous run / Orchestrate / `figure-it-out` | 과제 하나를 완료 조건까지 / 에이전트 하나를 넘어서는 여러 날 프로그램 / 맞는 플레이북이 없는 큰 실행 한 번[](source:orch-head) |
| Autopilot-full / Autopilot-stack | PR이 독립적이고 병합 권한이 있음 / 운영자가 병합 전 리뷰를 원하거나, 작업이 순서로 묶였거나, 병합 권한이 없음[](source:pb-apstack) |
| Autopilot-full / Orchestrate | 소유자가 자기 PR을 병합 / 조정자가 검증된 작업을 착지시키고 작업자는 병합하지 않음[](source:pb-apfull) |
| Refactoring / Feature / `figure-it-out` | 동작 유지 / 동작 추가 / 크거나 여러 곳에 걸친 구조 작업[](source:pb-refactor) |
| Multi-phase plan / Autopilot | 계획서를 쓰고 멈춤 / 실행. 계획서가 어느 Autopilot이나 Orchestrate 플레이북으로 실행할지 적는다[](source:pb-plan) |
| Session pickup / Pause safely | 이어받기 / 멈추기. 서로 짝이다[](source:pb-list) |

## 플레이북 안의 수치와 종료 조건은 무엇인가 {#numbers}

| 플레이북 | 수치·종료 조건 |
| --- | --- |
| Feature | 처리량 점검 4항목(먼저 막는 단계, 독립 작업 줄기, 공유 가변 상태, 가장 작은 안전 분해)은 해당 없어도 `n/a: <이유>`로 남긴다. 구현 모양이 여럿이면 `arena` 위임이 의무이고 건너뛸 수 없다[](source:pb-feature) |
| Perf issue | 성능 만트라 7개(하지 마라 → 다시 하지 마라 → 덜 해라 → 나중에 → 안 볼 때 → 동시에 → 더 싸게)를 싼 것부터 시도한다. 앞 단계로 목표에 닿으면 멈춘다[](source:pb-perf) |
| Hillclimb | 변경 하나, 측정 하나, 유지 또는 되돌리기. 측정은 한 번이 아니라 N회 중앙값이다. 완료 조건은 목표와 최소 시도 횟수를 함께 둔다. 원문 예시는 "기준선보다 50% 이상, 최소 10회 반복"이다(예시). 조건을 완화해서 끝내지 않는다[](source:pb-hill) |
| Autonomous run | 첫 반복 전에 확인 가능한 완료 조건을 적는다(테스트 초록, 재현 해결, N개 PR 병합, 픽셀 diff 0은 예시). 정체는 멈춤 사유가 아니다. 조건을 채우거나 진짜 막다른 길일 때만 멈춘다[](source:pb-auto) |
| Visual parity | 이미지 차이가 0이 아니면 실패다. 컴포넌트마다 차이가 0이 될 때까지 `/loop`로 반복한다[](source:pb-visual) |
| Eval | 루브릭은 구체 기준 3~6개이고 심사만 본다. 후보 N개는 서로 다른 모델, 심사 1명은 다른 모델 계열이다[](source:pb-eval) |
| Multi-phase plan | 파일 1~2개에 접근이 뻔하면 계획을 생략한다. 도입은 열 줄 미만이다. PR마다 live 레인 10개와 감사 레인 2개 이상을 둔다. 리뷰 영상은 30~60초, 감사 주기는 `/loop 1h`다[](source:pb-plan)[](source:pb-plan-skel) |
| Autopilot 두 종 | 소유자는 약 15분 안에 `decisions.tsv`를 시작하고, 첫 브랜치를 푸시하고, PR을 준비 상태로 연다. `children.tsv`의 예상 실행 시간은 그 종류의 지난 최장 실행 이상이다. 루트는 1시간마다 감사한다[](source:pb-apfull)[](source:pb-apstack) |
| Orchestrate | 진행 중인 자식은 약 10개까지 회전 창으로 둔다. 중첩은 깊이 3까지 된다. 예산의 약 70%에서 새 생성을 멈추고 검증된 것을 착지시킨다. 재시도는 두 번까지, 그다음은 단위를 포기하고 재계획한다[](source:orch-head)[](source:orch-steps)[](source:orch-stack) |
| Opening a PR | 본문 섹션은 1~3문장 또는 1~3항목이다. squash 본문이 약 40줄을 넘으면 줄인다. 큰 PR 하나보다 좁은 PR 다섯 개가 낫다[](source:pb-openpr) |
| Bugbot 분류 | 패턴 신뢰도는 `candidate`(사례 1~2개), `recurring`(여러 번 실제 dismiss), `strong`(좁고, 반복 검증됐고, 위험이 낮음) 셋이다. 애매하면 묻는다[](source:bugbot) |
| Pause safely | 미커밋 수정은 `wip:` 커밋 하나로 남긴다. 컨텍스트 압축이 이유면 재개 메모를 `/tmp/<slug>-resume.md` 같은 파일에 쓴다[](source:pb-pause) |
| Worktree cleanup | 경로마다 `git worktree remove --force`, 폴더가 남으면 `rm -rf` 뒤 `git worktree prune`. 브랜치 참조(ref)는 남아 커밋을 잃지 않는다[](source:pb-wt) |

## PR은 어떤 길로 병합되나 {#pr-flow}

@workflow id=pm-pr-life title="PR 열기부터 병합까지"
| lane lopen | Opening a PR |
| lane lbaby | Babysit |
| lane lship | Shipping |
| open | PR 열기 | backend | lopen |
| build | 스택 완성 | backend | lopen |
| ask | 돌보기 요청? | external | lbaby |
| mode | 모드 선언 | backend | lbaby |
| ready | merge-ready | backend | lbaby |
| land | 병합 요청? | external | lship |
| verify | PR별 검증 | security | lship |
| ship | 연속 병합 | backend | lship |
| open > build | URL만 | |
| build > ask | | |
| ask > mode | 예 | |
| mode > ready | | |
| ready > land | | |
| land > verify | 예 | emphasis |
| verify > ship | 판정 | emphasis |

@steps id=pm-pr-steps
| sp-open | PR 열기 | Opening a PR. 워크트리에서 작업하고, `draft`가 아닌 준비 상태로 연다. 제목은 `type(scope): subject`. 본문은 Why, What changed, Scope, Tradeoffs, Blast Radius, Verification 순이다. squash 커밋이 약 40줄을 넘으면 본문을 줄인다. 큰 PR 하나보다 좁은 PR 다섯 개를 선호한다. | pm-pr-life | open |
| sp-build | 스택 완성 | PR을 열어도 돌보기를 시작하지 않는다. URL만 남기고 단계나 스택을 끝까지 만든다. 예외는 Autopilot 소유자다. 그 소유자는 브리프가 돌보기를 맡긴다. | pm-pr-life | build |
| sp-ask | 돌보기 요청? | 사용자가 요청해야 Babysit 플레이북이 시작된다. 보통 한 단계나 스택 전체가 만들어진 뒤다. | pm-pr-life | ask |
| sp-mode | 모드 선언 | 폴링 전에 모드를 정한다. `drive`는 merge-ready까지, `background`는 막지 않고 분류, `threads-only`는 리뷰 댓글만, `check`는 상태 한 번 보고. 선언이 없으면 `drive`, 작거나 문서뿐인 PR은 `check`다. | pm-pr-life | mode |
| sp-ready | merge-ready | 가장 아래 미병합 PR(frontier)만 다룬다. 순서는 충돌, 리뷰 스레드, CI다. 충돌은 고치지 않고 어느 브랜치가 rebase해야 하는지 보고한다. 스택 구조는 바꾸지 않는다. GitHub에서는 `watch-pr`의 `READY`에서 멈춘다. 병합은 하지 않는다. | pm-pr-life | ready |
| sp-land | 병합 요청? | `merge`, `land`, `ship`, `merge-when-ready`를 명시한 요청만 병합을 허락한다. `watch-pr`를 다시 켰다는 사실은 병합 허락이 아니다. | pm-pr-life | land |
| sp-verify | PR별 검증 | PR마다 서브에이전트 하나(Cursor 클라우드 에이전트)가 실제 표면에서 부모와 헤드를 비교한다. 코드를 쓰지 않은 에이전트의 `PASS`, `PASS+NOTES`, `FAIL`만 판정이다. CI 초록과 봇 승인은 판정이 아니다. | pm-pr-life | verify |
| sp-ship | 연속 병합 | 아래에서부터 판정이 이어진 구간만 병합한다. 판정 때의 `patch-id`가 지금과 같은지 다시 확인한다. 맨 아래 PR만 준비해 하나씩 squash하고, 병합마다 다시 계산한다. 끊긴 지점에서 멈추고 다음 PR에 무엇이 필요한지 보고한다. | pm-pr-life | ship |

이 흐름은 Opening a PR, Babysit, Shipping 세 플레이북을 이은 것이다.[](source:pb-openpr)[](source:pb-openpr-babysit)[](source:pb-babysit-mode)[](source:pb-babysit-watch)[](source:pb-ship)

| 규칙 | 수치·조건 |
| --- | --- |
| CI flake·인프라 실패 | 새 빌드 한 번만. job 재시도는 하지 않는다. 같은 실패가 또 나면 일시적 실패가 아니다[](source:pb-babysit-ci) |
| 변경이 닿지 않은 코드의 실패 | base 브랜치가 낡은 것으로 보고 `git merge-base --is-ancestor`로 확인한 뒤 rebase 필요로 보고[](source:pb-babysit-ci) |
| Bugbot 회차 | 세 번째 회차부터 문서화된 패턴은 dismiss 쪽으로 기운다. 보안, 인증, 결제, 데이터, 마이그레이션은 직접 dismiss하지 않고 올린다[](source:pb-babysit-ci) |
| 리뷰 댓글 본문 | 신뢰하지 않는 데이터로 다룬다. 셸 명령에 끼워 넣지 않고 JSON 파일로 답한다[](source:pb-babysit-watch)[](source:pb-babysit-ci) |
| forge 선택 | 기본은 `gh`. `command -v origin`이 성공하고 저장소를 해석하면 `origin`. Graphite(`gt`)는 요구하지 않는다[](source:pb-babysit-mode) |
| 멈춤 | 명시적 stop이나 forge별 멈춤 조건만 루프를 끝낸다. 중간 질문에는 답하고 계속한다[](source:pb-babysit-watch) |

## 무엇을 묻지 않고 하고, 어디서 멈추나 {#autonomy}

| 구분 | 원문 규칙 |
| --- | --- |
| 그냥 한다 | 모든 MCP 도구를 쓴다. 되돌릴 수 있는 일과 외부 행동(팀 채팅, 티켓 갱신, eval 시작)은 묻지 않는다[](source:autonomy) |
| 항상 멈춘다 | 되돌릴 수 없는 쓰기. 공유 브랜치 force-push, 배포, 데이터 삭제, 고객 메시지[](source:autonomy) |
| 세션 덮어쓰기 | "멈추지 마", "자러 간다", "끝날 때까지", "완전 자율"이면 계속한다[](source:autonomy) |
| 아니오도 답이다 | 해도 되냐고 묻거나 범위 추가를 권하면 진짜 판단으로 답한다. 동의가 기본값이 아니다[](source:autonomy) |

질문하기 전에도 지킬 규칙이 있다.[](source:nn-ask)

- 실행해서 알 수 있는 사실(동작, 타이밍, 레이아웃, 출력, 성능, eval 결과가 갈리는지)은 사람에게 묻지 않는다.
- 실험으로 정할 수 없는 제품·취향 문제만 묻는다.
- 전권 자율(autonomy grant) 아래에서는 권한 안의 결정을 직접 하고 보고한다.
- 운영자만 정할 수 있는 결정은 기본값을 적용하고 이유를 충분히 설명한다. 운영자가 대신 지시할 수 있는 내용도 평문으로 적는다.
- 짧은 회신 단어를 입력하라고 하지 않는다. 운영자는 자기 말로 답한다.

@callout level=warning title="전권 자율이어도 남는 사람 승인 지점"
운영자가 직접 지정한 승인 지점과 Always-pause 목록은 전권 자율 아래에서도 운영자가 정한다.[](source:nn-ask)
Pause safely 플레이북은 명시적 요청일 때만 쓴다. "계속해", "자러 간다, 계속해", "멈추지 마"에는 멈추지 않는다.[](source:pb-pause)

플레이북마다 사람이 끼어드는 지점이 따로 있다.

| 플레이북 | 사람 승인 지점 |
| --- | --- |
| Bug fix | 사용자에게 재현을 부탁하는 것은 control 표면이 닿지 못하는 구체적 이유가 있고, 끝까지 시도한 뒤뿐이다[](source:pb-bugfix) |
| Visual parity | 기준선이 틀려 보이면 고치지 않고 멈춰서 묻는다[](source:pb-visual) |
| Babysit | 소유자 승인은 고칠 대상이 아니라 기다릴 대상이다. 병합은 명시 요청만[](source:pb-babysit-ci) |
| Bugbot 분류 | 새롭거나 심각하거나 보안·개인정보·데이터 관련이거나 애매하면 사용자에게 묻는다(ask)[](source:bugbot) |
| Multi-phase plan | 계획을 넘기고 멈춘다. 운영자의 명시적 go 뒤에 실행한다. 상호작용을 바꾸는 PR은 스크린샷과 30~60초 영상으로 운영자가 리뷰한다[](source:pb-plan)[](source:pb-plan-skel) |
| Autopilot 두 종 | 운영자가 지정한 항목은 운영자가 클릭한다. 계획을 말해 달라는 요청은 go가 아니다. stop이면 모든 소유자가 즉시 쓰기를 멈춘다[](source:pb-apfull)[](source:pb-apstack) |
| Orchestrate | 되돌릴 수 없는 행동, 실험으로 못 정하는 제품 결정, 현실과 어긋난 standing order, 재계획 뒤에도 남은 막다른 길만 사람에게 간다. `gates.md`에 묶어 둔다[](source:orch-esc) |
| Worktree cleanup | `wip:N`(추적 중인 미커밋 수정 N개)은 변경 내용을 보여 주고 결정을 받는다. 고정된 채팅 목록은 사용자나 사이드바에서 받는다[](source:pb-wt) |
| Autonomous run | 되돌릴 수 없는 행동, 제품·취향 결정, 진짜 막다른 길만 드러낸다[](source:pb-auto) |

## 서브에이전트는 어떻게 쓰나 {#subagents}

@facts
| 플레이북 단계 안의 서브에이전트 | `subagent_type: "poteto-agent"` |
| 라우팅된 스킬 | `how`, `why`, `interrogate`, `reflect`, `swarm`은 스스로 정한 `subagent_type`을 쓴다. 덮어쓰지 않는다 |
| Task 기본값 | `run_in_background: true`, agent 모드(`readonly`는 MCP 도구를 뺀다), 맥락은 붙여 넣지 말고 파일 경로로 |
| 코드 기본 모델 | `grok-4.7-xhigh-fast` |
| 글·판단 기본 모델 | `claude-opus-5-5-max` |
| 가장 어려운 변경 | 가장 강한 판단 모델(`claude-opus-5-5-max`). 횡단 설계, 까다로운 동시성, 미묘한 알고리즘 |
| 사소한 기계적 수정 | 빠른 코드 모델 |

위 값은 `SKILL.md`의 Subagents 절에 있다.[](source:subagent-type)[](source:subagent-defaults) 모델은 `/setup-pstack`이 쓰는 규칙 파일로 바꿀 수 있다.[](source:setup-rule)

- 역할 줄이 있으면 이 기본값과 라우팅된 스킬의 모델 선택을 덮어쓴다. 줄이 없는 역할은 기본값을 쓴다.
- 값이 `inherit-parent`나 `auto`면 `Task` 호출에서 `model`을 빼고 부모 채팅 모델로 돌린다.
- 읽는 줄 이름: 코드 플레이북은 `feature, refactoring`, `bug-fix`, `perf-issue`, `hillclimb`, 가장 어려운 변경은 `hardest tasks`, 글과 판단은 `judgment and prose`.[](source:subagent-defaults)

| 규칙 | 내용 |
| --- | --- |
| 결과 책임 | 리드가 모든 서브에이전트의 작업을 책임진다. 변경분을 직접 리뷰하고 요약도 직접 쓴다. 서브에이전트의 말을 그대로 넘기지 않는다[](source:subagent-own) |
| 두 번째 의견 | 같은 프롬프트를 다른 모델에 준다. 둘이 일치하면 신호가 강하다[](source:subagent-own) |
| 기본은 새 서브에이전트 | 수정 회차, 후속 작업, 재시도, 다음 큐 항목은 새 서브에이전트에게 준다. 원래 브리프, 그 뒤 지시 전부, 이전 보고서와 브랜치를 합친 범위를 넘긴다[](source:subagent-own) |
| 재사용 예외 | 옮기기 비싼 상태가 그 에이전트에만 있을 때만 이어 쓴다. 로컬 체크아웃, 미커밋 변경, 개발 서버·시뮬레이터·babysit watcher 같은 실행 중 프로세스[](source:subagent-own) |
| 재개 사슬 금지 | 끼어들어 이어 붙인 재개는 지시를 조용히 잃는다. "완료" 요약을 믿지 말고 새로 띄운다[](source:subagent-own) |

## 답변은 어떻게 쓰나 {#reply}

답변 규칙은 다 쓴 뒤 고치는 것이 아니라 쓰는 동안 지킨다. 다 쓴 뒤 정리해서는 이 패턴이 빠지지 않는다고 원문이 못 박는다.[](source:reply)

- 짧은 평서문을 쓴다. 한 문장에 생각 하나, 마침표로 끝낸다.[](source:reply)
- 긴 대시 문자를 어디에도 쓰지 않는다. 파일 목록 항목과 굵은 소제목도 문장으로 쓴다.[](source:reply)
- 문장 중간을 잇는 콜론도 쓰지 않는다(`unslop` 14번 규칙). 목록 앞 콜론은 괜찮다.[](source:reply)
- 짧게 쓴다고 내용을 빼지 않는다. 플레이북 Reply 줄이 요구한 세부, 절충, 선택, 열린 결정은 남긴다.[](source:reply)
- 누구를 위한 일이고 그 사람에게 무엇이 바뀌는지를 구현 세부보다 먼저 쓴다. 다음에 이 코드를 맡을 엔지니어가 물려받는 것도 쓴다.[](source:reply)
- 링크, 인용, 대화 기록 참조를 지어내지 않는다. 이번 세션에 만들거나 읽은 것만 링크한다.[](source:reply)
- 모든 주장에 같은 문장 안에서 근거나 표시(측정, 추론, 추측)를 붙인다. 직접 돌려 볼 수 있는 확인을 사람에게 넘기지 않는다.[](source:reply)

주석도 같은 규칙을 따른다. 코드가 보여 줄 수 없는 이유만 주석으로 남긴다. 검증·테스트 스크립트에는 `// Phase 1: add cards` 같은 단계 해설 주석을 달지 않고, 단언 메시지가 단계를 설명하게 한다. 서브에이전트의 diff에도 적용한다.[](source:comments)

## 스크립트는 무엇을 읽고 쓰나 {#scripts}

스크립트는 모두 `scripts/` 아래에 있다. 이 분석에서는 실행하지 않았다. 아래 내용은 소스를 읽고 정리한 지시상 동작이다.

| 스크립트 | 언제 쓰나 | 읽는 것 | 쓰는 것 |
| --- | --- | --- | --- |
| `watch-pr/watch-pr` | Babysit 6단계에서 GitHub PR 상태를 본다. `check` 모드는 `--status-only`. Shipping 8단계는 `--queued-stack --stack-prs <bottom>`을 깨우기 신호로만 쓴다[](source:pb-babysit-watch)[](source:pb-ship) | `gh pr view`, `gh pr checks`, `gh pr list`, `gh api graphql`(리뷰 스레드, 체크 롤업, 커밋 상태), `git remote get-url origin`[](source:s-watch-gh) | 표준 출력만. 기본은 JSON, 폴링 중에는 줄 단위 JSON, `--pretty`면 사람용 표[](source:s-watch-cli) |
| `orch/orch.ts` | Orchestrate 2단계 `orch init`과 `orch frontier set`. 드레인마다 `inbox push`·`inbox drain`, `unit add`·`unit set`, `ledger record`·`ledger check`, `status`[](source:orch-steps) | `--store` 또는 `ORCH_STORE` 폴더. `frontier set`은 `gt log short --stack --reverse`, `gt info`, `git rev-parse`를 부른다[](source:s-orch)[](source:s-store-gt) | `units.tsv`, `ledger.tsv`, `inbox/*.tsv`, `gates.md`, `preferences.md`, `frontier.json`, `status.md`, 잠금 파일 `.orch.lock`[](source:s-store-init) |
| `check-plan.mjs` | Multi-phase plan 6단계. 출력된 줄을 모두 고친다[](source:pb-plan) | 계획서 Markdown 파일 하나 | PR 섹션별 칸 수를 출력한다. 문제는 `파일:줄: 메시지`로 `stderr`에 쓰고 종료 코드 1[](source:s-check-out) |
| `worktree-audit.sh` | Worktree cleanup 1단계. 대화 기록 검색이 느려 백그라운드로 돌린다[](source:pb-wt) | `git worktree list`, `git fetch origin main`, `gh pr list --author @me`, `du`, `git status`, `~/.cursor/projects/<slug>/agent-transcripts`[](source:s-wta) | 크기순 표만 출력한다. 아무것도 지우지 않는다[](source:s-wta) |
| `bootstrap.ts` | `watch-pr`, `orch`를 실행할 때마다 먼저 돈다[](source:s-watch-entry) | `package.json`과 `bun.lock`의 해시, `node_modules/commander`[](source:s-boot) | 해시가 다르거나 없으면 `bun install --frozen-lockfile`, 설치 키 파일을 쓰고 같은 명령을 다시 실행한다[](source:s-boot) |

`watch-pr`은 이렇게 판정한다.

- 모드는 PR 하나(기본), `--stack`(이어진 열린 스택), `--queued-stack`(고정된 아래→위 목록) 셋이다.[](source:s-watch-cli)
- 스택에서는 위치보다 종류가 먼저다. 어느 PR이든 충돌부터 보고, 리뷰 스레드, CI, 병합 게이트 순으로 본다.[](source:s-watch-policy)
- `Code Review Gate` 체크는 대기 목록에서 뺀다. 사람 승인을 기다리느라 `watch-pr`가 멈추지 않게 하려는 것이다.[](source:s-watch-gate)
- Bugbot 회차는 댓글의 `RUN_ID`, `CURSOR_AUTOMATION_ID` 값을 세어 구한다. Babysit 플레이북의 "세 번째 회차" 규칙이 이 수를 쓴다.[](source:s-watch-bugbot)[](source:pb-babysit-ci)
- 사람용 출력은 PR, CI, Review, Merge 4열 표다.[](source:s-watch-render)

@facts
| 폴링 간격 | 60초 |
| 스택 전체 훑기 간격 | 300초 |
| 제한 시간 | 0(끔) |
| 연속 조회 실패 허용 | 5회 |
| 재시도 대기 | `min(max(간격, 60) × 2^(실패−1), 300)`초 |
| 종료 코드 0 | `READY`, `COMPLETE`, `--status-only` 결과 |
| 종료 코드 2·3·4·6 | 충돌, 미해결 리뷰 스레드, 실패한 체크, 병합 게이트(draft, 변경 요청, 닫힘) |
| 종료 코드 5·7·64 | 시간 초과, 상태 조회 실패, 잘못된 인자 |

위 수치는 `cli.ts` 기본값과 `policy.ts`, `types.ts`에서 읽었다.[](source:s-watch-cli)[](source:s-watch-policy)[](source:s-watch-types)

`orch`는 장부를 이렇게 다룬다.

- 검증 판정은 `live-ui-verified`, `unit-test-verified`, `type-check-only`, `verifier-blocked`, `verifier-failed` 다섯 가지다.[](source:s-store-ledger)
- PR 번호와 head SHA 값을 키로 한 줄씩 덮어쓴다. 기록이 없으면 `ledger check`가 `NOT-VERIFIED`를 내고 종료 코드 2로 끝난다.[](source:s-store-ledger)
- `frontier set`은 세대 번호를 하나 올리고, 첫 `OPEN` 상태 PR을 가장 낮은 미병합 PR로 적는다.[](source:s-store-frontier)
- 쓰기마다 pid 잠금을 잡는다. 주인 프로세스가 죽었으면 바꿔 잡고, 살아 있으면 `--force`일 때만 빼앗는다.[](source:s-store-lock)
- `orch status`는 개수, 바뀐 것, 열린 게이트 세 줄을 출력한다.[](source:s-orch-status)
- 판정: 스토어 목록의 `overview.md`, `decisions.tsv`는 `orch init`이 만들지 않는다. 조정자가 직접 쓴다.[](source:orch-store)[](source:s-store-init)

`check-plan.mjs`는 다음을 검사한다.[](source:s-check)[](source:pb-plan-skel)

- 코드 블록 밖의 긴 대시, 둥근 따옴표, 문장 중간 콜론.
- 열 줄 미만의 도입부와 "How to read this" 절의 필수 문구.
- PR 섹션마다 아홉 소블록(Depends on, Files, Build, You see, Verify unit·live·perf, Review gate, Merge)의 순서.
- live 검증의 Lane 1~10. 레인마다 스크린샷 이름과 `Pass when`이 있어야 한다.
- perf 검증의 Metric, Probe, Baseline, Rule 네 칸.

`worktree-audit.sh`는 워크트리마다 버킷을 하나 붙인다.[](source:s-wta-bucket)

- 추적 중인 미커밋 수정이 있으면 `hold-wip`, 열린 PR이 있으면 `hold-open-pr`.
- 마지막 채팅이 4일 이내면 `verify-recent-chat`.
- `origin/main`에 병합됐거나 열리지 않은 PR이 있으면 `safe`, 나머지는 `review`.

플레이북은 이 버킷을 허락이 아니라 조언으로 본다. 사용자가 고정한 워크트리를 `safe`로 표시한 일이 있었기 때문이다.[](source:pb-wt)

@callout level=warning title="Graphite(gt) 사용이 플레이북마다 다르다"
Babysit, Shipping, Opening a PR, 두 Autopilot 플레이북은 "`gt`를 요구하지 않는다"고 쓴다.[](source:pb-babysit-mode)[](source:pb-ship)
Orchestrate 플레이북은 `frontier.json`을 `gt`로 다시 계산하고, 스택마다 stacker 하나만 `gt`를 돌리게 한다. `orch frontier set`도 `gt`를 직접 부른다.[](source:orch-stack)[](source:s-store-gt)
판정: Orchestrate 플레이북을 쓰려면 stacker 역할의 클론에 `gt`가 있어야 한다. 다른 플레이북의 "gt 금지"와 어떻게 맞추는지는 원문에 명시 없음.

## 흐름 속 위치 {#position}

@workflow id=pm-position title="poteto-mode 앞뒤의 스킬"
| setup | setup-pstack | backend |
| help | poteto-help | backend |
| pm | poteto-mode | backend |
| fio | figure-it-out | backend |
| smyw | show-me-your-work | backend |
| skills | 트리거 스킬 | backend |
| setup > pm | 모델 규칙 | |
| help > pm | 일 요청 | |
| pm > fio | 넘김 | emphasis |
| pm > smyw | 결정 기록 | emphasis |
| pm > skills | 호출 | emphasis |

| 받는 것 / 넘기는 것 | 상대 | 조건 | rel-id |
| --- | --- | --- | --- |
| 받음: 역할별 모델 | `setup-pstack` | `~/.cursor/rules/pstack-models.mdc`의 역할 줄. 없으면 기본 모델 | r14 |
| 받음: 사용자 요청 | `poteto-help` | 도움 질문이 아니라 일 요청일 때 | r20 |
| 받음: 이어받을 채팅 | `recall` | 특정 채팅 하나를 이어받는 일이면 Session pickup 플레이북 | r46 |
| 넘김: 과제 | `figure-it-out` | 크거나 여러 곳에 걸친 작업, 자리 비운 뒤 검토할 작업, 맞는 플레이북 없음 | r11 |
| 넘김: 결정 | `show-me-your-work` | 길거나 자율적이거나 여러 단계인 작업. 위험이 크면 커밋 | r10 |
| 위임 후 복귀 | `how`, `architect`, `swarm`, `arena`, `interrogate`, `unslop`, `technical-writing`, `no-comments`, `benchmark-checklist` | Non-negotiables 조건 | r01~r09 |
| 참고 | 원칙 24개 | 적용할 때 그 원칙의 `SKILL.md`를 끝까지 읽음 | r12, r13 |

`reflect`는 라우팅된 스킬 목록에 이름만 있고 호출 조건이 없다(r15).[](source:subagent-type) 범위 밖 스킬(`deslop`, `create-skill`, `control-cli`, `control-ui`)은 r16이다. 전체 흐름은 `pstack/_group-run/run.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: 원본 텍스트 파일 44개, 합계 326,154B. `SKILL.md`, 플레이북 23개, `references/bugbot-triage.md`, `scripts/` 아래 19개(테스트 포함)다. 파일별 경로·바이트·역할은 `skill-explainers/pstack/poteto-mode/files.md`에 있다.
- 제외한 파일: `scripts/bun.lock`(6679B, 의존성 잠금 파일)과 `*.KO.md` 25개(원본이 있는 번역본).
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 스크립트와 테스트를 실행하지 않았다. 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 원본 파일: 없음.
- 플레이북은 `pstack/skills/poteto-mode/...` 경로를 쓴다(예: `check-plan.mjs` 실행 명령, `git show origin/main:` 목록). 이 저장소의 실제 경로는 `pstack/poteto-mode/...`다.[](source:pb-plan)

@callout level=open-question title="확인하지 못한 것"
`mode: true`와 `reminder`를 런타임이 어떻게 읽는지는 원문에 명시 없음.
Opening a PR 플레이북의 "모든 플레이북 끝" 규칙과 PR을 만들지 않는 플레이북 사이의 우선순위는 원문에 명시 없음.
`reflect`의 호출 조건은 원문에 없다(r15).
Bug fix 5단계가 가리키는 `tdd` 스킬은 `pstack/` 안에 없다. 범위 밖인지 끊긴 참조인지는 확인하지 못했다.[](source:pb-bugfix)
Orchestrate 플레이북의 `gt` 사용과 다른 플레이북의 "`gt` 요구 금지"를 어떻게 맞추는지는 원문에 명시 없음.
