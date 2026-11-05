# egm-resolve 스킬은 에이전트를 어떻게 바꾸나 {#egm-resolve-skill}

`egm-resolve`를 쓰면 에이전트는 리뷰 지적을 받는 대로 고치지 않는다. 지적마다 반박, 상향, 수정, 기각 중 하나로 분류하고 보고서를 파일로 쓴 뒤 멈춰서 사용자가 고르기를 기다린다. 사용자가 고른 다음에야 승인된 수정만 문서에 적용한다.[](source:rs-cats)[](source:rs-report)[](source:rs-yield)

- 반박은 리뷰어가 읽을 수 있는 근거(파일과 symbol, 문서에 적힌 결정)가 있을 때만 한다. 그런 근거가 없으면 반박하지 않고 수정하거나 사용자에게 올린다.[](source:rs-cats)[](source:rs-rules)
- 보고서를 쓴 뒤에는 도구를 한 번도 부르지 않고 멈춘다. 사용자가 댓글을 달거나 채팅으로 답할 때까지 기다린다.[](source:rs-yield)
- `auto accept`는 PROPOSE FIX로 분류한 항목만 한 번에 적용한다. 반박, 상향, 기각 항목은 건드리지 않는다.[](source:rs-auto)
- 이 스킬은 `disable-model-invocation: true`라서 모델이 `description`만 보고 스스로 켜지 못한다고 판정한다.[](source:rs-fm)

@answer scope="egm/egm-resolve · 텍스트 5개 · 커밋 d494974 · 실행 안 함 · 지시상 동작 · 조사 상태 완료"
@meta locale=ko
@source rs-fm title="egm/egm-resolve/SKILL.md · 8541B · frontmatter" path=egm/egm-resolve/SKILL.md lines=1:10
@source rs-docs title="egm/egm-resolve/SKILL.md · 먼저 읽으라는 docs 안내" path=egm/egm-resolve/SKILL.md lines=14:15
@source rs-overview title="egm/egm-resolve/SKILL.md · 개요" path=egm/egm-resolve/SKILL.md lines=17:22
@source rs-ctx title="egm/egm-resolve/SKILL.md · 실행 맥락 권장" path=egm/egm-resolve/SKILL.md lines=24:28
@source rs-inputs title="egm/egm-resolve/SKILL.md · 입력 3개" path=egm/egm-resolve/SKILL.md lines=30:37
@source rs-step1 title="egm/egm-resolve/SKILL.md · 1단계 두 가지 실행 방식" path=egm/egm-resolve/SKILL.md lines=41:52
@source rs-cats title="egm/egm-resolve/SKILL.md · 2단계 분류 4종" path=egm/egm-resolve/SKILL.md lines=54:67
@source rs-rules title="egm/egm-resolve/SKILL.md · 2단계 규칙 5개" path=egm/egm-resolve/SKILL.md lines=69:82
@source rs-report title="egm/egm-resolve/SKILL.md · 3단계 보고서 형식" path=egm/egm-resolve/SKILL.md lines=84:108
@source rs-esc-first title="egm/egm-resolve/SKILL.md · 4단계 ESCALATE 먼저 나열" path=egm/egm-resolve/SKILL.md lines=110:113
@source rs-msg title="egm/egm-resolve/SKILL.md · 4단계 사용자에게 보내는 안내" path=egm/egm-resolve/SKILL.md lines=115:130
@source rs-yield title="egm/egm-resolve/SKILL.md · 4단계 멈춤 규칙" path=egm/egm-resolve/SKILL.md lines=132:134
@source rs-auto title="egm/egm-resolve/SKILL.md · auto accept 처리" path=egm/egm-resolve/SKILL.md lines=138:142
@source rs-cont title="egm/egm-resolve/SKILL.md · continue 처리" path=egm/egm-resolve/SKILL.md lines=143:144
@source rs-inter title="egm/egm-resolve/SKILL.md · interactive breakdown 처리" path=egm/egm-resolve/SKILL.md lines=145:175
@source rs-custom title="egm/egm-resolve/SKILL.md · 자유 지시 처리" path=egm/egm-resolve/SKILL.md lines=177:178
@source rs-step5 title="egm/egm-resolve/SKILL.md · 5단계 마무리" path=egm/egm-resolve/SKILL.md lines=180:187
@source rs-test-esc title="egm/egm-resolve/test_scenarios.yaml · 1941B · 상향 사례" path=egm/egm-resolve/test_scenarios.yaml lines=31:41
@source rs-testmd title="egm/egm-resolve/TEST.md · 871B · 확인 체크리스트" path=egm/egm-resolve/TEST.md lines=9:12
@source rs-yaml title="egm/egm-resolve/agents/openai.yaml · 193B · 표시 이름" path=egm/egm-resolve/agents/openai.yaml lines=1:6
@source rs-icon title="egm/egm-resolve/assets/icon.svg · 506B · 아이콘(그림 데이터만 있음)" path=egm/egm-resolve/assets/icon.svg
@source x-review-r09 title="egm/egm-review/SKILL.md · r09 확인용(Resolve 선택)" path=egm/egm-review/SKILL.md lines=252:262
@source x-review-r18 title="egm/egm-review/SKILL.md · r18 확인용(보고서 출처)" path=egm/egm-review/SKILL.md lines=387:394
@source x-loop-r10 title="egm/egm-review-loop/SKILL.md · r10 확인용(2.3 위임)" path=egm/egm-review-loop/SKILL.md lines=146:156
@source x-loop-turn title="egm/egm-review-loop/SKILL.md · r10 확인용(사람 차례 기다리기)" path=egm/egm-review-loop/SKILL.md lines=183:187

## 언제 켜지고 무엇을 받아야 시작하나 {#trigger}

@code source=rs-fm language=yaml

- 호출 제한 필드가 `true`다.[](source:rs-fm) 판정: `description`은 모델이 판단할 때 참고하는 설명일 뿐 정확히 일치해야 켜지는 사전이 아니고, 이 필드가 `true`이면 모델이 스스로 켜지 않는다고 읽는다. 필드 의미를 설명하는 문장은 원문에 명시 없음.
- 호출하는 쪽은 두 곳이 원장에 있다. `egm-review`가 Stage 7·9 중간 확인에서 부르고(r09), `egm-review-loop`가 라운드마다 부른다(r10).[](source:x-review-r09)[](source:x-loop-r10)
- 원문은 이 스킬을 Elephant(이전 대화를 기억하는 메인 에이전트)의 대화 세션에서 실행하라고 권한다. 문서를 쓴 세션이어야 앞선 추론을 떠올려 더 나은 수정안을 만든다는 이유다. 권고이고 의무 문구는 아니다.[](source:rs-ctx)
- `description`은 "UI multiple-choice gates"를 쓴다고 하지만, 4단계 본문은 도구를 부르지 않고 채팅 답변을 기다리라고 한다. TEST.md도 "modal popups 없이" 묻는 것을 확인 항목으로 둔다.[](source:rs-fm)[](source:rs-yield)[](source:rs-testmd) 판정: 두 문장이 어긋나며, 우선순위는 원문에 명시 없음. 본문과 TEST.md가 같은 쪽이어서 이 페이지는 채팅 답변 방식으로 쓴다.

호출하는 쪽이 넘기는 입력은 정확히 세 개다.[](source:rs-inputs)

| 입력 | 뜻 |
| --- | --- |
| `TargetFile` | 대상 문서의 절대·상대 경로[](source:rs-inputs) |
| `LineRange` | 줄 번호 범위. 또는 `full file`[](source:rs-inputs) |
| `FindingsList` | Goldfish 리뷰어들이 낸 지적을 하나로 합친 평평한 목록[](source:rs-inputs) |

입력 세 개가 모두 있으면 자동 방식으로, 빠져 있으면 단독 방식으로 진행한다.[](source:rs-step1)

| 방식 | 언제 | 에이전트가 하는 일 |
| --- | --- | --- |
| 자동 | 인자가 모두 있을 때 | 하위 프로세스처럼 조용히 실행한다[](source:rs-step1) |
| 단독 | 인자가 빠졌을 때 | 입력을 한 번에 하나씩 묻고, 답을 받을 때마다 기다린다. 입력이 다 모이면 최종 설정을 보여 주고 계속해도 되는지 확인한다[](source:rs-step1) |

입력이 모이면 에이전트는 `TargetFile`의 `LineRange`를 읽고 `FindingsList`를 해석한다.[](source:rs-step1)

판정: "조용히 실행"은 입력 확인 단계에 대한 말이다. 4단계는 자동 방식에서도 사람의 응답을 기다리는 쪽으로 읽힌다. `egm-review-loop`가 "사람 차례를 넘겨 기다려야 한다"고 적기 때문이다.[](source:x-loop-turn) 자동 방식에서 4단계를 건너뛰는지는 이 스킬 본문에 원문에 명시 없음.

## 지적 하나를 어떻게 분류하나 {#classify}

에이전트는 지적마다 정확히 한 가지 분류를 붙인다.[](source:rs-cats) 아래 그림은 분류 기준을 판단 순서로 옮긴 것이다. 판정: 원문은 판단 순서를 번호로 정하지 않았다. 4개 정의를 읽은 순서대로 이어 그렸다.

@workflow id=classify-flow title="지적 하나의 분류 판단"
| f | 지적 하나 | external |
| ok | 지적이 맞나? | backend |
| nit | Nit인가? | backend |
| ev | 근거를 읽을 수 있나? | backend |
| dec | DECLINE | backend |
| fix | PROPOSE FIX | backend |
| con | CONTEST | backend |
| esc | ESCALATE | backend |
| f > ok | |
| ok > nit | 맞다 |
| ok > ev | 틀렸다 |
| nit > dec | Nit | emphasis |
| nit > fix | 그 밖 |
| ev > con | 읽을 수 있다 | emphasis |
| ev > esc | 읽을 수 없다 | emphasis |

@steps id=classify-steps
| ok | 지적이 맞나? | 지적이 타당하면 수정 쪽으로, 틀렸거나 코드베이스를 오해했으면 반박 쪽으로 간다.[](source:rs-cats) | classify-flow | ok |
| nit | Nit인가? | Nit이면 DECLINE이다. 기록만 하고 고치지 않는다. 고칠 가치가 있으면 PROPOSE FIX를 쓸 수 있다.[](source:rs-cats) | classify-flow | nit |
| ev | 근거를 읽을 수 있나? | 리뷰어가 읽을 수 있는 파일과 symbol, 문서에 적힌 결정이면 CONTEST다. 그 모든 파일 밖(팀 관행, 구두 결정)이면 ESCALATE다.[](source:rs-cats) | classify-flow | ev |

Nit인 지적이 틀렸을 때 어디로 가는지는 원문에 명시 없음이다. 그림에서는 그 갈래를 그리지 않았다.

| 분류 | 기준 | 에이전트가 하는 일 |
| --- | --- | --- |
| CONTEST | 지적이 부정확하거나 코드베이스를 오해했다 | 리뷰어가 읽을 수 있는 근거를 댄다. 파일과 symbol, 또는 문서에 적힌 결정이다[](source:rs-cats) |
| ESCALATE | 지적은 부정확하지만 근거가 리뷰어가 읽을 수 있는 모든 파일 밖에 있다. 예는 팀 관례와 구두 결정이다 {caution:사람 필요} | 그 사실을 밝히고 고치지 않는다. 사용자에게 준다[](source:rs-cats) |
| PROPOSE FIX | 지적이 타당하다 | 정확한 텍스트 교체나 구조 수정안을 정한다[](source:rs-cats) |
| DECLINE | 지적이 Nit이다 | 기록하고 고치지 않는다. 고칠 가치가 있으면 PROPOSE FIX도 쓸 수 있다[](source:rs-cats) |

원문은 이 분류에 규칙 다섯 개를 붙인다.[](source:rs-rules)

@list id=resolve-rules ordered=true
| 반박은 확인할 수 있어야 한다. "의도한 것이었다"는 근거가 아니다. 리뷰어가 읽을 근거를 댈 수 없으면 ESCALATE나 PROPOSE FIX를 쓴다.[](source:rs-rules) |
| 리뷰어를 만족시키려고 맥락을 덧붙이지 않는다. 사람 독자에게 필요할 때만 덧붙인다. 맥락 없는 서브에이전트에게만 필요하면 ESCALATE를 쓴다.[](source:rs-rules) |
| 이해 부족 지적(comprehension gap)은 반박하지 않는다. 새 독자가 따라가지 못했다면 문서에 맥락이 빠진 것이다.[](source:rs-rules) |
| 심각도를 바꾸지 않는다. Blocker가 Nit라고 생각하면 CONTEST로 분류하고 이유를 적는다.[](source:rs-rules) |
| 에이전트가 문서를 쓴 쪽이다. 반박하고 싶은 마음은 리뷰어가 틀렸다는 근거가 되지 못한다.[](source:rs-rules) |

사례는 `test_scenarios.yaml`의 `escalate_uncheckable_contest`다. 이 시나리오는 응답에 `ESCALATE`가 들어 있기를 기대한다.[](source:rs-test-esc) 이 분석에서는 시나리오를 실행하지 않았다.

| 사례 항목 | 내용 |
| --- | --- |
| 대상 문서 | `docs/design.md`[](source:rs-test-esc) |
| 지적 | Major. 내보내기 작업에 재시도 정책이 없다[](source:rs-test-esc) |
| 에이전트 쪽 사정 | 팀이 "내보내기는 재시도하지 않는다"고 말로 합의했지만 기록한 파일은 없다[](source:rs-test-esc) |
| 기대하는 분류 | ESCALATE {good:사용자에게 올림}[](source:rs-test-esc) |
| 이유 | 반박 근거가 구두 합의뿐이라 리뷰어가 읽을 수 없다. 판정: 규칙 1과 ESCALATE 정의에서 나온 설명이다 |

## 사람은 어디서 개입하고 무엇을 쓰나 {#gate}

에이전트는 분류가 끝나면 `goldfish_review_report.md`를 작업 폴더(또는 하니스의 artifact 폴더)에 쓴다. 지적은 심각도 순으로 늘어놓는다.[](source:rs-report)

| 보고서 항목 | 내용 |
| --- | --- |
| 제목줄 | `[Issue N]`, 리뷰어 이름, 심각도(Blocker, Major, Nit 중 하나)[](source:rs-report) |
| Affected Scope | 시작줄-끝줄과 문서 링크, 소제목[](source:rs-report) |
| Discrepancy Description, Rationale | `FindingsList`에서 그대로 옮긴다[](source:rs-report) |
| AI Suggestion | CONTEST, ESCALATE, PROPOSE FIX, DECLINE 중 하나[](source:rs-report) |
| Justification | 그렇게 분류한 이유[](source:rs-report) |
| Proposed Edit | 위치와 정확한 교체 문자열 또는 삭제 메모[](source:rs-report) |

ESCALATE 항목이 있으면 에이전트는 채팅 메시지 맨 위에 그것부터 적는다. 승인만이 아니라 사용자의 지식이 필요한 항목이기 때문이다.[](source:rs-esc-first) 그다음 보고서를 읽고 다섯 가지 중 하나로 답하라고 안내한다.[](source:rs-msg)

@workflow id=gate-flow title="보고서를 쓴 뒤의 사람 승인 지점"
| save | 보고서 저장 | backend |
| ask | 선택지 안내 | backend |
| wait | 도구 없이 대기 | external |
| pick | 무엇을 골랐나? | external |
| auto | PROPOSE FIX 일괄 적용 | backend |
| none | 수정 없이 진행 | backend |
| walk | 항목별로 묻기 | external |
| apply | 승인 항목 적용 | backend |
| save > ask | |
| ask > wait | |
| wait > pick | 사용자 응답 |
| pick > auto | auto accept |
| pick > none | continue |
| pick > walk | breakdown |
| walk > apply | 전부 결정 |

그림의 끝 노드 세 개는 모두 5단계 마무리로 이어진다. 자유 지시를 적용하고 5단계로 가는 갈래는 그리지 않았고 아래 표에 있다.[](source:rs-custom)[](source:rs-step5)

@steps id=gate-steps
| save | 보고서 저장 | `goldfish_review_report.md`에 분류와 수정안을 쓴다.[](source:rs-report) | gate-flow | save |
| ask | 선택지 안내 | ESCALATE 항목을 먼저 적고, 다섯 가지 답변을 안내한다.[](source:rs-esc-first)[](source:rs-msg) | gate-flow | ask |
| wait | 도구 없이 대기 | 같은 턴에서 도구를 0번 부르고 멈춘다. 사용자가 파일을 고치거나 채팅으로 답하기를 기다린다.[](source:rs-yield) | gate-flow | wait |
| pick | 무엇을 골랐나? | 사용자의 답변을 아래 표대로 해석한다.[](source:rs-yield) | gate-flow | pick |

| 사용자의 답 | 에이전트가 하는 일 |
| --- | --- |
| 파일에 댓글 | 보고서를 읽고 항목마다 승인, 거부, 반박하는 댓글이나 수정을 남기라는 안내다. 댓글을 어떻게 읽어 적용하는지는 원문에 명시 없음. 반박 없이 Proceed를 누르면 auto accept로 처리한다[](source:rs-msg)[](source:rs-auto) |
| `auto accept` | `Accept all suggestions`나 반박 없는 Proceed도 같다. PROPOSE FIX 항목 전부를 `TargetFile`의 `LineRange`에 한 번에 적용한다. CONTEST, ESCALATE, DECLINE은 건너뛴다. 그다음 5단계로 간다[](source:rs-auto) |
| `continue` 또는 `no changes` | 수정을 적용하지 않고 5단계로 간다[](source:rs-cont) |
| `interactive breakdown` | 아래 표대로 항목을 하나씩 묻는다[](source:rs-inter) |
| 자유 지시, 질문, 범위 밖 요청 | 지시를 적용하고 5단계로 간다. 질문이나 범위 밖 요청의 처리는 원문에 명시 없음[](source:rs-msg)[](source:rs-custom) |

`interactive breakdown`을 고르면 DECLINE을 뺀 모든 항목을 하나씩 훑는다. 항목마다 제목, 범위, 설명, AI Suggestion, 설명과 근거, Proposed Edit을 채팅에 보여 주고, 사용자 답을 기다리며 도구를 0번 부르고 멈춘다.[](source:rs-inter)

| 항목 분류 | 사용자가 고를 수 있는 답 |
| --- | --- |
| PROPOSE FIX | 수정안 수락, 건너뛰기, 논의[](source:rs-inter) |
| CONTEST | 건너뛰기(반박에 동의), 반박 뒤집기(수정안 제시), 논의[](source:rs-inter) |
| ESCALATE | 확인(변경 없음), 그 사실을 문서에 추가, 논의[](source:rs-inter) |

- 결정은 에이전트의 내부 메모 체크리스트에만 적는다. 이 항목 순회 중에는 파일 편집 도구를 쓰지 않는다.[](source:rs-inter)
- 모든 항목이 결정되면 수락한 수정을 요약한 뒤 한꺼번에 적용하고 5단계로 간다.[](source:rs-inter)
- 논의를 고른 뒤의 진행과 반복 횟수 한도는 원문에 명시 없음.

종료는 5단계다. 파일을 고쳤다면 문서가 구조적으로 이어지고 Markdown이 유효한지 확인한다. 보고서 맨 위에 `Status: resolved` 줄을 붙인다. 호출한 스킬(예: `egm-review-loop`)에 수락한 수정, 반박, 상향, 기각, 남은 미해결 지적의 건수를 돌려주고 끝난다.[](source:rs-step5)

## 앞뒤 스킬은 무엇을 주고받나 {#position}

`egm-resolve`는 검토 흐름의 한가운데에서 불려 오는 스킬이다. 전체 흐름은 `egm/_group-review-and-fix/review-and-fix.html`에 있다.

@workflow id=resolve-position title="egm-resolve의 앞뒤"
| rv | egm-review | backend |
| lp | egm-review-loop | backend |
| me | egm-resolve | backend |
| back | 호출한 스킬로 복귀 | backend |
| rv > me | r09 사용자 선택 | emphasis |
| lp > me | r10 매 라운드 | emphasis |
| me > back | 건수 반환 | emphasis |

| rel-id | 종류 | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- | --- |
| r09 egm-review → egm-resolve | 내부 위임 | `egm-review`가 Stage 7·9에서 `critic_report.md` 또는 `implementation_readiness_report.md`의 지적을 넘긴다 | 수정은 `TargetFile`에 직접 적용한다. 고친 뒤 `egm-review`가 줄 범위를 다시 읽는다 | 사용자가 `Resolve findings with agent`를 고를 때만 부른다. 같은 Elephant 컨텍스트에서 실행한다. 재감사는 최대 1회다[](source:x-review-r09)[](source:x-review-r18) |
| r10 egm-review-loop → egm-resolve | 내부 위임 | `TargetFile`, 줄 범위, `FindingsList` | `goldfish_review_report.md`와 건수 | 라운드마다 부른다. `egm-resolve`가 사람 결정에서 멈추면 loop도 사용자가 확인할 때까지 기다린다[](source:x-loop-r10)[](source:x-loop-turn) |
| r18 egm-resolve → egm-review | 공유 상태 | - | `goldfish_review_report.md`. 끝에 `Status: resolved`를 붙인다 | `egm-review`가 이 파일 또는 `critic_report.md`를 지적의 출처로 쓴다. 상태를 관리하는 외부 도구는 원문에 명시 없음[](source:rs-step5)[](source:x-review-r18) |

## 어디까지 확인했고 무엇을 확인하지 못했나 {#audit}

@facts id=audit-facts
| 읽은 텍스트 파일 | 5개, 합계 12,052B(SKILL.md 8,541 + test_scenarios.yaml 1,941 + TEST.md 871 + openai.yaml 193 + icon.svg 506) |
| 구조·표본만 읽은 파일 | 0개 |
| 제외한 파일 | 바이너리 없음. `icon.svg`는 텍스트로 열었으나 그림 데이터뿐이고 지시가 없다[](source:rs-icon) |
| 교차 확인에 쓴 다른 스킬 줄 | `egm-review` 252~262·387~394줄, `egm-review-loop` 146~156·183~187줄 |
| 이 스킬 파일 중 분석 직전 최신화로 바뀐 것 | `SKILL.md` 1줄: 보고서 심각도 표기 `High, Medium, Low`에서 `Blocker, Major, Nit`로 바뀜. 분석 중에 바뀐 파일은 없다 |

`agents/openai.yaml`은 화면에 보이는 이름 "EGM Resolve"와 짧은 설명 "Resolve review findings in a design"만 정한다.[](source:rs-yaml) 이 스킬의 동작 지시는 없다.

@callout level=open-question title="확인하지 못한 것"
이 스킬은 실행하지 않았다. 분류 규칙과 사용자 선택은 `SKILL.md`가 적은 지시상 동작이고, 에이전트가 실제로 그렇게 움직이는지는 확인하지 못했다.
일곱 egm 스킬은 모두 첫머리에서 `docs/codex.md`(Claude Code는 `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`)를 먼저 읽으라고 한다. 저장소에 `docs/`가 없어서 내용을 확인하지 못했다.[](source:rs-docs)
"파일에 댓글", 논의, 질문·범위 밖 요청, Nit이 틀렸을 때의 분류, 자동 방식에서 4단계 생략 여부는 원문에 명시 없음.
