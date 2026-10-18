---
name: perl-testing
description: Test2::V0, Test::More, prove 러너, 모킹, Devel::Cover를 이용한 커버리지 측정, TDD 방법론을 사용하는 Perl 테스트 패턴. Test2::V0 또는 Test::More로 Perl 테스트를 작성하거나 커버리지를 측정할 때 사용합니다.
metadata:
  origin: ECC
---

# Perl 테스트 패턴

Test2::V0, Test::More, prove, TDD 방법론을 사용하는 Perl 애플리케이션의 포괄적인 테스트 전략입니다.

## 활성화 시점

- 새로운 Perl 코드를 작성할 때 (TDD를 따릅니다: red, green, refactor)
- Perl 모듈 또는 애플리케이션의 테스트 스위트를 설계할 때
- Perl 테스트 커버리지를 검토할 때
- Perl 테스트 인프라를 구축할 때
- Test::More에서 Test2::V0로 테스트를 마이그레이션할 때
- 실패하는 Perl 테스트를 디버깅할 때

## TDD 워크플로

항상 RED-GREEN-REFACTOR 사이클을 따릅니다.

```perl
# Step 1: RED — 실패하는 테스트를 작성합니다
# t/unit/calculator.t
use v5.36;
use Test2::V0;

use lib 'lib';
use Calculator;

subtest 'addition' => sub {
    my $calc = Calculator->new;
    is($calc->add(2, 3), 5, 'adds two numbers');
    is($calc->add(-1, 1), 0, 'handles negatives');
};

done_testing;

# Step 2: GREEN — 최소한의 구현을 작성합니다
# lib/Calculator.pm
package Calculator;
use v5.36;
use Moo;

sub add($self, $a, $b) {
    return $a + $b;
}

1;

# Step 3: REFACTOR — 테스트가 green인 상태를 유지하면서 개선합니다
# Run: prove -lv t/unit/calculator.t
```

## Test::More 기초

표준 Perl 테스트 모듈로, 널리 쓰이며 코어에 포함되어 있습니다.

### 기본 단언문

```perl
use v5.36;
use Test::More;

# 미리 계획을 세우거나 done_testing을 사용합니다
# plan tests => 5;  # 고정된 계획 (선택 사항)

# 동등성
is($result, 42, 'returns correct value');
isnt($result, 0, 'not zero');

# 불리언
ok($user->is_active, 'user is active');
ok(!$user->is_banned, 'user is not banned');

# 깊은 비교
is_deeply(
    $got,
    { name => 'Alice', roles => ['admin'] },
    'returns expected structure'
);

# 패턴 매칭
like($error, qr/not found/i, 'error mentions not found');
unlike($output, qr/password/, 'output hides password');

# 타입 검사
isa_ok($obj, 'MyApp::User');
can_ok($obj, 'save', 'delete');

done_testing;
```

### SKIP과 TODO

```perl
use v5.36;
use Test::More;

# 조건부로 테스트를 건너뜁니다
SKIP: {
    skip 'No database configured', 2 unless $ENV{TEST_DB};

    my $db = connect_db();
    ok($db->ping, 'database is reachable');
    is($db->version, '15', 'correct PostgreSQL version');
}

# 예상된 실패를 표시합니다
TODO: {
    local $TODO = 'Caching not yet implemented';
    is($cache->get('key'), 'value', 'cache returns value');
}

done_testing;
```

## Test2::V0 최신 프레임워크

Test2::V0는 Test::More를 대체하는 최신 모듈로, 더 풍부한 단언문, 더 나은 진단 정보, 확장성을 제공합니다.

### Test2를 사용하는 이유

- 해시/배열 빌더를 이용한 뛰어난 깊은 비교
- 실패 시 더 나은 진단 출력
- 더 깔끔한 범위를 가진 서브테스트
- Test2::Tools::* 플러그인을 통한 확장성
- Test::More 테스트와의 하위 호환성

### 빌더를 이용한 깊은 비교

```perl
use v5.36;
use Test2::V0;

# 해시 빌더 — 부분 구조를 검사합니다
is(
    $user->to_hash,
    hash {
        field name  => 'Alice';
        field email => match(qr/\@example\.com$/);
        field age   => validator(sub { $_ >= 18 });
        # 다른 필드는 무시합니다
        etc();
    },
    'user has expected fields'
);

# 배열 빌더
is(
    $result,
    array {
        item 'first';
        item match(qr/^second/);
        item DNE();  # Does Not Exist — 추가 항목이 없는지 확인합니다
    },
    'result matches expected list'
);

# Bag — 순서와 무관한 비교
is(
    $tags,
    bag {
        item 'perl';
        item 'testing';
        item 'tdd';
    },
    'has all required tags regardless of order'
);
```

### 서브테스트

```perl
use v5.36;
use Test2::V0;

subtest 'User creation' => sub {
    my $user = User->new(name => 'Alice', email => 'alice@example.com');
    ok($user, 'user object created');
    is($user->name, 'Alice', 'name is set');
    is($user->email, 'alice@example.com', 'email is set');
};

subtest 'User validation' => sub {
    my $warnings = warns {
        User->new(name => '', email => 'bad');
    };
    ok($warnings, 'warns on invalid data');
};

done_testing;
```

### Test2를 이용한 예외 테스트

```perl
use v5.36;
use Test2::V0;

# 코드가 die하는지 테스트합니다
like(
    dies { divide(10, 0) },
    qr/Division by zero/,
    'dies on division by zero'
);

# 코드가 예외 없이 실행되는지 테스트합니다
ok(lives { divide(10, 2) }, 'division succeeds') or note($@);

# 결합 패턴
subtest 'error handling' => sub {
    ok(lives { parse_config('valid.json') }, 'valid config parses');
    like(
        dies { parse_config('missing.json') },
        qr/Cannot open/,
        'missing file dies with message'
    );
};

done_testing;
```

## 테스트 구성과 prove

### 디렉터리 구조

```text
t/
├── 00-load.t              # 모듈이 컴파일되는지 확인합니다
├── 01-basic.t             # 핵심 기능
├── unit/
│   ├── config.t           # 모듈별 단위 테스트
│   ├── user.t
│   └── util.t
├── integration/
│   ├── database.t
│   └── api.t
├── lib/
│   └── TestHelper.pm      # 공유 테스트 유틸리티
└── fixtures/
    ├── config.json        # 테스트 데이터 파일
    └── users.csv
```

### prove 명령

```bash
# 모든 테스트 실행
prove -l t/

# 자세한 출력
prove -lv t/

# 특정 테스트 실행
prove -lv t/unit/user.t

# 재귀 검색
prove -lr t/

# 병렬 실행 (8개 작업)
prove -lr -j8 t/

# 마지막 실행에서 실패한 테스트만 실행
prove -l --state=failed t/

# 타이머가 포함된 컬러 출력
prove -l --color --timer t/

# CI용 TAP 출력
prove -l --formatter TAP::Formatter::JUnit t/ > results.xml
```

### .proverc 설정

```text
-l
--color
--timer
-r
-j4
--state=save
```

## 픽스처와 설정/해제

### 서브테스트 격리

```perl
use v5.36;
use Test2::V0;
use File::Temp qw(tempdir);
use Path::Tiny;

subtest 'file processing' => sub {
    # 설정
    my $dir = tempdir(CLEANUP => 1);
    my $file = path($dir, 'input.txt');
    $file->spew_utf8("line1\nline2\nline3\n");

    # 테스트
    my $result = process_file("$file");
    is($result->{line_count}, 3, 'counts lines');

    # 해제는 자동으로 수행됩니다 (CLEANUP => 1)
};
```

### 공유 테스트 헬퍼

재사용 가능한 헬퍼는 `t/lib/TestHelper.pm`에 두고 `use lib 't/lib'`로 로드합니다. `create_test_db()`, `create_temp_dir()`, `fixture_path()` 같은 팩토리 함수는 `Exporter`를 통해 export합니다.

## 모킹

### Test::MockModule

```perl
use v5.36;
use Test2::V0;
use Test::MockModule;

subtest 'mock external API' => sub {
    my $mock = Test::MockModule->new('MyApp::API');

    # 좋은 예: 모의 객체가 통제된 데이터를 반환합니다
    $mock->mock(fetch_user => sub ($self, $id) {
        return { id => $id, name => 'Mock User', email => 'mock@test.com' };
    });

    my $api = MyApp::API->new;
    my $user = $api->fetch_user(42);
    is($user->{name}, 'Mock User', 'returns mocked user');

    # 호출 횟수를 검증합니다
    my $call_count = 0;
    $mock->mock(fetch_user => sub { $call_count++; return {} });
    $api->fetch_user(1);
    $api->fetch_user(2);
    is($call_count, 2, 'fetch_user called twice');

    # $mock이 스코프를 벗어나면 모킹은 자동으로 복원됩니다
};

# 나쁜 예: 복원 없이 몽키 패칭
# *MyApp::API::fetch_user = sub { ... };  # 절대 금지 — 테스트 간에 누출됩니다
```

가벼운 모의 객체가 필요하면 `Test::MockObject`를 사용하여 `->mock()`으로 주입 가능한 테스트 대역을 만들고 `->called_ok()`로 호출을 검증합니다.

## Devel::Cover를 이용한 커버리지

### 커버리지 실행

```bash
# 기본 커버리지 보고서
cover -test

# 또는 단계별로 실행합니다
perl -MDevel::Cover -Ilib t/unit/user.t
cover

# HTML 보고서
cover -report html
open cover_db/coverage.html

# 특정 임계값
cover -test -report text | grep 'Total'

# CI 친화적: 임계값 미만이면 실패
cover -test && cover -report text -select '^lib/' \
  | perl -ne 'if (/Total.*?(\d+\.\d+)/) { exit 1 if $1 < 80 }'
```

### 통합 테스트

데이터베이스 테스트에는 인메모리 SQLite를, API 테스트에는 HTTP::Tiny를 모킹하여 사용합니다.

```perl
use v5.36;
use Test2::V0;
use DBI;

subtest 'database integration' => sub {
    my $dbh = DBI->connect('dbi:SQLite:dbname=:memory:', '', '', {
        RaiseError => 1,
    });
    $dbh->do('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');

    $dbh->prepare('INSERT INTO users (name) VALUES (?)')->execute('Alice');
    my $row = $dbh->selectrow_hashref('SELECT * FROM users WHERE name = ?', undef, 'Alice');
    is($row->{name}, 'Alice', 'inserted and retrieved user');
};

done_testing;
```

## 모범 사례

### 해야 할 일

- **TDD를 따르세요**: 구현 전에 테스트를 작성합니다 (red-green-refactor)
- **Test2::V0를 사용하세요**: 최신 단언문과 더 나은 진단 정보를 제공합니다
- **서브테스트를 사용하세요**: 관련 단언문을 묶고 상태를 격리합니다
- **외부 의존성을 모킹하세요**: 네트워크, 데이터베이스, 파일 시스템
- **`prove -l`을 사용하세요**: 항상 lib/를 `@INC`에 포함합니다
- **테스트 이름을 명확하게 지으세요**: `'user login with invalid password fails'`
- **엣지 케이스를 테스트하세요**: 빈 문자열, undef, 0, 경계값
- **80% 이상의 커버리지를 목표로 하세요**: 비즈니스 로직 경로에 집중합니다
- **테스트를 빠르게 유지하세요**: I/O를 모킹하고 인메모리 데이터베이스를 사용합니다

### 하지 말아야 할 일

- **구현을 테스트하지 마세요**: 내부 구조가 아니라 동작과 출력을 테스트합니다
- **서브테스트 간에 상태를 공유하지 마세요**: 각 서브테스트는 독립적이어야 합니다
- **`done_testing`을 생략하지 마세요**: 계획된 모든 테스트가 실행되었는지 보장합니다
- **과도하게 모킹하지 마세요**: 경계만 모킹하고, 테스트 대상 코드는 모킹하지 않습니다
- **새 프로젝트에 `Test::More`를 사용하지 마세요**: Test2::V0를 우선합니다
- **테스트 실패를 무시하지 마세요**: 병합 전에 모든 테스트가 통과해야 합니다
- **CPAN 모듈을 테스트하지 마세요**: 라이브러리가 올바르게 동작한다고 신뢰합니다
- **깨지기 쉬운 테스트를 작성하지 마세요**: 지나치게 구체적인 문자열 매칭을 피합니다

## 빠른 참조

| 작업 | 명령 / 패턴 |
|---|---|
| 모든 테스트 실행 | `prove -lr t/` |
| 하나의 테스트를 자세히 실행 | `prove -lv t/unit/user.t` |
| 병렬 테스트 실행 | `prove -lr -j8 t/` |
| 커버리지 보고서 | `cover -test && cover -report html` |
| 동등성 테스트 | `is($got, $expected, 'label')` |
| 깊은 비교 | `is($got, hash { field k => 'v'; etc() }, 'label')` |
| 예외 테스트 | `like(dies { ... }, qr/msg/, 'label')` |
| 예외 없음 테스트 | `ok(lives { ... }, 'label')` |
| 메서드 모킹 | `Test::MockModule->new('Pkg')->mock(m => sub { ... })` |
| 테스트 건너뛰기 | `SKIP: { skip 'reason', $count unless $cond; ... }` |
| TODO 테스트 | `TODO: { local $TODO = 'reason'; ... }` |

## 흔한 함정

### `done_testing` 누락

```perl
# 나쁜 예: 테스트 파일은 실행되지만 모든 테스트가 실행되었는지 검증하지 않습니다
use Test2::V0;
is(1, 1, 'works');
# done_testing 누락 — 테스트 코드가 건너뛰어져도 조용히 버그가 숨어듭니다

# 좋은 예: 항상 done_testing으로 끝냅니다
use Test2::V0;
is(1, 1, 'works');
done_testing;
```

### `-l` 플래그 누락

```bash
# 나쁜 예: lib/의 모듈을 찾을 수 없습니다
prove t/unit/user.t
# Can't locate MyApp/User.pm in @INC

# 좋은 예: lib/를 @INC에 포함합니다
prove -l t/unit/user.t
```

### 과도한 모킹

테스트 대상 코드가 아니라 *의존성*을 모킹하세요. 테스트가 단지 모의 객체가 당신이 지정한 값을 반환하는지만 검증한다면, 그 테스트는 아무것도 테스트하지 않는 것입니다.

### 테스트 오염

서브테스트 안에서는 `my` 변수를 사용하세요. 테스트 간 상태 누출을 막기 위해 `our`는 절대 사용하지 마세요.

**기억하세요**: 테스트는 안전망입니다. 빠르고, 집중적이며, 독립적으로 유지하세요. 새 프로젝트에는 Test2::V0를, 실행에는 prove를, 책임 있는 커버리지 측정에는 Devel::Cover를 사용하세요.
