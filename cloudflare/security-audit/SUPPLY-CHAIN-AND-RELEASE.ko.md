# 공급망 및 release 보안 점검

#### 이 문서를 사용할 때

target이 dependency를 resolve하거나, 신뢰할 수 없는 기여 코드로 build하거나, CI를 실행하거나, release artifact를 만들거나, build에 서명·승격하거나, plugin을 불러오거나, 배포 소프트웨어를 update할 때 참고한다. 소스와 dependency에서 사용자가 실행하는 artifact까지 신뢰가 넘겨지는 과정을 다룬다. 로컬 binary loader 내부 결함은 `MEMORY-SAFETY-AND-BINARY.md`, runtime workload 권한은 `CLOUD-AND-DEPLOYMENT.md`를 참고한다.

규모가 큰 대상은 dependency 해석, CI 격리, artifact 출처, release 승인, updater·plugin 신뢰로 나눈다.

## 기본 원칙 (모든 agent prompt에 포함)

```
- 변경 가능한 dependency나 알려진 취약 dependency만으로는 finding이 아니다. 누가 해석 결과를 바꿀 수 있는지, 어떤 build가 이를 사용하는지, 뒤따르는 실행·release 경계를 밝힌다.
- 모든 인계 단계에서 무결성을 추적한다: source ID, resolve된 입력, build worker, artifact ID, test 결과, signature·attestation, 승격, update consumer.
- CI 설정은 권한 부여 코드다. 어떤 event가 workflow를 시작하는지, 누구 코드가 실행되는지, 어떤 secret·token이 있는지, 무엇을 공개·변경할 수 있는지 확인한다.
- artifact와 같은 신뢰할 수 없는 곳에서 받은 checksum은 독립 무결성 근거가 아니다. 신뢰 root와 실패 시 동작을 확인한다.
- 저장소 내 제어 흐름 결함을 제한된 로컬 검증으로 입증하면 `confirmed`다. branch 보호, hosted runner, registry, signing service, 운영 승격 사실을 관찰할 수 없으면 `needs_validation`이다.
```

## Dependency·build 입력 공격 유형 (`subagent_type: general`)

**Dependency source·namespace 혼동**
resolver 설정이 의도하지 않은 public/private namespace, fallback registry, mirror, repository, source URL을 선택할 수 있는지 확인한다. package 이름, source 우선순위, lockfile·checksum 사용, 대체 build 파일, 플랫폼별 해석, 최초 설치와 update 동작을 검토한다.

**변경 가능하고 결합되지 않은 build 입력**
build가 branch, tag, 검증되지 않은 submodule, 내려받은 tool, 생성 asset, 원격 include, floating CI action, 내용이 바뀔 수 있는 container tag를 검토 없이 소비하는지 살핀다. 낮은 신뢰 writer와 신뢰된 build output으로 이어지는 경로가 있어야 한다. 재현성만으로 진위를 증명할 수 없다.

**생성 소스·codegen 출처 검증 누락**
schema, vendored archive, 생성 client, localization, 문서 예시, binary blob이 source와 같은 review·무결성 gate 없이 실행·배포 콘텐츠를 만드는지 확인한다. 로컬 재생성과 commit된 결과를 비교하고 입력과 generator의 제어 주체를 확인한다.

**Build context 포함 범위**
build context와 ignore 규칙이 release 입력 범위를 넘어 secret, 로컬 설정, repository metadata, test fixture, 개발자 artifact를 package·image에 넣는지 살핀다. 결과 artifact에 실제 credential, 비공개 데이터, 권한 설정이 노출돼야 한다.

## CI·자동화 공격 유형 (`subagent_type: general`)

**권한 높은 workflow에서 신뢰할 수 없는 코드 실행**
pull request, issue comment, fork, dependency update, 외부 event가 contributor 제어 코드를 보호 secret, 쓰기 token, 배포 권한, 신뢰 runner와 함께 실행하는지 확인한다. trigger 유형, checkout ref, 승인 gate, 환경 보호, 권한 축소를 비교한다. 소스에 없는 repository-host 기본값을 가정하지 않는다.

**Workflow command·expression 혼동**
공격자 제어 branch 이름, commit message, issue field, artifact 이름, matrix 값, 생성 결과가 canonical 검증 없이 shell command, template expression, 경로, 권한 높은 workflow 입력에 들어가는지 살핀다.

**Cache·artifact·workspace 신뢰 혼합**
낮은 신뢰 job이 cache, artifact, 공유 workspace, output을 채우고 권한 높은 job이 이를 복원해 실행·배포하는지 확인한다. cache key·namespace, artifact producer ID, digest 결합, 보존 기간, 승격 시 변경 가능한 이름으로 다시 resolve하는지 검토한다.

**자동화 ID 권한 과다**
CI job이 필요한 동작·repository·환경·기간보다 넓은 권한을 받고 신뢰할 수 없는 입력이 대상 리소스를 선택할 수 있는지 확인한다. 최소 권한 원칙 위반만으로는 보안 강화 사항이며 권한 동작에 실제로 도달해야 한다.

## Release·update 공격 유형 (`subagent_type: general`)

**Build에서 승격까지 artifact 바꿔치기**
test, review, signature, publish가 동일 immutable digest가 아니라 바뀔 수 있는 tag, 파일명, channel, artifact ID를 참조하는지 확인한다. build부터 release까지 복사, 재패키징, architecture 병합, provenance 단계를 모두 살핀다.

**Release 승인·서명 정책 누락**
잘못된 workflow, repository, branch, 환경, key 역할, threshold의 release·signature가 수락되는지 확인한다. attestation 내부 ID claim을 검토하고 consumer가 유효한 signature뿐 아니라 claim도 검증하는지 확인한다. 정책상 필요한 key rotation·만료·취소는 fail-closed여야 한다.

**Update metadata·rollback 혼동**
updater가 payload byte는 인증해도 version, 제품, platform, channel, 대상 경로, 만료, rollback 상태를 인증하지 않거나 서로 다른 승인 transaction의 metadata와 payload를 함께 받는지 살핀다. 원자적 설치와 복구 동작을 확인한다. 정책 결합 없는 signature API 호출만으로는 충분하지 않다.

**Plugin·extension 신뢰 확장**
extension package가 선언 범위보다 큰 host 권한을 얻거나 낮은 신뢰 publisher가 다른 publisher ID를 대체하거나 진위·권한 검사 전에 설치·update hook이 실행되는지 확인한다. 같은 사용자가 임의 plugin을 설치하는 의도된 동작은 권한 경계가 아니다.

## 공통 조사 방법

- 배포 digest나 설치 update에서 거꾸로 추적해 모든 source, 생성 입력, credential, worker, cache, test 결과, 승인 결정을 확인한다.
- 신뢰할 수 없는 workflow event와 보호된 event를 나란히 비교한다. 양쪽 사이에 저장되는 모든 전달 경로를 표시하고 immutable ID와 producer 신뢰를 요구한다.
- 취소된 key, download 실패, attestation 누락, 플랫폼 일부 release, rollback, registry 장애 경로를 검토한다. 실패 정책도 release 무결성의 일부다.

## 보고 전 검증 규칙

1. 낮은 신뢰도 행위자, 제어 가능한 source·cache·artifact·metadata, 이를 소비하는 신뢰된 job·updater, 권한 없는 공개·코드 포함·secret 노출·권한 실행 결과를 명시한다.
2. 깨진 인계에서 artifact ID가 어떻게 이어지는지 입증한다. 바뀔 수 있는 이름이나 결합되지 않은 digest가 실제 consumer에 도달해야 한다.
3. 고정 버전의 내장 package manager, repository host, registry, signing 기본값을 확인한다. hosted 통제가 불명확하면 `needs_validation`이다.
4. 로컬 검증은 무해한 fixture repository, 가짜 credential 표시값, 로컬 registry·설정, 비운영 artifact namespace를 사용해 제한한다. 실제 release를 공개하거나 바꾸지 않는다.
5. 소스에서 보이는 전체 인계와 의미 있는 결과가 있어야 `confirmed`다. 담당자가 확인할 branch, runner, registry, signing, 배포 사실을 특정해 `needs_validation`으로 보고한다.
