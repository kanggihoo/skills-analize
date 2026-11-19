# 이미 있는 취약점 finding을 고칠 때 다섯 스킬은 어떻게 이어지나? {#group-remediate-finding}

**고치는 일은 사용자가 요청해야 시작한다.** 시작점은 `triage-finding`과 `resolve-dependency-alert`이고, 실제로 코드를 바꾸는 스킬은 `fix-finding` 하나다.[](source:fix-fm)

- `triage-finding`은 finding을 정적 근거로 분류하고, `confirmed`마다 `fix-finding`에 넘길 handoff를 남긴다. 호출은 사용자가 고치자고 할 때만 한다.[](source:tri-ret)
- `resolve-dependency-alert`는 읽기 전용으로 의존성을 추적한다. 파일은 사용자가 업그레이드를 요청할 때만 `fix-finding`을 통해 바꾼다.[](source:dep-steps)
- `assess-patch-risk`와 `verify-fix`는 이미 있는 수정을 파일을 바꾸지 않고 점검한다. 필수 순서가 아니고, 둘이 서로를 부르지도 않는다.[](source:risk-fm)[](source:ver-use)
- 스킬 내부 규칙은 각 스킬의 개요 페이지에서 본다. 이 페이지는 스킬 사이의 순서와 주고받는 것만 다룬다.

@answer scope="codex-security 컬렉션 · 묶음 remediate-finding · 스킬 5개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source tri-fm title="triage-finding의 description" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=1:4
@source tri-top title="inline 작업과 읽기 전용" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=8:10
@source tri-ret title="결과 반환과 fix-finding handoff" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=78:84
@source tri-in title="codex-security.findings 입력" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=7:12
@source fix-fm title="fix-finding의 description" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=1:4
@source fix-obj title="목표와 verification mode" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=10:20
@source fix-wf title="구현 절차와 blocked 조건" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=33:47
@source fix-rev title="fix 검토와 위임" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=49:53
@source fix-wb title="workbench 단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=57:80
@source fix-out title="결과 값과 보고 위치" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=82:96
@source fix-pre title="시작 patch 후보" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=38:38
@source ver-use title="verify-fix 호출 조건" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=8:14
@source ver-res title="verify-fix 판정 값" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=22:52
@source risk-fm title="assess-patch-risk의 description" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=1:4
@source risk-wf title="patch 고정과 읽기 전용 절차" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=22:24
@source risk-rec title="권고 값과 label" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=33:50
@source risk-out title="출력과 JSON 검증" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=52:75
@source dep-top title="알림 보고서 입력" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=8:10
@source dep-steps title="읽기 전용 추적과 업그레이드 위임" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=12:14

## 에이전트는 다섯 스킬을 어떤 순서로 쓰나? {#flow span=12}

두 시작점 중 하나에서 출발해, 사용자가 수정을 요청하면 `fix-finding`으로 간다. 요청이 없으면 분류나 추적 결과만 알려 주고 끝낸다.[](source:tri-ret)[](source:dep-steps) 수정이 있으면 `assess-patch-risk`가 그 patch를 받아 읽을 수 있다. `verify-fix`는 선으로 잇지 않았다. 직접 연결이 원장에 없는 대안이기 때문이다.

그림은 핵심 경로만 그렸다. `resolve-dependency-alert`가 `triage-finding`의 GitHub 절차를 참고하는 선과, 묶음 밖 스킬에서 들어오는 선은 아래 표에 두었다.

@workflow id=remediate-flow title="finding 수정 묶음 흐름"
| tri | triage-finding | backend | source:tri-ret |
| dep | resolve-dependency-alert | backend | source:dep-steps |
| ask | 사용자가 수정을 요청했나? | backend | source:tri-ret |
| fix | fix-finding | backend | source:fix-obj |
| stop | 결과만 알리고 끝 | external | source:dep-steps |
| risk | assess-patch-risk | security | source:risk-wf |
| ver | verify-fix | security | source:ver-use |
| tri > ask | confirmed |
| dep > ask | 업그레이드 안내 |
| ask > fix | yes | emphasis |
| ask > stop | no |
| fix > risk | 결과 전달 | dashed |

@steps id=remediate-steps
| s-tri | triage-finding | finding을 정적 근거로 `confirmed`, `not_actionable`, `needs_review` 중 하나로 분류하고, `confirmed`에는 handoff를 붙인다.[](source:tri-ret) | remediate-flow | tri |
| s-dep | resolve-dependency-alert | lockfile과 manifest에서 취약한 의존성을 끌어온 부모를 찾고 업그레이드 가능 여부를 판단한다.[](source:dep-steps) | remediate-flow | dep |
| s-ask | 사용자가 수정을 요청했나? | 사용자가 고치자고 할 때만 `fix-finding`으로 넘어간다. 두 시작점이 같은 조건을 건다.[](source:tri-ret)[](source:dep-steps) | remediate-flow | ask |
| s-fix | fix-finding | 가장 작은 변경으로 고치고 `fixed`, `no_change`, `blocked` 중 하나로 보고한다.[](source:fix-obj)[](source:fix-out) | remediate-flow | fix |
| s-stop | 결과만 알리고 끝 | 수정을 요청받지 못하면 파일을 바꾸지 않고 분류나 추적 결과로 끝낸다.[](source:tri-top)[](source:dep-steps) | remediate-flow | stop |
| s-risk | assess-patch-risk | 고정된 patch를 읽기 전용으로 분석해 영향, 회귀 위험, merge 자격을 판정한다.[](source:risk-wf)[](source:risk-rec) | remediate-flow | risk |
| s-ver | verify-fix | 사용자가 명시적으로 요청하면 현재 checkout에서 취약점이 막혔는지 파일을 바꾸지 않고 판정한다.[](source:ver-use)[](source:ver-res) | remediate-flow | ver |

반복과 위임은 `fix-finding` 안에서만 일어난다. 복잡도나 영향이 크면 읽기 전용 reviewer에게 patch 검토를 맡기고, 확인된 지적만 고쳐 해당 검증을 다시 한다.[](source:fix-rev) workbench에서 단계를 위임받은 worker는 마지막 상태 갱신까지 그 단계를 맡고, 부모는 그 일을 대신하지 않는다.[](source:fix-wb)

## 스킬 사이에 무엇을 넘기고 참고하나? {#relations span=12}

원장의 관계 중 이 묶음이 걸린 행이다. 다음 안내와 참고는 자동 실행이 아니다. 그림에는 R27, R28, R29만 그렸다.

| 누가 | 누구를 | 관계 | 언제 | 그림 |
| --- | --- | --- | --- | --- |
| `triage-finding` {#g-r27} | `fix-finding` | 다음 안내 | `confirmed`마다 handoff를 결과에 넣는다. 호출은 사용자가 수정을 진행하자고 할 때만이다. `fix_finding_handoff`는 `confirmed`가 아니면 `null`이다[](source:tri-ret) | 그림 |
| `resolve-dependency-alert` {#g-r28} | `fix-finding` | 다음 안내 | 사용자가 업그레이드를 요청할 때만 근거와 변경안을 선택된 verification mode로 넘긴다. 그전에는 읽기 전용이다. 1단계의 package manager 금지가 위임 뒤에도 이어지는지는 원문에 명시 없음[](source:dep-steps)[](source:fix-obj) | 그림 |
| `fix-finding` {#g-r29} | `assess-patch-risk` | 결과 전달 | 만든 patch 파일을 입력으로 쓸 수 있다. 필수 순서는 아니다. 두 스킬의 digest 표기 옮기는 방법은 원문에 명시 없음[](source:fix-wb)[](source:risk-wf) | 그림 |
| `fix-finding` {#g-r30} | `verify-fix` | 대안 | 둘 다 `standard`와 `static` mode를 같은 뜻으로 쓴다. `verify-fix`는 fix 작업 중 자동 호출되지 않는다. workbench Verify 단계와의 겹침은 원문에 명시 없음. 같은 mode 이름을 쓴다는 연결은 분석자의 추론이다[](source:ver-use)[](source:fix-obj) | 그림에서 생략 |
| `assess-patch-risk` {#g-r31} | `verify-fix` | 대안 | 둘 다 파일을 바꾸지 않고 점검한다. 하나는 patch의 위험을, 하나는 취약점이 막혔는지를 본다. 직접 연결은 없다[](source:risk-fm)[](source:ver-use) | 그림에서 생략 |
| `resolve-dependency-alert` {#g-r33} | `triage-finding` | 참고 | Dependabot 알림은 `triage-finding`의 GitHub intake 절차를 따른다. 사용자가 source를 고르지 않으면 조회하지 않고 먼저 묻는다[](source:dep-top) | 그림에서 생략 |
| `fix-finding` {#g-r83} | Codex Security MCP의 remediation 도구 | 참고 | workbench 요청이 있으면 `set_codex_security_finding_remediation`에 단계 상태를 기록한다. 아래 상태 표 참고[](source:fix-wb) | 그림에서 생략 |
| 여러 scan 스킬 {#g-r75} | `triage-finding` | 결과 전달 | 사용자가 `codex-security.findings` 파일을 줄 때만 입력으로 쓴다. 자동 연결은 없다. 보내는 쪽은 묶음 밖[](source:tri-in) | 그림에서 생략 |
| `publish-findings` {#g-r37} | `fix-finding` | 결과 전달 | 수집된 `patches[].patch`를 시작 patch 후보로 쓰고, 현재 checkout과 hunk를 비교해 유지하거나 고친다. 보내는 쪽은 묶음 밖[](source:fix-pre) | 그림에서 생략 |
| `resolve-dependency-alert` {#g-r35} | `publish-findings` | 다음 안내 | 사용자가 가져오기를 명시 요청할 때만 쓴다. 받는 쪽은 묶음 밖[](source:dep-top) | 그림에서 생략 |
| `propose-security-hardening` {#g-r34} | `fix-finding` | 참고 | 개별 patch를 넘는 대안을 다루며 지역 수정이 맞는 경우를 적는다. 이름으로 지목하지 않는 추론이다. 보내는 쪽은 묶음 밖 | 그림에서 생략 |
| `triage-finding` {#g-r32} | `validation` | 대안 | 둘 다 근거 기반 판정을 내린다. `triage-finding`은 정적 근거로 분류하고 runtime validation에는 쓰지 말라고 한다. 받는 쪽은 묶음 밖[](source:tri-fm) | 그림에서 생략 |

## 어떤 파일과 상태를 함께 쓰나? {#shared-state span=12}

스킬끼리 직접 호출하지 않는 곳은 파일과 상태로 이어진다.

| 파일·상태 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| 저장소 소스와 lockfile | `fix-finding`(수정 요청이 있을 때)[](source:fix-obj) | `triage-finding`, `resolve-dependency-alert`, `verify-fix`, `assess-patch-risk`가 읽는다. 앞의 둘은 쓰지 않는다[](source:tri-top)[](source:dep-steps)[](source:ver-use) |
| patch 파일과 digest | `fix-finding`(workbench Generate)[](source:fix-wb) | `assess-patch-risk`(고정된 patch로만)[](source:risk-wf) |
| 봉인된 scan의 `findings.json` | 묶음 밖 scan 스킬 | `triage-finding`(사용자가 줄 때만)[](source:tri-in) |
| remediation 상태 | `fix-finding`(`set_codex_security_finding_remediation`)[](source:fix-wb) | 읽는 스킬은 원문에 명시 없음 |
| fix 보고서(scan 폴더가 있을 때) | `fix-finding`[](source:fix-out) | 읽는 스킬은 원문에 명시 없음 |
| 위험 평가 JSON | `assess-patch-risk`(caller가 요청할 때만, 주제 checkout 밖)[](source:risk-out) | 호출한 쪽 |

`fix-finding`의 workbench 단계 상태는 `requested`, `generated`, `applied`, `verifying`, `verified`, `failed`다. 앞으로 가는 전이 말고도 `failed`로 가는 전이, `failed`에서의 재진입, `verified`에서 `verifying`으로 돌아가는 전이가 허용된다. 근거는 원장 R83의 코드 확인(`workbench_remediation.py:713:723`)이고, 단계 요청 도구는 UI 전용이라 모델이 부르지 않는다. 분석자는 실행하지 않았다.

## 무엇을 지키고 언제 멈추나? {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 사용자가 수정을 요청하지 않음 | `triage-finding`과 `resolve-dependency-alert`는 `fix-finding`을 호출하지 않는다 | [](source:tri-ret)[](source:dep-steps) |
| `fix-finding` description | 사용자가 명시적으로 `fix and verify`를 요청할 때만 쓴다 | [](source:fix-fm) |
| 필수 근거나 결정이 없음 | `fix-finding`이 `blocked`를 돌려준다 | [](source:fix-wf) |
| `verify-fix` 호출 | 명시적 요청에만 쓴다. fix 구현이나 테스트 실행만으로는 켜지지 않는다 | [](source:ver-use) |
| `verify-fix` 판정 | `fixed`, `still_vulnerable`, `inconclusive`. 파일 수정·patch 적용·artifact 쓰기는 하지 않는다 | [](source:ver-res) |
| `assess-patch-risk` 입력 | 고정된 patch, provider PR diff, commit range만 받는다. 수정 중인 working tree는 받지 않는다 | [](source:risk-wf) |
| `assess-patch-risk` 권한 | label은 조언일 뿐 merge 권한을 주지 않고 patch를 만들거나 적용하지 않는다 | [](source:risk-rec)[](source:risk-fm) |

## 더 자세히 읽으려면 {#more span=12}

각 스킬의 내부 규칙은 스킬 개요 페이지에 있다. 경로 ID는 `codex-security/plugins/codex-security/skills/<이름>`이다.

@callout level=open-question title="확인하지 못한 것"
| `resolve-dependency-alert` 1단계의 package manager 금지가 `fix-finding` 위임 뒤에도 이어지는지는 원문에 명시 없음 |
| `fix-finding`의 workbench Verify 단계와 `verify-fix`가 어떻게 겹치는지는 원문에 명시 없음 |
| `fix-finding`이 만든 patch를 `assess-patch-risk`에 넘기는 방법은 원문에 명시 없음 |

읽은 원본: SKILL.md 5개, `triage-result-contract.md`의 인용 줄. 제외: 없음.
