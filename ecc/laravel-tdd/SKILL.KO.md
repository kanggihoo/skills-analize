---
name: laravel-tdd
description: PHPUnit, Pest, 모델 팩토리, HTTP 테스트, Sanctum 인증 테스트, 모킹, 커버리지를 활용한 Laravel 테스트 전략. PHPUnit 또는 Pest로 Laravel 테스트를 작성하거나 Laravel 기능을 테스트 우선 방식으로 개발할 때 사용합니다.
metadata:
  origin: ECC
---

# TDD 방식의 Laravel 테스트

PHPUnit, Pest, Laravel 팩토리, 테스트 헬퍼를 사용하는 Laravel 애플리케이션용 테스트 주도 개발(TDD)입니다.

## 활성화 시점

- 새로운 Laravel 애플리케이션 또는 기능을 작성할 때
- Sanctum 또는 Passport 인증이 포함된 API 엔드포인트를 구현할 때
- Eloquent 모델, 관계, 스코프, 접근자를 테스트할 때
- Laravel 프로젝트의 테스트 인프라를 구성할 때
- HTTP 컨트롤러와 폼 요청(Form Request)에 대한 기능 테스트를 작성할 때
- 외부 서비스(큐, 메일, 알림, HTTP)를 모킹할 때

## Laravel을 위한 TDD 워크플로

### Red-Green-Refactor 사이클

```php
// 1단계: RED — 실패하는 테스트 작성
public function test_a_product_can_be_created(): void
{
    $product = Product::factory()->create(['name' => 'Test Product']);
    $this->assertDatabaseHas('products', ['name' => 'Test Product']);
}

// 2단계: GREEN — 마이그레이션, 모델, 팩토리 작성
// 3단계: REFACTOR — 테스트를 통과 상태로 유지하며 개선
```

## 설정

### PHPUnit 구성

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true">
    <testsuites>
        <testsuite name="Unit">
            <directory suffix="Test.php">tests/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory suffix="Test.php">tests/Feature</directory>
        </testsuite>
    </testsuites>
    <php>
        <env name="APP_ENV" value="testing"/>
        <env name="BCRYPT_ROUNDS" value="4"/>
        <env name="CACHE_STORE" value="array"/>
        <env name="DB_CONNECTION" value="sqlite"/>
        <env name="DB_DATABASE" value=":memory:"/>
        <env name="MAIL_MAILER" value="array"/>
        <env name="QUEUE_CONNECTION" value="sync"/>
        <env name="SESSION_DRIVER" value="array"/>
    </php>
</phpunit>
```

### 기본 TestCase 설정

```php
namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // $this->withoutExceptionHandling()은 HTTP가 아닌 예외를
        // 테스트하는 테스트에서만 호출하세요. 호출하면 assertStatus() 등이 억제됩니다.
    }

    // 헬퍼: 사용자를 인증하고 반환
    protected function actingAsUser(): mixed
    {
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user);
        return $user;
    }

    protected function actingAsAdmin(): mixed
    {
        $admin = \App\Models\User::factory()->admin()->create();
        $this->actingAs($admin);
        return $admin;
    }
}
```

## 모델 팩토리

```php
// database/factories/UserFactory.php
class UserFactory extends Factory
{
    protected static ?string $password = null;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => 'user',
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => ['role' => 'admin']);
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => ['email_verified_at' => null]);
    }
}

// database/factories/ProductFactory.php
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(3, true),
            'slug' => fn (array $attrs) => Str::slug($attrs['name']),
            'description' => fake()->paragraph(),
            'price' => fake()->numberBetween(100, 100000),
            'stock' => fake()->numberBetween(0, 100),
            'is_active' => true,
            'user_id' => UserFactory::new(),
        ];
    }

    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => ['stock' => 0]);
    }
}
```

### 팩토리 사용법

```php
$user = User::factory()->create();
$admin = User::factory()->admin()->create();
$product = Product::factory()->create(['user_id' => $user->id]);
$products = Product::factory()->count(10)->create();
$draft = Product::factory()->make(); // 저장되지 않음

// 관계 포함
$user = User::factory()->has(Product::factory()->count(3))->create();

// 시퀀스
User::factory()->count(3)->sequence(
    ['role' => 'admin'], ['role' => 'editor'], ['role' => 'user'],
)->create();
```

## 모델 테스트

```php
namespace Tests\Unit\Models;

use App\Models\User;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_hides_sensitive_attributes(): void
    {
        $user = User::factory()->create();
        $this->assertArrayNotHasKey('password', $user->toArray());
    }

    public function test_admin_scope_returns_only_admins(): void
    {
        User::factory()->admin()->create();
        User::factory()->count(3)->create();

        $this->assertCount(1, User::admin()->get());
    }
}

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_scope_filters_correctly(): void
    {
        Product::factory()->count(3)->create(['is_active' => true]);
        Product::factory()->count(2)->create(['is_active' => false]);

        $this->assertCount(3, Product::active()->get());
    }

    public function test_it_belongs_to_a_user(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($product->user->is($user));
    }
}
```

## 기능 / HTTP 테스트

```php
namespace Tests\Feature\Http\Controllers;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('products.create'))->assertRedirect(route('login'));
    }

    public function test_it_stores_a_new_product(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('products.store'), [
            'name' => 'New Product',
            'description' => 'Description',
            'price' => 2999,
            'stock' => 10,
        ]);

        $response->assertRedirect(route('products.index'));
        $this->assertDatabaseHas('products', [
            'name' => 'New Product',
            'user_id' => $user->id,
        ]);
    }

    public function test_it_validates_required_fields(): void
    {
        $this->actingAs(User::factory()->create());
        $this->post(route('products.store'), [])
            ->assertSessionHasErrors(['name', 'price']);
    }

    public function test_users_cannot_modify_others_products(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $product = Product::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($attacker)
            ->delete(route('products.destroy', $product))
            ->assertForbidden();
    }
}
```

## JSON API 테스트

```php
namespace Tests\Feature\Http\Controllers\Api;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_requests_are_rejected(): void
    {
        $this->getJson('/api/products')->assertUnauthorized();
    }

    public function test_it_lists_paginated_products(): void
    {
        $user = User::factory()->create();
        Product::factory()->count(5)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->getJson('/api/products');

        $response->assertOk();
        $response->assertJsonCount(5, 'data');
        $response->assertJsonStructure([
            'data' => [['id', 'name', 'price']],
            'meta' => ['current_page', 'last_page', 'total'],
        ]);
    }

    public function test_it_creates_a_product(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/products', [
            'name' => 'API Product',
            'price' => 4999,
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.name', 'API Product');
    }

    public function test_users_cannot_delete_others_products(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $product = Product::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($attacker)
            ->deleteJson("/api/products/{$product->id}")
            ->assertForbidden();
    }
}
```

## Sanctum API 인증 테스트

```php
namespace Tests\Feature\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertCreated();
        $response->assertJsonStructure(['data' => ['user', 'token']]);
    }

    public function test_users_can_login(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['data' => ['token']]);
    }

    public function test_users_cannot_login_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrong',
        ])->assertUnprocessable();
    }

    public function test_token_bearer_authenticates_requests(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);
    }
}
```

## 모킹과 페이크(Fake)

### HTTP Fake

```php
use Illuminate\Support\Facades\Http;

public function test_it_handles_successful_payment(): void
{
    Http::fake([
        'api.stripe.com/*' => Http::response(['id' => 'pi_123', 'status' => 'succeeded'], 200),
    ]);

    $result = (new PaymentService())->charge(2999);
    $this->assertTrue($result->success);
}

public function test_it_handles_gateway_failure(): void
{
    Http::fake([
        'api.stripe.com/*' => Http::response(['error' => 'card_declined'], 402),
    ]);

    $this->expectException(PaymentFailedException::class);
    (new PaymentService())->charge(2999);
}

public function test_it_retries_on_timeout(): void
{
    Http::fake([
        'api.stripe.com/*' => Http::sequence()
            ->pushStatus(408)
            ->pushStatus(200),
    ]);

    $this->assertTrue((new PaymentService())->charge(2999)->success);
}
```

### Mail Fake

```php
Mail::fake();

$order->sendConfirmation();

Mail::assertSent(OrderConfirmation::class, function ($mail) use ($order) {
    return $mail->hasTo($order->user->email);
});
```

### Notification Fake

```php
Notification::fake();

$user->notify(new WelcomeUser());

Notification::assertSentTo($user, WelcomeUser::class);
```

### Queue Fake

```php
Queue::fake();

ProcessImage::dispatch($product);

Queue::assertPushed(ProcessImage::class, function ($job) use ($product) {
    return $job->product->id === $product->id;
});
```

### Storage Fake

```php
Storage::fake('public');

$file = UploadedFile::fake()->image('photo.jpg', 200, 200);

$response = $this->actingAs($user)->post('/avatar', [
    'avatar' => $file,
]);

$response->assertSessionHasNoErrors();
Storage::disk('public')->assertExists('avatars/' . $file->hashName());
```

### Event Fake

```php
Event::fake();

$order->markAsShipped();

Event::assertDispatched(OrderShipped::class, function ($event) use ($order) {
    return $event->order->id === $order->id;
});
```

## Artisan 명령어 테스트

```php
public function test_it_sends_newsletters(): void
{
    Mail::fake();
    User::factory()->count(5)->create(['subscribed' => true]);

    $this->artisan('newsletter:send')
        ->expectsOutput('Sending newsletter to 5 subscribers...')
        ->assertExitCode(0);

    Mail::assertSent(NewsletterMail::class, 5);
}

public function test_it_handles_no_subscribers(): void
{
    $this->artisan('newsletter:send')
        ->expectsOutput('No subscribers found.')
        ->assertExitCode(0);
}
```

## 권한 부여(Authorization) 테스트

```php
public function test_users_can_update_own_posts(): void
{
    $user = User::factory()->create();
    $post = Post::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->put(route('posts.update', $post), ['title' => 'Updated'])
        ->assertRedirect();
}

public function test_users_cannot_update_others_posts(): void
{
    $post = Post::factory()->create();
    $this->actingAs(User::factory()->create())
        ->put(route('posts.update', $post), ['title' => 'Hacked'])
        ->assertForbidden();
}

public function test_gate_before_grants_super_admin_full_access(): void
{
    $super = User::factory()->create(['role' => 'super-admin']);
    $post = Post::factory()->create();

    $this->actingAs($super)
        ->delete(route('posts.destroy', $post))
        ->assertRedirect();

    $this->assertSoftDeleted($post);
}
```

## Pest 기능 테스트

```php
<?php

use App\Models\Product;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('lists products', function () {
    Product::factory()->count(3)->create(['user_id' => $this->user->id]);

    $this->get(route('products.index'))
        ->assertOk()
        ->assertViewHas('products');
});

it('creates a product with valid data', function () {
    $this->post(route('products.store'), [
        'name' => 'Test Product', 'price' => 1999,
    ])->assertRedirect();

    $this->assertDatabaseHas('products', ['name' => 'Test Product']);
});

it('fails validation without required fields', function () {
    $this->post(route('products.store'), [])
        ->assertSessionHasErrors(['name', 'price']);
});

it('authorizes updates', function () {
    $other = User::factory()->create();
    $product = Product::factory()->create(['user_id' => $other->id]);

    $this->put(route('products.update', $product), ['name' => 'Hacked'])
        ->assertForbidden();
});
```

## 커버리지

```bash
# PHPUnit (CI 임계값 검사에는 clover 출력 사용)
vendor/bin/phpunit --coverage-html coverage --coverage-clover clover.xml

# Pest (내장 임계값 지원)
vendor/bin/pest --coverage --min=80
```

### 커버리지 목표

| 구성 요소 | 목표 |
|-----------|--------|
| 모델 | 95% 이상 |
| Actions/Services | 90% 이상 |
| Form Requests | 90% 이상 |
| 컨트롤러 | 85% 이상 |
| 정책(Policies) | 95% 이상 |
| 전체 | 80% 이상 |

## 테스트 모범 사례

### 해야 할 것

- 수동 `create()` 호출 대신 팩토리를 사용하기
- 테스트 하나당 논리적 검증 하나만 하기
- 설명적인 이름 사용하기: `test_guests_cannot_create_products`
- 엣지 케이스와 권한 경계를 테스트하기
- `Http::fake()`, `Mail::fake()`로 외부 서비스를 모킹하기
- 깨끗한 상태를 위해 `RefreshDatabase` 사용하기

### 하지 말아야 할 것

- Laravel 내부 동작을 테스트하지 않기(프레임워크를 신뢰하기)
- 테스트끼리 서로 의존하게 만들지 않기
- 과도하게 모킹하지 않기 — 서비스 경계에서만 모킹하기
- private 메서드를 테스트하지 않기 — 공개 인터페이스를 통해 테스트하기
- 테스트를 HTML 구조에 결합하지 않기

## 빠른 참조

| 패턴 | 용도 |
|---------|-------|
| `RefreshDatabase` | 테스트 사이에 데이터베이스 초기화 |
| `$this->actingAs($user)` | 사용자로 인증 |
| `$this->withToken($token)` | API용 Bearer 토큰 인증 |
| `Model::factory()->create()` | 팩토리로 모델 생성 |
| `Model::factory()->count(5)->create()` | 여러 레코드 생성 |
| `Http::fake([...])` | HTTP 호출 모킹 |
| `Mail::fake()` | 발송된 메일 가로채기 |
| `Notification::fake()` | 발송된 알림 가로채기 |
| `Queue::fake()` | 큐에 들어간 작업 가로채기 |
| `Event::fake()` | 디스패치된 이벤트 가로채기 |
| `Storage::fake('public')` | 파일 작업 가로채기 |
| `assertDatabaseHas` | DB 행 존재 검증 |
| `assertSoftDeleted` | 소프트 삭제 검증 |
| `assertSessionHasErrors` | 유효성 검사 오류 검증 |
| `assertForbidden` | 403 상태 검증 |

## 관련 스킬

- `laravel-patterns` — Laravel 아키텍처, Eloquent, 라우팅, API 패턴
- `laravel-security` — Laravel 인증, 권한 부여, 보안 코딩
- `tdd-workflow` — 저장소 전체의 RED -> GREEN -> REFACTOR 루프
- `backend-patterns` — 일반적인 백엔드 API 및 데이터베이스 패턴
