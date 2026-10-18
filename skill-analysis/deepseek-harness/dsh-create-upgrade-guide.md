# dsh-create-upgrade-guide 분석

## 1. 개요

- 원본 경로: `/Users/kkh/Desktop/skills-analize/deepseek-harness/dsh-create-upgrade-guide/`
- 읽은 파일 (재귀 전수 조사, `find . -type f` 결과 1개뿐):

| 파일 | 크기 | 줄 수 | 역할 |
|---|---|---|---|
| `SKILL.md` | 3734 바이트 | 54줄 | 유일한 파일. 범위·위치·유지보수·포맷·검증 전부 포함 |

- `references/`, `scripts/`, `templates/`, `assets/` 디렉터리: 없음 (디렉터리 안에 `SKILL.md` 외 파일 없음).
- 보조 파일 목록: 없음. 단, SKILL.md가 디렉터리 밖의 파일을 링크로 지목한다 (이번 분석에서는 읽지 않았고, 이 스킬 폴더 바깥이므로 내용은 `원문에 명시 없음`).
  - `../../../docs/cookbook/reviewing-persistence-type-changes.md` (`SKILL.md:20`)
  - `../dsh-doc/templates/upgrade-guide.md` (`SKILL.md:36`)
  - `../../notes/README.md` (`SKILL.md:44`)
  - `../dsh-prose-standard/SKILL.md` (`SKILL.md:46`)
  - `../../../docs/AGENTS.md` (`SKILL.md:46`)
- 성격: **생성(construction)**. 외부에서 관찰 가능한 breaking change에 대해 업그레이드 가이드 문서(`guide.md`, `guide.zh.md`, `guide.i18n.yaml`)를 작성·갱신하는 스킬. 검증 단계(`verify-*` 스크립트 실행)가 끝에 붙어 있다.
- 원문 자기 규정:
  > An upgrade guide tells a reader who runs release vT what to change to run the next release. Write it in the change that introduces the break, as soon as the break is recognized; do not defer it to release preparation. (`SKILL.md:8`)

## 2. 활성화 조건 (언제 켜지는가)

### frontmatter `description` 전문

> Use when a deepseek-harness change breaks an externally perceptible surface (CLI, profiles, cordis.yml or settings keys, persisted user data, SDK or wire APIs, published package entry points), or when changing a surface that an unreleased upgrade guide already covers, to write or update docs/upgrade-guide/v<version>/<item>/guide.md.

트리거는 두 갈래다.
1. 외부에서 인지되는 표면(surface)을 깨는 변경.
2. 이미 존재하는 미출시 업그레이드 가이드가 다루는 표면을 다시 수정하는 변경 (갱신 트리거).

### 매칭되는 실제 사용자 발화 예시 (트리거 사전 추출, description·본문 어휘 기반)

1. "`dsh` 의 `--profile` 플래그 이름을 `--preset` 으로 바꿨는데 업그레이드 가이드 써줘."
2. "`cordis.yml` 의 settings 키 하나를 제거했다. 이 breaking change 에 대한 upgrade guide 작성해줘."
3. "Session log 포맷이 바뀌었어. 사용자가 해야 할 마이그레이션을 `docs/upgrade-guide/` 에 남겨줘."
4. "TypeScript SDK export 이름을 바꿨다. 가이드 필요한지 확인하고 있으면 써줘."
5. "published package entry point 가 바뀌었다. 가이드 작성해."
6. "이미 `docs/upgrade-guide/v0.1.7-rc.2/profile-flag-rename/guide.md` 가 있는데 같은 플래그를 또 바꿨어. 가이드 업데이트해줘." (갱신 트리거)
7. "방금 넣은 breaking change 를 revert 했으니 해당 upgrade guide 삭제해줘." (본문 `delete the guide when the break is reverted`, `SKILL.md:32`)
8. "JSON-RPC / ACP 메시지 스키마를 바꿨는데 릴리스 때 쓰지 말고 지금 가이드 써둬."

### 의도적으로 배제되는 발화와 넘길 스킬

- 범위 밖 변경: "Pre-stable internal APIs whose consumers are all updated in the same change need no guide." (`SKILL.md:20`) → 가이드를 쓰지 않는다. 넘길 스킬은 `원문에 명시 없음`.
- Session-format 변경: 가이드를 쓰되 근거 기록은 별도 문서를 따른다. "A Session-format change still follows [type acknowledgements](../../../docs/cookbook/reviewing-persistence-type-changes.md); its guide states only the reader's actions and links that record." (`SKILL.md:20`) 이것은 문서 링크이며 스킬 이름이 아니다.
- 두 릴리스에 걸친 가이드 요청: "Never write a guide spanning more than one release." (`SKILL.md:32`)
- 산문 문체 규칙: `dsh-prose-standard` 스킬을 따르라고 지시 (`SKILL.md:46`).
- 일반 문서 작성: 템플릿이 `dsh-doc` 스킬 아래 있다 (`../dsh-doc/templates/upgrade-guide.md`, `SKILL.md:36`). `dsh-doc` 로 넘기라는 명시적 문장은 `원문에 명시 없음`.

### 기타 frontmatter 필드

- `name`: `dsh-create-upgrade-guide`
- `description`: 위 인용
- `allowed-tools`, `model`, `metadata` 등 다른 필드: **없음** (`SKILL.md:1-4` 에 두 필드만 존재).

## 3. 적합 / 부적합

### 적합

- 이 저장소(deepseek-harness) 안에서 사용자가 업그레이드 후 직접 관찰하는 표면이 바뀌는 PR. 원문이 나열한 5개 범주 (`SKILL.md:12-18`):
  - `dsh` commands, flags, and profile names
  - `cordis.yml`, patch, overlay, and settings keys or their accepted values
  - persisted user data: Session logs, SQLite stores, and user data directories
  - TypeScript and Python SDK exports, JSON-RPC, HTTP, and ACP messages
  - published package names and entry points
- 루트 `package.json` 의 `version` 이 아직 바뀌지 않은 상태에서 같은 표면을 반복 수정하는 개발 구간 (가이드를 같은 변경에서 갱신해야 하므로).
- 릴리스 직전에 몰아서 가이드를 쓰는 관행을 막고 싶은 팀 (`do not defer it to release preparation`).

### 부적합 / 과함

- 모든 소비자가 같은 변경에서 함께 갱신되는 pre-stable 내부 API 변경 (`SKILL.md:20`).
- deepseek-harness 가 아닌 저장소. `docs/upgrade-guide/v<version>/<item>/guide.md` 경로, `pnpm run verify-upgrade-guides`, `verify-translation-pairing`, `verify-md-links` 스크립트가 전제이므로 이 구조가 없으면 작동하지 않는다 (전제 구조의 존재 여부는 원문에 명시 없음, 스킬 본문이 해당 경로를 하드코딩한다는 사실만 확인).
- 버전 범프 이후의 이전 버전 디렉터리 수정: "After the version bump, guides in older version directories are frozen" (`SKILL.md:32`).
- 500 단어를 넘기는 설계 근거·장문 설명: 이 스킬은 그것을 가이드 안에 쓰지 못하게 한다 (`SKILL.md:44`).

### 형제 스킬 대신 이걸 고르는 판정 기준 한 줄

- 변경이 저장소 바깥 사람이 관찰할 수 있는 breaking change 이면 이 스킬, 단순 문서·산문 규칙이면 `dsh-doc` / `dsh-prose-standard` (형제 스킬 본문은 읽지 않음, 이름만 참조됨).

## 4. 전제 조건과 외부 의존성

- 실행 스크립트(스킬 폴더 내): **없음**. 스킬 자체는 `SKILL.md` 하나다.
- 스킬이 지시하는 외부 CLI/스크립트 (`SKILL.md:50-54`):
  ```sh
  pnpm run verify-upgrade-guides
  pnpm run verify-translation-pairing docs/upgrade-guide/v<version>/<item>/guide.md
  pnpm run verify-md-links
  ```
  - 번역 쌍 기록: `pnpm run verify-translation-pairing --write docs/upgrade-guide/v<version>/<item>/guide.md` (`SKILL.md:46`)
- 런타임/패키지: `pnpm` (Node 기반 저장소). 버전 요구는 `원문에 명시 없음`.
- API 키·환경변수·네트워크: 원문에 언급 없음 → 불필요로 보이는 근거는 없고 `원문에 명시 없음`. (스크립트 자체의 내부 동작은 이 파일에서 확인 불가.)
- 리포지토리 전제:
  - 루트 `package.json` 의 `version` 필드 (`SKILL.md:26`): "`<version>` is the `version` field of the root `package.json` when you write the guide, for example `v0.1.7-rc.2`."
  - `docs/upgrade-guide/` 디렉터리 구조, `docs/AGENTS.md` 의 bilingual pairing 규칙, `docs/notes/README.md` 의 Agent Note 체계, `dsh-doc/templates/upgrade-guide.md` 템플릿.
  - 테스트 러너·CI·린터·브랜치 전략·커밋 권한: `원문에 명시 없음`. 단 "in the change that introduces the break" (`SKILL.md:8`) 라고 하여 가이드가 기능 변경과 같은 변경(커밋/PR)에 들어가야 함을 요구한다.
- 비용 발생 지점: 유료 API, CI 분 등 원문에 언급 없음. 토큰 비용은 가이드 2개 언어 작성분 (영문·중문) 이 필요하다는 점만 사실.
- 생성하는 상태 파일·산출물 경로 (`SKILL.md:24-28`):
  - `docs/upgrade-guide/v<version>/<item>/guide.md`
  - `docs/upgrade-guide/v<version>/<item>/guide.zh.md`
  - `docs/upgrade-guide/v<version>/<item>/guide.i18n.yaml`
  - "Each item directory holds exactly `guide.md`, its Chinese counterpart `guide.zh.md`, and the pairing record `guide.i18n.yaml`: no index, no attachments."
  - `plan.md`, `TODO`, `.claude/` 등 별도 상태 파일: 없음.

## 5. 워크플로우

SKILL.md는 번호 매긴 단계가 아니라 섹션(Scope / Location / Maintenance / Format / Verify)으로 구성된다. 아래 단계는 섹션 순서와 문장 지시에서 재구성한 것이며, 원문에 "run in order" 같은 순서 강제 문구는 없다 (`원문에 명시 없음`).

### 단계 0. 범위 판정 (게이트 성격)

- 입력: 현재 변경 (diff).
- 행동: 변경이 5개 범주 중 하나를 외부에서 관찰 가능하게 깨는지 판단.
- 출력: 가이드 작성 필요 / 불필요.
- 통과 조건: "Write a guide only for breaks that someone outside the repository can observe after upgrading" (`SKILL.md:12`).
- 탈락 시: "Pre-stable internal APIs whose consumers are all updated in the same change need no guide." (`SKILL.md:20`) → 가이드를 쓰지 않는다.
- 판정자: 에이전트 자신. 객관적 검사 도구 지시는 `원문에 명시 없음`. (자기 진술 기반 게이트)

### 단계 1. 기존 가이드 확인 (분기)

- 입력: `docs/upgrade-guide/v<현재 root version>/` 아래 기존 항목.
- 행동: 변경하려는 표면을 이미 다루는 가이드가 있으면 새로 쓰지 않고 갱신. 변경이 revert 되었으면 가이드 삭제.
  > While the root version is unchanged, the current version directory describes the delta from vT to current `master`. When a later change touches a surface a guide there covers, update that guide in the same change; delete the guide when the break is reverted. (`SKILL.md:32`)
- 출력: 갱신 또는 삭제된 가이드, 또는 신규 작성 결정.
- 통과 조건: 원문에 별도 기준 없음.

### 단계 2. 위치 결정

- 입력: 루트 `package.json` 의 `version`, 변경된 표면 이름.
- 행동: `docs/upgrade-guide/v<version>/<item>/guide.md` 경로 결정. `<item>` 은 kebab-case (예: `profile-flag-rename`).
- 출력: 디렉터리 경로.
- 통과 조건: `<version>` 이 가이드 작성 시점의 루트 `package.json` `version`과 일치. "The guide describes the upgrade from that release to the next one." (`SKILL.md:26`)

### 단계 3. 영문 가이드 `guide.md` 작성

- 입력: 템플릿 `../dsh-doc/templates/upgrade-guide.md`, 변경 내용.
- 행동: 템플릿에서 시작해 작성. 구조 요건은 `verify-upgrade-guides` 가 강제한다 (`SKILL.md:36-40`).
- 출력: `guide.md`
- 통과 조건 (게이트, 자동 검증 대상):
  - frontmatter 는 정확히 `kind: upgrade-guide` 와 한 문장 `description` (깨지는 대상을 명시).
  - `#` 제목 하나, 이어서 정확히 `## Change`, `## Migration` 섹션 순서.
  - "at most 500 words in `guide.md`, frontmatter included."
- 내용 지침 (`SKILL.md:42`): "`Change` states the old and new behavior of the surface and who is affected. `Migration` lists ordered steps that name exact files, keys, commands, or symbols, and states how to confirm the migration worked."
- 500 단어 초과 시 탈락 처리 대안 (`SKILL.md:44`):
  > link source files or symbols instead of restating code, move rationale into an [Agent Note](../../notes/README.md), and turn repeated mechanical steps into a script or `dsh` command that the guide invokes.
- 문체: `dsh-prose-standard` 를 따른다 (`SKILL.md:46`).

### 단계 4. 중문 가이드 `guide.zh.md` 작성

- 입력: 완성된 `guide.md`.
- 행동: "Write the Chinese counterpart in the same change under the [bilingual pairing rules](../../../docs/AGENTS.md)" (`SKILL.md:46`). 섹션 제목은 `## 变更`, `## 迁移` 순서 (`SKILL.md:39`).
- 출력: `guide.zh.md`
- 통과 조건: `verify-upgrade-guides` 의 섹션 요건. 번역 품질 자체를 검증하는 단계는 `원문에 명시 없음`.

### 단계 5. 쌍 기록 생성

- 행동: `pnpm run verify-translation-pairing --write docs/upgrade-guide/v<version>/<item>/guide.md`
- 출력: `guide.i18n.yaml` (`SKILL.md:28`, `SKILL.md:46`).

### 단계 6. 검증 (게이트)

- 행동 (`SKILL.md:50-54`):
  1. `pnpm run verify-upgrade-guides`
  2. `pnpm run verify-translation-pairing docs/upgrade-guide/v<version>/<item>/guide.md`
  3. `pnpm run verify-md-links`
- 통과 조건: 세 명령 통과. 실패 시 행동 지시, 재시도 상한은 `원문에 명시 없음`.

### 루프 구조

- 명시된 재시도 루프·상한·수렴 조건: `원문에 명시 없음`.
- 암묵적 루프: 500 단어 초과 → 본문 축소·외부 링크/Agent Note/스크립트로 이동 → 재검증. (`SKILL.md:44` 의 대응 방법으로만 존재, 반복 횟수 규정 없음.)
- 이후 변경이 같은 표면을 건드릴 때마다 "update that guide in the same change" (`SKILL.md:32`) 로 재진입하는 수명 주기 루프.

### 사람 개입 지점

- 승인 요청·질문 라운드 지시: `원문에 명시 없음`. 에이전트가 단독 수행하도록 쓰여 있다.

## 6. 엔지니어링 규칙 분석

### 금지 규칙 (anti-pattern)

| 원문 | 막으려는 실패 모드 |
|---|---|
| "do not defer it to release preparation" (`SKILL.md:8`) | 릴리스 직전 몰아쓰기로 인한 누락·기억 상실 |
| "Never write a guide spanning more than one release." (`SKILL.md:32`) | 여러 버전의 delta가 섞인 가이드, 독자가 어느 버전에서 올라오는지 모호 |
| "no index, no attachments" (`SKILL.md:28`) | item 디렉터리에 부속 파일 증식 |
| "add a key only together with its gate check, then backfill every guide" (`SKILL.md:38`) | 게이트 검사 없는 frontmatter 키 추가로 가이드마다 스키마가 갈라짐 |
| 500 단어 초과 금지 → 코드 재서술 대신 링크 (`SKILL.md:44`) | 가이드가 코드·근거 설명으로 비대해지고 낡음 |
| 이전 버전 디렉터리 수정 금지: "guides in older version directories are frozen" (`SKILL.md:32`) | 이미 배포된 가이드를 사후 변경 |
| 내부 API용 가이드 금지 (`SKILL.md:20`) | 독자와 무관한 가이드 남발 |

### 강제 규칙 (수치·임계값)

| 항목 | 값 | 출처 |
|---|---|---|
| `guide.md` 최대 분량 | 500 words, frontmatter 포함 | `SKILL.md:40` |
| frontmatter 키 | 정확히 `kind: upgrade-guide` + 한 문장 `description` | `SKILL.md:38` |
| `#` 제목 수 | 1개 | `SKILL.md:39` |
| `guide.md` 섹션 | `## Change`, `## Migration` 정확히 이 순서 | `SKILL.md:39` |
| `guide.zh.md` 섹션 | `## 变更`, `## 迁移` 순서 | `SKILL.md:39` |
| item 디렉터리 파일 수 | 정확히 3개 (`guide.md`, `guide.zh.md`, `guide.i18n.yaml`) | `SKILL.md:28` |
| `<item>` 명명 | kebab-case | `SKILL.md:27` |
| 한 가이드가 다루는 릴리스 수 | 1 | `SKILL.md:32` |
| 검증 명령 수 | 3 (`SKILL.md:50-54`) | |
| 재시도 횟수·타임아웃·커버리지 % | `원문에 명시 없음` | |

### 검증 방식

- 구조 검증: `verify-upgrade-guides` (frontmatter, 섹션, 단어 수), 자동화.
- 번역 쌍 검증: `verify-translation-pairing`, 자동화.
- 링크 검증: `verify-md-links`, 자동화.
- 내용 정확성 검증 (실제 마이그레이션 단계가 동작하는지): 스킬은 `Migration` 이 "states how to confirm the migration worked" 하도록 가이드에 쓰라고 하지만 (`SKILL.md:42`), 에이전트가 그 단계를 실제로 실행해 확인하라는 지시는 `원문에 명시 없음`.
- 범위 판정(가이드가 필요한가)의 검증: 자기 판단. 자동 검증 지시 없음.
- 사람 확인: `원문에 명시 없음`.

### 도구 사용 규칙

- 지시된 도구: `pnpm run verify-upgrade-guides`, `verify-translation-pairing` (`--write` 모드 포함), `verify-md-links`.
- 반복 기계적 단계는 "turn repeated mechanical steps into a script or `dsh` command that the guide invokes" (`SKILL.md:44`).
- 금지 도구: `원문에 명시 없음`.

### 컨텍스트·토큰 규율

- 서브에이전트 위임·파일 읽기 범위·요약 지시: `원문에 명시 없음`.
- 간접적 분량 규율: 가이드 500 단어 제한, 근거는 Agent Note로 분리, 코드는 링크로 대체 (`SKILL.md:44`).

### 모호어의 조작적 정의

| 용어 | 환산 | 출처 |
|---|---|---|
| "externally perceptible surface" / "someone outside the repository can observe" | 5개 범주 목록 (CLI, 설정 키, 영속 데이터, SDK/와이어 API, 패키지 이름·진입점) | `SKILL.md:12-18` |
| "pre-stable internal APIs ... need no guide" | 소비자가 전부 같은 변경에서 갱신되는 경우 | `SKILL.md:20` |
| "version" `<version>` | 가이드 작성 시점의 루트 `package.json` `version` | `SKILL.md:26` |
| "as soon as the break is recognized" | 파괴적 변경을 도입하는 바로 그 변경 | `SKILL.md:8` |
| "concise"/분량 | 500 words (frontmatter 포함) | `SKILL.md:40` |
| "exact" 단계 | "name exact files, keys, commands, or symbols" | `SKILL.md:42` |
| "break" 자체의 정의 (어떤 변경이 breaking 인가의 기준) | 범주 목록 외 구체 판정 규칙 `원문에 명시 없음` | |
| "who is affected" 기술 수준 | `원문에 명시 없음` | |

## 7. 산출물

- 최종 결과물 형태: 파일 3개 (Markdown 2 + YAML 1), 모두 `docs/upgrade-guide/v<version>/<item>/` 아래.
  - `guide.md`: frontmatter(`kind: upgrade-guide`, `description`) + `# 제목` + `## Change` + `## Migration`, 500 단어 이하.
  - `guide.zh.md`: `## 变更`, `## 迁移`.
  - `guide.i18n.yaml`: `--write` 로 생성되는 쌍 기록. 내부 필드는 `원문에 명시 없음`.
- 출력 포맷 템플릿: `../dsh-doc/templates/upgrade-guide.md` ("Start from the upgrade-guide template", `SKILL.md:36`). 템플릿 내용은 이 스킬 폴더 밖이라 읽지 않음, `원문에 명시 없음`.
- 커밋·PR·브랜치 조작: 지시 없음. 단 "in the same change" 문구가 반복되어 (`SKILL.md:8`, `:32`, `:46`) 가이드가 기능 변경과 같은 변경에 포함되어야 함을 요구. 커밋 명령 자체는 `원문에 명시 없음`.
- 파괴적 동작:
  - 가이드 삭제: "delete the guide when the break is reverted" (`SKILL.md:32`). 유일한 삭제 지시.
  - force push, 마이그레이션 실행, 외부 데이터 변경: 없음. (스킬은 사용자 데이터를 직접 건드리지 않고, 가이드 문서만 쓴다.)

## 8. 주의점 / 한계 (여기서만 평가)

### 오작동·과잉작동 시나리오

- 과잉작동: 에이전트가 내부 리팩터링에도 "혹시 외부 관찰 가능" 이라 판단해 가이드를 남발할 수 있다. 판정 기준이 5개 범주 목록과 "all consumers updated" 문구뿐이고 경계 사례(예: 내부 API이지만 SDK에서 재노출)에 대한 규칙이 없다.
- 과소작동: description 이 "breaks" 에 초점을 맞춰 additive 변경(새 플래그 추가 등)은 트리거에서 빠지지만, 새 값이 기존 설정과 충돌하는 경우 같은 경계에 대한 규칙이 없다.
- 500 단어 제한 때문에 복잡한 마이그레이션에서 에이전트가 단계를 지나치게 압축하거나 모호하게 만들 위험. 원문은 우회로로 링크·Agent Note·스크립트만 제시한다.
- `<version>` 을 작성 시점 `package.json` 에서 읽도록 해서, rc 번호가 오르는 도중(예: `v0.1.7-rc.2` → `rc.3`)에 진행 중인 PR이 있으면 서로 다른 디렉터리에 가이드가 생길 수 있다. 원문은 그 경우의 처리 규칙이 없다.

### 다른 스킬·CLAUDE.md 충돌 가능 지점

- `dsh-prose-standard`, `dsh-doc`, `docs/AGENTS.md` 의 규칙이 이 스킬에 상속된다. 두 문서 규칙이 어긋날 때의 우선순위는 `원문에 명시 없음`.
- 사용자 CLAUDE.md 가 커밋 시점이나 문서 언어를 다르게 지정하면(예: 중문 불필요) "bilingual" 요구와 충돌할 수 있다.

### 검증 공백

- 범위 판정(가이드 필요 여부)은 자동 검증 없음. 가이드 누락은 `verify-*` 스크립트가 잡는지 `원문에 명시 없음`.
- `Migration` 단계가 실제로 동작하는지 실행 검증하라는 지시 없음. 검증 3종은 모두 형식·링크·번역 쌍 수준.
- 중문 번역의 의미 정합성은 쌍 기록(`guide.i18n.yaml`)에 의존하며, 의미 검증 방식은 `원문에 명시 없음`.
- 실패 시 재시도 상한·에스컬레이션 규정 없음.

### 유지보수 리스크

- 스킬이 상대 경로 5곳(`../../../docs/...`, `../dsh-doc/...`, `../../notes/...`, `../dsh-prose-standard/...`)에 의존. 스킬 폴더만 단독 복사하면 링크가 끊긴다 (`verify-md-links` 대상일 가능성은 있으나 원문에 명시 없음).
- 스크립트명 `verify-upgrade-guides`, `verify-translation-pairing`, `verify-md-links` 와 예시 버전 `v0.1.7-rc.2` 가 하드코딩. 스크립트 개명 시 스킬이 낡는다.
- frontmatter 확장 규칙("add a key only together with its gate check, then backfill every guide")은 스킬 본문과 검증 스크립트가 동기화되어야 함을 뜻한다.

### 한 줄 판정

- **조건부 (deepseek-harness 저장소 한정 도입 권장)**: 형식·위치·분량·번역 쌍을 자동 검증 3종으로 못 박아 문서 규율은 강하지만, 이 저장소의 `docs/` 구조와 `pnpm` 스크립트가 전제라 다른 저장소에서는 그대로 쓸 수 없다.
