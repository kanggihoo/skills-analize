# verify-fix는 보안 수정이 취약점을 실제로 막았는지 어떻게 판정하나? {#verify-fix-page}

`verify-fix`는 이미 적용된 보안 수정이 보고된 취약점을 현재 checkout에서 실제로 막았는지, 파일을 하나도 바꾸지 않고 finding마다 `fixed`, `still_vulnerable`, `inconclusive` 중 하나로 판정하는 스킬이다.[](source:v-obj)[](source:v-verdict)

- 사용자가 보안 수정의 검증을 명시적으로 요청하거나 `$verify-fix`를 직접 부를 때만 쓴다. 수정을 구현해 달라거나 그 테스트를 돌려 달라는 요청만으로는 켜지지 않는다.[](source:v-when)
- 에이전트가 내놓는 것은 finding마다 판정 값 하나와 근거다. 대화에서는 Markdown으로, 호출자가 요구하면 JSON 객체 하나로 낸다.[](source:v-result)
- 하지 않는 일: repository 파일 생성·수정·삭제, patch 적용, commit, artifact 쓰기, issue tracker 수정이다.[](source:v-obj)
- `fixed`와 `still_vulnerable`은 증명이 있을 때만 쓴다. 증명이 모자라면 `inconclusive`로 간다.[](source:v-verdict)

@answer scope="원문 정적 분석 · 파일 8개 읽음 · 실행 없음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source v-front title="frontmatter(description)" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=1:4
@source v-when title="호출 조건" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=8:10
@source v-obj title="목적과 읽기 전용 경계" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=12:14
@source v-ref title="평가 방법 reference 지시" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=16:18
@source v-mode title="standard와 static 모드" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=20:20
@source v-wf1 title="절차 1" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=24:24
@source v-wf2 title="절차 2" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=25:25
@source v-wf3 title="절차 3" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=26:26
@source v-wf4 title="절차 4" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=27:27
@source v-wf5 title="절차 5" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=28:28
@source v-result title="결과 형식 두 가지" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=32:34
@source v-jsonblk title="JSON 결과 계약" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=37:45
@source v-verdict title="판정 값 조건" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=48:50
@source v-never title="판정을 올리지 않는 규칙" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=52:52
@source v-yaml title="UI 메타데이터" path=codex-security/plugins/codex-security/skills/verify-fix/agents/openai.yaml
@source sfa-intro title="호출 스킬이 소유하는 것" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=3:6
@source sfa-tuple title="평가 tuple" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=8:21
@source sfa-order title="증거 탐색 순서" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=23:37
@source sfa-boundary title="경계와 표면 확인" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=39:50
@source sfa-conf title="정적 확신도" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=52:61
@source sfa-out title="출력 재료" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=63:75
@source ff-mode title="fix-finding의 검증 모드(대조용)" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=18:20
@source ff-verify title="fix-finding의 workbench Verify 단계(대조용)" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=76:76
@source apr-desc title="assess-patch-risk description(대조용)" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=3:3
@source readme title="벤더의 verify-fix 소개" path=codex-security/plugins/codex-security/skills/README.md lines=33:33
@source mcp-json title="MCP 서버 선언" path=codex-security/plugins/codex-security/.mcp.json
@source plugin-json title="플러그인 선언" path=codex-security/plugins/codex-security/.codex-plugin/plugin.json

## 켜지면 에이전트는 무엇을 읽고 어떻게 판정하나? {#behavior span=12}

`verify-fix`의 동작은 한 줄기 절차다. 요청이 맞는지 확인하고, 원래 취약점을 정리하고, 현재 checkout에서 공격 경로를 다시 따라가고, 조건이 맞으면 검사를 돌린 뒤, finding마다 판정 값 하나를 낸다.[](source:v-when)[](source:v-wf1)[](source:v-wf5)

@workflow id=verify-flow title="수정 검증 흐름"
| ask | 명시 요청? | external | source:v-when |
| other | 이 스킬 아님 | external | source:v-when |
| origin | 원래 취약점 정리 | backend | source:v-wf1 |
| present | 구성요소 있나? | backend | source:v-wf2 |
| trace | 공격 경로 추적 | backend | source:v-wf3 |
| mode | standard 모드? | backend | source:v-mode |
| runchk | 검사 실행 | backend | source:v-wf4 |
| judge | 증명됐나? | security | source:v-verdict |
| fixed | fixed | backend | source:v-verdict |
| still | still_vulnerable | backend | source:v-verdict |
| inconc | inconclusive | backend | source:v-verdict |
| ask > origin | 예 | emphasis |
| ask > other | 아니오 |
| origin > present | |
| present > trace | 예 |
| present > inconc | 끝내 없음 |
| trace > mode | |
| mode > runchk | 예 |
| mode > judge | static |
| runchk > judge | |
| judge > fixed | 닫힘 증명 | emphasis |
| judge > still | 도달 증명 |
| judge > inconc | 증명 부족 |

그림은 핵심 경로만 그렸다. finding이 여러 개이면 판정 단계까지를 finding마다 반복한다. 원래 맥락이 없거나 repository가 맞지 않는 경우는 어느 단계에서든 `inconclusive`로 끝날 수 있는데, 그림에는 구성요소를 못 찾는 갈래만 그렸다. 두 경우는 아래 `@steps`와 판정 값 조건에서 문장으로 설명한다.[](source:v-wf5)[](source:v-verdict)

@steps id=verify-steps
| ask | 명시 요청? | 에이전트는 사용자의 요청 문장을 받아 이 스킬을 켤지 먼저 판단한다. 켜는 경우는 보안 수정이 취약점을 막았는지 검증해 달라는 명시적 요청과 `$verify-fix` 직접 호출이다.[](source:v-when) 수정을 구현해 달라거나 그 테스트를 돌려 달라는 요청만으로는 이 스킬을 요청한 것으로 보지 않는다.[](source:v-when) description은 여기에 더해 수정 구현 중, 일반 코드 변경 리뷰 중, 테스트 실행 중에는 자동으로 부르지 말라고 하고, 비보안 수정과 후보 finding validation과 전체 repository scan에도 쓰지 말라고 한다.[](source:v-front) 명시 요청이 맞으면 `origin`으로 넘어가고 아니면 `other`로 간다. 호출 제한 필드는 frontmatter와 `openai.yaml` 어디에도 없다. 판정: 그래서 이 제한은 문장으로만 걸려 있다.[](source:v-front)[](source:v-yaml) | verify-flow | ask |
| other | 이 스킬 아님 | 이 노드는 종료 지점이다. 원문은 다른 작업이면 "사용자가 요청한 workflow와 응답 형식을 따른다"고만 적는다.[](source:v-when) 대신 쓸 스킬의 이름은 이 스킬 원문에 명시 없음. 설명용 예시(입력은 지어낸 것이다): "이 SQL injection을 고치고 테스트까지 돌려 줘"는 수정 구현 요청이므로 여기로 온다. 판정: 같은 계열인 `fix-finding`이 그 일을 맡을 후보지만 호출 관계는 원장 R30에 없다.[](source:v-when)[](source:ff-mode) | verify-flow | other |
| origin | 원래 취약점 정리 | 에이전트는 호출자가 준 finding과 현재 checkout을 받는다. 먼저 원래 취약점, 그 전제 조건, 영향받는 보안 경계, 수정 뒤에도 계속 동작해야 하는 정당한 동작을 정한다.[](source:v-wf1) 이때 `static-finding-assessment.md`의 tuple 틀을 쓴다. 공격자가 제어하는 source, 관련 control, 위험한 sink, 이 셋을 잇는 도달 경로, 경계, 반증, 증명 간극(proof gap)을 정리하는 틀이다.[](source:v-ref)[](source:sfa-tuple) 호출자가 이 reference 내용을 이미 prompt에 넣었으면 다시 읽지 않는다.[](source:v-ref) 증거는 가장 작은 범위부터 본다. 사용자나 scanner가 준 위치, 의존성 manifest와 lockfile, 영향받는 함수와 호출처, 가까운 guard, `SECURITY.md`나 위협 모델 같은 제품 표면 근거 순이다.[](source:sfa-order) 정리가 끝나면 `present`로 넘기고, 원래 맥락이 부족하면 `inconclusive`로 가는 조건이 된다.[](source:v-verdict) | verify-flow | origin |
| present | 구성요소 있나? | 에이전트는 정리한 취약점의 구성요소가 현재 checkout에 있는지 확인한다. 파일이 없어졌거나 줄이 지워졌거나 함수 이름이 바뀌었다는 사실을 수정의 증거로 쓰지 않고, 옮겨지거나 refactor된 코드를 따라가 찾는다.[](source:v-wf2) 찾으면 `trace`로 넘어간다. 끝내 찾지 못할 때의 처리를 한 문장으로 적은 곳은 원문에 명시 없음. 판정: 판정 값 조건의 repository 불일치에 해당하므로 `inconclusive`로 가는 것이 원문과 맞는다.[](source:v-verdict) | verify-flow | present |
| trace | 공격 경로 추적 | 에이전트는 원래 공격 경로를 현재 구현에서 끝까지 따라간다. 경로에서 가장 가까운 관련 control, 같은 효과를 내는 다른 경로, 우회할 수 있는 길을 함께 확인한다.[](source:v-wf3) 보는 대상은 현재 source와 diff, 호출자, 기존 테스트이고 테스트는 실행하지 않고 소스로 읽는다.[](source:v-mode) 저장소를 읽는 도구는 모드와 상관없이 쓸 수 있다.[](source:v-mode) 이 노드에서 갈라지는 조건은 없다. 닫힌 control과 우회 가능성과 남은 proof gap을 `mode`로 넘긴다. | verify-flow | trace |
| mode | standard 모드? | 에이전트는 호출자가 `verificationMode: static`을 명시했는지 본다. 명시하지 않았으면 `standard`가 기본이다.[](source:v-mode) `standard`이면 `runchk`로, `static`이면 검사를 건너뛰고 `judge`로 간다. 호출자가 어떤 경로로 `static`을 지정하는지는 이 스킬 원문에 명시 없음. 사용자가 직접 `$verify-fix`를 부르는 경우 모드를 어떻게 고르는지도 원문에 명시 없음. | verify-flow | mode |
| runchk | 검사 실행 | 이 노드는 `standard`에서만 거친다. 에이전트는 원래 reproducer, 집중 회귀 검사, 정당한 동작 검사를 repository를 바꾸지 않고 돌릴 수 있을 때만 돌린다.[](source:v-wf4) 돌릴 수 없는 검사는 억지로 돌리지 않고, 정확한 정적 근거를 그대로 남긴다.[](source:v-wf4) 실행하지 못한 검사를 통과한 것으로 세는지는 이 모드에 대해 원문에 명시 없음. 결과(통과, 실패, 실행 못 함)와 정적 근거를 `judge`로 넘긴다. | verify-flow | runchk |
| judge | 증명됐나? | 에이전트는 요청받은 순서대로 finding 하나에 결과 하나를 낸다.[](source:v-wf5) 닫힌 ticket, 관련 없는 통과 테스트, 새 scan finding이 없다는 사실은 증명으로 쳐 주지 않는다.[](source:v-wf5) 갈림은 세 갈래다. 원래 경계가 닫혔고 정당한 동작이 유지된다는 증거가 있으면 fixed, 원래 취약 경로에 여전히 닿는다는 증거가 있으면 still_vulnerable, 그 밖의 모든 빈틈은 inconclusive다.[](source:v-verdict) `static`이었다면 근거에 정적 평가이며 runtime 검사를 하지 않았다고 적고, 그 검사를 통과로 세거나 요구하지 않는다. runtime 도구가 없다는 사실만으로는 `inconclusive`가 아니지만 소스 근거에 실질적인 빈틈이 있으면 `inconclusive`다.[](source:v-mode) 판정을 더 강하게 만들려고 읽기 전용 경계를 풀거나, 다른 취약점으로 바꿔 보거나, 빠진 근거를 숨기지 않는다.[](source:v-never) | verify-flow | judge |
| fixed | fixed | 에이전트는 증거가 원래 보안 경계가 닫혔음과 정당한 동작이 유지됨을 둘 다 증명할 때만 이 값을 쓴다.[](source:v-verdict) 둘 중 하나만 증명되면 이 값이 아니다. 판정: 일부 경로만 막힌 경우를 이 값으로 부르면 원문의 "only when"을 어기게 된다.[](source:v-verdict) finding id, `fixed`, 근거를 호출자에게 돌려주고 끝난다.[](source:v-result) | verify-flow | fixed |
| still | still_vulnerable | 에이전트는 증거가 원래 취약 경로에 여전히 닿을 수 있음을 증명할 때만 이 값을 쓴다.[](source:v-verdict) 경로가 의심스럽다는 정도로는 부족하다. 의심만 남으면 `inconclusive`로 간다. 판정: 우회 경로나 같은 효과를 내는 다른 경로가 열려 있음이 증명되면 이 값의 근거가 된다. 근거는 절차 3의 "equivalent paths, and plausible bypasses" 확인이다.[](source:v-wf3) 근거 문장에는 현재 source나 exploit 같은 구체적인 증거를 적는다.[](source:v-jsonblk) | verify-flow | still |
| inconc | inconclusive | 이 값은 증명이 안 될 때 도착하는 기본 자리다. 원문이 드는 경우는 repository 불일치, 원래 맥락 없음, 선택한 모드가 요구하는 검사를 못 하는 경우, 증명되지 않은 정당한 통제, 그 밖의 실질적 증명 빈틈이다.[](source:v-verdict) 에이전트는 근거에 무엇이 비어 있는지를 구체적으로 적는다. 대화 결과에는 남은 proof gap을 적게 되어 있다.[](source:v-result) 빈틈을 숨기고 더 강한 값을 내는 것은 금지다.[](source:v-never) | verify-flow | inconc |

모드는 둘이다. `standard`는 기본이고 repository를 바꾸지 않는 선에서 reproducer와 회귀 검사까지 돌려 본다. `static`은 호출자가 명시할 때만 켜지고 의존성 설치, build, test, reproducer, 앱 실행을 하지 않는다. validation 지시가 그것들을 요청해도 하지 않는다.[](source:v-wf4)[](source:v-mode)

설명용 예시(입력은 지어낸 것이다): 사용자가 "방금 고친 `/search`의 SQL injection이 막혔는지 확인해 줘"라고 하고 finding 하나와 수정 diff를 줬다고 하자. 이 문장은 보안 수정의 검증을 명시적으로 요청한 것이므로 켜진다.[](source:v-when) 에이전트는 원래 취약점을 "검색어가 query 문자열에 그대로 이어 붙는다"로 정리하고, 정당한 동작을 "검색 결과가 그대로 나온다"로 정한다.[](source:v-wf1) 함수 이름이 바뀌었어도 옮겨진 코드를 따라가 구성요소를 찾는다.[](source:v-wf2)

설명용 예시(이어서): 모든 호출 경로에서 값이 바인딩 파라미터로 가고 검색 동작도 유지됨이 소스로 보이면 결과는 `fixed`가 될 수 있다. 같은 검색어가 다른 handler에서 여전히 문자열로 이어진다면 `still_vulnerable`이 될 수 있다. 호출 쪽 코드를 확인하지 못해 한 경로가 비어 있다면 `inconclusive`가 된다.[](source:v-verdict)

## 언제 켜지고 언제 쓰면 안 되나? {#activation span=12}

호출 조건은 두 곳에 적혀 있다. 하나는 frontmatter의 description이고 다른 하나는 본문 "When to Use"다. description은 모델이 호출을 판단할 때 참고하는 설명이며 특정 단어와 정확히 일치해야 켜지는 사전이 아니다.[](source:v-front)[](source:v-when)

@code source=v-front language=yaml

| 구분 | 원문 규칙 |
|---|---|
| 켜는 경우 | 보안 수정을 검증해 달라는 명시적 요청, 그리고 `$verify-fix` 직접 호출이다.[](source:v-when) |
| 켜지 않는 경우 | 수정 구현이나 그 테스트 실행 요청만으로는 켜지 않는다.[](source:v-when) 수정 구현 중, 일반 코드 변경 리뷰 중, 테스트 실행 중에는 자동으로 부르지 않는다.[](source:v-front) |
| 쓰면 안 되는 작업 | 비보안 수정, 후보 finding validation, 전체 repository scan이다.[](source:v-front) |
| 다른 작업일 때 | 사용자가 요청한 workflow와 응답 형식을 따른다.[](source:v-when) |
| 호출 제한 필드 | frontmatter에 `disable-model-invocation`이 없고 `openai.yaml`에도 `policy`가 없다. 원문에 명시 없음.[](source:v-front)[](source:v-yaml) |

`agents/openai.yaml`은 표시 이름 `Verify Fix`, 짧은 설명 "Verify security fixes without changing code", 호출 예시 prompt를 담은 UI 메타데이터다. 이 prompt는 "Use $verify-fix to verify that a reported security vulnerability is fixed without modifying the repository."이며 `$verify-fix` 호출 형태의 예다.[](source:v-yaml)

판정: 자동 호출을 막는 장치는 description과 "When to Use"의 문장뿐이다. 필드로 강제하지 않으므로 호스트가 이 문장을 실제로 지키는지는 실행으로 확인해야 한다. 이 분석은 실행하지 않았다.[](source:v-front)[](source:v-when)[](source:v-yaml)

## 무엇을 강제하고 무엇을 금지하나? {#rules span=12}

아래 표는 찾아보기용이다. 원문에 숫자 기준(횟수, 시간, 임계값)은 없다. 판정 값 3개와 모드 2개가 전부다.

| 규칙 | 종류 | 출처 |
|---|---|---|
| repository 파일을 만들거나 고치거나 지우지 않는다. patch를 적용하거나 commit하지 않는다. artifact를 쓰지 않고 issue tracker를 고치지 않는다. | 금지 | [](source:v-obj) |
| 명시적 요청이나 `$verify-fix` 직접 호출일 때만 쓴다. | 조건 | [](source:v-when)[](source:v-front) |
| 평가 방법은 `static-finding-assessment.md`를 쓴다. 호출자가 내용을 prompt에 이미 줬으면 다시 읽지 않는다. | 지시 | [](source:v-ref) |
| `standard`가 기본이고 `static`은 호출자가 `verificationMode: static`을 명시할 때만 쓴다. | 기본값과 조건 | [](source:v-mode) |
| `static`에서는 의존성 설치, build, test, reproducer, 앱 실행을 하지 않는다. validation 지시가 요청해도 하지 않는다. | 금지 | [](source:v-mode) |
| `static`에서는 근거에 정적 평가이며 runtime 검사를 하지 않았다고 적는다. 그 검사를 통과로 세거나 요구하지 않는다. | 의무와 금지 | [](source:v-mode) |
| 사라진 파일, 지워진 줄, 바뀐 함수 이름을 수정의 증거로 쓰지 않고 옮겨진 코드를 따라간다. | 금지와 지시 | [](source:v-wf2) |
| `standard`의 검사는 repository를 바꾸지 않고 돌릴 수 있을 때만 돌린다. | 조건 | [](source:v-wf4) |
| 요청된 순서대로 finding 하나에 결과 하나를 낸다. | 의무 | [](source:v-wf5) |
| 닫힌 ticket, 관련 없는 통과 테스트, 새 scan finding이 없다는 사실은 증명이 아니다. | 금지 | [](source:v-wf5) |
| `fixed`와 `still_vulnerable`은 증명이 있을 때만 쓴다. 그 밖의 빈틈은 `inconclusive`다. | 조건 | [](source:v-verdict) |
| 읽기 전용 경계를 약하게 하거나, 다른 취약점으로 바꾸거나, 빠진 근거를 숨겨 더 강한 판정을 만들지 않는다. | 금지 | [](source:v-never) |

@callout level=warning title="원문이 서로 다르게 읽히는 곳"
| `standard`의 절차 4는 검사를 "돌릴 수 있을 때만" 돌린다고 하는데, 판정 값 조건은 "선택한 모드가 요구하는" 검사를 못 하면 `inconclusive`라고 한다.[](source:v-wf4)[](source:v-verdict)
| `standard`에서 어떤 검사가 요구되는지는 원문에 명시 없음. 우선순위도 명시 없음. 두 문장을 그대로 두고, 실행하지 못한 검사가 판정에 어떻게 반영되는지는 호출 쪽에서 확인해야 한다.

## 결과는 어떤 모양으로 돌려주나? {#result span=12}

결과 형식은 두 가지이고 판정 값과 근거 요건은 같다.[](source:v-result) 대화에서는 읽기 쉬운 Markdown을 쓴다. 호출자가 다른 형식을 요구하지 않는 한 finding마다 판정을 주고, source 참조가 달린 근거를 설명하고, 관련 검사와 남은 proof gap을 밝힌다.[](source:v-result)

호출자가 JSON을 요청하거나 자동 결과 계약을 주면 아래 모양의 JSON 객체 하나만 돌려준다. 원문은 CLI 검증 workflow가 이 계약을 명시적으로 요청한다고 적는다.[](source:v-result)

@code source=v-jsonblk language=json

`id`는 finding이나 issue의 id이고 `status`는 세 값 중 하나이며 `evidence`는 현재 source, exploit, 테스트, 증명 간극 중 구체적인 근거를 적는 자리다.[](source:v-jsonblk) JSON에는 proof gap이나 `static` 평가 여부를 담는 별도 필드가 없다.

판정: 이 내용은 `evidence` 문자열 안에 적게 되며, 이 해석의 근거는 `static`이면 "근거에" 적으라는 문장과 필드 목록이다.[](source:v-mode)[](source:v-jsonblk)

`static-finding-assessment.md`가 말하는 정적 확신도(`high`, `medium`, `low`)도 이 계약에 필드가 없다. 그 reference는 최종 schema와 라벨을 호출 스킬이 정한다고 하므로 이 스킬의 최종 출력은 판정 값과 근거 문장이다.[](source:sfa-conf)[](source:sfa-out)[](source:sfa-intro)

## 흐름 속 위치는 어디인가? {#position span=12}

`verify-fix`는 `remediate-finding` 묶음의 읽기 전용 점검 선택지다. 앞뒤로 이 스킬을 부르는 스킬은 없고, 이웃과의 관계는 모두 같은 계열이거나 참고다(R30, R31, R63). 전체 흐름은 묶음 페이지 `codex-security/_group-remediate-finding/remediate-finding.html`에 있다.

@workflow id=position-flow title="verify-fix의 앞과 뒤"
| fix | 이미 있는 수정 | external | source:readme |
| me | verify-fix | backend | source:v-when |
| back | 호출자가 결과를 받음 | external | source:v-result |
| fix > me | 사용자 요청 | emphasis |
| me > back | 판정과 근거 |

@steps id=position-steps
| fix | 이미 있는 수정 | 벤더 안내문은 이 스킬을 "원래 finding과 현재 checkout을 주면 수정이 통했는지, 빠진 근거가 무엇인지 알려 주는" 스킬로 소개한다.[](source:readme) 수정이 어떻게 만들어졌는지는 따지지 않는다. `fix-finding`이 만든 수정일 수도 있지만 두 스킬의 관계는 같은 계열이고 호출 관계가 아니다(R30).[](source:ff-mode)[](source:v-mode) 사용자가 명시적으로 요청할 때만 이 스킬로 넘어간다.[](source:v-when) | position-flow | fix |
| me | verify-fix | 이 페이지의 스킬이다. 원래 finding과 현재 checkout을 받아 파일을 바꾸지 않고 읽고 판정한다.[](source:v-obj) 위 동작 패널의 흐름이 이 노드 하나의 내부다. | position-flow | me |
| back | 호출자가 결과를 받음 | 에이전트는 판정 값, 근거, 남은 proof gap을 Markdown이나 JSON으로 호출자에게 돌려준다.[](source:v-result) 결과를 받은 뒤 이어서 무엇을 하는지는 이 스킬 원문에 명시 없음. issue tracker를 고치지 않으므로 ticket을 닫는 일은 이 스킬이 하지 않는다.[](source:v-obj) | position-flow | back |

| 관계 | 상대 | 내용 |
|---|---|---|
| R30 · 같은 계열 · 추론(모드) | `fix-finding` | 두 스킬이 `standard`와 `static` 모드를 같은 이름과 같은 뜻으로 쓰고 static 서술이 거의 같다.[](source:ff-mode)[](source:v-mode) |
| R30 · 같은 계열 · 추론(Verify 단계) | `fix-finding` | `fix-finding`의 workbench Verify 단계도 소스를 바꾸지 않는다. 이 단계와 이 스킬이 겹치는 방식은 원문에 명시 없음.[](source:ff-verify) |
| R31 · 같은 계열 · 추론(공통점) | `assess-patch-risk` | 둘 다 수정이 이미 있을 때 파일을 바꾸지 않고 점검한다. 직접 연결은 없다.[](source:apr-desc)[](source:v-obj) |
| R31 · 같은 계열 · 추론(차이) | `assess-patch-risk` | 그 스킬은 patch의 영향과 회귀 위험과 merge 자격을 보고, 이 스킬은 원래 취약점이 막혔는지를 본다.[](source:apr-desc)[](source:v-obj) |
| R63 · 참고 · 명시-이름 | `references/static-finding-assessment.md` | 평가 방법을 이 파일에서 읽는다. 이 파일은 사용자에게 보일 판정과 형식은 호출 스킬이 소유한다고 정한다.[](source:v-ref)[](source:sfa-intro) |

## 어디까지 읽고 확인했나? {#audit span=12}

대상 폴더의 텍스트 파일 2개와 스킬이 직접 지목한 공용 reference를 끝까지 읽었다. 번역본(`*.KO.md`)은 없고 바이너리 파일도 없다. 바이트 수는 파일당 한 번만 적는다.

| 파일 | 바이트 | 읽은 범위 |
|---|---|---|
| `skills/verify-fix/SKILL.md` | 4,193 | 전부 |
| `skills/verify-fix/agents/openai.yaml` | 235 | 전부 |
| `references/static-finding-assessment.md` | 3,949 | 전부. 스킬이 직접 지목한 필수 참조다 |
| `skills/fix-finding/SKILL.md` | 18,461 | 부분 읽음(18~20줄, 76줄만. R30 대조) |
| `skills/assess-patch-risk/SKILL.md` | 8,299 | 부분 읽음(3줄만. R31 대조) |
| `skills/README.md` | 3,752 | 전부. 33줄이 이 스킬 소개 |
| `.mcp.json` | 2,078 | 전부 |
| `.codex-plugin/plugin.json` | 1,682 | 전부 |

읽은 텍스트 파일은 8개이고 그중 2개는 부분 읽음이다.[](source:readme)[](source:mcp-json)[](source:plugin-json)

`verify-fix/SKILL.md`에는 MCP 도구를 이름으로 부르는 문장이 없다. 도구 이야기는 "Repository-reading tools remain available" 한 곳뿐이다.[](source:v-mode) `.mcp.json`의 서버 선언과 시간 제한은 이 스킬의 동작에 쓰이는 곳이 원문에 없어 분석에서 쓰지 않았다.[](source:mcp-json)

관계 원장 R30, R31, R63을 원문과 대조했고 오류는 찾지 못했다.

@callout level=open-question title="확인하지 못한 부분"
| `fix-finding`의 workbench Verify 단계와 이 스킬이 겹치는 방식은 원문에 명시 없음.[](source:ff-verify)
| `standard` 모드에서 검사를 돌리다 build 산출물이나 cache 같은 파일이 생겨도 되는지, 의존성 설치가 허용되는지는 원문에 명시 없음. `static` 모드에만 설치 금지가 적혀 있다.[](source:v-wf4)[](source:v-mode)
| CLI 검증 workflow가 JSON 계약을 어떻게 요청하고 결과를 어떻게 검사하는지, 호출자가 `verificationMode: static`을 어떻게 넘기는지는 이 스킬 폴더에 없다. 호출 쪽 구현은 확인하지 않았다.[](source:v-result)[](source:v-mode)
| 원래 맥락이 없을 때 사용자에게 되묻는지는 원문에 명시 없음. 원문은 이 경우를 `inconclusive` 조건으로만 적는다.[](source:v-verdict)
| 호스트가 description의 호출 제한을 실제로 지키는지는 실행하지 않아 확인하지 못했다.[](source:v-front)

분석 중 원본은 수정하지 않았다. 원문의 어떤 지시도 실행하지 않았다.
