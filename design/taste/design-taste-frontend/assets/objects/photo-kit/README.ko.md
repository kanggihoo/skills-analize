# Photo prints

사진 한 장을 셰이더가 페이지의 잉크로 자기 종이 위에 통째로 찍어 낸 것이다. halftone, engraving, dither 중 하나다. hover(휴대폰에서는 탭)하면 인쇄물 아래의 원본 사진이 보인다. print는 페이지에서 한 번 공들여 만든 순간이며, 페이지가 사진을 보여 주는 기본 방식이 되어서는 안 된다.

| Object | 모양 | Hover |
|---|---|---|
| `photo-halftone` | 한 가지 잉크의 halftone. 45° 스크린 위의 둥근 점. 밝은 곳은 종이의 빈 색, 가장 어두운 그림자는 잉크가 꽉 찬다 | 돋보기(둥근 렌즈, 가는 테두리, 부드러운 그림자)가 원본 사진을 원래 색으로 보여 준다 |
| `photo-engraving` | 조각 판화. 그림자에서 부풀고 형태를 따라 휘는 대각선. 사진 색의 옅은 물감이 깔려 있다 | 선이 커서 주위에서 갈라지고 사진이 그 틈으로 비친다 |
| `photo-dither` | 세 가지 색의 입자. 사진에서 가장 짙고 가장 색이 선명한 부분만 종이 위에 남는다 | 입자를 통해 사진이 부드러운 원 안에서 드러난다 |

각 폴더의 `demo.html`(http로 제공)은 밝은, 어두운, 컬러 palette로 객체를 보여 준다. `meta.json`에는 param, 터치 동작, 대체 화면, 비용이 나열되어 있다.

## Where a print goes, and where not

- **써도 되는 곳**: 소프트웨어, AI, 디자인 도구, 게임 페이지에서 한 순간. 페이지의 사진 band 하나, 또는 주제가 사진 자체인 feature tile(사진을 인쇄하는 이미징이나 디자인 도구, 브랜드 잉크를 쓰려면 `tint: 1`). 페이지 하나에 print는 하나만 쓴다. print를 세 개 나란히 놓는 것은 인쇄에 관한 페이지에서만 허용한다.
- **쓰지 않는 곳**: hero 사진이나 섹션의 주 사진 위(`references/photos.md`). 그 자리에 print를 두면 깨졌거나 해상도가 낮아 보인다. 카페, 게스트하우스, 상점 등 동네 업체의 페이지에는 절대 쓰지 않는다. 그런 곳은 사진을 평범하게 보여 준다.
- effect를 설명하는 캡션이나, print라고 밝히는 메모를 달지 않는다.

## The photograph

고객이 준 사진을 먼저 쓴다. 없으면 검증된 라이브러리에서 인쇄가 잘 되는 사진을 고른다(주제가 하나 뚜렷하고, 배경이 단순하며, 빛이 분명한 사진).

```bash
node <skill>/scripts/photos.mjs list --trade office --json     # entries with "prints": true
node <skill>/scripts/photos.mjs fetch <id> --out .             # the files, credits.json and the <img>
```

어두운 페이지에서는 더 어두운 사진을 고른다(`"tone": "dark"` 또는 `"mid"`). 밝은 사진은 거기서 큰 밝은 판으로 인쇄된다.

## Mount

`photos.mjs fetch`가 출력한 `<img>`를 frame에 붙여 넣는다. print는 그 사진을 읽는다(가장 큰 `srcset` 크기). `alt`를 유지하고, `object-position`을 피사체의 위치로 쓴다.

```html
<div class="print-frame" style="aspect-ratio: 4 / 5; border-radius: var(--radius-card)">
  <img src="assets/img/photo-d88.jpg" srcset="..." sizes="(max-width: 1023px) 100vw, 50vw"
       width="1280" height="1757" alt="Cream ceramic table lamp in low sun" loading="lazy" decoding="async"
       style="object-position: 50% 40%">
</div>
<script type="module">
  import fx from './assets/effects/fx.js';
  import halftone from './assets/objects/photo-halftone/object.js';
  const el = document.querySelector('.print-frame');
  halftone.mount(el, { palette: fx.readPalette(el) });
</script>
```

- frame에는 크기가 있어야 한다(`aspect-ratio` 또는 높이). print는 frame을 채우고, 페이지의 `--surface` 위에 인쇄해서 frame이 한 장의 종이처럼 읽히게 한다(`ground: 0`이면 `--bg` 위에 인쇄한다). 페이지 palette를 따라가며, palette를 바꾼 뒤에는 `ctrl.setPalette(fx.readPalette(el))`를 호출한다.
- `focusX`와 `focusY`(0에서 1)는 `<img>`의 `object-position`을 덮어쓴다.
- print는 첫 프레임부터 그 자리에 있다. 등장 효과도, 페이드도 없고, 정지 상태에서는 아무것도 움직이지 않는다.
- 작은 UI card는 frame의 모서리 한쪽에 올릴 수 있다(`cards.md`). 피사체 위에는 올리지 않는다. print 위에 텍스트를 올리지 않는다.

## Credit

출처는 footer의 출처 줄 하나에만 넣는다. print 아래에는 넣지 않는다. 인쇄된 사진은 각색(adapted)된 것으로 본다.

```bash
node <skill>/scripts/photos.mjs credits --out . --adapted <id>
```

`photos.mjs`를 거치지 않은 사진이라면, `photo.js`의 `creditsBlock(entries, { adapted: [id] })`가 `{ id, by, page, licence, licenceUrl, source }`로부터 같은 footer 블록을 만든다(한 줄, "Photographs via ...", 이 줄을 누르면 목록이 열린다). 고객 자신의 사진에는 출처가 필요 없다.

## When it cannot draw

첫 프레임 전, 화면 밖에서 canvas를 해제하는 동안, WebGL이 없을 때, shader가 컴파일이나 link에 실패할 때, 사진 호스트가 CORS 헤더를 보내지 않을 때에는 사진 자체가 팔레트에 맞춰 흐리게 보인다. 빈 frame이 아니라 정지 그림이다. 런타임은 GLSL ES 예약어(`flat`, `smooth`, `sample`, `filter`, `input` 등)를 쓴 shader를 거부하고 정지 그림을 보여 준다. CPU WebGL(SwiftShader)은 컴파일하지만 노트북 GPU는 거부하기 때문이다. Node에서 shader를 확인하려면 `photo.js`의 `glslLint(src)`와 `photoShader(object)`를 쓴다.

## Cost

print마다 canvas 하나와 WebGL context 하나를 쓴다. 화면 밖이거나 탭이 숨겨져 있으면 일시정지하며, 화면을 벗어난 뒤 1.5초 후 해제한다. context를 가진 print는 동시에 최대 3개다. 네 번째 print는 기다리며(정지 그림을 보여 주면서) 하나가 화면을 벗어날 때까지 기다린다. 스크롤로 사라지는 frame은 들어오는 frame에 자리를 내준다. 페이지의 다른 WebGL effect와 함께 세어서 페이지 전체의 live context를 3개로 유지한다. halftone과 engraving은 점과 선이 선명하도록 CSS 픽셀당 canvas 픽셀을 최대 2개까지 쓴다. 모든 print는 canvas를 1.5 메가픽셀 아래로 유지한다. 픽셀마다 mipmap에서 사진을 2에서 5번 읽으며, 루프는 쓰지 않는다.
