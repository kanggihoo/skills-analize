# show-me-your-work 스킬은 에이전트를 어떻게 바꾸나 {#show-me-your-work-skill}

`show-me-your-work`를 쓰면 에이전트는 길거나 사람이 자리를 비운 작업에서 결정마다 TSV 기록에 한 줄을 남긴다. 끝내기 전에는 그 기록을 대화 기록과 맞춰 보고, 다른 모델 계열의 검토를 받아 답변 끝에 `Attention` 절을 붙인다.[](source:format)[](source:audit)[](source:xreview)

- 한 줄은 시각, 단계, 결정, 이유, 근거, 결과 여섯 칸이다. 근거는 설명문이 아니라 커밋·PR·파일 위치 같은 가리킬 곳이다.[](source:format)
- 기록은 덧붙이기만 한다. 잘못된 줄은 고치거나 지우지 않고, 바로잡는 새 줄을 더한다.[](source:rules)
- 기록은 기본적으로 커밋하지 않는다. 리뷰어가 기록이 있어야 결과를 믿을 만큼 큰 작업일 때만 커밋한다.[](source:where)
- 다른 스킬은 결정 기록이 필요하면 이 스킬을 이름으로 부르고, 칸 구성을 다시 적지 않는다.[](source:compose)

@answer scope="pstack/show-me-your-work · 원본 텍스트 파일 3개 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/show-me-your-work/SKILL.md · 6418B · 본문(frontmatter)" path=pstack/show-me-your-work/SKILL.md lines=1:5
@source format title="pstack/show-me-your-work/SKILL.md · 형식과 칸" path=pstack/show-me-your-work/SKILL.md lines=9:22
@source example title="pstack/show-me-your-work/SKILL.md · 예시 기록" path=pstack/show-me-your-work/SKILL.md lines=27:31
@source logging title="pstack/show-me-your-work/SKILL.md · 한 줄 쓰기" path=pstack/show-me-your-work/SKILL.md lines=34:40
@source runs title="pstack/show-me-your-work/SKILL.md · 실행과 start 줄" path=pstack/show-me-your-work/SKILL.md lines=42:42
@source where title="pstack/show-me-your-work/SKILL.md · 보관 위치" path=pstack/show-me-your-work/SKILL.md lines=44:48
@source rules title="pstack/show-me-your-work/SKILL.md · Rules" path=pstack/show-me-your-work/SKILL.md lines=50:53
@source audit title="pstack/show-me-your-work/SKILL.md · 대화 기록과 대조" path=pstack/show-me-your-work/SKILL.md lines=55:63
@source xreview title="pstack/show-me-your-work/SKILL.md · 다른 모델 검토" path=pstack/show-me-your-work/SKILL.md lines=65:74
@source reading title="pstack/show-me-your-work/SKILL.md · 기록 읽기" path=pstack/show-me-your-work/SKILL.md lines=76:78
@source compose title="pstack/show-me-your-work/SKILL.md · 다른 스킬과 엮기" path=pstack/show-me-your-work/SKILL.md lines=80:82
@source logsh title="pstack/show-me-your-work/scripts/log.sh · 1377B · 한 줄 추가 스크립트" path=pstack/show-me-your-work/scripts/log.sh lines=1:42
@source logsh-clean title="pstack/show-me-your-work/scripts/log.sh · 셀 정리" path=pstack/show-me-your-work/scripts/log.sh lines=25:42
@source tpl title="pstack/show-me-your-work/references/decision-log-template.tsv · 38B · 머리 줄" path=pstack/show-me-your-work/references/decision-log-template.tsv lines=1:1
@source pm-trail title="pstack/poteto-mode/SKILL.md · 결정 기록 조건" path=pstack/poteto-mode/SKILL.md lines=36:36
@source fio-trail title="pstack/figure-it-out/SKILL.md · Phase D" path=pstack/figure-it-out/SKILL.md lines=47:47
@source prove title="pstack/principle-prove-it-works/SKILL.md · 산출물 커밋 조건" path=pstack/principle-prove-it-works/SKILL.md lines=22:22
@source hillclimb title="pstack/poteto-mode/playbooks/hillclimb.md · 3단계" path=pstack/poteto-mode/playbooks/hillclimb.md lines=9:9
@source autonomous title="pstack/poteto-mode/playbooks/autonomous-run.md · 5단계" path=pstack/poteto-mode/playbooks/autonomous-run.md lines=10:10
@source autopilot-full title="pstack/poteto-mode/playbooks/autopilot-full.md · 2단계" path=pstack/poteto-mode/playbooks/autopilot-full.md lines=6:6
@source autopilot-stack title="pstack/poteto-mode/playbooks/autopilot-stack.md · 1단계" path=pstack/poteto-mode/playbooks/autopilot-stack.md lines=5:5
@source orchestrate title="pstack/poteto-mode/playbooks/orchestrate.md · 기록 언급" path=pstack/poteto-mode/playbooks/orchestrate.md lines=31:31
@source orchestrate-close title="pstack/poteto-mode/playbooks/orchestrate.md · 시작과 마감" path=pstack/poteto-mode/playbooks/orchestrate.md lines=61:66
@source pause title="pstack/poteto-mode/playbooks/pause-safely.md · 4단계" path=pstack/poteto-mode/playbooks/pause-safely.md lines=8:8
@source multiphase title="pstack/poteto-mode/playbooks/multi-phase-plan.md · 계획 양식" path=pstack/poteto-mode/playbooks/multi-phase-plan.md lines=152:152
@source recipe title="pstack/poteto-help/references/recipes.md · 돌아와서 묻기" path=pstack/poteto-help/references/recipes.md lines=43:43

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 사용자가 `/show-me-your-work`를 입력하거나 다른 스킬이 기록을 맡길 때 켜진다. 사용자가 돌아와서 "어젯밤 한 일을 알려 줘"라고 부르는 쓰임도 있다.[](source:recipe)

| 누가 부르나 | 조건 |
| --- | --- |
| `poteto-mode` | 길거나 자율적이거나 여러 단계인 작업, 사용자가 자리를 비웠다 돌아와 검토할 작업. 위험이 크면 커밋, 아니면 로컬[](source:pm-trail) |
| `figure-it-out` | Phase D. 보통 커밋해서 리뷰어가 PR에서 읽게 한다[](source:fio-trail) |
| Autonomous run 플레이북 | 반복마다 무엇이 바뀌었고 완료 조건이 움직였는지 한 줄[](source:autonomous) |
| Autopilot-full·Autopilot-stack 플레이북 | PR 담당마다 약 15분 안에 `decisions.tsv` 기록을 시작한다[](source:autopilot-full)[](source:autopilot-stack) |
| Orchestrate 플레이북 | 프로그램 전체 기록. 마지막에 다른 모델 검토까지 포함해 감사한다[](source:orchestrate)[](source:orchestrate-close) |
| Hillclimb 플레이북 | 시도마다 한 줄. 칸 구성은 아래 주의 참고[](source:hillclimb) |
| Pause safely 플레이북 | 기록이 있으면 재개 메모에 다시 쓰지 않고 기록을 가리킨다[](source:pause) |
| `principle-prove-it-works` | 큰 이전처럼 나중에 감사해야 하는 작업만 산출물을 커밋한다[](source:prove) |

## 한 줄에는 무엇을 쓰나 {#format}

기록은 TSV 파일 하나다. 한 줄이 결정 하나이고, 칸 안에서 줄을 바꾸지 않는다. 새 기록은 `references/decision-log-template.tsv`의 머리 줄을 복사해 시작한다.[](source:format)[](source:tpl)

| 칸 | 담는 것 |
| --- | --- |
| `ts` | ISO8601 시각[](source:format) |
| `phase` | 단계나 작업 갈래 |
| `decision` | 고르거나 한 일, 한 줄 |
| `why` | 쉬운 말로 쓴 이유. 원칙 때문이면 전문용어 꼬리표 대신 풀어서 쓴다 |
| `evidence` | 증명하는 링크나 경로. 커밋 SHA, PR 번호, `file:line`, 산출물·추적·스크린숏 경로. 문단은 절대 안 된다 |
| `result` | 결과나 완료 조건 상태. 예: `tests green`, `reverted`, `pixel-diff 0`, `INCONCLUSIVE`, `open` |

@code source=example language=text

원문 예시는 동료에게 말하듯 쉬운 문장으로 쓴다.[](source:example) 기록 문장에도 `unslop`이 적용된다.[](source:logging)

| 남길 것 | 남기지 않을 것 |
| --- | --- |
| 고른 갈림길, 검증 결과가 붙은 완료 단위, 계기가 붙은 방향 전환·되돌림, 드러난 막힘, 고친 통과 조건. 반복 실행이면 반복마다 한 줄[](source:logging) | 모든 행동, 사소하거나 뻔한 것[](source:logging) |

## 실행이 여럿이면 어떻게 구분하나 {#runs}

실행 하나는 에이전트 대화 하나다. 나중 턴과 그 대화의 요약도 같은 실행이다. 이어받기, 교체된 에이전트, 새 채팅은 새 실행이다.[](source:runs)

- 이미 줄이 있는 기록에 덧붙이는 실행은 첫 줄의 `phase`를 `start`로 쓴다.[](source:runs)
- 다른 실행의 `start` 줄 뒤에 다시 쓰는 첫 줄도 `start`다. 그래서 나중 턴에 돌아온 실행은 먼저 마지막 몇 줄을 읽어 다른 실행이 썼는지 본다.[](source:runs)
- `start` 줄은 자기가 쓰지 않은 앞줄들의 `ts` 범위를 적고, `evidence`에는 에이전트 id 같은 이 실행의 이름을 적는다.[](source:runs)
- `start`는 이 용도로만 쓴다.[](source:runs)

| 보관 위치 | 조건 |
| --- | --- |
| 작업 폴더의 `decisions.tsv` | 기본. `git`에 넣지 않는다[](source:where) |
| `.audit/<task-slug>.tsv` | 여러 작업이 동시에 돌 때. `git`에 넣지 않는다[](source:where) |
| 커밋 | 리뷰어가 기록이 있어야 결과를 믿을 만큼 큰 작업일 때만[](source:where) |

## log.sh는 무엇을 해 주나 {#log-script}

한 줄은 `scripts/log.sh <logfile> <phase> <decision> <why> <evidence> <result>`로 쓴다.[](source:logging) 맨 `printf`로 덧붙여도 되지만, 생성되거나 사용자가 준 글이 칸에 들어가면 스크립트가 막는 바이트를 똑같이 조심해야 한다.

@workflow id=log-flow title="log.sh 처리 순서"
| args | 인자 6개? | backend |
| fail | 종료 1 | security |
| prep | 폴더·머리 줄 | backend |
| clean | 셀 정리 | security |
| append | 한 줄 추가 | database |
| args > fail | 아니오 | |
| args > prep | 예 | emphasis |
| prep > clean | | emphasis |
| clean > append | | emphasis |

@steps id=log-steps
| l-args | 인자 6개? | 인자가 정확히 6개가 아니면 사용법을 표준 오류로 찍는다.[](source:logsh) | log-flow | args |
| l-fail | 종료 1 | 아무것도 쓰지 않고 종료 코드 1로 끝난다. | log-flow | fail |
| l-prep | 폴더·머리 줄 | 기록 파일의 폴더가 없으면 `mkdir -p`로 만든다. 파일이 없거나 비어 있으면 머리 줄을 쓴다. 이때도 `>`가 아니라 `>>`를 쓴다. 네트워크 마운트에서 검사가 틀려도 잃는 것은 머리 줄 하나뿐이다. | log-flow | prep |
| l-clean | 셀 정리 | 나머지 다섯 칸에서 탭·줄바꿈·CR을 공백으로 바꾼다. `=`, `+`, `-`, `@`로 시작하는 칸 앞에는 작은따옴표를 붙인다. | log-flow | clean |
| l-append | 한 줄 추가 | `ts`를 UTC 시각으로 찍고 여섯 칸을 탭으로 이어 파일 끝에 덧붙인다. | log-flow | append |

@code source=logsh-clean language=bash

스크립트 주석이 밝힌 이유는 스프레드시트다. 이 기록은 스프레드시트로 열릴 것을 전제한다. 그래서 PR 제목, 파일 이름, 생성된 글 같은 외부 입력이 수식으로 실행되면 안 된다.[](source:logsh-clean) 판정: `-12ms`처럼 `-`로 시작하는 정상 값도 앞에 작은따옴표가 붙는다.[](source:logsh-clean)

## 끝내기 전에 무엇을 확인하나 {#before-handback}

@sequence id=handback-seq title="넘기기 전 두 가지 확인"
| actor agent | 에이전트 | backend |
| actor log | 결정 기록 | database |
| actor reviewer | 검토 담당 | security |
| actor user | 사용자 | frontend |
| agent | log | 이번 실행 줄 대조 |
| agent | log | 바로잡는 줄 추가 |
| agent | reviewer | 다른 계열로 띄움 |
| reviewer | agent | 주의할 점 | return |
| agent | user | Attention 절 | emphasis |

@steps id=handback-steps
| h-check | 이번 실행 줄 대조 | 이번 실행의 대화 기록을 읽는다. 위치는 현재 작업 공간의 `agent-transcripts/`이고 시스템 프롬프트가 경로를 알려 준다. `~/.cursor/projects/*/`를 와일드카드로 한꺼번에 훑지 않는다. 관계없는 개인 대화까지 읽게 되기 때문이다.[](source:audit) | handback-seq | |
| h-fix | 바로잡는 줄 추가 | 모든 줄이 실제 결정이나 행동에 대응하는지, 근거가 열리고 그 줄의 주장을 보여 주는지 확인한다. 작업을 바꾼 갈림길·방향 전환·버린 접근이 빠졌으면 빈틈이니 추가한다.[](source:audit) | handback-seq | |
| h-review | 다른 계열로 띄움 | 작업한 모델과 다른 계열의 서브에이전트를 띄운다. 자기 검토는 대신할 수 없다. 이 서브에이전트는 기록과 대화 기록을 읽고, 일을 다시 하지 않고 무엇이 아쉽거나 위험한지만 훑는다.[](source:xreview) | handback-seq | |
| h-flags | 주의할 점 | 근거가 약하거나 없는 결정, 대화 기록에 증거 없이 건너뛰거나 주장한 검증, 돌이켜 보면 위험한 선택(너무 이른 결정, 범위 확장, 증상만 가리기), 대충 훑으면 놓칠 빈틈을 짚는다.[](source:xreview) | handback-seq | |
| h-attn | Attention 절 | 기록을 만든 실행의 모든 답변은 `Attention` 절로 끝난다. 첫 줄은 `reviewed by <model>`이고, 그 아래에 주의점마다 해당 줄이나 순간을 가리킨다.[](source:xreview) | handback-seq | |

대조 범위는 이번 실행의 구간이다. 구간은 이번 실행의 `start` 줄에서 시작하고, 이 실행이 기록을 만들었다면 첫 줄에서 시작한다. 다른 실행의 다음 `start` 줄에서 끝난다.[](source:audit)

@callout level=warning title="이야기가 아니라 기록을 바로잡는다"
대조는 어떤 줄도 고치거나 지우지 않는다. 지어낸 줄이라도 마찬가지다. 실제 결정도 행동도 아니거나 주장·근거가 틀린 줄에는 실제로 일어난 일과 열리는 근거를 담은 새 줄을 더해 덮는다.[](source:audit) 다른 실행의 줄은 대조하지 않는다. 다만 이번 작업으로 그 줄이 틀렸다는 것이 드러나면 같은 방식으로 덮는다.[](source:audit)

주의점이 없으면 "No flags"라고 써도 된다. 판정: 모델 이름 한 줄만 적고 주의점 칸을 비워 두는 것은 허용되지 않는다는 뜻으로 읽힌다.[](source:xreview)

## 무엇을 강제하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 기준 기록은 하나만 둔다[](source:format) | 의무 |
| 덧붙이기만 한다. 잘못된 결정은 덮는 새 줄로 바로잡고 기록을 고치거나 지우지 않는다[](source:rules) | 금지 |
| 근거는 일회용 수작업보다 커밋된 스크립트가 만든 것을 우선한다(`principle-encode-lessons-in-structure`)[](source:rules) | 권고 |
| 넘기기 전에 대화 기록과 대조한다[](source:audit) | 의무 |
| 넘기기 전에 다른 모델 계열의 검토를 받는다[](source:xreview) | 의무 |
| 다른 스킬은 이름으로 이 스킬을 부르고 칸 구성을 다시 적지 않는다[](source:compose) | 금지 |

기록을 읽는 사람은 위에서 아래로 읽고, 근거를 따라가 보고, 일부를 직접 확인한다. 커밋한 TSV 파일은 GitHub 화면에서 표로 보인다. 터미널에서는 `column -s$'\t' -t decisions.tsv`로 표처럼 본다.[](source:reading)

@callout level=open-question title="Hillclimb 플레이북이 칸 구성을 따로 정한다"
`playbooks/hillclimb.md`는 이 스킬로 기록을 열라고 하면서 칸을 직접 적는다. `id, hypothesis, change, before, after, delta, tests, verdict, note`이고 파일 이름은 `decision.tsv`다.[](source:hillclimb) 이 스킬은 칸이 `ts, phase, decision, why, evidence, result`이고, 다른 스킬은 칸을 다시 적지 말라고 한다.[](source:format)[](source:compose) 어느 쪽이 우선하는지는 원문에 명시 없음.

## 흐름 속 위치 {#position}

@workflow id=smyw-position title="show-me-your-work 앞뒤의 스킬"
| callers | 부르는 스킬 | backend |
| smyw | show-me-your-work | backend |
| back | 부른 곳 복귀 | backend |
| callers > smyw | 결정 | |
| smyw > back | 기록 경로 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `poteto-mode`의 결정 | TSV 기록 | 길거나 자율적이거나 여러 단계인 작업, 자리 비운 작업. 위험이 크면 커밋 | r10 |
| `figure-it-out`의 단계별 결정 | 기록 | 보통 커밋해서 PR에서 읽게 한다 | r70 |
| 기록 문장 | `unslop` 적용 | 기록 문장에도 적용 | r91 |
| `principle-prove-it-works`의 안내 | - | 나중에 감사할 크거나 복잡한 작업만 커밋 | r96 |

플레이북별 호출은 위 "언제 켜지나" 표에 있다. 전체 흐름은 `pstack/_group-run/run.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `scripts/log.sh`, `references/decision-log-template.tsv`. 세 파일 모두 원본이다.
- 대조용으로 읽은 줄: `poteto-mode`, `figure-it-out`, `principle-prove-it-works`, 플레이북 7개, `poteto-help/references/recipes.md`의 해당 줄.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: `reporting-skills/pstack/show-me-your-work`와 `SKILL.md`, `scripts/log.sh`, `references/decision-log-template.tsv`의 `shasum`이 모두 같다. 원장은 `SKILL.md`만 비교했다.
- 실제로 실행해 보지 않았다. `log.sh`도 돌리지 않았고 동작은 코드를 읽고 적었다.
- 원장 대조: Orchestrate 플레이북과 Pause safely 플레이북도 이 스킬을 이름으로 부른다. 원장의 플레이북 표에는 빠져 있다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`multi-phase-plan.md`는 `pstack/skills/show-me-your-work/SKILL.md` 경로를 적는다. 이 저장소에는 그 경로가 없다. 설치된 플러그인 기준 경로로 보이지만 확인하지 않았다.
검토 담당의 "다른 모델 계열"을 어떻게 고르는지, `pstack-models.mdc`의 어느 역할 줄을 쓰는지는 원문에 명시 없음.
