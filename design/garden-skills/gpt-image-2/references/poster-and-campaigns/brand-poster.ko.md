# 브랜드 메인 포스터 템플릿

이 문서는 "브랜드의 특정 시점 메시지를 대표하는 포스터 한 장"을 만들 때 사용합니다.

- 신제품 출시 메인 포스터
- 분기별 캠페인 대표 이미지
- 브랜드 리뉴얼 대표 이미지
- 명절 행사 메인 포스터
- 회사 창립 1주년 대표 이미지

특징:

- 강한 슬로건 한 문장
- 명확한 시각적 중심
- 브랜드 색상을 엄격하게 통일
- 가로 / 세로 / 정사각형 등 여러 버전으로 활용 가능

## 적용 범위

- 단일 브랜드 메인 포스터
- 대형 캠페인 대표 이미지
- 명절 / 기념일 / 주요 시점 메인 이미지

## 사용 시점

- 사용자가 "브랜드 포스터 / 메인 비주얼 / KV / 행사 대표 이미지 / 슬로건 포스터"를 언급할 때
- 브랜드를 대표하는 이미지 한 장을 원할 때

다음에는 사용하지 마세요.

- 시리즈 대표 이미지(`campaign-kv.md` 사용)
- 웹 배너(`banner-hero.md` 사용)
- 잡지 표지(`editorial-cover.md` 사용)

## 누락 정보 확인 우선순위

1. 브랜드 이름 + 업종
2. 주제 / 슬로건
3. 시각적 분위기: 미래적 / 레트로 / 미니멀 / 중국풍 / 스트리트
4. 인물 / 제품 / 장면이 필요한지 여부
5. 비율: 세로 / 가로 / 정사각형
6. 색상 팔레트

## 기본 템플릿: 단일 브랜드 메인 포스터

📖 설명

포스터 한 장 전체에 중앙 또는 크게 배치한 대표 이미지가 있고 슬로건을 명확히 표시합니다. 모서리에 브랜드 로고를 두며 소셜 미디어에서 공유할 대표 이미지로 적합합니다.

📝 프롬프트

```json
{
  "type": "브랜드 메인 포스터",
  "goal": "제품 발표회 대표 이미지, 행사 메인 비주얼, 소셜 미디어 대표 이미지로 바로 사용할 수 있는 브랜드 포스터 생성",
  "brand": {
    "name": "{argument name=\"brand name\" default=\"AURORA\"}",
    "industry": "{argument name=\"industry\" default=\"소비자 전자제품\"}"
  },
  "visual_tone": {
    "aesthetic": "{argument name=\"aesthetic\" default=\"미니멀한 미래적 스타일\"}",
    "color_palette": "{argument name=\"color palette\" default=\"짙은 파랑 + 은백색 + 바이올렛 하이라이트\"}",
    "lighting": "{argument name=\"lighting\" default=\"차가운 가장자리 빛 + 중앙의 부드러운 빛\"}"
  },
  "centerpiece": {
    "type": "{argument name=\"centerpiece type\" default=\"제품\"}",
    "description": "{argument name=\"centerpiece description\" default=\"화면 중앙에 떠 있는 신세대 플래그십 이어폰, 화면의 1/3 지점에 은은한 빛\"}",
    "scale": "{argument name=\"scale\" default=\"화면의 50% 차지\"}"
  },
  "slogan": {
    "main": "{argument name=\"main slogan\" default=\"들리지 않던 모든 것을 듣다\"}",
    "sub": "{argument name=\"sub slogan\" default=\"AURORA Pro · 완전히 새로워진 노이즈 캔슬링\"}"
  },
  "logo_placement": {
    "position": "{argument name=\"logo position\" default=\"오른쪽 아래 모서리\"}",
    "size": "적당한 크기로 표시하고 대표 이미지보다 눈에 띄지 않게 함"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4 세로형\"}",
  "constraints": {
    "must_keep": [
      "대표 이미지가 시각적 기준점 역할",
      "슬로건은 12자 이하",
      "브랜드 로고가 반드시 표시되고 읽을 수 있어야 함",
      "색상 팔레트를 엄격하게 통일"
    ],
    "avoid": [
      "정보 밀도가 지나치게 높음",
      "추가 브랜드 요소가 들어감",
      "글꼴 종류가 2개 초과",
      "배경 색상이 대표 이미지와 섞여 구별되지 않음"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 브랜드, 슬로건, 대표 이미지 유형, 비율
- 기본값 지정 가능: 색상 팔레트, 조명, 로고 위치
- 무작위 지정 가능: 배경 질감의 세부 사항

### 자동 완성 전략

- 사용자가 브랜드 + 업종을 제시하면 어울리는 분위기를 자동 선택합니다(소비자 전자제품 = 미래적, 중국풍 = 따뜻한 색, 소매 = 따뜻한 회색).
- 슬로건 기본 길이는 8~12자입니다.
- 로고는 기본적으로 오른쪽 아래에 둡니다.

## 변형 1: 인물 + 제품 두 주인공 포스터

📝 프롬프트

```json
{
  "type": "인물 + 제품 두 주인공 포스터",
  "centerpiece": {
    "type": "인물 + 제품",
    "human": "{argument name=\"human\" default=\"자연스럽게 미소 짓는 동아시아 젊은 여성\"}",
    "product": "{argument name=\"product\" default=\"흰색 에센스 용기\"}",
    "composition": "인물은 오른쪽, 제품은 왼쪽 1/3 지점에 배치"
  },
  "constraints": {
    "must_feel": "신뢰와 품질, 명확한 브랜드 인물상"
  }
}
```

## 변형 2: 순수 텍스트 메인 포스터

📝 프롬프트

```json
{
  "type": "순수 텍스트 브랜드 메인 포스터",
  "slogan": {
    "main": "{argument name=\"slogan\" default=\"우리는 이기고 싶지만, 동료도 함께 데려가겠습니다\"}"
  },
  "visual_tone": {
    "aesthetic": "미니멀하고 넓은 여백, 글꼴 자체가 시각 요소"
  },
  "constraints": {
    "must_feel": "태도, 가치관, 신념"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "브랜드 메인 포스터 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 브랜드와 주요 시점을 알려 주면 분위기, 색상, 슬로건, 대표 이미지를 자동 선택",
  "constraints": {
    "must_feel": "바로 공개하고 홍보할 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 슬로건이 12자를 넘지 않게 합니다.
- 로고가 대표 이미지보다 눈에 띄지 않게 합니다.
- 포스터 한 장에 제품을 여러 개 넣지 않습니다.
- 글꼴을 세 종류 이상 사용하지 않습니다.
- 배경에 알아볼 수 있는 제3자 브랜드가 나타나지 않게 합니다.
