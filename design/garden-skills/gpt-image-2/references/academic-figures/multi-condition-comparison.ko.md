# 다중 공정 조건 / 다중 조건 결과 비교 그림 템플릿

이 파일은 "같은 연구 대상의 서로 다른 공정 조건 / 조건 / 그룹에서의 다중 패널 결과 비교 그림"을 생성하기 위한 것입니다.

- 서로 다른 온도 / 압력 / 농도 / 배합비 / 시간에서의 실험 또는 시뮬레이션 결과
- 서로 다른 처리 그룹 / 대조군 / 공정 방안의 나란한 결과
- 다중 패널 (a)(b)(c)(d) 형식의 논문 결과 그림

특징:

- 2×2 / 1×3 / 1×4 등 통일된 격자 레이아웃
- **모든 패널은 엄격하게 통일**: 동일한 크기, 동일한 색 논리, 동일한 범례, 동일한 글꼴 위계, 동일한 여백
- 흰색 배경, 채도가 낮은 공학용 색상, 논문 결과 그림 스타일
- **실제 데이터가 없으면 정성적 표현만 하며, 수치 / 등고선 / 색 막대 범위를 날조하는 것을 금지합니다**

## 적용 범위

- 공학 / 물리 / 화학 / 에너지 / 재료 / 환경 분야의 다중 공정 조건 결과 비교
- 연소 / 유동장 / 온도장 / 응력장 / 농도장 등 장(field) 그림 비교
- 서로 다른 처리 그룹 / 서로 다른 투여량 / 서로 다른 시점의 실험 대조
- 같은 지표를 여러 조건에서 보여 주는 다중 패널 시각화

## 사용 시점

- 사용자가 "다중 공정 조건 / 다중 조건 / 서로 다른 X에서의 비교 / 패널 (a)(b)(c)(d) / 결과 비교 그림"을 언급할 때
- 사용자가 마케팅 인포그래픽이 아닌 "논문 결과 그림" 시각을 원할 때
- 비교 대상이 **같은 대상의 서로 다른 조건에서 얻은 같은 종류의 결과**일 때

사용하지 않는 경우:

- 사용자가 원하는 것이 "같은 샘플에서 서로 다른 방법의 출력 비교"(행=샘플, 열=방법)라면 → `academic-figures/qualitative-comparison-grid.md`를 사용
- 사용자가 원하는 것이 "단일 게재용 차트"(막대 / 선 / 산점도)라면 → `academic-figures/publication-chart.md`를 사용
- 사용자가 원하는 것이 "마케팅 / 인포그래픽 스타일의 이항 비교"라면 → `infographics/comparison-infographic.md`를 사용

## 부족한 정보에 대한 질문 우선순위

1. 비교 대상은 무엇인가 (같은 현상 / 같은 지표)
2. 어떤 공정 조건 / 조건을 비교하는가 (2-6개 권장; 6개를 넘으면 그림을 두 장으로 나누는 것을 고려)
3. 각 패널이 보여 주는 것은 무엇인가 (장 그림 / 선 그래프 / 막대 그래프 / 등고선 / 현미경 사진) — **모든 패널은 같은 종류여야 합니다**
4. 실제 데이터가 있는가 (**핵심**: 정성적 그림인지 정량적 그림인지를 결정)
5. 격자 레이아웃 (2×2 / 1×3 / 1×4 / 2×3)
6. 라벨 언어 (중국어 / 영어 / 이중 언어)
7. 공유 범례 / 공유 색 막대 (강력히 권장)

## 주요 템플릿: N개 패널 다중 조건 비교 (통일 규격)

📖 설명

전체 그림을 통일된 격자로 N개의 패널로 나누며, 각 패널은 서로 다른 조건에서 같은 종류의 결과가 나타나는 모습을 보여 줍니다. 모든 패널은 색 막대 / 범례 / 글꼴 위계 / 여백을 공유합니다. 하위 그림에는 (a)(b)(c)(d)를 표시하며, 라벨은 짧고 절제되게 씁니다. **각 패널이 자체 스타일을 갖는 것은 절대 허용되지 않습니다.**

📝 프롬프트

```json
{
  "type": "학술 다중 조건 결과 비교 그림 (multi-condition comparison figure)",
  "goal": "논문 results 장에 바로 넣을 수 있는 다중 패널 비교 그림을 생성하며, 모든 패널은 엄격하게 통일되고, 흰색 배경, 채도가 낮은 공학용 색상, 단색 인쇄에서도 읽을 수 있어야 합니다",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"4:3\"}",
    "background": "pure white #FFFFFF",
    "outer_padding": "50px around the grid",
    "inter_panel_gap": "16-20px, identical horizontal and vertical",
    "render_quality": "vector-clean look, anti-aliased, sharp text"
  },
  "title_caption": {
    "figure_label": "{argument name=\"figure_label\" default=\"Figure X.\"}",
    "caption": "{argument name=\"caption\" default=\"Comparison of results under varying conditions.\"}",
    "position": "bottom-center, italic serif or compact sans-serif, smaller font size"
  },
  "grid_layout": {
    "rows": "{argument name=\"rows\" default=\"2\"}",
    "cols": "{argument name=\"cols\" default=\"2\"}",
    "panel_count": "{argument name=\"panel_count\" default=\"4\"}",
    "rule": "rows × cols == panel_count; all panels identical size; consistent vertical and horizontal alignment"
  },
  "panels": {
    "panel_type": "{argument name=\"panel_type\" default=\"contour-field\"}",
    "panel_type_options": "contour-field | line-chart | bar-chart | heatmap | micrograph | flow-field | bubble-chart",
    "rule": "ALL panels MUST share the same panel_type; never mix bar with line within the same comparison figure",
    "items": [
      {
        "id": "(a)",
        "condition_label": "{argument name=\"panel_a_label\" default=\"Condition A\"}",
        "condition_detail": "{argument name=\"panel_a_detail\" default=\"e.g. excess-air ratio λ = 1.0\"}"
      },
      {
        "id": "(b)",
        "condition_label": "{argument name=\"panel_b_label\" default=\"Condition B\"}",
        "condition_detail": "{argument name=\"panel_b_detail\" default=\"e.g. excess-air ratio λ = 1.2\"}"
      },
      {
        "id": "(c)",
        "condition_label": "{argument name=\"panel_c_label\" default=\"Condition C\"}",
        "condition_detail": "{argument name=\"panel_c_detail\" default=\"e.g. excess-air ratio λ = 1.4\"}"
      },
      {
        "id": "(d)",
        "condition_label": "{argument name=\"panel_d_label\" default=\"Condition D\"}",
        "condition_detail": "{argument name=\"panel_d_detail\" default=\"e.g. excess-air ratio λ = 1.6\"}"
      }
    ]
  },
  "panel_style": {
    "frame": "thin border 1px #1F2937 OR clean axis lines without outer frame, applied identically to all panels",
    "label_position": "(a) (b) (c) (d) at top-left of each panel, bold sans-serif, 11pt",
    "condition_label_position": "centered above each panel OR inside each panel top-right, identical position across all panels",
    "axis_labels": "shared if possible; if shown, identical font size, identical tick density across panels",
    "internal_titles": "AVOID per-panel decorative titles; rely on (a)(b)(c)(d) + condition label only"
  },
  "shared_legend": {
    "enabled": "{argument name=\"shared_legend_enabled\" default=\"true\"}",
    "position": "{argument name=\"shared_legend_position\" default=\"right-of-grid\"}",
    "rule": "single legend / colorbar shared across ALL panels; never give each panel its own legend with different range",
    "colorbar_range": "{argument name=\"colorbar_range\" default=\"qualitative-low-to-high\"}",
    "colorbar_range_rule": "if user provided a numerical range, use it; otherwise render as a qualitative gradient labeled 'low → high' with NO fabricated numerical ticks"
  },
  "color_logic": {
    "rule": "≤ 3 main colors total; if a sequential colormap is used, choose a perceptually uniform low-saturation engineering colormap (e.g. viridis-like, blue-to-orange, gray-to-deep-blue); apply the SAME colormap and SAME range to every panel",
    "must_print_grayscale_readable": true
  },
  "data_authenticity": {
    "user_provided_real_data": "{argument name=\"has_real_data\" default=\"false\"}",
    "rule_when_false": "render the panels as QUALITATIVE schematics: smooth gradient fields, generic shapes, no numerical tick labels on the colorbar, no specific values in axes; explicitly avoid the visual impression of a real dataset",
    "rule_when_true": "use the user-provided values; never extrapolate, interpolate, or invent additional values"
  },
  "constraints": {
    "must_keep": [
      "all panels identical size, identical aspect, identical position scheme",
      "shared color logic and shared legend across all panels",
      "white background, no gradient backdrop, no decorative pattern",
      "(a)(b)(c)(d) labels in identical position and identical style across all panels",
      "only sans-serif typography, identical font family across all panels",
      "the figure should look like it came from a results section of an engineering or science journal"
    ],
    "avoid": [
      "different colormap or different color range per panel",
      "different chart type per panel (e.g. mixing bar and line)",
      "decorative panel titles, hero panel that visually dominates the rest",
      "saturated brand colors, neon, vivid gradients",
      "3D effects, drop shadows, glossy fills, lens flare",
      "fabricated numerical tick values, fabricated colorbar ranges, fabricated isolines",
      "marketing-poster aesthetics, infographic-collage aesthetics",
      "watermarks, copyright stamps"
    ]
  }
}
```

### 파라미터 전략

- **필수 질문**: `panel_count`, `panel_type`(모든 패널 동일 유형), `has_real_data`
- **기본값 사용 가능**: `aspect_ratio`, `grid_layout`(2×2가 가장 일반적), `shared_legend_enabled`(true)
- **무작위 가능**: 각 condition의 `*_detail` 문구 (사용자가 제어 변수명을 주었다면 학술적 표현으로 작성 가능)

### 자동 보완 전략

- 사용자가 실제 데이터 유무를 말하지 않았다면 → **반드시 먼저 확인**: `has_real_data` = false이면 전체 그림을 정성적으로 렌더링
- 사용자가 서로 다른 condition은 주었지만 패널별 구체적 값은 주지 않았다면 → condition_detail에 `λ = X1` 같은 자리표시 문구를 사용하고, **숫자를 날조하지 않습니다**
- 사용자가 패널 수를 주었지만 행 × 열이 맞지 않는다면 → 가장 정사각형에 가까운 격자를 자동 선택 (2×2 / 2×3 / 3×3)
- 사용자가 "중국어 논문 / 논문 심사"라고 말하면 → 라벨을 중국어로 바꾸고 PingFang / 사원 고딕 계열 글꼴 사용

## 변형 1: 가로형 1×N (좁은 패널 비교에 적합)

```json
{
  "type": "横向 1×N 多工况对比",
  "modify": {
    "layout": "rows = 1, cols = N（建议 N ≤ 4）",
    "use_case": "panel 内部是窄柱图 / 窄折线，更适合横向铺开；或论文双栏排版需要横向单行"
  }
}
```

적용: 단일 단 / 이중 단 논문 형식에서의 가로 비교.

## 변형 2: 행·열 이중 요인 행렬 (M×N)

```json
{
  "type": "双因子矩阵对比",
  "modify": {
    "layout": "rows = M（一种因子的不同水平），cols = N（另一种因子的不同水平）",
    "rule": "顶部一行写列因子标签，最左一列写行因子标签；panel 内部样式严格统一",
    "use_case": "需要同时变化两个独立变量（如温度 × 含水率，或时间 × 浓度）"
  }
}
```

적용: 이중 요인 실험 설계의 결과 표시, 직교 실험 결과 시각화.

## 변형 3: 정성적 장 그림 렌더링 (실제 데이터 없음)

```json
{
  "type": "定性场图多工况对比",
  "modify": {
    "panel_type": "contour-field",
    "data_authenticity": {
      "user_provided_real_data": false,
      "rule": "render smooth qualitative gradient fields with NO numerical tick labels and NO specific isoline values; the colorbar shows 'low → high' as a qualitative scale only",
      "intent": "visually communicate 'higher temperature in panel (b)' without claiming any specific value"
    },
    "use_case": "答辩 / 开题阶段尚未拿到数据，需要先讲清研究思路时使用"
  }
}
```

적용: 개략적 결과 비교, 방법론 설명 단계.

## 피해야 할 사항

- 패널마다 다른 colormap / 다른 범위를 사용 → 비교 가능성이 직접 깨집니다
- 실제 데이터가 없을 때 구체적 수치가 있는 등고선 / 색 막대 눈금을 그리기 (**데이터 날조는 엄격히 금지**)
- 어느 한 패널의 시각적 비중이 다른 패널보다 뚜렷이 커지게 만들기 ("주 그림 + 보조 그림" 구조는 허용되지 않음)
- 각 패널에 독립적인 장식용 제목 추가
- 서로 다른 유형의 그림(막대 / 선 / 등고선)을 같은 비교 그림에 섞기
- 채도가 높은 브랜드 색이나 네온 그라데이션 사용
- "비교 방법"의 논리(행=샘플 × 열=방법)를 이 템플릿에 잘못 적용 (`qualitative-comparison-grid.md`를 사용)
- 워터마크 / 학술지 로고 / 장비 브랜드 마크 추가
