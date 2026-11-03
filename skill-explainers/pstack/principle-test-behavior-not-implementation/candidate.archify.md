# principle-test-behavior-not-implementation 스킬은 에이전트를 어떻게 바꾸나 {#test-behavior-skill}

이 원칙을 적용하면 에이전트는 테스트를 남기기 전에 한 가지를 묻는다. 가져온 함수가 모두 `undefined`를 돌려줘도 이 테스트가 통과하는가? 그렇다면 결함을 잡지 못하는 테스트이므로 단언을 다시 쓰거나 지운다.[](source:skill-check)

- 테스트는 사용자가 부르는 방식으로 코드를 부르고, 사용자가 보는 결과를 리터럴 기댓값과 비교한다.[](source:skill-intro)
- 어떤 호출이 일어났는지 확인하거나, 코드 안의 상수를 다시 적는 테스트는 행동을 보지 않는다.[](source:skill-intro)
- 원문은 `undefined` 검사에 걸리는 모양 다섯 가지와 고치는 법을 준다.[](source:skill-shapes)[](source:skill-fix)
- `poteto-mode`는 테스트를 쓰거나, 바꾸거나, 남길 때 이 원칙을 꺼낸다.[](source:pm-line)

@answer scope="SKILL.md 1개와 참조 위치 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/principle-test-behavior-not-implementation/SKILL.md · 2575B · frontmatter" path=pstack/principle-test-behavior-not-implementation/SKILL.md lines=1:5
@source skill-intro title="SKILL.md · 도입부" path=pstack/principle-test-behavior-not-implementation/SKILL.md lines=9:9
@source skill-check title="SKILL.md · undefined 검사" path=pstack/principle-test-behavior-not-implementation/SKILL.md lines=11:11
@source skill-why title="SKILL.md · Why" path=pstack/principle-test-behavior-not-implementation/SKILL.md lines=13:13
@source skill-shapes title="SKILL.md · 다섯 가지 모양" path=pstack/principle-test-behavior-not-implementation/SKILL.md lines=15:21
@source skill-fix title="SKILL.md · The fix" path=pstack/principle-test-behavior-not-implementation/SKILL.md lines=23:23
@source skill-keep title="SKILL.md · Keep" path=pstack/principle-test-behavior-not-implementation/SKILL.md lines=25:25
@source pm-cite title="pstack/poteto-mode/SKILL.md · 원칙 인용 의무" path=pstack/poteto-mode/SKILL.md lines=15:15
@source pm-read title="pstack/poteto-mode/SKILL.md · 원칙을 끝까지 읽기" path=pstack/poteto-mode/SKILL.md lines=40:40
@source pm-line title="pstack/poteto-mode/SKILL.md · Verification 원칙 목록의 이 원칙" path=pstack/poteto-mode/SKILL.md lines=69:69
@source rubric title="pstack/interrogate/references/rubric.md · 테스트 항목" path=pstack/interrogate/references/rubric.md lines=49:49
@source help-principles title="pstack/poteto-help/SKILL.md · 원칙 스킬 안내" path=pstack/poteto-help/SKILL.md lines=120:120

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/principle-test-behavior-not-implementation`을 입력하거나, 다른 스킬이 이 원칙을 읽게 할 때 켜진다. 사용자가 원칙을 직접 부르는 일은 드물다. 보통은 원칙 이름을 말로 꺼내 방향을 잡는다.[](source:help-principles)

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/principle-test-behavior-not-implementation` 입력[](source:help-principles) |
| `poteto-mode` | Verification 원칙. 테스트를 쓰거나, 바꾸거나, 남길 때[](source:pm-line) |

`poteto-mode`에서 켜지면 의무가 따라온다. 적용하는 원칙은 `SKILL.md`를 끝까지 읽는다.[](source:pm-read) 답변에는 결정을 바꾼 원칙과 바뀐 선택을 밝힌다. 인용은 이번 세션에 읽은 원칙만 한다.[](source:pm-cite)

`description`은 이 원칙이 다루는 상황을 알려 주는 설명이다. 그 문장과 같은 말이 나와야 켜지는 장치는 아니다.

## 무엇을 강제하나 {#rules}

결함 때문에 실패할 수 없는 테스트는 CI 시간과 리뷰 주의만 쓰고 아무것도 잡지 못한다. 상수를 고정하는 테스트는 더 나쁘다. 누가 그 상수나 프롬프트를 고치면 실패해서 정당한 수정을 막는다.[](source:skill-why)

| 걸리는 모양 | 원문의 예 | 고치는 법 |
| --- | --- | --- |
| 단언이 약하거나 없음 | `expect` 없음, `toBeDefined`, `toBeTruthy`, `not.toThrow`, `toBeInstanceOf`, `toBeGreaterThan(0)`만 있음[](source:skill-shapes) | 구체적 입력 하나로 대상을 부르고 리터럴 출력을 단언한다[](source:skill-fix) |
| 목(mock)이나 부재만 확인 | `toHaveBeenCalled`, `not.toHaveBeenCalled`, `toBeUndefined`, `toEqual([])`, `toHaveLength(0)`, `not.toBe(wrongValue)`만 있음[](source:skill-shapes) | 목이면 받은 내용이나 호출 뒤 상태를 단언한다. 부재면 같은 테스트에서 다른 입력의 존재를 단언한다[](source:skill-fix) |
| 자기 참조 | `expect(f(a)).toBe(f(a))`, `expect(parsed.url).toBe(buildUrl(...))`[](source:skill-shapes) | 기댓값을 테스트 대상이 아닌 리터럴로 쓴다[](source:skill-intro)[](source:skill-fix) |
| 상수 고정 | `expect(LIMITS.maxTools).toBe(8)`, `expect(PROMPT).toContain("You are")`[](source:skill-shapes) | 그 상수를 읽는 동작을 입력 하나로 테스트한다[](source:skill-fix) |
| 픽스처가 픽스처를 확인 | 테스트가 만든 데이터나 `beforeEach`에서 계산한 값을 읽고, 대상은 본문에서 돌지 않음[](source:skill-shapes) | 테스트 본문 안에서 대상을 부른다[](source:skill-fix) |

원문이 드는 좋은 예는 `expect(slugify("Hello, World!")).toBe("hello-world")`다. 본문에서 대상을 구체적 입력 하나로 부르고, 리터럴 출력을 단언한다.[](source:skill-fix)

| 결정 | 원문의 강도 |
| --- | --- |
| 그런 단언을 만들 수 없으면 테스트를 지운다[](source:skill-fix) | 의무 |
| 표의 여러 행에 걸친 관계 테스트는 남긴다. 예: 두 표에 같은 키가 있는지, 부모가 존재하는지[](source:skill-keep) | 예외(유지) |
| `*.test-d.ts` 파일의 컴파일 시점 검사는 남긴다[](source:skill-keep) | 예외(유지) |

## 흐름 속 위치 {#position}

@workflow id=test-position title="행동 테스트 원칙의 앞뒤"
| pm | poteto-mode | backend |
| this | 행동 테스트 | backend |
| back | 고치거나 지우기 | frontend |
| pm > this | 테스트 작업 | |
| this > back | 판정 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 판단 상황 | 답변 속 원칙 이름과 바뀐 선택 | 테스트를 쓰거나 바꾸거나 남길 때[](source:pm-line) | r12 |
| `interrogate` 리뷰 기준표 | - | 이름 없이 "행동을 테스트하나, 구현 세부를 테스트하나"를 묻는다[](source:rubric) | 원장에 없음(추론) |

플레이북과 다른 스킬은 이 원칙을 이름으로 부르지 않는다. 원칙끼리의 참고 관계(r100~r107)에도 나오지 않는다. 전체 흐름은 `pstack/_group-principles/principles.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`(2575B). 이 원칙을 부르는 위치를 확인하려고 `poteto-mode/SKILL.md`, `interrogate/references/rubric.md`, `poteto-help/SKILL.md`의 해당 줄을 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: `verification-skills/pstack/principle-test-behavior-not-implementation`과 원문 동일(`shasum` 일치, 원장과 같음).
- 실제로 실행해 보지 않았다. 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
원문의 예는 모두 Jest 계열 단언 이름이다. 다른 테스트 도구에서 같은 모양을 어떻게 가르는지는 원문에 명시 없음.
