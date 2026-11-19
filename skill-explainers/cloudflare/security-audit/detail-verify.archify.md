# 후보 검증 — 그 후보를 사냥하지 않은 verifier가 반박해 본다 {#detail-verify}

[개요](page:security-audit.html)의 `후보 검증` 노드, 곧 Phase 3을 자세히 본다. 시작 입력은 Phase 2가 통합한 후보와 carry한 이전 `confirmed` record이고 끝 출력은 fingerprint마다 하나의 최종 record와 ledger에 기록된 판정이다. 이후 개요의 `findings 작성`으로 간다.[](source:val-p3)

- verifier는 그 후보를 사냥하지 않은 새 `general` agent다.[](source:val-p3)
- verifier는 다른 verifier의 결론을 받지 않는다.[](source:val-p3)
- `needs_validation`은 추측을 맡겨 두는 곳이 아니다. 소스가 반박하면 `rejected`다.[](source:val-decide)

@answer scope="cloudflare/security-audit · VALIDATION-AND-REPORTING.md 3~93줄 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source val-p3 title="Phase 3 배정" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=3:7
@source val-quick title="quick 프로필은 Phase 3과 5를 합친다" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=124:124
@source val-pre title="verifier 지시문 서문" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=11:22
@source val-items title="verifier 지시문 여섯 항목" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=24:46
@source val-ident title="승격 절차 block을 지시문에 복사" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=48:49
@source val-decide title="승격·강등·기각" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=87:87
@source val-parent title="parent의 병합" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=89:89
@source val-ledger title="ledger check 갱신" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=91:91
@source val-budget title="예산 부족 시" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=93:93

## 어떻게 동작하나 {#detail span=12}

그림은 후보 하나가 지나는 경로다. 후보는 서로 독립이라 verifier를 후보마다 따로 띄운다.[](source:val-p3) 그림에서 생략한 것이 둘 있다.

- 결과 형식이 깨졌을 때의 되돌림. 앞뒤 설명이 붙었거나 형식이 깨진 결과는 고치지 않고 버리고, 예산이 되면 새 verifier로 그 후보를 다시 돌린다. `판정 병합` 설명에 있다.[](source:val-parent)
- quick에서는 이 verifier가 Phase 5의 record 검사까지 함께 맡는다. 그 규칙은 `security-audit.final.html`에 있다.[](source:val-quick)

@workflow id=verify-flow title="Phase 3 후보 검증"
| pick | 후보 통합 | backend | source:val-p3 |
| assign | verifier 배정 | backend | source:val-p3 |
| refute | verifier 반박 | security | source:val-items |
| merge | 판정 병합 | database | source:val-parent |
| pick > assign | |
| assign > refute | |
| refute > merge | |

@steps id=verify-steps
| v-pick | 후보 통합 | **입력** Phase 2 후보, 같은 소스의 이전 `confirmed` carry record · **출력** fingerprint와 root cause로 합친 후보 목록. **처리** parent가 clean critic pass나 기록된 조기 종료 뒤에 후보를 합치고, 고유한 `confirmed`·`needs_validation` 제안마다 사냥하지 않은 새 `general` verifier를 정한다. carry한 이전 `confirmed`도 hunter 제외 대상이지만 같은 현재 검증 경로를 거친다.[](source:val-p3) | verify-flow | pick |
| v-assign | verifier 배정 | **입력** 후보 하나 · **참조** `report-schema.json`, 관련 도메인 지침의 `Validation rules` · **출력** verifier 지시문과 `<output-dir>/agents/<verifier-id>/`. **처리** parent가 소문자 고유 ID와 `scratch/`, parent 소유 `artifacts/`를 주고, 후보·연결된 unit의 check와 artifact 경로·해석에 필요한 architecture 사실·`Validation rules`·승격 절차·실행 경계·세 verdict branch 원문·같은 fingerprint의 이전 record만 넘긴다. 다른 verifier의 결론은 주지 않는다.[](source:val-p3) | verify-flow | assign |
| v-refute | verifier 반박 | **입력** 지시문 · **참조** 인용된 현재 소스 위치 · **실행** 샌드박스 안의 local check(재현 가능할 때만) · **출력** `{"decision": "confirmed\|needs_validation\|rejected", "record": ...}` 하나. **처리** verifier가 이 후보를 쓰지 않은 입장에서 소스와 제한된 local 증거로 반박해 본다. `scratch/`에만 쓴다.[](source:val-pre)[](source:val-items) | verify-flow | refute |
| v-merge | 판정 병합 | **입력** verifier 결과 · **출력** fingerprint당 최종 record 하나, 연결된 모든 unit의 판정 기록. **처리** parent가 먼저 결과가 JSON 객체 하나인지 본다. 앞뒤 설명이 붙었거나 형식이 깨졌으면 고치지 않고 버리고, 예산이 되면 새 verifier로 그 후보를 다시 돌린다. 안 되면 후보는 검증되지 않은 ledger 후보로 남는다.[](source:val-parent) 채택한 결과에서는 verifier가 같은 fingerprint를 돌려줬는지 확인한다(진짜로 다른 root cause를 찾은 경우만 예외). 교정은 병합하고 판정을 연결된 모든 coverage unit에 기록한다.[](source:val-parent) **다음** 개요의 `findings 작성`으로 간다. | verify-flow | merge |

**verifier는 무엇을 확인하고 어떻게 판정하나**

지시문은 서문으로 시작한다. 서문의 뜻은 "이 후보는 네가 쓰지 않았다. repository 소스와 제한된 local 증거로 반박해 보라"이다.[](source:val-pre) 서문이 정하는 경계는 이렇다.

- 배포된 endpoint나 외부·공유 서비스에는 접속하지 않는다.
- target 코드는 승인된 OS 샌드박스 안에서만 실행한다. 통제가 하나라도 없으면 실행하지 않고 빠진 기능을 `needs_validation` blocker로 남긴다.
- 실행 뒤 scratch는 target이 통제한 것으로 취급한다. 승격은 사전 선언된 파일을 parent 쪽 코드가 승격 절차대로 할 때만 가능하고, 승격이 안 되거나 실패한 파일은 증거로 쓰지 않는다.

그다음 여섯 항목을 확인한다.[](source:val-items)

@list id=verifier-checks ordered=true
| 모든 trace와 evidence의 파일, 양의 줄 번호, 범위, 설명을 확인한다. 첫 항목이 실제 낮은 신뢰 진입점이고 마지막 항목이 주장한 sink나 경계 효과인지 본다.[](source:val-items) |
| 경로에서 소스로 보이는 가장 강한 validation, identity, authorization, normalization, lifecycle, framework, containment 통제를 다시 구성한다. architecture에 비교 대상이 적혀 있으면 같은 패턴을 공유하는지 보되 기각의 근거로 쓰지 않고 보정에만 쓴다.[](source:val-items) |
| `confirmed` 제안이면 가능할 때 최소 관찰 결과를 독립적으로 재현한다. 입력, 인터페이스 모양, 조건, 영향받는 더미 주체·자원을 확인하고, 더 강한 결과를 추정하거나 그 이후까지 이어 가지 않는다.[](source:val-items) |
| likelihood, impact, confidence, 제안한 소스 수정이 증거가 세우는 만큼만 말하는지 확인한다.[](source:val-items) |
| `needs_validation` 제안이면 blocker가 정말로 소스·local 관찰 밖인지 판단한다. 소스가 trace를 반박하면 기각하고, 빠진 사실이 여전히 결정적이면 유지하되 local 계획과 소유자 관찰 계획을 정확하고 파괴적이지 않게 만든다.[](source:val-items) |
| 같은 소스 기반 root cause에는 모든 상태에서 같은 fingerprint를 유지한다.[](source:val-items) |

verifier는 앞뒤 설명 없이 JSON 객체 하나, `{"decision": "confirmed|needs_validation|rejected", "record": { ... }}`를 돌려준다. `record`는 그 결정의 verdict branch와 정확히 일치해야 하고, 교정된 record가 hunter의 표현을 대체한다.[](source:val-items) 승격 절차 block은 hunter 지시문과 똑같이 verifier 지시문에도 원문으로 복사한다.[](source:val-ident)

판정 규칙은 이렇다.[](source:val-decide)

| 결정 | 조건 |
| --- | --- |
| `needs_validation` → `confirmed` | verifier가 완전한 경로와 제한된 관찰 결과를 독립적으로 세운 뒤에만 |
| `confirmed` 제안 → `needs_validation` | 특정 배포나 runtime 사실이 여전히 알려지지 않았을 때 강등한다 |
| `rejected` | 소스, local 동작, 보이는 통제, 의미 있는 영향 없음, 불가능한 선행 조건이 주장을 반박할 때 |
| 그 밖 | `needs_validation`은 추측성 아이디어를 두는 곳이 아니다 |

**판정은 ledger에 어떻게 반영되나**

verifier의 증거가 ledger check를 갱신할 때 규칙은 이렇다.[](source:val-ledger)

- check의 `agent_id`를 verifier의 canonical ID로 하고 비어 있지 않은 저장소 상대 `reviewed_paths`를 적는다. unit 수준 `reviewed_paths`는 check들의 합집합과 같게 유지한다.
- 소스만 검토했으면 `method: "source"`와 `artifact: null`을 쓴다. `method: "local"`은 parent 쪽 코드가 `agents/<check.agent_id>/artifacts/` 아래로 승격한 파일이 있을 때만 쓴다.
- unit은 원래 assignment owner를 유지한다. 그래서 hunter와 verifier가 독립적으로 소유한 check가 한 unit에 함께 있을 수 있다.
- carry한 이전 기록의 `planned` unit에는 이전 owner가 없다. 그것을 다시 확인한 verifier가 unit의 assignment owner가 되고, 그 재확인이 unit의 첫 check가 되어 unit이 carry한 fingerprint와 함께 `candidate`로 옮겨 간다.

strict 총 agent budget이 모든 후보를 덮지 못하면 run 상태를 incomplete로 두고 `SKILL.md`의 결정적 예산 규칙을 따른다. 검증되지 않은 후보는 ledger에만 남고 어떤 verdict로도 `findings.json`에 들어가지 않는다.[](source:val-budget)

## 다른 페이지 {#pages span=12}

- [개요](page:security-audit.html)
- [사냥](page:security-audit.hunt.html)
- [핵심 원칙과 심각도 기준](page:security-audit.principles.html)
- [findings.json과 검증기](page:security-audit.records.html)
