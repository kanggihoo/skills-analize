# project-guide-validation은 언제 켜지고, 무엇을 강제하고, 무엇을 금지하나? {#project-guide-validation-page}

`project-guide-validation`은 `guide.md`, `demo.html`, `expectations.md`를 검증하는 6단계 절차다. 새 guide를 다 쓴 작성자가 PR 전에 쓰거나, 검증을 맡은 리뷰어가 쓴다. 에이전트는 체크리스트를 작업 목록으로 만들고, DevTools MCP로 demo를 직접 돌려 본 뒤, 치명적인 문제 위주로 보고한다.[](source:front)[](source:intro)[](source:checklist)

- 작성자에게는 "strongly encouraged"다. 필수 단계가 아니다.[](source:intro)
- 접근성 검토는 항상 해야 한다(MUST). 검토 대상이 `guide.md`인지 `demo.html`인지 `expectations.md`인지에 따라 기준이 다르다.[](source:a11y)
- demo 시험은 항상 DevTools MCP로 하고, 로컬 서버를 먼저 띄운다. 시험이 실패하면 수동 확인으로 넘어가지 않는다.[](source:devtools)[](source:steps)
- 자동 검증은 사람 SME 검토를 대체하지 못한다. 최종 보고서는 통과·실패를 분명히 적는다.[](source:human)[](source:report)

@answer scope="로컬 원본 분석 · SKILL.md 111줄 전체 읽음 · 원본 저장소의 `src/`, `guides/`, `GOVERNANCE.md`와 DevTools MCP 서버는 이 컬렉션에 없어 확인하지 못함 · 대상 스킬의 명령은 실행하지 않음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source full title="modern-web-guidance-src/project-guide-validation/SKILL.md · 14156B · 스킬 본문" path=modern-web-guidance-src/project-guide-validation/SKILL.md
@source front title="modern-web-guidance-src/project-guide-validation/SKILL.md · frontmatter" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=1:4
@source intro title="modern-web-guidance-src/project-guide-validation/SKILL.md · Stage 2 자체 검증 권장" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=6:8
@source human title="modern-web-guidance-src/project-guide-validation/SKILL.md · 사람 SME 승인" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=10:10
@source checklist title="modern-web-guidance-src/project-guide-validation/SKILL.md · 검증 체크리스트" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=12:21
@source p1 title="modern-web-guidance-src/project-guide-validation/SKILL.md · 1단계 familiarization과 자동 검증" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=25:30
@source p2 title="modern-web-guidance-src/project-guide-validation/SKILL.md · 2단계 정성·모범 사례 검토" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=32:42
@source disc title="modern-web-guidance-src/project-guide-validation/SKILL.md · discipline guide 확인" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=35:35
@source a11y title="modern-web-guidance-src/project-guide-validation/SKILL.md · 접근성 검토" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=36:39
@source p3 title="modern-web-guidance-src/project-guide-validation/SKILL.md · 3단계 expectation 정렬" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=44:64
@source grader-read title="modern-web-guidance-src/project-guide-validation/SKILL.md · expectation별 grader 관점 검사 6개" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=55:64
@source devtools title="modern-web-guidance-src/project-guide-validation/SKILL.md · DevTools MCP 시험" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=66:68
@source steps title="modern-web-guidance-src/project-guide-validation/SKILL.md · 시험 순서" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=70:75
@source baseline title="modern-web-guidance-src/project-guide-validation/SKILL.md · Baseline과 fallback 확인" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=77:80
@source manual title="modern-web-guidance-src/project-guide-validation/SKILL.md · 5단계 수동 확인" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=82:96
@source failures title="modern-web-guidance-src/project-guide-validation/SKILL.md · 자주 보이는 실패 패턴" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=98:101
@source report title="modern-web-guidance-src/project-guide-validation/SKILL.md · 6단계 피드백 보고서" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=103:111
@source guides-ref title="modern-web-guidance-src/project-guides/SKILL.md · expectations.md 작성 규칙" path=modern-web-guidance-src/project-guides/SKILL.md lines=148:159
@source guides-pre title="modern-web-guidance-src/project-guides/SKILL.md · 자체 검증 호출" path=modern-web-guidance-src/project-guides/SKILL.md lines=166:168
@source guides-stage title="modern-web-guidance-src/project-guides/SKILL.md · Stage 2 개요" path=modern-web-guidance-src/project-guides/SKILL.md lines=6:12
@source evals-red title="modern-web-guidance-src/project-evals/SKILL.md · 8 red line" path=modern-web-guidance-src/project-evals/SKILL.md lines=31:46
@source base-skill title="modern-web-guidance-src/baseline-status/SKILL.md · 899B · 조회 명령" path=modern-web-guidance-src/baseline-status/SKILL.md lines=1:20
@source disc-skill title="modern-web-guidance-src/project-discipline-guides/SKILL.md · discipline guide 정의" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=8:8
@source auditor title="modern-web-guidance-src/coherence-auditor/SKILL.md · guides-integrity 테스트 실행" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=35:35
@source lock title="modern-web-guidance-src/skills-lock.json · 3621B · 설치 출처" path=modern-web-guidance-src/skills-lock.json

## 언제 켜지고 어떤 순서로 진행하나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻이 아니다. `disable-model-invocation` 필드는 원문에 명시 없음.[](source:front)

@code source=front language=yaml

호출 상황은 두 가지다. 새 guide를 쓴 작성자가 PR 전에 자체 검증하거나, 누군가 guide, demo, expectations 파일의 검증을 맡았을 때다.[](source:front)[](source:intro) 작성자 쪽 진입점은 `project-guides`가 "PR을 열거나 Stage 3으로 가기 전에 invoke하라"고 지시하는 문장이다.[](source:guides-pre)

검증을 맡으면 체크리스트로 작업 목록을 만들고 6단계를 순서대로 끝낸다. 시험이 깨지면 수동 확인으로 넘어가지 않고 보고로 간다.[](source:checklist)[](source:steps)

@workflow id=validation-flow title="검증 6단계의 진행"
| fam | 자동 검증 | backend | source:p1 |
| review | 정성 검토 | backend | source:p2 |
| align | expectation 정렬 | backend | source:p3 |
| test | DevTools 시험 | backend | source:steps |
| ok | 시험 통과? | backend | source:steps |
| manual | 수동 확인 | external | source:manual |
| report | 피드백 보고서 | backend | source:report |
| fam > review | |
| review > align | |
| align > test | |
| test > ok | |
| ok > manual | 통과 | emphasis |
| ok > report | 실패 | security |
| manual > report | |

@steps id=validation-steps
| fam | 자동 검증 | guide.md를 끝까지 읽고 `node --test src/authoring/guides-integrity.test.ts`를 돌린다. 매크로를 쓰면 `pnpm build` 뒤 `out/build/skills-cli/guides/<category>/<slug>.md`를 확인한다.[](source:p1) | validation-flow | fam |
| review | 정성 검토 | discipline guide 준수, 접근성, 외부 reveal 패턴, 사양 정확성, copy-paste 안전성을 본다.[](source:p2) | validation-flow | review |
| align | expectation 정렬 | 모든 bullet을 `guide.md`, demo, 사양과 대조한다. false failure와 false pass를 모두 막는다.[](source:p3) | validation-flow | align |
| test | DevTools 시험 | 로컬 서버를 띄우고 demo의 모든 옵션을 실제로 눌러 본다.[](source:steps) | validation-flow | test |
| ok | 시험 통과? | demo가 기대한 동작을 보이지 않거나 치명적 오류가 있으면 STOP이다. 고치거나 보고서에 적는다.[](source:steps) | validation-flow | ok |
| manual | 수동 확인 | 자동 시험이 통과했거나 DevTools가 못 하는 cross-browser 시험이 필요할 때만 한다.[](source:manual) | validation-flow | manual |
| report | 피드백 보고서 | 발견 사항, 치명적 문제, 권고, 통과·실패 상태를 적는다.[](source:report) | validation-flow | report |

1단계는 PR 리뷰일 때 추가 규칙이 있다. 기존 review thread를 먼저 읽어 이미 나온 피드백을 되풀이하지 않는다. `BASE`와 `HEAD` 파일을 `git show <base_sha>:<path>`로 bullet 단위, 코드 블록 단위로 비교해 조용히 빠진 안내와 중복 bullet을 찾고, 낡은 `GUIDE_REF`·`INCLUDE` 대상도 확인한다.[](source:p1)

판정 · 이 절차는 "작성자가 자기 작업을 다시 읽는" 용도와 "리뷰어가 남의 작업을 검사하는" 용도를 한 문서에 담았다. 원문은 두 경우의 단계를 구분하지 않으므로 작성자 쪽에서는 어디까지 필수인지 사람이 정해야 한다.[](source:intro)[](source:checklist)

## 무엇을 어떤 기준으로 검토하나? {#review-criteria}

기준 문서는 `project-use-cases`와 `project-guides`다. 해당 분야에 `DISCIPLINE_GUIDES`(`src/core/guide-validation.ts`) 등록 discipline guide가 있으면 그것을 따르는지 확인하고, 새 orientation guide는 그 목록에 추가해야 한다.[](source:disc)[](source:disc-skill)

접근성은 항상 평가해야 한다(MUST). 기준 문서는 `guides/accessibility/accessibility/guide.md`이고 먼저 읽는다. 검토 대상마다 요구가 다르다.[](source:a11y)

| 대상 | 접근성 요구 | 강도 |
|---|---|---|
| `guide.md` | 해당하는 모든 모범 사례를 따른다. 권고와 코드 예제가 기준 guide와 모순되지 않아야 한다. 예제에 `prefers-reduced-motion`, `:focus-visible`, `aria-hidden` 같은 언급한 규칙을 직접 넣었는지 본다.[](source:a11y) | MUST |
| `demo.html` | 일반 접근성 모범 사례 기준을 적용하지 않는다. guide가 지시한 패턴(`aria-live="polite"` 등)만 충실히 보여 주면 된다. guide가 요구하지 않은 접근성 기능이 없다고 지적하지 않는다.[](source:a11y) | MUST(demo는 guide를 따름) |
| `expectations.md` | guide가 지시한 접근성 패턴을 검사 가능한 형태로 담아야 한다. grader가 단언할 수 없는 서술형·수동 확인 전용 요구는 넣지 않는다.[](source:a11y) | SHOULD / MUST NOT |

이 밖에 `guide.md`의 모범 사례 항목이 있다.[](source:p2)

- 포인터 사용자만 쓸 수 있는 reveal 패턴(예: 커서 따라가기)을 권하지 않았는지 확인한다. 논의하면 접근 가능한 대안을 함께 제공해야 한다.[](source:p2)
- API·CSS 주장은 1차 사양과 `project-guides`(token economy, `{# ... #}` 유지보수 주석, `BASELINE_STATUS`와 `FEATURE_FALLBACKS`, 상단 `GUIDE_REF`, 브라우저 지원 하드코딩 금지)에 비춰 검증한다.[](source:p2)
- 코드 예제는 완결되고 실제 브라우저에서 throw 없이 돌아야 한다. 본문이 fallback이나 제약(reduced motion 등)을 권하면 예제가 반드시 그것을 구현해야 한다(MUST).[](source:p2)

3단계는 `expectations.md`를 `guide.md`, `demo.html`, 1차 사양(W3C, WHATWG, CSSWG), MDN, BCD와 대조한다. 규칙은 `project-guides`의 expectations 절과 `project-evals`의 8 red line을 따른다. SME 문구는 의미가 바뀔 때만 고치고 이유를 적는다.[](source:p3)[](source:guides-ref)[](source:evals-red)

| 점검 | 확인하는 것 |
|---|---|
| 추적성·강도 | 각 expectation을 guide의 절에 대응시킨다. guide에 없는 것, "Prefer"나 snippet 세부를 필수로 올린 것, "preceding"을 "immediately before"로 좁힌 것, guide의 예제나 demo가 스스로 실패하는 규칙을 표시한다.[](source:p3) |
| 실행 가능성 | 각 expectation을 충족하는 방법이 guide에 명확히 있어야 한다. 에이전트가 구현을 추측하면 안 된다.[](source:p3) |
| 사양·BCD | guide도 틀릴 수 있다. 유효한 대안을 거부하는 expectation, 폐기·개명된 문법(`masonry` 대 `grid-lanes`, `interesttarget` 대 `interestfor`), 단위·속성 edge case, 잘못된 기능 감지 문자열을 찾는다. guide 오류는 expectation 문제와 따로 보고한다. grader에 맞추려고 `guide.md`를 고치지 않는다.[](source:p3) |
| 내부·교차 일관성 | bullet끼리의 모순과 중복, 같은 task에서 함께 검색되는 다른 guide와의 충돌을 표시한다.[](source:p3) |
| 누락 | guide의 DO·DO NOT·결정 트리, 접근성, overflow, focus 순서, fallback과 demo 동작 중 대응 bullet이 없는 것을 찾는다. 테스트하기 어렵다고 요구를 빼지 않는다.[](source:p3) |
| 불필요 | guide에 없는 것, 선택·"Prefer", Widely Available 기능의 fallback, 중복, 주관적이거나 검사 불가능한 것, 대상 앱에 맞지 않는 것, 올바른 코드를 거부할 만큼 엄격한 것을 자른다.[](source:p3) |

expectation은 `gd dev`가 grader 테스트를 쓰는 관점으로도 읽는다. 그 테스트는 모든 golden solution patch를 통과하고 zero-passrate patch는 실패시켜야 한다.[](source:p3)

| 검사 | 질문 |
|---|---|
| Clear | 자명한 용어로 쓴 평서문이고, 해석이 하나뿐인가? `MUST`·`SHOULD` 상투 표현이 없는가?[](source:grader-read) |
| Succinct | bullet 하나에 요구 하나인가?[](source:grader-read) |
| Scoped | 이 use case의 모든 올바른 구현이 만족하는가? discipline guide bullet이면 대상 요소·기능을 이름으로 적었는가?[](source:grader-read) |
| Correct | guide와 사양·MDN·BCD에 맞고 유효한 대안을 거부하지 않는가?[](source:grader-read) |
| Achievable | 서로 다른 에이전트가 쓴 golden solution이 모두 만족하는가? 예시 값이나 "such as"에 과적합되지 않는가?[](source:grader-read) |
| Gradable | 사람 판단이나 사이트 전용 locator 없이 DOM, CSSOM, JS AST, computed style, accessibility tree, 런타임 동작으로 검증할 수 있는가?[](source:grader-read) |

## DevTools 시험, 수동 확인, 보고는 어떻게 하나? {#test-report}

4단계는 항상 DevTools MCP로 한다. 사용자가 직접 조작하지 않아도 자동으로 시험하기 위해서다.[](source:devtools)

@steps id=test-steps
| server | 로컬 서버 먼저 | 브라우저를 열기 전에 가벼운 HTTP 서버(`python3 -m http.server 8080` 또는 `npx http-server`)를 background로 띄운다. `file:///` 프로토콜 문제를 피하고 polyfill과 모듈이 제대로 로드되게 한다.[](source:steps) |
| load | demo 열기 | `mcp_chrome-devtools-mcp_new_page`로 `http://localhost:8080/demo.html` 같은 서버 URL을 연다.[](source:steps) |
| exercise | 전부 조작 | use case의 모든 구석과 옵션을 `mcp_chrome-devtools-mcp_click`, `mcp_chrome-devtools-mcp_type_text` 등으로 시험한다.[](source:steps) |
| reconcile | 정렬 확인 | demo 동작이 guide와 어긋나면 어느 쪽을 고칠지 사용자에게 맞춰 달라고 요청한다.[](source:steps) |
| stop | 깨졌으면 중단 | 기대 동작을 못 보이거나 치명적 오류가 있으면 STOP이다. 수동 확인으로 넘어가지 않고 고치거나 보고서에 적는다.[](source:steps) |

Baseline 기준은 demo가 항상 widely available 상태를 목표로 하는 것이다. 기능 상태는 `web-baseline` 스킬과 `gd baselinestatus <query>`(또는 `pnpm baselinestatus <query>`)로 조회한다. 기능이 widely available 상태가 아니면 demo가 guide의 fallback 전략을 반드시 보여 줘야 한다(MUST).[](source:baseline)

수동 확인은 자동 시험을 통과했거나 DevTools가 못 하는 cross-browser 시험이 필요할 때만 한다. 에이전트는 사용자에게 로컬 서버 URL과 단계별 조작 방법, 성공·실패를 판별하는 관찰 항목을 알려 준다.[](source:manual)

| 환경 | 원문의 요구 |
|---|---|
| 지원 브라우저 | DevTools MCP의 대상은 Chrome이다. 사용자도 서버 링크로 직접 해 보라고 권한다.[](source:manual) |
| 미지원 브라우저 | `gd baselinestatus <query>`로 지원하지 않는 브라우저를 찾아, fallback이 동작하는지 시험해 보도록 제안한다.[](source:manual) |
| 막 Baseline이 된 기능 | 미지원 버전을 찾기 어려우면 코드의 기능 감지와 fallback 논리를 정적으로 평가하도록 안내한다.[](source:manual) |
| 성공 기준 | demo가 올바른 구현임을 사용자가 스스로 납득하는 방법을 설명한다.[](source:manual) |

다음 세 가지 실패 패턴을 주의해서 본다.[](source:failures)

- Safari의 `ReferenceError: Can't find variable: Temporal`은 polyfill 동적 로드와 앱 실행의 race, 또는 `file:///` 제한이 원인인 경우가 많다.[](source:failures)
- polyfill을 일반 `<script>` 태그로 무조건 로드하면 프로젝트 기준을 어긴다. 조건부로 로드해야 한다.[](source:failures)
- `typeof Temporal === 'undefined'` 같은 문법을 강요하는 expectation은 기능적 결과가 아니라 구현 방식을 정해 버린다.[](source:failures)

6단계 보고서는 발견 사항(expectation과 demo 동작)을 알리고, 치명적 문제(예: guide는 조건부 로드라고 하는데 polyfill이 무조건 로드됨)에 집중한다. 정확성이나 사용자 경험에 영향이 없는 사소한 지적은 생략한다. 문제가 있으면 수정 권고를 분명히 쓰고, demo가 자동·수동 검증을 통과했는지 실패했는지 상태를 적는다.[](source:report)

@callout level=warning title="자동 검증은 사람 승인을 대신하지 않는다"
| 에이전트의 자동 검증은 `GOVERNANCE.md`와 `docs/ATLS.md`가 요구하는 사람 SME 검토를 보완할 뿐 대체하지 못한다.[](source:human) |

## 다른 스킬과 어디에서 이어지나? {#position}

@workflow id=position-flow title="작성에서 검증, 기준 문서로"
| writer | project-guides | backend | source:guides-pre |
| current | project-guide-validation | backend | source:intro |
| evals | project-evals | backend | source:evals-red |
| baseline | baseline-status | backend | source:base-skill |
| writer > current | 자체 검증 | emphasis |
| current > evals | 기준 참고 | dashed |
| current > baseline | 조회 | dashed |

@steps id=position-steps
| highlight | project-guide-validation | 이 페이지의 스킬이다. 작성이 끝난 뒤 PR이나 Stage 3 전에 쓰고, 기준 문서를 참고한다.[](source:intro)[](source:guides-pre) | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R05 · 넘김(앞) | `project-guides`가 세 파일을 쓴 뒤 이 스킬을 invoke하라고 한다(명령형). 이 스킬은 "strongly encouraged"라고 쓴다. 받는 것은 `guide.md`, `demo.html`, `expectations.md`, 넘기는 것은 피드백 보고서다.[](source:guides-pre)[](source:intro) |
| R08, R09 · 참고 | 정성 검토와 expectation 정렬의 기준으로 `project-guides`와 `project-use-cases`를 링크한다.[](source:p2)[](source:p3) |
| R10 · 참고 | expectation 검토는 `project-evals`의 8 red line을 따른다.[](source:p3)[](source:evals-red) |
| R11 · 참고 | `DISCIPLINE_GUIDES`에 등록된 discipline guide가 있으면 준수 여부를 확인하고, 새 orientation guide는 그 목록에 더한다.[](source:disc)[](source:disc-skill) |
| R12 · 참고 | 기능 상태를 조회할 때 `web-baseline` 링크와 명령을 쓴다. 이 컬렉션에는 `web-baseline/` 폴더가 없고, `skills-lock.json`의 `skillPath`가 가리키는 `baseline-status`로 읽었다. 명령 `pnpm baselinestatus`는 두 문서에서 일치한다.[](source:baseline)[](source:base-skill)[](source:lock) |
| R32 · 같은 계열 | 이 스킬과 `coherence-auditor`가 둘 다 `guides-integrity.test.ts`를 돌린다. 연결을 지시한 문장은 없다.[](source:p1)[](source:auditor) |
| R35, R36 · 범위 밖 | `GOVERNANCE.md`, `docs/ATLS.md`, 접근성 기준 guide는 원본 저장소 파일이라 이 컬렉션에서 확인하지 못했다.[](source:human)[](source:a11y) |

전체 흐름은 색인 기준 `_group-guide-authoring-pipeline/guide-authoring-pipeline.html`에 있다(묶음 페이지는 아직 만들지 않았다).

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `modern-web-guidance-src/project-guide-validation/SKILL.md` 1개, 14,156B, 111줄을 끝까지 읽었다.[](source:full) |
| 관계 대조 | 인접 스킬 `project-guides`, `project-evals`, `baseline-status`, `project-discipline-guides`, `coherence-auditor`에서 관계가 인용한 줄만 읽었다. 원장 R05, R10, R11, R12, R32의 근거와 일치했다. |
| 설치 출처 | `skills-lock.json`의 `project-guide-validation` 항목은 `skillPath`가 `.agents/skills/project-guide-validation/SKILL.md`다.[](source:lock) |
| 제외 | 이 스킬 폴더에는 `SKILL.md` 외 파일이 없다. 번역본과 바이너리도 없다. |
| 부분 읽음 | 0개. 인접 스킬 5개는 필요한 줄만 읽었고 전부 읽지 않았다. |

원문의 활성화 설명, 6단계 순서, 사람 SME 승인, 접근성 MUST, STOP 조건, 수동 확인 조건, 검사 6개와 red line 8개를 모두 대조했다.

@callout level=open-question title="원문에 명시 없는 부분과 확인하지 못한 부분"
| 원문에는 4단계에서 띄운 로컬 서버를 끄는 단계가 없다. 검증 중 에이전트가 파일을 직접 고치는지도 명시가 없다. 3단계는 expectation 문구를 "고칠 때"의 조건(의미가 바뀔 때만, 이유를 적는다)만 적고, 4단계는 "고치거나 보고서에 적는다"라고 쓴다. DevTools MCP 서버와 `gd`, `pnpm build`, `node --test`는 이 컬렉션 밖이라 실행하지 않았고 동작도 확인하지 못했다. |

분석 중 원본은 수정하지 않았다. 원문의 명령과 도구 호출은 분석 자료로만 읽었다.
