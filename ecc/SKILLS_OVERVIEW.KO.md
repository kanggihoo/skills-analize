# ECC 스킬 개요

ECC 저장소의 스킬 **84개** 전체에 대한 개요와 설명입니다. 관심사 기준 필터링 결과는 `INTEREST_FILTER.md`를 참고하세요.

> 생성 방식: `GUIDE.md` 절차에 따라 12개 배치를 서브에이전트(Sonnet 5.5)가 분석하고(`partials/`), 결과를 병합했습니다. 분류는 병합 단계에서 7개 그룹으로 정규화했으며, 서브에이전트가 붙인 세부 분류는 각 항목에 함께 표기했습니다.

## 분류별 개수

| 분류 | 개수 |
|---|---:|
| [검증·평가](#검증평가) | 13 |
| [오케스트레이션·워크플로](#오케스트레이션워크플로) | 16 |
| [에이전트 설계·운영 원칙·안전장치](#에이전트-설계운영-원칙안전장치) | 8 |
| [메모리·기록·관측](#메모리기록관측) | 5 |
| [메타(스킬·설정·환경 관리)](#메타스킬설정환경-관리) | 13 |
| [언어·프레임워크 코딩 지침](#언어프레임워크-코딩-지침) | 19 |
| [도메인 업무](#도메인-업무) | 10 |
| **합계** | **84** |

## 검증·평가

### agent-eval

**코딩 에이전트(Claude Code, Aider, Codex 등)를 YAML 과제와 judge로 나란히 비교해 pass rate, 비용, 시간, 일관성을 측정하는 CLI 스킬.**

에이전트 선택이나 모델/도구 변경 시 인상이 아닌 측정값으로 판단하려고 쓴다. 과제를 YAML(prompt, 대상 파일, judge, 고정 commit)로 정의하고, 실행마다 git worktree를 새로 만들어 격리한 뒤 prompt를 넘기고 judge를 돌려 pass/fail, 비용, 시간을 기록한다. judge는 pytest/command(결정적), grep(패턴), llm(LLM-as-judge) 세 종류다. `agent-eval report`로 비교 표를 만든다.

<sub>세부 분류: 검증 / 에이전트 평가</sub>

### agent-self-evaluation

**복잡한 작업을 끝낸 뒤 에이전트가 5개 축(accuracy, completeness, clarity, actionability, conciseness)으로 자기 산출물을 1~5점 채점하고 개선안을 내는 스킬.**

3개 파일 이상 코드 작성, 다단계 워크플로, 3회 이상 시도한 디버깅 등이 끝난 뒤(또는 Stop hook 연동 시) 사용한다. 원 요청, 최종 출력, 테스트/린트 같은 도구 출력, 사용자 피드백을 모은 뒤 각 축을 독립적으로 채점하고 템플릿 기반 리포트(한 줄 요약, 스코어카드, 평균, 개선 1~3개, "사용자가 동의할까?" 자기 점검)를 만든다. 3점 이하 축은 즉시 고치거나 재작업 방안을 명시한다. 보조 디렉터리(examples, references, scripts, templates)가 있다.

<sub>세부 분류: 검증 / 자기 평가(리플렉션)</sub>

### ai-regression-testing

**같은 모델이 코드를 쓰고 리뷰할 때 생기는 맹점을 자동화 테스트(sandbox 모드 API 테스트)로 잡는 회귀 테스트 전략.**

"AI가 수정 → AI가 리뷰 → looks correct → 버그 잔존" 패턴을 핵심 문제로 정의하고, 실제 4회 반복된 사례를 든다. DB 없이 sandbox 모드를 강제해 API 응답 shape를 검증하는 Vitest 설정/헬퍼, 발견된 버그에 대해서만 테스트를 쓰는 전략, 흔한 AI 회귀 패턴(sandbox/production 불일치, SELECT 누락, 에러 상태 누수, 롤백 누락)을 제시한다. `/bug-check` 커맨드는 Step 1에서 test/build를 "mandatory, cannot skip"으로 먼저 돌리고, 통과해야 AI 코드 리뷰(Step 2)로 넘어가며, 수정마다 회귀 테스트를 제안(Step 3)하도록 정의한다.

<sub>세부 분류: 검증 / 테스트 전략</sub>

### benchmark

**Core Web Vitals, API p50/p95/p99, 빌드 시간을 측정해 `.ecc/benchmarks/` JSON 기준선과 before/after 비교로 성능 회귀를 탐지하는 스킬.**

4개 모드(페이지 성능, API 성능, 빌드 성능, before/after 비교)를 가진다. 페이지는 browser MCP로 LCP/CLS/INP 등을 목표값과 비교하고, API는 엔드포인트를 100회 호출해 백분위를 낸다. `/benchmark baseline`으로 저장하고 `/benchmark compare`로 Metric/Before/After/Delta/Verdict 표를 만든다. 기준선은 git 추적되며 CI에서 PR마다 compare를 돌리라고 권한다.

<sub>세부 분류: 검증 / 성능 측정</sub>

### browser-qa

**브라우저 자동화 MCP로 배포된 UI를 smoke/interaction/visual regression/accessibility 4단계로 검증하고 SHIP / DO NOT SHIP 판정을 내리는 스킬.**

staging/preview 배포 후나 프론트엔드 PR 검토 시 쓴다. Phase 1 smoke(콘솔 에러, 네트워크 4xx/5xx, Core Web Vitals 임계값), Phase 2 상호작용(링크, 폼 정상/비정상 입력, 로그인 흐름), Phase 3 3개 breakpoint 스크린샷을 baseline과 비교, Phase 4 axe-core 접근성 감사를 수행한다. 산출물은 단계별 결과와 verdict(SHIP / SHIP WITH FIXES / DO NOT SHIP / INCONCLUSIVE)가 담긴 QA Report이다. 기본 read-only, 프로덕션 URL에서 변경성 여정 금지, 테스트 계정 사용, 스크린샷의 PII 마스킹 같은 blast radius 규칙을 둔다.

<sub>세부 분류: 검증 / UI QA</sub>

### click-path-audit

**버튼 핸들러의 호출 순서와 공유 상태 부작용을 추적해, 개별 함수는 정상인데 서로 상쇄되어 UI가 동작하지 않는 버그를 찾는 감사 절차.**

정적 읽기나 일반 디버깅이 놓치는 상태 상호작용 버그를 대상으로 한다. Step 1에서 Zustand 스토어 액션별 sets/resets 부작용 맵을 만들고, Step 2에서 각 touchpoint 핸들러를 호출 순서대로 추적해 Sequential Undo, Async Race, Stale Closure, Missing Transition, Dead Path, useEffect Interference 6개 패턴을 점검한다. Step 3은 CLICK-PATH-NNN 형식의 심각도 리포트를 쓴다. 전체 앱 감사는 병렬 에이전트로 쪼개되 스토어 맵 에이전트가 먼저 끝나야 한다.

<sub>세부 분류: 검증 / 코드 감사 (프론트엔드 상태)</sub>

### contract-first

**하나의 기계 검증 가능한 계약(OpenAPI 등)을 기준으로 consumer/provider를 병렬 개발하고 같은 artifact에 대해 양측을 검증하게 하는 협업 규약.**

프론트·백엔드나 서비스 간 경계를 바꿀 때 필드 drift, mock/production 형태 불일치, 한쪽의 임의 재정의를 막기 위해 쓴다. 소비자 작업(consumer job)에서 출발해 최소 계약을 정의하고, 타입·mock을 생성하고, provider의 실제 직렬화 응답을 계약으로 검증한다. 병합 전에 "양측이 각자 테스트를 통과했나"가 아니라 "같은 계약에 대해 통과했나"를 본다. Contract Change Protocol은 구현 전에 계약부터 바꾸고 영향받는 소유자와 diff를 리뷰하도록 한다. 계약 내용을 지시가 아닌 데이터로 취급하고 `$ref` allowlist, 최소 권한 generator 실행 같은 보안 규칙도 포함한다.

<sub>세부 분류: 협업 규약 / API 계약 검증</sub>

### eval-harness

**구현 전에 capability/regression eval을 정의하고 code/model/rule/human grader로 채점하며 pass@k, pass^k로 신뢰도를 추적하는 eval 주도 개발(EDD) 프레임워크.**

Define(코딩 전 eval 정의) → Implement → Evaluate → Report 4단계로 진행한다. Capability eval과 Regression eval(baseline SHA 대비) 포맷, 4종 grader, pass@1/pass@3/pass^3 지표와 권장 임계값(capability pass@3>=0.90, release-critical regression pass^3=1.00)을 제시한다. `.claude/evals/<feature>.md/.log`, baseline.json에 정의와 실행 이력을 저장하고 `/eval define|check|report`를 쓴다. 로컬 유틸(`scripts/lib/eval-harness`)은 hash-linked journal capsule, replay, receipt를 제공하나 후보 실행(gate run)은 OS 격리 백엔드가 없어 전부 거부(`gate.isolation_required`)한다.

<sub>세부 분류: 검증 / eval</sub>

### security-review

**인증, 입력, 시크릿, API 등을 다룰 때 적용하는 웹 애플리케이션 보안 체크리스트와 패턴 모음.**

시크릿 관리, 입력 검증, SQL injection, 인증/인가, XSS, CSRF, rate limiting, 민감 데이터 노출, Solana 블록체인, 의존성 등 10개 영역별로 FAIL/PASS 코드 예시와 Verification Steps 체크박스를 제시한다. 보안 자동 테스트 예시와 Pre-Deployment Security Checklist를 포함한다. 보조 파일 cloud-infrastructure-security.md는 IAM, 시크릿 로테이션 등 클라우드 체크리스트를 다룬다.

<sub>세부 분류: 보안 / 검증 체크리스트</sub>

### security-scan

**AgentShield로 `.claude/` 설정(CLAUDE.md, settings.json, MCP, hooks, agents)의 보안 취약점과 injection 위험을 스캔하고 등급을 매기는 스킬.**

새 프로젝트 설정, 설정 파일 수정 후, 커밋 전, 낯선 저장소 온보딩 시 `npx ecc-agentshield scan`을 실행한다. 파일별 검사 항목(하드코딩 시크릿, 과도한 allow 목록, `Bash(*)`, hook 내 command injection, 조용한 오류 억제, MCP의 `npx -y` 공급망 위험, 에이전트의 무제한 도구 접근)을 표로 정리하고 A~F 등급과 Critical/High/Medium/Info 해석 가이드를 제공한다. 출력은 terminal/JSON/Markdown/HTML이며 `--fix` 자동 수정(안전한 항목만), 공격자/방어자/감사자 3-agent 심층 분석(`--opus`), `init`으로 안전한 설정 생성, GitHub Action CI 연동(`fail-on-findings`)을 지원한다.

<sub>세부 분류: 검증 / 에이전트 설정 보안</sub>

### skill-comply

**스킬/규칙/에이전트 정의를 에이전트가 실제로 따르는지 시나리오를 자동 생성해 실행하고 준수율을 리포트하는 스킬.**

.md 파일에서 기대 행동 시퀀스(spec)를 자동 생성하고, 프롬프트 엄격도가 낮아지는 3단계 시나리오(supportive, neutral, competing)를 만든다. `claude -p`를 실행해 stream-json으로 tool call 트레이스를 수집한 뒤, LLM이 호출을 spec 단계에 분류하고 시간 순서는 결정적으로 검사한다. 산출물은 spec, 시나리오 프롬프트, 시나리오별 준수 점수, LLM 분류 라벨이 붙은 tool call 타임라인을 담은 자립형 리포트이며, 준수율이 낮은 단계에는 hook 승격을 권고한다. `--dry-run`으로 비용 없이 spec과 시나리오만 생성할 수 있다.

<sub>세부 분류: 검증 / 준수 측정</sub>

### terminal-ops

**저장소에서 명령 실행·CI 디버깅·좁은 수정을 할 때 실제 실행 증거와 정확한 상태 단어로 보고하게 하는 증거 우선 운영 워크플로.**

작업 표면(repo 경로, 브랜치, diff 상태, inspect/fix/verify/push 모드)을 확정하고, 수정 전에 실패 표면(에러, 파일, git 상태)을 먼저 읽고, 한 번에 하나의 지배적 실패를 가장 작은 증명 명령으로 고친다. 상태를 inspected / changed locally / verified locally / committed / pushed / blocked 정확한 용어로 보고하고 SURFACE-EVIDENCE-ACTION-STATUS 출력 형식을 쓴다. 증명 명령을 다시 돌리기 전엔 fixed라 하지 않고, 실제로 upstream이 이동하기 전엔 pushed라 하지 않는다. verification-loop, tdd-workflow, security-review 등과 조합한다.

<sub>세부 분류: 검증 / 운영 워크플로</sub>

### verification-loop

**build, type, lint, test(커버리지), security grep, diff review 6단계를 돌려 PASS/FAIL 검증 리포트를 만드는 스킬.**

기능 완료나 리팩터링 후, PR 전에 호출한다. Phase 1~6을 순서대로 실행하며 빌드 실패 시 중단하고 수정한다. 테스트는 80% 커버리지를 목표로 하고 보안 단계는 secret/console.log grep, 마지막은 git diff 리뷰다. 최종 산출물은 각 단계 PASS/FAIL과 READY/NOT READY 판정, 수정할 이슈 목록을 담은 VERIFICATION REPORT이며, 긴 세션에서는 15분마다 또는 주요 변경 후 반복하는 Continuous Mode와 PostToolUse hook 보완 관계를 언급한다.

<sub>세부 분류: 검증</sub>

## 오케스트레이션·워크플로

### autonomous-agent-harness

**Claude Code의 /loop, `claude -p`, 메모리, MCP, 컴퓨터 사용을 조합해 상시/예약 자율 에이전트를 구성하는 셋업 패턴 가이드.**

지속 실행·예약 실행이 필요할 때 쓴다. Persistent Memory(내장 메모리 + MCP memory server), Scheduled Operations(`/loop`, OS cron/CI 스케줄 + `claude -p`), Dispatch(CI/웹훅이 `claude -p` 호출), Computer Use, Task Queue(memory 파일의 task-queue.md)의 5개 구성요소를 설명한다. Hermes 구성요소와 ECC 대응표, 설정 단계, PR 리뷰어/리서치/미팅 준비 예시 워크플로를 포함한다. 산출물은 설정 절차와 큐/메모리 파일 패턴이다.

<sub>세부 분류: 오케스트레이션 / 자율 에이전트 셋업</sub>

### autonomous-loops

**`claude -p` 순차 파이프라인부터 RFC 기반 멀티에이전트 DAG(Ralphinho)까지 자율 루프 6가지 패턴과 선택 기준을 정리한 스킬(continuous-agent-loop으로 대체 예정).**

자율 개발 루프를 설계할 때 참조한다. Sequential Pipeline, NanoClaw REPL, Infinite Agentic Loop, Continuous Claude PR Loop, De-Sloppify, Ralphinho DAG를 복잡도 순으로 소개하고 결정 매트릭스와 조합법, Anti-Patterns를 제공한다. Continuous Claude는 `--max-runs/--max-cost/--max-duration`·완료 신호·CI 실패 자동 수정·`SHARED_TASK_NOTES.md`로 반복 간 맥락을 잇는다. Ralphinho는 RFC를 의존성 DAG 작업 단위로 분해하고 난이도 tier별 파이프라인, 별도 컨텍스트의 리뷰, eviction이 있는 merge queue, SQLite 상태 저장을 쓴다.

<sub>세부 분류: 오케스트레이션 / 자율 루프</sub>

### benchmark-optimization-loop

**"더 빠르게 해줘" 요청을 baseline, 정확성 게이트, 탐색 예산이 있는 유한한 측정 루프로 바꾸는 스킬.**

Required Baseline(대상 작업, 반드시 green이어야 할 정확성 게이트, 메트릭, 현재 baseline, max variants/time/spend 예산)이 없으면 최적화를 시작하지 않는다. 루프는 baseline 측정 → 증거 기반 병목 식별 → 가설 하나씩의 variant 생성 → 동일 입력으로 실행 → 정확성/안전성/재현성 실패 variant 기각 → 최선 variant 승격 → 코드화 → 재측정 순이다. Variant Table, 재귀 탐색 시 ledger 영속화와 이전 승자 대비 비교, holdout/replay, 중단 조건(노이즈 수준 개선, 정확성 실패, 예산 초과)을 정의한다.

<sub>세부 분류: 오케스트레이션 / 검증 루프</sub>

### blueprint

**한 줄 목표를 PR 하나 크기 단계들의 자기완결적 구축 계획서로 바꾸고, 적대적 리뷰 게이트와 계획 변경 프로토콜을 두는 계획 생성 스킬.**

여러 PR/세션에 걸친 대형 기능·리팩터링을 계획할 때 쓴다. Research(사전 점검, 기존 plans/메모리 읽기) → Design(3–12 단계, 의존 그래프, 병렬 단계 탐지, 모델 티어, 롤백) → Draft(`plans/`에 Markdown, 단계마다 context brief·작업·검증 명령·exit criteria) → Review(최강 모델 서브에이전트가 체크리스트와 안티패턴 카탈로그로 적대적 리뷰, critical 수정) → Register 5단계로 진행한다. git/gh 유무를 감지해 브랜치/PR/CI 모드 또는 direct 모드로 전환하며, 단계 split/insert/skip/reorder/abandon 시 감사 기록을 남기는 plan mutation protocol이 있다.

<sub>세부 분류: 계획 / 오케스트레이션</sub>

### continuous-agent-loop

**자율 에이전트 루프의 유형 선택, 권장 스택, 실패 모드, 복구 절차를 간단히 정리한 스킬.**

자율 루프를 돌릴 때 쓰는 요약 스킬로, 본문은 매우 짧다. Loop Selection Flow가 엄격한 CI/PR 통제면 continuous-pr, RFC 분해면 rfc-dag, 탐색적 병렬 생성이면 infinite, 기본은 sequential로 분기시킨다. Combined Pattern은 RFC 분해, 품질 게이트(`/quality-gate`), eval 루프(`eval-harness`), 세션 영속화(`nanoclaw-repl`) 4단 스택을 권하고, Failure Modes(진척 없는 churn, 동일 원인 재시도, merge queue 정체, 비용 드리프트)와 Recovery(루프 동결, `/harness-audit`, 실패 단위로 범위 축소, 명시적 acceptance criteria로 재실행)를 나열한다. 실제 구현은 다른 스킬에 위임되어 이 파일에는 없다.

<sub>세부 분류: 오케스트레이션 / 루프 패턴</sub>

### opensource-pipeline

**비공개 프로젝트를 forker, sanitizer, packager 3개 에이전트로 fork → 비밀 제거 검증 → 패키징해 안전하게 공개하는 파이프라인.**

`/opensource fork|verify|package|list|status` 명령으로 동작한다. forker가 파일을 복사하고 시크릿을 제거하며 `.env.example`과 FORK_REPORT.md를 만든다. sanitizer가 시크릿·PII·내부 참조·위험 파일·설정 완전성·git 히스토리 6개 범주를 스캔해 SANITIZATION_REPORT.md에 PASS/FAIL을 낸다. 통과하면 packager가 CLAUDE.md, setup.sh, README, LICENSE 등을 생성하고, 사용자 승인 후에만 `gh repo create --public`으로 게시한다.

<sub>세부 분류: 오케스트레이션 / 보안 게이트</sub>

### orch-add-feature

**신규 기능 추가를 research → plan → TDD → review → commit으로 오케스트레이션하는 `orch-pipeline` 위의 얇은 래퍼.**

아직 없는 기능을 만들 때 사용한다. 자체 로직 없이 `orch-pipeline` 엔진을 호출하며, 기본 크기는 standard이고 phase는 0→1→2→4→5→6(Scaffold 3 생략)이다. 첫 동작은 새 동작에 대한 실패 테스트 작성 후 구현이다. Gate 1(계획 승인)과 Gate 2(커밋 전 확인)에서 멈추고, 보안 트리거가 있으면 `security-reviewer`를 추가한다.

<sub>세부 분류: 오케스트레이션</sub>

### orch-build-mvp

**설계/스펙 문서(SDD/PRD)를 읽어 얇은 수직 슬라이스로 계획하고 GAN 하니스의 generator-evaluator 루프로 MVP를 빌드하는 오케스트레이션 래퍼.**

공유 엔진 `orch-pipeline`을 phase mask 0→1→2→3(scaffold)→4→5→6으로 실행한다. 스펙에서 범위, 확정 결정, 기능 목록을 추출해 수직 슬라이스 순으로 정렬하고, SDD를 `gan-harness/spec.md`와 `eval-rubric.md`로 변환해 `/gan-build --skip-planner`(max-iterations 15, pass-threshold 7.0, playwright 또는 code-only 평가)를 돌린다. 평가 피드백은 `feedback-NNN.md`로 남고 점수 통과 또는 정체까지 반복한다. Gate 1(슬라이스 계획)과 Gate 2(커밋 전)에서 멈추며 슬라이스마다 별도 `feat:` 커밋, 보안 트리거 시 security-reviewer를 추가한다.

<sub>세부 분류: 오케스트레이션</sub>

### orch-change-feature

**동작 중인 기능의 동작을 바꿀 때 테스트를 새 명세로 먼저 수정한 뒤 구현하고 리뷰와 게이트 커밋까지 진행하는 오케스트레이션 래퍼.**

버그가 아닌 요구 변경("X 대신 Y")에 쓰며 공유 엔진 `orch-pipeline`의 얇은 래퍼다. 기본 크기는 small이고 phase mask는 0 → (필요 시 1) → light 2 → 4 → 5 → 6이다. 첫 동작(phase 4)은 기존 테스트를 새 동작에 맞게 고친 뒤 통과할 때까지 구현을 바꾸는 것이다. Gate 1(계획/변경된 테스트 승인)과 Gate 2(커밋 전)에서 멈추며, 보안 트리거가 있으면 security-reviewer를 추가한다. 형제 스킬(orch-fix-defect, orch-add-feature)과의 구분 기준도 명시한다.

<sub>세부 분류: 오케스트레이션</sub>

### orch-fix-defect

**버그를 실패하는 회귀 테스트로 먼저 재현하고 green까지 고친 뒤 리뷰하고 게이트를 거쳐 커밋하는 오케스트레이션 래퍼.**

`orch-pipeline` 엔진을 phase mask 0→(근본 원인이 불명확할 때만 경량 2)→4→5→6으로 실행하며 리서치(1)는 보통 생략한다. 첫 동작은 새 실패 테스트(regression test)로 버그를 재현하는 것으로, "버그 존재를 먼저 증명하는 것이 수정과 땜질을 가른다"고 명시한다. 원인이 불명확하면 code-explorer, 빌드 오류는 build-error-resolver로 에스컬레이션하고 Gate 2(커밋 전)에서 확인을 받으며 `fix:` 커밋을 만든다. 보안 민감 경로면 security-reviewer를 추가한다.

<sub>세부 분류: 오케스트레이션 / 검증</sub>

### orch-pipeline

**orch-* 스킬군이 공유하는 Research-Plan-TDD-Review-Commit 파이프라인 엔진으로, 크기 분류기와 두 개의 사람 gate를 정의한다.**

요청을 trivial/small/standard/large로 분류(파일 수, 새 의존성/계약, 설계 모호성 중 가장 높은 tier)해 실행할 phase를 정하고, 각 phase를 기존 ECC agent/command(planner, tdd-guide, code-reviewer, security-reviewer, gan-build 등)에 위임한다. "gated, not autonomous": Gate 1은 plan 후 사용자 승인 전 구현 금지, Gate 2는 commit 전 diff와 메시지 확인이다. 보안 트리거(인증, 입력 처리, DB 쿼리, 경로, 외부 API, 암호, 시크릿) 시 security-reviewer가 필수이며, 파이프라인은 숨은 상태 없이 task_list 등 계획 문서를 handoff로 쓴다. 끝의 Verification 절은 tier 명시, 두 gate 준수, 보안 리뷰 조건 충족, 커밋 규칙, 커버리지 80%를 점검한다.

<sub>세부 분류: 오케스트레이션</sub>

### orch-refine-code

**동작을 바꾸지 않는 리팩터링을 테스트 green 확인, 작은 단계 재구성, 리뷰, 게이트 승인 커밋으로 오케스트레이션하는 얇은 래퍼 스킬.**

공용 엔진 `orch-pipeline`에 설정을 얹는 wrapper다. Phase mask 0→2→4→5→6으로 새 행동 테스트 없이 기존 스위트를 안전망으로 삼고, 코드 수정 전에 관련 테스트가 green인지 확인하며 커버리지가 얇으면 characterization test를 먼저 추가한다. 작은 단계마다 테스트를 재실행하고, Gate 1(재구성 계획 승인)과 Gate 2(커밋 전 확인)에서 멈추며 `refactor:` 커밋의 diff는 behavior-neutral이어야 한다. 죽은 코드/중복 정리는 `refactor-cleaner` 에이전트에 위임한다.

<sub>세부 분류: 오케스트레이션 / 리팩터링 워크플로</sub>

### plan-canvas

**계획/HTML 산출물을 로컬 브라우저 캔버스에 열어 사람이 요소를 짚어 주석, 채팅, Approve/Request changes 판정을 하고 에이전트는 CLI 한 번으로 JSON 피드백을 받는 리뷰 루프.**

`/plan`이 만든 `.plan.md` 등을 `ecc-plan-canvas open`으로 열고 `await`로 사람의 응답을 블록 대기한다. 피드백은 annotation(selector/snippet 앵커), chat, verdict(approve/request-changes) 항목의 JSON으로 오며, approve가 plan 확정(CONFIRM)을 대체한다. 에이전트는 모든 메시지에 캔버스에서 답하고 계속 대기하며, 대기 없이 턴이 끝나지 않도록 `stop:plan-canvas-pending` hook과 `pending` 명령이 보조한다. 상태는 loopback 서버와 `~/.claude/plan-canvas/`에 저장된다.

<sub>세부 분류: 오케스트레이션 / 사람 승인 UI</sub>

### search-first

**코드를 쓰기 전에 repo, npm/PyPI, MCP, 스킬, GitHub에서 기존 해결책을 찾아 adopt/extend/compose/build를 결정하는 리서치 선행 워크플로우.**

새 기능이나 의존성 추가, 유틸 작성 직전에 쓴다. Step 0 도구 가용성 preflight(어떤 검색 채널을 쓸 수 있는지 확인하고 건너뛴 채널을 정직하게 보고)부터 시작해 필요 분석, researcher 에이전트 병렬 검색, 후보 평가, 결정 매트릭스, 구현 순으로 진행한다. 간단한 건 Quick Mode(5문항 점검), 비자명한 건 Full Mode(에이전트 위임)를 쓴다. planner/architect 에이전트와 연계하고 "silent skipping", "jumping to code" 등을 안티패턴으로 둔다.

<sub>세부 분류: 워크플로우 / 사전 조사</sub>

### team-agent-orchestration

**여러 에이전트를 팀처럼 운영하기 위해 work item, 소유자, 에이전트 Kanban, 브랜치 격리, control pane, merge gate를 정의하는 스킬.**

각 에이전트를 Owner/Scope/State/Evidence/Merge gate가 있는 좁은 계약의 팀원으로 취급한다. Backlog부터 Archived까지 7개 컬럼과 각 컬럼의 Exit Criteria, 카드 JSON 스키마(owner, branch, acceptance, merge_gate, handoff)를 제시한다. 7단계 흐름(보드 구성, 실행 모드 선택, 경계 할당, 증거·handoff 기록, 테스트→diff→보안 순 리뷰, 단일 integrator 병합, 반복 시 스킬 승격)과 control pane 요건, 실패 모드(Agent soup, Invisible work, Board theater, Overlapping writes)를 다룬다.

<sub>세부 분류: 오케스트레이션</sub>

### team-builder

**`claude agents`와 agents/ 마크다운에서 페르소나를 발견해 사용자가 최대 5개를 고르면 병렬 디스패치하고 합의/충돌을 종합하는 대화형 스킬.**

여러 전문 에이전트를 임시 팀으로 구성해 한 과제에 돌릴 때 쓴다. Step 1 동적 발견(CLI + glob, 이름 중복 제거, 우선순위 user > plugin > built-in) → Step 2 도메인 메뉴 → Step 3 선택(최대 5개 강제) → Step 4 Agent 툴로 병렬 spawn(실패는 인라인 표기 후 나머지 계속) → Step 5 결과를 에이전트별로 묶고 agreements/conflicts/next steps를 종합한다. 에이전트 간 대화가 필요할 때만 TeamCreate를 쓰고 그 외엔 독립 병렬 호출을 쓴다.

<sub>세부 분류: 오케스트레이션 / 멀티에이전트</sub>

## 에이전트 설계·운영 원칙·안전장치

### agent-architecture-audit

**에이전트/LLM 애플리케이션을 12개 레이어로 나눠 wrapper 회귀, 메모리 오염, 도구 규율 실패, 숨은 repair loop를 진단하고 severity 순 리포트를 만드는 감사 스킬.**

에이전트가 오작동하는데 원인 레이어를 모를 때, 또는 출시 전에 사용한다. Scope → Evidence Collection(`rg`로 안티패턴 탐색) → Failure Mapping(증상/메커니즘/레이어/근본원인/증거/confidence) → Fix Strategy 4단계로 진행한다. 수정 순서는 "프롬프트가 아니라 코드 우선"(도구 요구를 코드로 gate, 숨은 repair agent 축소, 메모리 admission에서 사용자 정정 우선 등)이다. 산출물은 `ecc.agent-architecture-audit.report.v1` JSON 스키마의 리포트(executive_verdict, findings, ordered_fix_plan)이다.

<sub>세부 분류: 검증 / 에이전트 진단</sub>

### agent-harness-construction

**에이전트의 action space, 도구 정의, observation 포맷, 에러 복구 계약, 컨텍스트 예산을 설계·최적화하는 가이드.**

에이전트가 계획하고 도구를 호출하고 오류에서 복구해 완료로 수렴하는 방식을 개선할 때 쓴다. 출력 품질을 action space / observation / recovery / context budget 네 요소로 모델링한다. 도구는 안정적 이름·schema-first·결정적 출력 형태를 갖추고, 고위험 작업(deploy, migration, permissions)은 micro-tool로 쪼갠다. 모든 도구 응답에 status/summary/next_actions/artifacts를 넣고, 모든 에러 경로에 원인 힌트·안전한 재시도 방법·명시적 중단 조건을 넣는다. completion rate, retries, pass@1/pass@3, 성공당 비용으로 벤치마킹한다.

<sub>세부 분류: 에이전트 설계 / 하네스 구성</sub>

### agent-introspection-debugging

**에이전트 실행 실패를 capture → diagnosis → contained recovery → report 4단계로 체계적으로 자가 디버깅하는 워크플로.**

루프 한도 초과, 진전 없는 재시도, 컨텍스트 열화, 환경 상태 불일치 등이 생겼을 때 맹목적으로 재시도하기 전에 쓴다. Phase 1에서 실패 상태(에러, 마지막 성공 단계, 반복 패턴, cwd/branch 가정)를 템플릿으로 기록하고, Phase 2에서 패턴 표(ECONNREFUSED, 429, 파일 누락, 수정 후에도 테스트 실패 등)에 매칭해 원인을 분류한다. Phase 3은 가장 작은 되돌릴 수 있는 조치만 허용하고, Phase 4에서 Agent Self-Debug Report(원인, 복구 조치, 결과 success/partial/blocked, 토큰 소모 위험)를 남긴다. 실제 도구로 하지 않은 "auto-healing" 주장을 금지한다.

<sub>세부 분류: 에이전트 디버깅 / 실패 복구</sub>

### agent-payment-x402

**x402 결제 프로토콜과 MCP 결제 도구로 에이전트가 지출 정책 안에서만 결제하도록 하는 스킬.**

에이전트가 유료 API를 직접 결제해야 할 때 쓴다. Base는 `agentwallet-sdk` MCP 서버, X Layer는 OKX Agent Payments Protocol 경로를 Decision Tree로 고르고, 판매자 측 SDK 가이드 링크도 제공한다. 모든 결제 호출에 SpendingPolicy(task별/session별 예산, 수신자 allowlist, rate limit)를 적용하며, 정책은 에이전트가 아니라 orchestrator가 위임 전에 설정한다. TypeScript 예제로 `set_policy` 성공 확인 후에만 위임하고, `preToolCheck`로 5개 실패 경로를 모두 차단(fail-closed)하는 패턴을 보여 준다.

<sub>세부 분류: 인프라 / 결제 / 안전장치</sub>

### agentic-engineering

**eval-first 실행, 작업 분해, 모델 티어 라우팅으로 에이전트 주도 개발을 운영하는 짧은 원칙 스킬.**

에이전트가 구현 대부분을 맡고 사람이 품질·리스크를 통제하는 워크플로를 위한 지침이다. Eval-First Loop(capability/regression eval 정의 → baseline과 실패 시그니처 기록 → 구현 → 재실행해 delta 비교)와 15분 단위 분해 규칙(독립 검증 가능, 단일 주요 리스크, 명확한 done 조건)을 제시한다. Haiku/Sonnet/Opus 라우팅, 세션 유지/신규/compact 시점, AI 생성 코드 리뷰 초점(불변식, 에러 경계, 보안·인증 가정), 작업별 비용 추적 항목을 포함한다. 분량은 짧고 체크리스트 위주다.

<sub>세부 분류: 오케스트레이션 / 워크플로 원칙</sub>

### agentic-os

**Claude Code를 영속 런타임으로 보고 kernel(CLAUDE.md)-agents-commands-scripts-data 5개 디렉터리로 멀티에이전트 "OS"를 구성하는 아키텍처 가이드.**

지속적으로 도는 개인/프로젝트용 멀티에이전트 시스템을 만들 때 쓴다. CLAUDE.md를 COO 역할의 kernel로 두고 Agent Registry 표와 Routing Rules(키워드 트리거 → agents/<name>.md 로드)로 작업을 전문 에이전트에 위임한다. 상태는 외부 DB 없이 `data/`의 JSON/markdown(append-only 일일 로그, ADR 형식 decisions, inbox)에 두고, 세션 종료 시 Auto-Reflection을 append한다. 스케줄 실행은 세션 cron이 아닌 LaunchAgent/systemd/pm2로 하라고 하며, 안티패턴(단일 거대 에이전트, 무상태 세션, 하드코딩 자격증명)과 체크리스트(CLAUDE.md 200줄 이하, 에이전트별 Memory Scope 명시, 로그 수정 금지)를 제시한다.

<sub>세부 분류: 오케스트레이션 / 메모리-상태 아키텍처</sub>

### ai-first-engineering

**에이전트가 구현 대부분을 생성하는 팀을 위한 프로세스·리뷰·테스트 기준을 짧게 정리한 운영 모델 스킬.**

에이전트가 코드를 많이 쓰는 팀이 프로세스, 리뷰, 아키텍처를 설계할 때 참고한다. Process Shifts(계획 품질, eval 커버리지, 리뷰 초점을 문법에서 시스템 동작으로 이동), Architecture Requirements(명시적 경계, 안정된 계약, 타입 인터페이스, 결정적 테스트), Code Review(회귀, 보안 가정, 데이터 무결성, 실패 처리, 롤아웃 안전성 위주), Testing Standard(터치한 도메인의 회귀 커버리지 필수, 엣지 케이스 단언, 경계 통합 검사)를 나열한다. 실행 절차나 도구 없이 원칙 목록만 있고, 산출물은 없다.

<sub>세부 분류: 프로세스 / 팀 운영 가이드</sub>

### safety-guard

**PreToolUse hook으로 파괴적 명령을 가로채 확인을 받고(Careful), 쓰기를 한 디렉터리로 잠그며(Freeze), 둘을 합치는(Guard) 안전장치 스킬.**

프로덕션 작업, 자율(full-auto) 에이전트 실행, 마이그레이션/배포 중에 쓴다. Careful은 rm -rf, git push --force, git reset --hard, DROP TABLE, kubectl delete, --no-verify 등 감시 패턴을 감지해 설명·확인·더 안전한 대안을 제시한다. Freeze는 `/safety-guard freeze <dir>`로 그 밖의 Write/Edit를 차단하고, Guard는 읽기 전체 허용+지정 디렉터리만 쓰기 허용한다. `/safety-guard off`로 해제하며, 차단 이력은 `~/.claude/safety-guard.log`에 남긴다.

<sub>세부 분류: 안전장치 / hook</sub>

## 메모리·기록·관측

### architecture-decision-records

**코딩 중 발생한 아키텍처 결정을 `docs/adr/`에 번호 붙은 ADR 문서와 인덱스로 남기는 스킬.**

"ADR this" 같은 명시 신호나 프레임워크/DB 선택, trade-off 논의 같은 암묵 신호를 감지해 Nygard 형식 ADR(Context, Decision, Alternatives, Consequences, Status)을 작성한다. 처음에는 디렉터리·README 인덱스·template 생성 전에 사용자 동의를 받고, 초안은 사용자 승인 후에만 파일로 쓴다. "왜 X를 골랐나" 질문에는 기존 ADR을 인덱스에서 찾아 읽어 답한다. 상태 수명주기(proposed → accepted → deprecated/superseded)와 Do/Don't, planner/code-reviewer 연계(ADR 없는 아키텍처 변경 PR 지적)를 정의한다.

<sub>세부 분류: 문서화 / 의사결정 기록</sub>

### context-budget

**agents, skills, rules, MCP 서버, CLAUDE.md가 차지하는 컨텍스트 토큰을 감사해 우선순위화된 절감 권고를 내는 스킬.**

컨텍스트가 빨리 차거나 구성요소를 추가하기 전 여유를 확인할 때 쓴다. Inventory(파일별 토큰 추정, 임계 초과 플래그, MCP 툴 스키마 ~500토큰/툴) → Classify(Always/Sometimes/Rarely needed) → Detect Issues(비대한 description, 중복 컴포넌트, MCP 과다) → Report 4단계로 진행한다. 산출물은 컴포넌트별 토큰 표와 Top 3 최적화가 담긴 Context Budget Report이다. 옵션으로 세션 JSONL의 attachment/기타 레코드 바이트를 집계하는 스니펫이 있으며, 이 수치로 실제 컨텍스트 사용량을 단정하지 말고 `/context`, `/usage`를 쓰라고 한계를 밝힌다.

<sub>세부 분류: 관측 / 컨텍스트 최적화</sub>

### continuous-learning-v2

**PreToolUse/PostToolUse hook으로 세션을 관찰해 신뢰도 점수가 붙은 원자적 "instinct"를 만들고, 이를 skill/command/agent로 진화시키는 학습 시스템.**

observe.sh hook이 프롬프트와 tool 호출을 프로젝트별 `observations.jsonl`에 기록하고, 백그라운드 observer agent(Haiku)가 이를 분석한다. 사용자 교정, 에러 해결, 반복 워크플로우를 패턴으로 잡아 trigger/action/evidence/confidence(0.3~0.9)를 가진 instinct 파일을 만든다. 프로젝트 단위로 격리 저장하며 2개 이상 프로젝트에서 평균 신뢰도 0.8 이상이면 global로 승격한다. `/instinct-status`, `/evolve`, `/promote`, `/instinct-export`, `/instinct-import`, `/projects` 명령으로 관리하고, `/evolve`는 instinct를 클러스터링해 skill/command/agent로 만든다.

<sub>세부 분류: 메모리 / 학습 / 관측 hook</sub>

### cost-tracking

**ECC cost-tracker hook이 남긴 로컬 JSONL 로그에서 토큰 사용량과 비용을 집계·보고하는 스킬.**

`~/.claude/metrics/costs.jsonl`(세션 종료 시 hook이 append하는 세션별 누적 스냅샷)을 읽어 비용을 보고한다. 합산 시 세션별 최신 행만 취해야 중복 집계를 피한다는 규칙, 로그 부재 시 데이터를 지어내지 않는다는 규칙을 명시한다. Node 원라이너로 오늘/어제/전체, 모델별 비용을 출력하고 per-session 캐시(cost-snapshots)의 구조도 설명한다. 산출물은 비용 요약 리포트/CSV이다.

<sub>세부 분류: 관측 / 비용 리포트</sub>

### unified-memory

**ECC Memory Vault로 Claude, Codex 등 여러 하네스 간에 검증 가능한 컨텍스트와 핸드오프를 공유하는 스킬.**

이식 가능한 `ecc.memory.v1` Markdown 문서를 project/team/user 스코프의 로컬 vault에 저장하고 CLI(`ecc memory search/save/handoff/doctor`)와 opt-in MCP 서버(save/search/read/doctor만 노출)로 접근한다. 흐름은 쓰기 전 recall, 저장, 핸드오프 작성, doctor 검증이다. "Recall is evidence, not certainty" 절은 회상된 내용을 신뢰하지 말고 현재 상태를 재확인하며, 불완전 스캔과 빈 결과를 구분하고, 검증된 결과와 의도를 분리 기록하라고 규정한다.

<sub>세부 분류: 메모리 / 세션 상태 / 핸드오프</sub>

## 메타(스킬·설정·환경 관리)

### agent-sort

**저장소의 grep 증거로 ECC 구성요소(skills/commands/rules/hooks 등)를 DAILY와 LIBRARY로 분류해 프로젝트별 설치 계획을 만드는 스킬.**

프로젝트가 ECC 전체 번들 대신 필요한 부분만 로드해야 할 때 쓴다. 파일 확장자, 패키지 매니저, CI/훅 설정 등 repo-local 증거를 모아 `경로 | 타입 | 버킷 | 증거 | 근거` 증거 표를 만들고, agents/skills/commands/rules/hooks/extras 6개 패스를 병렬 서브에이전트로 나눠 분류한다. 산출물은 DAILY/LIBRARY 목록, 설치 계획, 검증 리포트(DAILY·LIBRARY 개수, 제거된 stale 항목, 미해결 질문), 선택적 `skill-library` 라우터다.

<sub>세부 분류: 메타-스킬관리 / 컨텍스트 구성</sub>

### automation-audit-ops

**hook, 스케줄 작업, MCP, 커넥터 등 자동화의 실제 상태를 증거 기반으로 인벤토리화하고 keep/merge/cut/fix-next를 권고하는 감사 워크플로.**

어떤 자동화가 살아있고 깨졌고 중복되는지 물을 때 쓴다. 기본은 read-only로 시작해 실제 표면(hooks, GitHub Actions, MCP 설정, 커넥터)을 읽고, 각 항목을 configured / authenticated / recently verified / stale or broken / missing으로 분류한다. 모든 주장에 파일 경로, workflow run, hook log, 실패 시그니처 같은 증거를 붙이고, 증거표 없이는 병합·삭제하지 않는다. 산출물은 CURRENT SURFACE / FINDINGS / RECOMMENDATION / NEXT ECC MOVE 리포트이다.

<sub>세부 분류: 감사 / 자동화 운영</sub>

### code-tour

**페르소나별 단계형 코드 워크스루를 실제 파일·라인 anchor와 함께 CodeTour `.tour` JSON으로 생성하는 스킬.**

온보딩, 아키텍처, PR, RCA, 보안 리뷰 등 "어떻게 동작하는지" 설명을 재사용 가능한 산출물로 만들 때 쓴다. 저장소를 먼저 탐색하고 독자 페르소나와 깊이(5~18 step)를 정한 뒤 `.tours/<persona>-<focus>.tour`를 쓴다. 모든 경로와 라인을 실제로 확인하고(추측 금지), `ref` 필드가 독자의 브랜치에 맞는지 검증하며, SMIG(Situation/Mechanism/Implication/Gotcha) 규칙으로 설명을 쓴다. 소스 코드는 수정하지 않는다.

<sub>세부 분류: 문서 생성 / 코드 이해</sub>

### codebase-onboarding

**낯선 코드베이스를 4단계로 분석해 온보딩 가이드와 시작용 CLAUDE.md를 생성하는 스킬.**

새 프로젝트에 합류하거나 Claude Code를 처음 쓸 때 사용한다. Phase 1 Reconnaissance(매니페스트, 프레임워크, 진입점, 디렉터리, 설정, 테스트 구조를 Glob/Grep으로 탐지) → Phase 2 Architecture Mapping → Phase 3 Convention Detection → Phase 4 산출물 생성 순으로 진행한다. 산출물은 Onboarding Guide(스택, 진입점, 요청 수명주기, Where to Look 표)와 Starter CLAUDE.md이며, 기존 CLAUDE.md가 있으면 보존하면서 추가/변경분을 표시한다.

<sub>세부 분류: 온보딩 / 문서 생성</sub>

### configure-ecc

**현재 하네스(Claude Code/Codex/Kimi) 안에서 ECC 설치의 범위와 hook 모드를 대화형으로 설정하고 미리보기-적용-검증하는 설치 마법사 스킬.**

설치 현황을 조회(inventory)한 뒤 Claude Code에서는 scope(user/project/local)와 hook 모드(off/minimal/standard/strict) 두 가지만 묻는다. `--dry-run --json`으로 미리보기를 보여 1회 확인을 받고, `--yes --json`으로 적용한 뒤 종료코드와 `claude plugin list --json`으로 독립 검증하고 성공 시에만 welcome을 렌더링한다. Codex는 네이티브 플러그인 수명주기, Kimi는 `./.kimi-code` 프로젝트 설치와 `ecc doctor`를 사용한다.

<sub>세부 분류: 인프라 / 설치·설정</sub>

### documentation-lookup

**라이브러리/프레임워크 질문에 학습 데이터 대신 Context7 MCP로 최신 문서를 조회해 답하는 스킬.**

resolve-library-id로 `/org/project` 형식 ID를 얻고(이름 일치, 벤치마크 점수, 평판, 버전으로 선택) query-docs로 문서를 가져와 답한다. 질문당 호출 3회 제한, 불명확하면 불확실성을 밝히고 추측하지 않으며, 쿼리에서 시크릿을 제거하라는 규칙이 있다. 산출물은 조회된 문서에 근거한 답과 코드 예시다.

<sub>세부 분류: 도구 사용법 / 문서 조회</sub>

### ecc-guide

**ECC 저장소의 실제 파일을 읽어 ECC 구성요소 탐색, 설치, 스킬 추천 질문에 답하는 안내 스킬.**

사용자가 ECC에 무엇이 있는지, 어떻게 설치/리셋하는지, 어떤 스킬이 맞는지 물을 때 사용한다. 핵심 원칙은 "기억이 아니라 현재 파일에서 답한다"이며 `catalog.js`, `find`, `install-plan.js` 등으로 라이브 표면을 확인한다. 설치는 managed installer의 dry-run 계획을 우선하고, `/project-init`은 스택 감지 → dry-run 계획 → 기존 CLAUDE.md 확인 → 적용 전 승인 순으로 안내한다. 응답은 결론 먼저의 짧은 템플릿(추천/근거/검증 명령/다음 행동)을 쓴다.

<sub>세부 분류: 메타-스킬관리 / 안내</sub>

### ecc-recipes

**설명된 워크플로에 맞는 ECC 커맨드 그룹과 실행 순서, 중단 조건을 안내하거나 전체 레시피 계열을 조회하는 읽기 전용 조언 스킬.**

`commands/` 디렉터리를 매번 live read해 접두사(orch-*, multi-*, prp-*, epic-*, loop-*, gan-*, hookify-* 등)로 family를 분류한다. 설명이 없으면 catalog mode로 family 표를, 있으면 match mode로 Best fit, Run-order, STOP 조건, 문서 위치를 출력한다. 명령을 실행하지 않으며 개수·목록을 하드코딩하지 않는다.

<sub>세부 분류: 메타 / 커맨드 내비게이션</sub>

### rules-distill

**설치된 스킬들을 교차 분석해 2개 이상의 스킬에 반복되는 원칙을 추출하고 rules 파일에 추가·수정·신규 작성하도록 제안하는 스킬.**

Phase 1에서 스크립트로 skills/rules 인벤토리를 결정적으로 수집하고, Phase 2에서 주제별 클러스터로 나눈 서브에이전트가 전체 rules 텍스트와 대조해 후보별 JSON을 만든다(principle, evidence, violation_risk, verdict, confidence, draft). verdict는 Append/Revise/New Section/New File/Already Covered/Too Specific이고 배치 간 병합 시 2+ 스킬 요건을 재확인한다. Phase 3에서 요약 표를 사용자에게 제시해 번호별 Approve/Modify/Skip을 받고 결과를 `results.json`에 저장한다.

<sub>세부 분류: 메타-스킬관리 / 규칙 관리</sub>

### skill-scout

**새 스킬을 만들기 전에 로컬/마켓플레이스/GitHub/웹에서 기존 스킬을 검색하고 외부 후보를 vetting하는 스킬.**

스킬 생성 요청 시 6단계로 진행한다. 의도·키워드 추출, 로컬(`~/.claude/skills`, 마켓플레이스) 검색, `gh search`와 웹 검색(최대 3 쿼리), 외부 매치 vetting, 순위화(최대 10개), "Use existing / Fork / Create fresh" 선택지 제시이다. 외부 스킬은 SKILL.md를 읽고 예상치 못한 셸 명령, 파일 쓰기, 네트워크 호출, 자격증명 처리, 패키지 설치를 점검하고, 마켓플레이스 원본을 직접 수정하지 않는다. 결과 표와 요약 예시를 포함한다.

<sub>세부 분류: 메타-스킬관리</sub>

### skill-stocktake

**전역·프로젝트 스킬을 체크리스트와 AI 종합 판단으로 감사해 Keep/Improve/Update/Retire/Merge 판정을 내리는 `/skill-stocktake` 스킬.**

마지막 결과(`results.json`)가 있으면 변경분만 보는 Quick Scan, 없으면 전체를 보는 Full Stocktake로 동작한다. Phase 1 인벤토리(scan.sh) → Phase 2 서브에이전트 배치 평가(약 20개씩, 중간 저장과 `in_progress` 재개) → Phase 3 요약 표 → Phase 4 통합(Retire/Merge 정당화, 영향 확인, MEMORY.md 100줄 초과 시 압축 제안) 순이다. 판정의 reason은 자기 완결적이어야 하며 "unchanged"나 "Superseded"만 쓰는 것을 금지하고 Good/Bad 예시를 둔다.

<sub>세부 분류: 메타-스킬관리 / 감사</sub>

### terminal-opener

**실행 파일과 argv 배열을 셸 없이 WezTerm 등 보이는 터미널 창에 여는 launch plan 도구 스킬.**

`scripts/open-terminal.js`로 명령을 문자열 보간 없이 argv로 유지하고 모든 spawn을 `shell: false`로 실행한다. 기본은 실행하지 않는 plan(dry-run/`--json`)이고, `--launch`는 사용자가 명시 요청하고 argv를 검토한 뒤에만 쓴다. WezTerm mux 실패 시 detached 시작으로 폴백하며 `muxFailure`로 원인을 진단한다. `--recover`는 사용자 설정을 건너뛰고, `--detect --json`은 터미널 가용성을 점검한다. 호출 프로세스의 환경변수를 필터링 없이 상속한다는 경고가 있다.

<sub>세부 분류: 도구 사용법 / 인프라</sub>

### workspace-surface-audit

**repo, MCP, 플러그인, env 키 이름, 하네스 설정을 읽기 전용으로 감사하고 ECC-native 다음 조치를 추천하는 스킬.**

"지금 이 워크스페이스가 무엇을 할 수 있고 무엇을 추가해야 하나"에 답한다. Phase 1 인벤토리, Phase 2 공식/설치된 플러그인 대비 벤치마크, Phase 3 gap을 skill/hook/agent/MCP 중 적절한 형태로 환원하는 순서다. 산출물은 Current surface, Parity, Primitive-only gaps, Missing integrations, Top 3-5 next moves의 5개 섹션이다. 비밀 값은 출력하지 않고 키 이름과 존재 여부만 표시하며, 사용자 요청 없이는 파일을 수정하지 않는다.

<sub>세부 분류: 감사 / 환경 점검</sub>

## 언어·프레임워크 코딩 지침

### accessibility

**Web/iOS/Android UI를 WCAG 2.2 AA 기준으로 설계·구현·감사하기 위한 접근성 지침.**

UI 컴포넌트 명세나 접근성 감사 시 사용한다. 컴포넌트 역할 식별 → 인지 가능 속성(대비 4.5:1, 대체 텍스트) → 조작 가능(타깃 24x24px, 포커스 표시) → 이해 가능(오류 메시지, Redundant Entry) → Robust(Name/Role/Value, aria-live) 5단계로 구성된다. Web/iOS/Android 속성 매핑표, 예제 코드, 안티패턴(div-button, 색상만 의미, 포커스 미포함 모달)과 체크리스트를 제공한다.

<sub>세부 분류: 도메인-코딩지침 / UI 접근성</sub>

### compose-multiplatform-patterns

**Compose Multiplatform/Jetpack Compose의 상태 관리, 내비게이션, 컴포저블 설계, expect/actual, 성능, 테마 패턴 모음.**

KMP 또는 Android에서 Compose UI를 만들 때 참조한다. ViewModel + 단일 State 객체, Event Sink, 타입 안전 Navigation, 슬롯 API, Modifier 순서, `@Stable/@Immutable`, `LazyColumn key`, `derivedStateOf`, Material 3 동적 테마를 Kotlin 예시로 보인다. Anti-Patterns 목록으로 마무리한다. 전부 프레임워크 코딩 지침이다.

<sub>세부 분류: 언어-코딩지침 (Kotlin/Compose)</sub>

### content-hash-cache-pattern

**SHA-256 내용 해시를 키로 파일 처리 결과를 캐시하고 서비스 레이어로 분리하는 Python 캐싱 패턴.**

PDF 파싱 같은 비싼 파일 처리를 반복할 때 쓴다. 청크 단위 SHA-256으로 키를 만들어 `{hash}.json`으로 저장하고, 파일 이동/이름 변경은 캐시 히트로, 내용 변경은 자동 무효화로 처리한다. 캐시 손상은 miss로 취급하고 hit/miss를 로그로 남긴다. 순수 처리 함수와 캐시 래퍼(`extract_with_cache`)를 분리하라는 SRP 원칙과 사용하지 말아야 할 경우(설정 의존 결과 등)를 제시한다.

<sub>세부 분류: 언어-코딩지침 / 캐싱 패턴</sub>

### cost-aware-llm-pipeline

**작업 복잡도별 모델 라우팅, 불변 예산 추적, 좁은 재시도, 프롬프트 캐싱으로 LLM API 비용을 통제하는 Python 패턴 모음.**

텍스트 길이/항목 수 임계값으로 Haiku/Sonnet을 고르는 `select_model`, frozen dataclass 기반 `CostTracker`(budget_limit, over_budget)와 `BudgetExceededError`로 예산 초과 시 중단, 일시적 오류만 재시도하는 `call_with_retry`, `cache_control` 프롬프트 캐싱을 다룬다. 네 기법을 하나의 `process` 함수로 조합하는 예시와 가격표, Best Practices(모델 선택 결정 로그, 사전 예산 설정)가 있다. LLM을 호출하는 애플리케이션을 만드는 개발자를 위한 스킬이다.

<sub>세부 분류: 인프라 / 비용 최적화 (애플리케이션 코드 패턴)</sub>

### csharp-testing

**xUnit, FluentAssertions, NSubstitute, WebApplicationFactory, Testcontainers 등 C#/.NET 테스트 작성 패턴 가이드.**

Arrange-Act-Assert 구조, Theory 기반 파라미터화 테스트, NSubstitute 모킹, ASP.NET Core 통합 테스트(WebApplicationFactory, Testcontainers), 테스트 폴더 구성, 테스트 데이터 빌더, 안티패턴 표, `dotnet test` 실행/커버리지 명령을 설명한다. 전부 .NET 도구 사용법과 코딩 관례이다.

<sub>세부 분류: 언어-코딩지침 / 테스트</sub>

### e2e-testing

**Playwright 기반 E2E 테스트의 POM, 설정, flaky 대응, 산출물 관리, CI 연동 패턴 모음.**

테스트 디렉터리 구조, Page Object Model, 테스트 구조 예시, `playwright.config.ts`(CI 시 retries 2, `forbidOnly`, trace/screenshot/video 보존, html/junit/json reporter)를 제시한다. flaky 대응으로 `test.fixme` 격리, `--repeat-each=10` 재현, 임의 timeout 대신 조건 대기로 바꾸는 수정 예시를 담는다. GitHub Actions 워크플로(실패 시도 리포트 업로드), Test Report 템플릿, 지갑 mock과 금융 흐름 테스트(production에서는 skip) 예시도 있다. 전부 Playwright/TypeScript 구체 사용법이다.

<sub>세부 분류: 검증 / 프레임워크-테스트</sub>

### laravel-patterns

**Laravel의 계층 구조, 라우팅, Eloquent, 마이그레이션, FormRequest, API 리소스, 큐/캐시 패턴을 정리한 프레임워크 코딩 지침.**

Laravel 앱을 만들거나 리뷰할 때 참조한다. Controller → Service/Action → Model 경계, route model binding과 scoped binding, 서비스 컨테이너 바인딩, Eloquent 캐스트/스코프/eager loading, 트랜잭션, 마이그레이션 규칙, FormRequest 검증과 DTO 변환, 일관된 JSON 응답 포맷, 이벤트/큐/캐시 원칙을 PHP 예시로 보여준다. AI 작업의 통제·검증 메커니즘은 없는 프레임워크 패턴 모음이다.

<sub>세부 분류: 언어-코딩지침 (Laravel/PHP)</sub>

### laravel-plugin-discovery

**LaraPlugins.io MCP로 Laravel 패키지를 검색하고 health score와 버전 호환성으로 평가하는 스킬.**

특정 기능용 Laravel 패키지를 찾거나 유지보수 상태를 확인할 때 쓴다. MCP 서버 설정 후 SearchPluginTool(키워드, health_score, laravel/php 호환성, vendor 필터)과 GetPluginDetailsTool(상세, 버전 이력)을 호출한다. 프로덕션에는 Healthy 패키지를 우선하고 타깃 Laravel 버전과 맞추라는 권고를 담는다. 산출물은 패키지 추천/평가 결과이다.

<sub>세부 분류: 도메인-프레임워크 도구 사용법 (MCP)</sub>

### laravel-security

**Laravel 앱의 인증, 인가, Eloquent, CSRF, XSS, API, 업로드, 배포 설정을 다루는 보안 코딩 지침.**

Laravel 인증/인가 구성이나 보안 리뷰, 프로덕션 배포 때 참고한다. 프로덕션 설정(APP_DEBUG, HTTPS), Sanctum/Passport, Gate/Policy, mass assignment, SQL injection, CSRF, Blade XSS, 보안 헤더, 검증, rate limiting, CORS, 파일 업로드, composer audit, 큐 암호화를 PHP 예시로 보여준다. security 로그 채널과 SecurityLogger, 끝의 Quick Security Checklist 표도 포함한다.

<sub>세부 분류: 언어-코딩지침 / 보안</sub>

### laravel-tdd

**PHPUnit/Pest, 팩토리, HTTP/Sanctum 테스트, fake, 커버리지 등 Laravel 테스트 작성 레시피 모음.**

Laravel 기능을 테스트 주도로 개발하거나 테스트 인프라를 구성할 때 쓴다. Red-Green-Refactor 예시 후 PHPUnit 설정, 모델 팩토리, 모델/HTTP/JSON API/Sanctum 인증 테스트, Http/Mail/Queue/Event/Storage fake, Artisan 명령과 권한 테스트, Pest 예시를 코드로 보여준다. 커버리지 목표와 DO/DON'T, Quick Reference 표가 있다. 전부 Laravel 특화 코드 예시이다.

<sub>세부 분류: 언어-프레임워크 테스트 지침</sub>

### laravel-verification

**Laravel 프로젝트의 환경, lint, 정적분석, 테스트/커버리지, 보안, 마이그레이션, 배포 준비를 7단계로 순차 점검하는 검증 루프.**

PR 전, 대규모 리팩터링 후, 배포 전에 실행한다. 환경과 Composer 검사가 실패하면 즉시 중단하고, pint/phpstan이 깨끗해야 테스트로 가며, 보안(`composer audit`)과 마이그레이션(`--pretend`) 검토는 테스트 이후, 캐시/큐/스케줄러 점검은 마지막 게이트로 둔다. 모든 내용은 PHP/Laravel artisan·composer 명령이며 CI 파이프라인 예시를 제공한다.

<sub>세부 분류: 언어-코딩지침 / 프레임워크 검증</sub>

### latency-critical-systems

**실시간/저지연 시스템의 p50/p95/p99, freshness, queue depth를 분리 측정하고 live readback으로 검증하는 가이드.**

핫 패스를 source→...→browser 구간별로 매핑해 각각 측정하고, 왕복 제거, 캐시, 배칭, backpressure 순의 최적화 순서를 제시한다. 배포된 표면이 있으면 HTTP 타이밍, provider freshness, 큐 상태, 브라우저 실검증 등 live readback으로 확인한다. 가드레일로 검증 생략을 통한 최적화 금지, stale 데이터를 캐시로 은폐 금지, 측정 없는 ms 주장 금지, 실주문/파괴적 마이그레이션은 승인 게이트 필요를 둔다.

<sub>세부 분류: 성능 엔지니어링 / 인프라</sub>

### perl-patterns

**Perl 5.36+의 현대 관용구(signatures, 에러 처리, Moo OO, 정규식, 파일 I/O 등)를 정리한 코딩 지침.**

`use v5.36`, subroutine signature, postfix dereference, `isa` 연산자, Try::Tiny와 네이티브 try/catch, Moo/Role, 5.38 `class`, named capture 정규식, 데이터 구조, 파일 I/O 같은 패턴을 Good/Bad 예시로 제시한다. 새 Perl 코드 작성이나 리뷰, 레거시 현대화에 쓰는 언어 레퍼런스다.

<sub>세부 분류: 언어-코딩지침</sub>

### perl-security

**Perl의 taint mode, 입력 검증, 안전한 프로세스 실행, DBI 파라미터화, 웹 보안, perlcritic 정책을 다루는 보안 코딩 지침.**

Perl 코드에서 사용자 입력, 파일 경로, 시스템 명령, SQL, HTML 출력을 다룰 때 따를 안전 패턴을 예시로 정리한다. 허용목록 검증, 3-arg open, list-form system, DBI placeholder, 출력 인코딩, CSRF/세션/헤더 설정을 포함한다. perlcritic 보안 정책(.perlcriticrc)과 CI 실행 명령, 빠른 체크리스트, 안티패턴 목록도 있다.

<sub>세부 분류: 언어-코딩지침 / 보안</sub>

### perl-testing

**Perl의 Test2::V0/Test::More, prove, 모킹, Devel::Cover 커버리지와 TDD를 다루는 테스트 패턴 가이드.**

RED-GREEN-REFACTOR 예시로 시작해 Test::More 기본 단언, Test2::V0 빌더, subtest, 예외 테스트, 디렉터리 구조와 prove 명령, Test::MockModule 모킹, Devel::Cover 커버리지(80% 임계 CI 실패 처리)를 설명한다. DO/DON'T 목록과 흔한 함정(done_testing 누락, over-mocking, test pollution)도 정리한다. 전부 Perl 도구 사용법이다.

<sub>세부 분류: 언어-코딩지침 / 테스트</sub>

### quarkus-patterns

**Quarkus 3.x와 Camel(RabbitMQ), Panache, CDI 기반의 서비스·REST·메시징·설정 코드 패턴 모음.**

Java Quarkus 백엔드를 만들거나 리뷰할 때 쓴다. 서비스 레이어, Logback LogContext 로깅, 이벤트 서비스, Camel 메시지 발행/direct route/파일 처리, REST 구조, Panache repository, 트랜잭션, DTO 검증, 예외 매핑, CompletableFuture, 캐시, YAML 설정, 헬스체크, Maven 의존성을 코드 예시로 다룬다. 마지막에 아키텍처/로깅/트랜잭션 등 Best Practices 목록이 있다.

<sub>세부 분류: 언어-코딩지침 (Java/Quarkus)</sub>

### quarkus-security

**Quarkus 애플리케이션의 JWT/OIDC 인증, RBAC, 입력 검증, SQL injection 방지, 헤더, 시크릿 관리 등 보안 구현 패턴 모음.**

Quarkus에서 인증/인가를 추가하거나 입력 검증, 시크릿, 보안 강화를 할 때 쓴다. `@RolesAllowed`, `SecurityIdentity`, Bean Validation, Panache 파라미터 쿼리, BCrypt, CORS, rate limiting(X-Forwarded-For 스푸핑 주의), 보안 헤더, 감사 로그 서비스, OWASP dependency-check 명령을 Java/properties 예시로 보여준다. 끝에 Best Practices 체크 목록이 있다.

<sub>세부 분류: 언어-코딩지침 / 보안</sub>

### quarkus-tdd

**Quarkus 3.x에서 JUnit5/Mockito/REST Assured/Camel 테스트와 JaCoCo 커버리지 게이트로 TDD를 하는 프레임워크 전용 테스트 가이드.**

Quarkus 서비스에 기능 추가·버그 수정·리팩터링 시 쓴다. 테스트 먼저(실패) → 최소 구현 → 리팩터링 → JaCoCo 80%+ 순서의 워크플로를 말하고, @Nested/@DisplayName/givenX_whenY_thenZ/AAA 구조의 단위 테스트, Camel 라우트의 AdviceWith+MockEndpoint 테스트, CompletableFuture와 LogContext 전파 테스트, REST Assured 리소스/통합 테스트 예시를 길게 싣는다. Maven JaCoCo 설정은 라인 80%, 브랜치 70% 미달 시 check가 실패하도록 한다.

<sub>세부 분류: 언어-코딩지침 / 테스트 (Quarkus/Java)</sub>

### quarkus-verification

**Quarkus 서비스를 build, 정적 분석, 테스트+JaCoCo, 보안 스캔, 네이티브 컴파일, 헬스체크 등 10단계로 검증하는 루프.**

PR 전, 대규모 리팩터링/의존성 업그레이드 후, 배포 전에 실행한다. Phase 1 Build(실패 시 중단) → Checkstyle/PMD/SpotBugs → 테스트와 80% 커버리지 → OWASP dependency-check·ZAP → GraalVM native → K6 부하 → 헬스 → 컨테이너 이미지·Trivy → 설정 검증 → 문서 검토 순이다. 카테고리별 체크리스트, `set -e` 자동화 스크립트, GitHub Actions 예시도 있다. 산출물은 각종 리포트와 체크리스트 통과 여부다.

<sub>세부 분류: 검증 / 프레임워크 특화 (Quarkus/Java)</sub>

## 도메인 업무

### benchmark-methodology

**범위가 정해진 경쟁사 집합을 9개 차원, 1~5점 증거 기반 루브릭으로 채점해 프로필 카드를 만드는 경쟁 분석 방법론.**

competitive-platform-analysis 이후, competitive-report-structure 이전 단계에서 쓴다. 먼저 고객 positioning brief(전략적 긴장, 차별점)를 확정하고 9개 가중 차원(포지셔닝, 보이스, 비주얼, 패키징, 증거, 엔터프라이즈 준비도, 사고 리더십, 가격, 긴장 축)을 채점한다. 점수마다 한 줄 근거와 출처를 요구하며 단일 종합 점수와 긴장 축 평균을 금지한다. 산출물은 경쟁사별 프로필 카드와 tension 2x2 플롯이다.

<sub>세부 분류: 도메인-업무 / 경쟁 분석</sub>

### competitive-platform-analysis

**벤치마킹 전에 경쟁사 집합을 선정하고 Direct/Adjacent/Aspirational 티어로 나누며 출처를 정하는 경쟁 지형 스코핑 스킬.**

경쟁 분석의 첫 단계다. positioning brief가 없으면 진행하지 않고 브랜드 디스커버리 인터뷰로 확보하라고 규정한다. 8개 축(포지셔닝, 전문화, 규모, 계약 형태 등)으로 후보를 배치하고 1~5점 사전 필터 매트릭스로 10~18개를 8~12개 프로필 대상으로 줄인다. 모든 속성은 최소 두 출처로 교차 검증하며, 산출물은 티어와 출처 링크가 붙은 경쟁사 집합이다.

<sub>세부 분류: 도메인-업무 / 경쟁 분석</sub>

### competitive-report-structure

**점수화된 경쟁사 프로파일 카드를 임원/이사회용 경쟁 분석 보고서(8개 섹션)로 조립하는 구성 가이드.**

경쟁 분석 파이프라인의 마지막 단계로, positioning brief(전략적 긴장, brand balance, differentiator, target quadrant)를 먼저 확정한 뒤 Executive summary, 시장 지도, 경쟁사 tier, 벤치마킹 heatmap 매트릭스, deep dive, white-space/위협, 전략 권고, 출처 부록 순으로 구성한다. 합산 점수 컬럼 금지, 방법론은 부록에만 두기 등 안티패턴과 팀 정렬 질문을 포함한다. 산출물은 비즈니스 리포트다.

<sub>세부 분류: 도메인-업무 / 경쟁 분석 리포트</sub>

### connections-optimizer

**X·LinkedIn 팔로우/연결 네트워크를 점수화해 정리·추가 후보를 내고 사용자 어조의 아웃리치 초안을 만드는 소셜 네트워크 관리 스킬.**

사용자 우선순위, 대상 플랫폼, do-not-touch 목록, 모드(light-pass/default/aggressive)를 받아 팔로잉 인벤토리를 가져오고 상호성·활동성·브리지 가치 등으로 prune/keep/add 후보를 점수화한다. 채널(X DM, LinkedIn, Apple Mail 초안)을 고르고 brand-voice를 거쳐 초안을 쓴다. 산출물은 Prune Queue/Review Queue/Keep/Add Targets/Drafts를 담은 CONNECTIONS OPTIMIZER REPORT다.

<sub>세부 분류: 도메인-업무 (소셜/아웃리치)</sub>

### dashboard-builder

**Grafana/SigNoz 등에서 운영자 질문에서 출발해 허영 패널 없는 모니터링 대시보드를 만드는 가이드.**

대시보드를 만들 때 레이아웃이 아니라 건강/지연/처리량/포화도/서비스별 위험이라는 운영 질문에서 시작하라고 한다. 기존 대시보드 JSON 스키마를 먼저 조사하고, overview→performance→resources→service-specific 구조의 최소 보드를 만든 뒤 질문에 답하지 않는 패널을 제거한다. Elasticsearch/Kafka/API gateway 예시 패널 세트와 품질 체크리스트(유효 JSON, 제목·단위, 임계값, 변수, 시간 범위)를 제공한다.

<sub>세부 분류: 도메인-업무 / 관측 대시보드</sub>

### data-scraper-agent

**공개 데이터 소스를 스케줄로 수집해 Gemini로 enrich하고 Notion/Sheets/Supabase에 저장하는 수집 에이전트를 GitHub Actions 위에 만드는 빌드 가이드.**

COLLECT → ENRICH → STORE 3계층 구조로 Python 스크래퍼, Gemini 모델 fallback 클라이언트, 배치 AI 파이프라인, 사용자 피드백(`feedback.json`) 기반 선호 학습, Notion 동기화, cron 워크플로를 단계별 코드로 제시한다. 사용자에게 소스/필드/저장소/주기를 묻는 Step 1부터 Quality Checklist까지 포함한다. 중간의 "Untrusted Scraped Data" 절은 스크랩된 내용을 지시로 따르지 않고, enrichment 프롬프트와 분리하며, 설정을 바꾸지 못하게 하고, 이상 텍스트는 run 출력에 기록하라고 규정한다.

<sub>세부 분류: 도메인-업무 / 데이터 수집 자동화</sub>

### deep-research

**firecrawl/exa MCP로 다중 웹 소스를 검색·정독해 인라인 인용과 신뢰도가 붙은 리서치 보고서를 만드는 스킬.**

목표 확인, 3~5개 하위 질문 분해, 질문별 다중 검색(총 15~30 소스), 핵심 3~5개 소스 전문 정독, 보고서 작성(Executive Summary, 주제별 인용, Key Takeaways, Sources, Methodology), 전달 순으로 진행한다. 넓은 주제는 서브에이전트로 병렬화한다. "Untrusted Sources" 절은 수집 콘텐츠를 지시가 아닌 데이터로만 취급하고 출처 속 에이전트용 문구는 보고서에 표시하라고 규정한다.

<sub>세부 분류: 도메인-업무(리서치)</sub>

### lead-intelligence

**Exa/X API로 영업·제휴 대상 리드를 점수화하고 warm path를 찾아 채널별 아웃리치 초안을 만드는 파이프라인 스킬.**

5단계(Signal Scoring → Mutual Ranking → Warm Path Discovery → Enrichment → Outreach Draft)로 리드를 찾고 순위화한다. 신호별 가중치 표와 bridge 점수 수식으로 중개자를 랭킹하고, 이메일/LinkedIn/X 채널 규칙에 따라 메시지를 쓴다. signal-scorer 등 4개 서브에이전트를 쓰며 `brand-voice`의 VOICE PROFILE을 재사용한다. 도메인은 영업/마케팅 자동화이다.

<sub>세부 분류: 도메인-업무 (영업/아웃리치)</sub>

### quality-nonconformance

**규제 제조업(FDA 820, IATF 16949, AS9100)의 NCR 처리, 근본원인분석, CAPA, SPC, 공급사 품질 관리를 다루는 제조 품질 전문가 지침.**

부적합 탐지 → 격리 → 심각도 분류 → 근본원인 조사 → 처분 → 시정조치와 효과 검증·종결로 이어지는 NCR 생애주기를 설명한다. 5-Why/Ishikawa/fault tree/8D 선택 기준, CAPA 효과 검증, 검사 수준 조정, 공급사 에스컬레이션, 에스컬레이션 트리거, KPI, 커뮤니케이션 템플릿을 포함한다. 소프트웨어/AI 작업과 무관한 제조 품질 도메인 지식이다.

<sub>세부 분류: 도메인-업무 (제조 품질)</sub>

### security-bounty-hunter

**저장소에서 원격 도달 가능하고 버그 바운티에 인정될 만한 취약점만 골라 PoC와 보고서까지 만드는 헌팅 워크플로.**

취약점 제보/바운티 제출을 준비할 때 쓴다. SSRF, 인증 우회, 역직렬화, SQLi, 커맨드 인젝션, 경로 순회, 자동 XSS를 in-scope로 두고, 로컬 전용 pickle/eval, 보안 헤더 누락, self-XSS 등은 skip 목록으로 제외한다. 워크플로는 스코프 확인 → 진입점 탐색 → semgrep 등 정적 도구를 triage 입력으로만 사용 → 코드 경로 끝까지 읽기 → 최소 PoC → 중복 확인이다. Report Structure와 제출 전 Quality Gate를 제공한다.

<sub>세부 분류: 보안 / 도메인-업무 (취약점 헌팅)</sub>
