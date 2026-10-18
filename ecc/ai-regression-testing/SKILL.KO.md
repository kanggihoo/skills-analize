---
name: ai-regression-testing
description: AI 보조 개발을 위한 회귀 테스트 전략. 데이터베이스 의존성 없이 샌드박스 모드에서 API를 테스트하고, 버그 체크 워크플로를 자동화하며, 같은 모델이 코드를 작성하고 리뷰할 때 생기는 AI의 맹점을 잡아내는 패턴을 다룹니다. AI 보조 코드에 회귀 테스트 커버리지를 추가할 때, 또는 같은 모델이 변경 사항을 작성하고 리뷰했을 때 사용하세요.
metadata:
  origin: ECC
---

# AI 회귀 테스트

AI 보조 개발에 특화된 테스트 패턴입니다. 같은 모델이 코드를 작성하고 리뷰하기 때문에 체계적인 맹점이 생기며, 이 맹점은 자동화된 테스트만이 잡아낼 수 있습니다.

## 사용 시점

- AI 에이전트(Claude Code, Cursor, Codex)가 API 라우트나 백엔드 로직을 수정했을 때
- 버그를 발견하고 수정했으며, 같은 버그가 다시 들어오는 것을 막아야 할 때
- 프로젝트에 DB 없이 테스트할 수 있는 샌드박스/모의(mock) 모드가 있을 때
- 코드 변경 후 `/bug-check` 또는 이와 비슷한 리뷰 명령을 실행할 때
- 여러 코드 경로가 존재할 때(샌드박스 vs 운영 환경, 기능 플래그 등)

## 핵심 문제

AI가 코드를 작성한 뒤 자신의 작업을 리뷰하면, 두 단계 모두에 같은 가정을 그대로 가져갑니다. 그 결과 다음과 같은 실패 패턴이 예측 가능하게 반복됩니다.

```
AI가 수정 작성 → AI가 수정 리뷰 → AI가 "올바른 것 같다"고 판단 → 버그는 여전히 존재
```

**실제 사례** (운영 환경에서 관찰됨):

```
수정 1: API 응답에 notification_settings 추가
  → SELECT 쿼리에 추가하는 것을 잊음
  → AI가 리뷰했지만 놓침 (같은 맹점)

수정 2: SELECT 쿼리에 추가
  → TypeScript 빌드 에러 (생성된 타입에 해당 컬럼 없음)
  → AI가 수정 1은 리뷰했지만 SELECT 문제는 잡아내지 못함

수정 3: SELECT *로 변경
  → 운영 경로는 고쳤지만 샌드박스 경로를 빠뜨림
  → AI가 리뷰했지만 또다시 놓침 (4번째 발생)

수정 4: 테스트가 첫 실행에서 즉시 잡아냄 PASS:
```

패턴: **샌드박스/운영 경로 불일치**가 AI가 유발하는 회귀의 1순위 원인입니다.

## 샌드박스 모드 API 테스트

AI 친화적으로 설계된 대부분의 프로젝트에는 샌드박스/모의 모드가 있습니다. 이것이 DB 없이 빠르게 API를 테스트하는 핵심입니다.

### 설정 (Vitest + Next.js App Router)

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["__tests__/**/*.test.ts"],
    setupFiles: ["__tests__/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

```typescript
// __tests__/setup.ts
// 샌드박스 모드 강제 — DB 불필요
process.env.SANDBOX_MODE = "true";
process.env.NEXT_PUBLIC_SUPABASE_URL = "";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
```

### Next.js API 라우트용 테스트 헬퍼

```typescript
// __tests__/helpers.ts
import { NextRequest } from "next/server";

export function createTestRequest(
  url: string,
  options?: {
    method?: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
    sandboxUserId?: string;
  },
): NextRequest {
  const { method = "GET", body, headers = {}, sandboxUserId } = options || {};
  const fullUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;
  const reqHeaders: Record<string, string> = { ...headers };

  if (sandboxUserId) {
    reqHeaders["x-sandbox-user-id"] = sandboxUserId;
  }

  const init: { method: string; headers: Record<string, string>; body?: string } = {
    method,
    headers: reqHeaders,
  };

  if (body) {
    init.body = JSON.stringify(body);
    reqHeaders["content-type"] = "application/json";
  }

  return new NextRequest(fullUrl, init);
}

export async function parseResponse(response: Response) {
  const json = await response.json();
  return { status: response.status, json };
}
```

### 회귀 테스트 작성

핵심 원칙: **동작하는 코드가 아니라, 발견된 버그에 대해 테스트를 작성하라**.

```typescript
// __tests__/api/user/profile.test.ts
import { describe, it, expect } from "vitest";
import { createTestRequest, parseResponse } from "../../helpers";
import { GET, PATCH } from "@/app/api/user/profile/route";

// 계약 정의 — 응답에 반드시 포함되어야 하는 필드
const REQUIRED_FIELDS = [
  "id",
  "email",
  "full_name",
  "phone",
  "role",
  "created_at",
  "avatar_url",
  "notification_settings",  // ← 버그로 누락된 것을 발견한 뒤 추가
];

describe("GET /api/user/profile", () => {
  it("returns all required fields", async () => {
    const req = createTestRequest("/api/user/profile");
    const res = await GET(req);
    const { status, json } = await parseResponse(res);

    expect(status).toBe(200);
    for (const field of REQUIRED_FIELDS) {
      expect(json.data).toHaveProperty(field);
    }
  });

  // 회귀 테스트 — 이 정확한 버그가 AI에 의해 4번 유입됨
  it("notification_settings is not undefined (BUG-R1 regression)", async () => {
    const req = createTestRequest("/api/user/profile");
    const res = await GET(req);
    const { json } = await parseResponse(res);

    expect("notification_settings" in json.data).toBe(true);
    const ns = json.data.notification_settings;
    expect(ns === null || typeof ns === "object").toBe(true);
  });
});
```

### 샌드박스/운영 동등성 테스트

가장 흔한 AI 회귀는 운영 경로만 고치고 샌드박스 경로를 잊어버리거나(또는 그 반대) 하는 것입니다.

```typescript
// 샌드박스 응답이 기대하는 계약과 일치하는지 테스트
describe("GET /api/user/messages (conversation list)", () => {
  it("includes partner_name in sandbox mode", async () => {
    const req = createTestRequest("/api/user/messages", {
      sandboxUserId: "user-001",
    });
    const res = await GET(req);
    const { json } = await parseResponse(res);

    // partner_name이 운영 경로에만 추가되고
    // 샌드박스 경로에는 빠졌던 버그를 잡아낸 테스트
    if (json.data.length > 0) {
      for (const conv of json.data) {
        expect("partner_name" in conv).toBe(true);
      }
    }
  });
});
```

## 버그 체크 워크플로에 테스트 통합하기

### 커스텀 명령 정의

```markdown
<!-- .claude/commands/bug-check.md -->
# Bug Check

## Step 1: 자동 테스트 (필수, 건너뛸 수 없음)

코드 리뷰 전에 이 명령들을 먼저 실행:

    npm run test       # Vitest 테스트 스위트
    npm run build      # TypeScript 타입 체크 + 빌드

- 테스트 실패 → 최우선 버그로 보고
- 빌드 실패 → 타입 에러를 최우선 버그로 보고
- 두 가지가 모두 통과한 경우에만 Step 2로 진행

## Step 2: 코드 리뷰 (AI 리뷰)

1. 샌드박스 / 운영 경로 일관성
2. API 응답 형태가 프론트엔드 기대와 일치하는지
3. SELECT 절 완전성
4. 롤백을 포함한 에러 처리
5. 낙관적 업데이트 레이스 컨디션

## Step 3: 수정된 버그마다 회귀 테스트 제안
```

### 워크플로

```
사용자: "버그 체크해줘" (또는 "/bug-check")
  │
  ├─ Step 1: npm run test
  │   ├─ 실패 → 기계적으로 버그 발견 (AI 판단 불필요)
  │   └─ 통과 → 계속
  │
  ├─ Step 2: npm run build
  │   ├─ 실패 → 기계적으로 타입 에러 발견
  │   └─ 통과 → 계속
  │
  ├─ Step 3: AI 코드 리뷰 (알려진 맹점을 염두에 두고)
  │   └─ 발견 사항 보고
  │
  └─ Step 4: 각 수정에 대해 회귀 테스트 작성
      └─ 다음 버그 체크에서 수정이 깨졌는지 감지
```

## 흔한 AI 회귀 패턴

### 패턴 1: 샌드박스/운영 경로 불일치

**빈도**: 가장 흔함 (4건 중 3건의 회귀에서 관찰됨)

```typescript
// 실패: AI가 운영 경로에만 필드를 추가함
if (isSandboxMode()) {
  return { data: { id, email, name } };  // 새 필드 누락
}
// 운영 경로
return { data: { id, email, name, notification_settings } };

// 통과: 두 경로가 같은 형태를 반환해야 함
if (isSandboxMode()) {
  return { data: { id, email, name, notification_settings: null } };
}
return { data: { id, email, name, notification_settings } };
```

**이를 잡아내는 테스트**:

```typescript
it("sandbox and production return same fields", async () => {
  // 테스트 환경에서는 샌드박스 모드가 강제로 켜짐
  const res = await GET(createTestRequest("/api/user/profile"));
  const { json } = await parseResponse(res);

  for (const field of REQUIRED_FIELDS) {
    expect(json.data).toHaveProperty(field);
  }
});
```

### 패턴 2: SELECT 절 누락

**빈도**: Supabase/Prisma에서 새 컬럼을 추가할 때 흔함

```typescript
// 실패: 응답에 새 컬럼을 추가했지만 SELECT에는 넣지 않음
const { data } = await supabase
  .from("users")
  .select("id, email, name")  // notification_settings가 여기에 없음
  .single();

return { data: { ...data, notification_settings: data.notification_settings } };
// → notification_settings는 항상 undefined

// 통과: SELECT * 를 사용하거나 새 컬럼을 명시적으로 포함
const { data } = await supabase
  .from("users")
  .select("*")
  .single();
```

### 패턴 3: 에러 상태 누수

**빈도**: 보통 — 기존 컴포넌트에 에러 처리를 추가할 때

```typescript
// 실패: 에러 상태는 설정했지만 이전 데이터는 지우지 않음
catch (err) {
  setError("Failed to load");
  // reservations가 이전 탭의 데이터를 여전히 보여줌!
}

// 통과: 에러 시 관련 상태를 함께 초기화
catch (err) {
  setReservations([]);  // 오래된 데이터 제거
  setError("Failed to load");
}
```

### 패턴 4: 적절한 롤백 없는 낙관적 업데이트

```typescript
// 실패: 실패 시 롤백 없음
const handleRemove = async (id: string) => {
  setItems(prev => prev.filter(i => i.id !== id));
  await fetch(`/api/items/${id}`, { method: "DELETE" });
  // API가 실패하면 항목은 UI에서 사라졌지만 DB에는 남아 있음
};

// 통과: 이전 상태를 저장하고 실패 시 롤백
const handleRemove = async (id: string) => {
  const prevItems = [...items];
  setItems(prev => prev.filter(i => i.id !== id));
  try {
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("API error");
  } catch {
    setItems(prevItems);  // 롤백
    alert("削除に失敗しました");
  }
};
```

## 전략: 버그가 발견된 곳에 테스트 작성

100% 커버리지를 목표로 하지 마세요. 대신 다음과 같이 하세요.

```
/api/user/profile에서 버그 발견     → profile API 테스트 작성
/api/user/messages에서 버그 발견    → messages API 테스트 작성
/api/user/favorites에서 버그 발견   → favorites API 테스트 작성
/api/user/notifications에서 버그 없음 → 테스트 작성 안 함 (아직)
```

**AI 개발에서 이 방식이 효과적인 이유:**

1. AI는 **같은 범주의 실수**를 반복하는 경향이 있습니다
2. 버그는 복잡한 영역(인증, 다중 경로 로직, 상태 관리)에 몰려 있습니다
3. 한 번 테스트하면 그 정확한 회귀는 **다시 일어날 수 없습니다**
4. 테스트 수는 버그 수정과 함께 자연스럽게 늘어나며, 낭비되는 노력이 없습니다

## 빠른 참조

| AI 회귀 패턴 | 테스트 전략 | 우선순위 |
|---|---|---|
| 샌드박스/운영 불일치 | 샌드박스 모드에서 같은 응답 형태를 검증 |  높음 |
| SELECT 절 누락 | 응답에 필요한 모든 필드가 있는지 검증 | 높음 |
| 에러 상태 누수 | 에러 시 상태 정리를 검증 | 중간 |
| 롤백 누락 | API 실패 시 상태가 복원되는지 검증 | 중간 |
| 타입 캐스트가 null을 가림 | 필드가 undefined가 아님을 검증 | 중간 |

## 해야 할 것 / 하지 말아야 할 것

**해야 할 것:**
- 버그를 발견한 직후 바로 테스트를 작성 (가능하면 수정 전에)
- 구현이 아니라 API 응답 형태를 테스트
- 모든 버그 체크의 첫 단계로 테스트 실행
- 테스트를 빠르게 유지 (샌드박스 모드에서 전체 1초 미만)
- 테스트 이름을 막으려는 버그 이름을 따서 짓기 (예: "BUG-R1 regression")

**하지 말아야 할 것:**
- 한 번도 버그가 없었던 코드에 테스트 작성하지 않기
- AI의 자기 리뷰를 자동화된 테스트의 대체물로 믿지 않기
- "그냥 목 데이터일 뿐이다"라는 이유로 샌드박스 경로 테스트를 건너뛰지 않기
- 단위 테스트로 충분할 때 통합 테스트를 작성하지 않기
- 커버리지 퍼센트를 목표로 삼지 않기 — 회귀 방지를 목표로 삼기
