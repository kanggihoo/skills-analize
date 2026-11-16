# fix-finding은 보안 취약점을 어떻게 가장 작게 고치고 검증하나? {#fix-finding-page}

`fix-finding`은 사용자가 고치고 검증해 달라고 명시적으로 요청한 보안 취약점을, 취약한 경로가 모두 지나는 가장 좁은 지점에서 가장 작게 고치고 고쳐졌음을 증거로 보이게 하는 스킬이다.[](source:s-front)[](source:s-obj)

- 사용자가 고치고 검증하라고 직접 요청할 때만 쓴다. 일반 버그 수정, 정확성이나 설계 리뷰 finding, 일반 검증, PR·commit·branch·patch·repository 전체 scan에는 쓰지 않는다.[](source:s-front)
- 에이전트는 `fixed`, `no_change`, `blocked` 중 하나를 내고, 취약한 경로와 지켜야 할 동작, 실행한 명령, 건너뛴 검증을 함께 보고한다.[](source:s-out)
- `standard`는 재현과 테스트를 실제로 돌리고, `static`은 아무것도 실행하지 않고 소스와 diff만 읽는다. 선택한 mode의 통과 조건을 모두 통과해야 `fixed`다.[](source:s-mode)[](source:s-hard1)
- 하지 않는 것은 무관한 정리와 재설계, 사용자의 로컬 변경 삭제, 인증·인가·입력 검증·sandbox·logging을 약하게 만드는 수정이다.[](source:s-hard3)[](source:s-hard4)[](source:s-hard5)

@answer scope="SKILL.md 전체 · 도구 구현은 계약 줄만 · 실행 없음"
@meta locale=ko
@source s-front title="frontmatter" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=1:4
@source s-store title="저장 정책 먼저 읽기" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=8:8
@source s-obj title="목적" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=10:14
@source s-mode title="verification mode" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=16:20
@source s-contract title="patch contract" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=22:31
@source s-wf1 title="절차 1" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=35:35
@source s-wf2 title="절차 2" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=36:36
@source s-wf3 title="절차 3과 제안 patch" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=37:38
@source s-wf4 title="절차 4" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=39:39
@source s-wf5 title="절차 5와 static 통과 조건" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=40:45
@source s-blocked title="blocked 조건" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=47:47
@source s-review title="fix 검토" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=49:53
@source s-wbintro title="workbench 단계 입구" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=57:57
@source s-tools title="신뢰할 Python과 Git" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=59:59
@source s-filters title="Git filter 차단" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=61:61
@source s-staticfilter title="static의 attribute 확인" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=63:63
@source s-gen title="Generate" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=65:65
@source s-gengit title="Generate의 private repository" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=66:66
@source s-genindex title="Generate의 index와 diff 캡처" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=67:68
@source s-gennogit title="Generate의 Git 밖 대상" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=69:69
@source s-genrehearse title="Generate의 diff 검토와 rehearsal" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=70:70
@source s-patchsend title="patch 전달 방식" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=71:72
@source s-apply title="Apply" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=73:73
@source s-applyex title="Apply 예시와 동등한 경우" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=74:75
@source s-verify title="Verify" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=76:76
@source s-failed title="failed 기록" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=78:78
@source s-owner title="위임된 단계의 소유" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=80:80
@source s-out title="결과 종류와 출력 계약" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=82:94
@source s-report title="fix report 경로" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=96:96
@source s-hard1 title="fixed 금지 조건" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=100:100
@source s-hard2 title="standard의 실행 요구" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=101:101
@source s-hard3 title="patch 확장 금지" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=102:102
@source s-hard4 title="사용자 변경 보존" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=103:103
@source s-hard5 title="보안 통제 약화 금지" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=104:104
@source s-hard6 title="proof gap 공개" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=105:105
@source s-yaml title="UI 메타데이터" path=codex-security/plugins/codex-security/skills/fix-finding/agents/openai.yaml lines=1:4
@source as-own title="저장 정책의 적용 범위와 scan 소유" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=3:9
@source as-supp title="보조 파일 도구와 소유자" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=11:25
@source as-misc title="소스 수정은 별도 도구" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=37:39
@source as-sealed title="봉인된 scan 파일" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=56:56
@source sa-base title="scan 경로 기준" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=7:15
@source sa-fix title="fix report 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=114:116
@source sa-place title="배치 규칙" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=118:122
@source sv-schema title="remediation setter 입력 schema" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=418:443
@source sv-ctx title="scan context 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1348:1356
@source sv-req title="App 전용 요청 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1676:1716
@source sv-set title="remediation setter 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1776:1796
@source rm-trans title="상태 전이 표" path=codex-security/plugins/codex-security/scripts/workbench_remediation.py lines=713:723
@source rm-pend title="대기 action 검사" path=codex-security/plugins/codex-security/scripts/workbench_remediation.py lines=726:747
@source wt-trusted title="trusted_git_executable 정의" path=codex-security/plugins/codex-security/scripts/workbench_target.py lines=249:249
@source wt-git title="git_command 정의" path=codex-security/plugins/codex-security/scripts/workbench_target.py lines=387:387
@source wt-ctx title="git_worktree_context 정의" path=codex-security/plugins/codex-security/scripts/workbench_target.py lines=1046:1046
@source ss-offline title="offline_git_bytes 정의" path=codex-security/plugins/codex-security/scripts/workbench_source_scopes.py lines=80:80
@source db-open title="open_scan_local_file 정의" path=codex-security/plugins/codex-security/scripts/workbench_db.py lines=2584:2584
@source tr-handoff title="fix-finding handoff 지시" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=82:82
@source dep-s1 title="읽기 전용 평가 단계" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=12:12
@source dep-s3 title="업그레이드 넘김" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=14:14
@source ap-desc title="description" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=3:3
@source ap-bind title="patch 고정 단계" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=22:22
@source vf-use title="호출 조건" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=10:10
@source vf-mode title="verification mode" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=20:20
@source pf-cont title="Continuum patch 수집" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=28:28

## 에이전트는 어떤 순서로 읽고, 고치고, 검증하나? {#behavior span=12}

그림은 둘로 나눴다. 첫 그림은 편집하기 전에 하는 일이고 둘째 그림은 편집한 뒤의 일이다. 첫 그림의 마지막 노드인 `재현과 대조`에서 둘째 그림의 첫 노드로 이어진다. workbench 요청이면 다음 패널의 흐름을 따른다.[](source:s-wbintro)

@workflow id=before-edit title="고치기 전: 요청에서 재현까지"
| ask | 고치기 요청 | external | source:s-front |
| storage | 저장 정책 읽기 | backend | source:s-store |
| mode | verification mode 선택 | backend | source:s-mode |
| contract | patch contract 세우기 | backend | source:s-contract |
| safe | 이미 안전한가? | backend | source:s-wf1 |
| nochange | no_change 보고 | external | source:s-out |
| repro | 재현과 대조 | backend | source:s-wf2 |
| ask > storage | |
| storage > mode | |
| mode > contract | |
| contract > safe | |
| safe > nochange | yes |
| safe > repro | no | emphasis |

이 그림은 핵심 경로만 그린다. `static`이면 `재현과 대조`를 하지 않는다는 점, 근거나 접근이 모자라 `blocked`로 끝나는 경로, 요청이 제외 범위일 때 스킬을 쓰지 않는 경로는 그리지 않았고 아래 `@steps`에 문장으로 적었다.

@steps id=before-edit-steps
| be-ask | 고치기 요청 | 에이전트는 사용자가 검증되었거나 그럴듯한 보안 취약점을 고치고 검증해 달라고 명시적으로 요청했을 때만 이 스킬을 쓴다. 일반 버그 수정, 정확성이나 설계 리뷰 finding, 일반 검증, PR·commit·branch·patch·repository 전체 scan이면 이 스킬을 쓰지 않는다.[](source:s-front) 입력은 현재 보안 finding이고, 호출한 쪽은 `verificationMode: static`과 출력 schema를 줄 수 있다.[](source:s-obj)[](source:s-mode)[](source:s-out) 이 노드에서는 갈림이 없고 곧바로 저장 정책 읽기로 넘어간다. 요청이 제외 범위에 들 때 무엇을 해야 하는지는 원문에 명시 없음. | before-edit | ask |
| be-storage | 저장 정책 읽기 | 에이전트는 경로를 고르거나 보관할 출력을 저장하기 전에 `../../references/artifact-storage.md`를 읽고 그 저장 정책을 따른다.[](source:s-store) 이 정책은 보조 Markdown과 보관할 증거를 `save_codex_security_artifact`와 `read_codex_security_artifact`로만 쓰게 하고, shell redirection, `apply_patch`, Python 같은 일반 파일 쓰기를 금지한다.[](source:as-supp) 소유자는 `scanId`(필요하면 handoff claim token)와 `targetPath` 중 정확히 하나로 밝히고, `storage`는 `persistent`나 `temporary`로 명시한다.[](source:as-supp) 소스 수정과 외부 게시 본문은 scan 보관 파일과 별개여서 기존 도구와 승인을 그대로 쓴다.[](source:as-misc) SDK가 소유한 workflow라면 이 정책 대신 SDK 지시를 따른다.[](source:as-own) 이 노드도 갈림 없이 mode 선택으로 넘어가며, 읽기 지시는 조건 없이 적혀 있다.[](source:s-store) | before-edit | storage |
| be-mode | verification mode 선택 | 에이전트는 호출한 쪽이 `verificationMode: static`을 명시하지 않으면 `standard`로 검증한다. 고른 mode는 이 스킬 전체와 위임한 검토, workbench 단계에 적용되고 위임하는 모든 agent에 넘긴다.[](source:s-mode) `static`이면 소스와 diff 근거만 평가한다. 검증 지시가 요청해도 의존성 설치, build, test, reproducer, 앱 실행을 하지 않는다. repository를 읽는 도구는 계속 쓴다.[](source:s-mode) `static`에서는 런타임 검사를 하지 않았다고 밝히고, 그 검사를 통과한 것으로 세거나 필수로 요구하지 않는다. 런타임 도구가 없다는 이유만으로는 blocker가 아니지만, 소스 근거에 중대한 빈틈이 있으면 `blocked`다.[](source:s-mode) 이 선택이 `재현과 대조`와 `mode별 검증`의 방식을 가른다. | before-edit | mode |
| be-contract | patch contract 세우기 | 에이전트는 편집하기 전에 영향받는 구현, 직접 caller, 가까운 helper, 관련 기존 테스트를 읽는다. 그리고 저장소 근거로 네 가지를 확립한다. 공격자가 제어하는 입력과 source에서 sink로 가는 경로(또는 깨진 통제), 보안 invariant와 가장 좁은 공유 enforcement 경계, 그대로 남아야 하는 정당한 동작·API·오류 의미·호환 제약, 가장 가까운 기존 구현·검증·오류 처리 선례다.[](source:s-contract) 이어서 finding을 이름 붙은 입력 예시가 아니라 data flow와 경계의 문제로 본다. 같은 값의 다른 인코딩, parser 형태, alias, caller, sink, 보안 민감 상태의 모든 표현과 복사본이 우회로가 될 수 있는지 확인한다. 안전하지 않은 상태는 명시적으로 처리하며, 조용히 받아들이거나 잘라 내거나 다른 도달 가능한 형태로 바꾸지 않는다.[](source:s-contract) 이 노드가 넘기는 것은 이 네 항목이다. 갈림은 없다. | before-edit | contract |
| be-safe | 이미 안전한가? | 에이전트는 보고된 경로를 따라가며 진짜 공유 경계를 찾는 데 필요한 맥락만 본다. 저장소 근거가 보고된 경로를 이미 안전하다고 보이면 `no_change`를 내고 추측성 변경을 하지 않는다.[](source:s-wf1) 코드가 이미 안전하면 이를 증명하고 변경이 필요 없다고 보고하는 것이 스킬의 목적이다.[](source:s-obj) 그렇지 않으면 재현과 대조로 간다. 안전한지 판단하는 데 필요한 근거나 접근이 없으면 `blocked`가 되지만, 이 경우를 이 질문 앞뒤 어디서 판단하는지는 원문에 명시 없음.[](source:s-blocked) | before-edit | safe |
| be-nochange | no_change 보고 | 에이전트는 파일을 바꾸지 않고 `no_change`와 근거를 보고한다. 출력 계약은 취약하다고 보고된 경로, 보안 invariant, 지켜야 했던 정당한 동작, 실행한 명령과 결과, 원래 경로가 닫혀 있다는 증거(소스 평가와 실제 실행 관측을 구분), 남은 불확실성이나 건너뛴 검증을 적게 한다.[](source:s-out) 호출한 쪽이 출력 schema를 주면 그 schema를 따른다.[](source:s-out) 이 목록 중 `no_change`에 어느 항목이 해당하는지는 원문에 명시 없음. | before-edit | nochange |
| be-repro | 재현과 대조 | `standard`에서 에이전트는 가능하면 그 경계를 지나는 가장 작고 신호가 강한 재현 하나와, 같은 경로를 지나는 정당한 입력(control) 하나를 실행한다.[](source:s-wf2) 테스트나 reproducer가 실현 가능한데도 코드 읽기만으로 끝내서는 안 된다.[](source:s-hard2) `static`이면 이 노드를 건너뛴다. 가능한 경우의 기준은 원문에 명시 없음. 건너뛴 검증은 최종 보고에 남기라고 한다.[](source:s-out)[](source:s-hard6) 여기서 얻은 결과가 둘째 그림의 수정으로 이어진다. | before-edit | repro |

@workflow id=after-edit title="고친 뒤: 수정에서 결과 보고까지"
| fix | 공유 경계 수정 | backend | source:s-wf3 |
| attack | patch 반박 | security | source:s-wf4 |
| gates | mode별 검증 | backend | source:s-wf5 |
| review | patch 검토 | security | source:s-review |
| pass | 모든 통과 조건 충족? | backend | source:s-hard1 |
| fixed | fixed 보고 | external | source:s-out |
| blocked | blocked 보고 | external | source:s-blocked |
| fix > attack | |
| attack > fix | 우회·회귀 발견 |
| attack > gates | 없음 |
| gates > review | |
| review > fix | 확인된 지적 |
| review > pass | |
| pass > fixed | yes | emphasis |
| pass > blocked | no |

이 그림은 핵심 경로만 그린다. 통과 조건 하나가 실패했을 때 수정으로 돌아가는지는 원문에 명시 없어 그리지 않았다. `blocked`는 필수 근거·도구·접근·결정이 모자랄 때의 결과이며, 이 그림에서는 마지막 질문의 `no`로만 그렸고 어느 노드에서든 날 수 있다는 점은 아래 `@steps`에 적었다.

@steps id=after-edit-steps
| ae-fix | 공유 경계 수정 | 에이전트는 patch contract에서 찾은 공유 경계에 가장 작은 repository-native 수정을 한다. 가까운 helper와 확립된 API를 우선하고, 무관한 재설계, 정리, 형제 finding으로 넓히지 않는다. 더 넓은 변경이 완전한 종결에 필요하다는 증거가 있을 때만 넓힌다.[](source:s-wf3)[](source:s-hard3) finding이 이 저장소용 제안 patch를 갖고 있으면 시작 후보로 쓴다. AWS Continuum라면 수집 결과의 `patches[].patch`나 저장된 finding `evidence`의 `source_data.patches[].patch`를 읽는다. 그 hunk를 현재 checkout과 비교해, 보안 invariant를 지키는 hunk는 두고 우회로를 남기거나 정당한 동작을 깨는 hunk는 고치거나 바꾼다. artifact 메타데이터만 있으면 소스에서 새로 고친다.[](source:s-wf3) 사용자의 변경이나 무관한 로컬 수정을 지우지 않고, 테스트를 통과시키려고 인증·인가·tenant 격리·입력 검증·sandbox·logging을 약하게 만들지 않는다.[](source:s-hard4)[](source:s-hard5) 이 노드는 수정을 만든 뒤 반박 노드로 넘긴다. | after-edit | fix |
| ae-attack | patch 반박 | 에이전트는 방금 만든 patch를 옹호하지 않고 공격한다. 바뀐 helper의 직접 caller를 모두 보고 바뀐 조건의 양쪽 결과를 확인한다. 그 과정에서 여전히 취약한 sink에 닿는 형제 경로·표현·복사본 하나와, patch 때문에 새로 거부되거나 다른 뜻으로 해석되는 평범한 기본 입력 하나를 찾는다.[](source:s-wf4) 둘 중 하나라도 있으면 구현을 고치고 다시 이 노드로 온다. 둘 다 없으면 검증으로 넘긴다. 이 반박은 편집과 검증 사이의 별도 단계로 적혀 있다. 되돌림 횟수 제한은 원문에 명시 없음. | after-edit | attack |
| ae-gates | mode별 검증 | `standard`에서 에이전트는 세 묶음을 한다. 최종 diff를 읽고 가장 좁은 syntax·import·build·type 검사를 돌린다. 보안 trigger나 가장 강한 집중 대체 검사를 다시 돌리고 다른 악성 입력 종류 하나를 검토한다. 정당한 control, 가장 가까운 기존 테스트, 소유 package의 해당 필수 검사를 다시 돌린다.[](source:s-wf5) `static`에서는 실행 없이 최종 diff를 읽고, 원래 exploit 경로와 관련 있는 다른 입력을 바뀐 통제를 거쳐 추적하고, caller와 기존 테스트를 소스로 읽어 정당한 동작과 호환성이 유지되는지 확인한다. 통과 조건마다 소스 근거를 적고 그 근거로 확립하지 못한 것을 밝힌다.[](source:s-wf5) 해당 mode의 검사가 저장소 근거상 무관할 때만 생략할 수 있고, 필요한 검사를 쓸 수 없으면 검증은 `blocked`이며 그 사실을 보고한다.[](source:s-hard1) 이 노드가 넘기는 것은 통과 조건별 결과와 근거다. | after-edit | gates |
| ae-review | patch 검토 | 에이전트는 남아 있는 우회로와 정당한 동작의 회귀를 찾아 patch를 다시 공격한다. 복잡도, 불확실성, 보안 영향이 클 때는 독립 조사나 검토를 쓴다. 이때 새 read-only 리뷰어에게 finding, repository root, 허가된 범위, repository 정책, verification mode, 후보 diff를 주되 작성자의 이유와 테스트 결과 주장은 주지 않는다. 위임할 수 없으면 별도 단계로 직접 검토한다.[](source:s-review) 리뷰에서 나온 우려는 소스나 `standard`의 집중 실행으로 확인한 뒤에야 patch를 바꾼다. 확인된 문제만 finding과 호환 범위 안에서 고치고, 영향받은 통과 조건을 해당 mode로 다시 돌린다. 수정이 보안 경계를 바꾸거나 새 중대한 위험을 만들면 검토를 다시 한다. 임시 변경이나 무관한 변경이 남지 않았는지도 확인한다.[](source:s-review) 확인된 지적이 있으면 수정 노드로 돌아가고, 없으면 마지막 질문으로 간다. 독립 검토를 언제 필수로 보는지의 수치 기준은 원문에 명시 없음. | after-edit | review |
| ae-pass | 모든 통과 조건 충족? | 에이전트는 선택한 mode의 통과 조건이 하나라도 통과하지 못했으면 `fixed`를 보고하지 않는다.[](source:s-hard1) 모두 통과했다면 `fixed`로 간다. 쓸 수 없는 필수 검사가 있거나 patch를 책임 있게 완료·검증하기 어려우면 `blocked`다.[](source:s-hard1)[](source:s-blocked) 검사가 실패한 경우에 patch를 고쳐 다시 시도하는지, 바로 `blocked`로 보는지는 원문에 명시 없음. 판정: 위 두 조건은 `fixed`가 아닌 결과로 가는 길만 정하고, 실패 뒤 재시도를 금지하지도 요구하지도 않는다.[](source:s-hard1)[](source:s-hard6) | after-edit | pass |
| ae-fixed | fixed 보고 | 에이전트는 호출한 쪽의 출력 schema가 있으면 그것을 따르고, 없으면 최종 응답에 outcome, 취약한 경로·보안 invariant·유지할 정당한 동작, 고른 patch 전략과 그것이 가장 좁은 완전한 repository-native 선택인 이유, 바꾼 파일, 추가한 테스트나 검증 산출물, 실행한 명령과 pass·fail·unknown, 원래 경로가 닫혔다는 증거, 정당한 동작이 유지됨을 보인 방법, 남은 불확실성을 넣는다.[](source:s-out) 증거에서는 소스 평가와 관측한 실행을 구분한다. 기존 scan 폴더를 쓰고 있다면 보이는 보고서를 fix report 경로에 쓰고, 없으면 최종 chat 요약으로 충분하다(사용자가 파일을 요청하면 파일).[](source:s-out)[](source:s-report) | after-edit | fixed |
| ae-blocked | blocked 보고 | 에이전트는 취약점이 실제일 수 있지만 필수 증거, 도구, 접근, 제품·호환성 결정이 없어 안전한 수정을 책임 있게 완료하거나 검증할 수 없을 때 `blocked`를 낸다.[](source:s-blocked) 보고에는 풀리지 않은 제품 결정을 적고, 환경이 검증을 막았다면 어느 명령이나 설정이 실패했고 어떤 증거가 아직 없는지를 정확히 적는다. proof gap은 숨기지 않는다.[](source:s-out)[](source:s-hard6) | after-edit | blocked |

## workbench 요청에서는 단계마다 무엇이 달라지나? {#workbench span=12}

Codex Security workbench 요청에 scan ID, occurrence ID, remediation request ID, action token, expected version이 모두 있으면 에이전트는 요청된 단계만 한다. 단계 경계는 코드를 쓸 수 있는 때를 바꿀 뿐 앞 패널의 검증 요구를 약하게 만들지 않는다.[](source:s-wbintro) 이 요청이 없으면 이 패널의 흐름은 적용되지 않는다고 판정한다(원문이 이 절의 조건을 "request includes"로 적기 때문이다).[](source:s-wbintro)

@workflow id=workbench-stages title="workbench 요청의 단계"
| wreq | workbench 요청 | external | source:s-wbintro |
| ctx | 배정된 finding 읽기 | backend | source:sv-ctx |
| tools | 신뢰할 Python·Git 고르기 | security | source:s-tools |
| stage | 요청된 단계는? | backend | source:s-wbintro |
| gen | Generate | backend | source:s-gen |
| apply | Apply | backend | source:s-apply |
| verify | Verify | backend | source:s-verify |
| fail | failed 기록 | external | source:s-failed |
| wreq > ctx | |
| ctx > tools | |
| tools > stage | |
| stage > gen | generate |
| stage > apply | apply |
| stage > verify | verify |
| gen > fail | 실패 |
| apply > fail | 실패 |
| verify > fail | 실패 |

이 그림은 단계 하나를 처리하는 경로만 그린다. 성공했을 때 `generated`, `applied`, `verified`를 기록하는 것, `failed` 뒤 다시 들어오는 경로, UI가 단계를 요청하는 순서는 그리지 않았다. 아래 `@steps`와 상태 전이 표에 적었다.

@steps id=workbench-steps
| wb-req | workbench 요청 | 에이전트는 호스트에서 scan ID, occurrence ID, remediation request ID, action token, expected version을 받는다. 이 값들이 있어야 이 절의 규칙이 적용된다.[](source:s-wbintro) 나중에 상태를 기록하는 도구의 입력도 같은 값이다. `actionToken`과 `requestId`는 UUID이고 `expectedVersion`은 양의 정수이며 `state`는 `generated`, `applied`, `verifying`, `verified`, `failed` 중 하나다.[](source:sv-schema) 상위 thread가 단계를 위임하면 맡은 worker가 마지막 workbench 갱신까지 그 단계를 소유한다. 상위 thread는 조율만 하고 worker의 편집을 되풀이하거나 chat 응답을 완료로 취급해서는 안 된다.[](source:s-owner) | workbench-stages | wreq |
| wb-ctx | 배정된 finding 읽기 | 에이전트는 받은 `scanId`, `occurrenceId`, `requestId`, `actionToken`을 `get_codex_security_scan_context`에 넘겨 배정된 finding을 읽거나 새로 고친다.[](source:s-wbintro) 이 도구 설명은 remediation 단계에서 이 값을 주면 배정된 finding만 읽는다고 적는다. 도구는 읽기 전용이 아니라 쓰기 동작으로 표시돼 있고, launch token을 주면 전달이 기록된다고도 적는다.[](source:sv-ctx) 이 흐름에서 launch token을 주는지는 원문에 명시 없음. 이 노드는 읽은 finding을 다음 노드로 넘긴다. scan 폴더 경로는 이 도구가 돌려주는 값만 쓰고 저장소 이름·revision·시각 공식으로 만들지 않는다.[](source:sa-base) | workbench-stages | ctx |
| wb-tools | 신뢰할 Python·Git 고르기 | 에이전트는 작업 복사본을 만들거나 들어가기 전에, 모든 checkout 밖의 통제된 빈 디렉터리에서 Python과 Git을 고른다. 두 도구의 절대 호출 경로, 해석된 부모 디렉터리, 해석된 실행 파일이 선택한 대상, 그것을 둘러싼 checkout, 캡처·rehearsal 작업 공간 밖인지 확인한다.[](source:s-tools) Python은 호스트가 고른 것(SDK 실행에서는 `CODEX_SECURITY_PYTHON_COMMAND`)을 쓰고, 없으면 믿을 수 있는 절대 경로 `PYTHON`, 호스트가 관리하는 runtime, 검증된 시스템 interpreter 순으로 쓴다. 그 절대 경로를 `-I`로 호출해 설치된 plugin의 scripts 디렉터리에서 helper를 import한다. 같은 디렉터리에서 `workbench_target.trusted_git_executable(target)`을 불러, 돌려받은 Git 절대 경로를 helper 프로세스의 `CODEX_SECURITY_GIT`에 고정하고 하위 helper에도 넘긴다. 둘 중 하나라도 검증하지 못하면 멈춘다.[](source:s-tools)[](source:wt-trusted) Generate와 Apply의 Git 명령은 `offline=True`와 실제 대상을 `workbench_target.git_command`에 넘기고, `-C`로 작업 디렉터리를 정하고, `-c core.hooksPath=<빈 private 디렉터리>`를 준다.[](source:s-tools)[](source:wt-git) 두 함수는 정의 줄만 확인했고 동작은 원문 문장만 근거다. 판정: 이 규칙은 대상 저장소의 실행 파일이나 hook이 도구로 쓰이지 않게 하는 것으로 읽히지만 원문은 이유를 적지 않는다. 이 규칙이 Verify에도 적용되는지는 원문에 명시 없음. | workbench-stages | tools |
| wb-stage | 요청된 단계는? | 에이전트는 요청된 remediation 단계(Generate, Apply, Verify) 하나만 한다.[](source:s-wbintro) 호스트의 UI가 먼저 단계를 요청한다. Generate는 `request_codex_security_finding_remediation`이, Apply와 Verify는 `request_codex_security_finding_remediation_action`이 맡는데, 두 도구는 모두 "App-only"라 에이전트가 부르는 도구가 아니다.[](source:sv-req) 대기 중인 action이 있으면 그 action이 허용한 상태만 기록할 수 있다.[](source:rm-pend) 에이전트가 요청에서 어느 단계인지 읽는 방법은 원문에 명시 없음. 판정: 위 규칙은 에이전트가 단계 순서를 건너뛰어 상태를 쓰지 못하게 한다.[](source:rm-trans)[](source:rm-pend) | workbench-stages | stage |
| wb-gen | Generate | 에이전트는 편집하기 전에, 어느 verification mode에서든 작업자와 하위 프로세스의 파일 쓰기를 격리된 worktree나 임시 작업 공간 안으로 가둔다. 파일 링크를 거쳐서도 밖으로 쓰지 못해야 한다. 가둘 수 없으면 편집하거나 repository 명령을 실행하기 전에 `failed`를 기록한다. 이 경계 안에서 소스와 회귀 테스트를 바꾸고, 허용된 테스트가 있으면 그 안에서 돌린다. 링크는 링크 항목으로 보존하고, 링크가 가리키는 파일을 고칠 때는 복사본 안의 검증된 경로를 쓴다. 끝나면 호스트가 준 값과 `state: "generated"`로 `set_codex_security_finding_remediation`을 부른다.[](source:s-gen)[](source:sv-set) Git 작업 트리라면 system·user Git 설정을 상속하지 않는 비어 있는 private repository를 `git init --template=`으로 만들고 요청의 작업 트리 기준 상태를 복사한다. source의 Git 메타데이터, 설정, hook은 복사하지 않고 실행 가능한 filter 설정은 대상에서 가져오지 않는다.[](source:s-gengit) 대상의 stage-zero blob을 `offline_git_bytes`로 읽어 private index에 채우고, 편집 전에 대상 경로를 stage해 `git write-tree`를 `BASE`로 적어 둔다. 편집 뒤에 필요한 경로만 stage해 `git diff-index --cached --binary ... BASE`의 바이트를 캡처한다.[](source:s-genindex)[](source:ss-offline) Git 밖의 대상이면 기준 복사본 `a`와 수정본 `b`를 Git 저장소 밖에 만들고 `git diff --no-index`로 비교하며 종료 코드 1이 "다르다"는 뜻이다.[](source:s-gennogit) 캡처 diff 전체를 의도한 변경과 대조하고, native 변환이 비Git 변경에 영향을 줄 수 있으면 등록 전에 별도 일회용 기준본에서 rehearsal을 한다. 앞뒤로 적용해 결과가 `b`와 `a`의 바이트와 같지 않으면 `failed`를 기록한다.[](source:s-genrehearse) 외부 Git filter는 캡처와 rehearsal에서 어느 mode든 끈다. 비어 있지 않은 `clean`, `smudge`, `process` 명령을 가진 driver를 찾아 설정에서 비우고, 필요하면 `filter.<driver>.required`를 켠다. 외부 변환이 꼭 필요하면 이미 검토된 scan 안의 patch를 경로와 digest로 등록하거나 실패를 기록한다.[](source:s-filters) `static`이면 setter의 checkout snapshot과 reverse check 전에 working-tree와 index attribute에 실행 가능한 filter가 없음을 확인해야 하고, 확인하지 못하면 그 작업 전에 멈춘다.[](source:s-staticfilter) 그다음 정확한 unified diff를 `patch`에 담아 보낸다. UTF-8이면 문자열이고 아니면 base64로 감싼 `{ encoding: "base64", content }`다. workbench가 Git이 diff를 읽을 수 있는지 확인한 뒤 저장하고 경로와 digest를 돌려준다. 이미 있는 scan 안의 patch는 `patchPath`와 `patchDigest`를 주고 `patch`는 생략한다. 실패한 Generate를 재시도할 때도 이미 검토된 patch가 있으면 기록된 경로와 digest를 재사용한다.[](source:s-patchsend)[](source:sv-schema) digest 형식은 `sha256:`과 소문자 hex 64자다.[](source:sv-schema) | workbench-stages | gen |
| wb-apply | Apply | 에이전트는 기록된 base revision과 patch digest를 확인한 뒤 그 patch를 선택된 작업 트리에 그대로 적용한다. 무관한 편집은 하지 않는다. 결과는 `applied` 또는 `failed`로 기록하고, 이 단계에서는 검증하거나 finding을 닫지 않는다.[](source:s-apply) 원문 예시는 이렇다. 선택된 디렉터리가 `components/api`이고, patch가 이미 추적되는 일반 파일 `handler.py`를 제자리에서 고치는 hunk 하나이고, `core.autocrlf=false`이며 어떤 attribute도 이 파일 내용을 바꾸지 않는 private checkout이다. 이때 현재 파일 바이트가 검토한 변경 전 내용과 같은지 확인하고, `git_worktree_context(target)`가 돌려주는 `root, prefix`로 `git_command(target, "-C", str(root), ..., "apply", "--no-index", "--check", ..., f"--directory={prefix}", "-", ..., offline=True)`를 먼저 실행한다. 성공하면 같은 digest 검증 바이트로 `--check` 없이 다시 실행하고, `components/api/handler.py`가 검토한 결과와 정확히 같은지 확인한다. `components/api` 안에서 실행하면 성공으로 끝나도 변경이 건너뛰어질 수 있다고 원문이 경고한다.[](source:s-applyex)[](source:wt-ctx)[](source:wt-git) 예시와 동등한 허가된 Apply라면 선택된 checkout에서 `root`와 `prefix`를 얻고, 등록된 scan 안의 파일을 `workbench_db.open_scan_local_file`로 한 번 읽어 SHA-256을 기록된 digest와 맞춘다. 파일의 모든 바이트를 제자리 diff의 변경 전·후 내용과 비교하고, 두 Git 명령 전에 실제 대상 경로와 Git 설정이 예시 조건을 만족하는지 확인한다. 예시와 다른 patch는 기존 단계의 범위와 검증 요구를 따른다. 선택한 mode에서 검토한 변경을 안전하게 적용하는 방법을 확립하지 못하면 쓰기 전에 `failed`를 기록한다.[](source:s-applyex)[](source:db-open) `static`이면 setter의 checkout snapshot이나 reverse check를 요청하기 전에 앞서 말한 attribute 확인을 마쳐야 한다.[](source:s-staticfilter) | workbench-stages | apply |
| wb-verify | Verify | 에이전트는 소스를 바꾸지 않는다. 선택한 mode의 통과 조건을 기록된 patch에 적용한다. 원래 취약한 경로가 닫혔고, 정당한 동작이 유지되고, 필요한 검사가 통과했다는 증거가 모두 있을 때만 `verified`를 기록하며, 정확한 증거와 실행한 명령을 검증 요약에 남긴다.[](source:s-verify) 그렇지 않으면 `failed`를 기록하고 실패한 통과 조건이나 증명 간극을 적는다. finding은 닫지 않는다.[](source:s-verify) 이 단계 설명은 `verified`와 `failed`만 기록하라고 하지만, 상태 전이 표는 `applied`에서 `verified`로 바로 가는 전이를 허용하지 않는다(아래 표와 감사 패널의 open-question). | workbench-stages | verify |
| wb-fail | failed 기록 | 에이전트는 단계가 실패하면 실패한 단계와 오류를 `summary`에 적어 `failed`를 기록하고, 등록이 실패했으면 setter의 오류도 함께 적는다.[](source:s-failed) 격리를 확립하지 못했거나 변경을 안전하게 적용할 방법을 모르는 경우처럼 쓰기 전에 `failed`를 기록하라고 하는 곳이 단계 설명에 있다.[](source:s-gen)[](source:s-applyex) 도구를 검증하지 못했을 때는 "멈춘다"고만 적고 `failed` 기록은 요구하지 않는다. 그때 무엇을 기록하는지는 원문에 명시 없음.[](source:s-tools) `failed`에서는 다른 상태로 다시 들어갈 수 있다.[](source:rm-trans) | workbench-stages | fail |

도구가 허용하는 상태 전이는 아래 표와 같다. 표는 `workbench_remediation.py`의 `require_transition`이다.[](source:rm-trans)

| 현재 상태 | 다음에 기록할 수 있는 상태 |
| --- | --- |
| `requested` | `requested`, `generated`, `failed` |
| `generated` | `generated`, `applied`, `failed` |
| `applied` | `applied`, `verifying`, `failed` |
| `verifying` | `verifying`, `verified`, `failed` |
| `verified` | `verifying`, `verified` |
| `failed` | `generated`, `applied`, `verifying`, `verified`, `failed` |

대기 중인 action이 없으면 `requested`에서 `generated`, `generated`에서 `applied`, `applied`에서 `verifying`으로 가는 전이는 해당 action(generate, apply, verify)을 먼저 요청해야 한다.[](source:rm-pend) setter의 `state` 입력에는 `requested`가 없다. `requested`는 UI가 요청을 대기열에 올릴 때 쓰고, Codex가 기록하는 것은 `generated`, `applied`, `verifying`, `verified`, `failed`라고 도구 설명이 적는다.[](source:sv-schema)[](source:sv-set)

## 언제 켜지고 언제 쓰면 안 되나? {#activation span=12}

켜지는 조건은 `description` 한 문장이 정한다. 사용자가 검증되었거나 그럴듯한 보안 취약점을 고치고 검증해 달라고 명시적으로 요청할 때만 쓰고, 나머지 네 가지는 쓰지 않는다. `description`은 모델이 판단할 때 참고하는 설명이지 정확히 일치해야 켜지는 사전이 아니다.[](source:s-front)

@code source=s-front language=yaml

frontmatter에는 `name`과 `description`만 있고 호출을 막는 필드(`disable-model-invocation` 등)는 없다. `agents/openai.yaml`의 `default_prompt`는 사용자가 `$fix-finding`을 직접 이름으로 부르는 예시이고, 이 파일에도 암묵 호출을 막는 필드는 없다.[](source:s-front)[](source:s-yaml) 암묵 호출을 막는 다른 장치가 있는지는 원문에 명시 없음.

@code source=s-yaml language=yaml

| 상황 | 이 스킬 | 근거 |
| --- | --- | --- |
| 사용자가 검증되었거나 그럴듯한 보안 취약점을 고치고 검증해 달라고 명시적으로 요청 | {good:쓴다} | description 첫 문장이다.[](source:s-front) |
| 일반 버그 수정 | {bad:쓰지 않는다} | 제외 목록에 있다.[](source:s-front) |
| 정확성이나 설계 리뷰 finding | {bad:쓰지 않는다} | 제외 목록에 있다.[](source:s-front) |
| 일반 검증(고치지 않는 검증) | {bad:쓰지 않는다} | 제외 목록에 있다. 이름이 비슷한 `verify-fix`는 이미 있는 수정의 검증만 하는 별도 스킬이다.[](source:s-front)[](source:vf-use) |
| 전체 PR, commit, branch, patch, repository scan | {bad:쓰지 않는다} | 제외 목록에 있다.[](source:s-front) |

호출 경로는 두 가지가 보인다. `triage-finding`은 confirmed finding마다 `$fix-finding` handoff를 결과에 넣지만 사용자가 고치자고 할 때만 부른다.[](source:tr-handoff) `resolve-dependency-alert`는 사용자가 업그레이드를 요청할 때만 근거와 변경안을 `fix-finding`에 넘긴다.[](source:dep-s3)

## 무엇을 강제하고, 무엇을 만들거나 바꾸나? {#enforcement span=12}

규칙은 모두 원문의 `Hard Rules`와 mode 절에서 나온다. 아래는 찾아보기용 표다.

| 규칙 | 내용 | 출처 |
| --- | --- | --- |
| `fixed` 조건 | 선택한 mode의 통과 조건을 모두 통과하기 전에는 `fixed`를 보고하지 않는다. 필요한 검사를 쓸 수 없으면 검증은 `blocked`이고 그 사실을 보고한다. 저장소 근거상 무관한 검사만 생략할 수 있다. | [](source:s-hard1) |
| `standard`의 실행 | 집중 테스트나 reproducer를 실현할 수 있으면 코드 읽기만으로 끝내지 않는다. | [](source:s-hard2) |
| patch 범위 | 무관한 정리, 형제 finding, 구조 재설계로 넓히지 않는다. 넓은 변경이 완전한 종결에 필요하다는 증거가 있을 때만 예외다. | [](source:s-hard3) |
| 사용자 변경 | 사용자 변경과 무관한 로컬 수정을 지우지 않는다. | [](source:s-hard4) |
| 보안 통제 | 테스트를 통과시키려고 인증, 인가, tenant 격리, 입력 검증, sandbox, logging을 약하게 만들지 않는다. | [](source:s-hard5) |
| proof gap | 환경이 검증을 막으면 어느 명령이나 설정이 실패했고 어떤 증거가 없는지 정확히 말한다. 증명 간극을 숨기지 않는다. | [](source:s-hard6) |

두 mode의 차이는 실행 여부 하나로 모인다.

| 항목 | `standard` | `static` |
| --- | --- | --- |
| 선택 | 기본값이다.[](source:s-mode) | 호출한 쪽이 `verificationMode: static`을 명시할 때만이다.[](source:s-mode) |
| 재현과 대조 | 가능하면 실행한다.[](source:s-wf2) | {bad:하지 않는다} 설치, build, test, reproducer, 앱 실행을 하지 않는다.[](source:s-mode) |
| 통과 조건 | diff 검사, 보안 trigger 재실행, 정당한 control·기존 테스트·필수 검사 재실행이다.[](source:s-wf5) | diff 검사, exploit 경로 추적, caller와 기존 테스트를 소스로 읽기다. 근거를 gate마다 적는다.[](source:s-wf5) |
| 런타임 검사가 없을 때 | 필요한 검사를 쓸 수 없으면 `blocked`다.[](source:s-hard1) | 런타임 도구 부재만으로는 blocker가 아니다. 소스 근거의 중대한 빈틈은 `blocked`다.[](source:s-mode) |

만들거나 바꾸는 것은 세 갈래다.

- 대상 저장소의 소스와 회귀 테스트를 바꾼다.[](source:s-wf3)[](source:s-gen)
- 최종 보고를 낸다. 기존 scan 폴더를 쓰고 있으면 `<artifacts_dir>/fix_report.md`에 보이는 보고서를 쓰고, 없으면 사용자가 파일을 요청하지 않는 한 chat 요약으로 충분하다. `<artifacts_dir>`는 `<scan_dir>/artifacts`다.[](source:s-report)[](source:sa-fix)[](source:sa-base)
- workbench에서는 patch 파일과 digest, remediation 상태를 호스트 도구에 기록한다.[](source:sv-set)

보고서를 번호 붙은 scan phase 폴더 밖에 두는 이유는 fix-finding이 단독으로도 기존 scan에서도 돌 수 있기 때문이다.[](source:sa-place)

@callout level=warning title="fix report와 봉인된 scan"
| 저장 정책은 완료되거나 봉인된 scan 파일을 보조 파일 저장 도구로 고칠 수 없다고 적는다. 그러나 `fix_report.md`는 기존 scan 폴더에 쓰라고 한다.[](source:as-sealed)[](source:s-report) 봉인된 scan에서 어떻게 조정하는지는 원문에 명시 없음. 감사 패널의 미확인 항목도 함께 본다. |

## 앞뒤 스킬과는 어떻게 이어지나? {#position span=12}

이 스킬은 `remediate-finding` 묶음의 단계다. 전체 흐름은 `codex-security/_group-remediate-finding/remediate-finding.html`에 있다.

@workflow id=fix-position title="fix-finding 앞뒤"
| triage | triage-finding | external | source:tr-handoff |
| dep | resolve-dependency-alert | external | source:dep-s3 |
| fix | fix-finding | backend | source:s-front |
| assess | assess-patch-risk | backend | source:ap-desc |
| triage > fix | 사용자가 요청할 때만 | emphasis |
| dep > fix | 업그레이드를 요청할 때만 | emphasis |
| fix > assess | patch 파일, 필수 아님 |

`verify-fix`, `publish-findings`는 그림에서 뺐다. 같은 계열이거나 시작 후보 patch를 주는 관계라 아래 표에만 남겼다.

@steps id=fix-position-steps
| fp-triage | triage-finding | 앞 스킬이다. confirmed finding마다 통제 입력, source, control이나 sink, 전제 조건, 정확한 코드 위치, 필요한 invariant, 고칠 경계, 남은 증명 간극을 담은 `$fix-finding` handoff를 결과에 넣고, 사용자가 고치자고 할 때만 호출한다.[](source:tr-handoff) 이 노드에서 `fix-finding`으로 가는 간선은 사용자의 요청이 있어야 열린다(R27). | fix-position | triage |
| fp-dep | resolve-dependency-alert | 앞 스킬이다. 평가는 읽기 전용이고, 사용자가 업그레이드를 요청할 때만 근거와 제안 변경을 선택한 verification mode로 `fix-finding`에 넘긴다.[](source:dep-s1)[](source:dep-s3) 이 업그레이드 요청이 `fix-finding`의 "fix and verify" 명시 요청과 같은지는 원문에 명시 없다(R28). | fix-position | dep |
| fp-fix | fix-finding | 이 페이지의 스킬이다. 앞 스킬이 넘긴 finding과 사용자 요청을 받아 동작 패널의 흐름을 실행하고 `fixed`, `no_change`, `blocked`와 patch를 낸다.[](source:s-out) | fix-position | fix |
| fp-assess | assess-patch-risk | 뒤에 올 수 있는 스킬이다. 이미 만들어진 patch 파일의 영향과 회귀 위험을 읽기만 하고 patch를 만들거나 적용하지 않는다.[](source:ap-desc) 필수 순서는 아니다(R29). | fix-position | assess |

| rel-id | 상대 스킬 | 종류 | 받는 것·넘기는 것 | 조건 |
| --- | --- | --- | --- | --- |
| R27 | `triage-finding` → 이 스킬 | 넘김 | `$fix-finding` handoff 요약을 받는다.[](source:tr-handoff) | 사용자가 고치자고 할 때만 호출한다.[](source:tr-handoff) |
| R28 | `resolve-dependency-alert` → 이 스킬 | 넘김 | 근거와 제안한 의존성 변경을 받는다.[](source:dep-s3) | 업그레이드 요청이 있을 때만 넘긴다. 그 단계 1은 package manager와 project script 호출을 금지하지만, 이 스킬은 `static`을 명시하지 않으면 `standard`로 검증한다. 금지가 위임에도 이어지는지는 원문에 명시 없음.[](source:dep-s1)[](source:s-mode) |
| R29 | 이 스킬 → `assess-patch-risk` | 산출물 호환 | Generate 단계가 만든 patch 파일과 digest(`sha256:` 접두어 소문자 hex 64자)를 넘길 수 있다.[](source:sv-schema) 상대는 patch 바이트의 SHA-256을 고정한다.[](source:ap-bind) | 필수 순서가 아니다. 두 digest 표기를 어떻게 옮기는지는 원문에 명시 없음. |
| R30 | 이 스킬 ↔ `verify-fix` | 같은 계열 | 둘 다 `standard`와 `static`을 같은 이름·같은 뜻으로 쓴다.[](source:s-mode)[](source:vf-mode) | 고치는 도중 자동 호출하지 않는다. 구현이나 테스트 실행 요청만으로는 `verify-fix`를 부르지 않는다.[](source:vf-use) Verify 단계와 `verify-fix`의 중복은 원문에 명시 없음. |
| R37 | `publish-findings` → 이 스킬 | 산출물 호환 | Continuum 수집 결과의 `patches[].patch`가 시작 후보 patch가 된다.[](source:pf-cont)[](source:s-wf3) | 현재 checkout과 hunk를 비교해 유지하거나 고친다.[](source:s-wf3) |

## 어디까지 읽고 확인했고, 무엇이 남았나? {#audit span=12}

스킬 폴더의 텍스트 파일 2개(`SKILL.md`, `agents/openai.yaml`)를 모두 읽었다. 번역본은 이 폴더에 없다. 필수 참조 중 `artifact-storage.md`와 `scan-artifacts.md`는 전체를 읽었고, 도구와 helper 파일은 아래 범위만 읽었다.

코드와 CLI는 실행하지 않았고 외부 URL은 열지 않았다. 필수 자료를 읽지 못한 곳은 없어 부분 분석은 아니다. 다만 helper 함수 다섯 개는 정의 줄만 확인했다.

| 파일(경로는 하단 출처) | 바이트 | 읽은 범위 |
| --- | --- | --- |
| fix-finding/SKILL.md | 18461 | 전체 |
| fix-finding/agents/openai.yaml | 225 | 전체 |
| references/artifact-storage.md | 7947 | 전체 |
| references/scan-artifacts.md | 11701 | 전체 |
| mcp-app/server.ts | 84254 | 418:443, 1348:1356, 1676:1716, 1776:1796 (부분 읽음) |
| scripts/workbench_remediation.py | 35923 | 705:760 (부분 읽음) |
| scripts/workbench_target.py | 71863 | 정의 줄 249, 387, 1046만 확인(본문은 읽지 않음) |
| scripts/workbench_source_scopes.py | 15576 | 정의 줄 80만 확인(본문은 읽지 않음) |
| scripts/workbench_db.py | 149908 | 정의 줄 2584만 확인(본문은 읽지 않음) |
| triage-finding/SKILL.md | 8394 | 78:84만 읽음 |
| resolve-dependency-alert/SKILL.md | 2548 | 10:16만 읽음 |
| assess-patch-risk/SKILL.md | 8299 | 1:24만 읽음 |
| verify-fix/SKILL.md | 4193 | 1:22만 읽음 |
| publish-findings/SKILL.md | 11118 | 26:30만 읽음 |

읽은 텍스트 파일은 14개이고 그중 전체를 읽은 것은 4개, 부분 읽음 또는 정의 줄 확인은 10개다. 바이너리와 생성 데이터는 읽은 것이 없다. 인용하지 않은 부분은 `workbench_remediation.py`의 705:712와 750:760(상태 전이와 대기 action 밖의 줄)이다.

@callout level=open-question title="Verify의 상태 전이"
| `Verify` 단계는 `verified`나 `failed`를 기록하라고 하지만, 상태 전이 표에서 `applied`는 `applied`, `verifying`, `failed`로만 갈 수 있다.[](source:s-verify)[](source:rm-trans) 따라서 `applied` 상태에서 바로 `verified`를 기록하면 도구가 거부할 것으로 읽힌다(판정). 호스트가 verify action을 요청할 때 상태를 `verifying`으로 옮기는지, 에이전트가 `verifying`을 먼저 기록해야 하는지는 읽은 줄에 없고 원문에 명시 없음.[](source:rm-pend)[](source:sv-req) |

@callout level=open-question title="fix report 쓰기"
| `fix_report.md`를 어느 도구로 쓰는지는 원문에 명시 없다. 저장 정책은 보관할 보조 파일을 저장 도구로만 쓰라고 하고, `path`는 `artifacts/`, `findings/`, `hardening/` 아래의 상대 경로여야 한다.[](source:as-supp) 판정: `artifacts/fix_report.md`는 이 경로 형식에 들지만 저장 도구를 쓰는지는 원문이 말하지 않는다. 봉인된 scan에는 이 도구로 쓸 수 없다.[](source:as-sealed) |

@callout level=open-question title="위임과 실패 처리"
| `resolve-dependency-alert`가 넘길 때 `static`을 고르라는 문장은 없고, 그 스킬의 package manager 금지가 이 스킬의 `standard` 검증에서 어떻게 되는지도 원문에 명시 없음.[](source:dep-s1)[](source:s-mode) 통과 조건이 실패했을 때 수정으로 돌아가는지, 재현이 "가능하다"의 기준이 무엇인지, `Verify`에 신뢰할 Python·Git 규칙이 적용되는지도 원문에 명시 없음.[](source:s-wf2)[](source:s-tools) |
