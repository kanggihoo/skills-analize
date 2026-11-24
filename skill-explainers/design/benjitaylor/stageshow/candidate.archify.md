# stageshow — React/CSS 키트와 커서 리허설 기반 가짜 제품 UI 데모 제작 {#overview}

stageshow는 에이전트가 실제 제품처럼 보이는 가짜 제품 인터페이스 정지 화면이나 커서 작동 데모를 React와 CSS 키트로 만들고, 프레임별 촬영으로 리허설해 검증하게 한다.[](source:fm)[](source:idea) **부분 분석**: `SKILL.md`·`references/`·주요 실행 스크립트를 읽었고 `kit/`·`examples/`·`teaching/`·`playground/`는 구조와 표본만 확인했다.

- 마케팅 페이지 히어로, 기능 카드, 문서용 제품 일러스트나 커서 시연을 요청받을 때 모델이 판단해 켠다. 사용자가 "faux UI"라고 말하지 않아도 제품 모형이나 작동 데모 요청이면 적용한다.[](source:fm)
- 결과로 기준 예제를 변형한 React/CSS 데모 컴포넌트, `compact` 358px 레이아웃, 프레임 촬영 시트와 검증 보고서(`REHEARSAL.md`)가 남는다.[](source:wf13)[](source:wf7)
- 조사 범위에서 다른 스킬과 확인된 직접 연결은 없다.
- 실제 브라우저 자동화나 라이브 API 호출을 하지 않으며, `Window`·`Phone`·`Button` 같은 키트 부품을 손으로 다시 그리거나 과도한 실제 문구를 채워 와이어프레임처럼 만들지 않는다.[](source:idea)[](source:kitsec)

@answer scope="design/benjitaylor/stageshow · 원본 일부 확인(372개 중 32개 확인, 340개 구조·표본·제외) · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: 이름, description, 버전" path=design/benjitaylor/stageshow/SKILL.md lines=1:6
@source idea title="핵심 개념, 5가지 실패 유형, 품질 기준" path=design/benjitaylor/stageshow/SKILL.md lines=10:30
@source wf13 title="Workflow 1~3: 매체·배치, 룩·토큰, 스토리" path=design/benjitaylor/stageshow/SKILL.md lines=32:38
@source wf4 title="Workflow 4: gold 예제 촬영·복사·프레이밍" path=design/benjitaylor/stageshow/SKILL.md lines=39:39
@source wf56 title="Workflow 5~6: 화면 문자열 예산과 Act 안무" path=design/benjitaylor/stageshow/SKILL.md lines=40:41
@source wf7 title="Workflow 7: poster 우선 설정, --gate, REHEARSAL.md" path=design/benjitaylor/stageshow/SKILL.md lines=42:55
@source ex title="예제 3종 구분: Gold, Product studies, Specimen" path=design/benjitaylor/stageshow/SKILL.md lines=57:60
@source kitsec title="kit/ 4개 계층과 손 제작 금지 규칙" path=design/benjitaylor/stageshow/SKILL.md lines=139:149
@source readme title="미리보기 서버, 키트 복사, 검증 명령" path=design/benjitaylor/stageshow/README.md lines=6:75
@source pkg title="package.json: Node 버전과 npm 스크립트" path=design/benjitaylor/stageshow/package.json lines=8:33
@source kitref title="Stage, Act, 커서, unframed·specimen 규칙" path=design/benjitaylor/stageshow/references/kit.md lines=5:43
@source craft title="정지 화면 품질 규칙: 문자열 예산, 정렬, 아이콘" path=design/benjitaylor/stageshow/references/craft.md lines=7:49
@source frame title="프레이밍 20규칙과 여백·크롭 규격" path=design/benjitaylor/stageshow/references/framing.md lines=5:30
@source small title="배경 ground, unframed, compact, 모바일 규칙" path=design/benjitaylor/stageshow/references/framing.md lines=83:106
@source motion title="스토리, 루프, 속도, poster 규칙" path=design/benjitaylor/stageshow/references/motion.md lines=25:53
@source reh title="리허설 촬영 규칙과 절대 금지 경고 24종" path=design/benjitaylor/stageshow/references/rehearse.md lines=46:82
@source ver title="최종 확인 체크리스트와 REHEARSAL.md 양식" path=design/benjitaylor/stageshow/references/verify.md lines=5:84
@source rev title="신선한 눈(fresh-eye) 리뷰 지시서" path=design/benjitaylor/stageshow/references/review.md lines=1:26
@source film title="film.mjs: --gate, --states, 종료 코드 규약" path=design/benjitaylor/stageshow/scripts/film.mjs lines=27:36
@source dev title="dev.mjs: Vite/Portless 로컬 서버 실행" path=design/benjitaylor/stageshow/scripts/dev.mjs lines=20:36
@source clash title="class-clash.mjs: CSS 클래스 충돌 검사" path=design/benjitaylor/stageshow/scripts/class-clash.mjs lines=13:52

## 어떻게 동작하나 {#flow span=12}

그림은 `SKILL.md`의 7단계 워크플로를 세 국면으로 묶어 그렸다. 정지 일러스트만 만들 때는 4단계 `프레임 확정` 뒤 모션 안무를 건너뛰고 `--still --gate`로 바로 검증한다.[](source:wf4)[](source:ver) 리허설을 10회 돌리고 게이트가 녹색인데 화면이 나아지지 않으면 반복을 멈추고 신선한 눈 리뷰(`review.md`)로 넘긴다.[](source:ver)

@workflow id=flow-diagram title="stageshow 흐름"
| lane prep | 설계·기준 예제 |
| lane build | 조립·안무 |
| lane check | 촬영·리뷰 |
| place | 매체·크기·룩 설계 | backend | prep | source:wf13 |
| frame | 기준 예제 촬영·프레이밍 | backend | prep | source:wf4 |
| screen | 키트 부품 배치·문자열 | backend | build | source:wf56 |
| act | Act 안무·poster 설정 | backend | build | source:wf56 |
| rehearse | 게이트·레이아웃·CSS 촬영 | backend | check | source:wf7 |
| pass | 통과 및 신선한 눈 통과? | external | check | source:ver |
| handover | REHEARSAL.md 작성·인계 | backend | check | source:wf7 |
| place > frame | |
| frame > screen | |
| screen > act | 애니메이션 시 |
| screen > rehearse | 정지 화면 시 |
| act > rehearse | |
| rehearse > pass | |
| pass > frame | 아니오, 결함 수정 |
| pass > handover | 예 | emphasis |

@steps id=flow-steps
| s-place | 매체·크기·룩 설계 | **입력** 제품 브리프와 호스트 코드·사이트 · **참조** `SKILL.md` · `references/looks.md` · `references/bento.md` · `references/motion.md` · **출력** 설계 계획(배치 크기, `compact` 358px 설계, 토큰 매핑, 3~5비트 스토리). **처리** 정지/애니메이션 형태와 `light`/`dark`/`blueprint`/`glass`·충실도(`minimal`/`standard`/`realistic`)를 고르고 10~16초 스토리를 짠다.[](source:wf13) **다음** 벤토 그리드면 `bento.md`로 타일 역할을 먼저 배분한다.[](source:wf13) | flow-diagram | place |
| s-frame | 기준 예제 촬영·프레이밍 | **입력** 설계 계획과 `examples/` 기준 목록 · **참조** `references/craft.md` · `references/framing.md` · **실행** `npm run dev` · `node scripts/film.mjs "<preview>/?capture=<gold>" --select '#example' --still --out gold.png` (내부: `dev.mjs`가 `portless`+Vite 실행, `film.mjs`가 Playwright Chrome으로 2배율 촬영, 코드 확인) · **출력** 복사한 컴포넌트 골격과 확정된 정지 구도. **처리** 가장 가까운 gold 예제를 먼저 찍어 복사한 뒤 제품 룩·카피를 입히고, 모션 전에 정지 구도와 여백·크롭을 기준 예제와 나란히 비교해 고친다.[](source:wf4)[](source:readme)[](source:pkg)[](source:dev) | flow-diagram | frame |
| s-screen | 키트 부품 배치·문자열 | **입력** 정지 구도가 잡힌 컴포넌트 · **참조** `references/kit.md` · `references/craft.md` · `references/brands.md` · **출력** 키트 부품(`Stage`, `Window`, `Phone`, `Row`, `Bar`, `Text`)으로 짠 UI. **처리** 실제 문자열을 3~7개 안으로 줄여 `Bar`·`Text`·`Row`로 채우고, 커서가 닿을 요소에 `data-target`·`data-cursor`를 단다.[](source:wf56)[](source:kitref) **다음** 이동·겹침 좌표는 하드코딩하지 않고 `rect()`로 측정한다.[](source:wf56) | flow-diagram | screen |
| s-act | Act 안무·poster 설정 | **입력** UI 마크업과 스토리 비트 · **참조** `references/motion.md` · `references/choreography.md` · `references/annotations.md` · **출력** `Act` 스크립트와 정지용 `poster` 상태. **처리** 나타나는 요소를 언마운트하지 않고 토글해 퇴장·간격 이동을 연동시키고, 첫 프레임 겸 모션 감소 화면인 `poster` 상태를 먼저 정한다.[](source:wf56)[](source:wf7) | flow-diagram | act |
| s-rehearse | 게이트·레이아웃·CSS 촬영 | **입력** 완성된 데모 컴포넌트와 호스트 페이지 · **참조** `references/rehearse.md` · `references/verify.md` · **실행** `npm run typecheck` · `npm run check:css` · `node scripts/film.mjs '<url>' --select '<sel>' --gate` · `node scripts/film.mjs '<url>' --width 390 --gate` · `node scripts/film.mjs '<url>' --states --gate` · `node scripts/layout.mjs '<url>' --width 390 --strict` (내부: `film-checks.mjs`·`jumps-core.mjs`·`motion-watch.mjs`·`layout-core.mjs`·`class-clash-core.mjs`로 DOM·프레임·CSS 검증, 코드 확인) · **출력** 접촉 시트 PNG, JSON 보고서, 게이트 판정. **처리** 기본 너비·390px·전체 상태·호스트 컨트롤·CSS 클래스 충돌을 촬영하고, 가장 큰 시각 결함(프레이밍→위계→모션→마감)부터 고쳐 다시 찍는다.[](source:wf7)[](source:reh)[](source:film)[](source:clash) | flow-diagram | rehearse |
| s-pass | 통과 및 신선한 눈 통과? | **입력** 촬영 시트, `--gate` 출력, `review.md` 기준 · **참조** `references/teaching.md` · `references/review.md` · **출력** 재수정 여부와 신선한 눈 리뷰 목록. **처리** `--gate`가 `rehearsal passed`로 끝나고 `teaching.md` 비교 및 `review.md` 신선한 눈 검토에서 지적이 없을 때만 통과시킨다.[](source:wf7)[](source:rev) **다음** `film.mjs`가 미결(`inconclusive`, 종료 코드 2)이면 다시 촬영하고, 10회 반복 후에도 화면이 안 바뀌면 멈추고 신선한 눈 리뷰를 돌린다.[](source:reh)[](source:ver) | flow-diagram | pass |
| s-handover | REHEARSAL.md 작성·인계 | **입력** 통과한 데모와 검증 증거 · **참조** `references/verify.md` · **출력** 컴포넌트 옆 `REHEARSAL.md`. **처리** 참고한 gold 예제, 변경 내용, 촬영한 너비·룩·상태, `--gate` 마지막 줄, 리뷰 응답, 미확인 항목을 `REHEARSAL.md`에 적어 건넨다.[](source:wf7)[](source:ver) | flow-diagram | handover |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 따로 없고 모델이 `description`을 보고 자동으로 켠다. 호출 제한 필드는 원문에 명시 없음.[](source:fm) |
| 성격 | 기준 예제 복제·프레이밍·안무·헤드리스 Chrome 촬영 게이트를 7단계로 강제하는 절차형 스킬이다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| 없음 {#none} | - | - | 조사 범위에서 확인된 연결 없음 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 7단계 워크플로, 흔한 결함 10종, 예제 3종 색인, 키트 요약 | 스킬이 켜질 때 항상 읽는다 | 매체·크기·룩 설계; 기준 예제 촬영·프레이밍; 키트 부품 배치·문자열; Act 안무·poster 설정; 게이트·레이아웃·CSS 촬영; REHEARSAL.md 작성·인계 |
| `README.md`, `NOTICE.md`, `package.json` | 로컬 실행(`npm run dev`), 의존성, 제3자 상표·CC0 사진 고지 | 환경 설치·실행 및 에셋 라이선스 확인 시 | 매체·크기·룩 설계; 기준 예제 촬영·프레이밍 |
| `references/kit.md`, `looks.md`, `backgrounds.md`, `brands.md` | `Stage`·`Act`·부품 API, CSS 토큰 매핑, 배경, 브랜드 로고 44종 사용 규칙 | 키트 부품·토큰·배경·브랜드 로고 구현 시 | 매체·크기·룩 설계; 키트 부품 배치·문자열; Act 안무·poster 설정 |
| `references/craft.md`, `framing.md`, `bento.md`, `motion.md`, `choreography.md`, `annotations.md`, `products.md` | 정지 화면, 프레이밍 20규칙·레이아웃 17종, 벤토, 모션, 안무, 주석선, 실제 앱 연구 안내 | 구도·크롭·그리드·커서·안무 설계 시 | 매체·크기·룩 설계; 기준 예제 촬영·프레이밍; 키트 부품 배치·문자열; Act 안무·poster 설정 |
| `references/rehearse.md`, `verify.md`, `review.md`, `teaching.md` | 촬영법·절대 금지 24종 경고, 최종 체크표·`REHEARSAL.md` 틀, 신선한 눈 리뷰, 나쁨/좋음 쌍 | 촬영·게이트 통과·리뷰 진단 시 | 게이트·레이아웃·CSS 촬영; 통과 및 신선한 눈 통과?; REHEARSAL.md 작성·인계 |
| `scripts/dev.mjs`, `film.mjs`, `layout.mjs`, `jumps.mjs`, `class-clash.mjs`, `browser.mjs`, `verification.mjs`, `film-checks.mjs`, `jumps-core.mjs`, `layout-core.mjs`, `class-clash-core.mjs`, `motion-watch.mjs` | Vite 서버, Playwright 프레임 촬영·`--gate`, 호스트 레이아웃·점프·CSS 충돌 검사 CLI | 로컬 미리보기와 리허설 검증 단계에서 실행 | 기준 예제 촬영·프레이밍; 게이트·레이아웃·CSS 촬영 |
| `kit/`(155개), `examples/`(155개), `teaching/`(18개), `playground/`(10개), `assets/app-icons.ts` | 복사해 쓰는 React/CSS 키트(브랜드 SVG 44개 포함), 71개 예제, 비교 쌍 9종, 뷰어 앱 | 기준 예제 복사(`examples/`), 호스트 프로젝트 이식(`kit/`), 진단(`teaching/`) 시 사용 | 기준 예제 촬영·프레이밍; 키트 부품 배치·문자열; Act 안무·poster 설정 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 데모를 처음부터 작성하려 한다 | 강제: 가장 가까운 gold 예제를 먼저 촬영·복사해 시작하며, `teaching/`의 나쁜 쪽 예제는 시작점으로 쓰지 않는다 | [](source:wf4)[](source:ex) |
| 정지 구도·여백(`framing.md`)을 잡는다 | 강제·금지: 창·폰은 스테이지 너비 2/3 이상을 채우고 한쪽 가장자리 밖으로 10~40% 잘려야(bleed) 하며, 흰/어두운 페이지에서 뒤에 배경 판을 깔지 않는다(`unframed`는 개발자 요청 시에만) | [](source:idea)[](source:frame)[](source:small) |
| 창·폰·컨트롤을 구현한다 | 금지: `Window`·`Phone`·`Notification`·상태표시줄·홈 바·`Button` 등 키트 부품을 손으로 다시 그리지 않으며, 실제 문자열은 3~7개로 제한하고 가짜 AI 스파클·보라색·만든 로고를 금지한다 | [](source:wf56)[](source:kitsec)[](source:craft) |
| 좁은 모바일 화면(390px 등)에 들어갈 수 있는 데모다 | 강제: 단순 축소(scale)가 아니라 너비 358px 기준의 별도 `compact` 디자인을 제공한다 | [](source:wf13)[](source:small) |
| 애니메이션 루프·`poster`·텍스트 변경을 만든다 | 강제·금지: `poster`는 변화 도중이 아닌 완결된 상태 프레임으로 두고, 데이터는 원인 없이 되감지 않으며, 버튼·상태 텍스트는 두 요소 교체 대신 `Button`·`Roll`·`States`로 같은 자리에서 전환한다 | [](source:wf13)[](source:wf7)[](source:motion) |
| `film.mjs --gate` 결과에 절대 금지 경고 24종(`framing:`, `cut by the crop:`, `tight inset:` 등)이나 `selection drift`가 뜬다 | 멈춤·강제: `rehearsal passed`가 나올 때까지 인계 금지. 대상 요소를 숨기거나 `data-crop`·`data-snap`으로 가려 경고를 없애는 행위도 버그로 간주한다 | [](source:wf7)[](source:reh)[](source:film) |
| 10회 연속 `film.mjs` 실행 후 게이트가 통과했는데도 화면 개선이 멈췄다 | 멈춤·전환: 작업을 멈추고 계획서나 `REHEARSAL.md`를 가린 신선한 눈 리뷰(`review.md`)로 넘긴다 | [](source:ver)[](source:rev) |
| 최종 결과를 사용자에게 건넨다 | 강제: 직접 눈으로 보지 않은 부분은 못 봤다고 밝히고 컴포넌트 옆에 `REHEARSAL.md`를 남긴다 | [](source:wf7)[](source:ver) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 프레이밍 레이아웃 17종과 벤토 14규칙 — 개요 항목 "기준 예제 촬영·프레이밍" · `framing.md`의 17개 레이아웃 표·그림자 토큰과 `bento.md`의 8종 타일·5종 그리드 규칙은 세부 참조라 뺐다.
- 키트 부품과 `Act` API 전체 규약 — 개요 항목 "키트 부품 배치·문자열"과 "Act 안무·poster 설정" · `kit.md`의 `Window` 크롬 변형, `Fly`·`Collapse`·`Slot`·`Draft`·`Connector` 속성·토큰 목록은 개요에 담지 않았다.
- `film.mjs` 절대 금지 경고 24종과 `teaching/` 비교표 — 개요 항목 "게이트·레이아웃·CSS 촬영" · `rehearse.md` 경고별 픽셀 기준과 `teaching.md`의 나쁨/좋음 비교 쌍은 개요에서 줄였다.

@callout level=open-question title="확인하지 못한 것"
| `kit/`(155개 중 151개), `examples/`(155개 중 154개), `teaching/`(18개), `playground/`(10개 중 9개), `assets/app-icons.ts`는 폴더 구조와 표본 6개(`kit/index.ts`, `kit/stage.tsx`, `kit/act.ts`, `kit/brands/SOURCES.md`, `playground/catalog.ts`, `examples/hero-demo/index.tsx`)만 확인했다. |
| `scripts/film.mjs`(161~664줄)·`film-checks.mjs`(81~2,120줄) 나머지 줄과 `browser.mjs`·`motion-watch.mjs`·`*-core.mjs` 4개는 읽지 않아 세부 탐지 식은 미확인이다. |

읽은 원본: 텍스트 파일 32개(`SKILL.md`, `README.md`, `NOTICE.md`, `package.json`, `references/` 15개, `scripts/` 5개 전편 및 `film.mjs`·`film-checks.mjs` 도입부 2개, `kit/`·`playground/`·`examples/` 표본 6개). 제외 및 구조·표본만 확인: `kit/` 151개(브랜드 SVG 44개 포함), `examples/` 154개(JPG 2개 포함), `teaching/` 18개, `playground/` 9개, `assets/app-icons.ts`, 미독 `scripts/` 5개, `LICENSE`, `package-lock.json` 총 340개.
