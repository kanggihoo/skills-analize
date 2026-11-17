# 정찰과 coverage ledger — 소스를 지도로 만들고 검토 범위를 unit으로 쪼갠다 {#recon-detail}

이 페이지는 개요의 `정찰` 노드, 곧 Phase 1을 맡는다. 시작 입력은 `run-metadata.json`과 target 소스, 이전 실행 기록이다. 끝 출력은 `architecture.md`와 `coverage-ledger.json`이고, ledger의 unit은 모두 `planned`로 시작한다. 이후 개요의 `사냥`으로 이어진다. budget gate에서 막히면 agent 없이 `incomplete`로 끝난다.[](source:rec-p1)

@answer scope="cloudflare/security-audit · RECONNAISSANCE.md 전체, validate-coverage-ledger.cjs 일부 · 지시상 동작"
@meta locale=ko
@source rec-p1 title="정찰 시작 조건" path=cloudflare/security-audit/RECONNAISSANCE.md lines=3:7
@source rec-a1a title="정찰 agent 1a" path=cloudflare/security-audit/RECONNAISSANCE.md lines=9:20
@source rec-a1b title="정찰 agent 1b" path=cloudflare/security-audit/RECONNAISSANCE.md lines=22:33
@source rec-a1c title="정찰 agent 1c" path=cloudflare/security-audit/RECONNAISSANCE.md lines=35:42
@source rec-a1d title="정찰 agent 1d" path=cloudflare/security-audit/RECONNAISSANCE.md lines=44:55
@source rec-focus title="focused 정찰 agent" path=cloudflare/security-audit/RECONNAISSANCE.md lines=57:57
@source rec-prior title="이전 실행 입력" path=cloudflare/security-audit/RECONNAISSANCE.md lines=59:71
@source rec-arch title="architecture.md" path=cloudflare/security-audit/RECONNAISSANCE.md lines=73:88
@source rec-ledger title="ledger 구성 원칙" path=cloudflare/security-audit/RECONNAISSANCE.md lines=90:94
@source rec-id title="coverage_id 계산" path=cloudflare/security-audit/RECONNAISSANCE.md lines=96:102
@source rec-unit title="ledger unit 필드" path=cloudflare/security-audit/RECONNAISSANCE.md lines=104:139
@source rec-state title="unit 상태 표" path=cloudflare/security-audit/RECONNAISSANCE.md lines=141:152
@source rec-run title="ledger 검증기 실행과 한도" path=cloudflare/security-audit/RECONNAISSANCE.md lines=154:156
@source vl-limits title="ledger 검증기 입력 한도" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=13:21
@source vl-id title="coverage_id 계산 코드" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=354:375
@source vl-run title="ledger 검증기 실행 진입점" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=808:853

## 정찰은 어떤 순서로 무엇을 만드나 {#flow span=12}

Phase 1은 parent가 `run-metadata.json`을 초기화하고 strict budget gate를 적용한 뒤, agent scratch 루트와 공유 ledger를 만드는 데서 시작한다. 정찰은 target과 로컬에 있는 build·설정 상태만 읽는다. 배포된 endpoint, 외부 identity provider, registry, broker, cloud API, 공유 서비스에는 접속하지 않는다.[](source:rec-p1)

그림에서 생략한 것이 셋 있다.

- budget gate가 실패하면 정찰 agent를 하나도 띄우지 않고 metadata에 `incomplete`를 기록한 채 끝난다.[](source:rec-p1)
- 서로 뚜렷이 다른 배포 모드나 subsystem이 있으면 focused 정찰 agent를 더 띄운다. budget gate가 그 agent를 막으면 띄우지 않고, 지도에 없는 영역을 이유 `budget_cannot_reserve_critics_and_validation`인 `deferred` unit으로 시드하며 보고서에 빈틈을 밝힌다.[](source:rec-focus)
- 이전 실행을 읽는 시점은 원문이 "작업을 고르기 전"이라고만 적었다. 그림의 순서는 판정이다.[](source:rec-prior)

@workflow id=recon-flow title="Phase 1 정찰"
| lane gather | 사실 수집 |
| lane build | 지도 만들기 |
| gate | 예산 gate | security | gather | source:rec-p1 |
| agents | 정찰 agent 네 개 | backend | gather | source:rec-a1a |
| prior | 이전 실행 읽기 | database | gather | source:rec-prior |
| arch | architecture.md | backend | build | source:rec-arch |
| ledger | ledger 시드 | database | build | source:rec-ledger |
| gate > agents | 통과 | emphasis |
| agents > prior | |
| prior > arch | |
| arch > ledger | |

@steps id=recon-steps
| r-gate | 예산 gate | **입력** `run-metadata.json`·`budget` · **참조** `SKILL.md`의 budget 규칙 · **출력** 통과 또는 incomplete 기록. **처리** parent가 metadata를 초기화하고 strict gate를 적용한다. 실패하면 정찰 agent를 띄우지 않고 metadata에 incomplete를 기록한 뒤 끝난다.[](source:rec-p1) | recon-flow | gate |
| r-agents | 정찰 agent 네 개 | **입력** target 소스(네트워크 없음) · **참조** `RECONNAISSANCE.md`의 지시문 1a~1d · **출력** 저장소 상대 `file:line`이 붙은 사실. **처리** parent가 `research` agent 네 개를 병렬로 띄운다. agent는 파일을 쓰지 않고 구조화된 사실만 parent에게 돌려준다.[](source:rec-p1) | recon-flow | agents |
| r-prior | 이전 실행 읽기 | **입력** 같은 repo의 이전 `coverage-ledger.json`·`findings.json` · **출력** carry할 record, 재검증 unit, 현재 작업으로 분류한 목록. **처리** 현재 소스와 이전 record를 비교해 분류한다. 없거나 호환되지 않는 ledger는 빈 coverage로 치지 않고 기록한다.[](source:rec-prior) | recon-flow | prior |
| r-arch | architecture.md | **입력** agent 네 개의 사실·이전 실행 요약 · **참조** `ATTACK-CLASSES.md` · **출력** `<output-dir>/architecture.md`(약 1,000단어 상한)와 선택한 companion 요약. **처리** parent가 제품·주체·trust boundary·시작 경로를 종합하고, 정찰이 찾은 boundary에 맞는 companion 파일만 고른다.[](source:rec-arch) | recon-flow | arch |
| r-ledger | ledger 시드 | **입력** surface·trust boundary·subsystem·attack class 조합 · **참조** `RECONNAISSANCE.md` · **실행** `node <skill-dir>/validate-coverage-ledger.cjs <output-dir>/coverage-ledger.json` · **출력** `coverage_id`로 정렬한 `coverage-ledger.json`(모든 unit `planned`). **처리** parent가 조합마다 unit 하나를 만들고 `coverage_id`를 계산해 기록한 뒤 검증기를 돌린다.[](source:rec-ledger)[](source:rec-run) → 내부: 검증기는 이 ledger 파일 하나만 읽고 `coverage_id`를 canonical ref에서 다시 계산해 비교한다(코드 확인).[](source:vl-run)[](source:vl-id) **다음** 오류가 있으면 배정이나 coverage 주장 전에 모두 고친다. | recon-flow | ledger |

## 정찰 agent 네 개는 각각 무엇을 읽고 돌려주나 {#agents span=12}

네 agent는 모두 `research` agent이고 병렬로 돈다.[](source:rec-p1)

| agent | 읽는 것 | 돌려주는 것 | 출처 |
| --- | --- | --- | --- |
| 1a 제품·stack·로컬 운영 | target 소스(네트워크 없음) | 제품 유형·사용자·운영자, 언어·framework·build·runtime, 진입점과 subsystem 경계, 오프라인으로 돌릴 수 있는 build·test 명령과 쓰기 위치(정찰 중에는 실행하지 않음), 소스에 근거가 있을 때만 비교 대상 소프트웨어, 제한 사항 | [](source:rec-a1a) |
| 1b 주체·권한·통제 | 신원·권한·격리·권한 상승을 정하는 모든 소스 | 낮은 신뢰 주체와 설계상 가능한 행동, 진입면별 인증, 자원별 권한과 tenant 범위, process·browser·CI·plugin·model/tool·device·local-IPC 권한, 권한 변경·확인·폐기·복구·fallback, 소스에서 보이는 통제와 배포 사실에 기대는 통제 | [](source:rec-a1b) |
| 1c 진입면·복사본·sink | 외부나 낮은 신뢰 입력이 들어오는 모든 곳(HTTP/browser, RPC/message, 파일·archive, CLI/env/config, plugin·의존성·CI, cloud event·IAM selector, model context·tool 인자, mobile deep-link·webview, local IPC) | 주요 변환, 저장·파생 복사본, 보안상 의미 있는 sink, 소스에서 보이는 한도와 같은 효과로 가는 병렬 경로. 입력을 실행하거나 보내지 않는다 | [](source:rec-a1c) |
| 1d 로컬 실행·배포 가시성 | test, build 정의, manifest, packaging, 유지되는 환경 overlay | 더미 데이터로 trust boundary를 검증할 수 있는 작은 오프라인 test, loopback만 쓰는 process, 이번 실행에서 금지로 표시할 명령(의존성 다운로드, publish, 유료 API, 공유 상태), 소스로 확정할 수 없어 결정적이면 `needs_validation`이 되는 배포 통제, 배포 모드별 최종 소스 경로, 샌드박스 강제 가능 여부, 승격 통제 가능 여부 | [](source:rec-a1d) |

1d의 마지막 두 항목이 막히면 결과가 달라진다. 빈 허용 목록 환경, 외부 네트워크 차단, 읽기 전용 mount, scratch 전용 쓰기, 자원 상한 중 하나라도 로컬 플랫폼이 강제하지 못하면 target 코드 실행이 막힌다. no-follow 경로 제한 승격 같은 통제가 빠지면 scratch 파일을 증거로 쓸 수 없다.[](source:rec-a1d)

## architecture.md에는 무엇이 들어가고 companion은 어떻게 고르나 {#architecture span=12}

parent가 `<output-dir>/architecture.md`를 쓴다. 상한은 약 1,000단어다. 담을 항목은 여덟 가지다.[](source:rec-arch)

@list id=architecture-items ordered=true
| 제품, 주체, 일반적인 권한, 보호 자원.[](source:rec-arch) |
| 소스에 근거가 있을 때 1a가 찾은 비교 대상 소프트웨어의 보안 trade-off. effort와 severity를 맞추는 데만 쓰고 확인된 finding을 기각하는 데는 쓰지 않는다. 의미 있는 비교 대상이 없으면 이 줄을 뺀다.[](source:rec-arch) |
| 기술 stack, 소스에서 보이는 배포 경로, 오프라인 build·test 한계.[](source:rec-arch) |
| 진입면과 중요한 source-to-sink 또는 lifecycle 경로.[](source:rec-arch) |
| trust boundary와 각각에서 소스로 보이는 가장 강한 통제.[](source:rec-arch) |
| 저장소 상대 시작 경로.[](source:rec-arch) |
| 이전 coverage 빈틈, 소스가 바뀐 재검증 대상, blocked 대상, 같은 소스 `confirmed` 제외 목록.[](source:rec-arch) |
| `ATTACK-CLASSES.md`에서 고른 companion 파일과 그것이 필요한 boundary의 짧은 요약.[](source:rec-arch) |

assignment별 일반 block, 선택한 companion block, 이유가 붙은 제외 block은 `architecture.md`가 아니라 각 ledger unit에 둔다. 그래야 큰 실행에서도 architecture 상한이 지켜지고 hunter 지시문 구성을 기계로 검사할 수 있다.[](source:rec-arch)

companion 선택 기준은 언어나 의존성 이름이 보인다는 사실이 아니다. 정찰이 해당 파일의 `When to use this file` 절에 적힌 trust-sensitive boundary를 실제로 찾았을 때 고른다. 다른 agent가 관련 class를 볼 것이라는 이유로 보이는 boundary를 제외하지도 않는다.[](source:rec-arch) 도메인 파일별 조건은 `security-audit.rules.html`에 있다.

## coverage ledger는 어떻게 구성되고 어떤 상태를 거치나 {#ledger span=12}

parent가 `<output-dir>/coverage-ledger.json`을 최상위 JSON 배열로 쓴다. 진입면, trust boundary, subsystem, 해당하는 일반·companion attack class의 의미 있는 조합마다 unit 하나를 만든다. 세분화 정도는 profile이 정한다.[](source:rec-ledger)

각 차원은 사람용 label과 `canonical_refs`의 소스 기반 안정값을 가진다. 같은 소스 대상에는 label이 바뀌어도 같은 canonical reference를 쓴다.[](source:rec-ledger)

`coverage_id`는 slug 없이 만든다. 세 단계다.[](source:rec-id)

@list id=coverage-id-steps ordered=true
| 모든 reference를 Unicode NFC로 하고 유효한 scalar value여야 한다. 보이는 내용이 있어야 하고 제어·format·줄/문단 구분·default-ignorable 문자와 앞뒤 공백은 없어야 한다.[](source:rec-id) |
| UTF-8 바이트를 RFC 3986 percent encoding으로 인코딩한다. `A-Z a-z 0-9 - . _ ~`만 그대로 두고 나머지 바이트는 대문자 `%HH`로 쓴다.[](source:rec-id) |
| `surface`, `boundary`, `subsystem`, `attack_class` 순으로 인코딩한 값을 `::`로 잇고, `lifecycle`이 있으면 끝에 붙인다.[](source:rec-id) |

ID 규칙에는 네 가지가 더 있다.

- wave 번호, agent, verdict, severity, 줄 번호는 reference나 ID에 넣지 않는다.[](source:rec-id)
- 배정 전마다 unit을 `coverage_id` 순으로 정렬하고, 중복 ID는 모두 실패다. 중복 ID의 의미 필드가 다르면 canonical identity 충돌로 보고 합치거나 덮어쓰지 않는다.[](source:rec-id)
- quick 프로필의 subsystem 차원은 고정값 `profile/quick/all-in-scope-subsystems`를 쓴다.[](source:rec-id)
- 검증기 코드도 각 reference를 인코딩해 `::`로 잇는 같은 방식으로 ID를 계산한다(코드 확인).[](source:vl-id)

unit 필드 중 `prior_status`는 열한 값 중 하나다. `new`, `prior_confirmed_same_source`, `prior_confirmed_changed_source`, `prior_needs_validation`, `prior_deferred`, `prior_blocked`, `prior_out_of_scope`, `prior_covered_same_source`, `prior_covered_changed_source`, `prior_rejected_claim_changed`, `none`이다. `new`는 호환되는 이전 ledger가 있는데 이번에 처음 본 surface를, `none`은 호환되는 이전 ledger가 없을 때 시드한 unit을 가리킨다.[](source:rec-unit)

`attempts`는 coverage critic이 다시 연 증거 있는 배정을 보관하는 append-only 기록이다. 재배정 전에 이전 unit의 `wave`, `status`, `agent_id`, `reviewed_paths`, `local_checks`, `result_fingerprints`, `unresolved`와 critic의 근거 있는 `reassignment_reason`을 덧붙인다. 보관할 수 있는 상태는 `blocked`, `covered`, `candidate`뿐이다. 다음 배정은 `wave`를 올리고 새 owner를 쓰며 live 증거를 비운 채 시작한다.[](source:rec-unit)

unit 상태는 상태 표를 정확히 따라야 한다.[](source:rec-state)

| 상태 | unit `agent_id` | `reviewed_paths` / `local_checks` | `result_fingerprints` | `unresolved` |
| --- | --- | --- | --- | --- |
| `planned` | null | 비어 있음 | 비어 있음 | 비어 있음 |
| `not_applicable`, `out_of_scope`, `deferred` | null | 비어 있음 | 비어 있음 | 이유가 있어야 함 |
| `in_progress` | canonical owner | 비어 있음 | 비어 있음 | 비어 있음 |
| `blocked` | canonical owner | 둘 다 비어 있지 않음(owner의 부분 증거) | 비어 있음 | blocker가 있어야 함 |
| `covered` | canonical owner | 둘 다 비어 있지 않음 | 비어 있음 | 비어 있음 |
| `candidate` | canonical owner | 둘 다 비어 있지 않음 | 비어 있지 않음 | 선택 |

canonical agent ID는 `^[a-z0-9][a-z0-9_-]{0,63}$`이고 Windows 장치 이름은 안 된다. unit의 `agent_id`는 배정 owner이고, 각 check는 자기 `agent_id`와 비어 있지 않은 `reviewed_paths`를 갖는다. unit 수준 `reviewed_paths`는 check들의 합집합과 정확히 같아야 한다. source 전용 check는 `artifact: null`이고, local check는 parent 쪽 코드가 `agents/<check.agent_id>/artifacts/` 아래로 승격한 일반 파일이어야 한다.[](source:rec-state)

ledger가 coverage 주장이다. architecture 요약, agent 수, "auth reviewed" 같은 일반 문장은 coverage 증거가 아니다. Phase 2는 hunter의 구조화된 결과에 있는 경로와 check로만 unit을 닫는다.[](source:rec-state)

검증기는 시드 직후, parent가 갱신할 때마다, Phase 6 전에 돌린다. 5 MiB를 넘는 입력, 중첩 64단계, unit 10,000개, 중첩 컬렉션 항목 1,000개, 순회하는 값 500,000개를 거부하고 보고하는 오류는 100개로 제한한다. 현실적인 unit이면 5 MiB 한도가 대략 2,000~5,000 unit에서 먼저 걸린다.[](source:rec-run) 코드의 한도값도 같다(`inputBytes` 5 MiB, `units` 10000, `collectionItems` 1000, `objectFields` 1000, `nestingDepth` 64, `preflightValues` 500000, `validationErrors` 100).[](source:vl-limits)

## 다른 페이지 {#other-pages span=12}

| 파일 | 내용 |
| --- | --- |
| `security-audit.html` | 개요 |
| `security-audit.planning.html` | 이전 실행 활용 규칙, budget gate의 상세 |
| `security-audit.hunt.html` | ledger를 소비하는 Phase 2 |
| `security-audit.rules.html` | companion 파일별 선택 조건 |
| `security-audit.records.html` | ledger 검증기와 findings 검증기 |
