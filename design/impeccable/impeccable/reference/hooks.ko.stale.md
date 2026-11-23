# $impeccable hooks

현재 프로젝트의 **design detector hook**을 관리한다.

이 hook은 설계와 관련된 파일(`.tsx`, `.jsx`, `.html`, `.vue`, `.svelte`, `.astro`, `.css`, `.scss`, `.sass`, `.less`, `.ts`, `.js`)을 직접 편집할 때 impeccable design detector를 실행한다. Claude Code, Codex, Cursor, GitHub Copilot은 post-tool-use hook을 쓰며, 편집 뒤 짧은 system reminder를 에이전트 컨텍스트에 넣는다. 발견 사항에는 수정 안내 프롬프트가 붙고, 아직 해결되지 않은 문제에는 다시 알림이 가며, 이상이 없는 UI 파일에는 짧은 확인(ack)이 붙는다. 단, quiet 모드(config의 `hook.quiet`)가 켜져 있으면 확인은 생략한다. 일반 `.ts`와 `.js` 파일도 검사하지만, detector가 무언가를 찾지 않으면 조용히 넘어간다. Grok Build는 PostToolUse 검사로 변경된 파일을 표시한 뒤, 발견 사항을 Stop의 `additionalContext`로 보여 준다. Grok에서는 편집마다 알림이 오지 않는다. Grok이 그 stdout을 버리기 때문이다. Hermes Agent에서는 편집별 발견 사항이 `write_file` 또는 `patch` 도구 결과 안의 `impeccable` 필드로 들어온다.

detector 규칙은 두 단계로 실행된다. 편집별 hook은 즉시 단계(immediate tier)의 규칙만 보여 준다. 이는 편집을 끊고 알릴 만한, 기계적으로 명확하고 모호하지 않은 문제다. 예를 들어 깨진 이미지, 넘치는 콘텐츠, 대비와 가독성 실패, 그라디언트 텍스트, glow 그림자, 디자인 시스템 drift가 여기에 든다. 나머지(카피 리듬, 색과 타이포그래피 취향, 레이아웃 리듬)는 `Stop` hook 이벤트의 deep pass로 미룬다. 이 단계는 세션에서 건드린 모든 UI 파일에 전체 규칙 세트를 실행하고, 편집별 pass가 이미 보고한 내용과 중복되지 않게 걸러서 남은 발견 사항을 한 번만 보여 준다. 보고할 것이 없는 세션은 조용히 끝난다. `.impeccable/config.json`에서 `hook.perEditRules`를 `"all"`로 설정하면 편집마다 전체 규칙 세트를 다시 쓴다. Stop deep pass는 네이티브 `Stop` hook 이벤트를 보내는 Claude Code, Codex, Grok Build와, 플러그인이 `pre_verify`에서 이벤트를 보내는 Hermes Agent에 연결되어 있다. Cursor에는 deep pass가 없다. Cursor의 `stop` hook은 후속 사용자 메시지로만 응답할 수 있기 때문이다. GitHub Copilot의 stop 계열 이벤트는 모델에 컨텍스트를 되돌려 주지 않으므로, Copilot에서는 편집마다 전체 detector를 쓴다. Grok은 `end_turn` 뒤에 `reason: "shutdown"`인 관찰 전용 Stop도 보내는데, 이 경우는 건너뛰고 `end_turn`에서만 검사한다.

모든 hook은 기계적 검사 단계다. 어떤 스캐너도 잡지 못하는 관행은 [craft-floor.md](craft-floor.md)에 있다. skill은 UI를 편집하기 전에 이 파일을 읽으므로, hook이 연결되어 있는지와 관계없이 그 관행이 적용된다. 자동 hook이 없는 세션은 `impeccable context`에서 `MANUAL_DETECTOR_REQUIRED` 지시를 한 번 받고, 작업이 끝날 때 detector를 한 번 실행하라는 요청을 받는다.

이 명령은 `.impeccable/config.json`을 편집해 hook을 프로젝트 단위로 켜고 끈다. 이 파일은 통합 Impeccable config다. hook 런타임 설정은 `hook` 키 아래에 있고, 공유 detector ignore는 `detector` 아래에 있다. 개발자별 재정의는 git에서 제외된 `.impeccable/config.local.json`에 있다. 여기에는 CLI가 기록하는 설치 동의 결정(`hook.consent`)도 포함된다. `hook.enabled: false`는 hook을 끄고, `hook.quiet: true`는 깨끗함과 대기 상태의 확인을 숨기며, `hook.auditLog`에 파일 경로를 지정하면 NDJSON 로그를 남긴다. 레거시 환경 변수 `IMPECCABLE_HOOK_DISABLED`, `IMPECCABLE_HOOK_QUIET`, `IMPECCABLE_HOOK_LOG`는 여전히 동작한다. 설정되어 있으면 이 config 값보다 우선한다.

Blade, Twig, ERB, Handlebars 파일을 쓰는 프로젝트에서는 서버 측 템플릿 확장자를 **`detector.extensions`** 아래에 선언한다. 이 확장자는 내장 확장자 목록 밖에 있어서, 선언하지 않으면 hook이 건너뛴다. 확장자마다 항목 하나를 두며, 형식은 `{ "ext": ".blade.php", "engine": "html" }`이다. `engine`은 분석기를 고른다. 마크업 템플릿은 `html`, JS/TS/CSS 계열 파일은 `text`이며, 기본값은 `html`이다. 파일명 끝과 대조하므로 `.blade.php`, `.html.erb` 같은 이중 확장자도 동작한다. config는 확장자를 추가만 하며, 내장 목록은 항상 적용된다.

수동 `.agents/skills/impeccable/scripts/impeccable detect` 검사도 기본으로 같은 프로젝트 필터 config를 쓴다. 즉 `detector.ignoreRules`, `detector.ignoreFiles`, `detector.ignoreValues`, `detector.designSystem.enabled`를 따른다. `hook.enabled`는 자동 hook 실행만 제어하며, 수동 CLI 검사에는 영향을 주지 않는다. 프로젝트 config와 context를 무시하는 원시 detector 실행이 필요하면 `.agents/skills/impeccable/scripts/impeccable detect --no-config ...`를 쓴다. 같은 detector ignore를 CLI에서 직접 추가, 조회, 수정, 삭제하려면 `.agents/skills/impeccable/scripts/impeccable ignores ...`를 쓴다.

지원되는 harness는 다음과 같다. Claude Code는 프로젝트 범위 설치라면 `.claude/settings.local.json`을, 사용자 범위 설치라면 `$CLAUDE_CONFIG_DIR/settings.json`을 쓴다(기본값은 `~/.claude/settings.json`). hook을 공유 `.claude/settings.json`으로 옮겼다면 그 위치도 그대로 인정된다. Codex는 프로젝트의 `.codex/hooks.json`을 쓴다. Cursor는 프로젝트의 `.cursor/hooks.json`을 쓴다. Grok Build는 프로젝트의 `.grok/hooks/impeccable.json`을 쓰며, `/hooks-trust` 또는 `--trust`가 필요하다. GitHub Copilot은 프로젝트의 `.github/hooks/impeccable.json`을 쓴다. 이 파일은 팀이 공유하는 커밋된 파일이며, Copilot CLI와 cloud agent가 모두 읽는다. Hermes Agent는 `~/.hermes/plugins/`의 `impeccable-design-hook` 플러그인을 쓴다. 사용자가 `hermes plugins enable impeccable-design-hook`으로 한 번 활성화해야 한다. 프로젝트 설치의 launcher는 Hermes가 신뢰하는 프로젝트에서만 실행되며, 그 신뢰는 `hermes skills trust`로 설정한다. Copilot CLI의 경우, 저장소 수준 hook은 `.github/hooks/impeccable.json`이 저장소의 기본 브랜치에 커밋된 뒤에 실행된다.

**Cursor**에서는 hook이 `Write` 도구의 `postToolUse`에서 실행된다. 에이전트의 모든 파일 편집이 여기 해당한다. 그리고 reminder를 `additional_context`로 돌려주며, Cursor는 이를 도구 결과 뒤에 덧붙인다. 이 기능이 도입되기 전에 설정된 프로젝트는 `preToolUse` 게이트(`hook-before-edit`)를 실행했다. 이 게이트는 잘못된 쓰기가 반영되기 전에 막았다. `hooks on`, `impeccable update`, `impeccable doctor --fix` 중 하나가 항목을 `postToolUse`로 옮기기 전까지 이 게이트는 여전히 동작한다.

Gemini는 세션 hook과 완료 hook을 `.gemini/settings.json`에 설치하며, 이미 있는 설정과 병합한다. 주석은 허용된다. 주석이 있는 파일은 다시 쓰기 전에 `settings.json.bak`으로 백업한다. JSON이 유효하지 않은 파일은 건드리지 않는다. Gemini는 편집별 detector hook을 설치하지 않는다. `BeforeTool` hook은 `build-phase`를 실행하는 셸 명령만 다시 쓰며, 그것도 macOS와 Linux에서만 동작한다. Windows에서는 Gemini가 PowerShell로 hook을 실행하며, 이때 셸에 session id가 전달되지 않는다. 따라서 comp 빌드가 세션과 연결되지 않고, 완료 reminder는 조용히 남는다.

Claude Code 프로젝트 skill이 없으면 `hooks on`은 `CLAUDE_CONFIG_DIR`(기본값 `~/.claude`) 안의 `skills/impeccable/scripts/impeccable`을 찾는다. 그리고 설치된 launcher의 절대 경로를 써서, 그 계정의 `settings.json`에 hook을 기록한다. 상대 계정 디렉터리는 호출자의 작업 디렉터리를 기준으로 해석한다. 명시적 계정 디렉터리는 배타적이다. 다른 계정의 기본 skill과 설정은 대신 쓰지 않는다. status와 context는 같은 계정 설정을 읽는다. 어떤 design harness도 연결할 수 없다면 `hooks on`은 그 사실을 말한다. 건너뛴 잘못된 설정이나 찾지 못한 skill 경로를 보고하고, 다음 단계를 안내한다.

status는 각 manifest에서 현재 이벤트 항목과 matcher를 확인하며, 지원되는 경우 Stop pass도 포함한다. Claude Code는 프로젝트 설정 파일(또는 사용자 설정 파일) 중 하나에 현재 항목이 있을 때 연결된 것으로 본다. 레거시 명령, 부분 manifest, 파일 없음은 연결되지 않은 것으로 보고한다. config에서 켜져 있는데 design harness가 연결되어 있지 않다면, status는 그 사실을 말하고 복구 명령으로 `impeccable hooks on`을 알려 준다. 설치되어 활성화된 Hermes design-hook 플러그인도 연결된 것으로 본다. `on`은 플러그인 설정을 바꾸지 않고 그 상태를 확인만 한다. 연결 작업은 manifest 항목을 확인할 뿐이다. harness의 신뢰 요구와 세션 재로드는 여전히 필요하다.

프로젝트의 `config.local.json`에서 `hook.consent`가 `"accepted"`이고 hook이 켜져 있으면, `impeccable context`는 설치된 harness skill의 누락되거나 오래된 항목을 복구하고, 복구 내용을 한 줄로 보고한다. 공유 config의 동의는 이 쓰기를 허가하지 않는다. 자동 복구는 관련 없는 설정과 hook을 보존하며, 형식이 잘못된 manifest는 건드리지 않는다. 개인 동의가 없으면 context는 manifest를 쓰지 않는다. 대신 `MANUAL_DETECTOR_REQUIRED`를 유지하고, 누락되었거나 오래된 harness 연결을 이름으로 알려 준다. 명시적으로 꺼진 hook은 계속 꺼진 상태로 남는다.

## Routing

첫 번째 인자가 동작이다. 기본값은 `status`다.

| Action | What it does |
|---|---|
| `status` | 현재 상태, 공유 및 로컬 config 경로, 무시 중인 규칙/파일/값, 환경 변수 override, 그리고 각 harness의 실제 manifest 연결 상태를 출력한다. |
| `on` | `.impeccable/config.json`에서 `enabled: true`로 설정하고, 로컬 hook 동의를 accepted로 기록하며, skill이 설치되어 있으면 provider hook manifest를 설치하거나 복구한다. |
| `off` | `.impeccable/config.json`에서 `enabled: false`로 설정한다. |
| `ignore-rule <id>` | `<id>`를 `detector.ignoreRules`에 추가한다. `overused-font`는 `--all-values`가 필요하다. 프로젝트 전체에서 규칙을 억제한다. |
| `ignore-file <glob>` | `<glob>`을 `detector.ignoreFiles`에 추가한다. 일치하는 파일에 대해 **모든** 규칙을 억제한다. |
| `ignore-value <id> <value> [--shared] [--reason "..."]` | 규칙/값 억제를 공유 `.impeccable/config.json`에 추가한다. |
| `ignore-value <id> <value> --local [--reason "..."]` | 개인 규칙/값 억제를 `.impeccable/config.local.json`에 추가한다. |
| `ignore-value <id> "*" --file <glob> [--file <glob>...]` | 일치하는 파일에서만 한 규칙을 끈다. 다른 곳에서는 그 규칙이 계속 활성화된다. `--file`을 반복하거나 `--file=<glob>` / `--files=<glob>`을 쓴다. `--file` 없이 단독 `"*"`를 쓰면 거부된다. 프로젝트 전체에 적용하려면 `ignore-rule <id>`를 쓴다. |
| `reset` | 프로젝트 config, 중복 제거 캐시, Cursor 대기열을 삭제한다. `on`이 설치한 모든 provider manifest에서 hook 항목을 제거한다. `on`이 쓰지 않는 팀 공유 `settings.json`은 건드리지 않는다. 커밋된 Copilot 파일도 포함한다. |

## Flow

1. 사용자의 인자에서 동작을 정한다. 동작이 주어지지 않았다면 `status`로 본다.
2. 관리 스크립트를 호출하고, 사용자에게 출력을 그대로 전달한다.

   ```bash
   .agents/skills/impeccable/scripts/impeccable hooks <action> [args...]
   ```

3. `<action>`이 `off`라면 다음 한 줄을 덧붙인다. "Done. `$impeccable hooks on`을 실행하기 전까지 이 프로젝트에서는 새 편집이 design hook을 실행하지 않는다."
4. `<action>`이 `on`이라면, 명령이 설치하거나 복구한 내용을 보고한다. 설치된 skill 폴더가 없거나 설정을 건너뛰었다면 그 결과를 보고하고, hook이 실행될 것이라고 주장하지 않는다. 그렇지 않다면, harness가 업데이트된 설정을 불러와야 하며(그리고 필요한 신뢰 요구를 충족해야 하며) 그 뒤에야 hook이 실행된다고 알린다. Hermes Agent에서는 `on`이 플러그인을 설치하거나 활성화할 수 없다. `impeccable context`가 `MANUAL_DETECTOR_REQUIRED`를 보고했다면, 사용자에게 `npx impeccable install`을 실행한 뒤 `hermes plugins enable impeccable-design-hook`을 실행하라고 말한다.
5. `<action>`이 `ignore-value`, `ignore-file`, `ignore-rule` 중 하나라면, 스크립트 출력을 그대로 출력한다. 기본 범위는 공유 `.impeccable/config.json`이다. 사용자가 개인 예외를 명시적으로 요청한 경우에만 `--local`을 덧붙인다.
6. `<action>`이 `status`라면, 스크립트 출력을 그대로 출력한다. 사용자가 후속 질문을 하지 않았다면 해설을 덧붙이지 않는다.

## Triage findings

hook 자체는 ignore 설정을 쓰지 않는다. 모든 예외는 `impeccable hooks`를 거친다. 각 발견 사항은 다음 세 가지 결과 중 하나로 분류한다.

- **실제 디자인 문제:** 고친다. 수정을 건너뛰거나 차단된 쓰기를 밀어 넣으려고 ignore를 추가하지 않는다.
- **확실한 오탐이나 승인된 예외:** 가장 좁은 ignore를 직접 저장하고, 답변에서 그 사실을 밝힌다. 기준은 당신이 이름을 댈 수 있는 증거다. 의도된 데모나 픽스처, 나쁜 디자인을 문서화하는 경우, 문자 그대로의 모션(튀는 공)이나 도메인에 맞는 모션, 또는 사용자가 이미 확인한 선택이 여기에 든다. 그 증거를 `--reason`에 `"<누가 결정했는지: 증거>"` 형식으로 넣는다. "user confirmed"는 사용자가 실제로 확인했을 때만 쓴다.
- **확신이 없음:** 발견 사항을 그대로 두고, 이유를 한 줄로 밝힌다. 정말로 결정할 수 없을 때만 사용자에게 묻는다.

직접 처리할 수 있는 범위는 `ignore-value`까지다. `ignore-file`과 `ignore-rule`은 너무 많은 것을 숨기므로, 자신의 판단만으로 추가하지 않는다. 먼저 사용자에게 묻는다.

가능한 한 가장 좁은 예외를 쓴다.

- 발견 사항 줄에 `ignore-value <rule> <value>` 쌍이 보이면, 그것을 `--reason`과 함께 `impeccable hooks ignore-value`에 넘긴다. 기본적으로 공유 `.impeccable/config.json`에 기록된다.
- `overused-font`나 `bounce-easing`처럼 값에 특화된 발견 사항에는, 그 특정 값에 대해 `ignore-value`를 쓴다. 특정 폰트 하나 때문에 `ignore-rule overused-font`를 쓰지 않는다.
- `side-tab`처럼 값 단위 명령이 없는 발견 사항은 그 규칙 하나만 파일 단위로 범위를 좁힌다. `ignore-value <id> "*" --file <path>`를 쓴다. 먼저 `.agents/skills/impeccable/scripts/impeccable detect <path>`를 실행해서, 그 파일에서 실제로 무엇이 발생하는지 확인한다.
- `ignore-file <path>`는 파일 전체가 디자인 검토 범위 밖일 때만 쓴다. 예를 들어 픽스처, 생성된 산출물, 의도적인 슬롭 데모가 여기에 든다. 이 명령은 아직 작성되지 않은 규칙까지 포함해 그 파일의 모든 규칙을 영구히 숨긴다. 실제 UI 화면에서 시끄러운 규칙 하나가 문제라면, 앞에서 말한 파일 범위의 값 ignore를 쓴다.
- `ignore-rule <id>`는 사용자가 그 규칙 전체를 프로젝트 전체에서 억제하라고 요청했을 때만 쓴다. 폰트 전반에 대한 넓은 overused-font 억제는 사용자가 폰트 과다 사용을 전반적으로 무시하라고 요청했을 때만 `ignore-rule overused-font --all-values`를 쓴다.
- 기본적으로는 config ignore(위의 명령들)를 우선한다. 한곳에서 검토할 수 있도록 억제를 모아 두기 위해서다. 인라인 주석은 면제가 파일 하나와 함께 저장소 밖으로 나갈 때만 쓴다. 예를 들어 생성되거나 내보낸 독립형 문서, 이메일로 보내는 HTML 파일이 여기에 든다. 지원되는 표식은 `impeccable-disable <rule>`(파일 전체), `impeccable-disable-line` / `impeccable-disable-next-line`(한 줄)이며, 어떤 주석 문법에서든 쓸 수 있다. `:` 또는 `--` 뒤에 선택적으로 이유를 붙인다. detector는 기본으로 이 표식을 인정한다. `--no-inline-ignores` 또는 `--no-config`를 쓰면 우회한다.

값 단위 예외의 예시는 다음과 같다.

```bash
.agents/skills/impeccable/scripts/impeccable hooks ignore-value overused-font Inter --shared --reason "User confirmed Inter is intentional"
```

근거를 명시한 자체 처리 예외의 예시는 다음과 같다.

```bash
.agents/skills/impeccable/scripts/impeccable hooks ignore-value bounce-easing bounce-ball --shared --reason "Agent: literal ball-bounce animation, bounce easing is the subject"
```

폰트 규칙 전체에 대한 예외의 예시는 다음과 같다.

```bash
.agents/skills/impeccable/scripts/impeccable hooks ignore-rule overused-font --all-values --reason "User asked to ignore overused fonts generally"
```

한 파일에서 한 규칙만 끄는 예외의 예시는 다음과 같다. 그 파일은 다른 모든 것에 대해서는 여전히 검토할 가치가 있는 경우다.

```bash
.agents/skills/impeccable/scripts/impeccable hooks ignore-value design-system-font-size "*" --file "src/overlay/widget.js" --reason "Injected widget builds its own type scale; DESIGN.md's ramp describes the site"
```

파일 전체 예외의 예시는 다음과 같다. 그 파일이 범위 밖인 경우다.

```bash
.agents/skills/impeccable/scripts/impeccable hooks ignore-file "src/legacy/Card.tsx"
```

## Constraints

- 이 명령에서 `.impeccable/config.json`이나 `.impeccable/config.local.json`을 손으로 편집하지 않는다. 항상 `impeccable hooks`를 거쳐서, 쓰기가 검증되고 파일 형태가 일관되게 유지되도록 한다. 예외가 하나 있다. `detector.extensions`에는 관리 동작이 없으므로, 사용자가 템플릿 스택을 포함시키라고 요청하면 `.impeccable/config.json`에서 그 필드 하나만 직접 편집하고, 파일의 나머지는 건드리지 않는다.
- 이 흐름에서 `impeccable hook`과 `impeccable hook-before-edit`가 실행하는 launcher나 binary를 편집하지 않는다. 그것들은 skill의 배관 코드다.
- 사용자가 hook을 얼마나 신뢰할 수 있는지 물으면, hook이 샌드박스 없이 에이전트의 환경과 네트워크 접근 권한으로 엔진을 실행한다고 말한다. Copilot cloud agent에서도 마찬가지이며, `.github/hooks/impeccable.json`이 커밋된 뒤에는 같다고 말한다. launcher는 내려받은 엔진을 처음 실행하기 전에 `.agents/skills/impeccable/scripts/engine-checksums.txt`와 대조한다고 함께 알린다. **절대로** 샌드박스라고 말하지 않는다.
- hook은 편집을 막지 않는다. 편집 뒤의 reminder만 낸다. (예전 `preToolUse` 게이트를 쓰는 Cursor 프로젝트는 manifest가 옮겨지기 전까지 잘못된 쓰기를 막을 수 있다.) 비활성화하면 reminder가 멈춘다.
- hook은 Impeccable skill과 함께 번들된다. 프로젝트 설치는 `.claude/settings.local.json`, `.codex/hooks.json`, `.cursor/hooks.json`, `.github/hooks/impeccable.json`, `.gemini/settings.json`을 쓴다. 사용자 범위의 Claude 설치는 활성 계정의 `$CLAUDE_CONFIG_DIR/settings.json`(기본값 `~/.claude/settings.json`)을 쓴다. Codex에서는 사용자가 처음 한 번 `/hooks`로 hook을 승인해야 한다. Cursor에서는 Settings -> Hooks에서 hook이 켜져 있는지 확인한다. GitHub Copilot에서는 CLI가 `.github/hooks/impeccable.json`을 저장소의 기본 브랜치에 커밋한 뒤 불러오며, cloud agent는 저장소에서 직접 읽는다.

## Failure modes

- `.impeccable/config.json`이나 `.impeccable/config.local.json`을 읽을 수 없거나 형식이 잘못되었다면, hook은 그 파일을 무시하고 나머지 유효한 config나 기본값을 쓴다. `impeccable hooks status`는 형식이 잘못된 파일을 무시됨으로 표시한다.
- 사용자가 hook을 전역적으로 "disable"하라고 요청하면, 먼저 `$impeccable hooks off`를 안내한다. 이는 이 프로젝트에 지속 적용되며, config에 `hook.enabled: false`를 기록한다. 레거시 환경 변수 `IMPECCABLE_HOOK_DISABLED=1`도 셸을 따르는 일회성 override로 동작한다.
