# ELI5 스킬: 확장 예시 참조

SKILL.md에서 참조하는 상세 패턴, 예시, 템플릿입니다.

**목적:** 이 파일에는 SKILL.md를 지나치게 길게 만들 수 있는 장황한 예시와 상세 패턴이 들어 있습니다. 더 자세한 지침이나 예시가 필요할 때 아래 섹션을 참고하세요.

---

## 목차

1. [콘텐츠 유형별 패턴](#1-content-type-specific-patterns) - 콘텐츠 유형별 전후 비교 전체 예시
2. [단순화 원칙](#2-simplification-principles) - 상세 작성 지침
3. [출력 형식 템플릿](#3-output-format-templates) - 구조와 서식 예시
4. [개선 제안 예시](#4-suggestions-for-enhancement) - 줄 단위 권장 사항 예시

---

## 1. 콘텐츠 유형별 패턴

## 콘텐츠 유형별 패턴

콘텐츠 유형이 감지되고 검증되면, 최적의 결과를 위해 유형별 단순화 패턴을 적용합니다.

### 개요 페이지 단순화

**목적:** 독자가 제품이나 기능이 무엇인지 빠르게 이해하고, 필요한지 판단하도록 돕습니다.

**필수 요소:**
- 시작 부분의 이점 설명 (어떤 문제를 해결하는지)
- 문제/해결/이점 구조
- "이런 분께 적합합니다" 자가 식별 섹션
- 빠른 시작 링크
- 기술 아키텍처는 하단으로 분리

**분석 초점:**
- 첫 문단이 "무엇"과 "왜"에 답하는가?
- 기능이 단순한 설명이 아니라 이점과 함께 설명되는가?
- 명확한 행동 유도(CTA)가 있는가?
- 기술 용어가 정의되었거나 분리되었는가?

**단순화 접근법:**

1. **이점으로 시작하기** - 기술적 설명을 가치 제안으로 바꿉니다
2. **문제 프레이밍** - 사용자가 겪는 과제로 시작합니다
3. **기능 → 이점 전환** - 기능 목록을 결과 중심 문장으로 바꿉니다
4. **자가 식별** - 사용자 시나리오가 담긴 "이런 분께 적합합니다"를 추가합니다
5. **기술 세부사항 분리** - 아키텍처를 접을 수 있는 섹션으로 옮깁니다

**패턴 예시:**

❌ **이전 (기술 중심):**
```markdown
## Product X

Product X is a distributed edge computing platform utilizing V8 
isolates for serverless code execution with sub-millisecond cold 
start performance.

Features:
- Global anycast network deployment
- Automatic scaling and load distribution
- Pay-per-request pricing model
```

✅ **이후 (이점 중심):**
```markdown
## Product X

Run code worldwide without managing servers. Deploy in seconds, 
scale automatically, pay only for what you use.

**What problem it solves:**
Maintaining global infrastructure is expensive and complex. Product X 
runs your code in 300+ cities automatically, handling all the 
infrastructure for you.

**Perfect for:**
- Applications needing fast global performance
- Teams wanting to skip server management
- Projects with variable traffic (scale from zero to millions)

[Get started in 5 minutes →]

---

**For technical users:** Built on V8 isolates with global anycast 
deployment. [Architecture details →]
```

---

### 개념 페이지 단순화

**목적:** 어떤 것이 왜 그런 방식으로 작동하는지에 대한 이해를 쌓습니다.

**필수 요소:**
- 시작 부분의 비유 또는 시각 자료 (누구나 이해할 수 있는)
- 쉬운 말로 된 정의
- "왜 중요한가" 비즈니스 가치
- 작동 방식 (단순화된 설명)
- 실제 사용 사례 (3~5개 구체적 시나리오)
- 고급 사용자를 위한 기술 세부사항 (분리)

**분석 초점:**
- 콘텐츠 초반에 비유가 있는가?
- 어떻게(HOW)보다 왜(WHY)를 먼저 설명하는가?
- 사용 사례가 구체적이고 현실적인가?
- 기술 세부사항이 명확하게 분리되었는가?

**단순화 접근법:**

1. **비유로 시작하기** - 머릿속 모델을 만들 수 있도록 기술과 가까운 비교를 사용합니다
2. **쉬운 영어 정의** - 전문 용어 없이 무엇인지 설명합니다
3. **가치 먼저** - 어떻게 작동하는지보다 왜 중요한지를 먼저 말합니다
4. **층위별 설명** - 단순 → 상세 → 기술적 순서로 설명합니다
5. **구체적 예시** - 추상적 개념이 아니라 실제 시나리오를 제시합니다

**패턴 예시:**

❌ **이전 (기술만 있음):**
```markdown
## Rate Limiting

Rate limiting implements token bucket algorithms to control request 
throughput based on configurable parameters including burst size and 
refill rate. Requests exceeding limits receive 429 status codes.
```

✅ **이후 (층위별 설명):**
```markdown
## Rate Limiting

**Think of it like:** A nightclub with maximum capacity. Even if 
1,000 people want to enter at once, you only let a controlled number 
in at a time to keep things manageable.

**What it is:**
Rate limiting controls how many requests can hit your website in a 
given time period. Without it, a sudden spike—whether from real 
users or attackers—could overwhelm your server.

**Why you need it:**
- Prevents DDoS attacks from taking your site down
- Stops bots from scraping your content
- Ensures fair usage across all users
- Keeps infrastructure costs predictable

**How it works:**
You set a rule like "100 requests per minute per IP address." When 
someone exceeds this limit, we block additional requests until the 
time window resets.

**Real scenarios:**
- E-commerce site during Black Friday preventing bot purchases
- API preventing scraping of product catalog
- Forum preventing spam post flooding

---

**For technical users:** Implements token bucket algorithm with 
configurable burst size and refill rates. Returns 429 status with 
Retry-After header. [Implementation details →]
```

---

### 방법 안내 페이지 단순화

**목적:** 사용자가 특정 작업을 성공적으로 완료하도록 돕습니다.

**필수 요소:**
- 맥락 (무엇을 달성하는지, 왜 하는지)
- 시작 전에 나열된 사전 준비 사항
- 기대 결과 명시
- 예상 소요 시간 (사소하지 않은 경우)
- 대시보드 경로 (UI 중심, 상세 단계)
- API/CLI 경로 (코드 중심, 접을 수 있는 섹션)
- 검증 단계
- 흔한 문제와 문제 해결

**분석 초점:**
- 단계 전에 맥락이 제공되는가?
- 사전 준비 사항이 명확하게 적혀 있는가?
- 대시보드 경로와 API 경로가 모두 있는가?
- 검증 단계가 포함되어 있는가?
- 흔한 함정이 다뤄져 있는가?

**단순화 접근법:**

1. **맥락 추가** - 무엇이 달성되는지와 이유
2. **사전 준비 사항 명시** - 시작 전에 충족되어야 할 조건
3. **여러 경로 안내** - 대시보드와 API/CLI 옵션 모두 제공
4. **단계에 주석 달기** - 헷갈리기 쉬운 부분에 메모 추가
5. **검증 포함** - 제대로 동작했는지 확인하는 방법
6. **함정 다루기** - 자주 겪는 문제

**패턴 예시:**

❌ **이전 (단계만 있음):**
```markdown
## Enable Feature

1. Navigate to Settings
2. Click Security
3. Toggle feature on
4. Save changes
```

✅ **이후 (맥락이 있는 다중 경로):**
```markdown
## Enable Feature

**What this does:** Protects your site from [specific threat] by 
[specific mechanism].

**Time required:** ~2 minutes  
**Prerequisites:** Admin access to your account

**What happens:** After enabling, all incoming requests will be 
[specific behavior]. You'll see results in Analytics within 5 minutes.

### Via Dashboard

1. Log into your dashboard at dash.example.com
2. Select your site from the list
3. In the left sidebar, click **Security**
4. Find **Feature Name** and toggle it **On**
5. Click **Save Changes**

💡 **Note:** Changes take effect immediately, but analytics may take 
5 minutes to update.

### Via API

<details>
<summary>Show API example</summary>

```bash
curl -X PATCH "https://api.example.com/v1/settings" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"feature_enabled": true}'
```

**Response:**
```json
{
  "success": true,
  "result": {
    "feature_enabled": true,
    "updated_at": "2026-02-09T10:30:00Z"
  }
}
```

[Full API documentation →]

</details>

## Verify It's Working

1. Visit your site in a new browser tab
2. Open browser Developer Tools (F12)
3. Check the Network tab for [specific header/behavior]
4. You should see [expected result]

## Troubleshooting

**Problem:** Feature doesn't seem to be active  
**Solution:** Clear your browser cache and wait 5 minutes for 
propagation. Still not working? Check that [prerequisite].
```

---

### 참조 페이지 단순화

**목적:** 포괄적인 기술 세부사항을 쉽게 이해할 수 있도록 제공합니다.

**필수 요소:**
- 시작 부분의 맥락 ("이것을 언제 사용하는지")
- 앞쪽에 배치된 흔한 시나리오
- 알파벳순이 아닌 사용 사례 중심 구성
- 이중 설명 (쉬운 영어 + 기술 사양)
- 각 항목에 대한 실용적 예시
- 실제 사용 시나리오

**분석 초점:**
- 콘텐츠가 사용 사례별로 정리되어 있는가, 아니면 알파벳순인가?
- 설명이 쉬운 말과 기술 용어를 모두 담고 있는가?
- 실용적인 예시가 포함되어 있는가?
- 옵션을 언제 사용해야 하는지에 대한 맥락이 있는가?

**단순화 접근법:**

1. **시작 맥락 추가** - 이 섹션을 언제 참조하는지
2. **사용 사례별로 재구성** - 가나다순이나 A-Z가 아닌 목적별로 묶습니다
3. **이중 설명** - 쉬운 설명 + 기술 사양
4. **예시 추가** - 예상 결과가 있는 실제 사용 예
5. **"언제 사용할지" 포함** - 결정 가이드

**패턴 예시:**

❌ **이전 (알파벳순 사양만 있음):**
```markdown
## Cache Headers

**Cache-Control:** Controls caching. Values: public, private, 
no-cache, max-age=seconds

**Expires:** HTTP date for expiration

**Pragma:** Legacy directive. Value: no-cache
```

✅ **이후 (사용 사례별 정리와 예시):**
```markdown
## Cache Headers Reference

**When to use:** Control how long content stays cached and who can 
cache it.

### Common Scenarios

**Scenario 1:** Static assets (images, CSS, JS) → Cache for 1 year  
**Scenario 2:** Blog posts → Cache for 1 hour  
**Scenario 3:** User dashboards → Never cache

---

## Headers by Purpose

### Long-Term Caching (Static Assets)

#### `max-age=31536000` (1 year)

**What it does:** Caches content for 1 year before checking for updates

**When to use:** Files that never change, like `logo-v2.png` or 
`style.abc123.css` with version hash in filename

**Technical spec:** Integer, seconds. Range: 0-31536000 (1 year max)

**Example:**
```http
Cache-Control: public, max-age=31536000, immutable
```

**Result:** First visitor downloads the file. For the next year, all 
visitors get the cached version with zero origin requests.

---

#### `immutable`

**What it does:** Tells browsers this file will literally never change

**When to use:** Combine with `max-age` for versioned assets 
(filename includes hash/version number)

**Technical spec:** No value. Presence activates directive.

**Example:**
```http
Cache-Control: public, max-age=31536000, immutable
```

**Result:** Browsers won't revalidate even on refresh. Perfect for 
`style.abc123.css` where hash changes when content changes.

---

### Frequently Updated Content

#### `max-age=3600` (1 hour)

**What it does:** Caches content for 1 hour

**When to use:** Content that updates occasionally but doesn't need 
to be real-time, like blog posts or product pages

**Technical spec:** Integer, seconds

**Example:**
```http
Cache-Control: public, max-age=3600
```

**Result:** Content stays cached for 1 hour. After expiration, next 
request checks origin for updates.

---

#### `no-cache`

**What it does:** Always check with origin before using cached version

**When to use:** Content that changes frequently but can still be 
cached briefly (shopping cart, personalized pages)

**Technical spec:** No value. Presence activates.

**Example:**
```http
Cache-Control: no-cache
```

**Result:** Every request checks origin via If-Modified-Since or 
ETag. If nothing changed, serves cached version (304 response).

---

### Never Cache

#### `private, no-store`

**What it does:** Prevents any caching

**When to use:** Sensitive data (account info, payment details) or 
highly dynamic content (real-time scores, live chat)

**Technical spec:** Combine both directives

**Example:**
```http
Cache-Control: private, no-store
```

**Result:** Every request fetches fresh from origin. Nothing cached 
anywhere.
```

---

### 튜토리얼 페이지 단순화

**목적:** 실제 적용을 통해 점진적으로 자신감을 쌓도록 가르칩니다.

**필수 요소:**
- 구체적인 예시가 있는 "무엇을 만들게 될지"
- 사전 준비 사항이 있는 "이런 분을 위한 것입니다"
- 소요 시간 추정
- 핵심 개념을 담은 "배우게 될 내용"
- 점진적 복잡도 (최소 → 전체 → 다듬어진 버전)
- 코드 블록 설명 ("이 코드가 하는 일")
- 문제 해결 섹션
- 선택적 개선 사항은 명확하게 표시

**분석 초점:**
- "무엇을 만들게 될지"로 시작하는가?
- 사전 준비 사항이 명확하게 적혀 있는가?
- 모든 코드 블록이 설명되어 있는가?
- 복잡도가 점진적으로 올라가는가?
- 흔한 문제가 다뤄져 있는가?

**단순화 접근법:**

1. **기대치 설정** - 무엇인지, 누구를 위한 것인지, 시간, 학습 목표
2. **최소한으로 시작** - 가장 단순한 버전으로 개념을 증명합니다
3. **점진적 확장** - 기능을 하나씩 추가합니다
4. **모든 코드 블록 설명** - 무엇을 하고 왜 하는지
5. **문제 해결** - 학습자가 자주 겪는 문제
6. **선택 사항 표시** - 확장 기능과 핵심 기능을 명확히 구분합니다

**패턴 예시:**

❌ **이전 (코드만 나열):**
```markdown
## Build X

```javascript
const handler = async (req) => {
  const url = new URL(req.url)
  return new Response('Hello')
}
addEventListener('fetch', e => e.respondWith(handler(e.request)))
```
```

✅ **이후 (설명이 있는 단계적 진행):**
```markdown
## Build a URL Shortener

### What You'll Build

A working URL shortener that redirects short links to long URLs, 
stores mappings, and tracks click analytics.

**Live example:** `short.example.com/github` → `github.com/cloudflare`

### Who This Is For

Developers comfortable with JavaScript. No prior experience with 
Workers needed, but you should understand:
- HTTP requests and responses
- JSON data format
- Basic async/await

### Time Required

30-45 minutes

### What You'll Learn

- How to handle requests at the edge
- Storing data in key-value storage
- Building a simple API
- Deploying code globally in seconds

---

## Step 1: Create Your First Worker

Let's start with the absolute minimum—a Worker that responds to 
requests:

```javascript
// Entry point: runs for every HTTP request
addEventListener('fetch', event => {
  // Pass request to our handler function
  event.respondWith(handleRequest(event.request))
})

// Handler: processes the request and returns a response
async function handleRequest(request) {
  return new Response('Your URL shortener will live here!', {
    headers: { 'content-type': 'text/plain' }
  })
}
```

**What this code does:**

- **Line 2:** Listens for incoming HTTP requests
- **Line 4:** Calls `handleRequest` to process each request
- **Line 8-12:** Returns a simple text response

**Test it:**

1. Deploy this code to Workers
2. Visit your Worker's URL
3. You should see: "Your URL shortener will live here!"

This proves your Worker is running. Now let's add actual functionality...

---

## Step 2: Add URL Parsing

Now let's make it recognize short codes in the URL:

```javascript
async function handleRequest(request) {
  // Extract the pathname from the URL
  // Example: https://short.example.com/github → "/github"
  const url = new URL(request.url)
  const shortCode = url.pathname.slice(1) // Remove leading "/"
  
  // For now, just echo back the short code
  return new Response(`You requested: ${shortCode}`, {
    headers: { 'content-type': 'text/plain' }
  })
}
```

**What changed:**

- **Line 3-4:** Parse the full URL to extract the path
- **Line 5:** Get the short code (everything after the `/`)
- **Line 8:** Echo it back so we can test

**Test it:**

1. Visit `your-worker.dev/test`
2. You should see: "You requested: test"
3. Try `your-worker.dev/abc123` → "You requested: abc123"

Now we can detect what short code someone's requesting...

---

## Step 3: Store URL Mappings

[Continue building progressively...]

---

## Common Issues

**Problem:** "Error: Exceeded CPU limit"

**Cause:** Your Worker is doing too much computation in a single request

**Solution:** Workers have a 50ms CPU time limit. Move heavy processing 
to background tasks or use Durable Objects for longer operations.

**Problem:** "KV data not updating"

**Cause:** KV is eventually consistent and may take 60 seconds to 
propagate globally

**Solution:** For testing, add a cache-busting parameter (`?v=2`) or 
wait 60 seconds between writes and reads.

---

## Optional Enhancements

Want to take this further? Here are some ideas:

**Add Click Analytics** (Medium difficulty)
- Store click count in KV
- Increment on each redirect
- Create stats endpoint

**Custom Short Codes** (Easy)
- Let users choose their short code
- Check if code is already taken
- Return error if unavailable

**Expiring Links** (Medium)
- Store expiration timestamp
- Check before redirecting
- Return 404 if expired
```

---

## Simplification Principles

---

## 2. 단순화 원칙

## 단순화 원칙

### 쉬운 언어 지침

**문장 구조:**

✅ **문장당 하나의 아이디어** (가능한 경우)
- "Webhooks send notifications. This happens when events occur."
- 나쁜 예: "Webhooks, which are HTTP callbacks, send notifications containing event data to your specified endpoint when certain events occur on the platform."

✅ **능동태** 사용 (수동태 대신)
- "The system sends a notification" 
- 나쁜 예: "A notification is sent by the system"

✅ **구체적인 명사** 사용 (추상적 명사 대신)
- "Your endpoint receives a POST request"
- 나쁜 예: "The interface abstraction layer facilitates data transmission"

✅ **같은 정확도라면 쉬운 단어** 사용
- "Use" not "utilize" → "utilize" 대신 "use"
- "Help" not "facilitate" → "facilitate" 대신 "help"
- "Start" not "initiate" → "initiate" 대신 "start"

✅ **짧은 문단** (최대 3~4문장)
- 훑어보고 소화하기 쉽습니다
- 시각적 여백을 줍니다
- 단일 주제에 집중하도록 돕습니다

**용어 처리:**

**처음 사용할 때 항상 정의하기:**
```markdown
An API (Application Programming Interface) defines how programs 
can request and exchange data...
```

**약어 풀어쓰기:**
```markdown
CDN (Content Delivery Network)
CI/CD (Continuous Integration/Continuous Deployment)
HMAC (Hash-based Message Authentication Code)
```

**기술 용어에 맥락 제공하기:**
```markdown
Not: "Configure the webhook endpoint."
But: "A webhook endpoint is the URL where we'll send notifications. 
Configure it to point to your server."
```

### 은유 만들기 (기술과 가까운 영역)

**좋은 은유의 조건:**

1. **익숙한 기술에 근거하기** - 독자가 알 만한 개념에서 출발합니다
2. **1:1 개념 대응** - 핵심 측면이 정확히 맞아떨어집니다
3. **혼란이 아니라 명료함** - 원래 개념보다 단순합니다
4. **한계 인정하기** - 은유가 어디서 깨지는지 밝힙니다

**은유 라이브러리 (핵심 예시):**

#### 1. API → 레스토랑 메뉴

```markdown
**Think of It Like:**
An API is like a restaurant menu. The menu shows you what dishes 
are available (endpoints), what customizations you can request 
(parameters like "no onions" or "extra spicy"), and what you'll 
receive (the response - your meal). You don't need to know how the 
kitchen operates or what cooking techniques they use. You just order 
from the menu, and the kitchen handles the rest.

**Where this breaks down:**
Unlike a restaurant where you wait for your food, API responses are 
usually near-instantaneous. Also, APIs can fail (kitchen is out of 
ingredients), requiring error handling.
```

#### 2. 캐싱 → 도서관 예약 데스크

```markdown
**Think of It Like:**
Caching is like a library's reserve desk. Popular books are kept at 
the front desk for quick access instead of requiring a trip to the 
stacks. The first person requesting a book triggers the librarian to 
fetch it from the stacks, but then it stays at the reserve desk so 
subsequent readers can grab it immediately.

**Where this breaks down:**
Caches expire (books eventually return to the stacks), and cache 
invalidation (deciding when to return books) is more complex than 
the metaphor suggests.
```

#### 3. 로드 밸런싱 → 식료품점 계산대 줄

```markdown
**Think of It Like:**
Load balancing is like grocery store checkout lanes. Instead of 
everyone lining up at a single register (which would create a huge 
wait), customers are distributed across multiple lanes. If one lane 
gets too long or a register breaks down, the store can redirect 
people to other lanes.

**Where this breaks down:**
Load balancers are more intelligent than checkout lane selection—they 
know which servers are healthy, how busy they are, and can route 
based on sophisticated algorithms.
```

#### 4. 웹훅 → 초인종 알림

```markdown
**Think of It Like:**
A webhook is like a doorbell notification. Instead of constantly 
checking your front door to see if someone arrived (polling), the 
doorbell alerts you the moment someone presses it (push notification). 
You only respond when there's actually something to respond to.

**Where this breaks down:**
Doorbells are instantaneous, while webhooks have some latency due to 
network transmission. Also, webhooks can fail if your server is down 
(like a broken doorbell).
```

#### 5. 인증 → 건물 보안 출입 카드

```markdown
**Think of It Like:**
Authentication is like a building security badge system. You present 
your badge (credentials) when entering. The system verifies you are 
who you claim to be (authentication), then checks what floors you're 
allowed to access (authorization). Different badges have different 
access levels.

**Where this breaks down:**
Digital authentication often uses time-limited tokens (like a badge 
that expires), and can verify identity through multiple methods 
(password + fingerprint), which isn't common with physical badges.
```

#### 6. 레이트 리미팅 → 고속도로 진입 미터링 신호등

```markdown
**Think of It Like:**
Rate limiting is like freeway on-ramp metering lights. Instead of 
letting everyone merge at once (causing congestion), the lights 
control how many cars enter per minute. This keeps traffic flowing 
smoothly on the main freeway. If you arrive too fast, you wait at 
the red light.

**Where this breaks down:**
Rate limits are often user-specific (you get your own limit), not 
shared like a metering light. Also, rate limits reset on schedules 
(every hour, every day), unlike continuous traffic flow.
```

#### 7. 데이터베이스 인덱싱 → 책의 색인

```markdown
**Think of It Like:**
A database index is like the index at the back of a textbook. Instead 
of reading every page to find mentions of "webhooks," you check the 
index, which tells you exactly which pages to look at. The index 
takes up extra space, but makes searching dramatically faster.

**Where this breaks down:**
Database indexes need updating when data changes (like keeping a 
book index current as you add pages), and choosing which fields to 
index involves tradeoffs between search speed and write speed.
```

#### 8. CDN → 지역 물류 창고

```markdown
**Think of It Like:**
A CDN (Content Delivery Network) is like having local warehouses 
instead of shipping everything from one central warehouse. When 
someone in California orders a product, it ships from the California 
warehouse (faster delivery). When someone in New York orders, it 
ships from New York. Same product, closer source.

**Where this breaks down:**
Unlike physical warehouses with unique inventory, CDNs store copies 
of the same content in many locations. Updates need to propagate to 
all locations (cache invalidation), which has no physical warehouse 
equivalent.
```

#### 9. 컨테이너 → 운송 컨테이너

```markdown
**Think of It Like:**
Software containers are like shipping containers. Before shipping 
containers existed, moving goods required different methods for 
different types of cargo. Shipping containers standardized this—put 
anything inside a standard container, and it can go on any ship, 
truck, or train. Software containers work the same way: package your 
application and its dependencies, and it runs anywhere.

**Where this breaks down:**
Shipping containers physically isolate cargo, while software 
containers share the same operating system kernel. Also, you can run 
thousands of software containers on one machine, unlike physical 
containers.
```

#### 10. 환경 변수 → 설정 패널

```markdown
**Think of It Like:**
Environment variables are like your application's settings panel—
configuration values that change behavior without modifying code. 
Just like you might set your phone to dark mode or adjust notification 
preferences, environment variables let you configure database URLs, 
API keys, or feature flags without rewriting your application.

**Where this breaks down:**
Environment variables are usually set before the application starts 
(not changed while running), and they're text-based rather than UI 
toggles. They're also specific to each deployment environment (dev, 
staging, production).
```

**새로운 은유 만들기:**

라이브러리에 없는 개념을 만나면, 다음과 같이 새로운 은유를 만듭니다:

1. 핵심 메커니즘이나 목적을 파악합니다
2. 독자가 이해할 가능성이 높은, 기술과 가까운 유사물을 찾습니다
3. 핵심 개념을 1:1로 대응시킵니다
4. 검증: 이 비유가 명확하게 하는가, 아니면 새로운 혼란을 만드는가?
5. 은유가 어디서 깨지는지 명시합니다

### 왜 중심 설명

**항상 다음 순서로 콘텐츠를 구성합니다:**

**1. 문제 (왜)**
```markdown
When building applications, you often need to know when something 
happens on another platform—like when a payment completes, a file 
finishes uploading, or a deployment succeeds. Constantly checking 
for updates (polling) wastes resources and creates delays.
```

**2. 해결책 (무엇)**
```markdown
Webhooks solve this by pushing notifications to you. When an event 
happens, we immediately send a message to your server with the details.
```

**3. 가치 (왜 중요한가)**
```markdown
This means:
- Your application responds in real-time instead of polling
- You save resources (no constant checking)
- Users get faster updates
- You only process events that actually happened
```

**4. 사용 사례 (언제)**
```markdown
Common scenarios:
- Triggering workflows when deployments complete
- Updating your database when content changes
- Sending notifications when payments are processed
- Syncing data between systems automatically
```

**5. 구현 (어떻게)**
```markdown
To set up a webhook:
1. Create an endpoint URL where we'll send notifications
2. Configure which events you want to receive
3. Verify requests are from us (using signatures)
4. Process the event data and take appropriate action
```

이 순서는 사람이 배우는 방식을 따릅니다: **작동 원리보다 목적을 먼저**.

### 다중 독자 계층화

여러 지식 수준의 독자를 동시에 고려합니다:

**혼합 독자를 위한 구조:**

```markdown
**In Plain Language:**
[One sentence anyone can grasp]

**What It Is:**
[2-3 paragraphs building from basics, no jargon assumed]

**Why It Matters:**
[Benefits applicable to all readers]

**When You'd Use This:**
[Scenarios showing practical value]

**Think of It Like:**
[Metaphor for conceptual understanding]

---

**For developers:**
Technical implementation details, API references, code examples

**For non-technical readers:**
Focus on outcomes, when to involve technical help, business impact
```

**실제 예시:**

```markdown
## Webhook Signature Verification

---

## 3. 출력 형식 템플릿

## 출력 형식 및 구조

### 생성 파일 템플릿

문서를 단순화할 때 다음 구조의 `.eli5.md` 파일을 만듭니다:

```markdown
# ELI5 Simplified: [Original Doc Name]

**Original:** `[file path]`  
**Simplified on:** [timestamp]  
**Sections simplified:** [list of sections]

---

## 📋 Simplification Overview

**What was confusing:**
- [Pattern 1 - e.g., Heavy acronym use without expansion]
- [Pattern 2 - e.g., Assumed understanding of HTTP protocols]
- [Pattern 3 - e.g., Jumped to implementation without explaining purpose]

**Approach taken:**
- [Strategy 1 - e.g., Added one-sentence summaries for each concept]
- [Strategy 2 - e.g., Expanded all acronyms on first use]
- [Strategy 3 - e.g., Added "Why this matters" to each section]
- [Strategy 4 - e.g., Created tech-adjacent metaphors for abstract ideas]

---

## Section: [Original Heading]

### 📄 Original Content

```
[Exact text from source, formatting preserved]
```

### ⚠️ Issues Identified

**Jargon:**
- `[term]` - [Why problematic, what's assumed]
- `[term]` - [Why problematic, what's assumed]

**Assumptions:**
- [What's assumed - e.g., "Assumes reader understands REST principles"]
- [What's assumed - e.g., "References 'the config file' without showing where"]

**Unclear Logic:**
- [Issue - e.g., "Jumps from concept to code without transition"]
- [Issue - e.g., "No explanation of why this approach was chosen"]

### ✨ Simplified Version

**In Plain Language:**  
[One crisp sentence capturing the essence without jargon]

**What It Is:**  
[2-3 paragraphs building understanding from basics. Define terms. 
Explain concepts. Build progressively. No jargon assumed.]

**Why It Matters:**  
[Value proposition and concrete benefits]

- **Benefit 1:** [Specific, concrete impact]
- **Benefit 2:** [Specific, concrete impact]
- **Benefit 3:** [Specific, concrete impact]

**When You'd Use This:**  

- **Scenario 1:** [Realistic use case with context]
  - Example: "When building a chat application that needs real-time message delivery..."

- **Scenario 2:** [Realistic use case with context]
  - Example: "When synchronizing inventory between your store and warehouse..."

- **Scenario 3:** [Realistic use case with context]
  - Example: "When triggering post-deployment tasks like cache clearing..."

**Think of It Like:**  
[Tech-adjacent metaphor with detailed explanation]

[Full metaphor explanation, making connections explicit]

**Where this metaphor breaks down:**  
[Acknowledge limitations honestly]

**Common Pitfalls:**  

- **Pitfall:** [What people commonly misunderstand]  
  **Reality:** [Correction with explanation]

- **Pitfall:** [Common mistake]  
  **Reality:** [How it actually works]

**Related Concepts:**  
[Connections to things readers might already know]

- "If you've used [familiar concept], this works similarly..."
- "This is the technical equivalent of [known idea]..."
- "Related to [concept], but differs in that..."

---

[Repeat structure for each section]

---

## 📊 Summary & Recommendations

**Key Improvements Made:**

1. **[Improvement category]**
   - [Specific change made]
   - [Impact on clarity]

2. **[Improvement category]**
   - [Specific change made]
   - [Impact on clarity]

3. **[Improvement category]**
   - [Specific change made]
   - [Impact on clarity]

**Patterns Noticed:**

[Meta-analysis of what made this documentation difficult]

- **Jargon overload:** [Details]
- **Assumption patterns:** [Details]
- **Structure issues:** [Details]
- **Missing context:** [Details]

**Recommendations for Future Writing:**

- [Suggestion 1 - e.g., "Define acronyms on first use"]
- [Suggestion 2 - e.g., "Start each section with 'why' before 'how'"]
- [Suggestion 3 - e.g., "Include at least one real-world use case per concept"]
- [Suggestion 4 - e.g., "Add metaphors for abstract concepts"]

---

## ✅ Next Steps

Review complete! What would you like to do next?

1. **Suggest additional improvements** - Identify other sections or refinements
2. **Create a PR** - Integrate these changes into the original documentation
3. **Refine specific sections** - Focus on particular areas that need more work
4. **Apply changes to original** - Update the source file with simplified content
5. **Keep as reference** - Use this comparison for review/learning only

Let me know how you'd like to proceed!
```

### 파일 이름 규칙

**입력:** `path/to/documentation.md`  
**출력:** `path/to/documentation.eli5.md`

**입력:** `api-reference.mdx`  
**출력:** `api-reference.eli5.mdx`

`.eli5` 접미사는 원래 형식의 확장자를 유지하면서 이것이 단순화된 버전임을 분명히 나타냅니다.

### 개선 제안 섹션

주요 단순화와 요약 이후, 접근성을 더 높일 수 있는 구체적인 기회를 짚어 주는 **"개선 제안"** 섹션을 포함합니다.

**형식:**

각 제안에는 다음이 포함됩니다:
- **줄 참조:** 원본 문서의 구체적인 위치
- **섹션 이름:** 이 제안이 적용되는 문서의 부분
- **현재 접근법:** 지금 있는 내용
- **제안된 개선:** 추가할 수 있는 내용
- **도움이 되는 이유:** 접근성 이점 설명
- **구현:** 개선 사항을 보여주는 구체적인 코드/예시

**예시:**

```markdown
---

## 📝 Suggestions for Enhancement

---

## 4. 개선 제안

## 📝 Suggestions for Enhancement

These suggestions show where additional patterns could improve accessibility:

### Line 45-52: Add Multi-Path Instructions

**Location:** Section "Enable Always Use HTTPS"  
**Current approach:** Dashboard-only instructions provided

**Suggested enhancement:** Add API path for technical users who prefer code

**Why this helps:**
- Serves both UI users and developers with their preferred method
- Technical users can automate the process via API
- Provides complete coverage for mixed audiences

**Implementation:**
```markdown
### Via API

<details>
<summary>Show API example</summary>

\`\`\`bash
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/{zone_id}/settings/always_use_https" \\
  -H "Authorization: Bearer {token}" \\
  -d '{"value":"on"}'
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "result": {
    "id": "always_use_https",
    "value": "on"
  }
}
\`\`\`

</details>
\`\`\`

---

### Line 78-85: Move Technical Details to Collapsible

**Location:** Section "How TLS Encryption Works"  
**Current approach:** Technical cipher suite details inline with main explanation

**Suggested enhancement:** Move advanced technical details to collapsible section

**Why this helps:**
- Beginners get the simple explanation without being overwhelmed
- Experts can expand for full technical depth
- Maintains clear progressive disclosure
- Reduces cognitive load for those learning basics

**Implementation:**
\`\`\`markdown
## How TLS Encryption Works

Your connection is encrypted using industry-standard TLS 1.3 protocol, 
ensuring no one can intercept your data in transit.

<details>
<summary>For technical users: Cipher suite details</summary>

We support TLS 1.3 with modern AEAD cipher suites including:
- TLS_AES_128_GCM_SHA256
- TLS_AES_256_GCM_SHA384
- TLS_CHACHA20_POLY1305_SHA256

Perfect forward secrecy via X25519 key exchange. [Full TLS configuration →]

</details>
\`\`\`

---

### Line 120-122: Add Recommended Default

**Location:** Encryption mode options comparison  
**Current approach:** Lists all options (Off, Flexible, Full, Full Strict) equally

**Suggested enhancement:** Call out recommended default for most users

**Why this helps:**
- Reduces decision paralysis for uncertain users
- Provides a safe starting point
- Guides users toward best security practices
- Acknowledges that not all users can evaluate tradeoffs

**Implementation:**
\`\`\`markdown
### Encryption Modes

**Recommended for most sites:** Full (Strict)

Provides maximum security by validating your origin server's 
certificate. This is the best option if your server has a valid SSL 
certificate installed.

#### Other Options

- **Off:** No encryption (Not recommended - only use for testing)
- **Flexible:** Encrypts visitor-to-Cloudflare only (Use if your 
  server doesn't have SSL)
- **Full:** Encrypts entire path but doesn't validate certificate
- **Full (Strict):** Maximum security with certificate validation ✅
\`\`\`

---

### Line 195-200: Add Concrete Use Case

**Location:** Feature description section  
**Current approach:** Abstract benefit statement without example

**Suggested enhancement:** Add realistic use case showing feature in action

**Why this helps:**
- Makes abstract benefits concrete and relatable
- Helps users visualize how they'd use this
- Provides "aha moment" of recognition
- Increases confidence in feature relevance

**Implementation:**
\`\`\`markdown
**Why you need it:**
Prevents attackers from overwhelming your site with fake traffic.

**Real scenario:**
An e-commerce site during Black Friday gets hit by bots trying to 
buy limited inventory. DDoS protection automatically filters out 
the bot traffic, letting real customers complete their purchases 
while the attack is absorbed across Cloudflare's network.

Without protection, the site would crash within minutes, losing 
thousands in sales.
\`\`\`
```

**제안을 포함할 때:**

다음의 경우 이 섹션을 포함합니다:
- 다중 경로 기회가 존재할 때 (대시보드 + API)
- 기술 세부사항을 접을 수 있을 때
- 권장 기본값이 빠져 있을 때
- 추상적 개념에 구체적인 예시가 필요할 때
- 점진적 공개를 개선할 수 있을 때
- 흔한 결정 지점에 안내가 부족할 때

**배치:**

제안 섹션은 다음 위치에 나타납니다:
- "Summary & Recommendations" 섹션 다음
- "Next Steps" 섹션 이전
- 제목과 설명으로 명확히 구분

이렇게 하면 제안을 실행 가능하게 만들면서도 주요 전후 비교를 어수선하게 만들지 않습니다.

---

## 중요한 지침

### 품질 체크리스트

단순화된 콘텐츠를 확정하기 전에 다음을 확인합니다:

- [ ] **기술적 정확성 유지** - 사실이 바뀌거나 지나치게 단순화되지 않았는가
- [ ] **한 문장 요약**이 전문 용어 없이 핵심을 담고 있는가
- [ ] **전문 용어가 식별**되어 설명되거나 대체되었는가
- [ ] **가정이 Issues 섹션에 명시**되었는가
- [ ] 설명에서 **"무엇"보다 "왜"가 먼저** 오는가
- [ ] **사용 사례가 현실적**이고 실용적인가
- [ ] **은유가 핵심 개념과 1:1 대응**하는가
- [ ] **은유의 한계가 인정**되었는가
- [ ] **흔한 함정이 실제로 흔한 것**인가 (지어낸 것이 아닌가)
- [ ] **어조가 전문적이고 존중하는** 수준인가
- [ ] **깔보는 표현이 없는가** ("simply," "just," "obviously")
- [ ] 전체에 걸쳐 **독자의 지능을 존중**하는가

### 어조 규칙

**다음과 같은 깔보는 표현은 절대 사용하지 않습니다:**

❌ "Simply configure the endpoint..."  
❌ "Just add the webhook URL..."  
❌ "Obviously, you'll need to..."  
❌ "Clearly, this requires..."  
❌ "As everyone knows..."  
❌ "It's easy to..."  
❌ "All you have to do is..."  

**다음과 같은 존중하는 표현을 사용합니다:**

✅ "To configure the endpoint, you'll need to..."  
✅ "Add the webhook URL by..."  
✅ "This requires..."  
✅ "Here's how this works..."  
✅ "This involves..."  
✅ "The process is..."  

### 정확성은 타협할 수 없습니다

**좋은 단순화:**
```markdown
Webhooks send HTTP POST requests to your endpoint URL whenever 
specified events occur. Think of it as a notification system where 
we call your server instead of you constantly checking ours.
```
*정확하고 명료하며, 은유를 효과적으로 사용함*

**나쁜 단순화:**
```markdown
Webhooks let programs talk to each other.
```
*너무 모호하고, 중요한 세부사항을 잃으며, 실제로 도움이 되지 않음*

**복잡한 정확성이 필요할 때:**

점진적 공개를 사용합니다:

```markdown
**Simplified:** Rate limiting controls how many requests you can 
make in a time period, like 100 requests per minute.

**More precisely:** Rate limits apply per API key and reset on a 
sliding window. If you hit the limit, you'll receive a 429 status 
code with a Retry-After header indicating when you can try again.
```

### 콘텐츠 유형별 처리

#### API 문서

다음에 집중합니다:
- 엔드포인트가 하는 일 (목적)
- 언제 사용하는지 (시나리오)
- 무엇을 보내는지 (매개변수 설명)
- 무엇을 돌려받는지 (응답 설명)
- 흔한 사용 사례
- 오류 처리 (무엇이 잘못될 수 있는지)

**다음을 통해 가치를 더합니다:**
- 타입뿐 아니라 매개변수의 목적 설명하기
- 현실적인 요청/응답 예시 보여주기
- 흔한 오해 바로잡기
- 실제 워크플로와 연결하기

#### 아키텍처 문서

다음에 집중합니다:
- 해결하려는 문제
- 이 접근법을 선택한 이유
- 이루어진 트레이드오프 (얻은 것과 잃은 것)
- 이 아키텍처가 적합한 경우
- 검토한 대안

**다음을 통해 가치를 더합니다:**
- 결정의 근거 설명하기
- 트레이드오프를 명시하기
- 선택에 대한 맥락 제공하기
- 비즈니스 요구사항과 연결하기

#### 코드 문서

다음에 집중합니다:
- 코드가 달성하는 것
- 이렇게 구조화된 이유
- 사용된 핵심 개념이나 패턴
- 주의해야 할 점

**다음을 통해 가치를 더합니다:**
- 쉬운 말로 된 "읽기 가이드"
- 자명하지 않은 선택 설명하기
- 복잡한 로직 명확히 하기
- 각 부분이 어떻게 맞물리는지 보여주기

## 엣지 케이스 및 처리

### 매우 긴 문서 (1000줄 초과)

**전략:**

1. **처리 옵션 제시:**
   - "This document has 1,500 lines across 25 sections. How would you like to proceed?"
   - 옵션 A: 모든 섹션 처리
   - 옵션 B: 특정 섹션에 집중 (목록 표시)
   - 옵션 C: 가장 복잡한 섹션 자동 감지
   - 옵션 D: 청크 단위로 처리 (1-10, 11-20 등)

2. **자동 감지 로직:**
   - 복잡도 밀도 계산 (100단어당 기술 용어 수)
   - 가정 지표 세기 ("as you know," 설명 없는 참조)
   - 사용 사례나 "왜" 설명이 없는 섹션 식별
   - 복잡도 점수가 가장 높은 섹션 우선 처리

3. **청크 처리:**
   - 한 번에 5~10개 섹션 처리
   - 부분 `.eli5.md` 파일 생성
   - 다음 청크 계속 진행 제안

### 이미 명확한 콘텐츠

**콘텐츠가 이미 잘 쓰여 있을 때:**

```markdown
## 📋 Simplification Overview

**What was done well:**
- Clear section headings with logical flow
- Terms defined on first use
- Good use of examples
- "Why" explained before "how"

**Minor improvements suggested:**
- Could add a tech-adjacent metaphor for [concept]
- Section 3 could benefit from a concrete use case
- Consider adding "common pitfalls" to section 5

**Overall assessment:**
This documentation is already quite accessible. The suggestions above 
are minor enhancements rather than necessary corrections.
```

**피해야 할 것:**
- 불필요한 장황함 추가하기
- 존재하지 않는 문제 만들기
- 명확한 내용을 과하게 설명하기
- 할 말을 만들기 위해 억지로 채우기

### 매우 기술적인 콘텐츠

**전략:**

1. **정확성을 최우선으로**
   - 부정확해질 정도로 단순화하지 않기
   - 중요한 기술 용어는 유지하기
   - 필요한 복잡성은 보존하기

2. **설명을 층위화하기**
   ```markdown
   **High-level:** [What it accomplishes]
   **How it works:** [Simplified mechanism]
   **Technical details:** [Precise specifications]
   ```

3. **설명 문단 추가하기**
   - 기술 사양은 바꾸지 않기
   - 쉬운 설명을 함께 추가하기
   - 복잡한 섹션에 "읽기 가이드" 제공하기

4. **점진적 공개 사용하기**
   - 가장 단순하고 유용한 설명으로 시작하기
   - 전체 기술 세부사항까지 확장하기
   - 어떤 섹션이 누구를 위한 것인지 분명히 하기

### 코드 중심 문서

**전략:**

1. **코드 자체는 단순화하지 않기**
   - 코드는 정확해야 함
   - 단순함을 위해 기능하는 코드를 다시 쓰지 않기
   - 기술적 정확성 보존하기

2. **설명 맥락 추가하기**
   ```markdown
   **What this code does:**
   [Plain-language explanation]

   **Why it's structured this way:**
   [Architectural rationale]

   **Key points to understand:**
   - [Important concept 1]
   - [Important concept 2]

   ```python
   [Original code, unchanged]
   ```
   ```

3. **"읽기 가이드" 만들기**
   - 복잡한 코드를 단계별로 살펴보기
   - 각 섹션이 달성하는 것 설명하기
   - 자명하지 않은 선택 강조하기

### 컴포넌트가 있는 MDX 파일

**전략:**

1. **산문 콘텐츠에 집중하기**
   - 문서 텍스트 단순화하기
   - 컴포넌트 코드는 그대로 두기

2. **컴포넌트의 목적 설명하기**
   ```markdown
   **What this component does:**
   The <CodeBlock> component displays syntax-highlighted code with 
   copy functionality, making it easier for readers to use the examples.
   ```

3. **React/프레임워크 세부사항은 설명하지 않기**
   - 문서가 그것에 관한 것이 아닌 한
   - 컴포넌트가 사용자에게 무엇을 달성하는지에 집중하기
   - 관련이 없다면 구현으로 깊이 들어가지 않기

## 향후 개선 사항

*향후 구현을 위해 문서화됨*

### 계획된 기능

**1. 인라인 코드 주석 읽기**

문서화가 포함된 코드 파일 지원:

```python
# Input: analyze.py
def process_webhook(payload, signature):
    """
    Processes incoming webhook notifications.
    
    Verifies signature, parses payload, triggers handlers.
    """
    # Implementation...
```

**계획된 동작:**
- docstring과 주석 추출하기
- 주석의 기술 언어 단순화하기
- 복잡한 로직에 설명 문단 추가하기
- "코드 워크스루" 가이드 생성하기

**지원 형식:**
- `.js`, `.ts`, `.tsx` (JavaScript/TypeScript)
- `.py` (Python)
- `.go` (Go)
- `.rb` (Ruby)
- `.java` (Java)

**2. 다중 형식 지원**

Markdown을 넘어서:

- **HTML 문서** - 웹 기반 문서 파싱 및 단순화
- **PDF 기술 논문** - 학술/연구 콘텐츠 추출 및 명확화
- **Confluence/Wiki 페이지** - 내부 문서 단순화
- **OpenAPI 스펙** - API 명세를 더 접근하기 쉽게 만들기

**3. 자동 복잡도 점수화**

정량적 분석:

- **Jargon density** - 100단어당 기술 용어 수
- **Readability scores** - Flesch-Kincaid, SMOG 지수
- **Assumption detection** - 가정된 지식을 나타내는 표현 표시
- **Context gap analysis** - 누락된 "왜"와 "언제" 설명 식별

**자동 우선순위 지정:**
- 복잡도 기준으로 섹션 정렬하기
- 가장 가치 높은 단순화에 집중하기
- 복잡도 보고서 생성하기

**4. 대화형 모드**

반복적 개선:

- 사용자 피드백을 받으며 섹션별로 처리하기
- 입력에 기반한 실시간 개선
- 반복 개선 사이클
- 다른 은유의 A/B 테스트

## 예시

### 예시 1: API 문서

**이전 (원본):**

```markdown
## POST /webhooks

Creates a webhook subscription for edge events.

### Parameters

- `endpoint` (string, required): HTTPS URL
- `events` (array, required): Event types
- `secret` (string, optional): HMAC signing key

### Response

Returns a `webhook` object.
```

**이후 (단순화):**

```markdown
### ✨ Simplified Version

**In Plain Language:**
Set up automatic notifications that we'll send to your server whenever 
specific events occur.

**What It Is:**
A webhook subscription tells our system to notify your application 
when certain events happen (like a deployment completing or content 
being published). Instead of your application constantly checking for 
updates (polling), we push notifications to you the moment events occur.

**Why It Matters:**
- **Real-time updates** - Your application responds immediately
- **Resource efficiency** - No wasted API calls checking for changes
- **Reliability** - You never miss an event
- **Automation** - Trigger workflows automatically

**When You'd Use This:**
- **Deployment notifications:** Trigger post-deployment tasks when builds complete
- **Content synchronization:** Update your CMS when content changes
- **Monitoring:** Alert your team when errors occur
- **Integration:** Connect multiple systems to respond to events

**Think of It Like:**
A webhook is like setting up a doorbell notification on your phone. 
Instead of constantly checking your front door camera to see if someone 
arrived (polling), the doorbell alerts you the moment someone presses 
it (push notification). You only respond when there's actually something 
to respond to.

**Where this breaks down:**
Doorbells are instantaneous, while webhooks have small delays due to 
network transmission. Also, webhooks can fail if your server is down 
(like a broken doorbell), so you need retry logic.

**Parameters Explained:**

- **`endpoint`** - The URL where we'll send notifications (your server's 
  address that listens for webhook events). Must use HTTPS for security.

- **`events`** - Which events you want to receive (like `deployment.succeeded` 
  or `content.published`). You choose only the events you care about.

- **`secret`** - Optional security key for verifying notifications actually 
  come from us. We use this to create a signature you can verify.

**Common Pitfalls:**

- **Pitfall:** Thinking webhooks are 100% reliable  
  **Reality:** Network issues or server downtime can cause missed notifications. 
  Implement retry logic and consider periodic polling as a backup.

- **Pitfall:** Not verifying signatures  
  **Reality:** Without signature verification, attackers could send fake 
  webhooks to trigger unauthorized actions.

**Related Concepts:**
If you've used RSS feeds, webhooks work similarly—both push updates to 
you. The difference is webhooks are programmable and work with any type 
of event, not just content updates.
```

### 예시 2: 아키텍처 결정

**이전 (원본):**

```markdown
## Edge Deployment Architecture

We've implemented a globally distributed edge architecture utilizing 
V8 isolates for multi-tenant execution with microsecond cold starts 
and automatic geographic distribution.
```

**이후 (단순화):**

```markdown
### ✨ Simplified Version

**In Plain Language:**
We run your code on servers located around the world, close to your 
users, making responses nearly instant regardless of where users are.

**What It Is:**
Traditional servers run in specific data centers—if your server is in 
Virginia and your user is in Singapore, every request travels across 
the world and back (adding hundreds of milliseconds). Our edge 
architecture runs your code on servers in hundreds of cities worldwide, 
so requests are handled by the nearest server.

**Why It Matters:**
- **Speed:** Users get responses in 10-50ms instead of 200-500ms
- **Reliability:** If one location fails, others continue serving traffic
- **Scale:** Handles traffic spikes automatically across all locations
- **Simplicity:** You deploy once; we handle global distribution

**When You'd Use This:**
- **Global applications:** Users are distributed worldwide
- **API endpoints:** Need fast response times everywhere
- **Dynamic content:** Content that can't be cached must still be fast
- **High availability:** Can't afford regional outages

**Think of It Like:**
Instead of one central warehouse shipping products nationwide (slow 
delivery to distant customers), you have local warehouses in every major 
city. When someone orders, it ships from their nearest warehouse. Same 
product, faster delivery, handled automatically.

**The Technical Approach:**

We use "V8 isolates"—lightweight execution environments that start in 
microseconds (thousandths of a millisecond). Traditional "serverless" 
functions use containers that take 50-500ms to start. Isolates are 
fast enough that we don't need to keep them warm; they start on-demand 
for each request.

**Why this architecture:**
We evaluated three approaches:

1. **Traditional servers:** Fast but requires manual geographic setup
2. **Container-based serverless:** Globally distributed but slow cold starts
3. **Isolate-based edge:** Global + fast (our choice)

**Tradeoff made:**
Isolates have some limitations compared to full containers (no arbitrary 
system libraries, limited execution time). We accepted these constraints 
for the massive speed improvement.

**Common Pitfalls:**
- **Pitfall:** Assuming it works like traditional servers  
  **Reality:** Stateless execution—no persistent local storage, no background jobs

- **Pitfall:** Expecting Node.js compatibility  
  **Reality:** Implements web standards, not full Node.js APIs

**Related Concepts:**
If you've used CDNs (Content Delivery Networks), this is similar but 
for code execution, not just static files. Like a CDN distributes 
content globally, we distribute code execution globally.
```

## 기억할 것

**당신의 임무:**
- 기술 개념을 접근 가능하게 만들기
- 기술적 정확성 유지하기
- 독자의 지능 존중하기
- 이해에 집중하기

**항상 포함할 것:**
- 한 문장짜리 쉬운 말 요약
- 명확한 "왜"와 "언제" 설명
- 한계가 있는 기술과 가까운 은유
- 수정과 함께 제시하는 흔한 함정
- 추상적 개념을 뒷받침하는 사용 사례

**품질 기준:**
- 기술적 정확성은 타협할 수 없음
- 은유는 혼란이 아니라 명료함을 주어야 함
- 어조는 전문적이고 존중하는 수준이어야 함
- 깔보는 언어는 절대 사용하지 않음

**절차:**
1. 어떤 섹션에 집중할지 묻기
2. 구체적인 문제 식별하기 (전문 용어, 가정, 논리, 맥락)
3. 완전한 전후 비교 생성하기
4. 다음 단계 안내하기

**출력:**
- 같은 디렉터리에 `.eli5.md` 파일 생성하기
- 섹션마다 필수 요소 모두 포함하기
- 실행 가능한 권장 사항 제공하기
- 명확한 다음 단계 옵션 제시하기

**철학:**
기술 전문성이 이해의 장벽이 되어서는 안 됩니다. 모든 사람은 명확하고 정확하며 존중하는 문서를 받을 자격이 있습니다.

---

**전체 철학과 상세 에이전트 지침은 다음을 참고하세요:** [agent.md](./agent.md)

**작업 예시는 다음을 참고하세요:** [examples/](./examples/)

**라이선스:** MIT  
**버전:** 1.0  
**최종 업데이트:** 2026년 2월
