# PR 전에 코드와 문서를 어떻게 점검하고 정기 점검은 어디 있나? {#repo-upkeep-page}

이 묶음은 순서가 있는 흐름이 아니라 점검 도구 모음이다. 스킬 사이의 호출은 두 가지다. `project-maintenance`가 문서 점검 항목에서 `coherence-auditor`의 감사 스크립트를 실행하라고 안내하고(R29), `coherence-auditor`가 서브에이전트에 감사를 맡긴다(R30).[](source:pm-audit)[](source:ca-script)[](source:ca-flow)

- `coherence-auditor`는 서브에이전트 `document-coherence-auditor`를 띄워 읽기 전용 감사를 맡긴다. 보고를 받은 뒤 메인 에이전트가 깨진 링크와 어긋난 파일을 직접 고친다.[](source:ca-flow)
- `project-maintenance`는 문서 점검 항목의 실행 빈도를 정하지 않는다. 머리말은 "some regularity"라고만 쓴다. 빈도가 적힌 것은 web-features 갱신 workflow(월·목 자동)뿐이다.[](source:pm-top)[](source:pm-feat)
- `project-coding-standards`는 다른 스킬과 직접 호출 관계가 없다. 같은 계열 관계(R26~R28)는 모두 추론이라 흐름으로 그리지 않았다.[](source:cs-gates)

@answer scope="로컬 SKILL.md 3개 · 관계 R26~R33 · 명령 실행 없음 · 원본 저장소의 docs·src 파일은 확인하지 못함"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source pm-top title="modern-web-guidance-src/project-maintenance/SKILL.md · 1267B · 전부 읽음(6~10행)" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=6:10
@source pm-items title="modern-web-guidance-src/project-maintenance/SKILL.md · 1267B · 전부 읽음(10~19행)" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=10:19
@source pm-audit title="modern-web-guidance-src/project-maintenance/SKILL.md · 1267B · 전부 읽음(21~24행)" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=21:24
@source pm-feat title="modern-web-guidance-src/project-maintenance/SKILL.md · 1267B · 전부 읽음(18행)" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=18:18
@source ca-top title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 전부 읽음(2~8행)" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=2:8
@source ca-flow title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 전부 읽음(10~14행)" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=10:14
@source ca-def title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 전부 읽음(15~26행)" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=15:26
@source ca-script title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 전부 읽음(25행)" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=25:25
@source ca-checks title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 전부 읽음(28~35행)" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=28:35
@source ca-pre title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 전부 읽음(37~39행)" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=37:39
@source ca-inst title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 전부 읽음(42~49행)" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=42:49
@source ca-after title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 전부 읽음(51~54행)" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=51:54
@source ca-ts title="modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts · 4457B · 관계 확인용 일부(71~98행)" path=modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts lines=71:98
@source cs-top title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 관계 확인용 일부(3~11행)" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=3:11
@source cs-gates title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 관계 확인용 일부(79~100행)" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=79:100
@source gr-pre title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · 관계 확인용 일부(20~26행)" path=modern-web-guidance-src/grader-replay/SKILL.md lines=20:26
@source gr-end title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · 관계 확인용 일부(75행)" path=modern-web-guidance-src/grader-replay/SKILL.md lines=75:75
@source pe-calib title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 관계 확인용 일부(120~134행)" path=modern-web-guidance-src/project-evals/SKILL.md lines=120:134
@source pgv-test title="modern-web-guidance-src/project-guide-validation/SKILL.md · 14156B · 관계 확인용 일부(29행)" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=29:29
@source feat-tmp title="modern-web-guidance-src/project-features/SKILL.md · 16922B · 관계 확인용 일부(72행)" path=modern-web-guidance-src/project-features/SKILL.md lines=72:72
@source pg-tmp title="modern-web-guidance-src/project-guides/SKILL.md · 26181B · 관계 확인용 일부(49행)" path=modern-web-guidance-src/project-guides/SKILL.md lines=49:49

## 점검은 누가 누구에게 맡기나? {#delegation}

`coherence-auditor`가 서브에이전트에 위임하고 보고를 받아 직접 고치는 과정을 그렸다(R30). 서브에이전트가 읽는 `project-*` 스킬 목록은 R31이다.

@sequence id=audit-delegation title="문서 점검의 위임과 보고"
| actor maintenance | project-maintenance | backend |
| actor auditor | coherence-auditor | backend |
| actor sub | document-coherence-auditor | backend |
| actor repo | 저장소 파일 | database |
| phase | 점검 목록 |
| maintenance | auditor | R29 감사 스크립트 실행 안내 |
| phase | 1단계 위임 |
| auditor | sub | R30 서브에이전트 호출 | emphasis |
| sub | repo | R31 스크립트 실행과 읽기만 | dashed |
| sub | auditor | R30 감사 보고 | return |
| phase | 2단계 직접 수정 |
| auditor | repo | R30 깨진 링크 수정 | emphasis |

@steps id=upkeep-steps
| maintenance-step | project-maintenance | 정기 점검 항목 세 가지를 모아 두고, 문서 점검에서 감사 스크립트 실행을 안내한다.[](source:pm-items)[](source:pm-audit) | audit-delegation | maintenance |
| auditor-step | coherence-auditor | 서브에이전트에 감사를 맡기고 보고를 받아 깨진 링크와 어긋난 파일을 직접 고친다.[](source:ca-flow)[](source:ca-after) | audit-delegation | auditor |
| sub-step | document-coherence-auditor | 감사 스크립트를 돌리고 `project-*` 스킬을 읽어 모순을 보고한다. 저장소 파일은 수정하지 않는다.[](source:ca-inst) | audit-delegation | sub |
| standards-step | project-coding-standards | 코드 규칙과 PR 통과 조건을 정한다. 다른 스킬을 호출하지 않는다.[](source:cs-top)[](source:cs-gates) |

위임 내용을 표로 정리한다.

| 보내는 쪽 | 받는 쪽 | 하는 일 | 주고받는 것 | 제약 |
|---|---|---|---|---|
| `coherence-auditor` (1단계, 필수) | `document-coherence-auditor` | 감사 스크립트를 실행하고 `docs/CONTEXT.md`와 `project-*` 스킬의 단계·checkpoint·역할·기술 요구가 모순되지 않는지 읽고 확인한다.[](source:ca-flow)[](source:ca-inst) | 발견·경고·오류와 깨진 링크의 파일·줄, 수정 제안을 담은 감사 보고서[](source:ca-inst) | 저장소 파일을 수정하지 않는다. 읽기 전용 감사다.[](source:ca-inst) |
| `document-coherence-auditor` (보고) | `coherence-auditor`의 메인 에이전트 (2단계) | 보고를 검토한다. 깨진 링크와 어긋난 파일을 직접 고치고 경고를 처리한다.[](source:ca-after) | 수정된 저장소 파일 | 원문에 명시 없음: 수정 후 감사를 다시 돌리는지 |

호스트 에이전트의 서브에이전트 도구(`define_subagent`, `invoke_subagent`)는 이 컬렉션에 없다. 위 표의 상태는 지시상 동작이다.[](source:ca-flow)

## 어떤 관계가 있고 무엇이 그림에서 빠졌나? {#relations}

원장의 관계 R26~R33을 모두 적었다. 종류와 조건은 원장과 같다.

| rel-id · 종류 | 전달물과 조건 | 그림 반영 |
|---|---|---|
| R26 · 같은 계열 | `grader-replay`와 `project-coding-standards`. 둘 다 마지막 검증으로 `pnpm run preflight`를 요구하고, grader 검증으로 `gd dev <guide> --test-grader`를 쓴다. 연결을 지시한 문장은 없다. 근거 방식은 추론이다.[](source:gr-pre)[](source:gr-end)[](source:cs-gates) | 생략 |
| R27 · 같은 계열 | `coherence-auditor`와 `project-coding-standards`. `--preflight` 옵션이 `pnpm run preflight`를 실행하고, `project-coding-standards`는 모든 PR에 이 통과 조건을 요구한다. 연결을 지시한 문장은 없다. 추론이다.[](source:ca-pre)[](source:ca-ts)[](source:cs-gates) | 생략 |
| R28 · 같은 계열 | `project-coding-standards`와 `project-evals`. evaluation capsule을 쓰거나 고칠 때 `gd dev <guide> --test-grader`로 grader 보정을 확인하라는 점이 `project-evals`의 보정 검증 명령과 같다. 직접 링크는 없다. 추론이다.[](source:cs-gates)[](source:pe-calib) | 생략 |
| R29 · 넘김 | `project-maintenance` → `coherence-auditor`. "Document Coherence & Link Integrity" 항목에서 감사 스크립트를 실행하라고 한다. 얼마나 자주인지와 사용자 개입은 원문에 명시 없음이다. 머리말은 "some regularity"라고만 쓴다.[](source:pm-top)[](source:pm-audit)[](source:ca-script) | 표시 |
| R30 · 내부 위임 | `coherence-auditor` → 서브에이전트 `document-coherence-auditor`(SKILL.md 안에서 정의). 1단계에서 `define_subagent`와 `invoke_subagent`로 띄운다(필수 단계). 서브에이전트는 저장소 파일을 수정하지 않는다. 끝나면 메인 에이전트가 2단계에서 깨진 링크와 어긋난 파일을 직접 고치고 경고를 처리한다.[](source:ca-flow)[](source:ca-def)[](source:ca-after) | 표시 |
| R31 · 참고 | `coherence-auditor` → `project-*` 스킬 8개. glob `.agents/skills/project-*/SKILL.md`로 지정한다. 이 스킬들과 `docs/CONTEXT.md`의 단계·checkpoint·역할·기술 요구가 서로 모순되지 않는지 읽고 확인한다. `docs/CONTEXT.md`는 이 컬렉션에 없다.[](source:ca-checks)[](source:ca-inst)[](source:ca-ts) | 읽기 전용 화살표로 표시 |
| R32 · 같은 계열 | `coherence-auditor`와 `project-guide-validation`. 둘 다 `node --test src/authoring/guides-integrity.test.ts`를 실행해 frontmatter와 markdown을 검증한다. 연결을 지시한 문장은 없다. 추론이다.[](source:ca-checks)[](source:ca-ts)[](source:pgv-test) | 생략 |
| R33 · 같은 계열 | `project-maintenance`와 `project-features`. 둘 다 web-features 갱신 뒤 `src/ci/generate-feature-to-groups.ts`를 실행하라고 한다. 연결을 지시한 문장은 없다. 추론이다.[](source:pm-feat)[](source:feat-tmp) | 생략 |

판정 · R31의 대상 이름 8개는 접두어 `project-*`가 맞는 폴더를 내가 풀어 쓴 것이다. 원문에는 glob만 있다.[](source:ca-inst)

R26~R28, R32, R33은 같은 명령을 쓴다는 점만 근거라서 한 스킬이 다른 스킬을 부른다는 뜻이 아니다.

## 어떤 파일과 명령을 같이 쓰나? {#state}

원장에 이 묶음의 공유 상태 관계는 없다. 같은 명령을 여러 스킬이 쓰는 경우만 표로 남긴다.

| 파일·명령 | 쓰는(실행하는) 스킬 | 읽는(요구하는) 스킬 · 조건 |
|---|---|---|
| `docs/CONTEXT.md`와 `.agents/skills/project-*/SKILL.md` (R31) | 쓰는 스킬 없음. 서브에이전트는 수정하지 않는다.[](source:ca-inst) | `document-coherence-auditor`가 읽고 모순을 확인한다. 스크립트는 `docs/CONTEXT.md`가 있을 때 `project-*` 목록을 출력한다.[](source:ca-ts) |
| `pnpm run preflight` (R26, R27) | `coherence-auditor`의 스크립트가 `--preflight` 옵션일 때 실행한다.[](source:ca-pre)[](source:ca-ts) | `project-coding-standards`가 모든 PR에 통과를 요구하고, `grader-replay`가 마지막 검증으로 쓴다.[](source:cs-gates)[](source:gr-end) |
| `node --test src/authoring/guides-integrity.test.ts` (R32) | `coherence-auditor`의 스크립트가 실행한다.[](source:ca-ts) | `project-guide-validation`이 자동 검증으로 실행한다.[](source:pgv-test) |

@callout level=open-question title="원문 표기 확인: 번호 누락"
| `coherence-auditor` SKILL.md의 검사 목록(31~35행)에는 4번이 없고 3번 다음이 5번이다.[](source:ca-checks) 서브에이전트 지시 목록(43~49행)에는 6번이 없고 5번 다음이 7번이다.[](source:ca-inst) |
| 항목이 빠졌는지 번호만 틀렸는지는 원문에 명시 없음이다. |

## 어디까지 대조했고 무엇이 남았나? {#audit-panel}

이 페이지는 묶음 스킬 3개의 `SKILL.md`를 읽고 원장 R26~R33과 대조했다. `project-maintenance`(1267B)와 `coherence-auditor`(3454B)는 `SKILL.md` 전부와 `coherence-audit.ts` 71~98행을 읽었다. `project-coding-standards`와 관계 대상 스킬은 관계가 나온 줄만 읽었다.

관계 8개(R26~R33)를 모두 원문과 대조했다. 번역본은 이 컬렉션에 없어 열지 않았다. 구조·표본만 읽은 파일은 이 페이지에서 0개다. 스킬 내부 규칙과 수치는 스킬 페이지에서 다룬다.

@callout level=open-question title="미확인 범위"
| `pnpm`, `node`, `define_subagent`, `invoke_subagent` 호출은 읽기만 했고 실행하지 않았다. 상태는 지시상 동작으로만 적었다.[](source:ca-flow) |
| `docs/CONTEXT.md`, `src/ci/*.ts`, `src/authoring/guides-integrity.test.ts`, `.github/workflows/update-web-features.yml`은 이 저장소에 없어 확인하지 못했다. |

자동 검증은 HTML 구조와 출처 해석을 확인한다. 실제 효과와 독자의 이해는 별도로 확인해야 한다. 사람 검토는 미실시다.
