# 출판용 데이터 차트 템플릿

이 파일은 "논문 / 보고서에 나오는 표준 데이터 차트"를 생성하기 위한 것입니다.

- Bar chart / grouped bar chart (ablation 실험, 방법 비교)
- Line chart / 학습 곡선 (epoch에 따른 loss / accuracy)
- Scatter plot (성능-효율 trade-off)
- Box plot / Violin plot (통계 분포)
- Heatmap (confusion matrix / attention map / 상관 행렬)

특징:

- matplotlib / seaborn / R ggplot2 출판물 스타일
- 좌표축 + 라벨 + 단위 + 범례 + 오차 막대 + 유의성 표시를 포함
- 글꼴 ≥ 10pt (인쇄 시 가독성 확보)
- 절제된 색상 (≤ 6색), 단색 인쇄 가능
- 격자선은 매우 옅거나 없음

> ⚠️ 중요한 면책 조항: **이 템플릿이 생성하는 것은 "출판 수준 차트의 시각적 표현"이며, 실제 데이터 시각화가 아닙니다**. GPT Image 2는 좌표와 데이터의 정확한 대응을 보장할 수 없습니다.
>
> - "논문 차트가 어떻게 생겼는지 보여 주기" / "표지 / hero 이미지 제작"이 목적이라면 → 이 템플릿을 사용
> - "실제 데이터로 출판 가능한 차트를 생성"하려면 → matplotlib / seaborn / ggplot2 / Plotly를 사용

## 적용 범위

- 논문 방법 비교 차트의 시각적 예시
- 교육용 슬라이드에서 "한눈에 이해되는" 데모 차트
- 블로그 / 공식 계정 이미지 — "우리 방법이 이 차트에서 보여 주는 성능"
- 투자자 deck의 "데이터 목업"
- 시연용, 시각화 교육용 차트

## 사용 시점

- 사용자가 "publication chart / matplotlib 스타일 / seaborn 스타일 / 논문 차트 / bar chart / line chart / scatter / heatmap / confusion matrix"를 언급할 때
- 사용자가 "흰색 배경, 절제된 디자인, 단색 가능, NeurIPS 논문 같은 차트"를 원할 때
- 사용자가 이것이 **시각적 표현일 뿐이며 좌표 정확도에 의존하지 않는다는 것을 명확히 알고 있을 때**

사용하지 않는 경우:

- 사용자가 원하는 것이 "실제 데이터 시각화 산출물"이라면 → matplotlib / seaborn / Plotly를 권장
- 사용자가 원하는 것이 "KPI 대시보드 / 데이터 회고"라면 → `infographics/kpi-dashboard-infographic.md`를 사용
- 사용자가 원하는 것이 "비즈니스 PPT 데이터 페이지"라면 → `slides-and-visual-docs/visual-report-page.md`를 사용
- 사용자가 원하는 것이 "손그림 스타일 인포그래픽"이라면 → `infographics/hand-drawn-infographic.md`를 사용

## 부족한 정보에 대한 질문 우선순위

1. 차트 유형 (bar / line / scatter / box / violin / heatmap / pie)
2. 주제 ("우리 방법의 ImageNet에서의 accuracy vs baselines")
3. X축과 Y축 이름 + 단위
4. 데이터 시리즈 수 (단일 시리즈 / 다중 시리즈)
5. 오차 막대, 유의성 표시 여부 *
6. 색상 기조 (학술적 절제 / 대비 강조 / 흑백 단색)
7. 그림 제목 + caption (논문 figure에는 보통 caption이 있음)

## 주요 템플릿: Publication-Ready Bar Chart (기본)

📖 설명

전체 그림은 표준 학술 bar chart입니다: 가로축은 방법 / 범주, 세로축은 지표이며, 여러 방법을 비교하고, 오차 막대, 유의성 *, 범례를 포함합니다. 전체적으로 흰색 배경, sans-serif 글꼴, 제한된 색상을 사용합니다.

📝 프롬프트

```json
{
  "type": "Publication-Ready Bar Chart（学术出版级条形图）",
  "goal": "生成视觉呈现一张论文 / 报告中的 bar chart，要求白底、克制、专业、可单色印刷",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"4:3\"}",
    "background": "white #FFFFFF",
    "outer_padding": "60px"
  },
  "title": {
    "text": "{argument name=\"title\" default=\"Accuracy on ImageNet-1K\"}",
    "position": "top-center, sans-serif bold 13pt",
    "subtitle": "{argument name=\"subtitle\" default=\"\"}"
  },
  "axes": {
    "x_axis": {
      "label": "{argument name=\"x_label\" default=\"Method\"}",
      "categories": [
        "{argument name=\"cat1\" default=\"ResNet-50\"}",
        "{argument name=\"cat2\" default=\"ViT-B\"}",
        "{argument name=\"cat3\" default=\"Swin-B\"}",
        "{argument name=\"cat4\" default=\"ConvNeXt-B\"}",
        "{argument name=\"cat5\" default=\"Ours\"}"
      ],
      "tick_label_rotation": "0deg or 30deg if labels are long"
    },
    "y_axis": {
      "label": "{argument name=\"y_label\" default=\"Top-1 Accuracy (%)\"}",
      "range": "{argument name=\"y_range\" default=\"75 to 86\"}",
      "tick_format": "decimal or percent",
      "gridlines": "very faint horizontal gridlines (light gray dashed, low opacity)"
    }
  },
  "bars": {
    "style": "vertical bars, ~30-40% width of category slot, gap between bars",
    "color_rule": {
      "default": "use a single muted color for all baselines (e.g. slate blue #64748B), highlight 'Ours' bar in accent color (e.g. orange #D97706 or red #DC2626)",
      "alternative": "if comparing methods grouped by family, use 2-3 muted colors to encode family"
    },
    "value_labels": {
      "enabled": "{argument name=\"value_labels_enabled\" default=\"true\"}",
      "rule": "show numeric value above each bar, sans-serif 9pt bold, e.g. '82.3'"
    }
  },
  "error_bars": {
    "enabled": "{argument name=\"error_bars_enabled\" default=\"true\"}",
    "style": "thin black T-bar at top of each bar, ±std or ±95% CI",
    "annotation": "mention what the error represents in caption (e.g. 'error bars show ±1 std over 5 runs')"
  },
  "significance_markers": {
    "enabled": "{argument name=\"significance_enabled\" default=\"false\"}",
    "rule": "if true, draw thin horizontal brackets between compared bars, with * / ** / *** annotation above (p<0.05 / p<0.01 / p<0.001)"
  },
  "legend": {
    "enabled": "{argument name=\"legend_enabled\" default=\"false\"}",
    "rule": "only show legend if multiple colors / groups used; place top-right inside or outside the plot area",
    "items": ["Baselines", "Ours"]
  },
  "caption": {
    "enabled": "{argument name=\"caption_enabled\" default=\"true\"}",
    "label": "{argument name=\"figure_label\" default=\"Figure 3.\"}",
    "text": "{argument name=\"caption_text\" default=\"Top-1 accuracy on ImageNet-1K. Our method outperforms all baselines while using fewer parameters. Error bars show ±1 std over 5 runs.\"}",
    "style": "below the chart, italic serif or compact sans-serif, justified, smaller font"
  },
  "constraints": {
    "must_keep": [
      "white background, no gradient, no pattern fills",
      "sans-serif fonts only (Helvetica / Inter / Arial); axis tick labels ≥ 9pt, axis labels ≥ 11pt, title ≥ 13pt",
      "color palette ≤ 6 colors, must remain readable in grayscale",
      "all axes have labels and units",
      "no 3D bar effects, no perspective tilt",
      "if multiple bars per category, group them with consistent spacing",
      "Ours bar is visually distinguishable (color or annotation)"
    ],
    "avoid": [
      "rainbow colors / saturated palette",
      "3D extruded bars / pie charts (3D distorts perception)",
      "missing axis labels or units",
      "unreadable tick labels (too small or rotated awkwardly)",
      "decorative background images / textures",
      "emoji / cartoon icons inside or around bars",
      "value labels overlapping bars or each other",
      "random / irrelevant accent colors",
      "fake precision: don't render bar heights to imply real numbers — keep it clearly illustrative"
    ]
  }
}
```

### 파라미터 전략

- **필수 질문**: 차트 유형 (bar가 아닌 경우), `title`, `x_label` / `y_label` / 단위, `categories`
- **기본값 사용 가능**: `aspect_ratio`(4:3), `background`(흰색), `error_bars_enabled`(true), `value_labels_enabled`(true), `legend_enabled`(단일 시리즈일 때 false)
- **무작위 가능**: bar 너비, tick 개수, 격자선 밀도 (합리적인 범위 내에서)

### 자동 보완 전략

- 사용자가 "5개 방법의 accuracy 비교가 있다"고 말하면 → 기본 5개 categories를 사용하고, 마지막 항목을 Ours로 강조
- 사용자가 y_range를 지정하지 않았다면 → 수치 범위 기준으로 추론 (± 5%)
- 사용자가 error를 말하지 않았다면 → 기본으로 error_bars 켜기 (논문의 표준 관행)
- 사용자가 significance를 말하지 않았다면 → 기본으로 끄기 (통계학 논문인 경우는 예외)
- 사용자가 "bar가 아니다"라고 말하면 → 해당 변형으로 전환

## 변형 1: Line Chart (학습 곡선 / 시계열)

```json
{
  "type": "Publication-Ready Line Chart（学术出版级折线图）",
  "modify": {
    "x_axis_typical": "epoch / step / time / iteration",
    "y_axis_typical": "loss / accuracy / metric",
    "lines_count": "1-5 series, each a different muted color",
    "line_style": "solid 1.5px main line + optional shaded area (semi-transparent same color) for std band",
    "markers": "optional small markers at sparse intervals (circles / triangles), not on every point",
    "legend": "always enabled for multi-series, top-right or below",
    "rule_extra": "axes can be log-scale if data spans orders of magnitude (label as 'log scale')"
  }
}
```

적용: 학습 곡선, 시계열 추세, 하이퍼파라미터에 따른 ablation 변화, scaling laws.

## 변형 2: Scatter Plot (trade-off 차트)

```json
{
  "type": "Publication-Ready Scatter Plot（学术出版级散点图）",
  "modify": {
    "typical_use": "performance vs efficiency trade-off (e.g. accuracy vs FLOPs / latency / params)",
    "x_axis_typical": "compute / params / latency (often log scale)",
    "y_axis_typical": "accuracy / metric",
    "point_style": "filled circles, size encodes a third dimension (e.g. model size), color encodes a category (e.g. method family)",
    "label_each_point": "small text label next to each point with method name (no leader lines unless crowded)",
    "ours_emphasis": "Our method points are larger and use accent color + black border",
    "frontier_line": "optional: draw a Pareto frontier curve to show 'we push the frontier'"
  }
}
```

적용: 성능-효율 trade-off, 파라미터 대 정확도, Pareto frontier.

## 변형 3: Heatmap (confusion matrix / attention map / 상관관계)

```json
{
  "type": "Publication-Ready Heatmap（学术出版级热力图）",
  "modify": {
    "grid": "N × N（默认 5×5 至 10×10）",
    "color_map": "sequential — viridis / Blues / Reds / 灰阶；diverging（如相关矩阵）— RdBu_r 红蓝双向",
    "cell_annotation": "show numeric value inside each cell in monospace, color flips for readability on dark cells",
    "axes_label": "row labels = ground truth, column labels = predicted（confusion matrix 场景）",
    "colorbar": "right side vertical colorbar with label and ticks",
    "rule_extra": "always include colorbar; never use rainbow colormap for sequential data (jet 已被学界淘汰)"
  }
}
```

적용: confusion matrix, attention 가중치 시각화, 상관 행렬, ablation grid.

## 변형 4: Box Plot / Violin Plot (통계 분포)

```json
{
  "type": "Publication-Ready Box / Violin Plot（学术出版级分布图）",
  "modify": {
    "typical_use": "compare distributions across methods / conditions / groups",
    "elements": "box (Q1, median, Q3) + whiskers (1.5 IQR) + outlier dots; violin 形状叠加显示密度",
    "median_line_emphasis": "median 线粗实线，颜色区分 group",
    "annotation": "可叠加 swarm / strip plot 显示每个数据点",
    "rule_extra": "如果用 violin，violin 内部仍画 box；不要纯 violin（损失中位数信息）"
  }
}
```

적용: 실험 반복 결과의 분포, 데이터셋 / 사용자 / 조건 간 분포 비교.

## 피해야 할 사항

- 3D 막대 / 3D 파이 사용 → 심각하게 비전문적임
- 연속 값 표현에 무지개 / jet colormap 사용 (학계에서 이미 폐기됨)
- 단위 / 좌표축 라벨 누락
- value 라벨이 너무 작아 읽기 어려움
- caption이 없거나 error bar를 설명하지 않음
- 서로 무관한 차트 4-5개를 하나로 합치기 (multi-panel figure 템플릿을 사용하고, 각 하위 그림은 독립적이어야 함)
- 실제 데이터처럼 보이게 하지만 사실은 illustrative인 정밀성 가장하기
- 장식용 글꼴 사용 (Comic Sans / 손글씨체)
- 워터마크 / 장식용 배경 추가
- 범례 누락 (다중 시리즈에는 반드시 필요)
- 다중 시리즈인데 색상이 완전히 같음
- Ours 강조 누락 (논문 그림은 보통 reviewer가 한눈에 자신의 방법을 찾을 수 있어야 함)
