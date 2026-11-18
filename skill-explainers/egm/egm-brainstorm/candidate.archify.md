# egm-brainstorm — 반쯤 굳은 아이디어를 반박해 가며 요약문으로 다듬는다 {#overview}

`egm-brainstorm`은 에이전트가 사용자와 여러 턴 질문을 주고받아 아이디어를 가설로 굳히고, 새 컨텍스트의 리뷰어(Goldfish)에게 반박시켜 `concepts_brief.md` 요약문으로 만들게 하는 스킬이다.[](source:overview) **부분 분석**이다. 원문이 먼저 읽으라는 `docs/codex.md`, `docs/claude.md`, `docs/harnesses.md`와 리뷰어 정의 `agents/<파일>.md`가 저장소에 없어서 확인하지 못했다.[](source:ext-docs)

- 사용자가 이름으로 직접 불러야 켜진다. 모델이 `description`만 보고 스스로 켜지는 일은 막혀 있다.[](source:frontmatter)
- 결과는 `concepts_brief.md` 파일이다. 긴 내용은 채팅에 붙이지 않고 파일에 쓴 뒤 경로만 알린다.[](source:artifact-first)
- 다른 스킬과의 관계: `egm-draft`로 다음 안내를 하고, 요약문을 결과 전달하며, `egm-synthesizer`를 호출한다.
- 사용자가 준비됐다고 확인하기 전에는 서브에이전트를 띄우지 않는다. 서브에이전트 도구가 없으면 멈춘다.[](source:gate)

@answer scope="egm/egm-brainstorm · 원본 파일 5개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source overview title="스킬 개요" path=egm/egm-brainstorm/SKILL.md lines=18:25
@source frontmatter title="이름과 호출 제한" path=egm/egm-brainstorm/SKILL.md lines=1:11
@source ext-docs title="먼저 읽으라는 외부 문서" path=egm/egm-brainstorm/SKILL.md lines=15:16
@source delegation title="서브에이전트 띄우는 규칙" path=egm/egm-brainstorm/SKILL.md lines=27:36
@source artifact-first title="파일 먼저 규칙" path=egm/egm-brainstorm/SKILL.md lines=40:45
@source clarify-rule title="질문 규칙과 준비 확인" path=egm/egm-brainstorm/SKILL.md lines=46:53
@source parallel title="병렬 리뷰와 문체 규칙" path=egm/egm-brainstorm/SKILL.md lines=54:62
@source stance title="맞장구 금지 규칙" path=egm/egm-brainstorm/SKILL.md lines=63:88
@source lenses title="Goldfish 여섯 관점" path=egm/egm-brainstorm/SKILL.md lines=90:99
@source step1 title="1단계 질문" path=egm/egm-brainstorm/SKILL.md lines=103:124
@source gate title="준비 확인 선택지" path=egm/egm-brainstorm/SKILL.md lines=126:157
@source step2 title="2단계 리뷰와 종합" path=egm/egm-brainstorm/SKILL.md lines=159:177
@source brief-format title="concepts_brief.md 구조" path=egm/egm-brainstorm/SKILL.md lines=179:208
@source step3 title="3단계 반복" path=egm/egm-brainstorm/SKILL.md lines=210:218
@source step4-gate title="4단계 인계 선택지" path=egm/egm-brainstorm/SKILL.md lines=220:243
@source opt-rfc title="RFC 게시 선택" path=egm/egm-brainstorm/SKILL.md lines=245:255
@source opt-draft title="egm-draft 진행 선택" path=egm/egm-brainstorm/SKILL.md lines=256:263
@source opt-loop title="계속 다듬기와 종료 선택" path=egm/egm-brainstorm/SKILL.md lines=264:269
@source test-handoff title="인계 안내 시험" path=egm/egm-brainstorm/test_scenarios.yaml lines=52:65
@source openai-yaml title="표시 이름" path=egm/egm-brainstorm/agents/openai.yaml lines=1:6

## 어떻게 동작하나 {#flow span=12}

원문이 순서를 정한 절차형 스킬이다. 1단계 질문, 2단계 리뷰, 3단계 반복, 4단계 인계 순서로 가고, 그림의 되돌림 간선이 3단계 반복과 4단계의 "계속 다듬기"를 나타낸다.[](source:step3)

@workflow id=flow-diagram title="egm-brainstorm 흐름"
| lane clarify | 질문 |
| lane review | 리뷰 |
| lane handoff | 반복과 인계 |
| ask | 개념 확인·질문 | backend | clarify | source:step1 |
| ready | 준비됐나? | backend | clarify | source:gate |
| review | Goldfish 리뷰 | backend | review | source:step2 |
| brief | 요약문 쓰기 | backend | review | source:brief-format |
| notify | 쟁점 알림 | backend | handoff | source:step3 |
| handoff | 인계 선택? | backend | handoff | source:step4-gate |
| rfc | RFC 게시 | backend | handoff | source:opt-rfc |
| draft | egm-draft 안내 | backend | handoff | source:opt-draft |
| keep | 요약문 보관 | backend | handoff | source:opt-loop |
| ask > ready | |
| ready > ask | 더 설명 |
| ready > review | Review with Goldfishes | emphasis |
| review > brief | |
| brief > notify | |
| notify > review | 수정 필요 |
| notify > handoff | 만족 |
| handoff > rfc | RFC |
| handoff > draft | egm-draft |
| handoff > notify | 계속 다듬기 |
| handoff > keep | 종료 |

@steps id=flow-steps
| s-ask | 개념 확인·질문 | **입력** 사용자의 초기 아이디어 · **참조** `git config user.name`, `GIT_AUTHOR_NAME` · **출력** 문제·제약·성공 기준이 정리된 가설. **처리** 에이전트가 아이디어가 없으면 설명을 청하고, 저자 이름을 git 설정에서 찾는다. 둘 다 없으면 채팅으로 묻는다.[](source:step1) 문제·제약·경계를 열린 질문으로 여러 턴 묻는다. 객관식 후보와 질문 도구(`ask_question`)는 이 단계에서 금지다.[](source:clarify-rule) | flow-diagram | ask |
| s-ready | 준비됐나? | **입력** 정리된 가설 · **출력** 2~3문장 요약과 선택지 하나. **처리** 에이전트가 가설을 2~3문장으로 요약하고 선택지 둘(`Review with Goldfishes`, `Clarify additional constraints or assumptions in chat`)을 보여 준다.[](source:gate) **다음** 두 번째를 고르면 1단계에 머무르며 반영한 뒤 다시 보여 준다. 첫 번째를 고르기 전에는 서브에이전트를 띄우지 않는다. | flow-diagram | ready |
| s-review | Goldfish 리뷰 | **입력** 확정된 가설 요약 · **참조** `agents/synthesizer.md` · **출력** 합쳐진 지적 목록. **처리** 에이전트가 `egm-synthesizer`를 `Mode: BRAINSTORM`으로 띄우고, 종합 담당이 리뷰어 6명을 병렬로 돌린 뒤 겹친 지적을 합친다.[](source:step2) **다음** 하니스가 중첩 서브에이전트를 못 쓰면 6개 관점 리뷰어를 직접 병렬로 띄운다. 서브에이전트 도구가 없으면 멈추고 사용자에게 알린다.[](source:delegation) | flow-diagram | review |
| s-brief | 요약문 쓰기 | **입력** 합쳐진 지적 · **출력** `concepts_brief.md`. **처리** 에이전트가 정해진 다섯 절 구조로 파일에 쓴다. `Alternatives Weighed`에는 기각한 선택지와 기술적 이유를 적는다.[](source:brief-format) | flow-diagram | brief |
| s-notify | 쟁점 알림 | **입력** `concepts_brief.md` · **출력** 경로 안내와 쟁점 2~3개. **처리** 에이전트가 파일 경로를 알리고 리뷰어의 주요 반박을 2~3개 짚은 뒤, 어떻게 대응할지 사용자에게 묻는다.[](source:step3) **다음** 수정이 필요하면 1~2단계를 다시 돌려 분석을 갱신한다. 만족하면 4단계에서 최종 요약문 확인을 받는다.[](source:step4-gate) | flow-diagram | notify |
| s-handoff | 인계 선택? | **입력** 확정된 `concepts_brief.md` · **출력** 사용자 선택 하나. **처리** 사용자가 최종 요약문에 동의하면 에이전트가 선택지 넷을 한 질문으로 보여 준다.[](source:step4-gate) 선택지에 `(Recommended)` 표기를 붙이지 않는다.[](source:clarify-rule) | flow-diagram | handoff |
| s-rfc | RFC 게시 | **입력** `concepts_brief.md` · **참조** `docs/designs/SITEMAP.md` · **출력** `docs/designs/<feature_name>.md`. **처리** 에이전트가 요약문을 그 경로에 쓰고, SITEMAP이 있으면 등록한 뒤 팀 피드백 후 `egm-draft`를 시작할 수 있다고 알린다.[](source:opt-rfc) | flow-diagram | rfc |
| s-draft | egm-draft 안내 | **입력** 저장된 `concepts_brief.md` · **출력** 시작 명령 안내. **처리** 에이전트가 파일이 저장돼 있는지 확인하고, 호스트의 명령 형태로 `egm-draft`를 시작하라고 사용자에게 안내한다. `egm-draft`가 이 파일을 우선순위 1 입력으로 읽는다고 알린다.[](source:opt-draft) **다음** 접두어 없는 `/egm-draft`를 입력하라고 안내하면 시험이 실패 처리한다.[](source:test-handoff) | flow-diagram | draft |
| s-keep | 요약문 보관 | **입력** 저장된 `concepts_brief.md` · **출력** 종료 안내. **처리** 에이전트가 세션을 끝내고 요약문이 나중을 위해 남아 있다고 알린다.[](source:opt-loop) **다음** `Continue refining` 선택은 3단계 반복으로 돌아간다. | flow-diagram | keep |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자가 스킬 이름으로 호출한다. `disable-model-invocation: true`라서 모델이 스스로 켜지 않는다.[](source:frontmatter) |
| 성격 | 질문과 반박으로 아이디어를 요약문으로 다듬는 절차형 스킬 |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#r01} | egm-draft | 다음 안내 | 4단계에서 사용자가 `Proceed to egm-draft`를 고르면, 요약문 저장을 확인하고 사용자가 `egm-draft`를 시작하게 안내한다. 에이전트가 직접 시작한다는 말은 원문에 명시 없음.[](source:opt-draft) |
| **이 스킬** {#r02} | egm-draft | 다음 안내 | 사용자가 `Publish concepts_brief.md as RFC`를 고르면 RFC로 쓴다. 피드백 뒤 `egm-draft` 시작은 사용자가 한다.[](source:opt-rfc) |
| **이 스킬** {#r03} | egm-draft | 결과 전달 | `Alternatives Weighed` 절이 `egm-draft`가 `Alternatives Considered`를 쓸 유일한 출처다. 필수 순서는 아니다.[](source:brief-format) |
| egm-draft {#r04} | **이 스킬** | 다음 안내 | 제안형이다. `Context File`도 `concepts_brief.md`도 `discussion_summary.md`도 없을 때만 `egm-brainstorm` 시작을 제안한다. 원장 출처는 `egm-draft` 144~160줄이다. |
| **이 스킬** {#r07} | egm-draft | 같은 파일 | 둘 다 `docs/designs/`를 쓴다. brainstorm은 RFC 게시 때만 쓴다. 선후 관계는 없다.[](source:opt-rfc) |
| **이 스킬** {#r15} | egm-synthesizer | 호출 | 준비 확인에서 `Review with Goldfishes`를 고른 뒤에만 띄운다. 리뷰어 6명과 `Mode: BRAINSTORM`을 지정한다.[](source:step2) |
| **이 스킬** {#r22} | egm-draft | 대안 | 두 스킬의 Execution Constraints가 같은 규칙 묶음이라는 분석자의 추론이다(파일 먼저, 쉬운 영어, 맞장구 금지, 질문 하나씩).[](source:stance) |

@architecture id=relation-map title="egm-brainstorm과 이어지는 스킬"
| before | egm-draft(앞 단계) | backend |
| after | egm-draft(뒤 단계) | backend |
| self | egm-brainstorm(이 스킬) | backend |
| synth | egm-synthesizer | backend |
| before > self | 다음 안내 |
| self > after | 다음 안내 · 결과 전달 · 같은 파일 · 대안 |
| self > synth | 호출 |

@code source=frontmatter language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 스킬 지시 본문과 호출 제한 | 스킬이 켜질 때 읽는다.[](source:frontmatter) | 개념 확인·질문 외 모든 단계 |
| `agents/openai.yaml` | 표시 이름 `EGM Brainstorm`, 짧은 설명, 아이콘, 색 | 에이전트 지시가 아니라 UI 표시용이다. 읽는 조건은 원문에 명시 없음.[](source:openai-yaml) | 없음 |
| `assets/icon.svg` | 아이콘 이미지 | `openai.yaml`이 가리킨다 | 없음 |
| `test_scenarios.yaml` | 행동 시험 시나리오(열린 질문, 준비 확인 선택지, 인계 명령 형태, 저자 이름 확인 등) | 시험 때만 쓴다 | 준비됐나?, egm-draft 안내 |
| `TEST.md` | 대화로 점검할 체크리스트 | 사람이 점검할 때만 쓴다 | 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 준비 확인에서 `Review with Goldfishes`를 고르기 전 | 서브에이전트를 띄우지 않는다. 금지다. | [](source:clarify-rule) |
| 1단계 질문 중 | 열린 질문만 한다. 질문 도구와 객관식 후보는 금지다. | [](source:clarify-rule) |
| 큰 제안·초안·요약 | 채팅에 붙이지 않고 파일에 쓴다. 금지다. | [](source:artifact-first) |
| 리뷰 관점 | 6개 관점을 동시에 돌려 순차 편향을 막는다. 의무다. | [](source:parallel) |
| 모든 선택지 | 질문 하나만 담고, 그 턴의 유일한 도구 호출로 하며, `(Recommended)`를 붙이지 않는다. | [](source:stance) |
| 서브에이전트 도구가 없는 하니스 | 멈추고 "같은 컨텍스트의 리뷰는 Goldfish 리뷰가 아니다"라고 알린다. | [](source:delegation) |
| 문체 | 쉬운 영어로 쓴다. 칭찬·사과·근거 없는 홍보 형용사는 금지다. | [](source:parallel) |
| 비판 순서 | 아무리 좋은 아이디어도 틀린 점과 위험을 먼저 말한다. 시험을 견딘 뒤에만 동의한다. | [](source:stance) |
| 접두어 없는 `/egm-draft` | 시작 명령으로 안내하지 않는다. | [](source:test-handoff) |
| `Conclude brainstorming` 선택 | 세션을 끝내고 요약문이 남아 있다고만 알린다. | [](source:opt-loop) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- Goldfish 여섯 관점 — 병렬 리뷰의 관점별 질문 · 개요에는 이름만 담음.[](source:lenses)
- 맞장구 금지 규칙 열세 개 — 한계 표의 비판 순서 · 개요에는 결과를 바꾸는 것만 담음.[](source:stance)
- `concepts_brief.md` 절 구조 — 요약문 쓰기 · 절별 내용은 개요에 담지 않음.[](source:brief-format)
- 저자 이름 결정 순서와 시험 시나리오 — 개념 확인·질문, 준비됐나? · 시험 세부는 개요 밖.

@callout level=open-question title="확인하지 못한 것"
| `docs/codex.md`, `docs/claude.md`, `docs/harnesses.md`는 저장소에 없어 하니스별 지시를 알 수 없다. |
| `agents/synthesizer.md`와 여섯 리뷰어 정의 파일도 없어 리뷰어가 실제로 하는 일은 확인하지 못했다. |

읽은 원본: 텍스트 파일 5개. 제외: 번역본(`*.ko.md`, 분석 근거 아님).
