# teach 스킬은 에이전트를 어떻게 바꾸나 {#teach-skill}

`teach`를 쓰면 에이전트는 설명을 직접 조사하지 않는다. `how`와 `why`를 실제로 실행해 조사를 맡기고, 그 결과를 상대가 알아들을 한 줄기 설명으로 엮는다. 목표는 상대의 이해이고, 코드는 바꾸지 않는다.[](source:core)

- 무엇을 남길지는 대화에서 읽어 낸다. 상대가 왜 묻는지, 이미 무엇을 아는지를 퀴즈로 캐묻지 않는다.[](source:step1)
- 첫 답은 한두 문장으로 끝낸다. 더 깊은 층은 상대가 물을 때 더한다.[](source:step3)
- 설명은 자유롭게 고쳐 써도 된다. 단, `why`의 확신도 표현은 그대로 둔다.[](source:core)
- 움직이는 부분이 셋 이상이면 그림 한 장에 다 넣지 않는다. 한 부분씩 더하는 그림 여러 장을 그린다.[](source:step5)

@answer scope="pstack/teach · 원본 텍스트 파일 1개 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/teach/SKILL.md · 5623B · 본문(frontmatter)" path=pstack/teach/SKILL.md lines=1:5
@source core title="pstack/teach/SKILL.md · 목표, how·why 관계" path=pstack/teach/SKILL.md lines=9:11
@source step1 title="pstack/teach/SKILL.md · 1단계 남길 것 정하기" path=pstack/teach/SKILL.md lines=13:13
@source step2 title="pstack/teach/SKILL.md · 2단계 how·why 위임" path=pstack/teach/SKILL.md lines=14:14
@source step3 title="pstack/teach/SKILL.md · 3단계 정의부터 쌓기" path=pstack/teach/SKILL.md lines=15:15
@source step4 title="pstack/teach/SKILL.md · 4단계 대화로 이어 가기" path=pstack/teach/SKILL.md lines=16:16
@source step5 title="pstack/teach/SKILL.md · 5단계 그림을 쌓아 보여 주기" path=pstack/teach/SKILL.md lines=17:17
@source style title="pstack/teach/SKILL.md · 문체 규칙" path=pstack/teach/SKILL.md lines=19:19
@source reply title="pstack/teach/SKILL.md · 답의 모양" path=pstack/teach/SKILL.md lines=21:21
@source help-row title="pstack/poteto-help/SKILL.md · 12884B · teach 안내 줄" path=pstack/poteto-help/SKILL.md lines=63:63
@source help-pair title="pstack/poteto-help/SKILL.md · how·why·teach 구분" path=pstack/poteto-help/SKILL.md lines=92:92
@source recipe title="pstack/poteto-help/references/recipes.md · 3287B · teach 사용 예" path=pstack/poteto-help/references/recipes.md lines=11:11
@source why-skip title="pstack/why/SKILL.md · 10360B · 건너뛰기 조건" path=pstack/why/SKILL.md lines=114:121

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/teach`를 입력하거나 다른 스킬이 부를 때 켜진다. pstack 안에서 `teach`를 실행 단계로 부르는 스킬은 찾지 못했다. `poteto-help`가 "변경이나 하위 시스템을 쉽게 이해하고 싶을 때" 쓰라고 안내할 뿐이다.[](source:help-row)

| 비교 | 하는 일 |
| --- | --- |
| `how` | 코드가 무엇을 어떻게 하는지 설명한다 |
| `why` | 코드가 왜 그렇게 생겼는지 근거를 찾는다 |
| `teach` | 둘 중 하나나 둘 다 실행하고 결과를 쉽게 풀어 준다[](source:help-pair) |

`poteto-help`의 사용 예는 "왜 이렇게 구현했고 다른 방식은 왜 아닌가, 무엇을 맞바꿨나"를 묻는 형태다.[](source:recipe)

## 어떻게 진행하나 {#flow}

@workflow id=teach-flow title="teach 진행 흐름"
| pick | 남길 것 | backend |
| orient | 코드 훑기 | backend |
| how | how | backend |
| why | why | backend |
| blend | 엮기 | backend |
| answer | 짧은 답 | frontend |
| pick > orient | | |
| orient > how | | emphasis |
| orient > why | | emphasis |
| how > blend | | |
| why > blend | | |
| blend > answer | | |

@steps id=teach-steps
| s-pick | 남길 것 | 상대가 꼭 가져갈 몇 가지를 고른다. 바꾸려는지, 리뷰하는지, 디버깅하는지, 처음 보는지를 대화에서 읽는다. 이미 아는 것은 건너뛰고 질문이 있는 곳에 깊이를 둔다. | teach-flow | pick |
| s-orient | 코드 훑기 | 방향을 잡을 만큼만 코드를 직접 읽는다. 무엇이고 무엇에 닿는지 파악한다. 조사 자체는 다시 하지 않는다. | teach-flow | orient |
| s-how | how | 동작 설명을 맡긴다. 하위 시스템이면 `how`와 `why`를 둘 다, 작은 변경이면 하나만 써도 된다. | teach-flow | how |
| s-why | why | 이유를 맡긴다. 전체 조사는 느려서 기본은 좁게 묻는다. 좁히는 범위(질문 범위, `git`과 출처 한두 개)는 요청 안에 적는다. 이유 자체가 요점일 때만 넓힌다. | teach-flow | why |
| s-blend | 엮기 | 두 결과를 한 설명으로 합친다. 상대에게 중요한 것부터 둔다. 표현은 가르치기 좋게 고쳐도 되지만 `why`의 확신도 표현은 남긴다. | teach-flow | blend |
| s-answer | 짧은 답 | 일반적인 정의로 시작해 지금 사례에 잇는다. 한두 문장으로 멈추고, 상대가 더 물으면 동작, 더 깊은 이유, 예외 사례 순으로 층을 더한다. | teach-flow | answer |

`how`와 `why`는 병렬로 실행하고 결과를 합친다.[](source:step2) 이후는 대화다. 더 들어갈지 넘어갈지 묻고 상대를 따라간다.[](source:step4)

## 설명할 때 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 정의 → 이 사례 → 동작 → 이유 → 예외 순으로 쌓는다. 각 부분은 푸는 문제와 실제 동작을 설명한다[](source:step3) | 의무 |
| 함수와 상수 나열은 참고 자료일 뿐 가르치기가 아니다[](source:step3) | 금지 |
| 첫 답은 한두 문장. 빽빽한 문단으로 시작하지 않는다. 글 벽은 절대 안 된다[](source:step3) | 의무 |
| 퀴즈, 따라 말하기 요구, "잠깐 멈춤" 같은 연출을 하지 않는다[](source:step4) | 금지 |
| 멈추고 싶은 곳에서는 실제로 멈추고 상대 반응을 기다린다[](source:step4) | 의무 |
| 사람이 없는 한 번짜리 실행이면 깔끔하게 전하고, 더 깊이 가자는 제안은 끝에 둔다[](source:step4) | 의무 |
| `why`의 확신도 표현은 고치지 않는다. 그 유보 표현은 문체가 아니라 조사 결과다[](source:core) | 금지(유일한 예외) |
| 모든 응답은 `unslop`을 거친다[](source:style) | 의무 |
| 답은 설명 자체다. 무엇을 했는지 보고하지 않는다[](source:reply) | 금지 |
| 요점을 먼저 두고, 끝에 `how`나 `why`로 더 파 볼 만한 갈래를 남긴다[](source:reply) | 의무 |

원문은 찍지 말아야 할 문구를 직접 든다.[](source:step3)[](source:step4)

| 종류 | 원문 예 | 대신 |
| --- | --- | --- |
| 틀 잡는 이름표 | `the key insight`, `at its core`, `TL;DR`, `the one idea to hold onto` | 그냥 내용을 말한다 |
| 중요도·난도 예고 | `this is the tricky part`, `here is where it gets interesting` | 예고 없이 바로 설명한다 |
| 속도 연출 | `Pause`, `the sentence to nail`, 따라 말하게 하기 | 실제로 멈추고 기다린다 |
| 깔끔한 마무리 | `the rest follows`, `it all falls out` | 쓰지 않는다 |

@facts
| 첫 답 길이 | 한두 문장 |
| 그림을 나누는 기준 | 움직이는 부분 3개 이상 |
| A → B → C 흐름 | 그림 세 장(A→B, C 추가, 되돌아가는 간선 추가) |
| 문장 하나의 쉼표 | 한두 개. 많아지면 문장을 나눈다 |

문체 규칙도 구체적이다.[](source:style)

- 비유나 예고 대신 실제 동작을 말한다. 짧되 뚝뚝 끊기지 않게 쓴다.
- 일반 문장 대소문자를 쓰고 엠 대시(—)를 쓰지 않는다. 쉼표보다 마침표를 고른다.
- 개념 하나에는 이름 하나만 쓴다.
- "A 없이 B, B 없이 A" 같은 거울 문장을 피한다.
- 단계 설명의 낱말은 에이전트에게 주는 지시다. 제목이나 상투어로 찍지 않는다.

## 그림은 어떻게 쓰나 {#figures}

그림이 말보다 빠를 때만 그린다. 단순한 요점 하나에는 그림이 필요 없다. diff, 코드, 디버거를 직접 여는 편이 빠르면 그것을 연다.[](source:step5)

| 생각의 모양 | 매체 | 규칙 |
| --- | --- | --- |
| 이름표가 뜻을 싣는 흐름·구조 | mermaid 그림 | 한 장에 다 넣지 않고 한 부분씩 더해 다시 그린다 |
| 공간적인 것(배치, 겹침, 스크롤 위치, 전후 비교) | 이미지 생성 도구 | 화이트보드에 마커로 그린 듯이, 짧은 이름표 몇 개만. 이미지 모델은 긴 글자를 망가뜨린다 |

이미지가 맞으면 말로 묘사하지 말고 실제로 생성한다. 쌓아 그리기 규칙은 생성 이미지에도 똑같이 적용된다. 마지막에 몰아 둔 전체 그림 한 장은 가르치기가 아니라 참고 자료로 본다.[](source:step5)

## 흐름 속 위치 {#position}

@workflow id=teach-position title="teach 앞뒤의 스킬"
| p-user | 사용자 | external |
| p-teach | teach | backend |
| p-how | how | backend |
| p-why | why | backend |
| p-unslop | unslop | backend |
| p-user > p-teach | /teach | |
| p-teach > p-how | 질문 | emphasis |
| p-teach > p-why | 좁힌 질문 | emphasis |
| p-teach > p-unslop | 모든 응답 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| 사용자 질문(동작) | `how`에 질문 → 동작 설명 | `why`와 병렬. 작은 변경이면 하나만 | r42 |
| 사용자 질문(이유) | `why`에 좁힌 질문 → 근거 있는 이유 | 기본은 좁게. 확신도 표현 유지 | r43 |
| 엮은 설명 | `unslop`으로 다듬은 글 | 모든 응답 | r44 |

`teach`는 `how`와 `why`를 부르고 결과를 받아 돌아온다. 부르는 쪽 스킬은 원장에 없다.

전체 흐름은 `pstack/_group-understand/understand.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 하나. 이 스킬에는 다른 원본 파일이 없다.
- 호출 관계 확인용으로 `poteto-help/SKILL.md`, `poteto-help/references/recipes.md`, `why/SKILL.md` 일부를 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: `learning/teach`와 이름이 같지만 내용이 다르다(원장 기준, `shasum` 비교). 이 페이지는 `pstack/teach`만 다룬다.
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

문체 규칙의 "군더더기와 유보 표현을 줄여라"는 `why`의 확신도 유지와 부딪칠 수 있다.[](source:style) 원문은 확신도 유지를 "유일한 예외"로 못 박는다.[](source:core) 판정: 충돌하면 `why`의 확신도 표현이 이긴다.

@callout level=open-question title="좁힌 why 호출과 건너뛰기 규칙"
`teach`는 범위를 좁혀 부르면 `why`가 건너뛴 갈래를 계약대로 기록한다고 본다.[](source:step2) 그런데 `why`가 인정하는 건너뛰기 사유는 "서버 없음"과 "무관함 증명" 둘뿐이다.[](source:why-skip) 부른 쪽이 좁힌 경우를 어떻게 적을지는 원문에 명시 없음.

@callout level=open-question title="확인하지 못한 것"
설명 언어는 "쉬운 구어체 영어"로 적혀 있다.[](source:style) 상대가 다른 언어로 물을 때의 언어는 원문에 명시 없음. 이미지 생성 도구가 무엇인지, 없을 때 어떻게 할지도 원문에 명시 없음.
