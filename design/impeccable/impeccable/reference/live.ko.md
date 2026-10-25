대화형 라이브 변형 모드입니다. 브라우저에서 요소를 선택하고 디자인 동작을 고르면 개발 서버 HMR을 통해 AI가 만든 HTML+CSS 변형을 즉시 바꿔 보여줍니다.

## 사전 조건

HMR이 켜진 개발 서버 (Vite, Next.js, Bun 등)가 실행 중이거나 브라우저에서 정적 HTML 파일이 열려 있어야 합니다. 개발 서버 기본 포트가 사용 중이라면 앱이 이미 실행 중일 가능성이 높으므로 서버를 하나 더 띄우기 전에 기본 URL에 접속해 봅니다.

라이브 편집은 로컬 체크아웃이 필요합니다. 배포된 운영 사이트 (HTTPS 포함)에 스크립트를 주입하는 것은 지원하지 않습니다. 운영 사이트를 검사하려면 `.agents/skills/impeccable/scripts/impeccable detect <url>` 또는 브라우저 확장 프로그램을 사용합니다. 라이브 모드를 위해 브라우저 보안을 끄거나 운영 CSP를 약화하지 않습니다.

Codex: live helper 명령, 앱 개발 서버, 의존성을 설치하는 설정은 처음부터 `sandbox_permissions: "require_escalated"`로 실행합니다. 샌드박스가 localhost와 패키지 매니저 네트워크 접근을 차단하기 때문입니다.


## 계약 (한 번 읽기)

아래 순서를 지킵니다. 어떤 단계도 생략하거나 순서를 바꾸지 않습니다. 라이브 모드의 모든 도구 출력에는 `_instructions` 필드가 포함될 수 있습니다. 해당 상황에 맞는 다음 단계를 실제 id와 경로로 채운 권위 있는 지침이므로 이 문서의 기억과 충돌하면 `_instructions`를 우선합니다.

1. `impeccable live`: 부팅합니다. 요청에서 모노레포 안의 파일, 경로, 앱이 명시되거나 암시되면 구체적인 경로를 추론해 `.agents/skills/impeccable/scripts/impeccable live --target <path>`로 실행하고 반환된 `projectRoot`를 기준으로 라이브 세션의 나머지 작업을 진행합니다. 부팅은 개발 서버 설정 파일을 바탕으로 앱 루트를 확인하고 `.impeccable/live/roots.json`에 저장합니다. 모든 helper는 시작할 때 이 manifest를 기준으로 다시 설정되므로 잘못된 현재 작업 디렉터리가 세션 상태를 분리할 수 없습니다. PRODUCT.md / DESIGN.md는 Git 루트까지 상위 디렉터리에서 검색하고 `--file` 같은 상대 helper 인자는 앱 루트 기준으로 해석됩니다.
2. `pageFile`을 제공하는 앱 URL을 엽니다 (`package.json`, 문서, 터미널 출력, 열린 탭에서 추론). `serverPort`는 사용하지 않습니다. 이 포트는 앱이 아니라 helper용입니다. **Cursor:** poll을 실행하기 전에 `browser_navigate`로 해당 URL에 이동하며 이 단계를 생략하지 않습니다. **다른 하네스:** 사용 가능한 브라우저 도구를 사용하고 URL이 불확실하면 사용자에게 한 번 묻습니다.
3. 기본 긴 timeout (`600000` ms)을 사용해 poll 루프를 실행합니다. 이벤트나 `--reply` 직후 `impeccable live-poll`을 다시 실행합니다. Codex는 한 번 실행하는 poll을 foreground에서 실행합니다. 짧은 `--timeout=`은 전달하지 않습니다. 전역 바의 **Impeccable 마크**는 `/poll`을 poll 중인 대상이 없으면 깜박이는 호박색 점과 함께 어두워집니다. 연결을 복구하려면 `impeccable live-poll`을 다시 시작합니다.
4. `generate` 이벤트: `event.scaffold`가 있으면 재사용합니다. 스크린샷이 있으면 읽고, 해당 동작의 참조 문서를 불러 변형을 제공합니다. `--reply done` 후 다시 poll합니다. 이 스레드는 이미 프로젝트 토큰과 레이아웃을 알고 있으므로 여기서 생성합니다. 오버레이 미리보기는 검증 채널입니다. generate와 accept 사이에 스크린샷을 따거나 재렌더링하거나 변형 QA를 하지 않습니다. 작성할 때 craft-floor의 대비, 간격, 글자 크기 최저 기준을 반영하고 전체 검증은 accept 시 선택된 변형에 대해 한 번만 진행합니다.
5. `steer` 이벤트: 메시지와 `pageUrl`을 읽고 요청을 처리한 다음 `--reply steer_done`을 실행하고 다시 poll합니다. 수신 확인은 보내지 않습니다.
6. `accept` / `discard` 이벤트: poll 스크립트가 `impeccable live-accept`를 실행하고 결과를 확인한 뒤 `_completionAck`를 출력합니다. 일반 accept / discard는 즉시 완료됩니다. carbonize accept는 `impeccable live-complete --id EVENT_ID`를 실행할 때까지 복구 가능한 상태입니다. 다시 poll하기 전에 정리를 마칩니다.
7. 중단된 경우 추측하지 말고 `impeccable live-status` 또는 `impeccable live-resume`을 실행합니다. `.impeccable/live/sessions/`의 journal이 기준 원본이며 helper 재시작 뒤 확인되지 않은 작업을 재생합니다. 페이지를 다시 열면 삽입된 `live.js`가 다시 연결됩니다. `impeccable live-resume`에서 활성 세션이 없다고 보고한 경우에만 직접 편집 루프로 전환합니다. 연결이 자주 끊긴다고 해서 전환하지 않습니다.
8. `exit` 이벤트: 아래 정리 절차를 실행합니다.

하네스 정책:
- **Claude Code**: 짧은 timeout 없이 poll을 **백그라운드 작업**으로 실행합니다. 하네스가 완료 시 알립니다. 셸을 막지 않습니다.
- **Cursor**: `"type":"(steer|generate|accept|discard|manual_edit_apply|variant_mount_failed|prefetch|exit)"` 이벤트를 알리도록 설정하고 **일회성 poll을 백그라운드 터미널**에서 실행합니다. 이벤트를 처리하고 `--reply`한 뒤 poll을 재시작합니다. Cursor에서는 `--stream`을 쓰지 않습니다 (실측으로 일회성 poll은 1초 미만, stream은 약 5초 지연).
- **Codex**: 기본 일회성 poll을 **yield되는 foreground exec 세션**에서 실행합니다. `&` 금지, `--stream` 금지, 활성 foreground poll 없이 Live를 떠나지 않습니다. poll을 시작한 것만으로 충분하지 않습니다. 이벤트가 반환될 때까지 exec 세션을 계속 읽어 서비스를 처리합니다. “사용자를 기다리는 중”이라고 말하고 멈추지 않습니다. 아무도 읽지 않는 yield poll은 죽은 세션이며 사용자의 Go 입력은 응답받지 못합니다.
- **다른 하네스**: 셸 종료 시 stdout이 안정적으로 반환된다는 것을 알고 있지 않다면 foreground에서 일회성 poll을 실행합니다.

전달 정책: 모든 환경에서 결과를 한 번의 원자적 편집으로 전달합니다. poll 루프가 추가 호출을 막지 않는다고 확인된 경우가 아니라면 점진적으로 게시하도록 하네스를 전환하지 않습니다.

채팅은 부수 작업입니다. 요약, 튜토리얼, PRODUCT / DESIGN 본문 붙여넣기를 하지 않습니다. 토큰은 도구와 편집에 사용하고 실패가 있으면 한두 문장으로 간단히 알립니다.

## Poll 루프

```
LOOP:
  .agents/skills/impeccable/scripts/impeccable live-poll   # 기본 긴 timeout 사용; --timeout= 지정하지 않음
  JSON을 읽고 "type"에 따라 처리

  "generate"  → Generate 처리, done 응답, 루프
  "steer"     → Steer 처리, steer_done 응답, 루프
  "accept"    → Accept 처리, carbonize 정리가 필요하면 완료한 뒤 루프
  "discard"   → Discard 처리, 루프
  "prefetch"  → Prefetch 처리, 루프
  "manual_edit_apply" → Manual Edit Apply 처리, done|partial|error 응답, 루프
  "variant_mount_failed" → 변형 파일 수정, done --file <path> 응답, 루프
  "timeout"   → 루프
  "exit"      → 빠져나간 뒤 정리
```

`variant_mount_failed`는 브라우저가 게시된 결과 (`variant`, 모듈 `url`, `error`)를 렌더링할 수 없다는 뜻입니다. 사용자는 변형 대신 지속적으로 표시되는 오류 카드를 봅니다. 변형 파일을 수정한 뒤 `--reply EVENT_ID done --file <manifest or source path>`를 실행합니다. 브라우저가 자동으로 다시 시도합니다.

**Stream 모드** (`--stream`, 실험적이며 Cursor에서는 사용 금지): 프로세스 하나를 오래 실행하고 이벤트마다 JSON 한 줄을 출력합니다. 별도 명령으로 `--reply`합니다. 하네스가 stdout의 점진 출력에 안정적으로 대응하는 경우에만 사용합니다.

## 시작

```bash
.agents/skills/impeccable/scripts/impeccable live
```

출력 JSON: `{ ok, serverPort, serverToken, pageFiles, roots, hasProduct, product, productPath, hasDesign, design, designPath, hasSurfaceBrief, surfaceBrief }`. `roots`는 확인된 루트 manifest이며 `projectRoot`는 `roots.appRoot`와 같습니다. surface brief도 같이 반환되므로 `impeccable surface-brief`를 별도로 호출하지 않습니다. 생성 시 우선순위: **시각 결정은 DESIGN.md 우선, 지속적인 제품 / 어조 결정은 PRODUCT.md 우선, 현재 표면 전략은 surface brief 우선.** DESIGN.md가 없어도 아이덴티티가 없는 것은 아닙니다. CSS 변수, 계산된 스타일, 인접 컴포넌트에서 추출합니다 (Step 4 Phase A). 아이덴티티를 보존하는 것이 기본이며, 벗어나려면 사용자가 리디자인 의도를 명시해야 합니다.

`serverPort` / `serverToken`은 작은 helper HTTP 서버 (`/live.js`, SSE, `/poll`)용입니다. 개발 서버의 포트가 아닙니다. 페이지 URL은 `pageFiles` 항목을 제공하는 origin입니다.

출력이 `{ ok: false, error: "config_missing" | "config_invalid", path }`이면 프로젝트의 일회성 설정이 필요합니다. [live-setup.md](live-setup.md)를 읽고 안내를 따릅니다. 출력에 null이 아닌 `configDrift`가 있으면 포함되지 않은 HTML 파일을 사용자에게 한 번 알리고 파일 추가나 `files`를 glob으로 변경하는 방법을 제안합니다. config를 자동 수정하지 않습니다.

## 복구 명령

추가 전용 journal인 `.impeccable/live/sessions/`가 정식 영구 상태입니다 (프로젝트 소스 아님). 채팅이 중단되었거나 poll 이벤트를 놓쳤거나 helper가 재시작되었거나 브라우저가 다시 로드된 경우:

```bash
.agents/skills/impeccable/scripts/impeccable live-status      # helper 상태, 활성 세션, 대기 이벤트; helper가 꺼져 있어도 동작
.agents/skills/impeccable/scripts/impeccable live-resume --id SESSION_ID   # 활성 snapshot, 대기 이벤트, 다음 안전 동작
.agents/skills/impeccable/scripts/impeccable live-complete --id SESSION_ID # 검증된 정리 후 기준 수동 최종 확인
```

서버 재시작 규칙: `impeccable live-server`를 다시 시작한 뒤 poll합니다. 시작 시 확인되지 않은 이벤트를 다시 큐에 넣으므로 `impeccable live-resume`에서 활성 세션이 없다고 확인되지 않는 한 사용자에게 Go를 다시 누르라고 하지 않습니다.



## Generate 이벤트 처리

**교체 모드** (기본): `{id, action, freeformPrompt?, count, pageUrl, element, screenshotPath?, comments?, strokes?}`.

**삽입 모드** (`event.mode === "insert"`): `{id, mode: "insert", count, pageUrl, insert: { position, anchor }, placeholder: { width, height }, freeformPrompt?, screenshotPath?, comments?, strokes?}`. 이 모드에는 `action`이 없습니다. 비어 있지 않은 `freeformPrompt` 또는 주석이 있어야 합니다. `placeholder`는 대략적인 크기 힌트입니다.

속도가 중요합니다. 사용자는 선택한 요소를 보고 있습니다. 사전 확인에서 얻은 메타데이터를 재사용하고 탐색 호출을 최소화합니다.

### 삽입 모드 분기

1. 스크린샷이 있으면 읽습니다 (주석이 있는 경우에만).
2. `event.scaffold`가 있으면 재사용하고 helper를 다시 실행하지 않습니다. 없다면:

```bash
.agents/skills/impeccable/scripts/impeccable live-insert --id EVENT_ID --count EVENT_COUNT --position after \
  --element-id "ANCHOR_ID" --classes "class1,class2" --tag "section" --text "ANCHOR_TEXT"
```

`--position`은 `event.insert.position`을 사용합니다. anchor 플래그는 wrap과 동일하게 대응합니다. scaffold에는 `data-impeccable-variant="original"`이 없습니다. `insertLine` 위치에 새 HTML+CSS로 만든 변형을 추가합니다. source-preview 대상에서 scaffold가 `sourceWritten: false`와 `wrapperBlock`, `replaceEndLine < replaceStartLine` (삽입을 의미)를 반환하면 wrap 절에서 설명하는 것처럼 `wrapperBlock`의 marker 위치에 변형을 끼워 넣고 `replaceStartLine` 위치에 단일 편집으로 삽입합니다. 서로 나눠 쓰면 변형 코드가 반영되기 전에 프레임워크가 다시 로드되어 브라우저가 0/N 상태에 멈춥니다. 표면을 기준으로 방문자 모드를 정하고 새 마크업을 작성하기 전에 [craft-floor.md](craft-floor.md)를 읽습니다. Svelte 대상은 아래 wrap과 같은 컴포넌트 흐름을 따릅니다 (manifest의 `mode: "insert"`): 각 변형은 `componentDir` 안의 실제 단일 루트 컴포넌트이며 `data-impeccable-*` 속성이 없습니다. 생성 중에는 route를 수정하지 않습니다. accept는 선택한 마크업을 `sourceFile`에 기계적으로 삽입합니다. Svelte가 아닌 대상에서는 accept / discard가 wrapper를 제거하며 anchor는 그대로 둡니다.

### 교체 모드 (기본)

### 1. 스크린샷 읽기 (있는 경우)

`event.screenshotPath`는 **사용자가 Go 전에 주석을 남긴 경우에만** 전달됩니다. 주석이 반영된 요소 캡처 PNG입니다. 계획 전에 읽습니다. 없으면 요청하지 말고 직접 페이지를 캡처하지도 않습니다. 주석 없는 스크린샷은 기존 디자인에 고착되어 서로 뚜렷이 다른 세 방향을 만드는 brief와 충돌합니다. `element.outerHTML`, 계산된 스타일, 프롬프트를 기준으로 작업합니다.

주석 해석: comment의 `{x, y}`는 요소 내부 좌표이며 해당 점 아래의 자식에 붙습니다 (제목 근처 주석은 제목에 관한 것). 명확히 짝지어진 경우가 아니면 comment와 stroke는 독립적입니다. stroke는 모양에 따라 읽습니다: 닫힌 원은 “이것” (강조이지 클리핑 영역 아님), 화살표는 방향 또는 움직임, 교차선 / 슬래시는 삭제, 낙서는 맥락에 따라 강조 또는 삭제를 뜻합니다. stroke의 의도가 정말 모호하고 brief에 영향을 줄 때만 생성 전에 짧은 질문을 한 번 합니다. 그 외에는 해석을 한 문장으로 밝힙니다.

### 2. 요소 감싸기

`event.scaffold`가 있으면 helper가 소스를 찾고 wrapper를 계산했으므로 성공 결과로 간주하고 명령을 생략합니다. `event.scaffoldAttempted`가 있고 `scaffoldError`가 있으면 사전 처리를 마치지 못한 경우이므로 아래 명령을 실행합니다.

**source-preview 대상의 `event.scaffold`에는 `sourceWritten: false`가 포함됩니다.** helper는 wrapper를 쓰지 않았고 `scaffold.wrapperBlock`과 선택 요소의 소스 범위 (`replaceStartLine`, `replaceEndLine`, 1-based)를 돌려줍니다. 한 번의 편집으로 wrapper **및** 모든 변형을 씁니다: `wrapperBlock`의 “Variants: insert below this line” marker에 변형을 끼운 뒤 해당 결과로 `[replaceStartLine, replaceEndLine]`을 교체합니다. scaffold를 별도 편집으로 먼저 쓰면 변형 편집이 도착하기 전에 프레임워크가 다시 로드되어 브라우저가 0/N 상태에 멈춥니다. (`replaceEndLine < replaceStartLine`이면 삭제 없이 삽입하는 모드.) `svelte-component` 경로에는 `sourceWritten`이 설정되지 않습니다.

```bash
.agents/skills/impeccable/scripts/impeccable live-wrap --id EVENT_ID --count EVENT_COUNT --element-id "ELEMENT_ID" --classes "class1,class2" --tag "div" --text "TEXT_SNIPPET"
```

플래그 대응 (분리해서 유지하고 `--query`로 합치지 않음): `--element-id` ← `event.element.id`; `--classes` ← 쉼표로 연결한 classes; `--tag` ← tagName; `--text` ← textContent의 앞 약 80자. **모든 호출에 포함**합니다. 반복되는 형제 컴포넌트를 구분하지 않으면 wrap은 첫 번째 일치 항목을 선택합니다. `event.pageUrl`이 파일을 가리키면 `--file PATH`를 전달합니다. `--text`를 써도 여러 후보가 일치하면 wrap은 `{ error: "element_ambiguous", candidates, fallback: "agent-driven" }`를 반환하고 종료합니다. 페이지 맥락에서 올바른 범위를 선택해 fallback 흐름에 따라 wrapper를 직접 작성합니다.

성공 출력: `{ file, insertLine, commentSyntax, styleMode, styleTag, cssSelectorPrefixExamples, cssAuthoring }` (source-preview 대상은 위의 `sourceWritten: false` 필드도 포함). 미리보기 CSS 작성 방식은 `styleMode`가 결정합니다. 추측이 아니라 감지된 기능 모드로 다룹니다: `scoped`는 `@scope ([data-impeccable-variant="N"])` 규칙을 뜻하고, `astro-global-prefixed`는 반환된 정확한 `styleTag`와 함께 `[data-impeccable-variant="N"]` 접두어를 명시하는 방식입니다. 현재 파일의 기준으로 `cssAuthoring`을 사용합니다 (styleTag, 선택자 전략, 필수 사항, 금지 패턴). 이 정보가 지시하지 않는 한 프레임워크별 예외를 적용하지 않습니다.

Svelte / SvelteKit 대상에서 `impeccable live-wrap`은 `previewMode: "svelte-component"`를 반환합니다. 이때 `file`은 임시 `node_modules/.impeccable-live/<id>/manifest.json`, `componentDir`은 변형 컴포넌트 디렉터리, `sourceFile`은 실제 route입니다. scaffold는 AST 기반입니다: 제어 흐름 블록 (`{#each}`, `{#if}`)을 보존하고 자유 변수를 쓰는 each 컬렉션은 계약을 통해 구조화된 prop 하나 (`kind: "collection"`)로 전달합니다. payload에는 stub에 이미 기록된 (`componentStubMarkup`) prop 대체 마크업이 들어 있으므로 manifest나 stub을 다시 읽지 않습니다. `v1.svelte`, `v2.svelte` 등을 제자리에서 편집하고 삭제 후 재생성하지 않습니다. stub의 제어 흐름과 `propContract` prop 이름을 유지하고 반복문을 항목별 리터럴로 펼치지 않습니다. stub `<style>`에는 현재 선택을 꾸미는 원본 규칙이 들어 있습니다. 자유롭게 재스타일하거나 삭제할 수 있습니다. accept 때 변형이 재선언하지 않은 seed 규칙은 원본에서 제거됩니다 (미리보기에는 적용되지 않았으므로 사용자는 해당 규칙 없는 디자인을 승인한 것). 의미 있는 class 선택자를 사용하고 `@scope`와 `data-impeccable-*`는 쓰지 않습니다. manifest 경로를 `--file`로 지정해 응답합니다. 브라우저는 컴파일된 컴포넌트를 mount하므로 Svelte HMR이 페이지 상태를 초기화하지 않습니다. accept는 선택한 컴포넌트를 기계적으로 합칩니다 (마크업은 route 표현식으로 복원, CSS 조정, 파라미터 적용, 들여쓰기 보존). 이 경로에서는 accept 후 별도 정리를 하지 않습니다. 분리 미리보기에서 지원할 수 없는 구성 (컴포넌트 태그, `bind:` / `use:`, await 블록, 인라인 스크립트, spread 속성)이 선택 범위에 있으면 wrap은 `previewFallback: { from: "svelte-component", reason }`을 포함한 일반 source-preview wrapper를 반환합니다. 반환 형태를 그대로 따릅니다.

**컴포넌트 미리보기 경로의 파라미터는 속성이 아니라 sidecar에 둡니다** (`componentDir/params.json`에서 variant 번호를 키로 사용하고 아래 7절의 동일 스키마 적용; wrap 절 참고). Svelte는 속성 값 안의 `{`를 표현식으로 파싱하기 때문입니다. `range` / `toggle`에는 `var(--p-<id>, default)`를, `steps`에는 `[data-p-<id>="…"]`를 사용해 컴포넌트 `<style>`을 작성합니다. 값은 mount된 루트에 전달될 수 있도록 `:global(...)`로 감쌉니다.

```json
{ "1": [ {"id":"density","kind":"steps","default":"snug","label":"Density","options":[
    {"value":"airy","label":"Airy"},{"value":"snug","label":"Snug"} ]} ] }
```

**Fallback 오류.** wrap은 비소스 파일 (생성 파일, 추적되지 않는 파일)에 쓰기를 거부합니다. 여기에 accept하면 데이터가 조용히 손실될 수 있습니다. 세 오류 모두 `fallback: "agent-driven"`을 포함합니다 (**Fallback 처리** 참고): `file_is_generated` (`--file`이 생성 파일을 가리킴), `element_not_in_source`에 `generatedMatch` 포함 (생성 결과물에만 요소가 있음), `element_not_found` (런타임 삽입 요소일 가능성이 높음).



### 3. 동작 참조 불러오기

event.action이 impeccable (freeform)이면 Skill의 디자인 규칙과 [craft-floor.md](craft-floor.md)를 적용합니다. 표면을 기준으로 방문자 모드를 정하고 하위 명령 참조는 불러오지 않습니다. Freeform이라고 해서 파라미터를 생략해도 되는 것은 아닙니다. 7절의 예산과 freeform 우선 규칙을 따릅니다. 그 외 동작 (bolder, quieter, distill, polish, typeset, colorize, layout, adapt, animate, delight, overdrive)은 계획 전에 reference/<action>.md를 읽습니다. 해당 참조의 MUST 파라미터는 7절 예산 위에 추가로 적용됩니다.

### 4. 변형 3개 계획: 아이덴티티 먼저, 모드 다음, 축 선택

Live는 기존 표면에서 실행되며 브랜드는 이미 정해져 있습니다. 할 일은 **아이덴티티 안에서 변주**하는 것이지 아이덴티티를 고르는 일이 아닙니다. 가장 나쁜 실패는 브랜드에 맞지 않아 사용자가 하나도 선택할 수 없는 변형 세 개입니다. 아래 네 단계를 순서대로 진행합니다.

#### Phase A: 아이덴티티 추출 (생략 불가)

우선순위에 따라 참조합니다: DESIGN.md의 시각 시스템 필드; CSS 사용자 지정 속성 (실제 사용 중인 토큰); 선택 요소와 부모의 계산된 스타일; 인접 컴포넌트의 시각적 수사. 현재 화면을 설명하는 문장 **하나**를 작성합니다: 주요 배경과 강조색 (실제 값, “따뜻함”처럼 쓰지 않음), 로드된 글꼴 조합, 레이아웃 구성 (세로 / 나란히 / 격자 / 비대칭 / 오버레이), 표면 처리 (모서리, 테두리, 그림자, 장식 밀도), 문구에서 읽히는 어조. 구체적으로 기록하고 근거가 없는 축은 생략합니다. 미학 계열 이름은 붙이지 않습니다 (그것은 데이터가 아니라 결론임). 이 문장이 **아이덴티티 고정점**입니다. 나란히 비교했을 때 모든 변형이 같은 브랜드처럼 보여야 합니다. DESIGN.md가 없다는 이유로 이 단계를 건너뛰지 않습니다.

#### Phase B: 모드 선택 (기본 또는 이탈)

**기본 모드**는 아이덴티티를 보존하면서 그 안에서 표현을 변주하며 세션의 약 90%에 적합합니다. **이탈 모드**는 아이덴티티를 거부합니다. 현재 요청이나 프롬프트에서 사용자가 명시적으로 요청한 경우에만 사용합니다 (“이걸 리디자인해”, “처음부터 다시 만들어”, “완전히 다른 방향”). 오래된 critique나 이전 메모는 권한을 주지 않습니다. 불확실하면 기본 모드를 선택합니다. 잘못된 기본 선택은 “비슷한 느낌의 브랜드 내 변형 세 개”여서 복구할 수 있지만, 잘못된 이탈은 브랜드와 어긋난 변형 세 개가 되어 되돌릴 수 없습니다.

#### Phase C: 변형 세 개 계획

**기본 모드.** 각 변형은 Phase A의 아이덴티티 문장을 보존하며 서로 다른 **주요 축**에 집중합니다. 축 여섯 가지: 1 **위계** (어떤 요소가 시선을 주도하는가), 2 **레이아웃 구성** (세로 / 나란히 / 격자 / 비대칭 / 오버레이), 3 **타이포그래피 체계** (조합 논리, 크기 비율, 대소문자 / 굵기, *사용 가능한 글꼴 안에서*), 4 **색상 전략** (기존 팔레트 역할 중 어느 색이 표면을 담당하는가: Restrained / Committed / Full palette / Drenched; 기존 토큰만 사용), 5 **밀도** (미니멀 / 적당 / 조밀), 6 **구조 분해** (합치기, 나누기, 점진적 공개). 변형 세 개는 서로 다른 축 세 개를 택합니다. 같은 브랜드를 세 시점에서 바라봅니다. 새 글꼴, 새 색조, 새 미학 계열 신호는 이탈 모드에서만 사용합니다.

**이탈 모드.** 각 변형은 브랜드에서 도출한 서로 다른 미학적 방향에 기반하며 고정 카탈로그를 사용하지 않습니다. PRODUCT.md의 Brand Personality 단어를 읽고 물리적, 공간적, 재질적 경험으로 구체화한 뒤 현재 표면과도 서로 간에도 확실히 다른 세 방향을 도출합니다. 인접 제품에도 그대로 들어맞을 근거라면 반사적인 선택으로 판단하고 제외합니다. 각 방향은 실제 세계의 대상을 지정하는 구체적인 한 문장이어야 합니다 (“깔끔하고 미니멀”이 아니라 “박물관 전시 라벨 체계”).

**두 모드 모두 계획 시 변형별 조절 파라미터를 2~3개씩 정합니다** (7절 예산 참고). 파라미터는 디자인의 일부입니다. 나중에 덧붙이는 것보다 계획 중 “무엇을 조절할 수 있는지” 정하는 편이 낫습니다.

#### Phase D: Squint test

**기본 모드:** 각 변형을 Phase A 고정점과 비교합니다. 팔레트, 타이포그래피 어조, 시각적 수사가 벗어나면 실수로 이탈 모드에 들어간 것이므로 다시 만듭니다. 이어서 세 가지 주요 축이 서로 다른지 확인합니다. “밀도 낮추기” 변형 세 개는 실패입니다. **이탈 모드:** 두 차례 확인합니다. 우선 미학 계열, 다음은 문장입니다. 계열 검사 (필수): 각 변형에 직접 정한 구체적 계열 이름을 붙입니다. 같은 이름이거나 서로 바꿔 쓸 수 있다면 다시 만듭니다. 문장 검사: 한 줄로 쓴 세 방향을 나란히 비교합니다. 두 개가 비슷하게 들리면 다시 만듭니다. 주요 축이 색상이나 테마인 경우 세 변형은 테마와 주색을 공유하면 안 됩니다. 색조만 바꾸지 말고 색상 세계를 세 개 만듭니다.

**동작별 호출**은 해당 동작의 차원을 중심으로 변주해야 합니다. 기본 모드에서는 사용 가능한 글꼴과 기존 토큰 안에서만 변주합니다.

- bolder: 변형마다 다른 차원을 증폭 (크기 / 채도 / 구조 변경).
- quieter: 변형마다 다른 차원을 줄임 (색상 / 장식 / 간격).
- distill: 과잉 요소를 서로 다르게 제거 (시각 잡음 / 중복 콘텐츠 / 중첩 구조).
- polish: 서로 다른 정교화 축 (리듬 / 위계 / 세부 표현).
- typeset: 이탈 모드에서는 각 변형의 글꼴 조합과 크기 비율을 모두 다르게 함. 기본 모드에서는 글꼴을 유지하고 크기 비율, 대소문자, 굵기를 각각 달리함.
- colorize: 이탈 모드에서는 각 변형에 다른 색조 계열을 적용하고 채도와 대비 전략도 다르게 함. 기본 모드에서는 표면을 담당하는 기존 팔레트 역할 (Restrained / Committed / Full palette / Drenched)을 변형마다 달리하고 서로 다른 대비 전략을 사용.
- layout: 간격만 조정하지 말고 구조 자체를 다르게 배치.
- adapt: 변형마다 다른 대상 맥락 적용 (모바일 우선 / 태블릿 / 데스크톱 / 인쇄 또는 저데이터).
- animate: 서로 다른 모션 문법 (계단식 순차 / clip wipe / 확대 후 초점 / morph / parallax).
- delight: 성격을 드러내는 방식을 다르게 (미세 상호작용 / 타이포그래피 놀라움 / 일러스트 장식 / 사운드나 햅틱 / 이스터에그).
- overdrive: 깨뜨릴 관례를 다르게 선택 (크기 / 구조 / 움직임 / 입력 방식 / 상태 전환). “제안하고 묻기” 단계를 건너뜁니다. live는 상호작용하지 않습니다.

### 5. Freeform 프롬프트 적용 (있는 경우)

event.freeformPrompt는 방향을 정하는 사용자의 최우선 지침입니다. Phase B 모드 범위 안에서 해석을 다양화하되 모든 변형에 반영합니다. 기본 모드에서는 프롬프트가 축을 좁히지만 아이덴티티는 유지합니다 (“자신감 있게” → 위계를 키움, 강조색에 더 집중, 밀도를 높임). 이탈 모드에서는 프롬프트가 계열 자체가 아니라 가능한 방향을 좁힙니다 (“신문 1면” → 브로드시트 / 타블로이드 / 전문지). 그런 다음 계열 검사를 실행합니다. 프롬프트가 구속력 있는 브랜드 약속이나 DESIGN.md 불변 조건과 충돌하면 사용자가 해당 규칙을 명시적으로 철회하지 않는 한 불변 조건을 유지합니다.



### 6. 변형 전달

CSS만 패치하지 말고 원래 요소 전체를 대체하는 완전한 HTML을 제공합니다. 미리보기 CSS는 wrapper 내부 style 태그에 둡니다. **기본 전달 방식은 원자적 편집**입니다. CSS + 모든 변형 + 파라미터 manifest를 insertLine에서 한 번에 편집합니다.

```html
<!-- Variants: insert below this line -->
<style data-impeccable-css="SESSION_ID">
  /* cssAuthoring.rulePattern과 일치하는 규칙 */
</style>
<div data-impeccable-variant="1">
  <!-- 변형 1: 요소 전체 대체 (최상위 요소 하나) -->
</div>
<div data-impeccable-variant="2" style="display: none">
  <!-- 변형 2 -->
</div>
<div data-impeccable-variant="3" style="display: none">
  <!-- 변형 3 -->
</div>
```

도구가 다른 값을 반환하면 style 시작 태그를 cssAuthoring.styleTag로 바꿉니다. 각 변형 div에는 최상위 요소 하나만 둡니다. 원본과 같은 태그를 사용합니다. 형제 요소가 따로 있으면 outline 추적이 깨지고 accept가 실패합니다. 첫 번째 변형만 보이게 하고 나머지는 display: none으로 둡니다. 브라우저의 MutationObserver는 원자적 도착과 점진적 도착을 모두 허용합니다. 도착한 변형을 accept하면 worker가 잠기므로 이후 게시 요청은 거부됩니다.

styleMode가 scoped인 경우 모든 :scope 규칙에 자손 결합자를 사용합니다. @scope 경계는 변형 wrapper div이며 요소 자체가 아니므로 :scope { ... }만 쓰면 display: contents인 wrapper에는 스타일이 적용되지 않습니다. 반드시 한 단계 안으로 들어갑니다 (:scope > .card, :scope .hero-title). [저장소 agent 템플릿](https://github.com/pbakaus/impeccable/blob/8dac6ae7e020c43ab10ce9b41939f6fd42627b96/tests/live-e2e/agent.mjs)의 mock test agent CSS를 실제 참고 예시로 삼을 수 있습니다.

**JSX / TSX 대상:** style 내용은 템플릿 리터럴로 감쌉니다 (CSS 중괄호가 JSX로 파싱되기 때문). className= / style={{…}}를 사용하고 data-impeccable-* 속성은 일반 문자열로 둡니다.

```tsx
<style data-impeccable-css="SESSION_ID">{`
  @scope ([data-impeccable-variant="1"]) { ... }
`}</style>
<div data-impeccable-variant="2" style={{ display: 'none' }}>
  {/* 변형 2 */}
</div>
```

wrap 스크립트는 marker 주석을 안에 넣은 단일 루트 JSX wrapper를 제공합니다. marker 자리에 블록을 넣으면 유효한 TSX 소스가 유지됩니다.

### 7. 파라미터 (변형마다 구성 수준 파라미터 0–4개)

각 변형에는 **거친 조절값**을 노출할 수 있습니다. 브라우저는 파라미터별 컨트롤을 배치하며 재생성 비용은 없습니다 (컨트롤은 범위에 따라 CSS 변수나 data 속성을 조정하고, 해당 속성을 기준으로 scoped CSS를 작성). 사용자가 재생성하지 않고 “조금 더 촘촘하게” 또는 “강조색을 약간 더”라고 말할 법한 축은 파라미터화합니다. 미세한 margin이나 일회성 조정은 파라미터가 아닙니다. Freeform 우선 원칙: 축은 직접 선택하므로 조절 항목도 제공합니다. 파라미터가 하나도 없는 hero는 거의 항상 부족하고, 진정 고정적인 디자인이 아니라면 하나는 미흡합니다.

예산은 요소의 시각적 무게에 따라 달라집니다 (DOM 깊이가 아니라 시각적 자식 수를 셈).

- **잎 / 아주 작음** (버튼, 아이콘, 기본 제목): **파라미터 0개**.
- **작은 구성** (간단한 카드, 라벨 입력란, 시각적 자식 약 5개 이하): **0–1개**.
- **중간 구성** (섹션, nav 묶음, 자식 6–15개): **목표 2개**, 단순하면 1개.
- **큰 구성** (hero, 전체 영역, 자식 16개 이상 또는 하위 섹션): **목표 2–3개, 서로 독립된 축을 CSS로 모두 작성하는 경우 최대 4개**.

**절대 상한은 변형당 4개**입니다. 이름이 지정된 하위 명령은 표현 가능한 경우 해당 참조의 MUST 파라미터를 반드시 포함합니다. 상한을 지키고 중복된 컨트롤은 두지 않습니다.

**HTML / JSX 경로 선언**: wrapper 속성으로 설정합니다 (컴포넌트 미리보기 경로에서는 대신 componentDir/params.json에 변형 번호를 키로 저장하며 같은 스키마를 사용. wrap 절 참고).

```html
<div data-impeccable-variant="1" data-impeccable-params='[
  {"id":"color-amount","kind":"range","min":0,"max":1,"step":0.05,"default":0.5,"label":"Color amount"},
  {"id":"serif","kind":"toggle","default":false,"label":"Serif display"}
]'>
```

세 가지 종류: range (슬라이더; --p-<id>를 조절. var(--p-color-amount, 0.5)를 사용해 작성. min/max/step/default/label 필드 필요), steps (세그먼트형 라디오; data-p-<id> 변경. :scope[data-p-density="airy"] .grid { ... } 형태로 작성. options/default/label 필드 필요), toggle (--p-<id>: 0|1과 속성 유무를 모두 조정. default/label 필요). 변형을 바꿀 때 값이 초기화되는 것은 알려진 한계입니다. 각 변형은 선언된 기본값으로 시작합니다.

**accept 시** 브라우저는 현재 값을 보내고 sibling 주석으로 기록합니다: <!-- impeccable-param-values SESSION_ID: {"color-amount":0.7} -->. Carbonize 정리 단계에서 해당 값을 고정합니다. 일치하는 steps / toggle 분기만 남기고 나머지를 삭제하며 :scope[data-p-…]를 의미 있는 규칙으로 축약합니다. range는 실제 숫자로 대체하거나 변수의 기본값을 갱신합니다.

### 8. 완료 알림

```bash
.agents/skills/impeccable/scripts/impeccable live-poll --reply EVENT_ID done --file RELATIVE_PATH
```

RELATIVE_PATH는 프로젝트 루트 상대 경로입니다. 개발 서버에 HMR이 없으면 브라우저가 소스를 직접 가져옵니다. 그다음 바로 다시 poll합니다.

### 진행 중 세션 중단

브라우저가 GENERATING으로 바뀐 뒤 wrap이나 생성에 실패하면 브라우저에 알려 진행 표시줄을 초기화합니다: .agents/skills/impeccable/scripts/impeccable live-poll --reply EVENT_ID error "Short reason". 이를 위해 live-accept --discard를 사용하지 않습니다 (파일만 바꾸고 브라우저에는 전달하지 않아 표시줄에 점이 계속 남음). --discard는 브라우저가 직접 요청한 discard에 대해 소스 정리만 할 때 씁니다.



## Fallback 처리

wrap이 fallback: "agent-driven"을 반환하면 직접 소스 파일을 선택합니다. 목표는 바뀌지 않습니다: 지금 미리보기 변형 세 개를 보여주고, accept된 변형은 다음 빌드가 지우지 않는 위치에 저장합니다.

1. 오류 payload에서 실제 요소가 있는 곳을 찾습니다: element_not_in_source + generatedMatch는 제공되는 HTML이 생성된 것이므로 generator의 템플릿이나 partial을 찾습니다. element_not_found는 런타임 삽입 요소이므로 렌더링 컴포넌트나 데이터 출처를 찾습니다. file_is_generated도 같은 방식으로 해결합니다. 시각적 변경만 필요한 경우 공유 스타일시트에 넣는 편이 적합할 수 있습니다.
2. **제공 파일에서 미리보기 구성**: 브라우저가 실제 불러온 파일에 impeccable live-wrap이 만드는 것과 같은 wrapper scaffold를 직접 작성하고, 요소 자체를 original slot으로 옮깁니다:
   <!-- impeccable-variants-start ID --><div data-impeccable-variants="ID" data-impeccable-variant-count="3" style="display: contents"><div data-impeccable-variant="original">THE ELEMENT, UNCHANGED</div><!-- Variants: insert below this line --></div><!-- impeccable-variants-end ID -->
   marker 뒤에 변형 div를 넣고 --reply EVENT_ID done --file <served file>로 응답합니다. original slot을 삭제하지 않습니다. discard가 해당 슬롯에서 원본 요소를 복구하며 슬롯이 없으면 거부합니다. 이 편집은 임시입니다. 재생성 시 지워져도 괜찮습니다.
3. **accept 시 실제 소스에 기록** (accept는 생성 파일을 거부하므로 이 경로에서 _acceptResult.handled는 보통 false): 구조 변경은 템플릿 / 컴포넌트 소스로, 시각 전용 변경은 적절한 스타일시트로, 데이터에서 렌더링되는 내용은 데이터 소스나 렌더 로직으로 반영합니다. 그런 다음 제공 파일에서 임시 wrapper를 제거합니다.
4. **discard 시** 임시 wrapper만 제거합니다.

## accept 처리

이벤트: {id, variantId, _acceptResult, _completionAck}. poll 스크립트가 이미 결정론적으로 impeccable live-accept를 실행하고 결과를 확인했습니다. 브라우저 DOM도 갱신되었습니다.

- accept 이벤트에는 pageUrl이 있습니다. poll 스크립트는 impeccable live-accept --page-url PAGE_URL로 전달해 현재 페이지의 staged copy 편집만 accept 시 정리해야 합니다.
- _completionAck.ok !== true: 아직 poll하지 않습니다. impeccable live-status / impeccable live-resume을 실행하고 필요하면 정리를 수동 완료한 다음 impeccable live-complete --id EVENT_ID를 실행합니다.
- handled: true, carbonize: false: 추가 작업 없이 다시 poll합니다.
- handled: true, carbonize: true: 아래 필수 정리를 수행합니다. _acceptResult.todo, _completionAck.requiresComplete, stderr 배너가 필요한 작업을 알려줍니다.
- handled: false, mode: "fallback": 세션이 생성 파일에서 실행됨. 위 fallback Step 3에서 실제 소스를 작성했으므로 임시 wrapper를 정리하고 poll합니다.
- handled: false, mode: "error": **파일을 직접 수정하지 않습니다.** source_locked면 publisher가 해제될 때까지 같은 impeccable live-accept 명령을 다시 실행합니다 (멱등). accept_receipt_conflict면 세션은 이미 priorOperation으로 해결되었습니다. impeccable live-status를 실행해 사용자에게 알립니다. 그 외에는 간단히 보고하고 먼저 impeccable live-status를 실행합니다.
- handled: false이며 mode가 없으면 수동 정리: 파일을 읽고 marker를 찾아 수정합니다.

### accept 후 필수 작업 (carbonize)

carbonize: true는 선택한 변형이 helper marker와 인라인 CSS를 포함해 소스에 삽입되었다는 뜻입니다 (그래야 브라우저가 중간 공백 없이 렌더링). 이 삽입은 임시이므로 먼저 영구 구조로 재작성합니다. 그렇지 않으면 비활성 @scope 규칙, wrapper div, marker 주석이 세션을 거듭하며 누적됩니다. poll 전에 다음 5단계를 동기식으로 완료합니다.

1. _acceptResult.file에서 carbonize 블록을 찾습니다. <!-- impeccable-carbonize-start/end SESSION_ID -->와 <style data-impeccable-css> 사이입니다. <!-- impeccable-param-values --> 주석이 있으면 먼저 읽어 3, 4단계에 반영합니다.
2. CSS 규칙을 프로젝트의 실제 스타일시트로 옮깁니다 (해당 요소 주변 스타일을 소유한 파일).
3. 선택한 파라미터 값을 고정하면서 선택자를 바꿉니다: @scope ([data-impeccable-variant="N"])을 실제 의미 클래스에 대응시키고 선택한 값과 일치하는 :scope[data-p-<id>="VALUE"] 분기만 남깁니다. var(--p-<id>)는 실제 값으로 대체하거나 변수 기본값을 갱신합니다.
4. accept된 콘텐츠를 wrapper에서 꺼냅니다. 내부 변형 div (JSX라면 외부 data-impeccable-carbonize div도) 삭제하고 data-impeccable-params 및 모든 data-p-* 속성을 제거합니다.
5. 인라인 <style> 블록, 파라미터 값 주석, 양쪽 carbonize marker, accept되지 않은 변형의 @scope 규칙을 삭제합니다.

그런 다음 impeccable live-complete --id SESSION_ID를 실행하고 poll하기 전에 phase: "completed"를 확인합니다. 이 명령은 형식적 절차가 아니라 게이트입니다. live 모드의 흔적이 남아 있으면 error: "source_dirty"와 함께 발견 사항을 반환하므로 수정 후 다시 실행합니다 (--force는 거짓 양성일 때만 사용).

## discard 처리

이벤트: {id, _acceptResult, _completionAck}. poll 스크립트가 이미 원본을 복구하고 discarded로 확인했습니다. 추가할 일은 없습니다. 다만 _completionAck.ok !== true면 impeccable live-complete --id EVENT_ID --discarded를 실행한 뒤 poll합니다.

## steer 처리

이벤트: {id, message, pageUrl}. 전역 바의 Steer 컨트롤에서 발생한 페이지 단위 지시이며 요소 맥락이나 변형 순환은 없습니다. message를 읽고 필요하면 페이지나 파일을 살펴본 뒤 편집하거나 답변합니다. .agents/skills/impeccable/scripts/impeccable live-poll --reply EVENT_ID steer_done ["Optional short toast"]로 응답하거나 실패 시 --reply EVENT_ID error "Short reason"을 전달한 뒤 바로 poll합니다. 별도 수신 확인은 보내지 않습니다. steer_done이나 error를 보내면 Steer 바가 다시 활성화됩니다.

## prefetch 처리

이벤트: {pageUrl}. 해당 경로에서 처음 선택이 발생할 때 한 번 전달됩니다. 사용자가 아직 읽지 않은 페이지에서 곧 Go를 누를 수 있습니다. 경로를 파일에 대응시킵니다 (루트 /는 보통 부팅에서 나온 pageFile; 멀티 페이지 사이트는 /foo를 public/foo/index.html에 대응하는 경우가 많고, SPA는 모든 경로가 단일 진입점을 사용). 파일을 읽고 다시 poll합니다. --reply는 보내지 않습니다. 자신 있게 파일을 찾지 못하면 건너뛰고 poll합니다.

## manual_edit_apply 처리

이벤트: {id, pageUrl, batch: {entries}, evidencePath?, chunk?, repair?, deadlineMs}.

사용자가 이미 Apply를 눌렀습니다. 무엇을 할지 묻거나 discard하거나 Go로 유도하지 않습니다. 상위 live 스레드에서 foreground poll 루프를 유지하고 최종 /poll --reply --data를 보냅니다.

기본 subagent를 사용할 수 있으면 소스 편집을 impeccable_manual_edit_applier / impeccable-manual-edit-applier에 위임합니다. cwd, 스크립트 경로, 이벤트 id, page URL, chunk/deadline, batch, evidencePath, 표준 JSON 결과 스키마를 전달합니다. subagent는 poll이나 reply를 하지 않습니다. 사용할 수 없으면 같은 계약에 따라 인라인으로 처리합니다.

repair가 있으면 이전 Apply에서 소스를 수정했지만 최종 검증이 실패한 상태입니다. 현재 소스를 고치고 같은 표준 JSON 결과를 반환합니다. 직접 파일을 되돌리지 않습니다. 브라우저가 rollback 전에 사용자에게 확인합니다.

소스 편집이 끝나면 다음 명령으로 정확히 한 번 응답합니다:
.agents/skills/impeccable/scripts/impeccable live-poll --reply EVENT_ID done --data '{"status":"done","appliedEntryIds":["8hexid"],"failed":[],"files":["src/page.html"],"notes":[]}'
모든 항목을 적용하지 못했다면 status:"partial" 또는 status:"error"와 failed[]를 사용합니다. 그다음 poll합니다. 이벤트 id 없이 reply하지 않습니다. manual Apply에는 --reply done --file ...가 유효하지 않습니다.



## 종료

사용자가 채팅에서 종료하라고 말하거나 탭을 닫으면 (SSE 연결이 끊어져 poll이 8초 뒤 exit 반환) 또는 브라우저의 exit 버튼을 누르면 라이브 모드가 종료됩니다. exit에서 아직 실행 중인 백그라운드 poll을 종료하고 정리합니다.

## 정리

```bash
.agents/skills/impeccable/scripts/impeccable live-server stop
```

helper를 중단하고 impeccable live-inject --remove를 실행해 삽입된 스크립트를 제거합니다 (빠른 재시작을 위해 유지하려면 stop --keep-inject 사용; .impeccable/live/config.json은 프로젝트 설정으로 유지됨). 그런 다음 impeccable-variants-start wrapper와 impeccable-carbonize-start 블록이 남아 있지 않은지 검색해 제거합니다.

## 최초 설정

impeccable live에서 config_missing / config_invalid가 보고되거나 configDrift 설명이 필요하거나 설정에 cspChecked가 없을 때만 [live-setup.md](live-setup.md)를 읽습니다. 이 문서에서 설정 스키마, 프레임워크별 files 표, 삽입 어댑터, 이탈 복구, CSP 감지와 동의 절차를 관리합니다.

