# plan.md 템플릿(단일 계획 파일)

Phase 2에서는 `plan/plan.md` **파일 하나만** 출력하며 네 부분으로 구성합니다: **Brief / Outline / Theme / Assets**.
**HTML을 직접 작성하지 않습니다.** 작성이 끝나면 주 Agent가 `review-checklist.md`의 “Plan 자체 점검”에 있는 5개 항목을 인라인으로 확인합니다. 점검 결과에 따라 `plan/plan.md` 자체를 수정하고 **하위 에이전트나 리뷰 파일은 생성하지 않은 채** Checkpoint 1로 넘어갑니다.

> 파일을 통합한 이유: 기존 파일 네 개(editorial-brief / outline / theme-decision / asset-plan) 중 다음 단계에서 실제로 다시 읽는 정보는 “정보 보존 비율 / 목표 언어 / 섹션 앵커 / 테마 id”뿐이었습니다. 하나로 합치면 주 Agent가 관리하기 쉽고 Section 하위 에이전트는 plan.md에서 자기 섹션에 해당하는 Outline만 찾아보면 됩니다.

---

## `plan/plan.md` 전체 템플릿

```markdown
# Plan

## Brief

- 目标读者：<谁会读，带着什么问题>
- 目标语言：<跟随源语言（默认） / 指定语言>。若指定且与源不一致：源语言 <X> → 目标 <Y>，
  事实底座用翻译版 `source/source.<lang>.md`（地道、去翻译腔）
- 文章类型：<longform / full-report / tutorial / explainer / dialogue / review / essay / interactive-explainer / briefing / visual-essay>
- 信息保留比例：<X%>（默认走类型标配：longform=100% · tutorial=90% · full-report=80% ·
  explainer=80% · dialogue=80% · review=70% · essay=70% · briefing=50% · visual-essay=40% ·
  **interactive-explainer=~25%（特例 · 见下）**；用户偏离标配则写实际值并加一行"非标配组合
  · 注意事项"，提醒主 Agent 在写每节时手动调整正文/视觉比例）
- **interactive-explainer 特例说明**：这个比例的含义和其它类型不同 —— 不是"原文删了 75%"，而是
  "成品里直接来自原文的句子 / 段落约占 25%"；其余 75% 是 AI 围绕核心知识点全新创作的引导文字
  + 交互演示 + 自己试 + 验证理解。本质是**内容重构**而非内容压缩。
- 必须保留的信息：<章节 / 表格 / 代码 / 数据 / 引用，逐条列；指向 source.md 的具体位置>
- 可删减的信息：<重复 / 旁枝 / 过时内容；每条带理由>
- 语气：<克制分析 / 出版叙事 / 决策汇报 / 教学>
- 主要观点：<这篇要让读者记住的 1-3 个判断>
- 阅读目标：<读完能做什么 / 知道什么>
- 版式宽度：<narrow / regular / wide / full>（默认 regular，见 layout.md）
- TOC：<开 / 关>（默认开）
- 配图策略：<none / user-assets / placeholders / ai-generated>
- 封面：<开（默认） / 关>。若开，写一句构图想法 + 选定的封面模板（A 左字右图 / B 大字盖图 /
  C 上字下图 / D 几何拼贴 / E 极简框）+ 主视觉用什么（如"SVG 缓存命中率曲线"/"包豪斯三色块"）。
  详见 `references/cover.md`。Brief 阶段一句话即可，正式视觉在 Phase 4 First Spread 替换
  `article/Cover.tsx` 时落定。

## Outline

- Hero：<标题气质 / 副标题 / meta：日期·来源·作者>
- Lead：<导语，框定主题，1-2 句>
- Summary：<是否需要；放结论先行 / TL;DR>

### Sections

1. <编号 NN> <标题>
   - 保留信息：<从 source.md 哪几段，要保留到什么程度>
   - 需要的组件：<Section 正文 + 是否 Aside/Quote/Table/CodeBlock/Formula/Image>
   - 是否需要 Raw：<是/否；若是，服务哪个论点、表达目的>
2. ...

- 结尾方式：<Conclusion / 行动项 / 留白收束>

## Theme

- 选定主题：<tufte / press / ...>
- 理由：<为什么是它，结合源材料类型 / 语气 / 配图策略>
- 与源材料的冲突：<若有，如何处理；若无，写"无">
- 当前信息密度下的表现建议：<正文 / Raw / 图片比例如何调整；可引用 theme-profiles/<id>.md>

## Assets

> 这一段配合"Brief / 配图策略"使用。`none` 模式下写一句话即可。

- 策略：<none / user-assets / placeholders / ai-generated>
- 一句话说明：<为什么是这个策略；Raw 始终存在、不在本段讨论>

### 逐图计划（仅 user-assets / placeholders / ai-generated 模式需要）

每张图列：

- 位置：<Hero 背景 / Section 02 之后 / ...>
- 服务的段落或论点：<...>
- 目的：<建立气质 / 解释机制 / 提供证据 / ...>
- 主题：<选定主题>
- 风格 / 构图：<...>
- 禁止项：<3D icon / neon gradient / SaaS stock photo / 笑脸办公室人 / ...>
- 来源：<user-assets 文件路径 / placeholders 描述 / ai-generated 提示词>
- 备选提示词（ai-generated 模式）：<...>
```


---

## 템플릿 사용 요점

- **Outline은 섹션의 기준점입니다.** 개발 모드 B에서 Section 하위 에이전트는 이 부분을 읽어 담당 섹션을 찾습니다. 각 절은 `<编号 NN> <标题>`으로 시작하고 번호는 최종 `article/sections/NN-*.tsx`와 일치해야 합니다.
- **반드시 보존 / 삭제 가능 정보는 장식용 필드가 아닙니다.** Section Reviewer가 정보 보존 비율이 지켜졌는지 대조합니다.
- **Theme 부분은 길게 쓰지 않아도 됩니다.** 보통 3–5문장이면 충분합니다. 충돌을 처리하는 내용이 핵심입니다.
- `none` 이미지 모드에서는 **Assets 부분을 아주 짧게** 작성합니다. “외부 이미지는 사용하지 않고 본문 + Raw + 표로 표현”이라고 한 문장만 적어도 됩니다. 이미지별 계획은 필요하지 않습니다.

## 다른 reference와의 관계

- 글 유형 선택: `article-types.md` → `article-types/<type>.md`.
- 정보 보존 비율: `information-density.md`.
- 테마 선택: `theme-selection.md`. 결론은 이 템플릿의 **Theme** 부분에 기록합니다.
- 레이아웃 너비 / TOC: `layout.md`. 결론은 **Brief** 부분에 기록합니다.
- 이미지 출처 네 가지 / ai-generated 프롬프트 원칙: `asset-policy.md`. 결론은 **Assets** 부분에 기록합니다.
- 표지(책 표지형 이미지: 화면 3:4 / PDF 첫 페이지 단독 사용): `cover.md`. 결론은 **Brief**의 “표지” 행에 기록합니다. 구체적인 비주얼은 Phase 4 First Spread에서 `article/Cover.tsx`를 작성할 때 확정합니다.
- 자체 점검 목록: `review-checklist.md`의 “Plan 자체 점검(5개)” 항목.
