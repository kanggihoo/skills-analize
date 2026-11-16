---
name: security-audit
description: 코드 저장소, API, service, CLI 도구, library, daemon의 보안 질문·집중 검토·취약점 조사·감사·침투 테스트를 위한 보안 지침이다. 사용자가 명시적으로 코드 감사·침투 테스트, 전체·종합·end-to-end 검토, 보고서 artifact를 요청한 경우에만 전체 workflow를 실행한다.
---

# 보안 감사

실제 신뢰 경계를 침범하는 취약점을 찾아 소유자에게 소스 근거, 안전한 재현 방법, 우선순위, 가장 작은 효과적인 수정안을 제공한다. 방어 목적의 source-first workflow다. 영향을 받는 주체·리소스나 보안 결과가 구체적이지 않은 후보는 confirmed finding이 아니다.

## 운영 mode

기본은 안내 모드이며, skill을 불러왔다고 전체 감사를 하거나 파일을 만들 권한이 생기는 것은 아니다.

- **안내 모드**: 보안 질문, 집중 검토, 방법론, 분류, 특정 finding 조사는 이 skill의 관련 부분만 사용한다. 여섯 단계를 자동 실행하거나 output directory·감사 artifact를 만들지 않는다. 필요하면 집중 agent를 실행할 수 있으며 결과를 현재 작업에 반환한다.
- **전체 감사 모드**: 사용자가 코드 감사·침투 테스트, 전체·종합·end-to-end 검토 또는 보고서 artifact를 명시적으로 요청하면 전체 workflow를 사용한다. 여섯 단계를 모두 실행하고 아래 파일을 작성한다.

요청이 어느 mode인지 불분명하면 파일을 만들거나 전체 workflow를 시작하기 전에 한 가지 핵심 질문을 한다.

## 플랫폼 용어

이 skill은 agent 플랫폼에 종속되지 않는다.

- **Parent**: 실행을 조정하고 공유 상태를 소유하는 agent.
- **Task tool**: 플랫폼의 위임·sub-agent 기능.
- **`research` agent**: 집중적인 소스 탐색과 사실 확인을 맡는 위임 agent.
- **`general` agent**: 폭넓은 조사와 범위가 제한된 로컬 실행을 맡는 위임 agent.
- heading의 **`subagent_type:`**은 위 두 agent 역할 중 작업자를 지정한다.

역할, 쓰기 격리, prompt, 독립성 경계를 유지하며 동등한 플랫폼 기능을 사용한다.

## 모든 실행에 적용되는 안전 규칙

두 mode 모두 소스 검사는 읽기 전용이다. 대상이 제어하는 build, test, process, browser, emulator, fuzzer, fixture 처리는 다음 조건을 모두 갖춘 OS 강제 sandbox 안에서만 실행한다.

- 외부 network 차단. 로컬 client/server 통신이 필요할 때만 격리 loopback namespace 사용.
- 안전한 값을 담은 명시적 허용 목록으로 구성한 빈 환경. scratch 내부 `HOME`, 임시 폴더, cache 사용.
- 대상과 toolchain은 읽기 전용. 대상 process는 할당된 `scratch/`에만 쓸 수 있음.
- CPU, memory, process, 파일 크기, disk, wall-clock 제한을 낮게 명시.

build가 소스 옆 쓰기를 요구하면 대상 process 바깥의 agent가 할당된 `scratch/`에 임시 소스 복사본을 만들 수 있다. 안내 모드에서는 대상 제어 파일을 보존하지 않는다. 전체 감사 모드에서는 Write isolation 절차에 따라 신뢰된 parent 코드만 최소한의 비밀 아닌 결과를 보존용 `artifacts/`로 승격할 수 있다. agent 전용 `scratch/` 이외의 보존 output directory, 다른 agent directory, host home, credential, socket, 공유 서비스를 대상 코드에 노출하지 않는다. dependency를 설치하거나 build가 내려받게 하지 않는다. 이미 로컬에 있는 tool과 dependency만 사용한다. 통제 하나라도 강제할 수 없으면 대상 코드를 실행하지 말고 부족한 sandbox 기능을 needs-validation blocker로 보고하며 안전한 검증 계획을 제시한다.

가짜 주체, fixture, secret을 사용한다. 배포 endpoint, 외부 service, 공유 infrastructure, 운영 ID, 다른 사용자 데이터, live control plane을 조사하지 않는다. 운영·공유 process에 대한 가용성 시험, artifact 공개, release 변경, 유료 API quota 사용, 결함을 확인하는 데 필요한 최소 로컬 영향 이후의 작업은 금지한다. 결론에 필요한 사실이 소스나 sandbox fixture 밖에 있으면 validation 필요로 보고한다.

## 전체 감사 준비

전체 감사 모드에서는 정찰 전에 아래 값을 정한다.

- **Skill directory**: 이 `SKILL.md`가 든 절대 경로.
- **Target**: 검토할 저장소 root 절대 경로.
- **Repo name**: directory나 로컬 Git remote에서 얻은 안정적인 저장소 ID.
- **Output directory**: target 밖의 새 쓰기 가능 directory. 기본은 `~/security-audit-skill/<repo-name>/run-<N>`이며 `<N>`은 사용되지 않은 다음 번호다. 사용자가 명시적으로 선택하고 parent가 version control에서 전체 경로를 ignore함을 확인한 경우에만 target 안을 쓴다. 아니면 외부 경로를 요청하고 중단한다.
- **Source ref**: 검토할 commit과 worktree 변경 여부. 검토하지 않은 생성·수정 파일을 다른 revision으로 취급하지 않는다.

### 쓰기 격리

parent만 다음 공유 실행 파일을 만든다.

- `run-metadata.json`
- `architecture.md`
- `coverage-ledger.json`
- `findings.json`
- `REPORT.md`
- `FINDINGS-DETAIL.md`
- `NEEDS-VALIDATION.md`

각 hunter·verifier에는 `<output-dir>/agents/<agent-id>/` 아래 고유 root와 별도 `scratch/`, `artifacts/`를 준다. 정규 agent ID는 `^[a-z0-9][a-z0-9_-]{0,63}$`와 일치하고 `con`, `prn`, `aux`, `nul`, `com1`~`com9`, `lpt1`~`lpt9` 같은 Windows 장치 이름이 아니어야 한다. 소문자로 대소문자 충돌을 막는다. agent와 모든 대상 제어 process는 `scratch/`에만 쓸 수 있다. 보존용 `artifacts/`는 parent 소유이며 sandbox에 노출하지 않고 신뢰된 parent 승격 코드만 쓴다. agent는 공유 파일, 대상 소스, 보존 artifact, 다른 agent directory를 수정하지 않는다. `/tmp`나 host home을 쓰기 fallback으로 사용하지 않는다.

실행 전에 parent는 agent의 `scratch/`, `artifacts/` root에 대한 신뢰된 비상속 directory descriptor를 열어 보유하고, 예상 scratch 상대 artifact 허용 목록과 파일별·누적 byte 한도를 기록한다. descriptor는 agent나 sandbox에 전달하지 않는다. sandbox와 하위 process 종료 후 parent의 신뢰된 코드는 허용된 파일을 하나씩 승격한다.

1. 상대 경로를 검증한다. 절대·빈 경로, `.`, `..`, symlink 구성요소를 거부한다.
2. 보유한 scratch root descriptor에서 각 상위 요소를 no-follow directory-relative 연산으로 순회한다. 경로를 다시 열지 않는다.
3. leaf를 no-follow, nonblocking으로 연다.
4. `fstat`으로 일반 파일, link count 1, 파일별·누적 byte 한도 이내인지 확인한다.
5. descriptor에서 읽는 동안에도 한도를 다시 강제한다.
6. 확인한 크기만 복사하고 `fstat`을 재검사해 ID, 유형, link count, 크기 변경을 거부한다.
7. 목적지는 보유한 artifacts root descriptor에서 no-follow directory-relative 방식으로 상위 요소를 순회한다. 기존 요소는 실제 directory여야 한다. 새 directory는 배타적으로 만든 뒤 no-follow로 다시 열어 확인한다.
8. leaf를 link를 따르지 않고 배타적으로 만든다. 목적지가 일반 파일이며 link count 1인지 확인하고 어느 경로도 다시 열지 않은 채 검증된 source descriptor에서 복사한다.
9. POSIX가 아닌 시스템에서도 동등한 race-safe API를 사용한다.
10. scratch를 재귀 복사·glob하지 않고 archive를 artifacts에 풀지 않는다. symlink, FIFO, socket, device, directory, hard link 파일, 변경 중인 파일, 크기 초과 파일을 열거나 승격하지 않는다.
11. 검사를 할 수 없거나 강제할 수 없거나 실패하면 scratch 항목을 폐기한다. 결정적인 근거라면 정확한 승격 blocker와 함께 `needs_validation`으로 남긴다.

hunter·verifier prompt의 [HUNTING.md](HUNTING.md)와 [VALIDATION-AND-REPORTING.md](VALIDATION-AND-REPORTING.md)는 위와 동일한 절차를 같은 순서의 fenced block으로 담는다.

재현 검사는 명령, 정확한 입력, sandbox 제한, 재현에 필요한 허용 환경 변수 이름과 비밀 아닌 안전한 값만 기록한다. ambient 환경, 상속 변수, credential 값, 인증 상태, 무관한 host 경로를 수집·복사하지 않는다. 실행 뒤 redact하지 말고 처음부터 빈 환경으로 시작한다.

위임 전에 parent는 `run-metadata.json`에 최소 `run_id`, `repo`, `target`, `source_ref`, `profile`, `scope_paths`, 설정되지 않았다면 null인 `budget`, `execution_policy: "sandboxed-source-and-local-only"`, 선택 companion 파일, 이전 실행 경로, 공유 파일 소유자, `run_status: "in_progress"`를 쓴다. 사실이 달라질 때만 metadata를 갱신한다. 후보 상태는 coverage ledger와 `findings.json`에 둔다.

## 전체 감사 계획

이 절의 coverage, 이전 실행, profile, budget 요건은 전체 감사 모드에만 적용한다.

### Coverage와 이전 실행

한 번의 pass로 완전하다고 볼 수 없다. 탐색 전에 결정론적 coverage 계획을 만들고 각 agent 결과 후 갱신한다. 안정된 coverage unit은 [RECONNAISSANCE.md](RECONNAISSANCE.md), coverage critic wave는 [HUNTING.md](HUNTING.md)에 정의돼 있다. ledger는 parent만 갱신한다.

이전 실행이 있다면 현재 실행을 계획하기 전에 호환되는 모든 `coverage-ledger.json`, `findings.json`을 읽는다.

1. 관련 현재 소스를 각 이전 record·unit과 비교한다. 이전 source ref만으로 경로가 그대로라고 판단할 수 없다.
2. 관련 소스와 조건이 바뀌지 않았고 근거가 현재 계약도 만족하는 이전 `confirmed`만 현재 후보에 가져온다. 현재 ledger의 `planned` unit에 연결하고 fingerprint를 보존하며, 가져온 원인만 hunter 제외 목록에 둔다. 현재 최종 검증 절차로 보내며 이를 재확인한 Phase 3 verifier가 unit 배정 owner가 되어 `candidate`로 바꾼다.
3. 이전 `confirmed`의 관련 소스가 바뀌면 현재 planned 재검증 unit을 만든다. hunter 제외 목록에 넣지 않는다. 현재 경로와 결과를 독립 검증해야만 confirmed 상태를 유지할 수 있다.
4. 이전 `needs_validation`, `deferred`, `blocked`, `out_of_scope`, 변경 소스 unit을 모두 현재 작업으로 만든다. 외부 blocker가 남은 `needs_validation`만 현재 소스 trace를 확인하고 fingerprint로 현재 `planned` unit에 연결한 뒤 가져올 수 있다. verifier가 재확인해 owner와 근거를 부여하며 blocker는 유지한다. 과거 상태는 현재 unit을 억제하지 않는다.
5. 같은 소스의 이전 covered unit은 우선순위에 참고할 수 있지만 현재 ledger에 남긴다. 이전 rejected는 바뀌지 않은 실패 주장만 억제하고 unit coverage는 계속한다. 근거가 바뀌면 새 작업이다.
6. 이전 profile과 scope도 읽는다. 이전 `quick`·범위 지정 ledger는 기록된 근거와 누락만 제공하며 나머지가 괜찮다는 뜻이 아니다.

이전 ledger가 없다면 최종 coverage 설명에 이를 밝힌다. 한 번의 실행으로 대상을 전부 검토했다고 암시하지 않는다.

### 실행 profile과 범위

전체 감사 준비 시 사용자 요청이나 대상 규모·중요도에 맞춰 profile을 정한다. `run-metadata.json`의 `profile`, `scope_paths`에 기록하고 보고서에도 쓴다. 기본값은 `standard`다.

- **`quick`** — 작은 대상, 재실행, 빠른 첫 확인을 위한 제한 pass. ledger unit을 surface × boundary × attack class로 묶고 subsystem은 정해진 `profile/quick/all-in-scope-subsystems` 식별자를 쓴다. hunter wave 1회와 final coverage critic 1회만 실행한다. 후보마다 새 verifier 한 명이 후보 확인과 최종 record 검증을 맡는다. 후속 hunter wave는 만들지 않고 critic의 수락된 발견·재배정을 `deferred`로 기록한다.
- **`standard`** — 문서에 정의된 workflow 그대로.
- **`deep`** — 중요도가 높거나 규모가 큰 대상. subsystem·수명주기 mode별 unit으로 나누고 critic wave를 깨끗한 종료까지 수행한다. 후보 검증과 최종 record 검증은 서로 다른 새 agent에 맡기며 `prior_covered_same_source` unit은 별도 두 번째 검토를 한다.

**범위 지정 실행**은 경로, subsystem 하나, companion domain 하나, source ref 두 개 사이 diff처럼 일부만 감사한다. 범위 내 surface만 seed해 배정하고 나머지는 `covered`가 아닌 `out_of_scope`로 기록한다. `quick`·범위 지정 실행은 부분 coverage라고 밝혀야 한다.

profile은 범위와 중복성만 조정하고 근거 기준은 낮추지 않는다. 후보 gate, source/local 실행 경계, `needs_validation` 규칙, schema 검증, confirmed 독립 검증은 그대로 유지한다.

#### 비용 budget

ledger로 비용을 계산할 수 있다. unit 하나는 대략 hunter 배정 하나, 살아남은 후보 하나는 profile에 따라 verifier 한두 명에 해당한다. 사용자가 budget을 정했거나 parent가 큰 대상에 budget을 제안하면 모든 phase 전체의 agent 호출 최대값을 `run-metadata.json`의 `budget`에 기록한다.

정찰 agent를 실행하기 전에 엄격한 budget gate를 적용한다. 기본 정찰 호출 4회, `quick`의 최종 post-wave critic 1회 또는 `standard`·`deep`의 post-wave와 별도의 final-clean critic 각 1회, verifier 최소 1회를 예약한다. 집중 정찰을 추가할 때마다 추가 호출에 대해 gate를 다시 계산한다. 요청 budget으로 최소 요건을 충당할 수 없으면 agent를 실행하지 말고 budget 확대·범위 축소·profile 변경을 요청한다. 요청이 그대로면 `run_status: "incomplete"`, `incomplete_reason: "budget_cannot_fund_reconnaissance_and_reserves"`로 기록하고 감사 pass가 실행되지 않았다고 보고한다.

다음 순서로 budget을 쓴다.

1. 정찰, 모든 post-wave critic, 별도 final-clean critic을 각각 agent 호출로 센다.
2. **탐색보다 critic과 검증을 먼저 예약한다.** `quick`은 post-wave final critic 1회를 예약한다. `standard`·`deep`은 각 hunter wave 전에 즉시 실행할 post-wave critic과 별도 final-clean critic을 예약한다. profile상 예상 후보 수에 대한 verifier 비용도 따로 둔다(후보당 약 1~2명, 불확실하면 critic 예약 후 남은 양의 30%). 예약을 hunter에 쓰지 않는다.
3. 우선순위대로 hunting allowance를 쓸 때까지 hunter를 배정한다. wave 직후 예약된 post-wave critic을 쓰고 final-clean·검증 예약은 유지한다.
4. 다음 wave 전에 새 post-wave critic을 다시 예약한다. 남은 budget이 critic과 검증 예약을 감당하지 못하면 해당 wave hunter를 실행하지 않고 planned unit을 `budget_cannot_reserve_critics_and_validation` 사유로 `deferred` 처리한 뒤 남겨둔 final-clean critic으로 누락을 기록한다.

wave 1 전에 seed unit, 필요한 hunter 수, 필수 critic, 검증 예약, 남은 budget으로 계획을 충당할 수 있는지 사전 정찰 추정치를 갱신한다. 명백히 부족하면 근거를 조용히 줄이지 말고 더 좁은 범위나 거친 profile을 제안한다. 이후 사정으로 final critic 예약이 사라지면 hunter를 시작하지 않고 모든 planned 작업을 `deferred` 처리해 `critic_budget_exhausted` 사유로 incomplete 상태를 기록하고 완전 coverage를 주장하지 않는다.

예상보다 후보가 많거나 Phase 5 교체에 독립 verifier가 추가로 필요한 경우 엄격한 총 agent budget을 넘길 수 있다. 남은 budget으로 모든 후보를 검증할 수 없다면 탐색을 중단하고 fingerprint 순서로 가능한 만큼 검증한다. `run_status: "incomplete"`, `incomplete_reason: "validation_budget_exhausted"`로 두고 미검증 fingerprint는 해당 unresolved 사유가 있는 `candidate` ledger unit에 연결한다. 미검증 후보를 `findings.json`에 넣거나 `needs_validation`으로 이름만 바꾸거나 실행 완료로 보고하지 않는다. Phase 6 부분 보고서는 첫 절에서 검증 미완료를 밝히고 영향을 받는 fingerprint·unit을 열거할 때만 작성한다. 사용자 지정 엄격 budget을 조용히 초과하지 않는다.

## 핵심 원칙

### 경계와 결과를 입증

각 후보에서 낮은 신뢰도 주체, 수락된 입력·동작, 의도된 통제, 넘은 경계, 영향받는 주체·리소스, 구체적인 관찰 결과 또는 소유자가 관찰할 결과를 밝힌다. 모범 사례 누락, 추측한 배포 동작, 일반 parser crash, 자기 영향은 보안 finding으로 격상하지 않는다.

### 제한된 로컬 근거 사용

정적 분석으로 소스 경로를 확인한다. 모든 실행 통제가 가능할 때 sandbox 로컬 test로 동작을 확인한다. 최소 function harness, 기존 unit test, 작은 parser fixture, 가짜 tenant integration test, 로컬 설정 렌더링, 제한된 격리 loopback client 등을 사용할 수 있다. 잘못된 반환값, 권한 없는 가짜 record, sanitizer 결과, 정책 차이 등 최소 효과를 확인하면 멈춘다. 경계 결과를 넘는 검증이나 persistence·fault 이후·은폐 자료를 만들지 않는다.

### 소스 가시성 존중

배포 통제, proxy 동작, provider 설정, browser header, identity 정책, broker ACL, packaging, topology도 실제 통제다. 저장소에 없어도 존재나 부재를 추정하지 않는다. 정확한 미확인 사실과 안전한 담당자 확인·로컬 계획을 적어 `needs_validation`으로 둔다.

### 우선순위와 확실성을 분리

severity는 `confirmed`에만 부여한다. likelihood와 impact는 입증된 조건·결과에 맞춰야 하며 전체 severity는 확인된 영향보다 클 수 없다. `needs_validation`은 근거가 약한 confirmed 취약점이 아니라 소스 기반 경계 가설이 구체적인 이유로 막힌 상태이며 severity가 없다.

severity 기준:

- **critical** — 인증되지 않은 공격자가 코드 실행, 전체 data store 접근, 임의 계정 탈취를 얻음.
- **high** — 실제 결과를 동반해 명시적 보안 통제를 완전히 무력화함: 인증 우회, 테넌트 간 읽기·쓰기, 다른 사용자에게 영향을 주는 저장 script 실행, 인증된 코드 실행, 인증 없이 공유 service를 원격 중단.
- **medium** — 실제 경계 위반이나 영향 범위가 제한적이거나 조건이 드물거나 결과가 좁은 리소스에 국한됨.
- **low** — 비밀 아닌 내부 정보 노출 또는 작은 이득을 위해 지속적인 노력이 필요함.
- **informational** — 영향은 최소지만 확인된 관찰로, 더 큰 finding의 전제 조건을 이해하는 데 유용함.

high와 medium 구분 기준은 입증된 결과가 실제 영향을 주는 동작에 대해 명시적 통제를 완전히 무력화하는지, 약화만 하는지다. 구체적인 피해를 설명할 수 없다면 느끼는 것보다 낮은 severity를 적용한다.

### 효과가 있는 최소 소스 수정 권고

confirmed finding마다 코드가 보장해야 할 불변식과 마지막으로 신뢰할 수 있는 판단 지점에서 이를 강제하는 가장 좁은 변경을 찾는다. 일반적인 보안 강화 조언보다 저장소 상대의 구체적 변경과 회귀 test를 우선한다. 감사는 수정을 설명할 뿐 대상 소스 자체를 변경하지 않는다.

## 전체 감사 workflow

전체 감사 모드에서는 여섯 단계를 순서대로 수행한다.

1. **정찰** — [RECONNAISSANCE.md](RECONNAISSANCE.md)로 소스, 신뢰 경계, 로컬 build 경로, companion 선택, 이전 근거, 초기 결정론적 coverage ledger를 만든다.
2. **Coverage 기반 탐색 wave** — ledger의 격리 hunter에게 [HUNTING.md](HUNTING.md), [ATTACK-CLASSES.md](ATTACK-CLASSES.md), 선택한 domain companion으로 작업을 배정하고 구조화 후보 결과를 모은다.
3. **후보 검증** — fingerprint를 통합하고 [VALIDATION-AND-REPORTING.md](VALIDATION-AND-REPORTING.md)에 따라 모든 후보를 새 source verifier에게 맡긴다.
4. **구조화 출력** — 최종 `confirmed`, `needs_validation`, `rejected` record를 모두 `findings.json`에 작성한다. `report-schema.json`과 `validate-findings.cjs`로 검증하고 coverage 주장은 `validate-coverage-ledger.cjs`로 확인한다.
5. **독립 record 검증** — 새 agent가 최종 소스 주장을 검증하고 수정·상태 변경을 조정한다.
6. **대상 중립 보고서** — 최종 record에서 실제 대상 probe 지침 없이 `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md`를 만든다.

다음 둘 중 하나의 종료 상태가 되기 전에 실행을 끝내지 않는다: (a) Phase 6 artifact가 모두 작성되고 validator 둘 다 통과, 또는 (b) 정확한 이유와 함께 `run_status: "incomplete"`를 기록하고 보고서에 누락을 공개. phase 중간에 멈추지 않는다.

## Anti-pattern

1. checklist에서 벗어난 점을 취약점으로 제시.
2. 도달 가능한 경계 위반이 없는 defense-in-depth 조언.
3. 제한 로컬 근거가 충분하지 않은데 운영·공유 환경 시험.
4. 소스에 없는 provider, proxy, browser, identity, 배포 동작 추측.
5. 의도된 동일 주체 권한이나 자기 영향을 경계 간 영향으로 취급.
6. parser·runtime 효과를 관찰보다 강하게 보고.
7. 중복 제거·검증이 불가능한 서술형 hunter 결과만 제출.
8. 가져온 동일 소스의 이전 confirmed를 다시 보고하거나 탐색을 고정하는 예시로 사용.
9. `needs_validation` record에 severity 부여.
10. 독립 검증 전에 보고서를 쓰거나 설명과 JSON을 불일치하게 둠.
