# nightly-eval-investigation은 nightly 결과에서 무엇을 표시하고, 에이전트에게 무엇을 못 하게 하나? {#nightly-page}

`nightly-eval-investigation`은 에이전트 3종의 최신 nightly 결과를 내려받아 `investigate.ts`로 문제 task를 표시하게 한다. 그다음 에이전트는 task마다 원인과 권고를 보고서에만 쓴다. 일괄 모드에서는 `guides/` 아래 파일을 만들거나 고치거나 지우지 못한다. GitHub 이슈를 만드는 `publish_report.ts`는 사용자만 실행한다.[](source:ro)[](source:s5)

- 표시 기준은 세 가지다. 기대 guide 누락과 guide 3개 이상 사용은 3개 중 2개 이상, unguided 통과율 80% 이상은 3개 모두일 때 표시한다.[](source:f1)[](source:f2)[](source:f3)
- 여기서 "3개"는 사흘치가 아니라 claude_code, codex_cli, jetski_cli 세 종류의 최신 폴더다.[](source:s1)[](source:i-latest)
- 표시된 task는 하나도 빼지 않고, 하나씩, prompt·guide·grader를 8 red line에 대조해 조사한다.[](source:s4rules)
- 보고서를 이슈로 바꾸는 단계는 사용자가 보고서를 확인한 뒤에만 돌린다.[](source:s5)

@answer scope="원문 분석 · 스킬 폴더 파일 3개 전부 읽음 · 스크립트와 명령 미실행"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source full title="modern-web-guidance-src/nightly-eval-investigation/SKILL.md · 16210B · 스킬 본문(원본)" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md
@source front title="nightly-eval-investigation/SKILL.md · frontmatter" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=1:8
@source overview title="nightly-eval-investigation/SKILL.md · 개요와 목표" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=12:19
@source ro title="nightly-eval-investigation/SKILL.md · 읽기 전용 제약" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=21:23
@source gcs title="nightly-eval-investigation/SKILL.md · GCS와 단일 guide 평가" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=27:32
@source agents title="nightly-eval-investigation/SKILL.md · 에이전트 3종" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=34:38
@source files title="nightly-eval-investigation/SKILL.md · 결과 파일 구조" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=40:45
@source f1 title="nightly-eval-investigation/SKILL.md · MISSING_EXPECTED_GUIDE" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=53:56
@source f2 title="nightly-eval-investigation/SKILL.md · TOO_MANY_GUIDES_CONSUMED" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=58:61
@source f3 title="nightly-eval-investigation/SKILL.md · HIGH_UNGUIDED_PASS_RATE" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=63:66
@source fintro title="nightly-eval-investigation/SKILL.md · 표시 기준 서문" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=49:51
@source s1 title="nightly-eval-investigation/SKILL.md · Step 1" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=74:84
@source s2 title="nightly-eval-investigation/SKILL.md · Step 2" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=86:93
@source s3 title="nightly-eval-investigation/SKILL.md · Step 3" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=95:103
@source s4rules title="nightly-eval-investigation/SKILL.md · Step 4 준수 규칙" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=105:114
@source pb-locate title="nightly-eval-investigation/SKILL.md · playbook 1 소스 위치" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=118:122
@source pb-failed title="nightly-eval-investigation/SKILL.md · playbook 2 실패 check" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=124:127
@source pb-flags title="nightly-eval-investigation/SKILL.md · playbook 3 flag별 진단" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=129:137
@source pb-recs title="nightly-eval-investigation/SKILL.md · playbook 4 권고" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=139:147
@source pb-synth title="nightly-eval-investigation/SKILL.md · playbook 5 보고서 쓰기" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=149:150
@source s5 title="nightly-eval-investigation/SKILL.md · Step 5 사용자 안내" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=152:160
@source s6 title="nightly-eval-investigation/SKILL.md · Step 6 보고서 제시" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=162:164
@source fmt title="nightly-eval-investigation/SKILL.md · 보고서 형식 표준" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=168:225
@source inv title="modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts · 20833B · 표시 스크립트(원본)" path=modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts
@source i-find title="investigate.ts · guide 폴더 찾기" path=modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts lines=17:31
@source i-fail title="investigate.ts · 실패 check 추출" path=modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts lines=140:191
@source i-list title="investigate.ts · GCS 목록과 종료" path=modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts lines=193:201
@source i-latest title="investigate.ts · 에이전트별 최신 폴더" path=modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts lines=203:268
@source i-sync title="investigate.ts · 내려받기" path=modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts lines=270:293
@source i-tasks title="investigate.ts · task 목록 만들기" path=modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts lines=309:324
@source i-calc title="investigate.ts · task별 집계" path=modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts lines=330:383
@source i-flags title="investigate.ts · flag 판정" path=modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts lines=393:425
@source i-report title="investigate.ts · 보고서 쓰기" path=modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts lines=437:513
@source i-ctx title="investigate.ts · context JSON" path=modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts lines=518:552
@source pub title="modern-web-guidance-src/nightly-eval-investigation/scripts/publish_report.ts · 12872B · 이슈 발행 스크립트(원본)" path=modern-web-guidance-src/nightly-eval-investigation/scripts/publish_report.ts
@source p-label title="publish_report.ts · label 만들기" path=modern-web-guidance-src/nightly-eval-investigation/scripts/publish_report.ts lines=13:20
@source p-parent title="publish_report.ts · 부모 이슈" path=modern-web-guidance-src/nightly-eval-investigation/scripts/publish_report.ts lines=32:77
@source p-parse title="publish_report.ts · 보고서 파싱" path=modern-web-guidance-src/nightly-eval-investigation/scripts/publish_report.ts lines=79:132
@source p-grader title="publish_report.ts · Grader 하위 이슈" path=modern-web-guidance-src/nightly-eval-investigation/scripts/publish_report.ts lines=136:167
@source p-devrel title="publish_report.ts · Task/Guide 하위 이슈" path=modern-web-guidance-src/nightly-eval-investigation/scripts/publish_report.ts lines=170:197
@source p-proj title="publish_report.ts · Project 30" path=modern-web-guidance-src/nightly-eval-investigation/scripts/publish_report.ts lines=198:246
@source p-link title="publish_report.ts · 부모와 연결" path=modern-web-guidance-src/nightly-eval-investigation/scripts/publish_report.ts lines=249:270
@source pe-red title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 8 red line(연결 확인용 발췌)" path=modern-web-guidance-src/project-evals/SKILL.md lines=31:46
@source pe-hand title="modern-web-guidance-src/project-evals/SKILL.md · 18630B · 후속 스킬 안내(연결 확인용 발췌)" path=modern-web-guidance-src/project-evals/SKILL.md lines=136:136
@source gr-desc title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · description(연결 확인용 발췌)" path=modern-web-guidance-src/grader-replay/SKILL.md lines=7:8
@source gr-pull title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · 결과 폴더 선택(연결 확인용 발췌)" path=modern-web-guidance-src/grader-replay/SKILL.md lines=30:30
@source gr-rel title="modern-web-guidance-src/grader-replay/SKILL.md · 5300B · Related Skills(연결 확인용 발췌)" path=modern-web-guidance-src/grader-replay/SKILL.md lines=81:81
@source rp-dirs title="modern-web-guidance-src/grader-replay/scripts/replay.ts · 19853B · 결과 폴더 탐색(연결 확인용 발췌)" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=287:288
@source rp-latest title="modern-web-guidance-src/grader-replay/scripts/replay.ts · 19853B · 최신 nightly 선택(연결 확인용 발췌)" path=modern-web-guidance-src/grader-replay/scripts/replay.ts lines=330:346

## 언제 켜지고 어떤 순서로 진행하나? {#procedure}

description은 모델이 판단할 때 참고하는 설명이다. 이 원문은 호출 제한 필드(`disable-model-invocation` 등)를 두지 않았다.[](source:front)

@code source=front language=yaml

원문은 일괄 모드와 단일 guide 모드를 함께 다룬다. 일괄 모드가 중심이고, 단일 guide는 로컬에서 하나만 진단한다.[](source:overview)[](source:gcs)

| 모드 | 쓰는 때 | 에이전트가 하는 일 |
|---|---|---|
| 일괄(bulk) | 원격 nightly를 한꺼번에 조사하고, agent 상태와 trajectory를 보고, 낮은 통과율이나 grader 실패를 진단할 때[](source:front) | 아래 흐름 전체. 보고서만 쓴다[](source:ro) |
| 단일 guide | 특정 guide의 평가를 로컬에서 진단할 때[](source:front) | `gd eval guides/<category>/<slug>`를 쓰고, Gen 2 보정은 `gd dev guides/<category>/<slug> --test-grader`로 확인한다[](source:gcs) |

@workflow id=nightly-flow title="일괄 모드 진행 순서"
| select | 최신 폴더 고르기 | backend |
| pull | 결과 내려받기 | backend |
| flag | 문제 task 표시 | backend |
| dive | task별 조사 | backend |
| present | 보고서 제시 | backend |
| user | 사용자 publish 실행 | external |
| select > pull | |
| pull > flag | 같은 스크립트 |
| flag > dive | 표시된 task |
| dive > present | 전부 완료 |
| present > user | 확인 후 | dashed |

@steps id=nightly-steps
| select | 최신 폴더 고르기 | `gcloud storage ls gs://guidance-evals/`로 목록을 받아 `nightly-`로 시작하는 폴더만 남긴다. claude_code, codex_cli, jetski_cli 세 종류마다 타임스탬프가 가장 늦은 폴더 하나를 고른다. 오래된 폴더 이름에는 끝에 LDAP 접미사가 붙을 수 있다.[](source:s1)[](source:gcs) | nightly-flow | select |
| pull | 결과 내려받기 | 폴더마다 `results/suites/<폴더 이름>`을 만들고 `gcloud storage rsync --recursive`로 받는다. 용량 때문에 `.zip`과 `.png`는 제외한다. 스크립트가 자동으로 하며, 로컬 폴더가 이미 있으면 다시 받지 않는다.[](source:s2)[](source:i-sync) | nightly-flow | pull |
| flag | 문제 task 표시 | `node .agents/skills/nightly-eval-investigation/scripts/investigate.ts`를 실행한다. `out/nightly-investigation/`에 `nightly_investigation_report.md`와 `flagged_tasks_context.json`이 생긴다.[](source:s3) | nightly-flow | flag |
| dive | task별 조사 | 보고서의 Flagged Tasks Table에 있는 task마다 playbook을 따라 원인을 찾고 권고를 보고서에 쓴다. 한 task도 건너뛰거나 묶지 않는다.[](source:s4rules) | nightly-flow | dive |
| present | 보고서 제시 | 진단과 권고를 보고서에 다 쓰고 저장한 뒤 사용자에게 보고서 링크를 주고 publish 명령을 알린다. 에이전트는 그 스크립트를 실행하지 않는다.[](source:s5)[](source:s6) | nightly-flow | present |
| user | 사용자 publish 실행 | 사용자가 보고서를 확인하고 `node .agents/skills/nightly-eval-investigation/scripts/publish_report.ts`를 직접 실행한다.[](source:s5) | nightly-flow | user |

@callout level=note title="사용자가 개입하는 곳"
| gcloud 로그인과 `gs://guidance-evals` 접근 권한이 필요하다. 목록을 못 받으면 스크립트가 로그인 안내를 출력하고 종료한다.[](source:i-list) |
| 어떤 에이전트 폴더도 없으면 "No nightly runs found"로 종료한다. 에이전트 하나만 폴더가 없으면 경고하고 나머지로 계속한다.[](source:i-latest) |
| 표시된 task가 없으면 보고서에 "No flagged tasks"라고 쓴다. 이때 이후 단계는 원문에 명시 없음.[](source:i-report) |

## 어떤 task를 문제로 표시하나? {#flags}

원문은 flag 세 개를 쓴다. guided 통과율 목표는 없으므로 guided 통과율이 낮다고 표시하지 않는다.[](source:fintro)

| 표시 | 규칙 | 표시 조건 | 원문이 말하는 뜻 |
|---|---|---|---|
| `MISSING_EXPECTED_GUIDE` | task의 guide 이름이 run의 `guidesUsed`에 없다[](source:f1) | 3개 중 2개 이상 | 검색어가 `guide.md`의 `name`·`description`과 안 맞았거나, 에이전트가 사전 지식으로 풀었다[](source:f1) |
| `TOO_MANY_GUIDES_CONSUMED` | guided run 하나에서 guide를 3개 이상 쓴다[](source:f2) | 3개 중 2개 이상 | 검색어가 퍼졌거나, guide 정의가 겹치거나, 같이 받은 guide의 지시가 부딪친다[](source:f2) |
| `HIGH_UNGUIDED_PASS_RATE` | unguided 통과율이 80% 이상이다[](source:f3) | 3개 모두 | task prompt가 답을 알려 주거나, grader가 느슨하거나, 모델이 이미 안다[](source:f3) |

판정 · "3개"는 에이전트 3종의 최신 폴더 3개다. 사흘치가 아니다. Step 1이 에이전트마다 폴더 하나만 고르고, 코드도 에이전트 수로 센다.[](source:s1)[](source:i-latest)[](source:i-calc)

코드가 원문 문장보다 구체적으로 정하는 부분이 있다. 아래 값은 모두 `investigate.ts`에서 읽은 것이다.

| 항목 | 코드의 동작 |
|---|---|
| guide 사용 | 폴더 안에 run이 여러 번 있어도 에이전트마다 첫 번째 guided run의 `guidesUsed`만 본다.[](source:i-calc) |
| 통과율 | `stats`의 `medianPassRate`를 쓴다. 값이 없으면 0으로 둔다.[](source:i-calc) |
| 누락 판정 | guided run이 없는 에이전트는 `guidesUsed`가 빈 목록이라 기대 guide 누락으로 센다.[](source:i-calc) |
| 임계값 | 누락과 3개 이상 사용은 `>= 2`로 고정이고, 80% 기준은 활성 에이전트 전부가 넘어야 한다.[](source:i-flags) |
| 실패 check | guided 실패 중 활성 에이전트 전부에서 실패한 check만 보고서에 싣는다. 에이전트 안에서는 run 하나라도 실패하면 실패로 센다.[](source:i-fail)[](source:i-report) |
| 산출물 | 표시된 task가 있을 때만 `flagged_tasks_context.json`(prompt, guide description, 테스트 제목)을 쓴다. guide 폴더를 이름으로 못 찾은 task는 건너뛴다.[](source:i-ctx) |

판정 · 에이전트 폴더가 2개만 있으면 "3개 중 2개"가 "2개 중 2개"가 되어 기준이 더 쉽게 충족된다. 임계값이 2로 고정이고 분모는 찾은 에이전트 수이기 때문이다.[](source:i-flags)[](source:i-latest)

## 조사에서 무엇을 강제하고 금지하나? {#investigation}

@callout level=warning title="일괄 모드는 읽기 전용이다"
| 에이전트는 어떤 경우에도 `guides/` 아래의 task 파일, guide, grader, expectations, demo를 수정·생성·삭제하지 않는다(`MUST NOT`).[](source:ro) |
| 고칠 점은 보고서의 "Actionable Recommendations"에만 쓴다. 일괄 감사 중에는 자동이든 수동이든 코드 수정을 하지 않는다.[](source:ro) |

Step 4가 정한 준수 규칙은 네 개다.[](source:s4rules)

| 규칙 | 내용 |
|---|---|
| 원본 수정 금지 | 진단과 권고는 보고서 안에만 쓴다.[](source:s4rules) |
| 전부 완료 | 표시된 task 하나하나를 조사하고 요약을 채운다. 자리표시 문구를 남기거나 건너뛰면 안 된다(`MUST`).[](source:s4rules) |
| 발동한 flag만 | `Diagnostic Details`에는 발동한 flag만 쓴다. 스크립트가 뽑은 실패 check가 있으면 `*Failed Checks*`도 쓴다. 발동하지 않은 항목은 "N/A"나 "No issues"를 쓰지 말고 빼야 한다.[](source:s4rules) |
| 오래, 철저히 | task의 `task.md`, `guide.md`, `grader.ts`를 8 red line에 대조해 task마다 하나씩 본다. 서두르거나 묶지 않는다(`MUST`).[](source:s4rules) |

playbook은 task마다 다섯 단계다.

| 단계 | 하는 일 |
|---|---|
| 1 소스 위치 | `guides/[category]/[use-case]/` 아래에서 prompt(`targets/<app>/task.md` 또는 Gen 1 `tasks/task.md`), `guide.md`, grader와 `expectations.md`를 찾는다.[](source:pb-locate) |
| 2 실패 check | 세 에이전트 모두에서 실패한 check의 `error`, `errorLocation`, `pageSnapshot`, `browserErrors`를 본다. `guide.md`가 불분명하다고 결론 내리기 전에 eval 결함(8 red line)과 일시적 환경 오류(`429 Rate Limit Exceeded`, 할당량 소진, 신뢰하지 않은 폴더(untrusted folder) 때문에 tool을 건너뛴 경우)부터 배제한다.[](source:pb-failed) |
| 3 flag별 진단 | 발동한 flag마다 아래 표대로 원인을 쓴다.[](source:pb-flags) |
| 4 권고 | Prompt, Guide, Grader 중 바꿔야 하는 것만 구체적으로 쓴다. "Fix prompt" 같은 문장은 안 된다. 바꿀 필요가 없는 줄은 통째로 뺀다.[](source:pb-recs) |
| 5 보고서 | 보고서 형식 표준에 맞춰 task 절에 쓴다.[](source:pb-synth) |

3단계의 flag별 진단은 다음과 같다.[](source:pb-flags)

| flag | 볼 파일 | 판단 방법 |
|---|---|---|
| `HIGH_UNGUIDED_PASS_RATE` | prompt, grader | prompt가 CSS 속성·API 세부·fallback·guide 이름을 알려 주는지, grader에 느슨하거나 속 빈 assertion이 있는지 본다. 둘 다 깨끗하면 "모델이 이미 안다, eval 변경 불필요"라고 보고한다.[](source:pb-flags) |
| `MISSING_EXPECTED_GUIDE` | `trajectory_summary.json`, `modern-web.log` | 검색했는데 놓쳤으면(Search Mismatch) `guide.md` frontmatter `description`에 문제 영역 용어가 빠졌는지 본다. 검색을 건너뛰었으면(Tool Skip) `task.md`가 사용자 쪽 문제를 분명히 적었는지 본다.[](source:pb-flags) |
| `TOO_MANY_GUIDES_CONSUMED` | prompt, guide 설명 | 지나치게 넓은 prompt, 겹치는 guide 설명, 같이 받은 guide의 상충하는 규칙(8 red line 중 7번)을 본다.[](source:pb-flags)[](source:pe-red) |

원문이 막는 처방도 있다.

- `skills-src/modern-web-guidance/SKILL.md`는 전역 문서라 guide 하나를 위해 조정하지 않는다.[](source:pb-flags)
- guide가 가르치지 않는 "constraint forcing" 규칙을 task에 더하지 않는다.[](source:pb-flags)
- check는 guide가 허용하는 패턴을 거부하거나 실제로 재현될 때만 느슨하게 한다. 추측으로 느슨하게 하지 않는다.[](source:pb-failed)
- 단일 guide를 고쳐 달라는 요청이면 8 red line을 먼저 확인하고, `guide.md`를 grader에 맞춰 바꾸지 않는다.[](source:ro)

보고서 형식도 강제다. `publish_report.ts`가 앵커 태그, task 제목 줄, `#### Flags:`, 에이전트 표 행, 체크박스로 시작하는 Prompt·Guide·Grader 권고 줄을 읽기 때문에 모든 보고서는 정해진 틀을 따라야 한다(`MUST`).[](source:fmt)

## 보고서를 이슈로 만드는 publish_report.ts는 무엇을 쓰나? {#publish}

에이전트는 이 스크립트를 실행하거나 GitHub 이슈를 만들지 못한다. 사용자가 보고서를 확인한 뒤 직접 실행한다.[](source:s5) 아래는 코드를 읽은 결과이며, 실행해서 확인하지 않았다. 모든 동작은 지시상 동작이다.

| 만드는 것 | 조건 | 내용 |
|---|---|---|
| label | 매번 | `nightly-investigation`, `nightly-investigation-eng-<날짜>`, `nightly-investigation-devrel-<날짜>`. `gh label create ... \|\| true`라 이미 있어도 넘어간다.[](source:p-label)[](source:p-parent)[](source:p-parse) |
| 부모 이슈 | 보고서가 있으면 항상 | 제목 `📋 Nightly Guidance Health Audit: <날짜>`. 본문은 보고서에서 "Actionable Recommendations" 블록을 뺀 것이다. 본문이 65,536자를 넘으면 임계값을 조정하라는 메시지를 내고 종료한다.[](source:p-parent) |
| Grader 하위 이슈 | grader 권고에 내용이 있을 때 | 제목 `Grader Fix: <task> - <날짜>`, label `...-eng-<날짜>`.[](source:p-grader) |
| Task/Guide 하위 이슈 | prompt 또는 guide 권고에 내용이 있을 때 | 제목 `Task/Guide Fix: <task> - <날짜>`, label `...-devrel-<날짜>`. GoogleChrome의 Project 30에 올리고 Status를 `needs-investigation`으로 바꾼다.[](source:p-devrel)[](source:p-proj) |
| 부모와 연결 | 하위 이슈가 있을 때 | GraphQL `addSubIssue`로 각 하위 이슈를 부모에 잇는다.[](source:p-link) |

권고 줄을 읽는 규칙이 중요하다. 코드는 `Prompt`, `Guide`, `Grader` 줄을 정규식으로 읽고, 내용에 `TODO`가 들어 있으면 그 줄을 없는 것으로 본다. 그래서 `TODO`를 남긴 권고는 하위 이슈가 되지 않는다.[](source:p-parse) 부모 이슈는 task 절이 하나도 없어도 이미 만들어진 뒤라서, 그 경우 "No flagged tasks found"만 출력하고 끝난다.[](source:p-parent)[](source:p-parse)

판정 · 이 스크립트를 사용자만 돌리게 한 이유는 코드로 설명된다. GitHub 이슈 여러 개를 만들고 Project 30의 Status를 바꾸는데, 만든 것을 되돌리는 코드가 이 파일에 없다. 하위 이슈 생성이 실패해도 오류만 출력하고 계속 진행한다. 같은 날 다시 돌릴 때 기존 이슈를 확인하는 코드도 없다.[](source:p-parent)[](source:p-grader)[](source:p-devrel)

## 다른 스킬과 어디에서 이어지나? {#position}

@workflow id=position-flow title="eval-quality-loop에서 이 스킬의 자리"
| pe | project-evals | backend | source:pe-hand |
| gr | grader-replay | backend | source:gr-desc |
| current | nightly-eval-investigation | backend | source:front |
| user | 사용자 publish 실행 | external | source:s5 |
| pe > current | 넘김 R18 | emphasis |
| gr > current | 넘김 R22 | emphasis |
| current > user | 범위 밖 R37 | dashed |

@steps id=position-steps
| highlight | nightly-eval-investigation | 이 페이지의 스킬이다. nightly 결과를 읽고 보고서를 쓰며, 이슈 발행은 사용자에게 넘긴다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R18 · 넘김 (`project-evals` → 이 스킬) | 여러 nightly에 걸친 통과율과 retrieval 표시를 분류할 때 쓰라고 안내한다. 필수 순서가 아니다.[](source:pe-hand) |
| R22 · 넘김 (`grader-replay` → 이 스킬) | `grader-replay`는 eval job을 표시하거나 조사하려는 경우에 쓰지 말고 이 스킬을 쓰라고 한다.[](source:gr-desc)[](source:gr-rel) |
| R23 · 참고 (이 스킬 → `project-evals`) | flagged task마다 prompt·guide·grader를 8 red line에 대조하는 것이 필수 규칙이다. `project-evals` 쪽에서 8 red line의 본문을 확인했다.[](source:s4rules)[](source:pe-red) |
| R24 · 공유 상태 (이 스킬 ↔ `grader-replay`) | 같은 `results/suites/nightly-*/` 폴더를 쓴다. 이 스킬은 에이전트별 최신 폴더를 받고, `grader-replay`는 `results/suites/`와 `~/guidance-evals/`에서 `nightly-*` 중 에이전트별 최신을 고른다. 선후 관계는 없다.[](source:i-latest)[](source:gr-pull)[](source:rp-dirs)[](source:rp-latest) |
| R25 · 공유 상태 (이 스킬 ↔ `project-evals`) | 일괄 모드에서 `guides/<카테고리>/<use-case>/`의 파일을 읽기만 한다. 쓰기와 삭제는 금지다.[](source:pb-locate)[](source:ro) |
| R37 · 참고 (범위 밖) | `publish_report.ts`는 사용자만 실행한다. 부모 이슈, 하위 이슈, Project 30 변경이 생긴다.[](source:s5)[](source:p-parent)[](source:p-proj) |
| R38 · 참고 (범위 밖) | 결과는 GCS 버킷 `gs://guidance-evals/`에서 받는다. `grader-replay`는 로컬 폴더가 없거나 낡았을 때만 받는다.[](source:gcs)[](source:gr-pull) |

전체 흐름은 색인 기준 `_group-eval-quality-loop/eval-quality-loop.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | 이 스킬 폴더의 텍스트 파일 3개, 총 49,915B를 끝까지 읽었다. `SKILL.md` 16,210B, `scripts/investigate.ts` 20,833B, `scripts/publish_report.ts` 12,872B다.[](source:full)[](source:inv)[](source:pub) |
| 연결 확인용 발췌 | 관계 원장의 행을 대조하려고 `project-evals/SKILL.md`, `grader-replay/SKILL.md`, `grader-replay/scripts/replay.ts`에서 필요한 줄만 읽었다. 이 3개는 구조·내용 전체를 읽지 않았다.[](source:pe-red)[](source:gr-desc)[](source:rp-latest) |
| 제외 | 번역본(`*.KO.md`)은 이 폴더에 없다. 바이너리도 없다. |
| 부분 읽음 | 이 스킬 폴더에서는 0개다. |

원문의 활성화 설명, 읽기 전용 제약, flag 3개의 규칙과 임계값, 단계 6개, 준수 규칙 4개, playbook 5단계, 보고서 형식과 사용자 개입 지점을 모두 대조했다. 코드는 두 스크립트의 flag 임계값, 분모, 출력 파일, 이슈 생성 순서를 줄 단위로 확인했다.

@callout level=open-question title="실행하거나 원본 저장소로 확인하지 못한 부분"
| 두 스크립트는 `../../../../src/core/paths.ts`에서 `guidesDir`, `outDir`, `rootDir`, `suitesDir`를 가져온다. 이 파일이 이 컬렉션에 없어 경로 값은 확인하지 못했다.[](source:inv) |
| `evals.json`의 실제 모양, `medianPassRate`가 퍼센트 단위인지, `gcloud`, `gh`, `gd eval` 동작은 실행하지 않았다. 코드가 통과율을 80과 직접 비교하므로 퍼센트로 보인다는 추정뿐이다.[](source:i-flags) |
| 원문 두 줄이 서로 부딪친다. `gd eval`을 "소스 파일에 읽기 전용"이라 쓰면서, 한쪽은 단일 guide를 진단하고 고치는 요청에서 8 red line을 먼저 보라고 한다. 단일 모드가 수정 가능한지 우선순위는 원문에 명시 없음.[](source:gcs)[](source:ro)[](source:s4rules) |
| 판정 · `publish_report.ts`는 task 이름을 셸 명령 문자열(`gh issue create --title "..."`)에 그대로 넣는다. 이름은 `evals.json` 키에서 오므로 `"`나 `$(`가 들어가면 셸이 해석할 위험이 있다. 실행해 확인하지 않았다.[](source:p-grader)[](source:i-tasks) |
| 판정 · `findGuideDirs`는 이름이 같은 guide 폴더가 둘 이상이면 나중 것으로 덮어쓴다. 서로 다른 카테고리에 같은 이름이 있으면 context JSON과 권고 경로가 엉뚱한 폴더를 가리킬 수 있다.[](source:i-find) |
| Step 6의 링크는 `file:///out/nightly-investigation/...`로 저장소 경로가 아니라 루트 절대 경로다. 열리는지는 확인하지 못했다.[](source:s6) |

분석 중 이 스킬 폴더의 원본은 수정하지 않았다. 대상 스킬의 어떤 명령과 스크립트도 실행하지 않았다.
