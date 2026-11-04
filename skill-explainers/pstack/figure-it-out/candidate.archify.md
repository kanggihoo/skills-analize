# figure-it-out 스킬은 에이전트를 어떻게 바꾸나 {#figure-it-out-skill}

`figure-it-out`을 켜면, 에이전트는 맞는 플레이북이 없는 큰 작업에서 코드보다 작업 절차를 먼저 설계한다. 이 절차가 코드보다 먼저 나오는 산출물이다.[](source:purpose)

- 에이전트는 절차를 작업의 위험만큼 엄격하게 짠다. 엄격함은 "더 열심히"가 아니라 통과 조건과 산출물로 정한다.[](source:frame)
- 에이전트는 작업 단위마다 가설을 세우고, 가장 작은 변경을 하고, 실제 산출물로 재고, 나아지지 않았으면 되돌린다.[](source:loop)
- 에이전트는 결정마다 `show-me-your-work`로 기록을 남긴다. 사람이 자리를 비웠다 돌아와 이 기록과 변경 내용(diff)을 보고 결과를 믿게 하려는 것이다.[](source:trail)
- 마지막 답변에는 설계한 플레이북, 엄격함 수준과 이유, 기록 경로, 검증된 것, 남은 것을 담는다.[](source:handback)

@answer scope="pstack/figure-it-out · 원본 텍스트 파일 1개 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/figure-it-out/SKILL.md · 4059B · 본문(frontmatter)" path=pstack/figure-it-out/SKILL.md lines=1:5
@source purpose title="pstack/figure-it-out/SKILL.md · 목적" path=pstack/figure-it-out/SKILL.md lines=9:9
@source start title="pstack/figure-it-out/SKILL.md · Start" path=pstack/figure-it-out/SKILL.md lines=13:13
@source frame title="pstack/figure-it-out/SKILL.md · Phase A" path=pstack/figure-it-out/SKILL.md lines=17:23
@source design title="pstack/figure-it-out/SKILL.md · Phase B" path=pstack/figure-it-out/SKILL.md lines=27:34
@source loop title="pstack/figure-it-out/SKILL.md · Phase C" path=pstack/figure-it-out/SKILL.md lines=38:43
@source trail title="pstack/figure-it-out/SKILL.md · Phase D" path=pstack/figure-it-out/SKILL.md lines=47:47
@source handback title="pstack/figure-it-out/SKILL.md · Phase E, 답변" path=pstack/figure-it-out/SKILL.md lines=51:53
@source pm-route title="pstack/poteto-mode/SKILL.md · figure-it-out 라우팅" path=pstack/poteto-mode/SKILL.md lines=123:123
@source refactoring title="pstack/poteto-mode/playbooks/refactoring.md · 범위" path=pstack/poteto-mode/playbooks/refactoring.md lines=5:5
@source orchestrate title="pstack/poteto-mode/playbooks/orchestrate.md · 범위" path=pstack/poteto-mode/playbooks/orchestrate.md lines=3:3
@source help-pick title="pstack/poteto-help/SKILL.md · 추천 표의 한 줄" path=pstack/poteto-help/SKILL.md lines=79:79
@source help-close title="pstack/poteto-help/SKILL.md · 헷갈리는 쌍" path=pstack/poteto-help/SKILL.md lines=97:97

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 그래서 이 스킬은 사용자가 `/figure-it-out`을 입력하거나 `poteto-mode`가 이 스킬로 보낼 때 켜진다.

| 상황 | 어디로 가나 | 비고 |
| --- | --- | --- |
| 여러 호출 지점에 걸친 이전처럼 크거나 여러 곳에 걸친 작업 | `figure-it-out` {good:이 스킬} | Feature 같은 좁은 플레이북이 맞아도 이리 온다[](source:pm-route) |
| 사용자가 자리를 비웠다가 돌아와 믿어야 하는 작업 | `figure-it-out` {good:이 스킬} | [](source:pm-route) |
| 맞는 플레이북이 하나도 없음 | `figure-it-out` {good:이 스킬} | [](source:pm-route) |
| 여러 날, 쌓인 PR 여럿, 한 조정자 아래 서브에이전트 무리 | Orchestrate 플레이북 {caution:다른 곳} | 그쪽은 프로그램을 돌리고, 이 스킬은 맞춤 실행 하나를 설계한다[](source:pm-route) |
| 작업 하나를 완료 조건까지 끌고 간다 | Autonomous run 플레이북 {caution:다른 곳} | [](source:help-close) |
| 작은~중간 규모의 구조 변경 | Refactoring 플레이북 {caution:다른 곳} | 크거나 여러 곳에 걸친 구조 작업만 이리 온다[](source:refactoring) |

`poteto-help`도 "크거나 여러 곳에 걸친 변경, 자리를 비운 뒤 검토할 변경"에 이 스킬을 추천한다.[](source:help-pick) Orchestrate 플레이북 쪽도 "야심 찬 실행 하나에 맞춤 절차가 필요하면 `figure-it-out`"이라고 선을 긋는다.[](source:orchestrate)

## 다섯 단계는 어떻게 이어지나 {#phases}

에이전트는 시작할 때 할 일 목록을 연다. 첫 항목은 `poteto-mode`의 Principles 절 읽기다. 그다음 아래 단계를 할 일로 넣는다.[](source:start)

@workflow id=fio-flow title="figure-it-out 단계"
| frame | A 틀 잡기 | backend |
| design | B 설계 | backend |
| loop | C 실험 | backend |
| log | D 기록 | database |
| verify | E 검증 | frontend |
| frame > design | 틀 확정 | |
| design > loop | | emphasis |
| loop > log | 단위마다 | |
| loop > verify | 모두 끝 | emphasis |

@steps id=fio-steps
| p-frame | A 틀 잡기 | 에이전트는 근거를 먼저 모으고 나서 틀을 확정한다. 세 가지를 말할 수 있을 때까지 실행을 시작하지 않는다. 세 가지는 반증 가능한 완료 조건, 대략의 단위 수와 노력과 막힌 점으로 수치화한 범위, 높게 잡은 엄격함 수준이다. 되돌리기 어려운 결정과 영향 범위가 큰 일은 더 엄격하게, 되돌릴 수 있고 위험이 낮은 일은 덜 엄격하게 한다. | fio-flow | frame |
| p-design | B 설계 | 에이전트는 작업을 따로 병합할 수 있는 작은 단위로 쪼개고, 가장 위험한 미지수부터 배치한다. 골격과 검증 장치를 기능보다 먼저 만든다. 검증 장치는 변경 전 상태를 기준값으로 잡아 "옛 값 대 새 값"으로 읽히게 한다. 설계한 단계 목록을 적는다. 사람이 검토하는 것이 이 목록이다. | fio-flow | design |
| p-loop | C 실험 | 에이전트는 단위마다 가설을 말하고, 가장 작은 변경을 하고, 실제 산출물에서 완료 조건으로 재고, 나아졌으면 남기고 아니면 되돌린다. 다음 단위를 시작하기 전에 이번 단위를 검증한다. 검사를 끝에 몰아서 하지 않는다. | fio-flow | loop |
| p-log | D 기록 | 에이전트는 `show-me-your-work`로 실행 기록을 남긴다. 단계가 끝날 때마다 한 줄씩 쓴다. 기록을 끝에 몰아 쓰지 않는다. 보통은 기록을 commit해 리뷰어가 PR에서 읽게 한다. | fio-flow | log |
| p-verify | E 검증 | 에이전트는 전체를 A의 완료 조건에 대고 확인한다. 검증 장치만이 아니라 실제 제품에서 확인한다. 반복된 교정은 통과 조건, 린트 규칙, 검사, 스크립트로 굳힌다. | fio-flow | verify |

에이전트는 B에서 설계한 단계를 할 일 목록의 Phase C 항목 뒤, Phase D 항목 앞에 구체적인 항목으로 넣는다.[](source:design) 각 단계는 C의 규율로 돌리고, D의 기록을 그 사이사이에 엮는다.

## 무엇을 강제하고 금지하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 완료 조건·범위·엄격함을 말할 수 있기 전에는 실행을 시작하지 않는다[](source:frame) | 금지 |
| 긴 실행에 들어가기 전에 틀과 절충안을 보여 준다[](source:frame) | 의무 |
| 되돌릴 수 있는 일은 묻지 않고 진행한다. 몇 시간짜리 실행에는 중간 확인을 한 번 둔다[](source:frame) | 의무 |
| 되돌리기 어려운 설계 결정은 `architect`를 돌린다(`architect`가 `arena`를 돌린다)[](source:design) | 의무 |
| 모양이 이미 구체적인 기계적 작업은 `architect`를 건너뛴다. 정해진 설계에 `arena`를 또 돌리면 과설계다[](source:design) | 금지 |
| 병렬화는 이음매를 따라서만 한다. 작업자마다 worktree나 branch를 따로 준다. 너무 많이 나누지 않는다[](source:design) | 의무 / 금지 |
| 자기 보고가 아니라 산출물을 직접 보고 검증한다. 너무 쉽게 통과하면 시스템보다 관찰 방법을 먼저 의심한다[](source:loop) | 의무 |
| 맡긴 일에는 판정 담당을 붙인다. 작업자가 통과 조건을 속이면 초기화하고 계약을 단단히 한다[](source:loop) | 의무 |
| 통과 조건 자체가 틀렸으면 우회하지 말고 별도 변경으로 고친다[](source:loop) | 의무 |
| 판정은 `VERIFIED`, `NOT VERIFIED`, `INCONCLUSIVE` 중 하나다. `INCONCLUSIVE`는 통과가 아니다. 부정적 결과를 숨기지 않는다[](source:loop) | 의무 / 금지 |

이 스킬은 판단 근거로 원칙 스킬 7개를 이름으로 부른다.

| 원칙 | 쓰이는 곳 |
| --- | --- |
| `principle-prove-it-works` | A. 완료 조건을 반증 가능하게 쓴다[](source:frame) |
| `principle-never-block-on-the-human` | A. 되돌릴 수 있는 일은 진행한다[](source:frame) |
| `principle-foundational-thinking` | B. 골격과 검증을 기능보다 먼저[](source:design) |
| `principle-laziness-protocol` | B. 두 번째 `arena`는 과설계[](source:design) |
| `principle-separate-before-serializing-shared-state` | B. 작업자마다 worktree나 branch[](source:design) |
| `principle-sequence-verifiable-units` | C. 단위마다 검증한 뒤 다음으로[](source:loop) |
| `principle-encode-lessons-in-structure` | E. 반복 교정을 구조로 굳힌다[](source:handback) |

@callout level=note title="사람이 끼어드는 지점"
A 끝에서 틀과 절충안을 보여 주고, 몇 시간짜리 실행이면 중간 확인을 한 번 둔다.[](source:frame) B에서 적은 단계 목록이 사람이 검토하는 대상이다.[](source:design) 마지막에는 기록 경로와 남은 일을 넘긴다.[](source:handback) 판정: 그 밖의 되돌릴 수 있는 결정에서는 사람을 기다리지 않는다.[](source:frame)

## 흐름 속 위치 {#position}

@workflow id=fio-position title="figure-it-out 앞뒤의 스킬"
| pm | poteto-mode | backend |
| fio | figure-it-out | backend |
| arch | architect | backend |
| smyw | 결정 기록 | database |
| pm > fio | 맞는 절차 없음 | |
| fio > arch | 설계 결정 | emphasis |
| fio > smyw | 결정 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 과제 | 맞춤 플레이북 | 크거나 여러 곳에 걸친 작업, 자리를 비운 뒤 검토할 작업, 맞는 플레이북 없음. 여러 날짜 프로그램은 Orchestrate 플레이북이 맡는다 | r11 |
| 할 일 목록 첫 항목 | `poteto-mode`의 Principles 절 읽기 | 의무 | r68 |
| 되돌리기 어려운 설계 결정 | `architect`에 위임 → 확정 설계 | 기계적 작업이면 건너뛴다. 정해진 설계에 `arena`를 또 돌리지 않는다 | r69 |
| 단계별 결정 | `show-me-your-work`에 기록 | 보통 commit해서 PR에서 읽게 한다 | r70 |
| - | `principle-laziness-protocol` 참고 | 두 번째 `arena`는 과설계라는 근거 | r71 |

`architect`와 `show-me-your-work`는 일을 마치면 `figure-it-out`의 단계로 돌아온다. 전체 흐름은 `pstack/_group-run/run.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 하나. 이 스킬 폴더의 원본 텍스트 파일은 이것뿐이다.
- 대조용으로 읽은 줄: `poteto-mode/SKILL.md:123`, `playbooks/refactoring.md:5`, `playbooks/orchestrate.md:3`, `poteto-help/SKILL.md:79,97`.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 원장 대조: 원장은 이 스킬이 부르는 원칙 중 `principle-laziness-protocol`(r71)만 적었다. 나머지 원칙 6개는 원장에 없다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"몇 시간짜리 실행"의 기준 시간, 중간 확인이 승인을 기다리는 것인지 알리기만 하는 것인지는 원문에 명시 없음.
엄격함 수준을 어떤 척도로 적는지, "너무 많이 나누지 않는다"의 개수 기준도 원문에 명시 없음.
기록을 commit하지 않는 경우의 기준은 이 스킬에 없다. `show-me-your-work`의 "리뷰어가 기록이 있어야 결과를 믿을 만큼 큰 작업" 기준을 따른다고 읽힌다(판정).
