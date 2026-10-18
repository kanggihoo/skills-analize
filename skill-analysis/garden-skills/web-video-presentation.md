# web-video-presentation 분석

## 1. 개요

- **원본 경로**: `skills-collections/garden-skills/web-video-presentation/`
- **핵심 파일**: `SKILL.md` (23,239 bytes)
- **보조 파일**
  - `references/` 7개 + EXAMPLES: `SCRIPT-STYLE.md`, `OUTLINE-FORMAT.md`, `CHAPTER-CRAFT.md`(장 개발 단일 필독 입구, Part 0–8), `THEMES.md`, `AUDIO.md`, `RECORDING.md`, `EXAMPLES/`(hook-chapter / list-reveal / case-tech-review — `chapter.tsx`+`chapter.css`+README)
  - `themes/` **23개 테마** (각각 `theme.json` + `tokens.css`): bauhaus-bold, blueprint, bold-signal, chalk-garden, creative-voltage, dark-botanical, dune, electric-studio, forest-ink, indigo-porcelain, kraft-paper, midnight-press, monochrome-print, neon-cyber, newsroom, paper-press, pastel-dream, split-canvas, sunset-zine, swiss-ikb, terminal-green, vintage-editorial, warm-keynote
  - `scripts/scaffold.sh`
  - `templates/` — Vite + React + TS 프로젝트 템플릿: `index.html`, `src/App.tsx`, `src/chapters/01-example/`(Example.tsx/.css/narrations.ts), `src/components/`(AutoStartGate, AutoToggle, MaskReveal, ProgressBar, Stage), `src/hooks/`(useAudioPlayer, useAutoMode, useStageScale), `scripts/extract-narrations.ts`, `scripts/synthesize-audio.sh`, `scripts/tts-providers/`(README + minimax.sh + openai.sh)
  - `manifest.json`, `README.md`, `README.zh-CN.md`
- **성격**: 기사나 구어 원고를 **"영상처럼 보이는" 클릭 구동 16:9 웹 프레젠테이션**으로 만들고, 선택적으로 TTS 음성을 합성해 원테이크 녹화까지 이어지는 4-Phase harness 스킬. 문서 언어는 중국어.

원문 자기 규정: "本 Skill 沉淀的是**设计方法论 + 协作流程** —— **不绑定任何特定样式 / 字体 / 颜色** —— 因此能复用到任意主题与美学。"

## 2. 활성화 조건 (언제 켜지는가)

frontmatter `description` 원문 (중국어, 요약 없이 핵심 발췌):

> "把一篇文章或口播稿，做成\"看起来像视频\"的点击驱动 16:9 网页演示，可选合成口播音频。流程：原始文章 → **一次产出**口播稿 + outline 开发计划 → 用户**一次对齐** 5 件事（稿子 / outline / 主题 / 素材 / 开发模式）→ 网页开发（逐章 / 顺序 / 并行）→ 可选音频合成（provider-agnostic：内置 MiniMax mmx-cli + OpenAI TTS，可换 ElevenLabs / edge-tts / Azure / 自带 TTS）。**outline 只规划节奏与信息密度，不规划动画** —— 动画由章节开发时按 PRINCIPLES + ANTI-AI 法则即时设计。每次点击推进口播稿的一个节拍，每一步独占整屏，进度条平时隐藏只在悬浮时出现。适用场景：用网页做视频（动态 PPT 但不像 PPT）、把口播稿 / 文章变成可交互的解说、为 B 站 / YouTube / 视频号录屏教程、做有电影感的产品 / talk demo。"

**매칭되는 사용자 발화** (본문의 적용 장면)
- "我有口播稿 / 一篇文章，帮我做成视频"
- "동적 PPT 만들고 싶다" (단 "PPT 같지 않게")
- "16:9 横屏录屏，大字、留白、每屏都要有动效"
- "교육 / 제품 데모 / keynote를 영화적으로"
- "B站 / YouTube / 抖音 영상 콘텐츠"

`allowed-tools` / `metadata`: **원문에 명시 없음.** `manifest.json`에 `compat` 목록.

## 3. 적합한 상황 / 부적합한 상황

**적합**
- 이미 원고나 기사가 있고 그것을 영상 콘텐츠로 만들어야 할 때
- **녹화가 목적**일 때 — 진행바·헤더·푸터가 없는 무 chrome 스테이지, `?auto=1` 원테이크 모드
- TTS로 음성을 합성해 음영상 동기를 자동화하고 싶을 때
- 23개 테마 중 콘텐츠에 맞는 시각 기조를 고르고 싶을 때
- 장 단위 병렬 개발로 속도를 내야 할 때 (모드 C)

**부적합 / 과한 상황**
- **소재 없이** "X 주제 영상 만들어줘" — Phase 1.1이 반문하도록 규정: "**反问**：先给一段素材或大纲。**Skill 不替用户构思内容**"
- 반응형 웹이 필요할 때 — "内容 1920×1080 + transform scale，**没有响应式**"
- 읽는 문서·기사 → `beautiful-article` (`web-design-engineer`의 description이 이 스킬을 명시적으로 라우팅 대상으로 지정)
- 일반 웹 산출물 → `web-design-engineer`
- 순수 텍스트 장을 원할 때 — 금지: "**每章必须有 CSS / SVG / Canvas / JS 视觉演示，禁纯文字章节**"
- Node/npm 없는 환경 — Vite+React 스캐폴드 전제

**형제 스킬 대신 이걸 고르는 기준**: 산출물이 **재생·녹화되는 것**인가. `web-design-engineer`의 description이 "narration-driven click-through video presentations"를 자기 범위 밖으로 밀어내며 이 스킬을 가리킨다.

## 4. 외부 의존성

### API 키 (**Phase 3 음성 합성에서만, 선택적**)

Phase 1·2·4는 키가 전혀 필요 없다. Phase 3만 TTS 제공자 키를 요구한다.

| Provider | 키 / 도구 | 원문 설명 |
|---|---|---|
| **`minimax`** (기본) | **MiniMax API key** + `mmx-cli` | "中文口播首选（用 `mmx-cli`，要 MiniMax API key）". 설치: `npm install -g mmx-cli && mmx auth login --api-key sk-xxxxx` |
| **`openai`** (내장 2번) | **`OPENAI_API_KEY`** (**필수**) | "多数 agent 已有 `OPENAI_API_KEY`；curl-based、响应快" |
| ElevenLabs (외부) | **`ELEVENLABS_API_KEY`** | "英文音色最佳" |
| edge-tts | 없음 (무료) | `tts-providers/README.md`의 코드 스니펫 |
| macOS `say` | 없음 (오프라인) | 동일 |
| Azure / Google | 각자 키 | 동일 |

**OpenAI TTS 환경변수** (`AUDIO.md`):

| 변수 | 기본값 | 설명 |
|---|---|---|
| `OPENAI_API_KEY` | — **必须** | API key |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | "切代理 / Azure-OpenAI" |
| `OPENAI_TTS_MODEL` | `tts-1` | "`tts-1` 快 / `tts-1-hd` 高质量约 **2× 价**" |

제공자 선택: `PRESENTATION_TTS=openai npm run synthesize-audio`

**사전 점검 장치**: "`tts_check` 会检查 curl / jq / `OPENAI_API_KEY` 三件套，**缺哪个报哪个**."

### 키가 없을 때의 동작 (**명시적 폴백**)
Checkpoint Audio가 합성 여부를 사용자에게 묻는 하드 노드다. "✗ 不合成 → **跳过 Phase 3，直接 Phase 4 用手动录屏 + 后期配音**." 즉 **키 없이도 완결 가능**하며, 산출물(웹 프레젠테이션)은 손상되지 않고 녹화 방식만 Manual로 바뀐다.

무료 경로도 명시: edge-tts(무료), macOS `say`(오프라인) — `tts-providers/README.md`에 "三函数契约 + 5 段现成代码片段".

### 기타 의존성
- **Node + npm** — Vite + React + TS 프로젝트, `npm run extract-narrations` / `synthesize-audio`
- **`npx tsc --noEmit`** — 장별 완공 자체점검의 필수 통과 항목
- **`curl` + `jq`** — OpenAI TTS 제공자
- **`mmx-cli`** — MiniMax 제공자
- **브라우저** — dev server(localhost:5173) 프리뷰 + 녹화
- **화면 녹화 도구** — Phase 4 (`RECORDING.md`)
- **SubAgent / Agent Teams** (선택) — 자체점검과 모드 C 병렬 개발
- **네트워크**: npm 설치 + TTS API 호출
- **비용 발생 지점**: **TTS 합성** (MiniMax / OpenAI / ElevenLabs 등). `tts-1-hd`는 약 2배 가격. 증분 합성 지원(`npm run synthesize-audio` "默认 minimax provider，**增量**")으로 재합성 비용을 줄임.

## 5. 워크플로우

### 전체 구조 (원문 다이어그램)
```
Phase 1   内容编写
   1.1  识别用户输入
   1.2  一次产出 script.md + outline.md
   ▼
[Checkpoint Plan]  ← 必须停。一次对齐 5 件事：稿子 / outline / 主题 / 素材 / 开发模式
   ▼
Phase 2   网页开发
   2.1  脚手架（按选定主题）
   2.2  第 1 章 = 主线程 + 完整版本（强制 anchor）
        ▼ [硬节点] 用户验收第 1 章 ← 不可跳过
   2.3  第 2~N 章（A 逐章 / B 顺序 / C 并行）
   ▼
[Checkpoint Audio] ← 必须停。是否合成音频
   ▼
Phase 3   音频合成（可选）
   ▼
Phase 4   录屏 + 后期
```

### 작업 디렉토리 구조
```
my-video/
├── article.md          # 用户给原文时必有 —— 不删！开发阶段画面信息源
├── script.md           # 必有：保持原文语言的平台化口播稿（决定节拍）
├── outline.md           # 必有：开发计划（章节切分 + 每步内容 + 信息池）
└── presentation/       # Vite + React + TS
    ├── src/chapters/<NN>-<id>/
    │   ├── <Chapter>.tsx / <Chapter>.css
    │   └── narrations.ts     # ★ step 数 + 口播文本的唯一真相源
    ├── scripts/extract-narrations.ts / synthesize-audio.sh / tts-providers/
    ├── audio-segments.json
    └── public/audio/<id>/<N>.mp3
```

**핵심 불변식 (원문)**: "`narrations.ts` 是 step 数和音频合成的**唯一真相源**。章节 `.tsx` 里的 `if (step === N)` 出现的最大 N + 1 必须等于 `narrations.length`。这保证 **5 处地方**（script / outline / 章节代码 / chapters.ts / 音频文件）永远不会漂。"

### 하드 자체점검 프로토콜 (전 과정 관통)
3개 산출물마다 "**완성 후 반드시 자체점검 → 수리 → 보고/추진**":

| 산출물 | 자체점검 출처 |
|---|---|
| `script.md` | `SCRIPT-STYLE.md` 3층 자체점검 (形式 / 风骨 / 念出来) |
| `outline.md` | `OUTLINE-FORMAT.md` 자체점검 |
| 단일 장 구현 완료 | `CHAPTER-CRAFT.md` 완공 자체점검 |

**실행 방식 (능력에 따른 강등, 격리된 방식 우선)**:
1. "**Agent Teams（最优）**：开一个独立的 reviewer agent，给它'产出文件路径 + 对应清单 + 关键上下文'，让它逐项核查并**严格汇报结论**（哪几条 pass / 哪几条 fail + 证据 + 改写建议）"
2. "**subAgent（次优）**"
3. "**自检（兜底）**：当前 agent 都没有上述能力，就自己**严格逐项**核查 —— **不允许目测一遍就放行**"

**철칙**: "拿到结论后**先按 fail 项把产出改完**，再向用户汇报'做完了 + 自检结论 + 改了什么'。**直接拿原始结论汇报但不修复 = 违规**."

### Phase 1.1 — 입력 식별 (**게이트: 진입 거부 가능**)

| 用户给的东西 | 该做的 |
|---|---|
| 원본 기사 (书面语 / 공중호 / 논문 / 블로그) | `script.md` + `outline.md` 일괄 산출 → Checkpoint Plan |
| 직접적인 구어 원고 / 영상 스크립트 | `script.md`로 낙반, `outline.md` 일괄 산출(간소화) → Checkpoint Plan |
| 아무것도 없음, "X 주제 영상 만들어줘" | **反问**：先给一段素材或大纲。**Skill 不替用户构思内容** |

### Phase 1.2 — script.md + outline.md **일괄 산출**
"两份产出物在**一次思考中**完成"
1. `script.md` — `SCRIPT-STYLE.md` 규칙으로 기사를 원문 언어 유지 플랫폼화 구어 원고로. "**保留 `article.md` 不删**——它是 outline 写信息池和章节实现画面时的细节源（**双源原则**）"
2. `outline.md` — `OUTLINE-FORMAT.md` 규칙으로 장 분할 + step 분할 + 장별 첫 단락 **信息池(정보 풀)** 추출

**outline의 경계 (핵심 설계 결정)**

| outline 必须写 | outline 不要写 |
|---|---|
| 章节切分 / 每章 step 数 / 估时 | 具体动画类型（blur clear / wipe / 弹簧） |
| 每步屏幕内容（hero / 数据 / 标语 / 列表项） | CSS 实现手段（filter / SVG / clip-path） |
| 章节级**信息池**：从 article 抽的数字 / 引用 / 案例 / 标签 | 时长数值（不写 ~2.5s / 80~120ms） |
| 步级关系名前缀（"反差对照" / "递进列表" / "金句" 등 선택 hint） | 持续微动 / 错峰量等微观节奏 |

**outline이 애니메이션을 쓰지 않는 이유 (원문)**: "写死动画 = **chapter agent 退化为翻译机**；留白让 chapter agent 在每步开工时按 `CHAPTER-CRAFT.md` 的'内容驱动决策树'自由设计，才有真正的视频感."

### Checkpoint Plan — 5건 일괄 정렬 (**하드 노드, 필수 정지**)

**agent의 사전 준비 작업**:
1. "读所有 `themes/*/theme.json` 拿 `nameZh` / `descriptionZh` / `bestFor` / `mood` —— **不要硬编码清单**"
2. "根据 `script.md` 的内容类型 / 关键词 / 语气，**主动**从主题里挑 **2~3** 套**最匹配的推荐**（匹配 `bestFor` 字段）"
3. "扫一遍 `outline.md` 末尾'素材清单'部分"

**확인 5항목**:
1. **稿子 (script.md)** 수정 여부
2. **开发计划 (outline.md)** 수정 여부 — 중점: "章节切分 / step 数 / 估时是否合理（**合理判断：每章 30~60s**）/ 每步屏幕内容是否清晰 / 每章首段「信息池」是否有足够的 article 细节供画面挂 / 末尾素材清单是否完整"
3. **주제 선택** — AI 추천 2~3개 + 나머지 목록 + 신규 테마 제작 옵션
4. **실제 소재 준비** — "a) 我从 <现有素材路径> 帮你挑 b) 你自己提供 c) **全部 placeholder**"
5. **개발 모드 선택** — A/B/C

**주제 확정 규칙**: "**主题必须明确**才进入 Phase 2。用户说'主题你帮我选' → 取你推荐的第 1 个，**告诉用户你选了什么、为什么**，给反悔机会"

### Phase 2.1 — 스캐폴드
```bash
bash <skill>/scripts/scaffold.sh ./presentation --theme=<id>
bash <skill>/scripts/scaffold.sh --list-themes
```
데모 장 제거 지시: `rm -rf presentation/src/chapters/01-example` + `chapters.ts`에서 `EXAMPLE_CHAPTER` import·배열 항목 제거

### Phase 2.2 — 제1장: 메인 스레드 + **강제 검수** (하드 노드)
"第 1 章 = **完整版本一次到位**（节奏 + 视觉 + 真素材齐全）。**没有'骨架版'概念**"

제1장이 메인 스레드여야 하는 3가지 이유 (원문):
- "它是 `CHAPTER-CRAFT.md` 这套指引在**当前主题 + 当前题材**下的第一次落地"
- "如果指引有盲区 / 主题颜色 / 字体 token 不够用，第 1 章一定会暴露 —— 这时候有人类反馈就能修指引 / 调主题，**早改成本最低**"
- "后续章节都要参考第 1 章的代码模式，所以第 1 章 = 当次项目的'**风格锚点**（不强求章节间一致，但单章自身得有完整说服力）'"

**검수 체크리스트 (사용자에게 제시)**:
```
□ 视觉气质对不对？符合 <theme nameZh> 的预期吗？
□ 节奏对不对？某些步太快 / 太慢 / 信息太薄？
□ 内容驱动动画是否到位？还是有几步是无脑入场动画？
□ 双源原则：屏幕画面有没有"口播没念但 article 能挂"的细节？
□ 反 AI 味检查：紫粉渐变 / 圆角彩色边框 / 假插画 / emoji 是否有？
```

### Phase 2.3 — 제2~N장: 3가지 모드
- **모드 A · 逐章确认 (기본, 권장)**: 장마다 검수 정지. "风险最低，节奏最稳". "**用户不明确选模式时默认走这个**"
- **모드 B · 顺序开发**: 메인 스레드 순차, 마지막에 일괄 검수. "适合 agent 不支持并行任务的环境"
- **모드 C · 并行开发 (subagent)**: 병렬 수는 사용자가 통제("一次 4 章"). "**最快，但风格各章会有差异**"

**모드 C의 스타일 불일치를 정당화하는 4가지 근거 (원문)**:
1. "每个 subagent 看不到别的 subagent 产出，无法机械对齐"
2. "章节代码物理分离（每章一个文件夹 / 自己的 CSS 前缀），不会互相破坏"
3. "主题 token 兜底视觉统一（颜色 / 字体 / hero 数字 / 卡片 / 分割线性格 / 装饰），气质不会跑偏"
4. "**风格不一致 = 人手写视频的呼吸感**（多 voice / 多视角）"

**병렬 subagent 프롬프트 필수 포함 항목**: 현재 장 outline 단락(정보 풀 포함) / `CHAPTER-CRAFT.md` 경로(**단일 필독**) / 현재 테마 `theme.json`의 `descriptionZh`·`mood`·`bestFor` / **제1장 코드를 "코드 스타일" 참조로**(시각 표절 대상 아님) / 하드룰(장별 독립 CSS 접두사 `.cd-`/`.mg-`/`.pm-`, `chapters.ts` 수정 금지, 완공 시 `npx tsc --noEmit`)

"**无论选哪种模式，用户随时可以中途切换模式**"

### Phase 2.5 — 대규모 변경 후 STORAGE_KEY bump
"改动 `chapters.ts`（增加 / 删除 / 重排章节，或某章 `narrations.ts` 长度变化）后，**bump** `presentation/src/hooks/useStepper.ts` 的 `STORAGE_KEY`（如 `v4` → `v5`），避免持久化游标落到不存在的 step 上."

### Checkpoint Audio (**하드 노드, 필수 정지**)
합성 여부를 묻고, 합성 시 파이프라인과 제공자 옵션을 안내. 미합성 시 Phase 3 생략.

### Phase 3 — 음성 합성 (선택)
```bash
cd presentation
npm run extract-narrations   # 扫所有 narrations.ts → audio-segments.json
# 让用户扫一眼 audio-segments.json 确认文本对
npm run synthesize-audio                       # 默认 minimax，增量
PRESENTATION_TTS=openai npm run synthesize-audio
```
합성 후 보고 항목: "输出位置 / 总段数 / **哪些段时长异常（太长 = 该 step 拆分；太短 = 文案太薄）**—— 给最后一次校准节奏的机会"

### Phase 4 — 녹화 + 후반

| 场景 | 推荐路径 |
|---|---|
| Phase 3 합성 완료 | "**Auto 模式一镜到底**：浏览器开 `localhost:5173/?auto=1` → 按 SPACE → 整片自动播完 → 停录 → 裁头尾即成片，**无需后期对音轨**" |
| Phase 3 생략 | "默认 Manual 模式手动点击推进 → 后期任意剪辑工具配音" |

**사용자 확인 요구 지점 (총 3곳 필수 정지 + 모드별 추가)**: Checkpoint Plan(5항목) / 제1장 검수(불가 생략) / Checkpoint Audio. 모드 A에서는 장마다 추가 정지.

## 6. 디자인 지침 분석

### 십조 원칙 (十条原则) — 원문 그대로

| # | 原则 | 一句话 |
|---|---|---|
| 1 | 16:9 固定舞台 | 内容 1920×1080 + transform scale，**没有响应式** |
| 2 | 全局 step 计数器 | 章节是 step 的纯函数，**无定时器** |
| 3 | 每步独占整屏 | `if (step === N) return <FullScene />` |
| 4 | 口播节拍 = step | 一节拍 = 一 step = **一聚焦想法** |
| 5 | 隐藏的边角控件 | 进度条 / 翻页器默认 **opacity 0** |
| 6 | 舞台无 chrome | **没有 header / footer / 页码 / 品牌条** |
| 7 | **内容驱动动画** | **先找内在动作，找不到才入场动画兜底**；持续微动慎用 |
| 8 | 多点逐个揭示 | **1 项 = 1 step**，禁同步 stagger 上 N 项 |
| 9 | 整片同一主题 | 章节间不翻表面色；**颜色 / 字体走 token**，其它尺度章节自由 |
| 10 | 双源原则 | **script 定节拍，article 定画面密度**（落到信息池） |

### 금지 규칙 (anti-pattern) — 원문 그대로

**「避免 AI 味」 (CHAPTER-CRAFT.md) — "AI 生成的网页有几种共有的'视觉指纹'，全部不要"**
- 紫粉 / 蓝紫对角渐变背景
- 圆角卡片 + 彩色左边框装饰
- 渐变按钮 + 大圆角药丸
- emoji 当图标用
- 假数据 / 假 logo / 假"X 万用户"
- **整章 N 步用同一种入场动画（全场 fade / 全场 blur）**
- **每步都挂 ken burns / 光晕呼吸 / 持续闪烁**
- **每屏右下角都挂 mono 角标 / 序号**

플레이스홀더 철학: "缺的东西**承认缺** —— 用 placeholder 占位卡（一张写着'image · 16:9 描述'的卡片，**按真实比例留位**）。**不要**用 emoji 凑、不要找无关图凑、不要编数字。**没有就承认没有**，比 fake 强一百倍."

**토큰 하드룰 (换主题不破的底线)**
- "**颜色**：`--shell` / `--surface` / `--surface-2` / `--surface-3` / `--text` / `--text-2` / `--text-mute` / `--text-faint` / `--rule` / `--accent` / `--accent-soft` / `--accent-glow` —— **禁硬编码 hex / rgb / 颜色名**"
- "**字体家族**：`--font-display-cn` / `--font-display-en` / `--font-body` / `--font-mono` —— **禁硬编码字体名**"
- "**主题性格签名**通过 primitive class 自动接入，**不要在章节 CSS 里重定义它们**": `.hero-num`(hero 숫자 스타일 — 테마가 세리프/등폭/굵은고딕 결정), `.rule`(분할선 — 테마가 1px 실선/4px 실선/2px 점선 결정), `.card`(카드 — 테마가 라운드+그림자 성격 결정), `.stage-frame`(무대 바탕색/라운드/그림자/장식 패턴/vignette 전자동, "章节什么都不用做")

**기타 엔지니어링 레드라인**
- "**不用 `setTimeout` / `setInterval` 驱动动画** —— 用 CSS keyframes"
- "章节内的可交互元素（按钮 / 自定义控件）加 `data-no-advance`，否则点了会被舞台误推进 step"
- "章节代码物理隔离：每章独立文件夹、独立 CSS 类前缀，**不跨章 import**"
- "**每章必须有 `narrations.ts`**" (아래 수치 참조)
- "**动画时长必须 ≤ 该 step 的口播时长**——Auto 模式严格按音频结束推进，**没有'等动画跑完'的兜底**"

**콘텐츠·구조 금지**
- "**每章必须有 CSS / SVG / Canvas / JS 视觉演示，禁纯文字章节**"
- "**逐步揭示**：清单 / 列表必须 1 项 = 1 step，**禁一次全展示**"
- "禁止出现**小号字体，大量纯文字**（出现后必须回去改）"
- "禁止出现**任何形式的页眉页脚**，仅展示关键内容（出现后必须回去改）"
- "内容取舍：抓重点，**不要原文搬运**"
- outline 금지: 애니메이션 종류·CSS 구현 수단·시간 수치·미시 리듬 (§5 참조)
- 수리 원칙: "先定位是哪一层（节奏 / 视觉 / 内容 / 代码），再改最小切片，**不要重做整章**"
- 자체점검: "任一未过 → 回去改。**不要**'先放着以后修'"
- "**直接拿原始结论汇报但不修复 = 违规**"

**애니메이션 미학의 금지 (원문)**
- "**动画要舒服 + 炫酷** —— 出现得干净利落，停下来不抢戏；炫酷靠**设计巧思**（内容驱动的演示动画），**不靠速度暴力**或**密集闪烁**"

### 강제 규칙 — 수치 인용

**스테이지 규격**
- 캔버스: **1920×1080** (16:9) + `transform scale`, 반응형 없음
- 안전 영역: "上下左右四边都让出**至少 80px** 的安全区"
- 진행바: 기본 **opacity 0**, 하단 가장자리 호버 시 출현, 클릭으로 장 이동

**타이포그래피**
- "**字号要大** —— hero 文字**至少 80px 起**，远观也能看清"
- 근거: "视频观众离屏幕远、注意力浮动"

**시간·리듬**
- 장 길이: "**每章 30~60s**" (합리적 판단 기준)
- 구어 시간 추정: "口播 **字数 ÷ 4** ≈ 秒数"
- 애니메이션 상한: "每个 step 的视觉动画时长 **≤ 口播时长**". 초과 시 3택: "**写更长口播 / 拆 step / 调动画速度**"
- outline에 금지된 수치 예시로 "~2.5s / 80~120ms"가 명시됨 (즉 이런 값은 장 개발 시 결정)

**narrations.ts 불변식**
- "数组长度 **=** 章节代码里 `if (step === N)` 出现的**最大 N + 1**"
- "完全无音频的过场 step 用**空串 `\"\"`**，Auto 模式会按字数估时撑过"
- "每条 narration 文本与 `script.md` 对应段落**语义一致**（关键短语 / 数字 / 引用全部保留，**可为 TTS 微调标点断句**）"

**시각 연출 최소량**
- "**每章至少 1~2 处 CSS / SVG / Canvas / JS 视觉演示** —— 没有 = 回去补"
- "**不同 step 的主导动作不一样** —— 全章一种动画 = 回去重做"

**CSS 접두사 규약**: 장별 독립 접두사 — `.cd-` / `.mg-` / `.pm-` 등

**TTS 수치**: `tts-1-hd`는 `tts-1`의 "约 2× 价", "HD 大约慢 2 倍"

**주제 추천 개수**: Checkpoint Plan에서 **2~3개**

### 항목별 지침

**타이포그래피**
- hero 최소 **80px**
- 폰트 패밀리는 4개 토큰 강제 (`--font-display-cn` / `--font-display-en` / `--font-body` / `--font-mono`), 하드코딩 금지
- 폰트 **크기는 장이 자유** — "想要 80px 就写 80px，想用 `var(--t-h1)` 也行"
- `.hero-num` primitive class가 hero 숫자의 서체 성격(세리프/등폭/굵은고딕)을 테마에서 받음
- 금지: "小号字体，大量纯文字"

**컬러**
- 12개 색 토큰 강제, 하드코딩 hex/rgb/색이름 **금지**
- 테마가 팔레트를 소유 (23개 테마 × `tokens.css`)
- 장 간 표면 색 전환 금지 (원칙 9: "章节间不翻表面色")
- 금지 팔레트: 紫粉 / 蓝紫 대각 그라디언트
- 대비 비율 수치는 **원문에 명시 없음**

**스페이싱**
- 안전 영역 최소 **80px** 사방
- "**留白要多** —— 舞台四边都要让出大留白，画面不要塞满"
- spacing scale은 **장이 자유** — "间距 / padding / margin：按画面节奏写具体值"

**모션**
- 원칙 7이 핵심: "**先找内在动作，找不到才入场动画兜底**；持续微动慎用"
- 관계→동작 결정 트리가 `CHAPTER-CRAFT.md` Part 2에 존재 (outline이 애니메이션을 쓰지 않는 대신 여기서 즉시 설계)
- CSS keyframes만, `setTimeout`/`setInterval` 금지
- duration/easing/keyframe은 **장이 자유**, 단 "**节奏气质**参考 `theme.json` 的 `mood` —— **慢主题别写 200ms 的快动画**"
- 상한: 애니메이션 시간 ≤ 해당 step의 구어 시간
- 금지: 전 장 동일 입장 애니메이션, ken burns / 광훈 호흡 / 지속 점멸
- "炫酷靠设计巧思，不靠速度暴力或密集闪烁"

**레이아웃**
- 16:9 고정, 반응형 없음
- 무대 무 chrome (header/footer/페이지번호/브랜드바 없음)
- step마다 전체 화면 독점
- `gap`/grid 치수는 장이 자유
- `.stage-frame`이 무대 바탕/장식/vignette 전담

**접근성**
- **원문에 지침 없음.** 반응형도 명시적으로 없고(녹화 전용), `prefers-reduced-motion` 언급도 없다. 녹화 산출물이 최종 목적이므로 설계상 범위 밖.

### 지침을 주는 방식 자체

1. **십조 원칙 + 단일 필독 입구**: 원칙을 10개로 압축해 SKILL.md에 인덱스로 두고, 전개는 `CHAPTER-CRAFT.md` Part 0에. "写章节时**只读一份** `CHAPTER-CRAFT.md`" — 장 개발이 N회 반복되므로 필독을 한 파일로 통합.
2. **"이건 영상이지 PPT가 아니다"를 첫 절로**: `CHAPTER-CRAFT.md`의 첫 섹션 제목이 "这是视频，不是 PPT". 정체성 선언으로 시작.
3. **자유와 강제의 명확한 분리**: 토큰(색·폰트 패밀리·primitive class)은 강제, 나머지 척도(자간·크기·간격·시간·keyframe)는 장이 자유. 그 목록을 표로 명시 — "**可硬编码 / 可 token，按内容自由（解锁章节自由设计）**". 이것이 이 스킬의 가장 특징적인 설계.
4. **의도적 불일치 허용 + 정당화**: 병렬 개발의 스타일 차이를 결함이 아니라 "**风格不一致 = 人手写视频的呼吸感**"으로 재정의하고, 토큰이 하한선을 지킨다는 4단 논거를 제시.
5. **outline에서 애니메이션을 배제하는 설계 결정 + 이유**: "写死动画 = chapter agent **退化为翻译机**". 즉 지침을 덜 주는 것 자체를 설계로.
6. **双源原则 (이중 소스)**: "script 定节拍，article 定画面密度". 원문 기사를 지우지 않고 남겨 화면 정보 밀도의 소스로 씀. 장별 "信息池"로 사전 추출.
7. **단일 진실 소스 + 5곳 표류 방지**: `narrations.ts`가 step 수와 음성의 유일 진실. 불변식을 수식으로 명시.
8. **하드 노드 3개 + 제1장 강제 검수**: 정지 지점을 명확히 표기(`★` / `[硬节点]` / `不可跳过`).
9. **자체점검의 능력별 강등 체계**: Agent Teams > subAgent > 자체 점검. "**不允许目测一遍就放行**".
10. **수리 전 계층 진단**: "先定位是哪一层（节奏 / 视觉 / 内容 / 代码），再改最小切片".
11. **23개 테마 + 동적 조회**: "**不要硬编码清单**" — `theme.json`을 매번 읽어 `bestFor`로 매칭 추천.
12. **EXAMPLES를 필독에서 제외**: "`EXAMPLES/` **不是必读** —— 先按内容自由设计，卡壳才翻（**按 anchor 翻'形'，不要照搬**）". 예시가 표절 대상이 되는 것을 경계.
13. **실행 가능한 검증 삽입**: `npx tsc --noEmit`이 완공 자체점검의 필수 항목 — "不通过禁止汇报'做完了'".
14. **장 길이·상태 표류 대비**: `STORAGE_KEY` bump 규칙, 합성 후 "시간 이상 구간" 보고로 리듬 재교정 기회 제공.
15. **페르소나 부여 없음**, **실물 브랜드 참조 없음** (테마 이름이 사조·질감을 암시: bauhaus-bold, swiss-ikb, vintage-editorial, blueprint, kraft-paper 등).

### 모호한 감각어의 번역

| 감각어 (원문) | 구체적 조작 |
| --- | --- |
| "**看起来像视频**" (영상처럼 보임) | 16:9 고정 무대 + 무 chrome + step마다 전체 화면 독점 + 매 화면 애니메이션 + 진행바 숨김 |
| "**动态 PPT 但不像 PPT**" | `CHAPTER-CRAFT.md` 첫 절 "这是视频，不是 PPT" + 페이지번호·헤더·푸터 금지 + 순수 텍스트 장 금지 |
| "**电影感**" (영화적) | 대자 + 큰 여백 + 내용 구동 애니메이션 + 원테이크 Auto 모드 |
| "**AI 味**" (AI 냄새) | 8개 시각 지문 목록 (자분 그라디언트 / 라운드카드+컬러 좌테두리 / 그라디언트 버튼+큰 알약 / emoji 아이콘 / 가짜 데이터·로고 / 전 장 동일 입장 애니메이션 / ken burns·광훈 호흡 / 우하단 mono 각표) |
| "**炫酷**" (화려함) | "靠**设计巧思**（内容驱动的演示动画），**不靠速度暴力**或**密集闪烁**" |
| "**舒服**" (편안함) — 애니메이션 | "出现得干净利落，停下来**不抢戏**" |
| "**舒服**" — 배색 | 테마 토큰 사용 (판단을 테마로 이양) |
| "**远观也能看清**" | hero 최소 80px, 근거 "视频观众离屏幕远" |
| "**无脑入场动画**" (검수 항목) | 원칙 7 위반 — 내재 동작을 찾지 않고 fade/blur로 때운 것 |
| "**信息太薄**" | 双源原则 위반 — article에서 정보 풀을 뽑아 화면에 걸지 않음 |
| "**风格锚点**" (제1장) | 후속 장의 **코드 스타일** 참조 (시각 표절 대상 아님), 단 "不强求章节间一致" |
| "**人手写视频的呼吸感**" | 병렬 개발의 장별 스타일 차이 (多 voice / 多视角) |
| "**没有就承认没有，比 fake 强一百倍**" | placeholder 카드 ("image · 16:9 描述", 실제 비율로 자리 확보) |
| "**慢主题别写 200ms 的快动画**" | `theme.json`의 `mood`가 리듬 기질의 참조 |

## 7. 산출물

- **주 산출물**: `presentation/` — Vite + React + TS 프로젝트. 장별 `<Chapter>.tsx` + `.css` + `narrations.ts`
- **콘텐츠 산출물**: `script.md` (구어 원고), `outline.md` (개발 계획 + 정보 풀 + 소재 목록), `article.md` (원문 보존)
- **선택 산출물**: `audio-segments.json` (합성 전 리뷰용), `public/audio/<id>/<N>.mp3`
- **최종 산출물**: 화면 녹화 영상 (Phase 4, 스킬 밖의 도구로)
- **네이밍 규칙 (명시됨)**
  - 장 디렉토리: `src/chapters/<NN>-<id>/`
  - 오디오: `public/audio/<id>/<N>.mp3`
  - CSS 접두사: 장별 독립 (`.cd-` / `.mg-` / `.pm-` …)
  - `STORAGE_KEY`: `v4` → `v5` 형태의 버전 bump
- **재생 모드 2개**: Manual (클릭/←→ 추진), **Auto** (`?auto=1` + SPACE, 음성 종료에 맞춰 자동 추진)

## 8. 주의점 / 한계

- **애니메이션 시간 ≤ 구어 시간 제약이 강하다**: Auto 모드가 "严格按音频结束推进，**没有'等动画跑完'的兜底**"이므로, 공들인 애니메이션이 잘려나갈 수 있다. 해결은 3택(원고 늘리기 / step 쪼개기 / 애니메이션 빠르게)뿐. 구어 시간 추정도 "字数 ÷ 4"라는 거친 근사에 의존한다.
- **`narrations.ts` 불변식의 수동 유지**: 배열 길이와 `if (step === N)`의 최대값을 사람/에이전트가 맞춰야 한다. 자체점검 체크리스트에 있지만 **자동 검증 스크립트는 없다** (`tsc --noEmit`은 타입만 본다). 어긋나면 "Auto 模式录屏会错位".
- **반응형 없음 + 접근성 지침 없음**: 설계상 녹화 전용이므로 의도된 선택이지만, 웹으로 배포·공유하려는 경우 그대로 쓸 수 없다. 이 용도에 대한 언급은 **원문에 없음**.
- **하드 노드 3개 + 모드 A의 장별 정지**: 장이 8개면 모드 A에서 정지가 10회를 넘는다. 자동화·배치 실행과 강하게 상충. 모드 B/C가 완화 수단이지만 모드 B도 마지막에 일괄 검수가 필요.
- **모드 C의 스타일 불일치**: 원문이 이를 "설계 예상"으로 정당화하지만, 균일한 톤을 원하는 사용자에게는 결함으로 보일 수 있다. 원문은 이 트레이드오프를 Checkpoint Plan에서 사용자에게 명시하므로 처리 자체는 정직하다.
- **TTS 비용·품질**: MiniMax는 중국어 음색이 강점, ElevenLabs는 영어가 최상이라고 명시하지만 한국어 등 다른 언어에 대한 권고는 **원문에 없음**. `tts-1-hd`는 2배 가격·2배 느림.
- **`mmx-cli` 기본 제공자**: 기본값이 MiniMax인데 이는 별도 계정·CLI 설치·로그인이 필요하다. `OPENAI_API_KEY`가 더 흔하다는 점을 원문도 인정("多数 agent 已有")하지만 기본값은 minimax로 남아 있어, 첫 실행에서 실패할 가능성이 높다.
- **Agent Teams / subAgent 의존**: 자체점검의 최적 경로가 격리된 리뷰어 에이전트. 폴백이 "자기 자신이 엄격히 항목별 점검"이므로 검증 독립성이 사라진다.
- **테마 토큰 계약의 완전성**: 12개 색 + 4개 폰트 토큰 + 4개 primitive class로 23개 테마를 커버한다. 장이 필요한 표현을 토큰이 제공하지 못하면 하드코딩 금지 규칙과 충돌하는데, 그 해결책(토큰 추가 절차)은 `THEMES.md`에 있을 것으로 보이나 SKILL.md 본문에서는 "第 1 章一定会暴露 … 早改成本最低" 정도로만 언급.
- **언어**: SKILL.md와 모든 references가 중국어. 영어 README 별도.
- **강한 경고 지점**:
  - "**Skill 不替用户构思内容**"
  - "**直接拿原始结论汇报但不修复 = 违规**"
  - "**不允许目测一遍就放行**"
  - "第 1 章 … **不可跳过**"
  - "**主题必须明确**才进入 Phase 2"
  - "**禁纯文字章节**"
  - "**1 项 = 1 step**，禁一次全展示"
  - "**禁硬编码 hex / rgb / 颜色名**" / "**禁硬编码字体名**"
  - "**动画时长必须 ≤ 该 step 的口播时长**"
  - "`npx tsc --noEmit` 不通过禁止汇报'做完了'"
  - "**不要**'先放着以后修'"
  - "EXAMPLES … **不要照搬**"
- **검증 장치 (강점)**: 3개 산출물별 자체점검 체크리스트 + 능력별 강등 실행 체계 + 수리 후 보고 의무 + 제1장 사용자 검수(5항목) + 장별 완공 자체점검(14항목, `tsc --noEmit` 포함) + 합성 후 시간 이상 구간 보고 + `STORAGE_KEY` 표류 방지. **실행 가능한 검증(타입 체크)과 판독 검증(체크리스트)을 결합**하며, `beautiful-article`과 함께 이 컬렉션의 검증 설계 수준을 대표한다.
