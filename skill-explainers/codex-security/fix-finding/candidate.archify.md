# fix-finding은 보안 finding을 어디까지 고치고 어떻게 고쳐졌다고 인정하나? {#fix-finding-page}

`fix-finding`은 사용자가 명시적으로 요청한 보안 finding을 repository 안의 가장 작은 변경으로 고치고, 선택한 verification mode의 통과 조건을 모두 통과해야 `fixed`라고 보고한다. 이미 안전하면 변경 없이 `no_change`로, 안전한 수정을 끝내거나 검증할 근거가 없으면 `blocked`로 끝낸다.[](source:f-front)[](source:f-obj)[](source:f-out)[](source:f-hard) 부분 분석이다. 스킬이 필수로 읽으라는 플러그인 루트 문서와 호스트 workbench 도구를 컬렉션에서 읽거나 실행하지 못했다.[](source:f-storage)[](source:f-wb)[](source:f-report)

- 일반 버그 수정, 설계 리뷰 지적, 전체 PR나 repository scan에는 쓰지 않는다.[](source:f-front)
- `standard`가 기본이고, 호출자가 `verificationMode: static`을 고르면 build, 테스트, 재현, 앱 실행 없이 소스와 diff만 본다.[](source:f-mode)[](source:f-static)
- 패치를 쓴 뒤 직접 반박해 보고, 필요하면 독립 리뷰어에게 읽기 전용으로 검토시킨다.[](source:f-wf4)[](source:f-review)
- workbench 단계(Generate, Apply, Verify)는 코드를 쓸 수 있는 시점만 다르고 검증 요구는 같다.[](source:f-wb)[](source:f-apply)

@answer scope="로컬 원본 분석 · 폴더 파일 2개 전부 읽음 · 외부 호출과 명령 미실행"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source f-skill title="codex-security/fix-finding/SKILL.md · 18461B · 스킬 본문(원본)" path=codex-security/fix-finding/SKILL.md
@source f-front title="codex-security/fix-finding/SKILL.md · 18461B · frontmatter" path=codex-security/fix-finding/SKILL.md lines=1:4
@source f-storage title="codex-security/fix-finding/SKILL.md · 18461B · 저장 정책 읽기" path=codex-security/fix-finding/SKILL.md lines=8:8
@source f-obj title="codex-security/fix-finding/SKILL.md · 18461B · 목표" path=codex-security/fix-finding/SKILL.md lines=12:14
@source f-mode title="codex-security/fix-finding/SKILL.md · 18461B · verification mode" path=codex-security/fix-finding/SKILL.md lines=16:18
@source f-static title="codex-security/fix-finding/SKILL.md · 18461B · static mode" path=codex-security/fix-finding/SKILL.md lines=20:20
@source f-contract title="codex-security/fix-finding/SKILL.md · 18461B · 패치 계약" path=codex-security/fix-finding/SKILL.md lines=22:31
@source f-wf1 title="codex-security/fix-finding/SKILL.md · 18461B · 1단계 경로 추적" path=codex-security/fix-finding/SKILL.md lines=35:35
@source f-wf2 title="codex-security/fix-finding/SKILL.md · 18461B · 2단계 재현" path=codex-security/fix-finding/SKILL.md lines=36:36
@source f-wf3 title="codex-security/fix-finding/SKILL.md · 18461B · 3단계 구현과 제안 patch" path=codex-security/fix-finding/SKILL.md lines=37:38
@source f-wf4 title="codex-security/fix-finding/SKILL.md · 18461B · 4단계 패치 반박" path=codex-security/fix-finding/SKILL.md lines=39:39
@source f-wf5 title="codex-security/fix-finding/SKILL.md · 18461B · 5단계 standard 검증" path=codex-security/fix-finding/SKILL.md lines=40:43
@source f-wfstatic title="codex-security/fix-finding/SKILL.md · 18461B · static 검증" path=codex-security/fix-finding/SKILL.md lines=45:45
@source f-blocked title="codex-security/fix-finding/SKILL.md · 18461B · blocked 조건" path=codex-security/fix-finding/SKILL.md lines=47:47
@source f-review title="codex-security/fix-finding/SKILL.md · 18461B · 리뷰" path=codex-security/fix-finding/SKILL.md lines=49:53
@source f-wb title="codex-security/fix-finding/SKILL.md · 18461B · workbench 요청 식별" path=codex-security/fix-finding/SKILL.md lines=55:57
@source f-tools title="codex-security/fix-finding/SKILL.md · 18461B · 신뢰할 Python과 Git" path=codex-security/fix-finding/SKILL.md lines=59:59
@source f-filters title="codex-security/fix-finding/SKILL.md · 18461B · 외부 Git filter 차단" path=codex-security/fix-finding/SKILL.md lines=61:63
@source f-gen title="codex-security/fix-finding/SKILL.md · 18461B · Generate 단계" path=codex-security/fix-finding/SKILL.md lines=65:65
@source f-gen-git title="codex-security/fix-finding/SKILL.md · 18461B · Generate: Git 작업 트리" path=codex-security/fix-finding/SKILL.md lines=66:68
@source f-gen-non title="codex-security/fix-finding/SKILL.md · 18461B · Generate: Git 밖 대상과 rehearsal" path=codex-security/fix-finding/SKILL.md lines=69:70
@source f-gen-send title="codex-security/fix-finding/SKILL.md · 18461B · Generate: patch 전달" path=codex-security/fix-finding/SKILL.md lines=71:72
@source f-apply title="codex-security/fix-finding/SKILL.md · 18461B · Apply 단계" path=codex-security/fix-finding/SKILL.md lines=73:75
@source f-verify title="codex-security/fix-finding/SKILL.md · 18461B · Verify 단계" path=codex-security/fix-finding/SKILL.md lines=76:76
@source f-fail title="codex-security/fix-finding/SKILL.md · 18461B · 실패와 위임" path=codex-security/fix-finding/SKILL.md lines=78:80
@source f-out title="codex-security/fix-finding/SKILL.md · 18461B · 결과 계약" path=codex-security/fix-finding/SKILL.md lines=82:94
@source f-report title="codex-security/fix-finding/SKILL.md · 18461B · scan 폴더 보고서" path=codex-security/fix-finding/SKILL.md lines=96:96
@source f-hard title="codex-security/fix-finding/SKILL.md · 18461B · Hard Rules" path=codex-security/fix-finding/SKILL.md lines=98:105
@source f-yaml title="codex-security/fix-finding/agents/openai.yaml · 225B · UI 메타데이터" path=codex-security/fix-finding/agents/openai.yaml
@source f-lock title="codex-security/skills-lock.json · 설치 출처(해당 항목 줄만 읽음)" path=codex-security/skills-lock.json lines=52:57
@source x-tri title="codex-security/triage-finding/SKILL.md · 8394B · fix-finding handoff 줄" path=codex-security/triage-finding/SKILL.md lines=82:82
@source x-tric title="codex-security/triage-finding/references/triage-result-contract.md · 4447B · recommended_next_step 줄" path=codex-security/triage-finding/references/triage-result-contract.md lines=79:79
@source x-res title="codex-security/resolve-dependency-alert/SKILL.md · 2548B · 요청 시 수정 줄" path=codex-security/resolve-dependency-alert/SKILL.md lines=14:14
@source x-apr title="codex-security/assess-patch-risk/SKILL.md · 8299B · description과 patch 고정 줄만 읽음" path=codex-security/assess-patch-risk/SKILL.md lines=3:22
@source x-vf title="codex-security/verify-fix/SKILL.md · 4193B · 호출 조건과 mode 줄만 읽음" path=codex-security/verify-fix/SKILL.md lines=10:20
@source x-pub title="codex-security/publish-findings/SKILL.md · 11118B · Continuum patch 수집 줄만 읽음" path=codex-security/publish-findings/SKILL.md lines=28:28
@source x-hard title="codex-security/propose-security-hardening/SKILL.md · 5026B · 국소 수정과 보강안 줄만 읽음" path=codex-security/propose-security-hardening/SKILL.md lines=22:30

## 언제 쓰고 어떤 mode로 도나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어가 있어야 켜진다는 뜻은 아니다. 원문은 사용자가 고치고 검증하라고 명시했을 때만 쓰라고 한다.[](source:f-front)

호출 제한 필드(`disable-model-invocation` 등)는 SKILL.md에 명시되어 있지 않고, `agents/openai.yaml`에도 `policy`가 없다.[](source:f-front)[](source:f-yaml)

@code source=f-front language=yaml

| 구분 | 원문이 정한 행동 |
|---|---|
| 쓰는 경우 | 검증됐거나 그럴듯한 보안 취약점을 사용자가 명시적으로 고치고 검증하라고 할 때다.[](source:f-front) |
| 쓰지 않는 경우 | 일반 버그 수정, 정확성이나 설계 리뷰 finding, 일반 validation, 전체 PR, commit, branch, patch, repository scan에는 쓰지 않는다.[](source:f-front) {bad:범위 밖} |
| 목표 | 현재 보안 finding을 최소의 검증된 코드 변경으로 바꾼다. 코드가 이미 안전하면 그것을 증명하고 변경이 필요 없었다고 보고한다.[](source:f-obj) |
| 변경 크기 | 필요한 조건을 채우는 repository 고유의 가장 작은 변경을 우선한다.[](source:f-obj) |
| 저장 | 경로를 고르거나 출력을 보관하기 전에 `../../references/artifact-storage.md`를 읽고 그 정책을 따르라고 한다. 컬렉션에 이 파일이 없다.[](source:f-storage) |
| 호출한 쪽의 결과 형식 | 호출자가 output schema를 주면 그것을 따른다. 없으면 아래 항목을 최종 응답에 넣는다.[](source:f-out) |

verification mode가 두 가지다. 선택한 mode는 위임한 리뷰와 workbench 단계까지 모든 곳에 적용되고, 위임한 모든 에이전트에게 넘긴다.[](source:f-mode)

| 항목 | `standard` | `static` |
|---|---|---|
| 선택 | 기본값이다.[](source:f-mode) | 호출자가 `verificationMode: static`을 명시할 때만이다.[](source:f-mode) |
| 확인 방법 | 가능하면 재현, 테스트, build, type check를 돌린다.[](source:f-wf2)[](source:f-wf5) | 소스와 diff 근거만 평가한다. dependency 설치, build, 테스트, reproducer, 앱 실행은 검증 지침이 요청해도 하지 않는다. repository 읽기 도구는 쓸 수 있다.[](source:f-static) {caution:실행 없음} |
| 보고 | 관찰한 실행과 소스 평가를 구분한다.[](source:f-out) | runtime 검사를 하지 않았다고 밝히고, 통과로 세거나 요구하지 않는다.[](source:f-static) |
| 막힘 | 필수 확인이 불가능하면 `blocked`다.[](source:f-hard) | runtime 도구가 없다는 이유만으로는 막히지 않지만, 소스 근거에 중요한 공백이 있으면 `blocked`다.[](source:f-static) |

결과 값은 `fixed`, `no_change`, `blocked` 세 개다. 최종 응답에는 다음을 넣는다.[](source:f-out)

- 구체적인 취약 경로, 지켜야 할 보안 invariant, 유지해야 할 정상 동작
- 고른 패치 전략과 그것이 가장 좁은 완전한 repository 고유 선택지인 이유, 또는 막힌 경우 풀리지 않은 제품 결정
- 바뀐 파일, 추가한 테스트나 검증 산출물, 실행한 명령과 통과, 실패, 알 수 없음 결과
- 원래 취약 경로가 닫혔다는 근거(소스 평가와 관찰한 실행을 구분), 정상 동작이 유지됨을 어떻게 보였는지, 남은 불확실성이나 건너뛴 검증

scan 폴더를 쓰는 경우에는 `../../references/scan-artifacts.md`로 위치를 풀고 fix 보고서 경로에 보이는 보고서를 쓴다. scan 폴더가 없으면 채팅 요약으로 충분하고, 파일은 사용자가 요청할 때만 만든다.[](source:f-report)

## 어떤 순서로 고치고 검증하나? {#fix-process}

@workflow id=fix-flow title="fix-finding 진행 순서"
| trace | 경로 추적 | backend |
| safe | 이미 안전한가? | backend |
| nochange | no_change 보고 | backend |
| patch | 최소 수정 구현 | backend |
| challenge | 패치 반박 점검 | security |
| verify | 검증 통과 조건 | backend |
| review | 독립 리뷰 | security |
| fixed | fixed 보고 | backend |
| blocked | blocked 보고 | external |
| trace > safe | |
| safe > nochange | 예 | dashed |
| safe > patch | 아니오 | |
| patch > challenge | |
| challenge > verify | |
| verify > review | 통과 | |
| review > fixed | 확인 | emphasis |
| verify > blocked | 근거 부족 | dashed |

@steps id=fix-steps
| trace | 경로 추적 | 보고된 경로를 따라가며 진짜 공유 경계를 찾는 데 필요한 맥락만 본다. 먼저 영향받는 구현, 직접 호출자, 근처 helper, 기존 테스트를 확인한다.[](source:f-wf1)[](source:f-contract) | fix-flow | trace |
| safe | 이미 안전한가? | repository 근거로 보고된 경로가 이미 안전하다고 보이면 `no_change`를 반환한다. 추측으로 고치지 않는다.[](source:f-wf1) | fix-flow | safe |
| nochange | no_change 보고 | 변경 없이 안전하다는 증거를 보고한다.[](source:f-obj)[](source:f-wf1) | fix-flow | nochange |
| patch | 최소 수정 구현 | `standard`에서는 가능하면 경계를 지나는 가장 작은 재현 하나와 정상 control 하나를 먼저 돌린다. 이어 공유 경계에 가장 작은 repository 고유 수정을 넣고, 관련 없는 정리, 형제 finding, 구조 개편으로 넓히지 않는다.[](source:f-wf2)[](source:f-wf3) | fix-flow | patch |
| challenge | 패치 반박 점검 | 검증 전에 패치를 방어하지 말고 반박한다. 바뀐 helper의 모든 직접 호출자와 바뀐 조건의 양쪽 결과를 보고, 여전히 취약 sink에 닿는 형제 경로 하나와 새로 거부되거나 재해석되는 평범한 입력 하나를 찾는다. 있으면 구현을 고친다.[](source:f-wf4) | fix-flow | challenge |
| verify | 검증 통과 조건 | 선택한 mode의 통과 조건을 모두 통과해야 한다. 필수 근거, 도구, 접근, 제품·호환 결정이 없어 안전한 수정을 끝내거나 검증할 수 없으면 `blocked`다.[](source:f-wf5)[](source:f-wfstatic)[](source:f-blocked) | fix-flow | verify |
| review | 독립 리뷰 | 복잡도, 불확실성, 보안 영향이 크면 fresh 읽기 전용 리뷰어에게 맡긴다. 위임이 안 되면 별도 pass로 직접 한다.[](source:f-review) | fix-flow | review |
| fixed | fixed 보고 | 모든 통과 조건이 통과한 뒤에만 보고한다. 임시 변경이나 관련 없는 변경이 남지 않았는지 확인한다.[](source:f-review)[](source:f-hard) | fix-flow | fixed |
| blocked | blocked 보고 | 취약점이 실제일 수 있지만 안전한 수정을 끝낼 수 없을 때 어떤 명령이나 설정이 실패했고 어떤 근거가 없는지 정확히 말한다.[](source:f-blocked)[](source:f-hard) | fix-flow | blocked |

패치 전에 정해야 하는 것이 있다. 이름 붙은 입력 예시 하나가 아니라 데이터 흐름과 경계 문제로 본다.[](source:f-contract)

| 정해야 할 것 | 원문 내용 |
|---|---|
| 공격자 입력과 경로 | 공격자가 통제하는 입력과 구체적인 source-to-sink 경로 또는 깨진 통제다.[](source:f-contract) |
| invariant와 경계 | 보안 invariant와 가장 좁은 공유 enforcement 경계다.[](source:f-contract) |
| 유지할 것 | 정상 동작, API, 오류 의미, 호환 제약이다.[](source:f-contract) |
| 선례 | 가장 가까운 기존 구현, 검증, 오류 처리다.[](source:f-contract) |
| 우회 | 동등한 인코딩, parser 형태, alias, 호출자, sink와 보안에 민감한 상태의 모든 표현이나 복사본을 확인한다. 안전하지 않은 상태는 조용히 받거나 자르거나 다른 도달 가능한 형태로 재해석하지 않고 명시적으로 처리한다.[](source:f-contract) |

| 검증 통과 조건 | `standard` | `static` |
|---|---|---|
| diff | 최종 diff를 보고 관련된 가장 좁은 문법, import, build, type 검사를 돌린다.[](source:f-wf5) | 최종 diff를 본다.[](source:f-wfstatic) |
| 악성 입력 | 보안 trigger 또는 가장 강한 집중 대체 검사를 다시 돌리고 다른 악성 입력 종류 하나를 검토한다.[](source:f-wf5) | 원래 exploit 경로와 관련된 다른 입력을 바뀐 통제를 지나 추적한다.[](source:f-wfstatic) |
| 정상 동작 | 정상 control, 가장 가까운 기존 테스트, 소유 package의 필수 검사를 다시 돌린다.[](source:f-wf5) | 호출자와 기존 테스트를 소스로 읽어 정상 동작과 호환이 유지됨을 보인다.[](source:f-wfstatic) |
| 보고 | 명령과 결과를 적는다.[](source:f-out) | 통과 조건마다 소스 근거를 대고 확인하지 못한 것을 밝힌다.[](source:f-wfstatic) |

제안된 patch가 finding에 있으면 시작 후보로 쓴다. AWS Continuum은 collector capture의 `patches[].patch`나 저장된 finding의 `source_data.patches[].patch`를 읽는다. 현재 checkout과 hunk를 비교해 invariant를 지키는 것은 남기고, 우회를 남기거나 정상 동작을 깨는 것은 고치거나 바꾼다. 메타데이터만 있으면 소스에서 수정을 만든다.[](source:f-wf3)

리뷰 규칙은 다음과 같다.[](source:f-review)

- 리뷰어에게는 finding, repository 루트, 허용 범위, repository 정책, verification mode, 후보 diff를 준다. 작성자의 근거와 테스트 결과 주장은 주지 않는다.
- 리뷰가 지적한 것은 소스 또는 `standard`의 집중 실행으로 확인한 뒤에만 패치를 바꾼다.
- 확인된 문제만 finding과 호환 경계 안에서 고치고, 영향받은 통과 조건을 다시 돌린다.
- 수정이 보안 경계를 바꾸거나 새 위험을 만들면 리뷰를 다시 한다.

@callout level=warning title="Hard Rules"
| `fixed`는 선택한 mode의 모든 통과 조건이 통과하기 전에 보고하지 않는다. mode가 요구하는 검사는 repository 근거로 관련 없음이 보일 때만 뺄 수 있고, 쓸 수 없는 필수 검사는 `blocked`로 보고한다.[](source:f-hard) |
| `standard`에서 집중 테스트나 reproducer가 가능한데 코드 검사에만 기대지 않는다. 사용자 변경과 관련 없는 로컬 수정은 지우지 않는다.[](source:f-hard) |
| 테스트를 통과시키려고 authentication, authorization, tenant isolation, input validation, sandboxing, logging을 약하게 만들지 않는다. 검증 공백은 숨기지 않는다.[](source:f-hard) |

## workbench 단계에서는 무엇이 달라지나? {#workbench}

Codex Security workbench 요청에 scan ID, occurrence ID, remediation request ID, action token, expected version이 모두 있을 때 적용된다. 이때 `scanId`, `occurrenceId`, `requestId`, `actionToken`을 `get_codex_security_scan_context`에 넘겨 finding을 불러오고, 요청된 단계만 따른다. 단계 경계는 코드를 쓸 수 있는 시점을 바꾸지만 위의 검증 요구를 약하게 하지 않는다.[](source:f-wb) 아래는 지시상 동작이며 실행해 확인하지 않았다.

| 단계 | 쓰기 | 기록하는 상태와 핵심 조건 |
|---|---|---|
| Generate | 격리된 worktree나 임시 workspace 안에서만 쓴다. worker와 자식 process의 쓰기를 링크를 통해서도 그 안에 가둬야 하고, 못 가두면 편집 전에 `failed`를 기록한다.[](source:f-gen) | `set_codex_security_finding_remediation`에 `state: "generated"`와 unified diff를 보낸다. 문자열 `patch`, 비UTF-8이면 base64 객체, 또는 기존 scan 로컬 patch의 `patchPath`와 `patchDigest`다.[](source:f-gen)[](source:f-gen-send) |
| Apply | 기록된 base revision과 patch digest를 확인한 뒤 그 patch 그대로 선택한 작업 트리에 적용한다. 관련 없는 편집은 없다.[](source:f-apply) | `applied` 또는 `failed`를 기록한다. finding을 verify하거나 닫지 않는다.[](source:f-apply) {caution:닫지 않음} |
| Verify | 소스를 수정하지 않는다. 선택한 mode의 통과 조건을 기록된 patch에 적용한다.[](source:f-verify) | 원래 취약 경로가 닫히고 정상 동작이 유지되고 필요한 검사가 통과했다는 근거가 있을 때만 `verified`. 아니면 `failed`와 실패한 통과 조건이나 증명 간극을 적는다. finding을 닫지 않는다.[](source:f-verify) |

| 공통 규칙 | 원문 내용 |
|---|---|
| 신뢰할 도구 | 작업 복사본을 만들거나 들어가기 전에 비어 있는 제어된 디렉터리에서 Python과 Git을 고른다. 절대 경로, 해석된 상위 디렉터리, 실행 파일이 대상 checkout과 모든 capture·rehearsal workspace 밖이어야 한다. 어느 쪽이든 검증하지 못하면 멈춘다.[](source:f-tools) |
| Python | 호스트가 고른 Python(`CODEX_SECURITY_PYTHON_COMMAND`)을 쓰고, 없으면 신뢰할 절대 경로 `PYTHON`, 호스트가 관리하는 runtime, 검증된 시스템 interpreter 순이다. `-I`로 호출한다.[](source:f-tools) |
| Git | `workbench_target.trusted_git_executable(target)`이 돌려주는 경로를 `CODEX_SECURITY_GIT`에 고정한다. Generate와 Apply의 Git 명령은 `offline=True`와 `-C`를 쓰고 `-c core.hooksPath=`를 비어 있는 private 디렉터리로 둔다.[](source:f-tools) |
| 외부 filter | 실제 대상과 private 작업 디렉터리의 유효 Git 설정에서 `clean`, `smudge`, `process` 명령이 있는 driver를 찾아 그 명령을 모두 비운다. `git config --file`을 별도 인자로 쓴다. driver가 필요하면 Git이 실패하게 둔다. 외부 변환이 필요하면 검토된 기존 scan 로컬 patch를 경로와 digest로 등록하거나 실패를 기록한다.[](source:f-filters) |
| `static`의 추가 조건 | workbench setter의 checkout snapshot과 reverse check도 소스만 보는 검증을 지켜야 한다. 작업 트리와 index attribute에 실행 가능한 filter가 없음을 먼저 배제하고, 확인하지 못하면 그 연산 전에 멈춘다.[](source:f-filters) |
| 단계 실패 | `failed`와 실패한 단계, 오류를 `summary`에 적고, 등록이 실패하면 setter의 오류도 넣는다.[](source:f-fail) |
| 위임 | 부모 thread가 단계를 위임하면 worker가 마지막 workbench 갱신까지 그 단계를 맡는다. 부모는 orchestrator로 남아 worker의 편집을 반복하거나 채팅 응답을 완료로 보지 않는다.[](source:f-fail) |

@facts
| patch 형식 | 변경은 `--binary`, `--no-renames`, `--unified=3`, `--src-prefix=a/`, `--dst-prefix=b/`로 byte 그대로 capture한다. Git 밖 대상은 `a`와 `b` 복사본을 `git diff --no-index`로 비교하고 exit 1이 "다르다"는 뜻이다.[](source:f-gen-git)[](source:f-gen-non) |
| Git 작업 트리 복사 | 기존 파일의 stage-zero blob을 private index에 심고 `BASE`로 `git write-tree`를 기록한다. 복사본에서 `git add -A -- <paths>` 후 `git diff-index --cached`로 capture한다.[](source:f-gen-git) |
| Apply 예시 | 저장소 루트에서 `git apply --no-index --check` 다음 같은 digest 검증 bytes로 `--directory=<prefix>`를 주어 적용한다. 하위 디렉터리 안에서 돌리면 성공 종료하면서 변경을 건너뛸 수 있다.[](source:f-apply) |
| 복원 확인 | 변환이 비Git 변경에 영향을 줄 수 있으면 등록 전에 rehearsal로 앞방향과 뒤방향 결과를 `b`와 `a`의 원문 bytes까지 비교한다. 재현하지 못하면 `failed`다.[](source:f-gen-non) |

## 흐름 속 위치는 어디인가? {#position}

@workflow id=position-flow title="분류와 조사에서 수정과 점검으로"
| triage | triage-finding | backend | source:x-tri |
| resolve | resolve-dependency-alert | backend | source:x-res |
| current | fix-finding | backend | source:f-skill |
| assess | assess-patch-risk | backend | source:x-apr |
| triage > current | 요청 시 R27 | emphasis |
| resolve > current | 요청 시 R28 | emphasis |
| current > assess | 호환 R29 | dashed |

@steps id=position-steps
| highlight | fix-finding | 이 페이지의 스킬이다. 앞 두 스킬은 사용자가 요청할 때만 이 스킬로 넘긴다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R27 · 넘김 | `triage-finding`이 confirmed finding마다 `$fix-finding` handoff를 낸다. 호출은 사용자가 고치자고 할 때만이다. handoff에는 통제 입력, source, control 또는 sink, 전제, 정확한 코드 위치, 필요한 invariant, 고칠 경계, 남은 증명 간극이 있다.[](source:x-tri)[](source:x-tric) |
| R28 · 넘김 | `resolve-dependency-alert`가 사용자의 업그레이드 요청이 있을 때만 근거와 제안한 변경을 선택된 verification mode로 넘긴다. 그 전까지 읽기 전용이다.[](source:x-res)[](source:f-mode) |
| R29 · 산출물 호환 | Generate 단계가 만든 unified diff의 경로와 digest를 `assess-patch-risk`가 입력 patch로 받을 수 있다. 필수 순서는 아니다. `assess-patch-risk`는 patch를 만들거나 적용하지 않는다.[](source:f-gen)[](source:x-apr) |
| R37 · 산출물 호환 | `publish-findings`가 수집한 Continuum patch가 이 스킬의 시작 후보 patch가 된다. 현재 checkout과 비교해 유지하거나 고친다.[](source:x-pub)[](source:f-wf3) |
| R30 · 같은 계열(추론) | `verify-fix`도 `standard`와 `static` mode를 같은 이름으로 쓴다. `verify-fix`는 "구현하거나 테스트를 돌리라는 요청만으로는 이 스킬을 요청한 것이 아니다"라며 fix 작업 중 자동 호출을 막는다. 이 스킬의 Verify 단계와 `verify-fix`가 어떻게 겹치는지는 원문에 명시 없음.[](source:f-mode)[](source:x-vf) |
| R34 · 참고(추론) | `propose-security-hardening`은 독립 finding에는 국소 수정이 나을 수 있다고 하고 어떤 tactical fix가 필요한지 적는다. `fix-finding`을 이름으로 지목하지 않는다.[](source:x-hard) |

전체 흐름은 색인 기준 `_group-remediate-finding/remediate-finding.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 폴더 원본 | 텍스트 파일 2개, 18,686B를 끝까지 읽었다. `SKILL.md` 18,461B(105줄)와 `agents/openai.yaml` 225B다. 긴 줄은 줄바꿈 없이 끝까지 읽었다.[](source:f-skill)[](source:f-yaml) |
| 설치 출처 | `skills-lock.json`에서 이 스킬 항목만 읽었다.[](source:f-lock) |
| 관계 대조 | 원장 행 R27~R30, R34, R37과 범위 밖 R60, R62, R65를 상대 스킬의 해당 줄과 맞춰 봤다. 상대 파일은 해당 줄만 읽었다. |
| 제외 | 번역본과 바이너리는 없다. 부분 읽음 파일은 0개다. |

원문의 mode 2개, 결과 값 3개, 패치 전 확인 항목, 검증 통과 조건, 리뷰 규칙, workbench 3단계와 공통 규칙, Hard Rules 6개를 모두 대조했다.

@callout level=open-question title="읽지 못했거나 확인하지 않은 부분"
| `../../references/artifact-storage.md`와 `../../references/scan-artifacts.md`는 읽으라는 지시가 있지만 컬렉션에 없어 읽지 못했다. 저장 경로와 보고서 위치 규칙을 더 정하는지는 알 수 없다. 관련 원장 행은 R60, R62다. |
| `get_codex_security_scan_context`, `set_codex_security_finding_remediation`, `workbench_target`, `workbench_source_scopes`, `workbench_db` 같은 호스트 도구와 helper 구현이 컬렉션에 없어 실행하지 않았다. 관련 원장 행은 R65다. workbench 단계의 동작은 지시상 동작이다. |
| `verify-fix`와 이 스킬의 Verify 단계가 같은 요청에서 어떻게 나뉘는지는 원문에 명시 없음. |

분석 중 원본은 수정하지 않았다. 스킬 안의 지시(Git 명령, 도구 호출, 파일 쓰기)는 분석할 자료로만 읽었다.
