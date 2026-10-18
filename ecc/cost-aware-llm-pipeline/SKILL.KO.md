---
name: cost-aware-llm-pipeline
description: LLM API 사용 비용 최적화 패턴 — 작업 복잡도별 모델 라우팅, 예산 추적, 재시도 로직, 프롬프트 캐싱. LLM 지출을 줄여야 하거나, 여러 모델 티어와 예산에 걸쳐 작업을 라우팅해야 할 때 사용.
metadata:
  origin: ECC
---

# 비용 인식 LLM 파이프라인

품질을 유지하면서 LLM API 비용을 통제하는 패턴. 모델 라우팅, 예산 추적, 재시도 로직, 프롬프트 캐싱을 조합 가능한 하나의 파이프라인으로 묶는다.

## 활성화 시점

- LLM API(Claude, GPT 등)를 호출하는 애플리케이션을 만들 때
- 복잡도가 제각각인 항목들을 일괄 처리할 때
- API 지출을 예산 안에서 유지해야 할 때
- 복잡한 작업의 품질을 해치지 않으면서 비용을 최적화하고 싶을 때

## 핵심 개념

### 1. 작업 복잡도에 따른 모델 라우팅

단순한 작업에는 더 저렴한 모델을 자동으로 선택하고, 비싼 모델은 복잡한 작업에만 쓴다.

```python
MODEL_SONNET = "claude-sonnet-5"
MODEL_HAIKU = "claude-haiku-4-5-20251001"

_SONNET_TEXT_THRESHOLD = 10_000  # 문자 수
_SONNET_ITEM_THRESHOLD = 30     # 항목 수

def select_model(
    text_length: int,
    item_count: int,
    force_model: str | None = None,
) -> str:
    """작업 복잡도에 따라 모델을 선택한다."""
    if force_model is not None:
        return force_model
    if text_length >= _SONNET_TEXT_THRESHOLD or item_count >= _SONNET_ITEM_THRESHOLD:
        return MODEL_SONNET  # 복잡한 작업
    return MODEL_HAIKU  # 단순한 작업 (3-4배 저렴)
```

### 2. 불변 비용 추적

frozen dataclass로 누적 지출을 추적한다. API 호출마다 새 tracker를 반환하며, 상태를 절대 변경하지 않는다.

```python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class CostRecord:
    model: str
    input_tokens: int
    output_tokens: int
    cost_usd: float

@dataclass(frozen=True, slots=True)
class CostTracker:
    budget_limit: float = 1.00
    records: tuple[CostRecord, ...] = ()

    def add(self, record: CostRecord) -> "CostTracker":
        """레코드가 추가된 새 tracker를 반환한다 (self를 변경하지 않음)."""
        return CostTracker(
            budget_limit=self.budget_limit,
            records=(*self.records, record),
        )

    @property
    def total_cost(self) -> float:
        return sum(r.cost_usd for r in self.records)

    @property
    def over_budget(self) -> bool:
        return self.total_cost > self.budget_limit
```

### 3. 제한적인 재시도 로직

일시적 오류에만 재시도한다. 인증 오류나 잘못된 요청 오류는 즉시 실패시킨다.

```python
from anthropic import (
    APIConnectionError,
    InternalServerError,
    RateLimitError,
)

_RETRYABLE_ERRORS = (APIConnectionError, RateLimitError, InternalServerError)
_MAX_RETRIES = 3

def call_with_retry(func, *, max_retries: int = _MAX_RETRIES):
    """일시적 오류에만 재시도하고, 나머지는 즉시 실패시킨다."""
    for attempt in range(max_retries):
        try:
            return func()
        except _RETRYABLE_ERRORS:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # 지수 백오프
    # AuthenticationError, BadRequestError 등 → 즉시 raise
```

### 4. 프롬프트 캐싱

긴 시스템 프롬프트를 캐시해서 매 요청마다 다시 보내지 않도록 한다.

```python
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": system_prompt,
                "cache_control": {"type": "ephemeral"},  # 이 부분을 캐시
            },
            {
                "type": "text",
                "text": user_input,  # 가변 부분
            },
        ],
    }
]
```

## 조합

네 가지 기법을 하나의 파이프라인 함수에 조합한다:

```python
def process(text: str, config: Config, tracker: CostTracker) -> tuple[Result, CostTracker]:
    # 1. 모델 라우팅
    model = select_model(len(text), estimated_items, config.force_model)

    # 2. 예산 확인
    if tracker.over_budget:
        raise BudgetExceededError(tracker.total_cost, tracker.budget_limit)

    # 3. 재시도 + 캐싱을 적용하여 호출
    response = call_with_retry(lambda: client.messages.create(
        model=model,
        messages=build_cached_messages(system_prompt, text),
    ))

    # 4. 비용 기록 (불변)
    record = CostRecord(model=model, input_tokens=..., output_tokens=..., cost_usd=...)
    tracker = tracker.add(record)

    return parse_result(response), tracker
```

## 가격 참고표 (2026)

| 모델 | 입력 ($/1M 토큰) | 출력 ($/1M 토큰) | 상대 비용 |
|-------|---------------------|----------------------|---------------|
| Haiku 3.5 (레거시) | $0.80 | $4.00 | 0.8x |
| Haiku 4.5 | $1.00 | $5.00 | 1x |
| Sonnet 5 | $2.00 | $10.00 | 2x |
| Sonnet 4.6 | $3.00 | $15.00 | 3x |
| Opus 4.8 | $5.00 | $25.00 | 5x |
| Fable 5 / Mythos 5 | $10.00 | $50.00 | 10x |
| Opus 4.0 / 4.1 (레거시) | $15.00 | $75.00 | 15x |

## 모범 사례

- **가장 저렴한 모델로 시작**하고, 복잡도 임계값을 넘었을 때만 비싼 모델로 라우팅한다
- 일괄 처리 전에 **명시적인 예산 한도를 설정**한다 — 과다 지출하기 전에 일찍 실패시킨다
- **모델 선택 결정을 로깅**해서 실제 데이터를 바탕으로 임계값을 조정할 수 있게 한다
- 1024 토큰을 넘는 시스템 프롬프트에는 **프롬프트 캐싱을 사용**한다 — 비용과 지연 시간을 모두 줄인다
- **인증 또는 검증 오류에는 절대 재시도하지 않는다** — 일시적 실패(네트워크, 레이트 리밋, 서버 오류)에만 재시도한다

## 피해야 할 안티패턴

- 복잡도와 상관없이 모든 요청에 가장 비싼 모델을 사용하는 것
- 모든 오류에 재시도하는 것 (영구적 실패에 예산을 낭비한다)
- 비용 추적 상태를 변경하는 것 (디버깅과 감사가 어려워진다)
- 코드베이스 곳곳에 모델 이름을 하드코딩하는 것 (상수나 설정을 사용한다)
- 반복되는 시스템 프롬프트에 대해 프롬프트 캐싱을 무시하는 것

## 사용 시점

- Claude, OpenAI 등 LLM API를 호출하는 모든 애플리케이션
- 비용이 빠르게 누적되는 일괄 처리 파이프라인
- 지능형 라우팅이 필요한 다중 모델 아키텍처
- 예산 가드레일이 필요한 프로덕션 시스템
