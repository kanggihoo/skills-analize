# 전체 감사는 정찰 전에 무엇을 정하고 정찰에서 무엇을 만드나 {#security-audit-recon}

전체 감사 모드의 parent는 정찰 agent를 띄우기 전에 다섯 값, 프로필, 예산을 정하고, 정찰에서 `architecture.md`, 도메인 파일 선택, `coverage-ledger.json`을 만든다.[](source:skm-setup)[](source:rec-arch)

- 예산이 정찰 호출 네 번, 마지막 critic 몫, verifier 최소 한 번을 감당하지 못하면 agent를 하나도 띄우지 않고 `incomplete`로 끝난다.[](source:skm-budget)
- 정찰은 대상과 로컬의 빌드·설정 상태만 읽고 배포된 endpoint나 공유 서비스에는 접속하지 않는다.[](source:rec-gate)

@answer scope="cloudflare/security-audit · RECONNAISSANCE.md와 SKILL.md의 시작 전 규칙"
@meta locale=ko
@source skm-setup title="전체 감사 설정값" path=cloudflare/security-audit/SKILL.md lines=44:52
@source skm-profiles title="프로필과 범위" path=cloudflare/security-audit/SKILL.md lines=107:117
@source skm-budget title="비용 예산" path=cloudflare/security-audit/SKILL.md lines=119:134
@source rec-gate title="정찰 시작 조건" path=cloudflare/security-audit/RECONNAISSANCE.md lines=3:7
@source rec-agents title="정찰 agent 네 개" path=cloudflare/security-audit/RECONNAISSANCE.md lines=9:57
@source rec-arch title="architecture.md와 companion 선택" path=cloudflare/security-audit/RECONNAISSANCE.md lines=73:88
@source rec-ledger title="ledger와 coverage_id" path=cloudflare/security-audit/RECONNAISSANCE.md lines=90:102
@source rec-state title="상태 표와 검증기 실행" path=cloudflare/security-audit/RECONNAISSANCE.md lines=141:156
@source hun-loop title="critic 반복과 프로필·예산 한계" path=cloudflare/security-audit/HUNTING.md lines=247:251
@source val-p5 title="최종 기록 검증" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=120:149

## 시작 전 결정과 정찰은 어떻게 흐르나 {#flow span=12}

전체 감사 개요 페이지의 앞 세 단계를 자세히 본다. 전체 그림은 [개요](overview.html)에 있다.

@workflow id=recon-flow title="정찰 전까지"
| budget | 예산이 충분한가? | backend |
| halt | incomplete로 중단 | security |
| recon | Phase 1 정찰 | backend |
| budget > halt | 부족 |
| budget > recon | 충분 | emphasis |

@steps id=recon-steps
| s-budget | 예산이 충분한가? | 전체 감사로 정해지면 parent는 다섯 값(스킬 폴더, 대상 경로, repo 이름, 출력 폴더, 소스 ref)과 프로필(기본 `standard`), 예산(모든 단계를 합친 agent 호출 최대 횟수)을 정한다.[](source:skm-setup)[](source:skm-profiles) 그다음 정찰 호출 네 번, 마지막 critic 몫, verifier 최소 한 번이 예산에 들어가는지 확인한다.[](source:skm-budget) | recon-flow | budget |
| s-halt | incomplete로 중단 | 예산이 이 최소를 감당하지 못하면 agent를 하나도 띄우지 않고 사용자에게 더 큰 예산, 좁은 범위, 다른 프로필 중 하나를 요청한다. 요청이 그대로이면 `run_status: "incomplete"`와 이유 `budget_cannot_fund_reconnaissance_and_reserves`를 기록하고 감사가 한 번도 돌지 않았다고 보고한다.[](source:skm-budget)[](source:rec-gate) | recon-flow | halt |
| s-recon | Phase 1 정찰 | `RECONNAISSANCE.md`를 읽는다. parent가 읽기 전용 `research` agent 네 개를 병렬로 띄운다. 1a는 스택과 빌드 명령, 1b는 낮은 신뢰 주체와 인증·인가 통제, 1c는 진입면과 싱크, 1d는 로컬 실행 가능성과 샌드박스 통제를 조사한다.[](source:rec-agents) 결과로 parent가 `architecture.md`(약 1,000단어 상한)를 쓰고, 보인 경계에 맞는 도메인 파일을 고르고, 진입면·신뢰 경계·subsystem·attack class 조합마다 한 줄씩 `coverage-ledger.json`에 `planned`로 적는다.[](source:rec-arch)[](source:rec-ledger) 검증 스크립트가 통과해야 작업을 배정한다.[](source:rec-state) 정찰 중에는 배포된 endpoint나 공유 서비스에 접속하지 않는다.[](source:rec-gate) | recon-flow | recon |


## 프로필은 무엇을 바꾸나 {#profiles span=12}

프로필은 hunter 반복과 verifier 구성만 바꾼다. 후보 통과 조건, 소스·로컬 실행 경계, `needs_validation` 규율, 스키마 검증, `confirmed` 기록의 독립 검증은 어느 프로필에서도 줄이지 않는다.[](source:skm-profiles)

| 프로필 | 반복과 critic | verifier | ledger 단위 |
| --- | --- | --- | --- |
| `quick` | hunter wave 정확히 한 번, 마지막 critic 정확히 한 번[](source:skm-profiles) | 후보마다 새 verifier 하나가 후보 검증과 최종 기록 검증을 함께 맡는다[](source:skm-profiles) | surface × boundary × attack class로 거칠게 묶고 subsystem은 고정값 `profile/quick/all-in-scope-subsystems`를 쓴다[](source:skm-profiles) |
| `standard` | 원문 그대로. wave마다 post-wave critic을 돌리고, 더 할 일이 없으면 별도의 final-clean critic을 한 번 더 쓴다[](source:skm-profiles)[](source:hun-loop) | Phase 3과 Phase 5를 서로 다른 verifier가 따로 한다[](source:val-p5) | 진입면·신뢰 경계·subsystem·attack class 조합마다 한 단위[](source:rec-ledger) |
| `deep` | critic wave를 더 찾을 일이 없을 때까지 돌린다[](source:skm-profiles) | 후보 검증과 최종 기록 검증을 서로 다른 새 agent가 맡고, `prior_covered_same_source` 단위에는 독립된 두 번째 점검을 준다[](source:skm-profiles) | subsystem과 lifecycle 모드별로 나눈다[](source:skm-profiles) |



## 다른 페이지 {#pages span=12}

- [개요: 파일 구조와 6단계 흐름](overview.html)
- [사냥: hunter wave와 critic](hunt.html)
- [검증과 보고: Phase 3~6](verify.html)
- [강제 규칙과 금지 목록](rules.html)
