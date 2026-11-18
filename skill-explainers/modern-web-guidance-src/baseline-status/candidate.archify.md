# baseline-status — web 기능의 browser 지원과 Baseline 상태 조회 {#overview}

`baseline-status`는 에이전트가 web 기능이 쓸 만한지 확인하거나 browser 지원 자료가 필요할 때, `pnpm baselinestatus` 명령으로 조회해 Baseline 상태를 읽게 하는 스킬이다.[](source:bs-use)

- 쓰는 때: web 기능이 쓸 준비가 됐는지 확인할 때, 특정 기능의 browser 지원 자료가 필요할 때다.[](source:bs-use)
- 결과: 조회 출력의 상태 코드를 Widely, Newly, Limited 세 가지 말로 풀어 읽는다.[](source:bs-map)
- 다른 스킬과의 관계: `project-guide-validation`이 기능의 지원 상태를 조회할 때 이 스킬을 참고하라고 안내한다(참고).[](source:pgv-ref)
- 하지 않는 것: 원문에 상태별로 어떻게 행동하라는 지시는 없다. 조회와 해석까지만 적혀 있다.[](source:bs-map)

@answer scope="modern-web-guidance-src/baseline-status · 원본 파일 1개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source bs-front title="이름과 description" path=modern-web-guidance-src/baseline-status/SKILL.md lines=1:4
@source bs-use title="쓰는 때" path=modern-web-guidance-src/baseline-status/SKILL.md lines=8:8
@source bs-search title="기본 검색 명령" path=modern-web-guidance-src/baseline-status/SKILL.md lines=12:17
@source bs-json title="JSON 출력 명령" path=modern-web-guidance-src/baseline-status/SKILL.md lines=19:25
@source bs-map title="상태 코드 해석" path=modern-web-guidance-src/baseline-status/SKILL.md lines=27:32
@source pgv-ref title="project-guide-validation의 안내" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=79:79
@source lock title="설치 기록의 skillPath" path=modern-web-guidance-src/skills-lock.json lines=3:8

## 어떻게 동작하나 {#flow span=12}

원문은 명령 두 가지(기본 검색, JSON 출력)와 상태 해석표를 준다. 순서는 조회한 뒤 출력을 읽는 것뿐이다. JSON 출력은 구조화된 출력이 필요할 때 고르는 변형이고, 어느 쪽을 쓸지는 원문에 명시 없음.[](source:bs-json)

@workflow id=flow-diagram title="baseline-status 흐름"
| run | 조회 실행 | backend | source:bs-search |
| read | 상태 해석 | backend | source:bs-map |
| run > read | 출력 |

@steps id=flow-steps
| s-run | 조회 실행 | **입력** 기능 ID나 설명 검색어 · **실행** `pnpm baselinestatus <query>` 또는 `pnpm baselinestatus <query> --json` · **출력** 일치한 기능과 상태. **처리** 에이전트가 검색어로 기능을 찾는다. 원문 예시는 `pnpm baselinestatus over`다.[](source:bs-search)[](source:bs-json) **다음** 구조화된 출력이 필요하면 `--json`을 붙인다. → 내부: 구현 미확인 | flow-diagram | run |
| s-read | 상태 해석 | **입력** 조회 출력의 상태 코드 · **출력** Widely, Newly, Limited 중 하나. **처리** 에이전트가 `high`는 Widely, `low`는 Newly, `false`는 Limited로 읽는다.[](source:bs-map) | flow-diagram | read |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 원문에 명시 없음. 모델이 description을 보고 켠다. 호출 제한 필드는 없다[](source:bs-front) |
| 성격 | 명령 하나를 실행하고 상태 코드를 풀어 읽는 조회 스킬 |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `project-guide-validation` {#r12} | **이 스킬** | 참고 | 기능이 widely available인지 조회할 때 `web-baseline` 스킬과 `pnpm baselinestatus`를 쓰라고 한다. 제안이다. 링크의 `web-baseline`은 이 컬렉션에 폴더가 없고 `skills-lock.json`의 `skillPath`가 이 스킬을 가리켜 같은 스킬로 읽었다(판정).[](source:pgv-ref)[](source:lock) |

@architecture id=relation-map title="baseline-status와 이어지는 스킬"
| pgv | project-guide-validation | backend |
| self | baseline-status(이 스킬) | backend |
| pgv > self | 참고 |

@code source=bs-front language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 조회 명령 두 가지와 상태 해석표를 담은 유일한 파일이다 | 스킬이 켜질 때 읽는다 | 조회 실행, 상태 해석 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 상태 코드가 `false`다 | Limited, 즉 모든 주요 browser가 아직 지원하지 않는 상태로 읽는다 | [](source:bs-map) |
| 상태 코드가 `low`다 | Newly, 즉 모든 주요 browser가 최근에 지원하기 시작한 상태로 읽는다 | [](source:bs-map) |
| 상태 코드가 `high`다 | Widely, 즉 모든 주요 browser가 오래 지원한 상태로 읽는다 | [](source:bs-map) |
| 상태별 사용 가능 여부 판단 규칙 | 원문에 명시 없음 | [](source:bs-use) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 없음. 원문이 33줄뿐이라 개요에 모두 담았다.

@callout level=open-question title="확인하지 못한 것"
| `pnpm baselinestatus`의 구현은 이 컬렉션에 없어 확인하지 못했다. 이 스킬과 같은 이름의 원격 경로는 `.agents/skills/web-baseline/SKILL.md`다.[](source:lock) |

읽은 원본: 텍스트 파일 1개. 제외: 없음.
