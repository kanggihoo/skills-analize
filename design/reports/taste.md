## taste/design-taste-frontend

출처: `skills-lock.json` 기준 `Leonxlnx/taste-skill` (GitHub), `skills/taste-skill/SKILL.md`, hash `6ac8ba60…`. taste 폴더에 설치된 스킬은 이것 하나뿐이다. 스킬 이름은 "tasteskill v2". `*.ko.md` 파일은 원본에 없던 한국어 번역본으로, 이 repo 커밋 "skill translations"에서 추가된 것으로 보인다.

### 파일 구성 (총 ~40.6k줄, 실제 내용 대부분은 library JSON)

```
design-taste-frontend/
├─ SKILL.md                 542   메인 런북: 페이지/앱 판별, 10단계 run, house rules 표, 크래프트 규칙, 특수 케이스, 파일 인덱스
├─ SKILL.ko.md              293   번역본
├─ README.md / .ko.md     81/49   개요, 요구사항(Node 22+, Chrome), 소요 비용(30–45분, 수십만 토큰)
├─ references/  (영문 원본, 각각 .ko.md 번역본 있음)
│  ├─ app-screens.md       1199   대시보드·관리자·설정 화면 전용 run, 셸, KPI, 차트, 테이블, 폼, 토큰, 앱용 house rules, 생성형 대시보드 tells
│  ├─ motion.md             980   모션 예산, 토큰(easing/duration), 레시피 ~17개, signature moves, reduced-motion, 모션 tells
│  ├─ imagery.md            791   이미지 우선순위, 오픈 컬렉션 검색, 크롭/처리, SW 화면 보여주기, 직접 그리기, 비디오, 배치
│  ├─ research.md           356   근거 데이터: 247개 사이트 연구, 상위/하위 비교표, 상위 25개 사이트 아이디어, 블라인드 테스트 결과
│  ├─ layout.md             292   마진/그리드, 텍스트 앵커, 빈 공간(rest와 hole 구분), 프레임, 섹션 변주, 내비, 엔딩, 폰
│  ├─ critique.md           182   스크린샷 비평 14 passes, Awwwards 가중 점수, caps(점수 상한), 기록 포맷, 수정 우선순위
│  ├─ copy.md               177   claim 목록 짜기, 2줄 헤드라인 글자수 계산, 헤드라인 형태, proof 날조 금지, 생성형 문구
│  ├─ scenes.md             174   GSAP 스크롤 씬(sticky stage) 사용법. 단, 씬 라이브러리 자체는 동봉되지 않음
│  ├─ type.md               170   타입 스케일 5단계, display/text 세팅, 폰트 로딩, 1–2 패밀리
│  ├─ colour.md             141   역할 토큰, 비율(ground 70–90%, accent <5%), tone step, 필드, 다크, 금지 팔레트
│  └─ tells.md              115   "AI 티" 목록을 시기별(1~3차 웨이브)로 정리, 각 항목의 금지/경고 상태
├─ library/  (draw.mjs가 읽는 데이터. 직접 통째로 읽지 말라고 명시)
│  ├─ directions.json      1077   20개 아트 디렉션(idea, composition, typography, colour, imagery, pitfalls, allow…)
│  ├─ heroes.json          1086   58개 hero 청사진(archetype, blueprint, mobile, headline, motion)
│  ├─ sections.json        4429   185개 섹션 청사진(role 16종 × shape 13종)
│  ├─ type.json            2023   44개 타입 시스템(Google Fonts/Fontshare 링크, 세팅, standsInFor, scale)
│  ├─ palettes.json        1484   56개 팔레트(bg/surface/ink/muted/accent/accentInk/fields)
│  ├─ photos.json          7239   19개 세트 420장 picsum(Unsplash) 사진, tone/colours/calm area/quality
│  ├─ sites.json           8350   연구한 202개 사이트 카드(score, idea, hero, type, colour, steal, media, motion)
│  ├─ motions.json           92   18개 signature move 설명
│  └─ app.json             1327   앱 스타일 7개, 셸 5개, 화면 패턴, kinds 13개
├─ scripts/
│  ├─ draw.mjs              584   방향 "딜링"(seed 랜덤 + 이력 기반 중복 회피), 시트 출력/재출력/redraw
│  ├─ lib/app-draw.mjs      203   --app 모드 딜링(스타일/셸/화면 패턴)
│  ├─ inspect.mjs           308   headless Chrome으로 렌더 → 측정 → FAIL/WARN → 스크린샷
│  ├─ lib/probe.mjs         929   페이지 안에서 실행되는 측정기(헤드라인 줄 수, 폰트, 색, 그림자, 레이아웃 등)
│  ├─ lib/rules.mjs         243   측정값을 판정으로 변환(judge / judgeLayout / judgeApp), 룰 ID 약 90개
│  ├─ lib/cdp.mjs           248   의존성 없는 Chrome DevTools Protocol 클라이언트(Node 22 내장 WebSocket)
│  ├─ lib/inspection-files.mjs 9  스크린샷 파일명 규칙
│  ├─ lint.mjs              119   소스 정적 스캔(정규식), 금지 패턴과 상투 문구 탐지
│  ├─ scenes.mjs            124   스크롤 씬을 진행률 0–100%로 촬영해 contact sheet 생성
│  └─ assets.mjs            865   Openverse/Wikimedia/AIC/Met(이미지), Commons/Prelinger/NASA(비디오) 검색, 다운로드, 크레딧 기록
├─ assets/
│  ├─ base.css / base.js  105/37  중립 토큰, 유체 타입 스텝, 12-col 그리드, reveal 헬퍼
│  ├─ app.css               216   앱 화면용 중립 셸/패널/테이블/컨트롤
│  ├─ charts.js             619   의존성 없는 SVG 차트 10종(line, bars, diverging, ring, barList, plan, bullet, timeline, matrix, timeStrip)
│  └─ scenes/stage.js/.css 134/28 GSAP ScrollTrigger + Lenis 기반 sticky stage 런타임
└─ evals/evals.json          76   브리프 10개(페이지 6, 앱 화면 4)와 baseline 비교 방법
```

### frontmatter

- `name: design-taste-frontend`
- `description`: "tasteskill v2, the anti-slop frontend skill. Art direction for websites, distilled from a study of 247 curated gallery sites (One Page Love, Awwwards Sites of the Day). Deals researched directions (idea, composition, type, palette, photographs, section blueprints) from a library, enforces a strict no-slop house style with a real-browser inspector, and runs a look-and-fix loop on screenshots. Use this whenever you build, design, redesign, restyle, polish or review a landing page, marketing site, portfolio, product page, one-pager, hero or any public-facing web page, in any stack (...) — also when the user says a page looks generic, templated, "AI-made", sloppy (...). Also for app screens: dashboards, admin and analytics views, settings, inboxes (...)"
- invocation flags: 없음(`allowed-tools`, `disable-model-invocation`, `user-invocable` 모두 없음). description만으로 자동 트리거되고, 트리거 범위가 매우 넓다.

### 트리거 / 언제 쓰나

- 공개 웹 페이지(랜딩, 마케팅, 포트폴리오, 제품, 원페이저, hero)를 만들거나, 리디자인, 리스타일, 폴리시, 리뷰할 때. 스택은 가리지 않는다.
- "AI가 만든 것 같다", "템플릿 같다", "프리미엄하게/어워드급으로" 같은 불만이나 요청이 나올 때.
- 앱 화면(대시보드, admin, analytics, settings, inbox, wallet, builder)은 별도 run으로 처리한다(`references/app-screens.md`).
- 컴포넌트 하나나 섹션 하나만 다룰 때는 draw를 건너뛰고 house rules만 적용한 뒤 inspect한다.

### 입력 → 출력

- 입력: 브리프(주제, 대상, 핵심 행동, 스택, 기존 브랜드, 실제로 가진 이미지). 모호하면 질문하지 않고 해석을 한 줄로 밝힌 뒤 진행한다. 질문은 작업이 막힐 때만 한다(예: 제품명이 없을 때).
- 중간 산출물(프로젝트 루트의 `.taste-skill/`):
  - `direction.json`: 딜링된 시트
  - `inspect/`: `desktop-fold.jpg`, `desktop-page-N.jpg`, `mobile-*`, `desktop-film-NN.jpg`
  - `scenes/`
  - `assets/credits.json`
  - `~/.taste-skill/history.json`: 최근 24회 딜 이력
- 출력:
  - 완성된 페이지 코드
  - 최종 보고: direction 이름과 seed, redraw 사유, idea 문장과 live thing, 마지막 critique 점수, 찾은 이미지와 영상의 라이선스·출처, 대체해야 할 샘플 콘텐츠·사진·드로잉 목록

### 동작 흐름 (페이지 run, SKILL.md "The run")

0. **분기.** 페이지(읽고 스크롤하는 것)인지 앱 화면(그 안에서 일하는 것)인지 판단한다. 앱 화면이면 `app-screens.md`를 통째로 읽고 그 run을 따른다. 제품 사이트 안의 UI 조각은 `draw.mjs --app --keep palette,type --out .taste-skill/app`로 따로 딜하고, 조각 루트에 `data-ui`를 붙여 검사 예외로 만든다.
1. **브리프와 프로젝트 읽기, subject inventory.** 이 클라이언트에만 있는 것을 8–12개 노트에 적는다: 이름과 그 뜻, 주소, 거리, 동네의 타일과 간판, 브리프 속 숫자, 제약("한 달에 한 배치"), 재료, 의식과 시간("5시에 오븐 점화"), 그 세계의 인쇄물(티켓, 라벨, 시간표). 이 목록은 4단계 아이디어의 원천이자 6단계 이미지 검색어가 된다.
2. **argument 쓰기.** 섹션마다 "claim → proof"를 한 줄씩 적는다(`copy.md` §1). claim이 없는 섹션은 지운다. 목적은 hero→logos→3 features→testimonial→pricing→CTA라는 stock 순서를 깨는 것이다.
3. **draw.**
   - `draw.mjs --sector X --brief "…" --sections <argument 순서> [--tone] [--have] [--keep] --options 3`를 실행하면 20개 direction 중 3개를 딜한다. 모델이 고르게 하지 않고 스크립트가 랜덤으로 뽑는다("a model asked to pick a direction returns the category default every time").
   - 에이전트는 inventory를 가장 잘 실을 수 있는 하나를 고르고 이유를 한 줄 남긴다. `--direction <id>`로 다시 실행하면 전체 시트가 나온다: idea, composition, type(폰트 `<link>` 포함), palette CSS 변수, imagery 지침, hero 청사진, 섹션별 청사진, signature motion, scenes, richness, pitfalls, 실존 레퍼런스 사이트, "Always" 규칙.
   - 시트는 "그대로 채택"해야 한다. 슬롯 redraw(`--redraw hero|type|palette|photos|scenes|section:<role>|direction`)는 설명할 수 있는 이유가 있을 때만 허용된다(브랜드 충돌, 없는 에셋, 콘텐츠가 안 맞음). 콘텐츠가 안 맞는 섹션은 `--alternatives <role>`로 후보를 보고 `section:<role>=<id>`로 지정한다.
   - 시트 안에서 충돌이 나면 다음 우선순위로 해결한다: house rules > direction > type/palette > hero 청사진 > 섹션 청사진. 청사진에서는 geometry만 가져온다.
   - 딜링 로직(코드에서 확인):
     - sector, needs, tone으로 pool을 필터한다.
     - `--have`에 따라 imageryMode를 정한다: `own` / `interface`(SaaS류) / `no-product-photo`(물리 제품) / `atmosphere`. 이 값에 따라 사진 의존 direction을 빼고, 시트의 이미지 지침 문단이 바뀐다.
     - 최근 이력에 있는 id는 피한다(`fresh()`).
     - 이웃 섹션끼리는 같은 shape를 쓰지 않는다.
     - seed는 재현 가능하다(mulberry32).
4. **idea 찾기.** "On this page, **[subject의 것]** becomes **[direction이 요구하는 장치]**" 문장의 두 빈칸을 채우기 전에는 빌드하지 않는다.
   - 첫 빈칸을 찾을 곳: output, object/shape, name, place, ritual, artefact, opposite.
   - **competitor test**: 가장 가까운 경쟁자를 넣어도 문장이 성립하면 카테고리 아이디어이므로 탈락이다.
   - **One live thing**: 방문자가 조작할 수 있는 것 하나(목재를 고르면 의자 색이 바뀜, 대출액을 넣으면 월 상환액이 나옴, 지금 난로가 켜져 있는지 표시 등). 실제 콘텐츠를 쓰고, 폰에서 엄지로 쓸 수 있어야 하며, no-JS fallback이 있어야 한다.
5. **copy deck 먼저.** 마크업 전에 평문으로 전체를 쓴다.
   - 헤드라인은 모든 폭에서 2줄 이하. 글자수를 계산해서 맞춘다(≈32자).
   - supporting 문장 1개, 실제 버튼 1개.
   - 첫 화면에서 "무엇인지·언제·어디"를 큰 글씨로 답한다.
   - 콘텐츠는 끝까지 채운다(메뉴 전체와 가격, 방마다 정보).
   - 샘플 디테일은 허용하지만 proof(고객, 후기, 로고, 통계)는 절대 지어내지 않는다.
6. **모션 없이 빌드.** 토큰(CSS 변수) → hero → 섹션(아이디어를 pricing, FAQ, footer까지 끌고 간다) → 이미지 → live thing → scroll scenes → fullness → frame → states와 시맨틱 순서로 만든다.
   - 이미지 우선순위:
     1. 프로젝트 자체 이미지
     2. 이미지 생성 도구
     3. `assets.mjs`로 찾은 오픈 컬렉션 실사(엽서, 고지도, 판화, 박물관 소장품)
     4. 코드로 그린 subject
     5. 딜링된 picsum 사진(generic한 분위기용에 한함)
     6. 타입과 색만
   - **이미지 floor**: 실사 4장 이상(보통 6–12). SVG 드로잉은 세지 않는다. 영상 1개를 권장한다.
7. **Gate.** `lint.mjs <src>`, `inspect.mjs <url|index.html>`, 씬이 있으면 `scenes.mjs`를 돌린다. FAIL은 0이어야 한다. WARN은 디자이너에게 한 문장으로 방어할 수 없으면 틀린 것으로 본다. 빌드 스텝이 있으면 production build로 검사한다(dev server를 감지하면 경고).
8. **Look.** inspector 스크린샷을 Read 도구로 직접 열고 `critique.md`의 14 passes와 가중 점수로 비평한다. 비평은 정해진 포맷으로 기록하고, top 3를 고친 뒤 재검사한다. 최대 3라운드. "스크린샷에 보이면 코드와 상관없이 실제 문제"로 취급한다.
9. **Move.** 모션 레이어는 필수다. signature move 1개, 섹션별 요소 entrance(60–90ms stagger, 16–32px rise), 모든 컨트롤 피드백, 움직이는 그림 1개로 구성한다. inspector가 움직이는 요소 수를 세서 8개 미만이면 FAIL, 16개 미만이면 WARN을 낸다. transform/opacity만 쓰고 `prefers-reduced-motion` fallback을 둔다.
10. **Report.** 체크리스트를 모두 만족해야 보고할 수 있다: 3개 폭 모두 0 FAIL, 모든 스크린샷 열람, critique 기록. "Do not claim a check you did not run."

- 서브에이전트: 사용하지 않는다. 사용자에게 질문도 기본적으로 하지 않는다.
- reference 로딩: SKILL.md 끝의 Files 표에서 "Read it when" 조건으로 지시한다. app-screens.md는 "통째로 먼저 읽기"이고, 나머지는 필요할 때 읽는다. library는 스크립트를 통해서만 읽는다.
- 리디자인/리뷰: `inspect --out .taste-skill/before`로 before를 기록한다. 리뷰는 거기서 멈추고 top 3 변경을 제시한다. 리디자인은 스택을 유지한 채 type → colour → frame → states → stock 컴포넌트 교체 순으로 진행하고, after와 비교한다.

### 하위 모드 / 레퍼런스

| 파일 | 다루는 내용 | 로드 시점 |
| --- | --- | --- |
| `references/app-screens.md` | 앱 화면 run(데이터 inventory, "one question", 스타일 딜, 셸, 데이터, states, check), 7개 스타일, 셸, KPI, 차트, 테이블, 폼, 토큰, 완화된 house rules, 대시보드 tells | 앱 화면이면 시작 전에 전체 |
| `references/copy.md` | argument, 2줄 헤드라인 계산식, 헤드라인 형태, 버튼 라벨, proof 정책, 생성형 문구, 마이크로 타이포 | step 2, 5 |
| `references/type.md` | 측정치, 5-step clamp 스케일, display/text CSS, 폰트 로딩, 1–2 패밀리 | 타입 결정 시 |
| `references/colour.md` | 역할 토큰, 비율, tone step, 필드, 다크, 대비, 금지 팔레트 | 팔레트 적용 시 |
| `references/layout.md` | 마진과 그리드, 앵커 라인, 빈 공간, 프레임, 섹션 변주, 내비, 엔딩, 폰, 실패 패턴 | 레이아웃 결정 시 |
| `references/imagery.md` | 이미지 우선순위, assets.mjs 사용법, 정직성 규칙, 크롭과 처리, SW 조각, 드로잉 3단계 디테일, 비디오, 배치 | step 6 |
| `references/motion.md` | 예산, 4 질문, easing과 duration 토큰, 스크롤 행동 순위, 레시피, signature moves, 모션 tells | step 9 |
| `references/scenes.md` | 스크롤 씬 삽입, 채우기, 폰, 체크 | 시트가 씬을 딜했을 때 |
| `references/critique.md` | 14 passes, 점수 공식, caps, 기록 포맷, 수정 순서 | step 8 |
| `references/tells.md` | 시기별 tell 목록과 금지/경고 상태 | 참고용 |
| `references/research.md` | 연구 방법, 수치, 상위 25개 사이트, 블라인드 테스트 결과 | 수치를 인용할 때 |
| `library/*.json` | direction, hero, section, type, palette, photo, site, motion, app 데이터 | draw.mjs가 로드(직접 읽기 금지) |

### 핵심 규칙 / 지식 (가장 특징적인 것)

**1) House rules: inspector가 측정하는 금지 목록**

- 헤드라인은 모든 `h1`–`h6`과 첫 화면 주문구 모두 **모든 폭에서 2줄 이하**. 고칠 때는 단어를 줄이고, 그다음 measure를 넓히고, 크기는 마지막에 줄인다.
- statement(큰 인용문이나 문장)는 `<p>`/`<blockquote>`로 마크업한다. 데스크톱 ≤36px, 태블릿 32px, 폰 24px 이하, 약 25단어, 3줄까지. 이보다 크면 헤드라인으로 취급한다.
- **No eyebrows**(헤딩 위 작은 라벨, pill 배지, "New ·" 칩 금지).
- **No monospace**(코드 블록 외), **no index numbering**(01/02/03, "Step 2"), **no thin rules**(hairline, 1px 박스, 그리드선, 크롭마크).
- **No gradients**(배경, 버튼, 텍스트 모두. 사진 위 중립 scrim만 예외), **no shadows at rest**, no glow, **no glass**, 떠 있는 pill 내비 금지.
- **No assistant palette**:
  - "yellow-cream ground with terracotta or rust", violet/indigo 금지. Claude 브랜드 색 hex(`#d97757`, `#faf9f5` 등)를 lint에 직접 하드코딩해 두었다.
  - HSL 판정: cream h22–62/s≥.16/l≥.88, terracotta h6–30/s.38–.85/l.42–.72, purple h244–295.
- tiny uppercase tracked label, icon-topped feature card, 동일 카드 행, emoji, gradient blob, 가짜 대시보드, 헤드라인 속 스타일된 강조 단어 금지.
- 타입페이스는 **최대 2개**, 보통 1개.
- 근거를 정직하게 둘로 나눈다. 데이터로 뒷받침되는 금지(상위 7.5+ vs 하위 6.5−): icon cards 1% vs 28%, pill badges 14% vs 34%, gradients 22% vs 52%, shadows 24% vs 48%, tiny caps 16% vs 57%. 반대로 mono 라벨(44% vs 24%), index 번호(38% vs 21%), hairline(61% vs 52%)은 오히려 상위 사이트에 더 많은데도 "owner's taste"로 금지한다고 명시한다.
- "Removing ornament leaves space. Never fill it with another ornament." 빈자리는 scale, 콘텐츠, subject 그림, 색 필드로 채운다.

**2) 수치 규칙 (Laws of the craft 등)**

- 타입:
  - 보이는 사이즈는 2–3개, 최대 5개.
  - headline/body 비율 중앙값 4.3, 상위 4.7. 최대 글자 크기는 상위 8.4vw, 하위 5.0vw.
  - display: tracking -0.02 to -0.05em, leading 0.85–1.05.
  - body: 16–20px, leading 1.45–1.6, 45–75자. 13px 미만 텍스트 금지.
  - 스케일 토큰: `--step-small 13–14 / body 17–19 / lead 20–26 / head 32–64 / display clamp(3rem,1rem+9vw,9rem)`.
  - 헤드라인 글자수 공식: `chars/line ≈ width ÷ (size × k)`, k=0.40(condensed)/0.50/0.58(wide·caps). 390px 폰, 44px 기준으로 2줄에 약 32자.
- 공간:
  - 외곽 마진 16–32px, 좌우 동일.
  - 섹션 간격은 데스크톱 120–240px, 폰 72–112px.
  - 텍스트의 왼쪽 시작선은 페이지 전체에서 2–3개.
  - 반 화면 이상의 빈 구간 금지. 한쪽에 몰린 섹션 금지. rest는 페이지당 1회.
- 색:
  - ground 70–90%, accent는 화면의 5% 미만이며 action과 그 외 하나에만 쓴다.
  - 본문은 full ink(대비 7:1 미만이면 `grey-body` WARN).
  - 표면 구분은 2–6 lightness의 tone step으로만 한다(선이나 그림자 금지).
- 버튼: square(0–2px) 또는 full round 중 하나로 정한다. 9–16px "soft" radius는 약한 사이트의 기본값이라 피한다.
- 내비: wordmark + 링크 3–5개 + 액션 1개, 크롬 없음. footer는 sitemap이 아니라 디자인된 마무리(이름을 풀폭으로 등)로 만든다.
- 모션 토큰:
  - easing: `--ease-out cubic-bezier(.22,1,.36,1)`, `--ease-expo (.16,1,.3,1)`, `--ease-in-out (.76,0,.24,1)`.
  - duration: press 140, hover 180, ui 240, reveal 800, open 1200ms.
  - stagger: line 90, item 70ms.
  - preloader, gate, custom cursor, scroll hijack, bounce/overshoot 금지.
  - 첫 프레임에 제목이 보여야 하고 로드 시퀀스는 1.2s 안에 끝난다(inspector `late-title`).

**3) Critique caps (점수 상한으로 강제)**

- 점수 공식: `overall = 0.4·design + 0.3·usability + 0.2·creativity + 0.1·content`.
- 남은 FAIL이 있으면 overall 상한 6.0. eyebrow, mono, 3줄 헤드라인 등 tell이 보이면 6.5.
- 경쟁자 테스트를 통과 못 하면 creativity 상한 7. live thing이 없으면 7.5.
- 실사가 4장 미만이면 design 상한 6.5.
- 첫 화면에 실제 버튼이 없으면 usability 상한 7.
- 보정 기준: "real Sites of the Day land around 7.5–8.0". 자기 점수가 9면 다시 매긴다.

**4) 앱 화면 규칙 (app-screens.md, 23개 실제 제품 화면 측정)**

- 색은 chrome이 아니라 데이터에 쓴다. 화면의 유채색 픽셀 중앙값은 약 3%.
- KPI는 타일이 아니라 타입으로 표현한다(아이콘 원, 스파크라인 0/23).
- 제목은 24px 수준. figure는 16–40px이고 48px 이상은 없다.
- 테이블: zebra와 헤더 밴드 금지, 숫자는 우측 정렬 tabular.
- 1px border는 1.1–1.3:1 대비로 허용한다. border와 shadow 중 하나만 쓴다.
- 데이터 정직성:
  - 합계는 화면에 표시된 반올림 값으로 계산한다.
  - 두 번 나오는 사실은 하나의 변수에서 가져온다.
  - 상대 수치는 기준선을 명시한다.
  - 데이터 파일에 `console.assert`를 넣는다.
- "one question / one finding / 가장 잦은 job은 1클릭".
- 개성 확보("Give the product a face"): 브리프에서 얼굴 하나, 이 제품만의 요소 하나, 메인 데이터에 hue 하나.

**5) 철학 경고 (블라인드 테스트에서 배운 것)**

- "a page that has lost its labels, rules and cards and gained nothing in their place reads as thin". 실제로 1–4라운드에서는 baseline(스킬 없음)에게 졌고, 5라운드에서 처음 2/3 승리했다(research.md §11).
- 그래서 금지 규칙과 같은 무게로 "substance" 강제를 둔다: 실사 floor, 모션 floor, 전체 콘텐츠, live thing.

### scripts / evals

| 스크립트 | 하는 일 | 호출 |
| --- | --- | --- |
| `draw.mjs` | library에서 direction 3개 옵션 딜, 전체 시트 렌더링(마크다운), `.taste-skill/direction.json`에 저장, `~/.taste-skill/history.json`에 이력 저장(`TASTE_SKILL_HISTORY`로 경로 변경 가능). `--show`, `--redraw`, `--alternatives`, `--list`, `--photos`, `--site`, `--app`(→ `lib/app-draw.mjs`) 지원 | `node <skill>/scripts/draw.mjs --sector … --brief … --options 3` 다음 `--direction <id>` |
| `lint.mjs` | 소스 파일을 줄 단위 정규식으로 스캔한다. FAIL 대상: mono, gradient, shadow, 01/02 번호, eyebrow 클래스, micro-label(Tailwind 조합), purple, Claude 팔레트 hex, emoji, lorem, hairline. WARN 대상: 상투 문구(unlock, seamless, elevate, "not just X…"), "Get started/Learn more", 기본 폰트(Inter, Poppins, Space Grotesk, Instrument Serif…), `transition: all`, ease-in, scale(0), 100vh, bounce, em-dash 5개 이상. `<pre>/<code>`, 테이블/폼 셀렉터, `[data-ui]` 안, `taste-skill-ignore` 주석은 예외 처리한다. `--app`이면 일부를 완화하고 placeholder 데이터와 Tailwind 기본색을 추가로 잡는다. FAIL이 있으면 exit 1 | `node lint.mjs <files> [--app] [--json]` |
| `inspect.mjs` | 로컬 파일을 임시 http 서버로 서빙한 뒤 Chrome(CDP)을 1440/768/390 폭으로 띄운다. `probe()`가 측정하고, `rules.mjs`가 판정한다(룰 ID 약 90개: headline-lines, focal-point, eyebrow, mono, gradient, shadow, hairline, palette-*, contrast <2.6:1, font-count, body-size, few-pictures, still-page(<8), off-centre, lopsided, blank-gap, no-title, untitled-section, edge-text, covered-text, late-title, reduced-hidden, font-not-dealt…). 스크린샷(fold, page sheet, film)을 저장한다. `direction.json`의 `allow`와 app 모드를 자동으로 반영한다. 모션 레코더를 주입해 움직이는 요소 수를 센다. reduced-motion 페이지도 별도로 확인한다 | `node inspect.mjs <url\|file> [--out] [--widths] [--allow r1,r2] [--app] [--film] [--json]` |
| `scenes.mjs` | `section.scene`마다 진행률 0–100%(10% 단위)를 데스크톱과 폰에서 촬영해 contact sheet로 만들고, reduced-motion도 촬영한다. 씬이 시작되지 않거나 rest 상태에 머물면 exit 1 | `node scenes.mjs <page>` |
| `assets.mjs` | 키 없이 쓰는 공개 API로 이미지(Openverse, Commons, AIC, Met)와 비디오(Commons, Prelinger, NASA)를 검색한다. 기본값은 상업적 사용 가능 라이선스(CC0/PD/BY/BY-SA)만, 폭 1000px 이상, 로드 가능 여부 확인. `--get`은 `assets/`에 다운로드하고 `credits.json`을 기록한다. `--credits`는 footer용 HTML 한 줄을 출력한다. 비디오는 720p 이하, 25MB 이하, 포스터 프레임 포함 | `node assets.mjs "ghent postcard" [--source museums] [--video]`, `--get commons:123`, `--credits` |
| `lib/cdp.mjs` | 의존성 없는 CDP 클라이언트. Chrome/Edge/Brave/Chromium 경로를 자동 탐색하고 `CHROME_PATH`를 지원한다 | 내부 |

- **evals.json**: 브리프 10개.
  - 페이지 6개: SaaS 인보이스, 리스본 오스테리아, 디자이너 포트폴리오, 세라믹 제품, 에리세이라 게스트하우스, 로테르담 컨퍼런스. 모두 "사진 없음" 조건이다.
  - 앱 화면 4개: 커플 가계부, 배포 대시보드(다크), 설정과 결제, 고객지원 큐.
  - 각 eval에 `expected_output`이 서술형으로 붙어 있다(예: "a pricing section that is not three cards").
  - 방법: 스킬이 있는 에이전트와 없는 에이전트로 같은 브리프를 빌드한다. 둘 다 inspect하고, 정체를 모르는 judge가 critique.md로 스크린샷을 점수화한다. FAIL 수도 기록한다.
  - 자동 채점 스크립트는 없다. 사람이나 에이전트가 수동으로 돌리는 프로토콜이다.

### 의존성

- Node 22+(inspect/scenes: 내장 WebSocket 필요). draw/lint/assets는 Node 18+.
- 설치된 Chrome, Edge 또는 Chromium(headless). npm 패키지는 하나도 없다(zero-dependency).
- 네트워크: assets.mjs(공개 API), Google Fonts와 Fontshare(폰트), picsum.photos(번들 사진), 씬을 쓸 경우 jsDelivr CDN의 GSAP 3.15와 Lenis 1.3.26.
- Bash 실행 권한과 Read 도구로 스크린샷을 보는 멀티모달 능력이 전제된다.
- 시간과 토큰 비용이 크다. README 기준 "roughly 30–45 minutes and a few hundred thousand tokens".

### 장점 (가져올 만한 것)

1. **"모델이 아니라 스크립트가 고른다"는 딜링 메커니즘.** 랜덤 + seed + 최근 이력 회피 + 제약(sector, have, tone) 필터 + 이웃 섹션 shape 회피. 카테고리 기본값으로 수렴하는 문제에 대한 가장 구조적인 해법이다. 라이브러리 데이터(direction 20, hero 58, section 185, palette 56, type 44)도 재사용 가치가 높다.
2. **측정 가능한 gate.** `rules.mjs`의 판정 로직, 특히 frame 계열(off-centre, lopsided, blank-gap, untitled-section, edge-text, focal-point, covered-text, late-title, reduced-hidden)은 다른 스킬에서는 보기 드문 "실제 렌더 측정"이다. `lint.mjs` 정규식 세트는 그대로 떼어 써도 된다.
3. **"Removal is not enough" 원칙.** tell 금지와 substance 강제(실사 floor, 모션 floor, full content, live thing, 첫 화면 h1과 버튼)를 한 쌍으로 묶은 점. 블라인드 테스트에서 실제로 진 경험에서 나온 교정이다.
4. **Idea 장치.** subject inventory(8–12개), "X becomes Y" 문장, competitor test, one live thing. 짧고 강력해서 어떤 디자인 스킬에도 이식할 수 있다.
5. **copy.md의 2줄 헤드라인 글자수 공식과 claim→proof argument.** 구체적인 수치라 바로 쓸 수 있다.
6. **critique.md 루브릭.** 14 passes(squint, cover the logo, edges count, 레이아웃 단어 기록), Awwwards 가중치, caps, 고정된 라운드 기록 포맷, 수정 우선순위(idea > hierarchy > composition > type > imagery > colour > detail > motion).
7. **app-screens.md.** 대시보드 tells 표와 "데이터 정직성" 규칙(합계는 표시값으로, 같은 사실은 한 변수로, baseline 명시, `console.assert`)은 다른 스킬에 거의 없는 내용이다. `charts.js`(의존성 없는 SVG 차트, 범례는 마크에서 파생)도 독립적으로 쓸 수 있다.
8. **imagery 정직성 규칙과 assets.mjs.** 오픈 컬렉션에서 실사를 찾고 라이선스와 크레딧을 자동 기록한다. "found picture is never the client's own" 원칙.
9. **모션 토큰과 규칙.** 연구 기반 easing/duration, "첫 프레임에 제목", preloader 금지, reduced 상태 = 완성 상태.
10. 근거와 취향을 정직하게 구분한다(데이터 기반 금지와 owner 취향 금지를 나눠 표기). 남의 규칙을 cherry-pick할 때 어떤 근거로 들어온 규칙인지 판단하기 쉽다.

### 단점 / 한계 (버릴 만한 것)

1. **매우 무겁다.** 문서 약 5k줄, 데이터 약 28k줄, 런북 10단계, 30–45분, 수십만 토큰. 작은 수정이나 컴포넌트 작업에는 과하다(컴포넌트 예외는 있지만 description 트리거 범위가 넓다).
2. **강한 하우스 취향을 하드 FAIL로 강제한다.**
   - mono, index 번호, hairline, 모든 shadow와 gradient, cream/terracotta, violet을 무조건 금지한다. 근거 데이터상 오히려 상위 사이트에 많은 장치도 포함된다.
   - 기존 디자인 시스템이나 브랜드와 충돌하면 `--allow`로 빠져나가야 한다. 범용 스킬로 쓰기에는 너무 편향되어 있다.
   - Claude 브랜드 색을 직접 금지하는 것도 취향 성격이 강하다.
3. **마케팅 페이지 편향.** "실사 4장 이상", "움직이는 요소 8개 이상", 영상 권장, 스크롤 씬 2–3개 같은 floor는 어워드 갤러리 미학을 기준으로 한다. 문서 사이트, B2B 툴 사이트, 텍스트 중심 페이지에는 맞지 않을 수 있다.
4. **환경 의존성.** headless Chrome, Node 22, 네트워크, 멀티모달 Read가 필요하다. 샌드박스나 CI, 권한이 제한된 환경에서는 gate의 핵심이 돌지 않는다(fallback은 lint와 수동 스크린샷뿐). 홈 디렉토리에 이력 파일도 쓴다.
5. **미완성 부분.** `scenes.md`, `motion.md`, `draw.mjs`가 `library/scenes.json`과 `assets/scenes/<id>.js`, `demo/`를 참조하지만 동봉되어 있지 않다(scenes.md 스스로 "Until `library/scenes.json` ships the draw deals none"이라고 적고 있다). 현재 씬 관련 지침은 사실상 stage.js 위에 직접 만들라는 말이다.
6. **번들 사진은 picsum/Unsplash generic 이미지**이고, 폰트는 외부 CDN 링크다. 오프라인이나 사내 환경에서는 그대로 쓰기 어렵다.
7. **연구 수치의 신뢰도.** 점수는 "model judgements from screenshots"이고, 블라인드 테스트는 라운드당 juror 1명, 노이즈 ±0.5다. 문서는 이를 정직하게 밝히지만, 스킬 전체가 이 수치를 "cite it, do not guess"라며 권위 있게 쓴다.
8. **영어 중심.** 헤드라인 글자수 계수(k), copy lint(영어 상투어), 대문자와 tracking 규칙이 모두 영문 기준이다. 한글 페이지에는 2줄 공식과 lint 문구를 다시 맞춰야 한다.
9. **"시트를 그대로 채택하라"는 강한 지시.** 사용자의 의도나 기존 레이아웃과 충돌할 여지가 있다(리스타일 모드는 `--keep`으로 일부 완화된다).

**cherry-pick 추천:**
- 그대로 가져올 것: idea 장치(inventory, competitor test, live thing), critique 루브릭과 caps, copy 2줄 공식, lint 정규식, rules.mjs의 frame 판정, app-screens의 데이터 정직성과 대시보드 tells, 모션 토큰.
- 선택적으로 가져올 것: draw 딜링 메커니즘과 library(용량이 큼).
- 버리거나 완화할 것: 취향성 hard FAIL(mono, hairline, 모든 shadow), 실사·모션 floor 강제, 미완성인 scenes 부분.
