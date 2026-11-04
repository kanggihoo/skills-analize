# principle-explain-the-number 스킬은 에이전트를 어떻게 바꾸나 {#explain-the-number-skill}

`principle-explain-the-number`를 읽은 에이전트는 잰 수치를 그대로 믿거나 보고하지 않는다. 먼저 그 수치를 묶는 한계 요인(코어, 락, 디스크, 네트워크 같은 자원이나 코드 경로)을 찾고, 다른 것을 잰 게 아님을 근거로 배제한다.[](source:rule)

- 원문의 이유: 잘못된 실행도 그럴듯한 수치를 낸다. 실패한 요청, 일을 건너뛴 캐시, 돌지 않은 코드, 기본 설정에 남은 한쪽, 실행마다 다른 잡음이 모두 멀쩡해 보이는 결과를 만든다.[](source:why)
- 핵심 질문은 "왜 두 배가 아닌가?"다. 이 질문에 답하지 못하면 무엇을 쟀는지 모르는 것이다.[](source:why)
- 잰 수치가 성능 수치이면, `benchmark-checklist`로 전체 절차를 돌린다.[](source:handoff)
- 근거에 실행 횟수, 편차, 이름 붙은 한계 요인 중 하나라도 없으면 이 원칙을 건너뛴 것이다.[](source:skipped)

@answer scope="pstack/principle-explain-the-number · SKILL.md 1개와 호출 측 줄 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/principle-explain-the-number/SKILL.md · 2109B · 원칙 본문(frontmatter)" path=pstack/principle-explain-the-number/SKILL.md lines=1:5
@source rule title="pstack/principle-explain-the-number/SKILL.md · 규칙" path=pstack/principle-explain-the-number/SKILL.md lines=9:9
@source why title="pstack/principle-explain-the-number/SKILL.md · 이유" path=pstack/principle-explain-the-number/SKILL.md lines=11:11
@source p-double title="pstack/principle-explain-the-number/SKILL.md · 왜 두 배가 아닌가" path=pstack/principle-explain-the-number/SKILL.md lines=15:15
@source p-else title="pstack/principle-explain-the-number/SKILL.md · 다른 것을 쟀을 가능성" path=pstack/principle-explain-the-number/SKILL.md lines=16:16
@source p-keep title="pstack/principle-explain-the-number/SKILL.md · 근거 함께 두기" path=pstack/principle-explain-the-number/SKILL.md lines=17:17
@source handoff title="pstack/principle-explain-the-number/SKILL.md · 성능 수치와 평가 결과" path=pstack/principle-explain-the-number/SKILL.md lines=19:19
@source skipped title="pstack/principle-explain-the-number/SKILL.md · 건너뛴 신호" path=pstack/principle-explain-the-number/SKILL.md lines=21:21
@source distinct title="pstack/principle-explain-the-number/SKILL.md · prove-it-works와의 구별" path=pstack/principle-explain-the-number/SKILL.md lines=23:23
@source pm-cite title="pstack/poteto-mode/SKILL.md · 20559B · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙 목록 머리말" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-trigger title="pstack/poteto-mode/SKILL.md · Verification 목록의 이 원칙 줄" path=pstack/poteto-mode/SKILL.md lines=70:70
@source bc title="pstack/benchmark-checklist/SKILL.md · 5409B · 쓰는 때와 이 원칙" path=pstack/benchmark-checklist/SKILL.md lines=9:9

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 사용자가 `/principle-explain-the-number`를 입력하거나, 다른 스킬이 이 원칙을 읽으라고 할 때 켜진다. `description`은 이 원칙이 어떤 상황에 맞는지 알려 주는 설명이다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-explain-the-number` 입력 |
| `poteto-mode` (Verification 분류) | 잰 수치(속도 향상, 회귀, 처리량, 지연, 평가 결과)를 믿거나 보고하거나 그에 따라 행동하기 전[](source:pm-trigger) |
| `benchmark-checklist` | 체크리스트가 왜 필요한지 설명할 때 이 원칙을 가리킨다[](source:bc) |

`poteto-mode`는 에이전트가 원칙을 적용하기 전에 그 원칙의 `SKILL.md`를 끝까지 읽게 한다.[](source:pm-read) 에이전트는 답변에서 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite) 원장에는 이 원칙을 이름으로 부르는 플레이북이 없다.

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 결과를 묶는 자원이나 코드 경로를 이름으로 댄다. 코어, 락, 디스크, 네트워크, 부하 발생기 자체가 예다[](source:p-double) | 의무 |
| 한계 요인은 실행 중에 뜬 프로파일이나 시스템 카운터에서 얻고, 소스 위치에 대응시킨다[](source:p-double) | 의무 |
| 코드를 읽고 한 짐작은 한계 요인으로 치지 않는다[](source:p-double) | 금지 |
| 수치가 대신 재고 있을 수 있는 것을 나열하고, 하나씩 근거로 배제한다[](source:p-else) | 의무 |
| 실행 횟수, 편차, 한계 요인을 노트나 연결된 산출물에 수치와 함께 둔다[](source:p-keep) | 의무 |
| 성능 수치는 `benchmark-checklist`로 전체 절차를 돈다[](source:handoff) | 의무 |
| 평가 결과는 모든 실행이 과제를 했는지, 차이가 시도와 모델을 넘어 유지되는지, 시나리오가 중요한지 묻는다[](source:handoff) | 의무 |

| 흔한 용의자 | 무엇을 확인하나 |
| --- | --- |
| 오류 | 실패한 요청이 수치에 섞였는가[](source:p-else) |
| 건너뛰거나 캐시된 일 | 일이 실제로 실행됐는가[](source:p-else) |
| 조정하지 않은 한쪽 | 비교 대상 한쪽이 기본 설정에 남았는가[](source:p-else) |
| 잡음 | 실행마다 흔들리는 폭이 차이보다 큰가[](source:p-else) |
| 너무 작은 조각 | 전체 흐름에서 의미가 있을 만큼 큰가[](source:p-else) |

"무엇을 확인하나" 열은 원문의 용의자 이름을 질문으로 풀어 쓴 것이다(판정).[](source:why)

@facts
| 건너뛴 신호 1 | 근거에 실행 횟수, 편차, 이름 붙은 한계 요인 중 하나가 없다 |
| 건너뛴 신호 2 | 아낀 시간이 바꾼 조각이 원래 쓰던 시간보다 크다 |

판정: 두 번째 신호는 불가능한 결과다. 조각이 원래 쓰던 시간보다 더 많이 아낄 수는 없다.[](source:skipped)

이 원칙은 `principle-prove-it-works`와 다르다. 그쪽은 출력이 진짜인지 확인한다. 이쪽은 잰 수치가 말하는 그 뜻인지 확인한다.[](source:distinct)

## 흐름 속 위치 {#position}

@workflow id=number-position title="explain-the-number 앞뒤"
| pm | poteto-mode | backend |
| me | explain-the-number | backend |
| bc | benchmark-checklist | backend |
| prove | prove-it-works | backend |
| cite | 답변 속 인용 | frontend |
| pm > me | 수치 보고 전 | |
| me > bc | 성능 수치 | |
| me > prove | 구별 | dashed |
| me > cite | 바뀐 선택 | emphasis |

| rel-id | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| r12 | `poteto-mode`의 원칙 목록 | 답변 속 원칙 이름과 바뀐 선택 | 잰 수치를 믿거나 보고하거나 행동하기 전 |
| r95 | 잰 성능 수치 | `benchmark-checklist`로 넘김 | 성능 수치면 전체 절차를 그 스킬로 실행 |
| r94 | `benchmark-checklist`의 안내 | - | 체크리스트가 왜 필요한지는 이 원칙이 말한다. 그림에서는 생략 |
| r106 | - | `principle-prove-it-works` 참고 | 두 원칙을 구별할 때 |

`poteto-mode`도 수치를 보고하기 전에 `benchmark-checklist`를 직접 부른다(r09). 그 관계는 이 원칙을 거치지 않으므로 그림에 넣지 않았다. 전체 흐름은 `pstack/_group-principles/principles.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/principle-explain-the-number/SKILL.md` 전체. 호출 측은 `pstack/poteto-mode/SKILL.md` 15, 40, 70줄과 `pstack/benchmark-checklist/SKILL.md` 9줄만 확인했다.
- 원장 밖 언급 검색: `pstack/` 아래 원본 `.md`에서 이 원칙의 이름과 제목을 찾았다. 원장 밖 언급은 없다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: `reporting-skills/pstack/principle-explain-the-number/SKILL.md`와 원문 동일(`shasum` 일치). 소속 묶음과 호출 측은 `pstack/` 경로 기준으로 확인했다.
- 실제로 실행해 보지 않았다. 페이지에 쓴 동작은 모두 원문이 지시하는 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
실행 횟수와 편차의 최소 기준(몇 번, 얼마 이하)은 이 원칙에 명시 없음. `benchmark-checklist`에 기준이 있는지는 이 페이지에서 확인하지 않았다.
