# 최적화 패턴

`performance-optimization` 스킬의 3단계에서 언급된 안티패턴에 대한 실제 적용 예시입니다. 스킬은 규칙과 찾아야 할 특징을 설명하고, 이 파일은 구체적인 구현 하나를 보여줍니다. 2단계에서 병목을 식별한 뒤 필요한 섹션만 여세요. 처음부터 끝까지 읽기 위한 문서가 아닙니다.

체크리스트, 측정 명령, TTFB 진단, 캐싱 읽기/쓰기 전략은 `../../../references/performance-checklist.md`에 있습니다.

## N+1 쿼리 (백엔드)

```typescript
// BAD: N+1 — one query per task for the owner
const tasks = await db.tasks.findMany();
for (const task of tasks) {
  task.owner = await db.users.findUnique({ where: { id: task.ownerId } });
}

// GOOD: Single query with join/include
const tasks = await db.tasks.findMany({
  include: { owner: true },
});
```

## 제한 없는 데이터 조회

```typescript
// BAD: Fetching all records
const allTasks = await db.tasks.findMany();

// GOOD: Paginated with limits
const tasks = await db.tasks.findMany({
  take: 20,
  skip: (page - 1) * 20,
  orderBy: { createdAt: 'desc' },
});
```

## 인덱스를 무시하는 쿼리

"인덱스를 추가하자"는 추측입니다. 쿼리 플랜이 측정입니다.

```sql
EXPLAIN ANALYZE
SELECT id, title FROM tasks
WHERE owner_id = 42 ORDER BY created_at DESC LIMIT 20;
```

출력에서 세 가지가 수정 방향을 결정합니다:

| 보이는 것 | 의미 |
|---|---|
| 인덱스가 있을 것으로 예상한 큰 테이블의 `Seq Scan` | 이 조건에 쓸 수 있는 인덱스가 없음 |
| 추정 `rows=`가 실제와 한 자릿수 이상 차이남 | 오래된 통계; 플래너가 잘못된 정보로 선택하고 있음 |
| 스캔 위의 `Sort` 노드 | 인덱스는 필터를 커버하지만 `ORDER BY`는 커버하지 않음 |

컬럼 하나가 아니라 **쿼리의 형태**에 맞춰 인덱스를 만드세요. 복합 인덱스에서는 동등 비교 컬럼이 먼저 오고, 그 다음에 범위 또는 정렬 컬럼이 옵니다:

```sql
CREATE INDEX idx_tasks_owner_created ON tasks (owner_id, created_at DESC);
```

**인덱스가 도움이 되지 않는 경우:**

| 상황 | 이유 |
|---|---|
| 선택도가 낮고 지배적인 값을 조회 (`status` 컬럼의 95%가 `active`이고 `active`로 필터링) | 순차 스캔이 실제로 더 저렴하며, 플래너는 인덱스를 무시합니다. 드문 값을 필터링하는 경우는 반대이며, 부분 인덱스가 잘 맞습니다 |
| 선행 와일드카드 (`LIKE '%term'`) | B-tree는 접두사 없이는 탐색할 수 없으며, trigram이나 전문 검색이 필요합니다 |
| 컬럼에 함수 적용 (`WHERE lower(email) = ?`) | 일반 컬럼 인덱스는 사용할 수 없으며, 대신 표현식을 인덱싱해야 합니다 |
| 쓰기가 많은 테이블 | 모든 인덱스는 모든 `INSERT`/`UPDATE`에 부담을 줍니다. 읽기 이득만이 아니라 쓰기 비용을 측정하세요 |

이후 `EXPLAIN ANALYZE`를 다시 실행하세요. 플랜을 바꾸지 못한 인덱스는 되돌려야 합니다(4단계). 그리고 공짜가 아닙니다. 모든 쓰기마다 여전히 비용이 듭니다.

## 커넥션 풀 고갈

신호는 뚜렷합니다: **모든** 엔드포인트가 동시에 느려지고, 시간은 실행이 아니라 커넥션을 기다리는 데 쓰이며, 데이터베이스에는 대부분 유휴 세션이 보입니다.

```typescript
// BAD: a pool per request or per module — under serverless this multiplies
// by instance count and exhausts the database's connection limit
// GOOD: one pool per process, sized against the database's ceiling
const pool = new Pool({
  max: 10,                        // instances × max must stay under max_connections
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000, // fail fast instead of queueing forever
});
```

**크다고 빨라지지 않습니다.** 데이터베이스가 동시에 실행할 수 있는 양보다 큰 풀은 큐를 앱에서 데이터베이스로 옮길 뿐이며, 그곳은 보기가 더 어렵습니다. 인스턴스 수가 무제한인 경우(서버리스, 오토스케일링)에는 `max`를 올리는 대신 커넥션을 다중화하는 프록시(pgbouncer, RDS Proxy)를 사용하는 것이 해결책입니다.

## 이미지 최적화 누락 (프론트엔드)

```html
<!-- BAD: No dimensions, no format optimization -->
<img src="/hero.jpg" />

<!-- GOOD: Hero / LCP image — art direction + resolution switching, high priority -->
<!--
  Two techniques combined:
  - Art direction (media): different crop/composition per breakpoint
  - Resolution switching (srcset + sizes): right file size per screen density
-->
<picture>
  <!-- Mobile: portrait crop (8:10) -->
  <source
    media="(max-width: 767px)"
    srcset="/hero-mobile-400.avif 400w, /hero-mobile-800.avif 800w"
    sizes="100vw"
    width="800"
    height="1000"
    type="image/avif"
  />
  <source
    media="(max-width: 767px)"
    srcset="/hero-mobile-400.webp 400w, /hero-mobile-800.webp 800w"
    sizes="100vw"
    width="800"
    height="1000"
    type="image/webp"
  />
  <!-- Desktop: landscape crop (2:1) -->
  <source
    srcset="/hero-800.avif 800w, /hero-1200.avif 1200w, /hero-1600.avif 1600w"
    sizes="(max-width: 1200px) 100vw, 1200px"
    width="1200"
    height="600"
    type="image/avif"
  />
  <source
    srcset="/hero-800.webp 800w, /hero-1200.webp 1200w, /hero-1600.webp 1600w"
    sizes="(max-width: 1200px) 100vw, 1200px"
    width="1200"
    height="600"
    type="image/webp"
  />
  <img
    src="/hero-desktop.jpg"
    width="1200"
    height="600"
    fetchpriority="high"
    alt="Hero image description"
  />
</picture>

<!-- GOOD: Below-the-fold image — lazy loaded + async decoding -->
<img
  src="/content.webp"
  width="800"
  height="400"
  loading="lazy"
  decoding="async"
  alt="Content image description"
/>
```

## 불필요한 리렌더링 (React)

```tsx
// BAD: Creates new object on every render, causing children to re-render
function TaskList() {
  return <TaskFilters options={{ sortBy: 'date', order: 'desc' }} />;
}

// GOOD: Stable reference
const DEFAULT_OPTIONS = { sortBy: 'date', order: 'desc' } as const;
function TaskList() {
  return <TaskFilters options={DEFAULT_OPTIONS} />;
}

// Use React.memo for expensive components
const TaskItem = React.memo(function TaskItem({ task }: Props) {
  return <div>{/* expensive render */}</div>;
});

// Use useMemo for expensive computations
function TaskStats({ tasks }: Props) {
  const stats = useMemo(() => calculateStats(tasks), [tasks]);
  return <div>{stats.completed} / {stats.total}</div>;
}
```

## 큰 번들 크기

```typescript
// Modern bundlers (Vite, webpack 5+) handle named imports with tree-shaking automatically,
// provided the dependency ships ESM and is marked `sideEffects: false` in package.json.
// Profile before changing import styles — the real gains come from splitting and lazy loading.

// GOOD: Dynamic import for heavy, rarely-used features
const ChartLibrary = lazy(() => import('./ChartLibrary'));

// GOOD: Route-level code splitting wrapped in Suspense
const SettingsPage = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <SettingsPage />
    </Suspense>
  );
}
```

## 캐싱 누락 (백엔드)

자주 읽히고 드물게 바뀌는, 생성 비용이 큰 것을 캐시하세요. 이미 빠른 쿼리를 캐시하면 네트워크 홉, 오래된 데이터 버그, 관리해야 할 축출 정책이 추가되는 대가만 얻습니다.

**계층을 신중하게 고르세요:**

| 계층 | 보이는 범위 | 사용 시점 | 비용 |
|---|---|---|---|
| 프로세스 내부 (`Map`, LRU) | 인스턴스 하나 | 작고 자주 쓰이며, 인스턴스별 오래된 데이터를 허용할 때 | 각 인스턴스가 독립적으로 어긋나며, 무효화가 하나의 인스턴스에만 닿음 |
| 공유 (Redis, Memcached) | 모든 인스턴스 | 인스턴스들이 값에 합의해야 하거나, 값 재계산 비용이 클 때 | 네트워크 홉, 그리고 운영/모니터링해야 할 또 다른 서비스 |
| CDN / 엣지 | URL별 모든 사용자 | 응답이 공개되어 있고 같은 키에 대해 동일할 때 | 무효화가 가장 어려움; 잘못된 응답을 빠르게 회수할 수 없다고 가정하세요 |

```typescript
// Cache frequently-read, rarely-changed data
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cachedConfig: AppConfig | null = null;
let cacheExpiry = 0;

async function getAppConfig(): Promise<AppConfig> {
  if (cachedConfig && Date.now() < cacheExpiry) {
    return cachedConfig;
  }
  cachedConfig = await db.config.findFirst();
  cacheExpiry = Date.now() + CACHE_TTL;
  return cachedConfig;
}

// HTTP caching headers for static assets
app.use('/static', express.static('public', {
  maxAge: '1y',           // Cache for 1 year
  immutable: true,        // Never revalidate (use content hashing in filenames)
}));

// Cache-Control for API responses
res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
```

**키 설계가 정확성을 결정합니다.** 응답을 바꾸는 모든 입력은 키에 들어가야 합니다: 테넌트, 로케일, 권한, 기능 플래그. 키가 조회하는 사용자를 빼먹으면 한 사용자의 데이터가 다른 사용자에게 제공되며, 그것이 성능 개선으로 출시되어 버립니다.

**무효화 전략은 세 가지가 아니라 하나만 고르세요:**

| 전략 | 트레이드오프 |
|---|---|
| TTL | 가장 단순합니다. TTL까지의 오래된 데이터를 감수하므로, 허용 가능한 시간 창을 명시적으로 밝히세요 |
| 이벤트 또는 태그 기반 | 쓰기 시점에 최신 상태가 유지되지만, 쓰는 쪽이 캐시 구조를 알아야 합니다 |
| 버전이 붙은 키 (`user:42:profile:v7`) | 절대 무효화하지 않고, 오래된 키를 더 이상 읽지 않을 뿐입니다. 축출될 때까지 메모리를 차지합니다 |

**스탬피드(stampede)를 방지하세요.** 뜨거운 키가 만료되면 동시에 들어온 모든 요청이 함께 미스가 나고, 원본 서버가 한꺼번에 전체 부하를 받습니다. 캐시가 장애를 막는 대신 장애 자체가 되는 방식입니다. 한 요청이 재계산하는 동안 오래된 값을 제공하거나(`stale-while-revalidate`), 동시 미스를 하나의 진행 중인 프로미스 뒤로 합쳐서 N개의 대기자가 한 번만 재계산하게 하세요.

**캐시하지 말아야 할 것:** 오래된 데이터가 정확성 버그가 되는 것(잔액, 권한, 결제 시점의 재고), 또는 키가 사용자를 식별하지 않는 상태에서의 사용자별 데이터. 요청 병합, 쓰기 전략, 네거티브 캐싱, 캐시 체크리스트는 `../../../references/performance-checklist.md#caching-strategies`를 참고하세요.
