# deepseek-harness 관계 원장
분석 커밋: 475505cab7ed9a4e4537ddf7485934e25a85106d

- 범위: `deepseek-harness/` 아래 `SKILL.md` 21개. 원격 출처는 `deepseek-ai/deepseek-harness`의 `.agents/skills/`다(`deepseek-harness/skills-lock.json`).
- lock과 폴더 불일치: lock에 `agent-experience` 항목이 있지만 폴더가 비어 있고 `SKILL.md`가 없다. lock의 해시 `e3b0c442…`는 빈 내용의 SHA-256이다. 스킬 표에서 뺀다.
- 번역본: 이 컬렉션에는 없다.
- 경로 해석: 스킬 본문의 `../../../docs/...`, `../../notes/...`, `../../../packages/...` 같은 링크는 원래 저장소(deepseek-harness)의 파일을 가리킨다. 이 저장소에는 없으므로 모두 `범위 밖`이다. 형제 스킬 링크(`../<스킬>/SKILL.md`)는 이 폴더 안에서 풀린다.
- 호출 제한: `dsh-translate-docs`는 `disable-model-invocation: true`, `user-invocable: true`다. `dsh-pr-description`은 `user-invocable: false`다.

## 스킬

| 경로 ID | 한 줄 요약 | 조사 상태 | 원문 비교 | 소속 묶음 | 역할 |
|---|---|---|---|---|---|
| deepseek-harness/cordis-styling-nitpicking | Cordis 플러그인 코드에서 싱글턴 상태·되돌리지 않는 부작용·정리 순서 위반 세 가지 P0만 근거를 들어 찾는다 | 완료 | - | review | 단계 |
| deepseek-harness/dsh-archive-agent-notes | Agent Note를 추가·정리할 때 대체된 기록을 찾고, 남길지·지울지·보관할지 정해 보관 규칙대로 옮긴다 | 완료 | - | cleanup | 단계 |
| deepseek-harness/dsh-ci-test-reliability | CI 동시 실행·시계·프로세스 전역 상태 때문에 흔들리는 테스트를 설계·리뷰·진단한다 | 완료 | 동명·내용 다름: verification-skills/deepseek-harness/dsh-ci-test-reliability | ship, review | 단계 |
| deepseek-harness/dsh-client-ui-ux | 클라이언트 GUI 변경에서 알림 위치·재사용·오버레이 안전·플랫폼 창 적응 같은 판단을 안내한다 | 완료 | - | client-ui, review | 단계 |
| deepseek-harness/dsh-code-review | deepseek-harness PR을 리뷰할 때 읽을 규칙과 다른 스킬을 알려 주고, 코드만으로는 안 보이는 점검 항목을 시킨다 | 완료 | - | review | 안내 |
| deepseek-harness/dsh-create-upgrade-guide | 외부에서 보이는 표면을 깨는 변경에 대해 버전별 업그레이드 가이드를 쓰거나 고친다 | 완료 | - | docs | 단계 |
| deepseek-harness/dsh-cua-macos-signing | 소스로 Computer Use를 쓰는 macOS 개발자에게 고정 서명 키를 권하고 만들기·설정·제거를 돕는다 | 완료 | - | - | 단계 |
| deepseek-harness/dsh-doc | DSH 문서·패키지 README·문서 웹사이트를 독자 우선 계층과 이중 언어 정렬 규칙으로 쓰고 감사한다 | 완료 | - | docs | 단계 |
| deepseek-harness/dsh-error-handling | 실패 분류·처리 책임·상태 보장·사용자에게 보이는 오류 보고의 원칙을 적용한다 | 완료 | - | review, client-ui | 단계 |
| deepseek-harness/dsh-find-simplifications | 코드·API·설정·테스트·글에서 근거 있는 단순화 후보를 찾아 제안서로 쓰거나 작은 정리 거리를 짚는다 | 완료 | - | cleanup | 단계 |
| deepseek-harness/dsh-merging-stacked-prs | 서로 기대는 PR 묶음을 GitHub 공식 스택 기능과 `gh stack`으로만 병합한다 | 완료 | - | ship | 선택지 |
| deepseek-harness/dsh-official-plugin-artwork | 공식 플러그인 아이콘과 기능 미리보기 그림을 그리고 리뷰한다(툴바·액션 아이콘 제외) | 완료 | - | client-ui | 단계 |
| deepseek-harness/dsh-pr-description | PR 설명의 각 절, 이슈 참조, 테스트 설계, AI 사용 등급표를 정하고 언제 갱신할지 정한다 | 완료 | - | ship | 단계 |
| deepseek-harness/dsh-pre-push-checks | push·준비 완료 표시 전에 바뀐 범위를 덮는 가장 작은 테스트와 검사만 골라 돌린다 | 완료 | 동명·내용 다름: verification-skills/deepseek-harness/dsh-pre-push-checks | ship, docs, cleanup | 단계 |
| deepseek-harness/dsh-prose-standard | 저장소의 모든 글(문서·주석·프롬프트·UI 문자열)에서 계약을 지키며 필요한 만큼만 쓰게 한다 | 완료 | 동명·내용 다름: reporting-skills/deepseek-harness/dsh-prose-standard | docs, review | 단계 |
| deepseek-harness/dsh-responsive-ui | 반응형 레이아웃·터치 판별·말줄임·아이콘 전용 버튼·폭 변화 중 포커스를 설계하고 리뷰한다 | 완료 | - | client-ui | 선택지 |
| deepseek-harness/dsh-session-projection | 세션에서 복구할 상태를 Projection으로 만들거나 늘리거나 옮길 때의 규칙을 적용한다 | 완료 | - | review | 단계 |
| deepseek-harness/dsh-speed-up-perf | 성능 문제를 실제와 닮은 벤치마크로 재고 동작을 바꾸지 않는 수정으로 개선한다 | 완료 | - | - | 단계 |
| deepseek-harness/dsh-translate-docs | 사용자가 이름으로 부를 때만 확장 이중 언어 번역 워크플로를 돌린다 | 완료 | - | docs | 변형 |
| deepseek-harness/dsh-trim-cot-leakage | 주석·문서에 남은 작업 세션의 추론 흔적(결정 번호, 변경 서술, 리뷰어에게 하는 말)을 찾아 지금 상태로 고쳐 쓴다 | 완료 | - | docs | 단계 |
| deepseek-harness/record-browser-gif | 브라우저 조작 데모를 GIF로 녹화·인코딩해 PR에 첨부한다. GUI를 바꾸는 PR에는 필수다 | 완료 | - | ship, client-ui | 단계 |

## 관계

출처 표기는 `스킬폴더/파일:줄`이다. 파일을 생략하면 그 스킬의 `SKILL.md`다.

### 리뷰 허브(dsh-code-review)에서 나가는 관계

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r01 | dsh-code-review | dsh-prose-standard | 내부 위임 | 명시-이름 | 추가·변경된 모든 Markdown 단락, JSDoc, 주석, 프롬프트, description, 진단 메시지, 보이는 문자열을 이 스킬로 비판적으로 리뷰한다(의무형 "Use"). 자동 검사로는 이 성질이 확인되지 않는다고 적는다 | 리뷰 지적 | - | 범위 내 | dsh-code-review:22,33 |
| r02 | dsh-code-review | dsh-ci-test-reliability | 내부 위임 | 명시-이름 | 자원을 소유하거나 비동기이거나 플랫폼에 민감하거나 흔들리는 테스트일 때만 적용한다 | 리뷰 지적 | - | 범위 내 | dsh-code-review:23,54 |
| r03 | dsh-code-review | dsh-client-ui-ux | 참고 | 명시-이름 | 읽을 자료 목록에 "제품 사용자에게 보이는 GUI 변경"용으로 올라 있다. 본문 점검 항목에서 따로 적용을 지시하지는 않는다 | - | - | 범위 내 | dsh-code-review:24 |
| r04 | dsh-code-review | dsh-error-handling | 내부 위임 | 명시-이름 | 바뀐 실패 경로에 적용한다. 상태 소유자가 이후 작업의 전제 조건을 보장하지 않으면 catch-and-continue를 거부한다 | 리뷰 지적 | - | 범위 내 | dsh-code-review:25,43 |
| r05 | dsh-code-review | dsh-session-projection | 참고 | 명시-이름 | 읽을 자료 목록에 Projection 소유권·상태 크기·과거 읽기·이전(migration)용으로 올라 있다 | - | - | 범위 내 | dsh-code-review:26 |
| r06 | dsh-code-review | cordis-styling-nitpicking | 내부 위임 | 명시-이름 | Cordis 플러그인 코드나 그 진입점에서 닿는 헬퍼를 리뷰할 때 "load and apply"한다. P0 규칙 세 가지를 확인한다 | P0 지적 | - | 범위 내 | dsh-code-review:36; cordis-styling-nitpicking:3 |
| r07 | dsh-code-review | dsh-translate-docs | 참고 | 명시-역할 | 이중 언어 변경 리뷰에서 "확장 번역 스킬은 자동 리뷰 밖이며 사용자가 명시적으로 부를 때만 돈다"고 경계를 긋는다. 리뷰가 이 스킬을 부르지 않는다는 뜻이다 | - | - | 범위 내 | dsh-code-review:29; dsh-translate-docs:4,12 |
| r08 | dsh-code-review | dsh-pr-description | 산출물 호환 | 추론 | 리뷰 지적을 처리한 "리뷰 라운드"가 끝나면 PR 설명을 갱신한다. 둘은 서로 이름을 부르지 않는다 | 처리된 리뷰 지적 → PR 설명 `review` 행 | GitHub PR | 범위 내 | dsh-code-review:3; dsh-pr-description:3,115,176 |

### 문서·글 스킬 사이의 관계

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r09 | dsh-prose-standard | dsh-doc | 참고 | 명시-이름 | 책임 나눔: 이 스킬은 편집 판단과 필수 글 범위를 맡고, 배치·예산·이중 언어 쌍·문서 통과 조건은 `dsh-doc`을 쓰라고 한다 | - | - | 범위 내 | dsh-prose-standard:8 |
| r10 | dsh-prose-standard | dsh-trim-cot-leakage | 참고 | 명시-이름 | 추론 흔적(reasoning-transcript leakage)을 찾고 고치는 일은 이 스킬을 쓰라고 한다 | - | - | 범위 내 | dsh-prose-standard:8 |
| r11 | dsh-doc | dsh-prose-standard | 내부 위임 | 명시-이름 | 문장 단위 계약 범위와 편집 판단에 이 스킬을 쓴다. 문체 참고 문서도 "완전한 명제 규칙은 prose standard가 맡는다"고 적는다 | - | - | 범위 내 | dsh-doc:115; dsh-doc/references/style.md:31 |
| r12 | dsh-doc | dsh-trim-cot-leakage | 내부 위임 | 명시-이름 | 구조 점검 뒤 군더더기 체크리스트를 훑을 때, 추론 흔적은 이 스킬로 찾는다 | - | - | 범위 내 | dsh-doc:93 |
| r13 | dsh-doc | dsh-create-upgrade-guide | 참고 | 명시-이름 | 문서 종류 `upgrade-guide`의 범위·배치·유지·길이 규칙은 `dsh-create-upgrade-guide`가 맡는다(owned by). `pnpm run verify-upgrade-guides`가 강제한다 | - | - | 범위 내 | dsh-doc:60; dsh-doc/templates/upgrade-guide.md:3 |
| r14 | dsh-create-upgrade-guide | dsh-doc | 참고 | 명시-이름 | `dsh-doc/templates/upgrade-guide.md` 템플릿에서 시작한다 | 템플릿 파일 | - | 범위 내 | dsh-create-upgrade-guide:36 |
| r15 | dsh-create-upgrade-guide | dsh-prose-standard | 내부 위임 | 명시-이름 | 가이드를 쓸 때 따른다("Follow") | - | - | 범위 내 | dsh-create-upgrade-guide:46 |
| r16 | dsh-trim-cot-leakage | dsh-prose-standard | 내부 위임 | 명시-이름 | 범위와 제외 대상(`vendor/`, `.agents/notes/archived/`)은 이 스킬 기준이다. 모델·사용자에게 보이는 문자열은 이 스킬로 넘기고, 소유 동작 근거가 없으면 바꾸지 않고 보류를 보고한다 | - | - | 범위 내 | dsh-trim-cot-leakage:41,43 |
| r17 | dsh-trim-cot-leakage | dsh-doc | 내부 위임 | 명시-이름 | 이중 언어 코드 울타리(fence)는 고친 블록을 양쪽에 바이트 그대로 복사하는 `dsh-doc` 규칙을 따른 뒤 쌍을 다시 기록한다 | - | - | 범위 내 | dsh-trim-cot-leakage:43 |
| r18 | dsh-translate-docs | dsh-prose-standard | 내부 위임 | 명시-이름 | 양쪽 언어에 적용하되 원문 명제를 더하거나 빼지 않는다 | - | - | 범위 내 | dsh-translate-docs:46 |
| r19 | dsh-translate-docs | dsh-code-review | 참고 | 명시-이름 | 번역 리뷰 의견을 처리할 때 `dsh-code-review`의 "Reporting findings" 절을 따른다. 용어 의견은 용어표(`docs/i18n/terminology.md`)에 반영한다 | - | - | 범위 내 | dsh-translate-docs:74 |

### 출고(push·PR·병합) 단계의 관계

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r20 | dsh-ci-test-reliability | dsh-pre-push-checks | 넘김 | 명시-이름 | 테스트 설계가 탄탄해진 뒤, push 전에 나가는 검증 명령을 고르는 일은 `dsh-pre-push-checks`로 따로 한다. 재시도·건너뛴 테스트·대기 중인 CI를 통과라고 말하지 않는다 | 바뀐 테스트 | - | 범위 내 | dsh-ci-test-reliability:3,16,131 |
| r21 | dsh-pre-push-checks | dsh-ci-test-reliability | 내부 위임 | 명시-이름 | 나가는 변경이 자원 소유·비동기 테스트, 픽스처, 헬퍼, CI 실행 경로를 바꾸면 먼저 이 스킬로 어떤 근거(복원, 음성 대조, 조용한 정리, 동시 프로세스)가 필요한지 정한다. 명령 선택은 여전히 pre-push가 한다 | 필요한 근거 종류 | - | 범위 내 | dsh-pre-push-checks:31 |
| r22 | dsh-merging-stacked-prs | dsh-pre-push-checks | 넘김 | 추론 | `gh stack sync`가 다시 쓴 층을 push한 직후 바뀐 범위를 검사하고, 통과 전에는 병합하거나 준비됐다고 하지 않는다. pre-push의 description도 "gh stack sync가 다시 쓴 브랜치를 publish한 직후"를 호출 시점으로 든다. 서로 이름을 부르지는 않는다 | 다시 쓴 스택 층 | `gh stack`(GitHub 공식 스택) | 범위 내 | dsh-merging-stacked-prs:72,75; dsh-pre-push-checks:3,8,88 |
| r23 | dsh-pr-description | record-browser-gif | 내부 위임 | 명시-이름 | 제품 사용자에게 보이는 GUI를 바꾸면 데모 GIF와 record-browser-gif가 요구하는 고지를 설명에 넣는다. GIF가 없으면 없는 이유를 적는다. GIF를 넣을 때는 이 스킬을 따르고 `--attach`를 쓴다 | GIF 첨부 | GitHub PR | 범위 내 | dsh-pr-description:63,202; record-browser-gif:12 |
| r24 | dsh-pr-description | dsh-merging-stacked-prs | 공유 상태 | 추론 | 스택 안의 PR마다 자기 설명이 있고, 그 층이 base 대비 바꾼 것만 다룬다 | PR 설명 | GitHub PR | 범위 내 | dsh-pr-description:15; dsh-merging-stacked-prs:3 |
| r25 | dsh-translate-docs | dsh-pre-push-checks | 넘김 | 명시-이름 | PR 전에 `pnpm run doc-sync`를 PR 단위로 한 번 돌린다. 번역 작업마다 돌리지 않는다 | - | - | 범위 내 | dsh-translate-docs:69 |
| r26 | dsh-doc | dsh-pre-push-checks | 넘김 | 명시-이름 | 웹사이트 동기화 작업 뒤 push 전에 쓴다 | - | - | 범위 내 | dsh-doc/references/website-sync.md:87 |
| r27 | dsh-find-simplifications | dsh-pre-push-checks | 넘김 | 명시-이름 | 문서만 바꾼 Agent Note 작업은 `doc-sync`, `lint`, `git diff --check`를, 스킬·주석 수정은 해당 검증기도 돌린다. 그 밖의 검사는 이 스킬로 고른다 | - | - | 범위 내 | dsh-find-simplifications:65 |
| r28 | dsh-archive-agent-notes | dsh-pre-push-checks | 넘김 | 명시-이름 | 보관 검증기 테스트 등 정해진 검사를 돌린 뒤 추가 근거는 이 스킬로 고른다 | - | - | 범위 내 | dsh-archive-agent-notes:66 |
| r29 | dsh-speed-up-perf | dsh-pre-push-checks | 넘김 | 명시-이름 | 적용하고, 실행한 근거만 보고한다. 로컬 시간 측정이 러너 안정성을 증명한다고 가정하지 않는다 | - | - | 범위 내 | dsh-speed-up-perf:90 |

### UI 스킬 사이의 관계

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r30 | dsh-client-ui-ux | dsh-prose-standard | 참고 | 명시-이름 | UI 문구 품질 자체는 `dsh-prose-standard`를 따른다 | - | - | 범위 내 | dsh-client-ui-ux:8 |
| r31 | dsh-client-ui-ux | dsh-error-handling | 내부 위임 | 명시-이름 | 실패 보고에 "Localized, actionable, visible reports" 절을 적용한 뒤, 메시지 수명에 따라 보일 자리를 고른다 | - | - | 범위 내 | dsh-client-ui-ux:34 |
| r32 | dsh-client-ui-ux | dsh-responsive-ui | 참고 | 명시-이름 | 반응형 레이아웃, 모바일·터치 판별, 말줄임, 제목 줄바꿈, 아이콘 전용 버튼, 폭 변화 중 포커스는 이 스킬을 쓴다 | - | - | 범위 내 | dsh-client-ui-ux:59 |
| r33 | dsh-official-plugin-artwork | dsh-client-ui-ux | 참고 | 명시-이름 | 경계: 액션 아이콘은 `dsh-client-ui-ux`의 "Reuse before adding" 절 소관이다. description도 툴바·액션 아이콘은 대상이 아니라고 적는다 | - | - | 범위 내 | dsh-official-plugin-artwork:3,17 |
| r34 | dsh-official-plugin-artwork | record-browser-gif | 넘김 | 명시-이름 | GUI PR이면 저장소 UI 테스트 정책과 record-browser-gif를 따른다. (같은 줄의 "새 그림은 병합 전에 디자이너 승인"은 이 관계가 아닌 별도 의무다) | GIF | - | 범위 내 | dsh-official-plugin-artwork:41 |
| r35 | dsh-speed-up-perf | record-browser-gif | 참고 | 명시-역할 | 제품에 보이는 GUI 변경이면 "필요한 브라우저 근거/GIF"를 넣는다. 스킬 이름은 부르지 않는다 | GIF | - | 범위 내 | dsh-speed-up-perf:80; record-browser-gif:3 |

### 정리·성능·Agent Note 관계

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r36 | dsh-find-simplifications | dsh-archive-agent-notes | 내부 위임 | 명시-이름 | 새 Agent Note마다 이 스킬로 범위를 좁힌 대체 확인(supersession check)을 거친다(의무형 "requires"). 코드 조사가 저장소 전체 노트 감사를 뜻하지는 않는다 | 새 Agent Note | 대상 저장소 `.agents/notes/` | 범위 내 | dsh-find-simplifications:61; dsh-archive-agent-notes:14,16 |
| r37 | dsh-find-simplifications | dsh-prose-standard | 내부 위임 | 명시-이름 | 글이 범위에 들 때 적용한다. 코드를 되풀이하는 설명은 지우되 동작·시점·소유·실패 의무는 남긴다 | - | - | 범위 내 | dsh-find-simplifications:57 |
| r38 | cordis-styling-nitpicking | dsh-archive-agent-notes | 공유 상태 | 명시-역할 | 해결되지 않은 지적을 기록하라는 요청이 있을 때만 제안 Agent Note를 쓰고, 활성 노트 대체 확인을 한다. 스킬 이름도 부르지 않고 실행하라는 문장도 없다. 대체 확인 절차는 archive-agent-notes가 맡는 일이라 공유 상태로 둔다 | 제안 Agent Note | 대상 저장소 `.agents/notes/` | 범위 내 | cordis-styling-nitpicking:65; dsh-archive-agent-notes:14,16 |
| r39 | dsh-speed-up-perf | dsh-ci-test-reliability | 내부 위임 | 명시-이름 | 프로세스, 시계, 브라우저 테스트, 비동기 정리에는 이 스킬을 쓴다 | - | - | 범위 내 | dsh-speed-up-perf:12 |
| r40 | dsh-speed-up-perf | dsh-merging-stacked-prs | 산출물 호환 | 추론 | 작업이 스택 PR을 요구하면 편집 전에 층을 정하고 GitHub 공식 스택과 별도 워크트리를 쓴다. 그렇게 만든 스택은 `dsh-merging-stacked-prs`가 요구하는 공식 스택 조건에 맞는다. 이름은 부르지 않는다 | 공식 스택 PR | `gh stack`(GitHub 공식 스택) | 범위 내 | dsh-speed-up-perf:88; dsh-merging-stacked-prs:3 |
| r41 | dsh-speed-up-perf | dsh-archive-agent-notes | 공유 상태 | 명시-역할 | Agent Note 규칙으로 근거를 남기고, 관련 노트의 대체 여부를 확인하되 저장소 전체 글 정리로 키우지 않는다 | Agent Note | 대상 저장소 `.agents/notes/` | 범위 내 | dsh-speed-up-perf:86; dsh-archive-agent-notes:14 |

### 공유 상태

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r42 | dsh-archive-agent-notes | dsh-code-review, dsh-prose-standard, dsh-trim-cot-leakage, dsh-find-simplifications | 공유 상태 | 명시-역할 | Agent Note 폴더를 함께 다룬다. archive는 보관·삭제를 맡고(description에는 restoring이 있지만 본문에 복원 절차는 없고, 봉인된 묶음을 옮기거나 지우지 못하게 한다), code-review는 구현된 제안 노트를 같은 diff에서 현재형으로 옮기게 하며, prose-standard와 trim-cot-leakage는 `.agents/notes/archived/`를 고치지 않는다. find-simplifications는 보관 노트를 현재 권위가 아닌 과거 사례로 보고, 그 바깥 링크를 살피거나 확인하거나 고치지 않는다 | `.agents/notes/`, `.agents/notes/archived/` | 대상 저장소 | 범위 밖(폴더 자체) | dsh-archive-agent-notes:12; dsh-code-review:56; dsh-prose-standard:24; dsh-trim-cot-leakage:41; dsh-find-simplifications:12 |
| r43 | dsh-doc | dsh-create-upgrade-guide, dsh-translate-docs, dsh-trim-cot-leakage | 공유 상태 | 명시-역할 | 이중 언어 쌍을 고칠 때마다 `pnpm run verify-translation-pairing --write`로 쌍 기록을 다시 남긴다 | 번역 쌍 기록(sidecar) | 대상 저장소 스크립트 | 범위 밖(스크립트 자체) | dsh-doc:47; dsh-create-upgrade-guide:46; dsh-translate-docs:34,67; dsh-trim-cot-leakage:43 |
| r44 | dsh-doc | dsh-create-upgrade-guide | 공유 상태 | 명시-이름 | 둘 다 `docs/upgrade-guide/v<version>/<item>/guide.md`와 중국어 짝을 다룬다. dsh-doc은 문서 종류로 매핑하고, upgrade-guide가 내용 규칙을 갖는다 | `docs/upgrade-guide/` | 대상 저장소 | 범위 밖(폴더 자체) | dsh-doc:60; dsh-create-upgrade-guide:3 |
| r45 | dsh-merging-stacked-prs | dsh-pre-push-checks, dsh-speed-up-perf | 공유 상태 | 명시-역할 | GitHub 공식 스택 객체와 `gh stack` 명령을 함께 쓴다. 스택 규칙·CI·순서·재지정·병합 상태는 GitHub가 갖는다 | 공식 스택 | `gh stack`(GitHub) | 범위 밖(CLI) | dsh-merging-stacked-prs:3,8; dsh-pre-push-checks:88; dsh-speed-up-perf:88 |

### 같은 계열

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r46 | dsh-doc | dsh-translate-docs | 같은 계열 | 명시-역할 | 둘 다 이중 언어 문서를 다룬다. 일상 번역은 `docs/AGENTS.md`의 한 번에 끝내는 규칙을 따르고, translate-docs는 사용자가 이름으로 부를 때만 도는 확장판이다. dsh-doc의 웹사이트 참고 문서는 "확장 번역 스킬을 자동으로 부르지 않는다"고 적는다 | - | - | 범위 내 | dsh-doc:3; dsh-doc/references/website-sync.md:19; dsh-translate-docs:3,12 |


### 조정자 확인 뒤 추가한 관계

스킬 페이지 작성 중 서브에이전트가 찾아 원문으로 확인했다.

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r47 | dsh-doc | dsh-find-simplifications | 넘김 | 명시-이름 | 감사에서 글을 지우면 설명이 아니라 약속한 동작이 바뀔 때, 동작 변경을 먼저 제안하고 그 제안은 `dsh-find-simplifications`를 따른다 | 동작 변경 제안 | - | 범위 내 | dsh-doc:93 |
| r48 | dsh-session-projection | dsh-create-upgrade-guide | 참고 | 명시-역할 | 새 필수 서비스나 활성화 단계가 생기면 소비자 갱신과 업그레이드 가이드가 필요하다. 스킬 이름은 부르지 않는다 | 업그레이드 가이드 | - | 범위 내 | dsh-session-projection:30; dsh-create-upgrade-guide:3 |

미확인 후보: 없음. 이름·슬래시 명령·경로·계열 접두어(`dsh-`)로 찾은 후보를 모두 원문으로 확인했다. `dsh-` 접두어는 저장소 이름 약어일 뿐 계열 표시가 아니라서 같은 계열 근거로 쓰지 않았다(판정). `dsh-cua-macos-signing`은 다른 스킬과 이어지는 곳이 없다.

## 묶음

| group-id | 작업 목표 | 구성 스킬과 역할 | 그림 |
|---|---|---|---|
| ship | 변경을 검증하고 PR로 올려 병합한다 | dsh-ci-test-reliability(흔들리는 테스트가 있을 때 먼저), dsh-pre-push-checks(push 전 검사 고르기), dsh-pr-description(PR 설명), record-browser-gif(GUI 변경일 때 GIF), dsh-merging-stacked-prs(스택 PR일 때 병합) | `@workflow`: ci-test-reliability → pre-push(r20, 반대 방향 r21은 표에만), PR 설명 → GIF(r23), 스택이면 merging → sync 후 pre-push(r22). pre-push와 PR 설명 사이에는 원장 관계가 없어 선을 긋지 않는다 |
| review | deepseek-harness PR을 리뷰한다 | dsh-code-review(허브·안내), dsh-prose-standard·cordis-styling-nitpicking·dsh-error-handling·dsh-ci-test-reliability(조건부 위임), dsh-client-ui-ux·dsh-session-projection(참고) | `@architecture`: code-review 중심 방사형, 위임은 실선·참고는 점선 |
| docs | 문서와 글을 쓰고 다듬는다 | dsh-doc(문서 구조·통과 조건), dsh-prose-standard(문장 판단), dsh-trim-cot-leakage(추론 흔적 제거), dsh-create-upgrade-guide(업그레이드 가이드), dsh-translate-docs(수동 전용 번역 변형), dsh-pre-push-checks(마지막 검사) | `@architecture`: dsh-doc ↔ prose-standard ↔ trim-cot-leakage 위임 삼각형, upgrade-guide·translate-docs 연결 |
| client-ui | 클라이언트 GUI를 설계·리뷰하고 증거를 남긴다 | dsh-client-ui-ux(판단 기준), dsh-responsive-ui(반응형 세부), dsh-official-plugin-artwork(플러그인 그림), dsh-error-handling(오류 보고), record-browser-gif(GUI PR 증거) | `@workflow`: client-ui-ux에서 responsive·error-handling으로 갈라진다(r31, r32). artwork는 client-ui-ux를 경계로 가리키고(r33, 참고), artwork에서 record-browser-gif로 넘긴다(r34). client-ui-ux는 record-browser-gif를 부르지 않는다 |
| cleanup | 코드와 기록을 줄이고 Agent Note를 정리한다 | dsh-find-simplifications(단순화 후보), dsh-archive-agent-notes(노트 대체 확인·보관), dsh-pre-push-checks(검사) | `@workflow`: find-simplifications → archive-agent-notes → pre-push |

독립 스킬(묶음 없음): dsh-cua-macos-signing(연결 없음), dsh-speed-up-perf(ci-test-reliability·pre-push·스택·GIF·Agent Note와 이어지지만 성능 개선이라는 자기 목표가 따로 있다. 판정).
