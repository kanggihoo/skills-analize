# 짧은 동영상 표지 / 스트림 썸네일 UI 템플릿

이 문서는 "짧은 동영상 표지 + UI 요소" 목업을 만들 때 사용합니다. 예:

- 도우인 / 콰이쇼우 / Bilibili / 샤오홍슈 동영상 표지
- YouTube / Twitch 썸네일
- VTuber / 스트리머 라이브 표지
- 개인 미디어 프로그램 표지
- 소셜 플랫폼 짧은 동영상 표지

특징:

- 주제와 글자가 크고 정보 위계가 높음
- 눈으로 확인할 수 있는 "클릭 유도 요소"가 반드시 있어야 함
- 글자와 인물 / 주제 이미지가 강하게 겹쳐 배치됨

`live-commerce-ui.md`와의 차이:

- 라이브 방송 UI: 채팅 / 선물 / 상품을 포함한 전체 라이브 방 인터페이스를 재현
- 이 템플릿: 표지 이미지 레이어만 만들고, 시선을 끄는 제목 + 메인 비주얼에 집중

## 적용 범위

- 짧은 동영상 플랫폼 표지
- YouTube / Bilibili / Twitch 썸네일
- 프로그램 메인 비주얼
- 라이브 방송 예고 이미지
- 강좌 / 지식 동영상 표지

## 사용 시점

- 사용자가 "표지 / 썸네일 / 짧은 동영상 표지 / 동영상 첫 이미지"를 언급할 때
- 클릭률이 높은 시각 이미지가 필요할 때
- 프로그램 이름 / 제목 / 스트리머 / 주제를 제공할 때

다음에는 사용하지 마세요.

- 실제 라이브 방송 스크린샷(`live-commerce-ui.md` 사용)
- 소셜 게시물 상세 페이지(`social-interface-mockup.md` 사용)

## 누락 정보 확인 우선순위

1. 플랫폼: 도우인 / 콰이쇼우 / 샤오홍슈 / Bilibili / YouTube / Twitch
2. 콘텐츠 유형: 지식 정보 / 일상 브이로그 / 게임 / 라이브 예고 / 상업 광고 / 귀여운 콘텐츠
3. 메인 제목 문구
4. 주제(실제 인물 / 카툰 / 물건 / 추상 비주얼)
5. 스타일: 강한 대비와 눈에 띄는 디자인 / 귀여운 소녀 / 차분한 미니멀 / 다크 미스터리
6. 부제, 글머리 항목, 배지가 필요한지 여부

## 기본 템플릿: 고대비 지식 숏폼 표지

📖 설명

한 가지 주제를 명확히 설명하는 과학 정보 / 해설 영상의 표지처럼 구성합니다. 주제는 오른쪽에 두고 왼쪽에는 큰 제목, 부제, 점형 요점을 배치합니다.

📝 프롬프트

```json
{
  "type": "짧은 동영상 지식 콘텐츠 표지 목업",
  "goal": "메인 제목, 부제, 대표 비주얼, 플랫폼 스타일 작은 표시가 있는 높은 클릭률의 동영상 표지 이미지 생성",
  "platform": "{argument name=\"platform\" default=\"일반 숏폼 플랫폼\"}",
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"16:9\"}",
  "background": {
    "color_palette": "{argument name=\"color palette\" default=\"짙은 파랑 그라데이션 + 밝은 노랑\"}",
    "texture": "{argument name=\"texture\" default=\"잔잔한 노이즈 + 부드러운 빛\"}"
  },
  "main_visual": {
    "subject": "{argument name=\"main subject\" default=\"카메라를 바라보며 왼쪽 제목을 가리키는 중년 남성\"}",
    "position": "{argument name=\"subject position\" default=\"화면 오른쪽 1/3\"}",
    "expression": "{argument name=\"expression\" default=\"신뢰감이 있고 약간 놀란 표정\"}"
  },
  "title_block": {
    "main_title": "{argument name=\"main title\" default=\"99%가 모르는 ChatGPT 사용법\"}",
    "title_style": "{argument name=\"title style\" default=\"흰 바탕에 검은 굵은 고딕 + 일부 글자에 노란 외곽선 강조\"}",
    "sub_title": "{argument name=\"sub title\" default=\"효율을 10배 높이는 한 가지 방법\"}",
    "bullet_points": {
      "count": "{argument name=\"bullet count\" default=\"3\"}",
      "items": [
        "{argument name=\"bullet 1\" default=\"회의록 자동 정리\"}",
        "{argument name=\"bullet 2\" default=\"PPT 개요 일괄 생성\"}",
        "{argument name=\"bullet 3\" default=\"이메일 템플릿 한 번에 작성\"}"
      ]
    }
  },
  "platform_marks": {
    "logo_or_handle": "{argument name=\"creator handle\" default=\"@효율덕후\"}",
    "duration_label": "{argument name=\"duration\" default=\"06:24\"}"
  },
  "style": {
    "rendering": "평범한 포스터가 아니라 실제 동영상 표지처럼 보여야 함",
    "contrast": "제목은 1미터 거리에서도 읽을 수 있어야 함",
    "consistency": "전체 스타일이 일관되고 서로 충돌하는 분위기가 없어야 함"
  },
  "constraints": {
    "must_keep": [
      "메인 제목이 가장 높은 시각적 위계를 가짐",
      "대표 이미지와 제목이 서로를 가리지 않음",
      "색상 대비가 충분히 높음"
    ],
    "avoid": [
      "제목이 너무 길어 줄바꿈이 어색함",
      "주제 표정이 지나치게 과장되어 품격이 떨어짐",
      "모서리에 작은 글자가 너무 많음"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 메인 제목, 주제, 플랫폼, 스타일
- 기본값 지정 가능: 부제, 배지, 작은 라벨
- 무작위 지정 가능: 주제와 밀접하게 관련된 글머리 항목의 순서와 문구

### 자동 완성 전략

- 메인 제목이 비어 있으면 임의로 만들어 넣지 말고 반드시 질문합니다.
- 부제가 없으면 "숫자 + 동사" 형식으로 하나 생성할 수 있습니다.
- 글머리 항목은 4개 이하로 제한합니다.
- 주제의 표정은 기본적으로 "신뢰감 + 약간의 놀람"입니다.

## 변형 1: 귀여운 VTuber / 스트리머 예고 표지

📝 프롬프트

```json
{
  "type": "VTuber / 스트리머 예고 표지",
  "style": "애니메이션, 고대비의 귀여운 분홍 계열, 반짝임, 하트, 별 장식",
  "character": {
    "description": "{argument name=\"character description\" default=\"갈색 양갈래 경단 머리, 호박색 눈동자, 다정한 미소를 지은 애니메이션 소녀\"}",
    "outfit": "{argument name=\"outfit\" default=\"분홍 기모노 + 흰색 메이드 앞치마, 벚꽃 머리 장식\"}",
    "pose": "{argument name=\"pose\" default=\"장식 꽃이 달린 분홍색 마이크를 들고 있음\"}"
  },
  "layout": {
    "background": "{argument name=\"background\" default=\"분홍 그라데이션 + 반짝임 + 하트 + 리본\"}",
    "text_sections": [
      {
        "type": "상단 리본",
        "text": "{argument name=\"top ribbon\" default=\"오늘 밤 방송에서 함께 이야기해요~\"}"
      },
      {
        "type": "메인 제목",
        "text": "{argument name=\"main title\" default=\"잡담 방송\"}",
        "decorations": "주변에 복숭아 큰 일러스트 3개"
      },
      {
        "type": "가운데 리본",
        "text": "{argument name=\"middle ribbon\" default=\"여러분과 즐거운 시간을 보내고 싶어요♡\"}"
      },
      {
        "type": "하단 요점",
        "items": ["신규 시청자 환영", "선물 리액션", "ROMO"]
      },
      {
        "type": "하단 말풍선",
        "text": "댓글 환영♪ 같이 수다 떨어요"
      }
    ]
  },
  "constraints": {
    "must_feel": "실제 스트리머 예고 표지처럼 보여야 하며 팬아트 일러스트처럼 보이면 안 됨"
  }
}
```

## 변형 2: 언박싱 / 리뷰 동영상 표지

📝 프롬프트

```json
{
  "type": "언박싱 리뷰 동영상 표지",
  "platform": "{argument name=\"platform\" default=\"YouTube\"}",
  "aspect_ratio": "16:9",
  "main_visual": {
    "subject": "{argument name=\"main product\" default=\"아직 개봉하지 않은 기술 제품 포장 상자\"}",
    "host": "{argument name=\"host description\" default=\"화면 왼쪽의 상반신 스트리머, 놀라서 크게 뜬 표정\"}",
    "extras": ["상자 주위를 감싸는 빛나는 선", "포장을 일부 뜯어 궁금증을 유발"]
  },
  "title_block": {
    "main_title": "{argument name=\"main title\" default=\"전 세계 최초 공개! 직접 뜯어 봤습니다\"}",
    "sub_title": "{argument name=\"sub title\" default=\"정말 이 가격을 할까요?\"}",
    "label_badge": "{argument name=\"badge\" default=\"단독 공개\"}"
  },
  "constraints": {
    "must_feel": "강한 클릭 유도 + 궁금증"
  }
}
```

## 변형 3: 자동 완성 모드

📝 프롬프트

```json
{
  "type": "짧은 동영상 표지 자동 완성 템플릿",
  "mode": "auto-fill",
  "rule": "사용자가 주제만 주면 메인 제목, 부제, 주제 이미지, 스타일, 색상을 자동 구성하되 표지의 핵심 세 요소(메인 제목, 대표 이미지, 강한 대비)를 유지",
  "constraints": {
    "must_feel": "실제 동영상 플랫폼에서 시선을 끄는 표지처럼 보임"
  }
}
```

## 피해야 할 사항

- 제목으로 화면 전체를 채우지 않습니다(대표 이미지 공간을 남겨야 함).
- 제목과 배경의 색이 비슷하지 않게 하며 대비를 높입니다.
- 부제를 두 줄 넘게 넣지 않습니다.
- 제목으로 주제의 얼굴을 크게 가리지 않습니다.
- 여러 플랫폼의 UI 요소를 섞지 않습니다(예: YouTube 빨간 재생 버튼 + 도우인 워터마크).
- 지식 콘텐츠 표지에 이모지를 과도하게 나열하지 않습니다.
