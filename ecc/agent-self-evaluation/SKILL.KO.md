---
name: agent-self-evaluation
description: 중요하지 않은 작업을 마친 후에 사용하세요. 에이전트가 정확성, 완전성, 명확성, 실행 가능성, 간결성의 5가지 축으로 자신의 결과물을 평가하며, 축마다 구체적인 근거를 제시합니다. 개선 제안을 포함한 구조화된 1–5점 채점표를 만듭니다.
origin: ECC
---

# 에이전트 자기 평가

복잡한 작업을 마친 후 에이전트는 잠시 멈추고 구조화된 5축 루브릭으로 자신의 결과물을 채점합니다. 이것은 통과/실패 관문이 아니라, 사용자가 문제를 발견하기 전에 누락을 잡아내고, 과도한 자신감을 표시하며, 개선할 영역을 드러내기 위한 의도적인 성찰 단계입니다.

## 활성화 시점

- 3개 이상의 파일 또는 50줄 이상에 걸친 코드를 작성한 후
- 여러 단계로 이루어진 작업 흐름(구현 → 테스트 → 리뷰)을 완료한 후
- 3회 이상의 시도가 있었던 디버깅 세션 후
- 설계 문서, 아키텍처 결정, 또는 작성된 분석을 만든 후
- 사용자가 "얼마나 잘했어?" 또는 "스스로 평가해 봐"라고 물을 때
- 세션 종료 Stop 훅이 끝날 때(설정된 경우 — `references/hook-integration.md` 참고)

## 핵심 개념

### 5가지 평가 축

| 축 | 질문 | 잡아내는 것 |
|---|---|---|
| **정확성** | 사실, 주장, 결과물이 올바른가? | 환각, 잘못된 API 이름, 잘못된 문법, 거짓 진술 |
| **완전성** | 사용자가 요청한 모든 것을 다뤘는가? | 놓친 엣지 케이스, 처리되지 않은 오류 경로, 잊힌 요구사항, 건너뛴 하위 작업 |
| **명확성** | 설명이 이해하기 쉽고 잘 구조화되어 있는가? | 혼란스러운 설명, 정의 없는 전문 용어, 빠진 맥락, 횡설수설 |
| **실행 가능성** | 사용자가 결과물을 바로 실행할 수 있는가? | 모호한 제안, 빠진 단계, 방법은 없이 "X를 해야 합니다"만 있는 경우, 검증 경로가 없는 경우 |
| **간결성** | 필요한 최소한의 단어/토큰만 사용했는가? | 중복, 과한 설명, 사용자의 질문을 그대로 반복함, 군더더기 내용 |

### 채점 척도

```
5 — 탁월함: 합리적으로 개선할 여지가 없음
4 — 좋음: 사소한 흠만 있고 실질적인 공백은 없음
3 — 적절함: 요청은 충족하지만 적어도 한 축에서 눈에 띄는 약점이 있음
2 — 약함: 사용성이나 정확성에 영향을 주는 명확한 공백이 있음
1 — 나쁨: 요청을 근본적으로 놓치거나 중대한 오류를 포함함
```

### 근거 규칙

5점 미만의 모든 점수에는 반드시 구체적인 근거를 제시해야 합니다. 3점이 "더 나아질 수 있음"이라고만 말하면 안 되며, 정확히 무엇이 빠졌거나 잘못되었는지 말해야 합니다. 원칙은 **"공백을 이름만 대지 말고 보여 주라"**입니다.

## 작업 흐름

### 1단계: 원자료 수집

평가할 자료를 모읍니다:

```
- 원래 사용자 요청 (대화에서 다시 읽어 옴)
- 최종 응답/출력 (결과물)
- 정확성을 검증하는 도구 출력 (테스트 결과, 종료 코드, 린트 출력)
- 작업 중 받은 사용자 피드백 (정정, "다시 해 줘", "그건 틀렸어")
```

### 2단계: 각 축을 독립적으로 채점

5개 축을 하나씩 살펴봅니다. 각 축마다:

1. 축의 질문을 읽는다
2. 출력에서 근거(또는 근거의 부재)를 찾는다
3. 1–5점을 매긴다
4. 점수가 5점 미만이면, 공백을 짚는 한 문장의 개선 메모를 쓴다

점수를 머릿속에서 먼저 평균 내고 거꾸로 맞추지 마세요. 각 축을 새롭게 채점하세요.

### 3단계: 평가 보고서 작성

`templates/evaluation-report.md`의 템플릿을 사용합니다. 보고서에는 다음이 포함되어야 합니다:

```
- 한 줄 요약
- 5축 채점표 (축마다 점수 + 근거)
- 전체 점수 (단순 평균, 소수점 첫째 자리로 반올림)
- 영향도 순으로 정렬된 구체적 개선 사항 1–3개
- 자체 점검: "사용자도 이 평가에 동의할까?"
```

### 4단계: 개선 적용

어느 축이든 3점 이하를 받았다면:

1. 다르게 했을 일을 밝힌다
2. 30초 안에 고칠 수 있는 공백(빠진 링크, 불분명한 표현)이라면 지금 고친다
3. 재작업이 필요한 공백이라면 명시적으로 표시한다: "이 축은 [이유] 때문에 [근거]로 점수가 낮습니다. [구체적 수정]으로 다시 실행하면 [점수]까지 올라갈 가능성이 높습니다."

## 코드 예시

### 예시: 좋은 평가 (4점 이상)

```
Task: Add retry logic to HTTP client

Scorecard:
  Accuracy:    5 — All API calls correct. Verified: retries use
                  exponential backoff. No hallucinated methods.
  Completeness: 4 — Covered happy path + 3 error cases. Missing:
                  timeout handling for hung connections.
  Clarity:      5 — Code comments explain backoff formula.
                  PR description links to incident that motivated this.
  Actionability:5 — Single merge. No follow-up tasks. Tests pass.
  Conciseness:  4 — 47 lines total. The retry loop could be extracted
                  into a helper to drop ~8 lines.

Overall: 4.6 — One gap (timeout handling). Fix before merging.
```

### 예시: 나쁜 평가 (2–3점)

```
Task: Add retry logic to HTTP client

Scorecard:
  Accuracy:    2 — Used urllib3 which doesn't match our
                  httpx-based codebase. Wrong library.
  Completeness: 3 — Works for GET. POST/PUT not handled (user
                  said "all HTTP requests").
  Clarity:      4 — Code is readable. Good variable names.
  Actionability:2 — "Add tests" mentioned but no test file created.
                  User has to write tests before merging.
  Conciseness:  3 — 120 lines. The retry config is duplicated in
                  3 places instead of one shared RetryConfig object.

Overall: 2.8 — Wrong library used. Needs httpx rewrite.
  Fix accuracy first (switch to httpx), then extend to all
  HTTP methods, then consolidate config.
```

## 안티패턴

### "모든 축이 5점"

```
FAIL: Accuracy:    5 — All good.
   Completeness: 5 — Everything covered.
   Clarity:      5 — Clear.
```

근거가 제시되지 않았습니다. 이것은 평가가 아니라 자화자찬입니다. 진짜 5점은 개선할 것이 없다는 것을 증명해야 받을 수 있습니다.

### 범위 확장에 대한 과도한 감점

```
FAIL: Completeness: 2 — Didn't handle WebSocket connections or
   gRPC streaming (user didn't ask for these)
```

사용자가 실제로 요청한 것을 기준으로만 평가하세요. 추가로 만들 수 있었던 것을 기준으로 평가하지 마세요.

### 평가를 빌미로 다시 따지기

```
FAIL: "As I said earlier, this approach is wrong. Score: 1"
```

평가는 전달된 결과물에 관한 것이지, 이미 내려진 설계 결정을 다시 논쟁하는 것이 아닙니다. 접근이 잘못되었다면 전달 전에 잡혔어야 합니다.

### 개인 취향과 객관적 공백의 혼용

```
FAIL: "Score: 3. I don't like Python decorators."
```

"마음에 들지 않는다"는 근거가 아닙니다. 구체적인 가독성, 테스트 용이성, 또는 정확성 문제를 제시하거나, 점수를 4점 이상으로 두세요.

## 모범 사례

- **과정이 아니라 결과물을 평가하세요.** 사용자가 신경 쓰는 것은 전달한 결과물이지, 반복을 몇 번 했는지가 아닙니다.
- **약한 축마다 개선 사항은 하나만.** 한 축에 5가지를 나열하지 말고, 가장 영향이 큰 공백 하나를 고르세요.
- **개선 사항을 사용자 영향과 연결하세요.** "오류 처리가 없어서 사용자의 API 호출이 조용히 실패합니다"가 "오류 처리를 추가하세요"보다 낫습니다.
- **'고쳐진' 상태가 무엇인지 구체적으로 쓰세요.** "재시도를 설정한 httpx transport로 다시 실행"이 "라이브러리 문제를 고치세요"보다 낫습니다.
- **도구 출력을 근거로 사용하세요.** 테스트가 통과했다면 그것을 인용하세요. 린트가 깨끗하다면 그것을 인용하세요. 추측하지 말고 증거를 grep으로 확인하세요.
- **공백이 보이지 않는다면 더 열심히 찾으세요.** 5개 축 모두 완벽한 점수는 드뭅니다. "내가 사용자라면 이 결과물의 무엇이 거슬릴까?"라고 물어보세요.

## 관련 스킬

- `agent-eval` — 벤치마크 작업에서 서로 다른 코딩 에이전트를 직접 비교
- `verification-loop` — 예상 결과에 대한 출력의 체계적 검증
- `security-review` — 보안 중심 코드 리뷰 체크리스트
