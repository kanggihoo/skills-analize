# interface-review — 변경분의 영향 화면과 제거 신호를 추려 인터페이스 리뷰를 통합한다 {#overview}

`interface-review`는 브랜치·PR·미커밋 변경분 하나를 받아, 변경 파일이 닿는 화면과 삭제된 접근성·스타일 단서를 추린 뒤 도메인 스킬과 `better-interface`에 넘겨 변경 범위 기준의 인터페이스 리뷰 보고서를 만들게 하는 스킬이다.[](source:sk-intro)

- 사용자가 `/interface-review`와 대상(`working`, `staged`, `branch`, `pr <n>`, `<ref>`, 범위)을 주거나 인자 없이 실행할 때 켜지며, 변경이 없으면 임의로 `HEAD~1..HEAD`를 고르지 않고 선택지를 묻고 기다린다.[](source:fm)[](source:sk-step1)[](source:sk-step2)
- 결과로 남는 것은 범위 블록, 커버리지 표, 원인 기준으로 `Introduced`·`Regression`·`Pre-existing`(최대 3개) 상태가 붙은 지적(`finding`) 목록, 검증·판정 결과다.[](source:sk-step5)[](source:sk-format)
- 다른 스킬과의 관계: `better-interface`·`afk`·`build-design`에서 변경분 리뷰 경로로 안내되며(다음 안내·대안), 제거 신호 확인은 다섯 `better-*` 도메인 스킬을 호출하고 통합·판정은 `better-interface`를 호출해 맡긴다.[](source:bi-handoff)[](source:sk-step4)[](source:sk-step7)
- 하지 않는 것: 작업 트리나 checkout을 바꾸지 않고(`gh pr checkout`·`git checkout`·`git switch`·`git stash` 금지), 기능 정확성·보안·성능 리뷰와 범위 과다(scope creep) 지적은 하지 않으며, `better-interface`가 없을 때 심각도·상한·판정 기준을 지어내지 않는다.[](source:sk-intro)[](source:sk-step6)[](source:sk-step7)[](source:sk-ro)

@answer scope="design/jakubkrehel/interface-review · 원본 파일 4개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: name·description·호출 제한" path=design/jakubkrehel/interface-review/SKILL.md lines=1:5
@source sk-intro title="목적, 소유 범위, 일반 코드 리뷰 경계" path=design/jakubkrehel/interface-review/SKILL.md lines=7:20
@source sk-step1 title="1단계: 변경 범위 확정과 제외" path=design/jakubkrehel/interface-review/SKILL.md lines=21:34
@source sk-step2 title="2단계: 변경 없음 시 선택지 제시 후 대기" path=design/jakubkrehel/interface-review/SKILL.md lines=35:47
@source sk-step3 title="3단계: 영향 화면(blast radius) 확장" path=design/jakubkrehel/interface-review/SKILL.md lines=48:55
@source sk-step4 title="4단계: 제거 신호 탐색과 회귀 확인" path=design/jakubkrehel/interface-review/SKILL.md lines=56:61
@source sk-step5 title="5단계: Introduced·Regression·Pre-existing 분류" path=design/jakubkrehel/interface-review/SKILL.md lines=62:79
@source sk-step6 title="6단계: 의도 대비 미완성 변경 점검" path=design/jakubkrehel/interface-review/SKILL.md lines=80:92
@source sk-step7 title="7단계: better-interface에 리뷰 전달" path=design/jakubkrehel/interface-review/SKILL.md lines=93:98
@source sk-ro title="작업 트리 불변과 조건부 렌더 검증" path=design/jakubkrehel/interface-review/SKILL.md lines=99:104
@source sk-checks title="마무리 전 실수 점검 9항목" path=design/jakubkrehel/interface-review/SKILL.md lines=105:118
@source sk-format title="범위 블록·커버리지·지적 출력 형식" path=design/jakubkrehel/interface-review/SKILL.md lines=119:149
@source sr-targets title="기본 브랜치 판별, 타깃·PR ref 해석" path=design/jakubkrehel/interface-review/scope-resolution.md lines=5:37
@source sr-awkward title="특수 저장소 상태(rebase·shallow·detached HEAD)" path=design/jakubkrehel/interface-review/scope-resolution.md lines=38:47
@source sr-empty title="변경 없음 상태 정보 수집" path=design/jakubkrehel/interface-review/scope-resolution.md lines=48:53
@source sr-rename title="이름 변경 40% 임계값 처리" path=design/jakubkrehel/interface-review/scope-resolution.md lines=54:59
@source sr-exclude title="제외 경로 표와 폰트·이미지 예외" path=design/jakubkrehel/interface-review/scope-resolution.md lines=60:82
@source sr-expand title="소비자 검색과 정렬 3규칙" path=design/jakubkrehel/interface-review/scope-resolution.md lines=83:97
@source rs-table title="제거 신호 11종과 소유 도메인 스킬" path=design/jakubkrehel/interface-review/removed-signals.md lines=1:18
@source rs-equiv title="등가 대체 7가지" path=design/jakubkrehel/interface-review/removed-signals.md lines=19:30
@source rs-grep title="제거 줄 grep 명령과 hunk 문맥 확인" path=design/jakubkrehel/interface-review/removed-signals.md lines=31:43
@source oai title="UI 메타데이터와 암묵 호출 차단" path=design/jakubkrehel/interface-review/agents/openai.yaml lines=1:5
@source bi-handoff title="better-interface가 변경 리뷰를 보내고 통합" path=design/jakubkrehel/better-interface/SKILL.md lines=28:33
@source afk-rel title="afk의 diff 리뷰 역할 경계" path=design/jakubkrehel/afk/SKILL.md lines=11:11
@source bd-rel title="build-design의 완료 후 리뷰 경계" path=design/jakubkrehel/build-design/SKILL.md lines=12:12

## 어떻게 동작하나 {#flow span=12}

절차형이다. 원문 1~7단계를 범위 확인, diff·영향 분석, 통합·보고 3개 국면으로 그렸다.[](source:sk-step1)[](source:sk-step7)

그림이 생략한 분기가 둘 있다. 첫째, 저장소가 rebase·merge·cherry-pick 중이거나 base를 해석할 수 없으면 1단계에서 즉시 멈춘다.[](source:sr-awkward) 둘째, 7단계에서 `better-interface`를 쓸 수 없으면 통합을 멈추고 범위 블록과 대상 파일만 보고한다.[](source:sk-step7)

@workflow id=flow-diagram title="interface-review 흐름"
| lane scope | 범위 확인 |
| lane analyze | diff·영향 분석 |
| lane report | 통합·보고 |
| resolve | 범위·제외 확정 | backend | scope | source:sk-step1 |
| has-diff | 변경분 있음? | backend | scope | source:sk-step2 |
| ask | 선택지 제시·대기 | external | scope | source:sk-step2 |
| expand | 영향 화면 확장 | backend | analyze | source:sk-step3 |
| removed | 제거 신호 탐색 | backend | analyze | source:sk-step4 |
| classify | finding 분류 | backend | analyze | source:sk-step5 |
| intent | 의도 대비 점검 | backend | analyze | source:sk-step6 |
| handoff | better-interface 위임 | backend | report | source:sk-step7 |
| output | 상태별 보고 출력 | frontend | report | source:sk-format |
| resolve > has-diff | | |
| has-diff > ask | 아니오 | |
| has-diff > expand | 예 | emphasis |
| expand > removed | | |
| removed > classify | | |
| classify > intent | | |
| intent > handoff | | |
| handoff > output | | emphasis |

@steps id=flow-steps
| s-resolve | 범위·제외 확정 | **입력** 타깃 인수(또는 현재 브랜치·작업 트리) · **참조** `scope-resolution.md` · **실행** `git diff --name-only "$BASE" <head-ref> -- . ':(exclude)...'` · **출력** `$BASE`, head ref, 제외 후 파일 목록. **처리** 타깃 규칙에 따라 비교 범위를 잡고 lockfile·스냅샷·생성물·바이너리를 제외한 뒤 전체 diff를 먼저 읽는다. 이동·편집된 파일은 `--find-renames=40%`로 이름 변경으로 묶어 실제 편집 줄만 본다.[](source:sk-step1)[](source:sr-targets)[](source:sr-rename)[](source:sr-exclude) **다음** rebase·merge·cherry-pick 진행 중이거나 base를 풀 수 없으면 리뷰를 시작하지 않고 멈춘다. 폰트 추가·교체와 이미지 추가는 예외로 범위에 남긴다.[](source:sr-awkward)[](source:sr-exclude) | flow-diagram | resolve |
| s-has-diff | 변경분 있음? | **입력** 제외 후 변경 파일과 commit 수 · **출력** 진행 또는 선택 대기 갈래. **처리** merge base 이후 commit이나 미커밋 변경분이 1건 이상 남았는지 확인한다.[](source:sk-step1)[](source:sk-step2) **다음** 제외 목록 적용 뒤 남은 파일이 0개여도 변경 없음으로 처리한다.[](source:sk-step1) | flow-diagram | has-diff |
| s-ask | 선택지 제시·대기 | **입력** 현재 브랜치, 앞선 commit 수, 직전 commit SHA·제목, `gh pr status` 결과 · **참조** `scope-resolution.md` · **출력** 4가지 선택지 안내. **처리** `HEAD~1..HEAD`를 임의로 리뷰하지 않고 사실만 모은 뒤 열린 PR·직전 commit·지정 타깃·전체 저장소 감사(`better-interface`) 중 고르도록 묻고 멈춘다.[](source:sk-step2)[](source:sr-empty) **다음** 사용자가 전체 저장소 감사를 고르면 범위 블록·상태·기존 항목 없이 `better-interface`로 넘긴다.[](source:sk-step2) | flow-diagram | ask |
| s-expand | 영향 화면 확장 | **입력** 변경된 파일·토큰 목록 · **참조** `scope-resolution.md` · **실행** `git grep <pattern> <head-ref>` · **출력** 최대 5개 영향 화면(`surfaces expanded`)과 미확장 수. **처리** 기본 1홉(직접 importer·호출자), 디자인 토큰·테마·공유 프리미티브만 2홉까지 라우트 진입점·importer 수·근접도 순으로 최대 5개 소비자를 찾는다.[](source:sk-step3)[](source:sr-expand) | flow-diagram | expand |
| s-removed | 제거 신호 탐색 | **입력** diff의 `-` 쪽 줄 · **참조** `removed-signals.md` · **실행** `git diff -U0 "$BASE" <head-ref> -- . <exclusions> \| grep -E '^-'` · **출력** 등가 대체가 없는 `Regression` 확인 목록. **처리** 11종 제거 신호와 문자열·색상 교체를 찾고 등가 대체 7가지에 해당하면 거른 뒤, 남은 항목만 소유 도메인 스킬에 보내 회귀 여부를 확정한다.[](source:sk-step4)[](source:rs-table)[](source:rs-equiv)[](source:rs-grep) | flow-diagram | removed |
| s-classify | finding 분류 | **입력** 변경분과 소비자에서 나온 지적 후보 · **실행** `git blame -L <line>,<line> "$BASE"..<head-ref> -- path/to/file` · **출력** `Introduced`·`Regression`·`Pre-existing` 상태. **처리** 위치가 아니라 원인을 기준으로, 바뀐 토큰의 미수정 소비자에서 난 문제도 변경이 유발했으면 `Introduced`나 `Regression`으로 분류한다.[](source:sk-step5) | flow-diagram | classify |
| s-intent | 의도 대비 점검 | **입력** PR 제목·본문, 연결 이슈, commit 메시지 · **출력** 누락된 상태·번역·브레이크포인트·형제 컨트롤 목록. **처리** 변경이 내세운 목적에 맞춰 hover·focus·active·disabled·loading·selected·좁은 폭·번역 카탈로그·형제 화면 누락을 찾는다.[](source:sk-step6) **다음** 범위 과다(scope creep)는 인터페이스 문제가 아니므로 보고하지 않는다.[](source:sk-step6) | flow-diagram | intent |
| s-handoff | better-interface 위임 | **입력** 범위 블록과 영향 화면 목록 · **출력** 7개 도메인 스킬 통합 리뷰 결과. **처리** `better-interface`에 범위 블록과 영향 화면을 넘겨 도메인 리뷰·심각도·지적 상한·판정을 수행하게 하고, 돌아온 지적에 상태를 붙인다.[](source:sk-step7)[](source:bi-handoff) **다음** `better-interface`를 쓸 수 없으면 범위 블록과 대상 파일만 적고 누락 스킬을 밝힌 채 멈춘다. 렌더 검증은 값싼 미리보기가 있거나 사용자가 요청할 때만 켠다.[](source:sk-step7)[](source:sk-ro) | flow-diagram | handoff |
| s-output | 상태별 보고 출력 | **입력** 통합된 지적과 검증 결과 · **출력** 범위 블록, 커버리지 표, 상태별 지적 표, 검증·판정. **처리** 범위 블록을 맨 앞에 두고 `Introduced`·`Regression` 지적(없으면 없음 문구)과 최대 3개의 `Pre-existing` 지적을 구분해 출력한다.[](source:sk-format) | flow-diagram | output |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 호출형(`/interface-review [타깃]`). `disable-model-invocation: true`와 `allow_implicit_invocation: false`가 모두 설정되어 모델이 스스로 켜지 못한다.[](source:fm)[](source:oai) |
| 성격 | 절차형. diff 범위 확정·소비자 확장·제거 신호 추출·원인 분류를 직접 맡고, 도메인 판단과 최종 통합은 `better-*`와 `better-interface`에 넘긴다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `better-interface` {#rel-r53} | **이 스킬** | 다음 안내 | 의무: 브랜치·PR·미커밋 변경분 리뷰 요청이면 사용자에게 `interface-review` 실행을 요청한다(`disable-model-invocation: true`, 사용자 호출 필요).[](source:bi-handoff) |
| `afk` {#rel-r77} | **이 스킬** | 대안 | 역할 경계: diff 리뷰는 `interface-review`를 사용한다(수동 호출 필요).[](source:afk-rel) |
| `build-design` {#rel-r85} | **이 스킬** | 대안 | 역할 경계: 구현 완료 후 리뷰는 `interface-review`를 사용한다(수동 호출 필요).[](source:bd-rel) |
| **이 스킬** {#rel-r54} | `better-interface` | 호출 | 의무: 7단계에서 범위 블록과 영향 화면을 `better-interface`에 넘겨 통합·판정한다. 미가용 시 중단한다(사용자 개입 없음).[](source:sk-step7) |
| **이 스킬** {#rel-r55} | `better-interface` | 다음 안내 | 제안: 리뷰할 변경이 없고 사용자가 전체 저장소 감사를 택하면 `better-interface`로 이관한다(사용자 선택 필요).[](source:sk-step2) |
| **이 스킬** {#rel-r56} | `better-accessibility` | 호출 | 제거 신호(포커스·ARIA·대체 텍스트·모션 선호 등) 및 이미지 추가 시 확인을 위임한다(사용자 개입 없음).[](source:rs-table)[](source:sr-exclude) |
| **이 스킬** {#rel-r57} | `better-colors` | 호출 | 제거 신호(`prefers-contrast`, 색상 토큰 리터럴 교체 등) 발생 시 확인을 위임한다(사용자 개입 없음).[](source:rs-table) |
| **이 스킬** {#rel-r58} | `better-layout` | 호출 | 제거 신호(논리 속성의 물리 속성 교체 등) 발생 시 확인을 위임한다(사용자 개입 없음).[](source:rs-table) |
| **이 스킬** {#rel-r59} | `better-typography` | 호출 | 제거 신호(`lang`·`dir`·줄바꿈·숫자 정렬 등) 및 폰트 파일 변경 시 확인을 위임한다(사용자 개입 없음).[](source:rs-table)[](source:sr-exclude) |
| **이 스킬** {#rel-r60} | `better-writing` | 호출 | 제거 신호(사용자 문구 삭제·축약) 발생 시 확인을 위임한다(사용자 개입 없음).[](source:rs-table) |
| **이 스킬** {#rel-r61} | `better-ui` | 참고 | 이미지가 추가될 때 윤곽·표면 규칙을 `better-ui`에서 함께 확인한다(사용자 개입 없음).[](source:sr-exclude) |

@architecture id=relation-map title="interface-review와 이어지는 스킬"
| bi | better-interface | backend |
| afk | afk | backend |
| bd | build-design | backend |
| self | interface-review(이 스킬) | backend |
| ba | better-accessibility | backend |
| bc | better-colors | backend |
| bl | better-layout | backend |
| bt | better-typography | backend |
| bw | better-writing | backend |
| bu | better-ui | backend |
| bi > self | 다음 안내 |
| afk > self | 대안 |
| bd > self | 대안 |
| self > bi | 호출 |
| self > bi | 다음 안내 |
| self > ba | 호출 |
| self > bc | 호출 |
| self > bl | 호출 |
| self > bt | 호출 |
| self > bw | 호출 |
| self > bu | 참고 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 7단계 절차, 읽기 전용·렌더 규칙, 실수 점검 9항목, 출력 형식 본문 | 스킬이 켜지면 항상 읽는다 | 범위·제외 확정, 변경분 있음?, 선택지 제시·대기, 영향 화면 확장, 제거 신호 탐색, finding 분류, 의도 대비 점검, better-interface 위임, 상태별 보고 출력 |
| `scope-resolution.md` | 기본 브랜치 판별, 타깃별 범위 해석, PR ref 페치, 제외 경로, 소비자 정렬 규칙 | 1~3단계에서 git 범위·PR·예외 상태·소비자를 해석할 때 읽는다 | 범위·제외 확정, 선택지 제시·대기, 영향 화면 확장 |
| `removed-signals.md` | `-` 쪽 제거 신호 11종 소유 매핑, 등가 대체 7종, `-U0` grep 명령 | 4단계에서 삭제된 줄의 회귀 후보를 찾을 때 읽는다 | 제거 신호 탐색 |
| `agents/openai.yaml` | 표시 이름(`Interface Review`), 짧은 설명, 암묵적 호출 차단 정책 | 호스트 UI 설정용. 동작 지시 없음 | 원문에 명시 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| `disable-model-invocation: true` | 모델 자동 호출 금지. 사용자가 `/interface-review`로 직접 켜야 한다 | [](source:fm) |
| 작업 트리 파일 변경·checkout 전환(`gh pr checkout`·`git checkout`·`git switch`·`git stash`) | 금지. `git fetch`와 `git show <head-ref>:path`로 제자리에서 읽고, 렌더 시 별도 `worktree`만 썼다 지운다 | [](source:sk-ro)[](source:sr-targets) |
| 일반 코드 정확성·테스트·보안·성능 문제나 범위 과다(scope creep) | 기능 문제는 일반 코드 리뷰로 1회 안내 후 버리고, 범위 과다 지적은 보고 금지 | [](source:sk-intro)[](source:sk-step6) |
| 변경분이 없거나 제외 경로 적용 후 0개일 때 | `HEAD~1..HEAD` 임의 리뷰와 `Approve` 보고 금지. 4가지 선택지를 제시하고 대기 | [](source:sk-step2) |
| rebase·merge·cherry-pick 중이거나 base를 풀 수 없을 때(무관한 이력, commit 없음, 얕은 복제 등) | 얕은 복제(`shallow clone`)는 `--deepen=50` → `--deepen=200` 시도 후 실패 시, 나머지는 즉시 중단 | [](source:sr-awkward) |
| 소비자 확장 범위 | 1홉(직접 importer) 기본, 토큰·테마·공유 프리미티브만 2홉. 합계 최대 5개까지 확장하고 미확장 수를 명시 | [](source:sk-step3) |
| 제거 신호가 등가 대체 7가지에 해당할 때 | `Regression`으로 보고하지 않고 신호를 해제한다 | [](source:sk-step4)[](source:rs-equiv) |
| `better-interface`를 쓸 수 없을 때 | 심각도·지적 상한·판정 결과를 지어내지 않고 범위 블록과 대상 파일만 적은 뒤 중단 | [](source:sk-step7) |
| `Pre-existing` 지적 출력 | 최대 3개까지만 심각도 높은 순으로 적고 나머지 개수를 밝히며, 없으면 절을 생략한다 | [](source:sk-intro)[](source:sk-format) |
| 인용 줄 번호·렌더 주장 기준 | 모든 줄 인용은 head ref(`git show <head-ref>:path`) 기준. 렌더 검증을 안 돌렸으면 `Not verified` 표시 | [](source:sk-ro)[](source:sk-checks)[](source:sr-targets) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- git 타깃별 범위·PR·예외 상태 해석 — 범위·제외 확정 · `working`·`staged`·`branch`·`<a>..<b>`·`<a>...<b>`·`pr <n>`·shallow clone 세부 규칙
- 제외 경로 pathspec 함정과 소비자 정렬 — 범위·제외 확정, 영향 화면 확장 · `*.lock` vs `package-lock.json`, root `dist/` 누락 방지, 3단계 정렬 규칙
- 제거 신호 11종과 등가 대체 7종 — 제거 신호 탐색 · `-U0` grep 패턴과 도메인 스킬별 회귀 판별 기준

@callout level=open-question title="확인하지 못한 것"
| `better-interface`가 7개 도메인 스킬을 순차 호출할 때 `interface-review`가 넘긴 최대 5개 영향 화면을 도메인별로 어떻게 배분해 점검하는지는 `interface-review` 원문에 명시 없음.[](source:sk-step7) |
| 렌더 검증 발동 조건인 "값싼 미리보기(cheap preview)"의 구체적 시간·비용 기준은 원문에 명시 없음.[](source:sk-ro) |
| 제거된 사용자 문구와 색상 토큰 교체는 `-U0` grep 패턴으로 잡히지 않아 사람이 `hunk`를 읽으라고만 적혀 있으며, 자동 검출 규칙은 원문에 명시 없음.[](source:rs-grep) |

읽은 원본: 텍스트 파일 4개(관계 확인용으로 `better-interface`, `afk`, `build-design` 일부 줄 추가 확인). 제외: 없음.
