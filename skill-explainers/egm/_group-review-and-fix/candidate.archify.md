# egm 리뷰 세 스킬은 어떻게 맞물려 돌아가나 {#review-and-fix-group}

`egm-review`가 설계 문서 리뷰를 총괄하고, 지적을 고치는 일은 `egm-review-loop`과 `egm-resolve`가 나눠 맡는다. 대화형 흐름에서 `egm-review`는 Stage 7(설계 비평)과 Stage 9(구현 준비)에서만 `egm-review-loop`을 같은 스레드에서 부른다. `egm-review-loop`은 라운드마다 `egm-resolve`를 부르고, `egm-resolve`의 4단계는 사람이 답하기 전에 문서를 고치지 않는다고 적는다(r08, r10).[](source:r-rv-crit)[](source:r-rv-ready)[](source:r-lp-resolve)[](source:r-rs-gate)

- 리뷰어는 새 컨텍스트에서 시작하는 Goldfish이고, 지적을 판단해 고치는 쪽은 문서를 쓴 대화를 기억하는 Elephant다.[](source:r-lp-over)
- `Consolidated report` 흐름은 `egm-review-loop`을 거치지 않는다. Stage 5·7·8·9를 합성 담당(synthesizer)에게 맡기고 `consolidated_review_report.md` 하나로 모은다.[](source:r-rv-uninter)
- 반복에는 상한이 있다. review-loop은 최대 5라운드이고 깨끗한 라운드 2회 연속이면 수렴으로 본다.[](source:r-lp-iter)
- 이 묶음의 조사 상태는 **부분 분석**이다. 리뷰어 정의 파일과 기준 문서가 저장소에 없어서 리뷰어가 실제로 무엇을 보는지는 확인하지 못했다.

@answer scope="egm · review · review-loop · resolve · 커밋 d494974 · 지시상 동작 · 리뷰어 정의와 기준 문서는 확인하지 못함(부분 분석)"
@meta locale=ko
@source r-rv-off title="egm/egm-review/SKILL.md · 호출 제한" path=egm/egm-review/SKILL.md lines=4:4
@source r-lp-off title="egm/egm-review-loop/SKILL.md · 호출 제한" path=egm/egm-review-loop/SKILL.md lines=4:4
@source r-rs-off title="egm/egm-resolve/SKILL.md · 호출 제한" path=egm/egm-resolve/SKILL.md lines=4:4
@source r-rv-deleg title="egm-review/SKILL.md · 서브에이전트 없을 때" path=egm/egm-review/SKILL.md lines=19:28
@source r-rv-ctx title="egm-review/SKILL.md · 연결 파일 규칙" path=egm/egm-review/SKILL.md lines=101:119
@source r-rv-preset title="egm-review/SKILL.md · preset 선택" path=egm/egm-review/SKILL.md lines=123:177
@source r-rv-split title="egm-review/SKILL.md · 의미 경계 탐색" path=egm/egm-review/SKILL.md lines=179:207
@source r-rv-gates title="egm-review/SKILL.md · 중간 확인 선택지" path=egm/egm-review/SKILL.md lines=229:262
@source r-rv-pause title="egm-review/SKILL.md · 일시 정지와 재감사 1회" path=egm/egm-review/SKILL.md lines=263:278
@source r-rv-uninter title="egm-review/SKILL.md · Consolidated 흐름" path=egm/egm-review/SKILL.md lines=280:313
@source r-rv-zoom title="egm-review/SKILL.md · Zoom Out 단계" path=egm/egm-review/SKILL.md lines=315:345
@source r-rv-comp title="egm-review/SKILL.md · 이해 테스트" path=egm/egm-review/SKILL.md lines=347:367
@source r-rv-crit title="egm-review/SKILL.md · Stage 7 설계 비평" path=egm/egm-review/SKILL.md lines=369:394
@source r-rv-ready title="egm-review/SKILL.md · Stage 9 구현 준비" path=egm/egm-review/SKILL.md lines=396:424
@source r-lp-over title="egm-review-loop/SKILL.md · Goldfish와 Elephant" path=egm/egm-review-loop/SKILL.md lines=19:32
@source r-lp-names title="egm-review-loop/SKILL.md · 이름 해석" path=egm/egm-review-loop/SKILL.md lines=65:78
@source r-lp-swarm title="egm-review-loop/SKILL.md · 리뷰어 병렬 실행" path=egm/egm-review-loop/SKILL.md lines=115:135
@source r-lp-fail title="egm-review-loop/SKILL.md · 실패한 리뷰어" path=egm/egm-review-loop/SKILL.md lines=140:144
@source r-lp-resolve title="egm-review-loop/SKILL.md · resolve로 넘김" path=egm/egm-review-loop/SKILL.md lines=146:155
@source r-lp-iter title="egm-review-loop/SKILL.md · 수렴과 상한" path=egm/egm-review-loop/SKILL.md lines=157:181
@source r-lp-turn title="egm-review-loop/SKILL.md · turn 경계" path=egm/egm-review-loop/SKILL.md lines=183:187
@source r-lp-out title="egm-review-loop/SKILL.md · 종료" path=egm/egm-review-loop/SKILL.md lines=189:199
@source r-rs-pre title="egm-resolve/SKILL.md · 어느 컨텍스트에서 돌리나" path=egm/egm-resolve/SKILL.md lines=24:28
@source r-rs-mode title="egm-resolve/SKILL.md · 자동 모드와 단독 모드" path=egm/egm-resolve/SKILL.md lines=43:52
@source r-rs-cat title="egm-resolve/SKILL.md · 지적 분류" path=egm/egm-resolve/SKILL.md lines=54:82
@source r-rs-report title="egm-resolve/SKILL.md · 보고서" path=egm/egm-resolve/SKILL.md lines=84:108
@source r-rs-gate title="egm-resolve/SKILL.md · 사람 결정 지점" path=egm/egm-resolve/SKILL.md lines=110:144
@source r-rs-exit title="egm-resolve/SKILL.md · 종료" path=egm/egm-resolve/SKILL.md lines=180:187

## 5단계는 어떤 순서로 도나 {#stages}

@workflow id=review-stages title="egm-review의 리뷰 단계"
| pick | 실행 방식 선택 | external |
| s5 | Stage 5 Zoom Out | backend |
| s6 | Stage 6 이해 테스트 | backend |
| s7 | Stage 7 설계 비평 | backend |
| s8 | Stage 8 중간 Zoom Out | backend |
| s9 | Stage 9 구현 준비 | backend |
| done | 리뷰 종료 | external |
| pick > s5 | 처음부터 | emphasis |
| s5 > s6 | |
| s6 > s7 | |
| s7 > s8 | |
| s8 > s9 | |
| s9 > done | |
| pick > s9 | 구현 계획만 | dashed |
| s8 > done | 기능 명세만 | dashed |

@steps id=review-stage-steps
| pick | 실행 방식 선택 | `Step` 인자가 없으면 네 가지 preset 중 하나를 사용자가 고른다. 인자가 있으면 이 질문을 건너뛴다.[](source:r-rv-preset) | review-stages | pick |
| s5 | Stage 5 Zoom Out | 전체 파일을 `egm-zoom-out`으로 점검하고 `zoom_out_report.md`를 쓴다.[](source:r-rv-uninter)[](source:r-rv-zoom) | review-stages | s5 |
| s6 | Stage 6 이해 테스트 | `egm-comprehension`을 직접 띄워 문서가 혼자 읽혀지는지 보고 `comprehension_report.md`를 쓴다.[](source:r-rv-comp) | review-stages | s6 |
| s7 | Stage 7 설계 비평 | `egm-review-loop`에 `egm-design`, `egm-structural`, `egm-style`을 `FeatureRange`에 맡긴다. 보고서는 `critic_report.md`다.[](source:r-rv-crit) | review-stages | s7 |
| s8 | Stage 8 중간 Zoom Out | 5단계 보고서 경로를 주고 이해 테스트와 비평에서 보탠 내용을 중심으로 다시 점검한다.[](source:r-rv-zoom) | review-stages | s8 |
| s9 | Stage 9 구현 준비 | `egm-review-loop`에 `egm-implementation-readiness`, `egm-codebase-details`, `egm-style`을 `DetailedRange`에 맡긴다.[](source:r-rv-ready) | review-stages | s9 |
| done | 리뷰 종료 | Stage 9 끝 선택지에서 `Conclude review and finalize document`를 고르면 끝난다.[](source:r-rv-ready) | review-stages | done |

네 가지 preset은 이렇다.[](source:r-rv-preset)

| preset | 도는 단계 | 의미 경계 탐색 |
| --- | --- | --- |
| 대화형 전체 | Stage 5~9, 단계 사이마다 중간 확인 | 한다 |
| Consolidated 전체 | Stage 5~9를 멈추지 않고 | 한다 |
| 기능 명세만 | Stage 5~8, 8 뒤에 멈춤 | 건너뛴다. `FeatureRange`는 1줄부터 끝까지다 |
| 구현 계획만 | Stage 9로 바로 | 한다. `DetailedRange`를 확인한다 |

의미 경계(semantic split)는 문서를 둘로 가르는 줄이다. `## Detailed Implementation Plan` 같은 제목(동의어 `Implementation Plan`, `Work Breakdown`, `Implementation Steps`)을 L줄에서 하나만 찾으면 `FeatureRange`는 1~L-1줄, `DetailedRange`는 L~끝줄이 된다. 후보 제목이 여럿이면 가장 그럴듯한 줄을 선택지로 사용자에게 묻고, 구현 계획이 없으면 `DetailedRange`는 N/A다.[](source:r-rv-split)

## Stage 7에서 세 스킬이 어떻게 오가나 {#delegation}

@sequence id=stage7-delegation title="Stage 7 한 라운드"
| actor review | egm-review | backend |
| actor loop | egm-review-loop | backend |
| actor gold | Goldfish 리뷰어 | backend |
| actor resolve | egm-resolve | backend |
| actor user | 사용자 | external |
| phase | 라운드 하나 |
| review | loop | 리뷰어, 기준, `FeatureRange` 전달 | emphasis |
| loop | gold | 리뷰어를 병렬로 띄움 |
| gold | loop | 지적과 리뷰어별 상태 | return |
| loop | resolve | `FindingsList` 전달 |
| resolve | user | 보고서 경로와 선택지 안내 |
| user | resolve | auto accept 같은 답 |
| resolve | loop | 수락·반박·상향·기각 건수 | return |
| loop | review | 수렴하면 실행 반환 | return |

이 순서는 원문이 말하는 대화형 흐름이다. 각 화살표의 근거는 다음 표에 있다.

| 화살표 | 규칙 | rel-id |
| --- | --- | --- |
| review → loop | Stage 7과 9에서 같은 스레드(in-thread)로 부른다. 끝나면 review에 돌려준다[](source:r-rv-crit)[](source:r-rv-ready)[](source:r-lp-out) | r08 |
| loop → gold | synthesizer를 띄우면 그쪽이 리뷰어를 병렬로 돌리고 지적을 합친다. 리뷰어를 직접 띄우는 길도 있다. 요청한 리뷰어마다 `completed` 또는 `not run` 상태를 받는다[](source:r-lp-swarm) | r14 |
| loop → resolve | 라운드마다 부른다. Elephant 컨텍스트에서 실행한다[](source:r-lp-resolve) | r10 |
| resolve → user | 사람이 답할 때까지 도구를 0번 부르고 멈춘다. loop 드라이버도 사용자가 다음 라운드를 확인하기 전에는 앞으로 가지 않는다[](source:r-rs-gate)[](source:r-lp-turn) | r10 |
| resolve → loop | 끝나면 수락·반박·상향·기각·미해결 건수를 caller에게 돌려준다[](source:r-rs-exit) | r10 |

## 대화형과 Consolidated는 무엇이 다른가 {#variants}

| 기준 | 대화형(preset 0) | Consolidated(preset 1) |
| --- | --- | --- |
| 단계 사이 | 중간 확인 선택지에서 사용자가 이어 갈지, 문서를 먼저 고칠지, 멈출지 정한다[](source:r-rv-gates) | 멈추지 않는다[](source:r-rv-uninter) |
| Stage 7·9 | `egm-review-loop`을 부른다 {good:라운드 반복}[](source:r-rv-crit)[](source:r-rv-ready) | `egm-synthesizer`에 리뷰어를 직접 맡기고 `egm-review-loop`은 부르지 않는다 {caution:한 번만 돈다}[](source:r-rv-uninter) |
| 지적 고치기 | Stage 7·9에서 `Resolve findings with agent`를 고르면 `egm-resolve`를 부른다[](source:r-rv-gates) | `egm-resolve`를 부른다는 말이 원문에 명시 없음[](source:r-rv-uninter) |
| 산출물 | 단계마다 보고서 파일을 쓴다[](source:r-rv-zoom)[](source:r-rv-comp) | 단계마다 보고서를 쓰고, 마지막에 🔴 Blocker, 🟡 Major, 🟢 Nit 우선순위와 추적 표(Traceability Matrix)를 넣은 `consolidated_review_report.md`를 쓴다[](source:r-rv-uninter) |

판정: Consolidated는 빠르게 한 번 훑는 용도이고, 지적을 고치는 루프는 대화형에서만 돈다. 이 용도 구분을 직접 설명하는 문장은 원문에 명시 없음.

`GoldfishContext`는 리뷰어가 기준선으로 읽는 파일 목록이다. 연결 파일 규칙은 이렇다.[](source:r-rv-ctx)

- Stage 6을 뺀 모든 단계에 전달한다. Stage 6은 문서만 읽는다.
- 문서가 링크한 파일 중 작업 폴더 안에 있는 것은 자동으로 목록에 들어간다.
- 작업 폴더 밖 경로나 URL은 사용자에게 어느 것을 넣을지 묻는다. 물어볼 사람이 없는 headless 실행에서는 모두 빼고 진행한다.
- URL은 원문 페이지를 새 파일로 저장하고 그 절대 경로를 전달한다. 저장하지 못하면 사용자에게 로컬 사본을 요청한다.

## 언제 멈추고 몇 번 반복하나 {#stop}

@facts id=loop-limits
| review-loop 라운드 상한 | 5라운드. 상한이나 되풀이 수정(churn)에 닿으면 사용자에게 한 가지 질문을 한다[](source:r-lp-iter) |
| 수렴 | 깨끗한 라운드가 2회 연속[](source:r-lp-iter) |
| 깨끗한 라운드 | 정리되지 않은 Blocker·Major 지적이 없는 라운드. 리뷰어가 `not run`이면 깨끗하지 않다[](source:r-lp-iter) |
| 실패한 리뷰어 | 1회 재시도하고, 또 실패하면 `not run`으로 기록한다[](source:r-lp-fail) |
| review 단계 재감사 | 단계마다 최대 1회. 한도에 닿으면 남은 지적을 수용된 절충으로 기록하고 다음 단계로 간다[](source:r-rv-pause) |

- Stage 7 안에서 review-loop이 5라운드까지 돌 수 있고, review는 단계 재감사를 1회로 제한한다. 둘이 겹칠 때 어느 쪽이 우선인지는 원문에 명시 없음.[](source:r-lp-iter)[](source:r-rv-pause)
- 사용자가 `Resolve findings with agent`를 고르면 `egm-resolve`를 다시 부르는데, review-loop 안에서 이미 라운드마다 부른 뒤다. 두 호출의 관계를 설명하는 문장은 원문에 명시 없음.[](source:r-rv-gates)[](source:r-lp-resolve)

## 지적을 어떻게 분류하고 고치나 {#resolve-rules}

`egm-resolve`는 지적마다 정확히 한 가지로 분류한다.[](source:r-rs-cat)

| 분류 | 언제 | 하는 일 |
| --- | --- | --- |
| `PROPOSE FIX` | 지적이 타당할 때 | 정확한 수정안을 쓴다 |
| `CONTEST` | 지적이 틀렸고 리뷰어가 읽을 수 있는 근거가 있을 때 | 파일과 심볼, 또는 문서에 적힌 결정을 근거로 든다 |
| `ESCALATE` | 지적은 틀렸지만 근거가 리뷰어가 읽을 수 있는 파일 밖에 있을 때 | 고치지 않고 사용자에게 넘긴다. 채팅 메시지에서 가장 먼저 보여 준다 |
| `DECLINE` | 지적이 Nit일 때 | 기록만 한다. 고칠 가치가 있으면 `PROPOSE FIX`로 쓸 수 있다 |

사용자는 보고서 `goldfish_review_report.md`를 보고 다섯 가지 중 하나로 답한다. 파일에 댓글을 남기거나, `auto accept`, `continue`, `interactive breakdown`, 자유 지시다. `auto accept`는 `PROPOSE FIX`만 한 번에 적용하고 반박·상향·기각 건은 건너뛴다.[](source:r-rs-gate)

판정: 이 규칙에서 사용자가 끼는 곳은 "어떤 지적을 문서에 반영할지"를 정하는 한 군데다. 리뷰어의 지적 자체를 막는 방법은 원문에 명시 없음. 다만 `CONTEST`는 "의도한 것"만으로는 못 하고 읽을 수 있는 근거가 필요하다고 못 박아 두었다.[](source:r-rs-cat)

## 이 흐름을 쓰기 전에 확인할 것 {#before-use}

- 서브에이전트 도구가 없으면 `egm-review`와 `egm-review-loop`은 멈추고 사용자에게 알린다. 같은 컨텍스트의 리뷰는 Goldfish 리뷰가 아니라고 적는다.[](source:r-rv-deleg)
- `egm-resolve`는 문서를 쓴 대화에서 돌리라고 권한다. 그래야 앞선 판단을 기억해 더 나은 수정을 쓴다.[](source:r-rs-pre)
- 세 스킬 모두 `disable-model-invocation: true`라서 사용자가 이름으로 불러야 켜진다.[](source:r-rv-off)[](source:r-lp-off)[](source:r-rs-off)
- `egm-resolve`는 인자가 모두 있으면 "조용히 서브프로세스처럼" 실행한다고 적고, 4단계에서는 사람이 답할 때까지 멈추라고 적는다. 둘의 우선순위는 원문에 명시 없음.[](source:r-rs-mode)[](source:r-rs-gate)

## 그림에서 뺀 관계 {#omitted}

| rel-id | 종류 | 그림에 있나 | 내용 |
| --- | --- | --- | --- |
| r08 | 내부 위임 | 있음 | review → review-loop |
| r09 | 내부 위임 | 표 | review가 `Resolve findings with agent` 선택 때 `egm-resolve`를 직접 부른다[](source:r-rv-gates) |
| r10 | 내부 위임 | 있음 | review-loop ↔ resolve |
| r11 | 내부 위임 | 표 | review가 `egm-synthesizer`를 부른다. 정의 파일은 범위 밖이다[](source:r-rv-uninter) |
| r12 | 내부 위임 | 생략 | Stage 6은 synthesizer를 거치지 않고 `egm-comprehension`을 직접 띄운다. 보고서에 paraphrase가 남게 하려는 것이다[](source:r-rv-comp) |
| r13 | 내부 위임 | 생략 | Stage 5·8은 `egm-zoom-out`. 범위 밖이다[](source:r-rv-zoom) |
| r14 | 내부 위임 | 있음 | review-loop → synthesizer → Goldfish |
| r18 | 공유 상태 | 표 | `goldfish_review_report.md`. resolve가 쓰고 끝에 `Status: resolved`를 붙인다[](source:r-rs-report)[](source:r-rs-exit) |
| r19 | 공유 상태 | 생략 | 아래 미확인 항목 |
| r25 | 참고 | 생략 | 기준 문서 `resources/document_standards/*.md`. 파일이 없어 `불명`이다[](source:r-lp-names) |

@callout level=open-question title="확인하지 못한 것"
리뷰어 정의 파일(`agents/*.md`)과 기준 문서(`resources/document_standards/*.md`)가 저장소에 없다. 그래서 리뷰어가 문서의 무엇을 보고 어떤 형식으로 지적을 내는지 확인하지 못했다.
리뷰어 이름이 두 가지로 적혀 있다. `egm-review`는 `egm-design`, `egm-structural`, `egm-style`을 넘기는데, `egm-review-loop`의 이름 해석 규칙은 `design_critic`, `structural`, `style` 같은 짧은 이름을 `agents/{name}.md`로 푼다고 적는다. 같은 대상인지 원문에 명시 없음.[](source:r-lp-names)[](source:r-rv-crit)
review-loop은 synthesizer가 보고서를 쓴다고만 하고 파일 이름을 정하지 않는다. `egm-review`는 같은 단계의 보고서를 `critic_report.md`로 부른다. 둘이 같은 파일인지 원문에 명시 없음(r19).[](source:r-lp-swarm)[](source:r-rv-crit)
일곱 스킬 공통으로 `docs/codex.md`와 `docs/claude.md`를 먼저 읽으라고 하지만 파일이 없다. 스킬은 실행하지 않았고 이 페이지는 지시상 동작이다.

@callout level=note title="이 묶음의 읽은 원문"
`egm-review`, `egm-review-loop`, `egm-resolve`의 `SKILL.md`를 다시 읽고 줄 번호를 확인했다. 각 스킬 내부 규칙과 수치는 `egm/egm-review/egm-review.html`, `egm/egm-review-loop/egm-review-loop.html`, `egm/egm-resolve/egm-resolve.html`에 있다. 앞 단계 흐름은 `egm/_group-idea-to-design/idea-to-design.html`에 있다.
