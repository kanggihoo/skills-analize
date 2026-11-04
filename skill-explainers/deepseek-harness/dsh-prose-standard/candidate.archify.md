# dsh-prose-standard 스킬은 에이전트를 어떻게 바꾸나 {#prose-standard-skill}

`dsh-prose-standard`를 쓰면 에이전트는 글을 줄이기 전에, 그 글이 담은 명제를 모두 찾는다. 명제는 하나도 잃지 않고, 추론 기록·반복·장식만 지운다. 이 스킬은 줄이기 전용이 아니다. 코드와 타입이 드러내지 못하는 계약이 글에서 빠져 있으면, 에이전트는 글을 더하거나 되살린다.[](source:ps-intro)[](source:ps-coverage)

- 명시한 `scope`가 없으면 에이전트는 필요한 입력을 보고하고 멈춘다. 저장소 전체로 넓히지도, 인터뷰를 시작하지도 않는다.[](source:ps-inputs)
- 리뷰와 감사에서 에이전트는 지적만 보고한다. 글을 고치는 것은 쓰기·수정·정리를 명시적으로 요청했을 때뿐이다.[](source:ps-mode)
- `vendor/`와 `.agents/notes/archived/`는 어떤 범위를 받아도 읽기·수정 대상에서 뺀다.[](source:ps-exclude)
- 줄인 글의 단어 수가 적다는 이유만으로는 개선이 아니다. 모든 사실 절이 살아 있고 더 명확해야 개선이다.[](source:ps-propositions)

@answer scope="deepseek-harness/dsh-prose-standard · 원본 텍스트 2개 · 커밋 475505c · 범위 밖 링크 미확인(부분 분석) · 지시상 동작"
@meta locale=ko
@source ps-fm title="deepseek-harness/dsh-prose-standard/SKILL.md · 9899B · frontmatter" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=1:4
@source ps-intro title="SKILL.md · 목적과 책임 나눔" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=8:12
@source ps-inputs title="SKILL.md · scope 입력" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=16:16
@source ps-mode title="SKILL.md · mode 입력과 쓰기 권한" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=18:20
@source ps-exclude title="SKILL.md · 제외 대상" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=22:24
@source ps-derived title="SKILL.md · 파생 산출물과 이중 언어 쌍" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=26:26
@source ps-propositions title="SKILL.md · 명제 보존" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=28:42
@source ps-coverage title="SKILL.md · 위치별 필수 내용" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=44:61
@source ps-ui title="SKILL.md · 보이는 문자열(영어 UI 문구 규칙 포함)" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=58:58
@source ps-workflow title="SKILL.md · Workflow" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=63:71
@source ps-border title="SKILL.md · 판단이 갈리는 경우" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=73:81
@source ex-head title="deepseek-harness/dsh-prose-standard/references/examples.md · 9457B · 예시 모음" path=deepseek-harness/dsh-prose-standard/references/examples.md lines=1:13
@source ex-scope title="examples.md · 명시적 스킬 범위" path=deepseek-harness/dsh-prose-standard/references/examples.md lines=15:23
@source ex-transcript title="examples.md · 추론 기록은 통째로 지운다" path=deepseek-harness/dsh-prose-standard/references/examples.md lines=115:121
@source ex-words title="examples.md · 단어 수만으로 줄이지 않는다" path=deepseek-harness/dsh-prose-standard/references/examples.md lines=131:137
@source ex-visible title="examples.md · 모델이 보는 문장" path=deepseek-harness/dsh-prose-standard/references/examples.md lines=139:149
@source ex-generated title="examples.md · 생성 요약은 홀로 서야 한다" path=deepseek-harness/dsh-prose-standard/references/examples.md lines=151:159
@source cr-r01 title="deepseek-harness/dsh-code-review/SKILL.md · r01 확인용" path=deepseek-harness/dsh-code-review/SKILL.md lines=33:33
@source doc-r11 title="deepseek-harness/dsh-doc/SKILL.md · r11 확인용" path=deepseek-harness/dsh-doc/SKILL.md lines=115:115
@source ug-r15 title="deepseek-harness/dsh-create-upgrade-guide/SKILL.md · r15 확인용" path=deepseek-harness/dsh-create-upgrade-guide/SKILL.md lines=46:46
@source tr-r18 title="deepseek-harness/dsh-translate-docs/SKILL.md · r18 확인용" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=46:46
@source fs-r37 title="deepseek-harness/dsh-find-simplifications/SKILL.md · r37 확인용" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=57:57
@source ui-r30 title="deepseek-harness/dsh-client-ui-ux/SKILL.md · r30 확인용" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=8:8

## 언제 켜지고 무엇을 입력받나 {#trigger}

@code source=ps-fm language=yaml

이 스킬에는 호출 제한 필드가 없어서, 모델이 `description`을 참고해 스킬을 켤 수 있다.[](source:ps-fm) 판정: `description`은 판단용 설명이지, 특정 단어가 있으면 켜지는 목록이 아니다. 이 스킬의 대상은 deepseek-harness 저장소의 글이다. 다른 저장소에서 쓰는 경우는 원문에 명시 없음.

| 입력 | 규칙 |
| --- | --- |
| `scope` | 명시해야 한다. 없으면 에이전트는 필요한 입력을 보고하고 멈춘다. 저장소 전체로 추정하지 않는다[](source:ps-inputs) {bad:누락 시 중단} |
| `mode` | `automatic`(기본) 또는 `interactive`. 사용자가 질문이나 보정을 명시적으로 요청할 때만 `interactive`로 들어간다[](source:ps-mode) |
| 쓰기 권한 | `mode`는 질문 여부만 정한다. 리뷰·감사는 고치지 않고 보고한다. 명시적 쓰기·수정·정리 요청이 있으면 분명한 변경을 적용한다[](source:ps-mode) |

@callout level=warning title="두 경로는 어떤 범위에서도 건드리지 않는다"
`vendor/`는 범위가 저장소 전체여도 찾기·리뷰·수정에서 뺀다. 심볼릭 링크로 들어가지도 않는다. 제외는 포함 glob 뒤에 둔다. 그래야 뒤에 오는 포함이 제외한 경로를 되살리지 못한다. 예: ripgrep에는 `--glob '!vendor/**'`, Git에는 `:(exclude)vendor/**`를 쓴다. 범위가 `vendor/`뿐이면 대상 파일이 없다고 보고한다.[](source:ps-exclude)
`.agents/notes/archived/`도 글 리뷰와 수정에서 뺀다. 보관된 Agent Note 문서는 얼려 둔 기록이라서, 과거 문서가 인용한 정확한 대상을 이해하려고 읽는 것만 허용한다. 글이나 나가는 링크를 현대화하는 일은 하지 않는다.[](source:ps-exclude)

파생물과 이중 언어 쌍은 이렇게 다룬다.

- 생성 카탈로그, 스냅숏, 픽스처는 파생물이다. 에이전트는 소비하는 곳을 모두 따라간 뒤, 소유 원본이나 시나리오를 먼저 고치고 파생물을 다시 만든다.[](source:ps-derived)
- 이중 언어 쌍에는 영구 소유자가 없다. 그래서 어느 쪽이든 그 갱신의 원본이 될 수 있다.[](source:ps-derived)
- 이 경우 가벼운 경로(`docs/AGENTS.md`)를 따라 반대쪽을 최소로 고치고, 쌍을 다시 기록한다. 그 문서는 이 저장소에 없다(범위 밖).[](source:ps-derived)

## 무엇을 지키고, 어디에 무엇을 더하나 {#rules}

계약은 호출자·피호출자·구현자·생산자·소비자가 기대는 의무, 불변식, 사전·사후 조건, 호환 약속이다.[](source:ps-intro) 에이전트는 편집 전에 글의 명제를 모두 찾아 아래를 보존한다.[](source:ps-propositions)

| 보존할 것 | 예 |
| --- | --- |
| 행위자와 행동 | 누가 무엇을 하나 |
| 조건·시점·순서 | 언제, 무엇보다 먼저 |
| 양태 | `must`, `may`, `never` |
| 부정 보장과 예외 | 하지 않는 것, 예외 |
| 소유·부작용·실패 방식·결과 | 누가 책임지고 실패하면 어떻게 되나 |

- 호출 지점에는 완전한 로컬 계약(동작, 실패, 소유, 결과)을 남긴다. 구조·근거·알고리즘·이력·긴 예시는 소유 문서로 적극 링크한다. 설명 하나는 한 곳에 두되, 핵심 계약 사실은 지역에서 되풀이해도 된다.[](source:ps-propositions)
- 근거를 빼면 오용이나 잘못된 단순화가 생길 수 있을 때는 그 근거를 남긴다. 아니면 결과만 쓰고 근거 문서를 링크한다.[](source:ps-propositions)
- `contract`, `boundary`, `shape`, `surface`, `seam`, `gate`, `vocabulary`는 금지어가 아니라 쓰기 전에 점검할 단어다. 정확한 규칙·API·필드·타입·검증·시점·실패 상태로 바꿔 말할 수 있으면 바꾸고, 정확한 기술 대상을 가리키면 그대로 둔다.[](source:ps-intro)

위치마다 필요한 내용이 다르다. 코드·타입·구조가 이미 드러내는 사실이면 주석을 더하지 않는다.[](source:ps-coverage)

| 위치 | 반드시 담을 것 | 지울 것 |
| --- | --- | --- |
| 공개 JSDoc | 반환 구분, throw·reject, 부작용, 소유, 시점, 취소, 내구성 | - |
| 내부 주석 | 불변식, 경합 순서, 소유, 보안 경계, 놀라운 실패 | 제어 흐름 서술, 코드 되풀이 |
| 모듈 주석 | 역할, 의존, 책임, 자명하지 않은 구조 선택 | - |
| 테스트 | 픽스처·단언·플랫폼 보정·실제 진입 경로가 왜 필요한지 | 진행 서술, 목록 |
| 쿡북 | 전제, 필요한 동작, 실제 진입 경로, 관찰 가능한 검증, 짧은 경고 | - |
| README | 소비자 계약: 설정, 의미, 실패, 한계, 확장점, 모델에 보이는 효과 | 일반 정리 목록 |
| `Agent Note` 문서 | 고유 근거, 메커니즘, 대안, 결과, 출고 검증 근거, 이름 붙은 미검증 구멍 | 계획 체크리스트 |
| 사후 분석 | 사건 순서, 근거, 인과, 영향, 재발 방지 | 반복 설득, 인과와 무관한 구현 |
| 스킬·에이전트 지시 | 행동 안전장치와 범위 한계("가이드이지 스크립트가 아님") | - |
| 예시·설정 주석 | 접근 한계, 로드 순서, 보안 입장, 재생 동작, 예외, 오용 | 설정이 이미 보여 주는 항목 |
| 프롬프트·보이는 문자열 | 표현은 곧 동작이다. 소유하는 실행 스냅숏을 갱신한다 | - |
| 진단 메시지 | 실패한 대상이나 경로, 위반 규칙, 자명하지 않은 수정 방법 | 내부 실행 서술 |

검색에 쓰는 메커니즘 이름과 의미 있는 양태·시점·부정 강조는 남기고, 장식용 강조만 정리한다.[](source:ps-coverage)

@callout level=warning title="보이는 문자열은 글만 고치는 작업이 아니다"
UI 문구는 타입이 있는 로케일 사전에 둔다. 에이전트는 문구·접근성 이름·툴팁·플레이스홀더·형식 틀을 함께 보고 `verify-client-ui-i18n`을 돌린다. 영어 UI 문구와 플러그인 `meta.title`·`meta.description`은 첫 단어, 고유명사, 제품 이름만 대문자로 쓴다(`Git worktrees`이고, `Git Worktrees`가 아니다). 중국어 문구는 자기 관례를 따른다.[](source:ps-ui) 소유하는 실행 스냅숏이 없으면, 문구를 바꾸지 않고 보류를 보고한다. 글만 고치는 편집에 슬쩍 끼워 넣지 않는다.[](source:ps-ui)

## 사례로 보는 판단: 줄이기는 어디서 멈추나 {#examples}

예시 모음은 문장 틀이 아니라 지배 원칙을 알아보게 하려는 것이다. 균형은 "그 자리에서 필요한 만큼의 설명으로 모든 명제를 지킨 것"이다.[](source:ex-head) 아래는 원문의 영어 예시를 한국어로 옮긴 요약이다. 원문 예시는 `references/examples.md`에 17개 항목으로 있다.

| 항목 | 과하게 줄임 | 균형 | 지나치게 자세함 |
| --- | --- | --- | --- |
| 모든 사실 절 보존[](source:ex-head) | "조정자가 영속화를 직렬화한다" | 세션별 쓰기 직렬화, 폐기가 끝나기 전 버퍼 비우기, 백엔드 실패를 호출자에게 보고하기를 모두 쓴다 | - |
| 스킬 범위 명시[](source:ex-scope) | "원문을 읽고 판단하라" | "이 스킬은 완전한 체크리스트가 아니라 가이드다. 이름 붙은 점검 밖에서는 판단하되 문서화된 요구는 여전히 적용된다" | 목록이 독립 추론을 대체하지 못하는 이유를 여러 단락으로 변호 |
| 단어 수만으로 줄이지 않기[](source:ex-words) | "어댑터가 오류를 정규화한다" | 인증·속도 제한·일시 오류를 호출자가 똑같이 다루게 한다는 결과를 유지한다 | - |

- 추론 기록은 더 짧은 서술로 압축하지 않고 지운다. 분기가 코드에 이미 드러나면 주석을 달지 않는다. 이른 반환이 자명하지 않은 불변식을 지킬 때만 그 불변식을 쓴다.[](source:ex-transcript)
- 생성기가 첫 문장만 뽑아 카탈로그에 싣는다면, 그 문장이 그 자리에서 필요한 계약을 혼자 담아야 한다.[](source:ex-generated)
- 글만 고치는 감사에서 모델에 보이는 문구를 바꾸려는데 소유하는 실행 스냅숏이 없으면, 바꾸지 말고 보류를 보고하거나 소유 시나리오와 GUI 근거까지 범위를 넓힌다.[](source:ex-visible)

판정: 이 스킬의 핵심 규칙은 "줄이기"가 아니라 "명제 보존"이고, 단어 수는 판단 기준이 아니다. 근거는 위 세 항목과 명제 목록이다.[](source:ps-propositions)[](source:ex-words)

## 어떤 순서로 일하고 판단이 갈리면 어떻게 하나 {#workflow}

@workflow id=prose-flow title="글 점검 7단계"
| lane prep | 준비 |
| lane work | 판단과 수정 |
| lane check | 검증과 보고 |
| confirm | 범위·mode 확인 | external | prep |
| read | 기준과 원본 읽기 | backend | prep |
| inspect | 범위 검사 | backend | work |
| classify | 후보 분류 | backend | work |
| owner | 소유자 먼저 갱신 | backend | work |
| verify | 검사 실행 | backend | check |
| report | 보고 | backend | check |
| confirm > read | |
| read > inspect | |
| inspect > classify | |
| classify > owner | 수정 허용 시 | emphasis |
| owner > verify | |
| verify > report | |

@steps id=prose-steps
| confirm | 범위·mode 확인 | 에이전트가 범위, mode, 현재 branch나 PR 기준, 적용되는 `AGENTS.md`를 확인한다. 관련 없는 branch는 보지 않는다.[](source:ps-workflow) | prose-flow | confirm |
| read | 기준과 원본 읽기 | 에이전트가 판단하기 전에 문서 표준(`docs/AGENTS.md`)과 소유하는 코드·문서를 읽는다. 낯선 사례는 예시 모음을 본다. 문서 표준은 이 저장소에 없다(범위 밖).[](source:ps-workflow) | prose-flow | read |
| inspect | 범위 검사 | 에이전트는 큰 파일만이 아니라 요청 범위 전체를 본다. 검색과 단어 수로 후보를 찾고, 의미로 판단한다.[](source:ps-workflow) | prose-flow | inspect |
| classify | 후보 분류 | 에이전트가 후보를 keep, add, trim, restore, restructure, defer 중 하나로 정한다. 삭제 목표를 채우려고 수정을 만들지 않는다.[](source:ps-workflow) | prose-flow | classify |
| owner | 소유자 먼저 갱신 | 에이전트가 파생물보다 소유 원본을 먼저 고친다. 새 규칙을 배우면 비슷한 구절을 다시 확인한다.[](source:ps-workflow) | prose-flow | owner |
| verify | 검사 실행 | 에이전트가 좁은 관련 검사, 문서 통과 조건, `git diff --check`, 보이는 문자열의 동작 테스트를 돌린다. 최종 diff에 `vendor/` 경로가 없는지 확인한다. `vendor/` 경로가 우연히 들어 있으면 깨끗했다고 말하지 말고 보고한다.[](source:ps-workflow) | prose-flow | verify |
| report | 보고 | 에이전트가 점검한 범위, 분명한 변경, 일부러 남긴 것, 보류한 사례, 실제로 돌린 검사를 보고한다.[](source:ps-workflow) | prose-flow | report |

판단이 갈리는 경우는 두 버전 이상이 완전 명제 규칙을 만족하면서, 이미 받아들인 원칙끼리 맞바꿀 때뿐이다. 명제를 지키는 답이 하나뿐인 다시 쓰기는 해당하지 않는다.[](source:ps-border)

| mode | 판단이 갈릴 때 |
| --- | --- |
| `automatic` | 허락된 분명한 수정만 적용하고, 갈리는 사례는 질문 없이 보고한다. 진행하려고 명제를 약하게 만들지 않는다[](source:ps-border) |
| `interactive` | 비슷한 구절을 지배 원칙별로 묶고, 그럴듯한 버전 둘이나 셋을 보여 준다. 하나를 추천하고 사실·구조 차이를 밝힌다. 열등한 보기는 끼우지 않는다. PR 인라인 댓글로 보정할 때는 추천안을 diff에 임시로 넣고, 대안은 그 줄에 단다[](source:ps-border) |

@callout level=note title="사용자가 정한 뒤에는 스킬 자신의 예시 파일이 바뀐다"
사용자가 결정하면 에이전트는 원칙과 버전을 `references/examples.md`에 정리하고 범위 안의 비슷한 구절 전부에 적용한다. PR 이력과 리뷰어 서술은 넣지 않는다.[](source:ps-border) 이 파일은 스킬 자신의 일부다. 이 쓰기는 지시상 동작이며 이 분석에서는 실행하지 않았다.

## 흐름 속 위치 {#position}

@workflow id=prose-position title="dsh-prose-standard 앞뒤의 스킬"
| review | dsh-code-review | backend |
| doc | dsh-doc | backend |
| prose | dsh-prose-standard | backend |
| trim | dsh-trim-cot-leakage | backend |
| review > prose | 리뷰 지적 | emphasis |
| doc > prose | 문장 판단 | emphasis |
| prose > trim | 참고 | dashed |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `dsh-code-review` | 추가·변경된 Markdown 단락, JSDoc, 주석, 프롬프트, description, 진단 메시지, 보이는 문자열 | 리뷰 지적 | 의무형 "Use". 자동 검사는 이 점을 확인하지 못한다고 적는다[](source:cr-r01) | r01 |
| `dsh-doc` | 문장 단위 계약 범위와 편집 판단 요청 | - | 배치·예산·이중 언어 쌍·문서 통과 조건은 `dsh-doc`이 맡고 이 스킬은 판단을 맡는다[](source:ps-intro)[](source:doc-r11) | r09, r11 |
| `dsh-trim-cot-leakage` | - | - | 추론 흔적을 찾고 고치는 일에는 그 스킬을 쓰라는 참고다[](source:ps-intro) | r10 |
| `dsh-create-upgrade-guide` | 가이드 쓰기 | - | 가이드를 쓸 때 따른다("Follow")[](source:ug-r15) | r15 |
| `dsh-translate-docs` | 번역 양쪽 | - | 원문 명제를 더하거나 빼지 않고 양쪽에 적용한다[](source:tr-r18) | r18 |
| `dsh-find-simplifications` | 글이 범위에 든 경우의 단순화 | - | 코드를 되풀이하는 설명은 지우되 동작·시점·소유·실패 의무는 남긴다[](source:fs-r37) | r37 |
| `dsh-client-ui-ux` | UI 문구 품질 | - | 참고. UI 문구 품질 자체는 이 스킬을 따른다[](source:ui-r30) | r30 |

그림에서는 `dsh-doc`이 이 스킬에 거는 위임(r11)만 실선으로 그렸다. 반대 방향의 참고(r09)와 r15, r18, r30, r37, 폴더 공유(r42)는 표에만 있고 그림에서 생략했다. 전체 흐름은 `deepseek-harness/_group-docs/docs.html`과 `deepseek-harness/_group-review/review.html`에 있다. 관계 근거는 `deepseek-harness/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `references/examples.md`. 둘 다 원본이다. 관계 확인을 위해 `dsh-code-review`, `dsh-doc`, `dsh-create-upgrade-guide`, `dsh-translate-docs`, `dsh-find-simplifications`, `dsh-client-ui-ux`의 해당 줄을 읽었다.
- 제외한 파일: 이 폴더에는 번역본이 없다. 다른 폴더의 `reporting-skills/deepseek-harness/dsh-prose-standard/`에 있는 `*.KO.md`는 번역본이라 열지 않았다.
- 원문 비교: `reporting-skills/deepseek-harness/dsh-prose-standard/`에 이름이 같은 복사본이 있고 `SKILL.md`가 다르다(동명·내용 다름). `references/examples.md`는 두 폴더가 같다. 이 페이지는 `deepseek-harness` 쪽을 분석했다. 차이는 한 군데다. `deepseek-harness` 쪽에는 영어 UI 문구와 `meta.title`·`meta.description`의 첫 단어만 대문자로 쓰는 규칙과 중국어 관례 문장이 더 있고, 복사본에는 없다.[](source:ps-ui) 두 판본의 선후는 원문에 명시 없음.
- 관계 확인: r01, r11, r15, r18, r30, r37의 출처 줄을 원문과 대조했고 원장과 같다. r09, r10은 `SKILL.md` 8행에서, r42는 24행에서 확인했다.
- 범위 밖: `docs/AGENTS.md`, `docs/cookbook/adding-a-package.md` 같은 `../../../docs/...` 링크는 원래 저장소의 파일이다. 이 저장소에 없어서 읽지 않았다. 워크플로 2단계가 읽으라는 문서 표준과 README 요건의 세부는 확인하지 못했다.
- 실행하지 않았다. 페이지의 동작은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`docs/AGENTS.md`가 정하는 글쓰기 규칙(가벼운 경로, 예산 등)은 범위 밖이라 이 스킬이 그 규칙과 어떻게 맞물리는지 확인하지 못했다. 이 스킬을 다른 저장소에서 쓸 때의 동작도 원문에 명시 없음.
