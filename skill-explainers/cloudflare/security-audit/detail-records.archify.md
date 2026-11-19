# findings.json과 검증기 — 판정을 형식에 맞춰 기록하고 두 검증기로 확인한다 {#detail-records}

[개요](page:security-audit.html)의 `findings 작성` 노드, 곧 Phase 4를 자세히 본다. 시작 입력은 verifier가 판정한 record와 coverage ledger이고 끝 출력은 fingerprint 순으로 정렬한 `findings.json`이다. 검증기 두 개가 통과하면 개요의 `최종 검증`으로 간다.[](source:val-p4-write)

- `confirmed`, `needs_validation`, `rejected` record를 모두 `findings.json`에 쓴다.[](source:val-p4-write)
- schema는 `additionalProperties: false`다. hunter의 wrapper 필드를 record에 옮기지 않는다.[](source:val-p4-schema)
- 검증기 성공은 형식과 ledger 일관성만 증명한다.[](source:val-p4-run)

@answer scope="cloudflare/security-audit · VALIDATION-AND-REPORTING.md 95~118줄, report-schema.json, 검증기 두 개 · 지시상 동작과 코드 확인"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source val-p4-write title="findings.json 작성" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=97:101
@source val-p4-schema title="verdict별 계약" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=103:109
@source val-p4-run title="검증기 실행과 한도" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=111:118
@source sch-conf title="confirmed branch 필수 필드" path=cloudflare/security-audit/report-schema.json lines=243:243
@source sch-nv title="needs_validation branch 필수 필드" path=cloudflare/security-audit/report-schema.json lines=360:360
@source sch-rej title="rejected branch 필수 필드" path=cloudflare/security-audit/report-schema.json lines=456:456
@source sch-cond title="conditions kind enum" path=cloudflare/security-audit/report-schema.json lines=107:107
@source vf-limits title="findings 검증기 한도" path=cloudflare/security-audit/validate-findings.cjs lines=42:49
@source vf-sem title="verdict별 의미 검사" path=cloudflare/security-audit/validate-findings.cjs lines=548:579
@source vf-fp title="fingerprint 중복·정렬 검사" path=cloudflare/security-audit/validate-findings.cjs lines=496:506
@source vf-run title="findings 검증기 실행 진입점" path=cloudflare/security-audit/validate-findings.cjs lines=703:757
@source vl-limits title="ledger 검증기 한도" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=13:21
@source vl-run title="ledger 검증기 실행 진입점" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=808:853
@source vf-open title="no-follow·nonblocking 입력 보호 확인" path=cloudflare/security-audit/validate-findings.cjs lines=604:612
@source vlt-top title="시험 파일의 안전 입력 조건" path=cloudflare/security-audit/validate-findings.test.cjs lines=16:24

## 어떻게 동작하나 {#detail span=12}

parent가 독립적으로 판정된 모든 record를 `<output-dir>/findings.json`에 fingerprint 순으로 쓴다. 담는 것은 세 가지다.[](source:val-p4-write)

- `confirmed`는 완전한 local 실행 증거, 조건, 구체적 수정안, likelihood·impact·전체 severity, confidence가 있는 취약점이다.
- `needs_validation`은 정확한 미해결 blocker와 local 또는 소유자 관찰 배포 계획이 하나 이상 있는 후보다.
- `rejected`는 검증 중 반박된 후보다. 이후 실행이 바뀐 증거 없이 같은 주장을 반복하지 않게 남긴다.

그림에서 생략한 것은 검증기 오류를 고쳐 다시 쓰는 반복 하나다. 원문은 구조·의미 오류를 모두 고친 뒤에 다음 단계로 가라고 한다.[](source:val-p4-run)

@workflow id=records-flow title="Phase 4 findings.json"
| read | schema 읽기 | database | source:val-p4-schema |
| write | record 기록 | database | source:val-p4-write |
| check | 검증기 두 개 | security | source:val-p4-run |
| fix | 오류 있음? | security | source:val-p4-run |
| read > write | |
| write > check | |
| check > fix | |
| fix > write | 있음, 수정 |

@steps id=records-steps
| w-read | schema 읽기 | **입력** 쓸 record 목록 · **참조** `report-schema.json` · **출력** verdict별 필드 계약. **처리** parent가 쓰기 직전에 schema를 읽는다. schema는 `additionalProperties: false`라서 hunter의 wrapper 필드를 record에 옮기지 않는다.[](source:val-p4-schema) | records-flow | read |
| w-write | record 기록 | **입력** 판정된 record · **출력** fingerprint 순으로 정렬한 `findings.json`. **처리** parent가 verdict별 계약을 지켜 기록한다. 모든 record는 안정적인 fingerprint, title, description, 저장소 상대 소스 경로를 갖는다.[](source:val-p4-schema) | records-flow | write |
| w-check | 검증기 두 개 | **입력** `findings.json`, `coverage-ledger.json` · **참조** `report-schema.json` · **실행** `node <skill-dir>/validate-findings.cjs <output-dir>/findings.json`, `node <skill-dir>/validate-coverage-ledger.cjs <output-dir>/coverage-ledger.json` · **출력** `PASS`나 오류 목록. **처리** 검증기가 구조와 의미 오류를 찾는다. 성공은 형식과 ledger 일관성만 증명한다.[](source:val-p4-run) → 내부: `validate-findings.cjs`는 같은 폴더의 `report-schema.json`을 읽어 검사하고, `validate-coverage-ledger.cjs`는 schema를 읽지 않는다(코드 확인).[](source:vf-run)[](source:vl-run) | records-flow | check |
| w-fix | 오류 있음? | **입력** 검증기 출력 · **출력** 진행 또는 수정. **처리** parent가 오류를 모두 고쳐 다시 쓴다. **다음** 오류가 없으면 개요의 `최종 검증`으로 간다.[](source:val-p4-run) | records-flow | fix |

**세 verdict의 record는 어떻게 다르게 생겼나**

각 record는 `verdict` 값에 따라 세 branch 중 하나와 정확히 맞아야 한다. 원문은 세 계약을 섞지 말라고 한다.[](source:val-p4-schema)

| verdict | 필수 필드 | 쓰면 안 되는 필드 | 출처 |
| --- | --- | --- | --- |
| `confirmed` | `verdict`, `fingerprint`, `title`, `description`, `root_cause`, `intended_behavior`, `trace`, `evidence`, `conditions`, `execution`, `remediation`, `severity`, `confidence` | `claimed_root_cause`, `blockers`, `validation_plan`, `reason` | [](source:sch-conf) [](source:val-p4-schema) |
| `needs_validation` | `verdict`, `fingerprint`, `title`, `description`, `claimed_root_cause`, `trace`, `evidence`, `blockers`, `validation_plan` | `severity`, `execution`, `remediation`, `reason`, `root_cause` | [](source:sch-nv) [](source:val-p4-schema) |
| `rejected` | `verdict`, `fingerprint`, `title`, `description`, `claimed_root_cause`, `trace`, `evidence`, `reason` | `severity`, `execution`, `remediation`, `blockers`, `validation_plan`, `root_cause` | [](source:sch-rej) [](source:val-p4-schema) |

세부 규칙은 원문 이 절에 있다.[](source:val-p4-schema)

- `confirmed`의 `execution`은 target 중립이고 target의 native 인터페이스(API·HTTP 입력, CLI 호출, library 호출, message, 파일 fixture, browser 동작, 렌더한 policy, local harness)를 쓴다. `observed_result`는 비어 있지 않고 사실이어야 한다.
- `needs_validation`은 `validation_plan.local`이나 `validation_plan.deployment` 중 비어 있지 않은 것이 하나 이상 있어야 한다. 두 맥락이 서로 다른 사실을 풀 수 있을 때만 둘 다 쓴다.
- 여러 단계의 `trace`는 `entrypoint`로 시작해 `sink`로 끝나고 중간에만 `propagation`을 쓴다. 한 항목짜리 trace는 `entrypoint`나 `sink`다.
- 전체 severity는 증명된 impact를 넘을 수 없다.

코드로 확인한 schema 값은 이렇다.

@facts id=schema-values
| 최상위 | `type: "array"`, `items.oneOf`에 세 branch. 구분 필드는 `verdict`이고 값은 `confirmed`, `needs_validation`, `rejected`(`report-schema.json` 1~9줄에서 확인) |
| `severity`·`impact`·`likelihood`의 score | `informational`, `low`, `medium`, `high`, `critical` 중 하나(원문 191·207·220줄) |
| `confidence.score` | `low`, `medium`, `high` 중 하나(원문 229~232줄) |
| `conditions[].kind` | `authentication_level`, `authorization_role`, `user_interaction`, `system_configuration`, `network_routing`, `environmental_dependency`, `data_state`, `timing_dependency`, `third_party_dependency`[](source:sch-cond) |

**검증기 두 개는 각각 무엇을 검사하나**

두 검증기는 모두 `node <파일> <입력 JSON 경로>` 하나로 돌고 flag가 없다. 아래 내용은 실행 진입점과 상단 선언, 표시한 줄을 읽어 확인했다.

| 항목 | `validate-findings.cjs` | `validate-coverage-ledger.cjs` |
| --- | --- | --- |
| 읽는 파일 | argv의 `findings.json`과 같은 폴더의 `report-schema.json`(경로 고정)[](source:vf-run) | argv의 ledger 하나뿐. schema를 읽지 않고 규칙을 코드에 둔다(코드 확인: `require`는 `fs`·`path`·`util`뿐) |
| 성공 출력 | stdout `PASS: <n> findings valid`, 종료 코드 0[](source:vf-run) | stdout `PASS: <n> coverage units valid`, 종료 코드 0[](source:vl-run) |
| 실패 출력 | stderr에 `ERROR: <msg>` 줄과 `FAIL: <n> validation error(s)`, 종료 코드 1. 오류는 100개까지[](source:vf-run) | 같은 형식, 종료 코드 1[](source:vl-run) |
| 입력 한도 | 5 MiB, 중첩 64, 배열 항목 1,000, 오류 100(그 밖에 canonical key 1 MiB, 고유 set 5 MiB)[](source:vf-limits) | 5 MiB, unit 10,000, 중첩 컬렉션 항목 1,000, 객체 필드 1,000, 중첩 64, 순회 값 500,000, 오류 100[](source:vl-limits) |
| 의미 검사 | fingerprint 중복 금지와 사전순 정렬[](source:vf-fp), verdict별 금지 필드와 필수 내용, `confirmed`의 전체 severity가 impact를 넘지 않을 것, `needs_validation`에 local이나 deployment 계획 하나 이상, trace 순서, 경로 안전성[](source:vf-sem) | 필수 필드 19개(`REQUIRED_FIELDS`), `coverage_id` 재계산 일치(`canonicalCoverageId`), 상태별 불변식, check의 `method`·`artifact` 규칙, 재배정 기록(`attempts`) 규칙. 뒤의 세 가지는 시험 이름으로만 확인했다 |
| 외부 process·network | 없음(코드 확인: `require`는 `fs`·`path`·`util`뿐) | 없음(코드 확인: `require`는 `node:fs`·`node:path`·`node:util`뿐) |

`findings.json` 검증기는 입력을 연 뒤 JSON text 스캔으로 중첩과 배열 한도를 먼저 보고, `JSON.parse`한 뒤에 schema 검사와 의미 검사를 한다. schema 해석기는 자체 구현이고 `oneOf`에서 정확히 한 branch만 통과해야 하며, 지원하지 않는 keyword가 schema에 있으면 검사 전에 거부한다(코드 확인).

검증기 성공이 뜻하는 범위는 좁다. 원문은 "검증기 성공은 형식과 ledger 일관성만 증명한다"고 적는다.[](source:val-p4-run) 소스 주장이 맞는지는 Phase 5 verifier가 본다.

@callout level=open-question title="코드로 확인한 플랫폼 제약. Windows에서 실제로 걸리는지는 실행하지 않아 확인하지 못했다"
| 두 검증기는 `O_NOFOLLOW`와 `O_NONBLOCK`이 없거나 0인 플랫폼에서 모든 입력을 `OS no-follow and nonblocking input protection is unavailable`로 거부한다.[](source:vf-open) |
| 시험 파일도 같은 조건(`HAS_SAFE_INPUT_OPEN`)으로 CLI 사례를 건너뛴다.[](source:vlt-top) 이 조건이 Windows에서 참인지는 원문에 명시 없음이다. |

시험 파일 두 개는 `node:test`를 쓴다(코드 확인). 스킬 원문이 시험을 실행하라고 지시한 곳은 원문에 명시 없음이다.

## 다른 페이지 {#pages span=12}

- [개요](page:security-audit.html)
- [후보 검증](page:security-audit.verify.html)
- [최종 검증과 보고서](page:security-audit.final.html)
