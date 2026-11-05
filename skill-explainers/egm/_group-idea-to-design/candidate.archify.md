# 아이디어를 설계 문서로 만드는 egm 흐름은 어떻게 이어지나 {#idea-to-design-group}

`egm-brainstorm`, `egm-draft`, `egm-review`는 한 줄로 이어지는 세 단계다. 먼저 `concepts_brief.md`로 아이디어를 다듬고, 그 파일을 읽어 설계 문서를 쓰고, 완성된 문서를 리뷰한다. 세 스킬 모두 사용자가 이름으로 직접 불러야 켜지고, 다음 스킬은 에이전트가 시작하지 않고 사용자에게 시작하라고 안내한다(r01, r02, r05).[](source:i-bs-off)[](source:i-dr-off)[](source:i-rv-off)[](source:i-bs-opt1)[](source:i-dr-hand)

- 단계 사이를 잇는 것은 파일이다. brainstorm이 `concepts_brief.md`를 쓰고, draft가 그것을 우선순위 1 입력으로 읽는다.[](source:i-bs-opt1)[](source:i-dr-intake)
- brainstorm이 적은 기각한 선택지는 draft가 `Alternatives Considered`를 쓸 때 쓰는 유일한 출처다.[](source:i-bs-alt)[](source:i-dr-alt)
- 각 단계 끝에는 사람이 결정하는 지점이 있다. 결정 없이 다음 단계로 넘어가는 경로는 원문에 명시 없음.[](source:i-bs-gate)[](source:i-dr-gate)[](source:i-rv-preset)
- 리뷰 단계의 내부 규칙과 수치는 `egm/_group-review-and-fix/review-and-fix.html`과 `egm/egm-review/egm-review.html`에 있다.

@answer scope="egm · brainstorm · draft · review · 커밋 d494974 · 지시상 동작 · 서브에이전트 정의와 기준 문서는 확인하지 못함(부분 분석)"
@meta locale=ko
@source i-bs-off title="egm/egm-brainstorm/SKILL.md · 호출 제한" path=egm/egm-brainstorm/SKILL.md lines=4:4
@source i-dr-off title="egm/egm-draft/SKILL.md · 호출 제한" path=egm/egm-draft/SKILL.md lines=4:4
@source i-rv-off title="egm/egm-review/SKILL.md · 호출 제한" path=egm/egm-review/SKILL.md lines=4:4
@source i-bs-over title="egm-brainstorm/SKILL.md · 개요" path=egm/egm-brainstorm/SKILL.md lines=18:25
@source i-bs-deleg title="egm-brainstorm/SKILL.md · 서브에이전트 없을 때" path=egm/egm-brainstorm/SKILL.md lines=34:36
@source i-bs-cons title="egm-brainstorm/SKILL.md · Execution Constraints" path=egm/egm-brainstorm/SKILL.md lines=38:88
@source i-bs-ask title="egm-brainstorm/SKILL.md · 열린 질문과 readiness 조건" path=egm/egm-brainstorm/SKILL.md lines=46:53
@source i-bs-gate title="egm-brainstorm/SKILL.md · 1단계 readiness 게이트" path=egm/egm-brainstorm/SKILL.md lines=126:157
@source i-bs-synth title="egm-brainstorm/SKILL.md · 2단계 Goldfish 리뷰" path=egm/egm-brainstorm/SKILL.md lines=159:177
@source i-bs-alt title="egm-brainstorm/SKILL.md · Alternatives Weighed 절" path=egm/egm-brainstorm/SKILL.md lines=200:203
@source i-bs-iter title="egm-brainstorm/SKILL.md · 3단계 반복" path=egm/egm-brainstorm/SKILL.md lines=210:218
@source i-bs-hgate title="egm-brainstorm/SKILL.md · 4단계 handoff 선택지" path=egm/egm-brainstorm/SKILL.md lines=224:243
@source i-bs-opt0 title="egm-brainstorm/SKILL.md · 선택지 0 RFC 게시" path=egm/egm-brainstorm/SKILL.md lines=245:255
@source i-bs-opt1 title="egm-brainstorm/SKILL.md · 선택지 1 egm-draft로" path=egm/egm-brainstorm/SKILL.md lines=256:263
@source i-bs-opt23 title="egm-brainstorm/SKILL.md · 선택지 2, 3" path=egm/egm-brainstorm/SKILL.md lines=264:269
@source i-dr-cons title="egm-draft/SKILL.md · Execution Constraints" path=egm/egm-draft/SKILL.md lines=20:71
@source i-dr-res title="egm-draft/SKILL.md · resources 의무 지시" path=egm/egm-draft/SKILL.md lines=22:23
@source i-dr-arch title="egm-draft/SKILL.md · 저자가 구조를 정한다" path=egm/egm-draft/SKILL.md lines=63:71
@source i-dr-ctx title="egm-draft/SKILL.md · Context File 입력" path=egm/egm-draft/SKILL.md lines=73:78
@source i-dr-gate title="egm-draft/SKILL.md · 절 승인 지점" path=egm/egm-draft/SKILL.md lines=87:139
@source i-dr-intake title="egm-draft/SKILL.md · 1단계 입력 우선순위" path=egm/egm-draft/SKILL.md lines=141:166
@source i-dr-alt title="egm-draft/SKILL.md · 4단계 대안" path=egm/egm-draft/SKILL.md lines=201:221
@source i-dr-recon title="egm-draft/SKILL.md · 6단계 brief와 대조" path=egm/egm-draft/SKILL.md lines=257:275
@source i-dr-dir title="egm-draft/SKILL.md · 저장 위치와 SITEMAP" path=egm/egm-draft/SKILL.md lines=277:312
@source i-dr-hand title="egm-draft/SKILL.md · handoff" path=egm/egm-draft/SKILL.md lines=317:321
@source i-rv-cons title="egm-review/SKILL.md · Execution Constraints" path=egm/egm-review/SKILL.md lines=30:69
@source i-rv-in title="egm-review/SKILL.md · 입력" path=egm/egm-review/SKILL.md lines=71:78
@source i-rv-ask title="egm-review/SKILL.md · 경로 입력은 채팅으로" path=egm/egm-review/SKILL.md lines=84:90
@source i-rv-deleg title="egm-review/SKILL.md · 서브에이전트 없을 때" path=egm/egm-review/SKILL.md lines=26:28
@source i-rv-preset title="egm-review/SKILL.md · preset 선택" path=egm/egm-review/SKILL.md lines=123:177
@source i-rv-stage5 title="egm-review/SKILL.md · Stage 5 Zoom Out" path=egm/egm-review/SKILL.md lines=287:289

## 세 스킬은 어떤 순서로 이어지나 {#flow}

@workflow id=design-flow title="아이디어에서 리뷰까지"
| idea | 아이디어 | external |
| bs | egm-brainstorm | backend |
| next | 다음 단계 선택? | external |
| rfc | RFC 게시 | backend |
| dr | egm-draft | backend |
| rv | egm-review | backend |
| idea > bs | |
| bs > next | brief 완성 |
| next > bs | 더 다듬기 | dashed |
| next > rfc | RFC로 | |
| rfc > dr | 피드백 뒤 | dashed |
| next > dr | draft로 | emphasis |
| dr > rv | 리뷰 권유 | emphasis |

@steps id=design-steps
| idea | 아이디어 | 사용자가 `egm-brainstorm`을 부르며 반쯤 굳은 개념을 준다. 개념이 없으면 에이전트가 무엇을 다룰지 묻는다.[](source:i-bs-over) | design-flow | idea |
| bs | egm-brainstorm | 열린 질문을 여러 턴 이어 가다 사용자가 준비됐다고 확인하면 Goldfish 리뷰를 돌리고 `concepts_brief.md`를 쓴다.[](source:i-bs-ask)[](source:i-bs-synth) | design-flow | bs |
| next | 다음 단계 선택? | 사용자가 RFC 게시, `egm-draft` 시작, 계속 다듬기, 끝내기 중 하나를 고른다.[](source:i-bs-hgate) | design-flow | next |
| rfc | RFC 게시 | `docs/designs/<feature_name>.md`에 쓰고 `SITEMAP.md`가 있으면 등록한다. 팀 피드백 뒤 draft를 시작하라고 상기시킨다.[](source:i-bs-opt0) | design-flow | rfc |
| dr | egm-draft | brief를 읽고 개요·기술 계획·대안·구현 계획을 절마다 쓰고, 절마다 사용자 승인을 받는다.[](source:i-dr-intake)[](source:i-dr-gate) | design-flow | dr |
| rv | egm-review | 완성한 문서 경로를 받아 리뷰 단계를 돌린다. 시작은 사용자가 한다.[](source:i-dr-hand)[](source:i-rv-in) | design-flow | rv |

## 단계 사이에 무엇이 넘어가나 {#handoff}

| 파일·폴더 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `concepts_brief.md` | egm-brainstorm. 작업 폴더나 artifact 폴더에 쓴다[](source:i-bs-over)[](source:i-bs-opt1) | egm-draft. 우선순위 1 입력이다. 없으면 `discussion_summary.md`, 그것도 없으면 채팅으로 묻는다[](source:i-dr-intake) |
| `Alternatives Weighed` 절 | egm-brainstorm. 기각한 선택지와 기술적 이유를 적는다[](source:i-bs-alt) | egm-draft 4단계. 절이 없으면 사용자에게 묻는다[](source:i-dr-alt) |
| `design_draft.md` | egm-draft. 작성 중인 초안이다[](source:i-dr-gate) | 사용자. 절마다 승인하거나 댓글로 고친다[](source:i-dr-gate) |
| `docs/designs/<feature_name>.md` | egm-brainstorm(RFC 게시 때)[](source:i-bs-opt0) | egm-draft. `Context File`로 받을 수 있다[](source:i-dr-ctx) |
| `<DESIGN_DIR>/<FEATURE>.md` | egm-draft 6단계. 기본 폴더는 `docs/designs/`다[](source:i-dr-dir) | egm-review. `TargetFile` 입력이다[](source:i-rv-in) |
| `docs/designs/SITEMAP.md` | brainstorm(RFC 게시)과 draft(저장). 파일이 있을 때만 등록한다[](source:i-bs-opt0)[](source:i-dr-dir) | 원문에 명시 없음 |

draft는 저장하기 전에 6단계에서 brief와 초안을 다시 대조한다. brief가 정한 것을 초안이 다르게 정했으면 모두 보고하고 사용자가 하나씩 결정할 때까지 기다린다. 에이전트가 초안을 brief에 맞춰 스스로 고치지 않는다.[](source:i-dr-recon)

## 세 스킬은 같은 규칙을 어디까지 공유하나 {#shared-rules}

세 스킬의 Execution Constraints는 같은 규칙 묶음이다(r22, r23). 판정: 세 스킬이 같은 문구를 따로 들고 있어서, 규칙을 바꾸려면 세 곳을 같이 고쳐야 한다. 이 규칙 묶음을 한 곳에서 공유한다는 말은 원문에 명시 없음.[](source:i-bs-cons)[](source:i-dr-cons)[](source:i-rv-cons)

| 규칙 | brainstorm | draft | review |
| --- | --- | --- | --- |
| 긴 결과물은 채팅에 붙이지 않고 파일에 쓴다 | 있다[](source:i-bs-cons) | 있다[](source:i-dr-cons) | 있다[](source:i-rv-cons) |
| 쉬운 영어로 쓰고 홍보성 형용사를 쓰지 않는다 | 있다[](source:i-bs-cons) | 있다[](source:i-dr-cons) | 있다[](source:i-rv-cons) |
| 맞장구와 사과를 금지하고 비판을 먼저 쓴다 | 있다[](source:i-bs-cons) | 있다[](source:i-dr-cons) | 있다[](source:i-rv-cons) |
| 사용자에게 묻는 지점은 질문 하나, `(Recommended)` 표기 없음 | 있다[](source:i-bs-cons) | 있다[](source:i-dr-cons) | 있다[](source:i-rv-cons) |
| 구조 결정은 선택지를 순위 없이 보여 주고 저자가 고른다 | 원문에 명시 없음 | 있다. 선택지 최대 3개, 순위와 기본값 표시 금지[](source:i-dr-arch) | 원문에 명시 없음 |
| 열린 질문에 객관식과 구조화 질문 도구를 쓰지 않는다 | 있다[](source:i-bs-ask) | 원문에 명시 없음 | review는 파일 경로 입력에 쓰지 않는다고만 적는다[](source:i-rv-ask) |

## 이 흐름을 쓰면 안 되거나 건너뛰어도 될 때 {#skip}

원문이 열어 둔 경로만 적는다.

| 상황 | 원문이 허용하는 길 |
| --- | --- |
| 이미 요구사항과 해법이 정해진 상태 | `egm-draft`에 `Context File`을 주거나, brief가 없으면 채팅으로 문제·목표를 입력할 수 있다.[](source:i-dr-ctx)[](source:i-dr-intake) |
| 설계 문서가 이미 있음 | `egm-review`에 문서 경로만 주면 된다. brainstorm과 draft를 거쳐야 한다는 말은 원문에 명시 없음.[](source:i-rv-in) |
| 서브에이전트 도구가 없음 | `egm-brainstorm`은 멈추고 사용자에게 알린다. `egm-review`도 같다. 같은 컨텍스트의 리뷰는 Goldfish 리뷰가 아니라고 적는다.[](source:i-bs-deleg)[](source:i-rv-deleg) |
| 모델이 알아서 시작하길 기대함 | 세 스킬 모두 `disable-model-invocation: true`라서 안 된다.[](source:i-bs-off)[](source:i-dr-off)[](source:i-rv-off) |

## 그림에서 뺀 관계 {#omitted}

| rel-id | 종류 | 그림에 있나 | 내용 |
| --- | --- | --- | --- |
| r01 | 넘김 | 있음 | 선택지에서 `egm-draft`로 |
| r02 | 넘김 | 있음 | RFC 게시 뒤 `egm-draft`로. 시작은 사용자가 한다[](source:i-bs-opt0) |
| r03 | 산출물 호환 | 표 | `Alternatives Weighed` 절 |
| r04 | 넘김 | 생략 | brief도 `discussion_summary.md`도 없을 때 draft가 `egm-brainstorm` 시작을 제안할 수 있다. 제안형이다[](source:i-dr-intake) |
| r05 | 넘김 | 있음 | draft 끝에서 `egm-review` 시작을 권한다 |
| r06 | 참고 | 생략 | draft는 Zoom Out 기준 채점을 스스로 하지 않는다. `egm-review` Stage 5가 새 컨텍스트에서 한다[](source:i-dr-recon)[](source:i-rv-stage5) |
| r07 | 공유 상태 | 표 | `docs/designs/`와 `SITEMAP.md` |
| r15 | 내부 위임 | 생략 | brainstorm이 `egm-synthesizer`를 띄워 리뷰어 6명을 돌린다. 정의 파일은 범위 밖이다[](source:i-bs-synth) |
| r22, r23 | 같은 계열 | 표 | 공통 규칙 표 |
| r24 | 참고 | 생략 | draft는 `resources/execution_instructions.md`를 읽고 적용하라고 의무로 적는다. 파일이 없어 `불명`이다[](source:i-dr-res) |

@callout level=open-question title="확인하지 못한 것"
Goldfish 리뷰어의 정의 파일(`agents/*.md`)과 `resources/execution_instructions.md`가 저장소에 없다. 그래서 brainstorm의 여섯 관점이 어떤 리뷰어에 어떻게 나뉘는지, draft가 `execution_instructions.md`에서 추가로 지키는 규칙이 무엇인지 확인하지 못했다.
brainstorm의 관점 표는 여섯 가지(Contrarian/YAGNI 등)이고 리뷰어 이름도 여섯 개지만, 둘이 일대일로 대응한다는 말은 원문에 명시 없음.[](source:i-bs-synth)
일곱 스킬 공통으로 `docs/codex.md`와 `docs/claude.md`를 먼저 읽으라고 하지만 파일이 없다. 어떤 스킬도 실행하지 않았고, 이 페이지는 지시상 동작이다.

@callout level=note title="이 묶음의 읽은 원문"
`egm-brainstorm`, `egm-draft`, `egm-review`의 `SKILL.md`를 다시 읽고 줄 번호를 확인했다. 각 스킬 내부 규칙과 수치는 `egm/egm-brainstorm/egm-brainstorm.html`, `egm/egm-draft/egm-draft.html`, `egm/egm-review/egm-review.html`에 있다.
