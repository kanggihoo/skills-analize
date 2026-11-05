# egm-draft 스킬은 에이전트를 어떻게 바꾸나 {#egm-draft-skill}

`egm-draft`를 쓰면 에이전트는 설계 문서를 한 번에 써서 채팅에 보여 주지 않는다. brief(앞 단계에서 만든 요약문)를 읽고, 문서를 절 단위로 `design_draft.md` 파일에 쓰고, 절마다 사용자 승인을 받은 뒤에 다음 절로 간다.[](source:dr-intro)[](source:dr-artifact)[](source:dr-gate-json) 모델이 스스로 켜지 못하고 사용자가 직접 불러야 켜진다.[](source:dr-fm) 이 페이지는 **부분 분석**이다. 의무 지시 파일 `resources/execution_instructions.md`가 스킬 폴더에 없어서 그 내용은 확인하지 못했다.[](source:dr-resources)

- 긴 결과물은 채팅에 붙이지 않고 파일에 쓴 뒤 경로와 요약만 알린다.[](source:dr-artifact)
- 설계 선택지가 여럿이면 선택지를 최대 3개까지 보여 주고 사용자가 고르게 한다. 에이전트는 순위나 기본값을 정하지 않는다.[](source:dr-author-decides)
- 문서를 저장하기 전에 brief와 초안이 서로 다르게 결정한 곳을 찾아 사용자에게 먼저 묻는다.[](source:dr-s6-recon)
- 설계 문서에 구현 코드를 쓰지 않는다. pseudocode, API, schema는 허용한다.[](source:dr-s5-nocode)

@answer scope="egm/egm-draft · 읽은 텍스트 6개 · 커밋 d494974 · 지시상 동작 · 실행 안 함 · 부분 분석"
@meta locale=ko
@source dr-fm title="egm/egm-draft/SKILL.md · 17479B · frontmatter" path=egm/egm-draft/SKILL.md lines=1:10
@source dr-ptr title="SKILL.md · host 통합 문서 먼저 읽기" path=egm/egm-draft/SKILL.md lines=14:15
@source dr-intro title="SKILL.md · 스킬 소개" path=egm/egm-draft/SKILL.md lines=17:18
@source dr-resources title="SKILL.md · 의무 지시 파일" path=egm/egm-draft/SKILL.md lines=22:23
@source dr-artifact title="SKILL.md · 파일 먼저 쓰기" path=egm/egm-draft/SKILL.md lines=24:30
@source dr-plain title="SKILL.md · 쉬운 영어 기준" path=egm/egm-draft/SKILL.md lines=31:36
@source dr-stress title="SKILL.md · 반박 우선과 칭찬·사과 금지" path=egm/egm-draft/SKILL.md lines=37:57
@source dr-interact title="SKILL.md · 질문 게이트 규칙" path=egm/egm-draft/SKILL.md lines=58:62
@source dr-author-decides title="SKILL.md · 저자가 구조를 정한다" path=egm/egm-draft/SKILL.md lines=63:71
@source dr-inputs title="SKILL.md · 입력 Context File" path=egm/egm-draft/SKILL.md lines=73:78
@source dr-flow-intro title="SKILL.md · 진행 원칙" path=egm/egm-draft/SKILL.md lines=80:85
@source dr-gate-order title="SKILL.md · 절 승인 게이트 순서" path=egm/egm-draft/SKILL.md lines=93:100
@source dr-caution title="SKILL.md · 빈 말풍선 금지" path=egm/egm-draft/SKILL.md lines=102:104
@source dr-gate-json title="SKILL.md · 절 승인 질문" path=egm/egm-draft/SKILL.md lines=106:119
@source dr-opt0 title="SKILL.md · 승인 선택지" path=egm/egm-draft/SKILL.md lines=121:125
@source dr-opt1 title="SKILL.md · 수정 요청 선택지" path=egm/egm-draft/SKILL.md lines=126:133
@source dr-empty title="SKILL.md · 빈 수정 요청 방어" path=egm/egm-draft/SKILL.md lines=134:139
@source dr-s1-ctx title="SKILL.md · 1단계 Context File" path=egm/egm-draft/SKILL.md lines=143:143
@source dr-prio title="SKILL.md · 1단계 입력 우선순위" path=egm/egm-draft/SKILL.md lines=144:160
@source dr-s1-verify title="SKILL.md · 1단계 확인과 합의" path=egm/egm-draft/SKILL.md lines=161:163
@source dr-author title="SKILL.md · 1단계 저자 정하기" path=egm/egm-draft/SKILL.md lines=164:166
@source dr-s2 title="SKILL.md · 2단계 개요·목표" path=egm/egm-draft/SKILL.md lines=168:184
@source dr-s3 title="SKILL.md · 3단계 기술 계획" path=egm/egm-draft/SKILL.md lines=186:199
@source dr-s4-read title="SKILL.md · 4단계 대안 읽기" path=egm/egm-draft/SKILL.md lines=203:206
@source dr-s4-rej title="SKILL.md · 4단계 기각 사유 표기" path=egm/egm-draft/SKILL.md lines=207:213
@source dr-s5-detail title="SKILL.md · 5단계 구현 계획 수준" path=egm/egm-draft/SKILL.md lines=225:229
@source dr-s5-files title="SKILL.md · 5단계 파일 목록" path=egm/egm-draft/SKILL.md lines=230:240
@source dr-s5-nocode title="SKILL.md · 5단계 코드 금지" path=egm/egm-draft/SKILL.md lines=241:242
@source dr-s6-intro title="SKILL.md · 6단계 시작 조건" path=egm/egm-draft/SKILL.md lines=254:255
@source dr-s6-recon title="SKILL.md · 6단계 brief와 대조" path=egm/egm-draft/SKILL.md lines=257:275
@source dr-s6-dir title="SKILL.md · 6단계 저장 위치 선택" path=egm/egm-draft/SKILL.md lines=277:304
@source dr-s6-site title="SKILL.md · 6단계 SITEMAP 등록" path=egm/egm-draft/SKILL.md lines=306:307
@source dr-s6-write title="SKILL.md · 6단계 문서 쓰기" path=egm/egm-draft/SKILL.md lines=309:312
@source dr-s6-fmt title="SKILL.md · 6단계 서식 정리" path=egm/egm-draft/SKILL.md lines=314:315
@source dr-s6-hand title="SKILL.md · 6단계 인계" path=egm/egm-draft/SKILL.md lines=317:321
@source dr-tpl-head title="egm/egm-draft/references/design_doc.md · 5432B · 설계 문서 템플릿" path=egm/egm-draft/references/design_doc.md lines=1:7
@source dr-tpl-open title="design_doc.md · Open Questions 절 주석" path=egm/egm-draft/references/design_doc.md lines=40:51
@source dr-tpl-impl title="design_doc.md · Detailed Implementation Plan과 Verification Plan" path=egm/egm-draft/references/design_doc.md lines=139:173
@source dr-tpl-prov title="design_doc.md · 출처 표시" path=egm/egm-draft/references/design_doc.md lines=175:177
@source dr-tests title="egm/egm-draft/test_scenarios.yaml · 8592B · 동작 검사 시나리오 10개" path=egm/egm-draft/test_scenarios.yaml lines=15:16
@source dr-t-author title="test_scenarios.yaml · 저자 이름 대체 검사" path=egm/egm-draft/test_scenarios.yaml lines=139:152
@source dr-t-choice title="test_scenarios.yaml · 저자 선택 위임 검사" path=egm/egm-draft/test_scenarios.yaml lines=49:68
@source dr-t-reconcile title="test_scenarios.yaml · 모순 보고 검사" path=egm/egm-draft/test_scenarios.yaml lines=124:137
@source dr-t-reject title="test_scenarios.yaml · 기각 사유 표기 검사" path=egm/egm-draft/test_scenarios.yaml lines=154:167
@source dr-testmd title="egm/egm-draft/TEST.md · 595B · 수동 검증 체크리스트" path=egm/egm-draft/TEST.md lines=9:14
@source dr-openai title="egm/egm-draft/agents/openai.yaml · 198B · 표시 이름과 한 줄 설명" path=egm/egm-draft/agents/openai.yaml lines=1:3
@source dr-icon title="egm/egm-draft/assets/icon.svg · 545B · 아이콘(지시 없음)" path=egm/egm-draft/assets/icon.svg
@source dr-bs-weighed title="egm/egm-brainstorm/SKILL.md · 14769B · r03 확인용(Alternatives Weighed)" path=egm/egm-brainstorm/SKILL.md lines=200:203
@source dr-bs-hand title="egm-brainstorm/SKILL.md · r01 확인용(egm-draft로 넘기는 안내)" path=egm/egm-brainstorm/SKILL.md lines=256:263
@source dr-rv-split title="egm/egm-review/SKILL.md · 24113B · r05 확인용(의미 경계 헤더)" path=egm/egm-review/SKILL.md lines=186:189
@source dr-rv-zoom title="egm-review/SKILL.md · r06 확인용(Stage 5)" path=egm/egm-review/SKILL.md lines=287:289
@source dr-drift-in title="egm/egm-drift-report/SKILL.md · 3169B · r21 확인용(입력 조건)" path=egm/egm-drift-report/SKILL.md lines=21:23

## 언제 켜지고 무엇을 받아야 시작하나 {#trigger}

@code source=dr-fm language=yaml

- `disable-model-invocation: true`가 있어서 모델은 이 스킬을 자동으로 켜지 않는다. 사용자가 스킬을 직접 불러야 한다.[](source:dr-fm)
- `description`은 이 스킬이 Elephant-Goldfish(EGM) 기능 흐름의 두 번째 단계이고, 요구사항과 해법을 맞춘 뒤 설계 문서를 쓸 때 쓴다고 적는다.[](source:dr-fm) 판정: 이 설명은 용도 안내이고, 특정 단어가 있으면 켜진다는 뜻이 아니다.
- 사용자가 입력하는 호출 형식은 host마다 다르다. 원문은 Claude Code와 agy CLI의 `/egm:<스킬 이름>` 형식과 Codex의 스킬 선택기를 예로 든다.[](source:dr-s6-hand) `egm-draft` 자신의 호출 형식은 원문에 명시 없음.
- brief가 없어도 시작은 막히지 않는다. 우선순위 3에서 채팅으로 묻는다.[](source:dr-prio)

입력은 `Context File` 하나이고 생략할 수 있다. 앞 단계 문서의 경로다.[](source:dr-inputs) 생략하면 에이전트가 아래 순서로 찾는다.

| 순위 | 찾는 것 | 동작 |
| --- | --- | --- |
| 지정 | `Context File` | 그 파일을 읽고 파싱한다[](source:dr-s1-ctx) |
| 1 | `concepts_brief.md`(`./`, 대화 artifact 폴더, `scratch/`) | 찾으면 읽는다[](source:dr-prio) |
| 2 | `discussion_summary.md`(같은 세 곳) | 1이 없을 때 읽는다. `egm-brainstorm`을 권하거나 폐기 경고를 하지 않는다[](source:dr-prio) |
| 3 | 둘 다 없음 | 문제, 목표, 기술 맥락을 채팅으로 묻거나 `egm-brainstorm` 시작을 제안한다[](source:dr-prio) |

- 파일을 읽은 뒤 에이전트는 시작 맥락이 맞는지 사용자에게 보여 주고, 초안을 시작해도 되는지 명시적 승인을 받는다.[](source:dr-s1-verify)
- 저자는 brief의 `Author`, 없으면 `git config user.name`, 그다음 `GIT_AUTHOR_NAME` 순으로 정한다. 셋 다 없으면 채팅으로 묻는다.[](source:dr-author)
- 정한 저자 이름은 문서 머리말에 기록한다.[](source:dr-author)
- 판정: 동작 검사 시나리오가 OS 로그인 이름이나 maintainers를 저자로 쓰지 못하게 막는다. 검사만 있고 실행하지 않았다.[](source:dr-t-author)

## 어떤 순서로 일하고 사람은 어디서 승인하나 {#flow}

@workflow id=draft-flow title="egm-draft 6단계와 승인 지점"
| lane prep | 준비 |
| lane write | 작성(절마다 승인) |
| lane done | 마무리 |
| ingest | 맥락 읽기 | backend | prep |
| start | 시작 승인? | external | prep |
| overview | 개요·목표 | backend | write |
| plan | 기술 계획 | backend | write |
| alt | 대안 | backend | write |
| impl | 구현 계획 | backend | write |
| recon | brief와 모순? | backend | done |
| decide | 모순마다 결정 | external | done |
| where | 저장 위치 확인 | external | done |
| save | 문서 저장 | backend | done |
| ingest > start | |
| start > overview | 승인 | emphasis |
| overview > plan | 승인 |
| plan > alt | 승인 |
| alt > impl | 승인 |
| impl > recon | 저장 요청 |
| recon > decide | 있음 | emphasis |
| recon > where | 없음 |
| decide > where | 결정 반영 |
| where > save | |

@steps id=draft-steps
| st-ingest | 맥락 읽기 | `Context File`이나 우선순위 순서로 brief를 읽고, 맞는 맥락인지 사용자에게 보여 주고, 저자를 정한다.[](source:dr-prio)[](source:dr-author) | draft-flow | ingest |
| st-start | 시작 승인? | 사용자가 명시적으로 합의해야 초안을 시작한다. 거절하면 어떻게 되는지는 원문에 명시 없음.[](source:dr-s1-verify) | draft-flow | start |
| st-overview | 개요·목표 | "The Problem", "Overview", "Goals", "Non-Goals"를 쓴다. 기술 구현보다 사용자 필요와 가치, 곧 이유를 앞세운다. 파일에 저장하고 `Overview & Goals` 승인 질문을 보인다.[](source:dr-s2) | draft-flow | overview |
| st-plan | 기술 계획 | brief의 구조를 읽고 새 구성요소, 바뀌는 파일, API 변경을 산문으로 쓴다. 데이터 흐름은 ASCII나 Mermaid 텍스트 다이어그램으로 그린다.[](source:dr-s3) | draft-flow | plan |
| st-alt | 대안 | brief의 `Alternatives Weighed`를 읽고 각 대안이 기각된 이유를 쓴다. 절이 없으면 사용자에게 어떤 대안을 왜 기각했는지 묻는다.[](source:dr-s4-read)[](source:dr-s4-rej) | draft-flow | alt |
| st-impl | 구현 계획 | 만들고 고치고 지우는 모든 파일을 한 목록에 쓰고, 파일마다 무엇을 왜 바꾸는지 적는다. 이 계획만 보고 구현해도 큰 결정이 남지 않을 만큼 자세히 쓴다.[](source:dr-s5-detail)[](source:dr-s5-files) | draft-flow | impl |
| st-recon | brief와 모순? | 저장 전에 1단계에서 읽은 brief와 초안을 대조한다. 선행 파일을 못 찾았으면 이 단계를 건너뛴다.[](source:dr-s6-recon) | draft-flow | recon |
| st-decide | 모순마다 결정 | 모순을 한 줄씩 보여 주고, 사용자가 하나씩 결정한다. 결정은 `design_draft.md`에 반영한 뒤 다음으로 간다.[](source:dr-s6-recon) | draft-flow | decide |
| st-where | 저장 위치 확인 | 저장할 폴더를 단일 선택 질문으로 확인한다.[](source:dr-s6-dir) | draft-flow | where |
| st-save | 문서 저장 | `<DESIGN_DIR>/<FEATURE>.md`를 쓰고, 서식을 정리하고, 링크와 함께 `egm-review` 시작을 권한다.[](source:dr-s6-write)[](source:dr-s6-fmt)[](source:dr-s6-hand) | draft-flow | save |

2~5단계는 모두 같은 절 승인 게이트를 거친다. 에이전트는 `design_draft.md`에 절을 쓴 같은 턴에 아래 순서를 지킨다.[](source:dr-gate-order)

1. 채팅에 먼저 글을 쓴다. 어느 절을 썼는지, 핵심 결정이나 추가 2~3개, `design_draft.md` 링크를 담는다(의무형 "MUST").
2. 같은 턴에 질문 하나를 단일 선택으로 보인다. 선택지는 "Approve [절] and proceed to next section"과 "Request revisions to [절]"이다.[](source:dr-gate-json)

글 없이 질문 도구만 호출하는 빈 말풍선은 금지다.[](source:dr-caution)

| 사용자 선택 | 에이전트 동작 |
| --- | --- |
| 승인 | 문서에 inline comment가 함께 있으면 먼저 반영하고, 없으면 바로 다음 절로 간다[](source:dr-opt0) |
| 수정 요청(write-in이나 comment 있음) | 둘을 함께 읽는다. 긍정 표시는 유지하고 부정 표시는 고치거나 지운다. 반영한 뒤 알리고 같은 게이트를 다시 보인다[](source:dr-opt1) |
| 수정 요청(write-in도 comment도 없음) | 반복하거나 실패하지 않고, 채팅으로 무엇을 고칠지 묻고 멈춘다[](source:dr-empty) |

- 사용자는 이전 단계로 돌아갈 수 있다. 에이전트는 사용자의 명시적 합의 없이 다음 단계로 건너뛰지 않는다.[](source:dr-flow-intro)
- 6단계는 사용자가 문서를 쓰거나 저장하라고 요청했을 때 적용하는 규칙이다.[](source:dr-s6-intro)
- 판정: 5단계 승인 뒤 에이전트가 6단계를 스스로 시작하는지는 원문에 명시 없음. 수정 요청을 몇 번까지 반복하는지도 원문에 명시 없음.

## 무엇을 강제하고 무엇을 금지하나 {#rules}

@facts id=draft-facts
| 승인 질문 | 질문 1개이고 그 턴의 유일한 tool call이다. 선택지에 `(Recommended)` 접두어를 쓰지 않는다(의무)[](source:dr-interact) |
| 채팅 요약에 담는 것 | 어느 절인지, 핵심 결정이나 추가 2~3개, 파일 링크(의무)[](source:dr-gate-order) |
| 설계 선택지 | 최대 3개. 순위, 기본값, 선택을 에이전트가 하지 않는다(의무)[](source:dr-author-decides) |
| 승인 게이트 | 2~5단계에서 절마다 보인다. 수정 요청이 오면 같은 게이트를 다시 보인다[](source:dr-gate-order)[](source:dr-opt1) |

| 규칙 | 에이전트가 하는 일 |
| --- | --- |
| 파일 먼저 | 초안, 요약, 계획, 검토 보고서를 채팅에 붙이지 않고 `design_draft.md`에 쓴다. 채팅에는 경로를 알리고 검토를 요청한다[](source:dr-artifact) |
| 쉬운 영어 | brief, 요약, 소통을 단순하고 직접적인 plain English로 쓴다. `seamless`, `robust`, `blazingly fast` 같은 근거 없는 홍보 형용사와 `seamlessly`, `effortlessly`, `literally`, `drastically`, `obviously` 같은 장식 부사를 쓰지 않는다. 한국어로 쓸 때 어떻게 적용하는지는 원문에 명시 없음[](source:dr-plain) |
| 반박 우선 | 동의를 기본값으로 두지 않는다. 약점, 엣지 케이스, 사각지대를 먼저 찾고, 강한 아이디어도 틀리거나 빠지거나 위험한 점을 먼저 말한다. 사용자의 주장을 반사적으로 되풀이하지 않는다. 전략마다 사용자가 못 보는 것과 가장 강한 반론을 정리하고, 엄격한 검토를 견딘 뒤에만 동의한다[](source:dr-stress) |
| 칭찬과 사과 금지 | 사용자의 입력, 정정, 결정에 "brilliant", "great", "smart", "correct", "perfect", "excellent", "spot-on"을 쓰지 않는다. "I apologize" 같은 사과도 하지 않고 바로잡은 기술 논리나 trade-off를 말한다[](source:dr-stress) |
| 저자가 구조를 정한다 | 방어 가능한 답이 둘 이상인 결정(데이터 모델, 구성요소 경계, 저장소, 프로토콜)은 선택지를 최대 3개 보인다. 선택지마다 메커니즘, trade-off, 실패하는 조건을 적고 단일 선택 게이트로 저자가 고르게 한다. 파일 이름이나 서식처럼 답이 하나뿐인 결정은 에이전트가 직접 한다[](source:dr-author-decides) |
| 대안 기각 표기 | 기각은 `Rejected by author: [기술적 이유]`로 쓴다. 상류 maintainer의 issue, discussion, PR URL을 인용할 때만 `Rejected by maintainer`를 쓴다[](source:dr-s4-rej) |
| 코드 금지 | 설계 문서에 구현 코드를 쓰지 않는다. pseudocode, API, schema는 허용한다[](source:dr-s5-nocode) |
| 의무 지시 파일 | `resources/execution_instructions.md`를 읽고 적용한다(의무형 "MUST"). 파일이 폴더에 없어서 내용은 확인하지 못했다[](source:dr-resources) |

- 저자가 "just pick one"이라고 말해도 에이전트는 고르지 않는다. trade-off를 다시 말하고 같은 게이트를 다시 보인다.[](source:dr-author-decides)
- 판정: 반복 횟수에 상한이 있다는 말은 원문에 명시 없음이라서, 저자가 계속 위임하면 같은 질문이 계속 돌 수 있다.
- 동작 검사 시나리오는 같은 요청을 두 번 해도 "I recommend" 같은 선택 표현이 나오지 않는지 정규식으로 검사한다. 검사만 있고 실행하지 않았다.[](source:dr-t-choice)

@callout level=warning title="질문 게이트 규칙끼리 겹치는 곳"
질문 게이트는 "질문 1개, 그 턴의 유일한 tool call"이어야 한다.[](source:dr-interact) 절 승인 게이트는 같은 턴에 채팅 글을 먼저 쓰라고 한다.[](source:dr-gate-order) 판정: 채팅 글은 tool call이 아니라서 둘은 함께 지킬 수 있다. 다만 원문이 이 점을 직접 풀어 쓰지는 않았다.

## 마지막에 무엇을 확인하고 무엇을 만드나 {#finalize}

6단계에서 에이전트는 먼저 초안을 1단계에서 읽은 brief와 대조한다. Zoom Out 기준으로 자기 초안을 채점하지는 않는다. 초안을 쓴 세션은 그 초안에 동의하기 때문이고, 그 점검은 `egm-review` Stage 5가 새 컨텍스트에서 맡는다.[](source:dr-s6-recon)[](source:dr-rv-zoom)

| 대조 결과 | 에이전트 동작 |
| --- | --- |
| 모순(brief가 정한 질문을 초안이 다르게 정함) | 전부 보고한다. 한 줄씩, brief와 초안을 인용해 적는다. 사용자가 하나씩 결정한다[](source:dr-s6-recon) |
| 추가(초안이 brief에 없던 질문을 정함) | 아키텍처, 외부 인터페이스, 의존성을 바꾸는 경우에만 보고한다[](source:dr-s6-recon) |
| 모순이 열려 있음 | 멈추고 사용자를 기다린다. 결정을 `design_draft.md`에 반영한 뒤에 저장 위치로 간다[](source:dr-s6-recon) |
| 차이 없음 | 한 줄로 그렇게 말한다[](source:dr-s6-recon) |

에이전트는 사용자 결정 없이 초안을 brief에 맞춰 바꾸지 않는다. 초안은 brainstorm이 읽지 않은 코드를 읽고 썼기 때문에 초안이 맞을 수 있다.[](source:dr-s6-recon) 동작 검사 시나리오는 brief가 PostgreSQL, 초안이 Spanner인 경우에 모순을 보고하고 저장 위치 질문을 미루는지 검사한다. 검사만 있고 실행하지 않았다.[](source:dr-t-reconcile)

대조가 끝나면 저장 위치를 정한다.

- 사용자가 폴더를 지정했으면 그 폴더를 쓴다.[](source:dr-s6-dir)
- 지정하지 않았으면 `Context File` 폴더, `docs/designs/`, `<project>/docs/designs/` 순으로 기존 설계 폴더를 찾아 `[DiscoveredPath]`(기본값 `docs/designs/`)로 묶는다.[](source:dr-s6-dir)
- 그리고 "Save to detected directory: [DiscoveredPath]"와 "Specify custom target directory" 중 하나를 고르게 한다.[](source:dr-s6-dir)
- 사용자 지정 경로를 고르고 경로를 비워 두면 채팅으로 경로를 묻고 멈춘다.[](source:dr-s6-dir)

| 만드는 것 | 언제 | 내용 |
| --- | --- | --- |
| `design_draft.md` | 2~5단계, 절마다 | 작업 중인 초안. 작업 폴더나 harness의 artifact 폴더에 쓴다[](source:dr-s2)[](source:dr-artifact) |
| `<DESIGN_DIR>/<FEATURE>.md` | 6단계 | `design_draft.md` 내용. 필요하면 템플릿 구조에 맞춰 조정한다[](source:dr-s6-write) |
| `<DESIGN_DIR>/SITEMAP.md` 항목 | 6단계, 그 파일이 이미 있을 때만 | 새 설계의 `Link`, `Date`, `Author`, `Components`, `Description` 항목을 등록한다[](source:dr-s6-site) |

- 에이전트는 설계 문서만 쓴다. 구현 코드는 쓰지 않는다.[](source:dr-s5-nocode)
- commit이나 push를 한다는 말은 원문에 명시 없음.
- 마지막 동작은 완성한 설계의 링크를 주고 `egm-review`를 `<DESIGN_PATH>`에 시작하라고 권하는 것이다. 이것이 종료 조건이다.[](source:dr-s6-hand)

설계 문서의 구조는 `references/design_doc.md` 템플릿이 정한다. 머리말은 `Author`, `Status`(`Draft`, `Proposed`, `In Review`, `Approved` 중 하나), `Date` 항목을 둔다.[](source:dr-tpl-head) 어느 단계가 어느 절을 쓰는지는 아래와 같다.

| 템플릿 절 | 쓰는 단계 |
| --- | --- |
| The Problem, Overview, Goals, Non-Goals | 2단계[](source:dr-s2) |
| Technical Plan (Architecture) | 3단계[](source:dr-s3) |
| Alternatives Considered | 4단계[](source:dr-s4-rej) |
| Detailed Implementation Plan(Target Files, Verification Plan) | 5단계. 5단계 제목은 "Detailed Implementation"이고 템플릿 제목은 `Detailed Implementation Plan`이다[](source:dr-s5-detail)[](source:dr-tpl-impl) |
| Open Questions, Critical User Journeys, Non-Functional Requirements, Additional Resources, Future Improvements | 원문에 명시 없음. 어느 단계도 이 절을 쓰라고 하지 않는다. Open Questions 주석은 답 없는 질문을 세션을 넘겨 남기라고 한다[](source:dr-tpl-open) |

판정: 템플릿의 `## Detailed Implementation Plan` 제목은 `egm-review` 3단계가 문서를 기능 명세와 구현 계획으로 가르는 헤더와 같다. 그래서 제목을 바꾸면 그 자동 분할이 흔들릴 수 있다.[](source:dr-rv-split) `Status`를 언제 바꾸는지, `Date`를 어떤 형식으로 쓰는지는 원문에 명시 없음.

## 흐름 속 위치 {#position}

이 스킬은 묶음 `idea-to-design`의 두 번째 단계다. 전체 흐름은 `egm/_group-idea-to-design/idea-to-design.html`에 있다.

@workflow id=draft-position title="idea-to-design 안의 위치"
| brainstorm | egm-brainstorm | backend |
| me | egm-draft(이 스킬) | security |
| review | egm-review | backend |
| brainstorm > me | r01·r02 넘김 | emphasis |
| me > review | r05 넘김 | emphasis |
| me > brainstorm | r04 제안 | dashed |

| 구분 | 관계(rel-id, 상대) | 종류 | 전달물·상태 | 조건·강도 |
| --- | --- | --- | --- | --- |
| 받는 것: brief | r01 `egm-brainstorm` | 넘김 | `concepts_brief.md` | 사용자가 4단계 선택지에서 `Proceed to egm-draft`를 고르면, brainstorm이 사용자에게 `egm-draft`를 시작하라고 안내한다. 에이전트가 직접 시작한다는 말은 원문에 명시 없음[](source:dr-bs-hand)[](source:dr-prio) |
| 받는 것: RFC 파일 | r02 `egm-brainstorm` | 넘김 | `docs/designs/<feature_name>.md` | 사용자가 RFC 게시를 고르면 팀 피드백 뒤 그 파일에 `egm-draft`를 시작할 수 있다고 상기시킨다. 시작은 사용자가 한다. 이 경로는 `Context File`로 쓸 수 있다[](source:dr-inputs)[](source:dr-bs-hand) |
| 받는 것: 대안 절 | r03 `egm-brainstorm` | 산출물 호환 | `Alternatives Weighed` 절 | brainstorm이 기각한 대안을 적고, 4단계가 그 절을 읽는다. 절이 없으면 사용자에게 묻는다[](source:dr-bs-weighed)[](source:dr-s4-read) |
| 넘기는 것: 설계 문서 | r05 `egm-review` | 넘김 | `<DESIGN_DIR>/<FEATURE>.md` | 6단계 마지막에 완성한 문서 링크를 주고 `egm-review` 시작을 권한다. 시작은 사용자가 한다[](source:dr-s6-hand) |
| 되돌리는 것: 제안 | r04 `egm-brainstorm` | 넘김 | - | 제안형. `Context File`도 `concepts_brief.md`도 `discussion_summary.md`도 없을 때만 `egm-brainstorm` 시작을 제안할 수 있다[](source:dr-prio) |

그림에서 뺀 관계는 아래와 같다.

| 구분 | 관계(rel-id, 상대) | 종류 | 전달물·상태 | 조건·강도 |
| --- | --- | --- | --- | --- |
| 참고: 초안 채점 | r06 `egm-review` | 참고 | - | draft는 Zoom Out 기준으로 자기 초안을 채점하지 않는다. 그 점검은 `egm-review` Stage 5가 새 컨텍스트에서 한다[](source:dr-s6-recon)[](source:dr-rv-zoom) |
| 공유 상태: 설계 폴더 | r07 `egm-brainstorm` | 공유 상태 | `docs/designs/`, `SITEMAP.md` | 둘 다 `docs/designs/`를 쓴다. brainstorm은 RFC 게시 때만, draft는 6단계 저장 때 쓴다. 둘 다 `SITEMAP.md`가 있으면 등록한다. 선후 관계는 없다[](source:dr-s6-dir)[](source:dr-s6-site) |
| 산출물 호환: drift | r21 `egm-drift-report` | 산출물 호환 | 설계 문서 디렉터리 | 근거 방식은 추론이다. draft가 저장하는 문서가 `egm-drift-report`의 입력 조건(설계 문서가 든 디렉터리)에 맞는다. 둘 다 서로를 부르지 않는다. 필수 순서는 아니다[](source:dr-s6-write)[](source:dr-drift-in) |
| 같은 계열: 공통 규칙 | r22 `egm-brainstorm`, r23 `egm-review` | 같은 계열 | - | 근거 방식은 추론이다. 세 스킬의 `Execution Constraints` 절이 같은 규칙 묶음이다[](source:dr-artifact)[](source:dr-stress) |
| 참고: 의무 지시 파일 | r24 `resources/execution_instructions.md` | 참고 | - | 의무형이다. 해석 상태는 불명이다. 파일이 스킬 폴더에 없다[](source:dr-resources) |

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: 텍스트 6개, 32,841B. `SKILL.md` 17,479B, `references/design_doc.md` 5,432B, `test_scenarios.yaml` 8,592B, `TEST.md` 595B, `agents/openai.yaml` 198B, `assets/icon.svg` 545B. 전부 끝까지 읽었다. 부분 읽음 파일은 없다.
- 제외한 파일: 없음. 번역본이 이 폴더에 없고, 바이너리도 없다. `assets/icon.svg`는 그림 데이터만 있고 지시가 없다.[](source:dr-icon)
- `agents/openai.yaml`은 표시 이름("EGM Draft")과 한 줄 설명("Write a design document section by section")만 담는다.[](source:dr-openai)
- `TEST.md`는 4단계와 6단계의 수동 검증 항목 두 개를 적는다. `pytest tests/unit`과 `TESTING.md`를 가리키는데 `TESTING.md`는 이 폴더에 없다.[](source:dr-testmd)
- `test_scenarios.yaml`은 정규식 검사 시나리오 10개다. `skill_file: "skills/egm-draft/SKILL.md"` 경로가 upstream 저장소 구조를 가리켜서 이 저장소에서는 그대로 열 수 없다.[](source:dr-tests) 어느 시나리오도 실행하지 않았다.
- 다른 스킬 줄 대조: `egm-brainstorm` 200~203, 256~263줄, `egm-review` 186~189, 287~289줄, `egm-drift-report` 21~23줄만 읽고 관계를 확인했다. 그 스킬 전체를 이 페이지 범위로 삼지는 않았다.
- 원문 비교: 원장 기준으로 다른 컬렉션에 같은 이름의 스킬이 없다.
- 실행하지 않았다. 질문, 파일 쓰기, 저장은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 분석 도중에는 바뀐 파일이 없다. 분석 시작 때 한 최신화(`git diff --stat HEAD~1 -- egm/egm-draft`)로 3개 파일이 바뀌었다. `SKILL.md` 25줄, `references/design_doc.md` 2줄, `test_scenarios.yaml` 42줄이고 합계 +53/−16줄이다. 바뀐 내용은 이렇다. 저자를 가리키는 말이 `Owner`에서 `Author`로 바뀌었다. 1단계에 저자 정하기가 새로 생겼다. 대안 기각을 `Rejected by author`로 쓰는 규칙이 생겼다. `egm-brainstorm`과 `egm-review`로 안내하는 문장이 host별 호출 형식 안내로 바뀌었다.

@callout level=open-question title="확인하지 못한 것"
`resources/execution_instructions.md`는 "MUST read and apply"라고 하는 의무 지시인데 스킬 폴더에 없다. 그래서 이 스킬의 동작 일부가 이 페이지에서 빠졌을 수 있다. upstream 저장소에 있는지는 확인하지 않았다.[](source:dr-resources)
일곱 스킬 공통으로 `docs/codex.md`와 `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`를 먼저 읽으라고 한다. 저장소에 `docs/`가 없어서 읽지 못했다.[](source:dr-ptr)
5단계 승인 뒤 6단계를 에이전트가 스스로 시작하는지, 시작 승인을 거절하면 어떻게 되는지, 수정 요청 반복에 상한이 있는지는 원문에 명시 없음.
템플릿의 Open Questions, Critical User Journeys, Non-Functional Requirements, Additional Resources, Future Improvements 절을 어느 단계가 쓰는지, `Status`와 `Date`를 언제 어떻게 채우는지는 원문에 명시 없음.
