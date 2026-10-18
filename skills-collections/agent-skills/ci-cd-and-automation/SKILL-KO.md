---
name: ci-cd-and-automation
description: CI/CD 파이프라인 설정을 자동화합니다. 빌드 및 배포 파이프라인을 설정하거나 수정할 때 사용합니다. 품질 게이트 자동화, CI 내 테스트 러너 구성, 배포 전략 수립이 필요할 때 사용합니다.
---

# CI/CD 및 자동화 (CI/CD and Automation)

## 개요 (Overview)

테스트, 린트(Lint), 타입 검사, 빌드를 통과하지 않은 변경 사항이 프로덕션에 도달하지 않도록 품질 게이트(Quality Gate)를 자동화합니다. CI/CD는 다른 모든 스킬을 강제하는 메커니즘입니다. 인간과 에이전트가 놓친 것을 잡아내며, 단 하나의 예외 없이 모든 변경 사항마다 일관되게 이를 수행합니다.

**쉬프트 레프트(Shift Left):** 파이프라인의 가능한 가장 초기 단계에서 문제를 발견하세요. 린트 단계에서 잡힌 버그는 몇 분이면 해결되지만, 프로덕션에서 발견된 동일한 버그는 몇 시간이 소요됩니다. 검사를 상류(upstream)로 이동시키세요 — 테스트 전에 정적 분석, 스테이징 전에 테스트, 프로덕션 전에 스테이징을 거칩니다.

**빠를수록 안전하다 (Faster is Safer):** 배치를 작게 하고 더 자주 릴리스하는 것이 위험을 줄여줍니다. 3개의 변경 사항이 포함된 배포는 30개가 포함된 배포보다 디버깅하기 훨씬 쉽습니다. 잦은 릴리스는 릴리스 프로세스 자체에 대한 자신감을 높여줍니다.

## 사용 시점 (When to Use)

- 새 프로젝트의 CI 파이프라인을 설정할 때
- 자동화된 검사를 추가하거나 수정할 때
- 배포 파이프라인을 구성할 때
- 변경 사항이 자동화된 검증을 트리거해야 할 때
- CI 실패를 디버깅할 때

## 품질 게이트 파이프라인 (The Quality Gate Pipeline)

모든 변경 사항은 병합(merge)되기 전에 다음 게이트를 통과해야 합니다:

```
풀 리퀘스트(PR) 생성
    │
    ▼
┌─────────────────┐
│   린트 검사       │  eslint, prettier
│   ↓ 통과         │
│   타입 검사       │  tsc --noEmit
│   ↓ 통과         │
│   단위 테스트     │  jest/vitest
│   ↓ 통과         │
│   빌드          │  npm run build
│   ↓ 통과         │
│   통합 테스트     │  API/DB tests
│   ↓ 통과         │
│   E2E (선택)    │  Playwright/Cypress
│   ↓ 통과         │
│   보안 감사       │  npm audit
│   ↓ 통과         │
│   번들 크기 검사   │  bundlesize check
└─────────────────┘
    │
    ▼
  리뷰 준비 완료
```

**어떤 게이트도 건너뛸 수 없습니다.** 린트가 실패하면 린트를 수정하세요 — 린트 룰을 비활성화하지 마세요. 테스트가 실패하면 코드를 수정하세요 — 테스트를 skip하지 마세요.

## GitHub Actions 구성 (GitHub Actions Configuration)

### 기본 CI 파이프라인 (Basic CI Pipeline)

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

      - name: 의존성 설치
        run: npm ci

      - name: 린트 검사
        run: npm run lint

      - name: 타입 검사
        run: npx tsc --noEmit

      - name: 테스트 실행
        run: npm test -- --coverage

      - name: 빌드
        run: npm run build

      - name: 보안 감사
        run: npm audit --audit-level=high
```

### 데이터베이스 통합 테스트 포함 (With Database Integration Tests)

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
      - name: 마이그레이션 실행
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://ci_user:${{ secrets.CI_DB_PASSWORD }}@localhost:5432/testdb
      - name: 통합 테스트 실행
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://ci_user:${{ secrets.CI_DB_PASSWORD }}@localhost:5432/testdb
```

> **참고:** CI 전용 테스트 데이터베이스라 하더라도 자격 증명을 하드코딩하지 말고 GitHub Secrets를 사용하세요. 이는 좋은 습관을 형성하고 다른 환경에서 테스트 자격 증명이 실수로 재사용되는 것을 방지합니다.

### E2E 테스트 (E2E Tests)

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
      - name: Playwright 설치
        run: npx playwright install --with-deps chromium
      - name: 빌드
        run: npm run build
      - name: E2E 테스트 실행
        run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## CI 실패 내용을 에이전트에 피드백하기 (Feeding CI Failures Back to Agents)

AI 에이전트와 CI의 진정한 힘은 피드백 루프에 있습니다. CI가 실패했을 때:

```
CI 실패
    │
    ▼
실패 출력 복사
    │
    ▼
에이전트에게 전달:
"CI 파이프라인이 다음 오류로 인해 실패했습니다:
[구체적인 오류 내용 붙여넣기]
문제를 수정하고 로컬에서 검증한 후 다시 푸시해주세요."
    │
    ▼
에이전트가 수정 → 푸시 → CI 다시 실행
```

**핵심 패턴:**

```
린트 실패    → 에이전트가 `npm run lint --fix`를 실행하고 커밋
타입 오류    → 에이전트가 오류 발생 위치를 확인하고 타입 수정
테스트 실패  → 에이전트가 debugging-and-error-recovery 스킬을 따름
빌드 오류    → 에이전트가 설정 및 의존성을 확인
```

## 배포 전략 (Deployment Strategies)

### 프리뷰 배포 (Preview Deployments)

모든 PR은 수동 테스트를 위한 프리뷰 배포 환경을 가집니다:

```yaml
# PR 생성 시 프리뷰 배포 (Vercel/Netlify 등)
deploy-preview:
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
  steps:
    - uses: actions/checkout@v4
    - name: 프리뷰 배포
      run: npx vercel --token=${{ secrets.VERCEL_TOKEN }}
```

### 피처 플래그 (Feature Flags)

피처 플래그는 배포(Deployment)와 릴리스(Release)를 분리합니다. 미완성이거나 위험한 기능을 플래그 뒤에 숨겨 배포하면 다음과 같은 이점이 있습니다:

- **기능을 활성화하지 않고 코드를 배포 가능.** main 브랜치에 조기 병합하고 준비되었을 때 켭니다.
- **재배포 없이 롤백 가능.** 코드를 롤백하는 대신 플래그만 비활성화합니다.
- **카나리 릴리스(Canary).** 사용자의 1%에게 먼저 활성화한 후 10%, 100%로 점진적 확장합니다.
- **A/B 테스트 실행.** 기능 유무에 따른 동작 및 지표를 비교합니다.

```typescript
// 간단한 피처 플래그 패턴
if (featureFlags.isEnabled('new-checkout-flow', { userId })) {
  return renderNewCheckout();
}
return renderLegacyCheckout();
```

**플래그 라이프사이클:** 생성 → 테스트용 활성화 → 카나리 배포 → 전체 롤아웃 → 플래그 및 레거시 코드 제거. 영원히 남아있는 플래그는 기술 부채가 됩니다 — 생성할 때 정리 기한을 설정하세요.

### 단계적 롤아웃 (Staged Rollouts)

```
PR이 main에 병합됨
    │
    ▼
  스테이징 배포 (자동)
    │ 수동 검증
    ▼
  프로덕션 배포 (수동 트리거 또는 스테이징 후 자동)
    │
    ▼
  오류 모니터링 (15분 동안 관찰)
    │
    ├── 오류 감지 → 즉시 롤백
    └── 정상 작동 → 완료
```

### 롤백 계획 (Rollback Plan)

모든 배포는 되돌릴 수 있어야 합니다:

```yaml
# 수동 롤백 워크플로우
name: Rollback
on:
  workflow_dispatch:
    inputs:
      version:
        description: '롤백할 대상 버전'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: 배포 롤백
        run: |
          # 지정된 이전 버전으로 배포
          npx vercel rollback ${{ inputs.version }}
```

## 환경 관리 (Environment Management)

```
.env.example       → 커밋됨 (개발자를 위한 템플릿)
.env               → 커밋되지 않음 (로컬 개발용)
.env.test          → 커밋됨 (테스트 환경, 실제 시크릿 없음)
CI secrets         → GitHub Secrets / Vault에 저장
Production secrets → 배포 플랫폼 / Vault에 저장
```

CI 환경은 절대 프로덕션 시크릿을 가져서는 안 됩니다. CI 테스트용 시크릿을 별도로 사용하세요.

## CI를 넘어서는 자동화 (Automation Beyond CI)

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

### 빌드 캅 역할 (Build Cop Role)

CI를 항상 녹색(성공 상태)으로 유지할 담당자(Build Cop)를 지정하세요. 빌드가 깨졌을 때, 빌드를 고치거나 리버트하는 것은 변경을 일으킨 사람뿐만 아니라 빌드 캅의 책임입니다. 이를 통해 모든 사람이 다른 누군가가 고칠 것이라 생각하며 깨진 빌드가 방치되는 것을 방지합니다.

### PR 검사 규칙 (PR Checks)

- **필수 리뷰:** 병합 전 최소 1명 이상의 승인 필요
- **필수 상태 검사:** 병합 전 CI 성공 필수
- **브랜치 보호:** main 브랜치로의 force-push 금지
- **자동 병합 (Auto-merge):** 모든 검사를 통과하고 승인되면 자동으로 병합

## CI 최적화 (CI Optimization)

파이프라인 실행 시간이 10분을 초과하는 경우, 영향도가 높은 순서대로 다음 전략을 적용하세요:

```
CI 파이프라인이 느린가요?
├── 의존성 캐싱
│   └── node_modules에 대해 actions/cache 또는 setup-node 캐시 옵션 사용
├── 작업을 병렬로 실행
│   └── lint, typecheck, test, build를 별도의 병렬 작업으로 분리
├── 변경된 부분만 실행
│   └── 경로 필터(path filters)를 사용하여 관련 없는 작업 건너뛰기 (예: 문서 전용 PR의 e2e 건너뛰기)
├── 매트릭스 빌드 사용
│   └── 여러 러너에 테스트 스위트를 샤딩(shard)하여 분산 실행
├── 테스트 스위트 최적화
│   └── 핵심 경로에서 느린 테스트를 제거하고 정기 일정(cron)으로 실행
└── 더 큰 러너 사용
    └── CPU 집약적인 빌드의 경우 GitHub 호스팅 대형 러너 또는 셀프 호스팅 러너 사용
```

**예시: 캐싱 및 병렬화**
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

## 흔한 합리화 및 반박 (Common Rationalizations)

| 합리화 (Rationalization) | 실제 현실 (Reality) |
|---|---|
| "CI가 너무 느리다" | 파이프라인을 최적화하세요(위의 CI 최적화 참조). 건너뛰지 마세요. 5분짜리 파이프라인이 몇 시간의 디버깅을 예방합니다. |
| "사소한 변경이니 CI를 건너뛰자" | 사소한 변경이 빌드를 깨뜨립니다. 게다가 사소한 변경은 CI도 빠릅니다. |
| "테스트가 불안정(flaky)하니 그냥 재실행하자" | 불안정한 테스트는 실제 버그를 감추고 모두의 시간을 낭비합니다. 불안정성을 근본적으로 수정하세요. |
| "CI는 나중에 추가하겠다" | CI가 없는 프로젝트는 망가진 상태를 누적합니다. 첫날부터 설정하세요. |
| "수동 테스트로 충분하다" | 수동 테스트는 확장되지 않으며 반복 가능하지 않습니다. 가능한 모든 것을 자동화하세요. |

## 위험 신호 (Red Flags)

- 프로젝트에 CI 파이프라인이 없음
- CI 실패가 무시되거나 숨겨짐
- 파이프라인 통과를 위해 CI에서 테스트를 비활성화함
- 스테이징 검증 없이 프로덕션에 바로 배포
- 롤백 메커니즘이 없음
- 시크릿이 코드나 CI 설정 파일에 저장됨 (시크릿 매니저 미사용)
- CI 시간이 오래 걸리는데도 최적화 노력이 없음

## 최종 검증 체크리스트 (Verification)

CI를 설정하거나 수정한 후:

- [ ] 모든 품질 게이트가 포함됨 (린트, 타입, 테스트, 빌드, 보안 감사)
- [ ] 모든 PR 및 main 브랜치 푸시 시 파이프라인이 실행됨
- [ ] 실패 시 병합이 차단됨 (브랜치 보호 규칙 구성됨)
- [ ] CI 결과가 개발 피드백 루프로 연결됨
- [ ] 시크릿이 코드가 아닌 시크릿 매니저에 안전하게 저장됨
- [ ] 배포에 롤백 메커니즘이 마련됨
- [ ] 전체 테스트 스위트 파이프라인이 10분 이내에 완료됨
