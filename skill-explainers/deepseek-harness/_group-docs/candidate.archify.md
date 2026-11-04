# 문서·글 묶음(docs)은 어떻게 이어지나 {#docs-group}

이 묶음은 문서와 글을 쓰고 다듬는 스킬 여섯 개다. 정해진 순서로 한 번씩 거치는 흐름이 아니다. `dsh-doc`이 문서 구조와 통과 조건을 맡고, 나머지 스킬이 문장 판단, 추론 흔적, 업그레이드 가이드, 번역, 마지막 검사를 나눠 맡는다.[](source:doc-fm)[](source:ps-split)

- `dsh-doc`은 문장 판단을 `dsh-prose-standard`(r11)에, 추론 흔적 찾기를 `dsh-trim-cot-leakage`(r12)에 맡긴다. 업그레이드 가이드 스킬과 번역 스킬도 문장 규칙은 `dsh-prose-standard`를 따른다(r15, r18).[](source:doc-prose)[](source:doc-slop)[](source:ug-prose)[](source:td-prose)
- 두 스킬이 서로를 가리키는 쌍이 네 개 있다(r09/r11, r12/r17, r13/r14, r10/r16). 양쪽 원문이 각각 상대 스킬을 가리키므로, 두 방향이 모두 사실이다.[](source:ps-split)[](source:doc-prose)[](source:tc-fix)
- 다른 스킬은 `dsh-translate-docs`를 부를 수 없다. 이 스킬은 사용자가 이름으로 부를 때만 도는 수동 전용 변형이다(r07, r46).[](source:td-boundary)[](source:doc-web19)
- 영어·중국어 쌍을 고치는 스킬은 모두, 고친 뒤에 `verify-translation-pairing --write`로 sidecar 기록(번역 쌍의 해시)을 다시 남긴다(r43).[](source:doc-pair)[](source:ug-prose)[](source:td-step5)

@answer scope="deepseek-harness docs 묶음 · 스킬 6개와 경계 스킬 원본 · 커밋 475505c · 지시상 동작"
@meta locale=ko
@source doc-fm title="deepseek-harness/dsh-doc/SKILL.md · 18418B · frontmatter" path=deepseek-harness/dsh-doc/SKILL.md lines=1:4
@source doc-pair title="dsh-doc/SKILL.md · 사실 확인 4~5단계(sidecar 기록)" path=deepseek-harness/dsh-doc/SKILL.md lines=46:47
@source doc-kind-ug title="dsh-doc/SKILL.md · upgrade-guide 종류" path=deepseek-harness/dsh-doc/SKILL.md lines=60:60
@source doc-slop title="dsh-doc/SKILL.md · 군더더기 점검" path=deepseek-harness/dsh-doc/SKILL.md lines=93:93
@source doc-prose title="dsh-doc/SKILL.md · 문장 단위 계약" path=deepseek-harness/dsh-doc/SKILL.md lines=115:115
@source doc-style title="deepseek-harness/dsh-doc/references/style.md · 4117B · 문장 길이 참고" path=deepseek-harness/dsh-doc/references/style.md lines=31:31
@source doc-web19 title="deepseek-harness/dsh-doc/references/website-sync.md · 6850B · 번역 스킬 자동 호출 금지" path=deepseek-harness/dsh-doc/references/website-sync.md lines=19:19
@source doc-web87 title="website-sync.md · 마지막 검사" path=deepseek-harness/dsh-doc/references/website-sync.md lines=87:87
@source doc-tpl title="deepseek-harness/dsh-doc/templates/upgrade-guide.md · 909B · 소관 안내" path=deepseek-harness/dsh-doc/templates/upgrade-guide.md lines=3:3
@source ps-split title="dsh-prose-standard/SKILL.md · 책임 나눔" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=8:8
@source ps-arch title="dsh-prose-standard/SKILL.md · 보관 노트 제외" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=24:24
@source tc-scope title="dsh-trim-cot-leakage/SKILL.md · 범위와 제외" path=deepseek-harness/dsh-trim-cot-leakage/SKILL.md lines=41:41
@source tc-fix title="dsh-trim-cot-leakage/SKILL.md · 표면별 고치기" path=deepseek-harness/dsh-trim-cot-leakage/SKILL.md lines=43:43
@source ug-fm title="deepseek-harness/dsh-create-upgrade-guide/SKILL.md · 3734B · frontmatter" path=deepseek-harness/dsh-create-upgrade-guide/SKILL.md lines=1:4
@source ug-tpl title="dsh-create-upgrade-guide/SKILL.md · 템플릿에서 시작" path=deepseek-harness/dsh-create-upgrade-guide/SKILL.md lines=36:36
@source ug-prose title="dsh-create-upgrade-guide/SKILL.md · 문장 규칙과 중국어 짝" path=deepseek-harness/dsh-create-upgrade-guide/SKILL.md lines=46:46
@source td-fm title="deepseek-harness/dsh-translate-docs/SKILL.md · 10604B · frontmatter" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=1:6
@source td-boundary title="dsh-translate-docs/SKILL.md · Invocation boundary" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=12:12
@source td-step5 title="dsh-translate-docs/SKILL.md · 기록과 검증" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=34:34
@source td-rec title="dsh-translate-docs/SKILL.md · 일관성 기록" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=67:67
@source td-prose title="dsh-translate-docs/SKILL.md · prose-standard 적용" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=46:46
@source td-pre title="dsh-translate-docs/SKILL.md · PR 전 doc-sync" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=69:69
@source td-review title="dsh-translate-docs/SKILL.md · 리뷰 의견 처리" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=74:74
@source cr-prose title="deepseek-harness/dsh-code-review/SKILL.md · 11550B · 새 글 리뷰" path=deepseek-harness/dsh-code-review/SKILL.md lines=33:33
@source cr-bi title="dsh-code-review/SKILL.md · 이중 언어 변경 리뷰" path=deepseek-harness/dsh-code-review/SKILL.md lines=29:29
@source cr-notes title="dsh-code-review/SKILL.md · 구현된 Agent Note" path=deepseek-harness/dsh-code-review/SKILL.md lines=56:56
@source an-fm title="deepseek-harness/dsh-archive-agent-notes/SKILL.md · 6721B · frontmatter" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=1:4
@source sp-ug title="deepseek-harness/dsh-session-projection/SKILL.md · 5476B · 소비자 갱신과 가이드" path=deepseek-harness/dsh-session-projection/SKILL.md lines=30:30

## 스킬 여섯 개는 누가 누구를 쓰나 {#flow span=12}

@architecture id=docs-flow title="docs 묶음의 위임과 참조"
| cr | dsh-code-review | external |
| sp | dsh-session-projection | external |
| doc | dsh-doc | backend |
| prose | dsh-prose-standard | backend |
| trim | dsh-trim-cot-leakage | backend |
| ug | dsh-create-upgrade-guide | backend |
| tr | dsh-translate-docs 수동 | frontend |
| pp | dsh-pre-push-checks | backend |
| fs | dsh-find-simplifications | external |
| cr > prose | r01 위임 | default |
| doc > prose | r11 위임 | default |
| doc > trim | r12 위임 | default |
| trim > prose | r16 위임 | default |
| ug > prose | r15 위임 | default |
| tr > prose | r18 위임 | default |
| doc > ug | r13 참고 | dashed |
| sp > ug | r48 참고 | dashed |
| doc > tr | r46 같은 계열 | dashed |
| doc > pp | r26 넘김 | emphasis |
| tr > pp | r25 넘김 | emphasis |
| doc > fs | r47 넘김 | emphasis |

@steps id=docs-steps
| s-doc | dsh-doc | 문서 한 건의 구조를 정한다. 독자와 문서 종류(`kind`)를 보고 템플릿을 고른다. 문서에 적은 동작은 실행해서 확인하고, 영어·중국어 쌍은 같은 작업에서 함께 고친다. | docs-flow | doc |
| s-prose | dsh-prose-standard | 문장 단위로 필수 글 범위와 편집 판단을 맡는다. 계약은 남기고, 추론 기록·반복·장식만 지운다. | docs-flow | prose |
| s-trim | dsh-trim-cot-leakage | 작업 세션의 시점으로 쓰인 글(결정 번호, 변경 서술, 리뷰어에게 하는 말)을 찾아, `HEAD`에서 확인할 수 있는 사실로 고쳐 쓴다. | docs-flow | trim |
| s-ug | dsh-create-upgrade-guide | 저장소 밖에서 보이는 깨짐이 생긴 변경 안에서 버전별 업그레이드 가이드를 쓴다. 시작 템플릿은 `dsh-doc`이 둔다. | docs-flow | ug |
| s-tr | dsh-translate-docs 수동 | 사용자가 이름으로 부를 때만 영어·중국어 짝을 맞추는 확장 번역 워크플로를 돈다. 다른 스킬이 이 스킬을 부르지도 않는다. | docs-flow | tr |
| s-pp | dsh-pre-push-checks | push 전에, 바뀐 범위를 덮는 가장 작은 검사를 고른다. `dsh-doc`(웹사이트 동기화)과 `dsh-translate-docs`(PR 단위 `doc-sync`)가 이 스킬로 넘긴다. | docs-flow | pp |

각 스킬의 내부 단계와 수치는 `deepseek-harness/dsh-doc/dsh-doc.html`, `deepseek-harness/dsh-prose-standard/dsh-prose-standard.html`, `deepseek-harness/dsh-trim-cot-leakage/dsh-trim-cot-leakage.html`, `deepseek-harness/dsh-create-upgrade-guide/dsh-create-upgrade-guide.html`, `deepseek-harness/dsh-translate-docs/dsh-translate-docs.html`, `deepseek-harness/dsh-pre-push-checks/dsh-pre-push-checks.html`에 있다. 경계 밖 스킬 `dsh-code-review`, `dsh-find-simplifications`, `dsh-session-projection`의 페이지도 같은 폴더 구조의 `<스킬>/<스킬>.html`이다.

그림에는 두 스킬 사이 관계마다 한 방향만 그린다. 실선은 위임, 굵은 선은 넘김, 점선은 참고와 같은 계열이다. 아래 표에서 `생략`으로 표시한 행은 그림에 없다.

| rel-id | from → to | 종류 | 조건·강도 | 그림 |
| --- | --- | --- | --- | --- |
| r11 | `dsh-doc` → `dsh-prose-standard` | 내부 위임 | 문장 단위로 계약을 빠짐없이 다루고 편집 판단을 내릴 때 이 스킬을 쓴다. 문체 참고 문서도 완전한 명제 규칙은 `dsh-prose-standard`가 맡는다고 적는다[](source:doc-prose)[](source:doc-style) | 그림 |
| r09 | `dsh-prose-standard` → `dsh-doc` | 참고 | 책임 나눔. 편집 판단과 필수 글 범위는 이 스킬이, 배치·예산·이중 언어 쌍·문서 통과 조건은 `dsh-doc`이 맡는다[](source:ps-split) | 생략(r11의 반대 방향) |
| r12 | `dsh-doc` → `dsh-trim-cot-leakage` | 내부 위임 | 구조 점검을 마치고 군더더기 체크리스트를 훑을 때, 추론 흔적은 이 스킬로 찾는다[](source:doc-slop) | 그림 |
| r17 | `dsh-trim-cot-leakage` → `dsh-doc` | 내부 위임 | 이중 언어 코드 울타리를 고칠 때는, 고친 블록을 양쪽에 바이트 그대로 복사하는 `dsh-doc` 규칙을 따른 뒤 쌍을 다시 기록한다[](source:tc-fix) | 생략(r12의 반대 방향) |
| r13 | `dsh-doc` → `dsh-create-upgrade-guide` | 참고 | 문서 종류 `upgrade-guide`의 범위·배치·유지·길이 규칙은 `dsh-create-upgrade-guide`가 맡고, `verify-upgrade-guides`가 강제한다[](source:doc-kind-ug)[](source:doc-tpl) | 그림(점선) |
| r14 | `dsh-create-upgrade-guide` → `dsh-doc` | 참고 | 가이드는 `dsh-doc/templates/upgrade-guide.md` 템플릿에서 시작한다[](source:ug-tpl) | 생략(r13의 반대 방향) |
| r15 | `dsh-create-upgrade-guide` → `dsh-prose-standard` | 내부 위임 | 가이드를 쓸 때 따른다(의무형 "Follow")[](source:ug-prose) | 그림 |
| r16 | `dsh-trim-cot-leakage` → `dsh-prose-standard` | 내부 위임 | 범위와 제외 대상(`vendor/`, `.agents/notes/archived/`)은 `dsh-prose-standard` 기준을 따른다. 모델이나 사용자에게 보이는 문자열은 `dsh-prose-standard`로 넘기고, 그 문자열을 소유한 동작의 근거가 없으면 바꾸지 않고 보류했다고 보고한다[](source:tc-scope)[](source:tc-fix) | 그림 |
| r10 | `dsh-prose-standard` → `dsh-trim-cot-leakage` | 참고 | 추론 흔적을 찾고 고치는 일에는 이 스킬을 쓰라고 한다[](source:ps-split) | 생략(r16의 반대 방향) |
| r18 | `dsh-translate-docs` → `dsh-prose-standard` | 내부 위임 | 양쪽 언어에 모두 적용하고, 원문 명제를 더하거나 빼지 않는다[](source:td-prose) | 그림 |
| r25 | `dsh-translate-docs` → `dsh-pre-push-checks` | 넘김 | PR 전에 `pnpm run doc-sync`를 PR 단위로 한 번 돌린다. 번역 작업마다 돌리지 않는다[](source:td-pre) | 그림 |
| r26 | `dsh-doc` → `dsh-pre-push-checks` | 넘김 | 웹사이트 동기화 작업 뒤 push 전에 쓴다[](source:doc-web87) | 그림 |
| r46 | `dsh-doc` ~ `dsh-translate-docs` | 같은 계열 | 둘 다 이중 언어 문서를 다룬다. 일상 번역은 `docs/AGENTS.md`의 한 번에 끝내는 규칙을 따르고, `dsh-translate-docs`는 사용자가 이름으로 부를 때만 도는 확장판이다[](source:doc-fm)[](source:doc-web19)[](source:td-boundary) | 그림(점선) |
| r47 | `dsh-doc` → `dsh-find-simplifications` | 넘김 | 감사에서 글을 지웠을 때 설명이 아니라 약속한 동작이 바뀌면, 동작 변경을 먼저 제안한다. 그 제안은 `dsh-find-simplifications`를 따른다(묶음 경계)[](source:doc-slop) | 그림 |
| r48 | `dsh-session-projection` → `dsh-create-upgrade-guide` | 참고 | 새 필수 서비스나 활성화 단계가 생기면, 소비자 갱신과 업그레이드 가이드가 필요하다. 원문은 스킬 이름을 적지 않는다(묶음 경계)[](source:sp-ug) | 그림(점선) |
| r01 | `dsh-code-review` → `dsh-prose-standard` | 내부 위임 | 추가하거나 바꾼 모든 Markdown 단락, JSDoc, 주석, 프롬프트, description, 진단 메시지, 보이는 문자열을 이 스킬로 비판적으로 리뷰한다. 자동 검사로는 이 성질이 확인되지 않는다고 적는다(묶음 경계)[](source:cr-prose) | 그림 |
| r07 | `dsh-code-review` → `dsh-translate-docs` | 참고 | 이중 언어 변경을 리뷰할 때, 확장 번역 스킬은 자동 리뷰 밖이며 사용자가 명시적으로 부를 때만 돈다고 경계를 긋는다. 즉 리뷰가 이 스킬을 부르지 않는다(묶음 경계)[](source:cr-bi)[](source:td-boundary) | 생략(부르지 않는 관계라 선으로 그리지 않음) |
| r19 | `dsh-translate-docs` → `dsh-code-review` | 참고 | 번역 리뷰 의견을 처리할 때 `dsh-code-review`의 보고 절을 따른다. 용어 의견은 용어표에 반영한다(묶음 경계)[](source:td-review) | 생략(묶음 밖으로 나가는 참고) |

## 왜 `dsh-translate-docs`만 따로 떼어 그렸나 {#manual-only}

@code id=td-frontmatter source=td-fm language=yaml

frontmatter에서 `disable-model-invocation: true`가 켜져 있어서, 다른 스킬이 이 스킬을 부를 수 없다. 원문은 같은 말을 세 군데에서 적는다.

- 번역 스킬 자신: 일반 문서 작업이나 다른 스킬에서, 또는 번역이 필요해 보인다는 추론만으로, 이 스킬을 고르지도 불러오지도 않는다.[](source:td-boundary)
- `dsh-doc`의 웹사이트 참고 문서: 확장 번역 스킬을 자동으로 부르지 않는다.[](source:doc-web19)
- `dsh-code-review`: 이 스킬은 자동 리뷰 밖이다. 리뷰가 이 스킬을 부르지 않는다.[](source:cr-bi)

@callout level=warning title="이 묶음에서 번역 스킬로 가는 호출 간선은 없다"
그림의 `dsh-doc` → `dsh-translate-docs` 점선은 같은 계열(r46)일 뿐 호출이 아니다.
`dsh-code-review`(r07)도 이 스킬을 부르지 않는다. 사용자가 이름을 입력해야만 도는 변형이다.

판정: 문서 작업 중에 번역이 필요해 보여도, 에이전트는 이 스킬로 넘어가지 않고 일상 번역 규칙(`docs/AGENTS.md`)을 따른다. 그 규칙의 내용은 이 저장소에 없어서 확인하지 못했다.

## 어떤 파일을 함께 쓰고 읽나 {#shared-state}

| 파일·장소 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| sidecar 기록 `foo.i18n.yaml`(r43) | `dsh-doc`(쌍을 고칠 때마다 `verify-translation-pairing --write`)[](source:doc-pair), `dsh-create-upgrade-guide`(중국어 짝을 쓴 뒤)[](source:ug-prose), `dsh-translate-docs`(확인한 쌍만 기록)[](source:td-step5)[](source:td-rec), `dsh-trim-cot-leakage`(이중 언어 산문·코드 울타리를 고친 뒤)[](source:tc-fix) | `dsh-doc`(옛 글을 점검할 때 이 기록에서 마지막으로 확인된 양쪽 글을 되찾는다)[](source:doc-pair) |
| `docs/upgrade-guide/v<version>/<item>/guide.md`와 중국어 짝(r44) | `dsh-create-upgrade-guide`(내용 규칙), `dsh-doc`(문서 종류 `upgrade-guide`로 다룰 때)[](source:doc-kind-ug)[](source:ug-fm) | 원문에 명시 없음 |
| `.agents/notes/archived/`(r42) | `dsh-archive-agent-notes`(보관 규칙을 가진 쪽, 묶음 밖)[](source:an-fm) | `dsh-prose-standard`와 `dsh-trim-cot-leakage`는 이 폴더를 고치지 않는다. `dsh-prose-standard`는 과거 인용을 이해해야 할 때만 정확한 대상 하나를 열어 본다[](source:ps-arch)[](source:tc-scope) |
| 구현된 Agent Note(r42) | `dsh-code-review`가 같은 변경 안에서 현재형으로 옮기게 한다(묶음 밖)[](source:cr-notes) | 원문에 명시 없음 |

두 번째 행은 어느 스킬이 먼저 쓰는지 정해져 있지 않은 공유 폴더다. `dsh-doc`은 이 폴더를 문서 종류에 대응시키고, 내용 규칙은 `dsh-create-upgrade-guide`가 갖는다.[](source:doc-kind-ug) sidecar 기록과 업그레이드 가이드를 검사하는 `pnpm` 명령과 스크립트는 이 저장소에 없다. 그래서 그 동작은 원문이 설명한 만큼만 적었다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: 묶음 스킬 6개의 `SKILL.md`, `dsh-doc/references/style.md`·`website-sync.md`, `dsh-doc/templates/upgrade-guide.md`, 경계 스킬 4개(`dsh-code-review`, `dsh-archive-agent-notes`, `dsh-find-simplifications`, `dsh-session-projection`)의 인용 줄. 모두 원본이다. 번역본은 이 컬렉션에 없다.
- 원문 대조: r01, r07, r09~r19, r25, r26, r42~r44, r46~r48의 출처 줄을 원문에서 다시 읽었다. 종류와 조건이 원장과 같다. r43에는 `dsh-trim-cot-leakage` 43줄(이중 언어 산문을 고친 뒤 쌍을 다시 기록)을 작성 중에 찾아 원장에 더했다.[](source:tc-fix)
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`docs/AGENTS.md`, `docs/i18n/*`, `pnpm` 스크립트는 원래 저장소에 있고 이 저장소에는 없다. 일상 번역 규칙(r46)과 sidecar 기록 형식(r43)의 내용은 확인하지 못했다.
`dsh-doc`의 `references/` 중 이 페이지가 인용하지 않은 파일의 내용은 `deepseek-harness/dsh-doc/dsh-doc.html`에서 다룬다.
