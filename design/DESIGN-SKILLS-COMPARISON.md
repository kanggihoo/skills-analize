# 디자인 스킬 비교 분석

`design/` 아래 4개 레포(emilkowalski, impeccable, taste, garden-skills)의 스킬 23개를 하는 일 기준으로 묶고, 각 스킬이 어떻게 동작하는지와 서로 어떻게 다른지 정리한 문서다. 최종 목적은 `~/Desktop/my-skills/`에 내 디자인 스킬을 만드는 것이라, 스킬마다 **가져올 것**과 **버릴 것**을 함께 적었다.

- 스킬별 상세 분석(파일 구성, frontmatter 원문, 수치, 인용)은 `design/reports/`에 있다. 이 문서는 그 요약과 비교다.
- `*.ko.md`는 번역본이라 영어(또는 중국어) 원본 기준으로 분석했다.
- 확인하지 못한 부분이 두 군데 있다.
  - impeccable의 핵심 로직은 첫 실행 때 내려받는 실행 파일 안에 있어 내용을 보지 못했다. 문서에 적힌 동작만 분석했다.
  - taste의 `draw.mjs`는 권한 확인에 막혀 실행하지 못했다. 코드를 읽고 정리했다.

---

## 1. 한눈에 보기

### 1.1 레포별 성격

| 레포 | 스킬 수 | 성격 | 무게 |
|---|---|---|---|
| emilkowalski | 15 | 작은 스킬을 여러 개로 쪼갠 구조. 스크립트 없이 마크다운 지식과 절차만 있다. 모션 비중이 크다 | 가벼움 (스킬당 100–650줄) |
| impeccable | 1 | 하위 명령 약 25개를 가진 거대한 스킬 하나. 핵심 로직은 내려받는 실행 파일에 있다 | 매우 무거움 (참고 파일 약 450KB) |
| taste | 1 | 스크립트가 디자인 방향을 뽑고, 실제 Chrome으로 렌더해서 규칙 약 90개로 검사한다 | 매우 무거움 (한 번에 30–45분, 토큰 수십만) |
| garden-skills | 6 | 산출물 종류별 스킬(웹 시안, 기사, 발표, 영상, 이미지) + 검색 스킬 1개 | 스킬마다 다름 |

### 1.2 분류

| 그룹 | 스킬 | 한 줄 요약 |
|---|---|---|
| **A. 범용 웹 UI 디자인** | impeccable, taste/design-taste-frontend, garden/web-design-engineer | 웹 화면을 처음부터 만들거나 고치는 "올인원" 스킬. 서로 가장 많이 겹친다 |
| **B. 디자인 원칙 지식** | emil/emil-design-eng, emil/apple-design, emil/mobile-native | 절차보다는 규칙과 수치를 담은 참고서형 스킬 |
| **C. 모션** | emil/animate, animate-expo, animation-performance, find-animation-opportunities, improve-animations, review-animations | 애니메이션을 만들고, 찾고, 감사하고, 리뷰하는 6개 스킬 |
| **D. 검증·탐색 도구** | emil/break-ui, emil/prototype | 최악의 데이터로 UI를 깨 보거나, 서로 다른 시안 여러 개를 만들어 비교한다 |
| **E. 특정 산출물 생성** | garden/beautiful-article, web-video-presentation, motion-showreel, gpt-image-2 | 기사, 발표 페이지, 영상, 이미지처럼 결과물 형식이 정해진 스킬 |
| **F. 용어 사전** | emil/animation-vocabulary | 대충 묘사한 것을 정확한 디자인 용어로 바꿔 준다(현재는 모션 용어만) |
| **G. 제외** | garden/kb-retriever, emil/write-swift, emil/ask-sonner, emil/pick-ui-library | 디자인과 관련이 없거나 특정 언어·라이브러리 전용 |

그룹 A의 세 스킬은 하는 일이 거의 같아서, 내 스킬의 뼈대를 어디서 가져올지가 여기서 갈린다. 리뷰, 안티 슬롭 규칙, 방향 탐색 같은 기능은 여러 그룹에 흩어져 있어서 8장에서 주제별로 따로 비교했다.

---

## 2. 그룹 A: 범용 웹 UI 디자인

세 스킬 모두 "웹 화면을 만들거나 고친다"가 목적이고, AI가 만든 티가 나는 디자인("AI slop")을 막는 것을 핵심 가치로 내세운다. 차이는 **어떻게 막느냐**다.

### 2.1 impeccable

- **트리거**: 프론트엔드 UI 작업 전반. 디자인, 리디자인, 비평, 감사, 다듬기, 모션, 카피, 반응형, 디자인 시스템 문서화, iOS·Android 화면까지 description 하나로 자동 호출된다.
- **구조**: SKILL.md(85줄)는 길잡이 역할만 한다. 하위 명령마다 참고 파일이 따로 있고 그 명령을 실행할 때만 읽는다.

| 분류 | 하위 명령 |
|---|---|
| 만들기 | new-work(자연어 요청), shape, init, document, extract |
| 평가 | critique, audit |
| 다듬기 | polish, bolder, quieter, distill, harden, onboard |
| 강화 | animate, colorize, typeset, layout, delight, overdrive |
| 고치기 | clarify, adapt, optimize |
| 반복 | live, generate |
| 관리 | hooks, doctor, pin |

- **동작 흐름 (새 화면 만들기)**
  1. 세션마다 한 번 `scripts/impeccable context`를 실행해 PRODUCT.md(제품 사실)와 DESIGN.md(시각 토큰)를 읽는다.
  2. 화면 성격을 4가지 Mode 중 하나로 정한다: Persuade(랜딩), Operate(앱), Read(문서), Experience.
  3. Mode별 핵심 질문을 2–3개 한다. CSS 값이나 미학 선택지는 묻지 않는다.
  4. 새 시각 세계가 필요하면 후보 7개를 뽑은 뒤 `concept-seed`가 주사위로 방향을 강제 배정한다. 이 스크립트를 실행하기 전에 코드를 쓰면 규칙 위반이다.
  5. 로컬 웹 페이지에 후보 카드를 띄워 사용자가 고르게 한다.
  6. 이미지 생성 도구가 있으면 시안 이미지 3장 → 영역 분해 → 첫 화면 구현 → 시안과 72% 이상 일치해야 통과 → 섹션 → 모션 → 반응형 순서로 단계마다 관문을 통과한다. 없거나 앱 화면이면 시안 없이 코드로 만든다.
  7. 기존 대화를 넘겨받지 않은 새 서브에이전트가 결과를 검수하고, 4가지 판정 중 하나를 낸다(다시 캡처 / 다시 빌드 / 수정 / 출시).
  8. 또 다른 서브에이전트가 DESIGN.md를 작성한다.
- **핵심 지식**
  - `craft-floor.md`(50줄)는 UI를 편집하기 직전에 항상 읽는 품질 하한선이다.
    - 수치: 대비 4.5:1, 본문 65–75자, 카드 radius 12–16px
    - 금지: eyebrow, 그라디언트 글자, ghost card, 중첩 카드, 이모지 아이콘, 1px 넘는 컬러 좌우 테두리
  - 금지 글꼴 목록: Fraunces, Playfair, Space Grotesk, IBM Plex, Inter를 제목에 쓰는 것 등
  - AI가 수렴하는 미학 4종 점검: 크림 + 세리프 + 테라코타 / 검정 + 네온 / 신문풍 헤어라인 / 평면 채도 + 하드 그림자
  - critique 평가 도구: Nielsen 휴리스틱 0–4점, 인지부하 8항목, 페르소나 5종, P0–P3. 평가 A와 B를 서로 분리된 서브에이전트로 돌린다.
- **가져올 것**: craft-floor, 금지 글꼴과 미학 4종 점검, Mode 4분류, critique 평가 도구와 분리 평가 설계, 새 맥락에서 검수하는 finish reviewer, live 모드의 변형 설계법(정체성을 한 문장으로 고정하고 서로 다른 축 6개로 변형), "다듬기는 보존하고 리디자인은 교체한다" 원칙
- **버릴 것**: 내려받는 실행 파일에 의존하는 파이프라인 전체(concept-seed, decision page, comp-spec, build-phase, live 오버레이), 하네스별(Codex, Cursor 등) 분기 문구, `.impeccable/` 상태 파일 더미. 실행 파일 기반 부분은 내용을 볼 수 없어서 가져올 수도 없다.

### 2.2 taste / design-taste-frontend

- **트리거**: 공개 웹 페이지(랜딩, 마케팅, 포트폴리오, 제품 페이지)를 만들거나 다듬을 때. "AI가 만든 것 같다"는 불만이 나올 때. 대시보드 같은 앱 화면은 별도 절차(`app-screens.md`)로 처리한다.
- **핵심 아이디어**: "모델에게 방향을 고르게 하면 매번 카테고리 기본값이 나온다." 그래서 스크립트가 고르고, 규칙 준수 여부는 실제 렌더 결과를 측정해서 판정한다.
- **동작 흐름 (10단계)**
  1. **inventory**: 이 클라이언트에만 있는 것(이름, 장소, 숫자, 의식, 인쇄물)을 8–12개 적는다.
  2. **argument**: 섹션마다 "주장 → 근거"를 한 줄씩 쓰고, 주장 없는 섹션은 지운다.
  3. **draw**: `draw.mjs`가 seed와 최근 사용 이력을 바탕으로 라이브러리에서 방향 3개를 뽑는다(방향 20, 히어로 58, 섹션 185, 팔레트 56, 서체 44). 에이전트는 하나를 골라 전체 시트를 받고, 그 시트를 그대로 채택한다.
  4. **idea**: "이 페이지에서 [이 클라이언트의 것]이 [방향이 요구하는 장치]가 된다" 문장을 완성한다.
     - 경쟁사 이름을 넣어도 말이 되면 탈락이다(competitor test).
     - 방문자가 조작할 수 있는 것을 하나 넣는다(live thing).
  5. **copy**: 마크업 전에 문구를 끝까지 쓴다. 헤드라인은 글자 수를 계산해 2줄 이하로 맞춘다.
  6. **build**: 모션 없이 빌드한다. 실사 사진을 4장 이상 넣어야 한다.
  7. **gate**: `lint.mjs`(정규식 검사)와 `inspect.mjs`(Chrome으로 1440/768/390px 렌더 후 규칙 약 90개 검사)를 돌린다. FAIL이 0이어야 한다.
  8. **look**: 스크린샷을 직접 열어 14개 관점으로 비평하고 Awwwards 가중치로 점수를 매긴다. 상위 3개를 고치고 다시 검사하며, 최대 3라운드까지 한다.
  9. **move**: 모션을 입힌다. 움직이는 요소가 8개 미만이면 FAIL이다.
  10. **report**: 체크리스트를 다 채워야 보고할 수 있다.
- **핵심 지식**
  - 금지 규칙: eyebrow, mono 글꼴, 01/02 번호, 헤어라인, 모든 그라디언트·그림자·글래스, 크림 + 테라코타, 보라색.
  - 금지 근거를 정직하게 둘로 나눠 적는다.
    - 데이터로 뒷받침되는 금지: 아이콘 카드는 상위 사이트 1%, 하위 사이트 28%에서 쓰인다.
    - 저자 취향인 금지: mono는 오히려 상위 사이트에 더 많다.
  - 비평 점수에 상한이 있다. FAIL이 남아 있으면 6.0, live thing이 없으면 창의성 7.5가 상한이다.
  - 앱 화면용 데이터 정직성 규칙: 합계는 화면에 표시된 값으로 계산한다, 같은 사실은 한 변수에서 가져온다, 데이터 파일에 `console.assert`를 넣는다.
- **가져올 것**: inventory → competitor test → live thing으로 이어지는 아이디어 장치, 2줄 헤드라인 글자 수 공식, 비평 루브릭과 점수 상한, `lint.mjs` 정규식, `rules.mjs`의 레이아웃 판정(쏠림, 빈 구간, 가장자리 글자, 늦게 뜨는 제목), 앱 화면 데이터 정직성 규칙, "지우기만 하면 빈약해진다"는 교훈(금지와 채움을 한 쌍으로)
- **버릴 것**: 취향성 금지를 FAIL로 강제하는 규칙(mono, 헤어라인, 모든 그림자), 실사 4장·모션 8개 같은 마케팅 페이지 기준 최소치, 영어 기준 공식(한글은 다시 맞춰야 함), 동봉되지 않은 스크롤 씬 라이브러리 관련 지침

### 2.3 garden / web-design-engineer

- **트리거**: 브라우저에서 렌더되는 시각 산출물 전반(페이지, 대시보드, 프로토타입, HTML 슬라이드, 데이터 시각화)과 디자인 비평. 긴 기사와 영상 발표는 형제 스킬로 넘긴다.
- **동작 흐름**
  0. 특정 제품이나 브랜드가 나오면 질문보다 먼저 웹 검색으로 사실을 확인한다.
  1. 정보량을 보고 질문할지 정한다. 시나리오별로 질문 여부를 정리한 표가 있다. 정말 모호하면 6개 학파 중 서로 다른 3개를 제안한다.
  2. 디자인 맥락을 수집한다. 우선순위는 사용자 자원 → 기존 화면 → 업계 레퍼런스 → 지정된 스타일 레시피(1개만 읽음) 순이다. 브랜드 작업이면 로고부터 확보하고, 못 구하면 멈춘다.
  3. **Design Read + 다이얼 5개**를 YAML로 쓴다. 다이얼은 variance / motion / density / asset-dependence / brand-fidelity이고 각각 1–10점이다. "점수를 바꿔도 계획이 안 바뀌면 그 점수는 지운다."
  4. 디자인 시스템(팔레트, 타이포, 간격, radius, 그림자, 모션)을 선언하고 **멈춰서 확인**을 받는다.
  5. v0(자리표시자 + 레이아웃)를 만들고 **멈춰서 확인**을 받는다.
  6. 완성본을 빌드한다. 중요한 결정마다 **멈춰서 확인**을 받는다.
  7. 정적 체크리스트로 검증한다. 브라우저 QA는 사용자가 명시적으로 요청했을 때만 한다.
  8. 요청하면 5개 차원으로 비평한다(Keep / 심각도순 Fix 최대 7개 / Quick Wins 3개).
- **핵심 지식**
  - 실존 브랜드 기반 스타일 레시피 25개(Linear, Aesop, Bloomberg Terminal, Stripe Press 등). 한 파일이 약 50줄이고, 색 hex, 폰트, 간격, signature move, 피할 것, 쓰면 안 되는 상황이 담겨 있다.
  - 실패 패턴 카탈로그: 기본값 → 이유 → 감지법 → 예외 → 수리 형식. "브랜드 스펙이 쓰면 예외"라는 근거가 붙어 있어 다른 스킬보다 덜 교조적이다.
  - 리디자인 모드 3분류(Extension / Preserve / Overhaul)와 보호 계약(라우트, 폼 필드명, 애널리틱스 이벤트, 법적 문구, 로고는 건드리지 않음)
- **가져올 것**: Design Read와 다이얼(완료 테스트 포함), 레시피 파일 포맷과 한 번에 하나만 읽는 방식, 실패 패턴 포맷, Asset Protocol, 리디자인 모드와 보호 계약, 서로 다른 학파 3개 제안 규칙, 브라우저 QA를 명시 요청 때만 돌리는 게이트
- **버릴 것**: 3번의 강제 정지(간단한 요청에도 마찰이 큼), 인라인 Babel + CDN React 전제, 스스로 금지한 조합(보라 계열 + Inter)이 남아 있는 추천 표, 있다고 해 놓고 실제로는 없는 React/Babel 코드 조각 참조

### 2.4 그룹 A 비교

| 관점 | impeccable | taste | web-design-engineer |
|---|---|---|---|
| 방향을 누가 정하나 | 실행 파일의 주사위가 배정하고 사용자가 카드에서 고름 | 스크립트가 seed로 뽑고 에이전트가 3개 중 1개 선택 | 에이전트가 다이얼로 정하고 사용자가 확인 |
| 규칙을 어떻게 지키게 하나 | 문서 + 편집할 때마다 도는 detector hook(실행 파일) | 실제 렌더 측정(inspect)과 정규식(lint)으로 FAIL 판정 | 정적 체크리스트(자기 점검) |
| 사용자 확인 | 질문 2–3개, 후보 카드 선택, 시안 승인 | 거의 묻지 않음(해석을 한 줄로 밝히고 진행) | 강제 정지 3회 |
| 서브에이전트 | 많음(검수, 문서화, 에셋, critique A/B) | 없음 | 없음 |
| 외부 의존 | 실행 파일 다운로드, 이미지 생성(선택), 브라우저 | Node 22, Chrome, 네트워크 | 없음(웹 검색 정도) |
| 강점 | 하위 명령 체계와 평가 도구가 가장 풍부함 | 측정으로 강제하는 유일한 스킬 | 가볍고 레시피와 리디자인 규칙이 실용적 |
| 약점 | 핵심을 볼 수 없음, 매우 무거움 | 매우 무겁고 취향이 강함, 마케팅 페이지 편향 | 검증이 자기 점검뿐, 문서 결함 |
| 앱 화면(대시보드) | Operate Mode | 별도 절차(app-screens) | 다이얼 프리셋 |
| 네이티브 앱 | iOS/Android 참고 파일 | 없음 | 없음 |

**정리**: 셋 다 "기본값으로 수렴하는 것을 어떻게 막을까"를 풀고 있다.

- impeccable은 절차와 의식으로, taste는 무작위 추첨과 측정으로, web-design-engineer는 사용자 확인과 레시피로 막는다.
- 내 스킬의 뼈대로는 web-design-engineer처럼 가벼운 절차가 현실적이다.
- 그 위에 impeccable의 craft-floor와 평가 도구, taste의 아이디어 장치와 측정 규칙을 얹는 조합이 유력하다.

---

## 3. 그룹 B: 디자인 원칙 지식

절차보다는 규칙과 수치를 담은 참고서형 스킬이다. 셋 다 스크립트가 없다.

### 3.1 emil-design-eng

- **트리거**: UI 다듬기, 컴포넌트 설계, 애니메이션 결정, UI 코드 리뷰. 다만 description에 "Use when"이 없어서 자동 호출은 약하다.
- **동작**: 애니메이션을 쓰기 전에 4개 질문에 순서대로 답한다(빈도 → 목적 → easing → duration). 리뷰할 때는 Before | After | Why 표가 필수다.
- **핵심 지식**
  - 하루 100번 이상 보는 동작이나 키보드로 시작하는 동작은 애니메이션하지 않는다.
  - easing 결정: 진입·퇴장은 ease-out, 화면 안 이동은 ease-in-out, hover는 ease. UI에는 ease-in을 쓰지 않는다.
  - 곡선 3개: `cubic-bezier(0.23,1,0.32,1)`, `(0.77,0,0.175,1)`, `(0.32,0.72,0,1)`
  - duration: 버튼 100–160ms, 툴팁 125–200, 드롭다운 150–250, 모달 200–500. UI는 300ms 이하.
  - 그 밖에: `scale(0)` 금지, popover의 transform-origin, 툴팁은 첫 번째 이후 즉시 열기, clip-path 패턴, 11행 리뷰 체크리스트
- **가져올 것**: 빈도 → 애니메이션 여부 판단, easing 결정 트리, 곡선과 duration 표, Before/After/Why 형식, 리뷰 체크리스트
- **버릴 것**: 철학 서론(행동 지시가 없음). 이름은 "디자인 엔지니어링"이지만 레이아웃, 타이포, 색은 거의 다루지 않는다.

### 3.2 apple-design

- **트리거**: 제스처, 스프링, 드래그·스와이프·시트, 반투명 머티리얼, 타이포, reduced-motion
- **동작**: 참고서형이라 정해진 절차나 출력 형식이 없다.
- **핵심 지식**
  - 관통 원칙: 모션은 화면의 현재 값에서 시작하고, 사용자의 속도를 이어받고, 관성을 투영하고, 언제든 잡아서 되돌릴 수 있어야 한다.
  - 스프링 표(damping/response): 이동 1.0/0.4, 드로어 0.8/0.3. 튕김은 제스처에 운동량이 있을 때만 쓴다.
  - 공식: 관성 투영 `(v/1000)*d/(1-d)`, rubber-band `(o*dim*0.55)/(dim+0.55|o|)`
  - 머티리얼: `blur(20px) saturate(180%)`, 반투명 위에 반투명을 쌓지 않는다.
  - 접근성 신호 3종: reduced-motion, reduced-transparency, contrast
  - 타이포: 크기에 따른 tracking(디스플레이 -0.02em), leading은 크기에 반비례
- **가져올 것**: 스프링 표와 공식(다른 스킬에 없는 고유 지식), 머티리얼 규칙, 타이포 tracking/leading 규칙
- **주의**: emil-design-eng과 충돌한다. emil-design-eng은 "빠른 토글에는 CSS transition"을 권하고, apple-design은 "제스처 UI에는 transition을 피하라"고 한다. 합칠 때는 "손가락이 개입하면 스프링, 아니면 transition"처럼 적용 범위를 명시해야 한다.

### 3.3 mobile-native

- **트리거**: 모바일 웹앱이 "브라우저 속 웹사이트"처럼 느껴질 때, PWA, 바텀시트, 캐러셀
- **동작**: 증상 표에서 해당 증상을 찾고 → 수정을 적용하고 → 새 앱이면 기본 meta와 CSS를 깔고 → Never Ship 표로 점검한다. **코드를 직접 고치고** 3줄로 요약한다(무엇이 문제였나 / 무엇을 바꿨나 / 실기기에서 확인할 것).
- **핵심 지식**: 플랫폼 레이어 수정 11개
  - hover는 `(hover: hover) and (pointer: fine)`로 감싼다.
  - 높이는 `100dvh`/`100svh`를 쓴다.
  - input 글자는 16px로 둔다(iOS 자동 확대 방지).
  - safe-area-inset, `overscroll-behavior`, `touch-action`을 처리한다.
  - 확대 금지 meta는 절대 쓰지 않는다.
- **가져올 것**: 증상 표 → 수정 → Never Ship → "검증 가능 / 실기기 필요" 구분 보고라는 가벼운 수정형 패턴, 기본 meta·CSS 블록

### 3.4 그룹 B 비교

| | emil-design-eng | apple-design | mobile-native |
|---|---|---|---|
| 다루는 층 | 웹 모션과 다듬기 | 물리 기반 제스처, 머티리얼, 타이포 | 모바일 브라우저 플랫폼 층 |
| 출력 | 조언, 리뷰 표 | 조언, 코드 | 코드 직접 수정 + 3줄 |
| 절차 | 4개 질문 | 없음 | 증상 표 → Never Ship |
| 겹치는 부분 | 셋 다 hover 게이트, `:active` scale, 실기기 테스트를 말함 | | |

셋 다 그룹 A에 흡수할 수 있는 "규칙 사전"이다. 별도 스킬로 두기보다 내 스킬의 참고 파일(`motion.md`, `platform-mobile.md` 같은)로 넣는 쪽이 자연스럽다.

---

## 4. 그룹 C: 모션 (emilkowalski 6개)

같은 사람이 같은 철학으로 역할만 나눠 만든 스킬들이다. 숫자와 규칙 대부분이 서로 복사돼 있다.

### 4.1 스킬별 동작

| 스킬 | 역할 | 코드 수정 | 동작 요약 |
|---|---|---|---|
| **animate** | 웹 애니메이션 구현 | O | 7단계를 순서대로 결정한다: 빈도 → 목적 → 도구(CSS transition부터 Motion까지 싼 것부터) → 속성 → 곡선·시간 → 중단 → 퇴장. 애니메이션을 안 만드는 것도 성공으로 친다. 출력은 코드와 3줄 메모. 컴포넌트 레시피 14종 포함 |
| **animate-expo** | React Native/Expo 구현 | O | animate와 같은 골격에 모바일 단계(스레드, 터치, haptics, 접근성)가 붙는다. Reanimated 4 최신 API, 셋업 함정, 관성 투영과 rubber-band worklet 코드 포함 |
| **animation-performance** | 성능 진단 | 요청 시만 | 증상 표 → 모든 애니메이션 목록화 → 빈도순 7단계 진단 → 원인/Before/After/검증 여부 보고. "원인을 이름 붙이기 전에 코드를 바꾸지 않는다" |
| **find-animation-opportunities** | 애니메이션이 없는데 있어야 할 곳 찾기 | X | 사전 조사 → 6가지 유형으로 후보 탐색(`file:line` 근거) → 4개 관문 → 최대 5–7개 제안. **탈락시킨 후보 목록을 반드시 함께 낸다** |
| **improve-animations** | 코드베이스 전체 감사와 계획 | X(plans/만 작성) | 사전 조사 → 카테고리별 읽기 전용 서브에이전트로 감사 → 직접 다시 읽어 검증 → 사용자 선택 대기 → 약한 실행자도 따라 할 수 있는 자기완결 계획서. `execute`는 격리된 worktree에서 실행하고 review 기준으로 판정 |
| **review-animations** | diff 리뷰 | X | 협상 불가 기준 10개 + 즉시 지적할 트리거 14개. 처방 우선순위는 1. 삭제 → 2. 축소 → 3. easing → … Before/After/Why 표와 Block/Approve 판정. 모션 스킬 중 유일하게 사용자가 직접 불러야 동작한다 |

### 4.2 흐름과 중복

- 연결: find → (`improve-animations plan`) → improve → (`execute`) → review 기준으로 판정. animate는 구현, performance는 진단으로 각각 따로 쓴다.
- **중복**: 빈도 표, 목적 6종, easing 3개, duration 표, 스프링 값, `scale(0)` 금지가 animate, review의 STANDARDS.md, improve의 AUDIT.md, find, 그리고 emil-design-eng에 각자 복사돼 있다. 공유 파일은 없다.
- **입장 불일치**: Framer Motion의 `x`/`y` 단축 prop
  - animate와 review: "항상 transform 문자열 전체로 쓴다"
  - animation-performance: "기본은 단축 prop, 메인 스레드가 바쁠 때만 문자열"

### 4.3 다른 레포의 모션 규칙과 비교

| 출처 | 진입 곡선 | 시간 기준 | 특징 |
|---|---|---|---|
| emil (animate 등) | `(0.23,1,0.32,1)` | UI 300ms 이하, 버튼 100–160ms | 빈도 관문, 중단 가능성, 스프링은 bounce 0.1–0.3 |
| impeccable animate | `(0.16,1,0.3,1)` | 피드백 100–150, 상태 150–300, 레이아웃 300–500, 강조 500–800ms | bounce·elastic 금지, 퇴장은 진입보다 빠르게 |
| taste motion.md | `(.22,1,.36,1)`, expo `(.16,1,.3,1)` | press 140, hover 180, ui 240, reveal 800, open 1200ms | 움직이는 요소 8개 이상 필수, preloader·커스텀 커서 금지 |
| motion-showreel craft | glide `(0.16,1,0.3,1)` | 진입 0.4–0.6s, 퇴장 0.2–0.3s | 스프링 성격표(버튼, 카드, 로고, 마스코트). **영상용이라 CSS 애니메이션 금지 규칙은 웹에 옮기면 안 됨** |

모두 "강한 ease-out으로 진입, 퇴장은 더 빠르게, bounce는 신중하게"에 동의한다. 차이는 얼마나 많이 움직이느냐다. emil은 "안 움직이는 게 기본"이고, taste는 "충분히 움직여야 통과"라서 정반대다. 내 스킬에서는 화면 성격(앱 / 마케팅)에 따라 둘 중 하나를 고르게 해야 한다.

**가져올 것**: 모션 수치를 파일 하나(`motion-standards.md`)로 합치기, animate의 관문 순서, review의 처방 우선순위와 Block/Approve 기준, find의 "탈락 목록 필수"와 개수 상한, improve의 자기완결 계획서 템플릿과 서브에이전트 프롬프트 요건, performance의 증상 → 원인 표

---

## 5. 그룹 D: 검증·탐색 도구

### 5.1 break-ui

- **동작 (6단계, 단계마다 완료 조건이 있음)**
  1. **Map**: 화면에 렌더되는 모든 값을 Field / Source / Type / Limit 표로 만든다. 제한값은 Zod 스키마나 DB 정의에서 찾는다.
  2. **Build**: 최악의 데이터 묶음을 하나 만든다. 무작위 문자열이 아니라 그럴듯한 값을 쓴다(`Aleksandra Wiśniewska-Kowalczyk`, `Jo`, 1,284명).
  3. **Toggle**: 화면 하단에 "Demo / Worst / Empty / One / 1,000행" 전환 토글을 단다.
  4. **Break**: 320px, 확대 200%, 다크모드, RTL에서 확인한다.
  5. **Report & stop**: 보고서를 내고 멈춘다.
  6. **Fix on request**: 요청받은 항목만 고친다.
- **핵심 지식**: 증상 → 원인 → CSS 수정 표 18행(`min-width: 0`, `overflow-wrap: anywhere`, `Intl.Segmenter`, `tabular-nums` 등), 말줄임/줄바꿈/줄 수 제한 결정 규칙(파일명은 가운데 말줄임, 숫자·금액은 절대 자르지 않음), 심각도 3단계(Broken / Ugly / Fragile)
- **비교**: impeccable의 `harden`도 긴 텍스트, i18n, 에러를 다루지만 체크리스트 수준이다. break-ui가 훨씬 구체적이다.

### 5.2 prototype

- **동작**: 사용자가 직접 불러야 동작한다.
  1. 범위를 하나로 좁힌다.
  2. 프로젝트의 토큰과 스택을 조사한다.
  3. 서로 다른 방향 3–5개를 정한다. 변형마다 이름과 "축"(레이아웃, 밀도, 성격, 모션, 상호작용 방식)이 있어야 하고, 색만 다른 변형은 하나로 합친다.
  4. 고정 스펙(PICKER.md)의 전환 UI를 그대로 붙인다. 숫자키와 URL로 전환한다.
  5. 직접 실행해 검증하고 장단점 표를 낸 뒤 멈춘다. 미리 추천하지 않는다.
  6. 사용자가 고르면 프로덕션에 통합하고 프로토타입을 삭제한다.

### 5.3 "여러 방향 보여 주기" 비교 (5개 스킬)

| 스킬 | 방법 | 다양성 확보 규칙 |
|---|---|---|
| emil/prototype | 실제로 동작하는 변형 3–5개 + 전환 UI | 축이 겹치면 안 됨, 색만 다르면 합침 |
| impeccable live/generate | 브라우저 오버레이에서 요소를 고르면 변형 3개를 바로 삽입 | 정체성을 한 문장으로 고정하고 서로 다른 축 6개 중 하나씩 맡김 |
| taste draw | 스크립트가 방향 3개를 추첨 | 최근 이력 회피, 이웃 섹션끼리 같은 모양 금지 |
| web-design-engineer Advisor | 6개 학파 중 서로 다른 행에서 3개를 말로 제안 | 같은 학파 금지 |
| motion-showreel | A 주제 밀착 / B 다른 그룹 / C 과감하게, 3방향을 한 페이지에 구현 | 같은 그룹 금지, 색만 바꾼 변형 금지 |

공통 원칙은 "3개, 서로 다른 축, 색만 다른 건 변형이 아니다"다. 이 원칙은 그대로 가져오면 된다. 구현 방식(말로 제안 / 정적 시안 / 동작하는 변형)은 비용에 따라 고르게 할 수 있다.

---

## 6. 그룹 E: 특정 산출물 생성

결과물 형식이 정해져 있어 범용 디자인 스킬과는 결이 다르다. 통째로 가져오기보다 **설계 기법**을 골라 쓸 대상이다.

| 스킬 | 결과물 | 동작 요약 | 웹 UI 스킬에 가져올 것 |
|---|---|---|---|
| **beautiful-article** | 자료(URL, PDF)를 HTML 기사 한 편으로 | 8단계: 자료 → 마크다운 → 계획 → 5개 결정을 따로따로 질문 → 첫 화면 + 리뷰 → 섹션별 빌드(서브에이전트 리뷰) → 3관점 최종 리뷰 → 수리. 저자의 npm 라이브러리(`reacticle@latest`) 필요 | 구조·밀도·미감·레이아웃을 독립된 결정으로 나누기, AI가 읽는 테마 프로필 포맷, 자유 영역에도 토큰 강제("지우면 이해가 나빠지는가?"), 결정 하나에 질문 하나, 서브에이전트를 어디에 쓸지 정한 비용 원칙 |
| **web-video-presentation** | 클릭으로 넘기는 16:9 발표 페이지(녹화하면 영상) | 원고 + outline → 5가지를 한 번에 확인 → 1장을 완성본으로 만들어 검수 → 나머지 장은 순차 또는 병렬 → 선택적 TTS | **토큰 계약 3층**: 색·폰트는 토큰 강제, 크기·간격·시간은 자유, 테마 성격은 공용 class로. 그 밖에 accent는 하나, 디자인 시그니처도 하나, 대비 4.5:1, 없는 소재는 자리표시자로 인정, 목록은 하나씩 공개 |
| **motion-showreel** | 코드로 만든 MP4 영상 | 6항목 확인 → brief → 스타일 프레임 또는 3방향 → `render(t)`로 프레임마다 캡처 → ffmpeg → 기계 검사 + 독립 심사 | 스타일 파일 포맷(식별 신호 중 2–3개만 고름, "가장 진부한 버전"을 적고 뒤집기), AI 기본맛 금지표(대체안 포함), 기계 검사와 사람 심사 분리, **코드 없이 결과물만 받는 독립 심사 에이전트** |
| **gpt-image-2** | 이미지(PNG) 또는 프롬프트 | 환경에 따라 3단계로 낮춰 동작: A 직접 생성 / B 호스트 이미지 도구에 위임 / C 프롬프트만 출력. 템플릿 93개 중 하나만 읽고 슬롯을 채운다 | 파라미터 3분류(꼭 물을 것 / 기본값 / 무작위), 필드 기준으로 좁게 묻기, "도구가 없으면 성공한 척하지 않는다", 역할 기반 색 인코딩(다이어그램) |

**버릴 것**: 이미지·오디오·TTS·렌더링 파이프라인 전체, 16:9 고정 무대, 영상용 결정성 규칙, 중국어·중국 플랫폼 중심 규칙, colophon 강제(저자 홍보). gpt-image-2는 기본값이 다크 + 글래스 + 네온 보라라서 다른 스킬들이 금지하는 미학을 오히려 기본으로 쓴다.

---

## 7. 그룹 F: 용어 사전

### 7.1 animation-vocabulary

- **트리거**: "이거 이름이 뭐야?"처럼 효과를 대충 묘사하면서 정확한 용어를 모를 때. AI나 디자이너에게 정확한 단어로 요청하고 싶을 때. 효과를 만들거나 설계하는 스킬이 아니라 **이름만 붙여 주는** 스킬이다.
- **동작**
  1. 키워드가 아니라 묘사의 감각과 의도로 읽는다.
  2. 용어 하나를 `**Term** — 정의` 형식으로 답한다. 정의는 용어집 문장을 그대로 인용한다.
  3. 헷갈리는 이웃 용어가 있으면 1–2개를 더 보여 주고 차이를 한 줄로 설명한다(Clip-path vs Mask, Pop in vs Bounce, Shared element vs Layout animation).
  4. 딱 맞는 게 없으면 근사치라고 밝히거나 용어를 조합한다("stagger of scale-in").
  5. 용어집 밖의 용어는 지어내지 않는다. 짧게 답한다.
- **예시**: "팝오버 열릴 때 통통 튀는 거" → Pop in, "iOS에서 끝까지 당기면 고무줄처럼 늘어나는 거" → Rubber-banding
- **용어집**: 약 95개, 12개 카테고리(등장·퇴장, 순서·타이밍, 이동·변형, 상태 전환, 스크롤, 피드백·상호작용, easing, 스프링, 반복·배경 모션, 마감 효과, 성능, 원칙). 외부 `/vocabulary` 페이지와 동기화되는 스냅샷이다.
- **파일**: `SKILL.md`(181줄) 하나. 스크립트와 의존성은 없다.

### 7.2 왜 별도 그룹인가

- 다른 스킬은 디자인을 **만들거나 평가**하는데, 이 스킬은 사용자와 에이전트가 **같은 말을 쓰게** 해 준다. 하는 일의 종류가 다르다.
- 현재는 모션 용어만 있지만 형식 자체는 모션에 묶여 있지 않다. 레이아웃, 타이포, 색, 컴포넌트 용어로 넓힐 수 있다.

### 7.3 일반 디자인 용어로 넓힐 때 재료

4개 레포에 일반 디자인 용어를 역조회해 주는 스킬은 없다. 대신 다른 스킬의 규칙에 용어가 흩어져 있다.

| 출처 | 용어 예 |
|---|---|
| impeccable craft-floor, new-work | eyebrow/kicker, ghost card, hero-metric, nested card, measure(65–75ch), tracking, color strategy(Restrained / Committed / Drenched) |
| taste house rules, layout.md | hairline, tabular-nums, statement, rest와 hole(빈 공간 구분), anchor line, tone step |
| web-design-engineer failure-patterns | Cardification, shape drift, zigzag, bento |
| apple-design | rubber-banding, momentum projection, material, scrim, optical sizing |
| break-ui | truncate / wrap / clamp, middle truncation |
| motion-showreel, web-video-presentation | signature move, 2+1 색, 디자인 시그니처 |

- **가져올 것**: "그대로 인용, 지어내지 않음, 근사치는 근사치라고 밝힘" 규칙, 이웃 용어 구분, 짧은 출력 형식
- **보완할 것**: 일반 디자인 용어 카테고리 추가, 한국어 묘사로 찾는 예시

---

## 8. 주제별 횡단 비교

### 8.1 안티 슬롭 금지 목록

거의 모든 스킬이 "AI 티 나는 디자인" 목록을 갖고 있다. 다들 이 목록을 따로 만들었는데, 한 번이라도 같은 걸 지목한 항목이 다수다.

| 금지 항목 | impeccable | taste | web-design-eng | web-video | motion-showreel |
|---|:-:|:-:|:-:|:-:|:-:|
| 헤딩 위 작은 대문자 라벨(eyebrow/kicker) | O | O | O | | |
| 그라디언트 글자/배경(보라→분홍→파랑) | O | O | O | O | O |
| 둥근 카드 + 컬러 왼쪽 테두리 | O | | O | O | |
| 같은 모양 아이콘 카드 그리드 | O | O | O(Cardification) | | |
| 이모지 아이콘 | O | O | O | O | O |
| 가짜 통계·로고·후기 | O | O | O | O | O |
| Inter 등 흔한 글꼴을 제목에 | O | O(WARN) | O | | O |
| 01/02/03 섹션 번호 | O | O | | | |
| 장식용 mono 라벨, 구석 각주 | O | O | O | O | O |
| 글래스, 장식 blur | O | O | | | |
| 그림자 전면 금지 | | O | | | |

- 5개 스킬이 모두 지목한 것(그라디언트, 이모지 아이콘, 가짜 데이터, 장식 mono 라벨)은 확실한 핵심 규칙이다.
- 그림자 전면 금지, mono 전면 금지처럼 한 스킬만 주장하는 것은 저자 취향일 가능성이 높다. taste는 스스로 "취향"이라고 밝혔다.
- 형식은 web-design-engineer(이유 → 감지법 → 예외 → 수리)와 motion-showreel(금지 + 대체안)이 실행하기 가장 쉽다. 그냥 금지만 하면 빈자리를 다른 장식으로 채우게 된다(taste의 교훈).

### 8.2 리뷰·비평 방식

| 스킬 | 출력 형식 | 점수 | 특징 |
|---|---|---|---|
| emil/review-animations | Before/After/Why 표 + Block/Approve | 없음 | 처방 1순위가 삭제, "승인은 얻어 내는 것" |
| emil/emil-design-eng | Before/After/Why 표 | 없음 | 11행 체크리스트 |
| impeccable critique | 보고서 + P0–P3 | Nielsen 0–4 ×10 | A(디자인 리뷰)/B(detector) 분리 서브에이전트, 페르소나 5종, 결과를 polish가 이어받음 |
| impeccable audit | 5개 차원 점수 | 0–4 ×5 (/20) | 접근성, 성능, 테마, 반응형, 구현 무결성 |
| taste critique | 정해진 기록 형식 + 상위 3개 수정 | Awwwards 가중(40/30/20/10) + 상한 | 스크린샷을 직접 보고 14개 관점, 최대 3라운드 |
| web-design-engineer critique | Keep / Fix(최대 7) / Quick Wins 3 | 5개 차원 0–10 | 수치로 말하기("chroma 0.25 → 0.18") |
| motion-showreel review | 기계 PASS/FAIL + 최악 3개 | 심사 표 | 검사 안 한 항목은 통과가 아님, 결과물만 받는 독립 심사 |
| break-ui | 문제 표 + 결정 필요 항목 + 문제없던 것 | 심각도 3단계 | "문제없던 것" 섹션으로 실제로 테스트했다는 걸 증명 |

공통적으로 좋은 장치는 네 가지다.

1. 출력 형식을 표로 고정한다.
2. 지적 개수에 상한을 둔다(7개, 상위 3개).
3. 리뷰어를 작성자 맥락에서 떼어 낸다(새 서브에이전트, 결과물만 전달).
4. 확인하지 않은 것을 통과로 치지 않는다.

### 8.3 검증 수단

| 수준 | 스킬 |
|---|---|
| 실제 렌더를 측정해 자동 판정 | taste(inspect.mjs, Chrome 3개 폭), motion-showreel(inspect qa), impeccable(detect, 실행 파일) |
| 브라우저 스크린샷을 보고 판단 | impeccable, taste look, break-ui(도구가 있으면), prototype, web-design-engineer(명시 요청 시) |
| 정적 자기 점검만 | emil 대부분, web-design-engineer 기본값 |

공통 정직성 규칙도 있다. 브라우저로 확인한 것과 코드로 추론한 것을 구분해서 적는다(break-ui, animation-performance, mobile-native, web-design-engineer).

### 8.4 사용자에게 언제 멈춰서 묻나

| 스킬 | 멈추는 지점 |
|---|---|
| taste | 거의 없음(막힐 때만) |
| emil/animate, mobile-native | 없음("메뉴처럼 선택지를 내밀지 말고 결정하라") |
| emil/break-ui, prototype, improve | 보고서나 시안을 낸 뒤 한 번 |
| impeccable | 질문 2–3개, 방향 선택, 시안 승인, 검수 |
| web-design-engineer | 3회(디자인 시스템, v0, 결정 지점) |
| beautiful-article, web-video-presentation | 3회 |
| motion-showreel | 2회(필수 질문 6개) |

질문 방식의 좋은 규칙도 있다.

- 결정 하나에 질문 하나("전부 OK?" 금지): beautiful-article
- "어떤 느낌을 원하세요?" 대신 필드 기준으로 묻기: gpt-image-2
- 추천은 하되 대신 정하지 않기: beautiful-article

### 8.5 스타일 프리셋 포맷

| 출처 | 개수 | 포맷 |
|---|---|---|
| web-design-engineer style-recipes | 25 | 실존 브랜드 기준. 팔레트 hex, 폰트, 간격, radius, signature move, 피할 것, 쓰면 안 되는 상황 |
| motion-showreel styles | 43 | 식별 신호 8–12개 중 2–3개만 선택, "가장 진부한 버전", 변화 공간, 함정 |
| web-video-presentation themes | 23 | `theme.json`(mood, bestFor) + `tokens.css`(토큰). 메타데이터로 추천을 자동 매칭 |
| beautiful-article theme-profiles | 11 | AI가 읽는 서술(기질, 금지 항목, 밀도별 제안)과 CSS 토큰 분리 |
| taste library | 방향 20 외 | JSON 데이터를 스크립트가 추첨 |

내 스킬의 프리셋 포맷으로는 세 가지를 합치는 것이 좋아 보인다: web-design-engineer의 값 중심 구조, motion-showreel의 "진부한 버전 뒤집기", web-video-presentation의 `bestFor` 메타데이터.

---

## 9. 충돌·결함 목록

합칠 때 그대로 옮기면 문제가 되는 것들이다.

| 항목 | 내용 |
|---|---|
| transition vs 스프링 | emil-design-eng은 빠른 토글에 CSS transition을 권하고, apple-design은 제스처 UI에서 transition을 피하라고 한다. 범위를 나눠 적어야 한다 |
| Framer `x/y` | emil 스킬끼리 입장이 다르다(4.2 참고) |
| 모션 양 | emil은 "기본은 안 움직임", taste는 "8개 미만이면 FAIL" |
| 그림자, mono, 헤어라인 | taste만 전면 금지(본인도 취향이라고 밝힘). web-design-engineer의 Linear 레시피는 헤어라인을 쓴다 |
| 영상 규칙 | motion-showreel의 "CSS 애니메이션 금지"는 영상 렌더링 전용이라 웹에 옮기면 해롭다 |
| web-design-engineer 결함 | 있다고 한 React/Babel 코드 조각이 실제로는 없음, 스스로 금지한 조합이 추천 표에 있음 |
| beautiful-article 결함 | 테마가 2개라는 문서와 11개인 목록이 공존, 커버 템플릿 정의가 두 파일에서 다름 |
| web-video-presentation 결함 | SKILL.md가 참조하는 "Part 0–8 / 결정 트리"가 실제 파일에 없음, 예제가 자기 규칙을 어김 |
| taste 결함 | 스크롤 씬 라이브러리를 참조만 하고 동봉하지 않음 |
| impeccable | 핵심이 볼 수 없는 실행 파일 안에 있음 |
| gpt-image-2 | description의 "18개 분류, 80+ 템플릿"과 실제(17, 93)가 다름 |

---

## 10. 내 스킬로 가져갈 후보 (2단계 설계용)

### 10.1 확실히 가져올 것

| 영역 | 가져올 것 | 출처 |
|---|---|---|
| 품질 하한 | craft-floor 수치와 금지 목록(5개 스킬이 겹친 항목 중심, 금지 + 대체안 형식) | impeccable, motion-showreel, web-design-engineer |
| 수렴 방지 | inventory → competitor test → live thing | taste |
| 수렴 방지 | 방향 3개(서로 다른 축, 색만 다르면 안 됨) | prototype, motion-showreel, web-design-engineer |
| 수렴 방지 | 금지 글꼴, AI 미학 4종 점검 | impeccable |
| 화면 성격 | Mode 4분류(Persuade / Operate / Read / Experience) | impeccable |
| 요구 파악 | Design Read + 다이얼(완료 테스트 포함) | web-design-engineer |
| 요구 파악 | 파라미터 3분류, 필드 기준 질문 | gpt-image-2 |
| 디자인 시스템 | 토큰 계약 3층, accent 하나, 시그니처 하나 | web-video-presentation |
| 모션 | 통합 모션 표준(곡선, 시간, 스프링, 빈도 관문, 처방 우선순위) | emil 모션 7종, apple-design |
| 카피 | 2줄 헤드라인 공식(한글용으로 다시 맞춰야 함), 주장 → 근거 | taste |
| 리디자인 | Extension / Preserve / Overhaul 분류와 보호 계약, "다듬기는 보존" | web-design-engineer, impeccable |
| 리뷰 | 표 형식 고정, 개수 상한, 독립 리뷰어, 확인 안 한 것은 통과 아님 | review-animations, impeccable, motion-showreel |
| 엣지 케이스 | 최악 데이터 카탈로그와 증상 → 수정 표 | break-ui |
| 앱 화면 | 데이터 정직성 규칙, 대시보드 금지 패턴 | taste app-screens |
| 모바일 웹 | 플랫폼 수정 11개, Never Ship | mobile-native |

### 10.2 선택적으로 (2단계에서 결정할 것)

- 브라우저 측정 검사(taste의 `inspect.mjs`/`rules.mjs`): 가장 강력하지만 Node 22 + Chrome이 필요하다. 스크립트로 가져올지, 판정 규칙만 체크리스트로 옮길지 정해야 한다.
- 스타일 프리셋 라이브러리: web-design-engineer 레시피 25개를 가져올지, 포맷만 가져오고 직접 채울지
- 동작하는 변형 비교(prototype의 picker): 비용이 크지만 강력하다. 별도 사용자 호출 스킬로 둘지
- 코드베이스 전체 감사(improve-animations 방식): 모션뿐 아니라 디자인 전반 감사로 일반화할지
- React Native, Expo: 범위에 넣을지
- 용어 사전(animation-vocabulary 형식): 모션 용어만 둘지, 일반 디자인 용어(레이아웃, 타이포, 색, 컴포넌트)까지 넓혀 별도 스킬로 둘지(7.3 재료 참고)

### 10.3 버릴 것

- 내려받는 실행 파일 의존(impeccable), 저자 npm 라이브러리 의존(beautiful-article)
- 이미지·영상·오디오·TTS 파이프라인 전체
- 취향성 하드 FAIL(그림자, mono, 헤어라인 전면 금지), 마케팅 페이지용 최소치(실사 4장, 모션 8개)
- 하네스별 분기 문구, 철학 서론, 저자 홍보 문구
- 디자인 밖 스킬: kb-retriever, write-swift, ask-sonner, pick-ui-library(pick-ui-library의 "흔한 잘못 매칭" 목록 정도만 참고)

### 10.4 2단계에서 정할 질문

1. **형태**: 큰 스킬 하나 + 참고 파일(impeccable식 라우터)로 할지, 작은 스킬 여러 개(emil식)로 나눌지
2. **범위**: 마케팅 페이지와 앱 화면을 둘 다 다룰지, 모바일 웹과 RN을 포함할지
3. **검증 수준**: 스크립트로 측정할지, 브라우저 스크린샷을 보고 판단할지, 체크리스트로만 할지
4. **확인 지점**: 사용자에게 몇 번 멈춰서 물을지(0회 taste ~ 3회 web-design-engineer 사이)
5. **취향**: 어느 금지 규칙을 하드 규칙으로 하고 어느 것을 기본값으로 둘지
6. **언어**: 한글 페이지 기준 수치(헤드라인 글자 수, 줄 높이, 글꼴)를 따로 정할지
