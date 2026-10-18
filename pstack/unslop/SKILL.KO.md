---
name: unslop
description: Cut AI tells from any writing. Must always apply.
disable-model-invocation: true
---

# Unslop

글에서 AI 패턴을 걷어 낸다.

## 절차

1. 아래 패턴을 훑는다.
2. 다시 쓴다. 의미를 보존하고, 의도한 어조를 맞춘다.

## 탐지하고 고칠 패턴

규칙 번호는 다른 스킬이 인용하는 고정된 ID다. 규칙을 삭제하면 번호에 빈칸이 생긴다.

### 내용

3. **피상적인 -ing 구문.** "highlighting...", "ensuring...", "reflecting...", "showcasing...", "fostering...". 삭제하거나 실제 출처로 풀어 쓴다.
5. **모호한 출처.** "Experts believe", "Industry reports suggest", "Some critics argue". 출처를 밝히거나 삭제한다.

### 언어

7. **AI 어휘.** 추가로(Additionally), 결정적인(crucial), 파고들다(delve), 오래 지속되는(enduring), 강화하다(enhance), 고양하다(fostering), 얻다(garner), 상호작용(interplay), 복잡한(intricate), 풍경(landscape, 추상적인 의미), 중추적인(pivotal), 드러내다(showcase), 태피스트리(tapestry, 추상적인 의미), 증거(testament), 강조하다(underscore), 활기찬(vibrant). 평범한 말로 바꾼다.
8. **"is"를 꾸미는 표현.** "serves as", "stands as", "boasts", "features". 그냥 "is" 또는 "has"라고 쓴다.
9. **"X만이 아니라 Y도."** 요점을 직접 말한다.
10. **셋의 법칙.** 생각을 억지로 셋씩 묶는다. 자연스러운 개수를 쓴다.
11. **동의어 돌려쓰기.** 한 문단에서 protagonist, main character, central figure, hero를 번갈아 쓴다. 하나를 고르고 반복한다.
12. **거짓 범위.** 의미 있는 척도 위에 있지 않은 X에서 Y까지. 주제를 직접 나열한다.

### 스타일

13. **엠 대시 남용.** 엠 대시는 전부 피한다. 마침표나 쉼표만 쓴다(괄호, en 대시, 대시 대용 하이픈도 쓰지 않는다). 생각을 나눌 필요가 있으면 문장을 끝내거나 쉼표를 쓴다.
14. **콜론 남용.** 콜론은 목록이나 예시 앞에서는 괜찮다. 문장 중간의 연결어로 쓰지 않는다. "If you're coming from traditional automation: instead of registering event handlers, you describe conditions"에서 콜론은 아무것도 더하지 않는다. 비교 틀 없이 요점이 스스로 서도록 고쳐 쓴다. "Describing when the scheduler should fire works best as plain English." 뜻은 같고, 구두점 목발이 없다.
15. **굵은 글씨 남용.** 모든 고유명사나 약어를 굵게 쓰지 않는다.
16. **인라인 제목 목록.** 특징은 굵은 라벨과 콜론이 그 줄을 다시 말하는 것이다. "**Performance:** Performance improved...". 이런 것은 산문으로 바꾼다. 마침표로 끝나 항목을 이름 짓고, 그 뒤에 실제로 새로운 세부 내용이 오는 굵은 도입부("**Schema in TypeScript.** Tables live in one file.")는 괜찮으며 특징이 아니다.
17. **제목에 대문자 표기.** 문장형 대소문자를 쓴다.
18. **장식용 이모지.** 제목과 글머리 기호에서 뺀다.
19. **곡선 따옴표.** 직선 따옴표로 바꾼다.

### 커뮤니케이션 산출물

20. **챗봇 문구.** "I hope this helps!", "Let me know if...", "Of course!", "Certainly!", "Found the smoking gun!" 제거한다.
22. **아첨하는 어조.** "Great question! You're absolutely right!" 바로 답한다.

### 군더더기

23. **군더더기 표현.** "In order to"는 "To"가 된다. "Due to the fact that"은 "Because"가 된다. "It is important to note that"은 삭제한다.
24. **과도한 얼버무림.** "could potentially possibly be argued that it might"는 "may"가 된다.
25. **일반적인 결론.** "The future looks bright." 구체적인 계획이나 사실을 말한다.

### 전문 용어

26. **추상적 은유 명사.** Substrate, wedge, vector, locus, vantage, nexus, primitive(명사), harness(은유), surface("API surface"처럼), bedrock, scaffolding(은유), modality, paradigm, gold-plating, ratchet(은유), evacuate(코드를 옮길 때), endgame, north star, flywheel. 이들은 기술적으로 들리지만 대개 더 평범하고 구체적인 단어가 있다. "Substrate"는 "base"가 된다. "Wedge in"은 "add"가 된다. "Vector"는 "way" 또는 "method"가 된다. "Gold-plating"은 "more than the job needs"가 된다. "Ratchet"은 그 메커니즘의 실제 이름이나 "a limit that only tightens"가 된다. "Evacuate"는 "move out"이 된다. "Endgame"은 "the last phase"가 된다. 구체적인 단어를 고른다.

### 평이한 말

27. **느낌이 아니라 동작을 말한다.** "the database stays close at hand", "SQL you can read", "types that follow your schema"는 느낌을 이름 붙인다. 고치려면 메커니즘이나 숫자를 말한다. "`.toSQL()` returns the exact string sent to the database", "a column rename fails the build". 이 문장이 독자에게 무엇을 하라고 하거나 무엇을 알게 하는지 묻고, 그것을 쓴다. 문장을 구체적인 지시, 사실, 숫자로 다시 말할 수 없다면 잘라낸다. 한 가지 확인 방법이 더 있다. 그 문장이 다른 프로젝트의 문서에 그대로 있어도 말이 되면, 이 프로젝트에 대해서는 아무것도 말하지 않는다. 잘라낸다.
28. **긴 문장은 줄이거나 나눈다.** 독자가 문장을 파싱하려고 되짚어 읽어야 한다면, 둘로 나누거나 절을 뺀다. 문장마다 생각 하나.
29. **능동태.** 능동태를 선호한다. "is/are/was/were + 과거분사"를 잡아내고 행위자를 밝힌다. "queries are validated"는 "the compiler validates queries"가 되고, "the file is parsed by the loader"는 "the loader parses the file"이 된다. 행위자를 모르거나 정말로 중요하지 않을 때만 수동태가 괜찮다.
30. **부사를 자르거나, 더 강한 동사를 쓴다.** "runs quickly"는 "is fast" 또는 그 수치가 된다. "significantly improves"는 측정된 차이가 된다. 약한 동사를 떠받치는 부사는 동사가 틀린 것이다.
31. **평범한 단어를 쓴다.** "utilize"는 "use"가 되고, "leverage"는 "use"가 되며, "facilitate"는 "help"가 되고, "numerous"는 "many"가 되며, "in the event that"은 "if"가 된다. 더 멋진 동의어가 더 명확한 경우는 드물다.
32. **꾸민 산문.** 문자 그대로의 표현이 있는데도 은유나 수사를 쓰는 것. 격언("wire it or delete it"), 효과를 위한 수사적 단편, 의인화된 코드("the plan holds it"), 비유적 동사("rides along", "stands on"), 상투적인 틀 문구가 여기에 든다. "A dial worth turning"은 "a parameter worth varying"이 된다. 뜻하는 바를 말한다. 26번 규칙은 은유 명사를 다룬다.
33. **과도한 압축.** 생략된 관사, 동사 없는 단편, 기호 표기, 독자가 읽는 대신 해독해야 하는 약어. "Parser rejects bad date → exit 2, no write"는 "The parser rejects a bad date, exits with code 2, and writes nothing."이 된다. 관사와 동사를 갖춘 완전한 문장으로 쓰고, 화살표와 약어는 풀어 쓴다.
