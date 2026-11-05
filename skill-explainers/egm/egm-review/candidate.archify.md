# egm-review 스킬은 에이전트를 어떻게 바꾸나 {#egm-review-skill}

`egm-review`를 부르면 에이전트는 설계 문서를 혼자 평가하지 않는다. 문서를 5개 단계(Stage 5~9)로 나눠, Goldfish(새 컨텍스트에서 시작하는 리뷰 서브에이전트)에게 점검시키고 단계마다 보고서 파일을 쓴다.[](source:rv-fm)[](source:rv-deleg) **부분 분석**이다. 리뷰어 정의 파일과 기준 문서가 이 저장소에 없어서, 리뷰어가 문서에서 무엇을 어떻게 찾는지는 확인하지 못했다.[](source:rv-deleg)[](source:rl-std)

- 실행 방식은 네 가지 preset 중 사용자가 고른다. 대화형은 단계마다 사용자에게 다음 행동을 묻고, `Consolidated report`는 끝까지 멈추지 않는다.[](source:rv-s2d)
- 서브에이전트 도구가 없으면 에이전트는 멈추고 사용자에게 알린다. 같은 컨텍스트에서 하는 리뷰는 Goldfish 리뷰가 아니기 때문이다.[](source:rv-deleg)
- 문서 수정은 Stage 7·9의 중간 확인에서 사용자가 `Resolve findings with agent`를 고를 때 `egm-resolve`가 맡는다.[](source:rv-critg)[](source:rv-readyg)
- 긴 결과는 채팅에 붙이지 않고 보고서 파일에 쓴 뒤 경로만 알린다.[](source:rv-art)

@answer scope="egm/egm-review · 텍스트 5개 35617B · 커밋 d494974 · 실행 안 함 · 지시상 동작 · 부분 분석"
@meta locale=ko
@source rv-fm title="egm/egm-review/SKILL.md · 24113B · frontmatter" path=egm/egm-review/SKILL.md lines=2:9
@source rv-intro title="SKILL.md · 시작 안내와 목적" path=egm/egm-review/SKILL.md lines=14:17
@source rv-deleg title="SKILL.md · Delegation" path=egm/egm-review/SKILL.md lines=21:28
@source rv-art title="SKILL.md · 제약 1 파일 먼저" path=egm/egm-review/SKILL.md lines=32:37
@source rv-plain title="SKILL.md · 제약 2 평이한 영어" path=egm/egm-review/SKILL.md lines=38:43
@source rv-stress title="SKILL.md · 제약 3~9 반박과 맞장구 금지" path=egm/egm-review/SKILL.md lines=44:61
@source rv-apol title="SKILL.md · 제약 10 사과 금지" path=egm/egm-review/SKILL.md lines=62:64
@source rv-inv title="SKILL.md · 제약 11 질문 불변식" path=egm/egm-review/SKILL.md lines=65:69
@source rv-inputs title="SKILL.md · Inputs" path=egm/egm-review/SKILL.md lines=73:78
@source rv-s1t title="SKILL.md · 1단계 TargetFile 확인" path=egm/egm-review/SKILL.md lines=84:90
@source rv-s1c title="SKILL.md · 1단계 GoldfishContext 확인" path=egm/egm-review/SKILL.md lines=91:100
@source rv-s1l title="SKILL.md · 1단계 3항 연결 파일(나중에 실행)" path=egm/egm-review/SKILL.md lines=101:119
@source rv-s2g title="SKILL.md · 2단계 preset 선택 조건" path=egm/egm-review/SKILL.md lines=123:131
@source rv-s2i title="SKILL.md · 2단계 선택지 불변식" path=egm/egm-review/SKILL.md lines=134:142
@source rv-s2p title="SKILL.md · 2단계 선택지 payload" path=egm/egm-review/SKILL.md lines=143:160
@source rv-s2d title="SKILL.md · 2단계 preset별 동작" path=egm/egm-review/SKILL.md lines=164:177
@source rv-s3b title="SKILL.md · 3단계 분할 건너뛰기" path=egm/egm-review/SKILL.md lines=181:183
@source rv-s3s title="SKILL.md · 3단계 분할 경계 찾기" path=egm/egm-review/SKILL.md lines=186:196
@source rv-s3a title="SKILL.md · 3단계 경계가 애매할 때" path=egm/egm-review/SKILL.md lines=197:202
@source rv-s3n title="SKILL.md · 3단계 구현 계획이 없을 때" path=egm/egm-review/SKILL.md lines=203:207
@source rv-s4 title="SKILL.md · 4단계 실행 순서" path=egm/egm-review/SKILL.md lines=213:223
@source rv-gate title="SKILL.md · 중간 확인 선택지 패턴" path=egm/egm-review/SKILL.md lines=236:251
@source rv-sem title="SKILL.md · 수정 경로(Option 1)" path=egm/egm-review/SKILL.md lines=252:262
@source rv-pause title="SKILL.md · 멈춤과 재개, 재감사 한도" path=egm/egm-review/SKILL.md lines=263:275
@source rv-halt title="SKILL.md · Pause Review" path=egm/egm-review/SKILL.md lines=276:278
@source rv-un title="SKILL.md · Uninterrupted 단계 실행" path=egm/egm-review/SKILL.md lines=282:303
@source rv-uns title="SKILL.md · Uninterrupted 종합과 전달" path=egm/egm-review/SKILL.md lines=304:313
@source rv-zoom title="SKILL.md · Zoom Out Review" path=egm/egm-review/SKILL.md lines=317:325
@source rv-zoomg title="SKILL.md · Zoom Out 중간 확인" path=egm/egm-review/SKILL.md lines=328:345
@source rv-comp title="SKILL.md · Comprehension Test" path=egm/egm-review/SKILL.md lines=349:358
@source rv-compg title="SKILL.md · Comprehension 중간 확인" path=egm/egm-review/SKILL.md lines=361:367
@source rv-crit title="SKILL.md · Critic Review" path=egm/egm-review/SKILL.md lines=371:376
@source rv-critg title="SKILL.md · Critic 중간 확인과 수정" path=egm/egm-review/SKILL.md lines=377:394
@source rv-ready title="SKILL.md · Implementation Readiness" path=egm/egm-review/SKILL.md lines=398:405
@source rv-readyg title="SKILL.md · Readiness 중간 확인과 수정" path=egm/egm-review/SKILL.md lines=406:424
@source rv-test-md title="egm/egm-review/TEST.md · 996B · 검증 체크리스트" path=egm/egm-review/TEST.md lines=1:18
@source rv-test-yaml title="egm/egm-review/test_scenarios.yaml · 9780B · 평가 시나리오 10개" path=egm/egm-review/test_scenarios.yaml
@source rv-test-gate title="test_scenarios.yaml · feature spec 시나리오" path=egm/egm-review/test_scenarios.yaml lines=40:53
@source rv-yaml title="egm/egm-review/agents/openai.yaml · 198B · 표시 이름 설정" path=egm/egm-review/agents/openai.yaml
@source rv-icon title="egm/egm-review/assets/icon.svg · 530B · 아이콘" path=egm/egm-review/assets/icon.svg
@source dr-handoff title="egm/egm-draft/SKILL.md · 17479B · r05 확인용(handoff)" path=egm/egm-draft/SKILL.md lines=317:321
@source dr-zoom title="egm-draft/SKILL.md · r06 확인용(Zoom Out 채점 안 함)" path=egm/egm-draft/SKILL.md lines=257:260
@source dr-cons title="egm-draft/SKILL.md · r23 확인용(제약 묶음)" path=egm/egm-draft/SKILL.md lines=24:36
@source rl-eleph title="egm/egm-review-loop/SKILL.md · 10325B · Elephant와 Goldfish 정의" path=egm/egm-review-loop/SKILL.md lines=24:27
@source rl-syn title="egm-review-loop/SKILL.md · r19 확인용(synthesizer가 보고서 작성)" path=egm/egm-review-loop/SKILL.md lines=119:123
@source rl-res title="egm-review-loop/SKILL.md · r10 확인용(라운드마다 resolve)" path=egm/egm-review-loop/SKILL.md lines=146:156
@source rl-ret title="egm-review-loop/SKILL.md · r08 확인용(호출한 쪽에 돌려줌)" path=egm/egm-review-loop/SKILL.md lines=194:195
@source rl-map title="egm-review-loop/SKILL.md · 리뷰어 이름 해석표" path=egm/egm-review-loop/SKILL.md lines=69:72
@source rl-std title="egm-review-loop/SKILL.md · 기준 문서 이름 해석표" path=egm/egm-review-loop/SKILL.md lines=74:78
@source rs-cat title="egm/egm-resolve/SKILL.md · 8541B · 지적 분류 네 가지" path=egm/egm-resolve/SKILL.md lines=56:67
@source rs-file title="egm-resolve/SKILL.md · r18 확인용(보고서 파일)" path=egm/egm-resolve/SKILL.md lines=86:88

## 언제 켜지고 무엇을 받아야 시작하나 {#trigger}

@code source=rv-fm language=yaml

- 호출 제한 필드 `disable-model-invocation`이 `true`다.[](source:rv-fm) 하니스가 이 값을 어떻게 처리하는지는 `SKILL.md`에 원문에 명시 없음. 판정: 필드 이름대로면 모델이 `description`만 보고 스스로 켜지 않고, 사용자가 이름으로 부르는 스킬이다.
- `egm-draft`는 Claude Code에서 `/egm:egm-review <DESIGN_PATH>`처럼 부르라고 안내한다.[](source:dr-handoff)
- `description`은 5개 단계 이름을 나열할 뿐 활성화 조건을 적지 않는다.[](source:rv-fm)

| 입력 | 규칙 |
| --- | --- |
| `TargetFile` | 설계 문서 경로. 없으면 에이전트가 일반 채팅 문장으로 경로를 묻고 턴을 끝낸다. 경로는 자유 입력이라 질문 도구를 쓰지 않는다.[](source:rv-s1t) |
| `GoldfishContext` | (선택) 리뷰어가 기준선으로 읽을 파일 목록. 빈 목록도 "제공"으로 센다. 사용자가 맥락 없이 진행하라고 말해도 제공으로 센다. 비어 있으면 아래 연결 파일 규칙이 더하는 파일만 담긴다.[](source:rv-inputs)[](source:rv-s1c) |
| `Step` | (선택) `interactive`, `uninterrupted`, `feature_spec`, `implementation` 중 하나, 또는 개별 단계 `5`~`9`. 주면 preset 선택 질문을 건너뛴다. 생략하면 사용자에게 묻는다.[](source:rv-inputs)[](source:rv-s2g) |

`GoldfishContext`가 없으면 에이전트는 이 목록이 선택이라고 설명한다. 같은 작업 폴더 안의 연결 파일은 자동으로 더해지고, 다른 링크와 URL은 승인이 필요하다고 알린 뒤 채팅으로 추가 파일을 묻는다.[](source:rv-s1c) 판정: `Step`의 네 이름은 preset 0~3에 대응하는 것으로 읽힌다. 대응표는 원문에 명시 없음.

에이전트는 연결 파일 규칙을 입력 확인 단계에서 돌리지 않는다. preset을 고른 뒤 `GoldfishContext`를 받는 첫 단계 직전에 한 번 돌리고, `uninterrupted` 흐름도 같다.[](source:rv-s1l)

| 링크 | 처리 |
| --- | --- |
| `#...`만 있는 링크 | 건너뛴다.[](source:rv-s1l) |
| `#fragment`가 붙은 링크 | `#fragment`를 떼고 처리한다. 상대 링크는 설계 문서가 있는 폴더 기준으로 푼다.[](source:rv-s1l) |
| symbolic link를 따라간 실제 경로가 작업 폴더 안 | 자동으로 `GoldfishContext`에 더한다. 없는 파일은 건너뛴다.[](source:rv-s1l) |
| 작업 폴더 밖이거나 URL | 채팅에 나열하고 어느 것을 넣을지 묻고 턴을 끝낸다. 승인된 것만 더하고, 뺀 것을 사용자에게 알린다. 답할 사람이 없는 headless 실행이면 모두 빼고 계속한다.[](source:rv-s1l) |
| 승인된 URL | 일부 리뷰어는 URL을 못 열어서, 원문 페이지를 작업 폴더(또는 artifact 폴더)에 새 파일로 저장하고 그 절대 경로를 넘긴다. 저장하지 못하면 로컬 사본을 부탁하고 턴을 끝낸다. headless면 빼고 알린 뒤 계속한다.[](source:rv-s1l) |

`GoldfishContext`는 Stage 6을 뺀 모든 단계에 넘긴다. Stage 6은 문서만 읽는다.[](source:rv-s1l) 일시 정지 뒤 재개할 때 이 규칙이 이미 돌았다면, 그 뒤에 추가된 링크에도 같은 규칙을 적용한다.[](source:rv-pause)

## preset마다 어디까지 실행하고 경계는 어떻게 찾나 {#presets}

에이전트는 `Step`이 없으면 선택지 하나를 사용자에게 보여 준다. 질문은 정확히 1개이고 그 턴의 유일한 도구 호출이며, 복수 선택은 금지다. 5→6→7→8→9 순서 의존이 깨지는 것을 막기 위해서다. 옵션 0이 기본 동작이고 `(Recommended)` 표기를 붙이지 않는다.[](source:rv-s2i)[](source:rv-s2p)

| preset | 선택지 문구 | 의미 경계 찾기 | 실행하는 단계 |
| --- | --- | --- | --- |
| 0 | `Interactive review with all review rubrics (step-by-step, check in after each review)` | 한다 | Stage 5→6→7→8→9. 단계 사이마다 중간 확인[](source:rv-s2d)[](source:rv-s2p) |
| 1 | `Consolidated report with all review rubrics (runs full flow without stopping)` | 한다 | 다섯 단계 전부. 멈추지 않고 `consolidated_review_report.md`로 합친다[](source:rv-s2d) |
| 2 | `Feature spec only (evaluate design without considering implementation)` | 건너뛴다. `FeatureRange`는 1..End, `DetailedRange`는 N/A {caution:구현 계획은 보지 않는다} | Stage 5→6→7→8, 중간 확인 포함. Stage 8 뒤에서 멈추고 Stage 9는 실행하지 않는다[](source:rv-s2d)[](source:rv-s3b) |
| 3 | `Implementation plan only (evaluate design for implementation readiness)` | 한다. `DetailedRange`를 확정한다 | 곧바로 Stage 9[](source:rv-s2d) |

의미 경계는 문서를 기능 명세(`FeatureRange`)와 구현 계획(`DetailedRange`)으로 가르는 줄이다. 에이전트는 먼저 문서를 읽어 구조와 줄 수를 본다.[](source:rv-s3s)

| 상황 | 동작 |
| --- | --- |
| `## Detailed Implementation Plan`(동의어 `## Implementation Plan`, `## Work Breakdown`, `## Implementation Steps`) 헤더가 L줄 하나로 분명하다 | `FeatureRange`는 1..(L-1), `DetailedRange`는 L..End. 채팅에 한 줄로 알리고 질문 없이 4단계로 간다.[](source:rv-s3s) |
| 후보 헤더가 여럿이거나 구조가 표준이 아니다 | 질문 1개. 옵션 0은 가장 그럴듯한 분할 줄, 옵션 1은 사용자가 직접 입력한 줄 범위를 받는다.[](source:rv-s3a) |
| 구현 계획이 없다 | 채팅으로 알리고 `FeatureRange`는 1..End, `DetailedRange`는 N/A로 둔다. Stage 5~8 실행을 제안한다.[](source:rv-s3n) |

판정: preset 3을 골랐는데 구현 계획이 없을 때의 동작은 원문에 명시 없음. 개별 단계(`Step`=`5`~`9`)를 줬을 때 3단계 분할을 하는지도 원문에 명시 없음.

## 다섯 단계에서 누가 무엇을 점검하고 무엇을 쓰나 {#stages}

@workflow id=review-stages title="egm-review 단계 흐름"
| lane prep | 준비 |
| lane spec | 기능 명세 점검 |
| lane impl | 구현 점검 |
| input | 입력 확인 | external | prep |
| pick | preset 선택 | external | prep |
| split | 의미 경계 찾기 | backend | prep |
| s5 | 5 Zoom Out | backend | spec |
| s6 | 6 이해 테스트 | backend | spec |
| s7 | 7 설계 비평 | backend | spec |
| s8 | 8 중간 Zoom Out | backend | spec |
| s9 | 9 구현 준비 | backend | impl |
| end | 종료 | external | impl |
| input > pick | |
| pick > split | preset 0·1·3 |
| pick > s5 | preset 2 |
| split > s5 | preset 0·1 |
| s5 > s6 | |
| s6 > s7 | |
| s7 > s8 | |
| s8 > s9 | preset 0·1 |
| s8 > end | preset 2 |
| s9 > end | |

@steps id=stage-steps
| input | 입력 확인 | `TargetFile`을 확인하고 `GoldfishContext`를 받는다. 둘 다 빠지면 채팅으로 하나씩 묻는다.[](source:rv-s1t)[](source:rv-s1c) | review-stages | input |
| pick | preset 선택 | `Step`이 없으면 질문 하나로 네 preset 중 고른다. 고른 뒤 연결 파일 규칙이 한 번 돈다.[](source:rv-s2g)[](source:rv-s1l) | review-stages | pick |
| split | 의미 경계 찾기 | 헤더로 `FeatureRange`와 `DetailedRange`를 가른다. preset 2는 건너뛴다. preset 3은 여기서 그림 밖으로 곧바로 Stage 9에 간다.[](source:rv-s3b)[](source:rv-s3s)[](source:rv-s2d) | review-stages | split |
| s5 | 5 Zoom Out | `egm-zoom-out`이 문서 전체를 큰 그림에서 본다. 기준은 `zoom-out-standard.md`다.[](source:rv-zoom) | review-stages | s5 |
| s6 | 6 이해 테스트 | `egm-comprehension`이 문서만 읽고 이해한 내용을 paraphrase(자기 말로 다시 쓴 글)로 적는다. 시험 대상은 자급자족성이다.[](source:rv-comp) | review-stages | s6 |
| s7 | 7 설계 비평 | `egm-review-loop`을 같은 스레드에서 불러 `FeatureRange`를 비평시킨다.[](source:rv-crit) | review-stages | s7 |
| s8 | 8 중간 Zoom Out | Stage 5 보고서 경로를 맥락에 넣고, Stage 6·7에서 더해지거나 완화된 부분에 집중한다.[](source:rv-zoom) | review-stages | s8 |
| s9 | 9 구현 준비 | `egm-review-loop`을 불러 `DetailedRange`가 구현에 충분한지 본다.[](source:rv-ready) | review-stages | s9 |
| end | 종료 | 마지막 중간 확인에서 `Conclude review and finalize document`(preset 2는 `Conclude review and begin detailed implementation planning`)를 고르면 끝난다.[](source:rv-readyg)[](source:rv-zoomg) | review-stages | end |

| 단계 | 리뷰어 | 범위 | 기준 문서 | 보고서 파일 | `GoldfishContext` |
| --- | --- | --- | --- | --- | --- |
| 5 | `egm-zoom-out`[](source:rv-un) | 문서 전체 | `zoom-out-standard.md`[](source:rv-zoom) | `zoom_out_report.md`[](source:rv-zoom) | 받는다[](source:rv-zoom) |
| 6 | `egm-comprehension`을 직접 띄운다[](source:rv-comp) | `FeatureRange`와 `DetailedRange`[](source:rv-un) | 없음. `re-implementation-standard.md`는 적용하지 않는다[](source:rv-comp) | `comprehension_report.md`[](source:rv-comp) | 받지 않는다[](source:rv-s1l) |
| 7 | `egm-design`, `egm-structural`, `egm-style`[](source:rv-crit) | `FeatureRange` | `egm-design`·`egm-structural`에 `feature-spec-standard`[](source:rv-crit) | `critic_report.md`[](source:rv-crit) | 받는다[](source:rv-crit) |
| 8 | `egm-zoom-out`[](source:rv-un) | 문서 전체 | Zoom Out 규칙을 그대로 쓴다 | `intermediate_zoom_out_report.md`[](source:rv-zoom) | 받는다[](source:rv-zoom) |
| 9 | `egm-implementation-readiness`, `egm-codebase-details`, `egm-style`[](source:rv-ready) | `DetailedRange` | 앞의 둘에 `implementation-readiness-standard`[](source:rv-ready) | `implementation_readiness_report.md`[](source:rv-ready) | 받는다[](source:rv-ready) |

Stage 6은 일부러 synthesizer를 거치지 않는다. synthesizer의 보고서는 지적만 남겨서 저자가 봐야 할 paraphrase가 사라지기 때문이다. `re-implementation-standard.md`는 코드 수준 상세를 요구하는데 Zoom Out 기준은 `FeatureRange`에서 그것을 금지하므로 쓰지 않는다.[](source:rv-comp)

Stage 6 보고서는 paraphrase 제목 두 개를 먼저 쓰고 지적을 잇는다. 지적이 없어도 paraphrase는 남긴다.[](source:rv-comp) 두 제목의 문구는 이 파일에 원문에 명시 없음.

에이전트가 서브에이전트를 띄우는 방법도 정해져 있다. 하니스가 `egm-zoom-out` 같은 이름의 타입을 등록해 뒀으면 그 타입을 요청한다. 없으면 일반 서브에이전트를 띄우고 `agents/<파일>.md`를 먼저 읽게 한다. 프롬프트는 그대로 넘기고 보고를 기다린다.[](source:rv-deleg)

## 대화형과 `Consolidated report`는 어떻게 다르고 사람은 어디서 개입하나 {#gates}

| 기준 | 대화형(preset 0·2·3) | `Consolidated report`(preset 1) |
| --- | --- | --- |
| Stage 7·9 | `egm-review-loop`을 같은 스레드에서 부른다(r08)[](source:rv-crit)[](source:rv-ready) | review-loop 없이 `egm-synthesizer`(또는 리뷰어 직접)를 띄운다[](source:rv-un) |
| 단계 사이 | 단계마다 중간 확인 질문[](source:rv-gate) | 멈추지 않는다[](source:rv-un) |
| 보고서 | 단계별 파일[](source:rv-zoom) | 단계별 파일과 `consolidated_review_report.md`[](source:rv-un)[](source:rv-uns) |
| 지적 수정 | 사용자가 옵션 1을 고르면 `egm-resolve`(r09)[](source:rv-critg) | 수정 단계는 원문에 명시 없음 {caution:사용자 승인 경로 없음} |
| 기준 문서 | 호출 인자에 reviewer별 기준을 적는다[](source:rv-crit)[](source:rv-ready) | Stage 7·9 항목에 기준 문서는 원문에 명시 없음[](source:rv-un) |

`Consolidated report`는 다섯 단계 보고서의 지적을 모아 우선순위 🔴 Blocker, 🟡 Major, 🟢 Nit 세 등급의 실행 과제로 합친다. 원래 지적이 어느 과제로 합쳐졌는지 보이도록 Traceability Matrix를 만들고, `consolidated_review_report.md`에 쓴 뒤 경로를 채팅에 알린다.[](source:rv-uns)

모든 대화형 단계는 선택지 하나로 끝난다. 질문은 1개이고 그 턴의 유일한 도구 호출이다.[](source:rv-gate)[](source:rv-inv)

| 단계 | 옵션 0 | 옵션 1 | 옵션 2 | 옵션 3 |
| --- | --- | --- | --- | --- |
| 5, 6, 8 | `Proceed to next stage`(Stage 8이 마지막이면 `Conclude review and begin detailed implementation planning`) | `I will update doc first` | `Pause Review` | 없음 |
| 7, 9 | `Proceed to next stage`(Stage 9는 `Conclude review and finalize document`) | `Resolve findings with agent` | `I will update doc manually` | `Pause Review` |

옵션 1을 고르면 에이전트는 `egm-resolve`를 Elephant(이전 대화를 기억하는 메인 에이전트) 컨텍스트에서 해당 범위에 실행한다.[](source:rv-sem)[](source:rl-eleph) Elephant가 지적을 분류하고 `goldfish_review_report.md`를 쓰고 승인된 수정을 `TargetFile`에 적용한다.[](source:rv-sem)

수정 뒤 에이전트는 `TargetFile`을 다시 읽어 줄 범위를 새로 계산하고, 다음 단계로 가거나 같은 단계를 한 번 더 감사한다.[](source:rv-sem) 판정: `egm-resolve`는 지적을 네 가지(`CONTEST`, `ESCALATE`, `PROPOSE FIX`, `DECLINE`)로 나누는데, 이 스킬은 `PROPOSE FIX`와 `CONTEST` 둘만 적는다.[](source:rs-cat)

@facts id=review-numbers
| 단계 수 | 5개(Stage 5~9)[](source:rv-fm) |
| preset | 4가지[](source:rv-s2p) |
| 중간 확인 질문 | 한 번에 정확히 1개(의무)[](source:rv-inv) |
| 재감사 | 단계마다 최대 1회(의무)[](source:rv-pause) |

사용자가 직접 문서를 고치겠다고 하면(옵션 1 또는 2) 세션이 멈춘다. 사용자가 채팅으로 수정이 끝났다고 알리면 에이전트는 `TargetFile`을 다시 읽어 줄 이동을 계산하고, 새 링크에 연결 파일 규칙을 적용하고, 현재 단계를 다시 돌린다.[](source:rv-pause)

단계마다 재감사는 최대 1회다. 한도 뒤에 같은 단계에서 수동 수정을 또 요청하면 에이전트는 한도에 닿았다고 알린다. 남은 지적은 받아들인 절충으로 기록하고, 옵션 0을 자동으로 골라 다음 단계로 간다.[](source:rv-pause) 판정: 수정 경로(`egm-resolve`)와 수동 수정 경로가 이 한도를 같이 쓰는지는 원문에 명시 없음.

`Pause Review`를 고르면 에이전트는 도구를 하나도 쓰지 않고 즉시 멈춘다. 이미 쓴 보고서 파일은 그대로 둔다.[](source:rv-halt)

## 무엇을 강제하고 무엇을 금지하나 {#rules}

| 규칙 | 강제·금지 내용 |
| --- | --- |
| 파일 먼저 | 큰 제안, 초안, 요약, 계획, 모든 리뷰 보고서를 채팅 화면에 직접 보여 주는 것을 금지한다. 파일에 쓰고 경로를 알린 뒤 검토를 요청한다.[](source:rv-art) |
| 평이한 영어 | 모든 요약과 소통을 단순하고 직접적인 영어로 쓴다. 근거 없는 홍보 형용사(`seamless`, `robust`, `blazingly fast`)와 장식 부사(`seamlessly`, `effortlessly`, `literally`, `drastically`, `obviously`)를 금지한다.[](source:rv-plain) |
| 반박 먼저 | 기본으로 동의하지 않는다. 약점, 경계 사례, 사각지대를 먼저 찾는다. 강한 아이디어도 틀리거나 빠지거나 위험한 점을 먼저 말한다.[](source:rv-stress) |
| 맞장구 금지 | `great`, `brilliant`, `smart`, `correct`, `perfect`, `excellent`, `spot-on`을 사용자의 입력·정정·결정에 쓰지 못한다. 사용자가 단정한 결론을 그대로 되풀이하지도 않는다.[](source:rv-stress) |
| 반론 만들기 | 전략마다 사용자가 보지 못한 것, 가장 강한 반론, 반대 견해가 타당한지를 적는다. 엄격하고 객관적인 검토를 통과한 아이디어에만 동의한다.[](source:rv-stress) |
| 사과 금지 | 반박이나 정정을 받아도 `I apologize` 같은 사과를 하지 않고 고친 기술 논리나 trade-off를 바로 쓴다.[](source:rv-apol) |
| 질문 불변식 | 모든 중간 확인은 질문 1개, 그 턴의 유일한 도구 호출, 행동 중심 선택지다. 선택지에 `(Recommended)`를 붙이지 않는다.[](source:rv-inv) |
| Goldfish 격리 | 서브에이전트 도구가 없으면 멈추고 "같은 컨텍스트의 리뷰는 Goldfish 리뷰가 아니다"라고 사용자에게 알린다.[](source:rv-deleg) |

판정: 평이한 영어와 금지 형용사 목록은 영어 단어 기준이다. 한국어로 대화하는 사용자에게 같은 규칙이 어떻게 적용되는지는 원문에 명시 없음.

## 흐름 속 위치 {#position}

이 스킬은 묶음 `idea-to-design`에서 마지막 점검 단계이고, 묶음 `review-and-fix`의 중심이다. 앞에서는 `egm-draft`가 설계 문서를 저장한 뒤 이 스킬을 쓰라고 권한다. 뒤에서는 Stage 7·9가 `egm-review-loop`과 `egm-resolve`를 부른다.[](source:dr-handoff)[](source:rv-crit)[](source:rv-sem)

@workflow id=review-position title="egm-review 앞뒤"
| draft | egm-draft | backend |
| me | egm-review | backend |
| loop | egm-review-loop | backend |
| fix | egm-resolve | backend |
| draft > me | r05 넘김 | emphasis |
| me > loop | r08 위임 |
| me > fix | r09 위임 | dashed |

| rel-id | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| r05 | `egm-draft`가 저장한 설계 문서 경로 | - | 넘김. draft 6단계 끝에서 사용자에게 `egm-review`를 시작하라고 권한다. 시작은 사용자가 한다(명시-이름)[](source:dr-handoff)[](source:rv-inputs) |
| r06 | - | - | 참고. draft는 Zoom Out 기준으로 자기 초안을 채점하지 않고 그 점검을 Stage 5에 맡긴다고 가리킨다. 이 스킬이 draft를 부르지는 않는다(명시-이름)[](source:dr-zoom)[](source:rv-un) |
| r08 | 대화형 흐름의 Stage 7·9 | `TargetFile`, 줄 범위, 리뷰어, 기준 문서, `GoldfishContext` | 내부 위임. review-loop이 끝나면 호출한 쪽인 이 스킬로 돌아온다. `Consolidated report`에서는 부르지 않는다(명시-이름)[](source:rv-crit)[](source:rv-ready)[](source:rl-ret) |
| r09 | Stage 7·9의 옵션 1 선택 | 지적 목록(`critic_report.md` 또는 `implementation_readiness_report.md`) | 내부 위임. 사용자가 옵션 1을 고를 때만. 수정은 `TargetFile`에 직접 적용하고 재감사는 최대 1회다(명시-이름)[](source:rv-sem)[](source:rv-critg)[](source:rv-readyg) |
| r11·r12·r13 | Stage 5·6·7·8·9 | 단계별 지시와 `GoldfishContext` | 내부 위임. `egm-synthesizer`, `egm-comprehension`, `egm-zoom-out`은 이 컬렉션 밖이다(범위 밖). Stage 6만 synthesizer를 거치지 않는다[](source:rv-un)[](source:rv-comp)[](source:rv-zoom) |
| r18 | `goldfish_review_report.md` | - | 공유 상태. `egm-resolve`가 파일을 쓰고, 이 스킬은 수정 경로에서 지적을 `critic_report.md` 또는 이 파일에서 가져온다고 적는다[](source:rs-file)[](source:rv-critg) |
| r19 | `critic_report.md`, `implementation_readiness_report.md` | - | 공유 상태(미확인). review-loop은 synthesizer가 보고서를 쓴다고만 하고 파일 이름을 정하지 않는다. 이 스킬의 이름과 같은 파일인지 원문에 명시 없음[](source:rl-syn)[](source:rv-crit) |
| r23 | - | - | 같은 계열(추론). `egm-draft`와 Execution Constraints가 같은 규칙 묶음이다[](source:rv-art)[](source:dr-cons) |

전체 흐름은 `egm/_group-idea-to-design/idea-to-design.html`과 `egm/_group-review-and-fix/review-and-fix.html`에 있다. 관계 근거는 `egm/relations.md`의 `rel-id`로 확인한다.

## 어디까지 확인했고 무엇을 확인하지 못했나 {#audit}

- 읽은 텍스트 파일은 5개, 합계 35617B다. `SKILL.md` 24113B, `test_scenarios.yaml` 9780B, `TEST.md` 996B, `agents/openai.yaml` 198B, `assets/icon.svg` 530B다. 구조·표본만 읽은 파일은 없다.[](source:rv-fm)[](source:rv-test-yaml)[](source:rv-test-md)[](source:rv-yaml)[](source:rv-icon)
- 제외한 파일은 없다. 바이너리도 없다. `assets/icon.svg`는 그림 데이터만 있고 동작 지시가 없다.[](source:rv-icon)
- 스킬을 실행하지 않았다. 리뷰 결과의 품질이나 수렴 여부는 확인하지 못했다. `test_scenarios.yaml`의 시나리오 10개도 돌리지 않았다.[](source:rv-test-yaml)
- 이 분석을 시작하기 직전에 `egm/`를 최신화해서 이 스킬의 세 파일이 바뀌었다(`SKILL.md` 44줄, `TEST.md` +3줄, `test_scenarios.yaml` +47줄). 바뀐 핵심은 연결 파일 규칙(1.3) 신설, 빈 `GoldfishContext` 처리, Stage 5·7·8·9에 `GoldfishContext` 전달이다. 이 페이지는 최신화 뒤 커밋 `d494974`를 기준으로 썼고, 분석 도중 바뀐 파일은 없다.

@callout level=open-question title="확인하지 못한 것"
서브에이전트 정의 파일(`agents/zoom_out.md`, `agents/comprehension.md` 등)이 스킬 폴더에 없다. `agents/`에는 `openai.yaml`만 있다. 리뷰어 일곱 명(`egm-zoom-out`, `egm-comprehension`, `egm-design`, `egm-structural`, `egm-style`, `egm-implementation-readiness`, `egm-codebase-details`)과 `egm-synthesizer`가 무엇을 찾는지는 확인하지 못했다.[](source:rv-deleg)[](source:rv-yaml)
기준 문서(`resources/document_standards/*.md`)가 없다. `zoom-out-standard`, `feature-spec-standard`, `implementation-readiness-standard`, `re-implementation-standard`의 내용은 확인하지 못했다.[](source:rv-zoom)[](source:rv-crit)[](source:rl-std)
`docs/codex.md`, `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`, `docs/harnesses.md`를 먼저 읽으라는 지시가 있지만 저장소에 없다. 그 안의 지시는 확인하지 못했다.[](source:rv-intro)[](source:rv-deleg)
이 스킬은 리뷰어를 `egm-design`, `egm-structural`, `egm-style`로 부르고, `egm-review-loop`의 해석표는 `design_critic`, `structural`, `style`을 `agents/{name}.md`에 대응시킨다. 같은 대상인지 확인하지 못했다.[](source:rv-crit)[](source:rl-map)
Stage 7·9에서 `egm-review-loop`이 라운드마다 `egm-resolve`를 부른 뒤에, 이 스킬의 중간 확인이 다시 `Resolve findings with agent`를 제시한다. 같은 지적을 두 번 다루는지, 두 번째가 무엇을 다시 보는지는 원문에 명시 없음.[](source:rl-res)[](source:rv-critg)
`Consolidated report`에서 지적을 문서에 반영하는 단계와, Stage 7·9에 기준 문서를 넘기는지는 원문에 명시 없음.[](source:rv-un)
`test_scenarios.yaml`의 한 시나리오는 preset 이름을 `Feature Spec Gates Only`로 쓴다. 현재 선택지 문구는 `Feature spec only`다. 판정: 이전 이름이 남은 것으로 보이지만 원문에 근거는 명시 없음.[](source:rv-test-gate)[](source:rv-s2p)
