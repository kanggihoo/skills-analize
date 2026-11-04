# dsh-cua-macos-signing 스킬은 에이전트를 어떻게 바꾸나 {#dsh-cua-macos-signing-skill}

`dsh-cua-macos-signing`이 켜지면 에이전트는 소스에서 Computer Use 기능을 쓰는 macOS 개발자에게 고정 서명 키 하나를 먼저 권한다. 서명이 설정되지 않았거나 `ad-hoc`이면 코드 해시가 바뀔 때 새 허용이 필요할 수 있기 때문이다.[](source:cs-recog) 개발자가 설정을 요청하면 키를 만들거나 재사용하고, 그 경로를 DSH 설정에 연결한다. 에이전트는 권유만으로는 키를 만들거나 설정을 고치지 않는다.[](source:cs-recog)[](source:cs-auth)

- 개발자가 소스 체크아웃으로 Computer Use 기능을 쓰거나, 도우미를 다시 빌드하거나, 다른 worktree를 준비하거나, 권한 요청이 반복될 때 에이전트가 먼저 권한다. 설치된 릴리스 앱 사용자에게는 권하지 않는다.[](source:cs-fm)[](source:cs-recog)[](source:cs-no)
- 키 생성은 개발자의 명시적 요청이 있을 때만 한다. 조언만 요청받으면 선택지를 설명하고 키를 만들지 않는다.[](source:cs-auth)
- 키는 DSH 홈 밖(`~/.cua-macos-keys/`)에 두고, DSH 홈에는 그 키를 고르는 설정만 둔다. 비밀번호 기록은 채팅, 로그, commit, 설정에 남기지 않는다.[](source:cs-choices)[](source:cs-create-out)
- 첫 macOS 권한 허용은 사람이 직접 한다. 서명이 같다는 사실만으로 권한이 유지된다고 말하지 않고 실제 권한 상태를 확인해 보고한다.[](source:cs-choices)[](source:cs-verify)

@answer scope="deepseek-harness/dsh-cua-macos-signing · 원본 텍스트 파일 4개 · 커밋 475505c · 지시상 동작"
@meta locale=ko
@source cs-fm title="deepseek-harness/dsh-cua-macos-signing/SKILL.md · 8047B · frontmatter" path=deepseek-harness/dsh-cua-macos-signing/SKILL.md lines=1:4
@source cs-recog title="SKILL.md · Recognize developer use and recommend signing" path=deepseek-harness/dsh-cua-macos-signing/SKILL.md lines=10:14
@source cs-no title="SKILL.md · 권하지 않는 경우" path=deepseek-harness/dsh-cua-macos-signing/SKILL.md lines=16:16
@source cs-choices title="SKILL.md · Understand the signing choices" path=deepseek-harness/dsh-cua-macos-signing/SKILL.md lines=20:22
@source cs-auth title="SKILL.md · 승인 규칙과 setup 명령" path=deepseek-harness/dsh-cua-macos-signing/SKILL.md lines=26:30
@source cs-create title="SKILL.md · setup 명령의 동작" path=deepseek-harness/dsh-cua-macos-signing/SKILL.md lines=32:34
@source cs-create-out title="SKILL.md · 출력과 비밀번호 취급" path=deepseek-harness/dsh-cua-macos-signing/SKILL.md lines=36:38
@source cs-cfg title="SKILL.md · Configure the source build" path=deepseek-harness/dsh-cua-macos-signing/SKILL.md lines=42:54
@source cs-yaml title="SKILL.md · cordis.patch.yml 항목" path=deepseek-harness/dsh-cua-macos-signing/SKILL.md lines=45:49
@source cs-unlock title="SKILL.md · Unlock and verify" path=deepseek-harness/dsh-cua-macos-signing/SKILL.md lines=58:60
@source cs-verify title="SKILL.md · 권한 확인 절차" path=deepseek-harness/dsh-cua-macos-signing/SKILL.md lines=60:60
@source cs-e2e title="SKILL.md · signing_e2e.py 안내" path=deepseek-harness/dsh-cua-macos-signing/SKILL.md lines=62:68
@source cs-remove title="SKILL.md · Remove an identity" path=deepseek-harness/dsh-cua-macos-signing/SKILL.md lines=72:78
@source si-doc title="deepseek-harness/dsh-cua-macos-signing/scripts/signing_identity.py · 11817B · 설계 설명" path=deepseek-harness/dsh-cua-macos-signing/scripts/signing_identity.py lines=1:12
@source si-const title="signing_identity.py · 상수와 인증서 설정" path=deepseek-harness/dsh-cua-macos-signing/scripts/signing_identity.py lines=27:44
@source si-priv title="signing_identity.py · private_command" path=deepseek-harness/dsh-cua-macos-signing/scripts/signing_identity.py lines=54:64
@source si-lock title="signing_identity.py · identity_lock" path=deepseek-harness/dsh-cua-macos-signing/scripts/signing_identity.py lines=71:77
@source si-dir title="signing_identity.py · default_directory" path=deepseek-harness/dsh-cua-macos-signing/scripts/signing_identity.py lines=98:100
@source si-owned title="signing_identity.py · owned_directory" path=deepseek-harness/dsh-cua-macos-signing/scripts/signing_identity.py lines=103:121
@source si-load title="signing_identity.py · load" path=deepseek-harness/dsh-cua-macos-signing/scripts/signing_identity.py lines=124:152
@source si-cert title="signing_identity.py · create_certificate" path=deepseek-harness/dsh-cua-macos-signing/scripts/signing_identity.py lines=155:183
@source si-setup title="signing_identity.py · setup" path=deepseek-harness/dsh-cua-macos-signing/scripts/signing_identity.py lines=186:210
@source si-remove title="signing_identity.py · remove 명령과 clear_identity" path=deepseek-harness/dsh-cua-macos-signing/scripts/signing_identity.py lines=213:236
@source si-main title="signing_identity.py · main" path=deepseek-harness/dsh-cua-macos-signing/scripts/signing_identity.py lines=239:258
@source e2e-doc title="deepseek-harness/dsh-cua-macos-signing/scripts/signing_e2e.py · 4524B · 목적" path=deepseek-harness/dsh-cua-macos-signing/scripts/signing_e2e.py lines=1:14
@source e2e-main title="signing_e2e.py · 검사 흐름" path=deepseek-harness/dsh-cua-macos-signing/scripts/signing_e2e.py lines=29:73
@source ts-unowned title="deepseek-harness/dsh-cua-macos-signing/scripts/test_signing_identity.py · 16979B · 소유 검사" path=deepseek-harness/dsh-cua-macos-signing/scripts/test_signing_identity.py lines=60:132
@source ts-setup title="test_signing_identity.py · setup 동작" path=deepseek-harness/dsh-cua-macos-signing/scripts/test_signing_identity.py lines=134:221
@source ts-keep title="test_signing_identity.py · 손상 기록 보존" path=deepseek-harness/dsh-cua-macos-signing/scripts/test_signing_identity.py lines=223:274
@source ts-secret title="test_signing_identity.py · 비밀번호 비노출과 락" path=deepseek-harness/dsh-cua-macos-signing/scripts/test_signing_identity.py lines=276:331

## 언제 켜지고 언제 권하면 안 되나 {#trigger}

@code source=cs-fm language=yaml

`description`은 "소스에서 Computer Use 기능을 쓰거나, 도우미를 다시 빌드하거나, worktree를 바꾸는 macOS DSH 개발자에게 묻기 전에 먼저 권한다"고 적는다.[](source:cs-fm) 호출 제한 필드가 없다. 판정: 모델이 `description`을 참고해 스스로 켤 수 있다. `description`은 판단용 설명이지, 특정 단어가 있으면 켜지는 키워드 목록이 아니다.

권유 신호는 소스에서 DSH 앱을 띄울 때, 도우미를 다시 빌드할 때, 다른 worktree를 준비할 때, 권한 요청이 반복되는 것을 조사할 때다. 개발자가 CUA 코드를 고치고 있지 않아도 되고, 개발자가 인증서 이야기를 먼저 꺼내지 않아도 된다. worktree 사이의 권한 유지를 시험하기 전에는, 두 빌드가 같은 고정 서명 키를 고르는지부터 확인한다.[](source:cs-recog)

| 상황 | 에이전트가 하는 일 |
| --- | --- |
| 이미 키가 설정돼 있다 | 그 키를 재사용하라고 권하고 필요하면 잠금을 푼다. worktree마다 새 키를 제안하지 않는다[](source:cs-recog) {good:재사용} |
| 서명이 설정되지 않았거나 `ad-hoc`이다 | 코드 해시가 바뀌면 새 허용이 필요할 수 있음을 짧게 설명하고, `~/.cua-macos-keys/` 아래에 로컬 키 하나를 만들자고 권하며, `cordis.patch.yml`로 연결해 주겠다고 제안한다. 첫 macOS 허용은 수동임을 알린다[](source:cs-recog) |
| 설치된 DSH 앱 사용, 무관한 저장소 작업, Computer Use 없이 개발 | 개발자 키를 권하지 않는다[](source:cs-no) {bad:권유 금지} |
| 개발자가 `ad-hoc` 유지를 고른다 | 작업을 이어 가고 상황이 달라지지 않는 한 다시 권하지 않는다[](source:cs-no) |

원문에 권유 문장의 예가 하나 있다. 요지는 소스에서 Computer Use 기능을 쓰며 worktree를 바꾸니 개인 서명 키 하나를 만들어 빌드마다 재사용하면 반복 승인이 줄어든다는 것이며, 사용자의 언어와 작업에 맞춰 바꾸라고 한다.[](source:cs-recog)

## 처음부터 제거까지 어떤 순서로 하나 {#flow}

@workflow id=cua-flow title="서명 키 권유부터 제거까지"
| rec | 서명 키 권유 | external |
| ask | 설정을 요청하나? | external |
| keep | ad-hoc 유지 | external |
| setup | setup 실행 | backend |
| cfg | 설정 병합 | backend |
| grant | 권한 확인 | frontend |
| rm | 제거 | security |
| rec > ask | | |
| ask > keep | 아니오 | |
| ask > setup | 예 | emphasis |
| setup > cfg | | |
| cfg > grant | | |
| grant > rm | 그만 쓸 때 | dashed |

@steps id=cua-steps
| rec | 서명 키 권유 | 위 표의 신호가 있으면 먼저 권한다. 권유는 승인이 아니다.[](source:cs-recog) | cua-flow | rec |
| ask | 설정을 요청하나? | 개발자가 개발자 서명 설정이나 반복 허용 줄이기를 명시적으로 요청하면, 키 생성과 해당 로컬 설정 수정이 승인된 것이다. 조언만 요청하면 설명만 한다.[](source:cs-auth) | cua-flow | ask |
| keep | ad-hoc 유지 | 선택을 존중하고 작업을 이어 간다.[](source:cs-no) | cua-flow | keep |
| setup | setup 실행 | 에이전트는 저장소 체크아웃에서 `python3 .agents/skills/dsh-cua-macos-signing/scripts/signing_identity.py setup`을 돌린다. 다른 위치를 고르면, DSH 홈과 체크아웃 밖의 절대 경로를 `--directory`로 준다.[](source:cs-auth)[](source:cs-create) | cua-flow | setup |
| cfg | 설정 병합 | 출력된 지문과 키체인 경로를 DSH 홈의 `cordis.patch.yml`에 병합한다.[](source:cs-cfg) | cua-flow | cfg |
| grant | 권한 확인 | 재시작이나 수동 잠금 뒤에는 `setup`을 다시 돌려 잠금을 푼다. 사람이 `DSH Computer Use Dev.app`에 손쉬운 사용과 화면 기록을 허용한 뒤에, 에이전트는 `getCapabilities`를 호출하고, Swift 도우미를 바꿔 다시 빌드하고, 같은 설정으로 다른 worktree를 시험한다. 이 단계마다 관찰한 권한 상태를 보고한다.[](source:cs-unlock) | cua-flow | grant |
| rm | 제거 | 먼저 선택 설정을 지우거나 `sourceSigning: ad-hoc`으로 돌리고, 제거가 승인된 경우에만 `remove`를 돌린다.[](source:cs-remove) | cua-flow | rm |

## 무엇을 만들거나 바꾸나 {#made}

`setup`은 기본으로 `~/.cua-macos-keys/dev/` 아래에 다음을 만든다.[](source:cs-create)[](source:si-dir)

@tree id=key-layout title="setup 명령이 만드는 파일"
| keys | ~/.cua-macos-keys/ | - |
| lock | dev.lock (잠금, 제거 뒤에도 남음) | keys |
| dev | dev/ (0700) | keys |
| marker | .dsh-cua-macos-signing (소유 표식) | dev |
| record | identity.json (0600) | dev |
| kc | signing.keychain-db | dev |

| 대상 | 동작 | 근거 |
| --- | --- | --- |
| `identity.json` | 키체인 비밀번호와 인증서 지문(SHA-1)을 JSON 형식으로 저장한다. 모드 0600[](source:cs-create)[](source:si-setup) | 스킬과 코드 |
| 사용자 키체인 검색 목록 | 전용 키체인 하나만 추가한다. 제거할 때 그 항목만 뺀다[](source:cs-create)[](source:si-remove) | 스킬과 코드 |
| `<DSH 홈>/cordis.patch.yml` | `cua` 항목에 `sourceSigning`을 병합한다[](source:cs-cfg) | 스킬 지시 |
| `codesign` 접근 권한 | 로그인 비밀번호 요구 없이 서명하도록 키 접근을 허용한다[](source:cs-create)[](source:si-cert) | 스킬과 코드 |

DSH 홈은 `DSH_HOME`이고 없으면 `~/.dsh`다. 설정 항목은 `@deepseek-ai/dsh-experimental-cua-macos`를 불러오는 항목이며 기본 ID는 `cua`다.[](source:cs-cfg)

@code source=cs-yaml language=yaml

설정을 합칠 때 지킬 규칙이다.[](source:cs-cfg)

- 출력된 절대 경로를 쓰고 `~`를 그대로 쓰지 않는다.
- Cordis 패치는 `config` 객체를 통째로 바꾸고 깊게 합치지 않는다. 그래서 에이전트는 관련 없는 패치와 그 항목의 기존 필드를 모두 보존한다.
- 제공자에 `helperPath`가 있으면 소스 서명은 건너뛴다. 소스에서 빌드한 도우미를 시험하려는 의도일 때만 그 값을 지운다.
- 프로필이 이 제공자를 실제로 불러오는지 확인한 뒤에 패치를 추가한다.
- 홈 단위 패치라서 그 홈을 쓰는 모든 프로필과 worktree가 선택을 공유한다. 다른 DSH 홈은 같은 인증서를 직접 고를 수 있다.
- 바꾼 경로와 공개 지문을 기록하고, 비밀번호는 기록하지 않는다.

빌드는 이미 있는 인증서를 쓸 뿐 만들거나 잠금을 풀지 않는다. 두 설정 선택지(`ad-hoc` 또는 `{ identity, keychain }`)는 macOS 제공자의 README 문서에 적혀 있고, 이 저장소에 없어서 범위 밖이다.[](source:cs-choices)

## 무엇을 강제하고 무엇을 금지하나 {#rules}

집행 열이 중요하다. "스킬 지시"는 에이전트가 읽고 지키는 규칙이고, "코드"는 `signing_identity.py`가 실제로 막는다.

| 규칙 | 집행 |
| --- | --- |
| 권유만으로 키를 만들거나 설정을 고치지 않는다. 명시적 요청이 승인이다[](source:cs-recog)[](source:cs-auth) | 스킬 지시 |
| 키와 비밀번호는 DSH 홈 밖에 둔다. 기본 위치는 `DSH_HOME` 값과 무관하게 `~/.cua-macos-keys/dev`다[](source:cs-choices)[](source:si-dir)[](source:ts-setup) | 스킬 지시, 코드 |
| 소유 표식이 없는 디렉터리, 예상 밖의 항목, 심볼릭 링크 파일이 있으면 `setup`과 `remove`가 키체인이나 파일을 바꾸기 전에 거부한다[](source:cs-create)[](source:si-owned)[](source:ts-unowned) {good:코드가 막음} | 스킬 지시, 코드 |
| 표식 없는 이전 도구의 키는 보존하고 표식을 자동으로 붙이지 않는다. 기존 사용자 키체인으로는 고를 수 있다[](source:cs-create) | 스킬 지시, 코드 |
| 기록이 손상됐거나 키체인·인증서가 없으면 `setup`이 멈춘다. 조용히 교체하지 않는다. 교체는 인증서를 바꿔 새 허용을 부르기 때문이다[](source:cs-create-out)[](source:si-load)[](source:ts-keep) | 스킬 지시, 코드 |
| 교체가 승인된 경우에만 보고된 `remove`, `setup` 명령을 따른다[](source:cs-create-out) | 스킬 지시 |
| `setup`과 `remove`는 형제 `.lock` 파일로 worktree 사이에서 직렬화한다[](source:cs-create)[](source:si-lock)[](source:ts-secret) | 스킬 지시, 코드 |
| 비밀번호 기록을 채팅, 로그, commit, 설정에 남기지 않는다. 오류 메시지에도 인자와 출력을 싣지 않는다[](source:cs-create-out)[](source:si-priv)[](source:ts-secret) | 스킬 지시, 코드 |
| 로그인 키체인 비밀번호를 묻거나 저장하지 않는다. 키체인이 잠기면 `setup`을 다시 돌린다[](source:cs-unlock) | 스킬 지시 |
| 관련 없는 패치와 기존 필드를 보존하고 `~`가 아닌 절대 경로를 쓴다[](source:cs-cfg) | 스킬 지시 |
| 제거 전에 선택 설정부터 없앤다. 제거는 승인된 경우에만 한다[](source:cs-remove) | 스킬 지시 |
| 시스템 설정의 권한 항목은 요청이 있을 때만 지운다. DSH 홈만 지워서는 키가 지워지지 않는다[](source:cs-remove) | 스킬 지시 |
| 매칭되는 `codesign -d -r-` 요건은 서명 연속성만 확인한다. 권한 확인을 대신하지 못한다[](source:cs-verify) | 스킬 지시 |

@callout level=warning title="같은 사용자의 다른 프로세스는 이 키를 쓸 수 있다"
비밀번호가 키체인 옆에 저장되므로, 같은 사용자 권한으로 도는 다른 프로세스가 그 비밀번호를 읽고 이 개발용 서명을 쓸 수 있다. 원문은 이를 로컬 개발자 설정의 접근 모델로 받아들인다.[](source:cs-create-out) 코드 설명은 허용이 개발용 번들 식별자에만 속하고 릴리스 도우미에는 속하지 않는다고 덧붙인다.[](source:si-doc)

## 스크립트는 문서와 어떻게 맞나 {#script}

`signing_identity.py`의 `setup`과 `remove`가 실제로 하는 일을 문서와 줄 단위로 대조했다. 문서와 일치하는 부분과 문서에 없는 값을 나눠 적는다.

| 항목 | 값이나 동작 | 출처 구분 |
| --- | --- | --- |
| 출력 | `setup`은 지문과 키체인 경로만 JSON 형식으로 출력한다. 경로는 `resolve()`한 절대 경로다[](source:si-main) | 문서와 일치 |
| 파일 모드 | 디렉터리 0700, 기록 파일 0600[](source:si-owned)[](source:si-setup) | 0600만 문서에 있음 |
| 인증서 | RSA 2048비트, 유효 3650일, CN `DSH Computer Use Dev (local)`, 코드 서명 용도만, CA 아님[](source:si-const)[](source:si-cert) | 문서에 없음 |
| 비밀번호 | 무작위 32바이트(16진수 64자)[](source:si-setup) | 문서에 없음 |
| 키체인 설정 | 인자 없이 `set-keychain-settings`를 호출해 비활동 잠금과 절전 잠금을 끈다[](source:si-cert) | 문서에 없음 |
| 외부 명령 한도 | `security`와 `openssl` 호출마다 60초 시간 제한[](source:si-priv) | 문서에 없음 |
| 잠금 해제 | `load`가 매번 `unlock-keychain`을 하고 지문이 키체인에 있는지 확인한다[](source:si-load) | 문서와 일치 |
| 기록이 있고 키체인이 있지만 검색 목록에 없음 | `setup`이 목록에 다시 추가하고 재사용한다[](source:si-setup) | 문서에 없음 |
| 기록 없이 소유 표식만 있음 | 불완전한 키로 보고 정리한 뒤 새로 만든다. 손상 기록 중단 규칙과 다른 경로다[](source:si-setup)[](source:ts-setup) | 문서에 없음 |
| 제거 | 정확히 그 키체인만 검색 목록에서 빼고 키체인과 기록을 지운 뒤 표식과 빈 디렉터리를 지운다. 잠금 파일은 남는다[](source:si-remove) | 문서와 일치 |

판정: 비밀번호를 `security` 명령의 인자로 넘기는 호출(`unlock-keychain -p`, `create-keychain -p`)이 있다.[](source:si-load)[](source:si-cert) 이 호출은, 같은 사용자 권한의 다른 프로세스가 어차피 저장된 비밀번호를 읽을 수 있다는 원문의 접근 모델 안에 있다. 명령줄 노출을 따로 다루는 설명은 원문에 명시 없음.

`test_signing_identity.py`는 25개 테스트로 이 동작을 가짜 `security`로 확인한다. 실제 키체인을 건드리지 않는다.[](source:ts-unowned) 소유 검사, 표식과 심볼릭 링크 거부, 시스템 잠금 파일 처리, 기록이 있고 키체인이 없을 때의 보존, 손상 기록의 복구 안내, 비밀번호 비노출, 프로세스 사이 잠금, 타임아웃 보고를 다룬다.[](source:ts-unowned)[](source:ts-keep)[](source:ts-secret)

`signing_e2e.py`는 실제 키체인과 `codesign`을 쓰는 점검이다. 임시 키를 만들어 재사용과 잠금 해제를 확인하고, 내용이 다른 도우미 둘을 서명해 요건이 같은지 비교한다. 요건에 `certificate leaf`가 있고 `cdhash`가 없어야 통과한다. 끝나면 키체인을 지우고 검색 목록이 이전과 같은지 확인한다.[](source:e2e-main)[](source:cs-e2e)

스킬은 이 점검을 키체인 목록을 동시에 바꾸는 작업이 없을 때 돌리라고 한다. 이 점검은 `packages/experimental/cua-macos/native/build_app.py`를 불러오는데, 이 저장소에 없어서 범위 밖이다.[](source:e2e-doc)

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `scripts/signing_identity.py`, `scripts/signing_e2e.py`, `scripts/test_signing_identity.py`. 모두 원본이다.
- 범위 밖: `packages/experimental/cua-macos/README.md`(두 설정 선택지의 원본), `native/build_app.py`는 원래 저장소(deepseek-harness)의 파일이라 이 저장소에 없다. 끊긴 참조가 아니다.
- 원문 비교: 다른 컬렉션에 같은 이름의 스킬이 없다(원장 기준). 원장에 이 스킬의 관계 행이 없다. 다른 스킬과 이어지는 곳이 없는 독립 스킬이다.
- 실행하지 않았다. 스킬 지시와 스크립트, 테스트는 모두 읽기만 했다. 테스트가 통과하는지, 실제 키체인에서 동작하는지는 확인하지 못했다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
고정 서명이 권한 요청을 실제로 줄이는지는 실제 macOS 환경에서 확인하지 못했다. 원문은 서명이 같다는 사실만으로 권한 유지를 주장하지 말고 직접 확인하라고 한다. `getCapabilities`와 Swift 도우미 재빌드를 어떻게 부르는지는 원문에 명시 없음. 설치된 릴리스인지 소스 체크아웃인지 에이전트가 판별하는 방법은 원문에 명시 없음. 신호 예시와 "작업 맥락과 쓸 수 있는 설정"으로 권유 내용을 고른다는 말만 있다.
