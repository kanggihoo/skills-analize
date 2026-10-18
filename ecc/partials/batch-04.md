# batch-04

### ai-regression-testing

- **한 줄 요약**: 같은 모델이 코드를 쓰고 리뷰할 때 생기는 맹점을 자동화 테스트(sandbox 모드 API 테스트)로 잡는 회귀 테스트 전략.
- **설명**: "AI가 수정 → AI가 리뷰 → looks correct → 버그 잔존" 패턴을 핵심 문제로 정의하고, 실제 4회 반복된 사례를 든다. DB 없이 sandbox 모드를 강제해 API 응답 shape를 검증하는 Vitest 설정/헬퍼, 발견된 버그에 대해서만 테스트를 쓰는 전략, 흔한 AI 회귀 패턴(sandbox/production 불일치, SELECT 누락, 에러 상태 누수, 롤백 누락)을 제시한다. `/bug-check` 커맨드는 Step 1에서 test/build를 "mandatory, cannot skip"으로 먼저 돌리고, 통과해야 AI 코드 리뷰(Step 2)로 넘어가며, 수정마다 회귀 테스트를 제안(Step 3)하도록 정의한다.
- **분류**: 검증 / 테스트 전략
- **관련도**: High
- **관련 축**: V, F
- **판단 근거**: "AI 자기 리뷰를 자동화 테스트의 대체로 믿지 말라"는 것이 스킬의 핵심 전제이며, 기계적 게이트(test → build → AI review)를 앞세우는 bug-check 워크플로가 본문의 중심이다. Next.js/Vitest 예시는 구체적이나 원칙은 범용적이다.
- **관심 포인트**: 작성자=검토자 문제를 기계적 게이트로 해결하는 순서 설계("테스트 실패 시 AI 판단 없이 버그 확정"), 버그가 발견된 곳에만 테스트를 추가하는 "Test Where Bugs Were Found" 전략, 테스트 이름에 BUG ID를 붙여 추적, AI가 반복하는 오류 카테고리 목록을 리뷰 체크리스트로 사용.
- **확신도**: 높음

### benchmark

- **한 줄 요약**: Core Web Vitals, API p50/p95/p99, 빌드 시간을 측정해 `.ecc/benchmarks/` JSON 기준선과 before/after 비교로 성능 회귀를 탐지하는 스킬.
- **설명**: 4개 모드(페이지 성능, API 성능, 빌드 성능, before/after 비교)를 가진다. 페이지는 browser MCP로 LCP/CLS/INP 등을 목표값과 비교하고, API는 엔드포인트를 100회 호출해 백분위를 낸다. `/benchmark baseline`으로 저장하고 `/benchmark compare`로 Metric/Before/After/Delta/Verdict 표를 만든다. 기준선은 git 추적되며 CI에서 PR마다 compare를 돌리라고 권한다.
- **분류**: 검증 / 성능 측정
- **관련도**: Medium
- **관련 축**: V, L
- **판단 근거**: 변경 전후를 수치로 비교해 WARN/BETTER 판정을 내는 회귀 게이트이고 기준선을 git에 기록한다. 다만 대상이 성능 지표에 한정되어 있고 AI 작업 통제보다는 성능 측정 도구에 가깝다.
- **관심 포인트**: baseline을 git-tracked JSON으로 팀 공유, PR 단위 compare를 CI에 연결하는 구조, Verdict 열이 있는 비교 리포트 형식.
- **확신도**: 중간

### benchmark-optimization-loop

- **한 줄 요약**: "더 빠르게 해줘" 요청을 baseline, 정확성 게이트, 탐색 예산이 있는 유한한 측정 루프로 바꾸는 스킬.
- **설명**: Required Baseline(대상 작업, 반드시 green이어야 할 정확성 게이트, 메트릭, 현재 baseline, max variants/time/spend 예산)이 없으면 최적화를 시작하지 않는다. 루프는 baseline 측정 → 증거 기반 병목 식별 → 가설 하나씩의 variant 생성 → 동일 입력으로 실행 → 정확성/안전성/재현성 실패 variant 기각 → 최선 variant 승격 → 코드화 → 재측정 순이다. Variant Table, 재귀 탐색 시 ledger 영속화와 이전 승자 대비 비교, holdout/replay, 중단 조건(노이즈 수준 개선, 정확성 실패, 예산 초과)을 정의한다.
- **분류**: 오케스트레이션 / 검증 루프
- **관련도**: High
- **관련 축**: F, V, I, L
- **판단 근거**: 에이전트의 무한·모호한 최적화 요청을 bounded loop로 제약하는 것이 목적이다. Promotion Gate(정확성 테스트 통과, 델타 재현, rollback 명확, 소스 반영, 정확한 명령·수치 포함 요약)와 중단 조건, ledger가 본문 핵심이다.
- **관심 포인트**: 시작 전 필수 전제 조건(Required Baseline), 예산·중단 조건이 있는 루프, 한 번에 한 가설만 바꾸는 규칙, 모든 run을 ledger에 남김, "global optimum" 대신 "best measured safe variant"라고 쓰게 하는 과장 방지 표현 규칙.
- **확신도**: 높음

### click-path-audit

- **한 줄 요약**: 버튼 핸들러의 호출 순서와 공유 상태 부작용을 추적해, 개별 함수는 정상인데 서로 상쇄되어 UI가 동작하지 않는 버그를 찾는 감사 절차.
- **설명**: 정적 읽기나 일반 디버깅이 놓치는 상태 상호작용 버그를 대상으로 한다. Step 1에서 Zustand 스토어 액션별 sets/resets 부작용 맵을 만들고, Step 2에서 각 touchpoint 핸들러를 호출 순서대로 추적해 Sequential Undo, Async Race, Stale Closure, Missing Transition, Dead Path, useEffect Interference 6개 패턴을 점검한다. Step 3은 CLICK-PATH-NNN 형식의 심각도 리포트를 쓴다. 전체 앱 감사는 병렬 에이전트로 쪼개되 스토어 맵 에이전트가 먼저 끝나야 한다.
- **분류**: 검증 / 코드 감사 (프론트엔드 상태)
- **관련도**: Medium
- **관련 축**: V, F
- **판단 근거**: AI가 만든 리팩터링에서 흔한 "함수는 있고 크래시도 없지만 최종 상태가 틀린" 버그를 위한 체계적 감사 절차와 리포트 형식을 제공한다. 다만 패턴이 React/Zustand 중심이라 범용 통제 메커니즘은 제한적이다.
- **관심 포인트**: 선행 산출물(스토어 부작용 맵)을 공유 컨텍스트로 삼는 병렬 에이전트 분할, "버튼 라벨이 약속하는 최종 상태 = 실제 상태"라는 기대값 기준 검증, 발견 버그마다 테스트를 연결하는 후속 단계.
- **확신도**: 중간

### cost-aware-llm-pipeline

- **한 줄 요약**: 작업 복잡도별 모델 라우팅, 불변 예산 추적, 좁은 재시도, 프롬프트 캐싱으로 LLM API 비용을 통제하는 Python 패턴 모음.
- **설명**: 텍스트 길이/항목 수 임계값으로 Haiku/Sonnet을 고르는 `select_model`, frozen dataclass 기반 `CostTracker`(budget_limit, over_budget)와 `BudgetExceededError`로 예산 초과 시 중단, 일시적 오류만 재시도하는 `call_with_retry`, `cache_control` 프롬프트 캐싱을 다룬다. 네 기법을 하나의 `process` 함수로 조합하는 예시와 가격표, Best Practices(모델 선택 결정 로그, 사전 예산 설정)가 있다. LLM을 호출하는 애플리케이션을 만드는 개발자를 위한 스킬이다.
- **분류**: 인프라 / 비용 최적화 (애플리케이션 코드 패턴)
- **관련도**: Low
- **관련 축**: F
- **판단 근거**: 하네스에서 AI를 통제하는 방법이 아니라 LLM API를 호출하는 앱의 비용 코드 패턴이다. 예산 초과 시 fail early, 불변 비용 기록(감사 용이), 모델 선택 결정 로깅은 참고할 만한 가드레일 패턴이다.
- **관심 포인트**: -
- **확신도**: 중간

### csharp-testing

- **한 줄 요약**: xUnit, FluentAssertions, NSubstitute, WebApplicationFactory, Testcontainers 등 C#/.NET 테스트 작성 패턴 가이드.
- **설명**: Arrange-Act-Assert 구조, Theory 기반 파라미터화 테스트, NSubstitute 모킹, ASP.NET Core 통합 테스트(WebApplicationFactory, Testcontainers), 테스트 폴더 구성, 테스트 데이터 빌더, 안티패턴 표, `dotnet test` 실행/커버리지 명령을 설명한다. 전부 .NET 도구 사용법과 코딩 관례이다.
- **분류**: 언어-코딩지침 / 테스트
- **관련도**: Low
- **관련 축**: V
- **판단 근거**: 언어/프레임워크 전용 테스트 문법 중심이며 AI 작업 검증이라는 범용 메커니즘이 없다. 안티패턴 표 정도만 일반 테스트 원칙과 닿는다.
- **관심 포인트**: -
- **확신도**: 높음

### quality-nonconformance

- **한 줄 요약**: 규제 제조업(FDA 820, IATF 16949, AS9100)의 NCR 처리, 근본원인분석, CAPA, SPC, 공급사 품질 관리를 다루는 제조 품질 전문가 지침.
- **설명**: 부적합 탐지 → 격리 → 심각도 분류 → 근본원인 조사 → 처분 → 시정조치와 효과 검증·종결로 이어지는 NCR 생애주기를 설명한다. 5-Why/Ishikawa/fault tree/8D 선택 기준, CAPA 효과 검증, 검사 수준 조정, 공급사 에스컬레이션, 에스컬레이션 트리거, KPI, 커뮤니케이션 템플릿을 포함한다. 소프트웨어/AI 작업과 무관한 제조 품질 도메인 지식이다.
- **분류**: 도메인-업무 (제조 품질)
- **관련도**: None
- **관련 축**: -
- **판단 근거**: 본문 전체가 제조 현장의 불량 자재와 규제 대응 업무이며, AI 작업의 통제·검증과 연결되는 내용이 없다. CAPA의 "효과 검증 후 종결" 같은 구조는 업무 도메인 절차일 뿐이다.
- **관심 포인트**: -
- **확신도**: 높음

### team-agent-orchestration

- **한 줄 요약**: 여러 에이전트를 팀처럼 운영하기 위해 work item, 소유자, 에이전트 Kanban, 브랜치 격리, control pane, merge gate를 정의하는 스킬.
- **설명**: 각 에이전트를 Owner/Scope/State/Evidence/Merge gate가 있는 좁은 계약의 팀원으로 취급한다. Backlog부터 Archived까지 7개 컬럼과 각 컬럼의 Exit Criteria, 카드 JSON 스키마(owner, branch, acceptance, merge_gate, handoff)를 제시한다. 7단계 흐름(보드 구성, 실행 모드 선택, 경계 할당, 증거·handoff 기록, 테스트→diff→보안 순 리뷰, 단일 integrator 병합, 반복 시 스킬 승격)과 control pane 요건, 실패 모드(Agent soup, Invisible work, Board theater, Overlapping writes)를 다룬다.
- **분류**: 오케스트레이션
- **관련도**: High
- **관련 축**: F, I, L, V
- **판단 근거**: 멀티 에이전트 작업의 소유권, 상태 전이 기준, 병합 게이트를 통제하는 것이 핵심 목적이다. 상태 전이마다 증거(테스트, 로그, handoff)를 요구하고 "merge readiness by gate, not vibes"를 명시한다.
- **관심 포인트**: 컬럼별 Exit Criteria로 상태 전이를 검증 가능하게 만듦, 카드에 merge_gate와 handoff 경로를 필수 필드로 둠, 한 파일에 쓰기 소유자 1명 원칙과 단일 integrator, Running→Review 이전 eval 요구, "누가 소유하고 무엇이 바뀌고 어떤 게이트가 실패했는가"에 답할 수 있기 전에는 자동화를 늘리지 않는 규칙.
- **확신도**: 높음
