# 웹 배너 / 히어로 템플릿

이 문서는 "웹페이지 상단 히어로 영역 / 앱 배너 / 광고 소재" 시각물을 만들 때 사용합니다.

- 웹사이트 첫 화면 히어로
- 랜딩 페이지 배너
- 앱 상단 프로모션 배너
- 이메일 마케팅 배너
- 피드형 광고 소재

특징:

- 가로형 비율(16:9 / 21:9 / 3:1)
- 강한 핵심 주장 한 문장
- CTA 영역 확보
- 안전 여백 확보(핵심 요소가 잘리지 않도록 함)

## 적용 범위

- 웹 히어로
- 랜딩 페이지 히어로
- 앱 배너
- 이메일 배너
- 광고 소재

## 사용 시점

- 사용자가 "배너 / 히어로 / 랜딩 페이지 대표 이미지 / 상단 이미지"를 언급할 때
- 가로 구도 + CTA 영역이 필요할 때

다음에는 사용하지 마세요.

- 세로형 / 정사각형 메인 포스터(`brand-poster.md` 사용)
- 시리즈 KV(`campaign-kv.md` 사용)
- 잡지 표지(`editorial-cover.md` 사용)

## 누락 정보 확인 우선순위

1. 용도(웹 히어로 / 앱 배너 / 이메일)
2. 주제 / 핵심 주장
3. 대표 이미지
4. CTA 문구 + 색상
5. 브랜드 색상
6. 화면 비율

## 기본 템플릿: 웹 히어로 배너

📖 설명

전체를 가로로 구성하고 왼쪽에는 제목 + 부제 + CTA를, 오른쪽에는 대표 이미지를 둡니다. 아래쪽에는 안전 여백을 둡니다.

📝 프롬프트

```json
{
  "type": "웹 히어로 배너",
  "goal": "제품 공식 웹사이트 / 마케팅 랜딩 페이지의 히어로 영역에 바로 사용할 수 있는 가로 배너 생성",
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"16:9\"}",
  "layout": {
    "left_column": {
      "headline": "{argument name=\"headline\" default=\"당신의 업무 리듬을 새롭게 정의하세요\"}",
      "subhead": "{argument name=\"subhead\" default=\"AURORA Pro · AI가 자잘한 일의 80%를 대신 처리합니다\"}",
      "cta": {
        "text": "{argument name=\"cta text\" default=\"무료로 사용해 보기\"}",
        "color": "{argument name=\"cta color\" default=\"브랜드 주색\"}",
        "secondary": "{argument name=\"secondary cta\" default=\"자세히 알아보기\"}"
      }
    },
    "right_column": {
      "centerpiece": "{argument name=\"hero visual\" default=\"제품 스크린샷 + 약한 3D 원근감 + 하이라이트\"}",
      "scale": "{argument name=\"hero scale\" default=\"오른쪽 영역의 80% 차지\"}"
    }
  },
  "background": {
    "type": "{argument name=\"background type\" default=\"밝은 색 그라데이션\"}",
    "decoration": "{argument name=\"decoration\" default=\"미세한 노이즈 + 아주 옅은 기하학적 형태\"}"
  },
  "brand": {
    "logo_position": "왼쪽 위 모서리",
    "navigation_hint": "{argument name=\"nav hint\" default=\"상단 내비게이션은 이미 있으므로 배너 안에 그리지 않음\"}"
  },
  "safe_area": {
    "rule": "아래쪽 10% + 오른쪽 5%를 비워 잘림을 방지",
    "mobile_consideration": "{argument name=\"mobile aware\" default=\"true\"}"
  },
  "constraints": {
    "must_keep": [
      "헤드라인을 가장 큰 글자로 표시",
      "CTA를 명확한 버튼 형태로 만들어 클릭 가능한 느낌을 줌",
      "대표 이미지를 안전 영역 안쪽 오른편에 배치",
      "색상 팔레트를 엄격히 통일"
    ],
    "avoid": [
      "헤드라인과 대표 이미지가 겹침",
      "CTA 색상이 배경과 대비가 낮음",
      "정보 밀도가 지나치게 높음",
      "대표 이미지가 화면 전체를 가로질러 핵심 주장을 위한 공간이 없음"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 헤드라인, CTA, 대표 이미지, 비율
- 기본값 지정 가능: 배경, 부제, 안전 영역
- 무작위 지정 가능: 장식용 기하학 형태

### 자동 완성 전략

- 사용자가 제품명을 주면 헤드라인 한 문장 + 부제 한 문장 + CTA 하나를 자동 작성합니다.
- CTA는 기본적으로 브랜드 주색 버튼 + 회색 보조 버튼으로 구성합니다.
- 업종에 따라 대표 이미지를 자동으로 선택합니다(SaaS = 스크린샷, 소비재 = 제품, 서비스 = 인물).

## 변형 1: 배경 이미지 전체 + 떠 있는 문구

📝 프롬프트

```json
{
  "type": "전체 화면 배경 히어로",
  "background": {
    "type": "전체 이미지 배경",
    "description": "{argument name=\"background image\" default=\"아침 햇살이 드는 책상, 부드러운 조명\"}"
  },
  "layout": {
    "left_column": {
      "headline": "{argument name=\"headline\" default=\"AI가 아침 시간을 30분 돌려드립니다\"}",
      "cta": "지금 체험하기"
    }
  },
  "constraints": {
    "must_feel": "분위기, 생활감, 브랜드 정신"
  }
}
```

## 변형 2: 긴 가로 배너(21:9 / 3:1)

📝 프롬프트

```json
{
  "type": "초광폭 가로 배너",
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"21:9\"}",
  "layout": {
    "left_column": { "headline": "기간 한정 20% 할인 · 7일간" },
    "right_column": { "centerpiece": "카운트다운 숫자 + 작은 상품 이미지" }
  },
  "constraints": {
    "must_feel": "프로모션, 긴박감, 강한 CTA"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "배너 / 히어로 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 제품 + 주제 + 비율을 제시하면 헤드라인 / CTA / 대표 이미지 / 안전 영역을 자동 생성",
  "constraints": {
    "must_feel": "웹 / 앱에 바로 올릴 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 헤드라인과 대표 이미지가 서로 가리지 않게 합니다.
- CTA와 배경의 대비가 4.5:1 미만이 되지 않게 합니다.
- 배너에 본문을 세 줄 넘게 넣지 않습니다.
- 안전 여백을 잊지 않습니다(모바일에서 잘릴 수 있음).
- 배너의 가로 구도를 텍스트 없는 순수 이미지로 만들지 않습니다(핵심 주장이 있어야 함).
