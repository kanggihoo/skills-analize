# batch-12

### agent-harness-construction

- **한 줄 요약**: 에이전트의 action space, 도구 정의, observation 포맷, 에러 복구 계약, 컨텍스트 예산을 설계·최적화하는 가이드.
- **설명**: 에이전트가 계획하고 도구를 호출하고 오류에서 복구해 완료로 수렴하는 방식을 개선할 때 쓴다. 출력 품질을 action space / observation / recovery / context budget 네 요소로 모델링한다. 도구는 안정적 이름·schema-first·결정적 출력 형태를 갖추고, 고위험 작업(deploy, migration, permissions)은 micro-tool로 쪼갠다. 모든 도구 응답에 status/summary/next_actions/artifacts를 넣고, 모든 에러 경로에 원인 힌트·안전한 재시도 방법·명시적 중단 조건을 넣는다. completion rate, retries, pass@1/pass@3, 성공당 비용으로 벤치마킹한다.
- **분류**: 에이전트 설계 / 하네스 구성
- **관련도**: High
- **관련 축**: I, F, V
- **판단 근거**: 하네스 설계 자체가 핵심 목적이다. "Error Recovery Contract"(root cause hint, safe retry, stop condition), 고위험 작업의 micro-tool 분리, "Context Budgeting"(phase 경계에서 compact), "Benchmarking"(pass@k, 재시도 수)이 본문에 있다.
- **관심 포인트**: 도구 응답을 status/next_actions로 구조화해 에이전트의 행동을 유도하는 방식, 에러마다 중단 조건을 강제하는 복구 계약, 위험도에 따른 도구 granularity 규칙, 하네스 효과를 pass@1/재시도/비용으로 측정하는 지표.
- **확신도**: 높음

### agent-introspection-debugging

- **한 줄 요약**: 에이전트 실행 실패를 capture → diagnosis → contained recovery → report 4단계로 체계적으로 자가 디버깅하는 워크플로.
- **설명**: 루프 한도 초과, 진전 없는 재시도, 컨텍스트 열화, 환경 상태 불일치 등이 생겼을 때 맹목적으로 재시도하기 전에 쓴다. Phase 1에서 실패 상태(에러, 마지막 성공 단계, 반복 패턴, cwd/branch 가정)를 템플릿으로 기록하고, Phase 2에서 패턴 표(ECONNREFUSED, 429, 파일 누락, 수정 후에도 테스트 실패 등)에 매칭해 원인을 분류한다. Phase 3은 가장 작은 되돌릴 수 있는 조치만 허용하고, Phase 4에서 Agent Self-Debug Report(원인, 복구 조치, 결과 success/partial/blocked, 토큰 소모 위험)를 남긴다. 실제 도구로 하지 않은 "auto-healing" 주장을 금지한다.
- **분류**: 에이전트 디버깅 / 실패 복구
- **관련도**: High
- **관련 축**: F, L, V
- **판단 근거**: 실패 복구가 핵심 목적이다. 4단계 루프, "retry 전에 discriminating check 1회", 고위험이면 사람에게 escalate, 구조화된 Failure Capture/Self-Debug Report 템플릿, "I fixed it"만으로 끝내지 말고 증거를 제시하라는 Output Standard가 본문에 있다.
- **관심 포인트**: 같은 행동의 말만 바꾼 재시도를 금지하는 규칙, 복구 전 실패 상태를 먼저 기록하는 습관, 복구 후 "무엇이 고쳐졌음을 증명하는가"를 명시하는 증거 요구, 다음 에이전트/사람이 읽는 introspection report.
- **확신도**: 높음

### automation-audit-ops

- **한 줄 요약**: hook, 스케줄 작업, MCP, 커넥터 등 자동화의 실제 상태를 증거 기반으로 인벤토리화하고 keep/merge/cut/fix-next를 권고하는 감사 워크플로.
- **설명**: 어떤 자동화가 살아있고 깨졌고 중복되는지 물을 때 쓴다. 기본은 read-only로 시작해 실제 표면(hooks, GitHub Actions, MCP 설정, 커넥터)을 읽고, 각 항목을 configured / authenticated / recently verified / stale or broken / missing으로 분류한다. 모든 주장에 파일 경로, workflow run, hook log, 실패 시그니처 같은 증거를 붙이고, 증거표 없이는 병합·삭제하지 않는다. 산출물은 CURRENT SURFACE / FINDINGS / RECOMMENDATION / NEXT ECC MOVE 리포트이다.
- **분류**: 감사 / 자동화 운영
- **관련도**: Medium
- **관련 축**: V, L, F
- **판단 근거**: "설정에 있다 = 동작한다"로 보지 않고 live 증거로 검증하는 Guardrails와 Verification 섹션이 있고, hook 로그·workflow run 등 기록을 근거로 삼는다. 다만 대상이 ECC 환경의 자동화 인벤토리라 범용 AI 통제보다는 운영 감사에 가깝다.
- **관심 포인트**: configured vs authenticated vs recently verified 상태 구분, 증거 없이 주장하지 않는 proof path 규칙, 감사(읽기)와 수정(쓰기)의 분리, 해당 hook 목록 점검 접근.
- **확신도**: 중간

### code-tour

- **한 줄 요약**: 페르소나별 단계형 코드 워크스루를 실제 파일·라인 anchor와 함께 CodeTour `.tour` JSON으로 생성하는 스킬.
- **설명**: 온보딩, 아키텍처, PR, RCA, 보안 리뷰 등 "어떻게 동작하는지" 설명을 재사용 가능한 산출물로 만들 때 쓴다. 저장소를 먼저 탐색하고 독자 페르소나와 깊이(5~18 step)를 정한 뒤 `.tours/<persona>-<focus>.tour`를 쓴다. 모든 경로와 라인을 실제로 확인하고(추측 금지), `ref` 필드가 독자의 브랜치에 맞는지 검증하며, SMIG(Situation/Mechanism/Implication/Gotcha) 규칙으로 설명을 쓴다. 소스 코드는 수정하지 않는다.
- **분류**: 문서 생성 / 코드 이해
- **관련도**: Low
- **관련 축**: V
- **판단 근거**: 코드 이해용 산출물 생성이 목적이고, 통제 메커니즘은 "anchor 실존 검증, ref 검증" 같은 산출물 자체의 유효성 검사 수준이다. PR tour가 리뷰 보조로 쓰일 수는 있으나 리뷰 게이트는 아니다.
- **관심 포인트**: -
- **확신도**: 중간

### contract-first

- **한 줄 요약**: 하나의 기계 검증 가능한 계약(OpenAPI 등)을 기준으로 consumer/provider를 병렬 개발하고 같은 artifact에 대해 양측을 검증하게 하는 협업 규약.
- **설명**: 프론트·백엔드나 서비스 간 경계를 바꿀 때 필드 drift, mock/production 형태 불일치, 한쪽의 임의 재정의를 막기 위해 쓴다. 소비자 작업(consumer job)에서 출발해 최소 계약을 정의하고, 타입·mock을 생성하고, provider의 실제 직렬화 응답을 계약으로 검증한다. 병합 전에 "양측이 각자 테스트를 통과했나"가 아니라 "같은 계약에 대해 통과했나"를 본다. Contract Change Protocol은 구현 전에 계약부터 바꾸고 영향받는 소유자와 diff를 리뷰하도록 한다. 계약 내용을 지시가 아닌 데이터로 취급하고 `$ref` allowlist, 최소 권한 generator 실행 같은 보안 규칙도 포함한다.
- **분류**: 협업 규약 / API 계약 검증
- **관련도**: High
- **관련 축**: I, V
- **판단 근거**: 단일 권위 artifact로 지시를 고정하고(I), 생성된 타입·fixture·provider 응답을 같은 계약으로 검증(V)하는 범용 메커니즘이 핵심이다. 다중 에이전트/사람이 병렬 작업할 때 인터페이스를 임의로 바꾸지 못하게 하는 변경 프로토콜(7단계)과 Completion Checklist가 있다.
- **관심 포인트**: 계약 먼저 변경 후 구현하는 순서 강제, 컴파일 타임 타입만으로 증명하지 않고 직렬화 응답을 검증하라는 규칙, 계약 diff를 이해관계자 리뷰 대상으로 취급, 에이전트가 계약 내용을 지시로 따르지 않도록 하는 데이터/지시 분리와 generator 최소 권한.
- **확신도**: 높음

### laravel-plugin-discovery

- **한 줄 요약**: LaraPlugins.io MCP로 Laravel 패키지를 검색하고 health score와 버전 호환성으로 평가하는 스킬.
- **설명**: 특정 기능용 Laravel 패키지를 찾거나 유지보수 상태를 확인할 때 쓴다. MCP 서버 설정 후 SearchPluginTool(키워드, health_score, laravel/php 호환성, vendor 필터)과 GetPluginDetailsTool(상세, 버전 이력)을 호출한다. 프로덕션에는 Healthy 패키지를 우선하고 타깃 Laravel 버전과 맞추라는 권고를 담는다. 산출물은 패키지 추천/평가 결과이다.
- **분류**: 도메인-프레임워크 도구 사용법 (MCP)
- **관련도**: None
- **관련 축**: -
- **판단 근거**: Laravel 생태계 패키지 조회용 MCP 도구 사용법이다. 4축에 해당하는 통제·검증 메커니즘이 없다.
- **관심 포인트**: -
- **확신도**: 높음

### laravel-tdd

- **한 줄 요약**: PHPUnit/Pest, 팩토리, HTTP/Sanctum 테스트, fake, 커버리지 등 Laravel 테스트 작성 레시피 모음.
- **설명**: Laravel 기능을 테스트 주도로 개발하거나 테스트 인프라를 구성할 때 쓴다. Red-Green-Refactor 예시 후 PHPUnit 설정, 모델 팩토리, 모델/HTTP/JSON API/Sanctum 인증 테스트, Http/Mail/Queue/Event/Storage fake, Artisan 명령과 권한 테스트, Pest 예시를 코드로 보여준다. 커버리지 목표와 DO/DON'T, Quick Reference 표가 있다. 전부 Laravel 특화 코드 예시이다.
- **분류**: 언어-프레임워크 테스트 지침
- **관련도**: Low
- **관련 축**: V
- **판단 근거**: 이름은 TDD이나 본문은 Laravel 테스트 API 레시피 중심이고, TDD 워크플로 설명은 초반 짧은 RED/GREEN/REFACTOR 예시뿐이다. 커버리지 임계값과 "서비스 경계만 mock" 정도가 범용 검증 원칙이며 AI 통제 메커니즘은 아니다.
- **관심 포인트**: -
- **확신도**: 높음

### quarkus-patterns

- **한 줄 요약**: Quarkus 3.x와 Camel(RabbitMQ), Panache, CDI 기반의 서비스·REST·메시징·설정 코드 패턴 모음.
- **설명**: Java Quarkus 백엔드를 만들거나 리뷰할 때 쓴다. 서비스 레이어, Logback LogContext 로깅, 이벤트 서비스, Camel 메시지 발행/direct route/파일 처리, REST 구조, Panache repository, 트랜잭션, DTO 검증, 예외 매핑, CompletableFuture, 캐시, YAML 설정, 헬스체크, Maven 의존성을 코드 예시로 다룬다. 마지막에 아키텍처/로깅/트랜잭션 등 Best Practices 목록이 있다.
- **분류**: 언어-코딩지침 (Java/Quarkus)
- **관련도**: None
- **관련 축**: -
- **판단 근거**: 특정 프레임워크의 코딩 패턴 카탈로그이다. 로깅 섹션은 애플리케이션 로그 컨텍스트 구성이고 AI 작업 기록·통제와 무관하다.
- **관심 포인트**: -
- **확신도**: 높음
