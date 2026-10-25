# 제품 분해도 포스터 템플릿

이 문서는 "완성된 제품을 세로로 층층이 분해해 내부 구성품 + 콜아웃 주석 + 상단 홍보 문구 + 하단 브랜드 영역"으로 보여 주는 고급 제품 포스터를 만들 때 사용합니다.

대표적인 예:

- VR 헤드셋 분해도
- 스마트폰 내부 구조 분해도
- 스마트 스피커 분해도
- 무선 이어폰 분해도
- 고급 가전 분해도
- 카메라 / 렌즈 구성품 분해도
- 아웃도어 장비 분해도

## 적용 범위

- 고급 제품 출시 대표 이미지
- 상세 페이지의 단일 "기술 특징" 이미지
- 엔지니어링 미학 소개
- 내부 구조 교육 이미지
- 미디어용 기술 포스터

## 사용 시점

- 사용자가 "분해도 / 내부 구조 / exploded view"를 언급할 때
- 제품의 엔지니어링 구조 / 모듈형 설계 / 기술 세부 사항을 보여 주고 싶을 때
- "하드코어한 엔지니어링 느낌 + 상업 포스터" 스타일을 원할 때

다음에는 사용하지 마세요.

- 흰 배경 제품 사진만 필요(`white-background-product.md` 사용)
- 장면 속 제품 사진이 필요(`lifestyle-product-scene.md` 사용)
- 포장 전시가 필요(`packaging-showcase.md` 사용)

## 누락 정보 확인 우선순위

1. 제품 종류(구체적인 모델 또는 카테고리)
2. 강조할 구성품 수(보통 6~9개)
3. 브랜드 이름 / 메인 슬로건 / 부제
4. 색상 방향(부드러운 그라데이션 / 순수한 검정 / 오로라 / 딥 스페이스)
5. 콜아웃을 두 언어(중국어 + 영어)로 표시할지 여부
6. 라벨 배치: 양쪽 분산 / 위아래 배치 / 한쪽에만 배치

## 기본 템플릿: 세로 분해도 + 양쪽 콜아웃

📖 설명

이미지 중앙에는 본체를 여러 층으로 세로 분해해 배치하고, 양쪽에 콜아웃 라벨을 둡니다. 상단에는 제품 이름 + 메인 슬로건, 하단에는 마무리 문구 + 브랜드 로고를 넣습니다.

📝 프롬프트

```json
{
  "type": "제품 분해도 포스터",
  "goal": "고급 기술 / 엔지니어링 미학의 제품 포스터를 생성합니다. 제품의 세로 분해도를 중심에 두고 양옆에 기술 콜아웃을 배치해 출시 행사 대표 이미지 또는 상세 페이지 기술 소개로 사용할 수 있습니다.",
  "subject": "{argument name=\"product\" default=\"VR 헤드셋\"}",
  "style": {
    "rendering": "{argument name=\"render style\" default=\"깔끔한 하이테크 3D 렌더링, 스튜디오 조명, 발광 장식\"}",
    "background_color": "{argument name=\"background color\" default=\"부드러운 보라색에서 파란색으로 이어지는 그라데이션\"}",
    "lighting": "{argument name=\"lighting\" default=\"스튜디오 상단광 + 약한 윤곽광, 구성품 사이에 은은한 빛의 분위기\"}"
  },
  "header": {
    "logo": "{argument name=\"product brand mark\" default=\"∞ Meta Quest 3\"}",
    "subtitle": "{argument name=\"main catchphrase\" default=\"새로운 구조로 새로운 현실을 다시 만듭니다.\"}"
  },
  "layout": {
    "centerpiece": "{argument name=\"centerpiece description\" default=\"VR 헤드셋을 아래에서 위로 9개 내부 구성품 층으로 세로 분해: 외장, 카메라 센서, 칩이 있는 메인보드, Pancake 렌즈, 내부 프레임, 배터리 팩, 측면 밴드, 상단 머리 밴드, 얼굴 접촉 쿠션\"}",
    "callout_layout": "{argument name=\"callout layout\" default=\"양쪽에 고르게 분포\"}",
    "callout_labels": {
      "count": "{argument name=\"callout count\" default=\"8\"}",
      "left_side": [
        "{argument name=\"left callout 1\" default=\"Snapdragon® XR2 Gen 2\\n뛰어난 처리 성능으로 실시간 몰입 경험 제공\"}",
        "{argument name=\"left callout 2\" default=\"조절 가능한 IPD 장치\\n다양한 사용자가 편안하게 착용하도록 설계\"}",
        "{argument name=\"left callout 3\" default=\"정밀 설계 머리 밴드\\n편안함과 안정성을 추구한 엔지니어링 디자인\"}"
      ],
      "right_side": [
        "{argument name=\"right callout 1\" default=\"전면 패널\\n정교한 디자인과 최적화된 무게 균형\"}",
        "{argument name=\"right callout 2\" default=\"트래킹 카메라\\n정밀한 위치 추적과 환경 인식 구현\"}",
        "{argument name=\"right callout 3\" default=\"Pancake 렌즈\\n얇고 가벼운 설계로 넓은 시야와 선명한 화질 제공\"}",
        "{argument name=\"right callout 4\" default=\"고성능 배터리\\n최적화된 전력 설계로 긴 사용 시간 지원\"}",
        "{argument name=\"right callout 5\" default=\"부드러운 얼굴 쿠션\\n오래 착용해도 편안함 유지\"}"
      ]
    },
    "footer": {
      "left_text_block": {
        "headline": "{argument name=\"bottom headline\" default=\"경험은 구조의 진화에서 시작됩니다.\"}",
        "body": "{argument name=\"bottom body\" default=\"모든 부품에는 몰입 경험을 뒷받침하는 첨단 기술과 장인 정신이 담겨 있습니다. Meta Quest 3는 내부에서부터 미래를 설계해 상상을 뛰어넘는 경험을 제공합니다.\"}"
      },
      "right_logo": "{argument name=\"footer brand logo\" default=\"∞ Meta\"}"
    }
  },
  "constraints": {
    "must_keep": [
      "구성품 층이 분명하고 층 사이에 충분한 간격 유지",
      "콜아웃 연결선이 올바른 구성품을 가리킴",
      "상단 로고와 하단 브랜드 영역이 구성품과 겹치지 않음",
      "전체적으로 고급 출시 행사 포스터처럼 보임"
    ],
    "avoid": [
      "구성품을 너무 빽빽하게 펼쳐 알아보기 어려움",
      "콜아웃 문구가 너무 길어 줄바꿈이 어수선함",
      "조명 방향이 통일되지 않음",
      "구성품끼리 서로 관통하거나 겹침"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 제품, 구성품 수, 메인 슬로건
- 기본값 지정 가능: 배경색, 조명, 콜아웃 기본 문구
- 무작위 지정 가능: 보조 기술 설명의 표현, 하단 문단 문구

### 자동 완성 전략

사용자가 "제품명"만 제공하면:

- 일반적인 구성품 6~9개를 자동으로 추론합니다.
- 콜아웃 문구는 "기술 이름 + 한 문장 가치 설명" 형식으로 작성합니다.
- 메인 슬로건은 "…로 새롭게 만들다" 또는 "구조의 진화에서 비롯되다"처럼 마무리되는 느낌으로 구성합니다.
- 하단 브랜드 영역은 기본적으로 상단 로고와 일치시킵니다.

## 변형 1: 휴대전화 / 태블릿 분해도

📝 프롬프트

```json
{
  "type": "스마트 기기 분해도 포스터",
  "subject": "{argument name=\"product\" default=\"플래그십 스마트폰\"}",
  "style": {
    "rendering": "딥 스페이스 검정 배경 + 미니멀한 금속 반사",
    "background_color": "{argument name=\"background color\" default=\"거의 검정에 가까운 스페이스 그레이\"}"
  },
  "header": {
    "logo": "{argument name=\"product mark\" default=\"NEX Pro\"}",
    "subtitle": "{argument name=\"catchphrase\" default=\"모든 층을 보고, 모든 부분을 이해하다\"}"
  },
  "layout": {
    "centerpiece": "스마트폰 내부를 아래에서 위로 8개 층으로 세로 분해: 금속 미드 프레임, SoC 포함 메인보드, 화면 부품, 카메라 모듈, 진동 모터, 배터리, 스피커, 유리 뒷면",
    "callout_labels": {
      "count": 8,
      "items_template": "구성품 이름 + 한 문장 기술 장점"
    }
  },
  "constraints": {
    "must_feel": "엔지니어링 미학 + 플래그십 출시 분위기"
  }
}
```

## 변형 2: 웨어러블 / 오디오 제품 분해도

📝 프롬프트

```json
{
  "type": "웨어러블 제품 분해도 포스터",
  "subject": "{argument name=\"product\" default=\"무선 노이즈 캔슬링 헤드폰\"}",
  "style": {
    "rendering": "부드러운 그림자와 부분적인 금속 반사가 있는 미니멀한 흰 배경",
    "background_color": "{argument name=\"background color\" default=\"미색 그라데이션\"}"
  },
  "header": {
    "logo": "{argument name=\"product mark\" default=\"AURA Pro\"}",
    "subtitle": "{argument name=\"catchphrase\" default=\"안팎으로 찾아오는 고요\"}"
  },
  "layout": {
    "centerpiece": "헤드폰 이어컵 측면을 6개 층으로 분해: 외장, 마이크 배열, 노이즈 캔슬링 칩 보드, 드라이버 유닛, 음향 폼, 메모리폼 이어패드",
    "callout_labels": {
      "count": 6
    }
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "분해도 포스터 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 제품 이름을 주면 층 수(6~9), 콜아웃 수, 메인 슬로건, 하단 문단, 브랜드 로고를 자동 결정하되 구성품이 선명하고 콜아웃이 구성품에 연결되며 상단 주제와 하단 브랜드가 있는 네 가지 핵심 요소를 유지",
  "constraints": {
    "must_feel": "고급 출시 행사 대표 이미지"
  }
}
```

## 피해야 할 사항

- 구성품을 10개 넘게 펼치면 화면이 빽빽해집니다.
- 콜아웃 연결선이 다른 구성품을 가로질러 겹치지 않게 합니다.
- 콜아웃 문구를 마케팅 슬로건으로 쓰지 않습니다. "구성품 + 기술 + 가치"의 세 부분을 담습니다.
- 상단 로고와 하단 브랜드 로고를 서로 다르게 하지 않습니다.
- 배경에 무관한 장식(고리, 무늬, 붓질)을 넣지 않습니다.
- 조명 방향을 반대로 설정하지 않습니다(상단 조명과 반대 그림자는 바로 어색해집니다).
