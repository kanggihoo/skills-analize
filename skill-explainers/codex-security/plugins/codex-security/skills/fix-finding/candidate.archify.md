# fix-finding — 보안 취약점을 가장 작은 변경으로 고치고 검증한다 {#overview}

fix-finding은 사용자가 요청한 보안 finding 하나를 가장 작은 코드 변경으로 막고, 막혔다는 것을 검증해 보고하게 하는 스킬이다. 이미 안전하면 안전하다는 증명과 함께 변경 없음으로 끝낸다.[](source:obj)

- 사용자가 취약점을 고치고 검증해 달라고 명시적으로 요청할 때만 켜진다. 일반 버그 수정, 설계 리뷰 지적, 일반 검증, 전체 scan에는 쓰지 않는다. 검증은 기본 `standard`이고 호출자가 `static`을 고르면 실행 없이 소스만 본다.[](source:fm)[](source:mode)
- 결과는 `fixed`, `no_change`, `blocked` 셋 중 하나와 보고다. 보고에는 취약 경로, 바뀐 파일, 추가한 테스트, 실행한 명령, 닫혔다는 근거가 든다. 기존 scan 폴더가 있으면 `fix_report.md`도 남긴다.[](source:out)[](source:fixrep)
- 관계: triage-finding과 resolve-dependency-alert가 이 스킬을 안내하고(다음 안내), 이 스킬의 patch는 assess-patch-risk의 입력이 될 수 있다(결과 전달). verify-fix와는 대안이다.
- 하지 않는 것: 관련 없는 정리, 같은 계열의 다른 finding, 구조 재설계로 patch를 넓히지 않는다. 인증·권한·격리·입력 검증·sandbox·로깅을 약하게 해 테스트를 통과시키지도 않는다.[](source:hard)

@answer scope="codex-security/plugins/codex-security/skills/fix-finding · 원본 파일 5개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: name과 description" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=1:4
@source store title="저장 정책을 먼저 읽는다" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=8:8
@source obj title="목표" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=10:14
@source mode title="검증 모드 standard와 static" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=16:20
@source pc title="patch contract: 고치기 전에 세우는 경계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=22:31
@source s1 title="1단계: 경로 추적과 no_change" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=35:35
@source s2 title="2단계: 재현과 정상 입력 대조" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=36:36
@source s3 title="3단계: 공유 경계에 최소 수정" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=37:38
@source s4 title="4단계: 패치를 반박해 본다" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=39:39
@source s5 title="5단계: 모드별 검증" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=40:47
@source rv title="수정 리뷰" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=49:53
@source wb title="workbench 단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=55:57
@source wbtool title="신뢰 도구와 Git filter" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=59:63
@source gen title="Generate 단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=65:72
@source app title="Apply 단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=73:75
@source ver title="Verify 단계" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=76:76
@source fail title="단계 실패와 위임" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=78:80
@source out title="결과 상태와 출력 계약" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=82:96
@source hard title="Hard Rules" path=codex-security/plugins/codex-security/skills/fix-finding/SKILL.md lines=98:105
@source yaml title="openai.yaml" path=codex-security/plugins/codex-security/skills/fix-finding/agents/openai.yaml lines=1:4
@source fixrep title="fix report 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=114:121
@source astore title="저장 정책 본문" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=7:13
@source asealed title="봉인된 scan 파일과 Generate patch 저장" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=56:56
@source tool title="set_codex_security_finding_remediation 입력 schema" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=418:443
@source tri title="triage-finding의 handoff" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=82:82
@source dep title="resolve-dependency-alert의 위임" path=codex-security/plugins/codex-security/skills/resolve-dependency-alert/SKILL.md lines=14:14
@source apr title="assess-patch-risk의 입력" path=codex-security/plugins/codex-security/skills/assess-patch-risk/SKILL.md lines=3:3
@source vfmode title="verify-fix의 모드와 호출 제한" path=codex-security/plugins/codex-security/skills/verify-fix/SKILL.md lines=10:20

## 어떻게 동작하나 {#flow span=12}

절차형이다. 그림은 일반 흐름이다. workbench 요청이 오면 Generate, Apply, Verify 중 요청된 단계만 하고, 각 단계에서 patch를 쓰거나 적용하거나 검증한다.[](source:wb) `standard`에서만 하는 단계(재현과 실행 검증)는 steps 설명에 적었다.

@workflow id=flow-diagram title="fix-finding 흐름"
| lane prep | 고치기 전 |
| lane fix | 수정 |
| lane check | 검증·리뷰 |
| lane out | 보고 |
| contract | patch contract 세우기 | backend | prep | source:pc |
| safe | 이미 안전한가? | backend | prep | source:s1 |
| repro | 재현과 정상 입력 대조 | backend | fix | source:s2 |
| patch | 공유 경계에 최소 수정 | backend | fix | source:s3 |
| challenge | 패치 반박 | backend | fix | source:s4 |
| gates | 모드별 검증 | backend | check | source:s5 |
| review | 독립 리뷰 | backend | check | source:rv |
| report | 결과 보고 | backend | out | source:out |
| contract > safe | |
| safe > report | 예: no_change |
| safe > repro | 아니오 |
| repro > patch | |
| patch > challenge | |
| challenge > gates | |
| gates > review | |
| review > patch | 확인된 문제 | dashed |
| review > report | 문제 없음 | emphasis |
| gates > report | 필수 확인 불가: blocked | dashed |

@steps id=flow-steps
| s-contract | patch contract 세우기 | **입력** 취약점 finding · **참조** `../../references/artifact-storage.md` · **출력** 공격자 입력·source-sink 경로·보안 invariant·유지할 동작·선례 목록. **처리** 에이전트가 구현, 직접 호출자, 근처 helper, 기존 테스트를 읽고 가장 좁은 공유 경계를 정한다. 입력 예시만이 아니라 인코딩, 별칭, 복사본까지 우회로로 본다.[](source:pc)[](source:store) | flow-diagram | contract |
| s-safe | 이미 안전한가? | **입력** 보고된 경로 · **출력** 판단 하나(안전 또는 아직 취약). **처리** 경로를 추적해 이미 안전하다고 저장소 근거로 보이면 `no_change`로 끝낸다. 추측성 변경은 하지 않는다.[](source:s1) | flow-diagram | safe |
| s-repro | 재현과 정상 입력 대조 | **입력** 보고된 경로 · **실행** 같은 경계를 지나는 가장 작은 재현 하나와 정상 입력 하나(`standard`, 가능할 때만) · **출력** 고치기 전 결과. **처리** 에이전트가 고치기 전 동작을 관찰해 둔다.[](source:s2) **다음** `static`에서는 이 단계를 하지 않는다. 설치·빌드·테스트·재현·앱 실행이 모두 금지다.[](source:mode) | flow-diagram | repro |
| s-patch | 공유 경계에 최소 수정 | **입력** patch contract · **출력** 수정된 소스. **처리** 가까운 helper와 기존 API로 공유 경계를 고친다. finding에 제안 patch가 있으면 출발점으로 쓰고, hunk마다 우회가 남거나 정상 동작이 깨지면 고치거나 바꾼다.[](source:s3) **다음** 필수 증거·도구·접근·제품 결정이 없어 끝낼 수 없으면 `blocked`다.[](source:s5) | flow-diagram | patch |
| s-challenge | 패치 반박 | **입력** 수정된 소스 · **출력** 우회·회귀 점검 결과. **처리** 바뀐 helper의 모든 직접 호출자와 바뀐 조건의 양쪽 결과를 보고, 취약 sink에 닿는 다른 경로 하나와 새로 막힌 평범한 입력 하나를 찾는다. 있으면 구현을 고친다.[](source:s4) | flow-diagram | challenge |
| s-gates | 모드별 검증 | **입력** 최종 diff · **실행** `standard`는 가장 좁은 syntax·import·build·type 검사, 보안 trigger 재실행, 다른 악성 입력 한 종류, 정상 대조, 가까운 테스트, 소유 package의 필수 검사 · **출력** 통과·실패·알 수 없음 표. **처리** `static`이면 같은 통과 조건을 소스 추적으로 하고 근거마다 출처와 확정하지 못한 부분을 적는다.[](source:s5) **다음** 필수 검사를 못 돌리면 `blocked`로 보고한다.[](source:hard) | flow-diagram | gates |
| s-review | 독립 리뷰 | **입력** finding·저장소 root·허용 범위·정책·검증 모드·후보 diff · **출력** 확인된 우려 목록. **처리** 복잡도나 영향이 크면 새 read-only 리뷰어가 작성자 설명 없이 소스로 검토한다. 위임이 안 되면 별도 pass로 직접 한다. 확인된 문제만 고치고 영향받은 통과 조건을 다시 돌린다.[](source:rv) **다음** 임시·무관한 변경이 남지 않았는지 확인한다.[](source:rv) | flow-diagram | review |
| s-report | 결과 보고 | **입력** 앞 단계의 결과 · **참조** `../../references/scan-artifacts.md` · **출력** outcome(`fixed`·`no_change`·`blocked`)과 보고, 기존 scan 폴더가 있으면 `<artifacts_dir>/fix_report.md`. **처리** 호출자의 출력 schema가 있으면 그것을 따르고, 없으면 취약 경로·patch 전략·변경 파일·명령 결과·소스 평가와 관찰한 실행의 구분·남은 불확실성을 적는다.[](source:out)[](source:fixrep) **다음** scan 폴더가 없으면 채팅 요약으로 충분하다. 사용자가 파일을 원하면 만든다.[](source:out) | flow-diagram | report |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자의 명시적 fix and verify 요청(모델 판단, description). `agents/openai.yaml`의 `default_prompt`가 `$fix-finding` 호출 예를 보여 준다. 호출 제한 필드는 frontmatter에 없다.[](source:fm)[](source:yaml) |
| 성격 | 취약점 하나를 고치고 스스로 검증해 `fixed`·`no_change`·`blocked`로 보고한다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| triage-finding {#rel-r27} | **이 스킬** | 다음 안내 | confirmed finding마다 handoff를 결과에 넣는다. 실제 호출은 사용자가 고치자고 할 때만이다.[](source:tri) |
| resolve-dependency-alert {#rel-r28} | **이 스킬** | 다음 안내 | 사용자가 업그레이드를 요청할 때만 근거와 변경안을 선택된 verification mode로 넘긴다. 그 전에는 읽기 전용이다.[](source:dep) |
| **이 스킬** {#rel-r29} | assess-patch-risk | 결과 전달 | Generate 단계가 만든 patch를 호스트가 파일과 digest로 저장한다. assess-patch-risk는 변하지 않는 patch를 입력으로 받는다. 필수 순서는 아니다.[](source:gen)[](source:apr) |
| **이 스킬** {#rel-r30} | verify-fix | 대안 | 둘 다 같은 verification mode를 쓴다. 판정: 두 스킬의 문장에서 추론했다. verify-fix는 fix 작업 중 자동으로 켜지지 않는다.[](source:mode)[](source:vfmode) |
| **이 스킬** {#rel-r83} | Codex Security MCP의 remediation 도구 | 참고 | workbench 요청이 오면 `get_codex_security_scan_context`로 배정된 finding을 읽고, 단계마다 `set_codex_security_finding_remediation`으로 `generated`·`applied`·`verified`·`failed` 같은 상태를 기록한다.[](source:wb)[](source:tool) |

@architecture id=relation-map title="fix-finding과 이어지는 스킬"
| tri | triage-finding | backend |
| dep | resolve-dependency-alert | backend |
| self | fix-finding(이 스킬) | backend |
| apr | assess-patch-risk | backend |
| vf | verify-fix | backend |
| mcp | Codex Security MCP remediation 도구 | external |
| tri > self | 다음 안내 |
| dep > self | 다음 안내 |
| self > apr | 결과 전달 |
| self > vf | 대안 |
| self > mcp | 참고 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 목표, 두 검증 모드, patch contract, 작업 순서, workbench 단계, 출력 계약, 금지 규칙을 담은 본문 | 스킬이 켜지면 읽는다 | patch contract 세우기, 이미 안전한가?, 재현과 정상 입력 대조, 공유 경계에 최소 수정, 패치 반박, 모드별 검증, 독립 리뷰, 결과 보고 |
| `agents/openai.yaml` | 표시 이름, 짧은 설명, 호출 예시 prompt | 호스트가 스킬 목록을 보여 줄 때 쓴다. 지시상 읽는 조건은 원문에 명시 없음 | 해당 없음 |
| `../../references/artifact-storage.md` | 파일을 만들거나 저장하기 전에 따르는 저장 정책(MCP 도구로만 보조 파일 저장, 봉인된 scan 파일 수정 금지) | 경로를 고르거나 보존 출력을 저장하기 전에 읽는다 | patch contract 세우기 |
| `../../references/scan-artifacts.md` | scan 폴더 규약과 `fix_report.md` 위치 | 기존 scan 폴더가 있을 때 읽는다 | 결과 보고 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 일반 버그 수정, 정확성·설계 리뷰 지적, 일반 검증, 전체 PR·commit·branch·repo scan | 이 스킬을 쓰지 않는다 | [](source:fm) |
| 호출자가 `verificationMode: static`을 고르지 않음 | `standard`로 검증한다. 선택한 모드는 위임한 모든 agent와 workbench 단계에 넘긴다 | [](source:mode) |
| `static` 모드 | 의존성 설치, build, 테스트, 재현, 앱 실행을 하지 않는다. 검증 지침이 요구해도 같다. 런타임 검사를 하지 않았다고 밝힌다. 런타임 도구가 없는 것만으로는 막히지 않지만 소스 근거에 큰 틈이 있으면 `blocked`다 | [](source:mode) |
| 보고된 경로가 이미 안전함 | `no_change`로 끝내고 추측성 변경을 하지 않는다 | [](source:s1) |
| 필수 증거·도구·접근·제품 또는 호환성 결정이 없음 | `blocked`. 안전하게 고치거나 검증을 끝낼 수 없다는 뜻이다 | [](source:s5) |
| 모드의 검증 통과 조건을 모두 통과하지 못함 | `fixed`로 보고하지 않는다. 필수 검사를 못 돌리면 `blocked`로 보고한다. 저장소 근거로 무관하다고 보이는 검사만 뺄 수 있다 | [](source:hard) |
| `standard`에서 집중 테스트나 재현이 가능함 | 코드 읽기만으로 끝내지 않는다 | [](source:hard) |
| patch가 정리·다른 finding·재설계로 번질 것 같음 | 완전한 닫힘에 더 넓은 변경이 필요하다는 근거가 있을 때만 넓힌다 | [](source:hard) |
| 사용자 변경이나 무관한 로컬 수정이 있음 | 지우지 않는다 | [](source:hard) |
| 테스트를 통과시키려 보안 통제를 약하게 하고 싶음 | 인증·권한·tenant 격리·입력 검증·sandbox·로깅을 약하게 하지 않는다 | [](source:hard) |
| 환경이 검증을 막음 | 실패한 명령과 설정, 비어 있는 근거를 정확히 적는다. 증명 간극을 숨기지 않는다 | [](source:hard) |
| workbench 요청에 scan ID·occurrence ID·remediation request ID·action token·expected version이 있음 | 요청된 단계만 한다. 단계 경계는 쓰기 가능 시점만 바꾸고 검증 요구는 그대로다 | [](source:wb) |
| Python이나 Git 실행 파일이 신뢰할 수 있는지 확인하지 못함 | 중단한다 | [](source:wbtool) |
| Generate에서 쓰기를 격리 worktree나 임시 공간에 가두지 못함 | 편집이나 저장소 명령 전에 `failed`를 기록한다 | [](source:gen) |
| Verify 단계 | 소스를 고치지 않는다. 원래 경로가 닫히고 정상 동작이 유지되고 필수 검사가 통과한다는 근거가 있을 때만 `verified`를 기록한다. 아니면 `failed`와 실패한 통과 조건를 적고 finding을 닫지 않는다 | [](source:ver) |
| Apply 단계 | 기록된 base revision과 patch digest를 확인하고 그 patch만 적용한다. 이 단계에서 검증하거나 finding을 닫지 않는다 | [](source:app) |
| 단계가 실패함 | `failed`와 실패한 단계, 오류를 `summary`에 적는다. 위임받은 worker가 그 단계를 끝까지 맡고, 부모는 중복 편집이나 채팅 응답으로 완료를 대신하지 않는다 | [](source:fail) |
| 필수 MCP가 없거나 baseline이 지원되지 않음(저장 정책) | blocker를 보고한다. shell로 만든 canonical 파일로 대신하지 않는다 | [](source:astore) |
| 완료·봉인된 scan 파일 | 보조 파일 저장 도구로 고치지 않는다. Generate patch는 `set_codex_security_finding_remediation`으로 저장한다 | [](source:asealed) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- Generate 단계의 격리와 Git 설정 — 어떻게 동작하나의 patch 쓰기 · private repository를 만드는 환경 변수, index seed, filter 끄기, 비Git 대상의 `a`·`b` 비교, `patch`와 `patchPath` 전달
- Apply 단계 예시 — 어떻게 동작하나의 workbench 단계 · `--directory` prefix로 적용하는 절차와 하위 디렉터리에서 실행하면 건너뛸 수 있다는 경고
- remediation 상태 전이 — 관계 표의 MCP 도구 행 · 허용 전이 표와 action 요청이 App 전용 도구인 이유(원장 R83에서 가져온다)
- patch contract와 반박 점검의 세부 — patch contract 세우기, 패치 반박 · 인코딩·별칭·복사본 같은 우회 유형과 호출자 점검 방법
- 출력 계약 항목별 해설 — 결과 보고 · 호출자 schema가 없을 때의 보고 9개 항목

@callout level=open-question title="확인하지 못한 것"
| 기존 scan 폴더의 `fix_report.md`에 쓰라는 문장(`SKILL.md:96`, `scan-artifacts.md:116`)과, 봉인된 scan 파일은 저장 도구로 고칠 수 없다는 문장(`artifact-storage.md:56`)을 조정하는 규칙은 원문에 명시 없다.[](source:out)[](source:fixrep)[](source:asealed) |
| workbench Verify 단계와 verify-fix가 어떻게 겹치는지는 원문에 명시 없다.[](source:ver)[](source:vfmode) |
| `set_codex_security_finding_remediation`의 내부 상태 전이 구현과 `scripts/`의 helper는 입력 schema만 확인했다. 어떤 코드도 실행하지 않았다.[](source:tool) |

읽은 원본: 텍스트 파일 5개(`SKILL.md`, `agents/openai.yaml`, `artifact-storage.md`, `scan-artifacts.md`, `server.ts`의 schema 부분). 제외: 없음.
