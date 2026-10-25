# JSON 프롬프트 템플릿 전체 규칙

이 문서는 `gpt-image-2` 스킬의 템플릿 방법론 전체를 설명합니다. 이후 작성하는 모든 구체적인 템플릿 파일은 가능한 한 이 규칙을 따라야 합니다.

특정 시각 장면의 완성된 템플릿을 제공하는 대신 다음을 정의합니다.

- 템플릿 구성 방법
- 필드 설계 방법
- 매개변수를 "필수 질문 / 기본값 / 무작위"로 나누는 방법
- 누락 정보를 질문하는 방법
- 사례에서 재사용할 수 있는 구조화된 JSON 템플릿을 도출하는 방법

---

# 1. JSON 템플릿을 사용하는 시점

작업이 다음 조건 중 하나라도 충족하면 자연어 프롬프트를 한 덩어리로 바로 쓰기보다 JSON 템플릿을 우선 사용합니다.

1. 이미지 요소가 많음
2. 이미지에 기능 영역이 여러 개 있음
3. UI / 상품 카드 / 댓글 영역 / 범례 / 주석 / 머리글·바닥글 등의 구조가 필요함
4. 여러 변형을 지원해야 함
5. "사용자 지정 / 기본값 / 무작위 생성"의 세 가지 모드를 지원해야 함
6. 이후 재사용, 확장 또는 디버깅할 가능성이 높음

대표적인 적용 장면:

- 전자상거래 라이브 방송 UI 목업
- 제품 분해도 포스터
- 손그림 도시 지도
- 설명용 슬라이드
- 정보 밀도가 높은 설명 이미지

JSON 템플릿을 억지로 사용할 필요가 없는 장면:

- 단일 주제의 매우 간단한 이미지
- 복잡한 레이아웃이나 다중 영역 구조가 없음
- 사용자가 가벼운 시각 방향을 빠르게 시험해 보고 싶을 뿐임

---

# 2. references 디렉터리 규칙

`references/`는 다음 구조를 사용해야 합니다.

- 1단계: 분류 디렉터리
- 2단계: 개별 템플릿 Markdown 파일

예:

```text
references/
  ui-mockups/
    live-commerce-ui.md
    social-interface-mockup.md
  product-visuals/
    exploded-view-poster.md
```

다음 구조는 더 이상 사용하지 않습니다.

- 큰 분류 하나를 큰 파일 하나에 몰아넣기
- 출처마다 파일 하나씩 만들기
- 사례마다 분류 없이 파일을 평면적으로 나열하기

디렉터리 트리의 장점:

- 정확하게 읽을 수 있음
- 확장하기 쉬움
- 템플릿끼리 서로 영향을 주지 않음
- 각 템플릿 파일을 충분히 자세히 작성할 수 있음

---

# 3. 개별 템플릿 파일의 표준 구조

구체적인 템플릿 파일은 다음 구조를 따르는 것이 좋습니다.

```markdown
# 模板名称

## 适用范围

## 何时使用

## 缺失信息优先提问顺序

## 主模板

📖 描述

📝 提示词
```json
{ ... }
```

### 参数策略

### 自动补全策略

### 变体方式

## 变体 1

## 变体 2

## 避免事项
```

설명:

- `주 템플릿`이 먼저 있어야 함
- 변형 템플릿은 주 템플릿을 바탕으로 구성
- 매개변수 전략, 자동 완성 전략, 피해야 할 사항을 생략하지 않음

---

# 4. JSON 템플릿 권장 기본 골격

대부분의 템플릿은 우선 다음 골격으로 시작하는 것이 좋습니다.

```json
{
  "type": "模板类型",
  "goal": "图像用途",
  "subject": {},
  "scene": {},
  "layout": {},
  "style": {},
  "details": {},
  "constraints": {}
}
```

## 필드별 역할

### `type`

템플릿 유형 이름. 예:

- 라이브 방송 UI 목업
- 제품 분해도 포스터
- 손그림 지도 인포그래픽

### `goal`

이미지의 최종 용도를 설명합니다. 예:

- 전자상거래 라이브 방송 스크린샷 목업
- 브랜드 메인 비주얼 포스터
- 여행 가이드 지도
- 고밀도 설명 이미지

### `subject`

주요 대상. 예:

- 인물
- 상품
- 도시
- 캐릭터
- 일러스트 주인공

### `scene`

장면, 배경, 환경, 분위기.

### `layout`

화면 영역을 구성하는 방식입니다. 다음에 적용합니다.

- 포스터
- UI
- 지도
- 슬라이드
- 다중 영역 구조도

### `style`

스타일, 렌더링, 재질, 색상 방향, 조명.

### `details`

세부 요소를 담는 필드. 예:

- 상품 장점
- 콜아웃 라벨
- 댓글 내용
- 범례 항목
- 바닥글 문구

### `constraints`

다음 내용을 명확히 지정합니다.

- 반드시 포함할 요소
- 반드시 피할 요소
- 최종 결과가 무엇처럼 보여야 하고 무엇처럼 보이면 안 되는지

---

# 5. 장면별 필드 권장 사항

분류에 따라 다른 구조를 확장해 사용할 수 있습니다.

## 5.1 UI Mockups

다음 필드를 추가로 사용하는 것을 권장합니다.

```json
{
  "ui_overlay": {
    "top_header": {},
    "chat_area": {},
    "gift_area": {},
    "product_card": {},
    "bottom_bar": {}
  }
}
```

## 5.2 Product Visuals

다음 필드를 추가로 사용하는 것을 권장합니다.

```json
{
  "header": {},
  "centerpiece": {},
  "callout_labels": {},
  "footer": {},
  "component_layers": []
}
```

## 5.3 Maps & Infographics

다음 필드를 추가로 사용하는 것을 권장합니다.

```json
{
  "title_section": {},
  "sections": [],
  "legend": {},
  "centerpiece": {},
  "extras": {}
}
```

## 5.4 Slides & Visual Docs

다음 필드를 추가로 사용하는 것을 권장합니다.

```json
{
  "page_type": "",
  "information_density": "",
  "headline_system": {},
  "visual_blocks": [],
  "annotation_style": {}
}
```

## 5.5 스토리보드 및 시퀀스(영화 콘티 / TVC / 공정 보드 / 만화)

"같은 이야기 / 같은 절차 / 같은 동작 묶음"을 N×M 그리드의 여러 패널로 출력하는 시각물에 적용합니다. 하위 유형마다 필드가 많이 다르므로 유형별 권장 필드를 안내합니다.

### 5.5.1 영화 / 단편 시네마틱 콘티(예: `cinematic-storyboard-grid.md`)

```json
{
  "subject": { "primary": "", "secondary": "", "mood": "", "style": "", "aspect_ratio_per_panel": "" },
  "vehicle_or_actor": { "design": "", "scale": "" },
  "layout": {
    "grid": { "rows": 0, "columns": 0, "count": 0 },
    "sheet_aspect_ratio": "",
    "panel_borders": "",
    "sections": [{ "position": "row x col y", "description": "" }],
    "continuity": "(必填) 显式声明 N 个 panel 是连续叙事 / 同一 hero / 同一 mood"
  },
  "lighting": { "primary": "", "secondary": "", "accents": "" },
  "environment": { "location": "", "weather": "", "threat": "" }
}
```

필드 설계 참고:

- `sections`는 배열이어야 하며 **각 샷을 행 우선 순서(row-major)로 정확히 나열**합니다(모델이 자유롭게 배열하도록 두지 않음).
- `continuity`는 이 하위 유형의 핵심 필드이며 **필수**입니다.
- 각 샷 설명에는 "샷 크기 + 주 대상의 동작 + 조명 / 감정" 세 요소를 포함합니다.
- 원경 / 중경 / 근경 / POV 샷을 섞고 클로즈업이나 원경만 사용하지 않습니다.

### 5.5.2 상업 광고 TVC 콘티(예: `product-tvc-storyboard.md`)

```json
{
  "header": { "title": "", "subtitle_meta": "", "product_name_subtitle": "" },
  "layout": { "grid": { "rows": 0, "columns": 0, "panel_count": 0, "panel_aspect_ratio": "" } },
  "scenes": {
    "count": 0,
    "items": [{ "id": 1, "title_zh": "", "timestamp": "0-2s", "description": "" }]
  }
}
```

필드 설계 참고:

- 영화 콘티와 달리 `header.product_name_subtitle` 및 각 샷의 `timestamp`가 반드시 있어야 합니다(광고에서는 필수 조건).
- 각 샷의 `title_zh`는 고객을 위한 중국어 소제목입니다(예: "환경 설정", "클로즈업 등장", "인물과 제품을 함께 보여 줌").
- `description`에는 **제품을 명시적으로 포함**하고 모든 샷에서 제품 외관을 일관되게 유지합니다.

### 5.5.3 실제 인물 / 캐릭터 시네마틱 절차 보드(예: `process-photo-board.md`)

```json
{
  "subject": {
    "character": { "gender": "", "age": "", "identity": "", "hair": "", "undersuit": "", "armor_or_outfit": "", "helmet_or_headpiece": "" },
    "environment": { "location": "", "background_elements": "" }
  },
  "layout": {
    "header": { "count": 2, "labels": ["title", "subtitle"], "design": "" },
    "sections": [{ "step_id": 1, "title": "", "position": "", "labels": [], "image": "" }],
    "footer": { "count": 1, "labels": ["slogan"], "design": "" },
    "grid": { "rows": 0, "columns": 0, "panel_count": 0, "panel_borders": "", "number_badges": "" }
  },
  "text_rendering": { "language": "", "font": "", "colors": "" }
}
```

필드 설계 참고:

- **캐릭터 일관성**은 모든 고정 속성(gender / hair / undersuit)을 `subject.character` 필드로 분리해 유지합니다.
- **상태 변화**는 각 단계의 `image` 필드에 "현재 무엇을 입었는지 / 무엇을 하고 있는지"를 명시해 표현합니다.
- 단계 번호를 한눈에 알아볼 수 있도록 `number_badges` 필드가 반드시 필요합니다.
- 제목 언어(중국어 / 일본어 / 영어)는 `text_rendering.language`에 명시합니다.

## 5.6 카탈로그 / 라인업 / 캐릭터 변형 포스터(다중 카드 인포그래픽 포스터)

"같은 기반(캐릭터 / 제품 / 개념)의 여러 변형을 포스터 한 장에 나란히 보여 주는" 시각물에 적합합니다. 하위 유형:

### 5.6.1 동일 캐릭터의 여러 버전 포스터(예: `character-catalog-poster.md`)

```json
{
  "subject_overview": "(必填) 全图主题，如 '十二星座女子图鉴'",
  "language": "",
  "format": "vertical poster",
  "style": { "overall": "", "rendering": "", "mood": "" },
  "layout": {
    "sections_count": 0,
    "sections": [{
      "title": "",
      "position": "",
      "theme_color": "(必填) 该 panel 的主题色，必须 panel 间各不相同",
      "symbol": "",
      "constellation": "",
      "labels": [],
      "character": { "pose": "", "outfit": "", "background": "" }
    }]
  }
}
```

필드 설계 참고:

- 각 section은 자체 `theme_color` + `symbol` + `motif`가 있어야 합니다. 그렇지 않으면 모델이 모든 패널을 똑같이 그립니다.
- `character` 하위 필드는 같은 기반(얼굴형 / 체형 / 머리색)을 유지하고 outfit / pose / background만 바꿉니다.
- `subject_overview`는 모델이 "왜 이 패널들을 함께 배치하는지" 이해하게 하는 핵심 지시입니다.

### 5.6.2 제품 시리즈 라인업 비교 포스터(예: `lineup-comparison-poster.md`)

```json
{
  "subject": "(必填) 描述一句包含 'lineup chart / catalog board / comparison poster'",
  "branding": { "headline": "", "signature": "", "seals": [] },
  "palette": { "background": "", "highlights": [] },
  "layout": {
    "header": { "elements": [{ "type": "legend", "title": "", "labels": [] }] },
    "sections": [{ "title": "row N tier name", "labels": [] }]
  },
  "content_grid": "显式说明每行多少 SKU、每 SKU 是什么样的卡片",
  "visual_details": "材质 / 反光 / 印花 / 配件等让 SKU 之间彼此不同的细节"
}
```

필드 설계 참고:

- `legend` 유형 요소(등급 키 / 아이콘 키 / 스타일 키)를 반드시 포함해야 합니다. 없으면 포스터의 "비교" 의미가 사라집니다.
- `content_grid` 필드에 "행마다 SKU N개 + 행 안의 정렬 기준(가격 / 색상 / 연도별)"을 명시해야 합니다.
- SKU 수는 보통 12~36개입니다. 너무 적으면 라인업처럼 보이지 않고 너무 많으면 각각 흐릿하게 그려집니다.

## 5.7 당일 여행 일정 지도(왼쪽 일정 카드 + 오른쪽 지도 장면 분할 포스터)

"당일 여행 분할 포스터"에 적용합니다(예: `itinerary-day-trip-map.md`).

```json
{
  "destination": { "name": "", "duration": "1 day", "theme": "" },
  "headline": { "main": "", "tagline": "", "divider": "" },
  "style": { "overall": "", "left_panel_look": "", "right_panel_look": "", "color_palette": "", "atmosphere": "" },
  "layout": {
    "format": "vertical 2:3 poster, split into two equal vertical columns",
    "left_panel": { "type": "itinerary card", "header": [], "stop_count": 5, "stop_design": [], "border": "" },
    "right_panel": { "type": "painted map scene", "background": "", "path": "", "marker_design": "", "compass_rose": "", "stats_box": "" },
    "alignment_rule": "(必填) 左右编号 / 名称 / 顺序必须严格对齐"
  },
  "stops": {
    "count": 5,
    "items": [{ "number": 1, "name": "", "time": "", "description": "", "left_vignette": "", "right_scene": "" }]
  },
  "footer_box": { "compass_rose": "", "stats_box": { "design": "", "stats": [] } }
}
```

필드 설계 참고:

- `alignment_rule`은 **필수**입니다. 없으면 좌우 열이 쉽게 어긋납니다.
- 각 stop에 `left_vignette`(카드용 작은 일러스트) + `right_scene`(지도용 큰 장면) 두 시각 요소를 모두 제공합니다.
- `stops.count`는 5~7개가 적당합니다. 너무 적으면 일정처럼 보이지 않고 너무 많으면 카드를 넣을 수 없습니다.
- `language`는 기본적으로 목적지의 공식 언어와 일치합니다(대만 → 번체 중국어, 교토 → 일본어).

## 5.8 다중 그리드 광고 배너 세트(여러 업종이 섞인 광고 배너 그리드)

"이미지 한 장에 서로 다른 업종 / 주제의 독립 배너 N개를 동시에 보여 주는" 시각물에 적용합니다(예: `ad-banner-multi-grid.md`).

```json
{
  "language": "",
  "layout": {
    "structure": "2x2 / 3x3 grid of equal quadrants",
    "gutter": "",
    "overall_aspect_ratio": "",
    "panel_aspect_ratio": "",
    "quadrants": [{
      "position": "top-left",
      "theme": "(必填) 该格的行业 / 主题，如 'Travel' / 'Skincare'",
      "subject": "",
      "elements": [],
      "text_labels": [],
      "style": "(必填) 该格的视觉风格，与其它格不同"
    }]
  },
  "global_style": "把所有格统一的元素（如统一字体 / 统一边框）",
  "constraints": { "must_keep": ["每格内容彼此独立、无叙事关联"] }
}
```

필드 설계 참고:

- `quadrants` 배열은 **필수**이며 각 칸의 `theme` + `style`을 개별 지정해야 합니다.
- `global_style`은 글꼴 통일처럼 "통일감"을 주는 용도지만 모든 칸이 같은 주제를 공유하게 **하지 않습니다**.
- `cinematic-storyboard-grid`와 달리 이 템플릿은 **패널 사이에 서사적 연결이 없음**을 강조하며 각 칸이 독립된 결과물입니다.
- 기존 `banner-grid-2x2`와 달리 이 템플릿은 **여러 업종 / 여러 주제**를 다룹니다. 기존 템플릿은 같은 브랜드의 여러 크리에이티브를 다룹니다.

## 5.9 전체 브랜드 / 마스코트 문서(18개 이상 모듈의 대형 브랜드 아이덴티티 전 과정 문서)

"브랜드 전체 / 마스코트의 DNA부터 실제 적용까지 전체 과정을 한 이미지에 요약"할 때 사용합니다(예: `full-mascot-brand-doc.md`).

```json
{
  "brand": { "name": "", "industry": "", "primary_colors": [], "voice": "" },
  "character": { "description": "", "rendering_style": "" },
  "layout": {
    "grid": "3 columns by 6 rows",
    "panel_count": 18,
    "sections": [
      { "id": "01", "title": "01 BRAND DNA ANALYSIS", "elements": [] },
      { "id": "02", "title": "02 CONCEPT MOODBOARD", "elements": [] }
    ]
  }
}
```

필드 설계 참고:

- `sections` 배열에 모듈 18개를 **명시적으로 나열**하고 각 모듈에 `id` + `title` + `elements`를 둡니다.
- 모듈 `id`는 두 자리 번호(01~18)로 매겨 시각적으로 "목차" 느낌을 줍니다.
- 각 모듈의 `elements`에는 "이 칸에 무엇을 그릴지"(스케치 / 3D / 색상 팔레트 / 적용 장면)를 명시해야 합니다.
- 기존 `mascot-brand-kit`과 달리 이 템플릿은 **전체 과정 문서**(18~24칸)이며 기존 템플릿은 **간소화된 키트**(6~9칸)입니다.

---

# 6. 매개변수 설계 규칙

각 템플릿 필드를 가능한 한 다음 유형 중 하나로 분류합니다.

## 6.1 핵심 매개변수(우선 질문)

누락되면 결과에 큰 영향을 주므로 사용자에게 먼저 질문합니다.

대표적인 예:

- 주제가 누구 / 무엇인지
- 상품 이름이 무엇인지
- 도시 이름이 무엇인지
- 주제가 무엇인지
- 실제 인물 사진인지 텍스트 설명인지
- 어떤 플랫폼 스타일인지

## 6.2 기본값을 지정할 수 있는 매개변수

누락되어도 기본값을 사용할 수 있으며 템플릿이 정상적으로 작동합니다.

대표적인 예:

- 배경색
- 보조 버튼 문구
- 일반 장식 요소
- 일반적인 조명 표현
- 보통의 색상 방향

## 6.3 무작위로 정할 수 있는 매개변수

자동 완성을 허용하되 스타일 범위에 맞춰 합리적으로 생성해야 합니다.

대표적인 예:

- 시청자 닉네임
- 보조 채팅 메시지
- 선물 알림
- 작은 장식 요소
- 보조 배경 내용

---

# 7. 매개변수 작성 규칙

변수는 다음 형식을 통일해 사용합니다.

```text
{argument name="host name" default="Elon Musk"}
```

권장 규칙:

- `name`: 간결하고 명확하게 작성
- `default`: 바로 사용할 수 있는 기본값 제공
- 나중에 자주 무작위로 설정할 필드도 먼저 합리적인 기본값을 지정

다음은 사용하지 않습니다.

- 모호한 매개변수 이름
- 필수 질문 항목도 아니면서 기본값이 없는 필드

---

# 8. 누락 정보 질문 전략

## 8.1 기본 원칙

질문은 다음 조건을 지켜야 합니다.

- 정확할 것
- 개수가 적을 것
- 템플릿의 핵심 필드만 물을 것
- 막연한 질문은 피할 것

## 8.2 일반적인 우선순위

질문이 필요한지 다음 순서로 판단하는 것을 권장합니다.

1. 주제의 출처가 무엇인가
2. 이미지의 용도가 무엇인가
3. 핵심 대상 / 상품 / 주제가 무엇인가
4. 누락 정보를 자동으로 완성해도 되는가
5. 반드시 유지하거나 반드시 피해야 할 요소가 있는가

## 8.3 라이브 방송 UI 유형 예시

다음처럼 묻지 않습니다.

- "어떤 느낌으로 만들고 싶으신가요?"

대신 우선 다음을 질문합니다.

- 스트리머는 누구인가요?
- 실제 사진, 유명인 이름, 인물 설명, 무작위 생성 중 어떤 방식을 사용할까요?
- 상품 이름은 무엇인가요?
- 상품 가격을 지정할까요?
- 댓글과 선물 내용을 제가 자동 완성해도 될까요?

## 8.4 영화 / TVC 콘티 유형 예시

다음처럼 묻지 않습니다.

- "어떤 이야기를 원하시나요?"

대신 우선 다음을 질문합니다.

- 한 문장 이야기: 누가 + 어디서 + 무슨 일이 일어나고 + 결말은 무엇인가요?
- 장르는 무엇인가요?(공상과학 / 재난 / 전투 / 로맨스 / 미스터리 / 필름 누아르)
- 샷 수는 몇 개인가요?(9 / 12 / 16) + 그리드(3×3 / 3×4 / 4×4)
- 감정 곡선: 시작 → 상승 → 절정 → 하강 / 계속 긴장 / 차분하다가 폭발 중 어떤 형태인가요?
- 스타일: 실사 / 유화 / 애니메이션 시네마틱 / 흑백 / 레트로 필름 중 무엇인가요?
- (TVC 전용) 제품은 무엇인가요? 브랜드 이름 / 장점 / 길이 / 비율은요?

## 8.5 절차 보드 / 장비 착용 / 튜토리얼 보드 예시

다음처럼 묻지 않습니다.

- "이미지를 몇 장 만들고 싶으신가요?"

대신 우선 다음을 질문합니다.

- 절차 주제는 무엇인가요?(장비 / 메이크업 / 조작 / 훈련 / 수리)
- 주인공은 누구인가요?(성별 / 나이 / 핵심 식별 특징 / 얼굴 개인정보 보호 필요 여부)
- 단계 수는 몇 개인가요?(4 / 6 / 8 / 9) + 그리드
- 각 단계의 "제목 + 간단한 설명 + 현재 장비 상태 / 동작"
- 스타일: 시네마틱 실사 / 패션 화보 / 특촬물 / 작업장 기록 사진 중 무엇인가요?
- 텍스트 언어(제목 / 설명 필드)는 무엇인가요?

## 8.6 캐릭터 여러 버전 카탈로그 포스터 예시

다음처럼 묻지 않습니다.

- "어떤 캐릭터를 그리고 싶으신가요?"

대신 우선 다음을 질문합니다.

- 전체 이미지의 주제는 무엇인가요?(십이 별자리 / 오행 / 왕조 / 성격 유형 / 절기)
- 버전은 모두 몇 개인가요?(3 / 5 / 6 / 12)
- 버전별 "이름 + 테마 색상 + 의상 / 소품 / 배경"
- 같은 캐릭터의 기반(얼굴형 / 체형 / 머리색) 중 무엇을 유지하나요?
- 스타일: 애니메이션 / 중국풍 공필화 / 귀여운 치비 / 실사 중 무엇인가요?

## 8.7 제품 시리즈 라인업 비교 포스터 예시

다음처럼 묻지 않습니다.

- "어떤 포스터를 만들고 싶으신가요?"

대신 우선 다음을 질문합니다.

- 브랜드 / 제품군 이름은 무엇인가요?
- SKU는 몇 개인가요?(12~36개 권장)
- 어떤 기준으로 정렬할까요?(등급 / 시리즈 / 연도 / 가격)
- 범례(등급 키 / 아이콘 키 / 스타일 키)가 필요한가요?
- 배경 분위기: 고급스러운 다크 / 레트로 크라프트지 / 인더스트리얼 미니멀 중 무엇인가요?

## 8.8 당일 여행 분할 포스터 예시

다음처럼 묻지 않습니다.

- "어디로 가고 싶으신가요?"

대신 우선 다음을 질문합니다.

- 목적지는 어디인가요?(관광지 / 도시 / 국립공원 이름)
- 제목 문구와 텍스트 언어(중국어 / 일본어 / 영어)는 무엇인가요?
- 경유지는 몇 곳인가요?(5~7곳) + 각 지점의 "이름 + 시간 + 한 문장 설명 + 작은 삽화 + 큰 장면"
- 전체 경로의 주제는 무엇인가요?(자연 / 역사 / 음식 / 사진 / 순례)
- 스타일: 레트로 일러스트 / 국립공원 포스터 / 일본식 수채화 / 아르누보 중 무엇인가요?
- 하단 통계(총 거리 / 걸음 수 / 예상 시간)는 무엇인가요?

---

# 9. 자동 완성 전략

사용자가 다음과 같이 명확히 말하면:

- "네가 완성해 줘"
- "무작위로 생성해 줘"
- "우선 데모를 보여 줘"

다음을 허용합니다.

1. 가장 중요한 질문 1~2개만 질문
2. 나머지 필드에는 기본값 사용
3. 또는 무작위 지정 가능 필드에 합리적인 값을 생성

자동 완성 시 반드시 지켜야 할 사항:

- 주제의 일관성을 해치지 않음
- 사용자가 지정한 정보와 충돌하지 않음
- 지나치게 터무니없는 보조 요소를 만들지 않음

---

# 10. 주 템플릿과 변형 템플릿의 관계

각 템플릿 파일에는 최소한 다음이 있어야 합니다.

1. 주 템플릿 하나
2. 몇 가지 변형 템플릿(선택 사항이지만 권장)

## 주 템플릿

주 템플릿은 다음 조건을 충족해야 합니다.

- 가장 범용적이어야 함
- 가장 재사용하기 쉬워야 함
- 대부분의 사용 장면을 포괄할 수 있어야 함

## 변형 템플릿

흔한 변형 유형:

- 사용자가 참고 사진을 제공하는 버전
- 사용자가 유명인 이름을 제공하는 버전
- 사용자가 텍스트 설명을 제공하는 버전
- 자동 완성 버전
- 플랫폼 스타일 버전
- 상업성 강화 버전

변형은 주 템플릿과 완전히 분리하지 말고 주 템플릿 구조에서 일부 필드만 조정해야 합니다.

---

# 11. 참고 사례에서 템플릿을 도출하는 단계

현재 참고 사례의 주요 출처:

- `skills/gpt-image-2/100+GPT-Image2提示词.md`

이후 템플릿을 도출할 때는 다음 단계를 엄격히 따릅니다.

## 1단계: 먼저 분류를 판단

사례를 올바른 1단계 디렉터리에 넣습니다(`SKILL.md` 템플릿 인덱스와 일치해야 함).

- ui-mockups
- product-visuals
- maps(maps-and-infographics라고 부르지 않음)
- slides-and-visual-docs
- poster-and-campaigns
- portraits-and-characters
- scenes-and-illustrations
- editing-workflows
- avatars-and-profile
- storyboards-and-sequences
- grids-and-collages
- branding-and-packaging
- typography-and-text-layout
- assets-and-props
- academic-figures
- infographics
- technical-diagrams

## 2단계: 새 원형인지 기존 원형의 변형인지 판단

예:

- VR 헤드셋 분해도 → 새 원형
- 휴대전화 분해도 → 기존 원형의 변형

## 3단계: 필드 분해

사례를 다음 필드로 나눕니다.

- 주제
- 장면
- 레이아웃
- 스타일
- 문구
- 제약 조건

## 4단계: 매개변수 유형 표시

각 필드에 다음 중 하나를 표시합니다.

- 필수 질문
- 기본값 가능
- 무작위 가능

## 5단계: 주 템플릿 먼저 작성

처음부터 버전 네 개를 만들지 말고 가장 범용적인 주 템플릿부터 작성합니다.

## 6단계: 변형 추가

예:

- 참고 사진 버전
- 인물 이름 버전
- 설명 버전
- 자동 완성 버전

## 7단계: 질문 순서 추가

실제 대화에서 어떤 필드를 먼저 질문해야 하는지 설명합니다.

## 8단계: 피해야 할 사항 추가

이 템플릿에서 가장 흔히 발생하는 실패 요소를 정리합니다.

---

# 12. 템플릿 파일 이름 규칙

템플릿 파일 이름은 다음 조건을 충족해야 합니다.

- 소문자 사용
- 숫자 또는 하이픈 사용 가능
- 주제를 가능한 한 정확히 표현
- 출처 이름으로 파일을 명명하지 않음
- 일련번호로 파일을 명명하지 않음

올바른 예:

- `live-commerce-ui.md`
- `exploded-view-poster.md`
- `food-map.md`

잘못된 예:

- `template-01.md`
- `youmind-case-1.md`
- `twitter-prompt-4.md`

---

# 13. 개별 파일 구현 체크리스트(이후 템플릿을 추가할 때마다 준수)

앞으로 템플릿 파일을 새로 추가할 때마다 다음 체크리스트를 따릅니다.

1. 1단계 분류 디렉터리 결정
2. 파일 이름이 충분히 정확한지 확인
3. 새 원형인지 기존 원형의 변형인지 판단
4. `적용 범위` 작성
5. `사용 시점` 작성
6. `누락 정보 확인 우선순위` 작성
7. 주 템플릿 JSON 작성
8. 매개변수 전략 작성
9. 자동 완성 전략 작성
10. 변형 방식 작성
11. 피해야 할 사항 작성
12. 새 템플릿 주제라면 `SKILL.md` 인덱스도 함께 업데이트

---

# 14. 1단계: references 디렉터리 트리 재구성

## 목표

`references/`를 평면 구조에서 디렉터리 트리로 전환합니다.

## 작업 단계

### 1. 1단계 분류 디렉터리 만들기

다음 빈 디렉터리를 만듭니다.

- `references/ui-mockups/`
- `references/product-visuals/`
- `references/maps-and-infographics/`
- `references/slides-and-visual-docs/`
- `references/poster-and-campaigns/`
- `references/portraits-and-characters/`
- `references/scenes-and-illustrations/`
- `references/editing-workflows/`
- `references/branding-and-packaging/`
- `references/typography-and-text-layout/`
- `references/storyboards-and-sequences/`
- `references/assets-and-props/`

### 2. 기존 라이브 방송 템플릿 이동

기존 라이브 방송 템플릿을 다음 위치로 이동합니다.

- `references/ui-mockups/live-commerce-ui.md`

### 3. `SKILL.md` 업데이트

기존 평면 인덱스를 다음 형식으로 바꿉니다.

- 1단계 분류
- 2단계 개별 템플릿 파일

### 4. 이전 경로 참조 정리

평면형 references 파일을 가리키는 이전 경로 참조를 제거합니다.

## 단계 완료 기준

- references 디렉터리 트리를 만들었음
- 기존 라이브 방송 템플릿을 `ui-mockups/`로 이동했음
- `SKILL.md` 인덱스를 동기화했음

---

# 15. 2단계: 템플릿 방법론 업그레이드

## 목표

`prompt-writing.md`를 이후 모든 템플릿의 전체 규범으로 발전시킵니다.

## 작업 단계

### 1. 디렉터리 규칙 보완

references가 반드시 디렉터리 트리여야 한다고 명시합니다.

### 2. 개별 템플릿 파일 규격 보완

템플릿 파일에 반드시 어떤 섹션이 들어가야 하는지 명시합니다.

### 3. JSON 필드 설계 표준 보완

다음을 포함합니다.

- 공통 필드
- 분류별 필드
- 필드별 역할

### 4. 매개변수 분류 규칙 보완

다음을 포함합니다.

- 핵심 매개변수
- 기본값을 지정할 수 있는 매개변수
- 무작위로 정할 수 있는 매개변수

### 5. 질문 및 자동 완성 전략 보완

다음을 포함합니다.

- 질문 우선순위
- 자동 완성이 허용되는 시점
- 불필요한 질문을 피하는 방법

### 6. 사례 도출 절차 보완

참고 사례에서 JSON 템플릿을 만들기까지의 전체 단계입니다.

## 단계 완료 기준

- `prompt-writing.md`를 단독으로 "템플릿 설계 전체 규범"으로 사용할 수 있음

---

# 16. 다음 단계 예고(주요 작업만 표시)

## 3단계: `ui-mockups/` 구축

우선 작성 파일:

- `live-commerce-ui.md`
- `social-interface-mockup.md`
- `product-card-overlay.md`

## 4단계: `product-visuals/` 구축

우선 작성 파일:

- `exploded-view-poster.md`
- `white-background-product.md`
- `premium-studio-product.md`

## 5단계: `maps-and-infographics/` 구축

우선 작성 파일:

- `food-map.md`
- `travel-route-map.md`
- `illustrated-city-map.md`

## 6단계: `slides-and-visual-docs/` 구축

우선 작성 파일:

- `dense-explainer-slides.md`
- `policy-style-slide.md`
- `visual-report-page.md`

## 7단계: 자주 사용하는 시각 분류 확장

- poster-and-campaigns
- portraits-and-characters
- scenes-and-illustrations
- editing-workflows

## 8단계: 고급 분류 확장

- branding-and-packaging
- typography-and-text-layout
- storyboards-and-sequences
- assets-and-props

---

# 17. 최근 실행 순서 권장 사항

현재 상황을 기준으로 다음 순서에 따라 진행하는 것을 권장합니다.

1. 1단계 완료: references를 디렉터리 트리로 재구성
2. 2단계 완료: `prompt-writing.md` 업그레이드
3. 3단계 완료: `ui-mockups/` 구축
4. 4단계 완료: `product-visuals/` 구축
5. 5단계 완료: `maps-and-infographics/` 구축
6. 6단계 완료: `slides-and-visual-docs/` 구축
7. 이후 다른 분류 확장 진행

---

# 18. 결론

이후 이 스킬은 "사례를 계속 추가하는" 방식으로 커지면 안 됩니다. 다음 순서로 발전해야 합니다.

- 먼저 디렉터리 트리를 정함
- 다음으로 템플릿 규격을 정함
- 그다음 개별 템플릿 파일을 작성함
- 매개변수와 질문 전략을 보완함
- 마지막으로 사례를 지속적으로 확장함

이렇게 해야 이후 안정적인 로드맵에 따라 스킬을 계속 개선할 수 있으며 매번 구조를 다시 결정하지 않아도 됩니다.
