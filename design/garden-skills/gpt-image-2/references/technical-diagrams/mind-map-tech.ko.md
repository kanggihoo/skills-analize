# 기술 주제 마인드맵 템플릿

> ⚠️ **이 템플릿은 비트맵(PNG)을 생성합니다.** XMind / MindNode / Mermaid mindmap에서 편집 가능한 마인드맵이 아닙니다.
> 편집 가능한 파일이 필요하면 XMind / MindNode / Excalidraw / Mermaid mindmap을 사용하세요.

이 문서는 "엔지니어링 스타일의 기술 주제 마인드맵"을 만들 때 사용합니다.

- 기술 스택 개요(프런트엔드 / 백엔드 / 데이터 / DevOps)
- 면접 지식 맵(암기 지식 / 시스템 디자인 / 알고리즘)
- 리서치 맵(특정 분야 조사 요약)
- 학습 로드맵
- 주제 용어집 / 개념 관계도

특징:

- 중앙 노드 = 주제(둥근 사각형 / 타원형, 강조색 적용)
- 1단계 가지 = 주요 카테고리(4~8개, 방사형 배치)
- 2 / 3단계 가지 = 하위 주제(들여쓰기 또는 중첩)
- 가지마다 다른 색상(역할별 색상 구분)
- 어두운 그리드 + 고정폭 글꼴(기존 시각 시스템 재사용)

## 적용 범위

- 기술 스택 전체 개요도
- 면접 준비 마인드맵
- 리서치 / 학습 요약 마인드맵
- 지식 체계 정리
- 개념 관계망

## 사용 시점

- 사용자가 "마인드맵 / mind map / 지식 체계 / 학습 로드맵 / 기술 스택 정리"를 언급할 때
- 중앙 주제에서 바깥으로 뻗는 표준 마인드맵 구조를 원할 때
- 비트맵 형식을 수용할 때

다음에는 사용하지 마세요.

- 엔지니어링 시스템 아키텍처 → `technical-diagrams/system-architecture.md` 사용
- ER 데이터 모델 → `technical-diagrams/er-diagram.md` 사용
- 계층형 순서도 / 단계별 절차 → `infographics/step-by-step-infographic.md` 사용
- 개요 / 목록형 슬라이드 → `slides-and-visual-docs/` 사용

## 누락 정보 확인 우선순위

1. 주제(중앙 노드에 들어갈 내용, 예: "2026 프런트엔드 엔지니어 기술 스택 / 시스템 디자인 면접 요점")
2. 1단계 가지 수(4~8개 권장)
3. 각 1단계 가지 아래의 하위 노드(각 가지당 2단계 노드 3~7개)
4. 3 / 4단계 중첩이 필요한지 여부
5. 비율(기본값 가로 16:9, 가지가 많으면 세로 3:4 가능)
6. 특정 "중점 / 필수" 노드를 강조할지 여부

## 기본 템플릿: 표준 방사형 기술 마인드맵

📖 설명

이미지 중앙에 주제 노드를 놓고, 둘레에 주요 가지 4~8개를 방사형으로 펼칩니다. 각 주요 가지에서 하위 노드 3~7개를 더 확장하며, 각 주요 가지의 모든 하위 노드는 하나의 색 계열을 공유합니다.

📝 프롬프트

```json
{
  "type": "엔지니어링 스타일 기술 마인드맵(방사형)",
  "goal": "지식 정리 / 면접 준비 / 학습 로드맵 / 기술 스택 개요에 사용할 방사형 마인드맵 생성",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"16:9\"}",
    "background": "32px 간격의 은은한 1px 그리드가 있는 짙은 슬레이트 #0F172A, #1E293B",
    "outer_padding": "60px"
  },
  "title_strip": {
    "title": "{argument name=\"title\" default=\"프런트엔드 엔지니어 기술 스택\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"2026년판\"}",
    "position": "왼쪽 위, JetBrains Mono / SF Mono, 연회색"
  },
  "central_node": {
    "label": "{argument name=\"central_label\" default=\"프런트엔드\\n엔지니어\"}",
    "shape": "모서리 반경 16px의 둥근 사각형 또는 타원",
    "size": "260×120px",
    "fill": "호박색 #FBBF24 × 불투명도 18%",
    "border": "호박색 #FBBF24의 2px 실선",
    "label_style": "가운데 정렬된 굵은 고정폭 16pt, 밝은 텍스트",
    "position": "이미지 중앙"
  },
  "primary_branches": {
    "count": "{argument name=\"primary_count\" default=\"6\"}",
    "items": [
      { "id": "B1", "label": "언어", "color": "시안 #22D3EE", "angle_position": "왼쪽 위" },
      { "id": "B2", "label": "프레임워크", "color": "파랑 #60A5FA", "angle_position": "오른쪽 위" },
      { "id": "B3", "label": "상태 및 데이터", "color": "에메랄드 #34D399", "angle_position": "오른쪽" },
      { "id": "B4", "label": "빌드 및 도구", "color": "바이올렛 #A78BFA", "angle_position": "오른쪽 아래" },
      { "id": "B5", "label": "테스트", "color": "로즈 #FB7185", "angle_position": "왼쪽 아래" },
      { "id": "B6", "label": "성능", "color": "주황 #FB923C", "angle_position": "왼쪽" }
    ],
    "branch_node_style": {
      "shape": "모서리 반경 10px의 둥근 사각형",
      "size": "180×56px",
      "fill": "가지 색상 × 불투명도 14%",
      "border": "가지 색상의 1.5px 실선",
      "label": "가운데 정렬된 굵은 고정폭 13pt, 밝은 텍스트",
      "position": "중앙 노드를 기준으로 반경 약 380~440px에 고르게 분포"
    },
    "connector_style": "중앙 노드에서 주요 노드까지 이어지는 2px 굵기의 가지 색상 곡선"
  },
  "secondary_nodes": {
    "rule": "각 주요 가지마다 보조 노드 3~7개를 매답니다. 주 가지 방향을 따라 나뭇가지처럼 펼칩니다.",
    "items_per_primary_example": {
      "B1_Languages": ["TypeScript", "JavaScript (ES2024+)", "WebAssembly", "CSS / Sass"],
      "B2_Frameworks": ["React 19", "Next.js 15", "Vue 3", "Svelte 5", "Solid"],
      "B3_State_Data": ["TanStack Query", "Zustand", "Jotai", "URQL / Apollo", "tRPC"],
      "B4_Build_Tooling": ["Vite", "Turbopack", "Bun", "pnpm + Turborepo", "Biome"],
      "B5_Testing": ["Vitest", "Playwright", "Storybook", "MSW"],
      "B6_Performance": ["Core Web Vitals", "RUM", "번들 분석", "이미지 / 글꼴 최적화"]
    },
    "secondary_node_style": {
      "shape": "모서리 반경 8px의 둥근 사각형",
      "size": "텍스트에 맞춤 + 12px 패딩, 일반적으로 약 140×40px",
      "fill": "가지 색상 × 불투명도 8%",
      "border": "가지 색상의 1.2px 실선(채도를 약간 낮춤)",
      "label": "고정폭 보통 11pt"
    },
    "connector_style": "주요 노드에서 보조 노드까지 이어지는 1.2px 가는 가지 색상 곡선"
  },
  "tertiary_nodes": {
    "enabled": "{argument name=\"tertiary_enabled\" default=\"false\"}",
    "rule": "true인 경우 보조 노드 아래에 3단계 노드를 2~3개씩 더 펼칠 수 있습니다(더 작은 둥근 사각형 + 더 가는 선). 시각적으로 과밀해지지 않도록 1~2개의 보조 노드에서만 확장을 권장합니다."
  },
  "highlights": {
    "must_know": {
      "enabled": "{argument name=\"must_know_enabled\" default=\"false\"}",
      "rule": "true인 경우 필수 / 중요 노드 앞에 '★'를 붙이고 테두리를 2.5px로 굵게 표시",
      "examples": ["★ React 19", "★ TypeScript", "★ Vite"]
    }
  },
  "legend": {
    "enabled": true,
    "position": "bottom-right",
    "content": "가지 색상 → 카테고리 대응, 별표 → 필수 항목",
    "style": "반투명 배경의 작은 패널, 고정폭 10pt"
  },
  "constraints": {
    "must_keep": [
      "중앙 노드는 하나이며 가운데 배치",
      "주요 가지가 중앙 주위에 고르게 분포(한쪽만 빽빽하거나 비지 않게 함)",
      "각 가지 색 계열을 모든 하위 노드에서 유지",
      "보조 노드는 해당 주요 가지의 확장 방향에 정확히 배치",
      "어두운 그리드 배경 + 고정폭 글꼴",
      "노드 크기로 위계 표현(중앙 > 주요 > 보조 > 3단계)",
      "연결선은 서로 교차하지 않음(불가피한 경우 제외)"
    ],
    "avoid": [
      "모든 노드 크기가 같아 계층이 사라짐",
      "주요 가지가 한쪽에 몰려 시각 균형이 깨짐",
      "보조 노드 색상이 소속 주요 가지와 다름",
      "연결선이 많이 교차해 가독성 붕괴",
      "주제상 필요하지 않은 이모지 노드 아이콘",
      "주요 가지 8개 초과(복잡하면 하위 마인드맵으로 분할)",
      "3단계 이하의 모든 중첩을 펼쳐 시각적 과밀 발생",
      "3D / 그라데이션 / 유리 질감 사용",
      "편집 가능한 SVG라고 주장"
    ]
  }
}
```

### 매개변수 전략

- **반드시 질문**: `title`, `central_label`, 주요 가지 목록(이름 포함), 각 주요 가지의 보조 목록
- **기본값 지정 가능**: `background`(어두운 그리드), `primary_branches.color`(기본 6색 조합), `tertiary_enabled`(false), `must_know_enabled`(false)
- **무작위 지정 가능**: 주요 가지의 `angle_position`(가지 수에 따라 자동으로 등간격 배치), 겹침을 피하기 위한 노드 위치의 미세 조정

### 자동 완성 전략

- 사용자가 "주제 + 가지 4~6개"를 주면 가지마다 기본 보조 노드 4개를 자동으로 추가합니다.
- 사용자가 "프런트엔드 기술 스택 마인드맵"을 원하면 기본 6개 가지(언어 / 프레임워크 / 상태·데이터 / 빌드 / 테스트 / 성능)를 사용합니다.
- 색상을 지정하지 않으면 역할 순서에 따라 6색을 자동 할당합니다.
- 사용자가 "중요 항목 표시 추가"를 요청하면 `must_know_enabled`를 활성화합니다.
- 라이트 모드를 원하면 변형 1을 사용합니다.

## 변형 1: 밝은 배경 마인드맵

```json
{
  "modify": {
    "background": "은은한 그리드 #E2E8F0이 있는 따뜻한 미색 #F8FAFC",
    "node_fill": "가지 색상 × 불투명도 6%",
    "node_border": "흰 배경용으로 한 단계 짙은 색상의 1.5px 실선",
    "label_color": "짙은 슬레이트 #0F172A",
    "connector_color": "가지 색상(짙은 색조)",
    "vibe": "흰 배경 문서 사이트 / 인쇄에 적합"
  }
}
```

## 변형 2: 계층형 트리 다이어그램(왼쪽에서 오른쪽)

```json
{
  "modify": {
    "layout": "방사형 구도를 좌→우 트리로 변경: 중앙 노드는 맨 왼쪽, 주요 노드는 오른쪽 두 번째 열에 세로로 배열, 보조 노드는 세 번째 열에 배치하는 식으로 확장",
    "use_case": "전체 개요보다는 학습 로드맵 / 지식 계층에 더 적합",
    "vibe": "XMind 논리 차트 뷰와 비슷한 느낌"
  }
}
```

적합: 학습 로드맵, 지식 위계, 의사결정 트리형 지식.

## 변형 3: 조직 / 팀 구조 마인드맵

```json
{
  "modify": {
    "central_label": "팀 / 회사 / 조직 이름",
    "primary_branches": "부서 / 기능(Engineering / Design / Product / Ops / Marketing)",
    "secondary_nodes": "구체적인 역할 / 팀원('이름 · 직함' 형식)",
    "highlights_extra": "팀 리드는 ★ 표시 + 굵은 테두리",
    "use_case": "팀 소개 덱, 조직 구조 문서"
  }
}
```

적합: 팀 / 조직 구조 소개, 신규 입사자 온보딩 문서.

## 피해야 할 사항

- 주요 가지가 캔버스 한쪽에 몰려 시각 균형이 깨짐
- 모든 노드 크기가 같아 위계가 사라짐
- 연결선이 많이 교차해 읽기 어려움
- 보조 노드 색상이 소속 주요 가지와 달라 시각적으로 혼란스러움
- 3단계 이하를 모두 펼쳐 시각적 과밀 발생
- 관련된 주제(예: 음식 마인드맵)가 아니라면 노드 아이콘에 이모지를 사용하지 않음
- 주요 가지 8개 초과 시 주제를 나누는 방안 검토
- 3D / 그라데이션 / 유리 질감 사용
- 중앙 노드가 가운데가 아니거나 여러 개임
- 시스템 아키텍처 / ER 다이어그램을 마인드맵으로 그림(의미가 맞지 않음)
- 글자가 너무 작거나 고정폭 글꼴이 빠져 엔지니어링 느낌이 사라짐
