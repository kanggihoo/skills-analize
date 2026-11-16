# HTTP protocol·인증 보안 점검

#### 이 문서를 사용할 때

target이 parsing, caching, browser 인증, identity 경계에서 HTTP를 쓸 때 참고한다. web app, API, reverse proxy, CDN, gateway, 사용자 정의 HTTP server, session, JWT, OAuth/OIDC, SAML, password recovery, MFA, passkey, API key, mTLS 구현이 대상이다. `ATTACK-CLASSES.md`와 함께 사용한다. 접근 제어 검토는 주체가 동작을 할 수 있는지 묻고, 이 문서는 HTTP·identity 계층이 동작의 주체·요청·인증 강도·token을 혼동할 수 있는지 살핀다.

Phase 1에서 유형을 고른다. 큰 대상은 request framing·cache 정책, browser 인증, federated identity, 강한 인증·복구, service credential, session 수명주기로 나눈다. 관찰할 수 없는 관리형 proxy 뒤의 단일 server는 소스에서 입증 가능한 smuggling 표면이 작고 proxy·사용자 parser는 훨씬 크다.

## 기본 원칙 (모든 agent prompt에 포함)

```
- Framing·cache finding은 동일 request, response, key를 두 component가 다르게 해석해야 한다. 두 component와 각 측의 정확한 정규화 값을 밝힌다.
- 모든 credential에 대해 signature·secret 검증과 용도에 필요한 issuer, audience, origin, RP, client, session, 주체, 리소스, assurance, 만료, 일회용 상태 결합을 확인한다.
- Host, Forwarded, X-Forwarded-*, Origin, Referer, redirect 대상, callback state, 요청에서 만든 URL은 신뢰 판단이다. 영향받는 identity·응답까지 추적한다.
- header, cookie 속성, MFA prompt, rate limit 누락만으로는 finding이 아니다. 거부돼야 할 요청 수락, 주체 간 영향, assurance 하락, credential 노출이 필요하다.
- 전체 소스 근거와 제한된 로컬 request·token test가 있어야 `confirmed`다. proxy, IdP, browser, certificate, secret, 배포 설정이 필요하지만 보이지 않으면 `needs_validation`이다.
```

## HTTP framing·cache 공격 유형 (`subagent_type: general`)

**Request framing·desynchronization**
frontend와 backend가 request 길이나 header 정규화를 다르게 해석하는지 확인한다. 여러 `Content-Length`, `Transfer-Encoding`, HTTP/2·HTTP/3 하향 변환, header 이름 정규화, 금지 connection header, CR/LF 변환을 검토한다. 한 component가 어떤 byte를 한 request에 넣고 peer가 어디부터 다음 요청으로 보는지 입증한다.

**Key에 포함되지 않은 입력을 통한 web cache poisoning**
요청 값이 cache content·보안 header는 바꾸지만 cache key에는 빠지는지 확인한다. forwarded host·scheme, 선택 cookie, query 정규화, 언어·기기 header, 인증 상태를 포함한 모든 response 변형과 key 구성을 비교한다.

**Cache deception·비공개 응답 cache**
cache routing이 비공개 동적 경로를 공개 정적 asset처럼 처리하거나 identity·권한 입력이 정책에서 빠진 response를 cache하는지 확인한다. edge cache 가능 여부와 앱 route parsing, suffix·path parameter 정규화, response cache 지시를 비교한다.

**Host·forwarded header 신뢰**
신뢰하지 않는 host·proxy metadata가 절대 URL, tenant routing, callback, reset link, cache key, 권한 확인용 client 주소를 결정하는지 살핀다. 누가 header를 제공할 수 있고 신뢰된 ingress가 client 제공 값을 지우는지 확인한다.

**Response header 주입**
신뢰할 수 없는 데이터가 안전하지 않은 제어 문자·정규화와 함께 `Location`, `Set-Cookie`, CSP 등 response header에 들어가는지 본다. 보고 전에 framework가 거부하지 않는지 검증하고 보안상 의미 있는 response 변경을 요구한다.

## Browser session 공격 유형 (`subagent_type: general`)

**일반 CSRF**
browser가 ambient credential을 상태 변경 endpoint에 보내고 유효한 CSRF token, same-site 요청 결합, 엄격한 Origin·Referer 검증 없이 사이트 간 요청을 수락하는지 확인한다. form, JSON 유사 형식, multipart, method override, legacy route 등 cookie 인증 mutation을 모두 조사한다. SameSite는 실제 사용 cookie·browser 맥락에서 효과가 있어야 하며 login CSRF와 사이트 간 subresource 요청은 요구 조건이 다를 수 있다.

**Session fixation·무효화**
login, 계정 전환, MFA 완료, impersonation, 권한 변경 때 session ID가 교체되지 않거나 logout, password 변경, revoke, 계정 비활성화 뒤에도 유효한지 확인한다. server session, refresh token, 서명 cookie, websocket 상태, cache 사본, fallback endpoint를 살핀다.

**Cookie 범위·전송**
민감 cookie의 `Domain`·`Path`가 과도하게 넓거나 안전하지 않은 전송으로 전달되거나 다른 component가 다르게 선택하는 형제 cookie와 충돌하는지 확인한다. 현실적으로 신뢰도가 낮은 origin, 네트워크 위치, browser 경로가 credential을 얻거나 바꿀 수 없다면 flag 누락은 보안 강화 메모에 그친다.

## Federated identity 공격 유형 (`subagent_type: general`)

먼저 역할을 정한다. redirect 허용 목록·code 발급 같은 authorization server 통제는 relying-party client 문제와 다르다. 검증·결합 결함은 artifact를 소비하는 component에 있다.

**JWT 검증·claim 결합**
signature, 서버가 고정한 algorithm·key 출처, `exp`, `nbf`, `aud`, `iss`를 확인한다. 신뢰할 수 없는 key selector인 `kid`, `jku`, `x5u`, 중복·header 정규화, 검증 없는 decode 경로를 살핀다. 신뢰 issuer가 서명해도 다른 service용 유효 token은 여기서 유효하지 않다.

**OAuth/OIDC 요청·callback 결합**
target이 authorization server라면 정확한 `redirect_uri` 소유권을 검사한다. 해당 시 session에 결합된 `state`, PKCE·authorization code 결합, ID token issuer·audience·signature·nonce, 다중 provider flow의 선택 IdP 결합을 확인한다. 최초 callback, retry, mobile·deep link, 계정 연결 route를 비교한다.

**SAML 서명 객체·assertion 결합**
signature를 검증한 element가 실제 identity로 쓰이는지 확인한다. 서명 없는 fallback, 안전한 XML parser 설정, canonicalization 차이, 유효 기간·audience·recipient·요청 상관관계·replay 같은 freshness·binding field를 검토한다.

## MFA·passkey·계정 전환 공격 유형 (`subagent_type: general`)

**MFA 등록·assurance 하락**
등록, 교체, 비활성화, recovery code 생성, 신뢰 기기 추가, fallback login이 의도된 이전 assurance를 요구하는지 확인한다. 유효한 첫 번째 factor만으로 정책상 필요한 새 인증 없이 두 번째 factor를 등록·교체할 수 없는지, 비활성·오래된 factor가 session 승인을 멈추는지 본다.

**Step-up 결합·우회**
성공 challenge가 다른 session, 계정, tenant, 동작, API 요청의 assurance를 올리거나 대체 route에서 assurance 검사를 생략하는지 확인한다. challenge를 주체, 현재 session, assurance 대상, 필요 시 동작·리소스, 만료, 일회성 완료에 묶는다. UI, API, batch, recovery, 재개 flow를 비교한다.

**WebAuthn·passkey 검증**
등록 시 challenge, RP ID, 예상 origin, credential, user·userHandle, algorithm, 정책상 사용자 검증을 시작 session에 결합한다. 인증 시 challenge, RP·origin, credential 소속, signature, 의도된 user 존재·검증을 확인한다. 계정 검색·연결 flow의 userHandle 또는 credential-계정 혼동도 살핀다. signature counter 감소를 clone 징후로 취급하는 제품에서만 counter 처리가 의미 있다.

**계정 연결·identity 충돌**
기존 계정에 IdP, passkey, email, phone, device, 외부 계정을 추가할 때 현재 인증 session, 새 identity 소유권 확인, 정책상 step-up, 연결을 시작한 계정에 묶인 callback state가 필요한지 확인한다. unlink·relink·초대 수락에서 검증된 ID나 tenant 충돌을 살핀다.

**Password 재설정·기타 recovery**
recovery token, 지원·관리자 복구, backup code, 기기 이전, email·phone 변경은 가장 약한 인증 경로가 되기 쉽다. token 무작위성, 사용자·동작 결합, 만료, 일회용 상태, rate·accounting 통제, 전달 URL 신뢰, 이전 token·session 무효화를 확인한다. 공개 계정 존재만 알려주는 응답 차이는 자동으로 취약점이 아니다.

## API key·mTLS 공격 유형 (`subagent_type: general`)

**API key 범위·리소스 결합**
key가 server 기록보다 넓은 tenant·리소스·동작·환경을 인증하거나 요청 parameter가 binding을 덮는지 살핀다. key lookup, prefix·전체 secret 검증, publishable·secret key 혼동, scope 검사, rotation, revoke cache, bulk endpoint를 검토한다.

**API key 노출·안전하지 않은 전송**
낮은 신뢰 주체가 접근할 수 있는 client bundle, URL, redirect, log, 오류 경로, build artifact, response에 key가 들어가는지 확인한다. key라고 불리는 공개 ID는 secret이 아니다. key 종류와 노출로 얻는 권한을 입증한다.

**mTLS peer·앱 identity 혼동**
process가 모든 네트워크 peer의 client certificate ID header를 믿거나, chain은 검증하지만 공격자가 조작 가능한 subject 문자열을 계정에 잘못 매핑하거나, 잘못된 trust domain·extended usage·audience·유효성 정책의 certificate를 수락하는지 살핀다. 신뢰 proxy가 mTLS를 종료하면 그 proxy만 접속 가능한지, 들어온 ID header를 제거하는지, 정리된 ID를 request에 결합하는지 확인한다.

**Certificate 수명주기 fallback**
만료·취소·누락·갱신 실패 certificate 때문에 조용히 bearer-only·anonymous 동작으로 fallback하거나 장기 pooled connection이 revoke 뒤에도 권한을 유지하는지 확인한다. 배포 revoke 데이터가 없으면 `needs_validation`; 저장소 내 fail-open 분기는 소스로 입증 가능하다.

## 공통 조사 방법

- 각 credential·challenge의 발급 → 저장 → 전송 → 소비 → 갱신 → 취소를 추적하고 정상, 오류, retry, migration, legacy, 계정 전환 경로를 비교한다.
- 같은 identity와 민감 동작으로 들어가는 모든 경로를 나열한다. 실효 정책은 가장 세련된 UI가 아니라 가장 약한 병렬 경로다.
- parser, proxy, router, cache, 앱 정규화를 나란히 비교한다. 로컬 검증은 동일한 제한 request fixture를 각 component에 넣고 배포에 traffic을 보내지 않는다.
- recovery·연결 flow의 계정 전후 그래프를 그린다. 각 edge에 현재 주체, 새 identity 증명, 필요한 assurance, callback·session 결합, revoke 영향을 적는다.

## 보고 전 검증 규칙

1. 소스 가시성 gate를 적용한다. proxy chain, edge cache key, IdP 정책, certificate 신뢰, browser cookie 동작, secret, 배포 인증 mode는 저장소 밖일 수 있다. infrastructure 동작이 빠졌다고 주장하지 말고 정확한 `needs_validation` 후보를 쓴다.
2. framing·cache 문제는 양쪽 component와 다른 parse·key를 명시한다. 제한된 로컬 fixture로 요청 간·사용자 간·비공개 response 영향을 확인한다.
3. token, MFA, passkey, 계정 연결, recovery, API key, mTLS 문제는 검증 지점과 누락된 주체·session·resource·origin·audience·동작·assurance 결합을 인용한다. 서버가 잘못된 전환·credential을 수락함을 입증한다.
4. CSRF는 ambient credential, 상태 변경 route, 수락된 사이트 간 요청 형식, browser cookie 정책, 효과적인 검사 누락을 밝힌다. 읽기 전용 동작과 ambient가 아닌 bearer token을 요구하는 route는 해당하지 않는다.
5. framework·library 기본값을 확인한다. 버전·설정을 모르면 `needs_validation`으로 두고 미검증 critical 주장을 낮은 severity의 confirmed로 바꾸지 않는다.
6. 전체 소스 trace와 권한 없는 identity·상태·정보 노출이 관찰돼야 `confirmed`다. `needs_validation`에는 누락 사실과 이를 해결할 안전한 로컬·담당자 확인 절차를 쓴다.
