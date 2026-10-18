# gpt-image-2 분석

## 1. 개요

- **원본 경로**: `skills-collections/garden-skills/gpt-image-2/`
- **핵심 파일**: `SKILL.md` (26,643 bytes)
- **보조 파일** (총 90개 파일):
  - `references/prompt-writing.md` — 템플릿 방법론 총규범 (JSON 템플릿 설계 규칙)
  - `references/` 하위 **18개 분류 디렉토리 × 총 80여 개 단일 템플릿 Markdown**:
    ui-mockups(6) / product-visuals(6) / maps(5) / slides-and-visual-docs(4) / poster-and-campaigns(8) / portraits-and-characters(5) / scenes-and-illustrations(4) / editing-workflows(5) / avatars-and-profile(5) / storyboards-and-sequences(8) / grids-and-collages(5) / branding-and-packaging(6) / typography-and-text-layout(2) / assets-and-props(2) / academic-figures(9) / infographics(6) / technical-diagrams(7)
  - `scripts/` 5개: `check-mode.js`, `generate.js`, `edit.js`, `shared.js`, `package.json`
  - `manifest.json`, `README.md`, `README.zh-CN.md`
- **성격**: **GPT Image 2 이미지 생성/편집 스킬**. 3가지 실행 모드(로컬 API / 호스트 위임 / 프롬프트 고문)를 감지해 동작이 갈리며, 실체는 **구조화된 JSON 프롬프트 템플릿 라이브러리**. 문서 언어는 중국어.

원문 자기 규정: "它只做两类图像任务：生成图片 `POST /images/generations` / 编辑图片 `POST /images/edits`"

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문 (중국어, 전문):

> "面向 GPT Image 2 的图像生成 / 编辑技能。可在 3 种环境下使用：(A) Garden 本地模式，通过 OpenAI 兼容接口直接出图并落盘；(B) Host-Native 模式，把本 Skill 当作提示词工程指引，把渲染好的 prompt 交给宿主 Agent 自带的图像工具出图；(C) Advisor 模式，宿主无任何图像工具时退化为高质量 prompt 顾问。涵盖 18 大类、80+ 个结构化模板，覆盖海报 / UI / 产品 / 信息图 / 学术图 / 技术架构图 / 漫画 / 头像 / 流程板 / 电影分镜 / IP 周边 / 编辑工作流等场景。"

**매칭되는 사용자 발화**
- "포스터/배너/히어로 이미지 만들어줘"
- "이 이미지 배경 바꿔줘", "이 물체 지워줘" (편집)
- "논문용 pipeline figure 그려줘", "시스템 아키텍처 다이어그램"
- "인포그래픽", "4컷 만화", "캐릭터 설정 시트", "스티커 세트", "브랜드 아이덴티티 보드"
- description이 커버 범위를 열거하므로 이미지 관련 발화 전반에 매칭될 가능성이 큼 (海报 / UI / 产品 / 信息图 / 学术图 / 技术架构图 / 漫画 / 头像 / 流程板 / 电影分镜 / IP 周边 / 编辑工作流)

`allowed-tools` / `metadata`: **원문에 명시 없음.** `manifest.json`에 `compat` 목록.

## 3. 적합한 상황 / 부적합한 상황

**적합**
- 요소가 많고 영역이 분할된 복잡한 이미지 — `prompt-writing.md`가 JSON 템플릿 사용 조건을 명시: "画面元素很多 / 画面包含多个功能区域 / 需要 UI / 商品卡 / 评论区 / 图例 / 标注 / 页眉页脚等结构 / 需要支持多个变体 / 需要支持'用户指定 / 默认值 / 随机生成'三种模式 / 后续很可能复用、扩写或调试"
- 논문·학회 투고용 도판 — `academic-figures/` 9개 템플릿이 출판 규격을 강제
- 기존 이미지 편집 — `editing-workflows/` 5개 (배경 교체, 국소 대체, 물체 제거, 제품 정밀 보정, 인물 국소 수정) + `edit.js`의 마스크 지원
- **API 키가 없어도 가치가 있음** — Mode C에서 재사용 가능한 고품질 프롬프트를 파일로 산출
- 프롬프트를 버전 관리하며 반복 실험할 때 — 프롬프트가 항상 파일로 낙반

**부적합 / 과한 상황**
- 단순 단일 주체 이미지 — `prompt-writing.md`: "不必强行使用 JSON 模板的场景：很简单的单主体图 / 没有复杂布局和多区域结构 / 用户只想快速试一个很轻量的视觉方向"
- **편집 가능한 벡터 다이어그램이 필요할 때** — `technical-diagrams/`에 명시적 경고: "⚠️ 注意：本目录生成的是 **PNG 位图**，**不是可编辑 SVG**；需要可编辑请改用 mermaid / draw.io / excalidraw / Figma"
- 정량 데이터가 있는 학술 도판 — "**严格禁止虚构定量数据**（数值 / 等值线 / 色标范围 / 公式）"
- 코드로 구현하는 UI — 이 스킬은 UI **목업 이미지**를 만들며 실제 프론트엔드 코드가 아님

**형제 스킬 대신 이걸 고르는 기준**: 산출물이 **래스터 이미지**인가. 같은 컬렉션에서 — 읽을 기사면 `beautiful-article`, 실제 웹 코드면 `web-design-engineer`, 영상이면 `web-video-presentation`.

## 4. 외부 의존성 (**이 스킬의 핵심 판단 지점**)

### API 키
- **`OPENAI_API_KEY`** — **Mode A에서만 필수.** 원문: "`OPENAI_API_KEY` — Mode A 必需；B / C 不需要."
- **`ENABLE_GARDEN_IMAGEGEN`** — **모드 스위치.** `1` / `true` / `yes` / `on`일 때 Mode A 활성화
- **`OPENAI_BASE_URL`** — 기본 `https://api.openai.com/v1`, 서드파티 호환 게이트웨이 지정 가능
- **`OPENAI_IMAGE_MODEL`** — 기본 `gpt-image-2`, 게이트웨이가 지원하는 모델로 교체 가능 (`gpt-image-1` / `dall-e-3` 예시)

**환경변수 읽기 순서** (원문):
1. CLI 인자
2. `process.env`
3. `<cwd>/.env`
4. `<cwd>/.gateway.env`
5. `~/.gateway.env`

"默认实现按 OpenAI 兼容接口工作，不写死任何第三方网关."

### 키가 없을 때의 동작 (**폴백이 명시적으로 설계됨**)

이 스킬의 가장 특징적인 설계다. 3모드 결정표 (원문):

| 条件 | 模式 | 调用脚本？ | 落盘 prompt？ | 落盘图片？ |
|---|---|---|---|---|
| `ENABLE_GARDEN_IMAGEGEN=1` + 有 KEY | **A** | ✅ `generate.js` / `edit.js` | ✅ 自动 | ✅ 自动 |
| `ENABLE_GARDEN_IMAGEGEN=1` 但没 KEY | A? | ❌（先要 KEY） | — | — |
| 未启用 + 宿主有图像工具 | **B** | ❌（用宿主工具） | 可选 | 由宿主决定 |
| 未启用 + 宿主无图像工具 | **C** | ❌ | ✅ 必须 | ❌（无法） |

- **Mode B (Host-Native)**: 스킬이 "**退化成提示词工程指引**"이 되어, 렌더링한 프롬프트를 호스트 에이전트의 이미지 도구에 전달. 금지 규칙: "**不要调用 `node scripts/generate.js`**（没有 API key、必失败）"
- **Mode C (Advisor)**: "退化为'高质量 prompt 撰写顾问'". 프롬프트를 사용자에게 출력 + 파일 저장 + "如何使用" 조언. **금지**: "**不要假装出图成功**。明确告知用户：'已生成可直接复用的高质量 prompt，请用你的图像工具执行。'"
- **Mode A 실패 시**: "调脚本失败（401 / 网络 / 配额）→ 报错并询问'切到 B / C 吗？'"
- **모드 불확실 시**: "**直接问用户一句**：'是用你环境里的图像工具出图，还是只要我写好提示词？'"

### 기타 의존성
- **Node.js** — 4개 스크립트 (`check-mode.js`, `generate.js`, `edit.js`, `shared.js`) 실행
- **네트워크** — Mode A에서 필수 (OpenAI 호환 엔드포인트)
- **비용 발생 지점**: **Mode A의 이미지 생성/편집 API 호출**. `--size`, `--quality high` 등 파라미터가 비용에 직결. Mode B는 호스트 도구의 비용, Mode C는 비용 0.

## 5. 워크플로우

### 제0단계 (모든 작업의 첫 단계) — 모드 감지 게이트
```bash
node skills/gpt-image-2/scripts/check-mode.js
node skills/gpt-image-2/scripts/check-mode.js --json   # 구조화 결과
```
"输出会给出 `mode = A` / `A?` / `B-or-C` 以及 `recommendation`"
원문 강조: "**第一步必须先确定当前运行模式**" / "**先跑这个**"

**Mode B 자기 식별 신호** (원문):
- "你的工具集里出现 `image_generation` / `imagegen` / `dalle` / `nano_banana` / `mcp__*image*` / `make_image` / 类似名字"
- "用户在 ChatGPT / Codex / Gemini / Cursor 等支持原生出图的客户端中调用本 Skill"
- "用户显式说'用你自己的工具出图'"

### 프롬프트 워크플로우 (모드 인식) — 1~6단계는 공통, 7~8단계에서 분기

1. **`check-mode.js`로 모드 확정** (A / B / C)
2. 생성 작업인지 편집 작업인지 판단
3. 어느 분류 디렉토리에 속하는지 식별 (템플릿 인덱스 참조)
4. **해당 템플릿 파일만 읽기** — "**不要一次读整个 references/**"
5. 템플릿 형식 엄수. **형식 분기**: "大部分模板用 JSON 主模板（结构化任务首选），少数模板（`infographics/hand-drawn-infographic.md`、`academic-figures/scientific-schematic.md` 等）使用「结构化自然语言 + 参数」混合形式，**因为强行 JSON 会限制创作自由**"
6. 사용자 입력을 템플릿 파라미터에 매핑. 핵심 정보 부족 시 **표적화된 확인 질문**
   → 여기까지 프롬프트 렌더링 완료

**7단계 분기**
- **7-A (Mode A)**: 프롬프트를 `garden-gpt-image-2/prompt/`에 저장 → `generate.js` 또는 `edit.js` 호출 → 이미지가 `garden-gpt-image-2/image/`에 낙반
- **7-B (Mode B)**: 프롬프트를 호스트 이미지 도구에 직접 전달, 필요시 프롬프트 사본 저장
- **7-C (Mode C)**: 프롬프트를 `garden-gpt-image-2/prompt/<task-slug>-<timestamp>.md`에 저장 + 대화에 전문 표시 + "如何使用 / 推荐工具" 한 줄

8. **종료 보고 (1문장)**: "当前模式是什么、prompt 落在哪、图（如有）落在哪"

### JSON 템플릿 사용 규칙 (7항목, 원문)
1. `SKILL.md`에서 가장 가까운 분류 디렉토리를 찾는다
2. 구체적 템플릿 파일로 좁힌다
3. 템플릿의 `{argument ...}`는 치환 가능한 파라미터
4. 사용자가 명시한 값은 그대로 채운다
5. 사용자가 주지 않았지만 `default`가 표시된 것은 기본값 사용 가능
6. **결과에 현저히 영향을 주는 정보가 없으면 능동적으로 질문**
7. 사용자가 "你随机生成"이라고 하면 기본값 유지 또는 템플릿 허용 범위 내 합리적 랜덤화

### 질문 규칙 (**막연한 질문 금지**)
"当模板缺少关键变量时，**不要笼统地问'你想要什么风格？'**。应当**根据模板字段精确提问**."

원문 예시 (라이브 커머스 UI 템플릿):
- 主播是谁?
- 用真人照片、名人名字、人物描述，还是完全随机生成?
- 商品名称是什么? / 商品价格是否指定? / 是否希望我自动补全评论和礼物内容?

### 언제 질문할 것인가 (**게이트, 6개 조건**)
"只在这些信息缺失且会显著影响结果时提问":
- 没有 prompt 目标
- 改图时没有原图
- 主体身份或视觉类型决定结果走向
- 商品 / 价格 / 文案 / UI 文本是画面核心组成部分
- 用户同时表达了多个互相冲突的目标

"除此之外，**优先自己做合理默认并继续执行**." → 즉 질문을 최소화하는 방향. (`beautiful-article`의 3-Checkpoint 강제 정지와 정반대 태도)

### 사용자 입력 도구 규칙
1. 우선 현재 런타임이 제공하는 사용자 입력 도구 사용
2. 없으면 짧은 순수 텍스트 번호 질문
3. "能合并的问题尽量一次问完"

**사용자 확인 요구 지점**: 정보 부족 시의 표적 질문 + 모드 불확실 시의 확인. 강제 Checkpoint는 없음.

## 6. 디자인 지침 분석

이 스킬의 디자인 지침은 **80여 개 템플릿 파일에 분산**되어 있고, `prompt-writing.md`가 그 **메타 규격**을 정한다. SKILL.md 자체에는 미적 규칙이 거의 없다.

### 템플릿 파일의 표준 구조 (`prompt-writing.md` 三节)
```markdown
# 模板名称
## 适用范围
## 何时使用
## 缺失信息优先提问顺序
## 主模板
  📖 描述
  📝 提示词  ```json { ... } ```
### 参数策略
### 自动补全策略
### 变体方式
## 变体 1
## 变体 2
## 避免事项
```
필수 규정: "`主模板` 必须先有 / 变体模板建立在主模板之上 / **参数策略、自动补全策略、避免事项不能省略**"

### JSON 템플릿 권장 골격 (8개 필드)
```json
{
  "type": "模板类型",
  "goal": "图像用途",
  "subject": {},
  "scene": {},
  "layout": {},
  "style": {},
  "details": {},
  "constraints": {}
}
```
필드 책임 (원문):
- `type` — 템플릿 유형명
- `goal` — "说明这张图最终要干什么"
- `subject` — 主体内容 (人物 / 商品 / 城市 / 角色 / 插画主角)
- `scene` — 场景、背景、环境、氛围
- `layout` — "画面区域组织方式" (海报 / UI / 地图 / slides / 多区域结构图)
- `style` — "风格、渲染、材质、色彩倾向、光线"
- `details` — 局部细节 (商品卖点 / callout labels / 评论内容 / 图例元素 / 页脚文案)
- `constraints` — "必须出现什么 / 必须避免什么 / **最终结果更像什么、不像什么**"

**즉 미적 판단을 JSON 필드로 구조화**하는 것이 이 스킬의 방법론이다. `style`과 `constraints`가 미학을 담는 자리다.

### 금지 규칙 (anti-pattern) — 원문 그대로

**스킬 수준**
- "**不要一次读整个 references/**"
- "**不要调用 `node scripts/generate.js`**" (Mode B)
- "**不要假装出图成功**" (Mode C)
- "除非用户明确要求，否则**不要把 SKILL.md 里的'模式说明'复制到最终 prompt 里**——那是给 Agent 看的元信息"
- "**不要笼统地问'你想要什么风格？'**"
- 디렉토리 구조 금지: "不要继续采用：一个大类一个大文件 / 一个来源一个文件 / 一个案例一个没有分类的平铺文件"

**분류 수준의 금지 (academic-figures, 원문)**
- "**严格禁止虚构定量数据**（数值 / 等值线 / 色标范围 / 公式）"
- `publication-chart.md`의 避免事项:
  - "用 3D 柱 / 3D 饼 → **严重不专业**"
  - "用彩虹 / jet colormap 表示连续值（**学界已抛弃**）"
  - "漏掉单位 / 漏掉坐标轴标签"
  - "value 标签过小读不清"

**technical-diagrams 수준**
- "⚠️ 生成的是 **PNG 位图**，**不是可编辑 SVG**"

**템플릿 수준의 금지 (`banner-hero.md` 예시)**
```json
"constraints": {
  "must_keep": ["headline 字号最大", "CTA 必须可点击感（明确按钮形态）",
                "主视觉在右侧不超出安全区", "色板严格统一"],
  "avoid": ["headline 与主视觉重叠", "CTA 颜色与背景对比过低",
            "信息密度过高", "主视觉横跨整个画面无 claim 空间"]
}
```
그리고 라우팅 금지: "不要使用：竖图 / 方图主海报（用 `brand-poster.md`）/ 系列 KV（用 `campaign-kv.md`）/ 杂志封面（用 `editorial-cover.md`）"

### 강제 규칙 — 수치 인용

**전역 수치 (SKILL.md)**
- 타임스탬프 형식: `20260424-153045` (즉 `YYYYMMDD-HHMMSS`)
- `generate.js` 예시 파라미터: `--size 1024x1024`, `--quality high`
- 응답 파싱 우선순위: "`data[0].b64_json` 解析，也兼容 `data[0].url`"
- Mode A 생성은 JSON body, 편집은 multipart form data

**분류 수준 수치 (academic-figures)**
- "整体偏白底 + 出版物字体 + 几何精确 + 低饱和工程色（深蓝 / 灰蓝 / 黑灰为主，**≤3 主色**）+ **可单色印刷**"

**분류 수준 수치 (technical-diagrams)**
- "统一暗色 grid 背景 + 等宽字体 + 角色编码配色，**每个模板都附 light 变体**"

**템플릿 수준 수치 (`banner-hero.md`)**
- 비율: "横向比例（**16:9 / 21:9 / 3:1**）", 기본 `16:9`
- 안전 영역: "底部 **10%** + 右侧 **5%** 留白，避免裁切"
- 히어로 비주얼 크기: 기본 "占右侧 **80%**"
- 배경: 기본 "浅色渐变" + 장식 "微噪点 + 极淡几何形"
- 로고 위치: "左上角"
- 내비게이션: "顶部导航条已存在，banner 不要画"

**템플릿 수준 수치 (기타 인덱스에서 확인되는 것)**
- `itinerary-day-trip-map.md`: "**5-7 站点严格对齐**"
- `cinematic-storyboard-grid.md`: "**3×4 / 4×4**"
- `product-tvc-storyboard.md`: "**9-panel** 实拍质感 + 镜头描述 + 时长"
- `banner-grid-2x2.md`: "**2×2** 营销 banner 套装（一次出 **4 张**统一系列设计）"
- `lookbook-grid.md`: "**7 日** lookbook / **9 宫** self-care"
- `lineup-comparison-poster.md`: "**30+ SKU** 同图"
- `full-mascot-brand-doc.md`: "**18+ 模块**"
- `qualitative-comparison-grid.md`: "**行 = 样本，列 = 方法**"
- `multi-condition-comparison.md`: "**2×2 / 1×N / M×N**"

### 항목별 지침

- **타이포그래피**: 분류·템플릿 수준에 존재. academic-figures = "出版物字体", technical-diagrams = "等宽字体", `typography-and-text-layout/` 분류 전체가 문자 주도 시각 (title-safe-poster = "日式高能量 / 瑞士极简 / 复古印刷", bilingual-layout-visual = 中英/中日 이중언어 판식). banner-hero = "headline 字号最大". 구체적 서체명·크기 스케일은 **SKILL.md에 명시 없음** (템플릿별).
- **컬러**: `style` 필드가 "色彩倾向"을 담당. 분류 수준 규정 — academic-figures "低饱和工程色（深蓝 / 灰蓝 / 黑灰为主，≤3 主色）", technical-diagrams "角色编码配色", infographics "macaron / morandi / 黑板 / 牛皮纸" 팔레트 계열. 금지 — "彩虹 / jet colormap", "CTA 颜色与背景对比过低". 대비 비율 수치는 **원문에 명시 없음.**
- **스페이싱**: 안전 영역(safe_area)으로 표현 — banner-hero "底部 10% + 右侧 5% 留白". spacing scale 개념은 **원문에 없음** (래스터 이미지이므로 해당 없음).
- **모션**: **원문에 지침 없음** (정지 이미지 스킬).
- **레이아웃**: `layout` 필드가 전담. 분류마다 고유 레이아웃 어휘 — UI mockups는 `ui_overlay: { top_header, chat_area, gift_area, product_card, bottom_bar }`, poster는 left_column/right_column, academic은 上中下三层 / 五模块 / 横向 4 段式 등.
- **접근성**: **원문에 지침 없음.** 유일하게 근접한 것이 "可单色印刷"(단색 인쇄 가능, academic-figures)과 "CTA 颜色与背景对比过低" 금지.

### 지침을 주는 방식 자체

1. **JSON 구조화로 미학을 필드화**: 감각을 산문으로 서술하지 않고 `style` / `constraints` / `details` 필드에 배치. "**模板文件中的 JSON 是提示词结构模板，不是 API 请求体模板**".
2. **must_keep / avoid 쌍**: 거의 모든 템플릿의 `constraints`가 "반드시 있어야 할 것"과 "피해야 할 것"을 쌍으로. `emilkowalski`의 `| Never | Instead |` 테이블과 같은 방법론이 JSON으로 구현된 형태.
3. **"最终结果更像什么、不像什么"**: `constraints` 필드의 정의에 **유사물 대조**가 명시됨. 즉 참조 대상을 긍정·부정 양쪽으로 지정.
4. **파라미터 3분류**: 必问 / 可默认 / 可随机. 예 (banner-hero) — "必问：headline、CTA、主视觉、比例 / 可默认：背景、副标题、安全区 / 可随机：装饰几何形". **질문 비용과 결과 품질의 트레이드오프를 필드 단위로 사전 결정.**
5. **자동 보완 전략 (自动补全策略)**: 정보 부족을 질문이 아니라 규칙으로 메움. 예 — "用户给产品名时：自动生成 1 句 headline + 1 句 sub + 1 个 CTA / CTA 默认品牌主色按钮 + 灰色辅助按钮 / **主视觉按行业自动选（SaaS = 截图，消费 = 产品，服务 = 人物）**".
6. **缺失信息优先提问顺序**: 각 템플릿이 질문 순서를 미리 정렬. banner-hero: "1. 용도 2. 主题/claim 3. 主视觉 4. CTA 文案+颜色 5. 品牌色 6. 比例".
7. **템플릿 간 라우팅**: "何时使用" 섹션이 "不要使用：… (用 X.md)"로 형제 템플릿을 지목. 80여 개 템플릿이 서로를 라우팅.
8. **주 템플릿 + 변체 (变体)**: 변체는 주 템플릿 위에 쌓임. 예 — banner-hero 변체 1 "纯图大背景 + 浮层文案", 변체 2 "长横条 banner（21:9 / 3:1）".
9. **JSON 강제의 예외를 인정**: "少数模板 … 使用「结构化自然语言 + 参数」混合形式，**因为强行 JSON 会限制创作自由**". `hand-drawn-infographic.md`, `scientific-schematic.md`가 그 예.
10. **분류 수준 공통 규격**: academic-figures와 technical-diagrams는 디렉토리 전체에 공통 스타일 규정을 부여. 개별 템플릿보다 상위의 일관성 장치.
11. **실물/분야 참조**: "Irasutoya × 霞关" (dense-explainer-slides), "Bell Labs 风" (vintage-editorial-infographic), "瑞士极简" / "复古印刷" (title-safe-poster), "BPMN 形状语义" (flowchart-decision), "crow's foot 关系" (er-diagram), "国潮 / 日式 / 西式" (beverage-label), "Kawaii 3D / Minecraft / 拟物 3D" (themed-3d-icon).
12. **선택 전략 명시 (academic-figures)**: "CS/CV/ML 论文首选 `method-pipeline-overview` + `qualitative-comparison-grid`；工程 / 能源 / 化工 / 材料方向首选 … 投稿期刊摘要图用 `graphical-abstract`；答辩 PPT 首页用 `research-overview-poster`" — 사용 목적별 템플릿 조합 추천.
13. **점진적 로딩**: "按任务类型只读取最贴近的具体模板文件". 90개 파일 중 실제로는 SKILL.md + 1개 템플릿만 로드.
14. **모드 인식 (mode-aware) 설계**: 같은 지침이 3가지 실행 환경에서 다른 종착점을 갖도록 워크플로우 자체를 분기. **API 키 없는 환경을 1급 시민으로 취급**하는 것이 이 컬렉션·전 컬렉션 중 가장 명확한 사례.

### 모호한 감각어의 번역

| 감각어 | 구체적 조작 |
| --- | --- |
| "**你想要什么风格？**" (막연한 질문) | **금지.** 템플릿 필드 단위 표적 질문으로 대체 ("主播是谁?", "商品价格是否指定?") |
| "**高级 / 杂志广告级氛围**" | `premium-studio-product.md` 템플릿 (내용은 해당 파일 참조) |
| "**严重不专业**" | 3D 막대/파이 차트, 무지개/jet colormap |
| "**学界已抛弃**" | jet colormap |
| "**可点击感**" | "明确按钮形态" (CTA) |
| "**信息密度过高**" | banner-hero의 avoid 항목. 조작적 정의는 원문에 없음 |
| "**色板严格统一**" | must_keep 항목. 수치 정의는 원문에 없음 |
| "**최종 결과가 무엇과 닮고 무엇과 닮지 않아야 하는가**" | `constraints` 필드에 유사물을 긍정·부정 양쪽으로 명시 |
| "**氛围、生活、品牌精神**" (변체 1) | `"must_feel"` 필드로 직접 표현 — 감각어를 필드값으로 그대로 두는 사례 |
| "**주 비주얼을 업종별로 자동 선택**" | SaaS = 스크린샷 / 소비재 = 제품 / 서비스 = 인물 |

특징: `beautiful-article`처럼 감각어를 규칙으로 해체하기보다, **감각어를 그대로 JSON 필드값으로 옮겨 담는다** (`must_feel: "氛围、生活、品牌精神"`). 이미지 생성 모델이 자연어 감각어를 직접 해석하므로 합리적인 설계이지만, 지침의 구체성은 그만큼 템플릿 작성자의 어휘에 의존한다.

## 7. 산출물

### 출력 디렉토리 (원문)
- 프롬프트: `garden-gpt-image-2/prompt/` — "**A / B / C 三种模式都建议用**，方便复用与版本管理"
- 이미지: `garden-gpt-image-2/image/` — "**仅 Mode A 使用**；Mode B 由宿主决定，Mode C 不产生图"
- "如果目录不存在，脚本（Mode A）必须自动创建；Mode B / C 在写 prompt 前手动 `mkdir -p`"

### 네이밍 규칙 (원문)
- 프롬프트: `garden-gpt-image-2/prompt/<task-slug>-<timestamp>.md`
- 이미지: `garden-gpt-image-2/image/<task-slug>-<timestamp>.png`
- `<task-slug>` = "根据当前用户要求自动提取一个相关短名称"
- `<timestamp>` = 예 `20260424-153045`

원문 예시:
```
garden-gpt-image-2/prompt/live-commerce-ui-20260424-153045.md
garden-gpt-image-2/image/live-commerce-ui-20260424-153045.png
garden-gpt-image-2/prompt/vr-headset-exploded-view-20260424-153102.md
```

### 프롬프트 저장 의무 (모드별)

| 모드 | 프롬프트 저장 필수? | 설명 |
|---|---|---|
| Mode A | ✅ 必须 | 실제 생성/편집 흐름에 들어가면 반드시 낙반 |
| Mode B | 推荐 | 기본 권장, 사용자가 "필요없다"면 생략 |
| Mode C | ✅ 必须 | "用户拿走 prompt 自己执行，**不落盘等于白干**" |

공통 규칙 4항목: 사용자가 프롬프트 파일 경로를 주면 그것을 입력으로 사용 / 텍스트 프롬프트를 직접 주더라도 최종 프롬프트는 저장 / `--prompt-output` 지정 시 그 경로 존중 / 그 외에는 기본 네이밍

### 이미지 저장 규칙 (Mode A만)
`--image` 또는 `--output` 명시 시 그 경로 / 아니면 기본 디렉토리 / 파일명은 작업 의미와 관련 + 타임스탬프

### 종료 보고
"任务结束后用一句话告诉用户：当前模式是什么、prompt 落在哪、图（如有）落在哪"

## 8. 주의점 / 한계

- **모드 감지가 모든 것의 전제**: `check-mode.js`를 건너뛰면 Mode B/C에서 `generate.js`를 호출해 401로 실패한다. 원문이 이를 반복 경고하지만 강제 장치는 없음.
- **Mode B의 자기 식별 신뢰도**: 호스트 도구 존재 여부를 도구 이름 패턴(`image_generation` / `dalle` / `nano_banana` / `mcp__*image*` 등)으로 추측한다. 새로운 이름 규칙의 도구는 놓칠 수 있고, 그때 Mode C로 잘못 떨어진다. 원문의 대응은 "판단 안 되면 사용자에게 물어라".
- **`ENABLE_GARDEN_IMAGEGEN`이라는 이중 게이트**: 키가 있어도 이 변수가 없으면 Mode A로 가지 않는다. 사용자 입장에서 "키를 넣었는데 왜 그림을 안 만드나" 혼란의 소지 — 원문에 이 안내는 없음.
- **PNG 래스터 한계**: `technical-diagrams/`가 명시적으로 경고하지만, 다이어그램을 이미지로 만든다는 것 자체가 편집·버전관리·접근성에 불리하다. 원문이 대안(mermaid / draw.io / excalidraw / Figma)을 제시하는 것은 정직한 처리.
- **학술 도판의 데이터 위조 위험**: "严格禁止虚构定量数据"라고 강하게 금지하지만, 이미지 생성 모델은 축 레이블·수치·등값선을 임의로 만들어낸다. 금지 규칙만으로는 방어가 불완전하며 **검증 장치가 없다**. 논문 투고용으로 쓸 때 가장 위험한 지점.
- **템플릿 품질의 불균일**: 80여 개 템플릿의 지침 구체성이 파일마다 다르다. `prompt-writing.md`가 "参数策略、自动补全策略、避免事项不能省略"으로 최소 규격을 정하지만, 실제 각 파일의 수치 밀도는 확인 필요 (샘플로 본 `banner-hero.md`는 안전영역·비율·필수/금지가 구체적, 반면 자연어 혼합 템플릿은 느슨).
- **비용 통제 장치 없음**: Mode A에서 `--size`, `--quality`가 비용에 직결되지만 기본값·상한·예산 경고가 **원문에 없다.** 반복 생성 시 비용 누적에 대한 언급도 없음.
- **언어**: SKILL.md와 모든 템플릿이 중국어. 영어 README 별도.
- **접근성·모션 지침 부재**: 정지 이미지 스킬이므로 모션은 해당 없으나, 이미지의 대체 텍스트·대비 요구 같은 접근성 지침도 없다.
- **강한 경고 지점**:
  - "**第一步必须先确定当前运行模式**"
  - "**不要调用 `node scripts/generate.js`**" (Mode B)
  - "**不要假装出图成功**" (Mode C)
  - "**严格禁止虚构定量数据**"
  - "⚠️ 生成的是 PNG 位图，不是可编辑 SVG"
  - "**不要一次读整个 references/**"
  - "**不要笼统地问'你想要什么风格？'**"
  - "不落盘等于白干" (Mode C 프롬프트 저장)
- **검증 장치**: `check-mode.js`(모드 검증), 템플릿의 `avoid` 목록, 학술/기술 분류의 공통 규격. **생성된 이미지 자체를 검증하는 장치는 없음** — 이 컬렉션의 `beautiful-article`(typecheck/build + 3시점 리뷰)이나 `web-design-engineer`(browser-acceptance)와 대비되는 약점.
