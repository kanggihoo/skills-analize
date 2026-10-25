# 테마 시스템

각 프레젠테이션은 처음부터 끝까지 **하나의 테마**를 사용합니다. 장 사이에서 밝은 화면과 어두운 화면을 바꾸지 **않습니다**. 영상의 시각적 연속성이 끊기고 화면 녹화가 거친 컷처럼 보이기 때문입니다. “조금 더 어두운 분위기”의 장이 필요하면 **같은 팔레트 안에서** 대비를 낮추고 스포트라이트를 좁힙니다. 표면 색을 반전하지 않습니다.

테마 = CSS 디자인 토큰 모음 + `theme.json` 메타데이터.

**각 장이 토큰을 사용하는 방식은 두 층으로 나뉩니다.**

1. **반드시 토큰을 사용해야 하는 항목**(테마를 바꿔도 깨지지 않게 하는 최소 조건) — 색상 + 글꼴 계열
2. **장마다 자유롭게 정하는 항목**(콘텐츠에 맞게 디자인) — 글자 크기 / 간격 / 애니메이션 지속 시간 / 이징 / 테두리 너비 / 일반 모서리 반경 / 자간 등은 하드코딩해도 됩니다.

테마는 색상과 글꼴만 다루는 **것이 아닙니다**. 그 밖의 요소(hero 숫자, 구분선, 카드, 무대 장식)는 **기본 클래스**(`.hero-num` / `.rule` / `.card` / `.stage-frame`)를 통해 자동으로 연결됩니다. 장에서는 클래스를 쓰면 되며 `var()`를 직접 지정할 필요가 없습니다.

테마가 관리하는 항목:

| 항목 | 테마에서 관리하는 방식 |
| --- | --- |
| **팔레트** | shell / surface 단계, text 단계, accent 및 투명도 파생값 |
| **타이포그래피** | 중국어 / 영어 / 본문 / 고정폭 글꼴 계열 + OpenType 기능 세트 |
| **무대 padding 밀도** | `--stage-pad-x/y` — 여백이 넓은 테마 140×100, 정보가 밀집된 테마 80×60 |
| **모서리 스타일** | `--r-card` — sharp (0) / refined (4) / soft (16) / keynote (32) |
| **구분선 스타일** | `--rule-w` + `--rule-style` — 얇거나 굵게 × 실선 또는 점선 |
| **hero 숫자 스타일** | `--hero-num-*` — 편집 디자인 이탤릭 / 터미널 고정폭 / 굵은 블랙 / 손글씨 |
| **무대 / 카드 그림자** | `--shadow-stage` / `--card-shadow` — 종이처럼 뜬 그림자 / 오프셋 단색 / 내부 그림자 |
| **장식 레이어** | `--surface-pattern*` / `--surface-vignette` / `--text-shadow` |
| **모션의 기본 리듬** | `theme.json`의 `mood` — 시네마틱하게 느림 / 스프링 / 경쾌함 / 차분함 |

> **`mood`에는 지속 시간 값을 적지 않습니다.** 구체적인 ms 값과 이징은 장을 만드는 에이전트가 `mood`를 보고 결정합니다(느린 테마에 200ms짜리 빠른 애니메이션을 쓰지 말라는 뜻입니다).

테마마다 토큰이 약 25~35개 있습니다. 전체 규칙은 아래를 참고하세요.

---

## 기본 제공 테마

테마 23개는 각각 **독립된 디자인 DNA**를 가집니다. 단순히 색만 바꾼 버전이 아닙니다. 주제의 정서에 맞는 테마를 고르거나, 자신만의 테마를 만들기 위한 출발점으로 사용합니다.

### 어두운 테마

| id | 성격 |
| --- | --- |
| `midnight-press` | 시네마틱한 편집 디자인의 다크 테마. 순수한 검정 대신 따뜻한 에스프레소 색과 강렬한 오렌지를 사용합니다. 영문은 Instrument Serif italic, 중국어는 Noto Serif SC. hero 숫자는 이탤릭 세리프입니다. 느리고 영화적인 리듬(1.6s에 걸쳐 등장), padding 140×100. 비네트만 있고 그레인은 없습니다. |
| `chalk-garden` | 짙은 슬레이트색 칠판. Patrick Hand 손글씨를 전면에 쓰고 분필색 노랑을 강조색으로 사용합니다. **2px 점선 rule**이 시그니처입니다. 오버레이 필름 그레인 + 비네트. 세리프 글자에 분필 text-shadow. 손으로 그린 듯한 리듬입니다. |
| `terminal-green` | 1980년대 인광 터미널. 순수한 검정 + JetBrains Mono만 사용하며 모서리는 0px 직각입니다. **CRT 스캔라인**을 무대 위에 얹습니다. 텍스트에는 인광 text-shadow가 있습니다. 경쾌한 선형 모션(180/400/650ms). hero 숫자는 빛나는 고정폭 글꼴입니다. |
| `blueprint` | 엔지니어링 청사진. 짙은 네이비 + 제도용 청록색 + IBM Plex Mono. **2px 점선 청록색 rule과 60px 제도 격자**가 시그니처입니다. hero 숫자는 청록색 고정폭 글꼴입니다. 고정폭 글꼴의 조합이 기술 도면의 분위기를 만듭니다. |
| `dark-botanical` | 패션 잡지나 박물관 도록에 어울리는 고급 편집 디자인의 어두운 배경. 거의 검정에 가까운 바탕에 따뜻한 도자기색 / 장밋빛 분홍 / 금박을 겹칩니다. Cormorant italic + IBM Plex Sans. **흐릿한 빛의 웅덩이(blurred light pool)**가 시그니처입니다. 느리고 시네마틱한 리듬(1.7s), padding 140×100. |
| `neon-cyber` | 사이버펑크 미래주의. 짙은 네이비 바탕 + 전기 청록 + 장밋빛 빨강의 이중 네온. Clash Display + Satoshi. **청록 발광 격자와 두 색 네온 외곽선(cyan + magenta text-shadow)**이 시그니처입니다. 빠릿한 리듬(380/650ms). |
| `bold-signal` | hero 중심 피치 덱을 위한 어두운 배경. Archivo Black + Space Grotesk. 큼직한 오렌지 포인트 카드와 탭 번호를 사용합니다. **대각선 짙은 그라데이션과 큰 글자의 슬로건**이 시그니처입니다. 강렬한 리듬(420/680ms). |
| `creative-voltage` | 레트로 펑크 크리에이티브 스튜디오. 채도 높은 전기 블루 바탕 + 네온 옐로 강조색. Syne + Space Mono. **하프톤 도트와 오프셋된 네온 노랑 그림자**가 시그니처입니다. 펀치감 있고 에너지 넘치는 리듬(450/720ms). |

### 밝은 테마

| id | 성격 |
| --- | --- |
| `paper-press` | `midnight-press`의 낮 버전. 따뜻한 크림색과 multiply blend의 종이 질감, 강렬한 오렌지를 사용합니다. hero 숫자는 편집 디자인의 이탤릭 세리프입니다. 느리고 시네마틱한 리듬, padding 140×100. |
| `warm-keynote` | 현대적인 SaaS 기조연설 스타일. 크림색 + 세피아 잉크 + 청록 + Inter. **32px의 큰 모서리를 둥글린 유리 패널**과 backdrop blur. **매우 굵은 font-black hero 숫자**. 무대 위에 40px 따뜻한 격자를 둡니다. 스프링 모션입니다. |
| `newsroom` | NYT 신문 스타일. 신문 같은 크림색 종이 + 검은 세리프 잉크 + 플래그 레드. Playfair Display + Noto Serif SC. **모서리 반경 0px**(신문 모서리는 둥글지 않습니다). hero 숫자는 매우 큰 이탤릭 디스플레이 세리프입니다. 차분한 인쇄 리듬과 은은한 종이 질감. |
| `bauhaus-bold` | 모더니즘 선언문. 미색 + 검정 잉크 + 원색 파랑. Archivo Black + Inter. **모서리 반경 0px + 4px 굵은 단색 테두리 + 무대를 감싸는 4px 검은 프레임 + 오프셋 단색 그림자**. hero 숫자는 font-weight 900의 거대한 글자입니다. 빠르고 경쾌한 모션, 장식 없음. |
| `sunset-zine` | 독립 리소그래프 진(zine). 따뜻한 복숭아색 + 리소그래프 마젠타 + Fraunces. **점선 잘라내기 선과 오프셋 복숭아색 그림자**가 시그니처입니다. hero 숫자는 이탤릭 Fraunces. 거친 리소그래프 종이 질감. 스프링 오버슈트 모션. |
| `monochrome-print` | Monocle / Wallpaper / MIT Press 같은 차분하고 세련된 인쇄 잡지. 미색 + 검은 세리프 잉크 + 잉크 블루 포인트. Source Serif. **1px 실선 헤어라인과 세련된 4px 모서리 반경만 사용**합니다. hero 숫자는 이탤릭 tabular figures. **장식 없이** 미니멀하고 순수합니다. 매우 차분한 리듬(1.7s에 걸쳐 등장). |
| `vintage-editorial` | 장난기 있는 편집 디자인의 크림색 바탕. Fraunces italic + Work Sans + 따뜻한 도자기색 포인트. **가는 선의 기하학 오버레이(원 + 선 + 점)**가 시그니처입니다. 개성 있고 목소리가 분명한 칼럼니스트 같은 느낌. 중간 속도이며 약한 오버슈트가 있습니다. |
| `pastel-dream` | 친근하고 부드러운 빛. 부드러운 분홍빛 청회색 바탕 + 크림색 카드 + 세이지 그린. Plus Jakarta Sans. **20px의 큰 모서리 반경과 오른쪽의 다색 pill 색상 막대**가 시그니처입니다. 부드러운 스프링 느낌(520/820ms). |
| `split-canvas` | 두 가지 색으로 나뉜 캔버스 — 복숭아색과 라벤더를 50/50으로 딱 나눕니다. Outfit + 로즈 포인트. **화면 자체가 두 색의 바탕**이며, 각 장은 어느 쪽에 콘텐츠를 둘지 자유롭게 정합니다. 장난스럽고 중간 정도의 리듬(480/780ms). |
| `electric-studio` | 기업용 전기 블루. 깨끗한 흰색 바탕 + 단일 전기 블루 + Manrope. **아래쪽에 붙는 4px 전기 파랑 띠**가 시그니처입니다. B2B / 로드쇼 / 재무 보고에 어울리는 명료하고 자신감 있는 스타일. 펀치감 있는 리듬(420/700ms). |
| `indigo-porcelain` | 인디고 도자기 — **인디고를 잉크로 사용**합니다(강조색이 아니라 글자 자체의 색). 도자기처럼 흰 종이 바탕. Playfair Display italic + Noto Serif SC + IBM Plex Sans 본문. 현대 사상 저널 같은 학술 / 연구 분위기. 장식 없이 순수하고 느린 리듬(1.55s). |
| `forest-ink` | 숲의 잉크 — **숲의 녹색을 잉크로 사용**하고 따뜻한 상아색 종이를 깝니다. 본문은 Source Serif, 제목은 Playfair Display. 오래된 내셔널 지오그래픽처럼 차분하고 기록물 같은 느낌. 희미하고 따뜻한 그레인. 느린 리듬(1.65s). |
| `kraft-paper` | 크라프트지 — **짙은 갈색 잉크** + 크라프트색 종이. Fraunces + Source Serif + 구리색 포인트. 오래된 노트나 편지 봉투 같은 느낌. **거칠고 따뜻한 종이 질감**이 시그니처입니다. 느리고 촉각적인 리듬(1.55s). |
| `dune` | 모래 언덕 — **차콜 브라운 잉크** + 모래색 바탕 + 거의 없는 강조색(채도를 낮춘 클레이). Inter Display + 본문 Source Serif. **장식이 없고 padding이 매우 넓은 것(140×100)**이 시그니처입니다. 건축 매뉴얼 / 갤러리 분위기. 가장 느린 리듬(1.75s). |
| `swiss-ikb` | 스위스 국제주의. **매우 가는 200 weight Inter / Helvetica** + 깨끗하고 따뜻한 흰색 바탕 + IKB 클라인 블루 + **1px 가는 선 격자(64px)**. `r-card: 0`의 직각 모서리. Massimo Vignelli / Helvetica Forever의 기운. 펀치감 있는 선형 리듬(400/650ms). |

사용 가능한 테마를 언제든 나열할 수 있습니다.

```bash
bash <path-to-web-video-presentation>/scripts/scaffold.sh --list-themes
```

---

## 스캐폴딩할 때 테마 선택

```bash
# 默认（midnight-press）
bash scripts/scaffold.sh ./presentation

# 显式指定
bash scripts/scaffold.sh ./talk --theme=newsroom
```

스캐폴딩은 선택한 테마의 `tokens.css`를 `<project>/src/styles/tokens.css`에 복사하고, 테마 ID를 `<project>/.theme`에 기록합니다. 나중에 어떤 테마에서 시작했는지 확인할 수 있습니다.

---

## 나중에 테마 전환

전환은 파일 하나를 덮어쓰는 작업입니다.

```bash
cp <path-to-web-video-presentation>/themes/newsroom/tokens.css \
   presentation/src/styles/tokens.css
```

개발 서버를 새로 고치면 끝입니다. 장의 코드는 한 줄도 바꿀 필요가 없습니다.

전환한 뒤 특정 장이 깨져 보인다면 해당 장이 의미 기반 토큰 대신 어딘가에서 색상 / 글꼴 / 크기를 하드코딩했기 때문입니다. 찾아서 고치세요. 문제는 테마가 아니라 해당 장에 있습니다.

---

## 전체 토큰 규약

`base.css`는 **스타일 토큰에 합리적인 기본값을 제공합니다.** 테마의 `tokens.css`는 다음 네 범주만 재정의하면 됩니다. **팔레트 + 글꼴 + 스타일 조절값 + 장식**.

> **base.css의 글자 크기 / 간격 / 지속 시간 스케일은 기본 클래스가 자체적으로 사용할 뿐입니다**
> (`.label-mono` / `.kicker` / `.scene-pad` 등). **각 장이 반드시 사용해야 하는 규약이 아닙니다.**
> 장에서 `var(--t-h1)`을 쓸지 `font-size: 96px`을 직접 지정할지는 전적으로 자유입니다.

### 필수(테마에서 반드시 정의)

#### 표면 색상(4개)

| token | 역할 |
| --- | --- |
| `--shell` | 레터박스 / 무대 바깥의 페이지 배경 |
| `--surface` | 무대의 기본 배경 |
| `--surface-2` | 돌출된 표면 — 카드, 코드 블록, 삽입 패널 |
| `--surface-3` | 가장 안쪽 표면 — `surface-2` 안에 한 겹 더 들어갈 때 |

#### 텍스트(4개)

| token | 역할 |
| --- | --- |
| `--text` | 기본 텍스트 |
| `--text-2` | 보조 텍스트(부제목, 본문) |
| `--text-mute` | 약한 텍스트 — 레이블 / 메타데이터 |
| `--text-faint` | 세 번째 단계 — 힌트 / 비활성 상태 |

#### 선(1개)

| token | 역할 |
| --- | --- |
| `--rule` | 가는 구분선의 색상 |

#### 강조색(3개)

| token | 역할 |
| --- | --- |
| `--accent` | 강조색 자체(브랜드의 강한 색상 하나) |
| `--accent-soft` | 투명도가 낮은 레이어 — pill 배경, 은은한 후광 |
| `--accent-glow` | 중간 투명도의 레이어 — text shadow, 빛나는 점 |

#### 글꼴 계열(4개)

| token | 역할 |
| --- | --- |
| `--font-display-cn` | 중국어 디스플레이 글꼴 계열 |
| `--font-display-en` | 라틴 문자 디스플레이 글꼴 계열(이탤릭체가 강조 역할) |
| `--font-body` | 본문 / 단락 글꼴 계열 |
| `--font-mono` | 고정폭 글꼴 계열(터미널, 대문자 고정폭 텍스트, badge) |

### 선택 가능한 스타일 재정의(테마 고유의 성격을 표현하려면 정의)

base에 기본값이 있습니다. 테마가 자체 성격을 표현하도록 다시 정의할 수 있습니다.

| token | base 기본값 | 역할 |
| --- | --- | --- |
| `--font-features` | `"tnum","ss01"` | 본문에 적용할 OpenType 기능 스택 |
| `--r-card` | `--r-md` | 기본 카드 모서리 반경(sharp / refined / keynote) |
| `--r-stage` | `0` | 무대 자체에 직접 적용할 모서리 반경 |
| `--rule-w` | `1px` | rule 두께(1=가는 선, 2=중간, 4=두꺼움) |
| `--rule-style` | `solid` | rule 모양(`solid` / `dashed` / `dotted`) |
| `--hero-num-font` | `--font-display-en` | `.hero-num`에 사용할 글꼴(테마의 개성을 결정) |
| `--hero-num-style` | `italic` | `italic` / `normal` |
| `--hero-num-weight` | `400` | 400(편집 디자인) / 500(고정폭) / 900(굵은 블랙) |
| `--hero-num-track` | `--track-tight` | hero 숫자의 자간 |
| `--stage-pad-x` | `96px` | 무대의 가로 안쪽 여백(밀도 조절값) |
| `--stage-pad-y` | `80px` | 무대의 세로 안쪽 여백 |
| `--card-shadow` | none | `.card`의 box-shadow |
| `--card-glass-bg` | `rgba(255,255,255,0.06)` | `.card-glass`의 배경 |
| `--card-glass-border` | `rgba(255,255,255,0.12)` | `.card-glass`의 테두리 |
| `--shadow-stage` | dark drop | 무대의 box-shadow |
| `--stage-border` | `none` | 무대에 선택적으로 적용하는 테두리(Bauhaus는 `4px solid black` 사용) |

### 선택형 장식 레이어(테마가 선택해 질감 추가)

기본값은 아무 동작도 하지 않으며 테마가 선택적으로 켤 수 있습니다. 장식은 **무대 위에 그려집니다**(pattern은 `stage-frame::after`, vignette는 `stage-frame::before` 사용). 따라서 화면 녹화기에 잡힙니다.

| token | 역할 |
| --- | --- |
| `--surface-pattern` | 무대 위에 얹을 `background-image`. SVG 노이즈 / 격자 / 스캔라인 등에 사용 |
| `--surface-pattern-size` | 이에 대응하는 `background-size`. 반복 가능한 그라데이션이면 필수 |
| `--surface-pattern-blend` | pattern 레이어의 `mix-blend-mode` (`normal` / `multiply` / `overlay`) |
| `--surface-pattern-opacity` | pattern 레이어에 적용하는 전체 불투명도 배수 |
| `--surface-vignette` | vignette 레이어의 `background`(칠판 / 시네마틱한 가장자리의 방사형 그라데이션) |
| `--text-shadow` | `.serif-cn` / `.serif-it` / `.display-en`에 적용. 분필 번짐 / 인광 빛 등에 사용 |

필요한 장식에 맞는 슬롯이 없다면 “테마 규약”의 범위를 억지로 늘리지 말고 “장별 사용자 지정 CSS” 영역에서 구현합니다. 테마 규약은 그대로 둡니다.

---

## 새 테마 만들기

### 1. 가장 가까운 테마를 복사해 시작

목표하는 분위기와 **가장 가까운** 테마를 고릅니다.

| 목표 분위기 | 시작점 |
| --- | --- |
| 어둡고 시네마틱하며 편집 디자인 같은 분위기 | `midnight-press` |
| 밝은 편집 디자인 | `paper-press` |
| 현대적인 keynote / SaaS | `warm-keynote` |
| 교실 / 설명 자료 | `chalk-garden` |
| 터미널 / 해커 / 레트로 CRT | `terminal-green` |
| 다큐멘터리 / 진지함 / 뉴스 | `newsroom` |
| 엔지니어링 / 청사진 / 기술 | `blueprint` |
| 모더니즘 / 브루탈리즘 / 선언문 | `bauhaus-bold` |
| 인디 / 장난기 / zine | `sunset-zine` |
| 세련되고 차분한 인쇄물 | `monochrome-print` |
| 고급스러운 다크 테마 / 패션 / 박물관 도록 | `dark-botanical` |
| 사이버펑크 / 미래 / AI / web3 | `neon-cyber` |
| 장난스러운 편집 디자인 / 개성 강한 블로그 / 문화 에세이 | `vintage-editorial` |
| 부드러운 파스텔 / 친근함 / 온보딩 / 여성 대상 | `pastel-dream` |
| 두 색의 분할 화면 / 대조 / 토론 | `split-canvas` |
| 피치 덱 / 큰 활자 슬로건 / 포인트 색상 카드 | `bold-signal` |
| B2B / 기업 / 투자자 로드쇼 | `electric-studio` |
| 레트로 펑크 / 크리에이티브 스튜디오 / 디자인 위크 | `creative-voltage` |
| 학술 / 연구 / 중국 현대 문화 | `indigo-porcelain` |
| 자연 / 지속 가능성 / 야외 / 다큐멘터리 | `forest-ink` |
| 문학 / 향수 / 서평 / 공예 | `kraft-paper` |
| 건축 / 미술 전시 / 고급 갤러리 | `dune` |
| 스위스 국제주의 / Helvetica / 정보 중심 디자인 | `swiss-ikb` |

```bash
cd <path-to-web-video-presentation>/themes
cp -r monochrome-print my-theme
```

### 2. `my-theme/tokens.css` 수정

규약을 위에서 아래로 적용합니다. 팔레트 → 글꼴 → 스타일 조절값(`--r-card` / `--rule-*` / `--hero-num-*` / `--stage-pad-*`) → 그림자 → 장식.
**글자 크기 / 간격 / 지속 시간 스케일은** 수정하지 않습니다. 해당 값은 base.css가 기본 클래스용으로 제공하는 내부 기본값이며 테마 규약의 일부가 아닙니다.

**놓치기 쉬운 규칙:**

- 어두운 테마에서 `--shell`은 `--surface`보다 **더 어둡거나 채도가 높아야** 합니다. 밝은 테마에서는 `--shell`이 `--surface`보다 **약간 더 회색이어야** 합니다. 그래야 무대가 “주인공”으로 보이고 바깥 영역은 뒤로 물러납니다.
- `--text`와 `--surface`의 대비율은 **최소 4.5:1**이어야 합니다. 96px 이상의 큰 제목은 3:1까지 허용할 수 있지만 본문 / cue는 반드시 4.5:1 이상이어야 합니다.
- `--accent`는 채도가 높은 **유일한 색상**입니다. 채도 높은 색을 하나 더 쓰면 첫 번째와 충돌합니다.
- `--accent-glow`와 `--accent-soft`는 `--accent`와 **같은 색상 계열의 투명도 레이어**입니다. 다른 색상 계열을 쓰지 않습니다.
- `--surface` 위에 표시하는 13px 대문자 `--text-faint`도 **읽을 수 있어야** 합니다.
- **시그니처 디자인 요소 하나를** 강하게 강조합니다. 점선 rule, 굵은 검은 테두리, 스캔라인, 종이 질감, 유리 패널 중에서 고릅니다. 세 가지를 한꺼번에 겹치지 마세요.

### 3. `my-theme/theme.json` 수정

```json
{
  "id": "my-theme",
  "name": "My Theme",
  "nameZh": "我的主题",
  "description": "一句英文描述它的气质。",
  "descriptionZh": "一句中文描述它的气质。",
  "mood": ["dark", "moody", "futuristic"],
  "bestFor": ["<匹配场景 1>", "<匹配场景 2>"],
  "preview": {
    "shell": "#080808",
    "surface": "#101010",
    "text": "#f0f0f0",
    "accent": "#ffd54a"
  }
}
```

`id`는 디렉터리 이름과 일치해야 합니다.

### 테마 메타데이터 필드 설명

| 필드 | 필수 | 값 | 용도 |
| --- | --- | --- | --- |
| `id` / `name` / `nameZh` | ✓ | 문자열 | 테마 식별 정보 |
| `description` / `descriptionZh` | ✓ | 한 문장 | Checkpoint Plan에서 목록을 보여 줄 때 사용하는 설명 |
| `mood` | ✓ | 태그 배열 | 모호한 요청과 테마를 매칭할 때 사용 |
| `bestFor` | ✓ | 장면 배열 | Checkpoint Plan이 테마를 추천할 때 참고하는 장면 |
| `preview` | ✓ | 색상 4개로 된 객체 | Checkpoint Plan의 목록에서 시각 미리보기로 사용 |

> **테마는 더 이상 애니메이션 선택 / 지속 시간 / 글자 크기 / emoji를 제한하지 않습니다.** 시각 스타일은 `tokens.css`의 색상 / 글꼴 / 글자 크기 토큰으로 정하고, 애니메이션 / 리듬 / 시각적 설명은 장을 구현할 때 장별 에이전트가 콘텐츠에 맞게 자유롭게 결정합니다. 테마 필드가 창의성을 미리 제한하지 않도록 합니다.
>
> 보라·분홍 그라데이션 금지, emoji 장식 금지, 허위 데이터 금지 등 스타일 제약은 테마별 설정과 무관하게 [`CHAPTER-CRAFT.md`](CHAPTER-CRAFT.md)에서 통일해 정의합니다.

### 4. 모든 데모 장으로 테스트

```bash
bash scripts/scaffold.sh /tmp/test-theme --theme=my-theme
cd /tmp/test-theme
npm run dev
```

데모의 각 단계를 눌러 확인합니다.

- 무대에서 세리프 제목이 선명하게 보입니다.
- 강조색 점에 빛이 나지만 번지거나 과하게 밝지 않습니다.
- 이탤릭 강조에 읽기 쉬운 배경이 있습니다.
- 무대의 아래쪽에 떠 있는 진행 막대가 보이고 강조색을 사용합니다.
- masthead 행(`.masthead`)이 navbar가 아니라 편집 디자인의 크롬처럼 읽힙니다.
- hero 숫자(`.hero-num`)가 **전체 타이포그래피와 같은 계열로 느껴지고**, 따로 붙여 놓은 것처럼 보이지 않습니다.
- 카드(`.card`)의 소재가 적절하게 느껴집니다(종이 / 유리 / cell).
- 장식은 **한 번 눈에 들어온 뒤 잊힙니다.** 계속 주의를 빼앗지 않아야 합니다.

문제가 있으면 `tokens.css`를 고치고 새로 고칩니다. 다시 빌드할 필요는 없습니다.

### 5. 문서에 추가

이 파일의 맨 위 “기본 제공 테마” 표에 행 하나를 추가합니다.

---

## 안티패턴

- **장 CSS에 hex 색상 / 글꼴 이름을 하드코딩** — 필요한 색상 / 글꼴 의미가 규약에 없으면 토큰을 추가하고 모든 테마에서 각자 값을 제공하게 합니다(주의: **글자 크기 / 간격 / 지속 시간**의 하드코딩은 안티패턴이 아닙니다. 각 장은 콘텐츠에 맞춰 자유롭게 설계합니다).
- **프레젠테이션 중간에 테마를 바꾸기** — 하나를 골라 처음부터 끝까지 유지합니다.
- **두 번째 강조색 사용** — 강조색은 하나뿐입니다. 크기와 글자 굵기로 위계를 만듭니다.
- **컴포넌트 단위에서 테마 토큰을 재정의**(색상 / 글꼴 / 시그니처 스타일) — `:root`에서만 덮어씁니다. 한 번만 필요한 색상은 파생 토큰을 제안하고 모든 테마가 자체 값을 제공하도록 합니다.
- **테마에 의존하는 TSX 조건 분기** — 장은 테마와 무관해야 합니다. 밝고 어두운 테마에 따라 레이아웃을 바꿔야 한다면 레이아웃이 취약한 것이니 고칩니다.
- **하나의 테마에 시그니처 디자인 요소 세 가지를 겹쳐 사용** — 하나만 고릅니다(점선 rule / 스캔라인 / 유리 패널 / 종이 질감 / 굵은 테두리). 세 개를 쓰면 서로 경쟁합니다.
