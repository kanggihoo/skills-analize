# 신경망 아키텍처 다이어그램 템플릿

이 파일은 "논문에 실리는 신경망 아키텍처 다이어그램"을 생성하기 위한 것입니다.

- Transformer / Encoder-Decoder 아키텍처 다이어그램
- U-Net / FPN / 다중 스케일 네트워크 아키텍처
- GAN / Diffusion / VAE 아키텍처
- Attention 메커니즘 도식
- 사용자 정의 모델 아키텍처 다이어그램

특징:

- 여러 layer 블록이 데이터 흐름 방향(가로 또는 세로)에 따라 배치됨
- 각 layer 블록에는 layer 이름 + tensor shape 표기(H × W × C)가 있음
- skip / residual / attention 연결선이 명확함
- layer 유형(Conv / Attention / FC / Norm)을 색으로 구분함
- 출판 수준, 흰색 배경과 절제된 디자인

## 적용 범위

- 논문의 model architecture figure
- 리뷰 논문의 framework 그림
- 논문 심사 발표 PPT의 모델 소개 페이지
- 교육용 슬라이드의 네트워크 도식

## 사용 시점

- 사용자가 "네트워크 아키텍처 / network architecture / model architecture / Transformer / U-Net / GAN / Diffusion / VAE"를 언급할 때
- 사용자가 "계층 구조가 명확하고, tensor shape 표기가 표준적이며, skip 연결이 한눈에 보이는" 결과를 원할 때
- 사용자가 "논문 스타일, 흰색 배경, layer 유형을 색으로 구분"하는 시각을 원할 때

사용하지 않는 경우:

- 사용자가 원하는 것이 "방법 pipeline 개요"(여러 stage의 업무 흐름)라면 → `academic-figures/method-pipeline-overview.md`를 사용
- 사용자가 원하는 것이 "시스템 아키텍처 다이어그램"(프론트엔드 + 백엔드 + DB)이라면 → `technical-diagrams/system-architecture.md`를 사용
- 사용자가 원하는 것이 "데이터 흐름 / ER 다이어그램"이라면 → `technical-diagrams/er-diagram.md`를 사용
- 사용자가 원하는 것이 "개념 도식 / 어텐션 시각화"(자유도가 높음)라면 → `academic-figures/scientific-schematic.md`를 사용

## 부족한 정보에 대한 질문 우선순위

1. 모델 유형 (Encoder-Decoder / U-Net / Transformer / GAN / Diffusion / 사용자 정의)
2. 주요 네트워크의 layer 수 / 각 layer 유형 (예: "6층 Transformer encoder + 6층 decoder + 8헤드 attention")
3. Tensor shape (입력 해상도 / 채널 수 / 시퀀스 길이)
4. skip / residual / cross-attention 존재 여부
5. multi-task / multi-head 출력 여부
6. 중국어 라벨 필요 여부 (논문 그림은 보통 영어)
7. 비율 (논문 2단 조판에 맞는 가로 16:9 / 2:1)

## 주요 템플릿: Transformer / Encoder-Decoder 아키텍처 다이어그램

📖 설명

전체 그림은 가로로 흐릅니다: 왼쪽 입력 embedding → 다층 encoder 블록 → cross-attention → 다층 decoder 블록 → 오른쪽 출력 head. 각 layer 블록에는 layer 유형과 tensor shape를 표기하며, skip 연결은 곡선 점선으로 그립니다.

📝 프롬프트

```json
{
  "type": "神经网络架构图（neural network architecture diagram）",
  "goal": "生成论文级别的网络架构图：层级清晰、tensor shape 标注、跳连分明、可单色印刷可读",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"16:9\"}",
    "background": "white #FFFFFF",
    "outer_padding": "60px"
  },
  "model_meta": {
    "name": "{argument name=\"model_name\" default=\"Our Transformer\"}",
    "input_spec": "{argument name=\"input_spec\" default=\"Input Image: 224×224×3\"}",
    "output_spec": "{argument name=\"output_spec\" default=\"Class Logits: 1000\"}"
  },
  "layer_groups": {
    "rule": "use color-coded blocks per layer type — keep palette ≤ 5 muted academic colors",
    "color_legend": [
      { "type": "Embedding / PatchEmbed", "fill": "#E0E7FF", "border": "#6366F1" },
      { "type": "Self-Attention", "fill": "#FEE2E2", "border": "#DC2626" },
      { "type": "Cross-Attention", "fill": "#FEF3C7", "border": "#D97706" },
      { "type": "Feed Forward / MLP", "fill": "#D1FAE5", "border": "#059669" },
      { "type": "Norm / Residual", "fill": "#F3F4F6", "border": "#6B7280" }
    ]
  },
  "layers": {
    "count": "{argument name=\"layer_count\" default=\"8\"}",
    "items": [
      { "id": "L1", "type": "Embedding / PatchEmbed", "name": "Patch Embed", "shape": "196×768" },
      { "id": "L2", "type": "Norm / Residual", "name": "LayerNorm", "shape": "196×768" },
      { "id": "L3", "type": "Self-Attention", "name": "Multi-head Self-Attn (×8)", "shape": "196×768", "annotation": "× N=6 (encoder)" },
      { "id": "L4", "type": "Feed Forward / MLP", "name": "FFN", "shape": "196×768" },
      { "id": "L5", "type": "Cross-Attention", "name": "Cross-Attn", "shape": "K×768" },
      { "id": "L6", "type": "Self-Attention", "name": "Decoder Self-Attn", "shape": "K×768", "annotation": "× N=6 (decoder)" },
      { "id": "L7", "type": "Feed Forward / MLP", "name": "FFN", "shape": "K×768" },
      { "id": "L8", "type": "Norm / Residual", "name": "Output Head (Linear)", "shape": "K×C" }
    ]
  },
  "block_style": {
    "shape": "rounded rectangle (corner radius 4-6px)",
    "size_rule": "blocks of same layer type share identical width and height; visually grouped",
    "border": "1.2px solid (use the type's border color)",
    "fill": "use the type's fill color (very light tint)",
    "label_text": "layer name on first line (sans-serif bold 10-11pt) + tensor shape on second line (monospace italic 9pt)",
    "annotation_text": "if 'annotation' present (e.g. '× N=6'), draw it as a curly brace with label on the right side of the repeated block"
  },
  "connections": {
    "main_flow": {
      "style": "thin black solid arrows (1.2px), horizontal left → right",
      "arrowhead": "small filled triangle"
    },
    "residual": {
      "enabled": "{argument name=\"residual_enabled\" default=\"true\"}",
      "style": "curved dashed arrow arcing above the main flow, label '+' near join",
      "rule": "draw residual from input of attention block to its output"
    },
    "cross_attention": {
      "enabled": "{argument name=\"cross_attention_enabled\" default=\"true\"}",
      "style": "horizontal arrow from encoder side feeding into decoder cross-attn, label 'K, V'",
      "rule": "encoder output is shown as K, V input to decoder cross-attn"
    }
  },
  "extras": {
    "show_param_count": {
      "enabled": "{argument name=\"show_params\" default=\"false\"}",
      "rule": "if true, add parameter count below each major group (e.g. '85M params')"
    },
    "highlight_novelty": {
      "enabled": "{argument name=\"highlight_novelty\" default=\"true\"}",
      "rule": "if true, surround the user's contributed module with a thicker dashed orange border + label 'Ours' / 'Novel'"
    }
  },
  "constraints": {
    "must_keep": [
      "tensor shapes are accurate and labeled in monospace font",
      "color encodes layer type consistently across the figure",
      "all layers of the same type have identical block size",
      "white background, no gradient, no decoration",
      "all labels in English by default (or all Chinese if explicitly requested), no mixing",
      "must remain readable when printed in grayscale (rely on shape and label, not color alone)",
      "novel contribution (if any) is clearly marked"
    ],
    "avoid": [
      "3D extruded blocks, drop shadows, glossy fills",
      "rainbow palette (>5 colors)",
      "cartoon icons, emoji",
      "freeform 'art-style' blobs instead of crisp rectangles",
      "tensor shapes typeset in proportional font",
      "arrows crossing through blocks",
      "missing tensor shape labels (the figure is then useless for paper review)",
      "unlabeled cross-attention (must say K, V)"
    ]
  }
}
```

### 파라미터 전략

- **필수 질문**: `layer_count`, 각 layer의 `type`과 `shape`
- **기본값 사용 가능**: `aspect_ratio`(16:9), `background`(흰색), `color_legend`(기본 5가지 색상), `block_style`
- **무작위 가능**: 블록 내 각 줄의 정확한 글자 크기 / padding, annotation 배치 위치

### 자동 보완 전략

- 사용자가 "Transformer를 사용한다"고만 말하고 세부 사항이 없다면 → 핵심 파라미터(층 수, 헤드 수, hidden 차원, 시퀀스 길이)를 되물으며, 모델 규모를 임의로 지어내지 않습니다
- 사용자가 "U-Net"이라고 말하면 → contracting + expansive 이중 팔 레이아웃 변형(변형 1 참조)을 자동 사용
- 사용자가 residual 유무를 말하지 않았다면 → 기본값 `residual_enabled: true` (대부분의 현대 네트워크에 존재)
- 사용자가 novelty 유무를 말하지 않았다면 → 기본값 `highlight_novelty: true` (논문 그림은 보통 저자의 기여를 표시함)
- 사용자가 파라미터 수를 말하지 않았다면 → 기본값 `show_params: false` (사용자가 모델 규모 비교를 언급한 경우는 예외)

## 변형 1: U-Net / FPN 이중 팔 아키텍처

```json
{
  "type": "U-Net / FPN 双臂架构图",
  "modify": {
    "layout": "U 形：左臂下采样（contracting path）+ 中央 bottleneck + 右臂上采样（expansive path），每层之间有水平 skip connection",
    "annotation": "skip 用横向虚线箭头标注，特征图用渐窄 / 渐宽的矩形示意 spatial 维度变化"
  }
}
```

적용: U-Net, FPN, HRNet 및 모든 encoder-decoder 분할 네트워크.

## 변형 2: GAN / Diffusion의 이중 네트워크 대립 / 다단계 추론

```json
{
  "type": "GAN / Diffusion 架构图",
  "modify": {
    "layout_gan": "上方 Generator（noise → image）+ 下方 Discriminator（image → real/fake），中间共享生成图像作为 D 的输入",
    "layout_diffusion": "横向 timestep 序列 t=T → t=0，每个 timestep 是同一个 U-Net 实例，标 't' 嵌入条件"
  }
}
```

적용: GAN 계열, 확산 모델, Score-based 모델.

## 변형 3: Multi-task / Multi-head 출력

```json
{
  "type": "多任务 / 多头输出架构图",
  "modify": {
    "layout": "共享 backbone 在中央 → 右侧分叉成 2-4 个 task head（如 classification head / regression head / segmentation head）",
    "annotation": "每个 head 旁边标对应 loss 函数和权重 λ"
  }
}
```

적용: 다중 작업 학습, 검출 + 분할, 보조 감독.

## 피해야 할 사항

- tensor shape가 없거나 대충 적힌 경우 → 논문 그림의 핵심 정보가 사라짐
- 그라데이션 / 3D 큐브 적층 사용 → PPT처럼 보이고 논문처럼 보이지 않음
- 색상 6종 이상 사용 → layer 유형의 의미가 사라짐
- 아키텍처에 residual / cross-attention이 있는데 표기하지 않음 → 독자를 오도함
- Comic Sans / 손글씨 글꼴 사용
- skip 화살표가 layer 블록을 관통함
- 같은 유형의 layer 블록 크기가 제각각임
- 중영문 라벨 혼용
- 구조도에 학습 loss를 그려 넣기 (별도의 training figure나 caption에서 설명해야 함)
- 구조도에 구체적인 하이퍼파라미터 표를 넣기 (표로 작성해야 하며 figure에 넣지 않음)
