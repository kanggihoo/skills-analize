> AI 번역본. 원본: look.md. 분석 근거는 원본이다.

# 룩(look)

아무것도 정하지 않으면 같은 브리프에서 매번 같은 룩이 나온다. 그 기본값을 금지해도 다음 기본값이 그 자리를 차지할 뿐이다. 외부 입력이 이 기본값을 깨는데, 우선순위는 다음과 같다: 프로젝트의 디자인 스펙, 실제 브랜드, 사용자가 준 레퍼런스 이미지나 영상, 피사체 고유의 세계. 첫 씬을 만들기 전에 정해서 LOOK 줄(아래 참고)에 수치로 적어 둔다.

## 프로젝트의 디자인 스펙

프로젝트 루트에 있는 `frame.md`, `design.md`, `DESIGN.md` 중 먼저 존재하는 파일 하나만 읽는다. 나머지는 무시한다.

- **frontmatter는 규범이다**: `colors`, `typography`, `spacing`, `components`. hex 값, 폰트 패밀리, 굵기는 그대로 인용하고 반올림하거나 지어내지 않는다.
- **본문 산문은 의도다**: 이 룩이 무엇을 위한 것인지, Do와 Don't가 적혀 있다. 판단의 근거로 따르되, 값은 여기서 가져오지 않는다.
- **브랜드는 엄격하게, 레이아웃은 자유롭게**: hex, 폰트, 굵기 관계, Do와 Don't는 엄격하게 지킨다. 글자 크기, 간격, 테두리 두께, 장식은 영상에 맞게 조정해도 된다. 웹 페이지의 1px 테두리나 6% 그림자는 화면에서 사라진다.

## 브랜드에서 가져올 때

- 웹사이트라면 `npx hyperframes capture <url> --json`을 실행한다. 출력 폴더에 스크린샷, 본문 텍스트(`extracted/visible-text.txt`), 이미지, 로고, `extracted/tokens.json`(색상, 폰트), `extracted/design-styles.json`이 생성된다. 무엇이든 고르기 전에 스크린샷을 먼저 본다. capture가 0이 아닌 코드로 종료하거나 `ok: false`를 출력하거나 `BLOCKED.md`를 쓰면 실패한 것이다. 이때 일부만 만들어진 파일에서는 브랜드 데이터를 가져오지 않는다.
- Figma라면 `npx hyperframes figma tokens <fileKey>`(`/figma`)를 쓴다.
- 사용자가 첨부한 이미지라면 보이는 것에서 팔레트와 타입을 가져온다.

브랜드 파일이 capture 결과에 포함되어 있거나 번들로 들어 있으면 브랜드 고유 폰트를 쓴다(`format.md` 참고). 그렇지 않으면 해당 패밀리의 `.woff2`를 받아 `assets/fonts/`에 넣고 `@font-face`로 연결하거나, 가장 가까운 번들 패밀리를 고르고 그렇다고 밝힌다.

## 레퍼런스에서 가져올 때

레퍼런스 영상이나 이미지에서 가져오는 것은 내용이 아니라 문법이다. 샷 길이, 제목이 들어오고 나가는 방식, 트랜지션, 팔레트의 역할, 타입의 크기 체계와 굵기가 여기에 해당한다. `snapshot --at <t,…> --against ref.mp4`로 내 결과물과 나란히 스냅샷을 찍고, 문법을 적는다. 이때 측정한 것과 추측한 것을 구분해서 표시한다.

## 프리셋

프리셋은 슬라이드 덱용 룩이다. 사용자가 이름을 대거나 덱(`/slideshow`)을 만들 때만 쓴다. 브랜드가 없는 영상의 기본값으로 쓰지 않는다. `../assets/frame-presets/` 아래 폴더마다 `FRAME.md` 스펙, `caption-skin.html`, `frame-showcase.html` 콘택트 시트가 있다. 프리셋을 쓰려면 `FRAME.md`를 프로젝트 루트에 `frame.md`라는 이름으로 복사한 뒤 위와 같이 읽는다. 번들되지 않은 폰트는 `@font-face` 파일이 필요하다. HTML 두 파일은 참고용 코드다. 연출 기법만 읽고, 마운트하지 않는다.

| 프리셋              | 룩                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `biennale-yellow`   | 미술관 도록: 양피지 바탕, 짙은 남색 잉크, 태양빛 노란 블룸, Instrument Serif, 헤어라인         |
| `blockframe`        | 강렬한 네오브루털리즘: 4px 검은 테두리, 하드 그림자, 캔디 파스텔, Inter 900 대문자              |
| `blue-professional` | 컨설팅식 절제: 크림 캔버스, 코발트 포인트 하나, Space Grotesk + Inter, 틴트 카드               |
| `bold-poster`       | 빈티지 에디토리얼 포스터: 기울어진 Shrikhand 디스플레이, Baskerville, 토마토 레드, 이중 테두리 |
| `broadside`         | 시위 포스터: 잉크 블랙과 불꽃 오렌지 면, 거대한 소문자 Barlow 900, 모노 크롬                   |
| `capsule`           | 친근한 에디토리얼: 모든 컨테이너가 알약 모양, 크림, 캔디 악센트 아홉 색, Bodoni Moda            |
| `cartesian`         | 차분한 도록: 따뜻한 스톤 팔레트, Playfair + Inter, taupe 헤어라인 그리드, 나침반 링            |
| `cobalt-grid`       | 2색 리소그래프: 크림 종이, 코발트 잉크, 모눈 그리드, Newsreader 세리프                         |
| `code-editorial`    | 개발자 브랜드 북: 따뜻한 종이, 아껴 쓰는 테라코타, EB Garamond, 네이비 코드 면                 |
| `coral`             | 대담한 매거진: 하드 엣지의 코럴, 잉크, 크림 면, Bebas Neue, 거대한 숫자                        |
| `creative-mode`     | 절제된 네오브루털리즘: 크림, 4px 잉크 테두리, Archivo Black 대문자, 아껴 쓰는 악센트           |
| `daisy-days`        | 그림책: 차콜 윤곽선, 화사한 파스텔, Fredoka One, 손그림 장식                                  |
| `editorial-forest`  | 문학적: 초록, 분홍, 크림, Source Serif 디스플레이, 모노 크롬, 평평한 종이                      |

## LOOK 줄

디자인 스펙이 없으면 룩은 `SPEC.md`(`spec.md`)의 LOOK 줄로 정한다. 브랜드, 레퍼런스, 또는 피사체 자체에서 가져온다. 시대, 재질, 어디에 보여질지를 본다. 모든 항목은 수치여야 한다(hex, px, %, 이름 있는 서체와 굵기). 바탕과 주인공은 효과가 아니라 매체(medium)에서 나와야 한다. BANNED 줄은 룩이 기본값으로 미끄러지지 않게 막는다. Inter, Space Grotesk, Instrument Serif, Geist, JetBrains Mono는 생성된 디자인이 자주 도달하는 곳이다. 브랜드가 쓸 때만 쓰고, 기본값으로 쓰지 않는다. 팔레트와 서체는 아래 루트 변수에 옮겨 넣는다.

## 영상 사실

- 어두운 바탕 위의 전체 화면 선형 그라데이션은 H.264에서 띠(band)가 생긴다. 방사형 그라데이션, 단색, 또는 단색에 국소적인 글로우를 더한 것을 쓴다.
- 5% 불투명도의 악센트는 압축에서 사라진다. 분위기용은 15–25%, 초점 요소는 채도를 최대로 한다.

## 다시 브랜딩할 수 있게 만들기

팔레트와 폰트를 루트 `<html>`의 변수로 선언하고, 어디서든 그 변수를 쓴다. 그러면 사용자가 Studio의 Variables 패널에서 다시 브랜딩할 수 있다.

```html
<html
  data-composition-variables='[
  {"id":"color-ground","type":"color","label":"Background","default":"<ground from the plan>"},
  {"id":"color-ink","type":"color","label":"Text","default":"<ink from the plan>"},
  {"id":"color-accent","type":"color","label":"Accent","default":"<accent from the plan>"},
  {"id":"font-display","type":"string","label":"Display font","default":"<display face from the plan>"}
]'
></html>
```

`var(--color-accent)` 형태로 참조한다. 레지스트리 항목의 색상과 폰트 변수에도 같은 값을 넣는다.
