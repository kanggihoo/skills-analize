# 브랜드 아이덴티티 시스템 보드 템플릿

이 파일은 “브랜드 아이덴티티 시스템 전체를 한 장에 보여주는” 비주얼을 위한 템플릿입니다.

- 브랜드 로고 + 글꼴 + 색상 + 적용 사례
- VI 요약 한 페이지
- 브랜드 제안 보드
- 브랜드 가이드 표지
- 디자이너 사례 연구 한 페이지

특징:

- 큰 이미지 한 장을 여러 영역으로 나눔
- 로고 적용 사례 + 색상 팔레트 + 글꼴 규칙 + 실물 목업
- “시스템성 + 전문성” 강조
- 보통 그리드 + 라벨을 포함
- 차분하고 장식을 과하게 쓰지 않음

## 적용 범위

- 브랜드 아이덴티티 시스템 보드 (VI 요약)
- 브랜드 제안 보드
- 디자이너 포트폴리오 단일 페이지

## 사용 시점

- 사용자가 “VI / 브랜드 아이덴티티 / 브랜드 시스템 / brand board / brand guideline cover”를 언급할 때
- 한 장의 이미지로 브랜드 전체 구성을 보여주고 싶어 할 때

사용하지 말 것:

- 마스코트 브랜드 키트 (`mascot-brand-kit.md` 사용)
- 단일 포스터 (`poster-and-campaigns/brand-poster.md` 사용)
- 단일 패키지 목업 (`cosmetic-packaging.md` 사용)

## 정보가 부족할 때 먼저 물어볼 순서

1. 브랜드명 + 한 문장 포지셔닝
2. 업종 / 대상 고객
3. 로고의 주요 형태 (문자 / 그래픽 / 조합)
4. 주조색 1–2개
5. 글꼴 선호 (세리프 / 산세리프 / 손글씨)
6. 패키지 / 명함 / 포스터 목업 필요 여부

## 기본 템플릿: 브랜드 아이덴티티 시스템 보드

📖 설명

큰 이미지 한 장을 로고 영역 + 색상 영역 + 타이포그래피 영역 + 적용 목업 영역으로 나눕니다.

📝 프롬프트

```json
{
  "type": "브랜드 아이덴티티 시스템 보드",
  "goal": "VI 요약 / 브랜드 보드로 사용할 수 있는 브랜드 아이덴티티 시스템 단일 페이지 생성",
  "brand": {
    "name": "{argument name=\"brand name\" default=\"AURORA\"}",
    "tagline": "{argument name=\"tagline\" default=\"빛이 일상을 부드럽게\"}",
    "industry": "{argument name=\"industry\" default=\"홈 조명\"}",
    "personality": "{argument name=\"personality\" default=\"부드럽고 현대적이며 절제됨\"}"
  },
  "regions": {
    "logo": {
      "position": "{argument name=\"logo position\" default=\"왼쪽 위의 넓은 영역\"}",
      "primary_logo": "{argument name=\"primary logo\" default=\"AURORA 워드마크 + 원형 광륜 그래픽\"}",
      "secondary_logos": ["흑백 단색 버전", "그래픽 버전 (문자 없음)", "세로형 버전"],
      "background_test": "어두운 바탕과 밝은 바탕에서 각각 한 번씩 표시"
    },
    "color_palette": {
      "position": "{argument name=\"color position\" default=\"오른쪽 위\"}",
      "primary": [
        "{argument name=\"primary color 1\" default=\"#0F4C81 네이비 블루\"}",
        "{argument name=\"primary color 2\" default=\"#FFD166 따뜻한 금색\"}"
      ],
      "secondary": [
        "{argument name=\"secondary color 1\" default=\"#F4F1EA 미색\"}",
        "{argument name=\"secondary color 2\" default=\"#222 짙은 회색\"}"
      ],
      "swatch_design": "색상 견본 + HEX + 한국어 색상명"
    },
    "typography": {
      "position": "{argument name=\"type position\" default=\"왼쪽 아래\"}",
      "headline_font": "{argument name=\"headline font\" default=\"현대적인 세리프 (예: Playfair Display)\"}",
      "body_font": "{argument name=\"body font\" default=\"한국어 둥근 글꼴 + 영어 산세리프\"}",
      "demo_block": "Aa Bb Cc 1234 + 한국어 한 문장 + 영어 한 문장"
    },
    "applications": {
      "position": "{argument name=\"app position\" default=\"오른쪽 아래\"}",
      "mockups": [
        "{argument name=\"mockup 1\" default=\"명함 앞뒷면\"}",
        "{argument name=\"mockup 2\" default=\"제품 포장 상자\"}",
        "{argument name=\"mockup 3\" default=\"앱 아이콘 + 시작 화면\"}"
      ]
    }
  },
  "style": {
    "art_style": "{argument name=\"art style\" default=\"현대적 미니멀 브랜드 보드, 미색 바탕 + 아주 약한 종이 질감\"}",
    "grid": "가는 회색 보조선"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "4개 영역의 경계가 명확함",
      "로고 영역이 항상 가장 먼저 보임",
      "색상 팔레트는 최대 6색이며 HEX를 읽을 수 있음",
      "적용 목업의 스타일이 일관됨"
    ],
    "avoid": [
      "요소를 지나치게 많이 넣어 각 영역에 여유가 없어지는 것",
      "글꼴 패밀리를 2개 초과해 사용",
      "색상을 6개 초과해 사용",
      "HEX 코드를 빠뜨림"
    ]
  }
}
```

### 매개변수 전략

- 반드시 물을 것: 브랜드명, 업종, 주조색, 포지셔닝
- 기본값 사용 가능: 레이아웃, 글꼴 추천, 적용 목업
- 무작위로 정해도 됨: 목업 속 실물의 세부 사항

### 자동 보완 전략

- 사용자가 브랜드명 + 업종 + 성격 키워드 하나를 알려주면 로고 + 색상 + 글꼴 + 목업 3개를 자동으로 구성
- 기본 스타일은 “현대적 미니멀”
- 기본 세로 비율은 3:4

## 변형 1: 극도로 미니멀한 브랜드 보드 (로고 + 색상만)

📝 프롬프트

```json
{
  "type": "미니멀 브랜드 보드",
  "regions": {
    "logo": {"primary_logo": "워드마크 + 미니멀 그래픽", "background_test": "흰 바탕 + 순수 검정 바탕"},
    "color_palette": {"primary": ["#000", "#FFF", "#FFD166"]},
    "typography": {"demo_block": "Aa Bb"},
    "applications": null
  },
  "constraints": {
    "must_feel": "스위스 그래픽 디자인 / 일본식 미니멀"
  }
}
```

## 변형 2: 정보 밀도가 높은 브랜드 보드 (어조, 아이콘 시스템 포함)

📝 프롬프트

```json
{
  "type": "고밀도 브랜드 보드",
  "regions": {
    "logo": {"primary_logo": "..."},
    "color_palette": {"primary": ["..."], "secondary": ["..."]},
    "typography": {"demo_block": "..."},
    "applications": {"mockups": ["명함", "패키지", "포스터", "앱 아이콘", "웹 히어로"]}
  },
  "extras": {
    "icon_system": "일관된 스타일의 아이콘 12개 그리드",
    "tone_of_voice": "브랜드 어조 예시 3문장"
  },
  "constraints": {
    "must_feel": "인쇄 가능한 완성도 높은 브랜드 북 표지"
  }
}
```

## 변형 3: 자동 보완 모드

📝 프롬프트

```json
{
  "type": "브랜드 보드 자동 보완",
  "mode": "auto-fill",
  "rule": "사용자가 브랜드명 + 업종 + 한 문장의 성격 설명을 알려주면 로고 / 색상 / 글꼴 / 적용 목업을 자동으로 결정",
  "constraints": {
    "must_feel": "고객 제안서의 첫 페이지로 사용할 수 있어야 함"
  }
}
```

## 피할 것

- 로고 영역을 축소해 눈에 띄지 않게 하지 말 것
- 색상을 6개 넘게 사용하지 말 것
- 글꼴 패밀리를 2개 넘게 사용하지 말 것
- 목업을 지나치게 화려하게 만들어 전문성을 해치지 말 것
- HEX 표기를 빠뜨리지 말 것
- 배경에 강한 질감을 넣지 말 것
