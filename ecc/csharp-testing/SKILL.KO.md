---
name: csharp-testing
description: xUnit, FluentAssertions, 모킹, 통합 테스트, 테스트 구성 모범 사례를 포함한 C# 및 .NET 테스트 패턴. C# / .NET 프로젝트에서 xUnit 테스트, 모의 객체, 통합 테스트를 작성하거나 검토할 때 사용.
metadata:
  origin: ECC
---

# C# 테스트 패턴

xUnit, FluentAssertions 및 최신 테스트 실천법을 사용한 .NET 애플리케이션의 테스트 패턴 모음.

## 활성화 시점

- C# 코드에 대한 새 테스트를 작성할 때
- 테스트 품질과 커버리지를 검토할 때
- .NET 프로젝트의 테스트 인프라를 구성할 때
- 불안정하거나(flaky) 느린 테스트를 디버깅할 때

## 테스트 프레임워크 스택

| 도구 | 용도 |
|---|---|
| **xUnit** | 테스트 프레임워크 (.NET에서 권장) |
| **FluentAssertions** | 읽기 쉬운 단언 문법 |
| **NSubstitute** 또는 **Moq** | 의존성 모킹 |
| **Testcontainers** | 통합 테스트에서 실제 인프라 사용 |
| **WebApplicationFactory** | ASP.NET Core 통합 테스트 |
| **Bogus** | 현실적인 테스트 데이터 생성 |

## 단위 테스트 구조

### Arrange-Act-Assert

```csharp
public sealed class OrderServiceTests
{
    private readonly IOrderRepository _repository = Substitute.For<IOrderRepository>();
    private readonly ILogger<OrderService> _logger = Substitute.For<ILogger<OrderService>>();
    private readonly OrderService _sut;

    public OrderServiceTests()
    {
        _sut = new OrderService(_repository, _logger);
    }

    [Fact]
    public async Task PlaceOrderAsync_ReturnsSuccess_WhenRequestIsValid()
    {
        // Arrange (준비)
        var request = new CreateOrderRequest
        {
            CustomerId = "cust-123",
            Items = [new OrderItem("SKU-001", 2, 29.99m)]
        };

        // Act (실행)
        var result = await _sut.PlaceOrderAsync(request, CancellationToken.None);

        // Assert (검증)
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.CustomerId.Should().Be("cust-123");
    }

    [Fact]
    public async Task PlaceOrderAsync_ReturnsFailure_WhenNoItems()
    {
        // Arrange (준비)
        var request = new CreateOrderRequest
        {
            CustomerId = "cust-123",
            Items = []
        };

        // Act (실행)
        var result = await _sut.PlaceOrderAsync(request, CancellationToken.None);

        // Assert (검증)
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("at least one item");
    }
}
```

### Theory를 이용한 매개변수화 테스트

```csharp
[Theory]
[InlineData("", false)]
[InlineData("a", false)]
[InlineData("ab@c.d", false)]
[InlineData("user@example.com", true)]
[InlineData("user+tag@example.co.uk", true)]
public void IsValidEmail_ReturnsExpected(string email, bool expected)
{
    EmailValidator.IsValid(email).Should().Be(expected);
}

[Theory]
[MemberData(nameof(InvalidOrderCases))]
public async Task PlaceOrderAsync_RejectsInvalidOrders(CreateOrderRequest request, string expectedError)
{
    var result = await _sut.PlaceOrderAsync(request, CancellationToken.None);

    result.IsSuccess.Should().BeFalse();
    result.Error.Should().Contain(expectedError);
}

public static TheoryData<CreateOrderRequest, string> InvalidOrderCases => new()
{
    { new() { CustomerId = "", Items = [ValidItem()] }, "CustomerId" },
    { new() { CustomerId = "c1", Items = [] }, "at least one item" },
    { new() { CustomerId = "c1", Items = [new("", 1, 10m)] }, "SKU" },
};
```

## NSubstitute로 모킹하기

```csharp
[Fact]
public async Task GetOrderAsync_ReturnsNull_WhenNotFound()
{
    // Arrange (준비)
    var orderId = Guid.NewGuid();
    _repository.FindByIdAsync(orderId, Arg.Any<CancellationToken>())
        .Returns((Order?)null);

    // Act (실행)
    var result = await _sut.GetOrderAsync(orderId, CancellationToken.None);

    // Assert (검증)
    result.Should().BeNull();
}

[Fact]
public async Task PlaceOrderAsync_PersistsOrder()
{
    // Arrange (준비)
    var request = ValidOrderRequest();

    // Act (실행)
    await _sut.PlaceOrderAsync(request, CancellationToken.None);

    // Assert — 리포지토리가 호출되었는지 검증
    await _repository.Received(1).AddAsync(
        Arg.Is<Order>(o => o.CustomerId == request.CustomerId),
        Arg.Any<CancellationToken>());
}
```

## ASP.NET Core 통합 테스트

### WebApplicationFactory 설정

```csharp
public sealed class OrderApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public OrderApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // 실제 DB를 테스트용 인메모리 DB로 교체
                services.RemoveAll<DbContextOptions<AppDbContext>>();
                services.AddDbContext<AppDbContext>(options =>
                    options.UseInMemoryDatabase("TestDb"));
            });
        }).CreateClient();
    }

    [Fact]
    public async Task GetOrder_Returns404_WhenNotFound()
    {
        var response = await _client.GetAsync($"/api/orders/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateOrder_Returns201_WithValidRequest()
    {
        var request = new CreateOrderRequest
        {
            CustomerId = "cust-1",
            Items = [new("SKU-001", 1, 19.99m)]
        };

        var response = await _client.PostAsJsonAsync("/api/orders", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();
    }
}
```

### Testcontainers로 테스트하기

```csharp
public sealed class PostgresOrderRepositoryTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
        .Build();

    private AppDbContext _db = null!;

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(_postgres.GetConnectionString())
            .Options;
        _db = new AppDbContext(options);
        await _db.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        await _db.DisposeAsync();
        await _postgres.DisposeAsync();
    }

    [Fact]
    public async Task AddAsync_PersistsOrder()
    {
        var repo = new SqlOrderRepository(_db);
        var order = Order.Create("cust-1", [new OrderItem("SKU-001", 2, 10m)]);

        await repo.AddAsync(order, CancellationToken.None);

        var found = await repo.FindByIdAsync(order.Id, CancellationToken.None);
        found.Should().NotBeNull();
        found!.Items.Should().HaveCount(1);
    }
}
```

## 테스트 구성

```
tests/
  MyApp.UnitTests/
    Services/
      OrderServiceTests.cs
      PaymentServiceTests.cs
    Validators/
      EmailValidatorTests.cs
  MyApp.IntegrationTests/
    Api/
      OrderApiTests.cs
    Repositories/
      OrderRepositoryTests.cs
  MyApp.TestHelpers/
    Builders/
      OrderBuilder.cs
    Fixtures/
      DatabaseFixture.cs
```

## 테스트 데이터 빌더

```csharp
public sealed class OrderBuilder
{
    private string _customerId = "cust-default";
    private readonly List<OrderItem> _items = [new("SKU-001", 1, 10m)];

    public OrderBuilder WithCustomer(string customerId)
    {
        _customerId = customerId;
        return this;
    }

    public OrderBuilder WithItem(string sku, int quantity, decimal price)
    {
        _items.Add(new OrderItem(sku, quantity, price));
        return this;
    }

    public Order Build() => Order.Create(_customerId, _items);
}

// 테스트에서의 사용 예
var order = new OrderBuilder()
    .WithCustomer("cust-vip")
    .WithItem("SKU-PREMIUM", 3, 99.99m)
    .Build();
```

## 흔한 안티패턴

| 안티패턴 | 해결 방법 |
|---|---|
| 구현 세부 사항을 테스트하기 | 동작과 결과를 테스트한다 |
| 공유되는 가변 테스트 상태 | 테스트마다 새 인스턴스 사용 (xUnit은 생성자를 통해 이를 자동으로 수행) |
| 비동기 테스트에서 `Thread.Sleep` 사용 | 타임아웃이 있는 `Task.Delay` 또는 폴링 헬퍼 사용 |
| `ToString()` 출력에 대해 단언하기 | 타입이 있는 속성에 대해 단언한다 |
| 테스트 하나에 거대한 단언 하나 | 테스트 하나에 논리적 단언 하나 |
| 구현을 설명하는 테스트 이름 | 동작 기준으로 이름 짓기: `Method_ExpectedResult_WhenCondition` |
| `CancellationToken` 무시하기 | 항상 전달하고 취소 동작을 검증한다 |

## 테스트 실행

```bash
# 모든 테스트 실행
dotnet test

# 커버리지와 함께 실행
dotnet test --collect:"XPlat Code Coverage"

# 특정 프로젝트 실행
dotnet test tests/MyApp.UnitTests/

# 테스트 이름으로 필터링
dotnet test --filter "FullyQualifiedName~OrderService"

# 개발 중 감시(watch) 모드
dotnet watch test --project tests/MyApp.UnitTests/
```
