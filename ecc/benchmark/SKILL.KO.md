---
name: benchmark
description: 브라우저 Core Web Vitals(LCP, INP, CLS, 페이지 용량), API 엔드포인트 지연 시간 백분위수, 빌드/테스트 피드백 시간에 걸쳐 성능 기준선을 측정하고 회귀를 감지하며, 전후 비교 결과를 git으로 추적되는 .ecc/benchmarks JSON에 저장합니다. 페이지 속도를 확인할 때, '느린 것 같아요' 보고에 대응할 때, 출시 성능 목표를 검증할 때, 또는 스택 대안을 비교할 때 사용하세요.
license: MIT
metadata:
  origin: ECC
---

# 벤치마크 — 성능 기준선 및 회귀 감지

## 사용 시점

- PR 전후로 성능 영향을 측정할 때
- 프로젝트의 성능 기준선을 설정할 때
- 사용자가 "느린 것 같다"고 보고할 때
- 출시 전에 성능 목표를 충족하는지 확인할 때
- 스택을 대안과 비교할 때

## 동작 방식

### 모드 1: 페이지 성능

browser MCP를 통해 실제 브라우저 지표를 측정합니다.

```
1. 각 대상 URL로 이동
2. Core Web Vitals 측정:
   - LCP (Largest Contentful Paint) — 목표 < 2.5초
   - CLS (Cumulative Layout Shift) — 목표 < 0.1
   - INP (Interaction to Next Paint) — 목표 < 200ms
   - FCP (First Contentful Paint) — 목표 < 1.8초
   - TTFB (Time to First Byte) — 목표 < 800ms
3. 리소스 크기 측정:
   - 전체 페이지 용량 (목표 < 1MB)
   - JS 번들 크기 (목표 < 200KB gzipped)
   - CSS 크기
   - 이미지 용량
   - 서드파티 스크립트 용량
4. 네트워크 요청 수 집계
5. 렌더링을 차단하는 리소스 확인
```

### 모드 2: API 성능

API 엔드포인트를 벤치마크합니다.

```
1. 각 엔드포인트에 100번 요청
2. 측정: p50, p95, p99 지연 시간
3. 추적: 응답 크기, 상태 코드
4. 부하 테스트: 동시 요청 10개
5. SLA 목표와 비교
```

### 모드 3: 빌드 성능

개발 피드백 루프를 측정합니다.

```
1. 콜드 빌드 시간
2. 핫 리로드 시간 (HMR)
3. 테스트 스위트 소요 시간
4. TypeScript 체크 시간
5. 린트 시간
6. Docker 빌드 시간
```

### 모드 4: 전후 비교

변경의 영향을 측정하기 위해 변경 전후로 실행합니다.

```
/benchmark baseline    # 현재 지표를 저장
# ... 변경 작업 ...
/benchmark compare     # 기준선과 비교
```

출력:
```
| Metric | Before | After | Delta | Verdict |
|--------|--------|-------|-------|---------|
| LCP | 1.2s | 1.4s | +200ms | WARNING: WARN |
| Bundle | 180KB | 175KB | -5KB | ✓ BETTER |
| Build | 12s | 14s | +2s | WARNING: WARN |
```

## 출력

기준선은 JSON으로 `.ecc/benchmarks/`에 저장됩니다. git으로 추적되므로 팀이 기준선을 공유합니다.

## 통합

- CI: 모든 PR에서 `/benchmark compare` 실행
- 배포 후 모니터링을 위해 `/canary-watch`와 함께 사용
- 출시 전 전체 체크리스트를 위해 `/browser-qa`와 함께 사용
