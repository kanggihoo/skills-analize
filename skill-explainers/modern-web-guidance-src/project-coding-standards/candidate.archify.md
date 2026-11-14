# project-coding-standards는 PR 전에 무엇을 지키게 하나? {#project-coding-standards-page}

`project-coding-standards`는 `modern-web-guidance-src` 저장소의 TypeScript·JavaScript·CLI·harness·server endpoint·dashboard 코드를 쓰거나 PR로 올리기 전에 쓰는 규칙집이다. 핵심은 PR 하나에 목적 하나, 기존 abstraction과 정본 데이터 재사용, 공유 설정 약화 금지, `pnpm run preflight` 통과다.[](source:overview)[](source:scope)[](source:tiers)

- PR은 data layer, CLI, UI 순으로 작게 쪼갠다. 백엔드·CLI·frontend를 한 PR에 묶지 않는다.[](source:scope)
- agent 이름은 `Agents` enum으로, 속성은 `evals.json` 같은 정본에서 읽는다. 문자열 상수와 경로 추측은 금지다.[](source:enums)
- `tsconfig.json`, `.oxlintignore`, `package.json`을 고쳐 typecheck나 lint 실패를 피하지 않는다.[](source:config)
- dashboard나 `src/dashboard/` 변경은 `pnpm run preflight`에 더해 `pnpm run test:e2e`도 통과해야 한다.[](source:tiers)

@answer scope="로컬 원본 분석 · 코드 작성과 명령 실행 없음 · 원본 저장소의 src 파일 미확인"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source full title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md
@source front title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=1:4
@source overview title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=8:11
@source scope title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=15:23
@source reuse title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=29:31
@source enums title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=33:37
@source prompts title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=39:41
@source config title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=47:49
@source remote title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=51:53
@source clean title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=55:57
@source dual title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=63:65
@source multi title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=67:69
@source url title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=71:72
@source ui title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=74:75
@source tiers title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=81:95
@source domain title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=97:100
@source hygiene title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=102:104
@source check title="modern-web-guidance-src/project-coding-standards/SKILL.md · 7793B · 원본" path=modern-web-guidance-src/project-coding-standards/SKILL.md lines=108:118
@source replay-cmd title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/grader-replay/SKILL.md lines=23:23
@source replay-end title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/grader-replay/SKILL.md lines=75:75
@source coh-pre title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=37:39
@source coh-glob title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=34:34
@source coh-read title="modern-web-guidance-src/coherence-auditor/SKILL.md · 3454B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=45:48
@source coh-script title="modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts · 4457B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/coherence-auditor/scripts/coherence-audit.ts lines=87:99
@source ev-cal title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 원본(관계 확인용 일부)" path=modern-web-guidance-src/project-evals/SKILL.md lines=124:125
@source lock title="modern-web-guidance-src/skills-lock.json · 설치 출처" path=modern-web-guidance-src/skills-lock.json

## 언제 켜지고 어떤 코드에 적용되나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 같은 호출 제한 필드는 원문에 명시되어 있지 않다.[](source:front)

@code source=front language=yaml

원문은 TypeScript, JavaScript, CLI 명령, harness 유틸리티, server endpoint, dashboard 코드를 쓸 때 이 지침을 따르라고 한다.[](source:overview) 호출 맥락으로는 새 코드 작성, feature refactoring, CLI 도구, server endpoint 추가, PR 준비를 든다.[](source:front) 사람 승인이나 종료 조건은 원문에 명시되어 있지 않다. 끝나는 기준은 아래 통과 조건이다.

## 코드를 쓸 때 무엇을 강제하고 금지하나? {#rules}

| 영역 | 해야 하는 것 | 금지 |
|---|---|---|
| PR 범위 | data layer(parsing·normalization·abstraction), CLI 흐름, UI·dashboard 순서로 작은 PR이나 stack으로 나눈다. 작아야 리뷰, 테스트, 되돌리기가 쉽다.[](source:scope) | 백엔드 data model, CLI 도구, frontend UI를 한 PR에 합치기 |
| LLM·agent 실행 | `config.environment`의 `antigravityCliBin`, `jetskiCliBin` 같은 공용 abstraction을 쓴다. `GD_DEV_USE_JETSKI === '1'` 같은 표준 환경 toggle을 따른다. 비대화형·진단 작업에서는 `--yolo` 같은 불필요한 flag를 뺀다.[](source:reuse) | 직접 만든 REST client, fetch loop, token 검증기 |
| agent 이름 | `src/harness/config.ts`의 `Agents`(`ANTIGRAVITY_CLI`, `JETSKI_CLI`, `CLAUDE_CODE`, `CODEX_CLI`)를 쓴다.[](source:enums) | agent 이름 문자열 하드코딩 |
| 메타데이터 | 상위 폴더에 `evals.json` 같은 정본이 있으면 `targetFile`, `agent`를 거기서 꺼낸다.[](source:enums) | 취약한 경로 추측이나 regex로 속성 유추 |
| 프롬프트 | 긴 prompt template, system 지시, markdown synthesizer 템플릿을 `*-prompts.ts` 같은 전용 모듈에 둔다.[](source:prompts) | runner 파일 안에 템플릿 넣기 |
| 공유 설정 | 타입 오류는 interface와 type으로 고치고 `.js`는 JSDoc 주석을 단다. 원문은 strict 타입 안전을 "non-negotiable"이라 부른다.[](source:config) | 루트 `tsconfig.json`, `.oxlintignore`, `package.json`을 고쳐 typecheck·lint 우회 |
| 원격 I/O | GCS 같은 저장소에서는 필요한 prefix와 하위 폴더만 조회·다운로드한다. 내려받기 전에 로컬에 이미 있는지 먼저 본다.[](source:remote) | bucket 전체나 무관한 폴더 가져오기 |
| 생성물 | 임시 데이터는 `results/suites/`, `out/` 같은 표준 위치에 두고 `.gitignore`가 임시 파일을 제외하는지 확인한다.[](source:clean) | 테스트 출력, debug 파일, 로컬 cache, 작업 폴더 commit |
| 코드 위생 | 데이터와 JSON은 `JSON.parse()`나 전용 parser로 읽는다. regex의 제어 문자는 `[\u001b\u009b]`처럼 명시적 Unicode escape로 쓴다.[](source:hygiene) | `eval()`로 데이터 parsing, regex에 날 제어 문자 |

dashboard와 UI에는 별도 규칙이 있다.

| 주제 | 강제 규칙 |
|---|---|
| 실행 환경 | dashboard는 정적 호스팅(GitHub Pages)과 로컬 서버(`gd dashboard`) 양쪽에서 돈다. 로컬 Node 서버가 필요한 기능과 endpoint는 정적 모드를 감지해 숨기거나 끈다. 로컬 endpoint에는 `?source=local` 같은 데이터 출처를 넘겨 로컬 파일 작업과 원격 streaming을 구분한다.[](source:dual) |
| 다중 run | 하루나 task당 run이 하나라고 가정하지 않는다. run index와 timestamp로 구분해 데이터가 덮어쓰이거나 합쳐지지 않게 한다. URL query parameter는 안전하게 parsing하고 기본값을 둬서 이동 사이에 상태를 유지한다.[](source:multi) |
| URL 구성 | path 변수로 URL을 만들 때 슬래시를 정리해 맨 앞 `//`가 생기지 않게 한다. 브라우저가 `//...`를 protocol-relative host로 읽는다.[](source:url) |
| 정렬 | 차트 marker, badge, indicator, tooltip을 대상 요소의 수평·수직 중앙에 둔다.[](source:ui) |

판정 · 원문 규칙 대부분은 "무엇을 하지 마라"가 아니라 "대신 이것을 써라" 형태라서, 리뷰할 때 위반 여부를 파일 단위로 판단할 수 있다. 이 저장소에는 대상 코드가 없어 실제 위반 사례는 확인하지 못했다.[](source:full)

## PR 전에 어떤 통과 조건을 거치나? {#gates}

모든 변경은 PR 제출 전에 lint, typecheck, 테스트를 통과해야 한다.[](source:tiers)

@workflow id=gate-flow title="PR 제출 전 통과 조건"
| change | 코드 변경 | external |
| fast | typecheck와 lint | backend |
| pre | preflight | backend |
| ui | dashboard·endpoint 변경? | backend |
| e2e | test:e2e | backend |
| done | PR 제출 | external |
| change > fast | |
| fast > pre | |
| pre > ui | |
| ui > e2e | yes | emphasis |
| ui > done | no |
| e2e > done | |

@steps
| fast | typecheck와 lint | 빠른 개발 중 확인. `pnpm typecheck && pnpm lint`.[](source:tiers) | gate-flow | fast |
| pre | preflight | 모든 PR에 필요하다. build, typecheck, lint, 모든 workspace의 병렬 unit test를 묶는다. `pnpm run preflight`.[](source:tiers) | gate-flow | pre |
| ui | dashboard·endpoint 변경? | Playwright browser 테스트는 preflight에 없다. frontend visualizer, dashboard 코드, `src/dashboard/`의 server endpoint를 건드릴 때 직접 돌린다.[](source:tiers) | gate-flow | ui |
| e2e | test:e2e | `pnpm run test:e2e`. browser 바이너리가 없으면 먼저 `pnpm run setup:playwright`를 돌린다.[](source:tiers) | gate-flow | e2e |

판정 · 그림의 순서(typecheck와 lint, preflight, e2e)는 원문이 "Tiered"라고 부르는 목록 순서에서 읽은 것이다. 원문이 이 순서를 지키라고 명시한 문장은 없다.[](source:tiers)

변경 종류에 따라 더하는 검증은 다음과 같다.

| 변경 | 추가 검증 |
|---|---|
| skills packaging | `pnpm run publish-skills --dry-run`[](source:domain) |
| evaluation capsule의 guide·grader | `gd dev <guide> --test-grader`로 grader 보정 확인[](source:domain) |
| 모든 build | 커밋되지 않은 부작용이나 untracked 산출물이 없어야 한다. `git status`가 깨끗해야 한다[](source:domain) |

제출 전 점검표(원문 9개)는 다음과 같다.[](source:check)

- [ ] PR 범위: 기능, 라이브러리, UI component 하나에 집중한다. 여러 component를 한 PR에 넣지 않는다.
- [ ] abstraction: 저장소 CLI runner(`config.environment`)를 쓰고 직접 만든 API client를 피한다.
- [ ] enum: 원시 문자열 대신 `src/harness/config.ts`의 `Agents`를 쓴다.
- [ ] 메타데이터: 경로 추측 대신 `evals.json` 같은 정본에서 속성을 읽는다.
- [ ] prompt: `*-prompts.ts`나 상수 모듈로 뺀다.
- [ ] 설정: 루트 `tsconfig.json`, `package.json`, `.oxlintignore`는 의도한 경우가 아니면 건드리지 않는다.
- [ ] 원격 I/O와 git: 원격 fetch를 범위 안에서 cache하고, 임시 debug 산출물을 commit하지 않는다.
- [ ] dashboard·UI: 정적·로컬 서버 모드를 처리하고 URL parameter를 안전하게 parsing한다.
- [ ] 검증: `pnpm run preflight`가 오류 0건으로 통과한다. `src/dashboard/` 변경이면 `pnpm run test:e2e`도 통과한다.

## 다른 스킬과 어디에서 이어지나? {#position}

이 스킬은 다른 스킬이 호출하거나 이 스킬이 다른 스킬을 호출하는 직접 연결이 없다. 아래 관계는 모두 같은 명령을 쓰거나 목록에서 지목하는 것이어서 순서 그림은 그리지 않았다.

| 관계 | 내용 |
|---|---|
| R26 · 같은 계열(`grader-replay`) | 둘 다 마지막 검증으로 `pnpm run preflight`를 요구하고 grader 검증에 `gd dev <guide> --test-grader`를 쓴다. 연결을 지시한 문장은 없다.[](source:replay-cmd)[](source:replay-end)[](source:tiers)[](source:domain) |
| R27 · 같은 계열(`coherence-auditor`) | `--preflight` 옵션이 `pnpm run preflight`를 실행한다. 이 스킬은 모든 PR에 같은 통과 조건을 요구한다. 연결을 지시한 문장은 없다.[](source:coh-pre)[](source:coh-script)[](source:tiers) |
| R28 · 같은 계열(`project-evals`) | grader 보정에 `gd dev --test-grader`를 쓰는 점이 같다. 직접 링크는 없다.[](source:ev-cal)[](source:domain) |
| R31 · 참고(`coherence-auditor`가 이 스킬을 읽음) | glob `.agents/skills/project-*/SKILL.md`로 `project-*` 스킬을 지정하고, 그 단계·checkpoint·역할·기술 요구가 서로 모순되지 않는지 읽고 확인한다. 이 스킬도 그 대상이다.[](source:coh-glob)[](source:coh-read) |

전체 관계는 색인 기준 `_group-repo-upkeep/repo-upkeep.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `modern-web-guidance-src/project-coding-standards/SKILL.md` 1개, 7,793B(118줄)를 끝까지 읽었다.[](source:full) |
| 관계 확인 | 관계 행 R26·R27·R28·R31 4개를 이웃 파일의 인용 줄과 대조했다. 이웃 파일 4개는 해당 줄만 읽었다. |
| 설치 출처 | `skills-lock.json`의 항목을 확인했다. 원격 경로는 `.agents/skills/project-coding-standards/SKILL.md`다.[](source:lock) |
| 제외 | 번역본은 이 컬렉션에 없다. 바이너리는 없다. 부분 읽음 파일은 이 스킬 기준 0개다. |

원문의 활성화 설명, 규칙 영역 9개와 dashboard 규칙 4개, 통과 조건 3단계와 도메인별 검증 3개, 점검표 9개를 모두 대조했다. 원문에 종료 조건과 사람 승인은 명시되어 있지 않다.

@callout level=open-question title="확인하지 못한 부분"
| `src/harness/config.ts`, `evals.json`, `src/dashboard/`, `.gitignore` 등 원문이 가리키는 저장소 파일은 이 저장소에 없어 읽지 못했다. 규칙이 실제 코드에서 지켜지는지는 확인하지 못했다. |
| `pnpm`, `gd`, Playwright 명령은 실행하지 않았다. 통과 조건이 실제로 어떻게 동작하는지는 직접 확인하지 않았다. |
| 호스트가 실제로 이 스킬을 활성화하는 조건은 실행으로 확인하지 않았다. |

분석 중 원본은 수정하지 않았다. 원문의 명령과 설치·설정 변경은 실행하지 않았다.
