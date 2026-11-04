# dsh-trim-cot-leakage 스킬은 에이전트를 어떻게 바꾸나 {#trim-cot-leakage-skill}

`dsh-trim-cot-leakage`를 쓰면 에이전트는 주석·문서·JSDoc·Agent Note 문서에서, 작업 세션의 시점으로 쓴 글을 찾는다. 결정 번호, 변경 서술, 떠난 리뷰어에게 하는 말이 그런 글이다. 에이전트는 이런 글을 지금 저장소(HEAD)에서 확인되는 사실로 고쳐 쓰고, 둘러싼 추론 기록은 지운다.[](source:tc-intro)

- 판단 기준은 하나다. 세션 기록, PR 스레드, commit하지 않은 초안을 볼 수 없는 독자가 `HEAD`에서 모든 참조를 풀고 모든 주장을 확인할 수 있는가.[](source:tc-test)
- 사실 절이 있는 글은 에이전트가 지우기만 하지 않는다. 사실을 HEAD 기준으로 다시 쓰고, 나머지를 지운다. 사실 절이 없는 글(감사 코드, 제어 흐름 서술)은 통째로 지운다.[](source:tc-intro)
- 이슈 번호, 억제 사유, 측정값, 외부 표준 절 번호처럼 `HEAD`에서 확인되는 참조는 지우지 않는다.[](source:tc-keeps)
- 검색식은 후보를 찾는 도구일 뿐 정의가 아니다. 가장 빽빽한 글은 에이전트가 검색식 없이도 직접 읽는다.[](source:tc-workflow)

@answer scope="deepseek-harness/dsh-trim-cot-leakage · 원본 텍스트 3개 · 커밋 475505c · 범위 밖 링크 미확인(부분 분석) · 지시상 동작"
@meta locale=ko
@source tc-fm title="deepseek-harness/dsh-trim-cot-leakage/SKILL.md · 7699B · frontmatter" path=deepseek-harness/dsh-trim-cot-leakage/SKILL.md lines=1:4
@source tc-intro title="SKILL.md · 정의와 수정 원칙" path=deepseek-harness/dsh-trim-cot-leakage/SKILL.md lines=8:8
@source tc-test title="SKILL.md · The one test" path=deepseek-harness/dsh-trim-cot-leakage/SKILL.md lines=10:12
@source tc-tax title="SKILL.md · Taxonomy 여덟 유형" path=deepseek-harness/dsh-trim-cot-leakage/SKILL.md lines=14:23
@source tc-keeps title="SKILL.md · What is not leakage" path=deepseek-harness/dsh-trim-cot-leakage/SKILL.md lines=25:37
@source tc-workflow title="SKILL.md · Workflow" path=deepseek-harness/dsh-trim-cot-leakage/SKILL.md lines=39:45
@source tc-scope title="SKILL.md · 1단계 범위와 제외" path=deepseek-harness/dsh-trim-cot-leakage/SKILL.md lines=41:41
@source tc-audit title="SKILL.md · 2단계 감사" path=deepseek-harness/dsh-trim-cot-leakage/SKILL.md lines=42:42
@source tc-owner title="SKILL.md · 3단계 소유자부터 수정" path=deepseek-harness/dsh-trim-cot-leakage/SKILL.md lines=43:43
@source tc-trap title="SKILL.md · 4단계 과교정 점검" path=deepseek-harness/dsh-trim-cot-leakage/SKILL.md lines=44:44
@source tc-verify title="SKILL.md · 5단계 검증" path=deepseek-harness/dsh-trim-cot-leakage/SKILL.md lines=45:45
@source ex-head title="deepseek-harness/dsh-trim-cot-leakage/references/examples.md · 12566B · 예시 모음" path=deepseek-harness/dsh-trim-cot-leakage/references/examples.md lines=1:3
@source ex-dead title="examples.md · 죽은 인용" path=deepseek-harness/dsh-trim-cot-leakage/references/examples.md lines=5:45
@source ex-change title="examples.md · 변경 서술" path=deepseek-harness/dsh-trim-cot-leakage/references/examples.md lines=65:97
@source ex-justify title="examples.md · 리뷰어에게 하는 정당화" path=deepseek-harness/dsh-trim-cot-leakage/references/examples.md lines=117:133
@source ex-visible title="examples.md · 동작에 보이는 후보" path=deepseek-harness/dsh-trim-cot-leakage/references/examples.md lines=187:193
@source ex-keeps title="examples.md · 남기는 것" path=deepseek-harness/dsh-trim-cot-leakage/references/examples.md lines=195:231
@source ex-traps title="examples.md · 과교정 함정" path=deepseek-harness/dsh-trim-cot-leakage/references/examples.md lines=233:275
@source bt-head title="deepseek-harness/dsh-trim-cot-leakage/references/recall-batteries.md · 4980B · 검색식 묶음" path=deepseek-harness/dsh-trim-cot-leakage/references/recall-batteries.md lines=1:3
@source bt-rules title="recall-batteries.md · 실행 규칙" path=deepseek-harness/dsh-trim-cot-leakage/references/recall-batteries.md lines=5:12
@source bt-en title="recall-batteries.md · 영어 검색식" path=deepseek-harness/dsh-trim-cot-leakage/references/recall-batteries.md lines=17:23
@source bt-zh title="recall-batteries.md · 중국어 검색식" path=deepseek-harness/dsh-trim-cot-leakage/references/recall-batteries.md lines=28:37
@source bt-fp title="recall-batteries.md · 알려진 오탐" path=deepseek-harness/dsh-trim-cot-leakage/references/recall-batteries.md lines=40:52
@source doc-r12 title="deepseek-harness/dsh-doc/SKILL.md · r12 확인용" path=deepseek-harness/dsh-doc/SKILL.md lines=93:93
@source ps-r10 title="deepseek-harness/dsh-prose-standard/SKILL.md · r10 확인용" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=8:8

## 언제 켜지고 어떤 글을 누출로 보나 {#trigger}

@code source=tc-fm language=yaml

이 스킬에는 호출 제한 필드가 없어서, 모델이 `description`을 참고해 스킬을 켤 수 있다.[](source:tc-fm) 판정: `description`은 판단용 설명이지, 특정 단어가 있으면 켜지는 목록이 아니다. 이 스킬은 스스로 "가이드이지 스크립트가 아니다"라고 밝힌다.[](source:tc-intro)

추론 흔적(chain-of-thought leakage)은 시점이 저장소가 아니라 작성 세션인 글이다. 이런 글은 그 세션만 볼 수 있던 산출물을 인용하거나, 상태 대신 변경을 서술하거나, 이미 떠난 리뷰어와 논쟁한다.[](source:tc-intro)

@callout level=note title="통과해도 끝나지 않는 경우"
`HEAD`에서 풀리는 참조는 이 스킬의 기준을 통과한다. 하지만 README·문서·JSDoc처럼 현재 상태를 쓰는 곳에서는 풀리는 변경 이야기도 여전히 변경 서술이다. 3유형이 그것을 허용된 자리로 보낸다.[](source:tc-test) 허용된 자리는 문서 표준(`docs/AGENTS.md`)이 정하며 이 저장소에 없다(범위 밖).

## 여덟 유형은 각각 어떻게 고치나 {#taxonomy}

수정은 유형에 따라 다르다. 사실 절이 있으면 다시 쓰고, 없으면 지운다.[](source:tc-intro)

| 유형 | 예 | 고치는 법 |
| --- | --- | --- |
| 1. 죽은 설계 세션 인용 | `(decision 7)`, `(audit C2)`, `design §4.7`, `T4`, `W3`, `P-I` | commit된 소유자가 있으면 이름과 경로로 인용하고, 없으면 인용을 지우되 사실 절은 홀로 서게 다시 쓴다[](source:tc-tax) |
| 2. stack·PR 시점 | `a later PR in this stack`, `this PR adds`, `the previous commit` | 출고된 메커니즘이나 확장점을 쓴다. 미룬 일은 `TODO` 표지나 이슈 참조로 옮긴다[](source:tc-tax) |
| 3. 변경 서술과 버전 도장 | `used to`, `no longer`, `the old X`, `v1`, `this cut`, `today` | 지금 동작을 쓴다. 고친 회귀는 "X가 없으면 Y가 생긴다"는 현재형 반사실로 쓰고, 저장소 이력으로 쓰지 않는다[](source:tc-tax) |
| 4. 리뷰 연출 | `Rejected in review:`, `the reviewer confirmed`, `v5 of this note` | 남은 결정과 근거를 사실로 쓰고, 누가 언제 말했는지는 지운다[](source:tc-tax) |
| 5. 리뷰어를 향한 정당화 | `the cast is safe — it simply…`, `this is correct because…` | 코드를 안전하게 하는 불변식을 쓴다. 코드가 보여 주면 주석을 지운다[](source:tc-tax) |
| 6. 되풀이와 유도 기록 | "먼저 X하고 다음에 Y한다", 테스트 진행 서술 | 지운다. 자명하지 않은 계약이나 불변식만 남긴다[](source:tc-tax) |
| 7. 얼버무림과 계획 잔재 | `probably fine for now`, `should be enough` | `TODO`/`FIXME`로 올리거나 실제 한계로 다시 쓰고, 얼버무림은 지운다[](source:tc-tax) |
| 8. 작성 언어 흘림 | 영어 글 속의 중국어 조각(`端`, `设计稿`, `---- 私有 ----`) | 번역하거나 지운다. 중국어 짝 문서에서는 반대로 영어 조각이다[](source:tc-tax) |

사례 하나. 결정 번호에 소유자가 없으면 번호만 지우고 사실은 남긴다. 원문 예시를 한국어로 옮겼다.[](source:ex-dead)

| 누출된 글 | 고친 글 |
| --- | --- |
| 레지스트리는 중복 이름을 거부한다(decision 7: 이름은 평평하고 네임스페이스가 없다) | 레지스트리는 중복 이름을 거부한다. 이름은 평평하며 네임스페이스가 없다 |

## 무엇은 누출이 아니라서 남기나 {#keeps}

세션 기록 없이 하는 인용 점검은 지속되는 참조를 지우고 죽은 참조를 남기는 양쪽 실수를 한다. 아래 규칙을 그대로 적용한다.[](source:tc-keeps)

| 남기는 것 | 이유 |
| --- | --- |
| 이슈 참조(`#1470`, `TODO(name):`, "issue #N owns the follow-up") | `HEAD`에서 풀린다. 어느 곳에든 두고 Agent Note 문서로 옮기지 않는다[](source:tc-keeps) {good:모든 글} |
| Agent Note 문서와 사후 분석 안의 병합된 PR·이슈 인용 | 문서 표준이 허용한 근거다. 범위 밖 문서[](source:tc-keeps) |
| 억제 사유(`oxlint-disable … -- reason`, 커버리지 제외 사유, 빈 catch 설명) | 필수 글이다. 거짓이면 고치고 지우지 않는다[](source:tc-keeps) |
| 반사실 현재형 회귀 고정("without X, Y happens") | 회귀를 현재 사실로 붙든다[](source:tc-keeps) |
| 측정한 한계(`measured: 512 nests ≈ 0.15s`) | "measured"가 근거를 뜻한다[](source:tc-keeps) |
| 런타임의 옛것·새것("the old connection drains before the new one accepts") | 변경 이력이 아니라 생명주기다[](source:tc-keeps) |
| Agent Note 문서의 변경 서사 절 안 역사 단계 이름("the first cut shipped X") | 거기서는 현재 상태에 안전하다. 지시어형 도장(`this cut`)은 어디서든 금지다[](source:tc-keeps) |
| 저장소 밖에서 풀리는 외부 참조(RFC 9110 §10.1.5, Figma 프레임 이름) | `§` 금지는 commit하지 않은 내부 초안에만 적용한다[](source:tc-keeps) |
| 프로젝트 목소리("we"), 대안 검토 절 | 장르 형식이다[](source:tc-keeps) |

판정: 이 목록은 "풀리는가"를 형식이 아니라 실제 해석 가능성으로 보라는 뜻이다. 근거는 예시에서 "독자가 알 수 없는 문서 이름"을 소유자 이름이라고 우긴 점검이 틀렸다고 분명히 적은 대목이다.[](source:ex-keeps)

수정이 과해지는 함정도 네 가지 적혀 있다. 모두 원문에서 검토 중에 잡힌 실제 사례다.[](source:ex-traps)

| 함정 | 원래 문장의 뜻 | 과교정 결과 |
| --- | --- | --- |
| 의무를 승인으로 뒤집기 | "슬롯으로 옮기기 전까지의 예외" | "허용된 예외"로 바뀌어 옮길 의무가 사라진다 |
| 가정을 출고된 기능으로 올리기 | "미래의 IPC 셸이 `executor`를 상속한다" | "IPC 셸이 상속한다"로 바뀌어 존재하는 클래스처럼 읽힌다. "그런 셸은 없다"고 밝히는 것이 맞다 |
| 사실을 기록과 함께 지우기 | 한 문장에 서술과 결합 사실이 함께 있다 | 문장 통째 삭제로 결합 사실을 잃는다. 절 단위로 지운다 |
| 측정 출처 떼기 | "4 MiB 한도는 측정한 것: 가장 큰 모듈이 3.1 MiB" | "측정"을 빼면 `3.1 MiB`가 정의처럼 읽혀 아무도 다시 재지 않는다 |

## 어떤 순서로 일하나 {#workflow}

@workflow id=trim-flow title="추론 흔적 정리 5단계"
| scope | 범위·제외 확인 | external |
| sweep | 읽기 전용 감사 | backend |
| props | 명제 열거 | backend |
| fix | 소유자부터 수정 | backend |
| verify | 다시 검증 | backend |
| scope > sweep | |
| sweep > props | 삭제 전 | emphasis |
| props > fix | |
| fix > verify | |

@steps id=trim-steps
| scope | 범위·제외 확인 | 에이전트가 `dsh-prose-standard` 기준으로 명시한 범위를 요구하고, `vendor/`와 `.agents/notes/archived/`는 건드리지 않는다. 기록된 픽스처와 스냅숏은 파생물이다. 허가된 동작 변경이 새 근거를 요구할 때만 소유 원본이나 시나리오를 고치고 다시 만든다.[](source:tc-scope) | trim-flow | scope |
| sweep | 읽기 전용 감사 | 에이전트가 검색식 묶음을 `--hidden`으로 돌려 `.agents/`까지 찾는다. 각 검색식은 실제 양성 사례와 비슷한 음성 사례로 먼저 보정한다. 걸린 것은 모두 의미로 판단한다. 가장 빽빽한 글은 검색식 없이도 읽는다.[](source:tc-audit) | trim-flow | sweep |
| props | 명제 열거 | 에이전트가 지우기 전에 글의 명제를 모두 센다(`dsh-prose-standard`). 그리고 과교정이 없는지 확인한다. 과교정은 의무를 승인으로 바꾸거나, 가정을 출고된 기능으로 올리거나, 사실이나 근거 출처를 지우는 것이다. 원문 번호는 4단계지만 "Before deleting anything"이라고 적혀 있어 수정 앞에 그렸다.[](source:tc-trap) | trim-flow | props |
| fix | 소유자부터 수정 | 에이전트가 표면별로 소유 원본을 먼저 고치고 파생물을 다시 만든다. 아래 표를 본다.[](source:tc-owner) | trim-flow | fix |
| verify | 다시 검증 | 에이전트가 검색식을 다시 돌려, 허용된 남김만 남았는지, 이 스킬의 폴더와 소유 노트가 인용한 근거만 걸리는지 본다. 남은 인용이 모두 `HEAD`에서 풀리는지 확인하고, 해당 통과 조건(`doc-sync`, `verify-type-equiv`, `verify-translation-pairing`)을 돌린다.[](source:tc-verify) | trim-flow | verify |

쓰기 권한은 이 스킬에서 따로 정하지 않는다. 1단계가 `dsh-prose-standard`를 가리키는 것은 범위와 제외 대상뿐이고, 감사는 먼저 읽기 전용으로 한다.[](source:tc-scope)[](source:tc-audit) 언제 수정까지 해도 되는지는 원문에 명시 없음. 판정: 사용자가 고치라고 요청했는지에 따라 정해진다고 읽는 것이 자연스럽지만, 이 스킬만으로는 확정할 수 없다.

수정은 표면에 따라 소유자부터 한다.[](source:tc-owner)

| 표면 | 먼저 할 일 |
| --- | --- |
| 생성 카탈로그 | 소비하는 곳을 모두 따라가서 원본 JSDoc이나 생성 틀을 고친 뒤 파생물을 모두 다시 만든다 |
| 타입 동치 울타리 | 원본 JSDoc 주석을 고친 뒤 두 언어 쪽에 다시 붙인다(`verify-type-equiv`가 고정한다) |
| 이중 언어 글 | 반대쪽을 최소로 고치고 가벼운 경로로 쌍을 다시 기록한다 |
| 이중 언어 코드 울타리 | 고친 블록을 양쪽에 바이트 그대로 복사하고(`dsh-doc` 규칙) 쌍을 다시 기록한다 |
| 모델·사용자에게 보이는 문자열 | `dsh-prose-standard`로 넘기고, 소유 동작 근거가 있을 때만 바꾼다. 없으면 그대로 두고 보류를 보고한다 |

## 검색식은 어떻게 쓰고 무엇을 놓치나 {#batteries}

검색식 묶음은 2026-08 대정리에서 다듬은 탐색 도구다. 모든 결과를 의미로 판단해야 한다. 검색식은 일부러 넓게 걸리게 만들었고, 본질적으로 못 잡는 것도 있다. 대정리의 리뷰 때마다 어느 검색식도 못 잡은 사례가 나왔다.[](source:bt-head)

@code source=bt-en language=bash

- 숨은 폴더(`.agents/`)까지 찾으려면 `--hidden --glob '!.git/**'`를 붙인다. 대정리에서 가장 큰 놓침 위험이 Agent Note 문서였다.[](source:bt-rules)
- 제외는 마지막에 둔다. 제외 대상은 `vendor/`, `node_modules/`, `.agents/notes/archived/`, 이 스킬 폴더다. 이 스킬 폴더는 누출 문구를 보정용으로 인용하므로 뺀다.[](source:bt-rules)
- 자연어 줄에는 `-i`를 붙여 문장 첫 대문자도 잡는다. 코드 패턴이 있는 첫 줄만 대소문자를 구분한다. `-i`를 쓰면 `\bT\d\b`와 `\bP-I\b`가 잡음이 되기 때문이다.[](source:bt-rules)
- 완전한 구절을 경계로 묶는다. `\bthis PR\b`는 "this PR adds"는 잡고 "this project"는 잡지 않아야 한다.[](source:bt-rules)
- 결과가 0건인 검색식은 알려진 양성 사례를 잡기 전에는 아무것도 증명하지 못한다. 잡음이 많은 검색식은 비슷한 음성 사례를 거르기 전에는 믿지 않는다.[](source:bt-rules)
- 작성 언어 흘림은 반대 언어 쪽 글에서 찾는다. 영어 Markdown 문서와 주석의 중국어 흔적을 찾고, `*.zh.md`의 중국어 변경 서술을 찾는다.[](source:bt-rules)[](source:bt-zh)

원문이 이미 오탐으로 판정해 둔 계열이 아홉 가지 있다. 도구적 `used to`("서명에 쓰는 키"), 런타임 옛것·새것, 프로세스 문서의 `this PR`, 프로토콜·경로 조각인 `v1`, 소유자가 있는 `§N`, 대조적 "actually"와 명사 "wait", 런타임의 `today`와 기록된 시각, 중국어 `本版本`, 대안 검토 절의 "rejected"다.[](source:bt-fp)

## 흐름 속 위치 {#position}

@workflow id=trim-position title="dsh-trim-cot-leakage 앞뒤의 스킬"
| doc | dsh-doc | backend |
| trim | dsh-trim-cot-leakage | backend |
| prose | dsh-prose-standard | backend |
| doc > trim | 추론 흔적 | emphasis |
| trim > prose | 보이는 문자열 | emphasis |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `dsh-doc` · 점검 의뢰 | - | - | 구조 점검 뒤 군더더기 체크리스트를 훑을 때 추론 흔적은 이 스킬로 찾는다[](source:doc-r12) | r12 |
| `dsh-prose-standard` · 넘김 | 범위·제외 기준, 완전 명제 규칙 | 모델·사용자에게 보이는 문자열 | 소유 동작 근거가 없으면 바꾸지 않고 보류를 보고한다[](source:tc-scope)[](source:tc-owner)[](source:tc-intro) | r16 |
| `dsh-prose-standard` · 참고 | - | - | 반대 방향: `dsh-prose-standard`가 이 스킬을 쓰라고 가리키는 참고[](source:ps-r10) | r10 |
| `dsh-doc` · 코드 울타리 | 이중 언어 코드 울타리 규칙 | 고친 블록 | 고친 블록을 양쪽에 바이트 그대로 복사한 뒤 쌍을 다시 기록한다[](source:tc-owner) | r17 |

그림에는 r12와 r16만 그렸다. 나머지는 표에만 있고 그림에서 생략했다.

- r10: 반대 방향의 참고.
- r17: 이중 언어 코드 울타리.
- r42: Agent Note 폴더 공유. `dsh-prose-standard`와 이 스킬은 `.agents/notes/archived/`를 고치지 않는다.[](source:tc-scope)

전체 흐름은 `deepseek-harness/_group-docs/docs.html`에 있다. 관계 근거는 `deepseek-harness/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `references/examples.md`, `references/recall-batteries.md`. 모두 원본이다. 관계 확인을 위해 `dsh-doc`와 `dsh-prose-standard`의 해당 줄을 읽었다.
- 제외한 파일: 이 폴더에는 번역본이 없다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 관계 확인: r12와 r10의 출처 줄을 원문과 대조했고 원장과 같다. r16, r17, r42는 이 스킬의 41, 43행에서 확인했다.
- 범위 밖: `../../../docs/AGENTS.md`(변경 서사 경로 규칙, 가벼운 경로), `../../notes/archived/process/2026-08-09-committed-artifact-citations.md`(인용 규칙의 역사적 근거)는 원래 저장소의 파일이라 읽지 않았다.
- 검색식은 실행하지 않았다. 이 저장소에는 대상 저장소의 글이 없다. 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
변경 이야기의 "허용된 자리"(3유형)와 병합된 PR 인용을 허용하는 문서 표준은 범위 밖이라 확인하지 못했다. 쓰기 권한(언제 수정까지 하는가)도 원문에 명시 없음.
