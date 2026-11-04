# dsh-archive-agent-notes 스킬은 에이전트를 어떻게 바꾸나 {#archive-agent-notes-skill}

`dsh-archive-agent-notes`가 켜지면 에이전트는 `Agent Note`를 나이나 분량이 아니라 "앞으로의 결정에 도움이 되는가"로 판단한다. 새 노트를 쓸 때마다, 이미 대체된 활성 노트가 있는지 범위를 좁혀 먼저 확인하고, 남길 노트·지울 노트·보관할 노트를 가른다.[](source:an-intro)[](source:an-supersede)

- 작은 UI 조정이나 순수 기계적 변경만 담은 구현 노트는 세 파일 묶음째 지운다. 더는 실수를 막지 못하는 기각 노트도 묶음째 지운다.[](source:an-impl-del)[](source:an-rej-del)
- 제안 상태의 노트는 보관하지 않는다. 계속할 가치가 없으면 솔직한 이유를 달아 기각한다.[](source:an-prop)
- 보관은 세 파일 묶음을 `archived/<kind>/`로 옮기고 `Archived: YYYY-MM-DD` 한 줄만 더한다. 봉인한 뒤에는 고치지 않는다.[](source:an-steps)[](source:an-sealed)
- 보관 개수의 할당량은 없다. 보관된 노트의 바깥 링크가 유효하다고 주장하지 않는다.[](source:an-quota)[](source:an-report)

@answer scope="dsh-archive-agent-notes · 파일 1개 · 커밋 475505c · 지시상 동작"
@meta locale=ko
@source an-fm title="deepseek-harness/dsh-archive-agent-notes/SKILL.md · 6721B · frontmatter" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=1:4
@source an-intro title="SKILL.md · 목적과 판단 원칙" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=8:8
@source an-read title="SKILL.md · 먼저 읽을 계약" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=12:12
@source an-supersede title="SKILL.md · 새 노트의 대체 확인" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=14:16
@source an-impl-del title="SKILL.md · 구현됨 삭제" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=22:22
@source an-impl-keep title="SKILL.md · 구현됨 유지" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=23:23
@source an-impl-arch title="SKILL.md · 구현됨 보관" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=24:24
@source an-prop title="SKILL.md · 제안됨 보관 금지" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=25:25
@source an-rej-keep title="SKILL.md · 기각됨 가드레일 유지" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=26:26
@source an-rej-del title="SKILL.md · 기각됨 삭제" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=27:27
@source an-quota title="SKILL.md · 할당량 금지와 경계 사례" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=29:29
@source an-ex-del title="SKILL.md · 삭제 예시" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=33:38
@source an-ex-keep title="SKILL.md · 유지 예시" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=40:46
@source an-ex-rej title="SKILL.md · 기각 노트 예시" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=48:52
@source an-steps title="SKILL.md · 구현 노트 보관 다섯 단계" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=56:60
@source an-sealed title="SKILL.md · 봉인 뒤" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=62:62
@source an-validate title="SKILL.md · 검증" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=66:66
@source an-report title="SKILL.md · 보고" path=deepseek-harness/dsh-archive-agent-notes/SKILL.md lines=68:68
@source rel-fs title="dsh-find-simplifications/SKILL.md · r36 상대 줄" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=61:61
@source rel-cordis title="cordis-styling-nitpicking/SKILL.md · r38 상대 줄" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=65:65
@source rel-perf title="dsh-speed-up-perf/SKILL.md · r41 상대 줄" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=86:86
@source rel-review title="dsh-code-review/SKILL.md · r42 상대 줄" path=deepseek-harness/dsh-code-review/SKILL.md lines=56:56
@source rel-prose title="dsh-prose-standard/SKILL.md · r42 상대 줄" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=24:24
@source rel-trim title="dsh-trim-cot-leakage/SKILL.md · r42 상대 줄" path=deepseek-harness/dsh-trim-cot-leakage/SKILL.md lines=41:41

## 언제 켜지나 {#trigger}

@code source=an-fm language=yaml

머리말에는 `name`과 `description`만 있고 호출 제한 필드가 없다.[](source:an-fm) 판정: 모델이 `description`을 참고해 스스로 켤 수 있다. `description`은 판단용 설명이지, 특정 단어가 있으면 켜지는 키워드 목록이 아니다.

`description`이 드는 일은 `deepseek-harness` 저장소의 `Agent Note`를 추가·감사·정리·보관·복원·리뷰하는 것이다. 새 노트마다 대체된 활성 기록을 확인하고, 작은 UI 기록과 순수 기계적 기록은 지우고, 나머지 구현 노트는 앞으로의 결정 가치로 나눈다. 더 이상 그럴듯한 실수를 막지 못하는 기각 노트는 지우고, 고정된 `archived/{kind}` 세 파일 묶음과 매니페스트 규칙을 적용한다.[](source:an-fm)

에이전트는 분류하기 전에 `Agent Note` 규칙, 보관 지침, 해당하는 활성 수명 주기 지침을 읽는다. 현재 코드, 설정, 패키지 문서, 생성 카탈로그, 더 새로운 노트, 들어오는 링크를 살펴, 노트의 근거가 아직 무언가를 소유하거나 제약하는지 확인한다.[](source:an-read) 이 문서들은 원래 저장소에 있어 이 분석의 범위 밖이다.

원칙은 하나다. 노트마다 의미로 판단한다. 단어 수와 나이는 찾을 때 돕는 단서일 뿐 보관 기준이 아니다.[](source:an-intro)

## 노트를 어떻게 가르나 {#classify}

**새 노트를 쓸 때.** 초안을 쓰기 전에 노트 작성 기준을 적용한다. 새 노트마다 같은 결정, 메커니즘, 기각된 대안을 다룬 활성 노트를 범위를 좁혀 감사한다.[](source:an-supersede) 노트를 쓰는 동안 전체 대체와 부분 대체를 하나씩 분류한다.

- 조건에 맞는 구현 노트 세 파일 묶음은 같은 PR에서 보관한다.
- 부분 대체이거나 독립적으로 쓸모 있는 근거는 남기고 서로 연결한다.
- 낡은 제안은 기각한다.
- 더는 그럴듯한 실수를 막지 못하는 기각 노트는 지운다.
- 새 노트가 고유한 명제를 모두 흡수하면 노트 통합 규칙을 적용한다. 알려진 일치를 나중의 전체 감사로 미루지 않는다.

**구현된 노트.** 삭제 기준을 먼저 적용한 뒤 유지와 보관을 가른다.[](source:an-impl-del)

@workflow id=note-classify title="구현된 노트의 분류"
| impl | 구현된 노트 | external |
| small | 소규모 UI·기계적 변경? | backend |
| del | 삭제 | security |
| guide | 앞으로 결정을 이끄나? | backend |
| keep | 활성 유지 | database |
| arch | 보관 | database |
| impl > small | |
| small > del | 예 | emphasis |
| small > guide | 아니오 | |
| guide > keep | 예 | emphasis |
| guide > arch | 아니오 | dashed |

판단은 결정에 대해 한다. 구현 방법이 기계적이어도 기록은 오래가는 이름·호환·소유 규칙을 담을 수 있다.[](source:an-impl-keep) 지운 노트를 가리키는 링크는 고치거나 없앤다.[](source:an-impl-del)

| 상태 · 결과 | 원문의 기준 |
| --- | --- |
| 구현됨 · 삭제 | 작은 UI 조정이나 순수 기계적 변경만 기술하는 세 파일 묶음. 지역 버그 수정, 성능 변경, 새 능력, 실질적 동작·소유 결정은 구현됐다는 이유만으로 삭제 대상이 아니다[](source:an-impl-del) |
| 구현됨 · 활성 유지 | 근거, 대안, 부정 보장, 내구·와이어 의미, 소유 경계, 보안 규칙, 재도입 조건이 앞으로의 변경을 이끌 가능성이 있다. 길이는 상관없다[](source:an-impl-keep) |
| 구현됨 · 보관 | 실질적인 역사적 결정이고, 완결됐으며, 앞으로의 작업을 이끌 가능성은 낮지만 역사적 근거는 보존할 가치가 있다. 직접 삭제 기준에 드는 기록은 보관하지 않는다[](source:an-impl-arch) |
| 제안됨 · 보관 금지 | 살아 있는 제안은 활성으로 둔다. 더 추구할 가치가 없으면 솔직한 이유를 달아 기각하고 기각 수명 주기 형식을 맞춘다[](source:an-prop) |
| 기각됨 · 가드레일로만 유지 | 진 제안이 여전히 그럴듯하고 의미 있는 실수이며, 노트가 왜 지는지 설명할 때만 남긴다[](source:an-rej-keep) |
| 기각됨 · 삭제 | 기각된 발상이 낡았거나, 대체됐거나, 더는 그럴듯하지 않거나, 재론을 막을 가능성이 낮으면 세 파일 묶음을 지운다. 들어오는 링크는 고치거나 지운다[](source:an-rej-del) |

보관 개수에는 할당량이 없다. 범위 안의 모든 노트를 살피고, 비슷한 묶음은 하나의 원칙으로 분류하고, 아슬아슬한 경우는 최선의 판단을 쓴다. 정말 경계에 있는 결정은 인계용으로 기록한다.[](source:an-quota)

원문은 아래 예시가 기준선을 정한다고 하고, 단어 수는 크기가 기준이 아님을 보이려고 붙였다고 한다.[](source:an-ex-del)

| 노트(원문 표기) | 결과 | 단어 수 | 이유 |
| --- | --- | --- | --- |
| 접은 사이드바 제어 레일 | 구현·삭제 | 533 | 닫힌, 사소한 UI 동작[](source:an-ex-del) |
| 이슈 정책 모듈 소유권 | 구현·삭제 | 원문에 명시 없음 | 함수 이전과 import 재배선이 끝났고 동작은 그대로[](source:an-ex-del) |
| 이벤트 소싱 세션 | 구현·유지 | 248 | 권위와 내구성 경계의 토대[](source:an-ex-keep) |
| 하네스 홈 단일 해석기 | 구현·유지 | 596 | 제품 간 소유 규칙[](source:an-ex-keep) |
| 프로젝트 세션 디렉터리 | 구현·유지 | 628 | 내구 저장과 신원 정책[](source:an-ex-keep) |
| 병렬 pre-push 통과 조건 | 구현·유지 | 400 | 경계 사례지만 통과 조건의 일정과 자원 조정을 여전히 이끈다[](source:an-ex-keep) |
| 제거된 이미지 콘텐츠 블록 | 구현·유지 | 334 | 멀티모달 지원이 들어올 때까지 유지. 함께 되살릴 조건을 적고 있다[](source:an-ex-keep) |
| 컴팩션 패키지 분리 합치기 | 기각·유지 | 426 | 패키지를 합치려는 유혹이 아직 의미 있다[](source:an-ex-rej) |
| 도구 호출로 워크플로 진행 스트리밍 | 기각·삭제 | 972 | ACP/UI 전제가 낡았다[](source:an-ex-rej) |
| ACP 터미널 메타데이터 제거 | 기각·삭제 | 362 | 뒤의 "자동화 전용 ACP" 결정이 질문을 해결했다[](source:an-ex-rej) |

판정: 단어 수와 나이를 기준에서 빼고 예시마다 단어 수를 붙인 것은, 짧아서 지우거나 길어서 보관하는 기계적 판단을 막으려는 설계다.[](source:an-intro)[](source:an-ex-del) 또 삭제 기준을 먼저 적용하게 해, 보관 폴더에 지워야 할 기록이 쌓이는 일을 막는다.[](source:an-impl-del)[](source:an-impl-arch)

## 보관은 어떻게 하나 {#archive}

@workflow id=archive-flow title="구현 노트 보관"
| move | 세 파일 이동 | backend |
| mark | 보관일 표시 | backend |
| hash | 해시 다시 기록 | database |
| links | 들어오는 링크 | backend |
| verify | 검증기 실행 | security |
| seal | 봉인 | database |
| move > mark | |
| mark > hash | |
| hash > links | |
| links > verify | |
| verify > seal | 통과 | emphasis |

@steps id=archive-steps
| a-move | 세 파일 이동 | 구현 노트 `foo.md`, `foo.zh.md`, `foo.i18n.yaml` 세 파일 묶음을 `implemented/<kind>/`에서 `archived/<kind>/`로 통째로 옮긴다. 보관 경로에는 `implemented`가 없다. | archive-flow | move |
| a-mark | 보관일 표시 | 본문은 고치지 않는다. 두 언어 파일의 `Status: implemented` 바로 아래에 같은 값의 `Archived: YYYY-MM-DD` 한 줄만 넣는다. | archive-flow | mark |
| a-hash | 해시 다시 기록 | 메타데이터만 바뀐 두 편집에 맞춰 사이드카 해시를 기계적으로 다시 기록한다. 번역, 서식 정리, 사실 갱신, 노트 안 링크 수리는 하지 않는다. | archive-flow | hash |
| a-links | 들어오는 링크 | 활성 글에서 들어오는 링크를 찾아 현재 권위로 돌린다. 역사 스냅샷을 일부러 인용할 때만 보관 경로로 바꾸고, 아니면 지운다. | archive-flow | links |
| a-verify | 검증기 실행 | `pnpm run verify-archived-agent-notes --write`를 돌린다. 추가 전용 모드가 기존 봉인을 모두 확인한 뒤 새 묶음의 해시만 더한다. 이어서 일반 검증기를 돌린다. | archive-flow | verify |
| a-seal | 봉인 | 봉인한 뒤에는 고치거나 옮기거나 번역하거나 서식을 바꾸거나 지우지 않는다. | archive-flow | seal |

이 다섯 단계는 `SKILL.md`의 순서를 따른다.[](source:an-steps) 제목 문장부호, 빈 줄 배치, 언어 전환 문구는 그대로 둔다. 보관의 전제 조건이 아니기 때문이다.[](source:an-steps)

@callout level=warning title="봉인된 노트는 건드리지 않는다"
봉인된 세 파일 묶음은 어떤 이유로도 고치거나 옮기거나 번역하거나 서식을 바꾸거나 지우지 않는다. 보관 노트는 들어오는 링크의 올바른 대상이지만 현재 동작의 권위가 아니라 역사 스냅샷이다. 보관 노트에서 나가는 링크는 확인하거나 고치지 않는다.[](source:an-sealed)[](source:an-steps)

마무리로 에이전트는 아래를 돌린다.[](source:an-validate)

- 보관 검증기의 집중 테스트
- `pnpm run verify-archived-agent-notes`
- `pnpm run doc-sync`
- `pnpm run lint`
- `git diff --check`

더 필요한 근거는 `dsh-pre-push-checks`로 고른다. 보고에는 유지한 활성 구현 노트, 삭제하거나 보관한 구현 노트, 유지·삭제한 기각 노트, 기각한 제안 노트(있으면), 경계 사례 하나하나의 단어 수와 고른 결과를 담는다. 보관 노트의 바깥 링크가 유효하다고 주장하지 않는다. 보관 검증기가 일부러 그 링크를 확인하지 않기 때문이다.[](source:an-report)

## 흐름 속 위치 {#position}

이 스킬은 묶음 `cleanup`의 단계 스킬이다. 전체 흐름은 `deepseek-harness/_group-cleanup/cleanup.html`에 있다.

@workflow id=archive-position title="cleanup 안의 위치"
| find | 단순화 후보 | external |
| me | 노트 대체 확인·보관(이 스킬) | security |
| push | 검사 고르기 | backend |
| find > me | r36 새 노트마다 | emphasis |
| me > push | r28 추가 근거 | emphasis |

| 구분 | 관계(rel-id, 상대) | 종류 | 전달물·상태 | 조건·강도 |
| --- | --- | --- | --- | --- |
| 받는 것: 단순화 | r36 `dsh-find-simplifications` | 내부 위임 | 새 `Agent Note`. 상태는 대상 저장소 `.agents/notes/` | 새 노트마다 범위를 좁힌 대체 확인을 거친다(의무형 "requires"). 코드 조사가 저장소 전체 노트 감사를 뜻하지는 않는다[](source:rel-fs)[](source:an-supersede) |
| 넘기는 것: 검사 | r28 `dsh-pre-push-checks` | 넘김 | 바꾼 범위 | 보관 검증기 테스트 같은 정해진 검사를 돌린 뒤, 추가 근거는 이 스킬로 고른다[](source:an-validate) |

그림에서 뺀 관계는 아래와 같다. 이 스킬로 들어오거나 이 스킬과 폴더를 함께 쓰는 관계다.

| 구분 | 관계(rel-id, 상대) | 종류 | 전달물·상태 | 조건·강도 |
| --- | --- | --- | --- | --- |
| 받는 것: 리뷰 지적 | r38 `cordis-styling-nitpicking` | 공유 상태 | 제안 `Agent Note`. 상태는 `.agents/notes/` | 해결되지 않은 지적을 기록하라는 요청이 있을 때만 제안 노트를 쓰고 활성 노트 대체 확인을 한다. 요청이 없으면 지적을 직접 돌려준다. 스킬 이름을 부르지도 실행하라고 하지도 않고, 대체 확인 절차를 이 스킬이 맡기 때문에 공유 상태다(명시-역할)[](source:rel-cordis) |
| 받는 것: 성능 작업 | r41 `dsh-speed-up-perf` | 공유 상태 | `Agent Note` | 노트 규칙으로 근거를 남기고 관련 노트의 대체 여부를 확인하되 저장소 전체 글 정리로 키우지 않는다(명시-역할)[](source:rel-perf) |
| 공유: 노트 폴더 | r42 `dsh-code-review`, `dsh-prose-standard`, `dsh-trim-cot-leakage` | 공유 상태 | `.agents/notes/`, `.agents/notes/archived/`. 폴더 자체는 범위 밖 | 이 스킬이 보관·삭제를 맡는다. `dsh-code-review`는 구현된 제안 노트를 같은 `diff`에서 현재형으로 옮기게 한다. 나머지 둘은 `.agents/notes/archived/`를 고치지 않는다[](source:rel-review)[](source:rel-prose)[](source:rel-trim) |

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `deepseek-harness/dsh-archive-agent-notes/SKILL.md` 1개, 6,721B. 폴더에 다른 파일이 없다. 끝까지 읽었다.
- 원장 대조를 위해 상대 스킬의 해당 줄(`dsh-find-simplifications` 61, `cordis-styling-nitpicking` 65, `dsh-speed-up-perf` 86, `dsh-code-review` 56, `dsh-prose-standard` 24, `dsh-trim-cot-leakage` 41)을 확인했다. 이 줄들만 읽었고 그 스킬 전체를 이 페이지 범위로 삼지는 않았다.
- 제외한 파일: 없음. 이 컬렉션에는 번역본이 없다.
- 범위 밖: 본문이 링크한 노트 규칙(`notes/README.md`), 보관 지침(`notes/archived/AGENTS.md`), 활성 수명 주기 지침은 원래 저장소에 있어 읽지 않았다. 세 파일 묶음의 정확한 사이드카 형식과 검증기의 동작은 이 페이지에 없다.
- 원문 비교: 원장 기준 다른 컬렉션에 같은 이름의 스킬이 없다.
- 실행하지 않았다. 노트 삭제·이동, 검증기, 검사는 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
삭제하거나 보관하기 전에 사용자의 승인을 받는 단계는 원문에 명시 없음. 경계 사례를 "인계용으로 기록"하라고만 하고, 누구에게 넘기는지는 명시 없음.[](source:an-quota)
설명은 노트의 "복원(restoring)"을 말하지만 본문에는 복원 절차가 없다. 봉인된 묶음은 옮기거나 지우지 못한다고 한다.[](source:an-fm)[](source:an-sealed) 복원하는 방법은 원문에 명시 없음.
"범위를 좁힌" 대체 확인에서 얼마나 좁히는지, 단어 수를 어떻게 세는지(영어·중국어 파일 중 어느 쪽인지)는 원문에 명시 없음.[](source:an-supersede)[](source:an-ex-del)
