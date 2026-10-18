---
name: perl-patterns
description: 견고하고 유지보수하기 쉬운 Perl 애플리케이션을 만들기 위한 Perl 5.36+ 현대 관용구, 모범 사례, 규약. 최신 Perl 5.36+ 코드를 작성하거나 리뷰할 때 사용.
metadata:
  origin: ECC
---

# 현대 Perl 개발 패턴

견고하고 유지보수하기 쉬운 애플리케이션을 만들기 위한 Perl 5.36+ 관용적 패턴과 모범 사례.

## 활성화 시점

- 새 Perl 코드나 모듈을 작성할 때
- Perl 코드가 관용구 규칙을 따르는지 리뷰할 때
- 레거시 Perl을 현대 표준으로 리팩터링할 때
- Perl 모듈 아키텍처를 설계할 때
- 5.36 이전 코드를 현대 Perl로 마이그레이션할 때

## 동작 방식

이 패턴들은 현대 Perl 5.36+ 기본값을 따르는 방향으로 적용한다. 시그니처, 명시적 모듈 사용, 집중된 에러 처리, 테스트 가능한 경계가 그것이다. 아래 예시는 시작점으로 그대로 복사한 뒤, 눈앞의 앱, 의존성 스택, 배포 모델에 맞게 다듬어 쓰도록 만들어졌다.

## 핵심 원칙

### 1. `v5.36` 프라그마 사용

`use v5.36` 한 줄이 기존의 반복 선언을 대신하며, strict, warnings, 서브루틴 시그니처를 활성화한다.

```perl
# 좋음: 현대적인 머리말
use v5.36;

sub greet($name) {
    say "Hello, $name!";
}

# 나쁨: 레거시 보일러플레이트
use strict;
use warnings;
use feature 'say', 'signatures';
no warnings 'experimental::signatures';

sub greet {
    my ($name) = @_;
    say "Hello, $name!";
}
```

### 2. 서브루틴 시그니처

명확성과 자동 인자 개수 검사를 위해 시그니처를 사용한다.

```perl
use v5.36;

# 좋음: 기본값이 있는 시그니처
sub connect_db($host, $port = 5432, $timeout = 30) {
    # $host는 필수, 나머지는 기본값이 있음
    return DBI->connect("dbi:Pg:host=$host;port=$port", undef, undef, {
        RaiseError => 1,
        PrintError => 0,
    });
}

# 좋음: 가변 인자를 위한 slurpy 매개변수
sub log_message($level, @details) {
    say "[$level] " . join(' ', @details);
}

# 나쁨: 인자를 수동으로 풀어내기
sub connect_db {
    my ($host, $port, $timeout) = @_;
    $port    //= 5432;
    $timeout //= 30;
    # ...
}
```

### 3. 컨텍스트 민감성

스칼라 컨텍스트와 리스트 컨텍스트의 차이를 이해한다. Perl의 핵심 개념이다.

```perl
use v5.36;

my @items = (1, 2, 3, 4, 5);

my @copy  = @items;            # 리스트 컨텍스트: 모든 요소
my $count = @items;            # 스칼라 컨텍스트: 개수 (5)
say "Items: " . scalar @items; # 스칼라 컨텍스트를 강제
```

### 4. 후위 역참조

중첩 구조를 읽기 쉽게 하려면 후위 역참조 문법을 사용한다.

```perl
use v5.36;

my $data = {
    users => [
        { name => 'Alice', roles => ['admin', 'user'] },
        { name => 'Bob',   roles => ['user'] },
    ],
};

# 좋음: 후위 역참조
my @users = $data->{users}->@*;
my @roles = $data->{users}[0]{roles}->@*;
my %first = $data->{users}[0]->%*;

# 나쁨: 감싸는 형태의 역참조 (체인에서 읽기 어려움)
my @users = @{ $data->{users} };
my @roles = @{ $data->{users}[0]{roles} };
```

### 5. `isa` 연산자 (5.32+)

중위 타입 검사. `blessed($o) && $o->isa('X')`를 대체한다.

```perl
use v5.36;
if ($obj isa 'My::Class') { $obj->do_something }
```

## 에러 처리

### eval/die 패턴

```perl
use v5.36;

sub parse_config($path) {
    my $content = eval { path($path)->slurp_utf8 };
    die "Config error: $@" if $@;
    return decode_json($content);
}
```

### Try::Tiny (안정적인 예외 처리)

```perl
use v5.36;
use Try::Tiny;

sub fetch_user($id) {
    my $user = try {
        $db->resultset('User')->find($id)
            // die "User $id not found\n";
    }
    catch {
        warn "Failed to fetch user $id: $_";
        undef;
    };
    return $user;
}
```

### 네이티브 try/catch (5.40+)

```perl
use v5.40;

sub divide($x, $y) {
    try {
        die "Division by zero" if $y == 0;
        return $x / $y;
    }
    catch ($e) {
        warn "Error: $e";
        return;
    }
}
```

## Moo를 이용한 현대적 OO

가볍고 현대적인 OO에는 Moo를 우선 사용한다. Moose의 메타프로토콜이 꼭 필요할 때만 Moose를 쓴다.

```perl
# 좋음: Moo 클래스
package User;
use Moo;
use Types::Standard qw(Str Int ArrayRef);
use namespace::autoclean;

has name  => (is => 'ro', isa => Str, required => 1);
has email => (is => 'ro', isa => Str, required => 1);
has age   => (is => 'ro', isa => Int, default  => sub { 0 });
has roles => (is => 'ro', isa => ArrayRef[Str], default => sub { [] });

sub is_admin($self) {
    return grep { $_ eq 'admin' } $self->roles->@*;
}

sub greet($self) {
    return "Hello, I'm " . $self->name;
}

1;

# 사용 예
my $user = User->new(
    name  => 'Alice',
    email => 'alice@example.com',
    roles => ['admin', 'user'],
);

# 나쁨: 블레스된 해시 참조 (검증도, 접근자도 없음)
package User;
sub new {
    my ($class, %args) = @_;
    return bless \%args, $class;
}
sub name { return $_[0]->{name} }
1;
```

### Moo 역할

```perl
package Role::Serializable;
use Moo::Role;
use JSON::MaybeXS qw(encode_json);
requires 'TO_HASH';
sub to_json($self) { encode_json($self->TO_HASH) }
1;

package User;
use Moo;
with 'Role::Serializable';
has name  => (is => 'ro', required => 1);
has email => (is => 'ro', required => 1);
sub TO_HASH($self) { { name => $self->name, email => $self->email } }
1;
```

### 네이티브 `class` 키워드 (5.38+, Corinna)

```perl
use v5.38;
use feature 'class';
no warnings 'experimental::class';

class Point {
    field $x :param;
    field $y :param;
    method magnitude() { sqrt($x**2 + $y**2) }
}

my $p = Point->new(x => 3, y => 4);
say $p->magnitude;  # 5
```

## 정규식

### 명명된 캡처와 `/x` 플래그

```perl
use v5.36;

# 좋음: 가독성을 위해 /x와 명명된 캡처 사용
my $log_re = qr{
    ^ (?<timestamp> \d{4}-\d{2}-\d{2} \s \d{2}:\d{2}:\d{2} )
    \s+ \[ (?<level> \w+ ) \]
    \s+ (?<message> .+ ) $
}x;

if ($line =~ $log_re) {
    say "Time: $+{timestamp}, Level: $+{level}";
    say "Message: $+{message}";
}

# 나쁨: 위치 기반 캡처 (유지보수하기 어려움)
if ($line =~ /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\s+\[(\w+)\]\s+(.+)$/) {
    say "Time: $1, Level: $2";
}
```

### 미리 컴파일된 패턴

```perl
use v5.36;

# 좋음: 한 번 컴파일해서 여러 번 사용
my $email_re = qr/^[A-Za-z0-9._%+-]+\@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

sub validate_emails(@emails) {
    return grep { $_ =~ $email_re } @emails;
}
```

## 데이터 구조

### 참조와 안전한 깊은 접근

```perl
use v5.36;

# 해시 참조와 배열 참조
my $config = {
    database => {
        host => 'localhost',
        port => 5432,
        options => ['utf8', 'sslmode=require'],
    },
};

# 안전한 깊은 접근 (중간 단계가 없으면 undef 반환)
my $port = $config->{database}{port};           # 5432
my $missing = $config->{cache}{host};           # undef, 에러 없음

# 해시 슬라이스
my %subset;
@subset{qw(host port)} = @{$config->{database}}{qw(host port)};

# 배열 슬라이스
my @first_two = $config->{database}{options}->@[0, 1];

# 다중 변수 for 루프 (5.36에서는 실험적, 5.40에서 안정)
use feature 'for_list';
no warnings 'experimental::for_list';
for my ($key, $val) (%$config) {
    say "$key => $val";
}
```

## 파일 I/O

### 3인수 open

```perl
use v5.36;

# 좋음: autodie와 함께 3인수 open (코어 모듈, 'or die' 제거)
use autodie;

sub read_file($path) {
    open my $fh, '<:encoding(UTF-8)', $path;
    local $/;
    my $content = <$fh>;
    close $fh;
    return $content;
}

# 나쁨: 2인수 open (셸 인젝션 위험, perl-security 참고)
open FH, $path;            # 절대 이렇게 하지 말 것
open FH, "< $path";        # 여전히 나쁨 — 모드 문자열에 사용자 데이터
```

### 파일 작업에 Path::Tiny 사용

```perl
use v5.36;
use Path::Tiny;

my $file = path('config', 'app.json');
my $content = $file->slurp_utf8;
$file->spew_utf8($new_content);

# 디렉터리 순회
for my $child (path('src')->children(qr/\.pl$/)) {
    say $child->basename;
}
```

## 모듈 구성

### 표준 프로젝트 레이아웃

```text
MyApp/
├── lib/
│   └── MyApp/
│       ├── App.pm           # 메인 모듈
│       ├── Config.pm        # 설정
│       ├── DB.pm            # 데이터베이스 계층
│       └── Util.pm          # 유틸리티
├── bin/
│   └── myapp                # 진입점 스크립트
├── t/
│   ├── 00-load.t            # 컴파일 테스트
│   ├── unit/                # 단위 테스트
│   └── integration/         # 통합 테스트
├── cpanfile                 # 의존성
├── Makefile.PL              # 빌드 시스템
└── .perlcriticrc            # 린트 설정
```

### Exporter 패턴

```perl
package MyApp::Util;
use v5.36;
use Exporter 'import';

our @EXPORT_OK   = qw(trim);
our %EXPORT_TAGS = (all => \@EXPORT_OK);

sub trim($str) { $str =~ s/^\s+|\s+$//gr }

1;
```

## 도구

### perltidy 설정 (.perltidyrc)

```text
-i=4        # 들여쓰기 4칸
-l=100      # 줄 길이 100자
-ci=4       # 연속 줄 들여쓰기
-ce         # cuddled else
-bar        # 여는 중괄호를 같은 줄에
-nolq       # 긴 따옴표 문자열을 내어쓰지 않음
```

### perlcritic 설정 (.perlcriticrc)

```ini
severity = 3
theme = core + pbp + security

[InputOutput::RequireCheckedSyscalls]
functions = :builtins
exclude_functions = say print

[Subroutines::ProhibitExplicitReturnUndef]
severity = 4

[ValuesAndExpressions::ProhibitMagicNumbers]
allowed_values = 0 1 2 -1
```

### 의존성 관리 (cpanfile + carton)

```bash
cpanm App::cpanminus Carton   # 도구 설치
carton install                 # cpanfile에서 의존성 설치
carton exec -- perl bin/myapp  # 로컬 의존성으로 실행
```

```perl
# cpanfile
requires 'Moo', '>= 2.005';
requires 'Path::Tiny';
requires 'JSON::MaybeXS';
requires 'Try::Tiny';

on test => sub {
    requires 'Test2::V0';
    requires 'Test::MockModule';
};
```

## 빠른 참조: 현대 Perl 관용구

| 레거시 패턴 | 현대적 대체 |
|---|---|
| `use strict; use warnings;` | `use v5.36;` |
| `my ($x, $y) = @_;` | `sub foo($x, $y) { ... }` |
| `@{ $ref }` | `$ref->@*` |
| `%{ $ref }` | `$ref->%*` |
| `open FH, "< $file"` | `open my $fh, '<:encoding(UTF-8)', $file` |
| `blessed hashref` | 타입이 있는 `Moo` 클래스 |
| `$1, $2, $3` | `$+{name}` (명명된 캡처) |
| `eval { }; if ($@)` | `Try::Tiny` 또는 네이티브 `try/catch` (5.40+) |
| `BEGIN { require Exporter; }` | `use Exporter 'import';` |
| 수동 파일 작업 | `Path::Tiny` |
| `blessed($o) && $o->isa('X')` | `$o isa 'X'` (5.32+) |
| `builtin::true / false` | `use builtin 'true', 'false';` (5.36+, 실험적) |

## 안티패턴

```perl
# 1. 2인수 open (보안 위험)
open FH, $filename;                     # 절대 금지

# 2. 간접 객체 문법 (모호한 파싱)
my $obj = new Foo(bar => 1);            # 나쁨
my $obj = Foo->new(bar => 1);           # 좋음

# 3. $_에 대한 과도한 의존
map { process($_) } grep { validate($_) } @items;  # 따라가기 어려움
my @valid = grep { validate($_) } @items;           # 더 나음: 나눠서 작성
my @results = map { process($_) } @valid;

# 4. strict refs 비활성화
no strict 'refs';                        # 거의 항상 잘못됨
${"My::Package::$var"} = $value;         # 대신 해시를 사용

# 5. 설정으로서의 전역 변수
our $TIMEOUT = 30;                       # 나쁨: 변경 가능한 전역
use constant TIMEOUT => 30;              # 더 나음: 상수
# 최선: 기본값이 있는 Moo 속성

# 6. 모듈 로딩에 문자열 eval 사용
eval "require $module";                  # 나쁨: 코드 인젝션 위험
eval "use $module";                      # 나쁨
use Module::Runtime 'require_module';    # 좋음: 안전한 모듈 로딩
require_module($module);
```

**기억할 것**: 현대 Perl은 깔끔하고 읽기 쉬우며 안전하다. 보일러플레이트는 `use v5.36`에 맡기고, 객체에는 Moo를 쓰며, 직접 만든 해법보다 검증된 CPAN 모듈을 우선하라.
