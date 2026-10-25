# 애니메이션 키 비주얼 단일 이미지 템플릿

이 문서는 "작품 전체를 대표하는 한 장"의 애니메이션 메인 비주얼을 만들 때 사용합니다.

- 애니메이션 KV / 메인 비주얼
- 라이트노벨 표지
- 동인지 표지
- 애니메이션 포스터
- 게임 카드 대표 이미지(UI 제외)

특징:

- 이미지 하나에 여러 캐릭터 또는 캐릭터 하나와 강한 분위기를 모아 표현
- 극적인 구도와 조명
- 애니메이션 / 반실사 스타일
- 보통 세로 3:4 / 4:5
- 제목 공간 확보

## 적용 범위

- 애니메이션 메인 비주얼
- 라이트노벨 / 동인지 표지
- IP 포스터
- 게임 카드 이미지

## 사용 시점

- 사용자가 "애니메이션 KV / anime 메인 비주얼 / 라이트노벨 표지 / IP 포스터"를 언급할 때
- 이미지 한 장으로 세계관을 설명하고 싶어 할 때
- 완성도 높은 애니메이션 스타일 대형 이미지를 원할 때

다음에는 사용하지 마세요.

- 여러 장면의 이야기 콘티(`manga-spread-page.md` 사용)
- 4칸 개그 만화(`four-panel-comic.md` 사용)
- 실제 인물 화보(`portraits-and-characters/founder-portrait.md` 사용)
- 영화 수준의 콘셉트 대형 장면(`scenes-and-illustrations/concept-scene.md` 사용)

## 누락 정보 확인 우선순위

1. 작품 / 주제
2. 주인공 이미지(인원수 + 관계)
3. 세계관 / 시대 / 분위기
4. 스타일: 현대 애니메이션 / 90년대 애니메이션 / 반실사
5. 제목 공간이 필요한지 여부
6. 비율

## 기본 템플릿: 애니메이션 키 비주얼 단일 이미지

📖 설명

주인공 + 장면 분위기 + 제목 공간을 담은 강한 서사의 대형 이미지 한 장입니다.

📝 프롬프트

```json
{
  "type": "애니메이션 키 비주얼",
  "goal": "애니메이션 / 라이트노벨 / IP 메인 비주얼로 사용할 단일 이미지를 생성",
  "ip": {
    "title": "{argument name=\"ip title\" default=\"서리빛 판타지아\"}",
    "tagline": "{argument name=\"tagline\" default=\"이 눈은 천 년 동안 내렸다\"}"
  },
  "characters": {
    "count": "{argument name=\"character count\" default=\"3\"}",
    "items": [
      "{argument name=\"character 1\" default=\"은백색 긴 머리와 파란 눈, 눈처럼 흰 원피스를 입은 소녀 주인공\"}",
      "{argument name=\"character 2\" default=\"검은 머리와 갑옷을 입은 검객 동료\"}",
      "{argument name=\"character 3\" default=\"눈처럼 흰 여우인 작은 동물 동료\"}"
    ],
    "composition_relationship": "{argument name=\"composition\" default=\"주인공을 중앙에 두고 동료들이 양옆에서 지키며 동물은 발치에 배치\"}"
  },
  "world": {
    "scene": "{argument name=\"scene\" default=\"얼어붙은 도시, 원경의 성, 흩날리는 눈\"}",
    "lighting": "{argument name=\"lighting\" default=\"차가운 파란 주광 + 따뜻한 금색 윤곽광\"}",
    "atmosphere": "{argument name=\"atmosphere\" default=\"서사적, 고독함, 굳센 의지\"}"
  },
  "style": {
    "art_style": "{argument name=\"art style\" default=\"현대 애니메이션 + 반실사 + 임파스토 배경\"}",
    "color_palette": "{argument name=\"color palette\" default=\"얼음 파랑 + 달빛 흰색 + 따뜻한 금색\"}"
  },
  "title_block": {
    "enabled": "{argument name=\"title block enabled\" default=\"true\"}",
    "main_title": "{argument name=\"main title\" default=\"서리빛 판타지아\"}",
    "sub_title": "{argument name=\"sub title\" default=\"FROZEN FANTASIA\"}",
    "position": "{argument name=\"title position\" default=\"화면 상단 중앙\"}"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "주인공을 절대적인 시각 중심으로 유지",
      "조명 방향을 통일",
      "색상 팔레트를 엄격하게 통일",
      "제목과 주인공이 겹치지 않음"
    ],
    "avoid": [
      "캐릭터가 너무 많아 얼굴을 알아보기 어려움",
      "배경이 너무 밝아 캐릭터가 묻힘",
      "색상 팔레트에 채도 높은 추가 색상 등장",
      "제목 서체가 너무 많음"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 작품명, 주인공, 세계관
- 기본값 지정 가능: 스타일, 색상, 제목 공간
- 무작위 지정 가능: 배경 세부 요소

### 자동 완성 전략

- 기본 주인공 수는 1~3명입니다.
- 세계관에 따라 색상을 자동 선택합니다(차가운 세계 = 파랑·흰색 / 종말물 = 그을린 갈색 / 학교 = 따뜻한 주황색).
- 기본 비율은 세로 3:4입니다.

## 변형 1: 단일 캐릭터 + 매우 강한 분위기의 KV

📝 프롬프트

```json
{
  "type": "단일 캐릭터 + 강한 분위기 KV",
  "characters": {
    "count": 1,
    "items": ["{argument name=\"character\" default=\"역광을 받은 긴 머리 소녀\"}"]
  },
  "world": {
    "atmosphere": "고독 + 신비로움"
  },
  "constraints": {
    "must_feel": "영화 포스터 분위기"
  }
}
```

## 변형 2: 군상 KV(캐릭터 5명 이상)

📝 프롬프트

```json
{
  "type": "군상 KV",
  "characters": {
    "count": 6,
    "composition_relationship": "피라미드 구도: 주인공이 꼭대기에 있고 조연들이 둘러쌈"
  },
  "constraints": {
    "must_feel": "팀워크, 서사적 분위기, 애니메이션 첫 방송 메인 이미지로 사용 가능"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "애니메이션 KV 자동 완성",
  "mode": "auto-fill",
  "rule": "사용자가 작품 콘셉트를 한 문장으로 주면 주인공, 구도, 세계관, 제목을 자동 결정",
  "constraints": {
    "must_feel": "첫 공개 이미지로 바로 사용할 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 캐릭터를 7명 넘게 넣지 않습니다(얼굴 인식이 무너집니다).
- 조명 방향이 통일되지 않게 하지 않습니다.
- 제목이 주인공 얼굴을 덮지 않게 합니다.
- 주색을 4가지 넘게 사용하지 않습니다.
- 배경의 세부 묘사가 캐릭터보다 많지 않게 합니다.
