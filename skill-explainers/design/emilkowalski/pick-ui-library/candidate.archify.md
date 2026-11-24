# pick-ui-library — 작업에 맞는 UI 라이브러리를 큐레이션 목록에서 고른다 {#overview}

`pick-ui-library`는 에이전트가 프론트엔드 UI 작업을 요청받았을 때, 이미 정해진 큐레이션 목록과 프로젝트에 설치된 패키지 목록을 대조해 가장 알맞은 라이브러리 하나를 고르고 필요 시 설치하게 하는 스킬이다.[](source:s-fm)[](source:s-how)

- 사용자가 직접 `/pick-ui-library`로 호출할 때만 켜지며(`disable-model-invocation: true`), 질문 없이 처음 부르면 정해진 한 줄만 답하고 대기한다.[](source:s-fm)[](source:s-init)
- 결과로 작업에 맞는 단일 라이브러리 추천과 한 문장 용도 설명이 남으며, 설치·연결 요청이 함께 있으면 의존성 추가와 코드 연결까지 수행한다.[](source:s-how)
- 다른 스킬과의 관계: `animate`가 애니메이션이 아니라 UI 컴포넌트 자체가 필요할 때 멈추고 이 스킬을 의무적으로 읽으며(호출), `prototype`은 의존성 선택 대안으로 이 스킬을 가리킨다.
- 사용자가 요청하거나 목록에 진짜 없는 작업이 아닌 한 목록 밖 대안으로 바꾸지 않으며, `package.json`에 경쟁 라이브러리가 이미 있으면 요청 없이 의존성을 갈아엎지 않는다.[](source:s-init)[](source:s-how)

@answer scope="design/emilkowalski/pick-ui-library · 원본 파일 1개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source s-fm title="frontmatter: name, description, disable-model-invocation" path=design/emilkowalski/pick-ui-library/SKILL.md lines=1:5
@source s-init title="질문 없이 첫 호출 시 응답과 목록 우선 원칙" path=design/emilkowalski/pick-ui-library/SKILL.md lines=9:17
@source s-how title="4단계 선택·확인·추천 절차" path=design/emilkowalski/pick-ui-library/SKILL.md lines=19:24
@source s-ui title="UI 컴포넌트·프리미티브 6종" path=design/emilkowalski/pick-ui-library/SKILL.md lines=26:38
@source s-motion title="모션·시각 효과 6종과 CSS 전환 경계" path=design/emilkowalski/pick-ui-library/SKILL.md lines=39:50
@source s-chart title="차트 2종 분기(Liveline 대 recharts)" path=design/emilkowalski/pick-ui-library/SKILL.md lines=52:60
@source s-inter title="상호작용·성능 2종과 상태·스타일링 4종" path=design/emilkowalski/pick-ui-library/SKILL.md lines=61:78
@source s-mis title="자주 놓치는 오용 6가지" path=design/emilkowalski/pick-ui-library/SKILL.md lines=79:86
@source rel-anim title="animate의 UI 컴포넌트 필요 시 호출 규칙" path=design/emilkowalski/animate/SKILL.md lines=81:81
@source rel-proto title="prototype의 의존성 선택 대안 안내" path=design/emilkowalski/prototype/SKILL.md lines=17:17

## 어떻게 동작하나 {#flow span=12}

질문 없이 처음 호출하면 정해진 한 줄만 답하고 대기한다.[](source:s-init) 본문에는 5개 범주 총 20개 라이브러리 목록과 함께 자주 틀리는 선택 6가지(직접 만든 토스트·`<div>` 드롭다운·텍스트 재렌더 숫자 애니메이션 등)를 잡아내는 기준이 들어 있다.[](source:s-ui)[](source:s-inter)[](source:s-mis)

@workflow id=flow-diagram title="pick-ui-library 흐름"
| task | 작업 식별 | backend | source:s-how |
| pkg | package.json 확인 | backend | source:s-how |
| listed | 목록에 있나? | backend | source:s-how |
| pick | 단일 추천·설치 | backend | source:s-how |
| outside | 목록 외 대안 안내 | backend | source:s-how |
| task > pkg | 작업 분류 |
| pkg > listed | 설치 여부 확인 |
| listed > pick | 포함 | emphasis |
| listed > outside | 미포함 | dashed |

@steps id=flow-steps
| s-task | 작업 식별 | **입력** 사용자 요청 · **출력** 작업 범주. **처리** 사용자가 특정 라이브러리 이름을 말했더라도 실제 UI 과제가 무엇인지(예: 드롭다운은 UI 프리미티브) 먼저 가른다.[](source:s-how) **다음** 단순 hover·fade면 모션 라이브러리 대신 일반 CSS transition이 맞다고 본다.[](source:s-motion) | flow-diagram | task |
| s-pkg | package.json 확인 | **입력** 프로젝트의 `package.json` · **출력** 기존 의존성 파악 결과. **처리** 이미 목록의 라이브러리가 깔려 있으면 그것을 쓰고, 경쟁 라이브러리가 깔려 있는지 확인한다.[](source:s-how) | flow-diagram | pkg |
| s-listed | 목록에 있나? | **입력** 식별된 작업과 5개 범주 20개 큐레이션 표 · **출력** 목록 포함 여부. **처리** UI 프리미티브·모션·차트·상호작용·상태/스타일 표에 작업이 들어맞는지 판단한다.[](source:s-how)[](source:s-ui) **다음** 실시간 스트리밍 차트는 `Liveline`, 그 밖의 차트는 `recharts`, 단순 조건부 클래스는 `clsx`, 타입 기반 변형은 `cva`로 가른다.[](source:s-chart)[](source:s-inter) | flow-diagram | listed |
| s-pick | 단일 추천·설치 | **입력** 목록에서 고른 라이브러리와 요청 범위 · **출력** 한 문장 설명 또는 설치·연결된 코드. **처리** 선택지를 여러 개 나열하지 않고 하나만 추천하며, 요청이 포함되면 설치와 연결까지 마친다.[](source:s-how) **다음** `package.json`에 경쟁 라이브러리가 이미 있으면 추천 사실만 알리고 요청 없이 교체하지 않는다.[](source:s-how) | flow-diagram | pick |
| s-outside | 목록 외 대안 안내 | **입력** 목록에서 다루지 않는 작업 · **출력** 목록 밖 추천안. **처리** 큐레이션 목록에 해당 작업이 없음을 분명히 밝힌 뒤 에이전트의 일반 지식으로 대안을 추천한다.[](source:s-how) | flow-diagram | outside |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 호출형(`/pick-ui-library`). `disable-model-invocation: true`가 설정되어 모델이 자동으로 켜지 않는다.[](source:s-fm) |
| 성격 | 절차형(4단계 조회·추천). 취향 기반으로 고른 20개 큐레이션 목록에서 작업당 단일 라이브러리를 고른다.[](source:s-init)[](source:s-how) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `animate` {#rel-r13} | **이 스킬** | 호출 | 의무: 애니메이션이 아니라 토스트·서랍·커맨드 메뉴·드롭다운 같은 UI 컴포넌트 자체가 필요하면 멈추고 `../pick-ui-library/SKILL.md`를 읽는다(사용자 개입 없음).[](source:rel-anim) |
| `prototype` {#rel-r42} | **이 스킬** | 대안 | 역할 경계: `prototype`은 UI 버전 비교 탐색만 맡고, 의존성 선택은 사용자가 이 스킬을 고른다.[](source:rel-proto) |

@architecture id=relation-map title="pick-ui-library와 이어지는 스킬"
| anim | animate | backend |
| proto | prototype | backend |
| self | pick-ui-library(이 스킬) | backend |
| anim > self | 호출 |
| proto > self | 대안 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 첫 응답, 4단계 사용법, 5개 범주 20개 큐레이션 표, 오용 6가지 목록을 담은 본문 86줄 | 사용자가 `/pick-ui-library`를 부르거나 `animate`가 직접 읽을 때 연다 | 작업 식별, package.json 확인, 목록에 있나?, 단일 추천·설치, 목록 외 대안 안내 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 질문 없이 처음 호출될 때 | 정해진 한 문장만 답하고 대기한다. | [](source:s-init) |
| 모델이 이 스킬을 자동으로 켜려 할 때 | `disable-model-invocation: true` 때문에 자동 호출되지 않는다. | [](source:s-fm) |
| 목록이 답을 주는데 사용자가 다른 대안을 요구하지 않았을 때 | 목록 밖 라이브러리를 임의로 대신 추천하지 않는다. | [](source:s-init) |
| 작업에 명확한 답이 목록에 있을 때 | 여러 후보를 메뉴처럼 나열하지 않고 단 하나의 라이브러리와 한 문장 용도만 제시한다. | [](source:s-how) |
| `package.json`에 경쟁 라이브러리가 이미 설치되어 있을 때 | 큐레이션 추천만 표시하고, 사용자 요청 없이 기존 의존성을 교체하지 않는다. | [](source:s-how) |
| 작업이 큐레이션 목록에 없을 때 | 목록을 벗어났음을 명시적으로 밝힌 뒤 추천한다. | [](source:s-how) |
| 단순 호버·페이드만 필요하거나 라이브러리를 직접 만들려 할 때 | 호버·페이드는 `motion` 대신 CSS transition을 쓰고, 토스트(`Sonner`)·드롭다운(`base-ui`)·숫자(`NumberFlow`)·긴 목록(`Virtuoso`)·공유 상태(`zustand`)·조건부 클래스(`clsx`/`cva`)는 수작업 구현을 막는다. | [](source:s-motion)[](source:s-mis) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 5개 범주 20개 라이브러리 전체 매핑과 오용 6가지 — 맡을 개요 항목: 목록에 있나? · 각 라이브러리 URL과 세부 분기 기준(`Liveline` 대 `recharts`, `clsx` 대 `cva`, `Sonner`·`Vaul`·`base-ui` 등)을 개요에서 줄였다.

@callout level=open-question title="확인하지 못한 것"
| 설치 요청 시 프로젝트의 패키지 매니저(`npm`, `pnpm`, `yarn`, `bun`)를 어떻게 고르고 실행할지는 원문에 명시 없음.[](source:s-how) |

읽은 원본: 텍스트 파일 1개. 제외: `SKILL.ko.stale.md` 1개(낡은 번역본).
