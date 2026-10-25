# 시퀀스 다이어그램 템플릿

> ⚠️ **이 템플릿은 비트맵(PNG)을 생성합니다.** PlantUML / Mermaid에서 편집할 수 있는 시퀀스 다이어그램은 아닙니다.
> 편집 가능한 다이어그램이 필요하면 Mermaid / PlantUML / draw.io를 사용하세요.

이 문서는 "엔지니어링 스타일 시퀀스 다이어그램"을 만들 때 사용합니다.

- API 호출 시퀀스(프런트엔드 → 백엔드 → DB)
- 인증 / OAuth / 다단계 핸드셰이크 시퀀스
- 마이크로서비스 간 메시지 전송 시퀀스
- 분산 트랜잭션 / Saga / 2PC 시퀀스
- 클라이언트 - 서버 - 제3자 간 프로토콜 시퀀스

특징:

- 상단에 액터 상자 한 줄(이름 + 유형 아이콘)
- 각 액터 아래에 수직 점선 생명선(lifeline)
- 수평 메시지 화살표로 액터를 연결(실선 화살표는 동기, 점선은 비동기 / 반환)
- 액터의 처리 중 상태를 표시하는 활성화 막대(가는 직사각형)
- 메시지에 번호를 붙일 수 있음(1, 2, 3...)
- 어두운 그리드 배경 + 고정폭 글꼴

## 적용 범위

- API 호출 시퀀스
- 인증 / OAuth 흐름
- 마이크로서비스 메시지 시퀀스
- 분산 트랜잭션 / Saga / 2PC
- 제3자 프로토콜 / SDK 호출 흐름

## 사용 시점

- 사용자가 "시퀀스 다이어그램 / sequence diagram / 호출 순서 / API 흐름 / OAuth 흐름 / 분산 트랜잭션"을 언급할 때
- 액터 + 생명선 + 메시지 화살표를 포함하는 표준 UML 시퀀스 다이어그램을 원할 때
- 비트맵을 수용할 때

다음에는 사용하지 마세요.

- 비즈니스 흐름 / 의사결정 → `technical-diagrams/flowchart-decision.md` 사용
- 상태 머신 → `technical-diagrams/state-machine.md` 사용
- 시스템 아키텍처 → `technical-diagrams/system-architecture.md` 사용

## 누락 정보 확인 우선순위

1. 시퀀스 이름("OAuth 2.0 인증 코드 흐름 / 주문 호출 순서 / Saga 트랜잭션")
2. 참여 액터(왼쪽에서 오른쪽 순서)
3. 메시지 시퀀스(시간순, sender → receiver, 메시지 내용, 동기 / 비동기 유형 표시)
4. 실패 / 재시도 분기가 필요한지 여부
5. self-call(액터가 자신의 내부 메서드를 호출)이 필요한지 여부
6. 메시지 번호가 필요한지 여부(논문 / 프로토콜 설명에서 자주 필요)
7. 비율(기본값 가로 16:9, 액터가 많으면 4:3)

## 기본 템플릿: 표준 UML 시퀀스 다이어그램

📖 설명

이미지 상단에 액터 상자를 한 줄로 두고 각 액터 아래에 수직 점선 생명선을 그립니다. 수평 메시지 화살표로 액터를 연결하고 생명선 위에 활성화 막대를 표시합니다. 메시지 번호와 라벨은 선명하게 표현합니다.

📝 프롬프트

```json
{
  "type": "엔지니어링 스타일 시퀀스 다이어그램(UML sequence diagram)",
  "goal": "README / 블로그 / 프로토콜 문서용 엔지니어링 시퀀스 다이어그램 생성",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"16:9\"}",
    "background": "32px 간격의 은은한 1px 그리드가 있는 짙은 슬레이트 #0F172A, #1E293B",
    "outer_padding": "60px"
  },
  "title_strip": {
    "title": "{argument name=\"title\" default=\"OAuth 2.0 인증 코드 흐름\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"PKCE 사용\"}",
    "position": "왼쪽 위, JetBrains Mono / SF Mono, 연회색"
  },
  "actors": {
    "count": "{argument name=\"actor_count\" default=\"4\"}",
    "items": [
      {
        "id": "A1",
        "name": "{argument name=\"actor1_name\" default=\"사용자\"}",
        "type": "{argument name=\"actor1_type\" default=\"user\"}",
        "icon_glyph": "막대 인간 윤곽"
      },
      {
        "id": "A2",
        "name": "{argument name=\"actor2_name\" default=\"웹 앱\"}",
        "type": "{argument name=\"actor2_type\" default=\"client\"}",
        "icon_glyph": "브라우저 창 윤곽"
      },
      {
        "id": "A3",
        "name": "{argument name=\"actor3_name\" default=\"인증 서버\"}",
        "type": "{argument name=\"actor3_type\" default=\"service\"}",
        "icon_glyph": "방패 윤곽"
      },
      {
        "id": "A4",
        "name": "{argument name=\"actor4_name\" default=\"리소스 서버\"}",
        "type": "{argument name=\"actor4_type\" default=\"service\"}",
        "icon_glyph": "데이터베이스 / 서버 윤곽"
      }
    ],
    "header_box_style": {
      "shape": "모서리 반경 6px의 둥근 사각형",
      "fill": "유형별 색상 × 불투명도 12%",
      "border": "유형별 색상의 1.5px 실선",
      "size": "너비 160px × 높이 64px, 모든 헤더 크기를 통일하고 간격을 고르게 배치",
      "label": "액터 이름은 고정폭 11pt, 이름 위에 작은 아이콘 기호"
    },
    "type_color_map": {
      "user": "시안 #22D3EE",
      "client": "파랑 #60A5FA",
      "service": "에메랄드 #34D399",
      "database": "바이올렛 #A78BFA",
      "external": "슬레이트 #94A3B8"
    }
  },
  "lifelines": {
    "rule": "각 액터 헤더 아래에서 캔버스 하단까지 슬레이트 #475569 1px 수직 점선(생명선)을 그림",
    "spacing": "생명선을 같은 간격으로 놓고 간격은 최소 200px"
  },
  "messages": {
    "count": "{argument name=\"message_count\" default=\"10\"}",
    "items": [
      { "id": "M1", "from": "A1", "to": "A2", "label": "1. 'Sign in' 클릭", "type": "sync" },
      { "id": "M2", "from": "A2", "to": "A3", "label": "2. GET /authorize?code_challenge=...", "type": "sync" },
      { "id": "M3", "from": "A3", "to": "A1", "label": "3. 로그인 페이지 표시", "type": "return" },
      { "id": "M4", "from": "A1", "to": "A3", "label": "4. 인증 정보 제출", "type": "sync" },
      { "id": "M5", "from": "A3", "to": "A2", "label": "5. auth_code로 리디렉션", "type": "return" },
      { "id": "M6", "from": "A2", "to": "A3", "label": "6. POST /token { code, code_verifier }", "type": "sync" },
      { "id": "M7", "from": "A3", "to": "A2", "label": "7. { access_token, refresh_token }", "type": "return" },
      { "id": "M8", "from": "A2", "to": "A4", "label": "8. GET /api/data (Bearer token)", "type": "sync" },
      { "id": "M9", "from": "A4", "to": "A4", "label": "9. 토큰 검증", "type": "self" },
      { "id": "M10", "from": "A4", "to": "A2", "label": "10. { data: ... }", "type": "return" }
    ],
    "message_style": {
      "sync": "대상 쪽에 채워진 삼각 화살촉이 있는 슬레이트 #94A3B8 1.5px 실선",
      "async": "속이 빈 삼각 화살촉이 있는 슬레이트 #94A3B8 1.5px 실선",
      "return": "속이 빈 삼각 화살촉이 있는 슬레이트 #64748B 1.5px 점선",
      "self": "같은 생명선에서 오른쪽으로 나갔다가 돌아오는 수평 루프 화살표(괄호 형태)"
    },
    "label_format": "<번호>. <메시지 내용>. 예: '5. auth_code로 리디렉션'. 고정폭 10pt, 화살표 위 가운데에 배치"
  },
  "activation_bars": {
    "enabled": "{argument name=\"activation_bars_enabled\" default=\"true\"}",
    "rule": "액터 생명선 위에 가는 직사각형(너비 4~6px)을 그려 메시지를 처리하는 구간을 표시합니다. 액터 유형 색상을 반투명하게 사용합니다.",
    "vertical_extent": "해당 액터가 메시지를 받는 시점부터 반환 메시지를 보낼 때까지"
  },
  "annotations": {
    "notes": {
      "enabled": "{argument name=\"notes_enabled\" default=\"false\"}",
      "rule": "시퀀스 옆에 노란 메모(반투명 호박색 둥근 사각형)를 추가할 수 있습니다. 예: 'PKCE는 인증 코드 가로채기를 막음'"
    },
    "loops_alts": {
      "enabled": "{argument name=\"loops_alts_enabled\" default=\"false\"}",
      "rule": "UML alt / loop 프레임을 사용할 수 있습니다. 여러 메시지를 둥근 사각형으로 감싸고 왼쪽 위에 'alt' / 'loop' 및 조건을 표시합니다."
    }
  },
  "legend": {
    "enabled": true,
    "position": "bottom-right",
    "content": "액터 유형 → 색상, 메시지 스타일 → 의미(동기 실선 / 비동기 속 빈 화살촉 / 반환 점선 / 자기 호출 괄호 모양)",
    "style": "반투명 배경의 작은 패널, 고정폭 10pt"
  },
  "constraints": {
    "must_keep": [
      "액터 헤더의 크기 / 간격을 통일하고 수평 정렬",
      "생명선을 수직으로 그리고 간격을 통일",
      "메시지를 시간 순서대로 위에서 아래로 배치",
      "각 메시지에 번호 + 간결한 라벨 포함",
      "동기 / 반환 / 비동기 메시지를 서로 다른 화살표 스타일로 구분",
      "어두운 그리드 배경 + 고정폭 글꼴",
      "범례를 반드시 그림"
    ],
    "avoid": [
      "액터 헤더 크기가 서로 다름",
      "메시지가 시간 순서로 배열되지 않음",
      "자기 호출을 수평 직선으로 그림(괄호 / 루프 형태여야 함)",
      "반환 메시지를 실선 화살표로 표현(의미 혼동)",
      "라벨이 생명선과 겹침",
      "액터 아이콘에 이모지 사용",
      "액터가 6개 초과(혼잡해지므로 분할 고려)",
      "메시지가 15개 초과(시각적으로 과밀하므로 하위 시퀀스로 분할 고려)",
      "편집 가능한 SVG라고 주장"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: `title`, 액터 목록, 메시지 시퀀스(from / to / label / type 포함)
- **기본값 지정 가능**: `activation_bars_enabled`(true), `type_color_map`, `notes_enabled`(false), `loops_alts_enabled`(false)
- **무작위 지정 가능**: 액터 아이콘의 구체적 모양, 메시지 라벨의 작은 글자 크기 조정

### 자동 완성 전략

- 사용자가 "OAuth 흐름을 그려 줘"라고 하면 기본으로 액터 4개 + 메시지 10개(사용자 → 웹 → 인증 → 리소스)를 사용합니다.
- 동기 / 비동기 유형을 지정하지 않으면 기본은 동기입니다. 콜백 / 알림이 명확한 장면은 비동기로 설정합니다.
- "실패 재시도 포함"을 요청하면 `loops_alts_enabled`를 활성화하고 alt 블록을 추가합니다.
- "주석으로 설명 추가"를 요청하면 `notes_enabled`를 활성화합니다.
- 라이트 모드를 원하면 변형 1을 사용합니다.

## 변형 1: 라이트 모드 시퀀스 다이어그램

```json
{
  "modify": {
    "background": "은은한 그리드 #E2E8F0가 있는 따뜻한 미색 #F8FAFC",
    "actor_header_fill": "유형 색상 × 불투명도 8%",
    "actor_header_border": "흰 배경에서 한 단계 진한 색조의 1.5px 실선",
    "label_color": "짙은 슬레이트 #0F172A",
    "lifeline_color": "슬레이트 #94A3B8 점선",
    "vibe": "흰 배경 문서 / 인쇄에 적합"
  }
}
```

## 변형 2: 프로토콜 핸드셰이크 / OAuth / 인증 전용 스타일

```json
{
  "modify": {
    "messages_emphasis": "보안 / 토큰 메시지에 🔒에 해당하는 기호 또는 'TLS' / 'signed' 작은 라벨 추가",
    "extras": "메시지에 HTTP 메서드(GET/POST/PUT)를 추가 표시하고 작은 고정폭 라벨 사용",
    "annotation": "PKCE / nonce / state 설명 메모 추가, notes_enabled = true",
    "use_case": "OAuth 2.0 / OIDC / SAML / mTLS 등 프로토콜"
  }
}
```

적합: 프로토콜 교육, 인증 흐름 문서.

## 변형 3: 분산 트랜잭션 / Saga / 2PC 스타일

```json
{
  "modify": {
    "actor_types": "일반적으로 서비스 액터 4~5개 + 코디네이터 1개 + 메시지 브로커 1개",
    "messages_emphasis": "prepare / commit / rollback / compensate 단계를 명확히 표시하고 각 단계에 다른 색 사용(commit 초록, rollback 빨강, prepare 파랑)",
    "loops_alts_enabled": true,
    "alt_blocks": "관련 메시지를 alt 'commit phase' / 'rollback phase' 프레임으로 감쌈",
    "use_case": "Saga / 2PC / TCC / outbox pattern 교육 및 문서"
  }
}
```

적합: 분산 트랜잭션 패턴 교육, 아키텍처 검토, 장애 모드 분석.

## 피해야 할 사항

- 메시지가 시간 순서에 따라 위에서 아래로 배치되지 않은 시퀀스도 → 시간의 흐름을 잃음
- 액터를 다이아몬드 / 원으로 그림(사각형 헤더 사용)
- 자기 호출을 직선으로 그리기(괄호 형태 필요)
- 반환을 실선으로 표현(동기 호출과 혼동)
- 액터가 6개 초과(화면이 복잡해지므로 분할 고려)
- 메시지가 15개 초과(시각적으로 과밀해짐)
- 액터 아이콘에 이모지 사용
- 액터 프로필을 카툰 인물처럼 만들어 엔지니어링 분위기를 해침
- 활성화 막대가 없어 누가 처리 중인지 알 수 없음
- 메시지 번호 누락(교육 장면에서는 필수)
- 액터가 아니라 동작이 노드인 "업무 흐름도"를 시퀀스 다이어그램으로 표현
