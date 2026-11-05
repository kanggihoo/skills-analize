# egm 관계 원장
분석 커밋: d494974308338f864c9e91e94067a31d33d3543e

- 범위: `egm/` 아래 `SKILL.md` 7개. 원격 출처는 모두 `google/elephant-goldfish-model`(ref `main`)이고, lock은 `egm/skills-lock.json`이다. 읽은 텍스트 파일은 38개다(스킬마다 `SKILL.md`, `test_scenarios.yaml`, `TEST.md`, `agents/openai.yaml`, `assets/icon.svg`, 그리고 `egm-bootstrap`의 `references/` 2개, `egm-draft`의 `references/design_doc.md`). 바이너리는 없다.
- **최신화와 커밋**: 분석을 시작할 때 `scripts/update-skill.py egm/skills-lock.json`으로 7개를 최신본으로 받았다. 6개가 바뀌었고 `egm-drift-report`만 그대로였다(14개 파일, +251/−54줄). `@source path=`가 커밋된 원문을 요구해서, 사용자 승인을 받아 `egm/`만 local commit(`d494974`)했다. push는 하지 않았다.
- 번역본: 이 컬렉션에는 없다(`SKILL.KO.md`, `README.ko.md` 같은 파일 없음).
- 원문 비교: 이 7개와 이름이 같은 스킬은 다른 컬렉션에 없다(`find`로 확인). 그래서 원문 비교 칸은 모두 `-`다.
- 분석 대상에서 뺀 것: `egm/.archify/explainer-egm-skill-map-20261031-085659/`는 예전 형식으로 만든 산출물이다. 스킬 파일이 아니라서 읽지 않았다.
- 외부 의존(저장소에 없음): 일곱 스킬 모두 첫머리에서 `docs/codex.md`(`../../docs/codex.md`), `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`를 먼저 읽으라고 한다. 세 스킬은 `docs/harnesses.md`도 가리킨다. 서브에이전트 정의는 `agents/<파일>.md`(예: `agents/synthesizer.md`)에 있다고 하는데, 스킬 폴더의 `agents/`에는 `openai.yaml`만 있다. `egm-draft`의 `resources/execution_instructions.md`와 `egm-review-loop`의 `resources/document_standards/*.md`도 폴더에 없다. 원문이 적은 경로 그대로 해석했을 때 없는 파일이라 `불명`으로 둔다. upstream 저장소에 있는지는 확인하지 않았다.
- 조사 상태 표기: `부분`은 스킬의 핵심 동작을 정하는 자료(서브에이전트 정의, 기준 문서, 필수 지시 파일)를 확인하지 못했다는 뜻이다. 일곱 스킬 공통인 `docs/*.md` 안내문은 각 페이지 감사 패널에 따로 적고 `부분` 판정에는 넣지 않았다. `egm-resolve`와 `egm-drift-report`는 이런 핵심 자료가 따로 없어서 `완료`다.
- 호출 제한: 일곱 스킬 모두 `disable-model-invocation: true`다(각 `SKILL.md` 4줄). 모델이 `description`을 보고 스스로 켜지 않고 사용자가 이름으로 불러야 켜진다.
- 용어: `Elephant`는 이전 대화를 기억하는 메인 에이전트, `Goldfish`는 새 컨텍스트에서 시작하는 리뷰 서브에이전트다. 원문 정의는 `egm-review-loop` 24~27줄에 있다.

## 스킬

| 경로 ID | 한 줄 요약 | 조사 상태 | 원문 비교 | 소속 묶음 | 역할 |
|---|---|---|---|---|---|
| egm/egm-brainstorm | 반쯤 굳은 아이디어를 질문과 여러 관점의 Goldfish 리뷰로 다듬어 `concepts_brief.md` 요약문으로 만든다 | 부분 | - | idea-to-design | 단계 |
| egm/egm-draft | `concepts_brief.md`를 읽고 설계 문서를 절마다 사용자 승인을 받으며 써서 저장한다 | 부분 | - | idea-to-design | 단계 |
| egm/egm-review | 설계 문서를 5단계로 나눠 새 컨텍스트 리뷰어들에게 점검시키고 보고서를 쓴다 | 부분 | - | idea-to-design, review-and-fix | 단계 |
| egm/egm-review-loop | 리뷰어를 띄워 지적을 모으고 고치는 일을 라운드로 반복하다 두 번 연속 깨끗하면 멈춘다 | 부분 | - | review-and-fix | 단계 |
| egm/egm-resolve | 리뷰 지적을 반박·상향·수정·기각으로 분류해 보고서를 쓰고, 승인된 수정만 문서에 적용한다 | 완료 | - | review-and-fix | 단계 |
| egm/egm-bootstrap | 디렉터리 트리 전체에 코드 근거로 쓴 README 계약 파일을 만들거나 고친다 | 부분 | - | contract-and-drift | 단계 |
| egm/egm-drift-report | 설계 문서나 README와 실제 코드를 비교해 어긋난 곳만 보고서에 쓴다 | 완료 | - | contract-and-drift | 단계 |

## 관계

출처 표기는 `스킬폴더/파일:줄`이다. 파일을 생략하면 그 스킬의 `SKILL.md`다. 줄 번호는 커밋 `d494974` 기준이다. 해석 상태가 `범위 밖`이면 대상이 컬렉션 밖의 에이전트 정의나 문서라는 뜻이고, `불명`이면 원문이 적은 경로에 파일이 없다는 뜻이다.

### 아이디어에서 설계 문서까지

| rel-id | from | to | 종류 | 근거 방식(명시-이름/명시-역할/추론/미확인) | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r01 | egm-brainstorm | egm-draft | 넘김 | 명시-이름 | 4단계 마지막 선택지(질문 하나, `(Recommended)` 표기 없음)에서 사용자가 `Proceed to egm-draft`를 고르면, 에이전트는 `concepts_brief.md`가 저장돼 있는지 확인하고 사용자에게 `egm-draft`를 시작하라고 안내한다. `egm-draft`가 `concepts_brief.md`를 우선순위 1 입력으로 자동으로 읽는다고도 알려 준다. 에이전트가 직접 시작한다는 말은 원문에 명시 없음 | `concepts_brief.md`(작업 폴더 또는 artifact 폴더) | - | 범위 내 | egm-brainstorm:256-263; egm-draft:146-149 |
| r02 | egm-brainstorm | egm-draft | 넘김 | 명시-이름 | 사용자가 `Publish concepts_brief.md as RFC`를 고르면 `docs/designs/<feature_name>.md`에 쓰고, `docs/designs/SITEMAP.md`가 있으면 거기에 등록한다. 팀 피드백을 받은 뒤 그 파일을 대상으로 `egm-draft`를 시작할 수 있다고 사용자에게 상기시킨다. 시작은 사용자가 한다 | `docs/designs/<feature_name>.md` | - | 범위 내 | egm-brainstorm:245-255; egm-draft:73-78 |
| r03 | egm-brainstorm | egm-draft | 산출물 호환 | 명시-이름 | brainstorm은 `Alternatives Weighed` 절에 기각한 선택지와 기술적 이유를 적는다. 그 절이 `egm-draft`가 `Alternatives Considered`를 쓸 때 쓰는 유일한 출처라고 적는다. draft 4단계는 그 절을 읽고, 절이 없으면 사용자에게 묻는다 | `concepts_brief.md`의 `Alternatives Weighed` 절 | - | 범위 내 | egm-brainstorm:200-203; egm-draft:203-206 |
| r04 | egm-draft | egm-brainstorm | 넘김 | 명시-이름 | 제안형. `Context File`이 없고 `concepts_brief.md`도 `discussion_summary.md`도 없을 때(우선순위 3)만, 채팅으로 문제·목표를 묻거나 `egm-brainstorm` 시작을 제안한다. `discussion_summary.md`를 읽는 경우(우선순위 2)에는 brainstorm을 권하거나 폐기 경고를 하지 않는다 | - | - | 범위 내 | egm-draft:144-160 |
| r05 | egm-draft | egm-review | 넘김 | 명시-이름 | 6단계 마지막에 완성한 설계 문서 링크를 주고, `egm-review`를 `<DESIGN_PATH>`에 시작하라고 권한다. 시작은 사용자가 한다 | `<DESIGN_DIR>/<FEATURE>.md` | - | 범위 내 | egm-draft:317-321; egm-review:73-74 |
| r06 | egm-draft | egm-review | 참고 | 명시-이름 | draft 6단계는 Zoom Out 기준으로 자기 초안을 채점하지 않는다고 적는다. 그 점검은 `egm-review` Stage 5가 새 컨텍스트에서 한다고 가리킨다 | - | - | 범위 내 | egm-draft:257-260; egm-review:287-289 |
| r07 | egm-brainstorm | egm-draft | 공유 상태 | 명시-이름 | 둘 다 `docs/designs/`를 쓴다. brainstorm은 RFC 게시 때만, draft는 6단계 저장 때 쓴다. 둘 다 `SITEMAP.md`가 있으면 등록한다. draft는 저장 폴더를 `Context File` 폴더, `docs/designs/`, `<project>/docs/designs/` 순으로 찾고 사용자에게 확인받는다. 선후 관계는 없다 | `docs/designs/`, `docs/designs/SITEMAP.md` | - | 범위 내 | egm-brainstorm:245-249; egm-draft:277-312 |
| r15 | egm-brainstorm | egm-synthesizer | 내부 위임 | 명시-이름 | 사용자가 readiness 게이트에서 `Review with Goldfishes`를 고른 뒤에만 띄운다. 프롬프트는 `Mode: BRAINSTORM`과 리뷰어 6명(`egm-design`, `egm-codebase-details`, `egm-zoom-out`, `egm-comprehension`, `egm-implementation-readiness`, `egm-structural`)을 지정한다. 서브에이전트 도구가 없으면 멈추고 사용자에게 알린다 | 확정된 가설 요약, 지적 목록 | - | 범위 밖 | egm-brainstorm:34-36,156-172 |
| r22 | egm-brainstorm | egm-draft | 같은 계열 | 추론 | 두 스킬의 Execution Constraints가 같은 규칙 묶음이다. 파일 먼저 쓰기, 쉬운 영어, 맞장구 금지, 비판 먼저, 사과 금지, 질문 하나씩이다. 두 본문을 비교해 판단했다 | - | - | 범위 내 | egm-brainstorm:38-88; egm-draft:20-71 |
| r24 | egm-draft | resources/execution_instructions.md | 참고 | 명시-이름 | 의무형. "MUST read and apply"라고 적는다. 파일이 스킬 폴더에 없어서 내용을 확인하지 못했다 | - | - | 불명 | egm-draft:22-23 |

### 검토와 수정

| rel-id | from | to | 종류 | 근거 방식(명시-이름/명시-역할/추론/미확인) | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r08 | egm-review | egm-review-loop | 내부 위임 | 명시-이름 | 대화형 흐름에서 Stage 7은 `FeatureRange`에 리뷰어 `[egm-design, egm-structural, egm-style]`로, Stage 9는 `DetailedRange`에 `[egm-implementation-readiness, egm-codebase-details, egm-style]`로 같은 스레드에서 부른다. review-loop은 끝나면 실행을 review에 돌려준다. `Consolidated report` 흐름에서는 review-loop을 부르지 않고 synthesizer를 직접 띄운다(r11) | `TargetFile`, 줄 범위, 리뷰어, 기준 문서, `GoldfishContext` | - | 범위 내 | egm-review:369-374; egm-review:396-403; egm-review-loop:194-195 |
| r09 | egm-review | egm-resolve | 내부 위임 | 명시-이름 | Stage 7·9 중간 확인에서 사용자가 `Resolve findings with agent`를 고를 때만 부른다. 같은 Elephant 컨텍스트에서 실행하고, 고친 뒤 `TargetFile` 줄 범위를 다시 읽어 다음 단계로 가거나 같은 단계를 다시 감사한다(재감사는 최대 1회) | 지적 목록(`critic_report.md` 또는 `implementation_readiness_report.md`), 수정은 `TargetFile`에 직접 | - | 범위 내 | egm-review:252-262; egm-review:387-394; egm-review:416-424; egm-resolve:30-37 |
| r10 | egm-review-loop | egm-resolve | 내부 위임 | 명시-이름 | 라운드마다 2.3에서 `TargetFile`, 줄 범위, `FindingsList`를 넘겨 Elephant 컨텍스트에서 실행한다. resolve가 사람 결정에서 멈추면 loop 드라이버도 사용자가 확인할 때까지 기다린다(의무형). resolve는 끝나면 수락·반박·상향·기각·미해결 건수를 caller에게 돌려준다 | `FindingsList`, `goldfish_review_report.md` | - | 범위 내 | egm-review-loop:146-156,183-187; egm-resolve:185-187 |
| r11 | egm-review | egm-synthesizer | 내부 위임 | 명시-이름 | 서브에이전트 도구가 없으면 중단하고 "같은 컨텍스트의 리뷰는 Goldfish 리뷰가 아니다"라고 알린다. 중첩 서브에이전트를 못 쓰는 하니스는 synthesizer 대신 리뷰어를 직접 띄운다. `Consolidated report`에서는 Stage 5·7·8·9를 synthesizer에 맡긴다. Stage 6은 synthesizer를 쓰지 않고 `egm-comprehension`을 직접 띄운다(r12) | 지적 목록, 단계별 보고서 파일 | - | 범위 밖 | egm-review:19-28; egm-review:287-303 |
| r12 | egm-review | egm-comprehension | 내부 위임 | 명시-이름 | Stage 6에서 synthesizer를 거치지 않고 직접 띄운다. synthesizer 보고서는 지적만 남겨서 저자가 봐야 할 paraphrase(리뷰어가 문서를 자기 말로 다시 쓴 글)가 사라지기 때문이다. 문서 기준(standard)은 적용하지 않는다 | `comprehension_report.md` | - | 범위 밖 | egm-review:349-358 |
| r13 | egm-review | egm-zoom-out | 내부 위임 | 명시-이름 | Stage 5·8에서 `egm-synthesizer` 또는 `agents/zoom_out.md`의 `egm-zoom-out`을 전체 파일에 대해 띄운다. 기준은 `resources/document_standards/zoom-out-standard.md`다 | `zoom_out_report.md`, `intermediate_zoom_out_report.md` | - | 범위 밖 | egm-review:317-325 |
| r14 | egm-review-loop | egm-synthesizer | 내부 위임 | 명시-이름 | 기본 경로는 synthesizer를 띄워 리뷰어를 병렬로 돌리고 지적을 합쳐 보고서를 쓰게 하는 것이다. 대안은 리뷰어를 직접 띄우는 것이다. 요청한 리뷰어마다 `completed`/`not run` 상태를 받아야 한다 | 지적 목록, 상태 요약 | - | 범위 밖 | egm-review-loop:117-135 |
| r18 | egm-resolve | egm-review | 공유 상태 | 명시-이름 | resolve가 `goldfish_review_report.md`를 쓰고 끝에 `Status: resolved`를 붙인다. review는 resolve에 지적을 넘길 때 `critic_report.md`(또는 `goldfish_review_report.md`)에서 가져온다고 적는다 | `goldfish_review_report.md` | - | 범위 내 | egm-resolve:84-88,180-184; egm-review:387-390 |
| r19 | egm-review-loop | egm-review | 공유 상태 | 미확인 | review-loop은 synthesizer가 보고서를 쓴다고만 하고 파일 이름을 정하지 않는다. review는 같은 일을 `critic_report.md`, `implementation_readiness_report.md`로 부른다. 둘이 같은 파일인지 원문에 명시 없음 | `critic_report.md`, `implementation_readiness_report.md` | - | 범위 내 | egm-review-loop:119-123; egm-review:371-376 |
| r23 | egm-draft | egm-review | 같은 계열 | 추론 | 두 스킬의 Execution Constraints가 같은 규칙 묶음이다. 두 본문을 비교해 판단했다 | - | - | 범위 내 | egm-draft:20-71; egm-review:30-69 |
| r25 | egm-review-loop | resources/document_standards/*.md | 참고 | 명시-이름 | 리뷰어에 붙이는 기준 문서(`feature-spec-standard`, `implementation-readiness-standard`, `zoom-out-standard`, `heilmeier-standard`, `re-implementation-standard`)가 이 폴더에 있다고 적는다. 파일이 스킬 폴더에 없어서 내용을 확인하지 못했다 | - | - | 불명 | egm-review-loop:74-78 |

### 문서와 코드

| rel-id | from | to | 종류 | 근거 방식(명시-이름/명시-역할/추론/미확인) | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r16 | egm-bootstrap | egm-bootstrap-orchestrator | 내부 위임 | 명시-이름 | 정리 대상 폴더가 5개를 넘으면(`>5`) `agents/bootstrap_orchestrator.md`의 하위 오케스트레이터를 파티션마다 병렬로 띄운다. 일반 서브에이전트로 대신할 수 있다. 폴더가 15개를 넘으면 사용자 승인 뒤에만 띄운다 | 파티션 루트, `is_worker=true`를 담은 프롬프트 | - | 범위 밖 | egm-bootstrap:166-198 |
| r17 | egm-bootstrap | egm-bootstrap | 내부 위임 | 명시-이름 | 워커 모드. `is_worker=true`로 다시 실행되면 2·3단계를 건너뛰고 4단계(하위 트리 처리)로 간다. 끝나면 `worker-return.schema.json` 모양의 JSON(`subtree_index`)을 루트에 돌려주고 끝낸다 | `subtree_index` JSON | - | 범위 내 | egm-bootstrap:88-94,328-336; egm-bootstrap/references/worker-return.schema.json |
| r20 | egm-bootstrap | egm-drift-report | 넘김 | 명시-이름 | 5단계 마지막에 사용자에게 예·아니오를 묻는다. 사용자가 `Yes, run drift report on modified contracts`를 고르면 수정한 계약 파일에 `egm-drift-report`를 실행한다. 점검 대상은 문서에 적힌 method, route, enum, database table, invariant를 로컬 소스와 맞춰 보는 것이고, 불일치는 drift report에 기록해 사람이 분류한다. 원문은 이 스킬이 설계 문서용이지만 계약 파일에 변형 적용할 수 있다고 적는다. 선택하지 않으면 건너뛴다 | 수정한 계약 파일(`README.md` 또는 `target_filename`) | - | 범위 내 | egm-bootstrap:402-416; egm-drift-report:17-22 |
| r21 | egm-draft | egm-drift-report | 산출물 호환 | 추론 | draft가 저장하는 설계 문서(`<DESIGN_DIR>/<FEATURE>.md`, 기본 `docs/designs/`)가 drift-report 입력 조건(설계 문서가 든 디렉터리)에 맞는다. 두 스킬 어디에도 서로를 부르는 말이 없고, 필수 순서가 아니다 | 설계 문서 디렉터리 | - | 범위 내 | egm-draft:309-312; egm-drift-report:21-23 |
| r26 | egm-bootstrap | docs/codex.md | 참고 | 명시-이름 | 의무형. Codex나 ChatGPT Work에서 실행할 때 먼저 읽으라고 한다(Claude Code는 `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`). 같은 문구가 나머지 여섯 스킬에도 있다(egm-brainstorm:15-16, egm-draft:14-15, egm-review:14-15, egm-resolve:14-15, egm-review-loop:16-17, egm-drift-report:14-15). `../../docs/codex.md`는 `egm/egm-bootstrap/`에서 풀면 `docs/codex.md`인데 저장소에 `docs/`가 없다 | - | - | 불명 | egm-bootstrap:10-11 |

## 묶음

| group-id | 작업 목표 | 구성 스킬과 역할 | 그림 |
|---|---|---|---|
| idea-to-design | 반쯤 굳은 아이디어를 검토까지 마친 설계 문서로 만든다 | egm-brainstorm(단계), egm-draft(단계), egm-review(단계, 상세는 review-and-fix) | workflow 1개 + 공유 상태 표 |
| review-and-fix | 설계 문서를 새 컨텍스트 리뷰어로 점검하고 지적을 고친다 | egm-review(단계), egm-review-loop(단계), egm-resolve(단계) | workflow 1개 + sequence 1개 |
| contract-and-drift | 코드에 맞는 README 계약을 만들고 문서와 코드가 어긋난 곳을 찾는다 | egm-bootstrap(단계), egm-drift-report(단계) | workflow 1개 |
