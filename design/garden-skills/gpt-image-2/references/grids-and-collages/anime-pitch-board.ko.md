# 애니메이션 기획 피치 보드 템플릿

이 문서는 "포스터 + 캐릭터 + 설정 + 문구를 한 이미지에서 동시에 보여 주는" 프로젝트 기획 단계의 문서형 시각물에 사용합니다.

- 애니메이션 / 게임 프로젝트 기획 피치
- IP 설정 전체 문서
- 영상 프로젝트 피치 덱의 단일 페이지
- 출판사의 신작 제안
- 애니메이션 스튜디오 내부 제안

특징:

- 하나의 큰 이미지가 여러 구역으로 나뉩니다.
- 주요 구역: 포스터 / 키 비주얼
- 보조 구역: 캐릭터 카드 / 설정 / 세계관
- 문구 구역: 제목 + 태그라인 + 로그라인
- 단일 이미지가 아니라 "전문적인 프로젝트 문서"처럼 보여야 합니다.

## 적용 범위

- 애니메이션 / 게임 프로젝트 기획 피치
- 영화·영상 제안
- IP 전체 제안

## 사용 시점

- 사용자가 "기획 승인 / 피치 / 제안 / 전체 설정 / 작품을 한 장으로 설명"을 언급할 때
- "프로젝트 문서 수준"의 시각물을 원할 때

다음에는 사용하지 마세요.

- 단일 키 비주얼( `storyboards-and-sequences/anime-key-visual.md` 사용)
- 캐릭터 설정 시트( `portraits-and-characters/character-sheet.md` 사용)
- 관계도( `storyboards-and-sequences/character-relationship-diagram.md` 사용)
- 일반 마케팅 포스터( `poster-and-campaigns/brand-poster.md` 사용)

## 누락 정보 확인 우선순위

1. 작품명 + 태그라인 한 줄
2. 소재 + 장르(공상과학 / 학교 / 종말물 / ...)
3. 주인공 수 + 주인공 설명
4. 세계관 / 시대
5. 기본 스타일
6. 일본어 / 영어 / 중국어 제목이 필요한지 여부

## 기본 템플릿: 애니메이션 기획 피치 보드

📖 설명

하나의 큰 이미지가 키 비주얼 주요 구역 + 캐릭터 카드 구역 + 세계관 구역 + 문구 구역으로 나뉩니다.

📝 프롬프트

```json
{
  "type": "애니메이션 기획 피치 보드",
  "goal": "애니메이션 / 게임 프로젝트 기획 피치에 사용할 수 있는 전체 시각 문서 한 페이지를 생성",
  "ip": {
    "title": "{argument name=\"title\" default=\"서리빛 판타지아\"}",
    "title_localized": "{argument name=\"title localized\" default=\"FROZEN FANTASIA\"}",
    "tagline": "{argument name=\"tagline\" default=\"이 눈은 천 년 동안 내렸다\"}",
    "logline": "{argument name=\"logline\" default=\"끝없는 겨울이 이어지는 왕국에서, 자신의 이름을 잊은 소녀가 눈의 말을 알아듣는 여우를 만나고, 함께 봄의 근원을 찾아 나선다\"}",
    "genre": "{argument name=\"genre\" default=\"판타지 / 힐링 / 모험\"}"
  },
  "regions": {
    "main_kv": {
      "position": "{argument name=\"kv position\" default=\"위쪽 절반의 60%\"}",
      "content": "{argument name=\"kv content\" default=\"눈 덮인 들판에 서 있는 소녀 주인공, 배경은 얼어붙은 성, 발치에는 여우\"}",
      "style": "영화 포스터 수준의 애니메이션 임파스토 스타일"
    },
    "character_cards": {
      "position": "{argument name=\"character region\" default=\"왼쪽 아래\"}",
      "count": "{argument name=\"character count\" default=\"3\"}",
      "items": [
        "{argument name=\"char 1\" default=\"소녀 주인공 · 서리빛 머리 · 기억상실\"}",
        "{argument name=\"char 2\" default=\"검객 동료 · 검은 머리 · 수호자\"}",
        "{argument name=\"char 3\" default=\"여우 동료 · 눈처럼 흰 털 · 영매\"}"
      ],
      "card_design": "모서리가 둥근 정사각형 초상화 + 이름 + 한 줄 소개"
    },
    "world_setting": {
      "position": "{argument name=\"world region\" default=\"오른쪽 아래\"}",
      "content": "{argument name=\"world content\" default=\"천 년 동안 겨울에 봉인된 공중 왕국, 살아 있는 것은 흩날리는 눈과 오로라뿐\"}",
      "extras": ["지도 썸네일(선택)", "중요 소품 아이콘 3개"]
    },
    "title_block": {
      "position": "{argument name=\"title position\" default=\"화면 상단 중앙\"}",
      "components": ["메인 제목(큰 글씨)", "현지화된 제목", "태그라인(작은 이탤릭체)"]
    },
    "footer_meta": {
      "position": "하단",
      "content": "{argument name=\"footer\" default=\"PRESENTED BY · X STUDIO · 2026\"}"
    }
  },
  "style": {
    "art_style": "{argument name=\"art style\" default=\"현대 애니메이션 + 반실사 + 임파스토 배경\"}",
    "color_palette": "{argument name=\"color palette\" default=\"얼음 파랑 + 달빛 흰색 + 따뜻한 금색\"}",
    "typography": "제목은 세리프체 + 본문은 산세리프체"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"3:4\"}",
  "constraints": {
    "must_keep": [
      "키 비주얼 구역을 항상 시각적 기준점으로 유지",
      "캐릭터 카드의 스타일을 통일",
      "정보 구역을 명확하게 나누고 혼란을 피함",
      "색상 팔레트를 엄격하게 통일"
    ],
    "avoid": [
      "정보를 지나치게 많이 넣어 키 비주얼 구역이 눌림",
      "캐릭터 카드 스타일이 서로 달라짐",
      "제목 서체가 2종류를 초과",
      "태그라인 / 로그라인 누락"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 작품명, 태그라인, 주인공
- 기본값 지정 가능: 레이아웃, 스타일, 색상 팔레트, 서체
- 무작위 지정 가능: 배경의 세부 사항

### 자동 완성 전략

- 사용자가 작품 콘셉트를 한 문장으로 제시하면 제목 + 태그라인 + 로그라인 + 주인공 + 세계관을 자동으로 구체화합니다.
- 기본적으로 키 비주얼이 60%를 차지하고 캐릭터 카드와 세계관 구역을 둡니다.
- 기본적으로 세로형 3:4 비율을 사용합니다.

## 변형 1: 게임 프로젝트 기획 피치

📝 프롬프트

```json
{
  "type": "게임 프로젝트 기획 피치 보드",
  "regions": {
    "main_kv": {"content": "게임 대표 이미지 + 핵심 플레이 장면"},
    "character_cards": {"content": "플레이 가능 캐릭터 + 소개"},
    "world_setting": {"content": "핵심 게임 루프 + 주요 시스템"}
  },
  "constraints": {
    "must_feel": "GDC 피치 수준"
  }
}
```

## 변형 2: 영화·영상 프로젝트 피치

📝 프롬프트

```json
{
  "type": "영화·영상 프로젝트 피치 보드",
  "regions": {
    "main_kv": {"content": "영화 대표 이미지"},
    "character_cards": {"content": "주요 캐릭터 + 캐스팅 후보"},
    "world_setting": {"content": "시대 + 미술 참고 자료"}
  },
  "constraints": {
    "must_feel": "투자자에게 바로 보낼 수 있는 완성도"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "피치 보드 자동 완성",
  "mode": "auto-fill",
  "rule": "사용자가 작품 콘셉트를 한 문장으로 제시하면 모든 구역을 자동으로 구체화",
  "constraints": {
    "must_feel": "공식 피치 덱의 첫 페이지로 사용할 수 있어야 함"
  }
}
```

## 피해야 할 사항

- 키 비주얼 구역을 50% 미만으로 줄이지 않습니다.
- 캐릭터 카드의 화풍을 다르게 만들지 않습니다.
- 정보 구역이 혼란스럽게 섞이지 않게 합니다.
- 태그라인 / 로그라인을 빠뜨리지 않습니다.
- 색상 팔레트에 주색을 4가지 넘게 넣지 않습니다.
- 제목 서체를 두 종류 넘게 사용하지 않습니다.
