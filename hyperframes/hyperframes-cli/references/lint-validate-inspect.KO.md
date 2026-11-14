> AI 번역본. 원본: lint-validate-inspect.md. 분석 근거는 원본이다.

# lint, check, snapshot

빠른 정적 피드백이 필요할 때는 `lint`를 쓴다. 최종 게이트로는 `check`를 쓴다. `check`는 같은 linter를 다시 실행한 뒤, 하나의 브라우저 세션에서 runtime, layout, motion, contrast를 함께 감사한다. `check` 바로 앞에 중복되는 단독 `lint`를 연결해 실행하지 않는다. `snapshot`은 정지 프레임과 확대 crop을 캡처하는 독립 유틸리티다. `validate`, `inspect`, `layout`도 아직 동작하지만 deprecated 상태다. `check` 한 번 실행으로 이 셋을 모두 다루기 때문이다.

## 원칙 (모션 중심 작업)

composition이 애니메이션 중심이라면 `preview`나 `render`에 손대기 전에 아래 검사를 먼저 돌린다.

- 첫 HTML 패스가 끝나면 `lint`를 실행해 빠르게 피드백을 받는다. 이것은 반복 작업을 돕는 도구이지, 별도의 최종 게이트가 아니다.
- 첫 전체 패스에서 `check --snapshots`를 실행한다. overview 프레임과 finding별 crop으로 auditor가 무엇을 보았는지 확인할 수 있다.
- 자동 경고를 조정하기 전에 PNG를 직접 본다. 눈은 auditor가 놓치는 것을 잡고, auditor는 눈이 놓치는 것을 잡는다.
- layout 에러는 결함으로 취급한다. 다만 snapshot으로 레이어링이 의도된 것임이 확인되면 `data-layout-allow-overflow` / `data-layout-allow-overlap` / `data-layout-allow-occlusion` / `data-layout-allow-caption-zone`(caption band 전용)으로 표시한다.
- 모션 의도는 `*.motion.json` sidecar에 적어 `check`가 자동으로 검증하게 한다(seek 시 entrance 발동, stagger 순서, 프레임 내 유지, liveness). 이것은 "MP4를 직접 보는 것"을 가장 가깝게 자동화한 방법이며, 렌더와 preview 사이의 차이처럼 눈이 놓치는 버그를 잡는다(아래 **Motion verification** 참고).

## lint

```bash
npx hyperframes lint                  # current directory
npx hyperframes lint ./my-project     # specific project
npx hyperframes lint --verbose        # info-level findings
npx hyperframes lint --json           # machine-readable
```

`index.html`과 `compositions/` 안의 모든 파일을 검사한다. 에러(반드시 수정), 경고(수정 권장), info(`--verbose`일 때 표시)를 보고한다. `data-composition-id` 누락, 같은 `data-track-index`에서 트랙이 겹치는 문제, 등록되지 않은 timeline, GSAP/CSS transform 충돌을 잡아낸다.

`<video>`/`<audio>`는 중첩 깊이와 상관없이 동작한다. `compositions/*.html` sub-composition 안이나 wrapper `<div>` 안에 있어도 된다. runtime이 평평한 DOM 쿼리로 미디어를 찾아 어디에 있든 seek하고 decode하기 때문이다(`packages/core/src/runtime/{media,startResolver}.ts`). 렌더 후에는 video가 있는 장면마다 `snapshot`을 찍어 패널에 실제로 영상이 나오는지 확인한다. 영상이 나와야 할 자리가 비어 있거나 검게 나온다면 placeholder가 아니라 실제 버그다.

## check

```bash
npx hyperframes check                    # current directory: the full browser gate
npx hyperframes check ./my-project       # specific project
npx hyperframes check --json             # agent-readable envelope {ok, browserSkipped, lint, runtime, layout, motion, contrast, craft, hdr, snapshots}
npx hyperframes check --snapshots        # also write overview frames (annotated) + per-finding crops
npx hyperframes check --samples 15       # denser timeline sweep (default 9)
npx hyperframes check --at 1.5,4,7.25    # explicit hero-frame timestamps
npx hyperframes check --at-transitions   # also sample every tween start/end boundary
npx hyperframes check --tolerance 4      # allowed overflow px before reporting (default 2)
npx hyperframes check --timeout 30000    # initial render-ready + navigation minimum in ms (defaults: 3000 / 10000)
npx hyperframes check --no-contrast      # skip the WCAG audit while iterating
npx hyperframes check --strict           # exit non-zero on warnings too (default: only errors)
```

반드시 `npm run`을 거치지 말고 `npx hyperframes check`로 실행한다. 도구 timeout의 SIGTERM이 오면 npm은 즉시 종료되지만, `check`는 계속 실행되어 stderr에 적힌 파일(`.hyperframes/artifacts/checks/`)에 보고서를 저장한다. 명령은 하나이고 Chrome 부팅도 한 번이다. `check`는 먼저 linter를 실행한다. lint 에러가 있으면 check는 실패하지만, composition을 로드할 수 있는 한 브라우저 감사는 계속 실행되어 결과를 함께 보고한다. 단, root에 `data-composition-id`가 없어서 로드할 composition이 없는 경우는 예외다. 브라우저가 전혀 실행되지 않았다면(로드할 composition이 없음, linter 크래시, 브라우저 실행 실패) `browserSkipped`가 `true`가 되고 `layout`, `motion`, `contrast` 섹션은 비어 있게 된다. 이는 "깨끗함"이 아니라 "검사되지 않음"을 뜻한다. 그 밖의 경우에는 번들된 composition을 한 번 로드하고, navigation 전에 runtime 리스너를 연결한 뒤, 하나의 seek grid를 따라 샘플마다 모든 감사를 실행한다.

- **Runtime**: JavaScript console 에러, 처리되지 않은 예외, 실패한 네트워크 요청(media 파일의 `ERR_ABORTED`는 제외), HTTP 4xx/5xx.
- **Layout**: 컨테이너나 캔버스 밖으로 넘치는 텍스트, 자기 박스에 의해 잘린 텍스트, 계속 표시되는 텍스트의 겹침과 가림(대략적인 가림 비율 포함), 다른 모든 clip보다 위에서 대부분의 시간 동안 캔버스를 덮는 불투명 요소(`canvas_covered`, 해당 요소를 이름으로 지목), 클리핑 컨테이너를 벗어나는 자식 요소. 투명한 `<video>`(`remove-background` cutout) 위의 텍스트는 프레임의 alpha 값을 기준으로 단어 단위로 측정한다. 일부만 가려지면 info로 표시하고 가려진 비율을 함께 보여 준다. 단어 하나가 80% 가려지거나 인접한 두 단어가 각각 절반씩 가려지면 에러다. 프레임을 읽을 수 없으면 불투명한 것으로 간주하고 `video_alpha_unread` 메모를 남긴다.
- **Motion**: 같은 seek된 timeline에 대해 `*.motion.json` sidecar의 assertion을 검사한다(아래 참고).
- **Contrast**: 보이는 텍스트에 대해 WCAG AA를 5개 grid 지점에서 샘플링해 검사한다. 실패는 **에러**이며, 각 finding에는 샘플링된 fg/bg 색상, 측정된 대비와 요구 대비, 같은 팔레트 방향의 권장 색상이 함께 붙는다. 그래서 대부분의 contrast 수정은 스크린샷 없이도 가능하다.
- **Craft**: 경고만 낸다. `--strict`에서도 마찬가지다(영화는 의도적으로 하나를 어길 수 있기 때문이다). 전체 영화를 8 fps로 훑어서 측정하며, `--range`를 쓰면 건너뛴다. 각 메시지는 수정 방법과 읽어야 할 참고 문서를 알려 준다.
  - `line_unread`: 읽기 가능한 크기의 줄(1080 기준 높이 30 px 이상)이 화면에 있는데 최소 노출 시간보다 짧을 때. 최소 시간은 1–2단어면 0.4 s, 그 밖에는 0.5 s의 ¾ + 단어당 0.3 s다(3단어 1.05 s, 6단어 1.73 s). 영화의 마지막 줄은 2 s가 필요하다. 시작과 끝 시점은 약 0.01 s 단위로 다시 측정한다. Captions 트랙의 텍스트와 `data-layout-ignore` 요소는 면제된다.
  - `dead_stretch`: `keepsMoving` 분류기가 아무 변화도 보지 못하는 구간이 3 s를 넘을 때. 마지막 3 s와 `data-hold` 요소가 화면에 있는 동안은 면제된다. `sweep_static`이 발동하거나 영화 전체에 대한 `keepsMoving` assertion이 한계를 정한 경우에는 조용히 넘어간다.
  - `text_below_floor`: 프레임 짧은 변의 2.6%(1080 기준 28 px)보다 작은 텍스트가 0.5 s 이상 유지될 때. 파일 하나당 finding 하나로 묶여, 해당 요소를 모두 나열한다.
  - `first_frame_empty`: 프레임 0이 배경만 그리고 텍스트, 이미지, video, canvas, svg 중 아무것도 그리지 않을 때. 또는 불투명 요소가 다른 모든 clip을 덮고 있을 때(메시지가 해당 요소를 지목한다). 소셜 플레이어에서는 썸네일로 보이는 프레임이다.
  - `film_silent`: 15 s를 넘는 영화에 음소거되지 않은 `<audio>`나 소리가 나는 `<video>`가 하나도 없을 때.
- **Audio**: 렌더가 믹싱하는 clip들을 보고서의 `audio` 섹션에 보여 준다. lint가 브라우저 단계를 멈춘 경우에도 실행된다. 원격 source는 가져오지 않는다.
  - `audio_source_unreadable`(error): 파일을 오디오로 읽을 수 없어 렌더 믹스가 실패하고 렌더가 중단된다. `src`가 오디오 트랙이 있는 파일을 가리키도록 하거나 파일을 다시 export한다.
  - `audio_source_rejected`(error): 파일에 오디오 트랙이 없어 렌더가 시작 전에 중단된다. `src`가 오디오가 있는 파일을 가리키도록 하거나, `<video>`에서 `data-has-audio="true"`를 제거한다.
  - `audio_starts_past_source_end`(warning): `data-media-start`가 파일 길이와 같거나 그보다 뒤에 있어 clip이 아무것도 재생하지 않는다. `data-media-start`를 길이보다 작게 낮춘다.
  - `audio_clip_silent`(warning): clip이 재생하는 구간 전체에서 파일이 무음이다. 해당 구간에 소리가 있는지 확인하거나 `data-media-start`를 소리가 있는 위치로 옮긴다.
  - `audio_none`(info): 어떤 clip도 오디오를 재생하지 않고, 오디오 트랙이 있는 음소거되지 않은 `<video>`도 없다. 무음 영화라면 괜찮다. 그렇지 않다면 `<audio>`를 추가한다.
  - `audio_check_unavailable`(info): 오디오 검사 자체가 실패해 clip을 확인하지 못했다(메시지에 이유가 나온다). 다시 실행하고, 반복되면 `hyperframes doctor`를 실행한다.
  - `audio_src_not_found`(error, `lint`에서 발생): `<audio src>`가 프로젝트에 없는 파일을 가리켜 렌더가 무음이 된다. 파일을 추가하거나 경로를 고친다.
  - 비용: 각 미디어 probe(오디오 메타데이터 렌더가 쓰는 것, 그리고 render의 미디어 타입 규칙)는 파일당 최대 한 번만 실행된다. `<video>`에 소리가 있는지는 사용할 때마다 probe한다. 이 검사는 브라우저 단계와 함께 돌아가며, 최대 4개 파일을 동시에 처리한다. 길이가 3 s를 넘는 clip은 먼저 1초짜리 세 지점에서 샘플링하고, 세 지점 모두 무음일 때만 전체를 decode한다.

모든 finding에는 selector, 요소의 `data-*` 식별자, composition 소스 파일, bbox, 샘플 시각이 붙는다. JSON에서 수정해야 할 HTML로 바로 이동해 다시 실행할 수 있다.

**심각도는 지속성을 고려한다.** 단일 grid 샘플에서만 관찰된 동적 문제(entrance/exit 과도 상태)는 info로 내려가며 게이트가 되지 않는다. 여러 샘플에 걸쳐 유지된 문제만 종료 코드를 막는다. 유지된 `content_overlap`은 에러이고, 유지되고 부분적으로만 보이는 `canvas_overflow`가 캔버스의 5% 이상을 넘으면 경고로 올린다. 좌표계 finding(`escaped_container`, `panel_out_of_canvas`, `connector_detached`)은 한 좌표계에서 계산되었지만 다른 좌표계에서 그려진 geometry를 표시한다. 예를 들어 offset parent에서 아주 멀리 벗어난 요소, 캔버스 가장자리에 걸려 멈춘 패널, 어떤 노드에도 붙지 않은 connector 선 등이다. `<canvas>`에 그린 텍스트에는 DOM 박스가 없으므로 `canvas_overflow`가 볼 수 없다. 대신 `canvas_content_at_edge`가, 캔버스 픽셀에 날카로운 내용(그려진 텍스트, 뚜렷한 도형)이 프레임 가장자리를 따라 보일 때 경고한다. 의도된 full-bleed 아트(파티클, 사진)는 `data-layout-allow-overflow`로 표시한다. 3 s 이상의 composition에서 모든 샘플에 걸쳐 눈에 띄는 변화가 없으면 `check`는 `sweep_static`으로 실패한다. GSAP timeline이나 tween, CSS나 Web animation이 끝나지 않은 채 같은 시각을 계속 유지하는데 프레임이 변하지 않는다면, seek가 페이지를 구동하지 못하고 있다는 뜻이므로 통과시키지 않는다. 그 밖에 변하지 않는 프레임(정지된 타이틀 카드, 오디오만 진행되는 구간)은 경고이며 `--strict`에서는 실패한다. 정지 상태가 의도된 composition은 root에 `data-no-timeline`을 붙여 검사를 건너뛸 수 있다. fingerprint에는 요소별 opacity가 포함되므로, opacity만 바뀌는 reveal(코드 타이핑, 순차 fade)도 움직임으로 센다. 다만 샘플링 시각에 아직 진행 중일 때만 그렇다. 전형적인 함정은 reveal이 일찍 끝난 뒤 영화 끝까지 정지 프레임을 유지하는 경우다. 모든 샘플이 정착된 상태에 떨어지므로 check는 화면이 전혀 움직이지 않는다고 경고한다(`--strict`에서는 실패). reveal을 타임라인 전체에 펼치거나, 정지 구간에 실제 다음 동작을 주라(다음 컨트롤로 향하는 커서, 카메라의 다음 움직임). 검사를 통과시키려고 느린 drift, 깜빡이는 caret, loop를 억지로 붙이지 않는다.

**Escape hatches**(HTML에 의도를 표시한 뒤 다시 실행한다):

- `data-layout-allow-overflow`: 넘치는 것이 의도된 경우(entrance/exit 이동).
- `data-layout-allow-overlap`: 텍스트를 의도적으로 겹치는 경우(예: 제목 위에 놓인 데모 커서 라벨). 표시된 텍스트 블록에만 적용되며 상속되지 않는다. scene이나 root wrapper가 아니라 겹치는 해당 요소에만 표시해야, 관련 없는 하위 요소 충돌은 계속 감사할 수 있다.
- `data-layout-allow-occlusion`: 요소가 텍스트를 덮도록 의도된 경우.
- `data-layout-allow-caption-zone`: `--caption-zone` 아래에서 의도된 하단 1/3 또는 caption band 문구인 경우. 표시된 요소와 모든 하위 요소(`closest`)에 적용된다. `caption_zone_collision`만 무시하고, overflow/overlap/occlusion은 무시하지 않는다. band 문구를 담는 가장 좁은 wrapper에 붙이는 것이 좋다.
- `data-layout-ignore`: 감사하지 말아야 할 장식 요소.
- `data-hold`: 의도된 정지. 이 요소가 화면에 있는 동안은 `dead_stretch`가 그 시간을 세지 않는다.

**Opt-in 파이프라인 게이트**(오케스트레이터가 사용하며 기본값은 꺼져 있다):

```bash
npx hyperframes check --caption-zone "x0=0;y0=.82;x1=1;y1=1;severity=error;seek=.25,1"
npx hyperframes check --frame-check     # media (img/svg/video/canvas) out-of-frame detection
```

`--caption-zone`은 분수 형태의 band 기하값을 받는다. `x0/y0/x1/y1`은 필수이며, composition 자체 캔버스 기준 0–1 분수다(portrait 포함). 선택적으로 `severity`와 쉼표로 구분한 `seek` 분수를 줄 수 있다. 이 옵션은 band와 겹치는 텍스트 요소의 DOM 박스(`getBoundingClientRect`)를 표시한다. 의도된 하단 문구는 요소나 가장 가까운 wrapper에 `data-layout-allow-caption-zone`을 붙여 면제한다(Escape hatches 참고). `--frame-check`는 최소 캔버스 차원의 6%와 120px 중 큰 값을 넘어 캔버스를 벗어난 media 요소를 보고한다.

**Contrast 에러 수정** — 임계값은 일반 텍스트 4.5:1, 큰 텍스트(24px 이상, 또는 굵은 19px 이상) 3:1이다. finding의 `suggestedColor`는 이미 올바른 방향(어두운 배경이면 밝게, 밝은 배경이면 어둡게)에서 가장 가까운 적합 색상을 골라 준다. 이를 적용하거나 팔레트 계열 안에서 조정한 뒤 `check`를 다시 실행한다.

## Motion verification (`*.motion.json` sidecar)

`check`는 렌더러가 쓰는 것과 같은 seek된 timeline을 기준으로 **모션 의도**를 검증한다. "MP4를 렌더해서 직접 보기"를 가장 가깝게 자동화한 방법이다. 레이아웃 샘플링으로는 잡을 수 없는 버그를 잡는다. 예를 들어 seek가 entrance reveal을 지나쳐 버리는 경우, stagger 순서가 틀린 경우, tween 중에 요소가 프레임 밖으로 떠내려가는 경우, 장면이 얼어붙는 경우다.

composition 옆에 `*.motion.json` sidecar를 둔다(같은 디렉터리에 composition이 여럿이면 HTML 파일 basename과 맞춘다). `check`가 플래그 없이도 자동으로 찾는다. 저작 프레임워크를 바꿀 필요도 없다. sidecar가 없으면 `check`는 이전과 완전히 같이 동작한다.

```json
{
  "duration": 6,
  "assertions": [
    { "kind": "appearsBy", "selector": "#headline", "bySec": 0.5 },
    { "kind": "before", "a": "#headline", "b": "#cta" },
    { "kind": "staysInFrame", "selector": ".card" },
    { "kind": "keepsMoving", "withinSelector": ".scene" }
  ]
}
```

| Assertion                      | Fails (code) when                                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `appearsBy(selector, bySec)`   | not visible (opacity ≥ 0.5) by `bySec` — `motion_appears_late`                                                              |
| `before(a, b)`                 | `a` does not first appear strictly before `b` — `motion_out_of_order`                                                       |
| `staysInFrame(selector)`       | once visible, its box leaves the canvas — `motion_off_frame`                                                                |
| `keepsMoving(withinSelector?)` | a fully-static window exceeds `maxStaticSec` (default 2s); the film's final 3 s (an end card) never count — `motion_frozen` |

`duration`, `withinSelector`, `maxStaticSec`는 선택 항목이다. finding은 **기본적으로 에러**이며, 레이아웃 finding과 같은 사람용 출력과 `--json` 출력에 나타난다. 어떤 selector도 매칭하지 않으면 조용히 통과시키지 않고 `motion_selector_missing`으로 보고한다. 오타 난 selector는 크게 실패한다. 피드백 루프에서는 렌더를 눈으로 보는 대신 이것을 쓴다. 모션이 무엇을 해야 하는지 assertion으로 적어 두면, seek가 의도에서 벗어날 때 `check`가 알려 준다.

## snapshot

```bash
npx hyperframes snapshot                       # 5 key frames as PNG
npx hyperframes snapshot ./my-project          # specific project
npx hyperframes snapshot --frames 10           # evenly-spaced N frames
npx hyperframes snapshot --range 3,5 --frames 8 # 8 frames within root-timeline seconds 3–5
npx hyperframes snapshot --composition intro --frames 8 # 8 frames within this data-composition-id
npx hyperframes snapshot --review              # beat sheet, seam strips, phone sheet
npx hyperframes snapshot --review --json       # same, with paths and times as JSON
```

정지 PNG를 만든다. `--output`을 주지 않으면 실행할 때마다 `.hyperframes/artifacts/snapshots/<id>/`에 저장된다. `snapshot`은 독립적인 캡처이고, `check --snapshots`가 게이트다.

`--at`, `--range START,END`(초), `--composition <data-composition-id>`(CSS selector가 아님) 중 하나를 고른다. `--frames` 기본값은 5다. range와 composition은 끝 직전에서 샘플링하며 끝 프레임을 추가하지 않는다. `--at`은 `--no-end`를 주지 않으면 끝 프레임을 하나 추가한다.

`--review`는 영화의 흐름을 보여 주는 프레임을 고른다. Scene은 composition의 최상위 timed clip과 sub-composition host를 뜻하며, `timeline`이 나열하는 것과 같다(captions와 audio는 제외). `--composition`을 주면 하나의 composition으로 범위를 좁힌다. `review-beats.jpg`(각 scene의 시작 + 0.3 s와 중간, 그리고 timed `data-beat="name"` 요소의 시작 + 0.3 s, 시각과 id로 라벨링)를 쓰고, `review-seam-NN.jpg`(모든 cut 주변 −0.2, −0.1, 0, +0.1, +0.2 s의 프레임)와 `review-phone.jpg`(beat 프레임을 360 px 너비로, 휴대폰 크기에서 가독성을 보기 위함)를 만든다. 이들은 `beat-*.png`, `seam-*.png` 정지 이미지와 함께 놓인다. scene이 둘보다 적으면 beat를 고르게 펼친다. `--json`은 `{ok, outputDir, frames[{path,time,role,label}], contactSheets, review{window, scenes, beats, seams[{time,from,to,times,paths,sheet}], sheets, notes}}`를 출력한다.

### 검증을 깔끔하게 유지하고 실제 픽셀을 검사한다

처음 30초의 전체 해상도 프레임, 마운트된 각 scene, 보고된 모든 문제 구간을 검사한다. contact sheet로 문제 시점을 찾고, 얇은 가장자리, 유리, 파티클, WebGL geometry는 close-up으로 판단한다. 라이브 preview와 디코딩된 렌더를 같은 시각에서 비교한다. canvas shader 결함은 DOM/layout 감사를 통과하고도 살아남을 수 있다. 결과가 기기마다 다르면 브라우저/GPU와 캡처 경로를 기록한다. 렌더링 기본값을 바꾸기 전에 실패하는 material이나 통과하는 material을 분리해 확인한다.

Managed snapshot storage는 최신 run 폴더 10개, 현재 리비전의 최신 증거, 유지되는 렌더 리비전의 증거, 최신 snapshot을 보관한다. 라이브 캡처와 24시간 이내의 폴더도 보존된다. 자동 정리는 오래되어 대상이 된 UUID 폴더 전체를 contact sheet와 설명까지 포함해 삭제한다. 임의의 `--output` 폴더는 건드리지 않는다. 의도된 before/after 증거는 이 managed storage 밖에 따로 보관한다.

일회성 검사에는 임시 출력 폴더를 만들고, 확인이 끝나면 그 폴더를 삭제한다. 더 넓은 정리는 `hyperframes clean --dry-run`으로 살펴본다. `clean --snapshots`는 snapshot 증거를 명시적으로 버린다. 그 증거가 더 이상 필요 없을 때만 쓴다. `.hyperframes` 전체를 지우라고 권하지 않는다. 프로젝트 히스토리와 기타 상태도 함께 들어 있기 때문이다.

### 보고된 finding 확대해서 보기

`hyperframes check --snapshots`는 bbox를 가진 에러 finding마다 `finding-NN-<code>.png` crop을 이미 쓴다. 하지만 무엇을 봐야 할지 알고 나면 같은 확대 화면을 단독으로도 얻을 수 있다.

```bash
npx hyperframes check --snapshots               # reports a finding, e.g. content_overlap on "#cta"
npx hyperframes snapshot --zoom "#cta"           # crop the element to verify the defect, at 3x density
npx hyperframes snapshot --zoom "100,50,400,300" --zoom-scale 2   # or an exact pixel region
# fix the composition HTML, then re-check:
npx hyperframes check
```

`--zoom`은 CSS selector 또는 정확한 `x,y,w,h` 픽셀 영역을 받으며, 항상 실제 고밀도 crop을 만든다(`deviceScaleFactor`를 높이며, CSS zoom이나 viewport 변경은 하지 않는다). 그래서 composition의 레이아웃과 렌더 결정성이 건드려지지 않는다. 매칭되는 selector가 없으면 전체 프레임으로 조용히 대체하지 않고 명시적으로 에러를 낸다. 대상에 보이는 박스가 없으면(접혔거나 캔버스 밖으로 애니메이션되어 있으면) 얇은 조각으로 쓰지 않고 메모와 함께 해당 프레임을 건너뛴다.

## Deprecated: validate, inspect, layout

세 명령 모두 계속 동작하며, stderr에 deprecation 안내를 출력하고, `--json`에서 `_meta.deprecated: true`로 표시한다. 기능은 `check`에 들어가 있다.

- `validate`(runtime 에러 + contrast) → `check`(contrast 실패는 이제 수정 payload가 붙은 게이트 에러이며 경고가 아니다).
- `inspect` / `layout`(layout 스윕 + motion sidecar) → `check`(같은 플래그: `--samples`, `--at`, `--at-transitions`, `--tolerance`, `--strict`).

스크립트를 옮기려면 그 순서를 `check` 한 번 호출로 바꾼다. 스캐폴드된 프로젝트의 `npm run check`는 이미 `check`를 가리킨다.
