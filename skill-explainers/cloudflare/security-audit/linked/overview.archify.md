# security-audit 스킬은 에이전트의 보안 점검을 어떻게 바꾸나 {#security-audit-overview}

`security-audit`은 코드베이스에서 실제 신뢰 경계를 넘는 취약점만 골라, 소스 근거와 안전한 재현 방법, 우선순위, 가장 작은 수정안을 소유자에게 보고하도록 에이전트를 이끄는 보안 감사 스킬이다.[](source:skm-purpose)

- 보안 질문에는 안내 모드로 답하고, 코드베이스 audit나 전체 보안 리뷰, 보고서 산출물을 요청받았을 때만 6단계 전체 감사 모드가 켜진다. 모호하면 파일을 만들기 전에 질문을 하나 한다.[](source:skm-modes)
- 폴더의 파일은 세 층이다. `SKILL.md`가 전체를 진행하고, 단계별 파일 네 개는 해당 단계에서 읽고, 도메인 파일 열 개는 정찰이 고른 것만 hunter(취약점을 찾는 하위 에이전트) 지시문에 원문으로 복사한다.[](source:atk-route)[](source:hun-prompt)
- 후보는 확정이 아니다. 그 후보를 사냥하지 않은 새 에이전트(verifier)가 반박해 보고 살아남아야 `confirmed`가 되고, 심각도는 `confirmed`에만 붙는다.[](source:skm-priority)[](source:val-decide)
- 에이전트는 대상 소스를 고치지 않고, 배포된 endpoint에 접속하지 않으며, 샌드박스 통제를 모두 걸 수 없으면 대상 코드를 실행하지 않는다.[](source:skm-safety)[](source:skm-fix)

@answer scope="cloudflare/security-audit · 개요 · 지시상 동작"
@meta locale=ko
@source skm-fm title="frontmatter" path=cloudflare/security-audit/SKILL.md lines=1:4
@source skm-purpose title="목적 정의" path=cloudflare/security-audit/SKILL.md lines=6:8
@source skm-modes title="운영 모드 선택" path=cloudflare/security-audit/SKILL.md lines=10:17
@source skm-terms title="agent 역할 용어" path=cloudflare/security-audit/SKILL.md lines=19:29
@source skm-safety title="실행 안전 규칙" path=cloudflare/security-audit/SKILL.md lines=31:42
@source skm-isolation title="쓰기 격리" path=cloudflare/security-audit/SKILL.md lines=54:66
@source skm-budget title="비용 예산" path=cloudflare/security-audit/SKILL.md lines=119:134
@source skm-priority title="심각도와 확실성 분리" path=cloudflare/security-audit/SKILL.md lines=150:162
@source skm-fix title="최소 수정 권고" path=cloudflare/security-audit/SKILL.md lines=164:166
@source skm-workflow title="6단계와 종료 상태" path=cloudflare/security-audit/SKILL.md lines=168:179
@source rec-agents title="정찰 agent 네 개" path=cloudflare/security-audit/RECONNAISSANCE.md lines=9:57
@source rec-arch title="architecture.md와 companion 선택" path=cloudflare/security-audit/RECONNAISSANCE.md lines=73:88
@source rec-ledger title="ledger와 coverage_id" path=cloudflare/security-audit/RECONNAISSANCE.md lines=90:102
@source rec-unit title="ledger 단위 필드" path=cloudflare/security-audit/RECONNAISSANCE.md lines=104:139
@source rec-state title="상태 표와 검증기 실행" path=cloudflare/security-audit/RECONNAISSANCE.md lines=141:156
@source hun-assign title="hunter 배정" path=cloudflare/security-audit/HUNTING.md lines=3:9
@source hun-prompt title="hunter 지시문 구성" path=cloudflare/security-audit/HUNTING.md lines=11:25
@source hun-result title="hunter 결과 형식" path=cloudflare/security-audit/HUNTING.md lines=168:213
@source hun-consol title="ledger 갱신과 후보 통합" path=cloudflare/security-audit/HUNTING.md lines=215:219
@source hun-critic title="coverage critic 출력" path=cloudflare/security-audit/HUNTING.md lines=221:245
@source hun-loop title="critic 반복과 프로필·예산 한계" path=cloudflare/security-audit/HUNTING.md lines=247:251
@source val-p3 title="Phase 3 검증 배정" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=3:7
@source val-prompt title="verifier 지시문" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=9:46
@source val-decide title="판정 승격·강등·기각" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=87:93
@source val-p4 title="findings.json 작성" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=95:118
@source val-p5 title="최종 기록 검증" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=120:149
@source val-p6 title="보고서 세 개" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=151:186
@source atk-route title="companion 파일 연결" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=9:27
@source ai-core title="AI·LLM 사용 조건과 핵심 원칙" path=cloudflare/security-audit/AI-AND-LLM.md lines=3:18
@source cs-core title="클라이언트 사용 조건과 핵심 원칙" path=cloudflare/security-audit/CLIENT-SIDE.md lines=3:17
@source cd-core title="cloud 사용 조건과 핵심 원칙" path=cloudflare/security-audit/CLOUD-AND-DEPLOYMENT.md lines=3:17
@source di-core title="데이터 격리 사용 조건과 핵심 원칙" path=cloudflare/security-audit/DATA-ISOLATION-AND-LIFECYCLE.md lines=3:17
@source dm-core title="데스크톱·모바일 사용 조건과 핵심 원칙" path=cloudflare/security-audit/DESKTOP-MOBILE-AND-LOCAL-IPC.md lines=3:17
@source ms-core title="메모리 안전 사용 조건과 핵심 원칙" path=cloudflare/security-audit/MEMORY-SAFETY-AND-BINARY.md lines=3:17
@source pr-core title="프로토콜 사용 조건과 핵심 원칙" path=cloudflare/security-audit/PROTOCOLS-RPC-AND-MESSAGING.md lines=3:17
@source re-core title="자원 고갈 사용 조건과 핵심 원칙" path=cloudflare/security-audit/RESOURCE-EXHAUSTION-AND-AVAILABILITY.md lines=3:17
@source sc-core title="공급망 사용 조건과 핵심 원칙" path=cloudflare/security-audit/SUPPLY-CHAIN-AND-RELEASE.md lines=3:17
@source wp-core title="HTTP·인증 사용 조건과 핵심 원칙" path=cloudflare/security-audit/WEB-PROTOCOL-AND-AUTH.md lines=3:17
@source vf-semantic title="의미 검사" path=cloudflare/security-audit/validate-findings.cjs lines=485:583
@source vf-run title="실행 진입점" path=cloudflare/security-audit/validate-findings.cjs lines=703:757
@source vl-run title="실행 진입점" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=808:853

## 어떤 요청에 켜지고, 켜지면 무엇이 달라지나 {#modes span=12}

스킬을 불러온 것만으로는 전체 감사가 시작되지 않는다. 에이전트가 요청을 읽어 안내 모드와 전체 감사 모드 중 하나를 고른다.[](source:skm-modes)

| 항목 | 안내 모드 | 전체 감사 모드 |
| --- | --- | --- |
| 이런 요청에 | 보안 질문, 집중 리뷰, 특정 지적 확인, 방법론 문의[](source:skm-modes) | 코드베이스 audit·pen-test, 전체·종합·end-to-end 리뷰, 보고서 산출물 요청[](source:skm-modes) |
| 진행 | 요청과 관련된 부분만 쓰고 6단계를 자동으로 돌리지 않는다[](source:skm-modes) | 6단계를 순서대로 모두 따른다[](source:skm-workflow) |
| 파일 | 출력 폴더와 감사 산출물을 만들지 않는다[](source:skm-modes) | 출력 폴더에 공유 파일 일곱 개와 agent별 폴더를 쓴다[](source:skm-isolation) |
| 어느 쪽인지 모호할 때 | 파일을 만들거나 워크플로를 시작하기 전에 질문을 하나 한다[](source:skm-modes) | 같음 |

아래 frontmatter가 스킬의 호출 관련 선언 전부다. `description`은 모델이 켤지 판단할 때 참고하는 설명이고, 문구가 일치해야 켜지는 사전이 아니다. 호출을 제한하는 필드는 frontmatter에 없고, 제한 여부는 원문에 명시 없음이다.[](source:skm-fm)

@code source=skm-fm language=yaml

두 모드에 똑같이 적용되는 안전 규칙이 있다. 에이전트는 더미 주체·fixture·secret만 쓰고, 배포된 endpoint, 외부 서비스, 공유 인프라, 운영 계정을 건드리지 않는다.[](source:skm-safety)

@callout level=warning title="통제를 하나라도 못 걸면 대상 코드를 실행하지 않는다"
| 대상이 통제하는 빌드, 테스트, 프로세스, 브라우저, emulator, fuzzer, fixture 처리는 OS가 강제하는 샌드박스 안에서만 돌린다. 샌드박스는 외부 네트워크 차단(로컬 클라이언트·서버 통신이 필요하면 격리된 loopback만), 명시한 허용 목록(allowlist)으로 채운 빈 환경(`HOME`·임시 폴더·캐시는 `scratch/` 안), 읽기 전용 대상과 toolchain(대상 프로세스는 자기 `scratch/`에만 쓰기), 명시적인 낮은 CPU·메모리·프로세스·파일 크기·디스크·실행 시간 상한을 모두 제공해야 한다.[](source:skm-safety) |
| 하나라도 강제할 수 없으면 대상 코드를 실행하지 않고, 빠진 샌드박스 기능을 `needs_validation` 막힌 이유로 보고하며 안전한 검증 계획을 준다.[](source:skm-safety) |



## 파일은 어떻게 나뉘고 어떻게 이어지나 {#structure span=12}

폴더의 파일은 세 층이다. 사용자와 대화하는 메인 에이전트(`parent`)가 `SKILL.md`의 규칙으로 전체를 진행하고, 단계마다 해당 파일을 읽는다. 도메인 파일은 `parent`가 정찰 결과와 맞는 절만 골라 hunter 지시문에 붙여 넣는다.[](source:skm-terms)[](source:hun-prompt)

@tree id=file-tree title="security-audit 폴더의 세 층"
| f-root | security-audit/ | - |
| f-l1 | 총괄 | f-root |
| f-skill | SKILL.md | f-l1 |
| f-l2 | 단계별 지침 | f-root |
| f-rec | RECONNAISSANCE.md | f-l2 |
| f-hun | HUNTING.md | f-l2 |
| f-atk | ATTACK-CLASSES.md | f-l2 |
| f-val | VALIDATION-AND-REPORTING.md | f-l2 |
| f-l3 | 도메인 지침 (고른 것만 사용) | f-root |
| f-ai | AI-AND-LLM.md | f-l3 |
| f-web | WEB-PROTOCOL-AND-AUTH.md | f-l3 |
| f-cli | CLIENT-SIDE.md | f-l3 |
| f-mem | MEMORY-SAFETY-AND-BINARY.md | f-l3 |
| f-cld | CLOUD-AND-DEPLOYMENT.md | f-l3 |
| f-rpc | PROTOCOLS-RPC-AND-MESSAGING.md | f-l3 |
| f-dat | DATA-ISOLATION-AND-LIFECYCLE.md | f-l3 |
| f-dsk | DESKTOP-MOBILE-AND-LOCAL-IPC.md | f-l3 |
| f-res | RESOURCE-EXHAUSTION-AND-AVAILABILITY.md | f-l3 |
| f-sup | SUPPLY-CHAIN-AND-RELEASE.md | f-l3 |

그림의 파일마다 언제 읽고 무엇을 하는지는 이렇다.

| 파일 | 읽는 때 | 하는 일 |
| --- | --- | --- |
| `SKILL.md` | 전체 감사 내내 | 모드 선택, 예산·프로필, 샌드박스 안전 규칙, 쓰기 격리, 6단계 순서와 종료 상태[](source:skm-workflow) |
| `RECONNAISSANCE.md` | Phase 1 | 대상을 조사하고, 도메인 파일을 고르고, 조사 범위 목록(`coverage-ledger.json`)을 만든다[](source:rec-arch)[](source:rec-ledger) |
| `HUNTING.md` | Phase 2 | hunter 지시문 조립법, 사냥 방법, 결과 형식, critic 반복[](source:hun-prompt)[](source:hun-loop) |
| `ATTACK-CLASSES.md` | Phase 1~2 | 공격 유형 아홉 개와 "대상이 이러면 이 도메인 파일을 쓴다"는 안내표[](source:atk-route) |
| `VALIDATION-AND-REPORTING.md` | Phase 3~6 | 새 verifier의 검증, `findings.json`, 최종 기록 검증, 보고서 세 개[](source:val-p3)[](source:val-p6) |
| `report-schema.json`, `validate-*.cjs` | Phase 4 | `findings.json`과 ledger의 형식을 기계로 검사한다[](source:vf-run)[](source:vl-run) |

이 페이지는 아래 이름을 원문 그대로 쓴다.[](source:skm-terms)[](source:hun-assign)

@facts
| parent | 전체를 조율하고 공유 파일 일곱 개를 혼자 쓰는 메인 에이전트 |
| hunter | 배정된 조사 범위에서 취약점 후보를 찾는 하위 에이전트(`general` agent) |
| critic | 빠진 조사 범위만 제안하는 새 `research` agent. 후보는 내지 않는다 |
| verifier | 그 후보를 사냥하지 않은 새 agent. 후보를 반박해 본다 |
| ledger | `coverage-ledger.json`. 조사 범위를 한 줄(unit)씩 쪼갠 작업 목록 |
| fingerprint | 같은 근본 원인의 후보에 붙는 고정 식별자. 중복 제거 기준 |

도메인 파일 열 개는 `ATTACK-CLASSES.md`가 안내하고, 각 파일의 `When to use this file` 조건이 정찰에서 실제로 보였을 때만 고른다. 파일마다 켜지는 경계와, 그 영역에서 단독으로는 finding이 되지 못하는 것은 아래와 같다.[](source:atk-route)[](source:rec-arch)

| 파일 | 켜지는 경계 | 단독으로는 부족한 것 |
| --- | --- | --- |
| `AI-AND-LLM.md` | 언어 모델이 신뢰가 필요한 결정에 관여할 때(챗봇, RAG, 에이전트 기억, tool-calling, MCP, 모델 출력을 실행하는 코드)[](source:ai-core) | prompt injection 자체. 코드 수준의 경계 실패가 있어야 한다[](source:ai-core) |
| `CLIENT-SIDE.md` | 신뢰 결정이나 신뢰할 수 없는 렌더링이 브라우저에서 일어날 때(SPA, 확장, webview, service worker, DOM)[](source:cs-core) | 자기 자신에게 주입하기, 공격자 자신의 데이터 공개[](source:cs-core) |
| `CLOUD-AND-DEPLOYMENT.md` | 저장소가 cloud identity, IaC, 컨테이너, Kubernetes, mesh, serverless, ingress, 환경별 설정을 정의할 때[](source:cd-core) | manifest만 보고 추론한 live 노출, secret 참조[](source:cd-core) |
| `DATA-ISOLATION-AND-LIFECYCLE.md` | 다중 테넌트 데이터, 파생 복사본(search·cache·analytics), export·restore, migration, 삭제·폐기 약속이 있을 때[](source:di-core) | 레코드의 tenant 필드, 프라이버시 선호[](source:di-core) |
| `DESKTOP-MOBILE-AND-LOCAL-IPC.md` | 데스크톱·모바일 앱, 권한 있는 helper, updater, 로컬 daemon, deep link, 로컬 IPC가 있을 때[](source:dm-core) | 같은 계정과 권한 안에서의 자해[](source:dm-core) |
| `MEMORY-SAFETY-AND-BINARY.md` | 메모리 안전하지 않거나 권한 있는 맥락에서 신뢰할 수 없는 바이트를 처리할 때(C/C++, Rust `unsafe`, FFI, 커널, parser, 로더, JIT)[](source:ms-core) | 현실적 입력이 닿지 않는 panic·crash[](source:ms-core) |
| `PROTOCOLS-RPC-AND-MESSAGING.md` | gRPC, GraphQL transport, Protobuf, 커스텀 프로토콜, queue·broker·pub/sub, webhook을 쓸 때[](source:pr-core) | "internal"이라는 이유만으로 인증된 것으로 보는 가정[](source:pr-core) |
| `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md` | 신뢰할 수 없는 작업이 공유 CPU·메모리·디스크·연결·worker·유료 API를 소모하거나 공유 서비스를 중단시킬 수 있을 때[](source:re-core) | rate limit이 없다는 사실[](source:re-core) |
| `SUPPLY-CHAIN-AND-RELEASE.md` | 의존성 해석, 신뢰할 수 없는 기여의 빌드, CI, 서명·승격, plugin, 업데이트가 있을 때[](source:sc-core) | 가변이거나 알려진 취약점이 있는 의존성[](source:sc-core) |
| `WEB-PROTOCOL-AND-AUTH.md` | HTTP 파싱·캐싱, 브라우저 인증, 세션, JWT, OAuth/OIDC, SAML, MFA, passkey, API key, mTLS가 있을 때[](source:wp-core) | 헤더·cookie 속성·MFA 프롬프트·rate limit 하나의 누락[](source:wp-core) |


@callout level=note title="라우팅 기준"
| 언어나 의존성 이름이 보인다는 이유로 도메인 파일을 고르지 않는다. 그 파일의 `When to use this file` 경계가 정찰에서 실제로 발견되었을 때 고른다. 또 다른 agent가 비슷한 attack class를 본다는 이유로 눈에 보이는 경계를 제외하지 않는다. 고르지 않은 블록은 이유와 함께 ledger 단위의 `excluded_blocks`에 적는다.[](source:rec-arch)[](source:rec-unit) |


## 전체 감사는 6단계를 어떻게 돌리나 {#flow span=12}

전체 감사의 에이전트는 6단계를 순서대로 모두 따르고, 끝낼 수 있는 상태는 정확히 둘이다. 하나는 산출물을 모두 쓰고 검증기 둘이 통과한 상태이고, 다른 하나는 `run_status: "incomplete"`와 정확한 이유를 적고 보고서에 빈틈을 밝힌 상태다.[](source:skm-workflow)

@workflow id=audit-flow title="전체 감사의 6단계"
| budget | 예산이 충분한가? | backend |
| halt | incomplete로 중단 | security |
| recon | Phase 1 정찰 | backend |
| hunt | Phase 2 hunter wave | backend |
| critic | critic이 더 찾았나? | backend |
| verify | Phase 3 후보 검증 | backend |
| write | Phase 4 findings.json | backend |
| valid | 검증기 둘 통과? | backend |
| final | Phase 5 최종 기록 검증 | backend |
| report | Phase 6 보고서 | backend |
| budget > halt | 부족 |
| budget > recon | 충분 | emphasis |
| recon > hunt | ledger 완성 | emphasis |
| hunt > critic | wave 종료 | emphasis |
| critic > hunt | 예 |
| critic > verify | 아니오 | emphasis |
| verify > write | | emphasis |
| write > valid | | emphasis |
| valid > write | 오류 |
| valid > final | 통과 | emphasis |
| final > report | | emphasis |


이 그림은 핵심 경로와 되돌림 두 곳(critic 이후 wave 반복, 검증기 오류 수정)만 그렸다. 생략한 경로(Phase 5의 대체 기록 반복, 추가 정찰, 프로필별 변형, `incomplete`로 끝나는 다른 경로)는 각 상세 페이지에 있다.


@steps id=audit-steps
| s-budget | 예산이 충분한가? | 전체 감사로 정해지면 parent가 다섯 값과 프로필(기본 `standard`), 예산을 정하고, 정찰 전에 최소 예산을 확인한다.[](source:skm-budget) [시작 전 결정 상세](recon.html) | audit-flow | budget |
| s-halt | incomplete로 중단 | 예산이 최소를 감당하지 못하면 agent를 띄우지 않고 더 큰 예산, 좁은 범위, 다른 프로필을 요청한다. 요청이 그대로이면 `run_status: "incomplete"`로 끝난다.[](source:skm-budget) [시작 전 결정 상세](recon.html) | audit-flow | halt |
| s-recon | Phase 1 정찰 | parent가 읽기 전용 `research` agent 네 개로 대상을 조사하고, `architecture.md`를 쓰고, 도메인 파일을 고르고, 조사 범위 목록(`coverage-ledger.json`)을 만든다.[](source:rec-agents)[](source:rec-ledger) [정찰 상세](recon.html) | audit-flow | recon |
| s-hunt | Phase 2 hunter wave | parent가 unit을 hunter에게 배정한다. hunter 지시문에는 정찰이 고른 attack class와 도메인 파일 절이 원문으로 들어가고, hunter는 자기 `scratch/`에만 쓰며 결과 JSON 하나를 돌려준다.[](source:hun-prompt)[](source:hun-result) [사냥 상세](hunt.html) | audit-flow | hunt |
| s-critic | critic이 더 찾았나? | wave가 끝나면 새 critic이 빠진 조사 범위를 제안한다. 받아들일 제안이 있으면 wave를 반복하고, 없으면 다음으로 간다.[](source:hun-critic)[](source:hun-loop) [사냥 상세](hunt.html) | audit-flow | critic |
| s-verify | Phase 3 후보 검증 | 그 후보를 사냥하지 않은 새 verifier가 `You did not write this candidate. Try to refute it`로 시작하는 지시문을 받고 반박을 시도해 세 판정 중 하나를 돌려준다.[](source:val-prompt)[](source:val-decide) [검증 상세](verify.html) | audit-flow | verify |
| s-write | Phase 4 findings.json | parent가 판정이 난 기록을 fingerprint 순으로 `findings.json`에 쓴다.[](source:val-p4) [검증 상세](verify.html) | audit-flow | write |
| s-valid | 검증기 둘 통과? | parent가 `validate-findings.cjs`와 `validate-coverage-ledger.cjs`를 돌리고 오류를 고친 뒤에야 다음으로 간다. 통과는 형식과 ledger 일관성만 증명한다.[](source:val-p4) [검증 상세](verify.html) | audit-flow | valid |
| s-final | Phase 5 최종 기록 검증 | 기록마다 또 다른 새 verifier가 구조화된 기록을 다시 확인해 `verified` 또는 대체 기록을 제안한다.[](source:val-p5) [검증 상세](verify.html) | audit-flow | final |
| s-report | Phase 6 보고서 | Phase 5를 통과한 기록만으로 `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md`를 쓴다.[](source:val-p6) [검증 상세](verify.html) | audit-flow | report |


## 구체적인 저장소로 따라가면 어떻게 되나 {#example span=12}

@callout level=note title="설명용 예시: 저장소와 입력은 지어낸 것이고 결과는 조건문이다"
| 저장소 `mini-agent-app`에 이미지 헤더를 Rust `unsafe`로 파싱하는 모듈, MCP tool 서버, 로그인 세션이 있고 IaC 파일은 없다고 하자. 사용자는 "이 저장소 전체 보안 감사를 해줘"라고 요청한다. |
| 모드: 전체 보안 리뷰 요청이므로 전체 감사 모드다.[](source:skm-modes) 예산이 최소를 감당하면 정찰로 넘어간다.[](source:skm-budget) |
| 정찰: 1c가 진입면으로 이미지 바이트, MCP tool call 인자, 로그인 요청을 보고한다면 parent는 이를 `architecture.md`에 적는다.[](source:rec-agents)[](source:rec-arch) |
| 도메인 파일 선택: 이미지 바이트가 메모리 안전하지 않은 코드에서 처리되면 `MEMORY-SAFETY-AND-BINARY.md`, MCP tool-calling이 있으면 `AI-AND-LLM.md`, 세션이 있으면 `WEB-PROTOCOL-AND-AUTH.md`가 선택 대상이다. IaC나 컨테이너 정의가 없으면 `CLOUD-AND-DEPLOYMENT.md`는 고르지 않고 이유를 `excluded_blocks`에 적는다.[](source:atk-route)[](source:rec-unit) |
| hunter 지시문: MCP tool unit을 맡은 hunter에게는 `AI-AND-LLM.md`의 `Core discipline`, 고른 절, `Universal moves`, `Validation rules` 원문이 들어간다. 이 unit의 경로가 메모리 안전하지 않은 코드에 닿지 않는다면 `MEMORY-SAFETY-AND-BINARY.md`는 제외한 블록과 이유에 적힌다.[](source:hun-prompt) |
| 검증: hunter가 후보를 제안하면 새 verifier가 반박을 시도한다. 소스가 반박하면 `rejected`다. 결정적 사실이 저장소에 없는 앞단 proxy 설정이라면 `confirmed` 제안은 `needs_validation`으로 내려간다.[](source:val-decide) |

## 세 판정은 어떻게 다른가 {#verdicts span=12}

판정은 같은 `findings.json` 배열 안의 세 분기이고, 심각도는 `confirmed`에만 붙는다. `needs_validation`은 확신이 낮은 취약점을 두는 자리가 아니라, 소스에 근거한 경계 가설이 저장소 밖 사실에 막힌 상태다.[](source:skm-priority)

| 판정 | 언제 | 심각도 | 보고서에서 |
| --- | --- | --- | --- |
| `confirmed` | 소스 경로와 제한된 로컬 근거로 경계 위반과 의미 있는 결과가 입증됨[](source:skm-priority) | 있다. 입증된 영향을 넘지 못한다[](source:skm-priority) | `REPORT.md` 표와 상세. `medium` 이상은 `FINDINGS-DETAIL.md`에도 들어간다[](source:val-p6) |
| `needs_validation` | 결정적 사실이 저장소 밖(배포 설정 등)에 있어 막힘[](source:skm-priority) | 없다[](source:vf-semantic) | `NEEDS-VALIDATION.md`. 소유자가 관찰할 안전한 확인 계획이 붙는다[](source:val-p6) |
| `rejected` | 소스나 로컬 동작이 주장을 반박함[](source:val-decide) | 없다[](source:vf-semantic) | 바뀐 근거 없이 같은 주장이 다시 나오지 않도록 `findings.json`에 남긴다[](source:val-p4) |


## 더 자세히 읽으려면 {#details span=12}

각 단계의 전체 규칙은 아래 페이지에 나눠 두었다.

- [정찰과 시작 전 결정](recon.html): 값, 프로필, 예산, 정찰 agent 넷, ledger, 이전 실행
- [사냥](hunt.html): hunter 배정과 지시문, 사냥 방법, 후보 통과 조건, critic 반복, 공격 유형 아홉 개
- [검증과 보고](verify.html): verifier, 세 판정, findings.json, 검증기, 최종 기록 검증, 보고서, 산출물
- [강제 규칙과 금지 목록](rules.html): 안전, 쓰기 격리, 증거 기준, 심각도, 하지 않는 일 열 가지


## 이 분석의 범위와 한계 {#audit span=12}

`cloudflare/security-audit/`의 텍스트 원본 파일 20개를 처음부터 끝까지 모두 읽었다. 부분 읽음 파일과 바이너리 파일은 없다. 번역본은 이 폴더에 없다. 코드(`.cjs`)는 읽기만 했고 실행하지 않았으며 시험도 돌리지 않았다.

이 폴더와 `verification-skills/cloudflare/security-audit/`의 원본 20개는 내용이 같다(`diff -rq`로 확인했고, 그쪽에만 있는 파일은 번역본 `*-KO.md` 15개뿐이다). 분석하는 동안 대상 파일은 바뀌지 않았다.

| 파일 | 바이트 |
| --- | --- |
| `SKILL.md` | 22,026 |
| `RECONNAISSANCE.md` | 15,902 |
| `HUNTING.md` | 22,446 |
| `VALIDATION-AND-REPORTING.md` | 17,843 |
| `ATTACK-CLASSES.md` | 15,695 |
| `AI-AND-LLM.md` | 10,617 |
| `CLIENT-SIDE.md` | 8,594 |
| `CLOUD-AND-DEPLOYMENT.md` | 8,291 |
| `DATA-ISOLATION-AND-LIFECYCLE.md` | 7,798 |
| `DESKTOP-MOBILE-AND-LOCAL-IPC.md` | 8,739 |
| `MEMORY-SAFETY-AND-BINARY.md` | 10,513 |
| `PROTOCOLS-RPC-AND-MESSAGING.md` | 7,483 |
| `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md` | 7,476 |
| `SUPPLY-CHAIN-AND-RELEASE.md` | 7,258 |
| `WEB-PROTOCOL-AND-AUTH.md` | 12,300 |
| `report-schema.json` | 14,494 |
| `validate-findings.cjs` | 28,806 |
| `validate-findings.test.cjs` | 26,384 |
| `validate-coverage-ledger.cjs` | 33,522 |
| `validate-coverage-ledger.test.cjs` | 28,483 |

@callout level=open-question title="확인하지 못한 것"
| 이 페이지는 지시문이 말하는 동작을 정리한 것이고, 에이전트가 실제로 그렇게 움직이는지는 관찰하지 않았다. 이 스킬로 돌린 감사 결과물(`findings.json` 등)은 이 저장소에 없어서 확인하지 못했다. |
| 두 검증기와 시험 파일은 실행하지 않아서 시험 통과 여부와 실제 출력 형식은 확인하지 않았다. 정찰 문서가 말하는 "5 MiB 상한이 현실적인 unit 2,000~5,000개에 해당한다"는 수치도 검증하지 않았다.[](source:rec-state) |
| 예산이 설정되지 않았을 때 예산 통과 조건이 어떻게 동작하는지, `research`·`general` agent가 플랫폼의 어떤 구체적 기능에 대응하는지, 보강 권고 노트를 ledger의 어느 필드에 보관하는지는 원문에 명시 없음이다.[](source:skm-budget)[](source:skm-terms)[](source:hun-consol) |
| `findings.json`의 fingerprint와 ledger를 서로 대조하는 검사가 어디에 있는지는 원문과 코드에서 찾지 못했다. 이는 판정이며 다른 경로에서 대조할 가능성은 배제하지 않는다.[](source:val-p4)[](source:vf-run)[](source:vl-run) |
