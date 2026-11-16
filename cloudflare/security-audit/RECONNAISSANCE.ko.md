# 정찰

### Phase 1: 소스를 파악하고 coverage 계획 수립

parent는 `run-metadata.json`을 초기화하고 `SKILL.md`의 엄격한 정찰 전 budget gate를 적용한 다음 agent scratch root와 공유 ledger를 만들고 탐색을 시작한다. gate를 통과하지 못하면 metadata에 incomplete 상태를 기록하고 정찰 agent를 실행하지 않는다. 정찰은 대상과 로컬에서 확인 가능한 build·설정 상태만 읽는다. 배포 endpoint, 외부 identity provider, registry, broker, cloud API, 공유 서비스에는 접촉하지 않는다.

여러 `research` agent를 병렬로 실행한다. 이들은 구조화된 사실을 parent에게 반환하며 파일을 쓰지 않는다.

**Agent 1a: 제품·기술 스택·로컬 실행**

```text
<target>의 대상을 읽는다. 네트워크를 쓰지 않는다. 다음을 반환한다:
1. 제품 유형, 사용자, 운영자, 일반적인 신뢰 민감 동작.
2. 언어, framework, build system, runtime, 로컬에서 보이는 배포 방식.
3. 저장소 상대 진입점과 subsystem 경계.
4. 로컬 dependency만으로 offline 실행 가능한 정확한 build·test 명령, 예상 쓰기 경로, 처리 대상 제어 입력. 정찰 중 실행하지 않는다.
5. 로컬 문서·dependency에서 근거를 찾을 수 있는 유사 소프트웨어·protocol. 유용한 비교 근거가 없으면 그렇게 말한다.
6. 제한된 실행을 막는 로컬 toolchain·runtime 정보 누락.
저장소 상대 file:line 근거가 있는 소스 사실만 반환한다.
```

**Agent 1b: 주체·권한·통제**

```text
ID, 권한 확인, 격리, 권한을 정하는 모든 소스를 읽는다. 다음을 정리한다:
1. 각 낮은 신뢰도 주체와 설계상 허용된 동작.
2. 각 진입점의 인증 또는 peer ID.
3. 리소스별 권한과 tenant·owner 범위.
4. process, browser, workload, CI, plugin, model·tool, 기기, local IPC 권한.
5. 권한 변경, 확인, 취소, 복구, fallback 경로.
6. 소스에서 확인되는 통제와 관찰할 수 없는 배포 사실에 달린 통제.
저장소 상대 file:line 근거와 신뢰 경계를 반환한다. 실제 접근 가능성을 추정하지 않는다.
```

**Agent 1c: 진입점·사본·sink**

```text
외부 또는 낮은 신뢰도 입력이 들어오는 소스상 모든 지점을 조사한다:
- HTTP/browser, RPC/message/protocol, file/archive/document, CLI/env/config,
  plugin/dependency/CI, cloud event/IAM selector, model context/tool argument,
  mobile/deep link/webview, local IPC.
각 지점에서 주요 변환, 저장·파생 사본, 보안상 중요한 sink까지 추적한다.
소스에 드러난 한도와 같은 효과로 이어지는 병렬 경로를 기록한다.
저장소 상대 경로와 줄 번호를 반환한다. 빠짐없이 조사하되 실행하거나 입력을 보내지 않는다.
```

**Agent 1d: 로컬 실행·배포 가시성**

```text
test, build 정의, manifest, packaging, 유지 중인 환경 overlay를 읽고 다음을 반환한다:
1. OS 강제 sandbox에서 가짜 데이터로 신뢰 경계를 검증할 수 있는 작은 offline test·기존 fixture.
2. 외부·공유 dependency 없이 격리 loopback network namespace를 쓸 수 있는 process.
3. dependency를 내려받거나 artifact를 공개하거나 유료/provider API에 접촉하거나 공유 상태에 영향을 주는 명령. 이번 실행에서 금지로 표시한다.
4. 소스만으로 확인할 수 없어 결정적이면 needs_validation이 필요한 배포 통제·연결.
5. 저장소가 결정하는 경우에만 배포 mode별 최종 활성 소스 경로.
6. 로컬 플랫폼이 허용 목록만 둔 빈 환경, 외부 네트워크 차단, 대상·tool 읽기 전용 mount,
   scratch 전용 쓰기, 명시적 CPU·memory·process·파일 크기·disk·시간 한도를 강제할 수 있는지.
   통제가 부족하면 대상 제어 실행은 차단된다.
7. 신뢰된 parent 코드가 사전 지정 scratch 파일을 경로 제한 no-follow descriptor 순회,
   nonblocking 일반 파일 검사, 목적지 상위 경로 전체 no-follow 순회, 일반 파일 목적지의
   단독 생성, 파일별·누적 크기 제한으로 승격할 수 있는지. 불가능하면 scratch 파일을
   근거로 쓸 수 없다.
```

앞선 네 agent가 매핑하지 못한 별도 배포 mode나 subsystem에 한해 집중 정찰 agent를 추가한다. 조용히 생략하지 않는다. `SKILL.md` budget gate가 이를 막으면 실행하지 말고 미매핑 영역을 `budget_cannot_reserve_critics_and_validation` 사유의 `deferred` ledger unit으로 등록해 보고서에 누락을 밝힌다.

## 이전 실행 자료

작업을 고르기 전에 parent는 같은 repo의 이용 가능한 모든 이전 `coverage-ledger.json`과 `findings.json`을 읽는다.

- 이전 record·unit의 소스 위치, 통제, 조건, 소스 기반 ID를 현재 소스와 비교한다.
- 관련 소스·조건·유효 근거가 여전히 같은 이전 `confirmed` record만 동일 fingerprint로 현재 후보에 가져온다. `prior_status: "prior_confirmed_same_source"`인 현재 `planned` unit에 연결하고 그 원인만 hunter 제외 목록에 넣는다. Phase 3에서 이 record를 재검증하는 verifier가 unit의 assignment owner가 되며, 소스 재검사가 첫 check가 되고 가져온 fingerprint와 함께 unit 상태를 `candidate`로 바꾼다.
- 관련 소스나 조건이 하나라도 바뀐 이전 확정 항목은 `prior_confirmed_changed_source` 재검증 unit으로 계획한다. 탐색에서 제외하거나 과거 판정이 여전히 맞다고 가정하지 않는다.
- 이전 `needs_validation`, `deferred`, `blocked`, `out_of_scope`, 변경 소스 unit 각각에 현재 작업 unit을 만든다. 이 상태는 우선순위 입력일 뿐 중복 제거·억제 key가 아니다.
- 여전히 차단된 이전 `needs_validation` record는 현재 소스가 trace를 뒷받침할 때만 같은 fingerprint로 가져온다. `prior_status: "prior_needs_validation"`인 현재 `planned` unit에 연결하고 미해결 blocker는 유지한다. 이를 재검증하는 Phase 3 verifier가 unit owner가 되고, 재검사가 첫 check이며 가져온 fingerprint와 함께 unit 상태를 `candidate`로 바꾼다. 최종 검증에도 포함한다.
- 이전 rejected record는 현재 근거가 실패한 trace나 누락 조건을 바꾸지 않는 한 오래된 주장으로 본다. 동일한 거부는 coverage unit 검토가 아니라 그 정확한 주장만 억제한다.
- 누락되거나 호환되지 않는 ledger를 기록한다. 이를 coverage가 비어 있다는 뜻으로 취급하지 않는다.

`run-metadata.json`에 사용한 경로와 source ref를 기록한다. `architecture.md`에는 coverage에 미치는 영향만 요약한다.

## Architecture 요약 및 companion 선택

parent는 `<output-dir>/architecture.md`를 약 1,000단어 상한으로 작성한다. 다음을 포함한다:

1. 제품, 주체, 일반 권한, 보호 리소스.
2. Agent 1a의 비교 기준(소스로 근거가 있을 때): 비교 대상이 받아들이는 보안상 trade-off. 조사 노력과 severity 조정에만 쓰며 입증된 finding을 무시하는 데 쓰지 않는다. 비교 대상도 실제로 중요했던 결함 유형을 공유하면 finding 근거가 강해진다. 의미 있는 비교 대상이 없으면 생략한다.
3. 기술 스택, 소스에서 보이는 배포 경로, offline build·test 제한.
4. 진입점과 중요한 source-to-sink·수명주기 경로.
5. 신뢰 경계와 각 경계에서 소스로 확인되는 가장 강한 통제.
6. 저장소 상대 시작 경로.
7. 이전 coverage 누락, 변경 소스·차단 재검증 대상, 동일 소스 confirmed 제외 항목.
8. [ATTACK-CLASSES.md](ATTACK-CLASSES.md)에서 고른 companion 요약: 선택 파일과 필요한 소스 기반 경계.

배정 단위 일반 block, 선택 companion block, 제외 사유는 `architecture.md`가 아니라 각 ledger unit에 둔다. 그래야 대규모 실행에서도 architecture 상한을 지키고 hunter prompt의 정확한 매핑을 기계적으로 검사할 수 있다.

언어나 dependency 이름만 등장했다고 companion 파일을 고르지 않는다. 정찰에서 그 파일의 `When to use this file`이 설명하는 신뢰 민감 경계를 찾았을 때 선택한다. 다른 agent가 관련 유형을 본다고 해서 소스에 보이는 경계를 제외하지 않는다.

## 결정론적 coverage ledger

parent는 `<output-dir>/coverage-ledger.json`을 최상위 JSON 배열로 작성한다. 실행 profile의 세분성(`quick`은 전체 범위 단일 subsystem 식별자, `deep`은 수명주기 mode 추가)에 맞춰 진입점, 신뢰 경계, subsystem, 적용 가능한 일반·companion 공격 유형의 중요한 조합마다 unit 하나를 만든다. 범위 지정 실행에서는 범위 내 항목을 배정용으로 만들고 발견된 제외 항목도 `out_of_scope` unit으로 보존해 이후 전체 실행에서 현재 작업으로 전환할 수 있게 한다.

각 차원에는 사람용 label과 `canonical_refs`의 안정적인 소스 기반 값을 둔다. 표시 label이 바뀌어도 같은 소스 객체에는 동일 canonical ref를 쓴다. 예: 저장소 상대 진입 경로와 export된 범위, 소스에서 정한 route·message ID, 경계를 정의하는 소스 통제, 저장소 package 경로, 정확한 공격 유형 block 참조. block 참조는 `FILE.md#` 뒤에 해당 파일의 bold 문구나 heading에 쓰인 정확한 class 이름을 붙인다. 렌더링 HTML anchor가 아니라 파일 본문에서 찾는 안정 ID다. companion section은 괄호 설명 앞 heading을 쓴다(예: `Core discipline`). 표시 label을 소문자화하거나 slug화해 참조를 만들지 않는다.

정보 손실 없는 방식으로 `coverage_id`를 만든다:

1. 모든 참조가 Unicode NFC, 올바른 scalar, 보이는 문자만 포함하고 제어·형식·줄/문단 구분자·default-ignorable 문자가 없으며 앞뒤 공백이 없는지 확인한다.
2. RFC 3986 percent encoding으로 UTF-8 byte를 인코딩한다. `A-Z a-z 0-9 - . _ ~`만 그대로 두고 나머지는 대문자 `%HH`로 쓴다.
3. 인코딩한 `surface`, `boundary`, `subsystem`, `attack_class`를 `::`로 연결하고, 있으면 인코딩한 `lifecycle`을 덧붙인다.

quick profile의 subsystem 차원은 고정 canonical 값 `profile/quick/all-in-scope-subsystems`를 쓴다. wave 번호, agent, verdict, severity, 줄 번호는 참조·ID에 넣지 않는다. 배정 전 `coverage_id` 사전순 정렬을 한다. 중복 ID는 모두 오류 처리한다. 중복 ID의 의미 필드가 다르면 canonical ID 충돌이며 병합하거나 조용히 덮어쓰지 않는다. validator는 다른 canonical 참조로 표현된 동일 의미 tuple도 거부한다.

각 unit은 다음을 기록한다:

```json
{
  "coverage_id": "...",
  "canonical_refs": {
    "surface": "src/router.ts#POST /users/:id",
    "boundary": "src/authz.ts#requireOwner",
    "subsystem": "packages/api",
    "attack_class": "ATTACK-CLASSES.md#Access control"
  },
  "surface": "...",
  "boundary": "...",
  "subsystem": "...",
  "attack_class": "...",
  "starting_paths": ["repo/relative/path"],
  "ordinary_attack_class_block": "ATTACK-CLASSES.md#Access control",
  "selected_companion_blocks": ["FILE.md#section"],
  "excluded_blocks": [{"block": "FILE.md#section", "reason": "..."}],
  "prior_status": "new|prior_confirmed_same_source|prior_confirmed_changed_source|prior_needs_validation|prior_deferred|prior_blocked|prior_out_of_scope|prior_covered_same_source|prior_covered_changed_source|prior_rejected_claim_changed|none",
  "attempts": [],
  "wave": 1,
  "status": "planned",
  "agent_id": null,
  "reviewed_paths": [],
  "local_checks": [],
  "result_fingerprints": [],
  "unresolved": []
}
```

`lifecycle`가 중요하면 `canonical_refs.lifecycle`와 사람용 `lifecycle` 필드를 추가한다. 적용되는 일반 block이 없을 때만 `ordinary_attack_class_block`은 null이다. 선택 companion 목록에는 적용 class와 companion의 `Core discipline`, `Universal moves`, `Validation rules`가 들어간다. `excluded_blocks`에는 검토했으나 선택하지 않은 block과 제외 근거인 소스 사실을 모두 기록한다.

parent는 기록용 field를 추가할 수 있지만 위 의미 field는 안정적으로 유지한다. `prior_status`에서 `new`는 호환되는 이전 ledger가 있을 때 이번에 처음 발견한 표면, `none`은 호환되는 이전 ledger가 없을 때 만든 unit이다. 이전 `deferred`, `blocked`, `out_of_scope`, 변경 소스 unit은 현재 범위에 들어오면 현재 `planned` 작업으로 시작한다. 이전 동일 소스 covered unit도 현재 ledger에 남긴다. 먼저 변경된 소스, 중요한 수명주기 경로, 정확한 충돌을 배정하고 추가 검토 여부는 coverage critic이 정한다.

`attempts`는 coverage critic이 다시 여는 근거 있는 배정을 추가만 하는 archive다. 재배정 전에 이전 unit의 정확한 `wave`, `status`, `agent_id`, `reviewed_paths`, `local_checks`, `result_fingerprints`, `unresolved`와 critic의 소스 기반 `reassignment_reason`을 추가한다. `blocked`, `covered`, `candidate`만 archive할 수 있다. archive 항목은 live unit과 동일한 상태·근거 불변식을 지키며 현재보다 작은 엄격 증가 wave, 원래 owner와 artifact를 보존한다. 다음 배정은 wave를 늘리고 새 owner를 지정하며 현재 근거를 비운다. profile·budget 때문에 재배정하지 못하면 wave를 늘리고 null owner, 빈 근거, 중단 사유로 live `deferred`를 쓴다. archive된 owner의 검사·artifact를 현재 상태로 복사하지 않는다. 이후 현재 종료 상태에는 새 시도 근거만 두며 archive는 바꾸지 않는다.

상태 표를 정확히 지킨다:

| Status | Unit `agent_id` | `reviewed_paths` / `local_checks` | `result_fingerprints` | `unresolved` |
|---|---|---|---|---|
| `planned` | null | 비어 있음 | 비어 있음 | 비어 있음 |
| `not_applicable`, `out_of_scope`, `deferred` | null | 비어 있음 | 비어 있음 | 사유 필수 |
| `in_progress` | 정규 owner | 비어 있음 | 비어 있음 | 비어 있음 |
| `blocked` | 정규 owner | 부분 근거 둘 다 존재 | 비어 있음 | blocker 필수 |
| `covered` | 정규 owner | 둘 다 존재 | 비어 있음 | 비어 있음 |
| `candidate` | 정규 owner | 둘 다 존재 | 값 존재 | 선택 |

정규 agent ID는 `^[a-z0-9][a-z0-9_-]{0,63}$`에 맞고 Windows 장치 이름이 아니어야 한다. 소문자는 필수라 ledger 안에서 대소문자 접힘 alias를 허용하지 않는다. unit의 `agent_id`는 배정 owner다. 각 check는 자체 `agent_id`와 비어 있지 않은 `reviewed_paths`를 기록하고 unit 경로 목록은 정확히 이들의 합집합이다. source 전용 check의 artifact는 `null`이다. local check는 신뢰된 parent 코드만 `agents/<check.agent_id>/artifacts/`에 승격한 일반 파일을 사용한다. 이를 통해 hunter·verifier 검사를 한 unit에 함께 둘 수 있다. scratch 경로, output root 파일, symlink·특수 파일, 다른 check owner artifact는 근거가 아니다.

coverage 주장은 ledger가 결정한다. architecture 요약, agent 수, “auth 검토 완료” 같은 포괄 문구는 coverage 근거가 아니다. Phase 2에서는 hunter의 구조화 결과에 든 경로와 검사로만 unit을 닫는다.

seed 이후, parent 갱신 이후마다, Phase 6 전에 다음을 실행한다: `node <skill-dir>/validate-coverage-ledger.cjs <output-dir>/coverage-ledger.json`. validator는 5 MiB 초과 입력, 중첩 64단계 초과, unit 10,000개 초과, 중첩 collection 항목 1,000개 초과, 순회 값 500,000개 초과를 거부하며 validation 오류는 최대 100개까지 보고한다. 현실적인 unit 약 2,000~5,000개에서 5 MiB 한도가 먼저 걸린다. 작업 배정이나 coverage 주장을 하기 전에 모든 오류를 고친다.
