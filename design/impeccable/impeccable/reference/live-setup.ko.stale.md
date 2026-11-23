한 번만 수행하는 라이브 모드 프로젝트 설정입니다. `impeccable live`에서 `config_missing` / `config_invalid`가 보고되거나 `configDrift` 처리가 필요하거나 설정에 `cspChecked`가 없을 때만 [live.md](live.md)에서 불러옵니다. 세션마다 거치는 기본 흐름에는 포함되지 않습니다.

## 설정 파일 작성

부팅 시 출력된 `path`에 파일을 만듭니다 (기본값 `.impeccable/live/config.json`).

```json
{
  "files": ["<path-or-glob>", "<path-or-glob>", ...],
  "exclude": ["<optional-glob>", ...],
  "insertBefore": "</body>",
  "commentSyntax": "html",
  "cspChecked": true
}
```

`files`는 삽입 대상입니다: **브라우저가 실제로 불러오는 HTML 파일**이며 반드시 소스 파일일 필요는 없습니다 (추적 여부와 생성 여부는 여기서 중요하지 않으며 wrap에는 자체 생성 파일 보호 기능이 있음). 항목은 문자 그대로의 경로나 glob 패턴입니다. 선택적인 `exclude`는 `files` glob에 포함될 파일 중 제외할 파일 (메일 템플릿, 데모 fixture 등)을 지정합니다. `cspChecked`는 아래 CSP 절차를 실행했다는 표시이며 최초 설정에는 없습니다.

**강제 제외 경로 (덮어쓸 수 없음):** `**/node_modules/**`, `**/.git/**`. 여기에 삽입하면 제3자 코드를 계측하게 됩니다.

**Glob 문법:** `**`는 세그먼트 0개 이상에 일치하고, `*`는 한 세그먼트 안에서 일치하며, `?`는 문자 하나에 일치합니다. 경로는 프로젝트 루트 기준이며 슬래시는 `/`를 사용합니다.

| 프레임워크 | `files` | `insertBefore` | `commentSyntax` |
|-----------|---------|----------------|-----------------|
| 단일 셸 SPA (Vite / React / 일반 HTML) | `["index.html"]` | `</body>` | `html` |
| Next.js (App Router) | `["app/layout.tsx"]` | `</body>` | `jsx` |
| Next.js (Pages) | `["pages/_document.tsx"]` | `</body>` | `jsx` |
| Nuxt | `["app.vue"]` | `</body>` | `html` |
| Svelte / SvelteKit | `["src/app.html"]` | `</body>` | `html` |
| TanStack Router (SPA, Vite) | `["index.html"]` | `</body>` | `html` |
| TanStack Start (SSR) | `["src/routes/__root.tsx"]` | `<Scripts` | `jsx` |
| Astro | `[" <root layout .astro>"]` | `</body>` | `html` |
| 멀티 페이지 (경로별 별도 HTML) | `["public/**/*.html"]` | 제공되는 디렉터리 glob | `html` |

모든 파일에 존재하는 기준점을 선택합니다 (`</body>`가 거의 항상 적합). `insertAfter`는 특정 줄 다음에 삽입할 때 씁니다. 멀티 페이지 사이트에서는 새 페이지도 자동으로 감지할 수 있도록 glob을 권장합니다. 생성기가 페이지를 다시 빌드하는 사이트에서는 다음 재생성까지 삽입이 유지됩니다. 빌드할 때마다 `impeccable live`를 다시 실행합니다 (accept는 영향을 받지 않으며 fallback 흐름에서 실제 소스 파일을 수정함).

**프레임워크 어댑터 (삽입 시 자동 감지).** 각 삽입 작업은 `.impeccable/live/inject-journal.json`에 변경 내용을 기록합니다. 다음 삽입 또는 제거 단계에서 helper가 충돌이나 잘못된 디렉터리에서 중지해 남긴 아티팩트를 복구합니다. SvelteKit, Nuxt, TanStack Start는 문서 셸을 서버 렌더링하므로 진입 템플릿의 일반 `<script>`가 안정적으로 실행되지 않습니다. `impeccable live-inject`가 이를 감지하고 전용 어댑터를 사용합니다 (SvelteKit: 개발 전용 `+layout.svelte` 루트 컴포넌트; Nuxt: 개발 전용 `.client.ts` 플러그인; TanStack Start: `__root`에 생성하는 개발 전용 `ImpeccableLiveRoot` 컴포넌트). `files` 값은 유효한 감지 / CSP 참고값으로 남지만 실제 삽입 위치와는 다릅니다. 일반 TanStack Router SPA는 기본 Vite 경로를 사용합니다.

## 설정 이탈

매번 부팅할 때 프로젝트의 일반 페이지 루트 (`public/`, `src/`, `app/`, `pages/`)에서 HTML 파일을 찾습니다. 확인된 `files` 목록이 포함하지 못하는 파일은 안내 문구와 함께 `configDrift.orphans`로 표시됩니다. 사용자에게 세션당 한 번만 누락된 파일을 알리고 파일을 추가하거나 `files`를 glob으로 바꾸도록 제안합니다. config를 자동 갱신하지 않습니다. 결정은 사용자가 합니다. 설정 이탈이 없으면 `configDrift`는 `null`입니다.

## CSP 감지 (최초 설정에서만)

아래의 모든 허용 설정은 수동 middleware 및 meta tag 편집을 포함해 **개발 환경에만 적용**합니다. 배포된 운영 사이트의 CSP를 변경해 localhost helper를 불러오지 않습니다. 운영 환경 검사 대안은 [live.md](live.md)를 참고합니다.

`config.cspChecked === true`면 이 절 전체를 건너뜁니다. 사용자에게 이미 한 번 질문한 상태입니다.

```bash
.agents/skills/impeccable/scripts/impeccable detect-csp
```

출력은 `{ shape, signals }`입니다. `shape`는 **패치 방식**을 뜻하므로 여러 프레임워크에 동일한 템플릿을 사용할 수 있습니다.

- **`null`**: CSP가 없음. `cspChecked: true`로 config를 저장하고 종료합니다.
- **`append-arrays`**: 지시문 배열로 구성한 CSP. 자동 패치 가능 (예: `additionalScriptSrc` / `additionalConnectSrc`가 있는 모노레포 helper, SvelteKit `kit.csp.directives`, Nuxt `nuxt-security`).
- **`append-string`**: 문자열 리터럴 값으로 지정된 CSP. 자동 패치 가능 (예: `headers()`를 인라인하는 `next.config.*`, Nuxt `routeRules`).
- **`middleware`** / **`meta-tag`**: 감지되지만 자동 패치하지 않음. 감지된 파일을 사용자에게 보여주고 `script-src`와 `connect-src`에 `http://localhost:8400`을 직접 추가해 달라고 요청한 뒤 `cspChecked: true`로 표시하고 진행합니다.

### 동의 요청 문구 (이 표현 사용)

> **CSP 패치가 필요합니다.** 프로젝트에서 `http://localhost:8400`을 차단하는 Content Security Policy를 감지했습니다. 허용 항목이 없으면 라이브 선택기가 로드되지 않습니다. 적용할 변경 사항:
>
> ```diff
> [file: <patchTarget>]
> [exact diff, 2-5 lines]
> ```
>
> `NODE_ENV === "development"` 조건으로 보호되므로 추가 항목은 개발 환경에서만 적용되고 운영 환경으로 전달되지 않습니다. 언제든 이 파일의 변경을 되돌려 제거할 수 있습니다. 적용할까요? [y/n]

“아니요”라고 답하면 패치를 건너뛰고 허용 항목을 직접 추가할 때까지 live가 작동하지 않는다고 알립니다. 질문을 한 기록이므로 `cspChecked: true`는 저장합니다. “예”라고 답하면 아래의 shape별 패치를 적용하고 `cspChecked: true`를 저장합니다.

### append-arrays

CSP 배열을 정의한 파일 상단에 선언한 다음 script-src 및 connect-src 배열에 `...__impeccableLiveDev`를 추가합니다.

```ts
// impeccable live 모드를 불러오기 위한 개발 전용 허용. NODE_ENV로 보호.
const __impeccableLiveDev =
  process.env.NODE_ENV === "development" ? ["http://localhost:8400"] : [];
```

프레임워크별 위치: Next.js + 모노레포 helper는 공용 helper가 아닌 *앱의* `next.config.*`를 수정해 `additionalScriptSrc` / `additionalConnectSrc`에 추가합니다. SvelteKit은 `svelte.config.js`의 `kit.csp.directives['script-src']`, `['connect-src']`를 수정합니다. Nuxt + nuxt-security는 `nuxt.config.*`의 `security.headers.contentSecurityPolicy['script-src']`, `['connect-src']`를 수정합니다. 참고 출력: [nextjs-turborepo/expected-after-patch.ts](https://github.com/pbakaus/impeccable/blob/8dac6ae7e020c43ab10ce9b41939f6fd42627b96/tests/framework-fixtures/nextjs-turborepo/expected-after-patch.ts), [sveltekit-csp/expected-after-patch.js](https://github.com/pbakaus/impeccable/blob/8dac6ae7e020c43ab10ce9b41939f6fd42627b96/tests/framework-fixtures/sveltekit-csp/expected-after-patch.js). 멱등성: 파일에 `__impeccableLiveDev`가 이미 있으면 패치가 적용된 상태이므로 `cspChecked: true`만 기록합니다.

### append-string

두 부분을 패치합니다: 개발 전용 문자열을 선언하고 두 지시문의 CSP 값에 보간합니다 (문자열을 깔끔하게 이어 붙이도록 앞 공백을 포함하며, 편집 시 리터럴을 템플릿 문자열로 변환).

```ts
// impeccable live 모드를 불러오기 위한 개발 전용 허용.
const __impeccableLiveDev =
  process.env.NODE_ENV === "development" ? " http://localhost:8400" : "";
```

- `script-src 'self' 'unsafe-inline'`은 템플릿 문자열 안에서 `__impeccableLiveDev`를 뒤에 보간하도록 바꿉니다.
- `connect-src 'self'`도 동일하게 템플릿 문자열로 바꾸고 `__impeccableLiveDev`를 보간합니다.

프레임워크별 위치: Next.js는 `next.config.*`의 인라인 `headers()`를, Nuxt는 `nuxt.config.*`의 `routeRules['/**'].headers['Content-Security-Policy']`를 수정합니다. 참고 출력: [nextjs-inline-csp/expected-after-patch.js](https://github.com/pbakaus/impeccable/blob/8dac6ae7e020c43ab10ce9b41939f6fd42627b96/tests/framework-fixtures/nextjs-inline-csp/expected-after-patch.js), [nuxt-csp/expected-after-patch.ts](https://github.com/pbakaus/impeccable/blob/8dac6ae7e020c43ab10ce9b41939f6fd42627b96/tests/framework-fixtures/nuxt-csp/expected-after-patch.ts).

## 문제 해결

사용자가 CSP 패치를 “아니요”로 거절한 뒤 live가 작동하지 않는다고 하면 개발 CSP가 `http://localhost:8400`을 차단하는 상태입니다. `.impeccable/live/config.json`에서 `cspChecked`를 지우고 `impeccable live`를 다시 실행해 설정 질문을 다시 표시합니다.

설정 후 `impeccable live`를 다시 실행합니다.
