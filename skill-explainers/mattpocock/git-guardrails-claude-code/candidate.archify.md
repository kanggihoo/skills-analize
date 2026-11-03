# git-guardrails-claude-code 스킬은 에이전트를 어떻게 바꾸나 {#git-guardrails-skill}

`git-guardrails-claude-code`를 쓰면 에이전트는 Claude Code에 PreToolUse 훅을 설치한다. 그 뒤로 Bash 명령에 위험한 git 패턴이 들어 있으면 훅이 종료 코드 2로 실행을 막는다.[](source:skill-intro)[](source:script-loop)

- 설치 전에 사용자에게 두 번 묻는다. 적용 범위(이 프로젝트/모든 프로젝트)와 막을 패턴의 추가·삭제다.[](source:skill-scope)[](source:skill-custom)
- 막는 방식은 명령 문자열에 `grep -E` 패턴 9개를 대 보는 것이다. git 문법을 해석하지 않는다.[](source:script-patterns)
- 판정: 문자열 비교라서 빈틈과 과잉 차단이 함께 있다. 예를 들어 `git -C repo push`는 통과하고, 커밋 메시지에 "git push"가 들어간 명령은 막힌다.[](source:script-patterns)
- 완료 확인은 가짜 `git push` 입력을 스크립트에 넣어 종료 코드 2와 `BLOCKED` 메시지를 보는 것이다.[](source:skill-verify)

@answer scope="mattpocock/git-guardrails-claude-code · 원본 텍스트 파일 3개 · 커밋 0f0d1b0"
@meta locale=ko
@source skill-fm title="mattpocock/git-guardrails-claude-code/SKILL.md · 2313B · frontmatter" path=mattpocock/git-guardrails-claude-code/SKILL.md lines=1:4
@source skill-intro title="SKILL.md · 목적과 차단 목록" path=mattpocock/git-guardrails-claude-code/SKILL.md lines=8:18
@source skill-scope title="SKILL.md · 1단계 범위 질문" path=mattpocock/git-guardrails-claude-code/SKILL.md lines=22:24
@source skill-copy title="SKILL.md · 2단계 스크립트 복사" path=mattpocock/git-guardrails-claude-code/SKILL.md lines=26:35
@source skill-settings title="SKILL.md · 3단계 settings 병합" path=mattpocock/git-guardrails-claude-code/SKILL.md lines=37:81
@source skill-custom title="SKILL.md · 4단계 패턴 조정 질문" path=mattpocock/git-guardrails-claude-code/SKILL.md lines=83:85
@source skill-verify title="SKILL.md · 5단계 확인" path=mattpocock/git-guardrails-claude-code/SKILL.md lines=87:95
@source oa-yaml title="mattpocock/git-guardrails-claude-code/agents/openai.yaml · 112B · 표시 정보" path=mattpocock/git-guardrails-claude-code/agents/openai.yaml lines=1:3
@source script title="mattpocock/git-guardrails-claude-code/scripts/block-dangerous-git.sh · 507B · 차단 훅" path=mattpocock/git-guardrails-claude-code/scripts/block-dangerous-git.sh lines=1:25
@source script-input title="block-dangerous-git.sh · 입력 읽기" path=mattpocock/git-guardrails-claude-code/scripts/block-dangerous-git.sh lines=3:4
@source script-patterns title="block-dangerous-git.sh · 패턴 목록" path=mattpocock/git-guardrails-claude-code/scripts/block-dangerous-git.sh lines=6:16
@source script-loop title="block-dangerous-git.sh · 비교와 종료 코드" path=mattpocock/git-guardrails-claude-code/scripts/block-dangerous-git.sh lines=18:25
@source pc-desc title="mattpocock/setup-pre-commit/SKILL.md · description" path=mattpocock/setup-pre-commit/SKILL.md lines=3:3

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

frontmatter에 `disable-model-invocation`이 없다. 그래서 모델이 `description`을 보고 스스로 켤 수 있다.[](source:skill-fm) `agents/openai.yaml`에도 `policy` 블록이 없어서 암묵 호출을 막는 `allow_implicit_invocation: false`가 없다.[](source:oa-yaml)

`description`이 그리는 상황은 위험한 git 작업을 막고 싶을 때, git 안전 훅을 더하고 싶을 때, `push`나 `reset`을 막고 싶을 때다. 이 설명은 판단 참고용이다. 특정 단어가 나와야만 켜지는 것은 아니다.

## 설치는 어떤 순서로 하나 {#install}

@workflow id=install-flow title="git-guardrails 설치 흐름"
| scope | 범위 질문 | frontend |
| hook | 훅 설치 | backend |
| custom | 패턴 질문 | frontend |
| verify | 시험 | backend |
| scope > hook | 답변 | |
| hook > custom | | |
| custom > verify | | emphasis |

@steps id=install-steps
| s-scope | 범위 질문 | 사용자에게 이 프로젝트만인지, 모든 프로젝트인지 묻는다. 답에 따라 아래 표의 경로가 갈린다. | install-flow | scope |
| s-hook | 훅 설치 | 동봉된 `block-dangerous-git.sh`를 hooks 폴더로 복사하고 `chmod +x`로 실행 권한을 준다. 이어서 settings 파일의 `hooks.PreToolUse`에 `matcher: "Bash"` 항목을 넣는다. 파일이 이미 있으면 배열에 합치고 다른 설정은 덮어쓰지 않는다. | install-flow | hook |
| s-custom | 패턴 질문 | 차단 목록에 패턴을 더하거나 뺄지 묻는다. 답에 맞춰 복사한 스크립트를 고친다. | install-flow | custom |
| s-verify | 시험 | `git push origin main`을 담은 JSON을 스크립트에 넣는다. 종료 코드 2와 stderr의 `BLOCKED` 메시지가 나와야 한다. | install-flow | verify |

| 범위 | 스크립트 위치 | 설정 파일 | 훅 명령 |
| --- | --- | --- | --- |
| 프로젝트 | `.claude/hooks/block-dangerous-git.sh` | `.claude/settings.json` | `"$CLAUDE_PROJECT_DIR"/.claude/hooks/block-dangerous-git.sh` |
| 전역 | `~/.claude/hooks/block-dangerous-git.sh` | `~/.claude/settings.json` | `~/.claude/hooks/block-dangerous-git.sh` |

위 표는 2·3단계 원문을 정리한 것이다.[](source:skill-copy)[](source:skill-settings) 완료 조건은 5단계의 시험 결과 하나다. 실제 Claude Code 세션에서 훅이 걸리는지 보라는 지시는 원문에 명시 없음.[](source:skill-verify)

@callout level=warning title="사용자 설정 파일을 고친다"
전역 범위를 고르면 `~/.claude/settings.json`을 고친다. 이 파일은 모든 프로젝트에 영향을 준다. 원문은 기존 설정을 덮어쓰지 말고 합치라고만 한다. 백업 지시는 원문에 명시 없음.

## 스크립트는 정확히 무엇을 막나 {#script}

@code source=script language=bash

스크립트는 표준 입력의 JSON에서 `jq`로 `.tool_input.command`를 꺼낸다.[](source:script-input) 그다음 패턴을 차례로 `grep -qE`에 대 본다. 처음 걸린 패턴에서 stderr에 메시지를 쓰고 `exit 2`로 끝난다. 하나도 안 걸리면 `exit 0`이다.[](source:script-loop)

| 패턴(정규식) | 막히는 예 | 판정: 빠지는 예 |
| --- | --- | --- |
| `git push` | `git push`, `git push --force`, `git pushx` | `git -C repo push`, `git  push`(공백 2칸) |
| `git reset --hard` / `reset --hard` | `git reset --hard`, `git -C repo reset --hard` | `git reset  --hard`(공백 2칸) |
| `git clean -fd` / `git clean -f` | `git clean -f`, `git clean -fdx` | `git clean -xfd`, `git clean --force` |
| `git branch -D` | `git branch -D x` | `git branch --delete --force x` |
| `git checkout \.` | `git checkout .`, `git checkout .env` | 없음 |
| `git restore \.` | `git restore .` | `git restore --staged .` |
| `push --force` | `git -C repo push --force` | `git -C repo push -f` |

표의 "막히는 예"와 "빠지는 예"는 분석자가 패턴을 따로 `grep -E`에 대 본 결과다. 스크립트 자체는 실행하지 않았다.[](source:script-patterns)

- 판정: `grep`은 명령 전체 문자열에서 찾는다. 그래서 `grep 'git push' notes.md`나 메시지에 "git push"가 든 `git commit`도 막힌다.[](source:script-loop)
- 판정: `git checkout \.`은 점으로 시작하는 파일 하나를 되돌리는 `git checkout .env`도 막는다.[](source:script-patterns)
- 판정: `jq`가 없으면 `COMMAND`가 빈 문자열이 되어 모든 명령이 `exit 0`으로 통과한다. `jq` 설치 확인은 원문에 명시 없음.[](source:script-input)

`SKILL.md`는 막힐 때 Claude가 "이 명령을 쓸 권한이 없다"는 메시지를 본다고 쓴다.[](source:skill-intro) 실제 스크립트 메시지는 "The user has prevented you from doing this."다.[](source:script-loop) 뜻은 같지만 문구가 다르다.

## 다른 스킬과 어떻게 이어지나 {#relations}

| rel-id | 상대 | 종류 | 내용 |
| --- | --- | --- | --- |
| r08 | `setup-pre-commit` | 같은 계열(추론) | 둘 다 사람이 아닌 장치로 실수를 막는다. 이 스킬은 명령 실행 전, `setup-pre-commit`은 커밋 전에 막는다.[](source:pc-desc) |
| r09 | `retro` | 산출물 호환(추론) | `retro`가 "안전장치 없는 저장소"를 개선 후보로 내면 이 스킬이 실행 도구가 될 수 있다. `retro`는 이 스킬을 이름으로 부르지 않는다. |

관계 근거는 `mattpocock/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `agents/openai.yaml`, `scripts/block-dangerous-git.sh`. 세 파일 모두 원본이다.
- 제외한 파일: 없음. 이 스킬 폴더에는 번역본이 없다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실행하지 않았다. 설치·질문·시험 실행은 모두 지시상 동작이다. 패턴 표는 패턴 문자열만 따로 `grep -E`로 확인했다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
종료 코드 2를 받은 Claude Code가 도구 호출을 어떻게 처리하는지는 Claude Code 문서의 영역이다. 이 스킬 원문에 명시 없음. 이미 다른 PreToolUse 훅이 `Bash`에 걸려 있을 때 실행 순서도 원문에 명시 없음.
