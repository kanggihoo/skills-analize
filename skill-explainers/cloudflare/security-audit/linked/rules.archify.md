# 에이전트에게 강제되는 규칙과 하지 않는 일 {#security-audit-rules}

`security-audit`이 에이전트에게 강제하는 것은 실행 안전, 증거 기준, 심각도, 수정 권고, 금지 패턴 다섯 묶음이다.[](source:skm-safety)[](source:skm-anti)

- 샌드박스 통제를 하나라도 못 걸면 대상 코드를 실행하지 않는다.[](source:skm-safety)
- 짐작한 배포 동작과 모범 사례 누락은 보안 finding으로 올리지 않는다.[](source:skm-boundary)

@answer scope="cloudflare/security-audit · SKILL.md의 규칙"
@meta locale=ko
@source skm-purpose title="목적 정의" path=cloudflare/security-audit/SKILL.md lines=6:8
@source skm-modes title="운영 모드 선택" path=cloudflare/security-audit/SKILL.md lines=10:17
@source skm-safety title="실행 안전 규칙" path=cloudflare/security-audit/SKILL.md lines=31:42
@source skm-promote title="산출물 승격 절차" path=cloudflare/security-audit/SKILL.md lines=68:82
@source skm-boundary title="경계와 결과 요구" path=cloudflare/security-audit/SKILL.md lines=138:140
@source skm-local title="제한된 로컬 근거" path=cloudflare/security-audit/SKILL.md lines=142:144
@source skm-visibility title="소스 가시성" path=cloudflare/security-audit/SKILL.md lines=146:148
@source skm-priority title="심각도와 확실성 분리" path=cloudflare/security-audit/SKILL.md lines=150:162
@source skm-fix title="최소 수정 권고" path=cloudflare/security-audit/SKILL.md lines=164:166
@source skm-anti title="안티패턴" path=cloudflare/security-audit/SKILL.md lines=181:192
@source hun-promote title="승격 절차 블록" path=cloudflare/security-audit/HUNTING.md lines=99:136
@source val-promote title="승격 절차 블록" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=48:85

## 샌드박스 규칙 {#sandbox span=12}

@callout level=warning title="통제를 하나라도 못 걸면 대상 코드를 실행하지 않는다"
| 대상이 통제하는 빌드, 테스트, 프로세스, 브라우저, emulator, fuzzer, fixture 처리는 OS가 강제하는 샌드박스 안에서만 돌린다. 샌드박스는 외부 네트워크 차단(로컬 클라이언트·서버 통신이 필요하면 격리된 loopback만), 명시한 허용 목록(allowlist)으로 채운 빈 환경(`HOME`·임시 폴더·캐시는 `scratch/` 안), 읽기 전용 대상과 toolchain(대상 프로세스는 자기 `scratch/`에만 쓰기), 명시적인 낮은 CPU·메모리·프로세스·파일 크기·디스크·실행 시간 상한을 모두 제공해야 한다.[](source:skm-safety) |
| 하나라도 강제할 수 없으면 대상 코드를 실행하지 않고, 빠진 샌드박스 기능을 `needs_validation` 막힌 이유로 보고하며 안전한 검증 계획을 준다.[](source:skm-safety) |



## 규칙 전체 {#rules span=12}

에이전트에게 강제되는 규칙은 실행 안전, 증거 기준, 심각도, 수정 권고, 금지 패턴 다섯 묶음이다.

실행 안전 규칙은 두 모드에 모두 적용된다. 에이전트는 더미 주체·fixture·secret만 쓰고, 배포된 endpoint, 외부 서비스, 공유 인프라, 운영 계정, 다른 사용자의 데이터, 라이브 control plane을 건드리지 않는다.[](source:skm-safety) 그 밖에 하지 않는 일은 다음과 같다.

- 라이브·공유 프로세스의 가용성을 시험하지 않는다.[](source:skm-safety)
- artifact를 게시하거나 release를 바꾸지 않는다.[](source:skm-safety)
- 유료 API 한도를 쓰지 않는다.[](source:skm-safety)
- 결함 하나를 세우는 데 필요한 최소 로컬 효과를 넘어서지 않는다.[](source:skm-safety)
- 의존성을 설치하거나 빌드가 내려받게 하지 않는다.[](source:skm-safety)

결정적 사실이 소스나 샌드박스 fixture 밖에 있으면 `needs_validation`으로 보고한다.[](source:skm-safety)

대상 코드가 만든 파일은 `scratch/` 안에서 대상 통제 하에 있다. 전체 감사에서 보존할 증거는 신뢰된 parent 쪽 코드만 `artifacts/`로 승격한다.[](source:skm-promote)

승격은 허용 목록에 미리 적은 파일마다 따로 한다. 경로가 절대 경로이거나 비었거나 `.`·`..`·symlink 구성요소를 담으면 거부하고, 디렉터리 descriptor를 따라 no-follow로 걷는다. 파일이 regular file이고 link count가 정확히 1이며 크기 상한 안인지 `fstat`으로 확인한 뒤, 같은 descriptor에서 복사해 `artifacts/`에 배타적으로 만든다.[](source:skm-promote)

`scratch/`를 재귀 복사하거나 glob하지 않고 아카이브를 풀지 않으며, symlink·FIFO·socket·device·directory·hard link 파일·변하는 파일·상한을 넘는 파일은 열거나 승격하지 않는다. 확인이 하나라도 불가능하거나 실패하면 그 항목을 버리고, 결정적 증거라면 `needs_validation`과 정확한 승격 막힘 이유를 남긴다.[](source:skm-promote)

이 절차는 열한 단계이고, 원문은 `HUNTING.md`와 `VALIDATION-AND-REPORTING.md`가 같은 순서의 동일한 블록을 담는다고 적는다.[](source:skm-promote) 분석 중 두 블록의 텍스트 해시를 비교하니 같았다.[](source:hun-promote)[](source:val-promote)

증거 기준은 세 가지다.

- 경계와 결과: 후보마다 낮은 신뢰 주체, 받아들인 입력이나 행동, 의도된 통제, 넘은 경계, 영향받는 주체나 자원, 구체적으로 관찰했거나 소유자가 관찰할 수 있는 결과를 이름 붙인다. 모범 사례 누락, 짐작한 배포 동작, 일반적인 parser crash, 자기 영향은 보안 finding으로 올리지 않는다.[](source:skm-boundary)
- 제한된 로컬 근거: 소스 경로는 정적 분석으로 세우고 동작은 최소 함수 harness, 기존 단위 테스트, 작은 parser fixture, 더미 테넌트 통합 테스트, 로컬 렌더링 설정, 격리된 loopback 클라이언트로 확인한다. 잘못된 반환값이나 더미 레코드 같은 최소 효과에서 멈추고 지속성·사후 결함·은폐 자료를 만들지 않는다.[](source:skm-local)
- 소스 가시성: 배포 통제·proxy·provider 설정·브라우저 헤더·identity 정책·broker ACL·패키징·토폴로지는 실제 통제다. 필요한데 저장소에 없으면 있다고도 없다고도 가정하지 않고, `needs_validation`으로 정확한 누락 사실과 안전한 소유자 관찰·로컬 계획을 적는다.[](source:skm-visibility)

심각도는 확실성과 분리한다. `confirmed` 기록만 심각도를 받고, `likelihood`와 `impact`는 입증된 조건과 결과를 반영해야 하며 전체 심각도는 입증된 영향을 넘을 수 없다. `needs_validation`은 소스에 근거한 특정 경계 가설이 막힌 상태이지 확신이 낮은 취약점이 아니며 심각도가 없다.[](source:skm-priority)

| 심각도 | 기준 |
| --- | --- |
| `critical` | 인증 없는 행위자가 code execution, 데이터 저장소 전체 접근, 임의 계정 탈취를 얻는다[](source:skm-priority) |
| `high` | 행위자가 명시적 보안 통제를 완전히 무력화하고 실제 결과가 따른다. 인증 우회, cross-tenant 읽기·쓰기, 다른 사용자에게 영향 주는 저장형 스크립트 실행, 인증된 code execution, 공유 서비스의 인증 없는 원격 중단이 예다[](source:skm-priority) |
| `medium` | 실제 경계 위반이지만 영향 범위가 제한적이거나 전제 조건이 드물거나 결과가 좁은 자원에 갇힌다[](source:skm-priority) |
| `low` | 비밀이 아닌 내부 정보 노출이거나, 지속적 노력이 필요하고 얻는 것이 작은 효과[](source:skm-priority) |
| `informational` | 확정됐지만 영향이 미미하고 더 큰 finding의 전제로 쓸모가 있는 관찰[](source:skm-priority) |

`high`와 `medium`을 가르는 질문은 입증된 결과가 실제 결과가 있는 행동에 대해 명시적 통제를 완전히 무력화했는지, 약화만 했는지다. 구체적 피해를 말할 수 없다면 심각도는 느낌보다 낮다.[](source:skm-priority)

수정은 가장 작은 효과적 소스 변경으로 쓴다. `confirmed` 기록마다 코드가 강제해야 할 불변 조건과 마지막 신뢰 결정 지점의 가장 좁은 변경을 찾고, 일반적인 보강 조언보다 저장소 상대 경로의 구체적 변경과 회귀 테스트를 선호한다. 감사는 수정을 기술할 뿐 대상 소스를 고치지 않는다.[](source:skm-fix)

금지되는 패턴은 열 가지다.

| 번호 | 하지 않는 것 |
| --- | --- |
| 1 | 체크리스트 위반을 취약점처럼 제시하기[](source:skm-anti) |
| 2 | 도달 가능한 경계 위반 없이 defense-in-depth 조언만 하기[](source:skm-anti) |
| 3 | 제한된 로컬 근거로 모자랄 때 라이브·공유 환경에서 시험하기[](source:skm-anti) |
| 4 | 소스에 없는 provider·proxy·브라우저·identity·배포 동작을 짐작하기[](source:skm-anti) |
| 5 | 같은 주체의 의도된 권한이나 자기 영향을 경계 넘는 결과로 다루기[](source:skm-anti) |
| 6 | 관찰한 것보다 강한 parser·런타임 효과를 보고하기[](source:skm-anti) |
| 7 | 중복 제거와 검증이 불가능한 서술만 있는 hunter 결과 내기[](source:skm-anti) |
| 8 | 이월한 같은 소스의 이전 확정 기록을 다시 보고하거나 사냥을 고정하는 예시로 쓰기[](source:skm-anti) |
| 9 | `needs_validation` 기록에 심각도 주기[](source:skm-anti) |
| 10 | 독립 검증 전에 보고서를 쓰거나 서술과 JSON이 어긋나게 두기[](source:skm-anti) |

이 스킬을 쓰지 말아야 하거나 전체 감사로 키우면 안 되는 경우는 다음과 같다.

- 요청이 안내와 전체 감사 중 어느 쪽인지 모호하면 질문 없이 전체 워크플로를 시작하지 않는다.[](source:skm-modes)
- 샌드박스 통제를 하나라도 못 걸면 대상 코드를 실행하지 않고 소스 검토와 검증 계획까지만 한다.[](source:skm-safety)
- 결정적 사실이 라이브 배포나 공유 인프라에 있으면 거기를 조사하지 않고 `needs_validation`으로 넘긴다.[](source:skm-safety)[](source:skm-visibility)
- 대상 소스를 고쳐 달라는 요청에도 이 스킬은 수정안을 기술만 하고 고치지 않는다.[](source:skm-fix)
- 판정: 보안 체크리스트 점검이나 defense-in-depth 권고만 원하는 요청은 이 스킬의 목적(실제 신뢰 경계를 넘는 취약점)과 맞지 않는다.[](source:skm-purpose)[](source:skm-anti)

보안과 무관한 작업 유형을 이 스킬이 제외한다는 명시 목록은 원문에 명시 없음이다.


## 다른 페이지 {#pages span=12}

- [개요: 파일 구조와 6단계 흐름](overview.html)
- [정찰과 시작 전 결정](recon.html)
- [사냥: hunter wave와 critic](hunt.html)
- [검증과 보고: Phase 3~6](verify.html)
