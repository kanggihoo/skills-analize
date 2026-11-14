# project-guides는 언제 켜지고, 무엇을 강제하고, 무엇을 금지하나? {#project-guides-page}

`project-guides`는 `guide.md`, `expectations.md`, `demo.html`을 쓰거나 리뷰할 때 켜는 작성 규칙이다. 핵심은 `guide.md`가 코딩 에이전트가 실제로 보는 유일한 파일이라는 전제다. 그래서 `guide.md`는 외부 링크나 다른 파일에 기대지 않고 혼자 완결돼야 한다.[](source:front)[](source:seen)[](source:self)

- 글쓰기 규칙은 `MANDATORY` 같은 강한 표지를 꼭 필요한 곳에만 쓰고, 모델이 이미 아는 내용은 빼라고 요구한다. 외부 링크와 `demo.html` 언급은 금지한다.[](source:tone)[](source:steps)
- widely available이 아닌 기능을 쓰면 fallback 절과 `FEATURE_FALLBACKS` 또는 `BASELINE_STATUS` 매크로가 필수다. 브라우저 지원 현황을 본문에 직접 쓰는 것은 금지다.[](source:fallback)[](source:baseline)
- `expectations.md`의 bullet 하나는 grader 테스트 하나가 된다. 그래서 bullet 하나에 검사 하나만 쓰고, 선택 사항은 필수 검사로 올리지 않는다.[](source:exp-rules)
- 다 쓴 뒤에는 `project-guide-validation`으로 자체 검증하고 PR을 연다. 사람 SME 승인은 별도로 필요하다.[](source:selfval)[](source:gov)

@answer scope="로컬 원본 분석 · SKILL.md 168줄 전체 읽음 · 원본 저장소의 `GOVERNANCE.md`, `src/`, `guides/`는 이 컬렉션에 없어 확인하지 못함 · 대상 스킬의 명령은 실행하지 않음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source full title="modern-web-guidance-src/project-guides/SKILL.md · 26181B · 스킬 본문" path=modern-web-guidance-src/project-guides/SKILL.md
@source front title="modern-web-guidance-src/project-guides/SKILL.md · frontmatter" path=modern-web-guidance-src/project-guides/SKILL.md lines=1:4
@source stages title="modern-web-guidance-src/project-guides/SKILL.md · 3단계 중 Stage 2" path=modern-web-guidance-src/project-guides/SKILL.md lines=6:12
@source gov title="modern-web-guidance-src/project-guides/SKILL.md · 거버넌스 안내" path=modern-web-guidance-src/project-guides/SKILL.md lines=14:14
@source seen title="modern-web-guidance-src/project-guides/SKILL.md · 에이전트가 보는 파일" path=modern-web-guidance-src/project-guides/SKILL.md lines=16:28
@source impl2 title="modern-web-guidance-src/project-guides/SKILL.md · Stage 2의 끝과 grader" path=modern-web-guidance-src/project-guides/SKILL.md lines=30:30
@source self title="modern-web-guidance-src/project-guides/SKILL.md · 자기완결 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=32:32
@source fm title="modern-web-guidance-src/project-guides/SKILL.md · frontmatter 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=36:53
@source tmp title="modern-web-guidance-src/project-guides/SKILL.md · tmp- 기능 ID" path=modern-web-guidance-src/project-guides/SKILL.md lines=49:49
@source draft title="modern-web-guidance-src/project-guides/SKILL.md · draft 값" path=modern-web-guidance-src/project-guides/SKILL.md lines=50:53
@source tone title="modern-web-guidance-src/project-guides/SKILL.md · 어조와 형식" path=modern-web-guidance-src/project-guides/SKILL.md lines=55:64
@source snippets title="modern-web-guidance-src/project-guides/SKILL.md · 코드 snippet 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=66:72
@source steps title="modern-web-guidance-src/project-guides/SKILL.md · 구현 단계 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=74:84
@source fallback title="modern-web-guidance-src/project-guides/SKILL.md · fallback 절 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=86:100
@source baseline title="modern-web-guidance-src/project-guides/SKILL.md · Baseline 매크로 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=102:109
@source polyfill title="modern-web-guidance-src/project-guides/SKILL.md · polyfill 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=111:114
@source macros title="modern-web-guidance-src/project-guides/SKILL.md · build-time 매크로 표" path=modern-web-guidance-src/project-guides/SKILL.md lines=116:129
@source guideref title="modern-web-guidance-src/project-guides/SKILL.md · GUIDE_REF 사용 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=131:140
@source features title="modern-web-guidance-src/project-guides/SKILL.md · features/ 재사용" path=modern-web-guidance-src/project-guides/SKILL.md lines=142:144
@source exp-intro title="modern-web-guidance-src/project-guides/SKILL.md · expectations.md 개요" path=modern-web-guidance-src/project-guides/SKILL.md lines=148:150
@source exp-rules title="modern-web-guidance-src/project-guides/SKILL.md · expectations.md 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=152:159
@source demo title="modern-web-guidance-src/project-guides/SKILL.md · demo.html 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=161:164
@source selfval title="modern-web-guidance-src/project-guides/SKILL.md · 자체 검증" path=modern-web-guidance-src/project-guides/SKILL.md lines=166:168
@source uc-next title="modern-web-guidance-src/project-use-cases/SKILL.md · 승인 뒤 Stage 2로" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=104:108
@source uc-gov title="modern-web-guidance-src/project-use-cases/SKILL.md · Peer fast-track" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=14:14
@source ev-stage title="modern-web-guidance-src/project-evals/SKILL.md · Stage 3 개요" path=modern-web-guidance-src/project-evals/SKILL.md lines=6:12
@source ev-exp title="modern-web-guidance-src/project-evals/SKILL.md · expectations.md 규칙은 project-guides에 있다" path=modern-web-guidance-src/project-evals/SKILL.md lines=52:54
@source val-intro title="modern-web-guidance-src/project-guide-validation/SKILL.md · 자체 검증 권장" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=8:10
@source feat-close title="modern-web-guidance-src/project-features/SKILL.md · use-case 이슈 종료 조건" path=modern-web-guidance-src/project-features/SKILL.md lines=118:118
@source lock title="modern-web-guidance-src/skills-lock.json · 3621B · 설치 출처" path=modern-web-guidance-src/skills-lock.json

## 언제 켜지고 무엇을 보게 하나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻이 아니다. `disable-model-invocation` 필드는 원문에 명시 없음.[](source:front)

@code source=front language=yaml

이 스킬은 3단계 중 Stage 2다. Stage 1은 use case를 정하고, Stage 3은 평가를 만든다.[](source:stages) 원문이 정한 Stage 2의 범위는 `guide.md`, `demo.html`, `expectations.md` 세 파일이다.[](source:impl2)

| 파일 | 목적 | 실제 코딩 에이전트가 보나 |
|---|---|---|
| `guide.md` | use case 구현 안내 | {good:본다} 유일한 파일[](source:seen) |
| `demo.html` | Stage 2 검증과 리뷰의 기준 구현 | 안 본다[](source:seen) |
| `expectations.md` | 평가 task를 만드는 검증 기준 | 안 본다[](source:seen) |
| `task.md`, `grader.ts`, `*-solution.patch`, `zero-passrate.patch` | Stage 3 평가 기반 시설 | 안 본다[](source:seen) |

판정 · 위 표가 이 스킬 전체의 이유다. 에이전트는 `guide.md`를 RAG(vector search)로 받아 읽을 뿐이므로 다른 파일을 가리키는 문장은 쓸모가 없다.[](source:seen)

@steps id=activation-steps
| scope | Stage 2의 끝 | Stage 2는 세 파일에서 끝난다. `task.md`, patch, `grader.ts`는 Stage 3에서 `gd dev`가 만든다.[](source:impl2) |
| human | 사람 수정 | 사람은 Stage 3 파일을 손볼 수 있다. 에이전트는 사람이 시킬 때만 손본다.[](source:impl2) |
| grader | grader가 어긋날 때 | `guide.md`를 grader에 맞춰 고치지 않는다. grader가 `guide.md`에 없는 것을 요구하면 grader를 고친다.[](source:impl2) |

원문은 작성 권한도 적는다. Peer는 Stage 2로 바로 갈 수 있고, 모든 guide는 Peer 또는 ATL이 쓰고 category Content ATL이 승인해야 병합한다. 상세는 `GOVERNANCE.md`, `docs/ATLS.md`를 보라고 하지만 이 컬렉션에는 없다.[](source:gov)

## guide.md 본문은 어떤 규칙으로 쓰나? {#guide-rules}

frontmatter는 `name`, `description`, `web-feature-ids`를 둔다. `web-feature-ids`에는 본문에서 쓰는 기능을 모두 올리고, ID가 없으면 사용자에게 알린다.[](source:fm) 아래 표는 본문 규칙을 강도별로 정리했다.

| 영역 | 규칙 | 강도 |
|---|---|---|
| draft | `stub`, `wip`, `blocked` 중 하나이고, 생략하면 게시된다. `blocked`는 `draft-reason`에 결정 이슈나 PR 링크를 한 줄로 적는다.[](source:draft) | 값 제한 |
| 강조 표지 | `MANDATORY:`, `DO`, `DO NOT`은 꼭 필요한 곳에만 쓴다. 단계마다 붙이지 않는다.[](source:tone) | 선택적 사용 |
| 분량 | 모델이 이미 아는 문법과 Baseline Widely Available 기능의 교과서식 설명을 뺀다. 개요와 "이 방법이 권장되는 이유"는 짧게 넣는다.[](source:tone) | 지시 |
| 유지보수 메모 | 업스트림 버그 링크나 리뷰 이력은 `{# ... #}` 주석에 쓴다. 별도 `reasoning.md`, `notes.md`는 만들지 않는다. 에이전트가 오해할 만한 패턴의 이유는 본문이나 코드 주석에 쓴다.[](source:tone) | 금지 + 지시 |
| 외부 링크 | 본문에 `[link text](url)`를 쓰지 않고, 필수 구현 정보를 `GUIDE_REF`에 맡기지 않는다.[](source:tone) | DO NOT |
| 표기 | 미국 영어를 쓴다. callout은 `> [!NOTE]` 같은 GitHub alert 문법이고, 굵은 글씨 라벨(`> **Note:**`)은 검증이 거부한다.[](source:tone) | 지시 |
| snippet | 짧고 주석이 풍부하게 쓴다. 50줄 이상 boilerplate는 최소 snippet으로 줄인다. ES module만 쓰고 CommonJS는 피한다.[](source:snippets) | 지시 |
| snippet 주석 | 값의 이유를 설명하고, `2rem`이나 `50ms` 같은 placeholder는 예시라고 표시한다.[](source:snippets) | MUST |
| 새 기능 선택 | 구현 단계는 어떤 기능도 쓸 수 있다고 가정한다. 사용자에게 보이는 이점이 없으면 legacy 기능을 쓴다.[](source:steps) | DO NOT |
| 이해관계 | 한 사용자 집단을 해치며 다른 집단을 돕는 방법은 이득이 분명히 클 때만 권한다. 어떤 집단도 use case에서 완전히 배제하지 않는다. 절충은 본문에 명시한다.[](source:steps) | DO NOT |
| 네이티브 우선 | `<dialog>`, `[popover]`, `<details>` 같은 플랫폼 기능을 직접 재구현보다 우선한다.[](source:steps) | 선호 |
| fallback 위치 | cross-browser fallback은 구현 절이 아니라 fallback 절에만 쓴다.[](source:steps) | DO NOT |
| `MANDATORY` 남용 | 기능이 동작하는 데 정말 필요한 단계에만 붙인다. 선택 단계는 선택이라고 표시한다. 잘못 붙이면 불필요한 grader 필수 검사가 생긴다.[](source:steps) | 지시 |
| 코드 유효성 | fallback 절을 포함한 모든 snippet은 실제 브라우저에서 throw 없이 돌아야 한다.[](source:steps) | 지시 |
| 대안 나열 | 대안은 어떤 use case에 어느 쪽이 맞는지 같이 쓴다. 기준을 지어내지 않는다.[](source:steps) | 지시 |

`web-feature-ids`에 ID가 아직 upstream에 없으면 `tmp-<candidate-slug>`를 쓰고 `features/pending-web-features.json`에도 등록한다. 기능이 upstream에 올라오면 CI 검증이 실패해 정식 ID로 바꾸도록 알린다.[](source:tmp)

## fallback과 build-time 매크로는 어떻게 쓰나? {#fallback-macros}

주 구현이 Baseline Widely Available 상태가 아닌 기능을 쓰면 fallback 권장을 반드시 넣는다. fallback은 "Baseline target이 X를 지원하지 않으면" 식으로 쓰고, fallback을 쓰는 경험(점진적 향상인지, 기능 감지 뒤 우아한 저하인지)을 명시해야 한다(MANDATORY).[](source:fallback)

| 순서 | fallback 방법 | 조건 |
|---|---|---|
| 1 | Custom Code | Widely Available 기능으로 다시 구현하고 50줄 미만이다.[](source:fallback) |
| 2 | Polyfill | 견고하고 성능이 좋다.[](source:fallback) |
| 3 | Abstraction | 잘 검증된 userland 라이브러리다.[](source:fallback) |
| 4 | Graceful Degradation | 우아하게 저하되는 Baseline Newly Available 기능이다.[](source:fallback) |
| 5 | Progressive Enhancement | 견고한 fallback이 없을 때만 이렇게 서술한다.[](source:fallback) |

fallback은 use case에 충실해야 한다. 핵심 목적을 달성하지 못하면 다른 fallback을 권한다. 핵심이 아닌 향상 기능에는 우아한 저하도 허용한다. 기능 감지는 `in` 연산자로 하고, 인스턴스가 있으면 그 인스턴스를, 없으면 Web IDL interface prototype을 검사한다.[](source:fallback)

| 상황 | 쓸 매크로·행동 | 강도 |
|---|---|---|
| widely available 상태가 아닌 기능마다 | `{{ FEATURE_FALLBACKS("feature-id") }}` 또는 `{{ BASELINE_STATUS("feature-id") }}`를 한 줄로 단독 배치한다.[](source:baseline) | MANDATORY |
| 재사용 가능한 fallback이 `features/<id>.md`의 비어 있지 않은 `## Fallbacks`에 있을 때 | `FEATURE_FALLBACKS`를 쓴다. 파일이나 절이 없거나 비면 `MacroError`로 검증이 실패한다.[](source:baseline)[](source:macros) | 선호 |
| fallback이 이 guide에만 해당하거나, BCD key가 필요하거나, 기능이 이미 Widely Available일 때 | `BASELINE_STATUS`를 직접 쓴다.[](source:baseline) | 지시 |
| 12개월 안에 `baseline_high_date`가 된 기능이나 에이전트가 지원을 오판하기 쉬운 기능 | `BASELINE_STATUS`를 넣는다. `baseline_low_date`와 `baseline_high_date`를 혼동하지 않는다.[](source:baseline) | SHOULD |
| 브라우저 버전·지원 시점 | 본문에 직접 쓰지 않고 매크로로 보인다. SMS 형식 같은 OS·UA 통합 설명은 허용한다.[](source:baseline) | 금지 |
| 매크로 위치 | fallback 절 밖에서는 쓰지 않는다. 기능이 여러 개면 소절마다 따로 쓴다.[](source:baseline) | DO NOT |
| polyfill 로딩 | 네이티브 지원이 없을 때만 조건부로 로드한다. 빌드 연동 로딩을 CDN보다 우선한다.[](source:polyfill) | MANDATORY |
| polyfill 선택 | 성능 손실이 큰 것과 CSS를 가져와 파싱해야 하는 것은 권하지 않는다. polyfill.io는 권하지 않는다.[](source:polyfill) | DO NOT |

`GUIDE_REF`는 에이전트가 guide를 미리 한꺼번에 받고 교차 참조는 거의 따라가지 않기 때문에 규칙이 엄격하다.[](source:guideref)

- 현재 guide의 요구사항(핵심 규칙, 접근성, fallback)에는 쓰지 않는다. `guide.md`에 직접 넣거나 `INCLUDE`·`FEATURE`로 가져온다.[](source:guideref)
- 게시된 guide만 가리킨다. 아직 없는 guide는 `{# PENDING_GUIDE_REF: ... #}` 주석에 문장째 둔다.[](source:guideref)
- 별도 use case에만 쓴다. 허브 라우팅, 형제 guide 구분(Section 1과 첫 코드 앞), 인접 use case가 해당한다.[](source:guideref)
- 같은 `web-feature-id`를 다루는 guide가 둘 이상이고 같은 조언을 반복하면 `features/<feature-id>.md`로 뽑고 매크로로 가져온다.[](source:features)

## expectations.md와 demo.html은 어떻게 쓰나? {#expectations-demo}

`expectations.md`는 non-stub, non-draft guide마다 비어 있지 않아야 한다. SME가 소유하므로 기존 문구를 보존하고, 의미가 바뀌어야 할 때만 bullet을 고치며 이유를 적는다.[](source:exp-intro)

| 규칙 | 내용 |
|---|---|
| 1:1 | bullet 하나가 grader `test()` 하나가 된다. 한 bullet에 검사 하나만 쓴다.[](source:exp-rules) |
| 평서문 | 올바른 구현에서 참인 사실로 쓴다. `MANDATORY:`, `MUST`, `DO NOT` 같은 지시 접두어는 뺀다. 이는 `guide.md`의 관례다.[](source:exp-rules) |
| 결정적 검증 | "grader가 어떻게 아는가?"에 답할 수 있어야 한다. DOM, CSSOM, JS AST, computed style, accessibility tree, 런타임 동작으로 확인한다. API 사실, 코드 주석, 사람 판단이 필요한 기준은 안 된다. 부정 검사는 대상 기능이 있다는 긍정 검사와 짝을 짓는다.[](source:exp-rules) |
| `demo.html` 실행 | 모든 expectation을 demo가 실제로 보여 줘야 한다.[](source:exp-rules) |
| 범위 | guide가 요구하는 관찰 가능한 결과를 모두 덮는다. 상한은 없다. 5~10개는 범위가 넓은지 보는 힌트일 뿐이다. 선택 분기, "Prefer" 권고, Widely Available 기능의 fallback은 넣지 않는다.[](source:exp-rules) |
| 외부 링크 | 쓰지 않는다. grader 생성기가 해석하지 못한다.[](source:exp-rules) |
| 과도한 제약 | 문법 하나를 강요하지 않고 허용되는 대안을 이름으로 적는다. "Prefer"를 필수로 올리거나, `A or B`를 `AND`로 쪼개거나, 예시 값(`0.4s`)을 검사하거나, `#id`·`.class` 같은 locator를 쓰지 않는다.[](source:exp-rules) |
| 네이티브와 fallback 분리 | 핵심 expectation은 네이티브 지원을 가정한다. fallback 요구는 "When `<feature>` is unsupported, ..." 꼴의 별도 bullet로 쓴다. 그래야 `gd dev`가 `skipUnless({ unsupported: '<feature>' })`로 범위를 정한다.[](source:exp-rules) |

`demo.html`은 use case의 깨끗한 참조 구현이다. 기능이 Widely Available 상태가 아니면 fallback 전략도 보여 준다. 가능하면 inline script와 style로 자기완결시키고, 브라우저 console에 error나 warning이 없어야 한다.[](source:demo)

@callout level=warning title="에이전트는 guide.md만 읽는다"
| `guide.md`는 `demo.html`, `expectations.md`, patch, 외부 링크를 에이전트가 읽는다고 가정하면 안 된다. 읽는 것은 `guide.md`뿐이다.[](source:seen)[](source:steps) |

## 다른 스킬과 어디에서 이어지나? {#position}

@workflow id=position-flow title="use case 승인에서 자체 검증과 평가로"
| uc | project-use-cases | backend | source:uc-next |
| current | project-guides | backend | source:stages |
| val | project-guide-validation | backend | source:selfval |
| ev | project-evals | backend | source:ev-stage |
| uc > current | ATL 승인 | emphasis |
| current > val | 자체 검증 | emphasis |
| current > ev | Stage 3 | dashed |

@steps id=position-steps
| highlight | project-guides | 이 페이지의 스킬이다. 세 파일을 쓴 뒤 검증 스킬을 invoke하고, 그 뒤 Stage 3으로 간다.[](source:selfval) | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R03 · 넘김(앞) | `project-use-cases`가 use case를 Content ATL이 승인한 뒤 Stage 2로 가라고 한다. 받는 것은 `guide.md` stub(`name`, `description`, `web-feature-ids`)이다. 온보딩된 Peer는 Stage 1을 건너뛰고 바로 이 스킬로 올 수 있다.[](source:uc-next)[](source:uc-gov) |
| R05 · 넘김(뒤) | 세 파일을 다 쓴 뒤 PR을 열거나 Stage 3으로 가기 전에 `project-guide-validation`을 invoke하라고 한다(명령형). 받는 쪽은 "strongly encouraged"라고 쓰며, 사람 SME 검토를 대체하지 않는다고 못박는다.[](source:selfval)[](source:val-intro) |
| R06 · 넘김(뒤) | Stage 3에서 `gd dev`가 `task.md`, patch, `grader.ts`를 만든다. 이 스킬은 grader를 맞추려고 `guide.md`를 고치지 않는다.[](source:impl2)[](source:ev-stage) |
| R07 · 참고 | `project-evals`는 `expectations.md` 작성 규칙을 이 스킬의 해당 절에 맡기고 Stage 3에는 grader 규칙만 더한다.[](source:ev-exp) |
| R14 · 공유 상태 | `expectations.md`는 이 스킬이 쓰고 `project-evals`가 grader 테스트와 1:1로 대응시켜 검토한다.[](source:exp-rules)[](source:ev-exp) |
| R02, R08, R13, R15 · 참고·공유 상태 | `project-features`는 use-case 이슈가 닫히는 때를 설명하며 이 스킬을 안내만 한다. 검증 스킬은 이 스킬을 정성 검토 기준으로 쓴다. `guide.md`는 Stage 1 stub에서 Stage 2 본문으로 이어지고, discipline guide는 `project-discipline-guides`도 고친다. 상세는 묶음에 남겼다.[](source:feat-close)[](source:fm) |

전체 흐름은 색인 기준 `_group-guide-authoring-pipeline/guide-authoring-pipeline.html`에 있다(묶음 페이지는 아직 만들지 않았다).

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `modern-web-guidance-src/project-guides/SKILL.md` 1개, 26,181B, 168줄을 끝까지 읽었다.[](source:full) |
| 관계 대조 | 인접 스킬 `project-use-cases`, `project-evals`, `project-features`, `project-guide-validation`에서 관계가 인용한 줄만 읽었다. 이 줄들은 원장 R02, R03, R05, R06, R07의 근거와 일치했다. |
| 설치 출처 | `skills-lock.json`의 `project-guides` 항목은 `skillPath`가 `.agents/skills/project-guides/SKILL.md`다.[](source:lock) |
| 제외 | 이 스킬 폴더에는 `SKILL.md` 외 파일이 없다. 번역본과 바이너리도 없다. |
| 부분 읽음 | 0개. 인접 스킬 4개는 필요한 줄만 읽었고 전부 읽지 않았다. |

원문의 활성화 설명, Stage 순서, 사람 승인(Content ATL, SME), 수치(50줄, 12개월, 5~10개 힌트), 금지와 `MANDATORY` 항목은 모두 대조했다.

@callout level=open-question title="이 컬렉션에서 확인하지 못한 부분"
| 본문이 가리키는 `GOVERNANCE.md`, `docs/ATLS.md`, `src/core/macro-parsing.ts`, `features/pending-web-features.json`, `guides/`는 이 컬렉션에 없다. 매크로 오류나 검증 실패가 실제로 그렇게 동작하는지는 확인하지 못했다. 스킬이 말하는 `gd dev`, `pnpm build`도 실행하지 않았다. |

분석 중 원본은 수정하지 않았다. 원문의 명령과 도구 호출은 분석 자료로만 읽었다.
