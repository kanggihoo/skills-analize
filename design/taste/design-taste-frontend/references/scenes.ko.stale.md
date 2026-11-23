# 큰 장면(Big scenes)

테크 페이지에서 화면 전체가 스크롤에 따라 장면으로 바뀌는 한 구간이다. 각 장면은 `assets/scenes/<id>/` 폴더 하나다(`scene.js`, `scene.css`, `meta.json`, `demo.html`). `index.json`이 장면 목록을 담고, `lib.js`는 장면들이 공유하는 고정 무대(held stage)이며, `scenes.js`는 장면을 로드하고, `print.js`는 두 오브젝트 장면을 위해 오브젝트 렌더를 마운트한다.

## 누가 장면을 받는가

- **테크 페이지에만:** software(앱, AI, 개발자 도구, 핀테크), tech(기술 제품, 하드웨어, 네트워크), gaming. 장소, 서비스, 평범한 제품(site-kind other: 카페, 게스트하우스, 상점, 스튜디오)은 장면을 받지 않으며 사진을 받는다. `index.json`의 `types`는 정확히 `software`, `tech`, `gaming`이다.
- **페이지당 최대 하나.** 브리프가 장면의 `needs`를 갖춘 경우에만 쓴다(자체 사진, 자체 화면, 자체 문구. 게임의 키 아트와 엔진 내 캡처는 그 게임의 사진이다). 필요가 충족되지 않으면 장면도 없다. 고객의 그림을 대신하는 장면은 절대 쓰지 않는다. 아트 파일이 없는 게임은 `product` 무대와 세계관 섹션에서 제품 렌더 헬퍼(히어로 오브젝트나 자기 오브젝트들로 된 장면)로 키 아트를 렌더하며, 그 자리에 효과를 두지 않는다(`sections.md`, Gaming).
- **무작위로 딜한다.** `fits`에 해당 섹션이 있고, `types`에 페이지 타입이 있고, `needs`를 브리프가 충족하는 장면 중에서, `weight`로 가중해 고른다. 단 `.taste-skill/scenes-history.json`의 최근 세 개는 제외한다(명령은 `effects-usage.md`에 있다). 계획에 장면과 그 섹션을 적는다. 큰 장면은 페이지의 효과 하나다. 셰이더 바탕도 없고, 옆에 WebGL 부품도 두지 않는다.
- **히어로는 정지 상태에서 한 화면을 차지한다.** 그래서 장면은 `restH`가 1일 때만 히어로로 딜된다. `restH`가 2인 장면(현재 히어로 장면 세 개 모두)은 히어로 아래에만 간다. 제목이 h2인 두 화면짜리 섹션(`--h: 2`)이 된다. 그 경우 히어로는 평소처럼 딜된다.
- **두 오브젝트 장면**(`fixed-hero-object`, `object-through-giant-type`)은 고객 자신의 업종에 속한 오브젝트를 WebGL로 렌더한다(카드 게임 엔진이라면 카드 덱, 엣지 네트워크라면 지구본). 다른 업종의 오브젝트는 절대 쓰지 않으며, 카페에 컵을 두지 않는다.
- **나머지 페이지는 차분하게 둔다.** 페이지가 스크롤되었다고 움직이는 카드, 행, 타일은 없다. 장면 옆에서 페이지는 섹션 모먼트를 한두 개 더 쓸 수 있다(하우스 오버라이드: 큰 장면 하나와 스크롤 모먼트 한두 개). `moments.md`의 말대로 딜한다(짧은 페이지는 하나, 여덟 섹션 이상이면 둘). 장면의 섹션이나 그 옆 섹션에는 절대 두지 않는다. 장면의 `avoidMoments`나 그 쌍둥이(twin)에 해당하는 모먼트도 절대 두지 않는다(`effects-usage.md`, Big scene).

| id | fits | types | needs | WebGL | restH | phone |
| --- | --- | --- | --- | --- | --- | --- |
| `descend-through-weather` | 히어로(아래에만) | tech, gaming | 고객 세계의 높은 곳과 낮은 곳을 담은 사진 두 장 | - | 2 | 정지 |
| `shaped-window-over-fixed-world` | 히어로(아래에만) | tech, gaming | 고객 세계를 담은 넓은 사진 한 장 | - | 2 | 정지 |
| `fixed-hero-object` | 히어로(아래에만) | tech, gaming | 오브젝트 렌더 또는 누끼, 1-4개 챕터 | 1 | 2 | 정지 |
| `powers-of-ten-pullback` | product | software, tech | 제품의 UI를 실제 크기로 | - | 1 | 정지 |
| `product-assembles-into-its-action` | product | software, tech | HTML로 된 화면, 4-6단계 | - | 1 | 정지 |
| `parts-lock-into-the-whole` | product | software, tech | 패널을 따라 잘라 낸 화면 | - | 1 | 정지 |
| `fly-into-the-shape` | between, product | software, tech, gaming | 마크를 하나의 path로, 어두운 사진 한 장 | - | 1 | 정지 |
| `letter-physics` | statement | software, tech, gaming | 주장과 그에 대한 답 | - | 1 | 라이트 |
| `object-through-giant-type` | statement | software, tech, gaming | 짧은 3-5행 인용문, 오브젝트 | 1 | 1 | 정지 |
| `dot-becomes-the-full-stop` | statement | software, tech, gaming | 4-6단어짜리 주장 하나 | - | 1 | 라이트 |
| `letter-bar-floods-the-ground` | between, statement | software, tech, gaming | 두 문장, 그 뒤에 반전 섹션 | - | 1 | 정지 |

`powers-of-ten-pullback`은 절대 히어로가 되지 않는다. 첫 화면에는 제목도 액션도 없기 때문이다.
각 장면의 `scene.js` 맨 위 주석에 마크업과 옵션이 있다. `meta.json`에는 `look`, `needs`, `never`, `avoidWith`가 있다.

## 페이지에 장면 넣기

장면 폴더와 공유 파일(`scenes.js`, `lib.js`, `scenes.css`, 오브젝트 장면이라면 `print.js`)을 `assets/scenes`로 복사한다. 장면의 헤더 주석을 보고 고객 자신의 문구와 사진으로 마크업을 쓴다. `<head>`에는 스크립트를 일찍 표시하는 한 줄과 두 스타일시트를 넣는다. 그래야 완성된 구도가 스크립트 없이도 스타일이 적용되며, 장면이 마운트될 때 아무것도 튀지 않는다. `<body>` 끝에는 런타임을 한 번 넣는다:

```html
<head>
  …
  <script>document.documentElement.classList.add('sc-js');setTimeout(()=>document.documentElement.classList.add('sc-safe'),2500)</script>
  <link rel="stylesheet" href="assets/scenes/scenes.css">
  <link rel="stylesheet" href="assets/scenes/<id>/scene.css">
</head>
…
<section class="sc" data-big-scene="<id>" data-big-scene-opts='{"hold": 1}' style="--h: <the scene's restH>" aria-labelledby="…">
  <div class="sc__stage">…</div>
</section>
…
<script type="module" src="assets/scenes/scenes.js"></script>
```

섹션은 `main`의 직계 자식이다. `<html data-scenes-ready>`는 마운트되었음을 뜻한다. `data-scenes-over`가 있으면 결함이다. 장면은 페이지의 토큰, 글꼴, 라디우스, 버튼을 그대로 따른다.

### 높이 (규칙 3)

장면의 섹션도 다른 모든 섹션과 같이 페이지 리듬 안에 있다. 정확히 한두 화면이며, 문구는 내비 아래에 있다. 라이브 상태에서는 (hold + 1) 화면이다. `lib.js`와 모든 장면은 `hold`를 기본 1로 두므로, 라이브 섹션은 두 화면이다(1440x900에서 1800px). 정지 상태(휴대폰, 감소된 모션, 스크립트 없음)에서는 `scenes.css`가 섹션의 `--h`와 패딩을 최소 높이로 유지한다. 그러니 `--h`를 장면의 `restH`(위 표)로 설정하고, 이를 위한 페이지 CSS는 쓰지 않는다. 고정 높이는 구도를 자르고 다음 섹션 위로 넘치게 하기 때문이다. `data-screen="free"`로 장면을 검사에서 숨기지 않는다. 390 촬영본을 본다. 정지 구도가 화면의 절반도 채우지 못하면 빈 것으로 읽힌다(규칙 2).

## 규칙

- **데모는 자리표시자다:** 배포되는 장면의 모든 그림, 문구, 오브젝트는 고객의 것이다. 사진의 크레딧은 푸터 줄에 적으며, 프레임 밖으로 잘린 것에는 "adapted"를 붙인다.
- **장면 없이도 읽힌다:** 장면의 문구는 마크업 안의 실제 텍스트이며 읽는 순서대로 있다. 완성된 구도는 장면이 말하는 모든 것을 담는다.
- **기본 스크롤만 쓴다:** 무대는 `hold` 화면 동안 고정된다. 휠을 가로채는 것은 없다.
- **휴대폰에는 정지 또는 가벼운 버전만 준다. 전체 장면은 주지 않는다:** 768px 미만에서 모든 장면은 완성된 구도를 보여 준다. 다만 라이트로 표시된 두 타이포그래피 장면은 예외다(깊이가 없고, 겹치는 것이 없다).
- **감소된 모션, 스크립트 없음, 모듈 실패:** 완성된 구도를 보여 주며, 이것이 hold의 끝 상태이기도 하다. 오브젝트 장면은 그 경우 오브젝트의 정지 이미지를 보여 주며, WebGL을 마운트하지 않는다.
- **WebGL:** 장면당 컨텍스트는 최대 하나이며, 페이지의 공유 예산(`lib.glBudget`, `window.__tpGl`, 페이지당 네 개)에서 가져온다. 섹션이 라이브이고 뷰포트에서 한 화면 이내에 있을 때만 마운트되며, 벗어나면 파괴된다. WebGL이나 셰이더가 실패하면 그 아래에 정지 이미지를 둔다. 이름으로 GLSL ES 예약어를 쓰지 않는다.
- **움직이는 것이 읽히는 문구를 가로지르지 않는다.** 문장은 매번 정지 상태에서 통째로 읽혀야 한다. 사진 위의 텍스트는 페이지 바탕의 단색 띠 위에 있거나, 사진의 차분하고 어두운 부분에서 4.5:1(디스플레이 텍스트는 3:1)을 맞춘다. 사진 위에 스크림이나 그라데이션은 절대 쓰지 않는다(`system.md`).
- **비용:** transform, opacity, clip-path는 크기가 고정된 레이어에만 쓴다. 너비, 높이, 매 프레임 다시 그려지는 SVG 클립은 절대 쓰지 않는다.
- **캡션 없음:** 장면을 설명하는 캡션을 장면의 아래나 옆에 두지 않는다. 스크롤에 따라 날아다니는 카드 장식, 칩, 라벨도 없다.

## 검사

```bash
node <skill>/assets/scenes/_demo/shoot.mjs shoot --out <dir> --profile <your own Chrome profile dir> [--only <id>] [--page <url>] [--reduced] [--port 5836]
node <skill>/assets/scenes/_demo/shoot.mjs index [--out <file|dir>]   # from the project folder: its own index.json
```

`index`는 `assets/scenes`가 있는 프로젝트 폴더에서 실행하면 프로젝트 자체의 `assets/scenes/index.json`을 쓴다(또는 `--out <file|dir>`를 준다). 설치된 스킬 안에서 실행하면 거부하며 아무것도 쓰지 않는다. `--in-skill`은 스킬 자체의 인덱스를 일부러 다시 쓰는데, 이는 페이지의 작업이 아니다. 페이지는 장면의 `meta.json`이 바뀐 뒤에만 이것이 필요하므로, 보통의 페이지에서는 건너뛴다.

CPU에서 WebGL을 켠 헤드리스 Chrome 하나를 쓰며, 자기 PID로 종료한다. 1440과 390에서 시작, 중간, 끝을 촬영하고, 장면마다 컨택트 시트를 만든다. 모든 시트를 읽는다. `--reduced`는 한 번 촬영한다.
