---
name: agent-payment-x402
description: 작업별 예산, 지출 통제, 비수탁(non-custodial) 지갑을 갖춘 AI 에이전트에 x402 결제 실행 기능을 추가합니다. agentwallet-sdk를 통한 Base, OKX Payments / OKX Agent Payments Protocol을 통한 X Layer를 지원합니다. 에이전트가 스스로 대가를 지불해야 하며 작업별 예산, 지출 통제, 비수탁 지갑이 필요할 때 사용합니다.
metadata:
  origin: community
---

# 에이전트 결제 실행 (x402)

내장된 지출 통제를 갖춘 정책 기반 결제를 AI 에이전트가 수행할 수 있게 합니다. x402 HTTP 결제 프로토콜과 MCP 도구를 사용하여, 에이전트가 커스터디 위험 없이 외부 서비스, API, 또는 다른 에이전트에 대가를 지불할 수 있게 합니다.

## 사용 시점

다음과 같은 경우에 사용합니다. 에이전트가 API 호출 비용을 지불해야 할 때, 서비스를 구매할 때, 다른 에이전트와 정산할 때, 작업별 지출 한도를 강제할 때, 또는 비수탁 지갑을 관리할 때. cost-aware-llm-pipeline, security-review 스킬과 자연스럽게 함께 사용합니다.

## 결정 트리

에이전트가 유료 API에 대한 접근을 구매하는지, 아니면 다른 이에게 API 사용료를 청구하는지에 따라 통합 경로를 선택합니다.

| 필요 | 권장 경로 |
|------|-----------|
| 에이전트가 Base 또는 다른 agentwallet 지원 체인에서 402로 보호된 API에 지불 | 엄격한 지출 정책과 함께 `agentwallet-sdk`를 MCP 결제 서버로 사용 |
| 에이전트가 X Layer에서 402로 보호된 API에 지불 | `okx/onchainos-skills`의 OKX Agent Payments Protocol 사용. `okx-x402-payment`는 더 이상 권장되지 않는 레거시 별칭 |
| TypeScript API가 에이전트에게 요금 청구 | Express, Hono, Fastify, Next.js용 OKX Payments TypeScript 판매자 SDK 문서 사용 |
| Go API가 에이전트에게 요금 청구 | Gin, Echo, `net/http`용 OKX Payments Go 판매자 SDK 문서 사용 |
| Rust API가 에이전트에게 요금 청구 | Axum용 OKX Payments Rust 판매자 SDK 문서 사용 |
| Java API가 에이전트에게 요금 청구 | Spring Boot 2/3, Java EE, Jakarta용 OKX Payments Java 판매자 SDK 문서 사용 |
| Python API가 에이전트에게 요금 청구 | 구현 전에 현재 OKX Payments 저장소를 확인. Python 판매자 가이드는 없을 수 있음 |

## 지원 네트워크

- `agentwallet-sdk`: 프로덕션 전에 패키지 문서로 현재 네트워크 지원 범위를 확인하세요. Base Sepolia가 가장 안전한 개발 기본값이며, 원본 스킬에서 언급한 프로덕션 경로는 Base 메인넷입니다.
- OKX Payments / X Layer: 현재 판매자 문서는 X Layer(`eip155:196`)와 USDT0 정산을 대상으로 합니다. 결제 패키지와 퍼실리테이터 동작은 빠르게 바뀔 수 있으므로, 프로덕션 코드를 생성하기 전에 최신 SDK 문서를 가져오세요.

## 동작 방식

### x402 프로토콜
x402는 HTTP 402(Payment Required)를 기계가 협상할 수 있는 흐름으로 확장합니다. 서버가 `402`를 반환하면 에이전트의 결제 도구가 가격을 협상하고, 예산을 확인하고, 트랜잭션에 서명한 뒤, 오케스트레이터가 설정한 정책 및 확인 경계 안에서만 재시도합니다.

### 지출 통제
모든 결제 도구 호출은 `SpendingPolicy`를 강제합니다.
- **작업별 예산** — 단일 에이전트 작업의 최대 지출
- **세션별 예산** — 전체 세션에 걸친 누적 한도
- **허용 목록 수신자** — 에이전트가 결제할 수 있는 주소/서비스를 제한
- **속도 제한** — 분/시간당 최대 트랜잭션 수

### 비수탁 지갑
에이전트는 ERC-4337 스마트 계정을 통해 자신의 키를 보유합니다. 오케스트레이터는 위임 전에 정책을 설정하며, 에이전트는 경계 안에서만 지출할 수 있습니다. 공유 자금도, 커스터디 위험도 없습니다.

## MCP 통합

결제 계층은 모든 Claude Code 또는 에이전트 하네스 설정에 끼워 넣을 수 있는 표준 MCP 도구를 노출합니다.

> **보안 참고**: 패키지 버전은 항상 고정하세요. 이 도구는 개인 키를 관리합니다. 고정되지 않은 `npx` 설치는 공급망 위험을 초래합니다.

### 옵션 A: agentwallet-sdk (Base / 멀티체인)

```json
{
  "mcpServers": {
    "agentpay": {
      "command": "npx",
      "args": ["agentwallet-sdk@6.0.0"]
    }
  }
}
```

### 사용 가능한 도구 (에이전트 호출 가능)

| 도구 | 용도 |
|------|------|
| `get_balance` | 에이전트 지갑 잔액 확인 |
| `send_payment` | 주소 또는 ENS로 결제 전송 |
| `check_spending` | 남은 예산 조회 |
| `list_transactions` | 모든 결제의 감사 추적 |

> **참고**: 지출 정책은 에이전트 자신이 아니라 **오케스트레이터**가 에이전트에게 위임하기 전에 설정합니다. 이렇게 해야 에이전트가 스스로 지출 한도를 올리지 못합니다. 오케스트레이션 계층이나 작업 전 훅에서 `set_policy`로 정책을 설정하세요. 에이전트가 호출할 수 있는 도구로 노출하지 마세요.

### 옵션 B: OKX Agent Payments Protocol (X Layer)

X Layer x402, 다자간 결제(MPP), 세션 결제, 청구(charge), A2A 청구 흐름에 이 경로를 사용합니다.

구매자 측 에이전트 흐름의 경우:

1. 현재 `okx/onchainos-skills` 저장소를 설치하거나 참조하세요.
2. `skills/okx-agent-payments-protocol/SKILL.md`를 디스패처로 사용하세요.
3. `skills/okx-x402-payment/SKILL.md`는 정식 스킬이 아니라 더 이상 권장되지 않는 호환 별칭으로 취급하세요.
4. 지갑 상태 확인이나 결제 실행 전에 사용자의 명시적 확인을 받으세요. 결제 실행을 일반 도구 호출 뒤에 숨기지 마세요.

판매자 측 API 흐름의 경우, 코드를 생성하기 전에 최신 언어별 가이드를 가져오세요.

| 런타임 | 최신 가이드 |
|--------|-------------|
| TypeScript | `https://raw.githubusercontent.com/okx/payments/main/typescript/SELLER.md` |
| Go | `https://raw.githubusercontent.com/okx/payments/main/go/x402/SELLER.md` |
| Rust | `https://raw.githubusercontent.com/okx/payments/main/rust/x402/SELLER.md` |
| Java | `https://raw.githubusercontent.com/okx/payments/main/java/SELLER.md` |

현재 OKX 저장소를 확인하지 않고 오래된 문서의 예제를 복사하지 마세요. 현재 OKX 가이드는 `okx-agent-payments-protocol`을 디스패처로 사용하며, Java 판매자 문서도 이제 제공됩니다.

## 예제

### MCP 클라이언트의 예산 강제

agentpay MCP 서버를 호출하는 오케스트레이터를 만들 때, 유료 도구 호출을 디스패치하기 전에 예산을 강제하세요.

> **사전 조건**: MCP 설정을 추가하기 전에 패키지를 설치하세요. `-y` 없이 `npx`를 실행하면 비대화형 환경에서 확인을 요구하며 서버가 멈출 수 있습니다: `npm install -g agentwallet-sdk@6.0.0`

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  // 1. 트랜스포트를 생성하기 전에 자격 증명을 검증합니다.
  //    키가 없으면 즉시 실패해야 합니다. 인증 없이 하위 프로세스가 시작되지 않도록 합니다.
  const walletKey = process.env.WALLET_PRIVATE_KEY;
  if (!walletKey) {
    throw new Error("WALLET_PRIVATE_KEY is not set — refusing to start payment server");
  }

  // stdio 트랜스포트로 agentpay MCP 서버에 연결합니다.
  // 서버에 필요한 환경 변수만 허용 목록으로 전달하세요. 개인 키를 관리하는
  // 서드파티 하위 프로세스에 process.env 전체를 넘기지 마세요.
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["agentwallet-sdk@6.0.0"],
    env: {
      PATH: process.env.PATH ?? "",
      NODE_ENV: process.env.NODE_ENV ?? "production",
      WALLET_PRIVATE_KEY: walletKey,
    },
  });
  const agentpay = new Client({ name: "orchestrator", version: "1.0.0" });
  await agentpay.connect(transport);

  // 2. 에이전트에게 위임하기 전에 지출 정책을 설정합니다.
  //    반드시 성공 여부를 확인하세요. 조용한 실패는 통제가 활성화되지 않았음을 의미합니다.
  const policyResult = await agentpay.callTool({
    name: "set_policy",
    arguments: {
      per_task_budget: 0.50,
      per_session_budget: 5.00,
      allowlisted_recipients: ["api.example.com"],
    },
  });
  if (policyResult.isError) {
    throw new Error(
      `Failed to set spending policy — do not delegate: ${JSON.stringify(policyResult.content)}`
    );
  }

  // 3. 유료 작업 전에 preToolCheck를 사용합니다.
  await preToolCheck(agentpay, 0.01);
}

// 도구 호출 전 훅: 서로 다른 네 가지 오류 경로를 갖춘 fail-closed 예산 강제.
async function preToolCheck(agentpay: Client, apiCost: number): Promise<void> {
  // 경로 1: 잘못된 입력 거부 (NaN/Infinity는 < 비교를 우회합니다)
  if (!Number.isFinite(apiCost) || apiCost < 0) {
    throw new Error(`Invalid apiCost: ${apiCost} — action blocked`);
  }

  // 경로 2: 전송/연결 실패
  let result;
  try {
    result = await agentpay.callTool({ name: "check_spending" });
  } catch (err) {
    throw new Error(`Payment service unreachable — action blocked: ${err}`);
  }

  // 경로 3: 도구가 오류를 반환 (예: 인증 실패, 지갑 미초기화)
  if (result.isError) {
    throw new Error(
      `check_spending failed — action blocked: ${JSON.stringify(result.content)}`
    );
  }

  // 경로 4: 응답 형태를 파싱하고 검증
  let remaining: number;
  try {
    const parsed = JSON.parse(
      (result.content as Array<{ text: string }>)[0].text
    );
    if (!Number.isFinite(parsed?.remaining)) {
      throw new TypeError("missing or non-finite 'remaining' field");
    }
    remaining = parsed.remaining;
  } catch (err) {
    throw new Error(
      `check_spending returned unexpected format — action blocked: ${err}`
    );
  }

  // 경로 5: 예산 초과
  if (remaining < apiCost) {
    throw new Error(
      `Budget exceeded: need $${apiCost} but only $${remaining} remaining`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
```

## 모범 사례

- **위임 전에 예산 설정**: 하위 에이전트를 생성할 때 오케스트레이션 계층을 통해 SpendingPolicy를 연결하세요. 에이전트에게 무제한 지출을 주지 마세요.
- **의존성 고정**: MCP 설정에 항상 정확한 버전을 명시하세요(예: `agentwallet-sdk@6.0.0`). 프로덕션에 배포하기 전에 패키지 무결성을 검증하세요.
- **감사 추적**: 작업 후 훅에서 `list_transactions`를 사용하여 무엇을 왜 지출했는지 기록하세요.
- **실패 시 차단(Fail closed)**: 결제 도구에 접근할 수 없으면 유료 작업을 차단하세요. 계량되지 않은 접근으로 폴백하지 마세요.
- **security-review와 함께 사용**: 결제 도구는 고권한입니다. 셸 접근과 같은 수준의 검토를 적용하세요.
- **먼저 테스트넷에서 테스트**: 개발에는 Base Sepolia를 사용하고, 프로덕션에서는 Base 메인넷으로 전환하세요.

## 프로덕션 참고 자료

- **npm**: [`agentwallet-sdk`](https://www.npmjs.com/package/agentwallet-sdk)
- **NVIDIA NeMo Agent Toolkit에 병합됨**: [PR #17](https://github.com/NVIDIA/NeMo-Agent-Toolkit-Examples/pull/17) — NVIDIA 에이전트 예제를 위한 x402 결제 도구
- **프로토콜 명세**: [x402.org](https://x402.org)
- **OKX Payments SDK**: [`okx/payments`](https://github.com/okx/payments) — X Layer x402용 TypeScript, Go, Rust, Java 판매자 통합
- **OKX Agent Payments Protocol 스킬**: [`okx/onchainos-skills`](https://github.com/okx/onchainos-skills/tree/main/skills/okx-agent-payments-protocol)
- **OKX Payments 개요**: [web3.okx.com/onchainos/dev-docs/payments/overview](https://web3.okx.com/onchainos/dev-docs/payments/overview)
