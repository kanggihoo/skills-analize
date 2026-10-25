# 시스템 아키텍처 다이어그램 템플릿

> ⚠️ **이 템플릿은 비트맵(PNG)을 생성하며 편집 가능한 SVG / draw.io / Mermaid 다이어그램이 아닙니다.**
> 편집, 정렬, 버전 관리가 가능한 엔지니어링 다이어그램이 필요하면 Mermaid / draw.io / Excalidraw / Figma를 사용하세요.
> README 헤더 이미지 / 블로그 그림 / 문서 삽화 / PPT 표지 수준의 시각 표현이 필요하면 이 템플릿이 적합합니다.

이 문서는 "엔지니어링 스타일 시스템 아키텍처 다이어그램"을 만들 때 사용합니다.

- 전체 시스템 아키텍처(프런트엔드 + 백엔드 + DB + 캐시 + 큐 + 외부 서비스)
- 마이크로서비스 아키텍처 개요
- 멀티리전 / 다중 존 배포 아키텍처
- AI 시스템 / 데이터 파이프라인 아키텍처
- 클라우드 네이티브 아키텍처 다이어그램

특징:

- 어두운 배경(#0F172A slate-900) + 가는 그리드
- 노드는 둥근 사각형 + 반투명 어두운 채우기 + 1.5px 테두리 + 고정폭 글꼴 라벨
- 역할에 따라 색상 분류(사용자 계층 / 비즈니스 계층 / 데이터 계층 / 인프라 / 보안 / 미들웨어 / 외부)
- 방향성 데이터 흐름 화살표: 실선 화살표 = 동기, 점선 = 비동기 / 콜백
- 영역은 큰 점선 상자로 둘러쌈(VPC / 클라우드 영역 / Trust boundary)
- 글꼴: JetBrains Mono / SF Mono 등 고정폭 글꼴

## 적용 범위

- 시스템 전체 개요 아키텍처도
- 마이크로서비스 / 분산 시스템 아키텍처
- 멀티리전 / 멀티클라우드 배포 아키텍처
- 데이터 파이프라인 / AI 시스템 아키텍처
- 문서 / 블로그 삽화 / README 헤더 이미지

## 사용 시점

- 사용자가 "시스템 아키텍처 / 마이크로서비스 / 분산 / 배포 아키텍처 / 데이터 파이프라인 / AI 시스템 아키텍처 / 클라우드 아키텍처"를 언급할 때
- 엔지니어링 분위기, 어두운 배경, 그리드가 있는 baoyu-diagram 스타일을 원할 때
- 비트맵 이미지를 수용할 때(편집 가능한 형식 불필요)

다음에는 사용하지 마세요.

- 업무 순서도 / 의사결정도 → `technical-diagrams/flowchart-decision.md` 사용
- 시퀀스 다이어그램 / API 호출 흐름 → `technical-diagrams/sequence-diagram.md` 사용
- 네트워크 토폴로지(서버실 / 라우터 / 장비) → `technical-diagrams/network-topology.md` 사용
- ER 다이어그램 / 데이터 모델 → `technical-diagrams/er-diagram.md` 사용
- 논문 방법 파이프라인 → `academic-figures/method-pipeline-overview.md` 사용
- 신경망 아키텍처 → `academic-figures/neural-network-architecture.md` 사용

## 누락 정보 확인 우선순위

1. 시스템 이름 + 한 문장 설명("XX 플랫폼의 전체 아키텍처를 그려 주세요")
2. 주요 계층 / 영역(예: 프런트엔드 / 게이트웨이 / 비즈니스 서비스 / 데이터 계층 / 인프라)
3. 각 계층의 노드 목록(전체 노드 최대 8~15개, 초과하면 복잡해짐)
4. 주요 데이터 흐름 방향(사용자 요청 → ... → 응답)
5. 외부 서비스(제3자 API / SaaS)가 있는지 여부
6. 별도로 표시할 보안 / 인증 / 모니터링 컴포넌트가 있는지 여부
7. 테마 색상 선호(기본 다크, 라이트 변형 필요 여부)
8. 비율(기본값 가로 16:9; 아키텍처도는 세로형이 드묾)

## 기본 템플릿: 계층형 다크 시스템 아키텍처 다이어그램

📖 설명

이미지 전체를 계층 / 영역별로 나누고 각 계층에는 같은 색 계열의 노드를 그룹화합니다. 노드 간 화살표로 데이터 흐름을 나타내며 어두운 그리드 배경으로 엔지니어링 분위기를 연출합니다.

📝 프롬프트

```json
{
  "type": "기술 시스템 아키텍처 다이어그램(다크 엔지니어링 스타일)",
  "goal": "README / 블로그 / 디자인 문서에 사용할 엔지니어링 스타일 시스템 아키텍처 다이어그램 생성",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"16:9\"}",
    "background": "{argument name=\"background\" default=\"32px 간격의 은은한 1px #1E293B 그리드가 있는 짙은 슬레이트 #0F172A\"}",
    "outer_padding": "60px"
  },
  "title_strip": {
    "title": "{argument name=\"title\" default=\"시스템 아키텍처 개요\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"v1.0 · 2026\"}",
    "position": "왼쪽 위, 큰 고정폭 글꼴(JetBrains Mono / SF Mono), 연회색 텍스트"
  },
  "color_semantics": {
    "rule": "색상은 기술이 아니라 '역할'을 기준으로 인코딩",
    "palette": [
      { "role": "사용자 / 클라이언트 / 엣지", "color": "시안 #22D3EE", "use_for": "최종 사용자, Web, Mobile, CLI" },
      { "role": "게이트웨이 / API / BFF", "color": "파랑 #60A5FA", "use_for": "API 게이트웨이, 로드밸런서, CDN, BFF" },
      { "role": "비즈니스 서비스", "color": "에메랄드 #34D399", "use_for": "마이크로서비스, 애플리케이션 계층, 비즈니스 로직" },
      { "role": "데이터 / 영속성", "color": "바이올렛 #A78BFA", "use_for": "데이터베이스, 캐시, 오브젝트 스토리지, 검색" },
      { "role": "미들웨어 / 큐", "color": "주황 #FB923C", "use_for": "MQ, Kafka, Redis Stream, Pub/Sub" },
      { "role": "인프라 / 플랫폼", "color": "호박색 #FBBF24", "use_for": "K8s, 컨테이너 런타임, 클라우드 플랫폼" },
      { "role": "보안 / 인증", "color": "로즈 #FB7185", "use_for": "인증, 키, 감사, 방화벽" },
      { "role": "외부 / 제3자", "color": "슬레이트 #94A3B8", "use_for": "외부 SaaS, 제3자 API" }
    ]
  },
  "regions": {
    "rule": "같은 '배포 단위'에 속한 노드를 큰 점선 상자로 둘러싸고 상단에 리전 라벨 표시",
    "items": [
      { "id": "R1", "label": "{argument name=\"region1_label\" default=\"공용 엣지\"}", "color_border": "시안 점선" },
      { "id": "R2", "label": "{argument name=\"region2_label\" default=\"VPC · ap-northeast-1\"}", "color_border": "호박색 점선" },
      { "id": "R3", "label": "{argument name=\"region3_label\" default=\"데이터 플레인\"}", "color_border": "바이올렛 점선" }
    ]
  },
  "nodes": {
    "count_total": "{argument name=\"node_count\" default=\"10\"}",
    "items": [
      { "id": "N1", "label": "Web App", "role": "User / Client", "region": "R1" },
      { "id": "N2", "label": "Mobile App", "role": "User / Client", "region": "R1" },
      { "id": "N3", "label": "CDN", "role": "Gateway / API", "region": "R1" },
      { "id": "N4", "label": "API Gateway", "role": "Gateway / API", "region": "R2" },
      { "id": "N5", "label": "Auth Service", "role": "Security / Auth", "region": "R2" },
      { "id": "N6", "label": "Order Service", "role": "Business Services", "region": "R2" },
      { "id": "N7", "label": "User Service", "role": "Business Services", "region": "R2" },
      { "id": "N8", "label": "Kafka", "role": "Middleware / Queue", "region": "R2" },
      { "id": "N9", "label": "PostgreSQL", "role": "Data / Persistence", "region": "R3" },
      { "id": "N10", "label": "Redis", "role": "Data / Persistence", "region": "R3" }
    ]
  },
  "node_style": {
    "shape": "모서리 반경 8px의 둥근 사각형",
    "size": "텍스트에 맞춤 + 좌우 패딩 24px, 일반 크기 약 140px 너비 × 56px 높이",
    "fill": "역할 색상 × 불투명도 12%(반투명)",
    "border": "역할 색상의 1.5px 실선(불투명)",
    "label": "JetBrains Mono / SF Mono 12pt, 어두운 배경에서 읽기 쉽도록 역할 색상의 밝은 톤 사용",
    "icon": "노드 왼쪽 위에 작은 아이콘(선택, 역할을 나타내는 일반 기하학 기호 — 서비스는 원, DB는 원기둥, 큐는 육각형)"
  },
  "edges": {
    "sync_call": {
      "style": "대상에 작은 채워진 삼각 화살촉이 있는 슬레이트 #64748B 1.5px 실선",
      "use_for": "동기 요청 / 호출"
    },
    "async_event": {
      "style": "속이 빈 삼각 화살촉이 있는 슬레이트 #64748B 1.5px 점선",
      "use_for": "비동기 이벤트 / 메시지 발행·구독 / 콜백"
    },
    "data_flow_label": {
      "rule": "간선에 작은 선택 라벨(예: 'POST /orders' / 'order.created event')을 추가할 수 있으며 캔버스와 어울리는 배경의 고정폭 9pt 사용"
    },
    "rule_routing": "가능하면 수평 / 수직 직교로 연결하고 반드시 사선이 필요하면 각도를 30° 이하로 제한. 간선이 노드를 가로지르지 않게 함"
  },
  "legend": {
    "enabled": "{argument name=\"legend_enabled\" default=\"true\"}",
    "position": "bottom-right",
    "content": "색상 → 역할 대응(색상 견본 8개), 선 스타일 → 의미(동기 실선 vs 비동기 점선)",
    "style": "반투명 배경의 작은 패널, 고정폭 글꼴 10pt"
  },
  "constraints": {
    "must_keep": [
      "어두운 배경 + 가는 그리드",
      "기술 브랜드가 아니라 역할에 따라 색상 인코딩(예: PostgreSQL은 공식 파랑이 아니라 데이터 역할이라 바이올렛)",
      "노드의 둥근 모서리와 기준 크기 통일",
      "전체에 고정폭 글꼴 사용",
      "간선이 노드를 관통하지 않고 라벨이 선과 겹치지 않음",
      "리전 점선 상자 색상이 해당 영역의 의미와 일치",
      "범례를 반드시 표시(간략해도 됨)"
    ],
    "avoid": [
      "무지개색 / 채도 높은 네온색 사용(시안 외에는 모두 차분하게)",
      "노드 아이콘에 이모지 사용(미니멀 기하학 기호 사용)",
      "기술 로고를 직접 붙임(상표 비교 설명이 아닌 경우)",
      "3D 큐브 / 원근 효과 / 유리 질감",
      "같은 색으로 보안과 비즈니스를 표현",
      "노드 15개 초과(하위 다이어그램 여러 장으로 분리)",
      "편집 가능 / SVG 내보내기가 가능하다고 주장(비트맵 이미지임)",
      "화려한 글꼴 / 손글씨체(엔지니어링 분위기를 해침)"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: `title`, 노드 목록(각 노드의 role 포함), 주요 edges
- **기본값 지정 가능**: `background`(어두운 그리드), `color_semantics`(8개 역할 팔레트), `node_style`, `legend_enabled`(true)
- **무작위 지정 가능**: 영역 / 역할에 따른 노드 위치 자동 배치, 아이콘 기호의 구체적인 모양

### 자동 완성 전략

- 사용자가 "Web + API + DB"의 간단한 3계층 구조를 주면 Edge / Service / Data 3개 영역과 노드 5~7개를 기본으로 구성합니다.
- 리전을 지정하지 않으면 역할에 따라 자동으로 그룹화하고 영역 박스를 추가합니다.
- 라이트 변형 여부를 지정하지 않으면 기본은 다크입니다. 라이트 버전을 원하면 변형 1로 전환합니다.
- 구체적인 기술(예: "PostgreSQL 사용")을 주면 노드 라벨에 기술 이름을 직접 쓰되 색상은 역할 기준으로 선택합니다.

## 변형 1: 밝은 / 라이트 모드 시스템 아키텍처 다이어그램

```json
{
  "modify": {
    "background": "매우 옅은 그리드 #E2E8F0가 있는 따뜻한 미색 #F8FAFC",
    "node_fill": "역할 색상 × 불투명도 8%",
    "node_border": "역할 색상의 1.5px 실선(불투명)",
    "label_color": "역할 색상(불투명, 흰 배경에서 충분히 어두운 색) — 예: 시안 라벨은 cyan-300이 아니라 cyan-700 사용",
    "title_color": "짙은 슬레이트 #0F172A",
    "edges_color": "슬레이트 #475569",
    "vibe": "라이트 테마 문서 이미지 느낌(Notion / GitHub / 흰 배경 문서에 적합)"
  }
}
```

적합: 흰 배경 문서 사이트, 인쇄 문서, 다크 버전에 대한 라이트 대안.

## 변형 2: 미니멀 단색 시스템 아키텍처 다이어그램

```json
{
  "modify": {
    "color_semantics": "'현재 초점 강조'에 쓸 강조색 하나(예: 시안 #22D3EE)를 제외하고 모든 역할에 슬레이트 #94A3B8 사용",
    "use_case": "역할 구분보다 구조 자체를 강조(예: 교육 설명, 개념 도식)",
    "vibe": "절제되고 시선을 분산시키지 않는 The Verge / Stripe 블로그풍 미니멀 일러스트"
  }
}
```

적합: 개념 도식(역할 강조가 필요하지 않음), 블로그 히어로 이미지, 교육 자료.

## 변형 3: 히어로 / 마케팅 스타일 시스템 아키텍처 다이어그램

```json
{
  "modify": {
    "background": "먼 배경에 별빛이 있는 짙은 파랑·보라 그라데이션, 주요 노드에 부드러운 발광 효과",
    "node_style": "둥근 모서리와 고정폭 글꼴을 유지하되 은은한 발광(drop shadow + glow) 추가",
    "title": "더 크게 하고 부제 추가",
    "use_case": "제품 웹사이트 히어로 / 투자자 덱 / 출시 행사 대표 이미지",
    "vibe": "Stripe / Linear / Vercel 사이트 같은 시각적 임팩트"
  }
}
```

적합: 제품 웹사이트, 기술 브랜드 사이트 히어로, 제품 출시 행사 대표 이미지.

## 피해야 할 사항

- 노드 15개 초과 → 화면이 혼잡해지므로 여러 장(고수준 아키텍처 + 세부 모듈도)으로 나누는 것이 좋음
- PostgreSQL / Redis / Kafka 실제 로고 사용 → 상표 문제 및 시각 통일성 저하 위험
- "기술"별로 색상 구분(PG는 파랑, Redis는 빨강 등) → 역할 의미가 사라짐
- 노드 아이콘으로 이모지 사용
- 3D 원근 / 유리 질감 / 그라데이션 채우기 노드 사용
- 간선이 노드를 관통하거나 라벨이 충돌하거나 선이 무작위로 대각선으로 뻗음
- 범례가 없어 색상 의미를 알 수 없음
- 계층이 논리적으로 있더라도 영역 상자가 없어 "배포 단위" 정보가 사라짐
- 편집 / SVG 내보내기가 가능한 척해 사용자를 오도
- 신경망 구조 / 업무 절차 / 시퀀스까지 한 다이어그램에 넣음(각각 해당 템플릿 사용)
