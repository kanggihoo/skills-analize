# 캐릭터 카탈로그 / 시리즈 카드 인포그래픽 포스터 템플릿

이 문서는 "같은 기본 캐릭터 / 같은 기본 소재를 N개의 변형(별자리 / 원소 / 왕조 / 성격 / 계절)으로 나누고, 변형마다 독립 패널 + 맞춤 문구 + 장식 테마를 붙인" 인포그래픽 포스터를 만들 때 사용합니다.

대표적인 용도:

- 별자리 12종 시리즈 카드 포스터(한 번에 3개씩, 원소별 포스터 4장)
- MBTI 16개 성격 유형 시각 포스터
- 왕조 / 신화 / 민족 시리즈 초상화
- "같은 모델, 다른 스타일" 시리즈 화보 홍보 이미지
- 절기 / 월 / 계절별 시리즈 포스터
- 캐릭터의 여러 관점과 성격 기록

특징:

- 모든 패널에서 **같은 기본 캐릭터**를 사용합니다(외모 특징 통일).
- **N개 패널**이 통일된 테두리 / 레이아웃 / 글꼴 시스템을 공유합니다.
- **각 패널**마다 독립적인 테마 색상, 장식 모티프, 성격 문구 6~8개가 있습니다.
- 전체적으로 "캐릭터 / 개념 사전 한 페이지"처럼 보입니다.

다른 템플릿과의 차이:

| 템플릿 | 초점 |
|---|---|
| `portraits-and-characters/character-sheet.md`(기존) | 캐릭터 하나의 삼면도 + 표정 + 의상 |
| `avatars-and-profile/cultural-portrait-series.md`(기존) | 왕조 / 민족 / 문학 시리즈 초상화(초상 자체에 중점) |
| `avatars-and-profile/character-grid-portrait.md`(기존) | n×n 초상화 그리드(여러 직업 / 표정 / 왕조) |
| **이 템플릿**(신규) | **같은 캐릭터의 여러 버전 카드. 카드마다 독립 테마 + 성격 문구 6~8개 + 장식 모티프** |

## 적용 범위

- 별자리 12종 / 원소 4종 / MBTI / 절기 / 왕조 / 신화를 주제로 한 시리즈 포스터
- "같은 모델의 여러 스타일 + 성격 기록"으로 구성된 SNS 공유 이미지
- IP 캐릭터 분기 기록
- 심리 테스트 / 성격 분류 시각 포스터

## 사용 시점

- 사용자가 "별자리 / MBTI / 절기 / 왕조 / 성격 분류 포스터"를 언급할 때
- 같은 캐릭터를 N가지 버전으로 나눠 보여 주고 싶을 때
- 버전마다 다른 문구 + 장식 테마가 필요할 때
- "도감 한 페이지" / "기록집 한 장" 같은 결과물을 원할 때

다음에는 사용하지 마세요.

- 캐릭터 하나의 여러 표정 → `portraits-and-characters/character-sheet.md` 사용
- 성격 기록이 없는 왕조 / 신화 초상화 → `avatars-and-profile/cultural-portrait-series.md` 사용
- 문구가 없는 n×n 초상화 콜라주 → `avatars-and-profile/character-grid-portrait.md` 사용

## 누락 정보 확인 우선순위

1. 시리즈 주제(별자리 12종 / MBTI / 왕조 / 계절 / 사용자 지정)
2. 이번 이미지에 몇 개 패널을 넣을지(3 / 4 / 9 / 12 / 16)
3. 주 캐릭터 설명(**실사 / 애니메이션 / 리얼리즘 / 아이돌풍**) + 모든 패널에서 동일 인물인지 여부
4. 기본 언어(중국어 / 영어 / 일본어 / 이중 언어)
5. 전체 미학(**부드러운 분홍 귀여움 / 레트로 기록물 / 미니멀 펑크 / 고전 공필화 / 파스텔 에디토리얼**)
6. 각 패널별 테마 색상이 필요한지 여부
7. 비율(기본값 세로 3:4)

## 기본 템플릿: 같은 캐릭터의 3패널 변형 카드 포스터(원소별 별자리 12종 / MBTI 4그룹 분할에 적합)

📖 설명

세로형 포스터입니다. 헤더(제목 + 부제) 아래에 패널 세 개를 위아래로 쌓습니다. 패널마다 왼쪽에 캐릭터, 오른쪽에 문구를 배치하고 독립 테마 색상, 상징, 별자리 / 장식을 포함합니다.

📝 프롬프트

```json
{
  "type": "{argument name=\"theme type\" default=\"중국 별자리풍 캐릭터 인포그래픽 포스터\"}",
  "subject_overview": "{argument name=\"subject overview\" default=\"십이 별자리 캐릭터 목록, 물 원소 버전\"}",
  "language": "{argument name=\"language\" default=\"번체 중국어\"}",
  "format": "세로 포스터",
  "style": {
    "overall": "{argument name=\"style overall\" default=\"에디토리얼 인포그래픽 레이아웃의 우아한 애니메이션풍 캐릭터 카탈로그\"}",
    "rendering": "{argument name=\"rendering\" default=\"부드럽고 정교한 디지털 일러스트, 파스텔 그라데이션, 섬세한 반짝임, 장식 테두리\"}",
    "mood": "{argument name=\"mood\" default=\"몽환적, 천체적, 세련됨, 여성적, 수중 분위기\"}"
  },
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect ratio\" default=\"2:3\"}",
    "background": "{argument name=\"background\" default=\"옅은 파랑·라벤더 기운과 은은한 질감이 있는 진주빛 흰색. 모서리에는 가는 장식 프레임과 작은 별을 배치\"}"
  },
  "header": {
    "title": "{argument name=\"headline text\" default=\"십이 별자리 캐릭터 목록 | 물 원소 별자리\"}",
    "subtitle": "{argument name=\"subtitle text\" default=\"감정 · 직관 · 공명\"}",
    "icons": ["작은 별", "{argument name=\"top right motif\" default=\"오른쪽 위의 물방울 문장\"}", "왼쪽 위의 말린 구름 모양 선화"]
  },
  "layout": {
    "sections_count": 3,
    "sections": [
      {
        "title": "{argument name=\"section 1 title\" default=\"게자리 Cancer\"}",
        "position": "상단 패널",
        "theme_color": "{argument name=\"section 1 color\" default=\"파우더 블루\"}",
        "symbol": "{argument name=\"section 1 symbol\" default=\"왼쪽 원 안의 게자리 기호\"}",
        "constellation": "{argument name=\"section 1 constellation\" default=\"오른쪽 위의 게자리 별자리\"}",
        "count": 6,
        "labels": [
          "{argument name=\"section 1 line 1\" default=\"원소: 물\"}",
          "{argument name=\"section 1 line 2\" default=\"개념: 마음에 소중한 사람을 담아 두는 감정의 수호자\"}",
          "{argument name=\"section 1 line 3\" default=\"성격: 다정함, 민감함, 가족을 소중히 여김\"}",
          "{argument name=\"section 1 line 4\" default=\"행동 원칙: 감정을 먼저 살피고 중요한 사람을 지킴\"}",
          "{argument name=\"section 1 line 5\" default=\"연애 성향: 천천히 다가가고 가까워질수록 더 잘 따름\"}",
          "{argument name=\"section 1 line 6\" default=\"대인관계 습관: 괜찮다고 말하지만 실제로는 오래 기억함\"}"
        ],
        "character": {
          "identity": "{argument name=\"base character\" default=\"별자리 캐릭터로 재해석한 젊은 여성 모델\"}",
          "pose": "{argument name=\"section 1 pose\" default=\"정면을 향한 상반신 초상, 큰 조개 쿠션을 부드럽게 끌어안은 모습\"}",
          "outfit": "{argument name=\"section 1 outfit\" default=\"별과 달을 수놓은 얇은 카디건과 레이스 장식의 연한 파란색 천체풍 슬립 드레스\"}",
          "background": "{argument name=\"section 1 bg\" default=\"초승달, 조개껍데기, 반짝이는 별, 양식화된 바다 물결, 작은 물방울이 있는 부드러운 파란 밤하늘\"}"
        }
      },
      {
        "title": "{argument name=\"section 2 title\" default=\"전갈자리 Scorpio\"}",
        "position": "가운데 패널",
        "theme_color": "{argument name=\"section 2 color\" default=\"짙은 바이올렛\"}",
        "symbol": "왼쪽 원 안의 전갈자리 기호",
        "constellation": "오른쪽 위의 전갈자리 별자리",
        "count": 6,
        "labels": [
          "원소: 물",
          "{argument name=\"section 2 line 2\" default=\"개념: 깊은 바닷속 탐험가, 감정의 깊이가 있음\"}",
          "{argument name=\"section 2 line 3\" default=\"성격: 집중력, 신비로움, 강한 의지\"}",
          "{argument name=\"section 2 line 4\" default=\"행동 원칙: 먼저 관찰하고 정확하게 한 번에 행동\"}",
          "{argument name=\"section 2 line 5\" default=\"연애 성향: 깊이 사랑하고 충성심과 독점욕을 중시\"}",
          "{argument name=\"section 2 line 6\" default=\"대인관계 습관: 신경 쓸수록 말이 줄고 속으로 떠봄\"}"
        ],
        "character": {
          "identity": "{argument name=\"base character\" default=\"별자리 캐릭터로 재해석한 젊은 여성 모델\"}",
          "pose": "차분하고 수수께끼 같은 동작으로 한 손을 턱 근처에 둔 상반신 초상",
          "outfit": "고딕 디테일이 있는 검은색 시스루 드레스와 짙은 자두색 오프숄더 숄",
          "background": "초승달, 거품, 별, 소용돌이치는 안개 낀 물결 모양이 있는 짙은 보라색 천체 바다 장면"
        }
      },
      {
        "title": "{argument name=\"section 3 title\" default=\"물고기자리 Pisces\"}",
        "position": "하단 패널",
        "theme_color": "{argument name=\"section 3 color\" default=\"라벤더\"}",
        "symbol": "왼쪽 원 안의 물고기자리 기호",
        "constellation": "오른쪽 위의 물고기자리 별자리",
        "count": 6,
        "labels": [
          "원소: 물",
          "{argument name=\"section 3 line 2\" default=\"개념: 꿈에 공감하며 직관으로 길을 찾음\"}",
          "{argument name=\"section 3 line 3\" default=\"성격: 낭만적, 부드러움, 상상력이 풍부함\"}",
          "{argument name=\"section 3 line 4\" default=\"행동 원칙: 먼저 느끼고 흐름을 따라 답을 찾음\"}",
          "{argument name=\"section 3 line 5\" default=\"연애 성향: 쉽게 설레고 영혼의 동반자를 바람\"}",
          "{argument name=\"section 3 line 6\" default=\"대인관계 습관: 다른 사람의 감정까지 함께 느끼는 편\"}"
        ],
        "character": {
          "identity": "{argument name=\"base character\" default=\"별자리 캐릭터로 재해석한 젊은 여성 모델\"}",
          "pose": "거품을 띄워 균형을 잡듯 한 손을 들고 다른 손은 가슴에 얹은 상반신 초상",
          "outfit": "부드럽게 늘어진 소매와 반짝이는 천으로 만든 반투명 라벤더색 판타지 드레스",
          "background": "거품, 반짝임, 흐르는 반투명 물결이 있는 옅은 라일락색 수중·천체 혼합 배경"
        }
      }
    ],
    "dividers": "장식 테두리가 가는 수평 패널 세 개"
  },
  "footer": {
    "center_icon": "{argument name=\"footer icon\" default=\"작은 파란 조개 엠블럼\"}",
    "decorations": ["작은 별", "가는 장식 곡선"]
  },
  "constraints": {
    "must_keep": [
      "패널 3개 모두 같은 기본 캐릭터 사용(얼굴 / 체형 / 기본 헤어스타일 일관성 유지)",
      "각 패널은 의상 / 소품 / 배경 모티프로 구분",
      "문구를 읽기 쉽게 정렬(패널마다 성격 기록 6줄)",
      "전체 색상 테마를 통일(예: 물 원소는 모두 파랑·보라 계열)",
      "패널 구분 테두리 스타일 통일"
    ],
    "avoid": [
      "기본 캐릭터를 서로 전혀 다른 세 사람처럼 그림",
      "패널마다 장식 모티프 스타일이 달라짐(한쪽은 실사, 한쪽은 카툰)",
      "성격 기록 문구가 패널의 절반보다 큰 면적을 차지",
      "다른 아홉 별자리나 주제 밖의 내용을 추가",
      "글꼴을 지나치게 많이 사용(제목 + 성격 목록 + 영문 별자리, 세 종류 권장)"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: theme type(시리즈 주제), section title 3개, 기본 캐릭터 설명
- **기본값 지정 가능**: language(주제에 맞춰 추천), aspect ratio, 장식 모티프
- **무작위 지정 가능**: 성격 기록 6줄의 구체적인 문구(캐릭터 성격에 따라 자동 생성)

### 자동 완성 전략

- 사용자가 "물 원소 별자리"를 제시하면 게자리 / 전갈자리 / 물고기자리 + 파랑·보라 팔레트 + 바다 모티프를 자동 구성합니다.
- 사용자가 "불 원소"를 제시하면 양자리 / 사자자리 / 사수자리 + 빨강·주황·금색 + 불꽃 모티프를 자동 구성합니다.
- 사용자가 "MBTI 분석가 그룹"을 제시하면 INTJ / INTP / ENTJ / ENTP + 보라색 + 기하학적 모티프를 자동 구성합니다.

## 변형 1: 4패널 가로 벤토(16개 항목을 4장씩 나눌 때 적합)

📝 프롬프트

```json
{
  "type": "4패널 캐릭터 카탈로그 포스터, 가로 벤토 레이아웃",
  "format_override": "가로 포스터, 16:9 또는 4:3",
  "layout_override": {
    "structure": "크기가 같은 패널 4개로 구성된 2x2 그리드",
    "use_case": "MBTI 4가지 기질(NT / NF / SJ / SP)을 한 이미지에서 대표 캐릭터 하나씩으로 표현"
  },
  "section_count": 4,
  "must_keep": ["4개 패널 모두 같은 기본 캐릭터 공유", "대각선 / 그리드 균형 유지"]
}
```

### 이 변형을 선택할 때

- MBTI 16개 유형을 4가지 기질로 나누고 싶을 때
- 별자리 12개를 4원소로 나눌 때(한 이미지에 원소별 대표 캐릭터 하나씩)
- 가로 화면 공유(트위터 / 소셜 피드)

## 변형 2: 12패널 전체 모음(단일 이미지로는 권장하지 않지만 필요하다면)

📝 프롬프트

```json
{
  "type": "12패널 전체 시리즈 캐릭터 카탈로그 포스터",
  "section_count": 12,
  "layout_override": {
    "format": "1:2 이상으로 긴 세로 포스터",
    "structure": "3열 × 4행 또는 4열 × 3행",
    "panel_internal_layout": "패널마다 훨씬 작게 구성: 캐릭터 썸네일 1개 + 짧은 라벨 3개(6개가 아님)"
  },
  "warning": "패널이 많을수록 각 칸의 세부 묘사가 무너집니다. 12패널 한 장 대신 원소별 포스터 4장으로 나누는 것을 권장합니다."
}
```

### 이 변형을 선택할 때

- 별자리 12개 / 절기 12개 전체를 반드시 이미지 한 장에 넣어야 할 때
- 고객이 개별 패널 세부 사항의 축소를 받아들일 때
- 상세 읽기용이 아니라 전체 시리즈 개요 이미지로 사용할 때

## 변형 3: 왕조 / 신화 시리즈 초상화(별자리 기호 대신 문화 모티프)

📝 프롬프트

```json
{
  "type": "왕조 / 신화 캐릭터 카탈로그 포스터",
  "section_count": 3,
  "section_examples": ["당 / 송 / 명 / 청 / 민국 시대"],
  "style_override": {
    "overall": "고전 중국 모티프를 넣은 우아한 에디토리얼 초상화 시리즈",
    "palette": "따뜻한 베이지, 앤티크 금색, 먹색, 주홍색",
    "decoration_per_panel": "해당 시대에 맞는 문양 / 의상 / 건축 / 기물"
  },
  "labels_per_panel_count": 5,
  "labels_examples": ["시대", "의상 특징", "대표 기물", "성격 키워드", "인장 / 서명"]
}
```

### 이 변형을 선택할 때

- 문화 상품 / 출판 / 역사 교육 콘텐츠
- "같은 모델이 다른 왕조 의상을 입은" 화보 시리즈를 만들 때
- 별자리 / MBTI 같은 현대 분류가 필요하지 않을 때

## 피해야 할 사항

- ❌ 기본 캐릭터를 서로 다른 여러 인물로 표현 → 핵심인 "동일 캐릭터의 여러 버전"이 즉시 무너짐
- ❌ 패널마다 장식 모티프 스타일이 달라짐(한쪽은 실사, 한쪽은 치비)
- ❌ 3패널 포스터에 별자리 12개를 억지로 넣음 → 읽을 수 없음
- ❌ 성격 문구가 인물 얼굴을 가리거나 면적의 50%를 넘게 차지
- ❌ 패널 테두리 / 글꼴이 통일되지 않아 서로 다른 포스터 3장을 붙인 것처럼 보임
- ❌ 주제 밖의 요소를 억지로 넣음("물 원소 별자리" 포스터에 불꽃 등장)
- ❌ 주색을 5가지 이상 사용해 시리즈의 통일감이 사라짐
- ❌ 패널별 문구 수가 다름(하나는 6줄, 하나는 8줄, 하나는 4줄 → 반드시 같은 분량)
