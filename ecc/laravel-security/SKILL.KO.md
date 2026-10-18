---
name: laravel-security
description: Laravel 보안 모범 사례 — 인증, 인가, Eloquent 안전성, CSRF, XSS 방지, API 보안, 안전한 배포 설정. Laravel 인증, Eloquent 안전성, CSRF, XSS, API 보안, 배포 설정을 리뷰할 때 사용합니다.
metadata:
  origin: ECC
---

# Laravel 보안 모범 사례

일반적인 취약점으로부터 Laravel 애플리케이션을 보호하기 위한 포괄적인 보안 지침입니다.

## 활성화 시점

- Laravel 인증과 인가를 설정할 때 (Sanctum, Passport, Jetstream, Breeze)
- 사용자 역할, 권한, 정책을 구현할 때
- 프로덕션 보안 설정과 환경 변수를 구성할 때
- Laravel 애플리케이션의 보안 취약점을 리뷰할 때
- Laravel 애플리케이션을 프로덕션에 배포할 때
- 안전한 Eloquent 쿼리와 마이그레이션을 작성할 때

## 프로덕션 설정

### 필수 프로덕션 설정

```php
// config/app.php
'env' => env('APP_ENV', 'production'),
'debug' => (bool) env('APP_DEBUG', false), // 중요: 프로덕션에서는 절대 true가 되면 안 됨
'key' => env('APP_KEY'), // 반드시 설정: php artisan key:generate

// config/session.php
'secure' => env('SESSION_SECURE_COOKIE', true),
'http_only' => true,
'same_site' => 'lax',

// 부팅 시 APP_KEY가 설정되었는지 확인
// bootstrap/app.php 또는 서비스 프로바이더
if (empty(config('app.key'))) {
    throw new RuntimeException('APP_KEY is not set. Run: php artisan key:generate');
}
```

### 환경 파일 보안

```bash
# .env는 절대 버전 관리에 커밋하지 마세요
# .gitignore에는 기본적으로 .env가 포함되어 있습니다

# 대신 플레이스홀더가 있는 .env.example을 사용하세요
DB_PASSWORD=
APP_KEY=
SANCTUM_TOKEN_PREFIX=

# 부팅 시 필수 변수를 검증하세요
// AppServiceProvider::boot()에서
$requiredKeys = ['app.key', 'database.connections.mysql.database', 'database.connections.mysql.username'];
foreach ($requiredKeys as $key) {
    if (empty(config($key))) {
        throw new RuntimeException("Missing required config key: {$key}");
    }
}
```

### HTTPS 강제

```php
// AppServiceProvider::boot() 또는 미들웨어에서
if (app()->environment('production')) {
    URL::forceScheme('https');
    request()->server->set('HTTPS', 'on');
}

// 로드 밸런서를 위한 신뢰할 수 있는 프록시는 config/app.php에서 설정
// 특정 IP 범위를 사용하세요 — *는 모두를 신뢰하여 X-Forwarded-* 스푸핑을 허용합니다
// AWS: '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'
'trusted_proxies' => ['10.0.0.0/8', '172.16.0.0/12'],

// 미들웨어로 프로덕션에서 HTTPS 강제
// app/Http/Middleware/ForceHttps.php
public function handle($request, Closure $next)
{
    if (!$request->secure() && app()->environment('production')) {
        return redirect()->secure($request->getRequestUri());
    }
    return $next($request);
}
```

## 인증

### Sanctum (API 토큰 인증)

```php
// config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ',' . parse_url(env('APP_URL'), PHP_URL_HOST) : ''
)));

'expiration' => 60 * 24, // 토큰 만료 시간(분 단위, null = 만료 없음)
'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

// 능력(abilities)을 포함해 토큰 발급
$token = $user->createToken('api-token', ['read', 'write'])->plainTextToken;

// 라우트에서 능력 검증
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/orders', function () {
        // 사용자는 'read' 능력이 있어야 함
        abort_unless(Auth::user()->tokenCan('read'), 403);
        // ...
    })->middleware('abilities:read');

    Route::post('/orders', function () {
        // 사용자는 'write' 능력이 있어야 함
        abort_unless(Auth::user()->tokenCan('write'), 403);
        // ...
    })->middleware('abilities:write');
});
```

### 비밀번호 보안

```php
// config/hashing.php
// 기본값은 bcrypt입니다. Argon2id가 더 강력합니다.
'bcrypt' => [
    'rounds' => env('BCRYPT_ROUNDS', 12), // 더 강한 해싱을 위해 증가
],

'argon' => [
    'memory' => 65536,
    'threads' => 4,
    'time' => 4,
],

// RegisterRequest의 비밀번호 검증
public function rules(): array
{
    return [
        'password' => [
            'required',
            'confirmed',
            Password::min(12)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols()
                ->uncompromised(), // haveibeenpwned 확인
        ],
    ];
}

// 로그인 시도 제한
// App\Http\Controllers\Auth\AuthenticatedSessionController
protected function authenticated(Request $request, $user)
{
    if ($user->wasRecentlyLockedOut()) {
        // 의심스러운 로그인을 사용자에게 알림
        $user->notify(new SuspiciousLoginNotification($request->ip()));
    }
}
```

### 세션 관리

```php
// config/session.php
'driver' => env('SESSION_DRIVER', 'database'), // database/redis > file
'lifetime' => env('SESSION_LIFETIME', 120),
'expire_on_close' => env('SESSION_EXPIRE_ON_CLOSE', false),
'encrypt' => env('SESSION_ENCRYPT', false),

// 로그인 시 세션 재생성
// App\Http\Controllers\Auth\AuthenticatedSessionController
public function store(LoginRequest $request): RedirectResponse
{
    $request->authenticate();
    $request->session()->regenerate(); // 중요: 세션 고정 공격을 방지
    return redirect()->intended(RouteServiceProvider::HOME);
}

// 로그아웃 시 세션 무효화
public function destroy(Request $request): RedirectResponse
{
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/');
}
```

## 인가

### Gate

```php
// App\Providers\AuthServiceProvider
use App\Models\Post;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

public function boot(): void
{
    Gate::define('update-post', function (User $user, Post $post): bool {
        return $user->id === $post->user_id;
    });

    Gate::define('publish-post', function (User $user): bool {
        return $user->role === 'editor' || $user->role === 'admin';
    });

    // 슈퍼 관리자 재정의를 위해 before() 사용
    Gate::before(function (User $user, string $ability): ?bool {
        if ($user->role === 'super-admin') {
            return true; // 모든 능력 허용
        }
        return null; // 일반 검사로 넘어감
    });
}

// 컨트롤러에서 사용
public function update(Request $request, Post $post): RedirectResponse
{
    Gate::authorize('update-post', $post);
    // 또는: $this->authorize('update-post', $post);
    // 또는: abort_unless(Auth::user()->can('update-post', $post), 403);
    // ...
}
```

### 정책

```php
// App\Policies\PostPolicy
class PostPolicy
{
    use HandlesAuthorization;

    public function viewAny(?User $user): bool
    {
        return true; // 공개 목록
    }

    public function view(?User $user, Post $post): bool
    {
        return $post->is_published || ($user && $user->id === $post->user_id);
    }

    public function create(User $user): bool
    {
        return $user->hasVerifiedEmail(); // 먼저 이메일 인증 필요
    }

    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }

    public function delete(User $user, Post $post): bool
    {
        return $user->id === $post->user_id && $post->created_at->diffInDays(now()) <= 30;
    }

    public function restore(User $user, Post $post): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Post $post): bool
    {
        return $user->role === 'super-admin';
    }
}

// AuthServiceProvider에 등록
protected $policies = [
    Post::class => PostPolicy::class,
];

// 컨트롤러에서 사용
public function show(Post $post): View
{
    $this->authorize('view', $post);
    return view('posts.show', compact('post'));
}

// Blade에서 사용
@can('update', $post)
    <a href="{{ route('posts.edit', $post) }}">수정</a>
@endcan

@cannot('update', $post)
    <span>이 글을 수정할 수 없습니다</span>
@endcannot
```

### 미들웨어 인가

```php
// 라우트에서 미들웨어 사용
Route::put('/posts/{post}', [PostController::class, 'update'])
    ->middleware('can:update,post');

Route::get('/posts/create', [PostController::class, 'create'])
    ->middleware('can:create,App\Models\Post');

// 커스텀 인가 미들웨어
// app/Http/Middleware/CheckRole.php
class CheckRole
{
    public function handle(Request $request, Closure $next, string $role): mixed
    {
        if (!$request->user() || $request->user()->role !== $role) {
            abort(403, 'Unauthorized. This area requires role: ' . $role);
        }
        return $next($request);
    }
}

// Kernel에 등록
protected $routeMiddleware = [
    'role' => \App\Http\Middleware\CheckRole::class,
];

// 라우트에서 사용
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin', [AdminController::class, 'index']);
});
```

## Eloquent 보안

### 대량 할당 보호

```php
// 나쁨: $guarded = []는 모든 컬럼의 대량 할당을 허용합니다
// 프로덕션에서는 절대 $guarded = []를 사용하지 마세요

// 좋음: fillable 속성을 화이트리스트로 관리
final class User extends Authenticatable
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'avatar',
    ];
    // 'role', 'is_admin', 'is_verified'는 여기에 절대 추가하지 마세요
}

// 좋음: 요청에서 채울 수 있는 필드를 명시적으로 제어
public function store(StoreUserRequest $request): RedirectResponse
{
    $user = User::create($request->safe()->only([
        'name', 'email', 'phone', 'avatar'
    ]));
    // $request->safe()는 검증된 데이터만 사용합니다
    // $request->only()는 검증 규칙 없이 그 자체로는 안전하지 않습니다
}

// 나쁨: 요청 데이터를 그대로 사용해 사용자 생성
User::create($request->all()); // 대량 할당에 취약!

// 더 나음: 생성에 DTO 사용
$user = User::create($request->validated()); // 검증된 필드만
```

### SQL 인젝션 방지

```php
// 좋음: Eloquent는 쿼리를 자동으로 매개변수화합니다
User::where('email', $userInput)->first();
User::whereRaw('email = ?', [$userInput])->first();

// 좋음: 쿼리 빌더도 매개변수화합니다
DB::table('users')->where('email', $userInput)->first();
DB::select('SELECT * FROM users WHERE email = ?', [$userInput]);

// 나쁨: 원시 문자열 보간
DB::select("SELECT * FROM users WHERE email = '{$userInput}'"); // 취약!
User::whereRaw("email = '{$userInput}'")->first(); // 취약!

// 나쁨: 이스케이프되지 않은 입력이 들어간 whereRaw/orderByRaw
User::orderByRaw($userInput); // 취약!
User::groupByRaw($userInput); // 취약!

// 나쁨: 문자열 연결이 포함된 DB::statement
DB::statement("INSERT INTO users (email) VALUES ('{$userInput}')"); // 취약!
```

### 속성 캐스팅

```php
final class User extends Authenticatable
{
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_admin' => 'boolean', // boolean으로 캐스팅하면 문자열 인젝션을 방지합니다
        'settings' => 'array', // json_encode/json_decode 자동 처리
        'metadata' => 'encrypted:array', // Laravel 11+ 암호화 캐스팅
        'password' => 'hashed', // Laravel 10+ 값을 설정할 때 자동 해시
    ];
}
```

### 모델 보안

```php
final class User extends Authenticatable
{
    // JSON/API 응답에서 민감한 속성을 숨김
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    // 안전한 계산 속성만 추가
    protected $appends = ['full_name']; // 안전함
    // 민감한 계산 데이터는 절대 추가하지 마세요
}

final class Post extends Model
{
    // 소프트 삭제된 레코드를 걸러내는 전역 스코프
    use SoftDeletes;

    // 지연 로딩을 제한해 N+1을 방지 (선택적인 엄격 모드)
    // AppServiceProvider::boot()
    // Model::preventLazyLoading(!app()->isProduction());
}
```

## CSRF 보호

### 기본 보호

```php
// Laravel의 CSRF는 VerifyCsrfToken 미들웨어로 기본 활성화됩니다
// app/Http/Kernel.php (protected $middlewareGroups['web'])

// 모든 POST/PUT/PATCH/DELETE 폼에는 @csrf가 포함되어야 합니다
<form method="POST" action="/posts">
    @csrf
    <input type="text" name="title">
    <button type="submit">생성</button>
</form>
```

### 라우트 제외 (신중하게)

```php
// app/Http/Middleware/VerifyCsrfToken.php
class VerifyCsrfToken extends Middleware
{
    // 외부 CSRF 보호가 있는 라우트(웹훅 등)만 제외하세요
    protected $except = [
        'stripe/*', // Stripe 웹훅은 자체 서명 검증을 사용합니다
        // 'api/*'처럼 포괄적으로 제외하지 마세요 — 상태 저장 Sanctum 라우트에는 CSRF가 필요합니다.
        // 상태 비저장 웹훅/엔드포인트 라우트만 구체적으로 제외하세요.
    ];
}
```

### JavaScript에서 CSRF

```html
<meta name="csrf-token" content="{{ csrf_token() }}">

<script>
// Axios 예시 (Laravel에는 Axios가 기본 포함됨)
axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector(
    'meta[name="csrf-token"]'
).getAttribute('content');

// Fetch 예시
fetch('/posts', {
    method: 'POST',
    headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
});
</script>
```

## XSS 방지

### Blade 템플릿 보안

```blade
{{-- 안전: Blade가 자동으로 이스케이프함 --}}
{{ $userInput }}

{{-- 위험: 원시 출력 — 사용자 입력에는 절대 사용하지 마세요 --}}
{!! $userInput !!}

{{-- 안전: 직접 통제하는 신뢰할 수 있는 콘텐츠에만 {!! !!} 사용 --}}
{!! $trustedHtmlFromYourServer !!}

{{-- 좋음: 특정 이스케이프 지시문 사용 --}}
@js($data) {{-- JavaScript용 JSON 인코딩 --}}
@json($data) {{-- 템플릿에서 JSON 인코딩 --}}

{{-- 나쁨: 원시 HTML에 사용자 입력을 직접 넣음 --}}
<div>{!! $user->bio !!}</div> {{-- 사용자가 bio를 입력할 수 있다면 취약 --}}
```

### 안전한 HTML 처리

```php
// 일부 HTML을 허용해야 한다면 화이트리스트 방식을 사용하세요
use HTMLPurifier; // 필요: composer require ezyang/htmlpurifier

public function sanitizeHtml(string $dirty): string
{
    $config = \HTMLPurifier_Config::createDefault();
    $config->set('HTML.Allowed', 'p,b,i,a[href],ul,ol,li,br');
    $config->set('URI.AllowedSchemes', ['http', 'https', 'mailto']);
    $purifier = new \HTMLPurifier($config);
    return $purifier->purify($dirty);
}

// blade에서:
<div>{!! $sanitizedContent !!}</div> {{-- 정화 후에는 안전 --}}
```

### JavaScript 컨텍스트 이스케이프

```blade
{{-- 안전: Blade @js는 JavaScript 컨텍스트에 맞게 이스케이프함 --}}
<script>
    const user = @js($user); // JSON + JS 컨텍스트용 이스케이프
    const settings = @json($settings); // 직접 JSON 인코딩
</script>

{{-- 위험: JavaScript 컨텍스트에 수동 JSON 사용 --}}
<script>
    const user = {{ json_encode($user) }}; // JS용으로 이스케이프되지 않음!
</script>
```

### XSS 보호를 위한 HTTP 헤더

```php
// App\Http\Middleware\SecurityHeaders.php
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): mixed
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'"
        );

        return $response;
    }
}

// 커널에 등록
protected $middleware = [
    \App\Http\Middleware\SecurityHeaders::class,
];
```

## 입력 검증

### 폼 요청 검증

```php
final class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Post::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255', 'sanitize_html'],
            'content' => ['required', 'string', 'max:10000'],
            'image' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,gif,webp', // 특정 타입만 허용하는 화이트리스트
                'max:2048', // 최대 2MB
            ],
            'tags' => ['array'],
            'tags.*' => ['integer', 'exists:tags,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.max' => 'Post title must not exceed 255 characters.',
            'image.max' => 'Image must be under 2MB.',
        ];
    }

    // 검증 후 입력 정화
    public function validated($key = null, $default = null): mixed
    {
        $validated = parent::validated();
        $validated['title'] = strip_tags($validated['title']);
        return $key ? ($validated[$key] ?? $default) : $validated;
    }
}
```

### 커스텀 검증 규칙

```php
// app/Rules/StrongPassword.php
class StrongPassword implements Rule
{
    public function passes($attribute, $value): bool
    {
        return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{12,}$/', $value);
    }

    public function message(): string
    {
        return 'The :attribute must be at least 12 characters with uppercase, lowercase, number, and symbol.';
    }
}

// app/Rules/NotBlacklistedDomain.php
class NotBlacklistedDomain implements Rule
{
    private array $blacklisted = ['mailinator.com', 'guerrillamail.com'];

    public function passes($attribute, $value): bool
    {
        $domain = substr(strrchr($value, '@'), 1);
        return !in_array(strtolower($domain), $this->blacklisted);
    }

    public function message(): string
    {
        return 'Email from disposable domains is not allowed.';
    }
}
```

## API 보안

### 요청 제한 (Rate Limiting)

```php
// App/Providers/RouteServiceProvider
protected function configureRateLimiting(): void
{
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });

    RateLimiter::for('auth', function (Request $request) {
        return Limit::perMinute(5)->by($request->ip())
            ->response(function () {
                return response()->json([
                    'message' => 'Too many login attempts. Try again in 1 minute.',
                ], 429);
            });
    });

    RateLimiter::for('uploads', function (Request $request) {
        return Limit::perHour(10)->by($request->user()?->id ?? $request->ip())
            ->response(function () {
                return response()->json([
                    'message' => 'Upload limit reached. Try again later.',
                ], 429);
            });
    });
}

// 라우트에서 사용
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::apiResource('posts', PostController::class);
});

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:auth');
```

### API 인증 — Sanctum vs Passport

```php
// Sanctum (대부분의 앱에 권장 — 단순하고, 자사 앱/SPA용)
// config/sanctum.php
'expiration' => 60 * 24, // 토큰은 24시간 후 만료
'model' => User::class,

// 범위가 지정된 토큰 발급
$token = $user->createToken('client-name', [
    'posts:read',
    'posts:write',
])->plainTextToken;

// 미들웨어 범위 지정
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/posts', [PostController::class, 'index'])
        ->middleware('abilities:posts:read');

    Route::post('/posts', [PostController::class, 'store'])
        ->middleware('abilities:posts:write');
});

// Passport (OAuth2 — 서드파티 클라이언트나 복잡한 인증 흐름용)
// 설치: composer require laravel/passport
Passport::tokensExpireIn(now()->addDays(15));
Passport::refreshTokensExpireIn(now()->addDays(30));
Passport::personalAccessTokensExpireIn(now()->addMonths(6));
```

### CORS 설정

```php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', '')), // 특정 출처만 화이트리스트
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => ['X-Total-Count', 'X-Pagination-Page'],
    'max_age' => 0,
    'supports_credentials' => true, // Sanctum SPA 인증에 필요
];

// 절대 금지: 정말 필요한 경우가 아니라면 프로덕션에서 모든 출처를 허용하지 마세요
// 'allowed_origins' => ['*'], // 정말 공개된 API에서만 사용
```

## 파일 업로드 보안

### 검증

```php
public function rules(): array
{
    return [
        'document' => [
            'required',
            'file',
            'mimes:pdf,doc,docx,xls,xlsx', // 특정 MIME 타입 화이트리스트
            'max:10240', // 10MB
            'extensions:pdf,doc,docx,xls,xlsx', // 확장자가 MIME과 일치하는지 확인
        ],
        'avatar' => [
            'nullable',
            'image', // 유효한 이미지인지 확인
            'mimes:jpg,jpeg,png,webp',
            'max:2048',
            'dimensions:min_width=100,min_height=100,max_width=2000,max_height=2000',
        ],
    ];
}
```

### 안전한 저장

```php
// 파일은 public 디렉터리 밖에 저장하세요
$path = $request->file('document')->store('documents', 'local');
// 민감한 문서에는 'public' 디스크를 절대 사용하지 마세요

// 임시 파일 접근에는 서명된 URL을 사용하세요
use Illuminate\Support\Facades\Storage;

public function download(Request $request, string $path)
{
    // 임시 서명 URL 생성 (15분 후 만료)
    $url = Storage::temporaryUrl($path, now()->addMinutes(15));

    // 사용자에게 권한이 있는지 확인
    $this->authorize('download', $path);

    return redirect($url);
}

// 암호화를 포함한 클라우드 스토리지 설정
// config/filesystems.php
's3' => [
    'driver' => 's3',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION'),
    'bucket' => env('AWS_BUCKET'),
    'url' => env('AWS_URL'),
    'endpoint' => env('AWS_ENDPOINT'),
    'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
    'throw' => false,
    'server_side_encryption' => 'AES256', // 저장 시 암호화
],
```

## 의존성과 비밀 값

### Composer 보안

```bash
# CI에서 항상 의존성을 감사하세요
composer audit

# composer.json에서 메이저 버전을 고정하세요
"laravel/framework": "^11.0",
"spatie/laravel-permission": "^6.0"

# 버려진(abandoned) 패키지를 확인하세요
composer why-not

# lock 파일은 버전 관리에 두세요 (정확한 버전을 고정합니다)
# `composer update`는 CI/CD에서 절대 실행하지 말고 의도적으로만 실행하세요
```

### 비밀 값 관리

```bash
# .env 파일 (절대 커밋하지 마세요)
# .gitignore에는 기본적으로 .env가 포함되어 있습니다

APP_KEY=base64:abc123...
DB_PASSWORD=secure_password
STRIPE_KEY=sk_live_...
SANCTUM_TOKEN_PREFIX=myapp_

# 프로덕션: 시크릿 매니저를 사용하세요
# 배포 명령: env $(aws secretsmanager get-secret-value --secret-id prod/db | jq ...) php artisan serve

# 부팅 시 비밀 값을 검증하세요 (AppServiceProvider::boot)
$secrets = ['services.stripe.key', 'services.stripe.webhook_secret'];
foreach ($secrets as $key) {
    if (empty(config($key))) {
        Log::critical("Missing secret: {$key}");
    }
}
```

## 큐 보안

```php
// 이름 있는 요청 제한기를 정의하세요 (보통 AppServiceProvider::boot()에)
RateLimiter::for('payments', fn () => Limit::perMinute(5));
```

```php
// 인터페이스를 구현해 민감한 작업 데이터를 암호화하세요
final class ProcessPaymentJob implements ShouldQueue, ShouldBeEncrypted
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private readonly string $paymentIntentId, // 공개 ID는 괜찮습니다
        private readonly string $cardFingerprint, // ShouldBeEncrypted로 암호화됨
    ) {}

    public function handle(): void
    {
        // 결제 처리
    }

    // 재시도 횟수와 재시도 간 지연을 제한하세요
    public function retryUntil(): Carbon
    {
        return now()->addMinutes(5);
    }

    // 이 타입의 작업이 실행될 수 있는 횟수를 제한하세요
    public function middleware(): array
    {
        return [
            new RateLimited('payments'),
        ];
    }
}
```

## 보안 이벤트 로깅

```php
// config/logging.php
'channels' => [
    'security' => [
        'driver' => 'single',
        'path' => storage_path('logs/security.log'),
        'level' => 'warning',
    ],
],

// 감사 로그 헬퍼
final class SecurityLogger
{
    public static function log(string $event, array $context = []): void
    {
        Log::channel('security')->warning($event, array_merge([
            'user_id' => Auth::id(),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'url' => request()->fullUrl(),
            'timestamp' => now()->toIso8601String(),
        ], $context));
    }
}

// 사용 예
SecurityLogger::log('failed_login_attempt', ['email' => $email]);
SecurityLogger::log('password_change');
SecurityLogger::log('role_change', ['target_user' => $targetId, 'new_role' => 'admin']);
SecurityLogger::log('suspicious_activity', ['reason' => 'multiple_attempts_from_different_ips']);
```

## 빠른 보안 체크리스트

| 점검 항목 | 설명 |
|-------|-------------|
| `APP_DEBUG=false` | 프로덕션에서 디버그 모드로 실행하지 않기 |
| `APP_KEY` 설정 | 항상 `php artisan key:generate` 실행 |
| HTTPS 강제 | 미들웨어 또는 프록시로 프로덕션에서 HTTPS 강제 |
| `$fillable` 화이트리스트 | `$guarded = []`는 절대 사용하지 않기 |
| CSRF 활성화 | 상태를 변경하는 모든 폼에 `@csrf` 포함 |
| Sanctum/Passport 설정 | 토큰 능력/범위가 있는 API 인증 |
| 요청 제한 적용 | API와 인증 엔드포인트 제한 |
| 입력 검증 | 구체적인 규칙이 있는 FormRequest 사용, `$request->all()` 사용 금지 |
| 파일 업로드 제한 | MIME 타입, 크기, 치수 검증 |
| CI의 `composer audit` | 알려진 취약점이 있는 의존성 확인 |
| `password_hash` / `password_verify` | Laravel 내장 해싱(bcrypt/Argon2) 사용 |
| 로그인 시 세션 재생성 | `$request->session()->regenerate()` 호출 |
| 보안 헤더 미들웨어 | CSP, X-Frame-Options, X-Content-Type-Options |
| 보안 이벤트 로깅 | 인증 실패, 역할 변경, 의심스러운 활동에 대한 감사 로그 |
| `.env` 미커밋 | `.gitignore`에 `.env`가 포함되어 있는지 확인 |

## 관련 스킬

- `laravel-patterns` — Laravel 아키텍처, 라우팅, Eloquent, API 패턴
- `backend-patterns` — 일반 백엔드 API 및 데이터베이스 패턴
- `laravel-tdd` — PHPUnit과 Pest를 사용한 Laravel 테스트
