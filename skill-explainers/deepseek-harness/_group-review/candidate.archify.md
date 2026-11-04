# deepseek-harness PR 리뷰는 허브 스킬에서 어떻게 갈라지나 {#review-group}

`dsh-code-review`는 PR 리뷰의 허브이고, 안내 역할을 한다. 허브는 리뷰어에게 읽을 규칙과 스킬을 알려 주고, 네 스킬은 조건에 따라 적용하라고 한다. `dsh-client-ui-ux`와 `dsh-session-projection`은 읽을 자료 목록에만 올라 있고, 허브는 적용을 지시하지 않는다.[](source:cr-guide)[](source:cr-list)

- 허브는 완전한 체크리스트가 아니라 안내서다. 리뷰어는 정확성·수명주기·보안을 문체보다 먼저 본다.[](source:cr-guide)
- 글이 바뀌면 허브는 `dsh-prose-standard`를 쓰게 한다(r01). 나머지 위임은 조건이 붙는다. 불안정한 테스트면 `dsh-ci-test-reliability`(r02), 바뀐 실패 경로면 `dsh-error-handling`(r04), Cordis 코드면 `cordis-styling-nitpicking`(r06)을 쓴다.[](source:cr-b1)[](source:cr-m-ci)[](source:cr-m-int)[](source:cr-b4)
- 참고 둘(r03, r05)은 읽을 자료 목록에만 있고, 허브 본문의 점검 항목은 적용을 따로 지시하지 않는다.[](source:cr-list)
- 확장 번역 스킬(`dsh-translate-docs`)은 자동 리뷰에 들어가지 않는다. 사용자가 이름으로 부를 때만 돈다(r07).[](source:cr-bi)

@answer scope="deepseek-harness/review 묶음 · 스킬 7개의 원본 SKILL.md · 커밋 475505c · 관계는 relations.md의 rel-id 기준 · 지시상 동작이며 실행하지 않음"
@meta locale=ko
@source cr-fm title="deepseek-harness/dsh-code-review/SKILL.md · 11550B · frontmatter" path=deepseek-harness/dsh-code-review/SKILL.md lines=1:4
@source cr-guide title="deepseek-harness/dsh-code-review/SKILL.md · 안내서 선언과 change-scope" path=deepseek-harness/dsh-code-review/SKILL.md lines=8:8
@source cr-list title="deepseek-harness/dsh-code-review/SKILL.md · 읽을 자료 목록의 스킬 5개" path=deepseek-harness/dsh-code-review/SKILL.md lines=22:26
@source cr-bi title="deepseek-harness/dsh-code-review/SKILL.md · 이중 언어 변경" path=deepseek-harness/dsh-code-review/SKILL.md lines=29:29
@source cr-b1 title="deepseek-harness/dsh-code-review/SKILL.md · 차단 요건 1: 새 글" path=deepseek-harness/dsh-code-review/SKILL.md lines=33:33
@source cr-b4 title="deepseek-harness/dsh-code-review/SKILL.md · 차단 요건 4: Cordis" path=deepseek-harness/dsh-code-review/SKILL.md lines=36:36
@source cr-m-int title="deepseek-harness/dsh-code-review/SKILL.md · 수동 점검: 오류 처리" path=deepseek-harness/dsh-code-review/SKILL.md lines=43:43
@source cr-m-ci title="deepseek-harness/dsh-code-review/SKILL.md · 수동 점검: 테스트 신뢰성" path=deepseek-harness/dsh-code-review/SKILL.md lines=54:54
@source cr-m-rec title="deepseek-harness/dsh-code-review/SKILL.md · 수동 점검: 구현된 Agent Note" path=deepseek-harness/dsh-code-review/SKILL.md lines=56:56
@source ps-fm title="deepseek-harness/dsh-prose-standard/SKILL.md · 9899B · frontmatter" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=1:4
@source ps-intro title="deepseek-harness/dsh-prose-standard/SKILL.md · 도입" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=8:8
@source ps-excl title="deepseek-harness/dsh-prose-standard/SKILL.md · 보관된 노트 제외" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=24:24
@source cd-fm title="deepseek-harness/cordis-styling-nitpicking/SKILL.md · 9200B · frontmatter" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=1:4
@source cd-intro title="deepseek-harness/cordis-styling-nitpicking/SKILL.md · 대상 범위" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=8:8
@source cd-notes title="deepseek-harness/cordis-styling-nitpicking/SKILL.md · 보고와 Agent Note" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=63:65
@source eh-fm title="deepseek-harness/dsh-error-handling/SKILL.md · 2389B · frontmatter" path=deepseek-harness/dsh-error-handling/SKILL.md lines=1:4
@source eh-catch title="deepseek-harness/dsh-error-handling/SKILL.md · 잡기·복구·중단" path=deepseek-harness/dsh-error-handling/SKILL.md lines=14:18
@source cir-fm title="deepseek-harness/dsh-ci-test-reliability/SKILL.md · 9442B · frontmatter" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=1:4
@source cir-intro title="deepseek-harness/dsh-ci-test-reliability/SKILL.md · 도입" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=8:8
@source ui-fm title="deepseek-harness/dsh-client-ui-ux/SKILL.md · 9486B · frontmatter" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=1:4
@source ui-prose title="deepseek-harness/dsh-client-ui-ux/SKILL.md · 문구 품질은 prose-standard" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=8:8
@source ui-eh title="deepseek-harness/dsh-client-ui-ux/SKILL.md · 실패 보고는 error-handling" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=34:34
@source sp-fm title="deepseek-harness/dsh-session-projection/SKILL.md · 5476B · frontmatter" path=deepseek-harness/dsh-session-projection/SKILL.md lines=1:4
@source sp-sum title="deepseek-harness/dsh-session-projection/SKILL.md · 요약" path=deepseek-harness/dsh-session-projection/SKILL.md lines=10:10
@source tr-r07 title="deepseek-harness/dsh-translate-docs/SKILL.md · 사용자가 이름으로 부를 때만" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=12:12
@source tr-r19 title="deepseek-harness/dsh-translate-docs/SKILL.md · 리뷰 의견 처리" path=deepseek-harness/dsh-translate-docs/SKILL.md lines=74:74
@source pd-r08 title="deepseek-harness/dsh-pr-description/SKILL.md · review 행과 리뷰 라운드" path=deepseek-harness/dsh-pr-description/SKILL.md lines=115:115
@source pd-r08b title="deepseek-harness/dsh-pr-description/SKILL.md · 리뷰 라운드의 끝" path=deepseek-harness/dsh-pr-description/SKILL.md lines=176:176
@source arc-r42 title="deepseek-harness/dsh-archive-agent-notes/SKILL.md · Agent Note 규칙 읽기" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=12:12

## 허브는 누구에게 무엇을 맡기나 {#flow span=12}

@workflow id=review-flow title="review 묶음의 위임 관계"
| hub | dsh-code-review | security |
| prose | dsh-prose-standard | backend |
| ci | dsh-ci-test-reliability | backend |
| err | dsh-error-handling | backend |
| cordis | cordis-styling-nitpicking | backend |
| hub > prose | 글이 바뀌면 | emphasis |
| hub > ci | 불안정 테스트만 | emphasis |
| hub > err | 실패 경로 | emphasis |
| hub > cordis | Cordis 코드 | emphasis |

@steps id=review-steps
| s-hub | dsh-code-review | 리뷰어에게 읽을 규칙과 스킬을 알려 주고, 코드만 봐서는 드러나지 않는 점검을 시킨다. | review-flow | hub |
| s-prose | dsh-prose-standard | 바뀐 글이 계약을 담고 있는지 의미를 기준으로 리뷰한다. | review-flow | prose |
| s-ci | dsh-ci-test-reliability | 자원을 소유하거나 비동기인 테스트가 실제 CI 구조에서 flaky하지 않은지 본다. | review-flow | ci |
| s-err | dsh-error-handling | 바뀐 실패 경로에서 누가 실패를 처리하는지, 실패한 뒤에도 상태가 보장되는지 본다. | review-flow | err |
| s-cordis | cordis-styling-nitpicking | Cordis 플러그인 코드가 P0 규칙 세 가지를 위반했는지 근거와 함께 찾는다. | review-flow | cordis |
| s-ui | dsh-client-ui-ux | 제품 사용자에게 보이는 GUI 변경을 리뷰할 때 읽을 자료다. 허브는 적용하라고 지시하지 않는다. | | |
| s-proj | dsh-session-projection | Projection 소유권·상태 크기·과거 읽기·이전을 리뷰할 때 읽을 자료다. 허브는 적용하라고 지시하지 않는다. | | |

각 스킬의 내부 규칙은 `deepseek-harness/dsh-code-review/dsh-code-review.html`, `deepseek-harness/dsh-prose-standard/dsh-prose-standard.html`, `deepseek-harness/dsh-ci-test-reliability/dsh-ci-test-reliability.html`, `deepseek-harness/dsh-error-handling/dsh-error-handling.html`, `deepseek-harness/cordis-styling-nitpicking/cordis-styling-nitpicking.html`, `deepseek-harness/dsh-client-ui-ux/dsh-client-ui-ux.html`, `deepseek-harness/dsh-session-projection/dsh-session-projection.html`에 있다.

그림에는 내부 위임 네 개만 그렸고, 참고와 산출물 호환은 아래 표에 남겼다. 화살표는 관계가 향하는 방향이고, 리뷰어가 이 순서로 하라는 뜻이 아니다.

## 허브는 각 스킬을 어떤 말로 가리키나 {#hub-role}

허브는 `안내` 역할이다. 허브는 스스로 완전한 체크리스트가 아니라고 선언하고, 읽을 자료 목록과 점검 항목에서 다른 스킬을 가리킨다.[](source:cr-guide)[](source:cr-list) 다른 스킬을 가리키는 말의 세기는 스킬마다 다르다.

| rel-id | 허브 → 스킬 | 종류 | 허브 안 위치와 조건 | 그림 |
| --- | --- | --- | --- | --- |
| r01 | `dsh-code-review` → `dsh-prose-standard` | 내부 위임 | 차단 요건 1. 추가하거나 바꾼 모든 Markdown 단락, JSDoc, 주석, 프롬프트, description, 진단 메시지, 보이는 문자열을 이 스킬로 비판적으로 리뷰한다. 자동 검사로는 확인되지 않는다고 적는다 {good:항상 적용}[](source:cr-b1) | 그림 |
| r02 | `dsh-code-review` → `dsh-ci-test-reliability` | 내부 위임 | 수동 점검. 테스트가 자원을 소유하거나, 비동기이거나, 플랫폼에 민감하거나, 불안정할 때만 적용한다 {caution:조건부}[](source:cr-m-ci) | 그림 |
| r04 | `dsh-code-review` → `dsh-error-handling` | 내부 위임 | 수동 점검. 바뀐 실패 경로에 적용한다. 상태 소유자가 이후 작업의 전제 조건을 보장하지 않으면 `catch-and-continue`를 거부한다 {caution:조건부}[](source:cr-m-int) | 그림 |
| r06 | `dsh-code-review` → `cordis-styling-nitpicking` | 내부 위임 | 차단 요건 4. Cordis 플러그인 코드나, 그 진입점에서 닿는 헬퍼를 리뷰할 때 이 스킬을 불러 적용한다. P0 규칙 세 가지를 확인한다 {caution:조건부}[](source:cr-b4) | 그림 |
| r03 | `dsh-code-review` → `dsh-client-ui-ux` | 참고 | 읽을 자료 목록에 "제품 사용자에게 보이는 GUI 변경"용으로 올라 있다. 본문 점검 항목에서 적용을 따로 지시하지 않는다 {caution:목록만}[](source:cr-list) | 생략(참고) |
| r05 | `dsh-code-review` → `dsh-session-projection` | 참고 | 읽을 자료 목록에 Projection 소유권·상태 크기·과거 읽기·이전용으로 올라 있다. 본문 점검 항목에서 적용을 따로 지시하지 않는다 {caution:목록만}[](source:cr-list) | 생략(참고) |
| r07 | `dsh-code-review` → `dsh-translate-docs` | 참고 | 이중 언어 변경을 리뷰할 때, 확장 번역 스킬은 자동 리뷰에 들어가지 않고 사용자가 명시적으로 부를 때만 돈다고 선을 긋는다. 즉 리뷰가 이 스킬을 부르지 않는다 {bad:부르지 않음}[](source:cr-bi)[](source:tr-r07) | 생략(참고, 묶음 밖) |
| r08 | `dsh-code-review` → `dsh-pr-description` | 산출물 호환(추론) | 리뷰 지적을 처리해서 리뷰 라운드가 끝나면, PR 설명의 `review` 행을 갱신한다. 두 스킬은 서로 이름을 적지 않는다[](source:pd-r08)[](source:pd-r08b) | 생략(산출물 호환, 묶음 밖) |

판정: 위임이라고 해서 적용이 항상 일어나는 것은 아니다. 허브가 조건 없이 적용하라고 적는 스킬은 글이 바뀔 때의 `dsh-prose-standard` 하나다. 나머지 셋은 해당하는 코드나 테스트가 있을 때만 적용한다.[](source:cr-b1)[](source:cr-m-ci)[](source:cr-m-int)[](source:cr-b4) 이 내용은 허브 원문에서 읽을 수 있고, 허브가 실제로 어떻게 판단하는지는 실행해 보지 않았다.

## 구성원끼리와 묶음 밖에서는 어떻게 이어지나 {#other-relations}

허브를 거치지 않는 관계도 있다. 모두 그림에서 생략했다.

| rel-id | from → to | 종류 | 조건·강도 | 그림 |
| --- | --- | --- | --- | --- |
| r30 | `dsh-client-ui-ux` → `dsh-prose-standard` | 참고 | UI 문구 품질 자체는 `dsh-prose-standard`를 따른다[](source:ui-prose) | 생략(허브 밖) |
| r31 | `dsh-client-ui-ux` → `dsh-error-handling` | 내부 위임 | 실패를 보고할 때 "Localized, actionable, visible reports" 절을 적용한 다음, 메시지 수명에 따라 어디에 보일지 고른다[](source:ui-eh) | 생략(허브 밖) |
| r19 | `dsh-translate-docs` → `dsh-code-review` | 참고 | 번역 리뷰 의견을 처리할 때 `dsh-code-review`의 "Reporting findings" 절을 따른다. 용어 의견은 용어표에 반영한다[](source:tr-r19) | 생략(묶음 밖에서 들어옴) |

`dsh-client-ui-ux`는 `client-ui` 묶음에도 속한다. r31의 위임 흐름은 `deepseek-harness/_group-client-ui/client-ui.html`에서 본다.

## 어떤 상태를 함께 쓰고 읽나 {#shared-state}

| 상태·장소 | 쓰는 스킬 | 읽는 스킬 | rel-id |
| --- | --- | --- | --- |
| `.agents/notes/` (Agent Note 폴더, 대상 저장소) | `cordis-styling-nitpicking`은 기록하라는 요청이 있을 때만 제안 `Agent Note`를 쓰고, 활성 노트를 대체하는지도 확인한다.[](source:cd-notes) PR이 제안 노트를 구현하면, `dsh-code-review`는 같은 `diff`에서 그 노트를 현재형으로 옮겨 쓰게 한다. 옮기는 주체는 원문에 명시 없음.[](source:cr-m-rec) | `dsh-code-review`가 옮긴 노트를 구현과 대조한다.[](source:cr-m-rec) | r38, r42 |
| `.agents/notes/archived/` | 묶음 안의 쓰는 스킬 없음. 보관·삭제·복원은 묶음 밖의 `dsh-archive-agent-notes`가 맡는다.[](source:arc-r42) | `dsh-prose-standard`는 읽기·수정 대상에서 뺀다. 오래된 인용을 이해할 때만 정확한 대상을 열어 본다.[](source:ps-excl) | r42 |

폴더는 이 저장소 밖, 곧 대상 저장소에 있다. 폴더를 관리하는 쪽이 대상 저장소라서, 폴더 안에서 일어나는 동작은 지시상 동작으로만 적었다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: 묶음 스킬 7개의 `SKILL.md`와 r07, r08, r19, r42의 출처 줄이다. 모두 원본이다.
- 읽지 않은 파일: `dsh-ci-test-reliability/references/ci-flake-diagnosis.md`, `dsh-prose-standard/references/`. 각 스킬 페이지 담당 범위이고 이 페이지의 관계에는 쓰이지 않는다.
- 원문 대조: r01~r08, r19, r30, r31, r38, r42의 출처 줄을 원문과 대조했고 종류와 조건이 원장과 같다. 어긋난 곳은 찾지 못했다.
- 원장에 없는 공유 문서는 관계로 올리지 않았다. `docs/defensive-patterns/general.md`를 허브(44줄), 테스트 신뢰성 스킬, Cordis 스킬이 모두 읽을 자료로 든다. 이 저장소에는 파일이 없어 확인하지 않았다.
- `relations.md`는 아직 commit되지 않아 `@source`로 인용하지 않았다. `rel-id`는 본문에 적었다.
- 실제로 실행하지 않았다. 이 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
허브가 네 위임을 어떤 순서로 적용하는지, 여러 위임이 같은 지적을 내면 어떻게 합치는지는 원문에 명시 없음.
`dsh-client-ui-ux`와 `dsh-session-projection`을 리뷰어가 실제로 읽는지는 원문이 지시하지 않는다.
