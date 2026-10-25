# 대형 문구 / 타이틀 세이프 포스터 템플릿

이 문서는 "거대한 텍스트 자체가 대표 이미지"인 포스터를 만들 때 사용합니다.

- 대형 문구 포스터(에너지 넘치는 일본 프로모션)
- 타이포그래피 우선 포스터
- 슬로건 / 핵심 주장형 배너
- 실험적인 타이포그래피 작업
- 글자가 주인공인 영화 포스터 느낌

특징:

- 글자 자체가 주제(매우 큰 글자로 화면의 50% 이상 차지)
- 보통 3~7자 + 작은 글씨 1~2줄
- 디자인이 강한 서체(손글씨 / 레트로 인쇄 / 노이즈 / 그래피티)
- 배경은 절제
- 정보를 한눈에 읽을 수 있어야 함

## 적용 범위

- 슬로건 / 핵심 주장 포스터
- 행사 / 대형 프로모션 대표 비주얼
- 타이포그래피 우선 배너

## 사용 시점

- 사용자가 "큰 글씨 / 핵심 주장 / hero text / type-first / 타이포그래피 포스터"를 언급할 때
- 문장 하나 자체가 메인 이미지이길 원할 때
- 일본풍 / 극단적인 타이포그래피 스타일을 원할 때

다음에는 사용하지 마세요.

- 제품이 포함된 포스터(`poster-and-campaigns/brand-poster.md` 사용)
- 에디토리얼 잡지 표지(`poster-and-campaigns/editorial-cover.md` 사용)
- 복잡한 서사 장면(`scenes-and-illustrations/concept-scene.md` 사용)

## 누락 정보 확인 우선순위

1. 메인 슬로건(3~7자)
2. 부제 / 태그라인
3. 스타일 방향(쇼와 시대 일본풍 / 현대 미니멀 / 레트로 인쇄 / 그래피티 / 노이즈)
4. 주색 1~2개
5. 작은 주석 / 로고가 필요한지 여부
6. 비율

## 기본 템플릿: 일본풍 에너지 넘치는 대형 문구 포스터

📖 설명

이미지 하나를 만들고, 대형 슬로건 글자 자체를 중심으로 부제 + 작은 문구 + 최소한의 그래픽 요소를 사용합니다.

📝 프롬프트

```json
{
  "type": "일본풍 고에너지 대형 문구 포스터",
  "goal": "거대한 글자 자체가 대표 비주얼인 에너지 넘치는 포스터 생성",
  "headline": {
    "text": "{argument name=\"headline\" default=\"전력 질주\"}",
    "language": "{argument name=\"language\" default=\"중국어 / 일본어 혼합\"}",
    "size": "화면의 60% 이상 차지",
    "alignment": "{argument name=\"alignment\" default=\"가운데 정렬\"}",
    "treatment": "{argument name=\"treatment\" default=\"노이즈 + 하프톤 망점 + 어긋난 외곽선 겹침\"}"
  },
  "subheadline": {
    "text": "{argument name=\"subheadline\" default=\"GO ALL OUT 2026\"}",
    "size": "헤드라인 크기의 1/4",
    "position": "{argument name=\"sub position\" default=\"헤드라인 아래 가운데\"}"
  },
  "small_text": {
    "items": [
      "{argument name=\"small text 1\" default=\"4.24-5.24 SPECIAL CAMPAIGN\"}",
      "{argument name=\"small text 2\" default=\"X COLLECTIVE\"}"
    ],
    "position": "하단 모서리"
  },
  "design": {
    "primary_color": "{argument name=\"primary color\" default=\"#FF2C2C 주홍색\"}",
    "background_color": "{argument name=\"background\" default=\"#F4EEDC 미색\"}",
    "decoration": "{argument name=\"decoration\" default=\"단순한 기하학 도형 4~5개(원 / 삼각형 / 짧고 굵은 화살표), 의도적으로 여백을 남김\"}",
    "typography_family": "{argument name=\"font family\" default=\"현대적인 일본풍 산세리프체 + 포인트 손글씨 하나\"}"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "슬로건을 한눈에 읽을 수 있어야 함",
      "글자 자체가 화면의 절대적인 주인공",
      "색상 3가지 이하",
      "서체 계열 2개 이하"
    ],
    "avoid": [
      "장식에 묻혀 슬로건 글자가 너무 작아짐",
      "장식 그래픽 6개 초과",
      "서체 세 종류 초과",
      "오타"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 슬로건, 부제, 스타일, 주색
- 기본값 지정 가능: 레이아웃, 장식, 서체
- 무작위 지정 가능: 장식 도형의 구체적인 모양

### 자동 완성 전략

- 사용자가 슬로건 + 스타일 키워드를 주면 글자 효과 + 색상 팔레트 + 장식을 자동 결정합니다.
- 일본풍 고에너지 포스터는 노이즈 + 하프톤 + 어긋난 테두리를 기본 사용합니다.
- 기본 비율은 3:4입니다.

## 변형 1: 미니멀 스위스 타이포그래피 대형 문구 포스터

📝 프롬프트

```json
{
  "type": "미니멀 스위스 타이포그래피 대형 문구 포스터",
  "headline": {
    "treatment": "장식 없음 + 산세리프체 + 엄격한 그리드"
  },
  "design": {
    "primary_color": "순수한 검정",
    "background_color": "순수한 흰색",
    "decoration": "없음 / 가는 가로선 하나만"
  },
  "constraints": {
    "must_feel": "스위스 그래픽 디자인 / 미니멀"
  }
}
```

## 변형 2: 레트로 인쇄 대형 문구 포스터

📝 프롬프트

```json
{
  "type": "레트로 인쇄 대형 문구 포스터",
  "headline": {
    "treatment": "별색 인쇄가 어긋난 효과 + 잉크 번짐 + 살짝 낡은 질감"
  },
  "design": {
    "primary_color": "레트로 빨강",
    "background_color": "낡은 미색 종이",
    "decoration": "레트로 인쇄 기호"
  },
  "constraints": {
    "must_feel": "1960년대 활판 인쇄"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "대형 문구 포스터 자동 완성",
  "mode": "auto-fill",
  "rule": "사용자가 슬로건 한 줄을 주면 스타일 + 팔레트 + 글자 처리 + 장식을 자동으로 결정",
  "constraints": {
    "must_feel": "인쇄 가능하고 한눈에 읽힘"
  }
}
```

## 피해야 할 사항

- 슬로건 글자가 화면의 40%보다 작아지지 않게 합니다.
- 장식이 주제를 압도하지 않게 합니다.
- 슬로건 오타를 내지 않습니다(가장 심각한 오류).
- 서체 계열을 두 종류 넘게 쓰지 않습니다.
- 배경 채도가 메인 슬로건보다 높지 않게 합니다.
- 작은 글씨를 세 줄 넘게 넣지 않습니다.
