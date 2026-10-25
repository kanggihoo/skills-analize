# 캐릭터 IP × 굿즈 보드 템플릿

이 템플릿은 “애니메이션 / VTuber / 서브컬처 캐릭터 한 명을 중심에 두고 브랜드 로고 + 패키지 + 굿즈 + SNS 프로필 + 프로모션 배너를 결합한” 복합 비주얼 보드를 만들기 위한 것입니다.

대표적인 용도:

- VTuber 데뷔 / 기념일 / 신규 프로젝트 소개 이미지
- 동인지 / 개인 IP 공개 홍보 이미지
- 서브컬처 브랜드(캔디 / 베이커리 / 카페 / 잡화점)와 매장의 협업 이미지
- 캐릭터 굿즈 모음 이미지
- IP 캐릭터의 방과 라이프스타일 상품 카탈로그
- SNS 홍보 이미지 (캐릭터 소개 + 상품 예고 + SNS 핸들을 한 장에 담음)

특징 (다른 마스코트 / 브랜드 템플릿과의 차이):

| 템플릿 | 주인공 | 중점 |
|---|---|---|
| `mascot-brand-kit.md` (기존) | 카툰 마스코트 | 삼면도 + 표정 + 적용 사례 |
| `full-mascot-brand-doc.md` (추가) | 카툰 마스코트 | 18개 모듈의 전체 설계 문서 |
| `brand-identity-board.md` (기존) | 추상적인 브랜드 | 로고 + 색상 + 글꼴 + 적용 목업 |
| **이 템플릿** (추가) | **애니메이션 캐릭터 / VTuber / 개인 IP** | **캐릭터 모습 + 패키지 + 굿즈 + SNS + 라이프스타일 상품** |

## 적용 범위

- VTuber 굿즈 소개 보드
- 개인 IP / VUP 데뷔 홍보 이미지
- 서브컬처 브랜드 × 실물 상품 협업 이미지
- 캐릭터 라이프스타일 / 방 안의 잡화 상품 모음
- 동인지 행사에서 신간 홍보 이미지

## 사용 시점

- 사용자가 “캐릭터 굿즈 / VTuber 데뷔 / IP merch board / 개인 프로젝트 이미지”를 언급할 때
- 캐릭터가 기업용 마스코트가 아니라 애니메이션 / 서브컬처 / 모에 스타일일 때
- “IP의 전체 비즈니스 생태계를 한 장에 보여주고” 싶을 때 (캐릭터 + 상품 + SNS + 패키지)

사용하지 말 것:

- 기업 / 식음료 브랜드 마스코트의 전체 설계 문서 → `full-mascot-brand-doc.md` 사용
- 캐릭터 삼면도 / 표정만 필요할 때 → `portraits-and-characters/character-sheet.md` 사용
- 캐릭터 한 명을 담은 단일 포스터 → `portraits-and-characters/virtual-host.md` 사용
- 패키지 디자인만 필요할 때 → `branding-and-packaging/cosmetic-packaging.md` 사용

## 정보가 부족할 때 먼저 물어볼 순서

1. 캐릭터 이름 + 한 문장 성격 설명 (필수, 이미지의 핵심)
2. 테마 색상 + 모티프 (벚꽃 / 바다 / 별하늘 / 캔디 / 토끼 등)
3. 스타일 방향 (**부드러운 핑크 귀여움 / 고딕 다크 / 사이버 / 일본풍 / 동화풍**)
4. 반드시 포함할 상품 종류 (포장 식품 / 문구 / 의류 / 홈 / 디지털 굿즈)
5. SNS 핸들 (선택 사항, 있으면 실제 프로젝트 같은 느낌)
6. 매장 / 행사 정보 포함 여부 (“4.26 NEW OPEN” 등)

## 기본 템플릿 1: 애니메이션 캐릭터 아이덴티티 + 굿즈 보드 (Case 112 스타일)

📖 설명

헤더 배너 + 패키지 목업 + 프로모션 포스터 + 웹 배너 + SNS 프로필 + 굿즈 모음으로 구성한 큰 이미지 한 장. 모든 영역이 동일한 캐릭터를 중심으로 전개됩니다.

📝 프롬프트

```json
{
  "type": "브랜드 아이덴티티 및 굿즈 디자인 보드",
  "goal": "캐릭터 데뷔, 기념일 프로젝트, IP 공개 홍보 이미지로 사용할 수 있는 단일 애니메이션 캐릭터 중심의 전체 브랜드 출시 보드 생성",
  "theme": {
    "color_palette": "{argument name=\"theme color\" default=\"파스텔 핑크\"}와 흰색",
    "motif": "{argument name=\"motif\" default=\"벚꽃\"}와 핑크 하트",
    "vibe": "{argument name=\"vibe\" default=\"달콤하고 부드러우며 몽환적이고 아이돌 데뷔 같은 에너지\"}"
  },
  "character": {
    "name": "{argument name=\"character name\" default=\"유온 치이\"}",
    "subname": "{argument name=\"character subtext\" default=\"유온 치이\"}",
    "description": "{argument name=\"character description\" default=\"짧은 갈색 단발머리와 분홍색 눈, 흰 후드티를 입고 부드럽게 미소 짓는 애니메이션 소녀\"}",
    "personality": "{argument name=\"personality\" default=\"치유형, 다정함, 단것을 좋아함\"}"
  },
  "branding": {
    "main_logo": "{argument name=\"main logo text\" default=\"유온 치이\"}",
    "sub_logo": "{argument name=\"sub logo text\" default=\"유온 치이\"}",
    "social_handle": "{argument name=\"social handle\" default=\"@yuonchii\"}"
  },
  "layout": {
    "format": "세로형 포스터 방향의 대형 복합 보드 한 장",
    "aspect_ratio": "{argument name=\"aspect ratio\" default=\"세로 3:4\"}",
    "background": "{argument name=\"background\" default=\"모서리에 은은한 핑크 그라데이션과 작은 낙서가 있는 깨끗한 흰색\"}",
    "sections": [
      {
        "type": "헤더 배너",
        "position": "상단",
        "elements": ["큰 메인 로고", "아래에 작은 보조 로고", "벚꽃 장식 그래픽", "오른쪽의 캐릭터 초상"]
      },
      {
        "type": "제품 패키지",
        "position": "중앙 왼쪽",
        "elements": [
          "하트 모양 투명 창으로 안의 {argument name=\"packaging filling\" default=\"핑크 하트 캔디\"}가 보이는 정사각형 상자 1개",
          "상자 앞면에 인쇄된 캐릭터 일러스트",
          "상자 옆에 놓인 개별 캔디 / 제품 포장지 2개",
          "패키지 주변에 흩뿌린 {argument name=\"scattered item\" default=\"하트 캔디\"} 5개"
        ]
      },
      {
        "type": "프로모션 포스터",
        "position": "중앙 오른쪽",
        "elements": [
          "중앙에 배치한 캐릭터 초상",
          "{argument name=\"poster prop\" default=\"하트 모양 캔디 그릇\"}",
          "상단의 메인 로고",
          "{argument name=\"event tag\" default=\"4.26 NEW OPEN\"} 텍스트",
          "소셜 핸들 텍스트"
        ]
      },
      {
        "type": "가로형 웹 배너",
        "position": "중앙 아래",
        "elements": ["왼쪽의 메인 로고", "중앙을 채우는 {argument name=\"motif\" default=\"벚꽃\"} 그래픽", "오른쪽의 캐릭터 초상", "아래의 가는 태그라인"]
      },
      {
        "type": "소셜 미디어 프로필 목업",
        "position": "왼쪽 아래",
        "elements": [
          "로고와 모티프가 들어간 헤더 / 커버 이미지",
          "원형 프로필 사진 1개 (캐릭터 클로즈업)",
          "핸들 텍스트 '{argument name=\"social handle\" default=\"@yuonchii\"}'",
          "강조색으로 채운 팔로우 버튼 1개",
          "캐릭터를 소개하는 2–3줄의 목업 자기소개"
        ]
      },
      {
        "type": "굿즈 모음",
        "position": "오른쪽 아래",
        "count": 9,
        "items": [
          "{argument name=\"merch 1\" default=\"로고가 있는 흰 티셔츠 1장\"}",
          "{argument name=\"merch 2\" default=\"캐릭터가 그려진 흰 머그컵 1개\"}",
          "{argument name=\"merch 3\" default=\"원형 핀 배지 4개\"}",
          "{argument name=\"merch 4\" default=\"아크릴 키링 1개\"}",
          "{argument name=\"merch 5\" default=\"캔디 봉지 2개\"}"
        ]
      }
    ]
  },
  "global_style": {
    "rendering": "캐릭터는 완성도 높은 애니메이션 일러스트 스타일 + 패키지 / 굿즈는 사실적인 제품 목업 + SNS / 배너는 깔끔한 에디토리얼 레이아웃",
    "typography": "메인 로고는 귀여운 디스플레이 글꼴, SNS / 본문은 깔끔한 산세리프, 작은 손글씨 장식",
    "consistency": "모든 영역에서 캐릭터 외형을 동일하게 유지하고 변형하지 않음",
    "panel_density": "중간 정도. 일정한 여백을 두어 각 영역에 숨 쉴 공간을 마련"
  },
  "constraints": {
    "must_keep": [
      "모든 영역에서 캐릭터의 외형(헤어스타일 / 색상 / 기본 표정)이 완전히 동일함",
      "로고 / SNS 핸들의 철자가 일관됨",
      "각 영역의 경계가 명확하고 서로 넘치지 않음",
      "패키지 / 굿즈가 이미지 콜라주가 아닌 실제 사물처럼 보임"
    ],
    "avoid": [
      "영역마다 캐릭터 머리색 / 기본 의상 색을 바꾸는 것",
      "굿즈를 같은 물건 복제처럼 보이게 하는 것 (도자기 / 면직물 / 아크릴 / 종이 등 재질 차이를 표현)",
      "SNS 프로필 영역이 실제 소셜 플랫폼 UI와 다르게 보이는 것",
      "주변 장식 때문에 헤더 로고 글자가 작아져 읽기 어려워지는 것"
    ]
  }
}
```

### 매개변수 전략

- **반드시 물을 것**: 캐릭터 이름, 캐릭터 설명, 테마 색상, 모티프
- **기본값 사용 가능**: 굿즈 1–5 (분위기에 맞춰 굿즈 종류 추천), 화면 비율
- **무작위로 정해도 됨**: 흩뿌린 물건 / 포스터 소품 (모티프에 맞춰 선택), 자기소개 문구

### 자동 보완 전략

- 사용자가 “VTuber 데뷔 홍보 이미지”와 캐릭터 모습만 말하면 핑크 벚꽃 / 파란 바다 / 보라색 별하늘 모티프를 자동으로 구성
- 굿즈를 지정하지 않으면 기본 9종 세트 (티셔츠 / 머그컵 / 배지 4개 / 키링 / 포장 상품 2개)
- 매장 정보를 말하지 않으면 SNS 프로필에 “NEW OPEN”을 강조하지 않고 “PROFILE”로 표시

## 기본 템플릿 2: 캐릭터 방의 잡화 라이프스타일 상품 모음 (Case 167 스타일)

📖 설명

데뷔나 브랜드 출시를 강조하는 대신 “이 캐릭터는 어떤 방에서 생활할까?”를 보여줍니다. 생활용품 6개 + 캐릭터 + 콘셉트 설명을 이미지 한 장에 구성합니다.

📝 프롬프트

```json
{
  "type": "파스텔 라이프스타일 포스터 / 캐릭터 방 꾸미기 상품 소개 시트",
  "goal": "캐릭터가 좋아하는 방의 생활용품을 보여주는 잡지풍 카탈로그 이미지를 생성. SNS 공유 / 상품 예고 / 개인 프로젝트에 적합",
  "theme": "{argument name=\"theme\" default=\"부드럽고 몽환적인 라벤더 해파리 미학\"}",
  "style": "{argument name=\"style\" default=\"일본식 귀여운 에디토리얼 그래픽, 여백이 있는 흰 배경, 파스텔 라일락 팔레트, 섬세한 손글씨 메모, 반짝임과 작은 낙서, 부드러운 제품 사진과 잡지 레이아웃의 조합\"}",
  "subject": {
    "character": {
      "name": "{argument name=\"character name\" default=\"해파리짱\"}",
      "appearance": "{argument name=\"character appearance\" default=\"짧은 플래티넘 금발 단발머리의 젊은 여성. 흰색 이너 위에 폭신한 연한 라벤더색 지퍼 후드티를 입고, 오른쪽 아래에 가슴 위로 보이게 배치. 얼굴은 평범한 베이지색 사각형으로 의도적으로 가림\"}"
    }
  },
  "layout": {
    "orientation": "세로 포스터",
    "background": "별, 거품, 작은 해파리, 음표가 희미하게 낙서된 깨끗한 흰색 배경",
    "sections": [
      { "title": "헤더", "position": "상단", "elements": ["말풍선 소개", "메인 제목", "작은 부제 GOODS", "라벤더색 가로 리본 태그라인", "오른쪽 위의 둥근 배지"] },
      { "title": "주요 상품 그리드", "position": "왼쪽 위와 중앙", "count": 6, "labels": ["{argument name=\"goods 1\" default=\"흔들흔들 해파리 램프\"}", "{argument name=\"goods 2\" default=\"해파리와 꿈꾸는 침구\"}", "{argument name=\"goods 3\" default=\"해파리 조개 거울\"}", "{argument name=\"goods 4\" default=\"해파리 그라데이션 머그\"}", "{argument name=\"goods 5\" default=\"해파리의 설렘 수납함\"}", "{argument name=\"goods 6\" default=\"해파리 폭신 매트\"}"] },
      { "title": "옆쪽 손글씨 메모", "position": "오른쪽 위", "labels": ["{argument name=\"side note\" default=\"다 같이 해파리짱 방에서 편하게 쉬어가자~♡♡\"}"] },
      { "title": "방 콘셉트 상자", "position": "왼쪽 아래", "labels": ["{argument name=\"concept title\" default=\"해파리짱의 방 꾸미기 포인트\"}"] },
      { "title": "추천 원형 배지", "position": "아래쪽 중앙 왼편", "labels": ["추천!"] }
    ]
  },
  "product_images": {
    "count": 6,
    "items": [
      { "name": "{argument name=\"goods 1\" default=\"흔들흔들 해파리 램프\"}", "description": "연한 파랑과 라벤더색으로 부드럽게 빛나는, 흰 받침 위의 작고 반투명한 해파리 모양 램프" },
      { "name": "{argument name=\"goods 2\" default=\"해파리와 꿈꾸는 침구\"}", "description": "폭신한 이불과 베개를 갖춘 파스텔 라벤더색 침대, 몽환적이고 아늑한 침실 연출" },
      { "name": "{argument name=\"goods 3\" default=\"해파리 조개 거울\"}", "description": "통통한 조개 모양의 파스텔 라일락색 테두리와 둥근 받침이 있는 작은 탁상 거울" },
      { "name": "{argument name=\"goods 4\" default=\"해파리 그라데이션 머그\"}", "description": "라벤더에서 핑크로 변하는 그라데이션과 단순한 해파리 일러스트가 있는 세라믹 머그" },
      { "name": "{argument name=\"goods 5\" default=\"해파리의 설렘 수납함\"}", "description": "화장품과 작은 병을 담은 파스텔 수납함, 해파리 엠블럼으로 장식" },
      { "name": "{argument name=\"goods 6\" default=\"해파리 폭신 매트\"}", "description": "연한 라벤더와 흰색의 작고 폭신한 구름 또는 해파리 모양 매트" }
    ]
  },
  "text_elements": {
    "main_title": "{argument name=\"headline text\" default=\"해파리짱의 방 아이템\"}",
    "tagline": "{argument name=\"tagline\" default=\"폭신하고 달콤하고, 살짝 꿈같은 내 방에 온 걸 환영해♡\"}",
    "concept_points": {
      "count": 3,
      "items": [
        "{argument name=\"concept 1\" default=\"색상은 흰색과 라벤더로 통일!\"}",
        "{argument name=\"concept 2\" default=\"빛이 모이는 폭신한 공간으로\"}",
        "{argument name=\"concept 3\" default=\"친구들이 함께하는 아이템에 둘러싸여 나답게 있을 수 있는 공간을 소중히 여겨♪\"}"
      ]
    },
    "product_blurbs": "각 상품 이미지의 옆이나 아래에 귀엽고 편안한 글꼴로 짧은 일본어 손글씨 설명을 넣음"
  },
  "composition": "상품 카드와 텍스트를 왼쪽에 많이 배치하고, 캐릭터 초상은 오른쪽 아래 1/3을 차지하며 레이아웃과 살짝 겹치게 구성",
  "color_palette": ["흰색", "파스텔 라벤더", "부드러운 라일락", "연한 회보라", "파스텔 블루-핑크 그라데이션 약간"],
  "constraints": {
    "must_keep": [
      "상품 6개의 스타일이 통일됨 (같은 색 계열 + 비슷한 질감 방향)",
      "캐릭터는 고정된 위치에 나타나며 주인공인 상품을 압도하지 않음",
      "SNS에 공유할 수 있는 세련된 카탈로그처럼 보여야 함"
    ],
    "avoid": [
      "상품이 그리드 없이 어지럽게 쌓이는 것",
      "글꼴 종류가 너무 많아지는 것 (일본어 손글씨 + 메인 제목 글꼴 하나 권장)",
      "캐릭터를 너무 크게 그려 상품보다 주목받는 것"
    ]
  }
}
```

### 이 변형을 선택할 때

- 사용자가 “내 방에 있는 것”, “IP 캐릭터와 같은 잡화” 유형의 프로젝트를 진행할 때
- 상업성 / 데뷔보다 분위기 / 라이프스타일을 강조할 때
- SNS 공유에 적합하며 로고 시스템 / 패키지 목업이 필요하지 않을 때

## 기본 템플릿 3: 미니멀 버전 (캐릭터 + 굿즈 4–6개 + 로고)

리소스가 제한되어 있고 단일 IP 상품 출시 공지만 필요한 경우에 적합합니다.

📝 프롬프트

```json
{
  "type": "미니멀 캐릭터 굿즈 출시 공지",
  "sections": [
    "상단: 큰 메인 로고 + 캐릭터 클로즈업",
    "중앙: 그리드에 배치한 굿즈 4–6개",
    "하단: SNS 핸들 + 출시일 + 한 줄 태그라인"
  ],
  "vibe": "{argument name=\"vibe\" default=\"깔끔하고 고급스러우며 제품에 집중\"}",
  "merch_count": 6,
  "must_keep": ["제품 사진의 질감이 일관됨", "로고와 SNS 핸들의 철자가 일치"]
}
```

### 이 변형을 선택할 때

- 6–8개 섹션을 만들 시간이 없을 때
- “캐릭터 + 굿즈 + 출시일”만 강조하고 싶을 때
- “정보가 넘치는” 스타일보다 “깔끔하고 간결한” 스타일을 원할 때

## 피할 것

- ❌ 영역마다 캐릭터의 헤어스타일 / 색상 / 기본 의상을 바꾸기 → 같은 IP처럼 보이지 않음
- ❌ 굿즈 6개를 같은 물건의 복제처럼 그리기 → 재질 / 형태 / 용도 차이를 반드시 표현
- ❌ 헤더와 웹 배너의 로고 글꼴을 다르게 사용
- ❌ SNS 프로필의 팔로우 버튼을 캐릭터 IP의 주색과 충돌하게 만들기
- ❌ 굿즈 목업의 원근이 잘못된 상태 (예: 머그컵 입구가 눌려 타원형이 되거나 티셔츠 주름이 부자연스러움)
- ❌ 패키지 목업의 “투명 창”을 실제 굴절이 아닌 단순한 이미지처럼 그리기
- ❌ 전체 이미지의 주요 색조를 5개 이상으로 구성 → IP의 일관성을 잃으므로 주요 색상 2–3개 + 강조색 1–2개로 제한
