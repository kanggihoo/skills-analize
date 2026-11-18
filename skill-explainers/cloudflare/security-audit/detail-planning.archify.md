# 감사 계획 — 프로필, 비용 예산, 이전 실행 활용 {#planning-detail}

이 페이지는 개요의 `감사 설정` 노드 중 계획 규칙을 맡는다. 시작 입력은 사용자의 요청(profile, 범위, budget)과 이전 실행의 ledger·findings다. 끝 출력은 `run-metadata.json`의 `profile`, `scope_paths`, `budget`과 현재 실행의 시작 조건이다. 이후 개요의 `정찰`로 이어지고, budget이 최소 비용을 못 대면 agent 없이 `incomplete`로 끝난다. 이 규칙은 전체 감사 모드에만 적용된다.[](source:skm-plan-scope)

@answer scope="cloudflare/security-audit · SKILL.md 88~134줄 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=da3be34f22adbe6a3095252847b21c5f2e13b661
@source skm-plan-scope title="전체 감사 모드에만 적용" path=cloudflare/security-audit/SKILL.md lines=90:90
@source skm-cov title="deterministic coverage plan" path=cloudflare/security-audit/SKILL.md lines=94:94
@source skm-prior title="이전 실행 활용 여섯 규칙" path=cloudflare/security-audit/SKILL.md lines=96:105
@source skm-profiles title="프로필과 범위" path=cloudflare/security-audit/SKILL.md lines=107:117
@source skm-budget-def title="예산의 단위" path=cloudflare/security-audit/SKILL.md lines=119:121
@source skm-budget-gate title="정찰 전 strict gate" path=cloudflare/security-audit/SKILL.md lines=123:123
@source skm-budget-order title="예산 사용 순서" path=cloudflare/security-audit/SKILL.md lines=125:130
@source skm-budget-est title="wave 1 전 추정과 critic reserve 소진" path=cloudflare/security-audit/SKILL.md lines=132:132
@source skm-budget-over title="검증 예산 소진" path=cloudflare/security-audit/SKILL.md lines=134:134

## 이전 실행의 기록을 어떻게 다시 쓰나 {#prior span=12}

원문의 전제는 "한 번의 pass로는 완전하지 않다"이다. 그래서 hunting 전에 deterministic coverage plan을 세우고, agent 결과가 나올 때마다 갱신한다. ledger는 parent만 갱신한다.[](source:skm-cov) 이전 실행이 있으면 호환되는 모든 `coverage-ledger.json`과 `findings.json`을 계획 전에 읽는다.[](source:skm-prior)

| 이전 기록 | 현재 실행에서 하는 일 | 출처 |
| --- | --- | --- |
| `confirmed`, 관련 소스와 조건이 그대로고 증거가 현재 계약을 만족 | 현재 후보 집합으로 옮긴다. 현재 ledger의 `planned` unit에 잇고 fingerprint를 보존한다. 그 root cause만 hunter 제외 목록에 넣는다. 현재 최종 검증 경로를 거치고, 다시 확인한 Phase 3 verifier가 그 unit의 assignment owner가 되어 unit을 `candidate`로 옮긴다 | [](source:skm-prior) |
| `confirmed`, 관련 소스가 바뀜 | 현재 `planned` revalidation unit을 만든다. hunter 제외 목록에 넣지 않는다. 현재 독립 검증이 경로와 결과를 세울 때만 `confirmed`로 남는다 | [](source:skm-prior) |
| `needs_validation`, `deferred`, `blocked`, `out_of_scope`, 소스가 바뀐 unit | 현재 작업이다. 아직 외부 요인이 막는 `needs_validation`은 현재 소스 trace를 확인하고 fingerprint로 `planned` unit에 이은 뒤에만 옮길 수 있고, blocker는 그대로 둔다. 이 상태들은 현재 unit을 억제하지 않는다 | [](source:skm-prior) |
| 같은 소스에서 이미 `covered`였던 unit | 우선순위에 참고할 수 있지만 현재 ledger에 그대로 보인다 | [](source:skm-prior) |
| `rejected` | 소스가 같은 실패한 주장만 막는다. 그 unit의 coverage는 막지 않고, 증거가 바뀌면 현재 작업이다 | [](source:skm-prior) |
| 이전 profile·scope | 함께 읽는다. `quick`이나 scoped ledger는 기록된 증거와 빈틈만 알려 주고 "나머지는 괜찮다"는 뜻이 아니다 | [](source:skm-prior) |

이전 소스 ref만으로는 경로가 바뀌지 않았다는 증거가 되지 않는다. 현재 소스를 이전 record와 직접 비교해야 한다.[](source:skm-prior) 이전 ledger가 없으면 최종 coverage 설명에 없다고 쓰고, 한 번의 실행이 target을 소진했다고 암시하지 않는다.[](source:skm-prior)

## 프로필과 범위는 무엇을 바꾸나 {#profiles span=12}

parent는 설정 단계에서 사용자의 요청에서 profile을 고르거나, target의 크기와 중요도를 보고 제안한다. `run-metadata.json`의 `profile`과 `scope_paths`에 기록하고 보고서에도 밝힌다. 기본값은 `standard`다.[](source:skm-profiles)

| profile | 용도 | 바뀌는 것 |
| --- | --- | --- |
| `quick` | 작은 target, 재실행, 빠른 첫 확인 | ledger unit을 surface × boundary × attack class로 거칠게 합친다(subsystem은 고정값 `profile/quick/all-in-scope-subsystems`). hunter wave와 final critic pass를 각각 정확히 한 번 돌린다. 후보마다 새 verifier 하나가 후보 검증과 최종 기록 검증을 함께 맡는다. 후속 hunter wave는 없고, critic이 수락한 발견과 재배정은 `deferred`로 기록한다[](source:skm-profiles) |
| `standard` | 기본 | 원문 workflow 그대로[](source:skm-profiles) |
| `deep` | 고위험·대형 target | unit을 subsystem과 lifecycle mode별로 나눈다. critic wave를 깨끗한 pass가 나올 때까지 돌린다. 후보 검증과 최종 기록 검증은 서로 다른 새 agent가 맡는다. `prior_covered_same_source` unit에는 독립된 두 번째 pass를 준다[](source:skm-profiles) |

scoped run은 일부만 감사한다. 이름 붙인 경로, subsystem 하나, companion domain 하나, 두 source ref 사이의 diff가 이에 해당한다. 범위 안의 surface에만 unit을 시드하고 나머지는 `out_of_scope`로 기록하며 `covered`로 적지 않는다. scoped run과 `quick` run은 부분 coverage라고 스스로 밝혀야 한다.[](source:skm-profiles)

profile은 범위와 중복 검증의 폭을 바꿀 뿐 증거 기준은 바꾸지 않는다. 후보 통과 조건, 소스·local 실행 경계, `needs_validation` 규율, schema 검증, `confirmed` record의 독립 검증은 어떤 profile에서도 줄이지 않는다.[](source:skm-profiles)

## 비용 예산은 어떻게 쓰고, 부족하면 어떻게 멈추나 {#budget span=12}

예산 단위는 agent 호출 수다. unit 하나는 대략 hunter 배정 하나이고, 살아남은 후보 하나는 profile에 따라 verifier 배정 하나나 둘이다. 사용자가 budget을 정하거나 parent가 큰 target에 제안하면 `run-metadata.json`의 `budget`에 모든 단계를 합친 agent 호출 최대 횟수로 기록한다.[](source:skm-budget-def)

정찰 agent를 띄우기 전에 strict budget gate를 적용한다. 정찰 기본 호출 네 개, 최종 critic(`quick`은 post-wave 하나, `standard`·`deep`은 post-wave 하나와 별도의 final-clean 하나), verifier 호출 최소 하나를 먼저 예약한다. 요청한 budget이 이 최소를 못 대면 agent를 하나도 띄우지 않고 더 큰 budget, 좁은 범위, 다른 profile을 요청한다.[](source:skm-budget-gate)

예산을 쓰는 순서는 이렇다.[](source:skm-budget-order)

@list id=budget-order ordered=true
| 정찰, 모든 post-wave critic, 별도의 final-clean critic을 모두 agent 호출로 센다.[](source:skm-budget-order) |
| hunting 전에 critic과 검증 몫을 예약한다. `quick`은 final critic 하나를, `standard`·`deep`은 wave마다 post-wave critic 하나와 final-clean critic 하나를 예약하고, 후보 예상 수에 따라 verifier 몫(후보당 1~2개, 불확실하면 critic 예약 뒤 잔액의 30%)도 예약한다. hunter를 이 예약분에 배정하지 않는다.[](source:skm-budget-order) |
| 남은 hunting 몫을 우선순위 순서로 unit에 배정하고, wave 직후 예약한 critic을 바로 쓴다. final-clean과 검증 예약은 건드리지 않는다.[](source:skm-budget-order) |
| 다음 wave 전에 새 post-wave critic을 다시 예약한다. critic과 검증 예약을 못 채우면 그 wave의 hunter를 띄우지 않고 `planned` unit을 이유 `budget_cannot_reserve_critics_and_validation`으로 `deferred` 처리하며, 남겨 둔 final-clean critic이 그 빈틈을 기록한다.[](source:skm-budget-order) |

부족해지는 경우의 종료 상태는 이렇다.

| 상황 | 결과 | 출처 |
| --- | --- | --- |
| budget이 정찰과 예약의 최소를 못 댄다 | agent를 띄우지 않는다. 요청이 그대로면 `run_status: "incomplete"`, `incomplete_reason: "budget_cannot_fund_reconnaissance_and_reserves"`로 기록하고 audit pass가 돌지 않았다고 보고한다 | [](source:skm-budget-gate) |
| 이후 사실 때문에 필수 final critic 예약이 소진된다 | hunter를 띄우지 않고 `planned` 작업을 모두 `deferred`로 두고 `incomplete`, 이유 `critic_budget_exhausted`로 기록한다. complete coverage 주장은 하지 않는다 | [](source:skm-budget-est) |
| 후보가 예상보다 많아 검증 예산이 부족하다 | hunting을 멈추고 fingerprint 순으로 예산이 허락하는 만큼 검증한다. `incomplete`, 이유 `validation_budget_exhausted`로 기록한다 | [](source:skm-budget-over) |

검증하지 못한 후보는 해당 fingerprint를 `candidate` ledger unit에 이어 두고 미해결 이유를 적는다. `findings.json`에 넣지 않고 `needs_validation`으로 바꿔 붙이지도 않으며 run을 complete로 보고하지도 않는다. 부분 보고서는 첫 절에서 후보 검증이 불완전하다고 밝히고 영향받는 fingerprint와 unit을 나열할 때만 만들 수 있다. 사용자가 정한 strict budget을 말없이 넘지 않는다.[](source:skm-budget-over)

wave 1 전에는 시드한 unit 수, 암시된 hunter 수, 필수 critic 호출, 검증 예약, 남은 budget이 계획을 덮는지를 담은 추정을 갱신한다. 덮지 못하면 얇은 증거로 조용히 진행하지 않고, 좁은 범위나 거친 profile을 제안한다.[](source:skm-budget-est)

## 다른 페이지 {#other-pages span=12}

| 파일 | 내용 |
| --- | --- |
| `security-audit.html` | 개요 |
| `security-audit.setup.html` | 모드 선택, 실행 안전, 설정값, 쓰기 격리 |
| `security-audit.recon.html` | 정찰과 coverage ledger. 이전 실행의 `prior_status` 값이 쓰이는 곳 |
| `security-audit.hunt.html` | hunter 지시문과 coverage critic. profile별 critic 한도 |
