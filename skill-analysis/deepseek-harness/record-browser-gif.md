# record-browser-gif 분석

## 1. 개요

- 원본 경로: `/Users/kkh/Desktop/skills-analize/deepseek-harness/record-browser-gif/`
- 컬렉션: deepseek-harness
- 읽은 파일 전체 (디렉터리 재귀 탐색 결과, 3개가 전부. `references/`, `templates/`, `assets/` 디렉터리는 존재하지 않음):

| 파일 | 크기(바이트) | 줄 수 | 역할 |
|---|---|---|---|
| `SKILL.md` | 16540 | 172 | 핵심 파일. 스테이징 → 녹화 → 인코딩 → 검증 → 게시 절차와 규칙 전부 |
| `scripts/encode_gif.py` | 12988 | 337 | 결정적 GIF 인코더. WebM 비디오 또는 스크린샷 디렉터리를 ffmpeg로 GIF로 변환하고 결과를 검증, JSON 요약 출력 |
| `scripts/test_encode_gif.py` | 4726 | 103 | 인코더 단위 테스트 (unittest, 실제 ffmpeg/ffprobe 서브프로세스 사용) |

- SKILL.md가 참조하지만 이 디렉터리에 없는 파일: `../../notes/implemented/process/2026-08-08-browser-gif-evidence-chain.md` (SKILL.md:10). 읽지 못함. 원문에 내용 없음.
- 성격 한 줄: 생성(construction) 스킬 (브라우저 데모 GIF 산출) + 검증(verification) 요소(증거 사슬, 인코더 사후 검증) + 게시(publication) 단계. 라우팅 스킬은 아님.
- 원문 자기 규정:
  > Produce a short, truthful UI demonstration as a local GIF, and — only when the task includes attaching it to a pull request — publish it through the attach workflow at the end of this skill. (`SKILL.md:8`)
- 특징: 일반 스킬이 아니라 특정 리포지토리(DSH_HOME, `pnpm run build:web`, `apps/web/package.json`, `.playwright-mcp/`)에 묶인 프로젝트 전용 스킬이다. 이는 본문 곳곳의 경로 인용으로 확인된다.

## 2. 활성화 조건 (언제 켜지는가)

### frontmatter description 전문

> Record browser or Web UI interaction demos as optimized GIFs using the available browser-control workflow, optional Playwright Videos for higher capture frame rates, and deterministic encoding, then attach the GIF to a pull request with `gh --attach`, falling back to a dedicated assets branch where attach cannot apply. Use when asked to make, record, or generate a GIF that demonstrates a browser workflow, and for every pull request that changes product-user-visible GUI behavior, which MUST include a GIF recorded from the pull request's real server and model flow.

### 트리거 구성

description에 두 갈래 트리거가 있다.
1. 요청 기반: "Use when asked to make, record, or generate a GIF that demonstrates a browser workflow"
2. 상태 기반(자동·의무): "for every pull request that changes product-user-visible GUI behavior" — 본문에서도 반복된다.
   > A pull request that changes product-user-visible GUI behavior MUST include a demonstration GIF recorded with this skill and embedded in the pull request body via the attach workflow. (`SKILL.md:14`)

### 매칭되는 실제 사용자 발화 예시 (트리거 사전 추출)

원문에 발화 예시 목록은 없음. 아래는 description의 동사·명사 (make / record / generate / GIF / browser workflow / pull request / GUI)에 매칭되는 표현을 정리한 것이다.

1. "이 브라우저 플로우를 GIF로 녹화해줘" (record + GIF + browser workflow)
2. "Make a GIF that demonstrates the new settings dialog" (make + GIF)
3. "Generate a GIF of the login flow in the web UI" (generate + GIF + Web UI)
4. "이 PR에 데모 GIF 붙여줘" (attach GIF to pull request)
5. "GUI를 바꾸는 PR을 올릴 건데 데모 넣어야 해" (PR that changes product-user-visible GUI behavior)
6. "Record the chat UI interaction and attach it to PR #123 with gh --attach"
7. "웹 UI 인터랙션 데모를 최적화된 GIF로 만들어줘" (optimized GIF)

### 의도적으로 배제되는 발화 / 넘길 스킬

- 원문에 다른 스킬로 넘기라는 라우팅 규칙은 없음. 다른 스킬 이름을 지목하는 문장이 SKILL.md에 없다.
- 본문이 스스로 적용 범위를 줄이는 조건:
  - 게시 단계는 PR 첨부가 요청에 포함될 때만:
    > Perform this step only when the task includes attaching the GIF to a pull request. (`SKILL.md:118`)
  - PR 첨부가 없으면 검증 4단계에서 종료:
    > When the task does not include attaching the GIF to a pull request, stop here. (`SKILL.md:112`)
- 비-GUI 변경 PR(백엔드만 변경 등)은 "product-user-visible GUI behavior" 조건에 해당하지 않아 의무 대상이 아니다 (조건 문장 반대해석. 원문에 별도 명시 없음).

### frontmatter 필드

- `name`: record-browser-gif
- `description`: 위 인용
- `allowed-tools`, `model`, `metadata` 등 그 외 필드: 없음 (`SKILL.md:1-4`는 name과 description 두 줄뿐).

## 3. 적합 / 부적합

### 적합

- 웹 UI 변경 PR을 올리는 리포지토리 (본문 기준: pnpm 빌드, `apps/web`, 실제 서버·실제 API 키·실제 모델 라운드가 있는 앱).
- PR 리뷰어에게 "정확히 무엇이 증명되는지"를 커밋 SHA와 함께 보여주고 싶은 팀:
  > state the exact demonstrated commit SHA, the tree and origin that served it, any mode flags or browser-state exceptions, and whether a real model round ran (`SKILL.md:16`)
- 브라우저 제어 워크플로우(browser-control workflow)가 이미 준비된 환경. 본문은 "The available browser-control workflow remains preferred"라고 한다 (`SKILL.md:8`).
- `gh` v2.99.0 이상, github.com 리포지토리 (첨부 경로).

### 부적합 / 과함

- 이 리포지토리 구조가 아닌 곳: `pnpm run build && pnpm run build:web`, `DSH_HOME`, `DSH_AGENTS_HOME`, `apps/web/package.json`, `.playwright-mcp/`가 하드코딩되어 있어 그대로는 적용 불가 (`SKILL.md:29, 30, 38, 42`).
- 실제 API 키 / 모델 호출이 불가능한 환경: 원문은 대체(fixture) 금지, 한계를 보고하라고만 한다.
  > If credentials or the server are unavailable, report that limitation instead of substituting a fixture. (`SKILL.md:22`)
  따라서 키가 없으면 의무 GIF를 만들 수 없는 상태로 끝난다.
- GitHub Enterprise Server: `--attach` 미지원 (`SKILL.md:124`). 폴백 브랜치 경로를 써야 한다.
- 영상이 필요 없는 변경(문서·내부 리팩터링 등): 트리거 조건 외.
- 형제 스킬: 원문에 형제 스킬 언급 없음.
- 형제 스킬 대신 이걸 고르는 판정 기준 한 줄: "브라우저 상호작용을 GIF 아티팩트로 남기거나 GUI 변경 PR에 증거를 첨부해야 하면 이 스킬" (원문에 대조 스킬 없음, 판정은 description 조건에서 환산).

## 4. 전제 조건과 외부 의존성

### 실행 스크립트 / 런타임

- 스크립트 있음: `scripts/encode_gif.py` (Python 3, 표준 라이브러리만 import: argparse, json, math, shutil, subprocess, tempfile, pathlib, typing — `encode_gif.py:6-13`). pip 패키지 불필요.
- 필수 바이너리:
  > Require `python3`, `ffmpeg`, and `ffprobe`. If a media binary is missing, report the dependency instead of installing software without authorization. (`SKILL.md:80`)
  코드도 `shutil.which`로 확인 후 없으면 `fail(f"required binary {name!r} is not available on PATH")` (`encode_gif.py:70-75`).
- 녹화 측: Playwright. 브라우저 제어 워크플로우가 `recordVideo`를 노출하면 그것을 쓰고, 아니면 스크린샷. 브라우저 제어가 불가할 때만 리포지토리 선언 Playwright 사용:
  > it resolves from `apps/web/package.json`; do not install another driver or open the user's browser. (`SKILL.md:38`)
- 앱 빌드: `pnpm run build && pnpm run build:web` (`SKILL.md:29`).
- 게시 측: `gh` v2.99.0+ (`SKILL.md:124`), `git` (폴백 시 clone / switch --orphan / push), github.com, 쓰기 권한.

### API 키 / 환경변수 / 네트워크

- API 키 필요(의무 GIF 경우): "a real API key, and real model rounds" (`SKILL.md:16`). 키는 루트 `.env`에서 앱의 일반 경로로 로드:
  > Source the root `.env` for the API key through the application's normal path; never echo the key. (`SKILL.md:30`)
- 환경변수: `DSH_HOME`, `DSH_AGENTS_HOME` (fresh scratch 값), `GIF_SKILL_DIR` (인코더 경로, 별도 줄에서 export — `SKILL.md:80`).
- 네트워크: 실제 모델 API 호출, `gh` 업로드, 업로드 URL fetch 및 GitHub Markdown API 렌더 확인에 필요. 로컬 인코딩 자체는 네트워크 불필요 (코드에 네트워크 호출 없음).

### 리포지토리 전제

- 깨끗한 worktree: "Require a clean worktree, record its exact commit with `git rev-parse HEAD`" (`SKILL.md:29`).
- 커밋 권한: 녹화 단계는 원격 변경 없음. 게시 단계에서 PR body 편집 권한 / 폴백 시 assets 브랜치 push 권한.
- `.playwright-mcp/` 디렉터리가 gitignore되어 있어야 함: "the repository's gitignored `.playwright-mcp/` directory" (`SKILL.md:42`). 검증 3단계에서 `git status --short`로 확인.
- 테스트 러너/CI/린터/타입: 앱 빌드 외 요구 없음. 인코더 테스트는 CI에서 안 돈다:
  > These local media tests do not run in repository CI. (`SKILL.md:114`)

### 비용 발생 지점

- 유료 모델 API 호출 (실제 모델 라운드). 길어지면 중단하라는 규칙:
  > Stop an unnecessarily long real-API run after the demonstrated state is visible. (`SKILL.md:74`)
- CI 분 소모 없음 (테스트가 CI에서 안 돔). 금액 수치는 원문에 명시 없음.

### 상태 파일 / 산출물 디렉터리

- `.playwright-mcp/<run directory>`: 스크립트, 원본 비디오, 타이밍 노트, QA 프레임, GIF 저장 ("Create the run directory first." `SKILL.md:42`). 구체적 하위 이름 규칙은 원문에 명시 없음 (`videos` 하위 디렉터리는 예제 코드에 나옴 `SKILL.md:56`).
- 스크린샷 프레임 파일명: `00-initial.png`, `01-typed.png` 등 (`SKILL.md:97`).
- 폴백 시 임시 clone: `/tmp/assets-checkout` (`SKILL.md:152, 160`).
- 스크래치 DSH 상태 디렉터리: 경로 원문에 명시 없음 ("fresh scratch").

## 5. 워크플로우

순서 강제 문구: "stage per pull request" (`SKILL.md:27`), 번호 목록 1~4 (스테이징), 번호 목록 1~4 (검증). "run in order"/"do not skip" 같은 명시 문구는 원문에 없음. 단계 간 의존은 본문 구조와 게이트 문장으로 암시된다.

범례: [게이트] = 통과 못 하면 중단/재수행.

### 단계 0. 요구 판정

- 입력: 사용자 요청 또는 PR 변경 내용.
- 행동: 요청이 GIF 생성인지, PR이 GUI 행동을 바꾸는지 판단. PR 첨부 포함 여부 판단.
- 출력: 녹화만 할지, 게시까지 할지 결정.
- 통과 조건: 원문에 명시 없음 (판단 기준은 "product-user-visible GUI behavior").

### 단계 1. 앱 스테이징 (SKILL.md:25-32)

1. [게이트] 깨끗한 worktree 요구 → `git rev-parse HEAD` 기록 → `pnpm run build && pnpm run build:web`.
   - 근거: "A GIF recorded against another commit's build misattributes the evidence."
   - 탈락 시: 원문은 dirty worktree 처리 방법을 명시하지 않음 ("Require"만 있음).
2. 포트당 서버 1개를 해당 트리에서 부팅. fresh scratch `DSH_HOME`, `DSH_AGENTS_HOME`, workspace, session state. 브라우저도 fresh isolated context/profile; 불가하면 해당 origin의 쿠키·사이트 스토리지 삭제 후 이동.
3. [게이트] 한 스토리보드 = 한 증거 실행. 
   > If capture automation fails, discard its frames and rerun from fresh roots; never splice frames from separate runs.
4. PR을 바꿀 때 이전 서버는 PID 또는 명령줄 정확 일치로 종료:
   > A broad `pkill -f` pattern can match and kill the shell that launched it — including your own.

### 단계 2. 녹화 준비 (SKILL.md:34-42)

- 입력: 스테이징된 서버.
- 행동: origin, 빌드/개발 서버, 전송 방식(transport), 모드 오버라이드를 식별. 네이티브 표면이 자동화 불가이면 공식 브라우저 운영 가능 프로덕션 백엔드를 일반 앱 설정으로 선택하고 오버라이드를 공개.
- 출력: 캡처 노트에 기록할 조건.
- 통과 조건: 원문에 명시 없음.
- 도구 선택 순서(분기):
  - 브라우저 제어 워크플로우가 `recordVideo` 노출 → 같은 컨텍스트에서 비디오 활성화
  - 아니면 스크린샷 캡처
  - 브라우저 제어 자체가 불가 → 리포지토리 선언 Playwright, 격리 헤드리스 브라우저, 캡처 노트에 폴백 명시

### 단계 3. 흐름 녹화 (SKILL.md:44-76)

- 입력: 시나리오.
- 행동:
  - `viewport`와 `recordVideo.size` 일치 지정 (기본 800×800으로 축소되어 텍스트 판독 불가 방지).
  - 예제 크기 `{ width: 1440, height: 900 }`.
  - 3~6개 의미 있는 상태의 짧은 스토리.
  - 고유 시맨틱 로케이터 대기, 접근 가능한 이름 동등은 `exact: true`.
  - 고정 대기는 읽기 홀드 용도로만 허용: "Fixed waits may provide a reading hold after the state is verified, but never establish readiness."
  - 도구 호출·거부·복구를 보일 때는 상세/trajectory를 열어 도구 정체성, 상태 또는 안정적 에러 코드, 하위 결과가 영상에 보이게 함.
  - 모델에게 짧은 final sentinel을 주어 완료를 고정.
- 출력: 원본 `demo.webm`.
- [게이트] `await context.close()` 후에 `video.saveAs()` 또는 인코딩: "closing only the browser does not guarantee the video's flush."
- 규칙: 페이지마다 자체 비디오; 시연 페이지를 명시 선택, 무관 페이지/실행 연결 금지. "Failed runs are diagnostic only."
- 안전: 비밀·개인정보·무관 탭·알림 캡처 금지. 선택 구간 전체(중간 상태 포함) 검토. 한 뷰포트 유지.

### 단계 4. GIF 인코딩 (SKILL.md:78-105, encode_gif.py)

- 입력: WebM 파일 또는 스크린샷 디렉터리.
- 행동 (비디오): `python3 "$GIF_SKILL_DIR/scripts/encode_gif.py" in.webm out.gif --start 2 --end 32 --speed 2 --final-hold 3 --fps 10 --max-width 1200 --colors 128`.
- 행동 (스크린샷): `... frames out.gif --durations 1.5,1.5,1.5,3.5 --fps 10 --max-width 1200 --colors 128`.
- 출력: GIF + JSON 요약.
- [게이트] 인코더 내부 검증 (6장 표 참조): 구간 오류, 2프레임 미만, 덮어쓰기, 기간 오차, 폭 초과, 프레임 < 2, 바이트 초과 시 `error:`와 함께 종료.
- 탈락 시 지시: "Reduce `--max-width`, then `--colors` or `--fps` for a large artifact; preserve readable text. Use `--force` only after resolving the exact output path." (`SKILL.md:93`)
- 공개 의무: "`--speed` changes playback speed; disclose it and the selected interval beside the GIF so the demo cannot imply measured response latency."

### 단계 5. 산출물 검증 (SKILL.md:107-114)

1. JSON 요약 확인: 출력 경로, 소스 구간과 속도(또는 스크린샷 수), 인코딩 프레임 수, 치수, 길이, 바이트.
2. [게이트] 인코딩된 GIF 자체를 시각 확인 (소스 프레임이 아니라). 뷰어가 첫 프레임만 그리면 `ffmpeg`로 대표 프레임 디코드 후 확인. 확인 항목: 전환 판독성, 마지막 상태 홀드 충분, 민감 정보 없음.
3. `git status --short`로 원본 비디오·QA 프레임·아티팩트가 무시 경로에만 있음을 확인.
4. 절대 경로 GIF 반환, 지원되면 렌더, 실제 API / fixture / 기타 전송 중 무엇인지 진술. PR 첨부 없으면 여기서 종료.

### 단계 6. 게시: gh --attach (SKILL.md:120-141) — PR 첨부 포함 시에만

- 입력: 검증된 GIF, body 파일.
- [게이트] 사전 조건: `gh` v2.99.0+, github.com, 쓰기 권한, GIF <= 10 MB. 초과 시: "shrink it with `--max-width`, then `--colors` or `--fps`, before attaching."
- 행동: body 파일에 `![<alt text>](<path/to/demo.gif>)` 로컬 경로 참조 작성 → `gh pr create --body-file <body.md> --attach <path/to/demo.gif>` 또는 `gh pr edit <pr> --body-file <body.md> --attach <path/to/demo.gif>`.
- [게이트] 첨부 직전: 시연 PR의 라이브 head를 다시 읽어 GIF 옆에 기록한 커밋과 비교.
  > Stop and re-record when it moved.
- [게이트] 첨부 후: head가 여전히 기록 커밋인지 재확인, 라이브 body에서 참조가 업로드 URL로 바뀌었는지 확인, GitHub Markdown API로 렌더해 `<img>` 확인, 업로드 URL을 한 번 fetch해 `200` 및 `image/gif` 확인.
- 규칙: `--attach`는 반복 가능하나 같은 파일 두 번은 거부. body가 참조하지 않는 GIF는 끝에 추가되며 `--attach '<path>#<alt text>'`로 alt 지정.
- 툴링 PR 예외: 다른 PR의 라벨 붙은 예시 임베드 가능하되 원본 PR 이름을 쓰고 그 live head와 비교. "Never attribute the example to the tooling branch."

### 단계 7. 게시 폴백: assets 브랜치 (SKILL.md:143-172)

- 사용 조건 (이때만): GIF가 10 MB 초과, `gh` < v2.99.0, 또는 github.com 아님.
- 브랜치: 부모 없는 orphan 브랜치, 미디어만 보관, 시리즈당 하나, 이름 `<series>-assets`; 조회 `git ls-remote --heads origin '*assets*'`.
- [게이트] push 전: assets 브랜치가 미디어만 포함하는지, 스테이징된 GIF의 체크섬이 검증된 로컬 아티팩트와 일치하는지 확인.
- 기존 브랜치: `git clone --branch <assets-branch> --single-branch --depth 1 <repo-url> /tmp/assets-checkout` → `cp` → `git add` → `git commit -m "assets: <what it shows> gif (#<pr>)"` → `git push origin <assets-branch>`.
- 신규 시리즈: `git clone --depth 1 <repo-url> /tmp/assets-checkout` → `git switch --orphan <assets-branch>` → 추가·커밋·push.
- [게이트] push 후: 인증된 GitHub API/raw 요청으로 원격 경로, 바이트 크기, 체크섬, `200`, `image/gif` 확인. "An anonymous `404` does not disprove a private-repository asset."
- [게이트] body 편집 직전/직후: head 재확인(단계 6과 동일), Markdown API로 `<img>` 확인.
- 임베드 형식: `![<alt text>](https://github.com/<owner>/<repo>/blob/<assets-branch>/<name>.gif?raw=true)` — `?raw=true` 필수.

### 루프 구조

- 명시적 재시도 상한 숫자: 원문에 명시 없음.
- 재수행 루프: 캡처 자동화 실패 → 프레임 폐기 → 신규 root에서 재실행 (횟수 제한 없음). PR head 이동 → 재녹화.
- 크기 초과 루프: `--max-width` → `--colors` → `--fps` 순으로 낮춤 (루프 상한 명시 없음).

### 사람 개입 지점

- 명시적 질문/승인 라운드: 원문에 명시 없음.
- 인간 관련 문구: "Existing user browser state remains an explicit isolation exception" (`SKILL.md:36`); 도구 미설치 시 "without authorization" 설치 금지 (`SKILL.md:80`) — 설치하려면 승인이 필요하다는 함의. 사용자가 명시적으로 fixture를 요청한 경우만 fixture 허용 ("unless the user explicitly asked for a fixture recording" `SKILL.md:16`).

## 6. 엔지니어링 규칙 분석

### 금지 규칙 (anti-pattern) 및 막으려는 실패 모드

| 원문 금지 | 출처 | 막으려는 실패 모드 |
|---|---|---|
| "Never substitute fixture queries, mock transports, synthetic event injection, or test-only hooks unless the user explicitly asked for a fixture recording." | `SKILL.md:16` | 모킹된 GIF를 실제 동작 증거처럼 제출 |
| "Never read or expose credential values." | `SKILL.md:23` | API 키 유출 (영상·로그·채팅) |
| "never echo the key" | `SKILL.md:30` | 키 노출 |
| "never splice frames from separate runs" / "do not concatenate unrelated pages or runs" | `SKILL.md:31, 70` | 서로 다른 실행의 프레임을 이어붙여 가짜 연속성 생성 |
| "do not splice separate runs or synthesize missing states" | `SKILL.md:91` | 존재하지 않은 상태 합성 |
| "A broad `pkill -f` pattern can match and kill the shell that launched it" (정확 일치 요구) | `SKILL.md:32` | 자기 셸 종료 |
| "do not install another driver or open the user's browser" | `SKILL.md:38` | 임의 설치, 사용자 브라우저 침범 |
| "report the dependency instead of installing software without authorization" | `SKILL.md:80` | 무승인 소프트웨어 설치 |
| "Never commit a GIF to the pull request's own branch or any branch that merges into a long-lived branch" | `SKILL.md:120` | 이진 미디어로 리포지토리 히스토리 팽창 |
| "Never attribute the example to the tooling branch." | `SKILL.md:132` | 증거 출처 오귀속 |
| "Never delete or rewrite an assets branch, and never force-push it" | `SKILL.md:172` | 병합된 PR 본문의 이미지 URL 영구 깨짐 |
| "Fixed waits ... never establish readiness" | `SKILL.md:72` | 타이밍 의존으로 인한 불안정 녹화 |
| "Capture no secrets, personal data, unrelated tabs, or notifications." | `SKILL.md:76` | 민감정보 유출 |
| "increasing it cannot recover motion that the source recording did not capture" (fps 설명) | `SKILL.md:91` | fps 상향으로 부드러움이 생긴다는 오해 |
| Recording "never mutates remote state" | `SKILL.md:20` | 녹화 단계의 부작용 |

### 강제 규칙: 수치·임계값 (표)

| 항목 | 값 | 출처 |
|---|---|---|
| 스토리 상태 수 | three to six meaningful states | `SKILL.md:72` |
| 스크린샷 수 | three to six verified states; 디렉터리 입력은 최소 2프레임 | `SKILL.md:97, 105`; `encode_gif.py:244` |
| 예제 뷰포트/녹화 크기 | 1440×900 | `SKILL.md:53` |
| Playwright 기본 축소 한도 | 800×800 | `SKILL.md:46` |
| 예제 인코딩 인자 | `--start 2 --end 32 --speed 2 --final-hold 3 --fps 10 --max-width 1200 --colors 128` | `SKILL.md:87-88` |
| 스크린샷 예제 durations | 1.5,1.5,1.5,3.5 | `SKILL.md:102` |
| 비디오 기본값 | 시작 0, 끝 EOF, 속도 1×, final hold 2초 | `SKILL.md:91`; `encode_gif.py:223-226` |
| 스크린샷 기본 홀드 | 프레임당 2초 | `encode_gif.py:165, 248` |
| `--fps` 기본/상한 | 기본 10, 30 초과 거부 | `encode_gif.py:170, 210` |
| `--max-width` 기본 | 1200 | `encode_gif.py:174` |
| `--colors` 기본/범위 | 128, 4~256 | `encode_gif.py:180, 208` |
| `--max-bytes` 기본 | `5 * 1024 * 1024` (5 MiB) | `encode_gif.py:16` |
| 첨부 크기 한도 | at or below 10 MB | `SKILL.md:124` |
| `gh` 최소 버전 | v2.99.0 | `SKILL.md:124` |
| 선택 구간 최소 길이 | `(end - start) / speed >= 2 / fps` (final hold 이전) | `encode_gif.py:229` |
| 길이 허용 오차 | `max(0.2, 2 / fps)` 초 | `encode_gif.py:306` |
| 인코딩 프레임 최소 | 2 (미만이면 "expected an animated GIF") | `encode_gif.py:311` |
| 디더링 | `dither=bayer:bayer_scale=3:diff_mode=rectangle` | `encode_gif.py:276` |
| 팔레트 | `palettegen=max_colors=N:stats_mode=full` | `encode_gif.py:272` |
| 스케일 | `scale='min(W,iw)':-2:flags=lanczos` (확대 안 함, 높이 짝수) | `encode_gif.py:271` |
| 루프 | `-loop 0` (무한 반복) | `encode_gif.py:286-287` |
| ffmpeg 로그 레벨 | `error` | `encode_gif.py:281-282` |
| 시연 PR head 재확인 횟수 | 첨부 전·후 (각 1회 이상) | `SKILL.md:134, 141, 164` |

### 검증 방식

무엇을 근거로 "됐다"고 판정하는가:
- 코드가 하는 기계 검증 (`encode_gif.py`): 출력이 `.gif` 확장자, 덮어쓰기 거부(`--force` 없으면), 입력과 출력 경로 동일 금지, 트림 범위 `0 <= start < end <= source_duration`, 최소 2프레임, 인코딩 후 `ffprobe`로 폭·프레임 수·기간·바이트 확인.
- 사람/에이전트 시각 확인: "Visually read the encoded GIF itself, not only the source frames." (`SKILL.md:110`) — 이는 에이전트의 자기 판단이며 자동화된 임계값 없음. 판독성·홀드 충분성의 수치 기준은 원문에 명시 없음.
- 증거 사슬 검증: 라이브 PR head를 커밋 SHA와 비교 (외부 상태 조회, 기계 검증 가능).
- 게시 검증: 라이브 body 재읽기, GitHub Markdown API 렌더에서 `<img>`, 업로드 URL `200` + `image/gif`, 폴백 시 체크섬·바이트 크기 대조.
- 코드 테스트: `python3 -m unittest discover -s "$GIF_SKILL_DIR/scripts" -p 'test_*.py' -v` (인코더 유지보수용). 테스트 내용:
  - `test_video_trim_speed_final_hold_and_palette_order`: 빨강/초록/파랑 2초씩 6초 영상을 `--start 1 --end 5 --speed 2 --final-hold 1 --max-width 32`로 인코딩, 기간 3초(delta 0.2), 크기 (32, 24), 0.1초 빨강 / 0.8초 초록 / 2.7초 파랑 픽셀 확인.
  - `test_video_defaults_keep_full_duration`: 기본값에서 기간 8초(6+2 hold) 및 7.7초 파랑.
  - `test_invalid_video_options_do_not_write_output`: `--start -1`, `--speed nan`, `--final-hold inf`, `--start 3 --end 3`, `--end 7`, `--speed 1000`, `--durations 2`, `--pattern *.png` 모두 비정상 종료 + `error:` + 출력 파일 없음.
  - `test_screenshot_durations_and_video_flag_rejection`: PPM 2프레임, 영상 플래그 거부("require a video file"), 잘못된 `--pattern`/`--durations` 거부, `0.5,1.5` 성공 및 프레임 수 2.
  - `test_overwrite_and_size_limit`: 기존 출력 보존, `--max-bytes 1`이면 "above --max-bytes".
- 이 테스트들은 CI에서 실행되지 않음 (`SKILL.md:114`). 즉 인코더 회귀는 로컬 수동 실행에 의존.
- 자기 진술에 의존하는 부분: 민감 정보 부재 확인, 시나리오의 "meaningful" 판단, 복구/에러 상태가 화면에 보였는지.

### 도구 사용 규칙

- 선호 도구 순서: 사용 가능한 browser-control workflow → (recordVideo 지원 시) 비디오, 아니면 스크린샷 → 브라우저 제어 불가 시 리포지토리 선언 Playwright (헤드리스).
- 인코딩: `ffmpeg`/`ffprobe`는 `encode_gif.py`를 통해서만 사용하도록 안내 (직접 ffmpeg 호출은 GIF 디코드 확인 시에만 언급).
- 게시: `gh pr create/edit --attach` 우선, 폴백으로 `git`.
- 금지 도구/명령: `pkill -f` 광범위 패턴(경고), 새 드라이버 설치, 사용자 브라우저 열기, `--force` 무조건 사용(경로 확인 후에만).
- 환경 설정 규칙: `GIF_SKILL_DIR`는 별도 줄에서 export ("an inline assignment cannot affect argument expansion in the same command").

### 컨텍스트·토큰 규율

- 파일 읽기 범위, 서브에이전트 위임, 요약·압축 지시: 원문에 명시 없음.
- 유일한 비용 규율은 실제 API 실행 중단: "Stop an unnecessarily long real-API run after the demonstrated state is visible."
- 시각 검증 시 "decode representative frames" (전체 프레임이 아닌 대표 프레임) 권고 (`SKILL.md:110`).

### 모호어의 조작적 정의

| 모호어 | 원문 환산 |
|---|---|
| "truthful" | 같은 서버·상태·워크스페이스·세션·모델 실행에서 나온 프레임만, 실제 서버/API/모델, 노출할 조건(SHA, 트리, origin, 모드 플래그, 모델 라운드 여부) 명시 (`SKILL.md:16, 31`) |
| "optimized" | `--max-width` → `--colors` → `--fps` 순으로 줄여 10 MB(첨부) 또는 `--max-bytes`(기본 5 MiB) 이하 |
| "short story" | 3~6 상태 (`SKILL.md:72`). 초 단위 상한은 원문에 명시 없음 (예제 구간 2~32초 = 30초, 규칙 아님) |
| "product-user-visible GUI behavior" | 환산 규칙 없음. 원문에 명시 없음 |
| "meaningful states" | 환산 규칙 없음 |
| "readable text" | 수치 기준 없음. 800×800 축소 방지, 1440×900 예제만 있음 |
| "legible" / "held long enough" | 수치 기준 없음 (예제 마지막 홀드 3초 또는 3.5초는 예시일 뿐) |
| "benign demonstration prompt" | 환산 규칙 없음 |
| "real" | 실제 서버(PR 브랜치 트리에서 빌드), 실제 API 키, 실제 모델 라운드로 환산 |
| "stable error code" | 환산 규칙 없음 |
| "unnecessarily long" | 환산 규칙 없음 |

## 7. 산출물

### 최종 결과물 형태

- 로컬 GIF 파일 (`.playwright-mcp/` 하위 무시 경로) + 인코더의 JSON 요약:
  ```
  output, (sourceVideo, sourceDurationSeconds, startSeconds, endSeconds, speed, finalHoldSeconds | sourceFrames),
  encodedFrames, width, height, durationSeconds, fps, bytes
  ```
  (`encode_gif.py:318-333`, `indent=2, sort_keys=True`)
- 에이전트의 최종 응답: GIF 절대 경로, 렌더 가능하면 렌더, 녹화가 real API / fixture / 기타 전송인지 진술 (`SKILL.md:112`).
- PR 첨부 시: PR body에 GIF 임베드 + 옆에 공개 정보:
  - 정확한 시연 커밋 SHA
  - 서빙한 트리와 origin
  - 모드 플래그 및 브라우저 상태 예외
  - 실제 모델 라운드 실행 여부
  - 재생 속도(`--speed`)와 선택 구간 (`SKILL.md:91`)
- 보조 산출물: 원본 WebM (QA용 보존: "Keep the original WebM for QA"), QA 프레임, 스크립트, 타이밍 노트.

### 출력 포맷 강제 템플릿

- 마크다운 임베드 (attach): `![<alt text>](<path/to/demo.gif>)`
- 마크다운 임베드 (assets 브랜치): `![<alt text>](https://github.com/<owner>/<repo>/blob/<assets-branch>/<name>.gif?raw=true)`
- assets 커밋 메시지: `assets: <what it shows> gif (#<pr>)`
- PR body 안 공개 정보의 고정 문안/양식: 원문에 명시 없음 (항목만 나열).

### 커밋 / PR / 브랜치 조작과 파괴적 동작

- 녹화 단계: 원격 변경 없음.
- 게시 단계(PR 첨부 시): `gh pr create` 또는 `gh pr edit` (PR body 수정 = 원격 상태 변경). GIF는 GitHub에 업로드됨 (브랜치에 커밋되지 않음).
- 폴백: orphan assets 브랜치 생성·push, 기존 assets 브랜치에 커밋 append. 임시 clone을 `/tmp/assets-checkout`에 생성.
- 파괴적 동작: 서버 프로세스 종료(PID/정확 매칭), `--force` 덮어쓰기 옵션, 쿠키·사이트 스토리지 삭제(격리 컨텍스트 불가 시). 원문은 assets 브랜치 삭제·재작성·force-push를 금지.
- 파일 삭제 명령, 마이그레이션: 원문에 명시 없음.
- 워크트리: PR 브랜치에 아무것도 커밋하지 않음 (`SKILL.md:21`: "It never touches the pull request's own branch.").

## 8. 주의점 / 한계 (여기서만 평가)

### 오작동 / 과잉작동 시나리오

1. 의무 조항과 키 부재의 충돌. "MUST include a GIF"인데 실제 API 키가 없으면 fixture 대체가 금지되어 있다. 에이전트는 "한계를 보고"하는 선에서 멈추게 되며, 그 PR이 머지 가능한지에 대한 원문 규칙은 없다. 사람 개입 없이는 해소되지 않는다.
2. "product-user-visible GUI behavior" 경계가 모호하다. CSS 미세 조정이나 접근성 속성 변경까지 의무 대상인지 판단 기준이 없어, 에이전트가 과잉 녹화(비용 발생 실제 모델 호출)를 하거나 반대로 누락할 수 있다.
3. 실제 모델 라운드 의무는 비결정성을 만든다. 모델 응답이 매번 다르므로 "한 번의 깨끗한 실행"이 나올 때까지 재녹화가 반복될 수 있고, 재시도 상한이 없어 비용이 무제한으로 커질 수 있다.
4. 첨부 직전 head 비교 규칙 때문에, 리뷰 피드백으로 PR에 커밋이 하나만 추가되어도 GIF 전체를 재녹화해야 한다. 의도적인 엄격함이지만 반복 비용이 크다.
5. 인코더 기본 `--max-bytes`는 5 MiB, 첨부 한도는 10 MB로 서로 다르다. 5 MiB 초과 GIF는 인코더가 실패로 처리하므로, SKILL.md가 허용하는 5~10 MB 구간에 도달하려면 `--max-bytes`를 직접 올려야 한다. 본문은 이 연결을 언급하지 않는다.
6. `GIF_SKILL_DIR`를 별도 줄에서 export하는 조건을 놓치면 경로가 빈 문자열로 확장되어 스크립트가 엉뚱한 경로를 가리킨다 (원문이 경고하는 실패 모드).
7. 스크린샷 모드의 파일 정렬은 `sorted(path.resolve() ...)` 즉 문자열 정렬이다 (`encode_gif.py:243`). `00-`, `01-` 접두어 규칙을 지키지 않고 `1.png`, `10.png`, `2.png`처럼 이름 지으면 순서가 뒤틀린다. 원문은 접두어 예시를 주지만 자릿수 규칙은 명시하지 않았다.

### 다른 스킬 / CLAUDE.md 충돌 가능 지점

- 브라우저 제어 워크플로우: 어떤 스킬/MCP인지 이름이 없다 ("the available browser-control workflow"). 해당 워크플로우의 격리·정리 규칙과 이 스킬의 규칙이 어긋나면 해결 우선순위 명시 없음.
- 프로젝트 CLAUDE.md가 "PR에 바이너리 금지"나 "자동 PR 편집 금지" 같은 규칙을 가지면 `--attach` 단계와 충돌할 수 있다 (가정적 충돌, 원문에 해당 규칙 언급 없음).
- 다른 PR 스킬(커밋·PR 생성 스킬)과 PR body 작성 책임이 겹칠 수 있다. 원문에 연계 규칙 없음.
- 하드코딩된 `/tmp/assets-checkout`는 스크래치 디렉터리 정책(예: 세션 전용 임시 경로)을 요구하는 환경 규칙과 충돌할 수 있다.

### 검증 공백

- 시각 검증은 에이전트 자기 판단이다. 민감정보 부재, 판독성, 홀드 충분성에 자동 검사가 없다.
- 인코더는 길이·폭·프레임 수·바이트만 검사하고, 콘텐츠(프레임 내용이 올바른 상태인지, 비밀이 포함됐는지)는 검사하지 않는다.
- "fresh scratch" 상태 루트가 실제로 비어 있었는지 확인하는 단계 없음.
- 요구된 "real model round" 여부는 에이전트의 진술로만 공개되며, 로그 대조 같은 증빙 규칙은 없음.
- 깨끗하지 않은 worktree일 때 처리(커밋/스태시/중단)는 명시 없음.
- 인코더 테스트는 CI에서 돌지 않아 ffmpeg 버전 변화로 인한 회귀를 자동 탐지할 수 없다 (`SKILL.md:114`).
- 테스트 커버리지 공백: `--fps > 30` 거부, `--colors` 범위 거부, `--max-width` 초과 검사 경로 직접 테스트 없음, 입력=출력 경로 거부 테스트 없음 (테스트 파일 전수 확인 결과 해당 케이스 없음).
- 증거 사슬 결정 문서(`../../notes/implemented/process/2026-08-08-browser-gif-evidence-chain.md`)가 이 디렉터리 밖에 있어 "why"를 확인 불가.

### 유지보수 리스크

- 하드코딩된 리포지토리 의존: `pnpm run build:web`, `apps/web/package.json`, `DSH_HOME`, `DSH_AGENTS_HOME`, `.playwright-mcp/`, 루트 `.env`. 리포지토리 구조가 바뀌면 SKILL.md가 낡는다.
- 외부 도구 버전 고정: `gh` v2.99.0 이상이라는 특정 기능(`--attach`)에 의존. 이 플래그의 동작이 바뀌면 게시 단계가 깨진다.
- 외부 ffmpeg 필터(`palettegen`, `paletteuse`, `tpad`, `trim`, `setpts`) 동작 의존. 테스트 인코더 `libvpx` 존재 필요 (테스트 setUp이 `-c:v libvpx` 사용).
- 상대 링크 `../../notes/...`와 문서 위치에 의존.
- Playwright 문서 링크 외부 URL 의존 (`https://playwright.dev/docs/videos`).
- 증거 규칙이 장문이고 중복이 많다 (fixture 금지 문장이 `SKILL.md:16`과 `:22`에 반복, head 재확인이 `:134, :141, :164`에 반복). 수정 시 한 곳만 고치면 불일치가 생길 수 있다.

### 한 줄 판정

조건부 도입: 이 스킬은 "실제 서버·실제 모델·단일 실행·커밋 SHA 고정"이라는 증거 사슬과 결정적 인코더를 갖춰 해당 리포지토리 구조(pnpm, `DSH_*`, `apps/web`, github.com의 `gh` 2.99+)에서는 권장할 만하지만, 경로와 도구가 하드코딩되어 있어 다른 리포지토리에서는 그대로 쓸 수 없다.
