# 개념 / 원리 도식 템플릿

이 파일은 "과학 개념 / 원리 / 실험 장치" 도식을 생성하기 위한 것입니다.

- 물리 / 화학 / 생물 실험 장치 그림
- 알고리즘 / 수학 개념 도식 (attention 메커니즘, 다양체, 좌표계 등)
- 메커니즘 / 경로 / 과정 도식 (세포 경로, 화학 반응)
- 교과서 스타일의 원리도
- Nature / Science 리뷰에 나오는 "우리 분야는 대략 이렇게 작동한다" 개념도

특징:

- **자유도가 매우 높음**: 과학 도식은 하나하나 모양이 달라서 pipeline / network처럼 격자화할 수 없음
- 매우 단순한 흰색 / 옅은 회색 배경
- 기하학적 정확성: 눈금자 / 좌표축 / 각도가 정렬됨
- 단순화하되 카툰이 아닌 스타일 (과학적 엄밀성 유지)
- 주석선 + 번호 + 수식
- 출판물 글꼴 (Helvetica / Inter / 수학 수식용 Computer Modern)

> 설계 판단: **이런 그림은 자유도가 매우 높고 변형이 다양하므로, 억지로 JSON으로 만들면 오히려 구도를 제한합니다**. 이 템플릿은 「**구조화된 자연어 프롬프트 + 핵심 파라미터 + 예시**」의 혼합 형식을 사용하여, 제약은 잡되 구도는 고정하지 않습니다.

## 적용 범위

- 실험 장치 도식 (광학 / 역학 / 유체 / 화학 반응기)
- 생물 메커니즘 / 경로 / 해부 도식
- 알고리즘 / 수학 개념 시각화 (attention / convex set / manifold / 좌표 변환)
- 물리 과정 도식 (파동 / 장 / 입자 궤적)
- 리뷰 논문의 "분야 전체 개관" 개념도

## 사용 시점

- 사용자가 "schematic / illustration / 示意图 / 原理图 / 实验装置 / 机制图 / Nature 스타일 / 교과서 스타일"을 언급할 때
- 사용자가 "자유로운 구도, 흰색 배경, 기하학적 정확성, 학술적 느낌"을 원할 때
- 사용자의 내용이 "단일 개념 / 단일 장치 / 단일 메커니즘"이며 "pipeline / 네트워크 / 다중 방법"이 아닐 때

사용하지 않는 경우:

- 사용자가 원하는 것이 "방법 pipeline"(다단계 흐름)이라면 → `academic-figures/method-pipeline-overview.md`를 사용
- 사용자가 원하는 것이 "신경망 아키텍처"라면 → `academic-figures/neural-network-architecture.md`를 사용
- 사용자가 원하는 것이 "데이터 차트"라면 → `academic-figures/publication-chart.md`를 사용
- 사용자가 원하는 것이 "손으로 그린 카툰 도식"이라면 → `infographics/hand-drawn-infographic.md`를 사용
- 사용자가 원하는 것이 "어린이 과학 교육물"이라면 → `scenes-and-illustrations/picture-book-scene.md`를 사용

## 부족한 정보에 대한 질문 우선순위

1. 어떤 개념 / 장치 / 메커니즘을 설명하는가? (한 문장 정의)
2. 주체는 무엇인가? (중앙의 핵심 실체 — 분자 / 세포 / 렌즈 / 반응기 / 행렬 / ...)
3. 보조 요소는? (주석선 / 수식 / 좌표 / 파라미터)
4. 스타일 성향 (Nature 리뷰 스타일 / 교과서 스타일 / 상위 학회 논문의 엄숙한 스타일 / BioRender 친화 스타일)
5. 수학 수식 주석이 필요한가? 필요하다면 어떤 수식인가?
6. 중영문 여부 (기본은 영어)
7. 비율 (논문에서 자주 쓰는 1:1, 4:3, 16:9)

## 주요 템플릿: 과학 개념 / 원리 도식 (자연어 구조화)

📖 설명

전체 그림은 하나의 중심 개념 / 장치 / 메커니즘을 중심으로 전개되며, 극도로 단순한 기하 요소 + 주석선 + 수식 + 보조 색상으로 구성되어 출판물 수준의 명확성과 엄밀성을 달성합니다.

📝 프롬프트 (구조화된 자연어 템플릿)

```
A scientific schematic illustration in the style of {argument name="reference_style" default="a Nature / Science methods figure"}.

CORE CONCEPT
The figure illustrates: {argument name="core_concept" default="how cross-attention works between a query sequence and a key/value sequence"}.

CENTRAL SUBJECT
The visual centerpiece is {argument name="central_subject" default="a 2D matrix grid representing query × key dot products, with arrows feeding in queries from the left and keys from the top"}.

SUPPORTING ELEMENTS
{argument name="supporting_elements" default="(1) a softmax curve diagram on the right showing how raw scores become attention weights; (2) a small inset showing the resulting weighted sum producing the output"}.

Each supporting element is positioned with deliberate spacing and connected to the central subject by thin labeled arrows or leader lines.

ANNOTATIONS
- Use leader lines (thin black, no arrowheads or tiny arrowheads) to label specific parts of the central subject.
- Each label is in {argument name="label_font" default="11pt sans-serif (Helvetica / Inter / Arial)"}.
- {argument name="annotation_count" default="4-6"} labels total — do NOT overcrowd.
- Use lowercase italic letters (a, b, c) for sub-figure labels in the top-left of each panel.

EQUATIONS
{argument name="equations_list" default="Show one or two key equations near the relevant region. Use Computer Modern / serif math font, italic variables. Example: Attn(Q,K,V) = softmax(QK^T / √d_k) V"}

Equations should be small but readable, placed adjacent to the part of the figure they explain (not floating in the corner).

COLOR PALETTE
- Limit total to {argument name="color_count" default="3-4"} muted, academic colors:
  - {argument name="primary_color" default="deep blue #1E3A8A"} — for the central subject
  - {argument name="secondary_color" default="warm orange #D97706"} — for the highlighted / contrasting flow
  - {argument name="neutral_color" default="medium gray #475569"} — for annotation lines and supporting structures
  - white background, near-white shading for sub-regions
- The figure must remain readable when printed in grayscale: rely on shape and labels, not color alone.

LAYOUT
- {argument name="layout_style" default="single-panel, central subject occupies ~60% of the canvas, supporting elements arranged around it"}.
- Generous whitespace (~25% of canvas), rigorous alignment to an invisible grid.
- Aspect ratio: {argument name="aspect_ratio" default="4:3"}.

STYLE ENFORCEMENT
- Crisp vector-clean lines (no anti-aliasing artifacts, no jitter)
- All shapes are geometrically precise (perfect circles, exact angles)
- All text typeset, NEVER hand-drawn lettering
- Background pure white #FFFFFF or very light gray
- NO 3D extrusion, NO drop shadow, NO gradient fill, NO glossy highlight
- NO cartoon characters, NO emoji, NO decorative ornaments
- Should look like it was generated with TikZ / Inkscape / Adobe Illustrator for a peer-reviewed publication

CAPTION (optional, drawn below figure)
{argument name="caption_text" default="Figure 2. Illustration of the cross-attention mechanism. Queries (Q) attend to keys (K) via scaled dot-product, producing attention weights that aggregate values (V)."}
```

### 파라미터 전략

- **필수 질문**: `core_concept`, `central_subject`에 대한 최소 한 문장 설명
- **기본값 사용 가능**: `reference_style`(Nature methods 스타일), `color_count`(3-4), 색상 세트(진한 파랑 + 주황 + 회색), `label_font`, `aspect_ratio`
- **무작위 가능**: annotation 배치 각도, leader line의 방향(핵심 내용을 피해야 함), equations 사용 여부

### 자동 보완 전략

- 사용자가 "attention 메커니즘 도식을 그리고 싶다"고만 말하고 세부 내용이 없다면 → default로 cross-attention 도식을 제시하고, self-attention도 별도로 필요한지 물어봄
- 사용자가 "광학 이중 슬릿 간섭 실험"이라고 말하면 → central_subject = 이중 슬릿 차단판 + 스크린 + 입사광, supporting = 간섭 무늬 작은 그림 + 수식 d sinθ = mλ
- 사용자가 "세포 receptor 신호 경로"라고 말하면 → BioRender 친화 스타일 사용: 둥근 세포막 + 수용체 + 리간드 + 내부 신호 사슬
- 사용자가 reference_style을 주지 않았다면 → 분야로 추정: CV/ML은 "상위 학회 논문 스타일"; 생물은 "BioRender / Nature methods 스타일"; 물리는 "교과서 + 수식 스타일"
- 사용자가 "영어 없이 전부 중국어로"라고 말하면 → label_font를 Source Han Sans / 송체 계열로 바꾸고 수식은 LaTeX 수학체 유지

## 변형 1: 실험 장치 도식 (광학 / 화학)

```
Modify the main template:

CENTRAL SUBJECT
A precise schematic of an experimental apparatus, drawn in side view (orthographic projection).

LAYOUT
- Equipment components arranged from left to right along the optical / fluid path:
  light source / reactant inlet → first optical / chemical element → second element → ... → detector / outlet
- Components shown as simplified geometric primitives:
  - Lasers / lamps: small box with arrows indicating beam direction
  - Lenses: standard biconvex / planoconvex symbol (two arcs)
  - Mirrors: thin angled lines with hatching on the back
  - Reactors: round-bottom flask outline
  - Detectors: rectangular box with diagonal corner stripes
- Beam / fluid path drawn as a thin colored line (e.g. red for light, blue for fluid)

ANNOTATIONS
- Each component labeled with its role and (if relevant) a parameter (e.g. f = 50mm, λ = 532nm)
- Arrows show direction of light / flow

VIBE
Like a JOSA / Optics Letters experimental setup figure, or like a chemistry textbook reaction apparatus.
```

적용: 광학 실험, 화학 반응 장치, 유체 / 역학 장치, 반도체 제조 공정 도식.

## 변형 2: 생물 / 의학 메커니즘 도식 (BioRender 스타일)

```
Modify the main template:

CENTRAL SUBJECT
A simplified biological structure (cell membrane / cell / tissue / organ / molecule).

STYLE
- BioRender-friendly: rounded organic shapes, slightly stylized but anatomically reasonable
- Color-coded biology palette: warm membrane (peach / coral), cool nucleus / organelles (blue / purple), bright signaling molecules (yellow / green)
- 3D suggestion via subtle shading (single-direction soft shading, no harsh highlights)

ANNOTATIONS
- Each structure labeled with its biological name (italic Latin / standard nomenclature)
- Signaling pathways drawn as arrows with mechanism keywords ("phosphorylation", "binding", "translocation")
- If multi-step, number each step and provide a brief side caption

VIBE
Like a Cell / Nature review pathway figure, balanced between scientific accuracy and visual approachability.
```

적용: 분자생물학 경로, 세포 메커니즘, 해부 도식, 약물 작용 메커니즘.

## 변형 3: 수학 / 알고리즘 개념 시각화

```
Modify the main template:

CENTRAL SUBJECT
A mathematical / algorithmic concept rendered as geometry:
- vectors as arrows, matrices as grids, functions as curves, manifolds as surfaces
- coordinate systems with labeled axes (x, y, z), origin marked

STYLE
- Clean TikZ / Asymptote aesthetic
- Heavy use of LaTeX-rendered equations integrated into the figure
- Greek letters and mathematical symbols throughout
- Sparingly use color — usually 2 colors (black + one accent) to highlight what's being discussed

ANNOTATIONS
- Equation snippets next to relevant geometry
- Brief textual descriptions on the side ("optimal transport plan minimizes ...")
- Sub-figure labels (a), (b), (c) for multi-panel concept figures

VIBE
Like a figure from "Convex Optimization" by Boyd, or from a SIGGRAPH technical paper.
```

적용: 최적화 이론, 기하 / 위상, 확률 분포, 신호 처리, 컴퓨터 그래픽스의 수학 기초.

## 피해야 할 사항

- 카툰화되고 과장된 요소 → 과학적 엄밀성이 사라짐
- 그라데이션 / 유리 질감 / drop shadow → PPT처럼 보이고 논문처럼 보이지 않음
- 색상 4종 초과 / 고채도 / 네온 색
- 수식에 수학용이 아닌 글꼴 사용 (변수는 반드시 이탤릭 + serif 수학체)
- 중영문 혼용 (명시적 이중 언어가 아닌 경우)
- 장식용 배경 질감 / 무늬
- 주석선이 주체를 관통하거나 라벨끼리 충돌
- 생물 / 화학 요소 아이콘으로 이모지 사용
- 서로 무관한 여러 개념을 한 그림에 넣기 (분리해야 함)
- 흐리거나 저해상도 (논문 그림은 반드시 벡터 수준으로 선명해야 함)
- 자유 손그림 스타일의 "스케치 느낌" → `infographics/hand-drawn-infographic.md`가 적합하며, 이 템플릿은 반드시 기하학적으로 정확해야 함
