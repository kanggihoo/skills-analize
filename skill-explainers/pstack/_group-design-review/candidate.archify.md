# 설계·병렬 시도·리뷰 묶음(design-review)은 어떻게 이어지나 {#design-review-group}

이 묶음은 구현 전에 코드의 모양을 정하고, 여러 번 시도한 결과를 합치고, 리뷰하는 스킬 다섯 개다. 중심은 `architect`다. `architect`는 `how`·`why`로 바탕을 조사하고, `arena`로 설계 후보를 여럿 만든 뒤 구현한다.[](source:arch-ground)[](source:arch-sketch)

- `arena`는 같은 과제를 여러 후보에게 맡기고, base(기반이 되는 후보)를 고른 뒤 다른 후보의 좋은 부분을 graft(진 후보의 장점을 base에 합치기)한다. `swarm`은 일을 slice(일을 나눈 한 조각)로 나누거나 race(같은 일을 여럿이 경쟁)시켜서 보고서 하나를 돌려준다.[](source:pm-fan)[](source:help-close)
- `interrogate`는 여러 모델에게 변경을 적대적으로 리뷰시킨다. 변경을 자동으로 적용하지 않는다.[](source:int-deliver)
- `no-comments`는 리뷰 전에 주석을 정리한다. 수정에 모양이 필요하면 `architect`를 한 번 돌리고, `architect`는 스케치에서 멈춘다.[](source:nc-arch)
- `poteto-mode`는 조건이 맞으면 다섯 스킬을 모두 부른다.[](source:pm-arch)[](source:pm-fan)[](source:pm-int)[](source:pm-nocomm)

@answer scope="pstack/design-review 묶음 · 스킬 5개와 호출 대상의 SKILL.md · 커밋 5760176 · 관계는 relations.md의 rel-id 기준"
@meta locale=ko
@source arch-fm title="pstack/architect/SKILL.md · 5675B · frontmatter" path=pstack/architect/SKILL.md lines=1:5
@source arch-ground title="pstack/architect/SKILL.md · Phase A 바탕 조사" path=pstack/architect/SKILL.md lines=23:27
@source arch-sketch title="pstack/architect/SKILL.md · Phase B arena 실행" path=pstack/architect/SKILL.md lines=31:33
@source arch-agree title="pstack/architect/SKILL.md · Phase C 중간 확인과 interrogate" path=pstack/architect/SKILL.md lines=45:51
@source arch-impl title="pstack/architect/SKILL.md · Phase D 구현" path=pstack/architect/SKILL.md lines=55:57
@source arch-scrap title="pstack/architect/SKILL.md · Phase E 다시 설계" path=pstack/architect/SKILL.md lines=74:79
@source arch-exhaust title="pstack/architect/SKILL.md · Phase B 두 번 설계" path=pstack/architect/SKILL.md lines=35:35
@source arch-scrap-pr title="pstack/architect/SKILL.md · Phase E 원칙 안내" path=pstack/architect/SKILL.md lines=61:61
@source arch-tmpl title="pstack/architect/references/rationale-template.md · 3050B · 승인 단계 이름" path=pstack/architect/references/rationale-template.md lines=35:35
@source arch-runner title="pstack/architect/references/runner-prompt.md · 3087B · 러너 작업 폴더" path=pstack/architect/references/runner-prompt.md lines=3:3
@source arena-pick title="pstack/arena/SKILL.md · Phase D 기반 고르기 원칙" path=pstack/arena/SKILL.md lines=49:49
@source arena-fm title="pstack/arena/SKILL.md · 4973B · frontmatter" path=pstack/arena/SKILL.md lines=1:5
@source arena-graft title="pstack/arena/SKILL.md · Phase E 접붙이기 원칙" path=pstack/arena/SKILL.md lines=57:57
@source arena-verify title="pstack/arena/SKILL.md · Phase F 확인 원칙" path=pstack/arena/SKILL.md lines=65:65
@source arena-runners title="pstack/arena/SKILL.md · Phase A 러너와 출력 위치" path=pstack/arena/SKILL.md lines=28:29
@source arena-judge title="pstack/arena/SKILL.md · Phase C 교차 심사" path=pstack/arena/SKILL.md lines=41:41
@source swarm-fm title="pstack/swarm/SKILL.md · 2949B · frontmatter" path=pstack/swarm/SKILL.md lines=1:5
@source swarm-model title="pstack/swarm/SKILL.md · 워커 모델" path=pstack/swarm/SKILL.md lines=25:25
@source int-fm title="pstack/interrogate/SKILL.md · 5054B · frontmatter" path=pstack/interrogate/SKILL.md lines=1:5
@source int-deliver title="pstack/interrogate/SKILL.md · 산출물과 자동 적용 금지" path=pstack/interrogate/SKILL.md lines=9:11
@source int-model title="pstack/interrogate/SKILL.md · 리뷰어 모델" path=pstack/interrogate/SKILL.md lines=36:36
@source nc-fm title="pstack/no-comments/SKILL.md · 2560B · frontmatter" path=pstack/no-comments/SKILL.md lines=1:5
@source nc-sicko title="pstack/no-comments/SKILL.md · Step 1 Comment Sicko" path=pstack/no-comments/SKILL.md lines=19:19
@source nc-howwhy title="pstack/no-comments/SKILL.md · Step 2 판정 검토" path=pstack/no-comments/SKILL.md lines=20:20
@source nc-arch title="pstack/no-comments/SKILL.md · Step 3 architect 실행" path=pstack/no-comments/SKILL.md lines=21:21
@source nc-principles title="pstack/no-comments/SKILL.md · Step 4 원칙 안내" path=pstack/no-comments/SKILL.md lines=22:22
@source pm-arch title="pstack/poteto-mode/SKILL.md · 20559B · architect 트리거" path=pstack/poteto-mode/SKILL.md lines=22:22
@source pm-fan title="pstack/poteto-mode/SKILL.md · swarm, arena 트리거" path=pstack/poteto-mode/SKILL.md lines=23:23
@source pm-int title="pstack/poteto-mode/SKILL.md · interrogate 트리거" path=pstack/poteto-mode/SKILL.md lines=24:24
@source pm-nocomm title="pstack/poteto-mode/SKILL.md · no-comments 트리거" path=pstack/poteto-mode/SKILL.md lines=29:29
@source pm-subtype title="pstack/poteto-mode/SKILL.md · 스킬별 subagent_type" path=pstack/poteto-mode/SKILL.md lines=93:93
@source help-table title="pstack/poteto-help/SKILL.md · 12884B · 설계·리뷰 스킬 표 행" path=pstack/poteto-help/SKILL.md lines=66:72
@source help-close title="pstack/poteto-help/SKILL.md · 헷갈리는 짝 구분" path=pstack/poteto-help/SKILL.md lines=93:95
@source setup-panel title="pstack/setup-pstack/SKILL.md · 5548B · 패널 역할 설명" path=pstack/setup-pstack/SKILL.md lines=31:31
@source setup-roles title="pstack/setup-pstack/SKILL.md · arena·swarm·architect·interrogate 역할 줄" path=pstack/setup-pstack/SKILL.md lines=61:65
@source fio-arch title="pstack/figure-it-out/SKILL.md · 4059B · architect 실행 조건" path=pstack/figure-it-out/SKILL.md lines=30:30
@source br-arena title="pstack/blast-radius/SKILL.md · 3851B · arena 실행 조건" path=pstack/blast-radius/SKILL.md lines=38:38
@source how-fm title="pstack/how/SKILL.md · 3077B · frontmatter" path=pstack/how/SKILL.md lines=1:5
@source why-fm title="pstack/why/SKILL.md · 10360B · frontmatter" path=pstack/why/SKILL.md lines=1:5

## architect 흐름에서 다른 스킬은 어디에 쓰이나 {#flow span=12}

`architect`는 바탕 조사, 스케치, 합의, 구현, 폐기의 다섯 단계를 진행한다. 그중 다른 스킬에 맡기는 부분만 그렸다.[](source:arch-ground)[](source:arch-sketch)[](source:arch-agree)[](source:arch-scrap)

@workflow id=architect-flow title="architect 진행 흐름"
| how | how | backend |
| why | why | backend |
| arena | arena | backend |
| int | interrogate | security |
| impl | 구현 | frontend |
| how > arena | 동작 모델 | |
| why > arena | 계층 변경 | dashed |
| arena > impl | 합친 설계 | emphasis |
| arena > int | 선택 | dashed |
| int > impl | 리뷰 후 | |

@steps id=architect-steps
| s-how | how | `how`가 새 코드가 닿는 모든 시스템의 동작을 조사한다. 완전히 새 코드라 붙을 시스템이 없을 때만 건너뛴다. | architect-flow | how |
| s-why | why | 설계가 소유권이나 계층을 다시 정할 때만 `why`를 돌린다. `why`는 기존 모양이 그렇게 생긴 이유를 추측이 아닌 제약으로 바꿔 준다. | architect-flow | why |
| s-arena | arena | `architect`가 설계 과제와 바탕 조사 결과를 runner들에게 같은 프롬프트로 넘긴다. `arena`는 후보 중 base를 고르고 다른 후보의 좋은 부분을 graft해서 설계 하나로 합친다. | architect-flow | arena |
| s-int | interrogate | 구현 전에 합친 설계에 적대적 압박을 주고 싶을 때만 `interrogate`를 돌린다. 기본 흐름에는 들어 있지 않다. | architect-flow | int |
| s-impl | 구현 | `architect`가 합친 스케치를 계약으로 삼아 나머지를 채운다. 기본으로는 사람 확인 없이 바로 구현한다. | architect-flow | impl |

그림에 없는 되돌림이 두 가지 있다. 구현이 스케치로 감당할 수 없는 마찰을 계속 만들어 내면, `architect`는 이미 지은 코드에 `how`를 다시 돌리고 `arena` 단계로 돌아간다.[](source:arch-scrap) 사용자가 "with checkpoint"처럼 명시적으로 요청하면, `architect`는 구현 전에 멈추고 승인을 기다린다. 사람이 모양에 반대하면, `architect`는 바탕 조사부터 다시 한다.[](source:arch-agree)

각 스킬의 내부 단계는 `pstack/architect/architect.html`, `pstack/arena/arena.html`, `pstack/interrogate/interrogate.html`에 있다. `how`·`why`는 `pstack/_group-understand/understand.html`에 있다.

## no-comments 안의 architect 위임 {#no-comments}

@sequence id=no-comments-seq title="no-comments 안의 architect 위임"
| actor nc | no-comments | backend |
| actor sicko | Comment Sicko | external |
| actor arch | architect | backend |
| nc | sicko | 리뷰 범위 |
| sicko | nc | 보고서와 diff | return |
| nc | arch | 모양이 필요한 수정 | emphasis |
| arch | nc | 설계 스케치 | return |

@steps id=no-comments-steps
| s-nc | no-comments | `subagent_type: "Comment Sicko"`로 서브에이전트를 띄우고 리뷰 범위만 넘긴다. 서브에이전트가 돌려준 지적은 `no-comments`가 검토해서 받아들일 것만 고른다. | no-comments-seq | nc |
| s-sicko | Comment Sicko | 범위 안의 주석을 검사해서 보고서와 수정안을 `no-comments`에 돌려준다. `Comment Sicko`는 스킬이 아니라 서브에이전트 종류다. | no-comments-seq | sicko |
| s-arch | architect | 받아들인 지적 전체와 그 주변 코드를 대상으로 `architect`를 한 번만 돌린다. `architect`는 스케치에서 멈추고, 구현은 `no-comments` 4단계가 한다. | no-comments-seq | arch |

`no-comments`는 수정 중 하나라도 모양을 정해야 할 때만 `architect`를 부른다(r66).[](source:nc-arch) 단순한 지적은 `no-comments`가 직접 고친다.[](source:nc-arch)

## arena·swarm 비교 {#compare}

| 기준 | `arena` | `swarm` |
| --- | --- | --- |
| 일을 나누는 방식 | 모든 후보가 같은 과제를 받는다[](source:help-close) | slice로 나누거나 같은 과제로 race시킨다[](source:help-close) |
| 결과 | base에 진 후보의 좋은 부분을 graft한 결과 하나[](source:arena-fm) | 보고서 하나[](source:swarm-fm) |
| `poteto-mode`가 고르는 조건 | 설계나 코드의 경합, base 고르기와 graft(r04) {good:설계 경합}[](source:pm-fan) | 커버리지 표, race, gauntlet, 탐색 분할(r03) {good:병렬 확인}[](source:pm-fan) |
| 이 묶음 안의 연결 | `architect`, `blast-radius`가 부른다(r62, r50) | 원장상 묶음 안의 다른 스킬과 직접 연결이 없다 |

판정: `swarm`은 `arena`와 함께 "병렬로 나눠 돌리기"의 선택지로만 이 묶음에 속한다. `architect` 흐름에는 나오지 않는다.[](source:pm-fan)[](source:arch-sketch)

`interrogate`와 `blast-radius`도 헷갈리기 쉽다. `interrogate`는 diff 자체를 리뷰하고, `blast-radius`는 diff 밖의 파손을 찾는다.[](source:help-close)

## 관계와 조건 {#relations}

| rel-id | from → to | 종류 | 조건·강도 | 그림 |
| --- | --- | --- | --- | --- |
| r60 | `architect` → `how` | 내부 위임 | 첫 단계(Phase A)에서 새 코드가 닿는 모든 시스템에 실행한다. 구현이 어긋나면 다시 실행한다.[](source:arch-ground)[](source:arch-scrap)[](source:how-fm) | 동작 모델 간선(재실행은 생략) |
| r61 | `architect` → `why` | 내부 위임 | 설계가 소유권이나 계층을 다시 정할 때만[](source:arch-ground)[](source:why-fm) | 계층 변경 간선 |
| r62 | `architect` → `arena` | 내부 위임 | Phase B. `references/runner-prompt.md`를 각 runner 프롬프트로 넘긴다. runner 모델은 `architect runners` 줄. 구현이 어긋나면 스케치 단계(Phase B)로 돌아가 다시 실행[](source:arch-sketch)[](source:arch-scrap) | arena 노드(되돌림은 생략) |
| r63 | `architect` → `interrogate` | 내부 위임 | 구현 전에 설계에 적대적 압박을 주고 싶을 때(선택)[](source:arch-agree) | 선택 간선 |
| r64 | `architect` → `principle-foundational-thinking`, `principle-outcome-oriented-execution` | 참고 | 골격을 먼저 commit하고 계획된 중간 파손을 허용하는 판단의 근거로 참고한다.[](source:arch-agree) | 생략 |
| r65 | `arena` → `principle-separate-before-serializing-shared-state` | 참고 | 후보마다 출력 위치를 따로 준다(worktree 또는 `/tmp/arena-<slug>/candidate-<n>/`)[](source:arena-runners) | 생략 |
| r110 | `no-comments` → `how`, `why` | 내부 위임 | 2단계에서 판정 근거가 얇은 심볼에만 실행한다.[](source:nc-howwhy) | 생략 |
| r111 | `architect` → 원칙 10개 | 참고 | 본문과 runner 프롬프트·근거 템플릿이 설계 판단의 근거로 지목한다. 본문 줄에 나오는 원칙은 `exhaust-the-design-space`, `redesign-from-first-principles`, `fix-root-causes`, `subtract-before-you-add`[](source:arch-exhaust)[](source:arch-scrap-pr)[](source:arch-scrap) | 생략 |
| r112 | `arena` → `principle-laziness-protocol`, `principle-redesign-from-first-principles`, `principle-prove-it-works` | 참고 | base 고르기, graft, 검증의 판단 근거[](source:arena-pick)[](source:arena-graft)[](source:arena-verify) | 생략 |
| r66 | `no-comments` → `architect` | 내부 위임 | 수정 중 하나라도 모양이 필요하면 받아들인 지적 전체를 대상으로 한 번 실행하고 스케치에서 멈춘다[](source:nc-arch) | 위 시퀀스 |
| r67 | `no-comments` → `principle-fix-root-causes`, `principle-redesign-from-first-principles` | 참고 | 의도만 안내한다. 범위 밖 수정을 허락하지 않는다[](source:nc-principles) | 생략 |

## 묶음 밖에서 들어오는 호출(그림에서 생략) {#callers}

| rel-id | from → to | 종류 | 조건 |
| --- | --- | --- | --- |
| r02 | `poteto-mode` → `architect` | 내부 위임 | 코드가 함수 경계를 넘을 때, 구현 전에 병렬로 설계를 탐색한다[](source:pm-arch) |
| r03 | `poteto-mode` → `swarm` | 내부 위임 | 병렬 분산(커버리지, race, gauntlet, 탐색 분할)[](source:pm-fan) |
| r04 | `poteto-mode` → `arena` | 내부 위임 | 설계나 코드의 경합(base 선택·graft)[](source:pm-fan) |
| r05 | `poteto-mode` → `interrogate` | 내부 위임 | 설계에 이견이 있을 때, 출시 전[](source:pm-int) |
| r08 | `poteto-mode` → `no-comments` | 내부 위임 | 리뷰 전[](source:pm-nocomm) |
| r69 | `figure-it-out` → `architect` | 내부 위임 | 되돌리기 어려운 설계 결정일 때. 모양이 정해진 기계적 작업이면 건너뛴다. 정해진 설계에 `arena`를 또 돌리지 않는다[](source:fio-arch) |
| r50 | `blast-radius` → `arena` | 내부 위임 | 크거나 넓은 변경일 때만[](source:br-arena) |

`poteto-mode`는 `interrogate`와 `swarm`이 스스로 정한 `subagent_type`을 바꾸지 말라고 적는다.[](source:pm-subtype)

## 공유 상태 {#shared-state}

| 파일 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `~/.cursor/rules/pstack-models.mdc` | `setup-pstack` | `arena`의 `arena runners`, `arena cross-judge pool` 줄(r32)[](source:arena-runners)[](source:arena-judge). `swarm`의 `swarm workers` 줄(r33)[](source:swarm-model). `architect`의 `architect runners` 줄로, `arena`를 부를 때 `arena runners` 대신 쓴다(r34)[](source:arch-sketch). `interrogate`의 `interrogate reviewers` 줄(r35)[](source:int-model) |

역할 줄의 모양은 `setup-pstack`의 규칙 예시에 있다.[](source:setup-roles) 패널 역할(`arena runners`, `architect runners`, `interrogate reviewers`)은 목록이고, 항목 하나당 서브에이전트 하나가 돈다.[](source:setup-panel) 규칙 파일이나 줄이 없으면 각 스킬의 기본 모델을 쓴다. `no-comments`가 이 파일을 읽는다는 내용은 원문에 명시 없음.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: 묶음 스킬 5개의 `SKILL.md`와 `architect` 참조 파일 두 줄. 관계 확인을 위해 `poteto-mode`, `poteto-help`, `setup-pstack`, `figure-it-out`, `blast-radius`의 해당 줄과 `how`, `why`의 머리말을 읽었다. 모두 원본이다.
- 읽지 않은 파일: 각 스킬의 `references/`(충돌 확인용 `architect` 참조 두 줄 제외). runner 프롬프트, 심사 기준, 리뷰어 프롬프트는 스킬 페이지가 다룬다. 그래서 r111 중 참조 파일에 있는 원칙 6개는 줄 대조를 하지 않았다.
- 제외한 파일: `*.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: r02~r05, r08, r32~r35, r50, r60~r67, r69, r110~r112의 출처 줄을 원문과 대조했다. 종류와 조건이 원장과 같다.
- 모든 스킬이 `disable-model-invocation: true`다. 사용자가 이름을 입력하거나 다른 스킬이 부를 때만 켜진다.[](source:arch-fm)[](source:arena-fm)[](source:swarm-fm)[](source:int-fm)[](source:nc-fm)
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 스킬 문서가 지시하는 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=warning title="원문끼리 충돌하는 곳"
`architect` 본문은 중간 확인을 합의 단계(Phase C)에 둔다.[](source:arch-agree) 근거 템플릿은 같은 승인을 "Phase D sign-off"라고 부른다.[](source:arch-tmpl)
`arena`는 후보 폴더를 worktree나 `/tmp/arena-<slug>/candidate-<n>/`로 정한다.[](source:arena-runners) `architect` runner 프롬프트는 worktree(worktree)를 못 쓰면 스케치 폴더 아래 runner별 하위 폴더를 쓴다.[](source:arch-runner) 어느 쪽이 우선인지는 원문에 명시 없음.

@callout level=open-question title="확인하지 못한 것"
r111 중 `architect`의 runner 프롬프트와 근거 템플릿에 있는 원칙 참고는 이 페이지에서 줄 대조를 하지 않았다. 원장의 기록을 그대로 옮겼다.
