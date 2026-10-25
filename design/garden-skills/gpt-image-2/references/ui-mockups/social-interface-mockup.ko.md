# 소셜 플랫폼 인터페이스 목업 템플릿

이 문서는 Weibo / Twitter(X) / 샤오홍슈 / Threads / Instagram 등 소셜 미디어 앱의 게시물 화면이나 댓글 영역과 같은 "소셜 미디어 앱 인터페이스 + 콘텐츠"를 고충실도로 모사하는 목업에 사용합니다.

실제 스크린샷을 만드는 것이 아니라 다음 용도입니다.

- 콘셉트 제품 비주얼
- 소셜 플랫폼에 게시물을 올린 듯한 인물 / 역사적 인물 / 가상 IP 계정
- 마케팅 시연
- 콘텐츠 아이디어 제시

## 적용 범위

- 단일 게시물 상세 페이지(트윗 / 포스트)
- 댓글 영역 목업
- 소셜 플랫폼 프로필 페이지 헤더
- 다크 / 라이트 모드 UI 시뮬레이션
- 이미지 9분할 / 다중 이미지 카드 목업

## 사용 시점

- 사용자가 "소셜 미디어 목업 / 트윗 목업 / 웨이보 목업 / Twitter 목업 / 모멘츠 목업 / 샤오홍슈 목업"을 언급할 때
- 유명인 / 캐릭터 / 가상 계정이 특정 플랫폼에 "무언가를 게시한" 것처럼 표현하고 싶을 때
- 실제 스크린샷 대신 UI와 콘텐츠를 결합한 운영 소재가 필요할 때

다음 장면에는 이 템플릿을 사용하지 마세요.

- 인물 아바타 하나만 필요한 경우
- 실제 기능을 캡처한 스크린샷을 원하는 경우
- 라이브 커머스 인터페이스(`live-commerce-ui.md` 사용)

## 누락 정보 확인 우선순위

사용자가 "소셜 플랫폼 목업을 만들어 줘"라고만 말하면 다음 순서로 질문합니다. 합칠 수 있는 질문은 묶습니다.

1. 플랫폼 스타일: Twitter/X, 샤오홍슈, 웨이보, Threads, Instagram, 일반 소셜 앱
2. 색상 모드: 다크 / 라이트
3. 계정 주체: 실제 인물 / 유명인 / 가상 인물 / 역사적 인물 / 브랜드 계정
4. 게시물 내용: 핵심 문구
5. 이미지가 필요한지, 필요하면 이미지 주제는 무엇인지
6. 좋아요 / 리포스트 / 댓글 문구 같은 상호작용 데이터를 자동 완성해도 되는지 여부

사용자가 "네가 채워 줘"라고 하면 플랫폼 스타일 + 계정 정체성 + 게시물 주제만 묻고 나머지 필드는 자동으로 채웁니다.

## 기본 템플릿: 단일 소셜 게시물 상세 페이지

📖 설명

특정 소셜 플랫폼의 게시물 상세 페이지처럼 보이는 스크린샷 목업입니다. 다음을 포함합니다.

- 상단 상태 표시줄 및 내비게이션
- 게시물 작성자 정보(아바타 / 닉네임 / 핸들 / 인증 배지)
- 게시물 본문과 선택적 해시태그
- 여러 이미지 카드(선택 사항)
- 상호작용 통계 및 작업 버튼 행
- 하단 답글 입력 바와 하단 탭 바

📝 프롬프트

```json
{
  "type": "모바일 소셜 플랫폼 게시물 상세 페이지 목업",
  "goal": "콘텐츠 목업 또는 콘셉트 시연에 쓸 수 있는 고충실도 소셜 게시물 상세 스크린샷 생성",
  "platform": {
    "name": "{argument name=\"platform\" default=\"Twitter / X\"}",
    "color_mode": "{argument name=\"color mode\" default=\"dark\"}",
    "language": "{argument name=\"interface language\" default=\"중국어\"}"
  },
  "header": {
    "status_bar": "상단 상태 표시줄에 시간 '{argument name=\"status time\" default=\"19:28\"}', 신호, Wi-Fi, 배터리 아이콘 표시",
    "navigation": "뒤로 화살표 + 제목 '{argument name=\"page title\" default=\"게시물\"}'"
  },
  "post": {
    "author": {
      "avatar": "{argument name=\"avatar description\" default=\"빨간 예복과 검은 관을 착용한 고대 중국 황제의 상반신 초상\"}",
      "display_name": "{argument name=\"display name\" default=\"주원장\"}",
      "verified_badge": true,
      "handle": "{argument name=\"handle\" default=\"@Emperor_Ming\"}",
      "extra_badges": "{argument name=\"author extra badges\" default=\"왕실 인증\"}"
    },
    "content": {
      "text": "{argument name=\"post text\" default=\"오늘 즉위하여 홍무 원년을 열었습니다. 대신들과 함께 명나라를 세워 나갑시다!\"}",
      "hashtags": "{argument name=\"hashtags\" default=\"#홍무원년 #즉위식 #명나라\"}",
      "media_grid": {
        "count": "{argument name=\"image count\" default=\"3\"}",
        "images": [
          "{argument name=\"image 1\" default=\"금빛 용좌에 앉은 황제의 정면 사진\"}",
          "{argument name=\"image 2\" default=\"궁전 안뜰 앞에서 만 명이 절하는 원경\"}",
          "{argument name=\"image 3\" default=\"황제가 말을 타고 군대를 이끄는 장면\"}"
        ]
      }
    },
    "metadata": {
      "timestamp": "{argument name=\"timestamp\" default=\"오후 1:36 · 1368년 1월 23일\"}",
      "engagement": "{argument name=\"engagement stats\" default=\"리포스트 5,432 · 인용 8,765 · 좋아요 2.01만 · 조회 10.23만\"}"
    },
    "actions": "하단 작업 아이콘 행: 답글, 리포스트, 좋아요(숫자 '1'이 붙은 빨간 하트), 공유, 업로드"
  },
  "comments_preview": {
    "show": "{argument name=\"show top comment\" default=\"true\"}",
    "top_comment": {
      "avatar": "무작위 일반 사용자 아바타",
      "name": "{argument name=\"top commenter\" default=\"홍건적 출신 라오장\"}",
      "text": "{argument name=\"top comment text\" default=\"폐하의 지혜로우신 결정입니다! 명나라 만세!\"}"
    }
  },
  "footer": {
    "reply_bar": {
      "avatar": "현재 로그인한 사용자의 작은 아바타",
      "placeholder": "{argument name=\"reply placeholder\" default=\"주원장에게 답글...\"}"
    },
    "navigation_bar": "하단 탭: 홈, 검색, 알림(빨간 점 '1' 포함), 메시지"
  },
  "style": {
    "rendering": "고충실도 모바일 UI 스크린샷, 세로 비율 약 1:2, 실제 휴대전화 화면 캡처처럼 표현",
    "consistency": "전체 팔레트는 해당 플랫폼의 공식 스타일을 엄격히 따름"
  },
  "constraints": {
    "must_keep": [
      "플랫폼 UI 위계가 명확함",
      "아바타, 닉네임, 인증 배지, 핸들을 올바르게 표시",
      "게시물 본문이 선명하고 읽을 수 있음"
    ],
    "avoid": [
      "실제 UI가 아니라 이미지를 붙인 콜라주처럼 보임",
      "비율이 잘못되어 데스크톱 웹페이지처럼 보임",
      "아바타와 닉네임이 어울리지 않음"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 플랫폼, 색상 모드, 계정 주체, 게시물 문구
- 기본값 지정 가능: 상태 표시줄 시간, 하단 탭 문구, 작업 아이콘 행
- 무작위 지정 가능: 상호작용 수치, 인기 댓글 문구, 해시태그의 보조 태그

### 자동 완성 전략

사용자가 "네가 채워 줘"라고 하면:

- 기본 시간은 오후로 설정합니다.
- 조회수와 좋아요 수는 게시물 내용의 인기도에 따라 추정합니다(틈새 콘텐츠는 K, 인기 콘텐츠는 W 단위).
- 댓글은 실제 커뮤니티 사용자 말투를 사용하고 공허한 템플릿 문구를 만들지 않습니다.
- 해시태그를 게시물 주제와 맞추고 무관한 노출용 키워드를 넣지 않습니다.

## 변형 1: 라이트 모드 + 중국어 샤오홍슈 스타일

📝 프롬프트

```json
{
  "type": "샤오홍슈 스타일 이미지 게시물 상세 페이지 목업",
  "platform": {
    "name": "샤오홍슈",
    "color_mode": "light",
    "language": "중국어"
  },
  "header": "상단에 검색창 + 아바타 + 팔로우 버튼",
  "post": {
    "author": {
      "display_name": "{argument name=\"display name\" default=\"샤오만 Maya\"}",
      "tag": "{argument name=\"author tag\" default=\"패션 | 맛집 탐방\"}"
    },
    "title": "{argument name=\"post title\" default=\"상하이 주말 시티워크 코스 공유\"}",
    "cover_image": "{argument name=\"cover image\" default=\"길을 걷는 젊은 여성의 옆모습\"}",
    "swipeable_images_count": 4,
    "body_text": "{argument name=\"body text\" default=\"안푸루 → 우캉루 → 우위안루, 총 3km...\"}",
    "tags": ["#주말사진코스", "#CityWalk", "#상하이주말어디갈까"]
  },
  "interaction_bar": "숫자가 붙은 좋아요, 저장, 댓글, 공유",
  "comments_preview": {
    "count": 3,
    "messages": [
      "자세한 가이드도 올려 주세요!",
      "저도 가 본 코스인데 사진 정말 잘 나와요",
      "착장 정보 링크 부탁해요 🔗"
    ]
  },
  "constraints": {
    "must_feel": "포스터가 아니라 실제 샤오홍슈 이미지 노트처럼 보여야 함"
  }
}
```

## 변형 2: 브랜드 공식 계정 공지

브랜드, 앱, 기업 공식 계정 스타일에 적합합니다.

📝 프롬프트

```json
{
  "type": "브랜드 공식 계정 공지 목업",
  "platform": {
    "name": "{argument name=\"platform\" default=\"Twitter / X\"}",
    "color_mode": "{argument name=\"color mode\" default=\"light\"}"
  },
  "post": {
    "author": {
      "display_name": "{argument name=\"brand name\" default=\"Anthropic\"}",
      "verified_badge": "official-gold",
      "handle": "{argument name=\"handle\" default=\"@AnthropicAI\"}"
    },
    "content": {
      "text": "{argument name=\"announcement text\" default=\"오늘 코딩과 복잡한 추론에 가장 뛰어난 모델 Claude Opus 4.7을 공개합니다.\"}",
      "media_grid": {
        "count": 1,
        "images": ["제품 출시 대표 비주얼, '{argument name=\"product name\" default=\"Claude Opus 4.7\"}' 대형 제목 포함"]
      }
    },
    "metadata": {
      "engagement": "높은 참여도 예: '리포스트 12K / 인용 36K / 좋아요 158K / 조회 2.3M'"
    }
  },
  "constraints": {
    "must_feel": "공식 계정의 정식 발표처럼 보여야 함",
    "avoid": "사적이거나 지나치게 구어적인 표현"
  }
}
```

## 변형 3: 자동 완성 모드

사용자가 "소셜 플랫폼 목업 하나 만들어 줘"라고만 말할 때 적합합니다.

📝 프롬프트

```json
{
  "type": "소셜 게시물 목업 자동 완성 템플릿",
  "mode": "auto-fill",
  "platform_generation": "사용자가 지정하지 않으면 Twitter / X, 다크 모드, 중국어 인터페이스 기본 적용",
  "author_generation": "실제 사람처럼 보이면서 무례하지 않은 계정 주체를 무작위 생성",
  "content_generation": "구체적이고 생생한 주제를 다루며 추상적이고 공허한 내용은 피함",
  "media_generation": "기본적으로 본문과 밀접한 이미지 1~3장 포함",
  "constraints": {
    "must_feel": "현실적이고 사람 냄새가 나며 믿을 수 있음"
  }
}
```

## 피해야 할 사항

- UI 요소를 텍스트만 쌓아 표현하지 않습니다. 아바타, 버튼, 아이콘이 있어야 합니다.
- 여러 플랫폼 스타일을 섞어 어떤 플랫폼인지 모호하게 만들지 않습니다.
- 게시물 본문이 스크린샷에 정상적으로 들어갈 길이를 넘지 않게 합니다(심하게 잘릴 수 있음).
- 브랜드 공식 계정에 지나치게 사적이거나 감정적인 문구를 넣지 않습니다.
- 플랫폼 공식 색상과 명백히 충돌하는 주색을 사용하지 않습니다(예: X 스타일에 순수한 샤오홍슈 빨강 사용).
