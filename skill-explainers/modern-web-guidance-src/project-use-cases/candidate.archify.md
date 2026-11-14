# project-use-cases는 web 기능 하나를 어떤 use case로 풀게 하나? {#project-use-cases-page}

`project-use-cases`는 web 기능 하나를 개발자가 하려는 일(use case) 2~5개로 풀고, guide ID와 `guide.md` frontmatter stub까지 만들어 Content ATL의 승인을 받게 한다. use case는 기능 설명이 아니라 동사로 시작하는 작업이고, description에는 해결책이나 기능 이름을 쓰지 않는 것이 기본이다.[](source:uc-task)[](source:uc-s1)

- 한 기능에서 나오는 use case는 2~5개이고, 틈새 use case는 버린다(MANDATORY).[](source:uc-scope)
- description은 동사로 시작하는 한 문장이고 최대 1024자다. guide ID는 2~4단어 명사구나 `-ing` 형태다.[](source:uc-s1)[](source:uc-s3)
- 이 단계는 stub만 만든다. 본문은 승인 뒤 Stage 2에서 쓴다.[](source:uc-s4)[](source:uc-s6)
- 커뮤니티 기여자는 Stage 1을 ATL과 먼저 맞추고, 온보딩된 Peer는 Stage 2로 바로 갈 수 있다.[](source:uc-stages)

@answer scope="로컬 원본 분석 · 외부 저장소 파일 미확인 · 실행 없음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source uc-full title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 원본" path=modern-web-guidance-src/project-use-cases/SKILL.md
@source uc-front title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 원본" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=1:4
@source uc-stages title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 원본" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=6:14
@source uc-task title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 원본" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=16:23
@source uc-scope title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 원본" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=24:31
@source uc-overlap title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 원본" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=36:43
@source uc-steps title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 원본" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=45:47
@source uc-s1 title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 원본" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=49:55
@source uc-s2 title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 원본" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=57:67
@source uc-s3 title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 원본" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=69:76
@source uc-s4 title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 원본" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=78:98
@source uc-yaml title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 원본" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=91:97
@source uc-s5 title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 원본" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=100:102
@source uc-s6 title="modern-web-guidance-src/project-use-cases/SKILL.md · 12896B · 원본" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=104:108
@source demo title="modern-web-guidance-src/project-use-cases/examples/demo.html · 833B · 예시 demo" path=modern-web-guidance-src/project-use-cases/examples/demo.html
@source pf-ref title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 관계 확인용 일부" path=modern-web-guidance-src/project-features/SKILL.md lines=113:121
@source pg-ref title="modern-web-guidance-src/project-guides/SKILL.md · 26181B · 관계 확인용 일부" path=modern-web-guidance-src/project-guides/SKILL.md lines=1:14
@source pg-stub title="modern-web-guidance-src/project-guides/SKILL.md · 26181B · 관계 확인용 일부" path=modern-web-guidance-src/project-guides/SKILL.md lines=36:46
@source pdg-ref title="modern-web-guidance-src/project-discipline-guides/SKILL.md · 5288B · 관계 확인용 일부" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=1:8
@source lock title="modern-web-guidance-src/skills-lock.json · 3621B · 설치 출처" path=modern-web-guidance-src/skills-lock.json

## 어떤 use case를 남기고 어떤 것을 버리나? {#select}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. 원문은 guides 아래 use case를 쓸 때뿐 아니라 검토할 때도 쓰라고 한다. 호출 제한 필드는 원문에 명시 없음.[](source:uc-front)

@code source=uc-front language=yaml

use case는 개발자가 구현하려는 작업이고, 기능은 그 해법의 일부일 뿐이다. 에이전트는 개발자가 무엇을 만들지는 알지만 어떤 feature가 최선인지는 모른다고 가정하고, 원하는 결과를 중심으로 쓴다.[](source:uc-task)

@facts id=numbers
| 한 기능에서 나오는 use case | 2~5개. 하위 feature마다 만들 필요는 없다(권고 범위, IMPORTANT)[](source:uc-scope) |
| description 길이 | 최대 1024자, 한 문장(MUST)[](source:uc-s1) |
| guide ID | 2~4단어 명사구나 `-ing` 형태[](source:uc-s3) |
| 합치는 기준 | 두 guide가 99% 같으면 합친다. 제안한 use case끼리 구현이 90% 같으면 통합한다[](source:uc-scope) |

| 무엇을 쓰나 | 규칙 |
|---|---|
| 작업으로 쓰기 | 모든 use case는 동사로 시작하는 작업이다. 예: "Scroll-driven animations support horizontal scrolling" 대신 "Synchronize an animation's progress with the horizontal scroll distance of a container"[](source:uc-task) |
| 일반성과 구별 | description은 다양한 사용자 prompt와 맞도록 일반적으로 쓴다. RAG가 heading 단위로 내용을 나누므로 guide는 구체적인 heading을 쓰고, heading 안의 구현은 구체적이고 모호하지 않게 쓴다. 예: "Fade an image in/out..." 대신 "Smoothly hide/show a component..."[](source:uc-task) |
| 해법을 쓰지 않기 | description에는 API 메서드, 속성, 대상 feature 이름을 기본적으로 쓰지 않는다. 검색에 정말 필요할 때만 예외다. `gd dev`가 `task.md`를 만들 때 feature와 API 이름을 지운다. "...by doing...", "...through the use of..." 같은 표현도 피한다[](source:uc-task) |
| 틈새 버리기 | 실제 개발자 prompt와 맞을 가능성이 낮은 use case와 시각적 장난은 쓰지 않는다(MANDATORY)[](source:uc-scope) |

합치기, 쪼개기, 접기는 아래 기준을 따른다.[](source:uc-scope)

| 상황 | 처리 |
|---|---|
| 두 use case의 guide가 99% 같음 | 더 일반적인 use case 하나로 합친다. 중복 guide는 context window를 낭비하고 서로 모순된다 |
| passkeys처럼 여러 단계로 복잡한 feature | 하나의 일반 guide에 몰아넣지 말고 논리적인 use case로 쪼갠다 |
| API 메서드, 속성, 옵션을 하나씩 | 각각을 use case로 세우지 않는다. 별개의 UX 목표나 개발자 문제가 아니면 더 넓은 목표의 guide로 접는다 |
| 새 Promise 메서드나 객체 복제 같은 low-level utility | 여러 use case로 억지로 쪼개지 않는다. 'Fundamental Guide' 하나(예: "Deep cloning complex objects")나 상위 discipline guide를 고려한다 |
| 한 줄 선언이나 progressive enhancement | 그 한 줄이 전부인 1:1 micro-guide를 만들지 않고 기존 discipline·topic guide에 접는다 |
| discipline 수준 guidance | 한 덩어리로 쓰지 않고 하위 guide로 쪼갠다. hub가 `{{ GUIDE_REF("guide-slug") }}`로 하위 guide를 가리킨다. 구조는 `project-discipline-guides`를 본다 |

새 use case를 만들기 전에 겹침을 확인한다. 원문은 RAG에서 guide끼리 많이 겹치면 에이전트가 맞는 것을 고르기 어렵다고 쓴다.[](source:uc-overlap)

| 확인 | 하는 일 |
|---|---|
| 기존 guide 검토 | 새 use case를 만들기 전에 같은 discipline의 기존 guide를 본다 |
| `web-feature-id` 검색 | 쓰려는 feature의 ID를 기존 guide와 열린 PR에서 검색해 어떻게 쓰이는지 본다 |
| 합칠지 구별할지 | 실질적으로 비슷하면 중복을 만들지 않는다. 기존 guide에 변형이나 구체적 지시로 넣는 방식을 고려한다 |
| 고유한 가치 | 새 guide마다 별개의 문제에 대한 별개의 해법이어야 한다 |

## 새 use case는 어떤 절차로 만드나? {#procedure}

다음 6단계는 REQUIRED다. 에이전트는 stub까지만 만들고, 승인은 ATL이 한다.[](source:uc-steps)

@workflow id=procedure-flow title="use case 만들기 6단계"
| describe | description 쓰기 | backend |
| category | category 고르기 | backend |
| mint | guide ID 만들기 | backend |
| stub | guide.md stub | backend |
| test | pnpm test | backend |
| approve | ATL 승인 | external |
| next | Stage 2 | external |
| describe > category | |
| category > mint | |
| mint > stub | |
| stub > test | |
| test > approve | PR이나 이슈 |
| approve > next | 승인 후 | emphasis |

@steps id=procedure-steps
| t1 | description 쓰기 | 문제를 푸는 일을 한 문장으로 쓴다. 명령형 동사로 시작하고 "사용자가 무엇을 하려는가?"에 답한다. 최대 1024자. name과 description의 범위를 같게 맞춘다. 예: `fetch-priority`의 use case는 "Deprioritize background data fetches made with the Fetch API to prevent network contention with user-initiated requests."[](source:uc-s1) | procedure-flow | describe |
| t2 | category 고르기 | `guides/` 아래 높은 수준의 category 하나를 고른다. 현재 하위 폴더 목록을 보고 가장 맞는 것을 쓴다.[](source:uc-s2) | procedure-flow | category |
| t3 | guide ID 만들기 | `guides/<category>/<guide-id>/`를 만든다. 디렉터리 이름과 frontmatter `name`이 guide ID다.[](source:uc-s3) | procedure-flow | mint |
| t4 | guide.md stub | 새 하위 디렉터리에 `guide.md`를 만든다. 지금은 use case 메타데이터만 넣는다. 본문은 peer review 뒤에 채운다.[](source:uc-s4) | procedure-flow | stub |
| t5 | pnpm test | `pnpm test`로 디렉터리 구조와 frontmatter 메타데이터를 검증한다.[](source:uc-s5) | procedure-flow | test |
| t6 | ATL 승인 | `guide.md` frontmatter stub을 담은 PR을 올리거나 new-use-case 이슈를 올려 category의 Content ATL에게 검토를 요청한다. 승인 뒤에 Stage 2로 간다.[](source:uc-s6) | procedure-flow | approve |

stub의 frontmatter 필수 필드는 `name`, `description`, `web-feature-ids` 세 개다. 아래는 원문 예다.[](source:uc-s4)

@code source=uc-yaml language=yaml

@callout level=open-question title="승인에서 반려되면 어떻게 하나"
| 원문은 ATL이 use case를 반려했을 때의 절차를 쓰지 않는다. ATL의 승인 기준과 응답 시간도 원문에 명시 없음. 승인을 받아야 Stage 2로 간다는 것만 명시되어 있다.[](source:uc-s6) |

## category와 guide ID는 어떻게 짓나? {#naming}

category는 사용자의 목표 이름이어야 하고 쓴 기술 이름이면 안 된다.[](source:uc-s2)

| category 규칙 | 내용 |
|---|---|
| 목표로 분류 | 같은 목표를 다른 기술로 푸는 guide는 같은 category에 둔다. 예: anchor positioning과 view transitions로 만든 탭 밑줄. 점검 질문은 "use case는 이해하지만 코드를 쓸 줄 모르는 사람이 올바른 category에 올릴 수 있는가"다[](source:uc-s2) |
| UI guide | `ui-components`는 완성된 흔한 UI 컴포넌트, `ui-behaviors`와 `ui-atoms`는 개별 동작 패턴이나 원자적 구성요소에 쓴다[](source:uc-s2) |
| 기술 이름 category | `css`, `html`, `canvas`는 해당 기술의 종합 reference guide(예: `html/html/guide.md`)가 있어 유효하다. 그 기술이 진짜 주제이거나 형제 guide가 아직 부족할 때 쓴다[](source:uc-s2) |
| 주된 목표로 분류 | 성능, 접근성, privacy, security, UX는 거의 모든 guide에 걸치는 관심사다. guide가 주로 하려는 일로 분류하고 부차적 관심사는 `guide.md` 본문에 쓴다. 예: 렌더링 비용이 있는 scroll-driven animation은 `motion`이나 `scroll`에 두고 성능 설명은 본문에 쓴다. `user-experience`는 UX 기둥 guide만 담고 개별 컴포넌트나 동작은 각자 category에 둔다[](source:uc-s2) |

guide ID는 사용자에게 직접 보인다. 에이전트가 적용한 guide를 알릴 때, release note와 `README.md`, eval 채점 UI에 나온다. 그래서 `description`은 명령형 작업 문장으로, guide ID는 주제를 가리키는 간결한 명사구로 역할을 나눈다.[](source:uc-s3)

| ID 규칙 | 나쁜 예 | 좋은 예 |
|---|---|---|
| 명령형 동사와 완전한 절을 쓰지 않는다. 동사(`optimize-`, `prevent-`, `defer-`, `avoid-`, `style-`, `create-`)와 관사(`-a-`, `-the-`)는 description에 둔다 | `deprioritize-background-fetches`, `prevent-page-scroll-under-modal-dialog`, `light-dismiss-a-dialog`, `form-fields-automatically-fit-contents` | `background-fetch-priority`, `modal-scroll-lock`, `dialog-light-dismiss`, `autosizing-form-fields`[](source:uc-s3) |
| API가 아니라 사용자 패턴이나 도메인 개념을 쓴다. CSS 선택자, JS 메서드, 파일 형식, 명세 이름은 기술 자체가 reference hub의 주제일 때만 쓴다 | `style-parent-with-has`, `anchor-positioning-tab-underline`, `css-custom-highlights` | `invalid-field-container-styling`, `sliding-tab-indicator`, `highlight-text-ranges`[](source:uc-s3) |
| 구체성을 맞춘다. 무엇을 다루는지 숨기는 한 단어, 가상의 업무 시나리오, 도메인 명사가 빠진 추상 표현을 피한다 | `drag`, `capture-location-agnostic-data` | `free-element-dragging`, `drag-to-reorder`, `timezone-agnostic-dates`[](source:uc-s3) |
| 모든 guide에 붙는 품질 형용사(`resilient-`, `faster-`, `modern-`, `smart-`, `efficient-`, `proper-`)를 뺀다 | 원문에 명시 없음 | 원문에 명시 없음[](source:uc-s3) |

## 다른 스킬과 어디에서 이어지나? {#position}

이 스킬은 Stage 1이다. 원문이 번호를 붙인 세 단계는 use case 확인, guidance 작성, guidance 평가다.[](source:uc-stages)

@workflow id=position-flow title="feature에서 Stage 2로"
| before | project-features | external | source:pf-ref |
| current | project-use-cases | backend | source:uc-stages |
| after | project-guides | external | source:pg-ref |
| hub | project-discipline-guides | external | source:pdg-ref |
| before > current | 넘김 R01 | emphasis |
| current > after | 넘김 R03 | emphasis |
| current > hub | 참고 R04 | dashed |

@steps id=position-steps
| p1 | project-features | feature 이슈가 자격과 ID를 갖춘 뒤 ATL이 use case를 찾는다. | position-flow | before |
| p2 | project-use-cases | 이 페이지의 스킬이다. stub을 만들고 ATL 승인을 받는다. | position-flow | current |
| p3 | project-guides | 승인된 use case의 본문, `demo.html`, `expectations.md`를 쓴다. | position-flow | after |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R01 · 넘김 ← `project-features` | feature 이슈가 자격을 통과한 뒤(Step 1~4) ATL이 use case를 찾는다. 새 use-case 이슈를 올리거나, stub guide를 추가하거나, 기존 guide의 `web-feature-ids`에 feature ID를 더한다. 받는 것은 이슈의 web-feature ID다.[](source:pf-ref)[](source:uc-stages) |
| R03 · 넘김 → `project-guides` | use case를 Content ATL이 승인한 뒤 Stage 2로 간다. 온보딩된 Peer는 Stage 1을 건너뛰고 바로 Stage 2로 갈 수 있다. 넘기는 것은 `name`, `description`, `web-feature-ids`를 담은 `guides/<category>/<guide-id>/guide.md` stub이다. 승인은 사람(ATL)이 하고, 이슈 닫기는 sync(`src/ci/sync-use-cases.ts`)가 한다. 지시상 동작이다.[](source:uc-stages)[](source:uc-s6)[](source:pg-ref)[](source:pf-ref) |
| R04 · 참고 → `project-discipline-guides` | "Granular Guide Decomposition" 규칙 끝에서 hub guide와 하위 guide 구조는 이 스킬을 보라고 안내한다.[](source:uc-scope)[](source:pdg-ref) |
| R13 · 공유 상태 ↔ `project-guides` | 같은 `guide.md`를 이 스킬이 stub으로 만들고(Stage 1) `project-guides`가 본문으로 채운다(Stage 2). 선후는 R03이 정한다.[](source:uc-s4)[](source:pg-stub) |
| R35 · 참고 (범위 밖) | 작성 권한(Peer와 ATL)은 `GOVERNANCE.md`와 `docs/ATLS.md`에서 확인하라고 한다. 두 파일은 이 컬렉션에 없다.[](source:uc-stages)[](source:uc-s6) |

전체 흐름은 색인 기준 `_group-guide-authoring-pipeline/guide-authoring-pipeline.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `SKILL.md`(12,896B)와 `examples/demo.html`(833B), 텍스트 2개를 끝까지 읽었다.[](source:uc-full)[](source:demo) |
| 관계 확인용 | `project-features`는 113~121줄, `project-guides`는 1~14줄과 36~46줄, `project-discipline-guides`는 1~8줄만 읽었다. `skills-lock.json`(3,621B)과 관계 원장도 확인했다[](source:pf-ref)[](source:pg-ref)[](source:pg-stub)[](source:pdg-ref)[](source:lock) |
| 제외 | 번역본은 이 컬렉션에 없다. 바이너리도 없다 |
| 부분 읽음 | 대상 스킬 폴더는 0개 |

`examples/demo.html`은 `SKILL.md`가 지목하지 않는 파일이다. 제목이 "Deprioritize Background Fetches Demo"이고 버튼을 누르면 일반 `fetch`와 `priority: 'low'` 옵션을 준 `fetch`를 함께 보낸다.[](source:demo) 판정 · 6단계의 `fetch-priority` 예(`background-fetch-priority`)와 같은 주제의 Stage 2 산출물 예시로 보이지만, 연결은 원문에 명시 없음.[](source:uc-s1)[](source:uc-s6)

원문의 Stage 번호, 수치(2~5개, 1024자, 2~4단어, 99%, 90%), MANDATORY·REQUIRED·MUST 표시, 6단계, stub 필드 3개, 승인 조건을 모두 대조했다. 원문의 `pnpm test`, PR, 이슈 작성 지시는 읽기만 했고 실행하지 않았다.

@callout level=open-question title="확인하지 못한 부분과 원문 사이 차이"
| `guides/` 디렉터리, `.github/ISSUE_TEMPLATE/new-use-case.yml`, `GOVERNANCE.md`, `docs/ATLS.md`, `guides/modern-web-guidance/SKILL.md`는 이 저장소에 없다. category 목록과 ATL 지정 규칙은 확인하지 못했다. `pnpm test`가 실제로 무엇을 검사하는지도 실행으로 확인하지 않았다. |
| `project-guides`의 frontmatter 예시는 description을 `<do thing> <with feature>`(예: "Create dynamic color systems using modern color syntax")로 쓴다. 이 스킬은 description에 feature 이름을 기본적으로 쓰지 말라고 한다. 두 문서 중 어느 쪽이 우선하는지는 원문에 명시 없음. 충돌인지 예시 표기의 차이인지 판단하지 않았다.[](source:uc-task)[](source:pg-stub) |

분석 중 원본은 수정하지 않았다. 새 분석 초안과 HTML만 썼다.
