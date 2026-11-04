# principle-fix-root-causes 스킬은 에이전트를 어떻게 바꾸나 {#fix-root-causes-skill}

`principle-fix-root-causes`를 읽은 에이전트는 디버깅할 때 증상을 덮지 않는다. 문제마다 근본 원인까지 따라가서 거기서 고친다.[](source:rule)

- 원문의 이유: 증상 땜질은 쌓인다. 우회책마다 시스템을 이해하기 어렵게 만들고, 진짜 버그는 남는다.[](source:why)
- 근본 원인 수정은 처음에는 느리지만 전체 디버깅 시간을 줄인다.[](source:why)
- 먼저 버그를 재현하고, 근본 원인에 닿을 때까지 "왜"를 묻는다. 막히면 짐작하지 말고 계측한다.[](source:pattern)
- 재시작 뒤에 실패하면 코드보다 남아 있는 상태 파일을 먼저 의심한다.[](source:restart)

@answer scope="pstack/principle-fix-root-causes · SKILL.md 1개와 호출 측 줄 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/principle-fix-root-causes/SKILL.md · 1246B · 원칙 본문(frontmatter)" path=pstack/principle-fix-root-causes/SKILL.md lines=1:5
@source rule title="pstack/principle-fix-root-causes/SKILL.md · 규칙" path=pstack/principle-fix-root-causes/SKILL.md lines=9:9
@source why title="pstack/principle-fix-root-causes/SKILL.md · 이유" path=pstack/principle-fix-root-causes/SKILL.md lines=11:11
@source pattern title="pstack/principle-fix-root-causes/SKILL.md · 패턴" path=pstack/principle-fix-root-causes/SKILL.md lines=13:19
@source restart title="pstack/principle-fix-root-causes/SKILL.md · 재시작 버그" path=pstack/principle-fix-root-causes/SKILL.md lines=21:23
@source pm-cite title="pstack/poteto-mode/SKILL.md · 20559B · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙 목록 머리말" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-trigger title="pstack/poteto-mode/SKILL.md · Verification 목록의 이 원칙 줄" path=pstack/poteto-mode/SKILL.md lines=67:67
@source attack title="pstack/principle-attack-the-premise/SKILL.md · 1941B · 쏠림 읽기" path=pstack/principle-attack-the-premise/SKILL.md lines=16:16
@source nocom title="pstack/no-comments/SKILL.md · 2560B · 4단계" path=pstack/no-comments/SKILL.md lines=22:22
@source bd title="pstack/principle-boundary-discipline/SKILL.md · 1883B · 경계에서 할 일" path=pstack/principle-boundary-discipline/SKILL.md lines=14:14
@source architect title="pstack/architect/SKILL.md · 5675B · 스케치 버리기" path=pstack/architect/SKILL.md lines=61:61

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 사용자가 `/principle-fix-root-causes`를 입력하거나, 다른 스킬이 이 원칙을 읽으라고 할 때 켜진다. `description`은 이 원칙이 어떤 상황에 맞는지 알려 주는 설명이다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-fix-root-causes` 입력 |
| `poteto-mode` (Verification 분류) | 디버깅할 때[](source:pm-trigger) |
| `no-comments` | 4단계에서 범위 안의 가장 작은 근본 원인 수정을 할 때. 의도만 안내한다[](source:nocom) |

`poteto-mode`는 에이전트가 원칙을 적용하기 전에 그 원칙의 `SKILL.md`를 끝까지 읽게 한다.[](source:pm-read) 에이전트는 답변에서 결정을 바꾼 원칙과 바뀐 선택을 밝히고, 이번 세션에 읽은 원칙만 인용한다.[](source:pm-cite) 원장에는 이 원칙을 이름으로 부르는 플레이북이 없다.

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 먼저 재현한다[](source:pattern) | 의무 |
| 근본 원인에 닿을 때까지 "왜"를 묻는다[](source:pattern) | 의무 |
| 방어 코드(guard)를 더하지 않는다. 크래시를 조용히 막는 nil 검사는 증상 땜질이다[](source:pattern) | 금지 |
| 우회책을 정당화하는 데 한 문단짜리 주석이 필요하면 코드가 틀린 것이다. 주석 말고 코드를 고친다[](source:pattern) | 판단 기준 |
| 한 곳이 아니라 패턴을 본다. 같은 패턴을 검색해 모두 고친다[](source:pattern) | 의무 |
| 막히면 짐작하지 말고 계측한다. 로그를 더하고 실제 오류를 읽는다[](source:pattern) | 의무 |
| "재시작 뒤 실패"면 설정 파일, 캐시, 락 파일, 직렬화된 상태를 먼저 의심한다[](source:restart) | 의무 |
| 상태 파일을 지워서 동작이 돌아오면 상태 검증을 우선 수정으로 삼는다[](source:restart) | 의무 |

원문은 nil 검사를 증상 땜질의 예로 든다.[](source:pattern)

| 대응 | 원문의 예 | 판단 |
| --- | --- | --- |
| 증상 땜질 | 크래시를 막으려고 nil 검사를 더한다 | {bad:증상만 덮음} |
| 근본 원인 수정 | 왜 `nil`이 왔는지 끝까지 따라가 거기서 고친다 | {good:채택} |

"근본 원인 수정" 칸은 원문 규칙을 이 예에 적용한 것이다(판정).[](source:rule) 이 원칙을 적용하지 않는 경우는 원문에 명시 없음.

## 흐름 속 위치 {#position}

@workflow id=root-position title="fix-root-causes 앞뒤"
| pm | poteto-mode | backend |
| atk | attack-the-premise | backend |
| nocom | no-comments | backend |
| me | fix-root-causes | backend |
| cite | 답변 속 인용 | frontend |
| pm > me | 디버깅 | |
| atk > me | 다음 왜 | |
| nocom > me | 의도 안내 | |
| me > cite | 바뀐 선택 | emphasis |

| rel-id | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| r12 | `poteto-mode`의 원칙 목록 | 답변 속 원칙 이름과 바뀐 선택 | 디버깅 |
| r101 | `principle-attack-the-premise`의 쏠림 분석 | - | 역할을 주는 것이 다음 "왜"일 때[](source:attack) |
| r67 | `no-comments` 4단계 | - | 의도만 안내한다. 범위 밖 수정을 허락하지 않는다 |

`no-comments`는 이 원칙이 범위를 넓히거나 범위 밖 사례를 고칠 권한을 주지 않는다고 못 박는다.[](source:nocom) 판정: 이 원칙의 "패턴을 모두 고친다"는 그 범위 안에서만 적용된다. 원장에는 없지만 `architect`도 이 원칙을 이름으로 언급한다(rel-id 없음). 이 스킬은 구현 마찰이 스케치로 흡수되지 않으면 스케치를 버리라고 한다.[](source:architect)

전체 흐름은 `pstack/_group-principles/principles.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/principle-fix-root-causes/SKILL.md` 전체. 호출 측은 `pstack/poteto-mode/SKILL.md` 15, 40, 67줄과 위에 인용한 줄만 확인했다.
- 원장 밖 언급 검색: `pstack/` 아래 원본 `.md`에서 이 원칙의 이름과 제목을 찾았다. 원장 밖 언급은 1곳이다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지에 쓴 동작은 모두 원문이 지시하는 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"방어 코드를 더하지 않는다"가 경계에서 하는 검증까지 막는지는 원문에 명시 없음. `principle-boundary-discipline`은 경계에서 방어적으로 다루라고 한다.[](source:bd) 두 원칙 사이의 우선순위는 어느 쪽에도 없다.
