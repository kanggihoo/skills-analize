> AI 번역본. 원본: init-and-scaffold.md. 분석 근거는 원본이다.

# init, capture, skills

스캐폴딩 명령. 파일을 손으로 만들지 말고 이 명령들을 쓴다. 올바른 파일 구조를 잡고, 미디어를 복사하고, 전사(transcription)까지 실행해 준다.

<!-- registry-items: allow=blank,landscape-4k,portrait-4k,square-4k,landscape-1440p,portrait-1440p,square-1440p,media-use -->

## init

```bash
npx hyperframes init my-video --skip-skills                      # 가운데 정렬된 빈 구성 (TTY: 마법사)
npx hyperframes init my-video --skip-skills --example warm-grain # 예제 선택
npx hyperframes init my-video --skip-skills --resolution portrait
npx hyperframes init my-video --skip-skills --video clip.mp4     # 비디오 파일 포함
npx hyperframes init my-video --skip-skills --audio track.mp3    # 오디오 파일 포함
npx hyperframes init my-video --skip-skills --tailwind           # Tailwind v4 브라우저 런타임
npx hyperframes init my-video --skip-skills --non-interactive    # CI용: 플래그만 사용, 같은 빈 구성
```

**기본 동작은 TTY 여부에 따라 달라진다**: 터미널에서는 CLI가 예제와 옵션을 묻는다(기본값: 가운데 정렬된 빈 구성). TTY가 아닌 환경(CI, 에이전트, 파이프 출력)에서는 자동으로 non-interactive 모드로 바뀌어 빈 구성을 만든다. 이름이 붙은 예제에서 시작하고 싶을 때만 `--example`을 준다. TTY에서도 플래그만 쓰는 모드를 강제하려면 `--non-interactive`를 준다.

템플릿: `blank`, `warm-grain`, `play-mode`, `swiss-grid`, `vignelli`, `decision-tree`, `kinetic-type`, `product-promo`, `nyt-graph`. (`registry/registry.json`의 `hyperframes:example` 항목 전체 목록에 번들 `blank` 템플릿을 더한 것이다. `hyperframes catalog`는 예제를 나열하지 않는다. `--type`이 `block`과 `component`만 받기 때문이다. 그래서 이 목록에는 실시간으로 대응하는 출처가 없고, `bun run lint:skills`로 검사한다.)

그 밖에 유용한 플래그:

- `--resolution`: 프리셋. `landscape`(1920×1080), `portrait`(1080×1920), `landscape-4k`, `portrait-4k`, `square`(1080×1080), `square-4k`, `landscape-1440p`(2560×1440), `portrait-1440p`, `square-1440p`. 별칭: `1080p`, `4k`, `uhd`, `1440p`, `qhd`, `1080p-square`, `4k-square`.
- `--skill=<slug>`: 소유 스킬(예: `hyperframes`)을 `hyperframes.json`에 기록한다. 그러면 이후 이 프로젝트의 모든 render(재렌더, `npm run render`, `--batch`)가 플래그를 다시 주지 않아도 사용량 텔레메트리에서 그 스킬로 집계된다. 보통 직접 줄 일은 드물다.
- `--skip-skills`: AI 코딩 스킬은 건드리지 않는다. `init`은 핵심 스킬 세트를 설치하지 않는다. `HYPERFRAMES_SKIP_SKILLS=1`도 같은 효과다. 항상 이 옵션을 붙인다. 없으면 `init`이 빠진 핵심 스킬을 설치하는데, 스킬 설치는 사용자가 직접 할 일이다. 핵심 스킬이 없으면 사용자에게 `npx hyperframes skills update`로 설치할 수 있다고 알려준다.
- `--skip-transcribe`: `--audio` / `--video` 파일을 Whisper로 자동 전사하지 않는다.
- `--model`, `--language`: 자동 전사에 쓸 Whisper 모델과 언어.

**Tailwind** (`--tailwind`): 스캐폴드는 Studio의 Tailwind v3 설정이 아니라 Tailwind v4 브라우저 런타임을 고정한다.

- 고정된 런타임을 유지한다. `cdn.tailwindcss.com`으로 바꾸지 않는다. render는 frame 0 전에 `window.__tailwindReady`를 기다린다. 오프라인이나 외부 접근이 막힌 환경에서 렌더링하려면 CSS로 컴파일해서 스타일시트를 함께 보낸다.
- 테마와 커스텀 유틸리티는 `<style type="text/tailwindcss">` 안에 `@theme`와 `@utility`로 쓴다. v3의 `@tailwind base/components/utilities`, `tailwind.config.js`는 쓰지 않는다. `@config`와 `@plugin`은 브라우저 컴파일을 중단시킨다.
- HTML에는 완전한 클래스 토큰을 직접 쓴다. 런타임은 스캔할 수 있는 클래스만 인식하므로, 렌더링에 필요한 클래스 이름을 seek 시점에 만들면 안 된다(예: `bg-${color}-500`). 항목마다 달라져야 하면 CSS 변수(`style="--i: 2"`)나 data 변형으로 바꾼다.
- Tailwind는 정적 레이아웃과 스타일에만 쓴다. 타이밍은 GSAP나 다른 seek 가능한 런타임에 둔다.

`--audio`나 `--video`를 주면 `init`이 Whisper로 파일을 전사한다. 음성과 모델 선택은 `media-use` 스킬을 본다.

## capture

```bash
npx hyperframes capture https://stripe.com                  # 웹사이트에서 스캐폴드 생성
npx hyperframes capture https://linear.app -o linear-video  # 출력 디렉터리 지정
npx hyperframes capture https://example.com --json          # 에이전트용 JSON 출력
npx hyperframes capture https://example.com --skip-assets   # 이미지/SVG 다운로드 건너뛰기
npx hyperframes capture https://example.com --skip-vision   # 선택적 AI 캡션 건너뛰기
npx hyperframes capture https://example.com --max-screenshots 12
npx hyperframes capture https://example.com --timeout 60000 # 페이지 로드 타임아웃(ms)
npx hyperframes capture https://example.com --capture-budget 90000 # 내비게이션 이후 예산
HYPERFRAMES_CAPTURE_PROXY=http://127.0.0.1:3128 npx hyperframes capture https://example.com # 이그레스 프록시 뒤에서
```

라이브 URL을 편집 가능한 HyperFrames 프로젝트로 캡처한다. 스크린샷은 레이어가 나뉜 장면이 되고, 에셋은 로컬로 내려받아지며, 결과는 `lint` / `preview` / `render`를 쓸 수 있는 일반 프로젝트다. 사용자가 영상의 출발점으로 URL을 주었을 때 쓴다.

`--timeout`은 페이지 내비게이션을 제한한다. `--capture-budget`은 내비게이션 이후 작업(폰트, 에셋, vision, contact sheet)을 위한 별도의 협력형(cooperative) 예산이다. 후자는 하드 벽시계 워치독이 아니며, 이미 진행 중인 네이티브 작업을 중단시킬 수 없다. 따라서 호출자가 정한 외부 데드라인은 세 번째의 별개 타임아웃이다. 외부 호출자의 타임아웃이 나면 캡처 결과는 알 수 없는 상태로 남는다. 이것은 HyperFrames가 멈췄다는 증거가 아니며, 내비게이션 타임아웃을 늘려야 한다는 뜻도 아니다. 마지막 단계를 기록하고, 어느 경계가 발동했는지 분류한다. `--skip-vision`은 선택적 AI 이미지 캡션만 끈다.

에이전트에는 `--json`을 쓴다. 결과에는 `ok`, 경고, `lastPhase`가 들어 있다. 명령은 또한 안정적인 `HYPERFRAMES_CAPTURE_PHASE` 레코드를 내보내므로, 워치독이 민감한 페이로드를 보관하지 않고도 마지막으로 시작, 완료, 저하된 단계를 보고할 수 있다.

0이 아닌 종료 코드, JSON `ok: false`, 또는 출력에 `BLOCKED.md`가 있으면 **즉시 중단**한다. 차단된 캡처의 부분 파일로는 렌더링, 빌드, 브랜드/디자인 데이터 추론을 하지 않는다. 성공한 캡처는 예산 안에서 선택적 단계를 저하시킬 수 있지만, 구조적 출력은 여전히 쓸 만해야 한다. 종료 코드 0과 파일 존재만으로는 성공이 아니다. 이번 호출의 JSON `ok: true`, `BLOCKED.md` 없음, 영상에 쓸 수 있는 에셋이 모두 확인되어야 한다. 재시도는 매번 새 출력 디렉터리에 실행한다. 차단된 시도의 부분 출력을 병합하거나 재사용하지 않는다.

## skills

`npx hyperframes skills`는 사용자가 한 번 하는 설정이다. HyperFrames 스킬 팩(references를 포함한 /hyperframes, /hyperframes-cli, /hyperframes-registry, /media-use, /figma, /slideshow, /remotion-to-hyperframes, /reverse-any-video, /style-sampling)을 로컬 AI 코딩 환경에 추가해서, 에이전트가 프레임워크 규칙을 따르게 한다. 스킬은 CLI와 함께 버전이 관리된다. HyperFrames를 업그레이드한 뒤에는 사용자가 `npx hyperframes skills update`로 새로 고칠 수 있다. 해당하는 시점이면 사용자에게 알려준다. 직접 실행하지는 않는다.
