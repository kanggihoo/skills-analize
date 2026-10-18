# batch-07

### agent-architecture-audit

- **한 줄 요약**: 에이전트/LLM 애플리케이션을 12개 레이어로 나눠 wrapper 회귀, 메모리 오염, 도구 규율 실패, 숨은 repair loop를 진단하고 severity 순 리포트를 만드는 감사 스킬.
- **설명**: 에이전트가 오작동하는데 원인 레이어를 모를 때, 또는 출시 전에 사용한다. Scope → Evidence Collection(`rg`로 안티패턴 탐색) → Failure Mapping(증상/메커니즘/레이어/근본원인/증거/confidence) → Fix Strategy 4단계로 진행한다. 수정 순서는 "프롬프트가 아니라 코드 우선"(도구 요구를 코드로 gate, 숨은 repair agent 축소, 메모리 admission에서 사용자 정정 우선 등)이다. 산출물은 `ecc.agent-architecture-audit.report.v1` JSON 스키마의 리포트(executive_verdict, findings, ordered_fix_plan)이다.
- **분류**: 검증 / 에이전트 진단
- **관련도**: High
- **관련 축**: V, F, L, I
- **판단 근거**: 에이전트 스택 자체를 감사하는 것이 핵심 목적이다. 12레이어 표(system prompt, 세션 히스토리, 장기 메모리, 도구 선택/실행/해석, 숨은 repair loop, persistence)와 "프롬프트에만 있는 must use tool 규칙은 코드 gate가 아니다"라는 원칙이 LLM 비결정성 통제 문제를 직접 다룬다.
- **관심 포인트**: 도구 사용 요구를 프롬프트가 아닌 코드로 강제하는 원칙, 숨은 LLM 호출(repair/retry/summarize)을 찾는 grep 패턴, 내부 생성 결과와 사용자 전달 결과의 차이(rendering mutation) 점검, 메모리 admission 시 사용자 정정 > 에이전트 주장 규칙, severity 등급 + confidence + evidence_refs(file:line)를 갖춘 정형 리포트 스키마, 7개 빠른 진단 질문.
- **확신도**: 높음

### data-scraper-agent

- **한 줄 요약**: 공개 데이터 소스를 스케줄로 수집해 Gemini로 enrich하고 Notion/Sheets/Supabase에 저장하는 수집 에이전트를 GitHub Actions 위에 만드는 빌드 가이드.
- **설명**: COLLECT → ENRICH → STORE 3계층 구조로 Python 스크래퍼, Gemini 모델 fallback 클라이언트, 배치 AI 파이프라인, 사용자 피드백(`feedback.json`) 기반 선호 학습, Notion 동기화, cron 워크플로를 단계별 코드로 제시한다. 사용자에게 소스/필드/저장소/주기를 묻는 Step 1부터 Quality Checklist까지 포함한다. 중간의 "Untrusted Scraped Data" 절은 스크랩된 내용을 지시로 따르지 않고, enrichment 프롬프트와 분리하며, 설정을 바꾸지 못하게 하고, 이상 텍스트는 run 출력에 기록하라고 규정한다.
- **분류**: 도메인-업무 / 데이터 수집 자동화
- **관련도**: Low
- **관련 축**: F, I
- **판단 근거**: 본문 대부분이 스크래핑/Notion/GitHub Actions 구현 코드로 도메인 업무 자동화에 해당한다. 다만 무인 실행 에이전트에 대한 prompt injection 방어 규칙(Untrusted Scraped Data)과 피드백 학습 루프, Quality Checklist가 소량 있다.
- **관심 포인트**: -
- **확신도**: 중간

### ecc-guide

- **한 줄 요약**: ECC 저장소의 실제 파일을 읽어 ECC 구성요소 탐색, 설치, 스킬 추천 질문에 답하는 안내 스킬.
- **설명**: 사용자가 ECC에 무엇이 있는지, 어떻게 설치/리셋하는지, 어떤 스킬이 맞는지 물을 때 사용한다. 핵심 원칙은 "기억이 아니라 현재 파일에서 답한다"이며 `catalog.js`, `find`, `install-plan.js` 등으로 라이브 표면을 확인한다. 설치는 managed installer의 dry-run 계획을 우선하고, `/project-init`은 스택 감지 → dry-run 계획 → 기존 CLAUDE.md 확인 → 적용 전 승인 순으로 안내한다. 응답은 결론 먼저의 짧은 템플릿(추천/근거/검증 명령/다음 행동)을 쓴다.
- **분류**: 메타-스킬관리 / 안내
- **관련도**: Low
- **관련 축**: I
- **판단 근거**: ECC 자체의 사용 안내 스킬로 도구 사용법에 가깝다. "존재 여부를 파일시스템 확인 없이 주장하지 않기", 적용 전 dry-run과 승인 같은 작은 규칙만 있다.
- **관심 포인트**: -
- **확신도**: 높음

### orch-add-feature

- **한 줄 요약**: 신규 기능 추가를 research → plan → TDD → review → commit으로 오케스트레이션하는 `orch-pipeline` 위의 얇은 래퍼.
- **설명**: 아직 없는 기능을 만들 때 사용한다. 자체 로직 없이 `orch-pipeline` 엔진을 호출하며, 기본 크기는 standard이고 phase는 0→1→2→4→5→6(Scaffold 3 생략)이다. 첫 동작은 새 동작에 대한 실패 테스트 작성 후 구현이다. Gate 1(계획 승인)과 Gate 2(커밋 전 확인)에서 멈추고, 보안 트리거가 있으면 `security-reviewer`를 추가한다.
- **분류**: 오케스트레이션
- **관련도**: Medium
- **관련 축**: F, V, I
- **판단 근거**: 두 개의 사람 승인 gate와 크기 분류, TDD 우선, 보안 리뷰 조건부 추가가 명시되어 있다. 다만 본문은 설정만 담은 짧은 래퍼이고 메커니즘 본체는 `orch-pipeline`에 있다.
- **관심 포인트**: 작업 종류별로 phase mask와 첫 동작 규칙만 바꾸는 래퍼 구조, plan 승인 전 구현 금지, commit 전 확인 gate.
- **확신도**: 높음

### orch-pipeline

- **한 줄 요약**: orch-* 스킬군이 공유하는 Research-Plan-TDD-Review-Commit 파이프라인 엔진으로, 크기 분류기와 두 개의 사람 gate를 정의한다.
- **설명**: 요청을 trivial/small/standard/large로 분류(파일 수, 새 의존성/계약, 설계 모호성 중 가장 높은 tier)해 실행할 phase를 정하고, 각 phase를 기존 ECC agent/command(planner, tdd-guide, code-reviewer, security-reviewer, gan-build 등)에 위임한다. "gated, not autonomous": Gate 1은 plan 후 사용자 승인 전 구현 금지, Gate 2는 commit 전 diff와 메시지 확인이다. 보안 트리거(인증, 입력 처리, DB 쿼리, 경로, 외부 API, 암호, 시크릿) 시 security-reviewer가 필수이며, 파이프라인은 숨은 상태 없이 task_list 등 계획 문서를 handoff로 쓴다. 끝의 Verification 절은 tier 명시, 두 gate 준수, 보안 리뷰 조건 충족, 커밋 규칙, 커버리지 80%를 점검한다.
- **분류**: 오케스트레이션
- **관련도**: High
- **관련 축**: F, V, I
- **판단 근거**: 작업 흐름의 통제(크기별 ceremony 조절, 2개 승인 gate, 에이전트 위임 맵, CRITICAL/HIGH 리뷰 이슈 해소 후 Gate 2)가 스킬의 핵심 목적이다.
- **관심 포인트**: blast radius에 비례한 right-sizing과 사용자 override 가능한 한 줄 선언, gate 사이는 자율/gate에서는 사람 승인이라는 분리, 보안 trigger 기반 조건부 리뷰, 계획 문서를 handoff artifact로 쓰는 무상태 설계, 파이프라인 준수 여부를 확인하는 Verification 체크리스트.
- **확신도**: 높음

### plan-canvas

- **한 줄 요약**: 계획/HTML 산출물을 로컬 브라우저 캔버스에 열어 사람이 요소를 짚어 주석, 채팅, Approve/Request changes 판정을 하고 에이전트는 CLI 한 번으로 JSON 피드백을 받는 리뷰 루프.
- **설명**: `/plan`이 만든 `.plan.md` 등을 `ecc-plan-canvas open`으로 열고 `await`로 사람의 응답을 블록 대기한다. 피드백은 annotation(selector/snippet 앵커), chat, verdict(approve/request-changes) 항목의 JSON으로 오며, approve가 plan 확정(CONFIRM)을 대체한다. 에이전트는 모든 메시지에 캔버스에서 답하고 계속 대기하며, 대기 없이 턴이 끝나지 않도록 `stop:plan-canvas-pending` hook과 `pending` 명령이 보조한다. 상태는 loopback 서버와 `~/.claude/plan-canvas/`에 저장된다.
- **분류**: 오케스트레이션 / 사람 승인 UI
- **관련도**: High
- **관련 축**: F, I, L
- **판단 근거**: 계획 승인 gate를 구조화된 사람 검토 루프로 구현한 것이 핵심이다. 미전달 피드백을 막는 stop hook, 큐에 남는 피드백, 사용자 종료 시 재개 금지 등 구체적 제어 메커니즘이 있다.
- **관심 포인트**: 승인 판정을 타이핑한 "yes" 대신 구조화된 verdict로 받는 방식, 요소 앵커 기반 피드백으로 지시 정밀도를 높이는 점, stop hook으로 미응답 피드백 상태에서 턴 종료를 막는 안전장치, typing 인디케이터가 만료되어 크래시한 에이전트를 정직하게 표시하는 설계, 모든 메시지에 응답하라는 규칙.
- **확신도**: 높음

### quarkus-security

- **한 줄 요약**: Quarkus 애플리케이션의 JWT/OIDC 인증, RBAC, 입력 검증, SQL injection 방지, 헤더, 시크릿 관리 등 보안 구현 패턴 모음.
- **설명**: Quarkus에서 인증/인가를 추가하거나 입력 검증, 시크릿, 보안 강화를 할 때 쓴다. `@RolesAllowed`, `SecurityIdentity`, Bean Validation, Panache 파라미터 쿼리, BCrypt, CORS, rate limiting(X-Forwarded-For 스푸핑 주의), 보안 헤더, 감사 로그 서비스, OWASP dependency-check 명령을 Java/properties 예시로 보여준다. 끝에 Best Practices 체크 목록이 있다.
- **분류**: 언어-코딩지침 / 보안
- **관련도**: Low
- **관련 축**: V
- **판단 근거**: Quarkus 전용 보안 코딩 패턴이 본문 전부다. 의존성 CVE 스캔 명령과 마지막 "인증/인가 경로 테스트" 항목이 있으나 범용 검증 메커니즘은 없다.
- **관심 포인트**: -
- **확신도**: 높음

### security-scan

- **한 줄 요약**: AgentShield로 `.claude/` 설정(CLAUDE.md, settings.json, MCP, hooks, agents)의 보안 취약점과 injection 위험을 스캔하고 등급을 매기는 스킬.
- **설명**: 새 프로젝트 설정, 설정 파일 수정 후, 커밋 전, 낯선 저장소 온보딩 시 `npx ecc-agentshield scan`을 실행한다. 파일별 검사 항목(하드코딩 시크릿, 과도한 allow 목록, `Bash(*)`, hook 내 command injection, 조용한 오류 억제, MCP의 `npx -y` 공급망 위험, 에이전트의 무제한 도구 접근)을 표로 정리하고 A~F 등급과 Critical/High/Medium/Info 해석 가이드를 제공한다. 출력은 terminal/JSON/Markdown/HTML이며 `--fix` 자동 수정(안전한 항목만), 공격자/방어자/감사자 3-agent 심층 분석(`--opus`), `init`으로 안전한 설정 생성, GitHub Action CI 연동(`fail-on-findings`)을 지원한다.
- **분류**: 검증 / 에이전트 설정 보안
- **관련도**: High
- **관련 축**: V, F, I
- **판단 근거**: AI 하네스 설정(권한 allow/deny, hook, MCP, agent 정의, CLAUDE.md의 auto-run 지시)을 정적 감사해 등급 리포트와 CI 게이트로 만드는 것이 핵심 목적이다. AI 작업의 통제 장치 자체를 검증 대상으로 삼는다.
- **관심 포인트**: 권한 deny 목록/Bash 와일드카드/hook 보간 injection 같은 통제 장치 설정 결함 목록, 점수 기반 등급과 severity별 조치 시점 구분, CI에서 `fail-on-findings`로 게이트화, 수정 가능한 항목만 자동 수정하고 수동 항목은 건드리지 않는 규칙, red/blue/auditor 적대적 3-agent 리뷰 구조.
- **확신도**: 높음
