---
name: eval-harness
description: AI 코딩 세션을 위한 평가 주도 개발(EDD) 프레임워크 — 코딩 전에 capability 및 regression eval을 정의하고, code 기반, 모델 기반, 규칙, 사람 채점자로 채점하며, pass@k와 pass^k 신뢰도를 추적합니다. 에이전트 작업의 pass/fail 기준을 정하거나, 에이전트 신뢰도를 측정하거나, 프롬프트/에이전트 변경을 위한 회귀 스위트를 만들거나, 모델 버전 간 벤치마크를 할 때 사용합니다.
metadata:
  origin: ECC
tools: Read, Write, Edit, Bash, Grep, Glob
---

# Eval Harness 스킬

Claude Code 세션을 위한 공식 평가 프레임워크로, 평가 주도 개발(EDD) 원칙을 구현합니다.

## 활성화 시점

- AI 지원 워크플로에 평가 주도 개발(EDD)을 설정할 때
- Claude Code 작업 완료에 대한 pass/fail 기준을 정의할 때
- pass@k 지표로 에이전트 신뢰도를 측정할 때
- 프롬프트 또는 에이전트 변경을 위한 회귀 테스트 스위트를 만들 때
- 모델 버전별로 에이전트 성능을 벤치마크할 때

## 철학

평가 주도 개발은 평가를 "AI 개발의 단위 테스트"로 취급합니다.
- 구현 전에 기대 동작을 정의한다
- 개발 중에 평가를 지속적으로 실행한다
- 변경할 때마다 회귀를 추적한다
- 신뢰도 측정에는 pass@k 지표를 사용한다

## 평가 유형

### Capability 평가
Claude가 이전에 할 수 없던 것을 할 수 있는지 테스트합니다:
```markdown
[CAPABILITY EVAL: feature-name]
Task: Claude가 달성해야 할 작업 설명
Success Criteria:
  - [ ] 기준 1
  - [ ] 기준 2
  - [ ] 기준 3
Expected Output: 기대 결과 설명
```

### 회귀 평가
변경이 기존 기능을 깨뜨리지 않는지 확인합니다:
```markdown
[REGRESSION EVAL: feature-name]
Baseline: SHA 또는 체크포인트 이름
Tests:
  - existing-test-1: PASS/FAIL
  - existing-test-2: PASS/FAIL
  - existing-test-3: PASS/FAIL
Result: X/Y passed (previously Y/Y)
```

## 채점자 유형

### 1. Code 기반 채점자
코드로 수행하는 결정적 검사:
```bash
# 파일에 기대 패턴이 있는지 확인
grep -q "export function handleAuth" src/auth.ts && echo "PASS" || echo "FAIL"

# 테스트가 통과하는지 확인
npm test -- --testPathPattern="auth" && echo "PASS" || echo "FAIL"

# 빌드가 성공하는지 확인
npm run build && echo "PASS" || echo "FAIL"
```

### 2. 모델 기반 채점자
Claude를 사용해 열린 형식의 출력을 평가합니다:
```markdown
[MODEL GRADER PROMPT]
다음 코드 변경을 평가하세요:
1. 명시된 문제를 해결하는가?
2. 구조가 잘 짜여 있는가?
3. 엣지 케이스를 처리하는가?
4. 에러 처리가 적절한가?

점수: 1-5 (1=나쁨, 5=우수)
근거: [explanation]
```

### 3. 사람 채점자
수동 검토를 위해 표시합니다:
```markdown
[HUMAN REVIEW REQUIRED]
변경: 무엇이 바뀌었는지 설명
이유: 사람 검토가 필요한 이유
위험 수준: LOW/MEDIUM/HIGH
```

## 지표

### pass@k
"k번 시도 중 최소 한 번 성공"
- pass@1: 첫 시도 성공률
- pass@3: 3번 이내 성공
- 일반적인 목표: pass@3 > 90%

### pass^k
"k번의 시도가 모두 성공"
- 더 높은 신뢰도 기준
- pass^3: 연속 3회 성공
- 중요한 경로에 사용

## 평가 워크플로

### 1. 정의 (코딩 전)
```markdown
## EVAL DEFINITION: feature-xyz

### Capability 평가
1. 새 사용자 계정을 만들 수 있는가
2. 이메일 형식을 검증할 수 있는가
3. 비밀번호를 안전하게 해시할 수 있는가

### 회귀 평가
1. 기존 로그인이 여전히 동작하는가
2. 세션 관리가 변경되지 않았는가
3. 로그아웃 흐름이 온전한가

### 성공 지표
- capability 평가는 pass@3 > 90%
- regression 평가는 pass^3 = 100%
```

### 2. 구현
정의한 평가를 통과하도록 코드를 작성합니다.

### 3. 평가
```bash
# capability 평가 실행
[각 capability 평가를 실행하고 PASS/FAIL을 기록]

# 회귀 평가 실행
npm test -- --testPathPattern="existing"

# 보고서 생성
```

### 4. 보고
```markdown
EVAL REPORT: feature-xyz
========================

Capability 평가:
  create-user:     PASS (pass@1)
  validate-email:  PASS (pass@2)
  hash-password:   PASS (pass@1)
  전체:            3/3 통과

회귀 평가:
  login-flow:      PASS
  session-mgmt:    PASS
  logout-flow:     PASS
  전체:            3/3 통과

지표:
  pass@1: 67% (2/3)
  pass@3: 100% (3/3)

상태: 검토 준비 완료
```

## 통합 패턴

### 구현 전
```
/eval define feature-name
```
`.claude/evals/feature-name.md`에 평가 정의 파일을 만듭니다.

### 구현 중
```
/eval check feature-name
```
현재 평가를 실행하고 상태를 보고합니다.

### 구현 후
```
/eval report feature-name
```
전체 평가 보고서를 생성합니다.

## 평가 저장

프로젝트에 평가를 저장합니다:
```
.claude/
  evals/
    feature-xyz.md      # 평가 정의
    feature-xyz.log     # 평가 실행 이력
    baseline.json       # 회귀 기준선
```

## 모범 사례

1. **코딩 전에 평가를 정의하세요** - 성공 기준을 명확히 생각하게 만듭니다
2. **평가를 자주 실행하세요** - 회귀를 일찍 잡아냅니다
3. **pass@k를 시간에 따라 추적하세요** - 신뢰도 추세를 모니터링합니다
4. **가능하면 code 채점자를 사용하세요** - 결정적인 것이 확률적인 것보다 낫습니다
5. **보안은 사람이 검토하세요** - 보안 검사를 완전히 자동화하지 마세요
6. **평가를 빠르게 유지하세요** - 느린 평가는 실행되지 않습니다
7. **평가를 코드와 함께 버전 관리하세요** - 평가는 일급 아티팩트입니다

## 예시: 인증 추가

```markdown
## EVAL: add-authentication

### 1단계: 정의 (10분)
Capability 평가:
- [ ] 사용자가 이메일/비밀번호로 가입할 수 있다
- [ ] 사용자가 올바른 자격 증명으로 로그인할 수 있다
- [ ] 잘못된 자격 증명은 적절한 에러와 함께 거부된다
- [ ] 세션이 페이지 새로고침 후에도 유지된다
- [ ] 로그아웃하면 세션이 삭제된다

회귀 평가:
- [ ] 공개 라우트에 여전히 접근할 수 있다
- [ ] API 응답이 변경되지 않았다
- [ ] 데이터베이스 스키마가 호환된다

### 2단계: 구현 (상황에 따라 다름)
[코드 작성]

### 3단계: 평가
실행: /eval check add-authentication

### 4단계: 보고
EVAL REPORT: add-authentication
==============================
Capability: 5/5 통과 (pass@3: 100%)
Regression: 3/3 통과 (pass^3: 100%)
상태: SHIP IT
```

## 로컬 프레임워크 유틸리티

기계적 유틸리티는 `scripts/lib/eval-harness/`에 들어 있습니다:

```sh
node scripts/eval-harness.js example
```

- Capsule: 다섯 개의 계보(lineage)를 가진 해시 연결 저널과 로컬 무결성 검사.
- Inspection: 소스 다이제스트, 검증된 변형 경로, 구문 경고.
- Replay: 선언된 도구와 내용 주소 지정 fixture. fixture가 없으면 fail-closed로 실패하며, SE3 이상은 replay에서 거부됩니다. Record 모드는 등록된 구현을 호출하므로, 신뢰할 수 있는 함수만 등록하세요.
- Receipt: 이름 붙은 검사와 함께 capsule 및 아티팩트 바이트를 오프라인으로 검증.
- 회고 준비: `node scripts/eval-harness.js capsule group <dir> [<dir> ...]`는
  명시적으로 선택한, 검증된 로컬 capsule 스냅샷 1~100개를 선언된 하네스 버전별로 하나의 작업 계열로 묶습니다. 중복 스냅샷은 한 번만 셉니다. 충돌하는 식별자나 잘못된 capsule이 있으면 보고서 전체를 거부합니다. 이는 새 롤아웃, 점수, 승격 없이 기록을 세기만 하는 읽기 전용 작업입니다. 작고 조용한 capsule을 사용하세요. 페이로드, 디렉터리 인자, 원시 run/capsule ID는 생략되지만, 작업 계열/버전 라벨은 그대로 표시되고 다이제스트 참조는 연결될 수 있으므로 공유 전에 검토하세요. 운영 검증은 아직 진행 중입니다.

후보 실행은 검증된 OS 격리 백엔드가 구현되어 있지 않으므로 모든 OS에서 비활성화되어 있습니다. `gate run`, `runGate`, `runVariant`, 직접 자식 프로세스 실행, 폐기된 effect preload는 모두 `gate.isolation_required`로 거부됩니다. 어떤 trust 플래그나 호출자가 제공한 executor로도 이 거부를 우회할 수 없습니다. 예제는 이 거부를 기록하고, 소스를 실행하거나 점수를 매기지 않고 검사만 합니다.

정적 경고, capsule receipt, 또는 유틸리티 테스트 성공을 후보 격리나 승격의 증거로 제시하지 마세요. 향후 게이트에는 독립적으로 검토된 OS 경계, 보호된 검사기와 감사 채널, 그리고 치명적인 기준선 거부가 필요합니다. `docs/architecture/eval-harness-frameworks.md`를 참고하세요.

## 제품 평가 (v1.8)

행동의 품질을 단위 테스트만으로 측정할 수 없을 때 제품 평가를 사용하세요.

### 채점자 유형

1. Code 채점자 (결정적 단언)
2. 규칙 채점자 (정규식/스키마 제약)
3. 모델 채점자 (LLM-as-judge 루브릭)
4. 사람 채점자 (모호한 출력에 대한 수동 판정)

### pass@k 지침

- `pass@1`: 직접적인 신뢰도
- `pass@3`: 통제된 재시도 아래의 실용적 신뢰도
- `pass^3`: 안정성 테스트 (3번 실행 모두 통과해야 함)

권장 기준:
- Capability 평가: pass@3 >= 0.90
- 회귀 평가: 릴리스에 중요한 경로는 pass^3 = 1.00

### 평가 안티패턴

- 알려진 평가 예시에 맞춰 프롬프트를 과적합하기
- 해피 패스 출력만 측정하기
- 통과율을 쫓으면서 비용과 지연 드리프트를 무시하기
- 릴리스 게이트에 불안정한(flaky) 채점자를 허용하기

### 최소 평가 아티팩트 레이아웃

- `.claude/evals/<feature>.md` 정의
- `.claude/evals/<feature>.log` 실행 이력
- `docs/releases/<version>/eval-summary.md` 릴리스 스냅샷
