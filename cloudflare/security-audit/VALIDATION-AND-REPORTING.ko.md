# 검증·구조화 출력·확인·보고

### Phase 3: 모든 후보를 독립 검증

coverage critic의 clean pass 또는 명시적으로 기록한 조기 종료 뒤 Phase 2 후보와 동일 소스의 이전 확인 항목을 안정적인 fingerprint·원인 기준으로 통합한다. 제안된 고유 `confirmed`, `needs_validation` 후보마다 이를 탐색하지 않은 새 `general` verifier를 배정한다. hunter가 동일 원인을 제외했더라도 이전 확정 항목은 현재 검증 절차를 거친다. verifier는 hunter·이전 artifact를 참고할 수 있지만 인용된 현재 소스 위치를 모두 다시 읽고 안전하게 재현 가능한 결정적 검사를 독립 실행해야 한다.

각 verifier에 고유한 정규 소문자 ID, `<output-dir>/agents/<verifier-id>/scratch/`, parent 소유 `artifacts/`를 준다. verifier는 `scratch/`에만 쓰며 보존 artifact를 직접 쓰지 않는다. 후보, 연결 coverage unit의 검사·artifact 경로, 경로 해석에 필요한 architecture 사실, 관련 companion 검증 block, 아래 승격 절차, source/local 실행 경계, prompt에 복사한 `report-schema.json`의 `confirmed`, `needs_validation`, `rejected` branch, 동일 fingerprint의 이전 record만 전달한다. 다른 verifier의 결론은 전달하지 않는다.

#### 후보 검증 prompt

```text
이 후보는 당신이 작성하지 않았다. 저장소 소스와 범위가 제한된 로컬 근거로 반증을 시도하라. 배포 endpoint나 외부·공유 service를 접촉하지 않는다. 대상 제어 코드는 승인된 OS 강제 sandbox에서만 실행한다: 외부 network 금지, 허용 목록만 있는 빈 환경, 읽기 전용 대상·tool, scratch 전용 쓰기, 명시적 낮은 자원·시간 제한. 통제 하나라도 없으면 실행하지 말고 누락된 정확한 기능을 needs_validation blocker로 남긴다. 실행 뒤 scratch 항목은 모두 대상 제어 파일로 취급한다. sandbox와 하위 process가 모두 끝난 뒤 신뢰된 parent 코드만 이 prompt에 그대로 들어 있는 승격 절차에 따라 사전 지정 scratch 상대 파일을 승격할 수 있다. agent와 대상 코드는 보존 artifact를 쓰지 않는다. 승격할 수 없거나 실패한 파일은 근거로 사용하지 않는다.

1. 모든 trace·근거 파일, 양수 줄 번호, 범위, 설명을 확인한다. 첫 단계가 실제 낮은 신뢰 진입점이고 마지막이 주장한 sink·경계 효과인지 확인한다.
2. 경로에서 소스로 확인 가능한 가장 강한 입력 검증, ID, 권한, 정규화, 수명주기, framework, containment 통제를 재구성한다. architecture 요약에 비교 기준이 있으면 같은 유형인지 적되 반박 근거로 쓰지 않는다.
3. confirmed 후보라면 가능할 때 최소 관찰 결과를 독립 재현한다. 입력, 인터페이스 형식, 조건, 영향받는 가짜 주체·리소스를 확인한다. 더 강한 결과를 추정하거나 확인 뒤 계속하지 않는다.
4. likelihood, impact, confidence, 제안 수정안이 근거로 입증되는 범위에만 맞는지 확인한다.
5. needs_validation 후보라면 blocker가 정말 소스·로컬 관찰 밖인지 판단한다. 소스가 trace를 반박하면 rejected다. 누락 사실이 여전히 결정적이면 needs_validation을 유지하고 로컬·담당자 관찰 계획을 정확하고 비파괴적으로 작성한다.
6. 동일 소스 원인의 모든 상태에서 fingerprint를 유지한다.

주변 설명 없이 JSON 객체 하나만 반환한다:
{"decision":"confirmed|needs_validation|rejected", "record":{...}}
record는 prompt에 포함된 schema의 해당 verdict branch와 정확히 일치해야 한다. 수정한 record가 hunter 표현을 대체한다.
```

각 후보 검증 prompt에 아래 승격 절차를 그대로 복사한다.

```text
Artifact promotion procedure (trusted parent-side code only):
참고: parent가 수행한다. verifier는 직접 수행하지 않는다.

실행 전에 parent는 agent scratch/·artifacts/ root의 신뢰된 비상속 directory descriptor를
열어 보유하고 예상 scratch 상대 artifact 허용 목록과 파일별·누적 byte 한도를 기록한다.
descriptor를 agent나 sandbox에 넘기지 않는다. sandbox와 모든 하위 process가 종료된 뒤
신뢰된 parent 코드가 허용 파일을 하나씩 승격한다.

1. 선언된 상대 경로를 검사해 절대·빈 값, `.`, `..`, symlink 요소를 거부한다.
2. 보유 scratch root descriptor에서 각 상위 요소를 no-follow directory-relative 연산으로
   순회한다. 경로를 다시 열지 않는다.
3. leaf를 no-follow, nonblocking으로 연다.
4. `fstat`으로 일반 파일, link count 정확히 1, 파일별·누적 한도 이내인지 확인한다.
5. descriptor에서 읽는 동안에도 한도를 적용한다.
6. 확인된 크기만 복사하고 `fstat`을 반복해 ID, 유형, link count, 크기 변경을 거부한다.
7. 목적지는 보유 artifacts root descriptor에서 no-follow directory-relative 순회한다.
   기존 상위 요소는 실제 directory여야 하고, 새 요소는 배타적으로 만든 뒤 no-follow로
   다시 열어 검증한다.
8. leaf를 link를 따르지 않고 배타 생성한다. 목적지가 일반 파일이고 link count가 1인지
   확인한 뒤 경로를 다시 열지 않고 검증한 source descriptor에서 복사한다.
9. POSIX 외 시스템에서도 동등한 race-safe API를 쓴다.
10. scratch를 재귀 복사·glob하거나 archive를 artifacts에 풀지 않는다. symlink, FIFO,
    socket, device, directory, hard link 파일, 변경 중 파일, 한도 초과 파일은 승격하지 않는다.
11. 검사 불가·강제 불가·실패 시 scratch 항목을 폐기한다. 결정적 근거라면 정확한
    승격 blocker를 `needs_validation`으로 남긴다.
```

verifier는 전체 경로와 제한된 관찰 결과를 독립 입증한 뒤에만 `needs_validation`을 `confirmed`로 승격할 수 있다. 구체적인 배포·runtime 사실이 불명확하면 제안된 확정을 `needs_validation`으로 낮춘다. 소스, 로컬 동작, 보이는 통제, 의미 있는 영향 누락, 불가능한 선행 조건이 주장을 반박하면 `rejected`다. `needs_validation`은 추측을 보관하는 칸이 아니다.

parent는 verifier fingerprint가 다른 근본 원인을 찾은 경우가 아니라면 동일한지 검사한다. 수정 사항을 병합하고 연결된 모든 coverage unit에 결정을 기록해 fingerprint마다 최종 record 하나만 남긴다. 잘못된 형식이나 설명문으로 감싼 verifier 결과는 고쳐 쓰지 말고 폐기한다. budget이 허용하면 새 verifier로 재실행하고, 아니면 incomplete 규칙에 따라 미검증 ledger 후보로 남긴다.

verifier 근거를 ledger 검사에 추가할 때 해당 check의 `agent_id`는 verifier 정규 ID로 설정하고 저장소 상대 `reviewed_paths`를 하나 이상 기록한다. unit의 `reviewed_paths`는 모든 check 경로의 합집합으로 유지한다. source 전용은 `method: "source"`, `artifact: null`이다. local은 신뢰된 parent 코드가 `agents/<check.agent_id>/artifacts/` 아래 승격한 파일이 있을 때만 `method: "local"`을 쓴다. unit의 원래 assignment owner는 유지해 hunter와 verifier의 독립 검사가 함께 존재하게 한다. 가져온 이전 record의 `planned` unit에는 기존 owner가 없다. 재검증한 verifier가 unit owner가 되고 첫 check를 작성해 가져온 fingerprint와 함께 `candidate`로 전환한다.

엄격한 총 agent budget으로 모든 후보를 검증하지 못하면 실행을 incomplete로 표시하고 `SKILL.md`의 결정론적 budget 규칙을 따른다. 미검증 후보는 ledger에만 남으며 어떤 verdict로도 `findings.json`에 넣지 않는다.

### Phase 4: `findings.json` 작성·검증

parent는 독립적으로 결정된 모든 record를 fingerprint 순으로 `<output-dir>/findings.json`에 작성한다.

- `confirmed`: 소스 근거가 있고 로컬 실행 근거, 조건, 구체적인 수정, likelihood·impact·전체 severity, confidence가 완비된 취약점.
- `needs_validation`: 정확한 blocker와 적용 가능한 로컬 또는 담당자 관찰 배포 계획이 하나 이상 있는 소스 기반 후보.
- `rejected`: 검증에서 반증된 소스 기반 후보. 근거 변경 없이 향후 실행이 같은 미지원 주장을 반복하지 않게 보존한다.

작성 직전에 `report-schema.json`을 다시 읽는다. `additionalProperties: false`이므로 hunter wrapper field를 record에 넣지 않는다. verdict별 계약을 구별한다.

- `confirmed`는 `root_cause`, `intended_behavior`, `conditions`, `execution`, `remediation`, `severity`, `confidence`를 쓴다. `claimed_root_cause`, `blockers`, `validation_plan`, `reason`은 쓰지 않는다. `execution`은 대상의 실제 인터페이스를 사용하며 API/HTTP 입력, CLI 호출, library 호출, message, file fixture, browser 동작, 렌더링 정책, 로컬 harness 등이 해당한다. `observed_result`는 비어 있지 않은 사실이어야 한다.
- `needs_validation`은 `claimed_root_cause`, `trace`, `evidence`, `blockers`, 비어 있지 않은 `validation_plan.local` 또는 `validation_plan.deployment` 하나 이상을 쓴다. 두 맥락이 서로 다른 사실을 해결할 때만 둘 다 포함한다. severity, execution, remediation, reason, confirmed `root_cause`는 쓰지 않는다.
- `rejected`는 `claimed_root_cause`, `trace`, `evidence`, `reason`을 쓴다. severity, execution, remediation, blockers, validation plan, confirmed root cause는 쓰지 않는다.

모든 record에는 안정적 fingerprint, 제목, 설명, 저장소 상대 소스 경로가 필요하다. 다단계 trace는 `entrypoint`로 시작해 `sink`로 끝나며 중간에만 `propagation`을 쓴다. 한 단계 trace는 `entrypoint`나 `sink`다. 전체 severity는 입증된 영향보다 클 수 없다.

```sh
node <skill-dir>/validate-findings.cjs <output-dir>/findings.json
node <skill-dir>/validate-coverage-ledger.cjs <output-dir>/coverage-ledger.json
```

다음 단계 전에 구조·의미 오류를 모두 수정한다. findings validator는 5 MiB 초과, 최상위 finding 1,000개 초과, 중첩 64단계 초과를 거부하고 오류 출력은 최대 100개로 제한한다. validator 성공은 형식과 ledger 일관성만 증명한다.

### Phase 5: 최종 record를 새 관점에서 검증

`findings.json`에 남은 최종 `confirmed`, `needs_validation` record 각각에 새 `research` verifier 하나를 병렬 배정한다. hunter 설명문이 아니라 구조화 record를 검사하며 source/local 경계를 지킨다.

`quick` 실행에서는 Phase 3과 Phase 5를 합친다. Phase 3 verifier가 record 검사도 수행해 최종 schema 형식 record를 반환하므로 후보마다 독립 검토자 한 명만 둔다. 다른 profile은 두 검증을 나눈다. 어떤 profile에서도 `confirmed` 독립 검토를 생략하지 않는다.

`confirmed` verifier는 다음을 확인한다.

1. 모든 저장소 상대 trace·근거 경로, 줄, 범위, 설명한 동작.
2. 실제 진입 인터페이스와 정확한 로컬 입력 형식.
3. 모든 조건, parser·정책 단계, 소스에서 보이는 방어 계층, 로컬 관찰 결과.
4. 영향받는 주체·리소스와 입증된 영향.
5. severity 분리: 현실적인 likelihood, 입증된 impact, impact 이하의 전체 severity.
6. 수정 전략과 `code_changes`가 있다면 신뢰를 단순 이동하는 것이 아니라 불변식을 강제하는지.

`needs_validation` verifier는 다음을 확인한다.

1. 소스 경로가 실제 존재하고 적힌 `claimed_root_cause`만 뒷받침하는지.
2. 각 blocker가 결론에 중요하고 로컬에서 이미 답을 얻을 수 없는지.
3. 일반적인 우려가 아니라 경계와 가능한 구체적 결과를 적었는지.
4. 적용 가능한 validation plan이 정확히 하나 이상 있는지. `local`은 제한 fixture, `deployment`는 담당자가 설정·ID·route·정책·runtime 사실을 관찰하도록 한다. 해당하지 않는 계획을 만들거나 배포에 감사 traffic을 보내지 않는다.
5. 동일 원인의 이전·현재 record와 fingerprint가 일치하는지.

각 verifier는 주변 설명 없이 JSON 하나를 반환한다: `{"decision":"verified","fingerprint":"..."}` 또는 `{"decision":"replace","reason":"...","record":{...}}`. replacement는 `confirmed`, `needs_validation`, `rejected` 중 schema branch와 일치해야 한다. 잘못된 형식·설명 포함 Phase 5 결과도 Phase 3과 동일하게 고치지 말고 버린 뒤 budget이 허용하면 새 verifier로 실행한다.

Phase 5 replacement가 더 강한 verdict(특히 confirmed)로 올리거나 원인, trace, 실행 입력·관찰 결과, 입증 영향, severity를 실질적으로 바꾸면 최종 적용하지 않는다. 해당 전체 replacement를 hunter, Phase 3 검증, Phase 5 제안을 하지 않은 새 독립 verifier에게 보낸다. 새 verifier가 현재 소스를 재확인하고 실행 경계 안에서 결정적 로컬 결과를 독립 재현한 뒤 `verified`나 다른 replacement를 반환한다. 이 새 검증 뒤에만 중대한 replacement를 적용한다. 또 중대한 교체가 생기면 새 verifier로 반복한다. budget·독립성이 불가능하면 논쟁 record를 `findings.json`에서 제거하고 ledger unit을 unresolved candidate로 남긴 뒤 정확한 `incomplete_reason`과 함께 `run_status: "incomplete"`로 둔다. 의미·근거를 바꾸지 않는 문구·저장소 줄 수정은 직접 반영할 수 있다.

적용한 replacement마다 두 validator를 다시 실행하고 연결 ledger 결정을 갱신한다. 최종 verifier가 별도 원인을 찾으면 새 fingerprint를 부여해 포함 전에 독립 후보 검증으로 보낸다. 모든 ledger 후보가 독립적인 최종 처분을 받고 보존 record가 Phase 5를 통과해야 `run_status: "complete"`로 둔다.

`confirmed`만 검증하지 않는다. 오해를 부르는 `needs_validation` 인계도 담당자 시간을 낭비하고 잘못된 전제를 남길 수 있다.

### Phase 6: 최종 record로 대상 중립 보고서 작성

`findings.json`에 남은 모든 record가 Phase 5를 통과한 뒤에만 최종 record, ledger, ledger에 보존한 hunter `hardening` 메모로 설명문을 만든다. incomplete 실행도 독립 검증된 record는 보고할 수 있지만 미해결 ledger 후보 각각을 밝히고 finding으로 제시하지 않는다. 설명 파일이 verdict, severity, blocker, 입증된 영향을 바꾸지 않는다.

#### `REPORT.md`

1. 실행 profile, scope, 설정된 budget 및 계획 대비 실제 agent 사용량, source ref, sandbox source/local-only 실행 명시, 이전 실행 활용, 명시적인 deferred·out-of-scope coverage를 기록한다. 가져온 동일 소스 확정과 변경 소스 재검증도 밝힌다. `quick`, scope 지정, budget 제한, incomplete 실행은 부분 pass임을 명확히 한다. 후보 검증이 엄격 budget을 소진했다면 incomplete라고 쓰고 미검증 fingerprint와 연결 unit을 모두 나열하며 finding이라고 부르지 않는다. 필수 critic 실행이 budget 때문에 막혔다면 어떤 critic을 실행하지 못했는지 밝히고 coverage가 깨끗하다고 주장하지 않는다.
2. 간단한 보안 상태 요약.
3. confirmed finding 표: severity, 제목, 영향받은 경계, 한 줄 관찰 결과.
4. 각 confirmed finding의 저장소 위치, 낮은 신뢰 주체, 대상 native 방식의 제한 재현, 조건, 실제 결과, 영향, 우선순위 근거, 최소 수정.
5. 별도 `NEEDS VALIDATION` 표. 각 항목의 제목, 저장소 trace, 정확한 blocker, 제한된 로컬 다음 단계, 안전한 담당자 관찰 배포 확인을 적는다. severity를 주거나 confirmed 취약점이라고 부르지 않는다.
6. 보안 강화 메모와 긍정적인 소스 패턴을 별도 표시.
7. ledger에서 covered, candidate, blocked, deferred 수와 중요 제외, 최종 critic 결과를 요약.

rejected record를 finding으로 설명하지 않는다. 이전 불일치나 coverage 결정 설명에 필요한 경우에만 fingerprint를 언급한다.

#### `FINDINGS-DETAIL.md`

confirmed `medium`, `high`, `critical` 각각에 대해 전체 소스 경로와 대상 중립적인 로컬 재현을 복사한다.

- 순서가 있는 저장소 상대 trace와 근거.
- 가짜 공격자·주체 및 영향을 받는 가짜 리소스.
- 대상 native 입력, 호출, fixture 및 정확한 제한 실행 지침.
- 관찰 출력과 입증하는 보안 불변식.
- 조건과 containment.
- 소스 수정 및 회귀 사례.

#### `NEEDS-VALIDATION.md`

미해결 record마다 소스 trace, 검증된 근거, 정확한 blocker, 영향 경계, 적용 가능한 제한 로컬·담당자 관찰 해결 계획을 복사한다. severity 없이 우선순위가 있는 lead로 둔다. live test 지침으로 바꾸거나 빠진 배포 사실을 추정하지 않는다.

HTTP는 가능한 native interface 중 하나일 뿐 기본값이 아니다. library는 function 호출, parser는 fixture, CLI는 command, desktop app은 IPC·파일 동작, infrastructure는 로컬 렌더링 정책을 사용할 수 있다. 대상에 없는 endpoint, 외부 계정, live 환경을 요구하지 않는다.

보고서 분량은 근거에 비례시킨다. 깨끗한 실행에는 confirmed가 0개일 수 있다. LOW finding을 만들어내지 말고 결과와 남은 coverage·검증 한계를 밝힌다.
