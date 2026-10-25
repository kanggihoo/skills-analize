# 상태 머신 / 생애 주기 다이어그램 템플릿

> ⚠️ **이 템플릿은 비트맵(PNG)을 생성합니다.** Mermaid / XState 편집용 상태 머신은 아닙니다.
> 편집 가능한 다이어그램이 필요하면 Mermaid stateDiagram / XState visualizer를 사용하세요.

이 문서는 "엔지니어링 스타일 상태 머신 / 생애 주기 다이어그램"을 만들 때 사용합니다.

- 주문 상태 머신(결제 대기 / 결제 완료 / 배송 완료 / 완료 / 취소 / 환불)
- 연결 / 세션 상태(idle / connecting / connected / closing / closed)
- 워크플로 상태(draft / submitted / approved / rejected)
- UI 컴포넌트 상태(hover / active / disabled / loading)
- 프로토콜 상태 머신(TCP 상태, WebSocket 상태, HTTP 캐시 상태)

특징:

- 둥근 사각형 = 상태 노드
- 실선 원 = 초기 의사 상태, 과녁 / 이중 원 = 종료 상태
- 방향 간선 = 전이(transition), "이벤트 / 조건" 라벨 표기
- 자기 루프 = 해당 상태 안에서 유지됨
- 어두운 그리드 + 고정폭 글꼴(기존 시각 시스템 사용)

## 적용 범위

- 비즈니스 객체 생애 주기(주문 / 문서 / 티켓)
- 프로토콜 / 연결 상태
- 워크플로 / 승인 상태
- UI 컴포넌트 / 상호작용 상태
- 장치 / 세션 / 작업 상태

## 사용 시점

- 사용자가 "상태 머신 / state machine / 생애 주기 / lifecycle / state diagram / 상태 전이"를 언급할 때
- state + transition 구성의 UML 상태도 스타일을 원할 때
- 비트맵 이미지를 수용할 때

다음에는 사용하지 마세요.

- 의사 결정 및 동작을 포함한 업무 흐름도 → `technical-diagrams/flowchart-decision.md` 사용
- 시퀀스 다이어그램 → `technical-diagrams/sequence-diagram.md` 사용

## 누락 정보 확인 우선순위

1. 상태 머신 이름("주문 상태 머신 / TCP 상태 머신")
2. 초기 상태(대개 하나) + 종료 상태(여러 개일 수 있음)
3. 중간 상태 목록(4~12개 권장, 더 많으면 하위 상태 머신으로 분할 고려)
4. 각 전이: "출발 상태 → 도착 상태 + 트리거 이벤트 + 가드 조건 + 동작"
5. 자기 루프가 필요한지 여부
6. 복합 상태(composite state / 중첩 상태)가 필요한지 여부
7. 비율(기본값 4:3 또는 가로 16:9)

## 기본 템플릿: 표준 UML 상태 머신 다이어그램

📖 설명

실선 원인 초기 의사 상태에서 시작하고 둥근 사각형 상태 노드와 이벤트 라벨이 붙은 전이 화살표를 거쳐 과녁형 종료 상태로 이어집니다. 상태 노드는 자기 루프(예: "retry")를 가질 수 있습니다.

📝 프롬프트

```json
{
  "type": "엔지니어링 스타일 상태 머신 / 생애 주기 다이어그램(UML state diagram)",
  "goal": "비즈니스 문서 / 프로토콜 사양 / 교육 자료에 사용할 상태 머신 다이어그램 생성",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"16:9\"}",
    "background": "32px 간격의 은은한 1px 그리드가 있는 짙은 슬레이트 #0F172A, #1E293B",
    "outer_padding": "60px"
  },
  "title_strip": {
    "title": "{argument name=\"title\" default=\"주문 생애 주기 상태 머신\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"전자상거래 주문 생성에서 완료까지\"}",
    "position": "왼쪽 위, JetBrains Mono / SF Mono, 연회색"
  },
  "states": {
    "count": "{argument name=\"state_count\" default=\"7\"}",
    "items": [
      { "id": "S0", "type": "initial", "label": "" },
      { "id": "S1", "type": "state", "label": "결제\\n대기", "category": "active" },
      { "id": "S2", "type": "state", "label": "결제 완료", "category": "active" },
      { "id": "S3", "type": "state", "label": "배송 완료", "category": "active" },
      { "id": "S4", "type": "state", "label": "완료", "category": "success_terminal" },
      { "id": "S5", "type": "state", "label": "취소", "category": "fail_terminal" },
      { "id": "S6", "type": "state", "label": "환불", "category": "fail_terminal" },
      { "id": "ST", "type": "final", "label": "" }
    ]
  },
  "state_style": {
    "initial": {
      "shape": "지름 약 16px의 채워진 실선 원",
      "color": "시안 #22D3EE 단색"
    },
    "final": {
      "shape": "동심 이중 원(과녁), 바깥 지름 약 18px, 안쪽 실선 원 10px",
      "color": "로즈 #FB7185"
    },
    "state": {
      "shape": "모서리 반경 12px의 둥근 사각형(처리 노드보다 둥글게), 일반적으로 160×72px",
      "fill": "카테고리 색상 × 불투명도 12%",
      "border": "카테고리 색상의 1.5px 실선",
      "label": "어두운 채우기 위에 밝은 텍스트로 중앙 배치한 고정폭 12pt 상태 이름",
      "optional_internal_label": "선택적으로 상태 내부 아래쪽에 작은 'entry / action' / 'do / activity' / 'exit / cleanup'을 추가(UML 확장)"
    }
  },
  "category_color_map": {
    "active": "에메랄드 #34D399",
    "waiting": "호박색 #FBBF24",
    "success_terminal": "파랑 #60A5FA",
    "fail_terminal": "로즈 #FB7185",
    "error": "로즈 #FB7185",
    "neutral": "슬레이트 #94A3B8"
  },
  "transitions": {
    "items": [
      { "from": "S0", "to": "S1", "label": "create()" },
      { "from": "S1", "to": "S2", "label": "pay() [valid card]" },
      { "from": "S1", "to": "S5", "label": "timeout / cancel()" },
      { "from": "S2", "to": "S3", "label": "ship()" },
      { "from": "S2", "to": "S6", "label": "refund() [user request]" },
      { "from": "S3", "to": "S4", "label": "deliver() [confirmed]" },
      { "from": "S3", "to": "S6", "label": "return() [defect]" },
      { "from": "S4", "to": "ST", "label": "" },
      { "from": "S5", "to": "ST", "label": "" },
      { "from": "S6", "to": "ST", "label": "" },
      { "from": "S1", "to": "S1", "label": "retry_payment", "self_loop": true }
    ],
    "transition_style": {
      "default": "채워진 삼각 화살촉이 달린 슬레이트 #94A3B8 1.5px 실선",
      "self_loop": "상태 위쪽을 돌아 같은 상태로 되돌아가는 작은 루프",
      "label_format": "<이벤트> [가드] / <동작>. 예: 'pay() [valid card] / lock_inventory()'. 고정폭 9~10pt, 선 중앙에 놓고 겹치지 않게 배경을 캔버스와 일치"
    },
    "rule_routing": "가능하면 직교 또는 30° 이하 대각선으로 연결하고 간선이 노드를 관통하지 않게 함"
  },
  "composite_states": {
    "enabled": "{argument name=\"composite_enabled\" default=\"false\"}",
    "rule": "true인 경우 하위 상태를 더 큰 둥근 사각형('Active' / 'Suspended' 등) 안에 그룹화할 수 있습니다. 하위 상태는 복합 상태 경계 안에 중첩된 'state' 유형으로 표시합니다."
  },
  "legend": {
    "enabled": true,
    "position": "bottom-right",
    "content": "카테고리 색상 → 의미(active / 성공 종료 / 실패 종료 / 오류), 도형 → 역할(초기 실선 원 / 최종 과녁 / 상태 사각형), 자기 루프 표기",
    "style": "반투명 배경의 작은 패널, 고정폭 10pt"
  },
  "constraints": {
    "must_keep": [
      "initial은 실선 원, final은 과녁으로 표시하고 둘을 혼용하지 않음",
      "상태 노드의 둥근 사각형 형태와 기준 크기를 통일",
      "final 상태로 들어가는 경우 외에는 모든 transition에 label을 넣음",
      "가드 조건은 [...] 안에 표시",
      "동작은 / 기호로 구분",
      "자기 루프는 직선이 아니라 loop 형태",
      "category 색상을 의미에 맞게 통일(success=빨강, fail=초록처럼 뒤바꾸지 않음)",
      "어두운 그리드 배경 + 고정폭 글꼴",
      "범례를 반드시 표시"
    ],
    "avoid": [
      "다이아몬드 / 평행사변형을 상태로 사용(순서도와 혼동됨)",
      "transition에 label 누락",
      "final 상태를 일반 둥근 사각형으로 그림",
      "guard / action 구문을 잘못 표기([] 또는 / 누락)",
      "상태가 12개를 넘어 화면이 빽빽해짐(복합 상태로 묶거나 분리)",
      "상태 아이콘에 이모지 사용",
      "3D / 그라데이션 / 유리 질감",
      "편집 가능한 SVG라고 주장"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: `title`, 시작 상태, 종료 상태, 중간 상태 목록, 모든 transitions(from / to / label 포함)
- **기본값 지정 가능**: `background`(어두운 그리드), `category_color_map`, `legend_enabled`(true)
- **무작위 지정 가능**: 상태 간 전이 관계를 바탕으로 간선 교차를 최소화하도록 상태 노드를 자동 배치

### 자동 완성 전략

- 사용자가 세부 정보 없이 "주문 상태 머신"만 말하면 기본 7개 상태(결제 대기 / 결제 완료 / 배송 완료 / 완료 / 취소 / 환불)를 사용합니다.
- guard / action을 지정하지 않으면 label에 이벤트 이름만 씁니다.
- 상태는 주었지만 transition을 제공하지 않으면 핵심 전이를 다시 묻습니다(업무 규칙을 임의로 추정하지 않음).
- 사용자가 "상태가 너무 많다"고 하면 `composite_enabled`를 켜고 관련 상태를 composite로 묶습니다.
- 라이트 모드를 원하면 변형 1을 사용합니다.

## 변형 1: 밝은 배경 상태 머신

```json
{
  "modify": {
    "background": "은은한 그리드 #E2E8F0이 있는 따뜻한 미색 #F8FAFC",
    "state_fill": "카테고리 색상 × 불투명도 8%",
    "state_border": "흰 배경에서 한 단계 진한 색조의 1.5px 실선",
    "label_color": "짙은 슬레이트 #0F172A",
    "transition_color": "슬레이트 #475569",
    "vibe": "흰 배경 문서 / 인쇄용"
  }
}
```

## 변형 2: 프로토콜 상태 머신(TCP / WebSocket / HTTP 캐시)

```json
{
  "modify": {
    "title_format": "<protocol> State Machine(예: TCP State Machine)",
    "state_label_emphasis": "대문자 / 프로토콜 규격 용어 사용(예: LISTEN / SYN_SENT / ESTABLISHED / TIME_WAIT)",
    "transition_label_emphasis": "'수신 패킷 / 송신 패킷' 형식 사용: 예 'recv: SYN / send: SYN+ACK'",
    "use_case": "네트워크 프로토콜 교육, 규격 문서, 면접 준비 자료"
  }
}
```

적합: TCP / UDP / WebSocket / HTTP / OAuth 상태 설명.

## 변형 3: UI 컴포넌트 상태(버튼 / 입력창 / 모달)

```json
{
  "modify": {
    "title_format": "<Component> Interaction States",
    "state_label_emphasis": "UI 상태 용어 사용: default / hover / active / focus / disabled / loading / error / success",
    "transition_label_emphasis": "UI 이벤트 사용: mouseenter / click / focus / blur / API resolve / API reject",
    "category_color_map_extra": "default = slate, hover = cyan, active = emerald, disabled = 채도를 낮춘 slate, loading = amber, error = rose, success = blue",
    "use_case": "디자인 시스템 문서, 컴포넌트 라이브러리 README, 디자이너 / 개발자 간 합의"
  }
}
```

적합: 디자인 시스템, 컴포넌트 라이브러리 문서, UI / UX 상태 규격.

## 피해야 할 사항

- 상태 노드를 다이아몬드 / 평행사변형으로 표시 → 순서도와 혼동됨
- transition에 이벤트 label이 없음 → 상태 머신의 의미가 사라짐
- final 상태를 일반 사각형으로 그림 → UML과 불일치
- guard 조건에 []를 사용하지 않음 → 표기 오류
- 상태 아이콘에 이모지 사용
- 상태가 12개를 넘음 → 복잡해지므로 분리하거나 composite 사용
- 자기 루프를 직선으로 그림 → 시각적으로 부정확
- success / fail 색상을 뒤바꿈
- 상태 머신을 순서도로 만듦(노드는 동작이 아니라 상태여야 함)
- 노드 / 간선이 과도해 서로 교차함
