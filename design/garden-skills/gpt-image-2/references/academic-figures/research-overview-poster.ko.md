# 개제 / 논문 심사 / 발표용 연구 개요 그림 템플릿

이 파일은 "개제 심사 표지 / 논문 발표 표지 / 연구실 세미나 안내 페이지용 연구 개요 그림"을 생성하기 위한 것입니다.

- 박사 / 석사 개제 심사 표지의 연구 프레임워크 그림
- 중간 / 최종 심사 표지의 개요 그림
- 세미나 / 학술 발표 PPT의 안내 페이지
- 연구실 홈페이지 / 과제 소개의 연구 개요

특징:

- 상위 수준, 읽기 쉬움, PPT 한 페이지에 적합
- 5개의 핵심 모듈: 배경 / 목표 / 연구 모듈 1 / 연구 모듈 2 / 기대 결과
- 흰색 배경, 채도가 낮은 공학용 색상, 주색 3개 이하, **상업 컨설팅 로드쇼 그림이 아닌 논문 그림의 느낌**
- 문구는 짧은 구절로 압축하며, 글자 벽은 금지

## 적용 범위

- 개제 / 중간 / 최종 심사 표지 (학술 발표)
- 세미나 안내 페이지 / 과제 발표 / 연구실 미팅 표지
- 프로젝트 승인 문서의 연구 프레임워크 그림 (학술 스타일)
- 교수 개인 홈페이지 / 연구실 홈페이지의 "current research" 영역

## 사용 시점

- 사용자가 "개제 / 심사 / 개요 그림 / 연구 프레임워크 / PPT 표지 / 안내 페이지 / 연구실 홈페이지"를 언급할 때
- 사용자가 "학술 심사 PPT 표지 스타일, 정식하고 절제되며 공학적이고, 컨설팅 로드쇼 느낌이 아닌 것"을 원할 때
- 사용자가 이미 5개 정도의 핵심 모듈을 제시할 수 있을 때

사용하지 않는 경우:

- 사용자가 원하는 것이 "학술지 투고용 Graphical Abstract"라면 → `academic-figures/graphical-abstract.md`를 사용
- 사용자가 원하는 것이 "방법 pipeline"이라면 → `academic-figures/method-pipeline-overview.md`를 사용
- 사용자가 원하는 것이 "비즈니스 / 투자자 로드쇼 표지"라면 → `slides-and-visual-docs/visual-report-page.md`를 사용
- 사용자가 원하는 것이 "브랜드 메인 비주얼 포스터"라면 → `poster-and-campaigns/brand-poster.md`를 사용

## 부족한 정보에 대한 질문 우선순위

1. 과제 / 연구 주제 (제목 영역에 표기)
2. 심사 유형 (개제 / 중간 / 최종 / 세미나 / 과제 승인) — 어조와 모듈 구성을 결정
3. 5개 핵심 모듈의 명칭 (기본값: 배경 / 목표 / 연구 내용 1 / 연구 내용 2 / 기대 결과)
4. 핵심 관점 / 핵심 질문 필요 여부 (배경 모듈 아래에 있는 것을 강력히 권장)
5. 연구 대상의 단순화된 도식 필요 여부 (입자 / 소자 / 공정 / 시스템)
6. 라벨 언어 (중국어 / 영어 / 이중 언어; 중국어 심사는 보통 중국어가 중심이며 영어 부제 가능)
7. 비율 (기본 16:9는 PPT 적합; 4:3은 구형 PPT 템플릿 적합)

## 주요 템플릿: 상·중·하 3층 + 5모듈 연구 개요

📖 설명

전체 그림은 "상단 주제 + 중간 핵심 모듈 + 하단 결과 지향"의 3개 층으로 나뉩니다. 중간 층에는 4-5개의 연구 내용 모듈이 있으며, 계층이 명확하고 정렬이 엄격한 학술 레이아웃을 보여 주어 **절대 상업 로드쇼 PPT처럼 보이지 않도록** 합니다.

📝 프롬프트

```json
{
  "type": "学术研究总览图（research overview / framework figure for thesis defense）",
  "goal": "生成一张可直接放进开题答辩 / 论文汇报 PPT 首页的研究总览图，要求正式克制、白底、工程化配色、明显论文图感、绝无商业路演感",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"16:9\"}",
    "background": "pure white #FFFFFF",
    "outer_padding": "60px around the diagram",
    "render_quality": "vector-clean look, anti-aliased edges, sharp text"
  },
  "title_block": {
    "main_title": "{argument name=\"main_title\" default=\"Research Overview\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"e.g. thesis topic in one short phrase\"}",
    "occasion_label": "{argument name=\"occasion_label\" default=\"Thesis Proposal Defense\"}",
    "position": "top-center, main_title in bold sans-serif 18-22pt, subtitle in regular 12-14pt below, occasion_label in italic gray 10pt at top-right"
  },
  "background_section": {
    "label": "{argument name=\"background_label\" default=\"Background & Problem\"}",
    "summary": "{argument name=\"background_summary\" default=\"a short phrase stating why this matters and what gap exists\"}",
    "key_question": "{argument name=\"key_question\" default=\"a single research question, expressed as one sentence ≤ 18 words\"}",
    "position": "upper-middle band, full width, visually anchored as 'context'"
  },
  "objective_section": {
    "label": "{argument name=\"objective_label\" default=\"Objective\"}",
    "summary": "{argument name=\"objective_summary\" default=\"a short phrase stating the research goal\"}",
    "position": "directly below background, narrower than background, centered"
  },
  "research_modules": {
    "count": "{argument name=\"module_count\" default=\"3\"}",
    "items": [
      {
        "id": "RM1",
        "name": "{argument name=\"module_1_name\" default=\"Characterization\"}",
        "summary": "{argument name=\"module_1_summary\" default=\"a short phrase stating what is studied / measured\"}",
        "method_hint": "{argument name=\"module_1_method\" default=\"thermogravimetric analysis\"}"
      },
      {
        "id": "RM2",
        "name": "{argument name=\"module_2_name\" default=\"Modeling\"}",
        "summary": "{argument name=\"module_2_summary\" default=\"a short phrase stating the modeling / simulation focus\"}",
        "method_hint": "{argument name=\"module_2_method\" default=\"CFD combustion model\"}"
      },
      {
        "id": "RM3",
        "name": "{argument name=\"module_3_name\" default=\"Optimization\"}",
        "summary": "{argument name=\"module_3_summary\" default=\"a short phrase stating optimization or application focus\"}",
        "method_hint": "{argument name=\"module_3_method\" default=\"parameter sweep + emission analysis\"}"
      }
    ],
    "layout": "horizontal row of equal-width modules in the central band, all modules identical size and identical style"
  },
  "expected_outcome_section": {
    "label": "{argument name=\"outcome_label\" default=\"Expected Outcomes\"}",
    "items": "{argument name=\"outcome_items\" default=\"3-4 short phrases listing deliverables, e.g. 'kinetics database', 'optimized operating window', 'engineering recommendations'\"}",
    "position": "bottom band, full width, visually distinct from research_modules but stylistically consistent"
  },
  "module_block_style": {
    "shape": "rounded rectangle (corner radius ~8px) OR stage label + thin underline",
    "size_per_module": "all modules identical size, vertically aligned",
    "fill": "very light tint (e.g. #F1F5F9, #ECFEFF) — at most 2 different tints; modules of the same role share the same tint",
    "border": "1.2px solid #334155",
    "title_text": "module name in bold sans-serif (PingFang SC / Source Han Sans for CJK; Inter / Helvetica / Arial for english), 13-14pt",
    "summary_text": "single phrase, 10-11pt regular, 1-2 lines max, no period",
    "method_hint_text": "italic gray 9-10pt, below summary"
  },
  "connectors": {
    "style": "thin arrows (1.2px) with simple triangle arrowheads, dark gray #334155",
    "rule": "vertical flow background → objective → modules → outcomes; modules are horizontally parallel (no inter-module arrows unless logically required)",
    "decoration": "none; no curved arcs, no dashed unless explicitly indicating a feedback loop"
  },
  "color_palette": {
    "rule": "≤ 3 main colors total, drawn from a low-saturation engineering set: deep blue #1E3A8A / slate blue #3B82F6 / charcoal #1F2937; allow ONE low-saturation accent (e.g. amber #F59E0B) for the outcome band only if user signaled emphasis",
    "must_print_grayscale_readable": true
  },
  "typography": {
    "language": "{argument name=\"language\" default=\"chinese\"}",
    "rule": "chinese → PingFang SC / Source Han Sans; english → Inter / Helvetica / Arial; bilingual → primary line larger, secondary line smaller and gray",
    "consistency": "all module titles identical size; all summaries identical size; never mix serif and sans-serif"
  },
  "constraints": {
    "must_keep": [
      "all research modules identical size, vertically aligned, equal weight",
      "white background, no gradient, no decorative pattern",
      "language and font consistent across the entire figure",
      "summaries are short phrases, never full paragraphs",
      "the figure must look like the cover slide of an academic defense, not a corporate roadmap or pitch deck",
      "color palette ≤ 3 main colors, must remain readable in grayscale print"
    ],
    "avoid": [
      "consulting / pitch-deck aesthetics, brand campaign aesthetics",
      "decorative icons, emoji, mascots, hand-drawn wobble",
      "3D rendering, glossy fills, lens flare, drop shadow blocks",
      "stock-photo backgrounds, photographic hero images",
      "fabricated quantitative claims (no '+30% efficiency', '150 samples' unless user provided them)",
      "saturated brand colors, neon, vivid gradients",
      "dense text walls; no module summary should exceed 2 lines",
      "watermarks, copyright stamps, university / lab logos unless explicitly requested"
    ]
  }
}
```

### 파라미터 전략

- **필수 질문**: `main_title`, 5개 핵심 모듈(배경 / 목표 / 연구 내용 1-N / 기대 결과)의 명칭
- **기본값 사용 가능**: `aspect_ratio`(16:9), `background`(흰색), `color_palette`(진한 파랑 / 회색 파랑 / 검정 회색)
- **무작위 가능**: `method_hint` 문구 (사용자가 방법명을 주었다면 학술적 표현으로 작성 가능); `occasion_label`(개제 / 중간 / 최종 / 세미나)

### 자동 보완 전략

- 사용자가 주제만 주고 모듈은 주지 않았다면 → 3-4개의 연구 모듈을 되묻고, **연구 내용을 지어내지 않습니다**
- `key_question`이 18단어를 넘으면 → 간결하게 줄이거나 2개의 하위 질문으로 나누기를 제안
- 사용자가 expected outcomes를 주지 않았다면 → "deliverable 1: ..." 같은 자리표시 문구를 사용하고, 사용자가 보완해야 함을 표시
- 사용자가 "중국어 심사 / 중국어 PPT"라고 말하면 → `language`를 기본 중국어로 하고, 주제목은 중국어 + 영어 부제(한 단계 작고 회색)로 구성

## 변형 1: 중심 주제 + 주변 모듈 (방사형)

```json
{
  "type": "中心主题 + 周围模块的研究总览",
  "modify": {
    "layout": "中央放置研究主题 / 研究对象的简化示意；周围呈环形或四象限放置 4 个研究模块；下方留出预期结果带",
    "rule": "中央对象占画面 25-30%；周围模块等大、等距、对齐严格",
    "use_case": "适合系统型 / 平台型课题，研究模块之间是平行而非前后依赖关系"
  }
}
```

적용: 플랫폼형 과제, 종합형 과제, 여러 연구 방향이 병렬로 진행되는 개요.

## 변형 2: 좌우 2단 (왼쪽 = 연구 내용, 오른쪽 = 로드맵 / 일정표)

```json
{
  "type": "左右双栏研究总览",
  "modify": {
    "layout": "左栏 = 研究内容模块（垂直堆叠 3-4 个）；右栏 = 时间表 / 路线 / 里程碑（gantt 风极简）",
    "rule": "左右栏宽度比约 3:2；右栏时间轴用细线 + 节点圆，节点旁标月份或学期",
    "use_case": "开题答辩需要明确\"做什么 + 什么时候做\"的项目计划"
  }
}
```

적용: 개제 심사, 진행 계획이 필요한 프로젝트 승인 문서.

## 변형 3: 간결판 (연구 모듈만 표시, 타임라인 / 결과 띠 없음)

```json
{
  "type": "极简研究总览",
  "modify": {
    "layout": "去掉 expected_outcome_section，去掉时间轴；只保留 title + background/key_question + 3-4 个研究模块",
    "use_case": "组会汇报引导页或 lab meeting cover，只需快速点出'这次要讲什么'"
  }
}
```

적용: 세미나 / 연구실 미팅 / 강의 발표.

## 피해야 할 사항

- 연구 개요 그림을 상업 컨설팅 로드쇼 스타일로 그리기 (어두운 배경 + 큰 색 블록 + 브랜드 색) → 즉시 "비학술적"으로 보임
- 이모지 / 상업 아이콘 / 만화 일러스트로 연구 모듈 장식
- 연구 모듈을 완전한 문단으로 쓰고, 모듈마다 2줄을 넘김 → 시각적으로 빽빽해짐
- "기대 결과"에 구체적인 백분율 / 데이터 지표를 지어내기 (**데이터 날조는 엄격히 금지**)
- 특정 연구 모듈이 다른 모듈보다 눈에 띄게 큼 (동등한 비중이어야 함)
- 채도가 높거나 그라데이션 / 유리 질감으로 배경 장식
- 사용자가 명시적으로 요청하지 않았는데 학교 / 연구실 로고나 watermark 삽입
- 방법 pipeline의 상세 그림 (`method-pipeline-overview.md`를 사용해야 함)을 개요 그림에 넣기
