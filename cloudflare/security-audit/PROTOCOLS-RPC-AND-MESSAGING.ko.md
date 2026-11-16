# Protocol·RPC·메시징 보안 점검

#### 이 문서를 사용할 때

target이 gRPC, GraphQL transport, Cap'n Proto, Thrift, Protobuf, 사용자 정의 binary protocol, streaming RPC, webhook, broker, queue, pub/sub, event bus를 쓸 때 참고한다. peer ID, 논리 메시지 해석, routing, replay, 순서, 전달 의미를 다룬다. parser 메모리 안전성은 `MEMORY-SAFETY-AND-BINARY.md`, HTTP framing은 `WEB-PROTOCOL-AND-AUTH.md`, 가용성 영향은 `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md`를 참고한다.

규모가 큰 시스템은 producer·consumer 쌍, 외부·내부 peer 역할, 동기 RPC, streaming, 비동기 메시지 경로별로 나눈다.

## 기본 원칙 (모든 agent prompt에 포함)

```
- “내부”라는 말은 인증이 아니다. 각 hop의 peer ID를 밝히고 권한 확인에 쓰이는 앱 주체로 어떻게 이어지는지 보인다.
- schema 검증은 메시지 형식만 확인할 뿐 출처, 리소스 권한, 순서, 값의 안전성을 증명하지 않는다. decode된 필드가 정책과 부작용으로 이어지는 경로를 추적한다.
- broker 보장과 앱 보장은 다르다. 상태 변경을 평가하기 전에 retry, 순서, acknowledgment, 중복 제거, transaction 동작을 기록한다.
- parser 해석 불일치를 주장하려면 실제 consumer 둘, schema 버전 둘 또는 wire 표현 둘과 보안상 의미가 다른 값 하나를 제시한다.
- 전체 소스 경로와 제한된 로컬 producer·consumer 테스트가 있으면 `confirmed`다. broker ACL, service-mesh ID, topic 연결, 저장소 밖 호환 동작이 필요하면 `needs_validation`이다.
```

## Framing·schema·해석 공격 유형 (`subagent_type: general`)

**메시지 경계·정규화 불일치**
구성요소가 길이, 압축, 중복 필드, 알 수 없는 필드, encoding, 숫자 폭, 정규화, envelope와 body 우선순위를 다르게 해석하는지 확인한다. 생성 parser와 사용자 정의 parser, gateway, 언어 binding, 버전 변환기를 비교한다. decode 뒤 어떤 주체·리소스·동작이 달라지는지 입증한다.

**Union·enum·기본값 혼동**
알 수 없는 variant, 누락된 discriminator, 0 값, 기본 권한, 호환성 mapping이 검증된 case라고 가정하는 코드에 도달하는지 살핀다. 모든 분기 처리, 기본 분기, 새 field를 구버전 consumer가 해석하는 방식을 확인한다.

**Envelope·payload ID 불일치**
권한 확인은 신뢰돼 보이는 routing·envelope metadata를 쓰지만 handler는 body의 다른 tenant, account, subject, object, sender를 대상으로 동작하는지 확인한다. 어떤 출처가 기준인지 밝히고 client가 이를 덮어쓸 수 없게 한다.

## RPC ID·권한 공격 유형 (`subagent_type: general`)

**Interceptor·method 경로 불일치**
authn/authz interceptor가 unary method에는 적용되지만 stream, reflection, health, gateway 변환 경로, 호환 service, 개별 stream message에는 빠지는지 확인한다. 모든 등록과 route를 같은 동작끼리 비교한다.

**Peer ID와 앱 주체 혼동**
mTLS, workload identity, bearer metadata, forwarded ID, broker credential이 channel을 인증하지만 호출자 제어 field가 사용자·tenant를 선택하는지 살핀다. channel ID와 주장된 주체를 결정론적 정책으로 결합해야 한다.

**항목별·stream 권한 검사 누락**
stream, subscription, batch, bulk message를 한 번만 검사한 뒤 뒤따르는 항목이 다른 리소스를 지정하거나 role·membership·token 취소 뒤에도 계속되는지 확인한다. 범위가 바뀔 수 있는 곳에서 재검사하고 subscription을 원래 주체에 묶는다.

**Callback·응답 상관관계 혼동**
예측 가능하거나 재사용되거나 테넌트 간 겹치는 correlation ID로 응답, webhook, 취소, acknowledgment가 다른 호출자의 대기 작업을 완료하는지 살핀다. 진행 중인 각 요청을 인증된 peer, tenant, 동작, 수명주기에 결합한다.

## Broker·queue 격리 공격 유형 (`subagent_type: general`)

**Topic·routing key·subscription 범위 누락**
publisher나 subscriber가 다른 tenant의 topic, wildcard, consumer group, partition, reply queue, dead-letter route를 선택할 수 있는지 확인한다. 보이는 broker ACL과 앱 측 namespace 구성을 함께 살핀다. payload에 tenant 이름이 들어 있다는 사실만으로 격리되지는 않는다.

**Dead-letter·retry·진단 정보 노출**
dead-letter queue, 오류 topic, tracing, 운영자 화면으로 간 메시지에 secret이나 테넌트 간 payload가 있고 낮은 신뢰 consumer가 접근하는지 확인한다. 정상 전달만 보지 말고 실패 경로의 정책과 redaction을 검토한다.

**신뢰할 수 없는 producer를 control plane으로 취급**
독립적으로 인증된 producer와 event type 확인 없이 메시지 body가 스스로 admin event, provider callback, replication record, migration 지시라고 선언할 수 있는지 살핀다. 권한 높은 처리를 하기 전에 signature와 source·account·audience 결합을 검증한다.

## Replay·순서·transaction 공격 유형 (`subagent_type: general`)

**중복 전달·멱등성 통제 누락**
중복 제거가 없거나 mutation 후에 이뤄지거나 tenant·동작 간 충돌하는 key를 써 retry·재전달이 부작용을 반복하는지 확인한다. broker 전달 모델과 원래부터 멱등적이지 않은 동작을 입증한다.

**순서가 뒤바뀐 오래된 메시지 수락**
오래된 상태, 취소된 membership, 취소 작업, step-up 이전 권한이 최신 상태 뒤에 도착해 이를 덮는지 살핀다. sequence·version 검사, tombstone, partition 변경, restore·replay 흐름을 확인한다.

**Acknowledgment·commit 순서 오류**
durable commit 전에 acknowledgment가 이뤄져 보안상 중요한 작업이 유실되거나, 신뢰할 수 없는 acknowledgment 전에 commit되어 mutation이 중복되는지 확인한다. transactional outbox/inbox와 실패 복구를 검토한다.

**여러 consumer 간 부분 전환**
여러 consumer가 하나의 권한·업무 전환을 함께 수행하지만 retry와 부분 실패로 일부만 commit되는지 확인한다. 원자적으로 지속해야 하는 불변식 또는 현재 권한으로 보상해야 하는 동작을 밝힌다.

## 공통 조사 방법

- 각 메시지 유형의 producer → broker·transport → gateway → consumer → storage를 그린다. 각 hop의 인증 peer, 기준 tenant·resource field, 검증, 부작용을 기록한다.
- 같은 작은 fixture를 저장소 내 모든 schema 버전·언어 binding에 입력한다. 부하를 만들지 않고 중복, 누락, 미지 값, 경계 값, replay, 순서 변경 메시지를 시험한다.
- 정상, retry, dead-letter, replay, migration, reflection, stream, gateway 변환 route를 비교한다. transport가 바뀌어도 보안 정책이 유지돼야 한다.

## 보고 전 검증 규칙

1. 현실적인 producer·peer, 수락된 메시지, 인증된 channel ID, 영향받는 주체·리소스, 권한 없는 변경·노출을 밝힌다.
2. 해석 불일치라면 parser·consumer 양쪽과 다르게 decode되는 값을 제시한다. 어느 한쪽이 안전하게 거부하면 confirmed가 아니다.
3. replay·순서 문제는 실제 전달 보장을 확인하고 제한된 로컬·메모리 transport로 불변식 실패를 재현한다.
4. 권한·격리 문제는 소스에서 확인 가능한 모든 interceptor, broker ACL, gateway, consumer 계층을 검증한다. 외부 연결 설정이 필요하면 `needs_validation`이다.
5. 전체 메시지 수명주기와 의미 있는 관찰 결과가 있어야 `confirmed`다. 필요한 broker, service ID, route, 전달 조건을 구체적으로 적어 `needs_validation`으로 보고한다.
