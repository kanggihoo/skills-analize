성능은 기능의 일부입니다. **이 인터페이스에서** 실제 병목이 무엇인지 찾아 고친 뒤 측정합니다. 느리지 않은 항목을 최적화하지 않습니다.

## 성능 문제 평가

현재 상태를 파악하고 문제를 찾습니다.

1. **현재 상태 측정**:
   - **Core Web Vitals**: LCP, INP, CLS 점수
   - **로딩 시간**: 인터랙션 가능 시점, 최초 콘텐츠 렌더링
   - **번들 크기**: JavaScript, CSS, 이미지 크기
   - **런타임 성능**: 프레임률, 메모리 사용량, CPU 사용량
   - **네트워크**: 요청 수, payload 크기, waterfall

2. **병목 찾기**:
   - 무엇이 느린가요?(최초 로드? 상호작용? 애니메이션?)
   - 원인은 무엇인가요?(큰 이미지? 비싼 JavaScript? 레이아웃 thrashing?)
   - 얼마나 심각한가요?(인지 가능한가? 불편한가? 작업을 막는가?)
   - 누가 영향을 받나요?(모든 사용자? 모바일만? 느린 연결만?)

전후를 측정합니다. 측정 없이 최적화하면 중요하지 않은 일에 노력을 쓰게 됩니다.

## 최적화 전략

체계적인 개선 계획을 만듭니다.

### 로딩 성능

**이미지 최적화**:
- 최신 형식(WebP, AVIF) 사용
- 적절한 크기(300px로 보이는 이미지에 3000px 파일을 불러오지 않음)
- fold 아래 이미지는 지연 로딩
- 반응형 이미지(`srcset`, `picture` 요소)
- 이미지 압축(보통 품질 80~85%는 육안으로 차이가 거의 없음)
- 빠른 전송을 위해 CDN 사용

```html
<img 
  src="hero.webp"
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
  alt="Hero image"
/>
```

**JavaScript 번들 축소**:
- 코드 분할(route 기반, component 기반)
- tree shaking(사용하지 않는 코드 제거)
- 불필요한 의존성 제거
- 중요하지 않은 코드는 지연 로드
- 큰 컴포넌트에 dynamic import 사용

```javascript
// 무거운 컴포넌트 지연 로드
const HeavyChart = lazy(() => import('./HeavyChart'));
```

**CSS 최적화**:
- 사용하지 않는 CSS 제거
- critical CSS는 인라인으로, 나머지는 비동기로 로드
- CSS 파일 최소화
- 서로 독립된 영역에는 CSS containment 사용

**글꼴 최적화**:
- `font-display: swap` 또는 `optional` 사용
- 필요한 글자만 글꼴 subset으로 구성
- 중요한 글꼴 preload
- 적합한 경우 시스템 글꼴 사용
- 불러오는 글꼴 굵기 제한

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* 대체 글꼴을 즉시 표시 */
  unicode-range: U+0020-007F; /* 기본 라틴 문자만 */
}
```

**로딩 전략 최적화**:
- 중요 리소스를 먼저 로드(중요하지 않은 것은 async/defer)
- 핵심 에셋 preload
- 다음에 방문할 가능성이 높은 페이지 prefetch
- 오프라인 / 캐싱용 service worker
- multiplexing을 위한 HTTP/2 또는 HTTP/3

### 렌더링 성능

**레이아웃 thrashing 방지**:
```javascript
// ❌ 잘못된 예: 읽기와 쓰기를 번갈아 실행(강제 reflow 발생)
elements.forEach(el => {
  const height = el.offsetHeight; // 읽기(레이아웃 강제)
  el.style.height = height * 2; // 쓰기
});

// ✅ 좋은 예: 읽기를 모아서 한 뒤 쓰기를 모아서 실행
const heights = elements.map(el => el.offsetHeight); // 모든 읽기
elements.forEach((el, i) => {
  el.style.height = heights[i] * 2; // 모든 쓰기
});
```

**렌더링 최적화**:
- 독립된 영역에 CSS `contain` 속성 사용
- DOM 깊이 최소화(평평할수록 빠름)
- DOM 크기 줄이기(요소 수 축소)
- 긴 목록에는 `content-visibility: auto` 사용
- 매우 긴 목록은 가상 스크롤링 사용(react-window, TanStack Virtual)

**Paint 및 composite 감소**:
- 안정적인 이동에는 `transform`과 `opacity`를 사용하되, 의미 있는 완성도를 높일 때는 blur, filter, mask, clip path, shadow, 색상 이동도 사용할 수 있습니다.
- 레이아웃을 움직이는 속성(`width`, `height`, `top`, `left`, margin)을 습관적으로 애니메이션하지 않습니다.
- 비용이 큰 작업이 명확할 때만 `will-change`를 씁니다.
- blur/filter/shadow 효과를 작고 분리된 영역에 제한합니다(영역이 작을수록 빠름).

### 애니메이션 성능

**GPU 가속**:
```css
/* ✅ GPU 가속(빠름) */
.animated {
  transform: translateX(100px);
  opacity: 0.5;
}

/* ❌ CPU 작업(느림) */
.animated {
  left: 100px;
  width: 300px;
}
```

**60fps로 부드럽게 실행**:
- 프레임당 16ms 목표(60fps)
- JS 애니메이션에 `requestAnimationFrame` 사용
- scroll handler는 debounce/throttle 적용
- 가능하면 CSS 애니메이션 사용
- 애니메이션 도중 오래 실행되는 JavaScript 피하기

**Intersection Observer**:
```javascript
// 요소가 viewport에 들어오는 시점을 효율적으로 감지
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 요소가 보임. 지연 로드 또는 애니메이션 가능
    }
  });
});
```

### React / Framework 최적화

**React 관련**:
- 비용이 큰 컴포넌트에 `memo()` 사용
- 비용이 큰 계산에 `useMemo()`와 `useCallback()` 사용
- 긴 목록 가상화
- route별 코드 분할
- render 중 인라인 함수 생성 피하기
- React DevTools Profiler 사용

**Framework 공통**:
- 재렌더 최소화
- 비용이 큰 작업 debounce
- 계산된 값 memoization
- route 및 component 지연 로드

### 네트워크 최적화

**요청 감소**:
- 작은 파일 결합
- 아이콘에 SVG sprite 사용
- 핵심 인라인 에셋은 작은 크기로 제한
- 사용하지 않는 서드파티 script 제거

**API 최적화**:
- 페이지네이션 사용(전부 불러오지 않음)
- 필요한 필드만 요청하도록 GraphQL 사용
- 응답 압축(gzip, brotli)
- HTTP caching header
- 정적 에셋에 CDN 사용

**느린 연결에 맞게 최적화**:
- 연결 상태에 따라 적응형 로딩(`navigator.connection`)
- 낙관적 UI 업데이트
- 요청 우선순위 지정
- 점진적 향상

## Core Web Vitals 최적화

### Largest Contentful Paint (LCP < 2.5s)
- hero 이미지 최적화
- 핵심 CSS 인라인 적용
- 주요 리소스 preload
- CDN 사용
- 서버 렌더링

### Interaction to Next Paint (INP < 200ms)
- 긴 작업을 쪼개기
- 중요하지 않은 JavaScript는 지연 실행
- 비용이 큰 계산에 web worker 사용
- JavaScript 실행 시간 줄이기

### Cumulative Layout Shift (CLS < 0.1)
- 이미지와 동영상 크기 지정
- 기존 콘텐츠 위에 콘텐츠 삽입하지 않기
- CSS `aspect-ratio` 속성 사용
- 광고 / embed 공간 확보
- 레이아웃 이동을 발생시키는 애니메이션 피하기

```css
/* 이미지 영역 확보 */
.image-container {
  aspect-ratio: 16 / 9;
}
```

## 성능 모니터링

**도구**:
- Chrome DevTools(Lighthouse, Performance 패널)
- WebPageTest
- Core Web Vitals(Chrome UX Report)
- 번들 분석기(webpack-bundle-analyzer)
- 성능 모니터링(Sentry, DataDog, New Relic)

**주요 지표**:
- LCP, INP, CLS(Core Web Vitals; 2024년 3월 INP가 FID를 대체)
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Total Blocking Time (TBT)
- 번들 크기
- 요청 수

실제 네트워크 조건에서 실제 기기로 측정합니다. 빠른 연결의 데스크톱 Chrome은 대표성이 없습니다.

**피할 것**:
- 측정 없이 최적화(성급한 최적화)
- 성능을 위해 접근성 희생
- 최적화 과정에서 기능 깨뜨림
- `will-change`를 어디서나 사용(새 레이어를 만들고 메모리 사용)
- fold 위 콘텐츠 지연 로딩
- 큰 문제를 무시한 채 작은 부분만 최적화(가장 큰 병목부터 해결)
- 모바일 성능을 잊기(대개 기기 성능과 연결 속도가 낮음)

## 개선 확인

최적화가 제대로 됐는지 테스트합니다.

- **전후 지표**: Lighthouse 점수 비교
- **실사용자 모니터링**: 실제 사용자에서 개선 여부 추적
- **다른 기기**: 최신 iPhone뿐 아니라 저가 Android에서도 테스트
- **느린 연결**: 3G로 제한해 경험 테스트
- **회귀 없음**: 기능이 계속 작동하는지 확인
- **사용자 체감**: 실제로 더 빠르게 느껴지나요?

사용자에게 보이는 수치가 개선되면 최종 점검을 위해 `$impeccable polish`로 넘깁니다.
