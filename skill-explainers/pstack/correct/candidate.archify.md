# correct 스킬은 에이전트를 어떻게 바꾸나 {#correct-skill}

`correct`를 쓰면 에이전트는 반복되는 실수를 말로 고치지 않는다. 같은 실수가 다시는 생길 수 없도록 저장소 자체를 바꾼다.[](source:skill-goal)

- 대상은 두 번 이상 일어난 실수 묶음이다. 최근 커밋, 되돌린 커밋, 리뷰 댓글에서 찾는다.[](source:skill-find)
- 고치는 수단에 순서가 있다. 구조, 타입, 린트·CI, 테스트, 문서 순으로 위부터 시도한다.[](source:skill-levels)
- 새 검사마다 실제 과거 실수에서 실패하는지 증명한다. 고친 묶음마다 커밋을 하나씩 만든다.[](source:skill-prove)
- 지시 파일에 규칙과 그 규칙을 강제하는 장치를 짝지은 표를 남긴다.[](source:skill-table)

@answer scope="pstack/correct · 원본 텍스트 파일 1개 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/correct/SKILL.md · 2445B · frontmatter" path=pstack/correct/SKILL.md lines=1:5
@source skill-goal title="pstack/correct/SKILL.md · 목적과 전제" path=pstack/correct/SKILL.md lines=9:11
@source skill-find title="pstack/correct/SKILL.md · 실수 묶음 찾기" path=pstack/correct/SKILL.md lines=13:15
@source skill-levels title="pstack/correct/SKILL.md · 높은 수준부터 고치기" path=pstack/correct/SKILL.md lines=17:22
@source skill-prove title="pstack/correct/SKILL.md · 수정·증명하기" path=pstack/correct/SKILL.md lines=24:26
@source skill-table title="pstack/correct/SKILL.md · 규칙표와 답변 형식" path=pstack/correct/SKILL.md lines=28:32
@source help-row title="pstack/poteto-help/SKILL.md · correct 안내 줄" path=pstack/poteto-help/SKILL.md lines=84:84

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/correct`를 입력하거나 다른 스킬이 부를 때 켜진다. pstack 안에서 이 스킬을 부르는 스킬은 없다. `poteto-help`의 안내표가 "같은 실수를 반복하지 않게 하기" 상황에 이 스킬을 추천할 뿐이다.[](source:help-row)

`description`에는 "운영자(operator)가 바로잡을 때마다 반복하라"는 문장이 있다.[](source:skill-fm) 본문도 운영자가 바로잡으면 실수를 고치고 규칙을 추가하라고 한다.[](source:skill-table) 판정: 모델이 스스로 켜지 않으므로, 이 반복은 스킬이 켜져 있는 동안이거나 사용자가 다시 `/correct`를 부를 때만 일어난다.[](source:skill-fm)

이 스킬은 에이전트가 이렇게 일한다고 가정한다. 연 파일만 보고, 가장 가까운 예시를 베끼고, 컴파일되는 가장 짧은 길을 고른다.[](source:skill-goal) 그래서 "한 파일에서 맞아 보이는 변경이 저장소 전체에서도 맞도록" 저장소를 설계하는 것이 목표다.

## 어떤 순서로 진행하나 {#flow}

@workflow id=correct-flow title="correct 진행 흐름"
| find | 실수 분류 | backend |
| level | 수준 선택 | backend |
| fix | 수정·증명 | backend |
| table | 규칙표 | backend |
| find > level | | |
| level > fix | | |
| fix > table | | emphasis |

@steps id=correct-steps
| s-find | 실수 분류 | 최근 커밋, 되돌린 커밋(revert), 리뷰 댓글, 에이전트 지시 파일, 우회 방법을 설명하는 주석을 읽는다. 실수를 묶음으로 나눈다. 같은 실수가 두 번 일어나야 묶음으로 센다. | correct-flow | find |
| s-level | 수준 선택 | 묶음마다 통하는 가장 높은 수준을 고른다. 순서는 아래 표에 있다. | correct-flow | level |
| s-fix | 수정·증명 | 가장 자주 일어난 묶음부터 지금 고친다. 묶음 하나에 커밋 하나다. 새 검사가 실제 과거 실수에서 실패하는지 증명한다. 로컬과 CI에서 같은 명령을 돌린다. | correct-flow | fix |
| s-table | 규칙표 | 에이전트 지시 파일에 규칙과 그 규칙을 강제하는 장치를 짝지은 표를 둔다. 실수가 더는 일어날 수 없게 된 규칙은 표에서 뺀다. | correct-flow | table |

끝나면 답변에 묶음마다 근거, 고른 수준, 더 높은 수준이 통하지 않은 이유를 적는다.[](source:skill-table) 진행 순서는 원문의 "First", "Then", "Last"를 따랐다.[](source:skill-find)[](source:skill-prove)[](source:skill-table)

## 어느 수준에서 고치나 {#levels}

| 순서 | 수준 | 원문이 시키는 일 |
| --- | --- | --- |
| 1 | 구조로 없앤다 {good:가장 먼저} | 상태마다 주인을 하나 두고, 작업마다 지원하는 방법을 하나만 둔다. 내부를 숨겨 잘못된 `import`가 실패하게 한다. 손으로 맞추던 목록은 단일 원본으로 바꾼다. 에이전트가 베낄 만한 옛 방식과 죽은 코드를 지운다.[](source:skill-levels) |
| 2 | 타입으로 막는다 | 나쁜 상태를 아예 쓸 수 없게 한다. 그래도 나쁜 코드가 컴파일되면 린트나 CI 검사를 더한다. 그 오류 메시지는 대신 쓸 파일, 타입, 함수를 가리켜야 한다.[](source:skill-levels) |
| 3 | 행동을 테스트한다 | 호출하는 함수가 모두 아무것도 돌려주지 않아도 통과할 테스트는 고치거나 지운다.[](source:skill-levels) |
| 4 | 문서·규칙을 쓴다 {caution:마지막} | 판단이 필요한 경우에만 쓴다. 에이전트가 건너뛰어도 아무것도 실패하지 않기 때문이다.[](source:skill-levels) |

이미 흔한 패턴이면 린트는 변경이 그 패턴을 **더 늘릴 때만** 실패하게 한다.[](source:skill-levels) 판정: 기존 코드를 한꺼번에 고치지 않고도 증가만 막는 방식이다.

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 실수 묶음은 두 번 일어난 뒤에 센다[](source:skill-find) | 의무(기준) |
| 묶음마다 통하는 가장 높은 수준에서 고친다[](source:skill-levels) | 의무 |
| 묶음 하나에 커밋 하나[](source:skill-prove) | 의무 |
| 새 검사는 실제 과거 실수에서 실패함을 증명한다[](source:skill-prove) | 의무 |
| 로컬과 CI에서 같은 명령을 돌린다[](source:skill-prove) | 의무 |
| 예외는 문제가 되는 줄에 둔다. 사유, 만료일, 사람의 승인을 함께 단다[](source:skill-prove) | 의무(사람 승인 지점) |
| 규칙이 이미 있는데 강제 장치가 없으면 반복으로 본다. 같은 변경 안에서 가장 높은 수준으로 고친다[](source:skill-table) | 의무 |
| 실수가 더는 일어날 수 없으면 규칙을 표에서 뺀다[](source:skill-table) | 의무 |

@callout level=warning title="저장소를 직접 바꾸는 스킬"
이 스킬은 구조 변경, 옛 방식과 죽은 코드 삭제, 테스트 삭제, 커밋을 지시한다.[](source:skill-levels)[](source:skill-prove) 사람 승인이 명시된 곳은 예외를 남길 때뿐이다.[](source:skill-prove) 판정: 삭제 범위를 사용자와 미리 맞추지 않으면 예상보다 큰 변경이 생길 수 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 하나. 이 폴더의 원본은 이것뿐이다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: `verification-skills/pstack/correct/SKILL.md`와 원문 동일(원장 기준, `shasum` 일치).
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"가장 자주 일어난 묶음"을 몇 개까지 지금 고칠지는 원문에 명시 없음. "에이전트 지시 파일"이 어느 파일(`AGENTS.md` 등)인지도 원문에 명시 없음. 높은 수준이 "통하지 않는다"고 판단하는 기준도 원문에 명시 없음. 답변에서 이유를 밝히라고만 한다.
