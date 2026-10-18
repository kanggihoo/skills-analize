---
name: domain-modeling
description: 프로젝트의 도메인 모델을 가다듬고 정립합니다. 도메인 용어나 유비쿼터스 언어를 명확히 하고, 아키텍처 결정을 기록하거나, 다른 스킬에서 도메인 모델을 유지보수해야 할 때 사용합니다.
---

# 도메인 모델링 (Domain Modeling)

설계 과정에서 프로젝트의 도메인 모델을 적극적으로 구축하고 명확하게 가다듬으세요. 이것은 **전술적/적극적 훈련**입니다 — 용어에 의문을 제기하고, 엣지 케이스 시나리오를 고안하며, 용어집과 결정사항이 명확해지는 즉시 기록하는 작업입니다. (단순히 용어를 파악하기 위해 `CONTEXT.md`를 *읽는* 것은 이 스킬이 아닙니다 — 그것은 어떤 스킬이든 할 수 있는 한 줄짜리 습관입니다. 이 스킬은 단순히 도메인 모델을 소비하는 것이 아니라 **모델을 직접 변경할 때** 사용합니다.)

## 파일 구조 (File structure)

대부분의 리포지토리는 단일 컨텍스트(Single Context)를 갖습니다:

```
/
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

루트에 `CONTEXT-MAP.md`가 존재한다면, 해당 리포지토리는 다중 컨텍스트(Multiple Contexts)를 갖는 것입니다. 컨텍스트 맵은 각 컨텍스트가 어디에 위치하는지 가리킵니다:

```
/
├── CONTEXT-MAP.md
├── docs/
│   └── adr/                          ← 시스템 전반의 결정사항
├── src/
│   ├── ordering/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                 ← 컨텍스트 전용 결정사항
│   └── billing/
│       ├── CONTEXT.md
│       └── docs/adr/
```

파일은 필요할 때 지연 생성(Lazy creation)하세요 — 작성할 내용이 있을 때만 생성합니다. `CONTEXT.md`가 없다면 첫 번째 용어가 정립될 때 생성하세요. `docs/adr/`가 없다면 첫 번째 ADR이 필요할 때 생성하세요.

## 세션 진행 중 (During the session)

### 용어집과 대조하여 검증 (Challenge against the glossary)

사용자가 `CONTEXT.md`에 정의된 기존 언어와 충돌하는 용어를 사용할 경우 즉시 지적하세요. "용어집에는 '취소'가 X로 정의되어 있는데, 작성자님은 Y를 의미하는 것 같습니다 — 어느 것이 맞습니까?"

### 모호한 언어의 정밀화 (Sharpen fuzzy language)

사용자가 모호하거나 다중 의미를 가진 용어를 사용할 때, 명확하고 표준적인 용어를 제안하세요. "'계정'이라고 하셨는데, 고객(Customer)을 의미합니까 아니면 사용자(User)를 의미합니까? 둘은 다른 개념입니다."

### 구체적인 시나리오 논의 (Discuss concrete scenarios)

도메인 관계를 논의할 때, 구체적인 시나리오로 스트레스 테스트를 수행하세요. 엣지 케이스를 조사하고 개념 간의 경계를 명확히 하도록 강제하는 시나리오를 구성하세요.

### 코드와 상호 검증 (Cross-reference with code)

사용자가 어떤 기능의 동작 방식을 설명할 때, 코드도 이에 동의하는지 확인하세요. 모순을 발견하면 이를 표면화하세요: "코드에서는 주문 전체를 취소하지만, 지금 부분 취소가 가능하다고 하셨습니다 — 어느 쪽이 맞습니까?"

### CONTEXT.md 실시간 업데이트 (Update CONTEXT.md inline)

용어가 정립되면 그 자리에서 즉시 `CONTEXT.md`를 업데이트하세요. 나중에 한꺼번에 몰아서 하지 말고 발생 즉시 기록하세요. [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md)의 포맷을 사용하세요.

`CONTEXT.md`에는 구현 세부사항이 완전히 배제되어야 합니다. `CONTEXT.md`를 사양서, 임시 메모장, 구현 결정의 저장소로 다루지 마세요. 이 파일은 용어집이며 그 이상도 이하도 아닙니다.

### ADR은 아껴서 제안 (Offer ADRs sparingly)

다음 3가지 조건이 **모두 참(True)**일 때만 ADR 조성을 제안하세요:

1. **되돌리기 힘듦 (Hard to reverse)** — 나중에 마음을 바꿀 때 발생하는 비용이 큼
2. **맥락 없으면 의문 발생 (Surprising without context)** — 미래의 읽는 이가 "왜 이런 방식으로 작성했지?" 하고 의아해함
3. **실질적 트레이드오프의 결과 (Result of a real trade-off)** — 진정한 대안들이 존재했고 특정 이유로 하나를 선택함

셋 중 하나라도 해당하지 않는다면 ADR 작성을 건너뛰세요. [ADR-FORMAT.md](./ADR-FORMAT.md)의 포맷을 사용하세요.
