# pstack 스킬은 어떻게 연결되어 동작하나? {#pstack-skill-map}

pstack의 허브는 **`/poteto-mode`** 하나입니다. 작업을 플레이북에 매칭하고, 플레이북의 각 단계가 필요한 스킬을 불러 씁니다.

- 사용자가 직접 부를 스킬은 거의 `/poteto-mode`뿐입니다. 나머지 스킬은 플레이북 단계가 필요할 때 실행합니다.[](source:help)
- 일반 스킬 26개는 7개 클러스터로 나뉩니다. 진입·설정, 이해·조사, 설계·계획, 구현·병렬, 검증·리뷰, 글쓰기·설명, 자기개선입니다.
- PR·CI/CD는 별도 스킬이 아닙니다. `/poteto-mode` 안의 플레이북이 Opening a PR, Babysit, Shipping 순서로 이어집니다.[](source:mode)
- 원칙 24개는 직접 실행하지 않습니다. 판단할 때 읽고, 답변에 근거로 이름을 밝힙니다.

@answer scope="pstack 로컬 사본 · 일반 스킬 26개 + 원칙 24개 · poteto-mode 플레이북 23개"
@meta locale=ko
@source help title="poteto-help: 스킬 선택표와 헷갈리는 짝" path=pstack/poteto-help/SKILL.md
@source mode title="poteto-mode: 트리거, 원칙, 플레이북 목록" path=pstack/poteto-mode/SKILL.md
@source feature title="Feature 플레이북" path=pstack/poteto-mode/playbooks/feature.md
@source pr title="Opening a PR 플레이북" path=pstack/poteto-mode/playbooks/opening-a-pr.md
@source babysit title="Babysit 플레이북" path=pstack/poteto-mode/playbooks/babysit.md
@source shipping title="Shipping 플레이북" path=pstack/poteto-mode/playbooks/shipping.md

## 스킬은 어떤 클러스터로 나뉘나? {#clusters}

@tree id=skill-clusters title="pstack 스킬 클러스터"
| root | pstack | - |
| entry | 진입·설정 | root |
| poteto-mode | poteto-mode | entry |
| poteto-help | poteto-help | entry |
| setup-pstack | setup-pstack | entry |
| understand | 이해·조사 | root |
| recall | recall | understand |
| how | how | understand |
| why | why | understand |
| design | 설계·계획 | root |
| architect | architect | design |
| figure-it-out | figure-it-out | design |
| plan-pb | 다단계 계획 (플레이북) | design |
| build | 구현·병렬 | root |
| arena | arena | build |
| swarm | swarm | build |
| ts-bp | typescript-best-practices | build |
| make-bot-ui | make-bot-ui | build |
| verify | 검증·리뷰 | root |
| interrogate | interrogate | verify |
| blast-radius | blast-radius | verify |
| no-comments | no-comments | verify |
| benchmark | benchmark-checklist | verify |
| create-vs | create-verification-skill | verify |
| maintain-vs | maintain-verification-skill | verify |
| ship | PR·CI/CD (플레이북) | root |
| open-pr | Opening a PR | ship |
| babysit-pb | Babysit | ship |
| shipping-pb | Shipping | ship |
| autopilot | Autopilot | ship |
| write | 글쓰기·설명 | root |
| technical-writing | technical-writing | write |
| unslop | unslop | write |
| show-me | show-me-your-work | write |
| teach | teach | write |
| bro | bro | write |
| improve | 자기개선 | root |
| automate-me | automate-me | improve |
| reflect | reflect | improve |
| correct | correct | improve |
| principles | 원칙 24개 | root |
| p-core | Core 10개 | principles |
| p-arch | Architecture 6개 | principles |
| p-verify | Verification 5개 | principles |
| p-deleg | Delegation 2개 | principles |
| p-meta | Meta 1개 | principles |

클러스터는 작업 단계 기준으로 묶었습니다. 이해 → 설계 → 구현 → 검증 → PR·CI/CD → 설명 순서로 읽으면 됩니다.

PR·CI/CD와 다단계 계획은 슬래시 명령이 없습니다. `/poteto-mode`에 "babysit this pr", "land the stack"처럼 말하면 해당 플레이북이 실행됩니다.[](source:help)

## 기능 하나를 만들 때 스킬은 어떤 순서로 이어지나? {#feature-flow}

@workflow id=feature-route title="Feature 작업의 스킬 경로"
| lane understand | 이해 |
| lane design | 설계 |
| lane build | 구현 |
| lane verify | 검증 |
| lane ship | PR·CI/CD |
| request | /poteto-mode 요청 | external | understand |
| how-step | how | backend | understand |
| architect-step | architect | backend | design |
| arena-step | arena 위임 | backend | build |
| surface | 실제 동작 확인 | security | verify |
| contested | 설계 논쟁? | backend | verify |
| interrogate-step | interrogate | security | verify |
| nocomm-step | no-comments | security | verify |
| write-step | technical-writing | backend | ship |
| pr-step | PR 열기 | backend | ship |
| babysit-step | Babysit | cloud | ship |
| shipping-step | Shipping | cloud | ship |
| request > how-step | Feature 매칭 |
| how-step > architect-step | |
| architect-step > arena-step | 설계 확정 | emphasis |
| arena-step > surface | 코드 완성 |
| surface > contested | 통과 |
| contested > interrogate-step | 예 |
| contested > nocomm-step | 아니오 |
| interrogate-step > nocomm-step | |
| nocomm-step > write-step | |
| write-step > pr-step | unslop 후 |
| pr-step > babysit-step | 요청 시 | dashed |
| babysit-step > shipping-step | 머지 요청 시 | dashed |

@steps id=feature-steps
| s-request | /poteto-mode 요청 | 목표와 완료 기준만 말합니다. 모드가 Feature 플레이북을 고르고 단계를 todo로 복사합니다. | feature-route | request |
| s-how | how | 바꿀 서브시스템이 지금 어떻게 동작하는지 먼저 추적합니다. | feature-route | how-step |
| s-architect | architect | 타입과 모듈 모양을 코드보다 먼저 정합니다. 내부에서 arena로 설계안 여러 개를 겨룹니다. | feature-route | architect-step |
| s-arena | arena 위임 | 코드 작성은 서브에이전트에게 맡깁니다. 구현 모양이 여럿이면 arena로 후보를 겨룹니다. | feature-route | arena-step |
| s-surface | 실제 동작 확인 | 빌드 성공이 아니라 실제 UI나 CLI에서 확인합니다. 외부 control-ui, control-cli나 프로젝트의 verify 스킬을 씁니다. | feature-route | surface |
| s-interrogate | interrogate | 설계에 이견이 있으면 여러 모델이 diff를 공격적으로 리뷰합니다. | feature-route | interrogate-step |
| s-nocomm | no-comments | 코드를 쓰지 않은 리뷰어가 불필요한 주석을 걷어냅니다. 그 전에 외부 deslop을 돌립니다. | feature-route | nocomm-step |
| s-write | technical-writing | PR 제목, 본문, 커밋 메시지를 이 표준으로 쓰고 unslop으로 AI 말투를 지웁니다. | feature-route | write-step |
| s-pr | PR 열기 | 작은 PR 여러 개로 스택을 쌓습니다. PR을 열어도 Babysit은 자동으로 시작하지 않습니다. | feature-route | pr-step |
| s-babysit | Babysit | 요청이 오면 충돌, 리뷰 스레드, CI 순서로 처리해 merge-ready까지 끌고 갑니다. 머지는 하지 않습니다. | feature-route | babysit-step |
| s-shipping | Shipping | 머지 요청이 오면 PR마다 독립 검증을 받고, 아래부터 검증된 구간만 머지합니다. | feature-route | shipping-step |

이 경로는 Feature 플레이북과 Opening a PR 플레이북을 이은 것입니다.[](source:feature)[](source:pr) Bug fix 플레이북은 architect 대신 tdd로 재현 테스트부터 씁니다.

CI/CD는 두 단계로 나뉩니다. Babysit은 CI를 녹색으로 만드는 단계입니다.[](source:babysit) Shipping은 실제로 머지하는 단계입니다.[](source:shipping) CI 녹색만으로는 머지 근거가 되지 않습니다.

## 스킬끼리는 서로 누구를 부르나? {#call-graph}

@architecture id=skill-calls title="스킬 간 호출 관계"
| hub | /poteto-mode | frontend |
| teach | teach | external |
| recall | recall | backend |
| blast | blast-radius | security |
| figure | figure-it-out | backend |
| automate | automate-me | backend |
| cvs | create-verification-skill | security |
| how | how | database |
| why | why | database |
| architect | architect | backend |
| arena | arena | backend |
| swarm | swarm | backend |
| interrogate | interrogate | security |
| nocomm | no-comments | security |
| smyw | show-me-your-work | external |
| techw | technical-writing | external |
| unslop | unslop | external |
| mvs | maintain-verification-skill | security |
| hub > how | 큰 변경 |
| hub > architect | 경계 넘는 코드 |
| hub > figure | 큰 작업 |
| hub > swarm | 병렬 검증 |
| hub > interrogate | 설계 논쟁 |
| hub > nocomm | 리뷰 전 |
| hub > techw | 문서·PR |
| hub > smyw | 긴 작업 |
| teach > how | |
| teach > why | |
| recall > why | 공유 기록 |
| blast > why | |
| blast > arena | 큰 변경 |
| figure > architect | 되돌리기 어려운 설계 |
| figure > smyw | 결정 로그 |
| architect > how | |
| architect > why | |
| architect > arena | 설계 경쟁 | emphasis |
| nocomm > architect | 수정 설계 |
| techw > unslop | |
| automate > unslop | |
| cvs > mvs | 이후 유지 | dashed |

호출이 몰리는 곳은 세 군데입니다.

- **how·why**가 바닥 역할을 합니다. teach, architect, blast-radius, recall이 모두 이 둘에게 조사를 맡깁니다.
- **arena**는 "같은 과제를 여러 모델에게 시키고 좋은 부분을 합치는" 엔진입니다. architect와 blast-radius가 이것을 씁니다.
- **unslop**은 모든 글의 마지막 관문입니다. technical-writing, automate-me, `/poteto-mode`의 답변이 이를 거칩니다.

bro, reflect, correct, benchmark-checklist, typescript-best-practices, make-bot-ui는 다른 스킬을 부르지 않는 독립 스킬이라 그림에서 뺐습니다.

## 어떤 상황에 어떤 스킬을 쓰나? {#when}

| 상황 | 스킬 | 클러스터 |
| --- | --- | --- |
| 처음 설치하고 모델·예산을 정할 때 | `/setup-pstack` | 진입·설정 |
| 어떤 스킬을 써야 할지 모를 때 | `/poteto-help` | 진입·설정 |
| 엄격하게 처리할 작업을 시작할 때 | `/poteto-mode` {good:기본값} | 진입·설정 |
| 지난 작업 맥락을 되살릴 때 | `/recall` | 이해·조사 |
| 코드가 지금 어떻게 동작하는지, 어디에 둘지 | `/how` | 이해·조사 |
| 코드가 왜 이런 모양인지, 숫자의 출처 | `/why` | 이해·조사 |
| 함수 경계를 넘는 코드의 타입·모듈 모양 | `/architect` | 설계·계획 |
| 큰 마이그레이션, 자리 비운 뒤 검토할 작업 | `/figure-it-out` | 설계·계획 |
| 같은 과제를 여러 번 시도해 최선을 합칠 때 | `/arena` | 구현·병렬 |
| 범위를 나눠 병렬로 검사하거나 경주시킬 때 | `/swarm` | 구현·병렬 |
| `.ts`, `.tsx` 파일을 다룰 때 | `/typescript-best-practices` | 구현·병렬 |
| 웹훅으로 Grok Bot을 깨우는 UI | `/make-bot-ui` | 구현·병렬 |
| 여러 모델이 diff를 공격적으로 리뷰 | `/interrogate` | 검증·리뷰 |
| diff 바깥에서 깨질 수 있는 곳 찾기 | `/blast-radius` | 검증·리뷰 |
| 리뷰 전에 불필요한 주석 걷어내기 | `/no-comments` | 검증·리뷰 |
| 측정한 성능 수치를 보고하기 전 | `/benchmark-checklist` | 검증·리뷰 |
| 앱을 스크립트로 조작해 동작을 증명할 길이 없을 때 | `/create-verification-skill` | 검증·리뷰 |
| 검증 스킬이 앱과 어긋났을 때 | `/maintain-verification-skill` | 검증·리뷰 |
| 문서, RFC, README, PR 본문, 커밋 메시지 | `/technical-writing` | 글쓰기·설명 |
| 글에서 AI 말투를 지울 때 | `/unslop` {caution:항상 적용} | 글쓰기·설명 |
| 긴 자율 작업의 결정 기록을 남길 때 | `/show-me-your-work` | 글쓰기·설명 |
| 변경이나 서브시스템을 사람에게 쉽게 설명 | `/teach` | 글쓰기·설명 |
| 직전 답변을 쉬운 말로 다시 들을 때 | `/bro` | 글쓰기·설명 |
| 내 작업 습관을 개인 모드 스킬로 만들 때 | `/automate-me` | 자기개선 |
| 끝난 작업의 교훈을 스킬 수정으로 옮길 때 | `/reflect` | 자기개선 |
| 에이전트가 같은 실수를 반복할 때 | `/correct` | 자기개선 |

## 다른 작업 유형은 어떤 플레이북으로 가나? {#playbooks}

`/poteto-mode`는 요청을 아래 플레이북 중 하나에 매칭합니다.[](source:mode) 플레이북이 정해지면 어떤 스킬이 불릴지도 정해집니다.

| 작업 유형 | 플레이북 | 주로 부르는 스킬 |
| --- | --- | --- |
| 읽기 전용 질문 | Investigation | how, why, architect |
| 버그 수정 | Bug fix | how, why, tdd, architect, interrogate |
| 성능 문제 | Perf issue | how, architect, benchmark-checklist |
| 지표를 꾸준히 끌어올리기 | Hillclimb | how, benchmark-checklist, show-me-your-work |
| 새 기능 | Feature | how, architect, arena, interrogate |
| 구조 변경 | Refactoring | how, architect, figure-it-out |
| 결정을 위한 시제품 | Prototype | architect |
| 여러 단계·여러 PR 계획 | Multi-phase plan | how, swarm, technical-writing, unslop |
| 스킬 효과 측정 | Eval | arena |
| PR 열기 | Opening a PR | deslop, no-comments, interrogate, technical-writing, unslop |
| PR을 merge-ready까지 | Babysit | 별도 스킬 없음, `watch-pr` 스크립트 |
| 검증된 스택 머지 | Shipping | control-ui, control-cli |
| PR 큐 전체 자동 처리 | Autopilot-full, Autopilot-stack | swarm, no-comments, show-me-your-work |
| 끝날 때까지 자율 실행 | Autonomous run | show-me-your-work |

맞는 플레이북이 없거나 작업이 아주 크면 `figure-it-out`이 그 작업만을 위한 플레이북을 새로 설계합니다.

## 헷갈리는 스킬 짝은 어떻게 구분하나? {#close-calls}

| 짝 | 구분 기준 |
| --- | --- |
| how vs why vs teach | how는 코드가 무엇을 하는지, why는 왜 그 모양인지 답합니다. teach는 둘을 돌려 사람에게 쉽게 풀어 줍니다. |
| arena vs swarm | arena는 모든 작업자에게 같은 과제를 주고 좋은 부분을 합칩니다. swarm은 일을 쪼개거나 경주시켜 보고서 하나로 돌려줍니다. |
| interrogate vs blast-radius | interrogate는 diff 자체를 리뷰합니다. blast-radius는 diff 바깥에서 깨질 곳을 찾고, 안전하다는 근거 하나를 실행으로 증명합니다. |
| architect vs figure-it-out | architect는 설계를 정한 뒤 바로 구현합니다. figure-it-out은 큰 작업 하나를 위한 플레이북 전체를 설계합니다. |
| Babysit vs Shipping | Babysit은 merge-ready에서 멈춥니다. Shipping은 머지 요청이 있을 때만 검증된 PR을 머지합니다. |
| reflect vs correct | reflect는 대화의 교훈을 스킬 문서 수정으로 옮깁니다. correct는 반복되는 실수를 lint, 타입, 테스트로 막습니다. |

## 원칙 24개는 언제 쓰이나? {#principles}

원칙은 `principle-*` 스킬입니다. `/poteto-mode`가 판단할 때 읽고, 답변에서 "어떤 원칙이 어떤 결정을 바꿨는지" 밝힙니다.[](source:mode) 사용자가 직접 부를 일은 드뭅니다.

| 그룹 | 원칙 | 적용 시점 |
| --- | --- | --- |
| Core | laziness-protocol, foundational-thinking, redesign-from-first-principles, attack-the-premise, subtract-before-you-add, minimize-reader-load, outcome-oriented-execution, experience-first, exhaust-the-design-space, build-the-lever | 설계 방향과 변경 크기를 정할 때 |
| Architecture | model-the-domain, boundary-discipline, type-system-discipline, make-operations-idempotent, migrate-callers-then-delete-legacy-apis, separate-before-serializing-shared-state | 코드 구조와 타입을 짤 때 |
| Verification | prove-it-works, fix-root-causes, sequence-verifiable-units, test-behavior-not-implementation, explain-the-number | 완료를 선언하거나 수치를 보고할 때 |
| Delegation | guard-the-context-window, never-block-on-the-human | 서브에이전트에 넘기거나 사람에게 물을지 정할 때 |
| Meta | encode-lessons-in-structure | 같은 지시를 두 번째 쓰게 될 때 |

몇몇 원칙은 스킬과 짝을 이룹니다. explain-the-number는 benchmark-checklist로, encode-lessons-in-structure는 correct와 reflect로, exhaust-the-design-space는 arena로 실행됩니다.

@callout level=warning title="pstack 밖에 있는 의존 스킬"
`deslop`, `control-ui`, `control-cli`는 `cursor-team-kit` 플러그인에 있습니다. `tdd`도 pstack 밖의 스킬입니다.
`create-skill`, `/loop`, Custom Mode는 Cursor 기능입니다. 다른 도구에서는 이 단계가 동작하지 않을 수 있습니다.
