---
name: technical-writing
description: "Layered technical-writing standard: Diátaxis structure, Google developer style sentences, STE instruction rules, Global English syntax. Use for /technical-writing or when writing or reviewing docs, RFCs, readmes, PR descriptions, or commit messages."
disable-model-invocation: true
---

# Technical writing

목표는 지친 엔지니어가 첫 읽기에서 이해하는 글을 쓰는 것이다. 네 개의 층이 이를 가능하게 한다. 각 층은 질문 하나를 맡는다. 이 문서는 어떤 종류인가, 문장은 독자를 어떻게 다루는가, 각 문장은 얼마나 많은 것을 싣는가, 어떤 문장이든 두 가지로 읽힐 수 있는가. 네 층을 모두 적용한다.

세 가지 규칙이 층들 위에 있다.

- **일을 하지 않는 단어는 모두 자른다.** 문장이 단어 하나 없이도 성립하면 그 단어는 빼다. "In order to"는 "to"다. "It is important to note that"은 아무것도 아니다.
- **짧고 일상적인 단어를 쓴다.** "utilize"가 아니라 "use". "facilitate"가 아니라 "help". "perform"이 아니라 "do". 긴 단어는 정확성으로 그 길이를 값해야 한다.
- **규칙이 문장을 더 나쁘게 만들면, 문장을 다른 방식으로 고치거나 그대로 둔다.** 규칙은 독자를 위해 있다. 모든 규칙을 따르면서 기계가 쓴 것처럼 들리는 문장은 실패한 것이다.

코드베이스가 단어 목록이다. 동의어나 설명 대신, 실제 심볼, 파일, 플래그, 명령 이름을 쓴다.

전문 용어를 만들어 내지 않는다. 개발자가 소리 내어 말할 법한 단어를 쓴다. "move", "delete", "a budget that only decreases"처럼 쓰고, "evacuate", "ratchet", "endgame"은 쓰지 않는다. 명명된 패턴은 문서가 처음 등장할 때 뜻을 밝히면 괜찮다. 새로운 문제 표현과 그 대체어는 `unslop`의 추상 은유 규칙에 추가하는 제안으로 답변에 diff와 함께 적는다. 그 스킬은 직접 수정하지 않는다.

## 리듬을 바꾼다

층은 문서가 무엇을 말하는지와 각 문장이 얼마나 많은 것을 싣는지를 정한다. 문서가 모든 층을 지키고도 기계가 쓴 것처럼 읽힐 수 있다. 모든 문장이 짧게 잘려 있고, 어디에도 관점이 없고, 아무것도 구체적이지 않을 때다.

- 문장 길이를 의도적으로 섞는다. 짧은 문장은 요점을 내리꽂는다. 길게 가는 문장은 사실을 그 조건이나 결과와 함께 싣는다.
- 문장마다 생각 하나라는 것이 문장마다 길이 하나라는 뜻은 아니다. 생각을 둘 담은 문장은 나누고, 생각 하나만 담은 긴 문장은 그대로 둔다.
- 양식이 허락하는 곳에서는 관점을 가진다. 설명은 장단점을 저울질하므로, 장단점 목록만 나열하지 말고 그것을 어떻게 보는지 말한다. 참고 문서는 건조하게 쓴다.
- 무미건조함보다 구체성을 택한다. "schema changes can cause issues"가 아니라 "a column rename fails the build".

## 먼저 양식을 고른다(Diátaxis)

문서 하나에 양식 하나다. 두 질문이 양식을 고른다. 내용이 행동(하기)을 안내하는가, 이해(생각하기)를 안내하는가. 그리고 배움을 돕는가, 일을 돕는가.

- 행동 + 배움: **tutorial**.
- 행동 + 일: **how-to**.
- 이해 + 일: **reference**.
- 이해 + 배움: **explanation**.

나침반은 문서 전체에도, 문장 하나에도 쓴다.

**Tutorial: 해 보면서 배우기.** 당신은 선생이다. 학습자의 성공은 당신의 일이지 그들의 일이 아니다. 무엇을 "배울" 것인지가 아니라 무엇을 만들 것인지로 연다. 모든 단계는 일찍, 자주 눈에 보이는 결과를 낸다. 무엇을 보게 될지 말한다. 기대되는 출력, 프롬프트의 변화, 로그 한 줄이 여기에 든다. 설명은 한 절과 링크로 줄인다. 가르치느라 멈추는 것은 수업을 깬다. 구체적으로 말한다. 명령으로 "we"를 써서 쓴다. "First, do x. Now, do y."

**How-to: 목표에 이르는 단계.** 기계가 할 수 있는 작업이 아니라, 사람이 가진 문제를 푼다. 능숙함을 전제한다. 가르치기는 건너뛴다. 행동만 쓴다. 옆길, 배경, 완전성을 위한 완전성은 없다. 대신 링크한다. 갈래와 판단을 허용한다. "If you want x, do y." 작업으로 가이드를 이름 붙인다. "Radar array calibration"이 아니라 "How to calibrate the radar array".

**Reference: 찾아보기 위한 사실.** 묘사한다. 오직 묘사만 한다. 지시, 설득, 의견은 없다. 건조하고, 완전하고, 확신에 차 있다. 사실, 선택지, 한계, 오류를 얼버무림 없이 밝힌다. 묘사하는 대상의 구조를 그대로 따라, 코드와 문서를 함께 훑을 수 있게 한다. 자료는 독자가 기대하는 곳에 둔다. 가능하면 코드에서 생성해 계속 사실이 되게 한다.

**Explanation: 이해와 이유.** 하나의 경계가 분명한 주제이며, 제품 밖에서도 읽을 수 있다. 각 제목은 앞에 암묵적인 "About..."이 붙어도 괜찮아야 한다. 실제 "왜" 질문에 닻을 둔다. 맥락을 준다. 설계 결정, 역사, 제약, 대안이 여기에 든다. 의견은 이 양식에서만 허용되며 다른 곳에서는 허용되지 않는다.

양식을 섞지 않는다. tutorial 안에 참조 표를 넣지 않고, reference 안에 tutorial식 손잡기를 넣지 않으며, how-to 안에서 논쟁하지 않는다. 대신 나누고 링크한다.

## 독자에게 문장을 쓴다(Google developer style)

- 독자를 현재 시제의 "you"로 부른다. "Will"은 실제로 나중에 일어날 일에만 쓴다.
- 누가 무엇을 하는지 말한다. "is checked"가 아니라 "the compiler checks". 행위자를 모르거나 행위자가 중요하지 않을 때만 수동태를 쓴다.
- 지시는 명령으로 쓴다. "Click Submit." 사실은 평이하게 말한다. "should be done"은 절대 쓰지 않는다.
- 조건을 지시 앞에 둔다. "To delete the document, click Delete." 독자는 해당하지 않는 것을 건너뛴다.
- 흔한 경우를 먼저 둔다. 예외는 뒤에 둔다.
- 아는 친구처럼 말한다. 유행어, 비유적 표현, 절차에서의 "please", 그리고 "simply", "easy", "quickly"는 쓰지 않는다. 쉬웠다면 독자는 여기 오지 않았을 것이다.
- 미리 예고하지 않는다("we will soon support..."). 연속된 문장을 같은 구절로 시작하지 않는다.
- 링크는 어디로 가는지 말하는 단어로 건다. 페이지 제목이나 짧은 설명을 쓴다. "click here"는 절대 쓰지 않는다. 페이지 밖의 링크보다 페이지 안의 맥락 한 문장을 선호한다.
- 제목은 주제가 아니라 요점을 담는다("Modes"가 아니라 "Pick the mode first"). 문장형 대소문자를 쓴다. 작업 제목은 동사구만 쓴다("Create an instance"). 개념 제목은 명사구를 쓴다. 페이지마다 h1은 하나이며, 단계를 건너뛰지 않는다.
- 순서가 있으면 번호 목록, 나머지는 글머리 기호를 쓴다. 목록은 완전한 문장으로 소개한다. 항목은 문장 구조를 맞춘다.
- 코드는 코드 글꼴로 쓴다. UI 요소는 굵게 쓴다. 직렬 쉼표를 쓴다. "etc."는 빼고, 목록이 일부라는 사실을 먼저 밝힌다.

## 문장을 한 번에 하나씩 읽히게 한다(STE rules)

- 지시는 문장마다 하나. 그 밖의 모든 문장도 생각 하나씩.
- 지시는 약 20단어를 넘으면 나누고, 다른 문장은 약 25단어를 넘으면 나눈다.
- 경고나 조건은 그것이 보호하는 단계 앞에 둔다. "If hot oil touches your skin, injuries can occur."
- "the"와 "a"를 유지한다. "Remove backup file"은 두 가지로 읽힌다. "Remove the backup file"은 한 가지로 읽힌다.
- 단어 하나에 뜻 하나와 역할 하나를 주고 지킨다. "check"가 검사를 뜻한다면, 억제를 뜻하는 데 쓰지 않는다.
- 동작 하나에 단어 하나를 고르고 고수한다. 한 곳에서 "start"라고 쓰고 다른 곳에서 "initiate"라고 쓰지 않는다.
- 절차는 직접 명령으로 쓴다. 서술로 쓰지 않으며, 수동태로도 쓰지 않는다. "Install the component", "the component must be installed"가 아니다.
- 가능하면 "-ing" 단어를 피한다. 너무 많은 문법 역할을 맡고 잘못 읽히기 쉽다.

## 문장이 두 가지로 읽힐 여지를 남기지 않는다(Global English)

- "only"나 "not" 같은 단어는 바꾸는 단어 바로 옆에 둔다. "only fails on growth"와 "fails only on growth"는 다른 뜻이다.
- 긴 명사 나열을 끊는다. "the proto import budget check script"는 "the script that checks the proto-import budget"이 된다.
- 모든 "it", "they", "this"는 하나의 분명한 대상을 가리키게 한다. 의심스러우면 명사를 되풀이한다. 절 전체를 가리키는 "this"나 "which"는 쓰지 않는다.
- 동사를 빼먹지 않는다. "Phase 1 moves the converters and Phase 2 the runtime"은 Phase 2에 동사가 없다. 하나를 준다.
- 구조를 보여 주는 작은 단어는 남긴다. "Ensure that the switch is off"는 "that"을 유지한다. 그래야 문장이 한 가지로 파싱된다. 단어 수를 줄이려고 명료함을 희생하지 않는다.
- 두 가지를 가리킬 때 잘못 읽히지 않도록 나열 안에서 관사를 되풀이한다. "the client and host"가 아니라 "the client and the host"로 쓴다. 두 가지이기 때문이다.
- 문장이 두 방식으로 묶일 수 있으면, "and"나 "or"가 무엇을 잇는지 밝힌다. "Both...and", "either...or", "if...then"은 공짜로 모호함을 없애 주는 장치다.
- 세미콜론이 아니라 마침표를 쓴다. 엠 대시는 새 문장으로 바꾼다.
- 괄호 안의 텍스트는 완전한 문법 단위이거나 독립된 문장이어야 한다. "(s)"로 복수를 만들지 않는다.
- 슬래시를 쓰지 않는다. "a/b"나 "and/or" 대신 "a, b, or both"로 쓴다.
- 각 대상은 어디서나 한 이름으로 부른다. 한 대상을 문서에서 "the gate", "the ratchet", "the budget check"라고 부르면 세 가지를 가르치는 셈이다. 바뀌지 않은 문장을 편집 사이에 다시 쓰는 것도 같은 비용을 치른다. 바뀌지 않은 것은 손대지 않는다.
- 관용구, 구어체, 라틴어 약어, 은유는 피한다. 비원어민 독자, 번역가, 에이전트 모두 평범한 구문을 가장 잘 파싱한다.

## 음성과 저장소 세부 사항

- 이 스킬이 건드리는 모든 문서에 **unslop** 스킬을 적용한다. 그 스킬이 슬롭 패턴 목록을 소유한다. AI 어휘, 군더더기, 얼버무림, 형식상의 흔적이 여기에 든다.
- PR 설명과 커밋 메시지도 글쓰기다. Diátaxis를 제외한 모든 층이 여기에도 적용된다. PR 본문은 리뷰어가 1분 안에 읽을 수 있는 브리핑이다. 스웜 로그, SHA 목록, 지표 표를 붙여 넣지 않는다. 링크한다.
- 제품 UI 문자열은 문서가 아니다. 그것은 제품의 카피 가이드라인을 따른다.
- 코드 스니펫은 탭으로 들여쓴다. 실제 경로와 실제 심볼을 쓴다. 그것을 커밋하는 시점에 개수나 트리에 대한 모든 주장이 참이 되게 하고, 그것을 다시 생성하는 명령을 포함한다.

## 작업 예시

이전:

> Configuration of the proto import ratchet budget script parameters is performed via budget.json. Note that it's important to remember that running with --write, which updates the committed budget to reflect the current count, should only be done when lowering it. If exceeded, CI fails.

이후:

> `budget.mjs` reads the committed budget from `budget.json` and counts the files that import protos. If the count exceeds the budget, CI fails. Run `budget.mjs --write` only to lower the budget.
