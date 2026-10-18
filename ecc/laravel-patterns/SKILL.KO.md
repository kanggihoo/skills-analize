---
name: laravel-patterns
description: 프로덕션 앱을 위한 Laravel 아키텍처 패턴, 라우팅/컨트롤러, Eloquent ORM, 서비스 레이어, 큐, 이벤트, 캐싱, API 리소스. Laravel 앱을 만들거나 리뷰할 때 사용합니다 — 컨트롤러, Eloquent, 서비스 레이어, 큐, API 리소스.
metadata:
  origin: ECC
---

# Laravel 개발 패턴

확장 가능하고 유지보수하기 쉬운 애플리케이션을 위한 프로덕션 수준의 Laravel 아키텍처 패턴입니다.

## 사용 시점

- Laravel 웹 애플리케이션이나 API를 만들 때
- 컨트롤러, 서비스, 도메인 로직을 구조화할 때
- Eloquent 모델과 관계를 다룰 때
- 리소스와 페이지네이션으로 API를 설계할 때
- 큐, 이벤트, 캐싱, 백그라운드 작업을 추가할 때

## 동작 방식

- 명확한 경계를 중심으로 앱을 구성합니다 (컨트롤러 -> 서비스/액션 -> 모델).
- 라우팅을 예측 가능하게 유지하도록 명시적 바인딩과 범위 바인딩(scoped binding)을 사용합니다. 접근 제어를 위한 권한 검사는 여전히 반드시 적용하세요.
- 도메인 로직을 일관되게 유지하도록 타입이 있는 모델, 캐스트, 스코프를 선호합니다.
- I/O 중심 작업은 큐에 넣고, 비용이 큰 읽기는 캐시하세요.
- 설정은 `config/*`에 집중시키고, 환경은 명시적으로 유지하세요.

## 예시

### 프로젝트 구조

계층 경계(HTTP, 서비스/액션, 모델)가 명확한 일반적인 Laravel 레이아웃을 사용합니다.

### 권장 레이아웃

```
app/
├── Actions/            # 단일 목적의 유스케이스
├── Console/
├── Events/
├── Exceptions/
├── Http/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Requests/       # 폼 요청 검증
│   └── Resources/      # API 리소스
├── Jobs/
├── Models/
├── Policies/
├── Providers/
├── Services/           # 도메인 서비스 조율
└── Support/
config/
database/
├── factories/
├── migrations/
└── seeders/
resources/
├── views/
└── lang/
routes/
├── api.php
├── web.php
└── console.php
```

### 컨트롤러 -> 서비스 -> 액션

컨트롤러는 얇게 유지합니다. 조율 로직은 서비스에, 단일 목적 로직은 액션에 둡니다.

```php
final class CreateOrderAction
{
    public function __construct(private OrderRepository $orders) {}

    public function handle(CreateOrderData $data): Order
    {
        return $this->orders->create($data);
    }
}

final class OrdersController extends Controller
{
    public function __construct(private CreateOrderAction $createOrder) {}

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->createOrder->handle($request->toDto());

        return response()->json([
            'success' => true,
            'data' => OrderResource::make($order),
            'error' => null,
            'meta' => null,
        ], 201);
    }
}
```

### 라우팅과 컨트롤러

명확성을 위해 라우트 모델 바인딩과 리소스 컨트롤러를 선호합니다.

```php
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('projects', ProjectController::class);
});
```

### 라우트 모델 바인딩 (범위 지정)

교차 테넌트 접근을 막으려면 범위 바인딩을 사용합니다.

```php
Route::scopeBindings()->group(function () {
    Route::get('/accounts/{account}/projects/{project}', [ProjectController::class, 'show']);
});
```

### 중첩 라우트와 바인딩 이름

- 이중 중첩을 피하도록 접두사와 경로를 일관되게 유지하세요 (예: `conversation`과 `conversations`).
- 바인딩되는 모델과 일치하는 단일 파라미터 이름을 사용하세요 (예: `Conversation`에는 `{conversation}`).
- 중첩할 때는 부모-자식 관계를 강제하도록 범위 바인딩을 우선하세요.

```php
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\MessageController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('conversations')->group(function () {
    Route::post('/', [ConversationController::class, 'store'])->name('conversations.store');

    Route::scopeBindings()->group(function () {
        Route::get('/{conversation}', [ConversationController::class, 'show'])
            ->name('conversations.show');

        Route::post('/{conversation}/messages', [MessageController::class, 'store'])
            ->name('conversation-messages.store');

        Route::get('/{conversation}/messages/{message}', [MessageController::class, 'show'])
            ->name('conversation-messages.show');
    });
});
```

파라미터를 다른 모델 클래스로 해석하고 싶다면 명시적 바인딩을 정의하세요. 커스텀 바인딩 로직이 필요하면 `Route::bind()`를 사용하거나 모델에 `resolveRouteBinding()`을 구현하세요.

```php
use App\Models\AiConversation;
use Illuminate\Support\Facades\Route;

Route::model('conversation', AiConversation::class);
```

### 서비스 컨테이너 바인딩

명확한 의존성 연결을 위해 서비스 프로바이더에서 인터페이스를 구현체에 바인딩합니다.

```php
use App\Repositories\EloquentOrderRepository;
use App\Repositories\OrderRepository;
use Illuminate\Support\ServiceProvider;

final class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(OrderRepository::class, EloquentOrderRepository::class);
    }
}
```

### Eloquent 모델 패턴

### 모델 설정

```php
final class Project extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'owner_id', 'status'];

    protected $casts = [
        'status' => ProjectStatus::class,
        'archived_at' => 'datetime',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNull('archived_at');
    }
}
```

### 커스텀 캐스트와 값 객체

엄격한 타이핑을 위해 enum이나 값 객체를 사용합니다.

```php
use Illuminate\Database\Eloquent\Casts\Attribute;

protected $casts = [
    'status' => ProjectStatus::class,
];
```

```php
protected function budgetCents(): Attribute
{
    return Attribute::make(
        get: fn (int $value) => Money::fromCents($value),
        set: fn (Money $money) => $money->toCents(),
    );
}
```

### N+1을 피하는 즉시 로딩

```php
$orders = Order::query()
    ->with(['customer', 'items.product'])
    ->latest()
    ->paginate(25);
```

### 복잡한 필터를 위한 쿼리 객체

```php
final class ProjectQuery
{
    public function __construct(private Builder $query) {}

    public function ownedBy(int $userId): self
    {
        $query = clone $this->query;

        return new self($query->where('owner_id', $userId));
    }

    public function active(): self
    {
        $query = clone $this->query;

        return new self($query->whereNull('archived_at'));
    }

    public function builder(): Builder
    {
        return $this->query;
    }
}
```

### 전역 스코프와 소프트 삭제

기본 필터링에는 전역 스코프를, 복구 가능한 레코드에는 `SoftDeletes`를 사용합니다.
의도적으로 계층적인 동작을 원하는 것이 아니라면, 같은 필터에 전역 스코프와 명명된 스코프를 둘 다 쓰지 마세요.

```php
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

final class Project extends Model
{
    use SoftDeletes;

    protected static function booted(): void
    {
        static::addGlobalScope('active', function (Builder $builder): void {
            $builder->whereNull('archived_at');
        });
    }
}
```

### 재사용 가능한 필터를 위한 쿼리 스코프

```php
use Illuminate\Database\Eloquent\Builder;

final class Project extends Model
{
    public function scopeOwnedBy(Builder $query, int $userId): Builder
    {
        return $query->where('owner_id', $userId);
    }
}

// 서비스, 레포지토리 등에서
$projects = Project::ownedBy($user->id)->get();
```

### 여러 단계 업데이트를 위한 트랜잭션

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function (): void {
    $order->update(['status' => 'paid']);
    $order->items()->update(['paid_at' => now()]);
});
```

### 마이그레이션

### 명명 규칙

- 파일 이름은 타임스탬프를 사용합니다: `YYYY_MM_DD_HHMMSS_create_users_table.php`
- 마이그레이션은 익명 클래스를 사용합니다(명명된 클래스 없음). 의도는 파일 이름이 전달합니다.
- 테이블 이름은 기본적으로 `snake_case`이며 복수형입니다.

### 마이그레이션 예시

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('status', 32)->index();
            $table->unsignedInteger('total_cents');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
```

### 폼 요청과 검증

검증은 폼 요청에 두고, 입력은 DTO로 변환합니다.

```php
use App\Models\Order;

final class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Order::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.sku' => ['required', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    public function toDto(): CreateOrderData
    {
        return new CreateOrderData(
            customerId: (int) $this->validated('customer_id'),
            items: $this->validated('items'),
        );
    }
}
```

### API 리소스

리소스와 페이지네이션으로 API 응답을 일관되게 유지합니다.

```php
$projects = Project::query()->active()->paginate(25);

return response()->json([
    'success' => true,
    'data' => ProjectResource::collection($projects->items()),
    'error' => null,
    'meta' => [
        'page' => $projects->currentPage(),
        'per_page' => $projects->perPage(),
        'total' => $projects->total(),
    ],
]);
```

### 이벤트, 작업, 큐

- 부수 효과(이메일, 분석)를 위해 도메인 이벤트를 발생시킵니다.
- 느린 작업(보고서, 내보내기, 웹훅)에는 큐 작업을 사용합니다.
- 재시도와 백오프가 있는 멱등(idempotent) 핸들러를 선호합니다.

### 캐싱

- 읽기가 많은 엔드포인트와 비용이 큰 쿼리를 캐시합니다.
- 모델 이벤트(created/updated/deleted)에서 캐시를 무효화합니다.
- 관련 데이터를 캐시할 때는 쉬운 무효화를 위해 태그를 사용합니다.

### 설정과 환경

- 비밀 값은 `.env`에, 설정은 `config/*.php`에 둡니다.
- 환경별 설정 재정의를 사용하고, 프로덕션에서는 `config:cache`를 사용합니다.
