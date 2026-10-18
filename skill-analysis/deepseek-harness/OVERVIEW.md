# deepseek-harness 컬렉션 종합 (OVERVIEW)

- 컬렉션 경로: `/Users/kkh/Desktop/skills-analize/deepseek-harness/` (15개 스킬, 파일 35개, 합계 258,215 바이트)
- 개별 분석: `/Users/kkh/Desktop/skills-analize/skill-analysis/deepseek-harness/<skill>.md`
- 이 문서의 라우팅·수치·충돌은 개별 분석 파일이 아니라 원본 SKILL.md / references / templates / scripts 를 다시 읽고 `grep` 으로 재검증한 결과다.
- 사실 서술은 1~5·7절, 평가는 6절(추천)과 7절에 한정한다. 원문에 없는 항목은 `원문에 명시 없음`.
- 전제: 이 컬렉션은 범용 스킬이 아니라 단일 저장소 `deepseek-harness`(약칭 DSH) 전용이다. 거의 모든 스킬이 저장소 안의 `AGENTS.md`, `docs/…`, `.agents/notes/…`, `pnpm run …` 스크립트를 전제로 한다. 이 파일들은 컬렉션에 포함돼 있지 않다.

---

## 1. 컬렉션 총평

이 컬렉션이 밀어붙이는 철학은 "가이드이지 체크리스트가 아니다 + 증거 없이는 됐다고 말하지 않는다 + 사실에는 소유자가 하나"다. 스킬 다수가 첫머리에서 스스로를 절차서가 아니라 판단 지침으로 규정한다.

> "**This skill is guidance, not a complete checklist.**" (`dsh-code-review/SKILL.md:8`)
> "This is guidance, not a quota or a script" (`dsh-speed-up-perf/SKILL.md:8`)
> "This is guidance, not a checklist" (`dsh-find-simplifications/SKILL.md:8`)
> "**This skill is guidance, not a translation memory.**" (`dsh-translate-docs/SKILL.md:16`)

동시에 "됐다"의 기준은 자기 진술이 아니라 실행된 명령과 관측 결과다.

> "Report exact commands and observed results; do not describe retries, skipped tests, or pending CI as passing." (`dsh-ci-test-reliability/SKILL.md:131`)
> "Documentation states how the product behaves today, and the only admissible evidence for an operation claim is having run it." (`dsh-doc/SKILL.md:41`)
> "Report pending checks as pending." (`dsh-pre-push-checks/SKILL.md:126`)
> "report only executed evidence" (`dsh-speed-up-perf/SKILL.md:90`)

세 번째 축은 "소유자 우선(owner-first)"이다. 파생물(생성 카탈로그, 스냅샷, 번역, 웹사이트)은 직접 고치지 않고 소유 원본을 고친 뒤 재생성한다.

> "Preserve one owner per fact: source, tests, generated catalogs, package READMEs, guides, Agent Notes, and scratch each keep their own kind of truth." (`dsh-doc/SKILL.md:10`)
> "One explanation has one home; essential contract facts may repeat locally." (`dsh-prose-standard/SKILL.md:40`)
> "Say each fact once." (`agent-experience/SKILL.md:18`)

네 번째 축은 "줄이는 것이 기본값이되, 줄여서 명제가 사라지면 실패"다.

> "Remove adjectives, repetition, and narration only when every factual clause survives and the result is clearer. A smaller word count alone is not an improvement." (`dsh-prose-standard/SKILL.md:38`)
> "Prefer a few well-supported candidates over a count of deletions." (`dsh-find-simplifications/SKILL.md:8`)
> "Do not archive toward a quota." (`dsh-archive-agent-notes/SKILL.md:29`)

다섯 번째 축은 "플레이키함을 가리는 수정 거부 + 저장소 실제 CI 위상 가정"이다. 타임아웃 증가, 재시도, 전체 직렬화는 근본 수정으로 인정하지 않는다(`dsh-ci-test-reliability/SKILL.md:104-112`).

수치 면에서의 특징은, 정책 임계값 대부분이 이 컬렉션 안이 아니라 저장소 게이트(`verify-*`, `doc-budgets.manifest.json`)에 있다는 점이다. SKILL.md 에 직접 박힌 숫자는 적다(예: upgrade guide 500 단어, Summary 100 단어, 폰트 굵기 500, GIF 10 MB, 인코더 기본값 fps 10 / max-width 1200 / colors 128).

---

## 2. 스킬 목록표

게이트 = 스킬이 "탈락/중단"을 명시하는 지점이 있는가. 근거는 아래 표 아래의 인용에 있다.

| 이름 | 성격 | 트리거 요약 (description 기준) | 게이트 | 외부 의존 | 산출물 |
|---|---|---|---|---|---|
| agent-experience | 가이드(모델 대면 도구·스킬 설계) | "writing or changing a model-facing tool definition ... and when designing skills, context loading, or multi-step workflows" | 없음 (규칙 나열) | 없음 (19줄, 2,093 B) | 지침만; 별도 산출물 `원문에 명시 없음` |
| dsh-archive-agent-notes | 감사+정리(audit) | "adding, auditing, pruning, archiving, restoring, or reviewing Agent Notes in deepseek-harness" | 있음: 봉인 후 수정 금지, `verify-archived-agent-notes` | `pnpm`, `.agents/notes/`, git | 삭제/아카이브 이동(삼중 파일), 보고문 |
| dsh-ci-test-reliability | 설계+진단(construction/audit) | "tests and fixtures that can fail nondeterministically under CI concurrency ..." | 있음: "Reject flake-masking fixes" 목록, negative control 요구 | Vitest, GitHub Actions, `docs/testing.md` | 테스트/픽스처 수정, 진단 시 읽기전용 보고 |
| dsh-client-ui-ux | 설계+리뷰(가이드) | "product-user-visible GUI behavior in packages/client, or when reviewing such a PR" | 있음: 오버레이 3조건 "verified ... before merge", 디자이너 리뷰 에스컬레이션 | `packages/client`, 테마 토큰, i18n 게이트 | 코드 변경/리뷰 코멘트 |
| dsh-code-review | 감사(audit) | "reviewing a pull request in the deepseek-harness repo" | 있음: "Blocking requirements" 7항 | `pnpm run change-scope`, `gh` | 리뷰 코멘트(결함·위치·영향·증거) |
| dsh-create-upgrade-guide | 생성(construction) | "a deepseek-harness change breaks an externally perceptible surface ..." | 있음: `verify-upgrade-guides`, 500단어 상한 | `pnpm`, `docs/upgrade-guide/` | `guide.md`, `guide.zh.md`, `guide.i18n.yaml` |
| dsh-doc | 생성+감사(construction/audit) | "Create, restructure, review, audit, or migrate DeepSeek Harness Markdown documentation, package READMEs, and the documentation website ..." | 있음: `test:docs`, `doc-sync`, Summary 게이트(100 단어) | `pnpm`, `git`, website/VitePress | 문서/README, 이중언어 쌍, 웹사이트 매니페스트 항목 |
| dsh-find-simplifications | 감사+계획(audit/planning) | "Find evidence-backed simplifications in DeepSeek Harness code, APIs, configuration, tests, and prose" | 부분: 보호 제약(LLM 어댑터 2종, JSONL), 근거 없으면 reject | `rg`, `pnpm run doc-sync`, 서브에이전트 | Agent Note 제안서(필수 5개 절), 보고문 |
| dsh-merging-stacked-prs | 실행(routing 없음, 배포성) | "landing a stack of dependent GitHub PRs ... or whenever a request mentions "stacked PRs"" | 있음: "Hard-stop" 2종, 체크리스트 7항 | `gh stack`(확장), `gh api graphql`, git worktree | 병합된 PR 스택, 검증 출력 |
| dsh-pre-push-checks | 검증(verification) | "before pushing, force-pushing, marking ready for review, or claiming checks pass" | 있음: 체크 실패 시 중단, 사후 sync 검증 전 병합 금지 | `pnpm`, `vitest`, `gh`, git | 실행한 체크 목록과 결과 보고, push |
| dsh-prose-standard | 감사+편집(audit) | "writing, reviewing, restoring, trimming, or auditing prose in the deepseek-harness repo" | 부분: scope 없으면 "report the required input and stop" | `rg`, `git`, `verify-client-ui-i18n` | 편집된 prose / 발견 보고 |
| dsh-speed-up-perf | 측정+계획(planning/verification) | "investigating or optimizing DeepSeek Harness performance, designing realistic synthetic benchmarks or CI performance gates" | 있음: negative control, 측정 카드 7필드, 최적화 reject 조건 | Node, 빌드 산출물, 브라우저 하네스, `benchmarks/` | 벤치마크, 수정, Agent Note, 요약 포맷 |
| dsh-translate-docs | 생성(번역) | frontmatter `disable-model-invocation: true`; "Manually run the extended DeepSeek Harness bilingual-document workflow" | 있음: 호출 경계("Run this extended workflow only when the user explicitly invokes"), 쌍 검증 | `pnpm run gen-translation-brief`, `verify-translation-pairing`, 서브에이전트 | `foo.md`/`foo.zh.md`/`foo.i18n.yaml` 쌍 |
| dsh-trim-cot-leakage | 감사+수정(audit) | "prose that reads like a leaked reasoning transcript" | 있음: "The one test", overcorrection traps, 재실행 | `rg --hidden`, `doc-sync`, `verify-type-equiv` | 수정된 주석/문서, 보고 |
| record-browser-gif | 생성(construction)+게시 | "Record browser or Web UI interaction demos as optimized GIFs ... for every pull request that changes product-user-visible GUI behavior, which MUST include a GIF" | 있음: 헤드 SHA 재확인("Stop and re-record when it moved"), 10 MB, 인코더 검증 | `python3`, `ffmpeg`, `ffprobe`, Playwright, `gh` >= v2.99.0, API 키 | `.gif`, PR 본문 임베드, 에셋 브랜치(폴백) |

표 근거 인용(핵심만):

- dsh-ci-test-reliability: "Do not present these as root-cause fixes for deterministic local tests: increasing a timeout without identifying the awaited state; adding retries; making all files serial; swallowing an error or unhandled rejection; weakening an assertion; normalizing away unstable behavior; adding a sleep before cleanup or assertion." (`SKILL.md:104-112`)
- dsh-merging-stacked-prs: "Hard-stop if the official extension or server-side stack feature is unavailable" (`SKILL.md:12`); "hard-stop on a cross-fork chain" (`SKILL.md:12`).
- dsh-translate-docs: "Never select or load it for ordinary documentation work, from another skill, or from an inferred translation need" (`SKILL.md:12`). 이 스킬만 frontmatter 에 `disable-model-invocation: true` 와 `user-invocable: true` 가 있다.
- 다른 14개 스킬은 `name`/`description` 외 frontmatter 필드가 `원문에 명시 없음`(`allowed-tools`, `model`, `metadata` 모두 없음; grep 확인).
- dsh-prose-standard: "Require an explicit `scope`. If it is missing, report the required input and stop; do not infer a repository-wide scope or begin an interview." (`SKILL.md:16`)
- record-browser-gif: "A pull request that changes product-user-visible GUI behavior MUST include a demonstration GIF recorded with this skill" (`SKILL.md:14`).

스크립트를 가진 스킬은 `record-browser-gif` 하나뿐이다(`scripts/encode_gif.py` 12,988 B, `scripts/test_encode_gif.py` 4,726 B). 나머지는 모두 마크다운이다.

---

## 3. 라우팅 맵

### 3.1 방향 그래프 (A → B : A 가 B 를 지목해 넘기거나 선행 읽기를 요구)

원문 링크/지명에서 직접 추출했다. 괄호는 근거 위치.

```
dsh-archive-agent-notes ──► dsh-pre-push-checks         (SKILL.md:66 "select any additional evidence through ...")
dsh-ci-test-reliability ──► dsh-pre-push-checks         (SKILL.md:16, :131)
dsh-client-ui-ux        ──► dsh-prose-standard          (SKILL.md:8 "Copy quality itself follows ...")
dsh-code-review         ──► dsh-prose-standard          (SKILL.md:15, :24)
dsh-code-review         ──► dsh-ci-test-reliability     (SKILL.md:16, :45)
dsh-code-review         ──► dsh-client-ui-ux            (SKILL.md:17)
dsh-create-upgrade-guide──► dsh-prose-standard          (SKILL.md:46)
dsh-create-upgrade-guide──► dsh-doc/templates/upgrade-guide.md  (SKILL.md:36, 파일 참조)
dsh-doc                 ──► dsh-create-upgrade-guide    (SKILL.md:60 "owned by")
dsh-doc                 ──► dsh-trim-cot-leakage        (SKILL.md:93)
dsh-doc                 ──► dsh-find-simplifications    (SKILL.md:93 "propose the behavior change first (follow ...)")
dsh-doc                 ──► dsh-prose-standard          (SKILL.md:115; references/style.md:31)
dsh-doc/references/website-sync.md ──► dsh-pre-push-checks (:87)
dsh-doc/templates/upgrade-guide.md ──► dsh-create-upgrade-guide (:3)
dsh-find-simplifications──► dsh-prose-standard          (SKILL.md:59)
dsh-find-simplifications──► dsh-archive-agent-notes     (SKILL.md:63 "Every new note requires a scoped supersession check through ...")
dsh-find-simplifications──► dsh-pre-push-checks         (SKILL.md:67)
dsh-pre-push-checks     ──► dsh-ci-test-reliability     (SKILL.md:31 "use ... first")
dsh-prose-standard      ──► dsh-doc                     (SKILL.md:8 "placement, budgets, bilingual pairs, and documentation gates")
dsh-prose-standard      ──► dsh-trim-cot-leakage        (SKILL.md:8 "hunting and fixing reasoning-transcript leakage")
dsh-speed-up-perf       ──► dsh-ci-test-reliability     (SKILL.md:12)
dsh-speed-up-perf       ──► dsh-pre-push-checks         (SKILL.md:90)
dsh-translate-docs      ──► dsh-prose-standard          (SKILL.md:46)
dsh-translate-docs      ──► dsh-pre-push-checks         (SKILL.md:69)
dsh-translate-docs      ──► dsh-code-review#reporting-findings (SKILL.md:74; 앵커 "## Reporting findings" 실재)
dsh-trim-cot-leakage    ──► dsh-prose-standard          (SKILL.md:8, :41, :43)
dsh-trim-cot-leakage    ──► dsh-doc                     (SKILL.md:43 "per dsh-doc")
```

인-디그리(들어오는 화살표) 요약:

| 스킬 | 들어오는 수 | 지목한 스킬 |
|---|---|---|
| dsh-prose-standard | 7 | client-ui-ux, code-review, create-upgrade-guide, doc, find-simplifications, translate-docs, trim-cot-leakage |
| dsh-pre-push-checks | 6 | archive-agent-notes, ci-test-reliability, doc(references), find-simplifications, speed-up-perf, translate-docs |
| dsh-ci-test-reliability | 3 | code-review, pre-push-checks, speed-up-perf |
| dsh-doc | 3 | prose-standard, trim-cot-leakage, create-upgrade-guide(템플릿 파일 경유) |
| dsh-trim-cot-leakage | 2 | doc, prose-standard |
| dsh-create-upgrade-guide | 2 | doc, doc/templates/upgrade-guide.md |
| dsh-find-simplifications | 1 | doc |
| dsh-archive-agent-notes | 1 | find-simplifications |
| dsh-client-ui-ux | 1 | code-review |
| dsh-code-review | 1 | translate-docs |
| agent-experience | 0 | (없음) |
| dsh-merging-stacked-prs | 0 | (없음) |
| record-browser-gif | 0 | (없음) |

### 3.2 순환(상호 지목)

- `dsh-doc` ↔ `dsh-prose-standard` (서로 지목)
- `dsh-prose-standard` ↔ `dsh-trim-cot-leakage` (서로 지목)
- `dsh-doc` ↔ `dsh-trim-cot-leakage` (서로 지목)
- `dsh-ci-test-reliability` ↔ `dsh-pre-push-checks` (서로 지목)
- `dsh-create-upgrade-guide` ↔ `dsh-doc` (서로 지목)

순환 자체를 막는 규칙은 `원문에 명시 없음`. 각 쌍은 역할 분담 문장으로 갈린다.
> "This skill owns editorial judgment and required prose coverage; use dsh-doc for placement, budgets, bilingual pairs, and documentation gates, and dsh-trim-cot-leakage for hunting and fixing reasoning-transcript leakage." (`dsh-prose-standard/SKILL.md:8`)
> "This skill owns isolation and reliability decisions; it does not replace the repository's test-tier policy or select every command for a push." (`dsh-ci-test-reliability/SKILL.md:8`)

### 3.3 고립 노드 (어느 스킬도 지목하지 않음 / 어느 스킬도 지목하지 않는 스킬)

- `agent-experience`, `dsh-merging-stacked-prs`, `record-browser-gif`: 컬렉션 내 다른 SKILL.md/references/templates 에서 이름이 등장하지 않는다(`grep -rn` 확인). 이 셋은 나가는 화살표도 없다.
- 이름 없는 암묵적 연결(스킬명을 쓰지 않고 개념만 언급):
  - `dsh-speed-up-perf` 는 "official GitHub stacks and separate worktrees"(`:88`), "include the required browser evidence/GIF"(`:80`)라고만 쓰고 `dsh-merging-stacked-prs`·`record-browser-gif` 를 지명하지 않는다.
  - `dsh-pre-push-checks` 는 `gh stack sync` 를 다루지만(`:8`, `:85-94`) `dsh-merging-stacked-prs` 를 지명하지 않는다. 반대로 `dsh-merging-stacked-prs` 도 `gh stack sync` 후 검증을 요구하면서(`:72`) `dsh-pre-push-checks` 를 지명하지 않는다.
  - `dsh-code-review` 는 "the extended translation skill is outside automatic review and runs only on explicit user invocation"(`:20`)이라며 `dsh-translate-docs` 를 이름 없이 가리킨다.
  - `dsh-doc` 는 "Skills: run the repository's skill-invocation metadata check."(`:126`)라고 쓰며 어떤 스킬인지는 쓰지 않는다.

### 3.4 끊긴 참조 (존재하지 않는 스킬 지목)

- 스킬 이름 수준: **없음.** 컬렉션 내 모든 `dsh-*` 스킬 링크·지명(위 표 전부)이 실재하는 디렉터리를 가리킨다. 링크 대상 `../dsh-*/SKILL.md` 는 전부 존재한다.
- 파일 앵커: `dsh-translate-docs/SKILL.md:74` 의 `../dsh-code-review/SKILL.md#reporting-findings` 는 `dsh-code-review/SKILL.md:51` 의 `## Reporting findings` 와 일치한다.
- 경로 수준 끊김(컬렉션 밖 자원, 스킬이 아님): 아래는 SKILL.md 가 상대 경로로 가리키지만 이 컬렉션 디렉터리에는 없는 대상이다. 저장소 전체(`.agents/skills/<name>/` 레이아웃, `recall-batteries.md:8` 이 `.agents/skills/dsh-trim-cot-leakage/` 를 명시)가 있어야 해석된다.

| 지목하는 곳 | 대상(컬렉션에 없음) |
|---|---|
| 다수 SKILL.md | `../../../AGENTS.md`, `../../../packages/AGENTS.md`, `../../../docs/AGENTS.md`, `../../../docs/testing.md`, `../../../docs/defensive-patterns.md`, `../../../docs/architecture.md` |
| dsh-translate-docs | `docs/i18n/README.md`, `translation-rules.md`, `terminology.md`, `translation-prompt.md`, `style-samples.md`, `scripts/translation-pairing.manifest.json` |
| dsh-doc | `scripts/doc-budgets.manifest.json`, `website/docs.ts`, `scripts/project-doc-site.ts`, `packages/session/session-persistence-jsonl/README.md`(및 `.zh.md`) |
| dsh-ci-test-reliability | `snapshots/AGENTS.md` |
| dsh-client-ui-ux | `docs/web-styling.md`, `packages/client/ui-primitives/README.md#component-catalog`, `.agents/notes/implemented/architecture/2026-08-23-locale-owned-client-ui-copy.md` |
| dsh-speed-up-perf | `benchmarks/AGENTS.md`, `.agents/notes/implemented/process/2026-09-06-evidence-driven-performance-skill.md`, `.agents/notes/implemented/testing/2026-09-04-session-open-performance-gate.md` |
| dsh-create-upgrade-guide | `docs/cookbook/reviewing-persistence-type-changes.md` |
| dsh-merging-stacked-prs | `docs/cookbook/responding-to-pr-review-on-a-stack.md` |
| dsh-find-simplifications | `docs/development.md`, `.agents/notes/implemented/process/2026-07-26-dependencies-over-hand-rolling.md`, `notes/rejected/simplification/…` 2건(링크는 `../../../notes/rejected/...`; 레이아웃 해석 `원문에 명시 없음`) |
| dsh-pre-push-checks | `packages/test-support/remote-mock/README.md#remote-proxy` |
| dsh-translate-docs | `.agents/notes/archived/process/2026-07-26-briefed-minimal-translation-updates.md` |
| dsh-code-review | `docs/subsystems/README.md`, `.agents/notes/implemented/process/2026-06-11-quality-gates.md` |
| record-browser-gif | `.agents/notes/implemented/process/2026-08-08-browser-gif-evidence-chain.md`, `apps/web/package.json` |

- 참고: `dsh-doc/references/website-sync.md:87` 과 `dsh-doc/templates/upgrade-guide.md:3` 이 쓰는 `../../dsh-…/SKILL.md` 는 컬렉션 레이아웃에서 실제로 해석된다(references/·templates/ 에서 두 단계 위가 컬렉션 루트).

---

## 4. 중복·충돌

### 4.1 같은 일을 나눠 갖는 스킬 쌍 (역할 분담이 원문에 명시된 것)

| 쌍 | 겹치는 영역 | 원문의 분담 규칙 |
|---|---|---|
| dsh-prose-standard / dsh-trim-cot-leakage | 불필요한 서술 제거, "reasoning transcript" | trim-cot: "**REQUIRED BACKGROUND:** dsh-prose-standard owns the complete-proposition rule this skill applies" (`:8`) |
| dsh-prose-standard / dsh-doc | 문서 prose 편집 vs 배치·예산·이중언어 | prose-standard: "use dsh-doc for placement, budgets, bilingual pairs, and documentation gates" (`:8`) |
| dsh-doc / dsh-translate-docs | 이중언어 쌍 | doc: "Update the bilingual counterpart in the same pass" (`:35`); translate-docs 는 명시 호출 시에만, 일상 번역은 `docs/AGENTS.md` 의 one-shot 규칙 (`translate-docs:12`) |
| dsh-doc / dsh-create-upgrade-guide | 업그레이드 가이드 문서 | doc 의 `upgrade-guide` 종류는 "owned by dsh-create-upgrade-guide" (`doc:60`) |
| dsh-pre-push-checks / dsh-ci-test-reliability | 테스트 증거 선택 vs 테스트 설계 | pre-push: "This skill still selects the commands and avoids repeating evidence that already passed." (`:31`) |
| dsh-code-review / dsh-client-ui-ux, dsh-ci-test-reliability, dsh-prose-standard | 리뷰 시 각 영역 판단 | code-review 가 각각을 "Sources of truth" 와 "Manual checks" 에서 위임 (`:15-17`, `:45`) |
| dsh-find-simplifications / dsh-archive-agent-notes | Agent Note 정리 | find-simplifications: "That workflow owns retention, consolidation, triplet deletion, and frozen archive mechanics." (`:63`) |
| dsh-doc / agent-experience | "에이전트가 읽기 쉬운" 문서/컨텍스트 | 서로 지목 없음. doc: "Agent-readable: metadata, stable headings, anchors ..." (`:82`); agent-experience: "Start with minimal context". 분담 규칙 `원문에 명시 없음` |

### 4.2 서로 당기는(반대 방향) 지시

1. **재시도: 금지 vs 허용**
   - "Do not present these as root-cause fixes ...: ... adding retries" (`dsh-ci-test-reliability/SKILL.md:104-107`)
   - "Retries remain valid for documented transient external-provider tests under the real-API policy. Keep that exception at the external boundary." (`:114`) — 같은 스킬 안에서 예외를 명시한다.
   - "sizing a bounded retry to the contention actually measured on the runner" 도 마스킹이 아니라고 규정(`:116`). Windows 파일 핸들에 "bounded retry"(`:62`).
2. **검사 반복: 한 번만 vs 작업별 재실행**
   - "Do not manually repeat a passing check merely because commit or push follows." (`dsh-pre-push-checks/SKILL.md:42`)
   - `dsh-doc/SKILL.md:37` 은 워크플로 8단계에서 매번 "`pnpm run test:docs`, `pnpm run doc-sync`, `pnpm run lint`, and `git diff --check`" 를 실행하라 한다.
   - 반면 `dsh-translate-docs/SKILL.md:69`: "`pnpm run doc-sync` ... runs once at PR level per dsh-pre-push-checks, not inside each translation task." 즉 문서 작업 안의 `doc-sync` 실행 여부가 dsh-doc(작업 내 실행)과 dsh-translate-docs(PR 수준 1회)에서 다르게 서술된다. 우선순위 규칙은 `원문에 명시 없음`.
   - `dsh-trim-cot-leakage/SKILL.md:45` 와 `dsh-archive-agent-notes/SKILL.md:66` 도 작업 말미에 `doc-sync` 를 실행한다.
3. **로컬 전체 실행: 금지 vs 허용**
   - "without reflexively running the full repository suite" (`dsh-pre-push-checks` description) 와 "Run the complete local approximation only when the user explicitly requests it, while diagnosing a CI failure, or when the change spans the repository so broadly that no narrower set is credible." (`:77`) — 조건부.
4. **커버리지: 하한 고정**
   - "The configured per-file 100% thresholds still apply inside the selected source scope." (`dsh-pre-push-checks/SKILL.md:62`)와 "Do not use `--passWithNoTests`, lower coverage thresholds, or narrow `--coverage.include` merely to hide an uncovered affected file." (`:73`). 반대 방향 지시는 컬렉션 내에서 `원문에 명시 없음`.
5. **줄이기 vs 늘리기**
   - `dsh-prose-standard/SKILL.md:46`: "This is not a one-way shortening pass. Add or restore prose when code, types, and structure do not communicate a required contract below."
   - `dsh-trim-cot-leakage` 와 `dsh-find-simplifications` 는 삭제 지향이나 각각 "overcorrection traps"(`trim-cot:44`), "dropping interrupted work is a capability loss, not redundant-log cleanup"(`find-simplifications:47`)로 방어한다.
6. **번역 방식: 전체 재번역 금지 vs 신규 쌍은 전체 번역**
   - "Never re-translate a whole document to apply an update" (`dsh-translate-docs/SKILL.md:20`) 와 "When translations need to be written from scratch, the orchestrating agent does not translate: spawn a subagent" (`:38`) — 변경 유형별로 분기(충돌 아님, 분기 규칙).
7. **서브에이전트 사용 지시 불일치(성격 차이)**
   - 위임 지시: `dsh-find-simplifications:16`("divide independent domains among subagents"), `dsh-speed-up-perf:20`("Delegate independent domains when breadth helps"), `dsh-translate-docs:32,38`.
   - 위임 지시 없음: 나머지 스킬. `agent-experience` 는 위임 대신 "load detailed instructions when needed" 만 말한다.
8. **GIF 필수 vs 다른 스킬의 침묵**
   - `record-browser-gif` 는 GUI PR 에 GIF 를 MUST 로 요구(`:14`). `dsh-client-ui-ux`·`dsh-code-review` SKILL.md 에는 `gif` 단어가 없다(`grep -i gif` 결과: record-browser-gif 와 dsh-speed-up-perf 두 파일만). `dsh-speed-up-perf:80` 만 "For a product-visible GUI change, include the required browser evidence/GIF." 로 언급한다.
9. **`/tmp` 사용**
   - `record-browser-gif` 에셋 브랜치 폴백은 `/tmp/assets-checkout` 스크래치 클론을 사용한다(`:~135`). 외부 환경이 스크래치 디렉터리를 강제할 경우의 충돌은 `원문에 명시 없음`(컬렉션 안에 그런 규칙 없음).

### 4.3 수치 간 정합성 확인

- 단어 수 상한 두 종류가 다른 대상에 걸려 있다(충돌 아님): upgrade guide "at most 500 words in `guide.md`, frontmatter included" (`dsh-create-upgrade-guide/SKILL.md:40`), README Summary "at most 100 `wc -w`-style words" (`dsh-doc/SKILL.md:125`; `templates/package-*.md`). 스타일 참고치 "20 words for an instruction and 25 words for a description as review prompts, not mechanical gates" (`dsh-doc/references/style.md:31`).
- 예산 하한: "at or below target, retain at least 5% headroom" (`dsh-doc/SKILL.md:97`).

---

## 5. 커버리지 갭

수명주기 칸별로 컬렉션이 직접 다루는 스킬과, 다루지 않는 부분(`원문에 명시 없음`).

| 단계 | 다루는 스킬 | 비어 있는 부분 |
|---|---|---|
| 요구사항 | 없음(전용 스킬 없음). `dsh-find-simplifications` 가 "survey vs 구현 허가" 구분(`:8`)만 한다 | 요구사항 수집·명세 스킬 `원문에 명시 없음` |
| 설계 | `dsh-client-ui-ux`(UI 판단), `agent-experience`(도구 정의 설계), `dsh-find-simplifications`(단순화 제안). 설계 결정 기록은 Agent Note 규칙(`.agents/notes/README.md`, 컬렉션 밖)에 위임 | 일반 아키텍처 설계 스킬 `원문에 명시 없음`. Agent Note 작성 자체를 안내하는 스킬은 없음(`dsh-archive-agent-notes` 는 정리·보관) |
| 구현 | 직접 구현 스킬은 없음. 영역별 제약만: `dsh-client-ui-ux`, `dsh-prose-standard`(주석/JSDoc), `dsh-ci-test-reliability`(테스트 코드), `dsh-speed-up-perf`(성능 수정), `dsh-create-upgrade-guide` | 백엔드 기능 구현·API 설계·마이그레이션 구현 규칙은 `원문에 명시 없음`(AGENTS.md 에 위임) |
| 테스트 | `dsh-ci-test-reliability`(격리·플레이크), `dsh-pre-push-checks`(범위별 선택, 커버리지 필터), `dsh-speed-up-perf`(벤치마크) | 테스트 설계 일반 전략(TDD 등)은 `원문에 명시 없음`; 테스트 계층 정책은 `docs/testing.md`(컬렉션 밖) |
| 리뷰 | `dsh-code-review`, `dsh-client-ui-ux`(리뷰 에스컬레이션), `dsh-translate-docs`(번역 리뷰 응답), `dsh-trim-cot-leakage` | 보안 전용 리뷰는 code-review 의 "Enforcement"/"Borrowed and derived state" 항목 외 별도 스킬 `원문에 명시 없음` |
| 배포·병합 | `dsh-merging-stacked-prs`(스택 병합), `dsh-pre-push-checks`(푸시), `record-browser-gif`(PR 증거 게시) | 릴리스 컷·버전 범프·패키지 퍼블리시 절차는 `원문에 명시 없음`(`dsh-create-upgrade-guide` 가 "After the version bump, guides in older version directories are frozen" 라고 버전 범프 사실만 전제). 웹사이트 배포는 "deployment stays a separate, explicitly requested step" (`dsh-doc:101`) 로 의도적으로 제외 |
| 운영 | 없음 | 모니터링·장애 대응·온콜 `원문에 명시 없음`. 포스트모템은 `dsh-prose-standard:55` 에서 prose 항목으로만 언급 |
| 문서·지식 관리 | `dsh-doc`, `dsh-prose-standard`, `dsh-translate-docs`, `dsh-create-upgrade-guide`, `dsh-archive-agent-notes`, `dsh-trim-cot-leakage` | 가장 두텁다. 15개 중 6개가 이 영역 |

관찰: 15개 중 문서/prose 영역 6개 + 테스트·검증 영역 3개(`pre-push`, `ci-test`, `speed-up-perf`) + GitHub PR 운영 2개(`merging-stacked-prs`, `record-browser-gif`)이며, 요구사항·운영 칸은 비어 있다.

---

## 6. 도입 순서 추천

(평가 구간) 근거는 3절 인-디그리와 각 스킬 원문이다.

### 처음 켤 3개

1. **dsh-prose-standard** — 인-디그리 7로 컬렉션의 허브다. 주석·JSDoc·README·UI 문자열까지 범위가 가장 넓고, "explicit `scope`" 없으면 멈추는 입력 규칙(`:16`)이 있어 과잉 작동이 제한된다.
2. **dsh-pre-push-checks** — 인-디그리 6. 푸시 전 "smallest tests and checks" 선택과 `--force-with-lease` 강제(`:81`), "Raw `--force` is never allowed." 같은 되돌리기 어려운 동작 방어가 있어 사고 비용 대비 효과가 크다.
3. **dsh-code-review** — 다른 스킬 3개(prose, ci-test, client-ui)를 한 번에 호출하는 진입점이고, "a short review with one substantiated blocker is better than a list of nits"(`:8`)로 리뷰 품질 기준을 제시한다.

### 나중에 켤 것

- `dsh-ci-test-reliability`: 플레이크·CI 이슈가 실제 있을 때 (pre-push 및 code-review 에서 조건부로 불려 온다).
- `dsh-doc`, `dsh-create-upgrade-guide`: 문서·이중언어·웹사이트 게이트(`test:docs`, `doc-sync`, 사이트 매니페스트)가 갖춰진 뒤에.
- `dsh-client-ui-ux`: `packages/client` 작업이 있을 때.
- `dsh-speed-up-perf`: 벤치마크 레인(`benchmarks/`)이 있을 때.
- `dsh-find-simplifications`, `dsh-archive-agent-notes`: Agent Notes 체계(`.agents/notes/`)가 있을 때만.
- `dsh-merging-stacked-prs`: GitHub 공식 스택(`gh stack`)을 쓸 때만. 없으면 "Hard-stop" 이다.
- `record-browser-gif`: GUI PR 이 있을 때. `python3`/`ffmpeg`/`ffprobe`/API 키 필요.
- `agent-experience`: 모델 대면 도구 정의를 쓸 때. 의존성이 없어 어느 저장소에서도 단독 사용 가능하다(19줄).

### 켜지 않을 것

- `dsh-translate-docs`: frontmatter `disable-model-invocation: true`; 사용자가 이름으로 호출할 때만 쓴다.
- `dsh-trim-cot-leakage`: 감사 목적의 일회성 정화 작업용. 상시 활성화는 `dsh-prose-standard` 가 이미 호출 경로를 갖는다.

---

## 7. 이 컬렉션을 쓰면 안 되는 상황

- **DSH 저장소가 아닌 프로젝트.** 스킬 이름·description 에 `DeepSeek Harness`/`deepseek-harness` 가 박혀 있고 본문은 `pnpm run change-scope`, `verify-translation-pairing`, `doc-sync`, `.agents/notes/` 등 저장소 전용 스크립트·경로를 전제한다. 이들 스크립트의 정의는 컬렉션에 없다(3.4 표).
- **`gh stack` 을 쓰지 않는 GitHub 저장소 또는 포크 기반 협업.** `dsh-merging-stacked-prs`: "Hard-stop if the official extension or server-side stack feature is unavailable ... hard-stop on a cross-fork chain." (`:12`)
- **github.com 이 아닌 호스트(예: GitHub Enterprise Server)에서 GIF 첨부.** `gh --attach` 는 "GitHub Enterprise Server is not supported" (`record-browser-gif/SKILL.md`, Attach with gh 절). 에셋 브랜치 폴백이 있지만 별도 작업이 든다.
- **API 키·실서버를 쓸 수 없는 환경에서 GUI PR.** `record-browser-gif` 는 "a real server booted from that pull request's branch tree, a real API key, and real model rounds" 를 요구하고 키 부재 시 대체 대신 "report that limitation" 한다(`:16`, `:~24`).
- **빠른 프로토타입·핫픽스에서 문서 게이트를 전부 적용하려는 경우.** `dsh-doc` 는 모든 신규 문서·문단에 "Fact-check procedure ... mandatory" 를 요구한다(`:41`). 소규모 작업용 완화 규칙은 `원문에 명시 없음`.
- **영어/중국어 이중언어 문서 정책이 없는 프로젝트.** `dsh-translate-docs`, `dsh-doc`, `dsh-create-upgrade-guide` 는 `foo.md`/`foo.zh.md`/`foo.i18n.yaml` 3파일 쌍을 전제한다.
- **Agent Notes(`implemented`/`rejected`/`proposed` 수명주기)를 운영하지 않는 프로젝트.** `dsh-archive-agent-notes`, `dsh-find-simplifications` 의 산출물이 Agent Note 이다.
- **Windows 에서 `record-browser-gif` 인코더 테스트를 CI 로 돌리려는 경우.** "These local media tests do not run in repository CI." (`record-browser-gif/SKILL.md`, Encoder maintenance) — CI 검증 공백. 플랫폼 지원 범위는 `원문에 명시 없음`.
- **하드코딩된 정보에 의존하는 항목**(유지보수 리스크, 사실 기록): 디자이너 리뷰어 명단 "roster as of 2026-09: yx zhang, yifffan, zhangziya, gaokaige" (`dsh-client-ui-ux/SKILL.md:62`), `gh` 최소 버전 "v2.99.0", 예시 버전 `v0.1.7-rc.2` (`dsh-create-upgrade-guide/SKILL.md:26`).

---

## 8. 읽은 파일 전체 목록 (경로 + 바이트)

`find ... -type f -exec wc -c` 결과. 35개 파일, 합계 258,215 B. 모든 SKILL.md 는 전문을 다시 읽었고, references/templates/scripts 는 라우팅 링크·수치(`grep`) 확인과 첫 구간 열람으로 검증했다(전수 열람은 개별 분석 파일 담당).

### agent-experience

| 파일 | 바이트 |
|---|---|
| `agent-experience/SKILL.md` | 2,093 |

### dsh-archive-agent-notes

| 파일 | 바이트 |
|---|---|
| `dsh-archive-agent-notes/SKILL.md` | 6,721 |

### dsh-ci-test-reliability

| 파일 | 바이트 |
|---|---|
| `dsh-ci-test-reliability/SKILL.md` | 9,434 |
| `dsh-ci-test-reliability/references/ci-flake-diagnosis.md` | 5,346 |

### dsh-client-ui-ux

| 파일 | 바이트 |
|---|---|
| `dsh-client-ui-ux/SKILL.md` | 7,776 |

### dsh-code-review

| 파일 | 바이트 |
|---|---|
| `dsh-code-review/SKILL.md` | 9,410 |

### dsh-create-upgrade-guide

| 파일 | 바이트 |
|---|---|
| `dsh-create-upgrade-guide/SKILL.md` | 3,734 |

### dsh-doc

| 파일 | 바이트 |
|---|---|
| `dsh-doc/SKILL.md` | 18,418 |
| `dsh-doc/references/metadata-links-i18n.md` | 9,495 |
| `dsh-doc/references/review.md` | 6,060 |
| `dsh-doc/references/structure-hierarchy.md` | 6,276 |
| `dsh-doc/references/style.md` | 4,117 |
| `dsh-doc/references/website-sync.md` | 6,850 |
| `dsh-doc/templates/package-bundle.md` | 3,409 |
| `dsh-doc/templates/package-group.md` | 1,867 |
| `dsh-doc/templates/package-library.md` | 3,546 |
| `dsh-doc/templates/package-reference.md` | 3,860 |
| `dsh-doc/templates/persistence-change.md` | 3,940 |
| `dsh-doc/templates/persistence-format.md` | 2,412 |
| `dsh-doc/templates/persistence-release.md` | 3,123 |
| `dsh-doc/templates/upgrade-guide.md` | 909 |

### dsh-find-simplifications

| 파일 | 바이트 |
|---|---|
| `dsh-find-simplifications/SKILL.md` | 10,674 |
| `dsh-find-simplifications/references/historical-patterns.md` | 8,543 |

### dsh-merging-stacked-prs

| 파일 | 바이트 |
|---|---|
| `dsh-merging-stacked-prs/SKILL.md` | 7,839 |

### dsh-pre-push-checks

| 파일 | 바이트 |
|---|---|
| `dsh-pre-push-checks/SKILL.md` | 10,967 |

### dsh-prose-standard

| 파일 | 바이트 |
|---|---|
| `dsh-prose-standard/SKILL.md` | 9,621 |
| `dsh-prose-standard/references/examples.md` | 9,457 |

### dsh-speed-up-perf

| 파일 | 바이트 |
|---|---|
| `dsh-speed-up-perf/SKILL.md` | 12,174 |

### dsh-translate-docs

| 파일 | 바이트 |
|---|---|
| `dsh-translate-docs/SKILL.md` | 10,604 |

### dsh-trim-cot-leakage

| 파일 | 바이트 |
|---|---|
| `dsh-trim-cot-leakage/SKILL.md` | 7,679 |
| `dsh-trim-cot-leakage/references/examples.md` | 12,566 |
| `dsh-trim-cot-leakage/references/recall-batteries.md` | 5,041 |

### record-browser-gif

| 파일 | 바이트 |
|---|---|
| `record-browser-gif/SKILL.md` | 16,540 |
| `record-browser-gif/scripts/encode_gif.py` | 12,988 |
| `record-browser-gif/scripts/test_encode_gif.py` | 4,726 |

합계: 258,215 B (35개 파일). 인코더 기본값(`encode_gif.py`): `--fps` 기본 10, `--max-width` 기본 1200, `--colors` 기본 128, `DEFAULT_MAX_BYTES = 5 * 1024 * 1024`(`encode_gif.py:16`). 참고로 `gh --attach` 상한은 SKILL.md 상 "10 MB" 로, 인코더 기본 상한(5 MiB)과 다른 값이다(두 값의 관계에 대한 설명은 `원문에 명시 없음`).
