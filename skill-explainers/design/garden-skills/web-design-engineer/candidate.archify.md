# web-design-engineer 스킬은 에이전트를 어떻게 바꾸나 {#web-design-engineer-skill}

`web-design-engineer`를 쓰면 에이전트는 HTML 결과물을 바로 코딩하지 않는다. 먼저 디자인 시스템을 글로 선언하고 사용자 승인을 기다린다. 그다음 자리표시만 채운 v0 초안을 보여 주고, 다시 확인을 받은 뒤에 완성본을 만든다.[](source:wd-s3)[](source:wd-cp1)[](source:wd-v0)[](source:wd-cp2)

- 켜지는 때: 페이지, 대시보드, 프로토타입, 슬라이드, 애니메이션, UI 목업, 데이터 시각화 같은 브라우저 결과물을 만들거나 다시 디자인할 때다. 호출 제한은 없고 `allow_implicit_invocation: true`다.[](source:wd-fm)[](source:oy)
- 모드 전환: 요청이 정말 모호하고 디자인 문맥도 없으면, 에이전트는 질문을 늘어놓지 않는다. Design Direction Advisor로 바꿔 서로 다른 학파에서 방향 3개를 제안한다.[](source:wd-adv-when)[](source:wd-adv-mech)
- 강제하는 것: 사실 확인(Step 0), 사람 확인 3곳, 진짜 로고와 제품 이미지, 가짜 데이터 금지다. 브라우저 검수는 사용자가 명시적으로 요청할 때만 돌린다.[](source:wd-s0)[](source:wd-brand)[](source:wd-ph)[](source:wd-s6)
- 쓰면 안 되는 때: 백엔드 API, CLI, 데이터 처리 스크립트, 순수 로직이다. 소재를 장문 기사로 바꾸는 일과 원고 박자로 녹화용 웹 영상 발표를 만드는 일은 전용 스킬로 넘긴다.[](source:wd-scope)

@answer scope="design/garden-skills/web-design-engineer v1.3.0 · 원본 텍스트 38개 208,026B · 커밋 4e3fc89 · 지시상 동작 · 실행 안 함"
@meta locale=ko
@source wd-fm title="design/garden-skills/web-design-engineer/SKILL.md · 35406B · frontmatter" path=design/garden-skills/web-design-engineer/SKILL.md lines=1:4
@source wd-role title="SKILL.md · 역할과 핵심 철학" path=design/garden-skills/web-design-engineer/SKILL.md lines=8:10
@source wd-scope title="SKILL.md · Scope(적용·비적용)" path=design/garden-skills/web-design-engineer/SKILL.md lines=14:18
@source wd-s0 title="SKILL.md · Step 0 사실 확인" path=design/garden-skills/web-design-engineer/SKILL.md lines=24:37
@source wd-ask title="SKILL.md · Step 1 질문 여부 표" path=design/garden-skills/web-design-engineer/SKILL.md lines=39:59
@source wd-s2 title="SKILL.md · Step 2 디자인 문맥 우선순위" path=design/garden-skills/web-design-engineer/SKILL.md lines=61:73
@source wd-brand title="SKILL.md · 브랜드 자산 규약" path=design/garden-skills/web-design-engineer/SKILL.md lines=75:94
@source wd-ext title="SKILL.md · 기존 UI에 추가할 때" path=design/garden-skills/web-design-engineer/SKILL.md lines=96:98
@source wd-read title="SKILL.md · Step 2b Design Read와 다이얼 5개" path=design/garden-skills/web-design-engineer/SKILL.md lines=100:117
@source wd-s3a title="SKILL.md · Step 3a 위치 질문 4개" path=design/garden-skills/web-design-engineer/SKILL.md lines=119:128
@source wd-s3 title="SKILL.md · Step 3 디자인 시스템 선언" path=design/garden-skills/web-design-engineer/SKILL.md lines=130:146
@source wd-cp1 title="SKILL.md · Checkpoint 1" path=design/garden-skills/web-design-engineer/SKILL.md lines=148:148
@source wd-v0 title="SKILL.md · Step 4 v0 초안" path=design/garden-skills/web-design-engineer/SKILL.md lines=150:158
@source wd-cp2 title="SKILL.md · Checkpoint 2" path=design/garden-skills/web-design-engineer/SKILL.md lines=160:160
@source wd-s5 title="SKILL.md · Step 5와 Checkpoint 3" path=design/garden-skills/web-design-engineer/SKILL.md lines=162:166
@source wd-s6 title="SKILL.md · Step 6 검증" path=design/garden-skills/web-design-engineer/SKILL.md lines=168:172
@source wd-s7 title="SKILL.md · Step 7 비평" path=design/garden-skills/web-design-engineer/SKILL.md lines=174:186
@source wd-adv-when title="SKILL.md · Design Direction Advisor 켜고 건너뛰는 조건" path=design/garden-skills/web-design-engineer/SKILL.md lines=190:200
@source wd-adv-mech title="SKILL.md · 방향 3개 제안 방식" path=design/garden-skills/web-design-engineer/SKILL.md lines=202:209
@source wd-adv-school title="SKILL.md · 학파 표와 같은 행 금지" path=design/garden-skills/web-design-engineer/SKILL.md lines=211:222
@source wd-adv-after title="SKILL.md · 사용자가 고른 뒤" path=design/garden-skills/web-design-engineer/SKILL.md lines=224:230
@source wd-react title="SKILL.md · React + Babel 규칙 3개" path=design/garden-skills/web-design-engineer/SKILL.md lines=236:246
@source wd-css title="SKILL.md · CSS 규칙" path=design/garden-skills/web-design-engineer/SKILL.md lines=248:256
@source wd-files title="SKILL.md · 파일 관리" path=design/garden-skills/web-design-engineer/SKILL.md lines=258:267
@source wd-cliche title="SKILL.md · AI 티 나는 패턴 표" path=design/garden-skills/web-design-engineer/SKILL.md lines=273:294
@source wd-emoji title="SKILL.md · emoji 규칙" path=design/garden-skills/web-design-engineer/SKILL.md lines=296:303
@source wd-ph title="SKILL.md · 자리표시 원칙" path=design/garden-skills/web-design-engineer/SKILL.md lines=307:317
@source wd-stun title="SKILL.md · Aim to Stun" path=design/garden-skills/web-design-engineer/SKILL.md lines=319:328
@source wd-scale title="SKILL.md · 최소 크기 표" path=design/garden-skills/web-design-engineer/SKILL.md lines=330:337
@source wd-content title="SKILL.md · 콘텐츠 원칙" path=design/garden-skills/web-design-engineer/SKILL.md lines=339:345
@source wd-proto title="SKILL.md · 인터랙티브 프로토타입" path=design/garden-skills/web-design-engineer/SKILL.md lines=351:357
@source wd-slides title="SKILL.md · HTML 슬라이드" path=design/garden-skills/web-design-engineer/SKILL.md lines=359:367
@source wd-dash title="SKILL.md · 데이터 시각화 대시보드" path=design/garden-skills/web-design-engineer/SKILL.md lines=369:375
@source wd-anim title="SKILL.md · 애니메이션 도구 순서" path=design/garden-skills/web-design-engineer/SKILL.md lines=377:386
@source wd-variants title="SKILL.md · 변형 탐색" path=design/garden-skills/web-design-engineer/SKILL.md lines=395:406
@source wd-tweaks title="SKILL.md · Tweaks 패널" path=design/garden-skills/web-design-engineer/SKILL.md lines=410:419
@source wd-cdn title="SKILL.md · CDN 사용 조건" path=design/garden-skills/web-design-engineer/SKILL.md lines=423:438
@source wd-check title="SKILL.md · 납품 전 체크리스트" path=design/garden-skills/web-design-engineer/SKILL.md lines=442:462
@source wd-collab title="SKILL.md · 사용자와 협업" path=design/garden-skills/web-design-engineer/SKILL.md lines=466:473
@source wd-route title="SKILL.md · 참조 파일 라우팅" path=design/garden-skills/web-design-engineer/SKILL.md lines=477:492
@source oy title="design/garden-skills/web-design-engineer/agents/openai.yaml · 288B · 호스트 메타데이터" path=design/garden-skills/web-design-engineer/agents/openai.yaml lines=1:7
@source mf title="design/garden-skills/web-design-engineer/manifest.json · 609B · 버전과 호환 호스트" path=design/garden-skills/web-design-engineer/manifest.json lines=1:15
@source rd-auto title="design/garden-skills/web-design-engineer/README.md · 28270B · 자동 선택 안내" path=design/garden-skills/web-design-engineer/README.md lines=66:66
@source rd-bg title="README.md · 배경(Claude Design 시스템 프롬프트)" path=design/garden-skills/web-design-engineer/README.md lines=454:458
@source dc-read title="design/garden-skills/web-design-engineer/references/design-calibration.md · 6139B · Design Read" path=design/garden-skills/web-design-engineer/references/design-calibration.md lines=14:24
@source dc-dials title="design-calibration.md · 다이얼 5개 구간" path=design/garden-skills/web-design-engineer/references/design-calibration.md lines=26:86
@source dc-preset title="design-calibration.md · 프리셋 표" path=design/garden-skills/web-design-engineer/references/design-calibration.md lines=88:102
@source dc-conf title="design-calibration.md · 충돌 해결" path=design/garden-skills/web-design-engineer/references/design-calibration.md lines=104:111
@source dc-img title="design-calibration.md · image-first 분기" path=design/garden-skills/web-design-engineer/references/design-calibration.md lines=113:131
@source dc-gpt title="design-calibration.md · gpt-image-2 언급" path=design/garden-skills/web-design-engineer/references/design-calibration.md lines=132:132
@source dc-done title="design-calibration.md · 완료 시험" path=design/garden-skills/web-design-engineer/references/design-calibration.md lines=134:136
@source rp-mode title="design/garden-skills/web-design-engineer/references/redesign-protocol.md · 4181B · 모드 분류" path=design/garden-skills/web-design-engineer/references/redesign-protocol.md lines=15:29
@source rp-protect title="redesign-protocol.md · 보호 계약" path=design/garden-skills/web-design-engineer/references/redesign-protocol.md lines=68:81
@source rp-order title="redesign-protocol.md · 현대화 순서" path=design/garden-skills/web-design-engineer/references/redesign-protocol.md lines=83:96
@source rp-dial title="redesign-protocol.md · 모드별 다이얼" path=design/garden-skills/web-design-engineer/references/redesign-protocol.md lines=98:102
@source rp-plan title="redesign-protocol.md · 전후 계획" path=design/garden-skills/web-design-engineer/references/redesign-protocol.md lines=104:119
@source ba-gate title="design/garden-skills/web-design-engineer/references/browser-acceptance.md · 4643B · 실행 조건" path=design/garden-skills/web-design-engineer/references/browser-acceptance.md lines=13:19
@source ba-vp title="browser-acceptance.md · 기본 뷰포트" path=design/garden-skills/web-design-engineer/references/browser-acceptance.md lines=21:43
@source ba-start title="browser-acceptance.md · 안전하게 시작" path=design/garden-skills/web-design-engineer/references/browser-acceptance.md lines=45:51
@source ba-repair title="browser-acceptance.md · 수리 반복과 보고" path=design/garden-skills/web-design-engineer/references/browser-acceptance.md lines=100:127
@source cg-rubric title="design/garden-skills/web-design-engineer/references/critique-guide.md · 10446B · 차원별 기준" path=design/garden-skills/web-design-engineer/references/critique-guide.md lines=28:63
@source cg-top title="critique-guide.md · 흔한 문제 10개" path=design/garden-skills/web-design-engineer/references/critique-guide.md lines=128:175
@source cg-tpl title="critique-guide.md · 출력 틀" path=design/garden-skills/web-design-engineer/references/critique-guide.md lines=179:210
@source cg-anti title="critique-guide.md · 비평 반패턴" path=design/garden-skills/web-design-engineer/references/critique-guide.md lines=214:226
@source fp-head title="design/garden-skills/web-design-engineer/references/failure-patterns.md · 7119B · 사용법" path=design/garden-skills/web-design-engineer/references/failure-patterns.md lines=1:3
@source fp-final title="failure-patterns.md · 최종 사용" path=design/garden-skills/web-design-engineer/references/failure-patterns.md lines=157:159
@source dd-pick title="design/garden-skills/web-design-engineer/references/design-directions.md · 14105B · 고른 뒤 대응" path=design/garden-skills/web-design-engineer/references/design-directions.md lines=147:154
@source dd-anti title="design-directions.md · 방향 제안 반패턴" path=design/garden-skills/web-design-engineer/references/design-directions.md lines=178:188
@source bl title="design/garden-skills/web-design-engineer/references/block-library.md · 1767B · 블록 색인과 재사용 계약" path=design/garden-skills/web-design-engineer/references/block-library.md lines=5:23
@source ap-toc title="design/garden-skills/web-design-engineer/references/advanced-patterns.md · 14722B · 목차" path=design/garden-skills/web-design-engineer/references/advanced-patterns.md lines=5:13
@source ap-iphone title="advanced-patterns.md · iPhone 프레임 상태 표시줄" path=design/garden-skills/web-design-engineer/references/advanced-patterns.md lines=150:150
@source ap-dark title="advanced-patterns.md · 다크 모드 템플릿 primary" path=design/garden-skills/web-design-engineer/references/advanced-patterns.md lines=385:399
@source ap-font title="advanced-patterns.md · 글꼴 추천 머리말" path=design/garden-skills/web-design-engineer/references/advanced-patterns.md lines=481:484
@source ap-pair title="advanced-patterns.md · 색·글꼴 조합 표" path=design/garden-skills/web-design-engineer/references/advanced-patterns.md lines=504:521
@source ix-when title="design/garden-skills/web-design-engineer/references/style-recipes/INDEX.md · 12177B · 레시피 읽는 조건" path=design/garden-skills/web-design-engineer/references/style-recipes/INDEX.md lines=24:37
@source ix-anti title="INDEX.md · 레시피 공통 금지" path=design/garden-skills/web-design-engineer/references/style-recipes/INDEX.md lines=98:132
@source ix-none title="INDEX.md · 맞는 레시피가 없을 때" path=design/garden-skills/web-design-engineer/references/style-recipes/INDEX.md lines=136:145
@source rc-linear title="design/garden-skills/web-design-engineer/references/style-recipes/linear.md · 3174B · 글꼴" path=design/garden-skills/web-design-engineer/references/style-recipes/linear.md lines=20:24
@source ms-route title="design/garden-skills/motion-showreel/SKILL.md · r31 확인용" path=design/garden-skills/motion-showreel/SKILL.md lines=29:30
@source ba-route title="design/garden-skills/beautiful-article/README.md · r34 확인용" path=design/garden-skills/beautiful-article/README.md lines=420:421
@source ba-desc title="design/garden-skills/beautiful-article/SKILL.md · r32 확인용 description" path=design/garden-skills/beautiful-article/SKILL.md lines=3:3
@source wvp-desc title="design/garden-skills/web-video-presentation/SKILL.md · r33 확인용 description" path=design/garden-skills/web-video-presentation/SKILL.md lines=3:3
@source lp-desc title="design/elayadesign/landing-page-design/SKILL.md · r45 확인용 description" path=design/elayadesign/landing-page-design/SKILL.md lines=3:3
@source im-desc title="design/impeccable/impeccable/SKILL.md · r43 확인용 description" path=design/impeccable/impeccable/SKILL.md lines=3:3

## 언제 켜지고, 언제 쓰면 안 되나 {#trigger}

@code source=wd-fm language=yaml

@code source=oy language=yaml

`SKILL.md`에는 호출 제한 필드가 없다. `agents/openai.yaml`은 `allow_implicit_invocation: true`라서 모델이 `description`을 참고해 스스로 켤 수 있다.[](source:wd-fm)[](source:oy)

README도 시각·인터랙티브 프론트엔드 작업이면 에이전트가 자동으로 고른다고 적는다.[](source:rd-auto) 판정: `description`은 판단용 설명이다. 특정 단어가 있다고 켜지는 목록으로 읽으면 안 된다.

| 구분 | 원문이 든 것 |
| --- | --- |
| 적용 | 시각 프론트엔드 결과물과 리디자인: 페이지, 대시보드, 프로토타입, 슬라이드, 시각화, 애니메이션, UI 목업, 디자인 시스템. 디자인 비평과 명시적 브라우저 검수도 든다[](source:wd-fm)[](source:wd-scope) |
| 비적용 | 백엔드 API, CLI 도구, 데이터 처리 스크립트, 순수 로직 개발 {bad:쓰지 않음}[](source:wd-scope) |
| 비적용, 넘김 | 소재를 장문 HTML 기사로 바꾸기, 원고 박자를 녹화용 웹 영상 발표로 만들기. 원문은 "전용 스킬이 있으면 그쪽으로" 보내라고만 하고 이름은 부르지 않는다 {caution:전용 스킬로}[](source:wd-scope) |

에이전트가 맡는 역할은 결과물마다 바뀐다. UX 디자이너, 모션 디자이너, 슬라이드 디자이너, 프로토타입 엔지니어, 데이터 시각화 전문가다. 출력 매체는 언제나 HTML이다. 원문은 기준을 "작동하는 것"보다 높은 "stunning"에 둔다.[](source:wd-role)

## 어떤 순서로 일하고, 사람은 어디서 멈추나 {#flow}

@workflow id=wde-flow title="web-design-engineer 작업 순서"
| lane prep | 준비 |
| lane design | 설계 |
| lane build | 제작 |
| lane check | 확인 |
| f-s0 | 0 사실 확인 | backend | prep |
| f-s1 | 1 요구 파악 | backend | prep |
| f-vague | 정말 모호한가? | backend | prep |
| f-adv | 방향 3개 제안 | external | prep |
| f-s2 | 2 디자인 문맥 수집 | backend | design |
| f-s2b | 2b Design Read | backend | design |
| f-s3 | 3a·3 시스템 선언 | backend | design |
| f-cp1 | 확인 1 시스템 승인 | external | design |
| f-v0 | 4 v0 초안 | backend | build |
| f-cp2 | 확인 2 v0 검토 | external | build |
| f-s5 | 5 전체 제작 | backend | build |
| f-s6 | 6 검증 | backend | check |
| f-s7 | 7 비평 | backend | check |
| f-s0 > f-s1 | |
| f-s1 > f-vague | |
| f-vague > f-adv | 예 |
| f-vague > f-s2 | 아니오 |
| f-adv > f-s2 | 고른 방향 |
| f-s2 > f-s2b | |
| f-s2b > f-s3 | |
| f-s3 > f-cp1 | |
| f-cp1 > f-v0 | 승인 | emphasis |
| f-v0 > f-cp2 | |
| f-cp2 > f-s5 | 승인 | emphasis |
| f-s5 > f-s6 | |
| f-s6 > f-s7 | 요청·자체 점검 |

@steps id=wde-steps
| f-s0 | 0 사실 확인 | 질문보다 먼저 한다. 요청에 잘 모르는 제품, SDK, 라이브러리가 나오거나, 출시 일정·버전·사양처럼 시간에 따라 바뀌는 정보가 있으면 권위 있는 출처로 확인한다. "I think it's…" 같은 생각이 들 때와 특정 회사·제품용 자료를 만들 때도 확인한다. 검색 결과가 없거나 모호하면 추측하지 않고 사용자에게 묻는다.[](source:wd-s0) | wde-flow | f-s0 |
| f-s1 | 1 요구 파악 | 질문할지는 주어진 정보 양으로 정한다. 정보가 충분하면 바로 만든다. 무엇을 물을지는 제품 맥락, 결과물 종류, 변형 차원, 제약 중에서 고른다. 개수는 정해져 있지 않다.[](source:wd-ask) | wde-flow | f-s1 |
| f-vague | 정말 모호한가? | "make something nice"처럼 모호하고 디자인 문맥이 없으면 예다. 일반적인 취향 질문 10개를 던지지 않는다.[](source:wd-ask)[](source:wd-adv-when) | wde-flow | f-vague |
| f-adv | 방향 3개 제안 | Design Direction Advisor다. 사용자가 하나를 고르거나 두 개를 섞으면, 그 방향이 2단계의 디자인 문맥이 된다. `brand-spec.md` 같은 프로젝트 노트에 적는다.[](source:wd-adv-after) | wde-flow | f-adv |
| f-s2 | 2 디자인 문맥 수집 | 우선순위: 사용자가 준 자료(스크린샷, Figma, 코드베이스, UI Kit, 디자인 시스템) → 기존 제품 페이지 → 업계 모범 사례 → 사용자가 지목한 anchor의 레시피 파일 하나 → 처음부터. 처음부터면 "참고 자료가 없으면 최종 품질에 영향이 있다"고 분명히 말한다. 코드와 스크린샷이 둘 다 있으면 코드에서 토큰을 뽑는다.[](source:wd-s2) | wde-flow | f-s2 |
| f-s2b | 2b Design Read | 브리프를 한 블록으로 요약한다. 결과물, 대상, 시각 언어, 모드와 다이얼 5개(1~10)를 적는다. 다이얼은 장식 점수로 쓰지 않는다. 레이아웃, 모션, 화면당 정보량, 실제 자산 노력, 보존 강도를 바꿔야 한다.[](source:wd-read) | wde-flow | f-s2b |
| f-s3 | 3a·3 시스템 선언 | 먼저 서사 역할, 보는 거리, 시각 온도, 수용량 점검의 4가지 위치 질문에 답한다.[](source:wd-s3a) 그다음 코드 첫 줄 전에 Markdown으로 Design Read, anchor·레시피, 색, 글꼴, 간격, 모서리, 그림자, 모션을 선언한다. 레시피를 골랐으면 그 값을 그대로 붙이고, 레시피 파일은 하나만 읽는다.[](source:wd-s3) | wde-flow | f-s3 |
| f-cp1 | 확인 1 시스템 승인 | 에이전트는 "이 시스템으로 v0를 시작하겠다"고 말하고 멈춘다. 말만 하고 바로 코딩을 시작하지 않고, 실제로 기다린다.[](source:wd-cp1) | wde-flow | f-cp1 |
| f-v0 | 4 v0 초안 | 핵심 구조, 색·글꼴 토큰, `[image]`·`[icon]` 같은 표시가 붙은 주요 모듈 자리표시, 디자인 가정 목록을 넣는다. 콘텐츠 세부, 전체 컴포넌트, 모든 상태, 모션은 넣지 않는다.[](source:wd-v0) | wde-flow | f-v0 |
| f-cp2 | 확인 2 v0 검토 | v0를 사용자에게 보여 준 뒤에 계속한다. 방향을 일찍 고치게 하는 것이 v0의 목적이다.[](source:wd-cp2) | wde-flow | f-cp2 |
| f-s5 | 5 전체 제작 | v0가 승인되면 컴포넌트, 상태, 모션을 만든다. 상호작용 방식, 콘텐츠 변형, 레이아웃 근본 변경 같은 사소하지 않은 결정을 만나면 다시 멈추고 확인한다(Checkpoint 3).[](source:wd-s5) | wde-flow | f-s5 |
| f-s6 | 6 검증 | 납품 전 체크리스트는 항상 한다. 브라우저를 띄우는 검수는 사용자가 명시적으로 요청할 때만 한다.[](source:wd-s6)[](source:wd-check) | wde-flow | f-s6 |
| f-s7 | 7 비평 | "review this", "is it good?", "score this", "好不好看" 같은 요청이나 완료 선언 전 자체 점검일 때 5개 차원으로 비평한다.[](source:wd-s7) | wde-flow | f-s7 |

사람이 멈춰 세우는 지점은 셋이다. 원문은 "기다리겠다"고 말했으면 실제로 기다리라고 협업 절에서 한 번 더 적는다.[](source:wd-collab)

| 지점 | 언제 | 에이전트가 하는 일 | 사람의 몫 |
| --- | --- | --- | --- |
| Checkpoint 1 | Step 3a와 3을 끝낸 직후 | 디자인 시스템을 보여 주고 멈춘다[](source:wd-cp1) | {caution:시스템 승인} |
| Checkpoint 2 | v0를 만든 직후 | v0를 보여 주고 더 만들지 않는다[](source:wd-cp2) | {caution:방향 확인} |
| Checkpoint 3 | 제작 중 사소하지 않은 결정 | 멈추고 다시 확인한다. 조용히 밀어붙이지 않는다[](source:wd-s5) | {caution:결정} |

이 밖에도 사용자에게 묻는 경우가 있다. 로고를 실제로 찾아봤는데도 구하지 못했을 때, 데이터가 없을 때, 섹션·페이지를 더 넣어야 할 것 같을 때, 피드백이 모호할 때다.[](source:wd-brand)[](source:wd-ph)[](source:wd-content)[](source:wd-collab)

## 어떤 조건에서 어떤 모드로 바뀌나 {#modes}

Step 1에서 질문할지 말지는 원문 표가 정한다.[](source:wd-ask)

| 요청 예(원문) | 판단 |
| --- | --- |
| "Make a deck"(PRD도 청중도 없음) | 많이 묻는다: 청중, 길이, 톤, 변형 |
| "Use this PRD to make a 10-min deck for Eng All Hands" | 묻지 않고 바로 만든다 |
| "Turn this screenshot into an interactive prototype" | 의도한 상호작용이 불분명할 때만 묻는다 |
| "Make 6 slides about the history of butter" | 너무 모호하다. 최소한 톤과 청중은 묻는다 |
| "Design onboarding for my food-delivery app" | 많이 묻는다: 사용자, 흐름, 브랜드, 변형 |
| "Recreate the composer UI from this codebase" | 묻지 않고 코드를 직접 읽는다 |
| "Make me something nice / I don't know what style I want" | {caution:Design Direction Advisor로 전환} |

**Design Direction Advisor**는 모호한 요청용 대체 모드다. 켜는 조건과 건너뛰는 조건이 따로 있다.[](source:wd-adv-when)

| 켜는 조건(하나라도) | 건너뛰는 조건 |
| --- | --- |
| 요청이 정말 모호하다("make something nice", "I don't know what style I want", "give me some directions") | 사용자가 Figma, 스크린샷, 브랜드 참고를 이미 줬다 → 기본 흐름 |
| 디자인 문맥이 없고, 사용자가 참고 자료를 줄 수 없거나 주지 않는다 | 구체적인 방향을 말했다("make an Apple-Silicon-style launch animation") → 기본 흐름 |
| "recommend a style", "give me a few directions", "pick a vibe"처럼 명시적으로 요청한다 | 작은 수정이나 명시적 도구 호출("convert this HTML to PDF") → 건너뜀 |

이 모드에서 에이전트는 서로 다른 학파 3개에서 방향을 하나씩 제안한다. 방향마다 이름 있는 디자이너·스튜디오, 이 맥락에 맞는 이유 2~3줄, 색·글꼴·레이아웃·모션의 시각 단서 3~4개를 붙인다. 대표작 하나는 선택이다.[](source:wd-adv-mech) 같은 행(학파)에서 3개를 고르는 것은 금지다.[](source:wd-adv-school)

| 학파 | 대표 anchor | 맞는 곳 |
| --- | --- | --- |
| Information architecture | Pentagram, Edward Tufte, Massimo Vignelli, Bloomberg Terminal | 안전·전문·B2B·데이터 제품 |
| Editorial / minimalist | Kenya Hara(MUJI), Apple HIG, Dieter Rams, Aesop | 프리미엄·고급·조용함 |
| Modern tool / Builder SaaS | Linear, Vercel, Raycast, Notion | 개발자 도구, B2B SaaS, AI 도구, 인프라 |
| Motion / experimental | Field.io, Active Theory, Resn | 독특함, 런칭 필름, 브랜드 순간 |
| Brutalist / raw | Balenciaga, Are.na, Bloomberg Businessweek 표지 | 차별화, 반문화 |
| Warm humanist | Mailchimp(초기), Stripe Press, Headspace | 라이프스타일, 교육, 친근한 B2C, 웰니스 |

사용자가 학파를 고르면 에이전트는 그 학파의 레시피 파일 2~3개를 읽어 구체값을 꺼낸다.[](source:wd-adv-after) 사용자의 답에 따라 대응이 다르다.[](source:dd-pick)

- "둘을 섞자"면 섞은 조합을 글로 확인받는다.
- "다 별로"면 좁히는 질문 하나를 하고, 아직 안 보인 행에서 새로 3개를 낸다.
- "알아서 골라"면 가장 안전한 방향(보통 Editorial / Minimalist)을 이유와 함께 고르고 5분짜리 v0를 제안한다.
- 방향을 5개 이상 보이거나, 사용자에게 방향마다 1~10점을 매기라고 하면 안 된다.[](source:dd-anti)

다른 모드 전환 조건은 다음과 같다.

| 조건 | 바뀌는 것 | 근거 |
| --- | --- | --- |
| 사용자가 anchor를 지목했다("Linear-style", "Aesop feeling") | 그 레시피 파일 하나만 읽는다. 사용자 브랜드 자산·Figma·코드베이스가 있거나, 기존 UI를 확장하거나, 참고 페이지 스크린샷을 줬으면 레시피를 읽지 않는다 | [](source:ix-when) |
| 기존 UI에 덧붙인다 | 편집 전에 Extension, Redesign · Preserve, Redesign · Overhaul 중 하나로 분류한다. Preserve와 Overhaul에 따라 결과가 크게 달라지는데 요청이 모호하면 질문 하나만 한다 | [](source:wd-ext)[](source:rp-mode) |
| 시각이 중요한 greenfield 또는 overhaul 작업(캠페인 랜딩, 브랜드 런칭, 제품 hero, 아트 디렉션 포트폴리오) | 선택적 image-first 분기. Figma·스크린샷·성숙한 디자인 시스템이 있거나, 확장·수리·대시보드·폼·데이터 표이거나, 불확실성이 시각보다 동작에 있거나, 비용만 늘면 건너뛴다 | [](source:dc-img) |
| 사용자가 acceptance / 验收, QA, 브라우저 테스트, 시각 회귀, 반응형 검사 등을 명시적으로 요청했다 | `references/browser-acceptance.md`를 따라 실제 브라우저 검수를 한다. "build", "finish", "polish", "verify your work"만으로는 켜지 않는다. 디자인 비평만 요청했으면 검수로 넓히지 않는다 | [](source:wd-s6)[](source:ba-gate) |
| 비평 요청 또는 완료 전 자체 점검 | 5개 차원 비평. 0~10점, 종합 점수, Keep, 심각도 순 Fix, Quick Win 3개를 보고한다 | [](source:wd-s7)[](source:cg-tpl) |

## 무엇을 강제하고 무엇을 금지하나 {#rules}

브랜드가 걸린 작업에서는 자산 규약이 우선한다. 원문의 기준은 "Asset > Spec"이다. 알아보게 만드는 것은 hex 색이 아니라 자산이라는 뜻이다.[](source:wd-brand)

| 자산 | 필요 조건 | 규칙 |
| --- | --- | --- |
| 로고(가능하면 밝은·어두운 판) | 모든 브랜드 작업 | 실제로 찾아봤는데 못 구하면 멈추고 사용자에게 묻는다. 색 사각형으로 대신하지 않는다 {bad:대체 금지}[](source:wd-brand)[](source:wd-ph) |
| 제품 이미지 | 하드웨어·포장·소비재 | CSS 실루엣이나 손으로 그린 SVG로 대신하지 않는다[](source:wd-brand) |
| UI 스크린샷 | 앱·SaaS·웹사이트 | 최신판, 실제 데이터는 지운다[](source:wd-brand) |
| 색 토큰, 글꼴 | 보조 | hex 색만으로는 브랜드가 아니다[](source:wd-brand) |

브랜드 자산은 `brand-spec.md`에 경로를 모으고, 실제 파일은 `assets/<brand>-brand/` 아래에 둔다. HTML은 `<img src="…">`로 가리키고 다시 그리지 않는다. 구하는 순서는 공식 프레스킷·브랜드 사이트 → 공식 런칭 영상 프레임(`yt-dlp` + `ffmpeg`) → 앱스토어 스크린샷 → Wikimedia Commons·Apple Press → 공식 참고 기반 AI 생성 → 정직한 "asset pending" 자리표시다.[](source:wd-brand)[](source:wd-files)

AI 티 나는 패턴은 무조건 금지가 아니다. 원문은 예외를 "브랜드 스펙이 그것을 쓴다"로 한정한다.[](source:wd-cliche)

| 패턴 | 예외 |
| --- | --- |
| 보라→분홍→파랑 강한 그라디언트 | 브랜드가 쓰거나 그 미학을 풍자할 때 |
| 둥근 카드 + 색 왼쪽 테두리 | 사용자가 명시 요청하거나 브랜드 스펙이 유지할 때 |
| emoji를 아이콘 대신 | 브랜드가 emoji를 쓸 때(Notion, Slack, 초기 Linear), 아이들·캐주얼 대상 |
| SVG로 그린 얼굴·장면·사물 | 거의 없음. 실제 이미지, AI 생성 이미지, 자리표시를 쓴다 {bad:거의 금지} |
| 실제 제품 이미지 대신 CSS 실루엣 | 브랜드 작업에서는 없음 {bad:금지} |
| Inter / Roboto / Arial / Fraunces / system-ui를 디스플레이 글꼴로 | 브랜드 스펙이 지정할 때 |
| `#0D1117` 위 사이버 네온 | 브랜드가 실제로 그 미학일 때 |
| 지어낸 수치, 가짜 로고 벽, 가짜 후기 | 없음. "real data needed" 자리표시를 쓴다 {bad:금지} |

이 표는 기본 예시다. 여러 섹션 마케팅 페이지, 리디자인, 대시보드, 모션 중심 결과물이면 `references/failure-patterns.md`에서 해당 부분만 읽는다. 각 패턴은 기본값 → 이유 → 예외 → 감지 → 수리로 다룬다.[](source:wd-cliche)[](source:fp-head) 사용자 응답에는 영향이 큰 실패만 보고하고, 범위 안의 안전한 문제는 바로 고친다.[](source:fp-final)

그 밖의 강제와 금지는 다음과 같다.

- emoji는 기본적으로 쓰지 않는다. 아이콘 라이브러리가 없으면 자리표시를 쓴다.[](source:wd-emoji)
- 자리표시 규칙: 아이콘은 `[icon]`이나 `▢`, 아바타는 이니셜 원, 이미지는 `16:9 image`처럼 비율을 적은 카드로 둔다. 데이터가 없으면 사용자에게 요청하고 지어내지 않는다.[](source:wd-ph)
- 섹션이나 페이지를 마음대로 더하지 않는다. 더 필요해 보이면 먼저 묻는다. 페이지가 비어 보이면 레이아웃 문제로 보고 구성, 여백, 글자 크기 리듬으로 푼다.[](source:wd-content)
- React + Babel 규칙 3개: `const styles = {...}`를 쓰지 않고 `terminalStyles`처럼 이름을 붙인다. 파일 사이 컴포넌트는 `Object.assign(window, {...})`로 넘긴다. `scrollIntoView`를 쓰지 않는다. 버전을 바꾸거나 `type="module"`을 붙이지 않는다.[](source:wd-react)
- 팔레트는 브랜드 색을 먼저 쓴다. 색이 더 필요하면 `oklch()`로 파생하고 새 색상(hue)을 만들지 않는다.[](source:wd-css)
- 애니메이션은 CSS → React state·`requestAnimationFrame` → 자체 `useTime`·`Easing`·`interpolate` → Popmotion 순으로 가볍게 시작한다. Framer Motion, GSAP, Lottie는 명시 요청이 없으면 피한다.[](source:wd-anim)
- CDN은 장면이 분명히 요구할 때만 넣는다. Tailwind CDN과 Lucide Icons CDN은 명시 요청이나 버리는 프로토타입에서만 쓴다.[](source:wd-cdn)
- 기존 UI의 보호 계약은 조용히 바꾸지 않는다. 대상은 라우트·slug·anchor ID·주 내비게이션 이름, 로고, 폼 필드 이름·순서·제출 동작, 법률·동의·가격 문구, 분석 이벤트·selector, 기존 접근성, 공개 컴포넌트 API, 사용자 콘텐츠다. 바꿔야 하면 권한을 묻는다.[](source:rp-protect)
- Preserve 모드에서는 브리프를 만족하면 멈춘다. 현대화는 기능·접근성 수리부터 블록 교체까지 8단계 중 가장 위험이 낮은 것부터 한다.[](source:rp-order)
- 브라우저 검수는 코드 읽기만으로 통과했다고 말하지 않는다. 보고만 하는 QA면 파일을 고치지 않는다. 새 테스트 프레임워크 설치나 프로덕션 변경은 하지 않는다.[](source:ba-repair)[](source:ba-start)[](source:ba-vp)
- 비평은 디자이너가 아니라 디자인을 비평한다. Fix 항목은 7개를 넘기지 않고, 많으면 묶는다.[](source:wd-s7)[](source:cg-anti)
- 레시피는 한 페이지에서 둘을 섞지 않는다. 사용자가 원하고 이유를 댈 수 있을 때만 예외다. 25개 밖으로 벗어나면 조용히 새 레시피를 만들지 않고 사용자에게 알린다.[](source:ix-anti)[](source:ix-none)

수치는 의무·권고·예시를 나눠 읽어야 한다.

| 값 | 성격 | 적용 조건 |
| --- | --- | --- |
| 다이얼 5개, 각 1~10 정수 | 의무(Design Read 형식). 바꿔도 계획이 안 바뀌는 점수는 지우거나 연결을 명시한다 | 모든 작업[](source:wd-read)[](source:dc-dials)[](source:dc-done) |
| 프리셋(예: 데이터 대시보드 4·3·8·3·7) | 시작점이고 의무가 아니다 | 브리프 종류별[](source:dc-preset) |
| Extension은 Brand Fidelity 10, Preserve는 variance·motion 다이얼을 최대 1점만 바꾼다 | 규칙(요청이 없을 때) | 기존 UI 작업[](source:rp-dial) |
| Asset Dependence 7 이상 | 레이아웃 전에 자산 목록을 만든다 | 다이얼 값 조건[](source:dc-dials) |
| 접근성 제약 | 미적 점수보다 우선. 허락 없이 모션을 줄이고 대비를 지킨다 | 항상[](source:dc-conf) |
| 1920×1080 발표 글자 24px 이상, 모바일 터치 영역 44px 이상, 인쇄 12pt 이상, 웹 본문 16~18px부터 | 최소 크기 | 맥락별[](source:wd-scale) |
| h1과 본문 4~6배 | "normal"이라는 권고 | 시각 효과[](source:wd-stun) |
| 제목/본문 2.5배 이상, 색 4개 이하, 글꼴 2개 이하, 8pt 격자 | 비평 기준 | 비평 Craft·Hierarchy[](source:wd-s7)[](source:cg-rubric) |
| 여백 40% 이상(미니멀은 60% 이상), 간격 {8, 16, 24, 32, 48, 64, 96} | 흔한 문제의 수리 권고 | 비평 카탈로그[](source:cg-top) |
| 프로토타입 변형 3개 이상, Tweaks로 전환 | 지시 | 인터랙티브 프로토타입[](source:wd-proto) |
| 슬라이드 1920×1080 고정 캔버스, 번호는 1부터, 배경색 1~2개 | 지시 | HTML 슬라이드[](source:wd-slides) |
| 1000줄 넘는 파일은 JSX 여러 개로 나눈다 | 지시 | 파일 관리[](source:wd-files) |
| 요청이 없어도 창의적인 Tweak 1~2개 | 기본 동작 | Tweaks 패널[](source:wd-tweaks) |
| 뷰포트 390×844, 768×1024, 1280×720, 1440×900 | 기본값. 반응형 검수를 요청했는데 대상을 안 줬을 때만 | 브라우저 검수[](source:ba-vp) |

## 흐름 속 위치 {#position}

@workflow id=wde-position title="web-design-engineer 앞뒤"
| pos-ms | motion-showreel | backend |
| pos-ba | beautiful-article | backend |
| pos-wde | web-design-engineer | backend |
| pos-wvp | web-video-presentation | backend |
| pos-gpt | gpt-image-2 | backend |
| pos-ms > pos-wde | 웹페이지면 |
| pos-ba > pos-wde | 웹앱이면 |
| pos-wde > pos-ba | 장문 기사면 | dashed |
| pos-wde > pos-wvp | 원고 영상이면 | dashed |
| pos-wde > pos-gpt | 이미지 참조 | emphasis |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `motion-showreel`(앞) | 사용자 요청 | - | `motion-showreel`의 적용 판단 표가 웹페이지, 랜딩, 인터랙티브 프로토타입, 정적 시안을 ❌로 표시하고 이 스킬을 쓰라고 한다[](source:ms-route) | r31 |
| `beautiful-article`(앞) | 사용자 요청 | - | `beautiful-article`의 README가 웹앱, 대시보드, 폼, 프로토타입, 일반 랜딩은 이 스킬로 가라고 한다. 애매하면 그쪽 스킬이 멈추고 묻는다[](source:ba-route) | r34 |
| `beautiful-article`(뒤) | - | 사용자 요청 | 이 스킬의 비적용 목록에 "소재 → 장문 HTML 기사"가 있고, 전용 스킬이 있으면 넘기라고 한다. 이름은 적지 않았다. 역할이 맞는 스킬은 컬렉션에서 `beautiful-article` 하나다(명시-역할)[](source:wd-scope)[](source:ba-desc) | r32 |
| `web-video-presentation`(뒤) | - | 사용자 요청 | 비적용 목록의 "원고 박자 → 녹화용 웹 영상 발표"다. `description`에도 "narration-driven click-through video presentations"가 비적용으로 있다. 이름은 적지 않았다(명시-역할)[](source:wd-scope)[](source:wd-fm)[](source:wvp-desc) | r33 |
| `gpt-image-2`(위임) | 생성한 시각 참조 | 시각 바이블과 생성 요청 | image-first 분기 안의 조건부 권고다. `gpt-image-2`가 있으면 구조화 생성에 쓰고, 없으면 호스트의 이미지 흐름을 따르거나 필요한 자산을 정직하게 남긴다. 생성 이미지는 구현 결정을 뽑는 참고이고, 코드·브랜드 자산과 충돌하면 그쪽이 우선한다[](source:dc-img)[](source:dc-gpt) | r35 |
| `impeccable` | - | - | 같은 계열(추론). 둘 다 페이지·대시보드·UI를 만들고 디자인을 비평한다. 직접 연결은 없다[](source:wd-fm)[](source:im-desc) | r43 |
| `landing-page-design` | - | - | 같은 계열(추론). 둘 다 랜딩 페이지·프로토타입·컴포넌트를 만든다. 직접 연결은 없다[](source:wd-fm)[](source:lp-desc) | r45 |

그림에서 r32, r33은 이름 없이 역할로만 가리키는 넘김이라 점선으로 그렸다. r43, r45는 같은 계열이라 표에만 남겼다.

이 스킬은 묶음 두 개에 속한다. 전체 흐름은 `design/_group-garden-visual/garden-visual.html`(결과물 종류에 맞는 garden 스킬 고르기)에, 작성자가 다른 대안 비교는 `design/_group-site-design-choice/site-design-choice.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 확인하지 못한 것 {#audit}

- 읽은 파일: 원본 텍스트 38개, 합계 208,026B다. 목록은 `skill-explainers/design/garden-skills/web-design-engineer/files.md`에 있다. 구조·표본만 본 파일은 없다.
- 제외한 파일: 번역본 37개(합계 276,576B). `*.ko.md` 36개와 `README.zh-CN.md` 1개다. 바이너리는 이 폴더에 없다.
- 실행하지 않았다. 브라우저 검수, 이미지 생성, 웹 검색, CDN 로드는 모두 읽기만 했다. 페이지의 동작은 지시상 동작이다.
- 원문 비교: 다른 컬렉션에 같은 이름의 스킬은 없다(원장).
- 분석 중 바뀐 파일: 없음. `design/`은 commit `4e3fc89` 그대로다.
- 원문 대조 범위: 활성화 제한 2개(`description`, `allow_implicit_invocation`), 사람 확인 지점 3개와 추가 질문 조건 4개, 모드 전환 조건 6종, 금지 표 8행, 수치 13행, 관계 행 r31·r32·r33·r34·r35·r43·r45를 원문과 대조했다. 레시피 25개는 공통 틀과 `INDEX.md`의 공통 금지만 페이지에 옮겼다.

원문끼리 어긋나는 곳이다. 원문이 우선순위를 밝히지 않아 그대로 보여 준다.

| # | 어긋나는 곳 | 근거 |
| --- | --- | --- |
| 1 | `SKILL.md`는 React + Babel의 버전 고정 `<script>` 태그와 `integrity` 해시가 `references/advanced-patterns.md`에 있다고 두 번 적는다. 그 파일에는 해당 태그가 없다. 목차 7개 절 어디에도 Babel이 나오지 않는다 | [](source:wd-react)[](source:wd-cdn)[](source:ap-toc) |
| 2 | `advanced-patterns.md`의 글꼴 절은 "유일한 hard rule"로 Inter를 피하라고 한다. 같은 파일의 조합 표 첫 행은 "Space Grotesk + Inter"다. `linear.md`도 본문에 Inter를 쓰는데, `INDEX.md`는 anchor 자체가 쓰는 경우를 예외로 둔다 | [](source:ap-font)[](source:ap-pair)[](source:rc-linear)[](source:ix-anti) |
| 3 | 다크 모드 템플릿의 주 색 값이 `#3b82f6`이다. 같은 파일과 `SKILL.md`는 "Inter + #3b82f6"을 AI 기본값의 예로 든다 | [](source:ap-dark)[](source:ap-pair)[](source:wd-s3) |
| 4 | iPhone 프레임 템플릿의 상태 표시줄에 emoji(`⚡ 📶`)가 있다. `SKILL.md`는 emoji를 아이콘 대신 쓰지 말라고 한다 | [](source:ap-iphone)[](source:wd-emoji) |
| 5 | Step 0은 "권위 있는 출처"로 확인하라고 하고, 체크리스트는 "WebSearch로 확인"이라고 도구를 지목한다. 검색 도구가 없는 호스트에서 어떻게 하는지는 `원문에 명시 없음`이다 | [](source:wd-s0)[](source:wd-check) |

@callout level=open-question title="확인하지 못한 것"
README는 이 스킬이 Claude Design 시스템 프롬프트(약 420줄)를 바탕으로 했다고 적는다. 그 원문(`dist/prompt/claude-design-system-prompt.md`)은 이 저장소에 없어 대조하지 않았다.[](source:rd-bg) 결과물이 실제로 "stunning" 수준인지, 다이얼이 실제 결정을 바꾸는지는 실행해 보지 않아 판단하지 않았다. 원장 r35의 "이미지 자산이 필요할 때"는 원문상 image-first 분기 안의 지시라서 범위가 더 좁다. 생성물도 페이지에 넣는 자산이라기보다 구현 결정을 뽑는 참고에 가깝다.[](source:dc-img)[](source:dc-gpt)
