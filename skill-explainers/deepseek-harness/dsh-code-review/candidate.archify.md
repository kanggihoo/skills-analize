# dsh-code-review 스킬은 에이전트를 어떻게 바꾸나 {#dsh-code-review-skill}

`dsh-code-review`를 쓰면 에이전트는 deepseek-harness 저장소의 PR을 기억에 의존해 리뷰하지 않는다. 에이전트가 기준 branch와 `head`를 확인해 `change-scope`를 돌리고, 바뀐 경로에 해당하는 요구 문서를 먼저 읽은 뒤에 `diff`를 판단한다. 이 스킬은 완전한 체크리스트가 아니라 안내서다. 읽을 규칙과 다른 스킬을 알려 주고, 코드만으로는 안 보이는 점검을 시킨다.[](source:cr-guide)[](source:cr-read)

- 스킬 본문에 차단 요건 6개와 수동 점검 17개가 있다. 각 항목은 에이전트가 무엇을 거부하고 무엇을 확인하는지 적는다.[](source:cr-block)[](source:cr-manual)
- 리뷰를 맡기는 스킬마다 쓰는 조건이 다르다. `dsh-prose-standard`는 새 글이면 모두 쓰고, `dsh-ci-test-reliability`는 불안정한 테스트일 때만 쓴다.[](source:cr-prose)[](source:cr-ci)
- 에이전트는 정확성·수명주기·보안을 문체보다 먼저 본다. 근거가 있는 차단 사유 하나가 사소한 지적을 길게 늘어놓은 목록보다 낫다고 이 스킬은 본다.[](source:cr-guide)
- CI의 초록색 통과 조건이 이미 강제하는 문제는 에이전트가 지적하지 않는다.[](source:cr-report)

@answer scope="deepseek-harness/dsh-code-review · 원본 텍스트 파일 1개 · 커밋 475505c · 지시상 동작"
@meta locale=ko
@source cr-fm title="deepseek-harness/dsh-code-review/SKILL.md · 11550B · frontmatter" path=deepseek-harness/dsh-code-review/SKILL.md lines=1:4
@source cr-guide title="SKILL.md · 안내서 선언과 change-scope" path=deepseek-harness/dsh-code-review/SKILL.md lines=8:8
@source cr-read title="SKILL.md · 요구 먼저 읽기" path=deepseek-harness/dsh-code-review/SKILL.md lines=10:10
@source cr-sot title="SKILL.md · Sources of truth 목록" path=deepseek-harness/dsh-code-review/SKILL.md lines=14:29
@source cr-prose title="SKILL.md · 위임: dsh-prose-standard" path=deepseek-harness/dsh-code-review/SKILL.md lines=22:22
@source cr-ci title="SKILL.md · 위임: dsh-ci-test-reliability" path=deepseek-harness/dsh-code-review/SKILL.md lines=23:23
@source cr-ui title="SKILL.md · 참고: dsh-client-ui-ux" path=deepseek-harness/dsh-code-review/SKILL.md lines=24:24
@source cr-err-list title="SKILL.md · 참고 목록: dsh-error-handling" path=deepseek-harness/dsh-code-review/SKILL.md lines=25:25
@source cr-proj title="SKILL.md · 참고: dsh-session-projection" path=deepseek-harness/dsh-code-review/SKILL.md lines=26:26
@source cr-notes title="SKILL.md · Agent Note 취급" path=deepseek-harness/dsh-code-review/SKILL.md lines=28:28
@source cr-bi title="SKILL.md · 이중 언어 변경 읽기 자료" path=deepseek-harness/dsh-code-review/SKILL.md lines=29:29
@source cr-block title="SKILL.md · Blocking requirements 6개" path=deepseek-harness/dsh-code-review/SKILL.md lines=31:38
@source cr-b1 title="SKILL.md · 차단 1 새 글" path=deepseek-harness/dsh-code-review/SKILL.md lines=33:33
@source cr-b2 title="SKILL.md · 차단 2 문서와 코드" path=deepseek-harness/dsh-code-review/SKILL.md lines=34:34
@source cr-b3 title="SKILL.md · 차단 3 핵심 타입 문서" path=deepseek-harness/dsh-code-review/SKILL.md lines=35:35
@source cr-b4 title="SKILL.md · 차단 4 Cordis" path=deepseek-harness/dsh-code-review/SKILL.md lines=36:36
@source cr-b5 title="SKILL.md · 차단 5 증거" path=deepseek-harness/dsh-code-review/SKILL.md lines=37:37
@source cr-b6 title="SKILL.md · 차단 6 UI 문구" path=deepseek-harness/dsh-code-review/SKILL.md lines=38:38
@source cr-manual title="SKILL.md · Manual checks 17개" path=deepseek-harness/dsh-code-review/SKILL.md lines=40:58
@source cr-m-int title="SKILL.md · 의도·인터페이스, 오류, 수명주기" path=deepseek-harness/dsh-code-review/SKILL.md lines=42:44
@source cr-m-scope title="SKILL.md · 범위·필요성, 소비자, 설정" path=deepseek-harness/dsh-code-review/SKILL.md lines=45:47
@source cr-m-model title="SKILL.md · 모델 관점과 강제" path=deepseek-harness/dsh-code-review/SKILL.md lines=48:49
@source cr-m-state title="SKILL.md · 빌린 상태와 한도" path=deepseek-harness/dsh-code-review/SKILL.md lines=50:51
@source cr-m-test title="SKILL.md · 실제 진입 경로와 테스트" path=deepseek-harness/dsh-code-review/SKILL.md lines=52:55
@source cr-m-ci title="SKILL.md · 테스트 신뢰성 점검" path=deepseek-harness/dsh-code-review/SKILL.md lines=54:54
@source cr-m-rec title="SKILL.md · Agent Note·transcript·이중 언어" path=deepseek-harness/dsh-code-review/SKILL.md lines=56:58
@source cr-report title="SKILL.md · Reporting findings" path=deepseek-harness/dsh-code-review/SKILL.md lines=62:62
@source rel-r01 title="relations.md · r01~r08 허브에서 나가는 관계" path=skill-explainers/deepseek-harness/relations.md lines=44:51

## 언제 켜지나 {#trigger}

@code source=cr-fm language=yaml

`description`은 "deepseek-harness 저장소에서 PR을 리뷰할 때"로 쓰는 범위를 좁힌다.[](source:cr-fm)

호출을 막는 필드(`disable-model-invocation` 등)는 원문에 명시 없음. 다른 저장소의 PR에 쓰라는 말도 원문에 명시 없음. 모델은 `description`을 참고해서 스킬을 쓸지 판단한다. 그래서 이 문구가 있어야만 스킬이 켜지는 것은 아니다.

## 리뷰는 어떤 순서로 진행하나 {#order}

@workflow id=review-order title="`diff`를 읽기 전에 할 일"
| base | 기준·head 확인 | external |
| scope | change-scope 실행 | backend |
| pages | 요구 문서 읽기 | backend |
| diff | diff 판단 | backend |
| report | 지적 보고 | frontend |
| base > scope | |
| scope > pages | 경로 대응 |
| pages > diff | 요구가 먼저 | emphasis |
| diff > report | |
| diff > base | retarget·병합 | dashed |

@steps id=review-order-steps
| base | 기준·head 확인 | 에이전트가 PR의 최신 기준 branch와 정확한 `head`를 가져와 확인한다.[](source:cr-guide) | review-order | base |
| scope | change-scope 실행 | 에이전트가 `pnpm --silent run change-scope --base <확인한 기준> --head <확인한 head>`를 돌린다. 이 명령은 바뀐 경로와 영향 층을 알려 주지만, 의미 리뷰를 대신하지는 않는다.[](source:cr-guide) | review-order | scope |
| pages | 요구 문서 읽기 | 에이전트가 바뀐 경로를 아래 문서에 대응시키고, 대응한 문서를 모두 연다. `diff`는 그다음에 읽는다.[](source:cr-read) | review-order | pages |
| diff | diff 판단 | 에이전트가 요구를 가지고 `diff`를 읽고, 이어서 주변 코드를 읽는다. 규칙을 기억으로 대조하면 위반이 통과한다고 원문이 경고한다.[](source:cr-read) | review-order | diff |
| report | 지적 보고 | 에이전트가 결함·위치·영향·근거를 적는다. 아래 보고 규칙을 따른다.[](source:cr-report) | review-order | report |

판정: 원문이 분명히 정한 순서는 하나다. `change-scope`와 요구 읽기가 둘 다 `diff` 판단보다 앞선다. 이 둘 사이의 순서는 원문에 명시 없다.

위 그림은 경로 대응에 `change-scope` 결과를 쓴다고 읽어서 그린 것이다.[](source:cr-guide)[](source:cr-read) PR의 기준 branch를 바꾸거나(retarget) 병합하면, 에이전트가 기준을 다시 확인하고 `change-scope`를 다시 돌린다.[](source:cr-guide) 이 저장소에는 `change-scope` 스크립트가 없어서 확인하지 못했다.

바뀐 영역에 따라 읽을 요구 문서는 다섯 갈래다.[](source:cr-sot)

| 바뀐 영역 | 읽을 자료 |
| --- | --- |
| 저장소·패키지 작성 규칙 | `AGENTS.md`, `packages/AGENTS.md` |
| 구조 요구 | `docs/defensive-patterns/`의 `general`·`package-surface`·`remote-and-api`·`client-components`·`conversation-and-session` 중 `diff`가 건드리는 페이지를 전부 |
| 문서 위치와 글 규율 | `docs/AGENTS.md`, `dsh-prose-standard` |
| 테스트와 통과 조건 | `docs/testing.md` |
| 이중 언어 변경 | `docs/i18n/translation-rules.md`, `docs/i18n/terminology.md` |

에이전트는 설계 근거를 `Agent Note`에서 읽는다. `Agent Note`와 의견이 다르면, 자동으로 거부하지 않고 설계 논의로 다룬다.[](source:cr-notes)

## 무엇을 거부하고 무엇을 확인하나 {#checks}

차단 요건 6개는 항목마다 거부 조건을 한 줄씩 적는다.

| 요건 | 요구 | 위임·참조 |
| --- | --- | --- |
| 새 글에 의미 리뷰 | 추가·변경된 Markdown 단락, JSDoc, 주석, 프롬프트, description, 진단 메시지, 보이는 문자열을 비판적으로 리뷰한다. 자동 검사는 이 점을 증명하지 못한다[](source:cr-b1) | `dsh-prose-standard` |
| 문서와 코드 일치 | 설정, 기본값, 오류, 와이어 필드, 이벤트, 공개 동작이 바뀌면, 같은 `diff`에서 `README`와 `JSDoc`도 고쳐야 한다. 구현 서술·테스트 설명·리뷰 이력·되풀이한 근거는 지우거나 링크로 바꾸라고 지적한다[](source:cr-b2) | - |
| 핵심 타입 문서 | spine·seam 어휘가 바뀌면 `docs/subsystems/` 페이지와 `type-equiv` 항목을 갱신한다. 내부 타입은 목록에 넣지 않는다[](source:cr-b3) | - |
| Cordis 소유와 정리 | 에이전트가 Cordis 플러그인 코드나 진입점에서 닿는 헬퍼를 리뷰할 때는, `cordis-styling-nitpicking`을 불러 적용하고 P0 세 가지를 본다. 새 레지스트리 기여가 있을 때마다 `packages/AGENTS.md`의 해제 테스트를 확인한다[](source:cr-b4) | `cordis-styling-nitpicking` |
| 필요한 근거 | 작성자가 관련 로컬 검사를 돌렸는지, CI가 전체 조합을 덮는지 확인한다. 로컬 검사도 CI도 못 찾는 의미상 빈틈을 리뷰한다[](source:cr-b5) | - |
| UI 문구는 로캘 소유 | JSX·템플릿·헬퍼 반환값·접근성 속성·기본값에 박힌 제품 문구를 거부하고, 타입 있는 사전 키, 표준 `t`, `verify-client-ui-i18n`, 영향받는 모든 로캘의 동작 근거를 요구한다. 사용자·모델·와이어 데이터와 코드 토큰은 그대로 둔다[](source:cr-b6) | - |

수동 점검 17개는 원문의 한 줄 범위 안에 모여 있고, 분석자가 여섯 덩어리로 묶었다.[](source:cr-manual)

| 덩어리 | 핵심 요구 |
| --- | --- |
| 계약·실패·수명주기(3개) | 바뀐 인터페이스의 양쪽을 따라가며 PR·`Agent Note`와 맞는지 본다. 바뀐 실패 경로에는 `dsh-error-handling`을 적용한다. 상태 소유자가 이후 작업의 전제 조건을 보장하지 않으면, `catch-and-continue`(오류를 잡고 계속 진행)하는 코드를 거부한다. 비동기 준비·콜백·프로세스·해체에는 `defensive-patterns/general.md`를 적용한다[](source:cr-m-int) |
| 범위·필요성·설정(3개) | 새 구분·필드·어댑터·상태 기계·옵션·방어적 복사·호환 경로마다, 그것이 필요한 동작을 먼저 찾는다. PR이 도입한 요구나 `Agent Note`는 필요하다는 독립 근거가 아니다. 소비자가 하나뿐인 일반 서비스에 새 공개 메서드가 생기면 불필요한 API 확장이므로, 소비자를 생성할 때 넘기는 비공개 능력 클로저를 요구한다. 새 설정 전달은 우선순위를 추적한다. 기본값·공개 연산·형식마다 현재 소비자 근거나 선행 사례를 묻는다[](source:cr-m-scope) |
| 모델 관점·강제(2개) | 모델이 받는 프롬프트·도구 스키마·결과·진단을 영향이 미치는 모든 모드에서 본다. 거부 경로는 실제로 실행되는 연산까지 따라간다. 스키마·프롬프트·래퍼를 우회하는 직접·대체 호출자를 시험한다[](source:cr-m-model) |
| 빌린 상태·한도(2개) | 보유한 값이 빌린 것인지 소유한 것인지 가르고, 캐시·프롬프트·UI 반영·재생·조회 뷰를 문서화된 성공 지점까지 추적한다. 한도는 래퍼·메타데이터를 포함한 최종 결과를 기준으로 본다. 아주 작은 값, 정확히 한도인 값, 한도를 넘는 단일 덩어리, 바이트 한도의 멀티바이트 텍스트를 시험한다[](source:cr-m-state) |
| 테스트(4개) | 실제 Loader·bin·worker·ACP 브리지·하위 프로세스로 진입하는지 본다. 직접 마운트한 플러그인은 잘못된 `Loader export`를 못 잡는다. 함수 플러그인은 네임스페이스를 이름 있는 `export`로 내보내고, `default export`는 없어야 한다. 단언은 의도한 회귀에서 실패해야 하고, 커버리지는 증거가 아니다. 불안정한 테스트에는 `dsh-ci-test-reliability`를 적용한다. 바뀐 인수 규칙마다 일부러 잘못된 케이스가 실제 runner에서 실패하는지 확인한다[](source:cr-m-test) |
| 기록·번역(3개) | 구현된 제안 `Agent Note`는 같은 `diff`에서 현재형 기록으로 옮기고, 경로·이름·메커니즘을 구현과 대조한다. 편집기·모델에 보이는 변경은 스냅샷을 갱신하거나, 갱신이 필요 없는 이유를 적는다. 이중 언어 변경은 양쪽 의미와 용어를 비교한다. 쌍 해시가 초록색이어도 번역 품질은 증명되지 않는다[](source:cr-m-rec) |

판정: 이 덩어리 분류는 분석자가 17개 항목을 읽기 쉽게 묶은 것이다. 원문은 항목을 순서 없는 목록으로 둔다.[](source:cr-manual)

## 지적은 어떻게 적나 {#reporting}

- 에이전트는 결함, 위치, 영향, 근거를 쓴다. 한 곳에 국한된 결함은 가장 좁은 diff 범위에 인라인으로 달고, 구조·범위·전체 종합은 PR 수준 코멘트로 쓴다.[](source:cr-report)
- 차단 사유와 제안을 나눠 쓴다. CI의 초록색 통과 조건이 이미 강제하는 문제는 쓰지 않는다.[](source:cr-report)
- 답글은 기존 GitHub 리뷰 스레드에 단다.[](source:cr-report)
- 에이전트가 리뷰를 받는 쪽이면, 지적마다 사실을 확인한 뒤 기술적 근거를 들어 고치거나 반박한다. 형식적인 동의는 하지 않는다.[](source:cr-report)

## 흐름 속 위치 {#position}

이 스킬은 묶음 `review`의 허브(안내 역할)다. 이 스킬 앞에 오는 단계는 없다. 아래 그림은 허브에서 나가는 관계만 보여 주고, 그중 위임 4개(`r01`·`r02`·`r04`·`r06`)만 그렸다. 참고 `r03`·`r05`·`r07`과 산출물 호환 `r08`은 그림에서 빼고 표에만 남겼다.[](source:rel-r01)

@workflow id=review-position title="허브에서 나가는 관계"
| hub | dsh-code-review | security |
| prose | dsh-prose-standard | backend |
| ci | dsh-ci-test-reliability | backend |
| err | dsh-error-handling | backend |
| cordis | cordis-styling-nitpicking | backend |
| hub > prose | 새 글이면 | emphasis |
| hub > ci | 불안정 테스트만 | emphasis |
| hub > err | 실패 경로 | emphasis |
| hub > cordis | Cordis 코드 | emphasis |

| rel-id | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| r01 | 바뀐 글 전부 | `dsh-prose-standard`에 의미 리뷰를 맡긴다 → 리뷰 지적 | 의무형 "Use". 자동 검사로는 확인되지 않는다[](source:cr-b1) |
| r02 | 바뀐 테스트 | `dsh-ci-test-reliability`를 적용한다 → 리뷰 지적 | 자원을 소유하거나 비동기이거나 플랫폼에 민감하거나 불안정한 테스트일 때만[](source:cr-m-ci) |
| r03 | 제품 사용자에게 보이는 GUI 변경 | `dsh-client-ui-ux`를 읽을 자료로 올린다 | 참고. 본문 점검 항목은 적용을 따로 지시하지 않는다[](source:cr-ui) |
| r04 | 바뀐 실패 경로 | `dsh-error-handling`을 적용한다 → 리뷰 지적 | 상태 소유자가 전제 조건을 보장하지 않으면 `catch-and-continue`를 거부한다[](source:cr-m-int) |
| r05 | Projection 소유권·상태 크기·과거 읽기·이전 변경 | `dsh-session-projection`을 읽을 자료로 올린다 | 참고. 본문 점검 항목은 적용을 따로 지시하지 않는다[](source:cr-proj) |
| r06 | Cordis 플러그인 코드와 진입점에서 닿는 헬퍼 | `cordis-styling-nitpicking`을 불러 적용한다 → P0 지적 | Cordis 코드를 리뷰할 때. 세 가지 P0 규칙을 확인한다[](source:cr-b4) |
| r07 | 이중 언어 변경 | 확장 번역 스킬을 호출하지 않는다 | 확장 번역 스킬은 사용자가 명시적으로 부를 때만 돈다. 리뷰는 이 스킬을 부르지 않는다(참고, 그림 생략)[](source:cr-bi) |
| r08 | 처리한 리뷰 지적 | PR 설명의 `review` 행이 갱신 대상이다 | 둘은 서로 이름을 부르지 않는다. 분석자의 추론이다(산출물 호환) |

들어오는 관계도 있다. `dsh-translate-docs`는 번역 리뷰 의견을 처리할 때 이 스킬의 "Reporting findings" 절을 따른다(`r19`, 참고). `dsh-archive-agent-notes` 등과는 `.agents/notes/`를 공유한다(`r42`, 공유 상태). 이 스킬이 맡는 점검은, 구현된 제안 노트를 같은 `diff`에서 현재형으로 옮겼는지 보는 것이다.[](source:cr-m-rec)

전체 흐름은 `deepseek-harness/_group-review/review.html`에 있다. 관계 근거는 `deepseek-harness/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 1개. 이 폴더에는 다른 텍스트 파일이 없다.
- 제외한 파일: 없음. 번역본도 없다.
- 범위 밖: `AGENTS.md`, `packages/AGENTS.md`, `docs/…`, `../../notes/README.md` 링크와 `change-scope` 스크립트는 원래 deepseek-harness 저장소에 있고 이 저장소에는 없다. 따라서 차단 요건이 가리키는 규칙의 실제 내용은 확인하지 못했다.
- 형제 스킬 링크(`../dsh-prose-standard/SKILL.md` 등)는 이 폴더에서 열린다. 다만 이 페이지는 허브가 그 스킬을 어떻게 부르는지만 다룬다. 각 스킬의 내부 규칙은 해당 스킬 페이지에서 본다.
- 원문 비교: 같은 이름의 다른 컬렉션 사본이 없다(원장 기준).
- 실행하지 않았다. `change-scope`와 리뷰는 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
항목 17개를 에이전트가 실제 리뷰에서 모두 적용하는지, 차단 요건과 수동 점검 중 무엇을 먼저 보는지는 원문에 명시 없음. "Blocking"이 머지 차단을 뜻하는 정책인지, 리뷰 지적의 심각도 표시인지도 원문에 명시 없음.
