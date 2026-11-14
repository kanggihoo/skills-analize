> AI 번역본. 원본: preview-render.md. 분석 근거는 원본이다.

# preview, play, render, publish

서빙, 렌더링, 공유 명령.

## preview

```bash
npx hyperframes preview                   # foreground on a TTY; persistent in agent shells
npx hyperframes preview --background      # explicit persistent session
npx hyperframes preview --foreground --json # ready JSON, then remain attached
npx hyperframes preview --background --port 4567 # agent-safe custom port (default 3002)
npx hyperframes preview --selection --json # print the current Studio selection and exit
npx hyperframes preview --context --json  # print compact agent context from Studio
```

파일이 바뀌면 hot-reload된다. 브라우저에서 Studio를 자동으로 연다. Studio는 전체 타임라인 편집기여서, 사용자가 영상을 재생하고 렌더링 전에 직접 무엇이든 수정할 수 있다. 단순한 뷰어가 아니라 검토 화면이다.

프로젝트를 사용자에게 넘길 때는 source `index.html` 경로가 아니라 Studio 프로젝트 URL을 쓴다:

```text
http://localhost:<port>/#project/<project-name>
```

실제 포트와 프로젝트 디렉터리 이름을 넣는다. `index.html`은 소스 코드 맥락일 뿐 preview 화면이 아니다. 예를 들어 `codex-openai-video`에서 `npx hyperframes preview --background --port 3017`을 실행했다면 `http://localhost:3017/#project/codex-openai-video`라고 보고한다.

넘긴 URL이 죽어 있는 경우는 두 가지다. URL에 `#project/<project-name>` 해시가 빠졌거나(Studio는 열리지만 열 프로젝트가 없다), 서버가 실제로 떠 있지 않은 경우다. URL을 넘기기 전에 두 가지를 모두 확인한다. 비-TTY agent shell에서 bare `preview`를 실행하면 관리되는 persistent 세션이 자동으로 만들어진다. 그래도 `--background`가 가장 명확한 명시 형태다. 출력된 URL이 HTTP 200을 반환하는지 확인하고, 검토가 끝날 때까지 살려 두고, 나중에 `npx hyperframes preview --stop`으로 명시적으로 중지한다. 데스크톱 앱은 preview가 실행 중일 때 프로젝트를 편집할 수 없다. `npx hyperframes open`은 프로젝트를 넘기기 전에 background preview를 중지한다. 프로젝트 이름에 route 메타문자가 있으면 HyperFrames가 URL 인코딩하므로, 출력된 URL은 그대로 쓴다.

### Studio 선택 영역에서 얻는 agent 맥락

`preview --context`와 `preview --selection`은 실행 중인 Studio 세션과 agent를 잇는 통로다. 새 서버를 띄우지 **않는다**. 현재 프로젝트의 활성 preview 서버를 찾아 Studio에서 agent에 유용한 상태를 읽고, 출력한 뒤 종료한다.

사용자가 "이거 바꿔", "선택한 요소 옮겨", "내가 클릭한 카드 키워", "지금 선택한 거 고쳐"처럼 가리키는 방식으로 편집을 요청하면 이 명령을 쓴다:

```bash
npx hyperframes preview --context --json --context-fields selection
```

압축된 context payload에는 선택한 요소의 소스 파일, composition 경로, 현재 타임라인 시각, `data-hf-id` / selector 대상, bounding box, 텍스트 내용, 선택 요소의 썸네일 URL이 들어 있다. `selection.target.hfId`가 있으면 그것을 우선 쓴다. 안정적인 `data-hf-id`가 없을 때만 `selection.target.selector`로 대체한다. `selection`이 `null`이면 `errors.selection.code`(예: `no-selection`)를 확인한다.

agent 맥락은 필요한 조각만 요청해서 작게 유지한다:

```bash
npx hyperframes preview --context --json --context-fields selection
npx hyperframes preview --context --json --context-fields lint
npx hyperframes preview --context --json --context-fields selection,lint
```

`computedStyles`, `inlineStyles`, `dataAttributes`, 편집 가능한 텍스트 필드 메타데이터 같은 무거운 selection 필드가 정말 필요한 편집일 때만 `--context-detail full`을 쓴다:

```bash
npx hyperframes preview --context --json --context-fields selection --context-detail full
```

lint/서버 맥락이 필요 없고 선택된 요소의 전체 payload를 명시적으로 원할 때는 `preview --selection --json`을 쓴다.

실패 모드:

| Code                       | Meaning                                                                    |
| -------------------------- | -------------------------------------------------------------------------- |
| `preview-not-running`      | 먼저 `npx hyperframes preview --background`로 Studio를 시작한다.            |
| `ambiguous-preview-server` | 일치하는 Studio 서버가 여러 개 열려 있다. 나열된 `--port` 하나를 붙여 다시 실행한다. |
| `preview-port-mismatch`    | 요청한 `--port`가 일치하는 Studio 서버 중 하나가 아니다.                       |
| `no-selection`             | Studio는 열려 있지만 사용자가 아직 요소를 선택하지 않았다.                       |
| `selection-unavailable`    | 실행 중인 preview 서버가 selection 맥락을 깔끔하게 노출하지 않는다.               |

선택이 없으면 사용자에게 Studio에서 대상 요소를 클릭한 뒤 명령을 다시 실행하라고 요청한다. 서버 오류가 후보 포트를 나열하면 같은 명령을 `--port <candidate>`와 함께 다시 실행한다. CLI가 안정적인 요소 대상을 줄 수 있다면 스크린샷을 보고 대상을 추측하지 않는다.

## play (lightweight player)

```bash
npx hyperframes play                  # current project, port 3003
npx hyperframes play ./my-video       # specific project
npx hyperframes play --port 8080      # custom port
```

`play`는 전체 Studio UI 대신 임베드 가능한 `<hyperframes-player>` 웹 컴포넌트로 composition을 서빙한다. 미리보기 링크를 공유할 때나, Studio가 필요 이상으로 무거울 때(편집기도 패널도 필요 없을 때) 쓴다. `play`는 `http://localhost:<port>` 형태의 평범한 URL을 보고한다. `#project/<name>` 해시는 붙지 않는다. 이 해시는 `preview`만 쓰는 Studio 라우팅 규칙이다.

player의 `playback-rate` 속성(미리보기 재생 속도 조절이며 타임라인의 `timeScale`을 구동한다)은 `[0.1, 5]` 범위로 고정된다. `0` 이하이거나 유한하지 않은 값은 `1`로 대체된다. 이것은 미리보기/재생용 조절값이지 composition의 `data-*` 속성이 아니다. 작성된 모션은 여전히 `1×`로 렌더링된다.

### 외부 브라우저로 실행하기 (preview + play)

`preview`와 `play` 모두 OS 기본 브라우저 대신 명시한 Chromium 호환 브라우저 안에서 열 수 있다. 쓰임은 두 가지다. 격리된 Chromium 프로필을 쓰거나, 외부 CDP에 연결하는 경우(DevTools / Playwright / Puppeteer / browser-MCP)다. **HyperFrames 자체는 CDP 자동화를 소유하지 않는다**. 이 옵션은 엔드포인트만 노출하며, 거기에 연결하는 쪽은 사용자가 책임진다. `--browser-gpu`(render 플래그로, 캡처 중 Chrome GPU 접근을 제어한다)와 혼동하지 않는다.

| Flag                      | Type            | Notes                                                                                                                                                                                           |
| ------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--browser-path`          | path            | Chromium 호환 실행 파일의 절대 경로(`/usr/bin/chromium`, `/Applications/Brave Browser.app/...`).                                                                                                 |
| `--user-data-dir`         | path            | Chromium 호환 프로필 디렉터리. `--browser-path`가 필요하다. 상태가 메인 프로필에 남지 않도록 일회용 디렉터리를 쓴다.                                                                                                 |
| `--remote-debugging-port` | integer 1-65535 | 지정한 포트에 Chromium CDP 엔드포인트를 연다. **`--browser-path`와 `--user-data-dir`를 둘 다 요구한다**. 없으면 거부하므로, CDP 엔드포인트가 실수로 메인 프로필에 새어 나갈 수 없다. |

```bash
# Open preview in an isolated Chromium profile
npx hyperframes preview --background --browser-path /usr/bin/chromium --user-data-dir /tmp/hf-profile

# Same plus a CDP endpoint on :9222 (attach DevTools / Playwright / etc.)
npx hyperframes play --browser-path /usr/bin/chromium --user-data-dir /tmp/hf-profile --remote-debugging-port 9222
```

검증은 서버가 뜨기 전에 실행되므로, 잘못된 값이면 리스닝 소켓을 남기지 않고 깔끔하게 종료한다.

## render

> 사용자가 `preview`에서 검토하고 승인했을 때, 또는 파일을 요청했거나 멈추지 말고 작업하라고 했을 때만 렌더링한다. 검사를 통과했다는 사실만으로는 렌더링할 이유가 되지 않는다.

```bash
npx hyperframes render                                # standard MP4 from cwd
npx hyperframes render ./my-video --output ./out.mp4  # render from outside the project dir
npx hyperframes render --output final.mp4             # named output (no timestamp)
npx hyperframes render -c compositions/intro.html -o intro.mp4  # render a specific sub-composition file
npx hyperframes render --quality draft                # fast iteration
npx hyperframes render --quality looks                # first real encode (default)
npx hyperframes render --fps 60 --quality delivery    # final delivery
npx hyperframes render --format webm                  # transparent WebM
npx hyperframes render --docker                       # byte-identical
```

> 기본 `--output`은 `renders/<project-name>_<YYYY-MM-DD>_<HH-MM-SS>.<ext>`다. 렌더링마다 타임스탬프가 붙어서 연속 실행이 서로 덮어쓰지 않는다. 고정된 이름을 원하면 `--output`을 넘긴다.

| Flag                                 | Options                                                                                            | Default                        | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dir` (positional)                   | path                                                                                               | cwd                            | 프로젝트 디렉터리. 생략하면 현재 작업 디렉터리를 쓴다.                                                                                                                                                                                                                                                                                                                                                                                     |
| `--composition`, `-c`                | path to composition file                                                                           | `index.html`                   | 프로젝트의 `index.html` 대신 특정 composition 파일(예: `compositions/intro.html`)을 렌더링한다.                                                                                                                                                                                                                                                                                                                                    |
| `--output`, `-o`                     | path                                                                                               | `renders/<project>_<ts>.<ext>` | 출력 경로. 기본값은 타임스탬프가 붙는다(`<project-name>_YYYY-MM-DD_HH-MM-SS.<ext>`).                                                                                                                                                                                                                                                                                                                                                             |
| `--fps`                              | 1–240, or a rational such as `30000/1001`                                                          | root `data-fps`, else 30       | 60fps는 렌더링 시간을 두 배로 늘린다. `lambda`와 `cloudrun`은 24, 25, 30, 60만 받는다                                                                                                                                                                                                                                                                                                                                                                 |
| `--quality`                          | draft, looks, delivery, standard, high                                                             | looks                          | `looks`는 standard 프리셋에서 CRF 16이다. `delivery`는 `high`다. 반복 작업 중에는 draft를 쓴다                                                                                                                                                                                                                                                                                                                                                           |
| `--format`                           | mp4, webm, mov, gif, png-sequence, hls                                                             | mp4                            | WebM/MOV는 투명도를 살려 렌더링한다. gif는 GitHub PR/README/문서에서 자동재생용이다(2-pass 팔레트 인코딩, fps는 30으로 제한되며 `--fps 15`를 권장한다, 오디오 없음, 1-bit 투명도만 지원, HDR은 SDR로 대체된다). png-sequence는 RGBA 프레임을 디렉터리에 쓴다(AE/Nuke/Fusion 입력용). hls는 HLS VOD 디렉터리(master.m3u8 + video/audio 플레이리스트 + MPEG-TS 세그먼트)를 쓴다. SDR만 지원하고, `--gpu`는 거부하며, lambda/cloudrun에서는 쓸 수 없다 |
| `--gif-loop`                         | 0-65535                                                                                            | 0                              | GIF 반복 횟수. `0`이면 무한 반복한다. `--format gif`일 때만 쓴다.                                                                                                                                                                                                                                                                                                                                                                  |
| `--hls-segment-seconds`              | 1-60                                                                                               | 4                              | HLS 목표 세그먼트 길이(정수 초). 인코더 GOP도 고정해서 모든 세그먼트가 keyframe에서 시작하게 한다. `--format hls`일 때만 쓴다.                                                                                                                                                                                                                                                                                                                       |
| `--resolution`                       | landscape, portrait, landscape-4k, portrait-4k, square, square-4k (+ aliases `1080p`, `4k`, `uhd`) | —                              | Chrome `deviceScaleFactor`로 supersample한다. 가로세로 비율은 composition과 맞아야 하고, 배율은 정수여야 한다. `--hdr`과는 함께 쓰지 않는다.                                                                                                                                                                                                                                                                                                                  |
| `--crf`                              | 0-51                                                                                               | —                              | 인코더 CRF(낮을수록 고화질). `--video-bitrate`와 동시에 쓸 수 없다.                                                                                                                                                                                                                                                                                                                                                              |
| `--video-bitrate`                    | e.g. `10M`, `5000k`                                                                                | —                              | 목표 비트레이트. `--crf`와 동시에 쓸 수 없다.                                                                                                                                                                                                                                                                                                                                                                                              |
| `--keyframe-interval`                | seconds, e.g. `2`                                                                                  | —                              | MP4 전용. 최소 N초마다 keyframe을 둔다.                                                                                                                                                                                                                                                                                                                                                                                                |
| `--max-bitrate`                      | e.g. `8M`                                                                                          | —                              | MP4 전용. CRF/quality 목표와 함께 쓰는 최대 peak 비트레이트 상한. WebM/MOV에는 쓰지 않는다.                                                                                                                                                                                                                                                                                                                                                                |
| `--buffer-size`                      | e.g. `16M`                                                                                         | —                              | MP4 전용. `--max-bitrate`용 버퍼(기본값은 그 2배). `--max-bitrate`가 필요하다.                                                                                                                                                                                                                                                                                                                                                                  |
| `--chroma-subsampling`               | 420, 444                                                                                           | 420                            | `444`는 얇은 컬러 텍스트/UI의 전체 해상도 색을 유지한다(yuv444p, 무손실 PNG 캡처, 더 느림). SDR MP4 + 소프트웨어 인코더에서만 동작하며, `--gpu`, `--hdr`, 다른 포맷과 함께 쓰면 거부된다. 많은 플레이어가 4:4:4를 디코딩하지 못한다.                                                                                                                                                                                                                       |
| `--hdr`                              | flag                                                                                               | off                            | SDR 소스여도 HDR 출력을 강제한다. MP4 전용.                                                                                                                                                                                                                                                                                                                                                                                             |
| `--sdr`                              | flag                                                                                               | off                            | HDR 소스여도 SDR을 강제한다.                                                                                                                                                                                                                                                                                                                                                                                              |
| `--workers`                          | number or `auto`                                                                                   | auto                           | 워커마다 Chrome이 뜬다(약 256 MB)                                                                                                                                                                                                                                                                                                                                                                                           |
| `--docker`                           | flag                                                                                               | off                            | 호스트와 무관하게 재현 가능한 출력                                                                                                                                                                                                                                                                                                                                                                                              |
| `--gpu`                              | flag                                                                                               | off                            | GPU 가속 FFmpeg 인코딩(NVENC / VideoToolbox / VAAPI / QSV)                                                                                                                                                                                                                                                                                                                                                                          |
| `--browser-gpu` / `--no-browser-gpu` | flag                                                                                               | auto (local), off (docker)     | Chrome/WebGL 캡처에 쓸 호스트 GPU                                                                                                                                                                                                                                                                                                                                                                                             |
| `--browser-timeout`                  | seconds (0.001–86400)                                                                              | 60                             | 진입 HTML의 Puppeteer 페이지 내비게이션 타임아웃. 무거운 composition(영상/폰트/원격 에셋이 많은 경우)이 기본 60초 안에 `domcontentloaded`에 도달하지 못하면 올린다.                                                                                                                                                                                                                                                                              |
| `--quiet`                            | flag                                                                                               | off                            | 자세한 출력을 끈다                                                                                                                                                                                                                                                                                                                                                                                                       |
| `--strict`                           | flag                                                                                               | off                            | lint 오류가 있으면 실패한다                                                                                                                                                                                                                                                                                                                                                                                           |
| `--strict-all`                       | flag                                                                                               | off                            | lint 오류와 경고가 있으면 실패한다                                                                                                                                                                                                                                                                                                                                                                                              |
| `--variables`                        | JSON object                                                                                        | —                              | `data-composition-variables`에 선언된 값을 덮어쓴다                                                                                                                                                                                                                                                                                                                                                                                      |
| `--variables-file`                   | path                                                                                               | —                              | 변수 값이 담긴 JSON 파일(`--variables`의 대안)                                                                                                                                                                                                                                                                                                                                                                                 |
| `--strict-variables`                 | flag                                                                                               | off                            | `--variables`에 선언되지 않은 키나 타입 불일치가 있으면 렌더링을 실패시킨다                                                                                                                                                                                                                                                                                                                                                                            |

**품질 가이드:** 반복 작업 중에는 `draft`, 첫 실제 인코딩에는 `looks`(기본값), 최종 전달에는 `delivery`를 쓴다. `standard`와 `high`도 여전히 동작한다.

1440p 프리셋은 `landscape-1440p`(2560×1440), `portrait-1440p`(1440×2560), `square-1440p`(1440×1440)다. `1440p`와 `qhd` 별칭은 composition의 방향을 따른다. 720p composition은 2배로 1440p까지 업스케일할 수 있고, 4K composition은 1440p로 다운스케일할 수 있다. 1920×1080 composition은 4/3이 정수 배율이 아니므로 1440p로 업스케일할 수 없다. 1440p로 작성하거나, 4K로 렌더링한 뒤 따로 다운스케일한다.

**요약의 두 번째 줄을 읽는다.** `render`는 출력 경로와 크기 다음에 캡처 경로, GPU 모드, 단계별 타이밍을 출력한다. 예: `beginframe capture · software gpu · compile 0.7s · setup 1.1s · capture 8.1s · encode 5.8s`. `capture`는 프레임 루프이고 `setup`은 캘리브레이션과 세션 초기화다. 캡처 경로가 `a|b`로 나오면 병렬 워커들이 갈라졌다는 뜻이다. `encode (during capture)`는 스트리밍 인코더가 루프와 겹쳐 실행됐다는 뜻이므로 전체 wall time에 더하지 않는다. 로컬 GPU `auto`(기본값)는 BeginFrame을 요청한다. Linux에서 `software gpu`와 함께 여전히 `screenshot capture`라고 나오면, 그 아래 힌트가 BeginFrame이 실행되지 않았다고 알려 준다(chrome-headless-shell이 필요하며 `--resolution` 업스케일은 안 된다). 이 힌트는 GPU가 자동 탐지된 경우에만 나오며, 소프트웨어 GL이 목적인 `--docker`나 `--no-browser-gpu`에서는 나오지 않는다. 무거운 composition은 소프트웨어 GL에서 멈출 수 있다. 어떤 경로가 실행됐는지 알아보려고 `--debug`를 바로 꺼내 들지 않는다.

**매개변수화된 렌더링:** composition은 변수를 `<html>` 루트의 **`data-composition-variables`**에 선언한다. 이 값은 JSON **선언 배열**(항목마다 `{id, type, label, default}`)이며 스키마를 정의한다. 내부 스크립트는 `window.__hyperframes.getVariables()`로 해석된 값을 읽는다. CLI의 `--variables '{"title":"Q4 Report"}'`는 **id를 키로 하는 JSON 객체**이며, 한 번의 렌더링에서 선언된 기본값을 덮어쓴다. 빠진 키는 그대로 기본값을 쓰므로, 같은 composition이 개발용 preview와 운영 렌더링에서 수정 없이 동작한다. sub-comp 호스트는 `data-variable-values`로 인스턴스별 덮어쓰기도 할 수 있다. 전체 패턴은 `../../hyperframes/references/format.md`를 참고한다.

### feedback (렌더링 후 보고)

렌더링을 검증한 뒤에는 작업당 피드백 한 줄을 보낸다. 이것이 메인테이너가 받는 핵심 신호다. 조용히 끝난 렌더링은 메인테이너에게 아무것도 알려 주지 않는다.

```bash
npx hyperframes feedback --rating 10                              # clean run, no notes
npx hyperframes feedback --rating 6 --comment "bg <video> renders grey in multi-scene; worked around with --format png-sequence"
```

`--rating`은 0-10 정수이고, `--comment`는 자유 텍스트다. `--rating` 없이 `--comment`만 주면 rating 없는 보고(`SKILL.md`의 `MISSING FEATURE:`와 `HOST APP:`)가 되며, rating 지표에는 계산되지 않는다. 피드백은 사용자가 HeyGen에 로그인하기 전까지 익명이다. 로그인하면 계정에 연결되고, `doctorSummary`(OS/Node/CPU/메모리/ffmpeg)가 자동으로 첨부되므로 이 필드들을 반복해서 적지 않는다. 문제없이 끝난 실행이라면 짧은 결과만 적으면 된다. 버그, 우회 방법, 혼란을 주는 동작을 보내기 전에는 아래의 압축된 재현 정보를 모은다:

```text
REPRO COMMAND: <HF_*/PRODUCER_* env> npx hyperframes <exact command>   # run from the project directory; do NOT paste absolute paths
EXPECTED / ACTUAL: <expected behavior> / <observed behavior and isolated trigger>
EXACT ERROR: <verbatim error or warning; include frame/timestamp for visual defects>
OUTCOME: <output correct | output corrupt | fallback succeeded | hard exit | command hung>
WORKAROUND: <exact workaround, or none>
COMPOSITION_STRUCTURE:
  elements: video=<n> audio=<n> img=<n> svg=<n> canvas=<n> subComps=<n>
  attributes: <comma-joined subset of clip-path, filter, mix-blend-mode, transform, mask, position:fixed, overflow:hidden, z-index, data-has-audio, data-duration, data-start, data-composition-src, background-image:url, mask-image:url — or "(none present)">
  timeline: <flat | nested (<n> sub-comps)>; driver=<gsap | data-timeline | gsap+data-timeline | none>
  delta: <what differs between the working workaround-render and the broken default render>
  defect: <spatial location + frame index range, e.g. top-left / frames 0-30 — omit for non-visual defects>
```

`COMPOSITION_STRUCTURE:`는 구조를 드러내는 개인정보 보호형 요약이다. 개수와 존재 여부 플래그만 담고, 파일 경로, src URL, 사용자 텍스트는 담지 않는다. 메인테이너는 이 정보로 알려진 버그군(예: "sub-comp mount + clip-path", "GSAP timeline + z-index")과 보고를 대조할 수 있고, composition ZIP을 받을 필요가 없다. 시각적 결함을 설명하는 rating 7 이하 보고(검은 프레임, 깜빡임, 손상된 출력, 잘못된 프레임, 빈 출력, 기타 시각 이상)에는 이 블록이 필수다. 더 높은 rating에서는 선택 사항이지만 있으면 좋다. 이 스킬을 쓰는 agent는 이미 가진 composition HTML을 `packages/cli/src/utils/compositionCensus.ts`의 `buildCompositionCensus(html)`과 `renderCompositionCensusBlock(census)`로 호출해 블록을 자동으로 채울 수 있다. 사람 사용자가 이 블록을 손으로 채울 필요는 없다.

**피드백은 공개 채널로 제출된다. 보내기 전에 익명화한다.** 절대 경로(사용자 홈 디렉터리와 기기 정체성이 샌다), 경로에 들어간 사용자명이나 프로젝트명, 비밀값, 자격 증명을 가린다. 명령의 경로 인자는 프로젝트 디렉터리 기준 상대 경로로 둔다(`/Users/<user>/Documents/…/out.mp4`가 아니라 `./renders/out.mp4`, `/home/<user>/projects/<real-name>/.hf-tmp/`가 아니라 `.hf-tmp/`). 마찬가지로 `EXACT ERROR:`의 스택 트레이스와 로그 발췌에서도 절대 경로를 뺀다. 파일 basename과 줄 번호만 남기고 앞의 디렉터리는 지운다. 플래그와 관련된 `HF_*` / `PRODUCER_*` 변수는 그대로 보존한다. 실패가 더 이상 재현되지 않으면 마지막으로 실패한 명령과 로그 발췌(같은 방식으로 가린 것)를 넣는다. 프로젝트 링크는 이미 있고 공유해도 안전할 때만 공유한다.

`hyperframes feedback` 명령은 `--comment`가 10이 아닌 rating과 함께 왔는데 `REPRO COMMAND:`가 없거나, rating 7 이하의 시각 결함 comment에 `COMPOSITION_STRUCTURE:`가 없으면 경고를 낸다. 경고는 제출 확인 메시지 위에 출력되며 제출을 막지 않는다. 일부 정당한 보고(예: "cloudrun quota bumped yesterday, fine now" 한 줄)는 이 틀에 맞지 않기 때문이다. 경고를 없애려면 패킷을 고쳐서 다시 실행한다.

재현 가능한 버그라면 `--file-issue`(비대화형 셸에서는 `--dir <project>`와 `--yes`를 함께 쓸 수 있다)를 붙여 최소 재현 자료를 공개 URL에 올리고, 메인테이너가 등록할 수 있도록 미리 채워진 GitHub `bug` 이슈 초안을 연다. 이는 프로젝트를 공개하는 동작이므로 옵트인이며 사용자 동의를 거친다. 이슈는 자동으로 제출되지 않는다.

## publish

```bash
npx hyperframes publish              # upload current project privately, return stable URL
npx hyperframes publish ./my-video   # specific project
npx hyperframes publish --public     # allow anyone with the URL to view the claimed project
npx hyperframes publish --yes        # skip the confirmation prompt (scripts/CI)
```

프로젝트의 소스(HTML + 에셋)를 업로드하고, 브라우저에서 렌더링되는 고정 호스팅 URL을 반환한다. 처음 publish한 프로젝트는 기본적으로 비공개이며, 보려면 인증과 접근 권한이 필요하다. URL을 가진 누구나 claim된 프로젝트를 보게 하려면 `--public`을 쓴다. 기존 프로젝트를 제자리에서 업데이트하면 기존 공개 설정이 유지된다. `--public` 없이 다시 publish해도 공개 프로젝트가 비공개로 바뀌지 않는다. `--yes`는 확인 프롬프트만 건너뛰며 공개 설정을 바꾸지 않는다. 로그인하지 않은 상태에서 publish하면 공개 재생 URL 대신 인증이 필요한 claim URL이 반환된다. lint 결과는 업로드 전에 보여 주지만 업로드를 막지는 않는다.

## 클라우드 렌더링 위치와 스킬 귀속

사용자가 로컬 Chrome, FFmpeg, AWS 없이 호스팅 렌더링을 원하거나, 유료 HyperFrames 플랜에서 최종 렌더링을 할 때는 클라우드 렌더링을 쓴다(`cloud.md`). Lambda는 AWS 소유가 요구사항일 때만 쓴다. Cloud Run은 GCP 소유가 요구사항일 때만 쓴다. 클라우드 경로를 실행하기 전에는 해당 레퍼런스를 먼저 읽는다.

스킬 귀속은 자동이다. 위 예시에는 `--skill`이 필요 없다. `hyperframes init --skill=<slug>`로 scaffold된 프로젝트는 `hyperframes.json`에 소유 스킬을 기록하고, 이후의 모든 렌더링은 사용량 텔레메트리에 그 스킬을 상속한다. 재렌더링, `npm run render`, `--batch` 모두 해당한다. `--skill=<slug>`는 스킬 없이 scaffold된 프로젝트에 표시를 남기고 싶을 때만 명시적으로 넘긴다(그러면 첫 렌더링에서 저장된다).

## 검토용 영상 공유

사용자가 링크를 가진 누구나 검토할 수 있기를 명시적으로 원할 때만 `hyperframes share --public`을 쓴다. 먼저 `hyperframes auth login`으로 로그인한다. 첫 공유의 다른 선택지는 `--team`, `--invite-only`, `--private`이며, 워크스페이스 권한에 따라 다르다. `--yes`는 공유 대상에 대한 동의가 아니다.

`hyperframes share --status --json`을 읽는다. 영상을 준비됐다고 말하려면 `ready: true`가 필요하다. `share`를 다시 실행하면 기존 링크를 가져온다. `share --update`는 변경된 내용을 명시적으로 렌더링하고 업로드한다. 무료 보관 프로젝트는 워크스페이스마다 5개로, CLI와 데스크톱을 합산해 계산한다. 버전은 슬롯을 차지하지 않으며, 링크를 끈다고 슬롯이 해제되지도 않는다.

`publish`는 소스를 레거시 `/p/` 페이지에 업로드한다. 검토 공유의 별칭이 아니다. 발표된 60일 기간에는 기존 동작이 알림과 함께 계속 사용 가능하다. 시작일은 릴리스 담당자가 정하며 현재 미정이다. 그 이후에는 새 프로젝트를 Share로 안내한다. 기존 게시물과 레거시 업데이트는 계속 접근 가능하다. 기간이 지나면 레거시 업데이트에는 로그인한 계정이 필요하다. 레거시 ID를 변환하거나 레거시 플래그를 검토 동의로 옮기지 않는다.
