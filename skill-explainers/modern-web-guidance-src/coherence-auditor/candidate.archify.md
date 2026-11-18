# coherence-auditor — 문서 일관성과 링크, git 상태를 읽기 전용으로 감사 {#overview}

`coherence-auditor`는 에이전트가 감사 전용 서브에이전트를 띄워 저장소 문서의 일관성, 링크, git 상태를 읽기 전용으로 점검하게 하고, 돌아온 보고를 메인 에이전트가 직접 고치게 하는 스킬이다.[](source:ca-intro)[](source:ca-spawn)

- 쓰는 때: 문서가 바뀌었을 때, open question에 답했을 때, milestone commit 전이다. 필요할 때 부르는 on-demand 스킬이다.[](source:ca-front)[](source:ca-intro)
- 결과: 서브에이전트의 구조화된 보고(발견, 경고, 오류, 깨진 링크의 파일과 줄, 수정 제안)가 나오고, 메인 에이전트가 깨진 링크를 고친다.[](source:ca-sub-do)[](source:ca-after)
- 다른 스킬과의 관계: `project-maintenance`가 이 스킬의 script를 실행하라고 안내한다(다음 안내). 서브에이전트는 `project-*` 스킬을 읽고 대조한다(참고).[](source:pm-doc)[](source:ca-sub-do)
- 하지 않는 것: 서브에이전트는 저장소 파일을 수정하지 않는다. 수정은 메인 에이전트가 2단계에서 한다.[](source:ca-sub-do)[](source:ca-after)

@answer scope="modern-web-guidance-src/coherence-auditor · 원본 파일 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source ca-front title="이름과 description" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=1:4
@source ca-intro title="스킬 소개" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=6:8
@source ca-spawn title="서브에이전트 띄우기 지시" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=10:13
@source ca-def title="서브에이전트 정의" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=15:26
@source ca-checks title="script의 검사 목록" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=28:35
@source ca-pre title="--preflight 실행" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=37:40
@source ca-sub-do title="서브에이전트의 지시" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=42:49
@source ca-after title="보고 처리 단계" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=51:54
@source ca-git title="script의 git 상태와 root clutter 검사" path=modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts lines=18:30
@source ca-link title="script의 링크 검사" path=modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts lines=32:48
@source ca-ctx title="script의 CONTEXT 대조 목록 출력" path=modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts lines=71:76
@source ca-test title="script의 guides integrity 테스트와 preflight" path=modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts lines=78:98
@source pm-doc title="project-maintenance의 감사 항목" path=modern-web-guidance-src/project-maintenance/SKILL.md lines=21:24
@source cs-pre title="project-coding-standards의 preflight 조건" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=87:89
@source pgv-test title="project-guide-validation의 integrity 테스트" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=29:29

## 어떻게 동작하나 {#flow span=12}

원문은 두 단계를 번호로 지시한다. 1단계는 서브에이전트를 띄우는 것이고, 2단계는 그 출력을 처리하는 것이다. 서브에이전트의 일은 1단계의 정의 안에 들어 있다. 그림에서는 서브에이전트가 하는 감사와 의미 검토를 가운데에 놓았다.[](source:ca-spawn)[](source:ca-after)

@workflow id=flow-diagram title="coherence-auditor 흐름"
| lane main | 메인 에이전트 |
| lane sub | 서브에이전트 |
| spawn | 서브에이전트 띄우기 | backend | main | source:ca-spawn |
| audit | 감사 script 실행 | backend | sub | source:ca-sub-do |
| review | 의미 검토와 보고 | backend | sub | source:ca-sub-do |
| fix | 보고 처리 | backend | main | source:ca-after |
| spawn > audit | 위임 |
| audit > review | 출력 |
| review > fix | 보고 | emphasis |

@steps id=flow-steps
| s-spawn | 서브에이전트 띄우기 | **입력** 서브에이전트 정의(이름, description, system prompt) · **실행** `define_subagent`, `invoke_subagent` · **출력** 실행 중인 `document-coherence-auditor`. **처리** 메인 에이전트가 정의대로 감사 전용 서브에이전트를 만들어 부른다.[](source:ca-spawn)[](source:ca-def) | flow-diagram | spawn |
| s-audit | 감사 script 실행 | **입력** 저장소 작업 트리 · **참조** `scripts/coherence-audit.ts` · **실행** `node .agents/skills/coherence-auditor/scripts/coherence-audit.ts` · **출력** 검사 결과 로그. **처리** script가 git 상태, root clutter, 링크, TODO, skills 설정, `project-*` 목록, guides integrity 테스트를 차례로 검사한다. → 내부: `coherence-audit.ts`(코드 확인)[](source:ca-checks)[](source:ca-git) **다음** 전체 preflight가 필요하면 `--preflight`를 붙일 수 있다. 붙일지는 원문에 조건이 없다.[](source:ca-pre) | flow-diagram | audit |
| s-review | 의미 검토와 보고 | **입력** 로그 · **참조** `docs/CONTEXT.md`, `.agents/skills/project-*/SKILL.md` · **출력** 발견·경고·오류를 담은 구조화 보고. **처리** 서브에이전트가 단계, checkpoint, 역할, 기술 요구가 서로 모순되지 않는지 읽어 확인하고, 깨진 링크는 파일과 줄에 수정안을 붙인다.[](source:ca-sub-do) **다음** 저장소 파일은 고치지 않는다(읽기 전용). | flow-diagram | review |
| s-fix | 보고 처리 | **입력** 서브에이전트 보고 · **출력** 고쳐진 링크와 파일, 처리된 경고. **처리** 메인 에이전트가 깨진 링크와 어긋난 파일을 고치고 마무리 전에 경고를 처리한다.[](source:ca-after) | flow-diagram | fix |

원문 번호가 빠진 곳이 있다. 검사 목록은 3 다음에 5가 오고(4 없음), 서브에이전트 지시는 5 다음에 7이 온다(6 없음). `coherence-audit.ts`의 주석도 4가 없다. 항목이 빠졌는지는 원문에 명시 없음.[](source:ca-checks)[](source:ca-sub-do)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 원문에 명시 없음. 모델이 description을 보고 켠다. 호출 제한 필드는 없다[](source:ca-front) |
| 성격 | 서브에이전트에 읽기 전용 감사를 맡기고 보고를 받아 직접 고치는 절차 |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `project-maintenance` {#r29} | **이 스킬** | 다음 안내 | "Document Coherence & Link Integrity" 항목에서 이 스킬의 script를 실행하라고 한다. 주기와 사용자 개입은 원문에 명시 없음.[](source:pm-doc) |
| **이 스킬** {#r30} | 서브에이전트 `document-coherence-auditor` | 호출 | 1단계에서 `define_subagent`와 `invoke_subagent`로 띄우는 필수 단계다. 끝나면 메인 에이전트가 2단계로 돌아온다.[](source:ca-spawn)[](source:ca-after) |
| **이 스킬** {#r31} | `project-*` 스킬 8개(`project-coding-standards`, `project-discipline-guides`, `project-evals`, `project-features`, `project-guide-validation`, `project-guides`, `project-maintenance`, `project-use-cases`) | 참고 | 서브에이전트가 `.agents/skills/project-*/SKILL.md`와 `docs/CONTEXT.md`를 읽고 모순이 없는지 확인한다. script는 `docs/CONTEXT.md`가 있을 때만 목록을 출력한다. 이름 8개는 접두어에 맞는 폴더로 풀었다(판정).[](source:ca-sub-do)[](source:ca-ctx) |
| **이 스킬** {#r27} | `project-coding-standards` | 대안 | `--preflight`가 `pnpm run preflight`를 실행하고, `project-coding-standards`도 같은 통과 조건을 요구한다. 연결을 지시한 문장은 없다.[](source:ca-test)[](source:cs-pre) |
| **이 스킬** {#r32} | `project-guide-validation` | 대안 | 둘 다 `node --test src/authoring/guides-integrity.test.ts`를 실행한다. 연결을 지시한 문장은 없다.[](source:ca-checks)[](source:pgv-test) |

@architecture id=relation-map title="coherence-auditor와 이어지는 스킬"
| pm | project-maintenance | backend |
| self | coherence-auditor(이 스킬) | backend |
| sub | document-coherence-auditor | backend |
| ps | project-* 스킬 8개 | backend |
| cs | project-coding-standards | backend |
| pgv | project-guide-validation | backend |
| pm > self | 다음 안내 |
| self > sub | 호출 |
| self > ps | 참고 |
| self > cs | 대안 | dashed |
| self > pgv | 대안 | dashed |

@code source=ca-front language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 서브에이전트 정의와 2단계 절차를 담는다 | 스킬이 켜질 때 읽는다 | 서브에이전트 띄우기, 의미 검토와 보고, 보고 처리 |
| `scripts/coherence-audit.ts` | 검사 항목을 차례로 실행해 로그를 낸다 | 서브에이전트가 `node`로 실행한다. `--preflight` 인자가 있으면 `pnpm run preflight`도 돈다 | 감사 script 실행 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 서브에이전트가 감사하는 동안 | 저장소 파일을 수정하지 않는다. 읽기 전용 감사다(금지) | [](source:ca-sub-do) |
| 보고에 깨진 링크나 어긋난 파일이 있다 | 메인 에이전트가 고친다 | [](source:ca-after) |
| 보고에 경고가 있다 | 작업을 마무리하기 전에 처리한다 | [](source:ca-after) |
| 현재 branch가 `main`이다 | script가 경고를 낸다. 막지는 않는다 | [](source:ca-git) |
| 링크 검사 | `node_modules`, `dist`, `out`, `results` 폴더는 제외하고 상대 링크만 확인한다 | [](source:ca-link) |
| guides integrity 테스트가 실패한다 | script가 오류 로그를 남기고 계속 진행한다 | [](source:ca-test) |
| 사용자 확인이나 종료 조건 | 원문에 명시 없음 | [](source:ca-after) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 감사 script 검사 8개 — 감사 script 실행 · 개요에는 결과를 바꾸는 경고와 오류만 담았다. 각 검사의 대상 경로와 제외 규칙은 상세로 남긴다.

@callout level=open-question title="확인하지 못한 것"
| `docs/CONTEXT.md`, `src/core/skills-config.ts`, `src/authoring/guides-integrity.test.ts`와 `skills-src/`는 이 컬렉션에 없다. script는 읽었지만 그 동작은 실행해 보지 못했다. `define_subagent`와 `invoke_subagent`의 구현도 확인하지 못했다. 번호가 빠진 곳(4, 6)의 항목이 존재하는지는 원문에 없다. |

읽은 원본: 텍스트 파일 2개. 제외: 없음.
