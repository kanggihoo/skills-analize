# nightly-eval-investigation — 최근 nightly 평가 3종을 내려받아 문제 task를 표시하고 보고서로 쓰기 {#overview}

`nightly-eval-investigation`은 에이전트가 GCS의 최근 nightly 평가 3종(Claude Code, Codex CLI, Jetski CLI)을 내려받아 script로 문제 task를 표시하고, task마다 원인과 권고를 보고서에 쓰게 하는 스킬이다. 보고서를 GitHub 이슈로 올리는 script는 사용자가 실행하도록 알리기만 한다.[](source:ne-front)[](source:ne-s5)

- 쓰는 때: 원격 nightly 실행을 대량으로 조사할 때, agent 상태를 추적할 때, eval trajectory를 볼 때, 낮은 통과율과 grader 실패를 진단할 때다. 단일 guide의 로컬 eval 진단도 같은 스킬이 다룬다(`gd eval`).[](source:ne-front)[](source:ne-intro)
- 결과: `out/nightly-investigation/nightly_investigation_report.md`와 `flagged_tasks_context.json`이다. 표시 기준은 세 가지로, 기대 guide 누락, guide 3개 이상 소비, unguided 통과율 80% 이상이다.[](source:ne-s3)[](source:ne-flags)
- 다른 스킬과의 관계: 평가 규칙은 `project-evals`의 8 red line을 따른다(참고). nightly 결과 폴더를 `grader-replay`와 같이 쓴다(같은 파일). `project-evals`와 `grader-replay`가 이 스킬을 쓰라고 안내한다(다음 안내).[](source:ne-play)
- 하지 않는 것: 대량 모드에서 `guides/` 아래 파일을 만들거나 고치거나 지우지 않는다(MUST NOT). `publish_report.ts`도 직접 실행하지 않는다.[](source:ne-ro)[](source:ne-s5)

@answer scope="modern-web-guidance-src/nightly-eval-investigation · 원본 파일 3개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source ne-front title="이름과 description" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=1:8
@source ne-intro title="소개와 핵심 목표" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=10:19
@source ne-ro title="읽기 전용 제약" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=21:23
@source ne-ref title="GCS 위치와 결과 파일" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=27:45
@source ne-flags title="표시 기준 3가지" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=49:66
@source ne-s1 title="1단계 run 고르기" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=74:84
@source ne-s2 title="2단계 내려받기" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=86:93
@source ne-s3 title="3단계 표시 script" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=95:103
@source ne-s4 title="4단계 필수 규칙" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=105:114
@source ne-play title="flagged task별 playbook" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=116:150
@source ne-s5 title="5단계 publish script 안내" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=152:160
@source ne-s6 title="6단계 보고서 링크" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=162:164
@source ne-fmt title="보고서 형식" path=modern-web-guidance-src/nightly-eval-investigation/SKILL.md lines=168:172
@source ne-inv title="investigate.ts의 내려받기 건너뛰기" path=modern-web-guidance-src/nightly-eval-investigation/scripts/investigate.ts lines=270:293
@source ne-pub title="publish_report.ts의 부모 이슈 생성" path=modern-web-guidance-src/nightly-eval-investigation/scripts/publish_report.ts lines=44:66
@source ne-pub2 title="publish_report.ts의 Project 30 등록" path=modern-web-guidance-src/nightly-eval-investigation/scripts/publish_report.ts lines=198:231
@source pe-hub title="project-evals의 연결 안내" path=modern-web-guidance-src/project-evals/SKILL.md lines=136:136
@source pe-red title="project-evals의 8 red line" path=modern-web-guidance-src/project-evals/SKILL.md lines=31:46
@source gr-front title="grader-replay description" path=modern-web-guidance-src/grader-replay/SKILL.md lines=1:10
@source gr-pull title="grader-replay의 job 선택과 내려받기" path=modern-web-guidance-src/grader-replay/SKILL.md lines=28:38
@source gr-rel title="grader-replay의 관련 스킬" path=modern-web-guidance-src/grader-replay/SKILL.md lines=77:81

## 어떻게 동작하나 {#flow span=12}

원문은 1~6단계를 번호로 지시하고, 4단계 안에 flagged task마다 도는 5개 항목의 playbook을 둔다. 그림은 6단계를 국면 4개로 묶었다. 4단계의 playbook 안쪽(원인 점검 순서, 권고 형식)은 상세 후보로 보냈다.[](source:ne-play)

@workflow id=flow-diagram title="nightly-eval-investigation 흐름"
| lane collect | 수집 |
| lane flag | 표시 |
| lane dive | 조사 |
| lane hand | 전달 |
| select | 최신 run 3개 고르기 | backend | collect | source:ne-s1 |
| pull | 결과 내려받기 | external | collect | source:ne-s2 |
| flag | 문제 task 표시 | backend | flag | source:ne-s3 |
| dive | task별 원인 조사 | backend | dive | source:ne-play |
| more | 남은 flagged task? | backend | dive | source:ne-s4 |
| inform | publish 명령 안내 | backend | hand | source:ne-s5 |
| select > pull | |
| pull > flag | |
| flag > dive | flagged task |
| dive > more | 보고서에 기록 |
| more > dive | 있음 | dashed |
| more > inform | 없음 | emphasis |

@steps id=flow-steps
| s-select | 최신 run 3개 고르기 | **입력** GCS 버킷의 suite 목록 · **실행** `gcloud storage ls gs://guidance-evals/` · **출력** agent 종류별 최신 폴더 3개. **처리** 에이전트가 `nightly-`로 시작하는 폴더를 agent 종류(Claude Code, Codex CLI, Jetski CLI)별로 묶고 timestamp가 가장 늦은 것을 하나씩 고른다.[](source:ne-s1) | flow-diagram | select |
| s-pull | 결과 내려받기 | **입력** 고른 폴더 3개 · **실행** `gcloud storage rsync gs://guidance-evals/<folder_name> results/suites/<folder_name> --recursive --exclude ".*\.zip$\|.*\.png$"` · **출력** `results/suites/<folder_name>`. **처리** Playwright `trace.zip`과 screenshot을 빼고 결과를 받는다.[](source:ne-s2) → 내부: `investigate.ts`가 폴더가 이미 있으면 내려받지 않고 건너뛴다(코드 확인).[](source:ne-inv) **다음** 3단계 script가 이 내려받기를 자동으로 하므로 수동 실행은 필요할 때만 한다. | flow-diagram | pull |
| s-flag | 문제 task 표시 | **입력** 내려받은 결과 3개 · **참조** `evals.json` · **실행** `node .agents/skills/nightly-eval-investigation/scripts/investigate.ts` · **출력** `out/nightly-investigation/nightly_investigation_report.md`, `out/nightly-investigation/flagged_tasks_context.json`. **처리** script가 3개 run을 교차 점검해 task마다 표시 3가지를 판정하고 보고서와 context 파일을 만든다.[](source:ne-s3)[](source:ne-flags) **다음** guided 통과율이 낮아도 자동 표시하지 않는다(목표 통과율이 없다). 공통 실패 check는 참고 정보로만 뽑는다. | flow-diagram | flag |
| s-dive | task별 원인 조사 | **입력** 보고서의 Flagged Tasks Table · **참조** `guides/[category]/[use-case]/`의 `targets/<app>/task.md`, `guide.md`, `targets/<app>/grader.ts`, `expectations.md` · **출력** task별 Qualitative Diagnostic Summary와 권고. **처리** 에이전트가 원본 파일 위치를 찾고, 공통 실패 check를 보고, 8 red line으로 eval 결함이나 일시 환경 오류를 먼저 배제한 뒤, 켜진 표시마다 원인을 쓰고 구체적 권고(Prompt, Guide, Grader)를 쓴다.[](source:ne-play) **다음** 켜지지 않은 표시와 바꿀 필요 없는 권고는 파일에서 아예 뺀다(N/A, "Keep as is"를 쓰지 않는다). | flow-diagram | dive |
| s-more | 남은 flagged task? | **입력** 보고서의 flagged task 목록 · **출력** 완료 여부. **처리** 에이전트가 flagged task마다 요약을 채웠는지 본다. 자리표시 문구를 남기거나 task를 건너뛰면 안 된다(MUST).[](source:ne-s4) **다음** 하나씩 꼼꼼히 조사하고 묶거나 서두르지 않는다. | flow-diagram | more |
| s-inform | publish 명령 안내 | **입력** 완성된 보고서 · **출력** 사용자에게 보고서 링크와 publish 명령. **처리** 에이전트가 보고서를 보여 주고, 사용자가 확인한 뒤 직접 `node .agents/skills/nightly-eval-investigation/scripts/publish_report.ts`를 실행하라고 알린다.[](source:ne-s5)[](source:ne-s6) **다음** 에이전트가 `publish_report.ts`를 실행하거나 GitHub 이슈를 만들지 않는다(DO NOT). | flow-diagram | inform |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 원문에 명시 없음. 모델이 description을 보고 켠다. 호출 제한 필드는 없다[](source:ne-front) |
| 성격 | script로 표시하고 에이전트가 원인을 쓰는 절차형 진단 스킬(읽기 전용) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `project-evals` {#r18} | **이 스킬** | 다음 안내 | 여러 nightly에 걸친 통과율과 retrieval 표시를 분류할 때 쓰라고 한다.[](source:pe-hub)[](source:ne-front) |
| `grader-replay` {#r22} | **이 스킬** | 다음 안내 | eval job을 표시하거나 조사하려는 경우는 `grader-replay`를 쓰지 말고 이 스킬을 쓰라고 한다.[](source:gr-front)[](source:gr-rel) |
| **이 스킬** {#r23} | `project-evals` | 참고 | 대량 조사에서는 `guides/` 파일을 고치지 않고 보고서에만 권고를 쓴다. 단일 guide를 로컬에서 진단·수정할 때는 8 red line을 먼저 확인하고 guide를 grader에 맞춰 고치지 않는다. flagged task마다 8 red line에 대조하는 것이 playbook의 필수 규칙이다.[](source:ne-ro)[](source:ne-s4)[](source:pe-red) |
| **이 스킬** {#r24} | `grader-replay` | 같은 파일 | 같은 nightly 결과 폴더를 쓴다. 이 스킬은 `results/suites/<폴더>`에 내려받고, replay는 `results/suites/`와 `~/guidance-evals/`에서 가장 최근 `nightly-*` job을 고른다. 선후 관계는 없다.[](source:ne-s2)[](source:gr-pull) |
| **이 스킬** {#r25} | `project-evals` | 같은 파일 | 대량 모드에서 `task.md`, `guide.md`, `grader.ts`, `expectations.md`를 읽기 전용으로 읽는다. 쓰기와 삭제는 금지(MUST NOT)다.[](source:ne-ro)[](source:ne-s4) |
| **이 스킬** {#r37} | `publish_report.ts` 실행(GitHub 이슈와 GoogleChrome Project 30) | 참고 | 에이전트는 이 script를 실행하면 안 된다. 사용자가 보고서를 확인한 뒤 직접 실행한다. script는 부모 이슈와 하위 이슈를 만들고 하위 이슈를 Project 30에 올려 Status를 `needs-investigation`으로 바꾼다. 범위 밖이고 지시상 동작이다.[](source:ne-s5)[](source:ne-pub)[](source:ne-pub2) |
| **이 스킬** {#r38} | GCS 버킷 `gs://guidance-evals/` | 참고 | `gcloud storage ls`와 `rsync`로 nightly 결과를 받는다. `.zip`과 `.png`는 뺀다. 범위 밖이다.[](source:ne-ref)[](source:ne-s2) |

@architecture id=relation-map title="nightly-eval-investigation과 이어지는 스킬"
| pe | project-evals | backend |
| gr | grader-replay | backend |
| self | nightly-eval-investigation(이 스킬) | backend |
| pe > self | 다음 안내 |
| gr > self | 다음 안내 |
| self > pe | 참고 | dashed |
| self > gr | 같은 파일 | dashed |

@code source=ne-front language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 표시 기준, 6단계 절차, playbook, 보고서 형식을 담는다 | 스킬이 켜질 때 읽는다 | 최신 run 3개 고르기, 결과 내려받기, 문제 task 표시, task별 원인 조사, 남은 flagged task?, publish 명령 안내 |
| `scripts/investigate.ts` | 결과를 내려받고 3개 run을 교차 점검해 표시와 보고서·context 파일을 만든다 | 3단계에서 에이전트가 `node`로 실행한다 | 결과 내려받기, 문제 task 표시 |
| `scripts/publish_report.ts` | 보고서로 GitHub 부모·하위 이슈를 만들고 Project 30에 올린다 | 에이전트가 실행하지 않는다. 사용자가 보고서를 확인한 뒤 직접 실행한다 | publish 명령 안내 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 대량 nightly 조사 중 `guides/` 아래 파일 | 만들거나 고치거나 지우지 않는다(MUST NOT). 권고는 보고서 "Actionable Recommendations"에만 쓴다 | [](source:ne-ro) |
| 기대 guide가 `guidesUsed`에 없다(`MISSING_EXPECTED_GUIDE`) | 3번의 run 중 2번에서 없으면 표시한다 | [](source:ne-flags) |
| guide를 3개 이상 소비했다(`TOO_MANY_GUIDES_CONSUMED`) | 3번의 run 중 2번에서 그러면 표시한다 | [](source:ne-flags) |
| unguided 통과율이 80% 이상이다(`HIGH_UNGUIDED_PASS_RATE`) | 3번의 run 모두 80% 이상일 때 표시한다 | [](source:ne-flags) |
| guided 통과율이 낮다 | 목표 통과율이 없으므로 자동 표시하지 않는다 | [](source:ne-flags) |
| flagged task 조사 | 모든 flagged task를 빠짐없이 채워야 한다(MUST). 켜진 표시만 쓰고 나머지는 뺀다 | [](source:ne-s4) |
| 원인을 guide 불명확으로 결론 내리기 전 | 8 red line의 eval 결함과 `429`, quota 소진, untrusted 폴더 skip 같은 일시 오류를 먼저 배제한다 | [](source:ne-play) |
| 보고서 완성 뒤 | `publish_report.ts`를 에이전트가 실행하지 않는다(DO NOT). 명령만 알린다 | [](source:ne-s5) |
| 보고서 형식 | 템플릿을 엄격히 따른다(MUST). `publish_report.ts`가 앵커, 제목, 표 행, 권고 줄을 파싱한다 | [](source:ne-fmt) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- flagged task별 playbook 5항목 — task별 원인 조사 · 개요에는 요지만 담았다. 표시별 원인 점검 방법과 권고 형식은 상세로 남긴다.
- 결과 파일 구조 — 문제 task 표시 · `evals.json`, trajectory 파일, 폴더 이름 규칙은 개요에 담지 않았다.
- 보고서 형식 — task별 원인 조사 · 표와 권고 줄의 파서 계약은 상세로 남긴다.
- `publish_report.ts` 동작 — publish 명령 안내 · 이슈 생성과 Project 30 등록 순서는 상세로 남긴다.

@callout level=open-question title="확인하지 못한 것"
| `gd eval`, `gcloud`, `gh` CLI, `src/harness/lib/trajectory-normalizer.ts`와 GCS 버킷의 실제 내용은 이 컬렉션에 없다. `investigate.ts`(557줄)와 `publish_report.ts`(281줄)는 내려받기 건너뛰기, 부모 이슈 생성, Project 30 등록 부분만 대조했다. 명령은 모두 지시상 동작이고 실행하지 않았다. |

읽은 원본: 텍스트 파일 3개. 제외: 없음. 스크립트 2개는 필요한 부분만 읽었다.
