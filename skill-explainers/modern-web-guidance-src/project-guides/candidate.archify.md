# project-guides — 에이전트가 읽을 `guide.md`와 `demo.html`, `expectations.md` 쓰기 {#overview}

`project-guides`는 에이전트가 use case 하나의 `guide.md`, `demo.html`, `expectations.md`를 쓰거나 검토할 때 따를 규칙을 정하고, 다 쓴 뒤 `project-guide-validation`으로 자체 검증하게 하는 스킬이다. guide를 만드는 3단계 중 둘째 단계다.[](source:pg-front)[](source:pg-stages)

- 쓰는 때: `guide.md`, `expectations.md`, `demo.html`을 쓰거나 검토할 때다.[](source:pg-front)
- 결과: 자체로 완결된 `guide.md`, 이를 시연하는 `demo.html`, grader 테스트와 1:1로 대응하는 `expectations.md`가 나온다. Stage 2는 이 세 파일에서 끝난다.[](source:pg-agent)[](source:pg-exp)
- 다른 스킬과의 관계: 다 쓴 뒤 `project-guide-validation`으로 자체 검증하라고 안내하고(다음 안내), Stage 3 파일은 `gd dev`가 만든다고 `project-evals`로 이어 준다(다음 안내).[](source:pg-self)[](source:pg-agent)
- 하지 않는 것: grader에 맞추려고 `guide.md`를 고치지 않는다. grader가 `guide.md`에 없는 것을 요구하면 grader를 고친다.[](source:pg-agent)

@answer scope="modern-web-guidance-src/project-guides · 원본 파일 1개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source pg-front title="이름과 description" path=modern-web-guidance-src/project-guides/SKILL.md lines=1:4
@source pg-stages title="3단계와 권한" path=modern-web-guidance-src/project-guides/SKILL.md lines=6:14
@source pg-agent title="실제 에이전트가 보는 파일" path=modern-web-guidance-src/project-guides/SKILL.md lines=16:32
@source pg-fm title="frontmatter 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=36:53
@source pg-tone title="어조와 서식" path=modern-web-guidance-src/project-guides/SKILL.md lines=55:64
@source pg-code title="코드 조각 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=66:72
@source pg-impl title="구현 단계 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=74:84
@source pg-fb title="fallback 전략" path=modern-web-guidance-src/project-guides/SKILL.md lines=86:100
@source pg-base title="Baseline 상태 macro" path=modern-web-guidance-src/project-guides/SKILL.md lines=102:109
@source pg-poly title="polyfill 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=111:114
@source pg-macros title="build-time macro" path=modern-web-guidance-src/project-guides/SKILL.md lines=116:129
@source pg-ref title="GUIDE_REF 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=131:140
@source pg-feat title="features 폴더 재사용" path=modern-web-guidance-src/project-guides/SKILL.md lines=142:144
@source pg-exp title="expectations.md 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=148:159
@source pg-demo title="demo.html 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=161:164
@source pg-self title="자체 검증" path=modern-web-guidance-src/project-guides/SKILL.md lines=166:168
@source pf-after title="project-features의 분류 뒤 안내" path=modern-web-guidance-src/project-features/SKILL.md lines=113:121
@source uc-after title="project-use-cases의 승인 뒤 안내" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=104:108
@source uc-step4 title="project-use-cases의 guide.md 틀" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=78:98
@source pe-hub title="project-evals의 단계와 연결" path=modern-web-guidance-src/project-evals/SKILL.md lines=6:12
@source pe-exp title="project-evals의 expectations 안내" path=modern-web-guidance-src/project-evals/SKILL.md lines=52:58
@source pgv-front title="project-guide-validation의 소개" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=1:10
@source pgv-ref title="project-guide-validation의 작성 기준 안내" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=34:46
@source dg-scope title="project-discipline-guides의 범위 경고" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=3:8

## 어떻게 동작하나 {#flow span=12}

원문은 세 파일의 규칙을 절로 나누어 적고, 순서를 정하지 않는다. Stage 2가 `guide.md`, `demo.html`, `expectations.md`에서 끝나고 `project-guide-validation`으로 자체 검증한다는 것만 순서로 적혀 있다. 그래서 세 파일 사이에는 간선을 그리지 않았다. 절별 규칙은 아래 표와 상세 후보로 나눴다.[](source:pg-agent)[](source:pg-self)

@workflow id=flow-diagram title="project-guides 흐름"
| lane write | 쓰기 |
| lane check | 검증 |
| guide | guide.md 쓰기 | backend | write | source:pg-fm |
| exp | expectations.md 쓰기 | backend | write | source:pg-exp |
| demo | demo.html 쓰기 | backend | write | source:pg-demo |
| validate | 자체 검증 | backend | check | source:pg-self |
| stage3 | Stage 3 평가 | external | check | source:pg-agent |
| guide > validate | 다 쓴 뒤 |
| exp > validate | 다 쓴 뒤 |
| demo > validate | 다 쓴 뒤 |
| validate > stage3 | PR 전 | emphasis |

@steps id=flow-steps
| s-guide | guide.md 쓰기 | **입력** Stage 1의 `guide.md` 틀(`name`, `description`, `web-feature-ids`) · **출력** 본문이 채워진 `guide.md`. **처리** 에이전트가 `guide.md`를 에이전트가 보는 유일한 파일로 보고, 본문만으로 구현할 수 있게 자체 완결로 쓴다.[](source:pg-agent)[](source:pg-fm) **다음** 외부 링크와 `demo.html` 참조를 넣지 않는다. 비Baseline Widely Available 기능이 있으면 fallback 절과 `BASELINE_STATUS` 또는 `FEATURE_FALLBACKS` macro를 넣는다(MUST).[](source:pg-tone)[](source:pg-fb)[](source:pg-base) | flow-diagram | guide |
| s-exp | expectations.md 쓰기 | **입력** 완성된 `guide.md` · **출력** 자연어 bullet 목록 `expectations.md`. **처리** 에이전트가 올바른 구현이면 참인 검사를 bullet 하나에 하나씩 쓴다. 각 bullet이 `grader.ts`의 필수 test 하나가 된다.[](source:pg-exp) **다음** SME가 소유한 파일이라, 기존 문구는 뜻이 바뀔 때만 고치고 이유를 적는다. | flow-diagram | exp |
| s-demo | demo.html 쓰기 | **입력** `guide.md`와 `expectations.md` · **출력** 독립 실행 `demo.html`. **처리** 에이전트가 use case의 작동하는 참조 구현을 쓴다. 대상 기능이 Baseline Widely Available가 아니면 fallback도 보여 준다.[](source:pg-demo) **다음** 브라우저 console에 오류나 경고가 없어야 한다. | flow-diagram | demo |
| s-validate | 자체 검증 | **입력** 세 파일 · **참조** `project-guide-validation` skill · **출력** 피드백 보고서. **처리** 에이전트가 PR을 열거나 Stage 3으로 가기 전에 DevTools MCP로 demo를 돌려 expectation 정렬과 접근성을 확인한다.[](source:pg-self) **다음** 사람 SME 검토를 대체하지 않는다. | flow-diagram | validate |
| s-stage3 | Stage 3 평가 | **입력** 세 파일 · **출력** `task.md`, solution patch, `grader.ts`. **처리** `gd dev`가 Stage 3에서 이 파일들을 만든다. 사람은 손볼 수 있고 에이전트는 사람이 시킬 때만 손본다.[](source:pg-agent) → 내부: `gd dev` 구현 미확인 | flow-diagram | stage3 |

`guide.md` 규칙에서 결과를 가르는 것만 아래 표에 모았다.

| 규칙 | 판단 | 사례 | 출처 |
| --- | --- | --- | --- |
| 자체 완결 | `expectations.md`, patch, 외부 링크, `GUIDE_REF`에 기대지 않는다. 구현에 필요한 지식은 본문에 모두 넣거나 build 때 `INCLUDE`/`FEATURE`로 끌어온다 | 외부 링크 `[link text](url)`는 쓰지 않는다 | [](source:pg-agent)[](source:pg-tone) |
| 구현 단계 | 모든 web 기능을 쓸 수 있다고 가정하고 가장 알맞은 기능을 고른다. 눈에 보이는 이점이 없고 fallback만 복잡해지면 옛 기능을 쓴다 | 새롭다는 이유만으로 권하지 않는다 | [](source:pg-impl) |
| `MANDATORY` | 기능이 작동하는 데 꼭 필요한 단계에만 붙인다. 선택 단계는 optional로 표시한다 | scroll snap 추가는 optional이다 | [](source:pg-impl) |
| fallback | 비Baseline Widely Available 기능을 쓰면 fallback을 넣는다(MUST). fallback 경험을 명시한다(MANDATORY) | 선호 순서는 custom code(50줄 미만), polyfill, 라이브러리, graceful degradation, progressive enhancement다 | [](source:pg-fb) |
| browser 지원 문구 | 버전이나 지원표를 본문에 쓰지 않는다. macro로 표시한다 | `BASELINE_STATUS("feature-id")` | [](source:pg-base) |
| polyfill | 지원이 없을 때만 조건부로 불러온다(MANDATORY). `polyfill.io`는 권하지 않는다 | CDN보다 build 통합을 선호한다 | [](source:pg-poly) |
| `GUIDE_REF` | 현재 guide의 요구에 쓰지 않는다. 게시된 guide만 가리킨다. 허브, 형제 guide 구분, 인접 use case에만 쓴다 | `GUIDE_REF`를 stub이나 draft에 걸면 게시된 guide의 검증이 실패한다 | [](source:pg-ref) |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 원문에 명시 없음. 모델이 description을 보고 켠다. 호출 제한 필드는 없다[](source:pg-front) |
| 성격 | 세 파일의 작성 규칙을 정하는 절차형 스킬. Stage 2다 |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `project-features` {#r02} | **이 스킬** | 참고 | use-case 이슈가 닫히는 때를 설명하며 `project-guides`를 보라고만 안내한다.[](source:pf-after)[](source:pg-front) |
| `project-use-cases` {#r03} | **이 스킬** | 다음 안내 | use case를 Content ATL이 승인한 뒤 Stage 2로 간다. 온보딩된 Peer는 Stage 1을 건너뛰고 바로 올 수 있다.[](source:uc-after)[](source:pg-stages) |
| **이 스킬** {#r05} | `project-guide-validation` | 다음 안내 | 세 파일을 다 쓴 뒤 PR을 열거나 Stage 3으로 가기 전에 invoke하라고 한다(명령형). 받는 쪽은 "strongly encouraged"라고 쓴다. 사람 SME 검토를 대체하지 않는다.[](source:pg-self)[](source:pgv-front) |
| **이 스킬** {#r06} | `project-evals` | 다음 안내 | Stage 2는 세 파일에서 끝난다. `task.md`, golden patch, `grader.ts`는 Stage 3에서 `gd dev`가 만든다. grader가 맞지 않아도 `guide.md`를 고치지 않는다.[](source:pg-agent)[](source:pe-hub) |
| `project-evals` {#r07} | **이 스킬** | 참고 | `expectations.md` 작성 규칙은 이 스킬의 "Writing expectations.md" 절에 있다고 안내한다.[](source:pe-exp)[](source:pg-exp) |
| `project-guide-validation` {#r08} | **이 스킬** | 참고 | 정성 검토와 expectation 정렬의 기준 문서로 링크한다.[](source:pgv-ref)[](source:pg-front) |
| **이 스킬** {#r13} | `project-use-cases` | 같은 파일 | 같은 `guide.md`를 먼저 틀(Stage 1)로 만들고 나중에 본문(Stage 2)으로 채운다. 선후는 R03이다.[](source:uc-step4)[](source:pg-fm) |
| **이 스킬** {#r14} | `project-evals` | 같은 파일 | `expectations.md`는 SME가 소유한다. 이 스킬이 쓰고 `project-evals`가 `grader.ts`의 테스트와 1:1로 대응시켜 검토한다.[](source:pg-exp)[](source:pe-exp) |
| `project-discipline-guides` {#r15} | **이 스킬** | 같은 파일 | 둘 다 discipline guide의 `guide.md`를 고친다(추론). 이 스킬은 discipline guide의 expectations 작성 조건을 따로 정한다.[](source:dg-scope)[](source:pg-exp) |
| **이 스킬** {#r35} | `GOVERNANCE.md`, `docs/ATLS.md` | 참고 | 작성 권한(Peer와 ATL)과 병합 전 승인 조건을 확인하라고 한다. 범위 밖이다.[](source:pg-stages) |

@architecture id=relation-map title="project-guides와 이어지는 스킬"
| pf | project-features | backend |
| uc | project-use-cases | backend |
| self | project-guides(이 스킬) | backend |
| pgv | project-guide-validation | backend |
| pe | project-evals | backend |
| dg | project-discipline-guides | backend |
| pf > self | 참고 | dashed |
| uc > self | 다음 안내 | emphasis |
| self > pgv | 다음 안내 | emphasis |
| self > pe | 다음 안내 | emphasis |
| pe > self | 참고 | dashed |
| pgv > self | 참고 | dashed |
| dg > self | 같은 파일 | dashed |

@code source=pg-front language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | `guide.md`, `expectations.md`, `demo.html`의 작성 규칙과 macro 표를 담은 유일한 파일이다 | 세 파일을 쓰거나 검토할 때 읽는다 | guide.md 쓰기, expectations.md 쓰기, demo.html 쓰기, 자체 검증, Stage 3 평가 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| `guide.md` | 에이전트가 보는 유일한 파일이므로 완전히 자체 완결이어야 한다 | [](source:pg-agent) |
| grader가 `guide.md`에 없는 것을 요구한다 | `guide.md`를 고치지 않고 grader를 고친다(Never) | [](source:pg-agent) |
| 모든 완성된 non-draft guide | 비어 있지 않은 `expectations.md`가 있어야 한다 | [](source:pg-exp) |
| `expectations.md` bullet | 검사 하나, 선언형 문장이다. `MANDATORY` 같은 명령형 접두어를 쓰지 않는다. bullet 수 상한은 없다(5~10개는 범위가 넓다는 힌트일 뿐) | [](source:pg-exp) |
| 코드 조각 | 브라우저에서 던지지 않고 돌아가야 한다. JavaScript 예시는 ES module만 쓴다 | [](source:pg-impl)[](source:pg-code) |
| 구현 단계의 접근법 | 한 집단의 경험을 낮춰 다른 집단을 돕지 않는다. 이득이 손해보다 분명히 클 때만 하고, 하면 본문에 밝힌다. 어떤 집단도 use case에서 배제하지 않는다 | [](source:pg-impl) |
| 병합 전 | Peer/ATL 작성과 category Content ATL 승인이 필요하다. 사람 승인이다 | [](source:pg-stages) |
| 사용자 개입 | ID가 없으면 사용자에게 알린다(`web-feature-ids`). demo와 guide가 어긋나면 어느 쪽을 고칠지 사용자와 정하라는 것은 `project-guide-validation`의 지시다 | [](source:pg-fm) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- frontmatter 스키마와 `tmp-` 접두어 등록 — guide.md 쓰기 · 개요에는 요지만 담았다. `draft` 값 3가지(`stub`, `wip`, `blocked`)와 `features/pending-web-features.json` 필드는 상세로 남긴다.
- fallback 전략과 Baseline macro — guide.md 쓰기 · 개요에는 선택 순서만 담았다. `FEATURE_FALLBACKS`와 `BASELINE_STATUS` 중 고르는 기준은 상세로 남긴다.
- build-time macro 6개와 `GUIDE_REF` 규칙 — guide.md 쓰기 · 개요에는 결과를 바꾸는 규칙만 담았다.
- `expectations.md` 작성 규칙 9가지 — expectations.md 쓰기 · 개요에는 핵심만 담았다.

@callout level=open-question title="확인하지 못한 것"
| `src/core/macro-parsing.ts`, `features/`, `guides/`, `src/harness/README.md`는 이 컬렉션에 없어 macro 동작과 `MacroError` 조건을 확인하지 못했다. `gd dev`와 `pnpm build`는 지시상 동작이고 실행하지 않았다. 세 파일의 작성 순서는 원문에 명시 없음. |

읽은 원본: 텍스트 파일 1개. 제외: 없음.
