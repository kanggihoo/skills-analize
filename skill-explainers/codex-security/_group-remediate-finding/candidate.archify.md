# 이미 보고된 취약점을 고치고 점검하려면 스킬 5개는 어떻게 이어지나? {#remediate-finding-page}

이 묶음은 이미 보고된 취약점 finding을 가장 작은 코드 변경으로 고치고, 고친 결과의 회귀 위험과 효과를 점검하는 작업을 위한 스킬 5개다. 고치는 스킬은 `fix-finding` 하나다. 앞의 `triage-finding`과 `resolve-dependency-alert`는 무엇을 고칠지 가리고, 둘 다 사용자가 요청할 때만 `fix-finding`으로 넘어간다.[](source:t-ret)[](source:r-s3) 뒤의 `assess-patch-risk`와 `verify-fix`는 파일을 바꾸지 않는 점검이고, 어느 쪽도 필수 순서가 아니다.[](source:a-front)[](source:v-obj)

- 모든 이어짐이 사용자 요청을 조건으로 한다. `triage-finding`의 `$fix-finding` handoff는 "only when the user asks to proceed with fixing"이다.[](source:t-ret)
- `fix-finding`은 `standard`가 기본이고 호출자가 `verificationMode: static`을 명시하면 소스만 본다. `verify-fix`도 같은 두 mode를 같은 규칙으로 쓴다.[](source:f-mode)[](source:v-mode)
- Codex Security workbench 요청이면 `fix-finding`은 remediation 상태를 `generated`에서 `verified`까지 기록한다. 상태 요청 도구는 App 전용이고 전이표는 SKILL.md보다 넓다.[](source:f-wbintro)[](source:tool-request)[](source:rem-trans)
- 원문이 서로 다르게 말하는 곳이 두 군데 있다: 상태 전이(R83)와 `verify-fix`·`fix-finding`의 검증 중복(R30). 어느 쪽이 우선인지 원문에 명시가 없어 아래 표에 둘 다 보여 준다.

@answer scope="스킬 5개 · R27~R31, R75, R83 · 실행 없음 · 구현 파일은 줄 범위만"
@meta locale=ko
@source t-front title="활성화 설명(frontmatter)" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=1:4
@source t-core title="목적과 실행 경계" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=8:10
@source t-intake title="입력 종류와 finding이 없을 때" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=12:14
@source t-ticket title="Jira와 Linear 입력" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=16:20
@source t-gh title="GitHub 입력" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=22:24
@source t-norm title="입력 정규화" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=26:35
@source t-policy title="SECURITY.md 검토" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=37:50
@source t-assess title="주장 하나를 정적 근거로 평가" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=52:60
@source t-verd title="판정 3개" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=62:68
@source t-rank title="순위와 owner hint" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=70:74
@source t-ret title="결과 반환과 fix-finding handoff" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=76:84
@source t-yaml title="UI 메타데이터" path=codex-security/plugins/codex-security/skills/triage-finding/agents/openai.yaml
@source tc-art title="봉인된 findings 입력" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=7:12
@source tc-next title="recommended_next_step와 fix_finding_handoff 필드" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=79:80
@source tc-verd title="허용 판정 값" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=95:99
@source tc-null title="handoff는 confirmed일 때만" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=111:114
@source gr-src title="GitHub source 선택" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=13:24
@source gr-dep title="Dependabot 절" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=56:69
@source ti-ro title="Jira와 Linear 읽기 전용 import" path=codex-security/plugins/codex-security/skills/triage-finding/references/ticket-intake.md lines=40:48
@source r-front title="활성화 설명(frontmatter)" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=1:4
@source r-untrusted title="보고서는 믿지 않는 근거" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=8:8
@source r-route title="가져오기, 알림 조회, Dependabot, malware" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=10:10
@source r-s1 title="1단계 읽기 전용 추적" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=12:12
@source r-s2 title="2단계 영향 범위와 업그레이드 가능성" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=13:13
@source r-s3 title="3단계 업그레이드 요청 시 fix-finding" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=14:14
@source r-out title="보고 항목과 dismissal" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=16:18
@source r-yaml title="UI 메타데이터" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/agents/openai.yaml
@source f-front title="활성화 설명(frontmatter)" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=1:4
@source f-storage title="저장 정책 먼저 읽기" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=8:8
@source f-obj title="목표" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=10:14
@source f-mode title="verification mode" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=16:20
@source f-contract title="Patch Contract" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=22:31
@source f-wf-a title="구현 1~2단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=35:36
@source f-wf-b title="구현 3단계와 제안 patch" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=37:38
@source f-wf-c title="구현 4~5단계와 blocked" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=39:47
@source f-review title="수정 리뷰" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=49:53
@source f-wbintro title="workbench 요청 식별" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=57:57
@source f-tools title="trusted Python과 Git, 외부 filter 차단" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=59:63
@source f-gen title="Generate 단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=65:70
@source f-genpatch title="patch 전달 방식" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=71:72
@source f-apply title="Apply 단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=73:75
@source f-verify title="Verify 단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=76:76
@source f-fail title="단계 실패 기록과 worker 책임" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=78:80
@source f-out title="결과 계약" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=82:94
@source f-report title="scan 폴더 보고서" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=96:96
@source f-hard title="Hard Rules" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=98:105
@source f-yaml title="UI 메타데이터" path=codex-security/plugins/codex-security/skills/fix-finding/agents/openai.yaml
@source v-front title="활성화 설명(frontmatter)" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=1:4
@source v-when title="호출 조건" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=8:10
@source v-obj title="목표와 읽기 전용" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=12:14
@source v-assess title="정적 평가 문서 읽기" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=18:18
@source v-mode title="verification mode" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=20:20
@source v-flow title="검증 5단계" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=22:28
@source v-verdict title="판정 값" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=48:52
@source v-yaml title="UI 메타데이터" path=codex-security/plugins/codex-security/skills/verify-fix/agents/openai.yaml
@source a-front title="활성화 설명(frontmatter)" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=1:4
@source a-storage title="저장 정책 먼저 읽기" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=8:8
@source a-bind title="정확한 patch 고정과 보존" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=20:24
@source a-flow title="영향 추적과 반례 탐색" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=25:31
@source a-rec title="권고와 workflow label" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=33:50
@source a-val title="출력과 검증기" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=52:77
@source a-hard title="Hard Rules" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=79:86
@source a-yaml title="UI 메타데이터" path=codex-security/plugins/codex-security/skills/assess-patch-risk/agents/openai.yaml
@source rb-gate title="auto-merge gate" path=codex-security/plugins/codex-security/skills/assess-patch-risk/references/risk-rubric.md lines=61:76
@source ws-doc title="Windows 검증 호출(인용 안 함)" path=codex-security/plugins/codex-security/skills/assess-patch-risk/references/windows-validation.md
@source sch-sha title="patch.sha256 형식" path=codex-security/plugins/codex-security/schemas/patch-risk-assessment.schema.json lines=8:26
@source sa-doc title="정적 평가 방법" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=1:21
@source sg-doc title="SECURITY.md 해석 규칙" path=codex-security/plugins/codex-security/references/security-guidance.md lines=34:36
@source st-doc title="보조 파일 저장 정책" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=11:13
@source st-sealed title="봉인된 scan 파일과 Generate" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=56:56
@source sc-fix title="fix report 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=114:121
@source sc-contract title="봉인된 scan의 findings.json" path=codex-security/plugins/codex-security/references/scan-contract.md lines=3:12
@source fs-doctype title="documentType 값" path=codex-security/plugins/codex-security/schemas/findings.schema.json lines=7:7
@source tool-set title="remediation setter 입력" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=418:445
@source tool-request title="App 전용 요청 도구 2개" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1675:1717
@source tool-setter title="set_codex_security_finding_remediation 등록" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1775:1796
@source rem-trans title="상태 전이표" path=codex-security/plugins/codex-security/scripts/workbench_remediation.py lines=713:723
@source rem-pending title="대기 action 검사" path=codex-security/plugins/codex-security/scripts/workbench_remediation.py lines=726:748
@source readme-fix title="벤더 스킬 선택 안내" path=codex-security/plugins/codex-security/skills/README.md lines=11:34
@source x-pub-desc title="publish-findings 활성화 설명" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=3:3
@source x-pub title="Continuum patch 수집" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=28:28
@source x-hard title="국소 수정과 보강안" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=22:30
@source x-val title="활성화 설명과 근거 확인" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=3:13
@source x-trk title="issue 본문의 finding id와 fingerprint" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=76:76
@source x-pol title="활성화 설명" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=3:3
@source x-pol-chain title="정책 우선순위" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=28:28

## finding에서 수정과 점검까지 스킬은 어떤 순서로 움직이나? {#flow span=12}

이 그림은 사용자가 요청하는 경로를 그린다. 시작점은 둘이고, 사용자가 요청하면 `fix-finding`으로 가며, 수정 뒤에는 읽기 전용 점검 두 가지 중 하나를 고를 수 있다. 그림에서 생략한 것은 다음과 같다.

- `assess-patch-risk`와 `verify-fix`가 서로 같은 계열이라는 관계(R31)는 직접 연결이 없어서 간선으로 그리지 않았다.
- 묶음 밖 스킬과의 연결(R32~R37, R40, R46)은 관계 패널의 표에 있다.
- `fix-finding` 안의 workbench 상태 전이(R83)는 다음 패널에서 따로 그린다.
- 점검 결과가 `fix-finding`으로 되돌아가는 간선은 원문에 명시가 없어 그리지 않았다.

@workflow id=remediate-flow title="finding에서 수정과 점검으로"
| scan | 봉인된 findings.json | external | source:sc-contract |
| triage | triage-finding | backend | source:t-front |
| resolve | resolve-dependency-alert | security | source:r-front |
| ask | 사용자가 수정을 요청했나? | backend |
| fix | fix-finding | backend | source:f-front |
| chk | 수정 뒤 점검을 요청했나? | backend |
| assess | assess-patch-risk | backend | source:a-front |
| verify | verify-fix | backend | source:v-front |
| end | 보고하고 끝 | external |
| scan > triage | R75 파일 제공 |
| triage > ask | R27 handoff |
| resolve > ask | R28 변경안 |
| ask > fix | 예 | emphasis |
| ask > end | 아니오 |
| fix > chk | 수정 있음 | emphasis |
| chk > assess | R29 patch 위험 |
| chk > verify | R30 효과 확인 |
| chk > end | 아니오 |

@steps id=remediate-steps
| scan-step | 봉인된 findings.json | 이 노드는 스킬이 아니라 입력 파일이다. 봉인된 scan 계약은 scan이 끝난 뒤 남는 finding 기록을 `findings.json`으로 정의한다.[](source:sc-contract) 사용자가 `documentType`이 `codex-security.findings`인 유효한 파일을 직접 줄 때만 `triage-finding`이 그 파일을 입력 원천으로 쓴다. 이때 `findingId`, `occurrenceId`, `ruleId`를 출처 식별자로 보존하고, 새 입력이 완료된 scan schema를 따를 필요는 없다.[](source:tc-art)[](source:fs-doctype) 자동으로 이어 주는 문장은 원문에 명시 없음이라 R75는 산출물 호환이고 순서가 아니다. 이 파일을 만드는 scan 스킬 세 가지는 이 페이지에서 다시 열지 않았고 `skill-explainers/codex-security/_group-scan-vulnerabilities/scan-vulnerabilities.html`이 다룬다. | remediate-flow | scan |
| triage-step | triage-finding | 에이전트는 사용자가 준 SARIF 결과, CVE, advisory, scanner ticket, bug bounty 보고서, Codex Security artifact, 자유 서술 주장을 받는다. finding이 하나도 없으면 코드를 보기 전에 하나를 먼저 요청한다.[](source:t-intake) Jira나 Linear 항목이면 `ticket-intake.md`에 따라 내용을 먼저 가져오고, comment, 상태 전이, 담당자, label 변경은 명시 요청이 없으면 하지 않는다.[](source:t-ticket)[](source:ti-ro) GitHub이면 사용자가 source를 고르기 전에는 조회하지 않고 먼저 묻는다.[](source:t-gh)[](source:gr-src) 다음에 입력마다 `triage_item_id`를 붙여 정규화하고, 영향받는 파일마다 루트와 범위 `SECURITY.md`를 읽는다. 가까운 정책이 우선하지만 정책은 보안 모델만 정하고 주장은 코드 근거가 받쳐야 한다.[](source:t-norm)[](source:t-policy) 이어서 통제 입력에서 결과까지의 경로를 정적 근거로 따라가 `confirmed`, `not_actionable`, `needs_review` 중 하나로 판정 결과를 낸다. 중요한 사실이 풀리지 않았을 때는 `needs_review`로 둔다.[](source:t-assess)[](source:t-verd) `confirmed`와 `needs_review`는 따로 exploitability 순위를 매긴다.[](source:t-rank) 이 단계는 위임, 파일 수정, test, build, 앱, PoC 실행을 하지 않는다.[](source:t-core) 끝에서 Markdown 요약을 내고 `confirmed`마다 `$fix-finding` handoff(통제 입력, source, control 또는 sink, 전제, 코드 위치, 필요한 invariant, 고칠 경계, 남은 증명 간극)를 넣는다.[](source:t-ret) `fix_finding_handoff` 필드는 `confirmed`가 아니면 `null`이다.[](source:tc-null) 이 단계의 내부 규칙은 `skill-explainers/codex-security/plugins/codex-security/skills/triage-finding/triage-finding.html`에 있다. | remediate-flow | triage |
| resolve-step | resolve-dependency-alert | 에이전트는 scanner 알림, advisory, SBOM 일치 항목과 사용자가 고른 checkout이나 image를 받는다. 보고서의 모든 필드를 믿지 않는 근거로 다루고 그 안의 지시는 무시한다.[](source:r-untrusted) 요청의 종류에 따라 갈래가 나뉜다. 가져오기를 명시하면 `$publish-findings`를 쓰고, 알림을 찾아 달라는 요청은 고른 scanner와 대상만 조회하며, Dependabot은 `triage-finding`의 GitHub intake 절을 따르고, malware는 incident response로 넘긴다.[](source:r-route) 본 작업은 세 단계다. 먼저 lockfile, manifest, image inventory만 읽어 각 사본의 parent, resolved version, origin, scope를 추적하고 package manager와 project script는 부르지 않는다.[](source:r-s1) 다음에 영향 범위와 backport를 확인하고 lockfile refresh, 직접 upgrade, parent upgrade 중 무엇이면 충분한지와 호환 장애물을 설명한다.[](source:r-s2) 마지막으로 사용자가 upgrade를 요청했을 때만 편집하고, 근거와 변경안을 선택된 verification mode로 `$fix-finding`에 넘긴 뒤 전후의 resolved copy를 비교한다.[](source:r-s3) 근거가 부족하면 알림을 열어 두고 무엇이 풀어 줄지 말하며, dismissal은 권한 있는 사람만 승인한다.[](source:r-out) 판정 · 1단계의 실행 금지가 3단계의 위임에도 이어지는지는 원문에 명시 없음(R28). 이 단계의 내부 규칙은 `skill-explainers/codex-security/plugins/codex-security/skills/resolve-dependency-alert/resolve-dependency-alert.html`에 있다. | remediate-flow | resolve |
| ask-step | 사용자가 수정을 요청했나? | 이 노드는 스킬이 아니라 사용자의 결정이다. 두 시작점 모두 요청이 있어야 다음으로 간다. `triage-finding`은 사용자가 고치자고 할 때만 `$fix-finding`을 호출하고, `resolve-dependency-alert`는 사용자가 upgrade를 요청할 때만 편집한다.[](source:t-ret)[](source:r-s3) 요청이 없으면 결과를 보고하는 것으로 끝나고 자동으로 `fix-finding`이 켜지지 않는다. 요청이 있어도 `fix-finding`의 description은 사용자가 fix and verify를 명시할 때만 쓰라고 한다.[](source:f-front) resolve의 "upgrade 요청"이 이 조건에 해당하는지는 원문에 명시 없음(R28). 판정 · 그래서 이 노드는 두 스킬이 공통으로 두는 사람 결정 지점으로 읽는다. | remediate-flow | ask |
| fix-step | fix-finding | 에이전트는 현재 finding을 받는다. 출처는 `triage-finding`의 handoff, `resolve-dependency-alert`의 근거와 변경안, 또는 사용자가 직접 준 finding일 수 있다. `fix-finding` 쪽에 handoff를 받는다는 문장은 원문에 명시 없음(R27). 먼저 저장 정책을 읽고, verification mode를 정한다. 기본은 `standard`이고 호출자가 `verificationMode: static`을 명시하면 소스와 diff만 본다. 선택한 mode는 위임한 모든 agent에 넘긴다.[](source:f-storage)[](source:f-mode) 고치기 전에 구현, 직접 호출자, 근처 helper, 기존 test를 읽어 공격자 입력과 source-to-sink 경로, 지켜야 할 invariant, 가장 좁은 공유 경계, 유지할 동작을 정한다.[](source:f-contract) 이미 안전하다는 근거가 있으면 변경 없이 `no_change`를 반환한다. 아니면 가장 작은 repository-native fix를 공유 경계에 구현하고, finding에 제안 patch가 있으면 시작 후보로 쓰고 현재 checkout과 hunk를 비교한다.[](source:f-wf-a)[](source:f-wf-b) 검증 전에 patch를 반박하는 눈으로 직접 호출자와 조건의 양쪽 결과를 점검하고, 선택한 mode의 검증을 통과해야 한다. 중요한 근거, 도구, 접근, 제품 결정이 없으면 `blocked`를 반환한다.[](source:f-wf-c) 이어서 읽기 전용 리뷰어가 patch를 독립적으로 검토하고, 확인된 문제만 고친다.[](source:f-review) 끝은 `fixed`, `no_change`, `blocked` 중 하나이고, `fixed`는 선택한 mode의 통과 조건을 모두 넘겨야 쓸 수 있다.[](source:f-out)[](source:f-hard) 기존 scan 폴더가 있으면 `<artifacts_dir>/fix_report.md`에 보고서를 쓴다.[](source:f-report) workbench 요청이면 단계별 상태를 기록하며, 다음 패널이 그 부분을 다룬다. 이 단계의 내부 규칙은 `skill-explainers/codex-security/plugins/codex-security/skills/fix-finding/fix-finding.html`에 있다. | remediate-flow | fix |
| chk-step | 수정 뒤 점검을 요청했나? | 이 노드도 스킬이 아니라 사용자의 결정이다. 판정 · 원문은 `fix-finding`이 끝난 뒤 점검 스킬을 부르라고 하지 않고, `assess-patch-risk`와 `verify-fix`도 `fix-finding`을 이름으로 지목하지 않는다. 그래서 이 노드는 순서가 아니라 선택지를 그린 것이다. 점검 스킬은 둘 다 `fix-finding`이 만든 결과가 아니어도 받는다. `assess-patch-risk`는 patch 파일, provider PR diff, 커밋 범위를 받고, `verify-fix`는 현재 checkout과 원래 finding을 받는다.[](source:a-front)[](source:v-obj) 간선의 R29는 산출물 호환이고 R30은 같은 계열이라 필수 순서가 아니다. `verify-fix`는 수정을 구현하거나 테스트를 돌려 달라는 요청만으로는 켜지지 않는다.[](source:v-when) 요청이 없으면 여기서 끝난다. | remediate-flow | chk |
| assess-step | assess-patch-risk | 에이전트는 변하지 않는 patch 하나를 받는다. patch 파일, provider의 최종 비교 PR diff, base와 head가 정해진 커밋 범위만 받는다. 정확한 patch 바이트의 SHA-256과 base, head, 변경 파일을 기록하고, 산출물이 불완전하거나 정체가 바뀌면 `hold_for_evidence`로 멈춘다. 작업 트리를 직접 평가하지 않고 검토 대상 checkout과 patch 파일은 고치지 않는다.[](source:a-bind) 이어서 변경의 의미를 production, test, generated, 설정, 의존성, migration, 문서, build로 나누고, 변경된 심볼을 호출자에서 production 진입점까지 따라가며, 경계마다 반례와 정상 통제를 찾고, 회귀 보호와 복구 가능성을 평가한다.[](source:a-flow) 끝에는 권고를 하나만 낸다. `merge`, `revise`, `no_op`, `block`, `hold_for_evidence` 중 하나이고, `merge`이면 `auto_merge_candidate` 또는 `human_review_required` 라벨을 붙인다.[](source:a-rec) 라벨은 조언일 뿐 merge 권한을 주지 않는다. 반환 전에 helper로 JSON을 검증하며 이 페이지는 helper를 실행하지 않았다.[](source:a-val) patch를 만들거나 수정, 적용, push, merge하지 않는다.[](source:a-hard) 이 단계의 내부 규칙은 `skill-explainers/codex-security/plugins/codex-security/skills/assess-patch-risk/assess-patch-risk.html`에 있다. | remediate-flow | assess |
| verify-step | verify-fix | 에이전트는 원래 finding과 현재 checkout을 받는다. 명시 요청일 때만 쓰고, 파일, patch, commit, artifact, issue tracker를 바꾸지 않는다.[](source:v-when)[](source:v-obj) 먼저 원래 취약점과 전제, 경계, 유지할 동작을 정리하고, checkout에 해당 구성요소가 있는지 확인한다. 파일이 사라졌다고 해서 고쳐졌다고 보지 않고 이동·리팩터링된 코드를 따라간다. 이어서 원래 공격 경로를 현재 구현에서 따라가 가장 가까운 control, 동등한 경로, 우회 가능성을 본다. `standard`이면 저장소를 바꾸지 않고 돌릴 수 있는 재현과 회귀 검사만 실행한다.[](source:v-flow) finding마다 하나씩, 요청한 순서로 `fixed`, `still_vulnerable`, `inconclusive` 중 하나를 낸다. 닫힌 ticket, 관련 없는 통과 test, 새 scan finding이 없다는 사실은 증명으로 치지 않는다.[](source:v-flow)[](source:v-verdict) 이 단계의 내부 규칙은 `skill-explainers/codex-security/plugins/codex-security/skills/verify-fix/verify-fix.html`에 있다. | remediate-flow | verify |
| end-step | 보고하고 끝 | 이 노드는 종료다. 요청이 없으면 `triage-finding`은 요약 응답으로, `resolve-dependency-alert`는 알림 ID와 근거 보고로 끝난다.[](source:t-ret)[](source:r-out) 점검 스킬 둘도 자기 판정을 돌려주고 끝난다.[](source:a-rec)[](source:v-verdict) 판정 · 어느 노드에서도 요청 없이 다음 스킬로 넘어가는 문장은 원문에 없다. | remediate-flow | end |

## workbench 요청이면 remediation 상태는 어떻게 움직이나? {#remediation-state span=12}

Codex Security workbench 요청이 scan ID, occurrence ID, remediation request ID, action token, expected version을 담고 있으면 `fix-finding`은 받은 `scanId`, `occurrenceId`, `requestId`, `actionToken`으로 `get_codex_security_scan_context`를 불러 배정된 finding을 읽고, 요청된 단계만 수행한다. 단계 경계는 코드를 쓸 수 있는 시점만 바꾸고 검증 요구를 약하게 하지 않는다.[](source:f-wbintro)

이 절은 R83이고 지시상 동작이다. 도구와 helper는 실행하지 않았고 소스의 선언과 전이표만 읽었다.

그림은 앞으로 가는 길만 그렸다. 같은 상태 재기록, `failed`로 가는 전이, `failed`에서 다시 들어가는 전이는 그리지 않았고 아래 전이표에 모두 있다.

@workflow id=remediation-states title="remediation 상태의 앞으로 가는 길"
| req | requested | external |
| gen | generated | backend |
| app | applied | backend |
| ver | verifying | backend |
| done | verified | backend |
| req > gen | Generate | emphasis |
| gen > app | Apply | emphasis |
| app > ver | Verify 시작 | emphasis |
| ver > done | 근거 충족 | emphasis |
| done > ver | 다시 검증 |

@steps id=remediation-steps
| req-step | requested | UI가 요청을 대기열에 올린 상태다. 이 상태는 모델이 부르는 setter의 `state` 입력 값에 없다. 값은 `generated`, `applied`, `verifying`, `verified`, `failed`뿐이고, 도구 설명도 UI가 요청을 대기 중으로 표시하고 Codex가 나머지를 기록한다고 적는다.[](source:tool-set)[](source:tool-setter) action을 요청하는 `request_codex_security_finding_remediation`과 `request_codex_security_finding_remediation_action`은 "App-only" 도구라 모델이 부르지 않는다. 앞의 도구가 Generate 요청을, 뒤의 도구가 Apply와 Verify 요청을 맡는다.[](source:tool-request) 대기 action이 없을 때 `requested`에서 `generated`로 가려면 generate를 먼저 요청해야 한다.[](source:rem-pending) SKILL.md에는 `requested`라는 상태 이름이 없다. | remediation-states | req |
| gen-step | generated | Generate 단계다. 에이전트는 편집이나 repository 명령을 하기 전에 worker와 자식 프로세스의 파일 쓰기를 격리된 worktree나 임시 작업 공간으로 가둔다. 가둘 수 없으면 편집 전에 `failed`를 기록한다. 소스와 회귀 test를 그 안에서 만들고 `set_codex_security_finding_remediation`에 `state: "generated"`로 등록한다.[](source:f-gen) 앞서 Python과 Git은 통제된 빈 디렉터리에서 골라 대상 checkout 밖 경로를 검증하고, 외부 Git filter는 두 mode에서 모두 막는다.[](source:f-tools) 만든 patch는 UTF-8이면 문자열로, UTF-8이 아니면 base64 객체로 `patch`에 그대로 보낸다. 이미 검토한 scan 안 patch는 `patchPath`와 `patchDigest`로 가리키며, 이 digest는 `sha256:` 접두어와 소문자 hex 64자다.[](source:f-genpatch)[](source:tool-set) 봉인된 scan 파일은 보조 파일 저장 도구로 고칠 수 없어 Generate 요청은 이 setter로 등록한다.[](source:st-sealed) | remediation-states | gen |
| app-step | applied | Apply 단계다. 기록된 base revision과 patch digest를 확인한 뒤 정확히 그 patch만 선택한 작업 트리에 적용하고, 관련 없는 편집은 하지 않는다. 결과는 `applied` 또는 `failed`로 기록하고 이 단계에서는 검증하거나 finding을 닫지 않는다. 원문의 예는 `components/api` 아래 `handler.py` 하나만 고치는 경우로, 루트에서 `git apply --no-index --check`를 하고 같은 바이트로 다시 적용하며 `--directory=<prefix>`를 쓴다. 하위 디렉터리 안에서 실행하면 성공 코드로 끝나면서 변경이 건너뛰어질 수 있다고 경고한다.[](source:f-apply) 적용할 방법을 안전하게 정할 수 없으면 쓰기 전에 `failed`를 기록한다. 대기 action이 없을 때 `generated`에서 `applied`로 가려면 apply를 먼저 요청해야 한다.[](source:rem-pending) | remediation-states | app |
| ver-step | verifying | Verify 단계가 진행 중인 상태다. SKILL.md의 Verify 단락은 `verified`와 `failed`만 기록한다고 적고 `verifying`을 언제 쓰는지는 원문에 명시 없음. 도구 enum과 전이표, 대기 verify action이 허용하는 값에는 있다.[](source:f-verify)[](source:tool-set)[](source:rem-pending) 이 단계에서 에이전트는 소스를 바꾸지 않고, 기록된 patch에 선택한 mode의 검증 조건을 적용한다.[](source:f-verify) 대기 action이 없을 때 `applied`에서 `verifying`으로 가려면 verify를 먼저 요청해야 한다.[](source:rem-pending) | remediation-states | ver |
| done-step | verified | 근거가 원래의 취약한 경로가 닫혔고, 정상 동작이 유지되며, 필요한 검사가 통과했음을 증명할 때만 `verified`를 기록한다. 정확한 근거와 실행한 명령은 검증 요약에 남긴다. 아니면 `failed`를 기록하고 실패한 조건이나 증명 간극을 적으며 finding은 닫지 않는다.[](source:f-verify) 전이표는 `verified`에서 `verifying`으로 돌아가는 것과 `verified` 재기록을 허용한다. SKILL.md에는 이 되돌림에 대한 서술이 없다.[](source:rem-trans) | remediation-states | done |

단계가 실패하면 에이전트는 `failed`를 기록하고 실패한 단계와 오류를 `summary`에 적으며, 등록이 실패했으면 setter의 오류도 넣는다. 부모 thread가 단계를 위임했다면 worker가 마지막 workbench 갱신까지 맡고 부모는 같은 편집을 되풀이하거나 chat 응답을 완료로 보지 않는다.[](source:f-fail)

다음 표가 `require_transition`의 전체 전이표다.[](source:rem-trans)

| 현재 상태 | 다음에 기록할 수 있는 상태 |
| --- | --- |
| `requested` | `requested`, `generated`, `failed` |
| `generated` | `generated`, `applied`, `failed` |
| `applied` | `applied`, `verifying`, `failed` |
| `verifying` | `verifying`, `verified`, `failed` |
| `verified` | `verifying`, `verified` {caution:되돌아감} |
| `failed` | `generated`, `applied`, `verifying`, `verified`, `failed` {caution:어느 단계로든 재진입} |

대기 중인 action이 있으면 그 action이 허용한 상태만 기록할 수 있다.[](source:rem-pending)

- generate action은 `generated`나 `failed`만 허용한다.
- apply action은 `applied`나 `failed`만 허용한다.
- verify action은 `verifying`, `verified`, `failed`를 허용한다.

아래 표는 SKILL.md와 도구 소스가 같은 상태 기록을 다르게 말하는 곳이다. 우선순위는 원문에 명시가 없어 어느 쪽도 고르지 않았다.

| 항목 | fix-finding SKILL.md | 도구 소스 |
| --- | --- | --- |
| 기록하는 상태 이름 | `generated`, `applied`, `verified`, `failed`만 나오고 `requested`와 `verifying`은 없다.[](source:f-gen)[](source:f-apply)[](source:f-verify) | setter 입력은 `generated`, `applied`, `verifying`, `verified`, `failed`이고 전이표는 `requested`도 상태로 둔다.[](source:tool-set)[](source:rem-trans) |
| 단계 순서 | Generate, Apply, Verify를 요청된 것만 한다. Apply는 "Do not verify or close the finding in this stage"다.[](source:f-wbintro)[](source:f-apply) | 앞으로 가는 전이 외에 같은 상태 재기록, 모든 단계에서 `failed`, `failed`에서 `verified`로 바로 가는 전이도 허용한다.[](source:rem-trans) {caution:표가 더 넓다} |
| 실패 뒤 | 다시 시도하는 경우로 "retrying a failed Generate request"만 적는다.[](source:f-genpatch) | `failed`에서 `generated`, `applied`, `verifying`, `verified`로 들어갈 수 있다.[](source:rem-trans) |
| action 요청 주체 | 누가 Apply와 Verify를 요청하는지 원문에 명시 없음. | Generate는 App 전용 도구, Apply와 Verify는 App 전용 `..._action` 도구가 요청한다.[](source:tool-request) |

## verify-fix와 fix-finding의 검증은 어떻게 겹치나? {#verify-overlap span=12}

두 스킬은 verification mode의 이름과 뜻이 같고, 서로를 이름으로 지목하는 문장은 어느 쪽에도 없다. 그래서 같은 요청에서 두 스킬이 어떻게 나뉘는지는 원문에 명시 없음이다(R30, 같은 계열, 근거 방식 추론). 아래 표는 두 원문을 나란히 놓은 것이다.

| 비교 | fix-finding | verify-fix |
| --- | --- | --- |
| mode | `standard`가 기본이고 호출자가 `verificationMode: static`을 명시하면 static이다.[](source:f-mode) | 같은 두 mode를 같은 규칙으로 쓴다.[](source:v-mode) |
| static에서 금지 | 의존성 설치, build, test, reproducer, 앱 실행을 하지 않는다. 검증 지시가 요청해도 같다.[](source:f-mode) | 같은 문장으로 금지한다.[](source:v-mode) |
| 파일 변경 | 코드와 회귀 test를 고치고 변경 파일과 추가한 test를 보고한다.[](source:f-out) | 파일, patch, commit, artifact, issue tracker를 바꾸지 않는다.[](source:v-obj) |
| 결과 이름 | `fixed`, `no_change`, `blocked`. `fixed`는 선택한 mode의 통과 조건을 모두 넘겨야 한다.[](source:f-out)[](source:f-hard) | `fixed`, `still_vulnerable`, `inconclusive`.[](source:v-verdict) |
| 호출 조건 | description은 사용자가 fix and verify를 명시할 때만 쓰라고 한다.[](source:f-front) | 명시 요청일 때만 쓰고, 수정 구현이나 테스트 실행만으로는 켜지지 않는다.[](source:v-when) {caution:자동 호출 금지} |
| workbench Verify 단계 | 소스를 바꾸지 않고 기록된 patch에 검증 조건을 적용해 `verified`나 `failed`를 기록한다.[](source:f-verify) | workbench 단계에 대한 서술은 원문에 명시 없음. |

판정 · `fixed`라는 같은 이름이 두 스킬에서 다른 계약에 쓰인다. `fix-finding`의 `fixed`는 고치고 검증까지 끝났다는 뜻이고 `verify-fix`의 `fixed`는 이미 있는 수정이 막았다는 뜻이다. 한 요청 안에서 두 값을 섞어 읽지 않도록 어느 스킬의 값인지 함께 적는다.[](source:f-out)[](source:v-verdict)

## 스킬 사이에 무엇을 어떤 조건으로 주고받나? {#relations span=12}

이 묶음 안의 관계다. 표의 `그림`은 첫 번째 패널의 그림에 그린 방식이다.

| rel-id · 종류 | 방향과 조건 | 넘기는 것 | 그림 |
| --- | --- | --- | --- |
| R27 · 넘김(명시-이름) | `triage-finding`에서 `fix-finding`으로 간다. `confirmed`마다 `$fix-finding` handoff를 결과에 넣고, 실제 호출은 "only when the user asks to proceed with fixing"이다. 결과 계약의 JSON 예시에 `recommended_next_step: "fix-finding"`이 있으나 허용값 목록은 계약에 없다.[](source:t-ret)[](source:tc-next) | handoff 요약과 `fix_finding_handoff`. `confirmed`가 아니면 `null`이다.[](source:tc-null) | 간선 `R27 handoff`와 결정 노드 |
| R28 · 넘김(명시-이름) | `resolve-dependency-alert`에서 `fix-finding`으로 간다. "Edit only when the user requests an upgrade"이고 요청 전에는 읽기 전용이다. 선택된 verification mode로 넘긴다.[](source:r-s3)[](source:f-mode) | 근거와 제안한 의존성 변경 | 간선 `R28 변경안`과 결정 노드 |
| R29 · 산출물 호환(명시-역할) | `fix-finding`에서 `assess-patch-risk`로 간다. Generate 단계의 unified diff를 `generated`로 기록하고, `assess-patch-risk`는 변하지 않는 patch를 입력으로 받는다. 필수 순서는 아니다.[](source:f-gen)[](source:a-front)[](source:a-bind) | patch 파일과 digest. 도구의 digest는 `sha256:<소문자 64 hex>`이고 `assess-patch-risk` schema의 `patch.sha256`은 접두어 없는 64자다.[](source:tool-set)[](source:sch-sha) | 결정 노드 뒤 간선 `R29 patch 위험` |
| R30 · 같은 계열(추론) | `fix-finding`과 `verify-fix`는 같은 verification mode를 쓴다. 직접 연결은 없다. 겹침은 위 패널에 있다.[](source:f-mode)[](source:v-mode) | `verificationMode` 값 | 결정 노드 뒤 간선 `R30 효과 확인` |
| R31 · 같은 계열(추론) | `assess-patch-risk`와 `verify-fix`는 fix가 이미 있을 때 파일을 바꾸지 않고 점검한다. 앞은 patch의 회귀 위험과 merge 자격을, 뒤는 원래 취약점이 막혔는지를 본다. 직접 연결은 없다.[](source:a-front)[](source:v-obj) | 없음 | 생략(직접 연결 없음) |
| R75 · 산출물 호환(명시-역할) | 봉인된 scan의 `findings.json`에서 `triage-finding`으로 간다. 사용자가 유효한 `codex-security.findings` 파일을 줄 때만 입력으로 쓰고 자동 연결은 없다.[](source:tc-art)[](source:fs-doctype)[](source:sc-contract) | `findings.json` | 간선 `R75 파일 제공` |
| R83 · 참고(명시-이름) | `fix-finding`이 workbench 요청일 때 remediation 도구를 쓴다. 전이와 충돌은 앞 패널에 있다.[](source:f-wbintro)[](source:rem-trans) | remediation 상태, patch 경로와 digest, 검증 요약 | 두 번째 그림 |

다른 묶음의 스킬과 이어지는 관계다. 이 관계들은 첫 번째 그림에서 생략했다. 상대 스킬은 해당 묶음 페이지가 다룬다.

| rel-id · 종류 | 방향과 조건 | 생략한 이유 |
| --- | --- | --- |
| R33 · 참고(명시-이름) | `resolve-dependency-alert`가 Dependabot 알림 조회에 `triage-finding`의 `github-rest-intake.md` Dependabot 절을 따른다. 그 절은 CVE ID가 있으면 `source_type`을 `cve`, 없으면 `advisory`로 정한다.[](source:r-route)[](source:gr-dep) | 안내 문서 참조라 흐름이 아니다 |
| R35 · 넘김(명시-이름) | `resolve-dependency-alert`에서 `publish-findings`로 간다. 가져오기를 명시 요청할 때만이다.[](source:r-route)[](source:x-pub-desc) | 상대 스킬이 `skill-explainers/codex-security/_group-external-findings/external-findings.html` 묶음이다 |
| R37 · 산출물 호환(명시-역할) | `publish-findings`에서 `fix-finding`으로 간다. Continuum finding 하나를 `--source-root`와 함께 수집하면 따라오는 `patches[].patch`를 `fix-finding`이 시작 후보로 쓰고 현재 checkout과 hunk를 비교한다.[](source:x-pub)[](source:f-wf-b) | 상대 스킬이 `external-findings` 묶음이다 |
| R34 · 참고(추론) | `propose-security-hardening`이 "Independent findings may be best handled by local fixes"라 하고 남는 tactical fix를 적는다. `fix-finding`을 이름으로 지목하지 않는다.[](source:x-hard) | 상대 스킬이 `skill-explainers/codex-security/_group-finding-reports/finding-reports.html` 묶음이다 |
| R32 · 같은 계열(추론) | `triage-finding`과 `validation`은 둘 다 finding이나 후보에 근거 기반 판정을 내린다. 앞은 정적 근거만 쓰고, 뒤는 필요하면 재현도 쓴다. 직접 연결은 없다.[](source:t-front)[](source:t-core)[](source:x-val) | 상대 스킬이 `skill-explainers/codex-security/_group-scan-vulnerabilities/scan-vulnerabilities.html` 묶음이다 |
| R40 · 산출물 호환(추론) | `track-findings`가 만든 issue 본문에는 finding id와 fingerprint가 들어가고 `triage-finding`은 보안 Jira, Linear ticket을 입력으로 받는다. 서로를 지목하지 않아 강도가 약하다.[](source:x-trk)[](source:t-ticket) | 상대 스킬이 `external-findings` 묶음이다 |

## 어떤 파일과 상태를 공유하나? {#state span=12}

| 파일·상태 | 쓰는 스킬·주체 | 읽는 스킬·조건 |
| --- | --- | --- |
| 소스 checkout(작업 트리). 원장에 rel-id 없음 | `fix-finding`뿐이다. 구현 단계에서 편집하고 workbench Apply 단계에서 기록된 patch를 적용한다.[](source:f-wf-b)[](source:f-apply) | `triage-finding`과 `verify-fix`는 파일을 바꾸지 않는다. `resolve-dependency-alert`도 요청 전에는 읽기 전용이다. `assess-patch-risk`는 선택한 checkout과 patch를 고치지 않는다.[](source:t-core)[](source:v-obj)[](source:r-s1)[](source:a-bind) |
| `SECURITY.md`(루트와 범위별) · R46 | `define-security-policy`가 새로 쓰거나 검토한다. 이 묶음 밖 스킬이다.[](source:x-pol)[](source:x-pol-chain) | `triage-finding`이 영향받는 파일마다 읽는다. 가까운 정책이 우선한다. 선후 관계는 없다.[](source:t-policy)[](source:sg-doc) |
| `findings.json` · R75 | 봉인된 scan이 남긴다.[](source:sc-contract) | `triage-finding`이 사용자가 파일을 줄 때만 입력으로 읽는다.[](source:tc-art) |
| triage 결과의 `fix_finding_handoff` · R27 | `triage-finding`이 결과 계약에 따라 낸다.[](source:tc-next)[](source:tc-null) | 사용자가 고치자고 하면 `fix-finding`을 호출한다. `fix-finding` 쪽에 이 handoff를 받는다는 문장은 원문에 명시 없음.[](source:t-ret)[](source:f-front) |
| Generate 단계의 unified diff와 digest · R29 | `fix-finding`이 workbench 도구로 기록한다.[](source:f-gen)[](source:f-genpatch) | `assess-patch-risk`가 변하지 않는 patch 입력으로 받을 수 있다. 필수 순서는 아니다.[](source:a-bind) |
| Continuum `patches[].patch` · R37 | `publish-findings`가 수집한 capture에 담긴다.[](source:x-pub) | `fix-finding`이 시작 후보로 읽고 현재 checkout과 비교한다.[](source:f-wf-b) |
| remediation 상태 · R83 | `fix-finding`이 `set_codex_security_finding_remediation`으로 기록하고 UI가 대기 요청을 올린다.[](source:tool-set)[](source:tool-setter)[](source:tool-request) | 읽는 주체는 원문에 명시 없음. 도구 설명은 workbench가 상태를 저장한다고만 적는다.[](source:tool-setter) |
| `<artifacts_dir>/fix_report.md` · R85 | 기존 scan 폴더가 있을 때 `fix-finding`이 쓴다. 폴더가 없으면 chat 요약으로 충분하다.[](source:f-report)[](source:sc-fix) | 읽는 스킬은 원문에 명시 없음. 번호 붙은 scan phase 밖에 둔다.[](source:sc-fix) |

이 묶음에는 안내(허브) 역할의 스킬이 없다. 벤더의 `skills/README.md`는 이 스킬들을 "Investigating a finding", "Fixing a bug", "Before you merge or install something"으로 나눠 소개하지만 이는 스킬이 아닌 안내 문서이고, 이 묶음은 작업 목표 단위로 다시 묶은 것이다.[](source:readme-fix)

스킬이 읽으라고 지시하는 플러그인 공용 문서다. 같은 파일을 읽을 뿐 서로 주고받는 산출물은 아니다.

| rel-id · 종류 | 읽는 스킬 | 문서와 용도 |
| --- | --- | --- |
| R60 · 참고(명시-이름) | `fix-finding`, `assess-patch-risk` | 파일을 만들거나 보관하기 전에 `artifact-storage.md`를 읽고 저장 정책을 따른다. 보조 파일은 `save_codex_security_artifact`로만 쓰게 한다.[](source:f-storage)[](source:a-storage)[](source:st-doc) |
| R63 · 참고(명시-이름) | `triage-finding`, `verify-fix` | `static-finding-assessment.md`로 정적 근거 평가 방법을 읽는다. 이 문서는 최상위 workflow가 아니고 판정 결과와 수정 동작은 호출한 스킬이 정한다. `verify-fix`는 호출자가 내용을 prompt에 이미 줬으면 다시 읽지 않는다.[](source:t-assess)[](source:v-assess)[](source:sa-doc) |
| R80 · 참고(명시-이름) | `assess-patch-risk` | 결과 JSON을 반환하기 전에 `validate-patch-risk-assessment` helper로 검증하고, 오류가 나면 증거를 다시 본다. 권고를 검증 통과만을 위해 바꾸지 않는다. gate의 세부는 이 페이지에서 확인하지 않았다.[](source:a-val)[](source:rb-gate) |
| R85 · 참고(명시-이름) | `fix-finding` | scan 폴더 경로를 `scan-artifacts.md`로 푼다. fix 산출물은 번호 붙은 scan phase 밖에 둔다.[](source:f-report)[](source:sc-fix) |

## 어떤 요청에 어떤 스킬을 고르고, 무엇은 하지 않나? {#choose span=12}

description은 모델이 호출 여부를 판단할 때 참고하는 설명일 뿐이고, 정확히 일치해야 켜지는 사전이 아니다. 이 다섯 스킬의 `SKILL.md`에는 `disable-model-invocation` 같은 호출 제한 필드가 없고, 읽은 `openai.yaml` 다섯 개에도 `policy` 키가 없다.[](source:t-front)[](source:r-front)[](source:f-front)[](source:v-front)[](source:a-front)[](source:t-yaml)[](source:r-yaml)[](source:f-yaml)[](source:v-yaml)[](source:a-yaml)

| 요청 | 스킬 | 하지 않는 일 |
| --- | --- | --- |
| scanner 보고서, advisory, GitHub, Jira, Linear 항목이 진짜인지 정적 근거로 가른다 | `triage-finding` | discovery, 중복 triage, runtime validation, 수정에는 쓰지 않는다. 위임, 파일 수정, test, build, 앱 실행도 하지 않는다.[](source:t-front)[](source:t-core) {bad:runtime 검증 아님} |
| 취약한 의존성 알림이 무엇 때문에 들어왔고 올릴 수 있는지 본다 | `resolve-dependency-alert` | 요청 전에는 편집하지 않고 package manager와 project script를 부르지 않는다.[](source:r-s1)[](source:r-s3) |
| 취약점을 고치고 검증하라고 명시한다 | `fix-finding` | 일반 버그 수정, 정확성이나 설계 리뷰 finding, 일반 validation, 전체 PR·commit·branch·patch·repository scan에는 쓰지 않는다.[](source:f-front) {bad:범위 밖} |
| 만들어진 patch의 영향, 회귀 위험, merge 자격을 본다 | `assess-patch-risk` | patch를 만들거나 수정, 적용, push, merge하지 않는다. label은 조언일 뿐 merge 권한이 아니다.[](source:a-front)[](source:a-rec)[](source:a-hard) {caution:조언} |
| 보안 수정이 취약점을 실제로 막았는지 확인한다 | `verify-fix` | 파일, patch, commit, artifact, issue tracker를 바꾸지 않는다. 명시 요청 때만 쓴다.[](source:v-when)[](source:v-obj) {caution:명시 요청} |

@callout level=warning title="자동으로 이어 부르지 않는다"
| `triage-finding`의 `$fix-finding` handoff는 사용자가 고치자고 할 때만 호출한다.[](source:t-ret) |
| `resolve-dependency-alert`는 사용자가 upgrade를 요청할 때만 편집한다. 가져오기도 명시 요청이 있을 때만 `publish-findings`를 쓴다.[](source:r-s3)[](source:r-route) |
| `verify-fix`는 수정을 구현하거나 테스트를 돌리는 도중 자동으로 부르지 않는다.[](source:v-front)[](source:v-when) |

## 어디까지 읽고 확인했나? {#audit span=12}

@facts id=audit-facts
| 읽은 텍스트 파일 | 스킬 폴더 파일 전부 15개(스킬 5개의 `SKILL.md`와 `openai.yaml`, `triage-finding`의 `references/` 3개, `assess-patch-risk`의 `references/` 2개)와 플러그인 공용 문서 일부 |
| 줄 범위만 읽음 | `artifact-storage.md`, `scan-artifacts.md`, `scan-contract.md`, `findings.schema.json`, `patch-risk-assessment.schema.json`, `server.ts`, `workbench_remediation.py`, 다른 묶음 스킬 6개의 해당 줄 |
| 전부 읽음 | `static-finding-assessment.md`, `security-guidance.md`, `skills/README.md` |
| 실행 | 없음. 스크립트, helper, MCP 도구, 외부 URL 모두 열거나 부르지 않았다 |
| 대조 | 원장 R27~R31, R75, R83을 원문 줄과 다시 맞췄다. 관계 표의 R32~R37, R40, R46, R60, R63, R80, R85는 해당 줄만 확인했다 |
| 번역본·바이너리 | 번역본 없음, 바이너리 없음 |

원문과 원장이 어긋나는 곳은 찾지 못했다. `windows-validation.md`는 R80의 Windows 호출 안내라 이 페이지 본문에서 인용하지 않았다. 자동 검증은 HTML 구조와 출처 해석만 확인하고 사실 검증이 아니다. 사람 검토는 미실시다.

@callout level=open-question title="원문에 명시가 없거나 어긋나는 부분"
| `fix-finding`의 SKILL.md와 도구 소스가 remediation 상태 이름, 단계 순서, 실패 뒤 재진입을 다르게 말하고 우선순위가 명시되지 않았다(R83). 위 표에 둘 다 보였다.[](source:f-wbintro)[](source:f-apply)[](source:rem-trans) |
| `fix-finding`의 Verify 단계와 `verify-fix`가 같은 요청에서 어떻게 나뉘는지는 원문에 명시 없음(R30).[](source:f-verify)[](source:v-when) |
| `resolve-dependency-alert` 1단계는 package manager와 project script 호출을 금지하지만 `fix-finding`은 `static`을 명시하지 않으면 `standard`로 검증한다. 위임 때 `static`을 고르라는 문장이 있는지, 업그레이드 요청이 `fix-finding` description의 조건에 해당하는지는 원문에 명시 없음(R28).[](source:r-s1)[](source:r-s3)[](source:f-front)[](source:f-mode) |
| `fix-finding`은 기존 scan 폴더의 `fix_report.md`에 쓰라고 하지만 `artifact-storage.md`는 완료·봉인된 scan 파일을 보조 파일 저장 도구로 고칠 수 없다고 한다. 봉인된 scan에서 어떻게 조정하는지와 우선순위는 원문에 명시 없음(R85).[](source:f-report)[](source:sc-fix)[](source:st-sealed) |
| `assess-patch-risk`가 patch 입력 출처로 `fix-finding`의 Generate 산출물을 지목하는 문장은 없다. R29는 변하지 않는 patch라는 조건이 맞는다는 데서 이은 호환이다. 두 digest의 형식 차이를 옮기는 방법도 원문에 명시 없음이고, `sha256:` 접두어를 떼면 형식이 맞는다는 것은 판정이다.[](source:a-bind)[](source:f-gen)[](source:tool-set)[](source:sch-sha) |
| `triage-finding`의 handoff를 `fix-finding`이 받는다는 문장과, scan 스킬 세 가지가 `findings.json`을 만든다는 근거 문장(R75의 from)은 이 페이지에서 다시 열지 않았다. 후자는 원장과 `skill-explainers/codex-security/_group-scan-vulnerabilities/scan-vulnerabilities.html`에 맡겼다.[](source:t-ret)[](source:f-front) |
| 스킬 페이지가 필수 참조로 읽은 구현 파일(`workbench_target.py`, `workbench_source_scopes.py`, `workbench_db.py`, `validate-patch-risk-assessment.ts`, `resolve-security-md.ts`, `.app.json`)은 이 페이지가 인용하지 않아 다시 열지 않았다. |
