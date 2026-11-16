# 데스크톱·모바일 및 로컬 IPC 보안 점검

#### 이 문서를 사용할 때

대상이 데스크톱·모바일 앱, 권한 높은 helper, updater, 로컬 daemon, webview host, deep-link handler, 브라우저 native-messaging host, 로컬 IPC client/server일 때 참고한다. 신뢰할 수 없는 주체는 다운로드한 문서, 원격 web 콘텐츠, 다른 로컬 앱·OS 사용자, sandbox된 process, 낮은 권한 계정일 수 있다. 모든 로컬 사용자를 같은 권한으로 보지 말고 시작 권한을 명시한다.

브라우저 측 webview 동작은 `CLIENT-SIDE.md`, native 메모리와 loader 안전성은 `MEMORY-SAFETY-AND-BINARY.md`, update 진위 확인은 `SUPPLY-CHAIN-AND-RELEASE.md`를 참고한다.

## 기본 원칙 (이 영역의 모든 에이전트 프롬프트에 포함)

```
- 현실적인 로컬·원격 콘텐츠 공격자를 설정한다. 다른 앱·OS 사용자, sandbox 자식, 신뢰할 수 없는 문서, 원격 origin 등을 고려한다. 같은 계정과 권한 안에서 자기 자신에게 미치는 영향은 경계 위반이 아니다.
- 경로, process 이름, bundle/package ID, 주장된 sender 필드는 peer 인증이 아니다. OS peer credential, 코드 ID, capability handle, 보호된 channel 상태를 사용해야 한다.
- native bridge나 helper는 파싱 후 각 동작과 최종 리소스를 권한 확인해야 한다. UI나 broker를 신뢰한다고 공격자가 바꿀 수 있는 인자가 신뢰되는 것은 아니다.
- OS sandbox, signing, entitlement, permission, keychain ACL, exported-component 정책, prompt 동작은 고정된 버전에서 확인 가능할 때 실제 통제다.
- 소스 근거와 제한된 로컬·emulator 테스트가 있으면 `confirmed`다. signing, manifest 병합, OS 버전, 기기 정책, installer ACL, packaging을 확인할 수 없으면 `needs_validation`이다.
```

## Deep link·callback·navigation 공격 유형 (`subagent_type: general`)

**Custom scheme·deep link 모호성**
다른 앱이나 페이지가 현재 세션 및 일회용 callback 결합 없이 상태 변경, 데이터 가져오기, 인증 완료, 계정 선택을 수행하는 route를 호출할 수 있는지 확인한다. URI 정규화, 중복 query field, scheme·host·path 일치, exported activity·handler 정책, 오래되거나 재사용된 link를 살핀다.

**앱·계정 인계 혼동**
OAuth, SSO, magic link, 초대, 기기 연결, passwordless, 결제 callback이 잘못된 설치 앱, profile, tenant, 대기 중 거래로 돌아가는지 살핀다. 상태를 시작 앱 ID, 현재 세션, 계정, provider, 동작, 만료에 묶는다.

**파일 열기·intent 권한 혼동**
연결된 파일, 공유 intent, drag/drop 항목, pasteboard·clipboard 기록, 알림 동작, 파일 열기 event가 콘텐츠 형식, 필요한 경우 sender 신뢰, 현재 사용자 의도, 최종 대상을 확인하지 않고 권한 동작을 유발하는지 확인한다.

## Webview 및 native bridge 공격 유형 (`subagent_type: general`)

**Navigation origin과 bridge 혼동**
원격·공격자 제어 frame이 패키지 콘텐츠 전용 JavaScript/native bridge에 접근하는지 확인한다. 호출 시점과 모든 navigation, redirect, subframe, popup, 오류·fallback 화면 뒤에 origin을 검사한다. URL 접두사 검사와 최초 load 때 검사만으로는 부족하다.

**과도한 native bridge 권한**
web 콘텐츠가 범용 bridge로 임의 파일, 명령, IPC method, credential, 시스템 동작을 선택하는지 확인한다. method 허용 목록, 정규화된 인자, 사용자·tenant 권한, gesture·확인 요건, 반환값 노출을 살핀다.

**Webview 파일·전체 접근 권한**
file access, universal access, mixed content, debug interface, custom protocol handler가 origin을 예상치 못하게 연결해 원격 콘텐츠가 앱 로컬 파일, 권한 높은 scheme, 내부 origin을 읽는지 확인한다. 제한 설정이 없더라도 보호 콘텐츠에 도달할 수 없다면 보안 강화 사항이다.

## 로컬 IPC 및 exported component 공격 유형 (`subagent_type: general`)

**IPC peer 인증 누락**
Unix socket, named pipe, XPC, Binder, D-Bus, native messaging, RPC, shared memory, loopback listener가 OS credential, 코드 ID, sandbox token, channel 소유권을 확인하지 않고 낮은 신뢰도의 peer를 받는지 살핀다. channel 뒤에 실제 의미 있는 method나 정보가 있어야 한다.

**주장된 주체와 channel ID 불일치**
인증된 process·channel은 한 앱·사용자에 속하지만 요청 필드가 다른 사용자, tenant, profile, capability를 고르는지 확인한다. 호출자가 적은 ID가 아니라 peer credential에 method와 리소스를 결합한다.

**Export된 service·activity·receiver·provider 권한 과다**
모바일 component나 로컬 자동화 endpoint가 외부 호출을 받아 앱 내부용 동작을 수행하는지 확인한다. 최종 병합 manifest, intent filter, permission·signature 수준, path grant, 별칭을 검토한다. 패키징 후 manifest 상태를 모르면 `needs_validation`이다.

**IPC 수명주기·상관관계 혼동**
예측 가능한 request ID, 재사용 handle, 오래된 channel, 상속 descriptor, 모두 쓰기 가능한 socket 경로, 재시작 동작으로 한 peer가 다른 peer의 작업에 응답·취소·재사용할 수 있는지 확인한다. socket 파일, lock, port, 공유 mapping의 생성 권한과 정리를 살핀다.

## 권한 높은 helper·로컬 파일 공격 유형 (`subagent_type: general`)

**혼동된 대리인으로 동작하는 privileged helper**
낮은 권한 호출자가 작업별 권한 확인 없이 높은 권한의 명령, 파일, 서비스, 사용자, 시스템 설정을 고르는지 확인한다. sudo/polkit/UAC/XPC helper 규칙을 검토하고 helper가 정규화된 인자를 자체 검증하는지 확인한다.

**설치·업데이트·복구 경로 신뢰**
권한 부여 뒤 낮은 신뢰 주체가 쓸 수 있는 manifest, script, package, symlink, working directory, 복구 상태를 privileged installer/helper가 읽는지 살핀다. 승인을 변경 불가능한 콘텐츠와 안전한 목적지 경로에 결합한다.

**로컬 파일 소유권·TOCTOU**
앱이 파일·경로를 검사한 뒤 권한 읽기·쓰기 중 교체, symlink, mount, 대소문자·정규화 변화를 따라가는지 확인한다. descriptor 기준 작업을 사용하고 최종 소유권을 확인한다. 파일을 연 뒤 파싱은 `MEMORY-SAFETY-AND-BINARY.md`를 본다.

**Credential 저장소·로컬 secret 경계 불일치**
keychain/keystore 항목, token 파일, backup, log, clipboard, 알림 미리보기, 로컬 설정을 더 낮은 권한의 다른 앱·profile·사용자가 읽는지 살핀다. 의도된 동일 OS 계정만 읽을 수 있는 평문은 자동으로 취약점이 아니다. 낮은 신뢰 reader와 credential 권한을 밝혀야 한다.

## 앱 상태·기기 수명주기 공격 유형 (`subagent_type: general`)

**계정 전환·logout·기기 복원 후 정보 노출**
cache 데이터, background 작업, widget, 알림, 로컬 DB, webview 저장소, 생체 인증 승인이 logout·계정 변경 뒤에도 남아 다음 계정에 나타나는지 확인한다. backup/restore와 다중 profile 동작을 본다.

**대기 동작·사용자 존재 확인 혼동**
알림, widget, shortcut, 공유 창, 생체 인증 prompt, 지연 작업이 화면에 표시된 것과 다른 동작을 승인하거나 만료 후 실행하거나 다른 profile의 대기 상태를 사용하는지 살핀다. 확인을 정규화된 동작, 리소스, 계정, 현재 foreground 상태에 결합한다.

## 공통 조사 방법

- 모든 process, 앱 component, 로컬 endpoint, URI scheme, 파일 연결, webview origin, helper를 열거한다. OS ID, runtime 권한, 호출자, 호출 가능한 동작을 기록한다.
- 병합 manifest, entitlement, installer 규칙, native-messaging 등록, protocol handler, ACL 생성 등 최종 패키징 입력을 읽는다. 후속 단계에서 소스 선언이 덮일 수 있다.
- 격리된 기기·emulator에서 가짜 profile과 민감하지 않은 로컬 fixture로 검증한다. 다른 사용자 앱, credential, 운영 서비스를 건드리지 않는다.

## 보고 전 검증 규칙

1. 공격자가 가진 시작 권한, 넘은 OS·앱 주체 경계, 진입 channel, 수락된 인자·상태, 권한 없는 동작·노출을 명시한다.
2. 적용되는 OS sandbox, peer credential, signing, entitlement, permission, 사용자 동의, installer 통제를 확인한다. 패키징·runtime 사실이 불명확하면 `needs_validation`이다.
3. webview bridge는 navigation·origin 통제와 권한 높은 native sink를 모두 제시한다. IPC는 peer 인증과 리소스별 권한 확인을 제시한다. helper는 정규화 후 목적지를 확인한다.
4. 로컬 테스트는 가짜 콘텐츠·계정을 사용해 범위를 제한한다. 경계 결과를 입증하면 멈추고 지속성이나 더 넓은 시스템 변경으로 확대하지 않는다.
5. 소스와 로컬 근거 경로가 완전할 때만 `confirmed`로 보고한다. 필요한 OS, manifest, signing, ACL, 기기 수명주기 사실을 특정해 `needs_validation`으로 보고한다.
