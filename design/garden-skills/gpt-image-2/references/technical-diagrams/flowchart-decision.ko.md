# 순서도 / 의사결정 다이어그램 템플릿

> ⚠️ **이 템플릿은 비트맵(PNG)을 생성합니다.** 편집 가능한 Mermaid / draw.io 순서도가 아닙니다.
> 편집 가능해야 한다면 Mermaid / draw.io / Excalidraw / Figma를 사용하세요.

이 문서는 "엔지니어링 스타일의 업무 순서도 / 의사결정 다이어그램"을 만들 때 사용합니다.

- 업무 순서도(사용자 등록 절차, 결제 절차, 주문 생애 주기)
- Yes / No 분기가 있는 의사결정 트리형 흐름
- 알고리즘 / 데이터 처리 흐름
- 내부 승인 / 티켓 / 신청 절차
- 예외 처리 / 오류 복구 절차

특징:

- 표준 BPMN 스타일의 도형 의미를 따릅니다:
  - 원 / 둥근 사각형 = 시작 / 종료
  - 사각형 = 처리 단계
  - 다이아몬드 = 의사결정(Yes / No 분기 포함)
  - 평행사변형 = 입력 / 출력
- 위에서 아래로 또는 왼쪽에서 오른쪽으로 흐름
- 어두운 그리드 배경 + 고정폭 글꼴(technical-diagrams 시각 시스템 재사용)
- 의사결정 분기 색상 구분(Yes는 초록, No는 빨강 / 회색)

## 적용 범위

- 업무 순서도
- 의사결정 트리
- 알고리즘 / 데이터 처리 흐름
- 오류 처리 / 예외 절차
- 문서 / 블로그용 그림

## 사용 시점

- 사용자가 "순서도 / flowchart / 의사결정도 / decision tree / 업무 절차 / 알고리즘 흐름"을 언급할 때
- Yes / No 의사결정 분기를 포함한 BPMN 표준 도형 의미를 원할 때
- 비트맵 형식을 수용할 때

다음에는 사용하지 마세요.

- 따뜻하고 카툰풍의 단계별 튜토리얼 삽화를 원하는 경우 → `infographics/step-by-step-infographic.md` 사용
- 액터 + 메시지 시퀀스 다이어그램 → `technical-diagrams/sequence-diagram.md` 사용
- 상태와 전이로 구성된 상태 머신 → `technical-diagrams/state-machine.md` 사용
- 여러 컴포넌트 배포 아키텍처 → `technical-diagrams/system-architecture.md` 사용
- 만화식 절차 장면 → `storyboards-and-sequences/recipe-process-flowchart.md` 사용

## 누락 정보 확인 우선순위

1. 절차 이름("사용자 등록 절차 / 환불 절차 / XX 알고리즘 흐름")
2. 시작 / 종료(무엇이 시작을 유발하고, 무엇이 끝인가?)
3. 주요 단계(5~12단계 권장, 더 많으면 하위 흐름으로 분할 검토)
4. 의사결정 노드(어디에 분기가 필요한지? 조건은 무엇인지?)
5. 예외 분기 / 실패 루프가 있는지 여부
6. 흐름 방향(위에서 아래 / 왼쪽에서 오른쪽)
7. 비율(위에서 아래는 3:4 또는 9:16, 왼쪽에서 오른쪽은 16:9)

## 기본 템플릿: 표준 BPMN 스타일 순서도

📖 설명

전체 흐름은 "시작 → 처리 → 결정 → 종료"라는 BPMN 도형 의미를 따르고 위에서 아래로 배치합니다. 의사결정 지점은 다이아몬드와 두 갈래로 표현하고 화살표에는 Yes / No를 표시합니다. 전체적으로 어두운 그리드 배경의 엔지니어링 스타일을 사용합니다.

📝 프롬프트

```json
{
  "type": "엔지니어링 스타일 순서도 / 의사결정 다이어그램",
  "goal": "README / 블로그 / 문서용 그림으로 쓸 수 있는 BPMN 표준 도형 기반 업무 순서도 생성",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"3:4 portrait\"}",
    "background": "32px 간격의 은은한 1px 그리드가 있는 짙은 슬레이트 #0F172A, #1E293B",
    "outer_padding": "60px"
  },
  "title_strip": {
    "title": "{argument name=\"title\" default=\"사용자 등록 절차\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"이메일 확인 포함\"}",
    "position": "왼쪽 위, JetBrains Mono / SF Mono, 연회색"
  },
  "flow_direction": "{argument name=\"flow_direction\" default=\"top-to-bottom\"}",
  "shape_legend": {
    "start_end": {
      "shape": "채워진 실선 원(시작)과 표적 / 과녁 모양 원(종료), 또는 'Start' / 'End' 라벨이 있는 완전히 둥근 알약형 사각형",
      "color": "시작은 시안 #22D3EE, 종료는 로즈 #FB7185"
    },
    "process": {
      "shape": "모서리 반경 8px 사각형",
      "color": "에메랄드 #34D399 테두리 + 12% 채우기"
    },
    "decision": {
      "shape": "다이아몬드(회전한 정사각형)",
      "color": "호박색 #FBBF24 테두리 + 12% 채우기",
      "labels": "나가는 화살표에 Yes / No 표시. 화살표 색상은 Yes = 에메랄드, No = 슬레이트"
    },
    "io": {
      "shape": "평행사변형(비스듬한 사각형)",
      "color": "바이올렛 #A78BFA 테두리 + 12% 채우기",
      "use_for": "사용자 입력, 데이터 기록, 외부 API 입출력"
    },
    "subprocess": {
      "shape": "모서리 반경 8px 사각형 안에 작은 사각형을 넣은 BPMN 하위 프로세스 표기",
      "color": "파랑 #60A5FA 테두리 + 12% 채우기",
      "use_for": "메인 흐름이 너무 커지지 않도록 하위 절차를 묶어 표시"
    }
  },
  "nodes": {
    "count": "{argument name=\"node_count\" default=\"9\"}",
    "items": [
      { "id": "S", "type": "start_end", "label": "시작" },
      { "id": "N1", "type": "io", "label": "사용자가 이메일 + 비밀번호 제출" },
      { "id": "N2", "type": "process", "label": "입력 형식 검증" },
      { "id": "N3", "type": "decision", "label": "이미 등록된 이메일인가?" },
      { "id": "N4a", "type": "process", "label": "오류 표시: 계정이 이미 존재함" },
      { "id": "N4b", "type": "process", "label": "사용자 레코드 생성" },
      { "id": "N5", "type": "process", "label": "인증 이메일 발송" },
      { "id": "N6", "type": "decision", "label": "사용자가 24시간 안에 링크를 클릭했나?" },
      { "id": "N7a", "type": "process", "label": "계정을 인증 완료로 표시" },
      { "id": "N7b", "type": "process", "label": "레코드를 소프트 삭제" },
      { "id": "E", "type": "start_end", "label": "종료" }
    ]
  },
  "edges": {
    "rule": "간선은 주축을 따라 직교로 연결(위에서 아래 흐름이면 주축은 수직), 의사결정 분기는 수평으로 펼침",
    "items": [
      { "from": "S", "to": "N1" },
      { "from": "N1", "to": "N2" },
      { "from": "N2", "to": "N3" },
      { "from": "N3", "to": "N4a", "label": "Yes" },
      { "from": "N3", "to": "N4b", "label": "No" },
      { "from": "N4a", "to": "E" },
      { "from": "N4b", "to": "N5" },
      { "from": "N5", "to": "N6" },
      { "from": "N6", "to": "N7a", "label": "Yes" },
      { "from": "N6", "to": "N7b", "label": "No" },
      { "from": "N7a", "to": "E" },
      { "from": "N7b", "to": "E" }
    ],
    "edge_style": {
      "default": "채워진 삼각형 화살촉이 달린 슬레이트 #64748B 1.5px 실선",
      "yes_branch": "에메랄드 #34D399 가는 실선 + 시작점 근처에 고정폭 9pt 'Yes' 라벨",
      "no_branch": "슬레이트 #64748B 가는 실선 + 'No' 라벨",
      "exception_branch": {
        "enabled": "{argument name=\"exception_branch_enabled\" default=\"false\"}",
        "style": "빨강 #FB7185 점선, 'Exception' / 'Error' 라벨"
      }
    }
  },
  "swim_lanes": {
    "enabled": "{argument name=\"swim_lanes_enabled\" default=\"false\"}",
    "rule": "true이면 캔버스를 액터별 세로 / 가로 레인으로 나눠 이름 표시(예: '사용자', '프런트엔드', '백엔드', '이메일 서비스'). 각 노드는 해당 액터 레인에 배치"
  },
  "legend": {
    "enabled": true,
    "position": "bottom-right",
    "content": "도형과 역할 대응(시작/종료, 처리, 결정, 입출력, 하위 프로세스) 및 간선 의미",
    "style": "반투명 배경의 작은 패널, 고정폭 10pt"
  },
  "constraints": {
    "must_keep": [
      "BPMN 도형 의미를 엄격하게 따름",
      "각 의사결정 노드에 분기가 최소 2개 이상",
      "모든 의사결정 분기에 'Yes' / 'No' 또는 구체적인 조건 표시",
      "간선을 직교로 연결하고 라벨이 간선과 겹치지 않음",
      "어두운 배경 + 고정폭 글꼴",
      "시작 노드와 종료 노드 각각 최소 하나 포함",
      "범례를 반드시 그림"
    ],
    "avoid": [
      "이모지 노드",
      "결정 노드를 원 / 사각형으로 그림(반드시 다이아몬드)",
      "처리 단계를 다이아몬드로 그림(의미 혼동)",
      "선이 무질서하게 비스듬히 뻗거나 노드를 관통함",
      "노드 15개 초과(하위 절차로 분리)",
      "의사결정 분기에 라벨 없음",
      "화려한 글꼴 / 그라데이션 채우기",
      "순서도를 일러스트처럼 그림(튜토리얼 단계 이미지는 step-by-step-infographic 사용)",
      "편집 가능한 SVG라고 주장(비트맵 이미지임)"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: `title`, 시작 + 종료, 노드 목록(type 포함), 의사결정 분기 조건
- **기본값 지정 가능**: `flow_direction`(top-to-bottom), `background`(어두운 그리드), `shape_legend`, `legend_enabled`(true)
- **무작위 지정 가능**: 노드 위치(flow_direction을 기준으로 자동 배치)

### 자동 완성 전략

- 사용자가 단계 5~7개만 제시하고 의사결정을 언급하지 않으면 기본적으로 분기 없는 선형 흐름으로 구성합니다.
- 사용자가 "예외 처리 포함"이라고 하면 `exception_branch_enabled`를 켜고 빨간 점선을 추가합니다.
- 사용자가 "다중 역할 / 부서 간 / 서비스 간"을 언급하면 `swim_lanes_enabled`를 활성화합니다.
- 사용자가 "절차가 12단계보다 길다"고 하면 하위 절차 여러 개로 나눌지 질문합니다.
- 라이트 모드를 원하면 변형 1을 사용합니다.

## 변형 1: 밝은 배경 순서도

```json
{
  "modify": {
    "background": "은은한 그리드 #E2E8F0이 있는 따뜻한 미색 #F8FAFC",
    "node_fill": "도형 역할 색상 × 불투명도 8%",
    "node_border": "완전 불투명도 1.5px 실선(흰 배경에 맞는 짙은 색조 사용)",
    "label_color": "짙은 슬레이트 #0F172A",
    "edge_color": "슬레이트 #475569",
    "vibe": "흰 배경 문서 사이트 / 인쇄물에 적합"
  }
}
```

## 변형 2: 액터별 스윔레인 순서도

```json
{
  "modify": {
    "swim_lanes_enabled": true,
    "lane_layout": "세로 레인(각 액터가 세로 열 하나를 차지)",
    "lane_labels": ["사용자", "프런트엔드", "백엔드 API", "데이터베이스", "이메일 서비스"],
    "rule": "각 노드를 해당 액터 레인에 배치하고 레인을 넘는 간선은 굵은 화살표로 표시",
    "use_case": "부서 간 승인, 서비스 간 상호작용, 사용자와 시스템의 다중 상호작용"
  }
}
```

적합: 부서 간 승인 절차, 서비스 간 상호작용, "누가 무엇을 하는지" 명확해야 하는 절차.

## 변형 3: 알고리즘 의사 코드 시각화 순서도

```json
{
  "modify": {
    "title": "Algorithm: <name>",
    "node_label_format": "자연어 대신 의사 코드 구문으로 노드 라벨 표시",
    "rule_extra": "반복 노드를 유지(되돌아가는 곡선 화살표는 loop를 나타냄), 변수 할당에는 ← 기호 사용",
    "vibe": "논문 알고리즘 박스를 시각화한 버전에 적합"
  }
}
```

적합: 알고리즘 시각화, 논문 알고리즘 절의 시각 자료, 교육 자료.

## 피해야 할 사항

- 의사결정 다이아몬드를 사각형이나 원으로 그려 의미를 혼동시키지 않습니다.
- 의사결정 분기에 Yes / No 라벨을 빠뜨리지 않습니다.
- 노드가 15개를 넘으면 시각적으로 복잡해지므로 분할을 권장합니다.
- 이모지 노드 아이콘을 사용하지 않습니다.
- 간선이 비스듬히 뻗거나 노드를 관통하거나 라벨과 충돌하지 않게 합니다.
- 카툰 일러스트를 사용하지 않습니다(`step-by-step-infographic.md` 사용).
- 3D / 그라데이션 / 유리 질감을 사용하지 않습니다.
- 여러 시작점 / 종료점을 분명히 표시합니다.
- 스윔레인에서 레인 간 화살표가 눈에 띄지 않게 하지 않습니다.
- 시스템 아키텍처를 순서도에 억지로 넣지 않습니다(아키텍처 노드는 동작이 아니라 컴포넌트입니다).
