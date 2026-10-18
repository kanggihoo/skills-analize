---
name: quarkus-verification
description: "Quarkus 프로젝트의 검증 루프: 빌드, 정적 분석(Checkstyle, PMD, SpotBugs), JaCoCo 커버리지를 포함한 테스트, OWASP 의존성 및 컨테이너 보안 스캔, GraalVM 네이티브 컴파일, 상태 점검, 설정 검증. PR 전, 대규모 리팩터링이나 의존성 업그레이드 후, 또는 배포 전에 Quarkus 서비스를 검증할 때 사용합니다."
metadata:
  origin: ECC
---

# Quarkus 검증 루프

PR 전, 대규모 변경 후, 배포 전에 실행하세요.

## 활성화 시점

- Quarkus 서비스에 대한 pull request를 열기 전
- 대규모 리팩터링이나 의존성 업그레이드 후
- staging 또는 production 배포 전 검증
- 전체 빌드 → 린트 → 테스트 → 보안 스캔 → 네이티브 컴파일 파이프라인을 실행할 때
- 테스트 커버리지가 기준(80% 이상)을 충족하는지 검증할 때
- 네이티브 이미지 호환성을 테스트할 때

## 1단계: 빌드

```bash
# Maven
mvn clean verify -DskipTests

# Gradle
./gradlew clean assemble -x test
```

빌드가 실패하면 중단하고 컴파일 오류를 먼저 고치세요.

## 2단계: 정적 분석

### Checkstyle, PMD, SpotBugs (Maven)

```bash
mvn checkstyle:check pmd:check spotbugs:check
```

### SonarQube (설정된 경우)

```bash
mvn sonar:sonar \
  -Dsonar.projectKey=my-quarkus-project \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=${SONAR_TOKEN}
```

### 흔히 다루는 문제

- 사용되지 않는 import나 변수
- 복잡한 메서드(높은 순환 복잡도)
- 잠재적인 null 포인터 역참조
- SpotBugs가 표시한 보안 문제

## 3단계: 테스트 + 커버리지

```bash
# 모든 테스트 실행
mvn clean test

# 커버리지 보고서 생성
mvn jacoco:report

# 커버리지 임계값 강제 (80%)
mvn jacoco:check

# 또는 Gradle 사용
./gradlew test jacocoTestReport jacocoTestCoverageVerification
```

### 테스트 분류

#### 단위 테스트
의존성을 모킹하여 서비스 로직을 테스트합니다.

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
  @Mock UserRepository userRepository;
  @InjectMocks UserService userService;

  @Test
  void createUser_validInput_returnsUser() {
    var dto = new CreateUserDto("Alice", "alice@example.com");

    // Panache의 persist()는 void입니다 — doNothing + verify를 사용합니다
    doNothing().when(userRepository).persist(any(User.class));

    User result = userService.create(dto);

    assertThat(result.name).isEqualTo("Alice");
    verify(userRepository).persist(any(User.class));
  }
}
```

#### 통합 테스트
실제 데이터베이스(Testcontainers)로 테스트합니다.

```java
@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
class UserRepositoryIntegrationTest {

  @Inject
  UserRepository userRepository;

  @Test
  @Transactional
  void findByEmail_existingUser_returnsUser() {
    User user = new User();
    user.name = "Alice";
    user.email = "alice@example.com";
    userRepository.persist(user);

    Optional<User> found = userRepository.findByEmail("alice@example.com");

    assertThat(found).isPresent();
    assertThat(found.get().name).isEqualTo("Alice");
  }
}
```

#### API 테스트
REST Assured로 REST 엔드포인트를 테스트합니다.

```java
@QuarkusTest
class UserResourceTest {

  @Test
  void createUser_validInput_returns201() {
    given()
        .contentType(ContentType.JSON)
        .body("""
            {"name": "Alice", "email": "alice@example.com"}
            """)
        .when().post("/api/users")
        .then()
        .statusCode(201)
        .body("name", equalTo("Alice"));
  }

  @Test
  void createUser_invalidEmail_returns400() {
    given()
        .contentType(ContentType.JSON)
        .body("""
            {"name": "Alice", "email": "invalid"}
            """)
        .when().post("/api/users")
        .then()
        .statusCode(400);
  }
}
```

### 커버리지 보고서

자세한 커버리지는 `target/site/jacoco/index.html`에서 확인하세요.
- 전체 라인 커버리지(목표: 80% 이상)
- 브랜치 커버리지(목표: 70% 이상)
- 커버되지 않은 핵심 경로 식별

## 4단계: 보안 스캔

### 의존성 취약점 (Maven)

```bash
mvn org.owasp:dependency-check-maven:check
```

CVE는 `target/dependency-check-report.html`에서 검토하세요.

### Quarkus 보안 감사

```bash
# 취약한 확장 점검
mvn quarkus:audit

# 모든 확장 나열
mvn quarkus:list-extensions
```

### OWASP ZAP (API 보안 테스트)

```bash
docker run -t ghcr.io/zaproxy/zaproxy:stable zap-api-scan.py \
  -t http://localhost:8080/q/openapi \
  -f openapi
```

### 흔한 보안 점검 항목

- [ ] 모든 시크릿은 환경 변수에 있습니다(코드에 없음)
- [ ] 모든 엔드포인트에 입력 검증이 있습니다
- [ ] 인증/인가가 설정되어 있습니다
- [ ] CORS가 올바르게 설정되어 있습니다
- [ ] 보안 헤더가 설정되어 있습니다
- [ ] 비밀번호는 BCrypt로 해싱됩니다
- [ ] SQL 인젝션 방어(매개변수화된 쿼리)가 있습니다
- [ ] 공개 엔드포인트에 요청 제한이 있습니다

## 5단계: 네이티브 컴파일

GraalVM 네이티브 이미지 호환성을 테스트합니다.

```bash
# 네이티브 실행 파일 빌드
mvn package -Dnative

# 또는 컨테이너 사용
mvn package -Dnative -Dquarkus.native.container-build=true

# 네이티브 실행 파일 테스트
./target/*-runner

# 기본 스모크 테스트 실행
curl http://localhost:8080/q/health/live
curl http://localhost:8080/q/health/ready
```

### 네이티브 이미지 문제 해결

흔한 문제:
- **리플렉션**: 동적 클래스에 대해 리플렉션 설정을 추가하세요
- **리소스**: `quarkus.native.resources.includes`로 리소스를 포함하세요
- **JNI**: 네이티브 라이브러리를 사용한다면 JNI 클래스를 등록하세요

리플렉션 설정 예시:
```java
@RegisterForReflection(targets = {MyDynamicClass.class})
public class ReflectionConfiguration {}
```

## 6단계: 성능 테스트

### K6를 이용한 부하 테스트

```javascript
// load-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const res = http.get('http://localhost:8080/api/markets');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
}
```

실행:
```bash
k6 run load-test.js
```

### 모니터링할 지표

- 응답 시간(p50, p95, p99)
- 처리량(초당 요청 수)
- 오류율
- 메모리 사용량
- CPU 사용량

## 7단계: 상태 점검

```bash
# 활성 상태(Liveness)
curl http://localhost:8080/q/health/live

# 준비 상태(Readiness)
curl http://localhost:8080/q/health/ready

# 모든 상태 점검
curl http://localhost:8080/q/health

# 지표 (활성화된 경우)
curl http://localhost:8080/q/metrics
```

기대되는 응답:
```json
{
  "status": "UP",
  "checks": [
    {
      "name": "Database connection",
      "status": "UP"
    }
  ]
}
```

## 8단계: 컨테이너 이미지 빌드

```bash
# 컨테이너 이미지 빌드
mvn package -Dquarkus.container-image.build=true

# 또는 특정 레지스트리 사용
mvn package \
  -Dquarkus.container-image.build=true \
  -Dquarkus.container-image.registry=docker.io \
  -Dquarkus.container-image.group=myorg \
  -Dquarkus.container-image.tag=1.0.0

# 컨테이너 테스트
docker run -p 8080:8080 myorg/my-quarkus-app:1.0.0
```

### 컨테이너 보안 스캔

```bash
# Trivy
trivy image myorg/my-quarkus-app:1.0.0

# Grype
grype myorg/my-quarkus-app:1.0.0
```

## 9단계: 설정 검증

```bash
# 모든 설정 속성 점검
mvn quarkus:info

# 모든 설정 소스 나열
curl http://localhost:8080/q/dev/io.quarkus.quarkus-vertx-http/config
```

### 환경별 점검

- [ ] 데이터베이스 URL이 환경별로 설정되어 있습니다
- [ ] 시크릿이 외부화되어 있습니다(Vault, 환경 변수)
- [ ] 로깅 수준이 적절합니다
- [ ] CORS origin이 올바르게 설정되어 있습니다
- [ ] 요청 제한이 설정되어 있습니다
- [ ] 모니터링/트레이싱이 활성화되어 있습니다

## 10단계: 문서 검토

- [ ] OpenAPI/Swagger 문서가 최신입니다(`/q/swagger-ui`)
- [ ] README에 설정 방법이 있습니다
- [ ] API 변경 사항이 문서화되어 있습니다
- [ ] 호환성이 깨지는 변경에 대한 마이그레이션 가이드가 있습니다
- [ ] 설정 속성이 문서화되어 있습니다

OpenAPI 명세 생성:
```bash
curl http://localhost:8080/q/openapi -o openapi.json
```

## 검증 체크리스트

### 코드 품질
- [ ] 빌드가 경고 없이 통과합니다
- [ ] 정적 분석이 깨끗합니다(높음/중간 수준 문제 없음)
- [ ] 코드가 팀 규칙을 따릅니다
- [ ] PR에 주석 처리된 코드나 TODO가 없습니다

### 테스트
- [ ] 모든 테스트가 통과합니다
- [ ] 코드 커버리지 ≥ 80%
- [ ] 실제 데이터베이스를 사용한 통합 테스트가 있습니다
- [ ] 보안 테스트가 통과합니다
- [ ] 성능이 허용 한계 내에 있습니다

### 보안
- [ ] 의존성 취약점이 없습니다
- [ ] 인증/인가가 테스트되었습니다
- [ ] 입력 검증이 완료되었습니다
- [ ] 시크릿이 소스 코드에 없습니다
- [ ] 보안 헤더가 설정되어 있습니다

### 배포
- [ ] 네이티브 컴파일이 성공합니다
- [ ] 컨테이너 이미지가 빌드됩니다
- [ ] 상태 점검이 올바르게 응답합니다
- [ ] 설정이 대상 환경에 유효합니다

### 네이티브 이미지
- [ ] 네이티브 실행 파일이 빌드됩니다
- [ ] 네이티브 테스트가 통과합니다
- [ ] 시작 시간 < 100ms
- [ ] 메모리 사용량이 허용 가능합니다

## 자동 검증 스크립트

```bash
#!/bin/bash
set -e

echo "=== 1단계: 빌드 ==="
mvn clean verify -DskipTests

echo "=== 2단계: 정적 분석 ==="
mvn checkstyle:check pmd:check spotbugs:check

echo "=== 3단계: 테스트 + 커버리지 ==="
mvn test jacoco:report jacoco:check

echo "=== 4단계: 보안 스캔 ==="
mvn org.owasp:dependency-check-maven:check

echo "=== 5단계: 네이티브 컴파일 ==="
mvn package -Dnative -Dquarkus.native.container-build=true

echo "=== 모든 단계 완료 ==="
echo "보고서 검토:"
echo "  - 커버리지: target/site/jacoco/index.html"
echo "  - 보안: target/dependency-check-report.html"
echo "  - 네이티브: target/*-runner"
```

## CI/CD 연동

### GitHub Actions 예시

```yaml
name: Verification

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - name: Set up JDK 21
        uses: actions/setup-java@v5
        with:
          java-version: '21'
          distribution: 'temurin'

      - name: Cache Maven packages
        uses: actions/cache@v6
        with:
          path: ~/.m2
          key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}

      - name: Build
        run: mvn clean verify -DskipTests

      - name: Test with Coverage
        run: mvn test jacoco:report jacoco:check

      - name: Security Scan
        run: mvn org.owasp:dependency-check-maven:check

      - name: Upload Coverage
        uses: codecov/codecov-action@v7
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: target/site/jacoco/jacoco.xml
```

## 모범 사례

- 모든 PR 전에 검증 루프를 실행하세요
- CI/CD 파이프라인에서 자동화하세요
- 문제는 즉시 고치고, 기술 부채를 쌓아 두지 마세요
- 커버리지를 80% 이상으로 유지하세요
- 의존성을 정기적으로 업데이트하세요
- 네이티브 컴파일을 주기적으로 테스트하세요
- 성능 추세를 모니터링하세요
- 호환성이 깨지는 변경을 문서화하세요
- 보안 스캔 결과를 검토하세요
- 환경마다 설정을 검증하세요
