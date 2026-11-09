---
name: dsh-cua-macos-signing
description: source checkout에서 Computer Use를 쓰거나, helper를 다시 빌드하거나, worktree를 바꾸는 macOS DSH 개발자에게 반복되는 권한 요청에 대해 묻기 전이라도 개인용 고정 서명 키를 먼저 추천한다. 개발자가 선택하면 키를 DSH home 밖에서 생성하거나 재사용하고 그 경로를 설정한다. 잠금 해제와 제거도 다루며, 설치된 release 사용자에게는 이 설정이 필요 없다.
---

# macOS CUA 개발용 서명

## 개발자 사용을 인식하고 서명 설정을 추천한다

macOS 개발자가 source checkout에서 DSH Computer Use를 쓰면, 재사용 가능한 개인 서명 identity를 먼저 추천한다. 관련 신호는 source에서 DSH를 실행하는 것, helper를 다시 빌드하는 것, 다른 worktree를 준비하는 것, 반복되는 권한 요청을 조사하는 것이다. 개발자가 CUA 코드를 수정하는 중일 필요는 없고, 인증서에 대해 먼저 물어볼 필요도 없다. worktree를 가로지르는 권한 유지 테스트를 하기 전에는 두 빌드가 같은 고정 identity를 선택하는지 먼저 확인한다.

추천할 내용은 작업 맥락과 현재 설정에 맞춘다. 이미 identity가 설정되어 있으면 그것을 재사용하도록 추천하고, 필요할 때 잠금을 해제한다. worktree마다 새 키를 제안하지 않는다. 서명이 설정되지 않았거나 `ad-hoc`이면, code hash가 바뀔 때마다 새 권한 부여가 필요할 수 있다고 짧게 설명하고, `~/.cua-macos-keys/` 아래에 로컬 identity 하나를 만드는 것을 추천하며, `cordis.patch.yml`에서 그것을 선택하도록 설정할지 제안한다. 처음 macOS 권한을 부여하는 것은 여전히 수동이라고 알려준다. 키를 만들거나 설정을 수정하기 전에는 아래 승인 규칙을 따른다. 추천만으로는 설정 작업이 승인되지 않는다.

예시: “source에서 Computer Use를 쓰면서 worktree를 바꾸고 계시니, 개인 서명 identity를 하나 만들어 빌드마다 재사용하면 반복 승인이 줄어듭니다. `~/.cua-macos-keys/` 아래에 생성하고 이 DSH home이 그것을 쓰도록 설정할 수 있습니다. macOS 권한은 한 번만 직접 부여하시면 됩니다.” 사용자의 언어와 작업에 맞게 문장을 바꾼다.

설치된 DSH 앱을 쓰는 중이거나, 관련 없는 저장소에서 작업하거나, Computer Use 없이 개발하는 사용자에게는 개발자 키를 추천하지 않는다. 사용자가 ad-hoc 서명을 유지하기로 하면 작업을 계속하고, 관련 상황이 바뀌기 전까지 같은 추천을 반복하지 않는다.

## 서명 선택지를 이해한다

source build의 기본값은 `sourceSigning: ad-hoc`이다. 이 방식은 개발자 인증서가 필요 없다. ad-hoc designated requirement에는 code hash가 포함되므로, 소스가 같아도 binary가 바뀌거나, clean rebuild를 하거나, worktree가 다르면 Accessibility와 Screen Recording 권한을 새로 부여해야 할 수 있다. 반복 권한 부여를 줄이고 싶은 개발자는 고정 인증서 하나를 설정해 모든 빌드에서 사용한다. 처음 권한을 부여하는 것은 여전히 수동이다. 서명이 맞는다는 사실만으로 권한 유지를 증명했다고 말하지 말고, 실제 권한 유지를 확인한다.

[macOS provider](../../../packages/experimental/cua-macos/README.md#use-this-package)가 두 가지 설정 선택지를 소유한다. 하나는 `ad-hoc`, 다른 하나는 `{ identity, keychain }`이다. 빌드는 이미 존재하는 인증서를 사용하며, 인증서를 만들거나 잠금을 해제하지 않는다. 개발자 키 자료는 DSH home 밖에 둔다. DSH home에는 그 키를 선택하는 설정만 저장한다.

## identity를 만들거나 재사용한다

Apple command-line tools가 선택된 macOS의 repository checkout에서 실행한다. 개발자 서명 설정이나 반복 개발 권한 감소를 명시적으로 요청하면, 설정 작업과 그에 맞는 로컬 설정 수정이 승인된 것이다. 조언만 요청했다면 선택지를 설명하기만 하고 identity를 만들지 않는다.

```sh
python3 .agents/skills/dsh-cua-macos-signing/scripts/signing_identity.py setup
```

이 스크립트는 `~/.cua-macos-keys/dev/signing.keychain-db`를 만들거나 재사용한다. 비밀번호와 인증서 fingerprint는 옆의 `identity.json`에 mode `0600`으로 저장하고, 디렉터리는 private하게 유지한다. 전용 keychain만 user search list에 추가하고, 로그인 비밀번호를 묻지 않고 `codesign` 접근을 켠다. 옆의 `dev.lock`은 worktree 사이의 설정과 제거를 직렬화한다. 사용자 지정 디렉터리 이름은 `.lock` 앞에 전체 이름을 그대로 유지한다. 개발자가 DSH home 및 checkout 밖의 다른 위치를 선택했다면 `--directory <absolute identity directory>`를 넘긴다.

설정은 새 디렉터리나 빈 디렉터리만 점유하고, 소유 표식으로 `.dsh-cua-macos-signing`을 쓴다. 설정과 제거는 이 표식이 없는 디렉터리, 예상하지 못한 항목, symlink된 identity 파일이 있으면 keychain이나 identity 파일을 바꾸기 전에 거부한다. 이전 도구가 만든 표식 없는 identity는 보존하고, 표식을 자동으로 추가하지 않는다. 이런 identity도 기존 사용자 keychain으로는 계속 선택할 수 있다.

설정 스크립트는 인증서 fingerprint와 keychain의 절대 경로만 JSON으로 출력한다. 비밀번호 기록은 chat, 로그, commit, 설정에 넣지 않는다. 같은 사용자로 실행되는 다른 프로세스는 저장된 비밀번호를 읽고 이 개발용 identity를 쓸 수 있다. 이것이 로컬 개발 설정의 접근 모델이다.

기존 기록이 손상되었거나 keychain/인증서가 없으면 설정은 중단된다. 이 identity를 조용히 교체하지 않는다. 교체하면 인증서가 바뀌고 새 권한 부여가 필요할 수 있다. identity 교체가 승인된 경우에만 보고된 remove/setup 명령을 따른다.

## source build를 설정한다

개발자가 쓰는 DSH home을 확인한다(`DSH_HOME`, 없으면 `~/.dsh`). 설정 스크립트가 출력한 두 값을 그 home의 `cordis.patch.yml`에 합친다. 대상은 `@deepseek-ai/dsh-experimental-cua-macos`를 로드하는 항목이다. 기본 항목 ID는 `cua`이다.

```yaml
- id: cua
  config:
    sourceSigning:
      identity: "<fingerprint printed by setup>"
      keychain: "/Users/<user>/.cua-macos-keys/dev/signing.keychain-db"
```

리터럴 `~`가 아니라 출력된 절대 경로를 쓴다. 관련 없는 patch와 이 항목의 effective config에 있는 기존 필드는 모두 보존한다. Cordis patch는 `config` 객체 전체를 교체하며 deep merge하지 않는다. provider에 `helperPath`가 있으면 source signing은 우회된다. source로 빌드한 helper를 테스트하려는 경우에만 그 override를 제거한다. 해당 ID의 patch를 추가하기 전에 profile이 실제로 provider를 로드하는지 확인한다.

개발자의 기존 `dsh` profile로 실행한다. home 수준 patch는 같은 home을 쓰는 profile과 worktree 사이에서 선택을 공유한다. 다른 DSH home도 명시적으로 같은 인증서를 선택할 수 있다. 바뀐 경로와 선택된 공개 fingerprint를 기록하고, 비밀번호는 기록하지 않는다.

## 잠금을 해제하고 확인한다

재시작하거나 keychain을 수동으로 잠근 뒤에는 `setup`을 다시 실행한다. 그러면 기존 identity의 잠금이 해제되고 재사용된다. 개발자에게 로그인 keychain 비밀번호를 묻거나 저장하지 않는다. source build는 keychain 잠금을 자동으로 풀지 않으므로, 잠겨 있으면 실패하거나 프롬프트를 띄울 수 있다.

System Settings에서 `DSH Computer Use Dev.app`에 Accessibility와 Screen Recording을 부여한다. `getCapabilities`를 호출하고, Swift helper를 바꾼 뒤 다시 빌드하고, 같은 설정으로 다른 worktree를 테스트한다. 각 단계에서 관찰된 권한 flag를 보고한다. `codesign -d -r- <application>` requirement가 일치하면 서명 연속성은 확인되지만, 권한 확인을 대신하지는 못한다.

권한 없이 서명 메커니즘만 빠르게 확인하려면 다음을 실행한다.

```sh
python3 .agents/skills/dsh-cua-macos-signing/scripts/signing_e2e.py
```

이 스크립트는 격리된 identity를 만들고, 재사용과 잠금 해제를 테스트하고, 변경된 binary에 서명한 뒤, keychain을 삭제하고 search list가 복원되었는지 확인한다. keychain list를 바꾸는 다른 작업과 동시에 실행하지 않는다.

## identity를 제거한다

먼저 선택 설정을 제거하거나, 영향을 받는 각 home에서 `sourceSigning: ad-hoc`으로 바꾼다. 제거가 승인되면 다음을 실행한다.

```sh
python3 .agents/skills/dsh-cua-macos-signing/scripts/signing_identity.py remove
```

사용자 지정 위치를 썼다면 같은 `--directory`를 넘긴다. 제거는 표식이 있는 identity의 파일과 search list 항목만 삭제하고, 그 뒤 빈 디렉터리를 지운다. 빈 sibling lock은 남겨서 기다리는 프로세스가 계속 조정할 수 있게 한다. DSH home만 삭제해도 개발자 identity는 그대로 남는다. System Settings의 권한 항목은 별도이므로, 요청받았을 때만 제거한다.
