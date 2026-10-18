---
name: browser-qa
description: "브라우저 자동화 MCP(claude-in-chrome, Playwright 또는 Puppeteer)로 배포 후 UI 검증을 실행합니다. 콘솔 오류와 Core Web Vitals 스모크 검사, 폼 및 인증 흐름 상호작용 테스트, 세 가지 브레이크포인트에서의 스크린샷 시각 회귀 검사, axe-core 접근성 감사를 수행하고 SHIP / DO-NOT-SHIP 판정으로 마무리합니다. 스테이징이나 프리뷰에 배포된 기능을 테스트할 때, 프론트엔드 변경을 배포하기 전에, 프론트엔드 PR을 검토할 때, 반응형 레이아웃과 접근성을 확인할 때 사용합니다."
metadata:
  origin: ECC
---

# Browser QA — 자동화된 시각 테스트 및 상호작용

## 사용 시점

- 기능을 스테이징/프리뷰에 배포한 후
- 여러 페이지에 걸쳐 UI 동작을 검증해야 할 때
- 배포 전 — 레이아웃, 폼, 상호작용이 실제로 동작하는지 확인할 때
- 프론트엔드 코드를 건드린 PR을 검토할 때
- 접근성 감사와 반응형 테스트가 필요할 때

## 동작 방식

브라우저 자동화 MCP(claude-in-chrome, Playwright 또는 Puppeteer)를 사용하여, 실제 사용자처럼 라이브 페이지와 상호작용합니다.

### 무엇보다 안전 우선 — 영향 범위(기본은 읽기 전용으로 실행)

Browser QA는 실제 인증과 실제 사용자 흐름을 다루므로, 영향 범위를 명시적으로 생각해야 합니다.
기본값은 **읽기 전용**입니다. 프로덕션 URL에서는 **변경을 일으키는** 흐름(결제, 지불, 삭제,
대량 업데이트)을 절대 실행하지 마세요. 이를 실행하려면 명시적인 동의와 스테이징/프리뷰 URL이 모두 필요합니다.
테스트용 **시드 계정**을 사용하고, 실제 프로덕션 로그인은 절대 사용하지 마세요. 스크린샷을 저장하기 전에는
자격 증명, 토큰, 개인정보(PII)를 **가리세요(redact)**.

### 1단계: 스모크 테스트
```
1. Navigate to target URL
2. Check for console errors (filter noise: analytics, third-party)
3. Verify no 4xx/5xx in network requests
4. Screenshot above-the-fold on desktop + mobile viewport
5. Check Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
   (INP replaced FID in March 2024; thresholds per web.dev)
```

### 2단계: 상호작용 테스트
```
1. Click every nav link — verify no dead links
2. Submit forms with valid data — verify success state
3. Submit forms with invalid data — verify error state
4. Test auth flow: login → protected page → logout (test creds only, never prod)
5. Test critical user journeys (checkout, onboarding, search)
   — read-only by default; only exercise mutating journeys against staging
     with explicit opt-in (see "Safety first" above)
```

### 3단계: 시각 회귀
```
1. Screenshot key pages at 3 breakpoints (375px, 768px, 1440px)
2. Compare against committed baseline screenshots
   — no baseline ⇒ report INCONCLUSIVE, never a silent PASS
3. Flag layout shifts > 5px, missing elements, overflow
4. Check dark mode if applicable
```

### 4단계: 접근성
```
1. Run axe-core or equivalent on each page
2. Flag WCAG 2.2 AA violations (contrast, labels, focus order)
3. Verify keyboard navigation works end-to-end
4. Check screen reader landmarks
```

> 참고: axe-core는 WCAG의 약 30~40%만 자동으로 다룹니다. 깨끗한 결과는 **필요하지만 충분하지는 않습니다**.
> 키보드 탐색, 포커스 순서, 스크린 리더 점검은 여전히 수동 확인이 필요합니다. 자동 검사만으로 "접근 가능하다"고 보고하지 마세요.

## 출력 형식

```markdown
## QA Report — [URL] — [timestamp]

### Smoke Test
- Console errors: 0 critical, 2 warnings (analytics noise)
- Network: all 200/304, no failures
- Core Web Vitals: LCP 1.2s ✓, CLS 0.02 ✓, INP 89ms ✓

### Interactions
- [✓] Nav links: 12/12 working
- [✗] Contact form: missing error state for invalid email
- [✓] Auth flow: login/logout working

### Visual
- [✗] Hero section overflows on 375px viewport
- [✓] Dark mode: all pages consistent

### Accessibility
- 2 AA violations: missing alt text on hero image, low contrast on footer links

### Verdict: SHIP WITH FIXES (2 issues, 0 blockers)
# verdict ∈ SHIP / SHIP WITH FIXES / DO NOT SHIP; use INCONCLUSIVE if no visual baseline
```

## 연동

모든 브라우저 MCP와 함께 동작합니다.
- `mChild__claude-in-chrome__*` 도구 (권장 — 실제 Chrome을 사용합니다)
- `mcp__browserbase__*`를 통한 Playwright
- 직접 작성한 Puppeteer 스크립트

배포 후 모니터링에는 `/canary-watch`와 함께 사용하세요.
