# impeccable — 프론트엔드 기획·제작·실시간 변형·검수·시스템 문서화 하네스 {#overview}

impeccable은 에이전트가 웹과 네이티브 앱의 화면을 기획하고, 시각 방향과 품질 하한을 잠근 뒤, 제작·실시간 변형·독립 검수·훅 탐지를 거쳐 실제 구현에서 디자인 시스템을 추출하게 한다.[](source:setup)[](source:cmds) **부분 분석**: 커밋된 원본 69개 파일 중 지침·서브에이전트·런처·브라우저 보조 모듈 66개를 전체 읽었고 대용량·번들 파일 3개(`font-index.json`·`live-browser.js`·`modern-screenshot.umd.js`)는 구조·선두부만 확인했으며, 런처가 내려받는 외부 엔진 바이너리는 저장소에 없다.[](source:launcher)[](source:fontindex)

- 웹(랜딩·앱·문서·쇼케이스)과 네이티브(`ios`·`android`·`adaptive`) 화면을 새로 설계·제작·재설계하거나 `init`·`shape`·`document`·`critique`·`audit`·`polish`·`live` 같은 24개 하위 명령(`craft`는 deprecated 별칭, `teach`는 `init` 별칭)을 실행할 때 모델이 판단하거나 `$impeccable`로 켠다.[](source:cmds)[](source:routing)[](source:craft)
- 결과로 `PRODUCT.md`, 방향 계약이 담긴 표면 브리프, 시안·고해상도 플레이트와 구현 코드, UX·기술·모션 검수 보고서, 실제 코드에서 뽑은 `DESIGN.md`·`.impeccable/design.json`이 남는다.[](source:init)[](source:newwork)[](source:doc)
- 다른 스킬과는 범위 밖인 `Google Labs DESIGN.md / Stitch`와 참고 관계로 이어진다.
- 인자 없는 호출에는 추천 메뉴만 보이고 자동 실행하지 않으며, 탐지 `hook`이나 품질 하한을 사용자 승인 없이 낮추지 않는다.[](source:routemd)[](source:hooks)

@answer scope="design/impeccable/impeccable · 원본 일부(69 중 66+3표본) · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: 이름, description, 버전" path=design/impeccable/impeccable/SKILL.md lines=1:6
@source setup title="Setup: context 1회 실행, 플레이북·craft-floor 적재 조건" path=design/impeccable/impeccable/SKILL.md lines=15:22
@source modes title="Visitor modes: Persuade, Operate, Read, Experience" path=design/impeccable/impeccable/SKILL.md lines=30:40
@source cmds title="Commands: 24개 서브 커맨드 매트릭스" path=design/impeccable/impeccable/SKILL.md lines=41:68
@source routing title="라우팅과 관리 명령(pin, hooks, doctor, foundations)" path=design/impeccable/impeccable/SKILL.md lines=70:88
@source routemd title="routing.md: 무인자 메뉴 추천 및 자동 실행 금지" path=design/impeccable/impeccable/reference/routing.md lines=1:24
@source craftfloor title="craft-floor.md: 편집 직전 품질 하한과 Refuse 목록" path=design/impeccable/impeccable/reference/craft-floor.md lines=1:50
@source hooks title="hooks.md: 2단계 탐지 훅, 예외 승인, 샌드박스 밖 실행" path=design/impeccable/impeccable/reference/hooks.md lines=1:120
@source docfoundry title="foundations.md 및 doctor.md: 기초 점검과 드리프트 관리" path=design/impeccable/impeccable/reference/foundations.md lines=1:44
@source docdr title="doctor.md: 심각도별 처리와 DESIGN.md 보호" path=design/impeccable/impeccable/reference/doctor.md lines=1:58
@source init title="init.md: PRODUCT.md 인터뷰 초기화와 live 설정" path=design/impeccable/impeccable/reference/init.md lines=1:135
@source shape title="shape.md: 코드 작성 없는 7섹션 설계 브리프" path=design/impeccable/impeccable/reference/shape.md lines=1:59
@source newwork title="new-work.md: 시각 권한 4분기와 7단계 제작·검수" path=design/impeccable/impeccable/reference/new-work.md lines=1:123
@source newworld title="new-work-world.md: 7시스템 세계 추첨과 결정 보드" path=design/impeccable/impeccable/reference/new-work-world.md lines=1:20
@source newcomp title="new-work-comp.md: 시안 기반 7단계 상태 머신 제작" path=design/impeccable/impeccable/reference/new-work-comp.md lines=1:24
@source craft title="craft.md: deprecated 호환 별칭" path=design/impeccable/impeccable/reference/craft.md lines=1:5
@source vis title="visualize.md: 시안 3종 생성과 serve-question 승인 게이트" path=design/impeccable/impeccable/reference/visualize.md lines=1:47
@source comprev title="component-review.md: comp 경로 사람 승인 게이트" path=design/impeccable/impeccable/reference/component-review.md lines=1:63
@source over title="overdrive.md: 방향 2~3개 선행 선택 규칙" path=design/impeccable/impeccable/reference/overdrive.md lines=12:25
@source crit title="critique.md: 이중 격리 평가와 오버레이 스캔" path=design/impeccable/impeccable/reference/critique.md lines=1:352
@source aud title="audit.md: 웹 5차원 20점 감사와 리포트 저장" path=design/impeccable/impeccable/reference/audit.md lines=1:157
@source anim title="animate.md: 모션 테시스와 motion-capture 검증" path=design/impeccable/impeccable/reference/animate.md lines=25:97
@source live title="live.md: 브라우저 HMR 실시간 변형과 Apply 반영" path=design/impeccable/impeccable/reference/live.md lines=1:343
@source livesetup title="live-setup.md: 9종 프레임워크 설정과 CSP 동의" path=design/impeccable/impeccable/reference/live-setup.md lines=1:104
@source doc title="document.md: Google Labs DESIGN.md·Stitch·design.json 스펙" path=design/impeccable/impeccable/reference/document.md lines=1:260
@source revagent title="impeccable_finish_reviewer.toml: 7단계 완성 검수와 4종 판정" path=design/impeccable/impeccable/agents/impeccable_finish_reviewer.toml lines=1:41
@source docagent title="impeccable_documenter.toml: 구현 코드 기준 시스템 기록" path=design/impeccable/impeccable/agents/impeccable_documenter.toml lines=1:27
@source assetagent title="impeccable_asset_producer.toml: 1.5x 플레이트·투명 컷아웃 생성" path=design/impeccable/impeccable/agents/impeccable_asset_producer.toml lines=1:47
@source editagent title="impeccable_manual_edit_applier.toml: live 수동 편집 원자적 패치" path=design/impeccable/impeccable/agents/impeccable_manual_edit_applier.toml lines=1:96
@source launcher title="scripts/impeccable: 무의존 런처와 체크섬 검증 다운로드" path=design/impeccable/impeccable/scripts/impeccable lines=101:319
@source checksums title="engine-checksums.txt: 5종 바이너리 SHA-256 다이제스트" path=design/impeccable/impeccable/scripts/engine-checksums.txt lines=1:9
@source fontindex title="font-index.json: 스키마 2 폰트 지표 선두 샘플" path=design/impeccable/impeccable/scripts/data/font-index.json lines=1:1
@source livejs title="live-browser.js: 오버레이 번들 상단 60줄 샘플" path=design/impeccable/impeccable/scripts/live-browser.js lines=1:60
@source umd title="modern-screenshot.umd.js: 서드파티 DOM 캡처 번들" path=design/impeccable/impeccable/scripts/modern-screenshot.umd.js lines=1:14

## 어떻게 동작하나 {#flow span=12}

그림은 세션 부트부터 시스템 문서화까지 전체 흐름을 3개 국면으로 묶어 그렸다. 24개 하위 명령 중 기존 화면의 부분 개선(`bolder`·`quieter`·`polish` 등 17종)은 `제작·실시간 변형` 단계로 바로 들어오며, `critique`·`audit`는 `검수·탐지 통과?` 단계에서 단독 진단·저장 후 코드를 고치지 않고 끝난다.[](source:cmds)[](source:crit)[](source:aud)

@workflow id=flow-diagram title="impeccable 흐름"
| lane prep | 부트·방향 잠금 |
| lane build | 하한 적재·제작 |
| lane verify | 검수·문서 마감 |
| boot | 세션 부트·라우팅 | backend | prep | source:setup |
| world | 기획·시각 세계 잠금 | backend | prep | source:newwork |
| build | 품질 하한·제작·live | backend | build | source:craftfloor |
| review | 검수·탐지 통과? | external | verify | source:revagent |
| doc | DESIGN.md·상태 마감 | backend | verify | source:docagent |
| boot > world | 신규·재설계 |
| boot > build | 기존 표면·live |
| world > build | 방향 계약 잠금 |
| build > review | 캡처·훅·리뷰 요청 |
| review > build | fix·rebuild 재수정 |
| review > doc | ship 확정 | emphasis |

@steps id=flow-steps
| s-boot | 세션 부트·라우팅 | **입력** 사용자 요청, 선택적 `--target <path>` · **참조** `SKILL.md` · `reference/routing.md` · `reference/doctor.md` · `foundations.md` · **실행** `<skill-base-dir>/scripts/impeccable context [--target <path>]` (내부: 체크섬 검증 외부 바이너리 호출, 내부 구현 미확인) · **출력** `PRODUCT.md`·`DESIGN.md`·표면 브리프 맥락, 표면 모드(`Persuade`·`Operate`·`Read`·`Experience`) 및 플랫폼(`web`·`ios`·`android`·`adaptive`) 결정. **처리** 세션당 1회 `context`를 읽어 모드를 가르고, 인자가 없으면 `signals`와 `detect --json` 기반 메뉴만 제시하며 관리 명령(`foundations`·`doctor`)은 명시 호출 시에만 실행한다.[](source:setup)[](source:modes)[](source:routemd)[](source:docfoundry) **다음** 런처가 실패하면 1회만 알리고 프로젝트 파일을 직접 읽으며, `NO_PRODUCT_MD`이거나 `init`·`shape`·신규 화면이면 방향 잠금으로 간다.[](source:setup)[](source:init) | flow-diagram | boot |
| s-world | 기획·시각 세계 잠금 | **입력** `PRODUCT.md`, 기존 `DESIGN.md`, 참조 이미지, 사용자 응답 · **참조** `reference/init.md` · `shape.md` · `new-work.md` · `new-work-world.md` · `mode-*.md` · **실행** `impeccable concept-seed --scope direction --mode <mode>` · `impeccable serve-question --start/--update/--wait` · `impeccable surface-brief read/write` (내부 구현 미확인) · **출력** `PRODUCT.md`, 7섹션 설계 브리프(`shape`), 6블록 방향 계약(`THESIS`·`OWN-WORLD`·`STORY`·`FIRST VIEWPORT`·`FORM` `seed:`). **처리** `init`·`shape`로 맥락과 설계를 좁힌 뒤 시각 권한 4분기를 판정하고, 새 세계면 주사위 추첨·도전자 카드 최대 3장·결정 보드로 방향을 확정해 표면 브리프에 잠근다.[](source:shape)[](source:newwork)[](source:newworld) **다음** `shape`만 요청받았으면 코드를 쓰지 않고 멈추며, `comp` 경로면 `visualize.md` 시안 3종 승인을 거쳐 제작으로 넘긴다.[](source:shape)[](source:vis) | flow-diagram | world |
| s-build | 품질 하한·제작·live | **입력** 방향 계약(또는 대상 UI), `buildPath`(`comp`/`code`), `live` 세션 · **참조** `reference/craft-floor.md` · `new-work-comp.md` · `component-review.md` · `live.md` · 17개 개선 플레이북 · **실행** `impeccable build-phase start/advance` · `comp-spec` · `component-review plan/capture/serve/verify` · `live-wrap`/`live-insert`/`live-poll` (내부: `impeccable_asset_producer`·`impeccable_manual_edit_applier` 위임, 내부 구현 미확인) · **출력** UI 구현 코드, 1.5배율 투명·불투명 플레이트, HMR 변형 반영 코드. **처리** UI 수정 직전에만 `craft-floor.md` 거부 목록을 적재하고, `comp` 경로는 시안 승인→스펙 측정→플레이트 사람 게이트→첫 화면 `hero` 72% `comp-diff`→나머지 섹션·모션·반응형(`1440px`/`390px`) 순으로 7단계 상태 머신을 밟는다.[](source:craftfloor)[](source:newcomp)[](source:comprev)[](source:assetagent) **다음** `live`에서 사용자가 `Apply` 버튼을 누르면 편집 전담 에이전트가 타입을 지켜 원본 소스에 반영한다.[](source:live)[](source:editagent) | flow-diagram | build |
| s-review | 검수·탐지 통과? | **입력** `desktop.png`·`mobile.png`(또는 네이티브 캡처), `comp-diff` 보고서, 모션 캡처 · **참조** `reference/hooks.md` · `critique.md` · `audit.md` · `animate.md` · `impeccable_finish_reviewer.toml` · **실행** `impeccable detect --json` · `impeccable comp-diff` · `impeccable motion-capture` · `critique-storage`/`audit-storage` (내부 구현 미확인) · **출력** `disposition`(`recapture`/`rebuild`/`fix`/`ship`), `critique`·`audit` 점수 리포트. **처리** 편집·종료 2단계 훅(미지원 하네스는 수동 `detect`)으로 기계 규칙을 걸러내고, 분리 컨텍스트의 `impeccable_finish_reviewer`(`fork_turns: 0`, 미지원 시 `degraded/` 인라인 대체)가 증거·영속성·충실도·상한·`seed`·진실성·하한 7항목을 판정한다.[](source:hooks)[](source:newwork)[](source:revagent)[](source:anim) **다음** `recapture`면 재촬영하고 `fix`/`rebuild`면 다시 고치되, 자동 진행은 수정 1라운드, 대화형은 open 항목 포함 2번째 판정 뒤 사용자에게 묻는다.[](source:newwork)[](source:revagent) | flow-diagram | review |
| s-doc | DESIGN.md·상태 마감 | **입력** 검증 통과 코드·스타일시트, 방향 계약, 기존 `DESIGN.md` 유지 선택 · **참조** `reference/document.md` · `impeccable_documenter.toml` · **실행** `impeccable embed-prompt --scan` · `impeccable build-phase finish --disposition ship` (내부 구현 미확인) · **출력** 루트 `DESIGN.md`, `.impeccable/design.json` sidecar, 닫힌 빌드 상태. **처리** `impeccable_documenter`가 계획서가 아닌 **실제 구현 산출물**에서 색상 램프·타이포·`ds-` Shadow DOM 스니펫을 추출해 기록하되 `craft-floor` 위반 요소는 시스템 규칙으로 굳히지 않는다.[](source:doc)[](source:docagent)[](source:newwork) **다음** 기존 `DESIGN.md`가 있으면 시드 세계 첫 빌드가 아닌 한 `refresh`/`overwrite`/`merge` 선택을 받아 기록하고 마친다.[](source:doc) | flow-diagram | doc |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | `$impeccable [명령]` 또는 `$<pin된 명령>`으로 부르거나 모델이 `description`을 보고 자동으로 켠다. 호출 제한 필드는 원문에 명시 없음.[](source:fm)[](source:routing) |
| 성격 | 24개 UI 워크플로 플레이북을 외부 체크섬 검증 바이너리(`context`·`concept-seed`·`comp-diff`·`detect`·`live`)와 5개 서브에이전트·탐지 훅으로 엮어 실행하는 하네스다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r91} | Google Labs `DESIGN.md` / Stitch(범위 밖) | 참고 | `document` 커맨드가 Google Labs 공식 `DESIGN.md` 8섹션·Stitch YAML frontmatter 린터와 `.impeccable/design.json` sidecar 규격을 따른다. 사용자 개입은 없다.[](source:doc) |

@architecture id=relation-map title="impeccable과 이어지는 스킬"
| self | impeccable(이 스킬) | backend |
| stitch | Google Labs DESIGN.md / Stitch(범위 밖) | external |
| self > stitch | 참고 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

커밋 총 117개 파일 중 번역본 48개(`*.ko.md`·`*.ko.stale.md`)를 뺀 원본 69개 파일의 구성이다(`66`개 전체 읽기, `3`개 대용량·번들 선두 샘플).

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 세션 부트, Visitor 모드 4종, 24개 커맨드 표, 라우팅·관리 명령 규칙 | 스킬이 켜질 때 항상 먼저 읽는다 | 세션 부트·라우팅 |
| `reference/routing.md`, `scripts/command-metadata.json` | 무인자 호출 시 추천 메뉴 규칙과 24개 커맨드 설명 JSON | 인자 없이 호출되거나 메뉴를 안내할 때 | 세션 부트·라우팅 |
| `reference/init.md`, `shape.md`, `doctor.md`, `foundations.md` | `PRODUCT.md` 인터뷰, 7섹션 설계 브리프, 드리프트 진단, 출시 18항목 로드맵 | `NO_PRODUCT_MD`이거나 `init`·`shape`·`doctor`·`foundations` 실행 시 | 세션 부트·라우팅; 기획·시각 세계 잠금 |
| `reference/new-work.md`, `new-work-world.md`, `mode-persuade.md`, `mode-operate.md`, `mode-read.md`, `craft.md` | 시각 권한 4분기, 7시스템 세계 추첨, 방향 계약, 모드별 규칙, `craft` 별칭 | 신규 화면·재설계·시각 방향 결정 시 | 기획·시각 세계 잠금; 품질 하한·제작·live |
| `reference/visualize.md`, `new-work-comp.md`, `component-review.md`, `region-map.md` | 시안 3종 승인, `comp` 7단계 상태 머신, 사람 자산 검토 게이트, 영역 매핑 | `buildPath`가 `comp`일 때 | 기획·시각 세계 잠금; 품질 하한·제작·live |
| `reference/craft-floor.md`, `operate.md`, `ios.md`, `android.md` | 편집 직전 대비·치수·Refuse 금지 목록, `Operate`/`Read` 규격, Apple HIG·Material 3 기준 | UI 코드를 수정하기 직전과 해당 모드·플랫폼일 때 | 품질 하한·제작·live; 검수·탐지 통과? |
| `reference/bolder.md`, `quieter.md`, `distill.md`, `colorize.md`, `typeset.md`, `layout.md`, `delight.md`, `overdrive.md`, `animate.md`, `adapt.md`, `adapt.native.md`, `clarify.md`, `harden.md`, `onboard.md`, `optimize.md`, `extract.md`, `polish.md` | 증폭·절제·단순화·배색·타이포·배치·모션·적응(웹/네이티브)·문구·견고성·온보딩·성능·추출·다듬기 17개 플레이북 | 해당 서브 커맨드 요청 시 | 품질 하한·제작·live |
| `reference/critique.md`, `critique-rubric.md`, `audit.md`, `audit.native.md` | 닐슨 10원칙·5인 페르소나 UX 비평과 웹·네이티브 20점 기술 감사 | `critique`·`audit` 호출 시(네이티브는 `.native` 분기) | 검수·탐지 통과? |
| `reference/live.md`, `live-setup.md`, `generate.md`, `scripts/live-browser-ignores.js`, `live-browser-dom.js`, `live-browser-session.js`, `live-browser.js`(샘플), `modern-screenshot.umd.js`(샘플) | 브라우저 HMR 실시간 변형·예외 필터·Shadow/Top-Layer DOM·세션 복구·캡처 번들 | `live`·`generate` 세션 실행 시 | 품질 하한·제작·live; 검수·탐지 통과? |
| `reference/hooks.md`, `document.md` | 편집/종료 2단계 탐지 훅 설정·면제 규칙과 `DESIGN.md`·`design.json` 스펙 | 탐지 훅 관리 또는 `document` 실행 시 | 검수·탐지 통과?; DESIGN.md·상태 마감 |
| `agents/impeccable_*.toml`(5종), `agents/openai.yaml`, `reference/degraded/*.md`(5종) | 자산 생성·완성 검수·모션 검수·수동 편집 반영·문서화 에이전트와 미지원 하네스 폴백 | 서브에이전트 위임 또는 단일 컨텍스트 대체 실행 시 | 품질 하한·제작·live; 검수·탐지 통과?; DESIGN.md·상태 마감 |
| `scripts/impeccable`, `impeccable.cmd`, `VERSION`, `engine-checksums.txt`, `data/font-index-failures.json`, `data/font-index.json`(샘플) | 무의존 POSIX/Windows 엔진 런처, 5종 플랫폼 SHA-256 검증, 구글 폰트 지표·실패 목록 | 모든 엔진 CLI 호출과 폰트 매칭 시 | 세션 부트·라우팅; 기획·시각 세계 잠금; 품질 하한·제작·live; 검수·탐지 통과?; DESIGN.md·상태 마감 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 인자 없이 `$impeccable` 호출 | 강제: 추천 커맨드와 그룹별 메뉴만 보여 주고 어떠한 작업도 자동 실행하지 않는다 | [](source:routemd) |
| 계획·기획만 수행하고 UI 편집이 없다 | 금지: `reference/craft-floor.md`를 미리 읽지 않고 UI 수정 직전에만 적재한다 | [](source:setup) |
| UI를 수정하기 직전이다 | 금지(`Refuse`): 제목 위 kicker/eyebrow, `feTurbulence` 스케치 SVG, 시스템 디스플레이 폰트(대신 `font-fetch` 사용), 단면 테두리 막대, 0오프셋 네온 헤일로, 네오브루탈리즘 외 하드 오프셋 그림자를 금지한다 | [](source:craftfloor) |
| `doctor`나 `context`에서 `CONTEXT_STALE`·드리프트가 발견됐다 | 금지: `auto`로 표시된 항목의 다음 쓰기 외에는 사용자 요청 없이 드리프트를 부수 작업으로 수리하지 않는다 | [](source:routing)[](source:docdr) |
| `critique`·`audit`를 실행했다 | 강제: 채팅 보고와 이력 저장까지만 하고 요청 전 코드를 수정하지 않는다 | [](source:crit)[](source:aud) |
| `overdrive` 모드로 진입했다 | 승인 지점: 코드 작성 전 2~3개 기술 방향과 트레이드오프를 제시하고 사용자 선택을 받은 뒤 구현한다 | [](source:over) |
| 탐지 `hook`(`hooks.md`)이나 `document`·`live-setup`에서 권한 밖 설정이 걸린다 | 승인 지점: `ignore-file`·`ignore-rule` 넓은 면제, 기존 `DESIGN.md` 덮어쓰기(시드 세계 첫 빌드 제외), `CSP`에 `localhost:8400` 추가(`NODE_ENV === "development"`)는 사용자 확인 없이 진행 금지 | [](source:hooks)[](source:doc)[](source:livesetup) |
| `comp` 경로 시안 승인(`visualize`)·`component-review`·`finish_reviewer` 검증 | 멈춤·승인: 시안 결정 보드와 사람 게이트가 닫히지 않으면 건너뛰지 않고 멈추며, `desktop.png`·`mobile.png` 캡처 누락·파손 시 `disposition: recapture`로 판정표를 쓰지 않고 중단한다 | [](source:vis)[](source:comprev)[](source:revagent) |
| 외부 엔진 바이너리 실행 환경 | 주의: 런처는 `engine-checksums.txt`의 SHA-256 검증에 실패하거나 미등록이면 실행을 거부하며, 훅과 엔진은 샌드박스 밖 실행을 전제로 한다 | [](source:hooks)[](source:launcher)[](source:checksums) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 24개 커맨드·모드별 조형 규칙 — 개요 항목 "품질 하한·제작·live" · `craft-floor.md`, 17개 개선 플레이북, `ios.md`·`android.md`, `critique-rubric.md` 세부 채점 기준은 개요에서 뺐다.
- 5개 서브에이전트 입출력 계약과 `live` 프로토콜 — 개요 항목 "품질 하한·제작·live" · 투명 컷아웃 파이프라인, JSX 원자적 패치 규칙, 브라우저 오버레이 통신 세부는 개요에 담지 않았다.

@callout level=open-question title="확인하지 못한 것"
| `scripts/data/font-index.json`(1.1MB, 스키마·선두 레코드만 확인), `scripts/live-browser.js`(13,921줄 중 1~60줄만 확인), `scripts/modern-screenshot.umd.js`(서드파티 축약 번들 14줄만 확인)은 전체 내용을 읽지 않았다.[](source:fontindex)[](source:livejs)[](source:umd) |
| 런처가 런타임에 내려받는 외부 엔진 바이너리(`0.1.27`: `context`, `concept-seed`, `comp-spec`, `comp-diff`, `detect`, `serve-question`, `build-phase` 등 구현체)는 저장소에 없어 내부 구현을 확인하지 못했다. |

읽은 원본: 원본 텍스트 파일 66개 전체(`SKILL.md`, `agents/` 6개, `reference/`·`reference/degraded/` 50개, `scripts/VERSION`·`command-metadata.json`·`engine-checksums.txt`·`impeccable`·`impeccable.cmd`·`live-browser-dom.js`·`live-browser-ignores.js`·`live-browser-session.js`·`data/font-index-failures.json`) + 선두·구조 샘플 3개(`scripts/data/font-index.json`, `scripts/live-browser.js`, `scripts/modern-screenshot.umd.js`). 제외: `*.ko.md`·`*.ko.stale.md` 48개(번역본), 외부 릴리스 바이너리(저장소 미포함).
