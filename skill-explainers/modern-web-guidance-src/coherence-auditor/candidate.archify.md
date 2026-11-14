# coherence-auditor는 문서 일관성과 링크, git 상태를 무엇으로 감사하나? {#coherence-auditor-page}

`coherence-auditor`는 서브에이전트를 띄워 감사 스크립트를 돌리고 `docs/CONTEXT.md`와 `project-*` 스킬이 서로 모순되는지 읽게 한다. 서브에이전트는 저장소 파일을 고치지 않고 보고만 하며, 깨진 링크와 어긋난 파일은 보고를 받은 메인 에이전트가 직접 고친다.[](source:instr)[](source:process)

- 문서가 바뀌었을 때, open question에 답했을 때, milestone commit 전에 쓴다.[](source:front)
- 스크립트는 git 상태, 루트 markdown, 상대 링크, TODO 표지, skills 설정, guides integrity 테스트를 본다.[](source:checks)[](source:ca-git)
- 의미 일관성 검토는 스크립트가 아니라 서브에이전트가 `docs/CONTEXT.md`와 `project-*` 스킬을 읽어서 한다.[](source:instr)
- 스크립트에는 `process.exit` 호출이 없어, 깨진 링크나 테스트 실패가 있어도 보고만 하고 exit 0으로 끝난다.[](source:ca-all)

@answer scope="로컬 원본 분석 · SKILL.md 54줄과 scripts/coherence-audit.ts 100줄 전체 읽음 · node, git, pnpm 명령과 define_subagent, invoke_subagent 호출은 실행하지 않음 · 원본 저장소의 docs/, src/, guides/, .agents/skills/ 는 이 컬렉션에 없어 확인하지 못함"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source full title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 스킬 본문(54줄 전체)" path=modern-web-guidance-src/coherence-auditor/SKILL.md
@source front title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · frontmatter" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=1:4
@source intro title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 도입" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=6:8
@source spawn title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 서브에이전트 호출" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=10:13
@source subdef title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 서브에이전트 정의" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=15:21
@source cmd title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 실행 명령" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=23:26
@source checks title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 검사 항목" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=28:35
@source pre title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · preflight 옵션" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=37:40
@source instr title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 서브에이전트 지시" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=42:49
@source process title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 보고 처리" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=51:54
@source ca-all title="modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts · 4457B · 스크립트 본문(100줄 전체)" path=modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts
@source ca-head title="modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts · 4457B · import와 run helper" path=modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts lines=1:14
@source ca-git title="modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts · 4457B · git 상태와 루트 clutter" path=modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts lines=18:30
@source ca-link title="modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts · 4457B · 링크 검사" path=modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts lines=32:48
@source ca-todo title="modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts · 4457B · TODO 검사" path=modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts lines=50:54
@source ca-conf title="modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts · 4457B · skills 설정 검사" path=modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts lines=56:69
@source ca-ctx title="modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts · 4457B · CONTEXT 일관성 안내" path=modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts lines=71:76
@source ca-int title="modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts · 4457B · guides integrity 테스트" path=modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts lines=78:85
@source ca-pre title="modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts · 4457B · preflight 옵션" path=modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts lines=87:98
@source pm-intro title="modern-web-guidance-src/project-maintenance/SKILL.md · 1267B · 참조 확인용 읽음(머리말)" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=8:8
@source pm-cmd title="modern-web-guidance-src/project-maintenance/SKILL.md · 1267B · 참조 확인용 읽음(감사 명령)" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=21:24
@source cs-pre title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 참조 확인용 부분 읽음(preflight)" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=85:100
@source pgv title="modern-web-guidance-src/project-guide-validation/SKILL.md · 14156B · 참조 확인용 부분 읽음(29줄)" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=29:29

## 언제 켜지고 누가 무엇을 하나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 필드는 원문에 명시 없음.[](source:front)

@code source=front language=yaml

도입부는 "on-demand로 돌리도록 설계됐다"고 쓰고, 막힌 링크, 맞지 않는 매핑, 추적되지 않은 잡동사니, 풀리지 않은 TODO를 잡는 용도라고 한다.[](source:intro) `project-maintenance`는 "some regularity"로 돌리라고만 쓰고 주기는 원문에 명시 없음.[](source:pm-intro)[](source:pm-cmd)

1단계는 서브에이전트를 `define_subagent`와 `invoke_subagent`로 정의하고 부르는 것이다. 이름은 `document-coherence-auditor`다.[](source:spawn)[](source:subdef)

@sequence id=audit-delegation title="감사 위임과 보고"
| actor main | 메인 에이전트 | frontend |
| actor sub | document-coherence-auditor | backend |
| actor script | coherence-audit.ts | backend |
| actor repo | 저장소 파일 | database |
| main | sub | define_subagent, invoke_subagent | emphasis |
| sub | script | 감사 스크립트 실행 |
| script | sub | 경고·오류 출력 | return |
| sub | repo | docs/CONTEXT.md와 project-* 스킬 읽기(읽기 전용) | dashed |
| sub | main | 발견·경고·오류 보고, 깨진 링크는 수정 제안 | return |
| main | repo | 깨진 링크와 어긋난 파일 수정 | emphasis |

@steps id=audit-steps
| s-spawn | 서브에이전트 호출 | 메인 에이전트가 `document-coherence-auditor`를 정의하고 부른다. 설명은 "documentation coherence, link integrity, and git working-tree health"를 감사한다는 것이다.[](source:spawn)[](source:subdef) | audit-delegation | main~sub |
| s-run | 감사 스크립트 실행 | 서브에이전트가 `node .agents/skills/coherence-auditor/scripts/coherence-audit.ts`를 돌려 출력을 분석한다.[](source:cmd)[](source:instr) | audit-delegation | sub~script |
| s-read | 의미 일관성 검토 | 서브에이전트가 `docs/CONTEXT.md`와 모든 `project-*` 스킬을 읽고 단계, checkpoint, 역할, 기술 요구가 서로 모순되지 않는지 본다.[](source:instr) | audit-delegation | sub~repo |
| s-report | 보고 | 발견, 경고, 오류를 구조화해 보고한다. 깨진 링크는 파일과 줄을 찾아 수정안을 낸다. 용어 어긋남도 보고한다.[](source:instr) | audit-delegation | sub~main |
| s-fix | 메인 에이전트가 처리 | 메인 에이전트가 보고를 검토하고 깨진 링크와 어긋난 파일을 고치고, 마무리하기 전에 경고를 처리한다.[](source:process) | audit-delegation | main~repo |

@callout level=warning title="읽기 전용은 서브에이전트에만 걸린다"
| 서브에이전트는 저장소 파일을 직접 수정하지 말라는 지시를 받는다("read-only audit").[](source:instr) 파일을 고치는 단계는 보고를 받은 메인 에이전트의 몫이다.[](source:process) `--preflight`가 build, typecheck, lint, 전체 테스트를 돌리는데, 이 과정의 산출물까지 읽기 전용에 포함되는지는 원문에 명시 없음.[](source:pre) |

사람 승인 지점은 원문에 명시 없음. 종료 조건은 "경고를 처리한 뒤 마무리한다"까지만 쓰여 있다.[](source:process)

## 스크립트는 정확히 무엇을 검사하나? {#checks}

번호가 어긋난 곳이 세 군데 있다. 빠진 항목이 있는지는 원문에 명시 없음.[](source:checks)[](source:instr)[](source:ca-all)

- SKILL.md 검사 항목 7개는 번호가 1, 2, 3, 5, 6, 7, 8이다. 4가 없다.
- 스크립트의 섹션 주석도 1, 2, 3, 5, 6, 7, 8, 9다. 4가 없다.
- 서브에이전트 지시 7개는 1~5 다음에 6 없이 7, 8로 이어진다.

| 검사 | 스크립트가 실제로 하는 일 | 주의 |
|---|---|---|
| git 상태 | `git status --porcelain` 결과가 있으면 dirty 경고를 낸다. 현재 branch가 `main`이면 경고, 아니면 이름을 출력한다.[](source:ca-git) | `git` 명령이 실패하면 빈 문자열을 돌려주므로 "working tree is clean"으로 출력된다.[](source:ca-head)[](source:ca-git) |
| 루트 clutter | 루트의 `*.md` 중 `README.md`, `CONTRIBUTING.md`, `GOVERNANCE.md`, `AGENTS.md`, `CODE_OF_CONDUCT.md` 5개가 아닌 파일을 경고한다.[](source:ca-head)[](source:ca-git) | SKILL.md는 "untracked or non-canonical"이라고 쓰지만 스크립트는 추적 여부를 보지 않는다.[](source:checks) |
| 링크 | `**/*.md`에서 `[텍스트](상대경로)`를 찾아 `#` 앞 경로의 파일이 존재하는지 본다. `node_modules`, `dist`, `out`, `results` 아래는 뺀다.[](source:ca-link) | SKILL.md는 `dist/`와 `node_modules/`만 제외한다고 쓴다. 출력에는 파일과 링크만 있고 줄 번호가 없다. 스킴이나 `#`으로 시작하는 링크는 보지 않고, 앵커가 실제 있는지는 확인하지 않는다.[](source:checks)[](source:instr) |
| TODO 표지 | `git grep`으로 `TODO`, `TBD`, `FIXME`, `unresolved`, `decision needed`를 찾는다. 범위는 `guides/**/*.md`, `skills-src/**/*.md`, `docs/*.md`, `src/harness/README.md`, 루트 문서 5개다.[](source:ca-todo) | 추적된 파일만 검색한다. SKILL.md는 "other unresolved markers"라고만 쓴다.[](source:checks) |
| skills 설정 | `skills-src/`가 있을 때만 그 안의 `SKILL.md`가 `config.standaloneSkills`의 `sourcePath`에 있는지 확인하고 없으면 경고한다.[](source:ca-conf) | `skills-src/`가 없으면 이 검사는 아무것도 출력하지 않는다.[](source:ca-conf) |
| CONTEXT 일관성 | `docs/CONTEXT.md`가 있을 때만 `.agents/skills/project-*/SKILL.md` 경로를 나열한다.[](source:ca-ctx) | 의미 검토는 하지 않는다. SKILL.md가 말한 "`docs/CONTEXT.md` 목록"은 스크립트가 출력하지 않는다.[](source:checks) |
| guides integrity | `node --test src/authoring/guides-integrity.test.ts`를 실행한다. 실패하면 오류 메시지만 출력하고 계속한다.[](source:ca-int) | 실패해도 exit code가 바뀌지 않는다.[](source:ca-all) |
| preflight(선택) | `--preflight`를 주면 `pnpm run preflight`를 실행한다. 실패하면 오류 메시지만 출력한다.[](source:ca-pre)[](source:pre) | 주지 않으면 "Tip" 한 줄만 출력한다.[](source:ca-pre) |

@facts id=audit-facts
| 스크립트 검사 | 7개(git, 루트 clutter, 링크, TODO, skills 설정, CONTEXT 안내, guides integrity) + 선택 preflight[](source:ca-all) |
| 허용 루트 문서 | 5개[](source:ca-head) |
| 링크 검사 제외 폴더 | 4개(`node_modules`, `dist`, `out`, `results`)[](source:ca-link) |
| TODO 표지 | 5개(`TODO`, `TBD`, `FIXME`, `unresolved`, `decision needed`)[](source:ca-todo) |
| 종료 코드 | 코드 안에 `process.exit` 없음. 오류는 출력만 한다[](source:ca-all) |

판정 · 이 감사는 보고서를 읽는 사람이나 에이전트가 해석해야 하는 도구다. 스크립트가 어떤 문제에도 비정상 종료하지 않으므로, 자동 통과·실패 판정이나 CI 관문으로 쓰려면 별도 래퍼가 필요하다. 원문은 그런 용도를 말하지 않는다.[](source:ca-all)

## 흐름 속 위치는 어디인가? {#position}

@workflow id=position-flow title="project-maintenance에서 이 스킬로, project-* 스킬 검토로"
| before | project-maintenance | backend | source:pm-cmd |
| current | coherence-auditor | backend | source:full |
| after | project-* 스킬 8개 | security | source:ca-ctx |
| before > current | R29 넘김 | emphasis |
| current > after | R31 참고 | dashed |

@steps id=position-steps
| highlight | coherence-auditor | 이 페이지의 스킬이다. `project-maintenance`의 점검 목록에서 호출되고, `project-*` 스킬을 읽기 전용으로 검토한다.[](source:pm-cmd)[](source:instr) | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R29 · 넘김(`project-maintenance` → 이 스킬) | "Document Coherence & Link Integrity" 항목이 스크립트 명령을 보여 준다. 주기와 사용자 개입은 원문에 명시 없음.[](source:pm-intro)[](source:pm-cmd) |
| R30 · 내부 위임(이 스킬 → `document-coherence-auditor`) | 필수 1단계다. 서브에이전트가 스크립트를 돌리고 의미 검토를 하며 파일을 수정하지 않고, 끝나면 메인 에이전트가 2단계에서 깨진 링크와 경고를 직접 처리한다.[](source:spawn)[](source:instr)[](source:process) |
| R31 · 참고(이 스킬 → `project-*` 스킬 8개) | glob `.agents/skills/project-*/SKILL.md`로 대상을 정하고 `docs/CONTEXT.md`와 모순이 없는지 읽는다. 8개 이름은 이 컬렉션의 `project-*` 폴더(`project-coding-standards`, `project-discipline-guides`, `project-evals`, `project-features`, `project-guide-validation`, `project-guides`, `project-maintenance`, `project-use-cases`)로 풀었다. `docs/CONTEXT.md`는 이 컬렉션에 없다.[](source:instr)[](source:ca-ctx) |
| R27 · 같은 계열(`project-coding-standards`와) | `--preflight`가 `pnpm run preflight`를 실행하고 `project-coding-standards`는 모든 PR에 이 통과를 요구한다. 연결을 지시한 문장은 없다.[](source:pre)[](source:ca-pre)[](source:cs-pre) |
| R32 · 같은 계열(`project-guide-validation`과) | 둘 다 `node --test src/authoring/guides-integrity.test.ts`를 실행한다. 연결을 지시한 문장은 없다.[](source:checks)[](source:ca-int)[](source:pgv) |

전체 흐름은 색인 기준 `_group-repo-upkeep/repo-upkeep.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `modern-web-guidance-src/coherence-auditor/SKILL.md` 54줄, 3,454B와 `scripts/coherence-audit.ts` 100줄, 4,457B, 텍스트 2개를 끝까지 읽었다.[](source:full)[](source:ca-all) |
| 참조 확인용 읽음 | `project-maintenance/SKILL.md` 8, 21~24줄, `project-coding-standards/SKILL.md` 85~100줄, `project-guide-validation/SKILL.md` 29줄. 관계 원장 R27, R29, R32를 대조하려고 읽었다.[](source:pm-cmd)[](source:cs-pre)[](source:pgv) |
| 제외 | 이 폴더에는 번역본과 바이너리가 없다. |
| 부분 읽음 | 위 참조 확인용 3개 파일 |

활성화 시점 3가지, 서브에이전트 이름과 설명, 검사 항목 7개와 번호 누락, 서브에이전트 지시 7개와 번호 6 누락, `--preflight` 동작, "read-only" 금지, 보고 후 메인 에이전트의 수정 의무, 스크립트의 허용 루트 문서 5개, 제외 폴더 4개, TODO 표지 5개, 종료 코드 동작을 원문과 대조했다.

@callout level=open-question title="확인하지 못한 부분"
| 이 컬렉션에는 `docs/CONTEXT.md`, `src/core/skills-config.ts`, `src/core/paths.ts`, `src/authoring/guides-integrity.test.ts`, `.agents/skills/project-*`의 원본 위치가 없다. 스크립트의 `import` 경로(`../../../../src/...`)는 원격 배치(`.agents/skills/coherence-auditor/scripts/`)를 전제하므로 이 저장소 위치에서는 풀리지 않는다. `define_subagent`와 `invoke_subagent`가 어떤 호스트에서 쓰이는지, 두 도구가 없을 때 무엇을 하는지는 원문에 명시 없음. 어떤 명령도 실행하지 않았다. |

분석 중 원본은 수정하지 않았다. 관계 원장은 이미 확정된 것을 그대로 썼다.
