# principle-outcome-oriented-execution 스킬은 에이전트를 어떻게 바꾸나 {#outcome-skill}

이 원칙을 적용하면 에이전트는 계획된 재작성이나 이전에서 중간 상태를 매끄럽게 지키려 하지 않는다. 검증할 수 있는 최종 상태를 목표로 삼고, 그 상태로 곧장 수렴한다.[](source:skill-intro)

- 중간 단계마다 안정성을 지키려고 만든 임시 호환 코드가 오래 남는 부채가 된다고 본다.[](source:skill-why)
- 중간 파손은 계획되고, 범위가 정해지고, 되돌릴 수 있을 때만 허용한다.[](source:skill-core)
- 단계 경계가 명시된 계획에만 쓴다. 파손을 허용할 곳을 미리 밝힌다.[](source:skill-guard)
- 계획이 끝나면 정적 검증과 런타임 검증을 모두 통과해야 한다.[](source:skill-guard)

@answer scope="SKILL.md 1개와 참조 위치 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/principle-outcome-oriented-execution/SKILL.md · 1078B · frontmatter" path=pstack/principle-outcome-oriented-execution/SKILL.md lines=1:5
@source skill-intro title="SKILL.md · 도입부" path=pstack/principle-outcome-oriented-execution/SKILL.md lines=9:9
@source skill-why title="SKILL.md · Why" path=pstack/principle-outcome-oriented-execution/SKILL.md lines=11:11
@source skill-core title="SKILL.md · Core rule" path=pstack/principle-outcome-oriented-execution/SKILL.md lines=13:15
@source skill-guard title="SKILL.md · Guardrails" path=pstack/principle-outcome-oriented-execution/SKILL.md lines=17:21
@source pm-cite title="pstack/poteto-mode/SKILL.md · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙을 끝까지 읽기" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-line title="pstack/poteto-mode/SKILL.md · Core 원칙 목록의 이 원칙" path=pstack/poteto-mode/SKILL.md lines=50:50
@source architect title="pstack/architect/SKILL.md · 종합 설계 커밋과 중간 파손" path=pstack/architect/SKILL.md lines=49:49
@source help-principles title="pstack/poteto-help/SKILL.md · 원칙 스킬 안내" path=pstack/poteto-help/SKILL.md lines=120:120

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/principle-outcome-oriented-execution`을 입력하거나, 다른 스킬이 이 원칙을 읽게 할 때 켜진다. 사용자가 원칙을 직접 부르는 일은 드물다. 보통은 원칙 이름을 말로 꺼내 방향을 잡는다.[](source:help-principles)

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-outcome-oriented-execution` 입력[](source:help-principles) |
| `poteto-mode` | Core 원칙. 단계 경계가 명시된 계획된 재작성과 이전[](source:pm-line) |
| `architect` | 종합한 설계를 채워 넣는 동안 생기는 계획된 파손을 허용하는 근거[](source:architect) |

`poteto-mode`에서 켜지면 의무가 따라온다. 적용하는 원칙은 `SKILL.md`를 끝까지 읽는다.[](source:pm-read) 답변에는 결정을 바꾼 원칙과 바뀐 선택을 밝힌다. 인용은 이번 세션에 읽은 원칙만 한다.[](source:pm-cite)

`description`은 이 원칙이 다루는 상황을 알려 주는 설명이다. 그 문장과 같은 말이 나와야 켜지는 장치는 아니다.

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 전환 중 안정성보다 최종 상태의 온전함을 앞세운다[](source:skill-core) | 의무 |
| 중간 파손은 계획되고, 범위가 정해지고, 되돌릴 수 있을 때만 받아들인다[](source:skill-core) | 허용 조건 |
| 단계 경계가 명시된 계획된 재작성·이전에만 이 원칙을 쓴다[](source:skill-guard) | 적용 제한 |
| 일시 파손을 허용하는 곳을 미리 밝힌다[](source:skill-guard) | 의무 |
| 이전하는 동안 지금 손대는 영역에는 신호가 강한 검사를 유지한다[](source:skill-guard) | 의무 |
| 계획을 마칠 때 정적 검증과 런타임 검증을 전부 요구한다[](source:skill-guard) | 종료 조건 |

원문은 정확성을 명시한 검증 경계에서 증명하라고 한다. 중간 단계마다 증명하라는 뜻이 아니다.[](source:skill-why)

원문에는 적용 전후 예시가 없다.

## 흐름 속 위치 {#position}

@workflow id=outcome-position title="목표 상태 원칙의 앞뒤"
| pm | poteto-mode | backend |
| architect | architect | backend |
| this | 목표 상태 | backend |
| back | 답변에 인용 | frontend |
| pm > this | 계획된 이전 | |
| architect > this | 채워 넣기 | |
| this > back | 선택 근거 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 판단 상황 | 답변 속 원칙 이름과 바뀐 선택 | 단계 경계가 명시된 계획된 재작성·이전[](source:pm-line) | r12 |
| `architect`의 종합 설계 | 중간 파손 허용 | 채워 넣는 동안 계획되고 범위가 정해진 파손[](source:architect) | r64 |

이 원칙은 다른 스킬을 부르지 않는다. 원칙끼리의 참고 관계(r100~r107)에도 나오지 않는다. 전체 흐름은 `pstack/_group-principles/principles.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`(1078B). 이 원칙을 부르는 위치를 확인하려고 `poteto-mode/SKILL.md`, `architect/SKILL.md`, `poteto-help/SKILL.md`의 해당 줄을 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실제로 실행해 보지 않았다. 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"신호가 강한 검사"가 어떤 검사인지는 원문에 명시 없음.
"전부의 정적·런타임 검증"에 무엇이 들어가는지(타입 검사, 테스트, 실제 실행)는 원문에 명시 없음.
