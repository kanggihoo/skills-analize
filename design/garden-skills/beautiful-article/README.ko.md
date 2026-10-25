# Beautiful Article Skill —— 어떤 자료든 읽기 좋은 아름다운 글로 편집하기

> AI 에이전트를 위한 스킬입니다. 어떤 자료(URL / PDF / DOCX / Markdown / 일반 텍스트 / 스크린샷 / 붙여 넣은 자료)든 **편집하고 디자인**해 **원문보다 읽기 쉽고 공유 및 보관에 좋은 아름다운 글**로 만듭니다.

[영어](./README.md) · [컬렉션 홈으로 돌아가기](../../README.zh-CN.md)

![Beautiful Article Skill](../../dist/imgs/covers/beautiful-article.webp)

---

### [ReActicle](https://github.com/ConardLi/reacticle) 기반

`beautiful-article`은 편집형 **하네스**(방법론, 체크포인트, 테마 선택, 하위 에이전트 리뷰어)입니다. [`reacticle`](https://github.com/ConardLi/reacticle)는 스킬이 실행 중 호출하는 **하위 수준 컴포넌트 프로토콜**입니다. 산문 우선 React 시맨틱 컴포넌트와 테마 토큰 기반 `Raw` 자유 레이어를 하나의 테마 시스템에 연결합니다.

```
beautiful-article  （本 Skill · 方法论 + harness）
        │  调用
        ▼
reacticle          （npm 包 · 组件 / 主题 / Raw / 导出）
```

| 계층 | 담당 내용 | 저장소 / 문서 |
|---|---|---|
| `beautiful-article`(이 스킬) | 에이전트가 어떤 자료든 글을 기획, 작성, 검토, 전달하는 **방법** — 6단계 흐름, 필수 체크포인트 3개, 테마 선택, 하위 에이전트 리뷰어 | 현재 디렉터리 |
| `reacticle` | 스킬이 실제 조립하는 컴포넌트 어휘 + 작성 테마 11종 — `Article` / `Hero` / `Lead` / `Section` / `Quote` / `Image` / `Formula` / `CodeBlock` / `Raw` 등. 각 테마는 `.css` 토큰 패키지와 `.md` 작성 프로필로 구성 | [`ConardLi/reacticle`](https://github.com/ConardLi/reacticle) · [npm `reacticle`](https://www.npmjs.com/package/reacticle) · [문서 사이트](https://rearticle.mmh1.top/) |

두 도구는 함께 쓸 때 가장 좋지만 서로 독립적입니다. Skill은 ReActicle이라는 안정적인 목표 계층 덕분에 작동하며, ReActicle은 독립적인 React 컴포넌트 라이브러리로도 충분히 사용할 수 있습니다.

---

### [글 샘플](https://mmh1.top/#/ai-article) —— `beautiful-article` + ReActicle로 작성한 실제 글

각 글은 AI 에이전트가 이 스킬로 [`reacticle`](https://www.npmjs.com/package/reacticle) 컴포넌트 프로토콜을 호출해 처음부터 끝까지 작성한 실제 장문입니다. 표지를 누르면 단일 파일 HTML 버전을 온라인으로 열 수 있습니다.

<table>
<tr>
<td width="50%" valign="top" align="center">
<a href="https://mmh1.top/#/ai-article/tools">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/tools.webp" alt="에이전트 도구 설계 모범 사례" width="320">
<br><b>에이전트 도구 설계의 모범 사례</b>
</a>
<br><sub>테마 · Freddie · 장문 · 21분</sub>
<br><sup>Anthropic 엔지니어링 팀의 도구 설계 원칙 다섯 가지와 평가 중심 방법론.</sup>
</td>
<td width="50%" valign="top" align="center">
<a href="https://mmh1.top/#/ai-article/skill">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/skill.webp" alt="에이전트 스킬은 어떻게 진화하는가?" width="320">
<br><b>에이전트 스킬은 어떻게 진화하는가?</b>
</a>
<br><sub>테마 · Freddie · 설명 글 · 8분</sub>
<br><sup>스킬 문서를 복사해 붙이는 프롬프트가 아니라 훈련되는 대상으로 바라봅니다.</sup>
</td>
</tr>
<tr>
<td width="50%" valign="top" align="center">
<a href="https://mmh1.top/#/ai-article/harness">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/harness.webp" alt="에이전트 하네스 해부도" width="320">
<br><b>에이전트 하네스 해부</b>
</a>
<br><sub>테마 · Vignelli · 장문 · 12분</sub>
<br><sup>지능은 모델 안에 있습니다. 지능을 유용하게 만드는 것은 모델을 둘러싼 시스템입니다.</sup>
</td>
<td width="50%" valign="top" align="center">
<a href="https://mmh1.top/#/ai-article/prompt-cache">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/prompt-cache.webp" alt="프롬프트 캐시는 에이전트에 얼마나 중요한가?" width="320">
<br><b>프롬프트 캐시는 에이전트에 얼마나 중요한가?</b>
</a>
<br><sub>테마 · Bayer · 장문 · 15분</sub>
<br><sup>캐시 적중률은 에이전트의 SLO입니다. Claude Code 팀의 직관에 반하는 경험.</sup>
</td>
</tr>
<tr>
<td width="50%" valign="top" align="center">
<a href="https://mmh1.top/#/ai-article/context">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/context.webp" alt="에이전트를 위한 효율적인 컨텍스트 엔지니어링" width="320">
<br><b>에이전트를 위한 효율적인 컨텍스트 엔지니어링</b>
</a>
<br><sub>테마 · Tufte · 장문 · 16분</sub>
<br><sup>AI 에이전트를 작동시키는 컨텍스트를 효율적으로 선별하고 관리하는 방법을 다룹니다.</sup>
</td>
<td width="50%" valign="top" align="center">
<a href="https://mmh1.top/#/ai-article/transformer">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/transformer.webp" alt="Attention Is All You Need" width="320">
<br><b>Attention Is All You Need</b>
</a>
<br><sub>테마 · Tufte · 장문 · 30분</sub>
<br><sup>현대 AI를 바꾼 논문을 한 층씩 풀어 설명합니다.</sup>
</td>
</tr>
<tr>
<td width="50%" valign="top" align="center">
<a href="https://mmh1.top/#/ai-article/agent-eval">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/agent-eval.webp" alt="AI 에이전트 평가를 명확히 설명하기" width="320">
<br><b>AI 에이전트 평가를 명확히 설명하기</b>
</a>
<br><sub>테마 · Tufte · 장문 · 25분</sub>
<br><sup>에이전트를 유용하게 만드는 능력이 오히려 평가를 어렵게 합니다 — Anthropic 가이드.</sup>
</td>
<td width="50%" valign="top" align="center">
<a href="https://mmh1.top/#/ai-article/agent-loop-codex">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/agent-loop-codex.webp" alt="Codex의 에이전트 루프는 어떻게 작동하는가?" width="320">
<br><b>Codex의 에이전트 루프는 어떻게 작동하는가?</b>
</a>
<br><sub>테마 · Sottsass · 장문 · 18분</sub>
<br><sup>OpenAI 공식 설명: Responses API 위에서 하나의 대화가 어떻게 반복해서 "펼쳐지는가".</sup>
</td>
</tr>
</table>

---

### [테마 개요](https://rearticle.mmh1.top/#/gallery) —— 테마마다 샘플 글 하나

> 테마 11종이 준비되어 있습니다. 테마별 전체 계약(`.css` 토큰 패키지 + `.md` 작성 프로필, 안티패턴, 코드 / 미디어 스타일)은 [Theming](https://rearticle.mmh1.top/#/theming)에서 확인하세요.

각 테마에는 **샘플 장문**이 하나씩 포함됩니다. 글꼴, 사진, 코드, 수식, Raw 블록을 모두 보여 줍니다. 표지를 누르면 온라인으로 읽고, 테마 이름을 누르면 문서 사이트의 해당 테마 섹션으로 이동합니다.

<table>
<tr>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/caffeine-half-life">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-tufte.webp" alt="Tufte · Data-Ink" width="260">
<br><b>Tufte</b> · Data-Ink
</a>
<br><sub>카페인과 수면 · 데이터 노트</sub>
<br><sup>Edward Tufte의 데이터 잉크, 증거 우선, 가는 선 그래프와 가장 담백한 레이아웃.</sup>
</td>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/movable-type">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-press.webp" alt="Press · 책의 품격" width="260">
<br><b>Press</b> · 책의 품격
</a>
<br><sub>활자 이후 · 에세이</sub>
<br><sup>Stripe Press 스타일 장문 읽을거리: 묵직한 제목, 산화된 붉은 첫 글자, 본문 자체의 아름다움.</sup>
</td>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/pool-exhaustion">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-shannon.webp" alt="Shannon · 엔지니어링 다크" width="260">
<br><b>Shannon</b> · 엔지니어링 다크
</a>
<br><sub>커넥션 풀 고갈 · 장애 회고</sub>
<br><sup>Bell Labs 기술 논문의 계보, 어두운 바탕의 황금 신호, 역압 의존성, 야간 대응 분위기.</sup>
</td>
</tr>
<tr>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/orbit-spec">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-vignelli.webp" alt="Vignelli · 스위스" width="260">
<br><b>Vignelli</b> · 스위스 그리드
</a>
<br><sub>Orbit 디자인 시스템 사양 · 명세</sub>
<br><sup>Massimo Vignelli식 그리드 우선, 그로테스크 서체군, 구조에만 쓰이는 스위스 레드.</sup>
</td>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/linear-attention">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/knuth.png" alt="Knuth · 학술" width="260">
<br><b>Knuth</b> · 학술
</a>
<br><sub>선형화된 자기 주의 · 프리프린트</sub>
<br><sup>Donald Knuth / Computer Modern, 번호가 붙은 절, 명제와 증명, arXiv 초고 분위기.</sup>
</td>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/first-newsletter">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-freddie.webp" alt="Freddie · 웜 옐로" width="260">
<br><b>Freddie</b> · 웜 옐로
</a>
<br><sub>첫 뉴스레터 · 시작 가이드</sub>
<br><sup>Mailchimp Freddie의 검정 글자와 형광색, 친근한 일러스트 + 격식 없이 제품을 소개하는 어조.</sup>
</td>
</tr>
<tr>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/slow-breathing">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-andy.webp" alt="Andy · 고요" width="260">
<br><b>Andy</b> · 고요
</a>
<br><sub>호흡을 천천히 · 연습</sub>
<br><sup>부드럽고 둥근 형태, 호흡과 신경계의 시소, 속도를 늦추게 하는 연습 분위기.</sup>
</td>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/front-page">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-bodoni.webp" alt="Bodoni · 신문·잡지" width="260">
<br><b>Bodoni</b> · 신문·잡지
</a>
<br><sub>신문 1면의 소멸 · 특집 기사</sub>
<br><sup>고대비 Didone 신문 스타일, 흑백 대형 지면, 접지선을 넘어서는 무게감.</sup>
</td>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/geometry-of-meaning">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-bayer.webp" alt="Bayer · 바우하우스" width="260">
<br><b>Bayer</b> · 바우하우스
</a>
<br><sub>형태, 색, 그리드 · 교육</sub>
<br><sup>Herbert Bayer의 바우하우스 삼원색 기하학, 성격을 지닌 형태와 무게감 있는 색상.</sup>
</td>
</tr>
<tr>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/rate-limiter-spec">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-fuller.webp" alt="Fuller · 청사진" width="260">
<br><b>Fuller</b> · 청사진
</a>
<br><sub>속도 제한기 설계 명세 · 시스템 디자인</sub>
<br><sup>Buckminster Fuller식 엔지니어링 청사진, 모눈종이 토폴로지, 토큰 버킷 시뮬레이션, 그대로 구현 가능.</sup>
</td>
<td width="33%" valign="top" align="center">
<a href="https://rearticle.mmh1.top/#/gallery/color-clash">
<img src="https://raw.githubusercontent.com/ConardLi/assets/main/imgs/article/theam-sottsass.webp" alt="Sottsass · 멤피스" width="260">
<br><b>Sottsass</b> · 멤피스
</a>
<br><sub>과감한 색 조합을 망치지 않기 · 디자인 에세이</sub>
<br><sup>80년대 멤피스의 강렬한 배색, 검은 윤곽선, 딱딱한 그림자, 살짝 기울어진 장난스러운 문법.</sup>
</td>
<td width="33%" valign="top" align="center">
&nbsp;
</td>
</tr>
</table>

> 테마 전환, 검색, 필터를 포함한 테마 샘플 11종 전체는 온라인 갤러리에서 볼 수 있습니다: <https://rearticle.mmh1.top/#/gallery>.

---

## 이 스킬의 역할

`beautiful-article`은 지루하고 선형적이며 이해하기 어려운 텍스트 자료를 시각적으로 아름답고 읽기 흐름이 명확하며 검토와 공유가 쉬운 **글**로 바꿉니다. 웹 애플리케이션 생성기가 **아닙니다**. 초점은 항상 "글" 자체에 있습니다: 더 나은 읽기 경험, 더 나은 리듬, 더 나은 미학. 최종 산출물은 자체 포함되어 오프라인에서 열 수 있는 파일이며 PDF를 선택적으로 함께 제공할 수 있습니다. 이는 전달 방식이지 목표는 아닙니다.

적합한 장면:

- 긴 URL / PDF / DOCX / Markdown을 **웹 장문**으로 편집
- 의사결정 요약 브리핑, 개념 설명, 교육 절차 튜토리얼, 회고 리뷰, 제안 분석
- 비주얼 에세이, 대화 / 인터뷰 / 팟캐스트 전사, 인터랙티브 학습 설명 자료
- Markdown보다 **더 나은 읽기 매체**가 필요한 모든 경우 — 표, SVG, 코드, 수식, 복사 / 내보내기 버튼까지 제공

이 스킬은 본질적으로 **방법론 + 협업 하네스**입니다. [`reacticle`](https://www.npmjs.com/package/reacticle) 컴포넌트 프로토콜 기반의 Vite + React + TypeScript 스캐폴드를 포함합니다. 에이전트는 생 HTML / CSS를 직접 작성하지 않고 산문 우선 시맨틱 컴포넌트와 테마 제약을 받는 `Raw` 자유 레이어를 조합합니다.

---

## 핵심 원칙

- **글이 먼저이며 앱이 아닙니다** — 초점은 항상 글에 둡니다. Raw 자유 레이어, SVG, 작은 도구는 읽기 / 설명 / 리듬 / 미학을 지원해야 하며 주의를 빼앗아서는 안 됩니다.
- **Source → Plan → Build → Review 소형 하네스** — 프로젝트마다 번호가 붙은 6단계를 거치고 그 사이에 필수 체크포인트 3개를 둡니다.
- **`reacticle` 컴포넌트 프로토콜** — 시맨틱 산문 컴포넌트(Hero / Lead / Section / Quote / Callout / Image / Formula / CodeBlock / Table 등)와 테마 토큰(`--ra-*`)을 사용해야 하는 `Raw` 자유 레이어를 제공합니다.
- **테마 중심 설계** — 작성 프로필 11종(`tufte` / `press` / `bayer` / `bodoni` / `vignelli` / `sottsass` / `freddie` / `andy` / `fuller` / `knuth` / `shannon`)을 내장합니다. 각 프로필은 CSS 파일이 아니라 에이전트가 보는 Markdown 계약입니다.
- **기본 정보 보존율 100%** — 글 유형별 권장 보존율이 있습니다(longform `~100%` / briefing `~50%` / visual-essay `~40%` 등). 사용자는 한 문장으로 변경할 수 있습니다.
- **필수 협업 체크포인트** — 계획, 첫 화면 시안, 최종 전달 전에 에이전트가 멈춥니다. **각 결정은 하나씩 독립적으로 확인해야 하며 "전부 괜찮나요?"라고 묶어서 물으면 안 됩니다.**
- **표지가 기본 포함됩니다** — 목차 위에 3:4 책 표지형 대표 이미지 공간을 두며 프레임은 고정, 테마 토큰만 사용하고 원격 이미지는 허용하지 않습니다.
- **PDF 내보내기는 선택 사항입니다** — 주 산출물은 자체 포함 HTML 파일입니다. 사용자가 체크포인트 3에서 직접 선택할 때만 의존성이 없는 `html-to-pdf.sh`로 PDF를 생성합니다.

---

## 작업 흐름

```text
Phase 0  Intake
   │
Phase 1  Source → Markdown      （URL / PDF / DOCX / MD / 文本 → source.md）
   │
Phase 2  Editorial Planning     （一份 plan.md：Brief / Outline / Theme / Assets）
   │
★ Checkpoint 1  Plan            （5 个独立决策逐项确认）
   │
Phase 4  First Spread           （封面 + Hero + 第一节 + 一个代表性视觉块）
   │
★ Checkpoint 2  First Spread    （验收 + 后续开发模式 A/B）
   │
Phase 5  Full Article Build     （单 Agent 顺序 / 多 Agent 并行）
   │
Phase 6  Final Review           （Editorial / Visual / Technical 三视角）
   │
Phase 7  Repair                 （只允许最小切片修复）
   │
★ Checkpoint 3  Delivery        （HTML，或 HTML + PDF，或暂停修订）
   │
Phase 8  Delivery               （article.html，可选 article.pdf）
```

각 프로젝트는 에이전트의 **장기 기억** 역할을 하는 자체 작업 공간 디렉터리를 가집니다.

```text
<workspace>/
  source/   original.*   source.md   source.<lang>.md（需翻译时）   extraction-notes.md
  plan/     plan.md
  article/  Cover.tsx   Article.tsx   sections/   raw-blocks/   assets/   article.html（产物）
  review/   first-spread-review.md   final-review.md
            （source-review.md 仅复杂源；repair-log.md 仅有修复时）
  index.html  package.json  vite.config.ts  tsconfig*.json   （构建工装）
```

---

## 스킬 디렉터리 구조

```text
skills/beautiful-article/
├── SKILL.md                            主 Skill 文件（frontmatter name: beautiful-article）
├── manifest.json                       发布清单
├── README.md  /  README.zh-CN.md       本文档
├── references/
│   ├── article-types.md                文章类型路由
│   ├── article-types/                  briefing / dialogue / essay / explainer / full-report
│   │                                    interactive-explainer / longform / review / tutorial / visual-essay
│   ├── information-density.md          保留比例与组件 / 视觉比例的关系
│   ├── plan-template.md                单一 plan.md 模板（Brief / Outline / Theme / Assets）
│   ├── theme-selection.md              主题选择，density 与 theme 解耦
│   ├── layout.md                       版式宽度、TOC 默认值
│   ├── cover.md                        3:4 书封封面指南（5 条自检 + 5 个构图模板）
│   ├── asset-policy.md                 配图策略（none / user-assets / placeholders / ai-generated）
│   ├── component-policy.md             Reacticle 组件契约、prose-first
│   ├── raw-policy.md                   Raw 允许 / 禁止表、token 驱动、自检
│   ├── section-build.md                一节一文件铁律、subagent prompt 模板
│   ├── source-to-markdown.md           各类输入抽取规则 + 5 条自检
│   ├── scaffold.md                     脚手架行为、工作区结构
│   ├── html-output.md                  dev / build / 单文件 HTML 命令
│   ├── pdf-output.md                   html-to-pdf.sh 用法 + print CSS 覆盖
│   ├── review-checklist.md             各阶段 reviewer 清单与 sub-agent prompt
│   ├── repair-policy.md                最小切片修复对照表
│   └── harness.md                      Skill-as-harness 视角
├── theme-profiles/
│   ├── index.json                      主题注册表
│   └── andy / bayer / bodoni / freddie / fuller / knuth / press / shannon / sottsass / tufte / vignelli
├── scripts/
│   ├── scaffold.sh                     一键创建工作区
│   ├── html-to-pdf.sh                  可选 HTML → PDF（headless 浏览器，零 npm 依赖）
│   ├── pdf-print-overrides.css         注入 HTML 的 @media print 覆盖
│   ├── source-to-markdown-markitdown.py  主路径抽取（PDF / DOCX / HTML）
│   └── source-to-markdown.py           轻量 fallback（Markdown / TXT / 简单 HTML）
└── assets/
    └── scaffold-template/              脚手架脚本拷贝的 Vite + React + TS 模板
```

---

## 작동 방식(요점)

### 1. 단계별 품질 검토 방식

각 단계마다 다른 검토 방식을 사용합니다. 하위 에이전트를 남용하거나 리뷰 파일을 과도하게 작성하는 것이 주요 성능 문제이므로 스킬에서 규칙을 명확히 합니다.

| 단계 | 검토 방식 | 산출물 |
|---|---|---|
| Phase 1 소스(기본) | 주 에이전트가 체크리스트 5개를 인라인으로 확인 | 파일 없음 |
| Phase 1 소스(복잡하거나 신뢰도가 낮은 입력만) | 소스 리뷰어 하위 에이전트가 `original.*`과 diff 비교 | `review/source-review.md` |
| Phase 2 계획 / 체크포인트 1 전 | **주 에이전트 인라인 자체 검토(하위 에이전트 실행 금지, 파일 작성 금지)** | 파일 없음 |
| Phase 4 첫 펼침 / 체크포인트 2 전 | 첫 펼침 리뷰어 하위 에이전트 | `review/first-spread-review.md` |
| Phase 5 각 섹션 | 섹션 리뷰어 하위 에이전트가 메시지로 pass/fail 반환 | 없음(섹션마다 파일을 작성하지 않음) |
| Phase 6 최종 검토 / 체크포인트 3 전 | 편집 + 시각 + 기술 리뷰어 하위 에이전트 | `review/final-review.md` |

### 2. 사용자 대신 조용히 결정하지 않기

각 체크포인트의 모든 결정 항목은 반드시 **하나씩 독립적으로** 질문합니다. 에이전트는 추천할 수 있지만 "X로 정해 두었으니 아니면 말해 주세요"라고 해서는 안 됩니다. 계획 체크포인트에서는 글 유형(권장 보존율 포함) / 테마 / 레이아웃 너비 / 이미지 모드 / 표지 사용 여부의 다섯 가지 결정을 각각 확인합니다.

### 3. 글 유형별 보존율

글 유형 10종마다 권장 보존율이 있습니다: `longform · ~100%` / `tutorial · ~90%` / `full-report · ~80%` / `explainer · ~80%` / `dialogue · ~80%` / `review · ~70%` / `essay · ~70%` / `briefing · ~50%` / `visual-essay · ~40%` / `interactive-explainer · 원문 인용 ~25% + AI 재구성 ~75%`. 사용자는 한 문장으로 이를 변경할 수 있습니다.

### 4. 섹션마다 파일 하나

각 섹션은 `article/sections/NN-*.tsx`의 단일 파일 컴포넌트입니다. `Article.tsx`는 조립기일 뿐이며 주 에이전트가 소유해 import와 정렬을 관리하고 typecheck / build를 실행하며 테마 이탈을 해결합니다. 이것이 이후 여러 에이전트가 병렬 작업을 하는 전제입니다.

### 5. 전 과정에서 테마 토큰 사용

`Raw` 블록은 `--ra-*` 테마 토큰만 사용해야 하며 임의의 색상 / 글꼴은 허용되지 않습니다. 테마를 바꾸면 모든 Raw 블록에 한 번에 반영됩니다. 각 테마에는 에이전트에게 해당 테마의 작성법과 레이아웃을 안내하는 Markdown 작성 프로필이 있습니다.

---

## 프로젝트 만들기

스킬은 작업 공간을 미리 만들지 않습니다. 프로젝트마다 직접 생성합니다. 다음 명령은 Phase 4에서 사용합니다.

```bash
# 默认开封面
bash <path-to-skill>/scripts/scaffold.sh ./my-article --theme=tufte

# 关闭封面
bash <path-to-skill>/scripts/scaffold.sh ./my-article --theme=press --no-cover

# 查看可用主题
bash <path-to-skill>/scripts/scaffold.sh --list-themes
```

스캐폴드는 Vite + React + TS 작업 공간을 만들고 npm에서 최신 `reacticle`을 설치합니다. `source/ plan/ review/` 세 디렉터리와 시작 파일 `article/Article.tsx` / `article/Cover.tsx` / `article/sections/01-opening.tsx`도 준비합니다.

Phase 5가 끝나면 에이전트가 빌드를 실행해 단일 파일 HTML을 생성합니다.

```bash
npm run build           # → article/article.html（CSS + JS 全内联）
```

PDF 내보내기는 선택 사항입니다(체크포인트 3에서 사용자가 HTML + PDF를 선택한 경우에만 수행).

```bash
bash <path-to-skill>/scripts/html-to-pdf.sh
```

---

## 모범 사례

### 권장

1. **먼저 글 유형을 정합니다** — 권장 보존율이 전체 계획의 기준이 됩니다.
2. **하네스 단계를 따릅니다** — "답이 분명하다"는 이유로 계획 체크포인트를 건너뛰지 않습니다.
3. **Raw 블록에는 테마 토큰만 사용합니다** — `--ra-*`를 쓰고 색상 / 글꼴 이름을 직접 지정하지 않습니다.
4. **섹션마다 파일 하나를 사용합니다** — 짧은 섹션도 분리합니다. 검토와 수정 단계에서 이 노력이 보상됩니다.
5. **표지는 주제와 글의 요지를 반영해야 합니다** — 자리만 채우는 그라데이션을 쓰지 않습니다.

### 피하기

1. ❌ 이 스킬을 "HTML 페이지를 만들어 주는 도구"로 취급 — 산출물은 **글**입니다.
2. ❌ 여러 체크포인트 결정을 하나의 예 / 아니요 질문으로 묶기.
3. ❌ Raw 블록에 자체 색상 / 글꼴 지정(테마 이탈).
4. ❌ 모든 섹션을 `Article.tsx`에 작성(하위 에이전트 병렬 작업 불가).
5. ❌ 콜로폰 / 표지 프레임 제거(계약의 일부).

---

## 자주 묻는 질문

**Q1: 이 스킬을 사용하면 안 되는 경우는 언제인가요?**
사용자가 실제로 원하는 것이 웹 앱 / 대시보드 / 양식 / 프로토타입 / 일반 랜딩 페이지라면 이 스킬이 아니라 `web-design-engineer`를 사용합니다. 확실하지 않으면 스킬은 잘못된 결과를 조용히 만들지 않고 멈춰서 확인합니다.

**Q2: 항상 정보를 100% 보존하나요?**
아닙니다. 100%는 `longform` 유형의 기본값일 뿐입니다. 글 유형에 따라 권장 비율이 다르며 사용자는 체크포인트 1에서 변경할 수 있습니다.

**Q3: 글의 언어를 원본 자료와 다르게 해도 되나요?**
가능합니다. 사용자가 원본과 다른 목표 언어를 지정하면 Phase 1에서 자연스러운 번역본 `source/source.<lang>.md`를 먼저 만들고 Phase 2부터 이를 바탕으로 작성합니다.

**Q4: 에이전트 실행 환경에 하위 에이전트 / Task 도구가 없으면 어떻게 하나요?**
스킬은 이 경우를 고려합니다. 주 에이전트가 하위 에이전트의 역할을 대신하고 리뷰 파일 첫머리에 "하위 에이전트 미지원 환경, 주 에이전트가 대체 수행"이라고 표시합니다.

**Q5: 왜 일반 HTML 대신 React + Vite + reacticle을 사용하나요?**
에이전트가 안정적인 산문 우선 컴포넌트 계약을 필요로 하기 때문입니다. 여러 섹션의 병렬 작성, 테마 전환, Raw 자유 레이어 같은 상황을 지원합니다. `npm run build`를 실행하면 모든 의존성이 단일 HTML 파일에 인라인되어 전달됩니다.

---

## 도구 요구 사항

이 스킬은 에이전트 실행 환경에서 다음이 가능하다고 가정합니다.

- 셸 명령 실행(`scaffold.sh` / `html-to-pdf.sh` / `npm` 빌드용)
- 작업 공간에서 파일 읽기 / 쓰기
- (선택) 하위 에이전트를 실행해 첫 펼침 / 섹션 / 최종 검토 수행
- (선택) 고품질 PDF / DOCX / HTML 추출에 `MarkItDown`(Python) 사용. 사용할 수 없으면 경량 대체 스크립트가 Markdown / TXT / 간단한 HTML을 처리

---

## 라이선스

MIT
