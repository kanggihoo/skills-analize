# principle-sequence-verifiable-units 스킬은 에이전트를 어떻게 바꾸나 {#units-skill}

이 원칙을 적용하면 에이전트는 여러 단계 작업을 작은 단위로 나눈다. 단위마다 확인할 수 있는 상태로 끝내고, 지금 단위가 통과하기 전에는 다음으로 넘어가지 않는다.[](source:skill-intro)

- 실행: 정상 상태 → 변경 하나 → 검사 → 진행. 변경을 모아서 한꺼번에 검사하지 않는다.[](source:skill-exec)
- 시작 전에 깨끗한 trunk 위로 `rebase`한다. 그래야 검사가 진짜 기준선과 비교된다.[](source:skill-exec)
- 전달: commit과 PR을 작업을 증명하는 순서로 쌓는다. 기본형은 실패하는 테스트가 먼저, 수정이 그 위다.[](source:skill-deliv)
- 플레이북 7개와 `figure-it-out`이 이 원칙으로 단계를 쪼갠다.[](source:pm-line)[](source:fio)

@answer scope="SKILL.md 1개와 참조 위치 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/principle-sequence-verifiable-units/SKILL.md · 1705B · frontmatter" path=pstack/principle-sequence-verifiable-units/SKILL.md lines=1:5
@source skill-intro title="SKILL.md · 도입부" path=pstack/principle-sequence-verifiable-units/SKILL.md lines=9:9
@source skill-why title="SKILL.md · Why" path=pstack/principle-sequence-verifiable-units/SKILL.md lines=11:11
@source skill-exec title="SKILL.md · Execution" path=pstack/principle-sequence-verifiable-units/SKILL.md lines=13:13
@source skill-deliv title="SKILL.md · Delivery" path=pstack/principle-sequence-verifiable-units/SKILL.md lines=15:15
@source skill-pair title="SKILL.md · 짝 원칙 문단" path=pstack/principle-sequence-verifiable-units/SKILL.md lines=17:17
@source pm-cite title="pstack/poteto-mode/SKILL.md · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙을 끝까지 읽기" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-line title="pstack/poteto-mode/SKILL.md · Verification 원칙 목록의 이 원칙" path=pstack/poteto-mode/SKILL.md lines=68:68
@source pb-bugfix title="pstack/poteto-mode/playbooks/bug-fix.md · 실패 테스트 먼저" path=pstack/poteto-mode/playbooks/bug-fix.md lines=12:12
@source pb-auto title="pstack/poteto-mode/playbooks/autonomous-run.md · 작업 순서" path=pstack/poteto-mode/playbooks/autonomous-run.md lines=8:8
@source pb-mpp title="pstack/poteto-mode/playbooks/multi-phase-plan.md · 4단계" path=pstack/poteto-mode/playbooks/multi-phase-plan.md lines=8:8
@source pb-feature title="pstack/poteto-mode/playbooks/feature.md · 작은 단위로 구현" path=pstack/poteto-mode/playbooks/feature.md lines=15:15
@source pb-perf title="pstack/poteto-mode/playbooks/perf-issue.md · 시도마다 검증" path=pstack/poteto-mode/playbooks/perf-issue.md lines=18:18
@source pb-hillclimb title="pstack/poteto-mode/playbooks/hillclimb.md · 반복마다 검사" path=pstack/poteto-mode/playbooks/hillclimb.md lines=16:16
@source pb-refactoring title="pstack/poteto-mode/playbooks/refactoring.md · 8단계" path=pstack/poteto-mode/playbooks/refactoring.md lines=14:14
@source fio title="pstack/figure-it-out/SKILL.md · Phase C" path=pstack/figure-it-out/SKILL.md lines=38:39
@source help-principles title="pstack/poteto-help/SKILL.md · 원칙 스킬 안내" path=pstack/poteto-help/SKILL.md lines=120:120

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/principle-sequence-verifiable-units`를 입력하거나, 다른 스킬이 이 원칙을 읽게 할 때 켜진다. 사용자가 원칙을 직접 부르는 일은 드물다. 보통은 사용자가 대화에서 원칙 이름을 말해 에이전트의 방향을 잡는다.[](source:help-principles)

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-sequence-verifiable-units` 입력[](source:help-principles) |
| `poteto-mode` | Verification 원칙. 여러 단계 작업(일괄 수정, 이전, 비슷한 편집의 연속), commit과 PR 쌓기[](source:pm-line) |
| 플레이북 7개 | `bug-fix`, `autonomous-run`, `multi-phase-plan`, `feature`, `perf-issue`, `hillclimb`, `refactoring`(아래 표) |
| `figure-it-out` | Phase C. 실험 단위마다 검증할 때[](source:fio) |

`poteto-mode`에서 켜지면 의무가 따라온다. 에이전트는 적용하는 원칙의 `SKILL.md`를 끝까지 읽는다.[](source:pm-read) 답변에는 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite)

`description`은 이 원칙이 다루는 상황을 적은 설명이다. 요청이 그 문장과 같은 말이어야 켜지는 것은 아니다.

## 무엇을 강제하나 {#rules}

@workflow id=unit-bracket title="단위 하나의 진행"
| good | 정상 상태 | backend |
| change | 변경 하나 | backend |
| check | 검사 통과? | backend |
| next | 다음 단위 | backend |
| good > change | | |
| change > check | | |
| check > next | 예 | emphasis |
| check > change | 아니오 | dashed |

@steps id=unit-steps
| u-good | 정상 상태 | 알려진 정상 상태에서 시작한다. 처음에는 깨끗한 trunk 위로 rebase해서 검사가 진짜 기준선과 비교되게 한다. | unit-bracket | good |
| u-change | 변경 하나 | 단위 하나에 변경 하나만 넣는다. | unit-bracket | change |
| u-check | 검사 통과? | 다음 변경을 시작하기 전에 검사를 돌린다. 지렛대(lever)가 편집을 대신해 단위별 검사 비용이 거의 없어도 검사를 돌린다. | unit-bracket | check |
| u-next | 다음 단위 | 통과해야만 넘어간다. 실패했을 때 무엇을 하는지는 원문이 "통과 전에는 넘어가지 않는다"고만 쓴다. | unit-bracket | next |

이 흐름은 원문 Execution 문단을 옮긴 것이다.[](source:skill-intro)[](source:skill-exec) 그림의 "아니오" 간선은 넘어가지 않는다는 뜻으로 그렸다(판정).

| 전달 규칙 | 원문의 강도 |
| --- | --- |
| commit과 PR을 작업을 증명하는 순서로 쌓는다[](source:skill-deliv) | 의무 |
| 기본형: 실패하는 테스트가 먼저, 수정이 그 위[](source:skill-deliv) | 기본형 |
| 다른 순서의 예: 재구성 전에 빼기, 처리 전에 기준선 기록, 기능 전에 골격[](source:skill-deliv) | 예시 |
| commit마다 따로 병합될 수 있어야 하고, 순서 전체가 하나의 논증으로 읽혀야 한다[](source:skill-deliv) | 의무 |

원문이 드는 이유는 이렇다. 깨진 곳을 그 단위에서 잡으면 위치를 찾기 쉽다. 묶음 뒤에 잡으면 깨진 곳이 파묻히고, 그때는 이미 깨진 바탕 위에 더 쌓은 뒤다. 순서를 리뷰어가 다시 재생할 수 있게 하면 "믿어 달라"가 "빨갛다가 초록이 되는 것을 보라"로 바뀐다.[](source:skill-why)

## 흐름 속 위치 {#position}

@workflow id=units-position title="검증 단위 원칙의 앞뒤"
| pm | poteto-mode | backend |
| pb | 플레이북 7개 | backend |
| fio | figure-it-out | backend |
| this | 검증 단위 | backend |
| back | 단위별 commit | frontend |
| pair | 짝 원칙 | backend |
| pm > this | 여러 단계 | |
| pb > this | 단계 쪼개기 | |
| fio > this | Phase C | |
| this > back | 순서 | emphasis |
| this > pair | 짝 | dashed |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 판단 상황 | 답변 속 원칙 이름과 바뀐 선택 | 여러 단계 작업, commit·PR 쌓기[](source:pm-line) | r12 |
| `bug-fix` 플레이북 | 실패 테스트 → 수정 순서 | 이 원칙의 기본형이라고 직접 부른다[](source:pb-bugfix) | 원장에 없음 |
| `autonomous-run` 플레이북 | 단위별 검증 | 검사를 끝에 몰지 않는다[](source:pb-auto) | 원장에 없음 |
| `multi-phase-plan` 플레이북 4단계 | PR 하나당 절 하나 | PR 하나는 자기 증거를 가진 변경 하나[](source:pb-mpp) | 원장에 없음 |
| `feature` 플레이북 | 작은 단위마다 빌드·검증·commit | 다음 단위 전에[](source:pb-feature) | 원장에 없음 |
| `perf-issue` 플레이북 | 시도마다 검증 | 다음 시도 전에[](source:pb-perf) | 원장에 없음 |
| `hillclimb` 플레이북 | 반복마다 검사 | 다음 반복 전에[](source:pb-hillclimb) | 원장에 없음 |
| `refactoring` 플레이북 8단계 | 빼기 → 재구성 → 정리 commit | 동작을 지키는 조각마다 초록 유지[](source:pb-refactoring) | 원장에 없음 |
| `figure-it-out` Phase C | 실험 단위마다 검증 | 검사를 끝에 몰지 않는다[](source:fio) | 원장에 없음 |
| - | `principle-prove-it-works`, `principle-build-the-lever` 참고 | 저쪽은 검사가 진짜인지, 검사를 싸게 만드는지를 맡는다[](source:skill-pair) | 원장에 없음 |

전체 흐름은 `pstack/_group-principles/principles.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`(1705B). 이 원칙을 부르는 위치를 확인하려고 `poteto-mode/SKILL.md`, 플레이북 7개, `figure-it-out/SKILL.md`, `poteto-help/SKILL.md`의 해당 줄을 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실제로 실행해 보지 않았다. 페이지에 적은 동작은 모두 SKILL.md가 지시하는 동작이며, 실행해서 확인한 동작이 아니다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
단위 하나의 크기 기준은 "작은 단위", "변경 하나"뿐이다. 수치 기준은 원문에 명시 없음.
검사가 실패했을 때 고쳐서 다시 돌리는지, 되돌리는지는 원문에 명시 없음.
