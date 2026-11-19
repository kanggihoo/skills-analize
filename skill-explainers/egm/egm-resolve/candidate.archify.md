# egm-resolve — 리뷰 지적을 분류해 보고서를 쓰고 승인된 수정만 적용한다 {#overview}

`egm-resolve`는 Goldfish 리뷰어들이 낸 지적 목록을 받아, 지적마다 반박·상향·수정·기각 중 하나로 분류하고, 보고서를 쓴 뒤 사용자가 고른 수정만 문서에 적용하게 하는 스킬이다.[](source:ov)

- 사용할 때: 사용자가 직접 부르거나 `egm-review`, `egm-review-loop`가 부른다. 인자가 모두 있으면 자동 모드로, 없으면 한 번에 하나씩 묻는 단독 모드로 돈다.[](source:s1)
- 결과: `goldfish_review_report.md`(분류와 제안 수정), 사용자가 승인한 수정이 반영된 `TargetFile`, 호출자에게 돌려주는 건수 요약이다.[](source:s3)
- 다른 스킬과의 관계: `egm-review`와 `egm-review-loop`가 이 스킬을 호출하고, 보고서 파일은 `egm-review`와 같은 파일을 쓴다.
- 하지 않는 것: 지적의 severity를 바꾸지 않고, 증거 없이 반박하지 않는다. 사용자 승인 전에는 문서를 고치지 않는다.[](source:s2)

@answer scope="egm/egm-resolve · 원본 파일 5개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter" path=egm/egm-resolve/SKILL.md lines=1:10
@source ov title="개요와 Elephant 컨텍스트 권고" path=egm/egm-resolve/SKILL.md lines=17:28
@source codex title="환경별 안내 문서 지시" path=egm/egm-resolve/SKILL.md lines=14:15
@source inputs title="입력 세 가지" path=egm/egm-resolve/SKILL.md lines=30:37
@source s1 title="1단계 입력 확인" path=egm/egm-resolve/SKILL.md lines=41:52
@source s2 title="2단계 분류 규칙" path=egm/egm-resolve/SKILL.md lines=54:82
@source s3 title="3단계 보고서 작성" path=egm/egm-resolve/SKILL.md lines=84:108
@source s4 title="4단계 사용자 선택 지점" path=egm/egm-resolve/SKILL.md lines=110:178
@source s4gate title="선택지 안내와 정지" path=egm/egm-resolve/SKILL.md lines=112:134
@source s4apply title="선택별 처리" path=egm/egm-resolve/SKILL.md lines=136:178
@source s5 title="5단계 재확인과 종료" path=egm/egm-resolve/SKILL.md lines=180:187
@source scen title="평가 시나리오" path=egm/egm-resolve/test_scenarios.yaml lines=15:41
@source testmd title="검증 체크리스트" path=egm/egm-resolve/TEST.md lines=1:12
@source rev title="egm-review의 resolve 호출 지시" path=egm/egm-review/SKILL.md lines=252:262
@source revfile title="egm-review가 보고서를 가져오는 지시" path=egm/egm-review/SKILL.md lines=387:390
@source loop title="egm-review-loop의 resolve 호출 지시" path=egm/egm-review-loop/SKILL.md lines=146:156
@source oai title="표시 정보" path=egm/egm-resolve/agents/openai.yaml lines=1:6

## 어떻게 동작하나 {#flow span=12}

다섯 단계가 차례로 이어진다. 4단계는 사용자 선택에 따라 갈라지고, `Interactive breakdown`을 고르면 지적을 하나씩 묻는 반복이 이 안에서 돈다. 그 반복은 그림에 따로 그리지 않았고 상세 후보에 남겼다.

@workflow id=flow-diagram title="egm-resolve 흐름"
| lane prep | 준비 |
| lane judge | 분류와 보고 |
| lane decide | 사람 결정 |
| lane close | 마무리 |
| intake | 입력 확인 | external | prep | source:s1 |
| classify | 지적 분류 | backend | judge | source:s2 |
| report | 보고서 작성 | backend | judge | source:s3 |
| gate | 사용자 선택? | backend | decide | source:s4gate |
| apply | 승인된 수정 적용 | backend | decide | source:s4apply |
| exit | 재확인과 종료 | backend | close | source:s5 |
| intake > classify | |
| classify > report | |
| report > gate | |
| gate > apply | auto accept 등 |
| gate > exit | continue |
| apply > exit | |

@steps id=flow-steps
| s-intake | 입력 확인 | **입력** `TargetFile`, `LineRange`, `FindingsList` · **참조** `TargetFile`의 `LineRange` 구간 · **출력** 읽은 문서 구간과 파싱한 지적 목록. **처리** 세 인자가 모두 있으면 조용히 진행하고, 빠졌으면 하나씩 물어 값을 모은 뒤 설정을 보여 주고 확인받는다.[](source:s1) **다음** 인자가 빠졌으면 사용자 답을 기다린다. | flow-diagram | intake |
| s-classify | 지적 분류 | **입력** 파싱한 지적 목록 · **출력** 지적마다 정해진 범주 하나. **처리** 지적을 `CONTEST`, `ESCALATE`, `PROPOSE FIX`, `DECLINE` 중 정확히 하나로 나눈다.[](source:s2) **다음** 반박 근거를 리뷰어가 읽을 수 없으면 `ESCALATE`나 `PROPOSE FIX`로 돌린다.[](source:s2) | flow-diagram | classify |
| s-report | 보고서 작성 | **입력** 분류된 지적 · **실행** 파일 쓰기 도구로 `goldfish_review_report.md`를 작업 디렉터리에 저장한다(하네스에 artifact 디렉터리가 있으면 거기) · **출력** `goldfish_review_report.md`. **처리** severity 순서로 지적, 제안 범주, 근거, 제안 수정을 적는다.[](source:s3) | flow-diagram | report |
| s-gate | 사용자 선택? | **입력** `goldfish_review_report.md` · **출력** 사용자에게 보이는 안내 메시지와 선택지 다섯 개. **처리** `ESCALATE`가 있으면 먼저 나열하고, 도구를 하나도 부르지 않은 채 멈춰서 사용자 답을 기다린다.[](source:s4gate) **다음** 선택지는 `Comment directly on the file`, `Auto accept`, `Continue`, `Interactive breakdown`, 사용자 지정 요청이다. | flow-diagram | gate |
| s-apply | 승인된 수정 적용 | **입력** 사용자 선택과 `PROPOSE FIX` 항목 · **실행** 파일 편집 도구 · **출력** 수정된 `TargetFile`. **처리** `Auto accept`면 `PROPOSE FIX`만 한 번에 적용하고 `CONTEST`·`ESCALATE`·`DECLINE`은 건너뛴다.[](source:s4apply) **다음** `Interactive breakdown`은 모든 결정이 끝난 뒤에야 편집한다. | flow-diagram | apply |
| s-exit | 재확인과 종료 | **입력** 수정된(또는 그대로인) `TargetFile` · **출력** `Status: resolved`가 붙은 보고서와 caller에게 돌려주는 건수. **처리** 고쳤다면 문서가 구조적으로 온전한 markdown인지 확인하고, 보고서 맨 위에 `Status: resolved`를 적고, 건수를 caller에게 넘긴다.[](source:s5) | flow-diagram | exit |

`Continue` 또는 `No changes`는 수정 없이 곧바로 5단계로 간다.[](source:s4apply) 사용자가 자유 지시를 주면 그대로 적용하고 5단계로 간다.[](source:s4apply)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자가 직접 부른다. frontmatter가 `disable-model-invocation: true`라서 모델이 description만 보고 자동으로 켜지는 않는다.[](source:fm) |
| 성격 | Elephant 컨텍스트(문서를 쓴 대화)에서 지적을 분류하고 승인된 수정만 반영하는 절차형 스킬이다.[](source:ov) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| egm-review {#r09} | **이 스킬** | 호출 | Stage 7·9 중간 확인에서 사용자가 `Resolve findings with agent`를 고를 때만 부른다. 같은 Elephant 컨텍스트에서 실행하고, 수정 뒤 재감사는 최대 1회다.[](source:rev) |
| egm-review-loop {#r10} | **이 스킬** | 호출 | 라운드마다 `TargetFile`, 줄 범위, `FindingsList`를 넘겨 부른다. resolve가 사람 결정에서 멈추면 loop도 사용자 확인을 기다린다(의무형). 끝나면 건수를 caller에게 돌려받는다.[](source:loop) |
| **이 스킬** {#r18} | egm-review | 같은 파일 | `goldfish_review_report.md`를 resolve가 쓰고 `Status: resolved`를 붙인다. review는 지적을 넘길 때 이 보고서에서 가져온다고 적는다.[](source:revfile) |

@architecture id=relation-map title="egm-resolve와 이어지는 스킬"
| review | egm-review | backend |
| loop | egm-review-loop | backend |
| self | egm-resolve(이 스킬) | backend |
| review > self | 호출 |
| loop > self | 호출 |
| self > review | 같은 파일 | dashed |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 다섯 단계 지시 전체 | 스킬이 켜질 때 읽는다 | 입력 확인 · 지적 분류 · 보고서 작성 · 사용자 선택? · 승인된 수정 적용 · 재확인과 종료 |
| `test_scenarios.yaml` | 평가 시나리오 2개. 일반 흐름 문구 확인과, 근거가 없는 반박은 `ESCALATE`로 가는지 확인한다[](source:scen) | 평가할 때만 쓴다 | 지적 분류 |
| `TEST.md` | 1~4단계가 지켜졌는지 보는 검증 체크리스트[](source:testmd) | 사람이 대화로 시험할 때만 본다 | 없음 (검증용) |
| `agents/openai.yaml` | 표시 이름 `EGM Resolve`, 짧은 설명, 아이콘, 색 지정[](source:oai) | 에이전트 목록 표시에 쓴다 | 없음 (표시용) |
| `assets/icon.svg` | 24x24 아이콘 그림 | `agents/openai.yaml`이 가리킨다 | 없음 (표시용) |

## 무엇을 지키고 언제 멈추나 {#limits}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 지적 하나를 분류할 때 | 범주는 정확히 하나만 준다 | [](source:s2) |
| 반박하려는데 리뷰어가 읽을 수 있는 증거(파일과 symbol, 문서에 적힌 결정)를 못 댈 때 | "의도한 것"만으로는 반박이 안 된다. `ESCALATE` 또는 `PROPOSE FIX`를 쓴다 | [](source:s2) |
| 반박 근거가 리뷰어가 읽는 파일 밖에 있을 때(팀 관례, 구두 결정) | `ESCALATE`: 그 사실을 밝히고 고치지 않고 사용자에게 넘긴다 | [](source:s2) |
| 문서가 독자에게 맥락을 주지 못해 지적이 나왔을 때 | 이해 부족을 반박하지 않는다. 문서에 맥락이 빠진 것이다 | [](source:s2) |
| 제로 컨텍스트 서브에이전트만 필요로 하는 맥락일 때 | 문서에 더하지 않고 `ESCALATE`를 쓴다 | [](source:s2) |
| Blocker를 Nit로 보고 싶을 때 | severity를 바꾸지 않는다. `CONTEST`하고 이유를 쓴다 | [](source:s2) |
| 직접 쓴 문서의 지적을 반박하고 싶을 때 | 반박하고 싶은 마음은 증거가 아니다 | [](source:s2) |
| 지적이 Nit일 때 | `DECLINE`으로 기록만 한다. 고칠 가치가 있으면 `PROPOSE FIX`도 가능하다 | [](source:s2) |
| `ESCALATE`가 하나라도 있을 때 | 안내 메시지에서 그 지적들을 먼저 나열한다 | [](source:s4gate) |
| 선택지를 안내한 직후 | 도구를 하나도 부르지 않고 멈춰 사용자를 기다린다(MUST) | [](source:s4gate) |
| `Auto accept` | `PROPOSE FIX`만 적용하고 `CONTEST`·`ESCALATE`·`DECLINE`은 건너뛴다 | [](source:s4apply) |
| `Interactive breakdown` 진행 중 | 모든 항목(`DECLINE` 제외)을 하나씩 묻고, 결정이 끝나기 전에는 파일 편집 도구를 쓰지 않는다 | [](source:s4apply) |
| 종료할 때 | 수락·반박·상향·기각 건수와 남은 미해결 건수를 caller에게 돌려준다 | [](source:s5) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 분류 규칙 전체 — 개요의 지적 분류 · 개요에는 결과를 바꾸는 규칙만 표로 담았다. 범주별 예와 판정 순서는 따로 풀 수 있다.
- 보고서 형식 — 개요의 보고서 작성 · 항목 양식(Affected Scope, Suggestion, Proposed Edit 등)의 필드 하나하나는 담지 않았다.
- Interactive breakdown 반복 — 개요의 사용자 선택? · 범주별 답 선택지(`Accept proposed fix`, `Skip / ignore`, `Overrule contest` 등)와 메모 체크리스트 규칙은 그림에서 뺐다.
- 호출자와 맞물리는 방식 — 개요의 재확인과 종료 · `egm-review`, `egm-review-loop` 쪽 지시와 함께 읽어야 해서 개요에서는 건수 반환만 적었다.

@callout level=open-question title="확인하지 못한 것"
| `SKILL.md` 14~15줄이 먼저 읽으라는 `../../docs/codex.md`와 `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`는 이 저장소에 없다. 그래서 환경별 보정 지시가 있는지 알 수 없다.[](source:codex) |
| 원장은 `Status: resolved`를 보고서 "끝"에 붙는 것으로 적었지만 원문은 "맨 위"에 추가하라고 한다.[](source:s5) |

읽은 원본: 텍스트 파일 5개. 제외: 번역본 `SKILL.ko.md`, `TEST.ko.md`(분석 근거는 원본).
