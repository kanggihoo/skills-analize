# 공격 유형

#### 공격 유형 선택 및 분할 — Phase 1 결과에 따름

애플리케이션 유형에 맞는 공격 유형을 선택한다. 모든 유형이 모든 저장소에 적용되지는 않는다. 아래 목록은 출발점이며 Phase 1에서 찾은 앱별 유형을 더하고 규모가 큰 저장소는 subsystem별로 나눈다. 작업은 취약점 발견, 검증, 수정, 우선순위 결정으로 구성한다. 검증은 소스 검토와 범위가 제한된 로컬 fixture로 끝낸다. payload chain을 만들거나 운영 service 가용성을 시험하거나 공유 환경에서 동작하지 않는다.

소스 근거와 제한 검증으로 전체 경계와 의미 있는 결과가 입증된 경우에만 `confirmed`를 쓴다. 특정 배포, provider, platform, identity, runtime 사실을 알 수 없다면 `needs_validation`을 쓰고 누락된 사실과 이를 확인할 안전한 담당자 관찰·로컬 절차를 적는다.

> **Native / binary / kernel 대상** (C/C++/Rust `unsafe`, kernel module, parser·decoder, FFI, 동시 runtime, binary loader, JIT, firmware): [MEMORY-SAFETY-AND-BINARY.md](MEMORY-SAFETY-AND-BINARY.md)의 메모리 안전성, 정수·ABI, 동시성, binary loader, 권한 인터페이스 유형을 사용한다.
>
> **AI / LLM / agent 대상** (chatbot, RAG, 지속 메모리, tool 호출 agent, MCP server·client, prompt 조립, model 제어 동작): [AI-AND-LLM.md](AI-AND-LLM.md)의 context, 메모리 오염, 동작 결합, tool schema, MCP ID, 출력 유형을 사용한다.
>
> **HTTP·web·identity 대상** (일반 web app, API, reverse proxy, CDN, gateway, 사용자 정의 HTTP parser, session, CSRF, JWT, OAuth/OIDC, SAML, MFA, passkey, 계정 복구·연결, API key, mTLS): [WEB-PROTOCOL-AND-AUTH.md](WEB-PROTOCOL-AND-AUTH.md)를 사용한다.
>
> **Client-side·browser 대상** (SPA, browser 확장, 내장 webview, service worker, browser 저장소, 창 간 메시지, CORS, WebSocket, DOM rendering): [CLIENT-SIDE.md](CLIENT-SIDE.md)를 사용한다.
>
> **공급망·release 대상** (dependency resolve, 생성 입력, CI, release·서명·승격, update, plugin·extension): [SUPPLY-CHAIN-AND-RELEASE.md](SUPPLY-CHAIN-AND-RELEASE.md)를 사용한다.
>
> **Cloud·배포 대상** (IAM, infrastructure as code, container/Kubernetes, service mesh, serverless/edge, ingress, provider event, runtime 설정): [CLOUD-AND-DEPLOYMENT.md](CLOUD-AND-DEPLOYMENT.md)를 사용한다.
>
> **Protocol·RPC·메시징 대상** (gRPC, GraphQL transport, Protobuf/Cap'n Proto/Thrift, 사용자 정의 protocol, queue, broker, pub/sub, webhook, streaming RPC): [PROTOCOLS-RPC-AND-MESSAGING.md](PROTOCOLS-RPC-AND-MESSAGING.md)를 사용한다.
>
> **자원 고갈·가용성 대상** (신뢰할 수 없는 작업이 공유 CPU, memory, disk, connection, worker, queue, quota, 운영자 비용을 쓸 수 있음): [RESOURCE-EXHAUSTION-AND-AVAILABILITY.md](RESOURCE-EXHAUSTION-AND-AVAILABILITY.md)를 사용한다.
>
> **데이터 격리·수명주기 대상** (다중 tenant 저장소, cache·검색, object link, 분석, export·backup, migration, 삭제, 보존, 복원): [DATA-ISOLATION-AND-LIFECYCLE.md](DATA-ISOLATION-AND-LIFECYCLE.md)를 사용한다.
>
> **Desktop·mobile·local IPC 대상** (native app, deep link, webview bridge, exported component, 권한 helper, 로컬 daemon, Unix socket/XPC/Binder/D-Bus): [DESKTOP-MOBILE-AND-LOCAL-IPC.md](DESKTOP-MOBILE-AND-LOCAL-IPC.md)를 사용한다.

**Injection** (`subagent_type: general`)
신뢰할 수 없는 입력을 진입점에서 위험한 sink까지 추적한다. 위험 sink는 앱 유형에 따라 다르다.

- Web app: SQL query, HTML 출력, shell command, template engine, 파일 경로, HTTP redirect, 역직렬화.
- Library: buffer 연산, parser, format string 등 caller 데이터 검증 없이 처리하는 모든 function.
- CLI 도구: shell command 구성, 파일 경로 처리, 환경 변수 보간.
- Service: query 구성, message 직렬화, log injection, LDAP/XPATH query.
- Client-side(browser/JS): DOM XSS, prototype pollution, `postMessage`·origin 신뢰 및 browser 측 유형. 선택했다면 [CLIENT-SIDE.md](CLIENT-SIDE.md) companion block에서 다룬다.

눈에 보이는 직접 경로만 확인하고 끝내지 않는다. 안전하게 저장한 데이터가 다른 코드에서 꺼내져 위험한 맥락에 쓰이는 간접 injection도 찾는다. 값뿐 아니라 field 이름, key, header, metadata를 통한 주입도 살핀다. log, cache, 검색 index, 분석 같은 2차 시스템도 확인한다.

**접근 제어** (`subagent_type: general`)
호출자가 권한 밖 동작을 할 수 없는지 확인한다. 권한 검사가 있는지만 보지 말고 *올바른 리소스에 올바른 방식으로 올바른 권한*을 검사하는지 확인한다.

- 같은 상태 변경으로 가는 다른 경로가 더 약한 권한을 검사하는가?
- request body field가 권한 시스템의 제한 대상을 덮을 수 있는가?
- 인증만 확인하고 인가를 빠뜨린 endpoint가 있는가?
- 같은 resource에 접근 검사 방식이 다른 경로가 여러 개인가?
- bulk·batch·export·import에서 항목별 권한을 확인하는가?

복잡한 접근 모델은 인증 우회와 인가 로직을 별도 agent에 나눈다.

**리소스·파일 처리** (`subagent_type: general`)

- Path traversal: symlink, 인코딩 sequence, null byte를 통한 의도 디렉터리 바깥 읽기·쓰기.
- SSRF: redirect, DNS rebinding, URL parser 차이를 포함해 공격자 URL을 가져오게 하는 동작.
- 안전하지 않은 역직렬화, archive 해제(zip slip), 임시 파일 처리.
- 해당 시 메모리 안전성: buffer overflow, use-after-free, 정수 overflow.
- check와 사용 사이 TOCTOU 등 파일 작업 race condition.

**암호화·secret** (`subagent_type: general`)

- token, key, nonce 같은 보안 중요 값에 약한 난수 사용.
- 코드 내장 secret, log·오류·URL·client 응답의 secret.
- 잘못된 key derivation, HMAC 검증 누락, nonce 재사용.
- secret 비교의 timing side channel.
- ECB, 인증되지 않은 암호화, 고정 IV 등 암호 primitive 오용.
- 암호 연산 실패 시 동작. 오류 경로가 암호화 없이 처리하는 fallback으로 가는가?

**Business logic** (`subagent_type: general`)
표준 scanner가 찾지 못하고 영향이 큰 결과를 낼 수 있는 논리 오류를 직접 찾는다. 주요 workflow마다 다음을 본다.

- **상태 머신 위반**: 단계를 건너뛰거나 역행하거나 잘못된 상태에 도달할 수 있는가? 완료된 흐름을 replay하면 무엇이 일어나는가? 3단계 중 2단계가 실패하면 1단계는 rollback되는가?
- **업무 영향 race**: 동시 실행이 이중 지불·승인, 갱신 유실 등 잘못된 상태를 만드는가? 원자적이지 않은 check-then-act에 집중한다.
- **숫자·수량 조작**: 음수·0, overflow, 정밀도 손실, string과 number 간 형 변환.
- **접근 경계 위반**: 권한 검사가 있느냐가 아니라 업무 규칙에 맞는 검사인지 본다. 같은 효과의 다른 작업에 걸린 제한을 한 작업의 입력으로 우회할 수 있는가?
- **암묵적 신뢰 가정**: 저장소, 설정, 다른 component, plugin의 데이터가 “입력 때 검증했다”는 이유로 안전하다고 보는가? 다른 경로가 썼다면 어떤가?
- **시간 기반 로직**: 만료, scheduling, rate window, clock skew. 경계 시각이나 component 간 timezone 차이에 어떻게 동작하는가?
- **기본·fallback 동작**: 설정 누락, feature flag 꺼짐, dependency 장애, migration 도중 보안 상태는 어떤가?

**기능 악용·데이터 유출** (`subagent_type: general`)
정상 기능을 의도하지 않은 용도로 쓸 수 있는 설계 결함을 찾는다.

- **유출 수단이 되는 Export·backup**: 낮은 권한 사용자가 자기 권한을 넘는 데이터, 다른 사용자 데이터, 삭제·초안·비공개 콘텐츠, 제거 예정 revision history가 포함된 export·snapshot·backup을 만들 수 있는가?
- **Injection 수단이 되는 Import·restore**: 기존 데이터를 덮거나 일반 검증을 우회하는 record를 만들거나 쓰기 권한 없는 collection에 콘텐츠를 넣는가? UI와 같은 권한 모델을 따르는가?
- **정보 오라클이 되는 Search·filter·sort**: 직접 권한 없는 콘텐츠 존재 여부가 드러나는가? filter로 숨겨야 할 상태·role·field를 알아낼 수 있는가? 숨은 field 정렬 순서로 값을 추론하는가?
- **부작용을 통한 열거**: “없음”과 “접근 불가”의 오류, 응답 시간·크기·HTTP 상태가 다른가? password reset·초대·가입에서 사용자를 열거할 수 있는가?
- **Preview·초안·staging 누출**: preview token이 한 항목에 한정되는가 아니면 더 넓은 접근을 주는가? search, RSS, sitemap, API 목록에서 초안이 발견되는가? cache header로 CDN이 비공개 내용을 공개 제공하는가?
- **SSRF 수단이 되는 알림·webhook**: 사용자가 server가 가져갈 notification·webhook·callback URL을 설정할 수 있는가? 내부망 차단 검증이 있는가? redirect 뒤에도 안전한가?

**연쇄 취약점·신뢰 경계** (`subagent_type: general`)
각각 허용·제한된 동작도 다음 component나 수명주기 단계가 더 강한 보장을 기대하면 취약점이 될 수 있다.

- **다단계 경계 실패**: 낮은 권한 주체가 읽고·쓰고·호출하고·보유할 수 있는 범위를 그린 뒤 구체적 출력만 후속 신뢰 판단에 연결한다. 선행 조건을 각각 확인하고 후속 영향은 추정하지 않는다.
- **Component 간 신뢰 격차**: A가 입력을 검증해 B에 전달한다. 잘림, 형 변환, 정규화, tenant 범위, plugin·extension 접근을 포함해 A의 실제 보장과 B의 가정을 비교한다.
- **2차 사용**: 저장 때 안전한 데이터가 나중에는 위험해질 수 있다. field 이름이 JSON path, slug가 파일 경로, escape 텍스트가 raw rendering, 저장 문자열이 URL·regex·template·정책 표현식이 되는 경우를 본다.
- **범위·capability 확장**: 위임, refresh, cache, role 변경, 조합 뒤 token, API key, plugin, OAuth, MCP, AI 권한이 넓어지는지 확인하고 resulting principal이 하면 안 되는 구체적 동작을 밝힌다.
- **시점·순서**: 초기화, migration, soft-delete, revoke·cache 만료, check/use, validate/consume 시간창을 검토한다. 보고 전 오래된 상태가 실제 수락되는지 확인한다.
- **Rollback·복구**: undelete, restore, revision rollback, cancellation에 현재 소유권·검증·인가를 적용한다. 어떤 잘못된 상태가 복구되는지 확인한다.

**Wildcard** (`subagent_type: general`)
분류를 지정하지 않는다. 이미 배정된 일반 유형 바깥의 취약점을 찾는다.

보안과 무관해 보이는 지루한 코드도 읽는다. 미완성·실험·호환·fallback 기능을 추적하되 모든 유형과 동일하게 구체적인 경계와 검증 기준을 지킨다.

다음 질문에서 시작하되 여기서 멈추지 않는다.

- 저장소에서 가장 이상한 코드는 무엇이며 왜 있는가? 악용되면 어떤 일이 생기는가?
- 반쯤 끝났거나 실험적이거나 급히 덧붙인 기능이 있는가? 검토가 적었을 가능성을 살핀다.
- frontend가 하지 않을 방식으로 API를 쓰면 어떻게 되는가? 가능한데 client가 호출하지 않는 API는 무엇인가?
- 문서에 없는 endpoint, parameter, header, 기능이 있는가? route 등록, middleware, 설정을 본다.
- localization+preview+cache, import+plugin+webhook, OAuth+impersonation+API key처럼 함께 고려되지 않은 기능을 조합하면 어떻게 되는가?
- 되돌린 보안 수정, 주석 처리된 인증 검사, commit 후 제거된 secret 등 git history에 흥미로운 점이 있는가?
- 유효 계정 동작이 다른 사용자, 공유 무결성, 가용성, 운영 비용에 영향을 주는가? containment, quota, 권한, 복구를 확인한다.
- 되돌릴 수 없거나 높은 확인이 필요한 동작은 무엇인가? 권한·승인을 최종 주체·동작·리소스에 결합한다.
- DB가 로컬, clock 정확, DNS 신뢰, filesystem 대소문자 구분이라고 코드가 가정하는가?
- test가 **검사하지 않는 것**은 무엇인가? 개발자가 고려한 경계와 빠진 경계를 비교한다.

배정 범위의 이상 징후는 불변식이 결론날 때까지 추적한다. 이상해 보이면 안전 여부를 말할 수 있을 때까지 읽는다. 안전 이유를 설명하는 주석이 있으면 검증한다. `temp`, `hack`, `legacy` 같은 이름은 특히 주의해서 읽는다.

**눈에 띄는 기본 노출** (`subagent_type: general`)
다른 agent가 미묘한 문제를 찾는 동안 이 agent는 누군가 이미 봤으리라 생각해 놓치는 기본 노출을 꼼꼼하고 문자 그대로 점검한다.

- source에 내장 password, API key, token, secret이 있는가? `password`, `secret`, `apikey`, `token`, `Bearer`, `-----BEGIN`, 흔한 기본 password를 검색한다.
- 보안 관련 TODO/FIXME/HACK/XXX가 있는가? (`TODO: add auth`, `FIXME: validate input`, `HACK: skip permission check`)
- debug·dev mode가 제대로 제한되는가? 환경 변수·query parameter·header로 운영에서 켤 수 있는가?
- 운영에서 쓸 수 있는 test·example·seed credential이 있는가?
- 보호되지 않은 `/debug`, `/admin`, `/test`, `/status`, `/health`, `/metrics`, `/env`, `/.env`, `/config` endpoint가 있는가?
- 저장소에 `.env`, `.env.local`, `credentials.json`, `*.pem`, `*.key`가 있는가?
- `.gitignore`가 secret, upload, 로컬 설정을 실제로 제외하는가?
- dependency가 고정돼 있는가? dependency tree에 알려진 CVE가 있는가? lockfile을 확인한다.
- 동적 입력을 받는 `eval()`, `exec()`, `child_process`, `Function()`, `vm.runInContext`, `import()`가 있는가?
- CORS가 `*` 또는 과도하게 허용적인가? `Access-Control-Allow-Credentials`와 wildcard origin을 함께 쓰는가?
- cookie에 `HttpOnly`, `Secure`, `SameSite`가 빠졌는가?
- 검증 없이 redirect에 연결되는 `redirect`, `return`, `next`, `url`, `goto`, `continue` parameter가 있는가?
- TLS를 강제하는가? HTTP 전용 endpoint가 있는가?
- 운영 오류 응답이 stack trace, 내부 경로, SQL 오류를 반환하는가?

이 agent는 창의적일 필요가 없다. 꼼꼼하고 문자 그대로 모든 항목을 확인해 각각 보고한다.

**중요:** 이 agent가 보고하는 finding은 표면만 보지 말고 전체 코드 경로를 검증해야 한다. `HttpOnly`가 없는 cookie라면 보안 민감 데이터가 들어 있는지, 설계상 JS가 읽어야 하는지 확인한다. 오류에 field 이름이 있어도 실제 민감 데이터가 그 field에 채워지는지 확인한다. flag 하나만으로 finding이 되지 않는다. 보고 전에 영향을 추적한다.
