# Cloud 및 배포 보안 점검

#### 이 문서를 사용할 때

저장소가 cloud identity, infrastructure, container, Kubernetes, service mesh, serverless function, edge worker, ingress, object storage, 관리형 서비스 또는 환경별 설정을 정의하면 참고한다. 배포 구성요소가 의도한 ID, 격리, 네트워크 접근, secret, 정책을 받는지 확인한다. 소스는 실제 상태가 아니라 의도만 나타낼 수 있으므로 소스에서 확인된 결함과 배포 환경 확인이 필요한 사항을 구분한다.

빌드·배포 승격 신뢰는 `SUPPLY-CHAIN-AND-RELEASE.md`, HTTP proxy 동작은 `WEB-PROTOCOL-AND-AUTH.md`, 데이터 저장소의 테넌트 범위는 `DATA-ISOLATION-AND-LIFECYCLE.md`를 본다.

## 기본 원칙 (모든 에이전트 프롬프트에 포함)

```
- manifest만 보고 실제 노출을 추정하지 않는다. 적용 환경, 기본값이나 overlay의 변경, 활성 소스 경로를 확인한다.
- 각 workload ID를 구체적인 동작과 리소스에 연결한다. 정책 범위가 넓다는 사실만으로는 취약점이 아니다. 낮은 신뢰도의 입력이 권한 없는 동작에 도달해야 한다.
- ingress, proxy, service mesh, metadata service, admission 정책은 실제 경계지만 설정과 연결이 확인될 때만 통제로 인정한다.
- secret 참조는 secret 노출이 아니다. 낮은 신뢰도의 reader, 출력, artifact, log 경로 또는 안전하지 않은 fallback이 있어야 한다.
- 활성 저장소 설정과 로컬 렌더링·정책 검증으로 입증되면 `confirmed`로 분류한다. 계정 정책, 네트워크 연결, runtime admission, 호스팅 metadata, drift를 담당자가 확인해야 하면 `needs_validation`으로 분류한다.
```

## Workload ID 및 IAM 공격 유형 (`subagent_type: general`)

**Workload ID 권한 과다**
workload, pod, function, edge worker, node ID가 역할 범위를 넘어 테넌트, 계정, 리소스, API에 접근하고, 신뢰도가 낮은 요청이나 job 입력이 대상을 선택할 수 있는지 확인한다. cloud 정책 조건, 리소스 패턴, service-account 연결, namespace 매핑, credential fallback을 살핀다.

**계정·테넌트 간 role 혼동**
role assumption, external ID, token 교환, workload federation, 리소스 정책이 의도한 원본 계정, audience, repository, namespace, workload에 묶이지 않은 ID claim을 받는지 확인한다. 신뢰 정책과 호출자가 제어할 수 있는 claim을 모두 입증한다.

**Cloud metadata에 앱 권한 확인 위임**
앱이 호출자가 보낸 ID header, tag, label, account ID, 리소스 metadata가 cloud control plane이나 신뢰된 proxy에서 왔는지 확인하지 않고 믿는지 살핀다. Cloud IAM과 앱의 권한 검사는 별개다.

## Ingress, 네트워크, control plane 공격 유형 (`subagent_type: general`)

**예상하지 못한 서비스·관리 plane 접근**
ingress, service, listener, security group, load balancer annotation, port mapping, server bind가 admin, debug, metrics, node, control plane, 내부 API를 낮은 신뢰도의 네트워크에 노출하는지 확인한다. 네트워크 통제가 빠졌다는 사실만으로는 `needs_validation`이다. 저장소에서 제어하는 공개 route가 민감한 handler로 이어지면 `confirmed`일 수 있다.

**신뢰 proxy·mesh ID 우회**
backend가 의도한 ingress·sidecar 밖의 peer가 보낸 forwarded ID, mTLS subject, authorization metadata를 받거나, 다른 port·health·legacy 경로가 mesh를 우회하는지 확인한다. header 제거, peer 접근 가능성, proxy가 없을 때 fail-open되는지 살핀다.

**Metadata·내부 서비스 접근**
신뢰할 수 없는 URL, 목적지, protocol 선택이 workload credential을 사용할 수 있는 instance·container metadata, control-plane socket, 내부 API에 도달하는지 추적한다. URL 파싱과 redirect는 `ATTACK-CLASSES.md`를 참고하고, 배포 네트워크·metadata 버전·ID 경계를 확인한다.

## Container 및 orchestration 공격 유형 (`subagent_type: general`)

**Host·control plane 권한 노출**
낮은 신뢰도의 workload가 privileged mode, capability, host namespace·path, device mount, container runtime socket, service-account token을 선택해 node·control plane 권한으로 넘어가는지 확인한다. seccomp나 read-only filesystem이 없더라도 접근 가능한 동작이 경계를 넘지 않으면 보안 강화 권고다.

**Admission·정책 경로 불일치**
한 배포 경로는 image ID, namespace, 리소스, secret, 권한 정책을 적용하지만 다른 controller, job, upgrade, restore, 호환성 경로는 적용하지 않는지 확인한다. 대체 경로와 실제 배포 객체를 입증한다.

**Namespace·label 신뢰 혼동**
네트워크, admission, secret, workload ID 정책이 낮은 신뢰도의 주체도 설정 가능한 label, annotation, 이름, namespace에 기대는지 살핀다. selector의 제어 주체와 일치할 때 부여되는 권한을 비교한다.

## 설정 및 secret 수명주기 공격 유형 (`subagent_type: general`)

**보안 통제 우선순위 drift**
개발 설정, chart 기본값, 환경 변수, CLI flag, feature gate, sidecar 삽입, 지역별 overlay가 배포 환경에서 인증, 전송 보안, 테넌트 범위, 감사 정책을 끄는지 확인한다. 기본 파일만 보지 말고 유지되는 각 배포의 최종 설정을 렌더링한다.

**Workload 경계 간 secret 노출**
다른 workload나 테넌트도 접근할 수 있는 log, crash report, process argument, 공유 환경, 넓은 volume, build output, service discovery, read API로 secret이 흘러가는지 확인한다. secret의 종류와 권한을 확인한다. 공개 endpoint나 key ID는 credential이 아니다.

**Credential 갱신·장애 fallback**
workload credential을 mount, refresh, rotate, revoke하지 못해 오래된 credential이 남거나 앱이 덜 신뢰되는 ID mode를 받는지 살핀다. startup, readiness, reconnect, cache된 client 동작을 검토한다.

## 관리형 저장소, event, edge 공격 유형 (`subagent_type: general`)

**Object·signed URL 정책 혼동**
bucket·container 정책, object key, CDN origin, signed URL이 주체, 동작, object namespace, audience, 만료 시각에 묶여 있는지 확인한다. 읽기뿐 아니라 목록·버전 조회와 쓰기도 본다.

**Event source ID 혼동**
function이나 worker가 provider 서명 envelope, subscription·topic, account, region, 재전송 상태를 확인하지 않고 event body를 source ID로 믿는지 살핀다. push, pull, retry, dead-letter 경로를 비교한다.

**Edge·runtime 경계 불일치**
edge·serverless runtime이 origin runtime과 다른 secret, API, filesystem, 격리, 테넌트 정책을 가정하는지, origin fallback이 권한이나 cache 동작을 바꾸는지 확인한다. 각 경로를 고르는 설정을 입증한다.

## 공통 조사 방법

- 유지 중인 모든 환경을 렌더링하고 외부 port, workload ID, 네트워크 peer, mount된 secret, cloud 리소스를 표로 만든다. 차이는 담당자나 정책 설명을 확인한다.
- 낮은 신뢰도의 요청, object, label, event가 cloud 정책에 들어가는 경로를 추적한다. 마지막 동작을 하는 workload credential과 적용돼야 할 범위를 밝힌다.
- 일반 배포, migration, restore, node 유지보수, failover, 로컬·emulator 경로를 비교한다. mesh, admission, ID, secret, 정책 서비스가 없을 때도 확인한다.

## 보고 전 검증 규칙

1. 활성 소스 경로와 실제 deployment object를 확인한다. 모르면 `needs_validation`으로 두고 빠진 렌더링 manifest나 담당자가 확인할 연결 상태를 적는다.
2. 낮은 신뢰도의 호출자·workload, cloud 또는 앱 ID, 제어 가능한 selector, 영향받는 리소스, 권한 없는 동작이나 노출을 밝힌다.
3. 고정된 버전의 provider·orchestrator 기본값을 확인한다. 공개 IP, 접근 가능한 metadata service, 허술한 firewall, 연결되지 않은 admission 정책을 가정하지 않는다.
4. 로컬에서 template 렌더링, 정책 평가, 격리 fixture의 container·user namespace 검사, 가짜 ID를 쓰는 emulator 실행은 가능하다. 실제 endpoint를 조회하거나 공유 cloud 리소스를 바꾸지 않는다.
5. 활성 소스 경로와 구체적인 경계 결과가 모두 있어야 `confirmed`다. 필요한 배포 정책, ID 연결, overlay, 네트워크, drift 관찰을 정확히 적어 `needs_validation`으로 보고한다.
