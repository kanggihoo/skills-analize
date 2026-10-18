---
name: verification-loop
description: Claude Code 세션의 작업을 6단계로 검증합니다. 빌드, 타입 검사, 린트, 커버리지를 포함한 테스트, 보안 grep, diff 검토를 수행한 뒤 PASS/FAIL 검증 보고서를 만듭니다. 기능이나 리팩터링을 마친 후, PR 생성 전, 또는 품질 게이트를 반드시 통과해야 할 때 사용합니다.
license: MIT
metadata:
  origin: ECC
---

# Verification Loop 스킬

Claude Code 세션을 위한 종합 검증 시스템입니다.

## 사용 시점

다음 경우에 이 스킬을 호출하십시오.
- 기능 또는 주요 코드 변경을 마쳤을 때
- PR을 만들기 전
- 품질 게이트가 통과되는지 확인하고 싶을 때
- 리팩터링 후

## 검증 단계

### 1단계: 빌드 검증
```bash
# Check if project builds
npm run build 2>&1 | tail -20
# OR
pnpm build 2>&1 | tail -20
```

빌드가 실패하면 중단하고 수정한 뒤에 계속하십시오.

### 2단계: 타입 검사
```bash
set -o pipefail
# TypeScript projects
npx --no-install tsc --noEmit 2>&1 | head -30

# Python projects
pyright . 2>&1 | head -30
```

모든 타입 오류를 보고하십시오. 치명적인 오류는 계속하기 전에 수정하십시오.

### 3단계: 린트 검사
```bash
# JavaScript/TypeScript
npm run lint 2>&1 | head -30

# Python
ruff check . 2>&1 | head -30
```

### 4단계: 테스트 스위트
```bash
# Run tests with coverage
npm run test -- --coverage 2>&1 | tail -50

# Check coverage threshold
# Target: 80% minimum
```

다음을 보고하십시오.
- 전체 테스트: X
- 통과: X
- 실패: X
- 커버리지: X%

### 5단계: 보안 스캔
```bash
# Check for secrets
grep -rn "sk-" --include="*.ts" --include="*.js" . 2>/dev/null | head -10
grep -rn "api_key" --include="*.ts" --include="*.js" . 2>/dev/null | head -10

# Check for console.log
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10
```

### 6단계: Diff 검토
```bash
# Show what changed
git diff --stat
git diff HEAD~1 --name-only
```

변경된 각 파일을 다음 관점에서 검토하십시오.
- 의도하지 않은 변경
- 누락된 오류 처리
- 잠재적인 edge case

## 출력 형식

모든 단계를 실행한 후 검증 보고서를 작성하십시오.

```
VERIFICATION REPORT
==================

Build:     [PASS/FAIL]
Types:     [PASS/FAIL] (X errors)
Lint:      [PASS/FAIL] (X warnings)
Tests:     [PASS/FAIL] (X/Y passed, Z% coverage)
Security:  [PASS/FAIL] (X issues)
Diff:      [X files changed]

Overall:   [READY/NOT READY] for PR

Issues to Fix:
1. ...
2. ...
```

## 연속 모드

긴 세션에서는 15분마다, 또는 주요 변경 후마다 검증을 실행하십시오.

```markdown
Set a mental checkpoint:
- After completing each function
- After finishing a component
- Before moving to next task

Run: /verify
```

## Hook과의 통합

이 스킬은 PostToolUse hook을 보완하며, 더 깊은 검증을 제공합니다.
Hook은 문제를 즉시 잡아내고, 이 스킬은 포괄적인 검토를 제공합니다.
