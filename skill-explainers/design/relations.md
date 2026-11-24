# design 관계 원장
분석 커밋: caba31d31edb29a8f8573e8766a333a2e4ac93e6
조사 범위: design/ 전체 (SKILL.md 41개)

- 구성: `design/` 아래 작성자 폴더 8개(`10k-websites`, `benjitaylor`, `elayadesign`, `emilkowalski`, `garden-skills`, `impeccable`, `jakubkrehel`, `taste`)와 스킬 41개.
- 번역본: 기존 `.ko.md`/`.KO.md`/`.ko.stale.md` 파일이 존재하나, 이번 작업에서는 1-1 번역 단계를 건너뛰고 원문 기준으로 분석했다.
- 원문 비교: 다른 컬렉션에 동명 `SKILL.md` 없음(`find`로 확인).
- 누락된 형제 스킬 참조:
  - `emilkowalski`의 `animate`, `find-animation-opportunities`, `improve-animations`, `review-animations`, `emil-design-eng`가 `../choreograph/SKILL.md`를 가리키나, `design/emilkowalski/choreograph`는 저장소에 없다(`범위 밖`).
  - `jakubkrehel`의 `better-interface`, `better-accessibility`, `better-layout`, `better-typography`, `better-ui`, `build-design`이 `better-motion`을 모션 소유 스킬로 언급하나, `design/jakubkrehel/better-motion`은 저장소에 없다(`범위 밖`, `better-interface` 규칙상 `Not reviewed` 처리).
- 대용량·바이너리 제외: `stageshow`(`kit/`, `examples/` 일부), `impeccable`(`scripts/data/font-index.json`, `scripts/live-browser.js`), `design-taste-frontend`(래스터 이미지 151개, SVG 958개, `scripts/consistency.mjs` 등), `teardown`(`assets/`, `scripts/` 일부), `gpt-image-2`(템플릿 다수), `motion-showreel`(테스트·스크립트 일부)은 구조·표본만 확인하거나 분석에서 제외한다.

## 스킬
| 경로 ID | 한 줄 요약 | 조사 상태(완료/부분/미조사) | 원문 비교(원문 동일: <경로> / 동명·내용 다름 / -) | 소속 묶음 | 묶음 내 역할(단계/선택지/안내/변형) |
|---|---|---|---|---|---|
| design/10k-websites/10k-websites | OpenArt 이미지·영상과 내장 엔진으로 스크롤 웹사이트를 만들어 Hostinger에 배포한다 | 완료 | - | site-design-choice | 선택지 |
| design/benjitaylor/stageshow | React/CSS 키트와 커서 리허설로 실제 제품처럼 보이는 가짜 제품 UI 데모를 만든다 | 부분 | - | ui-component | 선택지 |
| design/elayadesign/landing-page-design | 단일 오퍼·타깃·CTA 전략과 엄격한 시각 규칙으로 전환형 랜딩 페이지를 만든다 | 완료 | - | site-design-choice | 선택지 |
| design/emilkowalski/animate | 필요 여부부터 중단·종료 처리까지 정해진 순서로 웹 애니메이션을 구현한다 | 완료 | - | motion-craft, ui-component | 단계 |
| design/emilkowalski/animate-expo | React Native와 Expo에서 UI 스레드 기반으로 제스처·시트·전환 애니메이션을 구현한다 | 완료 | - | motion-craft | 변형 |
| design/emilkowalski/animation-performance | 웹 애니메이션의 프레임 드랍 원인을 진단하고 합성 전용 속성으로 성능을 고친다 | 완료 | - | motion-craft | 선택지 |
| design/emilkowalski/animation-vocabulary | 모호한 모션 묘사를 정확한 웹 애니메이션 용어와 정의로 역조회해 준다 | 완료 | - | motion-craft | 안내 |
| design/emilkowalski/apple-design | Apple의 유체 인터페이스·스프링·제스처 원칙을 웹 구현 규칙으로 옮겨 적용한다 | 완료 | - | motion-craft | 안내 |
| design/emilkowalski/ask-sonner | React 토스트 라이브러리 Sonner의 설치·호출 패턴·트러블슈팅을 안내한다 | 완료 | - | ui-component | 안내 |
| design/emilkowalski/break-ui | 최악의 데이터를 주입해 UI가 깨지는 지점과 수정안을 보고한다 | 완료 | - | ui-component | 단계 |
| design/emilkowalski/emil-design-eng | UI 폴리시와 애니메이션 판단 등 Emil Kowalski의 디자인 엔지니어링 원칙을 적용한다 | 완료 | - | motion-craft | 안내 |
| design/emilkowalski/find-animation-opportunities | 코드베이스에서 애니메이션이 필요한 지점만 골라 구현 없이 정확한 수치로 제안한다 | 완료 | - | motion-craft | 단계 |
| design/emilkowalski/improve-animations | 코드베이스의 애니메이션을 감사해 우선순위별 개선 계획서를 작성하고 필요 시 위임한다 | 완료 | - | motion-craft | 단계 |
| design/emilkowalski/mobile-native | 모바일 웹 앱의 CSS·메타태그를 고쳐 네이티브 앱 같은 사용감을 만든다 | 완료 | - | ui-component | 선택지 |
| design/emilkowalski/pick-ui-library | 프론트엔드 UI 작업에 맞는 라이브러리를 큐레이션 목록에서 골라 설치까지 돕는다 | 완료 | - | ui-component | 선택지 |
| design/emilkowalski/prototype | 방향이 다른 3~5개 UI 프로토타입을 플로팅 피커로 비교한 뒤 고른 안을 코드에 통합한다 | 완료 | - | ui-component | 단계 |
| design/emilkowalski/review-animations | 애니메이션 코드를 기준표로 리뷰해 Before/After 표와 Approve/Block 판정을 내린다 | 완료 | - | motion-craft | 단계 |
| design/emilkowalski/write-swift | 값 타입과 Swift 6.2+ 동시성 모델 기준으로 현대적인 Swift 코드를 작성·리뷰한다 | 완료 | - | - | 안내 |
| design/garden-skills/beautiful-article | 원자료을 8단계 하네스와 reacticle 컴포넌트로 편집해 오프라인 HTML 아티클을 만든다 | 완료 | - | garden-visual | 선택지 |
| design/garden-skills/gpt-image-2 | 실행 환경을 판별해 API 호출·호스트 도구 위임·프롬프트 가이드로 GPT Image 2를 생성·편집한다 | 완료 | - | garden-visual | 단계 |
| design/garden-skills/kb-retriever | 계층적 data_structure.md 색인과 점진적 검색으로 로컬 지식베이스에서 근거를 찾는다 | 완료 | - | garden-visual | 안내 |
| design/garden-skills/motion-showreel | 결정론적 웹 페이지와 타임라인·오디오로 최대 20분 모션 그래픽 MP4를 렌더링한다 | 완료 | - | garden-visual | 선택지 |
| design/garden-skills/web-design-engineer | 5개 다이얼과 3단계 체크포인트로 웹 페이지·대시보드·프로토타입을 구현·리디자인한다 | 완료 | - | site-design-choice, garden-visual | 선택지 |
| design/garden-skills/web-video-presentation | 원고를 구술 대본과 1920x1080 클릭 진행형 웹 무대로 구축해 녹화까지 지원한다 | 완료 | - | garden-visual | 선택지 |
| design/impeccable/impeccable | 24+개 서브 커맨드와 전용 서브에이전트·훅으로 프론트엔드 품질을 전 주기 관리한다 | 부분 | - | site-design-choice | 선택지 |
| design/jakubkrehel/afk | 부재 중 프로젝트 증거를 모아 개선점을 로컬 브랜치에 구현·검증하고 보고서를 남긴다 | 완료 | - | interface-audit | 선택지 |
| design/jakubkrehel/better-accessibility | WCAG 2.2 기준으로 키보드·포커스·ARIA·폼·확대/리플로우를 리뷰하고 수정한다 | 완료 | - | interface-audit | 단계 |
| design/jakubkrehel/better-colors | OKLCH 팔레트 생성, 시맨틱 토큰 명명, 포맷 변환 및 렌더링 대비 측정을 수행한다 | 완료 | - | interface-audit | 단계 |
| design/jakubkrehel/better-interface | 7개 better-* 도메인 스킬을 순차 호출해 단일 우선순위 인터페이스 리뷰 보고서를 낸다 | 완료 | - | interface-audit | 단계 |
| design/jakubkrehel/better-layout | 그룹화·정렬·여백·읽기 순서·반응형·RTL 대응을 설계하고 검증한다 | 완료 | - | interface-audit | 단계 |
| design/jakubkrehel/better-typography | 타입 스케일·폰트·줄바꿈·문장부호·숫자 정렬 등 텍스트 렌더링을 설정·리뷰한다 | 완료 | - | interface-audit | 단계 |
| design/jakubkrehel/better-ui | 모서리 반경·광학적 정렬·그림자·아이콘 상태를 정밀 수치로 마감한다 | 완료 | - | interface-audit | 단계 |
| design/jakubkrehel/better-writing | 레이블·에러·빈 상태 등 인터페이스 카피를 제품 어조와 용어에 맞게 작성·리뷰한다 | 완료 | - | interface-audit | 단계 |
| design/jakubkrehel/break | 컴포넌트 하나를 임시 페이지에 최악 시나리오별로 한꺼번에 렌더링해 깨짐을 찾는다 | 완료 | - | component-workbench | 선택지 |
| design/jakubkrehel/build-design | Figma나 디자인 이미지를 프로젝트 기존 토큰·컴포넌트로 구현하고 비교 검증한다 | 완료 | - | interface-audit | 단계 |
| design/jakubkrehel/explain-interface | 라이브 URL이나 스크린샷을 분석해 프론트엔드 시스템과 시각 효과 구현을 설명한다 | 완료 | - | component-workbench | 안내 |
| design/jakubkrehel/interface-review | 브랜치·PR·미커밋 변경분의 영향 범위와 제거 신호를 추출해 better-interface에 넘긴다 | 완료 | - | interface-audit | 단계 |
| design/jakubkrehel/state-machine | 컴포넌트의 모든 도달 가능 제품 상태를 모의 데이터·스위처가 있는 페이지에 렌더링한다 | 완료 | - | component-workbench | 선택지 |
| design/jakubkrehel/teardown | 실물·개념의 조립/분해도 기하 모델을 구축해 독립 뷰어 페이지로 패키징한다 | 부분 | - | component-workbench | 선택지 |
| design/jakubkrehel/variant | 실제 페이지 맥락에서 단일 디자인 축을 따라 3가지 컴포넌트 변형과 피커를 만들어 고른다 | 완료 | - | component-workbench | 선택지 |
| design/taste/design-taste-frontend | 업종별 deal과 내장 에셋·린트·Chrome 게이트(Stop 훅)로 AI 티 없이 웹사이트를 제작한다 | 부분 | - | site-design-choice | 선택지 |

## 관계
| rel-id | from | to | 종류 | 근거 방식(명시-이름/명시-역할/추론/미확인) | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태(범위 내/범위 밖/불명) | 출처(from 줄; to 줄) |
|---|---|---|---|---|---|---|---|---|---|
| r01 | design/elayadesign/landing-page-design | design/taste/design-taste-frontend | 참고 | 명시-이름 | 라이선스·출처 고지: redesign audit·콘텐츠·모션 아이디어를 taste-skill에서 차용·재작성(사용자 개입 없음) | - | - | 범위 내 | design/elayadesign/landing-page-design/SKILL.md:451; design/taste/design-taste-frontend/SKILL.md:4 |
| r02 | design/elayadesign/landing-page-design | redesign-existing-projects | 대안 | 명시-이름 | 제안: 신규 제작이 아닌 기존 사이트 개선 시 동반 스킬 사용 안내(사용자 선택) | - | - | 범위 밖 | design/elayadesign/landing-page-design/SKILL.md:18; - |
| r03 | design/elayadesign/landing-page-design | design/10k-websites/10k-websites | 대안 | 추론 | 같은 목적(랜딩/웹사이트 제작)이나 직접 연결 없음 | - | - | 범위 내 | design/elayadesign/landing-page-design/SKILL.md:1-18; design/10k-websites/10k-websites/SKILL.md:1-15 |
| r04 | design/elayadesign/landing-page-design | design/taste/design-taste-frontend | 대안 | 추론 | 같은 목적(웹사이트 제작)이나 직접 연결 없음 | - | - | 범위 내 | design/elayadesign/landing-page-design/SKILL.md:1-18; design/taste/design-taste-frontend/SKILL.md:1-25 |
| r05 | design/garden-skills/beautiful-article | design/garden-skills/web-design-engineer | 대안 | 명시-이름 | 경계 밖 안내: 웹 앱·대시보드·폼·프로토타입·랜딩 페이지는 `web-design-engineer` 소관. 모호하면 멈춰서 사용자에게 질문 | - | - | 범위 내 | design/garden-skills/beautiful-article/README.md:421; design/garden-skills/web-design-engineer/SKILL.md:1-18 |
| r06 | design/garden-skills/beautiful-article | reacticle-authoring | 참고 | 명시-이름 | 조건부 온디맨드: `reacticle` 컴포넌트 상세 API가 필요할 때 필요한 reference 파일만 읽기(사용자 개입 없음) | - | - | 범위 밖 | design/garden-skills/beautiful-article/references/component-policy.md:57-59; - |
| r07 | design/garden-skills/motion-showreel | design/garden-skills/web-video-presentation | 대안 | 명시-이름 | 강함(적용 범위 표): 클릭 진행·현장 발표·아티클→구술 대본 변환 요청은 `web-video-presentation`으로 라우팅(사용자 개입 없음) | - | - | 범위 내 | design/garden-skills/motion-showreel/SKILL.md:29; design/garden-skills/web-video-presentation/SKILL.md:1-15 |
| r08 | design/garden-skills/motion-showreel | design/garden-skills/web-design-engineer | 대안 | 명시-이름 | 강함(적용 불가 ❌): 웹페이지·랜딩·인터랙티브 프로토타입·정적 시안은 `web-design-engineer`로 라우팅(사용자 개입 없음) | - | - | 범위 내 | design/garden-skills/motion-showreel/SKILL.md:30; design/garden-skills/web-design-engineer/SKILL.md:1-18 |
| r09 | design/garden-skills/motion-showreel | Remotion / HyperFrames | 대안 | 명시-이름 | 조건부 옵트인: 사용자가 이미 사용 중이거나 직접 지목한 다중 장면 장편일 때만 허용, 먼저 도입 금지(사용자 명시 필요) | - | - | 범위 밖 | design/garden-skills/motion-showreel/references/stack.md:82; - |
| r10 | design/garden-skills/web-design-engineer | design/garden-skills/gpt-image-2 | 호출 | 명시-이름 | 선택적 위임: 이미지 우선 탐색 분기에서 `gpt-image-2`가 가용하면 구조화된 이미지 생성에 사용(사용자 개입 없음) | 이미지 프롬프트·생성 에셋 | - | 범위 내 | design/garden-skills/web-design-engineer/references/design-calibration.md:132; design/garden-skills/gpt-image-2/SKILL.md:1-40 |
| r11 | design/garden-skills/web-design-engineer | design/garden-skills/beautiful-article | 대안 | 명시-역할 | 강함(적용 제외): 원자료→장문 HTML 아티클 변환은 전용 스킬이 있으면 그쪽으로 라우팅(사용자 개입 없음) | - | - | 범위 내 | design/garden-skills/web-design-engineer/SKILL.md:18; design/garden-skills/beautiful-article/SKILL.md:1-20 |
| r12 | design/garden-skills/web-design-engineer | design/garden-skills/web-video-presentation | 대안 | 명시-역할 | 강함(적용 제외): 구술 비트→녹화용 웹 영상 프레젠테이션은 전용 스킬이 있으면 그쪽으로 라우팅(사용자 개입 없음) | - | - | 범위 내 | design/garden-skills/web-design-engineer/SKILL.md:18; design/garden-skills/web-video-presentation/SKILL.md:1-15 |
| r13 | design/emilkowalski/animate | design/emilkowalski/pick-ui-library | 호출 | 명시-이름 | 의무: 애니메이션이 아니라 UI 컴포넌트 자체가 필요하면 멈추고 `../pick-ui-library/SKILL.md`를 읽음(사용자 개입 없음) | - | - | 범위 내 | design/emilkowalski/animate/SKILL.md:81; design/emilkowalski/pick-ui-library/SKILL.md:1-20 |
| r14 | design/emilkowalski/animate | design/emilkowalski/review-animations | 참고 | 명시-이름 | 완료 전 자가 점검 항목이 `review-animations`의 자동 차단 기준과 같음을 명시(사용자 개입 없음) | - | - | 범위 내 | design/emilkowalski/animate/SKILL.md:20,179; design/emilkowalski/review-animations/SKILL.md:50-75 |
| r15 | design/emilkowalski/animate | design/emilkowalski/review-animations | 대안 | 명시-이름 | 역할 경계: 기존 모션 비평·diff 리뷰는 `review-animations` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/animate/SKILL.md:3,16; design/emilkowalski/review-animations/SKILL.md:1-20 |
| r16 | design/emilkowalski/animate | design/emilkowalski/improve-animations | 대안 | 명시-이름 | 역할 경계: 전체 코드베이스 모션 감사는 `improve-animations` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/animate/SKILL.md:3,16; design/emilkowalski/improve-animations/SKILL.md:1-20 |
| r17 | design/emilkowalski/animate | design/emilkowalski/find-animation-opportunities | 대안 | 명시-이름 | 역할 경계: 애니메이션 추가 후보 탐색은 `find-animation-opportunities` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/animate/SKILL.md:16; design/emilkowalski/find-animation-opportunities/SKILL.md:1-20 |
| r18 | design/emilkowalski/animate | design/emilkowalski/animate-expo | 대안 | 명시-이름 | 역할 경계: React Native/Expo 애니메이션은 `animate-expo` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/animate/SKILL.md:16; design/emilkowalski/animate-expo/SKILL.md:1-20 |
| r19 | design/emilkowalski/animate | choreograph | 참고 | 명시-이름 | 그룹 스태거 등장 구현 시 `../choreograph/SKILL.md` 지침 참조(미설치) | - | - | 범위 밖 | design/emilkowalski/animate/RECIPES.md:172; - |
| r20 | design/emilkowalski/animate-expo | design/emilkowalski/animate | 대안 | 명시-이름 | 역할 경계: 웹 애니메이션은 `animate` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/animate-expo/SKILL.md:3; design/emilkowalski/animate/SKILL.md:1-20 |
| r21 | design/emilkowalski/animation-performance | design/emilkowalski/animate | 대안 | 명시-이름 | 역할 경계: 이징·지속시간·애니메이션 여부 결정은 `animate` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/animation-performance/SKILL.md:3,16; design/emilkowalski/animate/SKILL.md:1-20 |
| r22 | design/emilkowalski/animation-performance | design/emilkowalski/review-animations | 대안 | 명시-이름 | 역할 경계: 모션 전반 리뷰 및 존재 여부 판단은 `review-animations` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/animation-performance/SKILL.md:3,16; design/emilkowalski/review-animations/SKILL.md:1-20 |
| r23 | design/emilkowalski/animation-performance | design/emilkowalski/animate-expo | 대안 | 명시-이름 | 역할 경계: React Native 스레드 처리는 `animate-expo` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/animation-performance/SKILL.md:16; design/emilkowalski/animate-expo/SKILL.md:1-20 |
| r24 | design/emilkowalski/apple-design | design/emilkowalski/animation-performance | 참고 | 명시-이름 | 합성기 친화적 속성(`transform`/`opacity`)과 `will-change` 상세 기준을 `../animation-performance/SKILL.md`에서 참조(사용자 개입 없음) | - | - | 범위 내 | design/emilkowalski/apple-design/SKILL.md:175; design/emilkowalski/animation-performance/SKILL.md:1-60 |
| r25 | design/emilkowalski/break-ui | design/emilkowalski/emil-design-eng | 대안 | 명시-이름 | 역할 경계: 시각 디자인 비평은 `emil-design-eng` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/break-ui/SKILL.md:3,16; design/emilkowalski/emil-design-eng/SKILL.md:1-20 |
| r26 | design/emilkowalski/break-ui | design/emilkowalski/review-animations | 대안 | 명시-이름 | 역할 경계: 모션 리뷰는 `review-animations` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/break-ui/SKILL.md:3,16; design/emilkowalski/review-animations/SKILL.md:1-20 |
| r27 | design/emilkowalski/break-ui | design/emilkowalski/prototype | 대안 | 명시-이름 | 역할 경계: 컴포넌트 재설계는 `prototype` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/break-ui/SKILL.md:16; design/emilkowalski/prototype/SKILL.md:1-20 |
| r28 | design/emilkowalski/emil-design-eng | choreograph | 참고 | 명시-이름 | 그룹 스태거 등장 구현 및 리뷰 체크리스트에서 `../choreograph/SKILL.md` 참조(미설치) | - | - | 범위 밖 | design/emilkowalski/emil-design-eng/SKILL.md:645,684; - |
| r29 | design/emilkowalski/find-animation-opportunities | design/emilkowalski/improve-animations | 다음 안내 | 명시-이름 | 제안: 사용자가 제안 표의 항목 구현을 원하면 `improve-animations plan <description>`으로 핸드오프 안내(사용자 요청 필요) | 제안 표 행·설명 | - | 범위 내 | design/emilkowalski/find-animation-opportunities/SKILL.md:26,135; design/emilkowalski/improve-animations/SKILL.md:90-108 |
| r30 | design/emilkowalski/find-animation-opportunities | design/emilkowalski/review-animations | 대안 | 명시-이름 | 역할 경계: 기존 애니메이션 수정·리뷰는 `review-animations` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/find-animation-opportunities/SKILL.md:3,16; design/emilkowalski/review-animations/SKILL.md:1-20 |
| r31 | design/emilkowalski/find-animation-opportunities | design/emilkowalski/improve-animations | 대안 | 명시-이름 | 역할 경계: 기존 애니메이션 감사·수정 계획은 `improve-animations` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/find-animation-opportunities/SKILL.md:3,16; design/emilkowalski/improve-animations/SKILL.md:1-20 |
| r32 | design/emilkowalski/find-animation-opportunities | choreograph | 참고 | 명시-이름 | 그룹 등장 스태거 탐색 시 `../choreograph/SKILL.md` 참조(미설치) | - | - | 범위 밖 | design/emilkowalski/find-animation-opportunities/SKILL.md:94; - |
| r33 | design/emilkowalski/improve-animations | design/emilkowalski/review-animations | 참고 | 명시-이름 | `execute <plan>` 시 서브에이전트 diff를 `../review-animations/STANDARDS.md` 기준으로 검증(사용자 개입 없음) | 구현 diff | - | 범위 내 | design/emilkowalski/improve-animations/SKILL.md:108; design/emilkowalski/review-animations/STANDARDS.md:1-50 |
| r34 | design/emilkowalski/improve-animations | design/emilkowalski/review-animations | 대안 | 명시-이름 | 역할 경계: 단일 diff 리뷰는 `review-animations` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/improve-animations/SKILL.md:18; design/emilkowalski/review-animations/SKILL.md:1-20 |
| r35 | design/emilkowalski/improve-animations | choreograph | 참고 | 명시-이름 | 그룹 등장 감사 시 `../choreograph/SKILL.md` 참조(미설치) | - | - | 범위 밖 | design/emilkowalski/improve-animations/AUDIT.md:102; - |
| r36 | design/emilkowalski/mobile-native | design/emilkowalski/animate | 참고 | 명시-이름 | 코드베이스가 `animate` 스킬의 토큰을 쓰면 새 커브를 만들지 않고 재사용(사용자 개입 없음) | 모션 토큰 | - | 범위 내 | design/emilkowalski/mobile-native/SKILL.md:144; design/emilkowalski/animate/SKILL.md:100-140 |
| r37 | design/emilkowalski/mobile-native | design/emilkowalski/animate | 대안 | 명시-이름 | 역할 경계: 모션 설계 자체는 `animate` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/mobile-native/SKILL.md:3,16; design/emilkowalski/animate/SKILL.md:1-20 |
| r38 | design/emilkowalski/mobile-native | design/emilkowalski/animate-expo | 대안 | 명시-이름 | 역할 경계: React Native는 `animate-expo` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/mobile-native/SKILL.md:3,16; design/emilkowalski/animate-expo/SKILL.md:1-20 |
| r39 | design/emilkowalski/mobile-native | design/emilkowalski/review-animations | 대안 | 명시-이름 | 역할 경계: 모션 리뷰는 `review-animations` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/mobile-native/SKILL.md:16; design/emilkowalski/review-animations/SKILL.md:1-20 |
| r40 | design/emilkowalski/prototype | design/emilkowalski/review-animations | 대안 | 명시-이름 | 역할 경계: 기존 UI 리뷰는 `review-animations` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/prototype/SKILL.md:17; design/emilkowalski/review-animations/SKILL.md:1-20 |
| r41 | design/emilkowalski/prototype | design/emilkowalski/improve-animations | 대안 | 명시-이름 | 역할 경계: 수정 계획 수립은 `improve-animations` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/prototype/SKILL.md:17; design/emilkowalski/improve-animations/SKILL.md:1-20 |
| r42 | design/emilkowalski/prototype | design/emilkowalski/pick-ui-library | 대안 | 명시-이름 | 역할 경계: 의존성 선택은 `pick-ui-library` 사용(사용자 선택) | - | - | 범위 내 | design/emilkowalski/prototype/SKILL.md:17; design/emilkowalski/pick-ui-library/SKILL.md:1-20 |
| r43 | design/emilkowalski/prototype | design/jakubkrehel/variant | 대안 | 추론 | 목적 유사(다중 UI 변형 생성·피커 선택)하나 작성자·메커니즘 다름 | - | - | 범위 내 | design/emilkowalski/prototype/SKILL.md:1-25; design/jakubkrehel/variant/SKILL.md:1-25 |
| r44 | design/emilkowalski/break-ui | design/jakubkrehel/break | 대안 | 추론 | 목적 유사(최악 데이터/시나리오 스트레스 테스트)하나 작성자 다름 | - | - | 범위 내 | design/emilkowalski/break-ui/SKILL.md:1-25; design/jakubkrehel/break/SKILL.md:1-25 |
| r45 | design/emilkowalski/review-animations | choreograph | 참고 | 명시-이름 | 에스컬레이션·stagger 규칙 기준으로 `../choreograph/SKILL.md` 참조(미설치) | - | - | 범위 밖 | design/emilkowalski/review-animations/SKILL.md:66; - |
| r46 | design/jakubkrehel/better-interface | design/jakubkrehel/better-accessibility | 호출 | 명시-이름 | 의무: 1번 순서로 로드·리뷰 후 결과 통합. 형식·심각도는 `better-interface`가 대체(사용자 개입 없음) | 도메인 리뷰 결과 | - | 범위 내 | design/jakubkrehel/better-interface/SKILL.md:44-54; design/jakubkrehel/better-accessibility/reporting.md:3-5 |
| r47 | design/jakubkrehel/better-interface | design/jakubkrehel/better-layout | 호출 | 명시-이름 | 의무: 2번 순서로 로드·리뷰 후 결과 통합(사용자 개입 없음) | 도메인 리뷰 결과 | - | 범위 내 | design/jakubkrehel/better-interface/SKILL.md:44-54; design/jakubkrehel/better-layout/reporting.md:3 |
| r48 | design/jakubkrehel/better-interface | design/jakubkrehel/better-writing | 호출 | 명시-이름 | 의무: 3번 순서로 로드·리뷰 후 결과 통합(사용자 개입 없음) | 도메인 리뷰 결과 | - | 범위 내 | design/jakubkrehel/better-interface/SKILL.md:44-54; design/jakubkrehel/better-writing/reporting.md:3 |
| r49 | design/jakubkrehel/better-interface | design/jakubkrehel/better-typography | 호출 | 명시-이름 | 의무: 4번 순서로 로드·리뷰 후 결과 통합(사용자 개입 없음) | 도메인 리뷰 결과 | - | 범위 내 | design/jakubkrehel/better-interface/SKILL.md:44-54; design/jakubkrehel/better-typography/reporting.md:3-5 |
| r50 | design/jakubkrehel/better-interface | design/jakubkrehel/better-colors | 호출 | 명시-이름 | 의무: 5번 순서로 로드·리뷰 후 결과 통합(사용자 개입 없음) | 도메인 리뷰 결과 | - | 범위 내 | design/jakubkrehel/better-interface/SKILL.md:44-54; design/jakubkrehel/better-colors/reporting.md:3-7 |
| r51 | design/jakubkrehel/better-interface | design/jakubkrehel/better-ui | 호출 | 명시-이름 | 의무: 6번 순서로 로드·리뷰 후 결과 통합(사용자 개입 없음) | 도메인 리뷰 결과 | - | 범위 내 | design/jakubkrehel/better-interface/SKILL.md:44-54; design/jakubkrehel/better-ui/reporting.md:3 |
| r52 | design/jakubkrehel/better-interface | better-motion | 호출 | 명시-이름 | 의무: 7번 순서로 로드 대상이나 미설치 시 `Not reviewed`로 남기고 계속 진행(사용자 개입 없음) | - | - | 범위 밖 | design/jakubkrehel/better-interface/SKILL.md:52,56; - |
| r53 | design/jakubkrehel/better-interface | design/jakubkrehel/interface-review | 다음 안내 | 명시-이름 | 의무: 브랜치·PR·미커밋 변경분 리뷰 요청이면 사용자에게 `interface-review` 실행을 요청(`disable-model-invocation: true`, 사용자 호출 필요) | - | - | 범위 내 | design/jakubkrehel/better-interface/SKILL.md:12,28-30; design/jakubkrehel/interface-review/SKILL.md:1-15 |
| r54 | design/jakubkrehel/interface-review | design/jakubkrehel/better-interface | 호출 | 명시-이름 | 의무: 7단계에서 범위 블록과 영향 surface를 `better-interface`에 넘겨 통합·판정. 미가용 시 중단(사용자 개입 없음) | 범위 블록·영향 surface | - | 범위 내 | design/jakubkrehel/interface-review/SKILL.md:11,93-97; design/jakubkrehel/better-interface/SKILL.md:32 |
| r55 | design/jakubkrehel/interface-review | design/jakubkrehel/better-interface | 다음 안내 | 명시-이름 | 제안: 리뷰할 변경이 없고 전체 저장소 감사를 택하면 `better-interface`로 이관(사용자 선택 필요) | - | - | 범위 내 | design/jakubkrehel/interface-review/SKILL.md:39,44; design/jakubkrehel/better-interface/SKILL.md:1-30 |
| r56 | design/jakubkrehel/interface-review | design/jakubkrehel/better-accessibility | 호출 | 명시-이름 | 제거 신호(포커스·ARIA 등) 및 이미지 변경 시 확인 위임(사용자 개입 없음) | 제거 신호·변경 파일 | - | 범위 내 | design/jakubkrehel/interface-review/removed-signals.md:7-11; design/jakubkrehel/better-accessibility/SKILL.md:1-20 |
| r57 | design/jakubkrehel/interface-review | design/jakubkrehel/better-colors | 호출 | 명시-이름 | 제거 신호(색상 토큰 등) 발생 시 확인 위임(사용자 개입 없음) | 제거 신호 | - | 범위 내 | design/jakubkrehel/interface-review/removed-signals.md:12,16; design/jakubkrehel/better-colors/SKILL.md:1-20 |
| r58 | design/jakubkrehel/interface-review | design/jakubkrehel/better-layout | 호출 | 명시-이름 | 제거 신호(간격·RTL 등) 발생 시 확인 위임(사용자 개입 없음) | 제거 신호 | - | 범위 내 | design/jakubkrehel/interface-review/removed-signals.md:13; design/jakubkrehel/better-layout/SKILL.md:1-20 |
| r59 | design/jakubkrehel/interface-review | design/jakubkrehel/better-typography | 호출 | 명시-이름 | 제거 신호(폰트·줄바꿈 등) 및 폰트 파일 변경 시 확인 위임(사용자 개입 없음) | 제거 신호·폰트 변경 | - | 범위 내 | design/jakubkrehel/interface-review/removed-signals.md:14-15; design/jakubkrehel/better-typography/SKILL.md:1-20 |
| r60 | design/jakubkrehel/interface-review | design/jakubkrehel/better-writing | 호출 | 명시-이름 | 제거 신호(카피·레이블 등) 발생 시 확인 위임(사용자 개입 없음) | 제거 신호 | - | 범위 내 | design/jakubkrehel/interface-review/removed-signals.md:17; design/jakubkrehel/better-writing/SKILL.md:1-20 |
| r61 | design/jakubkrehel/interface-review | design/jakubkrehel/better-ui | 참고 | 명시-이름 | 이미지 추가 시 `better-ui` 규칙 함께 확인(사용자 개입 없음) | - | - | 범위 내 | design/jakubkrehel/interface-review/scope-resolution.md:73; design/jakubkrehel/better-ui/SKILL.md:1-20 |
| r62 | design/jakubkrehel/better-accessibility | design/jakubkrehel/better-colors | 호출 | 명시-이름 | 의무: 렌더링 색상 대비 측정은 `better-colors` 사용. 색상 수정은 사용자 요청 시에만 수행 | 대비 측정값 | - | 범위 내 | design/jakubkrehel/better-accessibility/SKILL.md:80; design/jakubkrehel/better-colors/contrast.md:5 |
| r63 | design/jakubkrehel/better-accessibility | design/jakubkrehel/better-layout | 참고 | 명시-이름 | 포커스 가림 패딩·텍스트 컨테이너·브레이크포인트 소유권 참조(사용자 개입 없음) | - | - | 범위 내 | design/jakubkrehel/better-accessibility/SKILL.md:32,106; design/jakubkrehel/better-layout/SKILL.md:12 |
| r64 | design/jakubkrehel/better-accessibility | design/jakubkrehel/better-typography | 참고 | 명시-이름 | 텍스트 크기·iOS 16px 입력 줌·언어 메타데이터 소유권 참조(사용자 개입 없음) | - | - | 범위 내 | design/jakubkrehel/better-accessibility/SKILL.md:12,106; design/jakubkrehel/better-typography/SKILL.md:10 |
| r65 | design/jakubkrehel/better-accessibility | design/jakubkrehel/better-writing | 참고 | 명시-이름 | 레이블·에러·alt 텍스트 문구 소유권 구분(사용자 개입 없음) | - | - | 범위 내 | design/jakubkrehel/better-accessibility/SKILL.md:12; design/jakubkrehel/better-writing/SKILL.md:12 |
| r66 | design/jakubkrehel/better-accessibility | design/jakubkrehel/better-ui | 참고 | 명시-이름 | 호버 스타일링·스크롤 가둠 소유권 구분(사용자 개입 없음) | - | - | 범위 내 | design/jakubkrehel/better-accessibility/SKILL.md:12; design/jakubkrehel/better-ui/SKILL.md:16 |
| r67 | design/jakubkrehel/better-typography | design/jakubkrehel/better-colors | 호출 | 명시-이름 | 대비 측정은 `better-colors` 사용, 통과 여부는 `better-accessibility` 판단(사용자 개입 없음) | 대비 측정값 | - | 범위 내 | design/jakubkrehel/better-typography/SKILL.md:10; design/jakubkrehel/better-colors/contrast.md:5 |
| r68 | design/jakubkrehel/better-typography | design/jakubkrehel/better-layout | 참고 | 명시-이름 | 말줄임 후 전체 텍스트 복원 UI 및 공간 RTL 소유권 참조(사용자 개입 없음) | - | - | 범위 내 | design/jakubkrehel/better-typography/SKILL.md:10,77; design/jakubkrehel/better-layout/SKILL.md:42 |
| r69 | design/jakubkrehel/better-typography | design/jakubkrehel/better-writing | 참고 | 명시-이름 | 카피 문구 자체는 `better-writing` 소유(사용자 개입 없음) | - | - | 범위 내 | design/jakubkrehel/better-typography/SKILL.md:10; design/jakubkrehel/better-writing/SKILL.md:12 |
| r70 | design/jakubkrehel/better-typography | design/jakubkrehel/better-accessibility | 참고 | 명시-이름 | 시맨틱 제목 구조 및 대비 통과 판정 소유권 참조(사용자 개입 없음) | - | - | 범위 내 | design/jakubkrehel/better-typography/SKILL.md:10; design/jakubkrehel/better-accessibility/SKILL.md:12 |
| r71 | design/jakubkrehel/better-layout | design/jakubkrehel/better-colors | 참고 | 명시-이름 | 주 행동 강조 색상 규칙은 `better-colors` 소유(사용자 개입 없음) | - | - | 범위 내 | design/jakubkrehel/better-layout/SKILL.md:36; design/jakubkrehel/better-colors/SKILL.md:12 |
| r72 | design/jakubkrehel/better-ui | design/jakubkrehel/better-accessibility | 참고 | 명시-이름 | 폼 입력 3:1 경계 대비·포커스 링·아이콘 버튼 접근성 이름은 `better-accessibility` 소유(사용자 개입 없음) | - | - | 범위 내 | design/jakubkrehel/better-ui/SKILL.md:16,28; design/jakubkrehel/better-accessibility/SKILL.md:12 |
| r73 | design/jakubkrehel/better-writing | design/jakubkrehel/better-accessibility | 참고 | 명시-이름 | 아이콘 버튼 접근성 속성·가시적 레이블 필요성·실행 취소 토스트 유지 시간은 `better-accessibility` 소유(사용자 개입 없음) | - | - | 범위 내 | design/jakubkrehel/better-writing/SKILL.md:12,57,120; design/jakubkrehel/better-accessibility/SKILL.md:12 |
| r74 | design/jakubkrehel/better-writing | design/jakubkrehel/better-colors | 참고 | 명시-이름 | 파괴적 확인 버튼의 구분 색상은 `better-colors` 소유(사용자 개입 없음) | - | - | 범위 내 | design/jakubkrehel/better-writing/SKILL.md:98; design/jakubkrehel/better-colors/SKILL.md:12 |
| r75 | design/jakubkrehel/afk | design/jakubkrehel/better-accessibility | 호출 | 명시-이름 | 5단계 구현 중 UI 작업이 포함되면 소유 도메인 스킬(예: `better-accessibility`) 규칙을 통과해야 함(사용자 개입 없음) | - | - | 범위 내 | design/jakubkrehel/afk/SKILL.md:95; design/jakubkrehel/better-accessibility/SKILL.md:1-20 |
| r76 | design/jakubkrehel/afk | design/jakubkrehel/better-interface | 대안 | 명시-이름 | 역할 경계: 인터페이스 리뷰는 `better-interface` 사용(사용자 선택) | - | - | 범위 내 | design/jakubkrehel/afk/SKILL.md:11; design/jakubkrehel/better-interface/SKILL.md:1-15 |
| r77 | design/jakubkrehel/afk | design/jakubkrehel/interface-review | 대안 | 명시-이름 | 역할 경계: diff 리뷰는 `interface-review` 사용(수동 호출 필요) | - | - | 범위 내 | design/jakubkrehel/afk/SKILL.md:11; design/jakubkrehel/interface-review/SKILL.md:1-15 |
| r78 | design/jakubkrehel/afk | design/jakubkrehel/variant | 대안 | 명시-이름 | 역할 경계: 컴포넌트 대안 탐색은 `variant` 사용(수동 호출 필요) | - | - | 범위 내 | design/jakubkrehel/afk/SKILL.md:11; design/jakubkrehel/variant/SKILL.md:1-15 |
| r79 | design/jakubkrehel/afk | design/jakubkrehel/break | 대안 | 명시-이름 | 역할 경계: 컴포넌트 스트레스 테스트는 `break` 사용(수동 호출 필요) | - | - | 범위 내 | design/jakubkrehel/afk/SKILL.md:11; design/jakubkrehel/break/SKILL.md:1-15 |
| r80 | design/jakubkrehel/break | design/jakubkrehel/better-interface | 대안 | 명시-이름 | 역할 경계: 기준 대비 코드 리뷰는 `better-interface`·`interface-review` 사용(사용자 선택) | - | - | 범위 내 | design/jakubkrehel/break/SKILL.md:11; design/jakubkrehel/better-interface/SKILL.md:1-15 |
| r81 | design/jakubkrehel/break | design/jakubkrehel/variant | 대안 | 명시-이름 | 역할 경계: 디자인 대안 탐색은 `variant` 사용(사용자 선택) | - | - | 범위 내 | design/jakubkrehel/break/SKILL.md:11,13; design/jakubkrehel/variant/SKILL.md:1-15 |
| r82 | design/jakubkrehel/break | design/jakubkrehel/state-machine | 대안 | 명시-이름 | 역할 경계: 제품 상태별 확인은 `state-machine` 사용(사용자 선택) | - | - | 범위 내 | design/jakubkrehel/break/SKILL.md:11; design/jakubkrehel/state-machine/SKILL.md:1-15 |
| r83 | design/jakubkrehel/break | design/jakubkrehel/better-typography | 결과 전달 | 명시-이름 | 깨짐 보고 시 소유 도메인 스킬로 귀속하며 수정 요청 시 해당 스킬 규칙 적용(수정 요청 필요) | 깨짐 보고·소유자 라벨 | - | 범위 내 | design/jakubkrehel/break/SKILL.md:57,64; design/jakubkrehel/better-typography/SKILL.md:1-20 |
| r84 | design/jakubkrehel/build-design | design/jakubkrehel/better-accessibility | 참고 | 명시-이름 | 디자인과 도메인 규칙 충돌 시 소유 스킬(`better-accessibility` 등)을 보고하고 준수(사용자 개입 없음) | 충돌 보고 | - | 범위 내 | design/jakubkrehel/build-design/SKILL.md:12,67; design/jakubkrehel/better-accessibility/SKILL.md:1-20 |
| r85 | design/jakubkrehel/build-design | design/jakubkrehel/interface-review | 대안 | 명시-이름 | 역할 경계: 구현 완료 후 리뷰는 `interface-review` 사용(수동 호출 필요) | - | - | 범위 내 | design/jakubkrehel/build-design/SKILL.md:12; design/jakubkrehel/interface-review/SKILL.md:1-15 |
| r86 | design/jakubkrehel/explain-interface | design/jakubkrehel/better-colors | 참고 | 명시-이름 | 이미지·시스템 분석 시 `better-colors`, `better-typography`, `better-layout` 용어·기준으로 해석(사용자 개입 없음) | - | - | 범위 내 | design/jakubkrehel/explain-interface/SKILL.md:11; design/jakubkrehel/better-colors/SKILL.md:1-20 |
| r87 | design/jakubkrehel/teardown | design/jakubkrehel/better-accessibility | 참고 | 명시-이름 | 일러스트 제품 임베딩 시 접근성 이름·부품 목록 대안·컨트롤 규칙 참조(사용자 개입 없음) | - | - | 범위 내 | design/jakubkrehel/teardown/SKILL.md:14; design/jakubkrehel/better-accessibility/SKILL.md:1-20 |
| r88 | design/jakubkrehel/variant | design/jakubkrehel/better-interface | 호출 | 명시-이름 | 의무: 모든 변형 후보는 피커 등록 전 `better-interface`의 에스컬레이션 트리거를 반드시 통과해야 함(사용자 개입 없음) | 변형 후보 | - | 범위 내 | design/jakubkrehel/variant/SKILL.md:29-41; design/jakubkrehel/better-interface/SKILL.md:1-20 |
| r89 | design/jakubkrehel/variant | design/jakubkrehel/better-layout | 참고 | 명시-이름 | 변형 축 소유권 매핑: Structure/Density는 `better-layout`, Emphasis는 `better-colors`, Type은 `better-typography`, Voice는 `better-writing` 참조(사용자 개입 없음) | - | - | 범위 내 | design/jakubkrehel/variant/SKILL.md:17-23; design/jakubkrehel/better-layout/SKILL.md:1-20 |
| r90 | design/jakubkrehel/state-machine | design/jakubkrehel/break | 대안 | 명시-이름 | 역할 경계: 최악 시나리오 동시 렌더링은 `break`, 대안 탐색은 `variant`, 리뷰는 `interface-review` 사용(사용자 선택) | - | - | 범위 내 | design/jakubkrehel/state-machine/SKILL.md:11; design/jakubkrehel/break/SKILL.md:1-15 |
| r91 | design/impeccable/impeccable | Google Labs DESIGN.md / Stitch | 참고 | 명시-이름 | `document` 커맨드가 공식 `DESIGN.md` 스펙과 Stitch 린터·`.impeccable/design.json` sidecar 형식을 따름(사용자 개입 없음) | DESIGN.md·design.json | - | 범위 밖 | design/impeccable/impeccable/reference/document.md:3,7,255; - |

## 묶음
| group-id | 작업 목표 | 구성 스킬과 역할 | 그림 |
|---|---|---|---|
| site-design-choice | 랜딩 페이지와 웹사이트를 처음부터 설계·구축한다 | `10k-websites`(선택지), `landing-page-design`(선택지), `design-taste-frontend`(선택지), `web-design-engineer`(선택지), `impeccable`(선택지) | - |
| garden-visual | Garden 계열 시각 아티클·이미지·영상·지식검색을 수행한다 | `beautiful-article`(선택지), `gpt-image-2`(단계), `kb-retriever`(안내), `motion-showreel`(선택지), `web-design-engineer`(선택지), `web-video-presentation`(선택지) | - |
| motion-craft | 웹·모바일 애니메이션을 설계·진단·개선·리뷰한다 | `animate`(단계), `animate-expo`(변형), `animation-performance`(선택지), `find-animation-opportunities`(단계), `improve-animations`(단계), `review-animations`(단계), `animation-vocabulary`(안내), `apple-design`(안내), `emil-design-eng`(안내) | - |
| ui-component | UI 라이브러리 선택·프로토타입 비교·극한 데이터 테스트를 수행한다 | `pick-ui-library`(선택지), `prototype`(단계), `break-ui`(단계), `ask-sonner`(안내), `mobile-native`(선택지), `animate`(단계), `stageshow`(선택지) | - |
| interface-audit | Jakubkrehel 도메인 규칙으로 인터페이스 전체와 변경분을 리뷰·개선한다 | `better-interface`(단계), `interface-review`(단계), `better-accessibility`(단계), `better-colors`(단계), `better-layout`(단계), `better-typography`(단계), `better-ui`(단계), `better-writing`(단계), `afk`(선택지), `build-design`(단계) | - |
| component-workbench | 컴포넌트 스트레스 테스트·상태 확인·대안 비교·역설계·기술 일러스트를 수행한다 | `break`(선택지), `state-machine`(선택지), `variant`(선택지), `explain-interface`(안내), `teardown`(선택지) | - |
