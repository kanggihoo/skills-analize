# archify 분석

> 분석 대상: `/Users/kkh/Desktop/skills-analize/skill-analysis/archify/` (설치본 `/.agents/skills/archify/`와 SKILL.md 바이트 동일 — `diff -q` 무출력)
> 원문 인용은 영어 그대로, 뒤에 필요 시 번역.

## 1. 개요

### 원본 경로 / 핵심 파일

| 파일 | 바이트 | 역할 |
|---|---|---|
| `SKILL.md` | 16,396 | 진입점. 프론트매터 + Fast authoring path + 불변식(invariants) 목록 |
| `references/authoring-contract.md` | 11,309 | 필드 enum, 간격 수식, 기하 수리 순서, 모드별 배치 |
| `references/delivery-contract.md` | 8,070 | validate/deliver/visual-check 3분리, 핸드오프 영수증 포맷 |
| `references/viewer-runtime.md` | 4,243 | 뷰어 기능(Share Card, 모션, 스토리, 익스포트) |
| `references/brand-marks.md` | 2,179 | 브랜드 마크 결정 경로 |
| `schemas/README.md` | 11,462 | 5개 JSON IR 스키마 정책, legend/locale/brand 계약 |
| `schemas/{architecture,workflow,sequence,dataflow,lifecycle,common}.schema.json` | 6,702 / 9,752 / 5,642 / 5,907 / 6,597 / 3,096 | 실제 검증 스키마 |
| `bin/archify.mjs` | 72,093 | CLI 전체 (render/compare/deliver/preview/validate/migrate/inspect/check/visual-check/guide/brands/examples/doctor/demo) |
| `bin/visual-check.mjs` | 33,390 | Chrome DevTools 파이프 기반 브라우저 증거 수집 |
| `bin/preview.mjs` | 23,722 | 루프백 라이브 프리뷰 서버 |
| `scripts/check-render-output.mjs` | 32,413 | 최종 아티팩트 체커(9개 검사 + composition) |
| `scripts/check-update.mjs` | 56,369 | 업데이트 알림 전용 체커 |
| `scripts/update-contract.mjs` | 6,750 | 릴리스/매니페스트 스키마 강제 |
| `renderers/*/render-*.mjs` | 45,546(arch) / 1,153+171,396(workflow) / 21,146(seq) / 21,194(dataflow) / 24,285(lifecycle) | 모드별 렌더러 |
| `renderers/shared/*` | 총 ~760KB (generated-validators 430,844, generated-brand-marks 163,612, geometry 57,175, i18n 48,260 등) | 검증기/기하/브랜드/로케일 공용 런타임 |
| `assets/template.html` | 678,398 | 뷰어 런타임이 들어간 HTML 셸 |
| `examples/*.json` (10개) + `examples/*.html` (5개, 각 ~715KB) | — | 필드 형태 참조 + 렌더 결과 샘플 |
| `test/*.mjs` (약 90개, 최대 `update-notifier.test.mjs` 123,824) | — | SKILL.md 문장까지 계약으로 검증 |
| `brand-marks/catalog.json` | 14,162 | 내장 브랜드 107개 |
| `recipes/scenarios.mjs` | 32,413 | `guide` 명령이 쓰는 시나리오 14개 |
| `delta/architecture-delta.mjs` | 72,328 | `compare` (아키텍처 base↔head 델타) |
| `migrations/workflow-v2.mjs` | 9,168 | workflow v1→v2 마이그레이션 |

### 성격 한 줄

**생성(construction) + 검증(verification) 결합형.** JSON IR을 저작하게 만들고(생성), 렌더 결과 SVG를 기계적으로 재검사해 통과 못 하면 산출물을 커밋하지 않는다(검증). 라우팅 요소(`guide`, Type router)도 있지만 부수적이다.

### 원문 자기 규정

> `SKILL.md:13` — "Create a self-contained, interactive HTML diagram from a small typed JSON specification. Static output is the default; enable motion only when the user asks for a demo or presentation."

---

## 2. 활성화 조건 (언제 켜지는가)

### frontmatter `description` 전문

> "Create polished, validated architecture, workflow, sequence, data-flow, and lifecycle/state diagrams as explorable standalone HTML with inline SVG, dark/light themes, optional trace motion, and PNG/JPEG/WebP/SVG/WebM export. Accept plain-language requirements or pasted Mermaid flowchart, sequenceDiagram, and stateDiagram input; inspect repository evidence when the diagram must reflect real code. Use when the user asks to visualize system architecture, infrastructure, cloud/security/network topology, technical workflows, API call sequences, request lifecycles, data pipelines, ETL/ELT, data lineage, state machines, or to convert/beautify Mermaid."

`test/skill-metadata.test.mjs:13-25`가 이 description을 계약으로 강제한다:

> "assert.ok(description.length <= 1024 …)" / "for (const trigger of ['architecture', 'workflow', 'sequence', 'data-flow', 'lifecycle', 'Mermaid'])" / "assert.match(description, /standalone HTML/i)" / "assert.match(description, /Use when/i)"

### 매칭되는 실제 사용자 발화 예시

1. "우리 서비스 아키텍처 다이어그램 좀 그려줘" → `architecture`
2. "이 결제 승인 프로세스를 워크플로우로 시각화해줘" → `workflow`
3. "로그인 API 호출 순서를 시퀀스 다이어그램으로" → `sequence`
4. "Kafka → Spark → S3 ETL 파이프라인 데이터 흐름도" → `dataflow`
5. "주문 상태 전이(state machine) 그려줘" → `lifecycle`
6. "이 Mermaid flowchart 좀 예쁘게 바꿔줘" → Mermaid 입력 경로
7. "VPC/보안그룹 포함한 클라우드 토폴로지 그려줘" → `architecture` + `deployment-ownership` 후보
8. "이 레포 실제 코드 기준으로 아키텍처 그려줘" → `--repo-root` 저장소 증거 경로

### 배제되는 발화 / 다른 스킬로 넘길 지점

- **원문에 명시 없음.** SKILL.md에는 "이건 다른 스킬로 넘겨라"는 문장이 하나도 없다. 형제 스킬 이름을 언급하지 않는다.
- 내부 라우팅만 존재한다: 5개 타입 라우터 표(`SKILL.md:57-63`)와 모호할 때의 위임 명령
  > `SKILL.md:65` — "When ambiguous, run `node bin/archify.mjs guide "<scenario>" --json`."
- 참조 문서 읽기 억제 규칙이 사실상의 라우팅이다:
  > `SKILL.md:17` — "Do not read the optional Viewer Runtime reference unless the user asks about those features."
  > `SKILL.md:46` — "Do not read `renderers/shared/geometry.mjs`, renderer source, validator source, tests, or benchmarks before the first candidate."

### 프론트매터 필드

```yaml
name: archify
license: MIT
metadata:
  version: "2.17"
  author: tt-a1i
  based_on: Cocoon-AI/architecture-diagram-generator (MIT, v1.0)
```

`allowed-tools` **없음**, `model` **없음**. 즉 도구 제한이 프론트매터 수준에서 걸려 있지 않다. (`package.json`의 버전은 `2.17.0-dev.1`, `skill-release.json`의 `channel`은 `"development"` — 프론트매터 `"2.17"`과 표기가 다르다.)

---

## 3. 적합 / 부적합

### 적합

- 다이어그램이 **산출물 그 자체**인 작업: 아키텍처 리뷰 문서, RFC/ADR 첨부, 온보딩 자료, 릴리스 노트용 이미지.
- 결과를 **여러 사람이 열어보는** 경우. 생성물이 의존성 없는 단일 HTML이고, 뷰어에 검색·포커스·경로 추적·PNG/SVG/WebM 익스포트가 이미 들어 있다(`SKILL.md:120`).
- **선 겹침/라벨 충돌을 눈으로 못 잡는** 상황. 체커가 교차·복도 공유·라벨 마스크 간격을 픽셀 단위로 잡아준다.
- Mermaid를 이미 쓰고 있고 품질을 올리고 싶은 경우 (`flowchart`→`workflow`/`architecture`, `sequenceDiagram`→`sequence`, `stateDiagram`→`lifecycle`).
- 실제 코드 기준 증명이 필요한 아키텍처: `meta.repository` + 컴포넌트별 `sources` + `--repo-root`로 Git이 커밋·블롭·라인을 증명해야만 통과.

### 부적합·과함

- **한 번 쓰고 버릴 스케치.** showcase 통과 요구(9/9, 0 errors, 0 warnings)와 4개 뷰포트 브라우저 증거까지 밟으면 왕복이 길다.
- **대화 안에서만 보고 끝낼 그림.** 산출물이 ~700KB HTML 파일이라 채팅 렌더링용이 아니다.
- **노드 12개 초과의 조밀한 시스템 맵.** 원문이 스스로 제한한다:
  > `SKILL.md:21` — "at most 12 primary nodes"
- **Chrome 없는 CI/헤드리스 환경**에서 완전한 증거를 요구하는 경우. `visual-check`는 exit 2 / `skipped`로 빠진다.
- **모바일 산출물.** `references/viewer-runtime.md:25` — "This is not a mobile product feature; narrow layouts get containment only."

### 형제 스킬 대신 이걸 고르는 판정 기준

산출물이 "설명용 그림"이 아니라 **파일로 남아 검증 영수증(SHA-256)까지 붙어야 하는 아티팩트**일 때 archify를 고른다. 그렇지 않으면 Mermaid 코드 블록이 더 싸다.

---

## 4. 전제 조건과 외부 의존성

### 실행 런타임

- **Node.js >= 18** (`package.json` `engines`). `bin/archify.mjs`는 `spawnSync(process.execPath, ...)`로 하위 렌더러를 실행한다.
- 실측: `node bin/archify.mjs doctor` → 15개 항목 전부 `[ok]`, "Archify is ready." (Node v22.23.1 환경).
- **npm install 불필요.**
  > `SKILL.md:126` — "No install is required inside the skill package."
  > `schemas/README.md:157-160` — "The generated `renderers/shared/generated-validators.mjs` is committed and shipped with the skill, so runtime validation has no npm or network dependency."
- `devDependencies`(ajv 8.17.1, parse5 7.3.0, saxes 6.0.0, simple-icons 16.28.0)는 **개발 시 생성기 전용**이지 런타임 의존이 아니다.

### CLI 도구

| 도구 | 언제 필요 | 없으면 |
|---|---|---|
| `node` (≥18) | 항상 | 전 기능 불가 → 손배치 폴백(`assets/template.html`) |
| Chrome/Chromium | `visual-check` | exit 2, `status: "skipped"`. `bin/visual-check.mjs:24` — `EXIT = { pass: 0, fail: 1, skipped: 2 }`. 경로는 `ARCHIFY_CHROME`로 지정 가능 |
| `git` | 아키텍처 `--repo-root` 저장소 증거만 | `repository-evidence/git-unavailable` 진단 |
| `docker`, `playwright`, `gh` | **불필요** | — |

### API 키 / 환경변수 / 네트워크

- API 키 **불필요**.
- 환경변수: `ARCHIFY_QUALITY_PROFILE`, `ARCHIFY_REPO_ROOT`, `ARCHIFY_DIAGNOSTIC_FORMAT`(CLI가 내부 설정), `ARCHIFY_CHROME`, `ARCHIFY_CHROME_NO_SANDBOX`, `ARCHIFY_UPDATE_CHECK_DISABLED=1`(업데이트 체크 끄기).
- **네트워크는 3군데에서만 발생하고 전부 옵션이다.**
  1. `scripts/check-update.mjs` — `https://tt-a1i.github.io/archify/skill-updates/archify/stable.json`. 타임아웃 `DEFAULT_TIMEOUT_MS = 1_000`(1초), 응답 상한 `MAX_RESPONSE_BYTES = 32 * 1_024`, 체크 TTL `CHECK_TTL_MS = 72 * 60 * 60 * 1_000`(72시간), 실패 시 재시도 지연 6시간/24시간.
  2. `brands capture <url>` — 사용자가 준 공식 URL의 아이콘 1회 캡처. 렌더/검증은 절대 네트워크를 타지 않는다.
     > `SKILL.md:84` — "Render and validate never perform an unpinned capture."
  3. 그 외 없음. 최종 아티팩트도 네트워크를 안 쓴다: `references/brand-marks.md:58` — "The final artifact never fetches a brand asset when opened."

### 리포지토리 전제

- 테스트 러너/CI/린터/타입 시스템 **요구 없음**.
- Git은 저장소 증거 기능에서만: `schemas/README.md:169-172` — "the renderer requires `--repo-root`: the local Git origin must match, and Git must prove the commit, blobs, and requested lines." 그리고 `meta.repository`는 **public GitHub URL + full commit SHA**여야 한다.
- 커밋 권한·브랜치 전략 **요구 없음**. 스킬은 git 쓰기를 하지 않는다.

### 비용 발생 지점

- 유료 API **없음**. CI 분 **없음**.
- 실질 비용은 **토큰과 왕복 횟수**다: validate를 "after every candidate edit"(`SKILL.md:22`) 돌리고, showcase 실패 시 반복 수리하며, deliver 후 visual-check까지 붙는다.
- 디스크: 산출 HTML 1개당 ~700KB(examples 실측 714,131~723,038 바이트). `visual-check`는 여기에 PNG 4장 + contact sheet HTML + JSON 영수증을 **아티팩트 옆에** 추가로 쓴다.

### 상태 파일 · 산출물 디렉터리

- `.claude/`, `plan.md`, `TODO` 같은 상태 파일은 **만들지 않음**.
- deliver: 출력 디렉터리 안에 **비공개 스테이징 디렉터리**를 만들고 `specification.snapshot.json` + 후보 HTML을 쓴 뒤, 성공 시 `fs.renameSync(candidatePath, outputPath)`로 원자 커밋하고 `finally`에서 스테이징을 지운다.
- visual-check 사이드카(아티팩트와 같은 디렉터리): `<base>.1440x900.light.png`, `<base>.1440x900.dark.png`, `<base>.2048x1320.light.png`, `<base>.2048x1320.dark.png`, `<base>.html`(contact sheet), JSON 영수증.
- 업데이트 캐시: macOS `~/Library/Caches/archify-skill`, Linux `$XDG_CACHE_HOME/archify-skill` 또는 `~/.cache/archify-skill`, Windows `%LOCALAPPDATA%\archify-skill`.

---

## 5. 워크플로우

원문은 "Fast authoring path"라는 이름으로 5단계를 번호로 강제한다(`SKILL.md:15-35`).

### 단계별 입력→행동→출력→통과 조건

| # | 입력 | 행동 | 출력 | 통과 조건 |
|---|---|---|---|---|
| 1 | 사용자 질문 | 5개 타입 중 선택 | 타입 결정 | 모호하면 `guide "<scenario>" --json` |
| 2 | 타입 | `schemas/<type>.schema.json` + `schemas/common.schema.json` + `examples/` 중 **매칭되는 1개**만 읽기 | 필드 형태 파악 | "Read only those files." |
| 3 | 스키마 지식 | **후보 JSON을 먼저 쓴다** | `candidate.json` | "the next tool action must write the candidate" |
| 4 | 후보 JSON | `validate` | 9개 검사 영수증 | **게이트** — 아래 참조 |
| 5 | 동결된 후보 | `deliver` | HTML + SHA-256 영수증 | **게이트** — exit 0 |
| 후 | 배달된 HTML | `visual-check` | PNG 4 + 영수증 | exit 0/1/2 |

### 게이트(탈락 가능) 단계

**게이트 A — 4단계 validate.** 원문:

> `SKILL.md:28` — "A receipt with only 4 artifact checks is basic validation, never showcase acceptance. **A showcase pass must report all 9 artifact checks with 0 composition errors and 0 warnings.**"

탈락 시 행동:

> `SKILL.md:35` — "If validation fails, change only the diagnosed `subject`, verify `evidence`, choose from `supportedFixes`, and rerun. Continue focused correction while the objective error count reaches a new minimum. **If two consecutive rounds do not improve that best count, stop and report the unresolved diagnostics truthfully.**"

수리 순서도 고정되어 있다(`references/authoring-contract.md:138-146`):

```
1. Fix missing/invalid meta.quality_profile and schema errors.
2. Fix node overlap or out-of-range placement.
3. Fix edge-through-node and endpoint-direction errors.
4. Fix crossings, ambiguous corridors, border runs, and route rhythm.
5. Fix label-to-node, label-to-label, then label-to-route clearance.
```

**게이트 B — 5단계 deliver.**

> `SKILL.md:35` — "A non-zero exit can never be described as success."
> `references/delivery-contract.md:11` — "only replaces the target after all artifact checks pass … Renderer, checker, receipt, or commit failure exits non-zero, removes private state, preserves the previous trusted artifact, and never invokes an opener."

탈락 시 **visual-check 금지**:

> `SKILL.md:35` — "A failed delivery preserves any previous output, so do not run `visual-check` on that path: it would inspect the stale last-good artifact, not the failed candidate."

**게이트 C — 지각적 시각 검토(사람/이미지 리더).** 자동 검사로 대체 불가:

> `references/delivery-contract.md:79` — "Automated validation and browser evidence cannot prove visual polish."

### 순서 강제 문구

- "Use this bounded path for ordinary generation." (`SKILL.md:17`)
- "**Artifact first**: the next tool action must write the candidate. Write the candidate before inspecting renderer internals. Do not plan exact coordinates in prose." (`SKILL.md:21`)
- "Validate **after every candidate edit and immediately before handoff**" (`SKILL.md:22`)
- "A passing final validation **freezes** the candidate: never edit it afterward." (`SKILL.md:28`)
- "Use `validate` during repair and `deliver` **once** for final acceptance." (`SKILL.md:98`)
- "Run `visual-check` **only after** `deliver` exits zero for the current candidate." (`references/delivery-contract.md:13`)

### 루프 구조

```
        ┌──────────────────────────────────────────┐
        │  후보 JSON 작성/수정                      │
        └───────────────┬──────────────────────────┘
                        ▼
              validate --quality showcase
                        │
        ┌───── 실패 ────┴──── 통과(9/9, 0E/0W) ─────┐
        ▼                                            ▼
  진단 1개만 수리                              후보 동결(편집 금지)
  (subject/evidence/                                 ▼
   supportedFixes)                          deliver --quality showcase
        │                                            │
        │ 오류 최소치가                     ┌── exit≠0 ─┴── exit 0 ──┐
        │ 2라운드 연속 갱신 안 되면          ▼                        ▼
        └──► 중단, 진단 그대로 보고     이전 아티팩트 보존      visual-check
                                        (visual-check 금지)         │
                                                          ┌─ 0 passed ─┼─ 1 failed ─┬─ 2 skipped ─┐
                                                          └───────► 지각적 시각 검토 ◄────────────┘
                                                                    correction_rounds ≤ 2
```

수렴 상한 2개가 명시되어 있다:

| 루프 | 상한 | 원문 |
|---|---|---|
| validate 수리 | 최소치 미갱신 2라운드 | `SKILL.md:35` |
| 시각 검토 후 수정 | `correction_rounds: 0|1|2` | `references/delivery-contract.md:91` — "never exceed a maximum of two focused correction rounds" |

### 사람 개입 지점

- **지각적 시각 검토**가 유일한 필수 사람(또는 이미지 판독 가능 리뷰어) 지점. `visual_review: passed | skipped (image reader unavailable) | failed` 중 하나를 정직하게 보고해야 한다.
- 승인 요청·질문 라운드는 **원문에 명시 없음**. 브랜드 URL 제공, `visual_preset` 선택, `subtitle` 추가, `engineering_profile` 활성화는 모두 "user explicitly requests/asks"를 조건으로 하지만, 먼저 물어보라는 지시는 아니다.
- 업데이트 알림은 **정보 전달일 뿐 허가 요청이 아니다**: `SKILL.md:44` — "The notice is information, not permission … silence is never consent."

---

## 6. 엔지니어링 규칙 분석

### 금지 규칙(anti-pattern)

| 원문 | 막으려는 실패 모드 |
|---|---|
| "Do not plan exact coordinates in prose." (`SKILL.md:21`) | 에이전트가 좌표를 말로 계산하며 토큰을 태우고 결국 틀리는 것 |
| "Do not add `via`, `channelX`, `channelY`, or `labelAt` before a diagnostic calls for one; apply at most one diagnosed geometry control per repair." (`SKILL.md:21`) | 진단 없이 수동 라우팅을 남발해 자동 라우터를 무력화 |
| "Do not read `renderers/shared/geometry.mjs`, renderer source, validator source, tests, or benchmarks before the first candidate." (`SKILL.md:46`) | 60KB급 구현부를 읽어 컨텍스트를 태우는 것 |
| "Read only those files." (`SKILL.md:20`) | 스키마 5개 + 예제 10개 전부 읽기 |
| "A non-zero exit can never be described as success." (`SKILL.md:35`) | 실패를 성공으로 보고 |
| "Do not claim success for a non-zero command or claim visual inspection you did not perform." (`SKILL.md:136`) | 하지 않은 시각 검사를 했다고 주장 |
| "Never counterfeit a pass with `overflow: hidden`, clipped content, an internal diagram scroller, stretched SVG height, or smaller typography." (`SKILL.md:80`) | 뷰포트 담김 측정을 CSS로 위조 |
| "deleting it is not a geometry repair" (라벨) (`SKILL.md:87`) | 간격 문제를 의미(라벨) 삭제로 해결 |
| "must not remove the engineering profile merely to pass validation" (`SKILL.md:88`) | 게이트를 끄는 방식의 통과 |
| "Never infer a brand from a vague role such as 'database'" (`SKILL.md:84`) | 근거 없는 브랜드 부착 |
| "Do not invent a URL or silently assign a visually similar company." (`references/brand-marks.md:47`) | 브랜드 날조 |
| "Never invent a subtitle that restates the title, nodes, or cards" (`SKILL.md:79`) | 의미 없는 부제 |
| "Never infer a transitive edge, verb, causality, or runtime behavior from proximity, kinds, or story order." (`references/viewer-runtime.md:21`) | 위치로 인과 추론 |
| "Never accept an edge crossing an unrelated opaque node…" (`SKILL.md:92`) | 읽을 수 없는 그림 |
| "Never start preview by default." (`SKILL.md:116`) | 무인 환경에서 서버 상주 |
| "Do not use it for CI, unattended agents, remote sharing, or mobile use." (`references/delivery-contract.md:75`) | 프리뷰 서버 오용 |
| "Never claim that the deterministic receipt includes visual review. It does not include browser evidence either." (`references/delivery-contract.md:25`) | 3종 증거 혼동 |

### 강제 규칙 — 수치 전부

**저작 상한**

| 항목 | 값 | 출처 |
|---|---|---|
| 주요 노드 수 | at most **12** primary nodes | `SKILL.md:21` |
| 아키텍처 권장 컴포넌트 | **6–12** primary components | `authoring-contract.md:152` |
| 가이드 뷰(chapters) | at most **five** | `SKILL.md:120`, `schemas/README.md:41` |
| workflow `col` | `0..5` | `SKILL.md`/`authoring-contract.md:158` |
| lifecycle 메인 컬럼 | `0..4` | `SKILL.md:53` |
| lifecycle 이벤트/터미널 컬럼 | `0..2`, 컬럼 `N` = 메인 `N+2` | `SKILL.md:53` |
| lifecycle 레인 수 | up to **4** lanes total | `renderers/lifecycle/README.md` |
| 시각 수정 라운드 | `correction_rounds: 0|1|2`, "never exceed a maximum of two" | `delivery-contract.md:91` |
| description 길이 | ≤ **1024** 문자/바이트 | `test/skill-metadata.test.mjs` |
| SKILL.md 길이 | ≤ **160** lines | `test/skill-metadata.test.mjs:41` |
| trace 애니메이션 step | `Math.min(12, …)`, 고정 6초 WebM 안에 종료 | `renderers/shared/cli.mjs` |

**기하 임계값(showcase 기준)**

| 항목 | 값 | 출처 |
|---|---|---|
| 라벨 마스크 폭 근사 | `6.5px × ASCII units + 13px`, CJK는 2 units | `authoring-contract.md:120-124` |
| 라벨 여유 | `clear gap > label mask width + 8px` | 동일 |
| 최소 세그먼트 | 모든 0 아닌 세그먼트 ≥ **8px** | `authoring-contract.md:109` |
| 최소 내부 세그먼트 | ≥ **16px** | 동일 |
| 근평행 포트 | **24px** 엔드포인트 스텁 + **16px** 외곽 브리지 | 동일 |
| 코너 거터 | **16px** | `authoring-contract.md:106-108` |
| 공유 축 병합 임계 | 축 오프셋 **< 16px** | `SKILL.md:91` |
| 무관 공선 겹침 | **≥ 8px**면 showcase 실패 | `authoring-contract.md:110` |
| 라벨-루트 간격 임계 | showcase **4px** / standard **2px** | `scripts/check-render-output.mjs` (`labelClearanceThreshold`) |
| Clean Flow 클리어런스 | **2px** | 각 렌더러 README |
| 최소 투영 노드 텍스트 | `MIN_PROJECTED_NODE_TEXT_PX = 6` | `renderers/shared/desktop-readability.mjs` |
| 권장 상한(경고) | `bendsPerRelationship: 2`, `stretch: 1.35`, `segmentPx: 16`, `microSegmentPx: 8` | `check-render-output.mjs` `suggestedLimits` |

**모드별 레이아웃 예산 (원문 표 그대로)**

- workflow v1: viewBox 기본 `[720, auto]`, auto height = `52 + lanes×104 + (lanes−1)×20 + 124`; 레인 x 40 / 폭 640 / 높이 104 / 간격 20, 첫 레인 top y 52; 컬럼 중심 x = **88, 220, 300, 430, 500, 625** (간격 132/80/130/70/125); 기본 노드 92×52(tag 있으면 높이 68); 같은 레인 노드 간격 ≥8px; 직선 세그먼트 ≥28px; legend y = lane bottom + 44.
- workflow v2: 인접 랭크 기준 중심 거리 **120px**; 같은 레인 클리어런스 ≥8px; 마주보는 직접 엣지 clear gap ≥ `max(28px, 라벨 마스크 + 8px)`; 직선 세그먼트 ≥28px / 스텁 ≥8px / 내부 턴 ≥16px.
- sequence: viewBox 기본 `[920, 760]`, 스키마 최소 `[480, 480]`; 참가자 박스 fixed 86×54 @ y 72, spread는 86~**190px**; 컬럼 중심 x = `62 + index×108`; 라이프라인 y 142 → height−65, 밴드 ≥120px; 메시지 y 범위 `[160, height−83]`; 메시지 간격 ≥28px; 화살표 수평 span ≥60px; legend y = height−54.
- dataflow: viewBox 기본 `[940, 720]`, 최소 `[360, 360]`; 스테이지 2–5, 중심 x = `100 + stage×215`, 밴드 168 폭; row top y = **128, 242, 356, 470, 584**; 기본 노드 112×58; 노드 간격 ≥10px; flow 길이 ≥34px; legend y = height−36.
- lifecycle: viewBox 기본 `[980, 660]`, 최소 `[420, 566]`; phase band top 126, 컬럼 x = **94, 248, 402, 556, 710**, 노드 118×62; event band top 278, 컬럼 x = 402/556/710, 노드 126×58; terminal band top 450, 노드 118×58; 상태 간격 ≥10px; 전이 길이 ≥32px; `cornerRadius` 기본 10.
- architecture grid 기본값: `origin [40,80], cols 4, gapX 30, gapY 40, cellW 130, cellH 64` (`renderers/architecture/grid.mjs`).

**뷰포트 담김 (deliver 이후)**

| 항목 | 값 | 출처 |
|---|---|---|
| 필수 측정 뷰포트 | **1440×900, 1600×1000, 1920×1080** | `SKILL.md:80` |
| 대형 디스플레이 추가 | **2048×1320** | 동일 |
| 통과 조건 | `document.documentElement.scrollWidth <= window.innerWidth` **and** `scrollHeight <= window.innerHeight` at every checked size | 동일 |
| 스크린샷 캡처 | 1440×900, 2048×1320 × light/dark = **4장** | `bin/visual-check.mjs` `CAPTURE_VIEWPORTS` × `THEMES` |
| Reading Depth | READ @ 100%, FULL @ **175%**, MAP < 100% | `references/viewer-runtime.md:8` |
| Share Card | **1200×630** PNG | `references/viewer-runtime.md:33` |

**업데이트 체커 수치** (`scripts/check-update.mjs`)

`CHECK_TTL_MS = 72h`, `FIRST_FAILURE_DELAY_MS = 6h`, `LATER_FAILURE_DELAY_MS = 24h`, `DEFAULT_TIMEOUT_MS = 1_000`, `MAX_RESPONSE_BYTES = 32KB`, `MAX_LOCAL_RELEASE_BYTES = 4KB`, `MAX_CACHE_STATE_BYTES = 64KB`, `LOCK_STALE_MS = 30_000`, `ACK_LOCK_WAIT_MS = 1_200`, summary 길이 `1..160`, `severity ∈ {normal, security}`.

**브랜드**: 내장 **107**개 (`brand-marks/README.md`), Simple Icons **16.28.0** 기반, 캡처 브랜드는 `sha256` 64자리 digest 핀 필수.

### 검증 방식 — 무엇을 근거로 "됐다"고 하는가

**3중 분리가 이 스킬의 핵심 설계다.**

> `references/delivery-contract.md:19-25` — "The delivery interface exposes three separate claims: 1. `deliver` proves deterministic artifact checks and byte identity. 2. `visual-check` collects automated browser evidence from the exact artifact. 3. Perceptual visual review records a human or image-capable reviewer's judgment. **Passing one claim never implies either of the others.**"

| 근거 | 종류 | 실제 강도 |
|---|---|---|
| `validate` 9개 검사 | **기계 검증** | 실측 확인. `single_svg, finite_svg, orthogonal_arrows, label_route_clearance, relationship_crossings, relationship_corridors, container_border_runs, route_rhythm, legend_clearance` |
| composition `errors`/`warnings` | 기계 검증 | 실측: `web-app.architecture.json` → "9 artifact checks; composition showcase: 0 errors, 0 warnings" |
| `deliver` SHA-256 + byte count | **암호학적 동일성** | 사양/아티팩트 양쪽 해시 영수증 |
| `visual-check` | **브라우저 실측** | 4뷰포트 담김 + PNG 4장, 아티팩트 SHA-256 바인딩 |
| 지각적 시각 검토 | **자기 진술** | 원문이 자기 진술임을 인정하고, 대신 거짓말 금지를 명문화 |

즉 **테스트 통과·커버리지 개념은 없고**, 검증 대상은 코드가 아니라 **렌더 결과 SVG 기하**다. 마지막 한 칸(지각적 폴리시)만 자기 진술이며, 그것도 `visual_review` 3값 중 하나로 정직하게 라벨링하도록 강제한다.

**중요한 구멍:** `validate`의 exit code는 `ok = checks.every(ok) && composition.status !== 'fail'`로 결정된다. 즉 **warnings > 0이어도 exit 0**이다. "0 warnings"는 CLI가 아니라 **에이전트가 영수증을 읽고 스스로 지켜야 하는 규칙**이다.

### 도구 사용 규칙

- **써야 하는 것**: `node bin/archify.mjs {guide, brands, brands capture, validate, deliver, visual-check, preview, doctor, demo, migrate, compare, inspect, check, examples, render}`.
- **읽으면 안 되는 것**: 첫 후보 전 `renderers/shared/geometry.mjs`, 렌더러/검증기 소스, 테스트, 벤치마크 (`SKILL.md:46`). 예외: "Inspect implementation only for an unsupported internal diagnostic or **after two focused repairs fail**."
- **조건부로만 읽을 것**: `references/viewer-runtime.md`(사용자가 뷰어 기능을 물을 때만), `references/authoring-contract.md`(enum/간격/수리 규칙이 필요할 때만), `references/brand-marks.md`(사용자 제공 URL이 있는 미지 브랜드일 때만).
- **금지 도구는 프론트매터에 없음** — `allowed-tools` 미지정.
- `--layout-json`은 architecture/workflow 전용, `--repo-root`는 architecture 전용(나머지 4개 타입은 거부).

### 컨텍스트·토큰 규율

명시적이고 구체적이다.

- 파일 읽기 범위 하드 제한: 스키마 1개 + `common.schema.json` + 예제 1개 (`SKILL.md:20`).
- 3단 점진 참조 구조: SKILL.md(진입) → references/ 3개(조건부) → 렌더러 소스(최후).
- 진단 소비 규율: "Consume `diagnostics[]` by stable `code`, exact `subject`, measured `evidence`, and `supportedFixes`." (`authoring-contract.md:146`) — 전체 로그가 아니라 구조화 필드만 읽으라는 뜻.
- workflow 기하 진단 시 `--layout-json`의 "stable compiler receipt"만 보고 "solver internals are not authoring controls" (`SKILL.md:28`).
- **서브에이전트 위임 지시는 원문에 명시 없음.**
- 요약/압축 지시도 **원문에 명시 없음** (읽기 범위 제한으로 대체).

### 모호어의 조작적 정의

| 모호어 | 환산 규칙 | 출처 |
|---|---|---|
| **showcase acceptance** | 9개 아티팩트 검사 전부 + composition 0 errors + 0 warnings | `SKILL.md:28` |
| **done / final** | validate 통과로 후보 동결 → deliver exit 0 → 3종 증거 분리 보고 | `SKILL.md:28,35`, `delivery-contract.md:95-108` |
| **polished** | `meta.quality_profile: "showcase"` = 교차/복도/리듬/라벨 게이트가 warning이 아니라 error로 승격 | 각 렌더러 README |
| **spacing** | "clear gap, not center distance" — "A 200px center distance between 165px-wide nodes leaves only 35px of clear gap." | `authoring-contract.md:116` |
| **first-screen artifact** | 4개 뷰포트에서 `scrollWidth <= innerWidth && scrollHeight <= innerHeight` | `SKILL.md:80` |
| **truthful** | 3종 증거를 서로 대체하지 않고 각각 라벨링 | `delivery-contract.md:19-25` |
| **visual review passed** | "only after inspecting the rendered artifact" | `delivery-contract.md:87` |
| **simple / clean** | **환산 규칙 없음.** "One obvious main path", "at most 12 primary nodes", "Remove low-value edges" 정도의 서술만 존재 |
| **production-grade** | **원문에 이 표현 없음** (컬렉션 자기 규정 문구일 뿐 SKILL.md는 쓰지 않음) |

---

## 7. 산출물

### 최종 결과물의 형태

1. **후보 사양** `<name>.<type>.json` — 타입별 JSON IR. `additionalProperties: false`가 모든 레벨에 걸려 있어 미지 필드는 거부된다.
2. **아티팩트** `<output>.html` — 의존성 없는 단일 HTML + 인라인 SVG. 예제 실측 714KB~723KB. 테마 전환, pan/zoom, 검색, 포커스, 관계 추적, 시맨틱 뷰, 프레젠테이션, 익스포트가 이미 포함(`SKILL.md:120`).
3. **JSON 영수증** (deliver `--json`): `specification.{sha256,bytes}`, `artifact.{sha256,bytes}`, `validation.{checksPassed,checkCount,compositionProfile,compositionStatus,errors,warnings}`, 조건부 `evidence.{verified,repository,revision,references}`, `open.status`.
4. **visual-check 사이드카**: PNG 4장 + contact sheet HTML + JSON 영수증 (`evidenceKind: "automated-browser"`, `visualReview: "pending"` 고정).
5. **뷰어 익스포트(독자용)**: PNG/JPEG/WebP/dual-theme SVG/WebM, Share Card 1200×630, Route/Reach Share Card.

### 출력 포맷 강제 템플릿

`references/delivery-contract.md:99-108` 핸드오프 영수증:

```text
diagram_type: architecture|workflow|sequence|dataflow|lifecycle
output: /absolute/path/to/file.html
specification_sha256: <receipt value>
artifact_sha256: <receipt value>
validation: 9/9 showcase, 0 errors, 0 warnings
browser_evidence: passed|failed|skipped
visual_review: passed|skipped (image reader unavailable)|failed
correction_rounds: 0|1|2
```

`SKILL.md:136`도 같은 항목을 요구한다: "Return the checked HTML path, diagram type, validation summary, specification/artifact receipt, browser-evidence status, and truthful visual-review status."

### 커밋·PR·브랜치 조작

**하지 않는다.** git write 명령이 없다. git은 `--repo-root` 저장소 증거에서 **읽기 전용**(`spawnSync('git', ['-C', repoRoot, ...])`)으로만 쓰인다.

### 파괴적 동작

| 동작 | 범위 | 방어 |
|---|---|---|
| 출력 HTML 덮어쓰기 | `deliver`/`render`/`preview`의 대상 파일 | 검증 통과 후 `renameSync`로 원자 교체. 실패 시 이전 아티팩트 보존 |
| 스테이징 디렉터리 삭제 | 자기가 만든 임시 디렉터리 | `finally`에서 `rmSync` |
| 사이드카 삭제 | visual-check 실패/스킵 시 stale PNG·contact sheet | "remove stale image/contact-sheet sidecars rather than presenting prior evidence as current" |
| 경로 안전장치 | `renderers/shared/output-path.mjs` | `meta.output`은 상대경로 + `.html` + CWD 안쪽 강제, 입력 파일 덮어쓰기 금지, 심볼릭 링크 사이클(`MAX_SYMLINK_DEPTH = 64`) 거부 |
| force push / 마이그레이션 / 파일 대량 삭제 | **없음** |
| `migrate workflow` | 새 파일 생성 | "The command never overwrites the source by default." |
| `--open` | OS opener 1회, 5초 상한 | 실패해도 배달 무효화 안 함 |
| `preview` | 루프백 `127.0.0.1`, 포트 0(임의 할당) | "Stop it with Ctrl-C before handoff" |

---

## 8. 주의점 / 한계 (여기서만 평가)

### 오작동·과잉작동 시나리오

1. **"간단한 그림 하나"에 전체 게이트가 붙는다.** 사용자가 "3개 박스짜리 흐름도"를 원해도 스킬은 후보 JSON → validate showcase → deliver → visual-check → 지각 검토 순서를 밟는다. 결과물은 700KB HTML. 채팅에 붙여넣을 Mermaid 3줄이 필요한 상황이면 명백한 과잉이다. SKILL.md에는 "이 정도면 그냥 Mermaid 쓰라"는 탈출구가 없다.

2. **`warnings`가 CLI를 통과한다.** `validate`는 `composition.status !== 'fail'`이면 exit 0이므로 warnings가 남아 있어도 성공으로 보인다. 에이전트가 `--json` 영수증의 `composition.summary.warnings`를 실제로 읽지 않으면 "9/9 showcase, 0 errors, 0 warnings"를 **확인 없이** 보고하게 된다. SKILL.md의 "0 warnings" 요구는 도구가 아니라 모델 준수에 걸려 있다.

3. **"only 4 artifact checks" 문장이 현재 패키지와 맞지 않는다.** 실측 결과 단일 SVG 문서에서는 항상 9개가 기록된다(`scripts/check-render-output.mjs`의 `addCheck` 호출 9개, `assets/template.html`·`examples/web-app.architecture.json` 모두 9). 4개 영수증은 이 버전에서 재현되지 않는다. 즉 `SKILL.md:28`의 "4 checks = basic validation" 판별 기준은 **작동하지 않는 안전장치**다. 대신 유효한 판별은 `composition.profile == showcase` 여부다.

4. **`--quality` 없이 `meta.quality_profile`도 없으면 게이트가 advisory로 떨어진다.** `renderers/shared/cli.mjs:155-158`에서 둘 다 없으면 SVG에 `data-quality-gates="advisory"`가 붙고, 체커의 `container_border_runs`가 강제되지 않는다(`!qualityGatesEnforced || …`). 사용자가 `--quality showcase`를 빼고 돌리면 조용히 느슨해진다.

5. **`meta.quality_profile` 오타를 게이트가 못 잡을 수 있다.** 스키마는 `additionalProperties: false`라 오타 키는 거부되지만, `quality_profile` **누락**은 valid다. 그래서 원문이 별도로 못을 박아 뒀다: `SKILL.md:28` — "If the candidate omits or misspells the exact `meta.quality_profile` field, fix it before geometry." 이것도 모델 준수 항목이다.

6. **visual-check 사이드카가 산출 디렉터리를 오염시킨다.** PNG 4장 + HTML + JSON이 아티팩트 옆에 생긴다. 사용자가 `docs/` 같은 커밋 대상 디렉터리를 출력 경로로 주면 예상치 못한 파일 6개가 함께 생긴다. SKILL.md는 이 부작용을 사용자에게 알리라는 지시가 없다.

7. **업데이트 알림이 무관한 대화에 끼어든다.** 첫 후보가 생긴 직후 체커를 돌리고(`SKILL.md:39`), `update_available`이면 "one compact notice"를 사용자 대화에 출력한다. 다이어그램만 원한 사용자에게는 노이즈다. 다만 정직성 규율은 잘 잡혀 있다(원격 summary 인용/번역 금지, 고정 로컬 문장만 사용, 설치본 불변 명시). `ARCHIFY_UPDATE_CHECK_DISABLED=1`로 끌 수 있으나 SKILL.md는 이 변수를 언급하지 않는다.

8. **12노드 상한과 현실 시스템의 충돌.** 실제 마이크로서비스 토폴로지는 12개를 쉽게 넘는다. 원문은 `standard` 프로파일로 "dense map"을 허용하지만("unless the user explicitly requests a dense `standard` map"), standard는 동시에 교차/복도/리듬 게이트를 warning으로 강등시킨다. **조밀함과 엄격함을 동시에 얻을 수 없는 구조**다.

### 다른 스킬·기존 CLAUDE.md 규칙과 충돌 가능 지점

- **"최소 diff / 최소 코드" 계열 규칙과 충돌.** 이 스킬은 700KB 산출물과 다단계 검증 루프를 요구한다. ponytail류 "가장 게으른 해법" 규칙 아래에서는 "Mermaid 블록으로 끝내라"가 정답이 되는 상황에서도 archify가 트리거될 수 있다.
- **"파일을 함부로 만들지 마라" 계열 규칙과 충돌.** deliver는 HTML 1개, visual-check는 사이드카 6개를 만든다.
- **"항상 테스트를 돌려라" 계열과 어긋남.** 이 패키지의 `npm test`는 `../scripts/run-tests.mjs`, `../scripts/check-release-identity.mjs`, `../benchmarks/…`를 참조하는데 **설치본에 그 상위 디렉터리가 없다**(실측: `../scripts`, `../benchmarks` 둘 다 존재하지 않음). 즉 설치된 스킬에서 `npm test`는 실행 불가다. 다행히 SKILL.md는 테스트 실행을 지시하지 않는다.
- **문서 산출물 스킬과의 중복.** 다이어그램을 Markdown 문서에 넣고 싶을 때, archify 산출물은 독립 HTML이라 문서에 임베드하려면 별도 익스포트(PNG/SVG)를 거쳐야 한다. SKILL.md에는 "문서에 넣을 거면 이렇게" 하는 안내가 없다.
- **다른 스킬로의 라우팅 규칙이 전혀 없어** 형제 스킬과의 경계는 사용자/오케스트레이터가 판단해야 한다.

### 검증 공백 (원문이 확인하지 않고 넘어가는 것)

1. **의미의 진실성.** 기하는 픽셀 단위로 검사하지만 "이 화살표가 실제 시스템에서 존재하는가"는 검사하지 않는다. 원문도 인정한다: `renderers/workflow/README.md:175` — "Layout validation cannot infer domain truth from labels or cards." 보완책인 `semanticChecks`(allowedRoots/allowedTerminals/requiredEdges/requiredPaths)는 **workflow 전용이고 옵션**이다. 나머지 4개 모드에는 대응물이 없다.
2. **`engineering_profile`의 한계를 스스로 명시.** `schemas/README.md:192-194` — "It does not discover infrastructure, infer owners, or prove that a diagram matches a live environment."
3. **저장소 증거의 인과성.** `authoring-contract.md:186` — "Never infer runtime causality from file proximity or naming alone." Git은 파일/라인 존재만 증명하지, 그 컴포넌트가 실제로 저 컴포넌트를 호출하는지는 증명하지 않는다.
4. **지각적 폴리시.** 자기 진술. 이미지 리더가 없으면 `skipped`로 남고, 그 상태로도 딜리버리는 완료된다.
5. **접근성.** SVG에 `role="img"`, `aria-labelledby`, `<title>`/`<desc>`가 붙지만, 색 대비·키보드 순회 완결성에 대한 기계 검사는 없다.
6. **`meta.locale`가 en/zh-CN뿐.** 한국어로 작업하면 뷰어 UI와 `<html lang>`이 영어로 남고, 원문은 그 사실을 **사용자에게 명시적으로 알리라고** 요구한다(`SKILL.md:82`). 이 고지를 빠뜨리기 쉽다.

### 유지보수 리스크

- **하드코딩된 원격 엔드포인트**: `scripts/update-contract.mjs:1-3`에 `SKILL_ID`, `EXPECTED_REPOSITORY = 'https://github.com/tt-a1i/archify'`, `DEFAULT_MANIFEST_URL = 'https://tt-a1i.github.io/…/stable.json'`가 상수로 박혀 있고, 릴리스 노트 URL도 `https://github.com/tt-a1i/archify/releases/tag/v${version}` 정확 일치만 허용한다. 저장소가 이동하면 조용히 `silent`로 떨어진다(체커 설계상 실패해도 조용하므로 실제로는 안전한 실패).
- **버전 표기 불일치**: 프론트매터 `version: "2.17"` vs `package.json` `2.17.0-dev.1` vs `skill-release.json` `channel: "development"`. 개발 채널 버전이 설치본으로 배포돼 있다.
- **외부 도구 버전 고정**: Simple Icons `16.28.0`(브랜드 벡터 생성 기준), ajv 8.17.1, parse5 7.3.0, saxes 6.0.0, `overrides: fast-uri 3.1.5`. 생성물(`generated-brand-marks.mjs` 163KB, `generated-validators.mjs` 430KB)이 커밋되어 있어 런타임엔 영향 없으나, 갱신 시 재생성 필요.
- **Chrome 경로 의존**: `bin/visual-check.mjs`가 플랫폼별 고정 경로와 `google-chrome/chromium` 명령을 탐색한다. Chrome 메이저 업데이트로 DevTools 파이프 프로토콜이 바뀌면 브라우저 증거가 통째로 깨진다(다만 `skipped`가 아닌 `failed`로 떨어지도록 원문이 명시).
- **`assets/template.html` 678KB 단일 파일**이 뷰어 전체를 담고 있다. 손으로 수정하기 어렵고, 손배치 폴백 경로는 실질적으로 사람이 쓰기 힘들다.
- **테스트 스위트가 설치본에서 실행 불가**(위 참조). 스킬을 fork해 수정하면 회귀를 잡을 수단이 없다.
- **SKILL.md 문장 자체가 테스트 계약**이라 (`test/skill-metadata.test.mjs`, `test/ordinary-model-floor.test.mjs`) 문구를 로컬에서 손보면 상위 저장소 테스트와 어긋난다.

### 한 줄 판정

**조건부 도입.** — 근거: 검증 설계가 이 카테고리에서 드물게 정직하다(deliver=결정적 해시 / visual-check=브라우저 실측 / 지각 검토=사람, 셋을 서로 대체 금지로 못 박음). 다만 "그림 하나 그려줘"에도 전체 게이트가 붙고 산출물이 700KB HTML + 사이드카 6개이므로, **문서에 남길 다이어그램**에만 켜고 일회성 스케치는 Mermaid로 빠지는 경계 규칙을 프로젝트 CLAUDE.md에 별도로 세워야 한다.

---

## 부록 A. 읽은 파일 목록

**전문 정독** (라인 단위)

| 경로 | 바이트 |
|---|---|
| `SKILL.md` | 16,396 |
| `references/authoring-contract.md` | 11,309 |
| `references/delivery-contract.md` | 8,070 |
| `references/viewer-runtime.md` | 4,243 |
| `references/brand-marks.md` | 2,179 |
| `schemas/README.md` | 11,462 |
| `renderers/workflow/README.md` | 10,386 |
| `renderers/sequence/README.md` | 4,828 |
| `renderers/dataflow/README.md` | 4,202 |
| `renderers/lifecycle/README.md` | 5,197 |
| `brand-marks/README.md` | 1,449 |
| `scripts/update-contract.mjs` | 6,750 |
| `renderers/shared/desktop-readability.mjs` | 1,089 |
| `renderers/architecture/grid.mjs` | 2,071 |
| `package.json` | 1,478 |
| `skill-release.json` | 272 |

**구조 조사** (해당 섹션 정독 + 상수/분기 전수 grep, 전 바이트 라인 정독은 아님)

| 경로 | 바이트 | 확인한 것 |
|---|---|---|
| `bin/archify.mjs` | 72,093 | usage 전문, deliver/validate/doctor/demo/brands/check/visual-check 본문, 영수증 필드, 종료 코드 |
| `scripts/check-render-output.mjs` | 32,413 | `addCheck` 9개 전부, `suggestedLimits`, showcase/standard 분기, 최종 `ok` 판정식 |
| `scripts/check-update.mjs` | 56,369 | 상수 전체, `notification()`, `eventKey` 형식, CLI 진입, 캐시 디렉터리 |
| `bin/visual-check.mjs` | 33,390 | 뷰포트/테마/종료코드 상수, 사이드카 경로, Chrome 탐색 |
| `bin/preview.mjs` | 23,722 | 루프백 호스트/포트 |
| `renderers/shared/cli.mjs` | 10,188 | `svgRootAttrs` quality/advisory 분기, animate step 상한 |
| `renderers/shared/geometry.mjs` | 57,175 | `qualityProfileForGate`, 라우트 정규화 |
| `renderers/shared/output-path.mjs` | 10,618 | 경로 안전 규칙 6종, `MAX_SYMLINK_DEPTH` |
| `renderers/shared/engineering-profiles.mjs` | 6,936 | `deployment-ownership` 진단 규칙 |
| `renderers/shared/repository-evidence.mjs` | 11,445 | git 호출 형태, GitHub URL 패턴, 경로 이스케이프 방어 |
| `schemas/architecture.schema.json` | 6,702 | `meta` 프로퍼티 전체, required |
| `test/skill-metadata.test.mjs` | 4,862 | SKILL.md 계약 테스트 5종 |
| `test/ordinary-model-floor.test.mjs` | 41,774 | "4 artifact checks" 문장 계약 위치 |
| `recipes/scenarios.mjs` | 32,413 | 시나리오 14개 존재 확인 |

**미정독** (분석 결론에 인용하지 않음): `assets/template.html`(678KB), `renderers/shared/generated-validators.mjs`(430KB), `renderers/shared/generated-brand-marks.mjs`(163KB), `renderers/workflow/workflow-compiler.mjs`(171KB), `delta/architecture-delta.mjs`(72KB), `renderers/{architecture,sequence,dataflow,lifecycle}/render-*.mjs`, `test/` 나머지 약 85개 파일(합계 약 1.4MB), `examples/*.html`(5개 × ~715KB), `examples/*.json` 10개, `schemas/{workflow,sequence,dataflow,lifecycle,common}.schema.json`, `migrations/workflow-v2.mjs`, `scripts/{generate-validators,generate-brand-marks,render-examples}.mjs`, `brand-marks/catalog.json`, `THIRD_PARTY_NOTICES.md`, `LICENSE`, `package-lock.json`.

> 하드 룰 1(전수 조사)에 대한 정직한 고지: 이 패키지는 약 4.5MB이고 그중 3.5MB 이상이 생성물·테스트·렌더된 예제 HTML이다. 위 "미정독" 항목은 읽지 않았으며, 따라서 본 분석의 어떤 주장도 그 파일들을 근거로 삼지 않았다.

## 부록 B. 실제 실행으로 확인한 사실

```
$ node bin/archify.mjs doctor
→ 15개 항목 전부 [ok], "Archify is ready." (exit 0, Node v22.23.1)

$ node bin/archify.mjs validate architecture examples/web-app.architecture.json --quality showcase
→ ok architecture …/web-app.architecture.json
  (9 artifact checks; composition showcase: 0 errors, 0 warnings)  exit 0

$ node scripts/check-render-output.mjs assets/template.html
→ ok true, checks 9:
  single_svg, finite_svg, orthogonal_arrows, label_route_clearance,
  relationship_crossings, relationship_corridors, container_border_runs,
  route_rhythm, legend_clearance

$ ls ../scripts ../benchmarks
→ 둘 다 존재하지 않음 (package.json의 test 스크립트는 설치본에서 실행 불가)

$ diff -q .agents/skills/archify/SKILL.md skill-analysis/archify/SKILL.md
→ 차이 없음
```
