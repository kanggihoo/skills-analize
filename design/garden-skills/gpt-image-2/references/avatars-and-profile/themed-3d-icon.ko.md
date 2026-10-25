# 테마형 3D 아이콘 아바타 템플릿

이 파일은 “3D 카툰 / 귀여운 아이콘 수준”의 아바타 비주얼을 위한 템플릿입니다.

- 카와이 3D 캐릭터 아이콘
- Minecraft 스타일 스킨 렌더링
- 실물 같은 3D 아바타
- 앱 아이콘 스타일 아바타
- 굿즈 스티커 / 작은 굿즈 캐릭터

특징:

- 3D 렌더링 느낌
- 귀엽고 사랑스러우며 테마가 뚜렷함
- 단일 이미지 / 단일 캐릭터
- 둥근 사각형 / 원형 구도
- 소셜 플랫폼 프로필 사진 / 앱 아이콘에 적합

## 적용 범위

- 둥근 사각형 / 원형 아바타
- 앱 아이콘
- 작은 굿즈 캐릭터
- 카툰 스타일의 “나”

## 사용 시점

- 사용자가 자신이나 캐릭터를 3D 카툰 버전으로 만들고 싶어 할 때
- Pixar / 카와이 / 귀여운 캐릭터 아바타를 원할 때
- 캐릭터를 IP의 아이콘으로 등장시키고 싶을 때

사용하지 말 것:

- 사실적인 셀카 ( `style-transfer-selfie.md` 사용)
- 여러 버전의 그리드 ( `character-grid-portrait.md` 사용)
- 캐릭터 전체 설정 시트 ( `portraits-and-characters/character-sheet.md` 사용)

## 정보가 부족할 때 먼저 물어볼 순서

1. 주제 (고양이 / 캐릭터 / 본인 / 취미)
2. 스타일 기반 (카와이하고 귀여운 스타일 / Pixar풍 사실적 카툰 / Minecraft 픽셀 3D / 실물 같은 3D)
3. 색상 / 주조색
4. 액세서리 / 소품 (안경 / 모자 / 손에 든 물건)
5. 구도: 흉상 / 전신 / 아바타
6. 출력 형태: 원형 / 둥근 사각형 / 투명 배경

## 기본 템플릿: 카와이 3D 캐릭터 아이콘

📖 설명

전체 이미지 한 장으로 구성된 1:1 아바타. 주인공은 귀여운 3D 캐릭터이며, 둥근 사각형 구도와 단색 배경을 사용합니다.

📝 프롬프트

```json
{
  "type": "카와이 3D 캐릭터 아이콘",
  "goal": "소셜 플랫폼 프로필 사진 / 앱 아이콘 / 작은 굿즈 캐릭터로 사용할 수 있는 귀여운 3D 캐릭터 이미지 생성",
  "character": {
    "subject": "{argument name=\"character subject\" default=\"통통하고 둥근 오렌지색 작은 시바견\"}",
    "personality": "{argument name=\"personality\" default=\"밝고 재치 있음\"}",
    "expression": "{argument name=\"expression\" default=\"미소 + 입을 벌리고 혀를 내밂\"}",
    "pose": "{argument name=\"pose\" default=\"정면 흉상, 카메라를 바라봄\"}",
    "outfit_or_accessory": [
      "{argument name=\"item 1\" default=\"작은 빨간 나비넥타이\"}",
      "{argument name=\"item 2\" default=\"작은 방울이 달려 있음\"}"
    ]
  },
  "style": {
    "rendering": "{argument name=\"rendering\" default=\"Pixar풍 3D + 은은한 툰 셰이딩\"}",
    "color_palette": "{argument name=\"color palette\" default=\"따뜻한 오렌지 + 크림 화이트\"}",
    "lighting": "{argument name=\"lighting\" default=\"부드러운 빛 + 은은한 역광\"}"
  },
  "background": {
    "type": "{argument name=\"background\" default=\"크림색 단색 + 아주 옅은 광륜\"}"
  },
  "format": {
    "shape": "{argument name=\"shape\" default=\"둥근 사각형\"}",
    "aspect_ratio": "{argument name=\"aspect ratio\" default=\"1:1\"}",
    "composition_safety": "주인공 주변에 10% 여백을 두어 잘리지 않게 함"
  },
  "constraints": {
    "must_keep": [
      "전체적으로 귀엽고 사랑스러워야 함",
      "주인공이 중앙에 명확하게 자리해야 함",
      "색상은 최대 3개",
      "세부 요소는 절제 (요소를 너무 많이 넣지 않음)"
    ],
    "avoid": [
      "사실적인 스타일이 섞이는 것",
      "눈이 아플 정도로 채도가 높은 색상",
      "배경이 주인공의 시선을 방해하는 것",
      "액세서리가 캐릭터의 얼굴을 가리는 것"
    ]
  }
}
```

### 매개변수 전략

- 반드시 물을 것: 캐릭터 주제, 표정
- 기본값 사용 가능: 스타일, 색상, 배경, 형태
- 무작위로 정해도 됨: 액세서리의 구체적인 모양

### 자동 보완 전략

- 사용자가 주인공(시바견 / 고양이 / 본인 / 취미)을 알려주면 귀여운 스타일 + 따뜻한 색상 + 둥근 사각형을 자동 선택
- 액세서리는 기본 1–2개
- 비율은 기본 1:1

## 변형 1: Minecraft 스타일 스킨 렌더링

📝 프롬프트

```json
{
  "type": "Minecraft 스타일 맞춤 스킨 렌더링",
  "character": {
    "subject": "{argument name=\"character\" default=\"참조 이미지를 바탕으로 스타일화한 본인 모습의 Minecraft 캐릭터\"}",
    "outfit": "{argument name=\"outfit\" default=\"파란 티셔츠 + 청바지 + 빨간 배낭\"}"
  },
  "style": {
    "rendering": "Minecraft 복셀 3D 스타일, 블록 형태의 신체, 픽셀 질감",
    "color_palette": "Minecraft 기본 16색 팔레트"
  },
  "background": {
    "type": "Minecraft 잔디 블록 풍경"
  },
  "constraints": {
    "must_feel": "Minecraft 스타일이 분명하면서도 본인처럼 느껴져야 함"
  }
}
```

## 변형 2: 실물 같은 3D 앱 아이콘

📝 프롬프트

```json
{
  "type": "실물 같은 3D 앱 아이콘 스타일 아바타",
  "character": {
    "subject": "{argument name=\"theme\" default=\"사진 애호가\"}",
    "metaphor_object": "{argument name=\"object\" default=\"은은하게 빛이 반사되는 입체 3D 카메라\"}"
  },
  "style": {
    "rendering": "실물 같은 3D + 부드러운 빛 + 짙은 그림자",
    "color_palette": "Apple Big Sur 스타일"
  },
  "background": {
    "type": "둥근 사각형의 연한 회색 그라데이션"
  },
  "constraints": {
    "must_feel": "실제로 눌러 실행할 수 있는 앱 아이콘처럼 보여야 함"
  }
}
```

## 변형 3: 자동 보완 모드

📝 프롬프트

```json
{
  "type": "3D 아이콘 아바타 자동 보완",
  "mode": "auto-fill",
  "rule": "사용자가 주제(취미 / 성격 / 취향) 하나를 알려주면 주인공의 모습, 스타일, 색상, 형태를 자동으로 결정",
  "constraints": {
    "must_feel": "바로 프로필 사진으로 교체할 수 있어야 함"
  }
}
```

## 피할 것

- 3D 캐릭터를 “반쯤 사실적이고 반쯤 카툰”처럼 보이게 하지 말 것 (귀엽거나 실물 같거나 둘 중 하나로 명확하게)
- 배경을 화려하게 만들어 주인공보다 눈에 띄게 하지 말 것
- 아바타에 읽을 수 있는 영어 라벨이나 텍스트를 넣지 말 것
- 액세서리로 얼굴을 가리지 말 것
- 아이콘 하나에 캐릭터를 2명 넘게 넣지 말 것
