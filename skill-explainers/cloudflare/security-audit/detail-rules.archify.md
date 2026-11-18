# attack class와 도메인 지침 — hunter가 무엇을 어떤 기준으로 찾는지 정하는 규칙 {#detail-rules}

[개요](page:security-audit.html)의 `정찰`이 고르는 attack class와 도메인 지침 규칙 주제를 자세히 본다. `사냥`의 hunter 지시문이 그 원문 블록을 복사한다. 시작 입력은 정찰이 찾은 trust boundary이고 끝 출력은 ledger unit의 `selected_companion_blocks`와 hunter 지시문 4번 부분이다.[](source:atk-route)

- 도메인 지침은 언어나 의존성 이름이 보인다고 고르지 않는다. 정찰이 사용 조건에 맞는 trust boundary를 찾았을 때 고른다.[](source:rec-sel)
- hunter 지시문에는 블록 이름이 아니라 원문을 복사해 넣는다.[](source:hun-blocks)

@answer scope="cloudflare/security-audit · ATTACK-CLASSES.md와 도메인 지침 10개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source atk-intro title="attack class 사용 원칙" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=3:7
@source atk-route title="도메인 지침 연결" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=9:27
@source atk-inj title="Injection" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=29:37
@source atk-acc title="Access control" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=39:47
@source atk-res title="Resource and file handling" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=49:54
@source atk-cry title="Cryptography and secrets" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=56:62
@source atk-biz title="Business logic" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=64:72
@source atk-abuse title="Feature abuse and data leakage" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=74:81
@source atk-chain title="Chained vulnerabilities and trust boundaries" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=83:90
@source atk-wild title="Wildcard" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=92:109
@source atk-obv title="Obvious things" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=111:130
@source rec-sel title="companion 선택 기준" path=cloudflare/security-audit/RECONNAISSANCE.md lines=88:88
@source rec-blockref title="block 참조 형식" path=cloudflare/security-audit/RECONNAISSANCE.md lines=94:94
@source hun-blocks title="지시문에 복사하는 block" path=cloudflare/security-audit/HUNTING.md lines=18:18
@source ai-top title="AI·LLM 사용 조건과 핵심 원칙" path=cloudflare/security-audit/AI-AND-LLM.ko.md lines=3:18
@source ai-out title="model 출력 rendering" path=cloudflare/security-audit/AI-AND-LLM.ko.md lines=64:65
@source ai-val title="AI·LLM 검증 규칙" path=cloudflare/security-audit/AI-AND-LLM.ko.md lines=76:83
@source wp-top title="HTTP·인증 사용 조건과 핵심 원칙" path=cloudflare/security-audit/WEB-PROTOCOL-AND-AUTH.ko.md lines=3:17
@source cs-top title="클라이언트 사용 조건과 핵심 원칙" path=cloudflare/security-audit/CLIENT-SIDE.ko.md lines=3:17
@source ms-top title="메모리 안전 사용 조건과 핵심 원칙" path=cloudflare/security-audit/MEMORY-SAFETY-AND-BINARY.ko.md lines=3:17
@source cd-top title="cloud 사용 조건과 핵심 원칙" path=cloudflare/security-audit/CLOUD-AND-DEPLOYMENT.ko.md lines=3:17
@source pr-top title="프로토콜 사용 조건과 핵심 원칙" path=cloudflare/security-audit/PROTOCOLS-RPC-AND-MESSAGING.ko.md lines=3:17
@source re-top title="자원 고갈 사용 조건과 핵심 원칙" path=cloudflare/security-audit/RESOURCE-EXHAUSTION-AND-AVAILABILITY.ko.md lines=3:17
@source di-top title="데이터 격리 사용 조건과 핵심 원칙" path=cloudflare/security-audit/DATA-ISOLATION-AND-LIFECYCLE.ko.md lines=3:17
@source dm-top title="데스크톱·모바일 사용 조건과 핵심 원칙" path=cloudflare/security-audit/DESKTOP-MOBILE-AND-LOCAL-IPC.ko.md lines=3:17
@source sc-top title="공급망 사용 조건과 핵심 원칙" path=cloudflare/security-audit/SUPPLY-CHAIN-AND-RELEASE.ko.md lines=3:17

## 어떻게 동작하나 {#detail span=12}

**일반 attack class 아홉 개는 무엇을 보나**

`ATTACK-CLASSES.md`의 일반 class는 시작점이다. 모든 class가 모든 codebase에 맞지는 않으므로 정찰이 앱 유형에 맞는 것을 고르고, 큰 codebase는 subsystem별로 나누며, 앱에 특화된 class를 더한다. 작업은 취약점을 찾고 검증하고 고치고 우선순위를 매기는 것으로 틀을 잡고, 검증은 소스 검토와 제한된 local fixture에 한정한다. payload 체인 개발, live 서비스 availability 시험, 공유 환경 조치는 하지 않는다.[](source:atk-intro)

| class | 보는 것 | 특히 주의하는 점 | 출처 |
| --- | --- | --- | --- |
| Injection | 입력이 진입점에서 위험한 sink까지 가는 경로. sink는 앱 유형마다 다르다(web은 SQL·HTML·shell·template·파일 경로·redirect·deserialization, library는 검증 없는 caller 데이터 처리 등) | 직접 경로에서 멈추지 않는다. 안전하게 저장했다가 다른 코드가 위험한 맥락에서 쓰는 간접 injection, 값이 아닌 field 이름·key·header·metadata, 로그·cache·검색 index 같은 보조 시스템 | [](source:atk-inj) |
| Access control | caller가 권한 밖의 일을 못 하는지 | 권한 검사가 있는지보다 올바른 자원에 올바른 메커니즘으로 올바른 권한을 검사하는지. 같은 상태 변경에 더 약한 권한을 검사하는 다른 경로, 요청 body 필드가 권한 설계를 덮는 경우, 인증만 있고 인가가 없는 endpoint, bulk·export·import의 항목별 권한. 복잡하면 auth bypass와 authorization logic으로 agent를 나눈다 | [](source:atk-acc) |
| Resource and file handling | path traversal(symlink·인코딩·null byte 포함), SSRF(redirect·DNS rebinding·URL parser 차이 포함), 안전하지 않은 deserialization·archive 추출·임시 파일, 해당하면 memory safety, 파일 연산의 TOCTOU | 확인과 사용 사이의 경쟁 | [](source:atk-res) |
| Cryptography and secrets | 약한 난수, 하드코딩된 secret과 로그·오류·URL·client 응답의 secret, 잘못된 key 파생, HMAC 검증 누락, nonce 재사용, secret 비교의 timing, 암호 primitive 오용 | crypto 연산이 실패할 때 오류 경로가 암호 없이 진행하는지 | [](source:atk-cry) |
| Business logic | 주요 workflow마다 상태 기계 위반, 비즈니스 영향이 있는 경쟁, 수량·숫자 조작, 접근 경계 위반, 암묵적 신뢰 가정, 시간 기반 논리, 기본·fallback 동작 | 일반 scanner가 못 찾고 영향이 큰 오류를 사람이 직접 찾는다. 단계 건너뛰기·되돌리기·재생, 중간 실패 시 rollback 여부 | [](source:atk-biz) |
| Feature abuse and data leakage | 정상 기능을 의도하지 않은 목적에 쓰는 설계 버그. export·backup의 유출, import·restore의 주입, 검색·filter·정렬이 oracle이 되는 경우, 부작용을 통한 enumeration, preview·draft 유출, 알림·webhook을 통한 SSRF | 오류 메시지·응답 시간·크기·상태 코드 차이 | [](source:atk-abuse) |
| Chained vulnerabilities and trust boundaries | 각각은 허용되거나 억제된 동작이 다른 구성요소의 더 강한 보장 가정과 만나 취약점이 되는 경우. 다단계 경계 실패, 구성요소 간 신뢰 틈, 2차 사용, 범위·capability 확대, 시점·순서, rollback·복구 | 구체적 출력만 이어 붙이고 전제는 하나씩 확인한다. 하류 효과를 가정하지 않는다 | [](source:atk-chain) |
| Wildcard | 표준 class 밖의 취약점. 지루하거나 보안과 무관해 보이는 코드, 미완성·실험·호환·fallback 기능, frontend가 안 쓰는 API 사용법, 숨은 endpoint, 섞어 쓰도록 설계되지 않은 기능 조합, git 이력, 테스트가 다루지 않는 것 | 이상한 부분은 안전 여부를 말할 수 있을 때까지 읽는다. 안전하다는 주석이 있으면 그 설명을 검증한다. 같은 구체적 경계와 검증 요건은 다른 class와 같다 | [](source:atk-wild) |
| Obvious things | 기본 노출. 하드코딩된 secret, 보안 관련 TODO, debug·dev mode 게이트, 운영에서 통하는 test·seed credential, 보호 안 된 `/debug`·`/admin` 류 endpoint, 저장소에 들어간 `.env`·키 파일, `.gitignore`, 의존성 pin과 알려진 CVE, 동적 입력 `eval`·`exec`, CORS·cookie 속성, open redirect, TLS, 운영 오류의 stack trace | 창의적일 필요 없이 철저하고 문자 그대로 항목을 모두 확인하고 결과를 보고한다. 단, 보고하는 finding마다 전체 코드 경로를 확인해야 한다. flag는 finding이 아니고 영향을 추적해야 한다 | [](source:atk-obv) |

**도메인 지침 열 개는 언제 고르나**

도메인 지침은 언어나 의존성 이름이 보인다고 고르지 않는다. 정찰이 각 파일의 `When to use this file` 절에 적힌 trust-sensitive boundary를 실제로 찾았을 때 고르고, 보이는 boundary를 다른 agent가 볼 것이라는 이유로 제외하지 않는다.[](source:rec-sel) 대상별 사용 조건은 `ATTACK-CLASSES.md`가 아래처럼 연결한다.[](source:atk-route)

| 파일 | 고르는 대상 | class 수 | 소스로 정할 수 없으면 `needs_validation`이 되는 사실 |
| --- | --- | --- | --- |
| `AI-AND-LLM.md` | chatbot, RAG, 영속 agent memory, tool-calling agent, MCP server·client, 신뢰 못 할 입력으로 prompt를 만드는 코드, model 출력을 소비해 행동하는 코드 | 14 | provider, 배포, model, renderer, identity 동작[](source:ai-top) |
| `WEB-PROTOCOL-AND-AUTH.md` | 일반 web 앱·API, reverse proxy, CDN, gateway, 직접 만든 HTTP parser, session, CSRF, JWT, OAuth/OIDC, SAML, MFA, passkey, 계정 복구·연결, API key, mTLS | 20 | proxy, IdP, browser, 인증서, secret, 배포 설정[](source:wp-top) |
| `CLIENT-SIDE.md` | SPA, browser extension, webview, service worker, browser storage, window 간 messaging, CORS, WebSocket, DOM rendering | 14 | renderer, extension 권한, 배포 header, browser 정책[](source:cs-top) |
| `MEMORY-SAFETY-AND-BINARY.md` | C/C++/Rust unsafe, kernel module, parser·decoder, FFI, 동시성 runtime, binary loader, JIT, firmware | 20 | ABI, allocator, architecture, 기능, 배포, 도달 가능성[](source:ms-top) |
| `CLOUD-AND-DEPLOYMENT.md` | IAM, IaC, container·Kubernetes, service mesh, serverless·edge, ingress, provider event, runtime 설정 | 15 | 계정 정책, 네트워크 attachment, runtime admission, hosted metadata, 설정 drift[](source:cd-top) |
| `PROTOCOLS-RPC-AND-MESSAGING.md` | gRPC, GraphQL transport, Protobuf·Cap'n Proto·Thrift, 직접 만든 protocol, queue, broker, pub/sub, webhook, streaming RPC | 14 | broker ACL, service-mesh identity, topic attachment, 호환 동작[](source:pr-top) |
| `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md` | 신뢰 못 할 작업이 공유 CPU·메모리·디스크·연결·worker·queue·quota·운영자 비용을 쓸 수 있는 경우 | 13 | 상위 한도, 배포 topology, autoscaling, 유료 quota, 복구 동작[](source:re-top) |
| `DATA-ISOLATION-AND-LIFECYCLE.md` | 다중 tenant 저장소, cache·검색, object link, analytics, export·backup, migration, 삭제·보존·restore | 15 | 외부 저장소 정책, 보존, CDN 동작, replica 지연, backup 접근[](source:di-top) |
| `DESKTOP-MOBILE-AND-LOCAL-IPC.md` | 데스크톱·모바일 앱, deep link, webview bridge, exported component, 권한 있는 helper, local daemon, Unix socket·XPC·Binder·D-Bus | 16 | 서명, manifest merge, OS 버전, 기기 정책, installer ACL, packaging[](source:dm-top) |
| `SUPPLY-CHAIN-AND-RELEASE.md` | 의존성 해석, 생성 입력, CI, release·서명·승격, 업데이트, plugin·extension | 12 | branch protection, hosted runner, registry, 서명 서비스, 운영 승격 사실[](source:sc-top) |

class 수는 각 파일에서 굵은 제목으로 선 class의 개수를 센 값이다.

**겹치는 영역은 어느 파일이 맡나**

도메인 파일은 `ATTACK-CLASSES.md`를 대체하지 않고 함께 쓴다. 일반 trust boundary(전송, access control, query 구성, 파일 시스템, 출력 rendering)는 그대로 일반 class가 맡고, 도메인 파일은 그 위의 영역별 층을 맡는다. 파일끼리 겹치는 곳은 각 파일이 서로를 가리켜 나눈다.

| 파일 | 이 파일이 맡는 것 | 다른 파일에 넘기는 것 |
| --- | --- | --- |
| `AI-AND-LLM.md` | model이 신뢰 결정에 끼는 위임 층(untrusted content → model·memory → capability·sink)[](source:ai-top) | transport, access control, query 구성, 파일 시스템, 출력 rendering은 일반 class. browser rendering의 CSP·sanitization은 `CLIENT-SIDE.md`[](source:ai-out) |
| `WEB-PROTOCOL-AND-AUTH.md` | HTTP·identity 층이 어느 주체·요청·assurance·token인지 혼동할 수 있는가[](source:wp-top) | "주체가 이 작업을 해도 되는가"는 일반 access control[](source:wp-top) |
| `CLIENT-SIDE.md` | browser source·sink, origin 경계, browser persistence, cross-site 상태 oracle[](source:cs-top) | webview의 native 쪽은 `DESKTOP-MOBILE-AND-LOCAL-IPC.md`, 서버 쪽 CSRF·session·auth callback은 `WEB-PROTOCOL-AND-AUTH.md`[](source:cs-top) |
| `MEMORY-SAFETY-AND-BINARY.md` | process 무결성, memory safety, ABI 경계, loader 동작[](source:ms-top) | protocol 인가·상태 기계 논리는 `PROTOCOLS-RPC-AND-MESSAGING.md`[](source:ms-top) |
| `CLOUD-AND-DEPLOYMENT.md` | 배포된 구성요소가 의도한 identity·격리·네트워크 도달성·secret·정책을 받는가[](source:cd-top) | build·승격 신뢰는 `SUPPLY-CHAIN-AND-RELEASE.md`, HTTP proxy 의미는 `WEB-PROTOCOL-AND-AUTH.md`, data store tenant 범위는 `DATA-ISOLATION-AND-LIFECYCLE.md`[](source:cd-top) |
| `PROTOCOLS-RPC-AND-MESSAGING.md` | peer identity, 논리적 message 해석, routing, replay, 순서, 전달 의미[](source:pr-top) | parser memory safety는 `MEMORY-SAFETY-AND-BINARY.md`, HTTP framing은 `WEB-PROTOCOL-AND-AUTH.md`, availability 영향은 `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md`[](source:pr-top) |
| `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md` | 소스로 검토할 수 있는 availability 취약점. 도달 가능한 fatal error는 공유 영향이 있으면 밑바탕 parser를 다른 파일이 다루더라도 여기에 속한다[](source:re-top) | memory 무결성 결함은 `MEMORY-SAFETY-AND-BINARY.md`, broker 전달 논리는 `PROTOCOLS-RPC-AND-MESSAGING.md`[](source:re-top) |
| `DATA-ISOLATION-AND-LIFECYCLE.md` | 데이터 한 건이 거치는 모든 복사본과 상태 전이[](source:di-top) | endpoint 수준 access control은 일반 class, provider 수준 저장소 정책은 `CLOUD-AND-DEPLOYMENT.md`[](source:di-top) |
| `DESKTOP-MOBILE-AND-LOCAL-IPC.md` | 로컬·원격 콘텐츠 공격자, local IPC, 권한 있는 helper, 기기 lifecycle[](source:dm-top) | browser 쪽 webview는 `CLIENT-SIDE.md`, native memory·loader는 `MEMORY-SAFETY-AND-BINARY.md`, 업데이트 진위는 `SUPPLY-CHAIN-AND-RELEASE.md`[](source:dm-top) |
| `SUPPLY-CHAIN-AND-RELEASE.md` | source·의존성에서 사용자가 실행하는 artifact까지의 신뢰 인계[](source:sc-top) | 로컬 binary loader 내부 결함은 `MEMORY-SAFETY-AND-BINARY.md`, runtime workload 권한은 `CLOUD-AND-DEPLOYMENT.md`[](source:sc-top) |

**선택한 파일에서 hunter 지시문에 무엇이 복사되나**

도메인 파일은 같은 뼈대를 가진다. `When to use this file`은 정찰이 파일을 고르는 근거이고, `Core discipline`은 영역의 핵심 원칙을 담은 코드 블록이다. 그 뒤로 영역별 attack class 묶음, `Universal moves`, `Validation rules`가 온다.[](source:ai-top)

hunter 지시문 4번 부분은 선택한 일반 class block 전체와, 각 companion에서 `Core discipline`, 고른 attack class 하위 절, `Universal moves`, `Validation rules`를 원문 그대로 복사한다. block 이름만 보내지 않는다. 일반 class block은 스스로 완결되어 있고 companion식 `Core discipline`·`Universal moves`·`Validation rules` 절이 없다.[](source:hun-blocks)

ledger unit이 이 block을 가리키는 형식은 `FILE.md#` 뒤에 그 파일에 굵게나 제목으로 쓰인 class 이름을 그대로 붙인 것이다. 렌더된 HTML anchor가 아니라 파일 텍스트와 대조하는 식별자다. companion 절은 괄호 앞의 제목 텍스트를 쓴다(예: `Core discipline`). 표시 label을 소문자로 바꾸거나 slug로 만들어 참조를 만들지 않는다.[](source:rec-blockref)

모든 도메인 파일의 `Validation rules`는 마지막 항목에서 같은 선택을 요구한다. 완전한 소스 trace와 의미 있는 결과가 있을 때만 `confirmed`를 돌려주고, 풀리지 않은 구체적 사실이 있으면 그 사실과 그것을 풀 제한된 local 또는 소유자 관찰 확인을 적어 `needs_validation`을 돌려준다. 예로 `AI-AND-LLM.md`의 여섯째 규칙이 이렇게 쓴다.[](source:ai-val)

## 다른 페이지 {#pages span=12}

- [개요](page:security-audit.html)
- [정찰과 coverage ledger](page:security-audit.recon.html)
- [사냥](page:security-audit.hunt.html)
