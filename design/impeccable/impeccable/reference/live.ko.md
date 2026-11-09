대화형 라이브 variant 모드: 브라우저에서 요소를 선택하고 디자인 액션을 고르면, AI가 생성한 HTML+CSS variant가 dev server의 HMR을 통해 핫스왑된다.

## 전제 조건

HMR이 있는 dev server(Vite, Next.js, Bun 등)가 실행 중이거나, 브라우저에 정적 HTML 파일이 열려 있어야 한다. dev server의 기본 포트가 사용 중이면 앱이 이미 실행 중일 가능성이 매우 높으므로, 두 번째 서버를 띄우기 전에 기본 URL부터 확인한다.

라이브 편집은 로컬 checkout이 있어야 한다. 배포된 운영 사이트(HTTPS 포함)에 주입하는 것은 지원하지 않는다. 운영 사이트를 점검하려면 라이브 helper가 아니라 `.agents/skills/impeccable/scripts/impeccable detect <url>` 또는 브라우저 확장 프로그램을 사용한다. 라이브 모드를 켜려고 브라우저 보안을 끄거나 운영 CSP를 약화하지 않는다.

Codex: 라이브 helper 명령, 앱 dev server, 패키지를 설치하는 모든 setup 명령은 처음부터 `sandbox_permissions: "require_escalated"`로 실행한다. 라이브 모드는 샌드박스가 차단하는 localhost와 패키지 매니저 네트워크 접근에 의존하기 때문이다.

## 계약 (한 번 읽는다)

순서대로 실행한다. 단계를 건너뛰거나 순서를 바꾸지 않는다. 라이브 모드의 모든 도구 출력에는 `_instructions` 필드가 있을 수 있다. 이 필드는 그 정확한 상황에 대한 다음 단계이며, 실제 id와 경로가 대입되어 있다. 이 문서에 대한 기억과 충돌하면 `_instructions`가 우선한다.

1. `impeccable live`: 부팅. 요청이 모노레포 안의 파일, 라우트, 또는 앱을 지정하거나 암시하면, 구체적인 경로를 추론해서 대신 `.agents/skills/impeccable/scripts/impeccable live --target <path>`를 실행한다. 그다음 반환된 `projectRoot`에서 나머지 라이브 세션을 진행한다. 부팅은 dev server 설정 파일에서 앱 루트를 찾아 `.impeccable/live/roots.json`에 저장한다. 모든 helper는 시작할 때 이 manifest에 맞춰 위치를 잡으므로, 잘못된 cwd 때문에 세션 상태가 갈라지지 않는다. PRODUCT.md / DESIGN.md는 git 루트까지 위로 올라가며 찾고, `--file` 같은 상대 helper 인자는 앱 루트 기준으로 해석된다.
2. `pageFile`을 서빙하는 앱 URL을 연다. `package.json`, 문서, 터미널 출력, 열린 탭에서 추론한다. `serverPort`는 절대 쓰지 않는다. 그것은 앱이 아니라 helper다. **Cursor:** poll 전에 `browser_navigate`로 그 URL을 연다. 건너뛰지 않는다. **다른 harness:** 사용 가능한 브라우저 도구를 쓴다. URL이 불확실하면 사용자에게 한 번 묻는다.
3. 기본 긴 timeout(600000 ms)으로 poll 루프를 돌린다. 이벤트나 `--reply` 직후에는 즉시 `impeccable live-poll`을 다시 실행한다. Codex는 이 one-shot poll을 foreground에서 실행한다. 짧은 `--timeout=`은 절대 주지 않는다. 아무것도 `/poll`을 폴링하지 않으면 전역 바의 **Impeccable mark**가 주황색 점을 맥박처럼 깜빡이며 흐려진다. 다시 연결하려면 `impeccable live-poll`을 재시작한다.
4. `generate`: `event.scaffold`가 있으면 재사용한다. 스크린샷이 있으면 읽는다. 액션의 reference를 로드한다. 변형을 전달하고 `--reply done`을 보낸 뒤 다시 poll한다. 이 스레드에서 직접 생성한다. 프로젝트의 토큰과 레이아웃을 이미 알고 있기 때문이다. 오버레이 미리보기가 검증 채널이다. generate와 accept 사이에 변형을 스크린샷하거나 다시 렌더링하거나 QA하지 않는다. craft-floor의 대비, 간격, 타이포그래피 바닥선은 작성하면서 구조적으로 지킨다. 전체 검증은 accept 때 선택된 변형에 대해 한 번만 실행한다.
5. `steer`: `message`와 `pageUrl`을 읽고 작업한 뒤 `--reply steer_done`을 보내고 바로 다시 poll한다. 픽업 ack는 없다.
6. `accept` / `discard`: poll 스크립트가 `impeccable live-accept`를 실행하고, 전달을 확인 응답하며, `_completionAck`를 출력한다. 일반 accept와 discard는 즉시 최종 상태가 된다. carbonize accept는 `impeccable live-complete --id EVENT_ID`를 실행하기 전까지 복구 가능한 상태로 남는다. 다시 poll하기 전에 그 정리를 끝낸다.
7. 중단되면 추측하기 전에 `impeccable live-status` 또는 `impeccable live-resume`을 실행한다. `.impeccable/live/sessions/` 아래의 journal이 정본이며, helper가 재시작되면 확인되지 않은 작업을 다시 재생한다. 페이지를 다시 열면 주입된 `live.js`가 다시 연결된다. direct-edit 루프로 되돌아가는 것은 `impeccable live-resume`이 활성 세션이 없다고 보고할 때뿐이다. 연결이 자주 끊기는 것 같다는 느낌만으로 되돌아가지 않는다.
8. `exit`: 아래의 정리(cleanup)를 실행한다.

Harness 정책:
- **Claude Code**: poll을 **background task**로 실행한다(짧은 timeout을 주지 않는다). harness가 완료를 알려 준다. shell을 막지 않는다.
- **Cursor**: `"type":"(steer|generate|accept|discard|manual_edit_apply|variant_mount_failed|prefetch|exit)"`에 대해 알림을 설정한 **background terminal**에서 **one-shot** poll을 실행한다. 이벤트를 처리하고, `--reply`를 보내고, poll을 다시 시작한다. Cursor에서는 `--stream`을 쓰지 않는다(측정상 픽업까지 약 5초이며, one-shot은 subsecond다).
- **Codex**: 기본 one-shot poll을 **yield된 foreground exec 세션**에서 실행한다. `&`도, `--stream`도 쓰지 않는다. 활성 foreground poll 없이 Live 상태로 두지 않는다. poll을 시작하는 것만으로는 충분하지 않다. 응답을 처리해야 한다. 이벤트가 반환될 때까지 exec 세션을 계속 읽는다. "사용자를 기다리는 중"이라고 말하고 멈춰 있지 않는다. 아무도 읽지 않는 yield된 poll은 죽은 세션이며, 사용자의 Go는 응답 없이 남는다.
- **다른 harness**: shell이 끝날 때 stdout이 안정적으로 돌아온다고 확실히 알지 않는 한 one-shot foreground로 실행한다.

전달 정책: 모든 환경에서 원자적 단일 편집 전달을 쓴다. poll 루프가 추가 호출에도 막히지 않는다고 알려지지 않은 harness는 점진적 publishing으로 전환하지 않는다.

채팅은 오버헤드다. 요약, 튜토리얼 출력, PRODUCT / DESIGN 본문을 붙여넣지 않는다. 토큰은 도구와 편집에 쓴다. 실패하면 짧은 문장 한두 개로만 알린다.

## Poll 루프

```
LOOP:
  .agents/skills/impeccable/scripts/impeccable live-poll   # default long timeout; no --timeout=
  Read JSON; dispatch on "type"

  "generate"  → Handle Generate; reply done; LOOP
  "steer"     → Handle Steer; reply steer_done; LOOP
  "accept"    → Handle Accept; complete carbonize cleanup if required; LOOP
  "discard"   → Handle Discard; LOOP
  "prefetch"  → Handle Prefetch; LOOP
  "manual_edit_apply" → Handle Manual Edit Apply; reply done|partial|error; LOOP
  "variant_mount_failed" → Fix the variant files; reply done --file <path>; LOOP
  "timeout"   → LOOP
  "exit"      → break → Cleanup
```

`variant_mount_failed`는 브라우저가 게시된 내용을 렌더링하지 못했다는 뜻이다(`variant`, module `url`, `error`). 사용자에게는 variant 대신 지속적인 오류 카드가 보인다. variant 파일을 고친 뒤 `--reply EVENT_ID done --file <manifest or source path>`를 보낸다. 브라우저가 스스로 재시도한다.

**Stream 모드** (`--stream`, 실험적, Cursor에서는 절대 사용하지 않는다): 장기 실행 프로세스 하나가 이벤트마다 JSON 한 줄을 출력하고, `--reply`는 별도 명령으로 보낸다. 증분 stdout을 안정적으로 읽는 harness에서만 쓴다.

## 시작

```bash
.agents/skills/impeccable/scripts/impeccable live
```

출력 JSON: `{ ok, serverPort, serverToken, pageFiles, roots, hasProduct, product, productPath, hasDesign, design, designPath, hasSurfaceBrief, surfaceBrief }`. `roots`는 해석된 루트 manifest이며, `projectRoot`는 `roots.appRoot`를 그대로 반영한다. surface brief도 함께 온다. `impeccable surface-brief`를 따로 실행하지 않는다. 생성의 우선순위는 **DESIGN.md가 시각적 결정에서, PRODUCT.md가 지속적인 제품 및 voice 결정에서, surface brief가 이 surface의 전략에서 우선한다.** DESIGN.md가 없어도 정체성이 없는 것은 **아니다**. CSS 변수, computed style, 형제 컴포넌트에서 추출한다(Step 4 Phase A). 정체성 보존이 기본이며, 벗어나려면 사용자의 명시적 재디자인 의도가 필요하다.

`serverPort`/`serverToken`은 dev server가 아니라 작은 helper HTTP 서버(`/live.js`, SSE, `/poll`)의 것이다. 페이지 URL은 `pageFiles` 항목을 서빙하는 어떤 origin이든 상관없다.

출력이 `{ ok: false, error: "config_missing" | "config_invalid", path }`이면 이 프로젝트에는 일회성 설정이 필요하다. [live-setup.md](live-setup.md)를 읽고 그대로 따른다. 출력에 null이 아닌 `configDrift`가 있으면, 어느 HTML 파일이 다뤄지지 않는지 사용자에게 한 번 알리고, 그 파일을 추가하거나 `files`를 glob으로 바꾸기를 제안한다. 설정 파일은 절대 자동으로 편집하지 않는다.

## 복구 명령

`.impeccable/live/sessions/` 아래의 append-only journal이 정본인 durable 상태다(프로젝트 소스가 아니다). 채팅이 중단되었거나, polling을 놓쳤거나, helper가 재시작되었거나, 브라우저가 새로고침되었을 때 다음을 실행한다:

```bash
.agents/skills/impeccable/scripts/impeccable live-status      # helper state, active sessions, queued events; works with the helper down
.agents/skills/impeccable/scripts/impeccable live-resume --id SESSION_ID   # active snapshot, pending event, next safe action
.agents/skills/impeccable/scripts/impeccable live-complete --id SESSION_ID # canonical manual final acknowledgement after verified cleanup
```

서버 재시작 규칙: `impeccable live-server`를 다시 시작한 뒤 poll한다. 시작 시 확인되지 않은 이벤트가 큐에 다시 들어가므로, `impeccable live-resume`이 활성 세션이 없다고 말하지 않는 한 사용자에게 Go를 다시 누르라고 요청하지 않는다.

## `generate` 처리

**Replace 모드** (기본): `{id, action, freeformPrompt?, count, pageUrl, element, screenshotPath?, comments?, strokes?}`.

**Insert 모드** (`event.mode === "insert"`): `{id, mode: "insert", count, pageUrl, insert: { position, anchor }, placeholder: { width, height }, freeformPrompt?, screenshotPath?, comments?, strokes?}`. `action`이 없다. 비어 있지 않은 `freeformPrompt` **또는** 주석(annotation)이 필요하다. `placeholder`는 느슨한 크기 힌트다.

속도가 중요하다. 사용자가 선택한 요소를 지켜보고 있다. 사전 점검(preflight) 메타데이터를 재사용하고 탐색용 호출을 최소화한다.

### Insert 모드 분기

1. 스크린샷이 있으면 읽는다(주석이 있을 때만).
2. `event.scaffold`가 있으면 그것을 사용하고 helper를 **다시 실행하지 않는다**. 없으면:

```bash
.agents/skills/impeccable/scripts/impeccable live-insert --id EVENT_ID --count EVENT_COUNT --position after \
  --element-id "ANCHOR_ID" --classes "class1,class2" --tag "section" --text "ANCHOR_TEXT"
```

`--position`은 `event.insert.position`에서 온다. anchor 플래그는 wrap의 것과 정확히 같이 매핑한다. scaffold에는 `data-impeccable-variant="original"`이 **없다**. 변형은 `insertLine`에 새로 만드는 HTML+CSS다. source-preview 대상에서 scaffold는 `sourceWritten: false`, `wrapperBlock`, `replaceEndLine < replaceStartLine`(삽입)을 담는다. 이 경우 marker 위치에서 변형을 `wrapperBlock`에 끼워 넣고, `replaceStartLine`에 한 번의 편집으로 삽입한다. 아래 wrap 섹션이 설명하는 방식과 정확히 같다. 표면에서 방문자 모드를 정하고, 새 마크업을 쓰기 전에 [craft-floor.md](craft-floor.md)를 읽는다. Svelte 대상은 아래 wrap과 같은 컴포넌트 흐름을 따른다(manifest의 `mode: "insert"`). 각 변형은 `componentDir` 아래의 실제 단일 루트 컴포넌트이며, `data-impeccable-*` 속성이 없다. 생성 중에는 route를 절대 편집하지 않는다. accept가 선택된 markup을 `sourceFile`에 기계적으로 끼워 넣는다. Svelte가 아닌 대상에서는 accept/discard가 wrapper를 제거한다. anchor는 건드리지 않는다.

### Replace 모드 (기본)

### 1. 스크린샷 읽기 (있는 경우)

`event.screenshotPath`는 사용자가 Go 전에 주석을 달았을 때**만** 전달된다. 주석이 구워 넣어진 요소의 PNG다. 계획을 세우기 전에 읽는다. 없으면 스크린샷을 요청하거나 직접 페이지를 찍지 않는다. 주석 없는 스크린샷은 기존 디자인에 고정시켜 "방향 세 개를 확연히 다르게"라는 브리프와 충돌하므로, `element.outerHTML`, computed style, 프롬프트에서 작업한다.

주석의 의미 규칙: 댓글의 `{x, y}`는 요소 기준 좌표이며, 텍스트를 그 지점에 있는 자식에 묶는다(제목 근처의 댓글은 제목에 관한 것이다). 댓글과 스트로크는 명확히 짝지어지지 않는 한 독립적이다. 스트로크는 모양으로 읽는다. 닫힌 고리 = "이것"(강조이며 클리핑 영역이 아니다), 화살표 = 방향 또는 움직임, 십자/빗금 = 삭제, 낙서 = 맥락에 따라 강조 또는 삭제. 스트로크의 의도가 정말 모호하고 브리프를 바꾼다면, 생성 전에 짧은 질문을 하나 한다. 그렇지 않으면 한 문장으로 해석을 밝힌다.

### 2. 요소 감싸기

`event.scaffold`가 있으면 helper가 이미 소스를 찾았고 wrapper를 계산했다. 이를 성공 결과로 보고 명령을 건너뛴다. `event.scaffoldAttempted`와 `scaffoldError`가 함께 있으면 preflight가 끝나지 못한 것이므로 아래 명령을 쓴다.

**source-preview 대상에서 `event.scaffold`는 `sourceWritten: false`를 담는다.** helper는 wrapper를 쓰지 않았다. 대신 `scaffold.wrapperBlock`과 선택된 요소의 소스 범위(`replaceStartLine`, `replaceEndLine`, 1부터 시작)를 준다. wrapper와 **모든** 변형을 한 번의 편집으로 쓴다. "Variants: insert below this line" marker 아래에 변형을 `wrapperBlock`에 끼워 넣고, 그 결과로 `[replaceStartLine, replaceEndLine]` 줄을 교체한다. scaffold를 따로 쓰면 변형 쓰기가 반영되기 전에 프레임워크가 다시 로드되어 브라우저가 0/N 상태에 머무른다. (`replaceEndLine < replaceStartLine`은 insert 모드를 뜻한다. 삽입만 하고 아무것도 지우지 않는다.) `svelte-component` 경로는 `sourceWritten`을 설정하지 않는다.

```bash
.agents/skills/impeccable/scripts/impeccable live-wrap --id EVENT_ID --count EVENT_COUNT --element-id "ELEMENT_ID" --classes "class1,class2" --tag "div" --text "TEXT_SNIPPET"
```

플래그 매핑(각각 분리해서 유지하고, `--query`로 합치지 않는다): `--element-id`는 `event.element.id`, `--classes`는 쉼표로 이어 붙인 classes, `--tag`는 tagName, `--text`는 textContent의 앞 약 80자이며 **매번** 넣는다. 형제 컴포넌트가 반복되는 경우를 구분하기 위해서다. 이 값이 없으면 wrap이 첫 번째 일치 항목에 걸린다. `event.pageUrl`이 파일을 암시하면 `--file PATH`를 넘긴다. `--text`로도 후보가 여럿 남으면 wrap은 `{ error: "element_ambiguous", candidates, fallback: "agent-driven" }`로 끝난다. 페이지 맥락에서 올바른 범위를 고르고, fallback 흐름에 따라 wrapper를 직접 작성한다.

성공 출력: `{ file, insertLine, commentSyntax, styleMode, styleTag, cssSelectorPrefixExamples, cssAuthoring }`(source-preview 대상에서는 위의 `sourceWritten: false` 필드가 추가된다). 사전 scaffold 없이 직접 실행하면 helper가 wrapper를 직접 쓰고, 변형은 `insertLine`에 끼워 넣는다. `styleMode`는 미리보기 CSS를 어떻게 작성해야 하는지 정한다. 이것은 프레임워크 추측이 아니라 감지된 기능 모드로 취급한다. `scoped`는 `@scope ([data-impeccable-variant="N"])` 규칙을 뜻하고, `astro-global-prefixed`는 정확히 반환된 `styleTag`와 함께 명시적인 `[data-impeccable-variant="N"]` 접두사를 쓴다는 뜻이다. 현재 파일의 기준은 `cssAuthoring`이다(styleTag, 선택자 전략, 요구사항, 금지 패턴). 그것이 말하지 않는 한 프레임워크별 예외를 적용하지 않는다.

Svelte/SvelteKit 대상에서 `impeccable live-wrap`은 `previewMode: "svelte-component"`를 반환한다. `file`은 임시 `node_modules/.impeccable-live/<id>/manifest.json`을 가리키고, `componentDir`은 변형 컴포넌트를 담으며, `sourceFile`은 실제 route다. scaffold는 AST 기반이다. 제어 블록(`{#each}`, `{#if}`)은 그대로 유지되고, 자유로운 each 컬렉션은 하나의 구조화된 prop(kind `collection`)으로 계약에 들어간다. 페이로드에는 `componentStubMarkup`이 포함되어 있다(모든 stub에 이미 prop 치환이 적용된 마크업). 따라서 manifest나 stub을 다시 읽지 않는다. `v1.svelte`, `v2.svelte`, ...를 **제자리에서** 편집한다. 삭제 후 재생성하지 않는다. stub의 제어 흐름과 `propContract` prop 이름을 유지하고, 루프를 리터럴 항목으로 평탄화하지 않는다. stub의 `<style>`에는 현재 선택을 꾸미는 소스 규칙이 미리 채워져 있다. 자유롭게 다시 쓰거나 삭제해도 된다. accept 시, 변형이 다시 선언하지 않은 시드 규칙은 소스에서 **제거된다**(미리보기에는 적용되지 않았으므로, 사용자는 그것 없이 디자인을 승인한 셈이 된다). 여기서는 의미적 클래스 선택자를 쓰고, `@scope`와 `data-impeccable-*`는 쓰지 않는다. `--file`에 manifest 경로를 넣어 응답한다. 브라우저가 컴파일된 컴포넌트를 마운트하므로 Svelte HMR이 페이지 상태를 초기화하지 않는다. accept는 선택된 컴포넌트를 기계적으로 원래 파일에 병합한다(markup은 route 표현식으로 복원되고, CSS는 조정되며, params는 구워지고, 들여쓰기는 보존된다). 이 경로에는 accept 후 정리 단계가 없다. 선택 영역에 분리된 미리보기가 지원하지 못하는 구문(컴포넌트 태그, `bind:`/`use:`, await 블록, 인라인 스크립트, spread 속성)이 있으면, wrap은 일반 source-preview wrapper를 `previewFallback: { from: "svelte-component", reason }`과 함께 반환한다. 반환된 형태를 그대로 따른다.

**component-preview 경로의 params는 속성이 아니라 sidecar에 둔다**(Svelte는 속성 값의 `{`를 표현식으로 파싱한다). `componentDir/params.json`에 변형 번호를 키로 선언한다. 스키마는 7절의 것을 쓴다:

```json
{ "1": [ {"id":"density","kind":"steps","default":"snug","label":"Density","options":[
    {"value":"airy","label":"Airy"},{"value":"snug","label":"Snug"} ]} ] }
```

`range`/`toggle`은 `var(--p-<id>, default)`를, `steps`는 `[data-p-<id>="…"]`를 기준으로 component `<style>`을 작성한다. 이때 `:global(...)`으로 감싸서, 마운트된 root의 런타임 knob 값이 규칙에 도달하도록 한다.

**Fallback 오류.** Wrap은 생성되었거나 추적되지 않는(untracked) 비소스 파일에는 쓰지 않는다. 그 파일에 accept하면 조용히 데이터가 손실되기 때문이다. 세 가지 형태가 있으며 모두 `fallback: "agent-driven"`을 가진다(**Fallback 처리** 참조). `file_is_generated`는 `--file`이 생성된 파일을 가리킨다는 뜻이다. `element_not_in_source`와 `generatedMatch`는 요소가 생성된 결과물에만 존재한다는 뜻이다. `element_not_found`는 런타임에 주입되었을 가능성이 크다는 뜻이다.

### 3. 액션의 reference 로드

`event.action`이 `impeccable`(freeform)이면 SKILL.md의 디자인 규칙과 [craft-floor.md](craft-floor.md)를 바탕으로 작업한다. 표면에서 방문자 모드를 정하고, 하위 명령 reference는 읽지 않는다. Freeform이라고 해서 파라미터를 건너뛰어도 되는 것은 아니다. 7절의 예산과 freeform 편향을 따른다. 다른 액션(`bolder`, `quieter`, `distill`, `polish`, `typeset`, `colorize`, `layout`, `adapt`, `animate`, `delight`, `overdrive`)이면 계획 전에 `reference/<action>.md`를 읽는다. 그 MUST 파라미터는 7절의 예산 위에 겹쳐 적용된다.

### 4. 변형 3개 계획: 정체성 먼저, 그다음 모드, 그다음 축

Live는 기존 표면에서 실행된다. 브랜드는 이미 정해져 있다. 과제는 **정체성 안에서의 변화**이지, 정체성들 사이의 선택이 아니다. 가장 나쁜 실패는 사용자가 수락할 수 없는 브랜드 밖의 변형 세 개다. 네 단계를 순서대로 수행한다.

#### Phase A: 정체성 추출 (건너뛸 수 없음)

출처의 우선순위: DESIGN.md의 시각 체계 필드, CSS 커스텀 속성(사실상의 토큰), 선택한 요소와 부모의 computed style, 형제 컴포넌트의 시각적 수사(rhetoric). 실제로 화면에 보이는 것을 한 문장으로 기록한다. 지배적인 표면 색과 강조 색(실제 값, "따뜻함" 같은 말이 아니다), 로드된 폰트 조합, 레이아웃 구조(stacked / side-by-side / grid / asymmetric / overlay), 표면 처리(모서리, 테두리, 그림자, 장식 밀도), 그리고 복사(copy)에서 읽은 voice 톤. 구체적으로 쓴다. 근거가 없는 축은 지어내지 말고 건너뛴다. 미학 계열의 이름은 붙이지 않는다(결론이지 데이터가 아니다). 이 문장이 **정체성 잠금(identity lock)**이다. 모든 변형은 나란히 놓였을 때 같은 브랜드로 읽혀야 한다. DESIGN.md가 없다는 것은 어떤 경우에도 핑계가 되지 않는다.

#### Phase B: 모드 선택 (기본 vs 이탈)

**기본(Default)** 모드는 정체성을 보존하고 그 안에서 표현만 바꾼다. 세션의 약 90%에 맞다. **이탈(Departure)** 모드는 정체성을 거부한다. 현재 요청이나 프롬프트에서 사용자가 명시적으로 요구할 때만 발동한다(예: "이걸 재디자인해", "처음부터 다시 만들어", "완전히 다른 것으로"). 오래된 비평이나 예전 메모는 승인이 아니다. 확신이 없으면 기본 모드를 쓴다. 기본값을 잘못 고르면 "비슷한 느낌의 같은 브랜드 변형 세 개"라는 비용이 드는데, 이것은 복구할 수 있다. 이탈을 잘못 고르면 브랜드 밖의 변형 세 개라는 비용이 드는데, 이것은 복구할 수 없다.

#### Phase C: 변형 3개 계획

**기본 모드.** 각 변형은 정체성 문장을 유지하면서 서로 다른 **주축(primary axis)**을 택한다. 여섯 개의 축은 다음과 같다. 1 **Hierarchy**(어떤 요소가 시선을 이끄는가), 2 **Layout topology**(stacked / side-by-side / grid / asymmetric / overlay), 3 **Typographic system**(조합의 논리, 스케일 비율, 대소문자와 굵기. *사용 가능한 서체 안에서*), 4 **Color strategy**(기존 팔레트의 어떤 역할이 표면을 맡는가: Restrained / Committed / Full palette / Drenched. 기존 토큰만), 5 **Density**(minimal / comfortable / dense), 6 **Structural decomposition**(병합, 분할, 점진적 공개). 변형 세 개는 서로 다른 축 세 개를 쓴다. 같은 브랜드를 세 각도에서 보여 주는 것이다. 새 폰트, 새 색조, 새 미학 계열 신호는 이탈 모드에서만 허용된다.

**이탈 모드.** 각 변형은 고정된 카탈로그가 아니라 브랜드에서 도출한 서로 다른 미학 방향에 고정한다. PRODUCT.md의 Brand Personality 단어를 읽고, 그 단어를 구현하는 물리적, 공간적, 재료적 경험을 도출한다. 거기서 서로 다르고 현재 표면과도 다른 방향 세 개를 도출한다. 이웃 제품에도 들어맞는 이유를 가진 반사적 선택은 거부한다. 각 방향은 실제 세계의 준거를 명명하는 구체적인 문장 하나여야 한다("clean and minimal"이 아니라 "박물관 전시 라벨 체계").

**두 모드 모두에서, 계획 중에 각 변형의 파라미터 knob 2개 또는 3개를 정한다**(7절의 예산). 파라미터는 디자인의 일부다. 계획 단계에서 "무엇을 조정 가능하게 할지"를 정하는 편이, 나중에 덧붙이는 것보다 낫다.

#### Phase D: 스쿼트 테스트

**기본:** 각 변형을 Phase A의 잠금과 비교한다. 팔레트, 타입 voice, 수사의 어긋남은 실수로 이탈 모드에 넘어갔다는 뜻이므로 다시 작업한다. 그다음 세 변형의 주축이 서로 다른지 확인한다. 세 개가 모두 "더 촘촘한 밀도"라면 실패다. **이탈:** 두 단계로 진행한다. 계열(family)을 먼저 본다. 필수 단계다. 각 변형에 직접 고른 구체적인 계열 이름을 붙인다. 공유되거나 서로 바꿔 쓸 수 있는 이름이면 다시 작업한다. 그다음 문장 단계로, 한 줄짜리 설명 세 개를 나란히 놓는다. 두 개가 운율이 맞으면 다시 작업한다. 주축이 색이나 테마일 때는 세 변형이 테마와 주요 색조를 함께 공유하면 안 된다. 세 가지 색 세계여야 하며, 같은 색의 세 가지 음영이면 안 된다.

**액션별 호출**은 그 액션의 차원을 따라 달라져야 한다. 기본 모드에서는 모든 변화가 사용 가능한 서체와 기존 토큰 안에 머문다.

- `bolder`: 변형마다 다른 차원을 증폭한다(scale / saturation / 구조 변경).
- `quieter`: 변형마다 다른 차원을 뺀다(color / ornament / spacing).
- `distill`: 변형마다 다른 종류의 과잉을 제거한다(시각적 노이즈 / 중복 콘텐츠 / 중첩 구조).
- `polish`: 변형마다 다른 다듬기 축(rhythm / hierarchy / micro-details).
- `typeset`: 이탈 모드는 조합과 스케일 비율을 각각 바꾼다. 기본 모드는 서체는 유지하고, 변형마다 스케일 비율, 대소문자, 굵기를 각각 바꾼다.
- `colorize`: 이탈 모드는 각 변형에 서로 다른 색조 계열을 주고 채도와 대비 전략을 바꾼다. 기본 모드는 변형마다 표면을 맡는 기존 팔레트 역할(Restrained / Committed / Full palette / Drenched)을 다르게 주고, 대비 전략도 다르게 한다.
- `layout`: 간격 조정이 아니라 서로 다른 구조적 배치.
- `adapt`: 변형마다 다른 대상 맥락(mobile-first / tablet / desktop / print 또는 low-data).
- `animate`: 서로 다른 모션 어휘(cascade stagger / clip wipe / scale-and-focus / morph / parallax).
- `delight`: 서로 다른 personality 풍미(micro-interaction / typographic surprise / illustrated accent / sonic-or-haptic / easter egg).
- `overdrive`: 깨뜨리는 관습이 서로 다르다(scale / structure / motion / input model / state transitions). "propose and ask" 단계는 건너뛴다. Live는 비대화형이다.

### 5. Freeform 프롬프트 적용 (있는 경우)

`event.freeformPrompt`는 방향에 대한 사용자의 상한선이다. 모든 변형은 이를 존중하면서, Phase B 모드 안에서 서로 다른 해석을 탐색한다. 기본 모드에서 프롬프트는 정체성이 아니라 축을 좁힌다("더 자신감 있게" → 한 변형은 hierarchy를 강조하고, 한 변형은 강조 색을 확정하며, 한 변형은 밀도를 조인다). 이탈 모드에서 프롬프트는 계열이 아니라 방향(lane)을 좁힌다("신문 1면" → broadsheet vs tabloid vs trade journal, 그다음 계열 검사를 수행한다). 프롬프트가 구속력 있는 브랜드 약속이나 DESIGN.md의 불변 조건과 충돌하면, 사용자가 명시적으로 철회하지 않는 한 그 불변 조건을 지킨다.

### 6. 변형 전달

변형마다 원래 요소를 **완전히 교체하는** HTML로 전달한다. CSS만 패치하지 않는다. 미리보기 CSS는 wrapper 안의 `<style>` 태그로 함께 둔다. **원자적 기본값:** CSS, 모든 변형, 파라미터 manifest를 `insertLine`에 한 번의 편집으로 넣는다.

```html
<!-- Variants: insert below this line -->
<style data-impeccable-css="SESSION_ID">
  /* rules matching cssAuthoring.rulePattern */
</style>
<div data-impeccable-variant="1">
  <!-- variant 1: full element replacement (single top-level element) -->
</div>
<div data-impeccable-variant="2" style="display: none">
  <!-- variant 2 -->
</div>
<div data-impeccable-variant="3" style="display: none">
  <!-- variant 3 -->
</div>
```

style 여는 태그는 도구가 다른 것을 반환하면 `cssAuthoring.styleTag`로 바꾸고, 닫을 때는 `cssAuthoring.styleClose`(`.vue`에서는 `</component>`)를 쓴다. **각 variant div는 정확히 하나의 최상위 요소를 가진다**. 원래 요소와 같은 태그여야 한다. 느슨한 형제 요소는 outline 추적과 accept를 깨뜨린다. 첫 번째 변형만 보이고 나머지는 모두 `display: none`이다. 브라우저의 MutationObserver는 원자적 도착과 점진적 도착을 모두 받아들인다. 도착한 변형을 accept하면 worker가 고정(fence)되므로, 이후의 게시는 거부된다.

`styleMode: "scoped"`에서는 모든 `:scope` 규칙을 하위 결합자(descendant combinator)와 함께 작성한다. `@scope` 경계는 요소가 아니라 variant wrapper div이므로, 맨 `:scope { ... }`는 `display: contents` 셸을 꾸미게 된다. 항상 한 단계 안으로 들어간다(`:scope > .card`, `:scope .hero-title`). [repo agent template](https://github.com/pbakaus/impeccable/blob/8dac6ae7e020c43ab10ce9b41939f6fd42627b96/tests/live-e2e/agent.mjs)의 가짜 테스트 agent CSS가 충실한 템플릿이다.

**JSX / TSX 대상:** `<style>` 내용을 template literal로 감싼다(CSS 중괄호는 JSX로 파싱된다). `className=` / `style={{…}}`를 쓰고, `data-impeccable-*` 속성은 일반 문자열로 유지한다.

```tsx
<style data-impeccable-css="SESSION_ID">{`
  @scope ([data-impeccable-variant="1"]) { ... }
`}</style>
<div data-impeccable-variant="2" style={{ display: 'none' }}>
  {/* variant 2 */}
</div>
```

wrap 스크립트는 marker 주석을 안에 둔 단일 루트 JSX wrapper를 제공한다. marker 위치에 블록을 넣으면 소스가 유효한 TSX로 남는다.

### 7. 파라미터 (구성 크기 단위, variant당 0-4개)

각 변형은 **coarse** knob을 노출할 수 있다. 브라우저는 파라미터마다 컨트롤 하나를 붙이며, 재생성 비용은 0이다. knob은 여러분이 작성한 scoped CSS가 기준으로 삼는 CSS 변수나 data 속성을 구동한다. 사용자가 재생성을 원하지 않으면서도 "조금 더 촘촘하게"나 "강조 색을 조금 더"라고 중얼거릴 수 있는 축이라면 파라미터로 연결한다. 미세한 여백이나 일회성 조정은 파라미터가 아니다. Freeform 편향이 있다. 축은 여러분이 골랐으니 노출하라. 파라미터가 0개인 히어로는 거의 항상 실수이며, 1개는 고정점이 되는 디자인이 아니라면 부족하다.

예산은 요소의 시각적 무게에 따라 정한다(시각적 자식 수를 센다. DOM 깊이가 아니다).

- **Leaf / 작은 요소**(버튼, 아이콘, 단순 제목): **파라미터 0개.**
- **작은 구성**(단순 카드, 라벨이 붙은 입력, 시각적 자식 약 5개 이하): **0-1개.**
- **중간 구성**(섹션, 내비게이션 묶음, 자식 6-15개): **목표 2개.** 단순하면 1개.
- **큰 구성**(히어로, 전체 영역, 자식 16개 이상 또는 하위 섹션이 있음): **목표 2-3개, 독립 축이 모두 CSS로 작성되어 있으면 최대 4개.**

**하드 캡: variant당 4개.** 이름이 있는 하위 명령이라면, 액션 reference의 MUST 파라미터는 표현 가능한 한 타협할 수 없다. 캡을 지키고, knob을 중복하지 않는다.

**선언**은 HTML/JSX 경로에서 wrapper 속성으로 한다(component-preview 경로는 대신 `componentDir/params.json`을 쓴다. 스키마는 같고 변형 번호를 키로 쓴다. wrap 섹션을 본다).

```html
<div data-impeccable-variant="1" data-impeccable-params='[
  {"id":"color-amount","kind":"range","min":0,"max":1,"step":0.05,"default":0.5,"label":"Color amount"},
  {"id":"serif","kind":"toggle","default":false,"label":"Serif display"}
]'>
```

종류는 세 가지다. `range`는 슬라이더이며 `--p-<id>`를 구동한다. `var(--p-color-amount, 0.5)`로 작성하고, 필드는 min/max/step/default/label이다. `steps`는 세그먼트 라디오이며 `data-p-<id>`를 구동한다. `:scope[data-p-density="airy"] .grid { ... }`로 작성하고, 필드는 options/default/label이다. `toggle`은 `--p-<id>: 0|1`과 속성 존재 여부를 모두 구동한다. 필드는 default/label이다. 변형을 바꿀 때 초기화되는 것은 알려진 한계다. 각 변형은 선언된 기본값에서 시작한다.

**accept 시**, 브라우저는 현재 값을 보내고 `impeccable live-accept`는 이를 형제 주석으로 쓴다: `<!-- impeccable-param-values SESSION_ID: {"color-amount":0.7} -->`. Carbonize 정리는 이 값을 굽는다. 선택된 `steps`/`toggle` 분기만 남기고 나머지는 버린다. `:scope[data-p-…]`는 시맨틱 규칙으로 합친다. `range`는 리터럴 값으로 치환하거나 변수의 기본값을 갱신한다.

### 8. 완료 신호

```bash
.agents/skills/impeccable/scripts/impeccable live-poll --reply EVENT_ID done --file RELATIVE_PATH
```

`RELATIVE_PATH`는 프로젝트 루트 기준 상대 경로다. dev server에 HMR이 없으면 브라우저가 소스를 직접 가져온다. 그다음 즉시 다시 poll한다.

### 진행 중인 세션 중단

wrap이나 생성이 실패했는데 브라우저가 이미 GENERATING으로 바뀌었다면, 브라우저의 바가 초기화되도록 **브라우저에** 알린다: `.agents/skills/impeccable/scripts/impeccable live-poll --reply EVENT_ID error "Short reason"`. `live-accept --discard`는 절대 쓰지 않는다. 파일만 바꾸는 도구라 브라우저는 그 사실을 모르고, 바가 점 상태에 멈춘다. `--discard`는 브라우저가 직접 시작한 discard에 대한 소스 쪽 정리 용도로만 쓴다.

## Fallback 처리

wrap이 `fallback: "agent-driven"`을 반환하면 소스 파일은 직접 고른다. 목표는 그대로다. 지금은 변형 미리보기 세 개를 만들고, 채택된 변형은 다음 빌드가 지우지 못하는 곳에 보존한다.

1. 오류 payload에서 **요소가 실제로 있는 위치**를 찾는다. `element_not_in_source`와 `generatedMatch`는 제공된 HTML이 생성된 결과물이라는 뜻이므로, 생성기의 템플릿이나 partial을 찾는다. `element_not_found`는 런타임에 주입되었다는 뜻이므로, 렌더링 컴포넌트나 데이터 소스를 찾는다. `file_is_generated`도 같은 방식으로 해결한다. 순전히 시각적인 변경은 템플릿이 아니라 공유 스타일시트에 속할 수 있다.
2. **제공된 파일에서 미리보기를 만든다**: `impeccable live-wrap`이 만드는 것과 같은 wrapper scaffold를, 브라우저가 로드한 파일에 직접 쓴다. 요소 자체는 원래 자리로 옮긴다. `<!-- impeccable-variants-start ID --><div data-impeccable-variants="ID" data-impeccable-variant-count="3" style="display: contents"><div data-impeccable-variant="original">THE ELEMENT, UNCHANGED</div><!-- Variants: insert below this line --></div><!-- impeccable-variants-end ID -->`. marker 뒤에 variant div를 넣고, `--reply EVENT_ID done --file <served file>`를 보낸다. original 슬롯은 절대 빼지 않는다. discard는 그 슬롯에서 요소를 복원하며, original 슬롯이 없는 wrapper는 거부한다. 이 편집은 임시다. 재생성이 이를 지워도 괜찮다.
3. **accept 시에는 진짜 소스에 쓴다**(accept는 생성된 파일을 거부하므로, 여기서 `_acceptResult.handled`는 보통 `false`다). 구조 변경이면 템플릿이나 컴포넌트 소스에, 시각만 바뀌면 알맞은 스타일시트에, 데이터에서 렌더링되는 콘텐츠면 데이터 소스나 렌더 로직에 쓴다. 그다음 제공된 파일에서 임시 wrapper를 제거한다.
4. **discard 시에는** 임시 wrapper만 제거한다.

## Accept 처리

이벤트: `{id, variantId, _acceptResult, _completionAck}`. poll 스크립트가 이미 `impeccable live-accept`를 결정적으로 실행하고 전달을 확인 응답했다. 브라우저 DOM도 이미 갱신되어 있다.

- accept 이벤트에는 `pageUrl`이 들어 있다. poll 스크립트는 이를 `impeccable live-accept --page-url PAGE_URL`로 넘겨서, accept 시점의 정리가 현재 페이지에 대해 대기 중인 copy 편집만 지우도록 해야 한다.
- `_completionAck.ok !== true`이면 아직 poll하지 않는다. `impeccable live-status` / `impeccable live-resume`을 실행하고, 필요하면 정리를 직접 마친 뒤 `impeccable live-complete --id EVENT_ID`를 실행한다.
- `handled: true, carbonize: false`이면 할 일이 없다. 다시 poll한다.
- `handled: true, carbonize: true`이면 아래의 필수 정리를 한다. `_acceptResult.todo`, `_completionAck.requiresComplete`, stderr 배너가 모두 이 정리를 가리킨다.
- `handled: false, mode: "fallback"`이면 세션이 생성된 파일에 있었던 것이다. Fallback Step 3에서 이미 진짜 소스를 썼다. 임시 wrapper를 정리하고 poll한다.
- `handled: false, mode: "error"`이면 **파일을 손으로 편집하지 않는다.** `source_locked`이면 publisher가 풀릴 때까지 같은 `impeccable live-accept` 명령을 다시 실행한다(멱등이다). `accept_receipt_conflict`이면 세션이 이미 `priorOperation`으로 해결된 것이므로, `impeccable live-status`를 실행하고 사용자에게 알린다. 그 밖의 경우에는 간단히 보고하고, 먼저 `impeccable live-status`를 실행한다.
- `mode` 없이 `handled: false`이면 수동 정리를 한다. 파일을 읽고, marker를 찾고, 편집한다.

### 필수 후속 작업 (carbonize)

`carbonize: true`는 채택된 변형이 helper marker와 인라인 CSS와 함께 소스에 끼워 넣어졌다는 뜻이다(브라우저가 틈 없이 렌더링하도록). 이 끼워 넣기는 임시다. 다른 무엇보다 먼저 영구적인 형태로 다시 써야 한다. 그렇지 않으면 죽은 `@scope` 규칙, wrapper div, marker 주석이 세션마다 쌓인다. 동기적으로 다섯 단계를 수행한 뒤 다음 poll을 한다.

1. `_acceptResult.file`에서 **carbonize 블록을 찾는다.** `<!-- impeccable-carbonize-start/end SESSION_ID -->`로 둘러싸여 있고 `data-impeccable-css` style 요소를 가진다. `<!-- impeccable-param-values -->` 주석이 있으면 먼저 읽는다. 3단계와 4단계를 이끈다.
2. **CSS 규칙을 옮긴다.** 주변 요소의 스타일을 이미 맡고 있는 프로젝트의 실제 스타일시트로 옮긴다.
3. **선택자를 다시 쓰면서 param 값을 굽는다.** `@scope ([data-impeccable-variant="N"])`를 실제 시맨틱 클래스로 바꾼다. 선택된 값과 맞는 `:scope[data-p-<id>="VALUE"]` 분기만 남긴다. `var(--p-<id>)`는 리터럴로 치환하거나 변수의 기본값을 갱신한다.
4. **채택된 내용을 감싸는 wrapper를 벗긴다.** 안쪽의 variant div를 삭제한다(JSX에서는 바깥쪽 `data-impeccable-carbonize` div도). `data-impeccable-params`와 모든 `data-p-*` 속성을 제거한다.
5. **삭제한다.** 인라인 `data-impeccable-css` style 요소, param-values 주석, carbonize marker 두 개, 채택되지 않은 변형의 `@scope` 규칙을 모두 지운다.

그다음 `impeccable live-complete --id SESSION_ID`를 실행하고, 다시 poll하기 전에 `phase: "completed"`를 확인한다. 이 명령은 형식적인 절차가 아니라 게이트다. live 모드의 잔여물이 하나라도 남아 있으면 `error: "source_dirty"`와 함께 발견 사항을 보고하며 거부한다. 고친 뒤 다시 실행한다(`--force`는 거짓 양성에만 쓴다).

## Discard 처리

이벤트: `{id, _acceptResult, _completionAck}`. poll 스크립트가 이미 원본을 복원하고 `discarded`를 확인 응답했다. `_completionAck.ok !== true`인 경우가 아니면 할 일이 없다. 그 경우에는 `impeccable live-complete --id EVENT_ID --discarded`를 실행하고 다시 poll한다.

## Steer 처리

이벤트: `{id, message, pageUrl}`. 전역 바의 Steer 컨트롤(입력 또는 음성)에서 온 페이지 수준의 지시이며, 요소 맥락이나 변형 순환은 없다. `message`를 읽고, 필요하면 페이지나 파일을 살펴본 뒤, 편집하거나 산문으로 답한다. 응답은 `.agents/skills/impeccable/scripts/impeccable live-poll --reply EVENT_ID steer_done ["Optional short toast"]`로 하고, 실패하면 `--reply EVENT_ID error "Short reason"`로 한 뒤 즉시 poll한다. 별도의 픽업 응답은 없다. Steer 바는 `steer_done` 또는 `error`에서 잠금이 풀린다.

## Prefetch 처리

이벤트: `{pageUrl}`. 경로마다 처음 선택될 때 한 번 발생한다. 사용자가 아직 읽지 않은 페이지에서 Go를 누를 가능성이 높다. 경로를 파일로 해석하고(루트 `/`는 보통 부팅 시의 `pageFile`이다. 여러 페이지 사이트는 `/foo`를 `public/foo/index.html`에 대응시키는 경우가 많다. SPA는 모든 경로를 하나의 entry에 대응시킨다), 읽은 뒤 다시 poll한다. `--reply`는 없다. 자신 있게 해석할 수 없으면 건너뛰고 poll한다.

## Manual edit apply 처리

이벤트: `{id, pageUrl, batch: {entries}, evidencePath?, chunk?, repair?, deadlineMs}`.

사용자가 이미 Apply를 눌렀다. 무엇을 할지 묻거나, 버리거나, Go로 돌려보내지 않는다. 부모 live 스레드가 foreground poll 루프를 유지하고, 최종 `/poll --reply --data`를 보낸다.

네이티브 subagent를 쓸 수 있으면 소스 편집을 `impeccable_manual_edit_applier` / `impeccable-manual-edit-applier`에 위임한다. cwd, scripts 경로, event id, 페이지 URL, chunk/deadline, `batch`, `evidencePath`, 정식 JSON 결과 스키마를 넘긴다. subagent는 poll하거나 응답하면 안 된다. 사용할 수 없으면 같은 계약으로 인라인 적용한다.

`deleted: true`와 `removeElement: true`를 가진 op는 브라우저의 Remove 배지다. 그 요소 전체를 소스에서 삭제한다. 자식까지 포함하며, 텍스트만 지우면 안 된다. `sourceHint`로 찾고, 그다음 `leaf.outerHTML`과 `originalText`로 찾아서, 정확히 그 요소의 소스 범위를 제거한다. 빈 wrapper, 고아 자식, 매달린 마크업을 남기지 않는다.

`repair`가 있으면, 이전 Apply가 소스를 바꿨지만 최종 검증에 실패했다는 뜻이다. 현재 소스를 고치고, 같은 정식 JSON 결과를 반환한다. 여러분이 직접 파일을 롤백하지 않는다. 롤백이 필요하면 브라우저가 사용자에게 먼저 묻는다.

소스 편집이 끝나면 `.agents/skills/impeccable/scripts/impeccable live-poll --reply EVENT_ID done --data '{"status":"done","appliedEntryIds":["8hexid"],"failed":[],"files":["src/page.html"],"notes":[]}'`로 정확히 한 번 응답한다. 모든 항목이 적용되지 않았다면 `status:"partial"` 또는 `status:"error"`와 `failed[]`를 쓴다. 그다음 다시 poll한다. event id 없이 응답하지 않는다. manual Apply에서 `--reply done --file ...`는 잘못된 형식이다.

## Exit

사용자는 채팅에서 말하거나, 탭을 닫거나(SSE가 끊기고, poll은 8초 뒤 `exit`를 반환한다), 브라우저의 exit 버튼을 눌러 live 모드를 끈다. `exit`를 받으면 아직 실행 중인 background poll을 종료한 뒤 정리한다.

## 정리

```bash
.agents/skills/impeccable/scripts/impeccable live-server stop
```

helper를 멈추고 `impeccable live-inject --remove`를 실행해 주입된 스크립트를 제거한다. 빠르게 다시 시작하려고 주입을 유지하려면 `stop --keep-inject`를 쓴다. `.impeccable/live/config.json`은 프로젝트 설정으로 남는다. 그다음 남아 있는 `impeccable-variants-start` wrapper와 `impeccable-carbonize-start` 블록을 검색해 제거한다.

## 최초 설정

`impeccable live`가 `config_missing` / `config_invalid`를 보고하거나, `configDrift`를 설명해야 하거나, 설정에 `cspChecked`가 없을 때에만 한다. [live-setup.md](live-setup.md)를 읽는다. 이 문서는 설정 스키마, 프레임워크별 `files` 표, 주입 adapter, drift 치유, CSP 감지와 동의 절차를 담당한다.
