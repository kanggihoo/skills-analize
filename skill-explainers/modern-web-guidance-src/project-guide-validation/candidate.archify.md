# project-guide-validation — 쓴 guide·demo·expectations를 DevTools MCP와 체크리스트로 검증 {#overview}

`project-guide-validation`은 에이전트가 쓴 `guide.md`, `demo.html`, `expectations.md`를 6단계 체크리스트로 검증하게 하는 스킬이다. 자동 검증, 접근성과 모범 사례 검토, DevTools MCP로 demo 실행, 사용자와 수동 확인을 거쳐 피드백 보고서를 낸다.[](source:gv-intro)[](source:gv-list)

- 쓰는 때: 새 guide를 PR 전에 스스로 검증할 때, 또는 guide·demo·expectations 검증을 맡았을 때다. Stage 2에서 쓴 뒤 검증하길 "strongly encouraged"로 권한다.[](source:gv-front)[](source:gv-intro)
- 결과: 발견한 내용, 핵심 문제, 권고, demo의 자동·수동 검증 통과 여부를 담은 피드백 보고서다.[](source:gv-s6)
- 다른 스킬과의 관계: `project-guides`가 다 쓴 뒤 이 스킬을 쓰라고 안내한다(다음 안내). 이 스킬은 `project-guides`, `project-use-cases`, `project-evals`, `project-discipline-guides`, `baseline-status`를 참고한다(참고).[](source:gv-s2)[](source:gv-s3)
- 하지 않는 것: 사람 SME 검토를 대체하지 않는다. 자동 테스트가 실패하면 수동 검증으로 넘어가지 않고 멈춘다.[](source:gv-sme)[](source:gv-s4)

@answer scope="modern-web-guidance-src/project-guide-validation · 원본 파일 1개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source gv-front title="이름과 description" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=1:4
@source gv-intro title="소개" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=6:8
@source gv-sme title="사람 SME 검토" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=10:10
@source gv-list title="체크리스트 6단계" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=12:21
@source gv-s1 title="1단계 파악과 자동 검증" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=25:30
@source gv-s2 title="2단계 정성 검토" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=32:42
@source gv-s3 title="3단계 expectation 정렬" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=44:64
@source gv-s4 title="4단계 DevTools MCP 검증" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=66:80
@source gv-s5 title="5단계 수동 검증" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=82:101
@source gv-s6 title="6단계 피드백 보고서" path=modern-web-guidance-src/project-guide-validation/SKILL.md lines=103:111
@source pg-self title="project-guides의 자체 검증 안내" path=modern-web-guidance-src/project-guides/SKILL.md lines=166:168
@source pg-front title="project-guides 이름과 소개" path=modern-web-guidance-src/project-guides/SKILL.md lines=1:12
@source uc-front title="project-use-cases 이름과 소개" path=modern-web-guidance-src/project-use-cases/SKILL.md lines=1:14
@source pe-red title="project-evals의 8 red line" path=modern-web-guidance-src/project-evals/SKILL.md lines=31:46
@source dg-front title="project-discipline-guides 이름과 소개" path=modern-web-guidance-src/project-discipline-guides/SKILL.md lines=1:14
@source bs-front title="baseline-status 이름과 명령" path=modern-web-guidance-src/baseline-status/SKILL.md lines=1:25
@source ca-checks title="coherence-auditor의 검사 목록" path=modern-web-guidance-src/coherence-auditor/SKILL.md lines=28:35
@source lock title="설치 기록의 baseline-status 항목" path=modern-web-guidance-src/skills-lock.json lines=3:8

## 어떻게 동작하나 {#flow span=12}

원문은 체크리스트 6단계를 번호로 지시한다. 4단계에서 자동 검증이 깨지면 5단계를 건너뛰고 멈춘다는 분기가 원문에 있어 그림에 판단 노드로 그렸다. 2~3단계의 세부 점검 항목(접근성 세 갈래, expectation 6가지 점검)은 상세 후보로 보냈다.[](source:gv-s4)[](source:gv-s5)

@workflow id=flow-diagram title="project-guide-validation 흐름"
| lane read | 읽고 검토 |
| lane run | 실행 |
| lane out | 보고 |
| fam | 파악과 자동 검증 | backend | read | source:gv-s1 |
| qual | 정성 검토 | backend | read | source:gv-s2 |
| align | expectation 정렬 | backend | read | source:gv-s3 |
| auto | DevTools MCP로 demo 실행 | backend | run | source:gv-s4 |
| ok | 자동 검증 통과? | backend | run | source:gv-s4 |
| manual | 수동 검증 안내 | backend | run | source:gv-s5 |
| report | 피드백 보고서 | backend | out | source:gv-s6 |
| fam > qual | |
| qual > align | |
| align > auto | |
| auto > ok | |
| ok > manual | 통과 | emphasis |
| ok > report | 실패, 멈춤 | dashed |
| manual > report | |

@steps id=flow-steps
| s-fam | 파악과 자동 검증 | **입력** 검증할 `guide.md` · **실행** `node --test src/authoring/guides-integrity.test.ts`(macro를 썼으면 `pnpm build` 뒤 `out/build/skills-cli/guides/<category>/<slug>.md`도 본다) · **출력** 자동 검증 결과와 guide 이해. **처리** 에이전트가 `guide.md` 전체를 읽고 frontmatter, `web-feature-ids`, markdown, macro, grader expectation 범위를 자동 검증 suite로 확인한다.[](source:gv-s1) **다음** PR 검토면 기존 review thread를 먼저 보고 `BASE`와 `HEAD`를 bullet·코드 블록 단위로 비교한다. | flow-diagram | fam |
| s-qual | 정성 검토 | **입력** `guide.md`, `demo.html`, `expectations.md` · **참조** `project-use-cases`, `project-guides`, `guides/accessibility/accessibility/guide.md` · **출력** 정성 검토 발견 사항. **처리** 에이전트가 작성 기준에 대어 discipline guide 준수, 접근성, 내부 일관성, copy-paste 안전을 본다.[](source:gv-s2) **다음** 접근성은 항상 평가해야 한다(MUST). `guide.md`는 해당 규칙을 모두 따라야 하고, `demo.html`은 guide가 요구한 패턴만 보이면 된다. | flow-diagram | qual |
| s-align | expectation 정렬 | **입력** `expectations.md`, `guide.md`, `demo.html` · **참조** `project-guides`의 expectations 규칙, `project-evals`의 8 red line · **출력** 오류·누락·불필요 항목과 bullet별 판독. **처리** 에이전트가 거짓 실패(옳은 코드를 거부)와 거짓 통과(망가진 코드를 통과)를 막도록, 추적성, 실행 가능성, spec 정확성, 일관성, 누락, 불필요를 본다.[](source:gv-s3) **다음** `guide.md`의 오류는 expectation 문제와 따로 보고한다. guide를 grader에 맞추려고 고치지 않는다. | flow-diagram | align |
| s-auto | DevTools MCP로 demo 실행 | **입력** `demo.html` · **실행** `python3 -m http.server 8080`(또는 `npx http-server`)을 background로, 이어서 DevTools MCP의 `mcp_chrome-devtools-mcp_new_page`로 `http://localhost:8080/demo.html`을 연다 · **출력** demo 동작 결과. **처리** 에이전트가 local 서버로 demo를 서빙해 열고, 모든 옵션과 가장자리 경우를 `mcp_chrome-devtools-mcp_click`, `mcp_chrome-devtools-mcp_type_text` 등으로 조작한다.[](source:gv-s4) **다음** demo 동작이 guide와 어긋나면 어느 쪽을 고칠지 사용자에게 도움을 청한다. | flow-diagram | auto |
| s-ok | 자동 검증 통과? | **입력** DevTools MCP 검증 결과 · **출력** 통과 또는 중단. **처리** 에이전트가 기대 동작을 보였는지, 치명적인 정확성 문제가 없는지 판단한다.[](source:gv-s4) **다음** 실패하면 수동 검증으로 가지 않는다(STOP). 문제를 고치거나 보고서에 쓴다. | flow-diagram | ok |
| s-manual | 수동 검증 안내 | **입력** local 서버 URL · **출력** 사용자가 따라 할 단계별 안내. **처리** 에이전트가 링크를 주고, 클릭할 곳과 확인할 것을 안내하며, 지원하는 browser와 지원하지 않는 browser(`gd baselinestatus <query>`로 확인)에서의 fallback 동작 확인을 권한다.[](source:gv-s5) **다음** 자동 검증이 통과했거나 DevTools가 못 보는 cross-browser 시험이 필요할 때만 진행한다. | flow-diagram | manual |
| s-report | 피드백 보고서 | **입력** 검증 결과 · **출력** 구조화된 피드백 보고서. **처리** 에이전트가 발견 내용을 요약하고 핵심 문제를 강조하며(사소한 지적은 무시) 권고를 하고 demo가 자동·수동 검증을 통과했는지 밝힌다.[](source:gv-s6) | flow-diagram | report |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령은 원문에 명시 없음. 모델이 description을 보고 켠다. 호출 제한 필드는 없다[](source:gv-front) |
| 성격 | 체크리스트 6단계로 guide 세트를 검증하는 절차형 스킬. Stage 2 자체 검증이다 |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `project-guides` {#r05} | **이 스킬** | 다음 안내 | 세 파일을 다 쓴 뒤 PR을 열거나 Stage 3으로 가기 전에 invoke하라고 한다(명령형). 이 스킬은 "strongly encouraged"라고 쓴다. 사람 SME 검토를 대체하지 않는다.[](source:pg-self)[](source:gv-intro)[](source:gv-sme) |
| **이 스킬** {#r08} | `project-guides` | 참고 | 정성 검토와 expectation 정렬의 기준 문서로 링크한다. token economy, `{# ... #}` 주석, `BASELINE_STATUS` 규칙을 이 문서 기준으로 본다.[](source:gv-s2)[](source:gv-s3)[](source:pg-front) |
| **이 스킬** {#r09} | `project-use-cases` | 참고 | guide를 `project-use-cases`와 `project-guides`의 작성 기준에 대조하라고 한다.[](source:gv-s2)[](source:uc-front) |
| **이 스킬** {#r10} | `project-evals` | 참고 | expectation 검토 때 8 red line을 따르라고 한다. SME 문구는 의미가 바뀔 때만 고치고 이유를 적는다.[](source:gv-s3)[](source:pe-red) |
| **이 스킬** {#r11} | `project-discipline-guides` | 참고 | 해당 분야의 discipline guide가 `DISCIPLINE_GUIDES`에 있으면 그것을 따르는지 확인하고, 새 orientation guide는 그 목록에 추가해야 한다.[](source:gv-s2)[](source:dg-front) |
| **이 스킬** {#r12} | `baseline-status` | 참고 | 기능이 widely available인지 조회할 때 `web-baseline` 스킬과 `gd baselinestatus` 또는 `pnpm baselinestatus`를 쓰라고 한다. 링크의 `web-baseline` 폴더는 이 컬렉션에 없고 `skills-lock.json`의 `skillPath`가 `baseline-status`를 가리켜 같은 스킬로 읽었다(판정).[](source:gv-s4)[](source:bs-front)[](source:lock) |
| `coherence-auditor` {#r32} | **이 스킬** | 대안 | 둘 다 `node --test src/authoring/guides-integrity.test.ts`를 실행한다. 연결을 지시한 문장은 없다.[](source:ca-checks)[](source:gv-s1) |
| **이 스킬** {#r36} | `guides/accessibility/accessibility/guide.md` | 참고 | 접근성은 항상 평가한다(MUST). 이 문서를 먼저 읽고 `guide.md`는 해당 규칙을 모두 따라야 한다. 범위 밖이다.[](source:gv-s2) |

@architecture id=relation-map title="project-guide-validation과 이어지는 스킬"
| pg | project-guides | backend |
| self | project-guide-validation(이 스킬) | backend |
| uc | project-use-cases | backend |
| pe | project-evals | backend |
| dg | project-discipline-guides | backend |
| bs | baseline-status | backend |
| ca | coherence-auditor | backend |
| pg > self | 다음 안내 | emphasis |
| self > pg | 참고 | dashed |
| self > uc | 참고 | dashed |
| self > pe | 참고 | dashed |
| self > dg | 참고 | dashed |
| self > bs | 참고 | dashed |
| ca > self | 대안 | dashed |

@code source=gv-front language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 체크리스트 6단계와 점검 표, 보고 지침을 담은 유일한 파일이다 | guide를 자체 검증하거나 검토할 때 읽는다 | 파악과 자동 검증, 정성 검토, expectation 정렬, DevTools MCP로 demo 실행, 자동 검증 통과?, 수동 검증 안내, 피드백 보고서 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 검증을 맡았을 때 | 체크리스트 task 목록을 만들고 각 단계를 완료한다 | [](source:gv-list) |
| 접근성 | 항상 평가한다(MUST). `guide.md`는 규칙을 모두 따르고, `demo.html`은 guide가 요구한 패턴만 보이면 되며, `expectations.md`는 grader가 확인할 수 있는 접근성 패턴만 담는다 | [](source:gv-s2) |
| demo | 반드시 DevTools MCP로 테스트한다(Always). local 서버로 먼저 서빙하고 `file:///`을 쓰지 않는다 | [](source:gv-s4) |
| demo의 baseline 대상 | widely available로 가정한다. 기능이 widely available가 아니면 guide의 fallback을 demo가 보여야 한다(MUST) | [](source:gv-s4) |
| 자동 검증 실패나 치명적 정확성 문제 | 멈춘다(STOP). 수동 검증으로 가지 않는다 | [](source:gv-s4) |
| 수동 검증 | 자동 검증이 통과했거나 DevTools가 못 다루는 cross-browser 시험이 필요할 때만 한다 | [](source:gv-s5) |
| 기술적 정확성에 영향 없는 사소한 지적 | 보고서에서 무시한다 | [](source:gv-s6) |
| 사람 SME 검토 | 자동 검증은 이를 대체하지 않는다(사람 승인) | [](source:gv-sme) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 접근성 검토 기준 — 정성 검토 · 개요에는 MUST 조건만 담았다. 파일별(`guide.md`, `demo.html`, `expectations.md`) 요구 차이와 copy-paste 안전 항목은 상세로 남긴다.
- expectation 정렬 점검 — expectation 정렬 · 개요에는 목표만 담았다. 추적성, spec·BCD 검증, 누락·불필요, grader 판독 6항목(Clear, Succinct, Scoped, Correct, Achievable, Gradable)은 상세로 남긴다.
- 수동 검증과 흔한 실패 패턴 — 수동 검증 안내 · Safari의 `Temporal` `ReferenceError` 등 세 패턴은 상세로 남긴다.

@callout level=open-question title="확인하지 못한 것"
| `src/authoring/guides-integrity.test.ts`, `src/core/guide-validation.ts`, `guides/accessibility/accessibility/guide.md`와 DevTools MCP 서버는 이 컬렉션에 없다. 각 단계의 실행 결과는 확인하지 못했고 명령은 모두 지시상 동작이다. |

읽은 원본: 텍스트 파일 1개. 제외: 없음.
