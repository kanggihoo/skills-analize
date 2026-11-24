# web-design-engineer — 5개 다이얼과 3단계 확인으로 웹 시각 산출물을 설계·구현한다 {#overview}

에이전트는 대상의 사실 검증과 기존 맥락·`anchor`(기준으로 삼는 실제 브랜드·스튜디오) 파악 뒤 5개 설계 다이얼을 보정하고, 설계 선언·v0 초안·주요 결정 지점마다 사용자 확인을 받아 HTML·React 시각 산출물을 만든다.[](source:fm)[](source:wf-top)

- 웹페이지·대시보드·프로토타입·16:9 슬라이드 덱·데이터 시각화·애니메이션 구현·리디자인·비평·브라우저 수용 검증 요청 시 켜지며, 요청 구체성에 따라 일반 흐름과 3학파 방향 추천 모드로 갈린다.[](source:fm)[](source:s1)[](source:adv)
- 결과로 디자인 시스템 선언, 브랜드 작업 시 `brand-spec.md`, `Tweaks` 패널이 달린 HTML·CSS·React 파일, 요청 시 5차원 비평표 또는 브라우저 수용 보고서가 남는다.[](source:s2)[](source:s3)[](source:s6)[](source:s7)
- 이미지 우선 탐색 분기에서 `gpt-image-2`를 호출하고, 장문 아티클은 `beautiful-article`로, 구술 기반 웹 영상 발표는 `web-video-presentation`으로 보내며, 두 스킬과 `motion-showreel`과 대안 관계를 이룬다.[](source:scope)[](source:cal-img)[](source:ba-readme)[](source:ms-scope)
- 백엔드 API·CLI·데이터 처리 스크립트는 다루지 않으며, 로고 없이 색 상자로 떼우거나 명시 요청 없이 브라우저 실행 QA를 먼저 돌리지 않는다.[](source:scope)[](source:s2)[](source:s6)

@answer scope="design/garden-skills/web-design-engineer · 원본 파일 39개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: name·description" path=design/garden-skills/web-design-engineer/SKILL.md lines=1:4
@source scope title="적용 가능·제외 범위와 전용 스킬 라우팅" path=design/garden-skills/web-design-engineer/SKILL.md lines=14:19
@source s0 title="Step 0 사실 검증 선행 조건과 금지 문구" path=design/garden-skills/web-design-engineer/SKILL.md lines=24:38
@source s1 title="Step 1 요구 파악 분기와 질문 영역" path=design/garden-skills/web-design-engineer/SKILL.md lines=39:60
@source s2 title="Step 2 설계 맥락 우선순위와 브랜드 에셋 규약" path=design/garden-skills/web-design-engineer/SKILL.md lines=61:99
@source wf-top title="Step 2b: Design Read와 5개 다이얼 보정" path=design/garden-skills/web-design-engineer/SKILL.md lines=100:118
@source s3 title="Step 3a·Step 3 설계 선언과 Checkpoint 1" path=design/garden-skills/web-design-engineer/SKILL.md lines=119:149
@source s4 title="Step 4 v0 초안과 Checkpoint 2" path=design/garden-skills/web-design-engineer/SKILL.md lines=150:161
@source s5 title="Step 5 본 구현과 Checkpoint 3" path=design/garden-skills/web-design-engineer/SKILL.md lines=162:167
@source s6 title="Step 6 사전 점검표와 명시 요청 한정 브라우저 수용" path=design/garden-skills/web-design-engineer/SKILL.md lines=168:173
@source s7 title="Step 7 5차원 비평과 점수 출력" path=design/garden-skills/web-design-engineer/SKILL.md lines=174:187
@source adv title="Design Direction Advisor 6학파 3방향 규칙" path=design/garden-skills/web-design-engineer/SKILL.md lines=190:231
@source tech title="React+Babel·CSS·CDN·Tweaks 기술 규약" path=design/garden-skills/web-design-engineer/SKILL.md lines=234:268
@source princ title="AI 상투어 회피·이모지·자리표시·콘텐츠 원칙" path=design/garden-skills/web-design-engineer/SKILL.md lines=271:346
@source types title="산출물 유형별(프로토타입·덱·대시보드·모션) 지침" path=design/garden-skills/web-design-engineer/SKILL.md lines=349:392
@source cdn title="공통 CDN 제한(Tailwind·Lucide)과 사전 점검표" path=design/garden-skills/web-design-engineer/SKILL.md lines=423:463
@source cal-img title="Design Calibration 5다이얼과 이미지 우선 분기" path=design/garden-skills/web-design-engineer/references/design-calibration.md lines=113:136
@source redesign title="기존 UI 확장·보존·전면개편 보호 계약" path=design/garden-skills/web-design-engineer/references/redesign-protocol.md lines=15:81
@source accept title="브라우저 수용 검증 발동 관문과 기본 뷰포트" path=design/garden-skills/web-design-engineer/references/browser-acceptance.md lines=13:44
@source idx title="25종 style-recipes 색인과 일괄 로딩 금지" path=design/garden-skills/web-design-engineer/references/style-recipes/INDEX.md lines=24:74
@source adv-pat title="advanced-patterns.md 목차와 폰트·색상 짝 표" path=design/garden-skills/web-design-engineer/references/advanced-patterns.md lines=480:521
@source linear-rec title="linear 레시피의 Inter·radius·shadow 제약" path=design/garden-skills/web-design-engineer/references/style-recipes/linear.md lines=20:33
@source yaml title="agents/openai.yaml 암묵적 호출 허용 설정" path=design/garden-skills/web-design-engineer/agents/openai.yaml lines=1:7
@source ba-readme title="beautiful-article의 웹 앱 라우팅 안내" path=design/garden-skills/beautiful-article/README.md lines=420:421
@source ms-scope title="motion-showreel의 웹페이지 제외 라우팅" path=design/garden-skills/motion-showreel/SKILL.md lines=30:30

## 어떻게 동작하나 {#flow span=12}

에이전트는 사실 검증 뒤 요구·맥락·5개 다이얼을 정렬하고, `Checkpoint 1`·`2`·`3` 확인 지점을 거쳐 v0 초안에서 본 구현·검증·비평까지 단계적으로 완성한다.[](source:s0)[](source:s3)[](source:s4)[](source:s5)

@workflow id=flow-diagram title="web-design-engineer 흐름"
| lane discover | 사실 검증·맥락·선언 |
| lane lock | 확인과 초안 |
| lane ship | 본 구현·검증·비평 |
| s0 | 사실 확인과 경계 | external | discover | source:s0 |
| s1 | 요구 파악·방향 제안 | backend | discover | source:s1 |
| s2 | 맥락·5다이얼 보정 | backend | discover | source:s2 |
| s3 | 4문항·시스템 선언 | backend | discover | source:s3 |
| cp1 | Checkpoint 1 | security | lock | source:s3 |
| v0 | v0·Checkpoint 2 | security | lock | source:s4 |
| build | 구현·Checkpoint 3 | backend | ship | source:s5 |
| verify | 점검·브라우저 수용 | backend | ship | source:s6 |
| critique | 5차원 비평·전달 | external | ship | source:s7 |
| s0 > s1 | |
| s1 > s2 | 요구·방향 확정 |
| s2 > s3 | |
| s3 > cp1 | |
| cp1 > v0 | 시스템 확정 | emphasis |
| v0 > s3 | 방향·톤 수정 | dashed |
| v0 > build | v0 수락 | emphasis |
| build > verify | |
| verify > build | 결함 수정 | dashed |
| verify > critique | 통과 | emphasis |

@steps id=flow-steps
| s-s0 | 사실 확인과 경계 | **입력** 사용자 요청 · **출력** 적용 여부와 검증된 사실. **처리** 백엔드·아티클·구술 발표 요청을 걸러 내고, 미확인 제품·SDK·출시 정보는 질문 전에 공식 출처로 먼저 확인한다.[](source:scope)[](source:s0) **다음** 검색 결과가 모호하면 추측하지 않고 사용자에게 묻는다.[](source:s0) | flow-diagram | s0 |
| s-s1 | 요구 파악·방향 제안 | **입력** 검증된 요청 · **참조** `references/design-directions.md` · **출력** 요구 요약 또는 3개 학파 방향 선택. **처리** 맥락이 충분하면 바로 다음으로 넘기고, 모호한 취향 질문 대신 서로 다른 3개 학파의 디자이너·스튜디오 3안을 내밀어 고르게 한다.[](source:s1)[](source:adv) | flow-diagram | s1 |
| s-s2 | 맥락·5다이얼 보정 | **입력** 코드베이스·Figma·스크린샷·레시피 선택 · **참조** `references/design-calibration.md`, `references/redesign-protocol.md`, `references/style-recipes/INDEX.md`, 선택한 `style-recipes/<anchor>.md` 1개 · **출력** `brand-spec.md`, 기존 UI 모드 분류, `Design Read`와 5개 다이얼(변화·모션·밀도·에셋·브랜드 충실도). **처리** 코드→스크린샷 순으로 토큰과 브랜드 실사 에셋을 모으고 5개 다이얼과(해당 시) `gpt-image-2` 이미지 우선 분기를 확정한다.[](source:s2)[](source:wf-top)[](source:cal-img) **다음** 브랜드 작업에서 로고를 구할 수 없으면 색 상자로 대체하지 않고 멈춰서 묻는다.[](source:s2) | flow-diagram | s2 |
| s-s3 | 4문항·시스템 선언 | **입력** `Design Read`와 5개 다이얼 · **출력** Markdown `Design Decisions` 블록. **처리** 서사 역할·시청 거리·시각 온도·수용량 4문항을 먼저 짚고 팔레트·서체·간격·모서리 반경·그림자·모션 값을 선언한다.[](source:s3) **다음** 25종 레시피를 쓸 때는 선택한 파일의 구체 수치를 그대로 옮긴다.[](source:s3)[](source:idx) | flow-diagram | s3 |
| s-cp1 | Checkpoint 1 | **입력** 선언한 `Design Decisions` · **출력** 사용자의 설계 시스템 승인. **처리** 첫 줄 코드를 쓰기 전에 멈춰 확인을 요청하고 실제 응답이 올 때까지 기다린다.[](source:s3) | flow-diagram | cp1 |
| s-v0 | v0·Checkpoint 2 | **입력** 승인된 설계 시스템 · **참조** `references/block-library.md`, `references/advanced-patterns.md` · **출력** 핵심 배치·토큰·정직한 자리표시(`[icon]`, `16:9 image`)를 담은 v0 초안. **처리** 전체 컴포넌트와 세부 문구 없이 골격만 먼저 보여 주고 방향 확인을 기다린다.[](source:s4)[](source:princ) **다음** 톤·배치가 어긋나면 `4문항·시스템 선언`으로 돌아가 조율한다.[](source:s4) | flow-diagram | v0 |
| s-build | 구현·Checkpoint 3 | **입력** 승인된 v0 초안 · **참조** `references/failure-patterns.md`, `references/advanced-patterns.md` · **출력** 상태·모션·`Tweaks` 패널(3개 이상 변형 포함 가능)을 갖춘 완성 코드. **처리** 전체 UI·모션·접근성·오류 상태를 구현하되, 상호작용 방식이나 큰 배치 변경 같은 중대한 갈림길(`Checkpoint 3`)에서는 다시 멈춰 묻는다.[](source:s5)[](source:types) | flow-diagram | build |
| s-verify | 점검·브라우저 수용 | **입력** 구현된 웹 산출물 · **참조** `references/browser-acceptance.md` · **출력** 사전 점검 결과 또는(명시 요청 시) 브라우저 수용 보고서. **처리** 경량 `Pre-delivery Checklist`를 항상 돌리고, 사용자가 수용·QA·브라우저·반응형 검증을 직접 요구했을 때만 실제 브라우저 검사와 수리를 수행한다.[](source:s6)[](source:accept) **다음** 단순 빌드·마감 요청만으로 브라우저 테스트를 자의적으로 시작하지 않는다.[](source:s6)[](source:accept) | flow-diagram | verify |
| s-critique | 5차원 비평·전달 | **입력** 검증된 산출물 · **참조** `references/critique-guide.md` · **출력** 최종 HTML·JSX 파일과(요청·자가점검 시) 5차원 0~10점 비평·즉시 개선안 3개. **처리** 철학·위계·완성도·기능성·독창성을 10점 만점으로 채점하고 `Keep`·심각도별 `Fix`·`Quick Wins`를 정리해 전달한다.[](source:s7) | flow-diagram | critique |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자가 웹페이지·대시보드·프로토타입·슬라이드 덱·시각화 제작·리디자인·비평·브라우저 검증을 요청하면 모델이 `description`을 보고 켠다. `agents/openai.yaml`은 암묵적 호출을 허용한다(`allow_implicit_invocation: true`).[](source:fm)[](source:yaml) |
| 성격 | 특정 프레임워크나 고정 스타일을 강제하지 않고, 맥락 수집·5다이얼 보정·3단계 확인·실패 패턴 점검으로 시각 품질을 끌어올리는 설계·구현 절차 지침이다.[](source:fm)[](source:wf-top) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r10} | gpt-image-2 | 호출 | 그린필드·전면 개편의 선택적 이미지 우선 분기에서 `gpt-image-2`가 가용하면 구조화된 이미지 생성에 사용한다(사용자 개입 없음).[](source:cal-img) |
| **이 스킬** {#rel-r11} | beautiful-article | 대안 | 원자료→장문 HTML 아티클 변환은 적용 제외 대상이며, 전용 스킬이 있으면 `beautiful-article` 쪽으로 라우팅한다(사용자 개입 없음).[](source:scope) |
| **이 스킬** {#rel-r12} | web-video-presentation | 대안 | 구술 비트→녹화용 웹 영상 프레젠테이션은 적용 제외 대상이며, 전용 스킬이 있으면 `web-video-presentation` 쪽으로 라우팅한다(사용자 개입 없음).[](source:scope) |
| beautiful-article {#rel-r05} | **이 스킬** | 대안 | `beautiful-article`은 웹 앱·dashboard·폼·프로토타입·랜딩 페이지를 이 스킬 소관으로 안내하며, 모호하면 멈춰서 묻는다.[](source:ba-readme) |
| motion-showreel {#rel-r08} | **이 스킬** | 대안 | `motion-showreel`은 일반 웹페이지·랜딩·인터랙티브 프로토타입·정적 시안을 적용 불가로 보고 이 스킬로 라우팅한다(사용자 개입 없음).[](source:ms-scope) |

@architecture id=relation-map title="web-design-engineer와 이어지는 스킬"
| self | web-design-engineer(이 스킬) | backend |
| gpt | gpt-image-2 | backend |
| ba | beautiful-article | backend |
| wvp | web-video-presentation | backend |
| ms | motion-showreel | backend |
| self > gpt | 호출 |
| self > ba | 대안 |
| self > wvp | 대안 |
| ba > self | 대안 |
| ms > self | 대안 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 8단계 공정(Step 0~7), 3개 확인 지점, 브랜드 에셋 규약, 기술·콘텐츠 원칙을 담는다 | 스킬이 켜지면 읽는다 | 모든 단계 |
| `references/design-directions.md` | 모호한 요청 시 대비되는 3방향을 뽑는 6개 학파·`anchor` 표를 제공한다 | 구체적 맥락 없이 방향 추천이 필요할 때 읽는다[](source:adv) | 요구 파악·방향 제안 |
| `references/style-recipes/INDEX.md`, `style-recipes/*.md`(25종) | 7개 학파 25개 실제 브랜드·스튜디오 레시피 색인과 개별 팔레트·폰트·모션 명세를 담는다 | 사용자가 `anchor`를 대거나 학파 선택 뒤 1~3개 파일만 온디맨드로 읽는다[](source:idx) | 맥락·5다이얼 보정 · 4문항·시스템 선언 |
| `references/design-calibration.md` | `Design Read`, 5개 다이얼(1~10) 프리셋·충돌 해결, 이미지 우선 분기를 정한다 | 맥락 수집 뒤 설계 선언 전에 읽는다[](source:wf-top) | 맥락·5다이얼 보정 |
| `references/redesign-protocol.md` | 기존 UI의 확장·보존·전면 개편 분류, 보호 계약, 현대화 우선순위를 정한다 | 기존 페이지·제품을 수정할 때 읽는다[](source:s2)[](source:redesign) | 맥락·5다이얼 보정 |
| `references/block-library.md`, `advanced-patterns.md` | 16:9 슬라이드 엔진, 기기 프레임, `Tweaks` 패널, `useTime` 타임라인, `oklch` 팔레트 코드를 제공한다 | 재사용 블록이나 코드 템플릿이 필요할 때 해당 절만 읽는다[](source:tech) | v0·Checkpoint 2 · 구현·Checkpoint 3 |
| `references/failure-patterns.md` | 마케팅·배치·타이포·이미지·모션·대시보드별 AI 실패 패턴과 수정법을 담는다 | 다중 섹션·대시보드·리디자인·모션 작업 시 해당 절만 읽는다[](source:princ) | 구현·Checkpoint 3 |
| `references/browser-acceptance.md` | 런타임·레이아웃·상호작용·모션 브라우저 검사와 4종 기본 뷰포트 보고서 틀을 담는다 | 사용자가 명시적으로 브라우저 검증·QA·수용을 요청했을 때만 읽는다[](source:s6)[](source:accept) | 점검·브라우저 수용 |
| `references/critique-guide.md` | 5차원 0~10 채점표, 산출물 유형별 가중치, 상위 10개 결함과 보고서 템플릿을 담는다 | Step 7 리뷰 요청 또는 전달 전 자가 점검 시 읽는다[](source:s7) | 5차원 비평·전달 |
| `agents/openai.yaml`, `README.md`, `README.zh-CN.md`, `manifest.json` | 호스트 표시 메타데이터(`allow_implicit_invocation: true`), 데모 비교표, 버전(`1.3.0`)을 담는다 | 에이전트 실행 흐름의 작업 지시 파일은 아니다 | 흐름 밖: 호스트 메타·문서 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 특정 제품·브랜드·SDK·버전 정보 불확실 | 금지: 기억으로 단정("아직 미출시" 등)하지 않고 질문 전에 먼저 검색하며, 불분명하면 사용자에게 묻는다 | [](source:s0) |
| 구체 맥락 없는 모호한 요청 | 10가지 일반 질문 대신 6학파 표에서 서로 다른 행의 3개 방향을 추천하며, 같은 학파 3개 추천을 금지한다 | [](source:adv) |
| `style-recipes/` 로딩 방식 | 금지: 25개 레시피 전체(~1,400줄)를 한꺼번에 읽지 않고 선택한 파일(약 50줄)만 읽는다 | [](source:s3)[](source:idx) |
| 브랜드 작업 시 로고·제품·화면 에셋 누락 | 강제: 로고 없이 색 상자 대체나 CSS 실루엣·SVG 인물/제품 대용을 금지하며, 로고 확보 실패 시 멈추고 묻는다 | [](source:s2)[](source:princ) |
| 기존 UI 수정 시 보호 계약 | 금지: 라우트·슬러그·폼 필드명·법무 문구·분석 이벤트·접근성 자산을 몰래 바꾸지 않는다 | [](source:redesign) |
| `Checkpoint 1`·`2`·`3` 정지 규칙 | 강제: 설계 선언 뒤 코드 작성 전(`Checkpoint 1`), v0 초안 뒤(`Checkpoint 2`), 중대한 분기(`Checkpoint 3`)마다 멈춰 응답을 기다린다 | [](source:s3)[](source:s4)[](source:s5) |
| 브라우저 수용 검증(`browser-acceptance.md`) 발동 | 금지: "빌드·마감·점검" 요청만으로 실행하지 않고, 사용자가 수용·QA·브라우저·반응형 검사를 명시했을 때만 돌린다 | [](source:s6)[](source:accept) |
| React+Babel·브라우저 코드 규약 | 금지: `const styles = {...}` 전역 변수명, `type="module"`, `scrollIntoView()` 사용을 금지한다. 단, `SKILL.md`가 가리키는 고정 CDN `<script>` 태그는 실제 `advanced-patterns.md`에 누락돼 있다(원문 불일치) | [](source:tech)[](source:cdn) |
| 기본 폰트 회피 규칙과 예외 충돌 | `SKILL.md`·`failure-patterns.md`는 `Inter`·`Roboto`·`Arial`·`Fraunces`·`system-ui`를 기본 금지하나, `advanced-patterns.md`의 짝 표·슬라이드 예제와 `linear.md`는 `Inter`·`system-ui`를 예외·브랜드 지정으로 쓴다 | [](source:princ)[](source:adv-pat)[](source:linear-rec) |
| `Tailwind CDN`·`Lucide CDN`·외부 모션 라이브러리 | 사용자가 명시하거나 일회성 프로토타입일 때만 허용하며, `Framer Motion`·`GSAP`·`Lottie`는 명시 요청 외 회피한다 | [](source:types)[](source:cdn) |
| 가짜 데이터·이모지·수치 | 금지: 허구 통계·가짜 로고 월·더미 후기·대체 이모지를 쓰지 않고 정직한 자리표시(`16:9 image`, `[icon]`)를 쓴다 | [](source:princ) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 5개 다이얼 프리셋과 충돌 해소 규칙 — `맥락·5다이얼 보정` · 9가지 과제 프리셋 수치와 고변화·고밀도·접근성 충돌 해소 규칙을 개요에서 생략했다.
- 6개 학파와 25종 `style-recipes` 카탈로그 — `요구 파악·방향 제안`과 `4문항·시스템 선언` · 7개 학파별 레시피 색인과 25개 브랜드 팔레트·모션 명세가 개요 밖에 있다.
- 유형별 기술 구현과 `advanced-patterns.md` 템플릿 — `v0·Checkpoint 2`와 `구현·Checkpoint 3` · 16:9 슬라이드 엔진, 기기 프레임, `Tweaks` 코드, `oklch()` 색 체계를 생략했다.
- 실패 패턴·브라우저 수용·5차원 비평 기준 — `점검·브라우저 수용`과 `5차원 비평·전달` · 6영역 실패 패턴표, 4종 뷰포트 체크, 10대 결함과 채점 가중치가 개요 밖에 있다.

@callout level=open-question title="확인하지 못한 것"
| `references/style-recipes/` 25개 레시피 파일 중 `linear.md`·`dieter-rams-braun.md` 2개와 `INDEX.md`만 읽었고 나머지 23개 개별 레시피 파일은 목록·구조만 확인했다. |
| `SKILL.md` 238·438줄이 `references/advanced-patterns.md`에 있다고 적었으나 실제 파일에는 React·Babel CDN `<script>` 태그 예시가 없어 정확한 고정 버전과 무결성 해시는 확인하지 못했다. |

읽은 원본: 텍스트 파일 39개 중 15개 전체 읽기(`SKILL.md`, `agents/openai.yaml`, `manifest.json`, `README.md`, `references/*.md` 8개, `style-recipes/INDEX.md`, 표본 레시피 2개; 외부 라우팅 대상 `beautiful-article/README.md`·`motion-showreel/SKILL.md` 일부 대조). 표본·구조 확인: `references/style-recipes/*.md` 23개. 제외: `README.zh-CN.md` 1개(`README.md`의 중국어판), `*.ko.md` 번역본.
