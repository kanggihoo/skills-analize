# 전문직 인물 사진 템플릿

이 문서는 "전문가 / 비즈니스 / LinkedIn 수준"의 인물 사진을 만들 때 사용합니다.

- 전문직 프로필 사진
- LinkedIn 대표 이미지
- 회사 웹사이트 팀 소개
- 미디어 인터뷰 이미지
- 퍼스널 브랜드 대표 이미지

특징:

- 깔끔한 배경
- 전문적인 조명
- 자연스러운 표정
- 신뢰감을 강조
- 고급스러움은 "화려함"이 아니라 "절제"에서 나옴

## 적용 범위

- 비즈니스 프로필 사진
- 회사 웹사이트 팀 사진
- LinkedIn / 공개 강연용 사진
- 미디어 인터뷰 이미지

## 사용 시점

- 사용자가 "전문직 프로필 / LinkedIn / 비즈니스 사진 / 회사 웹사이트 사진"을 언급할 때
- 신뢰할 수 있고 전문적이며 절제된 시각 이미지를 원할 때

다음에는 사용하지 마세요.

- 창업자 미디어 화보(`founder-portrait.md` 사용)
- 버추얼 호스트 / VTuber(`virtual-host.md` 사용)
- 캐릭터 삼면도(`character-sheet.md` 사용)

## 누락 정보 확인 우선순위

1. 성별 / 연령대 / 인종
2. 업종 / 직업(의상과 배경에 영향)
3. 스타일: 클래식 비즈니스 / 모던 캐주얼 / 창작 업종
4. 구도: 흉상 / 상반신
5. 배경: 단색 / 사무실 / 자연광
6. 표정: 미소 / 자연스러움 / 진지함

## 기본 템플릿: 현대 비즈니스 전문직 초상화

📖 설명

깔끔한 배경 앞에서 인물의 흉상을 촬영한 전문적인 인물 사진입니다. 자연광 또는 부드러운 스튜디오 조명을 사용하고 자연스러운 표정을 담아 LinkedIn 대표 이미지로 바로 사용할 수 있습니다.

📝 프롬프트

```json
{
  "type": "현대 비즈니스 전문직 초상화",
  "goal": "LinkedIn 대표 이미지 / 회사 웹사이트 팀 페이지 / 미디어 인터뷰 이미지로 바로 사용할 수 있는 전문 인물 사진 생성",
  "subject": {
    "gender": "{argument name=\"gender\" default=\"동아시아 남성\"}",
    "age_range": "{argument name=\"age range\" default=\"30~40세\"}",
    "appearance": "{argument name=\"appearance\" default=\"깔끔한 짧은 머리, 얇은 테 안경\"}",
    "outfit": "{argument name=\"outfit\" default=\"짙은 파란색 재킷 + 연회색 셔츠, 넥타이 없음\"}"
  },
  "expression": {
    "mood": "{argument name=\"mood\" default=\"자연스러운 미소, 안정적인 시선\"}",
    "gaze": "{argument name=\"gaze\" default=\"카메라를 응시\"}"
  },
  "composition": {
    "shot": "{argument name=\"shot\" default=\"흉상\"}",
    "framing": "{argument name=\"framing\" default=\"인물을 중앙에서 약간 왼쪽에 두고 배경에 1/3 공간 확보\"}"
  },
  "background": {
    "type": "{argument name=\"background\" default=\"연회색 그라데이션 + 살짝 흐릿한 사무실\"}",
    "depth_of_field": "{argument name=\"dof\" default=\"얕은 피사계 심도\"}"
  },
  "lighting": {
    "key_light": "{argument name=\"key light\" default=\"45° 부드러운 빛\"}",
    "fill_light": "{argument name=\"fill light\" default=\"오른쪽의 약한 보조광\"}",
    "rim_light": "{argument name=\"rim light\" default=\"눈에 띄는 윤곽광 없음\"}",
    "color_temp": "{argument name=\"color temp\" default=\"자연스럽고 약간 따뜻함\"}"
  },
  "style": {
    "rendering": "고해상도 인물 사진 + 자연스러운 피부 질감",
    "post_processing": "절제된 피부 보정, 모공과 자연스러운 질감 유지"
  },
  "constraints": {
    "must_keep": [
      "인물이 자연스럽고 경직되지 않음",
      "시선에 초점을 맞춤",
      "과도한 피부 보정 없이 피부 질감을 사실적으로 유지",
      "업종에 맞는 의상"
    ],
    "avoid": [
      "과장된 특수 조명 효과",
      "필터를 씌운 듯한 가짜 피부",
      "브랜드 로고 노출",
      "배경 요소가 주인공을 압도함"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 성별, 나이, 업종, 구도
- 기본값 지정 가능: 배경, 조명, 후반 보정
- 무작위 지정 가능: 안경 스타일, 액세서리

### 자동 완성 전략

- 업종에 맞춰 의상을 자동 선택합니다(금융 = 정장; 기술 = 캐주얼 셔츠; 창작 = 검정 티셔츠 + 재킷).
- 기본 표정은 "자연스러운 미소"입니다.
- 기본 배경은 "연회색 그라데이션 + 흐릿한 환경"입니다.

## 변형 1: 야외 자연광 인물 사진

📝 프롬프트

```json
{
  "type": "야외 자연광 전문직 초상화",
  "background": {
    "type": "{argument name=\"outdoor scene\" default=\"흐릿한 초록 공원 배경\"}"
  },
  "lighting": {
    "key_light": "자연스러운 정면광",
    "color_temp": "따뜻한 골든아워"
  },
  "constraints": {
    "must_feel": "자연스럽고 친근하며 생활감이 있음"
  }
}
```

## 변형 2: 단색 배경 스튜디오 사진

📝 프롬프트

```json
{
  "type": "스튜디오 전문직 초상화",
  "background": {
    "type": "{argument name=\"backdrop\" default=\"중성 회색 배경지\"}",
    "depth_of_field": "없음"
  },
  "lighting": {
    "key_light": "버터플라이 조명",
    "fill_light": "대칭적인 부드러운 조명"
  },
  "constraints": {
    "must_feel": "잡지 화보 수준"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "전문직 초상화 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 업종 + 성별 + 나이를 제공하면 의상 / 조명 / 배경을 자동으로 결정",
  "constraints": {
    "must_feel": "LinkedIn 대표 이미지로 바로 사용할 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 피부를 과도하게 보정하지 않고 질감을 유지합니다.
- 채도가 지나치게 높은 필터를 사용하지 않습니다.
- 배경에 알아볼 수 있는 제3자 로고가 나타나지 않게 합니다.
- 업종과 명백히 어울리지 않는 의상을 입히지 않습니다.
- 사용자가 명확히 요청하지 않는 한 과장된 극적 조명을 사용하지 않습니다.
