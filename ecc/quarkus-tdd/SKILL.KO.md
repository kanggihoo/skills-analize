---
name: quarkus-tdd
description: JUnit 5, Mockito, REST Assured, Camel 테스트, JaCoCo를 사용하는 Quarkus 3.x LTS용 테스트 주도 개발. 기능을 추가하거나, 버그를 수정하거나, 이벤트 기반 서비스를 리팩터링할 때 사용합니다.
metadata:
  origin: ECC
---

# Quarkus TDD 워크플로

단위 테스트와 통합 테스트를 합쳐 80% 이상의 커버리지를 목표로 하는 Quarkus 3.x 서비스용 TDD 가이드입니다. Apache Camel을 사용하는 이벤트 기반 아키텍처에 최적화되어 있습니다.

## 사용 시점

- 새로운 기능이나 REST 엔드포인트를 만들 때
- 버그를 수정하거나 리팩터링할 때
- 데이터 접근 로직, 보안 규칙, 또는 reactive 스트림을 추가할 때
- Apache Camel 라우트와 이벤트 핸들러를 테스트할 때
- RabbitMQ를 사용하는 이벤트 기반 서비스를 테스트할 때
- 조건부 흐름 로직을 테스트할 때
- CompletableFuture 비동기 작업을 검증할 때
- LogContext 전파를 테스트할 때

## 워크플로

1. 먼저 테스트를 작성하세요(실패해야 합니다)
2. 테스트를 통과시키는 최소한의 코드를 구현하세요
3. 테스트가 green인 상태에서 리팩터링하세요
4. JaCoCo로 커버리지를 강제하세요(80% 이상 목표)

## @Nested 구성을 사용하는 단위 테스트

포괄적이고 읽기 쉬운 테스트를 위해 다음 구조화된 접근법을 따르세요.

```java
@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService Unit Tests")
class OrderServiceTest {

  @Mock
  private OrderRepository orderRepository;

  @Mock
  private EventService eventService;

  @Mock
  private FulfillmentPublisher fulfillmentPublisher;

  @InjectMocks
  private OrderService orderService;

  private CreateOrderCommand validCommand;

  @BeforeEach
  void setUp() {
    validCommand = new CreateOrderCommand(
        "customer-123",
        List.of(new OrderLine("sku-123", 2))
    );
  }

  @Nested
  @DisplayName("Tests for createOrder")
  class CreateOrder {

    @Test
    @DisplayName("Should persist order and publish fulfillment event")
    void givenValidCommand_whenCreateOrder_thenPersistsAndPublishes() {
      // ARRANGE
      doNothing().when(orderRepository).persist(any(Order.class));

      // ACT
      OrderReceipt receipt = orderService.createOrder(validCommand);

      // ASSERT
      assertThat(receipt).isNotNull();
      assertThat(receipt.customerId()).isEqualTo("customer-123");
      verify(orderRepository).persist(any(Order.class));
      verify(fulfillmentPublisher).publishAsync(receipt);
      verify(eventService).createSuccessEvent(receipt, "ORDER_CREATED");
    }

    @Test
    @DisplayName("Should reject missing customer id")
    void givenMissingCustomerId_whenCreateOrder_thenThrowsBadRequest() {
      // ARRANGE
      CreateOrderCommand invalid = new CreateOrderCommand("", validCommand.lines());

      // ACT & ASSERT
      WebApplicationException exception = assertThrows(
          WebApplicationException.class,
          () -> orderService.createOrder(invalid)
      );

      assertThat(exception.getResponse().getStatus()).isEqualTo(400);
      verify(orderRepository, never()).persist(any(Order.class));
      verify(fulfillmentPublisher, never()).publishAsync(any());
    }

    @Test
    @DisplayName("Should record error event when persistence fails")
    void givenPersistenceFailure_whenCreateOrder_thenRecordsErrorEvent() {
      // ARRANGE
      doThrow(new PersistenceException("database unavailable"))
          .when(orderRepository).persist(any(Order.class));

      // ACT & ASSERT
      PersistenceException exception = assertThrows(
          PersistenceException.class,
          () -> orderService.createOrder(validCommand)
      );

      assertThat(exception.getMessage()).contains("database unavailable");
      verify(eventService).createErrorEvent(
          eq(validCommand),
          eq("ORDER_CREATE_FAILED"),
          contains("database unavailable")
      );
      verify(fulfillmentPublisher, never()).publishAsync(any());
    }

    @Test
    @DisplayName("Should reject null commands")
    void givenNullCommand_whenCreateOrder_thenThrowsNullPointerException() {
      // ACT & ASSERT
      assertThrows(
          NullPointerException.class,
          () -> orderService.createOrder(null)
      );

      verify(orderRepository, never()).persist(any(Order.class));
    }
  }
}
```

### 핵심 테스트 패턴

1. **@Nested 클래스**: 테스트하는 메서드별로 테스트를 묶습니다
2. **@DisplayName**: 테스트 보고서에 보일 읽기 쉬운 테스트 설명을 제공합니다
3. **명명 규칙**: 명확성을 위해 `givenX_whenY_thenZ`를 사용합니다
4. **AAA 패턴**: 명시적인 `// ARRANGE`, `// ACT`, `// ASSERT` 주석을 사용합니다
5. **@BeforeEach**: 중복을 줄이기 위해 공통 테스트 데이터를 설정합니다
6. **assertDoesNotThrow**: 예외를 잡지 않고 성공 시나리오를 테스트합니다
7. **assertThrows**: AssertJ로 메시지를 검증하며 예외 시나리오를 테스트합니다
8. **포괄적인 커버리지**: 정상 경로, null 입력, 엣지 케이스, 예외를 테스트합니다
9. **상호작용 검증**: Mockito `verify()`로 메서드가 올바르게 호출되었는지 확인합니다
10. **호출되지 않았음 검증**: 오류 시나리오에서 메서드가 호출되지 않았음을 `never()`로 확인합니다

## Camel 라우트 테스트

```java
@QuarkusTest
@DisplayName("Business Rules Camel Route Tests")
class BusinessRulesRouteTest {

  @Inject
  CamelContext camelContext;

  @Inject
  ProducerTemplate producerTemplate;

  @InjectMock
  EventService eventService;

  @InjectMock
  DocumentValidator documentValidator;

  private BusinessRulesPayload testPayload;

  @BeforeEach
  void setUp() {
    // ARRANGE - 테스트 데이터
    testPayload = new BusinessRulesPayload();
    testPayload.setDocumentId(1L);
    testPayload.setFlowProfile(FlowProfile.BASIC);
  }

  @Nested
  @DisplayName("Tests for business-rules-publisher route")
  class BusinessRulesPublisher {

    @Test
    @DisplayName("Should successfully publish message to RabbitMQ")
    void givenValidPayload_whenPublish_thenMessageSentToQueue() throws Exception {
      // ARRANGE
      MockEndpoint mockRabbitMQ = camelContext.getEndpoint("mock:rabbitmq", MockEndpoint.class);
      mockRabbitMQ.expectedMessageCount(1);

      // 테스트를 위해 실제 엔드포인트를 mock으로 교체합니다
      camelContext.getRouteController().stopRoute("business-rules-publisher");
      AdviceWith.adviceWith(camelContext, "business-rules-publisher", advice -> {
        advice.replaceFromWith("direct:business-rules-publisher");
        advice.weaveByToString(".*spring-rabbitmq.*").replace().to("mock:rabbitmq");
      });
      camelContext.getRouteController().startRoute("business-rules-publisher");

      // ACT
      producerTemplate.sendBody("direct:business-rules-publisher", testPayload);

      // ASSERT — .marshal().json(JsonLibrary.Jackson) 이후 body는 JSON 문자열입니다
      mockRabbitMQ.assertIsSatisfied(5000);

      assertThat(mockRabbitMQ.getExchanges()).hasSize(1);
      String body = mockRabbitMQ.getExchanges().get(0).getIn().getBody(String.class);
      assertThat(body).contains("\"documentId\":1");
    }

    @Test
    @DisplayName("Should handle marshalling to JSON")
    void givenPayload_whenPublish_thenMarshalledToJson() throws Exception {
      // ARRANGE
      MockEndpoint mockMarshal = new MockEndpoint("mock:marshal");
      camelContext.addEndpoint("mock:marshal", mockMarshal);
      mockMarshal.expectedMessageCount(1);

      camelContext.getRouteController().stopRoute("business-rules-publisher");
      AdviceWith.adviceWith(camelContext, "business-rules-publisher", advice -> {
        advice.weaveAddLast().to("mock:marshal");
      });
      camelContext.getRouteController().startRoute("business-rules-publisher");

      // ACT
      producerTemplate.sendBody("direct:business-rules-publisher", testPayload);

      // ASSERT
      mockMarshal.assertIsSatisfied(5000);

      String body = mockMarshal.getExchanges().get(0).getIn().getBody(String.class);
      assertThat(body).contains("\"documentId\":1");
      assertThat(body).contains("\"flowProfile\":\"BASIC\"");
    }
  }

  @Nested
  @DisplayName("Tests for document-processing route")
  class DocumentProcessing {

    @Test
    @DisplayName("Should route invoice to correct processor")
    void givenInvoiceType_whenProcess_thenRoutesToInvoiceProcessor() throws Exception {
      // ARRANGE
      MockEndpoint mockInvoice = camelContext.getEndpoint("mock:invoice", MockEndpoint.class);
      mockInvoice.expectedMessageCount(1);

      camelContext.getRouteController().stopRoute("document-processing");
      AdviceWith.adviceWith(camelContext, "document-processing", advice -> {
        advice.weaveByToString(".*direct:process-invoice.*").replace().to("mock:invoice");
      });
      camelContext.getRouteController().startRoute("document-processing");

      // ACT
      producerTemplate.sendBodyAndHeader("direct:process-document",
          testPayload, "documentType", "INVOICE");

      // ASSERT
      mockInvoice.assertIsSatisfied(5000);
    }

    @Test
    @DisplayName("Should handle validation errors gracefully")
    void givenValidationError_whenProcess_thenRoutesToErrorHandler() throws Exception {
      // ARRANGE
      MockEndpoint mockError = camelContext.getEndpoint("mock:error", MockEndpoint.class);
      mockError.expectedMessageCount(1);

      camelContext.getRouteController().stopRoute("document-processing");
      AdviceWith.adviceWith(camelContext, "document-processing", advice -> {
        advice.weaveByToString(".*direct:validation-error-handler.*")
            .replace().to("mock:error");
      });
      camelContext.getRouteController().startRoute("document-processing");

      // 검증기 빈이 예외를 던지도록 mock을 설정합니다
      when(documentValidator.validate(any())).thenThrow(new ValidationException("Invalid document"));

      // ACT
      producerTemplate.sendBody("direct:process-document", testPayload);

      // ASSERT
      mockError.assertIsSatisfied(5000);

      Exception exception = mockError.getExchanges().get(0).getException();
      assertThat(exception).isInstanceOf(ValidationException.class);
      assertThat(exception.getMessage()).contains("Invalid document");
    }
  }
}
```

## 이벤트 서비스 테스트

```java
@ExtendWith(MockitoExtension.class)
@DisplayName("EventService Unit Tests")
class EventServiceTest {

  @Mock
  private EventRepository eventRepository;

  @Mock
  private ObjectMapper objectMapper;

  @InjectMocks
  private EventService eventService;

  private BusinessRulesPayload testPayload;

  @BeforeEach
  void setUp() {
    // ARRANGE
    testPayload = new BusinessRulesPayload();
    testPayload.setDocumentId(1L);
  }

  @Nested
  @DisplayName("Tests for createSuccessEvent")
  class CreateSuccessEvent {

    @Test
    @DisplayName("Should create success event with correct attributes")
    void givenValidPayload_whenCreateSuccessEvent_thenEventPersisted() throws Exception {
      // ARRANGE
      when(objectMapper.writeValueAsString(testPayload)).thenReturn("{\"documentId\":1}");

      // ACT
      assertDoesNotThrow(() ->
          eventService.createSuccessEvent(testPayload, "DOCUMENT_PROCESSED"));

      // ASSERT
      verify(eventRepository).persist(argThat(event ->
          event.getType().equals("DOCUMENT_PROCESSED") &&
          event.getStatus() == EventStatus.SUCCESS &&
          event.getPayload().equals("{\"documentId\":1}") &&
          event.getTimestamp() != null
      ));
    }

    @Test
    @DisplayName("Should throw exception when payload is null")
    void givenNullPayload_whenCreateSuccessEvent_thenThrowsException() {
      // ARRANGE
      Object nullPayload = null;

      // ACT & ASSERT
      NullPointerException exception = assertThrows(
          NullPointerException.class,
          () -> eventService.createSuccessEvent(nullPayload, "EVENT_TYPE")
      );

      assertThat(exception.getMessage()).isEqualTo("Payload cannot be null");
      verify(eventRepository, never()).persist(any());
    }
  }

  @Nested
  @DisplayName("Tests for createErrorEvent")
  class CreateErrorEvent {

    @Test
    @DisplayName("Should create error event with error message")
    void givenError_whenCreateErrorEvent_thenEventPersistedWithMessage() throws Exception {
      // ARRANGE
      String errorMessage = "Processing failed";
      when(objectMapper.writeValueAsString(testPayload)).thenReturn("{\"documentId\":1}");

      // ACT
      assertDoesNotThrow(() ->
          eventService.createErrorEvent(testPayload, "PROCESSING_ERROR", errorMessage));

      // ASSERT
      verify(eventRepository).persist(argThat(event ->
          event.getType().equals("PROCESSING_ERROR") &&
          event.getStatus() == EventStatus.ERROR &&
          event.getErrorMessage().equals(errorMessage) &&
          event.getPayload().equals("{\"documentId\":1}")
      ));
    }

    @ParameterizedTest
    @DisplayName("Should reject invalid error messages")
    @ValueSource(strings = {"", " "})
    void givenBlankErrorMessage_whenCreateErrorEvent_thenThrowsException(String blankMessage) {
      // ACT & ASSERT
      IllegalArgumentException exception = assertThrows(
          IllegalArgumentException.class,
          () -> eventService.createErrorEvent(testPayload, "ERROR", blankMessage)
      );

      assertThat(exception.getMessage()).contains("Error message cannot be blank");
    }
  }
}
```

## CompletableFuture 테스트

```java
@ExtendWith(MockitoExtension.class)
@DisplayName("FileStorageService Unit Tests")
class FileStorageServiceTest {

  @Mock
  private S3Client s3Client;

  @Mock
  private ExecutorService executorService;

  @InjectMocks
  private FileStorageService fileStorageService;

  private InputStream testInputStream;
  private LogContext testLogContext;

  @BeforeEach
  void setUp() {
    // ARRANGE
    testInputStream = new ByteArrayInputStream("test content".getBytes());
    testLogContext = new LogContext();
    testLogContext.put("traceId", "trace-123");
  }

  @Nested
  @DisplayName("Tests for uploadOriginalFile")
  class UploadOriginalFile {

    @Test
    @DisplayName("Should successfully upload file and return document info")
    void givenValidFile_whenUpload_thenReturnsDocumentInfo() throws Exception {
      // ARRANGE
      doAnswer(invocation -> {
        ((Runnable) invocation.getArgument(0)).run();
        return null;
      }).when(executorService).execute(any(Runnable.class));

      when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
          .thenReturn(PutObjectResponse.builder().build());

      // ACT
      CompletableFuture<StoredDocumentInfo> future =
          fileStorageService.uploadOriginalFile(testInputStream, 1024L,
              testLogContext, InvoiceFormat.UBL);

      StoredDocumentInfo result = future.join();

      // ASSERT
      assertThat(result).isNotNull();
      assertThat(result.getPath()).isNotBlank();
      assertThat(result.getSize()).isEqualTo(1024L);
      assertThat(result.getUploadedAt()).isNotNull();

      verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    @DisplayName("Should handle S3 upload failure")
    void givenS3Failure_whenUpload_thenCompletableFutureFails() {
      // ARRANGE — 예외가 future를 통해 전파되도록 동기적으로 실행합니다
      doAnswer(invocation -> {
        ((Runnable) invocation.getArgument(0)).run();
        return null;
      }).when(executorService).execute(any(Runnable.class));

      when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
          .thenThrow(new StorageException("S3 unavailable"));

      // ACT
      CompletableFuture<StoredDocumentInfo> future =
          fileStorageService.uploadOriginalFile(testInputStream, 1024L,
              testLogContext, InvoiceFormat.UBL);

      // ASSERT
      assertThatThrownBy(() -> future.join())
          .isInstanceOf(CompletionException.class)
          .hasCauseInstanceOf(StorageException.class)
          .hasMessageContaining("S3 unavailable");
    }

    @Test
    @DisplayName("Should propagate LogContext to async operation")
    void givenLogContext_whenUpload_thenContextPropagated() throws Exception {
      // ARRANGE
      AtomicReference<LogContext> capturedContext = new AtomicReference<>();

      doAnswer(invocation -> {
        capturedContext.set(CustomLog.getCurrentContext());
        ((Runnable) invocation.getArgument(0)).run();
        return null;
      }).when(executorService).execute(any(Runnable.class));

      // ACT
      fileStorageService.uploadOriginalFile(testInputStream, 1024L,
          testLogContext, InvoiceFormat.UBL).join();

      // ASSERT
      assertThat(capturedContext.get()).isNotNull();
      assertThat(capturedContext.get().get("traceId")).isEqualTo("trace-123");
    }
  }
}
```

## Resource 계층 테스트 (REST Assured)

```java
@QuarkusTest
@DisplayName("DocumentResource API Tests")
class DocumentResourceTest {

  @InjectMock
  DocumentService documentService;

  @Nested
  @DisplayName("Tests for GET /api/documents")
  class ListDocuments {

    @Test
    @DisplayName("Should return list of documents")
    void givenDocumentsExist_whenList_thenReturnsOk() {
      // ARRANGE
      List<Document> documents = List.of(createDocument(1L, "DOC-001"));
      when(documentService.list(0, 20)).thenReturn(documents);

      // ACT & ASSERT
      given()
          .when().get("/api/documents")
          .then()
          .statusCode(200)
          .body("$.size()", is(1))
          .body("[0].referenceNumber", equalTo("DOC-001"));
    }
  }

  @Nested
  @DisplayName("Tests for POST /api/documents")
  class CreateDocument {

    @Test
    @DisplayName("Should create document and return 201")
    void givenValidRequest_whenCreate_thenReturns201() {
      // ARRANGE
      Document document = createDocument(1L, "DOC-001");
      when(documentService.create(any())).thenReturn(document);

      // ACT & ASSERT
      given()
          .contentType(ContentType.JSON)
          .body("""
              {
                "referenceNumber": "DOC-001",
                "description": "Test document",
                "validUntil": "2030-01-01T00:00:00Z",
                "categories": ["test"]
              }
              """)
          .when().post("/api/documents")
          .then()
          .statusCode(201)
          .header("Location", containsString("/api/documents/1"))
          .body("referenceNumber", equalTo("DOC-001"));
    }

    @Test
    @DisplayName("Should return 400 for invalid input")
    void givenInvalidRequest_whenCreate_thenReturns400() {
      // ACT & ASSERT
      given()
          .contentType(ContentType.JSON)
          .body("""
              {
                "referenceNumber": "",
                "description": "Test"
              }
              """)
          .when().post("/api/documents")
          .then()
          .statusCode(400);
    }
  }

  private Document createDocument(Long id, String referenceNumber) {
    Document document = new Document();
    document.setId(id);
    document.setReferenceNumber(referenceNumber);
    document.setStatus(DocumentStatus.PENDING);
    return document;
  }
}
```

## 실제 데이터베이스를 사용하는 통합 테스트

```java
@QuarkusTest
@TestProfile(IntegrationTestProfile.class)
@DisplayName("Document Integration Tests")
class DocumentIntegrationTest {

  @Test
  @Transactional
  @DisplayName("Should create and retrieve document via API")
  void givenNewDocument_whenCreateAndRetrieve_thenSuccessful() {
    // ACT - API로 생성
    Long id = given()
        .contentType(ContentType.JSON)
        .body("""
            {
              "referenceNumber": "INT-001",
              "description": "Integration test",
              "validUntil": "2030-01-01T00:00:00Z",
              "categories": ["test"]
            }
            """)
        .when().post("/api/documents")
        .then()
        .statusCode(201)
        .extract().path("id");

    // ASSERT - API로 조회
    given()
        .when().get("/api/documents/" + id)
        .then()
        .statusCode(200)
        .body("referenceNumber", equalTo("INT-001"));
  }
}
```

## JaCoCo로 커버리지 측정

### Maven 설정 (전체)

```xml
<plugin>
  <groupId>org.jacoco</groupId>
  <artifactId>jacoco-maven-plugin</artifactId>
  <version>0.8.13</version>
  <executions>
    <!-- 테스트 실행을 위한 에이전트 준비 -->
    <execution>
      <id>prepare-agent</id>
      <goals>
        <goal>prepare-agent</goal>
      </goals>
    </execution>

    <!-- 커버리지 보고서 생성 -->
    <execution>
      <id>report</id>
      <phase>verify</phase>
      <goals>
        <goal>report</goal>
      </goals>
    </execution>

    <!-- 커버리지 임계값 강제 -->
    <execution>
      <id>check</id>
      <goals>
        <goal>check</goal>
      </goals>
      <configuration>
        <rules>
          <rule>
            <element>BUNDLE</element>
            <limits>
              <limit>
                <counter>LINE</counter>
                <value>COVEREDRATIO</value>
                <minimum>0.80</minimum>
              </limit>
              <limit>
                <counter>BRANCH</counter>
                <value>COVEREDRATIO</value>
                <minimum>0.70</minimum>
              </limit>
            </limits>
          </rule>
        </rules>
      </configuration>
    </execution>
  </executions>
</plugin>
```

커버리지와 함께 테스트 실행:
```bash
mvn clean test
mvn jacoco:report
mvn jacoco:check

# 보고서 위치: target/site/jacoco/index.html
```

## 테스트 의존성

```xml
<dependencies>
    <!-- Quarkus 테스트 -->
    <dependency>
        <groupId>io.quarkus</groupId>
        <artifactId>quarkus-junit5</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>io.quarkus</groupId>
        <artifactId>quarkus-junit5-mockito</artifactId>
        <scope>test</scope>
    </dependency>

    <!-- Mockito -->
    <dependency>
        <groupId>org.mockito</groupId>
        <artifactId>mockito-core</artifactId>
        <scope>test</scope>
    </dependency>

    <!-- AssertJ (JUnit 단언문보다 우선) -->
    <dependency>
        <groupId>org.assertj</groupId>
        <artifactId>assertj-core</artifactId>
        <version>3.24.2</version>
        <scope>test</scope>
    </dependency>

    <!-- REST Assured -->
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>rest-assured</artifactId>
        <scope>test</scope>
    </dependency>

    <!-- Camel 테스트 -->
    <dependency>
        <groupId>org.apache.camel.quarkus</groupId>
        <artifactId>camel-quarkus-junit5</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## 모범 사례

### 테스트 구성
- 테스트하는 메서드별로 테스트를 묶으려면 `@Nested` 클래스를 사용하세요
- 보고서에 보이는 읽기 쉬운 테스트 설명을 위해 `@DisplayName`을 사용하세요
- 테스트 메서드에는 `givenX_whenY_thenZ` 명명 규칙을 따르세요
- 중복을 줄이기 위해 공통 테스트 데이터 설정에 `@BeforeEach`를 사용하세요

### 테스트 구조
- 명시적인 주석(`// ARRANGE`, `// ACT`, `// ASSERT`)과 함께 AAA 패턴을 따르세요
- 성공 시나리오에는 `assertDoesNotThrow`를 사용하세요
- 예외 시나리오에는 메시지 검증과 함께 `assertThrows`를 사용하세요
- AssertJ `contains()` 또는 `isEqualTo()`로 예외 메시지가 기대값과 일치하는지 검증하세요

### 테스트 커버리지
- 모든 public 메서드의 정상 경로를 테스트하세요
- null 입력 처리를 테스트하세요
- 엣지 케이스(빈 컬렉션, 경계값, 음수 ID, 빈 문자열)를 테스트하세요
- 예외 시나리오를 포괄적으로 테스트하세요
- 모든 외부 의존성(repository, 서비스, Camel 엔드포인트)을 모킹하세요
- 라인 커버리지 80% 이상, 브랜치 커버리지 70% 이상을 목표로 하세요

### 단언문
- 값 검사에는 JUnit 단언문보다 **AssertJ**(`assertThat`)를 우선하세요
- 가독성을 위해 유창한 AssertJ API를 사용하세요: `assertThat(list).hasSize(3).contains(item)`
- 예외의 경우: JUnit `assertThrows`로 잡은 뒤, AssertJ로 메시지를 검증하세요
- 예외가 발생하지 않는 성공 경로에는 JUnit `assertDoesNotThrow`를 사용하세요
- 컬렉션에는 `extracting()`, `filteredOn()`, `containsExactly()`를 사용하세요

### 통합 테스트
- 통합 테스트에는 `@QuarkusTest`를 사용하세요
- Quarkus 테스트에서 의존성을 모킹하려면 `@InjectMock`을 사용하세요
- API 테스트에는 REST Assured를 우선하세요
- 테스트 전용 설정에는 `@TestProfile`을 사용하세요

### 이벤트 기반 테스트
- `AdviceWith`와 `MockEndpoint`로 Camel 라우트를 테스트하세요
- 독립형 Camel 테스트를 사용한다면 `@CamelQuarkusTest` 어노테이션을 사용하세요
- 메시지 내용, 헤더, 라우팅 로직을 검증하세요
- 오류 처리 라우트는 따로 테스트하세요
- 단위 테스트에서는 외부 시스템(RabbitMQ, S3, 데이터베이스)을 모킹하세요

### Camel 라우트 테스트
- 메시지 흐름을 단언하려면 `MockEndpoint`를 사용하세요
- 테스트를 위해 라우트를 수정하려면(엔드포인트를 mock으로 교체) `AdviceWith`를 사용하세요
- 메시지 변환과 마샬링을 테스트하세요
- 예외 처리와 dead letter 큐를 테스트하세요

### 비동기 작업 테스트
- CompletableFuture의 성공 및 실패 시나리오를 테스트하세요
- 비동기 완료를 기다리려면 테스트에서 `.join()`을 사용하세요
- CompletableFuture에서 예외가 전파되는지 테스트하세요
- 비동기 작업으로 LogContext가 전파되는지 검증하세요

### 성능
- 테스트를 빠르고 격리된 상태로 유지하세요
- 연속 모드로 테스트를 실행하세요: `mvn quarkus:test`
- 입력 변형에는 매개변수화된 테스트(`@ParameterizedTest`)를 사용하세요
- 재사용 가능한 테스트 데이터 빌더나 팩토리 메서드를 만드세요

### Quarkus 특화
- 최신 LTS 버전(Quarkus 3.x)을 유지하세요
- 네이티브 컴파일 호환성을 주기적으로 테스트하세요
- 시나리오별로 Quarkus 테스트 프로필을 사용하세요
- 로컬 테스트에는 Quarkus dev services를 활용하세요
- `@MockBean` 대신 `@InjectMock`을 사용하세요(Quarkus 전용)

### 검증 모범 사례
- 모킹된 의존성의 상호작용을 항상 검증하세요
- 오류 시나리오에서 메서드가 호출되지 않았음을 확인하려면 `verify(mock, never())`를 사용하세요
- 복잡한 인자 매칭에는 `argThat()`을 사용하세요
- 순서가 중요하면 Mockito의 `InOrder`로 호출 순서를 검증하세요
