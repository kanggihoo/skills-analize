# addyosmani/agent-skills vs mattpocock/skills — 비교 분석

두 스킬 팩을 원문만 근거로 대조한다. 평가는 **5장(점수화)과 6장(권고)에서만** 한다. 1~4장은 사실이다.

- A팩 = `addyosmani/agent-skills` — 16개 스킬. 앞서 `skill-analysis/agent-skills/`에 전수 분석함.
- M팩 = `mattpocock/skills` — 사용자가 지목한 6개(`domain-modeling`, `grill-with-docs`, `to-spec`, `code-review`, `implement`, `tdd`) + 이들이 실제로 호출·전제하는 보조 스킬.
- 출처 확인: `skills-lock.json` — A팩 `"source": "addyosmani/agent-skills"`, M팩 `"source": "mattpocock/skills"`.

---

## 0. 읽은 파일 목록

### M팩 — 사용자가 지목한 6개 스킬 (본체)

| 경로 | 바이트 | 역할 |
|---|---|---|
| `~/.agents/skills/domain-modeling/SKILL.md` | 3,331 | 본체 |
| `~/.agents/skills/domain-modeling/CONTEXT-FORMAT.md` | 2,290 | 용어집 포맷 |
| `~/.agents/skills/domain-modeling/ADR-FORMAT.md` | 2,733 | ADR 포맷 + 발동 3조건 |
| `~/.agents/skills/domain-modeling/agents/openai.yaml` | 101 | OpenAI 사이드카 |
| `~/.agents/skills/grill-with-docs/SKILL.md` | 247 | **라우터** (2줄) |
| `~/.agents/skills/grill-with-docs/agents/openai.yaml` | 145 | 사이드카 |
| `~/.agents/skills/to-spec/SKILL.md` | 3,043 | 본체 |
| `~/.agents/skills/to-spec/agents/openai.yaml` | 135 | 사이드카 |
| `~/.agents/skills/code-review/SKILL.md` | 6,589 | 본체 |
| `~/.agents/skills/code-review/agents/openai.yaml` | 100 | 사이드카 |
| `~/.agents/skills/implement/SKILL.md` | 433 | **라우터** (5줄) |
| `~/.agents/skills/implement/agents/openai.yaml` | 139 | 사이드카 |
| `~/.agents/skills/tdd/SKILL.md` | 3,549 | 본체 |
| `~/.agents/skills/tdd/tests.md` | 2,214 | 좋은/나쁜 테스트 예시 |
| `~/.agents/skills/tdd/mocking.md` | 1,481 | 모킹 경계 규칙 |
| `~/.agents/skills/tdd/agents/openai.yaml` | 87 | 사이드카 |
| **6개 스킬 소계** | **26,617** | |

### M팩 — 위 6개가 실제로 호출·전제하는 보조 스킬 (읽지 않으면 6개를 평가할 수 없음)

| 경로 | 바이트 | 누가 왜 필요로 하는가 |
|---|---|---|
| `grilling/SKILL.md` | 1,987 | `grill-with-docs`가 Skill 도구로 호출 |
| `grilling/agents/openai.yaml` | 113 | |
| `grill-me/SKILL.md` | 157 | `grilling` 단독 라우터 (비교 대조용) |
| `codebase-design/SKILL.md` | 6,446 | `tdd`가 seam/depth 어휘 정본으로 호출 |
| `codebase-design/DEEPENING.md` | 2,553 | 의존성 4분류 + seam 규율 |
| `codebase-design/DESIGN-IT-TWICE.md` | 2,664 | 병렬 서브에이전트 인터페이스 탐색 |
| `codebase-design/agents/openai.yaml` | 102 | |
| `setup-matt-pocock-skills/SKILL.md` | 6,841 | `to-spec`·`code-review`의 **선행 필수** |
| `setup-matt-pocock-skills/domain.md` | 2,033 | 도메인 문서 소비 규칙 |
| `setup-matt-pocock-skills/triage-labels.md` | 1,045 | 라벨 5종 매핑 |
| `setup-matt-pocock-skills/issue-tracker-github.md` | 3,731 | (템플릿) |
| `setup-matt-pocock-skills/issue-tracker-gitlab.md` | 3,809 | (템플릿) |
| `setup-matt-pocock-skills/issue-tracker-local.md` | 1,810 | (템플릿) |
| `setup-matt-pocock-skills/agents/openai.yaml` | 152 | |
| `to-spec-no-issue/SKILL.md` | 3,603 | `to-spec`의 트래커 없는 변종 (대조용) |
| `handoff/SKILL.md` | 719 | A팩에 대응물 없음 (갭 확인용) |
| **보조 소계** | **37,765** | |

### A팩

앞선 분석에서 전수 조사됨: 16개 스킬 / 17개 파일 / **230,478 바이트**. 상세 목록은 `skill-analysis/agent-skills/OVERVIEW.md` 8장.

### 부재 확인 (읽으려 했으나 없음)

| 경로 | 어디서 지목 | 결과 |
|---|---|---|
| `~/.agents/skills/to-tickets/` | `setup-matt-pocock-skills/SKILL.md` Section A 설명문 | **없음** |
| `~/.agents/skills/triage/` | `setup-matt-pocock-skills` Section B | **없음** (단 원문이 부재를 전제하고 조건 분기함 — 3-8 참조) |
| `~/.agents/skills/improve-codebase-architecture/` | `setup-matt-pocock-skills/domain.md` | **존재** (5,140 B) |

---

## 1. 페어링 맵 — 어떤 스킬이 서로 비슷한가

```
                M팩 (mattpocock)                       A팩 (addyosmani)
                ────────────────                       ────────────────
의도 추출    grill-with-docs ──┬─▶ grilling  ═══════▶  interview-me
                                └─▶ domain-modeling ═▶  documentation-and-adrs
                                                        + context-engineering(일부)

스펙          to-spec  ════════════════════════════▶  spec-driven-development
              (to-spec-no-issue)                       + planning-and-task-breakdown

구현          implement ──┬─▶ tdd            ═══════▶  (부재: incremental-implementation)
                          └─▶ code-review

테스트        tdd ─────▶ codebase-design      ═══════▶  test-driven-development
                                                        (codebase-design ↔ 부재:
                                                         api-and-interface-design)

리뷰          code-review ═══════════════════════════▶  code-review-and-quality
                                                        + code-simplification

설정          setup-matt-pocock-skills        ═══════▶  (대응 없음)
인계          handoff                         ═══════▶  (대응 없음)

M팩에 대응 없음 ◀═══════════════════════════════════  ci-cd-and-automation
                                                        shipping-and-launch
                                                        observability-and-instrumentation
                                                        performance-optimization
                                                        browser-testing-with-devtools
                                                        constraint-driven-development
                                                        context-engineering
                                                        code-simplification
                                                        doubt-driven-development
                                                        source-driven-development
                                                        planning-and-task-breakdown
```

**대칭 관찰 2건.**

1. A팩이 부재 스킬로 위임한 두 칸이, M팩에는 실제로 존재한다.
   - A팩 `spec-driven-development:202` — "Execute tasks one at a time following `skills/incremental-implementation/SKILL.md`" → 부재. M팩은 `implement`(433 B)로 채움.
   - A팩 `spec-driven-development:61` — "the contract between them belongs in the provider module's spec (see `api-and-interface-design` for designing it)" → 부재. M팩은 `codebase-design`(11,765 B)로 채움.
2. 역으로 M팩에 아예 없는 영역이 A팩의 절반이다 — CI/CD, 배포, 관측, 성능, 브라우저, 제약 수치화, 컨텍스트 예산. 즉 **A팩은 SDLC 전체를 얕게 덮고, M팩은 설계→스펙→구현→리뷰 축만 깊게 덮는다.**

---

## 2. 구조적 차이 8축

### 2-1. 크기와 밀도

| | A팩 | M팩 (지목 6개) |
|---|---|---|
| 스킬 수 | 16 | 6 |
| 총 바이트 | 230,478 | 26,617 |
| 스킬당 평균 | **14,405 B** | **4,436 B** |
| 최대 | 21,717 (`performance-optimization`) | 6,689 (`code-review`) |
| 최소 | 9,782 (`documentation-and-adrs`) | **433** (`implement`) |

스킬당 **3.25배** 차이. 그리고 M팩은 최소값이 433 B — A팩에는 1만 바이트 미만 스킬이 하나도 없다.

### 2-2. 자동 발동 제어 — 가장 큰 설계 차이

A팩 frontmatter는 16/16이 `name` + `description` **2개 필드만** 갖는다. 즉 전부 description 매칭으로 자동 발동하고, 그 description이 매우 넓다:

> A팩 `test-driven-development` — "Use when implementing any logic, fixing any bug, or changing any behavior."
> A팩 `code-review-and-quality` — "Use before merging any change."

M팩은 워크플로 진입점을 명시적으로 잠근다. `disable-model-invocation: true` 를 가진 스킬:

| 스킬 | frontmatter |
|---|---|
| `implement` | `disable-model-invocation: true` |
| `grill-with-docs` | `disable-model-invocation: true` |
| `grill-me` | `disable-model-invocation: true` |
| `to-spec` | `disable-model-invocation: true` |
| `to-spec-no-issue` | `disable-model-invocation: true` |
| `setup-matt-pocock-skills` | `disable-model-invocation: true` |

그리고 같은 정책이 OpenAI 사이드카에도 이중으로 기록된다:

```yaml
# ~/.agents/skills/to-spec/agents/openai.yaml
interface:
  display_name: "To Spec"
  short_description: "Turn a conversation into a spec"
policy:
  allow_implicit_invocation: false
```

반대로 M팩에서 자동 발동을 허용하는 것은 **참조성 스킬**뿐이다 — `tdd`, `code-review`, `domain-modeling`, `grilling`, `codebase-design`. 즉 **"어휘·규칙은 자동으로 끌어와도 되지만 워크플로는 사람이 시작한다"** 는 규칙이 필드 레벨로 강제돼 있다. A팩에는 이 구분이 없다.

M팩에만 있는 필드 하나 더: `handoff` 의 `argument-hint: "What will the next session be used for?"`.

### 2-3. 조합 메커니즘 — 문장 vs 실제 호출

A팩의 형제 스킬 참조는 전부 산문이다:

> A팩 `code-review-and-quality:66` — "For detailed security guidance, see `security-and-hardening`."
> A팩 `observability-and-instrumentation:21` — "use the `debugging-and-error-recovery` skill"

로드 메커니즘이 없고, 지목 대상 5개가 부재다(12곳). M팩은 도구 호출로 명령한다:

> M팩 `grill-with-docs` 전문 — "Call the Skill tool twice, for "grilling" and "domain-modeling"."
> M팩 `grill-me` 전문 — "Call the Skill tool with "grilling"."
> M팩 `tdd:seams` — "call the Skill tool with "codebase-design" for the vocabulary. ... it is a reference to consult, not a session to run."

그리고 라우터 스킬 자체가 얇다: `grill-with-docs` 247 B, `grill-me` 157 B, `implement` 433 B. 조합이 스킬 파일로 표현되어 있다.

### 2-4. 게이트의 성질 — 자기 진술 체크박스 vs 사용자 확인

A팩은 16/16이 `## Verification` 자기 기입 체크리스트로 끝난다. M팩의 지목 6개에는 **자기 진술 체크리스트가 하나도 없다.** 대신 사람에게 묻는다:

> M팩 `grilling` — "Do not act on it until the user confirms you have reached a shared understanding."
> M팩 `tdd` — "**Test only at pre-agreed seams.** Before writing any test, write down the seams under test and confirm them with the user. **No test is written at an unconfirmed seam.**"
> M팩 `to-spec` 2단계 — "Check with the user that these seams match their expectations."
> M팩 `code-review` 1단계 — "If they didn't specify one, ask for it."
> M팩 `domain-modeling` — "Your glossary defines 'cancellation' as X, but you seem to mean Y. Which is it?"

A팩에도 인간 게이트는 있다(`spec-driven-development`의 4단 승인, `interview-me`의 explicit yes). 차이는 **A팩은 인간 게이트 + 자기 체크리스트를 병행하고, M팩은 자기 체크리스트를 아예 쓰지 않는다**는 점이다.

### 2-5. 실행 강제력 — 명령·서브에이전트

A팩의 실행 스크립트는 0개다. 유일한 코드 자산은 `constraint-driven-development/references/floor-guard.md` 안의 인용 블록이며, 원문이 스스로 "This is a starting point, not a finished tool"(`floor-guard.md:99`)이라 적는다.

M팩 지목 6개에도 실행 스크립트 파일은 없다. 그러나 **명령을 지정한다**:

> M팩 `code-review:1` — "Capture the diff command once: `git diff <fixed-point>...HEAD` (three-dot, so the comparison is against the merge-base). Also note the list of commits via `git log <fixed-point>..HEAD --oneline`."
> M팩 `code-review:1` — "confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty. **A bad ref or empty diff should fail here, not inside two parallel sub-agents.**"
> M팩 `handoff` — "Save it to a path produced by `mktemp -t handoff-XXXXXX.md` (read the file before you write to it)."
> M팩 `domain-modeling/ADR-FORMAT.md` — "Scan `docs/adr/` for the highest existing number and increment by one."

그리고 서브에이전트를 **실제로 스폰하도록** 명령한다:

> M팩 `code-review:4` — "Spawn both sub-agents in parallel" + 각 브리프 전문 제공 + "Under 400 words." 상한
> M팩 `grilling` — "When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself."
> M팩 `codebase-design/DESIGN-IT-TWICE.md` — "Spawn 3+ sub-agents in parallel. Each must produce a **radically different** interface"

A팩에서 서브에이전트는 제안 수준이거나(`code-review-and-quality`의 "Multi-Model Review Pattern", `test-driven-development`의 "When to Use Subagents for Testing"), 사용자 인가를 매번 요구하는 외부 CLI다(`doubt-driven-development`). 병렬 스폰을 구조로 못 박은 곳은 없다.

### 2-6. 수치의 밀도와 성질

A팩은 수치가 압도적으로 많다 — 이게 A팩의 실체다. 예: `~80% / ~15% / ~5%` 테스트 피라미드, `LCP ≤ 2.5s`, `CLS ≤ 0.1`, `INP ≤ 200ms`, `Changed lines ≥ 80% covered`, 커버리지 ratchet `0.5%`, `~100/~300/~1000 lines changed`, 파일 `1000 total lines`, 함수 `50+ lines`, `The Rule of 500`, doubt `3 cycles`, 인터뷰 `Stop at four`, `90 seconds`, 태스크 `~5 files`, 롤아웃 `5% → 25% → 50% → 100%`, 에러율 `>2x baseline`, `p99 latency > 2s`, `queue age > 10 min`, 알림 심각도 `two severities only`, 히스토그램 버킷 `[0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]`.

M팩 지목 6개의 수치는 **전부 다음이 끝이다**:

| 수치 | 출처 | 무엇의 상한 |
|---|---|---|
| `Under 400 words.` | `code-review` 서브에이전트 브리프 ×2 | 리포트 길이 |
| `{1-3 sentences: what's the context, what did we decide, and why.}` | `domain-modeling/ADR-FORMAT.md` | ADR 본문 |
| `One or two sentences max` | `domain-modeling/CONTEXT-FORMAT.md` | 용어 정의 |
| `12` Fowler smells | `code-review:3` | 고정 목록 크기 |
| `the ideal number is one` | `to-spec:2`, `to-spec-no-issue:2` | seam 개수 |
| `1–3 entry points max` | `DESIGN-IT-TWICE.md` Agent 1 제약 | 인터페이스 크기 |
| `3+ sub-agents` | `DESIGN-IT-TWICE.md` | 병렬도 하한 |
| `five canonical roles` | `setup` Section B | 라벨 개수 |

즉 **커버리지 %, 지연 예산, 파일 줄 수, 재시도 상한이 M팩에는 존재하지 않는다.** 트레이드오프는 명확하다: A팩은 조작적이지만 스택 고정적이고 서로 모순한다(내 A팩 분석 4-2에서 파일 크기 수치 3종 충돌, 태스크 파일 수 자기 모순 확인). M팩은 이식성이 높지만 "얼마나"를 매번 판단에 맡긴다.

### 2-7. 모호어의 조작적 정의 — M팩의 명확한 우위

A팩 분석에서 확인된 공백: "production-grade", "clean", "done", "simple"의 환산 규칙이 없다. M팩은 어휘를 정의하고 **대체어를 금지한다**:

> M팩 `codebase-design` 글로서리 서문 — "Use these terms exactly: don't substitute "component," "service," "API," or "boundary." Consistent language is the whole point."
> `**Depth**: leverage at the interface. The amount of behaviour a caller (or test) can exercise per unit of interface they have to learn.`
> `**Seam** _(Michael Feathers)_: a place where you can alter behaviour without editing in that place`
> `_Avoid_: boundary (overloaded with DDD's bounded context).`

그리고 **거부한 정의를 명시한다** — A팩에 대응물이 전무한 섹션이다:

> M팩 `codebase-design` "Rejected framings" — "**Depth as ratio of implementation-lines to interface-lines** (Ousterhout): rewards padding the implementation. We use depth-as-leverage instead."

판정 가능한 테스트도 준다:

> M팩 `codebase-design` — "**The deletion test.** Imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep."
> M팩 `codebase-design` — "**One adapter means a hypothetical seam. Two adapters means a real one.** Don't introduce a seam unless something actually varies across it."

프로젝트별 도메인 어휘도 파일로 고정한다(`CONTEXT.md`, `_Avoid_` 목록). **A팩에는 도메인 용어집 개념 자체가 없다** — `context-engineering`의 "Project Map"은 모듈 색인이지 용어집이 아니다.

### 2-8. 부재 참조 처리 — 우아한 실패 vs 침묵 실패

A팩: 부재 스킬 5개 ×12곳, 부재 파일 7개 ×13곳. 대체 경로 지시가 없다. 에이전트가 없는 경로를 읽으려 시도하고 실패한다.

M팩 지목 6개의 참조는 **전부 실존**한다(`grilling`, `domain-modeling`, `codebase-design`, `setup-matt-pocock-skills`, `tdd`, `code-review`). 그리고 전제가 안 갖춰졌을 때의 지시가 있다:

> M팩 `to-spec` — "The issue tracker and triage label vocabulary should have been provided to you. **If not, tell the user to run `/setup-matt-pocock-skills`.**"
> M팩 `code-review` — "If `docs/agents/issue-tracker.md` is missing, tell the user to run `/setup-matt-pocock-skills`."
> M팩 `code-review:2` — "If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip and report "no spec available"."
> M팩 `setup` Section B — "**Skip this section entirely if the `triage` skill isn't installed** (exploration told you), since an uninstalled skill needs no labels."
> M팩 `setup/domain.md` — "If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront."

마지막 두 인용이 결정적이다. M팩은 `triage`·`to-tickets` 스킬이 없을 수 있음을 **설계에 내장**했다(실제로 이 설치본에 둘 다 없다). A팩은 부재를 가정하지 않는다.

---

## 3. 페어별 장단점

### 페어 1 — `grill-with-docs`(+`grilling`+`domain-modeling`) vs `interview-me`

| | 강점 | 약점 |
|---|---|---|
| **A: `interview-me`** (14,359 B) | 확신도를 **숫자로** 강제: `CONFIDENCE: ~30%`, `<~70%`면 이유 첨부 의무. 종료가 체크 가능한 테스트: "Can I predict the user's reaction to the next three questions I would ask?". 비-yes 4종을 열거해 가짜 승인을 차단("Whatever you think is best" / "Sounds good" / "Sure, let's go" / 침묵). `Out of scope` 줄을 "non-negotiable"로 못박음 | **한 번에 1개 질문 강제** — `Three or more questions in a single message: that's batching, not interviewing`. 라운드 수가 곧 왕복 수. `disable-model-invocation` 없어 자동 발동하고 발동 조건이 who/why/success/constraint 중 1개 결손 = 사실상 모든 요청. 산출물이 대화 안의 진술문뿐(파일은 승인 시 선택) |
| **M: `grill-with-docs`** (247 B 라우터 → 10,947 B 폐쇄) | **design tree + frontier** 모델. 프론티어 전체를 **한 라운드에 묶어** 묻고 각 질문에 추천안(`➡️`)을 붙임 → 왕복 수가 질문 수가 아니라 **트리 깊이**로 줄어든다. 사실 조사를 사용자에게 안 물음: "dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself." 그리고 **논블로킹**: "a running exploration is an unsettled prerequisite, so only the questions downstream of it wait". 인터뷰와 동시에 `CONTEXT.md`·ADR이 **파일로 남는다** | 확신도 수치가 없다. 종료 조건 "the frontier is empty"의 판정이 전부 에이전트 몫 — `interview-me`의 3질문 예측 테스트 같은 외부 검증 장치가 없다. 라운드 상한도 없어(A팩 `doubt-driven`의 `3 cycles` 대응물 부재) 이론상 무한 |

**정면 충돌 1건.** 질문 배치 정책이 반대다. A팩은 배치를 Red Flag로 규정하고, M팩은 프론티어 전체 배치를 요구한다. 둘을 동시에 켜면 첫 라운드에서 충돌한다.

### 페어 2 — `to-spec` vs `spec-driven-development`

| | 강점 | 약점 |
|---|---|---|
| **A: `spec-driven-development`** (12,163 B) | 6개 필수 영역(Objective/Commands/Project Structure/Code Style/Testing Strategy/Boundaries)에 Boundaries 3층(`Always do` / `Ask first` / `Never do`)까지 규정. Phase 0 capability map으로 다중 능력 요청을 모듈 분해 + 의존 방향 무순환 + `SPEC-<module-id>.md` 명명. 가정 선언 블록(`ASSUMPTIONS I'M MAKING` → `Correct me now or I'll proceed with these`). 모호 요구를 수치로 재구성(`"Make the dashboard faster"` → `LCP < 2.5s`, `< 500ms`, `CLS < 0.1`) | 4단 전부 인간 승인 + 모듈별 재귀 → 모듈 N개면 게이트 4N개. **Phase 4가 부재 스킬(`incremental-implementation`)에 통째로 위임**되어 워크플로 끝이 비어 있다. `api-and-interface-design`도 부재. 산출물이 로컬 파일뿐 |
| **M: `to-spec`** (3,043 B) | **인터뷰를 하지 않는다** — "Do NOT interview the user; just synthesize what you already know." 즉 `grill-with-docs` 뒤에 붙는 순수 합성 단계로 역할이 좁고 겹침이 없다. **seam 설계가 스펙에 들어간다**: "Existing seams should be preferred to new ones. Use the highest seam possible. ... the ideal number is one" + 사용자 확인. 산출물이 **이슈 트래커에 publish**되고 `ready-for-agent` 라벨이 붙어 다음 에이전트가 픽업 가능. 파일 경로·코드 금지 규칙이 명확: "Do NOT include specific file paths or code snippets. They may end up being outdated very quickly" (프로토타입 예외 1건만 허용) | `setup-matt-pocock-skills` **선행 필수**. 이슈 트래커(GitHub/GitLab/local md) 없으면 못 돈다 — `to-spec-no-issue`(3,603 B)가 대안이지만 별 스킬이다. `Commands`/`Project Structure`/`Code Style`/`Boundaries` 섹션이 없어 스펙이 "무엇을"에 집중하고 "어떻게 확인하나"는 얇다. 능력 분해(A팩 Phase 0) 대응물 없음 — 대신 별 스킬 `wayfinder`가 담당 |

**주목할 비대칭.** `to-spec`의 User Stories 요구가 A팩보다 강하다: "A **LONG**, numbered list of user stories. ... should be **extremely extensive** and cover all aspects." 반면 변종 `to-spec-no-issue`는 정반대로 절제한다: "Cover the main flows and the edge cases that change behaviour. **Merge stories that restate each other rather than padding the list.**" 같은 저자의 두 파일이 같은 섹션에 반대 지시를 준다.

### 페어 3 — `tdd` vs `test-driven-development`

| | 강점 | 약점 |
|---|---|---|
| **A: `test-driven-development`** (16,483 B) | 스택 발견을 **먼저** 강제하고 기본값 추측을 금지: "Never assume a default like `npm test` — a Gradle, Cargo, or pytest project has its own equivalent." 테스트 피라미드 비율(`~80%/~15%/~5%`)과 자원 모델 3분류(Small: 단일 프로세스·I/O 없음 / Medium: localhost / Large: 다중 머신)로 **어디에 얼마나** 투자할지 수치화. 버그 수정 3중 게이트(Prove-It). 재실행 낭비 차단: "After a clean test run, repeating the same command adds nothing unless the code has changed since." 테스트 더블 4단 선호도(real > fake > stub > mock) | 발동 조건이 최대치로 넓다("changing any behavior") + 자동 발동. **전수 커버 요구**: `Every new behavior has a corresponding test`. 프로토타입 예외를 rationalization으로 반박해 핫픽스 우회로가 없다. `testing-patterns.md` 부재. seam 개념 없음 — 테스트를 어디에 놓을지가 피라미드 레벨로만 결정됨 |
| **M: `tdd`** (3,549 B + 3,695 B 보조 → `codebase-design` 11,765 B 참조) | **seam 사전 합의 게이트**가 A팩에 없는 장치다: "No test is written at an unconfirmed seam. **You can't test everything**, so agreeing the seams up front is how testing effort lands on the critical paths and complex logic instead of every edge case." **tautological test 금지**가 A팩에 전무: "the assertion recomputes the expected value the way the code does ... so it passes by construction and can never disagree with the code. Expected values must come from an independent source of truth." **horizontal slicing 금지** + tracer bullet: "Bulk tests verify _imagined_ behavior". 리팩터를 루프에서 **빼냄**: "Refactoring is not part of the loop. It belongs to the review stage". 모킹 경계가 명시적(시스템 경계만) + SDK형 인터페이스 권장 | 수치가 0개 — 피라미드 비율, 커버리지, 테스트 크기 분류가 없다. 스택 발견 지시가 없어 테스트 명령을 어떻게 알아낼지 미정의(A팩의 명시적 강점이 여기선 공백). `CONTEXT.md` 의존은 선택적("if it exists")이지만 없을 때 어휘 규율이 사라짐 |

**정면 충돌 2건.**
1. **커버 범위.** A팩 `Every new behavior has a corresponding test`(전수) vs M팩 `You can't test everything`(선택적 seam 합의). 동시 활성 시 첫 테스트에서 충돌한다.
2. **리팩터의 소속.** A팩은 REFACTOR를 루프의 3단계로 포함하고("REFACTOR — Clean Up ... Run tests after every refactor step"), M팩은 명시적으로 배제해 리뷰 단계로 보낸다.

**보완 관계 1건.** M팩의 tautological test 금지는 A팩 전체에 없고, A팩의 테스트 크기·비율 수치는 M팩 전체에 없다. 두 규칙은 상충하지 않으므로 합칠 수 있다.

### 페어 4 — `code-review` vs `code-review-and-quality`

| | 강점 | 약점 |
|---|---|---|
| **A: `code-review-and-quality`** (20,555 B) | 5축(correctness/readability/architecture/security/performance) + 5단 심각도 라벨(`Critical:` blocks merge / 무접두 required / `Nit:` / `Optional:` / `FYI`)로 "무엇이 필수인가"를 명시. 변경 크기 수치(`~100 / ~300 / ~1000 lines`)와 분할 전략 4종(Stack/By file group/Horizontal/Vertical). 승인 기준이 현실적: "Approve a change when it definitely improves overall code health, even if it isn't perfect." 의존성 업그레이드 규율 5항목(changelog 읽기 / 1패키지 1변경 / 그린 스위트 / transitive graph / lockfile). 리뷰 속도 규범(1영업일 상한). 정직성 규범(sycophancy를 실패 모드로 명시) | **실행 명령이 `npm audit` 하나뿐.** 판정 근거가 전부 자기 기입 체크박스 — 테스트/빌드 실행 지시가 0건이라 "체크박스는 찼는데 아무것도 실행되지 않은 승인"이 가능. `security-and-hardening` 2회 지목 부재 + 참조 파일 2개 부재 → 보안 축 상세가 공백. 20.5 KB로 팩 최대 |
| **M: `code-review`** (6,589 B) | **2축 분리가 구조다**: Standards(리포 표준 준수) / Spec(원 이슈 충실도). 그리고 병합을 금지한다: "Do **not** merge or rerank findings, because the two axes are deliberately separate" + "Don't pick a single winner across axes: that's the reranking the separation exists to prevent." 근거가 명확: "Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**" **격리 컨텍스트 병렬 서브에이전트 2개**로 상호 오염 방지 + 각 400단어 상한. **Fowler 12 smell 고정 베이스라인**(각 항목이 *무엇인가* → *어떻게 고치나* 형식)이라 리포가 문서화된 표준이 없어도 작동. 우선순위가 명시적: "**The repo overrides.** A documented repo standard always wins" + "**Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation" + "skip anything tooling already enforces". 실행 전 사전 검증: `git rev-parse` + 빈 diff 조기 실패 | 보안 축·성능 축이 **아예 없다**. Fowler smell 12종은 구조 냄새 목록이지 취약점 목록이 아니다. 변경 크기 수치·분할 전략 없음. 의존성 리뷰 규율 없음. 최종 판정(merge 가/부)을 내리지 않고 집계만 함 — A팩의 `Approve` / `Request changes` 대응물 부재. 서브에이전트 2개 비용 + `docs/agents/issue-tracker.md` 전제 |

**보완 관계.** 겹침이 거의 없다. M팩은 **어떻게 실행하나**(git 명령, 병렬 격리, 축 분리)를 풀고, A팩은 **무엇을 볼 것인가**(보안 8항목, 성능 6항목, 크기 임계, 의존성 5규율)를 채운다. 합치면 M팩 프로세스 위에 A팩 체크 항목을 서브에이전트 브리프로 주입하는 형태가 된다.

### 페어 5 — `implement` vs (A팩 부재)

`implement` 전문은 5줄이다:

```
Implement the work described by the user in the spec or tickets.
Use /tdd where possible, at pre-agreed seams.
Run typechecking regularly, single test files regularly, and the full test suite once at the end.
Once done, use /code-review to review the work.
Commit your work to the current branch.
```

| | 강점 | 약점 |
|---|---|---|
| **M: `implement`** (433 B) | **A팩에 대응물이 없는 칸을 채운다** — A팩 `spec-driven-development:202`가 `incremental-implementation`을 지목하지만 부재다. 유일한 조작적 규칙이 실용적이다: 타입체크·단일 테스트 파일은 **자주**, 전체 스위트는 **끝에 한 번**(`the full test suite once at the end`) → CI 분·시간 절약. `at pre-agreed seams` 로 `tdd`의 seam 게이트를 상속. `disable-model-invocation: true` 로 자동 발동 차단 | 5줄이라 실질 내용이 라우팅뿐이다. 커밋 단위·롤백·중간 검증 체크포인트가 없다 — A팩 `planning-and-task-breakdown`의 "Verification checkpoints occur after every 2-3 tasks" 대응물 없음. `Commit your work to the current branch` 가 브랜치 전략 없이 무조건 커밋 지시 |
| **A: (부재)** | — | `spec-driven-development` Phase 4가 존재하지 않는 스킬로 위임돼 워크플로 마지막 단계가 비어 있다 |

### 페어 6 — `domain-modeling` vs `documentation-and-adrs`

| | 강점 | 약점 |
|---|---|---|
| **A: `documentation-and-adrs`** (9,782 B) | ADR 템플릿이 풍부(Status/Date/Context/Decision/Alternatives Considered/Consequences) + 실제 예시 완성본 1개. 라이프사이클 명시(`PROPOSED → ACCEPTED → (SUPERSEDED or DEPRECATED)`, "Don't delete old ADRs"). **기존 관행 우선 규칙이 훌륭하다**: "An established convention overrides the defaults below" — 위치·포맷·번호·헤딩 4항목을 매칭하고 충돌 시 표면화. ADR 외에 README 구조, CHANGELOG, OpenAPI, JSDoc까지 포괄. 주석 규범(why만, what 금지) | **ADR 발동 조건이 OR 나열 6개**("Choosing a framework, library, or major dependency" 등) → 조건이 넓어 ADR 남발 유도. 완료 판정 6항목 전부 자기 진술이고 "ADRs exist for **all significant** architectural decisions"는 스코프가 무한. 실행 명령 0건. 그리고 **도메인 용어집 개념이 없다** |
| **M: `domain-modeling`** (3,331 B + 5,023 B 포맷) | **ADR 발동이 AND 3조건**이고 미달 시 생략을 명령한다: "All three of these must be true: 1. **Hard to reverse** 2. **Surprising without context** 3. **The result of a real trade-off** ... **If any of the three is missing, skip the ADR.**" 각 조건에 이유까지 붙인다: "If a decision is easy to reverse, skip it: you'll just reverse it." ADR 본문 최소화: "An ADR can be a single paragraph. The value is in recording *that* a decision was made and *why*, not in filling out sections." **용어집(`CONTEXT.md`)이 A팩 전체에 없는 자산**이고 규율이 강하다: `_Avoid_` 대체어 목록, "One or two sentences max", "**Only include terms specific to this project's context.** General programming concepts ... don't belong even if the project uses them extensively", "`CONTEXT.md` should be **totally devoid of implementation details**. ... It is a glossary and nothing else." 세션 중 능동 개입 4종(용어집 대조 / 퍼지 언어 정밀화 / 시나리오 스트레스 / **코드와 교차 검증**: "Your code cancels entire Orders, but you just said partial cancellation is possible. Which is right?"). 즉시 기록: "update `CONTEXT.md` right there. **Don't batch these up**". 다중 컨텍스트 레이아웃(`CONTEXT-MAP.md` + 컨텍스트별 ADR)과 지연 생성 | README·CHANGELOG·API 문서·주석 규범이 **없다** — 문서화 범위가 용어집 + ADR로 한정. 종료 판정이 미정의(체크리스트도 사용자 확인도 없음). ADR 라이프사이클(supersede 체인)이 optional frontmatter로만 언급 |

**정면 충돌 1건.** ADR 발동 조건이 반대 편향이다 — A팩 OR 6조건(남발) vs M팩 AND 3조건(절약). 그리고 템플릿 크기도 반대다(A팩 7섹션 필수 vs M팩 "single paragraph").

**보완 관계 1건.** `CONTEXT.md` 용어집은 M팩에만, README/CHANGELOG/API 문서 규범은 A팩에만 있다. 겹치지 않는다.

---

## 4. M팩에만·A팩에만 있는 자산

### M팩에만 (A팩에 대응물 없음)

| 자산 | 파일 | 무엇인가 |
|---|---|---|
| 도메인 용어집 | `domain-modeling` + `CONTEXT-FORMAT.md` | 프로젝트 어휘를 `_Avoid_` 목록과 함께 파일로 고정 |
| seam / depth / adapter 어휘 정본 | `codebase-design` (11,765 B) | A팩이 `api-and-interface-design`으로 위임했으나 부재한 칸 |
| 구현 단계 | `implement` | A팩이 `incremental-implementation`으로 위임했으나 부재한 칸 |
| 리포별 설정 스캐폴딩 | `setup-matt-pocock-skills` | 이슈 트래커·라벨·도메인 문서 레이아웃을 `docs/agents/*.md`로 물화 |
| 세션 인계 | `handoff` | 대화를 압축해 다음 에이전트에 넘김. "Do not duplicate content already captured in other artifacts (PRDs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead." |
| 인터페이스 대안 병렬 탐색 | `DESIGN-IT-TWICE.md` | 서브에이전트 3+개에 서로 다른 설계 제약을 주고 depth/locality/seam으로 비교 |
| 의존성 4분류별 테스트 전략 | `DEEPENING.md` | in-process / local-substitutable / remote-owned(port) / true-external(mock) |
| tautological test 금지 | `tdd` + `tests.md` | 기대값이 구현을 재계산하면 무효 |

### A팩에만 (M팩 지목 6개에 대응물 없음)

`ci-cd-and-automation`, `shipping-and-launch`, `observability-and-instrumentation`, `performance-optimization`, `browser-testing-with-devtools`, `constraint-driven-development`, `context-engineering`, `code-simplification`, `doubt-driven-development`, `source-driven-development`, `planning-and-task-breakdown` — **11개 영역**.

그중 M팩으로 대체 불가한 것 4개: **CI/CD, 배포·롤아웃, 관측, 성능**. 이 네 영역은 M팩 전체(지목 6개 + 보조)에 단 한 줄도 없다.

---

## 5. 점수화

여기서부터 평가다. 8개 기준, 각 **1~5점**, 만점 40점.

| 기준 | 5점의 의미 |
|---|---|
| **① 조작성** | 통과/탈락이 원문의 수치나 명시적 테스트로 기계적으로 갈림 |
| **② 실행 강제력** | 실제 명령·도구·서브에이전트 스폰을 지정 (산문 권고가 아님) |
| **③ 이식성** | 언어·프레임워크·CI 벤더에 중립 |
| **④ 발동 정밀도** | description이 좁고 자동 발동이 제어됨 (과잉 발동 위험 낮음) |
| **⑤ 조합성** | 다른 스킬로의 연결이 실제로 로드되고 대상이 실존 |
| **⑥ 컨텍스트 경제** | 로드 비용이 낮음 (필요할 때만 보조 파일 로드) |
| **⑦ 자기 완결성** | 끊긴 참조·미충족 전제 없이 단독 동작 |
| **⑧ 검증 무결성** | 완료 판정이 자기 진술 체크박스에 의존하지 않음 |

### 페어별 점수

| 페어 | 스킬 | ① | ② | ③ | ④ | ⑤ | ⑥ | ⑦ | ⑧ | **합** |
|---|---|---|---|---|---|---|---|---|---|---|
| **1 의도 추출** | A `interview-me` | 4 | 2 | 5 | 2 | 3 | 2 | 3 | 3 | **24** |
| | M `grill-with-docs`(+2) | 3 | 4 | 5 | 4 | 5 | 4 | 5 | 4 | **34** |
| **2 스펙** | A `spec-driven-development` | 3 | 2 | 4 | 2 | 2 | 2 | 2 | 3 | **20** |
| | M `to-spec` | 3 | 4 | 3 | 5 | 4 | 4 | 3 | 4 | **30** |
| **3 테스트** | A `test-driven-development` | 4 | 3 | 5 | 1 | 3 | 2 | 3 | 4 | **25** |
| | M `tdd`(+`codebase-design`) | 3 | 3 | 4 | 3 | 5 | 4 | 5 | 4 | **31** |
| **4 리뷰** | A `code-review-and-quality` | 4 | 2 | 3 | 2 | 2 | 1 | 2 | 2 | **18** |
| | M `code-review` | 4 | 5 | 5 | 4 | 4 | 3 | 4 | 4 | **33** |
| **5 구현** | A (부재) | — | — | — | — | — | — | — | — | **—** |
| | M `implement` | 2 | 3 | 5 | 5 | 5 | 5 | 4 | 2 | **31** |
| **6 문서/도메인** | A `documentation-and-adrs` | 2 | 1 | 5 | 2 | 4 | 2 | 5 | 1 | **22** |
| | M `domain-modeling` | 4 | 3 | 5 | 3 | 5 | 4 | 5 | 3 | **32** |

### 감점 근거 (주요 항목만)

**A팩 ④ 발동 정밀도가 일관되게 낮은 이유**: 16/16이 `name`+`description` 2필드뿐이라 자동 발동 차단 장치가 없고, description이 넓다. `test-driven-development`에 1점을 준 근거는 "Use when implementing any logic, fixing any bug, or **changing any behavior**" — 사실상 모든 코드 작업이다.

**A팩 ⑥ 컨텍스트 경제가 낮은 이유**: 단일 SKILL.md에 전부 인라인되어 부분 로드가 불가능하다. `code-review-and-quality` 20,555 B가 한 번에 들어온다 → 1점.

**A팩 ⑧ 검증 무결성**: `code-review-and-quality` 2점은 6항목 체크리스트가 전부이고 테스트/빌드 실행 명령이 0건이라서다. `documentation-and-adrs` 1점은 체크박스 6개 + "ADRs exist for **all significant** architectural decisions"의 스코프 무한 조합.

**A팩이 이긴 항목**: ① 조작성에서 `test-driven-development`(4) > M `tdd`(3), `code-review-and-quality`(4) = M `code-review`(4). 그리고 ③ 이식성에서 `test-driven-development`(5) > M `tdd`(4) — A팩만 명시적 언어 중립 선언을 갖는다("The examples below use TypeScript for illustration; the workflow is identical in any language").

**M팩 감점**: `to-spec` ③ 3점은 이슈 트래커 필수, ⑦ 3점은 `setup` 선행 필수. `implement` ① 2점·⑧ 2점은 5줄 라우터라 자체 판정 기준이 없어서다. `grill-with-docs` ① 3점은 확신도 수치와 라운드 상한 부재.

### 종합

| | A팩 평균 (6페어 중 5개 비교 가능) | M팩 평균 (6개) |
|---|---|---|
| 합계 평균 | **21.8 / 40** | **31.8 / 40** |
| 최고 | 25 (`test-driven-development`) | 34 (`grill-with-docs`) |
| 최저 | 18 (`code-review-and-quality`) | 30 (`to-spec`) |

기준별 평균:

| 기준 | A팩 | M팩 | 차 |
|---|---|---|---|
| ① 조작성 | 3.4 | 3.2 | **A +0.2** |
| ② 실행 강제력 | 2.0 | 3.7 | M +1.7 |
| ③ 이식성 | 4.4 | 4.5 | M +0.1 |
| ④ 발동 정밀도 | 1.8 | 4.0 | M +2.2 |
| ⑤ 조합성 | 2.8 | 4.7 | M +1.9 |
| ⑥ 컨텍스트 경제 | 1.8 | 4.0 | M +2.2 |
| ⑦ 자기 완결성 | 3.0 | 4.3 | M +1.3 |
| ⑧ 검증 무결성 | 2.6 | 3.5 | M +0.9 |

**읽는 법.** 이 점수는 "설계 위생"의 점수다. A팩이 유일하게 앞선 ① 조작성(+0.2)이 곧 A팩의 존재 이유이기도 하다 — A팩은 **숫자를 준다**. M팩은 숫자를 거의 주지 않는 대신 **메커니즘을 준다**(git 명령, 병렬 서브에이전트, 어휘 정본, 자동 발동 차단, 우아한 실패).

그리고 이 표가 담지 못하는 축이 하나 있다: **범위**. A팩은 16개로 CI/배포/관측/성능까지 덮고, M팩 6개는 설계→스펙→구현→리뷰만 덮는다. 페어 비교에서 A팩이 지는 것과, A팩이 불필요한 것은 다른 얘기다.

---

## 6. 권고

### 6-1. 페어가 겹치는 6칸 — M팩을 정본으로

같은 일을 하는 6칸에서는 M팩을 기본으로 켜고 A팩의 해당 6개는 끈다. 근거는 ④/⑤/⑥의 격차다: A팩 6개는 전부 자동 발동 + 단일 대용량 파일 + 부재 참조를 갖고, M팩 6개는 자동 발동이 잠기고 참조가 실존한다.

### 6-2. A팩에서 **수치만** 뽑아 M팩에 이식

M팩의 공백은 수치다. A팩에서 다음을 `CLAUDE.md` 또는 `CONSTRAINTS.md`로 옮기면 M팩의 ① 조작성 약점이 메워진다:

| 이식 대상 | A팩 출처 | M팩의 어디로 |
|---|---|---|
| 테스트 크기 3분류(Small/Medium/Large)와 `~80%/~15%/~5%` | `test-driven-development` | `tdd`의 seam 합의 시 "어느 층 seam인가" 판단 근거 |
| 변경 크기 `~100/~300/~1000 lines` + 분할 4전략 | `code-review-and-quality` | `code-review` Standards 서브에이전트 브리프에 주입 |
| 보안 8항목 + 성능 6항목 체크 | `code-review-and-quality` | `code-review`에 **3번째 축** 신설 또는 Standards 브리프에 추가 |
| 의존성 업그레이드 5규율(changelog / 1패키지 1변경 / 그린 스위트 / transitive / lockfile) | `code-review-and-quality` | `code-review` Standards 브리프 |
| 스택 발견 절차 + "Never assume `npm test`" | `test-driven-development` | `tdd` 앞단 (M팩 `tdd`에 없는 공백) |
| 커버리지·성능·접근성 임계 + ratchet `0.5%` | `constraint-driven-development` | `CONSTRAINTS.md` (M팩에 대응 스킬 없음 → A팩 그대로 사용) |

### 6-3. A팩에서 **통째로 유지**할 5개

M팩에 대응물이 한 줄도 없어 대체 불가한 것:

1. `ci-cd-and-automation` — 단 GitHub Actions + npm 전제. 다른 CI면 개념(Shift Left, 10분 상한, 게이트 순서)만 발췌.
2. `shipping-and-launch` — 롤아웃 임계표(에러율 `>2x baseline`, p95 `>50%`, JS 에러 `>0.1% of sessions`, 비즈니스 지표 `>5%`)가 M팩 전체에 없다.
3. `observability-and-instrumentation` — RED/USE, 카디널리티 금지 목록, 심각도 2단계.
4. `performance-optimization` — 측정→수정→**재측정→중립이면 revert** 규율.
5. `constraint-driven-development` — 숫자를 파일로 고정하는 유일한 스킬. `floor-guard` 정규식은 손질 후 blocking 승격.

**전제 조건**: 도입 전 `skills-collections/references/` 7개 파일을 채우거나 해당 "See Also" 줄을 삭제해야 한다. 이 5개 중 4개가 부재 파일을 참조한다.

### 6-4. 충돌 4건 — 켜기 전에 한쪽을 골라야 하는 것

| 충돌 | A팩 | M팩 | 권고 |
|---|---|---|---|
| **테스트 커버 범위** | `Every new behavior has a corresponding test` (전수) | `You can't test everything` + seam 사전 합의 | **M팩.** 에이전트가 쓰는 코드량을 고려하면 전수 커버는 곧 무의미한 테스트 대량 생산이다. A팩의 피라미드 비율은 seam 선택의 *근거*로만 쓴다 |
| **리팩터의 소속** | RED-GREEN-**REFACTOR** 루프 3단계 | "Refactoring is not part of the loop. It belongs to the review stage" | **M팩.** A팩 `code-review-and-quality:128`도 "Separate refactoring from feature work"라며 사실상 M팩에 동의한다 |
| **질문 배치** | 한 번에 1개. 3개 이상은 Red Flag | 프론티어 전체를 한 라운드에 | **M팩.** 왕복 수가 트리 깊이로 줄어든다. A팩의 확신도 수치(`CONFIDENCE: ~30%`)만 M팩 라운드 헤더에 얹으면 둘의 장점이 합쳐진다 |
| **ADR 발동** | OR 6조건 + 7섹션 템플릿 | AND 3조건 + "single paragraph" 허용 | **M팩.** A팩 조건은 "Choosing a framework, library, or major dependency"만으로도 거의 매번 발동한다. 단 A팩의 **기존 관행 우선 규칙**("An established convention overrides the defaults")은 M팩에 없으므로 그것만 이식 |

### 6-5. 최종 조합

```
설정      /setup-matt-pocock-skills          (M) — 최초 1회
의도      /grill-with-docs                   (M) + A팩 확신도 수치 이식
스펙      /to-spec                           (M)
계획      planning-and-task-breakdown        (A) — M팩 wayfinder가 있으면 그쪽
구현      /implement                         (M)
테스트    /tdd + codebase-design             (M) + A팩 스택 발견·크기 분류 이식
리뷰      /code-review                       (M) + A팩 보안·성능·의존성 항목 주입
품질바    constraint-driven-development      (A)
CI        ci-cd-and-automation               (A) — GitHub Actions면
배포      shipping-and-launch                (A)
관측      observability-and-instrumentation  (A)
성능      performance-optimization           (A)
인계      /handoff                           (M)
```

끄는 것: A팩 `interview-me`, `spec-driven-development`, `test-driven-development`, `code-review-and-quality`, `documentation-and-adrs`, `code-simplification`(M팩 `code-review`의 Fowler smell과 중복), `doubt-driven-development`(M팩 `code-review`의 병렬 격리 서브에이전트가 같은 효과를 더 싸게 낸다), `context-engineering`(M팩 `setup` + `CONTEXT.md`가 대체), `source-driven-development`(독립 판단 — 프레임워크 버전 민감도가 실제 문제일 때만).

### 6-6. 한 줄 결론

**M팩은 메커니즘이 좋고 숫자가 없다. A팩은 숫자가 좋고 메커니즘이 없다.** 겹치는 6칸은 M팩으로 덮고, A팩은 M팩이 손대지 않는 운영 4영역(CI·배포·관측·성능)과 **숫자 공급원**으로만 쓴다.
