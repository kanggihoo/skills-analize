# principle-separate-before-serializing-shared-state 스킬은 에이전트를 어떻게 바꾸나 {#separate-skill}

이 원칙을 적용하면 에이전트는 동시에 도는 작업자들이 같은 상태에 쓸 수 있을 때 잠금부터 걸지 않는다. 먼저 공유를 없앤다. 쓰는 대상이 정말 하나여야 할 때만 구조로 순서를 강제한다.[](source:skill-intro)

- 작업자마다 자기 파일, 키, branch, 상태 폴더를 준다. 합치기는 읽기·보고 경계에서만 한다.[](source:skill-pattern)
- 지시와 관례는 동시성 제어가 아니다. 순서는 잠금 파일, 순차 단계, 단독 소유 같은 구조로 강제한다.[](source:skill-intro)
- "잠금이 필요하다"는 기본 답이 아니라 점검할 설계 냄새로 본다.[](source:skill-pattern)
- `poteto-mode`, `arena`, 플레이북 여러 곳이 병렬 작업자를 나눌 때 이 원칙을 든다.[](source:pm-line)[](source:arena)

@answer scope="SKILL.md 1개와 참조 위치 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/principle-separate-before-serializing-shared-state/SKILL.md · 1565B · frontmatter" path=pstack/principle-separate-before-serializing-shared-state/SKILL.md lines=1:5
@source skill-intro title="SKILL.md · 도입부" path=pstack/principle-separate-before-serializing-shared-state/SKILL.md lines=9:9
@source skill-why title="SKILL.md · Why" path=pstack/principle-separate-before-serializing-shared-state/SKILL.md lines=11:11
@source skill-pattern title="SKILL.md · Pattern 1~3" path=pstack/principle-separate-before-serializing-shared-state/SKILL.md lines=13:16
@source skill-p1 title="SKILL.md · Pattern 1" path=pstack/principle-separate-before-serializing-shared-state/SKILL.md lines=14:14
@source skill-p2 title="SKILL.md · Pattern 2" path=pstack/principle-separate-before-serializing-shared-state/SKILL.md lines=15:15
@source skill-p3 title="SKILL.md · Pattern 3" path=pstack/principle-separate-before-serializing-shared-state/SKILL.md lines=16:16
@source pm-cite title="pstack/poteto-mode/SKILL.md · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙을 끝까지 읽기" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-line title="pstack/poteto-mode/SKILL.md · Architecture 원칙 목록의 이 원칙" path=pstack/poteto-mode/SKILL.md lines=62:62
@source arena title="pstack/arena/SKILL.md · 4단계 출력 위치" path=pstack/arena/SKILL.md lines=29:29
@source pb-orchestrate title="pstack/poteto-mode/playbooks/orchestrate.md · Worker / verifier" path=pstack/poteto-mode/playbooks/orchestrate.md lines=17:17
@source pb-feature title="pstack/poteto-mode/playbooks/feature.md · 공유 변경 상태" path=pstack/poteto-mode/playbooks/feature.md lines=10:10
@source pb-hillclimb title="pstack/poteto-mode/playbooks/hillclimb.md · 병렬 가설" path=pstack/poteto-mode/playbooks/hillclimb.md lines=12:12
@source pb-visual title="pstack/poteto-mode/playbooks/visual-parity.md · 3단계" path=pstack/poteto-mode/playbooks/visual-parity.md lines=7:7
@source fio title="pstack/figure-it-out/SKILL.md · 나눠 돌릴 것 정하기" path=pstack/figure-it-out/SKILL.md lines=31:31
@source runner title="pstack/architect/references/runner-prompt.md · 공유 상태" path=pstack/architect/references/runner-prompt.md lines=12:12
@source help-principles title="pstack/poteto-help/SKILL.md · 원칙 스킬 안내" path=pstack/poteto-help/SKILL.md lines=120:120

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/principle-separate-before-serializing-shared-state`를 입력하거나, 다른 스킬이 이 원칙을 읽게 할 때 켜진다. 사용자가 원칙을 직접 부르는 일은 드물다. 보통은 사용자가 대화에서 원칙 이름을 말해 에이전트의 방향을 잡는다.[](source:help-principles)

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-separate-before-serializing-shared-state` 입력[](source:help-principles) |
| `poteto-mode` | Architecture 원칙. 동시 작업자가 같은 파일, branch, 키, 객체에 쓸 수 있을 때[](source:pm-line) |
| `arena`, `figure-it-out`, `architect` runner | 후보·작업자의 출력 위치를 나눌 때, 공유 상태를 설계할 때[](source:arena)[](source:fio)[](source:runner) |
| 플레이북 4개 | `orchestrate`, `feature`, `hillclimb`, `visual-parity`에서 병렬 작업을 나눌 때(아래 표) |

`poteto-mode`에서 켜지면 의무가 따라온다. 에이전트는 적용하는 원칙의 `SKILL.md`를 끝까지 읽는다.[](source:pm-read) 답변에는 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite)

`description`은 이 원칙이 다루는 상황을 적은 설명이다. 요청이 그 문장과 같은 말이어야 켜지는 것은 아니다.

## 무엇을 강제하나 {#rules}

@workflow id=separate-flow title="공유 상태 판단 순서"
| find | 공유 상태 찾기 | backend |
| need | 한 객체 필요? | backend |
| split | 쓰기 대상 분리 | backend |
| lock | 구조로 직렬화 | security |
| find > need | | |
| need > split | 아니오 | emphasis |
| need > lock | 예 | |

@steps id=separate-steps
| s-find | 공유 상태 찾기 | 둘 다 읽고 쓰는 파일, 둘 다 `push`하는 branch, 한쪽은 정의하고 한쪽은 쓰는 API를 찾는다. | separate-flow | find |
| s-need | 한 객체 필요? | 작업자들이 정말 하나의 정본 객체가 필요한지, 각자 독립된 사실을 내놓는 것인지 묻는다. | separate-flow | need |
| s-split | 쓰기 대상 분리 | 기본값이다. 작업자마다 자기 파일, 키, branch, 상태 폴더를 준다. 합치기는 읽기·보고 경계에서만 한다. | separate-flow | split |
| s-lock | 구조로 직렬화 | 공유 쓰기 대상 하나가 진짜 불변 조건일 때만 이 단계로 간다. 잠금 파일, 순차 단계, 단일 작성자, 원자적 비교 후 교체를 쓴다. | separate-flow | lock |

이 순서는 원문 Pattern 1~3을 옮긴 것이다.[](source:skill-p1)[](source:skill-p2)[](source:skill-p3)

| 원문의 예 | 판정 |
| --- | --- |
| 두 작업자가 하나의 `state.json`에 각자 `lastX` 필드를 쓴다 | 여전히 공유 변경이다 {bad:공유}[](source:skill-p2) |
| `indexer-state.json`과 `metrics-state.json`으로 나눈다 | 공유가 아니다 {good:분리}[](source:skill-p2) |

| 규칙 | 원문의 강도 |
| --- | --- |
| 공유를 먼저 없앤다[](source:skill-p2) | 의무(기본값) |
| 지시나 관례를 동시성 제어로 쓰지 않는다[](source:skill-intro) | 금지 |
| 직렬화는 공유 쓰기 대상이 진짜 불변 조건일 때만, 구조로 한다[](source:skill-p3) | 조건부 |
| "잠금이 필요하다"를 기본 답으로 삼지 않는다. 점검할 설계 냄새로 본다[](source:skill-p3) | 금지 |

원문이 드는 이유는 이렇다. 공유 상태에 동시에 쓰면 경쟁 상태가 생기는데, 이 문제는 가끔만 나타나고 재현이 어렵고 디버깅 비용이 크다.[](source:skill-why)

## 흐름 속 위치 {#position}

@workflow id=separate-position title="공유 상태 분리 원칙의 앞뒤"
| pm | poteto-mode | backend |
| pb | 플레이북 | backend |
| others | arena 등 | backend |
| this | 공유 상태 분리 | backend |
| back | 작업자별 위치 | frontend |
| pm > this | 동시 쓰기 | |
| pb > this | 병렬 작업 | |
| others > this | 출력 위치 | |
| this > back | 분리 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 판단 상황 | 답변 속 원칙 이름과 바뀐 선택 | 동시 작업자가 같은 파일·branch·키·객체에 쓸 수 있을 때[](source:pm-line) | r12 |
| `arena` 4단계 | 후보별 출력 위치 | 가능하면 git worktree, 아니면 `/tmp/arena-<slug>/candidate-<n>/`[](source:arena) | r65 |
| `orchestrate` 플레이북 | worktree·branch마다 작성자 하나 | 작업자와 검증자 배치[](source:pb-orchestrate) | 원장 플레이북 표 |
| `feature` 플레이북 | 쪼갠 쓰기 대상 | 공유 변경 상태는 기본으로 나눈다. 진짜 불변 조건만 직렬화[](source:pb-feature) | 원장에 없음 |
| `hillclimb` 플레이북 | 가설마다 worktree | 독립 가설 여러 개를 병렬 서브에이전트로 돌릴 때[](source:pb-hillclimb) | 원장에 없음 |
| `visual-parity` 플레이북 3단계 | 컴포넌트마다 담당 하나 | worktree로 병렬화. 공유 기본 요소(shared primitives)는 먼저, 막는 단계(blocking phase)로 옮긴다[](source:pb-visual) | 원장에 없음 |
| `figure-it-out` | 작업자마다 worktree나 branch | 경계(seam)를 따라서만 병렬화한다. 너무 많이 나누지 않는다[](source:fio) | 원장에 없음 |
| `architect` runner 프롬프트 | 작업자별 상태와 읽기 경계 합치기 | 두 작업자가 쓸 수 있고 "무슨 일이 생기나"의 답이 "아무 일도"가 아닐 때[](source:runner) | 원장에 없음 |

이 원칙은 다른 스킬을 부르지 않는다. 전체 흐름은 `pstack/_group-principles/principles.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`(1565B). 이 원칙을 부르는 위치를 확인하려고 `poteto-mode/SKILL.md`, 플레이북 4개, `arena/SKILL.md`, `figure-it-out/SKILL.md`, `architect/references/runner-prompt.md`, `poteto-help/SKILL.md`의 해당 줄을 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실제로 실행해 보지 않았다. 페이지에 적은 동작은 모두 SKILL.md가 지시하는 동작이며, 실행해서 확인한 동작이 아니다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"진짜 불변 조건"을 어떻게 판별하는지는 원문에 명시 없음. 원문은 판별 질문 하나("정본 객체가 필요한가, 독립된 사실인가")만 준다.[](source:skill-p2)
