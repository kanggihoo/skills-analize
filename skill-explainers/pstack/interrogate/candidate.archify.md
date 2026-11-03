# interrogate 스킬은 에이전트를 어떻게 바꾸나 {#interrogate-skill}

`interrogate`를 쓰면 에이전트는 변경을 혼자 리뷰하지 않는다. 설정된 모델마다 읽기 전용 리뷰어를 하나씩 띄워 같은 프롬프트로 공격적으로 리뷰하게 하고, 그 결과를 선임 리뷰어로서 걸러 판정 하나로 낸다.[](source:skill-intro)

- 적대적 신호는 역할 연기가 아니라 모델의 다양성에서 나온다고 본다.[](source:skill-intro)
- 결과물은 종합 판정이다. 변경을 자동으로 적용하지 않는다.[](source:skill-intro)
- 의도가 불확실하면 리뷰어를 띄우기 전에 사용자에게 묻는다.[](source:skill-intent)
- 모든 지적을 네 칸(Act on, Consider, Noted, Dismissed)으로 나누고, 버린 지적도 이유와 함께 보여 준다.[](source:skill-judge)[](source:lead-calib)

@answer scope="pstack/interrogate · 원본 텍스트 파일 5개 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/interrogate/SKILL.md · 5054B · 본문(frontmatter)" path=pstack/interrogate/SKILL.md lines=1:5
@source skill-intro title="pstack/interrogate/SKILL.md · 목적" path=pstack/interrogate/SKILL.md lines=9:11
@source skill-scope title="pstack/interrogate/SKILL.md · Step 1" path=pstack/interrogate/SKILL.md lines=13:21
@source skill-intent title="pstack/interrogate/SKILL.md · Step 2" path=pstack/interrogate/SKILL.md lines=23:32
@source skill-spawn title="pstack/interrogate/SKILL.md · Step 3 모델과 매개변수" path=pstack/interrogate/SKILL.md lines=34:47
@source skill-fallback title="pstack/interrogate/SKILL.md · Step 3 거부 시 대체" path=pstack/interrogate/SKILL.md lines=49:49
@source skill-prompt title="pstack/interrogate/SKILL.md · Step 3 프롬프트 채우기" path=pstack/interrogate/SKILL.md lines=51:57
@source skill-synth title="pstack/interrogate/SKILL.md · Step 4" path=pstack/interrogate/SKILL.md lines=59:67
@source skill-judge title="pstack/interrogate/SKILL.md · Step 5" path=pstack/interrogate/SKILL.md lines=69:85
@source skill-out title="pstack/interrogate/SKILL.md · Output Format" path=pstack/interrogate/SKILL.md lines=87:110
@source reviewer title="pstack/interrogate/references/reviewer-prompt.md · 2491B · 리뷰어 프롬프트 양식" path=pstack/interrogate/references/reviewer-prompt.md lines=1:70
@source reviewer-intent title="pstack/interrogate/references/reviewer-prompt.md · 의도 고정" path=pstack/interrogate/references/reviewer-prompt.md lines=9:15
@source reviewer-sev title="pstack/interrogate/references/reviewer-prompt.md · 심각도와 형식" path=pstack/interrogate/references/reviewer-prompt.md lines=29:57
@source rubric title="pstack/interrogate/references/rubric.md · 5025B · 리뷰 기준" path=pstack/interrogate/references/rubric.md lines=1:77
@source cq title="pstack/interrogate/references/code-quality-review.md · 5217B · 코드 품질 관점" path=pstack/interrogate/references/code-quality-review.md lines=1:47
@source cq-dims title="pstack/interrogate/references/code-quality-review.md · 차원 0~7" path=pstack/interrogate/references/code-quality-review.md lines=17:35
@source cq-bar title="pstack/interrogate/references/code-quality-review.md · 승인 기준" path=pstack/interrogate/references/code-quality-review.md lines=41:43
@source lead title="pstack/interrogate/references/lead-judgment.md · 3465B · 선임 판단 틀" path=pstack/interrogate/references/lead-judgment.md lines=1:58
@source lead-filter title="pstack/interrogate/references/lead-judgment.md · 거르는 원칙" path=pstack/interrogate/references/lead-judgment.md lines=16:52
@source lead-calib title="pstack/interrogate/references/lead-judgment.md · 판정 보정" path=pstack/interrogate/references/lead-judgment.md lines=54:58
@source pm-trigger title="pstack/poteto-mode/SKILL.md · interrogate 호출 조건" path=pstack/poteto-mode/SKILL.md lines=24:24
@source architect-c title="pstack/architect/SKILL.md · interrogate 실행" path=pstack/architect/SKILL.md lines=49:49
@source setup-line title="pstack/setup-pstack/SKILL.md · interrogate reviewers 줄" path=pstack/setup-pstack/SKILL.md lines=65:65
@source pb-feature title="pstack/poteto-mode/playbooks/feature.md · 출시 전" path=pstack/poteto-mode/playbooks/feature.md lines=16:16
@source pb-pr title="pstack/poteto-mode/playbooks/opening-a-pr.md · 서브에이전트 PR" path=pstack/poteto-mode/playbooks/opening-a-pr.md lines=36:36
@source pb-bugfix title="pstack/poteto-mode/playbooks/bug-fix.md · 원인 확인" path=pstack/poteto-mode/playbooks/bug-fix.md lines=8:8
@source dup title="verification-skills/pstack/interrogate/SKILL.md · 동일 원문 사본" path=verification-skills/pstack/interrogate/SKILL.md lines=1:5

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/interrogate`를 입력하거나, 다른 스킬이 진행 중에 부를 때 켜진다. `description`의 "tear this apart" 같은 표현은 어떤 요청에 맞는지 보여 주는 예이고, 정확히 일치해야 켜지는 목록이 아니다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/interrogate` 입력 |
| `poteto-mode` | 설계에 이견이 있을 때, 출시 전(의무형)[](source:pm-trigger) |
| `architect` | 구현 전에 합친 스케치에 적대적 압박을 가하고 싶을 때(선택)[](source:architect-c) |
| Feature 플레이북 | 설계에 이견이 있으면 출시 전[](source:pb-feature) |
| Bug fix 플레이북 | 살아남은 원인을 런타임 근거로 확인한 뒤의 `architect`·`interrogate` 단계[](source:pb-bugfix) |
| Opening a PR 플레이북 | PR을 여는 서브에이전트가 `/deslop`, `/no-comments`와 함께 돌린다[](source:pb-pr) |

## 리뷰는 어떻게 진행되나 {#flow}

@workflow id=interrogate-flow title="interrogate 진행 흐름"
| lane prep | 준비 |
| lane review | 리뷰와 판정 |
| scope | 범위 정하기 | backend | prep |
| intent | 의도 분명? | backend | prep |
| ask | 사용자 질문 | frontend | prep |
| spawn | 리뷰어 띄우기 | security | review |
| synth | 종합 | backend | review |
| judge | 선임 판단 | backend | review |
| out | 판정 보고 | frontend | review |
| scope > intent | | |
| intent > spawn | 예 | emphasis |
| intent > ask | 아니오 | |
| ask > spawn | 답변 | |
| spawn > synth | 지적 | |
| synth > judge | | |
| judge > out | | |

@steps id=interrogate-steps
| s-scope | 범위 정하기 | Step 1. 사용자가 파일이나 `diff`를 가리키면 그것을 쓴다. 기능 브랜치면 `git diff main...HEAD`(또는 맞는 기반 브랜치)로 전체 변경을 모은다. 최근 작업을 언급하면 관련 파일을 모은다. 리뷰어가 코드를 이해하는 데 필요한 주변 파일도 함께 묶는다. | interrogate-flow | scope |
| s-intent | 의도 분명? | Step 2. 사용자 메시지, 커밋 메시지, PR 설명, 코드에서 의도를 끌어내 한 문단으로 쓴다. | interrogate-flow | intent |
| s-ask | 사용자 질문 | 의도가 불확실하면 진행하기 전에 사용자에게 묻는다. 이 스킬에서 사람이 개입하는 유일한 지점이다. | interrogate-flow | ask |
| s-spawn | 리뷰어 띄우기 | Step 3. 모든 리뷰어를 한 메시지에서 띄운다. `subagent_type: generalPurpose`, `readonly: true`. 리뷰어 프롬프트 양식에 의도, diff, 리뷰 기준, 코드 품질 관점을 채워 모두에게 똑같이 준다. | interrogate-flow | spawn |
| s-synth | 종합 | Step 4. 지적을 모두 파싱한다. 2개 이상의 모델이 따로 낸 지적이 가장 강한 신호다. 한 모델만 낸 지적도 읽되 무게를 낮춘다. 같은 문제를 다르게 쓴 것은 합치고 어느 모델이 냈는지 적는다. 모델끼리 정반대로 말하면 그 사실을 적는다. | interrogate-flow | synth |
| s-judge | 선임 판단 | Step 5. 에이전트는 중립적인 집계자가 아니라 실용적인 시니어 엔지니어다. `references/lead-judgment.md`를 읽고 지적마다 네 칸 중 하나로 나눈다. | interrogate-flow | judge |
| s-out | 판정 보고 | Intent, Reviewers, Act On, Consider, Noted, Dismissed, Agreement Map 순서로 낸다. 변경은 적용하지 않는다. | interrogate-flow | out |

## 리뷰어는 무엇을 보고 무엇을 내나 {#reviewer}

리뷰어 프롬프트는 의도 자체를 의심하지 말고 실행만 공격하라고 고정한다.[](source:reviewer-intent) 칭찬하지 않고, 찾은 것이 없으면 "no findings"라고 쓰고 멈춘다. 빈 리뷰도 정상 결과다.[](source:reviewer-sev)

| 지적 항목 | 내용 |
| --- | --- |
| 심각도 | `critical`(버그·데이터 손실·보안·근본적 고장), `warning`(당장 깨지진 않지만 고통을 줄 설계·유지보수 위험), `nit`(스타일·이름·작은 개선) |
| 위치 | 파일과 줄, 또는 함수 이름 |
| 지적 | 무엇이 문제인지 구체적으로 |
| 근거 | 왜 문제인지 추론을 보인다. 단정만 하지 않는다 |
| 제안 | 선택. 분명한 대안이 있을 때만 |

양식은 `reviewer-prompt.md`에서 왔다.[](source:reviewer-sev) 리뷰어는 두 자료를 관점으로 받는다. 맞지 않는 관점을 억지로 적용하지 않는다.[](source:reviewer)

| 리뷰 기준(`rubric.md`) | 핵심 질문 |
| --- | --- |
| Correctness | 의도대로 동작하나. 버그로 보이면 실행 경로를 추적해 보인다 |
| Root Causes vs. Symptoms | 증상을 덮는가, 원인을 고치는가. 바뀐 파일 밖도 읽는다 |
| Structural Integrity | 시스템에 맞게 들어가나. 쓸 데 없는 새 API와 옛 API를 함께 남기지 않는다 |
| Verification | 읽어서 동작을 알 수 있나. 대리 지표가 아니라 실제 값을 확인하나 |
| Complexity Budget | 복잡도가 값을 하나. 세 줄 중복이 섣부른 추상보다 낫다 |
| Security | 입력 경로를 코드에서 추적해 보인다 |

여섯 관점은 `rubric.md` 전체를 줄인 것이다.[](source:rubric)

| 코드 품질 관점(`code-quality-review.md`) | 내용 |
| --- | --- |
| 차원 0 | 구조를 과감하게 단순화하는 "code judo"를 찾는다 |
| 차원 1 | 1,000줄 미만 파일을 1,000줄 넘게 만들지 않는다. 아주 강한 이유가 있을 때만 예외 |
| 차원 2~4 | 기존 흐름에 즉석 분기를 끼워 넣지 않는다. 동작하는 코드도 더 깔끔하게. 마법 같은 코드보다 지루한 코드 |
| 차원 5~7 | 타입·경계를 분명히. 기존 계층과 헬퍼를 재사용. 이유 없는 순차 실행과 원자적이지 않은 갱신을 설계 냄새로 본다 |
| 승인 기준 | 동작이 맞아 보인다는 이유만으로 승인하지 않는다. 위 조건에 걸리면 작성자가 정당화하지 않는 한 막는 지적으로 본다 |

차원과 승인 기준은 해당 절에서 왔다.[](source:cq-dims)[](source:cq-bar) 출력은 구조적 퇴행과 놓친 단순화를 먼저, 파일 크기와 작은 가독성 문제를 나중에 둔다.[](source:cq)

## 선임 리뷰어는 지적을 어떻게 거르나 {#judgment}

| 칸 | 넣는 지적 |
| --- | --- |
| Act on | 실제 목표에 비춰 정확성·보안·유지보수성에 영향이 있는 문제. 실제 PR이라면 막을 것 {bad:막는 지적} |
| Consider | 타당하지만 지금 고칠 비용보다 큰지 확신이 없는 것. 사용자가 볼 가치가 있다 {caution:판단 필요} |
| Noted | 기술적으로 맞지만 지금 단계에서 조치할 것이 아닌 것 |
| Dismissed | 틀렸거나, 트집이거나, 맥락을 놓친 것. 짧은 이유를 붙인다 |

지적마다 어느 모델이 냈는지, 어느 칸인지, 한 줄 이유를 붙인다.[](source:skill-judge)

| 거르는 원칙 | 판단 |
| --- | --- |
| 트집 끌림 | 리뷰어가 큰 문제를 못 찾으면 사소한 지적을 부풀린다. 전부 nit이면 코드는 아마 괜찮다고 말한다 |
| 가정과 실제 | 호출하는 쪽이 실제로 `null`을 넘길 수 있을 때만 지적이다. 호출 위치를 추적한다 |
| 섣부른 추상 | 두 번째 방식으로 바뀔 일이 없으면 추상은 이르다 |
| "나라면 다르게" | 현재 방식의 구체적 문제를 보이지 않으면 버리고 이유를 적는다 |
| 맥락 부족 신호 | 작성자가 손대지 않은 코드에 대한 제안, 저장소 관례와 맞는 패턴 지적은 정중하게 버린다 |
| 받아들일 신호 | 여러 모델의 독립 합의, 구체적 실행 경로, 내 사고 모형의 빈틈. 보안과 정확성 지적은 한 모델만 내도 더 꼼꼼히 본다 |

원칙은 `lead-judgment.md`에서 왔다.[](source:lead-filter) 선임 리뷰어는 리뷰어가 모르는 대화 맥락(이미 버린 시도, 코드 밖 제약, 임시 골격, 다음 PR 계획)을 쓴다.[](source:lead)

@facts
| 기본 리뷰어 | A `claude-opus-5-5-max`, B `gpt-5.6-sol-max`, C `grok-4.7-xhigh-fast` |
| 강한 신호 | 2개 이상 모델이 독립적으로 낸 지적 |
| Act On 상한 | 5개를 넘으면 충분히 거르지 않은 것 |
| 심각도 | 3단계(`critical`, `warning`, `nit`) |
| 파일 크기 경고 | 1,000줄 경계를 넘길 때 |

Act On 상한과 Dismissed 칸의 역할은 판정 보정 절에서 왔다.[](source:lead-calib) Dismissed 절은 사용자가 판단을 뒤집을 수 있게 하는 신뢰 장치다.

## 모델 설정과 대체 규칙 {#models}

리뷰어는 `~/.cursor/rules/pstack-models.mdc`의 `interrogate reviewers` 줄에서 항목마다 하나씩 띄운다. 항목 수에 맞춰 A/B/C 이름표를 늘리거나 줄인다. 규칙이나 줄이 없으면 표의 기본값을 쓴다.[](source:skill-spawn)[](source:setup-line) 값이 `auto`나 `inherit-parent`면 `model`을 비워 부모 모델을 쓴다.[](source:skill-spawn)

| 상황 | 해야 할 일 |
| --- | --- |
| 설정 값을 Task 도구가 거부 | 같은 계열(`claude-*`, `gpt-*`, `grok-*`) 기본값으로 돌리고 알린다. 맞는 계열이 없으면 Reviewer A 기본값 |
| 기본값도 거부 | 오류 메시지의 유효한 이름 중 같은 계열의 가장 가까운 것(추론 단계가 가장 높은 것 우선)으로 띄운다 |
| 기본값이 거부된 뒤 | 기본값 표를 고치는 PR을 따로 연다. 리뷰를 이 문제로 막지 않는다 |
| 별칭 항목 | 거부된 이름으로 취급하지 않고 대체 규칙도 적용하지 않는다 |

대체 규칙은 Step 3 문단을 표로 옮긴 것이다.[](source:skill-fallback)

@callout level=warning title="리뷰 스킬 안에 PR을 여는 지시가 있다"
기본 모델 이름이 거부되면 기본값 표를 고치는 PR을 따로 열라고 한다.[](source:skill-fallback) 판정: 리뷰 대상 코드에는 손대지 않지만, 저장소에 쓰는 동작이 하나 숨어 있다. 어느 저장소에 여는지는 원문에 명시 없음.

## 흐름 속 위치 {#position}

@workflow id=interrogate-position title="interrogate 앞뒤의 스킬"
| caller | poteto-mode · architect | backend |
| interrogate | interrogate | backend |
| back | 부른 스킬로 복귀 | backend |
| caller > interrogate | 변경·스케치 | |
| interrogate > back | 판정 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 변경 | 리뷰 판정 | 설계에 이견이 있을 때, 출시 전 | r05 |
| `architect`의 설계 초안 | 리뷰 판정 | 선택. 구현 전 적대적 압박을 원할 때 | r63 |
| `pstack-models.mdc`의 `interrogate reviewers` 줄 | - | 줄이 없으면 기본 리뷰어 | r35 |

`interrogate`는 다른 pstack 스킬을 부르지 않는다. 판정을 받은 뒤 무엇을 고칠지는 부른 쪽이 정한다. 전체 흐름은 `pstack/_group-design-review/design-review.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `references/reviewer-prompt.md`, `references/rubric.md`, `references/code-quality-review.md`, `references/lead-judgment.md`. 다섯 파일 모두 원본이다.
- 호출 조건을 확인하려고 `poteto-mode`, `architect`, `setup-pstack`, 플레이북 3개의 해당 줄을 읽었다.
- 제외한 파일: `SKILL.KO.md`, `references/*.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: `verification-skills/pstack/interrogate`와 원문 동일. `SKILL.md`와 참고 파일 4개의 `shasum`이 모두 같다.[](source:dup) 사본 쪽 번역본 이름은 `*-KO.md`다.
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
리뷰어의 심각도(`critical`, `warning`, `nit`)와 선임 리뷰어의 네 칸을 어떻게 대응시키는지는 원문에 명시 없음.[](source:reviewer-sev)[](source:skill-judge)
`architect`는 합친 스케치에 이 스킬을 돌리라고 한다.[](source:architect-c) Step 1은 diff나 파일을 범위로 잡는다.[](source:skill-scope) 판정: 커밋되지 않은 스케치라면 사용자가 파일을 가리키는 경로로 들어가는 것으로 보인다.
