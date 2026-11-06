# $impeccable hooks

현재 프로젝트의 **디자인 검출기 hook**을 관리합니다.

이 hook은 디자인과 관련 있는 파일 (`.tsx`, `.jsx`, `.html`, `.vue`, `.svelte`, `.astro`, `.css`, `.scss`, `.sass`, `.less`, `.ts`, `.js`)을 직접 편집할 때 impeccable 디자인 검출기를 실행합니다. Claude Code, Codex, Cursor, GitHub Copilot은 도구 사용 후 hook을 사용해 짧은 시스템 알림을 에이전트 문맥에 넣습니다. 발견 사항에는 수정 안내가 표시되고, 남은 문제에는 다시 알림이 가며, UI 성격의 파일이 깨끗하면 조용한 모드가 아닐 때 짧게 확인해 줍니다 (`hook.quiet` 설정). 일반 `.ts`와 `.js` 파일도 검사하지만 검출기에 발견 사항이 없으면 조용히 넘어갑니다. Grok Build는 같은 PostToolUse 검사를 실행해 수정된 파일을 표시하고 Stop 시점에 `additionalContext`로 발견 사항을 알립니다. Grok은 해당 stdout을 버리므로 파일을 편집할 때마다 알림을 기대하지 않습니다.

검출기 규칙은 두 단계로 실행됩니다. 편집 후 hook은 즉시 수정할 가치가 있는 기계적이고 명확한 문제만 먼저 보여줍니다. 예를 들어 이미지 손상, 콘텐츠 넘침, 대비 및 가독성 실패, 그라데이션 텍스트, 발광 그림자, 디자인 시스템 이탈 등입니다. 나머지 (문구 리듬, 팔레트와 타이포그래피 취향, 레이아웃 리듬)는 Stop hook 이벤트에서 전체 규칙 세트를 실행하는 심층 검사까지 미룹니다. 이 검사는 세션에서 수정한 모든 UI 파일을 훑고 편집 후 검사에서 이미 보고한 항목을 중복 제거해 남은 내용을 한 번에 알려줍니다. 더 보고할 내용이 없는 세션은 조용히 끝납니다. 매 편집마다 전체 규칙 세트를 적용하려면 `.impeccable/config.json`에서 `hook.perEditRules`를 `"all"`로 설정합니다. Stop 심층 검사는 네이티브 `Stop` hook 이벤트를 전달하는 Claude Code, Codex, Grok Build에 연결되어 있습니다. Cursor에는 적용되지 않습니다 (`stop` hook은 후속 사용자 메시지에만 답할 수 있음). GitHub Copilot의 stop 유형 이벤트는 모델에 문맥을 다시 전달하지 않으므로 두 환경은 매 편집마다 전체 검출기를 실행합니다. Grok은 `end_turn` 뒤에 `reason: "shutdown"`인 관찰 전용 Stop도 발생시키므로 이는 건너뛰고 `end_turn`에서만 검사합니다.

모든 hook 검사는 기계적 검사입니다. 스캐너가 잡지 못하는 세심한 판단은 UI를 수정하기 전에 Skill에서 불러오는 [craft-floor.md](craft-floor.md)에 있으므로 hook 연결 여부와 관계없이 적용됩니다. 자동 hook이 없는 세션은 `impeccable context`가 마지막에 검출기를 한 번 실행하라고 `MANUAL_DETECTOR_REQUIRED` 지시를 제공합니다.

이 명령은 `.impeccable/config.json` (통합 Impeccable 설정)을 편집해 **프로젝트 단위로** hook을 켜고 끕니다. 런타임 설정은 `hook` 아래, 공통 검출기 제외 항목은 `detector` 아래에 있습니다. CLI가 기록하는 설치 동의 결정 (`hook.consent`)을 비롯한 개발자별 재정의는 Git에서 제외되는 `.impeccable/config.local.json`에 둡니다. `hook.enabled: false`로 hook을 끄고, `hook.quiet: true`로 깨끗함 / 보류 상태 확인 메시지를 숨기며, `hook.auditLog`에 NDJSON 로그 파일 경로를 지정할 수 있습니다. 기존 환경 변수 `IMPECCABLE_HOOK_DISABLED`, `IMPECCABLE_HOOK_QUIET`, `IMPECCABLE_HOOK_LOG`도 계속 지원하며 설정되면 config 값을 덮어씁니다.

프로젝트가 Blade, Twig, ERB, Handlebars 파일을 사용하는 경우 서버 템플릿 확장은 **`detector.extensions` 아래에 선언**해야 합니다. 기본 확장자 목록에 없으므로 설정하지 않으면 hook이 건너뜁니다. 확장자마다 한 항목을 둡니다: `{ "ext": ".blade.php", "engine": "html" }`. `engine`은 분석기 (`html`은 마크업 템플릿, `text`는 JS / TS / CSS 계열 파일)를 선택하며 기본값은 `html`입니다. 파일명 끝과 비교하므로 `.blade.php`, `.html.erb` 같은 복합 확장자도 지원합니다. config는 확장자만 추가하며 기본 목록은 항상 적용됩니다.

수동 `.agents/skills/impeccable/scripts/impeccable detect` 검사도 기본적으로 같은 프로젝트 필터 설정을 사용합니다: `detector.ignoreRules`, `detector.ignoreFiles`, `detector.ignoreValues`, `detector.designSystem.enabled`. `hook.enabled`는 자동 hook 실행만 제어하며 수동 CLI 검사에는 영향을 주지 않습니다. 프로젝트 설정과 문맥을 무시하고 원시 검출기만 실행하려면 `.agents/skills/impeccable/scripts/impeccable detect --no-config ...`를 사용합니다. 같은 검출기 제외 항목을 CLI로 직접 CRUD 하려면 `.agents/skills/impeccable/scripts/impeccable ignores ...`를 사용합니다.

지원 하네스: Claude Code (프로젝트 범위 설치는 `.claude/settings.local.json`, 사용자 범위는 `~/.claude/settings.json`; 프로젝트 hook을 공용 `.claude/settings.json`으로 옮겨도 해당 위치에서 인식), Codex (프로젝트의 `.codex/hooks.json`), Cursor (프로젝트의 `.cursor/hooks.json`), Grok Build (프로젝트의 `.grok/hooks/impeccable.json`; `/hooks-trust` 또는 `--trust` 필요), GitHub Copilot (Copilot CLI와 클라우드 에이전트가 읽는 프로젝트의 팀 공유 커밋 파일 `.github/hooks/impeccable.json`). Copilot CLI는 저장소 기본 브랜치에 `.github/hooks/impeccable.json`이 커밋된 뒤 프로젝트 hook을 실행합니다.

**Cursor**에서는 hook이 `Write` 도구의 `postToolUse`에서 실행됩니다 (에이전트의 각 파일 쓰기). 알림은 `additional_context`로 반환되며 Cursor가 도구 결과 뒤에 추가합니다. 이전에 설정된 프로젝트는 쓰기 전에 잘못된 내용을 차단하던 `preToolUse` 게이트 (`hook-before-edit`)를 사용했을 수 있습니다. `hooks on`, `impeccable update`, `impeccable doctor --fix` 중 하나가 항목을 `postToolUse`로 옮기기 전까지 기존 게이트도 작동합니다.

Gemini는 기존 설정과 병합해 `.gemini/settings.json`에 세션 및 완료 hook을 설치합니다 (주석은 허용됩니다. 주석이 있는 파일을 다시 쓰기 전 `settings.json.bak`으로 백업하고, 유효한 JSON이 아니면 그대로 둡니다). 편집 후 검출기 hook은 설치하지 않습니다. `BeforeTool` hook은 `build-phase`를 실행하는 셸 명령만 다시 씁니다. macOS와 Linux에서만 지원되며, Gemini가 PowerShell로 hook을 실행하는 Windows에서는 세션 id가 셸에 전달되지 않아 빌드 컴파일이 세션과 연결되지 않고 완료 알림도 조용히 넘어갑니다.

## 라우팅

첫 번째 인자는 동작입니다. 기본값은 `status`입니다.

| 동작 | 기능 |
|---|---|
| `status` | 현재 상태, 공용 / 로컬 설정 경로, 제외된 규칙 / 파일 / 값, 환경 변수 재정의 여부를 출력합니다. |
| `on` | `.impeccable/config.json`에서 `enabled: true`로 설정하고 로컬 hook 동의를 허용으로 기록하며 Skill이 설치된 경우 provider hook manifest를 설치 / 복구합니다. |
| `off` | `.impeccable/config.json`에서 `enabled: false`로 설정합니다. |
| `ignore-rule <id>` | `<id>`를 `detector.ignoreRules`에 추가합니다. `overused-font`는 `--all-values`가 필요합니다. 프로젝트 전체에서 해당 규칙을 억제합니다. |
| `ignore-file <glob>` | `<glob>`을 `detector.ignoreFiles`에 추가합니다. 일치하는 파일의 **모든 규칙**을 억제합니다. |
| `ignore-value <id> <value> [--shared] [--reason "..."]` | 규칙 / 값 제외를 공용 `.impeccable/config.json`에 추가합니다. |
| `ignore-value <id> <value> --local [--reason "..."]` | 비공개 규칙 / 값 제외를 `.impeccable/config.local.json`에 추가합니다. |
| `ignore-value <id> "*" --file <glob> [--file <glob>...]` | 지정한 파일에서만 규칙 하나를 끄고 다른 곳에서는 계속 적용합니다. `--file`을 반복하거나 `--file=<glob>` / `--files=<glob>`을 사용할 수 있습니다. `--file` 없이 단독 `"*"`를 쓰면 거부됩니다. 프로젝트 전체를 대상으로 하려면 정말 의도한 경우 `ignore-rule <id>`를 사용합니다. |
| `reset` | 프로젝트 config, 중복 제거 캐시, Cursor 보류 큐를 삭제하고 `on`이 설치한 모든 provider manifest에서 hook 항목을 제거합니다. 커밋된 Copilot 파일도 포함됩니다 (단, `on`이 쓰지 않는 팀 공유 `settings.json`은 건드리지 않음). |

## 흐름

1. 사용자 인자에서 동작을 확인합니다. 동작을 지정하지 않았으면 `status`를 기본으로 사용합니다.
2. 관리 스크립트를 실행하고 출력을 수정 없이 전달합니다.

   ```bash
   .agents/skills/impeccable/scripts/impeccable hooks <action> [args...]
   ```

3. `<action>`이 `off`면 한 줄로 다음을 덧붙입니다: “완료했습니다. `$impeccable hooks on`을 실행할 때까지 이 프로젝트의 새 편집에서는 디자인 hook이 작동하지 않습니다.”
4. `<action>`이 `on`이면 다음을 덧붙입니다: “완료했습니다. 다음에 UI 파일을 Edit / Write하면 디자인 hook이 실행됩니다.”
5. `<action>`이 `ignore-value`, `ignore-file`, `ignore-rule`이면 스크립트 출력을 그대로 표시합니다. 기본 범위는 공용 `.impeccable/config.json`이며 비공개 예외를 사용자가 명시적으로 요청했을 때만 `--local`을 추가합니다.
6. `<action>`이 `status`면 스크립트 출력만 표시합니다. 사용자가 후속 질문을 하지 않는 한 부연하지 않습니다.

## 발견 사항 분류

hook 자체는 제외 설정을 쓰지 않습니다. 예외는 모두 `impeccable hooks`를 통해 추가합니다. 각 발견 사항을 다음 세 가지 중 하나로 분류합니다.

- **실제 디자인 문제**: 수정합니다. 수정 대신 제외 항목을 추가하거나 차단된 쓰기를 통과시키기 위해 ignore를 만들지 않습니다.
- **확신할 수 있는 거짓 양성 또는 허용된 예외**: 가장 좁은 범위의 ignore를 직접 저장하고 답변에서 밝힙니다. 명명할 수 있는 근거가 있어야 합니다: 의도적인 데모나 fixture, 나쁜 디자인을 보여주는 문서, 문자 그대로의 동작 또는 도메인에 맞는 움직임 (튀는 공), 사용자가 이미 확인한 선택 등. 근거를 `--reason`에 `"<결정 주체: 근거>"` 형식으로 남깁니다. 사용자가 실제로 확인했을 때만 “사용자 확인”이라고 씁니다.
- **확신할 수 없음**: 발견 사항을 유지하고 한 줄로 사용자에게 묻습니다. 나중에 편집 때마다 hook이 다시 실행되는 것보다 한 줄 질문이 낫습니다.

자체 판단으로 처리할 수 있는 범위는 `ignore-value`까지입니다. `ignore-file`과 `ignore-rule`은 너무 많은 검사를 억제하므로 임의로 추가하지 말고 먼저 사용자에게 묻습니다.

가장 좁은 예외를 우선 사용합니다.

- 발견 메시지에 `ignore-value <rule> <value>` 쌍이 있으면 그 값을 `--reason`과 함께 `impeccable hooks ignore-value`로 전달합니다. 기본값은 공용 `.impeccable/config.json`에 저장됩니다.
- `overused-font`, `bounce-easing` 같은 특정 값 발견에는 해당 값을 대상으로 `ignore-value`를 사용합니다. 특정 글꼴 하나에 `ignore-rule overused-font`를 쓰지 않습니다.
- `side-tab`처럼 값별 명령이 없다면 그 규칙 하나를 해당 파일에 한정합니다: `ignore-value <id> "*" --file <path>`. 먼저 `.agents/skills/impeccable/scripts/impeccable detect <path>`를 실행해 실제로 어떤 규칙이 발생하는지 확인합니다.
- `ignore-file <path>`는 fixture, 생성 산출물, 의도적인 엉성한 디자인 시연 등 파일 전체가 디자인 검토 범위 밖일 때만 사용합니다. 미래에 추가될 규칙까지 포함해 해당 파일의 모든 규칙을 영구적으로 억제합니다. 한 규칙만 시끄러운 실제 UI라면 위의 파일 한정 값 제외를 사용합니다.
- `ignore-rule <id>`는 사용자가 프로젝트 전체에서 규칙 하나를 억제하라고 요청한 경우에만 사용합니다. 일반적으로 과다 사용된 글꼴을 제외하려면 사용자가 전체적으로 무시해 달라고 요청했을 때만 `ignore-rule overused-font --all-values`를 사용합니다.
- 기본적으로 config ignore (위의 명령)를 사용합니다. 제외 항목을 한곳에서 검토할 수 있습니다. 한 파일만 저장소 밖으로 옮겨야 하는 경우 (생성 / 내보낸 단독 문서, 이메일로 보내는 HTML 파일)에만 인라인 주석을 사용합니다. 지원 표기는 `impeccable-disable <rule>` (파일 전체), `impeccable-disable-line` / `impeccable-disable-next-line` (한 줄)이며, 어떤 주석 문법에서도 쓸 수 있고 `:` 또는 `--` 뒤에 이유를 덧붙일 수 있습니다. 검출기는 기본적으로 이를 인식하며 `--no-inline-ignores` 또는 `--no-config`로 우회할 수 있습니다.

값별 예외:

```bash
.agents/skills/impeccable/scripts/impeccable hooks ignore-value overused-font Inter --shared --reason "User confirmed Inter is intentional"
```

근거를 명시하는 자체 판단 예외:

```bash
.agents/skills/impeccable/scripts/impeccable hooks ignore-value bounce-easing bounce-ball --shared --reason "Agent: literal ball-bounce animation, bounce easing is the subject"
```

글꼴 규칙 전체 예외:

```bash
.agents/skills/impeccable/scripts/impeccable hooks ignore-rule overused-font --all-values --reason "User asked to ignore overused fonts generally"
```

나머지 규칙은 검토할 파일에 한 규칙만 제외:

```bash
.agents/skills/impeccable/scripts/impeccable hooks ignore-value design-system-font-size "*" --file "src/overlay/widget.js" --reason "Injected widget builds its own type scale; DESIGN.md's ramp describes the site"
```

파일 전체가 검토 범위 밖인 경우:

```bash
.agents/skills/impeccable/scripts/impeccable hooks ignore-file "src/legacy/Card.tsx"
```

## 제약

- 이 명령에서 `.impeccable/config.json`이나 `.impeccable/config.local.json`을 직접 수정하지 않습니다. 쓰기 검증과 파일 구조 일관성을 위해 항상 `impeccable hooks`를 거칩니다. 예외는 관리 동작이 없는 `detector.extensions`입니다. 사용자가 템플릿 스택을 다루도록 요청하면 `.impeccable/config.json`의 해당 필드 하나만 직접 편집하고 나머지는 그대로 둡니다.
- 이 흐름에서 `impeccable hook`과 `impeccable hook-before-edit` 뒤의 실행기나 바이너리를 수정하지 않습니다. 이는 Skill 배관 코드입니다.
- hook은 편집을 차단하지 않으며 편집 후 알림을 제공합니다. (기존 `preToolUse` 게이트를 쓰는 Cursor 프로젝트는 manifest를 옮길 때까지 쓰기를 차단할 수 있습니다.) hook을 끄면 알림이 중단됩니다.
- hook은 Impeccable Skill에 포함되어 있습니다. 프로젝트 설치 경로는 `.claude/settings.local.json`, `.codex/hooks.json`, `.cursor/hooks.json`, `.github/hooks/impeccable.json`, `.gemini/settings.json`입니다. 사용자 범위 Claude 설치는 `~/.claude/settings.json`을 사용합니다. Codex에서는 처음에 사용자가 `/hooks`로 hook을 승인해야 합니다. Cursor에서는 Settings -> Hooks에서 hook이 활성화됐는지 확인합니다. GitHub Copilot CLI는 `.github/hooks/impeccable.json`이 저장소 기본 브랜치에 커밋되면 읽으며 클라우드 에이전트는 저장소에서 직접 읽습니다.

## 실패 상황

- `.impeccable/config.json` 또는 `.impeccable/config.local.json`을 읽을 수 없거나 형식이 잘못된 경우 hook은 해당 파일을 무시하고 남은 유효 설정 / 기본값을 사용합니다. `impeccable hooks status`에서 잘못된 파일이 무시되었음을 확인할 수 있습니다.
- 사용자가 전역적으로 “hook을 꺼 달라”고 요청하면 `$impeccable hooks off`를 우선 안내합니다 (현재 프로젝트에서 지속 적용되며 config에 `hook.enabled: false`를 기록). 기존 환경 변수 `IMPECCABLE_HOOK_DISABLED=1`도 셸을 따르는 일회성 재정의로 사용할 수 있습니다.
