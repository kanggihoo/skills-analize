# dsh-doc 분석
## 1. 개요
- 원본 경로: `/Users/kkh/Desktop/skills-analize/deepseek-harness/dsh-doc/`
- 컬렉션: deepseek-harness
- 읽은 파일 전수 (14개, 합계 1026줄):
| 파일 | 바이트 | 줄 | 역할 |
|---|---|---|---|
| `SKILL.md` | 18418 | 132 | 핵심. 워크플로우, 팩트체크 절차, kind 체계, 보이스 규칙, 품질 기준, 감사, 예산, 웹사이트, 검증 |
| `references/metadata-links-i18n.md` | 9495 | 78 | YAML 메타데이터, kind 도출 순서, description 품질, 링크 규칙, 이중언어 줄 정렬, sidecar |
| `references/review.md` | 6060 | 67 | 신규 독자 테스트, 증거 검토, 패키지 README 리뷰 항목, 레퍼런스 예시, 검증 명령 |
| `references/structure-hierarchy.md` | 6276 | 87 | 페이지 순서, 섹션 진행, docs 트리, 작은 규칙 파일, Further Exploration, Dev Note |
| `references/style.md` | 4117 | 49 | 짧은 Summary, 통제된 기술 영어, `-----` 구분선, `<details>` 접기, 강조 규율 |
| `references/website-sync.md` | 6850 | 95 | 웹사이트 매니페스트, DocsPage 필드, 링크 투영 규칙, 프리뷰, 배포 분리 |
| `templates/package-group.md` | 1867 | 59 | 그룹 지도 README 템플릿 |
| `templates/package-reference.md` | 3860 | 103 | Cordis 플러그인/서비스 패키지 README 템플릿 |
| `templates/package-library.md` | 3546 | 96 | 플러그인 표면이 없는 라이브러리 README 템플릿 |
| `templates/package-bundle.md` | 3409 | 103 | `dsh.bundle.patch` 선언 패키지 README 템플릿 |
| `templates/persistence-change.md` | 3940 | 73 | 영속 타입 변경 승인 기록 템플릿 |
| `templates/persistence-release.md` | 3123 | 30 | 태그별 영속 타입 비교 기록 템플릿 |
| `templates/persistence-format.md` | 2412 | 25 | 과거 Session 포맷 체크포인트 템플릿 |
| `templates/upgrade-guide.md` | 909 | 29 | 업그레이드 가이드 템플릿 |

- `scripts/`, `assets/` 디렉터리: 원문에 없음 (디렉터리 목록에 `references`, `templates`, `SKILL.md`만 존재).
- 성격 한 줄: 생성(construction) 중심이며 감사(audit)와 검증(verification) 절차를 함께 가진다. 문서 작성, 구조 재편, 코퍼스 감사, 웹사이트 매핑을 한 스킬이 맡는다.
- 원문 자기 규정:
  > The DeepSeek Harness documentation standard: make every page searchable, newcomer-readable, and exact enough for agents and maintainers, and keep the documentation website a tested projection of repository Markdown. (`SKILL.md:10`)
- 소유권 원칙:
  > Preserve one owner per fact: source, tests, generated catalogs, package READMEs, guides, Agent Notes, and scratch each keep their own kind of truth. (`SKILL.md:10`)
- 레퍼런스 예시로 지정된 문서: `session-persistence-jsonl` README 쌍 (`SKILL.md:10`, `SKILL.md:116`).
- 이 스킬 자체의 Dev Note 섹션은 `None.` (`SKILL.md:132`). 모든 references도 마찬가지로 `None.`

## 2. 활성화 조건 (언제 켜지는가)
### frontmatter description 전문
> Create, restructure, review, audit, or migrate DeepSeek Harness Markdown documentation, package READMEs, and the documentation website using audience-first hierarchy, kind-mapped YAML metadata, bilingual line alignment, summary/contents navigation, progressive user-to-developer detail, executed-operation fact-checking, and repository validation. Use for new or revised DSH docs, docs-tree organization, documentation-quality audits and budgets, website page publishing, and bilingual documentation structure changes. (`SKILL.md:4`)

### 매칭되는 사용자 발화 예시 (description 키워드에서 추출)
1. "새 패키지 `dsh-foo`의 README를 써줘" (package READMEs, Create)
2. "docs/ 트리를 learn / user / developer로 재구성해줘" (docs-tree organization, restructure)
3. "문서 품질 감사해줘, 슬롭 체크리스트 돌려줘" (documentation-quality audits)
4. "verify-doc-budgets가 빨갛게 나와, 문서 단어 예산 조정해줘" (budgets)
5. "이 가이드를 website에 publish하고 manifest 항목 추가해줘" (website page publishing)
6. "README.zh.md를 영어판과 줄 단위로 맞춰줘" (bilingual documentation structure changes)
7. "persistence-change 기록 문서 작성" (kind 목록 `SKILL.md:57`)
8. "이 README의 명령어가 실제로 동작하는지 검증하며 고쳐줘" (executed-operation fact-checking)
원문에 명시된 트리거 문구 목록은 description 한 줄뿐이다. 위 발화는 description의 동사와 명사에서 뽑은 것이다.

### 의도적 배제 / 라우팅 규칙
| 상황 | 넘길 스킬 | 근거 |
|---|---|---|
| 문장 단위 계약 커버리지, 편집 판단 | `dsh-prose-standard` | `SKILL.md:115` "Use [dsh-prose-standard] for sentence-level contract coverage and editorial judgment." |
| upgrade-guide 의 범위, 배치, 유지, 길이 규칙 | `dsh-create-upgrade-guide` | `templates/upgrade-guide.md:3` "owns scope, placement, maintenance, and length rules"; `SKILL.md:60` |
| 추론 트랜스크립트 유출 제거 | `dsh-trim-cot-leakage` | `SKILL.md:93` |
| 산문을 줄이면 약속된 동작이 바뀌는 경우 | `dsh-find-simplifications` | `SKILL.md:93` "propose the behavior change first (follow dsh-find-simplifications)" |
| 푸시 전 점검 | `dsh-pre-push-checks` | `references/website-sync.md:87` |
| 확장 번역 스킬 | 자동 호출 금지 | `references/website-sync.md:19` "never invoke the extended translation skill automatically" |
| 웹사이트 배포 (Pages 권한, 워크플로우, 도메인) | 사용자가 명시 요청하고 호스팅 정책을 확인한 경우에만 | `references/website-sync.md:91` |
| `.agents/notes/archived/` | 감사와 수정 대상에서 제외 | `SKILL.md:89` "archived notes are frozen history" |

### frontmatter 필드
- `name: dsh-doc`, `description` 두 개뿐.
- `allowed-tools`, `model`, `metadata`: 없음.

## 3. 적합 / 부적합
### 적합
- DeepSeek Harness(DSH) 리포지토리 안의 문서 작업. 원문이 `pnpm run test:docs`, `doc-sync`, `docs/AGENTS.md`, `website/docs.ts` 등 이 리포지토리 고유 자산을 전제한다.
- 영어와 중국어 쌍(`foo.md`, `foo.zh.md`, `foo.i18n.yaml`)을 유지하는 문서 (`SKILL.md:102`).
- 패키지 README를 4가지 kind(group, reference, library, bundle) 중 하나로 분류해야 하는 모노레포 (`SKILL.md:54-57`).
- 영속(persistence) 타입 변경 기록, 릴리스 비교, 포맷 체크포인트를 문서화해야 하는 경우 (`SKILL.md:58-60`).
- 문서 코퍼스 전체 감사(슬롭 체크리스트, 예산 초과 문서 탐지) (`SKILL.md:89-93`).
- VitePress 웹사이트에 canonical Markdown을 노출하는 allowlist 매니페스트 작업 (`SKILL.md:101`).

### 부적합 / 과함
- DSH 외부 프로젝트: 스킬 이름과 본문이 DSH에 한정된다. 외부 적용 가능성은 원문에 명시 없음.
- 단일 문서 오탈자 수정: 워크플로우 8단계(`SKILL.md:30-38`)와 `pnpm run doc-sync` 등 전체 게이트는 소규모 수정에 무겁다. 소규모 예외 조항은 원문에 명시 없음.
- 한 줄 수정에도 쌍 문서의 대응 갱신과 `--write` 재기록이 따라붙는다 (`SKILL.md:35`, `SKILL.md:47`).
- API 키나 네트워크가 없는 환경에서는 명령 실행 검증을 못 한다. 이때 원문은 "name the verification owner"로 대체하라고 한다 (`SKILL.md:44`).
- 문장 수준의 정밀도 편집이 목적이면 `dsh-prose-standard`가 담당 (`SKILL.md:115`).

### 형제 스킬 대신 이걸 고르는 판정 기준 한 줄
문서의 구조, 메타데이터, kind, 이중언어 정렬, 사이트 매핑이 쟁점이면 `dsh-doc`, 문장 단위 명제 커버리지가 쟁점이면 `dsh-prose-standard`, 업그레이드 가이드의 범위와 길이는 `dsh-create-upgrade-guide`.

## 4. 전제 조건과 외부 의존성
### 실행 스크립트 / 런타임
- 이 스킬 디렉터리에 실행 스크립트: 없음. 지침 문서만 있다.
- 호출하는 리포지토리 측 명령 (모두 `SKILL.md` 또는 references에서 인용):
| 명령 | 용도 | 출처 |
|---|---|---|
| `pnpm run test:docs` | pairing, wrap, links, README gates, budgets, skill metadata, Agent Note gates 빠른 종합 검사 | `SKILL.md:128` |
| `pnpm run doc-sync` | 전체 문서 동기화 검사 | `SKILL.md:38` |
| `pnpm run lint` | 린트 | `SKILL.md:38` |
| `git diff --check` | 공백 오류 검사 | `SKILL.md:38` |
| `pnpm run verify-translation-pairing --write <pair>` | sidecar 재기록 | `SKILL.md:47` |
| `pnpm run verify-doc-budgets` / `--list` | 단어 수 예산 비교, 이상치 목록 | `SKILL.md:93`, `SKILL.md:97` |
| `pnpm docs:dev` | 웹사이트 로컬 프리뷰 | `references/website-sync.md:65` |
| `pnpm docs:check` | 웹사이트 매핑 게이트 | `references/website-sync.md:73` |
| `pnpm run verify-persistence-releases` (`--write`) | 릴리스 기록 검증 | `templates/persistence-release.md:21`, `:28` |
| `pnpm run verify-persistence-formats --write` | 포맷 기록 검증 | `templates/persistence-format.md:25` |
| `pnpm run verify-upgrade-guides` | 업그레이드 가이드 검증 | `templates/upgrade-guide.md:3` |
| `verify-md-links`, `verify-doc-site-fragments`, `verify-package-readme-summaries`, `verify-package-readme-model-experience`, `verify-package-readme-limitations` | 개별 게이트 | `metadata-links-i18n.md:64`, `website-sync.md:76`, `style.md:18`, `package-library.md:73`, `:79` |
| `dsh plugin --profile <name> add <package>` | bundle 설치 경로 (실행하여 검증해야 함) | `SKILL.md:43` |
| `git fetch origin` | master 대조 | `SKILL.md:46` |

- 패키지 매니저는 pnpm, 웹사이트 빌더는 VitePress (`SKILL.md:101`). Node 버전 등 구체적 런타임 버전은 원문에 명시 없음.

### API 키 / 네트워크 / 환경변수
- 스킬 자체는 불필요.
- 단, 문서가 주장하는 동작이 키나 네트워크에 의존하면 그 동작은 검증할 수 없고, 그때는 검증 소유자를 이름으로 적는다:
  > If a claim depends on a key or a network you do not have, say so and name the verification owner instead of asserting the behavior. (`SKILL.md:44`)
- `git fetch origin`은 네트워크를 쓴다 (`SKILL.md:46`).
- `pnpm run verify-persistence-releases`는 소스 체크아웃, Git, 네트워크 없이 동작한다고 명시 (`templates/persistence-release.md:21`).

### 리포지토리 전제
- 루트와 하위 `AGENTS.md`, `docs/AGENTS.md`, `.agents/notes/README.md`, `docs/i18n/README.md`, `scripts/doc-budgets.manifest.json`, `website/docs.ts`, `scripts/project-doc-site.ts`, `website/.vitepress/config.ts`, `scripts/doc-standard.spec.ts`, `docs/cookbook/adding-a-package.md` 가 존재해야 한다 (`SKILL.md:30`, `:89`, `:97`, `:101`; `metadata-links-i18n.md:36`; `website-sync.md:19`).
- 테스트 러너·CI 구성: 원문에 명시 없음. 게이트는 pnpm 스크립트로만 지칭된다.
- 커밋 권한, 브랜치 전략: 원문에 명시 없음. 단 "Before committing a documentation-site change, run" 목록이 있고 (`website-sync.md:78`) 푸시 전에는 `dsh-pre-push-checks` 사용 (`:87`).

### 비용 발생 지점
- 유료 API: 원문에 명시 없음.
- CI 분, 토큰: 원문에 명시 없음. 다만 `pnpm run doc-sync`와 `docs:check`는 반복 실행을 요구한다.
- 이중언어 쌍은 모든 편집이 두 번 쓰기 비용을 만든다 (`SKILL.md:35`, 배치 제약 `SKILL.md:91`: "paired docs cost a counterpart update and a `--write` re-record on every edit").

### 상태 파일 / 산출물 디렉터리
- 스킬이 직접 만드는 상태 파일(`plan.md`, `TODO` 등): 원문에 명시 없음.
- 문서 쪽 산출 경로 (스킬이 작성하라고 지시):
  - `docs/persistence-changes/YYYY-MM-DD-slug.md` (+ `.zh.md`, 생성 JSON sibling)
  - `docs/persistence-changes/releases/dsh-v*.md`
  - `docs/persistence-changes/historical-formats/vN.md` (+ `vN.schema.json`)
  - `docs/upgrade-guide/v<version>/<item>/guide.md`, `guide.zh.md`
  - `*.i18n.yaml` sidecar
  - `docs/scratch/` (소유자, 생성일, 만료일, 승격 대상 명시) (`structure-hierarchy.md:67`)
- 절대 편집 금지 경로: `website/.generated/`, `website/.cache/`, `website/.dist/` (`SKILL.md:101`, `website-sync.md:21`).

## 5. 워크플로우
### 5.1 메인 워크플로우 (`SKILL.md:26-38`)
> Follow this sequence for each requested scope. (`SKILL.md:28`)
순서 강제: "Follow this sequence". "do not skip" 표현은 없다. 순서 지시는 이 한 문장이다.
| # | 입력 | 행동 | 출력 | 통과 조건 |
|---|---|---|---|---|
| 1 | 요청 범위 | 루트/하위 `AGENTS.md`, `docs/AGENTS.md`, 대상 페이지, 소스/테스트, 내비게이션 소유자, 이중언어 기록을 읽는다 | 컨텍스트 | 원문에 명시 없음 |
| 2 | 대상 페이지 | 주 업무와 독자로 분류: product quick start, user task guide, contributor tutorial, architecture overview, package/subsystem reference, generated reference, agent instruction, decision record, scratch | 분류 | 하나의 primary job |
| 3 | 분류 | 가장 가까운 소유자에 배치. 패키지 계약은 패키지 코드 옆, 교차 패키지 학습/사용자/개발자/아키텍처/토론/만료 스크래치는 `docs/` | 파일 위치 | 원문에 명시 없음 |
| 4 | 독자 | 시작 상태, 관찰 가능한 결과, 예상 실패, 복구 경로, 다음 깊이를 먼저 정의 | 독자 모델 | 쓰기 전에 정의 |
| 5 | 템플릿 | YAML 메타데이터 추가·수정 후 `kind` 지정, 이어서 `Summary`, `Table of Contents`, 사용자용, 개발자용, 선택 `Further Exploration`, 마지막 `Dev Note` 순으로 작성 | 영어 문서 | 문서 유형이 허용하는 범위에서 이 순서 |
| 6 | 영어 문서 | 이중언어 대응본을 같은 패스에서 갱신: 제목, 목록, 표, 코드, 링크, frontmatter, 물리적 줄 수 정렬 | 중국어 쌍 | 줄 수 동일 |
| 7 | 주장 전부 | 코드/테스트/생성기/패키지 메타데이터/현 결정 소유자에 대해 검증하고 지시하는 명령을 실제 실행. 파생물보다 소유자 먼저 갱신 | 검증된 본문 | **게이트(팩트체크)**, 5.2 참조 |
| 8 | 완성 문서 | 집중 검사 후 `pnpm run test:docs`, `pnpm run doc-sync`, `pnpm run lint`, `git diff --check`. 전체 diff를 정확성 관점, 그다음 간결성 및 리포지토리 적합성 관점으로 다시 읽는다 | 통과한 diff | **게이트**: 명령 성공 |

### 5.2 팩트체크 절차 (게이트, `SKILL.md:39-47`)
> This procedure is mandatory for every new document and every new paragraph that claims an operation, command, default, error, or platform difference. (`SKILL.md:41`)
| 단계 | 행동 | 탈락 시 / 통과 조건 |
|---|---|---|
| 1 분류 | `package.json`의 `dsh.bundle.patch`, 엔트리 파일 형태(`apply` export 또는 default service export = plugin, 평범한 모듈 API = library)를 읽는다. 폴더 이름이 아니라 사실을 읽는다 | 특수 지위 패키지(library, bundle)는 전용 템플릿. "never a plugin README with install guidance that does not apply" |
| 2 실행 | 문서에 보일 그대로 모든 CLI 명령, config 스니펫, profile/patch 예시를 현재 체크아웃에서 실행. 출력, 경고, 실패 모드를 정확히 기록 | 키/네트워크가 없으면 그렇게 말하고 검증 소유자 지명 |
| 3 삭제 | "Delete what you could not reproduce." 기억, 유추, 이웃 패키지 README에서 가져온 명령/필드/기본값/동작 금지 | 재현 실패 시: "fix the claim — not the test" |
| 4 master 대조 | 기존 페이지 개정 전에 `git fetch origin` 후 `origin/master`와 섹션 비교. sidecar로 양쪽 마지막 확인 텍스트 복구 | "A stale statement on master is still wrong: correct it against the code, not against the old prose." |
| 5 재기록 | 쌍 편집마다 `pnpm run verify-translation-pairing --write <pair>` | sidecar가 확인된 쌍을 추적 |

### 5.3 kind 선택 흐름 (`metadata-links-i18n.md:32-37`)
패키지 README의 kind는 이 순서로 기계적으로 도출한다.
1. README가 `packages/README.md` 또는 `packages/<group>/README.md` -> `package-group`
2. 매니페스트가 `dsh.bundle.patch` 선언 -> `package-bundle`
3. `scripts/doc-standard.spec.ts` 의 audited library registry에 있음 -> `package-library`
4. 나머지(service default export 또는 `apply` plugin) -> `package-reference`
문서 위치별 kind: `docs/persistence-changes/YYYY-MM-DD-slug.md` -> `persistence-change`, `.../releases/dsh-v*.md` -> `persistence-release`, `.../historical-formats/vN.md` -> `persistence-format`, `docs/upgrade-guide/v<version>/<item>/guide.md` -> `upgrade-guide`. "Folder READMEs are indexes, not records."
> Open the template before writing and follow its skeleton and rules (`SKILL.md:62`)

### 5.4 코퍼스 감사 흐름 (`SKILL.md:87-93`)
1. 소유 계약 읽기: `docs/AGENTS.md`, `.agents/notes/README.md`, `docs/i18n/README.md`, 루트 `AGENTS.md`. "Read, do not re-summarize."
2. 저작 순서 적용 (사람용 문서 한정, Agent Notes 제외): 문서 위치 지정과 주제 진술 -> 허용 상세 수준 설정 및 심층 설명은 소유 하위 문서로 링크 -> 튜토리얼/레퍼런스는 경로가 아니라 의도된 사용으로 분류 -> 튜토리얼은 선행 개념과 난이도 순 -> 혼합 형태는 분할.
3. 배치 제약: 쌍 문서 비용, 생성 카탈로그 수작업 편집 금지, 이동은 모든 인바운드 링크 수리와 한 번에(atomic).
4. 슬롭 체크리스트를 가장 싼 프로브부터:
   - `dsh-trim-cot-leakage`로 추론 유출
   - 고유 문구 grep으로 중복 규칙 탐지
   - 수기 카탈로그와 상태 목록을 권위 소유자로 교체
   - 구현 완료된 Agent Note에서 이행 계획과 미래형 사양 문구 제거
   - `pnpm run verify-doc-budgets --list`와 단어 수 스캔으로 이상치 측정
5. 산문 삭제가 설명이 아니라 약속된 동작을 바꾸면 동작 변경을 먼저 제안 (`dsh-find-simplifications`).
6. 규칙은 "preferably as one to three lines plus a link to its rationale" 로 보존.

### 5.5 웹사이트 변경 분류 (`website-sync.md:23-31`)
| 변경 유형 | 행동 |
|---|---|
| 이미 게시된 페이지 편집 | canonical Markdown 소스만 수정, route나 내비 메타가 바뀔 때만 매니페스트 수정 |
| 새 페이지 게시 | 소유 `docs/` 계층에 만들고 매니페스트 항목 하나 추가 |
| 이름 변경, 이동, 삭제 | canonical 파일, 매니페스트 항목, 인바운드 링크를 atomic 갱신. `docs:check`는 누락된 소스를 거부 |
| 생성 카탈로그 게시 | 생성된 `docs/` 파일을 매핑하되 수기 편집 대신 생성기/소스 메타데이터 수정 |
| 사이트 구조 변경 | 일반 페이지는 매니페스트, 기존 사이드바/섹션/로캘 모델로 표현 불가할 때만 VitePress 설정 |

프리뷰와 검증: `pnpm docs:dev` -> `pnpm docs:check` -> (커밋 전) `test:docs`, `doc-sync`, `lint`, `git diff --check`. 푸시 전 `dsh-pre-push-checks`. 보고 항목: 변경된 canonical 파일, 추가/제거된 매니페스트 항목, 영향받은 공개 route, 실제 실행한 검사 (`website-sync.md:87`).

### 5.6 루프 구조
- 재시도 상한, 수렴 조건 수치: 원문에 명시 없음.
- 암묵적 루프: 게이트 적색 시 "ordered relocate-condense-raise policy" (`SKILL.md:97`, 상세는 `docs/AGENTS.md`에 있고 이 스킬 안에는 없음). 순서는 relocate, condense, raise.
- 도식: `쓰기 -> 실행 검증 -> (재현 실패 시 주장 수정) -> 쌍 갱신 -> --write 재기록 -> 게이트 -> diff 정확성 재독 -> diff 간결성 재독`

### 5.7 사람 개입 지점
- 웹사이트 배포: 사용자가 명시 요청하고 호스팅 정책을 확인해야 함 (`website-sync.md:91`).
- 내부 자료 게시 확대: "add internal material only when the user explicitly expands what the site publishes" (`website-sync.md:31`).
- 약속 동작이 바뀌는 삭제: 동작 변경을 먼저 제안 (`SKILL.md:93`).
- 예산 상한 인상: "justify the manifest diff in the PR" (`SKILL.md:97`).
- 질문 라운드: 원문에 명시 없음.

## 6. 엔지니어링 규칙 분석
### 6.1 금지 규칙 (anti-pattern)과 막으려는 실패 모드
| 원문 | 출처 | 막으려는 실패 |
|---|---|---|
| "never a plugin README with install guidance that does not apply" | `SKILL.md:43` | library/bundle에 플러그인 설치 안내를 복붙 |
| "Never carry a command, field, default value, or behavior from memory, analogy, or a neighboring package's README." | `SKILL.md:45` | 기억과 유추에 의한 환각 사실 |
| "never present that command as an install path for a library or a plain plugin" | `metadata-links-i18n.md:50` | `dsh plugin add`를 모든 패키지의 설치법으로 오인 |
| 요약에서 identity narration 금지: "The seam registers `ctx.x` and appends `x/event` records" | `SKILL.md:68` | 기능 대신 내부 정체성 서술 |
| "No full API catalogs, exhaustive column lists, event-payload enumerations, or JSDoc restatement inside the folds." | `SKILL.md:69` | 개발자 섹션의 카탈로그화 |
| Dev Note 밖에 부분 아이디어/스크래치 금지 | `SKILL.md:70` | 비권위 내용이 본문에 섞임 |
| "Never treat a prior README, discussion, or report as stronger than current code and tests." | `review.md:22` | 낡은 문서를 근거로 삼음 |
| `name`, `audience`, 승인 안 된 `tags`, README-local `i18n` 메타데이터 거부 | `SKILL.md:121`, `metadata-links-i18n.md:28` | 중복 메타데이터, 해시가 frontmatter에 들어가 병합 충돌 |
| 선행 `/docs/...` 링크 금지 | `metadata-links-i18n.md:64` | GitHub에서 리포지토리 밖으로 해석되고 투영기와 `verify-md-links`가 건너뜀 |
| "Do not hard-wrap either language." | `metadata-links-i18n.md:68` | 줄 정렬 붕괴 |
| `website/.generated/`, `.cache/`, `.dist/` 편집 또는 커밋 금지 | `website-sync.md:21` | 생성 트리 오염 |
| `website/` 아래 Markdown 추가 금지 (`website/AGENTS.md` 예외), `website/zh-CN/`, `website/en/`, `website/api/` 무효 | `website-sync.md:21` | 두 번째 사본 생성 |
| RFC, postmortem, testing guide, `AGENTS.md`, maintainer workflow를 "merely because they exist" 게시 금지 | `website-sync.md:31` | 내부 문서 유출 |
| 생성 카탈로그 수기 편집 금지 | `SKILL.md:91` | 생성기와 불일치 |
| GitHub Pages 권한, 배포 워크플로우, 커스텀 도메인 무단 추가 금지 | `website-sync.md:91` | 의도치 않은 공개 |
| `Setext` 오파싱: 문단 바로 뒤 `-----` 금지, 패키지 README 마지막 두 H2 안에 구분선 금지 | `style.md:35` | 제목 오인, Model Experience 게이트 파손 |
| 들여쓴 `<details>` 내용 | `style.md:39` | 코드 블록으로 파싱 |
| "Do not apply a universal word limit to exhaustive references." | `SKILL.md:85` | 기계적 단어 상한이 레퍼런스를 훼손 |
| must/may/never/시간/예외/숫자 제거 또는 강화 금지(길이 목표 때문에) | `style.md:31` | 계약 용어 손실 |
| "Do not force a shorter sentence when precision would fall." | `SKILL.md:72` | 정밀도 하락 |
| 계산 위주 광고성 description 금지 ("claim superiority, repeat the title, advertise vaguely, preserve change history") | `metadata-links-i18n.md:54` | 검색 불가능한 description |

### 6.2 강제 규칙 (수치와 임계값 전부)
| 항목 | 값 | 출처 |
|---|---|---|
| 영어 패키지 README Summary 단어 수 | 최대 100 `wc -w` 스타일 단어 | `SKILL.md:125`, `style.md:18`, 각 템플릿 |
| Summary 문장 수 | 3 ~ 5문장, 한 문단 | `structure-hierarchy.md:24`, `style.md:18` |
| Summary 게이트 이름 | `verify-package-readme-summaries` | `style.md:18` |
| 신규 독자 완결성 | 전문 엔지니어가 "three to five linked pages"로 아키텍처/기능 재구성 | `SKILL.md:83`, `review.md:18` |
| Further Exploration 링크 수 | 3 ~ 7개, 선행 순, 짧은 구절 | `structure-hierarchy.md:77`, `package-reference.md:72` |
| 폴더 index 설명 | 3 ~ 5문장 | `structure-hierarchy.md:73` |
| 지시문 길이 검토 신호 | 20 단어 (게이트 아님) | `style.md:31` |
| 설명문 길이 검토 신호 | 25 단어 (게이트 아님) | `style.md:31` |
| 지시당 문장 | 1 지시/문장, 3개 이상 단계나 조건은 목록 | `style.md:27` |
| 예산 상한 여유 | 목표 이하일 때 최소 5% headroom 유지 | `SKILL.md:97` |
| upgrade-guide 길이 | `Change`와 `Migration` 섹션, 영어 최대 500 단어 | `metadata-links-i18n.md:48` |
| upgrade-guide 섹션명 | 영어 `Change`, `Migration`; 중국어 `## 变更`, `## 迁移` (템플릿 3행은 중국어 헤딩, 스켈레톤은 영어 헤딩) | `upgrade-guide.md:3`, `:21`, `:25` |
| 이중언어 줄 수 | English와 Chinese 물리적 줄 수 정확히 동일 | `SKILL.md:35`, `metadata-links-i18n.md:68` |
| frontmatter 필수 키 | `description`, `kind` (패키지 README 쌍) | `metadata-links-i18n.md:28` |
| frontmatter 키 철자 | 소문자 하이픈 구분 | `metadata-links-i18n.md:28` |
| README 마지막 두 H2 | `Model Experience`, `Known Limitations and Deferred Work` | `structure-hierarchy.md:30`, `style.md:41` |
| Dev Note 위치 | 패키지 README는 limitations H2 안의 `### Dev Note`; limitations 면제 패키지는 H2 Dev Note | `style.md:41` |
| 빈 Dev Note | `None.` | `structure-hierarchy.md:87` |
| 구분선 | `-----` (하이픈 5개), 앞뒤 빈 줄 | `style.md:35` |
| 구분 위치 | front matter -> use -> 접힌 개발자 -> Further Exploration -> Model Experience | `style.md:35` |
| 섹션 도입 | 모든 실질 H2는 짧은 도입 문단으로 시작 | `structure-hierarchy.md:34`, `SKILL.md:76` |
| `persistence-release` 첫 기록 | 추출된 모든 root 포함; 이후 schema companion은 변경되어 존재하는 root만 | `persistence-release.md:26` |
| `persistence-change` yaml 블록 | 정확히 하나의 `yaml persistence-change` 블록, 영어/중국어 byte-identical | `persistence-change.md:66` |
| `persistence-change` baseline | 초기 `baseline: true` 하나가 전체 인벤토리, 이후는 `baseline: false` | `persistence-change.md:68` |
| `persistence-change` schemaVersion | `schemaVersion: 1`; `after` 64자 SHA-256 hex | `persistence-change.md:38-44` |
| `persistence-format` | `schemaVersion: 1`, 숫자 `sessionFormatVersion`, `source`에 `tag` 또는 숫자 `pullRequest` 정확히 하나 | `persistence-format.md:20` |
| `persistence-release` yaml | 정확히 하나의 `yaml persistence-release` 블록: `schemaVersion: 1`, `tag`, `previous`, `sessionFormatVersion`, `changes` | `persistence-release.md:19` |
| 모든 템플릿 | 편집 후 `verify-translation-pairing --write` 재실행 | 각 템플릿 Rules |
| 스킬 변경 | 리포지토리의 skill-invocation metadata 검사 실행 | `SKILL.md:127`, `review.md:63` |

### 6.3 검증 방식
- 근거는 자기 진술이 아니라 실행이다. 운영 주장에 대한 유일한 증거는 실행:
  > the only admissible evidence for an operation claim is having run it. (`SKILL.md:41`)
  > the evidence is running it, not reading it. (`review.md:24`)
- 기계 게이트: `test:docs`, `doc-sync`, `lint`, `git diff --check`, `verify-*` 계열, `docs:check`.
- 유효 픽스처와 무효 픽스처:
  > A strong promise needs a focused valid fixture and an invalid fixture that proves the top-level gate can fail. (`SKILL.md:119`)
- 메타데이터: YAML 파싱, kind를 템플릿과 문서 표준으로 매핑, `name`/`audience`/ungoverned `tags`/README-local `i18n` 거부, 누락 또는 광고성 description 거부 (`SKILL.md:121`).
- 이중언어: 구조, 정확한 줄 수, 용어, 링크 동등성, sidecar 기록 (`SKILL.md:122`). 한계: "Line equality is a structural check, not proof of faithful meaning" (`metadata-links-i18n.md:70`). 의미 충실성은 사람 리뷰 소유.
- 튜토리얼: 문서화된 진입 경로를 실행하거나 수동 검증 소유자를 이름으로 지명 (`SKILL.md:123`).
- 생성 레퍼런스: 결정론적 freshness 검사와 검색 크기 측정 보고 (`SKILL.md:124`).
- 패키지 README: Summary 게이트, model-experience 및 limitation 검사, 동작 주장이 바뀌면 패키지 집중 테스트, 병합 전 README가 지시하는 모든 명령 재실행 (`SKILL.md:125`).
- 증거 소유자 매핑 (`review.md:22`): 이름과 엔트리 포인트는 패키지 메타데이터, API 계약은 공개 타입과 JSDoc, 동작은 런타임 코드, 실패 경로는 테스트, 전수 목록은 생성 카탈로그, 근거는 활성 Agent Notes.
- 최종 리뷰: diff를 한 번은 사실 완결성, 한 번은 간결성/내비게이션/소유권으로 읽는다 (`review.md:63`).
- 자기 진술만으로 끝나는 구간: 문서 설명의 "신규 독자 테스트"(`review.md:18`)는 실행 가능한 게이트가 아니라 리뷰어의 판단이다. 이를 자동 검증하는 도구는 원문에 명시 없음.

### 6.4 도구 사용 규칙
- 필수 사용: pnpm 스크립트 게이트 (6.2, 4절 표), `git fetch origin`, `dsh` CLI (bundle 설치 경로 실제 실행).
- 서브에이전트, MCP 도구 지시: 원문에 명시 없음.
- 금지 도구: 명시적으로 금지된 도구 목록은 원문에 명시 없음. 대신 금지 동작이 있다: 확장 번역 스킬 자동 호출 (`website-sync.md:19`), 생성 트리 수기 편집.
- 읽기 우선: 매니페스트는 "do not rely on a remembered field set" 이라 하며 `website/docs.ts` 의 `DocsPage` 타입을 읽도록 한다 (`website-sync.md:19`, `:35`).
- 링크 투영기 규칙 (`website-sync.md:49-56`):
  - 매니페스트 안의 대상은 사이트 상대 route로 변환
  - 매니페스트 밖이지만 존재하는 대상은 GitHub 소스 링크(지원되는 줄 접미사 포함)
  - 이미지는 예외: 생성 트리로 복사, 리포지토리 안의 일반 파일이어야 함
  - 외부 URL, 사이트 절대 URL, 이메일, fragment-only 링크는 불변
  - 누락된 리포지토리 상대 대상은 투영 실패
  - cross-page fragment는 영어 GitHub heading id가 canonical. VitePress가 다른 id를 내면 `<a id="..."></a>`를 바로 앞에 둔다

### 6.5 컨텍스트와 토큰 규율
- 참조 선택 로딩:
  > Load only the reference needed for the task. Each reference links directly from this file so the skill has no deep reference chain. (`SKILL.md:105`)
- 템플릿은 kind에 해당하는 하나만 연다 (`SKILL.md:113`).
- Agent 검색 효율을 위한 문서 설계: "Agents search frontmatter `description` values to shortlist pages before loading full documents" (`metadata-links-i18n.md:54`). Agent-readable 기준은 "targeted retrieval without loading the corpus" (`SKILL.md:82`).
- 검색 비용 측정 항목: entry-path length, unrelated material scanned for one lookup, largest section, heading count, page size. 검색 비용이 높으면 기존 도메인 소유자로 분할 (`SKILL.md:85`).
- 서브에이전트 위임, 요약 압축 지시 (스킬 실행 자체에 대한): 원문에 명시 없음.
- 코퍼스 감사 시 `.agents/notes/archived/` 제외 (`SKILL.md:89`).

### 6.6 모호어의 조작적 정의
| 용어 | 환산 | 출처 |
|---|---|---|
| Brief | 공통 경로에 결과에 필요한 사실만; 전수 진실은 직접 링크 하나 또는 상세 층 하나 너머 | `SKILL.md:78` |
| Intuitive | 선행 조건이 의존 개념보다 앞, 다음 행동 하나가 명백, 제목에 독자가 검색하는 용어 | `SKILL.md:79` |
| Friendly | 독자가 성공 인식, 행동 전 위험 이해, 예상 실패에서 복구, 더 깊이 갈지 선택 | `SKILL.md:80` |
| Accurate | 지속적 주장마다 소유자 하나와 위험에 비례한 검증 경로 | `SKILL.md:81` |
| Agent-readable | 메타데이터, 안정적 제목, 앵커, 용어, 소유권, 현재/제안 상태 | `SKILL.md:82` |
| Newcomer-complete | 3~5개 링크 페이지로 재구성 | `SKILL.md:83` |
| "what it is" (패키지 Summary) | 독자가 보는 능력만, Cordis 역할/등록/내부 구성요소 아님 | `SKILL.md:68` |
| Current state | 일반 문서는 현재 코드베이스; 이력은 전용 persistence 기록에만 | `SKILL.md:71` |
| Dev Note | 유일한 slop zone, 명시적 비권위 | `SKILL.md:70` |
| "controlled technical English" | ASD-STE100에서 영감을 받은 비인증 규율, 통제 사전은 재현/검증하지 않음 | `style.md:22` |
| "done" / "clean" / "simple" | 환산 규칙 없음 (원문에 명시 없음). 대신 6.2의 게이트 통과와 diff 이중 재독이 완료 기준에 해당 |  |
| "load-bearing rule" | 정의 없음 (원문에 명시 없음) | `SKILL.md:93` |

## 7. 산출물
### 최종 결과물의 형태
- 파일: Markdown 문서 쌍(`.md` + `.zh.md`) + `*.i18n.yaml` sidecar. 영속 기록은 추가로 생성 JSON/스키마 companion.
- 웹사이트 작업: `website/docs.ts` 매니페스트 항목 + canonical 소스. `website/.generated/`는 투영기가 만드는 일회용 트리.
- 완료 보고: 웹사이트 작업 후 "canonical files changed, manifest entries added or removed, public routes affected, and the exact checks run" 를 보고 (`website-sync.md:87`).
- 감사 작업의 리포트 템플릿: 원문에 명시 없음 (감사 결과를 어떤 서식으로 내라는 지시 없음).

### 출력 포맷을 강제하는 템플릿
페이지 순서 (`structure-hierarchy.md:21-28`):
1. YAML metadata
2. H1 title
3. Language switcher (이중언어)
4. `## Summary`
5. `## Table of Contents`
6. 사용자용에서 개발자용 순으로 정렬된 안정 콘텐츠
7. 선택 `## Further Exploration`
8. 마지막 `## Dev Note`
kind별 템플릿 요약:
| kind | 필수 섹션 / 특징 |
|---|---|
| `package-group` | Summary, ToC(Packages / Related documentation / Dev Note), 패키지 표(Package, Role). Model Experience와 Known Limitations 추가 금지 ("the group map owns no runtime behavior") |
| `package-reference` | Use this package(When to choose it, Minimal configuration + config 표 Field/Default/Meaning), Understand the implementation(`<details>` 접힘), Further Exploration, Model Experience, Known Limitations and Deferred Work, `### Dev Note`. 구성 카탈로그 `docs/config-catalog.md#deepseek-aidsh-<name>` 링크 |
| `package-library` | When to use it, Entry point(import + call 최소 예, `text` 또는 `ts` 펜스), 이하 동일. Model Experience는 `none`/`indirect` 형태가 대부분. "A library never invents model effects it does not have." |
| `package-bundle` | Install into a profile(`dsh plugin --profile <name> add|remove @deepseek-ai/dsh-<name>`), What you get, patch document 접힘. Model Experience 형태는 `indirect` 또는 `none` |
| `persistence-change` | Declaration(`yaml persistence-change` 블록), Compatibility, Verification, Dev Note. 생성기가 기계 선언/스키마 companion/일관성 기록을 채우고 `--prose` JSON(`en`, `zh` 각각 `summary`, `compatibility`, `verification`) 제공 |
| `persistence-release` | Summary, ToC, Release evidence, Declaration, Structural changes, Verification, Dev Note. 생성 영역 마커 `persistence-release-index`, `persistence-release-inventory`, `persistence-release-changes` |
| `persistence-format` | Summary, ToC, Source evidence, Format characteristics, Declaration, Complete schemas(`persistence-format-schema:start` / `:end` 한 영역), Verification and limitations, Dev Note |
| `upgrade-guide` | H1에 구체적 break, `English | [中文](guide.zh.md)`, `Change`, `Migration`(번호 목록: 정확한 파일/키/명령/심볼과 전후 스니펫, 성공 확인 방법) |

`package-reference` 접힘 블록 포맷 (원문 그대로): `<details>` / `<summary>Implementation internals — click to expand</summary>`; 앵커 `<a id="use-this-package"></a>` 형태를 각 H2 앞에 둔다. Dev Note는 `<summary>Working context for maintainers — click to expand</summary>`.

Summary 서술 예 (`SKILL.md:68`): 나쁜 예 "The seam registers `ctx.x` and appends `x/event` records"; 좋은 예 "you can save a note per message and it survives restarts".

description 예 (`metadata-links-i18n.md:56-58`):
- Good: `The shipped JSONL session-persistence backend for deployments and maintainers choosing, configuring, or debugging per-session durable logs with optional Zstandard compression.`
- Weak: `The best and most advanced session storage implementation with lots of optimizations.`

### 커밋 / PR / 브랜치 / 파괴적 동작
- 커밋, PR, 브랜치 생성 지시: 원문에 명시 없음. 커밋 전 검사 목록만 있다 (`website-sync.md:78`).
- PR 언급: 예산 매니페스트 diff는 PR에서 정당화 (`SKILL.md:97`).
- 파괴적 동작 후보:
  - 페이지 이동/삭제와 모든 인바운드 링크 수리를 atomic으로 (`SKILL.md:91`, `website-sync.md:27`)
  - `persistence-change`의 `--update`: 승인되지 않은 terminal 기록에만 허용, 기준선(baseline)과 의존되는 기록은 거부, `--prose`는 저자 설명을 교체하고 생략하면 보존 (`persistence-change.md:72`)
  - `verify-persistence-releases --write`, `verify-persistence-formats --write`: 생성 영역과 pairing 기록을 재작성하되 저자 산문, 기계 선언, 스키마 파일은 보존 (`persistence-release.md:28`)
  - `git push --force`, 마이그레이션 실행: 원문에 명시 없음.
- 배포: 동기화는 게시가 아니며 배포는 별도 명시 요청 단계 (`SKILL.md:101`).

## 8. 주의점 / 한계 (여기서만 평가)
### 오작동 및 과잉작동 시나리오
1. 외부 프로젝트 오적용. description이 "DeepSeek Harness"로 시작하지만 "문서 작성/구조 변경" 같은 일반 요청이 오면 켜질 수 있다. 켜진 뒤에는 `pnpm run doc-sync`, `docs/AGENTS.md` 등 존재하지 않는 자산을 전제로 에이전트가 헛돌거나 허구 경로를 만들 수 있다. 스킬 안에 "DSH 리포지토리가 아니면 중단" 조항이 없다.
2. 소규모 수정에 대한 과함. 오타 한 글자도 쌍 갱신, `--write`, 전체 게이트 4종을 거치라고 읽힌다. 생략 조건이 없다. 반대로 에이전트가 이를 무시하면 sidecar가 낡아 게이트가 적색이 된다.
3. 실행 검증 불가 환경. 키/네트워크가 없으면 명령을 못 돌린다. 원문은 소유자 지명으로 대체하라는 탈출구만 주고, 지명할 "verification owner"가 누구인지 판별 규칙은 없다. 에이전트가 이를 남용하면 팩트체크 게이트가 사실상 비활성이 된다.
4. 실행 자체가 부작용을 낼 수 있다. "Execute each CLI command ... exactly as the document will show it" 이므로 문서가 파괴적 명령(예: 삭제, 마이그레이션)을 보여주면 그것을 그대로 실행하라는 뜻이 된다. 격리 환경(scratch profile) 권고는 `package-bundle.md:102`에만 있고 다른 kind에는 없다.
5. 분류 오류가 연쇄된다. kind는 마지막에 "기계적으로 도출"되지만, library 판정은 `scripts/doc-standard.spec.ts` 의 audited registry에 의존한다. 새 library를 레지스트리에 안 넣으면 `package-reference`로 판정되어 템플릿이 틀어진다. 에이전트가 레지스트리를 갱신해야 한다는 지시는 이 스킬에 없다.
6. 길이 압박과 정밀도의 충돌. Summary 100단어 상한은 게이트이고 "Do not force a shorter sentence when precision would fall"은 권고라서, 복잡한 패키지에서 게이트 통과를 위해 정보가 깎일 수 있다.
7. 이중언어 줄 정렬 요구가 실제로는 매우 강하다. 줄 단위 일치 + 하드랩 금지 + 코드 블록 byte-identical + 용어 위치 조정까지 요구해, 번역 품질을 줄 구조에 종속시킨다. 줄 일치는 의미 충실성을 보장하지 않는다고 원문 스스로 인정 (`metadata-links-i18n.md:70`).

### 다른 스킬과 규칙의 충돌 가능 지점
- 스킬 지침과 `AGENTS.md`: "Apply repository `AGENTS.md` files and executed gates first" (`SKILL.md:10`)라서 우선순위는 명시돼 있다. 그러나 `docs/AGENTS.md`의 내용은 이 스킬 안에 없어 충돌 시 판정 불가.
- `dsh-prose-standard`와 역할 경계: 이 스킬의 `style.md` 도 문장 규칙(20/25 단어, ASD-STE100 영감)을 갖고 있어 두 스킬이 문장 층에서 겹친다. 소유 관계는 "prose standard owns the complete-proposition rule" 한 줄뿐.
- `dsh-trim-cot-leakage`, `dsh-find-simplifications`, `dsh-create-upgrade-guide`, `dsh-pre-push-checks`, `dsh-prose-standard`: 이 스킬은 상대 경로(`../dsh-*/SKILL.md`)로 참조한다. 컬렉션 안에 실제 존재하는지는 이 분석 범위(dsh-doc 디렉터리)에서 확인하지 않았다. 존재 여부는 원문에 명시 없음.
- "간결성" 규칙(brevity)과 "아무 것도 빼지 마라" 규칙의 긴장: `SKILL.md:28` "do not delete failures, ownership, limitations, or other required contracts merely to reduce words" vs 예산 게이트의 relocate-condense-raise. 경계는 에이전트의 판단에 맡겨진다.
- 접힌 `<details>`와 웹사이트/GitHub 렌더링: 들여쓰기 실수 시 코드 블록이 되는 렌더러 의존 규칙(`style.md:39`).

### 검증 공백
- 신규 독자 테스트와 "brief/intuitive/friendly" 기준은 리뷰어 주관이다. 자동 게이트나 점수 기준 없음.
- 번역 충실성: 구조만 검사, 의미는 사람 몫.
- 이 스킬 자체의 테스트·평가 픽스처: 원문에 명시 없음. `Skills: run the repository's skill-invocation metadata check` 가 유일한 스킬 검증.
- 팩트체크의 "실행"을 에이전트가 실제로 했는지 확인하는 수단: 원문에 명시 없음. 관찰된 출력 기록은 요구하지만(`SKILL.md:44`) 증거를 첨부하는 서식은 없다. 결국 에이전트의 자기 보고에 의존한다.
- `docs/AGENTS.md` 의 relocate-condense-raise 정책, slop checklist, 예산 수치(`scripts/doc-budgets.manifest.json`)는 외부 파일에 있어 이 스킬만으로는 수치를 알 수 없다.
- 3~5 페이지 신규 독자 완결성은 정의만 있고 측정 방법 없음.

### 유지보수 리스크
- 하드코딩된 리포지토리 경로가 매우 많다: `scripts/doc-budgets.manifest.json`, `website/docs.ts`, `scripts/project-doc-site.ts`, `website/.vitepress/config.ts`, `docs/cookbook/adding-a-package.md#4-write-the-package-readme`, `packages/session/session-persistence-jsonl/README.md`. 파일 이동 시 스킬이 깨진다.
- 게이트 이름(`verify-package-readme-summaries` 등)과 pnpm 스크립트명, 단어 상한 100은 리포지토리 변경과 동기화되어야 한다. 이 스킬은 "read them there rather than copying values into prose" (`website-sync.md:35`)로 일부를 완화하지만 100 단어, 500 단어, 20/25 단어 같은 수치는 스킬 안에 복제돼 있다.
- 모델명 하드코딩: 없음. 도구 버전 고정: 없음 (pnpm, VitePress 버전 원문에 명시 없음).
- 레퍼런스 예시(`session-persistence-jsonl`)에 의존: 그 README가 바뀌면 "표준 예시"가 표류한다. 템플릿마다 별도 worked example(`bundle/base`, `boot/app-boot`)도 지정되어 있어 3개 예시가 관리 대상.
- 템플릿에서 Known Limitations 섹션의 `<a id>` 배치가 비정상적(H2 뒤에 앵커)이고 Model Experience와 구분선 금지 같은 게이트 종속 규칙이 많아, 게이트가 바뀌면 템플릿 다수가 동시에 낡는다.
- 중국어 헤딩 표기 불일치 소지: `templates/upgrade-guide.md:3`은 섹션을 `## 变更`, `## 迁移`로 서술하나 스켈레톤은 영어 `## Change`, `## Migration` 이다. 중국어 쌍에서 어느 쪽이 쓰이는지는 이 파일만으로 확정되지 않는다 (`dsh-create-upgrade-guide` 소유).
- 중복 서술: 분류 규칙이 `SKILL.md:43`, `metadata-links-i18n.md:50`, `review.md:26`, `package-library.md:94-95`, `package-reference.md:101` 에 반복된다. 한 곳만 바뀌면 불일치가 생긴다 (스킬 스스로 "grep distinctive phrases to find duplicated rules"를 권하는 슬롭 유형).

### 한 줄 판정
조건부 도입 권장. DSH 리포지토리의 문서 작업에서는 "실행하지 않은 주장은 삭제" 규칙(`SKILL.md:41-45`)과 kind 기계 도출이 환각과 템플릿 오적용을 직접 차단하지만, 그 밖의 프로젝트에서는 전제 자산이 없어 무용이거나 해롭다.
