# 클라이언트 측 및 브라우저 보안 점검

#### 이 문서를 사용할 때

브라우저에서 신뢰 판단이나 신뢰할 수 없는 콘텐츠 렌더링이 이뤄질 때 참고한다. SPA, 브라우저 확장, 내장 webview, service worker, 오프라인 앱, 공격자가 영향을 주는 콘텐츠를 DOM에 표시하거나 창 간 메시지를 받거나 브라우저 저장소를 쓰는 코드가 대상이다. 서버가 보지 못하는 URL fragment, `window.name`, `postMessage`, 이전에 cache된 콘텐츠도 입력이 될 수 있다.

`ATTACK-CLASSES.md`와 함께 사용한다. 이 문서는 브라우저 입력과 sink, origin 경계, 브라우저의 지속 저장, 사이트 간 상태 오라클을 다룬다. webview bridge의 native 측은 `DESKTOP-MOBILE-AND-LOCAL-IPC.md`, 서버 측 CSRF·세션·인증 callback은 `WEB-PROTOCOL-AND-AUTH.md`를 참고한다.

## 기본 원칙 (모든 에이전트 프롬프트에 포함)

```
- 클라이언트 측 후보에는 공격자가 제어할 수 있는 source와 실행 또는 정보 노출 sink가 모두 필요하다. 두 지점을 밝히고 공격자 영향 데이터가 sink에 도달함을 보인다.
- 영향은 피해자의 세션, 다른 origin 또는 공유 저장소에 미쳐야 한다. 자기 자신에게만 주입되거나 공격자 자신의 데이터가 노출되는 경우는 취약점이 아니다.
- framework escaping, 브라우저 same-origin policy, CSP, COOP/CORP, service-worker 범위, 최신 브라우저의 기본 noopener 설정은 실제 통제다. 영향을 판단하기 전에 확인한다.
- 브라우저 저장소와 cache는 origin 단위로 공유되고 로그인 상태보다 오래 남을 수 있다. 누가 쓰고 읽는지, 계정·테넌트·worker 수명주기에서 어떤 기록이 지워지는지 확인한다.
- 완전한 소스 근거와 제한된 로컬 브라우저 테스트가 있을 때만 `confirmed`로 분류한다. renderer, 확장 권한, 배포 header, 브라우저 정책 확인이 필요하지만 불가능하면 `needs_validation`을 쓴다.
```

## DOM 및 객체 상태 공격 유형 (`subagent_type: general`)

**DOM 기반 XSS**
`location` 필드, `document.referrer`, `window.name`, 메시지 데이터, 저장소, 브라우저가 제어하는 문서 상태가 `innerHTML`, `outerHTML`, `document.write`, 문자열을 실행하는 API, 실행 가능한 URL, jQuery HTML API, framework escaping 우회 지점으로 흘러가는지 추적한다. framework가 보간값을 escape한다면 취약점이 아니다.

**DOM clobbering**
공격자가 넣은 `id`나 `name` 속성이 전역 변수, form 속성, 설정 객체, 초기화 flag를 가리고 코드가 그 값을 신뢰하는지 확인한다. 속성이 살아남는 markup 경로와 가려진 값의 보안상 사용을 모두 입증한다.

**Prototype pollution 및 gadget chain**
공격자가 제어하는 key가 deep merge나 경로 대입 같은 재귀 쓰기에 도달해 prototype 상태를 바꾸는지 살핀다. 이후 접근 가능한 gadget이 오염된 속성으로 권한 확인, 실행, navigation, rendering을 바꾸는지 확인한다. `JSON.parse`, 얕은 복사, gadget 없는 오염만으로는 충분하지 않다.

## Origin 간 메시지 및 네트워크 공격 유형 (`subagent_type: general`)

**`postMessage` origin 및 source 신뢰**
handler가 정확한 origin 허용 목록을 확인하지 않고 `event.data`로 민감한 동작을 하는지 살핀다. 같은 origin에 frame이 여럿이면 예상한 `event.source`도 확인해야 한다. 전송 측은 민감한 데이터가 `*` 대상으로 보내져 엉뚱한 embedder에 도달하는지 확인한다. 부분 문자열·접두사·접미사 비교나 anchor 없는 정규식은 origin 검증이 아니다.

**사이트 간 WebSocket 요청 악용**
WebSocket upgrade가 `Origin` 검사나 채널 전용 token 없이 신뢰할 수 없는 origin의 요청을 ambient cookie와 함께 수락해 피해자 세션으로 데이터를 읽거나 바꾸는지 확인한다. upgrade 동작과 보안상 의미 있는 message handler를 모두 검증한다.

**Credential이 포함된 CORS 신뢰**
서버가 `Origin`을 반사하거나 약하게 비교하면서 credential을 허용하고 민감한 응답을 돌려주는지 확인한다. credential과 함께 쓰는 단순 wildcard는 브라우저가 거부한다. 실제 허용 origin 경로와 사이트 간 데이터 노출 또는 변경만 보고한다.

## Service worker 및 브라우저 저장소 공격 유형 (`subagent_type: general`)

**Service worker 등록 및 범위 탈취**
공격자 영향 콘텐츠가 등록 worker script가 되거나, 과도하게 넓은 `Service-Worker-Allowed` 범위의 경로를 제어하거나, 무결성 통제 없이 update import를 바꾸는지 확인한다. 최종 script URL, 응답 MIME type, origin, scope, import script의 제어 주체를 살핀다. 의도된 범위의 정상 same-origin worker는 결함이 아니다.

**Service worker cache와 사용자 ID 혼동**
worker가 계정, 테넌트, 인증 상태, 요청 mode를 정책에 반영하지 않고 개인화 응답을 cache한 뒤 계정 전환이나 logout 후에도 제공하는지 살핀다. fetch event 라우팅, cache 이름과 key, navigation fallback, 정리 동작, 오류·오프라인 경로가 다른 사용자의 이전 응답을 내주는지 확인한다.

**브라우저 저장소 노출 및 오래된 권한**
token, 비공개 응답, 초안, 권한 판단이 `localStorage`, `sessionStorage`, IndexedDB, Cache Storage, 확장 저장소, 클라이언트 상태에 남아 다른 계정이나 같은 origin의 낮은 권한 구성요소에서 읽히는지 확인한다. token 저장만으로는 취약점이 아니다. 현실적인 낮은 권한 reader가 있거나 revoke/logout 뒤에도 계속 사용돼야 한다.

**컨텍스트 간 저장소 및 broadcast 혼동**
`storage` event, `BroadcastChannel`, shared worker, origin 전체 cache가 현재 세션에 결합되지 않은 ID나 명령을 탭 사이에 전하는지 확인한다. 계정 전환, private/public 창, 테넌트 변경, 오래된 탭이 최신 인증 상태를 덮는 경우를 살핀다.

## 사이트 간 정보 노출 유형 (`subagent_type: general`)

**XS-Leaks 및 사이트 간 상태 오라클**
브라우저가 피해자 credential을 붙이는 동안 공격자 페이지가 리소스 load/error event, frame·window 상태, redirect, timing, cache 상태, 응답 크기로 보호된 사이트 상태를 구분하는지 확인한다. 비공개 object, 역할, 계정의 존재 여부처럼 비밀과 연결된 구체적 조건이 필요하다. 일반적인 timing 차이나 공개 리소스 가용성은 취약점이 아니다.

**Window 및 opener 상태 노출**
다른 origin 창에서 허용된 metadata나 navigation 결과가 보호 상태를 드러내는지, 또는 유지된 opener·이름 지정 window 관계로 공격자 페이지가 권한 높은 navigation에 영향을 주는지 확인한다. COOP, frame 보호, `noopener`, 정확한 origin, 관찰 상태의 기밀성을 점검한다.

## UI 속임수 및 navigation 공격 유형 (`subagent_type: general`)

**Clickjacking**
frame 안에서 상태 변경 동작을 막는 `frame-ancestors`, `X-Frame-Options` 또는 동등한 UI 격리가 유효한지 확인한다. 민감한 동작이 frame 안에서 실제 완료돼야 한다. 읽기 전용 페이지의 header 누락은 보안 강화 권고에 그친다.

**클라이언트 navigation 혼동**
클라이언트 source가 scheme과 목적지 정책 검사 없이 redirect나 navigation을 제어하는지 살핀다. 실행 가능한 `javascript:`와 `data:`도 포함한다. reverse tabnabbing은 코드가 명시적으로 `window.opener`를 유지하거나 격리 없이 `window.open`을 쓰거나 암묵적 `noopener`를 지원하지 않는 브라우저를 대상으로 할 때만 해당한다.

## 공통 조사 방법

- DOM, navigation, worker, message, storage sink에서 시작해 브라우저 전용 및 서버 제어 source를 거슬러 추적한다. 경로를 차단해야 할 브라우저 정책도 기록한다.
- 로컬 테스트 origin과 가짜 계정으로 계정 전환, logout, worker update, 오프라인 fallback, 오래된 탭 상태를 시험한다. 운영 사용자·origin·공유 서비스는 쓰지 않는다.
- XS-Leaks는 소스와 로컬 브라우저 동작으로 입증한 판별 조건만 적는다. 어떤 응답 header나 rendering 선택이 오라클을 없애는지도 확인한다.

## 보고 전 검증 규칙

1. source, sink, 브라우저 정책, 영향받는 origin·세션, 관찰 가능한 변경이나 노출을 제시한다.
2. prototype pollution은 재귀 쓰기와 보안상 의미 있는 gadget을 입증한다. DOM clobbering은 markup이 유지되고 가려진 값이 사용됨을 입증한다.
3. service worker와 저장소 문제는 수명주기 경로를 입증한다. 공격자 제어 쓰기나 cache 항목이 다른 계정·테넌트 또는 이후 권한 상태에 도달해야 한다.
4. messaging, CORS, WebSocket, XS-Leaks는 정확한 origin·source 검사와 노출된 보호 상태나 동작을 보인다. CSP, COOP/CORP, cookie, SameSite가 이미 차단하지 않는지 확인한다.
5. 완전한 클라이언트 경로와 제한된 로컬 근거가 있어야 `confirmed`로 보고한다. 담당자가 확인할 배포 header, 확장 권한, 브라우저 버전, renderer 동작을 구체적으로 적어 `needs_validation`으로 보고한다.
