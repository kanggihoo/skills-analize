# project-evals — `expectations.md`, `task.md`, `grader.ts`를 평가 기준 8개로 쓰고 검토 {#overview}

`project-evals`는 에이전트가 guidance의 품질을 재는 평가 파일(`expectations.md`, `targets/<app>/task.md`, `targets/<app>/grader.ts`)을 쓰거나 검토할 때, 평가가 틀린 경우 8가지(red line)에 비추어 판단하게 하는 스킬이다. guide를 만드는 3단계 중 셋째 단계이자 평가 도구 쪽 허브다.[](source:pe-front)[](source:pe-red)

- 쓰는 때: `expectations.md`, `task.md`, `grader.ts`를 쓰거나 검토할 때다.[](source:pe-front)
- 결과: 평가 파일과, 검토할 때는 파일·줄·어긴 red line·근거·수정안을 적은 지적이다. 스타일 지적은 하지 않는다.[](source:pe-red)
- 다른 스킬과의 관계: 평가 도구를 고칠 때 `dev-prompt-canary`, `grader-replay`, `nightly-eval-investigation`을 쓰라고 안내한다(다음 안내). `project-guides`의 expectations 규칙을 참고한다(참고).[](source:pe-hub)[](source:pe-exp)
- 하지 않는 것: grader에 맞추려고 guide를 고치지 않고, SME가 쓴 `expectations.md` 문구를 테스트 제목에 맞춰 바꾸지 않는다.[](source:pe-own)

@answer scope="modern-web-guidance-src/project-evals · 원본 파일 1개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source pe-front title="이름과 description" path=modern-web-guidance-src/project-evals/SKILL.md lines=1:4
@source pe-stage title="Stage 3 소개" path=modern-web-guidance-src/project-evals/SKILL.md lines=6:12
@source pe-see title="eval 에이전트와 실제 에이전트가 보는 것" path=modern-web-guidance-src/project-evals/SKILL.md lines=14:29
@source pe-red title="평가가 틀린 8가지(red line)" path=modern-web-guidance-src/project-evals/SKILL.md lines=31:46
@source pe-own title="소유권과 수정 원칙" path=modern-web-guidance-src/project-evals/SKILL.md lines=48:50
@source pe-exp title="expectations.md 규칙" path=modern-web-guidance-src/project-evals/SKILL.md lines=52:57
@source pe-task title="task.md 규칙" path=modern-web-guidance-src/project-evals/SKILL.md lines=61:78
@source pe-instr title="grader의 parser와 browser 선택" path=modern-web-guidance-src/project-evals/SKILL.md lines=86:97
@source pe-over title="golden patch 과적합 방지" path=modern-web-guidance-src/project-evals/SKILL.md lines=99:106
@source pe-vac title="빈 검사 금지" path=modern-web-guidance-src/project-evals/SKILL.md lines=108:114
@source pe-gen title="생성과 검증 명령" path=modern-web-guidance-src/project-evals/SKILL.md lines=118:134
@source pe-hub title="평가 도구를 고칠 때의 안내" path=modern-web-guidance-src/project-evals/SKILL.md lines=136:136
@source pg-fm title="project-guides의 expectations 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=148:159
@source pg-stage3 title="project-guides의 Stage 3 안내" path=modern-web-guidance-src/project-guides/SKILL.md lines=30:30
@source pgv-red title="project-guide-validation의 red line 안내" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=46:46
@source dpc-front title="dev-prompt-canary description" path=modern-web-guidance-src/dev-prompt-canary/SKILL.md lines=1:14
@source gr-front title="grader-replay description" path=modern-web-guidance-src/grader-replay/SKILL.md lines=1:10
@source gr-rel title="grader-replay의 관련 스킬" path=modern-web-guidance-src/grader-replay/SKILL.md lines=77:81
@source ne-front title="nightly-eval-investigation description와 읽기 전용 규칙" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=1:8
@source ne-ro title="nightly-eval-investigation의 읽기 전용 규칙" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=111:127
@source cs-domain title="project-coding-standards의 grader 검증" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=97:100

## 어떻게 동작하나 {#flow span=12}

원문은 순서를 정하지 않고 판단 기준을 나열한다. 파일마다 규칙이 있고, 검토 기준은 8개 red line 하나다. 아래 표는 결과를 바꾸는 규칙을 적용 상황별로 모은 것이다. 평가 파일은 `gd dev`가 만들고 사람이 손볼 수 있다는 배경은 `project-guides`에 있다.[](source:pe-red)[](source:pg-stage3)

| 적용 상황 | 참조 파일 | 바뀌는 판단 | 출력 사례 |
| --- | --- | --- | --- |
| 평가를 검토할 때 | `SKILL.md`의 8 red line | 아래 8개 중 하나라도 해당하면 평가가 틀린 것이다. 이 8개만 지적하고 스타일은 건너뛴다. 새 교훈은 새 규칙이 아니라 기존 red line 아래 예시로 넣는다 | 지적마다 파일과 줄, 어긴 red line, 근거, 수정안[](source:pe-red) |
| 1. 검사가 틀린 판정을 낸다 | `grader.ts` | guide를 따른 해답을 떨어뜨리거나 망가진 해답을 통과시킨다. 지나치게 엄격하다고 보려면 guide가 허용하는 패턴이거나 실제 실행에서 재현돼야 한다 | 빈 검사, golden만 쓰는 class·ID로 찾기, 고정 `waitForTimeout`[](source:pe-red) |
| 2. task가 정답을 알려 준다 | `task.md` | 대상 API, CSS 속성, HTML 속성, fallback 방식, expectation 목록, guide 이름을 말하거나 `description`을 그대로 베낀다 | 만드는 컴포넌트 이름("a modal dialog")과 중립적인 `id`·`data-*` hook은 괜찮다[](source:pe-red) |
| 3. expectation이 guide에 없는 것을 요구한다 | `expectations.md` | 가르치지 않은 규칙, optional을 필수로 바꾼 것, snippet 식별자·매직 넘버, Baseline Widely Available 기능의 fallback 요구, guide와 모순되는 것 | 원문 예: 선택 패턴을 필수로 올림[](source:pe-red) |
| 4. expectation을 객관적으로 시험할 수 없다 | `expectations.md`, base app | 주관적 판단, guide·browser·주석을 채점하는 것, base app에 없는 것(정적 앱의 HTTP header 등) | 정적 client-only 앱의 응답 header[](source:pe-red) |
| 5. guide가 틀린 코드나 spec을 가르친다 | `guide.md` | snippet이 실제 browser에서 던지거나(fallback 절 포함) 산문이 spec이나 지원을 잘못 말한다 | 던지는 snippet[](source:pe-red) |
| 6. task와 grader가 서로 다른 것을 만들라고 한다 | `task.md`, `grader.ts` | task가 expectation과 모순되거나 grader가 task도 guide도 요구하지 않은 것을 검사한다. task를 고치면 같은 작업에서 grader도 다시 본다 | 누수를 지운 뒤 grader에 남은 옛 검사[](source:pe-red)[](source:pe-task) |
| 7. 함께 검색되는 두 guide가 모순된다 | 여러 `guide.md` | 한쪽을 따르면 다른 쪽 grader가 실패한다 | 원문에 명시 없음[](source:pe-red) |
| 8. calibration이 깨진다 | golden patch 3개, `zero-passrate.patch` | golden이 검사에서 떨어지거나, 손대지 않은 시작 앱이 면제 아닌 검사를 통과하거나, patch가 `node_modules`나 `dist`를 commit한다 | golden은 100%, zero-passrate는 면제 아닌 검사에서 0%여야 한다[](source:pe-see)[](source:pe-red) |
| `task.md`를 쓸 때 | `targets/<app>/task.md` | `- ` 한 줄 bullet 하나, YAML frontmatter 없음, 명령형 요청이다. API·CSS·HTML 속성·fallback 이름을 쓰지 않고, `guide.md`를 언급하지 않는다 | "Add a passkey management section ..."으로 시작하는 한 줄[](source:pe-task) |
| `grader.ts`를 쓸 때 | `src/grading/template.grader.ts` | 구조는 parser(Linkedom, CSSOMNom, ts-morph)로, 런타임 동작은 Playwright로 본다. 소스에 regex를 쓰지 않는다. `test()` 하나에 expectation 하나, 빈 guard와 `test.skip()`을 쓰지 않는다 | `expect(items.length).toBeGreaterThan(0)`을 먼저 확인한다[](source:pe-instr)[](source:pe-vac) |
| golden patch를 대할 때 | `*-solution.patch` | golden의 helper 이름이나 새 파일 이름을 하드코딩하지 않는다. 맞는 검사가 golden을 떨어뜨리면 golden을 다시 만들고, 검사가 틀렸으면 검사를 고친다 | `try/catch`와 `.catch()`를 모두 받는다[](source:pe-over) |
| 평가를 만들고 확인할 때 | `gd dev` | 없는 patch·`task.md`·`grader.ts`를 만들고 calibration하거나(`gd dev <path>`), 기존 Gen 2 grader를 `--test-grader`로 확인한다 | `gd dev <path-to-guide-directory> --test-grader`[](source:pe-gen) |

소유권 규칙도 결과를 바꾼다. grader가 guide에 없는 것을 요구하면 grader를 고치거나 guide 소유자에게 알린다. SME가 쓴 `expectations.md`는 뜻이 바뀔 때만 고치고 이유를 적는다.[](source:pe-own)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 원문에 명시 없음. 모델이 description을 보고 켠다. 호출 제한 필드는 없다[](source:pe-front) |
| 성격 | 평가 파일의 판단 기준(8 red line)과 작성 규칙을 정하는 원칙형 스킬. 평가 도구 스킬들의 허브다 |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `project-guides` {#r06} | **이 스킬** | 다음 안내 | Stage 2는 세 파일에서 끝나고 `task.md`, golden patch, `grader.ts`는 Stage 3에서 `gd dev`가 만든다. grader가 맞지 않아도 guide를 고치지 않는다.[](source:pg-stage3)[](source:pe-stage) |
| **이 스킬** {#r07} | `project-guides` | 참고 | `expectations.md` 작성 규칙은 모두 `project-guides`의 "Writing expectations.md" 절에 있다고 안내하고, Stage 3에는 grader 규칙만 더한다.[](source:pe-exp)[](source:pg-fm) |
| `project-guide-validation` {#r10} | **이 스킬** | 참고 | expectation 검토 때 8 red line을 따르라고 한다. SME 문구는 의미가 바뀔 때만 고치고 이유를 적는다.[](source:pgv-red)[](source:pe-red) |
| **이 스킬** {#r14} | `project-guides` | 같은 파일 | `expectations.md`는 SME가 소유한다. `project-guides`가 쓰고 이 스킬이 `grader.ts` 테스트와 1:1로 대응시켜 검토한다. 문구를 테스트 제목에 맞춰 고치지 않는다.[](source:pe-own)[](source:pe-exp) |
| **이 스킬** {#r16} | `dev-prompt-canary` | 다음 안내 | `src/authoring/dev-prompts.ts`, `dev.ts`, `generate-grader.ts`를 고칠 때 쓰라고 한다. "그때만"이라는 제한 표현은 없다.[](source:pe-hub)[](source:dpc-front) |
| **이 스킬** {#r17} | `grader-replay` | 다음 안내 | 기존 grader나 공용 grading helper를 고칠 때 쓰라고 한다. 제한 표현은 없다.[](source:pe-hub)[](source:gr-front) |
| **이 스킬** {#r18} | `nightly-eval-investigation` | 다음 안내 | 여러 nightly에 걸친 통과율과 retrieval 표시를 분류할 때 쓰라고 한다.[](source:pe-hub)[](source:ne-front) |
| `dev-prompt-canary` {#r19} | **이 스킬** | 참고 | 다시 만든 `task.md`와 `grader.ts`가 이 스킬의 규칙을 지키는지가 확인 기준이다.[](source:dpc-front)[](source:pe-task) |
| `grader-replay` {#r20} | **이 스킬** | 참고 | Related Skills에서 작성 규칙의 출처로 안내한다.[](source:gr-rel)[](source:pe-front) |
| `nightly-eval-investigation` {#r23} | **이 스킬** | 참고 | 대량 조사 모드에서는 `guides/` 파일을 고치지 않고 보고서에만 권고를 쓴다. flagged task마다 prompt·guide·grader를 8 red line에 대조해 검토하는 것이 필수 규칙이다.[](source:ne-ro)[](source:pe-red) |
| `nightly-eval-investigation` {#r25} | **이 스킬** | 같은 파일 | 대량 모드에서 `guides/<카테고리>/<use-case>/`의 `task.md`, `guide.md`, `grader.ts`, `expectations.md`를 읽기 전용으로 읽는다. 쓰기와 삭제는 금지(MUST NOT)다.[](source:ne-ro)[](source:pe-see) |
| `project-coding-standards` {#r28} | **이 스킬** | 대안 | 평가 capsule을 쓰거나 고칠 때 `gd dev <guide> --test-grader`로 grader 보정을 확인하라는 점이 이 스킬의 보정 검증 명령과 같다. 직접 링크는 없다.[](source:cs-domain)[](source:pe-gen) |

@architecture id=relation-map title="project-evals와 이어지는 스킬"
| pg | project-guides | backend |
| pgv | project-guide-validation | backend |
| self | project-evals(이 스킬) | backend |
| dpc | dev-prompt-canary | backend |
| gr | grader-replay | backend |
| ne | nightly-eval-investigation | backend |
| cs | project-coding-standards | backend |
| pg > self | 다음 안내 | emphasis |
| self > pg | 참고 | dashed |
| pgv > self | 참고 | dashed |
| self > dpc | 다음 안내 |
| self > gr | 다음 안내 |
| self > ne | 다음 안내 |
| dpc > self | 참고 | dashed |
| gr > self | 참고 | dashed |
| ne > self | 참고 | dashed |
| cs > self | 대안 | dashed |

@code source=pe-front language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 8 red line, 파일별 작성 규칙, 생성·검증 명령, 연결 안내를 담은 유일한 파일이다 | 평가 파일을 쓰거나 검토할 때 읽는다 | 평가를 검토할 때, `task.md`를 쓸 때, `grader.ts`를 쓸 때, golden patch를 대할 때, 평가를 만들고 확인할 때 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 검토 지적 | 8 red line만 지적하고 스타일은 건너뛴다. 지적마다 파일·줄, 어긴 red line, 근거, 수정안을 적는다 | [](source:pe-red) |
| guide를 grader에 맞추려는 변경 | 금지(Never). grader를 고치거나 guide 소유자에게 gap을 알린다 | [](source:pe-own) |
| 기존 `expectations.md` | 뜻이 바뀔 때만 고치고 이유를 적는다. 테스트 제목에 맞춰 문구를 바꾸지 않는다 | [](source:pe-own) |
| golden patch | calibration 중에는 잠겨 있다. golden을 grader에 맞춰 고치지 않는다 | [](source:pe-over) |
| calibration | golden 3개는 100%, `zero-passrate.patch`는 면제 아닌 검사에서 0%여야 한다 | [](source:pe-see) |
| `task.md` 형식 | `- ` 한 줄. 줄이 더 있으면 runner가 무시한다 | [](source:pe-task) |
| `grader.ts`의 `test.skip()`과 오류를 삼키는 `try/catch` | 쓰지 않는다 | [](source:pe-vac) |
| 사용자 승인 | 원문에 명시 없음 | [](source:pe-stage) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 8 red line의 원인과 guard — 평가를 검토할 때 · 개요에는 한 줄 설명만 담았다. 1번 red line의 원인 목록과 guard 문장은 상세로 남긴다.
- `task.md` 규칙 9가지 — `task.md`를 쓸 때 · 개요에는 결과를 바꾸는 규칙만 담았다.
- `grader.ts` 규칙(parser 선택, 과적합 방지, 빈 검사 금지, `skipUnless`) — `grader.ts`를 쓸 때 · 개요에는 핵심 금지만 담았다.
- 생성·검증 명령(Gen 1 수동 calibration 포함) — 평가를 만들고 확인할 때 · 개요에는 두 명령만 담았다.

@callout level=open-question title="확인하지 못한 것"
| `gd dev`, `src/grading/*`, `src/core/grader-coverage.ts`, `src/core/grader-lint.ts`와 `guides/`는 이 컬렉션에 없어 규칙이 실제 코드와 맞는지 확인하지 못했다. 명령은 모두 지시상 동작이고 실행하지 않았다. |

읽은 원본: 텍스트 파일 1개. 제외: 없음.
