# project-use-cases — web 기능 하나를 use case 2~5개로 풀고 guide 틀 만들기 {#overview}

`project-use-cases`는 에이전트가 web 기능 하나를 개발자가 하려는 일(use case) 2~5개로 풀고, 각각에 guide ID와 `guide.md` 틀을 만들어 Content ATL의 승인을 받게 하는 스킬이다. guide를 만드는 3단계 중 첫 단계다.[](source:uc-goal)[](source:uc-scope)

- 쓰는 때: `guides/` 아래 use case를 쓰거나 검토할 때다. description은 새 guide를 만드는 첫 단계라고 쓴다.[](source:uc-front)
- 결과: `guides/<category>/<guide-id>/guide.md` 틀(frontmatter만 있음)과 승인 요청(PR이나 new-use-case 이슈)이 나온다. 본문은 승인 뒤 Stage 2에서 채운다.[](source:uc-step4)[](source:uc-step6)
- 다른 스킬과의 관계: 승인되면 `project-guides`(Stage 2)로 간다(다음 안내). `project-features`가 앞 단계이고, 허브 guide 구조는 `project-discipline-guides`를 참고한다.[](source:uc-after)[](source:uc-gov)
- 하지 않는 것: use case 설명에 해결 방법(API 이름)을 쓰지 않고, 틈새 use case는 넣지 않는다(MANDATORY).[](source:uc-what)[](source:uc-niche)

@answer scope="modern-web-guidance-src/project-use-cases · 원본 파일 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source uc-front title="이름과 description" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=1:4
@source uc-goal title="목표와 3단계" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=6:12
@source uc-gov title="권한과 fast-track" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=14:14
@source uc-task title="행동 중심 use case 정의" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=18:21
@source uc-what title="WHAT not HOW" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=22:23
@source uc-scope title="범위 2~5개" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=24:24
@source uc-niche title="틈새 use case 제외" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=25:31
@source uc-overlap title="겹침 줄이기" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=36:43
@source uc-step1 title="1단계 설명 쓰기" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=47:55
@source uc-step2 title="2단계 category 고르기" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=57:67
@source uc-step3 title="3단계 guide ID" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=69:76
@source uc-step4 title="4단계 guide.md 틀" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=78:98
@source uc-step5 title="5단계 검증" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=100:102
@source uc-step6 title="6단계 승인 요청" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=104:106
@source uc-after title="승인 뒤 Stage 2" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=108:108
@source uc-demo title="예시 demo.html" path=modern-web-guidance-src/project-use-cases/examples/demo.html lines=1:12
@source pf-after title="project-features의 분류 뒤 안내" path=modern-web-guidance-src/project-features/SKILL.md lines=113:121
@source pf-handle title="project-features의 sync와 checklist" path=modern-web-guidance-src/project-features/SKILL.md lines=99:111
@source pg-front title="project-guides 이름과 소개" path=modern-web-guidance-src/project-guides/SKILL.md lines=1:12
@source pg-stub title="project-guides의 guide.md 단계" path=modern-web-guidance-src/project-guides/SKILL.md lines=36:46
@source pgv-ref title="project-guide-validation의 작성 기준 안내" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=34:34
@source dg-front title="project-discipline-guides 이름과 description" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=1:8

## 어떻게 동작하나 {#flow span=12}

원문은 "REQUIRED" 6단계를 번호로 지시한다. 앞쪽의 판단 원칙(행동 중심, WHAT not HOW, 병합과 분리, 겹침 점검)은 1~3단계의 입력을 정하는 기준이다. 6단계 뒤에 승인이 나면 Stage 2로 간다. 사람 승인 지점이 하나 있고, 온보딩된 Peer는 Stage 1을 건너뛰고 Stage 2로 바로 갈 수 있다.[](source:uc-step1)[](source:uc-gov)

@workflow id=flow-diagram title="project-use-cases 흐름"
| lane decide | 정하기 |
| lane stub | 틀 만들기 |
| lane approve | 승인 |
| desc | 설명 쓰기 | backend | decide | source:uc-step1 |
| cat | category 고르기 | backend | decide | source:uc-step2 |
| mint | guide ID 만들기 | backend | decide | source:uc-step3 |
| stub | guide.md 틀 쓰기 | backend | stub | source:uc-step4 |
| test | 틀 검증 | backend | stub | source:uc-step5 |
| ask | 승인 요청 | external | approve | source:uc-step6 |
| ok | 승인됐나? | backend | approve | source:uc-after |
| desc > cat | |
| cat > mint | |
| mint > stub | |
| stub > test | |
| test > ask | 통과 |
| ask > ok | 검토 |
| ok > desc | 아니오, 고친다 | dashed |

@steps id=flow-steps
| s-desc | 설명 쓰기 | **입력** 기능과 개발자가 하려는 일 · **출력** 한 문장 `description`(최대 1024자). **처리** 에이전트가 동사로 시작하는 한 문장으로 "사용자가 무엇을 하려는가"에 답한다. 예: "Deprioritize background data fetches made with the Fetch API ..."[](source:uc-step1) **다음** guide ID(`name`)와 `description`의 범위가 같아야 한다. 범위가 다르면 안 된다. | flow-diagram | desc |
| s-cat | category 고르기 | **입력** use case · **참조** `guides/` 아래 하위 폴더 목록 · **출력** category 하나. **처리** 에이전트가 하위 폴더를 나열해 가장 알맞은 것을 고르되, 구현 기술이 아니라 사용자 목표로 분류한다.[](source:uc-step2) **다음** 성능·접근성 같은 횡단 관심사는 category로 고르지 않고 `guide.md` 본문에서 다룬다. | flow-diagram | cat |
| s-mint | guide ID 만들기 | **입력** use case와 category · **출력** `guides/<category>/<guide-id>/` 폴더 이름. **처리** 에이전트가 주제를 가리키는 2~4단어 명사구나 `-ing` 형태로 ID를 짓는다. 명령형 동사와 API 이름은 쓰지 않는다.[](source:uc-step3) | flow-diagram | mint |
| s-stub | guide.md 틀 쓰기 | **입력** ID, 설명, web feature ID · **출력** `guide.md`(frontmatter만). **처리** 에이전트가 `name`, `description`, `web-feature-ids` 세 필드만 쓴 틀을 만든다. 본문은 peer review 뒤에 채운다.[](source:uc-step4) | flow-diagram | stub |
| s-test | 틀 검증 | **입력** 만든 폴더와 frontmatter · **실행** `pnpm test` · **출력** 구조·metadata 검증 결과. **처리** 에이전트가 use case 폴더 구조와 frontmatter를 확인한다. → 내부 구현 미확인[](source:uc-step5) | flow-diagram | test |
| s-ask | 승인 요청 | **입력** `guide.md` 틀 · **출력** PR 또는 new-use-case 이슈. **처리** 에이전트가 category의 Content ATL이 검토하도록 PR을 올리거나 new-use-case 이슈(`.github/ISSUE_TEMPLATE/new-use-case.yml` 형식)를 올린다.[](source:uc-step6) **다음** 사람 ATL이 승인한다. 승인 방식은 원문에 명시 없음. | flow-diagram | ask |
| s-ok | 승인됐나? | **입력** ATL 검토 결과 · **출력** Stage 2 진입 또는 수정. **처리** 승인되면 `project-guides` skill로 `guide.md`, `demo.html`, `expectations.md`를 쓴다.[](source:uc-after) **다음** 아니오일 때 수정 절차는 원문에 명시 없음. 그림의 되돌림 간선은 판정이다. | flow-diagram | ok |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 원문에 명시 없음. 모델이 description을 보고 켠다. 호출 제한 필드는 없다[](source:uc-front) |
| 성격 | 6단계로 use case와 guide 틀을 만드는 절차형 스킬. Stage 1이다 |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `project-features` {#r01} | **이 스킬** | 다음 안내 | 이슈가 자격을 통과한 뒤 ATL이 use case를 찾는다. 이슈 comment·본문·label·status·닫기 전에는 사용자에게 확인한다.[](source:pf-after)[](source:uc-goal) |
| **이 스킬** {#r03} | `project-guides` | 다음 안내 | use case를 Content ATL이 승인한 뒤 Stage 2로 간다. 온보딩된 Peer는 Stage 1을 건너뛰고 바로 Stage 2로 갈 수 있다.[](source:uc-gov)[](source:uc-after)[](source:pg-front) |
| **이 스킬** {#r04} | `project-discipline-guides` | 참고 | "Granular Guide Decomposition" 규칙 끝에서 허브 guide와 하위 guide 구조는 이 스킬을 보라고 안내한다.[](source:uc-niche)[](source:dg-front) |
| `project-guide-validation` {#r09} | **이 스킬** | 참고 | guide를 `project-use-cases`와 `project-guides`의 작성 기준에 대조하라고 한다.[](source:pgv-ref)[](source:uc-front) |
| **이 스킬** {#r13} | `project-guides` | 같은 파일 | 같은 `guide.md`를 먼저 틀로 만들고(Stage 1) 나중에 본문으로 채운다(Stage 2). 선후는 R03이다.[](source:uc-step4)[](source:pg-stub) |
| **이 스킬** {#r34} | sync(`src/ci/sync-use-cases.ts`)와 이슈 checklist | 같은 파일 | 범위 밖이다. 이슈 checklist는 sync가 다시 쓴다. 이 스킬 본문에는 sync 언급이 없고 `project-features` 본문에 근거가 있다.[](source:pf-handle) |

@architecture id=relation-map title="project-use-cases와 이어지는 스킬"
| pf | project-features | backend |
| self | project-use-cases(이 스킬) | backend |
| pg | project-guides | backend |
| dg | project-discipline-guides | backend |
| pgv | project-guide-validation | backend |
| pf > self | 다음 안내 | emphasis |
| self > pg | 다음 안내 | emphasis |
| self > dg | 참고 | dashed |
| pgv > self | 참고 | dashed |

@code source=uc-front language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | use case 판단 원칙과 6단계 절차를 담는다 | use case를 쓰거나 검토할 때 읽는다 | 설명 쓰기, category 고르기, guide ID 만들기, guide.md 틀 쓰기, 틀 검증, 승인 요청, 승인됐나? |
| `examples/demo.html` | "Deprioritize Background Fetches" 데모 HTML이다. `SKILL.md`가 이 파일을 가리키는 문장은 없다 | 원문에 읽는 조건 명시 없음 | 원문에 명시 없음[](source:uc-demo) |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| use case 수 | 기능당 2~5개를 목표로 한다. 모든 하위 기능에 use case가 필요한 것은 아니다(IMPORTANT) | [](source:uc-scope) |
| 틈새 기능이나 시각 효과 | 넣지 않는다(MANDATORY). 실제 개발자 요청과 맞을 가능성이 낮으면 뺀다 | [](source:uc-niche) |
| 두 use case의 guide가 99% 같다 | 하나로 합친다 | [](source:uc-niche) |
| 복잡한 기능(passkey 등) | 한 guide에 넣지 않고 use case로 나눈다 | [](source:uc-niche) |
| 한 줄 progressive enhancement나 저수준 utility | 1:1 micro-guide를 만들지 않는다. 더 넓은 guide나 discipline guide에 합친다 | [](source:uc-niche) |
| 기존 guide와 실질적으로 같다 | 중복을 만들지 않는다. 기존 guide에 변형으로 넣는 방법을 생각한다 | [](source:uc-overlap) |
| `description` | 최대 1024자, 한 문장, 명령형 동사로 시작한다(MUST) | [](source:uc-step1) |
| 위치 | `guides/` 아래 단일 category다(MUST). 구현이 아니라 목표로 분류한다 | [](source:uc-step2) |
| 승인 | category의 Content ATL이 검토한다. 사람 승인이고 자동 검증으로 대체되지 않는다(판정) | [](source:uc-step6) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- guide ID 짓기 규칙 4가지와 고친 예 — guide ID 만들기 · 개요에는 형식만 담았다. 예: `deprioritize-background-fetches`를 `background-fetch-priority`로 바꾼다.
- category 고르기 기준 — category 고르기 · 개요에는 결론만 담았다. UI 계열 category 구분과 기술 영역 category 설명은 상세로 남긴다.
- 좋은 use case를 판단하는 원칙 10가지 — 설명 쓰기 · 개요에는 결과를 바꾸는 규칙만 담았다.

@callout level=open-question title="확인하지 못한 것"
| `GOVERNANCE.md`, `docs/ATLS.md`, `.github/ISSUE_TEMPLATE/new-use-case.yml`, `guides/` 폴더는 이 컬렉션에 없다. Peer의 권한 범위와 `pnpm test`의 동작은 확인하지 못했다. 명령은 지시상 동작이고 실행하지 않았다. `examples/demo.html`은 30줄 중 1~12줄만 확인했다. |

읽은 원본: 텍스트 파일 2개. 제외: 없음.
