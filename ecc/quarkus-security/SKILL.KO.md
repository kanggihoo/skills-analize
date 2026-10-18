---
name: quarkus-security
description: "Quarkus 보안 구현 패턴: JWT 및 OIDC 인증, @RolesAllowed RBAC와 SecurityIdentity 검사, Bean Validation과 사용자 정의 검증기, 매개변수화된 Panache 쿼리, BCrypt 비밀번호 해싱, CORS와 보안 헤더, 요청 제한(rate limiting), 감사 로깅, Vault 또는 환경 변수 기반 시크릿, 의존성 CVE 스캐닝. 인증이나 인가를 추가하거나, 입력을 검증하거나, 시크릿을 관리하거나, Quarkus 애플리케이션을 강화할 때 사용합니다."
metadata:
  origin: ECC
---

# Quarkus 보안 검토

인증, 인가, 입력 검증으로 Quarkus 애플리케이션을 보호하기 위한 모범 사례입니다.

## 활성화 시점

- 인증(JWT, OIDC, Basic Auth)을 추가할 때
- @RolesAllowed 또는 SecurityIdentity로 인가를 구현할 때
- 사용자 입력을 검증할 때(Bean Validation, 사용자 정의 검증기)
- CORS 또는 보안 헤더를 설정할 때
- 시크릿을 관리할 때(Vault, 환경 변수, 설정 소스)
- 요청 제한(rate limiting) 또는 무차별 대입 공격 방어를 추가할 때
- 의존성의 CVE를 스캔할 때
- MicroProfile JWT 또는 SmallRye JWT로 작업할 때

## 인증

### JWT 인증

```java
// JWT로 보호된 resource
@Path("/api/protected")
@Authenticated
public class ProtectedResource {

  @Inject
  JsonWebToken jwt;

  @Inject
  SecurityIdentity securityIdentity;

  @GET
  public Response getData() {
    String username = jwt.getName();
    Set<String> roles = jwt.getGroups();
    return Response.ok(Map.of(
        "username", username,
        "roles", roles,
        "principal", securityIdentity.getPrincipal().getName()
    )).build();
  }
}
```

설정 (application.properties):
```properties
mp.jwt.verify.publickey.location=publicKey.pem
mp.jwt.verify.issuer=https://auth.example.com

# OIDC
quarkus.oidc.auth-server-url=https://auth.example.com/realms/myrealm
quarkus.oidc.client-id=backend-service
quarkus.oidc.credentials.secret=${OIDC_SECRET}
```

### 사용자 정의 인증 필터

```java
@Provider
@Priority(Priorities.AUTHENTICATION)
public class CustomAuthFilter implements ContainerRequestFilter {

  @Inject
  SecurityIdentity identity;

  @Override
  public void filter(ContainerRequestContext requestContext) {
    String authHeader = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);

    // 헤더가 없거나 형식이 잘못되었으면 즉시 거부합니다
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED).build());
      return;
    }

    String token = authHeader.substring(7);
    if (!validateToken(token)) {
      requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED).build());
    }
  }

  private boolean validateToken(String token) {
    // 토큰 검증 로직
    return true;
  }
}
```

## 인가

### 역할 기반 접근 제어(RBAC)

```java
@Path("/api/admin")
@RolesAllowed("ADMIN")
public class AdminResource {

  @GET
  @Path("/users")
  public List<UserDto> listUsers() {
    return userService.findAll();
  }

  @DELETE
  @Path("/users/{id}")
  @RolesAllowed({"ADMIN", "SUPER_ADMIN"})
  public Response deleteUser(@PathParam("id") Long id) {
    userService.delete(id);
    return Response.noContent().build();
  }
}

@Path("/api/users")
public class UserResource {

  @Inject
  SecurityIdentity securityIdentity;

  @GET
  @Path("/{id}")
  @RolesAllowed("USER")
  public Response getUser(@PathParam("id") Long id) {
    // 소유권 확인
    if (!securityIdentity.hasRole("ADMIN") &&
        !isOwner(id, securityIdentity.getPrincipal().getName())) {
      return Response.status(Response.Status.FORBIDDEN).build();
    }
    return Response.ok(userService.findById(id)).build();
  }

  private boolean isOwner(Long userId, String username) {
    return userService.isOwner(userId, username);
  }
}
```

### 프로그래밍 방식 보안

```java
@ApplicationScoped
public class SecurityService {

  @Inject
  SecurityIdentity securityIdentity;

  public boolean canAccessResource(Long resourceId) {
    if (securityIdentity.isAnonymous()) {
      return false;
    }

    if (securityIdentity.hasRole("ADMIN")) {
      return true;
    }

    String userId = securityIdentity.getPrincipal().getName();
    return resourceRepository.isOwner(resourceId, userId);
  }
}
```

## 입력 검증

### Bean Validation

```java
// 나쁜 예: 검증 없음
@POST
public Response createUser(UserDto dto) {
  return Response.ok(userService.create(dto)).build();
}

// 좋은 예: 검증된 DTO
public record CreateUserDto(
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Email String email,
    @NotNull @Min(18) @Max(150) Integer age,
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$") String phone
) {}

@POST
@Path("/users")
public Response createUser(@Valid CreateUserDto dto) {
  User user = userService.create(dto);
  return Response.status(Response.Status.CREATED).entity(user).build();
}
```

### 사용자 정의 검증기

```java
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UsernameValidator.class)
public @interface ValidUsername {
  String message() default "Invalid username format";
  Class<?>[] groups() default {};
  Class<? extends Payload>[] payload() default {};
}

public class UsernameValidator implements ConstraintValidator<ValidUsername, String> {
  @Override
  public boolean isValid(String value, ConstraintValidatorContext context) {
    if (value == null) return false;
    return value.matches("^[a-zA-Z0-9_-]{3,20}$");
  }
}

// 사용 예
public record CreateUserDto(
    @ValidUsername String username,
    @NotBlank @Email String email
) {}
```

## SQL 인젝션 방지

### Panache Active Record (기본적으로 안전)

```java
// 좋은 예: Panache의 매개변수화된 쿼리
List<User> users = User.list("email = ?1 and active = ?2", email, true);

Optional<User> user = User.find("username", username).firstResultOptional();

// 좋은 예: 이름 있는 매개변수
List<User> users = User.list("email = :email and age > :minAge",
    Parameters.with("email", email).and("minAge", 18));
```

### 네이티브 쿼리 (매개변수 사용)

```java
// 나쁜 예: 문자열 연결
@Query(value = "SELECT * FROM users WHERE name = '" + name + "'", nativeQuery = true)

// 좋은 예: 매개변수화된 네이티브 쿼리
@Entity
public class User extends PanacheEntity {
  public static List<User> findByEmailNative(String email) {
    return getEntityManager()
        .createNativeQuery("SELECT * FROM users WHERE email = :email", User.class)
        .setParameter("email", email)
        .getResultList();
  }
}
```

## 비밀번호 해싱

```java
@ApplicationScoped
public class PasswordService {

  public String hash(String plainPassword) {
    return BcryptUtil.bcryptHash(plainPassword);
  }

  public boolean verify(String plainPassword, String hashedPassword) {
    return BcryptUtil.matches(plainPassword, hashedPassword);
  }
}

// 서비스에서
@ApplicationScoped
public class UserService {
  @Inject
  PasswordService passwordService;

  @Transactional
  public User register(CreateUserDto dto) {
    String hashedPassword = passwordService.hash(dto.password());
    User user = new User();
    user.email = dto.email();
    user.password = hashedPassword;
    user.persist();
    return user;
  }

  public boolean authenticate(String email, String password) {
    return User.find("email", email)
        .firstResultOptional()
        .map(u -> passwordService.verify(password, u.password))
        .orElse(false);
  }
}
```

## CORS 설정

```properties
# application.properties
quarkus.http.cors=true
quarkus.http.cors.origins=https://app.example.com,https://admin.example.com
quarkus.http.cors.methods=GET,POST,PUT,DELETE
quarkus.http.cors.headers=accept,authorization,content-type,x-requested-with
quarkus.http.cors.exposed-headers=Content-Disposition
quarkus.http.cors.access-control-max-age=24H
quarkus.http.cors.access-control-allow-credentials=true
```

## 시크릿 관리

```properties
# application.properties - 시크릿은 여기에 두지 마세요

# 환경 변수를 사용하세요
quarkus.datasource.username=${DB_USER}
quarkus.datasource.password=${DB_PASSWORD}
quarkus.oidc.credentials.secret=${OIDC_CLIENT_SECRET}

# 또는 Vault를 사용하세요
quarkus.vault.url=https://vault.example.com
quarkus.vault.authentication.kubernetes.role=my-role
```

### HashiCorp Vault 연동

```java
@ApplicationScoped
public class SecretService {

  @ConfigProperty(name = "api-key")
  String apiKey; // Vault에서 가져옵니다

  public String getSecret(String key) {
    return ConfigProvider.getConfig().getValue(key, String.class);
  }
}
```

## 요청 제한 (Rate Limiting)

**보안 참고**: `X-Forwarded-For`를 직접 신뢰하지 마세요. 클라이언트가 위조할 수 있습니다.
서블릿 요청의 실제 원격 주소를 사용하거나, 가능하면 인증된 신원(API 키, JWT subject)을 사용하세요.

```java
@ApplicationScoped
public class RateLimitFilter implements ContainerRequestFilter {
  private final Map<String, RateLimiter> limiters = new ConcurrentHashMap<>();

  @Inject
  HttpServletRequest servletRequest;

  @Override
  public void filter(ContainerRequestContext requestContext) {
    String clientId = getClientIdentifier();
    RateLimiter limiter = limiters.computeIfAbsent(clientId,
        k -> RateLimiter.create(100.0)); // 초당 100 요청

    if (!limiter.tryAcquire()) {
      requestContext.abortWith(
          Response.status(429)
              .entity(Map.of("error", "Too many requests"))
              .build()
      );
    }
  }

  private String getClientIdentifier() {
    // 컨테이너가 제공하는 원격 주소를 사용하세요(X-Forwarded-For 아님).
    // 신뢰할 수 있는 프록시 뒤에 있다면 quarkus.http.proxy.proxy-address-forwarding=true를 설정하여
    // getRemoteAddr()가 실제 클라이언트 IP를 반환하도록 하세요.
    return servletRequest.getRemoteAddr();
  }
}
```

## 보안 헤더

```java
@Provider
public class SecurityHeadersFilter implements ContainerResponseFilter {

  @Override
  public void filter(ContainerRequestContext request, ContainerResponseContext response) {
    MultivaluedMap<String, Object> headers = response.getHeaders();

    // 클릭재킹 방지
    headers.putSingle("X-Frame-Options", "DENY");

    // XSS 보호
    headers.putSingle("X-Content-Type-Options", "nosniff");
    headers.putSingle("X-XSS-Protection", "1; mode=block");

    // HSTS
    headers.putSingle("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

    // CSP — script-src에 'unsafe-inline'을 쓰면 XSS 보호가 무력화되므로 피하세요.
    // 대신 nonce나 해시를 사용하세요. style-src의 'unsafe-inline'은 CSS 프레임워크가
    // 요구할 때 허용할 수 있지만, 가능하면 nonce를 우선하세요.
    headers.putSingle("Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");
  }
}
```

## 감사 로깅

```java
@ApplicationScoped
public class AuditService {
  private static final Logger LOG = Logger.getLogger(AuditService.class);

  @Inject
  SecurityIdentity securityIdentity;

  public void logAccess(String resource, String action) {
    String user = securityIdentity.isAnonymous()
        ? "anonymous"
        : securityIdentity.getPrincipal().getName();

    LOG.infof("AUDIT: user=%s action=%s resource=%s timestamp=%s",
        user, action, resource, Instant.now());
  }
}

// resource에서 사용
@Path("/api/sensitive")
public class SensitiveResource {
  @Inject
  AuditService auditService;

  @GET
  @RolesAllowed("ADMIN")
  public Response getData() {
    auditService.logAccess("sensitive-data", "READ");
    return Response.ok(data).build();
  }
}
```

## 의존성 보안 스캐닝

```bash
# Maven
mvn org.owasp:dependency-check-maven:check

# Gradle
./gradlew dependencyCheckAnalyze

# Quarkus 확장 점검
quarkus extension list --installable
```

## 모범 사례

- 운영 환경에서는 항상 HTTPS를 사용하세요
- 상태 비저장 인증을 위해 JWT 또는 OIDC를 활성화하세요
- 선언적 인가에는 `@RolesAllowed`를 사용하세요
- Bean Validation으로 모든 입력을 검증하세요
- 비밀번호는 BCrypt로 해싱하세요(평문 저장 금지)
- 시크릿은 Vault 또는 환경 변수에 저장하세요
- SQL 인젝션을 막기 위해 매개변수화된 쿼리를 사용하세요
- 모든 응답에 보안 헤더를 추가하세요
- 공개 엔드포인트에는 요청 제한을 구현하세요
- 민감한 작업을 감사하세요
- 의존성을 최신으로 유지하고 CVE를 스캔하세요
- 프로그래밍 방식 검사에는 SecurityIdentity를 사용하세요
- 적절한 CORS 정책을 설정하세요
- 인증과 인가 경로를 테스트하세요
