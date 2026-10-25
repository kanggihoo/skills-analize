# 이중 언어 / 다국어 레이아웃 시각물 템플릿

이 문서는 "중국어·영어 / 중국어·일본어처럼 두 언어를 나란히 배치하는" 레이아웃 시각물을 만들 때 사용합니다.

- 중영문 병기 포스터
- 중일문 병기 정보 이미지
- 이중 언어 전시 / 문화 행사 자료
- 다문화 브랜드 대표 이미지
- 학술 / 문화 기관 출판물 표지

특징:

- 두 언어를 병치합니다(단순 번역이 아니라 디자인 언어로 처리).
- 보통 한 언어를 주 언어, 다른 하나를 보조 / 주석 언어로 사용합니다.
- 글꼴을 엄격히 구분합니다(중국어는 중국어 글꼴 / 영어는 영문 글꼴).
- 글자 크기 위계가 명확합니다.
- 여백과 정렬을 중요하게 다룹니다.

## 적용 범위

- 중영문 / 중일문 포스터
- 다문화 브랜드 자료
- 학술 / 문화 전시 대표 이미지

## 사용 시점

- 사용자가 "중영문 / 중일문 / 이중 언어 / bilingual"을 언급할 때
- 문화적 / 학술적 / 고급스러운 분위기의 이중 언어 시각물을 원할 때

다음에는 사용하지 마세요.

- 단일 언어 큰 글자 포스터(`title-safe-poster.md` 사용)
- 순수 제품 포스터(`poster-and-packaging/brand-poster.md` 사용)
- 잡지 표지(`poster-and-campaigns/editorial-cover.md` 사용)

## 누락 정보 확인 우선순위

1. 주 언어 + 보조 언어
2. 메인 슬로건 + 부제(두 언어 문구를 각각 지정)
3. 주제 / 업종
4. 글꼴 스타일(세리프 / 산세리프 / 중국어 세리프 / 둥근 글꼴)
5. 주색 1~2개
6. 비율

## 기본 템플릿: 중영문 문화 포스터

📖 설명

이미지 한 장에서 중국어를 주 언어, 영어를 보조 언어로 사용하고 엄격한 레이아웃 시스템으로 위계를 만듭니다.

📝 프롬프트

```json
{
  "type": "중영문 문화 포스터",
  "goal": "문화 행사 / 전시 / 브랜드 대표 이미지로 사용할 수 있는 디자인 감각의 중영문 포스터 생성",
  "languages": {
    "primary": "{argument name=\"primary language\" default=\"중국어\"}",
    "secondary": "{argument name=\"secondary language\" default=\"영어\"}"
  },
  "title_block": {
    "main_zh": "{argument name=\"main title zh\" default=\"동양, 새롭게 쓰이다\"}",
    "main_en": "{argument name=\"main title en\" default=\"THE ORIENT REIMAGINED\"}",
    "subtitle_zh": "{argument name=\"subtitle zh\" default=\"현대 동양 미학 전시\"}",
    "subtitle_en": "{argument name=\"subtitle en\" default=\"A Contemporary Eastern Aesthetic Exhibition\"}",
    "alignment": "{argument name=\"title alignment\" default=\"왼쪽 위 정렬\"}",
    "hierarchy_rule": "중국어 메인 제목이 가장 큼 → 영어 제목은 중간 크기 → 중국어 부제 → 영어 부제"
  },
  "meta": {
    "date": "{argument name=\"date\" default=\"2026.5.1 - 2026.5.31\"}",
    "venue": "{argument name=\"venue\" default=\"X 미술관 · 상하이\"}",
    "presenter": "{argument name=\"presenter\" default=\"X CULTURAL FOUNDATION\"}"
  },
  "main_visual": {
    "description": "{argument name=\"main visual\" default=\"동양 산수 + 현대적 기하 분할\"}",
    "position": "{argument name=\"main visual position\" default=\"오른쪽 아래의 큰 영역\"}"
  },
  "design": {
    "primary_color": "{argument name=\"primary color\" default=\"#A52A2A 주사색\"}",
    "background_color": "{argument name=\"background\" default=\"#F4EEDC 오래된 종이 베이지\"}",
    "zh_font": "{argument name=\"zh font\" default=\"중국어 세리프 / 해서체 / 현대 세리프\"}",
    "en_font": "{argument name=\"en font\" default=\"현대 세리프(Playfair / Cormorant)\"}",
    "grid": "{argument name=\"grid\" default=\"엄격한 12열 그리드 + 가는 보조선(최종 출력에서는 숨김)\"}"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "중국어와 영어 글꼴을 명확히 구분",
      "위계가 명확함: 제목 > 부제 > 메타 정보",
      "여백을 넉넉히 확보",
      "색상 팔레트는 3가지 이하"
    ],
    "avoid": [
      "중국어와 영어에 같은 글꼴 사용(가장 흔한 오류)",
      "번역 오류(두 언어의 의미가 동등해야 하며 오역 금지)",
      "중국어와 영어의 크기 차이가 지나치게 크거나 작음",
      "요소를 너무 많이 욱여넣음"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 메인 슬로건의 중영문, 부제
- 기본값 지정 가능: 레이아웃, 글꼴, 색상 팔레트, 그리드
- 무작위 지정 가능: 대표 이미지의 세부 요소

### 자동 완성 전략

- 사용자가 중국어 메인 슬로건을 주면 영어 번역 + 부제 + 메타 정보를 자동 생성합니다.
- 기본 글꼴 조합은 중국어 세리프 + 영어 세리프입니다.
- 기본 비율은 3:4입니다.

## 변형 1: 중일문 디자인

📝 프롬프트

```json
{
  "type": "중일문 대조 디자인",
  "languages": {
    "primary": "일본어",
    "secondary": "중국어"
  },
  "title_block": {
    "main_zh": "{argument name=\"zh\" default=\"교토를 거닐다\"}",
    "main_en": "{argument name=\"jp\" default=\"京を歩く\"}"
  },
  "design": {
    "zh_font": "고딕체 / Source Han Serif",
    "en_font": "히라기노 명조 / Source Han Mincho(일본어 글꼴)"
  },
  "constraints": {
    "must_feel": "일본 잡지 같은 분위기"
  }
}
```

## 변형 2: 과학 정보 / 학술 스타일 이중 언어

📝 프롬프트

```json
{
  "type": "과학 정보 / 학술 스타일 이중 언어 포스터",
  "title_block": {
    "main_zh": "{argument name=\"main zh\" default=\"광합성\"}",
    "main_en": "{argument name=\"main en\" default=\"PHOTOSYNTHESIS\"}"
  },
  "main_visual": {
    "description": "설명 도식 + 주석선"
  },
  "design": {
    "primary_color": "학술적인 먹색 초록",
    "background_color": "흰색"
  },
  "constraints": {
    "must_feel": "교과서 삽화와 현대 디자인의 조화"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "이중 언어 레이아웃 자동 완성",
  "mode": "auto-fill",
  "rule": "사용자가 한 언어의 메인 슬로건을 주면 다른 언어 + 부제 + 메타 정보 + 디자인을 자동 생성",
  "constraints": {
    "must_feel": "미술관에 바로 게시할 수 있는 완성도"
  }
}
```

## 피해야 할 사항

- 중국어와 영어에 같은 글꼴을 사용하지 않습니다.
- 중영문 번역의 의미가 어긋나거나 오역되지 않게 합니다.
- 중국어와 영어를 같은 글자 크기로 쓰지 않습니다(주 / 보조 위계가 필요).
- 두 언어로 화면을 가득 채우지 않습니다(여백 확보).
- 글꼴 계열을 두 종류 넘게 혼합하지 않습니다(중국어 1 + 영어 1 권장).
- 영어에 중국어 세리프체나 일본어 글꼴을 사용하지 않습니다(글꼴 매칭이 어색함).
