# 데이터 격리 및 수명주기 보안 점검

#### 이 문서를 사용할 때

대상이 다중 테넌트 또는 접근 제어 데이터를 저장하거나, 검색·색인·cache·분석용 사본을 만들거나, object link를 발급하거나, 기록을 export·restore·migration하거나, 삭제·취소·보존 동작을 약속할 때 참고한다. 데이터 하나가 모든 복제본과 상태 전환을 거치는 경로를 추적한다. endpoint 접근 제어는 `ATTACK-CLASSES.md`, provider 저장 정책은 `CLOUD-AND-DEPLOYMENT.md`를 참고한다.

규모가 크면 기본 저장소, cache·검색, object·blob 저장소, 분석·logging, export·backup, 삭제·취소, migration 단위로 나눈다.

## 기본 원칙 (모든 에이전트 프롬프트에 포함)

```
- 레코드의 tenant·owner 필드만으로 격리된 것은 아니다. 각 읽기·쓰기 경로에서 이를 강제하는 query, key, path, policy, row-level 통제를 찾는다.
- 파생 사본도 추적한다. 정리된 원본 데이터가 다른 ACL·보존 정책을 쓰는 검색, cache, 분석, export, preview, log, replica, backup에서 위험해질 수 있다.
- 삭제와 취소는 수명주기 약속이다. 제품이 보장하는 범위에서 현재·과거·cache·색인·export·복원·대기열 사본을 확인한다.
- 개인정보나 보존 선호 자체가 보안 취약점은 아니다. 명시적인 데이터 접근 경계 또는 삭제·취소 보장과 권한 없는 reader나 후속 동작이 필요하다.
- 전체 데이터 계보가 소스에서 확인되고 가짜 테넌트로 제한된 테스트를 통과하면 `confirmed`다. 외부 저장 정책, 보존, CDN, replica 지연, backup 접근을 확인할 수 없으면 `needs_validation`이다.
```

## 테넌트 및 object 격리 공격 유형 (`subagent_type: general`)

**Tenant·owner 검사 누락**
읽기, 수정, 삭제, 목록, 개수 계산, 일괄 query가 인증된 tenant·owner에 object를 묶지 않거나 body 필드에서 ID를 받아들이는지 확인한다. 직접 조회, 관계 조회, background 작업, admin, import, legacy 경로를 비교한다.

**복합 key·namespace 충돌**
cache key, object 경로, DB 고유성, 검색 문서 ID, 임시 파일, 중복 제거 key에서 tenant나 환경이 빠졌는지 살핀다. 앱 레코드 owner가 달라도 두 주체가 같은 논리 key를 덮거나 가져올 수 있다.

**정책·query 불일치**
row-level policy, ORM 기본 scope, 권한 filter, raw·우회 client가 서로 다른 조건을 적용하는지 확인한다. join, aggregate, alias, view, transaction, `unscoped`·service client, context가 없는 오류 경로를 살핀다.

**Blob·서명 참조 권한 초과**
object key, attachment ID, version ID, 공유 link, signed URL이 발급 주체의 접근 범위를 넘는 동작·namespace를 허용하거나 원본 ACL 변경 뒤에도 유효한지 확인한다. 동작, 정확한 object·version, audience, 만료, tenant를 결합한다.

## 파생 데이터 및 노출 공격 유형 (`subagent_type: general`)

**검색·cache·색인의 ACL drift**
원본 ACL이나 수명주기가 바뀌어도 검색, cache, embedding, thumbnail, RSS, preview, index 사본이 무효화되지 않는지 살핀다. 문서 수집·무효화 때뿐 아니라 가져올 때도 filter를 검증한다.

**분석·log·trace·진단 시스템의 대체 접근 경로**
비공개 콘텐츠나 credential이 더 많은 사람이 보거나 오래 보관하거나 테넌트 간 섞이는 시스템에 기록되는지 확인한다. 데이터 종류와 실제 reader를 입증한다. 필드 이름, 공개 ID, 의도된 정책 아래 운영자만 보는 콘텐츠는 충분하지 않다.

**열거·집계 오라클**
개수, filter, 정렬, 오류, 고유성 제약, 시간, 알림, 존재 확인이 보호된 object나 계정 상태를 드러내는지 확인한다. 일반적인 응답 차이가 아니라 비밀에 대한 구체적 판별 조건과 관찰 가능한 차이가 필요하다.

## Export·backup·restore·migration 공격 유형 (`subagent_type: general`)

**Export·backup 범위 확대**
export, snapshot, portability package, report, backup에 다른 tenant, 접근 불가 필드, soft-delete 데이터, secret, 요청자의 권한보다 높은 이력이 포함되는지 확인한다. 선택 뒤 항목별 권한과 최종 artifact 다운로드 권한도 검사한다.

**Import·restore 권한 확대**
restore·import가 owner, schema, ACL, 고유성, 검증을 우회하거나 기존 리소스를 덮거나 요청자가 쓸 수 없는 tenant에 레코드를 만드는지 살핀다. archive 내용은 신뢰할 수 없는 입력으로 검증하고 과거 출처를 믿지 말고 결과 동작을 권한 확인한다.

**Migration 기본값·소유권 혼동**
이전 레코드에 tenant·ACL·수명주기 필드가 없거나, ID 충돌이 생기거나, 점진 배포 중 구버전과 신버전 reader의 기본값이 다른지 확인한다. backfill, dual-read/write, 호환성, rollback, 재개 경로를 살핀다.

**Backup·복제 경계 drift**
암호화 key, 저장 계정, 지역 간 replica, 복구 환경, 지원용 snapshot이 원본보다 넓은 ID·tenant 범위를 갖는지 확인한다. 소스는 저장소 안 정책만 확인할 수 있으며 호스팅 접근·보존은 `needs_validation`이다.

## 삭제·취소·수명주기 공격 유형 (`subagent_type: general`)

**Soft-delete·tombstone 우회**
직접 조회, 검색, 관계 순회, object link, background 처리, restore가 수명주기 조건을 무시해 삭제·취소된 레코드를 반환하거나 사용하는지 확인한다. 참조가 전부 사라지기 전에 soft-delete ID를 재등록할 수 있는지도 살핀다.

**오래된 권한 및 파생 사본 사용**
멤버 제거, ACL 변경, 동의 철회, secret 취소, role 강등 뒤에도 session, cache, subscription, job, materialized data가 무효화되지 않아 후속 동작을 허용하는지 확인한다.

**보존 기간을 넘는 대기 작업**
원본 저장소에서 삭제가 끝난 뒤 대기열 processor, retry, export, 분석, 생성 artifact가 약속된 경계를 넘어 데이터를 재생성하거나 보관하는지 살핀다. 멱등 삭제와 tombstone 전파를 확인한다.

**복원으로 잘못된 상태 재도입**
backup, undo, undelete, replica 복구가 현재 정책상 허용되지 않는 데이터, credential, membership, permission을 되살리는지 확인한다. 복원된 상태의 권한을 다시 확인하고 snapshot 이후의 수명주기 변경도 적용한다.

## 공통 조사 방법

- 보호 대상 레코드 하나를 골라 원본 쓰기, query, cache, index, event, export, backup, 삭제, 복원 경로를 그린다. 각 경계의 주체와 tenant를 표시한다.
- 로컬 service method에서 가짜 tenant 둘을 비교하고 ACL 변경, 삭제, 계정 전환, 복원 뒤에도 반복한다. 실제 사용자 데이터는 쓰지 않는다.
- 우회 client, background job, migration, 전역 고유성, cache key에서 시작한다. 이런 경로는 대화형 endpoint의 요청별 ID 정보를 빠뜨리기 쉽다.

## 보고 전 검증 규칙

1. 공격자나 낮은 신뢰도의 주체, 보호 데이터·상태, 영향받는 owner·tenant, 다른 사본·동작, 권한 없는 노출·변경을 밝힌다.
2. 기준이 되는 정책과 이를 누락하거나 다르게 적용하는 경로를 모두 제시한다. 다른 계층이 동일한 tenant·수명주기 조건을 강제하지 않는지도 확인한다.
3. 가짜 tenant와 민감하지 않은 fixture로 범위 간 접근 또는 오래된 수명주기 동작을 검증한다. 관찰할 최소 기록·동작에서 멈춘다.
4. 외부 cache, object storage, replica, 분석, backup, 보존 정책이 필요하면 `needs_validation`으로 분류하고 담당자가 확인할 절차를 적는다.
5. 전체 계보와 구체적인 경계 영향이 입증돼야 `confirmed`다. 해결되지 않은 저장소, ACL, 무효화, 보존, 복원 조건을 정확히 적어 `needs_validation`으로 보고한다.
