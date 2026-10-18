# 영상

MP4는 요청이 있을 때만 만드세요. 소스는 영상 덱입니다. 장면마다 내레이션을 담은 HTML 파일 하나입니다. `visual-explainer-video`는 가상 시계에서 덱을 재생하고 모든 프레임을 저장하므로, 각 문장의 그림이 음성과 함께 나옵니다.

## 먼저 대본 쓰기

- 장면마다 주장은 하나, 각 1–3문장. 대부분의 영상은 6–12개 장면에 걸쳐 45–120초입니다. 훅(문제 또는 놀라운 수치)으로 시작하고, 기억할 한 줄로 끝내세요.
- 문장마다 그림이 바뀝니다: N번째 문장이 시작되면 그것이 N번째 박자(beat)입니다.
- 귀로 듣기 위해 쓰세요: 숫자와 기호는 풀어 쓰세요("fifty-six hundred"). 마침표가 있는 약어는 쓰지 마세요. 문장은 `.`, `!`, `?`에서 나뉩니다.

## 계약

렌더러는 덱을 CSS 픽셀 1280×720으로 열고, 1920×1080으로 녹화합니다. 렌더러는 속성을 설정하고 이벤트만 발생시키며, 모든 것을 그리는 것은 덱의 CSS와 JS입니다.

```html
<style>
  body { position: relative; width: 1280px; height: 720px; overflow: hidden; margin: 0; }
  section[data-say] { position: absolute; inset: 0; display: none; }
  section[data-beat], section[data-was] { display: grid; }          /* 지금 재생 중이거나, 떠나는 중 */
  section[data-was] { z-index: 2; animation: leave .5s forwards; }   /* 퇴장 */
  @keyframes leave { to { opacity: 0; } }
  .miss { opacity: 0; transition: opacity .6s; }
  [data-beat~="2"] .miss { opacity: 1; }                             /* 2번째 문장이 시작됨 */
</style>
<section data-say="Every read checks Redis first. A miss goes on to Postgres." data-hold="1">
  <h2>Ask Redis first.</h2> <svg>…</svg> <p class="miss">…</p>
</section>
<script>
  addEventListener('ve:beat', (e) => { /* e.target은 장면; e.detail은 { scene, beat } */ });
  addEventListener('ve:leave', (e) => { /* 그 장면의 반복 루프를 멈춤 */ });
</script>
```

| 렌더러가 설정하는 것 | 시점 |
|---|---|
| 장면에 `data-beat="0"` | 장면 시작; 문장이 시작될 때마다 `"0 1"`, `"0 1 2"`… 로 바뀜 |
| 이전 장면에 `data-was` | 다음 장면 시작; 그다음 변경 때 제거됨 |
| `ve:beat`와 `ve:leave` 이벤트(버블링됨) | 위 변경마다 |
| `p.ve-caption`의 텍스트 | 캡션이 켜져 있으면 문장마다; `.ve-caption`을 스타일링해 다시 꾸밀 수 있음 |

타이밍: 첫 문장 전 0.5초, 문장 사이 0.3초, 마지막 문장 후 0.9초, 그리고 `data-hold` 초. 소리 없는 문장은 캡션의 읽기 시간(초당 2.5단어, 최소 1.5초)만큼 지속됩니다. 빈 `data-say`는 3초간 유지됩니다.

CSS 애니메이션, Web Animations API, 타이머, `requestAnimationFrame`, canvas, SVG, three.js는 렌더러의 시계에서 동작합니다. `<video>`, `<audio>`, 나중에 로드되는 콘텐츠는 그렇지 않습니다. 폰트는 `<head>`의 `<link>`로 로드하세요.

## 룩

- 레지스터는 하나, 강조색도 하나, 그리고 손으로 그린 SVG. 색상 체계는 하나만 고르고, 그 토큰을 직접 설정하세요.
- **영상 예외:** 느린 주변 움직임이 도움이 되므로, 어떤 프레임도 완전히 정지해 있으면 안 됩니다. 30초 이상에 걸쳐 천천히 흘러가는 빛, 천천히 패닝하는 격자, 희미한 필름 그레인.
- 옆으로 눕힌 휴대폰 화면 기준으로 크기를 잡으세요: 본문 24px 이상, 라벨 15px 이상, 제목 48–88px, 다이어그램 노드 텍스트 22, 엣지 라벨 17, 선 굵기 2(강조 경로 3.5). 텍스트는 좌우에서 64px, 위에서 48px 떨어뜨리고, 아래 112px은 캡션을 위해 비워 두세요.
- 각 박자는 한 가지를 추가하거나 바꿉니다(경로는 `pathLength="1"`과 `stroke-dashoffset`으로 그려지고, 숫자는 올라감). 약 1.5초 안에 정착해야 합니다. 다이어그램당 보이는 상자는 8개 미만, 박자마다 초점은 하나.
- 재생(`diagrams.md`)은 장면으로 동작합니다. `kit/kit.css`에서 단계 진행 CSS를 복사하고, SVG를 `.ve-steps`에 넣으세요. `ve:beat`에서 각 `[data-s]` 부분은 첫 단계가 `e.detail.beat` 이하일 때 `.on`을, 박자가 0보다 크고 그 목록이 이를 포함할 때 `.now`를 받게 하세요.

## 확인한 뒤 렌더링

1. `visual-explainer-video deck.html --stills`는 장면마다 완전히 재생된 PNG 하나를 `deck.stills/`에 씁니다. 모든 이미지를 읽고, 잘린 장면, 붐비는 장면, 빈 장면을 고친 뒤 다시 실행하세요.
2. 음성 API 키를 설정했다면 줄마다 클립 하나를 만드세요(아래 참고). 키가 없으면 영상은 무음이 되고 캡션이 영상에 입혀집니다. 키는 절대 출력하지 마세요.
3. `visual-explainer-video deck.html [out.mp4] [--voice clips/] [--captions]`.
4. MP4 경로, 길이, 음성 여부 또는 "silent"를 보고하세요.

덱은 `~/.agent/diagrams/<name>.html`에 쓰고, MP4는 그 옆에 둡니다. 렌더러는 `ffmpeg`, `playwright-core`, Google Chrome(또는 `npx playwright-core install chromium-headless-shell`)이 필요합니다. `visual-explainer-video`가 PATH에 없거나 `playwright-core`가 없으면, 같은 인수로 `npx -y -p visual-explainer -p playwright-core visual-explainer-video`를 실행하세요. 저장소 체크아웃에서는 `npm install` 후 `node plugins/visual-explainer/video/render.mjs`를 쓰세요.

## 음성 클립

`--lines`는 문장마다 `<id><TAB><text>`를 출력합니다. 각 클립을 `<clips>/<id>.mp3`로 저장하세요(또는 `.wav`, `.m4a`, `.ogg`, `.flac`, `.aiff`). id는 텍스트의 해시이므로, 편집 후에는 바뀐 줄만 새 클립이 필요합니다.

| 제공자 | 키 | 요청 | 응답 |
|---|---|---|---|
| ElevenLabs | `ELEVENLABS_API_KEY` | `POST https://api.elevenlabs.io/v1/text-to-speech/<voice_id>`, 헤더 `xi-api-key`, `{"text", "model_id": "eleven_multilingual_v2"}` | MP3 |
| Seed Audio (fal) | `FAL_KEY` | `POST https://fal.run/bytedance/seed-audio-1.0`, 헤더 `Authorization: Key …`, `{"prompt": text, "voice": "stokie_en"}` | JSON; `.audio.url`을 내려받기 |
| OpenAI | `OPENAI_API_KEY` | `POST https://api.openai.com/v1/audio/speech`, bearer, `{"model": "gpt-4o-mini-tts", "voice": "coral", "input": text}` | MP3 |
| xAI | `XAI_API_KEY` | `POST https://api.x.ai/v1/tts`, bearer, `{"text", "voice_id": "eve", "language": "en"}` | MP3 |

사용자가 고른 제공자와 음성을 쓰고, 없으면 설정된 첫 번째 키를 씁니다. `--lines`를 순회하며 이미 있는 클립은 건너뛰고, 각 클립은 `<id>.tmp`에 쓴 뒤 요청이 성공했을 때만 이름을 바꾸세요(`curl --fail … && mv`). 그래야 오류 응답 본문이 클립이 되지 않습니다.

## 실제 웹 앱 튜토리얼

"X의 워크스루를 녹화해 줘"라면, 렌더러 대신 Playwright 스크립트로 실제 앱을 녹화하세요.

1. 작업을 한 번 수행하고, 시작 URL과 각 컨트롤의 역할 또는 텍스트 로케이터를 적어 두세요. 로그인된 앱이라면, 사용자가 `npx playwright-core codegen --save-storage=auth.json <url>`로 저장소 상태를 만들게 하세요. 자격 증명은 절대 요청하지 마세요.
2. 단계마다 동작 하나와 문장 하나. 처음에는 제목 단계를, 마지막에는 마무리 단계를 두세요.
3. `addInitScript` 커서와 함께 1280×720으로 녹화하세요(`recordVideo`). 클릭 전에는 `page.mouse.move(x, y, { steps: 25 })`로 커서를 움직이세요. 각 동작 후에는 그 단계의 클립 길이와 약 0.8초를 기다리고, 각 단계의 시작 시점을 기록하세요.
4. ffmpeg로 각 클립을 단계 시작 시점에 배치하고(`adelay`, `amix`), 먹싱하고, 앞부분의 빈 구간을 잘라내세요. 음성 키가 없으면 각 문장을 페이지 위 캡션으로 보여주세요.
