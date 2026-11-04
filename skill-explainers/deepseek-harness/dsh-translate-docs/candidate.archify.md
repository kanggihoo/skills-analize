# dsh-translate-docs 스킬은 에이전트를 어떻게 바꾸나 {#translate-docs-skill}

`dsh-translate-docs`는 사용자가 이름으로 직접 부를 때만 도는 수동 전용 스킬이다. 일반 문서 작업, 다른 스킬의 호출, 번역이 필요해 보인다는 추론으로는 켜지 않는다.[](source:td-boundary)[](source:td-fm) 이 스킬이 켜지면, 에이전트는 영어·중국어 문서 짝(`foo.md`와 `foo.zh.md`)을 변경 종류에 따라 다른 경로로 맞춘다.

- 짝의 한쪽만 고쳤으면, 변경 브리핑을 만들고 반대쪽을 최소로 고친다. 문서 전체를 다시 번역하지 않는다.[](source:td-triage)
- 반대쪽이 아직 없는 새 짝이면, 오케스트레이션하는 에이전트가 직접 번역하지 않는다. 서브에이전트를 띄워서 전체 문서를 번역시킨다.[](source:td-whole)
- 문서를 삭제하거나 이름을 바꿨으면, 반대쪽 문서와 `foo.i18n.yaml`도 같이 지우거나 바꾼다. 그러지 않으면 통과 조건이 그 짝을 불완전한 짝으로 보고한다.[](source:td-triage)
- 번역을 마치면 짝을 `--write`로 다시 기록하고 범위를 좁혀 검증한다. 전체 문서 검사는 PR 단위로 한 번만 돌린다.[](source:td-update-step5)[](source:td-finish)

@answer scope="deepseek-harness/dsh-translate-docs · 원본 텍스트 1개 · 커밋 475505c · 범위 밖 링크 미확인(부분 분석) · 지시상 동작"
@meta locale=ko
@source td-fm title="deepseek-harness/dsh-translate-docs/SKILL.md · 10604B · frontmatter" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=1:6
@source td-boundary title="SKILL.md · Invocation boundary" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=10:12
@source td-what title="SKILL.md · What this skill is" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=14:16
@source td-triage title="SKILL.md · 변경 종류별 분류" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=18:24
@source td-update-intro title="SKILL.md · 수정 경로 도입" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=26:28
@source td-update-step1 title="SKILL.md · 수정 1단계 브리핑 생성" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=30:30
@source td-update-step2 title="SKILL.md · 수정 2단계 --apply" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=31:31
@source td-update-step3 title="SKILL.md · 수정 3단계 서브에이전트 위임" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=32:32
@source td-update-step4 title="SKILL.md · 수정 4단계 최소 편집" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=33:33
@source td-update-step5 title="SKILL.md · 수정 5단계 기록과 검증" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=34:34
@source td-whole title="SKILL.md · 새 짝의 전체 번역 경로" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=36:38
@source td-truth title="SKILL.md · 진실의 원천" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=40:46
@source td-translate title="SKILL.md · Translate" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=48:56
@source td-find title="SKILL.md · 할 일 찾기" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=58:62
@source td-finish title="SKILL.md · 짝 마무리" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=64:69
@source td-review title="SKILL.md · 번역 리뷰 응답" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=72:74
@source cr-r07 title="deepseek-harness/dsh-code-review/SKILL.md · r07 확인용" path=deepseek-harness/dsh-code-review/SKILL.md lines=29:29
@source cr-58 title="deepseek-harness/dsh-code-review/SKILL.md · 이중 언어 리뷰 항목" path=deepseek-harness/dsh-code-review/SKILL.md lines=58:58
@source doc-r43 title="deepseek-harness/dsh-doc/SKILL.md · r43 확인용" path=deepseek-harness/dsh-doc/SKILL.md lines=47:47

## 언제 켜지나: 이름으로 부를 때만 {#trigger}

@code source=td-fm language=yaml

@callout level=warning title="활성화 제한: 사용자가 이름으로 부를 때만 돈다"
`disable-model-invocation: true`라서, 모델이 스스로 이 스킬을 켜지 않는다. `user-invocable: true`라서, 사용자는 이 스킬을 부를 수 있다.[](source:td-fm) 원문 본문도 같은 말을 한다. 사용자가 `dsh-translate-docs`를 이름으로 명시해 부를 때만 돌린다. 일반 문서 작업, 다른 스킬 안, 추론한 번역 필요에서는 이 스킬을 고르지도 불러오지도 않는다.[](source:td-boundary) 사용자가 이 스킬을 부르는 구체적 입력 형식(슬래시 등)은 원문에 명시 없음.

| 상황 | 이 스킬을 켜나 | 대신 |
| --- | --- | --- |
| 사용자가 `dsh-translate-docs`를 이름으로 부름 | 켠다 {good:켬} | - |
| 일반 문서 작업 중 번역이 필요함 | 켜지 않는다 {bad:금지} | 일상 번역은 `docs/AGENTS.md`의 한 번에 끝내는 규칙을 따른다[](source:td-boundary). 그 문서는 범위 밖 |
| 다른 스킬이 번역을 시킴 | 켜지 않는다 {bad:금지} | 원문이 "다른 스킬에서" 고르거나 불러오는 것을 막는다[](source:td-boundary) |
| 에이전트가 번역이 필요하다고 추론함 | 켜지 않는다 {bad:금지} | 추론한 필요로는 고르지 않는다[](source:td-boundary) |
| 코드 리뷰 중 이중 언어 변경을 만남 | 켜지 않는다 {bad:금지} | `dsh-code-review`도 확장 번역 스킬은 자동 리뷰 밖이라고 적는다[](source:cr-r07) |

판정: 이 스킬은 모델 호출형이 아니라 사용자 호출형이다. 근거는 `disable-model-invocation: true`와 본문의 "이름으로 명시" 문장이다.[](source:td-fm)[](source:td-boundary)

이 스킬은 번역 메모리가 아니라 가이드다. 영어와 중국어는 같은 권위를 갖고, 한쪽에서 고치면 그쪽이 그 갱신의 원본이다. 번역가는 에이전트이고, 규칙은 성립해야 할 것만 말하며 표현은 에이전트가 판단한다. 용어는 에이전트가 판단할 대상이 아니다.[](source:td-what)

## 변경 종류에 따라 어떤 길로 가나 {#triage}

@workflow id=translate-flow title="변경 종류별 번역 경로"
| lane triage | 분류 |
| lane work | 번역 |
| lane finish | 기록 |
| call | 이름으로 호출 | external | triage |
| kind | 변경 종류? | backend | triage |
| brief | 변경 브리핑 | backend | work |
| mech | 코드 울타리만? | backend | work |
| apply | 자동 반영 | backend | work |
| delegate | 서브에이전트 번역 | backend | work |
| whole | 전체 번역 | backend | work |
| rename | 짝·yaml 정리 | backend | work |
| record | sidecar 기록·검증 | backend | finish |
| call > kind | |
| kind > brief | 수정 |
| kind > whole | 새 짝 |
| kind > rename | 삭제·이름 변경 |
| brief > mech | |
| mech > apply | 예 |
| mech > delegate | 아니오 |
| apply > record | |
| delegate > record | |
| whole > record | |

@steps id=translate-steps
| call | 이름으로 호출 | 사용자가 `dsh-translate-docs`를 이름으로 부른 경우에만 시작한다.[](source:td-boundary) | translate-flow | call |
| kind | 변경 종류? | 짝이 있고 한쪽을 고쳤으면 수정 경로로, 반대쪽이 아직 없으면 새 짝 경로로, 문서를 지우거나 이름을 바꿨으면 정리 경로로 간다. 이 분류가 나머지 단계를 정한다고 원문이 적는다.[](source:td-triage) | translate-flow | kind |
| brief | 변경 브리핑 | `pnpm run gen-translation-brief <짝의 아무 파일>`을 실행한다. 인자 없이 실행하면 동기화가 깨진 짝 전부의 브리핑이 나온다. 브리핑은 변경을 가장 좁게 정렬되는 단위(문단, 표 행, 목록 항목, 제목)로 짚고, 정렬이 안 되면 제목 절로, 그래도 안 되면 문서 전체로 짚는다.[](source:td-update-step1) | translate-flow | brief |
| mech | 코드 울타리만? | 변경이 양쪽에서 바이트까지 같은 코드 울타리 안에만 있으면, 브리핑이 그렇다고 알린다.[](source:td-update-step2) | translate-flow | mech |
| apply | 자동 반영 | `pnpm run gen-translation-brief --apply <짝>`이 고친 울타리를 반대쪽에 끼워 넣고, 구조를 검증한 뒤 파일에 쓴다. 이 경로에는 서브에이전트도 손 편집도 없다.[](source:td-update-step2) | translate-flow | apply |
| delegate | 서브에이전트 번역 | 브리핑을 서브에이전트에 넘겨 번역시킨다. 서브에이전트는 지침 모음을 다시 읽지 않는다. 브리핑이 답하지 못하는 결정(규칙 없는 용어, `BOTH sides changed`이거나 단위·절이 안 맞는 전체 브리핑)이 나올 때만 진실의 원천으로 올라간다.[](source:td-update-step3) | translate-flow | delegate |
| whole | 전체 번역 | 번역을 처음부터 써야 하면, 오케스트레이션 에이전트는 직접 번역하지 않고 서브에이전트를 띄운다. 번역가는 진실의 원천을 먼저 읽고, 문서를 통째로(길면 절별로) 번역하며, 구조를 원문에 맞춰 잠근다.[](source:td-whole) | translate-flow | whole |
| rename | 짝·yaml 정리 | 문서를 지우거나 이름을 바꾸면, 반대쪽 문서와 옆의 `.i18n.yaml`도 지우거나 바꾼다. 안 하면 통과 조건이 그 짝을 불완전한 짝으로 보고한다.[](source:td-triage) | translate-flow | rename |
| record | sidecar 기록·검증 | `pnpm run verify-translation-pairing --write <짝>`로 기록하고, 같은 명령에서 `--write`를 빼고 실행해 검증한다. `--write`는 짝 인자 없이 실행하면 거부하고, 일괄 재기록은 명시적으로 `--all`을 줄 때만 한다.[](source:td-update-step5) | translate-flow | record |

원문이 가리키는 `pnpm run ...` 명령은 이 저장소에 없는 스크립트다. 이 분석에서는 실행하지 않았다(지시상 동작).

수정 경로에는 두 가지 제약이 더 있다.

- 수정할 때 문서 전체를 다시 번역하지 않는다. 최소 수정은 바뀌지 않은 부분의 검토된 표현을 지키지만, 다시 번역하면 그 검토를 버리게 되기 때문이다.[](source:td-triage)
- 수정 4단계는 가능한 가장 작은 편집으로 바뀐 부분만 고친 뒤, 원문과 절 단위로 대조한다. 더하거나 뺀 것이 없어야 한다. 용어는 브리핑의 행을 따르고, 코드 스팬은 원문 그대로 둔다.[](source:td-update-step4)

`.agents/notes/archived/`의 얼려 둔 Agent Note 문서는 번역 작업이 아니다. 이 문서는 보관 검증기가 봉인한 세 파일 묶음이라서, 보관한 뒤에는 어느 쪽도 고치거나 다시 기록하거나 복구하지 않는다.[](source:td-triage)

## 번역에서 반드시 성립해야 하는 것 {#rules}

전체 번역 경로의 진실의 원천은 다섯 개다. 번역가는 번역 전에 이것들을 읽는다. 다시 요약하지 않는다.[](source:td-truth)

| 원천 | 내용 | 이 저장소에 있나 |
| --- | --- | --- |
| `docs/i18n/README.md` | 짝 계약: 파일 세 개, 절별 해시, 언어 전환 줄, 범위, 제외[](source:td-truth) | 범위 밖 |
| `docs/i18n/translation-rules.md` | 충실성, 구조 보존, 용어 규율, 타이포그래피(MUST/SHOULD)[](source:td-truth) | 범위 밖 |
| `docs/i18n/terminology.md` | 양방향으로 구속하는 용어표. 번역 전에 불러온다[](source:td-truth) | 범위 밖 |
| `docs/i18n/translation-prompt.md` | 자동 파이프라인의 기계용 틀. 이 스킬을 쓰는 에이전트는 렌더링하지 않는다[](source:td-truth) | 범위 밖 |
| `dsh-prose-standard` | 필수 글 범위와 편집 판단. 양쪽에 적용하되 원문 명제를 더하거나 빼지 않는다[](source:td-truth) | 범위 내 |

번역은 두 번 지나가고, 마지막에 한 번 더 읽는다.[](source:td-translate)

| 단계 | 하는 일 |
| --- | --- |
| 1차: 옮기지 말고 쓴다 | 의미 단위를 읽고 원어민 기술 저자처럼 가장 가까운 문체 표본의 어조로 다시 쓴다. 문장 대 문장 대응을 강요하지 않는다 |
| 2차: 원문과 절 단위 대조 | 더하거나 뺀 것이 없는지, 용어가 표를 따르는지, 코드 스팬이 그대로인지 확인한다. 어색하면 단어를 덧대지 않고 문장을 원어로 다시 쓴다 |
| 번역본만 읽기 | 원문 없이 번역 파일만 읽고, 그때야 보이는 어색함을 고친다 |

- 최종 글만 파일에 쓴다. 초안이나 메모는 쓰지 않는다.[](source:td-translate) {bad:초안 금지}
- 용어표의 모든 용어는 지정한 대로 옮긴다. 중국어 대상이면 중국어 칸과 첫 등장 칸을 쓴다. 표에 없는 용어는 인용할 수 있는 중국어 OSS·벤더 선례가 있어야 하고, 없으면 영어로 두고 「待定术语」로 올린다. 영어 대상이면 영어 칸과 확립된 영어 기술 용어를 쓴다. 애매한 원문 용어는 짧은 설명을 붙여 두고 보류로 올린다. 그 자리에서 번역어를 지어내지 않는다.[](source:td-translate)
- 코드 블록은 주석까지 짝에서 바이트 단위로 같아야 한다. 저장소 상대 문서 링크는 의미상 같은 대상과 질의·조각 접미사를 유지한다. 활성 이중 언어 코퍼스의 대상은 영어 쪽에서 `.md`, 중국어 쪽에서 `.zh.md`를 쓰고, 범위 안의 반대쪽 짝이 없으면 오류다. 코퍼스 밖 대상은 원래 경로를 둔다. 언어 전환 줄만 예외다.[](source:td-translate)

짝 맞춤 통과 조건이 기계로 확인하는 것과 2차에서 에이전트가 따로 직접 확인해야 하는 것은 다르다.[](source:td-translate)

| 통과 조건이 확인한다 | 직접 확인한다 |
| --- | --- |
| 제목 깊이, 코드 울타리, 표 행·열 수, 목록 종류, 순서 목록 시작 번호, 목록 항목 수, 링크 언어, 의미상 대상 | 목록·표 순서, 비표준 목록 번호, 인라인 코드, 강조, 의미, 용어, 어조 |

판정: 통과 조건이 초록이라는 것만으로 번역 품질이 증명되지는 않는다. 근거는 위 두 열이 서로 겹치지 않는다는 점이다.[](source:td-translate) 같은 취지로 `dsh-code-review`도 해시가 초록이어도 번역 품질은 확인되지 않는다고 적는다.[](source:cr-58)

## 짝을 어떻게 마무리하고 리뷰에 응답하나 {#finish}

PR에서 짝 문서를 고쳤다면, 할 일 목록은 diff 자체다. 짝에서 바뀐 쪽마다 반대쪽을 고치고 같은 PR에서 다시 기록해야 하며, 잊으면 통과 조건이 빨개진다.[](source:td-find) 아직 맞지 않은 짝은 `pnpm run verify-translation-pairing --list`로 보고, 그 짝의 브리핑은 `pnpm run gen-translation-brief`(인자 없이)로 본다.[](source:td-find)

| 순서 | 마무리 항목 |
| --- | --- |
| 1 | 언어 전환 줄: 중국어 파일은 H1 바로 뒤 `[English](foo.md) \| 中文`, 영어 파일은 `English \| [中文](foo.zh.md)`. 새 짝이면 둘 다 넣는다. 생성기가 소유한 영어 원본은 생성 결과와 바이트가 같고 전환 줄이 없되, 중국어 쪽은 영어로 되돌아가는 링크를 둔다[](source:td-finish) |
| 2 | 일관성 기록: `--write <짝>`이 절별 해시를 `foo.i18n.yaml`에 다시 기록한다. 두 문서가 같은 말을 한다고 실제로 확인한 뒤에만 실행한다[](source:td-finish) |
| 3 | 일반 문서는 매니페스트 항목이 필요 없다. 정책 문서가 생성·지시·이중 언어 고유 제외를 적은 경우에만 `translation-pairing.manifest.json`을 바꾼다[](source:td-finish) |
| 4 | PR 전: 건드린 짝이 범위를 좁힌 검사에서 초록이어야 한다. `pnpm run doc-sync`는 PR 단위로 한 번만 돌린다(`dsh-pre-push-checks` 기준). 번역 작업마다 돌리지 않는다[](source:td-finish) |
| 5 | PR을 검토하기 쉽게 한다. 새 짝과 최소 수정한 짝을 구분해 적고 「待定术语」를 눈에 띄게 나열한다[](source:td-finish) |

번역 리뷰 의견을 처리할 때는 `dsh-code-review`의 "Reporting findings" 절을 따른다. 의견마다 타당성을 따진다. 용어 의견이면, 용어표가 계약이므로 리뷰어의 번역어 결정을 한 파일에만 반영하지 않고 `terminology.md`에 반영한다.[](source:td-review)

## 흐름 속 위치 {#position}

@workflow id=translate-position title="dsh-translate-docs 앞뒤의 스킬"
| doc | dsh-doc | backend |
| tr | dsh-translate-docs | backend |
| prose | dsh-prose-standard | backend |
| push | dsh-pre-push-checks | backend |
| doc > tr | 같은 계열 | dashed |
| tr > prose | 양쪽에 적용 | emphasis |
| tr > push | PR 단위 | emphasis |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `dsh-prose-standard` | 번역 양쪽 | - | 원문 명제를 더하거나 빼지 않고 양쪽에 적용한다[](source:td-truth) | r18 |
| `dsh-pre-push-checks` | - | - | PR 전에 `pnpm run doc-sync`를 PR 단위로 한 번 돌린다. 번역 작업마다 돌리지 않는다[](source:td-finish) | r25 |
| `dsh-code-review` · 번역 리뷰 | 번역 리뷰 의견 | - | 번역 리뷰 의견을 처리할 때 "Reporting findings" 절을 따른다. 용어 의견은 용어표에 반영한다[](source:td-review) | r19 |
| `dsh-code-review` · 자동 리뷰 경계 | - | - | 코드 리뷰가 이 스킬을 부르지 않는다. 확장 번역 스킬은 자동 리뷰 밖이며 사용자가 명시적으로 부를 때만 돈다[](source:cr-r07)[](source:td-boundary) | r07 |
| `dsh-doc` | - | sidecar 기록 | 일상 번역은 `docs/AGENTS.md`의 한 번에 끝내는 규칙을 따르고, 이 스킬은 이름으로 부를 때만 도는 확장판이다. 이중 언어 쌍을 고칠 때마다 `--write`로 기록한다[](source:td-boundary)[](source:doc-r43) | r46, r43 |

그림에는 r46(점선), r18, r25만 그렸다. 나머지는 표에만 있고 그림에서 생략했다.

- r07: 호출 방향이 반대인 경계다. 리뷰가 이 스킬을 부르지 않는다.
- r19: 리뷰 응답 참고다. 순서 흐름이 아니다.

전체 흐름은 `deepseek-harness/_group-docs/docs.html`에 있다. 관계 근거는 `deepseek-harness/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 하나. 원본이다. 관계 확인을 위해 `dsh-code-review`의 29행과 `dsh-doc`의 47행을 읽었다.
- 제외한 파일: 이 폴더에는 번역본이 없다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 관계 확인: r07, r18, r19, r25, r46의 출처 줄을 원문과 대조했고 원장과 같다. r43은 `dsh-doc` 47행과 이 스킬 34·67행이 `verify-translation-pairing --write` 기록을 가리키는 것을 확인했다. 원장은 이 스킬의 출처를 69행으로 적었는데, 그 줄은 PR 단위 `doc-sync` 이야기다. 기록 지시는 34행과 67행에 있다.
- 범위 밖: `docs/AGENTS.md`, `docs/i18n/README.md`, `translation-rules.md`, `terminology.md`, `translation-prompt.md`, `style-samples.md`, `scripts/translation-pairing.manifest.json`, `../../notes/archived/process/2026-07-26-briefed-minimal-translation-updates.md`는 원래 저장소의 파일이라 읽지 않았다. 번역 규칙, 용어표, 브리핑 형식의 세부는 확인하지 못했다.
- 실행하지 않았다. 번역과 `pnpm run` 명령은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"한 번에 끝내는 규칙"(`docs/AGENTS.md`)의 내용과 "문서 코퍼스"의 범위는 범위 밖이라 확인하지 못했다. 이 스킬을 부르는 구체적 입력 형식도 원문에 명시 없음. 브리핑을 쓰는 방식의 효율 근거(벤치마크)는 범위 밖 Agent Note 문서에 있다고 원문이 적는다.[](source:td-update-intro)
