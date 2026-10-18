---
name: ci-cd-and-automation
description: CI/CD 파이프라인 설정을 자동화합니다. 빌드 및 배포 파이프라인을 설정하거나 수정할 때 사용합니다. 품질 게이트를 자동화하거나, CI에서 테스트 러너를 구성하거나, 배포 전략을 수립해야 할 때 사용합니다.
---

# CI/CD와 자동화

## 개요

테스트, 린트, 타입 검사, 빌드를 통과하지 않은 변경이 프로덕션에 도달하지 않도록 품질 게이트를 자동화합니다. CI/CD는 다른 모든 스킬을 강제하는 메커니즘입니다. 사람과 에이전트가 놓치는 문제를 잡아내며, 모든 변경에 대해 일관되게 수행합니다.

**Shift Left:** 파이프라인에서 가능한 한 가장 이른 단계에서 문제를 잡으십시오. 린트에서 잡은 버그는 몇 분이 들지만, 프로덕션에서 잡은 같은 버그는 몇 시간이 듭니다. 검사를 상류로 옮기십시오. 테스트 전에 정적 분석을, 스테이징 전에 테스트를, 프로덕션 전에 스테이징을 수행하십시오.

**Faster is Safer:** 더 작은 배치와 더 잦은 릴리스는 위험을 높이지 않고 낮춥니다. 변경이 3개인 배포는 30개인 배포보다 디버그하기 쉽습니다. 잦은 릴리스는 릴리스 프로세스 자체에 대한 신뢰를 쌓습니다.

## 사용 시점

- 새 프로젝트의 CI 파이프라인을 설정할 때
- 자동화된 검사를 추가하거나 수정할 때
- 배포 파이프라인을 구성할 때
- 변경이 자동 검증을 트리거해야 할 때
- CI 실패를 디버깅할 때

## 품질 게이트 파이프라인

모든 변경은 병합 전에 다음 게이트를 거칩니다:

```
Pull Request Opened
    │
    ▼
┌─────────────────┐
│   LINT CHECK     │  eslint, prettier
│   ↓ pass         │
│   TYPE CHECK     │  tsc --noEmit
│   ↓ pass         │
│   UNIT TESTS     │  jest/vitest
│   ↓ pass         │
│   BUILD          │  npm run build
│   ↓ pass         │
│   INTEGRATION    │  API/DB tests
│   ↓ pass         │
│   E2E (optional) │  Playwright/Cypress
│   ↓ pass         │
│   SECURITY AUDIT │  npm audit
│   ↓ pass         │
│   BUNDLE SIZE    │  bundlesize check
└─────────────────┘
    │
    ▼
  Ready for review
```

**어떤 게이트도 건너뛸 수 없습니다.** 린트가 실패하면 린트를 수정하십시오. 규칙을 비활성화하지 마십시오. 테스트가 실패하면 코드를 수정하십시오. 테스트를 건너뛰지 마십시오.

## GitHub Actions 설정

### 기본 CI 파이프라인

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Test
        run: npm test -- --coverage

      - name: Build
        run: npm run build

      - name: Security audit
        run: npm audit --audit-level=high
```

### 데이터베이스 통합 테스트 포함

```yaml
  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: ci_user
          POSTGRES_PASSWORD: ${{ secrets.CI_DB_PASSWORD }}
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://ci_user:${{ secrets.CI_DB_PASSWORD }}@localhost:5432/testdb
      - name: Integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://ci_user:${{ secrets.CI_DB_PASSWORD }}@localhost:5432/testdb
```

> **참고:** CI 전용 테스트 데이터베이스라도 값을 하드코딩하지 말고 GitHub Secrets를 사용하여 자격 증명을 관리하십시오. 이는 좋은 습관을 기르고, 테스트 자격 증명이 다른 맥락에서 실수로 재사용되는 것을 방지합니다.

### E2E 테스트

```yaml
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      - name: Build
        run: npm run build
      - name: Run E2E tests
        run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## CI 실패를 에이전트에게 다시 전달하기

AI 에이전트와 함께하는 CI의 힘은 피드백 루프에 있습니다. CI가 실패하면:

```
CI fails
    │
    ▼
Copy the failure output
    │
    ▼
Feed it to the agent:
"The CI pipeline failed with this error:
[paste specific error]
Fix the issue and verify locally before pushing again."
    │
    ▼
Agent fixes → pushes → CI runs again
```

**주요 패턴:**

```
Lint failure → Agent runs `npm run lint --fix` and commits
Type error  → Agent reads the error location and fixes the type
Test failure → Agent follows debugging-and-error-recovery skill
Build error → Agent checks config and dependencies
```

## 배포 전략

### 프리뷰 배포

모든 PR은 수동 테스트를 위한 프리뷰 배포를 받습니다:

```yaml
# Deploy preview on PR (Vercel/Netlify/etc.)
deploy-preview:
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
  steps:
    - uses: actions/checkout@v4
    - name: Deploy preview
      run: npx vercel --token=${{ secrets.VERCEL_TOKEN }}
```

### 기능 플래그

기능 플래그는 배포와 릴리스를 분리합니다. 미완성이거나 위험한 기능을 플래그 뒤에 배포하면 다음이 가능합니다:

- **코드를 활성화하지 않고 배포.** 일찍 main에 병합하고, 준비되면 활성화하십시오.
- **재배포 없이 롤백.** 코드를 되돌리는 대신 플래그를 끄십시오.
- **새 기능을 카나리 배포.** 1%의 사용자에게 활성화한 뒤, 10%, 그다음 100%로 확대하십시오.
- **A/B 테스트 실행.** 기능이 있을 때와 없을 때의 동작을 비교하십시오.

```typescript
// Simple feature flag pattern
if (featureFlags.isEnabled('new-checkout-flow', { userId })) {
  return renderNewCheckout();
}
return renderLegacyCheckout();
```

**플래그 수명 주기:** 생성 → 테스트를 위해 활성화 → 카나리 → 전체 롤아웃 → 플래그와 사용되지 않는 코드 제거. 영구적으로 남는 플래그는 기술 부채가 됩니다. 플래그를 만들 때 정리 기한을 설정하십시오.

### 단계적 롤아웃

```
PR merged to main
    │
    ▼
  Staging deployment (auto)
    │ Manual verification
    ▼
  Production deployment (manual trigger or auto after staging)
    │
    ▼
  Monitor for errors (15-minute window)
    │
    ├── Errors detected → Rollback
    └── Clean → Done
```

### 롤백 계획

모든 배포는 되돌릴 수 있어야 합니다:

```yaml
# Manual rollback workflow
name: Rollback
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback deployment
        run: |
          # Deploy the specified previous version
          npx vercel rollback ${{ inputs.version }}
```

## 환경 관리

```
.env.example       → Committed (template for developers)
.env                → NOT committed (local development)
.env.test           → Committed (test environment, no real secrets)
CI secrets          → Stored in GitHub Secrets / vault
Production secrets  → Stored in deployment platform / vault
```

CI는 프로덕션 비밀 정보를 절대 가져서는 안 됩니다. CI 테스트에는 별도의 비밀 정보를 사용하십시오.

## CI 이외의 자동화

### Dependabot / Renovate

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
```

### Build Cop 역할

CI를 green 상태로 유지할 책임자를 지정하십시오. 빌드가 깨지면 Build Cop의 임무는 원인이 된 변경의 작성자가 아니라 자신이 수정하거나 되돌리는 것입니다. 이는 모두가 다른 누군가가 고칠 것이라고 가정하는 사이 깨진 빌드가 쌓이는 것을 방지합니다.

### PR 검사

- **필수 리뷰:** 병합 전 최소 1회 승인
- **필수 상태 검사:** 병합 전 CI 통과 필수
- **브랜치 보호:** main에 대한 force-push 금지
- **자동 병합:** 모든 검사를 통과하고 승인되면 자동으로 병합

## CI 최적화

파이프라인이 10분을 넘으면 영향이 큰 순서대로 다음 전략을 적용하십시오:

```
Slow CI pipeline?
├── Cache dependencies
│   └── Use actions/cache or setup-node cache option for node_modules
├── Run jobs in parallel
│   └── Split lint, typecheck, test, build into separate parallel jobs
├── Only run what changed
│   └── Use path filters to skip unrelated jobs (e.g., skip e2e for docs-only PRs)
├── Use matrix builds
│   └── Shard test suites across multiple runners
├── Optimize the test suite
│   └── Remove slow tests from the critical path, run them on a schedule instead
└── Use larger runners
    └── GitHub-hosted larger runners or self-hosted for CPU-heavy builds
```

**예시: 캐싱과 병렬화**
```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm test -- --coverage
```

## 흔한 합리화

| 합리화 | 현실 |
|---|---|
| "CI is too slow" | 건너뛰지 말고 파이프라인을 최적화하십시오(아래 CI 최적화 참조). 5분짜리 파이프라인이 몇 시간의 디버깅을 막아줍니다. |
| "This change is trivial, skip CI" | 사소한 변경도 빌드를 깨뜨립니다. 사소한 변경의 경우 어차피 CI는 빠릅니다. |
| "The test is flaky, just re-run" | 불안정한 테스트는 실제 버그를 가리고 모두의 시간을 낭비합니다. 불안정성을 고치십시오. |
| "We'll add CI later" | CI가 없는 프로젝트는 깨진 상태가 쌓입니다. 첫날부터 설정하십시오. |
| "Manual testing is enough" | 수동 테스트는 확장되지 않고 반복할 수 없습니다. 가능한 것은 자동화하십시오. |

## 위험 신호

- 프로젝트에 CI 파이프라인이 없음
- CI 실패를 무시하거나 묵살함
- 파이프라인을 통과시키기 위해 CI에서 테스트를 비활성화함
- 스테이징 검증 없이 프로덕션에 배포함
- 롤백 메커니즘이 없음
- 비밀 정보를 코드나 CI 설정 파일에 저장함(비밀 관리자 대신)
- 최적화 노력 없이 CI 시간이 길어짐

## 검증

CI를 설정하거나 수정한 후:

- [ ] 모든 품질 게이트가 존재함(린트, 타입, 테스트, 빌드, 감사)
- [ ] 파이프라인이 모든 PR과 main으로의 push에서 실행됨
- [ ] 실패가 병합을 차단함(브랜치 보호 설정됨)
- [ ] CI 결과가 개발 루프에 피드백됨
- [ ] 비밀 정보가 코드가 아닌 비밀 관리자에 저장됨
- [ ] 배포에 롤백 메커니즘이 있음
- [ ] 테스트 스위트의 파이프라인이 10분 이내에 실행됨
