# egm-review — 설계 문서를 새 컨텍스트 리뷰어에게 5단계로 점검시킨다 {#overview}

`egm-review`는 설계 문서를 새 컨텍스트에서 시작하는 리뷰 서브에이전트(Goldfish)에게 넘겨 5단계로 점검시키고, 단계마다 보고서 파일을 남기게 하는 스킬이다.[](source:fm) 부분 분석이다. 스킬이 먼저 읽으라는 `docs/*.md`와 서브에이전트 정의 `agents/*.md`, 기준 문서 `resources/document_standards/*.md`가 저장소에 없어서 확인하지 못했다.

- 사용자가 `egm-review`를 이름으로 불러야 켜진다. 문서 경로(`TargetFile`)를 받고 preset 네 가지(interactive, consolidated, feature spec only, implementation plan only) 중 하나를 고른다.[](source:s2)
- 결과는 단계별 보고서 파일이다. 단계마다 `zoom_out_report.md`, `comprehension_report.md`, `critic_report.md` 같은 파일이 생기고, consolidated는 `consolidated_review_report.md` 하나로 모은다.[](source:unint)
- 이어지는 스킬은 `egm-review-loop`(호출), `egm-resolve`(호출), `egm-draft`(다음 안내)다.
- 서브에이전트 도구가 없으면 하지 않고 멈춘다. 같은 컨텍스트에서 하는 리뷰는 Goldfish 리뷰가 아니라고 사용자에게 알린다.[](source:deleg)

@answer scope="egm/egm-review · 원본 파일 5개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: 이름·호출 제한·설명" path=egm/egm-review/SKILL.md lines=1:10
@source deleg title="서브에이전트 위임 규칙" path=egm/egm-review/SKILL.md lines=19:28
@source constr title="실행 제약 11개" path=egm/egm-review/SKILL.md lines=30:69
@source s1 title="1단계 입력 확인과 링크 파일" path=egm/egm-review/SKILL.md lines=82:119
@source s2 title="2단계 preset 선택" path=egm/egm-review/SKILL.md lines=121:177
@source s3 title="3단계 의미 경계 찾기" path=egm/egm-review/SKILL.md lines=179:207
@source s4 title="4단계 실행 순서 정하기" path=egm/egm-review/SKILL.md lines=209:223
@source gates title="중간 확인, 수정 위임, 일시 중지 규칙" path=egm/egm-review/SKILL.md lines=229:278
@source unint title="중간 확인 없는 전체 흐름" path=egm/egm-review/SKILL.md lines=280:313
@source zoom title="Zoom Out 단계" path=egm/egm-review/SKILL.md lines=315:345
@source comp title="Comprehension 단계" path=egm/egm-review/SKILL.md lines=347:367
@source crit title="Critic 단계" path=egm/egm-review/SKILL.md lines=369:394
@source ready title="Implementation Readiness 단계" path=egm/egm-review/SKILL.md lines=396:424
@source tests title="행동 평가 시나리오" path=egm/egm-review/test_scenarios.yaml lines=19:172
@source testmd title="검증 체크리스트" path=egm/egm-review/TEST.md lines=1:18
@source oai title="표시 이름과 한 줄 설명" path=egm/egm-review/agents/openai.yaml lines=1:6

## 어떻게 동작하나 {#flow span=12}

절차형이다. 사용자가 고른 preset에 따라 Stage 5~9 중 어디를 돌릴지가 갈린다. 그림은 갈래를 줄여 그렸다. 개별 단계만 돌리는 `Step` 값(`5`~`9`)은 preset 선택을 건너뛴다.[](source:s2) 중간 확인 방식은 interactive와 consolidated가 다르다. 개별 선택 문구는 상세 후보에 있다.

@workflow id=flow-diagram title="egm-review 흐름"
| lane setup | 준비 |
| lane feature | 기능 명세 점검 |
| lane impl | 구현 점검과 통합 |
| intake | 입력 확인 | backend | setup | source:s1 |
| preset | preset 선택? | backend | setup | source:s2 |
| split | 의미 경계 찾기 | backend | setup | source:s3 |
| z5 | Stage 5 Zoom Out | backend | feature | source:zoom |
| z6 | Stage 6 Comprehension | backend | feature | source:comp |
| c7 | Stage 7 Critic | backend | feature | source:crit |
| z8 | Stage 8 중간 Zoom Out | backend | feature | source:zoom |
| r9 | Stage 9 Readiness | backend | impl | source:ready |
| cons | 통합 보고서 | backend | impl | source:unint |
| intake > preset | |
| preset > split | interactive 등 |
| preset > z5 | feature spec only |
| split > z5 | interactive |
| split > cons | consolidated |
| split > r9 | implementation only |
| z5 > z6 | |
| z6 > c7 | |
| c7 > z8 | |
| z8 > r9 | 전체 흐름 | emphasis |

@steps id=flow-steps
| s-intake | 입력 확인 | **입력** 사용자 요청 · **참조** `TargetFile`, `GoldfishContext` · **출력** 확정된 문서 경로와 읽기 목록. **처리** 문서 경로가 없으면 채팅으로 묻고 turn을 끝낸다. 읽기 목록(GoldfishContext)이 없으면 줄지 묻는다.[](source:s1) **다음** 읽기 목록의 링크 파일 추가는 여기서 하지 않고, preset을 고른 뒤 첫 단계 직전에 한 번 한다. 작업 폴더 밖 링크와 URL은 사용자 승인을 받는다. | flow-diagram | intake |
| s-preset | preset 선택? | **입력** `Step` 값 또는 사용자 선택 · **출력** 실행 preset. **처리** `Step`이 있으면 해당 preset이나 단계로 바로 보낸다. 없으면 질문 하나짜리 단일 선택 질문으로 네 preset을 보여 준다.[](source:s2) **다음** 선택지에 `(Recommended)`를 붙이지 않고, 복수 선택을 쓰지 않는다. | flow-diagram | preset |
| s-split | 의미 경계 찾기 | **입력** `TargetFile` 전문 · **출력** `FeatureRange`, `DetailedRange`. **처리** `## Detailed Implementation Plan` 같은 제목 줄 L을 찾아 문서를 1~(L-1)줄과 L~끝줄로 가른다.[](source:s3) **다음** feature spec only는 이 단계를 건너뛰고 전체를 `FeatureRange`로 둔다. 제목이 모호하면 질문 하나로 확인하고, 구현 계획이 없으면 Stage 5~8만 제안한다. | flow-diagram | split |
| s-z5 | Stage 5 Zoom Out | **입력** 문서 전체 · `GoldfishContext` · **참조** `resources/document_standards/zoom-out-standard.md`(저장소에 없음) · **실행** `egm-synthesizer` 또는 `egm-zoom-out`을 띄움 · **출력** `zoom_out_report.md`. **처리** 리뷰어가 문서 전체를 높은 시점에서 점검한 지적을 파일로 남긴다.[](source:zoom) **다음** interactive에서는 중간 확인에서 진행, 직접 수정, 중지 중 하나를 고른다. | flow-diagram | z5 |
| s-z6 | Stage 6 Comprehension | **입력** `FeatureRange`와 `DetailedRange` · **실행** `egm-comprehension`을 직접 띄움 · **출력** `comprehension_report.md`. **처리** 리뷰어가 문서만 읽고 자기 말로 다시 쓴 글(paraphrase)과 지적을 그대로 파일에 쓴다.[](source:comp) **다음** 문서 기준(standard)은 적용하지 않는다. 지적이 없어도 paraphrase는 남긴다. | flow-diagram | z6 |
| s-c7 | Stage 7 Critic | **입력** `FeatureRange` · `GoldfishContext` · **실행** `egm-review-loop`을 같은 thread에서 호출, 리뷰어 `egm-design`·`egm-structural`·`egm-style` · **출력** `critic_report.md`. **처리** 설계의 약점을 찾는 리뷰 루프를 돌려 지적을 파일에 모은다.[](source:crit) **다음** 사용자가 `Resolve findings with agent`를 고르면 `egm-resolve`가 승인된 수정을 `TargetFile`에 적용하고, 줄 범위를 다시 읽는다. 재감사는 최대 1회다. | flow-diagram | c7 |
| s-z8 | Stage 8 중간 Zoom Out | **입력** 문서 전체 · `zoom_out_report.md` 경로 · **실행** Stage 5와 같은 리뷰어를 다시 띄움 · **출력** `intermediate_zoom_out_report.md`. **처리** Stage 6·7에서 생긴 추가와 완화에 초점을 맞춰 높은 시점에서 다시 점검한다.[](source:zoom) **다음** feature spec only는 여기서 멈추고 Stage 9를 하지 않는다. | flow-diagram | z8 |
| s-r9 | Stage 9 Readiness | **입력** `DetailedRange` · `GoldfishContext` · **실행** `egm-review-loop`을 같은 thread에서 호출, 리뷰어 `egm-implementation-readiness`·`egm-codebase-details`·`egm-style` · **출력** `implementation_readiness_report.md`. **처리** 구현 계획이 바로 착수할 수 있을 만큼 구체적인지 점검한 지적을 모은다.[](source:ready) **다음** 마지막 선택 지점에서 `Conclude review and finalize document`를 고르면 끝난다. 수정 위임과 재감사 상한은 Stage 7과 같다. | flow-diagram | r9 |
| s-cons | 통합 보고서 | **입력** Stage 5~9 보고서 · **출력** `consolidated_review_report.md`. **처리** 중간 확인 없이 다섯 단계를 차례로 돌린 뒤, 지적을 Blocker·Major·Nit으로 합치고 원래 지적과의 대응표(Traceability Matrix)를 붙인다.[](source:unint) **다음** 채팅에는 보고서 경로만 알린다. | flow-diagram | cons |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자가 이름으로 부른다. `disable-model-invocation: true`라서 모델이 `description`만 보고 스스로 켜지 않는다.[](source:fm) |
| 성격 | 리뷰어 서브에이전트를 띄우고 보고서를 모으는 오케스트레이터다. 직접 점검하지 않는다.[](source:deleg) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| egm-draft {#r05} | **이 스킬** | 다음 안내 | draft 6단계 끝에서 완성한 설계 문서 경로를 주고 `egm-review` 시작을 권한다. 시작은 사용자가 한다.[](source:s1) |
| egm-draft {#r06} | **이 스킬** | 참고 | draft는 자기 초안을 Zoom Out 기준으로 채점하지 않고, 그 점검은 Stage 5가 새 컨텍스트에서 한다고 가리킨다.[](source:zoom) |
| egm-draft {#r23} | **이 스킬** | 대안 | 두 스킬의 실행 제약이 같은 규칙 묶음이다. 직접 연결은 없다. 판정: 두 본문을 비교한 추론이다.[](source:constr) |
| **이 스킬** {#r08} | egm-review-loop | 호출 | Stage 7과 Stage 9에서 같은 thread로 부른다. 끝나면 review로 돌아온다. consolidated 흐름에서는 부르지 않는다.[](source:crit) |
| **이 스킬** {#r09} | egm-resolve | 호출 | Stage 7·9 중간 확인에서 사용자가 `Resolve findings with agent`를 고를 때만 부른다. 같은 Elephant(이전 대화를 기억하는 메인 에이전트) 컨텍스트에서 실행한다.[](source:gates) |
| **이 스킬** {#r11} | egm-synthesizer | 호출 | Stage 5·7·8·9에서 리뷰어를 모아 돌리는 종합 담당이다. 중첩 서브에이전트를 못 쓰는 환경은 리뷰어를 직접 띄운다. 정의 파일은 저장소에 없다.[](source:deleg) |
| **이 스킬** {#r12} | egm-comprehension | 호출 | Stage 6에서 synthesizer를 거치지 않고 직접 띄운다. synthesizer 보고서는 지적만 남겨 paraphrase가 사라지기 때문이다.[](source:comp) |
| **이 스킬** {#r13} | egm-zoom-out | 호출 | Stage 5·8에서 `egm-synthesizer` 대신 직접 띄울 수 있다. 정의는 `agents/zoom_out.md`에 있다고 하며 저장소에 없다.[](source:zoom) |
| egm-resolve {#r18} | **이 스킬** | 같은 파일 | resolve가 `goldfish_review_report.md`를 쓰고, review는 지적을 `critic_report.md` 또는 그 파일에서 가져온다. 선후 관계는 없다.[](source:crit) |
| egm-review-loop {#r19} | **이 스킬** | 같은 파일 | review-loop의 보고서와 review의 `critic_report.md`가 같은 파일인지 원문에 명시 없음. 근거 방식은 미확인이다.[](source:crit) |

그림은 호출과 다음 안내만 그렸다. `참고`, `대안`, `같은 파일` 관계는 표에만 있다.

@architecture id=relation-map title="egm-review와 이어지는 스킬"
| draft | egm-draft | backend |
| self | egm-review(이 스킬) | backend |
| loop | egm-review-loop | backend |
| resolve | egm-resolve | backend |
| synth | egm-synthesizer | external |
| comp | egm-comprehension | external |
| zoom | egm-zoom-out | external |
| draft > self | 다음 안내 |
| self > loop | 호출 |
| self > resolve | 호출 |
| self > synth | 호출 |
| self > comp | 호출 |
| self > zoom | 호출 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 지시 본문과 frontmatter | 스킬이 켜질 때 읽는다 | 입력 확인, preset 선택?, 의미 경계 찾기, Stage 5~9, 통합 보고서 |
| `test_scenarios.yaml` | 행동 평가 시나리오 9개. 사용자 입력과 기대·금지 패턴을 적었다[](source:tests) | 스킬 실행 중에는 읽지 않는다. 평가할 때 쓴다 | preset 선택?, Stage 6 Comprehension |
| `TEST.md` | 대화로 확인할 항목 체크리스트[](source:testmd) | 스킬 실행 중에는 읽지 않는다 | 입력 확인, preset 선택?, 의미 경계 찾기 |
| `agents/openai.yaml` | 표시 이름 `EGM Review`와 한 줄 설명 `Stress-test a design with fresh reviewers`[](source:oai) | 환경이 스킬 목록을 보여 줄 때 쓴다 | 해당 없음 |
| `assets/icon.svg` | 아이콘 이미지. 구조만 확인했다 | 읽지 않는다 | 해당 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 환경에 서브에이전트 도구가 없다 | 멈추고 "같은 컨텍스트의 리뷰는 Goldfish 리뷰가 아니다"라고 알린다 | [](source:deleg) |
| 큰 제안·초안·요약·보고서를 만든다 | 채팅에 붙이는 것이 금지(MANDATORY)다. 파일에 쓰고 경로만 알린다 | [](source:constr) |
| 사용자에게 선택 질문을 한다 | 질문은 정확히 하나, 그 turn의 유일한 tool 호출, 복수 선택 금지, `(Recommended)` 접두어 금지 | [](source:s2) |
| 문서 경로가 없다 | 구조화 질문 도구 대신 채팅으로 묻고 turn을 끝낸다 | [](source:s1) |
| 링크가 작업 폴더 밖이거나 URL이다 | 목록을 보여 주고 승인을 받는다. 답할 사람이 없으면 모두 빼고 계속한다. URL 페이지는 파일로 저장해 넘긴다 | [](source:s1) |
| Stage 6을 돌린다 | `GoldfishContext`를 넘기지 않는다. 문서 기준도 적용하지 않고 paraphrase를 파일에 남긴다 | [](source:comp) |
| feature spec only를 고른다 | 의미 경계 찾기를 건너뛰고 Stage 8까지만 돌린 뒤 멈춘다 | [](source:s2) |
| 같은 단계를 다시 감사하자고 두 번째로 요청한다 | 상한(1회)에 도달했다고 알리고, 남은 지적을 수용한 trade-off로 기록한 뒤 Option 0을 자동으로 골라 다음 단계로 간다 | [](source:gates) |
| 사용자가 `Pause Review`를 고른다 | 도구를 쓰지 않고 즉시 멈춘다. 보고서 파일은 남긴다 | [](source:gates) |
| 응답에 칭찬 형용사나 사과를 넣으려 한다 | 금지다. "brilliant", "great", "correct" 같은 칭찬 형용사와 사과 문구를 쓰지 않는다 | [](source:constr) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- preset 네 가지와 질문 payload — 입력 확인·preset 선택? · 선택지 문구와 JSON 형태가 길어서 개요에 담지 않았다
- 링크 파일 처리(Step 1.3) — 입력 확인 · 작업 폴더 밖 링크, URL 저장, 승인 규칙이 많다
- 중간 확인 문구와 수정 위임 — Stage 5~9 · 단계마다 선택지 수와 문구가 다르다
- consolidated 통합 보고서 — 통합 보고서 · 우선순위 분류와 대응표 규칙
- 단계별 리뷰어와 기준 문서 매핑 — Stage 5~9 · 리뷰어 이름과 기준 문서 이름이 단계마다 다르다
- 행동 평가 시나리오 9개 — `test_scenarios.yaml` · 입력과 기대·금지 패턴

@callout level=open-question title="확인하지 못한 것"
| `docs/codex.md`, `docs/claude.md`, `docs/harnesses.md`는 저장소에 없다. 스킬은 환경에 따라 앞의 두 파일 중 하나를 먼저 읽으라고 지시한다.[](source:deleg)
| 서브에이전트 정의 `agents/*.md`와 기준 문서 `resources/document_standards/*.md`도 없어서 각 리뷰어가 무엇을 점검하는지는 확인하지 못했다. 그래서 부분 분석이다.[](source:zoom)

읽은 원본: 텍스트 파일 5개(`assets/icon.svg`는 구조만 확인). 제외: 번역본(`SKILL.ko.md`, `TEST.ko.md`)은 읽지 않았다.
