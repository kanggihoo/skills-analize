> **추가로 필요한 맥락**: 요청에서 대상을 하나로 특정할 수 없는 경우에만 대상 요소를 확인합니다.

Generate는 live 모드로 빠르게 들어가는 방법입니다. 사용자가 한 문장으로 요소, 방향, 개수를 지정하면 1분 안에 브라우저에서 변형을 순환할 수 있습니다. 명령 하나로 도우미를 시작하고 이미 harness가 표시 중인 페이지의 overlay에 요소를 전달합니다(페이지를 해당 요소까지 스크롤하고 선택한 뒤 클릭과 동일한 Go를 실행). 그러면 generate 이벤트가 반환됩니다. 편집 한 번으로 변형을 작성하고, 호출 한 번으로 응답을 보내 사용자 선택을 기다립니다. 도우미가 선택한 버전을 소스에 직접 반영합니다. 이 문서는 진입 경로의 배관만 다룹니다. 이벤트부터 디자인 작업은 변경 없이 [live.md](live.md)의 책임입니다. 이번 세션에서 아직 읽지 않았다면 지금 전체를 읽습니다.

**웹 전용입니다.** Live 모드 브라우저 overlay는 네이티브 대체 기능이 없습니다. `ios` / `android` / `adaptive` 프로젝트에서는 이 명령을 거절하고 소스에서 `bolder` 또는 `quieter`를 사용하도록 제안합니다.

시간 절약은 배관에서 이뤄집니다. 명령 하나로 현재 harness가 표시 중인 페이지에서 세션을 시작하고 호출 한 번으로 응답을 보내 기다리면 되므로 브라우저를 직접 살펴볼 필요가 없습니다. 디자인 작업 자체가 빨라지는 것은 아닙니다. 설정은 모든 명령에서처럼 진행합니다(`impeccable context`, 이 참조, 수정 전 craft-floor.md). 변형 계획, 작성, 승인은 live 세션과 같은 절차를 따릅니다.

이 명령이 잘못 동작할 수 있는 알려진 경우를 세 가지 금지사항으로 막습니다.

- **`init`이나 `document`를 실행하지 말고 PRODUCT.md나 DESIGN.md도 요청하지 않습니다.** 파일이 있으면 시작 명령이 `boot` 아래에 출력하므로 사용합니다. 없으면 그렇다고 알립니다(`contextMissing`, `contextNote`). 3단계에서 이벤트를 근거로 정체성을 추출합니다. 파일이 없다는 이유로 이 명령 안에서 사용자에게 맥락 인터뷰를 하지 않습니다. 세션이 끝난 뒤 한 줄로 `init`을 제안할 수 있습니다.
- **변형 wrapper를 직접 쓰거나 session id를 만들지 않습니다.** session id(8자리 16진수)는 브라우저에서만 만들 수 있으며 Go 이벤트 때 발급됩니다. 이벤트가 없으면 2단계를 다시 실행해야 합니다. 소스를 직접 수정해 만들지 않습니다.
- **파일에 live marker가 있는 동안 hook 발견 사항을 처리하거나 이를 만족시키려고 변형 스타일을 바꾸지 않습니다.** accept는 변형이 영구 반영된 뒤 파일을 검증합니다.

## 1단계: 요청 해석

세 요소를 모두 사용자 문장에서 정합니다.

- **요청에 있는 숫자**: 그 숫자가 개수입니다. 숫자가 없으면 3입니다. 프로토콜 상한은 8입니다.
- **방향 표현**은 live action 어휘로 대응합니다. 새 action 값을 만들지 않습니다.
  - **bold, bolder, stronger, punchier**: `bolder`
  - **quiet, calmer, softer, toned down**: `quieter`
  - **simpler, minimal, stripped**: `distill`
  - **refined, tightened, polished**: `polish`
  - **font와 type 관련 표현**: `typeset`
  - **색상 표현**: `colorize`
  - **배치와 간격 표현**: `layout`
  - **기기와 중단점 표현**: `adapt`
  - **모션 표현**: `animate`
  - **장난스러운 표현**: `delight`
  - **규칙을 깨는 표현**: `overdrive`
  - **의도는 있지만 지정 어휘가 없는 표현**(“은행처럼 느껴지게”, “더 따뜻하게”, “더 고급스럽게”): `impeccable`을 사용하고 사용자의 표현을 prompt로 전달
  - **동작이 지정됐고 다른 의도도 포함됨**(“흑백은 유지하면서 더 대담하게”): 해당 동작을 선택하고 나머지를 prompt로 전달
  - **방향 표현이 전혀 없음**(“더 좋게”, “개선”, “더 예쁘게”, “다르게”, “신선하게”, “새롭게”, “재설계”, “수정”, “선택지 몇 개”, “아이디어”, “대안”, 방향을 말하지 않고 “variants”라고만 함): 사용할 수 있다면 Codex의 구조화된 사용자 입력 / 질문 도구로 묻고, 없으면 채팅에서 답을 받은 뒤 계속합니다. 한 번만 질문하고 다음 어휘를 제공합니다. *“어느 방향으로 변형할까요? bolder, quieter, simpler (distill), polished, typography (typeset), color (colorize), layout, motion (animate), playful (delight), or rule-breaking (overdrive).”* “놀라게 해 주세요”, “알아서 하세요”처럼 답이 여전히 열려 있다면 사용자의 원래 표현을 prompt로 삼아 `impeccable`을 사용하고 답을 받은 뒤 2단계를 시작합니다.
- **요소 설명**(“가격 카드”, “hero 제목”): 2단계에서 selector를 찾습니다.

사용자가 방향을 명시하지 않은 경우 질문으로 결정한 action, 1~8 사이 개수, 요소 설명을 확보하면 완료입니다.

## 2단계: 페이지 재사용 후 시작

이미 실행 중인 개발 서버와 harness가 보여주는 탭을 **재사용**합니다. 서버나 브라우저 창을 추가로 띄우면 이 단계를 어긴 것입니다.

1. **개발 서버를 가장 저렴한 근거부터 찾고 처음 발견하는 곳에서 멈춥니다**: 사용자 메시지, 앱이 이미 열린 브라우저 탭(Claude Code에서는 `tabs_context`의 origin), harness가 시작한 서버(Claude Code에서는 `preview_list`), URL을 출력한 terminal. origin을 `--dev-url`로 사용합니다. **발견하지 못하면** `--dev-url`을 생략하고 wait 없이 시작 명령을 실행합니다. 부팅 확인이 실행 중인 서버를 탐색하고 결과가 다음 동작을 알려줍니다. `browser_needed`에는 찾은 `devUrl`이 있으므로 2단계대로 페이지를 연 뒤 `--dev-url <devUrl> --wait-for-browser 60000`으로 다시 실행합니다. `no_dev_server`는 앱을 제공 중인 서버가 없다는 뜻입니다. 결과의 지침대로 개발 스크립트를 시작합니다(Claude Code: `preview_start`; Cursor: 백그라운드 terminal; Codex: yield하는 exec). URL이 나오면 `--dev-url <url>`로 다시 실행합니다.
2. **요소가 렌더링되는 페이지를 브라우저에서 연 다음 시작합니다.** 요청에 경로가 있으면 그 경로, 아니면 `--target`이 제공하는 경로를 사용합니다. `--dev-url`에는 origin만 지정합니다.
   - **Cursor**(`browser_navigate`)와 **Claude Code**(`navigate`: Browser pane이 닫혔으면 열고, 해당 origin에 이미 열린 탭이 있으면 `tabs_context`의 `tabId` 사용): URL을 열고 `--dev-url <url> --wait-for-browser 60000`으로 시작 명령을 실행합니다. 명령이 기다리는 동안 부팅이 overlay를 주입하고 페이지를 새로고침해 overlay 상태로 들어갑니다. 이 harness에서는 브라우저 도구로만 페이지를 엽니다. 엔진이 `--open`을 무시합니다.
   - **브라우저 도구가 없는 경우**(Codex 등): `--open --wait-for-browser 120000`으로 시작 명령을 실행합니다. 시스템 브라우저를 열고 사용자가 탭을 찾는 시간까지 고려해 기다립니다. **`browser_open_failed`가 반환됨**: `url`을 한 줄로 알려준 뒤 `--wait-for-browser 120000`으로 다시 실행합니다.

```bash
.agents/skills/impeccable/scripts/impeccable live-generate --target src/App.jsx --dev-url http://127.0.0.1:5173/ --selector ".pricing-grid" --action bolder --count 3 --boot --wait-for-browser 60000
```

Cursor와 Claude Code에서는 foreground로 실행합니다(대기 시간 안에 반환). Codex에서는 3단계의 poll 명령처럼 yield하는 exec에서 실행합니다.

- `--target`: 요청이나 프로젝트 맥락에서 요소를 렌더링하는 파일이 분명할 때 사용하고, 아니면 생략
- `--dev-url`: 1단계에서 찾은 origin. 찾지 못했다면 생략하고 부팅 검사에 맡김
- `--selector`: 고유 class를 우선하고, 다음은 landmark tag + class, 마지막으로 id를 사용합니다(각 변형이 복사 요소를 mount하므로 id는 DOM에서 반복됨). 요청에서 여러 개 있는 컴포넌트를 가리키면(“가격 카드들”) 모든 인스턴스를 공통 스타일링할 수 있도록 묶음을 담은 컨테이너를 선택합니다. selector가 분명하지 않을 때만 요소를 렌더링하는 소스 파일을 한 번 읽습니다. 확신이 없다면 `--dry-run`으로 서버를 시작하지 않고 selector를 확인합니다.
- `--boot`: lane의 부팅 절차를 실행합니다(헬퍼가 PRODUCT.md와 DESIGN.md를 다시 불러옴. 파일 누락은 허용. dev URL 확인. 헬퍼 실행 중 하단 바 숨김). 이미 실행 중인 헬퍼를 재사용합니다. 결과는 `boot`에 포함됩니다.
- 선택적으로 `--prompt`, `--text`(보이는 텍스트에 snippet이 포함된 항목만 선택), `--index`(일치 항목에서 1부터 시작하는 순번)를 사용할 수 있습니다.

출력은 `boot`(또는 `boot.contextMissing`과 `boot.contextNote`; 해당 안내에 따라 페이지가 기준이 됨), 다음 `event`, `sessionId`의 generate 이벤트 순으로 읽습니다. 이 이벤트에는 사용자가 Go를 눌렀을 때와 같은 `_instructions`가 있습니다. 각 결과 verdict에는 `_instructions`가 포함되며 기억보다 우선합니다. 다음은 직접 판단할 이동입니다.

- **`ambiguous`**: 후보가 나열됩니다. 공통 컨테이너를 대상으로 하거나 `--text "<visible text>"` 또는 `--index <n>`으로 다시 실행합니다.
- **`dev_server_gone`**: 명령이 페이지 응답을 기다리는 동안 개발 서버가 응답을 멈췄습니다(Cursor에서는 다른 대화가 시작한 서버가 대화 종료와 함께 꺼질 수 있음). 결과가 안내하는 방법으로 시작한 다음 `--dev-url <url>`로 다시 실행합니다.
- **`no_match`**: 탭의 경로에서 요소가 렌더링되지 않습니다(올바른 경로로 이동하고 다시 실행). 또는 selector가 틀렸습니다(소스에서 더 나은 selector를 찾거나 `--text` 추가).
- `bootError`의 **`config_missing` / `config_invalid`**: [live-setup.md](live-setup.md)를 먼저 따르고 다시 실행합니다.
- **`event: null`과 `ok: true`**: wait 시간 안에 이벤트가 오지 않았습니다. `.agents/skills/impeccable/scripts/impeccable live-poll`을 한 번 실행해 가져온 다음 계속합니다.

서버를 최대 한 번, 탭을 직접 최대 한 번 연 상태에서 `ok: true`, `sessionId`, `event`를 확보하면 완료입니다.

## 3단계: 생성

이 이벤트는 표준 `generate` 이벤트입니다. 선택된 요소의 맥락, 사전 검사된 scaffold, action의 참조 문서, 계획 절, 정확한 splice 위치를 명시하는 `_instructions`가 포함됩니다. live.md의 **Handle generate**를 정확히 따릅니다. 거기에 적힌 대로 action 참조 문서와 craft-floor.md를 읽고 4절에 따라 계획합니다(정체성 우선, 이어서 mode, 서로 다른 주요 축 세 가지, 마지막으로 눈을 가늘게 뜨는 검사). 7절의 knob를 선언하고 6절에 따라 전달합니다(각 변형마다 완전한 요소 대체, 미리보기 CSS, scaffold의 splice에 포함한 모든 변형을 한 번에 작성). 일반 live 세션에서 해당 요소에 적용하는 변경 가능성은 그대로 열려 있습니다. 더 나은 단계, 재구성된 묶음, 순서를 바꾼 카드, 다른 surface 등이 가능합니다. **페이지 스크린샷은 찍지 않습니다.** 사용자의 검토 경로는 accept될 때까지 overlay 미리보기입니다.

작성한 파일과 함께 **한 번의 호출로 응답하고 기다립니다.**

```bash
.agents/skills/impeccable/scripts/impeccable live-poll --reply EVENT_ID done --file src/App.jsx --then-poll
```

이 명령은 done으로 응답해 변형을 브라우저에 표시한 다음 사용자 선택이 올 때까지 기다립니다. harness의 긴 대기 방법을 따릅니다. **Claude Code**에서는 가장 긴 timeout(600000 ms)으로 foreground 실행해 사용자가 선택할 때까지 멈춰 있습니다. **Codex**에서는 yield하는 foreground exec로 실행합니다. **Cursor**에서는 백그라운드 terminal에서 실행하고 `"type":"(accept|discard|variant_mount_failed|exit)"`가 오면 알립니다. 짧은 `--timeout=`을 전달하지 않습니다. `{"type":"timeout"}`은 사용자가 아직 선택하지 않았다는 뜻입니다. `live-poll`을 다시 실행하고 계속 기다립니다. 편집이 실패해 브라우저가 GENERATING 상태로 바뀌었다면 `--reply EVENT_ID error "Short reason"`( `--then-poll` 없이)을 실행해 바를 초기 상태로 되돌립니다.

그런 다음 사용자가 변형을 사용할 위치를 한 문장으로 안내합니다. 예: *“세 가지 [bolder] 변형을 [가격 카드]에 띄웠습니다. floating bar의 화살표로 넘기고 Tune knob를 조절한 뒤 원하는 안을 Accept하세요.”*

교체 경로 외의 경우에는 동작하기 전에 해당 live.md 섹션을 읽습니다. `scaffold.previewMode: "svelte-component"`(Svelte 미리보기는 컴포넌트로 편집하고 accept는 기계적으로 수행됨), `mode: "insert"`, `variant_mount_failed`, `steer`, `manual_edit_apply`, `fallback: "agent-driven"` wrapper 오류에 해당합니다.

## 4단계: 승인 및 종료

3단계 호출이 반환되면 사용자 선택을 처리합니다. **`discard`**: 별도 조치 없음. **`accept`**: `_acceptResult.carbonize: true`가 일반적인 경우이며 live.md의 **Required after accept**를 변경 없이 따릅니다. 채택한 변형 규칙을 해당 요소를 이미 소유한 stylesheet로 옮기고 실제 selector를 씁니다. 선택된 knob 값으로 고정하고 요소 wrapper를 제거하며 모든 `data-impeccable-*` 속성을 지웁니다. 인라인 `<style>` 블록과 양쪽 `impeccable-carbonize` marker를 제거합니다. 그 뒤 `.agents/skills/impeccable/scripts/impeccable live-complete --id SESSION_ID`를 실행해 `phase: "completed"`인지 확인합니다. `baked: true`는 `--bake`로 accept했을 때만 표시됩니다. 이 경우 헬퍼가 이미 변형을 영구화했으므로 `live-complete`은 필요하지 않습니다.

선택을 처리한 즉시 요청 없이 종료합니다.

```bash
.agents/skills/impeccable/scripts/impeccable live-server stop
```

종료 명령은 주입 스크립트를 제거하고 페이지를 한 번 새로고침합니다. 사용자는 overlay chrome 없이 자신의 개발 서버에서 제공하는 승인 디자인을 봅니다. **사용자가 시작한 경우를 포함해 개발 서버를 종료하거나 재시작하지 않습니다.**

- **종료 전에 사용자가 더 많은 변형을 요청함**: 종료를 건너뛰고 다음 요소에 대해 2단계를 다시 실행합니다(헬퍼 재사용). 마지막 선택 뒤 종료합니다.
- **상태가 끊겼거나 확실하지 않음**: `.agents/skills/impeccable/scripts/impeccable live-status`, 다음 `live-resume`을 실행합니다. `.impeccable/live/sessions/`의 journal이 기준 상태입니다.

헬퍼가 종료되고 개발 사이트가 승인된 디자인을 보여주며 계속 응답하면 완료입니다.
