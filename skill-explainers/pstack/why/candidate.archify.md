# why 스킬은 에이전트를 어떻게 바꾸나 {#why-skill}

`why`를 쓰면, 에이전트는 "왜 이렇게 생겼나"를 코드만 읽고 짐작하지 않는다.[](source:skill-body) 에이전트는 근거 갈래마다 조사 담당을 따로 띄워 기록을 모은다.[](source:roster) 그러면 종합 담당이 그 근거를 확신도 다섯 단계로 나눠 답한다.[](source:syn-rules)

- 에이전트는 먼저 코드 기준점(code anchor)을 직접 만든다. 코드 기준점은 파일과 줄, 핵심 이름, 최근 commit, PR 번호를 모은 것이다.[](source:anchor)
- 에이전트는 근거를 일곱 갈래로 나눈다. 그리고 쓸 수 있는 MCP 서버마다 조사 담당 하나를 붙여, 한 메시지에서 모두 띄운다.[](source:discovery)
- 종합 담당은 모든 주장을 직접·뒷받침·추론·추측·모름 중 한 단계에 놓는다. 단계가 표현과 들어갈 절을 정한다.[](source:tiers-intro)
- 메인 에이전트는 종합 결과를 전할 때 확신도 표현을 고쳐 쓰지 않는다.[](source:present)

@answer scope="pstack/why · 원본 텍스트 파일 13개 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/why/SKILL.md · 10360B · 본문(frontmatter)" path=pstack/why/SKILL.md lines=1:5
@source skill-body title="pstack/why/SKILL.md · 목적, how와의 구분" path=pstack/why/SKILL.md lines=9:11
@source models title="pstack/why/SKILL.md · 모델 규칙" path=pstack/why/SKILL.md lines=13:13
@source posture title="pstack/why/SKILL.md · Operating Posture" path=pstack/why/SKILL.md lines=15:17
@source target title="pstack/why/SKILL.md · Step 1" path=pstack/why/SKILL.md lines=19:23
@source anchor title="pstack/why/SKILL.md · Step 2" path=pstack/why/SKILL.md lines=25:56
@source discovery title="pstack/why/SKILL.md · Step 3 Discovery" path=pstack/why/SKILL.md lines=58:80
@source inv-config title="pstack/why/SKILL.md · 조사 담당 설정과 입력" path=pstack/why/SKILL.md lines=82:92
@source roster title="pstack/why/SKILL.md · 조사 담당 일곱 갈래" path=pstack/why/SKILL.md lines=94:112
@source skip title="pstack/why/SKILL.md · 건너뛰기 조건" path=pstack/why/SKILL.md lines=114:121
@source synth title="pstack/why/SKILL.md · Step 4" path=pstack/why/SKILL.md lines=123:136
@source present title="pstack/why/SKILL.md · Step 5, 출력 형식" path=pstack/why/SKILL.md lines=138:146
@source failure title="pstack/why/SKILL.md · 피할 실패" path=pstack/why/SKILL.md lines=148:150
@source ep-intro title="pstack/why/references/epistemics.md · 7749B · 확신도 틀" path=pstack/why/references/epistemics.md lines=1:5
@source tiers-intro title="epistemics.md · 단계 규칙" path=pstack/why/references/epistemics.md lines=7:9
@source tier-direct title="epistemics.md · Direct" path=pstack/why/references/epistemics.md lines=11:22
@source tier-supported title="epistemics.md · Supported" path=pstack/why/references/epistemics.md lines=24:33
@source tier-inferred title="epistemics.md · Inferred" path=pstack/why/references/epistemics.md lines=35:43
@source tier-spec title="epistemics.md · Speculative" path=pstack/why/references/epistemics.md lines=45:53
@source tier-unknown title="epistemics.md · Unknown" path=pstack/why/references/epistemics.md lines=55:59
@source phrasing title="epistemics.md · 표현 안내" path=pstack/why/references/epistemics.md lines=61:104
@source syco title="epistemics.md · 맞장구 함정" path=pstack/why/references/epistemics.md lines=106:110
@source contra title="epistemics.md · 근거가 충돌할 때" path=pstack/why/references/epistemics.md lines=112:119
@source missing title="epistemics.md · 근거가 없을 때" path=pstack/why/references/epistemics.md lines=121:135
@source calib title="epistemics.md · 마무리 전 점검" path=pstack/why/references/epistemics.md lines=137:144
@source inv-posture title="pstack/why/references/investigator-prompt.md · 6985B · 조사 담당 자세" path=pstack/why/references/investigator-prompt.md lines=1:20
@source inv-loop title="investigator-prompt.md · 조사 절차" path=pstack/why/references/investigator-prompt.md lines=45:63
@source inv-out title="investigator-prompt.md · 출력과 하지 않는 일" path=pstack/why/references/investigator-prompt.md lines=65:103
@source syn-rules title="pstack/why/references/synthesizer-prompt.md · 7984B · 확신도 규칙" path=pstack/why/references/synthesizer-prompt.md lines=27:36
@source syn-steps title="synthesizer-prompt.md · 종합 절차" path=pstack/why/references/synthesizer-prompt.md lines=38:45
@source syn-out title="synthesizer-prompt.md · 출력 형식" path=pstack/why/references/synthesizer-prompt.md lines=47:115
@source syn-qc title="synthesizer-prompt.md · 반환 전 점검" path=pstack/why/references/synthesizer-prompt.md lines=119:135
@source playbook-index title="pstack/why/references/source-playbook.md · 1363B · 플레이북 색인" path=pstack/why/references/source-playbook.md lines=1:17
@source pb-git title="pstack/why/references/sources/code-archaeology.md · 3489B · 소스 관리" path=pstack/why/references/sources/code-archaeology.md lines=1:88
@source pb-linear title="pstack/why/references/sources/linear.md · 2996B · 이슈·티켓" path=pstack/why/references/sources/linear.md lines=1:48
@source pb-notion title="pstack/why/references/sources/notion.md · 2853B · 긴 문서" path=pstack/why/references/sources/notion.md lines=1:55
@source pb-slack title="pstack/why/references/sources/slack.md · 3105B · 실시간 대화" path=pstack/why/references/sources/slack.md lines=1:54
@source pb-datadog title="pstack/why/references/sources/datadog.md · 5323B · 인프라 관측" path=pstack/why/references/sources/datadog.md lines=1:99
@source pb-sentry title="pstack/why/references/sources/sentry.md · 4947B · 오류 추적" path=pstack/why/references/sources/sentry.md lines=1:100
@source pb-databricks title="pstack/why/references/sources/databricks.md · 6994B · 제품 분석" path=pstack/why/references/sources/databricks.md lines=1:70
@source pb-incident title="pstack/why/references/sources/incident-postmortem.md · 1973B · 사고 기록 관점" path=pstack/why/references/sources/incident-postmortem.md lines=1:15
@source dd-window title="datadog.md · 로그 조회 기간" path=pstack/why/references/sources/datadog.md lines=47:54
@source db-window title="databricks.md · 조회 기간과 조사 패턴" path=pstack/why/references/sources/databricks.md lines=25:42
@source slack-auth title="slack.md · 인증 실패" path=pstack/why/references/sources/slack.md lines=16:16
@source setup-roles title="pstack/setup-pstack/SKILL.md · 5548B · why 역할 줄" path=pstack/setup-pstack/SKILL.md lines=57:58
@source architect-why title="pstack/architect/SKILL.md · 5675B · why 호출 조건" path=pstack/architect/SKILL.md lines=25:25
@source pb-investigation title="pstack/poteto-mode/playbooks/investigation.md · 928B · why 경유" path=pstack/poteto-mode/playbooks/investigation.md lines=7:7
@source pb-bugfix title="pstack/poteto-mode/playbooks/bug-fix.md · 2255B · 회귀 이력" path=pstack/poteto-mode/playbooks/bug-fix.md lines=8:8
@source teach-why title="pstack/teach/SKILL.md · 5623B · why 실행" path=pstack/teach/SKILL.md lines=11:14
@source recall-why title="pstack/recall/SKILL.md · 5212B · why 조사 담당 재사용" path=pstack/recall/SKILL.md lines=20:20
@source blast-why title="pstack/blast-radius/SKILL.md · 3851B · why 2단계 재사용" path=pstack/blast-radius/SKILL.md lines=33:36

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 그래서 사용자가 `/why`를 입력하거나, 다른 스킬이 실행 단계에서 부를 때 켜진다. `description`은 설계 이유, 회귀, 사후 분석, 수치 기준의 출처 같은 질문을 다룬다고 알려 줄 뿐이다.

| 누가 부르나 | 조건 |
| --- | --- |
| 사용자 | `/why` 입력 |
| `teach` | 이유 설명이 필요할 때 `how`와 병렬로 실행한다. 기본은 좁게 묻는다.[](source:teach-why) |
| `recall` | 주제가 기능·파일·하위 시스템·버그를 가리킬 때 부른다. 조사 담당만 빌려 쓴다.[](source:recall-why) |
| `blast-radius` | 2단계(코드 기준점)만 빌려 PR과 commit을 가져온다.[](source:blast-why) |
| `architect` | 설계가 소유권이나 계층을 다시 정할 때만 부른다.[](source:architect-why) |
| `poteto-mode` 플레이북 | 조사(`investigation.md`)에서는 동기를 묻는 질문일 때 부른다. 버그 수정(`bug-fix.md`)에서는 회귀 이력이 필요할 때 부른다.[](source:pb-investigation)[](source:pb-bugfix) |

`how`는 코드가 무엇을 어떻게 하는지 답한다. `why`는 어떤 힘이 지금 모양을 만들었는지 답한다.[](source:skill-body)

## 질문을 받으면 어떻게 진행하나 {#flow}

@workflow id=why-flow title="why 진행 흐름"
| target | 대상 파악 | backend |
| anchor | 코드 기준점 | backend |
| discover | 갈래 분류 | backend |
| invest | 조사 담당 | backend |
| synth | 종합 담당 | backend |
| present | 전달 | frontend |
| target > anchor | | |
| anchor > discover | | |
| discover > invest | | emphasis |
| invest > synth | | |
| synth > present | | |

@steps id=why-steps
| s-target | 대상 파악 | 에이전트는 대상(코드, 패턴, 기능, 결정)과 질문(설계 이유, 절충, 동기가 된 예외 사례, 외부 제약, 죽은 코드, 이력 훑기)을 가른다. 대상이 모호하면, 열린 파일, 최근 수정, 커서 위치, 방금 나눈 대화로 추정한다. 그 해석을 짧게 밝히고 진행한다. 사용자는 방향을 바꿀 수 있다. | why-flow | target |
| s-anchor | 코드 기준점 | 메인 에이전트가 코드 기준점을 직접 만든다. `git blame -L`, `git log --follow -p`, `git log --oneline -20`으로 최근 commit을 찾는다. commit 제목의 `(#1234)`에서 PR 번호를 뽑고, 중요한 commit은 `gh pr view`로 본문과 리뷰를 읽는다. | why-flow | anchor |
| s-discover | 갈래 분류 | 에이전트는 Cursor 환경에서 쓸 수 있는 MCP 서버 목록을 본다. 도구 지도가 없으면, `mcps/` 폴더를 살핀다. 서버마다 일곱 갈래 중 하나에 넣는다. 한 서버가 두 갈래에 걸치면, 주된 근거 쪽으로 넣고, 애매한 경우는 조사 범위표에 적는다. | why-flow | discover |
| s-invest | 조사 담당 | 에이전트는 맞는 서버가 있는 갈래마다 조사 담당을 하나씩, 한 메시지에서 모두 띄운다. 조사 담당은 각자 공통 프롬프트, 자기 갈래 플레이북, 코드 기준점, 사용자 질문을 받는다. 대상 코드가 방어 코드로 보이면, 사고 기록 관점 파일도 붙인다. | why-flow | invest |
| s-synth | 종합 담당 | 에이전트는 종합 담당을 하나만 띄운다. 이 담당에게 조사 결과(빈 결과와 건너뛴 사유 포함), 코드 기준점, 질문, 확신도 틀, 종합 프롬프트를 넘긴다. 종합 담당은 겹치는 근거를 합치고, 충돌은 둘 다 남기고, 인용을 표본 확인한다. | why-flow | synth |
| s-present | 전달 | 메인 에이전트는 종합 결과를 사용자에게 보여 준다. 읽기 쉽게 조금 다듬거나 대화 맥락을 덧붙여도 된다. 확신도 표현은 고치지 않는다. | why-flow | present |

드문 예외가 하나 있다. 대상이 commit 하나짜리 사소한 변경이고 PR 설명에 답이 다 있으면, 에이전트는 바로 답할 수 있다. 단, 쓸 수 있는 일곱 갈래 검색이 모두 불필요함을 확인한 뒤에만 답할 수 있고, 답할 때 그 사실을 밝힌다.[](source:skip)

## 근거는 어디서 찾나: 일곱 갈래 {#evidence}

조사 담당 하나는 서버 하나만 맡는다. 한 담당에게 여러 서버를 맡기지 않는다.[](source:discovery)[](source:roster) 플레이북은 대표 서버를 예로 든 것이다. 같은 갈래의 다른 서버라면, 플레이북을 그 서버에 맞춰 고쳐 쓴다.[](source:playbook-index)

| 갈래 | 예시 서버 · 플레이북 | 주로 드러내는 이유 | 플레이북이 경고하는 함정 |
| --- | --- | --- | --- |
| 1 소스 관리 기록 | git, `gh` · `code-archaeology.md` | 리뷰 때 남은 구현 당시 이유. 유일하게 늘 쓸 수 있어 항상 띄운다[](source:roster) | 스쿼시 병합으로 사라진 commit, 내용과 다른 commit 메시지, 봇 commit[](source:pb-git) |
| 2 이슈·티켓 | Linear, Jira, GitHub Issues 등 · `linear.md` | 제품·사업 쪽에서 온 강제 요인[](source:roster) | 범위가 바뀐 티켓, 형식만 채운 "Why" 칸, 낡은 계획[](source:pb-linear) |
| 3 긴 문서 | Notion, Confluence, Google Docs 등 · `notion.md` | 코드가 되기 전에 글로 쓴 설계 이유[](source:roster) | 구현 뒤 갱신 안 된 문서, 문서와 코드의 차이[](source:pb-notion) |
| 4 실시간 대화 | Slack, Discord, Teams 등 · `slack.md` | 문서에 오르지 않은 실시간 논의. 다른 기록이 빈약할수록 중요[](source:roster) | 보존 기간, 검색 안 되는 DM, 농담을 결정으로 읽기. 인증이 실패하면 멈추고 빈칸으로 보고[](source:pb-slack) |
| 5 인프라 관측 | Datadog, Grafana 등 · `datadog.md` | 코드를 낳은 운영 현실. 시간 초과, 재시도, 속도 제한에 강함[](source:roster) | 상관은 인과가 아님. 지표가 있다는 것은 누가 신경 썼다는 뜻일 뿐[](source:pb-datadog) |
| 6 오류 추적 | Sentry, Rollbar 등 · `sentry.md` | 방어 코드를 낳은 예외와 오류 추이[](source:roster) | 오류 묶음 재편, 릴리스 상관의 잡음, `resolved`는 수정의 증거가 아님, AI 분석 환각[](source:pb-sentry) |
| 7 제품 분석 웨어하우스 | Databricks, BigQuery, dbt 등 · `databricks.md` | 플래그·실험 코드, 데이터 이전, "이 숫자는 어디서 왔나"[](source:roster) | 계측 변경을 사용 변화로 읽기, 존재를 확인 안 한 테이블[](source:pb-databricks) |

대상 코드가 방어적이면(널 검사, 재시도, 시간 초과, 속도 제한, 기능 플래그, 외부 송신 차단, OOM 처리), 에이전트는 `incident-postmortem.md`를 더한다. 별도 갈래가 아니라 각 출처 안에서 사고 기록을 찾는 관점이다.[](source:pb-incident)

갈래를 건너뛰려면 최종 출처 확인 절에 서면 사유를 남긴다. 인정되는 사유는 둘뿐이다. 맞는 서버가 없거나(빈칸으로 표시), 그 출처가 무관함이 증명될 때다. "아마 무관"은 사유가 아니다.[](source:skip)

@facts
| 소스 관리 | 항상 띄운다(`git`과 `gh`는 늘 있다고 본다) |
| 로그·이벤트 조회 기간 | 변경 전후 약 30일로 묶는다(권고, Datadog·Databricks) |
| 기준값 출처 확인 | PR 전 14일 분포의 p99와 상수 비교(조사 패턴 예) |
| commit 목록 | `git log --oneline -20`(명령 예) |

조회 기간 수치는 플레이북의 권고다. 넓히려면 강한 이유가 필요하다.[](source:dd-window)[](source:db-window)

조사 담당은 결론을 쓰지 않고 근거만 모은다. 넓게 찾은 뒤 좁히고, 원문을 그대로 인용하고, 무엇을 검색했는지 기록한다. 다른 출처로 가는 링크는 직접 쫓지 않고 추가 단서 절에 남긴다.[](source:inv-posture)[](source:inv-loop)[](source:inv-out)

## 확신도는 어떻게 매기나 {#epistemics}

코드는 자기 동기를 담지 않는다. 그래서 이 스킬은 근거가 조각나 있다는 전제로, 확신도를 따로 매긴다.[](source:ep-intro) 이 틀은 `references/epistemics.md`에 있고, 종합 담당은 반드시 따른다.[](source:posture)

| 단계 | 기준 | 표현 | 출력 위치 |
| --- | --- | --- | --- |
| 직접(Direct) | 저자가 이유를 글로 쓴 것. PR 설명, 티켓, 코드 주석, 설계 문서, 저자의 채팅[](source:tier-direct) | 확신, 현재형. 출처를 단다 | 찾은 것 `[Direct]` |
| 뒷받침(Supported) | 간접 근거 여러 개가 한 방향을 가리킨다[](source:tier-supported) | 확신하되 도출임을 밝히고 출처 여러 개를 단다 | 찾은 것 `[Supported]` |
| 추론(Inferred) | 맥락상 합리적 해석. 명시 근거는 없다[](source:tier-inferred) | 단정을 피하고 "A와 B로 보아 C" 사슬을 드러낸다 | 추론할 수 있는 것 `[Inferred]` |
| 추측(Speculative) | 근거가 얇고 다른 설명도 똑같이 맞는다[](source:tier-spec) | "가능성은 X지만 직접 근거는 없다" | 경쟁 가설 |
| 모름(Unknown) | 찾아봤지만 못 찾았다. 정당한 결과다[](source:tier-unknown) | 어디서 무엇을 찾았는지 구체적으로 | 모르는 것 |

표현 규칙은 원문이 단어 목록으로 준다.[](source:phrasing)

| 종류 | 원문 단어 | 규칙 |
| --- | --- | --- |
| 확신을 싣는 말 | `because`, `the reason is`, `was designed to`, `fixes`, `the team decided` | 직접·뒷받침에만 쓴다. 바로 옆에 출처가 있어야 한다 |
| 단정을 피하는 말 | `appears to`, `likely`, `suggests`, `is consistent with`, `may have been` 등 9개 | 추론 절에서 넉넉히 쓴다 |
| 피할 말 | `obviously`, `clearly`, `of course`, `just`, `I think` | 쓰지 않는다. 의견 대신 "근거가 시사한다"로 쓴다 |

이 틀은 네 가지 함정도 막는다.

- **사후 합리화**: 저자가 옳게 했다고 가정하고 거꾸로 정당화하지 않는다. 일관된 패턴을 의도로 단정하지 않는다. 언급이 없다고 고려가 없었다고 보지 않는다.[](source:phrasing)
- **맞장구**: 사용자가 질문에 가설을 담아 와도 그대로 확인하지 않는다. 후보 하나로 두고 따로 검증한다.[](source:syco)
- **충돌**: PR과 티켓이 다르게 말하면 둘 다 출처와 함께 보이고 판단은 사용자에게 맡긴다.[](source:contra)
- **빈칸**: 그럴듯한 추측으로 메우지 않는다. 무엇을 물었고, 어디서 무엇을 찾았고, 무엇이 나왔는지 적는다.[](source:missing)

종합 담당은 마무리 전에 주장마다 묻는다. 출처가 있나, 표현이 단계에 맞나, 코드를 그 코드의 의도에 대한 근거로 쓰지 않았나, 모르는 것 절이 있나.[](source:calib) 반환 전 점검은 일곱 항목이고, 하나라도 걸리면 고쳐서 낸다.[](source:syn-qc)

## 무엇을 강제하고 무엇을 돌려주나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 기본은 전체 병렬 조사다[](source:discovery) | 의무 |
| 조사 담당은 갈래마다 하나, 한 메시지에서 모두 띄운다[](source:discovery) | 의무 |
| 조사 담당과 종합 담당 모두 `readonly: false`로 띄운다. 읽기 전용(Ask) 모드는 MCP 접근을 없앤다[](source:inv-config)[](source:synth) | 의무(읽기 전용 금지) |
| 그래도 조사 담당은 아무것도 쓰지 않는다. 종합 담당은 파일 쓰기, commit, 외부 상태 변경을 하지 않는다[](source:inv-config)[](source:syn-steps) | 금지 |
| 갈래를 건너뛰면 서면 사유를 남긴다. 사유는 두 가지만[](source:skip) | 의무 |
| 확신도 표현을 다시 쓰지 않는다[](source:present) | 금지 |
| 가장 최근 commit을 권위로 삼지 않는다. 앞선 결정까지 거슬러 간다[](source:failure) | 금지 |
| 코드를 그 코드의 의도에 대한 근거로 쓰지 않는다[](source:syn-rules) | 금지 |

@facts
| 조사 담당 모델 | 규칙 파일의 `why investigators` 줄. 없으면 `grok-4.7-xhigh-fast` |
| 종합 담당 모델 | 규칙 파일의 `why synthesizer` 줄. 없으면 `claude-opus-5-5-max` |
| 서브에이전트 종류 | `subagent_type: generalPurpose` |

에이전트는 모델 줄을 `setup-pstack`이 쓰는 `pstack-models.mdc`에서 읽는다.[](source:setup-roles) 값이 `auto`나 `inherit-parent`면, `model`을 비운다. Task 도구가 모델 이름을 거부하면, 기본값을 쓰고 알린다. 기본값도 거부되면, 오류 메시지에 나온 같은 계열의 가장 가까운 이름을 쓴다.[](source:models)

종합 담당이 돌려주는 답은 여덟 절이다. 질문, 대상 코드, 찾은 것, 추론할 수 있는 것, 경쟁 가설, 모르는 것, 출처 확인, 확신도 요약 순서다.[](source:syn-out)

메인 에이전트는 답의 형식을 상황에 맞게 바꿀 수 있다. 다만 확신도 구분은 지키고, 출처 확인 절은 조사 담당마다 한 줄씩 둔다. 빈 결과와 건너뛴 갈래도 사유와 함께 적는다.[](source:present)

질문이 코드를 바꾸기 위한 준비라면, 출처 확인 절 뒤에 제약 목록을 더한다. 지킬 것(Preserve), 바꿀 것(Change), 피할 것(Avoid), 위험(Risk) 네 묶음이다.[](source:present)

## 흐름 속 위치 {#position}

@workflow id=why-position title="why 앞뒤의 스킬"
| caller | 부르는 스킬 | backend |
| why | why | backend |
| back | 부른 스킬로 | backend |
| caller > why | 이유 질문 | |
| why > back | 근거 있는 답 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `teach`의 좁힌 질문 | 근거 있는 이유. 확신도 표현은 `teach`가 유지 | `how`와 병렬, 기본은 좁게 | r43 |
| `recall`의 주제 | 공유 기록 조사 결과 | 질문을 "지금 무엇이 열려 있나"로 바꿔 넘김 | r45 |
| `blast-radius`의 변경 | PR·commit 목록(2단계만) | 위험 판단도 같은 규칙 | r49 |
| `architect`의 기존 모양 | 설계 제약 | 소유권·계층을 다시 정할 때만 | r61 |
| `pstack-models.mdc`의 역할 줄 | - | 파일이나 줄이 없으면 기본 모델 | r31 |
| - | - | `how`의 짝. 동작은 `how`, 이유는 `why` | r41 |

`poteto-mode`의 조사·버그 수정 플레이북도 `why`를 부른다. 원장은 이 둘을 rel-id 대신 플레이북 표에 적는다. `why`는 다른 스킬을 부르지 않는다.

전체 흐름은 `pstack/_group-understand/understand.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`와 `references/` 아래 원본 12개(`epistemics.md`, `investigator-prompt.md`, `synthesizer-prompt.md`, `source-playbook.md`, `sources/*.md` 8개). 모두 13개다.
- 호출 조건 확인용으로 다른 스킬 파일 일부를 읽었다: `setup-pstack`, `architect`, `teach`, `recall`, `blast-radius`, `poteto-mode/playbooks/investigation.md`, `bug-fix.md`.
- 제외한 파일: `SKILL.KO.md`, `references/**/*.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실제로 실행해 보지 않았다. 이 페이지의 흐름은 모두 원문이 지시한 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="좁힌 조사와 건너뛰기 규칙의 충돌"
`teach`는 `why`를 좁게 부르고, 건너뛴 갈래는 `why`의 계약대로 기록하라고 한다.[](source:teach-why) 그런데 `why`가 인정하는 건너뛰기 사유는 "서버 없음"과 "무관함 증명" 두 가지뿐이다.[](source:skip) 부른 쪽이 범위를 좁힌 경우를 어느 사유로 적을지는 원문에 명시 없음.

@callout level=open-question title="확인하지 못한 것"
MCP 서버 찾기는 Cursor 환경의 도구 지도와 `mcps/` 폴더를 전제로 한다. 다른 도구에서 어떻게 찾을지는 원문에 명시 없음. "방어적으로 보이는 코드"의 판단 기준은 예시 목록뿐이다.[](source:inv-config)
