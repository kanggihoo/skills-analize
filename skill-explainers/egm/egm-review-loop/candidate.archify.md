# egm-review-loop 스킬은 에이전트를 어떻게 바꾸나 {#egm-review-loop-skill}

`egm-review-loop`를 부르면 에이전트는 문서를 한 번 검토하고 끝내지 않는다. 새 컨텍스트의 리뷰어(Goldfish)를 띄워 지적을 모으고, 그 지적을 `egm-resolve`에 넘겨 사람의 결정을 거쳐 문서에 반영하는 일을 라운드마다 되풀이한다. 정리되지 않은 Blocker·Major가 없는 라운드가 연속 두 번 나오면 멈추고, 5라운드가 차거나 되풀이 수정이 보이면 사용자에게 한 번 묻는다.[](source:rl-conv)[](source:rl-exit) 서브에이전트 정의와 기준 문서가 저장소에 없어서 리뷰어가 실제로 무엇을 보는지는 확인하지 못했다(**부분 분석**).

- 리뷰어가 실패하면 한 번 다시 시도하고, 그래도 실패하면 `not run`으로 적는다. 지적 0건으로 세지 않는다.[](source:rl-failed)
- 반박했거나 수정 없이 기록한 지적(정리된 지적)은 다음 리뷰어가 같은 범위에서 다시 올려도 다시 열지 않는다.[](source:rl-settled)
- 깨끗한 라운드는 수정을 적용하기 전의 리뷰 결과로 판정한다.[](source:rl-clean)
- `egm-resolve`가 사람 결정을 기다리는 동안 루프도 멈춘다. 사용자가 확인해야 다음 라운드로 돌아간다.[](source:rl-turn)

@answer scope="egm-review-loop · 커밋 d494974 · 지시상 동작 · 부분 분석"
@meta locale=ko
@source rl-fm title="egm/egm-review-loop/SKILL.md · 10325B · frontmatter" path=egm/egm-review-loop/SKILL.md lines=1:12
@source rl-def title="SKILL.md · Goldfish와 Elephant 정의" path=egm/egm-review-loop/SKILL.md lines=24:27
@source rl-driver title="SKILL.md · 드라이버가 하는 일" path=egm/egm-review-loop/SKILL.md lines=29:32
@source rl-deleg title="SKILL.md · 서브에이전트 띄우기와 도구가 없을 때" path=egm/egm-review-loop/SKILL.md lines=34:44
@source rl-in-core title="SKILL.md · 입력 5개 중 앞 네 개" path=egm/egm-review-loop/SKILL.md lines=48:55
@source rl-ctx title="SKILL.md · GoldfishContext 규칙" path=egm/egm-review-loop/SKILL.md lines=56:63
@source rl-names title="SKILL.md · 이름 해석 규칙" path=egm/egm-review-loop/SKILL.md lines=65:78
@source rl-ask title="SKILL.md · 빠진 입력만 묻기" path=egm/egm-review-loop/SKILL.md lines=87:92
@source rl-rec title="SKILL.md · 리뷰어 추천" path=egm/egm-review-loop/SKILL.md lines=93:99
@source rl-confirm title="SKILL.md · 구성 확인" path=egm/egm-review-loop/SKILL.md lines=100:101
@source rl-rescan title="SKILL.md · 2.1 줄 범위 재탐색" path=egm/egm-review-loop/SKILL.md lines=107:113
@source rl-swarm title="SKILL.md · 2.2 리뷰어 띄우기" path=egm/egm-review-loop/SKILL.md lines=117:135
@source rl-ids title="SKILL.md · 지적 합치기와 id" path=egm/egm-review-loop/SKILL.md lines=136:139
@source rl-failed title="SKILL.md · 실패한 리뷰어" path=egm/egm-review-loop/SKILL.md lines=140:144
@source rl-resolve title="SKILL.md · 2.3 egm-resolve에 넘김" path=egm/egm-review-loop/SKILL.md lines=146:155
@source rl-iter title="SKILL.md · 2.4 판정 규칙 머리말" path=egm/egm-review-loop/SKILL.md lines=157:161
@source rl-settled title="SKILL.md · 정리된 지적" path=egm/egm-review-loop/SKILL.md lines=162:165
@source rl-fixed title="SKILL.md · 수정된 지적" path=egm/egm-review-loop/SKILL.md lines=166:168
@source rl-clean title="SKILL.md · 깨끗한 라운드" path=egm/egm-review-loop/SKILL.md lines=169:172
@source rl-conv title="SKILL.md · 수렴" path=egm/egm-review-loop/SKILL.md lines=173:174
@source rl-cap title="SKILL.md · 상한" path=egm/egm-review-loop/SKILL.md lines=175:175
@source rl-churn title="SKILL.md · 되풀이 수정" path=egm/egm-review-loop/SKILL.md lines=176:177
@source rl-exit title="SKILL.md · 수렴·상한·되풀이 수정 뒤" path=egm/egm-review-loop/SKILL.md lines=179:181
@source rl-turn title="SKILL.md · 사람 차례 경계" path=egm/egm-review-loop/SKILL.md lines=183:187
@source rl-end title="SKILL.md · 3단계 종료 처리" path=egm/egm-review-loop/SKILL.md lines=189:199
@source rl-ts-conv title="egm/egm-review-loop/test_scenarios.yaml · 5179B · 수렴 시험" path=egm/egm-review-loop/test_scenarios.yaml lines=31:41
@source rl-ts-miss title="test_scenarios.yaml · 리뷰어 상태 누락 시험" path=egm/egm-review-loop/test_scenarios.yaml lines=43:53
@source rl-ts-url title="test_scenarios.yaml · URL 저장 시험" path=egm/egm-review-loop/test_scenarios.yaml lines=55:71
@source rl-ts-local title="test_scenarios.yaml · 저장 못 한 URL 시험" path=egm/egm-review-loop/test_scenarios.yaml lines=73:83
@source rl-ts-orch title="test_scenarios.yaml · 병렬 리뷰 조율 시험" path=egm/egm-review-loop/test_scenarios.yaml lines=19:29
@source rl-test title="egm/egm-review-loop/TEST.md · 1180B · 확인 목록" path=egm/egm-review-loop/TEST.md lines=5:13
@source rl-test-degraded title="TEST.md · 2.2 확인 항목" path=egm/egm-review-loop/TEST.md lines=11:11
@source rl-yaml title="egm/egm-review-loop/agents/openai.yaml · 204B · 표시 이름과 한 줄 설명" path=egm/egm-review-loop/agents/openai.yaml lines=1:6
@source rl-icon title="egm/egm-review-loop/assets/icon.svg · 544B · 아이콘(그림 데이터만 있음)" path=egm/egm-review-loop/assets/icon.svg
@source er-critic title="egm/egm-review/SKILL.md · Stage 7이 이 스킬을 부르는 곳" path=egm/egm-review/SKILL.md lines=371:374
@source er-ready title="egm-review/SKILL.md · Stage 9이 이 스킬을 부르는 곳" path=egm/egm-review/SKILL.md lines=398:403
@source er-unint title="egm-review/SKILL.md · Consolidated 흐름의 Stage 5~9" path=egm/egm-review/SKILL.md lines=287:303
@source rs-exit title="egm/egm-resolve/SKILL.md · 끝나면 caller에 건수를 돌려줌" path=egm/egm-resolve/SKILL.md lines=185:187
@source rs-cat title="egm-resolve/SKILL.md · 지적 분류 네 가지" path=egm/egm-resolve/SKILL.md lines=56:67

## 언제 켜지고 무엇을 받아야 시작하나 {#trigger}

@code source=rl-fm language=yaml

- `disable-model-invocation: true`가 켜져 있다. 필드 이름 그대로 모델이 이 스킬을 스스로 켜지 못하게 하는 표시로 보인다.[](source:rl-fm) 판정: 필드가 정확히 어떻게 동작하는지는 이 저장소에 설명이 없다.
- `egm-review`는 Stage 7과 Stage 9에서 이 스킬을 같은 스레드 안에서 부른다.[](source:er-critic)[](source:er-ready) 사용자가 직접 부르는 경로와 다른 스킬이 부르는 경로가 둘 다 원문에 있다.
- `description`은 설계 문서, README, 기능 명세, 구현 계획을 검토하거나 완성도와 어조를 확인할 때 쓰라고 소개한다.[](source:rl-fm) 판정: `description`은 모델이 판단할 때 참고하는 설명이다. 이 단어가 있으면 켜진다는 뜻으로 읽지 않는다.
- 입력이 하나라도 빠지면 에이전트가 빠진 것만 한 번에 하나씩 채팅으로 묻는다. 모두 있으면 바로 2단계로 간다.[](source:rl-ask)

입력은 다섯 개다. 호출자나 사용자가 "exactly these parameters"를 준다고 원문이 적는다.[](source:rl-in-core)

| 입력 | 뜻 |
| --- | --- |
| `TargetFile` | 대상 문서의 절대 또는 상대 경로[](source:rl-in-core) |
| `SemanticTarget` | 대상 범위를 가리키는 문자열. 예로 "SS-ID 'S1.12'인 H4 블록"을 들거나 `full file`을 쓴다. 라운드마다 이 문자열로 줄 번호를 다시 찾는다[](source:rl-in-core)[](source:rl-rescan) |
| `Reviewers` | 리뷰어 이름 목록. 짧은 이름이나 경로[](source:rl-in-core) |
| `Standards` | 리뷰어 이름을 기준 이름에 이어 주는 맵[](source:rl-in-core) |
| `GoldfishContext` | 리뷰어가 바탕 지식으로 읽을 목록. 소스 파일, 폴더, 문서 URL[](source:rl-ctx) |

`GoldfishContext`에는 따로 지키는 규칙이 있다.[](source:rl-ctx)

- 호출자가 빈 목록을 주면 "제공된 것"으로 본다. 다시 묻지 않는다.
- 일부 리뷰어는 URL을 열지 못한다. 그래서 첫 라운드 전에 URL마다 raw page를 작업 폴더(또는 하네스의 artifact 폴더)에 새 파일로 저장하고, URL 대신 그 절대 경로를 넘긴다.
- 저장하지 못하면 사용자에게 로컬 사본을 묻고 턴을 끝낸다. 답할 사람이 없는 headless 실행이면 그 URL을 빼고, 사용자에게 알린 뒤 계속한다.

시험 시나리오 두 개가 이 규칙을 확인한다. URL 시나리오는 "페이지를 저장한다고 답할 것, 저장을 건너뛰거나 URL을 그대로 넘기지 말 것"을 요구하고, 저장 불가 시나리오는 로컬 사본을 묻는 질문을 요구한다.[](source:rl-ts-url)[](source:rl-ts-local)

이름은 아래처럼 파일로 풀린다.[](source:rl-names)

| 이름 | 풀리는 곳 |
| --- | --- |
| 리뷰어 짧은 이름 (`design_critic`, `structural`, `style`, `implementation_readiness`, `codebase_details`, `comprehension`, `zoom_out`) | `agents/{name}.md`. 리뷰어의 임무, 점검 항목, 출력 형식을 정의한다 {caution:파일 없음}[](source:rl-names) |
| 기준 짧은 이름 (`feature-spec-standard`, `implementation-readiness-standard`, `zoom-out-standard`, `heilmeier-standard`, `re-implementation-standard`) | `resources/document_standards/{name}.md` {caution:파일 없음}[](source:rl-names) |
| `/`가 들어간 이름 | 절대 경로나 작업 공간 상대 경로로 보고 직접 읽는다[](source:rl-names) |

입력이 모이면 에이전트는 리뷰어를 추천한다.[](source:rl-rec)

- 기능 명세는 `design_critic`과 `structural`을 추천한다. 둘 다 `feature-spec-standard`에 묶는다.
- 구현 계획은 `implementation_readiness`(`implementation-readiness-standard`)와 `codebase_details`를 추천한다.

마지막으로 대상, 리뷰어, 기준을 한 번에 보여 주고 사용자에게 확인을 받는다.[](source:rl-confirm)

## 한 라운드는 무엇을 하나 {#round}

@workflow id=round-flow title="egm-review-loop 한 라운드와 종료"
| lane round | 한 라운드 |
| lane exit | 종료 판단 |
| target | 줄 범위 재탐색 | backend | round |
| swarm | 리뷰어 병렬 실행 | backend | round |
| merge | 지적 합치고 판정 | backend | round |
| resolve | egm-resolve 위임 | backend | round |
| wait | 사람 결정 대기 | external | round |
| conv | 2연속 깨끗? | backend | exit |
| cap | 5라운드·되풀이? | backend | exit |
| ask | 사용자에게 질문 | external | exit |
| done | 종료 처리 | backend | exit |
| target > swarm | |
| swarm > merge | |
| merge > resolve | 수정 전 판정 |
| resolve > wait | |
| wait > conv | |
| conv > done | 예 | emphasis |
| conv > cap | 아니오 |
| cap > target | 아니오 | dashed |
| cap > ask | 예 |
| ask > done | 수락·되돌림 |

@steps id=round-steps
| target | 줄 범위 재탐색 | 매 반복 앞에서 `TargetFile`을 다시 읽고 `SemanticTarget`으로 시작·끝 줄을 새로 구한다. 앞 라운드에서 파일이 바뀌어도 줄 번호가 맞도록 하는 단계다. `full file`이면 전체 줄 범위를 확인한다.[](source:rl-rescan) | round-flow | target |
| swarm | 리뷰어 병렬 실행 | 서브에이전트를 띄워 리뷰를 맡긴다. 리뷰어는 지적마다 심각도(Blocker, Major, Nit), 줄 번호, 불일치 설명, 근거를 낸다.[](source:rl-swarm) | round-flow | swarm |
| merge | 지적 합치고 판정 | 모든 지적을 하나의 `FindingsList`로 모으고 `<reviewer>-<round>-<n>` 형식의 id를 붙인다. 리뷰어, 심각도, 범위를 기록한다. 이번 라운드가 깨끗한지는 이 리뷰 결과로, 수정을 적용하기 전에 정한다.[](source:rl-ids)[](source:rl-clean) | round-flow | merge |
| resolve | egm-resolve 위임 | `TargetFile`, 줄 범위, `FindingsList`를 `egm-resolve`에 넘긴다. 분류, 보고서 저장, 선택지 제시, 승인된 수정 적용을 Elephant 컨텍스트에서 한다.[](source:rl-resolve) | round-flow | resolve |
| wait | 사람 결정 대기 | `egm-resolve`의 사람 결정 지점을 존중한다. 사용자가 새 라운드를 하겠다고 확인할 때까지 루프는 멈춰 있다.[](source:rl-turn) | round-flow | wait |
| conv | 2연속 깨끗? | 깨끗한 라운드가 연속 두 번이면 수렴이다. 수렴하면 3단계로 간다.[](source:rl-conv)[](source:rl-exit) | round-flow | conv |
| cap | 5라운드·되풀이? | 상한이나 되풀이 수정에 걸리면 미해결 지적을 심각도순으로 짧게 적는다.[](source:rl-exit) | round-flow | cap |
| ask | 사용자에게 질문 | 질문은 하나다. 수락하고 진행, 상한을 넘겨 계속, 문서를 drafting으로 되돌리기 중에서 고르게 한다.[](source:rl-exit) | round-flow | ask |
| done | 종료 처리 | 프로그램 호출이면 부모 흐름으로 돌려준다. 수동 호출이면 요약 메시지를 낸다.[](source:rl-end) | round-flow | done |

그림은 사용자가 "상한을 넘겨 계속"을 고르는 경우를 생략했다. 이 선택은 새 라운드로 돌아간다.[](source:rl-exit)

리뷰어를 띄우는 방법은 둘이다.[](source:rl-swarm)

- **synthesizer 경유(기본으로 먼저 적힌 방식)**: 중간 `egm-synthesizer`를 띄운다. synthesizer가 리뷰어를 병렬로 돌리고, 중복을 줄이고, 보고서를 쓰고, 요약 메시지 하나만 돌려줘서 루트 대화가 길어지지 않게 한다. 요청한 리뷰어마다 `completed` 또는 `not run` 상태를 요약에 넣어야 한다. 에이전트는 이 synthesizer에 실패 리뷰어 규칙과 `GoldfishContext`를 주고, 그 파일을 리뷰어마다 넘기라고 말해야 한다.
- **직접 띄우기**: `Reviewers`의 리뷰어를 하나씩 직접 띄운다. 각 서브에이전트에게 먼저 `agents/{name}.md`를 읽고, 정해진 기준(`resources/document_standards/`)으로 해당 줄 범위를 감사하라고 시킨다. `GoldfishContext`도 준다.

두 방식 중 무엇을 고르는지는 하나만 적혀 있다. 하니스가 서브에이전트를 중첩할 수 없으면 synthesizer 대신 직접 띄운다.[](source:rl-deleg) 그 밖의 선택 기준은 원문에 명시 없음.

서브에이전트 도구가 아예 없으면 에이전트는 멈추고 사용자에게 "같은 컨텍스트의 리뷰는 Goldfish 리뷰가 아니다"라고 알린다.[](source:rl-deleg)

@callout level=warning title="TEST.md와 SKILL.md가 서로 다른 말을 한다"
`SKILL.md`는 서브에이전트 도구가 없으면 중단하라고 적는다.[](source:rl-deleg) `TEST.md`의 확인 항목은 서브에이전트를 띄우거나 "degraded mode에서 페르소나를 순서대로 돌린다"고 적는다.[](source:rl-test-degraded) 어느 쪽이 우선인지는 원문에 명시 없음. 이 분석은 `SKILL.md`를 따른다.

## 언제 멈추나 {#stop}

새 리뷰어는 라운드마다 다르게 표본을 뽑는다. 그래서 문서가 좋아져도 지적이 0건인 라운드는 드물다. 원문은 지적 수를 세지 않고 아래 규칙으로 멈춘다.[](source:rl-iter)

| 용어 | 뜻 | 효과 |
| --- | --- | --- |
| 정리된 지적 | 반박됐거나 수정 없이 기록된(받아들인 위험) 지적[](source:rl-settled) | 라운드를 넘어 목록을 유지한다. 새 리뷰어가 같은 범위에서 같은 문제를 올려도 다시 열지 않는다[](source:rl-settled) |
| 수정된 지적 | 수정을 적용한 지적. 수정만으로는 정리되지 않는다[](source:rl-fixed) | 뒤 리뷰어가 같은 범위에서 같은 문제를 올리면 수정이 실패했거나 뒤 편집이 문제를 되살린 것이다. 지적을 다시 연다[](source:rl-fixed) |
| 깨끗한 라운드 | 정리되지 않은 Blocker나 Major를 올린 리뷰어가 없는 라운드. Nit은 막지 않는다[](source:rl-clean) | `not run` 리뷰어가 있으면 깨끗하지 않다. 수정을 적용하기 전의 리뷰 결과로 정한다[](source:rl-clean) |
| 수렴 | 깨끗한 라운드가 연속 두 번[](source:rl-conv) | 한 번으로는 모자란다. 다음 새 리뷰어가 같은 글에서 다른 빈틈을 찾을 수 있기 때문이다[](source:rl-conv) |
| 상한 | 5라운드[](source:rl-cap) | 닿으면 사용자에게 묻는다[](source:rl-exit) |
| 되풀이 수정 | 새 지적이 적용한 수정의 범위에 있고, 그 수정을 되돌리면 지적이 풀리는 경우[](source:rl-churn) | 닿으면 사용자에게 묻는다[](source:rl-exit) |

@facts id=round-numbers
| 수렴 조건 | 깨끗한 라운드 연속 2회[](source:rl-conv) |
| 라운드 상한 | 5라운드[](source:rl-cap) |
| 실패한 리뷰어 재시도 | 1회. 그래도 실패하면 `not run`[](source:rl-failed) |
| 사용자에게 묻는 질문 수 | 상한이나 되풀이 수정에서 하나[](source:rl-exit) |

시험 시나리오 두 개가 이 규칙을 숫자로 보여 준다.

- 라운드 3에서 Nit 둘과 라운드 1에서 반박된 Major가 나오고, 라운드 2는 깨끗했다. Major는 정리된 지적이고 Nit은 막지 않으므로 라운드 3도 깨끗하다. 깨끗한 라운드가 2와 3으로 연속이어서 수렴이다.[](source:rl-ts-conv)[](source:rl-settled)[](source:rl-clean) 판정: 시나리오는 "converged", "two consecutive clean", "settled" 중 하나가 답에 들어가면 통과한다. 위 계산은 그 규칙을 적용한 것이다.
- synthesizer 요약이 "0 findings, `egm-design` completed, `egm-structural` completed"이고 `egm-style`도 요청했다면, `egm-style`은 상태가 없으므로 `not run`이다. 그래서 그 라운드는 깨끗하지 않다.[](source:rl-ts-miss)[](source:rl-failed)

끝나는 길은 셋이다.[](source:rl-exit)[](source:rl-end)

| 상황 | 하는 일 |
| --- | --- |
| 수렴 | 3단계로 간다[](source:rl-exit) |
| 상한이나 되풀이 수정 | 미해결 지적을 심각도순으로 짧게 적고, 사용자에게 한 질문을 한다. 수락하고 진행, 상한을 넘겨 계속, 문서를 drafting으로 되돌리기 중에서 고른다[](source:rl-exit) |
| 수동 중단 | 3단계로 간다. 원문은 완료 조건에 "수동 중단"을 넣지만 어떻게 중단하는지는 적지 않았다[](source:rl-end) |

3단계에서는 호출 방식에 따라 다르게 끝낸다.[](source:rl-end)

- `egm-review`의 하위 흐름으로 돌았으면 조용히 빠져나와 실행을 부모 흐름에 돌려준다.
- 사용자가 직접 불렀으면 채팅에 요약을 낸다. 몇 라운드를 돌았는지(수렴, 상한에서 수락, 중단 중 하나), 열린 지적이 보고서에 있다는 말, 다음 단계로 갈지 마지막 질문이 있는지를 묻는 문장이다.

@callout level=open-question title="판정 규칙에서 원문이 정하지 않은 것"
정리된 지적의 정의는 "반박됐거나 수정 없이 기록된 지적"이다.[](source:rl-settled) `egm-resolve`는 지적을 `CONTEST`, `ESCALATE`, `PROPOSE FIX`, `DECLINE` 네 가지로 나눈다.[](source:rs-cat) 그런데 이 스킬은 2.3에서 `CONTEST`와 `PROPOSE FIX` 둘만 적는다.[](source:rl-resolve) `ESCALATE`와 `DECLINE`이 정리된 지적에 들어가는지는 원문에 명시 없음.
정리된 지적 목록과 라운드 수를 어디에 보관하는지도 원문에 명시 없음.
깨끗한 라운드 판정(2.4)과 `egm-resolve`의 사람 결정 대기가 어떤 순서인지는, 2.4가 2.3보다 뒤에 적혀 있다는 점 말고는 원문에 명시 없음. 위 그림은 적힌 순서를 따랐다.

## 무엇을 강제하고, 만들고, 바꾸나 {#rules}

| 항목 | 구분 | 내용 |
| --- | --- | --- |
| 줄 범위 | 강제 | 매 반복 앞에서 줄 범위를 다시 찾는다("unconditionally")[](source:rl-rescan) |
| 리뷰어 컨텍스트 | 강제 | 리뷰어는 서브에이전트가 가진 새 컨텍스트에서 돈다. 이전 대화 기록이 없다[](source:rl-def)[](source:rl-deleg) |
| 실패한 리뷰어 | 강제 | 실패하거나 보고서가 없는 리뷰어는 한 번 재시도하고, 다시 실패하면 `not run`으로 적는다. 요약에 상태가 없는 리뷰어도 `not run`이다[](source:rl-failed) |
| 새 라운드 확인 | 강제 | 사용자가 새 라운드를 확인할 때까지 대기한다("MUST respect")[](source:rl-turn) |
| URL 저장 | 강제 | URL은 첫 라운드 전에 파일로 저장해서 넘긴다[](source:rl-ctx) |
| 지적 0건 처리 | 금지 | 실패한 리뷰어를 "지적 0건"으로 세지 않는다("Never count")[](source:rl-failed) |
| 정리된 지적 | 금지 | 정리된 지적을 다시 열지 않는다("do not re-open")[](source:rl-settled) |
| 빈 `GoldfishContext` | 금지 | 빈 `GoldfishContext`를 다시 묻지 않는다("do not ask for it again")[](source:rl-ctx) |
| 도구 없는 환경 | 금지 | 서브에이전트 도구가 없을 때 같은 컨텍스트에서 리뷰를 대신하지 않는다[](source:rl-deleg) |

만들고 바꾸는 것은 이렇다.

- `GoldfishContext`의 URL마다 raw page 파일을 새로 만든다. 위치는 작업 폴더 또는 하네스의 artifact 폴더다.[](source:rl-ctx)
- synthesizer가 "report artifact"를 쓴다고 하지만 파일 이름은 정하지 않았다.[](source:rl-swarm)
- `egm-resolve`가 `goldfish_review_report.md`를 저장하고 승인된 텍스트 수정을 `TargetFile`에 적용한다. 이 스킬 자신은 문서를 고치지 않는다.[](source:rl-resolve) 판정: 2.3의 네 항목이 모두 `egm-resolve` 워크플로 안에서 실행된다고 적혀 있어서 그렇게 읽었다.

이 스킬은 에이전트가 쓰는 도구를 따로 정하지 않는다. 서브에이전트를 띄우는 도구 이름은 하네스마다 다르다고 `Delegation` 절이 적는다.[](source:rl-deleg) 이 스킬이 만든 보고서의 경로를 안내하는 규칙은 원문에 명시 없음.

## 흐름 속 위치 {#position}

이 스킬은 `egm-review`의 Stage 7과 Stage 9에서 불려 나와 일하고, 매 라운드 `egm-resolve`에 지적을 넘긴다. 사용자가 직접 부를 수도 있다. 전체 흐름은 `egm/_group-review-and-fix/review-and-fix.html`에 있다.

@workflow id=loop-position title="앞과 뒤"
| review | egm-review | backend |
| loop | egm-review-loop | backend |
| resolve | egm-resolve | backend |
| review > loop | r08 Stage 7·9 | emphasis |
| loop > resolve | r10 매 라운드 |

| rel-id | 방향 | 상대 | 종류 | 조건·받는 것·넘기는 것 |
| --- | --- | --- | --- | --- |
| r08 | 앞 | egm-review | 내부 위임 | 대화형 흐름에서 Stage 7은 `FeatureRange`에 리뷰어 `[egm-design, egm-structural, egm-style]`로, Stage 9는 `DetailedRange`에 `[egm-implementation-readiness, egm-codebase-details, egm-style]`로 같은 스레드에서 부른다. 받는 것은 `TargetFile`, 줄 범위, 리뷰어, 기준, `GoldfishContext`. 끝나면 실행을 review에 돌려준다. `Consolidated report` 흐름에서는 review가 이 스킬을 부르지 않고 synthesizer를 직접 띄운다(r11)[](source:er-critic)[](source:er-ready)[](source:rl-end)[](source:er-unint) |
| r10 | 뒤 | egm-resolve | 내부 위임 | 라운드마다 `TargetFile`, 줄 범위, `FindingsList`를 넘긴다. resolve는 끝나면 수락·반박·상향·기각·미해결 건수를 caller에게 돌려준다[](source:rl-resolve)[](source:rs-exit) |
| r14 | 아래 | egm-synthesizer | 내부 위임 | 기본 경로에서 리뷰어를 병렬로 돌리고 지적을 합치는 중간 서브에이전트. 정의 파일이 저장소에 없다 {caution:범위 밖}[](source:rl-swarm) |
| r25 | 아래 | `resources/document_standards/*.md` | 참고 | 리뷰어에 붙이는 기준 문서 다섯 종. 파일이 저장소에 없다 {caution:불명}[](source:rl-names) |
| r19 | 옆 | egm-review | 공유 상태 | 원문에 명시 없음. synthesizer가 쓰는 보고서 이름을 이 스킬은 정하지 않고, review는 `critic_report.md` 등으로 부른다. 같은 파일인지 확인하지 못했다[](source:rl-swarm)[](source:er-critic) |

## 어디까지 확인했고 무엇을 모르나 {#audit}

@facts id=audit-facts
| 읽은 텍스트 파일 | 5개, 합계 17,432B (`SKILL.md` 10,325B, `test_scenarios.yaml` 5,179B, `TEST.md` 1,180B, `agents/openai.yaml` 204B, `assets/icon.svg` 544B) |
| 구조·표본만 읽은 파일 | 0개 |
| 바이너리 | 없음 |
| 실행 | 하지 않았다. 지시상 동작만 분석했다 |

`agents/openai.yaml`은 표시 이름 "EGM Review loop"와 한 줄 설명 "Repeat design reviews and resolve findings"를 담는다.[](source:rl-yaml) `assets/icon.svg`는 아이콘 그림 데이터뿐이고 지시가 없다.[](source:rl-icon) `TEST.md`는 `SKILL.md`의 라운드 규칙을 확인 항목으로 되풀이한다.[](source:rl-test) `test_scenarios.yaml`의 첫 시나리오는 병렬 리뷰 조율에 리뷰, Goldfish, 지적, 페르소나 같은 말이 나오는지만 본다.[](source:rl-ts-orch)

분석 직전 최신화(`egm` 7개 스킬, `scripts/update-skill.py`)로 이 스킬의 파일 3개가 바뀌었다. `SKILL.md` +11/−3줄(URL을 파일로 저장하는 규칙과, synthesizer에 `GoldfishContext`를 넘기는 규칙이 추가됨), `TEST.md` ±1줄, `test_scenarios.yaml` +30줄(URL 시나리오 둘, 리뷰어 상태 누락 시나리오 추가). 분석 도중에는 바뀐 파일이 없다. 제외한 파일도 없다.

@callout level=open-question title="확인하지 못한 것"
서브에이전트 정의 `agents/{name}.md`와 기준 문서 `resources/document_standards/{name}.md`가 저장소에 없다. 리뷰어가 정확히 무엇을 점검하고 어떤 형식으로 지적을 내는지 확인하지 못했다. 서브에이전트 정의가 `agents/synthesizer.md`로 적혀 있다는 점까지만 안다.[](source:rl-swarm)
첫머리의 `docs/codex.md`와 `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`, 그리고 `docs/harnesses.md`도 저장소에 없어서 읽지 못했다. 일곱 스킬이 같은 안내문을 가진다.[](source:rl-driver)[](source:rl-deleg)
리뷰어 이름이 두 스킬에서 다르게 적혀 있다. `egm-review`는 `egm-design`, `egm-structural`, `egm-style`을 넘기고, 이 스킬의 이름 해석표는 `design_critic`, `structural`, `style`을 예로 든다.[](source:er-critic)[](source:rl-names) 같은 대상을 가리키는지 확인하지 못했다.
입력이 모두 있을 때 확인 질문을 하는지도 원문이 엇갈린다. Step 1은 입력이 모두 있으면 2단계로 간다고 하고, 4번 항목은 진행 전에 구성을 확인받으라고 한다.[](source:rl-ask)[](source:rl-confirm) 우선순위는 원문에 명시 없음.
합쳐 쓰는 보고서의 파일 이름이 정해지지 않았다(r19).
