# dsh-pr-description 스킬은 에이전트를 어떻게 바꾸나 {#dsh-pr-description-skill}

`dsh-pr-description`이 켜지면 에이전트는 deepseek-harness PR 설명을 네 개 절 `Motivation`, `Changes`, `Testing`, `AI Usage`에 맞춰 쓴다. PR이 바뀌거나 리뷰 라운드가 끝나면 같은 기준으로 설명을 고친다.[](source:pd-struct)[](source:pd-fm)

- `Motivation`에는 같은 저장소의 이슈 참조가 하나 이상 있어야 한다. PR 번호는 이슈 참조로 세지 않는다.[](source:pd-motiv)
- `Testing`은 테스트 설계로 시작하고, 이미 돌린 테스트만 항목으로 적는다.[](source:pd-design)[](source:pd-entries)
- `AI Usage`는 다섯 단계마다 AI 참여 등급과 참여도(5의 배수 퍼센트)를 표로 적고, 가장 높은 등급을 배지로 선언한다.[](source:pd-levels)[](source:pd-fmt-rules)
- 설명은 PR을 만들 때 완성하고, 이후에는 PR과 어긋난 절만 고쳐 쓴다.[](source:pd-scope)

@answer scope="deepseek-harness/dsh-pr-description · 원본 텍스트 파일 1개 · 커밋 475505c · 지시상 동작"
@meta locale=ko
@source pd-fm title="deepseek-harness/dsh-pr-description/SKILL.md · 18973B · frontmatter" path=deepseek-harness/dsh-pr-description/SKILL.md lines=1:5
@source pd-intro title="SKILL.md · 목적과 템플릿 관계" path=deepseek-harness/dsh-pr-description/SKILL.md lines=9:9
@source pd-scope title="SKILL.md · Scope" path=deepseek-harness/dsh-pr-description/SKILL.md lines=13:15
@source pd-struct title="SKILL.md · Description structure" path=deepseek-harness/dsh-pr-description/SKILL.md lines=19:21
@source pd-motiv title="SKILL.md · Motivation" path=deepseek-harness/dsh-pr-description/SKILL.md lines=25:26
@source pd-changes title="SKILL.md · Changes" path=deepseek-harness/dsh-pr-description/SKILL.md lines=30:32
@source pd-design title="SKILL.md · Test design" path=deepseek-harness/dsh-pr-description/SKILL.md lines=38:47
@source pd-entries title="SKILL.md · Test entries" path=deepseek-harness/dsh-pr-description/SKILL.md lines=51:53
@source pd-discl title="SKILL.md · Change-specific disclosures" path=deepseek-harness/dsh-pr-description/SKILL.md lines=57:64
@source pd-aiintro title="SKILL.md · AI Usage 개요" path=deepseek-harness/dsh-pr-description/SKILL.md lines=68:72
@source pd-levels title="SKILL.md · Levels 표" path=deepseek-harness/dsh-pr-description/SKILL.md lines=74:81
@source pd-stages title="SKILL.md · Stages 개요" path=deepseek-harness/dsh-pr-description/SKILL.md lines=85:85
@source pd-break title="SKILL.md · breakdown 기준" path=deepseek-harness/dsh-pr-description/SKILL.md lines=87:92
@source pd-dsgn title="SKILL.md · design 기준" path=deepseek-harness/dsh-pr-description/SKILL.md lines=94:99
@source pd-test title="SKILL.md · testing 기준" path=deepseek-harness/dsh-pr-description/SKILL.md lines=101:106
@source pd-impl title="SKILL.md · implementation 기준" path=deepseek-harness/dsh-pr-description/SKILL.md lines=108:113
@source pd-review title="SKILL.md · review 기준" path=deepseek-harness/dsh-pr-description/SKILL.md lines=115:120
@source pd-grading title="SKILL.md · Grading rules" path=deepseek-harness/dsh-pr-description/SKILL.md lines=124:130
@source pd-badge title="SKILL.md · Badge URLs" path=deepseek-harness/dsh-pr-description/SKILL.md lines=134:144
@source pd-fmt title="SKILL.md · Section format 틀" path=deepseek-harness/dsh-pr-description/SKILL.md lines=151:161
@source pd-fmt-rules title="SKILL.md · Section format 규칙" path=deepseek-harness/dsh-pr-description/SKILL.md lines=164:168
@source pd-timing title="SKILL.md · Update timing" path=deepseek-harness/dsh-pr-description/SKILL.md lines=172:176
@source pd-example title="SKILL.md · #6013 예시" path=deepseek-harness/dsh-pr-description/SKILL.md lines=180:198
@source pd-proc title="SKILL.md · Creating and updating" path=deepseek-harness/dsh-pr-description/SKILL.md lines=202:204
@source rbg-gif title="deepseek-harness/record-browser-gif/SKILL.md · 15698B · GUI PR 절(관계 확인용)" path=deepseek-harness/record-browser-gif/SKILL.md lines=12:16

## 언제 켜지고 어디까지 적용되나 {#trigger}

@code source=pd-fm language=yaml

`description`이 스킬을 켜는 시점으로 드는 때는 PR을 만들 때와, 나중에 변경이나 처리된 리뷰 라운드 때문에 설명을 고칠 때다.[](source:pd-fm) frontmatter에는 `disable-model-invocation`이 없고 `user-invocable: false`만 있다.[](source:pd-fm) 판정: 사용자가 직접 부르는 스킬이 아니라 모델이 `description`을 참고해 켜는 스킬로 읽힌다. 이 필드가 하네스에서 정확히 무엇을 하는지는 원문에 명시 없음.

적용 범위는 넓다. `gh pr create --body-file`처럼 PR 템플릿을 건너뛰는 경로로 만든 PR도 이 스킬을 따른다. 템플릿은 절 제목과 자리표시자만 주고, 각 절에 무엇을 쓸지는 이 스킬이 정한다.[](source:pd-intro) 템플릿 파일(`.github/pull_request_template.md`)은 이 저장소에 없어서 범위 밖이다.

- PR을 만들 때 설명을 완성한다.[](source:pd-scope)
- PR이 있는 동안에는 설명이 PR과 맞지 않을 때 해당 절만 고친다. 시점은 "적당하다고 판단할 때"라서 정해진 주기가 없다.[](source:pd-scope)
- stack(쌓인 PR) 안의 PR은 각각 설명을 갖고, 자기 층이 base branch 대비 바꾼 것만 다룬다.[](source:pd-scope)

사용자에게 묻거나 승인받는 단계는 원문에 명시 없음. 사람은 설명 언어를 다른 언어로 요청할 수 있고, 사람이 맡은 몫은 `AI Usage` 등급을 매길 때 평가하는 대상이다.[](source:pd-struct)

## 설명의 절마다 무엇을 쓰나 {#sections}

설명은 `## Motivation`, `## Changes`, `## Testing`, `## AI Usage` 네 개 이차 제목을 이 순서로 쓴다.[](source:pd-struct) `Interface changes`, `Test design` 같은 고정 제목과 라벨은 영어로 쓴다. 표 머리글과 나머지 본문은 PR 설명의 언어로 쓰며, 사람이 다른 언어를 요청하지 않으면 중국어다.[](source:pd-struct)

| 절 | 쓰는 내용 | 규칙 |
| --- | --- | --- |
| `Motivation` | 문제 한 문장, 이슈 참조 | 같은 저장소 이슈를 하나 이상 참조한다. 해결하면 `Fixes #N`, `Closes #N`, `Resolves #N`, 맥락만이면 `Refs #N`. PR 번호와 HTML 주석·코드 펜스·인라인 코드 안의 참조는 세지 않는다.[](source:pd-motiv) |
| `Changes` | `Interface changes`, `Behavior changes` | 없으면 `None`을 쓴다. 변경분이 보장하고 테스트가 덮는 동작만 적는다. 문서와 에이전트 지시(README, `AGENTS.md`, 스킬) 변경도 그 독자에게는 동작 변경이다.[](source:pd-changes) |
| `Testing` | 테스트 설계, 그다음 테스트 항목 | 항목은 테스트 메서드 하나마다 하나씩 쓴다. 실행한 테스트와 결과만 적고, 로컬 실행인지 CI인지 밝힌다.[](source:pd-entries) |

`Interface changes`는 명령(저장소 스크립트 포함), 플래그, 설정 키, 환경 변수, 공개 export, 플러그인 등록 값, 프로토콜, 저장 형식의 변경이다. `Behavior changes`는 사용자·모델·개발자·시스템이 관찰하는 결과(기본값, 성능, 시점, 출력)의 변경이다.[](source:pd-changes) 이슈 규칙의 세부와 Priority 대응은 `.github/issue-management/README.md`가 갖고, 이 저장소에 없어서 범위 밖이다.[](source:pd-motiv)

**테스트 설계**는 `Changes`의 각 항목을 테스트가 어떻게 덮는지, 그 범위가 왜 완전한지 요약한다. 변경 유형마다 보여 줄 것이 다르다.[](source:pd-design)

| 변경 유형 | 테스트 설계가 보여 주는 것 |
| --- | --- |
| 동작 변경 | 시나리오 × 변경 전 동작 × 변경 후 동작 × 덮는 테스트의 행렬. 변경 전에 실패했거나 달랐던 시나리오가 드러나야 한다 |
| 성능 변경 | 단계나 시나리오별 전후 값과 측정 조건(기계, 실행 횟수, 값을 뽑는 방법) |
| 동작 변화 없는 리팩터링·이전 | 동작이 같음을 보인 방법(바이트 단위 비교, 변하지 않은 스냅숏, 신구 비교 테스트) |
| 문서만 변경 | 내용을 확인한 방법(링크, 이중 언어 짝, 예제 컴파일 등) |

유형이 섞이면 있는 유형마다 한 형식씩 쓴다. `Changes`에서 `None`으로 적은 항목은 테스트 설계가 필요 없다.[](source:pd-design) 확인할 만한 증거(출력, 스크린숏, 녹화, 로그)는 해당 항목의 `<details><summary>Proof</summary>` 블록에 넣는다. 출력이 길면 명령, 개수, 결과 요약만 넣어도 된다.[](source:pd-entries)

**변경별 공개 사항**은 새 제목을 만들지 않고, 관련된 절(보통 `Changes`)에 `**Existing test behavior**` 같은 굵은 영어 라벨로 쓴다.[](source:pd-discl)

| 변경 | 설명에 적을 것 | 규칙을 가진 곳 |
| --- | --- | --- |
| 기존 테스트가 서술하는 동작을 바꿈 | 왜 바꿨는가 | 루트 `AGENTS.md`(범위 밖) |
| `scripts/doc-budgets.manifest.json`의 상한을 올림 | 올린 상한마다 옛값·새값과 그 단어가 꼭 필요한 이유 | `docs/AGENTS.md`(범위 밖) |
| 제품 사용자에게 보이는 GUI 동작을 바꿈 | 데모 GIF 파일과 `record-browser-gif`가 요구하는 고지. GIF 없는 GUI 변경마다 "넣지 않았다"와 이유 | `record-browser-gif` |
| 용어표에 없는 번역어를 씀 | 번역어의 출처, 또는 보류 용어 아래의 제안 | `docs/i18n/translation-rules.md`(범위 밖) |

## `AI Usage`의 등급과 단계는 무엇인가 {#levels}

`AI Usage`는 PR의 각 단계에서 AI가 얼마나 참여했고 결정은 누가 했는지 기록한다. 참여도는 그 단계의 결정과 작업에 AI가 얼마나 참여했는가이며, 코드 양·시간·토큰의 척도가 아니다. 고른 등급의 구간 안에서 5의 배수로 적는다.[](source:pd-aiintro)

| 등급 | 뜻 | AI 참여도 |
| --- | --- | --- |
| `hint 人工独立` | 사람이 하고, AI는 참여하지 않거나 수동적 제안만 한다 | 0–10% |
| `assist 人工主导` | 사람이 핵심 내용이나 모든 주요 결정을 주고, AI가 일부를 채운다 | 15–25% |
| `pair 人工引导` | 사람이 핵심 방향이나 제약을 주고 AI 결과를 여러 번 고친다. 사람이 내부를 이해한다 | 30–50% |
| `copilot 人工把关` | AI가 전체를 하고, 사람은 검토·선택·거부하며 핵심을 결정하거나 명확히 한다 | 55–85% |
| `auto 模型自主` | AI가 자율로 끝내고, 사람은 목표를 정하거나 결과를 받아들인다 | 90–100% |
| `n/a 暂不适用` | 그 단계가 없거나 아직 일어나지 않았다 | — |

단계는 `breakdown 问题拆解`, `design 方案设计`, `testing 验收测试`, `implementation 技术实现`, `review 评审处理` 다섯 개이고, 이 순서를 바꾸지 않는다. 기준은 assist부터 auto까지만 원문에 적혀 있고, `hint`는 등급 표의 뜻으로 판단한다.[](source:pd-stages)

| 단계 | 평가 대상 | auto | copilot | pair | assist |
| --- | --- | --- | --- | --- | --- |
| `breakdown` | 문제가 나온 뒤 사람이 쪼개기에 참여했는가. "고쳐야 하나"를 확인하는 일도 여기다 | 에이전트가 바로 처리 | 에이전트가 하위 문제·원인·범위를 찾고 사람은 확인하거나 항목을 뺀다 | 사람이 핵심 사실 한두 개(의심 방향, 조건, 범위 한계)를 주거나 원인 추적을 요구 | 사람이 범위를 이루는 문제 목록이나 원인 판단을 주고 범위를 정한다[](source:pd-break) |
| `design` | 논리 설계 구조를 누가 냈는가 | 사람이 에이전트 설계를 그대로 채택하거나 추천안만 확인 | 사람이 에이전트 설계 중에서 고르거나 일부를 거부 | 에이전트가 구조를 내고 사람이 핵심 제약·이름·여러 차례 수정을 준다 | 사람이 구조(모듈 분리, 데이터 흐름, 핵심 인터페이스)를 주고 에이전트가 메커니즘을 채운다[](source:pd-dsgn) |
| `testing` | 인수 목표·테스트 케이스·행렬을 누가 정하고 결과를 누가 보는가 | 에이전트가 목표와 케이스를 정하고 사람은 게시 승인이나 추천 범위 확인까지 | 사람이 케이스·행렬·결과를 검토하거나 의견을 낸다 | 사람이 정량 목표나 필수 시나리오를 정하고 에이전트가 케이스를 설계 | 사람이 행렬의 차원이나 행을 정의하고 결과를 직접 돌려 확인한다[](source:pd-test) |
| `implementation` | 바뀐 내용(코드, 문서, CI, 릴리스 스크립트)에 사람이 얼마나 개입했는가 | 에이전트가 전부 쓰고 사람의 변경분 리뷰 기록이 없다 | 사람이 변경분을 검토(조각별 스테이징 포함)하고 수용하거나 다시 하지 않아도 되는 의견을 낸다 | 사람이 일부를 되돌리거나 다시 하라고 요구하거나 리팩터링·구현 방식을 지정 | 사람이 변경분의 핵심 부분을 직접 쓴다. 받아쓰게 하는 것은 직접 쓴 것이 아니다[](source:pd-impl) |
| `review` | 처리한 리뷰 의견마다 고칠지 거절할지 누가 정했는가 | 에이전트가 모든 의견을 결정하고 답한다 | 사람이 일괄 승인이나 범주별 지시만 하거나, 에이전트의 처리 목록 중 몇 개에만 답한다 | 사람이 문구 외 모든 항목에 고침·거절·보류를 정한다. 에이전트가 실행하고 답한다 | 사람이 리뷰어에게 직접 답하거나 이견 토론을 이끈다[](source:pd-review) |

단계별로 헷갈리기 쉬운 경계는 다음과 같다.

- `design`은 누가 먼저 후보를 냈는지가 아니라 채택된 구조를 누가 냈는지로 본다. 에이전트가 후보를 내고 사람이 채택될 구조를 줬다면 assist다.[](source:pd-dsgn)
- 관찰 가능한 결과로 말한 제약은 구조가 아니라 제약이다. 사람이 여러 번 고쳐서 도달한 구조는 사람이 낸 것으로 센다.[](source:pd-dsgn)
- `testing`에서 "수정 전에 테스트를 먼저 쓰라" 같은 작업 순서 지시는 세지 않는다.[](source:pd-test)
- `review`에서 처리한 의견이 없으면 의견이 달려 있거나 병합 뒤에 왔어도 `n/a`다.[](source:pd-review)
- `review`는 봇과 사람의 의견을 모두 세고, 답글을 누가 달았는지가 아니라 누가 결정했는지로 매긴다.[](source:pd-review)

## 등급은 어떤 규칙으로 매기나 {#grading}

판정: 기록이 충분하면 기준을 충족하는 등급 중 사람 개입이 가장 큰 등급을 고르는 규칙이라서, 등급이 사람 쪽으로 기우는 편이다.[](source:pd-grading)

- 등급은 세션 기록과 작업 기록으로 매긴다. 서브에이전트 세션에서 사람이 보낸 메시지는 센다. 에이전트가 서브에이전트에게 쓴 지시는 사람 메시지가 아니다.[](source:pd-grading)
- 이 PR에 남은 작업만 센다. 이전 세션의 작업도 이 PR에 남았으면 센다. 사람이 되돌리라고 한 작업은 PR에 남지 않아도 센다.[](source:pd-grading)
- `breakdown`, `design`, `testing`, `implementation`에서는 작성자가 에이전트와 일하는 사람이다. 리뷰어의 승인과 의견은 `review`에서만 센다.[](source:pd-grading)
- branch, 작업 순서, 스테이징, commit·push·PR 시점 같은 과정 지시는 어느 단계의 사람 개입으로도 세지 않는다.[](source:pd-grading)
- 기록이 충분하면 기준을 충족하는 등급 중 사람 개입이 가장 큰 등급을 고르고, 사람과 에이전트의 몫은 참여도 값으로 표현한다. 기록이 모자랄 때만 기록이 뒷받침하는, 사람 개입이 더 적은 등급을 고른다.[](source:pd-grading)
- 한 단계에 변경이 여러 개면 주된 변경으로 매기고 나머지가 어떻게 다른지 설명에 적는다. 주된 변경은 변경분과 리뷰 노력의 비중이 가장 큰 것이다. 지배적인 것이 없으면 사람 개입이 가장 큰 변경으로 매긴다. 나중 작업으로 주된 변경이 바뀌면 단계를 다시 매긴다.[](source:pd-grading)
- 구간 안에서 참여도 값은, 사람 개입이 더 큰 등급의 기준에 가까울수록 낮게, 개입이 적은 등급에 가까울수록 높게 고른다.[](source:pd-grading)

## 표는 어떤 모양이고 언제, 어떻게 고치나 {#format}

`AI Usage` 절은 `ai-declaration` 블록으로 시작하고, 단계마다 표 한 줄이 이어진다.[](source:pd-fmt)

@code source=pd-fmt language=markdown

- 배지 등급은 `n/a` 줄을 뺀 단계 행 중 AI 참여가 가장 큰 등급이다. 선언 규격은 버전 0.1.2로 고정한다. 규격이 바뀌면 이 스킬과 PR 템플릿의 버전 표기를 모두 고친다.[](source:pd-fmt-rules)[](source:pd-badge)
- `ai-declaration` 시작·끝 표식은 남겨서 기존 선언을 중복 없이 제자리에서 바꿀 수 있게 한다.[](source:pd-fmt-rules)
- 결정 기록은 한두 문장, 중국어 80자 또는 영어 40단어 이하다. 누가 어떤 결정을 했는지 쓰고, 대표 결정은 한두 개만 이름 붙이고 나머지는 개수만 적는다.[](source:pd-fmt-rules)
- 확정된 사실로 쓴다. "세션에서 보이지 않음", "작성자 확인 대기" 같은 얼버무림은 쓰지 않는다.[](source:pd-fmt-rules)
- 사람은 작성자나 리뷰어로 부르고 사용자 이름은 쓰지 않는다. 판단, 세션 시각, 세션 ID, 직접 인용, 검사·CI의 실행과 처리(로컬 건너뜀, 훅, 재실행, 무관한 실패)는 넣지 않는다.[](source:pd-fmt-rules)

**갱신 시점.**[](source:pd-timing)

- PR을 만들 때 `review` 행은 등급 칸 `n/a 暂不适用`, 참여도 칸 `—`, 결정 기록 칸에 리뷰 의견을 아직 처리하지 않았다는 문장을 쓴다.
- PR이 있는 동안 고칠 때는 지금까지의 모든 작업을 덮도록 영향받은 행을 다시 쓴다. 뒤 작업이 결정이나 사람 몫을 바꾼 앞 단계도 포함한다. 변경 이력을 덧붙이지 않는다.
- 단계 등급이 바뀌면 그 행을 고친다. 가장 높은 등급이 바뀌면 배지 주소와 선언 줄도 함께 고친다.
- `review` 행은 처리한 리뷰 의견만 기록한다. 승인, 병합 시점, 처리하지 않은 의견은 넣지 않는다.
- 리뷰 라운드는 고친 내용을 push하고 의견에 답하면 끝난다. 병합 뒤에 온 의견은 갱신을 일으키지 않는다.

**작성과 갱신 절차.**[](source:pd-proc)

@steps id=body-steps
| write | 본문 파일 쓰기 | git이 무시하는 파일(예: `.artifacts/pr/body.md`)에 본문을 쓴다. 그 파일을 `gh pr create --body-file <파일>` 또는 `gh pr edit <번호> --body-file <파일>`로 PR에 반영한다. GIF 파일을 넣을 때는 `record-browser-gif`를 따라 `--attach`를 쓴다. |
| backup | 갱신 전 백업 | 갱신하기 전에 `gh pr view <번호> --json body --jq .body`로 현재 설명을 저장한다. 필요한 절만 고치고, 작성자가 쓴 내용과 미디어는 그대로 둔다. 기존 `ai-declaration` 블록은 내용만 바꾼다. 코드와 맞지 않는 문장은 지운다. 옛 `## Human and Agent Roles` 제목이 있으면, 그 제목과 등급 줄을 `## AI Usage`와 블록으로 바꾸고 AI Usage 절은 하나만 둔다. |
| verify | 읽어서 확인 | 설명을 다시 읽어 네 절이 모두 있는지, `AI Usage`가 현재 코드와 리뷰 상태에 맞는지, 옛 `Human and Agent Roles` 절이 없는지 확인한다. |

원문의 #6013 예시는 다섯 단계 중 `pair`가 네 개, `assist`가 하나이고 참여도는 40, 20, 40, 35, 40%다. 배지는 가장 높은 등급인 `pair`로 달린다.[](source:pd-example) 판정: 예시의 모든 참여도 값이 자기 등급 구간(`pair` 30–50, `assist` 15–25) 안에 있다.[](source:pd-levels)

## 이 스킬은 흐름의 어디에 있나 {#position}

묶음은 `ship`이다. 전체 흐름은 `deepseek-harness/_group-ship/ship.html`에 있다. 관계 근거는 `deepseek-harness/relations.md`의 `rel-id`로 확인한다.

@workflow id=pd-position title="PR 설명 앞뒤의 스킬"
| cr | dsh-code-review | backend |
| pd | dsh-pr-description | backend |
| gif | record-browser-gif | backend |
| stack | dsh-merging-stacked-prs | backend |
| cr > pd | 처리된 지적 | dashed |
| pd > gif | GUI 변경 | emphasis |
| pd > stack | 층마다 설명 | dashed |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `dsh-code-review` | 처리된 리뷰 지적 | - | 리뷰 라운드(수정을 올리고 답변)가 끝나면 설명의 `review` 행을 고친다. 두 스킬은 서로 이름을 부르지 않는다. 원장 근거 방식은 추론이다[](source:pd-timing) | r08 |
| `record-browser-gif` | - | GIF 첨부 | 제품 사용자에게 보이는 GUI 동작을 바꿀 때 데모 GIF 파일과 고지를 넣는다. GIF 파일이 없으면 없다는 문장과 이유를 쓴다. GIF 파일을 넣을 때는 `--attach`를 쓴다[](source:pd-discl)[](source:pd-proc)[](source:rbg-gif) | r23 |
| `dsh-merging-stacked-prs` | stack의 PR 설명 | - | stack 안의 PR마다 설명이 따로 있고 자기 층의 변경만 다룬다. 이 줄만 확인된다. 병합 스킬 쪽에서 설명을 다루는 줄은 원문에 명시 없음. 원장 근거 방식은 추론이다[](source:pd-scope) | r24 |

묶음 개요에는 `dsh-pre-push-checks` 다음에 PR 설명이 오지만, 원장에 그 관계의 `rel-id`가 없고 `dsh-pre-push-checks` 원문에도 이 스킬을 부르는 줄이 없어서 그림에서 뺐다. 판정: 순서는 묶음의 작업 흐름일 뿐 원문이 직접 정한 선후가 아니다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 하나(원본). 이 스킬 폴더에는 다른 텍스트 파일이 없다.
- 관계 확인을 위해 `record-browser-gif/SKILL.md`의 GUI PR 절 제목과 첫 단락, `dsh-code-review`와 `dsh-merging-stacked-prs`의 머리말과 `dsh-pre-push-checks`의 PR 언급 줄을 읽었다.
- 범위 밖: 본문이 가리키는 `.github/pull_request_template.md`, `.github/issue-management/README.md`, 루트 `AGENTS.md`, `docs/AGENTS.md`, `docs/i18n/translation-rules.md`는 원래 저장소(deepseek-harness)의 파일이라 이 저장소에 없다. 끊긴 참조가 아니다. 외부 규격 AI-DECLARATION 0.1.2도 읽지 않았다.
- 원문 비교: 다른 컬렉션에 같은 이름의 스킬이 없다(원장 기준).
- 실행하지 않았다. `gh pr create`, `gh pr edit`, `gh pr view`는 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"세션 기록과 작업 기록"을 에이전트가 어디서 어떻게 읽는지는 원문에 명시 없음. 기록이 "충분한지" 가르는 기준도 원문에 명시 없음. `user-invocable: false`가 하네스에서 어떻게 동작하는지는 이 스킬 원문으로 확인할 수 없다. 원장 r24는 원문에서 한 줄(`dsh-pr-description` 15줄)만 확인된다.
