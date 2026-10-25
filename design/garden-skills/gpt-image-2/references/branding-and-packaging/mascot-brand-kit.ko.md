# 마스코트 브랜드 키트 템플릿

이 문서는 "마스코트를 중심에 둔 다중 패널 브랜드 아이덴티티 / 굿즈 시각 문서"를 만들 때 사용합니다.

- 마스코트의 여러 각도 + 표정 + 적용 장면
- 마스코트 굿즈 상품 카탈로그
- 브랜드 IP 전체 소개 페이지
- 카툰 캐릭터 브랜드 아이덴티티 문서

특징:

- 하나의 큰 이미지 안에 여러 구역을 둡니다.
- 주요 구역: 마스코트 삼면도 + 대표 이미지
- 보조 구역: 표정 + 색상 + 굿즈
- "친근함 + 귀여움 + 일관성"을 강조합니다.
- 보통 IP 이름과 성격 설명을 포함합니다.

## 적용 범위

- 마스코트 브랜드 아이덴티티 키트
- IP 굿즈 상품 카탈로그
- 카툰 캐릭터 소개 페이지
- 마케팅 캠페인용 IP 키트

## 사용 시점

- 사용자가 "마스코트 / mascot / IP 캐릭터 / 카툰 홍보 캐릭터"를 언급할 때
- 단일 이미지가 아니라 "완성된 IP 키트"를 원할 때

다음에는 사용하지 마세요.

- 단일 캐릭터 설정 시트( `portraits-and-characters/character-sheet.md` 사용)
- 일반 브랜드 아이덴티티( `brand-identity-board.md` 사용)
- 단일 애니메이션 KV( `storyboards-and-sequences/anime-key-visual.md` 사용)

## 누락 정보 확인 우선순위

1. 브랜드 / IP 이름 + 성격 한 줄 설명
2. 마스코트의 기본 형태(동물 / 사람 / 사물형 / 음식)
3. 색상 1~2개
4. 표정 모음 / 굿즈 / 의상이 필요한지 여부
5. 렌더링 스타일(2D 카툰 / 귀여운 3D / 픽사풍 실사 카툰)
6. 화면 비율

## 기본 템플릿: 마스코트 브랜드 아이덴티티 키트

📖 설명

하나의 큰 이미지 안에 대표 이미지 구역 + 삼면도 구역 + 표정 구역 + 적용 구역을 배치합니다.

📝 프롬프트

```json
{
  "type": "마스코트 브랜드 아이덴티티 키트",
  "goal": "마스코트 브랜드 키트 / 굿즈 소개 페이지로 사용할 수 있는 다중 패널 시각 문서를 생성",
  "ip": {
    "name": "{argument name=\"ip name\" default=\"AURORA 작은 빛\"}",
    "tagline": "{argument name=\"tagline\" default=\"매일 밤 당신과 함께\"}",
    "personality": "{argument name=\"personality\" default=\"다정하고 호기심 많으며 빛나기를 좋아함\"}",
    "brand_owner": "{argument name=\"brand owner\" default=\"AURORA 홈 조명\"}"
  },
  "mascot": {
    "form": "{argument name=\"mascot form\" default=\"반투명하고 동그란 작은 전구 요정, 빛나는 꼬리를 지님\"}",
    "color_palette": "{argument name=\"color palette\" default=\"따뜻한 금색 + 미색 + 연한 파랑\"}",
    "rendering": "{argument name=\"rendering\" default=\"픽사풍 3D + 귀여운 스타일\"}"
  },
  "regions": {
    "hero": {
      "position": "{argument name=\"hero position\" default=\"왼쪽 위 큰 구역\"}",
      "content": "마스코트 대표 이미지 + 이름 + 성격 한 줄 설명",
      "background": "단색 + 은은한 빛 번짐"
    },
    "three_view": {
      "position": "{argument name=\"three view position\" default=\"오른쪽 위\"}",
      "content": "정면 / 측면 / 후면 삼면도",
      "label": "FRONT / SIDE / BACK"
    },
    "expressions": {
      "position": "{argument name=\"expression position\" default=\"왼쪽 아래\"}",
      "count": "{argument name=\"expression count\" default=\"6\"}",
      "items": ["기쁨", "호기심", "졸림", "놀람", "수줍음", "조금 화남"]
    },
    "applications": {
      "position": "{argument name=\"app position\" default=\"오른쪽 아래\"}",
      "items": [
        "{argument name=\"app 1\" default=\"제품 포장 상자 모서리\"}",
        "{argument name=\"app 2\" default=\"앱 시작 화면\"}",
        "{argument name=\"app 3\" default=\"굿즈 스티커\"}",
        "{argument name=\"app 4\" default=\"짧은 동영상 오프닝 마스코트 애니메이션의 정지 화면\"}"
      ]
    }
  },
  "style": {
    "background": "{argument name=\"background\" default=\"베이지색 종이 질감 + 가는 회색 보조선\"}",
    "typography": "둥근 산세리프체 + 손글씨체 한 줄로 강조"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "모든 구역에서 마스코트의 외형을 일관되게 유지",
      "삼면도의 비율을 엄격히 통일",
      "표정을 분명하게 알아볼 수 있도록 표현",
      "브랜드에 어울리는 적용 장면"
    ],
    "avoid": [
      "구역마다 마스코트 화풍이 달라짐",
      "표정이 과장되어 형태가 무너짐",
      "강한 색상 대비로 IP의 분위기를 해침",
      "적용 목업의 스타일이 서로 충돌"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: IP 이름, 형태, 성격, 주색
- 기본값 지정 가능: 레이아웃, 표정, 적용 장면
- 무작위 지정 가능: 굿즈의 세부 요소

### 자동 완성 전략

- 사용자가 "X 업종에 어울리는 귀여운 홍보 캐릭터를 원해요"라고 말하면 형태 + 성격 + 색상 + 표정 6개 + 적용 사례 4개를 자동으로 결정합니다.
- 기본값은 귀여운 3D 렌더링입니다.
- 기본값은 4개 구역 레이아웃입니다.

## 변형 1: 마스코트 굿즈 카탈로그(상품 중심)

📝 프롬프트

```json
{
  "type": "마스코트 굿즈 카탈로그",
  "regions": {
    "hero": {"content": "마스코트 + IP 이름"},
    "three_view": null,
    "expressions": null,
    "applications": {
      "items": [
        "티셔츠", "머그컵", "휴대폰 케이스", "스티커 팩", "열쇠고리", "봉제 인형", "캔버스 가방", "휴대폰 거치대"
      ]
    }
  },
  "constraints": {
    "must_feel": "전자상거래 상품 카탈로그 분위기"
  }
}
```

## 변형 2: 미니멀 마스코트 소개 페이지(대표 이미지 + 성격만)

📝 프롬프트

```json
{
  "type": "미니멀 마스코트 소개 페이지",
  "regions": {
    "hero": {"content": "마스코트 + 이름 + 성격"},
    "three_view": null,
    "expressions": {"count": 4},
    "applications": null
  },
  "constraints": {
    "must_feel": "깔끔하고 읽기 쉬움"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "마스코트 브랜드 키트 자동 완성",
  "mode": "auto-fill",
  "rule": "사용자가 브랜드 + 업종 + 성격 키워드를 주면 마스코트 형태 + 표정 + 적용 사례를 자동으로 결정",
  "constraints": {
    "must_feel": "굿즈 / 홍보 이미지로 바로 공개할 수 있는 완성도"
  }
}
```

## 피해야 할 사항

- 여러 구역에서 마스코트 비율이 달라지지 않게 합니다.
- 표정이 과장되어 다른 캐릭터처럼 보이지 않게 합니다.
- 적용 목업에 다른 디자인 요소를 너무 많이 추가하지 않습니다.
- 주색을 4가지 넘게 사용하지 않습니다.
- IP 이름과 성격 설명을 빠뜨리지 않습니다.
