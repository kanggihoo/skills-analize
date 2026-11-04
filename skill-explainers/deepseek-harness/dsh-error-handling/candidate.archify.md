# dsh-error-handling 스킬은 에이전트를 어떻게 바꾸나 {#dsh-error-handling-skill}

`dsh-error-handling`을 쓰면 에이전트는 실패를 다룰 때, 예외를 잡았는지가 아니라 실패 뒤에 상태가 안전한지를 기준으로 판단한다. 에이전트는 실패마다 누가 처리하고 누가 보고하는지, 무엇이 아직 안전한지를 먼저 정한다.[](source:eh-intro)[](source:eh-catch)

- 에이전트는 예상한 실패에 타입과 안정적인 판별자를 선언한다. 메시지 문자열을 파싱해서 처리 경로를 정하지 않는다.[](source:eh-typed)
- 예외를 잡으면 전파는 멈추지만, 이미 일어난 변경은 되돌아가지 않는다. 계속 진행해도 안전한지는 영향받은 상태의 소유자만 정할 수 있다.[](source:eh-catch)
- 로그만 남기는 것은 복구가 아니다. 최종 보고에는 요약, 영향받은 작업, 안전한 다음 행동이 있어야 한다.[](source:eh-catch)[](source:eh-report)
- 결과가 불확실하면 에이전트는 성공·롤백·안전한 재시도를 주장하지 않는다.[](source:eh-visible)

@answer scope="deepseek-harness/dsh-error-handling · 원본 텍스트 파일 1개 · 커밋 475505c · 지시상 동작"
@meta locale=ko
@source eh-fm title="deepseek-harness/dsh-error-handling/SKILL.md · 2389B · frontmatter" path=deepseek-harness/dsh-error-handling/SKILL.md lines=1:4
@source eh-intro title="SKILL.md · 목적" path=deepseek-harness/dsh-error-handling/SKILL.md lines=8:8
@source eh-typed title="SKILL.md · 타입 있는 구조적 실패" path=deepseek-harness/dsh-error-handling/SKILL.md lines=12:12
@source eh-define title="SKILL.md · 실패별로 정할 것" path=deepseek-harness/dsh-error-handling/SKILL.md lines=16:16
@source eh-catch title="SKILL.md · 잡기·복구·중단" path=deepseek-harness/dsh-error-handling/SKILL.md lines=18:18
@source eh-report title="SKILL.md · 최종 보고" path=deepseek-harness/dsh-error-handling/SKILL.md lines=22:22
@source eh-visible title="SKILL.md · 보이는 보고" path=deepseek-harness/dsh-error-handling/SKILL.md lines=24:24
@source eh-verify title="SKILL.md · 검증" path=deepseek-harness/dsh-error-handling/SKILL.md lines=26:26
@source eh-found title="SKILL.md · Foundations" path=deepseek-harness/dsh-error-handling/SKILL.md lines=30:30
@source rel-eh title="relations.md · r04, r31" path=skill-explainers/deepseek-harness/relations.md lines=47:47
@source rel-eh2 title="relations.md · r31 UI 스킬의 위임" path=skill-explainers/deepseek-harness/relations.md lines=89:89
@source ui-eh title="deepseek-harness/dsh-client-ui-ux/SKILL.md · 오류 보고 절 링크" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=34:34

## 언제 켜지고 무엇을 정하나 {#trigger}

@code source=eh-fm language=yaml

`description`은 실패, 복구, 재시도, 백그라운드 작업, 사용자에게 보이는 오류 보고를 설계하거나 리뷰할 때 이 스킬의 원칙을 적용하라고 한다.[](source:eh-fm) 호출을 막는 필드(`disable-model-invocation` 등)는 원문에 명시 없음. 이 스킬을 한 줄로 요약하면 "실패와 그 소유자, 실패 뒤에도 안전한 것을 정의한다"이다.[](source:eh-intro)

원문은 규칙을 세 덩어리로 나눈다. 아래 그림은 그 규칙을 판단 순서로 다시 배열한 것이다. 원문은 이 순서를 명시하지 않는다(판정).[](source:eh-typed)[](source:eh-catch)[](source:eh-report)

@workflow id=failure-decision title="실패를 만났을 때의 판단"
| fail | 실패 발생 | external |
| kind | 예상한 실패인가? | security |
| typed | 타입·판별자 선언 | backend |
| defect | 결함은 성공 금지 | backend |
| owner | 소유자가 안전 보장? | security |
| go | 복구·재시도 | backend |
| stop | 중단·폐기·상향 | backend |
| rep | 최종 보고 | frontend |
| fail > kind | |
| kind > typed | 예 |
| kind > defect | 아니오 | dashed |
| typed > owner | |
| owner > go | 예 | emphasis |
| owner > stop | 아니오 | emphasis |
| go > rep | |
| stop > rep | |
| defect > rep | |

@steps id=failure-decision-steps
| kind | 예상한 실패인가? | 예상한 실패에는 선언된 타입과 안정적인 판별자가 필요하다. `assertNever` 같은 예상 밖 결함은 일반 `Error`로 둘 수 있다. 다만 결함을 격리하더라도, 그것을 성공으로 바꾸면 안 된다.[](source:eh-typed) | failure-decision | kind |
| typed | 타입·판별자 선언 | 에이전트는 패키지의 오류 관례를 재사용하고 원인을 보존한다. 기계가 읽는 정체성과 표시용 문구를 분리한다.[](source:eh-typed) | failure-decision | typed |
| owner | 소유자가 안전 보장? | 영향받은 상태의 소유자만 계속 진행이 안전한지 정할 수 있다.[](source:eh-catch) | failure-decision | owner |
| stop | 중단·폐기·상향 | 소유자가 보장하지 못하면, 에이전트는 의존 작업을 멈추거나, 잘못된 상태·인스턴스를 버리거나, 상위로 올린다.[](source:eh-catch) | failure-decision | stop |
| rep | 최종 보고 | 에이전트가 요약, 영향받은 작업, 안전한 다음 행동을 낸다.[](source:eh-report) | failure-decision | rep |

## 규칙은 어떤 강도로 적혀 있나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 예상한 실패에 선언된 타입, 안정적인 판별자, 처리에 필요한 세부 정보를 둔다[](source:eh-typed) | 의무 |
| 오류 관례를 재사용하고 원인을 보존하며, 기계용 정체성과 표시 문구를 분리한다[](source:eh-typed) | 의무 |
| 메시지를 파싱해 처리 경로를 정한다[](source:eh-typed) | 금지 |
| 격리가 예상 밖 결함을 성공으로 바꾼다[](source:eh-typed) | 금지 |
| 실패마다 처리 소유자, 보고 소유자, 격리 범위, 보장을 해당 API 문서에 정의한다. 보장에 들어가는 것은 유효한 불변식, 변경이 없음·일부·확정·알 수 없음 중 무엇인지, 정리 책임이다. 백그라운드 작업도 같은 의무를 진다[](source:eh-define) | 의무 |
| 상태 소유자가 계속해도 안전함을 보이지 못하면, 의존 작업을 멈추거나 잘못된 상태·인스턴스를 버리거나 상향한다[](source:eh-catch) | 의무(조건부) |
| 로그만 남기는 것을 복구로 친다[](source:eh-catch) | 금지 |
| 재시도에는 안전한 반복, 취소, 명시적 소유자가 필요하다. 끝이 있는 작업에는 예산이 필요하다. 계속 감독하는 작업에는 수명주기 소유와 관찰 가능한 성능 저하 표시가 필요하다[](source:eh-catch) | 의무(조건부) |
| 모든 최종 보고에 읽을 수 있는 요약, 영향받은 작업, 안전한 다음 행동을 담는다[](source:eh-report) | 의무 |
| 받는 애플리케이션의 로캘 방식이 있으면 그것으로 현지화하고, 없는 진단은 기존 출력 언어를 쓴다. 민감한 내부 정보는 사용자 문구에서 뺀다[](source:eh-report) | 의무 |
| 신뢰할 수 없는 상태나 알 수 없는 결과를 UI 또는 기본으로 켜진 접근 가능한 로그에 보인다. 영향, 불확실성, 시스템의 처리, 안전한 다음 단계를 적는다. 지속되는 잘못된 상태는 지속적으로 보인다[](source:eh-visible) | 의무 |
| 보장 없이 성공·롤백·안전한 재시도를 주장한다[](source:eh-visible) | 금지 |
| 보고 자체가 실패할 때를 위해 독립적인 대체 경로를 둔다[](source:eh-visible) | 의무 |
| 예외를 잡았다는 것이 아니라 결과 상태와 보이는 결과를 검증한다[](source:eh-verify) | 의무 |

원문 끝의 "Foundations" 절은 근거 문헌 세 편을 든다. 계약과 불변식은 Meyer(1997), 예외 안전 보장은 Sutter(1999), 격리와 감독은 Armstrong 박사논문(2003)이다.[](source:eh-found) 이 문헌들이 규칙을 어떻게 도출했는지는 원문에 명시 없음.

## 적용하면 무엇이 달라지나 {#before-after}

아래 세 사례는 분석자가 규칙을 설명하려고 지어낸 예시다(설명용 예시). 어떤 규칙을 쓰는지는 원문의 문장이 뒷받침한다.

| 설명용 예시 | 규칙 없이 | 규칙을 적용하면 |
| --- | --- | --- |
| 쓰기가 중간에 실패한다 | `catch`에서 경고 로그만 남기고 같은 인스턴스로 다음 쓰기를 계속한다 {bad:복구 아님} | 인스턴스 소유자가 전제 조건을 보장하지 못하면 의존 작업을 멈추고 그 인스턴스를 버린다 {good:소유자 판단}[](source:eh-catch) |
| 타임아웃을 구분해야 한다 | 오류 메시지에 "timeout"이 있는지 문자열로 찾는다 {bad:메시지 파싱} | 타임아웃을 판별자가 있는 선언된 타입으로 던지고 그 판별자로 분기한다 {good:안정적 정체성}[](source:eh-typed) |
| 저장 결과를 알 수 없다 | 화면에 "저장됨"을 띄우거나 아무것도 띄우지 않는다 {bad:성공 주장·숨김} | 영향, 불확실성, 시스템의 처리, 안전한 다음 단계를 보이는 곳에 적는다 {good:보이는 보고}[](source:eh-visible) |

판정: 이 스킬은 코드를 만들거나 파일을 쓰라는 지시가 없는 원칙형 스킬이다. 에이전트의 행동 변화는 "무엇을 정의하고 무엇을 주장하지 않는가"에서 나타난다.[](source:eh-intro)[](source:eh-visible)

## 흐름 속 위치 {#position}

이 스킬은 묶음 `review`와 `client-ui` 두 곳에 속한다. 이 스킬이 다른 스킬로 넘기는 관계는 없다. 대신 `dsh-code-review`와 `dsh-client-ui-ux`가 이 스킬의 원칙을 불러 쓴다.[](source:rel-eh)[](source:rel-eh2)

@workflow id=error-position title="dsh-error-handling 앞"
| hub | dsh-code-review | security |
| ui | dsh-client-ui-ux | frontend |
| me | dsh-error-handling | backend |
| hub > me | 바뀐 실패 경로 | emphasis |
| ui > me | 실패 보고 | emphasis |

| rel-id | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| r04 | `dsh-code-review`가 넘긴 바뀐 실패 경로 | 리뷰 지적 | 상태 소유자가 이후 작업의 전제 조건을 보장하지 않으면 `catch-and-continue`(오류를 잡고 계속 진행)를 거부한다(내부 위임)[](source:rel-eh) |
| r31 | `dsh-client-ui-ux`가 넘긴 실패 보고 | 현지화되고 실행 가능한 보이는 보고 규칙 | UI 스킬이 이 스킬의 오류 보고 절을 적용한 다음, 메시지 수명에 따라 보일 자리를 고른다(내부 위임)[](source:ui-eh) |

전체 흐름은 `deepseek-harness/_group-review/review.html`과 `deepseek-harness/_group-client-ui/client-ui.html`에 있다. 관계 근거는 `deepseek-harness/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 1개. 이 폴더에는 다른 텍스트 파일이 없다.
- 대조한 다른 파일: `r31` 확인을 위해 `dsh-client-ui-ux/SKILL.md` 34행만 읽었다. 이 줄이 오류 보고 절을 적용하라고 한다. 그 스킬의 나머지는 이 페이지의 분석 대상이 아니다.
- 제외한 파일: 없음. 번역본도 없다.
- 범위 밖: 원문에 deepseek-harness 저장소 밖으로 가는 `../../../docs/...` 링크는 없다. 패키지의 오류 관례 문서는 원문이 가리키지 않아 확인하지 않았다.
- 원문 비교: 같은 이름의 다른 컬렉션 사본이 없다(원장 기준).
- 실행하지 않았다. 규칙 적용은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"패키지 오류 관례"가 무엇인지, API 문서의 어디에 보장을 적는지는 원문에 명시 없음. 위 판단 그림의 순서는 분석자가 규칙을 재배열한 것이라 에이전트가 이 순서로 판단한다는 보장은 없다. "기본으로 켜진 접근 가능한 로그"의 기준도 원문에 명시 없음.
