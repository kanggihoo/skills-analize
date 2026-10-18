| name | description |
|------|-------------|
| cloud-infrastructure-security | 클라우드 플랫폼에 배포하거나, 인프라를 구성하거나, IAM 정책을 관리하거나, 로깅/모니터링을 설정하거나, CI/CD 파이프라인을 구현할 때 이 스킬을 사용하세요. 모범 사례에 맞춘 클라우드 보안 체크리스트를 제공합니다. |

# 클라우드 & 인프라 보안 스킬

이 스킬은 클라우드 인프라, CI/CD 파이프라인, 배포 구성이 보안 모범 사례를 따르고 업계 표준을 준수하도록 보장합니다.

## 활성화 시점

- 클라우드 플랫폼(AWS, Vercel, Railway, Cloudflare)에 애플리케이션을 배포할 때
- IAM 역할과 권한을 구성할 때
- CI/CD 파이프라인을 설정할 때
- 코드형 인프라(Terraform, CloudFormation)를 구현할 때
- 로깅과 모니터링을 구성할 때
- 클라우드 환경에서 시크릿을 관리할 때
- CDN과 엣지 보안을 설정할 때
- 재해 복구와 백업 전략을 구현할 때

## 클라우드 보안 체크리스트

### 1. IAM & 접근 제어

#### 최소 권한 원칙

```yaml
# PASS: CORRECT: Minimal permissions
iam_role:
  permissions:
    - s3:GetObject  # Only read access
    - s3:ListBucket
  resources:
    - arn:aws:s3:::my-bucket/*  # Specific bucket only

# FAIL: WRONG: Overly broad permissions
iam_role:
  permissions:
    - s3:*  # All S3 actions
  resources:
    - "*"  # All resources
```

#### 다단계 인증 (MFA)

```bash
# ALWAYS enable MFA for root/admin accounts
aws iam enable-mfa-device \
  --user-name admin \
  --serial-number arn:aws:iam::123456789:mfa/admin \
  --authentication-code1 123456 \
  --authentication-code2 789012
```

#### 검증 단계

- [ ] 프로덕션에서 루트 계정을 사용하지 않음
- [ ] 모든 권한 있는 계정에 MFA 활성화
- [ ] 서비스 계정은 장기 자격 증명이 아니라 역할을 사용
- [ ] IAM 정책이 최소 권한 원칙을 따름
- [ ] 정기적인 접근 검토 수행
- [ ] 사용하지 않는 자격 증명은 교체하거나 제거

### 2. 시크릿 관리

#### 클라우드 시크릿 관리자

```typescript
// PASS: CORRECT: Use cloud secrets manager
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManager({ region: 'us-east-1' });
const secret = await client.getSecretValue({ SecretId: 'prod/api-key' });
const apiKey = JSON.parse(secret.SecretString).key;

// FAIL: WRONG: Hardcoded or in environment variables only
const apiKey = process.env.API_KEY; // Not rotated, not audited
```

#### 시크릿 교체

```bash
# Set up automatic rotation for database credentials
aws secretsmanager rotate-secret \
  --secret-id prod/db-password \
  --rotation-lambda-arn arn:aws:lambda:region:account:function:rotate \
  --rotation-rules AutomaticallyAfterDays=30
```

#### 검증 단계

- [ ] 모든 시크릿이 클라우드 시크릿 관리자(AWS Secrets Manager, Vercel Secrets)에 저장됨
- [ ] 데이터베이스 자격 증명에 자동 교체 활성화
- [ ] API 키는 최소 분기마다 교체
- [ ] 코드, 로그, 오류 메시지에 시크릿이 없음
- [ ] 시크릿 접근에 대한 감사 로깅 활성화

### 3. 네트워크 보안

#### VPC 및 방화벽 구성

```terraform
# PASS: CORRECT: Restricted security group
resource "aws_security_group" "app" {
  name = "app-sg"

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]  # Internal VPC only
  }

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Only HTTPS outbound
  }
}

# FAIL: WRONG: Open to the internet
resource "aws_security_group" "bad" {
  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # All ports, all IPs!
  }
}
```

#### 검증 단계

- [ ] 데이터베이스가 공개적으로 접근 불가
- [ ] SSH/RDP 포트는 VPN/배스천 호스트로만 제한
- [ ] 보안 그룹이 최소 권한 원칙을 따름
- [ ] 네트워크 ACL 구성됨
- [ ] VPC 플로우 로그 활성화

### 4. 로깅 & 모니터링

#### CloudWatch/로깅 구성

```typescript
// PASS: CORRECT: Comprehensive logging
import { CloudWatchLogsClient, CreateLogStreamCommand } from '@aws-sdk/client-cloudwatch-logs';

const logSecurityEvent = async (event: SecurityEvent) => {
  await cloudwatch.putLogEvents({
    logGroupName: '/aws/security/events',
    logStreamName: 'authentication',
    logEvents: [{
      timestamp: Date.now(),
      message: JSON.stringify({
        type: event.type,
        userId: event.userId,
        ip: event.ip,
        result: event.result,
        // Never log sensitive data
      })
    }]
  });
};
```

#### 검증 단계

- [ ] 모든 서비스에 CloudWatch/로깅 활성화
- [ ] 인증 실패 시도가 기록됨
- [ ] 관리자 작업이 감사됨
- [ ] 로그 보존 기간 설정(규정 준수를 위해 90일 이상)
- [ ] 의심스러운 활동에 대한 알림 구성
- [ ] 로그가 중앙 집중화되고 변조 방지됨

### 5. CI/CD 파이프라인 보안

#### 안전한 파이프라인 구성

```yaml
# PASS: CORRECT: Secure GitHub Actions workflow
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read  # Minimal permissions

    steps:
      - uses: actions/checkout@v4

      # Scan for secrets
      - name: Secret scanning
        uses: trufflesecurity/trufflehog@main

      # Dependency audit
      - name: Audit dependencies
        run: npm audit --audit-level=high

      # Use OIDC, not long-lived tokens
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/GitHubActionsRole
          aws-region: us-east-1
```

#### 공급망 보안

```json
// package.json - Use lock files and integrity checks
{
  "scripts": {
    "install": "npm ci",  // Use ci for reproducible builds
    "audit": "npm audit --audit-level=moderate",
    "check": "npm outdated"
  }
}
```

#### 검증 단계

- [ ] 장기 자격 증명 대신 OIDC 사용
- [ ] 파이프라인에 시크릿 스캐닝 적용
- [ ] 의존성 취약점 스캐닝 적용
- [ ] 컨테이너 이미지 스캐닝 (해당하는 경우)
- [ ] 브랜치 보호 규칙 강제 적용
- [ ] 병합 전 코드 리뷰 필수
- [ ] 서명된 커밋 강제

### 6. Cloudflare & CDN 보안

#### Cloudflare 보안 구성

```typescript
// PASS: CORRECT: Cloudflare Workers with security headers
export default {
  async fetch(request: Request): Promise<Response> {
    const response = await fetch(request);

    // Add security headers
    const headers = new Headers(response.headers);
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'geolocation=(), microphone=()');

    return new Response(response.body, {
      status: response.status,
      headers
    });
  }
};
```

#### WAF 규칙

```bash
# Enable Cloudflare WAF managed rules
# - OWASP Core Ruleset
# - Cloudflare Managed Ruleset
# - Rate limiting rules
# - Bot protection
```

#### 검증 단계

- [ ] OWASP 규칙이 적용된 WAF 활성화
- [ ] 레이트 리미팅 구성
- [ ] 봇 보호 활성화
- [ ] DDoS 보호 활성화
- [ ] 보안 헤더 구성
- [ ] SSL/TLS 엄격 모드 활성화

### 7. 백업 & 재해 복구

#### 자동 백업

```terraform
# PASS: CORRECT: Automated RDS backups
resource "aws_db_instance" "main" {
  allocated_storage     = 20
  engine               = "postgres"

  backup_retention_period = 30  # 30 days retention
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"

  enabled_cloudwatch_logs_exports = ["postgresql"]

  deletion_protection = true  # Prevent accidental deletion
}
```

#### 검증 단계

- [ ] 자동 일일 백업 구성
- [ ] 백업 보존 기간이 규정 요건을 충족
- [ ] 시점 복구(PITR) 활성화
- [ ] 백업 테스트를 분기마다 수행
- [ ] 재해 복구 계획 문서화
- [ ] RPO와 RTO가 정의되고 테스트됨

## 프로덕션 배포 전 클라우드 보안 체크리스트

모든 프로덕션 클라우드 배포 전에:

- [ ] **IAM**: 루트 계정 미사용, MFA 활성화, 최소 권한 정책
- [ ] **시크릿**: 모든 시크릿이 교체 설정과 함께 클라우드 시크릿 관리자에 저장
- [ ] **네트워크**: 보안 그룹 제한, 공개 데이터베이스 없음
- [ ] **로깅**: 보존 기간이 설정된 CloudWatch/로깅 활성화
- [ ] **모니터링**: 이상 징후에 대한 알림 구성
- [ ] **CI/CD**: OIDC 인증, 시크릿 스캐닝, 의존성 감사
- [ ] **CDN/WAF**: OWASP 규칙이 적용된 Cloudflare WAF 활성화
- [ ] **암호화**: 저장 시와 전송 중 데이터 모두 암호화
- [ ] **백업**: 복구가 검증된 자동 백업
- [ ] **규정 준수**: GDPR/HIPAA 요건 충족 (해당하는 경우)
- [ ] **문서화**: 인프라 문서화, 런북 작성
- [ ] **사고 대응**: 보안 사고 계획 마련

## 흔한 클라우드 보안 설정 오류

### S3 버킷 노출

```bash
# FAIL: WRONG: Public bucket
aws s3api put-bucket-acl --bucket my-bucket --acl public-read

# PASS: CORRECT: Private bucket with specific access
aws s3api put-bucket-acl --bucket my-bucket --acl private
aws s3api put-bucket-policy --bucket my-bucket --policy file://policy.json
```

### RDS 공개 접근

```terraform
# FAIL: WRONG
resource "aws_db_instance" "bad" {
  publicly_accessible = true  # NEVER do this!
}

# PASS: CORRECT
resource "aws_db_instance" "good" {
  publicly_accessible = false
  vpc_security_group_ids = [aws_security_group.db.id]
}
```

## 참고 자료

- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [CIS AWS Foundations Benchmark](https://www.cisecurity.org/benchmark/amazon_web_services)
- [Cloudflare Security Documentation](https://developers.cloudflare.com/security/)
- [OWASP Cloud Security](https://owasp.org/www-project-cloud-security/)
- [Terraform Security Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/)

**기억하세요**: 클라우드 설정 오류는 데이터 유출의 가장 큰 원인입니다. 하나의 노출된 S3 버킷이나 지나치게 허용적인 IAM 정책이 전체 인프라를 위험에 빠뜨릴 수 있습니다. 항상 최소 권한 원칙과 심층 방어를 따르세요.
