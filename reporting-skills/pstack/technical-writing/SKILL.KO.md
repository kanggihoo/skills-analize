---
name: technical-writing
description: "계층형 기술 문서 작성 표준: Diátaxis 구조, Google 개발자 스타일 문장, STE 지시문 규칙, Global English 문법. /technical-writing을 실행하거나 문서, RFC, readme, PR 설명, 커밋 메시지를 작성하거나 검토할 때 사용한다."
disable-model-invocation: true
---

# 기술 문서 작성

목표는 지친 엔지니어가 한 번 읽고 이해하는 글을 쓰는 것이다. 네 개의 계층이 이를 돕고, 각 계층은 질문 하나를 맡는다. 이 문서가 어떤 종류인가, 문장이 독자를 어떻게 다루는가, 각 문장이 얼마나 많은 것을 싣는가, 어떤 문장이 두 가지로 읽힐 수 있는가. 네 가지를 모두 적용한다.

세 가지 규칙이 계층 위에 있다.

- **일을 하지 않는 단어는 모두 줄인다.** 문장이 단어 없이도 성립하면 그 단어는 뺀다. "In order to"는 "to"다. "It is important to note that"은 아무 뜻도 없으므로 통째로 뺀다.
- **짧고 일상적인 단어를 쓴다.** "utilize" 대신 "use". "facilitate" 대신 "help". "perform" 대신 "do". 긴 단어는 정확성으로 길이를 정당화해야 한다.
- **규칙이 문장을 나쁘게 만들면 다른 방식으로 문장을 고치거나 그냥 둔다.** 규칙은 독자를 위해 있다. 모든 규칙을 따르고도 기계가 쓴 것처럼 들리는 문장은 실패한 것이다.

코드베이스가 단어 목록이다. 동의어나 설명이 아니라 실제 심볼, 파일, 플래그, 명령의 이름을 쓴다.

전문 용어를 새로 만들지 않는다. 개발자가 말로 할 때 쓰는 단어를 쓴다. "evacuate", "ratchet", "endgame"이 아니라 "move", "delete", "a budget that only decreases"를 쓴다. 이름이 붙은 패턴은 문서가 처음 나올 때 뜻을 설명하면 괜찮다. 새로운 문제 표현과 그 대체어는 답변에서 `unslop`의 추상 은유 규칙에 대한 추가 제안으로, diff와 함께 제시한다. 그 스킬은 수정하지 않는다.

## 리듬을 바꾼다

계층은 문서가 무엇을 말하는지, 각 문장이 얼마나 많은 것을 싣는지를 정한다. 그래도 모든 문장이 짧게 끊기고, 어떤 관점도 없고, 구체적인 내용도 없으면 문서는 여전히 기계가 쓴 것처럼 읽힌다.

- 문장 길이를 의도적으로 섞는다. 짧은 문장은 요점을 내리꽂는다. 긴 문장은 사실을 그 조건이나 결과와 함께 천천히 전한다.
- 문장 하나에 생각 하나는 문장 길이가 하나로 정해진다는 뜻이 아니다. 생각을 둘 담은 문장은 나누고, 생각 하나를 담은 긴 문장은 그대로 둔다.
- 모드가 허용하면 관점을 가진다. 설명(explanation)은 장단점을 나열하지 말고 무엇을 두고 어떻게 판단하는지 말한다. 참조(reference)는 건조하게 유지한다.
- 무던하기보다 구체적으로 쓴다. "schema changes can cause issues"가 아니라 "a column rename fails the build"라고 쓴다.

## 먼저 모드를 고른다(Diátaxis)

문서 하나에 모드 하나다. 두 가지 질문으로 모드가 정해진다. 내용이 행동(doing)을 알려 주는가, 이해(thinking)를 알려 주는가? 그리고 학습을 돕는가, 일을 돕는가?

- 행동 + 학습: **tutorial**.
- 행동 + 일: **how-to**.
- 이해 + 일: **reference**.
- 이해 + 학습: **explanation**.

나침반은 문서 전체에도, 문장 하나에도 쓴다.

**Tutorial: 해 보며 배우기.** 당신은 교사다. 학습자의 성공은 당신의 일이지 학습자의 일이 아니다. "배운다"가 아니라 학습자가 무엇을 만들게 될지로 시작한다. 모든 단계는 이르고 자주 눈에 보이는 결과를 낸다. 기대되는 출력, 프롬프트 변경, 로그 줄 등 무엇을 보아야 하는지 말해 준다. 설명은 한 절과 링크로 줄인다. 설명을 위해 멈추면 수업이 끊긴다. 구체적으로 쓴다. "we"를 쓰고, 명령으로 쓴다. "First, do x. Now, do y."

**How-to: 목표에 이르는 단계.** 기계가 할 수 있는 작업이 아니라 사람이 가진 문제를 푼다. 독자가 이미 할 줄 안다고 가정한다. 가르치지 않는다. 행동만 쓴다. 곁가지, 배경, 완전성을 위한 완전성은 없다. 그런 내용은 링크로 연결한다. 선택지와 판단을 허용한다. "If you want x, do y."처럼 쓴다. 가이드 이름은 작업으로 짓는다. "Radar array calibration"이 아니라 "How to calibrate the radar array"로 쓴다.

**Reference: 찾아보기 위한 사실.** 설명만 한다. 지시, 설득, 의견은 없다. 건조하고, 완전하고, 확신에 차 있다. 사실, 선택지, 한계, 오류를 망설임 없이 서술한다. 설명하는 대상의 구조를 그대로 따라, 코드와 문서를 함께 탐색할 수 있게 한다. 독자가 기대하는 자리에 내용을 둔다. 가능하면 코드에서 생성해 계속 사실로 남게 한다.

**Explanation: 이해와 이유.** 제품과 떨어져서도 읽을 수 있는 하나의 경계 있는 주제. 각 제목은 앞에 "About..."이 암묵적으로 붙어도 어색하지 않아야 한다. 실제 "왜"라는 질문에 닻을 내린다. 설계 결정, 역사, 제약, 대안 같은 맥락을 준다. 의견은 여기서만 허용된다.

모드를 섞지 않는다. tutorial 안에 참조 표를 넣지 않고, reference 안에 tutorial식 손잡기를 넣지 않고, how-to 안에서 논쟁하지 않는다. 나누고 연결한다.

## 독자에게 맞춰 문장을 쓴다(Google 개발자 스타일)

- 독자를 현재 시제의 "you"로 부른다. "Will"은 실제로 나중에 일어날 일에만 쓴다.
- 누가 무엇을 하는지 말한다. "is checked"가 아니라 "the compiler checks"로 쓴다. 행위자를 모르거나 중요하지 않을 때만 수동태를 쓴다.
- 지시는 명령으로 쓴다. "Click Submit." 사실은 평이하게 말한다. "should be done"은 쓰지 않는다.
- 조건을 지시 앞에 둔다. "To delete the document, click Delete." 독자는 해당하지 않는 내용을 건너뛴다.
- 흔한 경우를 먼저 쓴다. 예외는 뒤에 쓴다.
- 아는 친구처럼 말한다. 유행어, 비유, 지시문에서의 "please", 절차에서의 "simply", "easy", "quickly"는 쓰지 않는다. 쉬운 일이었다면 독자가 여기 있지 않았을 것이다.
- 미리 예고하지 않는다("we will soon support..."). 연속된 문장을 같은 말로 시작하지 않는다.
- 링크는 어디로 가는지 말하는 단어로 건다. 페이지 제목이나 짧은 설명을 쓴다. "click here"는 쓰지 않는다. 링크를 걸기보다 페이지 안에 맥락을 한 문장 쓰는 편이 낫다.
- 제목은 주제가 아니라 요점을 담는다("Modes"가 아니라 "Pick the mode first"). 문장형 대소문자(sentence case)를 쓴다. 작업 제목은 동사구만 쓴다("Create an instance"). 개념 제목은 명사구를 쓴다. 페이지마다 h1은 하나만 두고, 단계를 건너뛰지 않는다.
- 순서가 있으면 번호 목록을, 나머지는 글머리 기호를 쓴다. 목록은 완전한 문장으로 소개한다. 항목은 병렬 구조로 맞춘다.
- 코드는 코드 글꼴로 쓴다. UI 요소는 굵게 쓴다. 쉼표 열거(serial comma)를 쓴다. "etc."는 빼고, 목록이 일부라는 것을 앞에서 밝힌다.

## 지시문을 한 번에 하나씩 읽히게 한다(STE 규칙)

- 지시 문장은 하나에 하나만 담는다. 그 밖의 모든 문장도 생각 하나만 담는다.
- 지시는 약 20단어를 넘으면 나누고, 그 밖의 문장은 약 25단어를 넘으면 나눈다.
- 경고나 조건은 그것이 보호하는 단계 앞에 둔다. "If hot oil touches your skin, injuries can occur."
- "the"와 "a"를 유지한다. "Remove backup file"은 두 가지로 읽힌다. "Remove the backup file"은 한 가지로 읽힌다.
- 단어 하나에 뜻 하나, 역할 하나를 주고 계속 지킨다. "check"가 검사를 뜻하면, 억제를 뜻하는 데 쓰지 않는다.
- 행동마다 단어를 하나로 정하고 고수한다. 한쪽에서 "start"를, 다른 쪽에서 "initiate"를 쓰지 않는다.
- 절차는 직접 명령으로 쓴다. 서술하지 않고, 수동태로 쓰지 않는다. "Install the component"이지 "the component must be installed"가 아니다.
- 가능하면 "-ing" 단어를 피한다. 여러 문법 역할을 맡아 오독을 부추긴다.

## 두 가지로 읽힐 여지가 없게 한다(Global English)

- "only"와 "not" 같은 단어는 바꾸는 단어 바로 옆에 둔다. "only fails on growth"와 "fails only on growth"는 다른 뜻이다.
- 긴 명사 나열을 쪼갠다. "the proto import budget check script"는 "the script that checks the proto-import budget"이 된다.
- 모든 "it", "they", "this"는 명백히 하나의 대상을 가리키게 한다. 의심스러우면 명사를 반복한다. 절 전체를 가리킬 때 "this"나 "which"를 쓰지 않는다.
- 동사를 빼먹지 않는다. "Phase 1 moves the converters and Phase 2 the runtime"은 Phase 2에 동사가 없다. 동사를 준다.
- 구조를 보여 주는 작은 단어를 유지한다. "Ensure that the switch is off"는 "that"을 남겨 문장이 한 가지로 파싱되게 한다. 단어 수를 줄이려고 명확성을 포기하지 않는다.
- 두 가지로 잘못 읽힐 수 있으면 열거에서 관사를 반복한다. "the client and the host"처럼 쓰고, "the client and host"로 쓰지 않는다. 둘이 서로 다른 것이기 때문이다.
- 문장이 두 방식으로 묶일 수 있으면 "and"나 "or"가 무엇을 잇는지 말한다. "Both...and", "either...or", "if...then"은 모호함을 없애는 데 쓸 수 있다.
- 세미콜론이 아니라 마침표를 쓴다. 엠 대시는 새 문장으로 바꾼다.
- 괄호 안 텍스트는 완전한 문법 단위이거나 독립된 문장이어야 한다. "(s)"로 복수를 만들지 않는다.
- 슬래시를 쓰지 않는다. "a/b"나 "and/or" 대신 "a, b, or both"라고 쓴다.
- 같은 것은 어디서나 같은 이름으로 부른다. 한 가지를 두고 "the gate", "the ratchet", "the budget check"라고 쓰면 독자는 세 가지를 배운다. 바뀌지 않은 문장을 수정하면서 다시 쓰는 것도 같은 비용이다. 바뀌지 않은 것은 건드리지 않는다.
- 관용구, 구어체, 라틴어 약어, 은유는 피한다. 비원어민 독자, 번역가, 에이전트 모두 평이한 구문을 가장 잘 파싱한다.

## 어조와 저장소 세부 사항

- 이 스킬이 다루는 모든 문서에 **unslop** 스킬을 적용한다. 슬롭 패턴 목록(AI 어휘, 군더더기, 얼버무림, 서식상 특징)은 그 스킬이 소유한다.
- PR 설명과 커밋 메시지도 글쓰기다. Diátaxis를 뺀 모든 계층이 적용된다. PR 본문은 검토자가 1분 안에 읽을 수 있는 브리핑이다. 스웜 로그, SHA 목록, 지표 표를 붙여 넣지 않는다. 링크한다.
- 제품 UI 문자열은 문서가 아니다. 그런 문자열에는 제품의 문구 가이드라인을 사용한다.
- 코드 조각은 탭으로 들여쓴다. 실제 경로와 실제 심볼을 쓴다. 개수나 트리에 대한 모든 주장은 그것을 도입하는 커밋에서 참이어야 하며, 다시 생성하는 명령을 함께 적는다.

## 실제 예시

수정 전:

> Configuration of the proto import ratchet budget script parameters is performed via budget.json. Note that it's important to remember that running with --write, which updates the committed budget to reflect the current count, should only be done when lowering it. If exceeded, CI fails.

수정 후:

> `budget.mjs` reads the committed budget from `budget.json` and counts the files that import protos. If the count exceeds the budget, CI fails. Run `budget.mjs --write` only to lower the budget.
