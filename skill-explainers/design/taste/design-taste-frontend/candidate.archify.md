# design-taste-frontend — 업종별 뽑기와 내장 에셋·Chrome 게이트로 웹사이트 제작 {#overview}

design-taste-frontend는 에이전트가 업종 분류와 무작위 뽑기로 색·글꼴·레이아웃·동작을 먼저 고정하고, 내장 키트와 실사·아이콘·성능 린트·브라우저 검사를 통과한 기업 웹사이트를 만들게 한다.[](source:fm)[](source:house)[](source:gate) **부분 분석**: 커밋된 원본 1,631개 파일 중 `SKILL.md`와 규칙·에셋 안내 문서 27개를 전체 읽었고 1MB 통합 검사기·CLI 스크립트 12종·레시피 사전 등 17개는 선두·목차만 확인했으며, `assets/` 하위 1,585개 구현·에셋 파일은 구조만 파악했다.[](source:cons)[](source:seclib)

- 랜딩 페이지·회사·제품·가게·서비스·SaaS·AI·개발자 도구·게임 웹사이트를 정적 HTML이나 React·Next.js·Vue·Svelte·Astro 프로젝트 안에 새로 만들거나, 기존 화면의 "AI 티"를 벗겨 다시 구성할 때 모델이 판단해 켠다.[](source:fm)
- 결과로 업종·뽑기 이력(`.taste-skill/`), 내장 키트로 조립된 반응형 페이지(95% 중립색, 한 화면 한 섹션), 로컬화된 아이콘·사진·출처 1줄, `copy-lint`·Chrome 검사 결과와 `GATE:` 보고서가 남는다.[](source:run1)[](source:run4)
- 다른 스킬과는 `landing-page-design`이 이 스킬을 참고·대안으로 삼는 관계로 이어진다.
- 가짜 후기·수치·연락처, 보라·라벤더 배색, 일반 업종 WebGL·그라데이션, 스크롤 페이드 인, 키트 원본 파일 수정을 금지하고 통과 전 Stop 훅 종료를 막는다.[](source:never)[](source:gate)

@answer scope="design/taste/design-taste-frontend · 원본 일부(1,631 중 27+17표본) · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: 이름, description, Claude Stop 훅" path=design/taste/design-taste-frontend/SKILL.md lines=1:20
@source house title="House rules: 절대 우선 9대 기본 규칙" path=design/taste/design-taste-frontend/SKILL.md lines=30:56
@source kind title="Section 1: 6종 업종 분류와 기술/일반 경계" path=design/taste/design-taste-frontend/SKILL.md lines=58:81
@source run1 title="Section 4 Step 0~1: 스택 준비와 gate.mjs 무장" path=design/taste/design-taste-frontend/SKILL.md lines=158:178
@source run2 title="Section 4 Step 2~4: 카피, 화면 계획, CLI 무작위 뽑기" path=design/taste/design-taste-frontend/SKILL.md lines=179:229
@source run3 title="Section 4 Step 5~6: 키트 조립과 Chrome 5중 검사" path=design/taste/design-taste-frontend/SKILL.md lines=230:290
@source run4 title="Section 4 Step 7: 최종 보고 포맷" path=design/taste/design-taste-frontend/SKILL.md lines=291:297
@source never title="Section 6: 절대 금지 목록" path=design/taste/design-taste-frontend/SKILL.md lines=365:378
@source gate title="gate.md: Stop 훅, 라운드 3회, 면제 5건 규약" path=design/taste/design-taste-frontend/references/gate.md lines=1:204
@source sys title="system.md: 색상 95% 중립, 버튼, 내비, 폼, 접근성" path=design/taste/design-taste-frontend/references/system.md lines=66:211
@source ly title="layout-v4.md: 100svh 섹션 높이, 11종 히어로, 대칭 그리드" path=design/taste/design-taste-frontend/references/layout-v4.md lines=1:297
@source copy title="copy.md: 카피 5대 규칙, 연락처, 가정 표기" path=design/taste/design-taste-frontend/references/copy.md lines=1:193
@source copyv title="copy-voice.md: 팩트 시트, 목소리 카드, 문체 예산" path=design/taste/design-taste-frontend/references/copy-voice.md lines=1:179
@source cards title="cards.md: 2단계 깊이 카드와 조각 배치 규칙" path=design/taste/design-taste-frontend/references/cards.md lines=1:309
@source icons title="icons.md: logos/si/file/ui 아이콘 출처와 보라색 예외" path=design/taste/design-taste-frontend/references/icons.md lines=1:86
@source photos title="photos.md: 실사 라이브러리·위키미디어 검색·대용 표기" path=design/taste/design-taste-frontend/references/photos.md lines=1:263
@source motion title="motion.md: 3계층 모션, 루프, 감소 모션 규약" path=design/taste/design-taste-frontend/references/motion.md lines=1:234
@source fxuse title="effects-usage.md: 기술 업종 한정 1이펙트·4컨텍스트 예산" path=design/taste/design-taste-frontend/references/effects-usage.md lines=1:182
@source perf title="perf.md: 전송량·이미지·폰트·WebGL·FCP/LCP/CLS 기준" path=design/taste/design-taste-frontend/references/perf.md lines=1:46
@source seclib title="sections-library.md: 섹션 레시피 공통 규칙(선두 100줄)" path=design/taste/design-taste-frontend/references/sections-library.md lines=1:100
@source cons title="consistency.mjs: 브라우저 검사 항목 상단 80줄 명세" path=design/taste/design-taste-frontend/scripts/consistency.mjs lines=1:80
@source deal title="deal.mjs: 히어로 무작위 뽑기 CLI 상단 명세" path=design/taste/design-taste-frontend/assets/layout/deal.mjs lines=1:35
@source start title="start.mjs: 팔레트·폰트 페어링 CLI 상단 명세" path=design/taste/design-taste-frontend/scripts/start.mjs lines=1:50
@source shoot title="shoot.mjs: 헤드리스 타일 촬영과 프로필 경로 규약" path=design/taste/design-taste-frontend/scripts/shoot.mjs lines=1:51
@source pal title="palettes.json: 업종별 팔레트 카탈로그(선두 샘플)" path=design/taste/design-taste-frontend/library/palettes.json lines=1:100
@source typ title="type.json: 폰트 페어링 카탈로그(선두 샘플)" path=design/taste/design-taste-frontend/library/type.json lines=1:100
@source elaya1 title="landing-page-design: 웹사이트 제작 목적" path=design/elayadesign/landing-page-design/SKILL.md lines=1:18
@source elaya2 title="landing-page-design Credits: taste-skill 차용·재작성 고지" path=design/elayadesign/landing-page-design/SKILL.md lines=451:451

## 어떻게 동작하나 {#flow span=12}

그림은 `SKILL.md` Section 4의 8단계 실행 흐름을 세 국면으로 묶어 그렸다. `gate.mjs`가 `Stop` 훅이나 수동 실행에서 `GATE: FAIL`을 내면 최대 3라운드까지 수정을 반복하며, `GATE: OPEN`(라운드 소진)이나 사용자 중단(`--done`)으로도 보고 단계로 넘어간다.[](source:run3)[](source:gate)

@workflow id=flow-diagram title="design-taste-frontend 흐름"
| lane prep | 분류·카피·뽑기 |
| lane build | 키트 조립·에셋 지역화 |
| lane verify | 검사·종료 게이트 |
| arm | 스택 준비·게이트 무장 | backend | prep | source:run1 |
| copy | 카피 작성·보이스 잠금 | backend | prep | source:run2 |
| deal | 화면 계획·CLI 뽑기 | backend | prep | source:run2 |
| assemble | 내장 키트 조립 | backend | build | source:run3 |
| localize | 에셋 지역화 | backend | build | source:run3 |
| check | Chrome 검사·Stop 훅 통과? | external | verify | source:gate |
| report | 출고 보고·대체재 전달 | backend | verify | source:run4 |
| arm > copy | |
| copy > deal | |
| deal > assemble | 이력 기록 후 |
| assemble > localize | |
| localize > check | |
| check > assemble | 아니오, FAIL 수정(최대 3라운드) |
| check > report | 예, PASS·OPEN·DONE | emphasis |

@steps id=flow-steps
| s-arm | 스택 준비·게이트 무장 | **입력** 사용자 브리프, 프로젝트 폴더 · **참조** `SKILL.md` Section 1·4 · `references/gate.md` · **실행** `node <skill>/scripts/gate.mjs --start index.html --kind <kind> --category "<what is sold>" --primary "<main action>"` (내부: `.taste-skill/build.json` 생성, 상단 CLI 확인) · **출력** `page-type`·`site-kind` 선언, 복사된 `assets/`(또는 `public/assets/`), 무장된 게이트. **처리** 비즈니스 성격을 `software`·`gaming`·`tech`·`product`·`service`·`place`로 분류하고 페이지를 한 줄도 쓰기 전에 종료 게이트를 먼저 켠다.[](source:kind)[](source:run1)[](source:gate) **다음** 프레임워크 앱이면 개발 서버 URL이나 정적 빌드 산출물(`--root dist`·`out`)을 지정한다.[](source:run1) | flow-diagram | arm |
| s-copy | 카피 작성·보이스 잠금 | **입력** 브리프의 사실 자료 · **참조** `references/copy.md` · `copy-voice.md` · `copy-registers.md` · `copy-moves.md` · `copy-tells.md` · **출력** 전체 페이지 문구 초안, 보이스 카드(1줄 요약). **처리** 시각 디자인 전에 `h1`(카테고리+대상/지역), 첫 화면 수치·장소·가격 1개 이상, `동사 + 목적어` 버튼을 확정하고 꾸며낸 후기·통계·자리표시를 배제한다.[](source:run2)[](source:copy)[](source:copyv) **다음** 가게·장소의 영업시간·가격을 추정한 요소에는 `data-assumed`를 붙인다.[](source:copy) | flow-diagram | copy |
| s-deal | 화면 계획·CLI 뽑기 | **입력** 카피 초안, 보유 사진·UI·영상·3D(`--has`), `.taste-skill/history.json` · **참조** `references/sections.md` · `layout-v4.md` · `effects-usage.md` · **실행** `node <skill>/assets/layout/deal.mjs` · `scripts/start.mjs deal/css/brand` · `scripts/moments.mjs pick` · `scripts/effects.mjs pick` · `assets/backgrounds/pick.mjs` · `scripts/photos.mjs pick/search` (내부: 이력 기반 난수 추출, 상단 CLI 확인) · **출력** `1~2`화면(`100svh`) 섹션 계획과 뽑힌 팔레트·폰트·히어로·모먼트·배경 ID. **처리** 에이전트의 취향 선택 대신 `history.json`(또는 `TASTE_SKILL_RECENT`)으로 중복을 피해 조합을 뽑고, 일반 업종(`other`)은 WebGL·그라데이션·어두운 히어로를 제외한다.[](source:run2)[](source:deal)[](source:start)[](source:fxuse) **다음** 보라·라벤더색이 나오면 다시 뽑고 결과를 `<body>` 상단 주석에 적는다.[](source:run2) | flow-diagram | deal |
| s-assemble | 내장 키트 조립 | **입력** 뽑기 결과, `assets/starter.html`, `assets/*` 키트 · **참조** `references/system.md` · `cards.md` · `motion.md` · `scenes.md` · **출력** 완성된 HTML/컴포넌트 골격. **처리** `starter.html`과 CSS/모션 계층을 유지한 채 히어로(`<section class="hero">`만)·UI 조각·다이어그램의 샘플 문구·로고를 고객 데이터로 교체한다.[](source:run3)[](source:cards) **다음** 모션 레이어(`motion.css`/`motion.js`)와 키트 파일은 수정하지 않는다.[](source:never)[](source:motion) | flow-diagram | assemble |
| s-localize | 에셋 지역화 | **입력** 조립된 HTML/컴포넌트 · **참조** `references/icons.md` · `photos.md` · **실행** `node <skill>/scripts/icons.mjs scan index.html --out assets/icons --colour` · `photos.mjs fetch/credits` · `make-posters.mjs` (내부: 로컬 SVG·WebP·스틸 생성, 상단 CLI 확인) · **출력** 로컬 아이콘·사진·출처 1줄. **처리** 외부 아이콘·사진을 로컬 에셋으로 내려받고 3D 요청 시만 제품 스틸을 굽는다.[](source:run3)[](source:icons)[](source:photos) | flow-diagram | localize |
| s-check | Chrome 검사·Stop 훅 통과? | **입력** 완성된 로컬 HTML 또는 빌드 산출물 · **참조** `references/gate.md` · `perf.md` · **실행** `copy-lint.mjs` · `consistency.mjs` · `assets/layout/check.mjs` · `shoot.mjs` · `perf.mjs` · `gate.mjs` (`Stop` 훅 자동 또는 수동 실행, 내부 구현 부분 미확인) · **출력** `1440`·`1024`·`820`·`768`·`390`·`320` 검사 로그, 접촉 시트, `GATE:` 라인. **처리** 헤드리스 CPU Chrome(`127.0.0.1` HTTP, PID 종료)으로 정적 카피·레이아웃 절단·빈 캔버스·WebGL 폴백·성능을 검사하고 `Stop` 훅이 `FAIL` 시 최대 3라운드까지 종료를 막는다.[](source:run3)[](source:gate)[](source:perf)[](source:shoot) **다음** 검사 오탐만 `.taste-skill/waivers.json`에 최대 5건 면제할 수 있으며(`kit-edited`·`checker-gaming` 불가), `GATE: SETUP`/`ERROR`/`OFF` 분기를 따른다.[](source:run3)[](source:gate) | flow-diagram | check |
| s-report | 출고 보고·대체재 전달 | **입력** 최종 `GATE:` 라인, `.taste-skill/waivers.json`, `names.json`, `data-assumed` 항목 · **참조** `SKILL.md` Section 4 Step 7 · **출력** 최종 보고서. **처리** 첫 줄에 `GATE:` 판정을 두고 면제 항목·뽑기 결과(팔레트 적합 사유 1문장)·보이스 카드·검사 결과·추정값·`.example` 임시 메일·클라이언트가 촬영해 교체할 대용 사진(`stand-in`)과 파일 슬롯 목록을 빠짐없이 보고한다.[](source:run4)[](source:copy) | flow-diagram | report |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 호출 명령은 따로 없고 모델이 `description`을 보고 자동으로 켜며, 호출 시 Claude Code에서 `hooks.Stop`이 `gate.mjs --hook claude`를 자동 등록한다. 호출 제한 필드는 원문에 명시 없음.[](source:fm)[](source:gate) |
| 성격 | 업종 분류·난수 뽑기 CLI·내장 웹 에셋 키트·헤드리스 Chrome 다중 검사·`Stop` 훅 강제 게이트를 결합한 절차형 제작 하네스다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| landing-page-design {#rel-r01} | **이 스킬** | 참고 | 라이선스·출처 고지에 따라 `landing-page-design`의 redesign audit·콘텐츠·모션 아이디어를 이 스킬(`taste-skill`)에서 차용·재작성했다. 사용자 개입은 없다.[](source:elaya2)[](source:fm) |
| landing-page-design {#rel-r04} | **이 스킬** | 대안 | 추론: 웹사이트를 제작하는 같은 목적이나 두 스킬 사이에 직접 호출이나 파일 공유 연결은 없다.[](source:elaya1)[](source:fm) |

@architecture id=relation-map title="design-taste-frontend와 이어지는 스킬"
| elaya | landing-page-design | backend |
| self | design-taste-frontend(이 스킬) | backend |
| elaya > self | 참고 · 대안 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

커밋 총 1,663개 파일 중 번역본 32개(`*.ko.md`·`*.ko.stale.md`)를 뺀 원본 1,631개 파일의 구성이다(`27`개 전체 읽기, `17`개 선두·목차 샘플, `1,587`개 미독/구조 확인).

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 9대 House rules, 6종 업종 분류표, 0~7단계 실행법, 체크리스트, 금지표 | 스킬이 켜질 때 항상 먼저 읽는다 | 스택 준비·게이트 무장; 카피 작성·보이스 잠금; 화면 계획·CLI 뽑기; 내장 키트 조립·에셋 지역화; Chrome 검사·Stop 훅 통과?; 출고 보고·대체재 전달 |
| `references/system.md`, `layout-v4.md`, `sections.md`, `sections-library.md`(샘플) | 95% 중립색·버튼·내비·폼·접근성 규격, `100svh` 높이·11종 히어로·그리드, 업종별 섹션 계획과 레시피 | 첫 페이지 전에 `system`·`layout-v4`·`sections`를 읽고 쓸 섹션 레시피만 조회 | 카피 작성·보이스 잠금; 화면 계획·CLI 뽑기; 내장 키트 조립·에셋 지역화 |
| `references/copy.md`, `copy-voice.md`, `copy-registers.md`, `copy-moves.md`, `copy-tells.md` | 카피 5대 규칙·연락처·가정 규약, 팩트 시트·12종 레지스터, 영역별 기법, AI 말투 지표 | 첫 문장을 쓰기 전에 읽고 카피 작성·자체 점검에 적용 | 카피 작성·보이스 잠금; Chrome 검사·Stop 훅 통과? |
| `references/cards.md`, `diagrams.md`, `icons.md`, `photos.md`, `backgrounds.md` | 2단계 카드·패널 규칙, 27개 다이어그램, `logos`/`si`/`file`/`ui` 아이콘, 실사·대용 사진, 16종 CSS 배경 | 해당 에셋군을 페이지에 쓸 때 먼저 읽는다 | 화면 계획·CLI 뽑기; 내장 키트 조립·에셋 지역화 |
| `references/motion.md`, `moments.md`, `effects-usage.md`, `effects-creative.md`, `effects-objects.md`, `scenes.md` | 3계층 모션 수치, 13종 모먼트 뽑기·정지 규약, 기술 업종 1이펙트·4컨텍스트 예산, 3D 제품 렌더·빅 씬 | 모션·모먼트·기술 업종 이펙트·3D 오브젝트·빅 씬 사용 시 | 화면 계획·CLI 뽑기; 내장 키트 조립·에셋 지역화 |
| `references/gate.md`, `perf.md` | `Stop` 훅 설정·라운드 3회·면제 규약과 전송량·이미지·폰트·WebGL·속도 예산 | 게이트 무장·면제 처리 및 성능 검증 시 | 스택 준비·게이트 무장; Chrome 검사·Stop 훅 통과? |
| `scripts/start.mjs`, `moments.mjs`, `effects.mjs`, `photos.mjs`, `icons.mjs`, `assets/layout/deal.mjs`, `assets/backgrounds/pick.mjs`, `library/palettes.json`, `type.json`(이상 샘플) | 팔레트·폰트·히어로·배경·모먼트·이펙트·사진·로컬 아이콘 뽑기/조회 명령줄(`CLI`)과 색상·폰트 카탈로그 JSON | 이력 기반 무작위 뽑기 및 로컬 에셋 생성 시 호출 | 화면 계획·CLI 뽑기; 내장 키트 조립·에셋 지역화 |
| `scripts/copy-lint.mjs`, `consistency.mjs`, `shoot.mjs`, `perf.mjs`, `gate.mjs`, `assets/layout/check.mjs`(이상 샘플) | 카피 말투 린터, Chrome 기반 UI·레이아웃·성능·타일 검사기, `Stop` 훅 종료 게이트 | 게이트 시작, 중간 점검(`--quick`), 최종 종료 검증 시 실행 | 스택 준비·게이트 무장; Chrome 검사·Stop 훅 통과? |
| `assets/effects/README.md`, `assets/objects/_print-core/README.md`, `_scenes/README.md`, `photo-kit/README.md`, `product-render/README.md`, `assets/starter.html`(샘플) | 25종 셰이더 이펙트, 3D 프린트·씬·포토 프린트·JSON 제품 렌더 계약 및 스타터 HTML 골격 | 셰이더·3D 포스터 굽기·스타터 복사 시 사용 | 내장 키트 조립·에셋 지역화 |
| `scripts/fx-gallery.template.html`, `fx-lab.template.html`, `assets/*`(미독 1,585개) | 내장 CSS/JS(`system.css`/`js`), 아이콘 932개, UI 조각 117개, 모먼트 90개, 컴포넌트 87개, 사진·데모 등 | 페이지 조립 시 프로젝트 폴더로 복사해 사용 | 내장 키트 조립·에셋 지역화 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 이미지·3D 렌더·시각물을 배치한다 | 금지: 아래에 캡션·설명·"샘플" 문구를 두지 않으며 저작권 출처는 푸터 1줄에만 모아 적는다 | [](source:house)[](source:photos) |
| 섹션 높이와 뷰포트를 구성한다 | 강제: 히어로는 첫 화면 단독, 모든 섹션은 `1440x900` 기준 1~2화면(`100svh`, `--h: 1|2`)이며 좌우 여백선이 어긋나거나 다음 섹션 제목이 보이면 불합격이다 | [](source:house)[](source:ly) |
| 업종이 `place`·`product`·`service`(`other`)다 | 금지: WebGL 셰이더·CSS 그라데이션·그레인·프린트·빅 씬·루프·어두운 배경/히어로를 금지하고 평면 색·실사 사진·사진/타이포 모먼트만 쓴다 | [](source:kind)[](source:fxuse) |
| 페이지 자체 배색·글꼴을 고른다 | 금지: 보라·라벤더색(OKLCH 색상각 약 270~330도)과 Inter·Roboto·Open Sans·Lato·Montserrat·Poppins·Space Grotesk·Plus Jakarta Sans·700+ 굵기를 금지한다 | [](source:never)[](source:sys)[](source:ly) |
| 후기·수치·연락처·추정값을 적는다 | 금지·강제: 가짜 후기·통계와 도로명 번지·우편번호·좌표·전화번호 창작을 금지하며, 임시 메일은 `.example`만 허용하고 추정한 영업시간/가격은 `data-assumed`를 붙인다 | [](source:house)[](source:copy) |
| WebGL 컨텍스트와 폰트 파일 수 | 강제: 동시 활성 WebGL 컨텍스트는 페이지당 최대 4개, 폰트 파일은 4개 이하로 제한하며 `prefers-reduced-motion`과 폰에서는 정지 상태를 유지한다 | [](source:perf)[](source:motion) |
| 스크롤 동작과 키트 파일 무결성 | 금지: 카드/행의 스크롤 페이드 인·시차·하이재킹과 `motion.css`/`motion.js`·`assets/`·`scripts/` 수정 또는 검사 우회(`checker-gaming`, 면제 불가 FAIL)를 금지한다 | [](source:never)[](source:gate) |
| `gate.mjs` 실행 결과 `GATE: FAIL`이 난다 | 멈춤·강제: 최대 3라운드(사용자 중단 `--done`만 예외)까지 Stop 훅 종료를 차단하며, 오탐 면제는 `.taste-skill/waivers.json` 5건 이하만 허용한다(`kit-edited` 불가) | [](source:gate) |
| 헤드리스 Chrome 검사를 실행한다 | 강제: 브라우저 도구나 백그라운드 대신 스킬 스크립트를 포그라운드로 하나씩 실행(`127.0.0.1` HTTP, 포트 `3000` 금지)하고 프로필은 OS 임시 폴더 또는 `.taste-skill/`에만 둔다 | [](source:run3)[](source:shoot) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 카피 5대 규칙·12종 레지스터·AI 말투 예산 — 개요 항목 "카피 작성·보이스 잠금" · `copy-registers.md` 12종 어조와 `copy-tells.md` 1~2세대 말투 예산표는 세부 기준이라 뺐다.
- 업종별 섹션 레시피와 셰이더·3D 렌더 명세 — 개요 항목 "내장 키트 조립·에셋 지역화" · `sections-library.md` 개별 HTML/CSS 레시피와 `product-render` JSON 부품 조합·포스터 굽기 규약은 개요에 담지 않았다.
- `consistency.mjs`·`gate.mjs` 세부 검사 규칙 — 개요 항목 "Chrome 검사·Stop 훅 통과?" · 11,485줄 검사기의 개별 DOM/픽셀 판정식은 미독 구현이라 뺐다.

@callout level=open-question title="확인하지 못한 것"
| `scripts/consistency.mjs`(11,485줄 중 1~80줄 검사 명세만 확인)와 `fx-gallery.template.html`·`fx-lab.template.html`은 전체 구현을 읽지 않았다. |
| `references/sections-library.md`(1,120줄 중 1~100·1020~1120줄·제목 색인만 확인), `library/*.json`(각 1~100줄), CLI 스크립트 12종(상단 80~100줄), `assets/` 하위 1,585개 구현·아이콘 SVG·사진·셰이더·오브젝트 파일은 선두·목차·구조만 확인했다.[](source:seclib)[](source:pal)[](source:typ) |

읽은 원본: 원본 파일 27개 전체(`SKILL.md`, `references/` 21개, `assets/**/README.md` 5개) + 선두·목차 샘플 17개(`references/sections-library.md`, `assets/starter.html`, `library/palettes.json`, `type.json`, `scripts/consistency.mjs`, CLI 스크립트 12종 상단). 제외 및 구조만 확인: `*.ko.md`·`*.ko.stale.md` 32개(번역본), `scripts/fx-*.template.html` 2개 및 `assets/` 구현·아이콘 SVG·사진·셰이더·오브젝트 1,585개 총 1,587개.
