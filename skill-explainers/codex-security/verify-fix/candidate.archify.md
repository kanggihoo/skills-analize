# verify-fix는 보안 수정이 막혔는지 어떻게 판정하나? {#verify-fix-page}

`verify-fix`는 사용자가 보안 수정의 검증을 명시적으로 요청할 때만 쓴다. 현재 checkout에서 finding마다 `fixed`, `still_vulnerable`, `inconclusive` 중 하나를 내고, 저장소 파일은 바꾸지 않는다.[](source:when)[](source:obj)[](source:json) 부분 분석이다. 스킬이 읽으라는 플러그인 루트 reference를 컬렉션에서 구할 수 없어 읽지 못했다.

- 수정 구현이나 테스트 실행만으로는 켜지지 않는다. 비보안 수정, 후보 finding 검증, 전체 scan에도 쓰지 않는다.[](source:front)[](source:when)
- 파일 생성·수정·삭제, patch 적용, commit, artifact 쓰기, issue tracker 수정이 모두 금지다.[](source:obj)
- 기본은 `standard`다. 호출자가 `verificationMode: static`을 고르면 build, test, reproducer, 앱 실행을 하지 않는다.[](source:mode)
- 닫힌 ticket, 관련 없는 통과 테스트, 새 scan finding이 없다는 사실은 증거가 아니다.[](source:wf5)

@answer scope="원문 분석 · 스킬 폴더 2개 파일 · 실행 없음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source full title="codex-security/verify-fix/SKILL.md · 4193B · 스킬 본문(원본)" path=codex-security/verify-fix/SKILL.md
@source front title="codex-security/verify-fix/SKILL.md · 4193B · frontmatter" path=codex-security/verify-fix/SKILL.md lines=1:4
@source when title="codex-security/verify-fix/SKILL.md · 4193B · 호출 조건" path=codex-security/verify-fix/SKILL.md lines=10:10
@source obj title="codex-security/verify-fix/SKILL.md · 4193B · 목적과 읽기 전용 경계" path=codex-security/verify-fix/SKILL.md lines=14:14
@source ref title="codex-security/verify-fix/SKILL.md · 4193B · 평가 방법 reference" path=codex-security/verify-fix/SKILL.md lines=18:18
@source mode title="codex-security/verify-fix/SKILL.md · 4193B · standard와 static 모드" path=codex-security/verify-fix/SKILL.md lines=20:20
@source wf1 title="codex-security/verify-fix/SKILL.md · 4193B · 절차 1단계" path=codex-security/verify-fix/SKILL.md lines=24:24
@source wf2 title="codex-security/verify-fix/SKILL.md · 4193B · 절차 2단계" path=codex-security/verify-fix/SKILL.md lines=25:25
@source wf3 title="codex-security/verify-fix/SKILL.md · 4193B · 절차 3단계" path=codex-security/verify-fix/SKILL.md lines=26:26
@source wf4 title="codex-security/verify-fix/SKILL.md · 4193B · 절차 4단계" path=codex-security/verify-fix/SKILL.md lines=27:27
@source wf5 title="codex-security/verify-fix/SKILL.md · 4193B · 절차 5단계" path=codex-security/verify-fix/SKILL.md lines=28:28
@source result title="codex-security/verify-fix/SKILL.md · 4193B · 결과 형식" path=codex-security/verify-fix/SKILL.md lines=32:34
@source json title="codex-security/verify-fix/SKILL.md · 4193B · JSON 계약" path=codex-security/verify-fix/SKILL.md lines=34:46
@source verdict title="codex-security/verify-fix/SKILL.md · 4193B · 판정 값 조건" path=codex-security/verify-fix/SKILL.md lines=48:50
@source never title="codex-security/verify-fix/SKILL.md · 4193B · 판정을 올리지 않는 규칙" path=codex-security/verify-fix/SKILL.md lines=52:52
@source yaml title="codex-security/verify-fix/agents/openai.yaml · 235B · UI 메타데이터" path=codex-security/verify-fix/agents/openai.yaml
@source fixf title="codex-security/fix-finding/SKILL.md · 18461B · 18번째 줄만 읽음(R30 대조)" path=codex-security/fix-finding/SKILL.md lines=18:18
@source apr title="codex-security/assess-patch-risk/SKILL.md · 8299B · 3번째 줄만 읽음(R31 대조)" path=codex-security/assess-patch-risk/SKILL.md lines=3:3

## 이 스킬은 언제 켜지고 무엇을 하지 못하나? {#activation}

호출 조건은 두 곳에 있다. 하나는 description이고 다른 하나는 본문 "When to Use"다. description은 모델이 호출을 판단할 때 참고하는 설명이며, 특정 단어와 정확히 일치해야 켜지는 사전이 아니다.[](source:front)

@code source=front language=yaml

| 구분 | 원문 규칙 |
|---|---|
| 켜는 경우 | 보안 수정을 검증해 달라는 명시적 요청이나 `$verify-fix` 직접 호출이다.[](source:when) |
| 켜지 않는 경우 | 수정 구현이나 그 테스트 실행 요청만으로는 켜지 않는다. 일반 코드 변경 리뷰, 비보안 수정, 후보 finding 검증, 전체 repository scan에도 쓰지 않는다.[](source:front)[](source:when) |
| 금지 | repository 파일을 만들거나 고치거나 지우지 않는다. patch를 적용하거나 commit하지 않는다. artifact를 쓰지 않고 issue tracker를 고치지 않는다.[](source:obj) |
| 호출 제한 필드 | frontmatter에 `disable-model-invocation`이 없고 `agents/openai.yaml`에도 `policy`가 없다. 원문에 명시 없음.[](source:front)[](source:yaml) |

판정 · 자동 호출을 막는 장치는 description과 "When to Use"의 문장뿐이다. 필드로 강제하지 않으므로 호스트가 이 문장을 지키는지는 실행으로 확인해야 한다.[](source:front)[](source:when)[](source:yaml)

## 어떤 순서로 수정 여부를 판정하나? {#procedure}

에이전트는 먼저 원래 취약점과 지켜야 할 정당한 동작을 정한다. 그다음 현재 checkout에서 공격 경로를 다시 따라간다. `standard` 모드에서만 reproducer와 회귀 검사를 돌릴 수 있다.[](source:wf1)[](source:wf3)[](source:wf4)

@workflow id=verify-flow title="수정 검증 절차"
| origin | 원래 취약점 확정 | backend | source:wf1 |
| present | 구성요소 확인 | backend | source:wf2 |
| trace | 공격 경로 추적 | backend | source:wf3 |
| mode | 어떤 모드인가? | backend | source:mode |
| runtime | 검사 실행 | backend | source:wf4 |
| verdict | finding별 판정 | backend | source:wf5 |
| origin > present | |
| present > trace | |
| trace > mode | |
| mode > runtime | standard |
| mode > verdict | static |
| runtime > verdict | |

@steps id=verify-steps
| origin | 원래 취약점 확정 | 공격자가 제어하는 입력, 보안 경계, 전제 조건, 계속 동작해야 하는 정당한 동작을 정한다.[](source:wf1) | verify-flow | origin |
| present | 구성요소 확인 | 현재 checkout에 영향받은 구성요소가 있는지 본다. 파일이 없어지거나 줄이 지워지거나 함수 이름이 바뀐 것을 수정의 증거로 보지 않고 옮겨진 코드를 따라간다.[](source:wf2) | verify-flow | present |
| trace | 공격 경로 추적 | 원래 경로를 현재 구현에서 따라가며 가장 가까운 통제, 같은 효과를 내는 다른 경로, 우회 가능성을 본다.[](source:wf3) | verify-flow | trace |
| mode | 어떤 모드인가? | 호출자가 `verificationMode: static`을 고르지 않았으면 `standard`다.[](source:mode) | verify-flow | mode |
| runtime | 검사 실행 | `standard`에서만 한다. 원래 reproducer, 회귀 검사, 정당한 동작 검사를 repository를 바꾸지 않고 돌릴 수 있을 때 돌린다. 못 돌리면 정적 근거를 그대로 남긴다.[](source:wf4) | verify-flow | runtime |
| verdict | finding별 판정 | 요청받은 순서대로 finding 하나에 결과 하나를 낸다.[](source:wf5) | verify-flow | verdict |

| 모드 | 하는 일 | 하지 않는 일 |
|---|---|---|
| `standard`(기본) | 원래 reproducer, 집중 회귀 검사, 정당한 동작 검사를 repository 수정 없이 돌릴 수 있을 때 돌린다.[](source:wf4) | repository를 바꾸는 검사는 돌리지 않는다.[](source:wf4) |
| `static` | 현재 source와 diff, 원래 공격 경로와 우회 가능성, 호출자와 기존 테스트를 소스로 읽어 평가한다. 근거에 정적 평가이며 runtime 검사를 하지 않았다고 적는다.[](source:mode) | 의존성 설치, build, test, reproducer, 앱 실행을 하지 않는다. validation 지시가 요청해도 하지 않는다.[](source:mode) |

`static`에서 runtime 도구가 없다는 사실만으로는 `inconclusive`가 아니다. source 근거에 실질적인 빈틈이 있으면 `inconclusive`다.[](source:mode)

호출자가 평가 방법 reference의 내용을 prompt에 이미 넣었으면 다시 읽지 않는다.[](source:ref)

## 판정 값은 무엇이고 어떤 근거가 필요한가? {#verdicts}

판정은 보수적으로 올린다. `fixed`와 `still_vulnerable`은 증명이 있을 때만 쓰고, 그 밖의 모든 빈틈은 `inconclusive`로 간다.[](source:verdict)

| status | 쓰는 조건 |
|---|---|
| `fixed` | 증거가 원래 보안 경계가 닫혔고 정당한 동작이 유지됨을 증명할 때만 쓴다. {good:증명 필요}[](source:verdict) |
| `still_vulnerable` | 증거가 원래 취약 경로에 여전히 도달할 수 있음을 증명할 때만 쓴다. {bad:증명 필요}[](source:verdict) |
| `inconclusive` | repository 불일치, 원래 맥락 없음, 선택한 모드가 요구하는 검사 불가, 증명되지 않은 정당한 통제, 그 밖의 실질적 증명 빈틈일 때 쓴다. {caution:기본 도착지}[](source:verdict) |

- 대화형 요청이면 읽기 쉬운 Markdown으로 쓴다. finding마다 판정, source 참조가 달린 근거, 관련 검사, 남은 증명 빈틈을 적는다.[](source:result)
- 호출자가 JSON이나 자동 결과 계약을 요청하면 `{"results": [{"id", "status", "evidence"}]}` 모양의 JSON 객체 하나만 낸다. 원문은 CLI 검증 workflow가 이 계약을 명시적으로 요청한다고 적는다.[](source:json)
- 판정을 더 강하게 만들려고 읽기 전용 경계를 풀거나, 다른 취약점으로 바꿔치거나, 빠진 근거를 숨기지 않는다.[](source:never)

## 다른 스킬과 어디에서 이어지나? {#position}

`verify-fix`는 `remediate-finding` 묶음에 속하지만 앞뒤로 호출하는 스킬이 없다. 이웃은 모두 같은 계열 관계이며 필수 순서가 아니다.

@workflow id=position-flow title="수정 검증의 이웃 스킬"
| fix | fix-finding | backend | source:fixf |
| risk | assess-patch-risk | backend | source:apr |
| current | verify-fix | backend | source:when |
| fix > current | 같은 계열 R30 | dashed |
| risk > current | 같은 계열 R31 | dashed |

@steps id=position-steps
| highlight | verify-fix | 이 페이지의 스킬이다. 두 이웃은 직접 호출 관계가 아니다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R30 · 같은 계열 | `fix-finding`과 `verify-fix`가 `standard`, `static` 모드를 같은 이름으로 쓴다.[](source:fixf)[](source:mode) `verify-fix`는 수정 구현이나 테스트 실행만으로는 켜지지 않는다.[](source:when) `fix-finding` 안의 Verify 단계와 어떻게 겹치는지는 원문에 명시 없음. |
| R31 · 같은 계열 | `assess-patch-risk`는 patch의 회귀 위험과 merge 자격을, `verify-fix`는 원래 취약점이 막혔는지를 본다. 둘 다 파일을 바꾸지 않는다. 직접 연결은 없다.[](source:apr)[](source:obj) |
| R63 · 범위 밖 참고 | 플러그인 루트 `references/static-finding-assessment.md`를 평가 방법으로 읽으라고 한다.[](source:ref) 컬렉션에 없어 읽지 못했다. |

전체 흐름은 색인 기준 `_group-remediate-finding/remediate-finding.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `codex-security/verify-fix/SKILL.md` 1개, 4,193B를 끝까지 읽었다.[](source:full) |
| UI 메타데이터 | `agents/openai.yaml` 1개, 235B를 읽었다. `default_prompt`와 `short_description`만 있고 호출 제한 필드는 없다.[](source:yaml) |
| 관계 대조 | 관계 원장 R30, R31, R63 3행을 원문과 대조했다. `fix-finding/SKILL.md`는 18번째 줄만, `assess-patch-risk/SKILL.md`는 3번째 줄만 읽었다.[](source:fixf)[](source:apr) |
| 수치 | 원문에 숫자 기준은 없다. 판정 값 3개와 모드 2개를 모두 옮겼다. |
| 제외 | 번역본은 없다. 바이너리는 없다. 부분 읽음 파일은 위 관계 대조용 2개뿐이다. |

@callout level=open-question title="확인하지 못한 부분"
| 플러그인 루트 `references/static-finding-assessment.md`와 `default-severity-rubric.md`를 읽지 못했다. 평가 방법이 판정 값을 더 제한하는지 알 수 없다. |
| 호스트가 description의 호출 제한을 실제로 지키는지, JSON 계약을 CLI가 어떻게 검사하는지는 실행하지 않아 확인하지 못했다. |
| `fix-finding`의 Verify 단계와 이 스킬이 겹치는 방식은 원문에 없다. |

분석 중 원본은 수정하지 않았다. 원문의 어떤 지시도 실행하지 않았다.
