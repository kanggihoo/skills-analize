---
name: security-review
description: 인증을 추가하거나, 사용자 입력을 처리하거나, 시크릿을 다루거나, API 엔드포인트를 만들거나, 결제 또는 민감한 기능을 구현할 때 이 스킬을 사용하세요. 포괄적인 보안 체크리스트와 패턴을 제공합니다.
metadata:
  origin: ECC
---

# 보안 검토 스킬

이 스킬은 모든 코드가 보안 모범 사례를 따르도록 보장하고 잠재적인 취약점을 식별합니다.

## 활성화 시점

- 인증 또는 권한 부여를 구현할 때
- 사용자 입력이나 파일 업로드를 처리할 때
- 새로운 API 엔드포인트를 만들 때
- 시크릿이나 자격 증명을 다룰 때
- 결제 기능을 구현할 때
- 민감한 데이터를 저장하거나 전송할 때
- 서드파티 API를 연동할 때

## 보안 체크리스트

### 1. 시크릿 관리

#### 실패: 절대 하지 말아야 할 것
```typescript
const apiKey = "sk-proj-xxxxx"  // Hardcoded secret
const dbPassword = "password123" // In source code
```

#### 통과: 항상 해야 할 것
```typescript
const apiKey = process.env.OPENAI_API_KEY
const dbUrl = process.env.DATABASE_URL

// Verify secrets exist
if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

#### 검증 단계
- [ ] 하드코딩된 API 키, 토큰, 비밀번호가 없음
- [ ] 모든 시크릿이 환경 변수에 있음
- [ ] `.env.local`이 .gitignore에 포함됨
- [ ] git 이력에 시크릿이 없음
- [ ] 프로덕션 시크릿은 호스팅 플랫폼(Vercel, Railway)에 있음

### 2. 입력 검증

#### 사용자 입력은 항상 검증
```typescript
import { z } from 'zod'

// Define validation schema
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
})

// Validate before processing
export async function createUser(input: unknown) {
  try {
    const validated = CreateUserSchema.parse(input)
    return await db.users.create(validated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.issues }
    }
    throw error
  }
}
```

#### 파일 업로드 검증
```typescript
function validateFileUpload(file: File) {
  // Size check (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large (max 5MB)')
  }

  // Type check
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }

  // Extension check
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new Error('Invalid file extension')
  }

  return true
}
```

#### 검증 단계
- [ ] 모든 사용자 입력이 스키마로 검증됨
- [ ] 파일 업로드가 크기, 타입, 확장자로 제한됨
- [ ] 사용자 입력을 쿼리에 직접 사용하지 않음
- [ ] 블랙리스트가 아닌 화이트리스트 검증
- [ ] 오류 메시지가 민감한 정보를 노출하지 않음

### 3. SQL 인젝션 방지

#### 실패: SQL을 절대 연결(concatenate)하지 말 것
```typescript
// DANGEROUS - SQL Injection vulnerability
const query = `SELECT * FROM users WHERE email = '${userEmail}'`
await db.query(query)
```

#### 통과: 항상 매개변수화된 쿼리 사용
```typescript
// Safe - parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail)

// Or with raw SQL -- the value goes in the params array, never in the
// string. Use your driver's placeholder syntax (Postgres numbers its
// placeholders, MySQL uses "?").
await db.query(
  'SELECT * FROM users WHERE email = ?',
  [userEmail]
)
```

<!-- Do not write a literal dollar-sign-N placeholder anywhere in this file.
     Invoking this skill with arguments substitutes it away, and the example
     above then renders as concatenated SQL -- the exact anti-pattern this
     section warns against. Use "?" and name the Postgres form in prose. -->

#### 검증 단계
- [ ] 모든 데이터베이스 쿼리가 매개변수화된 쿼리를 사용
- [ ] SQL에 문자열 연결이 없음
- [ ] ORM/쿼리 빌더를 올바르게 사용
- [ ] Supabase 쿼리가 적절히 살균(sanitize)됨

### 4. 인증 & 권한 부여

#### JWT 토큰 처리
```typescript
// FAIL: WRONG: localStorage (vulnerable to XSS)
localStorage.setItem('token', token)

// PASS: CORRECT: httpOnly cookies
res.setHeader('Set-Cookie',
  `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
```

#### 권한 확인
```typescript
export async function deleteUser(userId: string, requesterId: string) {
  // ALWAYS verify authorization first
  const requester = await db.users.findUnique({
    where: { id: requesterId }
  })

  if (requester.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  // Proceed with deletion
  await db.users.delete({ where: { id: userId } })
}
```

#### 행 수준 보안 (Supabase)
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only view their own data
CREATE POLICY "Users view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own data
CREATE POLICY "Users update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

#### 검증 단계
- [ ] 토큰이 httpOnly 쿠키에 저장됨 (localStorage 아님)
- [ ] 민감한 작업 전에 권한 확인
- [ ] Supabase에서 행 수준 보안(RLS) 활성화
- [ ] 역할 기반 접근 제어 구현
- [ ] 세션 관리가 안전함

### 5. XSS 방지

#### HTML 살균
```typescript
import DOMPurify from 'isomorphic-dompurify'

// ALWAYS sanitize user-provided HTML
function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

#### Content Security Policy

엄격하게 시작하고, 문서화된 제거 계획이 있을 때만 완화합니다. `'unsafe-inline'`이나 `'unsafe-eval'`을 기본값으로 두지 마세요. 이들은 CSP 보호의 상당 부분을 무력화하므로 임시적인 호환성 부채로 다뤄야 합니다.

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      base-uri 'self';
      object-src 'none';
      frame-ancestors 'none';
      script-src 'self';
      style-src 'self';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://api.example.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

#### 검증 단계
- [ ] 사용자가 제공한 HTML이 살균됨
- [ ] CSP 헤더가 구성됨
- [ ] 검증되지 않은 동적 콘텐츠를 렌더링하지 않음
- [ ] React의 내장 XSS 보호를 사용

### 6. CSRF 방지

#### CSRF 토큰
```typescript
import { csrf } from '@/lib/csrf'

export async function POST(request: Request) {
  const token = request.headers.get('X-CSRF-Token')

  if (!csrf.verify(token)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  // Process request
}
```

#### SameSite 쿠키
```typescript
res.setHeader('Set-Cookie',
  `session=${sessionId}; HttpOnly; Secure; SameSite=Strict`)
```

#### 검증 단계
- [ ] 상태를 변경하는 작업에 CSRF 토큰 적용
- [ ] 모든 쿠키에 SameSite=Strict 설정
- [ ] 더블 서브밋 쿠키 패턴 구현

### 7. 레이트 리미팅

#### API 레이트 리미팅
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests'
})

// Apply to routes
app.use('/api/', limiter)
```

#### 비용이 큰 작업
```typescript
// Aggressive rate limiting for searches
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many search requests'
})

app.use('/api/search', searchLimiter)
```

#### 검증 단계
- [ ] 모든 API 엔드포인트에 레이트 리미팅 적용
- [ ] 비용이 큰 작업에는 더 엄격한 제한
- [ ] IP 기반 레이트 리미팅
- [ ] 사용자 기반 레이트 리미팅 (인증된 사용자)

### 8. 민감한 데이터 노출

#### 로깅
```typescript
// FAIL: WRONG: Logging sensitive data
console.log('User login:', { email, password })
console.log('Payment:', { cardNumber, cvv })

// PASS: CORRECT: Redact sensitive data
console.log('User login:', { email, userId })
console.log('Payment:', { last4: card.last4, userId })
```

#### 오류 메시지
```typescript
// FAIL: WRONG: Exposing internal details
catch (error) {
  return NextResponse.json(
    { error: error.message, stack: error.stack },
    { status: 500 }
  )
}

// PASS: CORRECT: Generic error messages
catch (error) {
  console.error('Internal error:', error)
  return NextResponse.json(
    { error: 'An error occurred. Please try again.' },
    { status: 500 }
  )
}
```

#### 검증 단계
- [ ] 로그에 비밀번호, 토큰, 시크릿이 없음
- [ ] 사용자에게 보이는 오류 메시지는 일반적인 내용
- [ ] 자세한 오류는 서버 로그에만 기록
- [ ] 사용자에게 스택 트레이스가 노출되지 않음

### 9. 블록체인 보안 (Solana)

#### 지갑 검증
```typescript
import { verify } from '@solana/web3.js'

async function verifyWalletOwnership(
  publicKey: string,
  signature: string,
  message: string
) {
  try {
    const isValid = verify(
      Buffer.from(message),
      Buffer.from(signature, 'base64'),
      Buffer.from(publicKey, 'base64')
    )
    return isValid
  } catch (error) {
    return false
  }
}
```

#### 트랜잭션 검증
```typescript
async function verifyTransaction(transaction: Transaction) {
  // Verify recipient
  if (transaction.to !== expectedRecipient) {
    throw new Error('Invalid recipient')
  }

  // Verify amount
  if (transaction.amount > maxAmount) {
    throw new Error('Amount exceeds limit')
  }

  // Verify user has sufficient balance
  const balance = await getBalance(transaction.from)
  if (balance < transaction.amount) {
    throw new Error('Insufficient balance')
  }

  return true
}
```

#### 검증 단계
- [ ] 지갑 서명이 검증됨
- [ ] 트랜잭션 세부 정보가 검증됨
- [ ] 트랜잭션 전에 잔액 확인
- [ ] 맹목적인 트랜잭션 서명 없음

### 10. 의존성 보안

#### 정기적인 업데이트
```bash
# Check for vulnerabilities
npm audit

# Fix automatically fixable issues
npm audit fix

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

#### 잠금 파일
```bash
# ALWAYS commit lock files
git add package-lock.json

# Use in CI/CD for reproducible builds
npm ci  # Instead of npm install
```

#### 검증 단계
- [ ] 의존성이 최신 상태
- [ ] 알려진 취약점 없음 (npm audit 결과 깨끗함)
- [ ] 잠금 파일이 커밋됨
- [ ] GitHub에서 Dependabot 활성화
- [ ] 정기적인 보안 업데이트

## 보안 테스트

### 자동화된 보안 테스트
```typescript
// Test authentication
test('requires authentication', async () => {
  const response = await fetch('/api/protected')
  expect(response.status).toBe(401)
})

// Test authorization
test('requires admin role', async () => {
  const response = await fetch('/api/admin', {
    headers: { Authorization: `Bearer ${userToken}` }
  })
  expect(response.status).toBe(403)
})

// Test input validation
test('rejects invalid input', async () => {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ email: 'not-an-email' })
  })
  expect(response.status).toBe(400)
})

// Test rate limiting
test('enforces rate limits', async () => {
  const requests = Array(101).fill(null).map(() =>
    fetch('/api/endpoint')
  )

  const responses = await Promise.all(requests)
  const tooManyRequests = responses.filter(r => r.status === 429)

  expect(tooManyRequests.length).toBeGreaterThan(0)
})
```

## 배포 전 보안 체크리스트

모든 프로덕션 배포 전에:

- [ ] **시크릿**: 하드코딩된 시크릿 없음, 모두 환경 변수에 있음
- [ ] **입력 검증**: 모든 사용자 입력이 검증됨
- [ ] **SQL 인젝션**: 모든 쿼리가 매개변수화됨
- [ ] **XSS**: 사용자 콘텐츠가 살균됨
- [ ] **CSRF**: 보호 활성화
- [ ] **인증**: 적절한 토큰 처리
- [ ] **권한 부여**: 역할 확인 적용
- [ ] **레이트 리미팅**: 모든 엔드포인트에 활성화
- [ ] **HTTPS**: 프로덕션에서 강제 적용
- [ ] **보안 헤더**: CSP, X-Frame-Options 구성
- [ ] **오류 처리**: 오류에 민감한 데이터 없음
- [ ] **로깅**: 민감한 데이터를 기록하지 않음
- [ ] **의존성**: 최신 상태이며 취약점 없음
- [ ] **행 수준 보안**: Supabase에서 활성화
- [ ] **CORS**: 적절히 구성됨
- [ ] **파일 업로드**: 검증됨 (크기, 타입)
- [ ] **지갑 서명**: 검증됨 (블록체인인 경우)

## 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/security)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [Web Security Academy](https://portswigger.net/web-security)

---

**기억하세요**: 보안은 선택 사항이 아닙니다. 하나의 취약점이 플랫폼 전체를 위협할 수 있습니다. 확신이 서지 않으면 신중한 쪽을 택하세요.
