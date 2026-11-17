# 사냥 — hunter에게 unit을 나눠 주고 coverage critic이 빈틈을 닫을 때까지 돈다 {#hunt-detail}

이 페이지는 개요의 `사냥`과 `범위 점검?` 노드, 곧 Phase 2를 맡는다. 시작 입력은 `planned` 상태의 ledger unit과 `architecture.md`다. 끝 출력은 갱신된 ledger와 fingerprint가 붙은 후보다. critic이 수락할 작업이 없고 `planned` unit도 없으면 개요의 `후보 검증`으로 이어진다. quick 프로필은 정해진 한도에서, 예산이 모자라면 `deferred`로 일을 미루고 끝난다.[](source:hun-critic)

@answer scope="cloudflare/security-audit · HUNTING.md 전체 · 지시상 동작"
@meta locale=ko
@source hun-assign title="hunter 배정" path=cloudflare/security-audit/HUNTING.md lines=3:9
@source hun-prompt title="hunter 지시문 아홉 부분" path=cloudflare/security-audit/HUNTING.md lines=11:25
@source hun-m-read title="사냥 방법: 깊이 읽기와 invariant" path=cloudflare/security-audit/HUNTING.md lines=37:56
@source hun-m-test title="사냥 방법: sad path와 variant" path=cloudflare/security-audit/HUNTING.md lines=58:69
@source hun-m-local title="사냥 방법: 최소 local check" path=cloudflare/security-audit/HUNTING.md lines=71:97
@source hun-gate title="후보 통과 조건" path=cloudflare/security-audit/HUNTING.md lines=138:157
@source hun-local title="로컬 검증 경계" path=cloudflare/security-audit/HUNTING.md lines=159:166
@source hun-result title="hunter 결과 형식" path=cloudflare/security-audit/HUNTING.md lines=168:213
@source hun-consol title="ledger 갱신과 후보 통합" path=cloudflare/security-audit/HUNTING.md lines=215:219
@source hun-critic title="coverage critic wave" path=cloudflare/security-audit/HUNTING.md lines=221:247
@source hun-quick title="quick 프로필의 한도" path=cloudflare/security-audit/HUNTING.md lines=249:249
@source hun-budget title="budget의 한도" path=cloudflare/security-audit/HUNTING.md lines=251:251

## 한 wave는 어떤 순서로 돌고, 언제 끝나나 {#flow span=12}

그림은 standard와 deep의 wave 한 번을 그렸다. 그림에서 생략한 것이 둘 있다.

- quick은 hunter wave 한 번과 critic 한 번으로 끝난다. 수락된 `missing_unit`은 `deferred`(이유 `quick_profile_final_critic`)로 기록하고, 증거 있는 `reassign_id`는 `attempts`에 보관한 뒤 `wave`를 올리고 live 상태를 증거 없는 `deferred`로 둔다.[](source:hun-quick)
- 예산이 hunter 수와 필수 critic 예약을 함께 못 덮으면 그 wave의 hunter를 띄우지 않고 `planned` unit을 `deferred`(이유 `budget_cannot_reserve_critics_and_validation`)로 둔다.[](source:hun-budget)

@workflow id=hunt-flow title="Phase 2 사냥 wave"
| assign | unit 배정 | backend | source:hun-assign |
| prompt | 지시문 조립 | backend | source:hun-prompt |
| hunter | hunter 조사 | backend | source:hun-m-read |
| merge | 결과 통합 | database | source:hun-consol |
| critic | post-wave critic? | security | source:hun-critic |
| clean | final-clean critic? | security | source:hun-critic |
| assign > prompt | |
| prompt > hunter | |
| hunter > merge | |
| merge > critic | |
| critic > assign | 새 작업 |
| critic > clean | 없음 | emphasis |
| clean > assign | 새 작업 |

@steps id=hunt-steps
| h-assign | unit 배정 | **입력** `planned` unit·profile·budget · **참조** `HUNTING.md` · **출력** `in_progress` unit, canonical agent ID, agent별 `scratch/`와 parent 소유 `artifacts/`. **처리** parent가 우선순위 순서로 unit을 hunter에게 배정한다. 같은 subsystem의 가까운 unit은 한 hunter가 맡을 수 있지만 관계없는 boundary를 묶지 않는다. agent 수 한도 때문에 unit을 조용히 빼지 않는다.[](source:hun-assign) | hunt-flow | assign |
| h-prompt | 지시문 조립 | **입력** 배정한 unit·`architecture.md`·선택 block · **참조** `ATTACK-CLASSES.md`, 고른 도메인 지침, `report-schema.json` · **출력** hunter별 지시문 하나. **처리** parent가 정해진 아홉 부분을 정해진 순서로 이어 붙인다. block은 이름이 아니라 원문을 복사한다.[](source:hun-prompt) | hunt-flow | prompt |
| h-hunter | hunter 조사 | **입력** 지시문 · **참조** target 소스 · **실행** 샌드박스 안의 local check(필요할 때만) · **출력** JSON 객체 하나(`units`, `candidates`, `hardening`, `uncovered`). **처리** `general` hunter가 소스를 깊이 읽고, invariant가 어느 쪽이든 정해질 때까지 따라간다. `scratch/`에만 쓰고 보관 artifact, target 소스, 공유 파일은 쓰지 않는다.[](source:hun-assign)[](source:hun-m-read) | hunt-flow | hunter |
| h-merge | 결과 통합 | **입력** hunter의 JSON·승격된 artifact · **실행** `node <skill-dir>/validate-coverage-ledger.cjs <output-dir>/coverage-ledger.json` · **출력** 갱신된 ledger, fingerprint로 통합한 후보. **처리** parent가 unit 결과를 assigned `coverage_id` 하나에 대응시켜 그 unit만 갱신한다. 형식이 틀린 결과는 unit을 `planned`로 남겨 재배정한다. 갱신 뒤 검증기를 돌리고, 유효하지 않은 ledger로는 다음 배정을 하지 않는다.[](source:hun-consol) | hunt-flow | merge |
| h-critic | post-wave critic? | **입력** `architecture.md`·전체 ledger·후보 상태·이전 ledger 빈틈 요약 · **출력** critic JSON(`missing_units`, `reassign_ids`, `resolved_prior_leads`, `stop`). **처리** wave 직후 예약해 둔 호출로 새 `research` critic이 빈 coverage를 제안한다. 소스는 읽지만 쓰거나 target을 실행하지 않는다.[](source:hun-critic) **다음** 수락한 일이 있거나 `planned` unit이 남으면 새 wave로 돌아간다. | hunt-flow | critic |
| h-clean | final-clean critic? | **입력** 같은 입력 · **출력** 같은 JSON. **처리** standard와 deep에서 post-wave critic이 수락할 일이 없고 `planned`도 없을 때, 따로 예약한 호출로 다른 critic을 한 번 더 쓴다. 이 critic도 수락할 일이 없을 때만 coverage를 완료로 본다.[](source:hun-critic) **다음** 일을 찾으면 큐에 넣고 wave, post-wave critic, final-clean 과정을 반복한다. 없으면 개요의 후보 검증으로 간다. | hunt-flow | clean |

## hunter 지시문에는 무엇이 어떤 순서로 들어가나 {#prompt span=12}

모든 hunter 지시문은 아래 아홉 부분을 이 순서로 담는다.[](source:hun-prompt)

| 순서 | 내용 |
| --- | --- |
| 1 | 두 문장짜리 역할 서문. 목표는 배정된 unit에서 소스 근거가 있는 보안 invariant 실패를 찾는 것이고, 지시문 끝의 구조화 결과 계약에 맞는 JSON 객체 하나만 돌려줘야 한다 |
| 2 | `architecture.md` 전문 |
| 3 | 배정된 coverage ID, subsystem, boundary, 저장소 상대 시작 경로, ledger의 unit별 assignment block 지도 |
| 4 | 선택된 block의 원문. 선택한 일반 attack class block마다, companion마다 `Core discipline`, 고른 attack class 하위 절, `Universal moves`, `Validation rules` |
| 5 | 제외한 일반·companion block과 각각의 이유 |
| 6 | 핵심 사냥 방법과 승격 절차 block |
| 7 | 핵심 검증 규칙 |
| 8 | 같은 소스의 이전 `confirmed` 제외 목록(fingerprint, title, root cause만)과, 중복하면 안 되는 다른 hunter 소유 coverage ID |
| 9 | 고유 scratch·artifact 경로, 안전한 agent ID, 미리 선언한 승격 허용 목록과 byte 상한, 구조화 결과 계약(hunter 결과 block과 `report-schema.json`의 `confirmed`·`needs_validation` branch 원문) |

같은 경로가 여러 영역을 가로지르면 companion block을 여러 개 고를 수 있고, 제약은 함께 둔다. unit 범위는 hunter의 coverage 의무일 뿐 제외된 작업을 중복해도 된다는 허락이 아니다. 예상하지 못한 다른 boundary가 나오면 `uncovered`로 돌려 보내 parent가 다음 wave에 안정적인 ledger unit을 만들어 배정하게 한다.[](source:hun-prompt)

배정 순서는 예산이나 profile이 hunter 수를 제한할 때 우선순위로 정하고 근거를 ledger에 기록한다. 순위는 (1) 인증 없는 진입면과 가장 낮은 신뢰 진입면을 인증된 것보다 먼저, (2) 가장 값진 자원(credential, tenant 간 데이터, code execution, release 권한)을 지키는 boundary, (3) 이전 실행의 빈틈·재검증 대상·소스가 바뀐 unit을 같은 소스 재점검보다 먼저, (4) 이 target 유형에서 역사적으로 `confirmed`가 잘 나온 class를 추측성 unit보다 먼저다. 동점은 `coverage_id` 사전순으로 깨서 실행이 결정적이게 한다.[](source:hun-assign)

핵심 사냥 방법은 여섯 가지 습관이다. 지시문 6번 부분이 그대로 담는다.[](source:hun-m-read)

- 입력을 parsing, identity, authorization, normalization, state, 파생 복사본, 최종 sink까지 깊이 따라가고, sibling·legacy·batch·retry·cancel·migration·error 경로도 읽는다. 통제는 있는지뿐 아니라 동등한지를 비교한다.[](source:hun-m-read)
- 구체적 invariant에서 출발한다. 낮은 신뢰 주체와 시작 능력, 받아들인 값·행동, 이를 막아야 할 통제, 그 뒤의 정확한 소스 경로를 적고, 가장 작은 더미 레코드나 틀린 반환값에서 멈추며, 소스 수준 변경과 regression case를 적는다.[](source:hun-m-read)
- 깊이는 배정된 boundary에 닿거나 boundary가 기대는 경로까지만 따른다. invariant가 어느 쪽이든 settled되면 멈추고 `covered`, `candidate`, `blocked`, `uncovered` 중 하나로 기록한다.[](source:hun-m-read)
- sad path와 불일치를 시험한다. 없음, 빈 값, 0, 음수, 최대, 한도 초과, 중복, 섞인 인코딩, stale, 폐기됨, 순서 뒤바뀜, 동시, 부분 마이그레이션, 의존성 실패, rollback을 인터페이스가 받아들이는 범위에서만 본다.[](source:hun-m-test)
- high나 critical 후보에서 재사용할 수 있는 root cause가 보이면, 배정된 coverage ID가 소유한 경로에서만 lexical·structural·logical variant를 찾는다. 다른 hunter의 unit은 조사하지 않고, 현재 unit이 없는 variant는 `uncovered`로 돌려 보낸다.[](source:hun-m-test)
- 주장을 가르는 가장 좁은 local check를 쓴다. 기존 unit test, 최소 함수 harness, 더미 tenant 서비스 호출, 작은 malformed fixture, 결정적 race 일정, 로컬로 렌더한 policy를 먼저 고른다. 샌드박스 통제가 하나라도 없으면 실행하지 않고 정확한 blocker와 함께 `needs_validation`을 돌려준다.[](source:hun-m-local)

## 후보가 되려면 무엇을 통과해야 하고 local 검증은 어디까지인가 {#gate span=12}

지시문 7번 부분의 후보 통과 조건은 일곱 가지다.[](source:hun-gate)

| 번호 | 조건 |
| --- | --- |
| 1 | 후보는 저장소 상대 소스 trace 전체와, 주장한 root cause에 대한 증거(소스에서 보이는 가장 강한 통제 포함)가 필요하다 |
| 2 | `confirmed` 제안은 제한된 local 관찰 결과, 명시한 경계를 넘는 의미 있는 영향, 완전한 조건, 보이는 방어 계층 없음이 필요하다 |
| 3 | crash를 code execution으로, 일반 작업을 공유 availability로, 같은 주체의 행동을 권한 상승으로 부풀리지 않는다 |
| 4 | 필요한 사실이 소스나 local에서 보이지 않으면 `needs_validation`을 쓴다. 정확한 blocker를 적고 severity나 추측성 결말을 붙이지 않는다 |
| 5 | 영향받는 주체나 자원이 없는 모범 사례 누락은 제외하거나 hardening이다. 소스가 반박한 후보는 `needs_validation`이 아니다 |
| 6 | 같은 근본 원인에는 모든 상태에서 같은 fingerprint를 쓴다. 패턴은 `^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$`이고 줄 번호, wave, agent, severity, verdict를 넣지 않는다 |
| 7 | 이 조건을 통과한 것이 없으면 빈 후보 배열을 돌려준다 |

local 실행은 확인용이고 영향을 키우는 용도가 아니다. 허용되는 것과 금지되는 것은 이렇다.[](source:hun-local)

| 구분 | 내용 |
| --- | --- |
| 필수 OS 샌드박스 안에서만 허용 | 의존성이 이미 있는 오프라인 build, 더미 상태의 격리 loopback process, unit·integration test, 작은 fixture 처리, sanitizer, 제한된 fuzz·regression test, 결정적 동시성 확인, 더미 계정 local browser·emulator test, 더미 identity로 렌더한 manifest·policy 평가, 모의 외부·유료 호출 |
| 금지 | live·배포 traffic, 이 격리 확인을 위해 띄우지 않은 서비스 요청, 네트워크로 의존성 설치, 실제 계정·credential, 운영 데이터, 공유 queue·cloud 자원·runner·registry·signing·release 서비스, publish, stress·포화·비용 발생, 최소 더미 데이터 경계 결과 이후의 작업 |

샌드박스는 빈 환경으로 시작하고 외부 네트워크와 host 쓰기 경로를 막으며, 비쌀 것 같은 check만이 아니라 모든 check에 낮은 자원·시간 상한을 건다. scratch 출력은 종료 뒤에도 target이 통제한 것으로 취급하고 `SKILL.md`의 no-follow·경로 제한·일반 파일·크기 제한 절차로만 승격한다. 샌드박스나 승격 기능이 빠졌다고 소스 근거가 있는 후보가 사라지지는 않는다. 정확한 blocker를 `needs_validation`에 적는다.[](source:hun-local)

## hunter는 어떤 JSON을 돌려주나 {#result span=12}

hunter는 앞뒤 설명 없이 JSON 객체 하나를 돌려준다. 최상위 키는 `units`, `candidates`, `hardening`, `uncovered`다.[](source:hun-result)

@facts id=result-fields
| `units[]` | `coverage_id`(배정된 ID 하나), `disposition`(`covered`, `candidate`, `blocked` 중 하나), `reviewed_paths`, `checks[]`, `candidate_fingerprints`, `unresolved` |
| `checks[]` | `agent_id`, `reviewed_paths`, `invariant`, `method`(`source` 또는 `local`), `result`, `artifact`(local이면 `agents/<agent-id>/artifacts/file`, source면 null) |
| `candidates[]` | schema 모양이되 `verdict` 대신 `proposed_verdict`를 쓴다. `confirmed` 제안은 `confirmed` branch의 필수 필드(`verdict` 제외)를, `needs_validation` 제안은 그 branch의 필수 필드(`verdict` 제외)를 모두 담는다 |
| `hardening` | finding이 아닌 구체적 메모 목록. parent가 ledger의 bookkeeping 필드에 보관해 Phase 6에서 보고한다 |
| `uncovered` | 새 ledger unit이 필요한 surface·boundary·subsystem·attack_class·시작 경로와 이유 |

배정된 coverage ID는 `units`에 정확히 한 번씩 나온다. `covered` unit은 owner, 비어 있지 않은 `reviewed_paths`와 `checks`, 미해결 사실 없음, 후보 없음이 필요하다. `candidate` unit은 같은 증거를 갖고 연결된 fingerprint를 가질 수 있는 유일한 상태다. `blocked` unit은 owner의 부분 검토로, 비어 있지 않은 경로·check·미해결 사실이 있고 fingerprint는 없다.[](source:hun-result)

형식 규칙은 이렇다.[](source:hun-result)

- 모든 소스 경로는 저장소 상대 경로다.
- 여러 항목의 trace는 `entrypoint`로 시작해 `sink`로 끝나고 중간은 `propagation`이다.
- 모든 check는 자기 canonical 소문자 `agent_id`와 비어 있지 않은 `reviewed_paths`를 갖고, unit 수준 목록은 그 합집합과 정확히 같다.
- `source` check는 `artifact: null`이고, `local` check는 parent가 승격한 일반 파일 하나를 `agents/<check.agent_id>/artifacts/` 아래에서 가리킨다.
- scratch, 출력 루트의 파일, 다른 check 소유자의 artifact는 연결하지 않는다.

`confirmed` 제안의 실행 설명은 이미 수행한 제한된 local check만 서술하고, `payloads`는 최소 test 입력·fixture·native 호출, `observed_result`는 실제 local 출력이다. 전체 severity는 관찰한 영향을 넘지 못한다. `needs_validation` 제안은 severity, execution, remediation, reason, `confirmed`용 `root_cause`를 넣지 않는다. `deployment`는 소유자가 관찰하는 확인이지 live target을 건드려 보라는 요청이 아니다.[](source:hun-result)

## coverage critic은 무엇을 보고 어떻게 반복을 멈추나 {#critic span=12}

post-wave critic은 `architecture.md`, assignment block 지도를 포함한 전체 ledger, 현재 후보 fingerprint와 상태, 이전 ledger 빈틈 요약을 받는다. 소스를 읽지만 쓰거나 target을 실행하지 않고, 정확히 아래 JSON을 돌려준다.[](source:hun-critic)

@facts id=critic-fields
| `missing_units[]` | `surface`, `boundary`, `subsystem`, `attack_class`, `starting_paths`, `selected_companion_blocks`, `excluded_blocks[]`(block과 reason), `reason`(소스 근거 있는 coverage 빈틈) |
| `reassign_ids` | 닫히지 않은 기존 unit의 ID |
| `resolved_prior_leads` | 해결로 보는 fingerprint 목록 |
| `stop` | critic 자신의 판단. `missing_units`와 `reassign_ids`를 하나도 수락하지 않을 때만 `true`다 |

critic이 보는 것은 매핑되지 않은 진입점, 확인하지 않은 병렬 경로, 빠진 lifecycle mode, unit이 없는 선택된 companion class, 근거 없는 제외, 경로나 check 없이 닫힌 unit, 어떤 unit도 다루지 않는 이전 `needs_validation`·소스 변경 빈틈이다. critic은 finding이 아니라 coverage를 제안한다. 다음 wave를 돌릴지는 `stop` 하나가 아니라 parent의 반복 조건이 정한다.[](source:hun-critic)

critic 결과를 받은 parent는 다음 순서로 처리한다.[](source:hun-critic)

- 범위나 소스·local 경계 밖의 제안 unit을 거부한다.
- 수락한 unit의 canonical ID를 만들어 현재 unit과 중복을 제거한다. canonical ID가 충돌하면 합치지 않고 실패한다.
- 정당한 `reassign_id` 중 live 증거(`blocked`, `covered`, `candidate`)가 있는 unit은 그 상태를 `attempts`에 보관하고 `wave`를 올린다. 다음 hunter는 새 owner이고 live 증거는 비어 있다. 보관된 owner의 check나 artifact를 새 시도로 복사하지 않는다.
- ID를 정렬하고 ledger를 검증한 뒤에 다음 배정을 한다.

반복 한도는 profile과 budget이 정한다.

- 시간이나 자원 때문에 일찍 멈추면 건드리지 않은 unit은 모두 `deferred`로 두고 critic의 이유를 보존하며 보고서에 빈틈을 밝힌다. 조용한 wave·agent 상한을 완전한 coverage의 증거로 쓰지 않는다.[](source:hun-critic)
- scoped run에서 critic이 범위 밖 빈틈을 알아채면 parent는 배정하지 않고 critic의 이유와 함께 `out_of_scope`로 기록한다.[](source:hun-quick)
- 후보가 검증 예약보다 많으면 `SKILL.md`의 incomplete 규칙을 따라 hunting을 멈추고 fingerprint 순으로 검증한다. 검증하지 못한 후보는 finding으로 내놓지 않는다.[](source:hun-budget)

## 다른 페이지 {#other-pages span=12}

| 파일 | 내용 |
| --- | --- |
| `security-audit.html` | 개요 |
| `security-audit.recon.html` | 이 페이지가 소비하는 ledger와 상태 표 |
| `security-audit.rules.html` | 지시문 4번 부분에 복사되는 attack class와 도메인 지침 |
| `security-audit.setup.html` | 지시문에 붙는 승격 절차 |
| `security-audit.planning.html` | profile별 critic 한도와 budget 예약 |
| `security-audit.verify.html` | 후보를 받는 Phase 3 |
