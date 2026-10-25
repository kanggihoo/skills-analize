# 논문 방법론 Pipeline 개요도 템플릿

이 파일은 “논문의 Method 장 첫 페이지에 들어갈 개요도”를 생성하는 데 사용합니다.

- 최상위 학회 논문의 Method 장 첫 그림(CVPR / NeurIPS / ICLR / ACL / SIGGRAPH 등)
- 시스템 개요 / 파이프라인 그림
- 리뷰 논문의 프레임워크 개념도
- 실험 장치 / 데이터 흐름 개요
- 학위 심사 발표용 PPT의 방법 개요

특징:

- 가로 방향의 3~6개 단계 블록
- 단계 사이의 명확한 방향성 데이터 흐름
- 각 단계에 단계 이름 + 단순화한 삽화 + 입력 / 출력의 작은 표기
- 전체적으로 흰색 / 밝은 회색 배경, 검정 또는 짙은 회색의 주요 선
- 출판물용 서체(Helvetica / Inter / Arial), 절제된 보조 색상
- **극도로 간결하고, 기하학적으로 정확하며, 단색 인쇄에서도 읽을 수 있음**

## 적용 범위

- 논문의 방법 개요 / 프레임워크 그림
- 리뷰 논문의 파이프라인 개요
- 시스템 개요도(“우리 방법은 4단계로 구성됩니다…”)
- 데이터 흐름 / 신호 흐름 개요
- 실험 절차 개요

## 사용 시점

- 사용자가 “논문 / paper / method / pipeline / framework / overview / 리뷰 / 최상위 학회 / arXiv”를 언급할 때
- 사용자가 “극도로 간결하고, 흰 배경에 검은 선, 기하학적으로 정확하며, CVPR 논문 같은 개요도”를 원할 때
- 사용자가 구체적인 단계 설명을 이미 제공했을 때

다음에는 사용하지 마세요.

- 사용자가 **신경망 아키텍처도**(레이어 블록 + 텐서 형태)를 원하는 경우 → `academic-figures/neural-network-architecture.md` 사용
- 사용자가 **개념 / 원리 도식**(자유도가 높은 과학 도식)을 원하는 경우 → `academic-figures/scientific-schematic.md` 사용
- 사용자가 **단계별 튜토리얼**(삽화 느낌, 따뜻한 분위기)을 원하는 경우 → `infographics/step-by-step-infographic.md` 사용
- 사용자가 **공학 시스템 아키텍처도**(어두운 색 + 반투명 색상 블록)를 원하는 경우 → `technical-diagrams/system-architecture.md` 사용
- 사용자가 **업무 프로세스 흐름도**를 원하는 경우 → `technical-diagrams/flowchart-decision.md` 사용

## 누락된 정보가 있을 때 우선 질문할 항목

1. 방법 / 시스템의 전체 이름(그림 제목이나 캡션에 표시)
2. 단계 수(3~6개 권장, 6개 초과 시 계층화 고려)
3. 각 단계의 이름 + 주요 작업 + 입력 + 출력
4. 데이터 형태(이미지 / 텍스트 / 점군 / 오디오 / 멀티모달) — 단계 내부의 단순화된 삽화를 결정
5. 스킵 연결 / 피드백 루프 / 다중 분기가 있는지
6. 비율(가로 16:9 또는 2:1, 논문 2단 레이아웃에 적합하게)
7. 영어 레이블이 필요한지(논문 그림은 보통 영어)

## 기본 템플릿: 가로 방향 N단계 방법론 파이프라인 그림

📖 설명

그림 전체가 가로로 흐릅니다. 가장 왼쪽의 입력부터 시작해 단순화된 삽화 + 단계 이름 + 입력 및 출력의 작은 표기가 들어간 직사각형 / 둥근 직사각형 단계 블록 3~6개를 차례로 거칩니다. 블록은 화살표로 연결하고 가장 오른쪽에 결과를 둡니다. 전체적으로 절제되고 정렬이 엄격하며 기하학적으로 정확합니다.

📝 프롬프트

```json
{
  "type": "학술 논문 방법론 Pipeline 개요도(method overview figure)",
  "goal": "최상위 학회 논문의 Method 장 첫 페이지에 바로 넣을 수 있는 파이프라인 개요도를 생성합니다. 극도로 간결하고, 흰 배경에 기하학적으로 정확하며, 출판물 수준의 가독성을 갖춰야 합니다.",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"16:9\"}",
    "background": "순백색 #FFFFFF 또는 아주 밝은 회색 #FAFAFA",
    "outer_padding": "그림 주위 60px",
    "render_quality": "벡터처럼 깔끔한 느낌, 가장자리는 안티앨리어싱, 텍스트는 선명하게"
  },
  "title_caption": {
    "figure_label": "{argument name=\"figure_label\" default=\"Figure 1.\"}",
    "caption": "{argument name=\"caption\" default=\"Overview of our proposed pipeline.\"}",
    "position": "하단 중앙, 이탤릭 세리프 또는 간결한 산세리프, 작은 글자 크기"
  },
  "input": {
    "label": "{argument name=\"input_label\" default=\"Input Image\"}",
    "thumbnail": "{argument name=\"input_thumbnail\" default=\"a small representative thumbnail (e.g. an RGB image, a text snippet, a point cloud)\"}",
    "position": "가장 왼쪽, 세로 중앙"
  },
  "stages": {
    "count": "{argument name=\"stage_count\" default=\"4\"}",
    "items": [
      {
        "id": "S1",
        "name": "{argument name=\"stage_1_name\" default=\"Feature Extractor\"}",
        "icon_or_glyph": "{argument name=\"stage_1_glyph\" default=\"a stack of 3 small horizontal bars representing CNN feature maps\"}",
        "sub_label": "{argument name=\"stage_1_sub\" default=\"ResNet-50\"}"
      },
      {
        "id": "S2",
        "name": "{argument name=\"stage_2_name\" default=\"Multi-scale Encoder\"}",
        "icon_or_glyph": "{argument name=\"stage_2_glyph\" default=\"a small triangle / pyramid representing multi-scale\"}",
        "sub_label": "{argument name=\"stage_2_sub\" default=\"FPN-style\"}"
      },
      {
        "id": "S3",
        "name": "{argument name=\"stage_3_name\" default=\"Cross-attention Decoder\"}",
        "icon_or_glyph": "{argument name=\"stage_3_glyph\" default=\"two interleaved arrows representing cross-attention\"}",
        "sub_label": "{argument name=\"stage_3_sub\" default=\"Transformer\"}"
      },
      {
        "id": "S4",
        "name": "{argument name=\"stage_4_name\" default=\"Prediction Head\"}",
        "icon_or_glyph": "{argument name=\"stage_4_glyph\" default=\"a small grid representing dense prediction\"}",
        "sub_label": "{argument name=\"stage_4_sub\" default=\"MLP × 2\"}"
      }
    ]
  },
  "output": {
    "label": "{argument name=\"output_label\" default=\"Predicted Mask\"}",
    "thumbnail": "{argument name=\"output_thumbnail\" default=\"a small representative output (e.g. a segmentation mask, a 3D model, a generated image)\"}",
    "position": "가장 오른쪽, 세로 중앙"
  },
  "stage_block_style": {
    "shape": "둥근 직사각형(모서리 반경 약 6px)",
    "size_per_stage": "단계당 약 120px 너비 × 80px 높이, 모든 단계의 크기를 동일하게",
    "fill": "아주 옅은 색조(예: #F1F5F9, #ECFEFF, #FEF9C3) — 단계 범주를 묶기 위해 최대 2가지 색조만 사용",
    "border": "짙은 회색 실선 1.2px #334155",
    "title_text": "블록 내부 상단 중앙에 굵은 산세리프로 단계 이름 표시(Helvetica / Inter / Arial), 11~12pt",
    "icon_position": "블록 안의 중앙에 배치, 블록 높이의 약 50% 차지",
    "sub_label_text": "단계 이름 아래에 회색 이탤릭으로 보조 레이블 표시"
  },
  "connectors": {
    "style": "단순한 삼각형 화살촉이 달린 가는 검은색 화살표(1.2px)",
    "rule": "왼쪽에서 오른쪽으로 수평 흐름을 만듭니다. 중간 데이터를 전달할 때만 화살표 위에 작은 레이블을 표시합니다(예: 'feature map H/4 × W/4 × 256').",
    "skip_connections": {
      "enabled": "{argument name=\"skip_connections\" default=\"false\"}",
      "rule": "true인 경우, 주 흐름 위를 호를 그리며 지나가는 곡선 화살표를 점선으로 그리고 'skip' / 'residual'이라고 표기합니다."
    }
  },
  "extras": {
    "loss_branch": {
      "enabled": "{argument name=\"loss_branch_enabled\" default=\"false\"}",
      "label": "{argument name=\"loss_branch_label\" default=\"L = L_cls + λ L_reg\"}",
      "rule": "활성화된 경우, 출력에서 'Loss' 상자로 이어지는 작은 점선 분기를 그리고 공식을 이탤릭으로 표시합니다."
    },
    "color_legend": {
      "enabled": "{argument name=\"color_legend_enabled\" default=\"false\"}",
      "rule": "여러 단계 색조를 사용하는 경우, 오른쪽 아래에 각 색상 그룹을 설명하는 작은 범례를 추가합니다."
    }
  },
  "constraints": {
    "must_keep": [
      "모든 단계 블록의 크기가 동일하고 세로로 정렬되어야 함",
      "흰색 또는 거의 흰색의 배경, 그라데이션이나 장식 없음",
      "산세리프 서체만 사용하며 손글씨체 / 디스플레이 서체는 사용하지 않음",
      "전체 색상은 4개 이하이며, 회색조 인쇄에서도 읽을 수 있어야 함",
      "입력 썸네일과 출력 썸네일의 크기는 같고, 둘 다 가는 테두리가 있어야 함",
      "화살표가 단계 블록과 겹치지 않아야 하며, 레이블이 화살표와 충돌하지 않아야 함",
      "사용자가 달리 요청하지 않으면 영어 레이블을 기본으로 사용",
      "CVPR / NeurIPS PDF에서 바로 가져온 그림처럼 보여야 함"
    ],
    "avoid": [
      "3D 효과, 그림자, 그라데이션, 광택 있는 채우기",
      "만화 아이콘, 이모지, 손으로 그린 듯한 흔들림",
      "채도가 높은 색상(네온이나 선명한 색상 금지)",
      "한 그림 안에서 Helvetica와 세리프 서체를 혼용",
      "장식용 배경 패턴 / 질감",
      "단계 블록 안의 사진 배경",
      "크기가 서로 다르거나 기준선이 정렬되지 않은 단계 블록",
      "명시적으로 이중 언어를 요청하지 않은 경우 중국어와 영어 레이블 혼용"
    ]
  }
}
```

### 매개변수 전략

- **필수 질문**: `stage_count`, 각 단계의 이름
- **기본값 사용 가능**: `aspect_ratio`(16:9), `background`(흰색), `figure_label` / `caption`, 단계 블록의 크기 / 색상
- **무작위 선택 가능**: 각 단계 안에 들어갈 `icon_or_glyph`의 구체적인 형태(사용자가 지정하지 않은 경우 추론)

### 자동 완성 전략

- 사용자가 방법 이름과 “단계가 4개”라는 정보만 주고 각 단계의 내용을 말하지 않은 경우 → 되묻습니다(알고리즘 세부 사항을 지어내면 안 됨).
- 단계 이름은 있지만 `sub_label`이 없는 경우 → 비워 두거나 자동으로 추론합니다(추론할 수 있다면 “ResNet-50” 같은 일반적인 선택지를 입력).
- 스킵 연결 여부를 말하지 않은 경우 → 기본값은 `skip_connections: false`
- 손실 분기 여부를 말하지 않은 경우 → 기본값은 `loss_branch: false`(사용자가 학습 파이프라인을 명시적으로 요청한 경우에만 추가)
- “중국어 논문” / “학위 심사 발표”라고 말한 경우 → 레이블을 중국어로 바꾸고 PingFang / 思源黑 글꼴 사용

## 변형 1: 두 줄 다중 분기 파이프라인

```json
{
  "type": "두 줄 다중 분기 파이프라인 그림",
  "modify": {
    "layout": "두 줄로 배치된 단계가 각각 평행하게 흐르고 중앙에서 fusion block으로 합쳐짐",
    "use_case": "멀티모달 융합 방법(예: visual + text 또는 RGB + depth)",
    "rule": "윗줄은 한 모달리티를, 아랫줄은 다른 모달리티를 처리한 뒤 중앙의 fusion block에서 합쳐 출력으로 연결합니다."
  }
}
```

적용 예: 멀티모달, 양방향 네트워크, teacher-student 방법.

## 변형 2: 학습과 추론 파이프라인 비교

```json
{
  "type": "학습 대 추론 비교 파이프라인 그림",
  "modify": {
    "layout": "두 줄로 배치: 윗줄 'Training Phase'(손실, 정답 입력, 그래디언트 역전파 포함), 아랫줄 'Inference Phase'(순전파만, 경량화)",
    "annotation": "왼쪽에 큰 중괄호를 사용해 'Training' / 'Inference' 표기",
    "use_case": "학습과 추론 흐름을 명확히 구분해야 하는 방법"
  }
}
```

적용 예: 지식 증류, 자기 지도 사전 학습, 준지도 방법.

## 변형 3: 반복 / Recurrent 파이프라인

```json
{
  "type": "반복 / 순환 파이프라인 그림",
  "modify": {
    "layout": "단계는 가로로 배치하되, 마지막 단계에서 두 번째 단계로 돌아가는 곡선 화살표를 그려 순환 구조를 만듦",
    "annotation": "순환 화살표에 'iterate × N' 또는 'until convergence' 표기",
    "use_case": "반복 최적화, 확산 디노이징, Diffusion model의 timestep 흐름"
  }
}
```

적용 예: 확산 모델, 반복 세분화 방법, 에너지 모델.

## 변형 4: 공학 연구 로드맵(좌 / 중앙 / 우의 3단 구성)

```json
{
  "type": "공학 연구 로드맵(engineering research roadmap)",
  "modify": {
    "layout": "좌 / 중앙 / 우의 3단 구성: 왼쪽 = 연구 대상과 배경(단순화한 선화 도식), 중앙 = 여러 단계의 분석 경로(학술적인 모듈 4~7개), 오른쪽 = 결과와 방향성을 나타내는 출력(짧은 결론 방향 3~4개)",
    "rule": "세 영역의 너비 비율은 약 2:5:2입니다. 양쪽에는 학술적인 짧은 문구와 단순화한 선화를 사용하고, 상업용 아이콘 / 사실적인 렌더링 / 불꽃이나 짙은 연기 효과는 금지합니다. 중앙 분석 경로의 모듈은 크기를 통일하고 엄격하게 정렬하며 연결 관계를 간결하게 표현합니다.",
    "tone": "고품질 Graphical Abstract와 방법론 로드맵을 결합한 공학 논문 그림에 가깝게 표현합니다. Office 흐름도나 상업용 포스터처럼 보이지 않게 합니다.",
    "stage_naming_examples_for_engineering": [
      "fuel / material characterization",
      "kinetics / thermodynamics analysis",
      "experimental setup OR numerical model",
      "boundary / operating condition design",
      "process simulation or experiment",
      "field / behavior evaluation",
      "emission / performance analysis"
    ],
    "color_palette": "짙은 파랑 / 슬레이트 블루 / 차콜을 기본으로 사용합니다. 사용자가 고온 또는 위험을 언급한 경우에만 채도가 낮은 앰버를 강조색으로 추가하며, 주요 색상은 최대 3개입니다.",
    "data_authenticity": "실제 데이터가 제공되지 않았다면 방정식, 반응 속도 상수, 온도 값, 배출 계수, 차트 수치를 지어내지 마세요. 모듈 요약은 정성적인 문구로만 표시합니다.",
    "use_case": "에너지 동력 / 연소 / 열에너지 공학 / 환경 공학 / 재료 / 화학 공학 등 공학 분야의 연구계획 발표, 리뷰 논문, Methods 장 첫 그림. CS/CV 파이프라인의 가로형 단계 블록 구조와 구별됩니다."
  }
}
```

적용 예: 에너지 동력, 연소, 열에너지 공학, 환경 공학, 화학 공학, 재료 등 공학 분야의 연구 로드맵과 고품질 Graphical Abstract를 결합해야 하는 경우. CS/CV/ML 분야라면 기본 템플릿을 우선 사용합니다.

## 피해야 할 사항

- 그라데이션 / 그림자 / 유리 질감을 사용하면 즉시 논문 스타일이 아닌 “PPT 스타일”이 됩니다.
- 단계 블록의 크기가 서로 다르거나 높이가 맞지 않음
- 이모지 / 만화 아이콘을 단계 glyph로 사용
- Comic Sans / 손글씨체를 제목 글꼴로 사용
- 색상이 4개를 초과하거나 채도가 지나치게 높음
- 입력과 출력 썸네일의 해상도가 눈에 띄게 다름
- 화살표가 단계 블록을 통과하거나 레이블이 서로 겹침
- 명시적인 이중 언어 요청이 없는데 중국어와 영어 레이블을 혼용
- “비교 방법”을 같은 파이프라인에 함께 그림(`qualitative-comparison-grid.md` 사용)
- 네트워크 레이어 세부 정보(컨볼루션 커널 크기, 활성화 함수)를 파이프라인 그림에 넣음(`neural-network-architecture.md`의 범위)
