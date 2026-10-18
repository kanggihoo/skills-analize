---
name: laravel-verification
description: "Laravel 프로젝트 검증 루프: 환경 점검, 린팅, 정적 분석, 커버리지를 포함한 테스트, 보안 스캔, 배포 준비 상태 확인. 병합 또는 배포 전 Laravel 프로젝트를 검증할 때 사용합니다 — 린트, 정적 분석, 테스트, 커버리지, 보안."
metadata:
  origin: ECC
---

# Laravel 검증 루프

PR 생성 전, 큰 변경 후, 배포 전에 실행합니다.

## 사용 시점

- Laravel 프로젝트에 대한 풀 리퀘스트를 열기 전
- 대규모 리팩터링 또는 의존성 업그레이드 후
- 스테이징 또는 프로덕션 배포 전 검증
- 전체 린트 -> 테스트 -> 보안 -> 배포 준비 파이프라인 실행

## 동작 방식

- 환경 점검부터 배포 준비 상태까지 단계를 순서대로 실행하여 각 계층이 이전 계층 위에 쌓이도록 합니다.
- 환경 및 Composer 점검이 나머지 단계의 관문이므로, 실패하면 즉시 중단합니다.
- 전체 테스트와 커버리지를 실행하기 전에 린팅/정적 분석이 깨끗해야 합니다.
- 보안 및 마이그레이션 검토는 테스트 이후에 수행하여 데이터나 릴리스 단계 전에 동작을 먼저 확인합니다.
- 빌드/배포 준비 상태와 큐/스케줄러 점검은 최종 관문이며, 어느 하나라도 실패하면 릴리스를 차단합니다.

## 1단계: 환경 점검

```bash
php -v
composer --version
php artisan --version
```

- `.env` 파일이 있고 필수 키가 존재하는지 확인
- 프로덕션 환경에서는 `APP_DEBUG=false`인지 확인
- `APP_ENV`가 대상 배포 환경(`production`, `staging`)과 일치하는지 확인

Laravel Sail을 로컬에서 사용하는 경우:

```bash
./vendor/bin/sail php -v
./vendor/bin/sail artisan --version
```

## 1.5단계: Composer 및 오토로드

```bash
composer validate
composer dump-autoload -o
```

## 2단계: 린팅 및 정적 분석

```bash
vendor/bin/pint --test
vendor/bin/phpstan analyse
```

프로젝트가 PHPStan 대신 Psalm을 사용하는 경우:

```bash
vendor/bin/psalm
```

## 3단계: 테스트 및 커버리지

```bash
php artisan test
```

커버리지(CI):

```bash
XDEBUG_MODE=coverage php artisan test --coverage
```

CI 예시(포맷 -> 정적 분석 -> 테스트):

```bash
vendor/bin/pint --test
vendor/bin/phpstan analyse
XDEBUG_MODE=coverage php artisan test --coverage
```

## 4단계: 보안 및 의존성 점검

```bash
composer audit
```

## 5단계: 데이터베이스 및 마이그레이션

```bash
php artisan migrate --pretend
php artisan migrate:status
```

- 파괴적인 마이그레이션은 신중하게 검토하기
- 마이그레이션 파일명이 `Y_m_d_His_*` 형식을 따르고 변경 내용을 명확히 설명하는지 확인 (예: `2025_03_14_154210_create_orders_table.php`)
- 롤백이 가능한지 확인
- `down()` 메서드를 검증하고, 명시적인 백업 없이 되돌릴 수 없는 데이터 손실을 피하기

## 6단계: 빌드 및 배포 준비 상태

```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

- 프로덕션 설정에서 캐시 워밍업이 성공하는지 확인
- 큐 워커와 스케줄러가 구성되어 있는지 확인
- 대상 환경에서 `storage/` 및 `bootstrap/cache/`에 쓰기 권한이 있는지 확인

## 7단계: 큐 및 스케줄러 점검

```bash
php artisan schedule:list
php artisan queue:failed
```

Horizon을 사용하는 경우:

```bash
php artisan horizon:status
```

`queue:monitor`를 사용할 수 있다면, 작업을 처리하지 않고 백로그를 확인하는 데 사용합니다:

```bash
php artisan queue:monitor default --max=100
```

적극적 검증(스테이징 전용): 전용 큐에 아무 작업도 하지 않는 작업을 디스패치하고, 워커 하나를 실행해 처리하게 합니다(`sync`가 아닌 큐 연결이 설정되어 있어야 함).

```bash
php artisan tinker --execute="dispatch((new App\\Jobs\\QueueHealthcheck())->onQueue('healthcheck'))"
php artisan queue:work --once --queue=healthcheck
```

작업이 기대한 부수 효과(로그 항목, 헬스체크 테이블 행, 또는 메트릭)를 만들었는지 확인합니다.

테스트 작업을 처리해도 안전한 비프로덕션 환경에서만 실행합니다.

## 예시

최소 흐름:

```bash
php -v
composer --version
php artisan --version
composer validate
vendor/bin/pint --test
vendor/bin/phpstan analyse
php artisan test
composer audit
php artisan migrate --pretend
php artisan config:cache
php artisan queue:failed
```

CI 스타일 파이프라인:

```bash
composer validate
composer dump-autoload -o
vendor/bin/pint --test
vendor/bin/phpstan analyse
XDEBUG_MODE=coverage php artisan test --coverage
composer audit
php artisan migrate --pretend
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan schedule:list
```
