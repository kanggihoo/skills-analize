# 창업자 / 미디어 화보 인물 사진 템플릿

이 문서는 "창업자 / 임원 / 업계 인물" 수준의 미디어 화보 사진을 만들 때 사용합니다.

- 경제 잡지 인터뷰 이미지
- 스타트업 미디어 표지
- 창업자 대표 이미지(투자 유치 / 상장 소식)
- 업계 인물 클로즈업
- 퍼스널 브랜드 화보

특징:

- 드라마틱한 조명
- 강한 "인물의 분위기"
- 높은 대비 / 강한 서사
- 보통 세로 3:4 / 4:5
- 제목이나 인용문을 넣을 공간을 확보

## 적용 범위

- 경제 / 스타트업 잡지 인터뷰
- 회사 공식 웹사이트의 창업자 화보
- 업계 인물 클로즈업
- 퍼스널 브랜드 대표 이미지

## 사용 시점

- 사용자가 "창업자 화보 / 잡지 인터뷰 / 임원 사진 / 미디어 화보 / 인물 분위기 사진"을 언급할 때
- 서사가 강하고 "인물 자체가 이야기"인 시각물을 원할 때

다음에는 사용하지 마세요.

- 일반적인 비즈니스 프로필 사진(`professional-portrait.md` 사용)
- 버추얼 호스트(`virtual-host.md` 사용)
- 캐릭터 설정(`character-sheet.md` 사용)

## 누락 정보 확인 우선순위

1. 인물의 정체성 / 업종
2. 성별 / 나이
3. 스타일: 흑백 문학풍 / 인더스트리얼 / 혁신적 / 고전 금융풍
4. 구도: 환경 인물 사진 / 클로즈업 / 상반신
5. 색상 / 조명의 방향
6. 제목 공간이 필요한지 여부

## 기본 템플릿: 미디어 화보 창업자 초상화

📖 설명

전체적으로 세로 인물 사진을 사용합니다. 인물은 상반신 또는 환경 인물 사진으로 표현하고 드라마틱한 측면광과 강한 서사를 적용하며 제목을 넣을 공간을 확보합니다.

📝 프롬프트

```json
{
  "type": "미디어 화보 수준의 창업자 초상화",
  "goal": "경제 잡지 / 스타트업 미디어 인터뷰 이미지 / 회사 공식 웹사이트 창업자 대표 이미지로 바로 사용할 수 있는 미디어 화보 초상 사진 생성",
  "subject": {
    "identity": "{argument name=\"identity\" default=\"AI 회사 창업자 CEO\"}",
    "gender": "{argument name=\"gender\" default=\"동아시아 남성\"}",
    "age_range": "{argument name=\"age range\" default=\"35~45세\"}",
    "appearance": "{argument name=\"appearance\" default=\"정돈된 머리, 차분한 표정\"}",
    "outfit": "{argument name=\"outfit\" default=\"짙은 색 터틀넥 니트 + 롱 코트\"}"
  },
  "composition": {
    "shot": "{argument name=\"shot\" default=\"환경 인물 사진 + 상반신\"}",
    "framing": "{argument name=\"framing\" default=\"인물을 화면의 1/3 지점에 배치하고 배경을 위해 2/3 공간 확보\"}",
    "title_safe_area": "{argument name=\"title safe area\" default=\"화면 오른쪽 위에 제목 공간 확보\"}"
  },
  "environment": {
    "location": "{argument name=\"location\" default=\"현대적 사무 공간, 통창 + 미니멀 가구\"}",
    "depth": "{argument name=\"depth\" default=\"얕은 피사계 심도, 배경 흐림\"}"
  },
  "lighting": {
    "style": "{argument name=\"lighting style\" default=\"드라마틱한 측면광\"}",
    "key_light": "{argument name=\"key light\" default=\"넓은 창으로 들어오는 자연광\"}",
    "fill_light": "{argument name=\"fill light\" default=\"어두운 부분의 세부 묘사 유지\"}",
    "color_temp": "{argument name=\"color temp\" default=\"약간 차가운 색온도\"}"
  },
  "expression": {
    "mood": "{argument name=\"mood\" default=\"차분하고 생각에 잠긴 분위기\"}",
    "gaze": "{argument name=\"gaze\" default=\"카메라에서 살짝 벗어나 먼 곳을 응시\"}"
  },
  "style": {
    "rendering": "고해상도 인물 사진 + 잡지 화보 후반 보정",
    "tone": "살짝 어두운 톤 + 높은 대비 + 약간의 입자감",
    "color_palette": "{argument name=\"color palette\" default=\"쿨 그레이 + 먹색 + 따뜻한 피부색\"}"
  },
  "constraints": {
    "must_keep": [
      "인물의 표정에 서사적 느낌이 있음",
      "조명 방향을 통일",
      "구도에 제목 공간을 확보",
      "전체적으로 절제되고 오락적으로 가볍지 않은 분위기"
    ],
    "avoid": [
      "로고와 브랜드 요소가 등장함",
      "지나치게 과장된 극적인 조명",
      "채도가 높은 필터",
      "환경이 주인공을 압도함"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 정체성, 성별, 나이, 환경
- 기본값 지정 가능: 색조, 조명, 구도
- 무작위 지정 가능: 환경의 가구 세부 사항

### 자동 완성 전략

- 업종에 따라 환경을 자동 선택합니다(금융 = 대리석 홀; 기술 = 미니멀 사무실; 제조업 = 공장 작업장; 창작 = 스튜디오).
- 기본 조명은 창문 자연광 + 드라마틱한 측면광입니다.
- 제목 공간은 기본적으로 오른쪽 위에 확보합니다.

## 변형 1: 흑백 문학풍 창업자 초상화

📝 프롬프트

```json
{
  "type": "흑백 문학풍 창업자 초상화",
  "style": {
    "rendering": "높은 대비의 흑백 + 입자감",
    "color_palette": "순수한 흑백"
  },
  "lighting": {
    "style": "강한 조명 + 짙은 그림자"
  },
  "constraints": {
    "must_feel": "시간의 흐름, 서사성, 문학성"
  }
}
```

## 변형 2: 인더스트리얼 / 공장 배경 창업자

📝 프롬프트

```json
{
  "type": "인더스트리얼 배경 창업자 초상화",
  "environment": {
    "location": "{argument name=\"factory\" default=\"생산 라인 뒤편, 흐릿하게 보이는 로봇 팔\"}"
  },
  "lighting": {
    "style": "차가운 산업용 조명 + 국소적인 따뜻한 빛"
  },
  "constraints": {
    "must_feel": "강인하고 제조업 느낌이 나며 믿을 수 있는 분위기"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "창업자 화보 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 업종 + 이름 / 성별을 알려 주면 환경, 스타일, 조명을 자동으로 결정",
  "constraints": {
    "must_feel": "경제 잡지 표지로 사용할 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 인물을 정면 중앙에 세우지 않습니다(미디어 화보에는 딱딱한 구도가 어울리지 않음).
- 배경에 실제 브랜드 로고가 나오지 않게 합니다.
- 과도하게 보정하지 않습니다(피부 질감을 유지해야 함).
- 조명이 지나치게 극적이어서 "진한 화장"처럼 보이지 않게 합니다.
- 제목을 넣을 여백을 빼먹지 않습니다.
