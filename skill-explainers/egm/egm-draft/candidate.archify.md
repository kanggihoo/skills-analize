# egm-draft — 설계 문서를 절마다 승인받으며 쓰는 스킬 {#overview}

`egm-draft`는 앞 단계의 요약문을 읽고, 에이전트가 설계 문서를 절마다 파일에 쓰고 사용자 승인을 받게 한다.[](source:intro) **부분 분석**이다. 원문이 먼저 읽으라는 `docs/codex.md`, `docs/claude.md`, `resources/execution_instructions.md`가 저장소에 없어 내용을 확인하지 못했다.

- 사용자가 요구사항과 해결책을 맞춘 뒤 설계 문서를 쓰려 할 때 쓴다. 입력은 `concepts_brief.md`, `discussion_summary.md`, 채팅 순서로 찾는다.[](source:fm)[](source:s1)
- 결과는 `design_draft.md`와, 최종 승인 뒤 `<DESIGN_DIR>/<FEATURE>.md`로 저장한 설계 문서다.[](source:s6)
- 다음 안내: 문서를 저장하면 `egm-review`로 점검하라고 권한다(다음 안내). 입력이 없으면 `egm-brainstorm`을 제안한다(다음 안내).[](source:s6)
- 하지 않는 것: 긴 초안을 채팅에 붙이지 않고, 구현 코드를 쓰지 않고, 선택지를 대신 고르지 않는다.[](source:cons)[](source:s5)

@answer scope="egm/egm-draft · 원본 파일 6개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: 이름·호출 제한·description" path=egm/egm-draft/SKILL.md lines=1:10
@source intro title="스킬 소개와 먼저 읽을 외부 문서" path=egm/egm-draft/SKILL.md lines=12:18
@source cons title="Execution Constraints 13개" path=egm/egm-draft/SKILL.md lines=20:71
@source inputs title="입력: Context File" path=egm/egm-draft/SKILL.md lines=73:78
@source wf title="진행 규칙: 순서와 되돌아가기" path=egm/egm-draft/SKILL.md lines=80:85
@source gate title="절 승인 지점 형식" path=egm/egm-draft/SKILL.md lines=87:139
@source s1 title="1단계: 선행 문서 읽기" path=egm/egm-draft/SKILL.md lines=141:166
@source s2 title="2단계: 개요·목표" path=egm/egm-draft/SKILL.md lines=168:184
@source s3 title="3단계: 기술 계획" path=egm/egm-draft/SKILL.md lines=186:199
@source s4 title="4단계: 대안" path=egm/egm-draft/SKILL.md lines=201:221
@source s5 title="5단계: 구현 계획" path=egm/egm-draft/SKILL.md lines=223:250
@source s6 title="6단계: 대조·저장·인계" path=egm/egm-draft/SKILL.md lines=252:321
@source s6a title="6단계 1번: 모순 대조" path=egm/egm-draft/SKILL.md lines=257:275
@source tmpl title="설계 문서 템플릿" path=egm/egm-draft/references/design_doc.md lines=1:177
@source test title="점검 체크리스트" path=egm/egm-draft/TEST.md lines=1:14
@source scen title="행동 평가 시나리오" path=egm/egm-draft/test_scenarios.yaml lines=15:167
@source oai title="표시 메타데이터" path=egm/egm-draft/agents/openai.yaml lines=1:6

## 어떻게 동작하나 {#flow span=12}

절차형이다. 1단계에서 입력을 읽고, 2~5단계에서 절을 하나씩 쓰며, 6단계에서 대조하고 저장한다.[](source:s1)

그림에 없는 되돌림이 있다. 절마다 사람 승인 지점이 있고, 사용자가 수정을 요청하면 같은 절을 고쳐 다시 묻는다. 앞 단계로 돌아가는 것도 허용한다.[](source:wf) 수정 요청에 코멘트도 글도 없으면 반복하지 않고 채팅으로 무엇을 고칠지 묻는다.[](source:gate)

@workflow id=flow-diagram title="egm-draft 흐름"
| lane intake | 입력 읽기 |
| lane sections | 절 쓰기 |
| lane finalize | 대조와 저장 |
| ingest | 선행 문서 읽기 | backend | intake | source:s1 |
| overview | 개요·목표 | backend | sections | source:s2 |
| plan | 기술 계획 | backend | sections | source:s3 |
| alts | 대안 | backend | sections | source:s4 |
| impl | 구현 계획 | backend | sections | source:s5 |
| recon | 모순 있나? | backend | finalize | source:s6a |
| decide | 사용자 결정 | external | finalize | source:s6a |
| save | 저장과 인계 | backend | finalize | source:s6 |
| ingest > overview | 시작 승인 |
| overview > plan | 절 승인 |
| plan > alts | 절 승인 |
| alts > impl | 절 승인 |
| impl > recon | 절 승인 |
| recon > save | 없음 |
| recon > decide | 있음 |
| decide > save | 결정 반영 |

@steps id=flow-steps
| s-ingest | 선행 문서 읽기 | **입력** `Context File` 또는 작업 폴더의 요약문 · **참조** `concepts_brief.md`, `discussion_summary.md` · **출력** 확인받은 맥락과 작성자 이름. **처리** 에이전트가 요약문을 우선순위 순서로 찾아 읽고, 작성자를 `Author` 필드, `git config user.name`, `GIT_AUTHOR_NAME` 순서로 정한다.[](source:s1) **다음** 둘 다 없으면 채팅으로 문제·목표를 묻거나 `egm-brainstorm` 시작을 제안한다. 작성자도 못 정하면 채팅으로 묻는다. 초안 작성 전에 사용자의 명시적 동의가 필요하다. | flow-diagram | ingest |
| s-overview | 개요·목표 | **입력** 선행 맥락 · **참조** `references/design_doc.md` · **출력** `design_draft.md`의 "The Problem", "Overview", "Goals", "Non-Goals". **처리** 기술 구현보다 사용자 필요와 가치를 앞세워 첫 절을 파일에 쓴다.[](source:s2) **다음** 채팅에 초안을 붙이지 않고 경로만 알린 뒤 승인 질문을 한다. | flow-diagram | overview |
| s-plan | 기술 계획 | **입력** 선행 맥락의 구조와 해결책 · **출력** `design_draft.md`의 "Technical Plan". **처리** 새 구성 요소, 바뀌는 파일, API 변경을 산문으로 쓰고 데이터 흐름은 텍스트 다이어그램으로 그린다.[](source:s3) **다음** 승인 질문은 채팅 요약을 먼저 쓴 뒤 하나만 던진다. | flow-diagram | plan |
| s-alts | 대안 | **입력** 요약문의 `Alternatives Weighed` 절 · **출력** `design_draft.md`의 "Alternatives Considered". **처리** 기각한 대안마다 기각 이유를 쓰고, 저자 결정은 `Rejected by author: [technical rationale]`로 적는다.[](source:s4) **다음** 그 절이 없으면 사용자에게 어떤 대안을 왜 기각했는지 묻는다. 상위 maintainer 이슈·토론·PR URL을 인용하지 않으면 `Rejected by maintainer`라고 쓰지 않는다. | flow-diagram | alts |
| s-impl | 구현 계획 | **입력** 앞 절들 · **출력** `design_draft.md`의 "Detailed Implementation". **처리** 바뀌거나 만들거나 지울 파일을 모두 나열하고 파일마다 무엇을 왜 바꾸는지 적는다.[](source:s5) **다음** 코드는 쓰지 않는다. 의사코드, API, schema는 허용한다. | flow-diagram | impl |
| s-recon | 모순 있나? | **입력** 1단계의 선행 문서와 `design_draft.md` · **출력** 모순 목록 또는 "차이 없음" 한 줄. **처리** 요약문이 결정한 질문을 초안이 다르게 결정했는지 대조한다. 요약문이 안 다룬 결정은 구조, 외부 인터페이스, 의존성을 바꿀 때만 보고한다.[](source:s6a) **다음** Zoom Out 기준으로 자기 초안을 채점하지 않는다. 1단계에 선행 파일이 없었으면 이 대조를 건너뛴다. | flow-diagram | recon |
| s-decide | 사용자 결정 | **입력** 모순 목록(요약문 인용과 초안 인용을 한 줄씩) · **출력** 항목별 사용자 결정. **처리** 열린 모순마다 사용자에게 묻고, 답에 따라 `design_draft.md`를 고친다.[](source:s6a) **다음** 열린 모순이 있으면 멈추고 기다린다. 요약문에 맞추려고 초안을 임의로 바꾸지 않는다. | flow-diagram | decide |
| s-save | 저장과 인계 | **입력** 승인된 `design_draft.md` · **참조** `references/design_doc.md`, `<DESIGN_DIR>/SITEMAP.md` · **출력** `<DESIGN_DIR>/<FEATURE>.md`와 `egm-review` 안내. **처리** 저장 폴더를 사용자 지정, 없으면 `docs/designs/` 계열을 찾아 단일 선택으로 확인받고 문서를 쓴다.[](source:s6) **다음** `SITEMAP.md`가 있으면 항목을 등록한다. 마지막에 링크와 함께 `egm-review <DESIGN_PATH>` 시작을 권한다. | flow-diagram | save |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자가 스킬 이름으로 직접 부른다. `disable-model-invocation: true`라서 모델이 `description`만 보고 스스로 켜지 않는다.[](source:fm) |
| 성격 | 선행 요약문을 바탕으로 설계 문서를 절 단위로 쓰고 승인받는 절차형 스킬이다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| egm-brainstorm {#r01} | **이 스킬** | 다음 안내 | brainstorm 마지막 선택지에서 사용자가 `Proceed to egm-draft`를 고르면, brainstorm이 `egm-draft` 시작을 안내한다. 이 스킬은 `concepts_brief.md`를 우선순위 1 입력으로 읽는다.[](source:s1) |
| egm-brainstorm {#r02} | **이 스킬** | 다음 안내 | 사용자가 RFC 게시를 고르면 `docs/designs/<feature_name>.md`에 쓰고, 팀 피드백 뒤 그 파일로 `egm-draft`를 시작할 수 있다고 상기시킨다. 시작은 사용자가 한다.[](source:inputs) |
| egm-brainstorm {#r03} | **이 스킬** | 결과 전달 | brainstorm의 `Alternatives Weighed` 절이 4단계 입력이다. 절이 없으면 사용자에게 묻는다.[](source:s4) |
| egm-brainstorm {#r07} | **이 스킬** | 같은 파일 | 둘 다 `docs/designs/`와 `SITEMAP.md`를 쓴다. 선후 관계는 없다. 이 스킬은 저장 폴더를 사용자에게 확인받는다.[](source:s6) |
| egm-brainstorm {#r22} | **이 스킬** | 대안 | 두 스킬의 Execution Constraints가 같은 규칙 묶음이다. 두 본문을 비교한 판정이다(추론).[](source:cons) |
| **이 스킬** {#r04} | egm-brainstorm | 다음 안내 | 제안형이다. `Context File`도 두 요약문도 없을 때만 `egm-brainstorm` 시작을 제안한다. `discussion_summary.md`를 읽는 경우에는 권하지 않는다.[](source:s1) |
| **이 스킬** {#r05} | egm-review | 다음 안내 | 6단계 끝에 완성한 설계 문서 링크를 주고 `egm-review`를 `<DESIGN_PATH>`에 시작하라고 권한다. 시작은 사용자가 한다.[](source:s6) |
| **이 스킬** {#r06} | egm-review | 참고 | 6단계는 Zoom Out 기준으로 자기 초안을 채점하지 않는다. 그 점검은 `egm-review` 5단계가 새 컨텍스트에서 한다.[](source:s6a) |
| **이 스킬** {#r23} | egm-review | 대안 | 두 스킬의 Execution Constraints가 같은 규칙 묶음이다(추론).[](source:cons) |
| **이 스킬** {#r21} | egm-drift-report | 결과 전달 | 저장한 설계 문서가 drift-report 입력 조건에 맞는다(추론). 서로를 부르는 말은 없고 필수 순서도 아니다.[](source:s6) |
| **이 스킬** {#r24} | resources/execution_instructions.md | 참고 | 의무형이다. "MUST read and apply"라고 적는다. 파일이 없어 해석 상태는 불명이다.[](source:cons) |

그림에는 호출·다음 안내·결과 전달만 그리고, 같은 파일·대안·참고와 외부 파일 행은 표에만 남겼다.

@architecture id=relation-map title="egm-draft와 이어지는 스킬"
| brainstorm | egm-brainstorm | backend |
| self | egm-draft(이 스킬) | backend |
| review | egm-review | backend |
| drift | egm-drift-report | backend |
| brainstorm > self | 다음 안내 |
| self > brainstorm | 다음 안내 |
| self > review | 다음 안내 |
| self > drift | 결과 전달 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 제약 13개와 6단계 절차를 적은 본문 | 스킬을 켤 때 읽는다 | 모든 단계 |
| `references/design_doc.md` | 설계 문서 템플릿. Overview부터 Detailed Implementation Plan까지 절 순서를 정한다 | 2단계에서 따르고 6단계에서 최종 구조를 맞출 때 쓴다[](source:tmpl) | 개요·목표, 저장과 인계 |
| `test_scenarios.yaml` | 승인 질문 형식, 대안 선택, 대조 같은 행동 평가 시나리오 10개 | 에이전트가 읽는 파일이 아니다. 평가용이다[](source:scen) | 없음(평가용) |
| `TEST.md` | 4단계와 6단계를 대화로 점검하는 체크리스트 | 평가할 때만 읽는다[](source:test) | 없음(평가용) |
| `agents/openai.yaml` | 표시 이름, 짧은 설명, 아이콘, 브랜드 색 | 호스트가 목록에 보일 때 쓴다[](source:oai) | 없음(표시용) |
| `assets/icon.svg` | 24×24 아이콘 | `openai.yaml`이 가리킨다 | 없음(표시용) |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 큰 제안·초안·요약·계획·보고서를 보여줄 때 | 금지. 채팅에 붙이지 않고 `design_draft.md`에 쓴 뒤 경로를 알리고 검토를 요청한다 | [](source:cons) |
| 쓰는 말 | 쉬운 영어로 쓴다. 근거 없는 홍보 형용사와 장식 부사, 칭찬 형용사, 사과 표현은 금지다 | [](source:cons) |
| 아이디어·전략을 받을 때 | 맞장구보다 반박을 먼저 한다. 약점과 반론을 먼저 말하고 검증을 견딘 뒤에만 동의한다 | [](source:cons) |
| 질문 게이트를 열 때 | 질문은 정확히 하나이고 그 턴의 유일한 도구 호출이다. 선택지에 `(Recommended)`를 붙이지 않는다 | [](source:cons) |
| 구조적 결정에 답이 둘 이상일 때 | 선택지를 최대 3개, 메커니즘·절충·실패 조건과 함께 보여 주고 저자가 단일 선택으로 고른다. 순위·기본값·대신 선택은 금지다. "그냥 골라 줘"라는 요청에도 같은 질문을 다시 낸다 | [](source:cons) |
| 파일 이름, 서식처럼 답이 하나인 결정 | 에이전트가 스스로 정한다 | [](source:cons) |
| 2~5단계에서 한 절을 쓴 직후 | 같은 턴에 채팅 요약(바뀐 절, 핵심 결정 2~3개, 파일 경로)을 먼저 쓰고, 그다음에 승인·수정 요청 질문을 한다. 빈 질문만 내보내는 것은 금지다 | [](source:gate) |
| 수정 요청을 골랐는데 코멘트와 글이 없을 때 | 반복하거나 실패하지 않고 채팅에서 고칠 곳을 묻고 기다린다 | [](source:gate) |
| 사용자가 이전 단계로 돌아가겠다고 할 때 | 허용한다. 단계 사이를 넘어갈 때는 사용자의 명시적 동의가 필요하다 | [](source:wf) |
| 5단계 구현 계획 | 바뀌는 파일 전부와 파일별 이유가 필요하다. 구현 코드는 금지, 의사코드·API·schema는 허용이다 | [](source:s5) |
| 요약문과 초안이 같은 질문을 다르게 결정했을 때 | 모순마다 사용자 결정을 받을 때까지 멈추고, 저장 폴더 질문도 그 뒤에 한다 | [](source:s6a) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 6단계 모순 대조 — 대조 노드 `모순 있나?` · 모순과 추가 결정의 보고 기준, 선행 파일이 없을 때 건너뛰는 조건을 표로 풀 수 있다.
- 절 승인 지점 — 개요·목표부터 구현 계획까지 네 단계 공통 · 채팅 요약 순서, 선택지 문구, 빈 입력 처리를 개요에서 줄였다.
- Execution Constraints 13개 — 제약 표 · 개요에는 결과를 바꾸는 항목만 담았다.
- 설계 문서 템플릿 — 파일 표의 `references/design_doc.md` · CUJ, Non-Functional Requirements 같은 절 구조를 개요에서 다루지 않았다.
- 행동 평가 시나리오 — 파일 표의 `test_scenarios.yaml` · 평가 대상 행동과 판정 패턴.

@callout level=open-question title="확인하지 못한 것"
| 원문이 필수로 읽으라는 `resources/execution_instructions.md`가 폴더에 없어 내용을 모른다. 그 안의 지시가 위 제약과 겹치는지 원문에 명시 없음.
| `docs/codex.md`, `docs/claude.md`도 폴더에 없다. 호스트별 지시가 이 흐름을 바꾸는지 확인하지 못했다.

읽은 원본: 텍스트 파일 6개. 제외: `SKILL.ko.md`, `TEST.ko.md`, `references/design_doc.ko.md`(번역본이라 읽지 않음).
