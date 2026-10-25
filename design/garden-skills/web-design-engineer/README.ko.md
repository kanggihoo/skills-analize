# Web Design Engineer Skill

**AI가 생성한 웹페이지를 “쓸 만한 수준”에서 “놀라운 수준”으로 끌어올리는 에이전트 스킬입니다.**

[English](./README.md) · [모음집 홈으로](../../README.zh-CN.md)

![Web Design Skill](../../dist/imgs/covers/web-design-engineer.webp)

---

## 이 스킬은 무엇인가요?

[Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Cursor](https://cursor.com), 그리고 `SKILL.md` 형식을 지원하는 다른 도구를 위한 재사용 가능한 **Skill**(구조화된 시스템 프롬프트)입니다. AI가 생성하는 HTML/CSS/JavaScript 결과물의 디자인 품질을 크게 높입니다.

[Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs) 시스템 프롬프트의 핵심 디자인 원칙을 추려 개방적이고 이식 가능하며 사용자 지정할 수 있는 스킬 파일로 만들었습니다. 어떤 프로젝트에든 바로 넣어 사용할 수 있습니다.

### 문제

최신 대규모 언어 모델은 간단한 프롬프트만으로도 기능을 갖춘 웹페이지를 만들 수 있습니다. 하지만 결과는 늘 비슷한 미감으로 수렴합니다. Inter 글꼴, 파란 기본 버튼, 보라·분홍 그라데이션, 모서리가 둥근 카드, 아이콘 대신 이모지, 지어낸 후기. 기술적으로는 멀쩡해도 시각적으로는 서로 구별되지 않습니다.

### 해결 방법

이 Skill은 다음 방식으로 AI의 의사 결정 과정에 **디자인 취향**을 반영합니다.

- **진부함 방지 규칙** — AI 디자인이 피해야 할 패턴을 명시한 목록
- **디자인 시스템 선언** — 코드를 쓰기 전에 색상, 글꼴, 간격, 모션 선택을 자연어로 설명하게 함
- **oklch 색상 이론** — 무작위 hex 값 대신 지각적으로 균일한 색 공간에서 팔레트를 파생
- **엄선된 글꼴 × 색상 조합** — 기본 Inter + #3b82f6을 대신하는 높은 품질의 시작점
- **placeholder 원칙** — 엉성한 가짜 SVG 대신 솔직한 `[icon]` 표시 사용
- **5개 다이얼 Design Read** — 대상, 산출물, 브랜드, 제약을 구도 변화 / 모션 / 밀도 / 에셋 / 브랜드 충실도에 관한 가시적인 결정으로 전환
- **보존 계약을 유지하는 리디자인 프로토콜** — 수정 전에 Extension, Preserve, Overhaul 모드를 구분
- **맥락을 고려한 실패 패턴** — 타당한 예외는 남겨 두면서 레이아웃, 콘텐츠, 에셋, 모션, 대시보드에서 흔한 AI 문제를 식별
- **구조화된 워크플로** — 요구 사항 → 맥락 → 조정된 디자인 시스템 → v0 초안 → 전체 구현 → 검증
- **요청 시에만 브라우저 검수** — 사용자가 검수나 브라우저 테스트를 명시적으로 요청한 경우에만 반응형 / 상호작용 / 런타임 QA 하네스를 실행

---

## 빠른 시작

### Claude Code / Cursor / AI Agent에서 사용

이 Skill 디렉터리를 프로젝트에 복사합니다.

```
your-project/
├── .agents/skills/web-design-engineer/   # 或 .claude/skills/web-design-engineer/
│   ├── SKILL.md                          # 主技能文件
│   ├── agents/openai.yaml                # 宿主展示信息与默认提示词
│   └── references/
│       ├── advanced-patterns.md          # 代码模板库（slide engine / 设备框架 / 动效时间线 / 数据可视化）
│       ├── block-library.md               # 已实现可复用 Block 索引
│       ├── browser-acceptance.md          # 仅在用户明确要求时执行的浏览器验收 harness
│       ├── design-calibration.md          # Design Read + 五旋钮 + 可选 image-first 分支
│       ├── design-directions.md          # 设计方向顾问（6 学派，差异化 3 选 1 推荐）
│       ├── failure-patterns.md            # 上下文化 AI 设计失败模式与修复方式
│       ├── redesign-protocol.md           # Extension / Preserve / Overhaul 审计与受保护契约
│       ├── style-recipes/                # 25 套有 anchor 的风格配方（按需读单文件，每个 anchor 一个 .md）
│       │   ├── INDEX.md                   #   目录索引 + 3 张索引表 + 跨配方反模式
│       │   ├── linear.md / aesop.md / pentagram.md / ...    #   25 个独立 recipe 文件
│       └── critique-guide.md             # 5 维评分细则 + 常见问题清单
└── ...
```

모음집 홈에서 Claude Code 플러그인 마켓플레이스를 통해 한 번에 설치할 수도 있습니다. [최상위 README](../../README.zh-CN.md#%E5%AE%89%E8%A3%85)를 참고하세요.

요청이 시각적이거나 인터랙티브한 프런트엔드 작업과 관련되면 Agent가 이 스킬을 자동으로 활성화합니다.

### 적용 범위

| 결과 유형 | 예시 |
|---|---|
| 웹사이트 및 랜딩 페이지 | 마케팅 페이지, 제품 페이지, 포트폴리오 |
| 인터랙티브 프로토타입 | 기기 프레임 안의 클릭 가능한 앱 목업 |
| 슬라이드 | 키보드 탐색을 지원하는 HTML 프레젠테이션(1920×1080) |
| 데이터 시각화 | Chart.js 또는 D3.js 기반 대시보드 |
| 애니메이션 | CSS/JS 모션 디자인, 타임라인 기반 데모 |
| 디자인 시스템 | 토큰 탐색, 컴포넌트 변형 |

---

## 작동 방식

### 조정된 워크플로

```
1. 理解需求          →  信息充足就干活，信息不足才提问
2. 获取设计上下文    →  代码 > 截图；现有项目先判断改动模式
3. 产出 Design Read  →  五个旋钮把 brief 映射为可见决策
4. 宣告设计系统      →  配色、字体、间距、动效 —— 用 Markdown 说明，写代码之前
5. 尽早展示 v0       →  占位符 + 布局 + token；让用户提前纠偏
6. 完整构建          →  组件、状态、动效；在关键决策点暂停确认
7. 验证              →  默认轻量自检；仅在用户明确要求时运行浏览器 harness
```

### 핵심 디자인 원칙

**AI 진부함 방지 목록.** 이 Skill은 다음 패턴을 명시적으로 금지합니다.
- 보라·분홍·파랑 그라데이션 배경
- 왼쪽에 색상 테두리를 두른 카드
- Inter / Roboto / Arial / Fraunces / system-ui 글꼴
- 이모지를 아이콘 대신 사용
- 지어낸 데이터, 가짜 로고 벽, 허위 후기

**oklch 색상 시스템.** 지각적으로 균일한 oklch 색 공간에서 색상을 파생합니다. 같은 밝기 값은 눈에도 같은 정도의 밝기로 보입니다. HSL은 그렇지 않습니다. HSL에서 밝기 50%인 노란색은 같은 50%인 파란색보다 훨씬 밝게 보입니다.

**엄선된 시작점.** 흔한 사용 사례를 아우르는 검증된 색상 × 글꼴 조합 여섯 가지입니다.

| 스타일 | 주요 색상 | 글꼴 조합 | 적합한 용도 |
|---|---|---|---|
| 현대 기술 | 청보라 | Space Grotesk + Inter | SaaS, 개발 도구 |
| 우아한 에디토리얼 | 따뜻한 갈색 | Newsreader + Outfit | 콘텐츠 플랫폼, 블로그 |
| 프리미엄 브랜드 | 거의 검정 | Sora + Plus Jakarta Sans | 럭셔리, 금융 |
| 활기찬 소비자 서비스 | 코랄 | Plus Jakarta Sans + Outfit | 전자상거래, 소셜 |
| 미니멀 전문성 | 청록색 | Outfit + Space Grotesk | 대시보드, B2B |
| 수공예 감성 | 캐러멜 | Caveat + Newsreader | 음식, 교육 |

**스타일 레시피 라이브러리(앵커가 있는 레시피 25개, 점진적 로드).** 사용자가 “Linear 스타일”, “Aesop 분위기”, “Pentagram급 타이포그래피”를 언급하면 Agent는 `references/style-recipes/<anchor>.md`의 단일 파일(약 50행)만 읽습니다. 전체 목차, 교차 색인 3개, 레시피 간 안티패턴은 `references/style-recipes/INDEX.md`(약 150행)에 있습니다. 전체 디렉터리를 한 번에 읽지 않습니다. 레시피 25개는 7개 학파(Direction Advisor의 6개 학파와 anchor를 직접 지정해야만 접근할 수 있는 *Specialty / Genre* 학파)에 나뉘어 있습니다.

| 학파 | 레시피 |
|---|---|
| 에디토리얼 / 미니멀 | `apple-hig` · `muji-kenya-hara` · `aesop` · `dieter-rams-braun` · `monocle-magazine` |
| 정보 아키텍처 | `pentagram` · `vignelli-swiss-helvetica` · `bloomberg-terminal` · `tufte-dataink` · `nyt-the-daily` |
| 최신 도구 / Builder SaaS | `linear` · `vercel-mesh` · `raycast` · `notion-pre-ai` |
| 모션 / 실험 | `field-io` · `active-theory` · `resn-storytelling` |
| 투박한 / 브루탈리즘 | `are-na` · `bloomberg-businessweek-turley` · `balenciaga-post-2017` |
| 따뜻한 휴머니즘 | `mailchimp-freddie` · `stripe-press` · `headspace-meditation` |
| 특정 스타일 / 시대 | `y2k-retrofuturism` · `mid-century-modern` |

---

## 스타일 레시피 갤러리

이 Skill에는 **이름이 붙은 레시피 25개**가 있으며 각 레시피는 실제 브랜드, 스튜디오 또는 디자이너에 대응합니다. 각 레시피는 데모 갤러리에 완성된 전체 페이지로 구현되어 있습니다. 공용 템플릿이나 축소된 무드보드가 아니라 Aesop의 약종상 제품 페이지, Bloomberg Terminal의 트레이딩 워크스테이션, Mid-Century의 Saul Bass 포스터, Y2K의 세기 전환기 포털 사이트처럼 각 레시피의 실제 스타일을 보여 줍니다. 아래 카드를 학파별로 살펴보고 brief와 분위기가 맞는 레시피를 고르거나 `references/style-recipes/<recipe>.md`의 사양 파일을 직접 읽으세요. 미리보기를 클릭하면 전체 해상도의 2:1 이미지를 볼 수 있습니다.

> 모든 스크린샷은 [`demo/web-design-engineer-demo`](../../demo/web-design-engineer-demo/)의 실제 React + Vite 갤러리에서 렌더링한 결과입니다. 글꼴, 팔레트, 시그니처 기법이 사양 파일과 일치합니다. 각 데모는 `src/recipes/<id>.tsx`에 있습니다.

### 에디토리얼 / 미니멀 · 5개

> 여백, 세련된 타이포그래피, 조용한 럭셔리 — 약종상, 박물관 도록, 하드웨어 제품 페이지.

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/apple-hig.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/apple-hig.webp" alt="apple-hig preview" /></a>
<br /><strong><code>apple-hig</code></strong>
<br /><sub>SF Pro Display, 넉넉한 여백, 부드러운 그림자 — Apple Store의 분위기</sub>
<br /><sub><b>적합한 용도</b> · 하드웨어 제품 페이지 · 기기 출시 · 고급 소비자 전자제품</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/muji-kenya-hara.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/muji-kenya-hara.webp" alt="muji-kenya-hara preview" /></a>
<br /><strong><code>muji-kenya-hara</code></strong>
<br /><sub>여백을 캔버스로 사용하고 회색과 종이 색을 조합, 공중에 떠 있는 듯 촬영한 오브제</sub>
<br /><sub><b>적합한 용도</b> · 오브제 카탈로그 · 홈 브랜드 · 슬로 라이프 숍</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/aesop.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/aesop.webp" alt="aesop preview" /></a>
<br /><strong><code>aesop</code></strong>
<br /><sub>따뜻한 캐러멜색, 세이지, 앰버; 문학 잡지 같은 세리프 본문</sub>
<br /><sub><b>적합한 용도</b> · 약종상 제품 페이지 · 뷰티 &amp; 웰니스 · 독립 리테일</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/dieter-rams-braun.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/dieter-rams-braun.webp" alt="dieter-rams-braun preview" /></a>
<br /><strong><code>dieter-rams-braun</code></strong>
<br /><sub>10가지 디자인 원칙, 회색조 격자, 기술 도면식 정투영 — 기능이 곧 형태</sub>
<br /><sub><b>적합한 용도</b> · 산업 디자인 아카이브 · 하드웨어 사양 · 브랜드 원칙 페이지</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/monocle-magazine.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/monocle-magazine.webp" alt="monocle-magazine preview" /></a>
<br /><strong><code>monocle-magazine</code></strong>
<br /><sub>코스모폴리탄 브리프, 딥 블루와 코랄, 각주 같은 호기심</sub>
<br /><sub><b>적합한 용도</b> · 매거진 카탈로그 · 도시 / 여행 브리프 · 라이프스타일 저널</sub>
</td>
<td align="center" width="50%" valign="middle">
<br />
<strong>brief에 이런 표현이 있을 때</strong>
<br /><sub>"세련된" · "고급스러운" · "차분한" · "에디토리얼 느낌" · "적을수록 좋음"</sub>
<br /><br />
<sub>사양 파일: <a href="./references/style-recipes/">style-recipes/</a></sub>
<br /><br />
</td>
</tr>
</table>

### 정보 아키텍처 · 5개

> 이성적이고 데이터 중심이며 절제됨 — 안내 시스템, 트레이딩 터미널, 각주가 달린 장문, 신문 1면의 무게감.

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/pentagram.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/pentagram.webp" alt="pentagram preview" /></a>
<br /><strong><code>pentagram</code></strong>
<br /><sub>하나의 큰 글자를 예술 작품처럼 사용하고, 격자를 뼈대로 삼으며 잉크색과 바탕색만 활용</sub>
<br /><sub><b>적합한 용도</b> · 로고 견본 · 타이포그래피 중심 포트폴리오 · 갤러리 공지</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/vignelli-swiss-helvetica.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/vignelli-swiss-helvetica.webp" alt="vignelli-swiss-helvetica preview" /></a>
<br /><strong><code>vignelli-swiss-helvetica</code></strong>
<br /><sub>모든 크기에서 Helvetica, 기본 색상 여섯 가지, 뉴욕 지하철 안내 도식</sub>
<br /><sub><b>적합한 용도</b> · 공공 안내 &amp; 교통 · 공공 정보 포스터 · 브랜드 시스템 견본</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-terminal.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-terminal.webp" alt="bloomberg-terminal preview" /></a>
<br /><strong><code>bloomberg-terminal</code></strong>
<br /><sub>딥 네이비 바탕의 앰버, 전체 고정폭 글꼴, 편안함보다 정보 밀도를 우선</sub>
<br /><sub><b>적합한 용도</b> · 트레이딩 대시보드 · 운영 콘솔 · 고밀도 전문 도구</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/tufte-dataink.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/tufte-dataink.webp" alt="tufte-dataink preview" /></a>
<br /><strong><code>tufte-dataink</code></strong>
<br /><sub>문단 안의 작은 그래프, 스몰 멀티플, 불필요한 차트 장식 없음</sub>
<br /><sub><b>적합한 용도</b> · 데이터 스토리텔링 · 연구 보고서 · 학술 장문</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/nyt-the-daily.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/nyt-the-daily.webp" alt="nyt-the-daily preview" /></a>
<br /><strong><code>nyt-the-daily</code></strong>
<br /><sub>Imperial 위에 얹은 Cheltenham 세리프, 맨 위 날짜 줄, 넓은 신문 지면의 무게감</sub>
<br /><sub><b>적합한 용도</b> · 뉴스 특집 · 팟캐스트 허브 · 장문 탐사 보도</sub>
</td>
<td align="center" width="50%" valign="middle">
<br />
<strong>brief에 이런 표현이 있을 때</strong>
<br /><sub>"데이터가 밀집된" · "안내 시스템" · "고밀도" · "이성적" · "권위감"</sub>
<br /><br />
<sub>사양 파일: <a href="./references/style-recipes/">style-recipes/</a></sub>
<br /><br />
</td>
</tr>
</table>

### 현대 도구 / Builder SaaS · 4개

> 헤어라인 수준의 세부, 따뜻한 다크 테마, 강조색 하나 — 2020년대 후반 개발자 도구의 미감.

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/linear.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/linear.webp" alt="linear preview" /></a>
<br /><strong><code>linear</code></strong>
<br /><sub>따뜻한 다크 테마, 가는 테두리, 보라색 포인트, 키보드 단축키 칩</sub>
<br /><sub><b>적합한 용도</b> · 개발자 도구 랜딩 페이지 · 이슈 / 프로젝트 SaaS · API &amp; 인프라 제품</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/vercel-mesh.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/vercel-mesh.webp" alt="vercel-mesh preview" /></a>
<br /><strong><code>vercel-mesh</code></strong>
<br /><sub>순수한 검정, 기하학적 격자 그라데이션, Geist Sans, 명령행 같은 명료함</sub>
<br /><sub><b>적합한 용도</b> · 배포 / 런타임 도구 · 프레임워크 출시 · 기술 중심 히어로 페이지</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/raycast.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/raycast.webp" alt="raycast preview" /></a>
<br /><strong><code>raycast</code></strong>
<br /><sub>붉은 안개 속 유리 카드, 키보드 우선, 조밀한 목록 행</sub>
<br /><sub><b>적합한 용도</b> · 커맨드 팔레트 · 런처 앱 · 키보드 중심 도구</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/notion-pre-ai.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/notion-pre-ai.webp" alt="notion-pre-ai preview" /></a>
<br /><strong><code>notion-pre-ai</code></strong>
<br /><sub>미색 페이지, 드래그 핸들, 편안한 이모지 제목, 곳곳의 안내 배너</sub>
<br /><sub><b>적합한 용도</b> · 워크스페이스 문서 · 내부 위키 · 친근한 생산성 앱</sub>
</td>
</tr>
</table>

### 모션 / 실험 · 3개

> 대담하고 생성적이며 감각적 — brief에 “시네마틱”, “WebGL”, “Awwwards 수상급”이 있을 때.

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/field-io.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/field-io.webp" alt="field-io preview" /></a>
<br /><strong><code>field-io</code></strong>
<br /><sub>에디토리얼 타이포그래피를 받치는 파티클 시스템, 코드 아트 미감, 다크 스튜디오</sub>
<br /><sub><b>적합한 용도</b> · 크리에이티브 테크 스튜디오 · 생성형 아트 사례 · WebGL 포트폴리오</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/active-theory.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/active-theory.webp" alt="active-theory preview" /></a>
<br /><strong><code>active-theory</code></strong>
<br /><sub>대담한 WebGL, 화면을 가득 채운 타이포그래피, 짙은 검정 위의 캔디 색상</sub>
<br /><sub><b>적합한 용도</b> · 시네마틱 제품 출시 · 캠페인 사이트 · 수상작을 목표로 한 마이크로 사이트</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/resn-storytelling.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/resn-storytelling.webp" alt="resn-storytelling preview" /></a>
<br /><strong><code>resn-storytelling</code></strong>
<br /><sub>초현실적이고 강렬하며 프레임 하나하나가 세트처럼 보임, 노이즈 텍스처 위에 제목 배치</sub>
<br /><sub><b>적합한 용도</b> · 스크롤 스토리텔링 · 엔터테인먼트 / IP 사이트 · 스튜디오 포트폴리오</sub>
</td>
<td align="center" width="50%" valign="middle">
<br />
<strong>brief에 이런 표현이 있을 때</strong>
<br /><sub>"시네마틱" · "WebGL" · "몰입형" · "Awwwards급"</sub>
<br /><br />
<sub>사양 파일: <a href="./references/style-recipes/">style-recipes/</a></sub>
<br /><br />
</td>
</tr>
</table>

### 거친 / 브루탈리즘 · 3개

> 반디자인, 솔직함, 다듬지 않은 질감 — 시스템 기본 글꼴 웹페이지, 타블로이드 표지, 럭셔리의 관습을 뒤집은 럭셔리.

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/are-na.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/are-na.webp" alt="are-na preview" /></a>
<br /><strong><code>are-na</code></strong>
<br /><sub>의도적으로 시스템 글꼴과 브라우저 기본 파란 링크를 사용한 솔직한 웹페이지</sub>
<br /><sub><b>적합한 용도</b> · 연구 채널 · 독립 커뮤니티 · 반디자인 콘텐츠 도구</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-businessweek-turley.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-businessweek-turley.webp" alt="bloomberg-businessweek-turley preview" /></a>
<br /><strong><code>bloomberg-businessweek-turley</code></strong>
<br /><sub>경고 노랑 + 검정 잉크, 콜라주처럼 쌓은 글꼴, 손으로 오려 붙인 듯한 제목</sub>
<br /><sub><b>적합한 용도</b> · 에디토리얼 표지 · 논평 기사 · 캠페인 포스터</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/balenciaga-post-2017.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/balenciaga-post-2017.webp" alt="balenciaga-post-2017 preview" /></a>
<br /><strong><code>balenciaga-post-2017</code></strong>
<br /><sub>전체 대문자, 깨진 격자, 흰 바탕의 차가운 제품 사진, 럭셔리의 관습을 뒤집은 럭셔리</sub>
<br /><sub><b>적합한 용도</b> · 패션 컬렉션 · 드롭 공지 · 관습을 뒤집는 럭셔리 브랜드</sub>
</td>
<td align="center" width="50%" valign="middle">
<br />
<strong>brief에 이런 표현이 있을 때</strong>
<br /><sub>"거친" · "솔직한" · "반디자인" · "타블로이드 느낌" · "불편한"</sub>
<br /><br />
<sub>사양 파일: <a href="./references/style-recipes/">style-recipes/</a></sub>
<br /><br />
</td>
</tr>
</table>

### 따뜻한 휴머니즘 · 3개

> 친근하고 유기적이며 손으로 만든 느낌 — 작은 사업의 응원단장, 수제 장정 책, 매일 새로 시작하는 경험.

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/mailchimp-freddie.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/mailchimp-freddie.webp" alt="mailchimp-freddie preview" /></a>
<br /><strong><code>mailchimp-freddie</code></strong>
<br /><sub>Cavendish 노랑, 손으로 그린 낙서, 대화체 카피 — 작은 사업의 응원단장</sub>
<br /><sub><b>적합한 용도</b> · 온보딩 흐름 · 중소기업 마케팅 도구 · 친근한 소비자 앱</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/stripe-press.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/stripe-press.webp" alt="stripe-press preview" /></a>
<br /><strong><code>stripe-press</code></strong>
<br /><sub>우윳빛 종이, GT Super, 수제 제본의 고급스러움, 사상을 오브제로 표현</sub>
<br /><sub><b>적합한 용도</b> · 도서 상세 페이지 · 장문 에세이 · 출판사 / 출판 브랜드 사이트</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/headspace-meditation.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/headspace-meditation.webp" alt="headspace-meditation preview" /></a>
<br /><strong><code>headspace-meditation</code></strong>
<br /><sub>오렌지 태양, 둥근 색 덩어리, 손그림의 평온함, 매일 새로 시작</sub>
<br /><sub><b>적합한 용도</b> · 명상 &amp; 웰니스 · 습관 / 감정 앱 · 따뜻한 소비자용 카드</sub>
</td>
<td align="center" width="50%" valign="middle">
<br />
<strong>brief에 이런 표현이 있을 때</strong>
<br /><sub>"친근함" · "다정함" · "사람 냄새" · "포근함" · "수공예 느낌"</sub>
<br /><br />
<sub>사양 파일: <a href="./references/style-recipes/">style-recipes/</a></sub>
<br /><br />
</td>
</tr>
</table>

### 특성 / 장르 · 2개

> 시대와 10년대, 하위문화를 부호화한 스타일 — anchor 이름을 직접 지정해야 선택할 수 있습니다.

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/y2k-retrofuturism.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/y2k-retrofuturism.webp" alt="y2k-retrofuturism preview" /></a>
<br /><strong><code>y2k-retrofuturism</code></strong>
<br /><sub>크롬 베벨, 불투명 유리, 용암 같은 색 덩어리, 곳곳의 MSN 파랑</sub>
<br /><sub><b>적합한 용도</b> · Y2K 향수 · 초기 웹 포털 · Z세대 브랜드의 대담한 캠페인</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/mid-century-modern.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/mid-century-modern.webp" alt="mid-century-modern preview" /></a>
<br /><strong><code>mid-century-modern</code></strong>
<br /><sub>머스터드 옐로, 벽돌색, 청록; 종이 오리기 같은 기하학; 1957년의 낙관주의</sub>
<br /><sub><b>적합한 용도</b> · 포스터 오마주 · 문화 행사 · 복고 인쇄물의 브랜드 어조</sub>
</td>
</tr>
</table>

### 갤러리 직접 실행

```bash
cd demo/web-design-engineer-demo
npm install && npm run dev    # http://localhost:5181/
```

Hash 라우팅 URL(`#/linear`, `#/aesop` 등)로 레시피에 직접 연결할 수 있습니다. `H`를 눌러 레시피 HUD를 전환하고 `Esc`로 갤러리로 돌아옵니다. 레이아웃 세부 정보는 데모 자체의 [README](../../demo/web-design-engineer-demo/README.md)를 참고하세요.

---

## Skill 활성화 / 비활성화 비교

저장소의 [`demo/web-design-demo/`](../../demo/web-design-demo) 디렉터리에는 같은 프롬프트로 Skill을 켜고 끈 상태에서 각각 생성한 페이지의 비교가 있습니다. [`demo/web-design-demo/demo2/index.html`](../../demo/web-design-demo/demo2/index.html)을 열어 비교 데모를 확인하세요.

### 데모 1: 우주 탐사 박물관

**프롬프트:** *“‘우주 탐사 박물관’ 온라인 전시 홈페이지를 만들어 줘. 전체 화면 히어로, 핵심 전시 4개 소개, 노드가 6개 이상인 타임라인, 방문 예약 CTA, 푸터가 필요해. 전체 분위기는 몰입감 있고 우주의 깊이가 느껴지게 해 줘.”*

| | Skill 없음 | Skill 있음 |
|---|---|---|
| **파일** | `demo/web-design-demo/demo2/demo1.html` | `demo/web-design-demo/demo2/demo1-with-skill.html` |
| **색상 시스템** | 하드코딩된 hex 값(#7cf0ff, #b388ff) | CSS 사용자 지정 속성을 사용하는 oklch 토큰 시스템 |
| **글꼴** | Orbitron + Noto Serif SC | Instrument Serif + Space Grotesk + JetBrains Mono |
| **레이아웃** | 일반적인 랜딩 페이지 구조 | 그리드를 조합한 잡지형 에디토리얼 레이아웃 |
| **세부 요소** | 과도한 발광 효과와 네온 그라데이션 | 절제된 팔레트, 타이포그래피 위계, 장식적 데이터 요소 |
| **전체 인상** | 의욕적인 주니어 디자이너 | 경험 많은 디자인 디렉터 |

### 데모 2: 사진작가 포트폴리오

**프롬프트:** *“독립 사진작가의 포트폴리오 웹사이트 홈페이지를 만들어 줘.”*

| | Skill 사용 |
|---|---|
| **파일** | `demo/web-design-demo/demo2/demo2-with-skill.html` |
| **캐릭터 설정** | 북유럽 사진작가 “Mira Høst”를 만들어 시각적 정체성 전체를 설계 |
| **팔레트** | 따뜻한 종이색 바탕(#f2efe8) + 짙은 잉크색 텍스트(#161513) — 극도로 절제된 투톤 |
| **글꼴** | Instrument Serif(디스플레이 제목) + Space Grotesk(UI), 이탤릭을 적극 사용 |
| **레이아웃** | 번호가 붙은 섹션, 비대칭 그리드, 측면 세로쓰기 텍스트로 구성한 매거진 레이아웃 |
| **모션** | 히어로 이미지의 느린 Ken Burns 애니메이션(주기 24초), 필름 그레인 텍스처 오버레이 |
| **내비게이션** | `mix-blend-mode: difference` 헤더 — 밝고 어두운 배경을 자연스럽게 오감 |

> 이 Skill의 영감이 된 Claude Design 원본 시스템 프롬프트는 [`dist/prompt/claude-design-system-prompt.md`](../../dist/prompt/claude-design-system-prompt.md)。

---

## 배경

이 Skill은 [Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs)의 시스템 프롬프트에서 영감을 받았습니다. Claude Design은 Anthropic이 2026년 4월 출시한 시각 디자인 제품입니다. 약 420행의 시스템 프롬프트에는 결과 품질을 일관되게 유지하는 정교한 디자인 원칙, 안티패턴, 워크플로 제약이 담겨 있습니다.

이 프로젝트는 핵심 원칙을 추려 다듬어 어떤 AI 코딩 에이전트에서나 사용할 수 있는 Skill로 만들었습니다. 제품 종속성과 사용량 제한 없이 Claude Design 수준의 디자인 감각을 활용할 수 있습니다.

Claude Design 원본 프롬프트에 추가한 주요 요소:
- **디자인 시스템 선언 단계** — 코딩 전에 디자인 토큰을 자연어로 설명하게 함
- **v0 초안 전략** — 미완성 버전을 일찍 보여 주기 위한 구체적인 방법
- **확장된 진부함 방지 목록** — 실제 AI 출력에서 확인된 추가 패턴
- **placeholder 원칙** — 누락된 소재를 전문적으로 처리하기 위한 완전한 프레임워크
- **색상 × 글꼴 조합표** — 검증된 시각 시스템 출발점 여섯 가지
- **디자인 방향 어드바이저** — 모호한 요청에 대해 6개 학파에서 차별화된 3가지 방향을 추천하고 레시피 라이브러리와 연결
- **anchor가 지정된 스타일 레시피 25개** — 실제 브랜드 / 스튜디오 / 디자이너에 대응하고 바로 복사할 수 있는 구체적인 값을 제공해 AI 기본 스타일을 방지
- **고급 패턴 라이브러리** — 일반적인 UI 패턴의 즉시 사용 가능한 코드 템플릿

---

## 라이선스

MIT
