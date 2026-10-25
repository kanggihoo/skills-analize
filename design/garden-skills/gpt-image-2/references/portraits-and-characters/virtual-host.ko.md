# 가상 스트리머 / VTuber 캐릭터 템플릿

이 문서는 "가상 스트리머 / 디지털 인간 / VTuber" 유형의 인물 시각물을 만들 때 사용합니다.

- VTuber 프로필 카드
- 디지털 스트리머 대표 이미지
- 라이브 방송 인물 모델
- 차원을 넘나드는 브랜드 홍보 캐릭터

특징:

- 2D 애니메이션 / 3D + 반애니메이션 스타일
- 뚜렷한 캐릭터 정체성
- 보통 이름 / 데뷔 정보 / 태그를 포함합니다.
- 배경 효과와 브랜드 색상을 함께 사용하는 경우가 많습니다.

## 적용 범위

- VTuber 아바타
- 디지털 인간 대표 이미지
- 가상 스트리머 데뷔 카드
- 차원 간 홍보 이미지

## 사용 시점

- 사용자가 "VTuber / 가상 스트리머 / 디지털 인간 / 가상 캐릭터"를 언급할 때
- "실제 사람은 아니지만 인간 같은 느낌이 강한" 시각물을 원할 때

다음에는 사용하지 마세요.

- 실제 인물의 전문직 프로필 사진(`professional-portrait.md` 사용)
- 실제 창업자 화보(`founder-portrait.md` 사용)
- 캐릭터 삼면도(`character-sheet.md` 사용)

## 누락 정보 확인 우선순위

1. 캐릭터 이름 / 주제
2. 스타일: 일본 애니메이션 / 한국풍 / 반실사 / 3D 카툰
3. 성별 / 나이 설정
4. 색상 주제
5. 데뷔 정보(첫 방송 날짜 / 태그)
6. 배경 효과가 필요한지 여부

## 기본 템플릿: VTuber 데뷔 프로필 카드

📖 설명

9:16 또는 3:4 비율 카드 한 장에 가상 스트리머 캐릭터를 주인공으로 배치합니다. 옆에는 이름 / 데뷔 시각 / 태그 / 플랫폼 표시를 둡니다.

📝 프롬프트

```json
{
  "type": "VTuber 데뷔 프로필 카드",
  "goal": "VTuber 데뷔일의 공식 프로필 카드로 사용할 수 있는 시각물 생성",
  "character": {
    "name": "{argument name=\"vtuber name\" default=\"서백·노나\"}",
    "style": "{argument name=\"art style\" default=\"일본 애니메이션 + 반실사\"}",
    "gender": "{argument name=\"gender\" default=\"소녀\"}",
    "age_setting": "{argument name=\"age setting\" default=\"18세\"}",
    "appearance": "{argument name=\"appearance\" default=\"은백색 긴 머리, 파란 두 눈, 눈송이 모자 + 고딕 원피스\"}",
    "pose": "{argument name=\"pose\" default=\"상반신 정면, 고개를 살짝 기울여 미소\"}"
  },
  "color_theme": {
    "main_color": "{argument name=\"main color\" default=\"얼음 파랑 + 달빛 흰색\"}",
    "accent_color": "{argument name=\"accent\" default=\"연한 분홍색\"}"
  },
  "debut_info": {
    "debut_date": "{argument name=\"debut date\" default=\"2026.05.20\"}",
    "platform": "{argument name=\"platform\" default=\"YouTube · Bilibili\"}",
    "tags": "{argument name=\"tags\" default=\"#첫방송 #눈송이패밀리 #VTuber\"}",
    "agency": "{argument name=\"agency\" default=\"NEX Live\"}"
  },
  "background": {
    "type": "{argument name=\"background\" default=\"겨울 설원 + 오로라\"}",
    "fx": "{argument name=\"fx\" default=\"흩날리는 눈 + 차가운 빛 입자\"}"
  },
  "layout": {
    "character_position": "화면 오른쪽 절반",
    "info_block_position": "화면 왼쪽에 세로 배열",
    "logo_position": "오른쪽 아래에 에이전시 로고"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "캐릭터를 시각적 주인공으로 유지",
      "이름과 데뷔 정보를 읽기 쉽게 표시",
      "주색이 캐릭터 팔레트와 일치",
      "에이전시 로고는 면적의 5%를 넘지 않음"
    ],
    "avoid": [
      "캐릭터 얼굴이 정보 블록에 가려짐",
      "배경 효과가 주인공보다 눈에 띔",
      "글꼴 종류가 지나치게 많음",
      "사용자가 제공하지 않은 실제 플랫폼 로고가 표시됨"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 캐릭터 이름, 스타일, 색상, 데뷔 정보
- 기본값 지정 가능: 배경, 효과, 레이아웃
- 무작위 지정 가능: 배경 세부 요소

### 자동 완성 전략

- 주제에 따라 스타일을 자동 선택합니다(눈 → 얼음 파랑; 불 → 빨강·주황; 밤 → 짙은 보라; 봄 → 벚꽃 분홍).
- 스타일에 맞는 의상을 선택합니다.
- 데뷔 정보는 기본적으로 오늘부터 30일 후로 설정합니다.

## 변형 1: 라이브 방송 미리보기 썸네일(가로형)

📝 프롬프트

```json
{
  "type": "VTuber 라이브 방송 미리보기 썸네일",
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"16:9\"}",
  "character": {
    "pose": "{argument name=\"pose\" default=\"상반신 + 큰 표정\"}"
  },
  "title_overlay": {
    "main": "{argument name=\"stream title\" default=\"오늘 밤! 첫 라이브 방송!\"}",
    "sub": "{argument name=\"stream sub\" default=\"21:00에 만나요 / 눈송이 패밀리\"}"
  },
  "constraints": {
    "must_feel": "라이브 분위기, 초대하는 느낌, 사진이 잘 나오는 구성"
  }
}
```

## 변형 2: 차원을 넘나드는 브랜드 홍보 대표 이미지

📝 프롬프트

```json
{
  "type": "차원 간 브랜드 홍보 대표 이미지",
  "character": {
    "pose": "홍보 제품을 들고 카메라를 바라봄"
  },
  "brand": {
    "name": "{argument name=\"brand\" default=\"AURORA Coffee\"}",
    "co_brand_visual": "브랜드 로고 + 캐릭터가 손에 든 제품"
  },
  "constraints": {
    "must_feel": "브랜드 홍보 느낌, 브랜드 일관성, 공식 KV로 사용할 수 있음"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "VTuber 캐릭터 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 주제(눈, 밤, 바다, 벚꽃)를 주면 이름, 색상, 의상, 배경, 데뷔 정보를 자동 생성",
  "constraints": {
    "must_feel": "공식 공개에 바로 사용할 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 캐릭터 얼굴을 텍스트로 가리지 않습니다.
- 실제 저작권 캐릭터의 외형을 사용하지 않습니다.
- 카드 한 장에 정보 5줄을 넘게 넣지 않습니다.
- 배경 효과가 캐릭터보다 눈에 띄지 않게 합니다.
- 글꼴을 세 종류 넘게 사용하지 않습니다.
