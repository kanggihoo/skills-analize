---
name: performance-optimization
description: 프런트엔드, 백엔드, 쿼리, 데이터베이스 전반에 걸쳐 애플리케이션 성능을 최적화합니다. 성능 요구사항이 존재할 때, 성능 회귀가 의심될 때, Core Web Vitals나 로드 시간을 개선해야 할 때, N+1 쿼리 패턴을 고쳐야 할 때, 또는 프로파일링으로 병목이 드러났을 때 사용합니다.
---

# 성능 최적화

## 개요

최적화하기 전에 측정하세요. 측정 없는 성능 작업은 추측이며, 추측은 중요한 것을 개선하지 못하면서 복잡성만 더하는 조기 최적화로 이어집니다. 먼저 프로파일링하고, 실제 병목을 찾고, 고치고, 다시 측정하세요. 측정이 중요하다고 증명한 것만 최적화하세요.

## 사용 시점

- 명세에 성능 요구사항이 있을 때 (로드 시간 예산, 응답 시간 SLA)
- 사용자나 모니터링이 느린 동작을 보고할 때
- Core Web Vitals 점수가 기준치 아래일 때
- 어떤 변경이 회귀를 일으켰다고 의심될 때
- 대용량 데이터셋이나 고트래픽을 처리하는 기능을 만들 때

**사용하지 않는 경우:** 문제에 대한 증거가 없는데 최적화하지 마세요. 조기 최적화는 얻는 성능보다 더 많은 비용을 치르는 복잡성을 추가합니다.

## Core Web Vitals 목표

| 지표 | 좋음 | 개선 필요 | 나쁨 |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | ≤ 200ms | ≤ 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |

## 최적화 워크플로

```
1. MEASURE  → Establish baseline with real data
2. IDENTIFY → Find the actual bottleneck (not assumed)
3. FIX      → Address the specific bottleneck
4. VERIFY   → Measure again; keep or revert
5. GUARD    → Add monitoring or tests to prevent regression
```

### 1단계: 측정

두 가지 상호 보완적인 접근을 모두 사용하세요:

- **합성 측정 (Lighthouse, DevTools Performance 탭):** 통제된 조건에서 재현 가능합니다. CI 회귀 탐지와 특정 문제 분리에 가장 적합합니다.
- **RUM (web-vitals 라이브러리, CrUX):** 실제 조건에서의 실사용자 데이터입니다. 수정이 실제로 사용자 경험을 개선했는지 검증하려면 필요합니다.

**프런트엔드:**
```javascript
// Synthetic: Lighthouse in Chrome DevTools (or CI)
// Chrome DevTools → Performance tab → Record
// Chrome DevTools MCP → Performance trace

// RUM: Web Vitals library in code
import { onLCP, onINP, onCLS } from 'web-vitals';

onLCP(console.log);
onINP(console.log);
onCLS(console.log);
```

**백엔드:**
```javascript
// Response time logging
// Application Performance Monitoring (APM)
// Database query logging with timing

// Simple timing
console.time('db-query');
const result = await db.query(...);
console.timeEnd('db-query');
```

### 어디서부터 측정할지

증상을 보고 무엇을 먼저 측정할지 정하세요:

```
What is slow?
├── First page load
│   ├── Large bundle? --> Measure bundle size, check code splitting
│   ├── Slow server response? --> Measure TTFB in DevTools Network waterfall
│   │   ├── DNS long? --> Add dns-prefetch / preconnect for known origins
│   │   ├── TCP/TLS long? --> Enable HTTP/2, check edge deployment, keep-alive
│   │   └── Waiting (server) long? --> Profile backend, check queries and caching
│   └── Render-blocking resources? --> Check network waterfall for CSS/JS blocking
├── Interaction feels sluggish
│   ├── UI freezes on click? --> Profile main thread, look for long tasks (>50ms)
│   ├── Form input lag? --> Check re-renders, controlled component overhead
│   └── Animation jank? --> Check layout thrashing, forced reflows
├── Page after navigation
│   ├── Data loading? --> Measure API response times, check for waterfalls
│   └── Client rendering? --> Profile component render time, check for N+1 fetches
└── Backend / API
    ├── Single endpoint slow? --> Profile database queries, check indexes
    ├── All endpoints slow? --> Check connection pool, memory, CPU
    └── Intermittent slowness? --> Check for lock contention, GC pauses, external deps
```

### 2단계: 병목 식별

범주별로 흔한 병목입니다:

**프런트엔드:**

| 증상 | 가능한 원인 | 조사 방법 |
|---------|-------------|---------------|
| LCP 느림 | 큰 이미지, 렌더링을 막는 리소스, 느린 서버 | 네트워크 워터폴, 이미지 크기 확인 |
| CLS 높음 | 크기가 없는 이미지, 늦게 로드되는 콘텐츠, 폰트 변경에 따른 밀림 | 레이아웃 시프트 귀속 확인 |
| INP 나쁨 | 메인 스레드의 무거운 JavaScript, 큰 DOM 업데이트 | Performance 트레이스의 긴 작업 확인 |
| 초기 로드 느림 | 큰 번들, 많은 네트워크 요청 | 번들 크기, 코드 스플리팅 확인 |

**백엔드:**

| 증상 | 가능한 원인 | 조사 방법 |
|---------|-------------|---------------|
| API 응답 느림 | N+1 쿼리, 누락된 인덱스, 최적화되지 않은 쿼리 | 데이터베이스 쿼리 로그 확인 |
| 메모리 증가 | 누수된 참조, 제한 없는 캐시, 큰 페이로드 | 힙 스냅샷 분석 |
| CPU 급증 | 동기식 무거운 계산, 정규식 백트래킹 | CPU 프로파일링 |
| 높은 지연 시간 | 캐싱 누락, 중복 계산, 네트워크 홉 | 스택 전반에서 요청 추적 |

### 3단계: 병목 수정

2단계에서 식별한 한 가지만 고치고, 다른 것은 건드리지 마세요. 아래 안티패턴들이 흔한 용의자입니다. 각 항목은 규칙과 이를 알아보는 특징을 제시하고, 구체적인 수정 예시로 연결되는 링크를 제공합니다([references/optimization-patterns.md](references/optimization-patterns.md)). 해당 코드를 만났을 때 필요한 것만 여세요.

**백엔드**

- **N+1 쿼리.** 행마다 쿼리를 하나씩 실행하는 것은 가장 흔한 백엔드 병목입니다. 루프 안에서 가져오지 말고, 같은 쿼리에서 관계를 함께 가져오세요(join/include). [패턴](references/optimization-patterns.md#n1-queries-backend).
- **제한 없는 데이터 조회.** 모든 목록 엔드포인트는 제한(limit)과 안정적인 정렬 순서로 페이지를 나눠야 합니다. [패턴](references/optimization-patterns.md#unbounded-data-fetching).
- **인덱스를 무시하는 쿼리.** "인덱스를 추가하자"는 추측이고, `EXPLAIN ANALYZE`가 측정입니다. 인덱스를 기대했던 곳의 `Seq Scan`, 한 자릿수 이상 어긋난 `rows=` 추정, 스캔 위의 `Sort` 노드는 각각 다른 수정을 요구합니다. 잘못된 `rows=` 추정은 오래된 통계를 의미하므로, 인덱스를 추가하기보다 `ANALYZE`를 실행하세요. 쿼리의 형태에 맞춰 인덱스를 만드세요(동등 비교 컬럼이 먼저, 그 다음 범위 또는 정렬 컬럼). 일반 인덱스는 선택도가 낮은 지배적 값(드문 값에는 부분 인덱스가 도움이 됩니다), 선행 와일드카드(trigram이나 전문 검색 필요), 컬럼에 적용된 함수(`WHERE lower(email) = ?`처럼 표현식을 인덱싱)에는 도움이 되지 않으며, 모든 인덱스는 모든 쓰기에 부담을 줍니다. 이후 플랜을 다시 실행하세요. 플랜을 바꾸지 못한 인덱스는 되돌려야 합니다. [패턴](references/optimization-patterns.md#queries-that-ignore-their-index).
- **커넥션 풀 고갈.** 신호: *모든* 엔드포인트가 동시에 느려지고, 시간은 실행이 아니라 커넥션을 기다리는 데 쓰이며, 데이터베이스에는 대부분 유휴 세션이 보입니다. 프로세스당 풀 하나를 두고, `인스턴스 수 × max`가 데이터베이스의 커넥션 상한 아래에 머물도록 크기를 맞추세요. 크다고 빨라지지 않습니다. 큐를 데이터베이스로 옮길 뿐이며, 그곳은 보기가 더 어렵습니다. 인스턴스 수가 무제한인 경우(서버리스, 오토스케일링)에는 `max`를 올리는 대신 프록시(pgbouncer, RDS Proxy)로 다중화하세요. [패턴](references/optimization-patterns.md#connection-pool-exhaustion).
- **캐싱 누락.** 생성 비용이 크고 바뀌는 것보다 훨씬 자주 읽히는 것을 캐시하세요. 이미 빠른 쿼리를 캐시하면 네트워크 홉과 오래된 데이터 버그가 생기고 얻는 것은 없습니다. 계층을 신중하게 고르세요(프로세스 내부, 공유, CDN). 응답을 바꾸는 모든 입력은 키에 들어가야 합니다(테넌트, 로케일, 권한, 기능 플래그). 뷰어를 빼먹는 키는 한 사용자의 데이터가 다른 사용자에게 제공되는 경로입니다. 무효화 전략은 하나만 고르세요(TTL, 이벤트 또는 태그 기반, 버전 키). 허용 가능한 오래된 데이터의 시간 창을 명시하세요. 뜨거운 키는 스탬피드에 대비하세요. 한 요청이 재계산하는 동안 오래된 값을 제공하거나, 동시 미스를 하나의 진행 중인 프로미스 뒤로 합치세요. 최신이어야 하는 것(잔액, 권한, 결제 시점의 재고)은 절대 캐시하지 마세요. [패턴](references/optimization-patterns.md#missing-caching-backend). 요청 병합, 쓰기 전략, 네거티브 캐싱은 `../../references/performance-checklist.md`를 참고하세요.

**프런트엔드**

- **이미지 최적화 누락.** 모든 이미지는 `width`와 `height`를 선언해야 합니다(CLS). LCP 이미지에는 `fetchpriority="high"`, `<picture>`를 통한 최신 포맷(AVIF, WebP), 해상도 전환을 위한 `srcset`/`sizes`를 사용하세요. 화면 밖(below the fold) 이미지에는 `loading="lazy"`와 `decoding="async"`를 사용하세요. [패턴](references/optimization-patterns.md#missing-image-optimization-frontend).
- **불필요한 리렌더링.** 렌더 안에서 만든 객체나 함수는 매번 새 참조이며, 그것을 받는 모든 자식을 다시 렌더링시킵니다. 상수는 밖으로 끌어올리고(hoist), `React.memo`와 `useMemo`는 프로파일이 비싸다고 보여준 작업에만 쓰세요. 과용도 그 자체로 비용입니다. [패턴](references/optimization-patterns.md#unnecessary-re-renders-react).
- **큰 번들 크기.** 최신 번들러는 ESM의 named import를 알아서 tree-shake합니다. 진짜 이득은 라우트 단위 코드 스플리팅과 드물게 쓰는 무거운 기능을 `Suspense` 뒤에서 지연 로딩하는 데서 나옵니다. import 방식을 바꾸기 전에 프로파일링하세요. [패턴](references/optimization-patterns.md#large-bundle-size).

### 4단계: 검증 (유지 또는 되돌리기)

다시 측정하기 전까지 수정은 가설입니다. 이 단계가 그 수정이 살아남을지 결정합니다.

**기준선을 측정했던 방식 그대로 다시 측정하세요:** 같은 명령, 같은 조건, 같은 고정 예산(벽시계 시간, 샘플 수, 요청 수). 콜드 캐시에서 얻은 기준선과 웜 캐시에서 얻은 결과를 비교하면 변경 사항이 아니라 캐시를 측정하게 됩니다.

**한 번에 한 가지만 바꾸세요.** 최적화 세 개를 한꺼번에 반영하면 숫자 하나가 나오고, 어느 것이 효과를 냈는지 귀속할 수 없습니다. 함께 출시해야 한다면 각각을 먼저 따로 측정하세요.

**평균이 아니라 노이즈를 이기세요.** 측정을 반복하고, 변화량을 실행 간 분산과 비교하세요. ±5% 분산 안의 3% 개선은 개선이 아니라 다른 샘플일 뿐입니다.

그런 다음 엄격하게 결정하세요:

| 기준선 대비 결과 | 조치 |
|---|---|
| 기준치를 넘었고 테스트는 통과 | **유지.** 커밋 메시지에 전후 수치를 적으세요. |
| 노이즈 범위 안 (측정 가능한 변화 없음) | **되돌리기.** |
| 악화됨 | **되돌리기.** |
| 개선됐지만 테스트 하나가 실패 | **되돌리기.** 승리의 옷을 입은 회귀입니다. |

**"중립"은 유지가 아니라 되돌리기입니다.** 팀이 자주 건너뛰는 단계입니다. 변경은 이미 작성되어 있고, 버리면 아깝다는 느낌이 들어서 측정 없이 들어가고, 아무것도 사지 못한 복잡성이 코드베이스에 쌓입니다. 유지하기로 한 코드는 영원히 관리해야 합니다. 그 값을 하게 만드세요.

**정확성이 지표보다 우선합니다.** 테스트 스위트는 초록이어야 *하고* 수치도 움직여야 합니다. 제품이 필요로 하는 작업을 빼버려서 이기는 "최적화"(검증을 건너뛰기, 최신이어야 하는 것을 캐시하기, 필수적이었던 `await` 제거)는 승리가 아니라 회귀입니다.

#### 모든 시도를 기록하세요. 되돌린 것도 포함해서

되돌린 작업은 git 히스토리에 아무 흔적도 남기지 않습니다. 그래서 같은 실패한 아이디어가 다음 분기에 또 시도되는 것입니다. 버린 아이디어가 버려진 상태로 남도록 짧은 기록(ledger)을 유지하세요:

| 아이디어 | 기준선 → 결과 | 판정 | 이유 |
|---|---|---|---|
| 행 컴포넌트 메모이즈 | INP 240ms → 235ms | 되돌림 | 노이즈 범위 안 (±15ms). 행은 병목이 아니었음. |
| 리스트 가상화 | INP 240ms → 90ms | 유지 | 트레이스에서 긴 작업이 사라짐. |
| API 오리진에 preconnect | LCP 2.8s → 2.8s | 되돌림 | 이미 same-origin이었음. |

PR 설명이나 저장소의 `PERF.md`에 기록해도 좋습니다. 중요한 것은 다음 사람(또는 다음 에이전트)이 실험을 제안하기 전에 이를 읽고, 이미 실패한 실험을 다시 돌리지 않는 것입니다.

### 5단계: 회귀 방지

사용자가 실제로 체감하는 지표를 보호하세요. 모든 가용 수치를 보호하지 마세요. 수정을 정당화했던 것과 같은 LCP, INP, p95 지연 시간, 또는 다른 핵심 지표를 사용하세요.

사용자 대면 표면이라면 두 가지 상호 보완적인 계층을 사용하세요:

- **합성 CI 게이트:** 성능 예산으로 병합 전에 재현 가능한 회귀를 잡으세요. 노이즈가 있는 측정은 반복하거나 중앙값/추세를 비교해서, 일상적인 실행 간 분산 때문에 게이트가 불안정한 검사가 되지 않게 하세요.
- **현장(필드) 모니터링:** RUM 데이터에서 의미 있는 p75 변화에 대해 알림을 설정하세요. 원인을 찾을 때는 귀속 정보가 있는 `web-vitals` 데이터를 사용하고, CrUX의 롤링 윈도우는 즉시 알림이 아니라 확인용으로 취급하세요.

둘 중 하나라도 발동하면 1단계로 돌아가서, 다른 수정을 제안하기 전에 새 기준선을 세우세요.

**예산을 설정하고 강제하세요:**

```
JavaScript bundle: < 200KB gzipped (initial load)
CSS: < 50KB gzipped
Images: < 200KB per image (above the fold)
Fonts: < 100KB total
API response time: < 200ms (p95)
Time to Interactive: < 3.5s on 4G
Lighthouse Performance score: ≥ 90
```

**CI에서 강제하세요:**
```bash
# Bundle size check
npx bundlesize --config bundlesize.config.json

# Lighthouse CI
npx lhci autorun
```

## 참고

자세한 성능 체크리스트, 최적화 명령, 안티패턴 참고 자료는 `../../references/performance-checklist.md`를 참고하세요.


## 흔한 합리화

| 합리화 | 현실 |
|---|---|
| "나중에 최적화하죠" | 성능 부채는 복리로 불어납니다. 명백한 안티패턴은 지금 고치고, 미세 최적화는 미루세요. |
| "내 컴퓨터에서는 빠릅니다" | 당신의 컴퓨터는 사용자의 컴퓨터가 아닙니다. 대표적인 하드웨어와 네트워크에서 프로파일링하세요. |
| "이 최적화는 명백합니다" | 측정하지 않았다면 모르는 것입니다. 먼저 프로파일링하세요. |
| "사용자는 100ms를 눈치채지 못합니다" | 연구에 따르면 100ms 지연도 전환율에 영향을 줍니다. 사용자는 생각보다 많이 눈치챕니다. |
| "프레임워크가 성능을 알아서 처리합니다" | 프레임워크는 일부 문제를 막아주지만 N+1 쿼리나 과대한 번들은 고치지 못합니다. |
| "쿼리가 느리니 인덱스를 추가하자" | 먼저 플랜을 읽으세요. 인덱스가 이미 있는데 쓸 수 없는 상태일 수 있고, 모든 인덱스는 영원히 쓰기에 부담을 줍니다. |
| "그냥 캐시하자" | 이미 저렴한 호출을 캐시해도 얻는 것은 없고 오래된 데이터 버그만 생깁니다. 비용이 크고 쓰기보다 훨씬 많이 읽히는 것을 캐시하세요. |
| "커넥션이 모자라니 풀 크기를 키우자" | 데이터베이스가 감당할 수 있는 양보다 큰 풀은 큐를 더 보이지 않는 곳으로 옮길 뿐입니다. 커넥션을 붙잡고 있는 것이 무엇인지 찾으세요. |
| "크게 도움은 안 됐지만 해가 되지는 않잖아요" | 중립적인 변경은 되돌려야 합니다. 그것들은 영원히 유지보수 비용을 치르게 하고 얻은 것은 없습니다. |
| "이미 작성했으니 그냥 두죠" | 매몰 비용입니다. 측정은 변경을 작성하는 데 얼마나 걸렸는지 신경 쓰지 않습니다. |
| "개선이 명백하니 다시 측정할 필요 없습니다" | 다시 측정하는 것은 저렴하고 증명까지 해줍니다. 측정되지 않은 개선이 중립적인 복잡성이 들어오는 경로입니다. |

## 위험 신호

- 측정 데이터 없이 이루어진 최적화
- 데이터 조회에서 N+1 쿼리 패턴
- 전후 쿼리 플랜 없이 추가된 인덱스
- 응답이 의존하는 입력(테넌트, 로케일, 뷰어)을 빼먹은 캐시 키
- 오래된 데이터 허용 시간과 무효화 전략이 명시되지 않은 캐시
- 커넥션을 붙잡고 있는 원인을 찾지 않고 고갈에 대응해 올린 커넥션 풀 크기
- 페이지네이션이 없는 목록 엔드포인트
- 크기, 지연 로딩, 반응형 사이즈가 없는 이미지
- 검토 없이 커지는 번들 크기
- 프로덕션 성능 모니터링이 없는 경우
- 모든 곳에 있는 `React.memo`와 `useMemo` (과용은 과소 사용만큼 나쁩니다)
- 이를 정당화하는 재측정 없이 유지된 최적화
- 단일 변경의 귀속이 불가능하도록 여러 최적화를 한 번의 측정에 묶은 경우
- 테스트를 바꾸거나, 건너뛰거나, 삭제해야 했던 "승리"
- 누군가 첫 시도를 기록하지 않아서 같은 실패한 최적화를 두 번 이상 시도한 경우

## 검증

성능 관련 변경을 마친 뒤:

- [ ] 전후 측정값이 존재한다 (구체적인 수치)
- [ ] 결과는 기준선과 같은 방식으로 다시 측정되었다 (같은 명령, 같은 조건)
- [ ] 개선이 평균이 아니라 실행 간 분산을 넘어섰다
- [ ] 기준선을 넘지 못한 변경은 중립으로 두지 않고 되돌렸다
- [ ] 시도는 (유지되었든 되돌려졌든) 기록되어, 실패한 아이디어가 다시 실행되지 않는다
- [ ] 특정 병목이 식별되었고 해결되었다
- [ ] Core Web Vitals가 "좋음" 기준 안에 있다
- [ ] 번들 크기가 의미 있게 증가하지 않았다
- [ ] 새 데이터 조회 코드에 N+1 쿼리가 없다
- [ ] 새 인덱스는 전후 쿼리 플랜으로 정당화되었고, 쓰기 비용을 고려했다
- [ ] 새 캐시는 무엇을 키로 삼는지, 어떻게 오래되는지 명시한다
- [ ] 측정한 사용자 대면 지표에 회귀를 감지할 수 있는 합성 예산 또는 필드 모니터가 있다
- [ ] 기존 테스트가 여전히 통과한다 (최적화가 동작을 깨뜨리지 않았다)
