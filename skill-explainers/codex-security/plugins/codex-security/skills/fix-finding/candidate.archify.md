# fix-finding은 보안 취약점을 어떻게 가장 작게 고치고 검증하나? {#fix-finding-page}

`fix-finding`은 사용자가 고치고 검증해 달라고 명시적으로 요청한 보안 취약점을 공유 경계에서 가장 작은 repository-native 변경으로 고친다. 선택한 verification mode의 통과 조건을 모두 통과해야 `fixed`를 낸다. 이미 안전하면 `no_change`, 근거나 결정이 모자라면 `blocked`다.[](source:f-front)[](source:f-obj)[](source:f-out)

- 일반 버그 수정, 정확성이나 설계 리뷰 finding, 검증만 하는 요청, PR·commit·branch·repository 전체 scan에는 쓰지 않는다.[](source:f-front)
- 편집 전에 patch contract를 세우고, 고친 뒤 직접 caller를 확인하고, 독립 검토까지 거친다.[](source:f-contract)[](source:f-wf4)[](source:f-review)
- `standard`는 reproducer와 테스트를 돌리고, `static`은 아무것도 실행하지 않고 소스만 읽는다.[](source:f-mode)
- workbench 요청이면 Generate, Apply, Verify 중 요청된 단계만 한다. 단계마다 쓸 수 있는 곳이 다르다.[](source:f-wbintro)[](source:f-gen)[](source:f-apply)[](source:f-verify)

@answer scope="원문 분석 · 스킬 폴더 2개 파일과 플러그인 공용 참조 2개 읽음 · 도구 구현은 계약에 필요한 줄만 읽음 · 코드 실행 없음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source f-full title="codex-security/plugins/codex-security/skills/fix-finding/SKILL.md · 18461B · 스킬 본문(원본)" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md
@source f-front title="fix-finding/SKILL.md · frontmatter" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=1:4
@source f-storage title="fix-finding/SKILL.md · 저장 정책 먼저 읽기" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=8:8
@source f-obj title="fix-finding/SKILL.md · 목적" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=12:14
@source f-mode title="fix-finding/SKILL.md · verification mode" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=18:20
@source f-contract title="fix-finding/SKILL.md · patch contract" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=24:31
@source f-wf1 title="fix-finding/SKILL.md · 절차 1단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=35:35
@source f-wf2 title="fix-finding/SKILL.md · 절차 2단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=36:36
@source f-wf3 title="fix-finding/SKILL.md · 절차 3단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=37:38
@source f-wf4 title="fix-finding/SKILL.md · 절차 4단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=39:39
@source f-wf5 title="fix-finding/SKILL.md · 절차 5단계와 static 통과 조건" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=40:45
@source f-blocked title="fix-finding/SKILL.md · blocked 조건" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=47:47
@source f-review title="fix-finding/SKILL.md · 독립 검토" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=51:53
@source f-wbintro title="fix-finding/SKILL.md · workbench 단계 입구" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=57:57
@source f-tools title="fix-finding/SKILL.md · 신뢰할 Python과 Git" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=59:59
@source f-filters title="fix-finding/SKILL.md · Git filter 차단" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=61:63
@source f-gen title="fix-finding/SKILL.md · Generate 단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=65:65
@source f-genprivate title="fix-finding/SKILL.md · Generate의 patch 캡처 절차" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=66:70
@source f-patchsend title="fix-finding/SKILL.md · patch 전달 방식" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=71:72
@source f-apply title="fix-finding/SKILL.md · Apply 단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=73:75
@source f-verify title="fix-finding/SKILL.md · Verify 단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=76:76
@source f-failed title="fix-finding/SKILL.md · 실패 기록과 worker 소유" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=78:80
@source f-out title="fix-finding/SKILL.md · outcome과 출력 계약" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=82:94
@source f-report title="fix-finding/SKILL.md · fix report 경로" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=96:96
@source f-hard title="fix-finding/SKILL.md · Hard Rules" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=98:105
@source f-yaml title="fix-finding/agents/openai.yaml · 225B · UI 메타데이터" path=codex-security/plugins/codex-security/skills/fix-finding/agents/openai.yaml
@source as-full title="plugins/codex-security/references/artifact-storage.md · 7947B · 저장 정책" path=codex-security/plugins/codex-security/references/artifact-storage.md
@source as-owner title="artifact-storage.md · scan 소유와 구조화 결과" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=5:9
@source as-supp title="artifact-storage.md · 보조 파일 도구와 소유자" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=11:25
@source as-temp title="artifact-storage.md · 생성 증거는 temporary에서" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=43:43
@source as-edit title="artifact-storage.md · 소스 편집은 별도 도구" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=39:39
@source as-sealed title="artifact-storage.md · 봉인된 scan과 Generate" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=56:56
@source sa-full title="plugins/codex-security/references/scan-artifacts.md · 11701B · scan 경로 규약" path=codex-security/plugins/codex-security/references/scan-artifacts.md
@source sa-fix title="scan-artifacts.md · fix report 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=114:116
@source sa-place title="scan-artifacts.md · 배치 규칙" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=118:123
@source sa-base title="scan-artifacts.md · scan_dir 규칙" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=9:13
@source sv-schema title="plugins/codex-security/mcp-app/server.ts · 84254B · 도구 소스 (일부 줄만 읽음) · remediation 입력 schema" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=418:446
@source sv-ctx title="server.ts · get_codex_security_scan_context" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1348:1376
@source sv-app title="server.ts · App 전용 요청 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1675:1716
@source sv-set title="server.ts · set_codex_security_finding_remediation" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1775:1796
@source py-trans title="plugins/codex-security/scripts/workbench_remediation.py · 35923B · 상태 전이 (705~765줄만 읽음)" path=codex-security/plugins/codex-security/scripts/workbench_remediation.py lines=713:749
@source py-git title="scripts/workbench_target.py · 71863B · trusted_git_executable 정의 줄만 확인" path=codex-security/plugins/codex-security/scripts/workbench_target.py lines=249:249
@source py-cmd title="scripts/workbench_target.py · git_command 정의 줄만 확인" path=codex-security/plugins/codex-security/scripts/workbench_target.py lines=387:387
@source py-ctx title="scripts/workbench_target.py · git_worktree_context 정의 줄만 확인" path=codex-security/plugins/codex-security/scripts/workbench_target.py lines=1046:1046
@source py-off title="scripts/workbench_source_scopes.py · 15576B · offline_git_bytes 정의 줄만 확인" path=codex-security/plugins/codex-security/scripts/workbench_source_scopes.py lines=80:80
@source py-open title="scripts/workbench_db.py · 149908B · open_scan_local_file 정의 줄만 확인" path=codex-security/plugins/codex-security/scripts/workbench_db.py lines=2584:2584
@source readme title="plugins/codex-security/skills/README.md · 3752B · 벤더의 스킬 안내" path=codex-security/plugins/codex-security/skills/README.md lines=32:32
@source mcp-json title="plugins/codex-security/.mcp.json · 2078B · MCP 서버 선언" path=codex-security/plugins/codex-security/.mcp.json
@source plugin-json title="plugins/codex-security/.codex-plugin/plugin.json · 1682B · 플러그인 선언" path=codex-security/plugins/codex-security/.codex-plugin/plugin.json
@source tri-hand title="triage-finding/SKILL.md · 82번째 줄만 읽음(R27 대조)" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=82:82
@source tri-con title="triage-finding/references/triage-result-contract.md · 79~80, 114번째 줄(R27 대조)" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=79:80
@source tri-null title="triage-result-contract.md · fix_finding_handoff는 confirmed만" path=codex-security/plugins/codex-security/skills/triage-finding/references/triage-result-contract.md lines=114:114
@source rda-fix title="resolve-dependency-alert/SKILL.md · 14번째 줄만 읽음(R28 대조)" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=14:14
@source apr-desc title="assess-patch-risk/SKILL.md · 3번째 줄만 읽음(R29 대조)" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=3:3
@source apr-bind title="assess-patch-risk/SKILL.md · 22번째 줄만 읽음(R29 대조)" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=22:22
@source vf-when title="verify-fix/SKILL.md · 10번째 줄만 읽음(R30 대조)" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=10:10
@source vf-static title="verify-fix/SKILL.md · 20번째 줄만 읽음(R30 대조)" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=20:20
@source psh-local title="propose-security-hardening/SKILL.md · 22번째 줄만 읽음(R34 대조)" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=22:22
@source psh-tactical title="propose-security-hardening/SKILL.md · 30번째 줄만 읽음(R34 대조)" path=codex-security/plugins/codex-security/skills/propose-security-hardening/SKILL.md lines=30:30
@source pf-cont title="publish-findings/SKILL.md · 28번째 줄만 읽음(R37 대조)" path=codex-security/plugins/codex-security/skills/publish-findings/SKILL.md lines=28:28

## 이 스킬은 언제 켜지고 무엇을 하면 안 되나? {#activation}

호출 조건은 frontmatter의 description 한 곳에 있다. description은 모델이 호출을 판단할 때 참고하는 설명이고, 특정 단어와 정확히 일치해야 켜지는 사전이 아니다.[](source:f-front)

@code source=f-front language=yaml

| 구분 | 원문 규칙 |
|---|---|
| 켜는 경우 | 사용자가 검증됐거나 그럴듯한 보안 취약점을 고치고 검증해 달라고 명시적으로 요청할 때다.[](source:f-front) |
| 켜지 않는 경우 | 일반 버그 수정, 정확성이나 설계 리뷰 finding, 일반 validation, PR·commit·branch·patch·repository 전체 scan에는 쓰지 않는다.[](source:f-front) |
| 호출 제한 필드 | frontmatter에 `disable-model-invocation`이 없고 `agents/openai.yaml`에도 `policy`가 없다. 원문에 명시 없음.[](source:f-front)[](source:f-yaml) |
| 시작 전 의무 | 경로를 고르거나 결과를 저장하기 전에 `artifact-storage.md`를 읽고 그 저장 정책을 따른다.[](source:f-storage) |

설명용 예시 · "이 SQL injection finding을 고치고 재현이 막혔는지 확인해 줘"는 켜지는 요청이다. "이 PR에서 보안 문제를 찾아 줘"는 scan이라 범위 밖이다.

판정 · 자동 호출을 막는 장치는 description 문장뿐이다. 필드로 강제하지 않으므로 호스트가 이 문장을 지키는지는 실행으로 확인해야 한다.[](source:f-front)[](source:f-yaml)

verification mode는 호출자가 고른다. 기본은 `standard`이고, 고른 모드는 위임한 모든 agent와 workbench 단계에 그대로 넘긴다.[](source:f-mode)

| 모드 | 하는 일 | 하지 않는 일 |
|---|---|---|
| `standard`(기본) | 가능하면 reproducer와 정당한 동작 검사를 돌린다. 변경 뒤에는 가장 좁은 문법·import·build·type 검사와 소유 패키지의 필수 검사까지 돌린다.[](source:f-wf2)[](source:f-wf5) | 코드 검사만 믿지 않는다. 집중 테스트나 reproducer가 가능하면 쓴다.[](source:f-hard) |
| `static`(`verificationMode: static`을 명시) | diff와 소스 근거만 평가한다. runtime 검사를 하지 않았다고 적고, 그 검사를 통과로 세거나 요구하지 않는다.[](source:f-mode) | 의존성 설치, build, test, reproducer, 앱 실행을 하지 않는다. validation 지시가 요청해도 하지 않는다. runtime 도구가 없다는 사실만으로는 막힌 것이 아니지만, 소스 근거에 실질적인 빈틈이 있으면 `blocked`다.[](source:f-mode) |

금지와 의무는 Hard Rules에 모여 있다.

| 규칙 | 내용 |
|---|---|
| `fixed` 조건 | 선택한 모드의 통과 조건을 모두 통과하기 전에는 `fixed`를 보고하지 않는다. 필수 검사를 건너뛸 수 있는 것은 저장소 근거가 그 검사가 무관함을 보일 때뿐이다. 필수 검사를 못 돌리면 검증은 `blocked`이고 그 사실을 보고한다.[](source:f-hard) |
| 범위 | 완전한 닫힘에 더 넓은 변경이 필요하다는 근거가 없으면 무관한 정리, 형제 finding, 구조 재설계로 patch를 넓히지 않는다.[](source:f-hard) |
| 로컬 변경 | 사용자 변경이나 무관한 로컬 수정을 지우지 않는다.[](source:f-hard) |
| 통제 약화 | 테스트를 통과시키려고 인증, 권한, tenant 격리, 입력 검증, sandbox, logging을 약화하지 않는다.[](source:f-hard) |
| 빈틈 은폐 | 증명 빈틈을 숨기지 않는다. 환경이 검증을 막으면 어떤 명령이나 설정이 실패했고 어떤 근거가 아직 없는지 정확히 말한다.[](source:f-hard) |

## 어떤 순서로 고치고 무엇을 보고하나? {#procedure}

에이전트는 먼저 영향받는 구현과 직접 caller, 가까운 helper, 기존 테스트를 읽어 patch contract를 세운다. 이름 붙은 입력 예시만이 아니라 data-flow와 경계 문제로 보고, 같은 효과를 내는 인코딩, parser 형태, alias, 복사본이 우회하지 못하게 한다.[](source:f-contract)

@workflow id=fix-flow title="fix-finding 진행 순서"
| lane find | 파악 |
| lane edit | 수정 |
| lane check | 검증과 결과 |
| trace | 경로 추적 | backend | find | source:f-wf1 |
| safe | 이미 안전한가? | backend | find | source:f-wf1 |
| nochange | no_change 보고 | external | find | source:f-wf1 |
| repro | 재현 시도 | backend | find | source:f-wf2 |
| fix | 경계에서 고침 | backend | edit | source:f-wf3 |
| challenge | 패치 반박 | security | edit | source:f-wf4 |
| gates | 모드별 통과 조건 | backend | check | source:f-wf5 |
| review | 독립 검토 | security | check | source:f-review |
| pass | 모두 통과? | backend | check | source:f-hard |
| fixed | fixed 보고 | external | check | source:f-out |
| hold | fixed 보고 금지 | external | check | source:f-hard |
| blocked | blocked 보고 | external | check | source:f-blocked |
| trace > safe | |
| safe > nochange | yes |
| safe > repro | no |
| repro > fix | |
| fix > challenge | |
| challenge > gates | |
| gates > review | |
| gates > blocked | 필수 검사 불가 | dashed |
| review > pass | |
| review > fix | 확인된 문제 | dashed |
| pass > fixed | yes | emphasis |
| pass > hold | no |

@steps id=fix-steps
| trace | 경로 추적 | 보고된 경로를 따라가며 진짜 공유 경계를 찾는 데 필요한 맥락만 본다.[](source:f-wf1) | fix-flow | trace |
| safe | 이미 안전한가? | 저장소 근거가 보고된 경로를 이미 안전하다고 보이면 추측성 변경을 하지 않고 `no_change`를 낸다. 코드가 이미 안전하면 안전하다는 것을 증명하고 변경 불필요를 보고한다.[](source:f-wf1)[](source:f-obj) | fix-flow | safe |
| nochange | no_change 보고 | 변경 없이 근거만 보고한다.[](source:f-out) | fix-flow | nochange |
| repro | 재현 시도 | `standard`에서 가능하면 그 경계를 지나는 가장 작은 재현 하나와, 같은 경로의 정당한 control 하나를 돌린다.[](source:f-wf2) | fix-flow | repro |
| fix | 경계에서 고침 | 공유 경계에 가장 작은 repository-native 수정을 한다. 가까운 helper와 확립된 API를 우선한다. finding이 이 저장소용 patch를 갖고 있으면 시작 후보로 쓴다.[](source:f-wf3) | fix-flow | fix |
| challenge | 패치 반박 | 바뀐 helper의 직접 caller를 모두 보고 바뀐 조건의 양쪽 결과를 본다. 여전히 취약 sink에 닿는 형제 경로·표현·복사본 하나와, 이제 새로 거부되는 평범한 기본 입력 하나를 찾는다. 있으면 구현을 고친다.[](source:f-wf4) | fix-flow | challenge |
| gates | 모드별 통과 조건 | 아래 표의 통과 조건을 선택한 모드대로 통과한다. gate마다 근거를 적고 확립하지 못한 것을 밝힌다.[](source:f-wf5) | fix-flow | gates |
| review | 독립 검토 | 복잡도, 불확실성, 보안 영향이 크면 독립 검토를 쓴다. 검토에서 나온 우려는 소스나 `standard`의 집중 실행으로 확인한 뒤에 patch를 바꾸고 영향받은 gate를 다시 통과한다.[](source:f-review) | fix-flow | review |
| pass | 모두 통과? | 선택한 모드의 gate를 하나라도 통과하지 못했으면 `fixed`를 보고하지 않는다.[](source:f-hard) | fix-flow | pass |
| fixed | fixed 보고 | 모든 gate를 통과했을 때만 보고한다.[](source:f-hard) | fix-flow | fixed |
| hold | fixed 보고 금지 | 미통과 때 어떤 outcome을 내는지는 원문에 명시 없음. 필수 검사를 못 돌렸다면 `blocked`다.[](source:f-hard) | fix-flow | hold |
| blocked | blocked 보고 | 취약점이 진짜일 수 있지만 필수 근거, 도구, 접근, 제품·호환성 결정이 없어 안전한 수정을 끝내거나 검증할 수 없을 때 낸다.[](source:f-blocked) | fix-flow | blocked |

판정 · `hold`는 원문이 이름 붙인 단계가 아니라 Hard Rules의 `fixed` 금지 문장을 노드로 옮긴 것이다. 점선 간선(`review > fix`, `gates > blocked`)도 각각 검토 문단과 `blocked` 문장에서 읽은 것이다.[](source:f-hard)[](source:f-review)[](source:f-blocked)

| 모드 | 통과 조건(gate) |
|---|---|
| `standard` | 최종 diff를 살피고 가장 좁은 문법·import·build·type 검사를 돌린다. 보안 트리거나 가장 강한 대체 검사를 다시 돌리고 다른 악성 입력 종류 하나를 검토한다. 정당한 control, 가장 가까운 기존 테스트, 소유 패키지의 필수 검사를 다시 돌린다.[](source:f-wf5) |
| `static` | 최종 diff를 살핀다. 원래 공격 경로와 다른 입력을 바뀐 통제를 거쳐 추적한다. caller와 기존 테스트를 소스로 읽어 정당한 동작과 호환성이 유지됨을 확립한다. gate마다 소스 근거를 인용하고 확립하지 못한 것을 밝힌다.[](source:f-wf5) |

독립 검토는 새로 읽는 read-only 리뷰어에게 finding, repository root, 허용 범위, 저장소 정책, verification mode, 후보 diff를 준다. 작성자의 설명이나 테스트 결과 주장은 주지 않는다. 위임이 불가능하면 별도 pass로 직접 한다.[](source:f-review)

최종 응답에는 아래 9개를 넣는다. 호출자가 출력 schema를 주면 그것을 따른다.[](source:f-out)

- outcome: `fixed`, `no_change`, `blocked` 중 하나다.
- 구체적인 취약 경로, 보안 invariant, 계속 유지해야 했던 정당한 동작이다.
- 고른 patch 전략과 그것이 왜 가장 좁은 완전한 선택이었는지다. `blocked`면 풀리지 않은 제품 결정이다.
- 바뀐 파일이다.
- 추가한 테스트나 검증 산출물이다.
- 실행한 명령과 각 pass, fail, unknown 결과다.
- 원래 취약 경로가 닫혔다는 근거다. 소스 평가와 실제 실행 관찰을 구분한다.
- 정당한 동작이 유지됨을 어떻게 보였는지다.
- 남은 불확실성이나 건너뛴 검증이다.

기존 scan 폴더가 있으면 `scan-artifacts.md` 규칙으로 폴더를 정하고 `<artifacts_dir>/fix_report.md`에 보이는 보고서를 쓴다. scan 폴더가 없으면 사용자가 파일을 요청하지 않는 한 채팅 요약으로 충분하다.[](source:f-report)[](source:sa-fix) fix 산출물은 번호가 붙은 scan phase 폴더 밖에 둔다. fix-finding이 단독으로도, 기존 scan에 대해서도 돌 수 있기 때문이다.[](source:sa-place)

fix 작업이 파일을 남길 때는 `artifact-storage.md`의 저장 정책을 따른다. 아래는 이 스킬에 걸리는 항목이다.

| 항목 | 규칙 |
|---|---|
| 보조 파일 | 보존할 Markdown과 helper 출력은 `save_codex_security_artifact`와 `read_codex_security_artifact`로만 쓰고 읽는다. shell redirection, `apply_patch`, Python 같은 일반 파일 쓰기로 쓰지 않는다.[](source:as-supp) |
| 소유자와 저장소 | 실행 중인 scan이면 `scanId`(필요하면 `handoffClaimToken`), 단독 작업이면 `targetPath` 중 정확히 하나로 소유자를 정하고 `storage`를 `persistent`나 `temporary`로 명시한다.[](source:as-supp) |
| 소스 편집 | 소스와 설정 편집, 외부 게시 요청 본문은 scan artifact와 별개이고 기존 도구와 권한 규칙을 그대로 쓴다.[](source:as-edit) |
| 실행이 만드는 파일 | PoC 실행과 build는 `temporary` 저장소나 그 안의 일회용 repository 복사본에서만 돌린다. 최종 기록에 필요한 파일만 `persistent`로 가져온다.[](source:as-temp) |
| 봉인된 scan | 완료·봉인된 scan 파일은 이 도구로 고치지 못한다. workbench Generate는 `set_codex_security_finding_remediation`의 `state: "generated"`로 patch를 저장하거나 등록한다.[](source:as-sealed) |

판정 · 원문은 fix report를 이 도구로 쓴다고 이름 붙여 말하지 않는다. 다만 fix report는 보존할 Markdown이라 위 보조 파일 규칙에 해당하는 것으로 읽힌다.[](source:f-report)[](source:as-supp)

@callout level=open-question title="봉인된 scan에 fix report를 쓰는 경우"
| `fix-finding`은 기존 scan 폴더의 `fix_report.md`에 쓰라고 한다.[](source:f-report)[](source:sa-fix)
| `artifact-storage.md`는 완료되어 봉인된 scan의 파일은 보조 파일 저장 도구로 고칠 수 없고, 이후 산출물은 standalone target collection을 쓰라고 한다.[](source:as-sealed)
| 두 규칙이 봉인된 scan에서 어떻게 조정되는지는 원문에 명시 없음. 이 저장소에서 확인하지 못했다.

## workbench 단계에서는 무엇이 달라지나? {#workbench}

workbench 요청에 scan ID, occurrence ID, remediation request ID, action token, expected version이 있으면 이 단계 규칙이 적용된다. 에이전트는 받은 `scanId`, `occurrenceId`, `requestId`, `actionToken`을 `get_codex_security_scan_context`에 넘겨 배정된 finding을 읽고, 요청된 단계만 한다. 단계 경계는 코드를 쓸 수 있는 때를 바꿀 뿐이고 위의 검증 요구를 약하게 하지 않는다.[](source:f-wbintro)

`requestId`와 `actionToken` 중 하나만 있으면 이 도구는 `occurrenceId`, `requestId`, `actionToken`이 모두 필요하다는 오류를 낸다.[](source:sv-ctx) Apply와 Verify는 먼저 App이 `request_codex_security_finding_remediation_action`으로 요청을 잡아야 하고, 이 도구는 App 전용이다.[](source:sv-app) 에이전트는 허용된 상태만 기록할 수 있다. 다음 상태로 가기 전에 해당 action이 먼저 요청되어 있어야 한다.[](source:py-trans)

@workflow id=remediation-states title="remediation 상태 전이"
| requested | requested | external | source:py-trans |
| generated | generated | backend | source:py-trans |
| applied | applied | backend | source:py-trans |
| verifying | verifying | backend | source:py-trans |
| verified | verified | backend | source:py-trans |
| failed | failed | security | source:py-trans |
| requested > generated | Generate |
| generated > applied | Apply |
| applied > verifying | Verify 요청 |
| verifying > verified | 검증 통과 | emphasis |
| verifying > failed | 실패 | dashed |
| failed > generated | 다시 시작 | dashed |

@steps id=remediation-steps
| requested | requested | UI가 요청을 대기열에 넣은 상태다. Codex는 이 상태에서 Generate를 시작한다.[](source:sv-app)[](source:sv-set) | remediation-states | requested |
| generated | generated | patch를 만들어 경로와 digest를 기록한 상태다.[](source:f-gen)[](source:sv-schema) | remediation-states | generated |
| applied | applied | 기록된 patch를 선택된 working tree에 적용한 상태다.[](source:f-apply) | remediation-states | applied |
| verifying | verifying | Verify action이 요청되어 검증 중인 상태다.[](source:py-trans) | remediation-states | verifying |
| verified | verified | 원래 취약 경로가 닫혔고 필수 검사가 통과했을 때만 기록한다.[](source:f-verify) | remediation-states | verified |
| failed | failed | 단계가 실패하면 실패한 step과 오류를 `summary`에 적어 기록한다.[](source:f-failed) | remediation-states | failed |

판정 · 위 그림은 허용 전이의 핵심 경로만 그렸다. 코드는 `requested`, `generated`, `applied`, `verifying`에서 `failed`로 가는 전이와 같은 상태를 다시 기록하는 전이, `failed`에서 `generated`, `applied`, `verifying`, `verified`로 가는 전이, `verified`에서 `verifying`이나 `verified`로 가는 전이도 허용한다. 줄 번호는 `workbench_remediation.py` 713~723이다.[](source:py-trans)

| 단계 | 쓸 수 있는 곳 | 기록하는 상태 | 핵심 규칙 |
|---|---|---|---|
| Generate | 격리된 worktree나 임시 작업공간뿐이다. 링크를 거쳐도 그 밖에 쓰지 못하게 가둔다. 가둘 수 없으면 편집이나 명령 실행 전에 `failed`를 기록한다.[](source:f-gen) | `generated` 또는 `failed`. `patch`나 `patchPath`와 `patchDigest`를 함께 보낸다.[](source:f-gen)[](source:f-patchsend) | 소스와 회귀 테스트를 만들고 허용된 테스트를 이 경계 안에서 돌린다. 링크는 링크 항목으로 보존한다.[](source:f-gen) |
| Apply | 선택된 working tree다. 기록된 patch만 쓴다.[](source:f-apply) | `applied` 또는 `failed`[](source:f-apply) | 기록된 base revision과 patch digest를 확인하고 정확히 그 patch만 적용한다. 무관한 편집을 하지 않는다. 검증하거나 finding을 닫지 않는다.[](source:f-apply) |
| Verify | 소스를 바꾸지 않는다.[](source:f-verify) | `verified` 또는 `failed`. 실행한 명령과 근거를 검증 요약에 남긴다.[](source:f-verify) | 선택한 모드의 gate를 기록된 patch에 적용한다. 원래 경로가 닫히고 정당한 동작이 유지되고 필수 검사가 통과할 때만 `verified`다. 아니면 실패한 gate나 proof gap을 적는다. finding을 닫지 않는다.[](source:f-verify) |

patch를 만들기 전에 도구부터 고정한다. 아래는 모두 원문이 정한 의무다.

| 항목 | 규칙 |
|---|---|
| 신뢰할 Python과 Git | 어떤 checkout에도 속하지 않는 비어 있는 통제 디렉터리에서 고른다. 각 도구의 호출 경로, resolve된 상위 디렉터리와 실행 파일이 선택된 대상, 그 checkout, 모든 capture·rehearsal 작업공간 밖에 있는지 확인한다. 확인하지 못하면 멈춘다.[](source:f-tools) |
| Python 선택 | 호스트가 고른 것(SDK 실행에서는 `CODEX_SECURITY_PYTHON_COMMAND`), 없으면 신뢰할 절대 경로 `PYTHON`, 호스트 관리 runtime, 검증된 시스템 interpreter 순이다. 따옴표로 감싼 절대 경로에 `-I`를 붙여 설치된 플러그인 `scripts` 디렉터리의 helper를 import한다.[](source:f-tools) |
| Git 선택 | 같은 디렉터리에서 `workbench_target.trusted_git_executable(target)`를 불러 얻은 절대 경로를 helper 프로세스의 `CODEX_SECURITY_GIT`에 고정한다. 이 함수 정의는 `workbench_target.py` 249줄에 있다.[](source:f-tools)[](source:py-git) |
| Git 명령 | Generate와 Apply의 Git 명령은 `offline=True`와 실제 대상을 `workbench_target.git_command`에 넘기고 `-C`로 작업 디렉터리를 정한다. `-c core.hooksPath=<빈 private 디렉터리>`를 붙인다.[](source:f-tools)[](source:py-cmd) |
| 외부 Git filter | inline 캡처와 모든 rehearsal에서 두 모드 모두 끈다. 실제 대상과 각 private 작업 디렉터리의 유효한 Git 설정에서 비어 있지 않은 `clean`, `smudge`, `process` 명령을 가진 driver를 찾아 그 명령을 비운다. Git이 driver를 필요로 하면 실패하게 한다.[](source:f-filters) |
| `static` 추가 조건 | workbench setter의 checkout snapshot과 reverse check도 source-only 검증을 지켜야 한다. 검토된 patch의 attribute 변경을 포함해 실행 가능한 filter가 없음을 먼저 확인하고, 확인하지 못하면 그 작업 전에 멈춘다.[](source:f-filters) |

Generate에서 Git working tree의 patch를 캡처하는 절차는 아래 순서다. 모두 원문이 정한 절차이고, 세부 인자는 원문에 있다.[](source:f-genprivate)

| 순서 | 하는 일 |
|---|---|
| 1 | private 저장소를 시스템·사용자 Git 설정에서 `git init` 전부터 격리한다. `GIT_CONFIG`와 `GIT_CONFIG_*`를 지우고 빈 private `HOME`, `XDG_CONFIG_HOME`을 쓰고 `GIT_CONFIG_NOSYSTEM=1`, 빈 `GIT_CONFIG_GLOBAL`을 지정한다. `git init --template=`로 초기화한다.[](source:f-genprivate) |
| 2 | 요청의 working-tree baseline(로컬 수정과 의도한 untracked 파일 포함)을 복사한다. 파일 mode, symlink, 중첩된 대상 위치, in-repository `.gitattributes`를 보존하고 원본 Git 메타데이터·설정·hook은 제외한다.[](source:f-genprivate) |
| 3 | 대상의 stage-zero blob으로 private index를 채운다. blob은 `workbench_source_scopes.offline_git_bytes`로 읽고 하나라도 로컬에 없으면 멈춘다.[](source:f-genprivate)[](source:py-off) |
| 4 | 의도한 기존 preimage가 모두 캡처되는지 실제 대상에서 확인한다. 필요한 preimage가 ignore되고 untracked면 멈춘다. 복사본에서 stage해 `git write-tree`를 `BASE`로 기록한다.[](source:f-genprivate) |
| 5 | 편집 뒤 의도한 경로만 `git add -A -- <paths>`로 stage하고 `git diff-index --cached --binary --relative --no-ext-diff --no-textconv --no-renames --submodule=short --no-color --unified=3 --src-prefix=a/ --dst-prefix=b/ BASE -- .`를 바이트로 캡처한다.[](source:f-genprivate) |
| 6 | 전체 diff를 의도한 소스 변경과 대조한다. 대상이 Git 밖이면 baseline을 `a`, `b`로 복사하고 `git diff --no-index`로 비교한다. 종료 코드 1이 "서로 다름"이다.[](source:f-genprivate) |
| 7 | patch는 정확한 unified diff를 `patch`에 보낸다. UTF-8 문자열이거나, 비UTF-8 바이트가 있으면 `{encoding: "base64", content}`다. 기존 scan-local patch는 `patchPath`와 `patchDigest`를 보내고 `patch`를 생략한다. workbench가 Git이 diff를 파싱하는지 확인한 뒤 저장해 경로와 digest를 돌려준다.[](source:f-patchsend) |

Apply의 원문 예시는 `components/api` 하위 디렉터리의 `handler.py` 한 파일을 고치는 patch다. `git_worktree_context(target)`에서 root와 prefix를 얻고 `git apply --no-index --check --directory=<prefix>`가 성공하면 같은 digest 검증 바이트로 `--check`를 빼고 다시 적용한다. 디렉터리 안에서 실행하면 성공 종료 코드로 변경을 건너뛸 수 있다고 경고한다. 이 예시는 원문이 조건을 붙여 든 예이고 모든 patch의 절차가 아니다.[](source:f-apply)[](source:py-ctx)

@facts
| patch digest 형식 | `sha256:<64 hex>`. 기존 patch를 등록할 때 `patchPath`와 함께 보낸다[](source:sv-schema) |
| `summary` 상한 | 2400자. 실패한 step과 오류를 적는다[](source:sv-schema) |
| `verificationSummary` 상한 | 2400자. 실행한 명령과 근거를 적는다[](source:sv-schema) |
| 캡처 diff 문맥 | `--unified=3`(원문이 명령에 고정한 값)[](source:f-genprivate) |
| 상태 값 | `generated`, `applied`, `verifying`, `verified`, `failed` 5개[](source:sv-schema) |

단계를 부모 thread가 위임하면 worker가 마지막 workbench 상태 갱신까지 그 단계를 소유한다. 부모는 orchestrator로 남아 worker의 편집을 되풀이하거나 채팅 응답을 완료로 취급하지 않는다.[](source:f-failed)

## 다른 스킬과 어디에서 이어지나? {#position}

`fix-finding`은 `remediate-finding` 묶음의 수정 단계다. 앞에서 `triage-finding`과 `resolve-dependency-alert`가 사용자 요청이 있을 때만 이 스킬로 넘기고, 뒤의 `assess-patch-risk`와 `verify-fix`는 필수 순서가 아닌 읽기 전용 점검이다.[](source:tri-hand)[](source:rda-fix)

@workflow id=fix-position title="fix-finding 앞뒤 스킬"
| tri | triage-finding | backend | source:tri-hand |
| dep | resolve-dependency-alert | backend | source:rda-fix |
| pub | publish-findings | backend | source:pf-cont |
| current | fix-finding | backend | source:f-front |
| apr | assess-patch-risk | backend | source:apr-desc |
| vf | verify-fix | backend | source:vf-when |
| tri > current | R27 사용자가 고치자고 할 때 | emphasis |
| dep > current | R28 사용자가 변경 요청 시 | emphasis |
| pub > current | R37 Continuum patch | dashed |
| current > apr | R29 patch 호환 | dashed |
| current > vf | R30 같은 계열 | dashed |

@steps id=fix-position-steps
| highlight | fix-finding | 이 페이지의 스킬이다. 앞의 두 실선은 사용자 요청이 조건인 넘김이고 점선은 호환이나 계열 관계로 필수 순서가 아니다. | fix-position | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R27 · 넘김, 명시-이름 | `triage-finding`이 `confirmed` finding마다 handoff를 결과에 넣고, 호출은 사용자가 고치자고 할 때만 한다.[](source:tri-hand) `fix_finding_handoff`는 `confirmed`일 때만 값이 있다.[](source:tri-null) |
| R28 · 넘김, 명시-이름 | `resolve-dependency-alert`는 사용자가 업그레이드를 요청할 때만 근거와 변경안을 선택된 verification mode로 이 스킬에 넘기고 전후 해석 결과를 비교한다.[](source:rda-fix) 이 스킬은 선택된 모드를 위임한 모든 agent에 넘긴다.[](source:f-mode) |
| R29 · 산출물 호환, 명시-역할 | Generate가 만든 patch의 경로와 digest를 기록한다.[](source:f-gen)[](source:sv-schema) `assess-patch-risk`는 변하지 않는 patch 파일, 최종 PR diff, commit range만 받고 patch를 만들거나 적용하지 않는다.[](source:apr-desc)[](source:apr-bind) 필수 순서는 아니다. |
| R30 · 같은 계열, 추론 | `verify-fix`도 `standard`와 `static`을 같은 뜻으로 쓰고 static 서술이 거의 같다.[](source:f-mode)[](source:vf-static) `verify-fix`는 fix 구현이나 테스트 실행만으로는 켜지지 않는다.[](source:vf-when) 이 스킬의 Verify 단계와 겹치는 방식은 원문에 명시 없음. |
| R37 · 산출물 호환, 명시-역할 | `publish-findings`가 Continuum finding을 `--source-root`로 수집하면 patch가 따라온다.[](source:pf-cont) 이 스킬은 그 patch를 시작 후보로 쓰고 현재 checkout의 hunk와 비교해 유지하거나 고친다.[](source:f-wf3) |
| R34 · 참고, 추론 | `propose-security-hardening`은 독립 finding은 국소 수정이 맞을 수 있고 어떤 tactical fix가 아직 필요한지 적는다고 한다. 이 스킬 이름은 적지 않는다.[](source:psh-local)[](source:psh-tactical) |

판정 · 벤더 안내문은 이 스킬을 "patches a vulnerability and checks that the fix stops the attack and preserves normal use"로 소개한다. 호출이나 순서를 강제하는 관계는 R27, R28 두 개이고 둘 다 사용자 요청이 조건이다.[](source:readme)[](source:tri-hand)[](source:rda-fix)

전체 흐름은 색인 기준 `codex-security/_group-remediate-finding`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 폴더 | `SKILL.md`(18,461B)와 `agents/openai.yaml`(225B)을 끝까지 읽었다.[](source:f-full)[](source:f-yaml) |
| 플러그인 공용 참조 | `references/artifact-storage.md`(7,947B)와 `references/scan-artifacts.md`(11,701B)를 끝까지 읽었다.[](source:as-full)[](source:sa-full) |
| 도구 계약 | `mcp-app/server.ts`(84,254B)는 remediation schema(418~446), scan context 도구(1348~1376), App 전용 요청 도구(1675~1716), `set_codex_security_finding_remediation`(1775~1796)만 읽었다.[](source:sv-schema)[](source:sv-ctx)[](source:sv-app)[](source:sv-set) `scripts/workbench_remediation.py`(35,923B)는 705~765줄만 읽었다.[](source:py-trans) |
| 구조·표본만 확인(전부 읽지 않음) | `server.ts`와 `workbench_remediation.py`의 나머지, 그리고 SKILL이 적은 helper 함수 5개는 정의 줄만 확인하고 본문은 읽지 않았다. `trusted_git_executable`(`workbench_target.py` 249), `git_command`(387), `git_worktree_context`(1046), `offline_git_bytes`(`workbench_source_scopes.py` 80), `open_scan_local_file`(`workbench_db.py` 2584)다. 이 helper들이 SKILL 설명대로 동작하는지는 확인하지 못했다.[](source:py-git)[](source:py-cmd)[](source:py-ctx)[](source:py-off)[](source:py-open) |
| 관계 대조 | 원장 R27, R28, R29, R30, R34, R37과 R60, R83, R85를 원문과 맞췄다. 상대 스킬은 줄 단위로만 읽었다(`triage-finding` 82와 계약 79~80, 114, `resolve-dependency-alert` 14, `assess-patch-risk` 3과 22, `verify-fix` 10과 20, `propose-security-hardening` 22와 30, `publish-findings` 28).[](source:tri-hand)[](source:tri-con)[](source:rda-fix)[](source:apr-desc)[](source:vf-when)[](source:psh-local)[](source:pf-cont) |
| 공통 확인 | `skills/README.md` 32줄, `.mcp.json`(2,078B), `.codex-plugin/plugin.json`(1,682B)을 읽었다. 이 스킬의 지시는 이 둘에 의존하지 않는다.[](source:readme)[](source:mcp-json)[](source:plugin-json) |
| 수치 | 원문이 정한 숫자는 `@facts`와 `--unified=3`뿐이다. 상한 2400자는 도구 입력 schema의 값이고 SKILL 본문에는 없다.[](source:sv-schema) |
| 제외 | 번역본은 없다. 바이너리는 없다. 읽은 텍스트 파일은 스킬 폴더 2개, 공용 참조 2개, 도구 계약용 2개, 선언 3개, 관계 대조용 7개다. |

@callout level=open-question title="확인하지 못한 부분"
| 봉인된 scan 폴더에 `fix_report.md`를 쓰는 경우를 어떻게 처리하는지는 원문에 없다. 위 열린 질문을 참고한다.
| workbench Verify 단계와 `verify-fix`가 어떻게 겹치는지는 원문에 없다(R30).
| `workbench_target.py`, `workbench_source_scopes.py`, `workbench_db.py`의 helper 함수는 본문을 읽지 않았고 실행하지 않았다. 실제 동작은 확인하지 못했다.
| 실행 번들 `mcp/server.mjs`는 커밋돼 있지 않아 읽은 `server.ts` 소스와 같다는 것은 확인하지 못했다.
| 호스트가 description의 호출 제한을 지키는지, 위임 reviewer가 실제로 띄워지는지는 실행하지 않아 확인하지 못했다.

분석 중 원본은 수정하지 않았다. 원문의 어떤 지시도 실행하지 않았다.
