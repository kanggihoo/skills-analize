---
name: configure-ecc
description: "현재 하네스 안에서 대화형 ECC 설정 마법사를 실행합니다. 설치 상태를 점검하고, Claude Code에서는 범위(user/project/local)와 훅 모드(off/minimal/standard/strict)를 수집하며, Codex에서는 네이티브 플러그인 라이프사이클을 사용하고, Kimi에서는 ./.kimi-code 아래에 프로젝트 표면을 설치합니다. 이후 미리보기, 적용, 검증을 수행합니다. ECC 설치를 설치, 업데이트, 재구성, 복구하거나, 훅 프로필을 변경하거나, ECC를 다른 설치 범위로 옮길 때 사용합니다."
metadata:
  origin: ECC
---

# ECC 설정

현재 하네스 안에서 대화형 마법사를 실행합니다. 먼저 설치 상태를 점검하고, 지원되는 선택지만 수집하고, 미리보기를 보여준 뒤 한 번만 확인을 받고, 비대화형으로 적용하고, 검증합니다. 성공을 확인한 뒤에만 환영 메시지를 보여줍니다. ECC를 임시 디렉터리에 복제하거나 플러그인 구성 요소를 손으로 복사하지 마십시오.

사람이 직접 조작하는 터미널에서는 정식 진입점이 `ecc setup` 및 `npx ecc-universal setup`입니다. 하네스 안에서는 아래의 명시적 비대화형 명령을 대신 사용하십시오.

## 현재 하네스에 따라 경로 선택

- Claude Code에서는 아래의 전체 범위 및 훅 마법사를 사용합니다.
- Codex에서는 Codex의 네이티브 플러그인 라이프사이클을 사용합니다. Claude 범위를 제시하지 말고, ECC의 Claude 훅 프로필 4개를 Codex에 대응시키지 마십시오.
- Kimi에서는 `./.kimi-code` 아래에 프로젝트 표면을 설치합니다. Kimi는 ECC의 Claude 라이프사이클 훅 프로필을 제공하지 않습니다.
- 하네스가 불분명하면 감지된 근거를 제시하고, 변경을 일으키는 명령을 실행하기 전에 어느 하네스를 설정할지 물어보십시오.

이 스킬은 설치 후 재구성 경로입니다. 제공자의 기본 첫 설치 UI를 가로채거나 대체할 수 없습니다.

## Claude Code: 전체 대화형 마법사 실행

### 1. 아무것도 바꾸지 않고 점검

두 명령을 모두 실행하고, 설치된 ECC의 범위, 활성화 상태, 마켓플레이스 출처를 요약하십시오.

```bash
claude plugin list --json
claude plugin marketplace list --json
```

하나의 기존 `ecc@ecc` 설치는 재구성으로 취급하십시오. Claude가 제공하는 "Open home page" 컨트롤을 설치 증거로 해석하지 마십시오. 여러 ECC 범위, 레거시/수동 설치, 잘못된 설정 파일, 마켓플레이스 충돌이 있으면 중단하고, 설정이 반환한 복구 방법을 보고하십시오. 어떤 상태를 삭제할지 추측하지 마십시오.

### 2. 정확히 두 가지 선택 수집

범위 질문은 하나만 하고, 값 하나를 반드시 받으십시오.

- `user | project | local`
- `user`는 이 사용자에게 전역입니다.
- `project`는 저장소 설정을 통해 공유됩니다.
- `local`은 현재 프로젝트에만 비공개입니다.

선택된 범위만 선택됨 또는 설치 중으로 표시하십시오. 단일 기존 설치에서 사용자가 다른 범위를 고르면 이를 범위 이전으로 설명하고, 아래 명령에 `--move-scope`를 포함하십시오.

훅 모드 질문도 하나만 하고, 값 하나를 반드시 받으십시오.

- `off | minimal | standard | strict`
- `off`는 스킬과 명령은 유지하면서 ECC 훅 자동화를 끕니다.
- `minimal`은 가장 가벼운 라이프사이클 및 안전 자동화를 켭니다.
- `standard`는 품질과 안전 자동화의 균형을 맞춥니다.
- `strict`는 가장 강력한 검사와 알림을 켭니다.

훅 설정은 개인 Claude 플러그인 구성이며, 선택한 설치 범위를 따르지 않습니다.

### 3. 미리보기 후 한 번 확인

가능하면 플러그인에 포함된 설정 스크립트를 사용하십시오. 선택한 두 값을 대입하고, 범위 이전인 경우에만 `--move-scope`를 포함하십시오.

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/setup.js" --mode claude-plugin \
  --scope <scope> --hooks <hooks> [--move-scope] --dry-run --json
```

`$CLAUDE_PLUGIN_ROOT`를 사용할 수 없으면 게시된 npm 패키지를 사용하십시오.

```bash
npx --yes --package ecc-universal ecc setup --mode claude-plugin \
  --scope <scope> --hooks <hooks> [--move-scope] --dry-run --json
```

확인 요약은 한 번만 보여주십시오. 계획된 작업, 범위 하나, 훅 모드 하나, 마켓플레이스 작업, 그리고 있다면 출발지에서 목적지로의 이전 내역을 포함해야 합니다. 예/아니요 질문을 하나만 하십시오. 하네스 셸 도구로 인자 없는 대화형 `ecc setup`을 실행하지 마십시오. 해당 셸은 대개 TTY가 아닙니다.

### 4. 명시적으로 선택한 값 적용

확인을 받은 뒤 `--dry-run`을 빼고 같은 경로를 다시 실행하십시오. 모든 선택을 명시적으로 유지하고, 성공 여부를 결정적으로 확인할 수 있도록 JSON을 요청하십시오.

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/setup.js" --mode claude-plugin \
  --scope <scope> --hooks <hooks> [--move-scope] --yes --json
```

대체 명령:

```bash
npx --yes --package ecc-universal ecc setup --mode claude-plugin \
  --scope <scope> --hooks <hooks> [--move-scope] --yes --json
```

### 5. 검증한 뒤 환영 메시지 렌더링

종료 상태가 0이고, 설정 결과의 `scope`와 `hooks`가 선택한 값과 같은지 확인하십시오. 그다음 독립적으로 다음을 실행하십시오.

```bash
claude plugin list --json
```

선택한 범위에 활성화된 `ecc@ecc` 항목이 정확히 하나 있을 때만 계속하십시오. `$CLAUDE_PLUGIN_ROOT`를 사용할 수 있으면, 성공한 설정의 `action`(`installed`, `updated`, `migrated`, `resumed`, `already-migrated` 중 하나)을 번들 렌더러에 전달하십시오.

호출 전에, 제공자가 보고한 버전이 `scripts/lib/terminal-welcome.js`의 `ECC_VERSION_PATTERN`과 일치하는지 확인하십시오. 예상하지 못한 버전 텍스트는 거부하고, 셸 명령에 보간하지 마십시오.

```bash
node -e 'const { renderTerminalWelcome } = require(process.env.CLAUDE_PLUGIN_ROOT + "/scripts/lib/terminal-welcome"); process.stdout.write(renderTerminalWelcome({ action: process.argv[1], version: process.argv[2], color: process.stdout.isTTY }));' "<action>" "<installed-version>"
```

환영 메시지는 정확히 한 번만 렌더링하십시오. 실패, 미리보기 실행, 취소, 범위 또는 훅 불일치, 검증할 수 없는 상태에서는 렌더링하지 말고, 오류와 복구 방법을 대신 보고하십시오. 검증된 변경이 끝나면 사용자에게 `/reload-plugins`를 실행하거나 Claude Code를 다시 시작하라고 안내하십시오.

## Codex: 네이티브 플러그인 라이프사이클 사용

`codex plugin marketplace list --json`과 `codex plugin list --available --json`으로 점검하십시오. Codex의 네이티브 플러그인 명령에는 Claude 스타일의 `user | project | local` 선택기가 없습니다. Codex 네이티브 플러그인은 제공자 전용 훅을 지원하지만, Codex는 이를 명시적으로 신뢰하도록 요구합니다. 신뢰 결정은 Codex가 보여주게 하십시오. Claude의 4가지 프로필 질문을 하지 말고, 그 프로필이 Codex에 대응한다고 주장하지 마십시오.

ECC 마켓플레이스가 없으면 추가하십시오. 있으면 스냅샷을 새로 고치십시오.

```bash
codex plugin marketplace add affaan-m/ECC
codex plugin marketplace upgrade ecc --json
```

확인을 한 번 받은 뒤 설치하거나, 설치된 캐시를 멱등하게 새로 고치고 검증하십시오.

```bash
codex plugin add ecc@ecc --json
codex plugin list --json
```

JSON이 ECC가 설치되었다고 보고하고 `installedPath`를 제공할 때만 계속하십시오. 그다음 검증된 번들의 환영 메시지를 렌더링하십시오.

Codex JSON이 반환한 정확한 절대 `installedPath`만 사용하십시오. 제어 문자는 거부하고, 설치된 버전이 `ECC_VERSION_PATTERN`과 일치하는지 요구하십시오. 이 인자 배열로 `node`를 직접 호출하십시오. 이는 셸 명령이 아니라 도구 API 호출입니다.

```text
["<installedPath>/scripts/welcome.js", "--action", "configured", "--version", "<installed-version>"]
```

현재 하네스가 별도의 인자 배열로 실행 파일을 호출할 수 없다면 환영 메시지를 건너뛰십시오. Codex JSON 값으로 셸 명령을 구성하지 마십시오.

Claude의 `off | minimal | standard | strict` 프로필이 Codex에 적용되었다고 절대 주장하지 마십시오.

## Kimi: 프로젝트 표면 설치

확인 전에 능력 요약을 제시하십시오. 대상은 `./.kimi-code`이고, ECC 라이프사이클 훅은 `hooks=unsupported`입니다. Claude 범위와 훅 모드 질문은 하지 마십시오. 먼저 미리보기를 실행하십시오.

```bash
npx --yes --package ecc-universal ecc install --profile core --target kimi --dry-run
```

이 프로젝트 대상에 대한 확인을 한 번 보여준 뒤, `--dry-run`을 뺀 동일한 명령을 적용하십시오. 다음으로 검증하십시오.

```bash
npx --yes --package ecc-universal ecc doctor --target kimi
```

doctor가 성공하고, 설치된 지침과 스킬이 `./.kimi-code` 안에 남아 있을 때만 렌더링하십시오.

```bash
npx --yes --package ecc-universal ecc welcome --action configured
```

Kimi에 ECC 라이프사이클 훅이 설치되었거나 설정되었다고 주장하지 마십시오.
