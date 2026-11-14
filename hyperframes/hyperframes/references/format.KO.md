> AI 번역본. 원본: format.md. 분석 근거는 원본이다.

# 컴포지션 포맷

`SKILL.md`의 계약 뒤에 있는 세부 내용이다. 전체 레퍼런스: `npx hyperframes docs compositions`, `docs data-attributes`, `docs troubleshooting`.

## 프로젝트의 구조

```html
<!-- index.html: 일반 문서. 변수를 선언하고 씬을 마운트한다 -->
<html
  data-composition-variables='[{"id":"headline","type":"string","label":"Headline","default":"…"}]'
>
  <body>
    <div
      id="root"
      data-composition-id="main"
      data-start="0"
      data-duration="12"
      data-width="1920"
      data-height="1080"
    >
      <div
        id="intro"
        data-composition-id="intro"
        data-composition-src="compositions/intro.html"
        data-start="0"
        data-duration="4"
        data-track-index="1"
        data-width="1920"
        data-height="1080"
      ></div>
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
```

```html
<!-- compositions/intro.html: 모든 내용은 <template> 안에 둔다 -->
<template>
  <style>
    #root {
      position: absolute;
      inset: 0;
    }
  </style>
  <div id="root" data-composition-id="intro" data-width="1920" data-height="1080">
    <h1 id="headline" class="clip" data-start="0.4" data-duration="3" data-var-text="headline">
      …
    </h1>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(
      "#headline",
      { opacity: 0, filter: "blur(8px)" },
      { opacity: 1, filter: "blur(0px)", duration: 0.18, ease: "power4.out" },
      0.4,
    );
    window.__timelines["intro"] = tl;
  </script>
</template>
```

- 호스트, 씬 루트, 타임라인 키에는 같은 id를 준다. 호스트 id가 씬의 id와 다르면 렌더링할 때마다 씬당 45초를 기다린 뒤 정지된 프레임을 보여 준다. `<template>` 밖의 스타일과 스크립트는 버려진다.
- 씬 루트 크기는 고정 픽셀이 아니라 `inset: 0`으로 잡는다. 캔버스는 `data-width` × `data-height`다.
- 조립된 페이지 전체에서 id를 유일하게 유지한다(접두어를 붙인다: `#intro-title`). 씬의 타임라인은 자기 파일 밖의 요소에 닿을 수 없다.
- 씬 안에서는 `from`이 아니라 `fromTo`를 쓴다. 호스트는 씬이 보일 때마다 다시 seek하는데, `from`은 시작 상태를 한 번만 기록하므로 뒤로 seek하면 값이 어긋난다.
- 씬의 타임라인을 루트 타임라인에 `add()`하지 않는다. 런타임이 각 씬을 직접 구동하며, 중첩하면 두 번 seek된다.

## 가장 자주 쓰는 속성

| 속성                                           | 의미                                                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `data-start`, `data-duration`                  | 초 단위. 요소를 선언한 파일 기준의 로컬 값이다                                                      |
| `data-track-index`                             | Studio 레인 전용이다. 그리는 순서는 CSS `z-index`가 정한다                                          |
| `data-track-kind`                              | 씬 호스트에 `graphics` 또는 `captions`를 준다(비디오와 오디오는 태그에서 정해진다)                   |
| `data-composition-src`, `data-variable-values` | 씬 파일을 마운트한다. 마운트별 변수 값을 준다(JSON 객체)                                            |
| `data-media-start`                             | 원본 미디어 안의 오프셋이다(트림)                                                                   |
| `data-playback-rate`                           | 일정한 재생 속도다. 0.1–10                                                                          |
| `data-has-audio="true"`                        | `<video>`가 자기 소리를 유지한다. 시간이 있는 `<video>`에 이것도 `muted`도 없으면 린트에 실패한다  |
| `data-volume`, `data-fade-in`, `data-fade-out` | 게인(1 = 0 dB, 최대 3.98 = +12 dB)과 가장자리 페이드다. 엔벨로프는 `data-automation`을 쓴다(`/media-use`) |
| `data-link`, `data-sync-origin`                | 하나로 편집되는 비디오와 오디오다(연결된 클립 참조)                                                  |
| `data-hidden`                                  | 미리보기와 렌더링에서 숨긴다. 되돌릴 수 있다                                                        |
| `data-no-timeline`                             | 정지 컴포지션의 루트에 쓴다. 기다릴 타임라인이 없다는 뜻이다                                        |

## 변수

- `{id, type, label, default}` 배열을 선언한다. 영상 전체의 변수는 `index.html`의 `<html>`에, 씬이나 블록 파일의 변수는 그 파일의 `<html>`(또는 루트 요소)에 둔다. 변수는 각 마운트 안에 머문다. 타입: `string`(`placeholder`, `maxLength`), `number`(`min`, `max`, `step`, `unit`), `color`, `boolean`, `enum`(`options: [{value, label}]`).
- 스크립트 없이 바인딩한다: `data-var-text="id"`, `data-var-src="id"`(소리가 있는 미디어에는 실제 대체 `src`를 유지한다), CSS의 `var(--id)`. 로직이 필요하면 초기화 때 한 번 `window.__hyperframes.getVariables()`를 호출한다.
- 값은 id를 키로 하는 객체다. 호스트의 `data-variable-values`는 마운트 하나를 설정한다. Studio의 Variables 패널과 배치 렌더링은 루트의 변수만 설정하므로, 블록 하나를 바꾸려면 그 호스트의 값을 바꾼다. 변수로는 루트의 `data-duration`을 바꿀 수 없다.

## 폰트

- 번들되어 있어 이름으로 바로 해석된다: Inter, Montserrat, Outfit, Nunito, Oswald, League Gothic, Archivo Black, Space Mono, IBM Plex Mono, JetBrains Mono, EB Garamond, Playfair Display, Source Code Pro, Noto Sans JP, Roboto, Open Sans, Lato, Poppins. Helvetica, Arial, Times, Menlo 같은 일반 시스템 폰트는 이 중 가장 가까운 것으로 바뀐다.
- 번들에는 패밀리마다 라틴 문자 몇 가지 굵기만 들어 있다(Inter는 400, 700, 900). 컴파일러는 다른 굵기와 문자 체계를 위해 이 패밀리들을 Google Fonts에서 여전히 가져오고, 결과를 `~/.cache/hyperframes/fonts`에 캐시한다.
- 그 밖의 패밀리는 쓰는 파일에 `@font-face`가 있어야 한다. 없으면 린트가 `font_family_without_font_face`로 실패한다. 프로젝트 안의 파일이라면 `src: url('assets/fonts/x.woff2')`를 쓴다(캡처한 사이트의 폰트이거나, 직접 내려받아 그 위치에 둔 파일). `local('Exact Name')`만 있는 face는 이 컴퓨터에 설치된 폰트를 그린다. 클라우드 렌더링에는 그 폰트가 없다(린트는 `font_face_local_only` 경고를 낸다). 그러므로 영상이 클라우드에서 렌더링될 수 있다면 파일을 함께 넣는다.

## 타이밍과 타임라인

- 클립은 `[start, start + duration)` 구간에서 보인다. 끝과 정확히 맞물리는 끝 상태는 렌더링되지 않는다.
- 컴포지션의 루트 타임라인만 일시정지된다. 그 안에 중첩된 타임라인은 그렇지 않다. `tl.play()`는 쓰지 않는다.
- 씬의 시계는 호스트의 `data-start`에서 0으로 시작한다. 미디어의 `data-start`는 그 미디어가 속한 컴포지션 기준의 로컬 값이다. `data-duration`이 없는 `<video>`/`<audio>`는 전체 길이만큼 재생된다. `data-duration`이 없는 `<img>`는 3초 동안 보인다.
- 호스트의 `data-duration`은 씬이 차지하는 슬롯이다. 씬 타임라인이 더 짧으면 마지막 프레임을 유지하고, 슬롯이 비디오보다 짧으면 끝날 때 빈 화면이 된다.
- `data-start`가 있는 루트 자식은 런타임이 전체 프레임으로 배치한다. 시간이 없는 전체 화면 배경에는 `position: absolute; inset: 0`이 필요하다. 없으면 크기가 0으로 무너진다.
- 셰이더 전환이나 HDR 미디어가 있는 영상에서는 컴포지션 루트의 채우기(fill)가 버려진다. 채우기는 전체 화면을 덮는 자식에 준다.
- `data-start="intro + 0.5"`는 `intro`가 끝난 뒤에 시작한다(공백이 필요하다). 오타, 없는 id, 순환 참조는 조용히 0으로 해석된다. 그래서 이런 식으로 시간을 잡았다면 스냅샷으로 확인한다.
- 다른 시간 요소 안에 중첩된 클립은 `data-start`를 그 요소가 아니라 컴포지션 기준으로 센다. 그리고 그 요소가 보이는 동안에만 보인다. `timeline`은 클립을 부모 아래에 나열하고, 시간 창이 어긋나면 `never visible`을 경고한다(`lint`: `nested_clip_never_visible`).
- `npx hyperframes timeline --json`은 모든 클립을 종류별로 나열한다. 항목은 `absStart`, `absEnd`, `file`, `src`, `playbackRate`, `nested`, `host`, `durationSource`를 포함한다. 파일을 하나씩 열어 보는 대신 이 결과를 읽는다. 중첩은 한 단계까지만 읽는다(더 깊은 씬은 `children=unread`로 표시된다). `laneError`는 파싱되지 않는 `data-automation` 또는 `data-fx-chain`을 뜻한다.

## 미디어 추가

Studio에 드롭했을 때 쓰이는 것과 같은 방식으로 쓴다. 그래야 사용자가 드롭한 클립처럼 동작한다.

- `id`, `class="clip"`, `data-start`(플레이헤드나 요청된 시간. 조용히 0이 되면 안 된다), `data-track-index`를 준다. 소리가 있는 비디오: `playsinline data-has-audio="true"`. 무음 푸티지: `muted playsinline`. 오디오: `data-volume="1"`.
- 이미지와 비디오는 프레임을 가득 채운다: `position: absolute; left: 0; top: 0`, 너비와 높이는 캔버스와 같게, `object-fit: contain`.
- `z-index`는 그 파일에 이미 있는 최상위 클립 수에 1을 더한 값이다.
- 새 클립의 끝을 덮도록 루트의 `data-duration`을 올린다. 아니면 클립이 재생되지 않는다.

## 연결된 클립

Studio의 Detach audio는 같은 파일을 가리키는 음소거된 `<video>` 하나와 `<audio>` 하나를 만든다. 둘은 `data-link`와 `data-sync-origin`을 공유한다. Studio는 이 둘을 하나처럼 이동, 트림, 분할, 삭제한다.

- `<video data-has-audio="true">` 하나를 우선 쓴다. 소리에 별도의 트랙, 볼륨, 효과가 필요할 때만 연결한다.
- 연결된 멤버는 모두 같은 `data-start`, `data-duration`, `data-media-start`, `data-playback-rate`를 유지한다. 시간을 바꿀 때는 모두 함께 바꾼다.
- 연결을 풀려면 모든 멤버에서 `data-link`를 제거한다. 여전히 같은 원본을 공유하는 동안에는 `data-sync-origin`을 그대로 둔다.

## 레이아웃 감사 예외

`check`는 일정한 시점에서 박스를 잰다. `overflow: hidden`을 줘도 발견 사항은 사라지지 않는다. 가장 좁은 범위의 예외를 쓴다.

| 속성                             | 무시하는 대상                                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `data-layout-allow-overflow`     | 요소와 모든 하위 요소의 오버플로. 텍스트 잘림 검사를 포함한다. 가장 작은 장식용 래퍼에 쓴다                                    |
| `data-layout-bleed="true"`       | 주요 텍스트를 의도적으로 한 번 잘라 쓰는 경우                                                                                  |
| `data-layout-allow-overlap`      | 텍스트를 의도적으로 겹치는 경우. 그 블록에만 적용되며 상속되지 않는다                                                          |
| `data-layout-allow-occlusion`    | 텍스트를 가리도록 의도된 요소                                                                                                  |
| `data-layout-allow-caption-zone` | 자막 띠 안에 의도적으로 둔 문구                                                                                                |
| `data-layout-ignore`             | 감사하지 않는 장식 요소                                                                                                        |

## 처음 만나게 될 린트 오류

| 규칙                                                   | 해결                                                                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `video_missing_muted`                                  | 시간이 있는 `<video>`에 `data-has-audio="true"` 또는 `muted`를 준다                                    |
| `gsap_css_transform_conflict`                          | CSS `transform` 대신 트윈 안에서 시작 상태를 정한다(`gsap.fromTo`)                                     |
| `gsap_animates_clip_element`                           | `.clip`의 자식을 애니메이션하거나, 그 `opacity`를 애니메이션한다                                       |
| `video_nested_in_timed_element`                        | `<video>`에 시간을 준다. 래퍼는 시간 없이 두며, 그 래퍼는 `<video>`에 타이밍을 주지 않는다             |
| `media_missing_id`, `media_crossorigin_breaks_preview` | 모든 `<audio>`에 `id`를 준다. `crossorigin`은 뺀다                                                     |
| `gsap_timeline_registered_before_async_build`          | 비동기 콜백의 끝에서 타임라인을 등록한다                                                               |
| `standalone_composition_wrapped_in_template`           | `<template>`은 씬 파일에만 쓴다                                                                        |
| `subcomposition_linked_style_names_root_id`            | 연결된 스타일시트는 씬 루트를 id로 스타일링할 수 없다. 인라인 `<style>`을 쓰거나, 자식을 선택한다        |
| `subcomposition_root_styled_by_class`                  | 씬의 루트는 `#root`로 스타일링한다                                                                     |
| `subcomposition_blanks_before_host`                    | 씬의 슬롯이 보여야 할 시간 전체를 덮도록 만든다                                                        |
| `clip_ends_past_root_duration`                         | 루트의 `data-duration`을 올린다                                                                        |
| `linked_clips_out_of_sync`, `linked_clip_orphan`       | 연결된 멤버를 모두 함께 시간 조정한다. 모두에서 연결을 푼다                                            |
| `sweep_static`                                         | 3초 이상인 비디오에 눈에 띄는 변화가 없다. 움직임을 고르게 펼치거나, 정지 컴포지션에 `data-no-timeline`을 준다 |
| `missing_data_no_timeline`                             | 타임라인이 없는 루트나 호스트에 `data-no-timeline`을 추가한다. 아니면 렌더링마다 45초를 기다린다         |
