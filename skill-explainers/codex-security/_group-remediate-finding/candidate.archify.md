# 이미 있는 취약점 finding을 고치고 점검할 때 스킬은 어떻게 이어지나? {#remediate-finding-page}

고치는 스킬은 `fix-finding` 하나다. `triage-finding`과 `resolve-dependency-alert`가 시작점이고, 둘 다 사용자가 요청할 때만 `fix-finding`으로 넘어간다.[](source:t-handoff)[](source:r-s3) `assess-patch-risk`와 `verify-fix`는 수정이 이미 있을 때 파일을 바꾸지 않고 점검하는 선택지이며, 필수 순서가 아니다.[](source:a-front)[](source:v-obj) 이 묶음은 스킬 5개의 `SKILL.md`와 관계 근거 문서를 읽고 쓴 완전 분석이다. 코드와 CLI는 실행하지 않았다.

- `triage-finding`은 제공된 finding마다 정적 근거만으로 `confirmed`, `not_actionable`, `needs_review` 중 하나를 낸다. 파일 수정과 test, build, 앱 실행은 하지 않는다.[](source:t-core)[](source:t-verd)
- `resolve-dependency-alert`는 lockfile과 manifest로 취약한 의존성이 들어온 경로를 읽기 전용으로 추적한다. 업그레이드 요청이 있을 때만 `fix-finding`에 넘긴다.[](source:r-s1)[](source:r-s3)
- `fix-finding`은 고치고 검증하라고 명시했을 때만 쓴다. 선택한 verification mode의 검증을 모두 통과해야 `fixed`다.[](source:f-front)[](source:f-hard)
- workbench 요청이면 `fix-finding`의 remediation 상태가 `requested`에서 `verified`까지 진행하고, `failed`에서는 다시 들어갈 수 있다. 상태 요청 도구는 App 전용이라 모델이 부르지 않는다.[](source:rem-trans)[](source:tool-request)

@answer scope="스킬 5개 · rel-id 7개 + 다른 묶음 연결 8개 · 코드 실행 없음 · 호스트 도구는 소스의 계약만 확인"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source t-front title="codex-security/plugins/codex-security/skills/triage-finding/SKILL.md · 8394B · frontmatter" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=1:4
@source t-core title="triage-finding/SKILL.md · 8394B · 목적과 실행 경계" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=8:10
@source t-input title="triage-finding/SKILL.md · 8394B · 입력과 finding 없을 때 질문" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=14:14
@source t-ticket title="triage-finding/SKILL.md · 8394B · Jira와 Linear 입력" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=16:20
@source t-policy title="triage-finding/SKILL.md · 8394B · SECURITY.md 검토" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=39:48
@source t-assess title="triage-finding/SKILL.md · 8394B · 정적 평가 문서 읽기" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=54:54
@source t-verd title="triage-finding/SKILL.md · 8394B · 판정 3개" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=62:68
@source t-handoff title="triage-finding/SKILL.md · 8394B · fix-finding handoff" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=82:82
@source t-ro title="triage-finding/SKILL.md · 8394B · 읽기 전용 유지" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=84:84
@source t-yaml title="codex-security/plugins/codex-security/skills/triage-finding/agents/openai.yaml · 400B · UI 메타데이터" path=codex-security/plugins/codex-security/skills/triage-finding/agents/openai.yaml
@source tc-art title="codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md · 4447B · 봉인 findings 입력" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=7:12
@source tc-next title="triage-result-contract.md · 4447B · recommended_next_step 줄" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=79:80
@source tc-null title="triage-result-contract.md · 4447B · handoff는 confirmed일 때만" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=114:114
@source gr-src title="codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md · 12277B · source 선택(부분 읽음)" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=13:24
@source gr-dep title="github-rest-intake.md · 12277B · Dependabot 절(부분 읽음)" path=codex-security/plugins/codex-security/skills/triage-finding/references/github-rest-intake.md lines=56:69
@source r-front title="codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md · 2548B · frontmatter" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=1:4
@source r-untrusted title="resolve-dependency-alert/SKILL.md · 2548B · 보고서는 믿지 않는 근거" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=8:8
@source r-route title="resolve-dependency-alert/SKILL.md · 2548B · import 요청, 알림 조회, Dependabot" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=10:10
@source r-s1 title="resolve-dependency-alert/SKILL.md · 2548B · 1단계 읽기 전용 추적" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=12:12
@source r-s3 title="resolve-dependency-alert/SKILL.md · 2548B · 3단계 업그레이드 요청 시 fix-finding" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=14:14
@source r-yaml title="codex-security/plugins/codex-security/skills/resolve-dependency-alert/agents/openai.yaml · 250B · UI 메타데이터" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/agents/openai.yaml
@source f-front title="codex-security/plugins/codex-security/skills/fix-finding/SKILL.md · 18461B · frontmatter" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=1:4
@source f-storage title="fix-finding/SKILL.md · 18461B · 저장 정책 먼저 읽기" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=8:8
@source f-obj title="fix-finding/SKILL.md · 18461B · 목표" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=10:14
@source f-mode title="fix-finding/SKILL.md · 18461B · verification mode" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=16:20
@source f-wf3 title="fix-finding/SKILL.md · 18461B · 구현 단계와 제안 patch" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=37:38
@source f-wbintro title="fix-finding/SKILL.md · 18461B · workbench 요청 식별" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=57:57
@source f-gen title="fix-finding/SKILL.md · 18461B · Generate 단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=65:65
@source f-genpatch title="fix-finding/SKILL.md · 18461B · patch 전달 방식" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=71:72
@source f-apply title="fix-finding/SKILL.md · 18461B · Apply 단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=73:73
@source f-verify title="fix-finding/SKILL.md · 18461B · Verify 단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=76:76
@source f-fail title="fix-finding/SKILL.md · 18461B · 단계 실패 기록과 worker 책임" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=78:80
@source f-out title="fix-finding/SKILL.md · 18461B · 결과 계약" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=82:94
@source f-report title="fix-finding/SKILL.md · 18461B · scan 폴더 보고서" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=96:96
@source f-hard title="fix-finding/SKILL.md · 18461B · Hard Rules" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=98:105
@source f-yaml title="codex-security/plugins/codex-security/skills/fix-finding/agents/openai.yaml · 225B · UI 메타데이터" path=codex-security/plugins/codex-security/skills/fix-finding/agents/openai.yaml
@source v-front title="codex-security/plugins/codex-security/skills/verify-fix/SKILL.md · 4193B · frontmatter" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=1:4
@source v-when title="verify-fix/SKILL.md · 4193B · 호출 조건" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=8:10
@source v-obj title="verify-fix/SKILL.md · 4193B · 목표와 읽기 전용" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=12:14
@source v-assess title="verify-fix/SKILL.md · 4193B · 정적 평가 문서 읽기" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=18:18
@source v-mode title="verify-fix/SKILL.md · 4193B · verification mode" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=20:20
@source v-verdict title="verify-fix/SKILL.md · 4193B · 판정 값" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=48:52
@source v-yaml title="codex-security/plugins/codex-security/skills/verify-fix/agents/openai.yaml · 235B · UI 메타데이터" path=codex-security/plugins/codex-security/skills/verify-fix/agents/openai.yaml
@source a-front title="codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md · 8299B · frontmatter" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=1:4
@source a-storage title="assess-patch-risk/SKILL.md · 8299B · 저장 정책 먼저 읽기" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=8:8
@source a-bind title="assess-patch-risk/SKILL.md · 8299B · 정확한 patch 고정" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=22:24
@source a-rec title="assess-patch-risk/SKILL.md · 8299B · 권고와 workflow label" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=35:50
@source a-val title="assess-patch-risk/SKILL.md · 8299B · 출력과 검증기" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=54:75
@source a-hard title="assess-patch-risk/SKILL.md · 8299B · Hard Rules" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=79:86
@source a-yaml title="codex-security/plugins/codex-security/skills/assess-patch-risk/agents/openai.yaml · 274B · UI 메타데이터" path=codex-security/plugins/codex-security/skills/assess-patch-risk/agents/openai.yaml
@source rb-gate title="codex-security/plugins/codex-security/skills/assess-patch-risk/references/risk-rubric.md · 5049B · auto-merge gate" path=codex-security/plugins/codex-security/skills/assess-patch-risk/references/risk-rubric.md lines=61:76
@source sch-sha title="codex-security/plugins/codex-security/schemas/patch-risk-assessment.schema.json · 6858B · patch.sha256 형식(부분 읽음)" path=codex-security/plugins/codex-security/schemas/patch-risk-assessment.schema.json lines=14:22
@source sa-doc title="codex-security/plugins/codex-security/references/static-finding-assessment.md · 3949B · 정적 평가 방법" path=codex-security/plugins/codex-security/references/static-finding-assessment.md lines=1:6
@source st-doc title="codex-security/plugins/codex-security/references/artifact-storage.md · 7947B · 저장 정책" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=11:18
@source st-sealed title="artifact-storage.md · 7947B · 봉인된 scan 파일과 Generate" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=56:56
@source sc-fix title="codex-security/plugins/codex-security/references/scan-artifacts.md · 11701B · fix report 경로(부분 읽음)" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=114:121
@source tool-set title="codex-security/plugins/codex-security/mcp-app/server.ts · 84254B · remediation 도구 입력(부분 읽음)" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=418:445
@source tool-ctx title="server.ts · 84254B · get_codex_security_scan_context 설명(부분 읽음)" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1348:1357
@source tool-request title="server.ts · 84254B · App 전용 요청 도구 2개(부분 읽음)" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1675:1717
@source tool-setter title="server.ts · 84254B · set_codex_security_finding_remediation(부분 읽음)" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1775:1796
@source rem-trans title="codex-security/plugins/codex-security/scripts/workbench_remediation.py · 35923B · 상태 전이표(부분 읽음)" path=codex-security/plugins/codex-security/scripts/workbench_remediation.py lines=713:723
@source rem-pending title="workbench_remediation.py · 35923B · 대기 action 검사(부분 읽음)" path=codex-security/plugins/codex-security/scripts/workbench_remediation.py lines=726:748
@source readme-fix title="codex-security/plugins/codex-security/skills/README.md · 3752B · 벤더 스킬 선택 안내" path=codex-security/plugins/codex-security/skills/README.md lines=11:34
@source sc-findings title="codex-security/plugins/codex-security/references/scan-contract.md · 16529B · findings.json 설명(부분 읽음)" path=codex-security/plugins/codex-security/references/scan-contract.md lines=12:12
@source fs-doctype title="codex-security/plugins/codex-security/schemas/findings.schema.json · 10591B · documentType(부분 읽음)" path=codex-security/plugins/codex-security/schemas/findings.schema.json lines=7:7
@source ws-doc title="codex-security/plugins/codex-security/skills/assess-patch-risk/references/windows-validation.md · 1173B · Windows 검증 호출(인용 안 함)" path=codex-security/plugins/codex-security/skills/assess-patch-risk/references/windows-validation.md
@source x-pub title="codex-security/plugins/codex-security/skills/publish-findings/SKILL.md · 11118B · Continuum patch 수집(부분 읽음)" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=28:28
@source x-pol title="codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md · 5982B · description(부분 읽음)" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=3:3
@source x-pol-chain title="define-security-policy/SKILL.md · 5982B · 정책 우선순위(부분 읽음)" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=28:28
@source x-hard title="codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md · 5026B · 국소 수정과 보강안(부분 읽음)" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=22:30
@source x-val title="codex-security/plugins/codex-security/skills/validation/SKILL.md · 4619B · description과 근거 확인(부분 읽음)" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=3:13
@source x-trk title="codex-security/plugins/codex-security/skills/track-findings/SKILL.md · 13459B · issue 본문 규칙(부분 읽음)" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=76:76

## finding에서 수정과 점검까지 어떤 길이 있나? {#flow}

실선은 사용자가 요청했을 때만 일어나는 넘김이다. 점선은 산출물 호환이나 같은 계열이라는 뜻이고 실행 순서가 아니다. `같은 계열` 점선에는 방향이 없다. 원장이 방향을 정해 둔 것을 그대로 그렸을 뿐이다.

@workflow id=remediate-flow title="finding에서 수정과 점검으로"
| scan | 봉인된 findings.json | external |
| triage | triage-finding | backend | source:t-front |
| resolve | resolve-dependency-alert | security | source:r-front |
| fix | fix-finding | backend | source:f-front |
| assess | assess-patch-risk | backend | source:a-front |
| verify | verify-fix | backend | source:v-front |
| scan > triage | 파일 줄 때 R75 | dashed |
| triage > fix | 요청 시 R27 | emphasis |
| resolve > fix | 요청 시 R28 | emphasis |
| fix > assess | 호환 R29 | dashed |
| fix > verify | 같은 계열 R30 | dashed |
| assess > verify | 같은 계열 R31 | dashed |

@steps id=remediate-steps
| triage-step | triage-finding | 제공된 finding마다 정적 근거로 판정하고, `confirmed`에는 `fix-finding` handoff를 붙인다.[](source:t-verd)[](source:t-handoff) | remediate-flow | triage |
| resolve-step | resolve-dependency-alert | 취약한 의존성이 들어온 경로를 읽기 전용으로 추적하고, 업그레이드 요청이 있으면 `fix-finding`에 넘긴다.[](source:r-s1)[](source:r-s3) | remediate-flow | resolve |
| fix-step | fix-finding | 요청받은 finding을 가장 작은 변경으로 고치고 선택한 mode의 검증을 통과해야 `fixed`로 보고한다.[](source:f-obj)[](source:f-hard) | remediate-flow | fix |
| assess-step | assess-patch-risk | 변하지 않는 patch를 읽기 전용으로 분석해 `merge`, `revise`, `no_op`, `block`, `hold_for_evidence` 중 하나를 권고한다.[](source:a-bind)[](source:a-rec) | remediate-flow | assess |
| verify-step | verify-fix | 현재 checkout에서 원래 취약점이 막혔는지 `fixed`, `still_vulnerable`, `inconclusive`로 판정한다.[](source:v-obj)[](source:v-verdict) | remediate-flow | verify |

시작점이 둘인 것은 입력이 다르기 때문이다.

- 판정이 필요한 보고서, advisory, ticket은 `triage-finding`으로 들어가고, 의존성 alert는 `resolve-dependency-alert`로 들어간다.[](source:t-input)[](source:r-front)
- 점검 스킬 둘은 서로의 산출물을 입력으로 요구하지 않는다. `assess-patch-risk`는 patch 파일, PR diff, base와 head가 정해진 commit 범위를 받고, `verify-fix`는 현재 checkout의 finding을 본다.[](source:a-bind)[](source:v-obj)
- 판정 · 그래서 둘을 어떤 순서로 부를지는 사용자가 정한다. 각 스킬의 내부 규칙과 수치는 스킬 페이지가 다룬다.

## 스킬 사이에 무엇을 어떤 조건으로 주고받나? {#relations}

이 묶음 안의 관계다. 그림에는 모두 그렸고 표에서 `그림`은 그린 방식을 뜻한다.

| rel-id · 종류 | 방향과 조건 | 넘기는 것 | 그림 |
|---|---|---|---|
| R27 · 넘김(명시-이름) | `triage-finding`에서 `fix-finding`으로 간다. `confirmed` finding마다 `$fix-finding` handoff를 결과에 넣고, 실제 호출은 "only when the user asks to proceed with fixing"이다. 결과 계약의 JSON 예시에 `recommended_next_step: "fix-finding"`이 있으나 허용값 목록은 계약에 없다.[](source:t-handoff)[](source:tc-next) | handoff 요약(통제 입력, source, control 또는 sink, 전제 조건, 정확한 코드 위치, 필요한 invariant, 고칠 경계, 남은 증명 간극)과 `fix_finding_handoff` 필드. `confirmed`가 아니면 이 필드는 `null`이다.[](source:t-handoff)[](source:tc-null) | 실선 |
| R28 · 넘김(명시-이름) | `resolve-dependency-alert`에서 `fix-finding`으로 간다. "Edit only when the user requests an upgrade". 요청이 있을 때만 근거와 변경안을 선택된 verification mode로 넘기고 전후 해석 결과를 비교한다. 그 전까지는 읽기 전용이다. `fix-finding`은 선택된 mode를 위임한 모든 agent에 넘기라고 한다.[](source:r-s3)[](source:f-mode) | 근거와 제안한 의존성 변경 | 실선 |
| R29 · 산출물 호환(명시-역할) | `fix-finding`에서 `assess-patch-risk`로 간다. `fix-finding`의 Generate 단계가 unified diff를 만들고 `generated`로 기록한다. `assess-patch-risk`는 변하지 않는 patch를 입력으로 받고 patch를 만들거나 적용하지 않는다. 필수 순서는 아니다.[](source:f-gen)[](source:a-front)[](source:a-bind) | patch 파일과 digest. 직접 넘기면 workbench가 digest를 계산하고, scan 폴더의 기존 파일은 `patchPath`와 `patchDigest`로 가리킨다.[](source:f-genpatch)[](source:tool-set) | 점선 |
| R30 · 같은 계열(추론) | `fix-finding`과 `verify-fix`는 `standard`와 `static` mode를 같은 이름과 같은 뜻으로 쓴다. `static` 설명도 거의 같다. `verify-fix`는 수정 구현이나 테스트 실행 요청만으로는 켜지지 않는다. `fix-finding`의 Verify 단계와 `verify-fix`가 어떻게 겹치는지는 원문에 명시 없음.[](source:f-mode)[](source:v-mode)[](source:v-when)[](source:f-verify) | `verificationMode` 값 | 점선 |
| R31 · 같은 계열(추론) | `assess-patch-risk`와 `verify-fix`는 fix가 이미 있을 때 파일을 바꾸지 않고 점검한다. 앞쪽은 patch의 회귀 위험과 merge 자격을, 뒤쪽은 원래 취약점이 막혔는지를 판정한다. 직접 연결은 없다.[](source:a-front)[](source:v-obj) | 없음 | 점선 |
| R75 · 산출물 호환(명시-역할) | scan 세 가지(`security-scan`, `security-diff-scan`, `deep-security-scan`)가 봉인하는 `findings.json`에서 `triage-finding`으로 간다. 사용자가 유효한 `codex-security.findings` 파일을 줄 때만 입력으로 쓰고, `findingId`, `occurrenceId`, `ruleId`를 source identifier로 보존한다. 자동 연결은 없다.[](source:tc-art)[](source:fs-doctype)[](source:sc-findings) | `findings.json`(`documentType: codex-security.findings`) | 점선 |

R29에서 두 digest의 모양이 다르다.

- 도구의 `patchDigest`는 `sha256:<소문자 64 hex>`이고, `assess-patch-risk`의 schema는 `patch.sha256`을 접두어 없는 소문자 hex 64자로 요구한다. 원문은 한쪽 값을 다른 쪽으로 옮기는 방법을 적지 않았다.[](source:tool-set)[](source:sch-sha)
- 판정 · `sha256:` 접두어를 떼면 형식이 맞는다. 이는 두 형식을 비교한 결과이고 원문 지시가 아니다.[](source:tool-set)[](source:sch-sha)

다른 묶음의 스킬과 이어지는 관계다. 상대 스킬은 그 묶음 페이지(`codex-security/_group-external-findings`, `codex-security/_group-finding-reports`, `codex-security/_group-scan-vulnerabilities`, `codex-security/_group-threat-model-and-policy`)가 다룬다. 이 관계들은 그림에서 생략했다.

| rel-id · 종류 | 방향과 조건 | 생략한 이유 |
|---|---|---|
| R33 · 참고(명시-이름) | `resolve-dependency-alert`가 Dependabot 알림 조회에 `triage-finding`의 `github-rest-intake.md` Dependabot 절을 따른다. 사용자가 source를 고르지 않으면 GitHub를 조회하지 않고 먼저 묻는다. 그 절은 `source_type`을 CVE ID가 있으면 `cve`, 없으면 `advisory`로 정한다.[](source:r-route)[](source:gr-src)[](source:gr-dep) | 안내 문서 참조라 흐름이 아니다 |
| R35 · 넘김(명시-이름) | `resolve-dependency-alert`에서 `publish-findings`로 간다. 가져오기를 명시 요청할 때만 쓴다. 알림을 찾아 달라는 요청은 고른 scanner와 대상에서만 조회한다.[](source:r-route) | 상대 스킬이 `external-findings` 묶음 |
| R37 · 산출물 호환(명시-역할) | `publish-findings`에서 `fix-finding`으로 간다. Continuum finding 하나를 `--source-root`와 함께 수집하면 따라오는 `patches[].patch`를 `fix-finding`이 시작 후보 patch로 쓴다. 현재 checkout과 hunk를 비교해 유지하거나 고친다.[](source:x-pub)[](source:f-wf3) | 상대 스킬이 `external-findings` 묶음 |
| R34 · 참고(추론) | `propose-security-hardening`에서 `fix-finding`으로 간다. 독립 finding은 국소 수정이 나을 수 있다고 하고 남는 tactical fix를 적는다. `fix-finding`을 이름으로 지목하지 않는다.[](source:x-hard) | 상대 스킬이 `finding-reports` 묶음 |
| R32 · 같은 계열(추론) | `triage-finding`과 `validation`은 둘 다 후보나 finding에 근거 기반 판정을 내린다. `triage-finding`은 정적 근거만 쓰고 runtime validation에는 쓰지 말라고 하며, `validation`은 필요하면 재현도 쓴다. 직접 연결은 없다.[](source:t-front)[](source:t-core)[](source:x-val) | 상대 스킬이 `scan-vulnerabilities` 묶음 |
| R40 · 산출물 호환(추론) | `track-findings`에서 `triage-finding`으로 간다. `track-findings`가 만든 issue 본문에는 finding id와 fingerprint 묶음이 들어가고, `triage-finding`은 보안 Jira, Linear ticket을 입력으로 받는다. 서로를 지목하지 않아 강도가 약하다.[](source:x-trk)[](source:t-ticket) | 상대 스킬이 `external-findings` 묶음 |
| R46 · 공유 상태 | `define-security-policy`가 쓰는 `SECURITY.md`를 `triage-finding`이 영향받는 파일마다 읽는다. 아래 공유 상태 표에 있다.[](source:t-policy)[](source:x-pol) | 파일 중심 관계라 표로 둠 |

## fix-finding 안에서 remediation 상태는 어떻게 움직이나? {#remediation-state}

Codex Security workbench가 scan ID, occurrence ID, remediation request ID, action token, expected version을 넘기면 `fix-finding`은 요청된 단계(Generate, Apply, Verify)만 한다.[](source:f-wbintro) 단계마다 상태를 `set_codex_security_finding_remediation`으로 기록한다. 이 절은 R83이고 지시상 동작이다. 도구와 helper는 실행하지 않았고 소스의 선언과 전이표만 읽었다.

@workflow id=remediation-states title="remediation 상태의 앞으로 가는 길"
| req | requested | external |
| gen | generated | backend |
| app | applied | backend |
| ver | verifying | backend |
| done | verified | backend |
| req > gen | Generate | emphasis |
| gen > app | Apply | emphasis |
| app > ver | Verify | emphasis |
| ver > done | 통과 | emphasis |
| done > ver | 다시 검증 | dashed |

그림은 `failed`로 가는 전이와 같은 상태 재기록을 생략했다. 아래 표가 `require_transition`의 허용 전이 전체다.[](source:rem-trans)

| 현재 상태 | 다음에 기록할 수 있는 상태 |
|---|---|
| `requested` | `requested`, `generated`, `failed` |
| `generated` | `generated`, `applied`, `failed` |
| `applied` | `applied`, `verifying`, `failed` |
| `verifying` | `verifying`, `verified`, `failed` |
| `verified` | `verifying`, `verified` {caution:되돌아감} |
| `failed` | `generated`, `applied`, `verifying`, `verified`, `failed` {caution:재진입} |

- 도구의 `state` 입력은 `generated`, `applied`, `verifying`, `verified`, `failed`뿐이다. `requested`는 이 도구로 기록하지 않는다. 도구 설명은 UI가 요청을 대기열에 올리고 Codex가 나머지 상태를 기록한다고 적는다.[](source:tool-set)[](source:tool-setter)
- 대기 중인 action이 있으면 그 action이 허용한 상태만 기록할 수 있다. generate는 `generated`나 `failed`, apply는 `applied`나 `failed`, verify는 `verifying`, `verified`, `failed`다.[](source:rem-pending)
- 대기 action이 없을 때 `requested`→`generated`, `generated`→`applied`, `applied`→`verifying` 전이는 해당 action을 먼저 요청해야 한다.[](source:rem-pending)
- action을 요청하는 `request_codex_security_finding_remediation`과 `..._action`은 "App-only" 도구라 모델이 부르지 않는다. Generate 요청은 앞의 도구가, Apply와 Verify 요청은 `..._action`이 맡는다.[](source:tool-request)
- 단계가 실패하면 `failed`를 기록하고 실패한 단계와 오류를 `summary`에 적는다. 부모 thread가 단계를 위임했으면 worker가 마지막 workbench 갱신까지 맡고, 부모는 같은 편집을 되풀이하거나 chat 응답을 완료로 보지 않는다.[](source:f-fail)
- Verify 단계는 소스를 고치지 않고 기록된 patch에 검증 gate를 적용하며, `verified`는 근거가 모든 조건을 증명할 때만 기록한다.[](source:f-verify)

판정 · 전이표는 `failed`에서 어느 단계로든 다시 들어가도록 열려 있다. 그래서 `failed`는 막다른 상태가 아니고, 재시도의 출발점이 될 수 있다.[](source:rem-trans)

## 어떤 파일과 상태를 공유하나? {#state}

| 파일·상태 | 쓰는 스킬·주체 | 읽는 스킬·조건 |
|---|---|---|
| 소스 checkout(작업 트리). 원장에 rel-id 없음 | 쓰는 스킬은 `fix-finding`뿐이다. 구현 단계에서 편집하고 workbench Apply 단계에서 기록된 patch를 적용한다.[](source:f-wf3)[](source:f-apply) | `triage-finding`, `verify-fix`는 파일을 바꾸지 않는다. `assess-patch-risk`는 선택한 checkout과 patch를 바꾸지 않고, 정확한 patch를 적용해야 할 때만 격리된 임시 checkout을 쓴다. `resolve-dependency-alert`도 요청 전에는 읽기 전용이다.[](source:t-ro)[](source:v-obj)[](source:a-bind)[](source:r-s1) |
| `SECURITY.md`(루트와 범위별) · R46 | `define-security-policy`가 새로 쓰거나 검토한다. 이 묶음 밖 스킬이다.[](source:x-pol) | `triage-finding`이 영향받는 파일마다 읽는다. 가장 가까운 정책이 우선하고, 정책이 보안 모델을 정하되 코드 근거가 주장을 받쳐야 한다. 선후 관계는 없다.[](source:t-policy)[](source:x-pol-chain) |
| `findings.json` · R75 | scan 세 스킬이 봉인한다.[](source:sc-findings)[](source:fs-doctype) | `triage-finding`이 사용자가 파일을 줄 때만 입력으로 읽는다.[](source:tc-art) |
| triage 결과의 `recommended_next_step`, `fix_finding_handoff` · R27 | `triage-finding`이 결과 계약에 따라 낸다.[](source:tc-next)[](source:tc-null) | 사용자가 고치자고 하면 `fix-finding`을 호출한다. `fix-finding` 쪽에 이 handoff를 받는다는 문장은 원문에 명시 없음.[](source:t-handoff)[](source:f-front) |
| Generate 단계의 unified diff와 digest · R29 | `fix-finding`이 workbench 도구로 기록한다. 지시상 동작이다.[](source:f-gen)[](source:f-genpatch) | `assess-patch-risk`가 변하지 않는 patch 입력으로 받을 수 있다. 필수 순서는 아니다.[](source:a-bind) |
| Continuum `patches[].patch` · R37 | `publish-findings`가 수집한 capture나 저장된 finding에 담긴다.[](source:x-pub) | `fix-finding`이 시작 후보 patch로 읽고 현재 checkout과 비교한다.[](source:f-wf3) |
| remediation 상태 · R83 | `fix-finding`이 `set_codex_security_finding_remediation`으로 기록한다. UI가 대기 요청을 올린다.[](source:tool-set)[](source:tool-setter)[](source:tool-request) | 읽는 주체는 원문에 명시 없음. workbench가 저장한다고만 설명한다.[](source:tool-setter) |
| `<artifacts_dir>/fix_report.md` · R85 | 기존 scan 폴더를 쓸 때 `fix-finding`이 쓴다. scan 폴더가 없으면 chat 요약으로 충분하다.[](source:f-report)[](source:sc-fix) | 읽는 스킬은 원문에 명시 없음. 번호 붙은 scan phase 밖에 둔다.[](source:sc-fix) |

스킬이 읽으라고 지시하는 플러그인 공용 문서다. 같은 파일을 읽을 뿐 서로 주고받는 산출물은 아니다.

| rel-id · 종류 | 읽는 스킬 | 문서와 용도 |
|---|---|---|
| R60 · 참고(명시-이름) | `fix-finding`, `assess-patch-risk` | 파일을 만들거나 보관하기 전에 `references/artifact-storage.md`를 읽고 storage policy를 따른다. 보조 파일은 `save_codex_security_artifact`로만 쓰라고 한다.[](source:f-storage)[](source:a-storage)[](source:st-doc) |
| R63 · 참고(명시-이름) | `triage-finding`, `verify-fix` | `references/static-finding-assessment.md`로 정적 근거 평가 방법을 읽는다. 이 문서는 최상위 workflow가 아니고 verdict, 수정 동작은 호출한 스킬이 정한다. `verify-fix`는 호출자가 내용을 prompt에 이미 줬으면 다시 읽지 않는다.[](source:t-assess)[](source:v-assess)[](source:sa-doc) |
| R80 · 참고(명시-이름) | `assess-patch-risk` | 결과 JSON을 반환하기 전에 helper `validate-patch-risk-assessment`로 검증한다. 오류가 나면 증거를 다시 보고 고치고, 권고를 검증 통과만을 위해 바꾸지 않는다. 이 묶음은 helper를 실행하지 않았다.[](source:a-val)[](source:rb-gate) |
| R85 · 참고(명시-이름) | `fix-finding` | scan 폴더 경로를 `references/scan-artifacts.md`로 푼다. fix 산출물은 번호 붙은 scan phase 밖에 둔다.[](source:f-report)[](source:sc-fix) |

## 어떤 요청에 어떤 스킬을 고르고, 무엇은 하지 않나? {#choose}

description은 모델이 호출 여부를 판단할 때 참고하는 설명일 뿐이고, 정확히 일치해야 켜지는 사전이 아니다.

- 이 다섯 스킬의 `SKILL.md`에는 `disable-model-invocation` 같은 호출 제한 필드가 없고 `agents/openai.yaml`에도 `policy` 키가 없다. 그래서 스킬 선택은 description과 본문의 요청 조건이 정한다.[](source:t-front)[](source:r-front)[](source:f-front)[](source:v-front)[](source:a-front)[](source:t-yaml)[](source:r-yaml)[](source:f-yaml)[](source:v-yaml)[](source:a-yaml)
- 벤더 안내는 `fix-finding`, `verify-fix`, `propose-security-hardening`을 "Fixing a bug"에 두고, `triage-finding`, `resolve-dependency-alert`를 "Investigating a finding"에, `assess-patch-risk`를 "Before you merge or install something"에 둔다. 이 묶음은 그 분류와 다르게 작업 목표로 묶었다.[](source:readme-fix)

| 요청 | 스킬 | 하지 않는 일 |
| --- | --- | --- |
| scanner 보고서, advisory, GitHub, Jira, Linear 항목이 진짜인지 정적 근거로 가른다 | `triage-finding` | discovery, 중복 triage, 수정을 하지 않는다. 테스트와 앱 실행도 하지 않는다.[](source:t-front)[](source:t-core) {bad:runtime 검증 아님} |
| 취약한 의존성 alert가 무엇 때문에 들어왔고 올릴 수 있는지 본다 | `resolve-dependency-alert` | 요청 전에는 편집하지 않고, package manager와 project script를 부르지 않는다.[](source:r-s1)[](source:r-s3) |
| 취약점을 고치고 검증하라고 명시한다 | `fix-finding` | 일반 버그 수정, 정확성이나 설계 리뷰 finding, 일반 validation, 전체 PR·commit·branch·patch·repository scan에는 쓰지 않는다.[](source:f-front) {bad:범위 밖} |
| 만들어진 patch의 영향, 회귀 위험, merge 자격을 본다 | `assess-patch-risk` | patch를 만들거나 수정, 적용, push, merge하지 않는다. label은 조언일 뿐 merge 권한이 아니다.[](source:a-front)[](source:a-rec)[](source:a-hard) {caution:조언} |
| 보안 수정이 취약점을 실제로 막았는지 확인한다 | `verify-fix` | 파일, patch, commit, artifact, issue tracker를 바꾸지 않는다. 명시 요청 때만 쓴다.[](source:v-when)[](source:v-obj) {caution:명시 요청} |

description 원문이다.

**triage-finding**

@code source=t-front language=yaml

**resolve-dependency-alert**

@code source=r-front language=yaml

**fix-finding**

@code source=f-front language=yaml

**assess-patch-risk**

@code source=a-front language=yaml

**verify-fix**

@code source=v-front language=yaml

@callout level=warning title="자동으로 이어 부르지 않는다"
| `triage-finding`의 `$fix-finding` handoff는 사용자가 고치자고 할 때만 호출한다.[](source:t-handoff) |
| `resolve-dependency-alert`는 사용자가 업그레이드를 요청할 때만 편집한다. 가져오기도 명시 요청이 있을 때만 `publish-findings`를 쓴다.[](source:r-s3)[](source:r-route) |
| `verify-fix`는 수정을 구현하거나 테스트를 돌리는 도중 자동으로 부르지 않는다.[](source:v-front)[](source:v-when) |

## 어디까지 읽고 확인했나? {#audit}

@facts id=audit-facts
| 읽은 텍스트 파일 | 전부 읽음 16개(스킬 5개의 `SKILL.md`와 `agents/openai.yaml`, `triage-result-contract.md`, `risk-rubric.md`, `static-finding-assessment.md`, `artifact-storage.md`, `README.md`, `windows-validation.md`), 줄 범위만 읽음 12개 |
| 줄 범위만 읽음 | `github-rest-intake.md`, `scan-artifacts.md`, `scan-contract.md`, `findings.schema.json`, `patch-risk-assessment.schema.json`, `server.ts`, `workbench_remediation.py`, 다른 묶음 스킬 5개의 해당 줄 |
| 읽지 않음 | `triage-finding/references/ticket-intake.md`, 플러그인 `references/security-guidance.md`, `.app.json`, `workbench_remediation.py`와 `server.ts`의 나머지, 번역본(없음), 바이너리(없음) |
| 실행 | 없음. 스크립트, helper, MCP 도구, 외부 URL 모두 열거나 부르지 않았다 |
| 대조 | 원장 R27~R31, R75, R83을 원문 줄과 맞췄다. 표에 나온 R32~R37, R40, R46, R60, R63, R80, R85는 해당 줄만 확인했다 |

`windows-validation.md`는 R80의 Windows 호출 안내이고 이 묶음 본문에서는 인용하지 않았다. 스킬 페이지는 용어를 맞추려고 머리 부분만 봤고 근거로 쓰지 않았다. 자동 검증은 HTML 구조와 출처 해석만 확인한다. 사람 검토는 미실시다.

@callout level=open-question title="원문에 명시가 없거나 어긋나는 부분"
| `fix-finding`의 Verify 단계와 `verify-fix`가 같은 요청에서 어떻게 나뉘는지는 원문에 명시 없음(R30).[](source:f-verify)[](source:v-when) |
| `resolve-dependency-alert`의 1단계는 package manager와 project script 호출을 금지하지만, `fix-finding`은 호출자가 `verificationMode: static`을 고르지 않으면 `standard`로 검증한다. 업그레이드 요청이 `fix-finding` description의 "explicitly asks to fix and verify"에 해당하는지, 1단계 금지가 3단계 위임에도 이어지는지, 위임 때 `static`을 고르라는 문장이 있는지는 원문에 명시 없음(R28).[](source:r-s1)[](source:r-s3)[](source:f-front)[](source:f-mode) |
| `fix-finding`은 기존 scan 폴더의 `fix_report.md`에 쓰라고 하지만, `artifact-storage.md`는 완료·봉인된 scan 파일을 보조 파일 저장 도구로 고칠 수 없다고 한다. 봉인된 scan에서 어떻게 조정하는지는 원문에 없고, 우선순위도 명시되지 않았다(R85).[](source:f-report)[](source:sc-fix)[](source:st-sealed) |
| `assess-patch-risk`가 patch 입력 출처로 `fix-finding`의 Generate 산출물을 지목하는 문장은 없다. R29는 patch가 변하지 않는 파일이라는 조건이 맞는다는 데서 이은 호환이다.[](source:a-bind)[](source:f-gen) |
| `fix-finding` 쪽에 `triage-finding`의 handoff를 받는다는 문장은 원문에 명시 없음(R27).[](source:t-handoff)[](source:f-front) |
