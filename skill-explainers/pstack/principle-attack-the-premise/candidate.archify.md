# principle-attack-the-premise 스킬은 에이전트를 어떻게 바꾸나 {#attack-the-premise-skill}

`principle-attack-the-premise`를 읽은 에이전트는 같은 전제를 깐 수정이 두 번 이상 같은 통과 조건에서 막히면 다음 수정을 쓰지 않는다. 전제를 한 문장으로 적고, 행위자마다 불균형을 집계한 뒤 전제 자체를 의심한다.[](source:rule)

- 집계는 불균형의 크기가 아니라 어느 행위자에게 몰렸는지를 보여 준다. 다시 돌릴 수 있는 스크립트로 만든다.[](source:p-census)
- 매번 같은 몇몇 행위자에게 몰리면, 그들에게 역할을 주는 무언가가 있다. 그것이 다음 "왜"다.[](source:p-skew)
- 비대칭은 보정하지 않고 없앤다. 역할을 돌리거나, 무작위로 주거나, 다른 곳으로 옮긴다.[](source:p-remove)
- 집계가 고르게 나오면 전제는 원인이 아니다. 원인은 다른 데서 찾고 집계는 근거로 남긴다.[](source:stop)

@answer scope="pstack/principle-attack-the-premise · SKILL.md 1개와 호출 측 줄 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/principle-attack-the-premise/SKILL.md · 1941B · 원칙 본문(frontmatter)" path=pstack/principle-attack-the-premise/SKILL.md lines=1:5
@source rule title="pstack/principle-attack-the-premise/SKILL.md · 규칙과 이유" path=pstack/principle-attack-the-premise/SKILL.md lines=9:11
@source p-write title="pstack/principle-attack-the-premise/SKILL.md · 전제 적기" path=pstack/principle-attack-the-premise/SKILL.md lines=14:14
@source p-census title="pstack/principle-attack-the-premise/SKILL.md · 집계" path=pstack/principle-attack-the-premise/SKILL.md lines=15:15
@source p-skew title="pstack/principle-attack-the-premise/SKILL.md · 쏠림 읽기" path=pstack/principle-attack-the-premise/SKILL.md lines=16:16
@source p-remove title="pstack/principle-attack-the-premise/SKILL.md · 비대칭 없애기" path=pstack/principle-attack-the-premise/SKILL.md lines=17:17
@source stop title="pstack/principle-attack-the-premise/SKILL.md · 멈춤 조건" path=pstack/principle-attack-the-premise/SKILL.md lines=19:21
@source distinct title="pstack/principle-attack-the-premise/SKILL.md · redesign 원칙과의 구별" path=pstack/principle-attack-the-premise/SKILL.md lines=23:23
@source pm-cite title="pstack/poteto-mode/SKILL.md · 20559B · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙 목록 머리말" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-trigger title="pstack/poteto-mode/SKILL.md · Core 목록의 이 원칙 줄" path=pstack/poteto-mode/SKILL.md lines=47:47

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 사용자가 `/principle-attack-the-premise`를 입력하거나, 다른 스킬이 이 원칙을 읽으라고 할 때 켜진다. `description`은 어떤 상황에 맞는 원칙인지 알려 주는 설명이다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-attack-the-premise` 입력 |
| `poteto-mode` (Core 분류) | 같은 전제를 공유한 수정 2개 이상이 같은 통과 조건에서 실패했을 때[](source:pm-trigger) |

`poteto-mode`는 원칙을 적용하기 전에 그 원칙의 `SKILL.md`를 끝까지 읽게 한다.[](source:pm-read) 답변에는 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite) 플레이북 중에서 이 원칙을 이름으로 부르는 곳은 없다.

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 모든 실패한 수정이 깔고 있던 전제를 한 문장으로 적는다[](source:p-write) | 의무 |
| 다음 수정 전에 행위자별 불균형을 집계한다. 다시 돌릴 수 있는 스크립트로 쓴다[](source:p-census) | 의무 |
| 매 실행마다 같은 몇몇이 불균형 대부분을 쥐면, 그 역할을 주는 것을 찾는다[](source:p-skew) | 의무 |
| 비대칭을 보정하지 말고 없앤다[](source:p-remove) | 의무 |
| 전제를 적고 집계가 생기기 전에는 다음 수정을 시작하지 않는다[](source:stop) | 금지 |
| 집계가 고르면 원인을 다른 데서 찾고, 집계는 근거로 남긴다[](source:stop) | 의무 |

원문은 "없애는 방법"과 "보정하는 방법"을 나란히 든다. 보정은 역할 배정을 그대로 두고, 매 실행에 일을 더 얹는다.[](source:p-remove)

| 대응 | 원문의 예 | 판단 |
| --- | --- | --- |
| 비대칭 없애기 | 역할을 행위자끼리 돌린다, 배정을 무작위로 한다, 역할을 옮긴다 | {good:채택} |
| 비대칭 보정 | 되돌림 경로, 공유 풀, 묶어서 넘기기, 주기적 재조정 | {bad:배정이 남음} |

@facts
| 발동 기준 | 같은 전제의 수정 2개 이상이 같은 통과 조건에서 실패 |
| 집계가 보여 주는 것 | 불균형을 쥔 행위자(크기 아님) |
| 멈춤 조건 | 전제 문장과 집계가 생길 때까지 다음 수정 금지 |

이 원칙은 `principle-redesign-from-first-principles`와 다르다. 그쪽은 새 요구에 맞춰 설계를 다시 짓는다. 이쪽은 지금 설계가 사실로 여기는 가정을 의심한다.[](source:distinct)

## 흐름 속 위치 {#position}

@workflow id=attack-position title="attack-the-premise 앞뒤"
| pm | poteto-mode | backend |
| me | attack-the-premise | backend |
| lever | build-the-lever | backend |
| fix | fix-root-causes | backend |
| lazy | laziness-protocol | backend |
| cite | 답변 속 인용 | frontend |
| pm > me | 같은 실패 | |
| me > lever | 집계 | |
| me > fix | 다음 왜 | |
| me > lazy | 비대칭 | |
| me > cite | 바뀐 선택 | emphasis |

| rel-id | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| r12 | `poteto-mode`의 원칙 목록 | 답변 속 원칙 이름과 바뀐 선택 | 같은 전제의 수정 2개 이상이 같은 통과 조건에서 실패 |
| r100 | - | `principle-build-the-lever` 참고 | 집계를 다시 돌릴 수 있는 스크립트로 쓸 때 |
| r101 | - | `principle-fix-root-causes` 참고 | 역할을 주는 것을 다음 "왜"로 삼을 때 |
| r102 | - | `principle-laziness-protocol` 참고 | 보정 대신 비대칭을 없앨 때 |
| r103 | - | `principle-redesign-from-first-principles` 참고 | 두 원칙을 구별할 때. 그림에서는 생략 |

판정: 참고 관계는 "그 원칙에 따라"라는 안내다. 다른 원칙을 실행하라는 위임은 아니다.[](source:p-census) 전체 흐름은 `pstack/_group-principles/principles.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/principle-attack-the-premise/SKILL.md` 전체. `pstack/poteto-mode/SKILL.md`는 15, 40, 47줄만 확인했다.
- 원장 밖 언급 검색: `pstack/` 아래 원본 `.md`에서 이 원칙의 이름과 제목을 찾았다. 위 표 밖의 언급은 없다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"행위자"가 무엇인지(프로세스, 서브에이전트, 노드 등) 원문에 명시 없음. 불균형을 "대부분" 쥐었다고 볼 수치 기준도 원문에 명시 없음.
