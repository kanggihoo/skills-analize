# 최종 검증과 보고서 — 기록을 새 눈으로 다시 확인하고 보고서 세 개를 파생한다 {#final-detail}

이 페이지는 개요의 `최종 검증`과 `보고서` 노드, 곧 Phase 5와 Phase 6을 맡는다. 시작 입력은 `findings.json`의 `confirmed`·`needs_validation` record와 ledger다. 끝 출력은 `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md`다. 별개의 root cause가 나오면 개요의 `후보 검증`으로 돌아가고, 감사는 종료 상태 둘 중 하나로 끝난다.[](source:val-p5-after)

@answer scope="cloudflare/security-audit · VALIDATION-AND-REPORTING.md 120~186줄 · 지시상 동작"
@meta locale=ko
@source val-p5-intro title="Phase 5 배정과 quick 병합" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=122:124
@source val-p5-conf title="confirmed 확인 항목" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=126:133
@source val-p5-nv title="needs_validation 확인 항목" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=135:141
@source val-p5-ret title="Phase 5 결과 형식" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=143:143
@source val-p5-mat title="중대한 교체의 재검증" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=145:145
@source val-p5-after title="교체 뒤 처리와 complete 조건" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=147:147
@source val-p5-all title="needs_validation도 검증한다" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=149:149
@source val-p6-intro title="보고서의 전제" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=153:153
@source val-report title="REPORT.md" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=155:167
@source val-detail title="FINDINGS-DETAIL.md" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=169:178
@source val-nvmd title="NEEDS-VALIDATION.md" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=180:182
@source val-native title="native 인터페이스와 보고서 분량" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=184:186
@source skm-end title="종료 상태 둘" path=cloudflare/security-audit/SKILL.md lines=179:179

## 최종 검증은 어떤 순서로 돌고 보고서로 이어지나 {#flow span=12}

record마다 새 `research` verifier를 병렬로 하나씩 띄운다. 이 verifier는 hunter의 설명이 아니라 구조화된 record를 검사하고 소스·local 경계를 지킨다.[](source:val-p5-intro) 그림에서 생략한 것이 셋 있다.

- 별개의 root cause를 찾으면 새 fingerprint를 붙여 독립 후보 검증을 거친 뒤에야 포함한다.[](source:val-p5-after)
- 중대한 교체를 새 verifier로 검증할 예산이나 독립성이 없으면, 논쟁 중인 record를 `findings.json`에서 빼고 ledger unit을 미해결 후보로 둔다. 그리고 `run_status: "incomplete"`와 정확한 `incomplete_reason`을 기록한다.[](source:val-p5-mat)
- quick에서는 Phase 3 verifier가 이 검사를 함께 맡는다. 그래서 후보당 독립 검토자가 하나뿐이고, 어떤 profile에서도 `confirmed` record의 독립 검토는 생략하지 않는다.[](source:val-p5-intro)

@workflow id=final-flow title="Phase 5 최종 검증과 Phase 6 보고"
| verify | 최종 verifier | security | source:val-p5-intro |
| replace | 교체 제안? | security | source:val-p5-ret |
| material | 중대한 교체? | security | source:val-p5-mat |
| reverify | 새 verifier 재검증 | security | source:val-p5-mat |
| apply | 교체 적용 | database | source:val-p5-after |
| report | 보고서 세 개 | frontend | source:val-report |
| verify > replace | |
| replace > report | verified | emphasis |
| replace > material | replace |
| material > apply | 경미 |
| material > reverify | 중대 | emphasis |
| reverify > apply | verified |
| reverify > material | 또 교체 |
| apply > report | |

@steps id=final-steps
| f-verify | 최종 verifier | **입력** `findings.json`의 `confirmed`·`needs_validation` record · **참조** 소스 위치·schema·ledger · **출력** `{"decision":"verified","fingerprint":"..."}` 또는 `{"decision":"replace","reason":"...","record":{...}}` 하나. **처리** record마다 새 verifier가 아래 확인 항목으로 record를 점검한다. `needs_validation`도 대상이다.[](source:val-p5-intro)[](source:val-p5-all) | final-flow | verify |
| f-replace | 교체 제안? | **입력** verifier 결과 · **출력** 채택, 교체 검토, 폐기. **처리** parent가 결과를 읽는다. 앞뒤 설명이 붙었거나 형식이 깨졌으면 고치지 않고 버리고 예산이 되면 새 verifier로 다시 돌린다. 교체 record는 `confirmed`, `needs_validation`, `rejected` branch 중 하나와 맞아야 한다.[](source:val-p5-ret) | final-flow | replace |
| f-material | 중대한 교체? | **입력** 교체 record · **출력** 중대 여부 판정. **처리** 더 강한 verdict로 올리는 교체(`confirmed` 승격 포함)이거나 root cause, trace, 실행 입력, 관찰 결과, 영향, severity를 실질적으로 바꾸면 중대한 교체로 본다. 중대한 교체는 그대로 최종이 될 수 없다.[](source:val-p5-mat) 의미나 증거를 바꾸지 않는 문구·줄 번호 교정은 바로 적용해도 된다.[](source:val-p5-mat) | final-flow | material |
| f-reverify | 새 verifier 재검증 | **입력** 완전한 교체 record · **출력** `verified` 또는 또 다른 교체. **처리** hunt하지 않았고 Phase 3 검증이나 교체 제안도 하지 않은 새 verifier가 현재 소스를 다시 보고, 결정적 local 결과는 실행 경계 안에서 독립 재현한 뒤 결과를 낸다.[](source:val-p5-mat) **다음** 또 중대한 교체가 나오면 새 verifier로 반복한다. | final-flow | reverify |
| f-apply | 교체 적용 | **입력** 검증을 통과한 교체 · **실행** `node <skill-dir>/validate-findings.cjs <output-dir>/findings.json`, `node <skill-dir>/validate-coverage-ledger.cjs <output-dir>/coverage-ledger.json` · **출력** 갱신된 `findings.json`, ledger 판정. **처리** 교체를 적용할 때마다 검증기 두 개를 다시 돌리고 연결된 ledger 판정을 갱신한다.[](source:val-p5-after) **다음** 모든 ledger 후보가 독립적인 최종 판정을 갖고 남은 모든 record가 Phase 5를 통과해야 `run_status`를 `complete`로 둔다.[](source:val-p5-after) | final-flow | apply |
| f-report | 보고서 세 개 | **입력** Phase 5를 통과한 모든 record·ledger·hunter의 `hardening` 노트 · **출력** `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md`. **처리** parent가 최종 record, ledger, ledger bookkeeping에 보관한 hardening 노트로 산문을 쓴다. 산문은 verdict, severity, blocker, 증명된 영향을 바꾸지 않는다.[](source:val-p6-intro) **다음** 종료 상태는 보고서가 모두 쓰이고 검증기가 둘 다 통과했거나, `incomplete`와 이유를 기록하고 빈틈을 보고서에 밝힌 것 둘뿐이다.[](source:skm-end) | final-flow | report |

## 최종 verifier는 무엇을 확인하나 {#checks span=12}

record 종류에 따라 확인 항목이 다르다.

| record | 확인 항목 | 출처 |
| --- | --- | --- |
| `confirmed` | ① 모든 trace·evidence의 경로, 줄, 범위, 서술한 동작 ② 실제 진입 인터페이스와 정확한 local 입력 모양 ③ 모든 조건, parser·policy 단계, 소스에서 보이는 방해 계층, 관찰한 local 결과 ④ 영향받는 주체·자원과 증명된 영향 ⑤ 심각도 분리(현실적 likelihood, 증명된 impact, 전체는 impact 이하) ⑥ 수정 전략과 `code_changes`가 trust를 옮기기만 하지 않고 invariant를 강제하는지 | [](source:val-p5-conf) |
| `needs_validation` | ① 소스 경로가 실제이고 서술한 `claimed_root_cause`만 뒷받침하는지 ② 나열한 blocker가 모두 결정적이고 이미 local로 답할 수 없는 것인지 ③ 일반적 우려가 아니라 경계와 가능한 구체적 결과를 말하는지 ④ 검증 계획 필드가 하나 이상 있고 정확한지. `local`은 제한된 fixture를, `deployment`는 설정·identity·route·policy·runtime 사실의 소유자 관찰을 요구한다. 해당하지 않는 맥락의 계획을 지어내지 않고 audit traffic을 배포 환경에 보내지 않는다 ⑤ fingerprint가 이전·현재 record와 같은 root cause에 대해 일치하는지 | [](source:val-p5-nv) |

원문은 `confirmed`만 검증해서는 안 된다고 못박는다. 오해를 부르는 `needs_validation` 인계는 소유자의 시간을 쓰게 하고 틀린 전제를 보존할 수 있기 때문이다.[](source:val-p5-all)

## 보고서 세 개에는 무엇이 들어가나 {#reports span=12}

보고서는 Phase 5가 모든 record에서 통과한 뒤에만 쓴다. incomplete 실행은 독립 검증을 마친 record만 보고할 수 있고, 미해결 ledger 후보를 하나씩 밝히며 finding으로 제시하지 않는다.[](source:val-p6-intro)

`REPORT.md`는 일곱 항목을 이 순서로 쓴다.[](source:val-report)

@list id=report-items ordered=true
| 실행 profile, 범위, budget(정했다면 계획 대비 쓴 agent 수), source ref, 소스·local 전용 실행 선언, 이전 실행 사용, 명시적 deferred·out-of-scope coverage. carry한 같은 소스 `confirmed`와 소스가 바뀐 재검증을 이름으로 적는다. `quick`, scoped, budget 한정, incomplete 실행은 부분 pass라고 분명히 쓴다. 후보 검증이 strict budget을 소진했으면 incomplete라고 쓰고 검증하지 못한 fingerprint와 unit을 모두 나열하며 그 후보를 finding이라 부르지 않는다. 예산 때문에 필수 critic이 돌지 않았으면 어느 critic인지 밝히고 깨끗한 coverage 주장을 하지 않는다.[](source:val-report) |
| 짧은 보안 posture 요약 한 단락.[](source:val-report) |
| `confirmed` finding 표. severity, title, 영향받는 경계, 한 줄 관찰 결과.[](source:val-report) |
| `confirmed` finding마다 저장소 소스 위치, 낮은 신뢰 주체, target의 native 인터페이스로 한 제한된 재현, 조건, 실제 결과, 영향, 우선순위 근거, 가장 작은 소스 수정.[](source:val-report) |
| 별도의 `NEEDS VALIDATION` 표. 각 lead의 title, 저장소 trace, 정확한 blocker, 제한된 local 다음 단계, 안전한 소유자 관찰 배포 확인. severity를 주지 않고 `confirmed` 취약점이라 부르지 않는다.[](source:val-report) |
| 분리한 hardening 노트와 긍정적인 소스 패턴.[](source:val-report) |
| ledger에서 낸 coverage 요약. `covered`·`candidate`·`blocked`·`deferred` 개수, 중요한 제외, 마지막 critic 결과.[](source:val-report) |

`rejected` record를 finding으로 서술하지 않는다. 이전 불일치나 coverage 결정을 설명할 때만 fingerprint를 언급한다.[](source:val-report)

나머지 두 파일은 이렇다.

| 파일 | 내용 | 출처 |
| --- | --- | --- |
| `FINDINGS-DETAIL.md` | `confirmed` 중 `medium`, `high`, `critical` record마다 완전한 소스 경로와 target 중립 local 재현을 복사한다. 순서 있는 저장소 상대 trace와 evidence, 더미 공격자와 영향받는 더미 자원, native 입력·호출·fixture와 정확한 제한 지시, 관찰 출력과 그것이 증명하는 보안 invariant, 조건과 격리, 소스 수준 수정과 regression case | [](source:val-detail) |
| `NEEDS-VALIDATION.md` | 미해결 record마다 소스 trace, 검증한 증거, 정확한 blocker, 영향받는 경계, 해당하는 제한된 local 또는 소유자 관찰 해결 계획을 복사한다. severity 없는 우선순위 lead로 두고 live 시험 안내로 바꾸거나 빠진 배포 사실을 가정하지 않는다 | [](source:val-nvmd) |

재현 방식과 분량에 대한 규칙은 둘이다.

- HTTP는 가능한 native 인터페이스 중 하나일 뿐 기본값이 아니다. library는 함수 호출, parser는 fixture, CLI는 명령, 데스크톱 앱은 IPC나 파일 동작, 인프라는 로컬로 렌더한 policy를 쓸 수 있다. target에 없는 endpoint, 외부 계정, live 환경을 요구하지 않는다.[](source:val-native)
- 보고서는 증거에 비례한다. 깨끗한 실행은 `confirmed`가 0개일 수 있고, 남은 coverage·검증 한계를 밝히면 되며 `LOW` finding을 만들어 채우지 않는다.[](source:val-native)

## 다른 페이지 {#other-pages span=12}

| 파일 | 내용 |
| --- | --- |
| `security-audit.html` | 개요 |
| `security-audit.verify.html` | 첫 번째 독립 검증인 Phase 3 |
| `security-audit.records.html` | 이 단계 앞의 `findings.json`과 검증기 |
| `security-audit.planning.html` | incomplete 이유 값과 budget 규칙 |
