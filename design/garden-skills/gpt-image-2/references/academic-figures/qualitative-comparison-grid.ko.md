# 다중 방법 Qualitative 비교 격자 템플릿

이 파일은 "논문 qualitative results 비교 격자"를 생성하기 위한 것입니다.

- CV 논문: 다중 방법의 분할 / 검출 / 생성 결과 비교
- NLP 논문: 다중 방법의 생성 텍스트 비교 (스크린샷 형식)
- 3D / 재구성 논문: 다중 방법의 재구성 결과 비교
- Diffusion / 이미지 생성 논문: 서로 다른 prompt × 서로 다른 방법의 격자
- Ablation study의 시각적 비교

특징:

- 엄격한 격자: 행 = 샘플 / 입력, 열 = 방법 (GT와 Ours 포함)
- 열 머리 행에 방법 이름 표기 (citation 포함)
- Ours 열은 보통 테두리 / 강조 표시
- 셀 내용은 통일됨 (이미지 / 텍스트 조각 / heatmap)
- 격자 사이에는 얇은 간격을 두며, 전체 배경은 흰색
- 설명을 위한 caption 첨부 가능

## 적용 범위

- 논문 qualitative results 섹션
- Ablation study의 시각적 비교
- 톱 컨퍼런스 supplementary의 대형 격자 그림
- 리뷰 논문의 method gallery
- 논문 심사 발표 PPT의 비교 페이지

## 사용 시점

- 사용자가 "qualitative / 비교 그림 / comparison grid / methods comparison / ablation visual"을 언급할 때
- 사용자가 "행 = 샘플, 열 = 방법"인 표준 논문 비교 격자를 원할 때

사용하지 않는 경우:

- 사용자가 원하는 것이 "두 제품의 소비자 비교"라면 → `infographics/comparison-infographic.md`를 사용
- 사용자가 원하는 것이 "다수 인물 아바타 격자"라면 → `avatars-and-profile/character-grid-portrait.md`를 사용
- 사용자가 원하는 것이 "데이터 차트"라면 → `academic-figures/publication-chart.md`를 사용
- 사용자가 원하는 것이 "비디오 프레임 시퀀스"라면 → `storyboards-and-sequences/`를 사용

## 부족한 정보에 대한 질문 우선순위

1. 행 수 (샘플 수, 3-6행 권장)
2. 열 수 (방법 수, 3-6열 권장, Input/GT와 Ours 포함)
3. 각 열의 방법 이름 (citation 포함, 예: "Method A [12]")
4. 셀 내용 유형 (RGB 이미지 / mask / heatmap / 텍스트 조각 / 3D 렌더링)
5. row labels 필요 여부 (왼쪽에 "Sample 1 / 2 / ..." 또는 "Easy / Medium / Hard" 표기)
6. 일부 위치에 빨간 박스 확대(zoom-in, focus area)를 넣을지 여부
7. caption 주석 필요 여부

## 주요 템플릿: Qualitative comparison grid (M행 × N열)

📖 설명

전체 그림은 엄격한 M×N 격자입니다. 각 행은 하나의 샘플이고, 각 열은 하나의 방법입니다. 가장 왼쪽에는 row labels를 추가할 수 있고, 가장 위 행은 열 머리(방법 이름 + citation)입니다. Ours 열에는 테두리를 추가해 강조하며, 일부 셀 안에는 빨간색 zoom-in 박스를 그릴 수 있습니다.

📝 프롬프트

```json
{
  "type": "Qualitative Comparison Grid（论文级多方法多样本对比网格）",
  "goal": "生成一张可直接放进论文 qualitative results 章节的网格对比图，要求严格对齐、清晰列首、Ours 高亮、可单色印刷可读",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"4:3\"}",
    "background": "white #FFFFFF",
    "outer_padding": "40px"
  },
  "grid": {
    "rows": "{argument name=\"rows\" default=\"4\"}",
    "cols": "{argument name=\"cols\" default=\"5\"}",
    "cell_size_rule": "all cells identical size; gap between cells 4-6px",
    "cell_aspect": "{argument name=\"cell_aspect\" default=\"square\"}"
  },
  "headers": {
    "column_headers": {
      "enabled": true,
      "items": [
        { "id": "C1", "label": "{argument name=\"col1_name\" default=\"Input\"}" },
        { "id": "C2", "label": "{argument name=\"col2_name\" default=\"Method A [12]\"}" },
        { "id": "C3", "label": "{argument name=\"col3_name\" default=\"Method B [34]\"}" },
        { "id": "C4", "label": "{argument name=\"col4_name\" default=\"Method C [56]\"}" },
        { "id": "C5", "label": "{argument name=\"col5_name\" default=\"Ours\"}", "highlight": true }
      ],
      "style": "centered above each column, sans-serif bold 11pt, citations in smaller superscript or in [brackets]"
    },
    "row_labels": {
      "enabled": "{argument name=\"row_labels_enabled\" default=\"true\"}",
      "items": [
        "{argument name=\"row1_label\" default=\"Sample 1\"}",
        "{argument name=\"row2_label\" default=\"Sample 2\"}",
        "{argument name=\"row3_label\" default=\"Sample 3\"}",
        "{argument name=\"row4_label\" default=\"Sample 4\"}"
      ],
      "style": "rotated 90° on the left margin OR placed above each row in italic 10pt"
    }
  },
  "cell_content": {
    "type": "{argument name=\"content_type\" default=\"rgb_image\"}",
    "options_explained": {
      "rgb_image": "natural images / photos",
      "segmentation_mask": "color-coded mask overlays",
      "heatmap": "viridis / jet style heatmap",
      "depth_map": "grayscale or turbo colormap",
      "text_snippet": "rendered text block in a code-like box",
      "3d_render": "rendered 3D mesh from a fixed viewpoint",
      "side_by_side": "two halves: input | result"
    },
    "consistency_rule": "all cells in the same row should depict the SAME underlying sample so the comparison is fair"
  },
  "highlights": {
    "ours_column": {
      "enabled": true,
      "style": "thicker border 1.5px in deep red / accent color (e.g. #DC2626) around each Ours cell"
    },
    "zoom_in_boxes": {
      "enabled": "{argument name=\"zoom_in_enabled\" default=\"false\"}",
      "rule": "if true, draw small red rectangles inside cells highlighting interesting regions; same red box appears at the same coordinate across the row to make comparison fair",
      "callout_style": "optional zoomed crop placed below the row, connected by thin lines"
    }
  },
  "caption": {
    "enabled": "{argument name=\"caption_enabled\" default=\"true\"}",
    "label": "{argument name=\"figure_label\" default=\"Figure 4.\"}",
    "text": "{argument name=\"caption_text\" default=\"Qualitative comparison with state-of-the-art methods. Our method (last column) preserves fine details and reduces artifacts.\"}",
    "style": "below the grid, italic serif or compact sans-serif, justified, smaller font"
  },
  "constraints": {
    "must_keep": [
      "all cells identical size and tightly aligned",
      "white or near-white background, no gradient",
      "column headers clearly above each column with citation",
      "Ours column visually distinguished (border / shaded header)",
      "row content depicts the same sample across all methods",
      "if zoom-in boxes used, position is identical across the row",
      "labels in English by default, no mixing with Chinese unless requested",
      "must remain interpretable in grayscale print"
    ],
    "avoid": [
      "different cell sizes between rows / columns",
      "random colors as cell backgrounds (cells are content, not decoration)",
      "missing citations on baseline methods",
      "ours column hidden or unmarked",
      "rotated cells / tilted layouts (must be axis-aligned)",
      "decorative emoji / cartoon icons inside cells",
      "varying content type per row (e.g. one row mask, next row RGB) without explicit row label",
      "more than 6 cols (becomes unreadable in two-column paper format)"
    ]
  }
}
```

### 파라미터 전략

- **필수 질문**: `rows`, `cols`, 각 열의 방법 이름 (citation 포함), `content_type`
- **기본값 사용 가능**: `aspect_ratio`(4:3), `row_labels_enabled`(true), `caption_enabled`(true)
- **무작위 가능**: 열 사이 간격의 정확한 픽셀 값, 글꼴 크기 (합리적인 범위 내에서)

### 자동 보완 전략

- 사용자가 "방법 4개 + ours가 있다"고 말하면 → Input 열을 자동 추가 (Input / M1 / M2 / M3 / M4 / Ours, 총 6열)
- 사용자가 row labels를 주지 않았다면 → 기본값으로 "Sample 1, 2, 3, ..."을 사용하거나 난이도별 분류 여부를 되물음
- 사용자가 citation을 주지 않았다면 → 임의로 지어내지 않고 "[n] 인용 자리표시 추가를 권장"이라고 안내
- 사용자가 "ablation study"라고 말하면 → 열 이름을 "w/o A", "w/o B", "Full" 등 ablation 변형으로 변경
- 사용자가 "zoom-in이 필요하다"고 말하면 → `zoom_in_enabled`를 켜고, region 좌표를 표시해야 한다고 안내

## 변형 1: 순수 텍스트 NLP qualitative 비교

```json
{
  "type": "NLP qualitative comparison grid",
  "modify": {
    "content_type": "text_snippet",
    "cell_aspect": "tall rectangle (e.g. 2:3 portrait)",
    "cell_styling": "monospace font in cell, black text on white, with key tokens highlighted in colored boxes",
    "row_labels": "input prompt / question 显示在每一行最左",
    "use_case": "对比多个 LLM / 翻译 / summarization 输出"
  }
}
```

적용: NLP 논문의 생성 결과 비교, 기계 번역 품질 비교.

## 변형 2: 분할 mask 다중 열 비교 (컬러 overlay 포함)

```json
{
  "type": "Segmentation mask comparison grid",
  "modify": {
    "content_type": "segmentation_mask",
    "cell_styling": "RGB image base + 半透明 mask 叠加；每类颜色一致；GT 列与 Ours 列容易对比",
    "extras": "在 cells 下方可加 'mIoU: 0.78' 等定量指标小字",
    "color_legend": "图右下角附小图例：颜色 → 类别名"
  }
}
```

적용: 의미론적 분할, 인스턴스 분할, 의료 영상 분할 논문.

## 변형 3: Diffusion / 생성 모델의 prompt × method 행렬

```json
{
  "type": "Generation prompt × method matrix",
  "modify": {
    "rows": "different text prompts (left labels show prompt text)",
    "cols": "different generation methods or different sampling steps",
    "cell_content": "generated images, all from same prompt across the row",
    "extras": "可在 ours 列加 '↑ +0.3 CLIP score' 小标"
  }
}
```

적용: 확산 모델, 텍스트-이미지 생성, 이미지 편집 방법 비교.

## 피해야 할 사항

- 셀 크기가 일관되지 않음 → 비교 의미가 완전히 사라짐
- citation 누락 → 동료 심사에서 감점됨
- Ours 열에 표시가 없음 → 독자가 어느 것이 저자의 방법인지 알 수 없음
- 같은 행의 샘플이 일치하지 않음 (이 행의 첫 열은 고양이, 둘째 열은 개) → 비교가 성립하지 않음
- 그라데이션 / 그림자 / 과도하게 큰 둥근 모서리 추가 → 논문처럼 보이지 않음
- 이모지나 카툰 장식 사용 → 심각하게 비전문적임
- 열 수 > 6 → 논문 2단 조판에서 잘 보이지 않음
- caption 없음 → 독자가 이 그림이 무엇을 말하려는지 알 수 없음
- 서로 다른 셀의 zoom-in 박스 위치가 일치하지 않음 → 비교가 공정하지 않음
