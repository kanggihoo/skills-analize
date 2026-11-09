# impeccable 스킬은 에이전트를 어떻게 바꾸나 {#impeccable-skill}

`impeccable`을 쓰면 에이전트는 UI를 고치기 전에 프로젝트 문맥을 먼저 읽고, 요청을 24개 하위 명령 중 하나의 절차로 처리한다. 매 세션 처음에 `scripts/impeccable context`를 한 번 돌려 `PRODUCT.md`·`DESIGN.md`를 불러오고, UI를 편집하기 직전에는 `craft-floor.md`의 품질 하한과 금지 목록을 읽는다.[](source:sm-setup) 새 화면이나 디자인 교체에서는 주사위 배정(`concept-seed`), 사용자의 방향 선택, 방향 계약 기록, 별도 리뷰어의 판정을 거쳐야 끝난다.[](source:nw-world)[](source:nw-review)

- 켜지는 때: 웹·앱·iOS·Android 화면을 만들거나, 비평·감사·다듬기를 요청받을 때다. 호출 제한 필드는 없다.[](source:sm-fm)
- 강제하는 것: 사용자 브리프가 에이전트 취향보다 우선한다. 다듬기는 기존 정체성을 지키고, 교체는 새 세계를 고른다. 둘을 섞지 않는다.[](source:sm-design)
- 사람이 정하는 것: 방향 카드 고르기, comp(이미지로 만든 완성 시안) 승인, 기존 `DESIGN.md` 덮어쓰기 여부 같은 지점은 에이전트가 대신 정하지 않는다.[](source:vz-approve)[](source:dc-when)
- 쓰면 안 되는 때: 백엔드 전용이나 UI가 아닌 작업이다. `live`·`generate`·`detect`는 웹 전용이라 native 프로젝트에는 쓰지 않는다.[](source:sm-fm)[](source:rt-menu)

@answer scope="design/impeccable/impeccable v4.8.0 · 엔진 0.1.18 · 커밋 4e3fc89 · 원본 텍스트 57개 537,328B 전부 읽음 · 큰 번들 6개는 구조·표본만 · 엔진 바이너리는 저장소에 없어 지시상 동작만 서술 · 스크립트는 읽기만 하고 실행하지 않음"
@meta locale=ko
@source sm-fm title="design/impeccable/impeccable/SKILL.md · 11762B · 진입점과 명령 표" path=design/impeccable/impeccable/SKILL.md lines=1:6
@source sm-principles title="SKILL.md · 핵심 원칙" path=design/impeccable/impeccable/SKILL.md lines=8:13
@source sm-setup title="SKILL.md · `Setup`과 launcher 실패 처리" path=design/impeccable/impeccable/SKILL.md lines=15:21
@source sm-design title="SKILL.md · How to design" path=design/impeccable/impeccable/SKILL.md lines=23:28
@source sm-modes title="SKILL.md · 방문자 모드 4개" path=design/impeccable/impeccable/SKILL.md lines=30:39
@source sm-cmds title="SKILL.md · Commands 표" path=design/impeccable/impeccable/SKILL.md lines=41:69
@source sm-anim title="SKILL.md · animate 행" path=design/impeccable/impeccable/SKILL.md lines=58:58
@source sm-routing title="SKILL.md · Routing" path=design/impeccable/impeccable/SKILL.md lines=70:78
@source sm-admin title="SKILL.md · Pin, Hooks, Doctor, drift 수리 금지" path=design/impeccable/impeccable/SKILL.md lines=80:86
@source rt-wq title="reference/routing.md · 3336B · 워크플로 질문" path=design/impeccable/impeccable/reference/routing.md lines=3:5
@source rt-menu title="routing.md · 인자 없는 호출의 맥락 메뉴" path=design/impeccable/impeccable/reference/routing.md lines=7:24
@source cf-verify title="reference/craft-floor.md · 5532B · Verify" path=design/impeccable/impeccable/reference/craft-floor.md lines=1:17
@source cf-refuse title="craft-floor.md · Refuse" path=design/impeccable/impeccable/reference/craft-floor.md lines=19:50
@source nw-truth title="reference/new-work.md · 63005B · 1~2단계" path=design/impeccable/impeccable/reference/new-work.md lines=7:27
@source nw-surface title="new-work.md · 기존 세계 안의 새 화면" path=design/impeccable/impeccable/reference/new-work.md lines=35:41
@source nw-world title="new-work.md · 세계 만들기·교체와 concept-seed" path=design/impeccable/impeccable/reference/new-work.md lines=43:49
@source nw-page title="new-work.md · 기본형 선택지와 결정 페이지" path=design/impeccable/impeccable/reference/new-work.md lines=51:51
@source nw-comps title="new-work.md · 결정 카드 comp" path=design/impeccable/impeccable/reference/new-work.md lines=53:53
@source nw-path title="new-work.md · comp-led와 code-led" path=design/impeccable/impeccable/reference/new-work.md lines=55:55
@source nw-commit title="new-work.md · 4 세계 확정" path=design/impeccable/impeccable/reference/new-work.md lines=63:69
@source nw-contract title="new-work.md · 5 방향 계약" path=design/impeccable/impeccable/reference/new-work.md lines=71:91
@source nw-phases title="new-work.md · 6 comp-led 단계 게이트" path=design/impeccable/impeccable/reference/new-work.md lines=93:116
@source nw-frontier title="new-work.md · 작은 모델 경고" path=design/impeccable/impeccable/reference/new-work.md lines=106:106
@source nw-inspect title="new-work.md · 7 점검" path=design/impeccable/impeccable/reference/new-work.md lines=134:140
@source nw-review title="new-work.md · 마무리 리뷰어와 disposition" path=design/impeccable/impeccable/reference/new-work.md lines=142:148
@source nw-doc title="new-work.md · documenter와 build-phase finish" path=design/impeccable/impeccable/reference/new-work.md lines=150:152
@source cr-inv title="reference/critique.md · 48958B · 불변 조건" path=design/impeccable/impeccable/reference/critique.md lines=1:16
@source cr-orch title="critique.md · 평가 A·B 서브에이전트 규칙" path=design/impeccable/impeccable/reference/critique.md lines=31:53
@source cr-score title="critique.md · 점수 표와 n/a" path=design/impeccable/impeccable/reference/critique.md lines=125:149
@source cr-ask title="critique.md · 사용자 질문과 생략 조건" path=design/impeccable/impeccable/reference/critique.md lines=258:280
@source cr-cog title="critique.md · 인지 부하" path=design/impeccable/impeccable/reference/critique.md lines=354:385
@source cr-bands title="critique.md · 점수 구간과 P0~P3" path=design/impeccable/impeccable/reference/critique.md lines=633:660
@source cr-agents title="critique.md · AGENTS.md Design Context 언급" path=design/impeccable/impeccable/reference/critique.md lines=823:829
@source in-flow title="reference/init.md · 12229B · 범위" path=design/impeccable/impeccable/reference/init.md lines=1:15
@source in-ask title="init.md · 인터뷰 규칙" path=design/impeccable/impeccable/reference/init.md lines=25:41
@source in-gate title="init.md · 완료 조건" path=design/impeccable/impeccable/reference/init.md lines=106:108
@source in-build title="init.md · buildPath 질문" path=design/impeccable/impeccable/reference/init.md lines=110:118
@source in-wrap title="init.md · commit할 파일 안내" path=design/impeccable/impeccable/reference/init.md lines=120:124
@source sh-cad title="reference/shape.md · 3547B · 질문 리듬" path=design/impeccable/impeccable/reference/shape.md lines=9:14
@source sh-stop title="shape.md · 확인하고 멈춤" path=design/impeccable/impeccable/reference/shape.md lines=53:59
@source po-head title="reference/polish.md · 6646B · 다듬기 원칙" path=design/impeccable/impeccable/reference/polish.md lines=1:5
@source po-snap title="polish.md · critique 스냅샷 사용과 닫기" path=design/impeccable/impeccable/reference/polish.md lines=29:35
@source po-close title="polish.md · 스냅샷 닫기 조건" path=design/impeccable/impeccable/reference/polish.md lines=99:105
@source au-head title="reference/audit.md · 9584B · 범위" path=design/impeccable/impeccable/reference/audit.md lines=1:5
@source au-touch title="audit.md · 터치 대상 기준" path=design/impeccable/impeccable/reference/audit.md lines=50:50
@source au-score title="audit.md · 점수 표" path=design/impeccable/impeccable/reference/audit.md lines=66:79
@source an-time title="reference/animate.md · 5236B · 시간과 easing" path=design/impeccable/impeccable/reference/animate.md lines=50:61
@source an-a11y title="animate.md · reduced motion" path=design/impeccable/impeccable/reference/animate.md lines=73:77
@source an-mode title="animate.md · 모드별 모션" path=design/impeccable/impeccable/reference/animate.md lines=7:11
@source bo-scope title="reference/bolder.md · 3566B · 범위 고정" path=design/impeccable/impeccable/reference/bolder.md lines=1:9
@source ov-ask title="reference/overdrive.md · 9079B · 먼저 제안" path=design/impeccable/impeccable/reference/overdrive.md lines=12:20
@source ov-perf title="overdrive.md · 성능 규칙" path=design/impeccable/impeccable/reference/overdrive.md lines=102:118
@source ex-ask title="reference/extract.md · 3406B · 3회 기준" path=design/impeccable/impeccable/reference/extract.md lines=9:22
@source qu-num title="reference/quieter.md · 5020B · 줄이는 수치" path=design/impeccable/impeccable/reference/quieter.md lines=50:76
@source di-num title="reference/distill.md · 5598B · 시각 단순화" path=design/impeccable/impeccable/reference/distill.md lines=50:56
@source ha-num title="reference/harden.md · 10748B · 텍스트 크기와 i18n" path=design/impeccable/impeccable/reference/harden.md lines=79:91
@source on-tour title="reference/onboard.md · 7688B · 투어" path=design/impeccable/impeccable/reference/onboard.md lines=129:134
@source op-cwv title="reference/optimize.md · 7577B · Core Web Vitals" path=design/impeccable/impeccable/reference/optimize.md lines=189:209
@source ty-num title="reference/typeset.md · 6263B · 적용 규칙" path=design/impeccable/impeccable/reference/typeset.md lines=44:56
@source la-num title="reference/layout.md · 5161B · 간격 규칙" path=design/impeccable/impeccable/reference/layout.md lines=45:50
@source co-num title="reference/colorize.md · 4537B · 대비 표" path=design/impeccable/impeccable/reference/colorize.md lines=53:61
@source ad-head title="reference/adapt.md · 11313B · 웹 전용" path=design/impeccable/impeccable/reference/adapt.md lines=1:5
@source ad-bp title="adapt.md · breakpoint" path=design/impeccable/impeccable/reference/adapt.md lines=130:137
@source opm-num title="reference/operate.md · 4145B · Operate 타이포·모션" path=design/impeccable/impeccable/reference/operate.md lines=11:44
@source ios-num title="reference/ios.md · 3812B · 터치·타이포" path=design/impeccable/impeccable/reference/ios.md lines=11:26
@source and-num title="reference/android.md · 4203B · 터치·내비게이션" path=design/impeccable/impeccable/reference/android.md lines=11:26
@source hk-head title="reference/hooks.md · 17337B · hook 동작" path=design/impeccable/impeccable/reference/hooks.md lines=1:9
@source hk-config title="hooks.md · 설정 파일" path=design/impeccable/impeccable/reference/hooks.md lines=11:15
@source hk-harness title="hooks.md · 하네스별 설치 위치와 자동 복구" path=design/impeccable/impeccable/reference/hooks.md lines=17:27
@source hk-actions title="hooks.md · 동작 표" path=design/impeccable/impeccable/reference/hooks.md lines=29:57
@source hk-triage title="hooks.md · 지적 분류" path=design/impeccable/impeccable/reference/hooks.md lines=59:76
@source hk-trust title="hooks.md · 신뢰 범위와 제약" path=design/impeccable/impeccable/reference/hooks.md lines=109:116
@source dr-sev title="reference/doctor.md · 5617B · severity별 행동" path=design/impeccable/impeccable/reference/doctor.md lines=1:44
@source dr-boot title="doctor.md · 부팅 점검 끄기" path=design/impeccable/impeccable/reference/doctor.md lines=52:54
@source lv-contract title="reference/live.md · 37579B · 계약과 하네스 정책" path=design/impeccable/impeccable/reference/live.md lines=1:32
@source lv-plan title="live.md · 변형 3개 계획" path=design/impeccable/impeccable/reference/live.md lines=139:175
@source lv-params title="live.md · 파라미터 예산" path=design/impeccable/impeccable/reference/live.md lines=218:242
@source lv-carbon title="live.md · accept 후 carbonize" path=design/impeccable/impeccable/reference/live.md lines=277:287
@source lv-exit title="live.md · 종료와 정리" path=design/impeccable/impeccable/reference/live.md lines=315:325
@source ls-csp title="reference/live-setup.md · 8186B · CSP 동의" path=design/impeccable/impeccable/reference/live-setup.md lines=43:71
@source ge-parse title="reference/generate.md · 13221B · 금지와 요청 해석" path=design/impeccable/impeccable/reference/generate.md lines=1:37
@source ge-close title="generate.md · accept와 종료" path=design/impeccable/impeccable/reference/generate.md lines=86:101
@source dc-when title="reference/document.md · 27526B · 실행 시점과 덮어쓰기" path=design/impeccable/impeccable/reference/document.md lines=64:78
@source dc-sidecar title="document.md · design.json sidecar" path=design/impeccable/impeccable/reference/document.md lines=251:255
@source vz-comps title="reference/visualize.md · 13956B · comp 3개" path=design/impeccable/impeccable/reference/visualize.md lines=9:13
@source vz-approve title="visualize.md · 승인 지점" path=design/impeccable/impeccable/reference/visualize.md lines=25:33
@source cmr-serve title="reference/component-review.md · 8017B · 플랜·에셋 리뷰" path=design/impeccable/impeccable/reference/component-review.md lines=1:13
@source de-guard title="reference/delight.md · 3716B · 막는 것" path=design/impeccable/impeccable/reference/delight.md lines=48:59
@source cl-ask title="reference/clarify.md · 4590B · 묻고 바꿀 것" path=design/impeccable/impeccable/reference/clarify.md lines=18:18
@source mo-op title="reference/mode-operate.md · 4716B · Operate 방향 규칙" path=design/impeccable/impeccable/reference/mode-operate.md lines=5:11
@source fr-disp title="agents/impeccable_finish_reviewer.toml · 15731B · disposition" path=design/impeccable/impeccable/agents/impeccable_finish_reviewer.toml lines=30:36
@source doc-agent title="agents/impeccable_documenter.toml · 3562B · 덮어쓰기 선택" path=design/impeccable/impeccable/agents/impeccable_documenter.toml lines=12:22
@source mea-rule title="agents/impeccable_manual_edit_applier.toml · 7472B · 금지 동작" path=design/impeccable/impeccable/agents/impeccable_manual_edit_applier.toml lines=26:26
@source dg-fr title="reference/degraded/finish-reviewer.md · 15880B · 서브에이전트 없을 때" path=design/impeccable/impeccable/reference/degraded/finish-reviewer.md lines=1:3
@source sc-head title="scripts/impeccable · 11320B · sh launcher 설명" path=design/impeccable/impeccable/scripts/impeccable lines=1:18
@source sc-order title="scripts/impeccable · 엔진 찾는 순서" path=design/impeccable/impeccable/scripts/impeccable lines=93:152
@source sc-dl title="scripts/impeccable · 다운로드와 검증" path=design/impeccable/impeccable/scripts/impeccable lines=183:262
@source sc-cmd title="scripts/impeccable.cmd · 12503B · Windows launcher" path=design/impeccable/impeccable/scripts/impeccable.cmd lines=1:23
@source sc-ck title="scripts/engine-checksums.txt · 787B · 엔진 해시" path=design/impeccable/impeccable/scripts/engine-checksums.txt lines=1:9
@source sc-ver title="scripts/VERSION · 7B · 엔진 버전" path=design/impeccable/impeccable/scripts/VERSION lines=1:1
@source lp-fm title="design/elayadesign/landing-page-design/SKILL.md · description(비교용)" path=design/elayadesign/landing-page-design/SKILL.md lines=3:3
@source tf-fm title="design/taste/design-taste-frontend/SKILL.md · description(비교용)" path=design/taste/design-taste-frontend/SKILL.md lines=3:11
@source wde-fm title="design/garden-skills/web-design-engineer/SKILL.md · description(비교용)" path=design/garden-skills/web-design-engineer/SKILL.md lines=3:3
@source em-anim title="design/emilkowalski/animate/SKILL.md · description(비교용)" path=design/emilkowalski/animate/SKILL.md lines=3:3

## 언제 켜지고, 어떤 명령으로 가나 {#trigger}

@code source=sm-fm language=yaml

`disable-model-invocation` 같은 호출 제한 필드는 없다. 모델이 `description`을 참고해 켤 수 있다.[](source:sm-fm) 판정: `description`은 판단용 설명이다. 특정 단어가 있다고 켜지는 목록이 아니다.

에이전트는 요청을 받으면 먼저 `Setup` 단계를 하고, 그다음 Routing 규칙으로 갈 곳을 정한다.[](source:sm-setup)[](source:sm-routing)

@workflow id=route-flow title="요청에서 명령까지"
| rq | 요청 도착 | external |
| ctx | context 1회 실행 | backend |
| noarg | 인자 없음? | backend |
| menu | 맥락 메뉴 제시 | frontend |
| named | 명령 지목? | backend |
| ref | 명령 reference | backend |
| wq | 워크플로 질문? | backend |
| advice | 조언만 | frontend |
| big | 새 화면·교체? | backend |
| prod | PRODUCT.md 있음? | backend |
| init | init | backend |
| nw | new-work | backend |
| narrow | 기존 코드 다듬기 | backend |
| rq > ctx | |
| ctx > noarg | |
| noarg > menu | 예 |
| noarg > named | 아니오 |
| named > ref | 예 | emphasis |
| named > wq | 아니오 |
| wq > advice | 예 |
| wq > big | 아니오 |
| big > prod | 예 |
| big > narrow | 아니오 |
| prod > nw | 예 |
| prod > init | 아니오 |

@steps id=route-steps
| ctx | context 1회 실행 | 세션당 한 번 `<skill-base-dir>/scripts/impeccable context`를 돌린다. cwd는 사용자 프로젝트에 둔다. 이 명령이 `PRODUCT.md`, `DESIGN.md`, 화면별 surface brief, native 플랫폼 지침을 불러온다. 다시 돌리지 않는다. Windows에서 `sh`가 없으면 `impeccable.cmd`를 쓴다. launcher가 실패하면 다음 도구 호출 전에 "Context loading did not run" 메시지를 따로 보내고, 기존 파일을 직접 읽는다. 없는 문맥은 지어내지 않는다.[](source:sm-setup) | route-flow | ctx |
| noarg | 인자 없음? | 인자 없이 부르면 `routing.md`의 맥락 메뉴를 보여 준다. 명령을 스스로 실행하지 않는다.[](source:sm-routing) | route-flow | noarg |
| menu | 맥락 메뉴 제시 | `NO_PRODUCT_MD`면 `init`을 맨 위에 추천한다. 아니면 `impeccable signals` JSON을 읽고 가장 값어치 있는 다음 명령 2~3개를 이유와 함께 먼저 보여 준 뒤 전체 메뉴를 붙인다. 추천은 사용자가 확인하는 제안이다.[](source:rt-menu) | route-flow | menu |
| named | 명령 지목? | 명시했거나 분명히 암시된 명령이면 그 참조 파일을 읽고 따른다. native 플랫폼이면 native 변형을 읽는다. 두 명령이 다 맞으면 한 번 묻는다.[](source:sm-routing) | route-flow | named |
| wq | 워크플로 질문? | "어떤 명령을 써야 하나" 같은 질문에는 명령을 실행하지 않고 조언만 한다. 실행도 요청했으면 따른다.[](source:rt-wq) | route-flow | wq |
| big | 새 화면·교체? | 그 밖의 요청은 일반 디자인 작업이다. 기존 코드를 좁게 다듬는 일은 바로 진행하고, `init`은 끝난 뒤에 권한다.[](source:sm-routing) | route-flow | big |
| prod | PRODUCT.md 있음? | 새 화면이나 시각 세계 교체인데 `PRODUCT.md`가 없으면 `init`부터 한다. `init`이 `PRODUCT.md`를 쓰면 `context`를 다시 돌리지 않고 원래 요청으로 돌아가 new-work로 간다. `DESIGN.md`가 없다는 이유만으로 `init`으로 돌아가지 않는다.[](source:sm-routing)[](source:nw-truth) | route-flow | prod |
| narrow | 기존 코드 다듬기 | 어느 갈래든 UI를 편집하기 직전에는, 작은 수정이라도 `craft-floor.md`를 읽는다. 계획만 하는 작업에는 읽지 않는다.[](source:sm-setup) | route-flow | narrow |

인자 없이 불렀을 때 메뉴가 고르는 기준은 원문에 적힌 신호다. 에이전트는 점수를 따르지 않고 신호를 보고 판단한다.[](source:rt-menu)

| 신호 | 추천 |
| --- | --- |
| `setup.hasDesign` false, `setup.hasCode` true | `document` |
| `critique.latest`가 `null`이고 실제 화면이 있음 | `critique <surface>` |
| 최근 critique 점수가 낮거나 `p0`·`p1`이 0이 아님 | `polish` |
| `git.changedFiles`가 한 화면을 가리킴 | 그 파일로 범위를 좁힌 `audit`이나 `polish` |
| `devServer.running` true | `live`, `generate`. native(`ios`·`android`·`adaptive`)면 추천하지 않음 |
| `detect` 결과에 대비·품질 지적이 많음 | `audit`이나 `polish` |
| 그라데이션 텍스트·eyebrow 지적 | `quieter`나 `typeset` |
| 회색·평평한 팔레트 지적 | `colorize` |

`scan.targets`가 있고 native가 아니면 `impeccable detect --json`을 한 번 돌린다. 오류가 나거나 트리가 너무 크면 건너뛰고, 추천을 막지 않는다.[](source:rt-menu)

**쓰면 안 되는 경우**와 범위를 넘는 행동은 다음과 같다.

| 상황 | 원문 규칙 |
| --- | --- |
| 백엔드 전용·UI가 아닌 작업 {bad:대상 아님} | `description`이 제외한다[](source:sm-fm) |
| native 프로젝트에서 `live`·`generate`·`detect` | 웹 전용이다. `generate`는 거절하고 소스에 `bolder`나 `quieter`를 제안한다[](source:rt-menu)[](source:ge-parse) |
| 배포된 프로덕션 사이트에 live 주입 {bad:금지} | 로컬 checkout만 지원한다. 브라우저 보안을 끄거나 프로덕션 CSP를 약하게 하지 않는다[](source:lv-contract) |
| 디자인 작업 도중 drift 수리 {bad:금지} | `CONTEXT_STALE`은 보고만 한다. `auto` 표시가 붙은 항목만 예외다[](source:sm-admin) |
| 다듬기 요청인데 디자인을 몰래 바꾸기 {bad:금지} | 다듬기는 정체성·동작·문구를 지킨다. 개념이 틀렸으면 redesign이나 `bolder`를 권한다[](source:sm-design)[](source:po-head) |
| 군국주의·우월주의·혐오 운동 상징을 장식으로 쓰기 {bad:금지} | 욱일기 빛살, 남부연합 전투기, 나치 휘장과 변형이 예다. 사실을 기록하는 콘텐츠는 그대로 둔다[](source:sm-design) |
| 작거나 빠른 모델로 comp-led 빌드 {caution:경고} | 방향 라운드 전에 그렇다고 말하고 code-led로 가라고 한다[](source:nw-frontier) |

## 명령 24개는 각각 무엇을 하나 {#commands}

명령 표는 `SKILL.md`의 Commands 표를 옮긴 것이다. 하는 일 칸은 각 참조 파일을 읽고 핵심 강제 사항을 덧붙였다.[](source:sm-cmds)

| 명령 | 분류 | 하는 일 | 참조 파일 |
| --- | --- | --- | --- |
| `craft [feature]` | Build | 폐기 예정 별칭이다. 보통의 새 화면 요청과 같고 더하는 동작이 없다 | `reference/craft.md` |
| `shape [feature]` | Build | 코드 없이 디자인 브리프를 만든다. 질문 2~3개씩 1라운드가 기본이고, 확인받은 뒤 멈춘다[](source:sh-cad)[](source:sh-stop) | `reference/shape.md` |
| `init` | Build | 제품 사실을 `PRODUCT.md`에 기록한다. 미적 방향·색·글꼴은 묻지 않는다[](source:in-ask) | `reference/init.md` |
| `document` | Build | 코드에서 토큰을 뽑아 `DESIGN.md`와 `.impeccable/design.json`을 쓴다[](source:dc-sidecar) | `reference/document.md` |
| `extract [target]` | Build | 같은 의도로 3회 이상 쓰인 패턴만 토큰·컴포넌트로 뽑는다. 디자인 시스템이 없으면 먼저 묻는다[](source:ex-ask) | `reference/extract.md` |
| `critique [target]` | Evaluate | 서로 격리된 평가 A(디자인 리뷰)와 B(detector·브라우저)를 합쳐 Nielsen 휴리스틱 10개를 0~4점으로 매긴다[](source:cr-inv) | `reference/critique.md` |
| `audit [target]` | Evaluate | 접근성·성능·테마·반응형·구현 무결성을 0~4점으로 매기고 고치지 않는다[](source:au-head) | `reference/audit.md` · native: `reference/audit.native.md` |
| `polish [target]` | Refine | 출시 전 마무리 점검이다. 최근 critique 스냅샷의 P0·P1을 함께 처리한다[](source:po-snap) | `reference/polish.md` |
| `bolder [target]` | Refine | 지목한 대상만 이미 가진 시스템 어휘로 키운다. 새 색·글꼴·기본 요소가 필요하면 묻는다[](source:bo-scope) | `reference/bolder.md` |
| `quieter [target]` | Refine | 강도를 낮추되 관점과 개성은 남긴다[](source:qu-num) | `reference/quieter.md` |
| `distill [target]` | Refine | 본질만 남기고 복잡도를 걷어 낸다[](source:di-num) | `reference/distill.md` |
| `harden [target]` | Refine | 긴 텍스트·오류·i18n·중단된 제스처를 견디게 한다[](source:ha-num) | `reference/harden.md` |
| `onboard [target]` | Refine | 첫 실행 흐름·빈 상태·활성화를 설계한다[](source:on-tour) | `reference/onboard.md` |
| `animate [target]` | Enhance | 목적 있는 모션을 더한다. 초점 순간 하나와 `prefers-reduced-motion` 대안이 필수다[](source:an-a11y) | `reference/animate.md` |
| `colorize [target]` | Enhance | 역할이 있는 색을 더한다. 대비 하한을 계산으로 확인한다[](source:co-num) | `reference/colorize.md` |
| `typeset [target]` | Enhance | 타이포 위계와 글꼴을 고친다. 사람 판단과 `detect --scope type`을 따로 돌린다[](source:ty-num) | `reference/typeset.md` |
| `layout [target]` | Enhance | 간격·리듬·위계를 고친다. 사람 판단과 `detect --scope layout`을 따로 돌린다[](source:la-num) | `reference/layout.md` |
| `delight [target]` | Enhance | 의미 있는 순간에만 개성을 더한다. 동의 없는 소리, 건너뛸 수 없는 연출을 막는다[](source:de-guard) | `reference/delight.md` |
| `overdrive [target]` | Enhance | 관례 너머의 기술적 효과를 만든다. 코드 전에 방향 2~3개를 보여 주고 고르게 한다[](source:ov-ask) | `reference/overdrive.md` |
| `clarify [target]` | Fix | UX 문구·레이블·오류 메시지를 고친다. 사실 주장·법적 의미는 묻고 바꾼다[](source:cl-ask) | `reference/clarify.md` |
| `adapt [target]` | Fix | 기기·화면 크기에 맞게 경험을 다시 짠다. 웹 전용이고 native는 변형 파일로 간다[](source:ad-head) | `reference/adapt.md` · native: `reference/adapt.native.md` |
| `optimize [target]` | Fix | 측정한 뒤 실제 병목만 고친다[](source:op-cwv) | `reference/optimize.md` |
| `live` | Iterate | 브라우저에서 요소를 골라 변형을 HMR로 바꿔 끼운다. 웹 전용이다[](source:lv-contract) | `reference/live.md` |
| `generate [n] [action] [element]` | Iterate | 요소·방향·개수를 한 문장으로 받아 live 변형을 만든다. 직접 고르는 단계가 없다[](source:ge-parse) | `reference/generate.md` |

표 밖의 관리 명령도 있다.[](source:sm-routing)[](source:sm-admin)

| 명령 | 하는 일 |
| --- | --- |
| `teach` | `init`의 별칭이다 |
| `pin` · `unpin` | `impeccable pin`으로 `$<command>` 단축 명령을 만들거나 지운다. 오류면 stderr를 그대로 전한다 |
| `hooks` | design detector hook을 켜고 끈다. 동작은 `status`, `on`, `off`, `ignore-rule`, `ignore-file`, `ignore-value`, `reset`이다[](source:hk-actions) |
| `doctor` | 프로젝트의 Impeccable 산출물과 지금 버전이 읽는 형식 사이의 drift를 보고하고 고친다[](source:dr-sev) |

판정: 표의 "분류"는 메뉴를 묶는 이름일 뿐, 실행 순서가 아니다. 다만 다듬기 계열 대부분이 끝에서 `$impeccable polish`로 넘기라고 적고, `critique`·`audit`의 추천 목록도 `polish`로 끝내라고 한다. 근거는 각 참조 파일의 마지막 줄과 추천 규칙이다.[](source:an-a11y)[](source:au-score)

## 새 화면을 만들 때 무엇을 강제하나 {#new-work}

새 화면이나 시각 세계 교체는 `new-work.md`가 맡는다. 에이전트는 아래 순서를 건너뛰지 못한다.[](source:nw-truth)[](source:nw-world)

@workflow id=newwork-flow title="new-work: 새 세계를 만들 때"
| lane decide | 결정 |
| lane record | 기록 |
| lane build | 빌드 |
| lane finish | 마무리 |
| nt | 이미 참인 것 판단 | backend | decide |
| nq | 질문 2~3개 | external | decide |
| ns | concept-seed 배정 | security | decide |
| np | 결정 페이지 선택 | external | decide |
| nc | 방향 계약 기록 | database | record |
| nb | comp-led? | backend | build |
| nph | 단계 게이트 빌드 | backend | build |
| ncl | code-led 빌드 | backend | build |
| ni | 점검 최대 2회 | backend | finish |
| nr | 마무리 리뷰어 | security | finish |
| nd | disposition? | backend | finish |
| ndoc | documenter | database | finish |
| nt > nq | |
| nq > ns | |
| ns > np | |
| np > nc | 사용자 선택 | emphasis |
| nc > nb | |
| nb > nph | 예 |
| nb > ncl | 아니오 |
| nph > ni | |
| ncl > ni | |
| ni > nr | |
| nr > nd | |
| nd > ndoc | ship | emphasis |
| nd > ni | fix·rebuild·recapture | dashed |

@steps id=newwork-steps
| nt | 이미 참인 것 판단 | `DESIGN.md`·코드·토큰·에셋을 읽고 넷 중 하나로 본다. 교체(옛 모습은 근거일 뿐 권위가 아님), 기존 세계 상속, 브랜드 확장, 시각 권위 없음이다. 기존 화면 안의 섹션·컴포넌트 추가는 그 세계를 상속한다.[](source:nw-truth) | newwork-flow | nt |
| nq | 질문 2~3개 | 구현 전에 질문 도구로 2~3개를 묻는다. 정확한 요청이면 짧게 확인만 한다. CSS 값이나 정해진 미적 노선은 묻지 않는다.[](source:nw-truth) | newwork-flow | nq |
| ns | concept-seed 배정 | 세계 후보 7개를 고른 뒤 `impeccable concept-seed --scope direction --mode <mode>`를 돌린다. 새 세계에서 이 스크립트가 돌고 배정을 확인하기 전에 artifact 코드를 쓰면 "contract violation"이다. 하네스·모델·시간 압박과 관계없다.[](source:nw-world) | newwork-flow | ns |
| np | 결정 페이지 선택 | `impeccable serve-question --start`로 카드 페이지를 띄운다. 배정 방향, 에이전트 추천 카드(IMPECCABLE'S PICK) 하나, 도전 카드, 기본형 선택지(카테고리 표준), 다시 굴리기가 있다. 사용자가 고른다.[](source:nw-page) | newwork-flow | np |
| nc | 방향 계약 기록 | 코드 전에 surface brief 파일의 `## Direction contract`에 6블록(THESIS, OWN-WORLD, STORY, FIRST VIEWPORT, FORM, FINISH)을 약 150단어로 쓴다. FORM에는 `seed:`와 16자리 16진수 문자열을 쓰고, 다시 읽어 확인한다. 이 계약을 구현 소스나 브라우저로 가는 산출물에 복사하지 않는다.[](source:nw-contract) | newwork-flow | nc |
| nb | comp-led? | Operate·Read 화면은 항상 code-led다. `Persuade`·`Experience` 화면은 `.impeccable/config.json`의 `buildPath`를 따르고, 기록이 없고 이미지 생성이 가능하면 comp-led가 기본이다.[](source:nw-path) | newwork-flow | nb |
| nph | 단계 게이트 빌드 | comp-led는 `build-phase`가 디스크에 상태를 두고 단계를 막는다. comps(시안 3개와 사용자 승인), spec(comp를 영역으로 측정), plates(래스터 영역을 이미지로 생성), hero(첫 화면, 72% 통과선), sections, motion, responsive 순서다. 앞 게이트가 열려 있으면 뒤 단계를 쓰지 않는다.[](source:nw-phases) | newwork-flow | nph |
| ncl | code-led 빌드 | comp 없이 짓는다. 야심은 계약의 FIRST VIEWPORT 블록과 이름 붙인 `signature interaction`에 담고, 리뷰어가 동작으로 감사한다.[](source:nw-path) | newwork-flow | ncl |
| ni | 점검 최대 2회 | 데스크톱·모바일(native는 기기 클래스별)을 한 번에 캡처하고 상태별로 확인한다. 점검은 2라운드가 상한이다. 웹에서 hook이 없으면 `impeccable detect --json`을 한 번 돌린다.[](source:nw-inspect) | newwork-flow | ni |
| nr | 마무리 리뷰어 | 대화 기록을 물려받지 않은 새 서브에이전트 `impeccable-finish-reviewer`에게 원래 요청, 스크린샷, 방향 계약 등을 넘긴다. 서브에이전트가 전혀 없는 하네스만 `degraded/finish-reviewer.md`로 대신하고, 그 사실을 한 줄로 알린다.[](source:nw-review)[](source:dg-fr) | newwork-flow | nr |
| nd | disposition? | 리뷰어는 첫 줄에 `recapture`, `rebuild`, `fix`, `ship` 중 하나만 쓴다. 에이전트는 이 단어를 그대로 보고하고 누그러뜨리지 않는다. 무인 실행은 수정 2라운드에서 끝낸다.[](source:fr-disp)[](source:nw-review) | newwork-flow | nd |
| ndoc | documenter | 새 세계는 빌드가 끝난 뒤 `impeccable-documenter`가 실제 코드에서 `DESIGN.md`와 `.impeccable/design.json`을 쓴다. 기존 `DESIGN.md`가 있으면 refresh·overwrite·merge 중 사용자 선택을 먼저 받는다. comp-led는 `build-phase finish --disposition`을 기록해야 끝난다.[](source:nw-doc)[](source:doc-agent) | newwork-flow | ndoc |

기존 세계 안에서 페이지 하나를 통째로 만들 때는 시각 시스템을 고정한다. 구조 5~7개를 뽑아 `--scope surface`로 굴리고, 3개를 카드로 보여 준다. 정확히 정해진 좁은 요청이나 로컬 확장에는 스크립트를 돌리지 않는다.[](source:nw-surface)

모든 UI 편집에는 `craft-floor.md`가 하한으로 걸린다. 사용자 브리프나 확정된 세계는 이 목록을 덮을 수 있지만, 금지(ban)로 표시된 줄은 덮지 못한다. 에이전트 자신의 습관은 덮을 수 없다.[](source:cf-verify)

@facts
| 대비 | 본문·placeholder 4.5:1 이상, 큰 글자 3:1 이상. 색 바탕 위 보조 텍스트는 회색 대신 그 색조에서 뽑는다[](source:cf-verify) |
| 타이포 | 본문 폭 65–75ch, display 최대 6rem, tracking 하한 -0.04em(-0.02~-0.03em이 대개 낫다)[](source:cf-verify)[](source:cf-refuse) |
| 모션 | 흩어진 효과 대신 연출한 순간 하나. 이미 보이는 기본 상태에서 exponential ease-out[](source:cf-verify) |
| 상태 | `hover`, `disabled`, `loading`, `error`, `empty` 상태와 실제 콘텐츠, 키보드 focus[](source:cf-verify) |
| 브라우저 표면 | 텍스트 선택, caret, 스크롤바, focus ring, 밑줄 offset, 표의 숫자를 팔레트로 맞춘다[](source:cf-verify) |
| 카드 | radius 12–16px. 테두리와 그림자 중 하나로만 높이를 표현한다. 카드 안에 카드는 언제나 틀렸다[](source:cf-refuse) |
| 금지(ban) | 제목 위 kicker·eyebrow 라벨. 어떤 브리프도 되살리지 못한다[](source:cf-refuse) |

금지로 표시되지 않은 `Refuse` 항목은 "카테고리 기본값"이다. 그라데이션 텍스트, 장식용 glass·blur, 1px 넘는 색 `border-left`, `neobrutalist` 세계가 아닌 곳의 `box-shadow: 4px 4px 0`, 아이콘 대신 이모지, 카테고리로 고른 light·dark 등이다. 브리프가 명시하면 쓸 수 있다.[](source:cf-refuse)

## 사람은 어디서 개입하고, 언제 끝나나 {#human}

이 스킬은 사람의 답이 필요한 곳을 여러 군데 막아 둔다. 질문 도구가 있으면 그것을 쓰고, 없으면 채팅으로 묻고 답을 기다린다.[](source:in-ask)

| 지점 | 에이전트가 하는 일 | 사람이 없을 때 |
| --- | --- | --- |
| `init` 인터뷰 | 한 라운드 최대 3문항. 새 `PRODUCT.md`를 쓰기 전에 실제 답이나 승인 한 라운드가 필요하다[](source:in-ask) | 첫 라운드로 한 번 찔러 본다. 오류나 시간 초과 뒤에만 추론하고, 추론한 사실마다 표시하고 첫 응답에서 알린다[](source:in-ask) |
| 새 프로젝트 스택 | 정적 HTML·특정 프레임워크·추천 중 고르게 하고 `## Stack`에 기록한다[](source:in-ask) | 원문에 명시 없음 |
| `buildPath` | 이미지 생성이 가능하면 `comp-first`와 `code-first`를 한 번 묻는다[](source:in-build) | 아무것도 기록하지 않고, 이번 세션이 어느 길로 가는지 한 줄로 말한다[](source:in-build) |
| 방향 선택 페이지 | `--wait`을 exit 3이면 반복한다[](source:nw-page) | exit 4(답 없이 닫힘)면 질문 도구로 한 번 더 묻고, 그래도 없으면 배정 방향으로 진행하며 가정을 밝힌다[](source:nw-page) |
| comp 3개 승인 | 승인 전에는 코드를 시작하지 않는다. 생략 조건이 없다[](source:vz-approve) | 질문 도구와 결정 페이지가 모두 실패한 뒤에만 위임으로 보고, 첫 응답에서 알린다[](source:vz-approve) |
| 플랜·에셋 리뷰 | 사용자가 `plate`와 코드로 그릴 영역을 확인한다[](source:cmr-serve) | `serve`가 exit 2(브라우저 없음)나 exit 4(30분 무응답)면 직접 승인하지 않고 보류 상태로 끝낸다[](source:cmr-serve) |
| hero 3회 실패 | 반복을 멈추고 첫 화면 리뷰를 사용자에게 보여 준다[](source:nw-phases) | 원문에 명시 없음 |
| 리뷰 2라운드 뒤 | 남은 항목 표를 보여 주고 출시할지 한 라운드 더 할지 고르게 한다[](source:nw-review) | 무인 실행은 2라운드에서 끝낸다[](source:nw-review) |
| 기존 `DESIGN.md` | 파일을 보여 주고 `refresh`·`overwrite`·`merge` 중 하나를 묻는다[](source:dc-when) | documenter는 선택이 없으면 아무것도 쓰지 않는다[](source:doc-agent) |
| `critique` 뒤 질문 | 보고서를 다 쓴 뒤 마지막에 찾은 문제에 묶인 질문 2~4개를 묻는다[](source:cr-ask) | `Priority Issue`가 3개 미만일 때만 `Questions skipped: <reason>`로 생략한다[](source:cr-ask) |
| Codex에서 서브에이전트 | 허락이 없으면 정해진 문장으로 한 번 묻는다[](source:cr-orch) | 거절되면 순차 실행하고 `⚠️ DEGRADED` 배너를 첫 줄에 단다[](source:cr-orch) |
| `overdrive` 방향 | 방향 2~3개와 장단점을 선택지 안에 담아 묻는다[](source:ov-ask) | 원문에 명시 없음 |
| live CSP 수정 | 정해진 문구로 diff를 보여 주고 `[y/n]`를 받는다[](source:ls-csp) | "no"면 패치하지 않고 `cspChecked: true`만 쓴다[](source:ls-csp) |
| hook 예외 | `ignore-value`까지만 스스로 쓰고 근거를 `--reason`에 남긴다. `ignore-file`·`ignore-rule`은 먼저 묻는다[](source:hk-triage) | 확신이 없으면 지적을 그대로 두고 이유를 한 줄 쓴다[](source:hk-triage) |
| `doctor`의 `route` | 필요한 명령과 메울 빈틈을 말한다. 사용자가 그 턴에 요청할 때만 돌린다[](source:dr-sev) | `auto` 항목은 묻지 않고 `doctor --fix`로 고친다[](source:dr-sev) |

끝나는 조건은 명령마다 다르다.

- [ ] `shape`: 브리프를 확인받거나 한 번 수정한 뒤 멈춘다. 코드나 방향 계약은 쓰지 않는다.[](source:sh-stop)
- [ ] `init`: 해석된 경로에 `PRODUCT.md`가 실제로 있어야 new-work나 `shape`로 넘어간다. 인터뷰 메모로 대신하지 않는다.[](source:in-gate)
- [ ] `critique`: 질문이나 `Questions skipped:` 줄 없이 끝나면 미완료다. 보고서를 `.impeccable/critique/`에만 쓰고 채팅에 안 보이면 아무것도 안 한 것이다.[](source:cr-inv)
- [ ] `polish`: 가져온 스냅샷의 `Priority Issue`를 모두 해결했을 때만 `critique-storage close`로 닫는다.[](source:po-close)
- [ ] new-work: "unreviewed and undocumented is unfinished"가 FINISH 줄이다. 리뷰, 판정, `DESIGN.md`, 래스터 출처 기록(provenance)까지 있어야 끝난다.[](source:nw-contract)
- [ ] `live`·`generate`: `accept` 뒤 `carbonize` 5단계를 마치고 `live-complete`가 `phase: "completed"`를 돌려줘야 다음으로 간다. `generate`는 helper 서버를 멈추고 dev server는 건드리지 않는다.[](source:lv-carbon)[](source:ge-close)

명령별 수치다. 의무·권고·예시를 구분했고, 원문 단어를 성격 칸에 적었다.

| 값 | 성격 | 적용 조건 |
| --- | --- | --- |
| 100–150 / 150–300 / 300–500 / 500–800 ms | 권고("Typical use") | `animate`: 즉시 피드백 / 일상 상태 변화 / 레이아웃·오버레이 / 연출한 초점 등장. 나갈 때는 들어올 때보다 빠르게[](source:an-time) |
| `cubic-bezier(0.16, 1, 0.3, 1)` | 예시("such as") | `animate`: 자신 있는 도착. `bounce`·`elastic` 곡선을 반사적으로 쓰지 않는다[](source:an-time) |
| 150–250 ms, 비율 1.125–1.2 | 권고 | Operate 화면의 전환 시간과 글자 크기 단계 비율. 산문 65–75ch, 표는 120ch 이상도 된다[](source:opm-num) |
| 0~4점 × 10 = /40 | 의무 | `critique`. `n/a` 휴리스틱이 있으면 만점을 다시 계산한다(예 24/32). 36–40 Excellent, 28–35 Good, 20–27 Acceptable, 12–19 Poor, 0–11 Critical[](source:cr-score)[](source:cr-bands) |
| 선택지 4개 이하 | 기준 | `critique` 인지 부하. 실패 0–1 낮음, 2–3 보통, 4개 이상 높음[](source:cr-cog) |
| 0~4점 × 5 = /20 | 의무 | `audit`. 18–20, 14–17, 10–13, 6–9, 0–5 구간[](source:au-score) |
| 44×44px, 24×24 CSS px | 기준 | `audit` 터치 대상. 24px은 WCAG 2.5.8 최소이고 예외가 있다[](source:au-touch) |
| 4.5:1 / 3:1 / 3:1 | 의무(WCAG AA) | `colorize`: 본문 / 큰 글자 / 컨트롤·아이콘·focus 표시[](source:co-num) |
| 1rem(16px), 45–75ch | 권고 | `typeset`: 웹 본문 하한과 산문 폭[](source:ty-num) |
| 4단위 간격 | 권고("usually") | `layout`: 8단위만 쓰면 빠지는 중간 단계를 준다[](source:la-num) |
| 채도 70–85%, 굵기 900→600·700→500, 이동 10–20px | 예시 | `quieter`의 줄이는 방향. 강조색은 10% 규칙[](source:qu-num) |
| 1–2색, 글꼴 1개, 크기 3–4개, 굵기 2–3개 | 권고 | `distill`[](source:di-num) |
| 3회 이상 | 의무 | `extract`: 같은 의도로 3회 이상 쓰인 것만 뽑는다[](source:ex-ask) |
| 번역 여유 30–40%, 모바일 본문 16px | 권고 | `harden`. 14px은 보조 텍스트만. 확대 200%로 시험한다[](source:ha-num) |
| 투어 3–7단계 | 권고 | `onboard`[](source:on-tour) |
| LCP 2.5s 미만, INP 200ms 미만, CLS 0.1 미만 | 목표 | `optimize`의 Core Web Vitals[](source:op-cwv) |
| 60fps, 50 미만이면 단순화 | 규칙 | `overdrive` 성능[](source:ov-perf) |
| 320–767 / 768–1023 / 1024px+ | 예시 | `adapt` breakpoint. 콘텐츠 기준 breakpoint도 허용한다[](source:ad-bp) |
| 44×44 pt, 본문 17pt, 하한 11pt | 의무 | iOS[](source:ios-num) |
| 48×48 dp, 간격 8 dp | 의무 | Android[](source:and-num) |
| 72% | 통과선 | comp-led hero 게이트. 빠진 영역 같은 즉시 불합격 사유가 없어야 한다[](source:nw-phases) |
| 1.5배 이상 | 의무 | plate 해상도. comp 영역 픽셀 크기 대비[](source:nw-phases) |
| 1440px, 390px, 1280–1600px | 의무 | `desktop.png`, `mobile.png` 캡처 폭과 첫 화면이 버텨야 할 데스크톱 폭[](source:nw-phases) |
| 150–300단어 | 의무("short") | comp 프롬프트 길이[](source:vz-comps) |
| 변형당 파라미터 0–4개 | 상한 | `live`. 4개가 hard cap이다[](source:lv-params) |
| 기본 3개, 최대 8개 | 의무 | `generate` 변형 개수[](source:ge-parse) |
| 600000 ms | 의무 | `live-poll` 기본 timeout. 짧은 `--timeout=`을 주지 않는다[](source:lv-contract) |
| 주 1회 | 기본값 | `context`의 staleness 점검. `"stalenessCheck": false`로 끈다[](source:dr-boot) |

## 무엇을 만들고, 무엇을 실행하나 {#artifacts}

이 스킬은 사용자 프로젝트에 여러 파일을 쓴다. `init`이 끝나면 commit할 파일을 한 번 알려 준다.[](source:in-wrap)

@tree id=project-files title="사용자 프로젝트에 생기는 것"
| root | 프로젝트 루트 | - |
| product | PRODUCT.md (init) | root | source:in-flow |
| design | DESIGN.md (document·documenter) | root | source:dc-when |
| imp | .impeccable/ | root |
| cfg | config.json (buildPath, hook, detector) | imp | source:hk-config |
| cfglocal | config.local.json (gitignore, hook 동의) | imp | source:hk-config |
| djson | design.json (sidecar) | imp | source:dc-sidecar |
| surfaces | surfaces/ (surface brief, 방향 계약) | imp | source:nw-contract |
| critique | critique/ (스냅샷, ignore.md) | imp | source:po-snap |
| live | live/ (config.json, sessions/) | imp | source:lv-contract |
| mocks | mocks/ (comp, decision/) | imp | source:vz-comps |
| build | build/ (state.json, spec.json) | imp | source:nw-phases |
| review | review/ (캡처, diff/) | imp | source:nw-inspect |
| hookcfg | 하네스 hook 설정 파일 | root | source:hk-harness |

commit 대상은 `PRODUCT.md`, `DESIGN.md`, `.impeccable/config.json`, `surfaces/`, `design.json`, `live/config.json`, `critique/ignore.md`다. 실행 중 생기는 `questions/`·`mocks/`·`review/`·스냅샷은 스스로 ignore되고, `config.local.json`은 개발자 기기에만 남는다.[](source:in-wrap)

**실행 파일.** `scripts/impeccable`(sh)과 `scripts/impeccable.cmd`(Windows)는 엔진 바이너리를 찾아 실행하는 launcher다. Node 같은 런타임은 필요 없다.[](source:sm-setup)[](source:sc-head) 코드를 읽어 확인했고 실행하지 않았다.

| 순서 | launcher가 하는 일 |
| --- | --- |
| 1 | `IMPECCABLE_BIN`이 있으면 확인 없이 그 파일을 실행한다[](source:sc-order) |
| 2 | 옆 폴더 `bin/<os>-<arch>/impeccable`이 `VERSION`(현재 `0.1.18`)과 같은 버전을 보고하면 실행한다. 이 폴더는 gitignore 대상이라 저장소에는 없다[](source:sc-order)[](source:sc-ver)[](source:sc-head) |
| 3 | `~/.impeccable/bin/impeccable`, 버전 고정 캐시 `~/.impeccable/bin/<version>/`, PATH의 `impeccable` 순으로 찾는다. 캐시는 sha256을 확인하고, 홈·PATH 후보는 `engine-probe` 응답을 확인한다[](source:sc-order) |
| 4 | 다 없으면 `https://github.com/pbakaus/impeccable/releases/download/engine-v<version>/<asset>`에서 curl이나 wget으로 내려받는다[](source:sc-dl) |
| 5 | 받은 파일의 sha256을 `engine-checksums.txt`와 비교한다. 해시가 없거나, 해시 도구가 없거나, 다르면 실행하지 않고 exit 127로 끝낸다[](source:sc-dl)[](source:sc-ck) |

launcher 자체는 hook 설정 파일을 쓰지 않는다. 엔진을 찾아 실행하거나 내려받는 일만 한다.[](source:sc-order)[](source:sc-dl) hook 설정은 엔진의 `hooks on` 명령이 쓴다. 또 `config.local.json`에 `hook.consent`가 `"accepted"`이고 hook이 켜져 있으면, `context`가 빠지거나 낡은 hook 항목을 자동으로 복구한다.[](source:hk-harness)

| 하네스 | hook 위치 |
| --- | --- |
| Claude Code | 프로젝트 `.claude/settings.local.json`, 사용자 범위 `$CLAUDE_CONFIG_DIR/settings.json`(기본 `~/.claude/settings.json`) |
| Codex | `.codex/hooks.json`. 처음에 `/hooks`로 승인한다 |
| Cursor | `.cursor/hooks.json`, `postToolUse` |
| GitHub Copilot | `.github/hooks/impeccable.json`. 기본 branch에 commit해야 동작한다 |
| Grok Build | `.grok/hooks/impeccable.json`. `/hooks-trust`가 필요하다 |
| Gemini | `.gemini/settings.json`. 편집별 detector hook은 없다 |
| Hermes Agent | `~/.hermes/plugins/`의 plugin을 사용자가 직접 켠다 |

출처는 `hooks.md`의 하네스 목록과 제약이다.[](source:hk-harness)[](source:hk-trust)

@callout level=warning title="hook은 샌드박스가 아니다"
hook은 UI 파일을 편집할 때마다 엔진을 실행한다. 원문은 이 엔진이 에이전트의 환경과 네트워크 권한을 그대로 갖고 샌드박스 없이 돈다고 말하라고 하고, 절대 "sandboxed"라고 부르지 말라고 한다.[](source:hk-trust) hook은 편집을 막지 않고 편집 뒤에 알림만 넣는다. 예전 Cursor `preToolUse` 설정만 쓰기를 막을 수 있다.[](source:hk-trust) 편집별 hook은 즉시 고칠 기계적 문제만 알리고, 나머지는 `Stop` 시점의 일괄 검사로 한 번 모아 알린다.[](source:hk-head)

## 비슷한 스킬과 무엇이 다른가 {#siblings}

이 스킬은 묶음 `site-design-choice`의 선택지 하나다. 이 묶음은 작성자가 다른 대안을 비교하며, 스킬 사이에 직접 호출이 없다. 전체 비교는 `design/_group-site-design-choice/site-design-choice.html`에 있다. 관계는 `design/relations.md`의 rel-id로 확인한다.

| 상대 스킬 | rel-id·종류 | 공통점 | 다른 점 |
| --- | --- | --- | --- |
| `landing-page-design`(elayadesign) | r41 같은 계열(추론) | 랜딩 페이지·웹 UI를 만들고 리뷰한다 | 상대는 질문·섹션·카피·SEO와 고정 시각 규칙으로 전환율을 노린다.[](source:lp-fm) `impeccable`은 명령별 절차와 방문자 모드로 나눈다[](source:sm-cmds)[](source:sm-modes) |
| `design-taste-frontend`(taste) | r42 같은 계열(추론) | 회사·제품 웹 UI의 "AI 티"를 없애는 것을 목표로 든다 | 상대는 실제 브라우저 검사기로 규칙을 확인한다.[](source:tf-fm) `impeccable`은 detector와 편집별 hook을 쓴다[](source:hk-head) |
| `web-design-engineer`(garden-skills) | r43 같은 계열(추론) | 페이지·대시보드·UI를 만들고 디자인을 비평한다 | 상대는 슬라이드·데이터 시각화까지 HTML 산출물로 다룬다.[](source:wde-fm) `impeccable`은 native iOS·Android 화면도 대상으로 든다[](source:sm-fm) |
| `animate`(emilkowalski) | r46 같은 계열(추론) | UI에 목적 있는 모션을 더한다 | 이름만 같다. `impeccable`의 `animate`는 하위 명령(`reference/animate.md`)이고 emilkowalski의 `animate` 스킬을 부르지 않는다[](source:sm-anim)[](source:em-anim) |

판정: 네 관계 모두 원문 사이의 직접 호출이나 파일 주고받기는 없다. 같은 요청에 여러 스킬이 함께 켜질 수 있으므로, 사용자가 하나를 골라 쓰는 편이 규칙 충돌을 줄인다. 근거는 네 스킬의 `description`이 모두 랜딩 페이지·웹 UI 만들기를 넓게 포함한다는 점이다.[](source:sm-fm)[](source:lp-fm)[](source:tf-fm)[](source:wde-fm)

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 57개, 합계 537,328B다. `SKILL.md`, `reference/` 원본 45개, `agents/` 5개, launcher 2개와 `engine-checksums.txt`, `VERSION`, `command-metadata.json`, `data/font-index-failures.json`이다. 파일별 목록과 바이트는 같은 폴더 `files.md`에 있다.
- 구조·표본만 확인한 파일(전부 읽지 않음)은 6개, 1,721,055B다. `scripts/live-browser.js`(563,208B, live overlay UI 번들), `live-browser-dom.js`·`live-browser-ignores.js`·`live-browser-session.js`(머리 주석과 함수 목록), `modern-screenshot.umd.js`(압축된 외부 라이브러리), `data/font-index.json`(키 구조와 첫 항목, 3,076개 항목)이다.
- 제외한 파일: 번역본 46개(556,048B, 그중 `.ko.stale.md` 9개)는 열지 않았다. 바이너리 파일은 이 폴더에 없다.
- 엔진 바이너리는 저장소에 없다. `context`, `detect`, `concept-seed`, `build-phase`, `comp-diff` 같은 명령의 실제 동작은 확인하지 못했고, 참조 파일이 적은 지시상 동작으로만 서술했다.
- 비교 패널을 위해 다른 스킬 4개의 `description` 줄만 읽었다. 이 파일들은 위 개수에 넣지 않았다.
- 원문 대조 범위: 활성화 제한(호출 제한 필드 없음, `description`의 제외 조건), Routing 4갈래, 사람 개입 지점 15개, 종료 조건 6개, 수치 표 28행, 금지 항목 7행을 원문 줄과 대조했다. 관계 행 r41~r43, r46은 원장과 원문 줄을 다시 대조했고 같다. `delight`·`clarify`·`onboard`·`harden`·`optimize`의 일반 체크리스트 수치는 일부만 옮겼다.
- 이번 최신화(commit `4e3fc89`)에서 바뀐 것: 버전 4.7.1→4.8.0, 엔진 0.1.17→0.1.18. `engine-checksums.txt`가 새로 생겼고, 두 launcher가 내려받은 엔진을 이 로컬 파일의 해시로 확인하게 바뀌었다. `hooks.md`는 `CLAUDE_CONFIG_DIR` 사용자 범위 설치, 실제 설정 연결을 보여 주는 `status`, 로컬 동의가 있을 때 `context`의 자동 복구, "never call it sandboxed" 문구를 더했다. `new-work.md`·documenter는 기존 `DESIGN.md`가 있으면 `refresh`·`overwrite`·`merge` 선택을 먼저 받게 했다. `init.md`는 commit할 파일 안내를, `live.md`·manual-edit-applier는 요소 삭제(Remove badge) 처리를 더했다. 번역본 9개가 `.ko.stale.md`로 바뀌었다.
- 분석 중 바뀐 파일: 추적 파일은 commit `4e3fc89` 그대로다. 분석 도중 같은 폴더에 commit되지 않은 새 번역본 `*.ko.md` 9개(`SKILL.ko.md`, `hooks.ko.md` 등)가 생겼다. 이 분석이 만든 파일이 아니고, 열지 않았다.

@callout level=open-question title="원문끼리 맞지 않거나 확인하지 못한 곳"
- `critique.md`는 프로젝트 전용 페르소나를 만들 때 `AGENTS.md`의 `## Design Context` 섹션("generated by `impeccable init`")을 읽으라고 한다.[](source:cr-agents) 지금 `init.md`는 `PRODUCT.md`를 쓰고 `AGENTS.md`는 언급하지 않는다.[](source:in-flow) 우선순위가 적혀 있지 않아 어느 쪽이 맞는지 정하지 않았다.
- `critique`와 `audit`의 추천 명령 목록에는 `live`, `generate`, `extract`, `init`이 없다. 의도된 제외인지는 `원문에 명시 없음`이다.[](source:cr-score)[](source:au-score)
- `hooks.md`는 hook이 엔진을 샌드박스 없이 돌린다고 적는다. 엔진이 실제로 어떤 파일과 네트워크에 접근하는지는 바이너리가 없어 확인하지 않았다.[](source:hk-trust)
- 판정이 아니라 사실 질문: 이 스킬이 실제로 결과 디자인의 품질을 얼마나 바꾸는지는 실행해 보지 않아 확인하지 못했다.
