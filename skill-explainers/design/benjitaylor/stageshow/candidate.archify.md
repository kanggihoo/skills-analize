# stageshow 스킬은 에이전트를 어떻게 바꾸나 {#stageshow-skill}

`stageshow`를 켜면 에이전트는 가짜 제품 UI(faux UI)를 코드부터 짜지 않는다. 먼저 어디에 놓일지, 무엇이 주인공인지, 어떤 일이 일어나는지를 계획하고, 가장 가까운 gold example을 복사해 시작한다. 만든 뒤에는 headless Chrome으로 촬영해 `--gate` 통과 조건을 맞추고, 마지막에 `REHEARSAL.md`로 안 본 것을 적는다. **통과 조건은 필요조건일 뿐이고, 움직임은 사람이 직접 봐야 한다.** 이 분석은 `kit/`와 `examples/`의 코드를 읽지 않은 **부분 분석**이다.[](source:ss-body)[](source:vf-gate)[](source:vf-hand)[](source:rh-never)

- 켜지는 때: 가짜·목업 UI, 제품 데모나 walkthrough 애니메이션, 앱의 hero·feature card 일러스트, 인터페이스 위에서 움직이는 cursor를 요청할 때다. "faux UI"라는 말이 없어도 켜지라고 description이 적는다. 호출 제한 필드는 없다.[](source:ss-fm)
- 강제하는 것: 계획을 코드보다 먼저 쓰고, kit 부품을 직접 흉내 내지 않고, 촬영한 frame을 보고 고친다. `--gate`가 통과 조건 줄 24종을 0으로 만들지 못하면 넘기지 않는다.[](source:ss-wf)[](source:ss-kit)[](source:rh-never)
- 쓰면 안 되는 때: 실제 앱 컨트롤을 자동으로 조작해야 할 때다. 원문은 이 그림이 "authored illustrations, not browser automation"이라고 못박는다.[](source:ss-idea)
- 켜면 실제로 하는 일: `npm install`, dev server 실행, `playwright-core`와 로컬 Chrome으로 촬영을 한다. 이 분석은 아무것도 설치하거나 실행하지 않았다.[](source:rm-prev)[](source:pk)

@answer scope="design/benjitaylor/stageshow · 지시상 동작 · 읽은 텍스트 파일 일부 · 실행 안 함"
@meta locale=ko
@source ss-fm title="design/benjitaylor/stageshow/SKILL.md · 19469B · frontmatter" path=design/benjitaylor/stageshow/SKILL.md lines=1:6
@source ss-body title="SKILL.md · 이 스킬이 만드는 것" path=design/benjitaylor/stageshow/SKILL.md lines=8:10
@source ss-idea title="SKILL.md · 한 가지 생각과 실패 다섯 가지" path=design/benjitaylor/stageshow/SKILL.md lines=12:26
@source ss-press title="SKILL.md · 기준은 gold example" path=design/benjitaylor/stageshow/SKILL.md lines=28:30
@source ss-wf title="SKILL.md · 7단계 workflow" path=design/benjitaylor/stageshow/SKILL.md lines=32:42
@source ss-s1 title="SKILL.md · 1단계 매체와 자리" path=design/benjitaylor/stageshow/SKILL.md lines=36:36
@source ss-s2 title="SKILL.md · 2단계 look" path=design/benjitaylor/stageshow/SKILL.md lines=37:37
@source ss-s3 title="SKILL.md · 3단계 이야기" path=design/benjitaylor/stageshow/SKILL.md lines=38:38
@source ss-s4 title="SKILL.md · 4단계 example에서 시작" path=design/benjitaylor/stageshow/SKILL.md lines=39:39
@source ss-s5 title="SKILL.md · 5단계 화면" path=design/benjitaylor/stageshow/SKILL.md lines=40:40
@source ss-s6 title="SKILL.md · 6단계 choreograph" path=design/benjitaylor/stageshow/SKILL.md lines=41:41
@source ss-s7 title="SKILL.md · 7단계 rehearse" path=design/benjitaylor/stageshow/SKILL.md lines=42:42
@source ss-faults title="SKILL.md · 매번 돌아오는 결함 10가지" path=design/benjitaylor/stageshow/SKILL.md lines=44:55
@source ss-ex title="SKILL.md · example 세 종류" path=design/benjitaylor/stageshow/SKILL.md lines=57:61
@source ss-kit title="SKILL.md · kit과 lookalike 금지" path=design/benjitaylor/stageshow/SKILL.md lines=139:148
@source ss-refs title="SKILL.md · references 안내" path=design/benjitaylor/stageshow/SKILL.md lines=150:152
@source fr-rules title="references/framing.md · 14000B · 배치 규칙" path=design/benjitaylor/stageshow/references/framing.md lines=5:28
@source fr-layout title="references/framing.md · 배치 17종 표" path=design/benjitaylor/stageshow/references/framing.md lines=30:50
@source cr-rest title="references/craft.md · 18567B · Restraint" path=design/benjitaylor/stageshow/references/craft.md lines=7:38
@source mo-story title="references/motion.md · 23668B · Story" path=design/benjitaylor/stageshow/references/motion.md lines=18:39
@source mo-loop title="references/motion.md · Loops" path=design/benjitaylor/stageshow/references/motion.md lines=41:53
@source ch title="references/choreography.md · 3478B" path=design/benjitaylor/stageshow/references/choreography.md lines=1:32
@source bt title="references/bento.md · 10964B · bento 규칙" path=design/benjitaylor/stageshow/references/bento.md lines=7:22
@source vf-gate title="references/verify.md · 5115B · Gate" path=design/benjitaylor/stageshow/references/verify.md lines=5:9
@source vf-see title="references/verify.md · 보이는 것과 할 일 표" path=design/benjitaylor/stageshow/references/verify.md lines=48:66
@source vf-hand title="references/verify.md · Hand over와 REHEARSAL.md 템플릿" path=design/benjitaylor/stageshow/references/verify.md lines=68:84
@source rh-film title="references/rehearse.md · 12776B · 촬영 명령" path=design/benjitaylor/stageshow/references/rehearse.md lines=28:48
@source rh-never title="references/rehearse.md · 의도일 수 없는 줄 24종" path=design/benjitaylor/stageshow/references/rehearse.md lines=50:81
@source rh-last title="references/rehearse.md · 마지막 점검" path=design/benjitaylor/stageshow/references/rehearse.md lines=115:117
@source rv title="references/review.md · 3052B · fresh-eye review" path=design/benjitaylor/stageshow/references/review.md lines=1:26
@source pr title="references/products.md · 2096B · 제품 연구" path=design/benjitaylor/stageshow/references/products.md lines=1:26
@source rm-prev title="README.md · 3026B · 미리보기와 촬영 도구" path=design/benjitaylor/stageshow/README.md lines=6:62
@source rm-contents title="README.md · 폴더 구성" path=design/benjitaylor/stageshow/README.md lines=64:75
@source nt title="NOTICE.md · 1776B · 상표와 라이선스" path=design/benjitaylor/stageshow/NOTICE.md lines=1:26
@source pk title="package.json · 930B · 의존성과 scripts" path=design/benjitaylor/stageshow/package.json lines=1:34
@source fm-gate title="scripts/film.mjs · 38732B · --gate 판정, 해당 부분만 확인" path=design/benjitaylor/stageshow/scripts/film.mjs lines=518:527

## 언제 켜지고, 무엇은 이 스킬의 일이 아닌가 {#trigger}

@code source=ss-fm language=yaml

`description`은 모델이 켤지 판단할 때 참고하는 설명이다. 특정 단어가 있어야 켜지는 사전이 아니다. frontmatter에는 `name`, `description`, `metadata.version`(1.1.1)만 있고, `disable-model-invocation` 같은 호출 제한 필드는 없다. `agents/openai.yaml`도 이 폴더에 없다.[](source:ss-fm)

| 요청 | 에이전트가 하는 일 | 근거 |
| --- | --- | --- |
| 가짜 UI나 hero·feature card용 앱 일러스트(still) | 7단계로 진행한다 {good:기본} | 1단계에서 still인지 animation인지 정한다[](source:ss-s1) |
| 앱 안에서 cursor가 움직이는 데모 | 같은 7단계로 진행하고 `Act` API로 장면을 짠다 {good:기본} | 6단계[](source:ss-s6) |
| 만들려는 제품의 코드나 사이트가 있음 | 그 token을 kit의 token에 대응시킨다 | 2단계[](source:ss-s2) |
| 개발자가 자기 컴포넌트를 쓰라고 함 | kit의 작은 부품 대신 그 컴포넌트를 stage 안에서 쓴다 | 2단계[](source:ss-s2) |
| 실제 앱 컨트롤을 자동 조작 | 하지 않는다. `a.click()`은 cursor가 누르는 모습을 그릴 뿐이다 {caution:범위 밖} | 한 가지 생각[](source:ss-idea) |

사람 개입은 원문에 질문 지점으로 적혀 있지 않다. 승인을 받고 넘어가는 지점도 `원문에 명시 없음`이다. 계획(자리, 주인공, 동작, payoff, 뺄 것)을 "코드 전에 쓴다"는 지시만 있고, 그 계획을 누구에게 보여 주는지는 적혀 있지 않다.[](source:ss-wf)

이 스킬은 `design` 컬렉션의 묶음에 속하지 않는다. 다른 `SKILL.md`에 `stageshow`를 가리키는 문장이 없다(`grep`으로 확인). 같은 계열 후보는 확정하지 않았다.

## 어떤 순서로 만들고, 어디서 멈추나 {#workflow}

7단계가 위에서 아래로 이어지고, 7단계 안에서 촬영과 수정이 돈다. 마지막 단계에는 통과 조건이 있다. `--gate`가 `rehearsal passed`로 끝나야 넘긴다.[](source:ss-s7)[](source:fm-gate)

@workflow id=stageshow-flow title="stageshow 7단계와 끝내는 조건"
| lane plan | 계획 |
| lane build | 제작 |
| lane check | 검증 |
| medium | 매체와 자리 | backend | plan |
| look | look 정하기 | backend | plan |
| story | 이야기 | backend | plan |
| gold | gold 복사 | backend | build |
| screen | 화면 | backend | build |
| move | 움직임 | backend | build |
| film | 촬영과 수정 | backend | check |
| gate | 통과 조건 0? | backend | check |
| hand | REHEARSAL.md | backend | check |
| medium > look | |
| look > story | |
| story > gold | |
| gold > screen | |
| screen > move | |
| move > film | |
| film > gate | |
| gate > film | no | dashed |
| gate > hand | yes | emphasis |

@steps id=stageshow-steps
| medium | 매체와 자리 | still인지 animation인지, 놓일 페이지와 폭을 정한다. 폭은 보이는 크기 그대로 설계하고, 좁은 칸에 들어갈 demo는 358 폭 `compact`를 따로 만든다. | stageshow-flow | medium |
| look | look 정하기 | 제품 코드나 사이트가 있으면 token을 대응시킨다. 없으면 theme, palette, fidelity를 고른다. 기본은 light, accent, standard다. | stageshow-flow | look |
| story | 이야기 | 이야기의 모양을 고르고 beat 3~5개와 payoff를 정한다. cursor 움직임마다 이유가 있어야 한다. | stageshow-flow | story |
| gold | gold 복사 | 가장 가까운 gold를 촬영해 보고 폴더째 복사한다. 이름만 바꾼 복사본은 끝난 것이 아니다. `references/craft.md`는 이때 끝까지 읽는다. | stageshow-flow | gold |
| screen | 화면 | 실제 문자열은 3~7개로 센다. kit의 token과 `Bar`, `Text`, `Row`로 만들고, cursor가 닿는 곳에 `data-target`을 붙인다. | stageshow-flow | screen |
| move | 움직임 | 나타나는 것은 mount해 둔 채 켜고 꺼서 exit도 움직이게 한다. beat는 겹치고, payoff는 머문다. | stageshow-flow | move |
| film | 촬영과 수정 | `poster` frame부터 정한다. loop를 `--gate`로 촬영하고, 폭 390에서도 찍는다. 가장 큰 결함부터 고친다. | stageshow-flow | film |
| gate | 통과 조건 0? | 의도일 수 없는 줄이 모두 0이어야 `rehearsal passed`가 나온다. 아니면 결함을 고치고 다시 찍는다. | stageshow-flow | gate |
| hand | REHEARSAL.md | fresh-eye review를 받고, 쓴 gold와 바꾼 것, 확인하지 않은 것을 `REHEARSAL.md`에 적는다. | stageshow-flow | hand |

시간이나 tool 호출이 모자라면 통과 조건 줄을 고치는 일이 stills를 더 찍는 일, review, 노트보다 앞선다.[](source:ss-s7) 다만 still만 만드는 경우에 6단계를 건너뛴다는 문장은 `원문에 명시 없음`이다. 확인 명령만 `--still --gate`로 달라진다.[](source:vf-gate)

## 무엇을 강제하고 무엇을 금지하나 {#rules}

원문은 실패를 다섯 가지로 이름 붙이고, 모두 "화면이 진짜 제품처럼 보이면서 보는 사람에게 필요한 만큼만 남아 있어야 한다"는 한 문장에서 끌어낸다.[](source:ss-idea)

| 실패 | 어떤 모습인가 | 고치는 방향 |
| --- | --- | --- |
| Too much | 모든 행에 실제 글, 숫자가 가득 | 이야기가 닿는 곳에만 실제 글을 쓰고 나머지는 placeholder 줄로 둔다 {bad:생성물처럼 보임} |
| Wireframe | 회색 덩어리 둘과 버튼 | 너무 작게 만들었거나 알아볼 특징을 뺀 것이다. 구조 있는 전체 화면으로 채운다 {bad:미완성} |
| Boxed | window 전체를 균등한 여백으로 카드에 줄여 넣음 | crop해서 시선이 이야기에 가게 한다 {bad:스크린샷 붙임} |
| Flat | 모든 물체가 같은 무게의 같은 테두리 카드 | 눈이 앉을 곳이 있어야 한다 {bad:위계 없음} |
| Bland | 브리프와 상관없는 회색 window와 cursor | 브리프의 look과 에너지를 규칙 안에서 끝까지 구현한다 {bad:밋밋함} |

여기서 말하는 모습은 모두 원문이 실패로 이름 붙인 것이다.[](source:ss-idea) 아래 수치는 원문의 규칙이다. 원문은 예외를 명시한 곳 말고는 "~다"로 단정해 쓰고, 의무와 권고를 따로 표시하지 않는다.

@facts id=stageshow-numbers
| hero loop 길이 | 10~16초. 반복은 짧은 beat이지 흐름 전체를 두 번 돌리는 것이 아니다[](source:ss-s3)[](source:mo-story)[](source:mo-loop) |
| beat | 3~5개와 payoff. 제스처 하나와 반응 하나로 충분할 수 있다[](source:mo-story) |
| payoff 유지 | exit 전 2초. 화면에 3초 넘게 가만히 있는 것이 없어야 한다[](source:mo-loop) |
| 실제 문자열 | 보통 3~7개. 나머지는 `Bar`다[](source:cr-rest) |
| crop | hero의 10~40%를 stage 밖으로 내보낸다. window나 phone은 stage 폭의 3분의 2 이상을 차지한다[](source:fr-rules) |
| 설계 크기(예시) | hero 옆 약 720 × 340, 전체 폭 hero 900~1100, 카드 400 × 300. 모두 1:1로 본다[](source:ss-s1) |
| 좁은 칸 | `compact` 설계는 폭 358. demo는 약 320보다 좁게 만들지 않는다[](source:ss-s1) |

원문이 금지하거나 반복해서 짚는 결함은 `SKILL.md`에 열 가지로 모여 있다.[](source:ss-faults)

- 내용이 움직이지 않고 바뀌는 것(swap), 시선이 닿는 곳의 회색 bar.
- hero 뒤에 판을 깔거나, 사방에 공기를 둔 채 떠 있는 window.
- 빈 띠, 잘린 컨트롤과 그림자, 바쁜 행과 고르지 않은 inset.
- 반짝이, 보라색, 컬러 사각형 속 글자 같은 stock AI 느낌과 지어낸 로고.
- 이유 없는 긴 hold와 reset, I-beam 아래에 있지 않은 선택 영역.
- 손으로 그린 status bar와 home indicator(`Phone`이 그린다), 부호와 함께 가운데 정렬된 금액.

kit은 같은 방식으로 강제한다. 버튼, 카드, 탭, avatar, field, toast, badge, 단축키 표시는 직접 클래스를 만들지 말고 kit 부품을 쓴다. 직접 만든 것이 고르지 않은 padding과 눌린 label의 출처라고 원문이 적는다. 부품의 geometry를 바깥에서 바꾸는 것도 금지다(`kit override:` 줄).[](source:ss-kit)[](source:rh-never)

## 끝났다고 말하려면 무엇을 통과해야 하나 {#verify}

통과 조건은 세 번 촬영한 결과다. 폭 390과 브리프가 정한 폭에서도 같은 조건을 확인한다.[](source:vf-gate)

| 확인 | 명령 | 통과 조건 |
| --- | --- | --- |
| 넓은 폭 loop | `film.mjs <url> --gate` | 마지막 줄이 `rehearsal passed`. still이면 `--still --gate` |
| 좁은 폭 | `film.mjs <url> --width 390 --gate` | 같음 |
| 상태 한 장 | `film.mjs <url> --states --gate` | 시작, 모든 표시가 가라앉은 상태, 끝이 되돌려 보낼 것 없이 한 장에 있음 |

`--gate`는 `rehearse.md`가 "의도일 수 없는 줄"로 적은 24종이 모두 0일 때만 `rehearsal passed`를 찍는다. 아니면 개수를 찍고 종료 코드 1로 끝난다. 줄의 예는 `framing:`, `cut by the crop:`, `tight inset:`, `kit override:`, `unit wrapped:`, `empty pane:`, `emoji icon:`이다. 줄이 가리키는 것을 숨기거나 `data-crop`, `data-snap`으로 표시해 줄을 지우는 것은 버그다.[](source:rh-never)[](source:fm-gate)

@callout level=warning title="통과해도 끝이 아니다"
`film.mjs`는 통과 줄에 "necessary, not sufficient"를 붙인다. 한 frame짜리 번쩍임, 사람이 보면 어색한 morph, 이야기가 맞는지는 도구가 모른다. 원문은 속도를 늦춰 보고, loop 이음매와 다음 시작을, 중단과 reduced motion, 화면 밖에서 돌아오는 경우를 사람이 직접 보라고 한다.[](source:fm-gate)[](source:rh-never)

마지막 단계도 사람의 일이다. fresh-eye review는 `review.md`, `verify.md`, `examples/`, scene URL, 촬영한 frame을 받은 reviewer가 한다. reviewer가 별도 에이전트인지 사람인지는 `원문에 명시 없음`이다.[](source:rv)

`REHEARSAL.md`는 쓴 gold와 바꾼 것, 촬영한 폭·look·상태, 마지막 gate 줄, 줄마다 처리한 방법, 가정, 해결 못 한 것, 확인하지 않은 것을 담는다.[](source:vf-hand)

## 어디서 시작하나: gold와 배치를 고르는 법 {#gold-pick}

시작점은 코드를 새로 쓰는 것이 아니라 가장 가까운 example 복사다. example은 세 종류다. gold는 품질 기준선이고, 제품 연구(product studies)는 interaction만 빌리고 그 제품의 정체성은 빌리지 않고, specimen 시트는 부품 카탈로그라 구성의 출발점이 아니다. `teaching/`의 bad/good 쌍은 진단용이며 bad 쪽은 시작점이 아니다.[](source:ss-ex)[](source:pr)

gold로 만든 결과가 gold보다 비거나 평평하거나 작으면, 그것이 가장 먼저 고칠 결함이다.[](source:ss-press) 맞는 gold가 없으면 두 단계로 고른다. 배치를 `framing.md`의 표에서 고르고 그 example을 복사한 뒤, 움직임은 이야기가 가장 가까운 example에서 빌린다.[](source:ss-s4)

| 하려는 것 | 배치 | example |
| --- | --- | --- |
| feature card, bento tile | 아래로 잘린 pinned 배치. hero는 위와 좌우에서 8~12% 들여 놓고 아래로 15~35% 넘긴다 | `static-card`[](source:fr-layout) |
| 카피 옆 hero | corner bleed. 위·왼쪽에서 10% 들이고 오른쪽·아래로 15~35% 넘긴다 | `hero-demo`[](source:fr-layout) |
| 전체 폭 homepage hero | 900~1100px window를 1:1로, 아래와 대개 양옆도 넘긴다 | `linear`[](source:fr-layout) |
| 세션 여럿을 나란히 | 같은 높이 window 셋이나 넷, 바깥쪽 둘은 양옆 밖으로 | `window-row`[](source:fr-layout) |
| 데스크톱과 phone이 한 사건을 말함 | phone이 오른쪽 가장자리를 약 3분의 1 걸친다 | `device-pair`[](source:fr-layout) |
| 작은 것 하나(알림, 영수증, diff) | 맥락은 거의 잘라내고 큰 satellite가 이야기를 진다 | `share`[](source:fr-layout) |
| 여러 tile의 기능 grid | tile의 3분의 1에서 절반만 UI. hero tile 하나, window chrome은 grid에 한 번 | `bento`[](source:bt) |

bento는 tile 하나마다 `Stage` 하나다. grid 전체를 한 `Stage`에 넣으면 tile의 글자가 grid와 함께 줄어든다.[](source:bt)

## 폴더에는 무엇이 있고, 에이전트는 무엇을 만드나 {#artifacts}

@tree id=stageshow-folder title="stageshow 폴더와 에이전트가 만드는 것"
| root | stageshow | - |
| skill | SKILL.md, README.md, NOTICE.md | root |
| refs | references/ 문서 15개 | root |
| kit | kit/ React 부품 155개 | root |
| ex | examples/ 155개 파일, 폴더 71개 | root |
| teach | teaching/ bad/good 쌍 18개 | root |
| scripts | scripts/ 촬영·검사 12개 | root |
| play | playground/ 로컬 viewer 10개 | root |
| mine | 에이전트가 만드는 examples/내-것/ | ex |
| rehearsal | REHEARSAL.md | mine |

폴더 구성과 파일 수는 이 분석이 센 값이다.[](source:rm-contents) 원문이 에이전트에게 시키는 쓰기와 복사는 세 가지다.

- 가까운 gold를 `examples/<yours>/`로 복사해 `?capture=<yours>`로 촬영하고, 통과하면 host 프로젝트로 옮긴다.[](source:ss-s4)
- `REHEARSAL.md`를 컴포넌트 옆에 쓴다.[](source:vf-hand)
- host에 `kit/`를 복사하고 `kit/index.ts`에서 import한다. 의존성은 React, react-dom, lucide-react다.[](source:ss-kit)[](source:pk)

| 항목 | 원문 내용 |
| --- | --- |
| 필요한 환경 | Node 20.19 이상. 미리보기는 `npm install`, `npm run dev`[](source:rm-prev)[](source:pk) |
| 촬영 도구 | `playwright-core`와 로컬 Chrome(`CHROME_PATH`로 바꿈). demo의 runtime 의존성은 아니다[](source:rm-prev) |
| 라이선스 | 코드는 MIT. 앱 아이콘과 상표는 각 소유자 것이고 이 라이선스에 포함되지 않는다[](source:nt) |

## 어디까지 확인했고 한계는 무엇인가 {#audit}

svg와 jpg를 뺀 텍스트 파일 326개 중 일부만 읽었다. 아래는 이 분석의 읽은 범위다.

| 구분 | 파일 | 읽은 정도 |
| --- | --- | --- |
| 끝까지 | `SKILL.md`, `README.md`, `NOTICE.md`, `package.json`, `references/verify.md`, `rehearse.md`, `review.md`, `products.md`, `choreography.md` | 9개 전부 |
| 부분 | `references/framing.md`(규칙과 배치표), `craft.md`(Restraint와 Type), `motion.md`(Story와 Loops, 제목), `bento.md`(규칙), `teaching.md`(Motion 표) | 5개, 구조·표본만 확인(전부 읽지 않음) |
| 제목만 | `references/kit.md`, `looks.md`, `annotations.md`, `backgrounds.md`, `brands.md` | 5개, 제목만 확인 |
| 해당 줄만 | `scripts/film.mjs`의 `--gate` 설명과 판정 부분 | 구조·표본만 확인(전부 읽지 않음) |
| 읽지 않음 | `kit/` 155개, `examples/` 155개, `teaching/` 18개, `playground/` 10개, `scripts/`의 나머지 11개, `assets/app-icons.ts`, `package-lock.json`, `LICENSE` | 원문 지시가 아니라 구현·예시 코드라 이 분석에서 뺐다 |
| 바이너리 | svg 44개, jpg 2개 | 열지 않음 |

@callout level=open-question title="확인하지 못한 것"
- `kit/`의 각 부품이 `references/kit.md`가 적은 대로 동작하는지, gold example이 정말 `--gate`를 통과하는지 확인하지 못했다. 24종 줄 이름과 `film.mjs`의 정규식이 일치하는지도 전부 대조하지 않았다.
- `review.md`의 reviewer가 누구인지, still에서 6단계를 건너뛰는지는 원문에 명시가 없다.
- 이 스킬이 실제로 에이전트의 동작을 바꾸는지는 실행해 보지 않아 확인하지 않았다. 페이지의 모든 동작은 지시상 동작이다.
