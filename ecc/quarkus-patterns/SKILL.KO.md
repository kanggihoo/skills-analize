---
name: quarkus-patterns
description: 메시징을 위한 Camel, RESTful API 설계, CDI 서비스, Panache를 이용한 데이터 접근, 비동기 처리를 포함한 Quarkus 3.x LTS 아키텍처 패턴. 이벤트 기반 아키텍처를 갖춘 Java Quarkus 백엔드 작업에 사용합니다. Quarkus 서비스를 구축하거나 검토할 때, 특히 Camel 메시징이나 Panache 데이터 접근을 사용할 때 사용합니다.
metadata:
  origin: ECC
---

# Quarkus 개발 패턴

클라우드 네이티브 이벤트 기반 서비스와 Apache Camel을 위한 Quarkus 3.x 아키텍처 및 API 패턴입니다.

## 활성화 시점

- JAX-RS 또는 RESTEasy Reactive로 REST API를 구축할 때
- resource → service → repository 계층을 구성할 때
- Apache Camel과 RabbitMQ로 이벤트 기반 패턴을 구현할 때
- Hibernate Panache, 캐싱, 또는 reactive 스트림을 구성할 때
- 검증, 예외 매핑, 페이지네이션을 추가할 때
- dev/staging/production 환경별 프로필을 설정할 때(YAML 설정)
- LogContext와 Logback/Logstash 인코더를 이용한 사용자 정의 로깅
- 비동기 작업을 위해 CompletableFuture를 사용할 때
- 조건부 흐름 처리를 구현할 때
- GraalVM 네이티브 컴파일을 다룰 때

## 여러 의존성을 가진 서비스 계층

```java
@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class OrderProcessingService {

    private final OrderValidator orderValidator;
    private final EventService eventService;
    private final OrderRepository orderRepository;
    private final FulfillmentPublisher fulfillmentPublisher;
    private final AuditPublisher auditPublisher;

    @Transactional
    public OrderReceipt process(CreateOrderCommand command) {
        ValidationResult validation = orderValidator.validate(command);
        if (!validation.valid()) {
            eventService.createErrorEvent(command, "ORDER_REJECTED", validation.message());
            throw new WebApplicationException(validation.message(), Response.Status.BAD_REQUEST);
        }

        Order order = Order.from(command);
        orderRepository.persist(order);

        OrderReceipt receipt = OrderReceipt.from(order);
        fulfillmentPublisher.publishAsync(receipt);
        auditPublisher.publish("ORDER_ACCEPTED", receipt);
        eventService.createSuccessEvent(receipt, "ORDER_ACCEPTED");

        log.info("Processed order {}", order.id);
        return receipt;
    }
}
```

**핵심 패턴:**
- Lombok을 통한 생성자 주입을 위한 `@RequiredArgsConstructor`
- Logback 로깅을 위한 `@Slf4j`
- Panache 또는 repository를 통해 쓰기를 수행하는 서비스 메서드에 `@Transactional`
- 영속화 또는 메시지 발행 전에 입력을 검증
- 성공/오류 시나리오에 대한 이벤트 추적
- 비동기 Camel 메시지 발행

## 사용자 정의 로깅 컨텍스트 패턴 (Logback)

```java
@ApplicationScoped
public class ProcessingService {

    public void processDocument(Document doc) {
        LogContext logContext = CustomLog.getCurrentContext();
        try (SafeAutoCloseable ignored = CustomLog.startScope(logContext)) {
            // 모든 로그 문장에 컨텍스트를 추가합니다
            logContext.put("documentId", doc.getId().toString());
            logContext.put("documentType", doc.getType());
            logContext.put("userId", SecurityContext.getUserId());

            log.info("Starting document processing");

            // 이 스코프 안의 모든 로그가 컨텍스트를 상속합니다
            processInternal(doc);

            log.info("Document processing completed");
        } catch (Exception e) {
            log.error("Document processing failed", e);
            throw e;
        }
    }
}
```

**Logback 설정 (logback.xml):**

```xml
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <includeContext>true</includeContext>
            <includeMdc>true</includeMdc>
        </encoder>
    </appender>

    <logger name="com.example" level="INFO"/>
    <root level="WARN">
        <appender-ref ref="CONSOLE"/>
    </root>
</configuration>
```

## 이벤트 서비스 패턴

```java
@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;
    private final ObjectMapper objectMapper;

    public void createSuccessEvent(Object payload, String eventType) {
        Objects.requireNonNull(payload, "Payload cannot be null");
        Event event = new Event();
        event.setType(eventType);
        event.setStatus(EventStatus.SUCCESS);
        event.setPayload(serializePayload(payload));
        event.setTimestamp(Instant.now());

        eventRepository.persist(event);
        log.info("Success event created: {}", eventType);
    }

    public void createErrorEvent(Object payload, String eventType, String errorMessage) {
        Objects.requireNonNull(payload, "Payload cannot be null");
        if (errorMessage == null || errorMessage.isBlank()) {
            throw new IllegalArgumentException("Error message cannot be blank");
        }
        Event event = new Event();
        event.setType(eventType);
        event.setStatus(EventStatus.ERROR);
        event.setErrorMessage(errorMessage);
        event.setPayload(serializePayload(payload));
        event.setTimestamp(Instant.now());

        eventRepository.persist(event);
        log.error("Error event created: {} - {}", eventType, errorMessage);
    }

    private String serializePayload(Object payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize event payload", e);
        }
    }
}
```

## Camel 메시지 발행 (RabbitMQ)

```java
@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class BusinessRulesPublisher {
    private final ProducerTemplate producerTemplate;

    public void publishSync(BusinessRulesPayload payload) {
        producerTemplate.sendBody(
            "direct:business-rules-publisher",
            payload
        );
    }
}
```

**Camel 라우트 설정:**

```java
@ApplicationScoped
public class BusinessRulesRoute extends RouteBuilder {

    @ConfigProperty(name = "camel.rabbitmq.queue.business-rules")
    String businessRulesQueue;

    @ConfigProperty(name = "rabbitmq.host")
    String rabbitHost;

    @ConfigProperty(name = "rabbitmq.port")
    Integer rabbitPort;

    @Override
    public void configure() {
        from("direct:business-rules-publisher")
            .routeId("business-rules-publisher")
            .log("Publishing message to RabbitMQ: ${body}")
            .marshal().json(JsonLibrary.Jackson)
            .toF("spring-rabbitmq:%s?hostname=%s&portNumber=%d",
                businessRulesQueue, rabbitHost, rabbitPort);
    }
}
```

## Camel Direct 라우트 (인메모리)

```java
@ApplicationScoped
public class DocumentProcessingRoute extends RouteBuilder {

    @Override
    public void configure() {
        // 오류 처리
        onException(ValidationException.class)
            .handled(true)
            .to("direct:validation-error-handler")
            .log("Validation error: ${exception.message}");

        // 주요 처리 라우트
        from("direct:process-document")
            .routeId("document-processing")
            .log("Processing document: ${header.documentId}")
            .bean(DocumentValidator.class, "validate")
            .bean(DocumentTransformer.class, "transform")
            .choice()
                .when(header("documentType").isEqualTo("INVOICE"))
                    .to("direct:process-invoice")
                .when(header("documentType").isEqualTo("CREDIT_NOTE"))
                    .to("direct:process-credit-note")
                .otherwise()
                    .to("direct:process-generic")
            .end();

        from("direct:validation-error-handler")
            .bean(EventService.class, "createErrorEvent")
            .log("Validation error handled");
    }
}
```

## Camel 파일 처리

```java
@ApplicationScoped
public class FileMonitoringRoute extends RouteBuilder {

    @ConfigProperty(name = "file.input.directory")
    String inputDirectory;

    @ConfigProperty(name = "file.processed.directory")
    String processedDirectory;

    @ConfigProperty(name = "file.error.directory")
    String errorDirectory;

    @Override
    public void configure() {
        from("file:" + inputDirectory + "?move=" + processedDirectory +
             "&moveFailed=" + errorDirectory + "&delay=5000")
            .routeId("file-monitor")
            .log("Processing file: ${header.CamelFileName}")
            .to("direct:process-file");

        from("direct:process-file")
            .bean(OrderProcessingService.class, "processFile")
            .log("File processing completed");
    }
}
```

## Camel Bean 호출

```java
@ApplicationScoped
public class InvoiceRoute extends RouteBuilder {

    @Override
    public void configure() {
        from("direct:invoice-validation")
            .bean(InvoiceFlowValidator.class, "validateFlowWithConfig")
            .log("Validation result: ${body}");

        from("direct:persist-and-publish")
            .bean(DocumentJobService.class, "createDocumentAndJobEntities")
            .bean(BusinessRulesPublisher.class, "publishAsync")
            .bean(EventService.class, "createSuccessEvent(${body}, 'PUBLISHED')");
    }
}
```

## REST API 구조

```java
@Path("/api/documents")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class DocumentResource {
  private final DocumentService documentService;

  @GET
  public Response list(
      @QueryParam("page") @DefaultValue("0") int page,
      @QueryParam("size") @DefaultValue("20") int size) {
    List<Document> documents = documentService.list(page, size);
    return Response.ok(documents).build();
  }

  @POST
  public Response create(@Valid CreateDocumentRequest request, @Context UriInfo uriInfo) {
    Document document = documentService.create(request);
    URI location = uriInfo.getAbsolutePathBuilder()
        .path(String.valueOf(document.id))
        .build();
    return Response.created(location).entity(DocumentResponse.from(document)).build();
  }

  @GET
  @Path("/{id}")
  public Response getById(@PathParam("id") Long id) {
    return documentService.findById(id)
        .map(DocumentResponse::from)
        .map(Response::ok)
        .orElse(Response.status(Response.Status.NOT_FOUND))
        .build();
  }
}
```

## Repository 패턴 (Panache Repository)

```java
@ApplicationScoped
public class DocumentRepository implements PanacheRepository<Document> {

  public List<Document> findByStatus(DocumentStatus status, int page, int size) {
    return find("status = ?1 order by createdAt desc", status)
        .page(page, size)
        .list();
  }

  public Optional<Document> findByReferenceNumber(String referenceNumber) {
    return find("referenceNumber", referenceNumber).firstResultOptional();
  }

  public long countByStatusAndDate(DocumentStatus status, LocalDate date) {
    return count("status = ?1 and createdAt >= ?2", status, date.atStartOfDay());
  }
}
```

## 트랜잭션이 있는 서비스 계층

```java
@ApplicationScoped
@RequiredArgsConstructor
public class DocumentService {
  private final DocumentRepository repo;
  private final EventService eventService;

  @Transactional
  public Document create(CreateDocumentRequest request) {
    Document document = new Document();
    document.setReferenceNumber(request.referenceNumber());
    document.setDescription(request.description());
    document.setStatus(DocumentStatus.PENDING);
    document.setCreatedAt(Instant.now());

    repo.persist(document);

    eventService.createSuccessEvent(document, "DOCUMENT_CREATED");

    return document;
  }

  public Optional<Document> findById(Long id) {
    return repo.findByIdOptional(id);
  }

  public List<Document> list(int page, int size) {
    return repo.findAll()
        .page(page, size)
        .list();
  }
}
```

## DTO와 검증

```java
public record CreateDocumentRequest(
    @NotBlank @Size(max = 200) String referenceNumber,
    @NotBlank @Size(max = 2000) String description,
    @NotNull @FutureOrPresent Instant validUntil,
    @NotEmpty List<@NotBlank String> categories) {}

public record DocumentResponse(Long id, String referenceNumber, DocumentStatus status) {
  public static DocumentResponse from(Document document) {
    return new DocumentResponse(document.getId(), document.getReferenceNumber(),
        document.getStatus());
  }
}
```

## 예외 매핑

```java
@Provider
public class ValidationExceptionMapper implements ExceptionMapper<ConstraintViolationException> {
  @Override
  public Response toResponse(ConstraintViolationException exception) {
    String message = exception.getConstraintViolations().stream()
        .map(cv -> cv.getPropertyPath() + ": " + cv.getMessage())
        .collect(Collectors.joining(", "));

    return Response.status(Response.Status.BAD_REQUEST)
        .entity(Map.of("error", "validation_error", "message", message))
        .build();
  }
}

@Provider
@Slf4j
public class GenericExceptionMapper implements ExceptionMapper<Exception> {

  @Override
  public Response toResponse(Exception exception) {
    log.error("Unhandled exception", exception);
    return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
        .entity(Map.of("error", "internal_error", "message", "An unexpected error occurred"))
        .build();
  }
}
```

## CompletableFuture 비동기 작업

```java
@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class FileStorageService {
    private final S3Client s3Client;
    private final ExecutorService executorService;

    @ConfigProperty(name = "storage.bucket-name")
    String bucketName;

    public CompletableFuture<StoredDocumentInfo> uploadOriginalFile(
            InputStream inputStream,
            long size,
            LogContext logContext,
            InvoiceFormat format) {

        return CompletableFuture.supplyAsync(() -> {
            try (SafeAutoCloseable ignored = CustomLog.startScope(logContext)) {
                String path = generateStoragePath(format);

                PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(path)
                    .contentLength(size)
                    .build();

                s3Client.putObject(request, RequestBody.fromInputStream(inputStream, size));

                log.info("File uploaded to S3: {}", path);

                return new StoredDocumentInfo(path, size, Instant.now());
            } catch (Exception e) {
                log.error("Failed to upload file to S3", e);
                throw new StorageException("Upload failed", e);
            }
        }, executorService);
    }
}
```

## 캐싱

```java
@ApplicationScoped
@RequiredArgsConstructor
public class DocumentCacheService {
  private final DocumentRepository repo;

  @CacheResult(cacheName = "document-cache")
  public Optional<Document> getById(@CacheKey Long id) {
    return repo.findByIdOptional(id);
  }

  @CacheInvalidate(cacheName = "document-cache")
  public void evict(@CacheKey Long id) {}

  @CacheInvalidateAll(cacheName = "document-cache")
  public void evictAll() {}
}
```

## YAML로 된 설정

```yaml
# application.yml
"%dev":
  quarkus:
    datasource:
      jdbc:
        url: jdbc:postgresql://localhost:5432/dev_db
      username: dev_user
      password: ${DB_PASSWORD}
    hibernate-orm:
      database:
        generation: drop-and-create

  rabbitmq:
    host: localhost
    port: 5672
    username: ${RABBITMQ_USER}
    password: ${RABBITMQ_PASSWORD}

"%test":
  quarkus:
    datasource:
      jdbc:
        url: jdbc:h2:mem:test
    hibernate-orm:
      database:
        generation: drop-and-create

"%prod":
  quarkus:
    datasource:
      jdbc:
        url: ${DATABASE_URL}
      username: ${DB_USER}
      password: ${DB_PASSWORD}
    hibernate-orm:
      database:
        generation: validate

  rabbitmq:
    host: ${RABBITMQ_HOST}
    port: ${RABBITMQ_PORT}
    username: ${RABBITMQ_USER}
    password: ${RABBITMQ_PASSWORD}

# Camel 설정
camel:
  rabbitmq:
    queue:
      business-rules: business-rules-queue
      invoice-processing: invoice-processing-queue
```

## 상태 점검

```java
@Readiness
@ApplicationScoped
@RequiredArgsConstructor
public class DatabaseHealthCheck implements HealthCheck {
  private final AgroalDataSource dataSource;

  @Override
  public HealthCheckResponse call() {
    try (Connection conn = dataSource.getConnection()) {
      boolean valid = conn.isValid(2);
      return HealthCheckResponse.named("Database connection")
          .status(valid)
          .build();
    } catch (SQLException e) {
      return HealthCheckResponse.down("Database connection");
    }
  }
}

@Liveness
@ApplicationScoped
public class CamelHealthCheck implements HealthCheck {
  @Inject
  CamelContext camelContext;

  @Override
  public HealthCheckResponse call() {
    boolean isStarted = camelContext.getStatus().isStarted();
    return HealthCheckResponse.named("Camel Context")
        .status(isStarted)
        .build();
  }
}
```

## 의존성 (Maven)

```xml
<properties>
    <quarkus.platform.version>3.27.0</quarkus.platform.version>
    <lombok.version>1.18.42</lombok.version>
    <assertj-core.version>3.24.2</assertj-core.version>
    <jacoco-maven-plugin.version>0.8.13</jacoco-maven-plugin.version>
    <maven.compiler.release>17</maven.compiler.release>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.quarkus.platform</groupId>
            <artifactId>quarkus-bom</artifactId>
            <version>${quarkus.platform.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>io.quarkus.platform</groupId>
            <artifactId>quarkus-camel-bom</artifactId>
            <version>${quarkus.platform.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <!-- Quarkus 코어 -->
    <dependency>
        <groupId>io.quarkus</groupId>
        <artifactId>quarkus-arc</artifactId>
    </dependency>
    <dependency>
        <groupId>io.quarkus</groupId>
        <artifactId>quarkus-config-yaml</artifactId>
    </dependency>

    <!-- Camel 확장 -->
    <dependency>
        <groupId>org.apache.camel.quarkus</groupId>
        <artifactId>camel-quarkus-spring-rabbitmq</artifactId>
    </dependency>
    <dependency>
        <groupId>org.apache.camel.quarkus</groupId>
        <artifactId>camel-quarkus-direct</artifactId>
    </dependency>
    <dependency>
        <groupId>org.apache.camel.quarkus</groupId>
        <artifactId>camel-quarkus-bean</artifactId>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>${lombok.version}</version>
        <scope>provided</scope>
    </dependency>

    <!-- 로깅 -->
    <dependency>
        <groupId>io.quarkiverse.logging.logback</groupId>
        <artifactId>quarkus-logging-logback</artifactId>
    </dependency>
    <dependency>
        <groupId>net.logstash.logback</groupId>
        <artifactId>logstash-logback-encoder</artifactId>
    </dependency>
</dependencies>
```

## 모범 사례

### 아키텍처
- Lombok과 함께 생성자 주입을 위해 `@RequiredArgsConstructor`를 사용하세요
- 서비스 계층은 얇게 유지하고, 복잡한 로직은 전문화된 클래스에 위임하세요
- 메시지 라우팅과 통합 패턴에는 Camel 라우트를 사용하세요
- 데이터 접근에는 Panache Repository 패턴을 우선하세요

### 이벤트 기반
- 모든 작업은 EventService로 항상 추적하세요(성공/오류 이벤트)
- 인메모리 라우팅에는 Camel `direct:` 엔드포인트를 사용하세요
- RabbitMQ 통합에는 `spring-rabbitmq` 컴포넌트를 사용하세요
- `ProducerTemplate.asyncSendBody()`로 비동기 발행을 구현하세요

### 로깅
- 구조화된 로깅을 위해 Logstash 인코더와 함께 Logback을 사용하세요
- `SafeAutoCloseable`로 서비스 호출 전반에 LogContext를 전파하세요
- 요청 추적을 위해 LogContext에 상황 정보를 추가하세요
- 수동 로거 생성 대신 `@Slf4j`를 사용하세요

### 비동기 작업
- 논블로킹 I/O 작업에는 CompletableFuture를 사용하세요
- 완료를 기다려야 할 때는 `.join()`을 호출하세요
- CompletableFuture의 예외를 적절히 처리하세요
- 추적을 위해 비동기 작업에 LogContext를 전달하세요

### 설정
- YAML 설정(`quarkus-config-yaml`)을 사용하세요
- dev/test/prod 환경을 인식하는 프로필 설정을 사용하세요
- 민감한 설정은 환경 변수로 외부화하세요
- 타입 안전한 설정 주입에는 `@ConfigProperty`를 사용하세요

### 검증
- `@Valid`로 resource 계층에서 검증하세요
- DTO에는 Bean Validation 어노테이션을 사용하세요
- `@Provider`로 예외를 적절한 HTTP 응답에 매핑하세요

### 트랜잭션
- 데이터를 수정하는 서비스 메서드에 `@Transactional`을 사용하세요
- 트랜잭션은 짧고 집중적으로 유지하세요
- 트랜잭션 안에서 비동기 작업을 호출하지 마세요

### 테스트
- 라우트 테스트에는 `camel-quarkus-junit5`를 사용하세요
- 단언문에는 AssertJ를 사용하세요
- 모든 외부 의존성을 모킹하세요
- 조건부 흐름 로직을 철저히 테스트하세요

### Quarkus 특화
- 최신 LTS 버전(3.x)을 유지하세요
- 핫 리로드를 위해 Quarkus dev 모드를 사용하세요
- 운영 준비 상태를 위해 상태 점검을 추가하세요
- 네이티브 컴파일 호환성을 주기적으로 테스트하세요
