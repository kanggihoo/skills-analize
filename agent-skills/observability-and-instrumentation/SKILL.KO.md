---
name: observability-and-instrumentation
description: 프로덕션 동작이 보이고 진단 가능하도록 코드를 계측합니다. 로깅, 메트릭, 트레이싱, 알림을 추가할 때 사용합니다. 프로덕션에서 실행되는 기능을 출시하면서 동작한다는 증거가 필요할 때 사용합니다. 프로덕션 이슈가 보고되었지만 가용한 데이터로 무슨 일이 일어났는지 알 수 없을 때 사용합니다.
---

# 관측 가능성과 계측

## 개요

관측할 수 없는 코드는 운영할 수 없는 코드입니다. 관측 가능성은 코드가 방출하는 텔레메트리를 이용해 "시스템이 지금 무엇을 하고 있으며 왜 그러는가?"를 외부에서 답할 수 있는 능력입니다. 계측은 출시 후에 덧붙이는 작업이 아니라 테스트를 작성하듯 기능과 함께 작성해야 합니다. 텔레메트리 없이 기능이 출시되면, 사용자가 처음 보고하는 버그는 쿼리 한 번으로 끝나지 않고 고고학 발굴이 됩니다.

## 사용 시점

- 프로덕션에서 실행될 기능을 만들 때
- 새 서비스, 엔드포인트, 백그라운드 작업, 외부 연동을 추가할 때
- 프로덕션 장애를 진단하는 데 너무 오래 걸렸을 때 ("무슨 일이 일어났는지 알 수 없었다")
- 알림 규칙을 설정하거나 검토할 때
- I/O, 재시도, 큐, 서비스 간 호출을 추가하는 PR을 검토할 때

**사용하지 않는 경우:**
- 지금 진행 중인 장애를 진단할 때 -- `debugging-and-error-recovery` 스킬을 사용하세요 (관측 가능성이 있어야 다음번에 그 스킬이 빨라집니다)
- 측정된 느린 동작을 프로파일링하고 최적화할 때 -- `performance-optimization` 스킬을 사용하세요
- 출시 당일 모니터링 체크리스트와 롤백 기준 -- `shipping-and-launch` 스킬을 참고하세요. 이 스킬은 그 체크리스트에 데이터를 공급하는 계측을 다룹니다

## 프로세스

### 1. 계측하기 전에 "정상 동작"을 정의하세요

질문이 없는 텔레메트리는 소음입니다. 어떤 계측이든 추가하기 전에, 이 기능에 대해 온콜 엔지니어가 물어볼 질문을 2-4개 적으세요.

```
FEATURE: checkout payment retry
QUESTIONS ON-CALL WILL ASK:
1. What fraction of payments succeed on first attempt vs after retry?
2. When a payment fails permanently, why? (provider error? timeout? validation?)
3. Is the payment provider slower than usual?
→ Every signal below must help answer one of these.
```

질문을 적을 수 없다면 아직 계측할 준비가 안 된 것입니다. 모든 것을 로깅하고도 아무것도 배우지 못하게 됩니다.

### 2. 각 질문에 맞는 신호를 고르세요

| 신호 | 답하는 질문 | 비용 특성 | 예시 |
|---|---|---|---|
| **구조화된 로그** | "이 특정 케이스에서 무슨 일이 일어났는가?" | 이벤트마다 발생하며 트래픽에 비례해 증가 | 제공자 에러 코드를 담은 `payment_failed` |
| **메트릭** | "전체적으로 얼마나 자주, 얼마나 빠른가?" | 시리즈당 비용 고정, 조회 저렴 | 제공자 호출의 p99 지연 시간 |
| **트레이스** | "여러 서비스에 걸쳐 시간이 어디에서 쓰였는가?" | 요청마다 발생하며 보통 샘플링 | 느렸던 체크아웃 한 건을 홉별로 분해 |

경험칙: 메트릭은 무언가 **잘못되었다는 것**을, 트레이스는 **어디**인지를, 로그는 **왜**인지를 알려줍니다.

### 3. 구조화된 로깅

문장이 아니라 이벤트를 기록하세요. 모든 로그 라인은 안정적인 이벤트 이름과 기계가 읽을 수 있는 필드를 가진 JSON 객체여야 합니다.

```typescript
// BAD: string interpolation — unqueryable, inconsistent
logger.info(`Payment ${id} failed for user ${userId} after ${n} retries`);

// GOOD: stable event name + structured fields
logger.warn({
  event: 'payment_failed',
  paymentId: id,
  provider: 'stripe',
  errorCode: err.code,
  attempt: n,
}, 'payment failed');
```

**로그 레벨은 일관되게 사용하세요:**

| 레벨 | 의미 | 온콜의 조치 |
|---|---|---|
| `error` | 불변식이 깨졌으며, 누군가 조치해야 할 수 있음 | 조사 |
| `warn` | 성능은 저하되었지만 처리됨 (재시도 성공, 폴백 사용) | 추이를 관찰 |
| `info` | 의미 있는 비즈니스 이벤트 (주문 완료, 작업 종료) | 없음 |
| `debug` | 진단용 세부 정보 | 프로덕션에서는 기본적으로 꺼짐 |

**상관 ID(correlation ID)는 필수입니다.** 시스템 경계에서 요청 ID를 생성하거나 받아서, 모든 로그 라인, 스팬, 외부 호출에 붙이세요. 그렇지 않으면 뒤섞인 로그에서 단일 요청을 재구성할 수 없습니다.

```typescript
// Express: child logger per request, ID propagated downstream
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] ?? crypto.randomUUID();
  req.log = logger.child({ requestId: req.id });
  res.setHeader('x-request-id', req.id);
  next();
});
```

**여러 진입점이 하나의 로그에 기록한다면, 진입점의 이름을 적으세요.** 상관 ID는 실행(run)을 식별할 뿐, 어떤 코드 경로가 그것을 시작했는지는 말해주지 않습니다. 같은 작업이 스케줄러, 리플레이 엔드포인트, 수동 CLI 실행으로 시작되면 하나의 싱크에 구분할 수 없는 라인들이 쌓입니다. 그러면 라인의 출처를 알아내려고 소거법에 의존하게 되고 -- 스케줄러 이력, 프로세스 테이블, 배포 로그를 교차 확인하게 됩니다. 그 방법은 그런 외부 기록이 우연히 아직 남아 있는 동안에만 통합니다. 실행이 시작되는 지점에서 진입점을 상관 ID 옆에 찍고, 두 값을 같은 방식으로 전파하세요.

```typescript
// One helper for every entry point: the run's own logger carries both fields.
// `entryPoint`, not `source` — ECS reserves `source.*` for network fields.
export const runLog = (entryPoint: 'scheduler' | 'replay_endpoint' | 'cli', runId: string) =>
  logger.child({ entryPoint, requestId: runId });

// scheduler tick        -> runLog('scheduler', crypto.randomUUID())
// POST /jobs/:id/replay -> runLog('replay_endpoint', req.id)
// CLI invocation        -> runLog('cli', process.env.RUN_ID ?? crypto.randomUUID())
```

두 필드는 상관 ID와 같은 경계를 넘어야 합니다 -- 큐 메타데이터, HTTP 헤더 등. 그렇지 않으면 워커가 진입점을 다시 유추하게 되고 추측하게 됩니다. 진입점과 단순히 상관관계가 있는 필드는 힌트일 뿐 귀속(attribution)이 아닙니다. 작업을 호출할 수 있는 누구든 그 필드를 똑같이 재현할 수 있기 때문입니다.

**비밀 값, 토큰, 비밀번호, 전체 PII는 절대 로깅하지 마세요.** 이는 `security-and-hardening` 스킬의 엄격한 규칙입니다. 텔레메트리 파이프라인은 데이터 유출의 전형적인 경로입니다. 필드는 허용 목록(allowlist)으로 관리하고, 요청 본문 전체를 로깅하지 마세요.

### 4. 메트릭

요청을 처리하는 서비스라면 모든 엔드포인트와 모든 외부 의존성에 **RED**를 계측하세요. **R**ate(초당 요청 수), **E**rrors(실패율), **D**uration(평균이 아닌 지연 시간 히스토그램). 큐, 풀, 호스트 같은 리소스에는 **USE**를 사용합니다: **U**tilization(사용률), **S**aturation(포화도), **E**rrors(에러).

트레이싱과 마찬가지로, 벤더 중립적인 경로는 OpenTelemetry 메트릭 API입니다(단계 5와 같은 SDK와 컨텍스트). 아래 예시는 Prometheus의 `prom-client`를 사용합니다. 이는 여러 백엔드 선택지 중 하나일 뿐이며, RED/USE와 카디널리티 규칙은 어떤 백엔드를 쓰든 동일합니다.

```typescript
import { Histogram } from 'prom-client';

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status_class'],  // '2xx', not '200'
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});
```

**카디널리티가 실패의 주된 원인입니다.** 고유한 라벨 조합마다 별도의 시계열이 생깁니다. 라벨은 작고 고정된 집합(라우트 템플릿, 상태 클래스, 제공자 이름)에서 와야 합니다. 사용자 ID, 원시 URL, 에러 메시지 등 제한이 없는 값을 라벨로 쓰지 마세요 -- 그런 값은 로그와 트레이스에 속합니다.

```
OK as label:    route="/api/tasks/:id"   status_class="5xx"   provider="stripe"
NEVER a label:  user_id, email, request_id, full URL, error message text
```

평균은 절대 추적하지 말고, 백분위수는 항상 추적하세요. 평균은 아주 나쁜 경험을 하고 있는 1%의 사용자를 가려버립니다. 히스토그램을 사용하고 p50/p95/p99를 읽으세요.

### 5. 분산 트레이싱

OpenTelemetry를 사용하세요. 벤더 중립적인 표준이며, 자동 계측(auto-instrumentation)이 HTTP, gRPC, 흔한 DB 클라이언트를 거의 코드 없이 커버합니다.

```typescript
// tracing.ts — must be imported before anything else
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  serviceName: 'checkout-service',
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

의미 있는 내부 작업 단위(예: `applyDiscounts`, `chargeProvider`) 주변에만 수동 스팬을 추가하고, 온콜이 필터링할 속성을 붙이세요. 모든 비동기 경계(HTTP 헤더, 큐 메시지 메타데이터)에 걸쳐 컨텍스트를 전파하세요. 그렇지 않으면 트레이스가 그 틈에서 끊어집니다. 기본값으로는 낮은 비율로 헤드 기반 샘플링을 하고, 백엔드가 테일 샘플링을 지원한다면 에러는 100% 보존하세요.

### 6. 알림

원인이 아니라 **사용자가 체감하는 증상**에 대해 알림을 설정하세요.

```
SYMPTOM (page-worthy):           CAUSE (dashboard, not a page):
error rate > 1% for 5 min        CPU at 85%
p99 latency > 2s                 one pod restarted
queue age > 10 min               disk at 70%
```

원인 기반 알림은 실제로 아무 문제가 없을 때도 울리고, 예측하지 못한 장애는 놓칩니다. 증상 기반 알림은 원인과 무관하게 사용자가 피해를 입는 바로 그 순간에 울립니다.

만드는 모든 알림에 적용할 규칙:

1. **조치 가능해야 합니다.** 응답이 "무시하세요, 저절로 해결됩니다"라면 그 알림은 삭제하세요.
2. **런북에 링크되어야 합니다** -- 세 줄이라도 좋습니다: 의미, 처음 실행할 쿼리, 에스컬레이션 경로.
3. **임계값과 지속 시간은 추측이 아니라 SLO나 과거 데이터로 정당화되어야 합니다.**
4. 심각도는 두 단계만 쓰세요: **page**(사용자 대면, 즉시 조치)와 **ticket**(성능 저하, 이번 주 안에 조치). 세 번째 단계는 소음이 되어 사람들이 모든 것을 무시하도록 훈련시킵니다.

#### 런북 작성하기

위의 규칙 2는 모든 알림이 런북에 링크되기를 요구합니다. 런북의 역할은 독자가 생각하지 않고도 세 가지 질문에 답하게 하는 것입니다: 무슨 일이 일어나고 있는가, 먼저 무엇을 확인해야 하는가, 그래도 해결되지 않으면 누구를 불러야 하는가. 알림 이름을 따서 `docs/runbooks/`에 저장하세요.

**최소한의 런북 (세 줄):**

```markdown
# Runbook: High Error Rate on /api/tasks
**Means:** DB connection pool likely exhausted, or a bad deploy.
**First check:** `SELECT count(*) FROM pg_stat_activity WHERE backend_type = 'client backend';`
  — if count > pool limit, see Step 2. (Swap in the equivalent for your database.)
**Escalate to:** #db-oncall or engineering on-call rotation.
```

**세 줄을 넘어 확장해야 할 때:** 첫 번째 확인만으로는 판단하기에 부족할 때만 단계를 추가하세요. 가장 흔한 원인 세 가지를 다루는 다섯 단계짜리 런북이, 모든 엣지 케이스를 다루지만 대충 훑어보게 되는 스무 단계짜리 문서보다 낫습니다.

**런북을 최신 상태로 유지하세요.** 런북이 사용된 모든 인시던트를 종료하는 과정의 일부로 런북을 업데이트하세요. 오래된 런북은 잘못된 확신을 줍니다. 어떤 단계가 틀렸거나 빠져 있었다면, 인시던트를 해결됨으로 표시하기 전에 고치세요.

### 7. 텔레메트리 자체를 검증하세요

계측도 코드이며, 틀릴 수 있습니다. 작업이 끝났다고 판단하기 전에, 경로를 실제로 트리거하고 실제 출력을 확인하세요.

- 스테이징에서 에러를 강제로 발생시킨다 → `requestId`로 로그에서 찾고, 필드가 구조화되어 있는지 확인한다 (`[object Object]`가 아닌지)
- 테스트 트래픽을 보낸다 → 예상한 라벨과 합리적인 값을 가진 메트릭 시리즈가 나타나는지 확인한다
- 트레이싱 UI에서 요청 하나를 여러 서비스에 걸쳐 따라간다 → 끊어진 스팬이 없는지 확인한다
- 새 알림마다 한 번씩 발사한다 (임계값을 일시적으로 낮춘다) → 올바른 채널에 도달하는지, 런북 링크가 동작하는지 확인한다

## 흔한 합리화

| 합리화 | 현실 |
|---|---|
| "동작하고 나서 로깅을 추가하겠습니다" | "나중에"는 "첫 번째 인시던트 이후"가 되고, 그때는 자신이 눈이 멀어 있었다는 사실을 발견하는 가장 비싼 순간입니다. 만들면서 계측하세요. |
| "로그가 많을수록 관측 가능성이 높아진다" | 구조화되지 않은 소음은 인시던트를 더 빠르게가 아니라 더 느리게 만듭니다. 쿼리 가능한 이벤트 세 개가 문장형 로그 300줄보다 낫습니다. |
| "console.log로 당분간 충분하다" | 구조화되지 않은 출력은 필터링, 상관관계 분석, 알림 설정이 불가능합니다. 구조화된 로거는 한 번 설정하는 데 5분 더 걸릴 뿐입니다. |
| "무언가 깨지면 대시보드를 보면 된다" | 정의된 질문 없이 만든 대시보드는 답만 빼고 모든 것을 보여줍니다. 온콜의 질문에서 시작하세요. |
| "중요한 건 전부 알림으로 걸고, 나중에 튜닝하자" | 시끄러운 페이저는 사람들이 무시하도록 만듭니다. 튜닝은 일어나지 않고, 놓친 실제 페이지가 그 대가를 치릅니다. |
| "사용자 ID를 메트릭 라벨로 쓰면 디버깅이 쉬워진다" | 메트릭 백엔드도 쓰러지게 만듭니다. 고카디널리티 조회는 로그와 트레이스에 속합니다. |
| "서비스가 두 개뿐인데 트레이싱은 과하다" | 서비스가 두 개만 되어도 로그로는 답할 수 없는 서비스 간 지연 질문이 생깁니다. 자동 계측 덕분에 비용은 사소합니다. |

## 위험 신호

- 재시도, 큐, 외부 호출이 있는데 새 텔레메트리가 전혀 없는 기능 PR
- 구조화된 필드 대신 문자열 보간으로 만든 로그 라인
- 상관 ID/요청 ID가 없어서 각 로그 라인이 고아가 되는 경우
- 스케줄러, 웹훅, 수동 실행이 하나의 로그 스트림에 섞여 있고 어느 쪽이 라인을 만들었는지 알려주는 필드가 없는 경우
- 사용자 ID, 원시 URL, 에러 메시지 텍스트를 라벨로 쓴 메트릭 (카디널리티 폭탄)
- 백분위수 없이 평균으로만 추적한 지연 시간
- 매일 울리고 아무 조치 없이 확인 처리되는 알림
- 사용자 대면 에러율은 모니터링하지 않으면서 원인 기반 알림(CPU, 메모리)이 사람을 호출하는 경우
- 로그에 나타나는 비밀 값, 토큰, 또는 전체 요청 본문
- "내 컴퓨터에서는 동작한다"가 프로덕션 기능이 건강하다는 유일한 증거인 경우

## 검증

기능을 계측한 뒤 다음을 확인하세요:

- [ ] 이 기능에 대한 온콜 질문이 적혀 있고, 각 신호가 하나의 질문에 대응한다
- [ ] 모든 로그 출력이 구조화되어 있으며(JSON), 안정적인 이벤트 이름과 모든 라인의 상관 ID를 가진다
- [ ] 둘 이상의 진입점이 기록하는 모든 로그 싱크에는 진입점 필드가 있으며, 이는 실행이 시작되는 곳에서 설정되고 상관 ID와 함께 전파되며 하류에서 추론되지 않는다
- [ ] 어떤 로그 라인에도 비밀 값, 토큰, 마스킹되지 않은 PII가 없다 (실제 출력을 샘플 확인)
- [ ] 모든 새 엔드포인트와 모든 외부 의존성에 대해 제한된 라벨 집합을 가진 RED 메트릭이 존재한다
- [ ] 지연 시간은 히스토그램이며, p95/p99를 조회할 수 있다
- [ ] 단일 요청을 트레이싱 UI에서 끊어진 스팬 없이 처음부터 끝까지 따라갈 수 있다
- [ ] 모든 새 알림은 증상 기반이며, 런북 링크가 있고, 한 번 실제로 발사해 보았다
- [ ] 스테이징에서 유도한 장애를 소스 코드를 읽지 않고 텔레메트리만으로 찾을 수 있었다

이 체크리스트의 요약본과 출시 전 계측 게이트는 `../../references/observability-checklist.md`를 참고하세요.
