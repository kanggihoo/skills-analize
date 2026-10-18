---
name: laravel-plugin-discovery
description: LaraPlugins.io MCP로 Laravel 패키지를 찾아 평가합니다. 사용자가 플러그인을 찾거나, 패키지 상태를 확인하거나, Laravel/PHP 호환성을 평가하고 싶을 때 사용합니다.
metadata:
  origin: ECC
---

# Laravel 플러그인 탐색

LaraPlugins.io MCP 서버를 사용해 상태가 좋은 Laravel 패키지를 찾고, 평가하고, 선택합니다.

## 사용 시점

- 특정 기능(예: "auth", "permissions", "admin panel")을 위한 Laravel 패키지를 찾고 싶은 경우
- "...에는 어떤 패키지를 써야 하나요?" 또는 "...를 위한 Laravel 패키지가 있나요?"라고 묻는 경우
- 패키지가 활발히 유지보수되고 있는지 확인하고 싶은 경우
- Laravel 버전 호환성을 확인해야 하는 경우
- 프로젝트에 추가하기 전에 패키지 상태를 평가하고 싶은 경우

## MCP 요구 사항

LaraPlugins MCP 서버가 설정되어 있어야 합니다. `~/.claude.json`의 mcpServers에 추가하세요.

```json
"laraplugins": {
  "type": "http",
  "url": "https://laraplugins.io/mcp/plugins"
}
```

API 키는 필요하지 않습니다. 이 서버는 Laravel 커뮤니티에 무료로 제공됩니다.

## MCP 도구

LaraPlugins MCP는 두 가지 주요 도구를 제공합니다.

### SearchPluginTool

키워드, 상태 점수, 벤더, 버전 호환성으로 패키지를 검색합니다.

**파라미터:**
- `text_search` (string, 선택): 검색 키워드 (예: "permission", "admin", "api")
- `health_score` (string, 선택): 상태 구간으로 필터링 — `Healthy`, `Medium`, `Unhealthy`, `Unrated`
- `laravel_compatibility` (string, 선택): Laravel 버전으로 필터링 — `"5"`, `"6"`, `"7"`, `"8"`, `"9"`, `"10"`, `"11"`, `"12"`, `"13"`
- `php_compatibility` (string, 선택): PHP 버전으로 필터링 — `"7.4"`, `"8.0"`, `"8.1"`, `"8.2"`, `"8.3"`, `"8.4"`, `"8.5"`
- `vendor_filter` (string, 선택): 벤더 이름으로 필터링 (예: "spatie", "laravel")
- `page` (number, 선택): 페이지네이션용 페이지 번호

### GetPluginDetailsTool

특정 패키지의 상세 지표, readme 내용, 버전 이력을 가져옵니다.

**파라미터:**
- `package` (string, 필수): 전체 Composer 패키지 이름 (예: "spatie/laravel-permission")
- `include_versions` (boolean, 선택): 응답에 버전 이력 포함 여부

---

## 동작 방식

### 패키지 찾기

사용자가 기능을 위한 패키지를 찾고 싶을 때:

1. 관련 키워드로 `SearchPluginTool`을 사용합니다.
2. 상태 점수, Laravel 버전, PHP 버전으로 필터를 적용합니다.
3. 패키지 이름, 설명, 상태 지표와 함께 결과를 검토합니다.

### 패키지 평가

사용자가 특정 패키지를 평가하고 싶을 때:

1. 패키지 이름으로 `GetPluginDetailsTool`을 사용합니다.
2. 상태 점수, 마지막 업데이트 날짜, Laravel 버전 지원을 검토합니다.
3. 벤더 평판과 위험 지표를 확인합니다.

### 호환성 확인

사용자에게 Laravel 또는 PHP 버전 호환성이 필요할 때:

1. 사용자의 버전으로 `laravel_compatibility` 필터를 설정해 검색합니다.
2. 또는 특정 패키지의 상세 정보를 가져와 지원 버전을 확인합니다.

---

## 예시

### 예시: 인증 패키지 찾기

```
SearchPluginTool({
  text_search: "authentication",
  health_score: "Healthy"
})
```

"authentication"과 관련되고 상태가 건강한 패키지를 반환합니다:
- spatie/laravel-permission
- laravel/breeze
- laravel/passport
- 등

### 예시: Laravel 12 호환 패키지 찾기

```
SearchPluginTool({
  text_search: "admin panel",
  laravel_compatibility: "12"
})
```

Laravel 12와 호환되는 패키지를 반환합니다.

### 예시: 패키지 상세 가져오기

```
GetPluginDetailsTool({
  package: "spatie/laravel-permission",
  include_versions: true
})
```

반환 내용:
- 상태 점수와 최근 활동
- Laravel/PHP 버전 지원
- 벤더 평판 (위험 점수)
- 버전 이력
- 간단한 설명

### 예시: 벤더별 패키지 찾기

```
SearchPluginTool({
  vendor_filter: "spatie",
  health_score: "Healthy"
})
```

벤더 "spatie"의 상태가 건강한 모든 패키지를 반환합니다.

---

## 필터링 모범 사례

### 상태 점수별

| 상태 구간 | 의미 |
|-------------|---------|
| `Healthy` | 활발한 유지보수, 최근 업데이트 |
| `Medium` | 간헐적 업데이트, 주의가 필요할 수 있음 |
| `Unhealthy` | 방치되었거나 드물게 유지보수됨 |
| `Unrated` | 아직 평가되지 않음 |

**권장**: 프로덕션 애플리케이션에는 `Healthy` 패키지를 우선하세요.

### Laravel 버전별

| 버전 | 참고 |
|---------|-------|
| `13` | 최신 Laravel |
| `12` | 현재 안정 버전 |
| `11` | 아직 널리 사용됨 |
| `10` | 레거시지만 흔함 |
| `5`-`9` | 지원 종료 |

**권장**: 대상 프로젝트의 Laravel 버전과 맞추세요.

### 필터 조합

```typescript
// 권한 관리용으로 상태가 건강하고 Laravel 12와 호환되는 패키지 찾기
SearchPluginTool({
  text_search: "permission",
  health_score: "Healthy",
  laravel_compatibility: "12"
})
```

---

## 응답 해석

### 검색 결과

각 결과에는 다음이 포함됩니다.
- 패키지 이름 (예: `spatie/laravel-permission`)
- 간단한 설명
- 상태 표시기
- Laravel 버전 지원 배지

### 패키지 상세

상세 응답에는 다음이 포함됩니다.
- **상태 점수**: 숫자 또는 구간 표시기
- **마지막 활동**: 패키지가 마지막으로 업데이트된 시점
- **Laravel 지원**: 버전 호환성 매트릭스
- **PHP 지원**: PHP 버전 호환성
- **위험 점수**: 벤더 신뢰 지표
- **버전 이력**: 최근 릴리스 타임라인

---

## 일반적인 사용 사례

| 시나리오 | 권장 접근 |
|----------|---------------------|
| "인증에는 어떤 패키지?" | 건강한 필터로 "auth" 검색 |
| "spatie/package가 아직 유지보수되나요?" | 상세 가져오기, 상태 점수 확인 |
| "Laravel 12용 패키지가 필요해요" | laravel_compatibility: "12"로 검색 |
| "관리자 패널 패키지 찾기" | "admin panel" 검색 후 결과 검토 |
| "벤더 평판 확인" | 벤더로 검색 후 상세 확인 |

---

## 모범 사례

1. **항상 상태로 필터링하세요** — 프로덕션 프로젝트에는 `health_score: "Healthy"`를 사용하세요.
2. **Laravel 버전을 맞추세요** — `laravel_compatibility`가 대상 프로젝트와 일치하는지 항상 확인하세요.
3. **벤더 평판을 확인하세요** — 알려진 벤더(spatie, laravel 등)의 패키지를 우선하세요.
4. **추천하기 전에 검토하세요** — 포괄적인 평가를 위해 GetPluginDetailsTool을 사용하세요.
5. **API 키는 필요 없습니다** — MCP는 무료이며 인증이 필요하지 않습니다.

---

## 관련 스킬

- `laravel-patterns` — Laravel 아키텍처와 패턴
- `laravel-tdd` — Laravel을 위한 테스트 주도 개발
- `laravel-security` — Laravel 보안 모범 사례
- `documentation-lookup` — 일반 라이브러리 문서 조회 (Context7)
