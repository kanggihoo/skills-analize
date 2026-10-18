# CONTEXT.md 포맷

## 구조 (Structure)

```md
# {컨텍스트 이름}

{이 컨텍스트가 무엇이고 왜 존재하는지 설명하는 1~2문장.}

## 언어 (Language)

**Order**:
{용어에 대한 1~2문장의 설명}
_Avoid_: Purchase, transaction

**Invoice**:
배송 후 고객에게 발송되는 지불 요청서.
_Avoid_: Bill, payment request

**Customer**:
주문을 진행하는 사람 또는 조직.
_Avoid_: Client, buyer, account
```

## 규칙 (Rules)

- **소신 있게 정의하세요 (Be opinionated).** 동일한 개념에 대해 여러 단어가 존재할 때, 가장 적절한 하나를 선택하고 나머지는 `_Avoid_` 아래에 작성하세요.
- **정의는 간결하게 유지하세요.** 최대 1~2문장. 그 용어가 *무엇을 하는지*가 아니라 *무엇인지*를 정의하세요.
- **이 프로젝트 컨텍스트에 특화된 용어만 포함하세요.** 일반적인 프로그래밍 개념(타임아웃, 에러 타입, 유틸리티 패턴 등)은 프로젝트에서 광범위하게 사용되더라도 포함하지 마세요. 용어를 추가하기 전에 스스로에게 물어보세요: 이 개념은 이 컨텍스트에 고유한가, 아니면 일반적인 프로그래밍 개념인가? 전자만 포함 대상입니다.
- **자연스러운 클러스터가 형성되면 부헤딩 아래에 용어를 그룹화하세요.** 모든 용어가 하나의 응집된 영역에 속한다면 평탄한 리스트 구조도 괜찮습니다.

## 단일 대 다중 컨텍스트 리포지토리 (Single vs multi-context repos)

**단일 컨텍스트 (대부분의 리포지토리):** 리포지토리 루트에 하나의 `CONTEXT.md` 존재.

**다중 컨텍스트:** 리포지토리 루트의 `CONTEXT-MAP.md` 파일이 각 컨텍스트 목록, 위치 및 상호 관계를 명시합니다:

```md
# 컨텍스트 맵 (Context Map)

## 컨텍스트 목록 (Contexts)

- [Ordering](./src/ordering/CONTEXT.md) — 고객 주문을 수신하고 추적함
- [Billing](./src/billing/CONTEXT.md) — 청구서를 생성하고 결제를 처리함
- [Fulfillment](./src/fulfillment/CONTEXT.md) — 창고 픽킹 및 배송을 관리함

## 관계 (Relationships)

- **Ordering → Fulfillment**: Ordering에서 `OrderPlaced` 이벤트를 발행하고, Fulfillment가 이를 소비하여 픽킹을 시작함
- **Fulfillment → Billing**: Fulfillment에서 `ShipmentDispatched` 이벤트를 발행하고, Billing이 이를 소비하여 청구서를 생성함
- **Ordering ↔ Billing**: `CustomerId` 및 `Money` 타입 공유
```

스킬은 어떤 구조가 적용되는지 추론합니다:

- `CONTEXT-MAP.md`가 존재하면, 이를 읽어 컨텍스트들을 찾습니다.
- 루트 `CONTEXT.md`만 존재하면, 단일 컨텍스트입니다.
- 둘 다 존재하지 않으면, 첫 번째 용어가 정립될 때 지연 생성 방식으로 루트 `CONTEXT.md`를 생성합니다.

다중 컨텍스트가 존재할 때, 현재 주제가 어떤 컨텍스트에 관련되는지 추론하세요. 불분명하다면 질문하세요.
