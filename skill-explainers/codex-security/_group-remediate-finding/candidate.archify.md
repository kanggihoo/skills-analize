# 이미 있는 취약점 finding을 고치고 점검할 때 어떤 스킬을 쓰나? {#remediate-finding-page}

고치는 스킬은 `fix-finding` 하나다. `triage-finding`과 `resolve-dependency-alert`는 시작점이고, 수정으로 넘어가는 일은 사용자가 요청할 때만 일어난다.[](source:t-handoff)[](source:r-steps) `assess-patch-risk`와 `verify-fix`는 수정이 이미 있을 때 파일을 바꾸지 않고 점검하는 선택지다. 어느 쪽도 필수 순서가 아니다.[](source:a-front)[](source:v-obj) 부분 분석이다. 플러그인 루트의 `references/`, `schemas/`와 호스트 도구는 컬렉션에 없어 읽지 못했다.[](source:f-storage)

- `triage-finding`은 제공된 finding마다 정적 근거만으로 `confirmed`, `not_actionable`, `needs_review` 중 하나를 낸다. 수정과 실행은 하지 않는다.[](source:t-limit)[](source:t-verdict)
- `resolve-dependency-alert`는 lockfile과 manifest로 취약한 의존성이 들어온 경로를 읽기 전용으로 추적한다. 업그레이드 요청이 있을 때만 `fix-finding`에 넘긴다.[](source:r-steps)
- `fix-finding`은 사용자가 고치고 검증하라고 명시했을 때만 쓴다. 선택한 mode의 검증을 모두 통과해야 `fixed`다.[](source:f-front)[](source:f-hard)
- `verify-fix`는 보안 수정의 검증을 명시 요청했을 때만 쓴다. 구현이나 테스트 실행 요청만으로는 켜지지 않는다.[](source:v-when)

@answer scope="스킬 5개 · 관계 18개 · 호스트 문서 미확인"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source t-front title="codex-security/triage-finding/SKILL.md · 8394B · frontmatter" path=codex-security/triage-finding/SKILL.md lines=1:4
@source t-limit title="codex-security/triage-finding/SKILL.md · 8394B · 인라인·정적 제약" path=codex-security/triage-finding/SKILL.md lines=10:10
@source t-policy title="codex-security/triage-finding/SKILL.md · 8394B · 보안 정책 검토" path=codex-security/triage-finding/SKILL.md lines=37:50
@source t-assess title="codex-security/triage-finding/SKILL.md · 8394B · 정적 평가 방법 읽기" path=codex-security/triage-finding/SKILL.md lines=54:54
@source t-jira title="codex-security/triage-finding/SKILL.md · 8394B · Jira와 Linear 입력" path=codex-security/triage-finding/SKILL.md lines=16:20
@source t-verdict title="codex-security/triage-finding/SKILL.md · 8394B · 판정 3개" path=codex-security/triage-finding/SKILL.md lines=62:68
@source t-handoff title="codex-security/triage-finding/SKILL.md · 8394B · fix-finding handoff" path=codex-security/triage-finding/SKILL.md lines=82:82
@source t-readonly title="codex-security/triage-finding/SKILL.md · 8394B · 읽기 전용 유지" path=codex-security/triage-finding/SKILL.md lines=84:84
@source t-yaml title="codex-security/triage-finding/agents/openai.yaml · 400B · UI 메타데이터" path=codex-security/triage-finding/agents/openai.yaml
@source t-contract title="codex-security/triage-finding/references/triage-result-contract.md · 4447B · recommended_next_step 줄" path=codex-security/triage-finding/references/triage-result-contract.md lines=79:80
@source t-gr title="codex-security/triage-finding/references/github-rest-intake.md · 12277B · Dependabot 절 제목 줄만 읽음" path=codex-security/triage-finding/references/github-rest-intake.md lines=56:56
@source r-front title="codex-security/resolve-dependency-alert/SKILL.md · 2548B · frontmatter" path=codex-security/resolve-dependency-alert/SKILL.md lines=1:4
@source r-intake title="codex-security/resolve-dependency-alert/SKILL.md · 2548B · 입력과 import·Dependabot 안내" path=codex-security/resolve-dependency-alert/SKILL.md lines=8:10
@source r-steps title="codex-security/resolve-dependency-alert/SKILL.md · 2548B · 1~3단계" path=codex-security/resolve-dependency-alert/SKILL.md lines=12:14
@source r-report title="codex-security/resolve-dependency-alert/SKILL.md · 2548B · 보고와 닫기 규칙" path=codex-security/resolve-dependency-alert/SKILL.md lines=16:18
@source r-yaml title="codex-security/resolve-dependency-alert/agents/openai.yaml · 250B · UI 메타데이터" path=codex-security/resolve-dependency-alert/agents/openai.yaml
@source f-front title="codex-security/fix-finding/SKILL.md · 18461B · frontmatter" path=codex-security/fix-finding/SKILL.md lines=1:4
@source f-storage title="codex-security/fix-finding/SKILL.md · 18461B · 저장 정책 읽기" path=codex-security/fix-finding/SKILL.md lines=8:8
@source f-obj title="codex-security/fix-finding/SKILL.md · 18461B · 목표" path=codex-security/fix-finding/SKILL.md lines=12:14
@source f-mode title="codex-security/fix-finding/SKILL.md · 18461B · verification mode" path=codex-security/fix-finding/SKILL.md lines=16:20
@source f-wf3 title="codex-security/fix-finding/SKILL.md · 18461B · 구현과 제안 patch" path=codex-security/fix-finding/SKILL.md lines=37:38
@source f-review title="codex-security/fix-finding/SKILL.md · 18461B · 리뷰" path=codex-security/fix-finding/SKILL.md lines=49:53
@source f-wb title="codex-security/fix-finding/SKILL.md · 18461B · workbench 요청 식별" path=codex-security/fix-finding/SKILL.md lines=57:57
@source f-gen title="codex-security/fix-finding/SKILL.md · 18461B · Generate 단계" path=codex-security/fix-finding/SKILL.md lines=65:65
@source f-apply title="codex-security/fix-finding/SKILL.md · 18461B · Apply 단계" path=codex-security/fix-finding/SKILL.md lines=73:73
@source f-verify title="codex-security/fix-finding/SKILL.md · 18461B · Verify 단계" path=codex-security/fix-finding/SKILL.md lines=76:76
@source f-out title="codex-security/fix-finding/SKILL.md · 18461B · 결과 계약" path=codex-security/fix-finding/SKILL.md lines=82:94
@source f-report title="codex-security/fix-finding/SKILL.md · 18461B · scan 폴더 보고서" path=codex-security/fix-finding/SKILL.md lines=96:96
@source f-hard title="codex-security/fix-finding/SKILL.md · 18461B · Hard Rules" path=codex-security/fix-finding/SKILL.md lines=98:105
@source f-yaml title="codex-security/fix-finding/agents/openai.yaml · 225B · UI 메타데이터" path=codex-security/fix-finding/agents/openai.yaml
@source v-front title="codex-security/verify-fix/SKILL.md · 4193B · frontmatter" path=codex-security/verify-fix/SKILL.md lines=1:4
@source v-when title="codex-security/verify-fix/SKILL.md · 4193B · 호출 조건" path=codex-security/verify-fix/SKILL.md lines=8:10
@source v-obj title="codex-security/verify-fix/SKILL.md · 4193B · 목표와 읽기 전용" path=codex-security/verify-fix/SKILL.md lines=12:14
@source v-assess title="codex-security/verify-fix/SKILL.md · 4193B · 정적 평가 방법 읽기" path=codex-security/verify-fix/SKILL.md lines=18:18
@source v-mode title="codex-security/verify-fix/SKILL.md · 4193B · verification mode" path=codex-security/verify-fix/SKILL.md lines=20:20
@source v-wf title="codex-security/verify-fix/SKILL.md · 4193B · 검증 순서" path=codex-security/verify-fix/SKILL.md lines=22:28
@source v-res title="codex-security/verify-fix/SKILL.md · 4193B · 판정 값" path=codex-security/verify-fix/SKILL.md lines=48:52
@source v-yaml title="codex-security/verify-fix/agents/openai.yaml · 235B · UI 메타데이터" path=codex-security/verify-fix/agents/openai.yaml
@source a-front title="codex-security/assess-patch-risk/SKILL.md · 8299B · frontmatter" path=codex-security/assess-patch-risk/SKILL.md lines=1:4
@source a-storage title="codex-security/assess-patch-risk/SKILL.md · 8299B · 저장 정책 읽기" path=codex-security/assess-patch-risk/SKILL.md lines=8:8
@source a-bind title="codex-security/assess-patch-risk/SKILL.md · 8299B · patch 고정" path=codex-security/assess-patch-risk/SKILL.md lines=22:24
@source a-rec title="codex-security/assess-patch-risk/SKILL.md · 8299B · 권고와 workflow label" path=codex-security/assess-patch-risk/SKILL.md lines=33:50
@source a-out title="codex-security/assess-patch-risk/SKILL.md · 8299B · 출력과 검증기" path=codex-security/assess-patch-risk/SKILL.md lines=54:75
@source a-hard title="codex-security/assess-patch-risk/SKILL.md · 8299B · Hard Rules" path=codex-security/assess-patch-risk/SKILL.md lines=79:86
@source a-yaml title="codex-security/assess-patch-risk/agents/openai.yaml · 274B · UI 메타데이터" path=codex-security/assess-patch-risk/agents/openai.yaml
@source x-pub title="codex-security/publish-findings/SKILL.md · 11118B · Continuum patch 수집 줄만 읽음" path=codex-security/publish-findings/SKILL.md lines=28:28
@source x-pol title="codex-security/define-security-policy/SKILL.md · SECURITY.md의 성격 줄만 읽음" path=codex-security/define-security-policy/SKILL.md lines=8:8
@source x-pol-new title="codex-security/define-security-policy/SKILL.md · 새 SECURITY.md 위치 줄만 읽음" path=codex-security/define-security-policy/SKILL.md lines=32:32
@source x-val title="codex-security/validation/SKILL.md · description 줄만 읽음" path=codex-security/validation/SKILL.md lines=3:3
@source x-val-ev title="codex-security/validation/SKILL.md · 근거 확인 줄만 읽음" path=codex-security/validation/SKILL.md lines=13:13
@source x-trk title="codex-security/track-findings/SKILL.md · 8번째 줄만 읽음" path=codex-security/track-findings/SKILL.md lines=8:8
@source x-trk-body title="codex-security/track-findings/SKILL.md · issue 본문 규칙 줄만 읽음" path=codex-security/track-findings/SKILL.md lines=76:76
@source x-hard title="codex-security/propose-security-hardening/SKILL.md · 5026B · 국소 수정과 보강안 줄만 읽음" path=codex-security/propose-security-hardening/SKILL.md lines=22:30

## finding에서 수정과 점검까지 어떤 길이 있나? {#flow}

실선은 사용자가 요청했을 때만 일어나는 넘김이다. 점선은 산출물 호환과 같은 계열이며 실행 순서를 뜻하지 않는다. `assess-patch-risk`와 `verify-fix`는 서로의 산출물을 입력으로 요구하지 않는다.[](source:a-front)[](source:v-obj)

@workflow id=remediate-flow title="finding에서 수정과 점검으로"
| triage | triage-finding | backend | source:t-front |
| resolve | resolve-dependency-alert | backend | source:r-front |
| fix | fix-finding | backend | source:f-front |
| assess | assess-patch-risk | backend | source:a-front |
| verify | verify-fix | backend | source:v-front |
| triage > fix | 요청 시 R27 | emphasis |
| resolve > fix | 요청 시 R28 | emphasis |
| fix > assess | 호환 R29 | dashed |
| fix > verify | 같은 계열 R30 | dashed |
| assess > verify | 같은 계열 R31 | dashed |

@steps id=remediate-steps
| triage-step | triage-finding | 제공된 finding마다 정적 근거로 판정하고, confirmed마다 `$fix-finding` handoff를 낸다.[](source:t-verdict)[](source:t-handoff) | remediate-flow | triage |
| resolve-step | resolve-dependency-alert | 취약한 의존성을 끌어온 부모와 버전을 읽기 전용으로 추적하고 업그레이드 가능 여부를 판단한다.[](source:r-steps) | remediate-flow | resolve |
| fix-step | fix-finding | 요청받은 finding을 가장 작은 변경으로 고치고 선택한 mode의 검증을 통과해야 `fixed`로 보고한다.[](source:f-obj)[](source:f-hard) | remediate-flow | fix |
| assess-step | assess-patch-risk | 변하지 않는 patch를 읽기 전용으로 분석해 영향, 회귀 위험, 자동 merge 자격을 판정한다.[](source:a-front)[](source:a-rec) | remediate-flow | assess |
| verify-step | verify-fix | 현재 checkout에서 원래 취약점이 막혔는지 `fixed`, `still_vulnerable`, `inconclusive`로 판정한다.[](source:v-res) | remediate-flow | verify |

시작점이 둘인 것은 입력이 다르기 때문이다. 판정이 필요한 보고서, advisory, ticket은 `triage-finding`으로, 취약한 의존성 alert는 `resolve-dependency-alert`로 읽는다.[](source:t-front)[](source:r-front) 각 스킬의 내부 규칙과 수치는 스킬 페이지에 있다.

## 스킬 사이에 무엇을 어떤 조건으로 주고받나? {#relations}

| rel-id · 종류 | 방향과 조건 | 그림 반영 |
|---|---|---|
| R27 · 넘김 | `triage-finding`에서 `fix-finding`으로 간다. confirmed finding마다 `$fix-finding` handoff를 결과에 넣고, 실제 호출은 "only when the user asks to proceed with fixing"이다. 결과 계약의 `recommended_next_step`에 `fix-finding`이 들어간다.[](source:t-handoff)[](source:t-contract) | 표시 |
| R28 · 넘김 | `resolve-dependency-alert`에서 `fix-finding`으로 간다. "Edit only when the user requests an upgrade". 요청이 있을 때만 근거와 변경안을 선택된 verification mode로 넘기고 전후 해석 결과를 비교한다. 그 전까지 읽기 전용이다.[](source:r-steps) | 표시 |
| R29 · 산출물 호환 | `fix-finding`에서 `assess-patch-risk`로 간다. Generate 단계가 unified diff를 만들고 경로와 digest를 기록한다. `assess-patch-risk`는 patch를 만들거나 적용하지 않고 변하지 않는 patch 파일을 입력으로 받는다. 필수 순서는 아니다.[](source:f-gen)[](source:a-front)[](source:a-bind) | 표시(점선) |
| R30 · 같은 계열(추론) | `fix-finding`과 `verify-fix`는 `standard`와 `static` mode를 같은 이름으로 쓴다. `verify-fix`는 수정 구현이나 테스트 실행 요청만으로는 켜지지 않는다. `fix-finding`의 Verify 단계와 어떻게 겹치는지는 원문에 명시 없음.[](source:f-mode)[](source:v-when)[](source:v-mode) | 표시(점선) |
| R31 · 같은 계열(추론) | `assess-patch-risk`와 `verify-fix`는 fix가 이미 있을 때 파일을 바꾸지 않고 점검한다. 앞쪽은 회귀 위험과 merge 자격을, 뒤쪽은 원래 취약점이 막혔는지를 판정한다. 직접 연결은 없다.[](source:a-front)[](source:v-obj) | 표시(점선) |
| R33 · 참고 | `resolve-dependency-alert`가 Dependabot 알림 조회에 `triage-finding/references/github-rest-intake.md`의 Dependabot 취약점 절을 따른다. `triage-finding`이 부르는 쪽은 아니다.[](source:r-intake)[](source:t-gr) | 생략 |
| R35 · 넘김 | `resolve-dependency-alert`에서 `publish-findings`로 간다. 가져오기를 명시 요청했을 때만 쓰고, 알림을 찾아 달라는 요청은 고른 scanner와 대상에서만 조회한다. 상대 스킬은 `external-findings` 묶음이다.[](source:r-intake) | 생략 |
| R37 · 산출물 호환 | `publish-findings`에서 `fix-finding`으로 간다. Continuum finding 하나를 `--source-root`와 함께 수집하면 따라오는 `patches[].patch`를 `fix-finding`이 시작 후보 patch로 쓴다. 현재 checkout의 hunk와 비교해 유지하거나 고친다.[](source:x-pub)[](source:f-wf3) | 생략 |
| R34 · 참고(추론) | `propose-security-hardening`에서 `fix-finding`으로 간다. 독립 finding은 국소 수정이 나을 수 있다고 하고 남는 tactical fix를 적는다. `fix-finding`을 이름으로 지목하지 않는다. 상대 스킬은 `finding-reports` 묶음이다.[](source:x-hard) | 생략 |
| R32 · 같은 계열(추론) | `triage-finding`과 `validation`은 둘 다 후보나 finding에 근거 기반 판정을 내린다. `triage-finding`은 정적 근거만 쓰고 runtime validation에는 쓰지 말라고 하며, `validation`은 필요하면 재현도 쓴다. 직접 연결은 없다. `validation`은 `scan-vulnerabilities` 묶음이다.[](source:t-front)[](source:t-limit)[](source:x-val)[](source:x-val-ev) | 생략 |
| R40 · 산출물 호환(추론) | `track-findings`에서 `triage-finding`으로 간다. `track-findings`가 만든 Linear, Jira issue는 finding id와 fingerprint 묶음을 본문에 넣고, `triage-finding`은 보안 Jira, Linear ticket을 입력으로 받는다. 서로를 지목하지 않아 강도가 약하다.[](source:x-trk)[](source:x-trk-body)[](source:t-jira) | 생략 |

R46(`SECURITY.md` 공유 상태)은 아래 공유 상태 표에 있다. 그림에서 뺀 관계는 이 표에만 남겼고, 상대 스킬이 다른 묶음인 R32, R34, R35, R37, R40은 그 묶음 페이지(`_group-scan-vulnerabilities`, `_group-finding-reports`, `_group-external-findings`)가 따로 다룬다. 관계의 단일 원본은 `relations.md`이고, `추론` 표시가 붙은 행은 원문이 서로를 이름으로 지목하지 않는 연결이다.

## 어떤 파일과 상태를 공유하나? {#state}

| 파일·상태 | 쓰는 스킬·주체 | 읽는 스킬·조건 |
|---|---|---|
| `SECURITY.md`(루트와 범위별) · R46 공유 상태 | `define-security-policy`가 새로 쓰거나 고친다. 이 묶음 밖 스킬이다.[](source:x-pol)[](source:x-pol-new) | `triage-finding`이 영향받는 파일마다 읽는다. 가장 가까운 정책이 우선하며, 정책이 보안 모델을 정하지만 코드 근거가 주장을 받쳐야 한다. 선후 관계는 없다.[](source:t-policy) |
| `fix-finding` Generate 단계의 unified diff와 digest · R29 | `fix-finding`이 workbench 도구로 기록한다. 지시상 동작이며 실행해 확인하지 않았다.[](source:f-gen) | `assess-patch-risk`가 변하지 않는 patch 입력으로 받을 수 있다. 필수 순서는 아니다.[](source:a-bind) |
| Continuum `patches[].patch` · R37 | `publish-findings`가 수집한 capture나 저장된 finding에 담긴다.[](source:x-pub) | `fix-finding`이 시작 후보 patch로 읽고 현재 checkout과 비교한다.[](source:f-wf3) |
| triage 결과의 `recommended_next_step`, `fix_finding_handoff` · R27 | `triage-finding`이 결과 계약에 따라 낸다.[](source:t-contract) | 사용자가 고치자고 할 때 `fix-finding`을 호출한다. `fix-finding` 쪽에는 이 handoff를 받는다는 문장이 원문에 명시 없음.[](source:t-handoff)[](source:f-front) |
| 저장소 checkout(작업 트리) | 쓰는 스킬은 `fix-finding`뿐이다. 구현 단계에서 편집하고, workbench Apply 단계에서 기록된 patch를 그대로 적용한다.[](source:f-wf3)[](source:f-apply) | `triage-finding`, `assess-patch-risk`, `verify-fix`는 파일을 바꾸지 않는다. `resolve-dependency-alert`도 요청 전에는 읽기 전용이다.[](source:t-readonly)[](source:a-bind)[](source:v-obj)[](source:r-steps) |

`fix-finding`의 Verify 단계도 소스를 수정하지 않고 기록된 patch에 통과 조건을 적용한다. 그 결과로 finding을 닫지 않는다.[](source:f-verify)

## 어떤 요청에 어떤 스킬을 고르고, 무엇은 하지 않나? {#choose}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 이 다섯 스킬의 `SKILL.md`에는 `disable-model-invocation` 같은 호출 제한 필드가 없고 `agents/openai.yaml`에도 `policy`가 없다.[](source:t-front)[](source:r-front)[](source:f-front)[](source:v-front)[](source:a-front)[](source:t-yaml)[](source:r-yaml)[](source:f-yaml)[](source:v-yaml)[](source:a-yaml) 그래서 어느 스킬을 켤지는 각 본문의 요청 조건이 정한다.

| 요청 | 스킬 | 하지 않는 일 |
| --- | --- | --- |
| scanner 보고서, advisory, GitHub, Jira, Linear 항목이 진짜인지 정적 근거로 가른다 | `triage-finding` | discovery, 중복 분류, 수정을 하지 않는다. 테스트나 앱 실행도 하지 않는다 [](source:t-front)[](source:t-limit) {bad:runtime 검증 아님} |
| 취약한 의존성 alert가 무엇 때문에 들어왔고 올릴 수 있는지 본다 | `resolve-dependency-alert` | 요청 전에는 편집하지 않고, package manager와 project script를 부르지 않는다[](source:r-steps) |
| 취약점을 고치고 검증하라고 한다 | `fix-finding` | 일반 버그 수정, 설계 리뷰 지적, 전체 PR나 repository scan에는 쓰지 않는다 [](source:f-front) {bad:범위 밖} |
| 만들어진 patch의 영향, 회귀 위험, merge 자격을 본다 | `assess-patch-risk` | patch를 만들거나 수정, 적용, push, merge하지 않는다. label은 조언일 뿐 merge 권한이 아니다 [](source:a-front)[](source:a-rec) {caution:조언} |
| 보안 수정이 취약점을 실제로 막았는지 확인한다 | `verify-fix` | 파일, patch, commit, artifact, issue tracker를 바꾸지 않는다. 명시 요청 때만 쓴다 [](source:v-when)[](source:v-obj) {caution:명시 요청} |

@callout level=warning title="자동으로 이어 부르지 않는다"
| `triage-finding`의 `$fix-finding` handoff는 사용자가 고치자고 할 때만 호출한다.[](source:t-handoff) |
| `resolve-dependency-alert`는 사용자가 업그레이드를 요청할 때만 편집한다. 가져오기도 명시 요청이 있을 때만 `publish-findings`를 쓴다.[](source:r-intake)[](source:r-steps) |
| `verify-fix`는 fix를 구현하거나 테스트를 돌리는 도중 자동으로 부르지 않는다.[](source:v-front)[](source:v-when) |

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 폴더 원본 | `SKILL.md` 5개(`triage-finding` 8,394B, `fix-finding` 18,461B, `verify-fix` 4,193B, `assess-patch-risk` 8,299B, `resolve-dependency-alert` 2,548B)와 `agents/openai.yaml` 5개를 끝까지 읽었다.[](source:t-front)[](source:f-front)[](source:v-front)[](source:a-front)[](source:r-front) |
| 상대 파일 | 관계 근거로 다른 스킬 파일 7개를 인용했다. `triage-result-contract.md`와 `github-rest-intake.md`, `publish-findings`, `define-security-policy`, `validation`, `track-findings`, `propose-security-hardening`의 `SKILL.md`다. 해당 줄만 근거로 삼았고 전체를 근거로 삼지 않았다. |
| 관계 대조 | 원장 R27~R35, R37, R40, R46과 범위 밖 R60~R65를 원문 줄과 맞춰 봤다. |
| 제외 | 번역본과 바이너리는 없다. 부분 읽음 파일은 7개이며 위 상대 파일이다. 읽은 텍스트 파일은 전부 읽음 10개와 부분 읽음 7개다. |

범위 밖 항목은 끊긴 참조가 아니라 이 컬렉션이 `plugins/codex-security/skills/` 아래 스킬만 가져온 데서 생긴 빈자리다. 원문의 요청 조건, 판정 값, 읽기 전용 제약, 넘김 조건을 모두 대조했다.

| rel-id · 종류 | 읽지 못한 대상 | 원문이 말하는 쓰임 |
|---|---|---|
| R60 · 참고(범위 밖) | 플러그인 루트 `references/artifact-storage.md` | `fix-finding`과 `assess-patch-risk`가 파일을 만들거나 보관하기 전에 읽고 storage policy를 따르라고 한다.[](source:f-storage)[](source:a-storage) |
| R61 · 참고(범위 밖) | 플러그인 루트 `references/security-guidance.md` | `triage-finding`이 `SECURITY.md` chain 해석에 쓰라고 한다.[](source:t-policy) |
| R62 · 참고(범위 밖) | 플러그인 루트 `references/`의 scan 규약 문서 | `fix-finding`이 scan 폴더의 위치를 `scan-artifacts.md`로 풀라고 한다.[](source:f-report) |
| R63 · 참고(범위 밖) | `references/static-finding-assessment.md`(원장 R63은 `default-severity-rubric.md`도 묶는다) | `triage-finding`과 `verify-fix`가 정적 근거 평가 방법으로 읽으라고 한다. `verify-fix`는 호출자가 내용을 prompt에 이미 줬으면 다시 읽지 않는다.[](source:t-assess)[](source:v-assess) |
| R64 · 참고(범위 밖) | 플러그인 루트 `schemas/` 아래 JSON schema | `assess-patch-risk`가 결과 JSON을 이 schema로 검증하라고 한다.[](source:a-out) |
| R65 · 참고(범위 밖) | Codex Security 호스트 도구와 launcher | `assess-patch-risk`의 검증기 launcher와 `fix-finding`의 workbench 도구(`get_codex_security_scan_context`, `set_codex_security_finding_remediation` 등)다. 실행하지 않았다.[](source:a-out)[](source:f-wb)[](source:f-gen) |

@callout level=open-question title="확인하지 못했거나 원문에 명시가 없는 부분"
| 범위 밖 문서와 호스트 도구가 단계 순서, 통과 조건, 저장 위치를 더 정하는지는 알 수 없다. `fix-finding`의 workbench 단계와 `assess-patch-risk`의 검증기는 지시상 동작이며 실행해 확인하지 않았다.[](source:f-gen)[](source:a-out) |
| `fix-finding`의 Verify 단계와 `verify-fix`가 같은 요청에서 어떻게 나뉘는지는 원문에 명시 없음.[](source:f-verify)[](source:v-when) |
| `resolve-dependency-alert`가 `fix-finding`에 넘길 때 "선택된 verification mode"를 누가 고르는지는 원문에 명시 없음. `fix-finding`은 호출자가 `verificationMode: static`을 고르지 않으면 `standard`를 쓴다.[](source:r-steps)[](source:f-mode) |
| `assess-patch-risk`가 patch 입력 출처로 `fix-finding`의 Generate 산출물을 지목하는 문장은 없다. R29는 patch가 변하지 않는 파일이라는 조건이 맞는다는 데서 이은 호환이다.[](source:a-bind)[](source:f-gen) |

분석 중 원본은 수정하지 않았다. 스킬 안의 지시(Git 명령, 도구 호출, 파일 쓰기, scanner 조회)는 분석할 자료로만 읽고 실행하지 않았다. 자동 검증은 HTML 구조와 출처 해석만 확인한다. 사람 검토는 미실시다.
