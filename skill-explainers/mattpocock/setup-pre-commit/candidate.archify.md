# setup-pre-commit 스킬은 에이전트를 어떻게 바꾸나 {#setup-pre-commit-skill}

`setup-pre-commit`을 쓰면 에이전트는 현재 저장소에 Husky commit 전 훅을 설치한다. 훅은 스테이징된 파일에 Prettier를 돌리고, 이어서 타입 검사와 테스트를 돌린다.[](source:skill-what)

- 패키지 관리자는 잠금 파일로 고른다. 애매하면 npm을 쓴다.[](source:skill-detect)
- 사용자에게 묻는 단계가 없다. `typecheck`나 `test` 스크립트가 없을 때만 그 줄을 빼고 사용자에게 알린다.[](source:skill-hook)
- 마지막에 바뀐 파일을 모두 스테이징하고 직접 commit한다. 이 commit이 새 훅의 첫 시험이다.[](source:skill-commit)
- 판정: commit 전에 사용자 확인을 받으라는 말이 없어서, 이 스킬이 켜지면 commit까지 한 번에 간다.[](source:skill-commit)

@answer scope="mattpocock/setup-pre-commit · 원본 텍스트 파일 2개 · 커밋 0f0d1b0"
@meta locale=ko
@source skill-fm title="mattpocock/setup-pre-commit/SKILL.md · 2258B · frontmatter" path=mattpocock/setup-pre-commit/SKILL.md lines=1:4
@source skill-what title="SKILL.md · 설치하는 것" path=mattpocock/setup-pre-commit/SKILL.md lines=8:13
@source skill-detect title="SKILL.md · 1단계 패키지 관리자 감지" path=mattpocock/setup-pre-commit/SKILL.md lines=17:19
@source skill-install title="SKILL.md · 2~3단계 설치와 Husky 초기화" path=mattpocock/setup-pre-commit/SKILL.md lines=21:35
@source skill-hook title="SKILL.md · 4단계 .husky/pre-commit" path=mattpocock/setup-pre-commit/SKILL.md lines=37:47
@source skill-lintstaged title="SKILL.md · 5단계 .lintstagedrc" path=mattpocock/setup-pre-commit/SKILL.md lines=49:55
@source skill-prettier title="SKILL.md · 6단계 .prettierrc" path=mattpocock/setup-pre-commit/SKILL.md lines=57:71
@source skill-verify title="SKILL.md · 7단계 확인 목록" path=mattpocock/setup-pre-commit/SKILL.md lines=73:79
@source skill-commit title="SKILL.md · 8단계 커밋" path=mattpocock/setup-pre-commit/SKILL.md lines=81:85
@source skill-notes title="SKILL.md · Notes" path=mattpocock/setup-pre-commit/SKILL.md lines=87:91
@source oa-yaml title="mattpocock/setup-pre-commit/agents/openai.yaml · 99B · 표시 정보" path=mattpocock/setup-pre-commit/agents/openai.yaml lines=1:3
@source gg-desc title="mattpocock/git-guardrails-claude-code/SKILL.md · description" path=mattpocock/git-guardrails-claude-code/SKILL.md lines=3:3

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

frontmatter에 `disable-model-invocation`이 없다. 그래서 모델이 `description`을 보고 스스로 켤 수 있다.[](source:skill-fm) `agents/openai.yaml`에도 `policy` 블록이 없다. 암묵 호출을 막는 `allow_implicit_invocation: false`가 없다는 뜻이다.[](source:oa-yaml)

`description`이 그리는 상황은 commit 전 훅, Husky, lint-staged, commit 시점의 포맷·타입 검사·테스트를 더하고 싶을 때다. 이 설명은 판단 참고용이다.

## 어떤 순서로 설치하나 {#flow}

@workflow id=setup-flow title="setup-pre-commit 진행 흐름"
| detect | 관리자 감지 | backend |
| install | 의존성 설치 | backend |
| files | 설정 파일 작성 | backend |
| verify | 확인 목록 | backend |
| commit | commit | backend |
| detect > install | | |
| install > files | | |
| files > verify | | |
| verify > commit | | emphasis |

@steps id=setup-steps
| s-detect | 관리자 감지 | `package-lock.json`이면 npm, `pnpm-lock.yaml`이면 pnpm, `yarn.lock`이면 yarn, `bun.lockb`이면 bun을 쓴다. 애매하면 npm이다. | setup-flow | detect |
| s-install | 의존성 설치 | `husky`, `lint-staged`, `prettier`를 개발 의존성으로 설치한다. 이어서 `npx husky init`으로 `.husky/`를 만들고 `package.json`에 `prepare: "husky"`를 넣는다. | setup-flow | install |
| s-files | 설정 파일 작성 | `.husky/pre-commit`, `.lintstagedrc`를 쓴다. Prettier 설정이 하나도 없을 때만 `.prettierrc`를 만든다. | setup-flow | files |
| s-verify | 확인 목록 | 아래 다섯 항목을 확인한다. 마지막 항목은 `npx lint-staged`를 직접 돌리는 것이다. | setup-flow | verify |
| s-commit | commit | 바뀐 파일을 모두 스테이징하고 `Add pre-commit hooks (husky + lint-staged + prettier)` 메시지로 commit한다. 새 훅이 이 commit에서 처음 돈다. | setup-flow | commit |

| 만드는 것 | 내용 | 조건 |
| --- | --- | --- |
| `.husky/pre-commit` | `npx lint-staged`, `npm run typecheck`, `npm run test` 세 줄. shebang 없음(Husky v9 이상)[](source:skill-hook) | `npm`은 감지한 관리자로 바꾼다. 스크립트가 없으면 그 줄을 빼고 알린다 |
| `.lintstagedrc` | `"*": "prettier --ignore-unknown --write"`[](source:skill-lintstaged) | 항상 |
| `.prettierrc` | 아래 기본값 7개[](source:skill-prettier) | Prettier 설정이 없을 때만 |
| `package.json` | 개발 의존성 3개, `prepare` 스크립트[](source:skill-install) | 항상 |

@facts
| `useTabs` | `false` |
| `tabWidth` | `2` |
| `printWidth` | `80` |
| `singleQuote` | `false` |
| `trailingComma` | `"es5"` |
| `semi` | `true` |
| `arrowParens` | `"always"` |

`--ignore-unknown`은 이미지처럼 Prettier가 읽지 못하는 파일을 건너뛰게 한다. 훅은 빠른 lint-staged를 먼저 돌리고, 저장소 전체 타입 검사와 테스트를 그 뒤에 돌린다.[](source:skill-notes)

## 언제 끝났다고 보나 {#done}

- [ ] `.husky/pre-commit`이 있고 실행 권한이 있다
- [ ] `.lintstagedrc`가 있다
- [ ] `package.json`의 `prepare` 스크립트가 `"husky"`다
- [ ] Prettier 설정이 있다
- [ ] `npx lint-staged`가 성공한다

위 목록은 7단계 원문 그대로다.[](source:skill-verify) 8단계 commit이 훅을 거쳐 성공하면 종단 시험까지 끝난다.[](source:skill-commit)

@callout level=warning title="커밋 범위와 확인 절차"
8단계는 "바뀌거나 만든 파일을 모두" 스테이징한다. 판정: 작업 트리에 이 스킬과 무관한 변경이 있으면 그것도 같은 commit에 들어갈 수 있다. commit 전 사용자 확인은 원문에 명시 없음.[](source:skill-commit)

판정: 원문 안에 작은 불일치가 있다. 설치는 감지한 관리자로 하라고 하지만, `npx husky init`과 확인 단계의 `npx lint-staged`는 `npx`로 고정돼 있다.[](source:skill-install)[](source:skill-verify) 이미 있는 lint-staged 설정(예: `package.json`의 키)을 어떻게 할지도 원문에 명시 없음.

## 다른 스킬과 어떻게 이어지나 {#relations}

| rel-id | 상대 | 종류 | 내용 |
| --- | --- | --- | --- |
| r08 | `git-guardrails-claude-code` | 같은 계열(추론) | 둘 다 장치로 실수를 막는다. 이 스킬은 commit 전에, `git-guardrails-claude-code`는 명령 실행 전에 막는다.[](source:gg-desc) |
| r09 | `retro` | 산출물 호환(추론) | `retro`가 "commit 전 훅도 CI도 없는 저장소"를 개선 후보로 내면 이 스킬이 실행 도구가 될 수 있다. `retro`는 이 스킬을 이름으로 부르지 않는다. |

관계 근거는 `mattpocock/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `agents/openai.yaml`. 두 파일 모두 원본이다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실행하지 않았다. 설치·파일 작성·commit은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"Prettier 설정이 있다"를 어떤 파일 이름으로 판단하는지는 원문에 명시 없음. `typecheck`·`test`가 실패해 8단계 commit이 막혔을 때 어떻게 할지도 원문에 명시 없음.
