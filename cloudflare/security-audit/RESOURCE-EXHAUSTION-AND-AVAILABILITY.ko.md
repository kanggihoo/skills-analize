# 자원 고갈 및 가용성 보안 점검

#### 이 문서를 사용할 때

신뢰할 수 없는 요청, 메시지, 파일, tenant 상태, agent 작업이 CPU, memory, disk, connection, worker slot, 유료 API, queue 용량을 소모하거나 공유 서비스를 교착·중단시킬 수 있을 때 참고한다. 소스 검토로 입증할 수 있는 가용성 취약점과 일반 성능 문제를 구분한다. 공유 서비스나 운영 서비스를 압박해 검증하지 않는다.

메모리 무결성 문제는 `MEMORY-SAFETY-AND-BINARY.md`, broker 전달 로직은 `PROTOCOLS-RPC-AND-MESSAGING.md`를 참고한다. parser 문제가 다른 문서에서 다뤄지더라도 도달 가능한 fatal error가 공유 서비스에 영향을 주면 이 영역에도 해당한다.

## 기본 원칙 (모든 agent prompt에 포함)

```
- 입력에서 비용이 발생하는 경로, 실효 한도 누락, 다른 사용자·공유 서비스·안전 기능·운영자 비용에 대한 영향을 모두 확인한다. 요청자 자신의 process 안에서 끝나는 작업은 서비스 취약점이 아니다.
- rate limit 누락만으로는 충분하지 않다. 무제한이라고 결론 내리기 전에 body·message·file 크기, 동시성, queue, deadline, DB 제약, upstream gateway, tenant별 quota를 확인한다.
- stress·포화·운영 환경 테스트를 하지 않는다. 점근적 분석, 작은 경계 fixture, 유료 호출 mock, 엄격한 로컬 자원 제한, 결정론적 취소 테스트를 쓴다.
- 공격자 비용, 서비스 작업량, 지속성, 영향 범위, 복구 방식을 밝힌다. 입력 하나가 초선형 비용이나 지속적인 공유 영향을 내는 경우와 대량 요청은 다르다.
- 소스에 드러난 한도 실패를 안전하게 입증했으면 `confirmed`다. upstream 한도, 배포 topology, autoscaling, 유료 quota, 복구 동작을 저장소에서 확인할 수 없으면 `needs_validation`이다.
```

## 계산 증폭 공격 유형 (`subagent_type: general`)

**초선형 파싱·매칭·평가**
작은 입력이 정규식의 치명적 backtracking, 중첩 파싱, 재귀 검증, symbolic 평가, graph 순회, template 확장, 적대적 정렬·hash 동작을 유발하는지 확인한다. 허용되는 깊이·항목 수와 복잡도를 도출하고 로컬에서 제한된 증가 추이를 보인다.

**압축·표현 증폭**
압축·희소·중첩·alias·인코딩 입력이 검사한 전송량이나 파일 크기를 크게 넘어 확장되는지 확인한다. archive, image, font, 구조화 문서, protocol compression table을 포함해 모든 확장 단계와 parser 단계에서 한도를 확인한다.

**DB·후속 query 증폭**
query 깊이, filter 항목 수, pagination, 확장 field가 제한되지 않아 작은 요청이 넓은 scan, 비정상 join, fan-out, 무제한 정렬·집계, 다수의 후속 호출을 만드는지 확인한다. 같은 리소스 범위를 권한상 의도적으로 허용한 것은 아닌지도 검증한다.

## 자원 누적 공격 유형 (`subagent_type: general`)

**무제한 buffering·항목 수**
body, 순서가 뒤바뀐 stream, upload, session, 고유 cache key, metrics label, log field, subscription, 대기 job이 항목별·전체 한도 없이 쌓이는지 살핀다. 연결 종료, timeout, 취소, 부분 파싱 때 정리·만료가 이뤄지는지 확인한다.

**File descriptor·handle·임시 자원 누수**
잘못된 입력이나 취소 작업에서 정리 누락으로 socket, file, DB cursor, timer, subprocess, 임시 파일, object 참조가 남는지 확인한다. 제한된 로컬 반복으로 재현하고 공유 pool에 영향을 주는지 입증한다.

**취소 뒤에도 계속되는 작업**
client timeout, 연결 해제, 취소된 job, 권한 검사 실패 뒤 응답은 끝나지만 DB, model, network, worker 작업이 계속되는지 살핀다. 모든 계층에서 취소와 deadline이 전달되는지 추적한다.

## Quota·스케줄링 공격 유형 (`subagent_type: general`)

**인증 전 작업량 불균형**
비싼 파싱, key 조회, 암호 연산, 압축 해제, 외부 요청이 인증과 가장 이른 크기·속도 제한 전에 실행되는지 확인한다. 최소 공격자 작업과 공유 서비스 비용을 비교하고 upstream 제한을 살핀다.

**Quota 계산 범위·초기화 누락**
공격자가 바꿀 수 있는 IP, route, tenant, key prefix, task ID 등으로 사용량을 계산해 한 주체가 의도된 예산을 우회하거나 다른 주체 할당량을 쓰는지 확인한다. 정수 overflow, 분산 race, retry, 재연결, 계정 전환도 검토한다.

**Worker·pool·우선순위 기아**
낮은 우선순위·공격자 제어 job이 공유 lock, worker, DB pool, event loop 차례, scheduler 우선순위를 잡아 다른 사용자의 작업을 막는지 살핀다. queue·동시성 공정성을 우회하거나 deadline이 지난 뒤에도 slot을 보유하는 경로가 필요하다.

## 실패·복구 공격 유형 (`subagent_type: general`)

**도달 가능한 fatal error·교착**
신뢰할 수 없는 입력이 공유 process의 `panic`, abort, fatal assertion, 처리되지 않은 exception, process 종료, lock cycle, 무한 loop에 도달하는지 확인한다. supervisor 범위와 worker 하나만 멈추는지 서비스 전체가 멈추는지 살핀다. 격리 worker가 재시작되어 영향이 줄어도 결함 자체가 사라지는 것은 아니다.

**Retry 폭주·fail-open 증폭**
timeout, dependency 오류, 부분 처리 메시지, health check 실패가 jitter, 상한, circuit breaker, 중복 제거 없이 동시·무제한 retry를 유발하는지 확인한다. 제한된 실패 원인 하나가 지속적인 총 작업량을 만드는지 검증한다.

**독성 record·head-of-line 차단**
하나의 malformed record·message가 공유 queue, partition, startup scan, migration, 복구 loop 앞에서 반복 실패하는지 확인한다. 건너뛰기·격리 정책, offset, 다른 tenant가 막힌 단위를 공유하는지 살핀다.

**안전하지 않은 복구·용량 rollback**
재시작, restore, fallback, 정리 경로가 무제한 상태를 다시 만들거나 현재 quota를 무시하거나 즉시 장애를 재현하는 입력을 복구하는지 확인한다. 복구 정확성도 가용성의 일부다.

## 공통 조사 방법

- 입력에서 자원까지 표를 만든다. 처음 수락되는 크기·항목 수, 인증 전 작업, 후속 fan-out, 지속 저장, 공유 pool, 제한·정리 담당자, 복구 절차를 기록한다.
- 전체 한도와 객체별 한도를 비교한다. 유효한 1 byte 항목 만 개가 메시지별 한도를 피하면서 tenant 전체나 process 상태를 고갈시킬 수 있다.
- 엄격한 CPU·memory·시간 제한의 격리 fixture에서 작은 증가 단계만 검증한다. 외부·유료 호출은 mock하고 한도 누락이나 취소 동작을 관찰하면 멈춘다.

## 보고 전 검증 규칙

1. 신뢰할 수 없는 입력, 요청자 작업량, 서비스 증폭·점유 자원, 공유 영향 범위, 복구를 밝힌다. 구체적 공유 영향 없이 한도만 빠졌다면 보안 강화 사항이다.
2. 소스에서 확인 가능한 upstream, parser, queue, tenant, framework 한도가 경로를 막지 않는지 확인한다. 배포 통제를 알 수 없으면 `needs_validation`이다.
3. 초선형 동작은 허용 복잡도와 제한된 로컬 증가를 입증한다. 누수는 정리 후에도 반복적으로 유지됨을 보인다. fatal 경로는 process·supervisor 격리를 확인한다.
4. 가용성 영향을 일으키는 테스트는 하지 않는다. 적은 공격자 비용, 인증 불필요 접근, 테넌트 간 범위, 지속성, 취약한 복구를 기준으로 우선순위를 둔다.
5. 안전한 로컬 근거와 의미 있는 공유 영향이 있어야 `confirmed`다. 담당자가 확인할 정확한 upstream 한도, topology, quota, 복구 조건을 적어 `needs_validation`으로 보고한다.
