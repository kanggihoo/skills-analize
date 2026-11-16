# security-audit 스킬은 에이전트의 보안 점검을 어떻게 바꾸나 {#security-audit-skill}

`security-audit`은 코드베이스에서 실제 신뢰 경계를 넘는 취약점만 골라, 소스 근거와 안전한 재현 방법, 우선순위, 가장 작은 수정안을 소유자에게 보고하도록 에이전트를 이끄는 보안 감사 스킬이다.[](source:skm-purpose)

- 보안 질문에는 안내 모드로 답하고, 코드베이스 audit나 전체 보안 리뷰, 보고서 산출물을 요청받았을 때만 6단계 전체 감사 모드가 켜진다. 모호하면 파일을 만들기 전에 질문을 하나 한다.[](source:skm-modes)
- 폴더의 파일은 세 층이다. `SKILL.md`가 전체를 진행하고, 단계별 파일 네 개는 해당 단계에서 읽고, 도메인 파일 열 개는 정찰이 고른 것만 hunter(취약점을 찾는 하위 에이전트) 지시문에 원문으로 복사한다.[](source:atk-route)[](source:hun-prompt)
- 후보는 확정이 아니다. 그 후보를 사냥하지 않은 새 에이전트(verifier)가 반박해 보고 살아남아야 `confirmed`가 되고, 심각도는 `confirmed`에만 붙는다.[](source:skm-priority)[](source:val-decide)
- 에이전트는 대상 소스를 고치지 않고, 배포된 endpoint에 접속하지 않으며, 샌드박스 통제를 모두 걸 수 없으면 대상 코드를 실행하지 않는다.[](source:skm-safety)[](source:skm-fix)

@answer scope="cloudflare/security-audit · 파일 20개 · 지시상 동작"
@meta locale=ko
@source skm-fm title="frontmatter" path=cloudflare/security-audit/SKILL.md lines=1:4
@source skm-purpose title="목적 정의" path=cloudflare/security-audit/SKILL.md lines=6:8
@source skm-modes title="운영 모드 선택" path=cloudflare/security-audit/SKILL.md lines=10:17
@source skm-terms title="agent 역할 용어" path=cloudflare/security-audit/SKILL.md lines=19:29
@source skm-safety title="실행 안전 규칙" path=cloudflare/security-audit/SKILL.md lines=31:42
@source skm-setup title="전체 감사 설정값" path=cloudflare/security-audit/SKILL.md lines=44:52
@source skm-isolation title="쓰기 격리" path=cloudflare/security-audit/SKILL.md lines=54:66
@source skm-promote title="산출물 승격 절차" path=cloudflare/security-audit/SKILL.md lines=68:82
@source skm-repro title="재현 기록과 run-metadata" path=cloudflare/security-audit/SKILL.md lines=84:86
@source skm-prior title="이전 실행 활용" path=cloudflare/security-audit/SKILL.md lines=88:105
@source skm-profiles title="프로필과 범위" path=cloudflare/security-audit/SKILL.md lines=107:117
@source skm-budget title="비용 예산" path=cloudflare/security-audit/SKILL.md lines=119:134
@source skm-boundary title="경계와 결과 요구" path=cloudflare/security-audit/SKILL.md lines=138:140
@source skm-local title="제한된 로컬 근거" path=cloudflare/security-audit/SKILL.md lines=142:144
@source skm-visibility title="소스 가시성" path=cloudflare/security-audit/SKILL.md lines=146:148
@source skm-priority title="심각도와 확실성 분리" path=cloudflare/security-audit/SKILL.md lines=150:162
@source skm-fix title="최소 수정 권고" path=cloudflare/security-audit/SKILL.md lines=164:166
@source skm-workflow title="6단계와 종료 상태" path=cloudflare/security-audit/SKILL.md lines=168:179
@source skm-anti title="안티패턴" path=cloudflare/security-audit/SKILL.md lines=181:192
@source rec-gate title="정찰 시작 조건" path=cloudflare/security-audit/RECONNAISSANCE.md lines=3:7
@source rec-agents title="정찰 agent 네 개" path=cloudflare/security-audit/RECONNAISSANCE.md lines=9:57
@source rec-prior title="이전 실행 입력" path=cloudflare/security-audit/RECONNAISSANCE.md lines=59:71
@source rec-arch title="architecture.md와 companion 선택" path=cloudflare/security-audit/RECONNAISSANCE.md lines=73:88
@source rec-ledger title="ledger와 coverage_id" path=cloudflare/security-audit/RECONNAISSANCE.md lines=90:102
@source rec-unit title="ledger 단위 필드" path=cloudflare/security-audit/RECONNAISSANCE.md lines=104:139
@source rec-state title="상태 표와 검증기 실행" path=cloudflare/security-audit/RECONNAISSANCE.md lines=141:156
@source hun-assign title="hunter 배정" path=cloudflare/security-audit/HUNTING.md lines=3:9
@source hun-prompt title="hunter 지시문 구성" path=cloudflare/security-audit/HUNTING.md lines=11:25
@source hun-method title="핵심 사냥 방법" path=cloudflare/security-audit/HUNTING.md lines=27:97
@source hun-promote title="승격 절차 블록" path=cloudflare/security-audit/HUNTING.md lines=99:136
@source hun-gate title="후보 통과 조건" path=cloudflare/security-audit/HUNTING.md lines=138:157
@source hun-local title="로컬 검증 경계" path=cloudflare/security-audit/HUNTING.md lines=159:166
@source hun-result title="hunter 결과 형식" path=cloudflare/security-audit/HUNTING.md lines=168:213
@source hun-consol title="ledger 갱신과 후보 통합" path=cloudflare/security-audit/HUNTING.md lines=215:219
@source hun-critic title="coverage critic 출력" path=cloudflare/security-audit/HUNTING.md lines=221:245
@source hun-loop title="critic 반복과 프로필·예산 한계" path=cloudflare/security-audit/HUNTING.md lines=247:251
@source val-p3 title="Phase 3 검증 배정" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=3:7
@source val-prompt title="verifier 지시문" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=9:46
@source val-promote title="승격 절차 블록" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=48:85
@source val-decide title="판정 승격·강등·기각" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=87:93
@source val-p4 title="findings.json 작성" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=95:118
@source val-p5 title="최종 기록 검증" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=120:149
@source val-p6 title="보고서 세 개" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=151:186
@source atk-intro title="attack class 사용 원칙" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=3:7
@source atk-route title="companion 파일 연결" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=9:27
@source atk-core title="일반 attack class 일곱 개" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=29:90
@source atk-wild title="Wildcard class" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=92:109
@source atk-obvious title="Obvious things class" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=111:130
@source ai-core title="AI·LLM 사용 조건과 핵심 원칙" path=cloudflare/security-audit/AI-AND-LLM.md lines=3:18
@source ai-val title="AI·LLM 검증 규칙" path=cloudflare/security-audit/AI-AND-LLM.md lines=76:83
@source cs-core title="클라이언트 사용 조건과 핵심 원칙" path=cloudflare/security-audit/CLIENT-SIDE.md lines=3:17
@source cs-val title="클라이언트 검증 규칙" path=cloudflare/security-audit/CLIENT-SIDE.md lines=77:83
@source cd-core title="cloud 사용 조건과 핵심 원칙" path=cloudflare/security-audit/CLOUD-AND-DEPLOYMENT.md lines=3:17
@source cd-val title="cloud 검증 규칙" path=cloudflare/security-audit/CLOUD-AND-DEPLOYMENT.md lines=80:86
@source di-core title="데이터 격리 사용 조건과 핵심 원칙" path=cloudflare/security-audit/DATA-ISOLATION-AND-LIFECYCLE.md lines=3:17
@source di-val title="데이터 격리 검증 규칙" path=cloudflare/security-audit/DATA-ISOLATION-AND-LIFECYCLE.md lines=78:84
@source dm-core title="데스크톱·모바일 사용 조건과 핵심 원칙" path=cloudflare/security-audit/DESKTOP-MOBILE-AND-LOCAL-IPC.md lines=3:17
@source dm-val title="데스크톱·모바일 검증 규칙" path=cloudflare/security-audit/DESKTOP-MOBILE-AND-LOCAL-IPC.md lines=83:89
@source ms-core title="메모리 안전 사용 조건과 핵심 원칙" path=cloudflare/security-audit/MEMORY-SAFETY-AND-BINARY.md lines=3:17
@source ms-val title="메모리 안전 검증 규칙" path=cloudflare/security-audit/MEMORY-SAFETY-AND-BINARY.md lines=95:101
@source pr-core title="프로토콜 사용 조건과 핵심 원칙" path=cloudflare/security-audit/PROTOCOLS-RPC-AND-MESSAGING.md lines=3:17
@source pr-val title="프로토콜 검증 규칙" path=cloudflare/security-audit/PROTOCOLS-RPC-AND-MESSAGING.md lines=75:81
@source re-core title="자원 고갈 사용 조건과 핵심 원칙" path=cloudflare/security-audit/RESOURCE-EXHAUSTION-AND-AVAILABILITY.md lines=3:17
@source re-val title="자원 고갈 검증 규칙" path=cloudflare/security-audit/RESOURCE-EXHAUSTION-AND-AVAILABILITY.md lines=72:78
@source sc-core title="공급망 사용 조건과 핵심 원칙" path=cloudflare/security-audit/SUPPLY-CHAIN-AND-RELEASE.md lines=3:17
@source sc-val title="공급망 검증 규칙" path=cloudflare/security-audit/SUPPLY-CHAIN-AND-RELEASE.md lines=67:73
@source wp-core title="HTTP·인증 사용 조건과 핵심 원칙" path=cloudflare/security-audit/WEB-PROTOCOL-AND-AUTH.md lines=3:17
@source wp-val title="HTTP·인증 검증 규칙" path=cloudflare/security-audit/WEB-PROTOCOL-AND-AUTH.md lines=98:105
@source sch-conf title="confirmed 분기" path=cloudflare/security-audit/report-schema.json lines=7:245
@source sch-nv title="needs_validation 분기" path=cloudflare/security-audit/report-schema.json lines=247:362
@source sch-rej title="rejected 분기" path=cloudflare/security-audit/report-schema.json lines=364:458
@source vf-limits title="입력 상한" path=cloudflare/security-audit/validate-findings.cjs lines=42:49
@source vf-read title="입력 파일 읽기" path=cloudflare/security-audit/validate-findings.cjs lines=604:649
@source vf-semantic title="의미 검사" path=cloudflare/security-audit/validate-findings.cjs lines=485:583
@source vf-run title="실행 진입점" path=cloudflare/security-audit/validate-findings.cjs lines=703:757
@source vft-branches title="분기 시험" path=cloudflare/security-audit/validate-findings.test.cjs lines=151:162
@source vft-align title="검증기 간 정렬 시험" path=cloudflare/security-audit/validate-findings.test.cjs lines=574:652
@source vl-limits title="입력 상한" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=13:21
@source vl-fields title="필수 필드와 상태 값" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=26:81
@source vl-id title="coverage_id 계산" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=354:375
@source vl-checks title="검사 기록 검증" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=421:451
@source vl-state title="상태별 불변식" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=518:566
@source vl-attempts title="재배정 기록 검증" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=568:644
@source vl-doc title="문서 단위 검사" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=761:806
@source vl-run title="실행 진입점" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=808:853
@source vlt-state title="상태 시험" path=cloudflare/security-audit/validate-coverage-ledger.test.cjs lines=330:405
@source vlt-reassign title="재배정 시험" path=cloudflare/security-audit/validate-coverage-ledger.test.cjs lines=407:491

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

이 그림은 핵심 경로와 되돌림 두 곳(critic 이후 wave 반복, 검증기 오류 수정)만 그렸다. 생략한 경로는 다음과 같다. Phase 5에서 대체 기록을 다시 확인하는 반복은 `Phase 5 최종 기록 검증` 설명에, 정찰 중 추가 정찰과 `incomplete`로 끝나는 다른 경로는 `Phase 1 정찰`과 `incomplete로 중단` 설명에, 프로필별 변형은 아래 참고 패널에 있다.

@steps id=audit-steps
| s-budget | 예산이 충분한가? | 전체 감사로 정해지면 parent는 다섯 값(스킬 폴더, 대상 경로, repo 이름, 출력 폴더, 소스 ref)과 프로필(기본 `standard`), 예산(모든 단계를 합친 agent 호출 최대 횟수)을 정한다.[](source:skm-setup)[](source:skm-profiles) 그다음 정찰 호출 네 번, 마지막 critic 몫, verifier 최소 한 번이 예산에 들어가는지 확인한다.[](source:skm-budget) | audit-flow | budget |
| s-halt | incomplete로 중단 | 예산이 이 최소를 감당하지 못하면 agent를 하나도 띄우지 않고 사용자에게 더 큰 예산, 좁은 범위, 다른 프로필 중 하나를 요청한다. 요청이 그대로이면 `run_status: "incomplete"`와 이유 `budget_cannot_fund_reconnaissance_and_reserves`를 기록하고 감사가 한 번도 돌지 않았다고 보고한다.[](source:skm-budget)[](source:rec-gate) | audit-flow | halt |
| s-recon | Phase 1 정찰 | `RECONNAISSANCE.md`를 읽는다. parent가 읽기 전용 `research` agent 네 개를 병렬로 띄운다. 1a는 스택과 빌드 명령, 1b는 낮은 신뢰 주체와 인증·인가 통제, 1c는 진입면과 싱크, 1d는 로컬 실행 가능성과 샌드박스 통제를 조사한다.[](source:rec-agents) 결과로 parent가 `architecture.md`(약 1,000단어 상한)를 쓰고, 보인 경계에 맞는 도메인 파일을 고르고, 진입면·신뢰 경계·subsystem·attack class 조합마다 한 줄씩 `coverage-ledger.json`에 `planned`로 적는다.[](source:rec-arch)[](source:rec-ledger) 검증 스크립트가 통과해야 작업을 배정한다.[](source:rec-state) 정찰 중에는 배포된 endpoint나 공유 서비스에 접속하지 않는다.[](source:rec-gate) | audit-flow | recon |
| s-hunt | Phase 2 hunter wave | `HUNTING.md`를 읽는다. parent가 `planned` unit을 hunter에게 배정하고, hunter 지시문에 `architecture.md` 원문, 배정된 ID, 고른 attack class와 도메인 파일 절의 원문, 제외한 블록과 이유, 사냥 방법을 넣는다. 블록 이름만 보내지 않는다.[](source:hun-prompt) hunter는 자기 `scratch/`에만 쓰고 대상 소스와 공유 파일은 고치지 못하며, 배정된 ID마다 `covered`·`candidate`·`blocked` 중 하나를 담은 JSON 하나를 돌려준다.[](source:hun-assign)[](source:hun-result) 지시문의 아홉 부분과 후보 통과 조건은 아래 참고 패널에 있다. | audit-flow | hunt |
| s-critic | critic이 더 찾았나? | wave가 끝나면 parent가 새 `research` critic을 띄운다. critic은 소스를 읽기만 하고, 후보가 아니라 빠진 범위(매핑되지 않은 진입점, 근거 없는 제외, 경로 없이 닫힌 unit)를 제안한다.[](source:hun-critic) 받아들일 제안이 있으면 해당 unit을 다시 배정해 wave를 반복한다. `standard`와 `deep`에서는 일을 못 찾은 뒤 별도의 final-clean critic을 한 번 더 쓰고, 이 critic도 못 찾아야 완전 커버리지로 본다.[](source:hun-loop) 예산이나 시간 때문에 일찍 멈추면 손대지 않은 unit을 `deferred`로 두고 보고서에 공개한다.[](source:hun-loop) | audit-flow | critic |
| s-verify | Phase 3 후보 검증 | `VALIDATION-AND-REPORTING.md`를 읽는다. parent가 후보를 fingerprint로 합친 뒤, 고유한 후보마다 그 후보를 사냥하지 않은 새 `general` verifier를 배정한다. 지시문은 `You did not write this candidate. Try to refute it`로 시작한다.[](source:val-p3)[](source:val-prompt) verifier는 인용된 소스 위치를 모두 다시 읽고 `confirmed`·`needs_validation`·`rejected` 중 하나를 돌려준다. 완전한 경로와 제한된 관찰 결과를 독립적으로 세우면 `confirmed`, 배포 같은 저장소 밖 사실이 결정적이면 `needs_validation`, 소스나 로컬 동작이 반박하면 `rejected`다.[](source:val-decide) | audit-flow | verify |
| s-write | Phase 4 findings.json | parent가 판정이 난 기록을 fingerprint 순으로 `findings.json`에 쓴다. 쓰기 직전에 `report-schema.json`을 읽는다. 스키마는 `additionalProperties: false`라서 hunter 래퍼 필드를 그대로 가져오면 안 된다.[](source:val-p4) | audit-flow | write |
| s-valid | 검증기 둘 통과? | parent가 `validate-findings.cjs`와 `validate-coverage-ledger.cjs`를 돌리고 오류를 모두 고친 뒤에야 다음으로 간다. 그림의 `오류` 간선이 이 되돌림이다.[](source:val-p4) 원문은 통과가 형식과 ledger 일관성만 증명한다고 적는다. 판정: 두 스크립트는 각자 파일 하나만 받으므로 fingerprint와 ledger unit을 서로 대조하는 검사는 코드에 보이지 않는다.[](source:vf-run)[](source:vl-run) | audit-flow | valid |
| s-final | Phase 5 최종 기록 검증 | 기록마다 새 `research` verifier가 구조화된 기록을 다시 확인해 `verified` 또는 대체 기록 제안(`replace`)을 돌려준다.[](source:val-p5) 더 강한 판정으로 올리거나 근본 원인·영향·심각도를 실질적으로 바꾸는 대체는, hunt도 Phase 3 검증도 하지 않은 또 다른 새 verifier가 재확인해야 적용한다. 예산이나 독립성이 없으면 그 기록을 `findings.json`에서 빼고 `incomplete`로 기록한다.[](source:val-p5) | audit-flow | final |
| s-report | Phase 6 보고서 | Phase 5를 통과한 기록만으로 parent가 `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md`를 쓴다. 보고서 문장은 판정, 심각도, 막힌 이유를 바꾸지 못한다.[](source:val-p6) 깨끗한 실행은 `confirmed`가 0개일 수 있고 LOW 지적을 지어내지 않는다.[](source:val-p6) 모든 산출물을 쓰고 두 검증기가 통과하면 끝난다.[](source:skm-workflow) | audit-flow | report |

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

## 참고. 프로필은 무엇을 바꾸나 {#profiles span=12}

프로필은 hunter 반복과 verifier 구성만 바꾼다. 후보 통과 조건, 소스·로컬 실행 경계, `needs_validation` 규율, 스키마 검증, `confirmed` 기록의 독립 검증은 어느 프로필에서도 줄이지 않는다.[](source:skm-profiles)

| 프로필 | 반복과 critic | verifier | ledger 단위 |
| --- | --- | --- | --- |
| `quick` | hunter wave 정확히 한 번, 마지막 critic 정확히 한 번[](source:skm-profiles) | 후보마다 새 verifier 하나가 후보 검증과 최종 기록 검증을 함께 맡는다[](source:skm-profiles) | surface × boundary × attack class로 거칠게 묶고 subsystem은 고정값 `profile/quick/all-in-scope-subsystems`를 쓴다[](source:skm-profiles) |
| `standard` | 원문 그대로. wave마다 post-wave critic을 돌리고, 더 할 일이 없으면 별도의 final-clean critic을 한 번 더 쓴다[](source:skm-profiles)[](source:hun-loop) | Phase 3과 Phase 5를 서로 다른 verifier가 따로 한다[](source:val-p5) | 진입면·신뢰 경계·subsystem·attack class 조합마다 한 단위[](source:rec-ledger) |
| `deep` | critic wave를 더 찾을 일이 없을 때까지 돌린다[](source:skm-profiles) | 후보 검증과 최종 기록 검증을 서로 다른 새 agent가 맡고, `prior_covered_same_source` 단위에는 독립된 두 번째 점검을 준다[](source:skm-profiles) | subsystem과 lifecycle 모드별로 나눈다[](source:skm-profiles) |


## 참고. hunter 지시문과 후보 통과 조건 {#hunter-detail span=12}

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

## 참고. 공격 유형(attack class) 아홉 개 {#classes span=12}

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


## 참고. 강제 규칙과 쓰지 말아야 할 때 {#rules span=12}

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

## 참고. 산출물과 검증기 {#outputs span=12}


전체 감사는 출력 폴더에 공유 파일 일곱 개와 agent별 폴더를 만든다. 공유 파일은 parent만 쓴다.[](source:skm-isolation)

| 파일 | 만드는 시점 | 담는 것 |
| --- | --- | --- |
| `run-metadata.json` | 위임 전 | `run_id`, `repo`, `target`, `source_ref`, `profile`, `scope_paths`, `budget`, 실행 정책, 선택한 companion, 이전 실행 경로, `run_status`[](source:skm-repro) |
| `architecture.md` | Phase 1 | 제품·주체·진입면·신뢰 경계·companion 선택 요약. 약 1,000단어 상한[](source:rec-arch) |
| `coverage-ledger.json` | Phase 1에서 시딩 후 parent가 갱신 | 조사 범위의 유일한 주장. 단위마다 상태·검사·fingerprint를 기록[](source:rec-ledger)[](source:rec-state) |
| `findings.json` | Phase 4 | 독립 판정을 받은 `confirmed`·`needs_validation`·`rejected` 기록, fingerprint 순[](source:val-p4) |
| `REPORT.md` | Phase 6 | 프로필·범위·커버리지·`confirmed` 표와 상세·`NEEDS VALIDATION` 표[](source:val-p6) |
| `FINDINGS-DETAIL.md` | Phase 6 | `medium` 이상 `confirmed`의 전체 trace와 재현[](source:val-p6) |
| `NEEDS-VALIDATION.md` | Phase 6 | 해결되지 않은 기록마다 trace·막힌 이유·해결 계획[](source:val-p6) |
| `agents/<agent-id>/` | agent 배정 전 | `scratch/`는 agent가 쓰고 `artifacts/`는 parent의 승격 코드만 쓴다[](source:skm-isolation) |

`confirmed`·`needs_validation`·`rejected`는 같은 JSON 배열 안의 세 분기이고 쓰는 필드가 서로 다르다.

| 항목 | `confirmed` | `needs_validation` | `rejected` |
| --- | --- | --- | --- |
| 공통 필드 | `fingerprint`, `title`, `description`, `trace`, `evidence`[](source:sch-conf) | 같음[](source:sch-nv) | 같음[](source:sch-rej) |
| 고유 필드 | `root_cause`, `intended_behavior`, `conditions`, `execution`, `remediation`, `severity`, `confidence`[](source:sch-conf) | `claimed_root_cause`, `blockers`, `validation_plan`[](source:sch-nv) | `claimed_root_cause`, `reason`[](source:sch-rej) |
| 심각도 | 있다. `likelihood`·`impact`·`overall_severity`를 다섯 단계 값으로 적는다[](source:sch-conf) | 없다[](source:vf-semantic) | 없다[](source:vf-semantic) |
| 검증 계획 | 해당 없음 | `local`·`deployment` 중 하나 이상[](source:vf-semantic) | 해당 없음 |

스키마 모양은 이렇다. `trace` 항목의 `kind`는 `entrypoint`·`propagation`·`sink`이고 `execution`은 `attacker_perspective`, `payloads`, `instructions`, `observed_result`를 모두 요구한다. `conditions`의 `kind`는 아홉 가지(`authentication_level`, `authorization_role`, `user_interaction`, `system_configuration`, `network_routing`, `environmental_dependency`, `data_state`, `timing_dependency`, `third_party_dependency`) 중 하나다. `confidence.score`는 `low`·`medium`·`high`이고 모든 분기에서 `additionalProperties`가 `false`다.[](source:sch-conf)[](source:sch-nv)[](source:sch-rej)

검증기 둘은 parent가 돌리는 CLI 스크립트다. 인자는 JSON 파일 경로 하나이고 통과하면 `PASS`와 개수를 출력한다.[](source:vf-run)[](source:vl-run)

`validate-findings.cjs`는 `report-schema.json`을 같은 폴더에서 읽어 구조를 검사한 뒤 의미를 검사한다. 입력은 symlink가 아닌 regular file이어야 하고 UTF-8이어야 하며 no-follow·nonblocking으로 연다.[](source:vf-read)[](source:vf-run) 의미 검사 항목은 다음과 같다.[](source:vf-semantic)

- fingerprint 중복 금지와 사전순 정렬
- `file`·`file_name`이 저장소 상대의 안전한 경로인지(절대 경로, `..`, `:`, Windows 예약 이름, 제어 문자 거부)
- `trace`의 `entrypoint`→`propagation`→`sink` 모양(한 줄이면 `entrypoint` 또는 `sink`)
- 분기별 금지 필드
- `overall_severity`가 `impact`를 넘지 않는지

`validate-coverage-ledger.cjs`는 단위마다 다음을 검사한다.

- 필수 필드 열아홉 개가 모두 있는지[](source:vl-fields)
- `canonical_refs`로 `coverage_id`를 다시 계산해 일치하는지, 단위가 `coverage_id` 사전순인지, 같은 ID나 같은 의미 조합이 중복되지 않는지[](source:vl-id)[](source:vl-doc)
- 상태 여덟 가지마다 `agent_id`, `reviewed_paths`, `local_checks`, `result_fingerprints`, `unresolved`가 비어 있거나 차 있어야 하는 조건. 이 조건은 정찰 문서의 상태 표와 같다.[](source:vl-state)[](source:rec-state)
- `local` 검사는 `agents/<검사의 agent_id>/artifacts/` 아래 경로여야 하고 `source` 검사는 `artifact`가 `null`이어야 한다.[](source:vl-checks)
- 재배정 기록은 `wave`가 엄격히 증가하고 소유자와 artifact가 이전 시도와 겹치지 않는지 본다.[](source:vl-attempts)

판정: 코드에는 그 artifact 경로의 파일이 실제로 있는지 여는 줄이 없어서 경로 문자열의 형식만 본다.[](source:vl-checks)

| 검증기 | 입력 상한 | 항목 상한 | 중첩 깊이 | 오류 출력 |
| --- | --- | --- | --- | --- |
| `validate-findings.cjs` | 5 MiB[](source:vf-limits) | 배열마다 1,000개[](source:vf-limits) | 64[](source:vf-limits) | 100개[](source:vf-limits) |
| `validate-coverage-ledger.cjs` | 5 MiB[](source:vl-limits) | unit 10,000개, 중첩 컬렉션 1,000개, 전체 값 500,000개[](source:vl-limits) | 64[](source:vl-limits) | 100개[](source:vl-limits) |

두 검증기에는 각각 시험 파일이 있다. `validate-findings.test.cjs`는 스키마가 세 분기를 가진 최상위 배열이라는 점과, 두 검증기가 같은 정규식·상한·경로 판정을 쓰는지를 확인하는 시험을 담는다.[](source:vft-branches)[](source:vft-align) `validate-coverage-ledger.test.cjs`는 상태 불변식과 재배정 시 소유자 재사용 금지를 시험한다.[](source:vlt-state)[](source:vlt-reassign) 이 시험들은 실행하지 않았으므로 통과 여부는 확인하지 않았다.

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
