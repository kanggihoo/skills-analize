---
name: unslop
description: 모든 글에서 AI 특유의 표지를 걷어 낸다. 항상 적용해야 한다.
disable-model-invocation: true
---

# Unslop

텍스트를 편집해 AI 패턴을 제거한다.

## 절차

1. 아래 패턴을 훑는다.
2. 다시 쓴다. 의미를 보존하고, 의도한 어조에 맞춘다.

## 감지하고 고칠 패턴

규칙 번호는 다른 스킬이 인용하는 고정 식별자다. 규칙을 삭제하면 번호에 빈칸이 생긴다.

### 내용

3. **피상적인 -ing 구문.** "highlighting...", "ensuring...", "reflecting...", "showcasing...", "fostering...". 삭제하거나 실제 출처로 풀어 쓴다.
5. **모호한 출처 표기.** "Experts believe", "Industry reports suggest", "Some critics argue". 출처를 밝히거나 삭제한다.

### 언어

7. **AI 어휘.** Additionally, crucial, delve, enduring, enhance, fostering, garner, interplay, intricate, landscape(추상적 의미), pivotal, showcase, tapestry(추상적 의미), testament, underscore, vibrant. 평범한 단어로 바꾼다.
8. **"is"를 꾸민 표현.** "serves as", "stands as", "boasts", "features". 그냥 "is" 또는 "has"라고 쓴다.
9. **"Not just X, but Y."** 대신 요점을 직접 말한다.
10. **세 가지 규칙.** 생각을 억지로 세 개씩 묶는 것. 자연스러운 개수를 쓴다.
11. **동의어 돌려쓰기.** 한 문단에 protagonist, main character, central figure, hero를 모두 쓰는 것. 하나를 골라 반복한다.
12. **가짜 범위.** 의미 있는 척도가 아닌 X와 Y를 "from X to Y"로 묶는 것. 주제를 직접 나열한다.

### 문체

13. **엠 대시 과다 사용.** 엠 대시를 완전히 피한다. 마침표나 쉼표만 쓴다(괄호, en 대시, 대시 대용 하이픈 모두 안 된다). 생각을 나눠야 하면 문장을 끝내거나 쉼표를 쓴다.
14. **콜론 과다 사용.** 콜론은 목록이나 예시 앞에서는 괜찮다. 문장 중간에서 연결어로 쓰는 것은 안 된다. "If you're coming from traditional automation: instead of registering event handlers, you describe conditions"는 콜론 때문에 덧붙는 것이 없다. 비교 틀에 기대지 않고 요점이 스스로 서도록 고쳐 쓴다. "Describing when the scheduler should fire works best as plain English."는 같은 뜻이며 문장부호에 기대지 않는다.
15. **굵은 글씨 과다 사용.** 고유명사나 두문자어를 전부 굵게 쓰지 않는다.
16. **인라인 제목 목록.** 굵은 라벨과 콜론이 그 줄을 다시 말하는 것이 표지다. "**Performance:** Performance improved..." 같은 것은 산문으로 바꾼다. 마침표로 끝나고, 항목을 이름 붙이며, 실제로 새로운 세부 내용이 뒤따르는 굵은 도입구("**Schema in TypeScript.** Tables live in one file.")는 괜찮다. 표지가 아니다.
17. **제목 대소문자.** 문장형 대소문자를 쓴다.
18. **장식용 이모지.** 제목과 글머리 기호에서 제거한다.
19. **곡선 따옴표.** 직선 따옴표로 바꾼다.

### 커뮤니케이션 산출물

20. **챗봇 문구.** "I hope this helps!", "Let me know if...", "Of course!", "Certainly!", "Found the smoking gun!" 제거한다.
22. **아첨하는 어조.** "Great question! You're absolutely right!" 바로 답한다.

### 군더더기

23. **군더더기 구문.** "In order to"는 "To"가 된다. "Due to the fact that"은 "Because"가 된다. "It is important to note that"은 삭제한다.
24. **과도한 얼버무림.** "could potentially possibly be argued that it might"는 "may"가 된다.
25. **일반적인 결론.** "The future looks bright." 구체적인 계획이나 사실을 말한다.

### 전문 용어

26. **추상적 은유 명사.** Substrate, wedge, vector, locus, vantage, nexus, primitive(명사), harness(은유), surface("API surface"처럼), bedrock, scaffolding(은유), modality, paradigm, gold-plating, ratchet(은유), evacuate(코드를 옮길 때), endgame, north star, flywheel. 기술적으로 들리지만 보통 더 평범하고 구체적인 단어가 있다. "Substrate"는 "base"가 된다. "Wedge in"은 "add"가 된다. "Vector"는 "way" 또는 "method"가 된다. "Gold-plating"은 "more than the job needs"가 된다. "Ratchet"은 그 메커니즘의 실제 이름이나 "a limit that only tightens"가 된다. "Evacuate"는 "move out"이 된다. "Endgame"은 "the last phase"가 된다. 구체적인 단어를 고른다.

### 평이한 말

27. **기분이 아니라 기능을 말한다.** "the database stays close at hand", "SQL you can read", "types that follow your schema"는 느낌을 말한다. 고친 문장은 메커니즘이나 숫자를 말한다. "`.toSQL()` returns the exact string sent to the database", "a column rename fails the build". 이 문장이 독자에게 무엇을 하라고 하는지, 무엇을 알게 하는지 물은 뒤 그것을 쓴다. 구체적인 지시, 사실, 숫자로 다시 말할 수 없다면 삭제한다. 한 가지 더 확인한다. 같은 문장이 다른 프로젝트의 문서에 그대로 들어가도 어색하지 않다면 이 프로젝트에 대해 아무 말도 하지 않는 것이다. 삭제한다.
28. **밀도 높은 문장은 줄이거나 나눈다.** 독자가 문장을 해석하려고 되돌아가야 한다면 둘로 나누거나 절을 뺀다. 문장 하나에 생각 하나.
29. **능동태.** 능동태를 선호한다. "is/are/was/were + 과거분사"를 찾아 행위자를 이름 붙인다. "queries are validated"는 "the compiler validates queries"가 되고, "the file is parsed by the loader"는 "the loader parses the file"이 된다. 행위자를 모르거나 정말 중요하지 않을 때만 수동태가 괜찮다.
30. **부사를 줄이거나 더 강한 동사를 쓴다.** "runs quickly"는 "is fast"나 숫자가 된다. "significantly improves"는 측정된 차이가 된다. 약한 동사를 떠받치는 부사는 동사가 틀렸다는 뜻이다.
31. **평범한 단어를 쓴다.** "utilize"는 "use", "leverage"는 "use", "facilitate"는 "help", "numerous"는 "many", "in the event that"은 "if"가 된다. 화려한 동의어가 더 명확한 경우는 드물다.
32. **꾸민 산문.** 문자 그대로의 표현이 있는데 은유나 수사를 쓰는 것. 경구("wire it or delete it"), 효과를 노린 수사적 단편, 의인화된 코드("the plan holds it"), 비유적 동사("rides along", "stands on"), 상투적인 틀 문구. "A dial worth turning"은 "a parameter worth varying"이 된다. 뜻하는 바를 말한다. 금속 은유 명사는 규칙 26이 다룬다.
33. **과도한 압축.** 관사를 빼고, 동사 없는 단편을 쓰고, 기호로 말하고, 독자가 읽는 대신 해독하게 만드는 약어. "Parser rejects bad date → exit 2, no write"는 "The parser rejects a bad date, exits with code 2, and writes nothing."이 된다. 관사와 동사가 있는 온전한 문장을 쓰고, 화살표와 약어를 풀어 쓴다.
