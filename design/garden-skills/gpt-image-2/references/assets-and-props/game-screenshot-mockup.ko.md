# 게임 내 스크린샷 Mockup 템플릿

이 파일은 “게임 내 스크린샷처럼 보이는 이미지”를 만들 때 사용합니다.

- 오픈 월드 게임 스크린샷
- RPG 전투 스크린샷
- 픽셀 / 복셀 게임 스크린샷
- 비주얼 노벨 스크린샷
- 게임 UI mockup

특징:

- 전체적으로 “실제 게임 화면”처럼 보임
- 게임 UI(HUD / 퀘스트 패널 / 체력 바 / 미니맵) 포함
- 시점 표현(1인칭 / 3인칭 / 탑다운 / 등각 투영)
- 순수 삽화보다 게임 화면의 느낌을 강조
- 보통 말풍선 / 퀘스트 안내 문구가 포함됨

## 적용 범위

- 게임 내 스크린샷 mockup
- 게임 홍보 이미지(스크린샷처럼 연출)
- 게임 기획 데모용 비주얼
- 라이브 스트리밍 썸네일(게임 화면처럼 연출)

## 사용 시점

- 사용자가 “게임 스크린샷 / game screenshot / mockup / HUD / UI”를 언급할 때
- 사용자가 삽화가 아니라 “게임 화면처럼 보이는” 결과를 원할 때

다음에는 사용하지 마세요.

- 애니메이션 KV → `storyboards-and-sequences/anime-key-visual.md` 사용
- 게임 기획 피치 자료 → `grids-and-collages/anime-pitch-board.md` 사용
- 캐릭터 설정 → `portraits-and-characters/character-sheet.md` 사용

## 누락된 정보가 있을 때 우선 질문할 항목

1. 게임 장르(오픈 월드 / RPG / 픽셀 / 비주얼 노벨 / 시뮬레이션)
2. 시점(1인칭 / 3인칭 / 탑다운 / 등각 투영)
3. 장면(야외 / 실내 / 도시 / 전투)
4. 주인공 설명(있는 경우)
5. UI 요소(HUD / 체력 바 / 퀘스트 / 미니맵)
6. 화면 비율

## 기본 템플릿: 오픈 월드 게임 스크린샷

📖 설명

한 장의 이미지 전체를 실제 게임 내 스크린샷처럼 연출하고 HUD UI를 포함합니다.

📝 프롬프트

```json
{
  "type": "오픈 월드 게임 스크린샷",
  "goal": "실제 게임 내 스크린샷처럼 보이는 이미지 생성",
  "game_meta": {
    "game_name": "{argument name=\"game name\" default=\"FROZEN FANTASIA\"}",
    "engine_feel": "{argument name=\"engine feel\" default=\"현대적인 AAA 엔진(Unreal 5 렌더링에 가까운 느낌)\"}",
    "perspective": "{argument name=\"perspective\" default=\"3인칭 숄더뷰\"}"
  },
  "scene": {
    "environment": "{argument name=\"environment\" default=\"설원 + 멀리 보이는 성 + 오로라\"}",
    "time_of_day": "{argument name=\"time\" default=\"황혼\"}",
    "weather": "{argument name=\"weather\" default=\"가벼운 눈\"}",
    "lighting": "{argument name=\"lighting\" default=\"차가운 푸른 주광 + 따뜻한 금빛 윤곽광\"}"
  },
  "character": {
    "description": "{argument name=\"character\" default=\"은백색 긴 머리의 소녀 주인공, 뒷모습, 검을 뽑는 중\"}",
    "position": "화면 아래쪽 3분의 1, 멀리 있는 풍경을 향해 등을 보임"
  },
  "ui_elements": {
    "hud": {
      "enabled": "{argument name=\"hud enabled\" default=\"true\"}",
      "items": [
        "{argument name=\"hud item 1\" default=\"왼쪽 아래: 체력 바 + 마나 바 + 캐릭터 초상화\"}",
        "{argument name=\"hud item 2\" default=\"오른쪽 아래: 4칸 스킬 슬롯 + 아이템 인벤토리\"}",
        "{argument name=\"hud item 3\" default=\"왼쪽 위: 미니맵(원형) + 현재 좌표\"}",
        "{argument name=\"hud item 4\" default=\"오른쪽 위: 퀘스트 추적 — '봄의 근원을 찾아라'\"}"
      ]
    },
    "subtitle": {
      "enabled": "{argument name=\"subtitle enabled\" default=\"true\"}",
      "speaker": "{argument name=\"speaker\" default=\"여우 동료\"}",
      "text": "{argument name=\"subtitle text\" default=\"앞쪽이 얼어붙은 협곡이야. 조심해.\"}"
    },
    "interaction_prompt": {
      "enabled": "{argument name=\"prompt enabled\" default=\"true\"}",
      "text": "{argument name=\"prompt\" default=\"[E] 키를 눌러 조사\"}"
    }
  },
  "style": {
    "rendering": "{argument name=\"rendering\" default=\"PBR 렌더링 + 하이 다이내믹 레인지 + 은은한 필름 그레인\"}",
    "color_palette": "{argument name=\"color palette\" default=\"빙하색 파랑 + 달빛 흰색 + 따뜻한 금색\"}"
  },
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"16:9\"}",
  "constraints": {
    "must_keep": [
      "실제 게임 내 스크린샷처럼 보여야 함(실감 나는 HUD 포함)",
      "HUD 색상이 장면과 충돌하지 않아야 함",
      "자막 글꼴과 HUD 글꼴이 통일되어야 함",
      "주인공과 배경의 비율이 정확해야 함"
    ],
    "avoid": [
      "HUD가 없는 정적인 삽화처럼 보이는 것",
      "HUD 요소를 8개 넘게 넣는 것",
      "픽셀 스타일과 현대 스타일처럼 UI 스타일을 한 화면에 뒤섞는 것",
      "지나치게 긴 자막 / 오타"
    ]
  }
}
```

### 매개변수 전략

- 필수 질문: 게임 장르, 시점, 장면
- 기본값 사용 가능: UI 요소, 자막, 색상
- 무작위 선택 가능: 환경 세부 요소

### 자동 완성 전략

- 사용자가 게임 콘셉트를 알려주면 시점 / HUD / 자막을 자동으로 정합니다.
- 기본 화면 비율은 16:9
- 기본 렌더링은 현대적인 AAA 게임 스타일

## 변형 1: 픽셀 게임 스크린샷

📝 프롬프트

```json
{
  "type": "픽셀 게임 스크린샷",
  "game_meta": {
    "engine_feel": "16비트 JRPG 스타일(예: 성검전설 3)",
    "perspective": "탑다운 / 등각 투영"
  },
  "style": {
    "rendering": "픽셀 아트 + 16색 팔레트",
    "color_palette": "16색 레트로 RPG 팔레트"
  },
  "ui_elements": {
    "hud": {
      "items": ["화면 아래쪽 대화창 + 캐릭터 초상화"]
    }
  },
  "constraints": {
    "must_feel": "FC / SNES JRPG"
  }
}
```

## 변형 2: 비주얼 노벨 스크린샷

📝 프롬프트

```json
{
  "type": "비주얼 노벨 스크린샷",
  "game_meta": {
    "engine_feel": "Galgame / Visual Novel",
    "perspective": "1인칭(캐릭터를 바라봄)"
  },
  "ui_elements": {
    "hud": null,
    "subtitle": {
      "enabled": true,
      "speaker": "{argument name=\"speaker\" default=\"여주인공\"}",
      "text": "..."
    }
  },
  "style": {
    "rendering": "애니메이션풍 세미 페인터리 + 부드러운 빛"
  },
  "constraints": {
    "must_feel": "비주얼 노벨의 표준 대화 장면"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "게임 스크린샷 자동 완성",
  "mode": "auto-fill",
  "rule": "사용자가 한 문장으로 게임 콘셉트를 주면 시점 / 장면 / HUD / 주인공을 자동으로 정합니다.",
  "constraints": {
    "must_feel": "Steam 스토어 스크린샷으로 사용할 수 있는 이미지"
  }
}
```

## 피해야 할 사항

- HUD 요소를 8개 넘게 넣지 마세요.
- 게임 장르와 UI 스타일이 어긋나지 않게 하세요(픽셀 게임에 현대적인 반투명 유리 HUD를 사용하지 않음).
- 자막은 2줄을 넘기지 마세요.
- 주인공이 화면을 너무 많이 차지해 HUD를 압도하지 않게 하세요.
- “스크린샷”이 정적인 삽화처럼 보이지 않게 하세요(HUD가 핵심적인 표식입니다).
- 퀘스트 패널에 뚜렷한 오타 / 깨진 문자가 나타나지 않게 하세요.
