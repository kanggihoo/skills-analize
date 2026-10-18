---
name: performance-optimization
description: 프론트엔드, 백엔드, 쿼리, 데이터베이스 전반의 애플리케이션 성능을 최적화합니다. 성능 요구사항이 존재할 때, 성능 회귀가 의심될 때, Core Web Vitals 또는 로딩 속도 개선이 필요할 때, N+1 쿼리 패턴을 수정해야 할 때, 또는 프로파일링을 통해 병목 지점이 드러났을 때 사용합니다.
---

# 성능 최적화 (Performance Optimization)

## 개요 (Overview)

**최적화하기 전에 먼저 측정하세요.** 측정 없는 성능 작업은 단순한 추측일 뿐입니다. 추측에 기반한 작업은 실질적인 개선 없이 복잡성만 늘리는 '조기 최적화(premature optimization)'로 이어집니다. 먼저 프로파일링하고, 실제 병목 지점을 찾고, 수정한 뒤, 다시 측정하세요. 측정을 통해 중요성이 입증된 것만 최적화하세요.

## 사용 시점 (When to Use)

- 사양(Spec)에 성능 요구사항(로딩 시간 예산, 응답 시간 SLA 등)이 명시되어 있을 때
- 사용자나 모니터링 시스템에서 느린 동작이 보고되었을 때
- Core Web Vitals 점수가 기준치에 미달할 때
- 코드 변경으로 인해 성능 회귀(regression)가 의심될 때
- 대용량 데이터나 높은 트래픽을 처리하는 기능을 구축할 때

**사용하지 않는 경우:** 문제에 대한 명확한 측정 증거가 없는데 최적화하지 마세요. 조기 최적화로 인해 증가하는 복잡성의 비용이 얻는 성능 이득보다 큽니다.

## Core Web Vitals 목표 기준

| 지표 | 좋음 (Good) | 개선 필요 (Needs Improvement) | 나쁨 (Poor) |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤ 2.5초 | ≤ 4.0초 | > 4.0초 |
| **INP** (Interaction to Next Paint) | ≤ 200ms | ≤ 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |

## 최적화 워크플로우 (The Optimization Workflow)

```
1. 측정 (MEASURE)  → 실제 데이터로 기준선(Baseline) 설정
2. 식별 (IDENTIFY) → 실제 병목 지점 파악 (추측 금지)
3. 수정 (FIX)      → 식별된 특정 병목 해결
4. 검증 (VERIFY)   → 다시 측정하여 유지(Keep) 또는 되돌리기(Revert) 결정
5. 보호 (GUARD)    → 회귀 방지를 위한 모니터링 또는 테스트 추가
```

### 1단계: 측정 (Measure)

상호 보완적인 두 가지 접근 방식을 모두 활용하세요:

- **합성 측정 (Synthetic - Lighthouse, DevTools Performance 탭):** 통제된 재현 가능한 환경. CI 회귀 감지 및 특정 문제 격리에 적합.
- **실사용자 측정 (RUM - web-vitals 라이브러리, CrUX):** 실제 사용자의 실제 환경 데이터. 수정 사항이 실제 사용자 경험을 개선했는지 검증하는 데 필수.

**프론트엔드 측정:**
```bash
# 합성 측정: Chrome DevTools의 Lighthouse 또는 Performance 탭 기록
# Chrome DevTools MCP → Performance trace

# RUM: 코드 내 Web Vitals 라이브러리 연동
import { onLCP, onINP, onCLS } from 'web-vitals';

onLCP(console.log);
onINP(console.log);
onCLS(console.log);
```

**백엔드 측정:**
```bash
# 응답 시간 로깅, APM, 쿼리 시간 로깅
console.time('db-query');
const result = await db.query(...);
console.timeEnd('db-query');
```

### 측정 시작 지점 찾기

증상에 따라 무엇을 먼저 측정할지 결정하세요:

```
무엇이 느린가요?
├── 첫 페이지 로딩
│   ├── 번들이 큰가? --> 번들 크기 측정, 코드 스플리팅 확인
│   ├── 서버 응답이 느린가? --> DevTools Network 탭에서 TTFB 측정
│   │   ├── DNS가 긴가? --> 알려진 오리진에 dns-prefetch / preconnect 추가
│   │   ├── TCP/TLS가 긴가? --> HTTP/2 활성화, 엣지 배포, Keep-Alive 확인
│   │   └── 대기 시간(서버 처리)이 긴가? --> 백엔드 프로파일링, 쿼리 및 캐싱 점검
│   └── 렌더링 차단 리소스가 있는가? --> CSS/JS 차단 여부 폭포수 차트 확인
├── 인터랙션이 둔탁함
│   ├── 클릭 시 UI가 멈추는가? --> 메인 스레드 프로파일링, 50ms 초과 롱 태스크 확인
│   ├── 폼 입력에 랙이 있는가? --> 리렌더링 및 제어 컴포넌트 오버헤드 확인
│   └── 애니메이션이 버벅이는가? --> 레이아웃 스래싱(thrashing), 강제 리플로우 확인
├── 페이지 이동 후 동작
│   ├── 데이터 로딩이 느린가? --> API 응답 시간 측정, 폭포수(waterfall) 호출 확인
│   └── 클라이언트 렌더링이 느린가? --> 컴포넌트 렌더 시간 프로파일링, N+1 fetch 확인
└── 백엔드 / API
    ├── 특정 엔드포인트만 느린가? --> DB 쿼리 프로파일링, 인덱스 확인
    ├── 모든 엔드포인트가 느린가? --> 커넥션 풀, 메모리, CPU 확인
    └── 간헐적으로 느린가? --> 락 경합(lock contention), GC 정지, 외부 의존성 확인
```

### 2단계: 병목 지점 식별 (Identify the Bottleneck)

카테고리별 흔한 병목 현상:

**프론트엔드:**

| 증상 | 유력한 원인 | 조사 방법 |
|---|---|---|
| LCP 지연 | 대용량 이미지, 렌더링 차단 리소스, 느린 서버 | 네트워크 폭포수, 이미지 크기 확인 |
| CLS 높음 | 크기 속성 없는 이미지, 늦게 로드되는 콘텐츠, 폰트 깜빡임 | 레이아웃 이동 기여 요소 확인 |
| INP 불량 | 메인 스레드의 과도한 JS 실행, 대규모 DOM 업데이트 | 성능 트레이스에서 롱 태스크 확인 |
| 초기 로딩 지연 | 거대한 번들, 과도한 네트워크 요청 수 | 번들 크기 분석, 코드 스플리팅 점검 |

**백엔드:**

| 증상 | 유력한 원인 | 조사 방법 |
|---|---|---|
| API 응답 지연 | N+1 쿼리, 인덱스 누락, 비효율적 쿼리 | 데이터베이스 쿼리 로그 확인 |
| 메모리 증가 | 참조 누수, 무제한 캐시, 대용량 페이로드 | 힙 스냅샷 분석 |
| CPU 급증 | 동기식 과부하 연산, 정규식 백트래킹 | CPU 프로파일링 |
| 지연 시간 증가 | 캐싱 누락, 중복 연산, 불필요한 네트워크 홉 | 스택 전반의 요청 트레이싱 |

### 3단계: 흔한 안티패턴 해결 (Fix Common Anti-Patterns)

#### N+1 쿼리 (백엔드)

```typescript
// 나쁨: N+1 쿼리 — 작업마다 소유자 조회를 위해 개별 쿼리 발생
const tasks = await db.tasks.findMany();
for (const task of tasks) {
  task.owner = await db.users.findUnique({ where: { id: task.ownerId } });
}

// 좋음: join/include를 통한 단일 쿼리 조회
const tasks = await db.tasks.findMany({
  include: { owner: true },
});
```

#### 무제한 데이터 조회

```typescript
// 나쁨: 모든 레코드를 무제한 조회
const allTasks = await db.tasks.findMany();

// 좋음: 페이지네이션 및 제한 적용
const tasks = await db.tasks.findMany({
  take: 20,
  skip: (page - 1) * 20,
  orderBy: { createdAt: 'desc' },
});
```

#### 인덱스를 타지 않는 쿼리

"인덱스를 추가하자"는 추측입니다. 실행 계획(Query Plan)이 실제 측정입니다:

```sql
EXPLAIN ANALYZE
SELECT id, title FROM tasks
WHERE owner_id = 42 ORDER BY created_at DESC LIMIT 20;
```

출력 결과에서 다음 3가지를 확인하여 해결책을 결정합니다:

| 확인된 내용 | 의미 |
|---|---|
| 대형 테이블에서 인덱스를 기대했으나 `Seq Scan` 발생 | 해당 조건절에 사용 가능한 인덱스가 없음 |
| 예상 `rows=` 수치가 실제와 한 자릿수 이상 차이 남 | 통계 정보가 낡음; 플래너가 잘못된 정보로 판단 중 |
| 스캔 노드 위에 `Sort` 노드가 존재함 | 인덱스가 필터 조건은 커버하지만 `ORDER BY`는 커버하지 못함 |

단일 컬럼이 아닌 **쿼리의 전체 형태**에 맞춰 인덱스를 설계하세요. 복합 인덱스에서는 동등 비교(=) 컬럼이 먼저 오고, 그 뒤에 범위 또는 정렬 컬럼이 와야 합니다:

```sql
CREATE INDEX idx_tasks_owner_created ON tasks (owner_id, created_at DESC);
```

**인덱스가 도움이 되지 않는 경우:**
- **낮은 카디널리티/선택도:** 전체의 95%가 `active`인 컬럼을 `active`로 조회할 때 (순차 스캔이 더 빠름)
- **앞부분 와일드카드:** `LIKE '%term'` (B-tree 인덱스 사용 불가; 전문 검색이나 trigram 필요)
- **컬럼 가공:** `WHERE lower(email) = ?` (표현식 기반 인덱스 필요)
- **쓰기 집약적 테이블:** 모든 인덱스는 쓰기 비용을 증가시킴

#### 커넥션 풀 고갈 (Connection Pool Exhaustion)

특징적인 징후: **모든** 엔드포인트가 한꺼번에 느려지고, 지연 시간의 대부분이 쿼리 실행이 아닌 '커넥션을 기다리는 시간'으로 소모되며, DB 세션은 대부분 유휴(idle) 상태입니다.

```typescript
// 좋음: 프로세스당 단일 풀 유지, DB 한도에 맞춰 크기 설정
const pool = new Pool({
  max: 10,                        // 인스턴스 수 × max 가 DB의 max_connections 미만이어야 함
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000, // 영원히 대기하지 않고 빠른 실패(fail fast)
});
```

**풀이 크다고 빠른 것이 아닙니다.** 데이터베이스가 동시 처리할 수 있는 양보다 큰 풀은 대기 큐를 데이터베이스 쪽으로 밀어낼 뿐입니다. 서버리스 환경처럼 인스턴스 수가 가변적이라면 풀 크기를 늘리는 것이 아니라 커넥션 프록시(pgbouncer, RDS Proxy)를 도입해야 합니다.

#### 이미지 최적화 (프론트엔드)

```html
<!-- 좋음: LCP/히어로 이미지 — 반응형 아트 디렉션 + 우선순위 힌트 -->
<picture>
  <source
    media="(max-width: 767px)"
    srcset="/hero-mobile-400.avif 400w, /hero-mobile-800.avif 800w"
    sizes="100vw"
    width="800"
    height="1000"
    type="image/avif"
  />
  <source
    srcset="/hero-800.avif 800w, /hero-1200.avif 1200w, /hero-1600.avif 1600w"
    sizes="(max-width: 1200px) 100vw, 1200px"
    width="1200"
    height="600"
    type="image/avif"
  />
  <img
    src="/hero-desktop.jpg"
    width="1200"
    height="600"
    fetchpriority="high"
    alt="히어로 이미지"
  />
</picture>

<!-- 좋음: 화면 하단(Below-the-fold) 이미지 — 지연 로딩 + 비동기 디코딩 -->
<img
  src="/content.webp"
  width="800"
  height="400"
  loading="lazy"
  decoding="async"
  alt="콘텐츠 이미지"
/>
```

#### 불필요한 리렌더링 방지 (React)

```tsx
// 좋음: 안정적인 참조 유지
const DEFAULT_OPTIONS = { sortBy: 'date', order: 'desc' } as const;
function TaskList() {
  return <TaskFilters options={DEFAULT_OPTIONS} />;
}

// 비용이 큰 컴포넌트에 React.memo 적용
const TaskItem = React.memo(function TaskItem({ task }: Props) {
  return <div>{/* 무거운 렌더링 로직 */}</div>;
});

// 비용이 큰 계산에 useMemo 적용
function TaskStats({ tasks }: Props) {
  const stats = useMemo(() => calculateStats(tasks), [tasks]);
  return <div>{stats.completed} / {stats.total}</div>;
}
```

#### 번들 크기 최적화 및 지연 로딩

```typescript
// 좋음: 무겁고 가끔 쓰이는 기능에 동적 임포트(lazy loading) 적용
const ChartLibrary = lazy(() => import('./ChartLibrary'));
const SettingsPage = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <SettingsPage />
    </Suspense>
  );
}
```

#### 올바른 캐싱 전략 (백엔드)

생성 비용이 비싸고 변경보다 조회가 압도적으로 많은 대상을 캐싱하세요. 이미 빠른 쿼리를 캐싱하는 것은 네트워크 홉과 데이터 불일치 버그만 늘릴 뿐입니다.

```typescript
// 정적 파일에 대한 강력한 HTTP 캐싱
app.use('/static', express.static('public', {
  maxAge: '1y',
  immutable: true, // 파일명에 해시가 포함된 경우
}));

// API 응답 Cache-Control 헤더
res.set('Cache-Control', 'public, max-age=300'); // 5분
```

**캐시 키 설계가 정확성을 결정합니다.** 응답을 바꾸는 모든 입력값(테넌트, 언어, 권한, 사용자별 상태)이 캐시 키에 포함되어야 합니다. 사용자 구분이 빠진 캐시 키는 다른 사용자의 데이터가 노출되는 치명적인 보안 사고를 유발합니다.

### 4단계: 재측정 및 검증 (유지 또는 롤백)

수정 사항은 다시 측정하기 전까지는 가설에 불과합니다.

**기준선 측정과 동일한 조건으로 재측정하세요:** 동일한 명령어, 동일한 환경, 동일한 고정 예산. 콜드 캐시 기준선과 웜 캐시 결과를 비교하는 것은 변경 사항이 아니라 캐시를 측정한 것입니다.

**한 번에 하나씩 변경하세요.** 3가지 최적화를 한꺼번에 적용하면 어떤 변경이 효과가 있었는지 알 수 없습니다.

**오차 범위(Noise)를 이겨내야 합니다.** 5% 변동폭 안에서 3% 개선된 것은 개선이 아니라 단순한 표본 차이입니다.

결정에 따른 조치:

| 기준선 대비 결과 | 조치 사항 |
|---|---|
| 임계값을 유의미하게 넘었고 테스트 통과 | **유지(Keep).** 커밋 메시지에 전/후 수치 명시. |
| 오차 범위 내 (측정 가능한 변화 없음) | **되돌리기(Revert).** |
| 더 나빠짐 | **되돌리기(Revert).** |
| 개선되었으나 테스트가 깨짐 | **되돌리기(Revert).** 승리의 탈을 쓴 회귀 버그임. |

**"중립(효과 없음)"은 유지가 아니라 되돌리기(Revert) 대상입니다.** 이미 작성했으니 아깝다는 이유로 방치하면 아무런 이득 없이 유지보수해야 할 복잡성만 코드베이스에 남게 됩니다.

#### 롤백된 시도를 포함한 모든 시도 기록하기

시도한 내용을 기록해 두어야 다음 분기에 누군가가 실패했던 동일한 아이디어를 다시 시도하는 낭비를 막을 수 있습니다 (`PERF.md` 또는 PR 설명에 기록):

| 최적화 아이디어 | 기준선 → 결과 | 최종 판정 | 이유 |
|---|---|---|---|
| 행 컴포넌트 메모이제이션 | INP 240ms → 235ms | 롤백 (reverted) | 오차 범위(±15ms) 내. 행 컴포넌트가 병목이 아니었음 |
| 목록 가상화(Virtualization) | INP 240ms → 90ms | 유지 (kept) | 트레이스에서 롱 태스크 완전히 제거됨 |
| API 오리진 사전 연결(preconnect) | LCP 2.8s → 2.8s | 롤백 (reverted) | 이미 동일 오리진이었음 |

### 5단계: 성능 회귀 방지 (Guard Against Regression)

사용자가 실제로 체감하는 주요 지표(LCP, INP, p95 지연 시간 등)를 보호하세요:

- **합성 CI 게이트:** 성능 예산(Performance Budget)을 통해 병합 전에 회귀를 차단
- **필드 모니터링 (RUM):** 실사용자 데이터의 p75 악화 시 알림 트리거

**성능 예산 예시:**
```
JS 번들: 초기 로딩 gzip 기준 < 200KB
CSS: gzip 기준 < 50KB
이미지: 화면 상단 이미지당 < 200KB
API 응답 시간: p95 기준 < 200ms
Lighthouse 성능 점수: ≥ 90점
```

## 흔한 합리화 및 반박 (Common Rationalizations)

| 합리화 (Rationalization) | 실제 현실 (Reality) |
|---|---|
| "최적화는 나중에 하겠다" | 성능 부채는 복리로 누적됩니다. 명백한 안티패턴은 지금 수정하고 미세 최적화를 미루세요. |
| "내 컴퓨터에서는 빠르다" | 당신의 컴퓨터는 사용자의 환경이 아닙니다. 실제 대표 환경에서 프로파일링하세요. |
| "쿼리가 느리니 무조건 인덱스를 추가하자" | 실행 계획을 먼저 확인하세요. 이미 인덱스가 있어도 사용 불가능할 수 있으며, 인덱스는 쓰기 비용을 영구적으로 증가시킵니다. |
| "그냥 캐싱해버리자" | 이미 빠른 쿼리를 캐싱하는 것은 이득 없이 데이터 불일치 버그만 만듭니다. 비용이 큰 대상을 선별적으로 캐싱하세요. |
| "별 도움은 안 됐지만 해가 되진 않으니 남겨두자" | 효과 없는 중립적 변경은 되돌려야 합니다. 아무런 대가 없이 영원히 유지보수 비용을 지불하게 됩니다. |

## 위험 신호 (Red Flags)

- 프로파일링 데이터 근거 없는 최적화 시도
- 데이터 조회 로직의 N+1 쿼리 패턴
- 전/후 실행 계획 검토 없는 무분별한 인덱스 추가
- 테넌트/사용자 식별자가 누락된 불완전한 캐시 키
- 무효화 전략과 만료 기간이 없는 캐시
- 페이지네이션 없는 목록 엔드포인트
- 크기 지정과 지연 로딩이 누락된 이미지
- 검토 없이 지속적으로 증가하는 번들 크기
- 재측정 데이터 없이 유지되는 최적화 코드
- 최적화를 위해 기존 테스트를 임의로 수정하거나 건너뛰는 행위

## 최종 검증 체크리스트 (Verification)

성능 관련 변경 적용 후:

- [ ] 구체적인 수치로 전/후 측정 데이터가 존재함
- [ ] 기준선과 동일한 조건 및 명령어로 재측정됨
- [ ] 개선폭이 단순 평균이 아닌 오차 범위를 유의미하게 초과함
- [ ] 기준선을 넘지 못한 변경은 유지되지 않고 정상 롤백됨
- [ ] 성공/실패 시도 내용이 기록됨
- [ ] Core Web Vitals가 "좋음" 범위 내에 있음
- [ ] 번들 크기가 비정상적으로 증가하지 않음
- [ ] 새로운 데이터 조회 코드에 N+1 쿼리가 없음
- [ ] 신규 인덱스는 쿼리 실행 계획으로 정당화되었으며 쓰기 비용이 고려됨
- [ ] 캐시는 캐시 키 구성과 만료 방식이 명확히 정의됨
- [ ] 기존 테스트가 모두 통과함 (기능 동작 보존)
