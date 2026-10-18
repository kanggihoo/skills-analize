---
name: constraint-driven-development
description: 프로젝트의 품질 기준을 문서화된 계약으로 확립하고, 에이전트가 조용히 기준을 낮추는 것을 막는다. 사용자에게 어떤 차원이 중요한지 묻고, 특정 숫자가 없을 때는 합리적인 기본 임계값을 제공하며, 모든 내용을 CONSTRAINTS.md에 기록하고, diff에서 약해진 기준을 감시한다. 예를 들어 새로운 @ts-ignore나 eslint-disable 억제, 건너뛰거나 삭제된 테스트, 제거된 assert, 구현되지 않은 스텁, 낮아진 임계값 등이다. 품질 기준이 문서화되어 있지 않을 때, 사용자가 "set up constraints" 또는 "define our standards"라고 말할 때, 접근성, 웹 성능, 커버리지 같은 차원을 강제 제약으로 설정하려 할 때, 에이전트가 초록불을 만들기 위해 검사를 침묵시키거나 테스트를 건너뛸 때, 커버리지나 성능 임계값이 필요한데 어떤 숫자를 골라야 할지 모를 때, 또는 에이전트가 아무도 읽지 않을 만큼 많은 코드를 작성할 때 사용한다.
---

# 제약 기반 개발

## 개요

이 팩의 다른 스킬들은 좋은 결과가 어떤 모습인지 설명한다. `code-review-and-quality`는 다섯 가지 축을 제공한다. `test-driven-development`는 사이클을 제공한다. `security-and-hardening`은 위협 목록을 제공한다. 이 모든 것은 에이전트가 읽고 따를 수도 있고 따르지 않을 수도 있는 산문으로 존재하며, 세션이 끝나면 아무것도 남지 않는다.

이 스킬은 다른 것을 만든다. **이 프로젝트의** 기준을 숫자와 함께 적은 기록으로, 대화가 끝난 뒤에도 남고 기계적으로 검사할 수 있는 것이다.

이유가 중요하다. 여러분이 코드를 작성했을 때는 코드를 읽는 것만으로 좋은 코드인지 알 수 있었다. 에이전트는 오후 한 번에 여러분이 그 주에 읽을 수 있는 것보다 더 많이 작성하므로, 판단은 여러분의 머릿속에서 루프 주변에서 실행되는 검사로 옮겨 가야 한다. 그 검사들은 존재해야 하고, 여러분이 실제로 고른 숫자를 가져야 하며, 에이전트가 자기 출력을 스스로 고칠 수 있을 만큼 작업에 가까운 시점에 실행되어야 한다.

스펙 기반 개발은 무엇을 만들지 말하고, 테스트 기반 개발은 그것이 동작함을 증명한다. 제약 기반 개발은 누군가 pull request에서 논쟁하기 전에, "출하하기에 충분히 좋은" 것이 무엇인지 정의한다.

## 사용 시점

다음과 같은 경우 이 스킬을 적용한다.

- 품질 기준이 문서화되어 있지 않은 상태에서 프로젝트나 주요 기능을 시작할 때
- 사용자가 "set up constraints", "add quality gates", "define our standards", 또는 "stop the agent shipping junk"라고 요청할 때
- 아무도 한 줄씩 읽지 않는 양의 결과물을 에이전트가 만들고 있을 때
- CI에 검사가 있지만 어떤 것이 병합을 막고 어떤 것이 장식인지 아무도 말할 수 없을 때
- 커버리지, 성능, 또는 접근성 숫자가 PR마다 논쟁되고 한 번 결정되지 않을 때
- `/build auto`나 다른 자율 루프를 실행하려 하는데, 에이전트가 main 브랜치와의 사이에 둔 유일한 장벽이 에이전트가 함께 작성한 테스트 스위트일 때

**사용하지 않는 경우:**

- 프로젝트에 이미 `CONSTRAINTS.md`가 있고 사용자가 이를 바꾸지 않을 때. 대신 읽고 따른다.
- 일회성 스크립트, 스파이크, 버릴 프로토타입
- 사용자가 지금 코드 리뷰(`code-review-and-quality`)를 원하거나 CI 파이프라인(`ci-cd-and-automation`)을 만들고 싶을 때
- 기대 수명이 2주인 제품 적합성 이전 단계 코드. 아래의 floor는 여전히 가치가 있지만 나머지는 그렇지 않다.

## 제약 불러오기

인터뷰에는 살아 있는 사용자가 필요하다. **비대화형 환경(CI, `/loop`, 자율 실행)에서는 인터뷰를 실행하지 않는다.** 제약이 없는데 그런 환경에 있다면, 아래의 Floor를 적용하고 그렇게 했다고 기록하며, 나머지는 사람에게 넘긴다.

## 절차

### Step 1: 묻기 전에 감지하기

읽어서 알 수 있는 것은 절대 묻지 않는다. 첫 질문 전에 다음을 수집한다.

| 항목 | 확인 위치 |
|------|---------------|
| 언어와 스택 | `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml` |
| 테스트 러너 | dev dependencies, `test` 스크립트, 기존 테스트 파일 |
| 기존 린터 | `eslint.config.*`, `biome.json`, `.ruff.toml` |
| 현재 커버리지 | `coverage/` 출력, 또는 스위트를 한 번 실행 |
| CI | `.github/workflows/`, `.gitlab-ci.yml` |
| 에이전트 하네스 | `.claude/`, `.codex/`, `AGENTS.md` |

발견한 내용을 두 줄로 보고한 뒤, 남은 것만 묻는다.

### Step 2: 각각 기본값이 있는 네 가지 질문

`interview-me`의 한 번에 한 질문 원칙을 따르되, 한 가지를 바꾼다. 여기서 모든 질문에는 기본값이 있으므로, "모르겠다"도 작동하는 설정을 만들어 내는 완전한 답변이다.

```
Q1: floor를 넘어서 어떤 것을 강제하고 싶은가?
    (a) 새 코드의 테스트 커버리지
    (b) 보안 스캔
    (c) 성능 예산
    (d) 접근성
    (e) 아키텍처 경계
추정: (a)와 (b) — 이미 테스트 러너가 있고 사용자 입력을 다루고 있으니까.
확신이 없을 때의 기본값: (a)와 (b).
각 선택의 비용을 말한다. (c)와 (d)는 실행 중인 URL이 필요하고, (e)는 규칙 파일을 작성해야 한다.
```

```
Q2: 에이전트가 작업 중에 검사가 실패하면 차단해야 하는가, 경고만 해야 하는가?
추정: 차단. 에이전트를 무인으로 실행하고 있고, 아무도 읽지 않는 경고는 경고가 아니니까.
확신이 없을 때의 기본값: floor는 차단하고, 나머지는 처음 2주 동안 경고만 한다.
```

```
Q3: 염두에 둔 목표 숫자가 있는가, 아니면 지금 상태를 측정해서 그 선을 지키면 되는가?
추정: 측정. 대부분의 팀은 숫자가 없고, 임의로 만든 숫자는 무시되니까.
확신이 없을 때의 기본값: 측정하고 유지한다. 아래의 "Ratchets"를 본다.
```

```
Q4: 에이전트가 작업을 돌려주기 전에 감수할 수 있는 가장 느린 검사는 무엇인가?
추정: 약 90초. 더 길면 사람들이 실행하지 않게 되니까.
확신이 없을 때의 기본값: 작업 종료 시 90초, CI에서는 제한 없음.
```

네 개에서 멈춘다. 열두 개의 질문으로 이루어진 접수 절차는 아무도 이해하지 못하는 설정과 시작한 것을 후회하는 사용자를 만든다.

### Step 3: CONSTRAINTS.md 작성하기

저장소 루트에 하나의 파일을 둔다. 어떤 하네스의 어떤 에이전트든 읽을 수 있고, 이 파일의 변경은 리뷰에서 적절한 곳에 나타난다.

```markdown
# Constraints

Last reviewed: 2026-08-08 by @addy

## Floor (always enforced, no setup required)

- No new suppression comments: `@ts-ignore`, `eslint-disable`, `# noqa`, `# type: ignore`
- No unimplemented stubs: `throw new Error("Not implemented")`, empty `catch {}`
- No skipped or deleted tests without a reason in the commit message
- No secrets in source
- This file does not get weakened to make a change pass

## Enforced with numbers

| Dimension | Rule | Checked by | Runs at |
|-----------|------|-----------|---------|
| Types | Zero type errors | `tsc --noEmit` | every edit |
| Lint | Zero errors from our config | `biome check` | every edit |
| Secrets | No secrets in source | `gitleaks detect --redact` | every edit |
| Coverage | Changed lines ≥ 80% covered | `vitest run --coverage` + git diff | task end, CI |
| Security: code | No high findings | `semgrep scan --config p/default` | CI |
| Security: deps | Nothing at high or above | `osv-scanner scan source -r .` | CI |
| Accessibility | Zero critical or serious | `axe $PREVIEW_URL --tags wcag2a,wcag2aa,wcag21aa` | preview deploy |
| Performance | LCP ≤ 2500ms, CLS ≤ 0.1 | `lighthouse $PREVIEW_URL --output=json` | preview deploy |

Every row names the command that produces the verdict. A dimension with a
number and no command in this column is an aspiration, not a constraint.

## Measured, not yet enforced

| Metric | Today | Direction |
|--------|-------|-----------|
| Project coverage | 62.4% | must not fall |
| Bundle size (main) | 184 kB | must not grow |

## Exceptions

| ID | Rule | Path | Reason | Owner | Expires |
|----|------|------|--------|-------|---------|
| W1 | `no-explicit-any` | `src/legacy/**` | Rewrite tracked in ENG-441 | @addy | 2026-11-01 |
```

그런 다음 `AGENTS.md`와 `CLAUDE.md`에 한 줄을 추가한다: `Read CONSTRAINTS.md before writing code. Do not weaken it to make a change pass.`

### Step 4: 각 차원에 필요한 것 설치하기

차원을 고른다는 것은 무언가를 설치한다는 뜻이다. 사용자에게 숫자만 주고 메커니즘을 남겨 두지 않으며, 이미 de facto 검사기가 있는데 직접 검사기를 만들지 않는다. 이 도구들을 나열한 이유는 그 규칙 형식과 임계값을 생태계의 나머지가 따르기 때문이며, 팀의 기존 설정이 계속 작동하게 하기 위해서다.

| 차원 | 도구 | 설치 | 실행 | 게이트 기준 |
|-----------|------|---------|-----|---------|
| Types (TS) | tsc | 이미 있음 | `tsc --noEmit` | 모든 오류 |
| Types (Python) | mypy | `pip install mypy` | `mypy .` | 모든 오류 |
| Lint | 기존 설정 | 이미 있음 | `eslint .` / `biome check` / `ruff check` | 모든 오류 |
| Coverage (JS) | 테스트 러너 | 이미 있음 | `vitest run --coverage` (또는 `jest --coverage`) | 변경된 줄의 커버리지 |
| Coverage (Python) | pytest-cov | `pip install pytest-cov` | `pytest --cov --cov-report=lcov` | 동일 |
| Security: code | Semgrep | `pipx install semgrep` | `semgrep scan --config p/default --config p/owasp-top-ten` | 모든 high 발견 |
| Security: secrets | gitleaks | `brew install gitleaks` | `gitleaks detect --redact --no-banner` | 모든 발견 |
| Security: dependencies | osv-scanner | `brew install osv-scanner` | `osv-scanner scan source -r .` | high 이상 |
| Performance: page | Lighthouse | `npm i -D lighthouse` | `lighthouse $URL --output=json --quiet` | LCP, CLS, 성능 점수 |
| Performance: bundle | size-limit | `npm i -D size-limit` | `size-limit --json` | 항목별 바이트 예산 |
| Accessibility | axe-core | `npm i -D @axe-core/cli` | `axe $URL --tags wcag2a,wcag2aa,wcag21aa` | critical 또는 serious 0개 |
| Architecture | dependency-cruiser | `npm i -D dependency-cruiser` | `depcruise --validate src` | 모든 위반 |
| Assertion quality | Stryker | `npm i -D @stryker-mutator/core` | `stryker run --mutate <changed files>` | mutation score |

건너뛰면 문제가 되는 다섯 가지:

1. **gitleaks의 `--redact`는 선택 사항이 아니다.** 없으면 일치한 비밀 값이 에이전트의 대화 기록에 남고, 그것이 유출된 키가 로그, 요약, 또는 커밋 메시지에 들어가는 경로다. 규칙과 위치만 보고하고, 값은 절대 보고하지 않는다.
2. **Lighthouse와 axe에는 URL이 필요하다.** 실행 중인 앱에 대해서만 동작하므로, 미리보기 배포나 먼저 시작한 로컬 서버를 대상으로 하는 런타임 단계에 두어야 한다. 프로젝트에 접근할 URL이 없다면(CLI, 라이브러리, 데스크톱 앱), 그렇다고 말하고 작동하지 않을 검사를 만들어 내지 말고 그 차원을 뺀다.
3. **비싼 검사는 diff로 범위를 좁힌다.** 저장소 전체에 대해 `stryker run --mutate`를 실행하면 몇 시간이 걸려 결국 꺼지게 된다. 변경이 건드린 파일에 대해서는 1분 이내에 끝난다. Semgrep도 경로 목록을 받으므로 마찬가지다.
4. **커버리지에는 두 번째 테스트 실행이 필요 없다.** 스위트가 이미 쓰는 lcov를 읽고 `git diff`와 교차시킨다. 숫자를 얻으려고 스위트를 두 번 실행하는 것은 사람들이 이 방식을 싫어하게 만드는 가장 빠른 길이다.
5. **Semgrep의 레지스트리 규칙은 실행하는 데 무료다. 재배포 전에 라이선스를 확인한다.** 법무팀이 신경 쓴다면 `opengrep`이 같은 규칙 형식과 JSON 출력을 가진 드롭인 포크다.

각 도구를 프로젝트 자체 스크립트에 추가하면 에이전트 없이도 재현할 수 있다.

```json
{
  "scripts": {
    "check:fast": "tsc --noEmit && eslint . && gitleaks detect --redact --no-banner",
    "check:task": "npm run check:fast && vitest run --coverage",
    "check:full": "npm run check:task && semgrep scan --config p/default && osv-scanner scan source -r ."
  }
}
```

이 매핑이 도구 자체보다 중요하다. `check:fast`는 편집 후에 실행되고, `check:task`는 에이전트가 끝났다고 판단할 때, `check:full`은 CI에서 실행된다.

명령은 이제 두 곳에 있다. `CONSTRAINTS.md`의 `Checked by` 열과 이 스크립트들이다. `CONSTRAINTS.md`가 정식 출처다. 각 명령과 함께 이유를 담고 있으며 리뷰에 나타난다. 스크립트는 편의를 위한 래퍼이며, 이 파일을 반영해야 하는 것이지 두 번째 진실의 원천이 아니다. 둘이 어긋나면 파일이 우선한다.

### Step 5: 수명 주기에 연결하기

가장 큰 실수는 모든 것을 모든 곳에서 실행하는 것이다. 에이전트를 멈추게 하는 검사는 꺼지고, 사람들이 꺼 버린 게이트는 아무것도 없는 것보다 나쁘다. 기준이 여전히 존재하는 것처럼 보이기 때문이다.

| 단계 | 명령 | 실행 항목 | 예산 |
|-------|---------|-----------|--------|
| BUILD | `/build` | 타입, 린트, 비밀 값, floor | 5초 미만, 변경된 파일만 |
| VERIFY | `/test` | 관련 테스트, 변경된 줄의 커버리지 | 90초 미만 |
| REVIEW | `/review` | 전체, 그리고 아래의 가드 | 몇 분 |
| SHIP | `/ship` | 방향 검사, 회귀 없음 | CI |

이를 견딜 만하게 만드는 두 가지 규칙:

1. **diff로 범위를 좁힌다.** 저장소 전체가 아니라 이 변경이 건드린 줄을 검사한다. 변경된 줄의 커버리지는 에이전트가 움직일 수 있는 숫자지만, 프로젝트 커버리지는 에이전트가 물려받은 것이다.
2. **비용이 배치를 결정한다.** 몇 초를 넘는 것은 편집 루프 밖으로 옮긴다. 저장소 전체에 대한 mutation 테스트는 몇 시간이 걸리지만, 변경이 건드린 파일에 대해서는 1분 이내에 끝난다. 이 차이가 사람들이 실행하는 검사와 실행하지 않는 검사를 가른다.

### Step 6: 기준 자체를 보호하기

에이전트가 코드와 검사를 모두 작성한다면 검사는 아무것도 증명하지 못한다는 지적이 나올 것이다. 절반은 맞으며, 이를 피하도록 설계할 가치가 있다.

에이전트는 영리한 허점을 만들지 않는다. 빨간 검사를 만나면 녹색으로 가는 가장 싼 길을 택한다. 리뷰 시점에 diff에서 다음 다섯 가지 동작을 살핀다.

1. **기준이 움직였다.** 예산이 낮아지거나, 심각도가 내려가거나, 검사가 빠른 단계에서 제거되었다. `CONSTRAINTS.md`를 분기 시점의 상태와 비교한다.
2. **테스트가 쉬워졌다.** `.skip`이 추가되거나, 테스트 파일이 삭제되거나, 남아 있는 테스트에서 assert가 빠졌다.
3. **검사기가 침묵되었다.** 새로운 `@ts-ignore`나 `eslint-disable`. 신경 써야 할 suppression이 네 가지 있다. 이들은 여러분이 의존하는 검사를 끄기 때문이다. `istanbul ignore`는 코드를 테스트하는 대신 커버리지에서 제외하고, `Stryker disable`은 살아남은 mutant를 숨기며, `nosemgrep`과 `gitleaks:allow`는 보안 발견을 숨긴다.
4. **작업이 미완성이다.** 던지는 스텁, 실패를 침묵으로 바꾸는 빈 `catch`, 구현이 있어야 할 자리에 놓인 `TODO`.
5. **예외가 나타났다.** 아무도 논의하지 않은 Exceptions 표의 새 행.

이것은 `git diff` 이상의 도구가 필요하지 않다. 기준을 강화하는 것은 조용히, 약화하는 것은 시끄럽게 해야 한다.

번호가 매겨진 차원과 달리 floor에는 자체적인 de facto 도구가 없으므로, floor를 강제하라고 요청받은 에이전트는 검사기를 처음부터 작성하려 하고, 두 에이전트는 서로 다른 검사기를 작성한다. 이 다섯 가지 검사의 참조 구현이 이 스킬과 함께 [references/floor-guard.md](references/floor-guard.md)에 제공된다(diff 범위, 종료 코드 `0`/`1`/`2`, 생태계별로 조정 가능한 패턴). 직접 다시 만들지 말고 이것을 조정해서 사용한다. 모든 차원이 de facto 도구를 명시하는 것과 같은 이유로, 실행마다, 스택마다 메커니즘이 같아야 하기 때문이다.

**모든 검사가 똑같이 순환적인 것은 아니다.** 한 가지 질문으로 순위를 매긴다. 에이전트가 동작하지 않는 코드를 작성해서 이 검사를 통과시킬 수 있는가?

- **외부** — axe-core는 WCAG를 인코딩하고, `osv-scanner`는 취약점 데이터베이스를 읽으며, Lighthouse는 실제 브라우저를 측정한다. 에이전트는 이것들과 논쟁할 수 없다.
- **프로젝트** — 여러분의 린트 규칙, 여러분의 계층 경계. 파일은 사람이 소유한다.
- **스위트** — 여러분 자신의 테스트. 가장 유용하며, 진정으로 순환적인 유일한 것이다.

전적으로 세 번째 종류로만 이루어진 기준은 외부의 의견이 하나라도 들어 있는 기준보다 가치가 낮다. 최소 하나의 외부 제약이 있는지 확인한다.

### Step 7: 숫자가 없을 때의 Ratchet

62% 커버리지의 코드베이스에 80%를 설정하면 빌드가 영원히 빨갛게 되고, 그다음에는 빨간 빌드를 무시하는 법을 배운 팀이 생긴다.

대안은 어떤 결정도 요구하지 않는다. 현재 상태를 기록하고, 더 나빠지는 것을 거부하는 것이다. 오늘의 숫자와 방향을 "Measured, not yet enforced" 표에 넣는다. 모든 검사는 열망이 아니라 기록된 값과 비교한다. 숫자가 좋아지면 갱신하고, 떨어지면 그것이 발견 사항이다.

이것은 훈련에 대한 타당한 반론에도 답한다. 모델은 몇 초 만에 평가할 수 있는 테스트 통과에 대해 보상받는다. 아키텍처의 부패는 몇 달에 걸쳐 드러나며 가중치에 도달하지 않는다. Ratchet은 빌드가 볼 수 있는 곳에 적혀 있는, 빠져 있던 페널티다.

## 기본값

사용자에게 의견이 없을 때 이 값을 사용한다. 첫날 대부분의 코드베이스가 충족할 수 있도록 선택되었다.

| 제약 | 기본값 | 이 숫자인 이유 |
|------------|---------|-----------------|
| 변경된 줄의 커버리지 | ≥ 80% | 테스트를 강제할 만큼 높고, 설정 한 줄은 허용할 만큼 낮다 |
| 프로젝트 커버리지 | 오늘의 값, 떨어지면 안 됨 | 채택하는 데 논쟁이 필요 없다 |
| Mutation score (사용한다면) | 시작은 ≥ 60% | 한 번도 mutation을 돌리지 않은 스위트의 전형적인 값이며, 80%는 성숙한 수준이다 |
| 의존성 취약점 | high 이상은 없음 | 그 아래는 대부분 노이즈다 |
| LCP | ≤ 2500 ms | Core Web Vitals "good" 임계값 |
| CLS | ≤ 0.1 | 동일 |
| 접근성 | axe의 critical 또는 serious 위반 0개 | moderate와 minor는 종종 논쟁의 여지가 있다 |
| 예외 유효 기간 | 90일 | 수정을 계획할 만큼 길고, 기억할 만큼 짧다 |
| Ratchet 허용치 | 0.5% | 관련 없는 파일이 숫자를 움직일 때 생기는 드리프트를 흡수한다 |

숫자와 이유를 함께 명시한다. 이유 없는 임계값은 그것에 부딪힌 다음 사람이 삭제한다.

## Escalation Path

제약은 세 단계의 강제력으로 작동한다. 첫 번째에서 시작한다.

1. **문서만.** `CONSTRAINTS.md`가 존재하고 에이전트가 읽는다. 비용이 들지 않고, 정직한 실수를 잡지만, 에이전트의 준수에 의존한다.
2. **스크립트.** 빠른 검사를 실행하는 `npm run check`(또는 `make check`)를 에이전트의 편집 후 훅과 CI에 연결한다. 결정적이며, 새 의존성이 없다.
3. **도구 기반.** diff 범위 지정, 예산, ratchet, 가드 검사를 처리하는 전용 러너. 설정이 셸 스크립트를 넘어설 때 사용한다. [references/floor-guard.md](references/floor-guard.md)의 floor-guard 참조 구현이 가드 검사 쪽의 출발점이다.

대부분의 프로젝트는 2단계에서 멈춰야 한다. 검사를 실행하는 셸 코드가 약 30줄을 넘어가면 3단계로 옮긴다.

**첫 실행은 floor만으로 할 수 있다.** floor 가드는 diff만 보고 설치가 필요 없으므로, 첫 커밋 전에 모든 검사기를 세우기보다 첫날에 floor를 강제하고 각 도구를 설치할 때마다 번호가 매겨진 차원을 추가할 수 있다. 시스템 전체에 설치되는 보안 도구(gitleaks, osv-scanner)는 노트북을 깨끗하게 유지하려면 CI에서만 실행할 수도 있다. 각 차원이 어디에서 실행되는지는 `Runs at` 열에 적는다.

## 흔한 합리화

| 변명 | 현실 |
|--------|---------|
| "코드가 안정되면 제약을 추가하자" | 코드는 움직이는 동안 허용된 것을 중심으로 안정된다 |
| "테스트가 곧 제약이다" | 여러분이 작성한 테스트는 여러분이 자신과 일치한다는 것만 증명한다. 새 코드의 커버리지, 의존성 위험, 번들 증가에 대해서는 아무것도 말하지 않는다 |
| "80% 커버리지는 못 맞춘다" | 그러면 80%로 설정하지 마라. 오늘의 숫자를 설정하고 유지하라 |
| "이러면 에이전트가 느려진다" | 느린 검사를 빠른 루프에 넣을 때만 그렇다. 그것은 배치 오류이지, 제약에 반대하는 논증이 아니다 |
| "우리 기준이 뭔지 기억할 것이다" | 에이전트는 기억하지 못하며, 에이전트가 코드의 대부분을 쓰고 있다 |
| "제약 때문에 출하가 막힌다" | 담당자와 날짜가 있는 예외가 막힘을 풀어 준다. 제약을 삭제하면 모두의 막힘이 영원히 풀린다 |

## 위험 신호

다음 중 하나라도 보이면 멈추고 다시 생각한다.

- 인터뷰가 네 개의 질문을 넘었거나, 사용자가 설명할 수 없는 설정을 만들었다
- 프로젝트가 오늘 실패하는 예산을 설정했는데, 그것에 도달할 계획이 없다
- 차원이 숫자와 함께 CONSTRAINTS.md에 적혔는데 뒤에 도구가 없다
- 이미 존재하는 de facto 검사기가 있는데 직접 검사기를 만들어서 팀의 기존 설정이 무시된다
- 모든 제약이 프로젝트 자체의 테스트 스위트로 검사되며, 외부의 의견이 없다
- 기능이 실패하고 있던 것과 같은 커밋에서 `CONSTRAINTS.md`가 바뀌었다
- 예외에 담당자가 없거나, 만료일이 1년 넘게 남아 있다
- 에이전트가 코드를 고치는 대신 임계값을 완화하자고 제안했다
- 느린 검사가 편집 루프에 들어갔고, 누군가 `--no-verify`를 넘기기 시작했다
- 작성된 이후 아무도 `CONSTRAINTS.md`를 열어 보지 않았다

## 검증

이 스킬이 올바르게 적용되었다고 볼 수 있는 경우:

- [ ] `CONSTRAINTS.md`가 존재하고, 그 안의 모든 숫자에 명시된 이유가 있다
- [ ] floor가 강제되고, 현재 코드베이스에서 변경 없이 통과한다
- [ ] 사용자가 고른 모든 차원에 도구가 설치되어 있고, 오늘 실행되는 명령이 있다
- [ ] 각 제약에 실행 위치가 적혀 있고, 빠른 단계는 몇 초 이내로 유지된다
- [ ] 최소 하나의 제약이 외부적이다(이 프로젝트 자체의 테스트로 판단되지 않는다)
- [ ] 측정만 하는 지표는 오늘의 값과 방향을 기록한다
- [ ] 예외에는 담당자와 만료일이 있다
- [ ] `AGENTS.md` 또는 `CLAUDE.md`가 이 파일을 가리킨다
- [ ] 현재 브랜치에서 시험 실행한 결과, 사용자가 동의하지 않는 실패가 없다

## 함께 보기

- `interview-me` — 이 스킬의 접수 절차가 빌려 쓰는 한 번에 한 질문 원칙
- `code-review-and-quality` — 리뷰 방법. 이 스킬은 리뷰가 무엇을 강제할지 결정한다
- `ci-cd-and-automation` — 이 제약들이 실행되는 파이프라인 구축
- `test-driven-development` — 커버리지와 mutation 제약이 측정하는 스위트
- `security-and-hardening` — 보안 차원에 무엇이 들어가야 하는지
- `performance-optimization` — 성능 숫자가 어디에서 오는지
