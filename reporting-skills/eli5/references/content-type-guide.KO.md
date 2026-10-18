# 콘텐츠 유형 가이드

문서 유형을 판별하고 단순화하기 위한 실무 가이드입니다.

---

## 목적

이 가이드는 다음을 제공합니다.
- 콘텐츠 유형을 식별하기 위한 **판별 기준**
- 유형별 **필수 요소** 체크리스트
- 유형별 **단순화 패턴**
- 실무 사용을 위한 **빠른 참조**

---

## 중요: 보수적인 보강 지침

**목표 확장 분량: 원본 콘텐츠 길이의 1.5~2배**

아래 각 콘텐츠 유형의 보강 패턴은 구조를 재편하거나 크게 확장하는 것이 아니라, 최소한의 맥락과 예시만 추가하도록 설계되었습니다.

**공통 제약:**
- 주요 개념당 예시는 최대 1~2개
- 각 예시는 5~15줄
- 인라인 "왜" 설명은 1~2문장
- 다이어그램 주석 없음
- 원본 구조 전부 보존
- 본문 앞에 오는 별도의 개념 섹션 없음
- 문제 해결은 간단히만(튜토리얼은 1~2개 문제만)
- 테스트 안내는 최소한으로(튜토리얼은 명령어 3~5개)

**아래 패턴이 "Add [section]"을 제안할 때의 의미:**
- "별도의 주요 섹션을 만들라"가 아니라 "인라인으로 보강하라"로 해석합니다
- 추가 내용은 짧고 본문에 자연스럽게 녹여 넣습니다
- 목표는 5~10배가 아니라 1.5~2배 확장입니다

---

## 콘텐츠 유형 개요

| 유형 | 목적 | 핵심 패턴 | 예시 |
|------|---------|-------------|---------|
| **Overview(개요)** | 독자가 이것이 필요한지 판단하도록 돕기 | 문제 → 해결책 → 이점 | 제품 랜딩 페이지 |
| **Concept(개념)** | "왜"에 대한 이해 쌓기 | 비유 → 쉬운 설명 → 기술 설명 | "What is rate limiting?" |
| **How To(방법)** | 작업 완료 돕기 | 맥락 → 여러 경로의 단계 | "Enable HTTPS" |
| **Reference(레퍼런스)** | 포괄적인 사양 제공 | 사용 사례 중심 구성 | API 매개변수, 헤더 |
| **Tutorial(튜토리얼)** | 실습을 통해 가르치기 | 만들기 → 개선 → 다듬기 | "Build a URL shortener" |

---

## 1. Overview 페이지

### 판별 기준

**찾아볼 것:**
- 제목이나 H1에 제품/기능 이름
- 기능 목록 또는 역량 설명
- "What is [Product]" 섹션
- 이점 진술 또는 가치 제안
- "Get started" 또는 행동 유도 링크
- 단계별 안내가 없음

**확신을 높이는 신호:**
- 여러 기능을 간략히 설명
- 높은 수준의 제품 설명
- 자세한 문서로 연결되는 링크
- "Perfect for" 또는 사용 사례 섹션
- 가격 또는 요금제 정보

**예시 제목:**
- "Cloudflare Workers"
- "Introduction to Gateway"
- "What is Workers KV?"

### 필수 요소 체크리스트

- [ ] 열린 이점 진술(어떤 문제를 해결하는지)
- [ ] 문제/해결/이점 구조
- [ ] "Perfect for" 자가 식별 섹션
- [ ] 명확한 행동 유도("Get started" 링크)
- [ ] 사양이 아니라 이점을 담은 기능 설명
- [ ] 기술 아키텍처는 분리되었거나 접혀 있음

### 단순화 패턴(보수적)

**목표: 원본 길이의 1.5~2배**

**최소 추가:**
1. **문제 진술 2~4문장 추가**(완전히 없는 경우) — 문서 시작 부분에
2. **사용 사례 예시 1~2개를 인라인으로 추가**(각 5~10줄) — 누가 혜택을 받는지 보여 주기
3. **기능 소개 시 인라인 "왜" 추가**(1문장)
4. **처음 등장할 때 전문 용어 정의**(짧은 인라인 정의)

**보존할 구조:**
- 원래의 시작 부분과 제목 유지
- 섹션을 재구성하지 않기
- 아키텍처를 옮기지 않기(도입부를 짧게 추가하는 것은 가능)

**예시 보강:**

원본(8줄):
```markdown
# Internal DNS

Manage DNS records for your private network.

Internal DNS zones pair with Gateway resolver policies to control 
DNS query responses.

## Features
- Create internal zones
- Configure views
- Link to Gateway
```

보강본(15줄 — 1.9배):
```markdown
# Internal DNS

Manage DNS records for your private network without running your own DNS 
servers. This simplifies operations and integrates with Cloudflare Gateway.

Internal DNS zones pair with Gateway resolver policies to control DNS query 
responses based on context (source IP, user identity, domain).

**Example use case:** A multi-region company creates separate views for London 
and SF offices. Users query the same hostname (api.company.internal) but get 
different IP addresses based on location.

## Features
- Create internal zones - Private namespaces accessible only via Gateway
- Configure views - Logical groupings that route different users to different resources
- Link to Gateway - Resolver policies determine which view to use
```

추가된 내용:
- "왜" 1문장(서버를 직접 운영하지 않고)
- 영역(zone)에 대한 짧은 맥락(source IP, user identity)
- 예시 1개(3줄)
- 기능별 인라인 정의(각 1문장)
- 합계: 원본 8줄에 7줄 추가 = 15줄(1.9배) ✅

### 흔한 문제와 수정(보수적 접근)

- **기술 아키텍처로 시작** → 그 앞에 1~2문장짜리 이점 도입부 추가(아키텍처는 옮기지 않음)
- **맥락 없는 기능 목록** → 짧은 인라인 설명 추가(기능당 1문장)
- **사용 사례 누락** → 구체적인 예시 1개를 인라인으로 추가(5~10줄)
- **도입부의 전문 용어** → 처음 등장할 때 정의(괄호 또는 짧은 절)
- **"왜"가 없음** → 해결하는 문제를 설명하는 1문장 추가

---

## 2. Concept 페이지

### 판별 기준

**찾아볼 것:**
- "What is..." 또는 "Understanding..." 제목
- 절차가 아닌 설명 내용
- "How it works" 섹션
- 개념 다이어그램 또는 설명
- "Why" 설명
- 비유나 은유(때때로)

**확신을 높이는 신호:**
- 단계가 아니라 메커니즘을 설명
- 교육적인 어조
- 관련 개념으로 연결되는 링크
- 이론이 실습보다 먼저 나옴
- 여러 설명 방식

**예시 제목:**
- "Understanding Rate Limiting"
- "How Caching Works"
- "What is Edge Computing?"

### 필수 요소 체크리스트

- [ ] 모두가 이해할 수 있는 열린 비유/시각 자료
- [ ] 쉬운 언어의 정의
- [ ] "왜 중요한가"의 비즈니스 가치
- [ ] 동작 방식(단순화된 설명)
- [ ] 실제 사용 사례(3~5개 시나리오)
- [ ] 고급 사용자를 위한 기술 세부 사항(분리됨)
- [ ] 관련 개념 링크

### 단순화 패턴

**구조:**
```markdown
# [Concept Name]

**Think of it like:** [Tech-adjacent analogy]

**What it is:** [Plain English definition without jargon]

**Why you need it:**
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

**How it works:** [Simplified technical explanation]

**Real scenarios:**
- [Use case 1 with context]
- [Use case 2 with context]
- [Use case 3 with context]

---

**For technical users:**
[Technical implementation, architecture, algorithms]
```

### 흔한 문제와 수정

- **전문 용어가 먼저 나옴** → 비유로 시작
- **"왜"가 없음** → 비즈니스 가치/이점 섹션 추가
- **추상적인 예시** → 구체적이고 현실적인 시나리오 사용
- **계층화가 없음** → 점진적 공개 추가(쉬움 → 기술적)
- **묻혀 있는 기술 세부 사항** → 명확하게 분리

---

## 3. How To 페이지

### 판별 기준

**찾아볼 것:**
- 제목의 동작 동사(Configure, Enable, Create, Set up)
- 번호가 매겨진 단계나 절차
- "Prerequisites" 섹션
- 스크린샷 또는 UI 안내
- "Verify" 또는 "Test" 섹션
- 명령어 예시 또는 코드 블록

**확신을 높이는 신호:**
- 명확한 순차 구조
- 구체적이고 실행 가능한 단계
- 도구/UI 참조
- 기대 결과가 명시됨
- 문제 해결 섹션

**예시 제목:**
- "Enable Always Use HTTPS"
- "Configure DNS Settings"
- "Create a Worker"

### 필수 요소 체크리스트

- [ ] 맥락(이것이 무엇을 달성하는지, 왜 필요한지)
- [ ] 선행 조건을 앞에 나열
- [ ] 기대 결과 명시
- [ ] 소요 시간 추정(5분 초과 시)
- [ ] Dashboard 경로(굵은 요소가 있는 UI 단계)
- [ ] API/CLI 경로(접을 수 있는 영역의 코드 예시)
- [ ] 검증 단계("성공했는지 확인하는 방법")
- [ ] 흔한 문제 해결

### 단순화 패턴(보수적)

**목표: 원본 길이의 1.5~2배**

**How To 가이드는 기존 단계를 유지하고 최소한의 맥락만 추가합니다:**

**최소 추가:**
1. **"이것이 달성하는 것" 1~2문장을 상단에 추가**(없는 경우)
2. **중요하지 않은 단계에 인라인 "왜" 추가**(1문장)
3. **언제 이것을 쓰는지 보여 주는 예시 1개 추가**(3~5줄)
4. **검증을 짧게 추가**(완전히 없는 경우 2~3개 명령어)
5. **치명적인 실패에 대한 문제 해결 메모 1~2개만 추가**

**보존:**
- 원래의 단계 번호와 흐름
- 기존 Dashboard/API 경로(새로 만들지 않기)
- 모든 스크린샷과 UI 요소
- 기존 구조

**예시 보강:**

원본(12줄):
```markdown
# Create a DNS View

## Dashboard

1. Go to Internal DNS
2. Click Create View
3. Enter view name
4. Select zones to include
5. Click Save

## API

Use the create view endpoint with zone IDs.
```

보강본(20줄 — 1.67배):
```markdown
# Create a DNS View

Create a logical grouping of zones that determines which DNS records users see. 
Useful for multi-region setups or environment separation.

**Example:** Create "London View" and "SF View" to route users to nearest datacenter.

## Dashboard

1. Go to Internal DNS → Views
2. Click **Create View**
3. Enter descriptive view name (e.g., "London Production View")
4. Select zones to include - Choose which internal zones belong in this view
5. Click **Save** - View receives unique ID for use in Gateway policies

**Verify:** View appears in Views list with selected zones shown.

## API

Use the create view endpoint with zone IDs.

\`\`\`bash
curl -X POST /api/views -d '{"name": "London View", "zone_ids": ["id1", "id2"]}'
\`\`\`

**If view creation fails:** Check zone IDs are valid and not already in another view.
```

추가된 내용:
- 목적 2문장(2줄)
- 예시 1개(1줄)
- 2개 단계에 대한 인라인 맥락(2줄)
- 짧은 검증(1줄)
- API 코드 예시(2줄)
- 문제 해결 메모 1개(1줄)
- 합계: 원본 12줄에 8줄 추가 = 20줄(1.67배) ✅

**추가하지 않은 것:**
- 포괄적인 문제 해결 섹션
- 여러 예시
- 별도의 "Understanding Views" 섹션
- 광범위한 테스트 절차
```

### 흔한 문제와 수정

- **단계 앞에 맥락이 없음** → "What this does" 도입부 추가
- **선행 조건 누락** → 필요한 것을 앞에 명시
- **Dashboard만 있음** → 접을 수 있는 영역에 API/CLI 경로 추가
- **검증이 없음** → "성공했는지 확인하는 방법" 섹션 추가
- **메모 누락** → 헷갈리는 단계에 주석 달기

---

## 4. Reference 페이지

### 판별 기준

**찾아볼 것:**
- 매개변수/설정/옵션의 표
- 알파벳 순 구성(흔함)
- 기술 사양
- 데이터 타입, 유효한 값, 제약 조건
- API 엔드포인트 문서
- 설정 옵션 목록

**확신을 높이는 신호:**
- 조밀한 기술 세부 사항
- 체계적인 범위(모든 옵션 나열)
- 서술형 문장이 적음
- 코드/매개변수 예시
- 제목에 "Reference" 또는 "API"

**예시 제목:**
- "Cache Control Headers Reference"
- "API Endpoints"
- "Configuration Options"

### 필수 요소 체크리스트

- [ ] 열린 맥락("이 레퍼런스를 언제 쓰는지")
- [ ] 흔한 시나리오를 끝이 아니라 앞에
- [ ] 알파벳이 아닌 사용 사례 중심 구성
- [ ] 두 단계 설명(쉬운 설명 + 기술 설명)
- [ ] 각 항목에 대한 실용적인 예시
- [ ] "언제 사용하는지"의 결정 안내
- [ ] 기대 결과가 있는 실제 사용 시나리오

### 단순화 패턴

**구조:**
```markdown
# [Reference Title]

**When to use:** [Context for entire reference]

## Common Scenarios

- [Scenario 1]: Use [option X]
- [Scenario 2]: Use [option Y]

---

## [Category 1: Grouped by Purpose]

### [Option Name]

**What it does:** [Plain English description]

**When to use:** [Specific use case]

**Technical spec:** [Data type, range, constraints]

**Example:**
```[language]
[Realistic usage example]
```

**Result:** [What happens when this is used]

---

### [Next Option]

[Same structure...]
```

### 흔한 문제와 수정

- **알파벳 순 구성** → 사용 사례/목적별로 재구성
- **맥락 없는 사양** → "언제 사용하는지" 안내 추가
- **예시 누락** → 각 항목에 현실적인 사용 예시 추가
- **결정 도움 없음** → 시나리오 기반 권장 사항 추가
- **쉬운 설명만 또는 기술 설명만** → 두 가지 설명 모두 제공

---

## 5. Tutorial 페이지

### 판별 기준

**찾아볼 것:**
- 제목에 "Build" 또는 "Create"
- 점진적으로 진행되는 코드 예시
- "What you'll build" 섹션
- 기술 요건이 있는 "Prerequisites"
- 소요 시간 추정
- 단계별 코드 진행
- 마지막의 "Deploy" 또는 "Test" 섹션

**확신을 높이는 신호:**
- 코드가 단순한 것에서 복잡한 것으로 진행
- 각 단계가 기능을 추가
- 주요 지점마다 테스트
- 문제 해결 섹션
- 학습 목표 명시
- 완전한 작동 예제

**예시 제목:**
- "Build a URL Shortener"
- "Create a Blog with Pages"
- "Tutorial: Image Resizing API"

### 필수 요소 체크리스트

- [ ] 구체적인 예시가 있는 "What you'll build"
- [ ] 선행 조건이 있는 "Who this is for"
- [ ] 소요 시간 추정
- [ ] "What you'll learn"(핵심 개념)
- [ ] 1단계: 최소 작동 버전
- [ ] 점진적 개선(기능을 점차 추가)
- [ ] 코드 블록 설명("What this does")
- [ ] 주요 단계마다 테스트
- [ ] 문제 해결 섹션
- [ ] 선택 사항 개선(명확히 표시)

### 단순화 패턴(보수적)

**목표: 원본 길이의 1.5~2배**

**튜토리얼은 구조를 재편하지 않고 기존 단계를 보강하는 데 집중합니다:**

**기존 튜토리얼에 대한 최소 추가:**
1. **상단에 목표 2~3문장 추가**(없는 경우) — 무엇을 만들 것인지
2. **코드 설명을 인라인으로 추가** — 코드 블록 안의 짧은 주석
3. **전형적인 사용 시나리오 예시 1개 추가**(5~10줄)
4. **짧은 테스트 추가** — 예상 출력과 함께 명령어 3~5개
5. **최소한의 문제 해결 추가** — 치명적인 문제 1~2개만

**추가하지 않을 것(이미 있는 경우):**
- "What you'll build" 섹션(대신 기존 내용을 보강)
- 점진적 단계(원래 구조 유지)
- 코드 예시(주석으로 보강하고 교체하지 않음)

**예시 보강:**

원본 튜토리얼 단계(20줄):
```markdown
## Step 1: Create the zone

Use the API to create an internal zone.

\`\`\`bash
curl -X POST https://api.cloudflare.com/zones \\
  -d '{"name": "company.internal", "type": "internal"}'
\`\`\`

## Step 2: Add DNS records

Add records to the zone.

\`\`\`bash
curl -X POST https://api.cloudflare.com/zones/ID/dns_records \\
  -d '{"type": "A", "name": "app", "content": "192.168.1.100"}'
\`\`\`
```

보강본(35줄 — 1.75배):
```markdown
## Step 1: Create the zone

Create an internal zone that will contain your DNS records. This zone is only 
accessible via Gateway (not public DNS).

\`\`\`bash
curl -X POST https://api.cloudflare.com/zones \\
  -d '{
    "name": "company.internal",  # Your internal domain
    "type": "internal"             # Marks as internal-only
  }'
\`\`\`

**Example use:** A company creates company.internal for all internal apps 
(app.company.internal, api.company.internal, db.company.internal).

## Step 2: Add DNS records

Add records mapping hostnames to private IPs.

\`\`\`bash
curl -X POST https://api.cloudflare.com/zones/ZONE_ID/dns_records \\
  -d '{
    "type": "A",                           # Address record
    "name": "app.company.internal",        # Full hostname
    "content": "192.168.1.100"             # Private IP
  }'
\`\`\`

**Test:** 
\`\`\`bash
nslookup app.company.internal
# Expected: Returns 192.168.1.100
\`\`\`

**If it doesn't resolve:** Device must use Gateway as DNS resolver. Check WARP 
connection or DNS settings.
```

추가된 내용:
- 각 단계에 대한 짧은 "왜"(1문장)
- 인라인 코드 주석(3~4개)
- 사용 예시 1개(2줄)
- 짧은 테스트(3줄)
- 문제 해결 메모 1개(2줄)
- 합계: 원본 20줄에 15줄 추가 = 35줄(1.75배) ✅

**추가하지 않은 것:**
- 별도의 "What you'll build" 섹션
- 여러 예시
- 포괄적인 문제 해결 섹션
- 광범위한 테스트 절차

### 흔한 문제와 수정(보수적 접근)

- **설명 없는 코드** → 인라인 주석 추가(블록당 2~4개)
- **목표가 명시되지 않음** → 상단에 2~3문장짜리 목표 추가
- **테스트 누락** → 3~5줄짜리 검증 추가(별도 섹션이 아님)
- **문제 해결이 전혀 없음** → 단계 안에 치명적인 문제 1~2개를 인라인으로 추가
- **예시 없음** → 현실적인 예시 1개를 인라인으로 추가(전체 5~10줄)

---

## 판별 의사결정 트리

```
1. 번호가 매겨진 절차 단계가 있는가?
   예 → 아마 HOW TO
   아니요 → 계속

2. "무엇"과 "왜"를 개념적으로 설명하는가?
   예 → 아마 CONCEPT
   아니요 → 계속

3. 표/사양/매개변수가 있는가?
   예 → 아마 REFERENCE
   아니요 → 계속

4. 코드로 무언가를 점진적으로 만드는가?
   예 → 아마 TUTORIAL
   아니요 → 아마 OVERVIEW

5. 검증 질문:
   - 여러 기능을 설명하는가? → OVERVIEW
   - 메커니즘을 설명하는가? → CONCEPT
   - 행동 지향 제목인가? → HOW TO
   - 기술 사양인가? → REFERENCE
   - 완성된 프로젝트인가? → TUTORIAL
```

---

## 혼합 콘텐츠 유형

때때로 문서는 여러 유형을 결합합니다.

### Overview + How To
**패턴:** 제품 소개 뒤에 빠른 시작 단계가 이어짐
**접근:** 첫 섹션은 Overview로, 단계는 How To로 다룸
**예시:** "Workers Overview"와 "Deploy Your First Worker" 단계

### Concept + Reference
**패턴:** 개념 설명 뒤에 매개변수 레퍼런스가 이어짐
**접근:** 설명을 먼저 쌓고, 레퍼런스는 아래에 둠
**예시:** "Understanding Caching" + "Cache Headers Reference"

### Tutorial + Reference
**패턴:** 프로젝트 빌드 + 끝에 API 레퍼런스
**접근:** 튜토리얼은 점진적으로 유지하고, 레퍼런스는 부록으로 옮김
**예시:** "Build URL Shortener" + "Workers API Reference"

**감지 전략:** 주된 목적을 식별하고(콘텐츠의 처음 50%), 나머지는 적절한 패턴을 적용한 보조 자료로 취급합니다.

---

## 빠른 참조 카드

### Overview 페이지 카드
```
✓ 이점 진술로 시작
✓ 문제/해결 구조
✓ "Perfect for" 섹션
✓ CTA 링크가 눈에 띔
✓ 기술 세부 사항은 하단에
```

### Concept 페이지 카드
```
✓ 첫 단락에 비유
✓ 쉬운 정의
✓ "Why it matters"
✓ 실제 사용 사례(3~5개)
✓ 기술 섹션은 분리됨
```

### How To 페이지 카드
```
✓ 단계 앞에 맥락
✓ 선행 조건 나열
✓ Dashboard 경로
✓ API 경로(접을 수 있음)
✓ 검증 섹션
```

### Reference 페이지 카드
```
✓ 열린 맥락
✓ 사용 사례별 구성
✓ 쉬운 설명 + 기술 설명
✓ 각 항목의 예시
✓ 결정 안내
```

### Tutorial 페이지 카드
```
✓ "What you'll build"
✓ 선행 조건 + 소요 시간
✓ 최소한의 첫 단계
✓ 점진적 복잡도
✓ 모든 코드 블록 설명
✓ 문제 해결 포함
```

---

**문서 버전:** 1.0  
**최종 수정:** 2026년 2월  
**라이선스:** MIT
