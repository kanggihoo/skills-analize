# 코드와 노트를 줄이는 cleanup 묶음은 어떻게 이어지나 {#cleanup-group}

이 묶음은 코드와 글을 줄이고 `Agent Note`를 정리하는 스킬 세 개다. 출발점은 `dsh-find-simplifications`다. 이 스킬은 새 `Agent Note`를 쓸 때마다 대체 확인을 `dsh-archive-agent-notes`에 넘긴다(r36). 정해진 검사 밖의 검사는 `dsh-find-simplifications`(r27)와 `dsh-archive-agent-notes`(r28)가 `dsh-pre-push-checks`로 고른다.[](source:f-supersede)[](source:f-report)[](source:a-validate)

- r36은 의무형이다. 새 노트를 쓸 때마다 범위를 좁힌 대체 확인을 거친다. 코드를 조사한다고 해서 저장소 전체 노트 감사를 하는 것은 아니다.[](source:f-supersede)
- `dsh-find-simplifications`와 `dsh-archive-agent-notes`는 정해진 검사를 직접 적어 둔다. 그 밖의 근거만 `dsh-pre-push-checks`가 고른다(r27, r28).[](source:f-report)[](source:a-validate)
- `.agents/notes/`는 이 세 스킬과 묶음 밖 스킬 다섯이 함께 다루는 폴더다. 보관과 삭제는 `dsh-archive-agent-notes`가 맡는다(r42).[](source:r-review)[](source:a-steps)
- 스킬 사이의 순서를 강제하는 문장은 없다. 세 스킬 모두 호출을 제한하는 필드가 없어서, 각자 따로 켜질 수 있다. 이 부분은 판정이다.[](source:f-fm)[](source:a-fm)[](source:p-fm)

@answer scope="deepseek-harness/cleanup 묶음 · 스킬 3개의 원본 `SKILL.md`와 관계 상대 줄 · 커밋 475505c · 관계는 relations.md의 rel-id 기준 · 지시상 동작"
@meta locale=ko
@source f-fm title="deepseek-harness/dsh-find-simplifications/SKILL.md · 11425B · frontmatter" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=1:4
@source f-scope title="dsh-find-simplifications/SKILL.md · 먼저 읽을 문서와 보관 노트" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=12:12
@source f-prose title="dsh-find-simplifications/SKILL.md · 글 범위" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=57:57
@source f-note title="dsh-find-simplifications/SKILL.md · 제안 노트 골격" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=59:59
@source f-supersede title="dsh-find-simplifications/SKILL.md · 새 노트의 대체 확인" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=61:61
@source f-report title="dsh-find-simplifications/SKILL.md · 검증과 보고" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=65:65
@source a-fm title="deepseek-harness/dsh-archive-agent-notes/SKILL.md · 6721B · frontmatter" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=1:4
@source a-read title="dsh-archive-agent-notes/SKILL.md · 먼저 읽을 계약" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=12:12
@source a-supersede title="dsh-archive-agent-notes/SKILL.md · 새 노트의 대체 확인" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=14:16
@source a-del title="dsh-archive-agent-notes/SKILL.md · 구현됨 삭제" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=22:22
@source a-steps title="dsh-archive-agent-notes/SKILL.md · 보관 다섯 단계와 봉인" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=56:62
@source a-validate title="dsh-archive-agent-notes/SKILL.md · 검증" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=66:66
@source a-report title="dsh-archive-agent-notes/SKILL.md · 보고" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=68:68
@source p-fm title="deepseek-harness/dsh-pre-push-checks/SKILL.md · 11283B · frontmatter" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=1:4
@source p-doc title="dsh-pre-push-checks/SKILL.md · 문서·Agent Note 검사" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=35:35
@source p-repeat title="dsh-pre-push-checks/SKILL.md · 통과한 검사 반복 금지" path=deepseek-harness/dsh-pre-push-checks/SKILL.md lines=43:43
@source r-doc title="dsh-doc/SKILL.md · r47 상대 줄" path=deepseek-harness/dsh-doc/SKILL.md lines=93:93
@source r-cordis title="cordis-styling-nitpicking/SKILL.md · r38 상대 줄" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=65:65
@source r-perf title="dsh-speed-up-perf/SKILL.md · r41 상대 줄" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=86:86
@source r-review title="dsh-code-review/SKILL.md · r42 상대 줄" path=deepseek-harness/dsh-code-review/SKILL.md lines=56:56
@source r-prose title="dsh-prose-standard/SKILL.md · r42 상대 줄" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=24:24
@source r-trim title="dsh-trim-cot-leakage/SKILL.md · r42 상대 줄" path=deepseek-harness/dsh-trim-cot-leakage/SKILL.md lines=41:41

## 세 스킬은 어떤 순서로 이어지나 {#flow span=12}

@workflow id=cleanup-flow title="cleanup 묶음의 연결"
| doc | dsh-doc | external |
| find | dsh-find-simplifications | backend |
| archive | dsh-archive-agent-notes | backend |
| push | dsh-pre-push-checks | backend |
| doc > find | r47 동작 변경 | |
| find > archive | r36 새 노트마다 | emphasis |
| archive > push | r28 추가 근거 | emphasis |
| find > push | r27 추가 검사 | dashed |

@steps id=cleanup-steps
| s-find | dsh-find-simplifications | 코드·API·설정·테스트·글에서 근거 있는 단순화 후보를 찾아, 제안서로 쓰거나 작은 정리 거리를 짚는다. | cleanup-flow | find |
| s-archive | dsh-archive-agent-notes | 새 `Agent Note`마다 대체된 활성 노트가 있는지 확인하고, 남길지·지울지·보관할지 정해 보관 규칙대로 옮긴다. | cleanup-flow | archive |
| s-push | dsh-pre-push-checks | push 전에 바뀐 범위를 덮는 가장 작은 테스트와 검사만 골라 돌린다. | cleanup-flow | push |

`dsh-doc`은 묶음 밖에서 들어오는 길이다. 각 스킬의 내부 규칙은 `deepseek-harness/dsh-find-simplifications/dsh-find-simplifications.html`, `deepseek-harness/dsh-archive-agent-notes/dsh-archive-agent-notes.html`, `deepseek-harness/dsh-pre-push-checks/dsh-pre-push-checks.html`에 있다. `dsh-pre-push-checks`는 `ship`, `docs` 묶음에도 속한다. 그 흐름은 `deepseek-harness/_group-ship/ship.html`과 `deepseek-harness/_group-docs/docs.html`에 있다.

| rel-id | from → to | 종류 | 조건·강도 | 그림 |
| --- | --- | --- | --- | --- |
| r47 | `dsh-doc` → `dsh-find-simplifications` | 넘김 | 이 넘김은 감사에서 글을 지웠을 때 설명이 아니라 약속한 동작이 바뀌는 경우에만 일어난다. 동작 변경을 먼저 제안하고, 그 제안은 `dsh-find-simplifications`를 따른다[](source:r-doc) | 묶음 밖 노드에서 들어오는 간선 |
| r36 | `dsh-find-simplifications` → `dsh-archive-agent-notes` | 내부 위임 | 새 노트를 쓸 때마다 범위를 좁힌 대체 확인을 거친다(의무형 "requires"). 코드 조사가 전체 노트 감사를 뜻하지는 않는다[](source:f-supersede)[](source:a-supersede) | 굵은 간선 |
| r28 | `dsh-archive-agent-notes` → `dsh-pre-push-checks` | 넘김 | 보관 검증기 테스트 같은 정해진 검사를 돌린 뒤에, 추가로 필요한 근거는 `dsh-pre-push-checks`로 고른다[](source:a-validate) | 굵은 간선 |
| r27 | `dsh-find-simplifications` → `dsh-pre-push-checks` | 넘김 | 문서만 바꾼 `Agent Note` 작업은 `pnpm run doc-sync`, `pnpm run lint`, `git diff --check`를 돌리고, 스킬·주석 수정은 해당 검증기도 돌린다. 그 밖의 검사는 `dsh-pre-push-checks`로 고른다[](source:f-report) | 점선 |
| r37 | `dsh-find-simplifications` → `dsh-prose-standard` | 내부 위임 | 글이 범위에 들 때 적용한다. 코드를 되풀이하는 설명은 지우되 동작·시점·소유·실패 의무는 남긴다[](source:f-prose) | 생략: `dsh-prose-standard`는 `docs` 묶음 소속이라 이 그림에 넣지 않았다 |

판정: `dsh-pre-push-checks`는 앞 스킬이 이미 통과시킨 검사를 다시 돌릴 이유가 없다. 원문이 통과한 검사를 push 직전에 되풀이하지 말라고 하기 때문이다.[](source:p-repeat) 두 스킬이 정해진 검사를 직접 적는 것도 같은 이유로 읽힌다.

## 새 `Agent Note`를 쓰면 무엇이 위임되나 {#delegation}

r36은 내부 위임이다. `dsh-find-simplifications`는 노트를 쓰는 도중에 `dsh-archive-agent-notes`의 대체 확인을 거친다.

| 항목 | 내용 |
| --- | --- |
| 호출 시점 | 새 `Agent Note`마다. 제안이 크면 노트 골격에 맞춰 쓴다[](source:f-note)[](source:f-supersede) |
| 위임하는 것 | 같은 결정·메커니즘·기각된 대안을 다룬 활성 노트를 범위를 좁혀 감사하고, 전체 대체인지 부분 대체인지 하나씩 분류한다[](source:a-supersede) |
| 받는 쪽이 맡는 것 | 보존, 통합, 세 파일 묶음 삭제, 고정된 보관 규칙이다[](source:f-supersede) |
| 위임하지 않는 것 | 저장소 전체 노트 감사다. 코드 조사만으로는 일어나지 않는다[](source:f-supersede) |
| 부분 대체 | 지우지 않고 남겨 서로 연결한다. 현재의 내구·와이어·호환·기각 대안 의무도 남긴다[](source:a-supersede)[](source:f-supersede) |
| 돌아오는 것 | 원문에 돌아오는 형식은 명시 없음. 판정: 추가·통합·유지·삭제한 노트가 `dsh-find-simplifications`의 최종 보고에 들어간다[](source:f-report) |

## `.agents/notes/`는 누가 쓰고 읽나 {#shared-state}

공유 상태 관계는 r38, r41, r42다. 이 관계에는 선후가 없다. 폴더는 대상 저장소(`deepseek-harness`)에 있고 이 저장소에는 없다. 그래서 폴더 자체는 분석 범위 밖이다.

@architecture id=notes-state title="Agent Note 폴더를 다루는 스킬"
| find | dsh-find-simplifications | backend |
| archive | dsh-archive-agent-notes | backend |
| cordis | cordis-styling-nitpicking | external |
| perf | dsh-speed-up-perf | external |
| review | dsh-code-review | external |
| prose | dsh-prose-standard | external |
| trim | dsh-trim-cot-leakage | external |
| notes | .agents/notes/ | database |
| archived | .agents/notes/archived/ | database |
| find > notes | 새 노트 | |
| cordis > notes | r38 요청 때만 | |
| perf > notes | r41 근거 기록 | |
| review > notes | r42 현재형으로 | |
| archive > notes | r42 삭제·분류 | emphasis |
| archive > archived | r42 보관 | emphasis |
| prose > archived | r42 수정 안 함 | dashed |
| trim > archived | r42 수정 안 함 | dashed |

| 파일·장소 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `.agents/notes/`(활성 노트) | `dsh-find-simplifications`(새 노트. 결정이 같으면 기존 노트를 고친다)[](source:f-note); `dsh-archive-agent-notes`(세 파일 묶음 삭제, 낡은 제안 기각)[](source:a-del)[](source:a-supersede). 묶음 밖: `cordis-styling-nitpicking`(기록하라는 요청이 있을 때만 제안 노트, r38)[](source:r-cordis), `dsh-speed-up-perf`(근거 기록, r41)[](source:r-perf), `dsh-code-review`(구현된 제안 노트를 같은 `diff`에서 현재형으로 옮기게 함, r42)[](source:r-review) | `dsh-find-simplifications`(의도된 결정 확인)[](source:f-scope); `dsh-archive-agent-notes`(분류와 대체 확인)[](source:a-read); `dsh-pre-push-checks`(`doc-sync` 검사 대상)[](source:p-doc) |
| `.agents/notes/archived/`(보관 노트) | `dsh-archive-agent-notes`(세 파일 묶음 이동, `Archived:` 한 줄, 해시 기록)[](source:a-steps). 봉인 뒤에는 아무도 고치지 않는다. `dsh-prose-standard`, `dsh-trim-cot-leakage`도 고치지 않는다(r42)[](source:r-prose)[](source:r-trim) | 읽는다고 적은 스킬은 원문에 명시 없음. `dsh-find-simplifications`는 보관 노트를 열어 보거나 바깥 링크를 검증하지 않는다[](source:f-scope) |

판정: 같은 폴더를 쓰는 스킬이 많아도, 보관 폴더에 쓰는 스킬은 `dsh-archive-agent-notes` 하나다. 나머지 스킬은 모두 보관 폴더를 건드리지 않는다.

r38과 r41은 `dsh-archive-agent-notes`를 부르는 문장이 아니다. 원문에는 노트를 쓰거나 대체 여부를 확인하라는 역할만 적혀 있어서, 공유 상태로 분류한다. 이 두 관계는 원장에서 근거 방식이 명시-역할이다.[](source:r-cordis)[](source:r-perf)

@callout level=warning title="봉인된 노트는 건드리지 않는다"
`dsh-archive-agent-notes`는 보관한 세 파일 묶음을 어떤 이유로도 고치거나 옮기거나 번역하거나 서식을 바꾸거나 지우지 않는다. 보관 노트는 다른 문서가 링크를 걸어도 올바른 대상이지만, 현재 동작의 권위는 아니다.[](source:a-steps)

## 어떤 상황에 무엇을 쓰고, 언제 쓰지 않나 {#use}

| 상황 | 쓰는 스킬 | 근거 |
| --- | --- | --- |
| 지울 만한 코드·API·설정·테스트·글을 찾는다 | `dsh-find-simplifications` | `description`이 이 용도를 든다[](source:f-fm) |
| 새 `Agent Note`를 쓴다 | `dsh-find-simplifications` 안에서 `dsh-archive-agent-notes`를 거친다 {good:r36} | 새 노트마다 대체 확인이 필요하다[](source:f-supersede) |
| 쌓인 노트를 감사·정리·보관한다 | `dsh-archive-agent-notes` | `description`에 추가·감사·정리·보관·복원·리뷰가 있다[](source:a-fm) |
| 노트를 쓰지 않는 코드 조사 | `dsh-archive-agent-notes`는 켜지 않는다 {caution:판정} | 코드 조사가 저장소 전체 노트 감사를 뜻하지 않는다[](source:f-supersede) |
| push·준비 완료 표시 전, 검사 통과를 말하기 전 | `dsh-pre-push-checks` | `description`이 이 시점을 든다[](source:p-fm) |

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: 묶음 스킬 세 개의 `SKILL.md`를 끝까지 읽었다. `dsh-find-simplifications` 11,425B, `dsh-archive-agent-notes` 6,721B, `dsh-pre-push-checks` 11,283B다. `dsh-find-simplifications/references/historical-patterns.md`(8,573B)는 이 페이지에서 다시 읽지 않았고 스킬 페이지가 다룬다.
- 원장 대조: r27, r28, r36, r37의 출처 줄과 r38, r41, r42, r47의 상대 줄(`cordis-styling-nitpicking` 65, `dsh-speed-up-perf` 86, `dsh-code-review` 56, `dsh-prose-standard` 24, `dsh-trim-cot-leakage` 41, `dsh-doc` 93)을 원문과 비교했다. 종류와 조건이 원장과 같다. r47은 원장의 "조정자 확인 뒤 추가한 관계"에 있다.
- 원장 밖 사실: `dsh-find-simplifications`가 보관 노트를 열지 않는다는 문장(12줄)은 r42 행에 없다. 공유 상태 표에는 원문 줄을 달아 적었다.
- 제외한 파일: 없음. 이 컬렉션에는 번역본이 없다.
- 범위 밖: `.agents/notes/`, `notes/README.md`, `notes/archived/AGENTS.md`는 원래 저장소에 있어 읽지 않았다. 묶음 밖 스킬(`cordis-styling-nitpicking`, `dsh-speed-up-perf`, `dsh-code-review`, `dsh-prose-standard`, `dsh-trim-cot-leakage`, `dsh-doc`)은 해당 줄만 읽었다.
- 원문 비교: `dsh-pre-push-checks`는 `verification-skills/deepseek-harness/dsh-pre-push-checks`에 동명·내용 다른 사본이 있다. 이 페이지는 `deepseek-harness/` 쪽만 다룬다.
- 실행하지 않았다. 검사, 노트 이동·삭제는 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
세 스킬을 이 순서로 한 번에 돌리라는 지시는 원문에 명시 없음. 이 순서는 원장이 확정한 관계를 이은 것이다.
`dsh-find-simplifications`가 대체 확인을 받은 결과를 어떤 형식으로 돌려받는지는 원문에 명시 없음.[](source:f-supersede)
`dsh-archive-agent-notes`가 노트를 삭제·보관하기 전에 사용자 승인을 받는 단계는 원문에 명시 없음.[](source:a-del)[](source:a-steps)
