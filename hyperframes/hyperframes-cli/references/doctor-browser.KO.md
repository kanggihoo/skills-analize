> AI 번역본. 원본: doctor-browser.md. 분석 근거는 원본이다.

# doctor, browser

환경 진단과 번들 Chrome 관리. render나 preview가 실패하면 이 명령부터 실행한다.

## doctor

```bash
npx hyperframes doctor
npx hyperframes doctor --json     # CI / 에이전트 출력 (항상 exit 0; payload의 `ok`로 판단)
```

서로 독립적인 검사들을 실행하고, 각 항목을 ok/warn/fail로 보고한다:

- **Version**: 설치된 CLI와 npm의 최신 버전 비교 (오래됐으면 업그레이드를 안내)
- **Node.js**: 22 이상 필요
- **CPU**, **Memory**, **Disk**: 호스트 리소스
- **Environment**: 렌더러에 영향을 주는 환경 변수
- **FFmpeg** / **FFprobe**: 설치 여부, 버전, 코덱
- **Chrome**: 번들 또는 시스템 Chrome, 버전, 경로
- **Docker** / **Docker running**: `render --docker`에서만 필요
- **/dev/shm**: 컨테이너 안에서만 확인

다음 경우에는 `doctor`를 먼저 실행한다:

- `render`가 Chrome이나 FFmpeg 오류로 실패할 때.
- `preview`는 열리지만 구성이 로드되지 않을 때.
- HyperFrames를 한 번도 실행하지 않은 새 기기일 때.

자주 생기는 문제:

- **FFmpeg 누락**: macOS에서는 `brew install ffmpeg`, 또는 패키지 관리자로 설치한다. 아니면 [기존 바이너리를 직접 지정](#패키지-관리자-없이-ffmpeg-설정)한다.
- **번들 Chrome 누락**: `npx hyperframes browser ensure`를 실행한다.
- **메모리 부족**: 다른 Chrome을 닫거나, `--workers`를 줄이거나, `--quality draft`를 쓴다.
- **에이전트 샌드박스(macOS) 안에서 Chrome이 즉시 종료됨**: seatbelt 계열 샌드박스(예: codex `workspace-write`)가 Chromium의 Mach 포트 bootstrap(`MachPortRendezvous`; openai/codex#21292)을 막아서, 번들이든 시스템이든 headless shell이든 모든 Chrome이 시작하자마자 죽는다. 이것은 HyperFrames나 Chrome 설치 문제가 아니라 호스트 수준의 차단이다. 컴파일 검사와 오디오는 통과하고, 렌더링만 불가능하다. 차단 사실을 밝히고, 검증이 끝난 구성을 전달한다. 샌드박스 밖에서 렌더링하거나, 가능하다면 `render --docker` 또는 클라우드 렌더링을 쓴다. **대체 래스터라이저(magick/PIL/SVG 프레임 파이프라인)를 만들지 않는다.** 브라우저가 차단된 호스트에서 결과물은 검증된 구성과 이 차단 메모다. 렌더링은 `--docker`, 클라우드, 또는 사용자에게 넘긴다. 차단을 확인한 즉시 최종 요약을 작성하고, 선택적 대안 작업은 그 뒤에 한다. 이후 세션이 실패해도 이미 끝낸 작업의 보고가 사라지면 안 된다.

### 패키지 관리자 없이 FFmpeg 설정

운영체제와 아키텍처에 맞는 FFmpeg 및 FFprobe 바이너리를 [FFmpeg 다운로드 페이지](https://ffmpeg.org/download.html)에서 받는다. 둘 다 실행 가능해야 한다. Homebrew나 시스템 전역 설치 없이도 사용할 수 있다:

```bash
export HYPERFRAMES_FFMPEG_PATH="/absolute/path/to/ffmpeg"
export HYPERFRAMES_FFPROBE_PATH="/absolute/path/to/ffprobe"
npx hyperframes doctor --json
```

두 변수는 HyperFrames를 실행하는 환경에 모두 설정한다. Windows에서는 셸의 환경 변수 문법에 맞춰 `ffmpeg.exe`와 `ffprobe.exe`를 가리키게 한다. 설정된 경로는 자동 탐색보다 우선한다. 설정한 파일이 없으면 누락으로 보고된다.

자동 탐색은 프로젝트 폴더나 작업 디렉터리 안에 있는 FFmpeg 또는 FFprobe(예: `.hyperframes/bin`이나 프로젝트의 `@ffmpeg-installer` 패키지)를 절대 실행하지 않는다. 프로젝트는 누구에게서든 올 수 있기 때문이다. 바이너리는 프로젝트 밖에 두고, 위 변수를 설정하거나 해당 폴더를 절대 경로로 `PATH`에 추가한다.

`doctor --json`에서 **FFmpeg**와 **FFprobe** 항목이 `ok: true`이고 기대한 경로를 보고하는지 확인한다. `jq`로 이 두 인코딩 의존성만 검사하려면:

```bash
npx hyperframes doctor --json | jq -e \
  '[.checks[] | select(.name == "FFmpeg" or .name == "FFprobe")] | length == 2 and all(.ok)'
```

보고서 최상위의 `ok`에는 Docker나 로컬 음성 제공자 같은 선택 도구도 포함된다. 이 도구들이 실패해도 로컬 영상 렌더링에는 설치가 필요하지 않다. Chrome은 아래 browser 명령으로 따로 확인한다.

## browser

```bash
npx hyperframes browser ensure    # 고정 버전 Chrome을 찾거나 다운로드
npx hyperframes browser path      # 브라우저 실행 파일 경로 출력 (스크립트용)
npx hyperframes browser clear     # 캐시된 Chrome 다운로드 삭제
```

HyperFrames가 렌더링에 쓰는 Chrome 빌드를 관리한다. 버전을 고정하는 이유는 Chrome 버전이 달라지면 픽셀 출력이 달라지기 때문이다. 번들 빌드를 쓰면 기기마다 렌더링 결과가 재현 가능하게 유지된다.

스크립트에 바이너리를 넣으려면 `path`를 쓴다: `$(npx hyperframes browser path)`.
