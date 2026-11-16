# 취약점 탐색

### Phase 2: coverage 기반 탐색 wave 실행

parent는 `planned` 상태의 ledger unit을 `general` agent에 배정한다. 서로 다른 경계를 한데 묶지 말고, 관련 범위를 충분한 수의 집중 탐색 agent로 나눈다. 한 agent가 같은 subsystem의 밀접한 unit을 맡을 수는 있지만 agent 수 제한 때문에 unit을 조용히 미배정해서는 안 된다. budget상 처리할 수 없는 unit은 사유 `budget_cannot_reserve_critics_and_validation`으로 `deferred` 처리한다.

budget이나 profile이 탐색 agent 수를 제한하면 우선순위대로 unit을 배정하고 근거를 ledger에 적는다. 우선순위는 (1) 인증 불필요하거나 신뢰도가 가장 낮은 진입점, (2) credential, 테넌트 간 데이터, 코드 실행, release 권한처럼 가치가 큰 자원을 지키는 경계, (3) 이전 실행의 누락·재검증 대상·변경된 소스를 같은 소스 재검토보다 먼저, (4) 추측성 문제보다 이 대상 유형에서 과거 `confirmed` 결과가 많았던 공격 유형 순이다. 동률이면 `coverage_id` 사전순으로 정해 실행마다 결과를 일정하게 유지한다.

시작 전 parent는 배정 unit을 `in_progress`로 바꾸고 정규화된 소문자 `agent_id`를 설정하며 agent 전용 `scratch/`와 parent 소유 `artifacts/`를 만든다. 탐색 agent는 소스와 parent가 준 맥락을 읽고 자기 `scratch/`에만 쓴 뒤 Task tool로 구조화된 결과 하나를 반환한다. 보존 artifact나 대상 소스, `architecture.md`, `coverage-ledger.json`, `findings.json`, 다른 agent 파일은 수정하지 않는다.

## 필수 탐색 agent prompt

각 prompt에는 다음 항목을 순서대로 넣는다.

1. 두 문장 역할 소개: 배정된 unit에서 소스로 근거를 댈 수 있는 보안 불변식 실패를 찾고, prompt 끝의 결과 계약에 맞는 JSON 객체 하나만 반환한다.
2. `architecture.md` 전문.
3. 배정된 coverage ID, subsystem, 경계, 저장소 기준 시작 경로, `coverage-ledger.json`의 각 unit별 block map.
4. 선택한 block 원문 전체: `ATTACK-CLASSES.md`의 일반 공격 유형 block, 각 companion의 `Core discipline`, 선택한 공격 유형 subsection, `Universal moves`, `Validation rules`. 일반 block은 독립적으로 완결되며 companion 방식의 공통 규칙 section을 포함하지 않는다. block이나 companion 이름만 전달하지 않는다.
5. 제외한 일반·companion block과 각 제외 사유.
6. 아래 핵심 탐색 방법과 artifact 승격 절차 block.
7. 아래 핵심 검증 규칙.
8. 이전 실행에서 같은 소스에 대해 확인된 제외 항목(각 항목은 fingerprint, 제목, 원인만)과 중복 조사하면 안 되는 동료 소유 coverage ID.
9. 고유 scratch/artifact 경로, 안전한 agent ID, 사전 지정 승격 허용 목록과 byte 한도, 아래 구조화 결과 block 및 `report-schema.json`의 `confirmed`, `needs_validation` branch 전문을 포함한 결과 계약.

같은 경로가 여러 영역을 가로지르면 companion block 여러 개를 선택할 수 있다. 제약을 함께 전달한다. 범위는 탐색 의무이지 제외된 일을 중복 조사할 권한이 아니다. 예상 밖의 다른 경계를 발견하면 `uncovered`에 넣어 parent가 안정적인 ledger unit을 만들고 다음 wave에 배정하게 한다.

#### 핵심 탐색 방법 — 모든 탐색 prompt에 포함

```text
## 방어적 취약점 탐색 방법

목표는 소스로 근거를 댈 수 있는 보안 불변식 실패와 최소 수정안을 찾는 것이다.
경계 결과를 넘어 피해를 확대하지 않는다. 소스 검토와 제한된 로컬 실행만 한다.
배포 endpoint, provider API, registry, ID 시스템, message broker, 공유 서비스,
다른 사용자를 접촉하지 않는다. 로컬 가짜 데이터만 사용한다.

코드를 깊게 읽는다. 배정된 각 입력을 파싱, ID, 권한 확인, 정규화, 상태,
파생 사본, 최종 sink까지 추적한다. 같은 효과를 내는 형제·legacy·일괄 처리·재시도·
취소·migration·오류 경로도 읽는다. 형제 경로의 통제가 존재하는지만 보지 말고
동등한지 비교한다. 한 component가 보장하는 내용과 다음 component의 가정을 비교한다.

구체적인 불변식에서 시작한다:
1. 낮은 신뢰도의 주체와 시작 권한을 적는다.
2. 수락되는 값, 동작, 상태 전환, 리소스 선택자를 적는다.
3. 이를 거부·결합·격리·제한·취소해야 할 통제를 찾는다.
4. 결정 이후 정확한 소스 경로를 추적한다.
5. 영향을 받는 최소 가짜 기록, 잘못된 반환값, process 무결성 영향,
   또는 로컬에서 관찰 가능한 공유 자원 효과에서 멈춘다.
6. 불변식을 보장할 소스 수정과 회귀 사례를 제시한다.

깊이 제한: 배정 경계에 도달하거나 그 경계가 의존하는 경로만 추적한다.
불변식이 어느 쪽으로든 결론 나면 조사를 멈추고 계속 탐색하지 말고
구조화 결과에 covered, candidate, blocked 또는 uncovered로 기록한다.

실패 경로와 불일치를 시험한다. 인터페이스가 받는 경우에만 누락, 빈 값, 0,
음수, 최대값, 한도 초과, 중복, 혼합 인코딩, 오래됨, 취소됨, 순서 변경,
동시성, 일부 migration, dependency 실패, rollback 상태를 확인한다. parser나
정책이 바뀌는 각 지점에서 정규화와 단위를 비교한다. 다단계 문제는 각 출력을
선행 조건으로 보고 다음 경계까지 자동으로 성립한다고 가정하지 않는다.
선행 조건이 하나라도 입증되지 않으면 blocker로 기록한다.

제안된 high·critical 후보에서 재사용 가능한 원인이 나오면 배정된 coverage ID가
담당하는 경로에서 표기·구조·논리 변형을 찾는다. 같은 원인은 통합하되 각 변형의
조건과 영향은 각각 확인한다. 동료 소유 unit은 조사하지 않는다. 현재 coverage가
없는 변형은 uncovered로 반환한다.

주장을 판정할 수 있는 가장 좁은 로컬 검사만 사용한다. 대상이 제어하는 build,
test, process, browser, emulator, fuzzer, fixture 처리는 parent가 승인한 OS 강제
sandbox 안에서만 실행한다. 외부 네트워크를 끄고, 허용 목록만 든 빈 환경에서 시작하며,
대상과 tool은 읽기 전용으로 제공하고 쓰기는 scratch만 허용한다. CPU, 메모리,
process 수, 파일 크기, 디스크, 시간 한도를 낮게 설정한다. 격리 loopback은 로컬
fixture에만 허용한다. 통제 하나라도 불가능하면 실행하지 말고 정확한 blocker와 함께
needs_validation을 반환한다. 기존 unit test, 최소 function harness, 가짜 tenant
service 호출, 작은 malformed fixture, 결정론적 race 순서, 로컬 렌더링 정책을 우선한다.
tool을 설치하거나 내려받지 않는다.

정확한 입력, 명령, 한도, 최소 결과를 기록한다. 환경 정보는 재현에 필요한 허용
변수 이름과 안전한 비밀 아닌 값만 기록한다. 현재 환경 전체, 상속 변수, credential,
인증 상태, 무관한 host 경로는 수집하지 않는다. 대상 process는 scratch에만 쓴다.
sandbox와 하위 process가 모두 종료된 뒤 신뢰된 parent 코드만 이 prompt의 승격 절차에
따라 사전 지정된 scratch 상대 경로 파일을 승격할 수 있다. agent와 대상 코드는 보존
artifact를 쓰지 않는다. 결정적 증거의 승격이 불가능하거나 실패하면 정확한 승격
blocker를 포함한 needs_validation을 반환한다. 가용성을 압박하거나 실제 대상을 호출하거나
진짜 credential을 쓰거나 artifact를 공개하거나 최소 관찰 효과 이후로 진행하지 않는다.

소스 밖의 배포, browser, provider, broker, OS, proxy, package, secret, ID 사실은
있음이나 없음의 증거가 아니다. 그런 사실이 결론에 필요하면 누락된 관찰과 안전한
담당자 확인 절차를 적은 needs_validation 기록을 반환한다.
```

#### 승격 절차 — 모든 탐색 prompt에 그대로 포함

```text
Artifact 승격 절차 (신뢰된 parent 코드만 수행):
참고용: 이 절차는 parent가 수행하며 agent는 직접 수행하지 않는다.

실행 전에 parent는 agent scratch/와 artifacts/ root의 신뢰된 비상속 directory
descriptor를 열어 보유하고, 예상 scratch 상대 경로 artifact 허용 목록 및 파일별·누적
byte 한도를 기록한다. descriptor를 agent나 sandbox에 넘기지 않는다. sandbox와 모든
하위 process가 종료된 뒤 신뢰된 parent 코드는 허용된 파일을 각각 승격한다:

1. 선언된 상대 경로를 검사한다. 절대 경로, 빈 값, `.`, `..`, symlink 구성요소를 거부한다.
2. 보유한 scratch root descriptor에서 각 상위 경로 요소를 no-follow directory-relative
   연산으로 순회한다. 경로로 다시 열지 않는다.
3. leaf를 no-follow 및 nonblocking으로 연다.
4. `fstat`으로 일반 파일인지, link count가 정확히 1인지, 기록된 파일별·누적 byte
   한도 이내인지 확인한다.
5. 해당 descriptor에서 읽는 동안에도 한도를 다시 강제한다.
6. 확인한 크기만큼 복사하고 `fstat`을 다시 해 ID, 유형, link count, 크기가 바뀌지 않았는지 확인한다.
7. 목적지는 보유한 artifacts root descriptor에서 no-follow directory-relative 연산으로
   상위 요소를 순회한다. 기존 요소는 실제 directory여야 하며 새 directory는 단독 생성 후
   no-follow로 다시 열어 확인한다.
8. leaf를 링크를 따라가지 않고 단독 생성한다. 목적지가 일반 파일이고 link count가 1인지
   확인한 뒤 양쪽 경로를 다시 열지 않고 검증된 source descriptor에서 복사한다.
9. POSIX가 아닌 시스템에서도 동등하게 race-safe한 API를 사용한다.
10. scratch를 재귀 복사하거나 glob하지 않는다. archive를 artifacts에 풀지 않는다.
    symlink, FIFO, socket, device, directory, hard link 파일, 변경 중인 파일, 한도 초과 파일은
    열거나 승격하지 않는다.
11. 검사를 사용할 수 없거나 강제할 수 없거나 실패하면 scratch 항목을 폐기한다.
    결정적인 증거라면 정확한 승격 blocker와 함께 needs_validation으로 남긴다.
```

#### 핵심 검증 규칙 — 모든 탐색 prompt에 포함

```text
## 후보 판정 기준

1. 후보에는 저장소 상대 경로 전체의 소스 추적과 주장한 원인의 근거가 필요하다.
   소스에서 확인되는 가장 강한 통제도 포함한다.
2. confirmed 제안에는 제한된 로컬 관찰 결과, 명시된 경계를 넘는 의미 있는 영향,
   전체 조건, 이를 막는 소스 계층이 없다는 근거가 필요하다.
3. crash를 코드 실행으로, 일반 작업을 공유 가용성 영향으로, 같은 주체의 동작을
   권한 상승으로 과장하지 않는다.
4. 필요한 사실이 소스에 없고 로컬에서도 관찰할 수 없다면 needs_validation을 쓴다.
   정확한 blocker를 적고 severity나 추측성 완료를 붙이지 않는다.
5. 영향을 받는 주체·리소스가 없는 모범 사례 누락은 finding이 아니라 제외 또는 보안 강화다.
   소스로 반증된 후보를 needs_validation으로 두지 않는다.
6. 같은 근본 원인은 모든 상태에서 동일한 소스 기반 fingerprint를 쓴다.
   정규식은 `^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$`를 따라야 하며 줄 번호, wave, agent,
   severity, verdict를 넣지 않는다.
7. 어떤 후보도 기준을 통과하지 않으면 후보 배열은 빈 배열로 반환한다.
```

## 로컬 검증 경계

로컬 실행은 확인을 위한 것이며 영향 확대 수단이 아니다.

- **필수 OS sandbox에서만 허용:** 이미 있는 dependency를 이용한 offline build, 가짜 상태를 쓰는 격리 loopback process, unit·integration test, 작은 fixture 처리, sanitizer, 제한된 fuzz·회귀 test, 결정론적 동시성 검사, 가짜 계정을 쓰는 로컬 browser·emulator test, 가짜 ID로 manifest 렌더링·정책 평가, 외부·유료 호출 mock.
- **금지:** 운영·배포 traffic, 해당 격리 검사에서 시작하지 않은 서비스 요청, 네트워크를 통한 dependency 설치, 실제 계정·credential, 운영 데이터, 공유 queue·cloud 자원·runner·registry·signing·release 서비스, 공개, 부하·포화·비용 발생, 가짜 데이터 경계 결과를 확인한 뒤의 추가 작업.

sandbox는 빈 환경에서 시작하고 대상 코드에 외부 네트워크나 host 쓰기 경로를 주지 않으며, 비용이 클 것으로 예상되는 검사뿐 아니라 모든 검사에 명시적인 낮은 자원·시간 제한을 둔다. 종료 뒤 scratch 출력도 대상 제어 영역에 남는다. `SKILL.md`의 no-follow, 경로 제한, 일반 파일, 크기 제한 host 절차로만 승격한다. sandbox·승격 기능이 빠져도 소스 근거 후보를 지우지 말고 정확한 blocker를 `needs_validation`으로 나타낸다.

## 구조화된 탐색 결과

주변 설명 없이 정확히 JSON 객체 하나만 반환한다.

```json
{
  "units": [
    {
      "coverage_id": "배정된 ID 하나",
      "disposition": "covered|candidate|blocked",
      "reviewed_paths": ["repo/relative/path"],
      "checks": [
        {
          "agent_id": "이 검사의 정규 owner",
          "reviewed_paths": ["이 검사가 맡은 repo 상대 경로"],
          "invariant": "이 unit에서 확인한 구체적인 통제",
          "method": "source|local",
          "result": "소스 또는 제한된 검사가 확인한 내용",
          "artifact": "local이면 agents/<agent-id>/artifacts/file, source면 null"
        }
      ],
      "candidate_fingerprints": [],
      "unresolved": []
    }
  ],
  "candidates": [],
  "hardening": ["취약점은 아니지만 구체적인 개선 사항"],
  "uncovered": [
    {
      "surface": "...",
      "boundary": "...",
      "subsystem": "...",
      "attack_class": "...",
      "starting_paths": ["repo/relative/path"],
      "reason": "별도 결정론적 coverage unit이 필요한 이유"
    }
  ]
}
```

`candidates` 각 항목은 `verdict` 대신 `proposed_verdict`를 쓴다는 점을 제외하면 schema 형식이어야 한다.

- `proposed_verdict: "confirmed"`: `report-schema.json`의 confirmed branch에서 verdict를 제외한 모든 필드, 즉 `fingerprint`, 제목, 설명, `root_cause`, `intended_behavior`, 순서가 있는 `trace`, `evidence`, `conditions`, 대상 중립적인 `execution`, `remediation`, `severity`, `confidence`를 포함한다. 실행 지침은 이미 마친 제한 로컬 검사만 설명한다. `payloads`는 최소 테스트 입력·fixture·native 호출이며 `observed_result`는 실제 로컬 결과다. 전체 severity는 관찰 영향보다 높을 수 없다.
- `proposed_verdict: "needs_validation"`: 해당 schema branch에서 verdict를 제외한 `fingerprint`, 제목, 설명, `claimed_root_cause`, 순서가 있는 `trace`, `evidence`, 비어 있지 않은 `blockers`, 적용 가능한 `local` 또는 `deployment` 단계가 하나 이상 있는 `validation_plan`을 포함한다. 해당하지 않는 맥락을 꾸며내지 않는다. severity, execution, remediation, reason, confirmed `root_cause`는 넣지 않는다. `deployment`는 담당자 관찰 절차이지 실제 대상을 조사하라는 요청이 아니다.

배정된 각 coverage ID는 `units`에 정확히 한 번 나타나야 한다. `covered` unit은 owner, 비어 있지 않은 `reviewed_paths`와 `checks`, 미해결 사실 없음, 후보 없음이 필요하다. `candidate`는 같은 근거를 갖고 연결된 fingerprint를 보유하는 유일한 상태다. `blocked`는 경로·검사·미해결 사실이 있는 부분 검토이며 fingerprint는 없어야 한다. 모든 소스 경로는 저장소 상대 경로여야 하며 절대 경로나 상위 경로 이동이 없어야 한다. 여러 단계 trace는 `entrypoint`로 시작하고 `sink`로 끝나며 중간은 `propagation`으로 표시한다. 각 check에는 정규 소문자 `agent_id`와 비어 있지 않은 `reviewed_paths`가 있어야 한다. unit 경로 목록은 각 소유 check 경로의 합집합이어야 한다. `source` check의 artifact는 `null`이다. `local`은 parent가 성공적으로 승격한 `agents/<check.agent_id>/artifacts/` 아래 일반 파일을 사용한다. verifier가 hunter 소유권을 가져가지 않고 독립 근거를 추가할 수 있다. scratch, output root 파일, 다른 check 소유 artifact를 연결하지 않는다.

## Parent 통합 및 ledger 갱신

parent는 각 unit 결과를 검증하고 정확히 하나의 배정 `coverage_id`에 연결해 그 ledger unit만 갱신한다. ID 중복·누락, 안전하지 않은 unit·check agent ID, artifact가 있는 source check, 신뢰된 parent 코드가 check owner의 artifacts 영역에 승격하지 않은 local artifact를 거부한다. unit의 `reviewed_paths`, `checks`를 unit의 `local_checks`에 복사하고 연결 artifact 경로, candidate fingerprint, unresolved 사실을 ledger에 기록한다. 각 hunter의 `hardening`은 Phase 6 보고를 위해 관련 unit의 parent 기록 필드(의미 필드 외부)에 보존한다. 실패·잘못된 형식·근거 없는 결론은 해당 unit을 재배정할 수 있도록 `planned`로 둔다. 건드리지 않은 budget/profile unit은 근거를 비운 미배정 `deferred`로 만들고 사유를 기록한다. 부분 근거를 `deferred` 안에 감추지 않는다. 갱신 뒤 `validate-coverage-ledger.cjs`를 실행한다. ledger가 유효하지 않으면 다음 배정을 진행할 수 없다. 이 unit 단위 계약은 한 unit을 닫으면서 다른 unit에는 후보나 blocker를 반환하게 한다.

후보는 fingerprint, 이어서 root cause 기준으로 통합한다. 하나의 원인에 진입 경로·효과가 여럿이면 완전한 trace가 가장 강한 후보 하나로 묶는다. 관련은 있지만 서로 독립적인 통제 누락은 별도 fingerprint를 쓴다. 중복 fingerprint는 관련 ledger unit에 기록하고 검증에 중복 전달하지 않는다.

## Coverage critic wave

각 hunter wave 직후 예약한 호출을 사용해 새 `research` post-wave coverage critic 하나를 실행한다. critic은 `architecture.md`, assignment block map이 포함된 전체 coverage ledger, 현재 후보 fingerprint와 상태, 이전 ledger의 누락 요약을 받는다. 소스만 읽고 파일을 쓰거나 대상을 실행하지 않는다. 다음 JSON만 반환하게 한다.

```json
{
  "missing_units": [
    {
      "surface": "...",
      "boundary": "...",
      "subsystem": "...",
      "attack_class": "...",
      "starting_paths": ["repo/relative/path"],
      "selected_companion_blocks": ["FILE.md#section"],
      "excluded_blocks": [{"block": "FILE.md#section", "reason": "..."}],
      "reason": "소스로 근거를 댄 coverage 누락"
    }
  ],
  "reassign_ids": ["완료하지 못한 기존 ID"],
  "resolved_prior_leads": ["fingerprint"],
  "stop": false
}
```

critic은 매핑되지 않은 진입점, 확인하지 않은 병렬 경로, 누락된 수명주기 mode, unit이 없는 선택 companion 유형, 근거가 부족한 제외, 경로·검사 없이 닫은 unit, 대응 unit이 없는 이전 `needs_validation`·변경 소스 누락을 확인한다. finding이 아니라 coverage를 제안한다. `stop`은 critic 자체 평가로, `missing_units`와 `reassign_ids`를 전혀 수락하지 않을 때만 `true`다. 다음 wave 실행 여부는 `stop`만이 아니라 아래 parent 반복 조건으로 결정한다. `resolved_prior_leads` fingerprint마다 parent는 연결 unit이나 prior-lead 항목을 해결 상태로 바꾸고 critic이 제시한 소스 근거 사유를 기록한다.

parent는 검토 범위 또는 소스·로컬 경계를 벗어난 unit 제안을 거부하고, 수락된 unit의 정규 ID를 만들어 현재 unit과 중복 제거한다. 같은 소스의 이전 완료 unit은 근거를 제공할 수 있지만, 이전 `deferred`, `blocked`, `out_of_scope`, 변경 소스 unit은 현재 작업이 되며 새 unit을 억제하지 않는다. 정규 ID 충돌은 병합하지 말고 실패 처리한다. 유효한 `reassign_id`가 현재 `blocked`, `covered`, `candidate` 근거를 갖고 있으면 그 정확한 종료 기록을 critic의 소스 기반 `reassignment_reason`과 함께 unit의 `attempts`에 추가한다. 기존 owner, checks, artifacts, fingerprint, unresolved 사실을 archive에 보존한다. 현재 `wave`를 증가시키고 새 hunter는 새로운 owner로서 현재 근거가 빈 `in_progress` unit을 받는다. 새 hunter 결과는 새 근거만 현재 필드에 쓴다. archive된 owner의 check나 artifact를 새 시도에 복사하지 않는다. 다음 배정 전에 ID를 정렬하고 ledger를 검증한다. `standard`와 `deep`에서는 post-wave critic이 수락한 `missing_units`와 유효한 `reassign_ids`가 없고 `planned` unit도 남지 않았을 때, 별도 예약된 호출로 독립적인 final-clean critic을 실행한다. 이 critic도 추가 작업을 수락하지 않아야 coverage 완료다. 새 작업을 찾으면 queue에 넣고 wave, post-wave critic, final-clean 절차를 반복한다. 시간·자원 때문에 일찍 멈추면 손대지 않은 모든 unit을 `deferred`로 바꾸고 critic 사유를 보존해 보고서에 누락을 밝힌다. 조용히 wave나 agent 수를 제한한 것을 coverage 완료 근거로 삼지 않는다.

실행 profile은 반복 범위를 제한한다. `quick` 실행은 hunter wave 한 번과 final critic 한 번만 한다. 수락된 `missing_unit`은 현재 ledger에 추가하고 `quick_profile_final_critic` 사유로 `deferred` 처리한다. 근거가 있는 유효한 `reassign_id`는 현재 종료 상태를 `attempts`에 archive하고 `wave`를 늘린 뒤 현재 상태를 근거 없는 미배정 `deferred`로 바꾸고 같은 사유를 기록한다. 두 번째 hunter wave나 critic을 실행하지 않는다. 범위를 좁힌 실행에서는 critic이 범위 밖 누락도 보고하지만 parent는 배정하지 않고 critic 사유를 붙여 `out_of_scope`로 기록한다. 이 조기 종료 규칙은 사전 선언된 `quick` 종료일 뿐 coverage 완료 근거가 아니다.

budget도 같은 방식으로 제한한다. 각 wave 배정 전 남은 budget과 hunter 수, validation 예약분, 즉시 실행할 post-wave critic, 유지해야 할 final-clean critic을 비교한다(`quick`은 post-wave critic 하나만 예약). 우선순위대로 wave 규모를 줄인다. 필수 예약을 감당하지 못하면 해당 wave의 hunter를 실행하지 않고 계획 unit을 `budget_cannot_reserve_critics_and_validation` 사유로 `deferred` 처리한다. critic이 제안한 unit도 budget을 늘리지 않고 같은 우선순위 queue에 넣는다. 살아남은 후보가 validation 예약 수를 넘으면 `SKILL.md`의 incomplete 규칙을 따른다. 탐색을 멈추고 fingerprint 순으로 검증하며, 검증하지 못한 unit은 unresolved 후보로 남기고 finding으로 제시하지 않는다.
