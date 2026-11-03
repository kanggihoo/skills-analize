# principle-laziness-protocol 스킬은 에이전트를 어떻게 바꾸나 {#laziness-protocol-skill}

`principle-laziness-protocol`을 읽은 에이전트는 가장 적은 코드와 복잡도로 가장 큰 결과를 노린다. 리팩터링이나 개선을 맡으면 무엇을 더할지보다 무엇을 지울지 먼저 찾는다.[](source:rule)[](source:p-delete)

- 문제를 푸는 가장 작은 변경을 고른다. "우아한" 상용구보다 줄 수가 적은 쪽이 낫다.[](source:p-diff)
- 질문 하나에 답하려고 파일이나 계층을 3개 넘게 따라가야 하면 호출 구조를 평평하게 만든다.[](source:p-flat)
- 새 신호를 타입, 스키마, 파이프라인 같은 계층마다 통과시키라는 과제면 멈추고 더 직접적인 길을 찾는다.[](source:p-thread)
- 판단 기준: 사람 개발자가 유지하기 지친다고 느낄 코드면 나쁜 해법이다.[](source:test)

@answer scope="pstack/principle-laziness-protocol · SKILL.md 1개와 호출 측 줄 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/principle-laziness-protocol/SKILL.md · 1371B · 원칙 본문(frontmatter)" path=pstack/principle-laziness-protocol/SKILL.md lines=1:5
@source rule title="pstack/principle-laziness-protocol/SKILL.md · 규칙" path=pstack/principle-laziness-protocol/SKILL.md lines=9:9
@source p-delete title="pstack/principle-laziness-protocol/SKILL.md · 지우기 우선" path=pstack/principle-laziness-protocol/SKILL.md lines=11:11
@source p-flat title="pstack/principle-laziness-protocol/SKILL.md · 평평한 호출 구조" path=pstack/principle-laziness-protocol/SKILL.md lines=12:12
@source p-one title="pstack/principle-laziness-protocol/SKILL.md · 결정 한 곳에" path=pstack/principle-laziness-protocol/SKILL.md lines=13:13
@source p-diff title="pstack/principle-laziness-protocol/SKILL.md · 최소 diff" path=pstack/principle-laziness-protocol/SKILL.md lines=14:14
@source p-thread title="pstack/principle-laziness-protocol/SKILL.md · 신호 통과 의심" path=pstack/principle-laziness-protocol/SKILL.md lines=15:15
@source p-leak title="pstack/principle-laziness-protocol/SKILL.md · 작은 누수" path=pstack/principle-laziness-protocol/SKILL.md lines=16:16
@source test title="pstack/principle-laziness-protocol/SKILL.md · 판단 기준" path=pstack/principle-laziness-protocol/SKILL.md lines=18:18
@source pm-cite title="pstack/poteto-mode/SKILL.md · 20559B · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙 목록 머리말" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-trigger title="pstack/poteto-mode/SKILL.md · Core 목록의 이 원칙 줄" path=pstack/poteto-mode/SKILL.md lines=44:44
@source pb-refactor title="pstack/poteto-mode/playbooks/refactoring.md · 3211B · 4단계" path=pstack/poteto-mode/playbooks/refactoring.md lines=10:10
@source fio title="pstack/figure-it-out/SKILL.md · 4059B · 두 번째 arena" path=pstack/figure-it-out/SKILL.md lines=30:30
@source attack title="pstack/principle-attack-the-premise/SKILL.md · 1941B · 비대칭 없애기" path=pstack/principle-attack-the-premise/SKILL.md lines=17:17
@source lever title="pstack/principle-build-the-lever/SKILL.md · 2458B · 균형" path=pstack/principle-build-the-lever/SKILL.md lines=21:21
@source pb-proto title="pstack/poteto-mode/playbooks/prototype.md · 2161B · 도입" path=pstack/poteto-mode/playbooks/prototype.md lines=5:5
@source pb-feature title="pstack/poteto-mode/playbooks/feature.md · 2766B · 4단계" path=pstack/poteto-mode/playbooks/feature.md lines=12:12
@source pb-hill title="pstack/poteto-mode/playbooks/hillclimb.md · 4403B · 6단계" path=pstack/poteto-mode/playbooks/hillclimb.md lines=17:17
@source arena title="pstack/arena/SKILL.md · 4973B · 기반 후보 고르기" path=pstack/arena/SKILL.md lines=49:49
@source frc title="pstack/principle-fix-root-causes/SKILL.md · 1246B · 패턴 전체 수정" path=pstack/principle-fix-root-causes/SKILL.md lines=18:18
@source runner title="pstack/architect/references/runner-prompt.md · 3087B · 짧은 호출 사슬" path=pstack/architect/references/runner-prompt.md lines=18:18

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 사용자가 `/principle-laziness-protocol`을 입력하거나, 다른 스킬이 이 원칙을 읽으라고 할 때 켜진다. `description`은 어떤 상황에 맞는 원칙인지 알려 주는 설명이다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-laziness-protocol` 입력 |
| `poteto-mode` (Core 분류) | 리팩터링, `diff` 크기 판단, 추상화·계층·신호 통과를 더하고 싶을 때[](source:pm-trigger) |
| `refactoring` 플레이북 | 4단계에서 목표 모양에 닿는 가장 작은 변경을 고를 때[](source:pb-refactor) |
| `figure-it-out` | 이미 정해진 설계에 두 번째 `arena`를 돌리면 과설계라는 근거[](source:fio) |

`poteto-mode`는 원칙을 적용하기 전에 그 원칙의 `SKILL.md`를 끝까지 읽게 한다.[](source:pm-read) 답변에는 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite)

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 리팩터링이나 개선을 맡으면 더하기 전에 지울 것을 찾는다[](source:p-delete) | 의무 |
| 깊은 호출 사슬을 피한다. 많은 일을 감춘 풍부한 인터페이스는 깊은 사슬이 아니다[](source:p-flat) | 의무 |
| 답하려고 파일이나 계층을 3개 넘게 따라가야 하면 평평하게 만든다[](source:p-flat) | 의무 |
| 같은 선택을 여러 곳에서 반복하지 않는다. 한 곳에서 정하고 결과를 단순한 플래그로 넘긴다[](source:p-one) | 금지 |
| 문제를 푸는 가장 작은 변경을 한다[](source:p-diff) | 의무 |
| 새 신호를 여러 계층에 통과시키라는 과제면 멈추고 더 직접적인 길을 찾는다[](source:p-thread) | 의무 |
| 작은 전달용 코드, 표현 누수, 중복된 선택은 퍼지기 전에 지운다[](source:p-leak) | 의무 |

@facts
| 평평하게 만들 기준 | 파일이나 계층 3개 초과 |
| 판단 기준 | 사람 개발자가 유지하기 지치는 코드면 나쁜 해법 |

이 원칙에는 적용하지 않는 경우가 명시되어 있지 않다. 대신 다른 스킬 두 곳이 이 원칙을 뒤집거나 밀어낸다.

| 상황 | 이 원칙의 위치 |
| --- | --- |
| `prototype` 플레이북 | 이 원칙의 "가장 작은 변경"과 검증 기준이 뒤집히는 유일한 플레이북. 속도가 다듬기보다 앞선다[](source:pb-proto) |
| `feature` 플레이북 4단계 | 여러 모양이 가능하면 `arena`로 맡기는 것이 의무다. 이 원칙은 그 의무를 이기지 못한다. 얻는 것이 줄 수가 아니라 리뷰 분리라서다[](source:pb-feature) |

## 흐름 속 위치 {#position}

@workflow id=lazy-position title="laziness-protocol 앞뒤"
| pm | poteto-mode | backend |
| pb | 플레이북 | backend |
| fio | figure-it-out | backend |
| prin | 원칙 2개 | backend |
| me | laziness-protocol | backend |
| cite | 답변 속 인용 | frontend |
| pm > me | 리팩터링 | |
| pb > me | 최소 변경 | |
| fio > me | 과설계 | |
| prin > me | 근거 | |
| me > cite | 바뀐 선택 | emphasis |

| rel-id | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| r12 | `poteto-mode`의 원칙 목록 | 답변 속 원칙 이름과 바뀐 선택 | 리팩터링, `diff` 크기 판단, 추상화 유혹 |
| r12 플레이북 표 | `refactoring` 4단계 | 가장 작은 변경 고르기 | 목표 모양에 닿을 때 |
| r71 | `figure-it-out`의 설계 판단 | - | 정해진 설계에 두 번째 `arena`는 과설계 |
| r102 | `principle-attack-the-premise` | - | 보정하지 말고 비대칭을 없앨 때[](source:attack) |
| r104 | `principle-build-the-lever` | - | 프레임워크 말고 가장 작은 스크립트[](source:lever) |

그림의 "원칙 2개"는 r102와 r104의 두 원칙이다. 원장에는 없지만 이 원칙을 언급하는 곳이 더 있다(rel-id 없음). 위 표의 `prototype`, `feature` 플레이북 말고도 아래 세 곳이 있다.

- `hillclimb` 6단계: 동작을 깨는 성과는 되돌리고, 수치를 지키는 단순화는 남긴다.[](source:pb-hill)
- `arena`: 두 후보가 비슷하면 경계가 더 깔끔하거나 공개 인터페이스가 더 작은 쪽을 기반 후보로 고른다.[](source:arena)
- `architect` 러너 프롬프트: 흐름을 따라가는 데 파일이 3개 넘게 필요하면 평평하게 만든다.[](source:runner)

전체 흐름은 `pstack/_group-principles/principles.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/principle-laziness-protocol/SKILL.md` 전체. 호출 측은 `pstack/poteto-mode/SKILL.md` 15, 40, 44줄과 위에 인용한 줄만 확인했다.
- 원장 밖 언급 검색: `pstack/` 아래 원본 `.md`에서 이 원칙의 이름과 제목을 찾았다. 원장 밖 언급은 5곳이다(`prototype`, `feature`, `hillclimb`, `arena`, `architect` 러너 프롬프트).
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"3개 넘게"가 파일 3개와 계층 3개 중 어느 쪽이 먼저 닿으면 적용되는지는 원문에 명시 없음. "가장 작은 변경"과 `principle-fix-root-causes`의 "패턴을 모두 고친다"가 부딪힐 때[](source:frc)의 우선순위도 원문에 명시 없음.
