# project-evals는 평가 파일의 어떤 결함을 "틀렸다"고 판정하게 하나? {#project-evals-page}

`project-evals`는 `expectations.md`, `task.md`, `grader.ts`를 쓰거나 리뷰할 때 쓴다. 에이전트는 8가지 red line 중 하나라도 해당하면 그 평가를 틀린 것으로 본다. 리뷰에서는 이 8가지만 지적하고 문체 지적은 건너뛴다.[](source:redlines)[](source:review)

- guide를 grader에 맞춰 고치지 않는다. grader가 guide에 없는 내용을 요구하면 grader를 고치거나 guide 소유자에게 알린다.[](source:own)
- `task.md`는 정답이 되는 API, CSS 속성, HTML 속성, 대체 수단을 적지 않는다. `guide.md` description도 그대로 베끼지 않는다.[](source:redlines)[](source:task)
- grader는 golden patch 3개에서 100%, 손대지 않은 시작 앱 기준 `zero-passrate.patch`에서 0%여야 보정이 맞다.[](source:harness)
- 이 분석은 SKILL.md 한 파일만 근거로 한다. 본문이 가리키는 `src/` 파일과 `guides/` 파일은 이 저장소에 없어 확인하지 못했다.[](source:related)

@answer scope="로컬 원본 분석 · 평가 실행 없음 · 원본 저장소의 src·guides 파일 미확인"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source full title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 원본" path=modern-web-guidance-src/project-evals/SKILL.md
@source front title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 원본" path=modern-web-guidance-src/project-evals/SKILL.md lines=1:4
@source stage title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 원본" path=modern-web-guidance-src/project-evals/SKILL.md lines=6:12
@source harness title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 원본" path=modern-web-guidance-src/project-evals/SKILL.md lines=14:29
@source redlines title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 원본" path=modern-web-guidance-src/project-evals/SKILL.md lines=31:44
@source review title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 원본" path=modern-web-guidance-src/project-evals/SKILL.md lines=46:46
@source own title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 원본" path=modern-web-guidance-src/project-evals/SKILL.md lines=48:50
@source expect title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 원본" path=modern-web-guidance-src/project-evals/SKILL.md lines=52:57
@source task title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 원본" path=modern-web-guidance-src/project-evals/SKILL.md lines=61:78
@source instrument title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 원본" path=modern-web-guidance-src/project-evals/SKILL.md lines=86:97
@source overfit title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 원본" path=modern-web-guidance-src/project-evals/SKILL.md lines=99:106
@source vacuous title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 원본" path=modern-web-guidance-src/project-evals/SKILL.md lines=108:114
@source gen title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 원본" path=modern-web-guidance-src/project-evals/SKILL.md lines=118:134
@source related title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 원본" path=modern-web-guidance-src/project-evals/SKILL.md lines=136:136
@source pg-stage2 title="modern-web-guidance-src/project-guides/SKILL.md · 26181B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/project-guides/SKILL.md lines=30:30
@source pg-expect title="modern-web-guidance-src/project-guides/SKILL.md · 26181B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/project-guides/SKILL.md lines=148:150
@source pgv title="modern-web-guidance-src/project-guide-validation/SKILL.md · 14156B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=46:46
@source canary-desc title="modern-web-guidance-src/dev-prompt-canary/SKILL.md · 5781B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=3:8
@source canary-rule title="modern-web-guidance-src/dev-prompt-canary/SKILL.md · 5781B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=14:14
@source replay-desc title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/grader-replay/SKILL.md lines=3:10
@source replay-rel title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/grader-replay/SKILL.md lines=79:79
@source nightly-desc title="modern-web-guidance-src/nightly-eval-investigation/SKILL.md · 16210B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=3:8
@source nightly-ro title="modern-web-guidance-src/nightly-eval-investigation/SKILL.md · 16210B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=22:23
@source nightly-red title="modern-web-guidance-src/nightly-eval-investigation/SKILL.md · 16210B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=114:114
@source lock title="modern-web-guidance-src/skills-lock.json · 설치 출처" path=modern-web-guidance-src/skills-lock.json

## 언제 켜지고 어떤 파일을 다루나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 같은 호출 제한 필드는 원문에 명시되어 있지 않다.[](source:front)

@code source=front language=yaml

이 스킬은 guidance를 만드는 3단계 중 Stage 3(평가)에 해당한다. Stage 1은 기능의 use case 찾기, Stage 2는 use case의 guide 쓰기다.[](source:stage) 실제 개발자의 coding agent는 Skills CLI로 받은 `guide.md`만 본다. 아래 파일은 모두 평가 인프라이고 실사용 agent에게 보이지 않는다.[](source:harness)

| 파일 | 평가에서 하는 일 |
|---|---|
| `expectations.md` | `guide.md`를 따랐을 때 성립해야 하는 검사를 자연어로 적은 명세.[](source:harness) |
| `demo.html` | SME가 쓴 독립 실행 기준 구현.[](source:harness) |
| `targets/<base_app>/task.md` | base app에 맞춘 개발자 요청 한 줄. `- `로 시작하고 YAML frontmatter가 없다.[](source:harness) |
| `patches/*-solution.patch` | agent 3종(`antigravity`/`jetski`, `claude`, `codex`)의 golden 정답 diff. `grader.ts`에서 100%여야 한다.[](source:harness) |
| `patches/zero-passrate.patch` | 거의 모든 guide에서 비어 있는 기준 diff(시작 앱 그대로). 예외가 아닌 검사에서 0%여야 한다.[](source:harness) |
| `targets/<base_app>/grader.ts` | Playwright와 정적 AST로 agent 결과물을 채점한다.[](source:harness) |

harness는 격리된 workspace에 base app(`daily-grind` 또는 `devtools-times`)을 두고 `task.md` 프롬프트를 agent에게 준다. guided 모드에서는 `guide.md`도 Skills CLI로 준다. 이어서 `grader.ts`를 돌린다.[](source:harness)

## 평가가 틀렸다고 보는 8가지는 무엇인가? {#redlines}

하나라도 참이면 그 평가는 틀렸다.[](source:redlines) 과도하게 엄격해 보이는 검사는 가드를 먼저 본다.

| 번호 | 틀렸다고 보는 경우 | 가드와 사례 |
|---|---|---|
| 1 | 검사가 잘못된 판정을 낸다. guide를 따른 풀이를 떨어뜨리거나 깨진 풀이를 통과시킨다. | 원인 예: 의미 없는 검사, golden에만 있는 class·ID, 파일 하나만 읽기, 행동을 source regex·AST로 검사, 고정 `waitForTimeout`, 실제 API와 다른 mock(`toJSON()` 없는 credential mock). 가드: 엄격한 검사가 guide가 허용하는 패턴을 막거나 실제 실행에서 재현될 때만 틀렸다고 본다. 어떤 agent도 쓰지 않을 가상 코드 때문에 검사를 느슨하게 하지 않는다.[](source:redlines) |
| 2 | task가 비유도 시도에 정답을 알려 준다. | API, CSS 속성, HTML 속성, fallback 수단, expectation 목록, guide 이름을 적거나 description을 그대로 복사한다. 가드: 만드는 화면 요소 이름("a modal dialog")과 중립 `id`·`data-*` hook은 허용.[](source:redlines) |
| 3 | expectation이 guide가 요구하지 않는 것을 채점하거나 guide와 모순된다. | "(Optional)"을 필수로 바꾸기, snippet 식별자·magic number 하드코딩, Baseline Widely Available 기능에 fallback 요구.[](source:redlines) |
| 4 | expectation을 base app에서 객관적으로 검사할 수 없다. | 주관 판단, guide·browser·주석을 채점, 시작 앱에 없는 전제(정적 client 앱의 HTTP 응답 헤더, 없는 media·iframe·form).[](source:redlines) |
| 5 | guide가 깨진 코드나 틀린 spec·browser 동작을 가르친다. | fallback 절의 코드가 실제 browser에서 실패하는 경우도 포함한다.[](source:redlines) |
| 6 | task와 grader가 만들 것에 대해 어긋난다. | task가 expectation과 모순되거나, grader가 task도 guide도 요구하지 않은 기능을 검사한다. 대개 정답 노출을 지우려 `task.md`를 고쳤는데 `grader.ts`에 옛 검사가 남아서 생긴다. task를 고치면 grader를 다시 본다.[](source:redlines) |
| 7 | 한 agent가 함께 가져오는 guide 둘이 같은 task에서 서로 모순된다. | 한쪽을 따르면 다른 쪽 grader가 실패한다.[](source:redlines) |
| 8 | 보정이 깨진다. | golden이 검사에 실패하거나, 시작 앱(또는 Gen1 `negative-demo.html`)이 예외 아닌 검사를 통과하거나, patch에 `node_modules`·`dist` 같은 build·dependency 산출물이 들어간다.[](source:redlines) |

리뷰 결과는 finding마다 파일과 줄, 깨진 red line, 근거, 고칠 방법을 적는다. 새로 얻은 교훈은 새 규칙이 아니라 기존 red line 아래 예시로 넣는다.[](source:review)

@callout level=warning title="소유권과 수정 경계"
| SME가 `guide.md`, `demo.html`, `expectations.md`를 소유한다. 기존 `expectations.md` 문구는 그대로 두고, 의미가 바뀌어야 할 때만 bullet을 고치며 이유를 적는다. 테스트 제목에 맞추려고 문구를 바꾸지 않는다.[](source:own) |
| golden patch는 보정 중 잠겨 있다. 올바른 검사가 golden에서 실패하면 golden을 다시 만들고, 검사가 틀렸으면 검사를 고친다. golden을 고쳐 통과시키지 않는다.[](source:overfit) |

## task.md와 grader.ts는 어떤 규칙으로 쓰나? {#authoring}

`expectations.md`의 작성 규칙은 이 스킬이 아니라 `project-guides`에 있다. 이 스킬은 grader 쪽 규칙만 더한다.[](source:expect)

- bullet 하나가 `test()` 하나가 되도록 1:1로 쓴다. 문구가 테스트 제목과 같을 필요는 없다.[](source:expect)
- `## Fallback strategies`가 있는 guide는 fallback 요구를 별도 bullet로 쓴다. "When `<feature>` is unsupported" 식으로 기능 이름을 밝힌다.[](source:expect)
- 그래야 `gd dev`가 `skipUnless({ unsupported: '<feature>' })`로 범위를 정한다.[](source:expect)

@facts
| golden patch | 3개, `grader.ts`에서 100%[](source:harness) |
| `zero-passrate.patch` | 예외 아닌 검사에서 0%[](source:harness) |
| `task.md` | 한 줄 bullet. 줄바꿈과 frontmatter 없음. 추가 bullet은 runner가 무시한다[](source:task) |
| `waitForTimeout` | 쓰지 않는다. 조건을 polling한다[](source:instrument) |
| `test.skip()` | 쓰지 않는다. 에러를 삼키는 `try/catch`도 쓰지 않는다[](source:vacuous) |

| 대상 | 강제 규칙 |
|---|---|
| `task.md` 내용 | 기존 앱의 실제 page·component를 근거로 쓴다. description 문자열을 베끼지 않는다. 생성 때 `guide.md`와 `expectations.md`는 가려지고 description과 base app만 들어간다.[](source:task) |
| `task.md` 금지 | API 이름, CSS 속성·at-rule, HTML 속성, 메서드 이름을 적지 않는다. 특정 API를 강제하는 인위적 제약("constraint forcing")은 폐기됐다. base app에 없는 route·endpoint를 지어내지 않는다. 내부 용어(`guide.md`, guidance 프로젝트)도 쓰지 않는다.[](source:task) |
| `task.md` 문체 | "Add...", "Update..."처럼 자연스러운 명령형 한 줄. "How can I...?" 같은 질문형은 쓰지 않는다.[](source:task) |
| 구조 검사 | HTML은 Linkedom, CSS는 CSSOMNom, JS/TS는 ts-morph로 모든 프로젝트 파일에서 검사한다. HTML·CSS·JS 문자열에 regex를 쓰지 않는다.[](source:instrument) |
| 동작 검사 | Playwright로 `page.goto(TARGET_URL)`(HTTP)을 쓴다. Gen2 grader에서 `file://`은 쓰지 않는다. golden에만 있는 ID·class, 지어낸 route는 쓰지 않는다. 새 검사는 행동을 뺀 변형에서 실패하는지 직접 돌려 확인한다.[](source:instrument) |
| golden 과적합 | golden의 helper 이름·state 변수·새 파일명을 allowlist로 쓰지 않는다. 역할(WebAuthn 메서드 호출 등)로 매칭한다. TypeScript 표현식을 풀고, 변수 참조와 wrapper 함수를 따라가고, `try/catch`와 `.catch()`를 모두 받는다. 유틸리티 CSS 앱은 CSS 선언과 동등한 class를 모두 받는다.[](source:overfit) |
| 의미 없는 검사 | `if (items.length > 0) {...}` 같은 조건 우회를 쓰지 않는다. `.every(...)` 전에 `expect(items.length).toBeGreaterThan(0)`을 둔다. `MUST NOT` 검사는 대상 기능이 있다는 positive 검사와 짝으로 쓴다. 하나의 `test()`는 expectation 하나만 확인한다.[](source:vacuous) |
| 적용 불가 expectation | discipline guide에서 시작 앱과 task 어디에도 전제가 없으면(정적 앱의 응답 헤더 등) 의미 없는 통과를 쓰지 않고 grader 머리말에 이유를 적어 생략한다. viewport·권한 상태·network 오류처럼 Playwright가 만들 수 있는 상태는 전제 부재가 아니므로 검사한다.[](source:vacuous) |

task에 적어도 되는 말과 안 되는 말의 예. 앞의 둘은 원문의 금지·허용 예시다.[](source:task)

| 요청 문구 | 판정 |
|---|---|
| "a modal dialog"를 만든다 {good:허용} | 사용자에게 보이는 component 이름[](source:redlines) |
| `id="passkey-list"` {good:허용} | 앱 내용에서 딴 중립 hook[](source:task) |
| `id="share-dialog"`, `data-popover` {bad:금지} | HTML 요소·속성 이름을 딴 hook[](source:task) |
| "use `@view-transition`" {bad:금지} | CSS at-rule을 지시해 정답을 알려 준다[](source:task) |

생성과 검증 명령(`gd dev <guide-dir>`, `--test-grader`, Gen1용 Playwright 수동 실행, `node --test src/core/grader-lint.test.ts src/authoring/guides-integrity.test.ts`)이 원문에 있다. 이 분석에서는 실행하지 않았다.[](source:gen)

## 다른 스킬과 어디에서 이어지나? {#position}

@workflow id=position-flow title="Stage 2 이후 평가 도구 선택"
| guides | project-guides | backend | source:pg-stage2 |
| current | project-evals | backend | source:front |
| canary | dev-prompt-canary | backend | source:canary-desc |
| replay | grader-replay | backend | source:replay-desc |
| nightly | nightly-eval-investigation | backend | source:nightly-desc |
| guides > current | R06 넘김 | emphasis |
| current > canary | R16 넘김 | dashed |
| current > replay | R17 넘김 | dashed |
| current > nightly | R18 넘김 | dashed |

@steps
| highlight | project-evals | 이 페이지의 스킬이다. 아래 세 스킬은 조건이 맞을 때만 쓰는 선택지다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R06 · 넘김(project-guides에서) | Stage 2는 `guide.md`, `demo.html`, `expectations.md`에서 끝난다. `task.md`, patch, `grader.ts`는 `gd dev`가 Stage 3에서 만든다. 사람은 손볼 수 있고 에이전트는 사람이 시킬 때만 손본다.[](source:pg-stage2) |
| R07 · 참고 | `expectations.md` 작성 규칙은 project-guides의 해당 절에 있다.[](source:expect)[](source:pg-expect) |
| R16 · 넘김 | `src/authoring/dev-prompts.ts`, `dev.ts`, `src/grading/generate-grader.ts`를 고칠 때 `dev-prompt-canary`로 prompt 변경을 검증한다.[](source:related) |
| R17 · 넘김 | 기존 grader나 공용 grading helper를 고칠 때 `grader-replay`로 저장된 nightly 풀이를 다시 채점해 결과가 뒤집힌 곳을 본다.[](source:related) |
| R18 · 넘김 | 여러 nightly에 걸친 통과율과 retrieval 표시를 분류할 때 `nightly-eval-investigation`을 쓴다.[](source:related) |
| R10 · 참고(project-guide-validation에서) | expectation을 검토할 때 이 스킬의 8 red line을 따르라고 한다.[](source:pgv) |
| R19 · 참고(dev-prompt-canary에서) | 다시 만든 `task.md`와 `grader.ts`가 이 스킬의 규칙을 지키는지가 확인 기준이다.[](source:canary-rule) |
| R20 · 참고(grader-replay에서) | Related Skills 목록에서 이 스킬을 expectations·task·grader 작성 규칙의 출처로 안내한다.[](source:replay-rel) |
| R23 · 참고(nightly-eval-investigation에서) | flagged task마다 prompt·guide·grader를 8 red line에 대조한다. 단일 guide를 로컬에서 고칠 때도 먼저 확인한다.[](source:nightly-red)[](source:nightly-ro) |
| R25 · 공유 상태 | nightly 대량 조사는 `task.md`, `guide.md`, `grader.ts`, `expectations.md`를 읽기만 하고 쓰기·삭제는 금지(`MUST NOT`)다.[](source:nightly-ro) |
| R14 · 공유 상태 | `expectations.md`를 project-guides가 쓰고 이 스킬이 grader 테스트와 1:1로 대응시켜 검토한다.[](source:expect)[](source:pg-expect) |
| R28 · 같은 계열 | `project-coding-standards`도 grader 보정에 `gd dev <guide> --test-grader`를 쓴다. 연결을 지시한 문장은 없다. 판정: 같은 명령을 쓸 뿐 호출 관계는 아니다.[](source:gen) |

전체 흐름은 색인 기준 `_group-guide-authoring-pipeline/guide-authoring-pipeline.html`과 `_group-eval-quality-loop/eval-quality-loop.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `modern-web-guidance-src/project-evals/SKILL.md` 1개, 18,630B(136줄)를 끝까지 읽었다.[](source:full) |
| 관계 확인 | 관계 행 R06·R07·R10·R14·R16~R20·R23·R25·R28 12개를 이웃 SKILL.md의 인용 줄과 대조했다. 이웃 파일 5개는 해당 줄만 읽었다. |
| 설치 출처 | `skills-lock.json`의 항목을 확인했다. 원격 경로는 `.agents/skills/project-evals/SKILL.md`다.[](source:lock) |
| 제외 | 번역본은 이 컬렉션에 없다. 바이너리는 없다. 부분 읽음 파일은 이 스킬 기준 0개다. |

원문의 활성화 설명, Stage 3 위치, 8 red line과 각 가드, golden 3개와 100%·0% 기준, `task.md` 규칙 9개, grader 규칙 3절, 명령 목록을 모두 대조했다. 원문에 종료 조건은 명시되어 있지 않다. 기준은 보정 수치(100%·0%)뿐이다. 판정 · 이 스킬은 절차보다 리뷰 기준표에 가까워서, 에이전트가 8가지 외의 사항을 지적하는지는 호출 시점의 지시에 달려 있다.[](source:review)

@callout level=open-question title="확인하지 못한 부분"
| 원문이 가리키는 `src/grading/template.grader.ts`, `src/core/grader-coverage.ts`, `src/core/guide-validation.ts`, `src/harness/README.md` 등은 이 저장소에 없어 읽지 못했다. 파일 이름과 역할은 SKILL.md 서술만 옮겼다. |
| `gd dev`, `pnpm`, `node --test`, Playwright 명령은 실행하지 않았다. 보정 수치와 검사 결과는 직접 확인하지 않았다. |
| 호스트가 실제로 이 스킬을 활성화하는 조건은 실행으로 확인하지 않았다. |

분석 중 원본은 수정하지 않았다. 원문의 명령과 설치·설정 변경은 실행하지 않았다.
