# ECC 스킬 관심사 필터링 (1차)

> **기준**: LLM의 확률적 동작을 사람이 통제·검증하는 장치. **V** 검증 / **I** 지침 / **L** 기록 / **F** 흐름 (상세 기준은 `GUIDE.md` 2장).

## 요약

| 관련도 | 개수 |
|---|---:|
| High | 33 |
| Medium | 17 |
| Low | 23 |
| None | 11 |
| **합계** | **84** |

| 축 | High | Medium | 전체(Low 포함) |
|---|---:|---:|---:|
| V 검증 | 28 | 8 | 50 |
| I 지침 | 23 | 8 | 36 |
| L 기록 | 15 | 7 | 23 |
| F 흐름 | 29 | 8 | 44 |

<sub>한 스킬이 여러 축에 걸칠 수 있어 축별 합계는 스킬 수보다 큽니다.</sub>

## 종합: 어디부터 보면 되나

High 스킬들을 **통제 지점**별로 묶었습니다. 각 묶음은 앞쪽에 둔 스킬일수록 해당 주제를 정면으로 다룹니다.

| 통제 지점 | 질문 | 먼저 볼 스킬 |
|---|---|---|
| **결과 검증 게이트** | AI가 만든 결과를 무엇으로 합격/불합격 판정하나 | `verification-loop` → `ai-regression-testing` → `browser-qa` → `eval-harness` → `agent-eval` → `agent-self-evaluation` |
| **지시·계획 + 사람 승인** | 작업을 어떻게 쪼개 지시하고, 사람은 어디서 끼어드나 | `orch-pipeline` (+ `orch-*` 래퍼 5종) → `blueprint` → `plan-canvas` → `contract-first` |
| **흐름 제어·실패 복구** | 루프를 언제 멈추고, 실패하면 어떻게 복구하나 | `autonomous-loops` → `continuous-agent-loop` → `agent-introspection-debugging` → `benchmark-optimization-loop` → `team-agent-orchestration` |
| **기록·메모리·핸드오프** | 무엇을 남기고, 다음 세션/에이전트에 어떻게 넘기나 | `unified-memory` → `terminal-ops` → `agentic-os` → `continuous-learning-v2` |
| **하네스 자체의 통제·감사** | 에이전트 설정·규칙·스킬이 실제로 지켜지고 안전한가 | `safety-guard` → `security-scan` → `skill-comply` → `agent-architecture-audit` → `agent-harness-construction` → `rules-distill` → `skill-stocktake` |

### 여러 스킬에 반복되는 통제 패턴

서브에이전트 보고에서 여러 스킬에 걸쳐 반복된 메커니즘입니다. ECC가 LLM을 통제하는 "문법"에 가깝습니다.

1. **결정적 검사 우선, LLM 판단은 보조**: deterministic grader 필수(`agent-eval`, `eval-harness`), "결정적 수집 + LLM 판단" 분리(`rules-distill`, `skill-comply`), 도구 사용 요구를 프롬프트가 아닌 코드로 강제(`agent-architecture-audit`), 확률적 skill 대신 결정적 hook으로 기록(`continuous-learning-v2`).
2. **작성자 ≠ 검토자**: 같은 모델이 쓰고 리뷰하는 맹점을 테스트로 차단(`ai-regression-testing`), 작성자와 리뷰어의 컨텍스트 분리(`autonomous-loops`), 생성 에이전트와 검증 에이전트 분리(`opensource-pipeline`), 계획서에 대한 적대적 리뷰(`blueprint`, `security-scan`).
3. **사람 승인 게이트는 2곳 (계획 후, 커밋 전)**: `orch-pipeline` 계열 전체. 승인을 "yes" 대신 구조화된 verdict로 받기(`plan-canvas`). 비가역 행위 직전에는 명시적 승인(`opensource-pipeline`, `safety-guard`).
4. **증거 없는 완료 주장 금지**: 증거가 부족하면 PASS 대신 INCONCLUSIVE(`browser-qa`), local/commit/push를 구분하는 상태 단어(`terminal-ops`), 증거 없는 점수 금지(`agent-self-evaluation`), "global optimum"이 아니라 "best measured safe variant"(`benchmark-optimization-loop`), 로그가 없으면 지어내지 않기(`cost-tracking`).
5. **반복에 상한을 두고, 같은 실패면 멈추기**: 반복 상한과 plateau 종료(`orch-build-mvp`), 같은 실패 시그니처가 반복되면 재시도 중단(`terminal-ops`), 말만 바꾼 재시도 금지(`agent-introspection-debugging`), churn·비용 드리프트를 실패 유형으로 정의(`continuous-agent-loop`).
6. **기억보다 현재 상태, 회상은 untrusted**: 회상은 증거일 뿐 확실성이 아님(`unified-memory`), 기억 대신 라이브 repo 상태를 읽기(`terminal-ops`), 사용자 정정이 에이전트 주장보다 우선(`agent-architecture-audit`).
7. **자동 승격 금지, 사람 검토 후 규칙화**: 메모리를 규칙으로 자동 승격하지 않음(`unified-memory`), 규칙 변경은 제안까지만 하고 적용은 사람 승인(`rules-distill`), 준수율이 낮은 단계는 hook 강제로 승격 권고(`skill-comply`). 반례로 `continuous-learning-v2`는 신뢰도 0.7이면 자동 승인되어 사람 검토 단계가 약합니다.

> 위 묶음과 패턴은 서브에이전트가 각 SKILL.md 본문에서 뽑은 근거를 병합 단계에서 재구성한 것입니다. 개별 주장은 아래 "상세" 섹션의 판단 근거로 거슬러 올라가 확인할 수 있습니다.

## 전체 스킬 표

| 스킬 | 관련도 | 축 | 한 줄 요약 | 확신도 |
|---|---|---|---|---|
| `agent-architecture-audit` | High | V, F, L, I | 에이전트/LLM 애플리케이션을 12개 레이어로 나눠 wrapper 회귀, 메모리 오염, 도구 규율 실패, 숨은 repair loop를 진단하고 severity 순 리포트를 만드는 감사 스킬. | 높음 |
| `agent-eval` | High | V | 코딩 에이전트(Claude Code, Aider, Codex 등)를 YAML 과제와 judge로 나란히 비교해 pass rate, 비용, 시간, 일관성을 측정하는 CLI 스킬. | 높음 |
| `agent-harness-construction` | High | I, F, V | 에이전트의 action space, 도구 정의, observation 포맷, 에러 복구 계약, 컨텍스트 예산을 설계·최적화하는 가이드. | 높음 |
| `agent-introspection-debugging` | High | F, L, V | 에이전트 실행 실패를 capture → diagnosis → contained recovery → report 4단계로 체계적으로 자가 디버깅하는 워크플로. | 높음 |
| `agentic-engineering` | High | V, I, F | eval-first 실행, 작업 분해, 모델 티어 라우팅으로 에이전트 주도 개발을 운영하는 짧은 원칙 스킬. | 높음 |
| `agentic-os` | High | I, L, F | Claude Code를 영속 런타임으로 보고 kernel(CLAUDE.md)-agents-commands-scripts-data 5개 디렉터리로 멀티에이전트 "OS"를 구성하는 아키텍처 가이드. | 높음 |
| `ai-regression-testing` | High | V, F | 같은 모델이 코드를 쓰고 리뷰할 때 생기는 맹점을 자동화 테스트(sandbox 모드 API 테스트)로 잡는 회귀 테스트 전략. | 높음 |
| `autonomous-loops` | High | F, V, L, I | `claude -p` 순차 파이프라인부터 RFC 기반 멀티에이전트 DAG(Ralphinho)까지 자율 루프 6가지 패턴과 선택 기준을 정리한 스킬(continuous-agent-loop으로 대체 예정). | 높음 |
| `benchmark-optimization-loop` | High | F, V, I, L | "더 빠르게 해줘" 요청을 baseline, 정확성 게이트, 탐색 예산이 있는 유한한 측정 루프로 바꾸는 스킬. | 높음 |
| `blueprint` | High | I, V, F, L | 한 줄 목표를 PR 하나 크기 단계들의 자기완결적 구축 계획서로 바꾸고, 적대적 리뷰 게이트와 계획 변경 프로토콜을 두는 계획 생성 스킬. | 높음 |
| `browser-qa` | High | V, F | 브라우저 자동화 MCP로 배포된 UI를 smoke/interaction/visual regression/accessibility 4단계로 검증하고 SHIP / DO NOT SHIP 판정을 내리는 스킬. | 높음 |
| `continuous-learning-v2` | High | L, F, I | PreToolUse/PostToolUse hook으로 세션을 관찰해 신뢰도 점수가 붙은 원자적 "instinct"를 만들고, 이를 skill/command/agent로 진화시키는 학습 시스템. | 높음 |
| `contract-first` | High | I, V | 하나의 기계 검증 가능한 계약(OpenAPI 등)을 기준으로 consumer/provider를 병렬 개발하고 같은 artifact에 대해 양측을 검증하게 하는 협업 규약. | 높음 |
| `eval-harness` | High | V, L, F | 구현 전에 capability/regression eval을 정의하고 code/model/rule/human grader로 채점하며 pass@k, pass^k로 신뢰도를 추적하는 eval 주도 개발(EDD) 프레임워크. | 높음 |
| `opensource-pipeline` | High | F, V, I | 비공개 프로젝트를 forker, sanitizer, packager 3개 에이전트로 fork → 비밀 제거 검증 → 패키징해 안전하게 공개하는 파이프라인. | 높음 |
| `orch-add-feature` | High | F, V, I | 신규 기능 추가를 research → plan → TDD → review → commit으로 오케스트레이션하는 `orch-pipeline` 위의 얇은 래퍼. | 높음 |
| `orch-pipeline` | High | F, V, I | orch-* 스킬군이 공유하는 Research-Plan-TDD-Review-Commit 파이프라인 엔진으로, 크기 분류기와 두 개의 사람 gate를 정의한다. | 높음 |
| `plan-canvas` | High | F, I, L | 계획/HTML 산출물을 로컬 브라우저 캔버스에 열어 사람이 요소를 짚어 주석, 채팅, Approve/Request changes 판정을 하고 에이전트는 CLI 한 번으로 JSON 피드백을 받는 리뷰 루프. | 높음 |
| `rules-distill` | High | I, L, V | 설치된 스킬들을 교차 분석해 2개 이상의 스킬에 반복되는 원칙을 추출하고 rules 파일에 추가·수정·신규 작성하도록 제안하는 스킬. | 높음 |
| `safety-guard` | High | F, L, I | PreToolUse hook으로 파괴적 명령을 가로채 확인을 받고(Careful), 쓰기를 한 디렉터리로 잠그며(Freeze), 둘을 합치는(Guard) 안전장치 스킬. | 높음 |
| `security-scan` | High | V, F, I | AgentShield로 `.claude/` 설정(CLAUDE.md, settings.json, MCP, hooks, agents)의 보안 취약점과 injection 위험을 스캔하고 등급을 매기는 스킬. | 높음 |
| `skill-comply` | High | V, L, I | 스킬/규칙/에이전트 정의를 에이전트가 실제로 따르는지 시나리오를 자동 생성해 실행하고 준수율을 리포트하는 스킬. | 높음 |
| `skill-stocktake` | High | V, L, F | 전역·프로젝트 스킬을 체크리스트와 AI 종합 판단으로 감사해 Keep/Improve/Update/Retire/Merge 판정을 내리는 `/skill-stocktake` 스킬. | 높음 |
| `team-agent-orchestration` | High | F, I, L, V | 여러 에이전트를 팀처럼 운영하기 위해 work item, 소유자, 에이전트 Kanban, 브랜치 격리, control pane, merge gate를 정의하는 스킬. | 높음 |
| `terminal-ops` | High | V, I, F | 저장소에서 명령 실행·CI 디버깅·좁은 수정을 할 때 실제 실행 증거와 정확한 상태 단어로 보고하게 하는 증거 우선 운영 워크플로. | 높음 |
| `unified-memory` | High | L, I, F | ECC Memory Vault로 Claude, Codex 등 여러 하네스 간에 검증 가능한 컨텍스트와 핸드오프를 공유하는 스킬. | 높음 |
| `verification-loop` | High | V, F | build, type, lint, test(커버리지), security grep, diff review 6단계를 돌려 PASS/FAIL 검증 리포트를 만드는 스킬. | 높음 |
| `agent-self-evaluation` | High | V, F | 복잡한 작업을 끝낸 뒤 에이전트가 5개 축(accuracy, completeness, clarity, actionability, conciseness)으로 자기 산출물을 1~5점 채점하고 개선안을 내는 스킬. | 중간 |
| `continuous-agent-loop` | High | F, V | 자율 에이전트 루프의 유형 선택, 권장 스택, 실패 모드, 복구 절차를 간단히 정리한 스킬. | 중간 |
| `orch-build-mvp` | High | F, V, I | 설계/스펙 문서(SDD/PRD)를 읽어 얇은 수직 슬라이스로 계획하고 GAN 하니스의 generator-evaluator 루프로 MVP를 빌드하는 오케스트레이션 래퍼. | 중간 |
| `orch-change-feature` | High | F, V, I | 동작 중인 기능의 동작을 바꿀 때 테스트를 새 명세로 먼저 수정한 뒤 구현하고 리뷰와 게이트 커밋까지 진행하는 오케스트레이션 래퍼. | 중간 |
| `orch-fix-defect` | High | F, V | 버그를 실패하는 회귀 테스트로 먼저 재현하고 green까지 고친 뒤 리뷰하고 게이트를 거쳐 커밋하는 오케스트레이션 래퍼. | 중간 |
| `orch-refine-code` | High | F, V, I | 동작을 바꾸지 않는 리팩터링을 테스트 green 확인, 작은 단계 재구성, 리뷰, 게이트 승인 커밋으로 오케스트레이션하는 얇은 래퍼 스킬. | 중간 |
| `agent-payment-x402` | Medium | F, L | x402 결제 프로토콜과 MCP 결제 도구로 에이전트가 지출 정책 안에서만 결제하도록 하는 스킬. | 높음 |
| `ai-first-engineering` | Medium | V, I | 에이전트가 구현 대부분을 생성하는 팀을 위한 프로세스·리뷰·테스트 기준을 짧게 정리한 운영 모델 스킬. | 높음 |
| `cost-tracking` | Medium | L | ECC cost-tracker hook이 남긴 로컬 JSONL 로그에서 토큰 사용량과 비용을 집계·보고하는 스킬. | 높음 |
| `agent-sort` | Medium | I, V | 저장소의 grep 증거로 ECC 구성요소(skills/commands/rules/hooks 등)를 DAILY와 LIBRARY로 분류해 프로젝트별 설치 계획을 만드는 스킬. | 중간 |
| `architecture-decision-records` | Medium | L, I | 코딩 중 발생한 아키텍처 결정을 `docs/adr/`에 번호 붙은 ADR 문서와 인덱스로 남기는 스킬. | 중간 |
| `automation-audit-ops` | Medium | V, L, F | hook, 스케줄 작업, MCP, 커넥터 등 자동화의 실제 상태를 증거 기반으로 인벤토리화하고 keep/merge/cut/fix-next를 권고하는 감사 워크플로. | 중간 |
| `autonomous-agent-harness` | Medium | F, L, I | Claude Code의 /loop, `claude -p`, 메모리, MCP, 컴퓨터 사용을 조합해 상시/예약 자율 에이전트를 구성하는 셋업 패턴 가이드. | 중간 |
| `benchmark` | Medium | V, L | Core Web Vitals, API p50/p95/p99, 빌드 시간을 측정해 `.ecc/benchmarks/` JSON 기준선과 before/after 비교로 성능 회귀를 탐지하는 스킬. | 중간 |
| `click-path-audit` | Medium | V, F | 버튼 핸들러의 호출 순서와 공유 상태 부작용을 추적해, 개별 함수는 정상인데 서로 상쇄되어 UI가 동작하지 않는 버그를 찾는 감사 절차. | 중간 |
| `codebase-onboarding` | Medium | I | 낯선 코드베이스를 4단계로 분석해 온보딩 가이드와 시작용 CLAUDE.md를 생성하는 스킬. | 중간 |
| `context-budget` | Medium | L, I | agents, skills, rules, MCP 서버, CLAUDE.md가 차지하는 컨텍스트 토큰을 감사해 우선순위화된 절감 권고를 내는 스킬. | 중간 |
| `quarkus-verification` | Medium | V, F | Quarkus 서비스를 build, 정적 분석, 테스트+JaCoCo, 보안 스캔, 네이티브 컴파일, 헬스체크 등 10단계로 검증하는 루프. | 중간 |
| `search-first` | Medium | I, F | 코드를 쓰기 전에 repo, npm/PyPI, MCP, 스킬, GitHub에서 기존 해결책을 찾아 adopt/extend/compose/build를 결정하는 리서치 선행 워크플로우. | 중간 |
| `security-review` | Medium | V | 인증, 입력, 시크릿, API 등을 다룰 때 적용하는 웹 애플리케이션 보안 체크리스트와 패턴 모음. | 중간 |
| `team-builder` | Medium | F | `claude agents`와 agents/ 마크다운에서 페르소나를 발견해 사용자가 최대 5개를 고르면 병렬 디스패치하고 합의/충돌을 종합하는 대화형 스킬. | 중간 |
| `workspace-surface-audit` | Medium | I, F | repo, MCP, 플러그인, env 키 이름, 하네스 설정을 읽기 전용으로 감사하고 ECC-native 다음 조치를 추천하는 스킬. | 중간 |
| `laravel-verification` | Medium | V | Laravel 프로젝트의 환경, lint, 정적분석, 테스트/커버리지, 보안, 마이그레이션, 배포 준비를 7단계로 순차 점검하는 검증 루프. | 낮음 |
| `csharp-testing` | Low | V | xUnit, FluentAssertions, NSubstitute, WebApplicationFactory, Testcontainers 등 C#/.NET 테스트 작성 패턴 가이드. | 높음 |
| `documentation-lookup` | Low | V | 라이브러리/프레임워크 질문에 학습 데이터 대신 Context7 MCP로 최신 문서를 조회해 답하는 스킬. | 높음 |
| `ecc-guide` | Low | I | ECC 저장소의 실제 파일을 읽어 ECC 구성요소 탐색, 설치, 스킬 추천 질문에 답하는 안내 스킬. | 높음 |
| `laravel-security` | Low | V, L | Laravel 앱의 인증, 인가, Eloquent, CSRF, XSS, API, 업로드, 배포 설정을 다루는 보안 코딩 지침. | 높음 |
| `laravel-tdd` | Low | V | PHPUnit/Pest, 팩토리, HTTP/Sanctum 테스트, fake, 커버리지 등 Laravel 테스트 작성 레시피 모음. | 높음 |
| `perl-security` | Low | V | Perl의 taint mode, 입력 검증, 안전한 프로세스 실행, DBI 파라미터화, 웹 보안, perlcritic 정책을 다루는 보안 코딩 지침. | 높음 |
| `quarkus-security` | Low | V | Quarkus 애플리케이션의 JWT/OIDC 인증, RBAC, 입력 검증, SQL injection 방지, 헤더, 시크릿 관리 등 보안 구현 패턴 모음. | 높음 |
| `benchmark-methodology` | Low | V | 범위가 정해진 경쟁사 집합을 9개 차원, 1~5점 증거 기반 루브릭으로 채점해 프로필 카드를 만드는 경쟁 분석 방법론. | 중간 |
| `code-tour` | Low | V | 페르소나별 단계형 코드 워크스루를 실제 파일·라인 anchor와 함께 CodeTour `.tour` JSON으로 생성하는 스킬. | 중간 |
| `configure-ecc` | Low | F | 현재 하네스(Claude Code/Codex/Kimi) 안에서 ECC 설치의 범위와 hook 모드를 대화형으로 설정하고 미리보기-적용-검증하는 설치 마법사 스킬. | 중간 |
| `connections-optimizer` | Low | F | X·LinkedIn 팔로우/연결 네트워크를 점수화해 정리·추가 후보를 내고 사용자 어조의 아웃리치 초안을 만드는 소셜 네트워크 관리 스킬. | 중간 |
| `cost-aware-llm-pipeline` | Low | F | 작업 복잡도별 모델 라우팅, 불변 예산 추적, 좁은 재시도, 프롬프트 캐싱으로 LLM API 비용을 통제하는 Python 패턴 모음. | 중간 |
| `data-scraper-agent` | Low | F, I | 공개 데이터 소스를 스케줄로 수집해 Gemini로 enrich하고 Notion/Sheets/Supabase에 저장하는 수집 에이전트를 GitHub Actions 위에 만드는 빌드 가이드. | 중간 |
| `deep-research` | Low | V, I | firecrawl/exa MCP로 다중 웹 소스를 검색·정독해 인라인 인용과 신뢰도가 붙은 리서치 보고서를 만드는 스킬. | 중간 |
| `e2e-testing` | Low | V | Playwright 기반 E2E 테스트의 POM, 설정, flaky 대응, 산출물 관리, CI 연동 패턴 모음. | 중간 |
| `ecc-recipes` | Low | F | 설명된 워크플로에 맞는 ECC 커맨드 그룹과 실행 순서, 중단 조건을 안내하거나 전체 레시피 계열을 조회하는 읽기 전용 조언 스킬. | 중간 |
| `latency-critical-systems` | Low | V | 실시간/저지연 시스템의 p50/p95/p99, freshness, queue depth를 분리 측정하고 live readback으로 검증하는 가이드. | 중간 |
| `lead-intelligence` | Low | I, F | Exa/X API로 영업·제휴 대상 리드를 점수화하고 warm path를 찾아 채널별 아웃리치 초안을 만드는 파이프라인 스킬. | 중간 |
| `perl-testing` | Low | V | Perl의 Test2::V0/Test::More, prove, 모킹, Devel::Cover 커버리지와 TDD를 다루는 테스트 패턴 가이드. | 중간 |
| `quarkus-tdd` | Low | V | Quarkus 3.x에서 JUnit5/Mockito/REST Assured/Camel 테스트와 JaCoCo 커버리지 게이트로 TDD를 하는 프레임워크 전용 테스트 가이드. | 중간 |
| `security-bounty-hunter` | Low | V | 저장소에서 원격 도달 가능하고 버그 바운티에 인정될 만한 취약점만 골라 PoC와 보고서까지 만드는 헌팅 워크플로. | 중간 |
| `skill-scout` | Low | I | 새 스킬을 만들기 전에 로컬/마켓플레이스/GitHub/웹에서 기존 스킬을 검색하고 외부 후보를 vetting하는 스킬. | 중간 |
| `terminal-opener` | Low | F | 실행 파일과 argv 배열을 셸 없이 WezTerm 등 보이는 터미널 창에 여는 launch plan 도구 스킬. | 중간 |
| `accessibility` | None | - | Web/iOS/Android UI를 WCAG 2.2 AA 기준으로 설계·구현·감사하기 위한 접근성 지침. | 높음 |
| `competitive-platform-analysis` | None | - | 벤치마킹 전에 경쟁사 집합을 선정하고 Direct/Adjacent/Aspirational 티어로 나누며 출처를 정하는 경쟁 지형 스코핑 스킬. | 높음 |
| `competitive-report-structure` | None | - | 점수화된 경쟁사 프로파일 카드를 임원/이사회용 경쟁 분석 보고서(8개 섹션)로 조립하는 구성 가이드. | 높음 |
| `compose-multiplatform-patterns` | None | - | Compose Multiplatform/Jetpack Compose의 상태 관리, 내비게이션, 컴포저블 설계, expect/actual, 성능, 테마 패턴 모음. | 높음 |
| `content-hash-cache-pattern` | None | - | SHA-256 내용 해시를 키로 파일 처리 결과를 캐시하고 서비스 레이어로 분리하는 Python 캐싱 패턴. | 높음 |
| `dashboard-builder` | None | - | Grafana/SigNoz 등에서 운영자 질문에서 출발해 허영 패널 없는 모니터링 대시보드를 만드는 가이드. | 높음 |
| `laravel-patterns` | None | - | Laravel의 계층 구조, 라우팅, Eloquent, 마이그레이션, FormRequest, API 리소스, 큐/캐시 패턴을 정리한 프레임워크 코딩 지침. | 높음 |
| `laravel-plugin-discovery` | None | - | LaraPlugins.io MCP로 Laravel 패키지를 검색하고 health score와 버전 호환성으로 평가하는 스킬. | 높음 |
| `perl-patterns` | None | - | Perl 5.36+의 현대 관용구(signatures, 에러 처리, Moo OO, 정규식, 파일 I/O 등)를 정리한 코딩 지침. | 높음 |
| `quality-nonconformance` | None | - | 규제 제조업(FDA 820, IATF 16949, AS9100)의 NCR 처리, 근본원인분석, CAPA, SPC, 공급사 품질 관리를 다루는 제조 품질 전문가 지침. | 높음 |
| `quarkus-patterns` | None | - | Quarkus 3.x와 Camel(RabbitMQ), Panache, CDI 기반의 서비스·REST·메시징·설정 코드 패턴 모음. | 높음 |

## 상세: High (33개)

### agent-architecture-audit

- **축**: V, F, L, I  ·  **확신도**: 높음  ·  **분류**: 에이전트 설계·운영 원칙·안전장치
- **요약**: 에이전트/LLM 애플리케이션을 12개 레이어로 나눠 wrapper 회귀, 메모리 오염, 도구 규율 실패, 숨은 repair loop를 진단하고 severity 순 리포트를 만드는 감사 스킬.
- **판단 근거**: 에이전트 스택 자체를 감사하는 것이 핵심 목적이다. 12레이어 표(system prompt, 세션 히스토리, 장기 메모리, 도구 선택/실행/해석, 숨은 repair loop, persistence)와 "프롬프트에만 있는 must use tool 규칙은 코드 gate가 아니다"라는 원칙이 LLM 비결정성 통제 문제를 직접 다룬다.
- **관심 포인트**: 도구 사용 요구를 프롬프트가 아닌 코드로 강제하는 원칙, 숨은 LLM 호출(repair/retry/summarize)을 찾는 grep 패턴, 내부 생성 결과와 사용자 전달 결과의 차이(rendering mutation) 점검, 메모리 admission 시 사용자 정정 > 에이전트 주장 규칙, severity 등급 + confidence + evidence_refs(file:line)를 갖춘 정형 리포트 스키마, 7개 빠른 진단 질문.

### agent-eval

- **축**: V  ·  **확신도**: 높음  ·  **분류**: 검증·평가
- **요약**: 코딩 에이전트(Claude Code, Aider, Codex 등)를 YAML 과제와 judge로 나란히 비교해 pass rate, 비용, 시간, 일관성을 측정하는 CLI 스킬.
- **판단 근거**: 에이전트 산출물을 결정적 judge와 LLM judge로 채점하고 반복 실행의 일관성까지 측정하는 것이 핵심 목적이다. Best Practices에 "3회 이상 반복(비결정성)", "commit 고정", "결정적 judge 최소 1개 포함(LLM judge는 노이즈)"이 명시돼 있다.
- **관심 포인트**: 확률적 에이전트를 반복 시행과 consistency 지표로 다루는 방식, worktree 격리로 재현성 확보, 결정적 judge와 LLM judge를 섞되 결정적 judge를 필수로 두는 규칙, 과제 정의를 테스트 픽스처처럼 버전 관리하는 원칙, 비용을 pass rate와 함께 추적.

### agent-harness-construction

- **축**: I, F, V  ·  **확신도**: 높음  ·  **분류**: 에이전트 설계·운영 원칙·안전장치
- **요약**: 에이전트의 action space, 도구 정의, observation 포맷, 에러 복구 계약, 컨텍스트 예산을 설계·최적화하는 가이드.
- **판단 근거**: 하네스 설계 자체가 핵심 목적이다. "Error Recovery Contract"(root cause hint, safe retry, stop condition), 고위험 작업의 micro-tool 분리, "Context Budgeting"(phase 경계에서 compact), "Benchmarking"(pass@k, 재시도 수)이 본문에 있다.
- **관심 포인트**: 도구 응답을 status/next_actions로 구조화해 에이전트의 행동을 유도하는 방식, 에러마다 중단 조건을 강제하는 복구 계약, 위험도에 따른 도구 granularity 규칙, 하네스 효과를 pass@1/재시도/비용으로 측정하는 지표.

### agent-introspection-debugging

- **축**: F, L, V  ·  **확신도**: 높음  ·  **분류**: 에이전트 설계·운영 원칙·안전장치
- **요약**: 에이전트 실행 실패를 capture → diagnosis → contained recovery → report 4단계로 체계적으로 자가 디버깅하는 워크플로.
- **판단 근거**: 실패 복구가 핵심 목적이다. 4단계 루프, "retry 전에 discriminating check 1회", 고위험이면 사람에게 escalate, 구조화된 Failure Capture/Self-Debug Report 템플릿, "I fixed it"만으로 끝내지 말고 증거를 제시하라는 Output Standard가 본문에 있다.
- **관심 포인트**: 같은 행동의 말만 바꾼 재시도를 금지하는 규칙, 복구 전 실패 상태를 먼저 기록하는 습관, 복구 후 "무엇이 고쳐졌음을 증명하는가"를 명시하는 증거 요구, 다음 에이전트/사람이 읽는 introspection report.

### agentic-engineering

- **축**: V, I, F  ·  **확신도**: 높음  ·  **분류**: 에이전트 설계·운영 원칙·안전장치
- **요약**: eval-first 실행, 작업 분해, 모델 티어 라우팅으로 에이전트 주도 개발을 운영하는 짧은 원칙 스킬.
- **판단 근거**: "Define completion criteria before execution", Eval-First Loop, "Review Focus for AI-Generated Code"가 AI 작업의 검증과 통제를 핵심 주제로 삼는다. 본문 전체가 이 원칙들로 구성된다.
- **관심 포인트**: 실행 전 완료 기준 정의와 baseline 대비 delta 비교, 검증 가능한 작업 단위 분해, 스타일은 자동 lint에 맡기고 리뷰는 불변식/경계/보안에 집중, 재시도·시간·성공 여부를 작업별로 기록하고 실패 시에만 모델 승급. 다만 구체 절차나 도구 없이 원칙 수준이다.

### agentic-os

- **축**: I, L, F  ·  **확신도**: 높음  ·  **분류**: 에이전트 설계·운영 원칙·안전장치
- **요약**: Claude Code를 영속 런타임으로 보고 kernel(CLAUDE.md)-agents-commands-scripts-data 5개 디렉터리로 멀티에이전트 "OS"를 구성하는 아키텍처 가이드.
- **판단 근거**: 핵심이 kernel 라우팅 규칙·에이전트별 Constraints/Tool Access/Memory Scope(지침), append-only 로그·decision record·세션 reflection(기록), 라우팅/스케줄/병렬 실행(흐름)이다. 검증 메커니즘은 거의 없다.
- **관심 포인트**: 라우팅을 코드가 아닌 markdown 표로 선언해 검사 가능하게 두는 원칙, 에이전트별 Memory Scope로 읽기 범위 제한, append-only 로그와 "필드 rename 금지·deprecated 표시" 스키마 진화 규칙, 세션 말 reflection 루프, 세션 종속 cron 대신 외부 스케줄러 사용, 세션당 비용 로그.

### ai-regression-testing

- **축**: V, F  ·  **확신도**: 높음  ·  **분류**: 검증·평가
- **요약**: 같은 모델이 코드를 쓰고 리뷰할 때 생기는 맹점을 자동화 테스트(sandbox 모드 API 테스트)로 잡는 회귀 테스트 전략.
- **판단 근거**: "AI 자기 리뷰를 자동화 테스트의 대체로 믿지 말라"는 것이 스킬의 핵심 전제이며, 기계적 게이트(test → build → AI review)를 앞세우는 bug-check 워크플로가 본문의 중심이다. Next.js/Vitest 예시는 구체적이나 원칙은 범용적이다.
- **관심 포인트**: 작성자=검토자 문제를 기계적 게이트로 해결하는 순서 설계("테스트 실패 시 AI 판단 없이 버그 확정"), 버그가 발견된 곳에만 테스트를 추가하는 "Test Where Bugs Were Found" 전략, 테스트 이름에 BUG ID를 붙여 추적, AI가 반복하는 오류 카테고리 목록을 리뷰 체크리스트로 사용.

### autonomous-loops

- **축**: F, V, L, I  ·  **확신도**: 높음  ·  **분류**: 오케스트레이션·워크플로
- **요약**: `claude -p` 순차 파이프라인부터 RFC 기반 멀티에이전트 DAG(Ralphinho)까지 자율 루프 6가지 패턴과 선택 기준을 정리한 스킬(continuous-agent-loop으로 대체 예정).
- **판단 근거**: 루프 제어가 핵심 목적이다. 종료 조건(max-runs/cost/duration, completion-threshold 3회 연속), Ralphinho의 "리뷰어는 작성자가 아니다" 규칙, tier별 리뷰 깊이, merge queue의 rebase→테스트→land/evict 게이트와 eviction 컨텍스트 재투입, "any loop + verification-loop" 게이트, 중단 후 SQLite 재개가 본문에 구체적으로 있다.
- **관심 포인트**: 무한 루프 방지용 다중 종료 조건, 작성자-리뷰어 컨텍스트 분리로 author bias 제거, 부정 지시 대신 별도 De-Sloppify 패스를 두는 설계, 실패 시 맹목 재시도 대신 오류 컨텍스트를 다음 시도에 주입, 반복 간 SHARED_TASK_NOTES.md 기록, 작업 계획을 사람 개입의 최고 레버리지 지점으로 보는 원칙, `--allowedTools`로 단계별 권한 제한.

### benchmark-optimization-loop

- **축**: F, V, I, L  ·  **확신도**: 높음  ·  **분류**: 오케스트레이션·워크플로
- **요약**: "더 빠르게 해줘" 요청을 baseline, 정확성 게이트, 탐색 예산이 있는 유한한 측정 루프로 바꾸는 스킬.
- **판단 근거**: 에이전트의 무한·모호한 최적화 요청을 bounded loop로 제약하는 것이 목적이다. Promotion Gate(정확성 테스트 통과, 델타 재현, rollback 명확, 소스 반영, 정확한 명령·수치 포함 요약)와 중단 조건, ledger가 본문 핵심이다.
- **관심 포인트**: 시작 전 필수 전제 조건(Required Baseline), 예산·중단 조건이 있는 루프, 한 번에 한 가설만 바꾸는 규칙, 모든 run을 ledger에 남김, "global optimum" 대신 "best measured safe variant"라고 쓰게 하는 과장 방지 표현 규칙.

### blueprint

- **축**: I, V, F, L  ·  **확신도**: 높음  ·  **분류**: 오케스트레이션·워크플로
- **요약**: 한 줄 목표를 PR 하나 크기 단계들의 자기완결적 구축 계획서로 바꾸고, 적대적 리뷰 게이트와 계획 변경 프로토콜을 두는 계획 생성 스킬.
- **판단 근거**: 핵심 목적이 사람/에이전트가 실행할 계획·스펙을 구조화하는 것(지침)이며, 단계별 verification commands/exit criteria, adversarial review gate, 매 단계 후 invariant 검증(검증), 의존성·병렬·롤백·mutation 프로토콜(흐름), 메모리 index 갱신(기록)을 포함한다.
- **관심 포인트**: 단계마다 context brief를 넣어 새 세션의 agent가 "cold start"로 실행하게 하는 구조, 계획서 자체를 별도 모델이 적대적으로 리뷰하는 게이트, 모든 단계에 exit criteria와 불변식 검증 명령을 강제, 계획 변경을 형식화하고 감사 기록 남김.

### browser-qa

- **축**: V, F  ·  **확신도**: 높음  ·  **분류**: 검증·평가
- **요약**: 브라우저 자동화 MCP로 배포된 UI를 smoke/interaction/visual regression/accessibility 4단계로 검증하고 SHIP / DO NOT SHIP 판정을 내리는 스킬.
- **판단 근거**: 핵심이 배포 결과를 자동으로 검증하고 판정(verdict)이 있는 리포트로 게이트를 내리는 것이다. "baseline 없으면 조용한 PASS 대신 INCONCLUSIVE", "axe-core 통과는 필요조건일 뿐, 'accessible'이라 보고 금지"처럼 검증 한계를 명시하고, 안전 규칙(read-only 기본, 명시적 opt-in)이 흐름 통제 역할을 한다.
- **관심 포인트**: 증거 부족 시 PASS 대신 INCONCLUSIVE를 내는 판정 체계, 자동 검사의 커버리지 한계(axe 30–40%)를 리포트에 명시하는 정직성 규칙, 변경성 동작은 staging + 명시 opt-in에서만 허용하는 기본 read-only 원칙.

### continuous-learning-v2

- **축**: L, F, I  ·  **확신도**: 높음  ·  **분류**: 메모리·기록·관측
- **요약**: PreToolUse/PostToolUse hook으로 세션을 관찰해 신뢰도 점수가 붙은 원자적 "instinct"를 만들고, 이를 skill/command/agent로 진화시키는 학습 시스템.
- **판단 근거**: 핵심 목적이 hook 기반 세션 관찰 기록(observations.jsonl)과 그로부터 학습된 규칙(instinct)의 축적이다. 본문 "Why Hooks vs Skills" 절은 skill은 확률적으로 50~80%만 발동하지만 hook은 100% 결정적이라 관찰에 hook을 쓴다고 명시한다. 신뢰도 구간별 적용 방식(0.3 제안만, 0.7 자동 적용)과 승격 기준도 구체적이다.
- **관심 포인트**: 확률적 skill 대신 결정적 hook으로 기록을 보장하는 설계, 신뢰도 점수(교정 시 하락, 반복 관찰 시 상승)와 임계값별 적용 강도, 프로젝트 스코프 격리와 승격 기준(2+ 프로젝트, 평균 0.8), 사용자 교정을 학습 신호로 쓰는 방식. 보조 파일에서는 hook 단계의 secret 정규식 scrub, 30일 자동 purge, `disabled` 파일 kill switch, observer 기본 비활성, session-guardian.sh(활성 시간대, 프로젝트별 cooldown, idle 검사)로 백그라운드 agent를 제어하는 안전장치가 있다. 한계로 자동 생성 instinct에 사람 검토 단계가 약하고(0.7 자동 승인), SKILL.md가 이를 명시적 게이트로 다루지는 않는다.

### contract-first

- **축**: I, V  ·  **확신도**: 높음  ·  **분류**: 검증·평가
- **요약**: 하나의 기계 검증 가능한 계약(OpenAPI 등)을 기준으로 consumer/provider를 병렬 개발하고 같은 artifact에 대해 양측을 검증하게 하는 협업 규약.
- **판단 근거**: 단일 권위 artifact로 지시를 고정하고(I), 생성된 타입·fixture·provider 응답을 같은 계약으로 검증(V)하는 범용 메커니즘이 핵심이다. 다중 에이전트/사람이 병렬 작업할 때 인터페이스를 임의로 바꾸지 못하게 하는 변경 프로토콜(7단계)과 Completion Checklist가 있다.
- **관심 포인트**: 계약 먼저 변경 후 구현하는 순서 강제, 컴파일 타임 타입만으로 증명하지 않고 직렬화 응답을 검증하라는 규칙, 계약 diff를 이해관계자 리뷰 대상으로 취급, 에이전트가 계약 내용을 지시로 따르지 않도록 하는 데이터/지시 분리와 generator 최소 권한.

### eval-harness

- **축**: V, L, F  ·  **확신도**: 높음  ·  **분류**: 검증·평가
- **요약**: 구현 전에 capability/regression eval을 정의하고 code/model/rule/human grader로 채점하며 pass@k, pass^k로 신뢰도를 추적하는 eval 주도 개발(EDD) 프레임워크.
- **판단 근거**: AI 작업의 통과 기준을 사전에 정의하고 채점·회귀 추적하는 것이 핵심 목적이다. 해시 연결 journal과 receipt 오프라인 검증, 격리 없는 후보 실행 거부, "flaky grader를 릴리스 게이트에 쓰지 말 것" 등 구체 통제가 있다.
- **관심 포인트**: 코딩 전 eval 정의(테스트 선행과 유사), deterministic grader 우선·보안은 사람 검토, pass@k vs pass^k 구분, eval 이력/baseline의 버전 관리, fail-closed 설계와 "capsule receipt를 격리/승격 증거로 제시하지 말 것"이라는 과대주장 방지 문구, eval 오버피팅·비용/지연 드리프트 안티패턴.

### opensource-pipeline

- **축**: F, V, I  ·  **확신도**: 높음  ·  **분류**: 오케스트레이션·워크플로
- **요약**: 비공개 프로젝트를 forker, sanitizer, packager 3개 에이전트로 fork → 비밀 제거 검증 → 패키징해 안전하게 공개하는 파이프라인.
- **판단 근거**: 단계 사이에 독립 sanitizer 에이전트를 안전 게이트로 두는 것이 핵심이다. FAIL이면 중단하고 사용자에게 수정/중단을 묻고 재스캔은 최대 3회로 제한하며, 3회 실패 시 수동 수정을 요구한다. Anti-Patterns가 "사용자 승인 없는 push 금지, sanitizer 생략 금지, FAIL 후 진행 금지"를 명시한다.
- **관심 포인트**: 생성 에이전트와 검증 에이전트의 분리, 보고서 파일(FORK/SANITIZATION_REPORT)을 단계 간 인계 산출물로 쓰는 방식, PASS/FAIL 게이트와 재시도 상한(3회), 비가역 행위(public 게시) 직전의 명시적 사용자 승인, staging 디렉터리에서의 검토 후 게시.

### orch-add-feature

- **축**: F, V, I  ·  **확신도**: 높음  ·  **분류**: 오케스트레이션·워크플로
- **요약**: 신규 기능 추가를 research → plan → TDD → review → commit으로 오케스트레이션하는 `orch-pipeline` 위의 얇은 래퍼.
- **판단 근거**: 두 개의 사람 승인 gate와 크기 분류, TDD 우선, 보안 리뷰 조건부 추가가 명시되어 있다. 다만 본문은 설정만 담은 짧은 래퍼이고 메커니즘 본체는 `orch-pipeline`에 있다. **[병합 단계에서 Medium → High 조정, "병합 단계 등급 조정" 참조]**
- **관심 포인트**: 작업 종류별로 phase mask와 첫 동작 규칙만 바꾸는 래퍼 구조, plan 승인 전 구현 금지, commit 전 확인 gate.

### orch-pipeline

- **축**: F, V, I  ·  **확신도**: 높음  ·  **분류**: 오케스트레이션·워크플로
- **요약**: orch-* 스킬군이 공유하는 Research-Plan-TDD-Review-Commit 파이프라인 엔진으로, 크기 분류기와 두 개의 사람 gate를 정의한다.
- **판단 근거**: 작업 흐름의 통제(크기별 ceremony 조절, 2개 승인 gate, 에이전트 위임 맵, CRITICAL/HIGH 리뷰 이슈 해소 후 Gate 2)가 스킬의 핵심 목적이다.
- **관심 포인트**: blast radius에 비례한 right-sizing과 사용자 override 가능한 한 줄 선언, gate 사이는 자율/gate에서는 사람 승인이라는 분리, 보안 trigger 기반 조건부 리뷰, 계획 문서를 handoff artifact로 쓰는 무상태 설계, 파이프라인 준수 여부를 확인하는 Verification 체크리스트.

### plan-canvas

- **축**: F, I, L  ·  **확신도**: 높음  ·  **분류**: 오케스트레이션·워크플로
- **요약**: 계획/HTML 산출물을 로컬 브라우저 캔버스에 열어 사람이 요소를 짚어 주석, 채팅, Approve/Request changes 판정을 하고 에이전트는 CLI 한 번으로 JSON 피드백을 받는 리뷰 루프.
- **판단 근거**: 계획 승인 gate를 구조화된 사람 검토 루프로 구현한 것이 핵심이다. 미전달 피드백을 막는 stop hook, 큐에 남는 피드백, 사용자 종료 시 재개 금지 등 구체적 제어 메커니즘이 있다.
- **관심 포인트**: 승인 판정을 타이핑한 "yes" 대신 구조화된 verdict로 받는 방식, 요소 앵커 기반 피드백으로 지시 정밀도를 높이는 점, stop hook으로 미응답 피드백 상태에서 턴 종료를 막는 안전장치, typing 인디케이터가 만료되어 크래시한 에이전트를 정직하게 표시하는 설계, 모든 메시지에 응답하라는 규칙.

### rules-distill

- **축**: I, L, V  ·  **확신도**: 높음  ·  **분류**: 메타(스킬·설정·환경 관리)
- **요약**: 설치된 스킬들을 교차 분석해 2개 이상의 스킬에 반복되는 원칙을 추출하고 rules 파일에 추가·수정·신규 작성하도록 제안하는 스킬.
- **판단 근거**: 스킬에서 반복되는 원칙을 rules(지침)로 승격하는 것이 핵심 목적이다. "Never modify rules automatically. Always require user approval", 3중 필터(2+ 스킬 증거, 행동 가능성, violation risk), 후보별 status를 results.json에 남기는 기록 구조가 구체적이다.
- **관심 포인트**: 규칙 승격 기준(2+ 스킬 증거, "do X/don't do Y" 형태, 위반 시 위험 1문장, 중복 아님), "결정적 수집 + LLM 판단" 분리, 자동 변경 금지와 사람 승인, 근거 없는 verdict를 막는 Good/Bad 품질 예시, 후보별 승인/스킵 이력 기록.

### safety-guard

- **축**: F, L, I  ·  **확신도**: 높음  ·  **분류**: 에이전트 설계·운영 원칙·안전장치
- **요약**: PreToolUse hook으로 파괴적 명령을 가로채 확인을 받고(Careful), 쓰기를 한 디렉터리로 잠그며(Freeze), 둘을 합치는(Guard) 안전장치 스킬.
- **판단 근거**: 핵심 목적이 에이전트의 파괴적 행동을 hook(Bash/Write/Edit/MultiEdit 대상 PreToolUse)으로 사전 차단·승인 요구하는 흐름 통제다. 디렉터리 쓰기 범위 제한은 작업 제약(지침)이고 blocked action 로그는 기록에 해당한다.
- **관심 포인트**: 위험 명령 패턴 목록 + 확인 요청 + 대안 제시, 쓰기 범위를 디렉터리로 고정하는 Freeze, 자율 실행 세션에서 기본 활성화하라는 권고, 차단 이력 로깅. 본문은 구현 상세(패턴 매칭 방식, hook 설정)를 주지 않아 선언 수준이다.

### security-scan

- **축**: V, F, I  ·  **확신도**: 높음  ·  **분류**: 검증·평가
- **요약**: AgentShield로 `.claude/` 설정(CLAUDE.md, settings.json, MCP, hooks, agents)의 보안 취약점과 injection 위험을 스캔하고 등급을 매기는 스킬.
- **판단 근거**: AI 하네스 설정(권한 allow/deny, hook, MCP, agent 정의, CLAUDE.md의 auto-run 지시)을 정적 감사해 등급 리포트와 CI 게이트로 만드는 것이 핵심 목적이다. AI 작업의 통제 장치 자체를 검증 대상으로 삼는다.
- **관심 포인트**: 권한 deny 목록/Bash 와일드카드/hook 보간 injection 같은 통제 장치 설정 결함 목록, 점수 기반 등급과 severity별 조치 시점 구분, CI에서 `fail-on-findings`로 게이트화, 수정 가능한 항목만 자동 수정하고 수동 항목은 건드리지 않는 규칙, red/blue/auditor 적대적 3-agent 리뷰 구조.

### skill-comply

- **축**: V, L, I  ·  **확신도**: 높음  ·  **분류**: 검증·평가
- **요약**: 스킬/규칙/에이전트 정의를 에이전트가 실제로 따르는지 시나리오를 자동 생성해 실행하고 준수율을 리포트하는 스킬.
- **판단 근거**: 핵심 목적이 "지침을 줬다고 지켜질 거라 가정하지 말고 측정"하는 것이며(Key Concept: Prompt Independence), 트레이스 캡처, 분류, 순서 검증, 리포트 파이프라인이 구체적이다. 규칙과 스킬이라는 지침(I)의 이행을 행동 로그(L)로 검증(V)한다.
- **관심 포인트**: 프롬프트 지지도를 낮춰가며 준수가 유지되는지 보는 3단계 엄격도 설계, LLM 분류(의미 판단)와 결정적 순서 검사의 혼합, 준수율이 낮은 단계를 hook 강제로 승격하는 권고, 스킬/규칙/에이전트 정의 모두를 대상으로 하는 점.

### skill-stocktake

- **축**: V, L, F  ·  **확신도**: 높음  ·  **분류**: 메타(스킬·설정·환경 관리)
- **요약**: 전역·프로젝트 스킬을 체크리스트와 AI 종합 판단으로 감사해 Keep/Improve/Update/Retire/Merge 판정을 내리는 `/skill-stocktake` 스킬.
- **판단 근거**: 스킬(지침 자산)의 품질을 정형 체크리스트와 판정 스키마로 검증하는 것이 핵심이다. results.json에 mtime·verdict·reason·batch_progress를 기록하고, quick-diff로 증분 재평가하며, 삭제/아카이브는 반드시 사용자 확인을 요구한다.
- **관심 포인트**: 증분 평가(mtime diff)와 전체 평가 이원화, 청크 단위 저장과 resume 감지, 출처와 무관하게 같은 체크리스트를 적용하는 blind 평가, 판정 사유의 품질 요건(증거 재기술, 대체 수단 명시), 파괴적 조치 전 사용자 승인, 평가 시각을 실제 UTC로 기록하는 규칙.

### team-agent-orchestration

- **축**: F, I, L, V  ·  **확신도**: 높음  ·  **분류**: 오케스트레이션·워크플로
- **요약**: 여러 에이전트를 팀처럼 운영하기 위해 work item, 소유자, 에이전트 Kanban, 브랜치 격리, control pane, merge gate를 정의하는 스킬.
- **판단 근거**: 멀티 에이전트 작업의 소유권, 상태 전이 기준, 병합 게이트를 통제하는 것이 핵심 목적이다. 상태 전이마다 증거(테스트, 로그, handoff)를 요구하고 "merge readiness by gate, not vibes"를 명시한다.
- **관심 포인트**: 컬럼별 Exit Criteria로 상태 전이를 검증 가능하게 만듦, 카드에 merge_gate와 handoff 경로를 필수 필드로 둠, 한 파일에 쓰기 소유자 1명 원칙과 단일 integrator, Running→Review 이전 eval 요구, "누가 소유하고 무엇이 바뀌고 어떤 게이트가 실패했는가"에 답할 수 있기 전에는 자동화를 늘리지 않는 규칙.

### terminal-ops

- **축**: V, I, F  ·  **확신도**: 높음  ·  **분류**: 검증·평가
- **요약**: 저장소에서 명령 실행·CI 디버깅·좁은 수정을 할 때 실제 실행 증거와 정확한 상태 단어로 보고하게 하는 증거 우선 운영 워크플로.
- **판단 근거**: "do not claim fixed until the proving command was rerun", "do not claim pushed unless the branch actually moved" 같은 주장-증거 일치 규칙과 상태 어휘 표준화, 읽기 전용 모드 준수, 파괴적 git 명령 금지 가드레일이 본문 핵심이다.
- **관심 포인트**: 완료 주장과 증거를 묶는 상태 단어 체계(local 검증 vs commit vs push 구분), 동일 실패 시그니처 반복 시 광범위 재시도 중단, 라이브 repo 상태를 기억 대신 읽기, 응답에 증명 명령/브랜치 명시를 요구하는 Verification 절.

### unified-memory

- **축**: L, I, F  ·  **확신도**: 높음  ·  **분류**: 메모리·기록·관측
- **요약**: ECC Memory Vault로 Claude, Codex 등 여러 하네스 간에 검증 가능한 컨텍스트와 핸드오프를 공유하는 스킬.
- **판단 근거**: 에이전트 간 메모리 기록과 핸드오프가 핵심 목적이다. 스코프 분리, fail-closed `.gitignore`, create-only 쓰기, trust: unreviewed, 비밀 저장 거부, 회상 내용을 지시로 취급 금지 등 구체적 통제 규칙이 있다.
- **관심 포인트**: 회상 내용은 untrusted 데이터이며 권한을 부여하지 못한다는 원칙, 핸드오프 본문 구성(목표/현재 상태/증거/남은 작업/다음 행동), 메모리를 정책/규칙으로 자동 승격하지 않고 사람 검토를 거치는 규칙, MCP 표면에서 overwrite/review/shell 도구를 의도적으로 제외한 최소 권한 설계, `doctor`로 vault 무결성 검증.

### verification-loop

- **축**: V, F  ·  **확신도**: 높음  ·  **분류**: 검증·평가
- **요약**: build, type, lint, test(커버리지), security grep, diff review 6단계를 돌려 PASS/FAIL 검증 리포트를 만드는 스킬.
- **판단 근거**: AI 세션 작업을 게이트 방식으로 검증하고 리포트로 판정하는 것이 핵심 목적이다. 단계별 중단 조건, 정형 리포트, Continuous Mode, hook 연계를 갖춘다.
- **관심 포인트**: 빌드 실패 시 중단하는 순차 게이트, READY/NOT READY 판정 리포트 포맷, 주기적/체크포인트 재검증, 즉시 검사(hook)와 포괄 검사(스킬)의 역할 분담. 단 명령이 npm/tsc 중심이고 보안 grep이 얕다는 한계가 있다.

### agent-self-evaluation

- **축**: V, F  ·  **확신도**: 중간  ·  **분류**: 검증·평가
- **요약**: 복잡한 작업을 끝낸 뒤 에이전트가 5개 축(accuracy, completeness, clarity, actionability, conciseness)으로 자기 산출물을 1~5점 채점하고 개선안을 내는 스킬.
- **판단 근거**: 5점 미만에는 반드시 구체적 증거를 인용하는 "Evidence Rule", 축별 독립 채점, "Everything is a 5" 같은 안티패턴 명시 등 AI 출력의 자기 검증 절차가 핵심 목적이다. 단 pass/fail 게이트가 아닌 성찰 단계이며 채점자가 작업 수행자 본인이다.
- **관심 포인트**: 증거 없는 점수 금지 규칙, 평균을 먼저 정하고 역산하지 못하게 하는 독립 채점, 도구 출력(테스트·린트)을 증거로 쓰는 원칙, Stop hook 연계, 자기 채점의 과대평가 편향을 막는 안티패턴 목록. 한계: 자기 평가라 외부 검증을 대체하지 못한다.

### continuous-agent-loop

- **축**: F, V  ·  **확신도**: 중간  ·  **분류**: 오케스트레이션·워크플로
- **요약**: 자율 에이전트 루프의 유형 선택, 권장 스택, 실패 모드, 복구 절차를 간단히 정리한 스킬.
- **판단 근거**: 루프 선택 흐름, 품질 게이트·eval 게이팅, Failure Modes와 Recovery(freeze, audit, scope 축소, replay)가 루프 제어와 실패 복구라는 F축을 정면으로 다룬다. 다만 본문은 개요 수준이라 상세 메커니즘은 참조된 스킬에 있다.
- **관심 포인트**: 루프 실패를 "진척 없는 churn, 같은 원인 반복 재시도, 비용 드리프트"로 유형화한 점, 복구를 동결, 감사, 범위 축소, 기준 명시 후 재실행 순서로 규정한 점, eval 게이트와 세션 영속화를 결합한 권장 스택.

### orch-build-mvp

- **축**: F, V, I  ·  **확신도**: 중간  ·  **분류**: 오케스트레이션·워크플로
- **요약**: 설계/스펙 문서(SDD/PRD)를 읽어 얇은 수직 슬라이스로 계획하고 GAN 하니스의 generator-evaluator 루프로 MVP를 빌드하는 오케스트레이션 래퍼.
- **판단 근거**: 단계(phase mask), 사람 승인 Gate 1/2, generator-evaluator 루프(임계 점수, 최대 반복, 정체 종료), 피드백 파일 기록으로 AI 빌드 흐름을 제어하는 것이 핵심이다. 상세 엔진 로직은 orch-pipeline에 있어 이 파일은 설정 래퍼 수준이다.
- **관심 포인트**: 스펙을 eval-rubric으로 변환해 평가 기준을 고정, 점수 임계값과 반복 상한 및 plateau 종료, 슬라이스 단위 게이트와 커밋 분리, 보안 트리거 시 리뷰어 추가, 기존 하니스 재사용 원칙.

### orch-change-feature

- **축**: F, V, I  ·  **확신도**: 중간  ·  **분류**: 오케스트레이션·워크플로
- **요약**: 동작 중인 기능의 동작을 바꿀 때 테스트를 새 명세로 먼저 수정한 뒤 구현하고 리뷰와 게이트 커밋까지 진행하는 오케스트레이션 래퍼.
- **판단 근거**: 단계 마스크, 두 개의 승인 게이트(Gate 1, Gate 2), 테스트 선행 변경, 리뷰와 조건부 security-reviewer가 본문 전체를 이룬다. 다만 엔진 본체는 orch-pipeline에 있고 이 스킬은 설정값만 정의하는 얇은 래퍼다.
- **관심 포인트**: "테스트를 먼저 바꾸는 것이 tweak와 fix를 가른다"는 규칙, 사람 승인 게이트를 계획/변경 테스트와 커밋 직전 두 곳에 두는 구조, 작업 유형별(변경/수정/추가) phase mask와 크기 하한으로 작업 흐름을 표준화하는 방식, 보안 트리거 시 리뷰어 추가. 상세 메커니즘은 orch-pipeline 확인 필요.

### orch-fix-defect

- **축**: F, V  ·  **확신도**: 중간  ·  **분류**: 오케스트레이션·워크플로
- **요약**: 버그를 실패하는 회귀 테스트로 먼저 재현하고 green까지 고친 뒤 리뷰하고 게이트를 거쳐 커밋하는 오케스트레이션 래퍼.
- **판단 근거**: red-then-green 회귀 테스트 선행, 단계별 에이전트 위임, 커밋 전 사람 게이트로 AI 버그 수정 흐름을 통제한다. 본문이 짧은 래퍼라 세부 메커니즘은 orch-pipeline에 의존한다.
- **관심 포인트**: 실패 테스트로 재현 후 수정이라는 증명 순서, 크기(small)에 맞춰 phase를 생략하는 mask, 형제 스킬(change-feature/add-feature)과의 구분 기준, Gate 2 커밋 확인.

### orch-refine-code

- **축**: F, V, I  ·  **확신도**: 중간  ·  **분류**: 오케스트레이션·워크플로
- **요약**: 동작을 바꾸지 않는 리팩터링을 테스트 green 확인, 작은 단계 재구성, 리뷰, 게이트 승인 커밋으로 오케스트레이션하는 얇은 래퍼 스킬.
- **판단 근거**: 승인 게이트 2개, 수정 전 green 확인(사전 조건 검증), 단계별 테스트 재실행, 행동 불변 diff 요구가 스킬 본문의 핵심이다. 작업 흐름을 게이트로 제어하는 것이 목적이다. 다만 본문이 짧은 래퍼여서 세부 엔진은 orch-pipeline에 있다.
- **관심 포인트**: 행동 불변을 "기존 테스트가 안전망"으로 정의하고 테스트가 부족하면 characterization test부터 추가하는 방식, 계획 승인과 커밋 전 승인의 2단 게이트, 작은 단계마다 재검증하는 루프, 작업 종류별로 phase mask만 바꾸는 파이프라인 재사용 구조.

## 상세: Medium (17개)

### agent-payment-x402

- **축**: F, L  ·  **확신도**: 높음  ·  **분류**: 에이전트 설계·운영 원칙·안전장치
- **요약**: x402 결제 프로토콜과 MCP 결제 도구로 에이전트가 지출 정책 안에서만 결제하도록 하는 스킬.
- **판단 근거**: "Spending policy is set by the orchestrator ... prevents agents from escalating their own spending limits", `preToolCheck` fail-closed 훅, `list_transactions` 감사 trail, 결제 전 명시적 사용자 확인 요구가 본문에 있다. 다만 핵심은 결제 도메인 통합이며 통제 메커니즘은 부분적이다.
- **관심 포인트**: 에이전트가 자기 권한을 못 올리게 정책을 orchestrator가 설정하는 분리 원칙, 정책 설정 실패 시 위임 중단, 연결 실패/형식 오류/NaN 모두 차단하는 fail-closed 사전 검사, post-task hook으로 지출 감사 기록, 비밀키를 다루는 서브프로세스에 env 화이트리스트와 버전 pinning 적용.

### ai-first-engineering

- **축**: V, I  ·  **확신도**: 높음  ·  **분류**: 에이전트 설계·운영 원칙·안전장치
- **요약**: 에이전트가 구현 대부분을 생성하는 팀을 위한 프로세스·리뷰·테스트 기준을 짧게 정리한 운영 모델 스킬.
- **판단 근거**: "Code Review in AI-First Teams"가 리뷰 대상을 행동 회귀·보안·데이터 무결성 등으로 재정의하고, "Testing Standard"가 생성 코드에 대한 테스트 기준 상향을 요구한다. 다만 체크리스트 수준의 원칙 나열이며 구체적 메커니즘(게이트, 명령, 리포트)은 없다.
- **관심 포인트**: 스타일은 자동화에 맡기고 사람 리뷰는 시스템 동작에 집중시키는 역할 분담, "측정 가능한 acceptance criteria"와 eval을 AI 시대 핵심 역량으로 보는 관점, 생성 코드에 회귀 커버리지를 필수로 두는 기준.

### cost-tracking

- **축**: L  ·  **확신도**: 높음  ·  **분류**: 메모리·기록·관측
- **요약**: ECC cost-tracker hook이 남긴 로컬 JSONL 로그에서 토큰 사용량과 비용을 집계·보고하는 스킬.
- **판단 근거**: 세션 단위로 토큰·비용을 hook으로 기록하는 JSONL 로그 스키마(session_id, model, 토큰, estimated_cost_usd)와 그 조회 방법이 본문 핵심이다. 통제 장치라기보다 사용량 기록/조회에 해당한다.
- **관심 포인트**: stop hook 기반 append-only 누적 스냅샷 로그, byte cursor 기반 증분 캐시, "로그 없으면 fabricate 금지", 하드코딩 가격 대신 기록된 값을 source of truth로 삼는 원칙.

### agent-sort

- **축**: I, V  ·  **확신도**: 중간  ·  **분류**: 메타(스킬·설정·환경 관리)
- **요약**: 저장소의 grep 증거로 ECC 구성요소(skills/commands/rules/hooks 등)를 DAILY와 LIBRARY로 분류해 프로젝트별 설치 계획을 만드는 스킬.
- **판단 근거**: "Every DAILY decision must cite concrete repo evidence", "Do not install hooks, rules, or scripts that the current repo cannot use" 규칙으로 AI에게 로드되는 지침 표면을 증거 기반으로 제한한다. 적용 후 DAILY 파일 존재, stale 규칙 잔존, 호환 불가 훅 설치 여부를 확인하는 verify 단계가 있다.
- **관심 포인트**: 어떤 규칙/훅을 항상 로드할지 근거(증거 표) 기반으로 정하는 방식, 삭제 대신 LIBRARY로 접근 가능하게 두는 원칙, 적용 후 계획과 실제 설치의 일치를 검증하는 단계.

### architecture-decision-records

- **축**: L, I  ·  **확신도**: 중간  ·  **분류**: 메모리·기록·관측
- **요약**: 코딩 중 발생한 아키텍처 결정을 `docs/adr/`에 번호 붙은 ADR 문서와 인덱스로 남기는 스킬.
- **판단 근거**: 결정과 근거, 기각한 대안을 코드 옆에 영속 기록하는 것이 핵심(L)이다. 암묵 신호는 자동 생성하지 않고 승인 후 기록하는 규칙이 있으나 AI 통제보다는 문서화 관례에 가깝다.
- **관심 포인트**: 결정의 "why"와 rejected alternatives를 남기는 기록 포맷, 파일 생성 전 명시 동의와 초안 승인 게이트, 대체된 결정은 후속 ADR을 링크하는 수명주기, reviewer가 ADR 누락 PR을 플래그하는 연계. 세션이 바뀌어도 AI가 과거 결정을 조회할 수 있는 외부 기억 역할을 한다.

### automation-audit-ops

- **축**: V, L, F  ·  **확신도**: 중간  ·  **분류**: 메타(스킬·설정·환경 관리)
- **요약**: hook, 스케줄 작업, MCP, 커넥터 등 자동화의 실제 상태를 증거 기반으로 인벤토리화하고 keep/merge/cut/fix-next를 권고하는 감사 워크플로.
- **판단 근거**: "설정에 있다 = 동작한다"로 보지 않고 live 증거로 검증하는 Guardrails와 Verification 섹션이 있고, hook 로그·workflow run 등 기록을 근거로 삼는다. 다만 대상이 ECC 환경의 자동화 인벤토리라 범용 AI 통제보다는 운영 감사에 가깝다.
- **관심 포인트**: configured vs authenticated vs recently verified 상태 구분, 증거 없이 주장하지 않는 proof path 규칙, 감사(읽기)와 수정(쓰기)의 분리, 해당 hook 목록 점검 접근.

### autonomous-agent-harness

- **축**: F, L, I  ·  **확신도**: 중간  ·  **분류**: 오케스트레이션·워크플로
- **요약**: Claude Code의 /loop, `claude -p`, 메모리, MCP, 컴퓨터 사용을 조합해 상시/예약 자율 에이전트를 구성하는 셋업 패턴 가이드.
- **판단 근거**: 맨 앞 "Consent and Safety Boundaries"가 스케줄 생성·원격 dispatch·메모리 쓰기·컴퓨터 제어·외부 게시를 사용자 승인 전엔 금지하고 dry-run/로컬 큐를 먼저 쓰라고 규정한다. Constraints에 "스케줄 작업 완료를 항상 검증, cron 프롬프트에 에러 처리"가 있고, 메모리 3계층과 task-queue 파일이 기록 장치로 쓰인다. 나머지는 구성/설치 안내다.
- **관심 포인트**: 자율 동작의 명시적 동의·범위 제한과 dry-run 우선 원칙, 미검증 npm 패키지를 `npx -y`로 등록하지 말고 버전을 고정·검토하라는 공급망 주의, 메모리 계층(세션/프로젝트/그래프)과 파일 기반 task queue, 스케줄 작업의 완료 검증 요구.

### benchmark

- **축**: V, L  ·  **확신도**: 중간  ·  **분류**: 검증·평가
- **요약**: Core Web Vitals, API p50/p95/p99, 빌드 시간을 측정해 `.ecc/benchmarks/` JSON 기준선과 before/after 비교로 성능 회귀를 탐지하는 스킬.
- **판단 근거**: 변경 전후를 수치로 비교해 WARN/BETTER 판정을 내는 회귀 게이트이고 기준선을 git에 기록한다. 다만 대상이 성능 지표에 한정되어 있고 AI 작업 통제보다는 성능 측정 도구에 가깝다.
- **관심 포인트**: baseline을 git-tracked JSON으로 팀 공유, PR 단위 compare를 CI에 연결하는 구조, Verdict 열이 있는 비교 리포트 형식.

### click-path-audit

- **축**: V, F  ·  **확신도**: 중간  ·  **분류**: 검증·평가
- **요약**: 버튼 핸들러의 호출 순서와 공유 상태 부작용을 추적해, 개별 함수는 정상인데 서로 상쇄되어 UI가 동작하지 않는 버그를 찾는 감사 절차.
- **판단 근거**: AI가 만든 리팩터링에서 흔한 "함수는 있고 크래시도 없지만 최종 상태가 틀린" 버그를 위한 체계적 감사 절차와 리포트 형식을 제공한다. 다만 패턴이 React/Zustand 중심이라 범용 통제 메커니즘은 제한적이다.
- **관심 포인트**: 선행 산출물(스토어 부작용 맵)을 공유 컨텍스트로 삼는 병렬 에이전트 분할, "버튼 라벨이 약속하는 최종 상태 = 실제 상태"라는 기대값 기준 검증, 발견 버그마다 테스트를 연결하는 후속 단계.

### codebase-onboarding

- **축**: I  ·  **확신도**: 중간  ·  **분류**: 메타(스킬·설정·환경 관리)
- **요약**: 낯선 코드베이스를 4단계로 분석해 온보딩 가이드와 시작용 CLAUDE.md를 생성하는 스킬.
- **판단 근거**: Output 2가 프로젝트 규약(코드 스타일, 테스트/빌드 명령, 커밋·PR 관례)을 담은 CLAUDE.md를 자동 생성해 AI에 대한 지침을 만든다. 나머지는 코드베이스 이해용 가이드로 통제 메커니즘과는 거리가 있다.
- **관심 포인트**: 코드에서 관례를 탐지해 CLAUDE.md를 만들되 "100줄 이하", "기존 지침 보존 후 변경분 명시", "확신 없으면 '판단 불가'로 표기, 추측 금지(Verify, don't guess)" 같은 지침 작성 규칙.

### context-budget

- **축**: L, I  ·  **확신도**: 중간  ·  **분류**: 메모리·기록·관측
- **요약**: agents, skills, rules, MCP 서버, CLAUDE.md가 차지하는 컨텍스트 토큰을 감사해 우선순위화된 절감 권고를 내는 스킬.
- **판단 근거**: 하네스 구성(지침 파일, 규칙, 도구 정의)이 컨텍스트에 미치는 비용을 측정하는 것이 본문 핵심이라 지침 계층의 점검과 사용량 계측에 부분적으로 닿는다. 통제·검증 장치라기보다 구성 감사 도구다.
- **관심 포인트**: 지침 파일(CLAUDE.md, rules, agent description)의 비용을 정량화하고 Always/Sometimes/Rarely로 분류하는 방식, 측정값이 증명하지 못하는 것을 명시하는 한계 서술, 구성 변경 후 재감사 습관.

### quarkus-verification

- **축**: V, F  ·  **확신도**: 중간  ·  **분류**: 언어·프레임워크 코딩 지침
- **요약**: Quarkus 서비스를 build, 정적 분석, 테스트+JaCoCo, 보안 스캔, 네이티브 컴파일, 헬스체크 등 10단계로 검증하는 루프.
- **판단 근거**: 순차 게이트, 커버리지 임계값, 체크리스트, CI 통합을 갖춘 검증 루프다. 그러나 명령과 예제가 전부 Maven/Quarkus/GraalVM 전용이고 AI 작업을 검증하는 범용 메커니즘(리포트 판정 포맷, AI 대상 게이트)은 없다. GUIDE의 프레임워크 검증 섹션 기준으로 Medium까지만 부여한다.
- **관심 포인트**: 빌드 실패 시 중단하는 단계 구조, 커버리지 임계값 강제(`jacoco:check`), `set -e` 스크립트와 CI에 동일 게이트 이식, 정적 분석-테스트-보안-배포 순의 계층 검증. 단 PASS/FAIL 판정 리포트 형식은 없다.

### search-first

- **축**: I, F  ·  **확신도**: 중간  ·  **분류**: 오케스트레이션·워크플로
- **요약**: 코드를 쓰기 전에 repo, npm/PyPI, MCP, 스킬, GitHub에서 기존 해결책을 찾아 adopt/extend/compose/build를 결정하는 리서치 선행 워크플로우.
- **판단 근거**: 구현 전에 조사와 결정 단계를 강제해 AI의 작업 순서를 제약하는 지침이다. Step 0 preflight와 "검색 채널 불가 시 'nothing found'로 보고 금지" 규칙이 부분적으로 통제 장치지만 핵심은 재사용 우선 개발 습관이다.
- **관심 포인트**: 조사 채널 가용성 preflight와 건너뛴 채널을 숨기지 않고 보고하는 규칙(커버리지 과장 방지), adopt/extend/compose/build 결정표로 구현 전에 의사결정을 구조화, planner가 설계 전에 researcher를 호출하는 단계 삽입.

### security-review

- **축**: V  ·  **확신도**: 중간  ·  **분류**: 검증·평가
- **요약**: 인증, 입력, 시크릿, API 등을 다룰 때 적용하는 웹 애플리케이션 보안 체크리스트와 패턴 모음.
- **판단 근거**: 영역별 Verification Steps와 배포 전 체크리스트가 리뷰 게이트 역할을 한다. 다만 내용은 TypeScript/Next.js/Supabase 위주의 구체 보안 코딩 패턴이며 AI 작업 통제 메커니즘 자체는 아니다.
- **관심 포인트**: 영역별 체크박스형 Verification Steps와 "Before ANY production deployment" 배포 전 게이트 목록, 인증·인가·검증·rate limit을 테스트로 고정하는 보안 테스트 예시.

### team-builder

- **축**: F  ·  **확신도**: 중간  ·  **분류**: 오케스트레이션·워크플로
- **요약**: `claude agents`와 agents/ 마크다운에서 페르소나를 발견해 사용자가 최대 5개를 고르면 병렬 디스패치하고 합의/충돌을 종합하는 대화형 스킬.
- **판단 근거**: 병렬 디스패치, 5개 상한 강제, 부분 실패 허용, 결과 종합(합의/충돌 식별)이라는 오케스트레이션 메커니즘이 있다. 다만 에이전트 선택 UI와 목록 발견이 중심이고 검증·체크포인트 장치는 약하다.
- **관심 포인트**: 독립 병렬 에이전트 결과에서 합의와 상충을 명시적으로 추출하는 synthesis 단계, 실패한 에이전트를 표기하고 계속 진행하는 복구 방식, 토큰 비용을 근거로 한 팀 크기 상한.

### workspace-surface-audit

- **축**: I, F  ·  **확신도**: 중간  ·  **분류**: 메타(스킬·설정·환경 관리)
- **요약**: repo, MCP, 플러그인, env 키 이름, 하네스 설정을 읽기 전용으로 감사하고 ECC-native 다음 조치를 추천하는 스킬.
- **판단 근거**: 읽기 전용 규칙과 "Never print secret values"가 안전장치다. Phase 3 표가 반복 워크플로는 Skill, 자동 강제는 Hook, 위임 역할은 Agent로 구분해 하네스 통제 수단을 선택하는 기준을 준다. 다만 주목적은 환경 인벤토리와 ECC 제품 로드맵 추천이다.
- **관심 포인트**: 자동 enforcement는 hook, 반복 워크플로는 skill로 나누는 선택 기준, 이미 가능/래핑 부족/통합 없음의 3분류, 비밀 값 마스킹과 읽기 전용 감사 원칙, 하네스 설정 파일(.mcp.json, hooks, settings) 점검 목록.

### laravel-verification

- **축**: V  ·  **확신도**: 낮음  ·  **분류**: 언어·프레임워크 코딩 지침
- **요약**: Laravel 프로젝트의 환경, lint, 정적분석, 테스트/커버리지, 보안, 마이그레이션, 배포 준비를 7단계로 순차 점검하는 검증 루프.
- **판단 근거**: 순차 게이트 구조("any failure blocks release")는 있으나 본문이 Laravel 전용 명령 목록이다. 리포트 형식이나 AI 특화 메커니즘이 없어 언어/프레임워크 검증 섹션 기준(Medium까지만, 범용 메커니즘 있을 때만 High)에서 Low로 판단했다. **[병합 단계에서 Low → Medium 조정, "병합 단계 등급 조정" 참조]**
- **관심 포인트**: "any failure blocks release" 순차 게이트 구조. 상세는 quarkus-verification 항목 참조 (병합 단계에서 보완).

## 재확인 후보

### 확신도 낮음

- `laravel-verification` (Medium) — 순차 게이트 구조("any failure blocks release")는 있으나 본문이 Laravel 전용 명령 목록이다. 리포트 형식이나 AI 특화 메커니즘이 없어 언어/프레임워크 검증 섹션 기준(Medium까지만, 범용 메커니즘 있을 때만 High)에서 Low로 판단했다. **[병합 단계에서 Low → Medium 조정, "병합 단계 등급 조정" 참조]**

서브에이전트가 `확신도: 낮음`을 준 스킬은 없었습니다. 위 항목은 병합 단계에서 등급을 조정하면서 확신도를 낮춘 것입니다. 그 대신 `중간`이면서 등급 경계에 걸린 스킬을 아래에 함께 표시합니다.

### 경계 사례 (확신도 중간 · High/Medium)

- `agent-self-evaluation` (High)
- `continuous-agent-loop` (High)
- `orch-build-mvp` (High)
- `orch-change-feature` (High)
- `orch-fix-defect` (High)
- `orch-refine-code` (High)
- `agent-sort` (Medium)
- `architecture-decision-records` (Medium)
- `automation-audit-ops` (Medium)
- `autonomous-agent-harness` (Medium)
- `benchmark` (Medium)
- `click-path-audit` (Medium)
- `codebase-onboarding` (Medium)
- `context-budget` (Medium)
- `quarkus-verification` (Medium)
- `search-first` (Medium)
- `security-review` (Medium)
- `team-builder` (Medium)
- `workspace-surface-audit` (Medium)

### 병합 단계 등급 조정

| 스킬 | 서브에이전트 | 최종 | 사유 |
|---|---|---|---|
| `orch-add-feature` | Medium | High | orch-change-feature / orch-fix-defect / orch-refine-code와 동일 구조(orch-pipeline 래퍼 + Gate 2개)인데 혼자 Medium → 형제 스킬과 일치시킴 |
| `laravel-verification` | Low | Medium | quarkus-verification과 동일한 "순차 게이트, 실패 시 release 차단" 구조인데 등급 불일치 → 프레임워크 검증 상한(Medium)으로 일치시킴 |

## 제외: Low (23개)

| 스킬 | 분류 | 제외 사유 |
|---|---|---|
| `csharp-testing` | 언어·프레임워크 코딩 지침 | 언어/프레임워크 전용 테스트 문법 중심이며 AI 작업 검증이라는 범용 메커니즘이 없다. |
| `documentation-lookup` | 메타(스킬·설정·환경 관리) | 본문은 Context7 MCP 호출 절차다. |
| `ecc-guide` | 메타(스킬·설정·환경 관리) | ECC 자체의 사용 안내 스킬로 도구 사용법에 가깝다. |
| `laravel-security` | 언어·프레임워크 코딩 지침 | 본문 대부분이 Laravel 전용 보안 코딩 패턴이다. |
| `laravel-tdd` | 언어·프레임워크 코딩 지침 | 이름은 TDD이나 본문은 Laravel 테스트 API 레시피 중심이고, TDD 워크플로 설명은 초반 짧은 RED/GREEN/REFACTOR 예시뿐이다. |
| `perl-security` | 언어·프레임워크 코딩 지침 | 언어별 보안 코딩 패턴이 본문 대부분이다. |
| `quarkus-security` | 언어·프레임워크 코딩 지침 | Quarkus 전용 보안 코딩 패턴이 본문 전부다. |
| `benchmark-methodology` | 도메인 업무 | 주제는 마케팅/브랜드 경쟁 벤치마킹으로 도메인 업무 자동화다. |
| `code-tour` | 메타(스킬·설정·환경 관리) | 코드 이해용 산출물 생성이 목적이고, 통제 메커니즘은 "anchor 실존 검증, ref 검증" 같은 산출물 자체의 유효성 검사 수준이다. |
| `configure-ecc` | 메타(스킬·설정·환경 관리) | 본문 대부분이 ECC 설치 절차(플러그인 명령, 스코프 이동)다. |
| `connections-optimizer` | 도메인 업무 | 소셜 그래프 관리라는 업무 도메인이 본문의 중심이다. |
| `cost-aware-llm-pipeline` | 언어·프레임워크 코딩 지침 | 하네스에서 AI를 통제하는 방법이 아니라 LLM API를 호출하는 앱의 비용 코드 패턴이다. |
| `data-scraper-agent` | 도메인 업무 | 본문 대부분이 스크래핑/Notion/GitHub Actions 구현 코드로 도메인 업무 자동화에 해당한다. |
| `deep-research` | 도메인 업무 | 웹 리서치 자동화라 GUIDE 제외 대상(도메인 업무)이다. |
| `e2e-testing` | 언어·프레임워크 코딩 지침 | 도구(Playwright) 중심 테스트 패턴이며 AI 작업을 검증하는 범용 메커니즘은 없다. |
| `ecc-recipes` | 메타(스킬·설정·환경 관리) | 핵심은 커맨드 카탈로그 안내이지만, 모든 추천에 명시적 stop condition을 요구하고 자율 루프에는 max-iteration 백스톱과 구독 소진 경고를 붙이는 규칙이 있어 흐름 제어 개념을 약하게 담는다. |
| `latency-critical-systems` | 언어·프레임워크 코딩 지침 | 도메인(성능) 엔지니어링 지침이 중심이다. |
| `lead-intelligence` | 도메인 업무 | 본문 대부분이 리드 스코어링과 아웃리치라는 업무 도메인이다. |
| `perl-testing` | 언어·프레임워크 코딩 지침 | TDD와 커버리지 임계값 게이트가 있으나 Perl 전용 도구 문법 중심이며 AI 작업 검증이라는 범용 메커니즘은 없다. |
| `quarkus-tdd` | 언어·프레임워크 코딩 지침 | TDD 순서와 JaCoCo check 임계값 게이트, `verify(never())` 같은 검증 습관이 있으나 본문 대부분은 Quarkus/Camel/Java 도구 문법 예시다. |
| `security-bounty-hunter` | 도메인 업무 | 대상 코드의 취약점 탐지라는 보안 도메인 작업이 중심이다. |
| `skill-scout` | 메타(스킬·설정·환경 관리) | 스킬 중복 방지 검색 워크플로가 중심이다. |
| `terminal-opener` | 메타(스킬·설정·환경 관리) | 특정 터미널을 여는 도구 사용법이 본문 전부다. |

## 제외: None (11개)

| 스킬 | 분류 | 제외 사유 |
|---|---|---|
| `accessibility` | 언어·프레임워크 코딩 지침 | 본문 전체가 WCAG 기준과 플랫폼별 UI 속성 코딩 지침이다. |
| `competitive-platform-analysis` | 도메인 업무 | 마케팅/전략 리서치 업무 자동화다. |
| `competitive-report-structure` | 도메인 업무 | 경쟁사 분석 보고서 작성이라는 마케팅/전략 도메인 업무이며, AI 작업의 통제·검증·기록과 무관하다. |
| `compose-multiplatform-patterns` | 언어·프레임워크 코딩 지침 | 본문이 전부 Compose 코드 패턴이다. |
| `content-hash-cache-pattern` | 언어·프레임워크 코딩 지침 | 범용 소프트웨어 캐싱 설계 패턴이며 AI 작업의 통제나 검증과 무관하다. |
| `dashboard-builder` | 도메인 업무 | 모니터링 대시보드 제작 방법론으로, AI 작업의 검증·지시·기록·흐름 통제를 다루지 않는다. |
| `laravel-patterns` | 언어·프레임워크 코딩 지침 | 본문 전체가 Laravel 코드 구조와 ORM 사용 패턴이며 검증/지침/기록/흐름 축의 범용 메커니즘이 없다. |
| `laravel-plugin-discovery` | 언어·프레임워크 코딩 지침 | Laravel 생태계 패키지 조회용 MCP 도구 사용법이다. |
| `perl-patterns` | 언어·프레임워크 코딩 지침 | 본문이 Perl 언어 idiom 예시로만 구성되며 검증·지침 구조·기록·흐름 제어 메커니즘이 없다. |
| `quality-nonconformance` | 도메인 업무 | 본문 전체가 제조 현장의 불량 자재와 규제 대응 업무이며, AI 작업의 통제·검증과 연결되는 내용이 없다. |
| `quarkus-patterns` | 언어·프레임워크 코딩 지침 | 특정 프레임워크의 코딩 패턴 카탈로그이다. |
