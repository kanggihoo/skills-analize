# Effects

hero frame, feature card, band에 쓰는 effect ground 25종을 코드로 그린다. 각 effect는 모든 색을 페이지 palette에서 가져온다. 여기에는 비디오나 다른 라이브러리를 불러오는 것이 없다. 이미지를 받는 것은 photo grade뿐이며, 이때도 섹션 고유의 사진을 쓴다.

- `gallery.html`은 모든 effect를 실시간으로 보여 준다. palette 전환기, 무작위 선택, UI kit의 feature card가 있다. `lab.html`에는 모든 param과 card에 대한 슬라이더가 있고, wide와 hero 레이아웃을 제공한다.
- 두 페이지는 `file://`이 아니라 http로 열어야 한다. `node scripts/effects.mjs serve --port 5230`을 실행한 뒤 `/assets/effects/gallery.html`을 연다.

## Mount

요소에 크기와 `data-fx` id를 주고, 페이지의 모든 요소를 mount한다.

```html
<div class="panel" data-fx="caustics" data-fx-seed="21"></div>

<script type="module">
  import fx from './assets/effects/fx.js';
  fx.mountAll(document);
</script>
```

- **Palette.** 각 요소는 `--bg`, `--surface`, `--ink`, `--muted`, `--accent`, `--accent-ink`를 읽는다. 또는 `--fx-bg`와 나머지 `--fx-*` 이름을 읽으며, 이 값이 우선한다. `fx.mountAll(document, { bg, surface, ink, muted, accent, accentInk })`처럼 palette를 직접 넘길 수도 있다. 한 요소의 색 하나만 바꾸려면 `data-fx-palette='{"accent":"#..."}'`를 쓴다.
- **Seed.** `data-fx-seed`는 구성을 고정한다. seed가 없으면 로드할 때마다 새 그림이 나온다.
- **Params.** `data-fx-params='{"speed":0.3}'`처럼 쓴다. `index.json`에는 각 param과 범위가 나열되어 있다. effect 위에 텍스트가 있다면 `calmX`와 `calmY`(프레임 기준 0에서 1 사이)에 텍스트 위치를 지정한다. effect는 그 영역을 조용하게 유지한다.
- **One element.** `const c = await fx.mount(el, 'caustics', { palette, seed, params })`를 쓴다. 반환값 `c`에는 `pause()`, `resume()`, `set(params)`, `setPalette(p)`, `destroy()`가 있다.
- **Built in.** effect는 화면을 벗어나거나 탭이 숨겨지면 그리기를 멈춘다. `prefers-reduced-motion`에서는 정지 프레임 하나만 보여 준다. WebGL이 없으면 같은 색의 CSS 그림을 보여 준다. device pixel ratio는 1.75로 제한한다(선명한 픽셀이 필요한 effect는 예외). 페이지에 살아 있는 WebGL context가 14개를 넘으면 화면 밖에서 쉬고 있는 context부터 해제한다.
- 텍스트와 UI 조각은 요소 안에 넣는다. canvas는 그 아래에 놓인다(격리된 요소에서는 `z-index: -1`).

## Random pick

페이지의 effect는 취향으로 고르지 않고 무작위로 배정한다. 슬롯마다 effect 하나를 배정한다. `hero`는 hero 또는 큰 분할 프레임, `card`는 card 묶음, `band`는 넓은 band 또는 마지막 call to action, `footer`는 footer다. 배정 대상은 페이지 palette 종류(meta.json의 `palettes`)와 해당 슬롯에 맞는 effect뿐이다. 같은 id는 한 페이지에 두 번 나오지 않는다. 한 슬롯의 모든 effect가 이미 페이지에 있으면 하나를 반복하되 다른 seed를 쓰고 안내 문구를 출력한다. 명령은 `--palette`가 필요하다. 브라우저에서 palette 없이 호출하면 세 종류 모두에 맞는 effect만 배정한다. 최근 페이지에 쓰인 id와 이미 배정된 계열의 두 번째 선택은 나올 확률이 낮아진다. `avoidWith`에서 서로를 지정한 두 effect는 같은 페이지에 나오지 않는다.

**focal** ground(`"focal": true`)는 고유한 주인공을 가진다. 구(sphere), 빛줄기, 봉우리, 빛 웅덩이가 그렇다. 여기에는 작은 UI 조각 하나만 올린다. 큰 창, 스크린샷, 텍스트는 올리지 않는다. `--quiet`(브라우저에서는 `quiet: true`)를 주면 잔잔한 **quiet** ground만 배정한다. 큰 창이 들어가는 슬롯에 쓴다.

네 가지 effect는 절대 배정하지 않는다(meta.json의 `"random": false`). `dotted-globe`는 실제 대상을 그리는 effect로, 결제, 인프라, 물류, 네트워크처럼 도달 범위가 전 세계인 제품에만 쓴다. `duotone-grade`는 섹션 고유의 사진에 등급을 입힌다. `edge-glow`는 핵심 객체 하나(프롬프트 상자나 추천 요금제)의 빛나는 테두리다. `ridgeline`은 `assets/components/fx-band`의 구분 band다. 콘텐츠가 필요로 하면 해당 슬롯에 이름을 지정해 넣는다. 그래도 palette 종류나 슬롯이 맞지 않으면 거부되고, 같은 id를 두 번 지정하거나 `avoidWith`에 걸리는 effect와 인접하면(지정하거나 `--exclude`로 넘긴 경우) 역시 거부된다.

```bash
node scripts/effects.mjs pick --palette dark --slots hero,card,band --seed 4821 --history .taste-skill/effects-history.json
node scripts/effects.mjs pick --palette dark --slots hero:dotted-globe,card,band --seed 4821 --history .taste-skill/effects-history.json
```

브라우저에서 같은 코드는 다음과 같다.

```js
import { pick } from './assets/effects/pick.js';
const index = await fetch('./assets/effects/index.json').then(r => r.json());
const { picks } = pick(index.effects, { palette: fx.paletteKind(palette), slots: ['hero', 'card', 'card'], history });
// picks: [{ slot: 'hero', id: 'god-rays' }, ...]; history: the ids of earlier picks, oldest first
// a named slot: slots: ['hero:dotted-globe', 'card'] (or { slot: 'hero', id: 'dotted-globe' })
```

`fx.paletteKind(palette)`는 배경색으로부터 `light`, `dark`, `colour`를 반환한다.

## The list

| id | 이름 | Family | Slots | Palettes | Ground | Motion |
|---|---|---|---|---|---|---|
| `film-light-leak` | 필름 라이트 리크 | Grain | hero, card, band | dark, colour | focal | slow |
| `grain-gradient` | 그레인 그라데이션 | Grain | hero, card, band, footer | light, dark, colour | quiet | slow |
| `ascii-shade` | ASCII 음영 | Dither | hero, card, footer | light, dark, colour | focal | slow |
| `bayer-dither` | Bayer 디더 | Dither | hero, card, band, footer | light, dark, colour | quiet | slow |
| `halftone-screen` | 하프톤 스크린 | Dither | hero, band | light, dark, colour | quiet | slow |
| `line-engraving` | 라인 엔그레이빙 | Dither | hero, card, band | light, dark, colour | quiet | still |
| `aurora-curtains` | 오로라 커튼 | Mesh | hero, band, footer | dark, colour | focal | slow |
| `gradient-mesh` | 그라데이션 메시 | Mesh | hero, card, band | light, dark, colour | quiet | slow |
| `painterly-landscape` | 회화풍 풍경 | Mesh | hero, card | light, dark, colour | quiet | slow |
| `god-rays` | 신의 빛줄기 | Light | hero, band | dark, colour | focal | slow |
| `orb-sphere` | 빛 구체 | Light | hero, card, band | light, dark, colour | focal | slow |
| `prism-dispersion` | 프리즘 빛 | Light | hero, card, band | dark | focal | slow |
| `soft-light-bars` | 부드러운 빛 막대 | Light | hero, card, band, footer | light, dark, colour | focal | slow |
| `spotlight-cone` | 무대 스포트라이트 | Light | hero, card | dark, colour | focal | slow |
| `caustics` | 수면 caustics(물결 빛무늬) | Light | hero, card, band | light, dark, colour | focal | slow |
| `edge-glow` | 가장자리 글로우(이름 지정 전용) | Light | card | light, dark, colour | border | slow |
| `dot-terrain` | 점 지형 | Pattern | hero, card, band | light, dark, colour | quiet | slow |
| `grid-pulse` | 그리드 펄스 | Pattern | hero, card, band | light, dark, colour | quiet | slow |
| `ruled-grounds` | 줄 점 바닥 | Pattern | card, band | light, dark, colour | quiet | slow |
| `contour-lines` | 지형 등고선 | Pattern | hero, card, band, footer | light, dark, colour | quiet | slow |
| `dotted-globe` | 점 지구본(이름 지정 전용) | Pattern | hero, card, band | light, dark, colour | focal | slow |
| `ridgeline` | 능선(이름 지정 전용) | Pattern | band | light, dark, colour | focal | slow |
| `fluted-glass` | 홈 유리 | Material | hero, card, band | light, dark, colour | quiet | slow |
| `silk-folds` | 실크 주름 | Material | hero, card, band | light, dark, colour | quiet | slow |
| `duotone-grade` | 듀오톤 그레이드(이름 지정 전용) | Photo | hero, card, band | light, dark, colour | quiet | still |

각 effect의 한 줄 설명은 `index.json`의 `look` 필드에 있다. `node scripts/effects.mjs list`는 이 표를 출력하며, `--family`, `--on`, `--palette`, `--motion`, `--quiet`로 걸러 볼 수 있다. 존재하지 않는 필터 값은 빈 목록이 아니라 오류로 처리한다.

10월 31일에 보기 나쁘거나 싸 보인다는 이유로 제외했다. `riso-print`, `ink-bloom`, `liquid-chrome`, `metaballs`, `brushed-metal`, `paper-texture`, 그리고 `terrazzo-speckle`(주방 바닥처럼 보인다), `marble-warp`(얼룩말 무늬), `pixel-mosaic`(깨진 JPEG 블록), `truchet-arcs`(굵은 회색 벌레 모양), `soft-particles`(흔한 bokeh)다. 이들은 index에 없다. `ridgeline`은 단독으로 배정하면 음반 커버처럼 읽히므로 이름 지정 전용이다.

## Commands

```bash
node scripts/effects.mjs index      # rebuild index.json from every <id>/meta.json and effect.js
node scripts/effects.mjs gallery    # write gallery.html and lab.html from scripts/*.template.html
node scripts/effects.mjs publish    # the gallery as one folder: publish/index.html, effects/, ui/, files.json
```

`gallery.html`이나 `lab.html`이 아니라 `scripts/`의 템플릿을 수정한다. `publish`는 두 페이지를 다시 만든 뒤 갤러리가 불러오는 파일만 복사한다. `files.json`에는 모든 파일이 상대 경로로 나열된다.

## Adding an effect

두 파일이 든 `<id>/` 폴더를 만든다.

- `meta.json`: `id`, `name`, `family`(grain, dither, mesh, light, pattern, material, photo 중 하나), `look`(한 문장), `bestOn`, `palettes`, `motion`(`still`, `slow`, `interactive` 중 하나), `cost`. 선택 항목으로 `"random": false`(이름으로만 지정하고 배정하지 않는 실제 대상), `"focal": true`(고유한 주인공이 있는 ground), `avoidWith`(같은 페이지에 나오지 않는 id), `subjects`(이름 지정 effect의 용도)가 있다.
- `effect.js`: `export default { id, name, family, params, mount(el, { palette, params, seed }) }`를 내보낸다. `mount`는 `{ destroy, pause, resume }`을 반환한다.
  - fragment shader라면 `fx.shader(el, { frag, schema, params, palette, seed, fallback })`을 쓴다. canvas, 수명 주기, DPR 제한, context 예산, CSS 대체 화면을 모두 처리한다.
  - canvas 2D라면 `fx.lifecycle(el, { draw })`를 쓴다.
  - 자체 WebGL context를 만드는 effect는 그 직전에 `fx.glBudget(holder)`를 호출한다. 그러면 context가 페이지의 예산에 포함된다(`dotted-globe` 참고).

모든 색은 palette에서 가져오며 OKLab에서 섞는다(`fx.color`). 고정된 hue를 쓰지 않고, 보라색이나 라벤더를 기본값으로 삼지 않는다. effect 위의 텍스트는 4.5:1 대비를 만족해야 한다. shader 코드는 빨리 컴파일되도록 작게 유지한다. Chrome on Windows 뒤의 D3D 컴파일러는 모든 함수 호출을 인라인하며, 16번 호출되는 helper 하나가 40초의 컴파일 시간을 냈던 사례가 있다. uniform으로 횟수를 정하는 루프는 이 문제를 피한다(`halftone-screen` 참고). `index`를 실행한 뒤 gallery에서 light, dark, colour 세 palette로 effect를 확인한다.
