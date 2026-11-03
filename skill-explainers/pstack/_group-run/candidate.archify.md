# pstack 작업 실행 묶음(run)은 어떻게 이어지나 {#run-group}

사용자가 `/poteto-mode`로 일을 맡기면 `poteto-mode`가 플레이북을 고르고, 조건에 맞는 스킬을 불러 쓴 뒤 정해진 형식으로 답한다. 나머지 네 스킬은 그 앞뒤를 맡는다.[](source:pm-pb)[](source:pm-triggers)

- 준비는 `setup-pstack`이 맡는다. 역할별 모델을 `~/.cursor/rules/pstack-models.mdc`에 쓰고, 다른 스킬은 이 파일을 읽는다.[](source:setup-write)[](source:pm-sub)
- `poteto-help`는 안내만 한다. 도움 질문에는 일을 시작하지 않고, 일을 시키는 메시지면 `poteto-mode` 아래에서 일한다.[](source:help-work)
- 크거나 여러 곳에 걸친 작업, 또는 맞는 플레이북이 없는 작업은 `figure-it-out`으로 넘어간다.[](source:pm-pb)
- 길거나 자율적인 작업은 `show-me-your-work`로 결정 기록을 남긴다.[](source:pm-smyw)

@answer scope="pstack/run 묶음 · 스킬 5개의 SKILL.md · 커밋 5760176 · 관계는 relations.md의 rel-id 기준"
@meta locale=ko
@source pm-fm title="pstack/poteto-mode/SKILL.md · 20559B · frontmatter" path=pstack/poteto-mode/SKILL.md lines=1:9
@source pm-cite title="pstack/poteto-mode/SKILL.md · 원칙 인용 규칙" path=pstack/poteto-mode/SKILL.md lines=13:15
@source pm-triggers title="pstack/poteto-mode/SKILL.md · Non-negotiables 트리거 목록" path=pstack/poteto-mode/SKILL.md lines=17:36
@source pm-how title="pstack/poteto-mode/SKILL.md · how 트리거" path=pstack/poteto-mode/SKILL.md lines=19:19
@source pm-model title="pstack/poteto-mode/SKILL.md · 데이터 모양 트리거" path=pstack/poteto-mode/SKILL.md lines=21:21
@source pm-arch title="pstack/poteto-mode/SKILL.md · architect 트리거" path=pstack/poteto-mode/SKILL.md lines=22:22
@source pm-fan title="pstack/poteto-mode/SKILL.md · swarm, arena 트리거" path=pstack/poteto-mode/SKILL.md lines=23:23
@source pm-int title="pstack/poteto-mode/SKILL.md · interrogate 트리거" path=pstack/poteto-mode/SKILL.md lines=24:24
@source pm-prose title="pstack/poteto-mode/SKILL.md · unslop, technical-writing 트리거" path=pstack/poteto-mode/SKILL.md lines=26:27
@source pm-outside title="pstack/poteto-mode/SKILL.md · deslop, control-cli, control-ui 트리거" path=pstack/poteto-mode/SKILL.md lines=28:30
@source pm-nocomm title="pstack/poteto-mode/SKILL.md · no-comments 트리거" path=pstack/poteto-mode/SKILL.md lines=29:29
@source pm-bench title="pstack/poteto-mode/SKILL.md · benchmark-checklist 트리거" path=pstack/poteto-mode/SKILL.md lines=31:31
@source pm-smyw title="pstack/poteto-mode/SKILL.md · show-me-your-work 트리거" path=pstack/poteto-mode/SKILL.md lines=36:36
@source pm-principles title="pstack/poteto-mode/SKILL.md · Principles 절 머리" path=pstack/poteto-mode/SKILL.md lines=38:40
@source pm-sub title="pstack/poteto-mode/SKILL.md · 서브에이전트 기본값과 규칙 파일" path=pstack/poteto-mode/SKILL.md lines=93:95
@source pm-reply title="pstack/poteto-mode/SKILL.md · Writing the reply" path=pstack/poteto-mode/SKILL.md lines=101:113
@source pm-pb title="pstack/poteto-mode/SKILL.md · Playbooks 절 머리, figure-it-out 경로" path=pstack/poteto-mode/SKILL.md lines=119:123
@source pm-pr title="pstack/poteto-mode/SKILL.md · Opening a PR 플레이북" path=pstack/poteto-mode/SKILL.md lines=147:147
@source pm-reflect title="pstack/poteto-mode/SKILL.md · 라우팅되는 워크플로 스킬 목록" path=pstack/poteto-mode/SKILL.md lines=93:93
@source help-fm title="pstack/poteto-help/SKILL.md · 12884B · frontmatter" path=pstack/poteto-help/SKILL.md lines=1:5
@source help-work title="pstack/poteto-help/SKILL.md · 도움 질문과 일 요청 구분" path=pstack/poteto-help/SKILL.md lines=9:11
@source help-state title="pstack/poteto-help/SKILL.md · 답을 바꾸는 상태 확인" path=pstack/poteto-help/SKILL.md lines=25:28
@source help-setup title="pstack/poteto-help/SKILL.md · 설치 안내, 자동 로드" path=pstack/poteto-help/SKILL.md lines=32:36
@source help-table title="pstack/poteto-help/SKILL.md · 상황별 스킬 표" path=pstack/poteto-help/SKILL.md lines=56:86
@source help-tdd title="pstack/poteto-help/SKILL.md · tdd 행" path=pstack/poteto-help/SKILL.md lines=70:70
@source help-notin title="pstack/poteto-help/SKILL.md · pstack 밖 스킬 안내" path=pstack/poteto-help/SKILL.md lines=99:103
@source setup-fm title="pstack/setup-pstack/SKILL.md · 5548B · frontmatter" path=pstack/setup-pstack/SKILL.md lines=1:4
@source setup-write title="pstack/setup-pstack/SKILL.md · 규칙 파일 쓰기" path=pstack/setup-pstack/SKILL.md lines=8:8
@source setup-rule title="pstack/setup-pstack/SKILL.md · Step 5 규칙 쓰기" path=pstack/setup-pstack/SKILL.md lines=39:39
@source setup-roles title="pstack/setup-pstack/SKILL.md · 역할 줄" path=pstack/setup-pstack/SKILL.md lines=49:65
@source setup-confirm title="pstack/setup-pstack/SKILL.md · Step 6 새 세션 적용" path=pstack/setup-pstack/SKILL.md lines=68:70
@source setup-offer title="pstack/setup-pstack/SKILL.md · Step 7 검증 스킬 제안" path=pstack/setup-pstack/SKILL.md lines=72:74
@source fio-fm title="pstack/figure-it-out/SKILL.md · 4059B · frontmatter" path=pstack/figure-it-out/SKILL.md lines=1:5
@source fio-start title="pstack/figure-it-out/SKILL.md · Start" path=pstack/figure-it-out/SKILL.md lines=11:13
@source fio-arch title="pstack/figure-it-out/SKILL.md · architect 실행 조건" path=pstack/figure-it-out/SKILL.md lines=30:30
@source fio-log title="pstack/figure-it-out/SKILL.md · Phase D 기록" path=pstack/figure-it-out/SKILL.md lines=45:47
@source fio-reply title="pstack/figure-it-out/SKILL.md · Reply" path=pstack/figure-it-out/SKILL.md lines=53:53
@source fio-principles title="pstack/figure-it-out/SKILL.md · 원칙 참고 줄" path=pstack/figure-it-out/SKILL.md lines=19:51
@source help-prove title="pstack/poteto-help/SKILL.md · 초록 빌드 증상" path=pstack/poteto-help/SKILL.md lines=133:133
@source inv-nopr title="pstack/poteto-mode/playbooks/investigation.md · 928B · PR 없음" path=pstack/poteto-mode/playbooks/investigation.md lines=12:12
@source hc-log title="pstack/poteto-mode/playbooks/hillclimb.md · 4403B · decision.tsv 칸" path=pstack/poteto-mode/playbooks/hillclimb.md lines=9:9
@source smyw-encode title="pstack/show-me-your-work/SKILL.md · 원칙 참고" path=pstack/show-me-your-work/SKILL.md lines=53:53
@source smyw-fm title="pstack/show-me-your-work/SKILL.md · 6418B · frontmatter" path=pstack/show-me-your-work/SKILL.md lines=1:5
@source smyw-where title="pstack/show-me-your-work/SKILL.md · 로그 위치" path=pstack/show-me-your-work/SKILL.md lines=44:48
@source smyw-attn title="pstack/show-me-your-work/SKILL.md · Attention 절" path=pstack/show-me-your-work/SKILL.md lines=74:74
@source smyw-compose title="pstack/show-me-your-work/SKILL.md · 다른 스킬과 엮기" path=pstack/show-me-your-work/SKILL.md lines=80:82

## 어떤 순서로 이어지나 {#flow}

@workflow id=run-flow title="run 묶음 흐름"
| setup | setup-pstack | backend |
| help | poteto-help | frontend |
| mode | poteto-mode | backend |
| pb | 플레이북 | backend |
| fio | figure-it-out | backend |
| log | 결정 기록 | database |
| setup > mode | 모델 규칙 | dashed |
| help > mode | 일 요청 | |
| mode > pb | 맞음 | emphasis |
| mode > fio | 크거나 없음 | |
| pb > log | 긴 작업 | |
| fio > log | 기록 | |

@steps id=run-steps
| s-setup | setup-pstack | 역할마다 모델을 정해 규칙 파일 하나에 쓴다. 이 파일은 새 채팅부터 적용된다. | run-flow | setup |
| s-help | poteto-help | 도움 질문이면 답과 보낼 프롬프트만 준다. 일을 시키는 메시지면 `poteto-mode`를 읽고 그 아래에서 일한다. | run-flow | help |
| s-mode | poteto-mode | 작업을 플레이북에 맞춘다. 크거나 여러 곳에 걸친 작업, 자리를 비운 뒤 검토할 작업, 맞는 플레이북이 없는 작업은 `figure-it-out`으로 보낸다. 여러 날짜에 걸친 프로그램은 Orchestrate 플레이북으로 보낸다. | run-flow | mode |
| s-pb | 플레이북 | 단계를 할 일 목록 맨 앞에 그대로 복사해 차례로 실행한다. 하지 않는 단계는 `skip: <이유>`로 남긴다. Non-negotiables 조건이 맞으면 해당 스킬을 실행하고, 끝나면 이 단계로 돌아온다. | run-flow | pb |
| s-fio | figure-it-out | 이 작업만을 위한 플레이북을 설계하고, 단계마다 가설을 세워 확인하며 실행한다. | run-flow | fio |
| s-log | 결정 기록 | `show-me-your-work`가 결정마다 TSV 한 줄을 남긴다. 길거나 자율적인 작업, 사용자가 자리를 비우는 작업이 대상이다. 위험이 크면 커밋하고, 아니면 로컬에 둔다. | run-flow | log |

그림에는 마지막 답변 단계를 넣지 않았다. 모든 플레이북은 `poteto-mode`의 답변 규칙대로 쓴 답변으로 끝난다.[](source:pm-reply)

Opening a PR 플레이북은 다른 모든 플레이북의 끝에서 실행된다.[](source:pm-pr) `figure-it-out`도 설계한 플레이북과 기록 경로를 답변에 담는다.[](source:fio-reply) 결정 기록이 있는 실행의 답변은 Attention 절로 끝난다.[](source:smyw-attn)

각 스킬의 내부 단계는 `pstack/poteto-mode/poteto-mode.html`, `pstack/figure-it-out/figure-it-out.html`, `pstack/show-me-your-work/show-me-your-work.html`에 있다.

## 어떤 조건에서 어떤 스킬을 부르나 {#triggers}

`poteto-mode`의 Non-negotiables 목록은 "조건 → 스킬" 꼴이다. 화살표는 의무형 지시다.[](source:pm-triggers) 불린 스킬은 일을 마치면 플레이북 단계로 돌아온다. 위 그림에서는 이 관계를 모두 "플레이북" 노드 안에 넣었다.

| rel-id | 조건 | 부르는 스킬 | 종류 | 그림 |
| --- | --- | --- | --- | --- |
| r01 | 사소하지 않은 변경, 아키텍처 결정, "정말 확실해?"[](source:pm-how) | `how` | 내부 위임 | 플레이북 노드에 포함 |
| r13 | 코드를 쓸 때. 먼저 데이터 모양을 정한다[](source:pm-model) | `principle-model-the-domain` | 참고 | 플레이북 노드에 포함 |
| r02 | 함수 경계를 넘는 코드. 구현 전에 병렬 설계 탐색[](source:pm-arch) | `architect` | 내부 위임 | 플레이북 노드에 포함 |
| r03 | 병렬로 나눠 돌리기(커버리지, 경주, 관문, 탐색 분할)[](source:pm-fan) | `swarm` | 내부 위임 | 플레이북 노드에 포함 |
| r04 | 설계나 코드의 경합(기반 후보 고르기, 접붙이기)[](source:pm-fan) | `arena` | 내부 위임 | 플레이북 노드에 포함 |
| r05 | 설계에 이견이 있을 때, 출시 전[](source:pm-int) | `interrogate` | 내부 위임 | 플레이북 노드에 포함 |
| r06 | 모든 산문. 답변도 산문이다[](source:pm-prose) | `unslop` | 내부 위임 | 플레이북 노드에 포함 |
| r07 | 문서, RFC, README, PR 설명, 커밋 메시지[](source:pm-prose) | `technical-writing` | 내부 위임 | 플레이북 노드에 포함 |
| r08 | 리뷰 전[](source:pm-nocomm) | `no-comments` | 내부 위임 | 플레이북 노드에 포함 |
| r09 | 직접 잰 성능 수치를 보고하거나 그에 따라 움직이기 전[](source:pm-bench) | `benchmark-checklist` | 내부 위임 | 플레이북 노드에 포함 |
| r10 | 길거나 자율적이거나 여러 단계인 작업, 사용자가 자리를 비우는 작업[](source:pm-smyw) | `show-me-your-work` | 내부 위임 | 결정 기록 노드 |
| r16 | 커밋 전, 에이전트용 글, UI·CLI 출시[](source:pm-outside) | `deslop`, `create-skill`, `control-cli`, `control-ui` | 내부 위임(범위 밖) | 생략 |
| r12 | 원칙을 적용할 때. 그 원칙의 `SKILL.md`를 끝까지 읽고, 읽은 원칙만 인용한다[](source:pm-cite)[](source:pm-principles) | `principle-*` 24개 | 참고 | 생략 |
| r15 | 라우팅되는 워크플로 스킬 목록에 이름만 있다[](source:pm-reflect) | `reflect` | 미확인 | 생략 |

r10의 강도는 원문 그대로 옮긴다. 위험이 커서 감사할 기록이 필요하면 커밋하고, 그렇지 않으면 로컬에 둔다.[](source:pm-smyw) 원칙 24개의 조건은 `pstack/_group-principles/principles.html`에 있다.

## 같은 묶음 안에서 주고받는 것 {#handoffs}

| rel-id | from → to | 종류 | 조건 | 주고받는 것 | 그림 |
| --- | --- | --- | --- | --- | --- |
| r14 | `setup-pstack` → `poteto-mode` | 공유 상태 | 규칙 파일의 역할 줄이 서브에이전트 모델 기본값을 덮어쓴다[](source:pm-sub)[](source:setup-rule) | 역할별 모델 | 모델 규칙 간선 |
| r20 | `poteto-help` → `poteto-mode` | 넘김 | 도움 질문이 아니라 일을 시키는 메시지일 때. 도움 질문이면 일을 시작하지 않는다[](source:help-work) | 사용자 요청 | 일 요청 간선 |
| r11 | `poteto-mode` → `figure-it-out` | 넘김 | 크거나 여러 곳에 걸친 작업, 자리 비운 뒤 검토할 작업. 좁은 플레이북이 맞아도 넘긴다. 맞는 플레이북이 없을 때도 넘긴다[](source:pm-pb) | 과제 → 맞춤 플레이북 | 크거나 없음 간선 |
| r70 | `figure-it-out` → `show-me-your-work` | 내부 위임 | 실행 기록을 남긴다. 보통 커밋해서 PR에서 읽게 한다[](source:fio-log) | 결정 → 기록 | 기록 간선 |
| r68 | `figure-it-out` → `poteto-mode` | 참고 | 할 일 목록 첫 항목이 `poteto-mode`의 Principles 절 읽기다(의무형)[](source:fio-start) | - | 생략 |
| r21 | `poteto-help` → `setup-pstack` | 참고 | 설치 안내 2단계. 규칙 파일이 없으면 모든 역할이 기본 모델을 쓴다고 알린다[](source:help-setup)[](source:help-state) | - | 생략 |

`show-me-your-work`는 다른 스킬이 결정 기록을 따로 만들지 말고 이 스킬에 맡기라고 적는다.[](source:smyw-compose) 로그는 기본적으로 커밋하지 않는 작업 파일이다. 감사할 기록이 필요할 만큼 큰 작업일 때만 커밋한다.[](source:smyw-where)

## 묶음 밖으로 나가는 관계(그림에서 생략) {#outbound}

| rel-id | from → to | 종류 | 조건 | 다루는 페이지 |
| --- | --- | --- | --- | --- |
| r69 | `figure-it-out` → `architect` | 내부 위임 | 되돌리기 어려운 설계 결정일 때. 모양이 정해진 기계적 작업이면 건너뛴다[](source:fio-arch) | `pstack/_group-design-review/design-review.html` |
| r71 | `figure-it-out` → `principle-laziness-protocol` | 참고 | 정해진 설계에 `arena`를 또 돌리는 것은 과설계라는 근거[](source:fio-arch) | `pstack/_group-principles/principles.html` |
| r113 | `figure-it-out` → 원칙 6개(`prove-it-works`, `never-block-on-the-human`, `foundational-thinking`, `separate-before-serializing-shared-state`, `sequence-verifiable-units`, `encode-lessons-in-structure`) | 참고 | 맞춤 플레이북 설계 단계별 근거[](source:fio-principles) | `pstack/_group-principles/principles.html` |
| r114 | `show-me-your-work` → `principle-encode-lessons-in-structure` | 참고 | 손으로 만든 근거보다 커밋된 스크립트가 만든 근거를 쓴다[](source:smyw-encode) | `pstack/_group-principles/principles.html` |
| r119 | `poteto-help` → `principle-prove-it-works` | 참고 | "초록 빌드로 성공을 주장"하는 증상의 처방[](source:help-prove) | `pstack/_group-principles/principles.html` |
| r37 | `setup-pstack` → `create-verification-skill` | 넘김 | 앱을 직접 돌릴 수단이 없으면 한 번만 제안. 예면 실행, 아니면 넘어간다[](source:setup-offer) | `pstack/_group-verify-harness/verify-harness.html` |
| r22 | `poteto-help` → 형제 스킬 25개 | 참고 | "상황 → 스킬" 표. 27줄 중 자기 자신과 폴더 없는 `/tdd`를 빼면 25개다. 추천 전에 그 스킬을 읽는다[](source:help-table) | `pstack/poteto-help/poteto-help.html` |
| r23 | `poteto-help` → `tdd` | 참고(불명) | 표에 링크가 있으나 `pstack/tdd/` 폴더가 없다[](source:help-tdd) | `pstack/poteto-help/poteto-help.html` |
| r24 | `poteto-help` → `create-verification-skill` | 참고 | `verify-*` 스킬이 없고 질문이 "변경이 동작함을 증명"일 때만 언급[](source:help-state) | `pstack/_group-verify-harness/verify-harness.html` |
| r25 | `poteto-help` → `deslop`, `control-cli`, `control-ui`, `loop`, `create-skill` | 참고(범위 밖) | pstack 밖 스킬이라고 안내[](source:help-notin) | `pstack/poteto-help/poteto-help.html` |

## 공유 상태 {#shared-state}

| 파일 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `~/.cursor/rules/pstack-models.mdc` | `setup-pstack`. 실행할 때마다 파일 전체를 덮어쓴다[](source:setup-rule) | `poteto-mode`(r14). 이 묶음 밖에서는 `how`, `why`, `arena`, `swarm`, `architect`, `interrogate`, `reflect`(r30~r36)[](source:pm-sub)[](source:setup-roles) |
| 같은 파일(있는지만 확인) | - | `poteto-help`. 없으면 `/setup-pstack`을 아직 돌리지 않았다고 본다(r21)[](source:help-state) |

규칙 파일에서 한 역할의 줄이 없으면 그 역할은 기본 모델을 쓴다. 값이 `inherit-parent`나 `auto`면 부모 채팅 모델로 돌린다.[](source:pm-sub) 규칙은 새 세션부터 적용된다.[](source:setup-confirm)

## 언제 켜지고, 언제 켜지지 않나 {#activation}

| 스킬 | 켜지는 방식 |
| --- | --- |
| `setup-pstack` | `disable-model-invocation`이 없다. 사용자 말만으로 켜질 수 있다[](source:setup-fm)[](source:help-setup) |
| `poteto-mode` | `disable-model-invocation: true`, `mode: true`. 사용자가 `/poteto-mode`를 입력하거나 모드로 켠다[](source:pm-fm) |
| `poteto-help`, `figure-it-out`, `show-me-your-work` | `disable-model-invocation: true`. 사용자가 이름을 입력하거나 다른 스킬이 부를 때 켜진다[](source:help-fm)[](source:fio-fm)[](source:smyw-fm) |

`poteto-mode`의 `reminder` 필드는 가벼운 대화나 사용자가 원하지 않는 턴에는 적용하지 말라고 적는다.[](source:pm-fm) `poteto-help`는 도움 질문에 일을 시작하지 않는다. pstack 실행에 토큰이 많이 들기 때문이다.[](source:help-work)

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/poteto-mode/SKILL.md`, `pstack/poteto-help/SKILL.md`, `pstack/setup-pstack/SKILL.md`, `pstack/figure-it-out/SKILL.md`, `pstack/show-me-your-work/SKILL.md`. 다섯 파일 모두 원본이다.
- 읽지 않은 파일: `poteto-mode/playbooks/*.md`(충돌 확인용 두 줄 제외), `references/`, `scripts/`. 플레이북 단계는 `pstack/poteto-mode/poteto-mode.html`이 다룬다. 이 페이지는 스킬 사이의 연결만 다룬다.
- 제외한 파일: `*.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: r01~r16, r20~r25, r37, r68~r71, r113, r114, r119의 출처 줄을 원문과 대조했다. 종류와 조건이 원장과 같다.
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`reflect`는 라우팅되는 워크플로 스킬 목록에 이름만 있고 호출 조건이 없다(r15). `poteto-mode`가 언제 `reflect`를 부르는지는 원문에 명시 없음.
`figure-it-out`과 일반 플레이북이 같은 트리거 목록을 따르는지는 원문에 명시 없음. 판정: `figure-it-out`은 첫 할 일로 `poteto-mode`의 Principles 절만 읽게 한다. 그래서 Non-negotiables까지 적용되는지는 알 수 없다.[](source:fio-start)

@callout level=warning title="원문끼리 충돌하는 곳"
`poteto-mode`는 Opening a PR 플레이북이 다른 모든 플레이북의 끝에서 실행된다고 적는다.[](source:pm-pr) 그런데 investigation 플레이북은 "PR 없음"이라고 적는다.[](source:inv-nopr) 어느 쪽이 우선인지는 원문에 명시 없음.
`show-me-your-work`는 다른 스킬이 기록 칸을 다시 적지 말라고 한다.[](source:smyw-compose) hillclimb 플레이북은 `decision.tsv`에 자기 칸을 따로 정한다.[](source:hc-log) 이것도 우선순위가 원문에 명시 없음.
