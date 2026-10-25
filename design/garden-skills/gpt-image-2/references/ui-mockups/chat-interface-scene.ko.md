# 채팅 인터페이스 / 대화 말풍선 장면 템플릿

이 문서는 "채팅 앱 인터페이스 + 대화 말풍선 + 캐릭터 아바타" 목업을 만들 때 사용합니다. 다음과 같은 용도에 적합합니다.

- WeChat / iMessage / WhatsApp / Discord 스타일 채팅 스크린샷
- 대화형 밈
- 캐릭터끼리 대화하는 "가상 채팅" 시나리오 이미지
- 고객 지원 대화 목업
- 심리 상담 / 교육 장면의 대화 시연
- AI 어시스턴트 대화 인터페이스 시연

`live-commerce-ui.md`와의 차이:

- 라이브 방송 UI: 인물 영상이 중심이고 UI를 위에 겹침
- 채팅 인터페이스: 말풍선 + 아바타가 중심이며 화면 자체가 앱 안의 대화 흐름

## 적용 범위

- 일대일 채팅 스크린샷 목업
- 그룹 채팅 스크린샷 목업
- AI와 사람의 대화 화면
- 두 명 이상 캐릭터가 주고받는 대본형 대화
- 이야기형 스크린샷(예: "두 사람의 대화가 이야기를 전개")

## 사용 시점

- 사용자가 "채팅 스크린샷 / 대화 목업 / WeChat 채팅 / iMessage / 그룹 채팅 목업"을 언급할 때
- 둘 이상의 캐릭터가 대화하기를 원할 때
- 밈으로 쓰기 좋은 대화 흐름을 원할 때
- AI 어시스턴트 / 고객 지원 대화 시연을 원할 때

다음에는 사용하지 마세요.

- 소셜 플랫폼 게시물(`social-interface-mockup.md` 사용)
- 라이브 스트리밍 화면(`live-commerce-ui.md` 사용)

## 누락 정보 확인 우선순위

1. 플랫폼 스타일: iMessage, WeChat, WhatsApp, Discord, 일반 메신저, AI 어시스턴트
2. 색상 모드: 라이트 / 다크
3. 대화 캐릭터: 인원수와 각 인물의 정체성
4. 대화 주제: 구체적 장면(말다툼 / 고백 / 업무 논의 / 역할극 / AI 질의응답)
5. 이모지, 스티커, 송금 카드, 음성 메시지 등 리치 미디어가 필요한지 여부
6. 대화 내용을 자동으로 만들어도 되는지 여부

## 기본 템플릿: 2인 채팅 스크린샷

📖 설명

메신저 앱에서 두 사람이 대화하는 것처럼 사실적인 화면을 만듭니다. 상단 헤더, 스크롤 대화 흐름, 하단 입력 바를 포함합니다.

📝 프롬프트

```json
{
  "type": "모바일 2인 채팅 스크린샷 목업",
  "goal": "콘텐츠 아이디어, 대본 시연, 캐릭터 대화 비주얼에 쓸 수 있는 사실적인 채팅 스크린샷 스타일 이미지 생성",
  "platform": {
    "name": "{argument name=\"platform\" default=\"iMessage\"}",
    "color_mode": "{argument name=\"color mode\" default=\"light\"}",
    "language": "{argument name=\"interface language\" default=\"중국어\"}"
  },
  "header": {
    "status_bar": "상단 상태 바: 시간 '{argument name=\"status time\" default=\"21:42\"}', 신호, Wi-Fi, 배터리",
    "navigation": {
      "back": "뒤로 가기 화살표",
      "contact_avatar": "{argument name=\"contact avatar\" default=\"상대방 아바타\"}",
      "contact_name": "{argument name=\"contact name\" default=\"린선\"}",
      "online_status": "{argument name=\"online status\" default=\"온라인\"}",
      "right_actions": ["음성 통화 아이콘", "영상 통화 아이콘"]
    }
  },
  "conversation": {
    "self_alignment": "right",
    "other_alignment": "left",
    "message_count": "{argument name=\"message count\" default=\"8\"}",
    "messages": [
      {
        "role": "other",
        "type": "text",
        "text": "{argument name=\"msg 1\" default=\"있어? 아까 그 일 생각해 봤어\"}",
        "timestamp": "21:38"
      },
      {
        "role": "self",
        "type": "text",
        "text": "{argument name=\"msg 2\" default=\"응, 말해 봐\"}",
        "timestamp": "21:39"
      },
      {
        "role": "other",
        "type": "text",
        "text": "{argument name=\"msg 3\" default=\"내일 바로 제안서를 제출하기로 했어\"}",
        "timestamp": "21:39"
      },
      {
        "role": "self",
        "type": "voice",
        "duration": "00:08",
        "timestamp": "21:40"
      },
      {
        "role": "other",
        "type": "sticker",
        "description": "귀여운 고양이가 OK 사인을 하는 스티커",
        "timestamp": "21:40"
      },
      {
        "role": "self",
        "type": "image",
        "description": "화이트보드에 그려진 마인드맵",
        "timestamp": "21:41"
      },
      {
        "role": "other",
        "type": "text",
        "text": "{argument name=\"msg 7\" default=\"이 방향 나도 동의해. 내일 9시에 보자\"}",
        "timestamp": "21:41"
      },
      {
        "role": "self",
        "type": "text",
        "text": "{argument name=\"msg 8\" default=\"좋아, 내일 아침 커피는 내가 살게\"}",
        "timestamp": "21:42"
      }
    ]
  },
  "footer": {
    "input_bar": {
      "left_icons": ["카메라", "사진", "음성"],
      "placeholder": "{argument name=\"input placeholder\" default=\"메시지 입력\"}",
      "right_icons": ["이모티콘", "+"]
    },
    "home_indicator": "하단 홈 인디케이터 막대"
  },
  "style": {
    "rendering": "고충실도 모바일 채팅 인터페이스 스크린샷, 세로 비율, 실제 휴대전화 화면처럼 보임",
    "consistency": "말풍선 색, 아바타 위치, 시간 표시가 해당 플랫폼 스타일을 엄격히 따름"
  },
  "constraints": {
    "must_keep": [
      "말풍선 좌우 정렬이 발신자 / 수신자와 일치",
      "타임스탬프가 자연스럽게 진행되고 역순이 아님",
      "중국어 텍스트를 읽을 수 있음",
      "아바타와 이름이 일치"
    ],
    "avoid": [
      "말풍선 배경과 텍스트의 대비가 낮음",
      "하루 안에서 시간이 비논리적으로 표시됨",
      "이미지와 음성 막대가 어긋남"
    ]
  }
}
```

### 매개변수 전략

- 반드시 질문: 플랫폼, 대화 당사자 정체성, 대화 주제
- 기본값 지정 가능: 상태 바 시간, 하단 입력창 아이콘, 온라인 상태
- 무작위 지정 가능: 적은 양의 분위기 메시지(스티커, 이모티콘, 이모지). 단, 주요 대화를 압도하지 않음

### 자동 완성 전략

사용자가 "대화 스크린샷 하나 만들어 줘"라고 말하면:

- 메시지는 6~10개로 제한합니다.
- "응응 좋아"만 반복하지 말고 기승전결이 있게 구성합니다.
- 각 메시지는 일반적인 메신저 길이로 제한합니다(35자 이하 권장).
- 타임스탬프는 연속적이고 자연스러워야 합니다.

## 변형 1: 그룹 채팅 목업

📝 프롬프트

```json
{
  "type": "그룹 채팅 목업",
  "platform": {
    "name": "{argument name=\"platform\" default=\"WeChat\"}",
    "color_mode": "light"
  },
  "group": {
    "name": "{argument name=\"group name\" default=\"제품팀 일상\"}",
    "member_count": "{argument name=\"member count\" default=\"12\"}"
  },
  "conversation": {
    "messages": [
      {"role": "member", "name": "Lily", "text": "오늘 요구사항 리뷰 4시 맞죠?"},
      {"role": "member", "name": "첸 엔지니어", "text": "맞아요, 회의실 A입니다"},
      {"role": "self", "text": "문서를 그룹에 업데이트했어요"},
      {"role": "system", "text": "메시지 하나를 삭제했습니다"},
      {"role": "member", "name": "PM 왕", "text": "@all 5분 일찍 와 주세요"}
    ]
  },
  "constraints": {
    "must_feel": "실제 업무 그룹 채팅처럼 보임"
  }
}
```

## 변형 2: AI 어시스턴트 대화 인터페이스

적합: AI 제품 기능 시연 스크린샷, 홍보 이미지, 교육 이미지.

📝 프롬프트

```json
{
  "type": "AI 어시스턴트 대화 인터페이스 목업",
  "platform": {
    "name": "{argument name=\"product name\" default=\"일반 AI 어시스턴트\"}",
    "color_mode": "{argument name=\"color mode\" default=\"light\"}"
  },
  "header": {
    "title": "{argument name=\"chat title\" default=\"새 대화\"}",
    "model_label": "{argument name=\"model label\" default=\"Claude Opus 4.7\"}",
    "right_actions": ["새 대화", "기록"]
  },
  "conversation": {
    "messages": [
      {
        "role": "user",
        "text": "{argument name=\"user question\" default=\"다음 회의록을 실행 항목으로 정리해 줘\"}"
      },
      {
        "role": "assistant",
        "type": "structured",
        "content": [
          "1. 실행 항목 하나: 담당자 / 마감일",
          "2. 실행 항목 둘: 담당자 / 마감일",
          "3. 실행 항목 셋: 담당자 / 마감일"
        ]
      },
      {
        "role": "user",
        "text": "{argument name=\"follow up\" default=\"팀에 보낼 이메일도 작성해 줘\"}"
      },
      {
        "role": "assistant",
        "type": "code-block",
        "language": "markdown",
        "preview": "인사말, 구조화된 핵심 항목, 서명이 포함된 이메일 본문 미리보기"
      }
    ]
  },
  "footer": {
    "input_bar": {
      "placeholder": "{argument name=\"input placeholder\" default=\"무엇이든 물어보세요...\"}",
      "right_button": "보내기"
    },
    "tools_row": ["파일 업로드", "웹", "코드", "이미지"]
  },
  "constraints": {
    "must_feel": "디자인 시안이 아니라 실제 AI 제품 스크린샷처럼 보여야 함"
  }
}
```

## 변형 3: 자동 완성 모드

사용자가 "채팅 화면 하나 만들어 줘"라고만 말할 때 적합합니다.

📝 프롬프트

```json
{
  "type": "채팅 인터페이스 자동 완성 템플릿",
  "mode": "auto-fill",
  "platform_default": "iMessage 라이트 모드",
  "scene_generation": "별도로 이야기를 요구하지 않으면 생활감 있는 대화를 기본 생성",
  "rule": "사용자가 양측 정체성을 지정하지 않으면 친구 사이의 가벼운 대화를 기본으로 설정",
  "constraints": {
    "must_feel": "자연스럽고 실제 휴대전화 스크린샷처럼 보여야 함"
  }
}
```

## 피해야 할 사항

- 대화 양측을 모두 같은 방향에 정렬하지 않습니다. 발신자와 수신자를 구분해야 합니다.
- 일부 플랫폼 예외가 아니라면 사용자 본인 메시지 쪽에 아바타를 표시하지 않습니다.
- 두 플랫폼 UI를 혼합하지 않습니다(예: iMessage 파란 말풍선 + WeChat 하단 바).
- 메시지 타임스탬프가 역순이거나 불연속적이지 않게 합니다.
- 고객 지원 / AI 어시스턴트 장면에 사적인 감정 표현을 넣지 않습니다.
- 모든 메시지를 텍스트만으로 구성하지 않습니다. 이미지 / 스티커 / 음성 막대를 적절히 섞어 현실감을 줍니다.
