# verify-fix는 보안 수정이 취약점을 막았는지 어떻게 판정하나? {#verify-fix-page}

`verify-fix`는 사용자가 보안 수정의 검증을 명시적으로 요청할 때만 쓴다. 현재 checkout에서 finding마다 `fixed`, `still_vulnerable`, `inconclusive` 중 하나를 근거와 함께 내고, 저장소 파일은 만들거나 고치거나 지우지 않는다.[](source:v-when)[](source:v-obj)[](source:v-verdict)

- 수정 구현이나 그 테스트 실행을 요청했다는 이유만으로는 켜지지 않는다. 비보안 수정, 후보 finding 검증, 전체 scan에도 쓰지 않는다.[](source:v-front)[](source:v-when)
- patch 적용, commit, artifact 쓰기, issue tracker 수정이 모두 금지다.[](source:v-obj)
- `fixed`와 `still_vulnerable`은 증명이 있을 때만 쓴다. 나머지 빈틈은 모두 `inconclusive`로 간다.[](source:v-verdict)
- 닫힌 ticket, 관련 없는 통과 테스트, 새 scan finding이 없다는 사실은 증명이 아니다.[](source:v-wf5)

@answer scope="원문 분석 · 스킬 폴더 2개 파일과 플러그인 공용 참조 1개 읽음 · 코드 실행 없음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source v-full title="codex-security/plugins/codex-security/skills/verify-fix/SKILL.md · 4193B · 스킬 본문(원본)" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md
@source v-front title="verify-fix/SKILL.md · frontmatter" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=1:4
@source v-when title="verify-fix/SKILL.md · 호출 조건" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=8:10
@source v-obj title="verify-fix/SKILL.md · 목적과 읽기 전용 경계" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=12:14
@source v-ref title="verify-fix/SKILL.md · 평가 방법 reference" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=16:18
@source v-mode title="verify-fix/SKILL.md · standard와 static 모드" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=20:20
@source v-wf1 title="verify-fix/SKILL.md · 절차 1단계" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=24:24
@source v-wf2 title="verify-fix/SKILL.md · 절차 2단계" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=25:25
@source v-wf3 title="verify-fix/SKILL.md · 절차 3단계" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=26:26
@source v-wf4 title="verify-fix/SKILL.md · 절차 4단계" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=27:27
@source v-wf5 title="verify-fix/SKILL.md · 절차 5단계" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=28:28
@source v-result title="verify-fix/SKILL.md · 결과 형식" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=30:34
@source v-json title="verify-fix/SKILL.md · JSON 계약" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=34:46
@source v-verdict title="verify-fix/SKILL.md · 판정 값 조건" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=48:50
@source v-never title="verify-fix/SKILL.md · 판정을 올리지 않는 규칙" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=52:52
@source v-yaml title="verify-fix/agents/openai.yaml · 235B · UI 메타데이터" path=codex-security/plugins/codex-security/skills/verify-fix/agents/openai.yaml
@source sfa-full title="plugins/codex-security/references/static-finding-assessment.md · 3949B · 정적 근거 평가 틀" path=codex-security/plugins/codex-security/references/static-finding-assessment.md
@source sfa-intro title="static-finding-assessment.md · 호출 스킬이 소유하는 것" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=3:6
@source sfa-tuple title="static-finding-assessment.md · 평가 tuple" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=8:21
@source sfa-order title="static-finding-assessment.md · 증거 탐색 순서" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=23:37
@source sfa-boundary title="static-finding-assessment.md · 경계와 표면 확인" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=39:50
@source sfa-conf title="static-finding-assessment.md · 정적 확신도" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=52:61
@source sfa-out title="static-finding-assessment.md · 출력 재료" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=63:75
@source ff-mode title="fix-finding/SKILL.md · 18~20번째 줄만 읽음(R30 대조)" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=18:20
@source ff-verify title="fix-finding/SKILL.md · 76번째 줄만 읽음(R30 대조)" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=76:76
@source apr-desc title="assess-patch-risk/SKILL.md · 3번째 줄만 읽음(R31 대조)" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=3:3
@source readme title="plugins/codex-security/skills/README.md · 3752B · 벤더의 스킬 안내" path=codex-security/plugins/codex-security/skills/README.md lines=33:33
@source mcp-json title="plugins/codex-security/.mcp.json · 2078B · MCP 서버 선언" path=codex-security/plugins/codex-security/.mcp.json
@source plugin-json title="plugins/codex-security/.codex-plugin/plugin.json · 1682B · 플러그인 선언" path=codex-security/plugins/codex-security/.codex-plugin/plugin.json

## 이 스킬은 언제 켜지고 무엇을 하지 못하나? {#activation}

호출 조건은 두 곳에 있다. 하나는 description이고 다른 하나는 본문 "When to Use"다. description은 모델이 호출을 판단할 때 참고하는 설명이며, 특정 단어와 정확히 일치해야 켜지는 사전이 아니다.[](source:v-front)

@code source=v-front language=yaml

| 구분 | 원문 규칙 |
|---|---|
| 켜는 경우 | 보안 수정을 검증해 달라는 명시적 요청이나 `$verify-fix` 직접 호출이다.[](source:v-when) |
| 켜지 않는 경우 | 수정 구현이나 그 테스트 실행 요청만으로는 켜지 않는다. 일반 코드 변경 리뷰, 비보안 수정, 후보 finding 검증, 전체 repository scan에도 쓰지 않는다.[](source:v-front)[](source:v-when) |
| 금지 | repository 파일을 만들거나 고치거나 지우지 않는다. patch를 적용하거나 commit하지 않는다. artifact를 쓰지 않고 issue tracker를 고치지 않는다.[](source:v-obj) |
| 호출 제한 필드 | frontmatter에 `disable-model-invocation`이 없고 `agents/openai.yaml`에도 `policy`가 없다. 원문에 명시 없음.[](source:v-front)[](source:v-yaml) |

설명용 예시 · "방금 고친 SQL injection이 정말 막혔는지 확인해 줘"는 켜지는 요청이다. "이 취약점을 고치고 테스트까지 돌려 줘"는 fix 요청이라 이 스킬을 직접 켜지 않는다. 그 경우는 `fix-finding`이 맡는다.

판정 · 자동 호출을 막는 장치는 description과 "When to Use"의 문장뿐이다. 필드로 강제하지 않으므로 호스트가 이 문장을 지키는지는 실행으로 확인해야 한다.[](source:v-front)[](source:v-when)[](source:v-yaml)

| 모드 | 하는 일 | 하지 않는 일 |
|---|---|---|
| `standard`(기본) | 원래 reproducer, 집중 회귀 검사, 정당한 동작 검사를 repository를 바꾸지 않고 돌릴 수 있을 때 돌린다.[](source:v-wf4) | repository를 바꾸는 검사는 돌리지 않는다.[](source:v-wf4) |
| `static`(호출자가 `verificationMode: static`을 명시) | 현재 source와 diff, 원래 공격 경로와 우회 가능성, 호출자와 기존 테스트를 소스로 읽어 평가한다. 근거에 정적 평가이며 runtime 검사를 하지 않았다고 적는다.[](source:v-mode) | 의존성 설치, build, test, reproducer, 앱 실행을 하지 않는다. validation 지시가 요청해도 하지 않는다. runtime 도구가 없다는 사실만으로는 `inconclusive`가 아니고, 소스 근거에 실질적인 빈틈이 있으면 `inconclusive`다.[](source:v-mode) |

## 어떤 순서로 수정 여부를 판정하나? {#procedure}

에이전트는 먼저 원래 취약점과 지켜야 할 정당한 동작을 정한다. 그다음 현재 checkout에서 공격 경로를 다시 따라간다. `standard` 모드에서만 reproducer와 회귀 검사를 돌릴 수 있다.[](source:v-wf1)[](source:v-wf3)[](source:v-wf4)

@workflow id=verify-flow title="수정 검증 절차"
| origin | 원래 취약점 확정 | backend | source:v-wf1 |
| present | 구성요소 확인 | backend | source:v-wf2 |
| trace | 공격 경로 추적 | backend | source:v-wf3 |
| mode | 어떤 모드인가? | backend | source:v-mode |
| runtime | 검사 실행 | backend | source:v-wf4 |
| verdict | finding별 판정 | backend | source:v-wf5 |
| origin > present | |
| present > trace | |
| trace > mode | |
| mode > runtime | standard |
| mode > verdict | static |
| runtime > verdict | |

@steps id=verify-steps
| origin | 원래 취약점 확정 | 공격자가 제어하는 입력, 보안 경계, 전제 조건, 계속 동작해야 하는 정당한 동작을 정한다.[](source:v-wf1) | verify-flow | origin |
| present | 구성요소 확인 | 현재 checkout에 영향받은 구성요소가 있는지 본다. 파일이 없어지거나 줄이 지워지거나 함수 이름이 바뀐 것을 수정의 증거로 보지 않고 옮겨진 코드를 따라간다.[](source:v-wf2) | verify-flow | present |
| trace | 공격 경로 추적 | 원래 경로를 현재 구현에서 따라가며 가장 가까운 통제, 같은 효과를 내는 다른 경로, 우회 가능성을 본다.[](source:v-wf3) | verify-flow | trace |
| mode | 어떤 모드인가? | 호출자가 `verificationMode: static`을 고르지 않았으면 `standard`다.[](source:v-mode) | verify-flow | mode |
| runtime | 검사 실행 | `standard`에서만 한다. 원래 reproducer, 회귀 검사, 정당한 동작 검사를 repository를 바꾸지 않고 돌릴 수 있을 때 돌린다. 못 돌리면 정확한 정적 근거를 그대로 남긴다.[](source:v-wf4) | verify-flow | runtime |
| verdict | finding별 판정 | 요청받은 순서대로 finding 하나에 결과 하나를 낸다.[](source:v-wf5) | verify-flow | verdict |

각 finding은 공통 평가 틀로 읽는다. 호출자가 이 reference 내용을 prompt에 이미 넣었으면 다시 읽지 않는다.[](source:v-ref) 이 틀은 최상위 workflow가 아니고, 입력 정규화와 사용자에게 보이는 판정과 fix 동작은 호출한 스킬이 소유한다.[](source:sfa-intro)

| 항목 | 정할 것 |
|---|---|
| source | 주장이 말하는 공격자 제어 입력이나 외부 트리거, 신뢰된 운영자 입력[](source:sfa-tuple) |
| control | 관련 guard, validator, sanitizer, 권한 검사, 구성 gate, feature flag, 빠져 있는 보안 통제[](source:sfa-tuple) |
| sink | 위험한 동작, 취약 의존성, 깨진 통제, 영향 지점[](source:sfa-tuple) |
| reachable path | 전제 조건 아래 source, control, sink를 잇는 코드·설정 경로[](source:sfa-tuple) |
| boundary | 그 경로를 보안과 관련 있게 만드는 제품 표면과 신뢰 경계[](source:sfa-tuple) |
| counterevidence, proof gaps | 주장을 약하게 하거나 범위를 줄이는 정적 사실, 더 강한 결론을 막는 빠진 사실[](source:sfa-tuple) |

근거는 가장 작은 범위에서 넓은 범위로 찾는다. 사용자나 scanner가 준 위치, 의존성 manifest와 lockfile과 배포 설정, 영향받은 함수와 호출처, 가까운 guard, `SECURITY.md`나 위협 모델 같은 제품 표면 근거 순이다. 의존성이 있다거나 문자열이 맞는다는 사실, 호출 연쇄의 일부만으로 평가를 끝내지 않는다.[](source:sfa-order)[](source:sfa-tuple) 근거가 없으면 그 부재가 주장을 꺾는 경우가 아닌 한 proof gap으로 적는다.[](source:sfa-order)

판정 · 이 reference는 정적 확신도 `high`, `medium`, `low`를 정의하지만 `verify-fix`의 결과 계약에는 확신도 필드가 없다. reference는 최종 schema와 라벨을 호출 스킬이 정한다고 하므로, 이 스킬에서는 판정 값 3개와 근거 문장이 최종 출력이다.[](source:sfa-conf)[](source:sfa-out)[](source:v-json)

판정은 보수적으로 올린다. 증거가 모자라면 더 강한 판정으로 가지 않고 `inconclusive`로 간다.[](source:v-verdict)

| status | 쓰는 조건 |
|---|---|
| `fixed` | 증거가 원래 보안 경계가 닫혔고 정당한 동작이 유지됨을 증명할 때만 쓴다. {good:증명 필요}[](source:v-verdict) |
| `still_vulnerable` | 증거가 원래 취약 경로에 여전히 도달할 수 있음을 증명할 때만 쓴다. {bad:증명 필요}[](source:v-verdict) |
| `inconclusive` | repository 불일치, 원래 맥락 없음, 선택한 모드가 요구하는 검사 불가, 증명되지 않은 정당한 통제, 그 밖의 실질적 증명 빈틈일 때 쓴다. {caution:기본 도착지}[](source:v-verdict) |

- 대화형 요청이면 읽기 쉬운 Markdown으로 쓴다. finding마다 판정, source 참조가 달린 근거, 관련 검사, 남은 증명 빈틈을 적는다.[](source:v-result)
- 호출자가 JSON이나 자동 결과 계약을 요청하면 `{"results": [{"id", "status", "evidence"}]}` 모양의 JSON 객체 하나만 낸다. 원문은 CLI 검증 workflow가 이 계약을 명시적으로 요청한다고 적는다. 두 형식 모두 판정 값과 근거 요건은 같다.[](source:v-json)
- 판정을 더 강하게 만들려고 읽기 전용 경계를 풀거나, 다른 취약점으로 바꿔치거나, 빠진 근거를 숨기지 않는다.[](source:v-never)

## 다른 스킬과 어디에서 이어지나? {#position}

`verify-fix`는 `remediate-finding` 묶음에 속하지만 앞뒤로 호출하는 스킬이 없다. 이웃은 모두 같은 계열 관계이며 필수 순서가 아니다.

@workflow id=position-flow title="수정 검증의 이웃 스킬"
| fix | fix-finding | backend | source:ff-mode |
| risk | assess-patch-risk | backend | source:apr-desc |
| current | verify-fix | backend | source:v-when |
| fix > current | 같은 계열 R30 | dashed |
| risk > current | 같은 계열 R31 | dashed |

@steps id=position-steps
| highlight | verify-fix | 이 페이지의 스킬이다. 두 이웃은 직접 호출 관계가 아니다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R30 · 같은 계열, 추론 | 두 스킬이 `standard`, `static` 모드를 같은 이름과 같은 뜻으로 쓰고 static 서술이 거의 같다.[](source:ff-mode)[](source:v-mode) `verify-fix`는 수정 구현이나 테스트 실행만으로는 켜지지 않는다.[](source:v-when) `fix-finding`의 workbench Verify 단계도 소스를 바꾸지 않는다.[](source:ff-verify) 두 가지가 어떻게 겹치는지는 원문에 명시 없음. |
| R31 · 같은 계열, 추론 | `assess-patch-risk`는 patch의 회귀 위험과 merge 자격을, `verify-fix`는 원래 취약점이 막혔는지를 본다. 둘 다 파일을 바꾸지 않는다. 직접 연결은 없다.[](source:apr-desc)[](source:v-obj) |
| R63 · 참고, 명시-이름 | 평가 방법으로 `static-finding-assessment.md`를 읽는다. 이 문서는 호출 스킬이 판정과 형식을 소유한다고 정한다.[](source:v-ref)[](source:sfa-intro) |

벤더 안내문은 이 스킬을 "Give it the original finding and the current checkout to see whether the fix worked or what evidence is missing"로 소개한다.[](source:readme)

전체 흐름은 색인 기준 `codex-security/_group-remediate-finding`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 폴더 | `SKILL.md`(4,193B)와 `agents/openai.yaml`(235B)을 끝까지 읽었다. `openai.yaml`에는 `default_prompt`와 `short_description`뿐이고 호출 제한 필드는 없다.[](source:v-full)[](source:v-yaml) |
| 플러그인 공용 참조 | `references/static-finding-assessment.md`(3,949B)를 끝까지 읽었다. 이 파일은 스킬이 직접 지목한다.[](source:sfa-full)[](source:v-ref) |
| 관계 대조 | 원장 R30, R31, R63을 원문과 맞췄다. `fix-finding/SKILL.md`는 18~20줄과 76줄만, `assess-patch-risk/SKILL.md`는 3줄만 읽었다.[](source:ff-mode)[](source:ff-verify)[](source:apr-desc) |
| 공통 확인 | `skills/README.md` 33줄, `.mcp.json`(2,078B), `.codex-plugin/plugin.json`(1,682B)을 읽었다. SKILL 본문에는 MCP 도구 호출이 적혀 있지 않고 이 둘에 기대는 지시도 없다.[](source:readme)[](source:mcp-json)[](source:plugin-json) |
| 수치 | 원문에 숫자 기준은 없다. 판정 값 3개와 모드 2개를 모두 옮겼다. |
| 제외 | 번역본은 없다. 바이너리는 없다. 읽은 텍스트 파일은 스킬 폴더 2개, 공용 참조 1개, 공통 확인 3개, 관계 대조용 3개다. |

@callout level=open-question title="확인하지 못한 부분"
| `fix-finding`의 Verify 단계와 이 스킬이 겹치는 방식은 원문에 없다.
| 호스트가 description의 호출 제한을 실제로 지키는지, CLI가 JSON 계약을 어떻게 검사하는지는 실행하지 않아 확인하지 못했다.
| 호출자가 어떤 prompt로 `verificationMode: static`을 넘기는지는 이 스킬 폴더에 없다. 호출 쪽 구현은 확인하지 않았다.

분석 중 원본은 수정하지 않았다. 원문의 어떤 지시도 실행하지 않았다.
