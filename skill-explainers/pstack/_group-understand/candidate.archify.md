# 코드 이해 묶음(understand)은 어떻게 이어지나 {#understand-group}

이 묶음은 코드를 바꾸기 전에 이해하게 해 주는 스킬 다섯 개다. 직접 조사하는 스킬은 `how`와 `why` 둘이다. `teach`, `recall`, `blast-radius`는 `how`와 `why`를 불러 쓰거나 같은 규칙을 빌려 쓴다.[](source:teach-run)[](source:recall-why)[](source:br-why)

- `how`는 코드가 무엇을 어떻게 하는지, `why`는 왜 그런 모양인지 답한다. 두 스킬은 서로를 짝으로 가리킨다.[](source:why-pair)[](source:how-fm)
- `teach`는 `how`와 `why`를 실제로 실행하고, 결과를 엮어 쉽게 설명한다.[](source:teach-run)
- `recall`은 주제가 기능·파일·하위 시스템·버그를 가리키면, 기본으로 `why`의 조사 담당을 돌린다.[](source:recall-why)
- `blast-radius`는 `why` 2단계를 써서 PR과 commit을 가져오고, 변경이 크거나 넓으면 `arena`를 돌린다.[](source:br-why)[](source:br-arena)

@answer scope="pstack/understand 묶음 · 스킬 5개와 호출 대상의 SKILL.md · 커밋 5760176 · 관계는 relations.md의 rel-id 기준"
@meta locale=ko
@source how-fm title="pstack/how/SKILL.md · 3077B · frontmatter" path=pstack/how/SKILL.md lines=1:5
@source how-model title="pstack/how/SKILL.md · 모델 규칙" path=pstack/how/SKILL.md lines=11:11
@source why-fm title="pstack/why/SKILL.md · 10360B · frontmatter" path=pstack/why/SKILL.md lines=1:5
@source why-pair title="pstack/why/SKILL.md · how 구분" path=pstack/why/SKILL.md lines=11:11
@source why-model title="pstack/why/SKILL.md · 모델 규칙" path=pstack/why/SKILL.md lines=13:13
@source why-anchor title="pstack/why/SKILL.md · Step 2 코드 기준점" path=pstack/why/SKILL.md lines=25:34
@source why-inv title="pstack/why/SKILL.md · Step 3 조사 담당 모델" path=pstack/why/SKILL.md lines=80:85
@source why-syn title="pstack/why/SKILL.md · 종합 담당 모델" path=pstack/why/SKILL.md lines=125:129
@source why-present title="pstack/why/SKILL.md · 확신도 표현 유지" path=pstack/why/SKILL.md lines=140:140
@source teach-fm title="pstack/teach/SKILL.md · 5623B · frontmatter" path=pstack/teach/SKILL.md lines=1:5
@source teach-run title="pstack/teach/SKILL.md · how·why 실행" path=pstack/teach/SKILL.md lines=11:11
@source teach-par title="pstack/teach/SKILL.md · 병렬 실행과 why 범위" path=pstack/teach/SKILL.md lines=14:14
@source teach-unslop title="pstack/teach/SKILL.md · unslop 적용" path=pstack/teach/SKILL.md lines=19:19
@source recall-fm title="pstack/recall/SKILL.md · 5212B · frontmatter" path=pstack/recall/SKILL.md lines=1:5
@source recall-route title="pstack/recall/SKILL.md · Step 1 분류" path=pstack/recall/SKILL.md lines=17:17
@source recall-fan title="pstack/recall/SKILL.md · Step 3 채팅 기록 조사" path=pstack/recall/SKILL.md lines=19:19
@source recall-why title="pstack/recall/SKILL.md · Step 4 공유 기록 조사" path=pstack/recall/SKILL.md lines=20:20
@source recall-unslop title="pstack/recall/SKILL.md · 요약 작성" path=pstack/recall/SKILL.md lines=33:33
@source br-fm title="pstack/blast-radius/SKILL.md · 3851B · frontmatter" path=pstack/blast-radius/SKILL.md lines=1:5
@source br-pair title="pstack/blast-radius/SKILL.md · how·why 구분" path=pstack/blast-radius/SKILL.md lines=11:11
@source br-why title="pstack/blast-radius/SKILL.md · Step 1 why 2단계 사용" path=pstack/blast-radius/SKILL.md lines=33:33
@source br-risk title="pstack/blast-radius/SKILL.md · Step 4 위험 판단 규칙" path=pstack/blast-radius/SKILL.md lines=36:36
@source br-arena title="pstack/blast-radius/SKILL.md · Step 6 arena" path=pstack/blast-radius/SKILL.md lines=38:38
@source br-unslop title="pstack/blast-radius/SKILL.md · unslop 적용" path=pstack/blast-radius/SKILL.md lines=48:48
@source help-table title="pstack/poteto-help/SKILL.md · 12884B · 이해 스킬 표 행" path=pstack/poteto-help/SKILL.md lines=61:65
@source help-close title="pstack/poteto-help/SKILL.md · 헷갈리는 짝 구분" path=pstack/poteto-help/SKILL.md lines=92:96
@source setup-roles title="pstack/setup-pstack/SKILL.md · 5548B · how·why 역할 줄" path=pstack/setup-pstack/SKILL.md lines=55:58
@source pm-how title="pstack/poteto-mode/SKILL.md · 20559B · how 트리거" path=pstack/poteto-mode/SKILL.md lines=19:19
@source pm-pickup title="pstack/poteto-mode/SKILL.md · Session pickup 플레이북" path=pstack/poteto-mode/SKILL.md lines=143:143
@source arch-ground title="pstack/architect/SKILL.md · 5675B · Phase A" path=pstack/architect/SKILL.md lines=23:25
@source arena-fm title="pstack/arena/SKILL.md · 4973B · frontmatter" path=pstack/arena/SKILL.md lines=1:5
@source unslop-fm title="pstack/unslop/SKILL.md · 6015B · frontmatter만 확인" path=pstack/unslop/SKILL.md lines=1:5
@source nc-howwhy title="pstack/no-comments/SKILL.md · 2560B · Step 2 how·why 실행" path=pstack/no-comments/SKILL.md lines=20:20
@source why-skip title="pstack/why/SKILL.md · 조사 담당 건너뛰기 사유" path=pstack/why/SKILL.md lines=114:121
@source automate-fm title="pstack/automate-me/SKILL.md · 7164B · frontmatter만 확인" path=pstack/automate-me/SKILL.md lines=1:5

## 누가 누구를 부르나 {#flow span=12}

@workflow id=understand-flow title="understand 묶음 위임 관계"
| teach | teach | frontend |
| recall | recall | frontend |
| blast | blast-radius | frontend |
| how | how | backend |
| why | why | backend |
| arena | arena | external |
| teach > how | 병렬 | emphasis |
| teach > why | 좁게 | emphasis |
| recall > why | 현황 | |
| blast > why | 2단계 | |
| blast > arena | 큰 변경 | dashed |

@steps id=understand-steps
| s-teach | teach | `teach`가 사람이 실제로 이해하도록 설명한다. `how`와 `why`를 병렬로 돌리고, 둘의 결과를 엮어 쉬운 설명 하나로 만든다. | understand-flow | teach |
| s-recall | recall | `recall`이 최근 작업 맥락을 되살린다. 자기 채팅 기록은 나눠서 조사하고, 공유 기록은 `why`의 조사 담당에게 맡긴다. | understand-flow | recall |
| s-blast | blast-radius | `blast-radius`가 diff 밖에서 깨질 것을 찾는다. 변경이 안전하다는 근거가 되는 사실 하나를 코드를 돌려서 증명한다. | understand-flow | blast |
| s-how | how | `how`는 읽기 전용 서브에이전트로 코드가 지금 어떻게 동작하는지 조사해서 설명한다. 다른 스킬은 부르지 않는다. | understand-flow | how |
| s-arena | arena | `arena`는 design-review 묶음의 스킬이다. 같은 질문을 여러 모델에 맡기고 답을 합친다. | understand-flow | arena |
| s-why | why | `why`는 코드가 왜 이런 모양인지 답한다. 출처별 조사 담당을 병렬로 띄우고, 답에 근거와 확신도를 붙인다. | understand-flow | why |

`how`와 `why`의 내부 단계는 `pstack/how/how.html`, `pstack/why/why.html`에 있다. 나머지는 `pstack/teach/teach.html`, `pstack/recall/recall.html`, `pstack/blast-radius/blast-radius.html`에 있다. `arena`는 `pstack/_group-design-review/design-review.html`이 다룬다.

## 어떤 질문에 어떤 스킬을 쓰나 {#compare}

| 스킬 | 답하는 질문 | 다른 스킬 사용 |
| --- | --- | --- |
| `how` | 코드가 지금 어떻게 동작하나, 새 코드는 어디에 두나[](source:help-table) | 없음(서브에이전트만 띄운다) |
| `why` | 코드가 왜 이런 모양인가, 수치는 어디서 왔나[](source:help-table) | 없음(출처별 조사 담당을 띄운다) |
| `teach` | 변경이나 하위 시스템을 쉬운 말로 이해하기[](source:help-table) | `how`, `why`를 실제로 실행 {good:둘을 엮음} |
| `recall` | 한 주제에 대한 자기 최근 작업 따라잡기[](source:help-table) | `why`의 조사 담당 |
| `blast-radius` | 작은 변경이 바깥에서 무엇을 깨뜨릴 수 있나[](source:help-table) | `why` 2단계, 큰 변경이면 `arena` |

`poteto-help`는 헷갈리는 짝을 이렇게 가른다.[](source:help-close) `how`는 코드가 하는 일을, `why`는 그 이유를 설명한다. `teach`는 둘 중 하나나 둘 다 돌려 쉽게 설명한다.

`interrogate`는 diff 자체를 리뷰하고, `blast-radius`는 diff 밖의 파손을 찾는다. `recall`은 최근 여러 채팅에 걸친 맥락을 되살리고, 특정 채팅 하나를 이어받는 일은 Session pickup 플레이북이 맡는다.

## 관계와 조건 {#relations}

| rel-id | from → to | 종류 | 조건·강도 | 그림 |
| --- | --- | --- | --- | --- |
| r40 | `how` → `why` | 참고 | 동기를 묻는 질문은 `why`로 안내한다[](source:how-fm) | 생략(같은 짝) |
| r41 | `why` → `how` | 참고 | `how`의 짝. `how`는 무엇을·어떻게, `why`는 왜[](source:why-pair) | 생략(같은 짝) |
| r42 | `teach` → `how` | 내부 위임 | `how`를 실제로 실행하고, `why`와 병렬로 돌린다. 변경이 작으면 하나만 써도 된다[](source:teach-run)[](source:teach-par) | 병렬 간선 |
| r43 | `teach` → `why` | 내부 위임 | 기본으로는 `why`에 좁게 묻는다(전체 조사는 느리다). `why`가 붙인 확신도 표현은 고치지 않는다[](source:teach-run)[](source:teach-par) | 좁게 간선 |
| r44 | `teach` → `unslop` | 내부 위임 | 모든 응답에 적용한다[](source:teach-unslop) | 생략 |
| r45 | `recall` → `why` | 내부 위임 | 주제가 기능·파일·하위 시스템·버그를 가리키면 기본으로 실행한다. `why` 전체가 아니라 조사 담당과 갈래별 플레이북만 빌린다. 질문을 "지금 무엇이 열려 있나"로 바꿔 넘긴다. 종합 단계를 거치는지는 원문에 명시 없음[](source:recall-why) | 현황 간선 |
| r46 | `recall` → Session pickup 플레이북, `automate-me` | 넘김 | 먼저 분류한다. 특정 채팅 하나를 이어받는 일이면 Session pickup으로, 습관을 스킬로 굳히는 일이면 `automate-me`로 넘긴다[](source:recall-route)[](source:pm-pickup) | 생략 |
| r47 | `recall` → `unslop` | 내부 위임 | 요약을 쓸 때 적용한다[](source:recall-unslop) | 생략 |
| r48 | `blast-radius` → `how`, `why` | 참고 | 짝 스킬. `how`는 무엇을 하나, `why`는 왜, `blast-radius`는 다른 곳에서 무엇이 깨지나[](source:br-pair) | 생략 |
| r49 | `blast-radius` → `why` | 내부 위임(명시-역할) | `why` 2단계(코드 기준점 만들기)를 써서 PR과 commit을 가져온다. 위험을 판단하는 규칙도 `why`와 같다[](source:br-why)[](source:br-risk)[](source:why-anchor) | 2단계 간선 |
| r50 | `blast-radius` → `arena` | 내부 위임 | 크거나 넓은 변경일 때만[](source:br-arena)[](source:arena-fm) | 큰 변경 간선 |
| r51 | `blast-radius` → `unslop` | 내부 위임 | 보고서를 쓸 때 적용한다[](source:br-unslop)[](source:unslop-fm) | 생략 |

r46의 `automate-me`는 습관을 개인 모드 스킬로 만드는 스킬이다.[](source:automate-fm) `unslop`은 여러 묶음에서 글을 쓸 때 공통으로 적용된다. 그래서 그림에서 뺐다.

## 묶음 밖에서 들어오는 호출 {#callers}

| rel-id | from → to | 종류 | 조건 |
| --- | --- | --- | --- |
| r01 | `poteto-mode` → `how` | 내부 위임 | 사소하지 않은 변경, 아키텍처 결정, "정말 확실해?"(의무형)[](source:pm-how) |
| r60 | `architect` → `how` | 내부 위임 | 첫 단계(Phase A)에서 새 코드가 닿는 모든 시스템에 실행한다. 구현이 어긋나면 다시 실행한다[](source:arch-ground) |
| r61 | `architect` → `why` | 내부 위임 | 설계가 소유권이나 계층을 다시 정할 때만 실행한다[](source:arch-ground) |
| r110 | `no-comments` → `how`, `why` | 내부 위임 | 2단계에서 판정 근거가 얇은 심볼에만 실행한다[](source:nc-howwhy) |

플레이북도 `how`나 `why`를 가리킨다. `how`가 나오는 플레이북은 bug-fix, feature, hillclimb, investigation, multi-phase-plan, perf-issue, refactoring이다. `why`가 나오는 플레이북은 bug-fix, investigation이다. 플레이북별 목록은 `pstack/relations.md`의 플레이북 표에 있다.

## 공유 상태 {#shared-state}

| 파일 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `~/.cursor/rules/pstack-models.mdc` | `setup-pstack` | `how`의 `how explorer`, `how explainer` 줄(r30)[](source:how-model)[](source:setup-roles) |
| 같은 파일 | `setup-pstack` | `why`의 `why investigators`, `why synthesizer` 줄(r31)[](source:why-model)[](source:why-inv)[](source:why-syn) |

규칙 파일이나 그 줄이 없으면 각 스킬의 기본 모델을 쓴다.[](source:how-model)[](source:why-model) `teach`, `recall`, `blast-radius`가 이 파일을 직접 읽는다는 내용은 원문에 명시 없음. `recall`이 채팅 기록 조사에 띄우는 서브에이전트는 "빠르고 싼 모델"로만 적혀 있고 역할 줄이 없다.[](source:recall-fan)

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: 묶음 스킬 5개의 `SKILL.md`. 관계 확인을 위해 `poteto-help`, `setup-pstack`, `poteto-mode`, `architect`, `no-comments`의 해당 줄과 `arena`, `unslop`, `automate-me`의 머리말(frontmatter)만 읽었다. 모두 원본이다.
- 읽지 않은 파일: 각 스킬의 `references/`. 스킬 내부 동작은 스킬 페이지가 다룬다.
- 제외한 파일: `*.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: r01, r30, r31, r40~r51, r60, r61, r110의 출처 줄을 원문과 대조했다. 종류와 조건이 원장과 같다.
- 모든 스킬이 `disable-model-invocation: true`다. 사용자가 이름을 입력하거나 다른 스킬이 부를 때만 켜진다.[](source:how-fm)[](source:why-fm)[](source:teach-fm)[](source:recall-fm)[](source:br-fm)
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 스킬 문서가 지시하는 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=warning title="원문끼리 충돌하는 곳"
`teach`는 `why`를 좁게 부르고, 건너뛴 갈래는 `why`의 규칙대로 기록하게 한다.[](source:teach-par) 그런데 `why`가 인정하는 건너뛰기 사유는 "그 갈래를 조회할 MCP 없음"과 "무관함을 증명함" 두 가지뿐이다.[](source:why-skip) 범위를 좁혔다는 사유가 여기에 드는지는 원문에 명시 없음.

@callout level=open-question title="확인하지 못한 것"
`recall`이 `why`의 조사 담당을 빌린 뒤 `why`의 종합 단계까지 거치는지는 원문에 명시 없음.[](source:recall-why)
