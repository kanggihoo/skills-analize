# 그래픽 초록 / 그래픽 초록 템플릿

이 파일은 "저널 제출 그래픽 초록/종이 그래픽 초록/제출 표지 이미지"를 생성하는 데 사용됩니다.

- 저널 제출 요구 사항에 수반되는 그래픽 초록
- 사진 한 장으로 논문 개요("사진 한 장으로 주요 기여를 설명합니다")
- 국방홈페이지/단체보고 홈페이지에 연구 하이라이트 사진 게재

특징:

- 미니멀하고 컴팩트한 4부 핵심 서사(문제 → 방법 → 핵심 프로세스 → 결과)
- 수평좌측→우측 또는 중앙 확장 레이아웃
- 흰색 배경, 낮은 채도의 엔지니어링 색상, 3개 이하의 기본 색상, **고품질 저널 그래픽 초록과 같고 결코 마케팅 포스터와 같지 않음**
- 텍스트를 짧은 문구로 다듬고 단락 설명을 금지합니다.

## 적용범위

- Elsevier / ACS / Wiley / Springer / IEEE 등 저널에 제출하려면 그래픽 초록이 필요합니다.
- arXiv/preprint README 상단의 "연구 이미지"
- 종이 보충 또는 강조 그림
- 국방/보고 "연구 하이라이트" 페이지

## 언제 사용하는가

- 사용자가 "그래픽 초록/그래픽 초록/제출 초록 사진/명확하게 설명하기 위한 사진 1장/그림 강조 표시"를 언급했습니다.
- 사용자는 시각적인 "저널 표지 수준의 추상 이미지, 간결하고 절제된 학술 스타일"을 희망합니다.
- 사용자는 "이 논문이 수행한 작업과 달성한 작업"을 1~2개의 문장으로 명확하게 설명할 수 있습니다.

사용하지 마세요:

- 사용자가 원하는 것은 "메소드 파이프라인 개요" → `academic-figures/method-pipeline-overview.md` 사용
- 사용자가 원하는 것은 "제안제안/방어 홈페이지 개요 사진" → `academic-figures/research-overview-poster.md` 사용
- 사용자가 원하는 것은 "기구/기구도" → `academic-figures/mechanism-diagram.md`를 사용
- 사용자가 원하는 것은 "마케팅/브랜딩/잡지 표지 느낌" → `poster-and-campaigns/editorial-cover.md` 사용

## 누락정보 우선순위 질문 순서

1. 연구주제(1문장, 제목 또는 그림설명에 기재)
2. 대상 저널 또는 대상 장면(화면 비율 + 기본 색상 결정, 저널마다 선호도가 다름)
3. 4가지 핵심 요소: 연구 질문/방법 또는 시스템/핵심 프로세스 또는 메커니즘/주요 결과
4. "연구 대상"(입자/분자/장치/공정)을 단순화하여 표현한 것이 있습니까?
5. 라벨 언어(중국어/영어/이중언어; 대부분의 저널은 영어를 요구함)
6. 비율(기본 가로 16:9 / 2:1; 일부 저널에서는 정사각형 1:1을 요구하므로 먼저 확인하십시오)

## 메인 템플릿: 가로 4섹션 그래픽 초록

📖 설명

전체 그림은 수평으로 흐릅니다. 맨 왼쪽의 "연구 질문/연구 개체"에서 시작하여 "방법/시스템", "핵심 프로세스/메커니즘" 및 "주요 결과"가 이어집니다. 네 영역의 비율이 균등하고 텍스트가 짧은 문구로 다듬어졌으며 시각적 계층 구조가 명확하고 전체적인 이미지가 고품질 엔지니어링 저널 초록처럼 보입니다.

📝 프롬프트 단어```json
{
  "type": "学术期刊图形摘要（Graphical Abstract）",
  "goal": "生成一张可直接用于期刊投稿的 Graphical Abstract，要求极简、白底、工程化克制配色、几秒内可读、绝无营销海报感",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"2:1\"}",
    "background": "pure white #FFFFFF",
    "outer_padding": "60px around the diagram",
    "render_quality": "vector-clean look, anti-aliased edges, sharp text, suitable for grayscale print"
  },
  "title_block": {
    "enabled": "{argument name=\"title_block_enabled\" default=\"false\"}",
    "title": "{argument name=\"title\" default=\"\"}",
    "rule": "most journals do not allow titles inside the graphical abstract; enable only when user explicitly requested a title"
  },
  "sections": [
    {
      "id": "P1",
      "role": "Problem",
      "label": "{argument name=\"problem_label\" default=\"Research Problem\"}",
      "summary": "{argument name=\"problem_summary\" default=\"a short phrase stating the gap, e.g. 'unstable combustion under variable moisture'\"}",
      "depiction": "{argument name=\"problem_depiction\" default=\"a minimal line-art sketch of the studied object or scenario\"}"
    },
    {
      "id": "P2",
      "role": "Method",
      "label": "{argument name=\"method_label\" default=\"Method\"}",
      "summary": "{argument name=\"method_summary\" default=\"a short phrase, e.g. 'thermogravimetric + kinetics analysis'\"}",
      "depiction": "{argument name=\"method_depiction\" default=\"a minimal schematic of the analytical or experimental setup\"}"
    },
    {
      "id": "P3",
      "role": "Process",
      "label": "{argument name=\"process_label\" default=\"Key Mechanism\"}",
      "summary": "{argument name=\"process_summary\" default=\"a short phrase, e.g. 'two-stage volatile combustion'\"}",
      "depiction": "{argument name=\"process_depiction\" default=\"a small mechanism strip with 2-3 sub-steps, line-art style\"}"
    },
    {
      "id": "P4",
      "role": "Result",
      "label": "{argument name=\"result_label\" default=\"Outcome\"}",
      "summary": "{argument name=\"result_summary\" default=\"a short phrase, e.g. 'optimized excess-air ratio reduces NOx by ~X%'\"}",
      "depiction": "{argument name=\"result_depiction\" default=\"a minimal qualitative chart sketch (no fabricated numbers) or a result icon (gauge / bar)\"}"
    }
  ],
  "section_block_style": {
    "shape": "implicit columns separated by generous whitespace, NOT four heavy rectangles in a row",
    "header_text": "section label in bold sans-serif, 12-13pt, top-aligned",
    "summary_text": "single phrase, 10pt regular, max 2 lines, no period",
    "depiction_size": "around 35-50% of column height, vertically centered"
  },
  "connectors": {
    "style": "thin arrows (1.2px) with simple triangle arrowheads, dark gray #334155, between adjacent sections only",
    "rule": "no crossing, no curved decorative arcs; arrows convey 'leads to' / 'analyzed by' relationships",
    "label_arrows": "false by default; only add label when the relationship is non-trivial"
  },
  "color_palette": {
    "rule": "≤ 3 main colors total, drawn from a low-saturation engineering set: deep blue #1E3A8A / slate blue #3B82F6 / charcoal #1F2937; allow ONE low-saturation accent (e.g. amber #F59E0B for a heat / risk highlight) only if the user signaled a thermal or risk emphasis",
    "must_print_grayscale_readable": true
  },
  "typography": {
    "language": "{argument name=\"language\" default=\"english\"}",
    "rule": "english → Inter / Helvetica / Arial; chinese → PingFang SC / Source Han Sans; bilingual → english as primary, chinese as smaller secondary line",
    "consistency": "all section headers identical size; all summaries identical size; never mix serif and sans-serif"
  },
  "constraints": {
    "must_keep": [
      "all four sections visually equal-weight, no section dominates",
      "white background, no gradient, no decorative pattern, no photographic background",
      "language matches the target journal (default english)",
      "summaries are short phrases, never full sentences with periods",
      "the figure must look like it could appear on an Elsevier / ACS / IEEE table of contents page",
      "every numerical claim must come from the user; if absent, render qualitatively"
    ],
    "avoid": [
      "marketing-poster aesthetics, brand campaign aesthetics, magazine cover aesthetics",
      "3D effects, drop shadows, gradients, glossy fills, lens flare, motion blur",
      "exaggerated flames, smoke, sparks (even when the topic is combustion)",
      "cartoon mascots, emoji, decorative icons, hand-drawn wobble",
      "stock-photo-style realistic backgrounds",
      "fabricated numbers, percentages, equations, or chart data not provided by the user",
      "saturated colors (no neon, no vivid), more than 3 main colors",
      "watermarks, copyright stamps, vendor logos"
    ]
  }
}
```
### 매개변수 전략

- **필수**: 4 `*_summary`(질문/방법/핵심 프로세스/결과)는 하나 이상의 구문을 제공할 수 있습니다.
- **기본값**: `aspect_ratio`(2:1), `background`(흰색), `color_palette`(진한 파란색/회색 파란색/검은 회색)
- **무작위화 가능**: 각 섹션의 `*_depiction` 특정 모양(사용자가 개체/메서드 이름을 제공하면 추론 가능. 그렇지 않으면 질문)

### 자동완성 전략

- 사용자가 주제만 제공하고 4문단을 제공하지 않음 → 요약 4개 요청, **연구 내용을 만들어내는 것을 금지함**
- 사용자가 정성적 기여를 했으나 집계되지 않음 → `qualitatively shows` / `consistently reduces` 등 숫자가 아닌 표현 사용
- 사용자가 숫자를 부여함(예: "NOx 18% 감소") → `~18%`를 직접 작성, 다른 지표를 위조하지 않음
- 사용자가 "중국 저널 / 중국 추상 그림"이라고 말했다 → 중국어 + 글꼴 PingFang / Siyuanhei 전환

## 변형 1: 허브 앤 스포크```json
{
  "type": "中心展开式 Graphical Abstract",
  "modify": {
    "layout": "中心放置研究对象 / 核心系统的简化示意，向外辐射出 3-4 个扇区，每个扇区代表一个核心要素（问题、方法、机制、结果之一）",
    "rule": "扇区在视觉上等权，使用细线条分隔；中央对象占画面 30-40%",
    "use_case": "适合系统型研究、平台型研究，或难以线性叙事的多模态贡献"
  }
}
```
적용 대상: 포괄적인 연구, 체계적인 기여(예: 새로운 플랫폼, 새로운 프레임워크)

## 변형 2: 정사각형 1:1(일부 저널에서 요구함)```json
{
  "type": "方形 Graphical Abstract",
  "modify": {
    "aspect_ratio": "1:1",
    "layout": "2×2 网格，左上 = 问题 / 对象，右上 = 方法，左下 = 关键过程，右下 = 结果",
    "rule": "四象限严格等大、对齐；象限间留出统一间距；箭头沿 Z 字型走 P1 → P2 → P3 → P4",
    "use_case": "ACS / Wiley 等部分期刊要求方形 Graphical Abstract"
  }
}
```
적용 대상: 제출 시 제곱 비율이 필요한 저널.

## 변형 3: 세로(소셜 미디어/사전 인쇄된 카드)```json
{
  "type": "竖版 Graphical Abstract",
  "modify": {
    "aspect_ratio": "3:4",
    "layout": "上 → 下 四段式：Problem → Method → Mechanism → Outcome",
    "rule": "宽度紧凑，每段保留呼吸空间；适合手机端或 Twitter / LinkedIn 卡片预览",
    "use_case": "用于社交媒体推广预印本、Lab 主页 highlight 卡"
  }
}
```
적합: 원고 제출 이외의 과학 연구 진흥, 학문적 제한 스타일 유지.

## 피해야 할 것

- "전체 텍스트 압축 버전"으로 그래픽 초록을 작성합니다. - 모든 방법 단계, 모든 공식 및 모든 결과를 삽입합니다.
- 그라데이션 / 유리질감 / 후광 / 3D 등 어떤 형태로든 사용 → 즉시 마케팅 이미지로 연출
- 중국어와 영어 라벨을 자유롭게 혼합하세요(이중 언어가 명시적으로 요구되지 않는 한).
- 실제 데이터가 없는 경우 특정 값으로 세로 막대형 차트/선을 그립니다. (**가짜 데이터는 엄격히 금지됩니다**, 정성적 표시만 가능)
- 채도가 높은 브랜드 또는 네온 색상을 사용합니다. 저널 추상 이미지는 채도가 낮은 엔지니어링 색상을 유지해야 합니다.
- 연구 대상을 초현실적인 3D 렌더링으로 그린다(아카데미 스타일은 단순화된 선 그리기가 필요함)
- 저널 로고/워터마크/"제출 대상..." 및 기타 태그 추가