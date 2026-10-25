# 긴 랜딩 페이지 / 사례 연구 UI 목업 템플릿

이 문서는 "SaaS / 마케팅 / 사례 연구 랜딩 페이지 전체 UI 목업"을 만듭니다. 히어로 / 전략 / 성과 / 사회적 증거 / CTA 등 여러 섹션을 위에서 아래까지 초장형 이미지 하나에 연결합니다.

대표적인 용도:

- SaaS 제품 공식 웹사이트 첫 페이지 목업
- 마케팅 사례 연구 장문 페이지(투자 후 보고 / KPI 회고)
- 성장 / 에이전시 사업 소개 페이지
- Y Combinator 스타일 데모데이 프로젝트 페이지
- 고객 제안서 / 투자자 덱의 웹 페이지형 표현

기존 UI 템플릿과 다른 점:

| 템플릿 | 시각 범위 | 적용 장면 |
|---|---|---|
| `chat-interface-scene.md` | 단일 화면 채팅 인터페이스 | iMessage / WeChat / 그룹 채팅 |
| `social-interface-mockup.md` | 단일 화면 소셜 게시물 상세 | Twitter / 샤오홍슈 / 웨이보 |
| `live-commerce-ui.md` | 단일 화면 라이브 방송 UI 오버레이 | 도우인 / 타오바오 라이브 |
| `product-card-overlay.md` | 단일 화면 히어로 / 상세 페이지 메인 이미지 | 전자상거래 상세 페이지 메인 이미지 |
| **이 템플릿** | **완전한 장문 페이지**(세로로 연결된 섹션 5~7개) | **SaaS / 긴 마케팅 페이지 / 사례 연구** |

## 적용 범위

- SaaS 랜딩 페이지 / 제품 공식 웹사이트 첫 화면
- 마케팅 사례 연구 장문 페이지
- 성장 회고 보고서 웹 버전
- 투자자 / 고객 제안서 웹 목업
- 에이전시 사업 소개 장문 페이지

## 사용 시점

- 사용자가 "랜딩 페이지 / landing page / case study / 페이지 전체 / 긴 페이지 / 웹사이트 목업"을 언급할 때
- 단일 화면 스크린샷 대신 위에서 아래로 이어지는 전체 섹션 구조가 필요할 때
- 고객에게 "히어로 → 데이터 → 타임라인 → 사회적 증거 → CTA"의 전체 마케팅 흐름을 보여 줘야 할 때

다음에는 사용하지 마세요.

- 단일 화면 UI 스크린샷 → `chat-interface-scene` / `social-interface-mockup` / `live-commerce-ui` 사용
- 히어로 섹션만 필요 → `poster-and-campaigns/banner-hero.md` 사용
- 실제 상호작용 가능한 HTML 웹 페이지 → 이미지를 만들지 말고 HTML 코드를 작성

## 누락 정보 확인 우선순위

1. 사업 유형(SaaS / 에이전시 / 강좌 / 사례 연구 / 투자 후 보고)
2. 브랜드 / 메인 문구 + 한 줄 소개
3. "마케팅 사례 연구"(데이터 + 고객 로고 표시)인지 "제품 공식 웹사이트 첫 화면"(기능 + 스크린샷 표시)인지
4. 색상 방향(**다크 + 네온 / 순백 + 강조색 / 밝은 베이지 비즈니스 / 글래스모피즘**)
5. 반드시 포함할 핵심 데이터(GMV / 조회수 / 고객 수 / 성장률)
6. 고객 로고 월 / 추천사 / CTA 양식이 필요한지 여부
7. 비율(**3:4 / 9:16 긴 스크린샷 / 데스크톱 페이지 전체 스크린샷**)

## 기본 템플릿: 마케팅 사례 연구 장문 페이지 목업

📖 설명

한 장의 초장형 스크린샷에 독립된 섹션 6~7개를 위에서 아래로 배치합니다. 전체에 짙은 배경 + 네온 강조색을 통일해서 사용하고 각 섹션은 실제 랜딩 페이지 모듈처럼 보여야 합니다.

📝 프롬프트

```json
{
  "type": "UI/UX 랜딩 페이지 목업",
  "goal": "제안서, 투자 후 보고, 포트폴리오 표지로 사용할 수 있는 고충실도 마케팅 사례 연구 장문 페이지 스크린샷 생성",
  "theme": "{argument name=\"theme\" default=\"다크 모드, 세련된 현대 미학, 글래스모피즘, 네온 보라색과 파란색 발광 포인트\"}",
  "viewport": {
    "width": "{argument name=\"viewport width\" default=\"데스크톱 너비 1440px\"}",
    "scroll_capture": "{argument name=\"capture style\" default=\"세로로 스크롤한 전체 페이지를 하나의 긴 이미지로 캡처\"}",
    "aspect_ratio": "{argument name=\"aspect ratio\" default=\"세로형 3:4 긴 페이지\"}"
  },
  "header": {
    "logo": "{argument name=\"brand name\" default=\"goViralX\"}",
    "nav_items": ["홈", "사례 연구", "가격", "문의"],
    "top_right_cta": "{argument name=\"top cta\" default=\"로그인\"}",
    "top_right_tag": "{argument name=\"top right tag\" default=\"바이럴 캠페인 사례 연구\"}"
  },
  "layout": {
    "section_count": 6,
    "section_separation": "은은한 가로 구분선, 세로 여백 80~120px",
    "sections": [
      {
        "name": "히어로",
        "position": "상단",
        "headline": "{argument name=\"hero headline\" default=\"바이럴 효과 1,000만 회 이상을 만든 방법\"}",
        "subheadline": "{argument name=\"hero subhead\" default=\"3일 만에 전 채널로 확산, 브랜드의 지수형 성장을 지원\"}",
        "stats_row": {
          "count": 4,
          "labels": ["{argument name=\"stat label 1\" default=\"총 조회수\"}", "{argument name=\"stat label 2\" default=\"참여율\"}", "{argument name=\"stat label 3\" default=\"전환 문의\"}", "{argument name=\"stat label 4\" default=\"실행 기간\"}"],
          "values": ["{argument name=\"stat value 1\" default=\"10,240,000+\"}", "{argument name=\"stat value 2\" default=\"18.7%\"}", "{argument name=\"stat value 3\" default=\"3,200+\"}", "{argument name=\"stat value 4\" default=\"72시간\"}"]
        },
        "visual": "{argument name=\"hero visual\" default=\"후드티를 입은 사람이 빛나는 디지털 화면과 그래프를 보는 영화적인 장면, 큰 재생 버튼 오버레이\"}"
      },
      {
        "name": "전략",
        "title": "{argument name=\"strategy title\" default=\"3일 실행 전략\"}",
        "layout_type": "세로 타임라인",
        "steps_count": 3,
        "elements_per_step": ["타임라인 노드 원", "단계 제목", "글머리 항목 3개", "재생 버튼이 있는 동영상 썸네일", "설명 상자"],
        "step_titles": ["1일 차: 콘텐츠 제작", "2일 차: 다중 플랫폼 출시", "3일 차: 확산 및 PR"]
      },
      {
        "name": "성과",
        "title": "{argument name=\"perf title\" default=\"데이터 기반 성과\"}",
        "left_column": {
          "stat_cards_count": 4,
          "values": ["10M+", "43%", "28,000+", "3,200+"],
          "labels": ["총 조회수", "참여", "신규 팔로워", "리드"]
        },
        "right_column": {
          "charts_count": 2,
          "chart_1": "3일째 정점을 찍는 7일 성장 선 그래프, x축 일자 1~7, y축 조회수, 빛나는 선",
          "chart_2": "플랫폼 비율을 보여 주는 가로 구간 막대( TikTok 52%, Instagram 24%, X 15%, YouTube 9%)"
        }
      },
      {
        "name": "성공의 비결",
        "title": "{argument name=\"keys title\" default=\"바이럴 성공의 세 가지 비결\"}",
        "cards_count": 3,
        "card_elements": ["빛나는 아이콘(불꽃 / 표적 / 안테나)", "카드 제목", "두 줄 설명", "화살표가 있는 '세부 보기' 링크"]
      },
      {
        "name": "사회적 증거",
        "title": "{argument name=\"sp title\" default=\"크리에이터 및 브랜드가 신뢰하는 서비스\"}",
        "left_column": {
          "logos_count": 8,
          "grid": "2x4",
          "brands": ["{argument name=\"logo 1\" default=\"SHEIN\"}", "SHOPLINE", "Blueglass", "instacart", "lemon8", "mi", "CIDER", "bellroy"]
        },
        "right_column": {
          "testimonial_cards_count": 2,
          "elements": ["큰따옴표 기호", "기울임꼴 인용문", "작성자 원형 아바타", "작성자 이름 + 직함(예: SaaS 창업자, 성장 매니저)"]
        }
      },
      {
        "name": "행동 유도",
        "title": "{argument name=\"cta title\" default=\"바이럴을 시작할 준비가 되셨나요?\"}",
        "interactive_elements": [
          "'{argument name=\"input placeholder\" default=\"업무용 이메일\"}' 플레이스홀더가 있는 텍스트 입력 필드",
          "'{argument name=\"call to action text\" default=\"맞춤 성장 계획 받기 ->\"}' 문구의 빛나는 버튼"
        ],
        "visual": "{argument name=\"cta visual\" default=\"보라색과 파란색 불꽃을 내뿜으며 발사되는 로켓의 3D 렌더\"}"
      }
    ]
  },
  "footer": {
    "logo": "{argument name=\"brand name\" default=\"goViralX\"}",
    "columns": ["제품", "회사", "자료", "법률"],
    "social_icons": ["X", "LinkedIn", "YouTube", "Instagram"],
    "copyright": "© 2026 {argument name=\"brand name\" default=\"goViralX\"}. All rights reserved."
  },
  "global_style": {
    "rendering": "상용 제품 수준의 웹 UI 목업, 선명한 픽셀 정밀 타이포그래피, 현실적인 컴포넌트 간격, 현대적인 웹 디자인",
    "typography": "현대 산세리프체(Inter / Space Grotesk 느낌), 섹션별 크기 위계를 분명히 함",
    "color_tone": "{argument name=\"color tone\" default=\"짙은 남색 / 차콜 배경, 네온 보라 + 일렉트릭 블루 강조, 본문은 90% 흰색\"}",
    "components": "모서리 반경 12~16px, 부드러운 글래스모피즘 카드, 은은한 그림자, 강조색 그라데이션 버튼",
    "browser_chrome": "{argument name=\"chrome\" default=\"없음, 페이지 자체만 표시\"}"
  },
  "constraints": {
    "must_keep": [
      "6개 섹션을 위에서 아래 순서대로 명확히 구분하고 각 섹션을 독립적으로 인식 가능",
      "각 섹션의 내부 구성 요소가 일반 웹 디자인에 맞음(카드 / 그리드 / 타임라인 / 차트)",
      "데이터가 읽히고 글꼴이 선명하며 대비가 충분함",
      "PPT 콜라주가 아니라 실제 스크롤 가능한 웹페이지 스크린샷처럼 보여야 함"
    ],
    "avoid": [
      "섹션 사이 시각적 구분이 없어 서로 섞임",
      "차트를 실제 데이터 시각화가 아닌 장식 그림처럼 표현",
      "로고 월의 브랜드명을 읽기 어려움",
      "CTA 버튼 색이 페이지 팔레트와 충돌",
      "히어로가 전체 높이의 80% 이상을 차지해 뒤쪽 섹션이 눌림"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: 브랜드 이름 + 사업 소개, 핵심 데이터 값, 색상 방향
- **기본값 지정 가능**: 내비게이션 항목, 바닥글 열, 통계 라벨(업종에 따라 추천)
- **무작위 지정 가능**: 고객 로고 목록의 구체적인 브랜드(업종에 맞는 실제 브랜드 이름 사용), 추천사 문구

### 자동 완성 전략

- 사용자가 "마케팅 사례 연구 랜딩 페이지"만 말하면 다크 + 네온 방향과 표준 6섹션 구성을 기본으로 사용합니다.
- 핵심 데이터(예: "3일 동안 조회수 1,000만")를 받으면 통계 라벨 / 차트 / 전략 타임라인을 자동으로 추론합니다.
- 고객 로고를 지정하지 않으면 업종에 맞는 실제 브랜드 이름 8개를 생성합니다(가짜 이름을 만들지 않음).

## 변형 1: SaaS 제품 공식 홈페이지(기능 중심)

📝 프롬프트

```json
{
  "type": "SaaS 제품 홈페이지 목업",
  "section_count": 7,
  "sections": [
    "히어로(헤드라인 + 부제 + CTA + 대시보드 스크린샷)",
    "로고 띠(고객 로고 8개)",
    "기능 그리드(아이콘 + 제목 + 설명으로 구성된 3x2 = 기능 6개)",
    "작동 방식(3단계 절차)",
    "제품 스크린샷 쇼케이스(대형 대시보드 이미지 하나)",
    "가격(요금제 비교 표 3단계)",
    "추천사 + CTA"
  ],
  "theme": "{argument name=\"theme\" default=\"깔끔한 흰색 + 파란 강조, 현대적인 스타트업 스타일\"}",
  "must_have": "히어로에 제품 UI 스크린샷 하나를 크게 포함하고 쇼케이스 섹션에 대시보드 이미지 하나 추가"
}
```

### 이 변형을 선택할 때

- 마케팅 사례 연구가 아니라 SaaS 제품 공식 웹사이트를 만들 때
- 제품 화면이 어떻게 생겼는지 보여 줘야 할 때(스크린샷 안의 스크린샷)
- 가격표가 필요한 경우

## 변형 2: 투자자 / 고객 덱의 웹페이지 버전

📝 프롬프트

```json
{
  "type": "투자자 / 고객 피치 덱을 장문 랜딩 페이지로 표현",
  "section_count": 8,
  "sections": [
    "히어로(문제 제기)",
    "솔루션 개요",
    "시장 규모(차트)",
    "제품 데모(스크린샷)",
    "성과(핵심 지표 + 성장 차트)",
    "팀(아바타 4개 + 역할)",
    "로드맵(4단계 타임라인)",
    "요청 사항 + 연락처"
  ],
  "theme": "전문적이고 고급스러우며 약간 에디토리얼, 부드러운 그림자 + 밝은 그리드 배경",
  "tone": "신뢰할 수 있고 야심차며 데이터에 기반"
}
```

### 이 변형을 선택할 때

- 창업자가 데모데이 제안서를 웹페이지 버전으로 만들 때
- Keynote 덱을 공유 가능한 웹 목업으로 바꿀 때
- 시장 / 팀 / 요청 사항 등 전통적인 덱 구성 요소가 모두 필요할 때

## 변형 3: 글래스모피즘 + 그라데이션(2026년 유행 스타일)

📝 프롬프트

```json
{
  "type": "글래스모피즘 랜딩 페이지",
  "theme_override": {
    "background": "떠 있는 흐림 구체가 있는 짙은 보라색에서 분홍색으로 이어지는 그라데이션",
    "cards": "20px backdrop-blur와 불투명도 20%의 1px 흰색 테두리를 적용한 반투명 유리 효과",
    "accents": "네온 초록과 선명한 핑크 빛",
    "typography": "매우 굵은 산세리프 헤드라인, 매우 가는 본문 글꼴"
  },
  "section_count": 5,
  "sections": ["히어로", "기능 카드 3개", "통계", "추천사", "CTA"],
  "vibe": "Y2K x Apple Vision Pro x Linear.app"
}
```

### 이 변형을 선택할 때

- 디자인 중심 브랜드 / AI 도구 / 창의적인 제품
- SNS에서 디자이너의 공유를 유도하고 싶을 때
- 고객이 기업형 안정감보다 "시각적 놀라움"을 원할 때

## 피해야 할 사항

- ❌ 섹션 사이 구분이 모호함 → 80~120px 여백 + 색상 / 배경의 미묘한 차이 필요
- ❌ 차트를 순수 장식으로 그림(실제 데이터 곡선처럼 보여야 함)
- ❌ 로고 월에 가짜 브랜드명을 억지로 만듦(실제 유명 브랜드를 쓰거나 "예시"라고 분명히 표기)
- ❌ CTA 버튼 색이 브랜드 색과 충돌 → 브랜드 색의 강조 변형을 사용
- ❌ 히어로가 너무 커서 다음 섹션을 눌러 버림(전체 높이의 35% 이하 권장)
- ❌ 페이지 전체에서 글자 크기를 하나만 사용 → H1 / H2 / 본문 / 캡션 등 위계 최소 4단계 필요
- ❌ 템플릿 자리표시자("VIEW DETAIL")를 그대로 둠 → 실제 문구로 교체
- ❌ 출력 비율을 잘못 선택(1:1에는 긴 페이지가 들어가지 않으므로 3:4 / 9:16 권장)
