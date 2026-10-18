# beautiful-article 분석

## 1. 개요

- **원본 경로**: `skills-collections/garden-skills/beautiful-article/`
- **핵심 파일**: `SKILL.md` (31,482 bytes) — 이 컬렉션에서 가장 큰 SKILL.md
- **보조 파일** (총 60개 파일):
  - `references/` 20개: `harness.md`, `source-to-markdown.md`, `article-types.md`, `information-density.md`, `plan-template.md`, `theme-selection.md`, `layout.md`, `asset-policy.md`, `cover.md`, `section-build.md`, `component-policy.md`, `raw-policy.md`, `html-output.md`, `pdf-output.md`, `review-checklist.md`, `repair-policy.md`, `scaffold.md`
  - `references/article-types/` 10개: `longform.md`, `full-report.md`, `tutorial.md`, `explainer.md`, `dialogue.md`, `review.md`, `essay.md`, `interactive-explainer.md`, `briefing.md`, `visual-essay.md`
  - `theme-profiles/` 12개: `index.json` + 11개 테마 프로파일 (tufte, press, shannon, vignelli, knuth, freddie, andy, bodoni, bayer, fuller, sottsass)
  - `scripts/` 5개: `scaffold.sh`, `html-to-pdf.sh`, `pdf-print-overrides.css`, `source-to-markdown-markitdown.py`, `source-to-markdown.py`
  - `assets/scaffold-template/` 10개: Vite + React + TS 프로젝트 템플릿 (`Article.tsx`, `Cover.tsx`, `main.tsx`, `sections/01-opening.tsx`, `index.html`, `package.json`, `tsconfig*.json`, `vite.config.ts`, `.npmrc`)
  - `manifest.json`, `README.md`, `README.zh-CN.md`
- **성격**: 임의의 소스 자료(URL/PDF/DOCX/MD/텍스트/스크린샷)를 **오프라인에서 열리는 단일 파일 HTML 기사**로 편집·디자인하는 **8단계 harness 스킬**. 문서 언어는 중국어.

원문 자기 규정: "把用户提供的素材……编辑、设计成一篇美丽的、可离线打开和分享的**单文件 HTML 网页文章**。"

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문 (중국어, 전문):

> "把用户提供的素材（网页 URL / PDF / DOCX / Markdown / 纯文本 / 截图 / 粘贴材料）编辑、设计成一篇美丽的、可离线打开和分享的**单文件 HTML 网页文章**。基于 reacticle 组件协议：不手写裸 HTML/CSS，而用语义组件 + 受主题约束的 Raw 自由层；按 source→规划→双确认→生成→终审→修复的小型 harness 流程推进，默认 100% 信息保留的长文。触发场景：把 URL/PDF/DOCX/文章做成网页文章 / 长文 / briefing / 解释文 / 视觉文章 / 教程 / 审阅复盘 / 方案分析，'render this as a beautiful web article / 把这篇做成网页文章 / 生成一篇可分享的 HTML 长文 / reacticle 文章'。只生成文章，不生成后台、表单、dashboard、产品原型或通用 Web App。"

**매칭되는 사용자 발화** (description이 트리거 문구를 직접 열거)
- "render this as a beautiful web article"
- "把这篇做成网页文章" / "生成一篇可分享的 HTML 长文" / "reacticle 文章"
- URL/PDF/DOCX를 주면서 "이걸 웹 기사로 만들어줘"
- 장르 트리거: 长文(longform) / briefing / 解释文(explainer) / 视觉文章(visual-essay) / 教程(tutorial) / 审阅复盘(review) / 方案分析

**명시적 배제** (description 마지막 문장): "只生成文章，不生成后台、表单、dashboard、产品原型或通用 Web App." — 백오피스, 폼, 대시보드, 제품 프로토타입, 범용 웹앱은 생성하지 않음.

`allowed-tools` / `metadata`: **원문에 명시 없음** (frontmatter는 `name`, `description`만). 별도 `manifest.json`에 `compat` 목록이 있음 — `claude-code`, `claude-ai`, `cursor`, `codex-cli`, `gemini-cli`, `opencode`.

## 3. 적합한 상황 / 부적합한 상황

**적합**
- 긴 원문(논문, 보고서, 인터뷰 녹취, 사고 후 분석)을 **정보 손실 없이** 읽기 좋은 HTML로 재편집할 때 — 기본값이 100% 정보 보존
- 오프라인/공유 가능한 단일 파일이 필요할 때 — "CSS + JS 内联，断网可打开"
- 문서의 성격(학술/기술/에세이/브랜드)에 맞는 **시각적 기조**를 고르고 싶을 때 — 11개 테마 프로파일
- 정보 밀도를 사용자가 통제해야 할 때 — 100% / 80–90% / 60–70% / ~50% / 40% / ~25% / 20% 등급
- 인터랙티브 설명이 필요할 때 — `interactive-explainer` 타입 + Raw 자유층 (드래그 컨트롤, 계산기, 스텝퍼)
- PDF도 필요할 때 — `html-to-pdf.sh` (npm 의존 0, 시스템 Chromium 사용)

**부적합 / 과한 상황**
- 산출물이 앱/도구/대시보드 — 원문: "如果用户要的是应用而不是文章，停下来澄清，不要进入本 Skill."
- **소재 없이 "X에 대한 글 써줘"** — Phase 0이 반문하도록 규정: "Skill 不替用户凭空构思内容" (스킬이 사용자 대신 콘텐츠를 무에서 구상하지 않음)
- 짧은 메모나 한 페이지 요약 — 8-Phase + 3개 Checkpoint가 과함
- 프레젠테이션 슬라이드 — 모든 테마 프로파일의 `notFor`에 "演示幻灯片"(슬라이드)이 명시
- Node/npm이 없는 환경 — Vite+React 스캐폴드가 전제

**형제 스킬 대신 이걸 고르는 기준**: 산출물이 **읽히는 기사**인가. 같은 컬렉션에서 — 웹사이트/랜딩 페이지면 `web-design-engineer`, 영상 프레젠테이션이면 `web-video-presentation`, 이미지 생성이면 `gpt-image-2`, 자료 검색/추출만이면 `kb-retriever`.

## 4. 외부 의존성

- **API 키**: **불필요.** SKILL.md·references·scripts 전체에 API 키나 환경변수 참조가 없음 (grep 결과 `manifest.json`의 `gemini-cli` 문자열 1건만 — 호환 하네스 목록이며 키가 아님).
  - 단 **`ai-generated` 배치 모드**를 사용자가 선택하면 이미지 생성이 필요해지는데, **이 스킬 자체는 이미지를 생성하지 않는다**. `asset-policy.md`: "选 `ai-generated` 时**不直接随意生成图片**，先在 `plan/plan.md` 的 Assets 段列出每张图" — 즉 **프롬프트만 작성**하고 실제 생성은 외부(같은 컬렉션의 `gpt-image-2` 등)에 위임. 원문에 위임 대상은 명시 없음.
- **폴백 모드**
  - 소스 추출: MarkItDown 주 경로 실패 시 `source-to-markdown.py` 경량 폴백. markitdown 스크립트는 "intentionally depends on MarkItDown and **fails clearly** when it is not available."
  - SubAgent: "只有探测不到 SubAgent 环境才由主 Agent 兜底，并在文件首注明'无 SubAgent 环境，主 Agent 兜底'"
  - AskQuestion 도구: 없으면 "停下来在消息里把所有问题**编号列出**"
  - PDF: 브라우저 탐지 실패 시 "打印'用浏览器手动 Cmd+P → 另存为 PDF'指引"
- **필요한 CLI/런타임/패키지**
  - **Node + npm** — Vite + React + TS 워크스페이스. `npm run dev` / `typecheck` / `build`
  - **`reacticle`** (npm) — 컴포넌트 프로토콜 라이브러리. 스캐폴드가 `"reacticle": "latest"`로 설치. 버전 요구: `width` prop은 "需 reacticle ≥ 0.2.0"
  - **bash** — `scaffold.sh`, `html-to-pdf.sh`
  - **Python 3** + 선택적 `markitdown[pdf,docx]` — 소스 추출
  - **Chromium 계열 브라우저** (Chromium / Chrome / Brave / Edge) — PDF 출력용. "无需 npm 包、无需 Node"
  - **SubAgent 실행 능력** — First Spread / Section / Final Review
  - **AskQuestion 도구** (선택) — Checkpoint의 결정 수집
- **네트워크**: npm 설치 시 필요. URL 소스 처리 시 필요. 이미지는 "不要远程图片"(원격 이미지 금지, 커버 제약).
- **비용 발생 지점**: 유료 API 없음. 다만 **SubAgent 다수 실행**이 토큰 비용을 발생시킴 — 원문이 이를 인지하고 최적화: "**误开 SubAgent / 误写文件是首要性能问题**".

## 5. 워크플로우

### 전체 구조 (원문 다이어그램)
```
Phase 0  Intake            → 진입 여부 판단 + 초기 기사 타입
Phase 1  Source → Markdown → source.md + extraction-notes.md
Phase 2  Editorial Planning → plan.md (Brief / Outline / Theme / Assets 4단)
Phase 3  Plan Checkpoint   → ★Checkpoint 1 필수 정지, 5개 항목 개별 확인
Phase 4  First Spread      → 첫 화면 + 첫 섹션 + 대표 시각 블록 (스캐폴드 생성)
                             → ★Checkpoint 2 필수 정지, 2개 항목 개별 확인
Phase 5  Full Article Build → 전체 기사 생성 (섹션별 SubAgent 검수)
Phase 6  Final Review      → Editorial / Visual / Technical 3시점 종심
Phase 7  Repair            → 최소 절편 수리
Phase 8  Delivery          → ★Checkpoint 3 필수 정지 → article.html 교부
```

### 워크스페이스 구조 (스킬의 장기 기억)
"这些文件是 Skill 的长期记忆，**不要只依赖聊天上下文记决策**" — 결정을 채팅 컨텍스트에만 두지 말 것.
```text
<workspace>/
  source/   original.*  source.md  source.<lang>.md  extraction-notes.md
  plan/     plan.md
  article/  Cover.tsx  Article.tsx  sections/  raw-blocks/  assets/  article.html
  review/   first-spread-review.md  final-review.md
            source-review.md(복잡 소스만)  repair-log.md(수리 있을 때만)
  index.html  package.json  vite.config.ts  tsconfig*.json
```

### Phase 0 — Intake (**게이트: 진입 거부 가능**)

| 用户给的东西 | 该做的 |
|---|---|
| 一个或多个素材（URL/PDF/DOCX/MD/文本/截图） | 进入 Phase 1 |
| 只说"帮我做篇 X 文章"但没素材 | **反问**：先要素材或大纲 |
| 明显要的是应用 / 工具 / dashboard | 停下来澄清，不进入本 Skill |

**언어 포착**: "开场就记录用户**期望的最终文章语言**". 지정 없으면 소스 언어를 따름.

### Phase 1 — Source → Markdown
- 모든 입력을 `source/source.md`로 통일, 불확실 항목은 `extraction-notes.md`에
- 검수: **주 Agent 인라인 5개 checklist 자체 점검** (파일 없음)
- **분기**: `extraction-notes.md`가 저신뢰/복잡 소스로 표시된 경우에만 **Source Reviewer SubAgent**로 승격 → `original.*`와 diff 대조 → `review/source-review.md`. 근거: "静默丢失只能 diff 抓到" (조용한 손실은 diff로만 잡힘)
- **번역 분기**: 목표 언어가 소스와 다르면 `source/source.<lang>.md` 생성 후 **그것을 사실 기반(事实底座)으로** 사용. 번역 요구: "**用地道的目标语言、去除翻译腔**（按目标语言的表达习惯重组句子，不逐字直译，不留生硬的外语语序 / 被动堆叠 / 异国标点）"

### Phase 2 — Editorial Planning
- **HTML을 쓰지 않음** ("不直接写 HTML")
- 산출물은 **`plan/plan.md` 단 하나** (4단):
  - **Brief**: 目标读者 / 文章类型 / 信息保留比例 / 必须保留 / 可删减 / 语气 / 主要观点 / 阅读目标 / 目标语言 / 版式宽度 / TOC / 配图策略
  - **Outline**: Hero / Lead / Summary / Section 목록 / 절별 보존 정보 / 절별 Raw·Table·CodeBlock·Formula·Image 필요 여부 / 결말 방식
  - **Theme**: 선정 테마 + 이유 + 충돌 설명
  - **Assets**: 배치 전략과 이미지별 계획 (`none` 모드면 한 줄)
- 검수: **주 Agent 인라인** 5개 Plan 자체 점검. "**禁止开 SubAgent，禁止写 `review/plan-review.md`**"
  근거: "plan 是文字决策且 200-400 行，上下文是热的，SubAgent 冷启反而更慢"

### Phase 3 — ★Checkpoint 1 (**필수 정지, 5개 항목 개별 확인**)

| # | 결정 항목 | 선택지 (표준 정보 보존 비율 포함) |
|---|---|---|
| 1 | **文章类型** (보존 비율 포함) | `longform · ~100%` / `full-report · ~80%` / `tutorial · ~90%` / `explainer · ~80%` / `dialogue · ~80%` / `review · ~70%` / `essay · ~70%` / `interactive-explainer · ~25% 원문 발췌 + 75% AI 재구성` / `briefing · ~50%` / `visual-essay · ~40%` |
| 2 | **主题** | tufte / press / 기타 등록 테마 (`theme-profiles/index.json` 조회) |
| 3 | **版式宽度** | narrow / regular / wide / full (기본 `regular`) |
| 4 | **配图模式** (필수 · "默认通过" 불허) | none / user-assets / placeholders / ai-generated |
| 5 | **封面** (3:4 책표지식 표제 이미지) | 开(기본) / 关 |

비율을 타입에 묶은 이유가 명시됨: "**比例已绑进类型选项**，不再单独成题（否则会出现 `longform + 20%` 这种伪组合）"

**TOC는 기본 개방**이며 별도 문항으로 만들지 않음. 다만 개장 설명에서 "默认 TOC 开，要关告诉我" 한 줄로 알릴 것.

**기본값으로 가지만 숨기지 않을 항목**: 최종 언어(소스 따름), 편집·삭감·재구성·어조 변경 허용, 첫 화면 샘플 선행, TOC 개방.

### Phase 4 — First Spread
- 스캐폴드 생성:
  ```bash
  bash <skill>/scripts/scaffold.sh ./my-article --theme=<id>
  bash <skill>/scripts/scaffold.sh ./my-article --theme=<id> --no-cover
  bash <skill>/scripts/scaffold.sh --list-themes
  ```
- 첫 화면(Hero/Lead)은 assembler `article/Article.tsx`에
- **첫 Section은 반드시 독립 컴포넌트** `article/sections/01-*.tsx` — "这是后续并行的代码锚点"
- 커버(개방 시): `article/Cover.tsx`의 `<CoverPlaceholder />`를 테마+주제에 맞춘 도문 구성으로 교체. **"外壳（3:4 容器 + 打印分页）不要动"**
- `npm run dev` 프리뷰
- 이 단계가 결정하는 것: "标题气质 / 字号 / 内容密度 / Raw 风格 / 配图方式 / 主题是否合适"
- **First Spread Reviewer SubAgent** → `review/first-spread-review.md` (커버 5개 자체 점검 포함)

### Checkpoint 2 (**필수 정지, 2개 항목 개별 확인**)
1. **验收结论** — `通过 · 进入完整生成` / `局部修改 · 我会另起一条说改哪里` / `主题或版式不合适 · 回到 Checkpoint 1`
2. **后续开发模式** — `A · 单 Agent 顺序（默认 · 最稳 · 风格最统一）` / `B · 多 Agent 并行（最快 · 风格轻微差异）`

"**不要把这两件事打包成'通过 + A，OK 吗？'** —— 用户可能'通过验收但想用 B'或反之."

### Phase 5 — Full Article Build
**철칙**: "**每个 Section 必须是独立组件文件**（`article/sections/NN-*.tsx`），**坚决不允许把多个 Section 直接写进一个组件**." `Article.tsx`는 assembler일 뿐이며 **주 Agent가 소유**. 큰 Raw도 `article/raw-blocks/NN-*.tsx`로 격리. "文件级隔离是多 Agent 并行的前提."

- **모드 A (기본)**: 주 Agent가 순차로 각 섹션 작성
- **모드 B**: subagent가 각각 **하나의** 섹션 파일을 소유해 병렬 개발. 주 Agent는 "维护 `Article.tsx` 的 import 与顺序、跑 `npm run typecheck` / `build`、兜底主题与风格一致、解决冲突"

**섹션별 Section Reviewer SubAgent** 점검 7항목: 是否完成 outline 任务 / 是否符合信息保留比例 / 是否与前后衔接 / 是否过度组件化 / 是否有足够正文 / Raw 与配图是否有明确目的 / 本节序号自洽
→ **메시지로 pass/fail 반환, 파일 쓰지 않음.** 근거: "一篇可能 5-15 节，N 份 review 文件无人再读"

**긴 세션 망각 대책**: "Phase 5 会重复实现 N 个 Section，**每次开工前回看** `component-policy.md` + `raw-policy.md` + 当前主题 `theme-profiles/<id>.md`"

### Phase 6 — Final Review (3시점)
1. **Editorial Reviewer**: 文章性、信息取舍、结构
2. **Visual Reviewer**: 主题、Raw、配图、移动端
3. **Technical Reviewer**: 构建、控制台、代码 / 公式、可访问性

**핵심 레드라인** (원문): "它仍是一篇文章（不是应用）· 信息保留比例符合 Plan · 必须保留的信息没丢 · 主题气质统一 · Raw 无野生样式 · **没有明显 AI 味** · 桌面 + 移动端可读 · HTML 可构建可打开可分享"

### Phase 7 — Repair (최소 절편)
**금지**: "只反馈一处就重写整篇 / 为修视觉改动已确认的文章结构 / 为压缩信息删掉用户指定必须保留的内容"
"**有修复才写** `review/repair-log.md`"

### Checkpoint 3 (**필수 정지, 1개 항목**)
- **交付决策** — `通过 · 导出 HTML 交付` / `通过 · 同时导出 HTML + PDF` / `还有局部修复` / `先停一停`
- "只有这一项决策，但**仍要主动停下来问**，不要静默走默认导出 HTML."

### Phase 8 — Delivery
- `article/article.html` (자기 완결 단일 페이지, CSS+JS 인라인, 오프라인 개방) — **주 산출물**
- 선택적 `article/article.pdf` — Checkpoint 3에서 선택했을 때만
- 짧은 편집 설명: 文章类型 / 信息保留比例 / 主题 / 配图策略 / 主要编辑取舍

### 하드 품질검사 프로토콜 (전 과정 관통) — **이 스킬의 고유 설계**
"**质检方式按节点区分 —— 不是所有质检都要开 SubAgent，也不是所有质检都要写文件。误开 SubAgent / 误写文件是首要性能问题**"

| 노드 | 검수 방식 | 산출물 | 이유 |
|---|---|---|---|
| Phase 1 Source(기본) | 주 Agent 인라인 5 checklist | 없음 | 주 Agent가 어차피 source.md를 통독 |
| Phase 1 Source(복잡/저신뢰) | Source Reviewer SubAgent (diff 대조) | `review/source-review.md` | 조용한 손실은 diff로만 |
| Phase 2 Plan | **주 Agent 인라인 (SubAgent 금지)** | **없음** | 컨텍스트가 뜨거워 SubAgent 냉시동이 더 느림 |
| Phase 4 First Spread | First Spread Reviewer SubAgent | `review/first-spread-review.md` | 첫 화면이 기조를 정함 |
| Phase 5 각 Section | Section Reviewer SubAgent | **메시지 반환(파일 없음)** | 5–15절 × review 파일은 아무도 안 읽음 |
| Phase 6 종심 | Editorial + Visual + Technical SubAgent | `review/final-review.md` | 교부물의 일부, 보관 가치 |

**5개 철칙 (铁律)**
1. Plan Checkpoint에서 SubAgent 검수 절대 금지
2. First Spread / Final은 반드시 SubAgent (가치 > 비용)
3. Section Reviewer는 SubAgent지만 반환값은 메시지
4. "**拿到任何质检结论 —— 先按 fail 项把产出改完，再汇报'做完了 + 自检结论 + 改了什么'。直接拿原始结论汇报但不修复 = 违规**"
5. **决策收集铁律 · 禁止静默替用户选择** — 아래 참조

### 결정 수집 철칙 (**이 스킬의 가장 강한 규칙**)
> "在每个 Checkpoint（1 / 2 / 3），所有需要用户确认的决策项**必须每项独立列出 + 等用户答复**。Agent **可以推荐**（'我推荐 X，因为 …'），但**不能'已经替你定了 X，如果不对再说'** —— 这等于剥夺选择机会。"

- **우선**: `AskQuestion` 도구가 있으면 각 결정을 독립 question으로 (한 번 호출에 복수 question 전달 가능)
- **없으면**: 메시지에 **번호를 붙여 열거** (각 문제가 한 단락 독점, 추천 항목 + 이유 + 대안 명시), "我等你逐项答复后再继续"라고 명시, **후속 작업 일체 중단**
- **절대 금지**: "把多项决策打包成一个'全选我推荐的 / 全部 OK 吗？'yes/no 问题"

### 점진적 로딩 지침 (각 단계 필독/필요시)
"渐进加载，别一次全读" — 단계별로 어떤 reference를 읽어야 하는지 표로 명시. Phase 0은 `harness.md`만, Phase 2는 7개 필독 + `article-types/<type>.md`·`theme-profiles/*.md` 조건부, 등.

**사용자 확인 요구 지점 (총 3곳, 모두 필수 정지)**: Checkpoint 1(5항목) / Checkpoint 2(2항목) / Checkpoint 3(1항목)

## 6. 디자인 지침 분석

이 스킬은 미적 판단을 **3층 구조**로 강제한다: (a) 컴포넌트 프로토콜(무엇으로 쓸 수 있는가), (b) 테마 프로파일(어떤 기조인가), (c) Raw 정책(자유층의 한계).

### 금지 규칙 (anti-pattern) — 원문 그대로

**컴포넌트 프로토콜 (`component-policy.md`)**
- "**不手写裸 `div` / `className` / 行内 `style` / CSS**" — 벌거벗은 HTML/CSS 직접 작성 금지
- "**语义组件是点睛，只在内容确实'是'那个结构时才用** ... 不要堆叠当装饰 —— **堆卡片会让文章显得做作、零碎**"
- "**表达语义，不表达布局。** 说'这是 insight / risk / decision'，别说'蓝卡片、24px 边距'"
- "**绝不为掩盖缺口而编造**" — 필수 필드가 없으면 비워둘 것. 컴포넌트가 `⚠ 未指定xxx`를 렌더링
- "**主题，不写样式。** 作者只通过 `ThemeProvider` 选一个主题，从不写组件样式"
- "**不要暴露给作者**：`HighlightedCode` 是 `CodeBlock` 的内部底层"
- "领域特例组件每多用一个，都要能回答'这块内容本质上就是它'"

**Raw 정책 (`raw-policy.md`)**
- "**禁止**: 复杂表单、拖拽工作台、完整 dashboard、产品原型、和文章无关的动画、独立于主题的配色、**复用固定小组件冒充自由表达**"
- "**绝不**把 Raw 做成一套固定小组件在文章间复用（同一条 pipeline / 同一套配色到处出现）—— 那等于把自由层退化成又一组受限组件"
- "**自由但一致：用 token**" — 색·폰트·간격은 반드시 `--ra-*` 테마 변수에서
- "别把 Raw 想成'内联画图'，那会严重限制网页的想象力" / "用那个，而不是**反射性地画 SVG**"
- SKILL.md: "所有 Raw 用 `--ra-*` 主题 token，**禁止野生样式**"

**테마별 금지 (tufte 예시, 원문 그대로)**
- "卡片、面板、填色块、投影、圆角；比 `#D8D2C2` 更深的网格线"
- "emoji / 图标当装饰；色彩用于'承载含义'以外的任何用途"
- "**库存感 hero 图、3D 插画、渐变背景、装饰光斑、强饱和科技蓝紫、卡通人物**"
- "在 Raw 里写出与 Data-Ink 相反的装饰性组件（**仪表盘大屏、粒子背景、玻璃拟态**）"
- "强调靠字重 / 颜色 / 间距，不靠斜体（**协议级禁用斜体**），不靠厚黑体"
- "动效：默认无；必须交互时只用即时响应或极轻过渡，**不用弹跳 / 漂浮 / 循环装饰**"

**커버 하드 제약 (SKILL.md 기본 전략)**
- "外壳比例 / 打印分页不可动、必须有视觉元素 + 文字、只用 `--ra-*` token、**不要远程图片、不要重复 Hero 内容**"

**Colophon 불가 제거**
- "**每篇文章必须保留**，禁止删除、禁止移到 Hero 旁边或浮动到角落"

**수리 금지 (Phase 7)**
- "只反馈一处就重写整篇 / 为修视觉改动已确认的文章结构 / 为压缩信息删掉用户指定必须保留的内容"

**종심 레드라인**: "**没有明显 AI 味**" (뚜렷한 AI 냄새 없음)

### 강제 규칙 — 수치 인용

**版式 宽度 (layout.md)** — reacticle ≥ 0.2.0 필요

| 모드 | 읽기 열 너비 | 적합 |
|---|---|---|
| `narrow` | **~34rem** | 短文, `essay`, `briefing` |
| `regular`(기본) | **~46rem** | `longform` / `explainer` |
| `wide` | **~58rem** | 表格/代码/데이터 밀집 (`full-report`, `review`, `tutorial`) |
| `full` | **~78rem** | 图文 주도 (`visual-essay`) |

- TOC: "开启会变成'左目录 + 正文'两栏；**窄视口（<1000px）自动回落为单栏**"
- 최대 3단계, 스크롤 하이라이트

**정보 밀도 등급 (information-density.md)**

| 정보 보존 | 추천 타입 | 표현 특징 |
|---|---|---|
| 100% | longform | 长文 위주, Raw 강화, 완전한 장절과 세부 |
| 80–90% | tutorial / full-report / explainer / dialogue | 중복 삭제, 주요 논증·단계·대화 보존 |
| 60–70% | review / essay | 핵심 증거·논증·발견 |
| ~50% | briefing | 결론 + 핵심 증거 + 행동, 시각 비율 상승 |
| 40% | visual-essay | 시각 블록 비율 최고, 문자 더 짧게 |
| **~25%** | interactive-explainer | **특례: 백분율 의미가 다름** — "不是'删 75%'，而是'成品里直接来自原文的句子 / 段落约占 25%'；其余 75% 是 AI 围绕核心知识点全新创作的引导文字 + 交互演示 + 自己试 + 验证理解" |
| 20% | one-page teaser | 핵심 관점만 (비표준 조합, plan.md에 표기 필요) |

**정보 밀도 ↔ 컴포넌트/시각 비율**

| 정보 보존 | 正文 비율 | Raw/이미지 비율 | 조직 전략 |
|---|---|---|---|
| 100% | 高 | 中低 | 长文 우선, Raw로 핵심 개념 점등 |
| 80% | 中高 | 中 | 절마다 하나의 시각 강화 가능 |
| 60% | 中 | 中高 | 중점 구조화, 시각이 이해 보조 |
| 40% | 中低 | 高 | 도문 리듬 강화, 그래도 기사 |
| 20% | 低 | 高 | 시각 기사에 근접, 세부 보존 안 함 |

**tufte 테마 타이포그래피 수치 (원문)**
- 본문/제목: old-style 세리프 (et-book → Palatino / Georgia / 宋体), **字重 400**
- 라벨/주석/표 헤더: 휴머니스트 sans, 작은 자간
- 본문 크기: 의도적으로 작게 **~16px**, **행간 1.6**
- 제목 위계: **h1≈2.5rem, h2≈1.7rem**
- 격자선 색 상한: **`#D8D2C2`보다 진하면 금지**

**커버 규격**: 화면 **3:4**, PDF에서 첫 페이지 독점. TOC + Hero + 본문 위에 독립 존재.

**PDF 출력 규격 (`html-to-pdf.sh` 주석)**: 표준 **A4**, 테마 지색 전면 배경 + **0.45in** 내용 여백, 브라우저 기본 머리말/꼬리말 없음

**Plan 파일 규모**: "plan 是文字决策且 **200-400 行**"

**섹션 개수 예상**: "一篇可能 **5-15 节**"

### 항목별 지침

**타이포그래피** — 테마 프로파일에 위임. tufte 예: old-style 세리프 + 휴머니스트 sans, 16px/1.6, h1 2.5rem/h2 1.7rem, 字重 400, **이탤릭 프로토콜 수준 금지**, 강조는 字重/颜色/间距로. 다른 10개 테마는 각각 다른 서체 기조 (bodoni = Didone 고반차, vignelli = sans 격자, knuth = 학술 공식 우선, andy = 원체, fuller = 등폭 치수 표기 등).

**컬러** — 두 층위:
- 작성자는 색을 정하지 않음. `--ra-*` 토큰만 사용
- 테마가 팔레트를 소유. index.json의 `mood`가 색 기조를 서술: tufte "去除…装饰色", shannon "暗底工程现场", freddie "暖白 + 明黄", andy "暖奶油 + 暖橙", bodoni "极致黑白、戏剧高反差", bayer "三原色当结构色、蓝圆章节号", fuller "蓝图底 + 制图青", sottsass "撞色粉彩 + 无模糊硬投影"
- tufte 금지: "色彩用于'承载含义'以外的任何用途", "强饱和科技蓝紫"

**스페이싱** — `var(--ra-space-4)` 형태의 토큰. 구체적 스케일 값은 **SKILL.md·references에 명시 없음** (컴포넌트 라이브러리 런타임이 보유). 열 너비는 위 4단계 rem 값.

**모션** — 테마별로 규정. tufte: "默认无；必须交互时只用即时响应或极轻过渡，不用弹跳 / 漂浮 / 循环装饰". Raw 정책에서는 허용: "CSS transition / `@keyframes` / 滚动揭示 / 状态切换的动画". easing/duration 수치는 **원문에 명시 없음**.

**레이아웃** — 4단계 너비 + TOC(3단계, <1000px 단일 열 폴백) + 섹션 파일 분리 철칙 + 커버 3:4.

**접근성** — Technical Reviewer의 점검 항목에 "可访问性" 포함. 구체적 기준(대비 비율 등)은 **원문에 명시 없음**. 컴포넌트가 `alt`, `caption`, `source`를 요구 (tufte: "必须配清晰 caption / source / alt").

### 지침을 주는 방식 자체

1. **컴포넌트 프로토콜로 자유를 제한**: 벌거벗은 HTML/CSS를 금지하고 의미 컴포넌트만 허용. 즉 **미적 실수의 여지를 API 수준에서 제거**. "**Props 即协议**".
2. **자유층을 명시적으로 분리 + 조건 부여 (Raw)**: 완전 자유(임의의 HTML/CSS/JS/React)이지만 **토큰 강제 + 목적 서술 의무 + 재사용 금지**. "为 THIS 篇文章手写，不是 widget 库".
3. **테마 프로파일 = AI용 작성 지침 (CSS 아님)**: "这是给 **AI 写作时读** 的 authoring profile，不是 CSS". 각 프로파일이 气质(기조) / 적합·부적합 타입 / 排版气质 / Raw 风格 / 媒体风格 / 代码·公式风格 / **禁止项** / 밀도별 표현 제안으로 구성.
4. **실물 참조를 테마 이름으로 사용**: Tufte(Data-Ink), Vignelli(스위스 국제주의), Knuth(arXiv), Bodoni(Didone), Bayer(바우하우스), Fuller(청사진), Sottsass(멤피스), Shannon, Press, Freddie, Andy — 11개 모두 **인물/사조 이름 + 한 줄 mood + notFor**.
5. **적합/부적합을 데이터로 (`index.json`)**: 각 테마에 `bestFor` / `notFor` 배열. 즉 테마 선택이 취향 문제가 아니라 조회 가능한 매칭.
6. **정보 밀도를 백분율로 조작화**: 감각적 "요약해줘"를 100/80–90/60–70/50/40/25/20% 등급 + 타입 바인딩으로 환원. 그리고 **의사 조합(`longform + 20%`)을 구조적으로 차단**.
7. **3차원 분해 명시**:
   ```
   文章类型 = 结构决策
   信息密度 = 内容保留决策   ← 类型과 실질 결합
   主题     = 审美气质决策   ← 앞 둘과 완전 해체
   ```
8. **검증 장치를 노드별로 차별화**: SubAgent 개방 여부 + 파일 작성 여부를 6개 노드마다 지정하고 **각각 이유를 명시**. 검증 비용을 설계 변수로 다룬 사례.
9. **결정 수집 철칙**: 사용자 선택권 박탈을 명시적 위반으로 규정. "可以推荐, 不能替你定了".
10. **자체 점검 후 수리 의무**: "先按 fail 项把产出改完，再汇报 ... 直接拿原始结论汇报但不修复 = **违规**".
11. **워크스페이스를 장기 기억으로 규정**: "不要只依赖聊天上下文记决策".
12. **긴 세션 망각 대책 명시**: 매 섹션 착수 전 3개 파일 재열람.
13. **점진적 로딩 표**: 단계별 필독/조건부 파일. "别一次全读".
14. **성공 기준을 대조로 서술**:
    - "40% 信息时读起来像**被编辑过的文章**，而非**缩水摘要**"
    - "100% 信息时像**被精修过的长文**，而非**原文搬运**"
    - "页面比 Markdown 更值得读"

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**美丽的**"(아름다운) 기사 | 컴포넌트 프로토콜 + 11개 테마 중 선택 + Raw 토큰 강제 + 3단 검수. 즉 "아름다움"을 **선택된 테마의 금지 목록을 지킨 상태**로 환원 |
| "**值得读**"(읽을 가치) vs "能读"(읽을 수 있음) | "Raw 相反：鼓励多用。交互、动画、自定义可视化、新颖排版 —— **Markdown 做不到的东西**，才是把文章从'能读'变成'值得读'的关键" |
| "**没有明显 AI 味**" (AI 냄새) | 종심 레드라인. 조작적 정의는 원문에 명시 없음 — 다만 인접 규칙들로 간접 정의: 카드 남용 금지("堆卡片会让文章显得做作、零碎"), 고정 위젯 재사용 금지, 库存感 hero 图 금지, 번역체 제거 |
| "**翻译腔**" (번역체) | "按目标语言的表达习惯重组句子，不逐字直译，不留生硬的外语语序 / 被动堆叠 / 异国标点" |
| "**气质统一**" (기조 통일) | 선정 테마 프로파일의 排版/Raw/媒体/代码 규정 준수 + `--ra-*` 토큰만 사용 |
| "**克制**" (절제, tufte) | "去除卡片、填色、阴影、圆角、装饰色。留下文字、发丝级参考线、充裕页边、由排版承载的含义" + "**每一滴墨水都承载信息**" |
| "**让读者凑近去读**" (tufte mood) | 본문 크기를 의도적으로 작게 (~16px) |
| "**请你从一臂之外读一本书**" (press mood) | 원문에 수치 없음 — 프로파일 파일에 위임 |
| "**过度组件化**" | Section Reviewer 점검 항목. litmus test: "若一句话 / 一个列表 / 一张表 / 一块 Raw 读起来更好，就用那个" |
| "**野生样式**" (wild styles) | `--ra-*` 토큰 밖의 색·폰트·간격 |
| "**缩水摘要**" vs "**被编辑过的文章**" | 40% 보존에서의 성공 기준. 정보 밀도 등급표가 正文/Raw 비율까지 지정 |
| "**原文搬运**" vs "**被精修过的长文**" | 100% 보존에서의 성공 기준 |
| "**像作者为当前段落手画的一张小图，不是营销组件**" (tufte Raw) | "少填充、多线条；信息密度可以高，但每条线 / 每个元素都要有含义" |
| "**像正文里的精密标本**" (tufte CodeBlock) | "纸面轻 surface + 发丝线，不用深色编辑器壳 / 发光边框 / 彩色标题栏。行号可见但退后" |

## 7. 산출물

- **주 산출물**: `article/article.html` — "自包含单页，CSS + JS 内联，**断网可打开**"
- **선택 산출물**: `article/article.pdf` — Checkpoint 3에서 사용자가 선택했을 때만. A4, 테마 지색 전면, 0.45in 여백, 커버가 첫 페이지 독점, TOC는 2페이지부터
- **부수 산출물 (워크스페이스)**
  - `source/original.*`, `source/source.md`, `source/source.<lang>.md`, `source/extraction-notes.md`
  - `plan/plan.md`
  - `article/Cover.tsx`, `article/Article.tsx`, `article/sections/NN-*.tsx`, `article/raw-blocks/NN-*.tsx`, `article/assets/`
  - `review/first-spread-review.md`, `review/final-review.md`, (조건부) `review/source-review.md`, `review/repair-log.md`
  - 빌드 도구: `index.html`, `package.json`, `vite.config.ts`, `tsconfig*.json`
- **네이밍 규칙 (명시됨)**
  - 섹션: `article/sections/NN-*.tsx` (번호 접두)
  - Raw 블록: `article/raw-blocks/NN-*.tsx`
  - 번역 소스: `source/source.<lang>.md` (예: `source.zh.md`, `source.en.md`)
- **교부 시 첨부**: 짧은 편집 설명 — 文章类型 / 信息保留比例 / 主题 / 配图策略 / 主要编辑取舍
- **Colophon (필수 유지)**: `Made with [beautiful-article](github 仓库) · <주제> theme`, 저대비 작은 글씨, 테마 토큰 자동 적응. 테마 변경 시 colophon의 테마명 + `main.tsx`의 `<ThemeProvider theme="...">` **두 곳을 동기화**.

## 8. 주의점 / 한계

- **`reacticle` npm 패키지에 전면 종속**: 컴포넌트 프로토콜, 테마 런타임, `--ra-*` 토큰 전부 이 라이브러리 소유. 스캐폴드가 `"latest"`를 설치하므로 **버전이 고정되지 않는다** — 브레이킹 체인지가 있으면 스킬이 조용히 깨진다. `width` prop만 "需 reacticle ≥ 0.2.0"으로 최소 버전이 명시됨.
- **테마 프로파일이 이중 소스**: 각 프로파일이 `canonicalRuntimeMd` (예: `src/theme/themes/tufte/tufte.md`)를 가리키며 "详尽版本见组件库 canonical md ... **写代码 / 公式 / 媒体 / Raw 前请读它**"라고 지시한다. 그런데 **그 파일은 이 스킬 폴더에 없다** — reacticle 저장소 안에 있음. 즉 지침의 상세판을 읽으려면 npm 패키지 내부나 원격 저장소에 접근해야 하며, 접근 실패 시의 폴백은 **원문에 명시 없음.**
- **SubAgent 환경 의존**: First Spread / Section / Final 검수가 SubAgent 전제. 폴백은 있으나("主 Agent 兜底") 그 경우 검수의 독립성이 사라진다.
- **`ai-generated` 모드의 미완결**: 이미지 프롬프트만 작성하고 실제 생성은 하지 않는다. 사용자가 이 모드를 선택했을 때 어디서 생성할지가 **원문에 명시 없음** — 같은 컬렉션의 `gpt-image-2`가 자연스러운 후속이지만 상호 참조가 없다.
- **비용 구조**: 8 Phase × 최대 6종 검수 + 섹션당 SubAgent(5–15절) + 3개 Checkpoint. 원문이 SubAgent 남발을 "首要性能问题"로 지목하고 노드별로 최적화했지만, 전체 실행 비용은 여전히 이 컬렉션에서 가장 큼.
- **3개 Checkpoint의 마찰**: 각 Checkpoint가 필수 정지이며 항목별 개별 응답을 요구한다(총 8개 결정). 자동화·배치 실행과는 근본적으로 상충. 무인 실행 시의 동작은 **원문에 명시 없음** (원문은 오히려 "不要继续做任何后续工作"로 정지를 강제).
- **언어**: SKILL.md와 모든 references가 중국어. 영어 README가 별도로 있으나 실제 지침은 중국어 — 비중국어 사용자·팀의 검토·수정 부담.
- **접근성 기준의 부재**: Technical Reviewer가 "可访问性"을 점검하라고 하지만 구체적 기준(대비 비율, 포커스, ARIA)은 **원문에 명시 없음.**
- **모션 수치의 부재**: Raw에서 CSS transition/`@keyframes`를 허용하지만 duration/easing 값 지침이 **원문에 없다.** 테마별 기조("不用弹跳 / 漂浮 / 循环装饰")만 존재. `emilkowalski` 컬렉션과 대비되는 지점.
- **강한 경고 지점**:
  - "如果用户要的是应用而不是文章，**停下来澄清，不要进入本 Skill**"
  - "Skill 不替用户凭空构思内容"
  - "**决策收集铁律 · 禁止静默替用户选择**"
  - "直接拿原始结论汇报但不修复 = **违规**"
  - "**坚决不允许**把多个 Section 直接写进一个组件"
  - "**误开 SubAgent / 误写文件是首要性能问题**"
  - "**绝不为掩盖缺口而编造**"
  - "Colophon ... **每篇文章必须保留**"
  - 커버 외피: "**外壳（3:4 容器 + 打印分页）不要动**"
- **검증 장치 (강점)**: 6개 노드의 차별화된 검수 프로토콜, `original.*` diff 대조(조용한 정보 손실 탐지), 섹션별 7항목 점검, 3시점 종심, 종심 레드라인 8항목, `npm run typecheck`/`build`, 커버 5항목 자체 점검, 성공 기준의 대조적 서술. 이 컬렉션에서 검증 설계가 가장 정교하며, **실행 가능한 검증(typecheck/build)과 판독 검증(reviewer)을 모두 포함**한다.
