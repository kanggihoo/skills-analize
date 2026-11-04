# principle-never-block-on-the-human 스킬은 에이전트를 어떻게 바꾸나 {#never-block-skill}

이 원칙을 적용하면 에이전트는 되돌릴 수 있는 일에 "X를 해도 될까요?"라고 묻지 않는다. X를 하고, 결과와 이유를 보여 준다. 사람은 나중에 방향을 고친다.[](source:skill-intro)[](source:skill-pattern)

- 원문은 사람이 작업을 비동기로 감독한다고 본다. 허락을 받으려고 멈출 때마다 파이프라인이 서고, 사람이 병목이 된다.[](source:skill-why)
- 되돌릴 수 없는 행동은 여전히 확인을 받는다. 원문의 예는 force-push, 운영 데이터 삭제, 외부 메시지 전송이다.[](source:skill-bounds)
- 제품 방향은 사람이 정한다. 멈추지 않아야 하는 것은 실행이다.[](source:skill-bounds)
- `poteto-mode`는 되돌릴 수 있는 일에 확인을 받고 싶어질 때 이 원칙을 꺼낸다.[](source:pm-line)

@answer scope="SKILL.md 1개와 참조 위치 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/principle-never-block-on-the-human/SKILL.md · 1172B · frontmatter" path=pstack/principle-never-block-on-the-human/SKILL.md lines=1:5
@source skill-intro title="SKILL.md · 도입부" path=pstack/principle-never-block-on-the-human/SKILL.md lines=9:9
@source skill-why title="SKILL.md · Why" path=pstack/principle-never-block-on-the-human/SKILL.md lines=11:11
@source skill-pattern title="SKILL.md · Pattern" path=pstack/principle-never-block-on-the-human/SKILL.md lines=13:15
@source skill-bounds title="SKILL.md · Boundaries" path=pstack/principle-never-block-on-the-human/SKILL.md lines=17:20
@source pm-cite title="pstack/poteto-mode/SKILL.md · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙을 끝까지 읽기" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-line title="pstack/poteto-mode/SKILL.md · Delegation 원칙 목록의 이 원칙" path=pstack/poteto-mode/SKILL.md lines=75:75
@source fio title="pstack/figure-it-out/SKILL.md · Phase A 중간 확인" path=pstack/figure-it-out/SKILL.md lines=23:23
@source pb-mpp title="pstack/poteto-mode/playbooks/multi-phase-plan.md · 2단계" path=pstack/poteto-mode/playbooks/multi-phase-plan.md lines=6:6
@source help-principles title="pstack/poteto-help/SKILL.md · 원칙 스킬 안내" path=pstack/poteto-help/SKILL.md lines=120:120

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/principle-never-block-on-the-human`을 입력하거나, 다른 스킬이 이 원칙을 읽게 할 때 켜진다. 사용자가 원칙을 직접 부르는 일은 드물다. 보통은 사용자가 대화에서 원칙 이름을 말해 에이전트의 방향을 잡는다.[](source:help-principles)

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-never-block-on-the-human` 입력[](source:help-principles) |
| `poteto-mode` | Delegation 원칙. 되돌릴 수 있는 일에 "X를 할까요?"를 묻고 싶을 때[](source:pm-line) |
| `figure-it-out` | Phase A. 긴 실행 전에 틀과 절충을 보여 주는 대목[](source:fio) |
| `multi-phase-plan` 플레이북 | 2단계. 열린 질문을 프로토타입으로 정리하는 대목[](source:pb-mpp) |

`poteto-mode`에서 켜지면 의무가 따라온다. 에이전트는 적용하는 원칙의 `SKILL.md`를 끝까지 읽는다.[](source:pm-read) 답변에는 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite)

`description`은 이 원칙이 다루는 상황을 적은 설명이다. 요청이 그 문장과 같은 말이어야 켜지는 것은 아니다.

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| "X를 할까요?"라고 묻지 않는다. X를 하고 이유를 설명한다[](source:skill-pattern) | 금지 |
| 먼저 일을 하고, 결과를 보여 준다[](source:skill-pattern) | 의무 |
| 문제를 발견하면 기록하고 다음 차례에 고친다. 시스템이 스스로 회복하게 만든다[](source:skill-pattern) | 의무 |

에이전트는 확인을 받을지를 행동의 종류로 가른다.[](source:skill-bounds)

| 행동 종류 | 원문의 예 | 처리 |
| --- | --- | --- |
| 되돌릴 수 없는 행동 | force-push, 운영 데이터 삭제, 외부 메시지 전송 | 여전히 확인을 받는다 {caution:확인 필요} |
| 되돌릴 수 있는 행동 | 코드 작성, 노트 수정, 작업 나누기 | 멈추지 않고 진행한다 {good:진행} |
| 제품 방향 | - | 사람이 정한다. 실행만 멈추지 않는다 |

원문이 드는 이유는 이렇다. 코드 변경은 되돌릴 수 있고 리뷰할 수 있다. 그래서 잘못된 결정의 비용이 멈춰 기다리는 비용보다 대개 작다.[](source:skill-why)

원문에는 적용 전후 대화 예시가 없다.

## 흐름 속 위치 {#position}

@workflow id=never-block-position title="멈추지 않기 원칙의 앞뒤"
| pm | poteto-mode | backend |
| fio | figure-it-out | backend |
| mpp | multi-phase-plan | backend |
| this | 멈추지 않기 | backend |
| back | 진행 후 보고 | frontend |
| pm > this | 확인 충동 | |
| fio > this | Phase A | |
| mpp > this | 2단계 | |
| this > back | 진행 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 판단 상황 | 답변 속 원칙 이름과 바뀐 선택 | 되돌릴 수 있는 일에 확인을 받고 싶을 때[](source:pm-line) | r12 |
| `figure-it-out` Phase A | 진행 | 되돌릴 수 있는 일은 진행한다. 단, 몇 시간짜리 실행은 중간 확인을 한 번 받는다[](source:fio) | 원장에 없음 |
| `multi-phase-plan` 플레이북 2단계 | 운영자에게 줄 선택지 | 실행으로 정할 수 없는 제품·선호 판단만 묻는다. 물을 때는 선택지를 준다[](source:pb-mpp) | 원장에 없음 |

이 원칙은 다른 스킬을 부르지 않는다. 원칙끼리의 참고 관계(r100~r107)에도 나오지 않는다. 전체 흐름은 `pstack/_group-principles/principles.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`(1172B). 이 원칙을 부르는 위치를 확인하려고 `poteto-mode/SKILL.md`, `figure-it-out/SKILL.md`, `playbooks/multi-phase-plan.md`, `poteto-help/SKILL.md`의 해당 줄을 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실제로 실행해 보지 않았다. 페이지에 적은 동작은 모두 SKILL.md가 지시하는 동작이며, 실행해서 확인한 동작이 아니다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
원문의 되돌릴 수 없는 행동은 세 가지 예뿐이다. 목록 밖 행동을 어떻게 가르는지는 원문에 명시 없음.
"다음 차례에 고친다"의 차례가 무엇인지(다음 턴, 다음 단계)는 원문에 명시 없음.
