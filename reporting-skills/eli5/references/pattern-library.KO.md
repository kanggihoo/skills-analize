# ELI5 패턴 라이브러리

기술 문서를 단순화하기 위한 재사용 가능한 before/after 패턴 모음입니다.

---

## 목적

이 라이브러리는 다음을 제공합니다.
- 일반적인 단순화 시나리오를 위한 **재사용 가능한 패턴**
- **전문 용어 → 쉬운 영어** 변환
- 변환을 보여 주는 **before/after 예시**
- 작성자와 AI 에이전트를 위한 **빠른 참조**

---

## 중요: 보수적 보강 패턴

**아래 모든 패턴은 최소한의 통합된 보강(1.5~2배 성장)을 보여 줍니다**

이 패턴들을 적용할 때:
- ✅ 별도의 주요 섹션이 아니라 인라인으로 추가
- ✅ 기존 콘텐츠 흐름에 통합
- ✅ 예시는 짧게 유지(각 5~15줄, 최대 1~2개)
- ✅ 원본 구조 보존
- ❌ 광범위한 새 섹션을 만들지 않기
- ❌ 다이어그램에 주석을 달지 않기
- ❌ 여러 예시를 추가하지 않기(최대 1~2개)

**패턴 해석 가이드:**

패턴이 "[section] 추가"를 보여 주면 → "별도의 주요 섹션을 만들라"가 아니라 "짧은 인라인 내용을 추가하라"로 해석합니다.

**예시:**
- 패턴 지시: "사용 사례 예시 추가"
- **올바름:** 개념과 함께 5~10줄짜리 예시를 인라인으로 추가
- **잘못됨:** 4개의 자세한 시나리오가 있는 별도의 "Use Case Examples" 섹션 만들기

**목표:** 원본 + 최소한의 유용한 맥락 = 원래 길이의 1.5~2배

---

## 전문 용어 → 쉬운 영어 사전

흔한 기술 용어와 쉬운 대체어:

| 기술 용어 | 쉬운 영어 | 맥락 예시 |
|----------------|---------------|-----------------|
| **Implement** | Set up, turn on, use | "Set up two-factor authentication" (not "Implement 2FA") |
| **Utilize** | Use | "Use the API" (not "Utilize the API") |
| **Leverage** | Use, take advantage of | "Take advantage of caching" (not "Leverage caching capabilities") |
| **Execute** | Run | "Run the command" (not "Execute the command") |
| **Instantiate** | Create | "Create a new Worker" (not "Instantiate a Worker") |
| **Terminate** | Stop, end | "Stop the process" (not "Terminate the process") |
| **Subsequently** | Then, next | "Then, configure the settings" (not "Subsequently, configure") |
| **Optimal** | Best | "Best performance" (not "Optimal performance") |
| **Facilitate** | Help, enable | "This helps you deploy faster" (not "Facilitates rapid deployment") |
| **Invoke** | Call, trigger | "Call the function" (not "Invoke the function") |
| **Provision** | Set up, create | "Set up your server" (not "Provision infrastructure") |
| **Egress** | Outgoing data | "Data leaving your network" (not "Egress traffic") |
| **Ingress** | Incoming data | "Data entering your network" (not "Ingress traffic") |
| **Anycast** | Routing to nearest server | "Automatically routes to the nearest location" (not "Anycast routing") |
| **Propagation** | Spreading, updating | "Changes spread globally" (not "Configuration propagates") |

---

## 패턴 0: 보수적 인라인 보강(새로움 — 이 패턴을 사용)

**이 패턴은 올바른 최소 보강 접근법을 보여 줍니다**

### 예시: Internal DNS 문서

**Before(원본 — 15줄):**
```markdown
# Internal DNS

Manage DNS records for your private network.

Internal DNS zones pair with Gateway resolver policies.

## Create a Zone

Use the dashboard or API to create an internal zone.

### Dashboard
1. Navigate to Internal DNS
2. Click Create Zone
3. Enter zone name
4. Click Save
```

**After(보강본 — 26줄, 1.73배 성장):**
```markdown
# Internal DNS

Manage DNS records for your private network without running your own DNS 
servers. This simplifies operations and integrates with Cloudflare Gateway.

Internal DNS zones pair with Gateway resolver policies to control DNS 
responses based on source IP, user identity, or domain.

**Example use case:** A multi-region company creates views for London and SF. 
Users query api.company.internal but get different IPs based on location 
(London users → 10.0.1.100, SF users → 10.0.2.100).

## Create a Zone

Create an internal zone that will contain your DNS records. Zones are only 
accessible via Gateway (not public DNS).

### Dashboard
1. Navigate to Internal DNS → Zones
2. Click **Create Zone**
3. Enter zone name (e.g., company.internal)
4. Click **Save** - Zone receives unique ID

**Verify:** Zone appears in zone list with type "internal"
```

**추가된 내용:**
- "왜"를 설명하는 1문장(자체 서버를 운영하지 않고) - 1줄
- 리졸버 정책에 대한 짧은 맥락(source IP, user identity) - 1줄
- 구체적인 예시 1개(3줄)
- 짧은 영역 설명(2줄)
- 단계별 인라인 맥락(2개 단계에 각 1줄) - 2줄
- 짧은 검증(1줄)
- **총 추가: 원본 15줄에 11줄 추가 = 26줄(1.73배)** ✅

**추가하지 않은 것:**
- "What Problem Does Internal DNS Solve?" 섹션 없음
- 본문 앞의 "How It Works (Conceptual)" 섹션 없음
- 다이어그램 주석 없음
- 광범위한 문제 해결 없음
- 포괄적인 테스트 섹션 없음
- "Best Practices" 섹션 없음
- 별도의 "Understanding Zones" 섹션 없음

**이 방식이 효과적인 이유:**
- 원래 구조를 완전히 보존
- 독자에게 필요한 곳에 인라인으로 맥락 추가
- 기반을 다지는 구체적인 예시 1개 제공
- 짧은 검증으로 독자가 성공을 확인하도록 도움
- 간결하고 훑어보기 쉬움

**모든 보강의 템플릿으로 이 패턴을 사용하세요**

---

## 패턴 1: 기술 중심 → 이점 중심

### Overview 페이지

**Before(기술 중심):**
```markdown
## Product X

Product X is a distributed edge computing platform utilizing V8 isolates 
for low-latency serverless code execution with sub-millisecond cold start 
performance and global anycast deployment.
```

**After(이점 중심):**
```markdown
## Product X

Run code worldwide without managing servers. Deploy in seconds, scale 
automatically, and pay only for what you use.

**What problem it solves:** Maintaining global infrastructure is expensive 
and complex. Product X runs your code in 300+ cities automatically.

**Perfect for:**
- Applications needing fast global performance
- Teams wanting to skip server management  
- Projects with variable traffic

[Get started →]
```

**이 방식이 효과적인 이유:**
- 명확한 사용자 가치로 시작
- 문제 프레이밍이 관련성을 만듦
- "Perfect for"가 자가 식별을 도움
- 기술 세부 사항은 분리됨

---

## 패턴 2: 추상적 개념 → 구체적인 비유

### Concept 페이지

**Before(추상적):**
```markdown
## Caching

Caching stores frequently accessed data in high-speed storage layers to 
reduce origin server load and improve response times through data locality 
optimization.
```

**After(구체적):**
```markdown
## Caching

**Think of it like:** A library's reserve desk. Popular books stay at the 
front desk for quick access instead of requiring trips to the distant stacks.

**What it is:** Caching keeps copies of your frequently accessed files 
(images, CSS, JavaScript) close to users, so they load instantly instead of 
being fetched from your origin server every time.

**Why it matters:**
- Pages load 10x faster (50ms vs 500ms)
- Reduces server costs (fewer origin requests)
- Handles traffic spikes (serves from cache, not origin)

**When to use:** Any content that doesn't change constantly—images, stylesheets, 
blog posts, product pages.
```

**이 방식이 효과적인 이유:**
- 비유가 즉각적인 멘탈 모델을 만듦
- 쉬운 설명이 이해를 쌓음
- 이점이 구체적이고 측정 가능함
- 사용 사례가 실행 가능하게 만듦

---

## 패턴 3: 단계만 → 맥락이 있는 다중 경로

### How To 페이지

**Before(단계만):**
```markdown
## Enable Feature X

1. Go to Settings
2. Click Security
3. Toggle Feature X to On
4. Save
```

**After(맥락이 있는 다중 경로):**
```markdown
## Enable Feature X

**What this does:** Protects your site from [specific threat] by [mechanism].

**Time:** ~2 minutes  
**Prerequisites:** Admin access

### Via Dashboard

1. Log into your dashboard at dash.example.com
2. Select your site from the list
3. Click **Security** in the left sidebar
4. Find **Feature X** and toggle it **On**
5. Click **Save Changes** at the bottom

💡 **Note:** Changes take effect immediately. Check Analytics in 5 minutes 
to see it working.

### Via API

<details>
<summary>API 예시 보기</summary>

```bash
curl -X PATCH "https://api.example.com/v1/settings" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"feature_x_enabled": true}'
```

**Response:**
```json
{
  "success": true,
  "result": {"feature_x_enabled": true}
}
```

</details>

## Verify It Worked

1. Visit your site in a new tab
2. Check browser DevTools → Network tab
3. Look for [specific indicator]
4. You should see [expected result]
```

**이 방식이 효과적인 이유:**
- 맥락이 단계 전에 목적을 설명
- 선행 조건이 혼란을 막음
- UI 경로와 API 경로가 서로 다른 사용자를 위해 제공됨
- 검증이 확신을 줌

---

## 패턴 4: 알파벳 순 사양 → 사용 사례 중심 구성

### Reference 페이지

**Before(알파벳 순):**
```markdown
## Headers

**Cache-Control:** Controls caching behavior. Values: public, private, no-cache

**Content-Type:** MIME type. Examples: text/html, application/json

**Expires:** Cache expiration date. Format: HTTP-date
```

**After(사용 사례 중심 구성):**
```markdown
## Headers by Purpose

### Controlling Cache Behavior

**When to use:** Make your site faster by controlling what gets cached and 
for how long.

#### Long-Term Caching (Static Assets)

**`Cache-Control: public, max-age=31536000`**

**What it does:** Caches content for 1 year

**When to use:** Files that never change, like `logo-v2.png` or 
`style.abc123.css` with version hash in filename

**Example:**
```http
Cache-Control: public, max-age=31536000, immutable
```

**Result:** First visitor downloads. Next year, everyone gets the cached 
version instantly.

---

#### Fresh Content (Blog Posts)

**`Cache-Control: public, max-age=3600`**

**What it does:** Caches for 1 hour

**When to use:** Content that updates occasionally—blog posts, product pages

**Example:**
```http
Cache-Control: public, max-age=3600
```

**Result:** Cached for 1 hour. After that, we check for updates.

---

### Setting Content Type

**When to use:** Tell browsers what type of content they're receiving.

[Continue pattern...]
```

**이 방식이 효과적인 이유:**
- 알파벳이 아니라 작업 기준으로 구성
- 쉬운 영어 + 기술 사양(두 단계 설명)
- 기대 결과가 있는 실제 예시
- "When to use"가 결정 안내를 제공

---

## 패턴 5: 코드 덤프 → 설명이 있는 단계적 진행

### Tutorial 페이지

**Before(코드 덤프):**
```markdown
## Build X

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  return new Response('Hello')
}
```
```

**After(설명이 있는 단계적 진행):**
```markdown
## Build X

### What You'll Build

A working [specific thing] that [specific capability].

**Example:** `short.example.com/abc` → `github.com/cloudflare`

### Who This Is For

Developers comfortable with JavaScript. No prior experience needed with 
[platform], but you should understand HTTP requests and JSON.

### Time: 30 minutes

---

## Step 1: Minimal Working Version

Let's start with the absolute minimum—proof the concept works:

```javascript
// 진입점: 들어오는 HTTP 요청을 수신
addEventListener('fetch', event => {
  // 요청을 핸들러 함수로 전달
  event.respondWith(handleRequest(event.request))
})

// 핸들러: 각 요청을 처리
async function handleRequest(request) {
  return new Response('Hello! It works!', {
    headers: { 'content-type': 'text/plain' }
  })
}
```

**What this code does:**
- **Line 2:** Listens for HTTP requests to your Worker
- **Line 4:** Calls `handleRequest` to process each request  
- **Line 8-12:** Returns a simple text response

**Test it:**
1. Deploy this code
2. Visit your Worker's URL
3. You should see: "Hello! It works!"

Great! Your Worker is running. Now let's add real functionality...

## Step 2: Parse URLs

[Continue building progressively with explanations...]
```

**이 방식이 효과적인 이유:**
- 처음부터 명확한 기대를 설정
- 모든 코드 블록을 설명
- 점진적으로 진행(최소 → 전체)
- 각 단계마다 테스트 포함

---

## 공통 변환

### 변환 1: 기능 목록 → 문제/해결

**Before:**
```markdown
Features:
- Global anycast network
- Automatic scaling
- Pay-per-request pricing
```

**After:**
```markdown
**What you get:**
- **Fast everywhere:** Code runs in 300+ cities, close to every user
- **Auto-scaling:** Handles 10 requests or 10 million without configuration
- **Cost-efficient:** Pay only when code runs, not for idle servers
```

### 변환 2: 전문 용어 설명 → 계층화된 이해

**Before:**
```markdown
DDoS mitigation employs anycast architecture to distribute volumetric attacks 
across our edge network, utilizing L3/L4 packet inspection and L7 behavioral 
analysis.
```

**After:**
```markdown
**In plain language:** Stops attackers from overwhelming your site with fake traffic.

**How it protects you:** We have 300+ data centers. When an attack hits, we 
spread it across all locations—like opening thousands of doors instead of one. 
We also identify and block fake visitors before they reach your site.

**What happens:** Your real visitors get through normally while attack traffic 
is filtered out automatically.

<details>
<summary>기술 사용자용</summary>

Anycast distributes L3/L4 volumetric attacks across the network. L7 protection 
uses JS challenges and behavioral fingerprinting. [Architecture details →]

</details>
```

### 변환 3: 전제 지식 → 명시적 선행 조건

**Before:**
```markdown
Configure your A record to point to the anycast IP.
```

**After:**
```markdown
Update your DNS A record to point to Cloudflare's IP address.

**What's an A record?** It's the DNS entry that tells the internet where your 
website lives (like an address in a phone book).

**Where to find it:** In your domain registrar's DNS settings (GoDaddy, Namecheap, 
etc.). Look for "DNS Management" or "DNS Settings."

**What to enter:** 
- Type: A
- Name: @ (means your root domain)
- Value: 192.0.2.1 (our IP address)
```

---

## 비유 템플릿

### 템플릿: API 설명
```markdown
**Think of it like:** [Familiar interface concept]

An API is like a restaurant menu. It shows you:
- What's available to order (endpoints)
- What details you need to provide (parameters: "no onions, extra cheese")
- What you'll get back (response: your meal)
- Pricing (rate limits, quotas)

You don't need to know how the kitchen works. Just order from the menu.

**Where this breaks down:** Unlike restaurants where you wait, API responses 
are usually instant. Also, APIs can return errors if your "order" is invalid.
```

### 템플릿: 보안 기능 설명
```markdown
**The threat:** [What attackers do]

Attackers try to [specific attack method] which could [consequence] to your site.

**How [Feature] protects you:** [Protection mechanism in plain language]

Think of it like [security analogy]:
[Concrete comparison that shows the protection model]

**What happens automatically:**
- [Protection 1]
- [Protection 2]

**What you control:**
- [Setting 1]
- [Setting 2]
```

### 템플릿: 인프라 개념
```markdown
**What it is:** [One-sentence plain English definition]

**Real-world comparison:** 
[Physical/familiar tech analog that maps 1:1 to key concepts]

**Why it matters:**
- [Benefit 1 with measurable impact]
- [Benefit 2 with measurable impact]

**Common use case:**
[Specific realistic scenario showing it in action]

**Technical details:** [In collapsible section or bottom]
```

---

## 빠른 패턴 참조

### 다음을 보면 → 이렇게 하세요

| **원본** | **변환 방향** |
|--------------|------------------|
| 기술 아키텍처가 먼저 나옴 | 문제 → 해결책 → 이점 |
| 추상적인 개념 | 비유 → 쉬운 설명 → 기술 설명 |
| 맥락 없는 단계 | 맥락 → 선행 조건 → 다중 경로 단계 |
| 알파벳 순 레퍼런스 | 사용 사례 그룹 → 두 단계 설명 |
| 설명 없는 코드 | 만들 것 → 점진적 단계 → 설명된 블록 |
| 기능 목록 | 이점이 있는 문제/해결 쌍 |
| 정의 없는 전문 용어 | 인라인으로 정의하거나 쉬운 대체어 사용 |
| "왜"가 없음 | 가치 제안을 앞에 추가 |
| 사용 사례 없음 | 현실적인 시나리오 3~5개 추가 |
| 지식을 가정함 | 선행 조건을 명시 |

---

## 모범 사례 요약

### 할 것:
✅ 이점과 해결하는 문제로 시작  
✅ 명시된 한계가 있는 기술 기반 비유 사용  
✅ Dashboard 경로와 API 경로를 모두 제공  
✅ 알파벳이 아니라 사용 사례 기준으로 구성  
✅ 모든 코드 블록을 설명  
✅ 단계 전에 선행 조건을 명시  
✅ 검증/테스트 섹션 포함  
✅ "기술 사용자용" 접을 수 있는 섹션 추가  

### 하지 말 것:
❌ 기술 아키텍처로 시작하기  
❌ 생색내는 언어 사용("simply", "just", "obviously")  
❌ 전제 지식을 명시하지 않고 가정하기  
❌ 한 가지 인터페이스 경로만 제공하기(Dashboard 또는 API 중 하나만)  
❌ 맥락 없이 사양을 알파벳 순으로 나열하기  
❌ 설명 없이 코드 떨구기  
❌ "왜"를 건너뛰고 "어떻게"로 빨리 가기  
❌ 간결함을 위해 정확성 희생하기  

---

**문서 버전:** 1.0  
**최종 수정:** 2026년 2월  
**라이선스:** MIT
