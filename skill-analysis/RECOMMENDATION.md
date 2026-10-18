# 디자인 스킬 컬렉션 비교 평가 및 추천

분석 대상: **4개 컬렉션 / 37개 스킬**
- `emilkowalski` — 12개
- `garden-skills` — 5개
- `taste-skills` — 13개
- `ui-ux-pro` — 7개

> 같은 `skill-analysis/` 폴더에 `anthropic`, `minimax-ai`, `open-ai` 분석이 함께 존재하나, 이번 분석 지시 범위(위 4개 컬렉션) 밖이므로 이 문서의 평가에서 제외했다.

---

## 1. 컬렉션별 총평

### emilkowalski — 모션 크래프트의 단일 기준선

**디자인 철학**: "**모션은 기본값이 아니라 정당화가 필요한 예외다.**" 12개 스킬 중 8개가 웹/RN 애니메이션에 집중하며, 모든 생성 스킬이 동일한 2단 게이트로 시작한다 — (1) 빈도 판정("100+ times/day → No animation. Ever."), (2) 목적 명명(6개 어휘 중 하나). 두 게이트 중 하나를 통과하지 못하면 **코드 0줄이 정답**이라고 명시한다("The gate below exists to produce zero lines of code sometimes. That's a success, not a dodge").

**지침 구체성**: 4개 컬렉션 중 **모션 도메인에서 압도적 1위**. easing 토큰 3개가 고정값(`cubic-bezier(0.23, 1, 0.32, 1)` 등)이고, duration이 요소별 5단(100–160ms ~ 200–500ms)이며 UI 상한 300ms, spring 프리셋 2개, stagger 30–80ms, velocity 해제 임계 0.11, blur 상한 20px, scale 시작값 0.9–0.97까지 전부 수치다. `apple-design`은 이에 더해 **실행 가능한 수식 3개**(momentum projection `project(v, 0.998)`, rubber-banding `constant=0.55`, relative velocity 정규화)를 제공한다 — 4개 컬렉션에서 감각을 수식으로 환원한 유일한 사례.

**완성도**: 스킬 간 역할 분리와 라우팅이 가장 정교하다. `animate`(생성) / `review-animations`(diff 비평) / `improve-animations`(코드베이스 감사+계획) / `find-animation-opportunities`(부재 탐색) / `prototype`(발산) / `pick-ui-library`(의존성) / `animation-vocabulary`(용어)가 각각 다른 산출물을 내고 description에 상호 라우팅이 박혀 있다. `improve-animations execute`가 `review-animations`를 검증 게이트로 호출하는 **생성-검증 루프**까지 구현된다.

**실용성의 한계**: (a) 동일 수치가 5개 스킬에 복제되어 한 곳만 갱신되면 판정이 갈린다. (b) 검증이 전부 텍스트 규칙이며 실행 가능한 린터·테스트가 없다. (c) `emil-design-eng`가 `animate`+`review-animations`의 통합본으로 대규모 중복이며 description에 트리거가 없다. (d) `write-swift`는 컬렉션과 주제가 전혀 겹치지 않는 이물질이다.

---

### garden-skills — 프로세스 하네스로 품질을 확보하는 컬렉션

**디자인 철학**: "**미학은 테마에 위임하고, 스킬은 절차와 검증을 담당한다.**" 5개 스킬 중 3개(`beautiful-article`, `web-video-presentation`, `web-design-engineer`)가 다단계 harness이며, 각각 필수 정지점(Checkpoint)과 자체점검 프로토콜을 갖는다. 미적 판단은 11개 테마 프로파일(`beautiful-article`), 23개 테마(`web-video-presentation`), 25개 앵커 레시피(`web-design-engineer`)로 **조회 가능한 카탈로그**로 외화된다.

**지침 구체성**: **앵커 레시피 방식이 4개 컬렉션 최고**. `web-design-engineer`의 `linear.md`는 팔레트 hex 9개, radius 3단(6/12/16, "Never above 16"), 모션 곡선(`cubic-bezier(0.22, 1, 0.36, 1)`), 액센트 사용 비율(`< 5% of pixels`), 그라디언트 투명도(`< 8% opacity`)까지 지정하고 "Avoid" 6항목으로 마감한다. 25개 레시피가 같은 형식이며, 로드는 "**Load only the one recipe file you're using**"으로 통제된다.

**완성도**: 4개 컬렉션에서 **실행 가능한 검증이 가장 잘 배치**되어 있다. `beautiful-article`은 `npm run typecheck`/`build` + 원본 diff 대조(조용한 정보 손실 탐지) + 6개 노드의 차별화된 검수 프로토콜, `web-video-presentation`은 `npx tsc --noEmit` 통과 없이 "완료" 보고를 금지, `web-design-engineer`는 조건부 브라우저 acceptance harness(수리 루프 + 증거 기록)를 제공한다. 검증 비용을 설계 변수로 다룬 점도 특징이다 — "**误开 SubAgent / 误写文件是首要性能问题**"(SubAgent 남발과 불필요한 파일 작성이 최우선 성능 문제).

**실용성의 한계**: (a) `beautiful-article`·`web-video-presentation`의 SKILL.md와 references가 **중국어**다. (b) 3개 Checkpoint × 항목별 개별 응답 요구로 자동화와 상충한다. (c) `web-video-presentation`은 TTS API 키가 필요하고 기본 제공자가 MiniMax(별도 CLI 설치+로그인)여서 첫 실행 실패 가능성이 높다. (d) `gpt-image-2`는 이미지 생성 검증 장치가 없어 학술 도판의 데이터 위조 위험을 프롬프트 금지로만 막는다.

---

### taste-skills — 안티슬롭 카탈로그의 극한

**디자인 철학**: "**AI의 통계적 편향을 이름 붙여 차단한다.**" 13개 스킬 중 다수가 "LLMs have statistical biases", "Standard AI output tends to collapse into repetitive defaults" 같은 선언으로 시작하고, 그 편향을 **문자열 단위 금지 목록**으로 열거한다. `design-taste-frontend`는 실제 테스트에서 나온 실패 패턴을 8개 카테고리로 정리하고 위반 빈도 순위까지 표기한다("the #1 violated rule in production tests", "second-most-recurring AI-tell").

**지침 구체성**: **금지 규칙의 밀도가 4개 컬렉션 최고**이며, 일부는 다른 어디에도 없는 수준이다.
- `design-taste-frontend`가 프리미엄 소비재 브리프의 기본 팔레트를 **hex 17개 단위로 금지**하고 대안 7계열을 제시 — 4개 컬렉션에서 유일
- em-dash 전면 금지("binary: zero em-dashes")
- eyebrow 개수를 `≤ ceil(sectionCount / 3)`으로 **기계적으로 계산 가능하게** 규정
- `imagegen-frontend-web`이 선택 이력을 기록해 "동일 anchor 3연속 / 동일 background 4연속 / full-bleed 전무"를 **정량 거부 조건**으로 판정
- `imagegen-frontend-mobile`은 다이얼 19개 중 8개를 최대값 10으로 고정해 가독성·일관성을 타협 불가로 선언

**완성도**: 개별 스킬의 규칙 밀도는 높으나 **컬렉션 수준의 정합성이 가장 낮다.**
- 스타일 스킬 4개(`minimalist-ui` / `industrial-brutalist-ui` / `gpt-taste` / `high-end-visual-design`)가 **상호 배타적 미학**인데 description에 트리거 문구와 배타성 안내가 없어 동시 활성화 시 지침이 정면 충돌한다 (`minimalist-ui`는 그라디언트·`rounded-full` 금지, `high-end-visual-design`은 mesh gradient와 `rounded-full` 필수)
- `Inter` 판정이 갈린다 — 4개 스킬은 금지, `industrial-brutalist-ui`는 Macro 폰트로 허용
- `design-taste-frontend`(87KB)와 `design-taste-frontend-v1`(21KB)의 차이가 문서화되지 않았고, v1의 description은 v2를 "experimental"로 표기한다
- `image-to-code` / `imagegen-frontend-web` / `imagegen-frontend-mobile` 3개가 이미지 워크플로우를 광범위하게 중복한다

**실용성의 한계**: (a) **검증이 전부 자기 선언**이다. `design-taste-frontend`의 62항목 체크리스트가 4개 컬렉션 최대이지만 실행 가능한 검증은 Lighthouse 언급 하나뿐이다. (b) 이미지 생성 스킬 3개 모두 **도구 부재 시 폴백이 없다** (`imagegen-frontend-web`의 "한 장씩 렌더링" 처리만 예외). (c) 접근성이 스킬마다 비대칭이다 — `design-taste-frontend`는 WCAG AA/AAA와 reduced-motion을 비협상으로 두는데, `gpt-taste`·`industrial-brutalist-ui`는 접근성 지침이 전무하면서 필수 모션이나 전체 대문자를 요구한다. (d) 로테이션 규칙("previous project와 다른 팔레트를 쓸 것")은 LLM이 세션 간 기억 없이 지킬 수 없다.

---

### ui-ux-pro — 데이터와 스크립트로 품질을 검증하는 컬렉션

**디자인 철학**: "**지침은 산문이 아니라 조회 가능한 데이터이고, 준수는 스크립트가 검증한다.**" 7개 스킬 전부가 얇은 SKILL.md + 두꺼운 references/data/scripts 구조이며, 미학 판단이 CSV 열로 구조화된다. `design`의 `logo/styles.csv`는 스타일당 12열(Primary Colors / Typography / Effects / Best For / **Avoid For** / Complexity / Era)을 갖고, `ui-ux-pro-max`의 `colors.csv`는 팔레트당 19열(전경색 쌍 포함 + 조정 이력 Notes)을 갖는다.

**지침 구체성**: **접근성과 실무 규격에서 4개 컬렉션 최고**.
- `ui-ux-pro-max`가 접근성을 **우선순위 1 / CRITICAL**로 두고 25개 규칙에 WCAG 2.2 신규 기준(focus-not-obscured AA/AAA, dragging-alternative AA, web-target-size 24×24 CSS px AA, consistent-help A, redundant-entry A, accessible-authentication AA)을 **준수 레벨까지 명기**한다. 데이터셋의 결손("The Enhanced AAA criterion is not represented in the dataset")까지 밝힌다.
- 플랫폼 규격이 실측치다 — 배너 28개 규격, 소셜 8개, 터치 타깃 44pt(iOS)/48dp(Android) 플랫폼별 구분, 인쇄 300DPI/CMYK/3-5mm bleed
- `brand`의 타입 스케일이 **1.25 모듈러 비율**에서 계산된 6단(rem/px/weight/line-height)

**완성도**: **실행 가능한 검증이 4개 컬렉션에서 압도적 1위.**
| 스킬 | 검증 자산 |
|---|---|
| `ui-ux-pro-max` | 단위 테스트 **10개** + `validate_data.py` + 검색 관련성 평가기(baseline/thresholds fixtures) + **스택 데이터 최신성 테스트**(웹·데스크톱) + 데이터 계약 테스트 + `data-provenance.json` |
| `design-system` | 토큰 검증기 **3개**(`validate-tokens.cjs`, `slide-token-validator.py`, `html-token-validator.py`) + 스크립트 단위 테스트 |
| `brand` | `validate-asset.cjs`(네이밍/크기/포맷) + `extract-colors.cjs`(팔레트 대조) + 스크립트 테스트 |
| `design` | **보안 테스트**(`test_media_download_never_forwards_api_key`) + 소셜 사진의 **시각 검사 후 재내보내기 루프** |
| `ui-styling` | 스크립트 테스트 2개 + coverage |

그리고 `ui-ux-pro-max`는 사용 단계의 규율까지 갖는다 — 0 결과 프로토콜 3단계("**Never present a 0-result search as if it returned data**"), 검증 의무("Do not persist unverified output"), MASTER 보호("Never use `--force` without explicit user authorization"), 스택 추측 금지("Never assume a stack — a hardcoded default silently misroutes every recommendation").

**실용성의 한계**: (a) **스킬 간 기능 중복이 심각하다.** 슬라이드가 3곳(`slides` 마크다운 / `design` 마크다운 / `design-system` CSV+스크립트), 배너가 2곳(`banner-design` / `design`, **파일명까지 동일**)에 있고 동기화 방법이 없다. (b) **의존 스킬 6개가 컬렉션에 없다** — `frontend-design`, `ai-artist`, `ai-multimodal`, `chrome-devtools`, `assets-organizing`, `project-management`. 배너·소셜 사진 워크플로우가 단독 설치 시 실행되지 않는다. (c) **미학 지침이 가장 약하다.** "무엇이 아름다운가"에 대한 안티슬롭 카탈로그가 없어, 규격과 토큰을 지키면서도 진부한 결과가 나올 수 있다. (d) `Inter`를 기본값·예시로 쓰는데 같은 저장소의 taste-skills가 이를 금지한다. (e) `slides/references/create.md`가 4줄뿐이라 실제 절차가 없고, `design`의 "randomly invoke" 지시는 근거가 없다.

---

## 2. 비교표

| 축 | emilkowalski | garden-skills | taste-skills | ui-ux-pro |
|---|---|---|---|---|
| **지침 구체성** | ★★★★★ (모션) / ★★☆ (그 외) — easing/duration/spring/velocity 전부 수치 + 실행 가능 수식 3개. 단 타이포·컬러·스페이싱 지침은 거의 없음 | ★★★★☆ — 25개 앵커 레시피가 hex/px/ms 완비, 11+23개 테마 프로파일. 단 모션 수치는 얇음 | ★★★★★ (금지) / ★★★☆ (처방) — hex 17개 금지, 기계적 임계값 다수. 단 스킬 간 값이 상충 | ★★★★☆ — 규격·접근성·토큰은 최고, 미학 산문 지침은 최저 |
| **API 키 의존도** | ★★★★★ **12개 전부 불필요** | ★★★☆ — 5개 중 2개가 조건부 (`gpt-image-2` OPENAI_API_KEY Mode A만 / `web-video-presentation` TTS Phase 3만). 둘 다 **명시적 폴백 보유** | ★★★★☆ — 13개 전부 키 불필요. 단 이미지 스킬 3개가 이미지 생성 도구를 전제하며 **키·폴백이 미명시** | ★★☆ — `design`이 **GEMINI_API_KEY 필수**(로고/CIP/아이콘 3기능), `banner-design` 간접 의존, `design-system` Pexels/Unsplash 미명시. **폴백 없음** |
| **커버 범위** | ★★☆ — 웹/RN 모션 + Apple 디자인 + Swift. 타이포·컬러·레이아웃·브랜드·이미지 없음 | ★★★★☆ — 기사(HTML/PDF) + 웹 산출물 + 영상 프레젠테이션 + 이미지 생성 + 자료 검색. 앱 UI·브랜드 토큰 없음 | ★★★★☆ — 랜딩/포트폴리오/리디자인 + 4개 미학 + 브랜드 보드 + 웹·모바일 이미지 + Stitch. 앱 구현·데이터 시각화 없음 | ★★★★★ — 브랜드→토큰→구현→로고/CIP/아이콘/배너/슬라이드/소셜 + **22개 스택**(데스크톱 네이티브 6종 포함) + 접근성 |
| **즉시 사용 가능성** | ★★★★★ — 의존성 0, 게이트가 명확, 값이 복사 가능 | ★★★☆ — Node/npm/Vite 필요, Checkpoint 3개 정지, 중국어 문서 | ★★★★☆ — 대부분 프롬프트만으로 동작. 단 스타일 스킬 선택 판단이 사용자에게 남고 트리거가 불명확 | ★★☆ — 의존 스킬 6개 부재, `${CLAUDE_PLUGIN_ROOT}`/`~/.claude/skills` 경로 하드코딩, GEMINI 키 필요 |
| **결과물 품질 예측** | ★★★★★ (모션) — 게이트로 과잉을 막고 값이 고정되어 **재현성이 가장 높다**. 단 모션 외 영역은 이 컬렉션으로 커버 불가 | ★★★★☆ — 실행 검증(typecheck/build/browser)이 있어 **깨진 산출물이 나올 확률이 가장 낮다**. 테마가 미학의 하한선을 보장 | ★★★☆ — 금지 목록이 AI 티를 잘 막지만 **검증이 자기 선언뿐**이고 스킬 간 상충으로 결과가 갈릴 수 있음 | ★★★☆ — 규격·접근성·토큰 준수는 스크립트가 보장하나 **미적 완성도는 보장하지 않는다** |

---

## 3. 최종 추천

### 추천: **garden-skills**

**단일 컬렉션을 하나만 골라야 한다면 `garden-skills`다.** 근거는 취향이 아니라 세 가지 분석 지표다.

#### 근거 1 — 검증이 실행 가능한 유일한 컬렉션 (품질 하한선 보장)

4개 컬렉션의 검증 방식을 비교하면 결정적 차이가 드러난다.

| 컬렉션 | 검증 방식 | 산출물이 깨져 있을 때 |
|---|---|---|
| emilkowalski | 텍스트 체크리스트(10 표준 + 14 트리거 + Block/Approve) | **모델이 스스로 놓치면 통과** |
| taste-skills | 자기 선언 체크리스트 (최대 62항목) | **모델이 스스로 놓치면 통과** |
| ui-ux-pro | 스크립트 검증 (토큰·자산·데이터 품질) | 토큰 위반은 잡히지만 **시각·구조 결함은 통과** |
| **garden-skills** | **`npm run typecheck` / `build` / `npx tsc --noEmit` / 브라우저 acceptance / 원본 diff 대조** | **컴파일·빌드가 실패하면 진행 불가** |

`web-video-presentation`은 "`npx tsc --noEmit` 不通过禁止汇报'做完了'"(통과하지 않으면 완료 보고 금지)를 명시하고, `beautiful-article`은 원본과 diff 대조로 "**静默丢失只能 diff 抓到**"(조용한 정보 손실은 diff로만 잡힌다)를 방어한다. `web-design-engineer`는 사용자가 명시 요청할 때 브라우저 acceptance harness를 실행해 증거를 기록하고 실패를 수리한다. **다른 세 컬렉션은 "모델이 규칙을 지켰다고 선언하면 끝"인데, 이 컬렉션만 기계가 거부할 수 있다.**

#### 근거 2 — API 키 의존이 조건부이고 폴백이 설계되어 있다

`ui-ux-pro`의 `design`은 `GEMINI_API_KEY`가 없으면 로고·CIP·아이콘 3개 기능이 멈추고 **SKILL.md 수준의 대안 경로가 없다.** taste-skills의 이미지 스킬 3개는 이미지 생성 도구를 전제하면서 **도구 부재 시의 동작을 아예 규정하지 않는다.**

반면 garden-skills는 키 부재를 **1급 시민으로 취급한다.**
- `gpt-image-2`는 감지 스크립트(`check-mode.js`)로 Mode A(로컬 API)/B(호스트 도구 위임)/C(프롬프트 고문)를 판정하고, **각 모드의 행동을 표로 규정**한다. Mode C에서도 "재사용 가능한 고품질 프롬프트를 파일로 산출"하는 가치가 남고, "**不要假装出图成功**"(생성 성공을 가장하지 말 것)으로 거짓 보고를 금지한다.
- `web-video-presentation`은 Checkpoint Audio에서 합성 여부를 묻고, 미합성 시 Phase 3을 건너뛰어 **웹 프레젠테이션 산출물은 손상되지 않고 녹화 방식만 Manual로 바뀐다.** 무료 경로(edge-tts, macOS `say`)도 명시한다.
- 나머지 3개(`beautiful-article`, `web-design-engineer`, `kb-retriever`)는 키가 **완전히 불필요**하다.

#### 근거 3 — 커버 범위가 넓으면서 스킬 간 충돌이 없다

5개 스킬이 산출물 형식으로 명확히 분리된다 — 읽는 기사(`beautiful-article`) / 보는·조작하는 웹(`web-design-engineer`) / 재생·녹화되는 영상(`web-video-presentation`) / 래스터 이미지(`gpt-image-2`) / 입력측 검색(`kb-retriever`). 그리고 `web-design-engineer`의 description이 **명시적으로 형제 스킬로 라우팅**한다 — "Not for ... source-to-longform article conversion, or narration-driven click-through video presentations. **Route the last two to their dedicated skills**."

이는 taste-skills의 문제와 정반대다. taste-skills는 스타일 스킬 4개가 상호 배타적 미학인데 트리거가 없어 동시 활성화 시 `rounded-full`이 필수(`high-end-visual-design`)이면서 금지(`minimalist-ui`)이고 radius가 0(`industrial-brutalist-ui`)인 모순이 발생한다. ui-ux-pro는 슬라이드가 3곳·배너가 2곳(파일명 동일)에 중복되고 정본이 불명확하다. emilkowalski도 `emil-design-eng`가 `animate`+`review-animations`의 통합본으로 중복이지만, description에 트리거가 없어 실질적으로 사문화된 상태라 피해가 작다.

#### 대조: 각 컬렉션이 최종 추천에서 밀리는 이유

- **emilkowalski**: 모션 도메인에서는 4개 컬렉션 중 유일하게 대체 불가한 수준이다. 그러나 **커버 범위가 모션에 국한**되어 단독으로 디자인 작업을 완결할 수 없다. 타이포그래피·컬러·스페이싱·레이아웃·브랜드 지침이 거의 없고(`apple-design`의 §15 타이포그래피가 예외), 산출물이 코드 조각이다. **단독 컬렉션이 아니라 필수 보완재로 써야 한다.**
- **taste-skills**: 안티슬롭 카탈로그는 4개 컬렉션 최고이며 `design-taste-frontend`는 개별 스킬 중 가장 정교하다. 그러나 (a) 검증이 전부 자기 선언, (b) 스타일 스킬 4개의 상호 모순, (c) 이미지 스킬 3개의 폴백 부재, (d) 세션 간 로테이션 규칙의 실행 불가능성, (e) `Inter` 등 값 판정의 컬렉션 내 불일치가 겹친다. **개별 스킬을 골라 쓰기에는 최상급이지만 컬렉션으로서는 정합성이 낮다.**
- **ui-ux-pro**: 실행 검증 인프라와 접근성 커버는 4개 컬렉션 최고이며 `ui-ux-pro-max`는 개별 스킬 중 가장 견고하다. 그러나 (a) **의존 스킬 6개가 없어 절반의 워크플로우가 단독 실행 불가**, (b) `GEMINI_API_KEY` 폴백 부재, (c) 슬라이드 3중·배너 2중 중복, (d) **미학 지침이 가장 약해** 규격을 지키면서도 진부한 결과가 나올 수 있다. **참조 엔진(`ui-ux-pro-max`)으로서는 최상이지만 컬렉션으로는 미완이다.**

#### 실무 권고: garden-skills를 기반으로 3개를 보완재로

분석 결과 가장 합리적인 조합은 **단일 컬렉션이 아니라 역할 분담**이다.

```
기반 (프로세스 + 검증)   → garden-skills
모션 판단이 필요할 때     → emilkowalski (animate / review-animations / apple-design)
AI 티 제거가 필요할 때    → taste-skills (design-taste-frontend / redesign-existing-projects)
접근성·스택·팔레트 조회   → ui-ux-pro (ui-ux-pro-max)
```

특히 **garden-skills + emilkowalski**의 조합은 공백이 정확히 맞물린다. garden-skills의 테마 프로파일과 앵커 레시피는 모션 수치가 얇고("动画要舒服 + 炫酷" 수준), emilkowalski는 모션 외 지침이 없다. 다만 **적용 대상을 구분해야 한다** — emilkowalski는 "UI 모션 300ms 이하 / 100+/day는 모션 금지"이고 `taste-skills`·`garden-skills`의 마케팅 페이지 지침은 700–800ms 스크롤 모션을 요구한다. 제품 UI에는 전자, 마케팅 페이지에는 후자다.

---

## 4. 용도별 추천

### 랜딩 페이지 / 마케팅 사이트
**1순위: `garden-skills/web-design-engineer`**
- 7단계 + Checkpoint 3개 + 25개 앵커 레시피(hex/px/ms 완비) + 조건부 브라우저 acceptance
- Asset Protocol이 브랜드 작업의 실패 원인을 정확히 지목("**Logo is non-negotiable** ... the #1 way branded work fails") 하고 로고 확보 실패 시 정지시킨다
- 클리셰 표가 `Pattern / Why it's slop / When it's actually fine` 3열로 **조건부 금지**를 제공 — 무조건 금지가 아니라 예외 경로가 있다

**2순위: `taste-skills/design-taste-frontend`**
- 금지 규칙의 정교함이 최고 — 프리미엄 소비재 hex 17개 금지, eyebrow ≤ceil(N/3), zigzag ≤2연속, em-dash 0
- §0 브리프 추론 + 다이얼 추론표 + §2 실제 공식 디자인 시스템 13개 매핑
- **단** 검증이 자기 선언이고 87KB가 매번 로드된다

**보완: `emilkowalski/animate`** (모션 값 확정), **`ui-ux-pro/ui-ux-pro-max`** (접근성 감사, 팔레트 조회)

**비추천**: `gpt-taste`(접근성 전무 + 필수 GSAP + `ease-in-out` 근거 없는 금지), `minimalist-ui`/`industrial-brutalist-ui`(단일 미학 고정 + 다크모드·반응형 지침 부재)

---

### 모션 / 인터랙션
**1순위: `emilkowalski` — 대체재 없음**
- 신규 구현 → `animate` (7단계, 게이트 2개, 14개 레시피)
- React Native/Expo → `animate-expo` (스레드 규율, 햅틱 3대 절대 규칙, 실기기 검증 요구)
- diff 비평 → `review-animations` (10 표준 + 14 트리거 + 9단 처방 계층 + Block/Approve)
- 코드베이스 감사 → `improve-animations` (8 카테고리 + severity 3단 + `impact ÷ effort` + 자기완결 계획서)
- 제스처 물리·수식 → `apple-design` (momentum projection / rubber-banding / velocity 정규화)
- 용어 확인 → `animation-vocabulary`

**근거**: 다른 3개 컬렉션의 모션 지침은 (a) 값이 없거나(`garden-skills`의 테마 프로파일), (b) 단일 곡선으로 고정되거나(`minimalist-ui`의 `cubic-bezier(0.16, 1, 0.3, 1)` 하나), (c) 정지 이미지라 실효가 없다(`imagegen-*`의 "not coding instructions"), (d) 클래스명만 있거나(`slides`의 `animate-*`), (e) GSAP 프리셋 조회에 그친다(`ui-ux-pro-max`의 17개). **빈도 게이트로 "모션을 넣지 않는 판단"을 제공하는 것은 emilkowalski뿐이다.**

**주의**: `emilkowalski`의 300ms 상한은 **제품 UI 기준**이다. 마케팅 페이지의 스크롤 연출에 그대로 적용하면 과도한 제약이 된다.

---

### 브랜드 아이덴티티
**1순위: `ui-ux-pro/brand` + `ui-ux-pro/design-system` 조합**
- `brand`가 `docs/brand-guidelines.md` → `design-tokens.json` → `design-tokens.css`의 **3층 전파를 실행 가능한 스크립트로** 구현한다 (4개 컬렉션에서 유일)
- `inject-brand-context.cjs`로 브랜드 컨텍스트를 다른 스킬 프롬프트에 주입 — 스킬 간 데이터 전달을 스크립트로 구현한 유일한 사례
- `validate-asset.cjs` / `extract-colors.cjs`로 자산·팔레트 준수를 자동 검증
- `design-system`이 3층 토큰 아키텍처 + 3개 검증기 + 단위 테스트

**로고·CIP가 필요하면: `ui-ux-pro/design`**
- 로고 55스타일 × 30팔레트(각 5 hex + 심리 + Best/Avoid For) × 25산업
- **CIP 50개 산출물** — 4개 컬렉션에서 기업 아이덴티티 프로그램을 다룬 유일한 스킬
- 아이콘을 **SVG 텍스트 생성**(`gemini-3.1-pro-preview`)으로 만들어 이미지 모델의 텍스트 한계를 우회
- **단 `GEMINI_API_KEY` 필수이고 폴백이 없다**

**컨셉 보드만 필요하면: `taste-skills/brandkit`**
- 의미 우선 접근(9개 전략 추론 → 5개 질문 게이트 → 카테고리별 심볼 로직 → 5개 로고 컨셉 방법, 최대 2개 조합)
- 참조 사용 윤리를 가장 명확히 규정("Use references as **quality training, not as templates**" + 복사 금지 5항목)
- **단 실행 경로(어떤 도구로 생성)가 전혀 규정되지 않았고 검증 장치가 없다**

**비추천 조합**: `brandkit`(이미지 보드) → `brand`(문서+토큰) 흐름이 자연스럽지만 **상호 참조가 없고 산출물 형식이 달라** 수동 변환이 필요하다.

---

### 이미지 생성
**1순위: `garden-skills/gpt-image-2`**
- **3모드 감지(A/B/C)로 환경 차이를 흡수하는 유일한 스킬.** 키가 없어도 Mode C에서 프롬프트를 파일로 산출해 가치가 남는다
- 18개 분류 × 80여 템플릿, 각 템플릿이 `must_keep`/`avoid` 쌍 + 파라미터 3분류(必问/可默认/可随机) + 자동 보완 전략
- 프롬프트 낙반 의무화 + 타임스탬프 네이밍으로 재현성 확보
- `technical-diagrams`가 "PNG 위 SVG 아님"을 경고하고 대안(mermaid/draw.io/excalidraw/Figma)을 제시하는 정직함

**웹 시안이 목적이면: `taste-skills/imagegen-frontend-web`**
- 섹션당 1이미지 강제 + 12개 선택 축 + **정량 거부 조건**(anchor 3연속/background 4연속/full-bleed 전무)
- 브리프 → 조작 매핑표 7케이스가 4개 컬렉션에서 가장 정교한 어휘 번역
- **단 비용 하한이 6~8장으로 고정되고 확인 절차가 없다**

**배너·소셜이 목적이면: `ui-ux-pro/banner-design`**
- **텍스트를 이미지 생성에 맡기지 않고 HTML 오버레이 후 스크린샷** — 이미지 모델의 텍스트 한계를 구조적으로 회피한 유일한 설계
- 28개 플랫폼 규격 + 안전영역 70-80% + 4.5:1 대비 + Meta 텍스트 20% 정책
- **단 의존 스킬 5개가 컬렉션에 없어 단독 실행 불가**

**비추천**: `taste-skills/imagegen-frontend-mobile`(검증 27항목은 최다이나 후속 코드 경로가 컬렉션 내에서 끊긴다), `image-to-code`(이미지 생성 도구 부재 시 폴백 없음)

---

### 기존 사이트 개선 / 리디자인
**1순위: `taste-skills/redesign-existing-projects`**
- **증상 → 처방 100여 쌍**이 4개 컬렉션에서 가장 실용적인 지침 형식
- **Fix Priority 7단계가 임팩트/리스크 비율로 정렬**된 유일한 사례 ("Font swap — biggest instant improvement, lowest risk" → "Polish typography — the premium final touch")
- 안전 규칙 6개(스택 유지 / 기능 파괴 금지 + 매 변경 후 테스트 / 의존성 파일 확인 / Tailwind 버전 확인 / 작고 검토 가능한 변경)
- **접근성 항목이 taste-skills 내 최다** (focus ring "not optional", alt text, skip-link, 시맨틱 HTML)
- 광학적 판단을 명문화("Mathematical alignment that looks optically wrong ... 1-2px optical adjustments")

**2순위: `garden-skills/web-design-engineer` + `references/redesign-protocol.md`**
- Extension / Redesign·Preserve / Redesign·Overhaul 3분류 + 보호 계약 감사
- "New elements in Extension mode should be **indistinguishable from the originals**"

**3순위(모션 한정): `emilkowalski/improve-animations`**
- 코드베이스 감사 → severity 3단 → `impact ÷ effort` 정렬 → `plans/NNN-*.md` 자기완결 계획서 → `execute`가 `review-animations`로 검증
- **계획을 파일로 남기고 커밋 스탬프 + `reconcile`로 표류를 관리하는 유일한 스킬**

---

### 프레젠테이션 / 슬라이드
**1순위: `ui-ux-pro/design-system`의 슬라이드 시스템**
- 8개 CSV 의사결정 DB + BM25 검색(`--position`/`--total`/`--prev-emotion` 문맥 파라미터)
- **감정을 색 파라미터로 매핑**(`slide-color-logic.csv`: frustration → dark-surface/minimal accent, hope → accent-bleed/full-bleed)
- Duarte Sparkline의 패턴 브레이크를 **1/3·2/3 위치로 계산**
- 5단계 흐름의 마지막이 `slide-token-validator.py` 검증
- **3중 중복 중 유일하게 검색·생성·검증 스크립트를 갖춘 정본**

**대안(영상형): `garden-skills/web-video-presentation`**
- 16:9 무 chrome 스테이지 + step 구동 + `?auto=1` 원테이크 녹화 + TTS 음영상 동기
- 23개 테마 + 토큰 강제(색·폰트 하드코딩 금지) + 장별 `tsc --noEmit`

**비추천**: `ui-ux-pro/slides` — `references/create.md`가 4줄뿐이라 절차가 없고, `design-system`의 CSV·검증 스크립트를 언급조차 하지 않는다. `design`의 슬라이드 참조 6개도 같은 지식의 마크다운 사본이다.

---

### 문서 / 기사 / 리포트
**단독 1순위: `garden-skills/beautiful-article`**
- 4개 컬렉션에서 **읽히는 장문 산출물을 다루는 유일한 스킬**
- 정보 보존율을 100/80–90/60–70/50/40/25/20%로 등급화하고 타입에 바인딩해 의사 조합(`longform + 20%`)을 구조적으로 차단
- 11개 테마 프로파일이 각각 배판·Raw·미디어·코드·**금지 항목**을 규정
- 노드별 차별화된 검수 프로토콜 6종 + 원본 diff 대조 + typecheck/build
- 단일 HTML(오프라인 개방) + 선택적 PDF(`html-to-pdf.sh`, npm 의존 0)

**보완: `garden-skills/kb-retriever`** — 자료 검색·추출(컨텍스트 절약형 점진 검색). 단 `beautiful-article`의 Phase 1과 도구 체인이 다르고 상호 참조가 없다.

---

### 접근성 감사
**1순위: `ui-ux-pro/ui-ux-pro-max` — 대체재 없음**
- 접근성을 **우선순위 1 / CRITICAL**로 둔 유일한 스킬
- 25개 규칙에 **WCAG 2.2 신규 기준 + 준수 레벨(A/AA/AAA) 명기**
- 검색 순서 규정("semantic outcome → component domain → stack", 역순 금지)
- 데이터셋 결손까지 명시("Enhanced AAA criterion is not represented")
- `pro-rules.md`가 네이티브/모바일 앱 전용 사전 배포 체크리스트

**2순위: `taste-skills/design-taste-frontend`** — WCAG AA/AAA 수치 + 버튼·폼 대비 감사 mandatory + reduced-motion 비협상 + reduced-transparency 폴백 + Core Web Vitals

**3순위: `taste-skills/redesign-existing-projects`** — focus ring, alt text, skip-link, 폼 검증을 증상→처방으로

---

## 5. 개별 스킬 추천 Top 5

컬렉션 무관하게, **분석 근거(지침 구체성 / 검증 장치 / 의존성 부담 / 대체 불가능성)**로 선정했다.

### 1위 — `ui-ux-pro/ui-ux-pro-max`
**선정 근거**: 4개 컬렉션 37개 스킬 중 **자기 지식의 품질을 코드로 검증하는 유일한 스킬**이다.
- 데이터 3,061줄(13 CSV) + 스택 1,283줄(22 CSV) — 규모 1위
- **단위 테스트 10개** + `validate_data.py` + 검색 관련성 평가기(baseline/thresholds) + **스택 데이터 최신성 테스트**(웹·데스크톱 각각) + 데이터 계약 테스트
- 접근성을 우선순위 1 CRITICAL로 두고 WCAG 2.2를 레벨까지 명기
- 사용 규율까지 규정 — 0 결과 프로토콜("Never present a 0-result search as if it returned data"), 검증 의무, MASTER 보호("Never use `--force` without explicit user authorization"), 스택 추측 금지
- 다이얼 3개가 **실제로 CSS 변수 테이블과 GSAP 스니펫을 치환**한다 (프롬프트 해석에 의존하지 않음)
- API 키 불필요 + 외부 의존성 0 (Python 3.x만)
- `data-provenance.json`으로 출처 기록, 데이터 결손 명시

**한계**: 미학 지침이 없어 단독으로 "아름다운" 결과를 만들지 못한다. 참조 엔진으로 써야 한다.

---

### 2위 — `garden-skills/web-design-engineer`
**선정 근거**: **미학 처방과 실행 검증을 모두 갖춘 유일한 웹 산출물 스킬**이다.
- 25개 앵커 레시피가 hex/px/ms/cubic-bezier를 완비하고 "Avoid" 목록으로 마감 (`linear.md`: `#08090A` ground, accent `<5% of pixels`, radius "Never above 16", hover 150ms / layout 350–450ms)
- 6개 학파 × 3선택 대화(같은 행에서 3개 뽑기 금지)로 방향 없는 요청을 처리
- **Asset Protocol** — 브랜드 인지도 기여도로 애셋을 서열화하고 hex를 "the cheapest part of the identity"로 강등, 로고 확보 실패 시 정지
- 안티클리셰를 "미적 우월감이 아니라 브랜드 인지 보호"로 정당화하고 3단 추론 제시 + 유일한 예외("the brand spec uses it")를 명시
- 조건부 브라우저 acceptance harness (수리 루프 + 증거 기록) + 17항목 사전 배포 체크리스트 + 5차원 0–10 크리틱
- 검증 비용을 사용자 의도에 연동("Do not infer this request merely from \"build,\" \"finish,\" \"polish\"")
- 형제 스킬로 명시 라우팅
- API 키 불필요, 문서가 영어

**한계**: WCAG 대비 수치가 없고 크리틱 5차원에 접근성 차원이 없다.

---

### 3위 — `emilkowalski/animate` (+ `review-animations` 쌍)
**선정 근거**: **"만들지 않는 판단"을 제공하는 유일한 스킬**이며, 그 판단이 수치로 조작화되어 있다.
- 2단 게이트가 코드 0줄을 정답으로 인정 — "produce zero lines of code sometimes. That's a success, not a dodge"
- 빈도 테이블이 판단 여지를 제거("Keyboard-initiated actions are **a disqualifier, not a judgment call**")
- 값이 전부 고정 — easing 3토큰, duration 5단 + 300ms 상한, spring 2프리셋, stagger 30–80ms, scale 0.9–0.97
- Never Ship 13행이 `review-animations`의 자동 블록 기준과 **동일해** 생성-검증 기준이 동기화됨
- `review-animations`의 **9단 처방 계층**이 "무엇을 고칠지"가 아니라 "어떤 종류의 수정이 더 좋은 수정인지"를 서열화하고 **1순위를 삭제**로 둔다 — 4개 컬렉션에서 유일
- 판정 불가능한 감각을 억지로 수치화하지 않고 검증 절차로 이송("play it at 2–5× duration ... look again the next day with fresh eyes")
- API 키·스크립트 불필요, 즉시 사용 가능

**한계**: 모션 외 영역 지침이 없다. RN 코드에 `review-animations`를 적용하면 오탐이 발생한다.

---

### 4위 — `taste-skills/design-taste-frontend`
**선정 근거**: **AI 산출물의 실패 패턴을 경험적 근거와 함께 가장 정교하게 차단한다.**
- 실제 테스트 결과를 지침으로 편입하고 위반 빈도 순위를 표기 — "the #1 violated rule in production tests"(eyebrow), "the single most-tested AI tell"(serif), "second-most-recurring AI-tell"(beige palette), "the #1 visual Tell"(em-dash), "the #1 LLM-design Tell"(div fake screenshot)
- **hex 17개 단위 팔레트 금지 + 대안 7계열** — 4개 컬렉션에서 유일
- 금지를 **기계적으로 셀 수 있게** 만듦 — em-dash 0, eyebrow ≤ceil(N/3), zigzag ≤2연속, 레이아웃 패밀리 ≥4/8섹션, 마퀴 ≤1, 인용 ≤3줄, nav ≤80px, 서브텍스트 ≤20단어
- "모든 규칙은 맥락적"이라는 메타 원칙 + 거의 모든 금지에 **Override 경로**
- 13개 공식 디자인 시스템 매핑 + Apple Liquid Glass의 정직한 처리("There is no official `liquid-glass.css`")
- GSAP 정본 스켈레톤 2개(흔한 실패 `start: "top center"` → `"top top"` 지목) + 경량 대안
- 리디자인 프로토콜 6단계 + "SEO migration is the #1 redesign risk"
- 62항목 Pre-Flight Check, API 키 불필요

**한계**: Block Library(§12)가 스키마만 있고 **실제 파일이 없다.** 로테이션 규칙이 세션 간 실행 불가. 87KB가 매번 로드된다. em-dash 전면 금지는 Override가 없는 유일한 규칙으로, 다국어·출판 스타일과 충돌한다.

---

### 5위 — `garden-skills/beautiful-article`
**선정 근거**: **읽히는 장문 산출물을 다루는 유일한 스킬**이며, 검증 설계가 가장 정교하다.
- 정보 보존율 7등급 + 타입 바인딩으로 의사 조합 차단, 각 등급에 正文/Raw 비율까지 지정
- 11개 테마 프로파일이 사조·인물 이름(Tufte, Vignelli, Knuth, Bodoni, Bayer, Fuller, Sottsass)에 묶여 배판·Raw·미디어·코드·**금지 항목**을 각각 규정
- **노드별 차별화된 검수 프로토콜 6종** — SubAgent 개방 여부와 파일 작성 여부를 노드마다 지정하고 각각 이유를 명시. 검증 비용을 설계 변수로 다룬 유일한 사례
- **원본 diff 대조**로 조용한 정보 손실 탐지("静默丢失只能 diff 抓到")
- `npm run typecheck`/`build` + 커버 5항목 자체점검 + 3시점 종심 + 레드라인 8항목
- **결정 수집 철칙** — "禁止静默替用户选择"(사용자 선택을 조용히 대신하지 말 것), 추천은 가능하나 대신 결정은 금지, 항목별 개별 응답 요구
- "拿到任何质检结论 —— 先按 fail 项把产出改完" (검수 결과를 받으면 먼저 고치고 나서 보고, 그러지 않으면 **违规**)
- 단일 HTML(오프라인) + 선택적 PDF, API 키 불필요

**한계**: 문서가 중국어. `reacticle` npm 패키지에 `"latest"`로 종속. 테마 프로파일의 상세판(`canonicalRuntimeMd`)이 스킬 폴더 밖에 있다. Checkpoint 3개 × 8개 결정으로 자동화와 상충.

---

### 차점 (Top 5에 넣지 않은 이유)

| 스킬 | 강점 | 제외 이유 |
|---|---|---|
| `emilkowalski/apple-design` | 실행 가능한 수식 3개, Apple 출하값, 재질·타이포 지침 | **게이트가 없어** 단독 사용 시 과잉 모션으로 흐를 위험. `animate`와 병행이 전제 |
| `taste-skills/redesign-existing-projects` | 증상→처방 100여 쌍, Fix Priority 7단계 | 검증 장치 없음, 진단 결과 산출 형식 미규정, 취향이 중립적 표현 뒤에 은폐됨 |
| `ui-ux-pro/design-system` | 3층 토큰 + 검증기 3개 + 8 CSV 의사결정 DB | 두 기능(토큰/슬라이드) 혼재, 슬라이드가 3중 중복의 일부, Pexels/Unsplash 키 미명시 |
| `garden-skills/gpt-image-2` | 3모드 감지, 80여 템플릿, 폴백 설계 | 생성 이미지 검증 장치 없음, 학술 도판 데이터 위조를 프롬프트 금지로만 방어 |
| `emilkowalski/improve-animations` | 계획서 파일화 + 커밋 스탬프 + reconcile + execute→review 루프 | 웹 CSS 전제로 RN에 부적합, frequency map의 구조적 불확실성 |

---

## 6. 비추천 / 주의

### A. 중복으로 인해 정본이 불명확한 스킬

| 스킬 | 중복 상황 | 권고 |
|---|---|---|
| **`ui-ux-pro/slides`** | 슬라이드 지식이 3곳에 존재 — 이 스킬(마크다운 5개) / `design`(마크다운 6개, 접두사만 다름) / `design-system`(CSV 8개 + 스크립트 5개). `references/create.md`가 **4줄**뿐이라 절차가 없고, CSV·검증 스크립트를 언급조차 하지 않는다. `create.md`가 "Invoke `slides` skill"이라고 쓰여 자기 참조 순환이다 | **`design-system`의 슬라이드 시스템을 쓸 것.** 이 스킬은 사실상 껍데기 |
| **`taste-skills/design-taste-frontend-v1`** | description이 스스로 "The current default is `design-taste-frontend` (v2)"이며 "Use this v1 install name **only if** you need exact backward compatibility"라고 명시. v1→v2 차이표가 없다 | **하위 호환이 필요한 기존 프로젝트에만.** 신규 작업은 v2 |
| **`emilkowalski/emil-design-eng`** | `animate` Step 1·2, easing 토큰, duration 표, spring 프리셋, stagger, Review Checklist가 `animate`·`review-animations`와 광범위 중복. description에 **트리거 문구가 없어** 언제 켜지는지 불명확. 초기 호출 시 유료 강좌 링크를 고정 출력 | **`animate` + `review-animations`를 쓸 것.** 예외: `clip-path` 5기법과 Sonner 설계 회고가 필요할 때 |
| **`ui-ux-pro/banner-design` ↔ `design`** | `banner-sizes-and-styles.md`가 **같은 파일명으로 두 곳에** 존재하며 동기화 방법이 없다. description도 배너 트리거를 공유 | 배너 전용 작업은 `banner-design`(4.5:1 대비 등 규칙이 더 완전). `design`의 압축판은 접근성 규칙이 누락됨 |

---

### B. API 키 없이는 핵심 기능이 멈추는 스킬

| 스킬 | 필요 키 | 폴백 | 주의 |
|---|---|---|---|
| **`ui-ux-pro/design`** | **`GEMINI_API_KEY`** (필수, 로고/CIP/아이콘 3기능) + `ATLASCLOUD_API_KEY`(선택) | **SKILL.md 수준 폴백 없음.** 스크립트가 에러 메시지만 출력 | 키 없으면 이 스킬의 **핵심 3기능이 전부 정지**. `pip install google-genai pillow` 필요 |
| **`ui-ux-pro/banner-design`** | Gemini(간접) | 없음 | SKILL.md에 키 이름조차 없다. 게다가 **의존 스킬 5개가 컬렉션에 없어** Step 3·4가 실행 불가 |
| **`garden-skills/web-video-presentation`** | TTS: MiniMax API key(기본) / `OPENAI_API_KEY` / `ELEVENLABS_API_KEY` | ✅ **명시적** — Checkpoint Audio에서 미합성 선택 시 Phase 3 생략, 웹 산출물은 손상 없음. 무료 경로(edge-tts, macOS `say`) 제시 | 기본 제공자가 MiniMax(별도 CLI 설치+로그인)라 **첫 실행 실패 가능성이 높다.** `PRESENTATION_TTS=openai`로 전환 권장 |
| **`garden-skills/gpt-image-2`** | `OPENAI_API_KEY` (Mode A만) | ✅ **가장 잘 설계됨** — 감지 스크립트로 A/B/C 판정, Mode C는 프롬프트 산출로 가치 유지 | `ENABLE_GARDEN_IMAGEGEN` **이중 게이트**가 있어 키만 넣어도 Mode A로 안 간다 |
| **`ui-ux-pro/design-system`** | Pexels/Unsplash (`fetch-background.py`) | 없음 | **환경변수 이름·발급 방법이 원문에 전혀 없다.** 키 없이 동작하는지도 불명확 |
| **`ui-ux-pro/ui-ux-pro-max`** | `GOOGLE_FONTS_API_KEY` (**`--live` 갱신 시만**) | 일반 사용에는 불필요 | 실질적 부담 없음. 키 부재 에러가 **테스트로 검증**되어 있다 |

**이미지 생성 도구를 전제하지만 키·폴백이 미명시된 스킬 (실질적 위험)**
- `taste-skills/image-to-code` — "when image generation is available" 조건만 반복하고 **없을 때의 워크플로우가 없다**
- `taste-skills/imagegen-frontend-web` — 이미지 생성 자체가 불가한 환경의 폴백 없음 (한 장씩 렌더링 폴백만 존재)
- `taste-skills/imagegen-frontend-mobile` — 폴백 **전무**
- `taste-skills/brandkit` — 이미지 생성 스킬인데 **도구·키·폴백이 전혀 규정되지 않았다**

---

### C. 지침이 모호해 효과가 낮을 것으로 보이는 스킬

| 스킬 | 문제 | 근거 |
|---|---|---|
| **`ui-ux-pro/slides`** | **금지 규칙과 검증 장치가 모두 없는 유일한 스킬**. 명령형 경고문이 하나도 없다 | 4개 참조 파일 + SKILL.md 전체에 "Do not"/"Never"/"Avoid"가 등장하지 않음 |
| **`taste-skills/gpt-taste`** | "Python 랜덤화"가 실제 실행이 아니라 **모델의 자기 선언**이다. `<design_plan>` 5항목이 유일한 검증인데 "Prove mathematically that your grid ... leave zero empty spaces"도 텍스트 주장에 그친다. Hero 옵션 1에 "(Highly Preferred)"를 붙여 랜덤화 취지와 모순 | 접근성 지침 **전무**(포커스·대비·reduced-motion 없음)인데 GSAP pin/scrub/scale을 필수화. `ease-in-out` 금지에 근거 없음 |
| **`taste-skills/minimalist-ui` / `industrial-brutalist-ui`** | 처방은 구체적이나 **다크모드·반응형·접근성 지침이 전무**. description에 트리거가 없어 형제 스킬과 동시 활성화 시 모순 | `minimalist-ui`: 라이트 팔레트 고정, 브레이크포인트 없음, 모든 블록에 스크롤 애니메이션 요구하면서 reduced-motion 없음. `industrial-brutalist-ui`: 전체 대문자 + 10–14px + 스캔라인·노이즈 오버레이 조합이 가독성과 상충하는데 경고 없음 |
| **`ui-styling`의 Canvas 층** | 지침이 감각어를 감각어로 설명한다 — "Product of countless hours", "From absolute top of field", "Proves undeniable expertise", "Could be displayed in museum". **PDF/PNG 산출 메커니즘이 전혀 규정되지 않았다** | `canvas-fonts` 사용법도 모순 — 폰트 54개가 이미 로컬에 있는데 "Download needed fonts"라고 지시 |
| **`taste-skills/brandkit`** | 최종 산출 기준 9항목이 목표 서술이고 **검증 절차가 없다.** 생성 이미지의 텍스트 정확성·표절 여부를 확인하는 단계가 전혀 없다 | "copied famous marks" 금지를 프롬프트로만 방어. 8개 Visual Mode 중 6개가 다크로 밝은 소비자 브랜드 커버가 얇다 |
| **`taste-skills/full-output-enforcement`** | 디자인 지침이 없고 **다른 스킬과의 조합 방법이 원문에 없다.** `// TODO` 금지가 정당한 미구현(사용자 결정 대기 등)까지 막는데 대안이 없다 | 보조 스킬로 설계되었으나 어느 스킬과 어떻게 함께 켜는지 미규정 |

---

### D. 컬렉션 간 함께 쓸 때 충돌하는 지침 (실무 주의)

| 충돌 항목 | A 입장 | B 입장 | 판단 기준 |
|---|---|---|---|
| **`Inter` 폰트** | `ui-ux-pro/brand`·`slides`·`ui-styling`이 **기본값·예시로 사용** | `taste-skills` 4개(`minimalist-ui`, `gpt-taste`, `high-end-visual-design`, `stitch-design-taste`, `design-taste-frontend`)가 **명시 금지**. `industrial-brutalist-ui`는 Macro 폰트로 허용 | 브랜드 스펙이 지정했으면 사용, 기본값 회피가 안전 |
| **Google Fonts `<link>` 로딩** | `ui-ux-pro/brand`가 "**(recommended)**" | `taste-skills/design-taste-frontend`가 "**Never link Google Fonts via `<link>` in production**" | 프로덕션은 `next/font` 또는 셀프 호스팅 |
| **모션 지속시간** | `emilkowalski`: "UI animations stay under **300ms**", 100+/day는 모션 금지 | `high-end-visual-design`: `duration-700` + 800ms 진입. `gpt-taste`: 필수 GSAP + `duration-700` | **제품 UI = emilkowalski / 마케팅 페이지 = taste-skills.** 원문들이 이 구분을 하지 않으므로 사용자가 판단해야 함 |
| **`ease-in-out`** | `emilkowalski`: "Moving / morphing on screen → **`ease-in-out`**" (권장) | `high-end-visual-design`: "Banned Motion: Standard `linear` or **`ease-in-out`** transitions" | emilkowalski가 근거를 제시하므로 우선 |
| **CSS transition vs spring (제스처)** | `emilkowalski/animate`: transition을 최우선 도구로 | `emilkowalski/apple-design`: "**Avoid CSS transitions and `@keyframes` for anything gesture-driven**" | **손가락이 관여하는가**로 구분 (동일 컬렉션 내 구분 기준이 명시됨) |
| **미니멀리즘** | `minimalist-ui`: ultra-minimalist 강제 | `imagegen-frontend-mobile`: "**Simplicity is not the goal by itself. Cleanliness is the goal.**" / "not always simple, always clean" | 대상이 달라(웹 코드 vs 앱 이미지) 실무 충돌은 낮음 |
| **플레이스홀더 이미지** | `taste-skills` 다수 + `ui-ux-pro/design`이 `picsum.photos` 권장 | `garden-skills/web-design-engineer` Asset Protocol: 실물 자산 없으면 **정지하고 사용자에게 요청**, "Don't substitute CSS silhouettes / hand-drawn SVG for real product imagery" | 브랜드 작업은 후자, 시안·프로토타입은 전자 |

---

## 7. 요약 보고

### 컬렉션별 분석 개수

| 컬렉션 | 스킬 수 | 분석 파일 |
|---|---|---|
| `emilkowalski` | **12** | `skill-analysis/emilkowalski/*.md` |
| `garden-skills` | **5** | `skill-analysis/garden-skills/*.md` |
| `taste-skills` | **13** | `skill-analysis/taste-skills/*.md` |
| `ui-ux-pro` | **7** | `skill-analysis/ui-ux-pro/*.md` |
| **합계** | **37** | |

**emilkowalski (12)**: animate, animate-expo, animation-vocabulary, apple-design, ask-sonner, emil-design-eng, find-animation-opportunities, improve-animations, pick-ui-library, prototype, review-animations, write-swift

**garden-skills (5)**: beautiful-article, gpt-image-2, kb-retriever, web-design-engineer, web-video-presentation

**taste-skills (13)**: brandkit, design-taste-frontend, design-taste-frontend-v1, full-output-enforcement, gpt-taste, high-end-visual-design, image-to-code, imagegen-frontend-mobile, imagegen-frontend-web, industrial-brutalist-ui, minimalist-ui, redesign-existing-projects, stitch-design-taste

**ui-ux-pro (7)**: banner-design, brand, design, design-system, slides, ui-styling, ui-ux-pro-max

---

### API 키가 필요한 스킬 목록

#### 필수 (키 없으면 핵심 기능 정지, 폴백 없음)
| 스킬 | 환경변수 | 영향 범위 |
|---|---|---|
| `ui-ux-pro/design` | **`GEMINI_API_KEY`** (+ `ATLASCLOUD_API_KEY` 선택) | 로고 생성 / CIP 목업 / SVG 아이콘 — **3개 기능 전부** |

#### 조건부 (특정 모드·단계에서만, 폴백 설계됨)
| 스킬 | 환경변수 | 조건 | 폴백 |
|---|---|---|---|
| `garden-skills/gpt-image-2` | `OPENAI_API_KEY` + `ENABLE_GARDEN_IMAGEGEN` (+`OPENAI_BASE_URL`, `OPENAI_IMAGE_MODEL`) | **Mode A(로컬 생성)만** | ✅ Mode B(호스트 도구 위임) / Mode C(프롬프트 산출). 감지 스크립트로 자동 판정 |
| `garden-skills/web-video-presentation` | MiniMax API key(기본) 또는 `OPENAI_API_KEY`(+`OPENAI_BASE_URL`, `OPENAI_TTS_MODEL`) 또는 `ELEVENLABS_API_KEY` | **Phase 3 음성 합성만** | ✅ Checkpoint Audio에서 미합성 선택 → Phase 3 생략, 웹 산출물 무손상. 무료 경로(edge-tts / macOS `say`) 제시 |
| `ui-ux-pro/ui-ux-pro-max` | `GOOGLE_FONTS_API_KEY` | **`--live` 카탈로그 갱신만** | ✅ 일반 사용은 로컬 데이터(1,935행)로 완결. 키 부재 에러가 **테스트로 검증** |

#### 간접·미명시 (문서에 키가 규정되지 않았으나 실행에 필요)
| 스킬 | 상황 |
|---|---|
| `ui-ux-pro/banner-design` | Gemini 이미지 생성을 호출하지만 **SKILL.md에 키 이름이 없다.** 게다가 의존 스킬 5개(`frontend-design`, `ai-artist`, `ai-multimodal`, `chrome-devtools`, `assets-organizing`)가 컬렉션에 없어 Step 3·4 실행 불가 |
| `ui-ux-pro/design-system` | `fetch-background.py`가 Pexels/Unsplash에서 이미지를 가져오지만 **환경변수 이름·발급 방법·폴백이 전부 미명시** |
| `taste-skills/brandkit` | 이미지 생성 스킬인데 **도구·키·폴백이 전혀 규정되지 않았다** |
| `taste-skills/image-to-code` | "when image generation is available" 조건만 반복. **도구 부재 시 워크플로우 없음** |
| `taste-skills/imagegen-frontend-web` | 이미지 생성 도구 전제. 생성 자체 불가 환경의 폴백 없음 |
| `taste-skills/imagegen-frontend-mobile` | 동일, **폴백 전무** |

#### 키 완전 불필요 (25개)
- **emilkowalski 전체 12개** — 4개 컬렉션 중 유일하게 전 스킬이 키 불필요
- `garden-skills`: beautiful-article, kb-retriever, web-design-engineer (3)
- `taste-skills`: design-taste-frontend, design-taste-frontend-v1, full-output-enforcement, gpt-taste, high-end-visual-design, industrial-brutalist-ui, minimalist-ui, redesign-existing-projects, stitch-design-taste (9) — 단 이미지 도구를 전제하는 4개는 위 표 참조
- `ui-ux-pro`: brand, slides, ui-styling (3)

---

### 최종 한 줄 정리

> **기반 컬렉션은 `garden-skills`** (실행 가능한 검증 + 조건부 API 의존 + 폴백 설계 + 스킬 간 충돌 없음). **모션은 `emilkowalski`로, AI 티 제거는 `taste-skills/design-taste-frontend`로, 접근성·스택·팔레트 조회는 `ui-ux-pro/ui-ux-pro-max`로 보완한다.** 단일 스킬 하나만 고른다면 `ui-ux-pro-max` — 4개 컬렉션 37개 스킬 중 자기 지식의 품질을 코드로 검증하는 유일한 스킬이다.
