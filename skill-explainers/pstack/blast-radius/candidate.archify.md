# blast-radius 스킬은 에이전트를 어떻게 바꾸나 {#blast-radius-skill}

`blast-radius`를 켜면, 에이전트는 변경의 영향 범위(blast radius)를 그럴듯한 글로 정리하고 끝내지 않는다. 에이전트는 변경이 안전한 이유가 되는 사실 한두 개를 찾아, 실제 코드를 돌려 증명한다.[](source:writeup)

- 호출자를 나열하는 것은 이 스킬의 일이 아니다. `grep`이 1초면 찾는다. 에이전트가 찾을 것은 `grep`이 보여 주지 않는 파손이다.[](source:core)
- 에이전트는 안전 사실마다 증명 단계 다섯 중 어디까지 갔는지 밝힌다. 말로만 한 것은 가치가 없다.[](source:ladder)
- 에이전트는 라이브러리 소스, 실행 시점, 직렬화된 데이터처럼 이름 검색이 놓치는 곳을 따라간다.[](source:s3)
- 에이전트는 증명하지 못한 안전 사실을 "증명 안 됨(unproven)"으로 표시해 돌려준다.[](source:out)

@answer scope="pstack/blast-radius · 원본 텍스트 파일 1개 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/blast-radius/SKILL.md · 3851B · 본문(frontmatter)" path=pstack/blast-radius/SKILL.md lines=1:5
@source core title="pstack/blast-radius/SKILL.md · 목적, how·why 관계" path=pstack/blast-radius/SKILL.md lines=9:13
@source writeup title="pstack/blast-radius/SKILL.md · 글을 믿지 마라" path=pstack/blast-radius/SKILL.md lines=15:17
@source ladder title="pstack/blast-radius/SKILL.md · 증명 단계" path=pstack/blast-radius/SKILL.md lines=19:29
@source s1 title="pstack/blast-radius/SKILL.md · 1단계 변경 읽기" path=pstack/blast-radius/SKILL.md lines=33:33
@source s2 title="pstack/blast-radius/SKILL.md · 2단계 안전 사실 찾기" path=pstack/blast-radius/SKILL.md lines=34:34
@source s3 title="pstack/blast-radius/SKILL.md · 3단계 grep 너머" path=pstack/blast-radius/SKILL.md lines=35:35
@source s4 title="pstack/blast-radius/SKILL.md · 4단계 위험 평가" path=pstack/blast-radius/SKILL.md lines=36:36
@source s5 title="pstack/blast-radius/SKILL.md · 5단계 증명" path=pstack/blast-radius/SKILL.md lines=37:37
@source s6 title="pstack/blast-radius/SKILL.md · 6단계 큰 변경" path=pstack/blast-radius/SKILL.md lines=38:38
@source out title="pstack/blast-radius/SKILL.md · 돌려줄 것" path=pstack/blast-radius/SKILL.md lines=40:46
@source style title="pstack/blast-radius/SKILL.md · 작성 규칙과 답" path=pstack/blast-radius/SKILL.md lines=48:50
@source why-anchor title="pstack/why/SKILL.md · 10360B · Step 2 코드 기준점" path=pstack/why/SKILL.md lines=25:56
@source arena-fm title="pstack/arena/SKILL.md · 4973B · description" path=pstack/arena/SKILL.md lines=1:5
@source help-row title="pstack/poteto-help/SKILL.md · 12884B · blast-radius 안내 줄" path=pstack/poteto-help/SKILL.md lines=65:65
@source help-diff title="pstack/poteto-help/SKILL.md · interrogate와의 구분" path=pstack/poteto-help/SKILL.md lines=95:95

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 그래서 이 스킬은 사용자가 `/blast-radius`를 입력할 때 켜진다. pstack 안에서 이 스킬을 실행 단계로 부르는 스킬은 찾지 못했다. `poteto-help`가 "작은 `diff`가 바깥에서 무엇을 깰지 알고 싶을 때" 쓰라고 안내한다.[](source:help-row)

| 비교 | 묻는 것 |
| --- | --- |
| `how` | 코드가 무엇을 하나 |
| `why` | 왜 그렇게 생겼나 |
| `blast-radius` | 다른 곳에서 무엇을 깨나[](source:core) |
| `interrogate` | diff 자체를 리뷰한다. `blast-radius`는 diff 바깥의 파손을 찾는다[](source:help-diff) |

원문이 드는 사용 장면은 "X의 영향 범위", "이게 무엇을 깰 수 있나", 아직 믿지 못하는 작은 diff 리뷰다.[](source:core)

## 안전하다는 말은 어디까지 증명했나 {#ladder}

그럴듯한 영향 범위 글은 사실이든 아니든 똑같이 설득력 있게 읽힌다. 그래서 에이전트는 글을 내놓지 않고, 글 전체가 기대는 사실 한두 개를 코드로 증명한다.[](source:writeup)

| 단계 | 한 일 | 원문의 평가 |
| --- | --- | --- |
| 1 말함 | 그렇다고 말했다 | 그것만으로는 {bad:가치 없음} |
| 2 줄 지목 | 실제 `file:line`이나 라이브러리 자체 소스를 가리켰다 | - |
| 3 불가능 증명 | 실패 경로를 한 단계씩 따라가 나쁜 경우에 닿지 않음을 보였다 | - |
| 4 실행 | 실제 코드를 부르는 스크립트나 테스트를 돌렸다. 틀리면 크게 실패한다 | 보통 여기까지 {good:목표} |
| 5 재현 | 실행 중인 앱에서 재현했다 | - |

에이전트는 안전 사실마다 싸게 갈 수 있는 데까지 내려가고, 어디서 멈췄는지 밝힌다.[](source:ladder) 4단계는 보통 작은 스크립트 하나다. 이 스크립트는 앱이 쓰는 라이브러리를 그대로 불러와, 걱정하는 함수를 정확히 호출한다.[](source:ladder)

판정: 이 사다리는 `why`의 확신도 단계와 다른 축이다. `why`는 동기에 대한 근거의 출처를 재고, 이 사다리는 안전 사실이 얼마나 실행으로 확인됐는지를 잰다.[](source:ladder)[](source:s4) 4단계의 "목표" 표시는 원문의 "보통 4단계는 스크립트 하나"에서 분석자가 붙인 것이다.

## 어떻게 진행하나 {#flow}

@workflow id=br-flow title="blast-radius 진행 흐름"
| read | 변경 읽기 | backend |
| fact | 핵심 사실 | backend |
| beyond | grep 너머 | backend |
| risk | 위험 | backend |
| prove | 사실 증명 | backend |
| report | 보고 | frontend |
| read > fact | | |
| fact > beyond | | |
| beyond > risk | | |
| risk > prove | | |
| prove > report | | emphasis |

@steps id=br-steps
| s-read | 변경 읽기 | 에이전트는 `diff`와 추가·변경·삭제된 이름, 코드가 이제 다르게 하는 일을 읽는다. `diff`가 드러내지 않는 부분도 포함한다. PR과 commit은 `why`의 2단계(코드 기준점)로 가져온다. | br-flow | read |
| s-fact | 핵심 사실 | 위험해 보이는 변경은 대개 사실 하나 덕에 안전하다. 예: "이 호출은 이미 죽은 캐시 항목만 지운다". 그 사실이 맞으면, 위험 사례 대부분이 한꺼번에 풀린다. 에이전트는 시간을 여기에 쓰고, 긴 "혹시" 목록에는 쓰지 않는다. | br-flow | fact |
| s-beyond | grep 너머 | 에이전트는 호출하는 라이브러리 소스를 읽고 고정 버전과 로컬 패치를 확인한다. 실행 시점(마이크로태스크, 언마운트와 정리, Solid·React 차이)을 따진다. API 응답 JSON, DB 열, 전송 형식, 같은 바이트를 읽는 다른 언어, 기능 플래그, 세 단계 아래 코드까지 따라간다. | br-flow | beyond |
| s-risk | 위험 | 에이전트는 위험마다 실제 발생 가능성과 실제 비용을 매긴다. 확인된 위험과 확인 후 해소된 위험을 따로 적는다. 실제 `file:line`을 인용한다. 검색에서 아무것도 못 찾았다는 결과도 답이다. 없는 호출자나 API 이름을 지어내지 않는다. | br-flow | risk |
| s-prove | 사실 증명 | 에이전트는 실제 코드를 돌리는 스크립트나 테스트를 쓰고, 돌리고, 결과를 붙인다. | br-flow | prove |
| s-report | 보고 | 에이전트는 아래 다섯 절로 돌려준다. 안전 사실마다, 증명했으면 증명했다고, 못 했으면 "증명 안 됨"으로 표시한다. | br-flow | report |

변경이 크거나 넓게 퍼졌으면, 6단계에서 `arena`를 돌린다. `arena`는 여러 모델에 같은 질문을 하고 답을 합친다. 모델마다 잡는 실제 버그가 다르기 때문이다. 단계 원문은 `SKILL.md`의 Steps 1~6이다.[](source:s1)[](source:s2)[](source:s3)[](source:s4)[](source:s5)[](source:s6)

## 무엇을 돌려주나 {#output}

| 절 | 담을 것 |
| --- | --- |
| 하는 일(What it does) | 무엇이 바뀌었나. 눈에 안 띄는 부분까지 |
| 안전 사실(The one fact) | 그 사실, 증명 단계 몇까지 갔나, 증거. 증명 못 했으면 "증명 안 됨" |
| 위험(Risks) | 깨지는 방식, `file:line`, 가능성과 피해, 확인 방법. 중요한 것은 증거를 붙인다 |
| 해소(Cleared) | 확인했고 괜찮은 것과 그 이유 |
| 병합 전(Before you merge) | 실제 버그를 잡는 가장 싼 테스트나 재현. 직접 쓴 스크립트 포함 |

다섯 절은 원문의 출력 목록을 따른다.[](source:out) 에이전트는 글을 `unslop`으로 다듬고 실제 코드를 인용한다. 글이 공개될 곳에 가기 전에는 사적인 내용을 지운다.[](source:style)

| 규칙 | 원문의 강도 |
| --- | --- |
| 호출자 나열로 끝내지 않는다[](source:core) | 금지 |
| 영향 범위 글만 돌려주지 않는다. 사실을 코드로 증명한다[](source:writeup) | 의무 |
| 없는 호출자나 API 이름을 지어내지 않는다[](source:s4) | 금지 |
| 증명 스크립트를 돌린 결과를 붙인다[](source:s5) | 의무 |
| 큰 변경은 `arena`로 돌린다[](source:s6) | 조건부 의무 |

@callout level=warning title="읽기만 하는 스킬이 아니다"
5단계는 스크립트나 테스트를 써서 실행하라고 한다.[](source:s5) `how`처럼 `readonly`로 제한하는 문장은 원문에 명시 없음. 스크립트를 어디에 두고 남길지도 원문에 명시 없음. "병합 전" 절에 그 스크립트를 넣으라고만 한다.[](source:out)

## 흐름 속 위치 {#position}

@workflow id=br-position title="blast-radius 앞뒤의 스킬"
| p-user | 사용자 | external |
| p-br | blast-radius | backend |
| p-why | why 2단계 | backend |
| p-arena | arena | backend |
| p-unslop | unslop | backend |
| p-user > p-br | 변경 | |
| p-br > p-why | 변경 | emphasis |
| p-br > p-arena | 큰 변경 | emphasis |
| p-br > p-unslop | 보고서 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| 사용자가 준 변경 | `why` 2단계로 PR·commit 목록을 얻는다. 위험 판단도 `why`와 같은 규칙 | 1단계, 4단계 | r49 |
| 크거나 넓은 변경 | `arena`에 같은 질문 → 합친 답 | 크거나 넓은 변경일 때만 | r50 |
| 보고서 초안 | `unslop`으로 다듬은 글 | 보고서 작성 | r51 |
| - | - | `how`·`why`의 짝. 무엇을 하나 / 왜 / 무엇을 깨나 | r48 |

이 스킬은 `why` 전체를 부르지 않고, 코드 기준점을 만드는 2단계만 빌린다.[](source:s1)[](source:why-anchor) `arena`는 같은 과제에 후보 여러 개를 돌려 base(기반이 되는 후보)를 고르고 좋은 부분을 graft(진 후보의 장점을 base에 합치기)하는 스킬이다.[](source:arena-fm)

전체 흐름은 `pstack/_group-understand/understand.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 하나. 이 스킬에는 다른 원본 파일이 없다.
- 관계 확인용으로 `why/SKILL.md`, `arena/SKILL.md`, `poteto-help/SKILL.md` 일부를 읽었다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: `verification-skills/pstack/blast-radius/SKILL.md`와 원문이 같다(`shasum` 일치). 두 폴더 모두 참조 파일이 없다. 그래서 내부 동작 분석은 그쪽에도 그대로 맞는다. 소속 묶음과 흐름 속 위치는 그 경로에서 따로 확인해야 한다.
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"크거나 넓은 변경"의 기준은 원문에 명시 없음. `arena`에 어떤 모델을 몇 개 쓸지도 이 스킬은 정하지 않는다. 판정: `arena` 자체 규칙을 따른다고 읽는다. 증명 단계를 "싸게 갈 수 있는 데까지"라고만 하므로, 비용이 클 때 몇 단계에서 멈춰도 되는지도 원문에 명시 없음.[](source:ladder)[](source:s6)
