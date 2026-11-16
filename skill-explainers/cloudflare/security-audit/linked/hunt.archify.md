# 사냥은 hunter와 critic으로 어떻게 돌고 무엇이 후보가 되나 {#security-audit-hunt}

Phase 2에서 parent는 `planned` unit을 hunter에게 배정하고, hunter는 정찰이 고른 지침 원문을 받아 자기 `scratch/`에서 후보를 찾고, critic은 빠진 조사 범위를 제안한다.[](source:hun-assign)[](source:hun-prompt)[](source:hun-critic)

- 후보는 완전한 소스 trace와 가장 강한 통제의 증거를 갖춰야 하고, 저장소 밖 사실에 달린 것은 `needs_validation`으로 둔다.[](source:hun-gate)
- critic이 받아들일 일을 못 찾아야 사냥이 끝나고, `standard`와 `deep`은 별도의 final-clean critic을 한 번 더 쓴다.[](source:hun-loop)

@answer scope="cloudflare/security-audit · HUNTING.md와 ATTACK-CLASSES.md"
@meta locale=ko
@source hun-assign title="hunter 배정" path=cloudflare/security-audit/HUNTING.md lines=3:9
@source hun-prompt title="hunter 지시문 구성" path=cloudflare/security-audit/HUNTING.md lines=11:25
@source hun-method title="핵심 사냥 방법" path=cloudflare/security-audit/HUNTING.md lines=27:97
@source hun-gate title="후보 통과 조건" path=cloudflare/security-audit/HUNTING.md lines=138:157
@source hun-local title="로컬 검증 경계" path=cloudflare/security-audit/HUNTING.md lines=159:166
@source hun-result title="hunter 결과 형식" path=cloudflare/security-audit/HUNTING.md lines=168:213
@source hun-critic title="coverage critic 출력" path=cloudflare/security-audit/HUNTING.md lines=221:245
@source hun-loop title="critic 반복과 프로필·예산 한계" path=cloudflare/security-audit/HUNTING.md lines=247:251
@source atk-intro title="attack class 사용 원칙" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=3:7
@source atk-core title="일반 attack class 일곱 개" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=29:90
@source atk-wild title="Wildcard class" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=92:109
@source atk-obvious title="Obvious things class" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=111:130

## hunter wave와 critic은 어떻게 반복되나 {#flow span=12}

개요의 4~5번째 단계를 자세히 본다. 전체 그림은 [개요](overview.html)에 있다.

@workflow id=hunt-flow title="사냥 반복"
| hunt | Phase 2 hunter wave | backend |
| critic | critic이 더 찾았나? | backend |
| next | Phase 3 후보 검증 | external |
| hunt > critic | wave 종료 | emphasis |
| critic > hunt | 예 |
| critic > next | 아니오 | emphasis |

@steps id=hunt-steps
| s-hunt | Phase 2 hunter wave | `HUNTING.md`를 읽는다. parent가 `planned` unit을 hunter에게 배정하고, hunter 지시문에 `architecture.md` 원문, 배정된 ID, 고른 attack class와 도메인 파일 절의 원문, 제외한 블록과 이유, 사냥 방법을 넣는다. 블록 이름만 보내지 않는다.[](source:hun-prompt) hunter는 자기 `scratch/`에만 쓰고 대상 소스와 공유 파일은 고치지 못하며, 배정된 ID마다 `covered`·`candidate`·`blocked` 중 하나를 담은 JSON 하나를 돌려준다.[](source:hun-assign)[](source:hun-result) 지시문의 아홉 부분과 후보 통과 조건은 아래 참고 패널에 있다. | hunt-flow | hunt |
| s-critic | critic이 더 찾았나? | wave가 끝나면 parent가 새 `research` critic을 띄운다. critic은 소스를 읽기만 하고, 후보가 아니라 빠진 범위(매핑되지 않은 진입점, 근거 없는 제외, 경로 없이 닫힌 unit)를 제안한다.[](source:hun-critic) 받아들일 제안이 있으면 해당 unit을 다시 배정해 wave를 반복한다. `standard`와 `deep`에서는 일을 못 찾은 뒤 별도의 final-clean critic을 한 번 더 쓰고, 이 critic도 못 찾아야 완전 커버리지로 본다.[](source:hun-loop) 예산이나 시간 때문에 일찍 멈추면 손대지 않은 unit을 `deferred`로 두고 보고서에 공개한다.[](source:hun-loop) | hunt-flow | critic |


## hunter 지시문과 후보 통과 조건 {#hunter-detail span=12}

hunter 지시문은 정해진 아홉 부분을 이 순서로 담는다.[](source:hun-prompt)

1. 역할 두 문장
2. `architecture.md` 원문
3. 배정 coverage ID, subsystem, 경계, 시작 경로, unit별 블록 지도
4. 선택한 attack class 블록과 도메인 파일의 `Core discipline`, 고른 절, `Universal moves`, `Validation rules` 원문
5. 제외한 블록과 각 이유
6. 핵심 사냥 방법과 승격 절차 블록
7. 핵심 검증 규칙
8. 이월한 이전 확정 지적의 fingerprint·제목·근본 원인, 동료 hunter가 맡은 ID
9. 경로, allowlist, 결과 계약, `report-schema.json` 분기 원문

사냥 방법은 입력이 parsing, identity, authorization, normalization, 상태, 파생 복사본, 최종 싱크를 지나는 길을 따라가고, sibling·legacy·batch·retry·cancel·migration·error 경로까지 읽으라고 한다. 가장 작은 영향(더미 레코드, 잘못된 반환값)에서 멈춘 뒤 소스 수준의 수정과 회귀 사례를 쓴다.[](source:hun-method)

후보가 통과해야 하는 조건은 다음과 같다.[](source:hun-gate)

- 완전한 repository-relative 소스 trace와 가장 강한 소스 가시 통제의 증거가 있어야 한다.
- `confirmed` 제안은 제한된 로컬 관찰 결과, 경계 너머의 의미 있는 영향, 완전한 조건, 막는 층의 부재를 갖춰야 한다.
- crash를 code execution으로, 일반 작업을 공유 availability 문제로, 같은 주체의 행동을 권한 상승으로 부풀리지 않는다.
- 소스나 로컬로 볼 수 없는 사실이 결정적이면 `needs_validation`으로 두고 심각도를 주지 않는다.
- 영향받는 주체나 자원이 없는 모범 사례 누락은 제외하거나 보강 권고로 둔다.
- 같은 근본 원인은 어느 상태에서나 같은 fingerprint를 쓰고, 통과한 후보가 없으면 빈 배열을 돌려준다.

로컬 실행은 확인용이다. 샌드박스 안의 오프라인 빌드, 격리된 loopback 프로세스, 단위·통합 테스트, 작은 fixture 처리, sanitizer, 제한된 fuzz는 허용되고, 라이브 트래픽, 의존성 설치, 실제 계정, 운영 데이터, 부하 유발은 금지된다.[](source:hun-local)


## 공격 유형(attack class) 아홉 개 {#classes span=12}

에이전트는 먼저 대상 유형에 맞는 class를 고르고 큰 대상은 subsystem별로 나눈다. 모든 class는 찾고, 검증하고, 고치고, 우선순위를 매기는 일로 틀을 잡으며 payload 체인 개발, 라이브 서비스 가용성 시험, 공유 환경 조작은 하지 않는다.[](source:atk-intro)

attack class는 아홉 개이고 모두 `general` agent가 맡는다. 일곱 개는 일반 class이고 나머지 둘은 아래에서 따로 본다.[](source:atk-core)

- `Injection`: 신뢰할 수 없는 입력을 진입점에서 위험한 싱크까지 따라간다. 저장됐다가 다른 코드에서 위험하게 쓰이는 간접 주입과 키·헤더·메타데이터를 통한 주입도 본다.[](source:atk-core)
- `Access control`: 권한 검사가 있는지가 아니라 올바른 자원에 올바른 메커니즘으로 올바른 권한을 검사하는지, 같은 상태 변경에 더 약한 경로가 있는지를 본다.[](source:atk-core)
- `Resource and file handling`: path traversal, SSRF, 역직렬화, 압축 해제, TOCTOU를 본다.[](source:atk-core)
- `Cryptography and secrets`: 약한 난수, 하드코딩된 secret, 키 파생과 nonce 오용을 보고, 암호 처리가 실패했을 때 암호 없는 경로로 되돌아가는지도 본다.[](source:atk-core)
- `Business logic`: 상태 기계 위반, 비원자적 경쟁, 수량 조작, 암묵적 신뢰 가정, 시간 경계, 기본값을 본다.[](source:atk-core)
- `Feature abuse and data leakage`: export, import, search, preview, webhook 같은 정당한 기능의 오남용을 본다.[](source:atk-core)
- `Chained vulnerabilities and trust boundaries`: 개별로는 허용된 동작이 다음 단계의 더 강한 보장을 깨는 지점을 본다. 각 전제를 확인하지 않은 채 다음 효과를 가정하지 않는다.[](source:atk-core)

두 class는 성격이 다르다. `Wildcard`는 카테고리를 받지 않고 표준 class 밖의 취약점을 찾으며, 반쯤 만든 기능, 숨은 endpoint, 기능 조합, git 이력, 테스트가 다루지 않는 곳을 시작점으로 삼되 다른 class와 같은 경계·검증 요구를 지킨다.[](source:atk-wild) `Obvious things`는 하드코딩 secret, 보안 TODO, 디버그 모드, 노출된 `/debug`·`/admin` 같은 endpoint, 커밋된 `.env`, CORS와 cookie 속성, open redirect, 오류 응답의 스택 트레이스를 창의성 없이 글자 그대로 모두 점검하고 항목마다 결과를 보고한다. 단 지적을 보고하려면 전체 코드 경로를 확인해야 하고, 플래그 하나는 finding이 아니다.[](source:atk-obvious)



## 다른 페이지 {#pages span=12}

- [개요: 파일 구조와 6단계 흐름](overview.html)
- [정찰과 시작 전 결정](recon.html)
- [검증과 보고: Phase 3~6](verify.html)
- [강제 규칙과 금지 목록](rules.html)
