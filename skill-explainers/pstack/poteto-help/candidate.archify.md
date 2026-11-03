# poteto-help 스킬은 에이전트를 어떻게 바꾸나 {#poteto-help-skill}

`poteto-help`를 쓰면 에이전트는 `pstack` 사용법 질문에 답만 하고 일은 시작하지 않는다. 대신 사용자가 직접 보낼 프롬프트와 답의 출처 파일 링크를 건넨다.[](source:purpose)

- 일을 시작하지 않는 이유는 `pstack` 실행이 실제 토큰을 쓰기 때문이다. 보낼지는 사용자가 정한다.[](source:purpose)
- "`pstack`으로 이 버그를 고쳐 줘"처럼 일을 시키는 메시지는 도움 질문이 아니다. 이때는 `poteto-mode`를 읽고 그 아래에서 일한다.[](source:work-msg)
- 이 스킬은 질문을 다른 스킬과 안내 문서로 보내는 지도다. 인용하기 전에 그 파일을 읽고, 지도와 다르면 그 파일을 믿는다.[](source:map-rule)
- 답은 결론부터 쓴다. 예시 프롬프트는 많아야 하나이고, 전체 지도를 요청받지 않았으면 짧게 끝낸다.[](source:reply)

@answer scope="pstack/poteto-help · 원본 텍스트 파일 3개 · 커밋 5760176"
@meta locale=ko
@source fm title="pstack/poteto-help/SKILL.md · 12884B · 본문(frontmatter)" path=pstack/poteto-help/SKILL.md lines=1:5
@source purpose title="pstack/poteto-help/SKILL.md · 목적" path=pstack/poteto-help/SKILL.md lines=9:9
@source work-msg title="pstack/poteto-help/SKILL.md · 일 요청 처리" path=pstack/poteto-help/SKILL.md lines=11:11
@source map-rule title="pstack/poteto-help/SKILL.md · 지도와 공개 링크 규칙" path=pstack/poteto-help/SKILL.md lines=13:13
@source need title="pstack/poteto-help/SKILL.md · 필요 파악" path=pstack/poteto-help/SKILL.md lines=17:23
@source state title="pstack/poteto-help/SKILL.md · 답을 바꾸는 상태" path=pstack/poteto-help/SKILL.md lines=25:28
@source setup title="pstack/poteto-help/SKILL.md · Get set up" path=pstack/poteto-help/SKILL.md lines=30:40
@source start title="pstack/poteto-help/SKILL.md · Start a task" path=pstack/poteto-help/SKILL.md lines=42:52
@source pick title="pstack/poteto-help/SKILL.md · Pick a skill 표" path=pstack/poteto-help/SKILL.md lines=54:88
@source close title="pstack/poteto-help/SKILL.md · 헷갈리는 쌍, pstack 밖 명령" path=pstack/poteto-help/SKILL.md lines=90:103
@source playbooks title="pstack/poteto-help/SKILL.md · 플레이북과 원칙" path=pstack/poteto-help/SKILL.md lines=105:120
@source fix title="pstack/poteto-help/SKILL.md · Fix a run" path=pstack/poteto-help/SKILL.md lines=122:135
@source own title="pstack/poteto-help/SKILL.md · Make pstack my own" path=pstack/poteto-help/SKILL.md lines=137:144
@source reply title="pstack/poteto-help/SKILL.md · Reply" path=pstack/poteto-help/SKILL.md lines=146:148
@source prompting title="pstack/poteto-help/references/prompting.md · 3166B · 프롬프트 작성 안내" path=pstack/poteto-help/references/prompting.md lines=1:51
@source recipes title="pstack/poteto-help/references/recipes.md · 3287B · 예시 프롬프트 모음" path=pstack/poteto-help/references/recipes.md lines=1:47
@source setup-fm title="pstack/setup-pstack/SKILL.md · frontmatter" path=pstack/setup-pstack/SKILL.md lines=1:4
@source pm-fm title="pstack/poteto-mode/SKILL.md · frontmatter" path=pstack/poteto-mode/SKILL.md lines=1:5

## 언제 켜지나 {#trigger}

@code source=fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:fm) 사용자가 `/poteto-help` 뒤에 질문을 붙여 입력할 때 켜진다. 다른 pstack 스킬 중 이 스킬을 부르는 곳은 없다(판정: `pstack/` 원본 전체를 이름으로 검색한 결과).

이 스킬은 반대로 "사용자 말만으로 켜지는 스킬은 `/setup-pstack`뿐"이라고 안내한다.[](source:setup) 실제로 `setup-pstack`의 frontmatter에만 `disable-model-invocation`이 없다.[](source:setup-fm)

## 질문을 받으면 어떻게 진행하나 {#flow}

@workflow id=help-flow title="poteto-help 진행 흐름"
| work | 일 요청? | backend |
| mode | 모드 작업 | backend |
| need | 필요 파악 | frontend |
| state | 상태 확인 | backend |
| answer | 답변 | frontend |
| work > mode | 예 | |
| work > need | 아니오 | emphasis |
| need > state | | emphasis |
| state > answer | | emphasis |

@steps id=help-steps
| s-work | 일 요청? | 일을 시키는 메시지면 도움 질문이 아니다. `poteto-mode`를 읽고 그 아래에서 일한다. `Custom Mode`로 켜 두면 계속 유지된다는 점을 한 번 알린다. | help-flow | work |
| s-mode | 모드 작업 | `poteto-mode` 아래에서 일하는 길이다. 도움 질문일 때는 이 길로 가지 않고, 일을 시작하지 않은 채 프롬프트만 건넨다. | help-flow | mode |
| s-need | 필요 파악 | 메시지와 대화에서 필요를 추론한다. "PR 리뷰는 어떤 스킬?"처럼 상황을 말하면 그 절로 바로 간다. 그래도 불분명하면 객관식 질문을 딱 하나 한다. 선택지는 설치하기, `/poteto-mode`로 작업 시작, 상황별 스킬 고르기, 잘못된 실행 고치기, `pstack`을 내 것으로 만들기 다섯 개다. 사용자가 고른 절만 답한다. | help-flow | need |
| s-state | 상태 확인 | 답을 바꾸는 상태를 확인하고, 실제로 답이 바뀔 때만 언급한다. 확인 항목은 두 가지다. 아래 표를 본다. | help-flow | state |
| s-answer | 답변 | 답을 담은 스킬이나 안내 문서를 먼저 읽고 인용한다. 이 지도와 다르면 그 파일을 믿는다. 답은 결론부터 쓴다. 예시 프롬프트는 코드 블록 하나까지, 맞는 것이 있으면 `references/recipes.md`에서 고친다. 링크는 설치된 플러그인 경로 대신 공개 사본 주소로 준다. | help-flow | answer |

| 확인하는 상태 | 뜻 | 언급하는 경우 |
| --- | --- | --- |
| `~/.cursor/rules/pstack-models.mdc`가 없다 | `/setup-pstack`을 아직 안 돌렸다. 모든 역할이 기본 모델을 쓴다[](source:state) | 답이 달라질 때만 |
| 프로젝트에 `verify-*` 스킬이나 앱 하네스가 없다 | 에이전트가 앱을 스크립트로 돌릴 수단이 없다[](source:state) | 질문이 "변경이 동작함을 증명"에 관한 것일 때 `/create-verification-skill`을 언급 |

공개 사본 주소는 `https://github.com/cursor/plugins/blob/main/pstack/` 뒤에 파일 경로를 붙인 것이다.[](source:map-rule) 사용자가 설치된 플러그인 폴더를 열지 못할 수 있어서다.

## 다섯 갈래 질문에 무엇을 답하나 {#sections}

| 갈래 | 답에 담는 내용 |
| --- | --- |
| 설치하기 | 3단계: `/add-plugin pstack`(또는 사이드바 Customize) → `/setup-pstack` → `/poteto-mode`에 목표와 통과·실패가 갈리는 확인 조건을 붙여 시작. 설치만으로는 아무것도 바뀌지 않는다[](source:setup) |
| 비용 걱정 | 토큰은 서브에이전트와 리뷰 패널에 든다. `/setup-pstack`을 다시 돌려 작은 예산이나 싼 모델을 고르고, 역할을 `auto`나 `inherit-parent`로 둔다. 패널 목록이 짧으면 서브에이전트도 줄어든다(항목 하나당 하나). `/poteto-mode`는 엄밀함이 필요한 일에만 쓴다[](source:setup) |
| `/poteto-mode`로 작업 시작 | 플레이북을 고르고 단계를 할 일 목록에 복사한다. 건너뛴 단계는 `skip: <reason>`으로 남는다. 좋은 프롬프트는 목표와 끝 판단 기준만 쓰고 스킬 목록은 쓰지 않는다[](source:start) |
| 모드 유지 | `Enter`로 시작하면 메시지 하나에만 붙어 점점 흐려진다. `Option+Enter`(Mac)·`Alt+Enter`(Windows)나 `Use as Mode`는 `Custom Mode`가 되어 나갈 때까지 매 턴 남는다. `Custom Mode`가 없는 곳에서는 작업마다 `/poteto-mode`로 시작한다[](source:start) |
| 상황별 스킬 고르기 | 기본 답은 `/poteto-mode`다. 플레이북보다 더 하거나 덜 하고 싶을 때만 스킬을 직접 추천한다. 추천 전에 그 스킬을 읽고 예시 프롬프트를 하나 준다[](source:pick) |
| 플레이북과 원칙 | 플레이북은 `/poteto-mode` 안의 단계 목록이라 슬래시 명령이 없다. "babysit this pr", "land the stack" 같은 문구가 플레이북을 직접 고른다. 원칙은 사용자가 이름으로 언급해 조종한다[](source:playbooks) |
| 잘못된 실행 고치기 | 증상 8개와 처방 표(아래)[](source:fix) |
| 내 것으로 만들기 | `/automate-me`, `/reflect`, `/poteto-mode write a skill for <workflow>`. 오작동하는 스킬은 기능 작업 안에서 말고 별도 PR로 고친다[](source:own) |

추천 표의 범위와 빈칸 처리는 다음과 같다.

- 표에는 원칙이 아닌 pstack 스킬 26개가 모두 있고, `pstack/`에 없는 `/tdd` 한 줄이 더 있다.[](source:pick)
- 표에 없는 형제 폴더는 머리말(frontmatter) `description`을 보고 안내한다.[](source:pick)
- `/deslop`, `control-cli`, `control-ui`는 `cursor-team-kit` 플러그인 것이고, `/loop`·`/create-skill`은 Cursor 내장이라고 알린다.[](source:close)
- `/orchestrate` 스킬은 없다. `Orchestrate`는 `/poteto-mode`의 플레이북이다.[](source:close)

| 증상 | 처방 |
| --- | --- |
| 몇 턴 뒤 모드가 안 먹는다 | `Enter`로 시작한 탓이다. `Custom Mode`로 켜거나 작업마다 `/poteto-mode`로 시작한다[](source:fix) |
| 질문이 지난 작업의 다음 단계로 처리됐다 | "new task"라고 말하거나 이 턴엔 모드가 필요 없다고 말한다 |
| 모델을 바꿨는데 효과가 없다 | `/setup-pstack` 규칙은 새 채팅에 적용된다. 새 채팅을 연다 |
| 비용이 예상보다 크다 | 설치 절의 비용 안내를 본다 |
| 스킬이 저절로 켜지지 않았다 | 사용자 말로 켜지는 스킬은 `/setup-pstack`뿐이다. 나머지는 입력하거나 `/poteto-mode`가 실행할 때 켜진다 |
| 병렬 에이전트가 서로 덮어썼다 | 에이전트마다 워크트리를 주거나 클라우드 에이전트로 돌린다 |
| 밤새 돌았는데 끝난 게 없다 | `/loop`에는 시간이 아니라 통과·실패가 갈리는 확인 조건이 필요하다 |
| 빌드가 초록이라 성공이라고 한다 | 실제 명령, 흐름, 저장된 값, 프로파일을 요구한다. prove-it-works 원칙이다 |

## 사용자에게 건넬 프롬프트는 어떻게 만드나 {#prompts}

프롬프트를 함께 다듬을 때는 `references/prompting.md`를 먼저 읽는다.[](source:start) 이 문서의 기준은 "의도와 끝 판단 기준만 쓰고 단계는 플레이북에 맡긴다"이다.[](source:prompting)

| 구분 | 내용 |
| --- | --- |
| 넣을 것 | 목표, 통과·실패가 갈리는 확인 조건("더 좋게"나 시간은 조건이 아니다), 보여 줄 증거, 이미 아는 것, 실제 제약("repro first" 등)[](source:prompting) |
| 뺄 것 | 방법, 스킬·단계 목록(하나를 바꿀 때만 이름을 쓴다), 에이전트가 문제를 다시 말하기 전의 원인 추측[](source:prompting) |
| 맥락 먼저 | 시끄러운 보고는 먼저 쉬운 말로 다시 말하게 한다. 새 채팅이면 `/recall`, 낯선 코드면 `/how`와 `/why`, 선택의 근거는 `/teach`[](source:prompting) |
| 설계 먼저 | 첫 설계를 받지 않고 여러 시안을 만든다. 추상적 계획은 적대적으로 리뷰하지 않는다. 계획은 설계가 정해진 뒤에 받는다[](source:prompting) |
| 자리 비우기 전 | "im going to bed"라고 말하고, 매번 돌릴 수 있는 완료 조건을 `/loop`에 준다. 새 워크트리, 미리 답한 질문, 결정 기록, 막혔을 때의 출구를 적는다[](source:prompting) |
| 한 줄로 조종 | 목표를 다시 말하거나 원칙 이름을 댄다. 에이전트가 이미 그 원칙을 읽었기 때문에 통한다[](source:prompting) |

예시 프롬프트는 `references/recipes.md`에 다섯 갈래 29개가 있다. 이해 6개, 만들기 6개, 설계와 계획 6개, 리뷰와 출시 5개, 자리 비웠다 돌아오기 6개다.[](source:recipes) 답변에는 이 중 맞는 것 하나를 고쳐 쓰고 파일 링크를 붙인다.[](source:reply)

## 흐름 속 위치 {#position}

@workflow id=help-position title="poteto-help 앞뒤의 스킬"
| user | 사용자 질문 | external |
| help | poteto-help | backend |
| mode | poteto-mode | backend |
| other | 안내만 한 스킬 | backend |
| user > help | /poteto-help | |
| help > mode | 일 요청 | emphasis |
| help > other | 추천 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| 사용자의 pstack 질문 | 일 요청이면 `poteto-mode` 아래에서 작업. 도움 질문이면 프롬프트만 | 도움 질문이면 일을 시작하지 않는다 | r20 |
| 설치 질문 | `/setup-pstack` 안내 | 규칙 파일이 없으면 모든 역할이 기본 모델 | r21 |
| 상황별 질문 | 형제 스킬 추천과 예시 프롬프트 | 추천 전에 그 스킬을 읽는다 | r22 |
| 테스트 먼저 고치기 질문 | `/tdd` 안내 | `pstack/tdd/` 폴더가 없다(불명) | r23 |
| 증명 방법 질문 | `/create-verification-skill` 언급 | `verify-*` 스킬이 없을 때만 | r24 |
| pstack 밖 명령 질문 | "`pstack`에 없음" 안내 | - | r25 |

`poteto-help`는 안내 역할이다. 추천한 스킬을 직접 실행하지 않는다(판정: 일 요청일 때의 `poteto-mode`만 예외다).[](source:purpose)[](source:work-msg) 전체 흐름은 `pstack/_group-run/run.html`에 있다. 관계 근거는 `pstack/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `references/prompting.md`, `references/recipes.md`. 세 파일 모두 원본이다.
- 대조용으로 읽은 줄: `setup-pstack`과 `poteto-mode`의 frontmatter.
- 제외한 파일: `SKILL.KO.md`, `references/*.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다.
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
원문이 가리키는 `README.md`와 안내 페이지 7개(`docs/guide/01-setup.md` 등)는 이 저장소에 없다. 설치된 플러그인 기준 경로라서 범위 밖으로 두었다.
표의 `[/tdd](../tdd/SKILL.md)`는 이 저장소에서 가리키는 파일이 없다. 원본 플러그인에 있는지는 확인하지 않았다.
"도움 질문"과 "일 요청"의 경계는 예시 하나로만 주어진다. 섞인 메시지를 어떻게 처리할지는 원문에 명시 없음.
