# architect 스킬은 에이전트를 어떻게 바꾸나 {#architect-skill}

`architect`를 쓰면 에이전트는 코드를 바로 쓰지 않는다. 먼저 타입·시그니처·모듈 경계를 빈 몸체로 스케치하고, 여러 모델이 낸 후보를 합친 설계를 계약으로 삼아 구현한다.[](source:skill-intro)

- 설계 전에 `how`로 닿는 시스템을 모두 추적한다. 소유권이나 계층을 다시 정하면 `why`도 돌린다.[](source:skill-a)
- 스케치는 `arena`에 맡긴다. 구조가 다른 후보가 최소 2개 있어야 합친다.[](source:skill-b-arena)[](source:skill-b-twice)
- 기본값은 사람 확인 없이 바로 구현이다. 호출자가 명시적으로 요청할 때만 멈추고 승인을 받는다.[](source:skill-c)
- 구현이 같은 모양의 마찰을 반복해서 낳으면 스케치를 버리고 다시 설계한다.[](source:skill-e-tells)

@answer scope="pstack/architect · 원본 텍스트 파일 4개 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/architect/SKILL.md · 5675B · 본문(frontmatter)" path=pstack/architect/SKILL.md lines=1:5
@source skill-intro title="pstack/architect/SKILL.md · 목적" path=pstack/architect/SKILL.md lines=9:9
@source skill-start title="pstack/architect/SKILL.md · Start" path=pstack/architect/SKILL.md lines=11:19
@source skill-a title="pstack/architect/SKILL.md · Phase A" path=pstack/architect/SKILL.md lines=21:27
@source skill-b-arena title="pstack/architect/SKILL.md · Phase B 위임" path=pstack/architect/SKILL.md lines=29:33
@source skill-b-twice title="pstack/architect/SKILL.md · Design it twice" path=pstack/architect/SKILL.md lines=35:35
@source skill-b-screen title="pstack/architect/SKILL.md · 레드 플래그와 인터페이스 깊이" path=pstack/architect/SKILL.md lines=37:41
@source skill-c title="pstack/architect/SKILL.md · Phase C" path=pstack/architect/SKILL.md lines=43:51
@source skill-d title="pstack/architect/SKILL.md · Phase D" path=pstack/architect/SKILL.md lines=53:57
@source skill-e-tells title="pstack/architect/SKILL.md · Phase E 신호" path=pstack/architect/SKILL.md lines=59:72
@source skill-e-scrap title="pstack/architect/SKILL.md · Phase E 폐기 절차" path=pstack/architect/SKILL.md lines=74:79
@source skill-out title="pstack/architect/SKILL.md · Outputs" path=pstack/architect/SKILL.md lines=81:83
@source flags title="pstack/architect/references/design-red-flags.md · 3009B · 설계 레드 플래그" path=pstack/architect/references/design-red-flags.md lines=1:57
@source rationale title="pstack/architect/references/rationale-template.md · 3050B · 근거 문서 양식" path=pstack/architect/references/rationale-template.md lines=1:35
@source rationale-alt title="pstack/architect/references/rationale-template.md · 대안·열린 질문" path=pstack/architect/references/rationale-template.md lines=25:31
@source runner title="pstack/architect/references/runner-prompt.md · 3087B · 러너 프롬프트" path=pstack/architect/references/runner-prompt.md lines=1:20
@source runner-dir title="pstack/architect/references/runner-prompt.md · 작업 폴더" path=pstack/architect/references/runner-prompt.md lines=3:3
@source arena-dir title="pstack/arena/SKILL.md · 출력 위치" path=pstack/arena/SKILL.md lines=29:29
@source pm-trigger title="pstack/poteto-mode/SKILL.md · architect 호출 조건" path=pstack/poteto-mode/SKILL.md lines=22:22
@source fio-trigger title="pstack/figure-it-out/SKILL.md · architect 호출 조건" path=pstack/figure-it-out/SKILL.md lines=30:30
@source nc-trigger title="pstack/no-comments/SKILL.md · architect 호출" path=pstack/no-comments/SKILL.md lines=21:21
@source setup-runners title="pstack/setup-pstack/SKILL.md · architect runners 줄" path=pstack/setup-pstack/SKILL.md lines=64:64
@source pb-bugfix title="pstack/poteto-mode/playbooks/bug-fix.md · 수정 계획" path=pstack/poteto-mode/playbooks/bug-fix.md lines=9:9
@source pb-feature title="pstack/poteto-mode/playbooks/feature.md · 설계 단계" path=pstack/poteto-mode/playbooks/feature.md lines=6:6
@source pb-refactor title="pstack/poteto-mode/playbooks/refactoring.md · 목표 모양" path=pstack/poteto-mode/playbooks/refactoring.md lines=9:9
@source pb-perf title="pstack/poteto-mode/playbooks/perf-issue.md · 수정 계획" path=pstack/poteto-mode/playbooks/perf-issue.md lines=17:17
@source pb-proto title="pstack/poteto-mode/playbooks/prototype.md · 넘김" path=pstack/poteto-mode/playbooks/prototype.md lines=12:12

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/architect`를 입력하거나, 다른 스킬이 진행 중에 부를 때 켜진다. `description`은 어떤 작업에 맞는지 알려 주는 설명이고, 정확히 일치해야 켜지는 목록이 아니다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/architect`, 확인 단계를 원하면 "/architect with checkpoint"[](source:skill-c) |
| `poteto-mode` | 함수 경계를 넘는 코드를 쓸 때(의무형)[](source:pm-trigger) |
| `figure-it-out` | 되돌리기 어려운 설계 결정. 모양이 이미 정해진 기계적 작업이면 건너뛴다[](source:fio-trigger) |
| `no-comments` | 받아들인 지적 중 하나라도 모양을 정해야 할 때, 한 번만[](source:nc-trigger) |
| `poteto-mode` 플레이북 | Bug fix, Perf issue, Refactoring(함수 경계를 넘을 때), Feature(2단계), Prototype(실제 구현으로 넘길 때)[](source:pb-bugfix)[](source:pb-perf)[](source:pb-refactor)[](source:pb-feature)[](source:pb-proto) |

**쓰지 않는 경우**: `figure-it-out`은 이미 정해진 설계에 `arena`를 또 돌리는 것을 과설계로 본다.[](source:fio-trigger) Phase A는 주변 시스템이 전혀 없는 완전한 신규 작업일 때만 건너뛴다.[](source:skill-a)

## 다섯 단계는 어떻게 이어지나 {#flow}

시작할 때 단계마다 한 줄씩 할 일 목록(todolist)을 연다. 항목은 Ground, Sketch, Agree, Implement, Scrap 다섯 개다.[](source:skill-start)

@workflow id=architect-flow title="architect 단계 흐름"
| ground | 근거 다지기 | backend |
| sketch | 스케치 | backend |
| ask | 확인 요청? | backend |
| agree | 사람 승인 | frontend |
| impl | 구현 | backend |
| wrong | 구조가 틀림? | backend |
| scrap | 폐기 | backend |
| done | 완료 | frontend |
| ground > sketch | | |
| sketch > ask | | |
| ask > agree | 예 | |
| ask > impl | 아니오 | emphasis |
| agree > impl | 승인 | |
| impl > wrong | | |
| wrong > done | 아니오 | |
| wrong > scrap | 예 | |
| scrap > ground | how 재실행 | dashed |

@steps id=architect-steps
| s-ground | 근거 다지기 | Phase A. 새 코드가 닿는 모든 시스템에 `how`를 돌려 추적한 모델을 만든다. 파일 이름을 대는 것은 근거가 아니다. 설계가 소유권이나 계층을 다시 정하면 기존 모양에 `why`도 돌려 그 이유를 제약으로 삼는다. | architect-flow | ground |
| s-sketch | 스케치 | Phase B. 설계 과제와 Phase A 자료를 `arena`에 넘긴다. 러너마다 `references/runner-prompt.md`를 프롬프트로 준다. `arena`는 합친 설계 묶음 하나를 돌려준다. | architect-flow | sketch |
| s-ask | 확인 요청? | Phase C. 호출자가 "/architect with checkpoint", "구현 전에 멈추고 보여 줘"처럼 명시적으로 요청했는지 본다. 기본값은 확인 없이 진행이다. | architect-flow | ask |
| s-agree | 사람 승인 | 합친 설계를 보여 주고 승인을 기다린다. 사람이 모양에 반대하면 그 반대를 Phase A 근거로 다룬다. 다시 근거를 다지고 Phase B를 다시 돌린 뒤에 코드를 더 쓴다. 이 되돌림은 그림에서 생략했다. | architect-flow | agree |
| s-impl | 구현 | Phase D. `not implemented` 몸체를 코드로, 의사 코드를 로직으로 바꾼다. 합친 스케치가 계약이다. 스케치에 없던 매개변수가 필요하면 스케치가 틀렸는지, 요구를 놓쳤는지, 구현이 넘치는지 따진다. | architect-flow | impl |
| s-wrong | 구조가 틀림? | Phase E. 신호는 한 번이 아니라 반복되는 패턴이다. 엣지 케이스 몇 개로 구조를 버리지 않는다. 데이터가 복잡한 것은 설계가 복잡한 것과 다르다. | architect-flow | wrong |
| s-scrap | 폐기 | 만든 것에 `how`를 다시 돌린다. 새 제약을 처음부터 알았던 것처럼 다시 설계한다. 새 스케치는 커지기 전에 먼저 옛 스케치보다 작아야 한다. 그림에서는 이 재추적을 근거 다지기로 되돌아가는 선으로 그렸다. 그다음 Phase B로 돌아가 `arena`를 다시 돌린다. | architect-flow | scrap |

구현 중에 생긴 어긋남은 조용히 흡수하지 말고 드러낸다.[](source:skill-d) 합친 스케치는 확인 단계 여부와 상관없이 따로 커밋할 수 있다. 채워 가는 동안의 계획된 파손도 괜찮다고 한다.[](source:skill-c)

## 언제 스케치를 버리나 {#scrap}

| 번호 | 버릴 때가 됐다는 신호(Phase E) |
| --- | --- |
| 1 | 서로 관계없는 코드에 같은 모양의 우회가 거듭 나타난다 |
| 2 | 관계없는 엣지 케이스 여러 개가 모두 특수 분기를 요구한다 |
| 3 | 컴파일하려면 탈출구(`any`, 캐스트, 실제로는 늘 채워지는 선택 필드)가 필요하다 |
| 4 | 스케치에서 공유하지 않는다던 상태에 "락이 필요하다"는 반사가 나온다 |
| 5 | 호출자가 추상의 내부 규칙을 알아야 쓸 수 있다 |
| 6 | 서로 독립적인 Phase D 어긋남이 같은 모양으로 2개 이상 나온다 |

모든 신호는 `SKILL.md` Phase E 목록에서 왔다.[](source:skill-e-tells) 판정: 마지막 항목만 수치(2개 이상)가 있고 나머지는 분석자가 판단해야 하는 기준이다. 원문도 "판단을 쓰라"고 덧붙인다.[](source:skill-e-tells)

## 스케치 단계에서 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 합치기 전에 구조가 다른 후보를 최소 2개 만든다. 첫 후보가 충분해 보여도 그렇다. 한 모양 안의 부분 수정은 대안이 아니다[](source:skill-b-twice) | 의무 |
| 합치기 전에 모든 후보를 `references/design-red-flags.md`로 거른다[](source:skill-b-screen) | 의무 |
| 다음 기여자는 연 파일만 보고, 가장 가까운 예를 베끼고, 컴파일되는 가장 짧은 길을 고르는 에이전트라고 가정한다[](source:skill-b-screen) | 의무 |
| 쓸 만한 후보끼리는 인터페이스 깊이로 비교하고, 더 작은 공개 면 뒤에 더 많은 복잡도를 숨긴 쪽을 고른다[](source:skill-b-screen) | 권고 |
| 러너는 `pstack-models.mdc`의 `architect runners` 줄에서 고른다(`arena runners` 대신)[](source:skill-b-arena) | 의무 |

@facts
| 할 일 목록 항목 | 5개(Ground, Sketch, Agree, Implement, Scrap) |
| 최소 후보 수 | 구조가 다른 후보 2개 |
| 기본 러너 | `claude-opus-5-5-max`, `gpt-5.6-sol-max`, `grok-4.7-xhigh-fast` |
| 러너가 지킬 호출 사슬 | 흐름을 따라가는 데 파일이 3개를 넘으면 계층을 줄인다 |
| 호출 예시 | 실제 호출 위치 2~3개를 타입보다 먼저 쓴다 |

규칙 파일이나 줄이 없으면 위 기본 러너를 쓴다. 별칭과 거부된 모델 이름은 `arena` Phase A의 러너 규칙을 따른다.[](source:skill-b-arena) 러너 프롬프트는 각 러너에게 "다른 후보를 의식해 무난한 중간으로 수렴하지 말라"고 시킨다. 후보 사이의 차이가 기반 선택과 접붙이기(graft)의 신호이기 때문이다.[](source:runner)

## 후보를 무엇으로 거르나 {#red-flags}

| 레드 플래그 | 알아보는 법 | 고치는 방향 |
| --- | --- | --- |
| 얕은 모듈 | 호출자가 작업 하나에 메서드 여러 개를 조율한다 | 단순한 인터페이스 뒤에 많은 동작을 둔다 |
| 정보 누출 | 같은 내부 결정이 여러 모듈에 나타난다 | 전송·저장 형식은 숨기고 도메인 타입으로 파싱한다 |
| 시간 순 분해 | 적재·검증·변환·저장 단계가 같은 표현을 되풀이한다 | 실행 순서가 아니라 지식과 소유권으로 묶는다 |
| 전달만 하는 메서드 | 같은 인자를 같은 모양으로 넘기기만 한다 | 없애거나 작업을 끝낼 수 있는 모듈로 옮긴다 |
| 쪼개진 소유권 | 여러 모듈이 같은 상태를 쓰거나 사본을 갖는다 | 상태마다 소유자를 하나 둔다 |
| 한 작업에 두 방법 | 같은 일을 하는 길이 둘 이상이다 | 하나만 남기고 같은 변경에서 나머지를 지운다 |
| 가져올 수 있는 내부 | 바깥에서 내부를 import할 수 있다 | 바깥에서 import하면 빌드가 실패하게 만든다 |
| 손으로 맞추는 목록 | 같은 항목 목록이 두 곳 이상에 있다 | 하나에서 나머지를 만들거나, 어긋나면 빌드가 실패하게 한다 |

표의 여덟 항목은 `design-red-flags.md` 전체를 줄인 것이다.[](source:flags) 레드 플래그가 하나라도 있으면 그 모양을 고치거나 버릴 이유가 된다. 깊은 모듈과 깊은 호출 사슬은 다르다고 따로 경고한다.[](source:flags)

## 무엇을 만들어 남기나 {#outputs}

호출자의 사용 예를 먼저 쓰고, 타입 스케치는 거기서 끌어낸다. 작은 변경이면 새 타입과 시그니처를 담은 파일 하나, 큰 작업이면 모듈 지도와 타입 정의를 만든다. 근거 문서가 그 옆에 함께 간다.[](source:skill-out)

| 근거 문서 절 | 담는 것 |
| --- | --- |
| Problem | 목표와, 모양이 뻔하지 않은 이유. Phase A에서 나온 제약 |
| Usage | 타입보다 먼저 쓴다. README 한 편, 실제 호출 위치 2~3개. 스케치와 어긋나면 스케치를 고친다 |
| Shape | 데이터 구조, 흐름, 핵심 결정, 타입에 담은 불변식, 인터페이스 깊이 판단 |
| Synthesis decision | `arena`가 채운다. 기반 후보와 그 이유, 다른 후보에서 가져온 것과 버린 것 |
| Tradeoffs accepted | "Y를 얻으려고 X를 받아들인다" 꼴의 항목 |
| Alternatives considered | 필수. 최소 1개. 경쟁자가 실제로 있었으면 2~3개 |
| Open questions and risks | 사람이 판단할 것. 단정 말고 질문으로 쓴다 |
| Next implementation step | 바로 만들 첫 번째 것, 한 문장 |

절 구성과 조건은 `rationale-template.md`에서 왔다.[](source:rationale) 대안 절은 다른 러너의 후보가 아니라, 고른 모양이 검토하고 버린 설계 대안을 적는 자리다.[](source:rationale-alt)

## 흐름 속 위치 {#position}

@workflow id=architect-position title="architect 앞뒤의 스킬"
| caller | 부른 스킬 | backend |
| architect | architect | backend |
| deleg | how·why·arena | backend |
| back | 구현 또는 복귀 | backend |
| caller > architect | 설계 과제 | |
| architect > deleg | 위임 | emphasis |
| deleg > architect | 결과 | dashed |
| architect > back | 확정 설계 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 설계 과제 | 확정 설계 | 함수 경계를 넘는 코드 | r02 |
| `figure-it-out`의 설계 결정 | 확정 설계 | 되돌리기 어려운 결정일 때만 | r69 |
| `no-comments`의 지적 목록 | 설계 스케치 | 스케치에서 멈춘다. 구현은 `no-comments`가 한다 | r66 |
| 하위 시스템 목록 → `how` | 추적한 모델 | Phase A, 폐기 후 다시 | r60 |
| 기존 모양 → `why` | 제약 | 소유권·계층을 다시 정할 때만 | r61 |
| 설계 과제 → `arena` | 합친 설계 묶음 | Phase B, 폐기 후 다시 | r62 |
| 합친 스케치 → `interrogate` | 리뷰 | 선택. 구현 전 적대적 압박을 원할 때 | r63 |
| `pstack-models.mdc`의 `architect runners` 줄 | - | 줄이 없으면 기본 러너 | r34 |

원칙 스킬 참고는 r64에 있다.[](source:skill-c) 판정: `no-comments`가 부를 때는 Phase D 이후를 건너뛰고 스케치에서 끝나는 셈이다.[](source:nc-trigger) 전체 흐름은 `pstack/_group-design-review/design-review.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `references/design-red-flags.md`, `references/rationale-template.md`, `references/runner-prompt.md`. 네 파일 모두 원본이다.
- 호출 조건을 확인하려고 `poteto-mode`, `figure-it-out`, `no-comments`, `setup-pstack`, 플레이북 5개의 해당 줄을 읽었다.[](source:setup-runners)
- 제외한 파일: `SKILL.KO.md`, `references/*.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
후보 작업 폴더 위치가 두 곳에서 다르다. 러너 프롬프트는 워크트리가 없으면 스케치 폴더 아래 러너별 하위 폴더를 쓰라고 한다.[](source:runner-dir) `arena`는 `/tmp/arena-<slug>/candidate-<n>/`을 쓰라고 한다.[](source:arena-dir) 어느 쪽이 우선인지는 원문에 명시 없음.
근거 문서의 Open questions 절은 사람이 답할 질문을 모은다.[](source:rationale-alt) 그런데 기본값은 사람 확인 없이 구현으로 넘어간다.[](source:skill-c) 확인 단계가 없을 때 이 질문을 누가 언제 답하는지는 원문에 명시 없음.
Phase D 승인 뒤라는 표현이 근거 문서 양식에 나오지만, 승인 단계는 본문에서 Phase C다.[](source:rationale) 판정: 양식의 단계 이름이 본문과 어긋난 것으로 보인다.
