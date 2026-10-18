---
name: perl-security
description: taint 모드, 입력 검증, 안전한 프로세스 실행, DBI 파라미터화 쿼리, 웹 보안(XSS/SQLi/CSRF), perlcritic 보안 정책을 포괄하는 Perl 보안. Perl 입력 처리, 프로세스 실행, DBI 쿼리, 웹 대상 코드를 리뷰할 때 사용.
metadata:
  origin: ECC
---

# Perl 보안 패턴

입력 검증, 인젝션 방지, 안전한 코딩 관행을 다루는 Perl 애플리케이션용 포괄적 보안 지침.

## 활성화 시점

- Perl 애플리케이션에서 사용자 입력을 처리할 때
- Perl 웹 애플리케이션을 만들 때 (CGI, Mojolicious, Dancer2, Catalyst)
- Perl 코드에서 보안 취약점을 리뷰할 때
- 사용자가 제공한 경로로 파일 작업을 할 때
- Perl에서 시스템 명령을 실행할 때
- DBI 데이터베이스 쿼리를 작성할 때

## 동작 방식

외부에서 들어온 데이터를 추적하는 경계에서 시작해 바깥으로 넓혀 간다. 입력을 검증하고 taint를 해제하며, 파일 시스템과 프로세스 실행을 제한하고, 모든 곳에서 파라미터화된 DBI 쿼리를 쓴다. 아래 예시는 사용자 입력, 셸, 네트워크를 건드리는 Perl 코드를 배포하기 전에 이 스킬이 적용하기를 기대하는 안전한 기본값을 보여 준다.

## Taint 모드

Perl의 taint 모드(`-T`)는 외부 출처의 데이터를 추적해 명시적 검증 없이 위험한 작업에 쓰이는 것을 막는다.

### Taint 모드 켜기

```perl
#!/usr/bin/perl -T
use v5.36;

# Tainted: 프로그램 외부에서 온 모든 것
my $input    = $ARGV[0];        # Tainted
my $env_path = $ENV{PATH};      # Tainted
my $form     = <STDIN>;         # Tainted
my $query    = $ENV{QUERY_STRING}; # Tainted

# PATH를 일찍 정리 (taint 모드에서 필수)
$ENV{PATH} = '/usr/local/bin:/usr/bin:/bin';
delete @ENV{qw(IFS CDPATH ENV BASH_ENV)};
```

### Taint 해제 패턴

```perl
use v5.36;

# 좋음: 구체적인 정규식으로 검증하고 taint 해제
sub untaint_username($input) {
    if ($input =~ /^([a-zA-Z0-9_]{3,30})$/) {
        return $1;  # $1은 taint가 해제됨
    }
    die "Invalid username: must be 3-30 alphanumeric characters\n";
}

# 좋음: 파일 경로를 검증하고 taint 해제
sub untaint_filename($input) {
    if ($input =~ m{^([a-zA-Z0-9._-]+)$}) {
        return $1;
    }
    die "Invalid filename: contains unsafe characters\n";
}

# 나쁨: 지나치게 느슨한 taint 해제 (목적을 무력화)
sub bad_untaint($input) {
    $input =~ /^(.*)$/s;
    return $1;  # 무엇이든 허용 — 의미가 없음
}
```

## 입력 검증

### 블록리스트보다 허용목록

```perl
use v5.36;

# 좋음: 허용목록 — 허용되는 것을 정확히 정의
sub validate_sort_field($field) {
    my %allowed = map { $_ => 1 } qw(name email created_at updated_at);
    die "Invalid sort field: $field\n" unless $allowed{$field};
    return $field;
}

# 좋음: 구체적인 패턴으로 검증
sub validate_email($email) {
    if ($email =~ /^([a-zA-Z0-9._%+-]+\@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/) {
        return $1;
    }
    die "Invalid email address\n";
}

sub validate_integer($input) {
    if ($input =~ /^(-?\d{1,10})$/) {
        return $1 + 0;  # 숫자로 강제 변환
    }
    die "Invalid integer\n";
}

# 나쁨: 블록리스트 — 항상 불완전함
sub bad_validate($input) {
    die "Invalid" if $input =~ /[<>"';&|]/;  # 인코딩된 공격을 놓침
    return $input;
}
```

### 길이 제한

```perl
use v5.36;

sub validate_comment($text) {
    die "Comment is required\n"        unless length($text) > 0;
    die "Comment exceeds 10000 chars\n" if length($text) > 10_000;
    return $text;
}
```

## 안전한 정규식

### ReDoS 방지

중첩된 수량자가 겹치는 패턴에 쓰이면 파국적 백트래킹이 일어난다.

```perl
use v5.36;

# 나쁨: ReDoS에 취약 (지수적 백트래킹)
my $bad_re = qr/^(a+)+$/;           # 중첩 수량자
my $bad_re2 = qr/^([a-zA-Z]+)*$/;   # 문자 클래스에 중첩 수량자
my $bad_re3 = qr/^(.*?,){10,}$/;    # 반복되는 탐욕/게으른 조합

# 좋음: 중첩을 없애고 다시 작성
my $good_re = qr/^a+$/;             # 단일 수량자
my $good_re2 = qr/^[a-zA-Z]+$/;     # 문자 클래스에 단일 수량자

# 좋음: 가능한 수량자나 원자 그룹으로 백트래킹 방지
my $safe_re = qr/^[a-zA-Z]++$/;             # 소유 수량자 (5.10+)
my $safe_re2 = qr/^(?>a+)$/;                # 원자 그룹

# 좋음: 신뢰할 수 없는 패턴에 시간 제한 걸기
use POSIX qw(alarm);
sub safe_match($string, $pattern, $timeout = 2) {
    my $matched;
    eval {
        local $SIG{ALRM} = sub { die "Regex timeout\n" };
        alarm($timeout);
        $matched = $string =~ $pattern;
        alarm(0);
    };
    alarm(0);
    die $@ if $@;
    return $matched;
}
```

## 안전한 파일 작업

### 3인수 open

```perl
use v5.36;

# 좋음: 3인수 open, 렉시컬 파일 핸들, 반환값 확인
sub read_file($path) {
    open my $fh, '<:encoding(UTF-8)', $path
        or die "Cannot open '$path': $!\n";
    local $/;
    my $content = <$fh>;
    close $fh;
    return $content;
}

# 나쁨: 사용자 데이터를 쓰는 2인수 open (명령 인젝션)
sub bad_read($path) {
    open my $fh, $path;        # $path = "|rm -rf /" 이면 명령이 실행됨!
    open my $fh, "< $path";   # 셸 메타문자 인젝션
}
```

### TOCTOU 방지와 경로 순회

```perl
use v5.36;
use Fcntl qw(:DEFAULT :flock);
use File::Spec;
use Cwd qw(realpath);

# 원자적 파일 생성
sub create_file_safe($path) {
    sysopen(my $fh, $path, O_WRONLY | O_CREAT | O_EXCL, 0600)
        or die "Cannot create '$path': $!\n";
    return $fh;
}

# 경로가 허용된 디렉터리 안에 머무는지 검증
sub safe_path($base_dir, $user_path) {
    my $real = realpath(File::Spec->catfile($base_dir, $user_path))
        // die "Path does not exist\n";
    my $base_real = realpath($base_dir)
        // die "Base dir does not exist\n";
    die "Path traversal blocked\n" unless $real =~ /^\Q$base_real\E(?:\/|\z)/;
    return $real;
}
```

임시 파일에는 `File::Temp`(`tempfile(UNLINK => 1)`)를 쓰고, 경쟁 상태를 막으려면 `flock(LOCK_EX)`를 사용한다.

## 안전한 프로세스 실행

### 리스트 형식 system과 exec

```perl
use v5.36;

# 좋음: 리스트 형식 — 셸 보간 없음
sub run_command(@cmd) {
    system(@cmd) == 0
        or die "Command failed: @cmd\n";
}

run_command('grep', '-r', $user_pattern, '/var/log/app/');

# 좋음: IPC::Run3으로 출력을 안전하게 캡처
use IPC::Run3;
sub capture_output(@cmd) {
    my ($stdout, $stderr);
    run3(\@cmd, \undef, \$stdout, \$stderr);
    if ($?) {
        die "Command failed (exit $?): $stderr\n";
    }
    return $stdout;
}

# 나쁨: 문자열 형식 — 셸 인젝션!
sub bad_search($pattern) {
    system("grep -r '$pattern' /var/log/app/");  # $pattern = "'; rm -rf / #" 이면
}

# 나쁨: 보간이 있는 백틱
my $output = `ls $user_dir`;   # 셸 인젝션 위험
```

외부 명령의 표준 출력/에러를 안전하게 캡처할 때는 `Capture::Tiny`도 사용한다.

## SQL 인젝션 방지

### DBI 플레이스홀더

```perl
use v5.36;
use DBI;

my $dbh = DBI->connect($dsn, $user, $pass, {
    RaiseError => 1,
    PrintError => 0,
    AutoCommit => 1,
});

# 좋음: 파라미터화된 쿼리 — 항상 플레이스홀더 사용
sub find_user($dbh, $email) {
    my $sth = $dbh->prepare('SELECT * FROM users WHERE email = ?');
    $sth->execute($email);
    return $sth->fetchrow_hashref;
}

sub search_users($dbh, $name, $status) {
    my $sth = $dbh->prepare(
        'SELECT * FROM users WHERE name LIKE ? AND status = ? ORDER BY name'
    );
    $sth->execute("%$name%", $status);
    return $sth->fetchall_arrayref({});
}

# 나쁨: SQL 문자열 보간 (SQL 인젝션 취약점!)
sub bad_find($dbh, $email) {
    my $sth = $dbh->prepare("SELECT * FROM users WHERE email = '$email'");
    # $email = "' OR 1=1 --" 이면 모든 사용자가 반환됨
    $sth->execute;
    return $sth->fetchrow_hashref;
}
```

### 동적 컬럼 허용목록

```perl
use v5.36;

# 좋음: 컬럼 이름을 허용목록에 대해 검증
sub order_by($dbh, $column, $direction) {
    my %allowed_cols = map { $_ => 1 } qw(name email created_at);
    my %allowed_dirs = map { $_ => 1 } qw(ASC DESC);

    die "Invalid column: $column\n"    unless $allowed_cols{$column};
    die "Invalid direction: $direction\n" unless $allowed_dirs{uc $direction};

    my $sth = $dbh->prepare("SELECT * FROM users ORDER BY $column $direction");
    $sth->execute;
    return $sth->fetchall_arrayref({});
}

# 나쁨: 사용자가 고른 컬럼을 그대로 보간
sub bad_order($dbh, $column) {
    $dbh->prepare("SELECT * FROM users ORDER BY $column");  # SQL 인젝션!
}
```

### DBIx::Class (ORM 안전성)

```perl
use v5.36;

# DBIx::Class는 안전한 파라미터화 쿼리를 생성한다
my @users = $schema->resultset('User')->search({
    status => 'active',
    email  => { -like => '%@example.com' },
}, {
    order_by => { -asc => 'name' },
    rows     => 50,
});
```

## 웹 보안

### XSS 방지

```perl
use v5.36;
use HTML::Entities qw(encode_entities);
use URI::Escape qw(uri_escape_utf8);

# 좋음: HTML 컨텍스트용으로 출력 인코딩
sub safe_html($user_input) {
    return encode_entities($user_input);
}

# 좋음: URL 컨텍스트용으로 인코딩
sub safe_url_param($value) {
    return uri_escape_utf8($value);
}

# 좋음: JSON 컨텍스트용으로 인코딩
use JSON::MaybeXS qw(encode_json);
sub safe_json($data) {
    return encode_json($data);  # 이스케이프를 처리함
}

# 템플릿 자동 이스케이프 (Mojolicious)
# <%= $user_input %>   — 자동 이스케이프 (안전)
# <%== $raw_html %>    — 원본 출력 (위험, 신뢰할 수 있는 내용에만 사용)

# 템플릿 자동 이스케이프 (Template Toolkit)
# [% user_input | html %]  — 명시적 HTML 인코딩

# 나쁨: HTML에 원본 출력
sub bad_html($input) {
    print "<div>$input</div>";  # $input에 <script>가 있으면 XSS
}
```

### CSRF 방어

```perl
use v5.36;
use Crypt::URandom qw(urandom);
use MIME::Base64 qw(encode_base64url);

sub generate_csrf_token() {
    return encode_base64url(urandom(32));
}
```

토큰을 검증할 때는 상수 시간 비교를 사용한다. 대부분의 웹 프레임워크(Mojolicious, Dancer2, Catalyst)는 CSRF 보호를 내장하고 있으므로, 직접 만든 해법보다 이것들을 우선 사용한다.

### 세션과 헤더 보안

```perl
use v5.36;

# Mojolicious 세션 + 헤더
$app->secrets(['long-random-secret-rotated-regularly']);
$app->sessions->secure(1);          # HTTPS 전용
$app->sessions->samesite('Lax');

$app->hook(after_dispatch => sub ($c) {
    $c->res->headers->header('X-Content-Type-Options' => 'nosniff');
    $c->res->headers->header('X-Frame-Options'        => 'DENY');
    $c->res->headers->header('Content-Security-Policy' => "default-src 'self'");
    $c->res->headers->header('Strict-Transport-Security' => 'max-age=31536000; includeSubDomains');
});
```

## 출력 인코딩

출력은 항상 그 컨텍스트에 맞게 인코딩한다. HTML에는 `HTML::Entities::encode_entities()`, URL에는 `URI::Escape::uri_escape_utf8()`, JSON에는 `JSON::MaybeXS::encode_json()`을 쓴다.

## CPAN 모듈 보안

- **버전 고정**: cpanfile에서 버전을 고정한다. 예: `requires 'DBI', '== 1.643';`
- **유지보수되는 모듈 우선**: MetaCPAN에서 최근 릴리스가 있는지 확인한다.
- **의존성 최소화**: 의존성 하나하나가 공격 표면이다.

## 보안 도구

### perlcritic 보안 정책

```ini
# .perlcriticrc — 보안 중심 설정
severity = 3
theme = security + core

# 3인수 open 요구
[InputOutput::RequireThreeArgOpen]
severity = 5

# 검사된 시스템 호출 요구
[InputOutput::RequireCheckedSyscalls]
functions = :builtins
severity = 4

# 문자열 eval 금지
[BuiltinFunctions::ProhibitStringyEval]
severity = 5

# 백틱 연산자 금지
[InputOutput::ProhibitBacktickOperators]
severity = 4

# CGI에서 taint 검사 요구
[Modules::RequireTaintChecking]
severity = 5

# 2인수 open 금지
[InputOutput::ProhibitTwoArgOpen]
severity = 5

# 베어워드 파일 핸들 금지
[InputOutput::ProhibitBarewordFileHandles]
severity = 5
```

### perlcritic 실행

```bash
# 파일 검사
perlcritic --severity 3 --theme security lib/MyApp/Handler.pm

# 프로젝트 전체 검사
perlcritic --severity 3 --theme security lib/

# CI 연동
perlcritic --severity 4 --theme security --quiet lib/ || exit 1
```

## 빠른 보안 체크리스트

| 점검 항목 | 확인할 내용 |
|---|---|
| Taint 모드 | CGI/웹 스크립트에 `-T` 플래그 |
| 입력 검증 | 허용목록 패턴, 길이 제한 |
| 파일 작업 | 3인수 open, 경로 순회 검사 |
| 프로세스 실행 | 리스트 형식 system, 셸 보간 없음 |
| SQL 쿼리 | DBI 플레이스홀더, 절대 보간하지 않음 |
| HTML 출력 | `encode_entities()`, 템플릿 자동 이스케이프 |
| CSRF 토큰 | 생성되고, 상태를 바꾸는 요청에서 검증됨 |
| 세션 설정 | Secure, HttpOnly, SameSite 쿠키 |
| HTTP 헤더 | CSP, X-Frame-Options, HSTS |
| 의존성 | 버전 고정, 감사된 모듈 |
| 정규식 안전성 | 중첩 수량자 없음, 앵커된 패턴 |
| 에러 메시지 | 스택 트레이스나 경로를 사용자에게 노출하지 않음 |

## 안티패턴

```perl
# 1. 사용자 데이터를 쓰는 2인수 open (명령 인젝션)
open my $fh, $user_input;               # 치명적 취약점

# 2. 문자열 형식 system (셸 인젝션)
system("convert $user_file output.png"); # 치명적 취약점

# 3. SQL 문자열 보간
$dbh->do("DELETE FROM users WHERE id = $id");  # SQL 인젝션

# 4. 사용자 입력이 들어간 eval (코드 인젝션)
eval $user_code;                         # 원격 코드 실행

# 5. $ENV를 정리 없이 신뢰
my $path = $ENV{UPLOAD_DIR};             # 조작될 수 있음
system("ls $path");                      # 이중 취약점

# 6. 검증 없이 taint 끄기
($input) = $input =~ /(.*)/s;           # 느슨한 taint 해제 — 목적을 무력화

# 7. HTML에 원본 사용자 데이터
print "<div>Welcome, $username!</div>";  # XSS

# 8. 검증되지 않은 리다이렉트
print $cgi->redirect($user_url);         # 오픈 리다이렉트
```

**기억할 것**: Perl의 유연함은 강력하지만 절제가 필요하다. 웹 대상 코드에는 taint 모드를 쓰고, 모든 입력은 허용목록으로 검증하며, 모든 쿼리에 DBI 플레이스홀더를 쓰고, 모든 출력은 그 컨텍스트에 맞게 인코딩하라. 심층 방어 — 단일 계층에 의존하지 말 것.
