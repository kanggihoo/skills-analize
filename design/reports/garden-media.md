# garden-skills 미디어 계열 3종 분석 (gpt-image-2 / motion-showreel / web-video-presentation)

분석 대상 루트: `/Users/kkh/Desktop/skills-analize/design/garden-skills`
공통 사항: 세 스킬 모두 원문은 **중국어**(`*.md`), 한국어 번역본(`*.ko.md`)과 README 3개 언어판(en/zh-CN/ko)이 함께 있다. 파일 수가 많아 보이는 이유의 절반은 번역 사본 때문이다. `manifest.json`의 compat 목록에는 claude-code, claude-ai, cursor, codex-cli, gemini-cli, opencode가 들어 있다. 세 스킬 모두 frontmatter에는 `name`과 `description`만 있고 `allowed-tools`, `disable-model-invocation` 같은 호출 플래그는 없다.

---

## garden-skills/gpt-image-2

### 파일 구성 (원문 기준, ko 사본은 줄 수가 거의 같아 생략)

```
gpt-image-2/
├── SKILL.md (499)               모드 판별, 환경 변수, 저장·명명 규칙, 템플릿 인덱스, 워크플로
├── manifest.json (15) / README.{md,zh-CN,ko} (257 each)
├── scripts/
│   ├── check-mode.js (64)       ENABLE_GARDEN_IMAGEGEN + OPENAI_API_KEY 보고 A / A? / B-or-C 판정 (--json 지원)
│   ├── generate.js (191)        POST {base}/images/generations (JSON body)
│   ├── edit.js (225)            POST {base}/images/edits (multipart, --image, --mask)
│   ├── shared.js (213)          .env / .gateway.env / ~/.gateway.env 로딩, slug+timestamp 경로, b64_json·url 응답 파싱
│   └── package.json (5)         의존성 없음 (Node 내장 fetch/FormData)
└── references/
    ├── prompt-writing.md (1005) 템플릿 방법론 총정리 (JSON 골격, 파라미터 3분류, 질문 전략, 사례→템플릿 추출 절차, 개발 로드맵)
    └── <17개 카테고리>/<템플릿>.md   총 93개, 각 100–322줄
```

템플릿 패밀리 (카테고리 → 파일, 개수):

| 카테고리 | 개수 | 파일 |
|---|---|---|
| ui-mockups | 6 | live-commerce-ui, social-interface-mockup, product-card-overlay, chat-interface-scene, short-video-cover-ui, landing-page-case-study |
| product-visuals | 6 | exploded-view-poster, white-background-product, premium-studio-product, packaging-showcase, lifestyle-product-scene, ecommerce-marketing-board |
| maps | 5 | food-map, travel-route-map, illustrated-city-map, store-distribution-map, itinerary-day-trip-map |
| slides-and-visual-docs | 4 | dense-explainer-slides, policy-style-slide, visual-report-page, educational-diagram-slide |
| poster-and-campaigns | 8 | brand-poster, campaign-kv, banner-hero, editorial-cover, biomimetic-concept-poster, vintage-editorial-infographic, character-catalog-poster, lineup-comparison-poster |
| portraits-and-characters | 5 | professional-portrait, founder-portrait, virtual-host, character-sheet, pose-reference-sheet |
| scenes-and-illustrations | 4 | healing-scene, concept-scene, picture-book-scene, minimalist-mood-scene |
| editing-workflows | 5 | background-replacement, local-object-replacement, object-removal, product-retouching, portrait-local-edit (edit.js용, 100–125줄로 가장 짧음) |
| avatars-and-profile | 5 | style-transfer-selfie, character-grid-portrait, themed-3d-icon, sticker-set, cultural-portrait-series |
| storyboards-and-sequences | 8 | four-panel-comic, manga-spread-page, anime-key-visual, character-relationship-diagram, recipe-process-flowchart, product-tvc-storyboard, cinematic-storyboard-grid, process-photo-board |
| grids-and-collages | 5 | banner-grid-2x2, lookbook-grid, mixed-style-multi-panel, anime-pitch-board, ad-banner-multi-grid |
| branding-and-packaging | 6 | brand-identity-board, mascot-brand-kit, cosmetic-packaging, beverage-label-design, full-mascot-brand-doc, character-merch-board |
| typography-and-text-layout | 2 | title-safe-poster, bilingual-layout-visual |
| assets-and-props | 2 | retro-skeuomorphic-icons, game-screenshot-mockup |
| academic-figures | 9 | method-pipeline-overview, neural-network-architecture, qualitative-comparison-grid, scientific-schematic, mechanism-diagram, multi-condition-comparison, publication-chart, graphical-abstract, research-overview-poster |
| infographics | 6 | legend-heavy, hand-drawn, bento-grid, comparison, step-by-step, kpi-dashboard |
| technical-diagrams | 7 | system-architecture, flowchart-decision, sequence-diagram, state-machine, er-diagram, mind-map-tech, network-topology |

전문을 읽은 템플릿: `ui-mockups/landing-page-case-study.md`, `infographics/hand-drawn-infographic.md`, `editing-workflows/background-replacement.md`, `technical-diagrams/system-architecture.md`(앞 140줄).

모든 템플릿은 같은 구조를 따른다: `# 이름 → 适用范围 → 何时使用(+不要使用: 형제 템플릿으로 보내는 라우팅) → 缺失信息优先提问顺序 → 主模板(📖描述 + 📝 JSON 또는 구조화 자연어) → 参数策略(必问/可默认/可随机) → 自动补全策略 → 变体 1..3 → 避免事项`.

### frontmatter
- name: `gpt-image-2`
- description (중국어 원문 요약): "GPT Image 2용 이미지 생성/편집 스킬. 3가지 환경에서 동작한다. (A) Garden 로컬 모드: OpenAI 호환 API로 직접 생성해 저장. (B) Host-Native: 프롬프트 엔지니어링 가이드로만 쓰고 렌더링된 prompt를 호스트 에이전트의 이미지 도구에 넘김. (C) Advisor: 이미지 도구가 없으면 고품질 prompt 컨설턴트로 동작. 18개 대분류, 80+ 구조화 템플릿."
- 호출 플래그: 없음. 실제 카테고리는 17개이고 템플릿은 93개라 description의 숫자와 다르다.

### 트리거 / 언제 쓰나
포스터, UI 목업, 제품 사진, 인포그래픽, 학술 그림, 기술 다이어그램(PNG), 만화·스토리보드, 아바타, 브랜드 보드, 기존 이미지 편집 등 **래스터 이미지가 결과물**인 요청. 템플릿 스스로 범위를 좁히는 문구도 있다. 예: "실제 인터랙티브 HTML 웹페이지라면 이미지가 아니라 HTML 코드를 생성하라", "편집 가능한 다이어그램이 필요하면 mermaid/draw.io를 써라".

### 입력 → 출력
- 입력: 자연어 요청, 선택적으로 원본 이미지와 mask
- 출력: `garden-gpt-image-2/prompt/<slug>-<YYYYMMDD-HHMMSS>.md`(최종 prompt), Mode A에서는 `garden-gpt-image-2/image/<slug>-<ts>.png`

### 동작 흐름
1. `node scripts/check-mode.js` 실행. `ENABLE_GARDEN_IMAGEGEN` 값이 truthy이고 KEY가 있으면 A, 플래그만 있고 KEY가 없으면 A?, 둘 다 아니면 B-or-C로 나온다. B와 C의 구분은 에이전트가 자기 도구 목록(`image_generation`, `dalle`, `mcp__*image*` 등)을 보고 판단하며, 애매하면 사용자에게 한 번 묻는다.
2. 생성 작업인지 편집 작업인지 판정한다.
3. SKILL.md 인덱스에서 카테고리를 고르고 **해당 템플릿 파일 하나만** 읽는다("references 전체를 한꺼번에 읽지 마라").
4. 템플릿의 `{argument name="..." default="..."}` 슬롯에 사용자 값을 채운다. 비어 있으면 default를 쓰고, 결과에 크게 영향을 주는 값이 빠졌을 때만 템플릿의 "提问顺序"대로 **좁고 구체적인** 질문을 한다.
5. JSON 또는 구조화 자연어 prompt를 렌더링한다(JSON은 API body가 아니라 prompt 문자열이다).
6. 모드별 분기:
   - A: prompt를 저장한 뒤 `generate.js --promptfile …` 또는 `edit.js --image … [--mask …]`를 호출한다.
   - B: 호스트 이미지 도구에 prompt를 그대로 넘긴다.
   - C: prompt를 저장하고 대화창에 출력하며, "직접 실행하라"는 안내를 붙인다. **생성에 성공한 척하지 않는다.**
7. 마지막에 모드, prompt 경로, 이미지 경로를 한 줄로 보고한다.

외부 API: OpenAI 호환 `/images/generations`, `/images/edits`(기본 base `https://api.openai.com/v1`, 모델 `gpt-image-2`, 게이트웨이로 교체 가능). 지원 옵션: `--size --n --quality(auto|high|medium|low) --background(transparent|opaque|auto) --moderation --output-format --output-compression`.

### 하위 모드 / 레퍼런스

| 항목 | 내용 |
|---|---|
| Mode A / B / C | 스크립트 직접 호출 / 호스트 도구에 위임 / prompt만 출력 |
| prompt-writing.md | 템플릿 설계 메타 규칙. 실행 중에는 "템플릿 구조를 정할 때"만 읽는다 |
| 93개 템플릿 | 위 표 참조 |

### 핵심 규칙 / 지식
- **파라미터 3분류**: 必问(주체, 상품명, 핵심 데이터) / 可默认(배경색, 보조 문구) / 可随机(행인 닉네임, 보조 댓글). 모든 슬롯에 실제로 동작하는 default를 넣고, default가 없는 슬롯은 반드시 질문 대상이어야 한다.
- **질문 규칙**: "어떤 느낌을 원하세요?"처럼 묻지 말고 템플릿 필드 기준으로 묻는다(예: "호스트는 누구? 실제 사진/유명인 이름/묘사/랜덤 중 무엇?"). 질문하는 경우는 다음뿐이다: 목표 없음, 편집할 원본 없음, 주체 정체성이 결과를 좌우함, 상품·가격·UI 문구가 핵심임, 목표끼리 충돌함. 그 외에는 합리적으로 기본값을 쓰고 진행한다.
- **JSON 골격**: `type, goal, subject, scene, layout, style, details, constraints{must_keep, avoid}`에 카테고리 전용 필드(`ui_overlay`, `callout_labels`, `legend`, `continuity`, `alignment_rule`, 패널별 `theme_color`)를 더한다. 멀티 패널은 `sections`를 row-major 배열로 명시하고 `continuity`/`alignment_rule`은 필수다.
- **스타일 자유도가 큰 장르는 JSON을 쓰지 않는다**: hand-drawn infographic, scientific schematic 등은 "구조화 자연어 + 파라미터"로 쓴다("강제 JSON은 화면 자유도를 제한").
- landing-page 템플릿의 구체 수치: section 간 여백 80–120px, hero 높이는 전체의 35% 이하, 타입 위계는 4단계 이상(H1/H2/Body/Caption), 카드 radius 12–16px, 가짜 브랜드명 금지(실제 브랜드를 쓰거나 "예시"로 표기), CTA는 브랜드색의 accent 버전.
- hand-drawn 템플릿: 색은 4–5개 이하이고 6개 이상이면 실패, 여백 30–40%, 컴퓨터 폰트 금지, 그라데이션·광택·유리 질감 금지, 카드 모양 5개를 모두 똑같이 만들지 말 것.
- system-architecture 템플릿: **색은 기술이 아니라 역할로 인코딩**한다(User=cyan #22D3EE, Gateway=blue #60A5FA, Service=emerald #34D399, Data=violet #A78BFA, Queue=orange #FB923C, Infra=amber, Security=rose, External=slate). 실선은 동기, 점선은 비동기, 직교 라우팅, 사선은 30° 이하, 노드는 8–15개.
- academic-figures: 흰 배경, 3색 이하의 저채도, 단색 인쇄 가능, **정량 데이터·수식·색표 범위 날조 금지**.
- 편집 템플릿은 "REFERENCE_0을 기반으로 X는 유지하고 Y만 바꾼다 + 새 배경과 일치하는 그림자 재생성 + 주체 색·문자 변경 금지" 문형으로 고정돼 있다.

### 의존성
Node 18+(내장 fetch), `OPENAI_API_KEY`(Mode A만). npm 의존성, MCP, 다른 스킬 의존은 없다. 키는 `.env`/`.gateway.env`/`~/.gateway.env`에서 자동으로 읽는다.

### 장점 (가져올 만한 것)
- **3-모드 강등(A→B→C)**: 도구가 없을 때도 쓸모 있는 결과를 내고, 성공을 위장하지 않는다는 규칙이 있다. 디자인 스킬에서도 "렌더러/브라우저가 있으면 검증, 없으면 명세만 출력"으로 응용할 수 있다.
- **파라미터 3분류와 필드 기반 질문 규칙**: 무엇을 묻고 무엇을 기본값으로 둘지 판단 기준이 명확하다. 범용 UI 스킬의 "요구사항 확인" 단계에 그대로 이식할 수 있다.
- **템플릿 표준 섹션**(적용 범위 / 쓰지 말 것과 대체 템플릿 / 질문 순서 / 변형 / 피할 것): 레퍼런스 파일 포맷으로 재사용하기 좋다.
- `constraints.must_keep / avoid` 쌍, 그리고 "무엇에 가까워야 하고 무엇에 가까우면 안 되는가"를 명시하는 습관.
- 역할 기반 색 인코딩 표, landing-page의 정량 규칙(hero 35% 이하, 위계 4단계 이상, 80–120px 섹션 간격)은 웹 UI 규칙으로도 그대로 통한다.

### 단점 / 한계 (버릴 만한 것)
- 결과물이 **래스터 이미지**라 웹 UI 코드 생성과 직접 관련이 없다. ui-mockups와 landing-page는 "그림"일 뿐이다.
- 레퍼런스 양(93×2 파일, 약 4.2만 줄)에 비해 실행 로직은 얇은 API 래퍼라서, 가치 대부분이 프롬프트 사전에 있다.
- prompt-writing.md 후반부(§14–17 "Phase 1–8 로드맵")는 스킬 작성자용 개발 계획이어서 런타임 에이전트에게는 노이즈다. 존재하지 않는 원본 파일 `100+GPT-Image2提示词.md`도 언급한다.
- description의 "18대 분류 / 80+"와 실제 17 / 93이 어긋나 있다.
- 기본값이 특정 미감에 쏠려 있다(landing-page 기본값이 "dark + glassmorphism + neon purple/blue"). 다른 스킬들이 금지하는 "AI 기본 맛"이 이 스킬에서는 기본값이다.
- 중국 플랫폼(小红书, 抖音, 淘宝) 중심의 예시가 많다.

---

## garden-skills/motion-showreel

### 파일 구성

```
motion-showreel/
├── SKILL.md (251)                 범위, 7단계 워크플로, 하드 규칙, "底线" 6개, 도구 표
├── manifest.json / README×3 (≈217)
├── references/
│   ├── craft.md (261)             "惊艳手法库": 연속 서사, 4요소 공식, 시간 템플릿, 밀도, 스프링 값, 전환 문법, 카메라, 타이포, 색, 질감, 시그니처 메뉴, AI 기본맛 금지표
│   ├── formats.md (93)            용도 A–J (포트폴리오, 제품 홍보, UI 모션, 키네틱 타이포, 로고, 루프, 데이터, 그린스크린, 연대기, 내레이션 장편)
│   ├── brief-template.md (95)     XML 태그 brief(<role><inputs><confirmations><direction><structure><build><gotchas><start>)
│   ├── stack.md (137)             render(t) 페이지 계약, 결정성 규칙, 기술 선택표, Canvas/DOM/WebGL/Three/p5 함정, 폰트, 소재, 다중 화면비, 성능
│   ├── recipes.md (295)           t의 순수 함수로 된 스니펫 15종
│   ├── sound.md (306)             BGM/SFX 2단계 엔진, 사운드 방향, 곡선, 어휘, SFX 대응표, 믹싱, 자동 검사, 사운드 기본맛
│   ├── narration.md (189)         사용자 원고 전용 TTS(Gemini/MiniMax/커스텀), 녹음 가져오기, 구간 타임라인, 3트랙 믹스
│   ├── long-form.md (61)          2분 초과 시 chapters.json, 챕터 캐시 빌드, 챕터별 오디오·검수
│   ├── review.md (133)            기술 검사 기준과 심사 표, 독립 심사 subagent, 증상→수정표, 납품 체크리스트
│   └── styles/ INDEX.md (80) + _template.md (59) + 43개 스타일 (87–125줄)
├── assets/starter/                scaffold가 복사하는 프로젝트 시드
│   ├── index.html (90), motion.js (193: spring/springTo/ease/snap/glide/whip/stagger/stepped/pulse/shake/rng/hash/noise/OKLab mix/camera/camera3d/drawBoxes)
│   ├── timeline.js (36: BPM, b(n), revealOn, DUR, SHOTS, CUES, HOLDS, DROPS)
│   ├── score.mjs / score.tone.js / score.layer.mjs, narration.js, preview.js, build.sh (78)
└── scripts/ (Node ESM, Playwright)
    ├── setup.sh, check-env.mjs, scaffold.sh
    ├── render.mjs (377)           Playwright 프레임 캡처 → ffmpeg. --still/--range/--sheet/--poster/--directions/--determinism/--text-check/--subframes/--dpr/--grain/--start/--duration
    ├── inspect.mjs (287)          qa(PASS/FAIL) / sheet / phone / strip / frames / loop / motion / grid(참조 영상 컷·BPM) / heat
    ├── audio.mjs (270)            build(score→−14 LUFS wav) / samples / beats(librosa 선택) / check(LUFS·피크·대역·드롭 호흡)
    ├── narration.mjs (51) + lib/narration*.mjs   tts / import / mix / check
    ├── build-long.mjs (231), preview.mjs (73)
    ├── lib/ browser, frames, fft, synth(570: 내장 신스), tone-render, text-hook, project
    └── test/ 6개 node:test 파일 (fixtures 포함)
```

43개 스타일 패밀리(INDEX의 8개 그룹):

| 그룹 | 스타일 |
|---|---|
| 그래픽·타이포 (7) | swiss-editorial, kinetic-brutalist, risograph-print, editorial-collage, art-deco, one-line, concept-morph |
| 인터페이스·제품 (6) | minimal-ui, dark-keynote, isometric-infographic, data-motion, blueprint, hologram-hud |
| 레트로·스크린 (6) | pixel-game, pixel-diorama, crt-vhs, terminal-ascii, glitch-digital, synthwave-neon |
| 3D·재질 (5) | glass-material, soft-3d-toy, liquid-shader, stained-glass, tilt-shift-miniature |
| 생성·추상 (3) | generative-geometry, particle-field, soft-organic |
| 일러스트·만화 (7) | comic-pop, flat-vector, guochao, painterly, cel-anime-80s, rubber-hose, whiteboard-explainer |
| 수작업 (7) | crayon-storybook, ink-wash, paper-cut, copperplate-engraving, ukiyo-e, shadow-puppet, illuminated-manuscript |
| 시네마틱 (2) | cinematic-title, mixed-media-era |

모든 스타일 파일은 `_template.md`의 고정 섹션을 따른다: 본질/아닌 것, **식별 신호 8–12개(편당 2–3개 선택)**, **"가장 진부한 버전"**, 적합 용도, 기술 경로, 재질과 렌더링, 팔레트(hex 예시와 도출 규칙), 폰트, 모션(스프링 값), 화면을 살리는 방법(홀드 중 미세 루프), 카메라 문법 표, 사운드 팔레트, 고유 기법, 변화 공간, 함정. 전문을 읽은 것: minimal-ui, swiss-editorial.

### frontmatter
- name: `motion-showreel`
- description: "코드로 그래픽·문자·인터페이스 애니메이션 영상을 만들어 MP4와 편집 가능한 소스를 출력한다. 최장 20분. 모션 포트폴리오, 제품 영상, UI 모션, 키네틱 타이포, 로고 인트로, 제너러티브 아트, 해설 영상용. BGM/효과음 출처를 따로 고를 수 있고, 사용자 내레이션이나 사용자 원고 기반 TTS를 지원한다. 실사 제작, 사실적 인물 생성, 일반 영상 편집에는 쓰지 않는다."
- 호출 플래그: 없음.

### 트리거 / 언제 쓰나
"N초짜리 모션 영상 / 제품 프로모 / 로고 sting / 키네틱 타이포 / 루프 GIF / 해설 영상(MP4)". 클릭으로 넘기는 발표는 `web-video-presentation`으로, 웹페이지·정적 시안은 `web-design-engineer`로 넘긴다고 SKILL.md 범위 표에 명시돼 있다.

### 입력 → 출력
- 입력: 주제, 길이(1200초 이하), 화면 방향, BGM 출처, SFX 출처, 내레이션 방식, 선택적으로 참조 영상·음원·로고·스크린샷
- 출력: `<slug>/` 프로젝트(brief.md, index.html, motion.js, timeline.js, score.*, build.sh, fonts/, assets/, audio/, qa/, out/final.mp4, out/poster.png, qa/review_log.md)

### 동작 흐름
0. 환경 준비: `sh scripts/setup.sh`가 Playwright, Chromium, Tone.js를 설치하고 `check-env.mjs`를 돈다. Node 18+와 ffmpeg는 사용자가 설치한다.
1. **요구 확인 (🛑 정지 1)**: 필수 6항목(주제, 길이, 가로/세로, BGM 출처, SFX 출처, 내레이션 방식)을 한 번에 묻는다. 정보가 다 있어도 요약을 보여주고 확인을 받는다. "알아서 해줘"는 창작 선택권을 줬을 뿐 확인 생략 권한이 아니다. 참조 영상이 있으면 `inspect.mjs sheet/grid --strips/heat`로 컷, BPM, 구간 길이, 움직임 면적을 측정해 brief에 수치로 적는다.
2. **brief.md**: 벤치마크 1–2개(배울 것/배우지 않을 것), 후보 구조 3개 중 선택과 이유, formats.md에서 용도 1절, styles에서 1–2개 파일만 읽고 신호 2–3개 선택("가장 진부한 버전"에서 무엇을 뒤집었는지 기록), Reel Read YAML(format/benchmark/structure/style/signals/takeaway/hook/signature/palette/type/motion/camera/texture/sound/forbidden), 비트 그리드 콘티(내레이션이 있으면 구간↔샷 표).
3. **스타일 프레임 (🛑 정지 2)**: `scaffold.sh <slug> --audio synth|tone|layer|file|none`.
   - 스타일이 정해진 경우: 실제 코드로 hook, 시그니처, 엔딩 3프레임을 만들어 `render.mjs --still … --sheet`로 보여준다.
   - 정해지지 않은 경우: **방향 3개(A 주제 밀착 / B 다른 그룹 / C 과감·커스텀)**를 `?dir=a|b|c`로 한 페이지에 구현하고 `--directions a,b,c`로 라벨 붙은 비교 이미지를 만든다.
   - 연속 동작이 핵심이면 6–10초 동작 샘플을 첨부한다.
4. **제작**: stack.md를 읽는다. 내레이션이 있으면 실제 음성 타임스탬프를 먼저 확정한다. 모든 시간은 `timeline.js`에 둔다(SHOTS/HOLDS/DROPS/CUES, `revealOn`). 샷마다 처음·중간·끝 3장을 렌더하고, `--determinism`을 통과해야 하며, 960×540 프록시를 거쳐 `sh build.sh`로 본편을 만든다.
5. **사운드**: tier1 내장 신스(score.mjs) 또는 tier2 Tone.js(score.tone.js) 또는 사용자 음원을 쓴다. `audio.mjs build`가 −14 LUFS로 마스터링하고, 빌드할 때마다 `audio.mjs check`를 돈다. 내레이션이 있으면 `narration.mjs mix`로 ducking한다.
6. **검수**: `inspect.mjs qa`는 FAIL이 하나라도 있으면 exit 1이고, 넘기지 않은 스펙은 NOT CHECKED로 표시돼 통과로 치지 않는다. 사람 심사는 review.md 표에 따라 하고 가장 심각한 문제 3개를 뽑는다. 문제 구간만 재렌더한다. 서브에이전트를 쓸 수 있으면 **코드와 과정을 주지 않고 qa 자료만 준 독립 심사**를 맡긴다.
7. **납품**: mp4/poster 경로, brief, 검사 결과, 미해결 문제, 재빌드 방법, 소재 라이선스를 알린다.

렌더링 파이프라인: 페이지가 `window.DUR / window.render(t) / window.READY`를 노출하고, render.mjs가 로컬 HTTP 서버와 Playwright Chromium으로 프레임마다 `render(t)`를 호출해 스크린샷을 찍는다(워커 3개 병렬, 서브프레임 블렌딩 가능). 이를 ffmpeg로 인코딩하면서 grain과 오디오를 합친다.

### 하위 모드 / 레퍼런스

| 파일 | 언제 |
|---|---|
| formats.md | 2단계, 용도 결정 (해당 절만) |
| styles/INDEX.md + 1–2개 스타일 | 2단계 |
| craft.md | 2·4단계 |
| brief-template.md | brief 작성 |
| stack.md / recipes.md | 4단계 |
| sound.md | 2단계(방향), 5단계 |
| narration.md | TTS·녹음이 있을 때 |
| long-form.md | 2분 초과 |
| review.md | 6단계 |
| 오디오 모드 | synth / tone / layer / file / none |

### 핵심 규칙 / 지식
- **결정성 계약**(stack §2): `Math.random`, `Date.now`, rAF, setTimeout, **CSS transition/animation**, 프레임 간 누적 상태(`x += v`)를 모두 금지한다. 대체 수단은 seeded `rng/hash`, 해석적 `x(t)`, 폐형식 스프링, `video.currentTime = t` 후 `seeked` 대기다.
- **스프링 성격표**(craft §4.1): 버튼·토글 `{freq 3.6, damp 0.8}`, 카드·컨테이너·카메라 `{2.4, 0.75}`, 큰 글자·로고 `{1.6, 0.95}`, 마스코트 `{2.8, 0.45}`. "같은 종류의 요소는 같은 단계". bounce를 쓸 때 damp는 0.6 이상, 장난스러운 요소에만.
- 이징 3종: `snap = bezier(0.7,0,0.2,1)`, `glide = (0.16,1,0.3,1)`, `whip = (0.85,0,0.15,1)`. **퇴장은 입장보다 빠르게**(입장 0.4–0.6s, 퇴장 0.2–0.3s). stagger 30–60ms.
- 텍스트 체류 시간: 영어는 `글자수/15 + 1.5s`, 중국어는 `글자수/4.5 + 1.5s`. 한 화면에 5–7단어(중국어 약 12자). 글자 크기는 화면 높이의 4% 이상. 거대 글자는 화면 높이의 20–40%, 주석은 12–16px mono.
- **2+1 색**: 배경 + 주색 + 주인공 전용 accent. 색 보간은 OKLab. 공개 영상 통계를 근거로 "밝은 배경이 과소평가돼 있다"(57% 어두움 / 43% 밝음)고 본다.
- **AI 기본맛 금지표**(craft §11): 어두운 배경 + 가운데 큰 글자 + 그라데이션 / 모든 요소 동시 페이드 / 보라→분홍→파랑 글로우 / 범용 파티클 / 등속 이동 / 작은 주체 고정 카메라 / 구석 HUD 라벨·가짜 데이터 / emoji 아이콘 / Inter·Roboto·Arial 디스플레이 / 루프 이음매 튐. 각 항목에 대체안이 있다. 예외는 "브랜드 규범이 그런 경우".
- 전환 문법: "다음 화면은 이전 화면의 어떤 요소에서 자라나야 한다." 한 편에 2–3종만 쓴다. **reveal 프레임을 비트에 맞춘다**(`revealOn(hit, dur, reveal) = hit − reveal·dur`). 복잡한 전환은 0.45–0.6s.
- 연속 서사: "자막을 숨겨도 대상의 행동만으로 이해되는가"로 슬라이드쇼 같은 영상을 걸러낸다. 의사(擬似) 움직임(배경 노이즈, 파티클, 목적 없는 push-in)으로 빈자리를 메우지 않는다.
- 사운드 기본맛 금지: Am–F–C–G, 120 BPM 4-on-the-floor, 매 강박 impact+crash, 종소리 엔딩, saw pad.
- 텍스트 프레이밍 자동 검사: CUT/BLEED/OVERLAP/SAFE(세로 화면 상하 12%)/TINY를 0.3초 이상 지속될 때 보고한다. 모션 검사는 샷별 moving/still/jumps, flash frames를 본다.
- 하한선 6개: 확인과 원고, 사실 정확성, 문자 가독성, 소재 라이선스, 기술 정확성(결정성, 검사 통과, 급작스러운 끝 없음), 스타일 일관성. "그 외는 스타일과 내용이 정한다."
- 진짜 로고와 스크린샷을 강제한다. "CSS로 가짜 UI를 그려 실제 제품인 척하지 말 것."

### 의존성
Node 18+, ffmpeg/ffprobe, Playwright + Chromium(또는 설치된 Chrome/Edge), Tone.js 15.1.22, 선택적으로 librosa(Python), 선택적으로 TTS API(Gemini/MiniMax/커스텀 어댑터, 자격 증명은 환경 변수), 선택적으로 three/p5(프로젝트에 로컬 설치, CDN 금지). MCP는 쓰지 않는다. 다른 스킬과는 범위 라우팅만 한다(web-video-presentation, web-design-engineer).

### 장점 (가져올 만한 것)
- **스타일 파일 포맷**(`_template.md`): "식별 신호 중 2–3개만 고르기 + 가장 진부한 버전을 명시하고 뒤집기 + 변화 공간". 범용 디자인 스킬의 "스타일 프리셋" 형식으로 가장 쓸 만하다. 프리셋이 템플릿 복제로 굳는 것을 구조적으로 막는다.
- **스프링/이징 성격표와 "퇴장 < 입장" 규칙**: 웹 UI 마이크로인터랙션 규칙으로 그대로 옮길 수 있다.
- **AI 기본맛 금지표 + 대체안 + 예외 조건**: 금지만 늘어놓는 다른 스킬보다 실행하기 쉽다.
- **방향 3개 제시(A 밀착 / B 다른 언어 / C 과감, 같은 그룹 금지, 색만 바꾼 변형 금지)**: 디자인 탐색 단계에 바로 이식할 수 있다.
- **검수 분리**: 기계 검사(PASS/FAIL, NOT CHECKED는 통과가 아님)와 사람 심사(최악 3개 + 시간 코드)를 나눈다. **독립 심사 에이전트에는 산출물만 주고 코드와 과정은 주지 않는다.**
- 텍스트 프레이밍 검사(CUT/OVERLAP/TINY/SAFE)라는 발상은 웹 UI 시각 검수(넘침, 겹침, 최소 글자 크기)로 일반화할 수 있다.
- 2+1 색 규칙, 극단적 크기 대비, 왼쪽 정렬과 그리드("가운데 큰 글자는 AI 기본 스타일의 1번 표지").

### 단점 / 한계 (버릴 만한 것)
- 설치 부담이 크다(Playwright, Chromium, ffmpeg, Tone.js). 렌더 시간도 길다(Three.js + 후처리 80–300ms/프레임).
- **확인 정지가 2회 의무**이고 필수 질문이 6개라, 빠른 작업에는 무겁다.
- 사운드, 내레이션, 장편 관련 문서가 전체의 약 40%다. 웹 UI 디자인과는 무관하다.
- 결정성 규칙(CSS animation 금지)은 영상 렌더링 전용이다. 웹 UI에서는 오히려 CSS transition이 정답이라 그대로 옮기면 해롭다.
- 일부 수치에 "Opus 5.5 공개 영상 통계" 같은 출처를 검증할 수 없는 주장이 섞여 있다.
- `prefers-reduced-motion` 같은 접근성 고려가 없다(영상이라 당연하지만 웹으로 옮길 때는 보완해야 한다).

---

## garden-skills/web-video-presentation

### 파일 구성

```
web-video-presentation/
├── SKILL.md (451)                  4 Phase + 2 Checkpoint, 자기 검사 프로토콜, 단계별 읽을 파일 표, 10원칙
├── manifest.json / README×3 (≈322)
├── references/
│   ├── SCRIPT-STYLE.md (409)       글 → 구어 원고: 정보 보존 60% 이상, B站 8원칙, AI 말투 5종 제거, 플랫폼 변형, 3층 자기 검사
│   ├── OUTLINE-FORMAT.md (203)     outline.md 스펙: 챕터 헤더, 정보 풀, step 1줄, 애니메이션 기술 금지, 소재 목록, 자기 검사
│   ├── CHAPTER-CRAFT.md (224)      챕터 구현 단일 필독: "PPT가 아니다", 시각 데모 필수, 하나씩 공개, 이중 소스, 미감, 반 AI맛, 코드 레드라인, 완료 검사
│   ├── THEMES.md (351)             token 계약(필수 16 + 성격 노브 + 장식층), 내장 23개 테마, 새 테마 만드는 절차, 반패턴
│   ├── AUDIO.md (276)              narrations.ts → audio-segments.json → provider .sh → public/audio/<id>/<N>.mp3, Auto 모드 규칙
│   ├── RECORDING.md (77)           ?auto=1 원테이크 녹화, Manual/Audio/Auto 모드
│   └── EXAMPLES/                   README (107), hook-chapter/ (tsx 125 + css 197), list-reveal/ (tsx 103 + css 137), case-tech-review/ (outline 발췌)
├── scripts/scaffold.sh (245)       npm create vite(react-ts) → 템플릿 복사 → 테마 tokens.css 주입 → .theme 기록, --list-themes
├── templates/                      Vite + React + TS 런타임
│   ├── src/App.tsx (73), main.tsx, registry/{types.ts, chapters.ts}
│   ├── hooks/useStepper.ts (174: (chapter,step) 커서, localStorage STORAGE_KEY, sanitize), useAutoMode.ts (66: manual/audio/auto, M키, Space 게이트),
│   │         useAudioPlayer.ts (112), useStageScale.ts (28)
│   ├── components/Stage.tsx (1920×1080 + transform scale, 빈 곳 클릭 = 다음), MaskReveal.tsx (clip-path wipe), ProgressBar (hover 때만 보임), AutoStartGate, AutoToggle
│   ├── styles/base.css (415: primitive class .hero-num/.rule/.card/.card-glass/.stage-frame/.masthead/.kicker/.pull-quote …), animations.css (63), fonts.css
│   ├── chapters/01-example/ (Example.tsx, .css, narrations.ts)
│   └── scripts/extract-narrations.ts (137), synthesize-audio.sh (145), tts-providers/{minimax.sh, openai.sh, README.md(324: 3함수 계약 + ElevenLabs/edge-tts/say/Azure/GCloud 예시)}
└── themes/<23개>/{theme.json (≈28), tokens.css (56–77)}
```

테마 패밀리 (23개):

| 분류 | 테마 id |
|---|---|
| 어두운 테마 (8) | midnight-press(기본), chalk-garden, terminal-green, blueprint, dark-botanical, neon-cyber, bold-signal, creative-voltage |
| 밝은 테마 (15) | paper-press, warm-keynote, newsroom, bauhaus-bold, sunset-zine, monochrome-print, vintage-editorial, pastel-dream, split-canvas, electric-studio, indigo-porcelain, forest-ink, kraft-paper, dune, swiss-ikb |

`theme.json` = `{id, name, nameZh, description, descriptionZh, mood[], bestFor[], preview{shell,surface,text,accent}}`. `tokens.css`는 팔레트 12개, 폰트 4개, 모션 시간, 성격 노브(`--r-card`, `--rule-w/style`, `--hero-num-*`, `--stage-pad-*`, 그림자), 장식(`--surface-pattern*`, vignette)으로 구성된다. 전문 확인: swiss-ikb.

### frontmatter
- name: `web-video-presentation`
- description: "글이나 구어 원고를 '영상처럼 보이는' 클릭 구동 16:9 웹 발표로 만들고, 선택적으로 내레이션 음성을 합성한다. 흐름: 원문 → 원고 + outline 개발 계획을 한 번에 산출 → 사용자와 5가지를 한 번에 정렬(원고/outline/테마/소재/개발 모드) → 웹 개발(챕터별/순차/병렬) → 선택적 음성 합성(provider-agnostic). **outline은 리듬과 정보 밀도만 계획하고 애니메이션은 계획하지 않는다.** 클릭 한 번이 한 박자이고, 각 step이 화면 전체를 쓰며, 진행 바는 hover 때만 보인다. … 디자인 방법론과 협업 흐름이 핵심이고 특정 스타일·폰트·색에 묶이지 않는다."
- 호출 플래그: 없음.

### 트리거 / 언제 쓰나
"이 글이나 원고로 영상을 만들어줘", "동적 PPT인데 PPT 같지 않게", B站/YouTube 녹화 강의, 영화 같은 제품·토크 데모. 소재 없이 "X 주제 영상 만들어줘"라고만 하면 **되묻는다**(스킬이 내용을 대신 구상하지 않는다).

### 입력 → 출력
- 입력: `article.md`(원문) 또는 원고, 선택적으로 이미지 소재
- 출력: `script.md`, `outline.md`, `presentation/`(Vite+React+TS, 챕터별 폴더와 `narrations.ts`), 선택적으로 `public/audio/<id>/<N>.mp3`. 최종 영상은 사용자가 화면 녹화로 만든다.

### 동작 흐름
1. 입력을 분류한다(원문 / 원고 / 없음이면 되묻기).
2. `script.md`와 `outline.md`를 한 번에 산출한다. 원고는 원문 언어를 유지하고 정보 보존률 60% 이상이다. outline에는 챕터, step, 구어 예상 시간, 정보 풀, 소재 목록을 쓰고 애니메이션은 쓰지 않는다.
3. **자기 검사 프로토콜**: 독립 reviewer agent(Teams) → subagent → 직접 항목별 검사 순으로 강등한다. **fail 항목을 먼저 고친 뒤** 보고한다. "결론만 보고하고 고치지 않으면 위반".
4. **Checkpoint Plan (🛑)**: 원고, outline, 테마(모든 theme.json을 동적으로 읽어 `bestFor` 매칭으로 2–3개 추천), 소재(a 기존에서 선택 / b 사용자 제공 / c placeholder), 개발 모드(A 챕터별 확인 [기본] / B 순차 / C 병렬 subagent) 5가지를 한 번에 확인한다.
5. `scaffold.sh ./presentation --theme=<id>`를 실행하고 01-example을 지운다.
6. **1장은 메인 스레드에서 완성본으로 만들고 사용자 검수(🛑 필수)**를 받는다. 이후 모든 장의 스타일 기준점이 된다.
7. 2–N장은 선택한 모드대로 진행한다. 병렬 모드의 subagent prompt에는 해당 장 outline, CHAPTER-CRAFT 경로, 테마 mood, 1장 코드(코드 스타일 참고용), CSS 접두사 규칙, `chapters.ts` 수정 금지, `npx tsc --noEmit`을 넣는다.
8. 챕터 구조가 바뀌면 `STORAGE_KEY`를 bump한다.
9. **Checkpoint Audio (🛑)**: 합성하면 `npm run extract-narrations` → 사용자가 segments를 확인 → `npm run synthesize-audio`(기본 minimax, `PRESENTATION_TTS=openai` 가능, 증분)로 진행하고, 15초 이상인 구간을 보고한다.
10. 녹화: `?auto=1` → Space → 오디오가 끝나고 200ms 뒤 자동으로 다음으로 넘어가는 원테이크. 오디오가 없으면 수동 클릭 후 후반 작업에서 더빙한다.

### 하위 모드 / 레퍼런스

| 항목 | 내용 |
|---|---|
| 개발 모드 A/B/C | 챕터별 확인 / 순차 일괄 / subagent 병렬 |
| 재생 모드 | Manual / Audio(`?audio=1`) / Auto(`?auto=1`, M키 순환) |
| TTS provider | minimax(mmx-cli, 기본), openai(curl). README에 elevenlabs, edge-tts, say, azure, gcloud 예시 |
| 레퍼런스 | SCRIPT-STYLE·OUTLINE-FORMAT(Phase 1), CHAPTER-CRAFT(챕터마다), THEMES(테마 선택·제작), AUDIO(Phase 3), RECORDING(Phase 4), EXAMPLES(막힐 때만) |

### 핵심 규칙 / 지식
- **10원칙**: 16:9 고정 무대(1920×1080 + scale, 반응형 없음) / 전역 step 카운터(챕터는 step의 순수 함수) / `if (step === N) return <FullScene/>` / 한 박자 = 한 step = 한 아이디어 / 숨은 컨트롤 / 무대 chrome 없음(header, footer, 쪽번호 금지) / **내용 구동 애니메이션**(내재된 동작을 먼저 찾고, 없을 때만 등장 애니메이션) / 여러 항목은 하나씩 공개 / 전체 단일 테마 / 이중 소스.
- **목록 공개 규칙**: "첫째 X, 둘째 Y, 셋째 Z"를 한 step에서 stagger로 올리는 것은 **엄금**이다. X만 켜고 → Y를 켤 때 X는 회색으로 남기고 → 그다음도 같은 방식. 판정 기준은 "발표자가 하나씩 읽는가"다.
- **이중 소스**: 리듬과 순서는 script를, 화면 디테일(숫자, 인용, 사례)은 article을 따른다. "화면 정보 밀도는 구어보다 높아야 한다. 구어만 쓰면 PPT가 된다."
- 미감 수치: hero 글자 80px 이상, 무대 사방 안전 여백 80px 이상, step마다 화면에 1–3개만.
- **반 AI맛 목록**: 보라·분홍 / 파랑·보라 대각 그라데이션, **둥근 카드 + 색 있는 왼쪽 테두리**, 그라데이션 버튼 + 큰 pill, emoji 아이콘, 가짜 데이터·로고·"X만 사용자", 장 전체가 같은 등장 애니메이션, 매 step ken burns·호흡 글로우·깜빡임, 매 화면 오른쪽 아래 mono 각주. **없는 소재는 없다고 인정하고 "image · 16:9 설명" placeholder 카드를 실제 비율로 둔다.**
- **토큰 규율**: 색과 font-family는 **반드시 token**(`--shell/--surface/-2/-3/--text/-2/-mute/-faint/--rule/--accent/-soft/-glow`, `--font-display-cn/-en/--font-body/--font-mono`)을 쓰고 hex·폰트명 하드코딩은 금지다. 반면 **글자 크기, 간격, 시간, 이징은 자유롭게 하드코딩**한다. 테마 성격은 primitive class(`.hero-num/.rule/.card/.stage-frame`)로 자동 적용하고 챕터에서 재정의하지 않는다.
- 테마 제작 규칙: 어두운 테마는 shell이 surface보다 더 어둡고, 밝은 테마는 shell이 약간 더 회색. text/surface 대비 4.5:1 이상(96px 이상 제목은 3:1). **accent는 유일한 채도색**이고 soft/glow는 같은 색상의 투명도 변형만. **디자인 시그니처는 하나만**(점선 rule / 스캔라인 / glass slab / 종이결 / 두꺼운 테두리 중 하나, 셋을 겹치면 서로 충돌). `--text-faint`도 13px 대문자로 읽혀야 한다.
- 원고 AI 말투 5종: 가짜 공감("你是不是也有这种感觉"), 가짜 깊이("恰恰/反而/正是", 지워도 의미가 같으면 삭제), 자기 강조("我必须很认真地说"), 만능 템플릿("说白了/底层逻辑/以上就是本期内容"), 3연속 병렬 구문. 판정 기준은 "실제 사람이 이렇게 말하겠는가"다.
- 코드 레드라인: setTimeout/setInterval로 애니메이션 구동 금지(CSS keyframes 사용), 인터랙티브 요소에 `data-no-advance`, 챕터별 CSS 접두사와 cross-import 금지, `narrations.length === max(step)+1`, **애니메이션 길이는 해당 step 구어 길이 이하**(Auto 모드가 오디오 종료 + 200ms에 강제로 넘어감, 구어 길이는 약 글자수÷4초).

### 의존성
npm, Vite, React, TypeScript, tsx. TTS는 `mmx-cli`(MiniMax 키) 또는 `OPENAI_API_KEY`(curl), 길이 확인에 ffprobe. 녹화는 사용자 몫(QuickTime/OBS). 병렬 개발에는 subagent 기능을 쓰고(없으면 강등), MCP는 쓰지 않는다.

### 장점 (가져올 만한 것)
- **테마 token 계약 설계**: 강제 token(색·폰트) / 자유 하드코딩(크기·간격·시간) / primitive class로 성격 주입이라는 3층 구분. 범용 웹 UI 스킬의 디자인 시스템 규칙으로 가장 바로 옮겨 쓸 만하다. "테마를 바꿨을 때 깨지면 버그는 챕터에 있다"는 판정 기준도 명쾌하다.
- **테마 제작 규칙**(accent 하나, soft/glow는 같은 색상, 시그니처 하나, shell/surface 명도 관계, 대비 4.5:1/3:1).
- `theme.json`의 `mood/bestFor` 메타데이터로 **추천을 동적으로 매칭**한다(목록을 하드코딩하지 않음).
- **"1장 = 기준점, 메인 스레드에서 완성본 + 필수 검수"** 다음에 병렬 subagent로 넘기는 구조, 그리고 subagent prompt에 넣을 항목 목록.
- **자기 검사 → 수정 → 보고 프로토콜**(독립 reviewer → subagent → 직접, 결론만 넘기면 위반).
- 반 AI맛 목록 중 웹 UI에 바로 해당하는 것: "둥근 카드 + 색 있는 왼쪽 테두리", "그라데이션 pill 버튼", "구석 mono 각주", "가짜 수치", **그리고 placeholder로 결손을 인정하기**.
- 목록을 하나씩 공개하는 규칙과 "내재된 동작을 먼저 찾고 없을 때만 등장 애니메이션" 원칙은 웹 인터랙션과 온보딩 설계에도 통한다.
- SCRIPT-STYLE의 AI 말투 5종은 UI 마이크로카피 검수에도 쓸 수 있다.

### 단점 / 한계 (버릴 만한 것)
- **문서 간 불일치**: SKILL.md는 CHAPTER-CRAFT에 "Part 0 十条原则 / Part 2 决策树 / Part 5 / Part 8 反馈速查"가 있다고 하지만, 실제 파일에는 Part 구분도 결정 트리도 피드백 빠른 참조표도 없다("Part"는 한 번만 나온다). description이 말하는 "PRINCIPLES + ANTI-AI 法则" 파일도 없다(CHAPTER-CRAFT로 합쳐짐). EXAMPLES/OUTLINE-FORMAT도 없는 Part를 계속 참조한다.
- **예제끼리 규칙 충돌**: list-reveal 예제는 masthead header("第一部分")를 쓰는데 CHAPTER-CRAFT는 "어떤 형태의 머리말·꼬리말도 금지"라고 한다. EXAMPLES README는 숫자 롤링에 `requestAnimationFrame`을 권하는데 레드라인은 타이머 구동을 금지하고 CSS keyframes를 쓰라고 한다.
- 16:9 고정 무대에 반응형이 없다. 일반 웹 UI와는 정반대 전제다.
- 강제 정지가 3회(Plan, 1장 검수, Audio)이고 자기 검사 subagent 호출이 잦아 토큰 비용이 크다.
- 원고 규칙이 B站/중국어 중심이다(글자수÷4초, 250자/분).
- `prefers-reduced-motion`을 처리하지 않는다. 녹화용이라 의도된 것이지만 웹으로 옮길 때는 보완해야 한다.
- scaffold가 `npm create vite@latest`를 쓴다(버전 고정 없음).

---

## 스킬 간 관계

| 관점 | gpt-image-2 | motion-showreel | web-video-presentation |
|---|---|---|---|
| 결과물 | PNG 이미지 / prompt | MP4 + 결정론적 HTML 소스 | 클릭형 React 웹 + 선택적 mp3 (녹화는 사용자) |
| 시간 모델 | 없음 | `render(t)` 순수 함수, CSS 애니메이션 금지 | `step` 순수 함수, CSS keyframes 사용 (타이머 금지) |
| 스타일 체계 | 카테고리 템플릿 93개 (JSON 슬롯) | 스타일 43개 (신호 2–3개 + 진부한 버전 뒤집기) | 테마 23개 (CSS token + primitive class) |
| 사용자 확인 | 핵심 필드가 비었을 때만 질문 | 정지 2회 (요구, 스타일 프레임 / 방향 3개) | 정지 3회 (Plan 5종, 1장, Audio) |
| 검수 | 없음 (생성 결과를 보지 않음) | 기계 PASS/FAIL + 사람 심사 + 독립 심사 에이전트 | 자기 검사 체크리스트 + reviewer 에이전트 + `tsc` |
| 반 AI맛 | (오히려 기본값이 네온·글래스) | 금지표 + 대체안 + 예외 | 금지 목록 + placeholder 원칙 |
| 서로의 관계 | 독립 | 범위 표에서 클릭형 발표는 web-video-presentation으로, 웹페이지는 web-design-engineer로 보냄 | motion-showreel과 역할 분담 (클릭/녹화 vs 렌더된 MP4) |

**범용 웹/UI 디자인 스킬에 재사용할 수 있는 부분 (우선순위 순)**

| 출처 | 가져올 것 | 비고 |
|---|---|---|
| web-video-presentation / THEMES.md | token 계약 3층(강제 색·폰트 / 자유 치수 / primitive class), accent 하나, 시그니처 하나, 대비 규칙, `theme.json`의 mood/bestFor 추천 | 디자인 시스템 섹션의 뼈대로 쓰기 좋다 |
| motion-showreel / craft.md §4·§7·§8·§11 | 스프링·이징 성격표, 퇴장 < 입장, stagger 30–60ms, 2+1 색, 극단적 크기 대비, 가운데 큰 글자 회피, AI 기본맛 → 대체안 표 | 결정성 규칙(§2, CSS 애니메이션 금지)은 **빼야 한다** |
| motion-showreel / styles/_template.md + INDEX 방향 3개 규칙 | 스타일 프리셋 파일 포맷(식별 신호 / 진부한 버전 / 변화 공간), A·B·C 방향 탐색 | 미감 프리셋이 템플릿 복제로 굳는 것을 막는다 |
| motion-showreel / review.md | 기계 검사와 사람 심사 분리, NOT CHECKED는 통과가 아님, 최악 3개 + 위치, 산출물만 주는 독립 심사 에이전트, 텍스트 프레이밍(CUT/OVERLAP/TINY) | 웹 시각 QA 단계로 변환 |
| web-video-presentation / CHAPTER-CRAFT.md | 반 AI맛 목록(왼쪽 색 테두리 카드, 그라데이션 pill, 가짜 수치), 결손은 placeholder로, 자기 검사 → 수정 → 보고 프로토콜 | 16:9 고정과 chrome 금지는 웹에 맞지 않는다 |
| gpt-image-2 / prompt-writing.md §6–9 | 파라미터 3분류(必问 / 默认 / 随机), 필드 기반 질문, `must_keep/avoid` 쌍, 레퍼런스 파일 표준 섹션 | 요구사항 수집과 레퍼런스 작성 규칙으로 |
| gpt-image-2 / 개별 템플릿 | landing-page 정량 규칙(hero 35% 이하, 위계 4단계 이상, 섹션 80–120px), 역할 기반 색 인코딩 | 이미지 생성 파이프라인 자체는 불필요 |

버릴 것: 이미지·오디오·TTS·렌더링 파이프라인(Playwright/ffmpeg/Tone.js/mmx-cli), 영상 전용 결정성 규칙, 16:9 고정 무대, B站 원고 규칙, 중국 플랫폼 중심 템플릿 대부분.
