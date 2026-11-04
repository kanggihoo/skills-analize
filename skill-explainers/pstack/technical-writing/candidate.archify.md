# technical-writing 스킬은 에이전트를 어떻게 바꾸나 {#technical-writing-skill}

`technical-writing`을 쓰면 에이전트는 문서, RFC, README, PR 설명, commit 메시지를 네 겹 기준에 맞춰 쓰거나 리뷰한다. 목표는 지친 엔지니어가 처음 읽고 이해하는 글이다.[](source:goal)

- 네 겹은 문서 종류(Diátaxis), 독자에게 말을 거는 방식(Google 개발자 문체), 문장 하나의 정보량(STE), 두 갈래 해석 막기(Global English)다. 문서에는 넷 다 적용한다.[](source:goal)
- 네 겹 위에 규칙 세 개가 더 있다. 에이전트는 일하지 않는 단어를 지우고, 짧은 일상어를 쓰고, 규칙이 문장을 망치면 다른 방법으로 고친다.[](source:over)
- PR 설명과 commit 메시지에는 Diátaxis를 빼고 나머지 세 겹을 적용한다.[](source:voice)
- 에이전트는 손대는 모든 문서에 `unslop`도 적용한다. AI 티 나는 표현 목록은 `unslop`이 맡는다.[](source:voice)

@answer scope="pstack/technical-writing · 원본 텍스트 파일 1개 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/technical-writing/SKILL.md · 9792B · 본문(frontmatter)" path=pstack/technical-writing/SKILL.md lines=1:5
@source goal title="pstack/technical-writing/SKILL.md · 목표와 네 겹" path=pstack/technical-writing/SKILL.md lines=9:9
@source over title="pstack/technical-writing/SKILL.md · 네 겹 위의 세 규칙" path=pstack/technical-writing/SKILL.md lines=11:15
@source words title="pstack/technical-writing/SKILL.md · 코드베이스가 단어 목록" path=pstack/technical-writing/SKILL.md lines=17:19
@source rhythm title="pstack/technical-writing/SKILL.md · Vary the rhythm" path=pstack/technical-writing/SKILL.md lines=21:28
@source compass title="pstack/technical-writing/SKILL.md · Diátaxis 나침반" path=pstack/technical-writing/SKILL.md lines=30:39
@source modes title="pstack/technical-writing/SKILL.md · 모드 네 개" path=pstack/technical-writing/SKILL.md lines=41:49
@source google title="pstack/technical-writing/SKILL.md · Google developer style" path=pstack/technical-writing/SKILL.md lines=51:63
@source ste title="pstack/technical-writing/SKILL.md · STE rules" path=pstack/technical-writing/SKILL.md lines=65:74
@source global title="pstack/technical-writing/SKILL.md · Global English" path=pstack/technical-writing/SKILL.md lines=76:89
@source voice title="pstack/technical-writing/SKILL.md · Voice and repo specifics" path=pstack/technical-writing/SKILL.md lines=91:96
@source example title="pstack/technical-writing/SKILL.md · Worked example" path=pstack/technical-writing/SKILL.md lines=98:106
@source pm-tw title="pstack/poteto-mode/SKILL.md · 문서류 → technical-writing" path=pstack/poteto-mode/SKILL.md lines=27:27
@source pb-mpp title="pstack/poteto-mode/playbooks/multi-phase-plan.md · 계획 문서" path=pstack/poteto-mode/playbooks/multi-phase-plan.md lines=9:9
@source pb-pr title="pstack/poteto-mode/playbooks/opening-a-pr.md · PR 글" path=pstack/poteto-mode/playbooks/opening-a-pr.md lines=9:9
@source help-tw title="pstack/poteto-help/SKILL.md · 상황별 스킬 표" path=pstack/poteto-help/SKILL.md lines=74:74
@source unslop-13 title="pstack/unslop/SKILL.md · 규칙 13" path=pstack/unslop/SKILL.md lines=36:36
@source unslop-26 title="pstack/unslop/SKILL.md · 규칙 26" path=pstack/unslop/SKILL.md lines=57:57

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) `description`에 "when writing or reviewing docs"라고 적혀 있어도 마찬가지다. 그래서 사용자가 `/technical-writing`을 입력하거나, 다른 스킬이 글을 쓰는 단계에서 부를 때 켜진다.

| 누가 부르나 | 조건 | rel-id |
| --- | --- | --- |
| 사용자 | `/technical-writing` 입력. 안내 표에서는 "문서를 기준에 맞춰 쓸 때" 쓰는 스킬이다[](source:help-tw) | - |
| `poteto-mode` | 문서, RFC, README, PR 설명, commit 메시지를 쓸 때[](source:pm-tw) | r07 |
| `multi-phase-plan` 플레이북 | 계획 문서를 이 스킬로 전부 쓴 뒤 `unslop`을 적용한다. 본문은 how-to 모드 하나다[](source:pb-mpp) | 플레이북 표 |
| `opening-a-pr` 플레이북 | PR 제목·설명과 commit 본문을 쓸 때 부른다. Diátaxis 층을 뺀 모든 층을 적용한다[](source:pb-pr) | 플레이북 표 |

## 어떤 글에 어떤 기준을 적용하나 {#flow}

@workflow id=tw-flow title="글 종류별 적용 기준"
| kind | 어떤 글인가? | backend |
| ui | UI 지침 | external |
| pr | 세 겹 적용 | backend |
| mode | 모드 고르기 | backend |
| all | 네 겹 적용 | backend |
| unslop | unslop | backend |
| kind > ui | UI | dashed |
| kind > pr | PR | |
| kind > mode | 문서 | emphasis |
| mode > all | | emphasis |
| pr > unslop | | |
| all > unslop | | emphasis |

@steps id=tw-steps
| s-kind | 어떤 글인가? | 에이전트는 먼저 글의 종류를 가린다. 제품 UI 문자열은 문서가 아니다. PR 설명과 commit 메시지는 글이다. 나머지 문서는 모드부터 고른다. | tw-flow | kind |
| s-ui | UI 지침 | UI 문자열에는 이 스킬 대신 제품의 문구 지침을 쓴다. | tw-flow | ui |
| s-pr | 세 겹 적용 | 에이전트는 Diátaxis 층을 뺀 세 겹을 적용한다. PR 본문은 리뷰어가 1분 안에 읽는 브리핑이다. swarm 로그, SHA 목록, 지표 표는 붙이지 않고 링크한다. | tw-flow | pr |
| s-mode | 모드 고르기 | 에이전트는 문서 하나에 모드 하나를 고른다. 행동과 이해, 학습과 업무라는 두 질문으로 고른다. 문서 전체에도, 문장 하나에도 쓴다. | tw-flow | mode |
| s-all | 네 겹 적용 | 에이전트는 고른 모드 안에서 문장 세 겹을 적용한다. 모든 규칙을 지켰는데도 기계가 쓴 듯하면 실패한 글이다. | tw-flow | all |
| s-unslop | unslop | 에이전트는 이 스킬이 손대는 모든 문서에 `unslop`을 적용한다. | tw-flow | unslop |

이 흐름의 근거는 `SKILL.md`의 모드 절과 마지막 절이다.[](source:compass)[](source:voice) 네 겹 가운데 모드를 먼저 고른다는 순서만 원문에 있다. 나머지 세 겹과 `unslop` 사이의 순서는 원문에 명시 없음. `multi-phase-plan` 플레이북은 이 스킬을 먼저, `unslop`을 나중에 쓰게 한다.[](source:pb-mpp)

네 겹 위에서 에이전트가 늘 지키는 것은 다음과 같다.

- 일하지 않는 단어를 지운다. `In order to`는 `to`가 되고, `It is important to note that`은 통째로 빠진다.[](source:over)
- 짧은 일상어를 쓴다. `utilize` 대신 `use`, `perform` 대신 `do`다. 긴 단어는 길이만큼 더 정확할 때만 쓴다.[](source:over)
- 코드베이스가 단어 목록이다. 동의어나 묘사 대신 실제 심볼, 파일, 플래그, 명령 이름을 쓴다.[](source:words)
- 전문어를 지어내지 않는다. "evacuate", "ratchet", "endgame" 대신 "move", "a budget that only decreases"처럼 소리 내어 말할 단어를 쓴다.[](source:words)
- 문장 길이를 일부러 섞는다. 생각 둘을 담은 문장은 나누고, 하나를 담은 긴 문장은 둔다. 막연한 말 대신 "a column rename fails the build"처럼 구체적으로 쓴다.[](source:rhythm)

## 문서 모드는 어떻게 고르나 {#diataxis}

에이전트는 두 질문으로 모드를 고른다. 내용이 행동을 돕는가 이해를 돕는가, 그리고 학습용인가 업무용인가.[](source:compass)

| 모드 | 조합 | 에이전트가 하는 일 | 하지 않는 것 |
| --- | --- | --- | --- |
| tutorial | 행동 + 학습 | 무엇을 만들지로 시작한다. 단계마다 보이는 결과와 기대 출력을 알려 준다. "we"와 명령형으로 쓴다("First, do x. Now, do y.")[](source:modes) | 설명은 한 절과 링크로 줄인다 |
| how-to | 행동 + 업무 | 사람이 가진 문제를 푼다. 독자의 숙련을 전제한다. 분기를 허용한다("If you want x, do y."). 제목은 작업 이름이다("How to calibrate the radar array")[](source:modes) | 가르치기, 배경, 곁가지 |
| reference | 이해 + 업무 | 묘사만 한다. 사실, 옵션, 한계, 오류를 단정적으로 적는다. 대상의 구조를 그대로 따르고, 가능하면 코드에서 생성한다[](source:modes) | 지시, 설득, 의견, 얼버무림 |
| explanation | 이해 + 학습 | 경계가 있는 주제 하나를 다룬다. 제목 앞에 "About..."이 붙어도 말이 되게 한다. 설계 결정, 역사, 제약, 대안을 준다[](source:modes) | 의견은 이 모드에서만 허용{good:의견 허용} |

모드를 섞지 않는다. tutorial 안에 reference 표를, reference 안에 tutorial식 안내를, how-to 안에 논증을 넣지 않는다. 대신 나누고 링크한다.[](source:modes)

## 문장 세 겹은 무엇을 요구하나 {#sentence-layers}

**Google 개발자 문체.** 독자에게 말을 거는 방식을 정한다.[](source:google)

| 규칙 | 원문 예 |
| --- | --- |
| 독자를 "you"로 부르고 현재 시제로 쓴다. "will"은 정말 나중 일에만 | - |
| 행위자를 밝힌다. 수동태는 행위자를 모르거나 상관없을 때만 | "the compiler checks", not "is checked" |
| 지시는 명령형, 사실은 평서문으로 쓴다 | "Click Submit." / never "should be done" |
| 조건을 지시 앞에 둔다. 독자가 해당 없는 부분을 건너뛴다 | "To delete the document, click Delete." |
| 흔한 경우를 먼저, 예외를 뒤에 쓴다 | - |
| 유행어, 비유, 지시 속 "please"를 쓰지 않는다. 절차에 "simply", "easy", "quickly"를 쓰지 않는다 | - |
| 미리 알리지 않고, 연속된 문장을 같은 구로 시작하지 않는다 | "we will soon support..." |
| 링크 글자는 목적지를 말한다. 링크 대신 맥락 한 문장을 선호한다 | never "click here" |
| 제목은 주제가 아니라 요점이다. 문장형 대소문자, 작업 제목은 동사구, 개념 제목은 명사구, 페이지당 h1 하나, 단계 건너뛰기 금지 | "Pick the mode first", not "Modes" |
| 순서는 번호 목록, 나머지는 글머리표. 목록은 완전한 문장으로 소개하고 항목을 나란히 맞춘다 | - |
| 코드는 코드 글꼴, UI 요소는 굵게. 연속 쉼표를 쓰고 "etc." 대신 목록이 일부임을 먼저 밝힌다 | - |

**STE(Simplified Technical English).** 문장 하나가 싣는 양을 정한다.[](source:ste)

| 규칙 | 원문 예 |
| --- | --- |
| 문장 하나에 지시 하나, 그 밖에는 생각 하나 | - |
| 지시는 약 20단어, 다른 문장은 약 25단어를 넘으면 나눈다 | - |
| 경고나 조건을 그것이 지키는 단계 앞에 둔다 | "If hot oil touches your skin, injuries can occur." |
| "the"와 "a"를 남긴다 | "Remove backup file" → "Remove the backup file" |
| 단어 하나에 뜻 하나, 동작 하나에 단어 하나 | "check", "start" vs "initiate" |
| 절차는 직접 명령으로 쓴다. 서술이나 수동태로 쓰지 않는다 | "Install the component" |
| "-ing" 단어를 되도록 피한다. 문법 역할이 많아 잘못 읽힌다 | - |

**Global English.** 두 가지로 읽히는 문장을 막는다.[](source:global)

| 규칙 | 원문 예 |
| --- | --- |
| "only", "not"을 꾸미는 단어 바로 옆에 둔다 | "only fails on growth" vs "fails only on growth" |
| 긴 명사 줄을 푼다 | "the proto import budget check script" → "the script that checks the proto-import budget" |
| "it", "they", "this"가 하나만 가리키게 한다. 절 전체를 "this"나 "which"로 가리키지 않는다 | - |
| 동사를 빼먹지 않는다 | "Phase 1 moves the converters and Phase 2 the runtime" |
| 구조를 보여 주는 작은 단어를 남긴다. 단어 수와 명확성을 바꾸지 않는다 | "Ensure that the switch is off" |
| 오독을 막으려면 나열에서 관사를 반복한다 | "the client and the host" |
| "and"나 "or"가 무엇을 묶는지 밝힌다 | "both...and", "either...or", "if...then" |
| 세미콜론 대신 마침표, 엠 대시 대신 새 문장 | - |
| 괄호 안은 완전한 문법 단위로 쓴다. "(s)"로 복수를 만들지 않는다 | - |
| 빗금을 쓰지 않는다 | "a, b, or both", not "a/b" or "and/or" |
| 한 대상에 이름 하나. 바뀌지 않은 문장을 고쳐 쓰지 않는다 | "the gate", "the ratchet", "the budget check" |
| 관용구, 구어, 라틴어 약어, 비유를 쓰지 않는다 | - |

## 고치면 글이 어떻게 달라지나 {#example}

원문의 고치기 전후 예다. 모든 겹이 한 번에 적용된 모습을 보여 준다.

@code source=example language=markdown

판정: 고친 글은 실제 파일 이름(`budget.mjs`, `budget.json`)을 쓰고, 조건("If the count exceeds")을 결과 앞에 두고, 수동태("is performed")를 없앴다. 각각 코드베이스 단어 목록, Google 문체, STE 규칙에 해당한다.[](source:example)[](source:words)[](source:google)[](source:ste)

이 스킬에는 저장소에 맞춘 규칙도 있다. 코드 조각은 탭으로 들여 쓴다. 개수나 트리 주장은 그것을 넣는 commit 시점에 사실이어야 하고, 다시 만드는 명령을 함께 적는다.[](source:voice)

`unslop`과는 역할을 나눈다. 이 스킬은 새 금지 표현을 찾으면 `unslop`의 추상 은유 규칙(26번)에 넣자고 답변에 변경안(diff)으로 제안한다. `unslop` 파일은 직접 고치지 않는다.[](source:words)[](source:unslop-26) 엠 대시를 새 문장으로 바꾸라는 규칙은 `unslop` 규칙 13과 같은 방향이다.[](source:global)[](source:unslop-13)

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/technical-writing/SKILL.md`(원본, 유일한 텍스트 파일).
- 관계 확인용으로 읽은 줄: 위 출처 목록의 다른 스킬 줄. 각 줄만 확인했다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: `reporting-skills/pstack/technical-writing/SKILL.md`와 내용이 같다(`shasum` 일치).
- 실제로 실행해 보지 않았다. 이 페이지의 동작은 모두 원문이 지시한 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
이 스킬은 괄호 안을 완전한 문법 단위로 쓰라고 한다. `unslop` 규칙 13은 엠 대시 대신 쓰는 괄호를 막는다. 두 규칙이 일반 괄호를 어떻게 함께 다루는지는 원문에 명시 없음.[](source:global)[](source:unslop-13)
"규칙이 문장을 망치면 다른 방법으로 고치거나 둔다"는 판단을 누가 어떤 기준으로 하는지는 원문에 명시 없음.[](source:over)
