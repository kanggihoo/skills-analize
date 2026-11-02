# garden-skills 분석: web-design-engineer / beautiful-article / kb-retriever

루트: `/Users/kkh/Desktop/skills-analize/design/garden-skills`
출처: `ConardLi/garden-skills` (GitHub). 모든 스킬에는 `README.md` / `README.ko.md` / `README.zh-CN.md`가 있고, 주요 `.md`마다 `.ko.md` 번역본이 붙어 있다. 아래 줄 수는 영어(또는 원본) 파일 기준이고, `.ko.md`는 대체로 같거나 조금 짧다.

### skills-lock.json
`version: 1`. 스킬 6개를 `source: ConardLi/garden-skills`, `skillPath: skills/<name>/SKILL.md`, `computedHash`(sha256)로 고정해 둔다. 항목은 beautiful-article, gpt-image-2, kb-retriever, motion-showreel, web-design-engineer, web-video-presentation이다. 6개 모두 로컬 디렉터리에 있다. gpt-image-2, motion-showreel, web-video-presentation은 `garden-media.md`에서 다룬다.

---

## garden-skills/web-design-engineer

### 파일 구성
```
web-design-engineer/
├── SKILL.md (492)                 메인 워크플로, 규칙, 체크리스트, references 라우팅 표
├── manifest.json (15)             v1.3.0, category "Design / Frontend", 호환 6종(claude-code, cursor, codex-cli…)
├── agents/openai.yaml (7)         Codex용 표시명과 allow_implicit_invocation: true
├── README.{md,ko,zh-CN} (472×3)   사람용 설명
└── references/
    ├── design-calibration.md (136)   Design Read + 5개 다이얼(1–10), 프리셋, 충돌 해결, image-first 분기
    ├── redesign-protocol.md (123)    Extension / Preserve / Overhaul 분류, 감사 항목, 보호 계약, 현대화 순서
    ├── failure-patterns.md (159)     AI 디자인 실패 패턴 카탈로그(default→why→detect→exception→repair 형식)
    ├── critique-guide.md (226)       5차원 채점 루브릭, 산출물 유형별 가중치, Top10 이슈, 출력 템플릿
    ├── design-directions.md (188)    "알아서 예쁘게"일 때 6개 학파 중 3개를 제안하는 Advisor 상세
    ├── browser-acceptance.md (127)   명시적으로 요청했을 때만 실행하는 브라우저 QA 하네스
    ├── block-library.md (38)         advanced-patterns의 구현 블록 인덱스와 재사용 계약
    ├── advanced-patterns.md (521)    코드 템플릿: 슬라이드 엔진, 디바이스 프레임, Tweaks 패널, useTime 타임라인, Design Canvas, 다크모드, Chart.js, oklch 팔레트, 폰트 표
    └── style-recipes/
        ├── INDEX.md (145)            25개 레시피 카탈로그, 인덱스 3종(학파/용도/라이트·다크), 공통 안티패턴
        └── <anchor>.md ×25 (45–61줄)  실존 브랜드/스튜디오별 토큰 레시피(코드 없음, 값만 있음)
```

### frontmatter
- name: `web-design-engineer`
- description: "Build or redesign polished browser-rendered visual artifacts with HTML/CSS/JavaScript/React: pages, dashboards, prototypes, slide decks, animations, UI mockups, and data visualizations. Use for visual front-end creation, design-system exploration, design critique, or explicit browser acceptance / QA of a web artifact. Not for back-end, CLI, non-visual coding, source-to-longform article conversion, or narration-driven click-through video presentations."
- 호출 플래그: SKILL.md frontmatter에는 없다. `agents/openai.yaml`의 `allow_implicit_invocation: true`가 Codex용 자동 호출을 허용하는 설정이다.

### 트리거 / 언제 쓰나
시각적인 웹 산출물 전반(랜딩, 대시보드, 프로토타입, HTML 슬라이드, 애니메이션 데모, 데이터 시각화, 디자인 시스템 탐색)과 디자인 크리틱, 그리고 사용자가 명시적으로 요청한 브라우저 QA에 쓴다. 긴 글 기사 변환(→ beautiful-article)과 내레이션 기반 영상 프레젠테이션(→ web-video-presentation)은 명시적으로 범위에서 뺀다.

### 입력 → 출력
- 입력: 자연어 브리프. 선택적으로 스크린샷, Figma, 코드베이스, 브랜드 자산, "Linear 스타일" 같은 앵커 이름.
- 출력: 단일 HTML 파일(필요하면 JSX 파일 여러 개 + Babel 인라인), `brand-spec.md`(브랜드 작업일 때), `assets/<brand>-brand/`. 버전은 `My Design v2.html`처럼 복사해서 남긴다. 변형은 파일을 나누지 않고 한 파일 안의 Tweaks 패널 토글로 둔다.

### 동작 흐름
0. **Step 0 사실 검증(최우선)**: 특정 제품, SDK, 브랜드, 출시 시점이 나오면 질문보다 먼저 웹 검색으로 확인한다. "I think X hasn't released yet"처럼 기억에 의존한 단정은 금지 문구로 지정되어 있다.
1. **요구사항 파악**: 질문할지는 정보량을 보고 정한다. 시나리오별로 질문 여부를 정리한 표가 있다. 예를 들어 "PRD로 10분 덱"이면 바로 만들고, "버터 역사 슬라이드 6장"이면 톤과 청중을 묻는다. 요청이 정말 모호하면 Design Direction Advisor로 전환한다.
2. **디자인 컨텍스트 수집** 우선순위: 사용자 제공 자원 → 기존 제품 화면 → 업계 레퍼런스 → 사용자가 지정한 앵커(`style-recipes/<anchor>.md` 1개만 읽음) → 백지(레시피 하나를 골라 사용자 확인). "Code ≫ Screenshots" 원칙이 있다.
   - 브랜드 작업은 **Asset Protocol**을 따른다. 인지도 기여 순서는 로고 > 제품 사진/UI 스크린샷 > 컬러 > 폰트. 로고를 못 구하면 멈추고 사용자에게 묻는다. 결과는 `brand-spec.md`에 기록한다. 소싱 순서는 공식 press kit → 공식 영상 프레임(`yt-dlp`+`ffmpeg`) → 앱스토어 스크린샷 → Wikimedia → AI 생성 → 정직한 placeholder.
   - 기존 UI를 수정하는 작업이면 `redesign-protocol.md`를 읽고 모드를 분류한다.
3. **Step 2b Design Read + 5 다이얼**: YAML 블록(artifact / audience / visual-language / mode / variance / motion / density / asset-dependence / brand-fidelity)을 작성한다. `design-calibration.md`를 참조한다.
4. **Step 3a 포지셔닝 4문**: 서사 역할, 시청 거리(10cm/1m/10m), 시각 온도, 용량 체크.
5. **Step 3 디자인 시스템 선언**: 팔레트, 타이포, 스페이싱, radius, 그림자, 모션을 마크다운으로 적는다. 레시피를 골랐다면 값을 그대로 붙여 넣는다. **🛑 Checkpoint 1**: 확인을 받을 때까지 실제로 기다린다.
6. **Step 4 v0**: placeholder(`[image]`, `[icon]`)와 토큰, 레이아웃만 담고 가정 목록을 붙인다. **🛑 Checkpoint 2**.
7. **Step 5 풀 빌드**: 상태와 모션을 구현한다. 사소하지 않은 결정 지점마다 **🛑 Checkpoint 3**.
8. **Step 6 검증**: 기본은 Pre-delivery Checklist(정적 자기점검)다. 사용자가 "acceptance/QA/responsive"를 **명시**했을 때만 `browser-acceptance.md`를 실행한다.
9. **Step 7 크리틱**: 요청을 받았거나 자체 점검할 때 5차원 0–10점 채점 → Keep / Fix(심각도순) / Quick Wins 3개.
- 서브에이전트와 스크립트는 없다. references는 "on demand"로 로드하고, 레시피는 한 파일만 읽도록 반복해서 강조한다.

### 하위 모드 / 레퍼런스 목록
| 모드/파일 | 언제 | 핵심 |
|---|---|---|
| Design Direction Advisor (`design-directions.md`) | "알아서 예쁘게", 레퍼런스 없음 | 6학파(Info Architecture / Editorial-Minimal / Modern Tool SaaS / Motion-Experimental / Brutalist / Warm Humanist) 중 **서로 다른 행에서 3개**를 고르고, 각각 디자이너 이름 + fit 이유 2–3줄 + 시그니처 단서 3–4개로 제안 |
| Redesign Protocol | 기존 UI 수정 | Extension(fidelity 10) / Preserve(variance·motion 최대 +1) / Overhaul. 보호 계약: 라우트, 폼 필드명, 애널리틱스 이벤트, 법적 문구, 로고. 현대화 순서 8단계(a11y → 위계 → 간격 → 토큰 → 상태 → 모션 → 히어로 → 블록 교체) |
| Calibration | 매 작업 | 다이얼 5개 밴드표 + 프리셋(예: Data dashboard 4/3/8/3/7) + 충돌 규칙 |
| Failure patterns | 마케팅 페이지, 리디자인, 대시보드, 모션 | 섹션별 패턴 약 20개 |
| Critique | 리뷰 요청 | 루브릭과 가중치 |
| Browser acceptance | 명시적 QA 요청 | 뷰포트 390×844 / 768×1024 / 1280×720 / 1440×900, Runtime / Layout / Interaction / Motion 패스, 수리 루프, 리포트 템플릿 |
| Block library + advanced-patterns | 구현 시 | 슬라이드 엔진, 디바이스 프레임, Tweaks, 타임라인, 캔버스, 다크모드, 차트 |
| style-recipes (25) | 앵커 지정 시 | 아래 표 |

**style-recipes 전수 목록** (전문을 읽은 파일: linear, aesop, bloomberg-terminal)
| 학파 | 레시피(한 줄 vibe) |
|---|---|
| Editorial/Minimal | apple-hig(여백 넉넉, 흰 배경 위 히어로 제품, 화면당 생각 하나) · muji-kenya-hara(비움이 곧 충만, off-white) · aesop(샤무아 #E8E4D9 + 세이지, 세리프 산문, radius 0, bold 금지) · dieter-rams-braun("Less but better") · monocle-magazine(kicker/headline/dek 위계) |
| Info Architecture | pentagram(타이포가 곧 이미지) · vignelli-swiss-helvetica(엄격한 그리드, Helvetica) · bloomberg-terminal(#0A0E1A + 앰버 #FFA02F, 전부 모노, 11–14px, radius 0–2, 데이터 업데이트 시 50–80ms 깜빡임) · tufte-dataink(차트가 곧 페이지) · nyt-the-daily(브로드시트 세리프) |
| Modern Tool SaaS | linear(#08090A 웜 다크, hairline rgba(255,255,255,.06), 퍼플 #5E6AD2를 픽셀의 5% 미만, radius ≤16, cubic-bezier(.22,1,.36,1)) · vercel-mesh(흑백 + 그라디언트 메시 하나) · raycast(글래시 커맨드 팔레트) · notion-pre-ai(세리프 + 이모지를 1급 요소로) |
| Motion/Experimental | field-io(생성형 모션) · active-theory(WebGL 시네마틱) · resn-storytelling(스크롤 보상) |
| Brutalist | are-na(시스템 폰트를 의도적으로) · bloomberg-businessweek-turley(타이포 폭력) · balenciaga-post-2017(브라우저 기본 스타일을 무기로) |
| Warm Humanist | mailchimp-freddie(손그림, 웜 옐로) · stripe-press(책을 오브젝트로, 크림 + 잉크) · headspace-meditation(파스텔, 전부 둥글게) |
| Specialty | y2k-retrofuturism(크롬, 젤리) · mid-century-modern(50–60년대 그래픽) |

각 레시피의 구조는 같다: School / Vibe / Best for / Touchstone / Palette(역할별 hex) / Typography(실제 폰트 + weight) / Spacing 사다리 / Radius / Shadow / Motion(말로 기술) / Signature moves 3–6 / Avoid / AI prompt seed / Don't use when.

### 핵심 규칙 / 지식
- **안티 클리셰의 근거를 설명한다**: "AI defaults = average of training data = all brands averaged together = no brand recognized". 그래서 모든 금지 규칙의 유일한 예외는 "브랜드 스펙이 그걸 쓴다"이다.
- 금지 표: 보라→핑크→파랑 그라디언트, 둥근 카드 + 컬러 left-border, 아이콘 대신 이모지, SVG로 그린 사람/장면, 제품 사진 대신 CSS 실루엣, Inter/Roboto/Arial/Fraunces/system-ui를 display로 쓰기, `#0D1117` 위 사이버 네온, 가짜 통계/로고월/추천사.
- failure-patterns 중 쓸 만한 것: 모든 섹션 위에 붙는 작은 대문자 eyebrow, 좌우 지그재그 3회 이상, 기본 센터 히어로 + CTA 2개, "Cardification", 빈 bento 셀, 의미 규칙 없는 radius 혼용(shape drift), 장식용 마이크로 라벨(가짜 좌표, 버전 번호, 상태 점), 스크롤마다 React state 갱신, 한 화면에 스펙터클 여러 개(시그니처 모먼트는 하나만).
- 수치: 제목/본문 크기 비 ≥ 2.5×(히어로 4–6×), 색 ≤ 4, 폰트 패밀리 ≤ 2, 8pt 그리드 {8,16,24,32,48,64,96}, 여백 ≥ 40%(미니멀이면 60%). 최소 크기: 1920×1080 슬라이드 24px, 터치 44px, 인쇄 12pt, 웹 본문 16–18px.
- 크리틱 안티패턴: Fix 항목은 7개를 넘기지 않는다. 막연한 평 대신 수치로 말한다(예: "oklch(0.65 0.25 25) → chroma 0.18").
- React 인라인 Babel 하드룰: `const styles = {}` 금지(전역 충돌), Babel 스크립트끼리는 스코프를 공유하지 않으므로 `Object.assign(window,{...})`, `scrollIntoView` 금지(iframe 스크롤이 깨짐).
- 슬라이드: 1920×1080 고정 캔버스 + `transform: scale()`, 내비 버튼은 스케일 컨테이너 바깥, ←→/Space, 현재 위치를 `localStorage`에 저장, `data-screen-label="01 Title"`(1-indexed).
- 애니메이션 사다리: CSS → React state + rAF → 자체 `useTime/Easing/interpolate` → Popmotion. Framer Motion/GSAP/Lottie는 요청이 있을 때만.
- 색: 브랜드 색에서 `oklch()`로 파생하고 새 hue는 만들지 않는다. CDN은 Chart.js, D3, Google Fonts만 허용한다. Tailwind CDN과 Lucide는 "declare tokens first"와 충돌한다는 이유로 기본 금지.
- 프로토타입: 타이틀 화면 금지, 변형 3개 이상을 Tweaks로 노출, 상태 8종(default, hover, active, focus, disabled, loading, empty, error).
- Tweaks 패널: 우하단 고정, 제목 "Tweaks", 닫으면 완전히 숨김. 요청이 없어도 창의적인 tweak 1–2개를 기본으로 추가한다.
- 다이얼 완료 테스트: "If changing a score would not change the plan, remove the score."

### 의존성
- 스크립트 없음. 외부 도구는 WebSearch(Step 0), 브랜드 소싱용 `yt-dlp`/`ffmpeg`(선택), 브라우저 제어 도구(acceptance일 때만).
- CDN: React/ReactDOM/Babel(고정 버전이라고 적혀 있음), Chart.js, D3 v7, Popmotion 11.0.5, Google Fonts.
- 다른 스킬: `gpt-image-2`(image-first 분기에서 "when available"), beautiful-article / web-video-presentation(범위 밖이면 그쪽으로 라우팅).

### 장점 (가져올 만한 것)
1. **Design Read + 5 다이얼**과 "점수가 계획을 바꾸지 않으면 지운다"는 완료 테스트. 막연한 취향 판단을 결정 변수로 바꿔 준다.
2. **style-recipes 형식**: 실존 앵커에 hex, 폰트, 스페이싱, Signature moves, Avoid, Don't-use-when을 한 파일 약 50줄에 담고 한 번에 하나만 로드한다. 프로그레시브 디스클로저가 잘 설계되어 있다.
3. 안티 슬롭을 "default → why → detect → exception → repair" 형식으로 정리하고 "brand spec이면 예외"라는 근거를 붙였다. 다른 스킬의 금지 목록보다 덜 교조적이다.
4. **Asset Protocol**: 로고와 제품 이미지가 hex보다 먼저라는 원칙, `brand-spec.md` 기록, "로고 없으면 멈춤".
5. Redesign 모드 분류 + Protected Contracts 목록 + 현대화 8단계 순서. 기존 제품을 고칠 때 바로 쓸 수 있다.
6. Direction Advisor의 "서로 다른 학파에서 3개"라는 규칙과 학파→레시피 핸드오프.
7. 브라우저 QA를 **명시 요청이 있을 때만** 돌리는 트리거 게이트, 그리고 "Never claim browser acceptance from code inspection alone".
8. 크리틱 출력 템플릿(점수, Keep, 심각도순 Fix, Quick Wins 3개, 최대 7개).

### 단점 / 한계 (버릴 만한 것)
- Checkpoint가 3개나 강제 정지로 들어가 있어(시스템 선언 → v0 → 빌드 중 결정) 간단한 요청에도 마찰이 크다.
- **불일치**: SKILL.md는 "pinned-version CDN scripts with integrity hashes — see references/advanced-patterns.md"라고 하는데, advanced-patterns.md에는 React/Babel `<script>` 태그가 **아예 없다**. 참조가 깨져 있다.
- advanced-patterns의 "Color × Font Pairing" 표가 `oklch(0.55 0.25 250)` 블루바이올렛 + "Space Grotesk + Inter"를 추천한다. 본문에서 슬롭으로 규정한 테크 블루와 Inter에 가깝다. 폰트 추천(Plus Jakarta Sans, Outfit, Space Grotesk, Sora)도 이제는 AI 기본값에 가까워진 목록이다.
- 템플릿 코드에 `font-family: system-ui`가 그대로 남아 있다(슬라이드 엔진).
- 인라인 Babel + CDN React 전제는 claude.ai 아티팩트나 일회성 HTML에는 맞지만 실제 프로젝트 스택(Vite, Next)과는 맞지 않는다.
- "Visual quality at Dribbble / Behance showcase level", "Aim to stun" 같은 검증 불가능한 문구.
- 레시피의 hex와 폰트는 기억 기반이다(Touchstone은 "search and verify"라고 하면서 값 자체는 검증 장치가 없다).
- 접근성은 대비와 reduced-motion 정도만 다룬다. 정량 기준(WCAG 대비율 등)이 없다.

---

## garden-skills/beautiful-article

### 파일 구성
```
beautiful-article/
├── SKILL.md (466, 본문은 중국어) / SKILL.ko.md (448)   8단계 하네스, 질검 프로토콜, 체크포인트 3개
├── manifest.json (15)        v0.1.0, "Editorial · Any source → beautiful article"
├── README.{md,ko,zh-CN} (450×3)
├── references/  (원본은 중국어, .ko.md 번역 동반)
│   ├── harness.md (35)               하네스 6문(컨텍스트, 도구, 오케스트레이션, 상태, 평가, 복구), 상태 파일이 곧 장기 기억
│   ├── source-to-markdown.md (118)   입력 유형별 처리, MarkItDown 주 경로와 fallback, 소스 자가점검 5항
│   ├── article-types.md (42)         기사 유형 10종 라우팅 표(정보 보존 비율 포함)
│   ├── article-types/<type>.md ×10 (30–66)  유형별 구조, 컴포넌트, Raw 경계, 이미지 성향, 자가점검
│   ├── information-density.md (50)   보존 비율 → 본문/Raw/이미지 비율 표
│   ├── plan-template.md (109)        plan.md 한 파일(Brief / Outline / Theme / Assets) 템플릿
│   ├── theme-selection.md (48)       테마 선택 절차, 밀도와 테마 분리, 테마 추가 조건
│   ├── layout.md (46)                width(narrow 34rem / regular 46 / wide 58 / full 78) + TOC
│   ├── asset-policy.md (71)          이미지 모드 4종, Raw와 직교, AI 이미지 프롬프트 형식
│   ├── cover.md (208)                3:4 북커버 하드 제약 5개, 구도 템플릿 A–E, 자가점검 5항
│   ├── component-policy.md (103)     reacticle 프로토콜: prose-first, 시맨틱 컴포넌트, 맨 div/className 금지
│   ├── raw-policy.md (86)            Raw(자유 HTML/JS/React 층) 허용/금지, token 강제
│   ├── section-build.md (100)        섹션당 파일 하나, 단일/병렬 에이전트 모드, 번호 매기기 규칙
│   ├── review-checklist.md (133)     단계별 리뷰 방식, 체크리스트, 서브에이전트 프롬프트 템플릿
│   ├── repair-policy.md (35)         최소 단위 수리 표, repair-log 형식
│   ├── scaffold.md (77) / html-output.md (42) / pdf-output.md (208)
├── theme-profiles/
│   ├── index.json (112)              테마 11종 메타(mood, bestFor, notFor, runtimeTheme)
│   └── <id>.md ×11 (56–64)           AI가 읽는 테마 authoring profile(CSS 아님)
├── scripts/
│   ├── scaffold.sh (172)             Vite+React+TS 워크스페이스 생성, reacticle@latest 설치, 테마/커버 주입
│   ├── html-to-pdf.sh (160)          Chromium 계열 탐지 → print CSS 주입 → headless --print-to-pdf
│   ├── pdf-print-overrides.css (192) @media print: TOC를 위아래로 접기, 페이지 분할, 커버 단독 첫 페이지
│   ├── source-to-markdown-markitdown.py (100)  MarkItDown 래퍼(Python 3.10+)
│   └── source-to-markdown.py (174)   경량 fallback(pdfplumber/pdfminer, python-docx, bs4, urllib), 라이브러리가 없으면 안내 후 우회
└── assets/scaffold-template/         package.json(vite-plugin-singlefile), main.tsx, Article.tsx(assembler + colophon), Cover.tsx(3:4 외곽), sections/01-opening.tsx
```

### frontmatter
- name: `beautiful-article`
- description(중국어 원문 요약 번역): "사용자 소재(URL/PDF/DOCX/Markdown/텍스트/스크린샷)를 오프라인으로 열 수 있는 **단일 파일 HTML 웹 기사**로 편집·디자인한다. reacticle 컴포넌트 프로토콜 기반: 맨 HTML/CSS를 손으로 쓰지 않고 시맨틱 컴포넌트 + 테마 제약 Raw 자유층을 쓴다. source→계획→이중 확인→생성→최종 검수→수리 하네스. 기본은 정보 100% 보존 장문. … 기사만 만들고 관리 화면, 폼, 대시보드, 제품 프로토타입, 범용 Web App은 만들지 않는다."
- 호출 플래그: 없음(agents yaml도 없음).

### 트리거 / 언제 쓰나
"이 URL/PDF/글을 웹 기사로 만들어 줘", "공유 가능한 HTML 장문", briefing, explainer, 튜토리얼, 리뷰 회고 같은 요청. 소재가 없으면 먼저 소재를 달라고 되묻는다(내용을 지어내지 않는다). 앱이나 대시보드를 원하면 멈추고 확인한다.

### 입력 → 출력
- 입력: 소재 파일이나 URL(필수), 선택적으로 목표 언어.
- 출력: `article/article.html`(CSS와 JS를 인라인한 자기완결 단일 파일), 선택 시 `article/article.pdf`, 짧은 편집 노트. 부산물로 워크스페이스(`source/ plan/ review/ article/`)가 남는다.

### 동작 흐름
0. **Intake**: 기사인지 앱인지, 목표 언어를 판단한다(지정이 없으면 원문 언어를 따른다).
1. **Source → Markdown**: `source/source.md` + `extraction-notes.md`를 만든다. PDF/DOCX/HTML은 MarkItDown, MD/TXT는 fallback 스크립트. 메인 에이전트가 5항목 체크리스트를 인라인으로 점검한다(완전성, 구조, 표·코드·수식, 노이즈, 불확실 항목). 저신뢰 소스일 때만 Source Reviewer 서브에이전트가 `original.*`와 diff한다. 번역이 필요하면 "번역투 없는" `source.<lang>.md`를 만든다.
2. **Planning**: `plan/plan.md` 하나(Brief / Outline / Theme / Assets)를 쓴다. 메인 에이전트가 5항목을 인라인으로 자가점검한다. **이 단계에서는 서브에이전트와 리뷰 파일을 명시적으로 금지한다.**
3. **Checkpoint 1(강제 정지)**: 5개를 **각각 독립 질문**으로 묻는다. 기사 유형(보존 비율 포함), 테마, 폭, 이미지 모드, 커버. `AskQuestion` 도구가 있으면 그걸 쓰고, 없으면 번호를 매겨 나열한 뒤 기다린다. "전부 OK?" 같은 묶음 질문은 금지. 추천은 해도 대신 정해서는 안 된다.
4. **First Spread**: `scaffold.sh`로 워크스페이스를 만들고 커버, Hero/Lead, 섹션 01(독립 파일), 대표 시각 블록 하나를 만든다. First Spread Reviewer 서브에이전트가 `review/first-spread-review.md`를 쓴다(커버 5항 포함). fail 항목을 고친 뒤 **Checkpoint 2**: 승인 여부와 개발 모드 A(단일 순차) / B(병렬)를 각각 묻는다.
5. **Full Build**: 섹션마다 `sections/NN-*.tsx`를 하나씩 만든다. 섹션이 끝날 때마다 Section Reviewer 서브에이전트가 **파일 없이 메시지로** pass/fail을 돌려주고, 메인이 즉시 고친다. B 모드에서는 서브에이전트가 파일 하나씩 맡고, 메인이 `Article.tsx` 조립, 번호 보정, typecheck/build를 책임진다.
6. **Final Review**: Editorial / Visual / Technical 세 관점의 서브에이전트(병렬 가능) → `review/final-review.md`.
7. **Repair**: 최소 단위로 고치고, 고친 게 있을 때만 `repair-log.md`를 쓴다.
8. **Checkpoint 3 → Delivery**: HTML만 / HTML+PDF / 추가 수정 / 보류 중에서 고르게 한다. `npm run html`, 선택 시 `html-to-pdf.sh`.
- 레퍼런스는 단계별 표에 따라 점진적으로 로드한다. Phase 5에서는 섹션마다 component-policy, raw-policy, 테마 md를 **다시 읽으라고** 지시한다(긴 세션에서 원칙을 잊는 문제에 대한 대책).

### 하위 모드 / 레퍼런스 목록
**기사 유형 10종** (전문을 읽은 파일: interactive-explainer, 나머지는 라우팅 표 기준)
| 유형 | 표준 보존율 | 구조 |
|---|---|---|
| longform | 100% | Hero / Lead / Summary / 여러 Section / Conclusion |
| full-report | 80% | 요약 / 배경 / 증거 / 데이터 / 리스크 / 결론 |
| tutorial | 80–100% | 목표 / 단계 / 예시 / 연습 |
| explainer | 80% | 문제 / 메커니즘 / 도해 / 오해 |
| dialogue | 80% | 게스트 / 주제별 섹션 |
| review | 60–80% | 배경 / 발견 / 영향 / 행동 |
| essay | 60–80% | 도입 / 논점 / 전환 / 마무리 |
| briefing | 40–60% | 결론 먼저 / 증거 / 다음 단계 |
| interactive-explainer | ~25%(원문 발췌 비율) | 지식 포인트별 정의 → 인터랙티브 데모 → 직접 해보기. distill.pub / ciechanow.ski 계열. 모든 Raw에 리셋을 두고 상태를 화면에 드러냄 |
| visual-essay | 20–60% | 짧은 글, 큰 비주얼 |

**테마 11종** (theme-profiles. 전문을 읽은 파일: tufte, sottsass)
| id | mood |
|---|---|
| tufte | data-ink, 카드·채움·그림자·radius 금지, 이탤릭 금지, old-style 세리프 16px/1.6 |
| press | 출판, 서사, 따뜻함 |
| shannon | 다크 엔지니어링 증거 |
| vignelli | 스위스 국제주의 문서 |
| knuth | 학술 프리프린트(arXiv) |
| freddie | 웜 화이트 + 옐로, 장난기 |
| andy | 크림 + 오렌지, 큰 radius, 힐링 |
| bodoni | Didone 고대비 흑백 |
| bayer | 바우하우스 삼원색 기하 |
| fuller | 블루프린트 제도 |
| sottsass | 멤피스 80s 컬러 충돌, 블러 없는 하드 섀도, 회전 알약 |

테마 md의 고정 섹션: 적합/부적합 유형, 타이포 기질, Raw 스타일, 미디어 스타일, 코드/수식 스타일, 금지 항목, 밀도별 제안.

### 핵심 규칙 / 지식
- **3층 분리**: "文章类型 = 结构决策 / 信息密度 = 内容保留决策 / 主题 = 审美气质决策"(기사 유형 = 구조 결정, 정보 밀도 = 내용 보존 결정, 테마 = 미적 기질 결정). 레이아웃 폭과 TOC도 테마와 분리한다. 유형과 밀도는 실제로는 묶어서 "longform + 20%" 같은 가짜 조합을 막는다.
- **reacticle 프로토콜**: 맨 `div`, `className`, 인라인 style, CSS를 쓰지 않는다. 시맨틱 컴포넌트(Hero, Lead, Section, Aside, Quote, Table, CodeBlock, Formula, RiskList, Decision…)는 "내용이 정말 그 구조일 때만" 쓴다(prose-first). props에 값이 없으면 지어내지 않는다. 컴포넌트가 `⚠ 未指定xxx`(⚠ xxx 미지정) 표식을 렌더해 빈칸을 드러낸다.
- **Raw 철학**: 반대로 Raw는 많이 쓰라고 권한다. 단 "이 기사를 위해 손으로 쓴 일회성"이어야 하고 위젯 재사용은 금지한다. 색, 폰트, 간격은 반드시 `var(--ra-*)` 토큰에서 가져온다. 판단 질문은 하나다: "删掉后理解会变差吗？"(지우면 이해가 나빠지는가?) SVG를 반사적으로 기본으로 쓰지 않는다.
- **품질검사 배치 원칙**("误开 SubAgent / 误写文件是首要性能问题", 즉 서브에이전트를 잘못 띄우거나 파일을 잘못 쓰는 것이 1순위 성능 문제): Plan은 인라인 점검만 하고 파일을 쓰지 않는다. First Spread와 Final은 서브에이전트 + 파일. Section은 서브에이전트 + 메시지. 질검 결론을 받으면 고친 뒤에 보고한다.
- **결정 수집 철칙**: 결정 항목마다 질문 하나. 묶음 yes/no와 "이미 X로 정했으니 아니면 말해"를 금지한다.
- **커버**: 3:4, `max-width: min(100%, 48rem, calc((100vh - 8rem) * 3 / 4))`. 글자만 있는 커버 금지, hex/폰트/px 하드코딩 금지, 원격 이미지 금지(오프라인 우선), Hero 내용 중복 금지. Canvas는 PDF에서 첫 프레임만 찍히므로 첫 프레임이 완성 상태여야 한다.
- **번호**: `index`는 손으로 쓰는 문자열이라 메인(assembler)이 전역 번호를 갖는다. 서브에이전트에게는 "너는 NN장"이라고 지정해 준다(8장 아래에 5.1이 생기는 문제 방지).
- **Colophon 강제**: "Made with beautiful-article · <theme> theme" 푸터는 삭제와 이동이 금지되어 있다.
- **자가점검 경계값**: interactive-explainer의 원문 비율이 40%를 넘으면 "explainer를 줄인 것"이고, 10% 미만이면 핵심이 빠진 것이다.
- 리뷰어 프롬프트 템플릿 공통 문구: "不要替我改文件，不要泛泛夸奖"(파일을 대신 고치지 말고, 막연하게 칭찬하지 말 것).

### 의존성
- npm(필수), Vite 5, React 18, TypeScript, `vite-plugin-singlefile`, **`reacticle@latest`**(npm의 저자 자체 컴포넌트 라이브러리, katex와 prismjs 동반).
- Python: MarkItDown(3.10+, 선택), pdfplumber/pdfminer/python-docx/bs4(fallback), `uv`(선택).
- Chromium 계열 브라우저(PDF용, headless).
- 서브에이전트 기능(없으면 메인이 대신하고 파일에 그 사실을 명시), `AskQuestion` 도구(선택).

### 장점 (가져올 만한 것)
1. **구조 / 밀도 / 미학 / 레이아웃을 직교하는 결정으로 분리**하고, 실제로 묶여 있는 축(유형과 밀도)은 묶어서 질문한다.
2. **"Theme profile은 AI가 읽고 CSS는 브라우저가 읽는다"**: 테마를 토큰 파일과 AI용 서술(기질, Raw 스타일, 금지 항목, 미디어, 코드 스타일)로 나눈다. 내 스킬의 레시피/테마 포맷으로 직접 차용할 만하다.
3. **Raw 자유층 + 토큰 강제**: 자유도는 주되 색, 폰트, 간격은 토큰으로 묶는다. "지우면 나빠지는가" 테스트.
4. 서브에이전트 사용 위치에 대한 비용 분석(Plan은 인라인, First Spread와 Final은 독립 리뷰, Section은 메시지 반환). 리뷰 → 수리 → 보고 순서.
5. 결정 수집 철칙(독립 질문, 추천은 하되 대신 정하지 않음).
6. 상태 파일이 장기 기억(`plan.md` 한 개)이고, 섹션 파일 단위로 격리해 병렬화하며, assembler가 번호를 책임진다.
7. 최소 단위 수리 표(문제 유형 → 최소 수리 단위).
8. 커버 설계 지침(3:4 근거, 반응형 max-width 식, PDF 고려, Canvas 첫 프레임 원칙).

### 단점 / 한계 (버릴 만한 것)
- 너무 무겁다. 체크포인트 3개 + 서브에이전트 다수 + Vite/npm 스캐폴드 + 외부 패키지 `reacticle@latest`(버전 고정 없음, 공급망과 재현성 위험). 일반 웹 디자인 스킬에 그대로 넣기는 어렵다.
- reacticle 전용 프로토콜이라 라이브러리가 없으면 대부분의 규칙이 무의미하다.
- Colophon 강제는 저자 자기 홍보다(버릴 것).
- **문서 간 불일치**: `theme-selection.md`와 `html-output.md`는 런타임 테마가 "tufte / press"뿐이라고 하는데 `index.json`에는 11종이 있다. 커버 템플릿 문자도 `cover.md`(A=위 글자 아래 그림, C=상하 분할, D=가득 찬 콜라주)와 `plan-template.md`(A=왼쪽 글자 오른쪽 그림, C=위 글자 아래 그림, D=기하 콜라주)가 서로 다르다.
- SKILL과 references 원문이 중국어라 영어/한국어 환경에서는 번역본(.ko.md)과의 동기화 문제가 있다.
- 디자인 품질 자체(타이포 위계, 색 규칙)는 대부분 reacticle 테마 CSS에 위임되어 있어 스킬 안에서 배울 디자인 지식은 적다. 핵심은 편집 워크플로다.

---

## garden-skills/kb-retriever

### 파일 구성
```
kb-retriever/
├── SKILL.md (249, 중국어) / SKILL.ko.md (247)   로컬 지식베이스 계층 탐색 + 점진적 검색 절차
├── manifest.json (15)          v1.0.1, category "Retrieval / Local Knowledge Base"
├── README.{md,ko,zh-CN} (197×3)
├── references/
│   ├── pdf_reading.md (362)    빠른 결정표, pdftotext / pdfplumber / pypdf / pypdfium2 / OCR / qpdf 사용법
│   ├── excel_reading.md (72)   pandas read_excel(nrows, usecols, sheet_name=None)
│   └── excel_analysis.md (129) groupby, 필터, 피벗, merge, 정제 치트시트
└── scripts/convert_pdf_to_images.py (35)   pdf2image로 페이지를 PNG로(max 1000px). SKILL.md에서는 참조하지 않고 README에만 "스캔 PDF fallback"으로 언급
```

### frontmatter
- name: `kb-retriever`
- description(중국어 원문 요약 번역): "로컬 지식베이스 디렉터리용 검색·질의응답 도우미. (1) 계층 인덱스 탐색 (2) PDF/Excel을 만나면 먼저 references를 읽어 처리법을 학습 (3) 파일을 처리한 뒤 검색. 파일 유형별로 grep, Read, pdfplumber, pandas를 조합해 점진적으로 검색하고 파일 전체 로드를 피한다. '지식베이스 디렉터리에서 답하기/자료 찾기'일 때 사용."
- 호출 플래그: 없음.

### 트리거 / 언제 쓰나
"내 지식베이스(`knowledge/` 등)에서 찾아서 답해 줘"라는 요청에 쓴다. **디자인과는 관련이 없다.** RAG 없이 파일시스템만으로 검색하는 스킬이다.

### 입력 → 출력
질문 + (선택) KB 루트 경로 → 결론을 먼저 쓴 답변 + 출처(파일명, 대략의 행/페이지/시트). 정보가 부족하면 그렇다고 밝힌다.

### 동작 흐름
1. 질문에서 키워드 3–8개(동의어, 약어 포함), 기간 조건, 출력 유형을 뽑는다. 루트는 사용자 지정 경로가 있으면 그것을, 없으면 `knowledge/`를 쓴다. 존재 여부는 **`test -d`로만** 확인한다(Glob으로 디렉터리 존재를 판정하는 것은 금지). 없으면 추측하지 않고 묻는다.
2. 각 계층의 `data_structure.md`(디렉터리 용도 설명 인덱스)를 limit 300 정도로 읽고, 관련 있는 하위 디렉터리로만 재귀적으로 내려간다. README류는 우선순위를 뒤로 둔다.
3. PDF나 Excel을 만나면 **먼저 references를 읽는다**(체크리스트 강제, 생략 금지).
4. 처리: PDF는 `pdftotext in.pdf out.txt`(stdout 출력 금지, 토큰 낭비 방지) 후 grep, 표는 pdfplumber. Excel은 `nrows` 10–50행으로 구조를 파악한 뒤 pandas로 필터한다. MD/TXT는 grep 후 매치 주변만 Read한다.
5. 반복 검색은 **최대 5회**. 충분하거나 5회에 도달하면 멈춘다.
6. 답변: 결론 먼저, 근거, 출처 목록. 불확실하면 그 사실과 범위를 좁히는 방법을 안내한다. **웹 검색은 금지.**

### 하위 모드 / 레퍼런스 목록
| 파일 | 내용 |
|---|---|
| pdf_reading.md | 결정표(텍스트 → pdftotext, 레이아웃 → -layout, 표 → pdfplumber, 메타 → pypdf, 스캔 → OCR), 배치 처리, 암호화 |
| excel_reading.md | 시트와 열 선택, 대용량 처리 |
| excel_analysis.md | 분석 치트시트 |

### 핵심 규칙 / 지식
- 계층형 `data_structure.md` 인덱스 규약, "먼저 학습한 뒤 처리", 반복 5회 상한, 파일 전체 읽기 금지(Read limit 200–500), 웹 검색 금지, 출처 표기.

### 의존성
poppler-utils(pdftotext), pdfplumber, pypdf, pypdfium2, pytesseract/pdf2image(OCR), qpdf, pandas. 서브에이전트 없음.

### 장점 (가져올 만한 것)
- 디자인 스킬과는 무관하다. 굳이 고르자면 "큰 레퍼런스는 인덱스 파일로 계층 탐색한다"는 패턴과 "도구를 쓰기 전에 해당 reference를 반드시 먼저 읽는다"는 강제 체크리스트가 스킬 설계 기법으로 참고할 만하다.

### 단점 / 한계
- 디자인과 관련 없음. 디자인 스킬 비교 대상에서 제외하는 게 맞다.
- 사용자가 `data_structure.md` 인덱스를 미리 만들어 둬야 한다.
- `convert_pdf_to_images.py`가 SKILL.md 워크플로에 연결되어 있지 않다.

---

## 스킬 간 관계

| 스킬 | 디자인 관련성 | 산출물 | 무게(절차, 의존성) | 다른 스킬과의 연결 |
|---|---|---|---|---|
| web-design-engineer | 핵심(범용 웹 비주얼 디자인) | 단일 HTML / JSX 프로토타입, 슬라이드, 대시보드 | 중간: 체크포인트 3개, 스크립트 없음, CDN | 기사 → beautiful-article, 영상 → web-video-presentation으로 넘김. 이미지는 gpt-image-2 |
| beautiful-article | 부분(편집 디자인 + 기사 워크플로) | 단일 HTML 기사(+PDF) | 무거움: 8 Phase, 서브에이전트, Vite + reacticle | web-design-engineer와 범위를 상호 배제("source-to-longform article"을 이쪽이 담당) |
| kb-retriever | **디자인과 무관**(로컬 KB 검색/QA) | 출처가 붙은 텍스트 답변 | 가벼움: grep, pandas, pdftotext | 없음 |

**차용 후보 요약**
- web-design-engineer: Design Read + 5 다이얼, style-recipe 포맷(앵커, 토큰, Signature, Avoid, Don't-use-when, 한 번에 하나만 로드), failure-pattern 포맷, Asset Protocol, Redesign 모드와 보호 계약, Direction Advisor의 서로 다른 학파 3개 규칙, 크리틱 템플릿, 명시 요청 시에만 도는 QA 게이트.
- beautiful-article: 직교 결정 분리(구조, 밀도, 미학, 레이아웃), AI용 theme profile 포맷, 자유층 + 토큰 강제, 결정 수집 철칙, 서브에이전트 배치 원칙, 최소 단위 수리 표.
- kb-retriever: 디자인 스킬에는 차용하지 않는다(설계 기법 참고만).
