# unslop 스킬은 에이전트를 어떻게 바꾸나 {#unslop-skill}

`unslop`을 적용하면 에이전트는 쓴 글을 번호 붙은 패턴 목록과 대조한다. AI 티 나는 표현(AI tells)을 찾으면 뜻과 의도한 어조를 지키면서 고쳐 쓴다.[](source:proc)

- 절차는 두 단계뿐이다. 목록대로 훑고, 고쳐 쓴다.[](source:proc)
- 규칙은 28개이고 7개 범주로 나뉜다. 대상은 영어 산문이다.[](source:content)[](source:plain)
- 규칙 번호는 다른 스킬이 인용하는 고정 ID다. 지운 규칙의 번호는 빈칸으로 남긴다.[](source:ids)
- 스스로 켜지지 않는다. `pstack`의 다른 스킬 7개가 글을 쓸 때 이 스킬을 적용하라고 지시한다.

@answer scope="pstack/unslop · 원본 텍스트 파일 1개 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/unslop/SKILL.md · 6015B · 본문(frontmatter)" path=pstack/unslop/SKILL.md lines=1:5
@source proc title="pstack/unslop/SKILL.md · 목적과 절차" path=pstack/unslop/SKILL.md lines=9:14
@source ids title="pstack/unslop/SKILL.md · 규칙 번호 규칙" path=pstack/unslop/SKILL.md lines=18:18
@source content title="pstack/unslop/SKILL.md · Content" path=pstack/unslop/SKILL.md lines=20:23
@source lang title="pstack/unslop/SKILL.md · Language" path=pstack/unslop/SKILL.md lines=25:32
@source style title="pstack/unslop/SKILL.md · Style" path=pstack/unslop/SKILL.md lines=34:42
@source r13 title="pstack/unslop/SKILL.md · 규칙 13" path=pstack/unslop/SKILL.md lines=36:36
@source comm title="pstack/unslop/SKILL.md · Communication artifacts" path=pstack/unslop/SKILL.md lines=44:47
@source filler title="pstack/unslop/SKILL.md · Filler" path=pstack/unslop/SKILL.md lines=49:53
@source jargon title="pstack/unslop/SKILL.md · Jargon" path=pstack/unslop/SKILL.md lines=55:57
@source plain title="pstack/unslop/SKILL.md · Plain speech" path=pstack/unslop/SKILL.md lines=59:67
@source pm-unslop title="pstack/poteto-mode/SKILL.md · 산문 → unslop" path=pstack/poteto-mode/SKILL.md lines=26:26
@source pm-r14 title="pstack/poteto-mode/SKILL.md · unslop rule 14 인용" path=pstack/poteto-mode/SKILL.md lines=107:107
@source teach-unslop title="pstack/teach/SKILL.md · 모든 응답" path=pstack/teach/SKILL.md lines=19:19
@source recall-unslop title="pstack/recall/SKILL.md · 요약 작성" path=pstack/recall/SKILL.md lines=33:33
@source br-unslop title="pstack/blast-radius/SKILL.md · 보고서 작성" path=pstack/blast-radius/SKILL.md lines=48:48
@source tw-unslop title="pstack/technical-writing/SKILL.md · 모든 문서" path=pstack/technical-writing/SKILL.md lines=93:93
@source tw-26 title="pstack/technical-writing/SKILL.md · 규칙 26 추가 제안" path=pstack/technical-writing/SKILL.md lines=19:19
@source tw-86 title="pstack/technical-writing/SKILL.md · 괄호 규칙" path=pstack/technical-writing/SKILL.md lines=86:86
@source smyw-unslop title="pstack/show-me-your-work/SKILL.md · 기록 문장" path=pstack/show-me-your-work/SKILL.md lines=36:36
@source am-unslop title="pstack/automate-me/SKILL.md · 초안 다듬기" path=pstack/automate-me/SKILL.md lines=77:77
@source pb-inv title="pstack/poteto-mode/playbooks/investigation.md · 답변" path=pstack/poteto-mode/playbooks/investigation.md lines=10:10
@source pb-mpp title="pstack/poteto-mode/playbooks/multi-phase-plan.md · 계획 문서" path=pstack/poteto-mode/playbooks/multi-phase-plan.md lines=9:9
@source pb-pr title="pstack/poteto-mode/playbooks/opening-a-pr.md · PR 글" path=pstack/poteto-mode/playbooks/opening-a-pr.md lines=9:9
@source help-unslop title="pstack/poteto-help/SKILL.md · 상황별 스킬 표" path=pstack/poteto-help/SKILL.md lines=73:73

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`description`은 "Must always apply."라고 적는다. 하지만 `disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm)

사용자가 `/unslop`을 입력하거나, 다른 스킬이 글을 쓰는 단계에서 적용하라고 할 때 켜진다. 판정: "항상 적용"은 다른 스킬의 지시로 이루어진다. 아래 표가 그 지시들이다.

| 적용을 지시하는 스킬 | 대상 글 | rel-id |
| --- | --- | --- |
| `poteto-mode` | 모든 산문. 에이전트의 답변도 산문으로 본다[](source:pm-unslop) | r06 |
| `teach` | 모든 응답[](source:teach-unslop) | r44 |
| `recall` | 작업 맥락 요약[](source:recall-unslop) | r47 |
| `blast-radius` | 영향 범위 보고서[](source:br-unslop) | r51 |
| `technical-writing` | 이 스킬이 다루는 모든 문서[](source:tw-unslop) | r90 |
| `show-me-your-work` | 결정 기록의 문장[](source:smyw-unslop) | r91 |
| `automate-me` | 모드 스킬 초안의 모든 줄[](source:am-unslop) | r92 |

`poteto-mode`의 플레이북 세 개도 글을 쓴 뒤 적용하라고 한다. `investigation`은 답변에, `multi-phase-plan`은 계획 문서에, `opening-a-pr`는 PR 제목·설명과 커밋 본문에 적용한다.[](source:pb-inv)[](source:pb-mpp)[](source:pb-pr) 사용자 안내 표에서는 "글에서 AI 티를 걷어낼 때" 쓰는 스킬로 소개한다.[](source:help-unslop)

## 규칙 번호는 왜 비어 있나 {#rule-ids}

다른 스킬이 규칙을 번호로 인용하기 때문이다. 원문은 번호를 고정 ID로 두고, 지운 규칙은 빈 번호로 남긴다고 적는다.[](source:ids) 실제로 `poteto-mode`는 콜론 규칙을 "unslop rule 14"라고 번호로 가리킨다.[](source:pm-r14)

@facts
| 규칙 수 | 28개(3~33번) |
| 빈 번호 | 1, 2, 4, 6, 21 |
| 범주 | 7개. Content 2, Language 6, Style 7, Communication artifacts 2, Filler 3, Jargon 1, Plain speech 7 |
| 절차 | 훑기 → 고쳐 쓰기 |

`technical-writing`은 새로 찾은 추상 은유 명사를 규칙 26에 추가하자고 답변에서 변경안(diff)으로 제안하게 한다. 이때 `unslop` 파일은 직접 고치지 않는다.[](source:tw-26)

## 내용과 어휘에서 무엇을 고치나 {#content-language}

| 번호 | 패턴 | 에이전트가 하는 일 | 원문 예 |
| --- | --- | --- | --- |
| 3 | 겉핥기 -ing 구 | 지우거나 실제 출처로 내용을 채운다[](source:content) | "highlighting...", "ensuring...", "showcasing..." |
| 5 | 흐릿한 출처 | 출처 이름을 대거나 지운다[](source:content) | "Experts believe", "Industry reports suggest" |
| 7 | AI 어휘 16개 | 평범한 말로 바꾼다[](source:lang) | "delve", "crucial", "pivotal", "tapestry", "testament", "underscore" |
| 8 | "is"를 꾸며 말하기 | "is"나 "has"로 쓴다[](source:lang) | "serves as", "stands as", "boasts", "features" |
| 9 | 대조 틀 | 요점을 바로 말한다[](source:lang) | "Not just X, but Y." |
| 10 | 셋으로 맞추기 | 생각의 실제 개수대로 쓴다[](source:lang) | 억지로 세 개씩 묶기 |
| 11 | 동의어 돌려쓰기 | 이름 하나를 골라 반복한다[](source:lang) | "Protagonist, main character, central figure, hero" |
| 12 | 가짜 범위 | 의미 있는 척도가 없으면 주제를 바로 나열한다[](source:lang) | "from X to Y" |
| 26 | 추상 은유 명사 19개 | 구체적인 단어를 고른다[](source:jargon) | "Substrate" → "base", "Wedge in" → "add", "Gold-plating" → "more than the job needs", "Evacuate" → "move out" |

## 모양과 말투에서 무엇을 고치나 {#style-comm}

| 번호 | 패턴 | 에이전트가 하는 일 | 원문 예 |
| --- | --- | --- | --- |
| 13 | 엠 대시(em dash) | 아예 쓰지 않는다. 마침표나 쉼표만 쓴다. 괄호, 엔 대시, 하이픈 대용도 쓰지 않는다[](source:r13) | 생각을 끊어야 하면 문장을 끝낸다 |
| 14 | 콜론 남용 | 목록이나 예시 앞에서만 쓴다. 문장 중간 연결에는 쓰지 않는다[](source:style) | "If you're coming from traditional automation: ..." → "Describing when the scheduler should fire works best as plain English." |
| 15 | 굵은 글씨 남용 | 고유명사나 약어마다 굵게 하지 않는다[](source:style) | - |
| 16 | 인라인 머리말 목록 | 줄을 되풀이하는 굵은 라벨과 콜론은 산문으로 바꾼다[](source:style) | `**Performance:** Performance improved...` |
| 17 | 제목의 Title Case | 문장형 대소문자(sentence case)로 쓴다[](source:style) | - |
| 18 | 장식 이모지 | 제목과 글머리표에서 지운다[](source:style) | - |
| 19 | 둥근 따옴표 | 곧은 따옴표로 바꾼다[](source:style) | - |
| 20 | 챗봇 말투 | 지운다[](source:comm) | "I hope this helps!", "Let me know if...", "Certainly!", "Found the smoking gun!" |
| 22 | 아첨하는 어조 | 바로 답한다[](source:comm) | "Great question! You're absolutely right!" |
| 23 | 군더더기 구 | 줄이거나 지운다[](source:filler) | "In order to" → "To", "Due to the fact that" → "Because", "It is important to note that" → 삭제 |
| 24 | 지나친 얼버무림 | 한 단어로 줄인다[](source:filler) | "could potentially possibly be argued that it might" → "may" |
| 25 | 뻔한 결론 | 구체적인 계획이나 사실을 쓴다[](source:filler) | "The future looks bright." |

## 평이한 말 규칙은 무엇을 요구하나 {#plain-speech}

이 범주는 느낌 대신 동작과 수치를 쓰게 한다. 규칙 27에는 두 가지 시험이 붙어 있다. 문장을 구체적인 지시·사실·수치로 바꿔 말할 수 없으면 지운다. 다른 프로젝트 문서에 그대로 들어가도 되는 문장도 지운다.[](source:plain)

| 번호 | 패턴 | 에이전트가 하는 일 | 원문 예 |
| --- | --- | --- | --- |
| 27 | 느낌을 말하는 문장 | 메커니즘이나 수치를 쓴다[](source:plain) | "SQL you can read" → "`.toSQL()` returns the exact string sent to the database" |
| 28 | 빽빽한 문장 | 둘로 나누거나 절을 뺀다. 한 문장에 생각 하나[](source:plain) | 독자가 되돌아 읽어야 하는 문장 |
| 29 | 수동태 | 행위자를 밝힌다[](source:plain) | "queries are validated" → "the compiler validates queries" |
| 30 | 부사로 받친 동사 | 부사를 지우고 더 강한 동사나 수치를 쓴다[](source:plain) | "runs quickly" → "is fast", "significantly improves" → 잰 차이 |
| 31 | 화려한 동의어 | 쉬운 단어를 쓴다[](source:plain) | "utilize" → "use", "facilitate" → "help", "in the event that" → "if" |
| 32 | 꾸민 문장 | 문자 그대로의 표현을 쓴다[](source:plain) | "A dial worth turning" → "a parameter worth varying" |
| 33 | 지나친 압축 | 관사와 동사를 갖춘 문장으로 쓰고 화살표와 약어를 풀어 쓴다[](source:plain) | "Parser rejects bad date → exit 2, no write" → "The parser rejects a bad date, exits with code 2, and writes nothing." |

원문이 허용하는 예외는 세 가지다.

- 목록이나 예시 앞의 콜론은 괜찮다(규칙 14).[](source:style)
- 마침표로 끝나고 새 정보가 뒤따르는 굵은 머리말은 괜찮다(규칙 16). 원문 예는 `**Schema in TypeScript.** Tables live in one file.`이다.[](source:style)
- 행위자를 모르거나 정말 상관없으면 수동태를 써도 된다(규칙 29).[](source:plain)

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `pstack/unslop/SKILL.md`(원본, 유일한 텍스트 파일).
- 관계 확인용으로 읽은 줄: 위 출처 목록의 다른 스킬 줄. 각 줄만 확인했다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: `reporting-skills/pstack/unslop/SKILL.md`와 원문 동일(`shasum` 일치).
- 실제로 실행해 보지 않았다. 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
규칙 13은 "no parentheses"라고 적지만, 같은 줄이 괄호를 쓴다. 판정: 엠 대시 대신 괄호로 바꾸지 말라는 뜻으로 읽힌다. 괄호 전체를 금지하는지는 원문에 명시 없음. `technical-writing`은 괄호 안을 완전한 문장 단위로 쓰라고 한다.[](source:r13)[](source:tw-86)
규칙 사이에 우선순위가 있는지, 고친 글을 다시 훑는지는 원문에 명시 없음.
