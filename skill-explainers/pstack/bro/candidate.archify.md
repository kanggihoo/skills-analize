# bro 스킬은 에이전트를 어떻게 바꾸나 {#bro-skill}

`/bro`를 입력하면 에이전트는 자기 직전 메시지를 다시 말한다. 이때 전문어를 빼고, 더 짧고 쉽게, 사람이 사람에게 말하듯 쓴다.[](source:body)

- 본문은 지시 세 문장이 전부다. 절차, 형식, 길이 기준은 없다.[](source:body)
- 다시 말하는 대상은 사용자의 메시지가 아니라 에이전트 자신이 바로 앞에 쓴 메시지다.[](source:body)
- 다른 스킬이 이 스킬을 부르는 곳은 없다. 사용자가 직접 입력할 때만 쓰인다.

@answer scope="pstack/bro · 원본 텍스트 파일 1개 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/bro/SKILL.md · 267B · 본문(frontmatter)" path=pstack/bro/SKILL.md lines=1:5
@source body title="pstack/bro/SKILL.md · 지시 본문" path=pstack/bro/SKILL.md lines=7:7
@source help-bro title="pstack/poteto-help/SKILL.md · 상황별 스킬 표" path=pstack/poteto-help/SKILL.md lines=75:75
@source recipe-bro title="pstack/poteto-help/references/recipes.md · 사용 예" path=pstack/poteto-help/references/recipes.md lines=47:47

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 그래서 이 스킬은 사용자가 `/bro`를 입력할 때 켜진다. `poteto-help`는 "직전 답을 쉬운 말로 다시 듣고 싶을 때" 쓰라고 안내한다.[](source:help-bro)[](source:recipe-bro)

관계 원장에는 `bro`를 부르거나 `bro`가 부르는 관계가 없다. `pstack` 안에서 이 이름은 `poteto-help`의 안내 표와 사용 예에만 나온다.

## 무엇을 강제하나 {#rules}

| 지시 | 에이전트가 하는 일 |
| --- | --- |
| "Restate your last message." | 직전 메시지의 내용을 다시 전한다[](source:body) |
| "Stop using jargon and speak coherently." | 전문어를 빼고, 앞뒤가 이어지게 말한다[](source:body) |
| "State it more simply and concisely, like one human talking to another." | 더 쉽고 짧게, 사람끼리 대화하듯 쓴다[](source:body) |

새 정보를 더해도 되는지, 코드나 경로 이름을 남기는지, 얼마나 줄이는지는 원문에 명시 없음. 판정: 이 스킬은 말투만 바꾸고 내용은 그대로 두라는 뜻으로 읽힌다. "Restate"가 그 근거다.[](source:body)

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/bro/SKILL.md`(원본, 유일한 텍스트 파일).
- 관계 확인용으로 읽은 줄: `poteto-help/SKILL.md` 75줄, `poteto-help/references/recipes.md` 47줄.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
직전 메시지가 없거나 이미 쉬운 말이면 어떻게 하는지는 원문에 명시 없음.
