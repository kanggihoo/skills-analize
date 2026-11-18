# project-coding-standards — TypeScript·CLI·dashboard 코드 규칙과 PR 검증 순서 {#overview}

`project-coding-standards`는 에이전트가 이 저장소의 TypeScript, JavaScript, CLI, harness, server endpoint, dashboard 코드를 쓰거나 PR을 준비할 때 따를 구조 원칙, 코딩 규칙, 검증 단계를 정해 주는 스킬이다.[](source:cs-intro)

- 쓰는 때: 새 코드 작성, feature 리팩터링, CLI 도구, server endpoint 추가, PR 준비 때다.[](source:cs-front)
- 결과: 규칙에 맞는 코드와 PR이다. 이 스킬이 쓰는 파일은 없다. 마지막에 `pnpm run preflight`를 통과해야 한다.[](source:cs-gate)[](source:cs-list)
- 다른 스킬과의 관계: `project-evals`와 같은 `gd dev <guide> --test-grader` 검증을 쓴다(대안). 다른 스킬로 넘기는 문장은 없다.[](source:cs-domain)
- 하지 않는 것: 공유 설정(`tsconfig.json`, `.oxlintignore`, `package.json`)을 수정해 타입 검사나 lint 실패를 피하지 않는다.[](source:cs-config)

@answer scope="modern-web-guidance-src/project-coding-standards · 원본 파일 1개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source cs-front title="이름과 description" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=1:4
@source cs-intro title="개요" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=6:11
@source cs-pr title="PR 범위와 모듈성" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=15:23
@source cs-arch title="구조 원칙" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=27:41
@source cs-config title="설정을 약화하지 않는다" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=45:49
@source cs-io title="원격 I/O와 캐시" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=51:53
@source cs-clean title="생성물을 저장소에 두지 않는다" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=55:57
@source cs-ui title="frontend와 dashboard 규칙" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=61:75
@source cs-gate title="단계별 preflight" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=79:95
@source cs-domain title="분야별 검증" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=97:100
@source cs-hyg title="코드 위생" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=102:104
@source cs-list title="PR 전 점검표" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=108:118
@source pe-cal title="project-evals의 보정 검증 명령" path=modern-web-guidance-src/project-evals/SKILL.md lines=124:125
@source gr-pre title="grader-replay의 preflight 지시" path=modern-web-guidance-src/grader-replay/SKILL.md lines=75:75
@source ca-pre title="coherence-auditor의 preflight 옵션" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=37:40

## 어떻게 동작하나 {#flow span=12}

원문은 순서를 정하지 않고 판단 기준과 금지를 나열한다. 그래서 주제별로 한 행씩 적는다. 검증 단계(fast check, preflight, E2E)만 실행 조건이 갈린다.

| 적용 상황 | 참조 파일 | 바뀌는 판단 | 출력 사례 |
| --- | --- | --- | --- |
| PR 범위. 여러 구성요소를 건드리는 feature | PR 전체 | backend data model, CLI, frontend UI를 한 PR에 묶지 않는다. 데이터 층, CLI, UI 순서로 작은 PR이나 stack으로 나눈다 | 데이터 층 PR 다음에 CLI PR, 그다음 dashboard PR[](source:cs-pr) |
| 공용 추상화. LLM이나 agent workflow를 실행하는 코드 | `config.environment`, `src/harness/config.ts` | `config.environment.antigravityCliBin` 같은 저장소의 runner를 쓰고, 직접 만든 REST client나 fetch 반복을 쓰지 않는다. 에이전트 이름은 `Agents` enum으로 쓴다 | `Agents.CLAUDE_CODE` 같은 enum 값. 문자열을 직접 쓰지 않는다[](source:cs-arch) |
| 메타데이터. `targetFile`, `agent` 같은 속성이 필요한 코드 | `evals.json` | 경로 heuristic이나 정규식으로 추정하지 않고, 부모 폴더에 있는 `evals.json`에서 읽는다 | `evals.json`에서 읽은 `targetFile`[](source:cs-arch) |
| 프롬프트 | `*-prompts.ts` | 긴 프롬프트 템플릿과 system instruction을 runner 파일에 넣지 않고 별도 모듈에 둔다 | `dev-prompts.ts` 같은 파일[](source:cs-arch) |
| 공유 설정 | `tsconfig.json`, `.oxlintignore`, `package.json` | 타입 검사나 lint 실패를 피하려고 수정하지 않는다. 타입을 고치거나 JSDoc을 쓴다 | 의도한 경우가 아니면 그대로 둔다[](source:cs-config) |
| 원격 저장소 I/O. GCS 같은 곳에서 받는 코드 | `results/suites/`, `out/` | 필요한 prefix와 하위 폴더만 받고, 로컬에 이미 있는지 먼저 확인한다 | 버킷 전체를 받지 않는다[](source:cs-io) |
| 생성물. test 출력, debug 파일, cache | `.gitignore` | commit하지 않고 표준 출력 위치에 두며 `.gitignore`가 임시 파일을 제외하게 한다 | `results/suites/`와 `out/`[](source:cs-clean) |
| dashboard·UI. 정적 hosted와 로컬 서버 모두에서 도는 화면 | `src/dashboard/` | 로컬 Node 서버가 필요한 기능은 정적 모드에서 숨기거나 끈다. 로컬 서버에 `?source=local`을 넘긴다. run index와 시각으로 여러 run을 구분한다. URL을 만들 때 `//`로 시작하지 않게 slash를 정리한다 | `gd dashboard`는 로컬, GitHub Pages는 정적[](source:cs-ui) |
| 코드 위생 | JSON 파싱, 정규식 | `eval()`로 data를 파싱하지 않고 `JSON.parse()`를 쓴다. 정규식에 제어 문자를 그대로 넣지 않고 `[\u001b\u009b]`처럼 쓴다 | `JSON.parse()`[](source:cs-hyg) |
| 검증 단계. PR을 올리기 전 | `package.json` script | 모든 변경은 lint, typecheck, test를 통과한다. 모든 PR은 `pnpm run preflight`를 통과하고, `src/dashboard/` 변경은 `pnpm run test:e2e`도 돌린다. skills packaging은 `pnpm run publish-skills --dry-run`, 평가 capsule은 `gd dev <guide> --test-grader`로 확인한다. `git status`는 깨끗해야 한다 | `pnpm typecheck && pnpm lint`가 빠른 확인이다[](source:cs-gate)[](source:cs-domain) |

원칙마다 이유는 원문에 있다. PR을 작게 나누는 이유는 review, test, 되돌리기가 쉬워서이고, 설정을 약화하지 않는 이유는 엄격한 type safety가 협상 대상이 아니어서다.[](source:cs-pr)[](source:cs-config)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 원문에 명시 없음. 모델이 description을 보고 켠다. 호출 제한 필드는 없다[](source:cs-front) |
| 성격 | 코드와 PR의 규칙을 정하는 원칙형 스킬. 다른 스킬로 넘기는 문장이 없다 |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#r28} | `project-evals` | 대안 | 평가 capsule을 쓰거나 고칠 때 `gd dev <guide> --test-grader`로 grader 보정을 확인하라는 점이 `project-evals`의 보정 검증 명령과 같다. 직접 링크는 없다.[](source:cs-domain)[](source:pe-cal) |
| `grader-replay` {#r26} | **이 스킬** | 대안 | 둘 다 마지막 검증으로 `pnpm run preflight`를 요구한다. 연결을 지시한 문장은 없다.[](source:gr-pre)[](source:cs-gate) |
| `coherence-auditor` {#r27} | **이 스킬** | 대안 | `--preflight` 옵션이 `pnpm run preflight`를 실행하고, 이 스킬은 모든 PR에 그 통과를 요구한다. 연결을 지시한 문장은 없다.[](source:ca-pre)[](source:cs-gate) |

@architecture id=relation-map title="project-coding-standards와 이어지는 스킬"
| gr | grader-replay | backend |
| ca | coherence-auditor | backend |
| self | project-coding-standards(이 스킬) | backend |
| pe | project-evals | backend |
| gr > self | 대안 | dashed |
| ca > self | 대안 | dashed |
| self > pe | 대안 | dashed |

@code source=cs-front language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 구조 원칙, 코딩 규칙, preflight 단계, PR 점검표를 담은 유일한 파일이다 | 코드를 쓰거나 PR을 준비할 때 읽는다 | PR 범위, 공용 추상화, 메타데이터, 프롬프트, 공유 설정, 원격 저장소 I/O, 생성물, dashboard·UI, 코드 위생, 검증 단계 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 모든 PR | `pnpm run preflight`(build, typecheck, lint, 모든 workspace의 병렬 unit test)를 통과해야 한다 | [](source:cs-gate) |
| `src/dashboard/`의 frontend, visualizer, server endpoint를 건드린다 | `pnpm run test:e2e`를 돌린다. preflight에 포함되지 않는다. browser binary가 없으면 `pnpm run setup:playwright`를 먼저 돌린다 | [](source:cs-gate) |
| 공유 설정을 수정해 검사를 피한다 | 금지(Never). 타입을 고친다 | [](source:cs-config) |
| 원격 저장소에서 받는다 | 필요한 prefix만, 로컬에 있으면 받지 않는다 | [](source:cs-io) |
| build 뒤 `git status` | 변경이나 untracked 파일이 없어야 한다 | [](source:cs-domain) |
| 사람 승인 | 원문에 명시 없음 | [](source:cs-intro) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- dashboard·UI 규칙 — dashboard·UI · 개요에는 요지만 담았고 규칙 8개는 상세로 보냈다.
- PR 전 점검표 9개 — 검증 단계 · 규칙 본문과 겹쳐서 개요에 넣지 않았다.

@callout level=open-question title="확인하지 못한 것"
| `src/harness/config.ts`, `config.environment`, `package.json`의 script와 `src/dashboard/`는 이 컬렉션에 없다. 규칙이 실제 코드와 맞는지, `GD_DEV_USE_JETSKI`와 `--yolo` 같은 환경 토글이 어떻게 동작하는지는 확인하지 못했다. 명령은 모두 지시상 동작이고 실행하지 않았다.[](source:cs-arch) |

읽은 원본: 텍스트 파일 1개. 제외: 없음.
