# 후보는 어떻게 확정되고 어떤 파일로 보고되나 {#security-audit-verify}

Phase 3~6에서 사냥하지 않은 새 verifier가 후보를 반박해 보고, 살아남은 기록만 `findings.json`과 보고서 세 개로 남는다.[](source:val-p3)[](source:val-p6)

- `confirmed`만 심각도를 받고, `needs_validation`은 저장소 밖 사실에 막힌 상태이며 심각도가 없다.[](source:skm-priority)[](source:val-decide)
- 검증기 둘의 통과는 형식과 ledger 일관성만 증명한다.[](source:val-p4)
- `confirmed`의 독립 검토는 어느 프로필에서도 건너뛰지 않는다.[](source:val-p5)

@answer scope="cloudflare/security-audit · VALIDATION-AND-REPORTING.md, report-schema.json, 검증 스크립트"
@meta locale=ko
@source skm-isolation title="쓰기 격리" path=cloudflare/security-audit/SKILL.md lines=54:66
@source skm-repro title="재현 기록과 run-metadata" path=cloudflare/security-audit/SKILL.md lines=84:86
@source skm-priority title="심각도와 확실성 분리" path=cloudflare/security-audit/SKILL.md lines=150:162
@source skm-workflow title="6단계와 종료 상태" path=cloudflare/security-audit/SKILL.md lines=168:179
@source rec-arch title="architecture.md와 companion 선택" path=cloudflare/security-audit/RECONNAISSANCE.md lines=73:88
@source rec-ledger title="ledger와 coverage_id" path=cloudflare/security-audit/RECONNAISSANCE.md lines=90:102
@source rec-state title="상태 표와 검증기 실행" path=cloudflare/security-audit/RECONNAISSANCE.md lines=141:156
@source val-p3 title="Phase 3 검증 배정" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=3:7
@source val-prompt title="verifier 지시문" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=9:46
@source val-decide title="판정 승격·강등·기각" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=87:93
@source val-p4 title="findings.json 작성" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=95:118
@source val-p5 title="최종 기록 검증" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=120:149
@source val-p6 title="보고서 세 개" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=151:186
@source sch-conf title="confirmed 분기" path=cloudflare/security-audit/report-schema.json lines=7:245
@source sch-nv title="needs_validation 분기" path=cloudflare/security-audit/report-schema.json lines=247:362
@source sch-rej title="rejected 분기" path=cloudflare/security-audit/report-schema.json lines=364:458
@source vf-limits title="입력 상한" path=cloudflare/security-audit/validate-findings.cjs lines=42:49
@source vf-read title="입력 파일 읽기" path=cloudflare/security-audit/validate-findings.cjs lines=604:649
@source vf-semantic title="의미 검사" path=cloudflare/security-audit/validate-findings.cjs lines=485:583
@source vf-run title="실행 진입점" path=cloudflare/security-audit/validate-findings.cjs lines=703:757
@source vft-branches title="분기 시험" path=cloudflare/security-audit/validate-findings.test.cjs lines=151:162
@source vft-align title="검증기 간 정렬 시험" path=cloudflare/security-audit/validate-findings.test.cjs lines=574:652
@source vl-limits title="입력 상한" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=13:21
@source vl-fields title="필수 필드와 상태 값" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=26:81
@source vl-id title="coverage_id 계산" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=354:375
@source vl-checks title="검사 기록 검증" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=421:451
@source vl-state title="상태별 불변식" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=518:566
@source vl-attempts title="재배정 기록 검증" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=568:644
@source vl-doc title="문서 단위 검사" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=761:806
@source vl-run title="실행 진입점" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=808:853
@source vlt-state title="상태 시험" path=cloudflare/security-audit/validate-coverage-ledger.test.cjs lines=330:405
@source vlt-reassign title="재배정 시험" path=cloudflare/security-audit/validate-coverage-ledger.test.cjs lines=407:491

## Phase 3부터 보고서까지 어떻게 흐르나 {#flow span=12}

개요의 6~10번째 단계를 자세히 본다. 전체 그림은 [개요](overview.html)에 있다.

@workflow id=verify-flow title="검증과 보고"
| verify | Phase 3 후보 검증 | backend |
| write | Phase 4 findings.json | backend |
| valid | 검증기 둘 통과? | backend |
| final | Phase 5 최종 기록 검증 | backend |
| report | Phase 6 보고서 | backend |
| verify > write | | emphasis |
| write > valid | | emphasis |
| valid > write | 오류 |
| valid > final | 통과 | emphasis |
| final > report | | emphasis |

@steps id=verify-steps
| s-verify | Phase 3 후보 검증 | `VALIDATION-AND-REPORTING.md`를 읽는다. parent가 후보를 fingerprint로 합친 뒤, 고유한 후보마다 그 후보를 사냥하지 않은 새 `general` verifier를 배정한다. 지시문은 `You did not write this candidate. Try to refute it`로 시작한다.[](source:val-p3)[](source:val-prompt) verifier는 인용된 소스 위치를 모두 다시 읽고 `confirmed`·`needs_validation`·`rejected` 중 하나를 돌려준다. 완전한 경로와 제한된 관찰 결과를 독립적으로 세우면 `confirmed`, 배포 같은 저장소 밖 사실이 결정적이면 `needs_validation`, 소스나 로컬 동작이 반박하면 `rejected`다.[](source:val-decide) | verify-flow | verify |
| s-write | Phase 4 findings.json | parent가 판정이 난 기록을 fingerprint 순으로 `findings.json`에 쓴다. 쓰기 직전에 `report-schema.json`을 읽는다. 스키마는 `additionalProperties: false`라서 hunter 래퍼 필드를 그대로 가져오면 안 된다.[](source:val-p4) | verify-flow | write |
| s-valid | 검증기 둘 통과? | parent가 `validate-findings.cjs`와 `validate-coverage-ledger.cjs`를 돌리고 오류를 모두 고친 뒤에야 다음으로 간다. 그림의 `오류` 간선이 이 되돌림이다.[](source:val-p4) 원문은 통과가 형식과 ledger 일관성만 증명한다고 적는다. 판정: 두 스크립트는 각자 파일 하나만 받으므로 fingerprint와 ledger unit을 서로 대조하는 검사는 코드에 보이지 않는다.[](source:vf-run)[](source:vl-run) | verify-flow | valid |
| s-final | Phase 5 최종 기록 검증 | 기록마다 새 `research` verifier가 구조화된 기록을 다시 확인해 `verified` 또는 대체 기록 제안(`replace`)을 돌려준다.[](source:val-p5) 더 강한 판정으로 올리거나 근본 원인·영향·심각도를 실질적으로 바꾸는 대체는, hunt도 Phase 3 검증도 하지 않은 또 다른 새 verifier가 재확인해야 적용한다. 예산이나 독립성이 없으면 그 기록을 `findings.json`에서 빼고 `incomplete`로 기록한다.[](source:val-p5) | verify-flow | final |
| s-report | Phase 6 보고서 | Phase 5를 통과한 기록만으로 parent가 `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md`를 쓴다. 보고서 문장은 판정, 심각도, 막힌 이유를 바꾸지 못한다.[](source:val-p6) 깨끗한 실행은 `confirmed`가 0개일 수 있고 LOW 지적을 지어내지 않는다.[](source:val-p6) 모든 산출물을 쓰고 두 검증기가 통과하면 끝난다.[](source:skm-workflow) | verify-flow | report |


## 세 판정은 어떻게 다른가 {#verdicts span=12}

판정은 같은 `findings.json` 배열 안의 세 분기이고, 심각도는 `confirmed`에만 붙는다. `needs_validation`은 확신이 낮은 취약점을 두는 자리가 아니라, 소스에 근거한 경계 가설이 저장소 밖 사실에 막힌 상태다.[](source:skm-priority)

| 판정 | 언제 | 심각도 | 보고서에서 |
| --- | --- | --- | --- |
| `confirmed` | 소스 경로와 제한된 로컬 근거로 경계 위반과 의미 있는 결과가 입증됨[](source:skm-priority) | 있다. 입증된 영향을 넘지 못한다[](source:skm-priority) | `REPORT.md` 표와 상세. `medium` 이상은 `FINDINGS-DETAIL.md`에도 들어간다[](source:val-p6) |
| `needs_validation` | 결정적 사실이 저장소 밖(배포 설정 등)에 있어 막힘[](source:skm-priority) | 없다[](source:vf-semantic) | `NEEDS-VALIDATION.md`. 소유자가 관찰할 안전한 확인 계획이 붙는다[](source:val-p6) |
| `rejected` | 소스나 로컬 동작이 주장을 반박함[](source:val-decide) | 없다[](source:vf-semantic) | 바뀐 근거 없이 같은 주장이 다시 나오지 않도록 `findings.json`에 남긴다[](source:val-p4) |


## 산출물과 검증기 {#outputs span=12}


전체 감사는 출력 폴더에 공유 파일 일곱 개와 agent별 폴더를 만든다. 공유 파일은 parent만 쓴다.[](source:skm-isolation)

| 파일 | 만드는 시점 | 담는 것 |
| --- | --- | --- |
| `run-metadata.json` | 위임 전 | `run_id`, `repo`, `target`, `source_ref`, `profile`, `scope_paths`, `budget`, 실행 정책, 선택한 companion, 이전 실행 경로, `run_status`[](source:skm-repro) |
| `architecture.md` | Phase 1 | 제품·주체·진입면·신뢰 경계·companion 선택 요약. 약 1,000단어 상한[](source:rec-arch) |
| `coverage-ledger.json` | Phase 1에서 시딩 후 parent가 갱신 | 조사 범위의 유일한 주장. 단위마다 상태·검사·fingerprint를 기록[](source:rec-ledger)[](source:rec-state) |
| `findings.json` | Phase 4 | 독립 판정을 받은 `confirmed`·`needs_validation`·`rejected` 기록, fingerprint 순[](source:val-p4) |
| `REPORT.md` | Phase 6 | 프로필·범위·커버리지·`confirmed` 표와 상세·`NEEDS VALIDATION` 표[](source:val-p6) |
| `FINDINGS-DETAIL.md` | Phase 6 | `medium` 이상 `confirmed`의 전체 trace와 재현[](source:val-p6) |
| `NEEDS-VALIDATION.md` | Phase 6 | 해결되지 않은 기록마다 trace·막힌 이유·해결 계획[](source:val-p6) |
| `agents/<agent-id>/` | agent 배정 전 | `scratch/`는 agent가 쓰고 `artifacts/`는 parent의 승격 코드만 쓴다[](source:skm-isolation) |

`confirmed`·`needs_validation`·`rejected`는 같은 JSON 배열 안의 세 분기이고 쓰는 필드가 서로 다르다.

| 항목 | `confirmed` | `needs_validation` | `rejected` |
| --- | --- | --- | --- |
| 공통 필드 | `fingerprint`, `title`, `description`, `trace`, `evidence`[](source:sch-conf) | 같음[](source:sch-nv) | 같음[](source:sch-rej) |
| 고유 필드 | `root_cause`, `intended_behavior`, `conditions`, `execution`, `remediation`, `severity`, `confidence`[](source:sch-conf) | `claimed_root_cause`, `blockers`, `validation_plan`[](source:sch-nv) | `claimed_root_cause`, `reason`[](source:sch-rej) |
| 심각도 | 있다. `likelihood`·`impact`·`overall_severity`를 다섯 단계 값으로 적는다[](source:sch-conf) | 없다[](source:vf-semantic) | 없다[](source:vf-semantic) |
| 검증 계획 | 해당 없음 | `local`·`deployment` 중 하나 이상[](source:vf-semantic) | 해당 없음 |

스키마 모양은 이렇다. `trace` 항목의 `kind`는 `entrypoint`·`propagation`·`sink`이고 `execution`은 `attacker_perspective`, `payloads`, `instructions`, `observed_result`를 모두 요구한다. `conditions`의 `kind`는 아홉 가지(`authentication_level`, `authorization_role`, `user_interaction`, `system_configuration`, `network_routing`, `environmental_dependency`, `data_state`, `timing_dependency`, `third_party_dependency`) 중 하나다. `confidence.score`는 `low`·`medium`·`high`이고 모든 분기에서 `additionalProperties`가 `false`다.[](source:sch-conf)[](source:sch-nv)[](source:sch-rej)

검증기 둘은 parent가 돌리는 CLI 스크립트다. 인자는 JSON 파일 경로 하나이고 통과하면 `PASS`와 개수를 출력한다.[](source:vf-run)[](source:vl-run)

`validate-findings.cjs`는 `report-schema.json`을 같은 폴더에서 읽어 구조를 검사한 뒤 의미를 검사한다. 입력은 symlink가 아닌 regular file이어야 하고 UTF-8이어야 하며 no-follow·nonblocking으로 연다.[](source:vf-read)[](source:vf-run) 의미 검사 항목은 다음과 같다.[](source:vf-semantic)

- fingerprint 중복 금지와 사전순 정렬
- `file`·`file_name`이 저장소 상대의 안전한 경로인지(절대 경로, `..`, `:`, Windows 예약 이름, 제어 문자 거부)
- `trace`의 `entrypoint`→`propagation`→`sink` 모양(한 줄이면 `entrypoint` 또는 `sink`)
- 분기별 금지 필드
- `overall_severity`가 `impact`를 넘지 않는지

`validate-coverage-ledger.cjs`는 단위마다 다음을 검사한다.

- 필수 필드 열아홉 개가 모두 있는지[](source:vl-fields)
- `canonical_refs`로 `coverage_id`를 다시 계산해 일치하는지, 단위가 `coverage_id` 사전순인지, 같은 ID나 같은 의미 조합이 중복되지 않는지[](source:vl-id)[](source:vl-doc)
- 상태 여덟 가지마다 `agent_id`, `reviewed_paths`, `local_checks`, `result_fingerprints`, `unresolved`가 비어 있거나 차 있어야 하는 조건. 이 조건은 정찰 문서의 상태 표와 같다.[](source:vl-state)[](source:rec-state)
- `local` 검사는 `agents/<검사의 agent_id>/artifacts/` 아래 경로여야 하고 `source` 검사는 `artifact`가 `null`이어야 한다.[](source:vl-checks)
- 재배정 기록은 `wave`가 엄격히 증가하고 소유자와 artifact가 이전 시도와 겹치지 않는지 본다.[](source:vl-attempts)

판정: 코드에는 그 artifact 경로의 파일이 실제로 있는지 여는 줄이 없어서 경로 문자열의 형식만 본다.[](source:vl-checks)

| 검증기 | 입력 상한 | 항목 상한 | 중첩 깊이 | 오류 출력 |
| --- | --- | --- | --- | --- |
| `validate-findings.cjs` | 5 MiB[](source:vf-limits) | 배열마다 1,000개[](source:vf-limits) | 64[](source:vf-limits) | 100개[](source:vf-limits) |
| `validate-coverage-ledger.cjs` | 5 MiB[](source:vl-limits) | unit 10,000개, 중첩 컬렉션 1,000개, 전체 값 500,000개[](source:vl-limits) | 64[](source:vl-limits) | 100개[](source:vl-limits) |

두 검증기에는 각각 시험 파일이 있다. `validate-findings.test.cjs`는 스키마가 세 분기를 가진 최상위 배열이라는 점과, 두 검증기가 같은 정규식·상한·경로 판정을 쓰는지를 확인하는 시험을 담는다.[](source:vft-branches)[](source:vft-align) `validate-coverage-ledger.test.cjs`는 상태 불변식과 재배정 시 소유자 재사용 금지를 시험한다.[](source:vlt-state)[](source:vlt-reassign) 이 시험들은 실행하지 않았으므로 통과 여부는 확인하지 않았다.


## 다른 페이지 {#pages span=12}

- [개요: 파일 구조와 6단계 흐름](overview.html)
- [정찰과 시작 전 결정](recon.html)
- [사냥: hunter wave와 critic](hunt.html)
- [강제 규칙과 금지 목록](rules.html)
