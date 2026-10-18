# batch-06

### agentic-os

- **한 줄 요약**: Claude Code를 영속 런타임으로 보고 kernel(CLAUDE.md)-agents-commands-scripts-data 5개 디렉터리로 멀티에이전트 "OS"를 구성하는 아키텍처 가이드.
- **설명**: 지속적으로 도는 개인/프로젝트용 멀티에이전트 시스템을 만들 때 쓴다. CLAUDE.md를 COO 역할의 kernel로 두고 Agent Registry 표와 Routing Rules(키워드 트리거 → agents/<name>.md 로드)로 작업을 전문 에이전트에 위임한다. 상태는 외부 DB 없이 `data/`의 JSON/markdown(append-only 일일 로그, ADR 형식 decisions, inbox)에 두고, 세션 종료 시 Auto-Reflection을 append한다. 스케줄 실행은 세션 cron이 아닌 LaunchAgent/systemd/pm2로 하라고 하며, 안티패턴(단일 거대 에이전트, 무상태 세션, 하드코딩 자격증명)과 체크리스트(CLAUDE.md 200줄 이하, 에이전트별 Memory Scope 명시, 로그 수정 금지)를 제시한다.
- **분류**: 오케스트레이션 / 메모리-상태 아키텍처
- **관련도**: High
- **관련 축**: I, L, F
- **판단 근거**: 핵심이 kernel 라우팅 규칙·에이전트별 Constraints/Tool Access/Memory Scope(지침), append-only 로그·decision record·세션 reflection(기록), 라우팅/스케줄/병렬 실행(흐름)이다. 검증 메커니즘은 거의 없다.
- **관심 포인트**: 라우팅을 코드가 아닌 markdown 표로 선언해 검사 가능하게 두는 원칙, 에이전트별 Memory Scope로 읽기 범위 제한, append-only 로그와 "필드 rename 금지·deprecated 표시" 스키마 진화 규칙, 세션 말 reflection 루프, 세션 종속 cron 대신 외부 스케줄러 사용, 세션당 비용 로그.
- **확신도**: 높음

### blueprint

- **한 줄 요약**: 한 줄 목표를 PR 하나 크기 단계들의 자기완결적 구축 계획서로 바꾸고, 적대적 리뷰 게이트와 계획 변경 프로토콜을 두는 계획 생성 스킬.
- **설명**: 여러 PR/세션에 걸친 대형 기능·리팩터링을 계획할 때 쓴다. Research(사전 점검, 기존 plans/메모리 읽기) → Design(3–12 단계, 의존 그래프, 병렬 단계 탐지, 모델 티어, 롤백) → Draft(`plans/`에 Markdown, 단계마다 context brief·작업·검증 명령·exit criteria) → Review(최강 모델 서브에이전트가 체크리스트와 안티패턴 카탈로그로 적대적 리뷰, critical 수정) → Register 5단계로 진행한다. git/gh 유무를 감지해 브랜치/PR/CI 모드 또는 direct 모드로 전환하며, 단계 split/insert/skip/reorder/abandon 시 감사 기록을 남기는 plan mutation protocol이 있다.
- **분류**: 계획 / 오케스트레이션
- **관련도**: High
- **관련 축**: I, V, F, L
- **판단 근거**: 핵심 목적이 사람/에이전트가 실행할 계획·스펙을 구조화하는 것(지침)이며, 단계별 verification commands/exit criteria, adversarial review gate, 매 단계 후 invariant 검증(검증), 의존성·병렬·롤백·mutation 프로토콜(흐름), 메모리 index 갱신(기록)을 포함한다.
- **관심 포인트**: 단계마다 context brief를 넣어 새 세션의 agent가 "cold start"로 실행하게 하는 구조, 계획서 자체를 별도 모델이 적대적으로 리뷰하는 게이트, 모든 단계에 exit criteria와 불변식 검증 명령을 강제, 계획 변경을 형식화하고 감사 기록 남김.
- **확신도**: 높음

### browser-qa

- **한 줄 요약**: 브라우저 자동화 MCP로 배포된 UI를 smoke/interaction/visual regression/accessibility 4단계로 검증하고 SHIP / DO NOT SHIP 판정을 내리는 스킬.
- **설명**: staging/preview 배포 후나 프론트엔드 PR 검토 시 쓴다. Phase 1 smoke(콘솔 에러, 네트워크 4xx/5xx, Core Web Vitals 임계값), Phase 2 상호작용(링크, 폼 정상/비정상 입력, 로그인 흐름), Phase 3 3개 breakpoint 스크린샷을 baseline과 비교, Phase 4 axe-core 접근성 감사를 수행한다. 산출물은 단계별 결과와 verdict(SHIP / SHIP WITH FIXES / DO NOT SHIP / INCONCLUSIVE)가 담긴 QA Report이다. 기본 read-only, 프로덕션 URL에서 변경성 여정 금지, 테스트 계정 사용, 스크린샷의 PII 마스킹 같은 blast radius 규칙을 둔다.
- **분류**: 검증 / UI QA
- **관련도**: High
- **관련 축**: V, F
- **판단 근거**: 핵심이 배포 결과를 자동으로 검증하고 판정(verdict)이 있는 리포트로 게이트를 내리는 것이다. "baseline 없으면 조용한 PASS 대신 INCONCLUSIVE", "axe-core 통과는 필요조건일 뿐, 'accessible'이라 보고 금지"처럼 검증 한계를 명시하고, 안전 규칙(read-only 기본, 명시적 opt-in)이 흐름 통제 역할을 한다.
- **관심 포인트**: 증거 부족 시 PASS 대신 INCONCLUSIVE를 내는 판정 체계, 자동 검사의 커버리지 한계(axe 30–40%)를 리포트에 명시하는 정직성 규칙, 변경성 동작은 staging + 명시 opt-in에서만 허용하는 기본 read-only 원칙.
- **확신도**: 높음

### context-budget

- **한 줄 요약**: agents, skills, rules, MCP 서버, CLAUDE.md가 차지하는 컨텍스트 토큰을 감사해 우선순위화된 절감 권고를 내는 스킬.
- **설명**: 컨텍스트가 빨리 차거나 구성요소를 추가하기 전 여유를 확인할 때 쓴다. Inventory(파일별 토큰 추정, 임계 초과 플래그, MCP 툴 스키마 ~500토큰/툴) → Classify(Always/Sometimes/Rarely needed) → Detect Issues(비대한 description, 중복 컴포넌트, MCP 과다) → Report 4단계로 진행한다. 산출물은 컴포넌트별 토큰 표와 Top 3 최적화가 담긴 Context Budget Report이다. 옵션으로 세션 JSONL의 attachment/기타 레코드 바이트를 집계하는 스니펫이 있으며, 이 수치로 실제 컨텍스트 사용량을 단정하지 말고 `/context`, `/usage`를 쓰라고 한계를 밝힌다.
- **분류**: 관측 / 컨텍스트 최적화
- **관련도**: Medium
- **관련 축**: L, I
- **판단 근거**: 하네스 구성(지침 파일, 규칙, 도구 정의)이 컨텍스트에 미치는 비용을 측정하는 것이 본문 핵심이라 지침 계층의 점검과 사용량 계측에 부분적으로 닿는다. 통제·검증 장치라기보다 구성 감사 도구다.
- **관심 포인트**: 지침 파일(CLAUDE.md, rules, agent description)의 비용을 정량화하고 Always/Sometimes/Rarely로 분류하는 방식, 측정값이 증명하지 못하는 것을 명시하는 한계 서술, 구성 변경 후 재감사 습관.
- **확신도**: 중간

### laravel-patterns

- **한 줄 요약**: Laravel의 계층 구조, 라우팅, Eloquent, 마이그레이션, FormRequest, API 리소스, 큐/캐시 패턴을 정리한 프레임워크 코딩 지침.
- **설명**: Laravel 앱을 만들거나 리뷰할 때 참조한다. Controller → Service/Action → Model 경계, route model binding과 scoped binding, 서비스 컨테이너 바인딩, Eloquent 캐스트/스코프/eager loading, 트랜잭션, 마이그레이션 규칙, FormRequest 검증과 DTO 변환, 일관된 JSON 응답 포맷, 이벤트/큐/캐시 원칙을 PHP 예시로 보여준다. AI 작업의 통제·검증 메커니즘은 없는 프레임워크 패턴 모음이다.
- **분류**: 언어-코딩지침 (Laravel/PHP)
- **관련도**: None
- **관련 축**: -
- **판단 근거**: 본문 전체가 Laravel 코드 구조와 ORM 사용 패턴이며 검증/지침/기록/흐름 축의 범용 메커니즘이 없다. 인가·검증(FormRequest authorize/rules)은 앱 코드 수준의 내용이다.
- **관심 포인트**: -
- **확신도**: 높음

### quarkus-tdd

- **한 줄 요약**: Quarkus 3.x에서 JUnit5/Mockito/REST Assured/Camel 테스트와 JaCoCo 커버리지 게이트로 TDD를 하는 프레임워크 전용 테스트 가이드.
- **설명**: Quarkus 서비스에 기능 추가·버그 수정·리팩터링 시 쓴다. 테스트 먼저(실패) → 최소 구현 → 리팩터링 → JaCoCo 80%+ 순서의 워크플로를 말하고, @Nested/@DisplayName/givenX_whenY_thenZ/AAA 구조의 단위 테스트, Camel 라우트의 AdviceWith+MockEndpoint 테스트, CompletableFuture와 LogContext 전파 테스트, REST Assured 리소스/통합 테스트 예시를 길게 싣는다. Maven JaCoCo 설정은 라인 80%, 브랜치 70% 미달 시 check가 실패하도록 한다.
- **분류**: 언어-코딩지침 / 테스트 (Quarkus/Java)
- **관련도**: Low
- **관련 축**: V
- **판단 근거**: TDD 순서와 JaCoCo check 임계값 게이트, `verify(never())` 같은 검증 습관이 있으나 본문 대부분은 Quarkus/Camel/Java 도구 문법 예시다. 프레임워크 스킬 규칙상 Medium 미만이며 AI 작업 검증이라는 범용 메커니즘은 없다.
- **관심 포인트**: -
- **확신도**: 중간

### safety-guard

- **한 줄 요약**: PreToolUse hook으로 파괴적 명령을 가로채 확인을 받고(Careful), 쓰기를 한 디렉터리로 잠그며(Freeze), 둘을 합치는(Guard) 안전장치 스킬.
- **설명**: 프로덕션 작업, 자율(full-auto) 에이전트 실행, 마이그레이션/배포 중에 쓴다. Careful은 rm -rf, git push --force, git reset --hard, DROP TABLE, kubectl delete, --no-verify 등 감시 패턴을 감지해 설명·확인·더 안전한 대안을 제시한다. Freeze는 `/safety-guard freeze <dir>`로 그 밖의 Write/Edit를 차단하고, Guard는 읽기 전체 허용+지정 디렉터리만 쓰기 허용한다. `/safety-guard off`로 해제하며, 차단 이력은 `~/.claude/safety-guard.log`에 남긴다.
- **분류**: 안전장치 / hook
- **관련도**: High
- **관련 축**: F, L, I
- **판단 근거**: 핵심 목적이 에이전트의 파괴적 행동을 hook(Bash/Write/Edit/MultiEdit 대상 PreToolUse)으로 사전 차단·승인 요구하는 흐름 통제다. 디렉터리 쓰기 범위 제한은 작업 제약(지침)이고 blocked action 로그는 기록에 해당한다.
- **관심 포인트**: 위험 명령 패턴 목록 + 확인 요청 + 대안 제시, 쓰기 범위를 디렉터리로 고정하는 Freeze, 자율 실행 세션에서 기본 활성화하라는 권고, 차단 이력 로깅. 본문은 구현 상세(패턴 매칭 방식, hook 설정)를 주지 않아 선언 수준이다.
- **확신도**: 높음

### team-builder

- **한 줄 요약**: `claude agents`와 agents/ 마크다운에서 페르소나를 발견해 사용자가 최대 5개를 고르면 병렬 디스패치하고 합의/충돌을 종합하는 대화형 스킬.
- **설명**: 여러 전문 에이전트를 임시 팀으로 구성해 한 과제에 돌릴 때 쓴다. Step 1 동적 발견(CLI + glob, 이름 중복 제거, 우선순위 user > plugin > built-in) → Step 2 도메인 메뉴 → Step 3 선택(최대 5개 강제) → Step 4 Agent 툴로 병렬 spawn(실패는 인라인 표기 후 나머지 계속) → Step 5 결과를 에이전트별로 묶고 agreements/conflicts/next steps를 종합한다. 에이전트 간 대화가 필요할 때만 TeamCreate를 쓰고 그 외엔 독립 병렬 호출을 쓴다.
- **분류**: 오케스트레이션 / 멀티에이전트
- **관련도**: Medium
- **관련 축**: F
- **판단 근거**: 병렬 디스패치, 5개 상한 강제, 부분 실패 허용, 결과 종합(합의/충돌 식별)이라는 오케스트레이션 메커니즘이 있다. 다만 에이전트 선택 UI와 목록 발견이 중심이고 검증·체크포인트 장치는 약하다.
- **관심 포인트**: 독립 병렬 에이전트 결과에서 합의와 상충을 명시적으로 추출하는 synthesis 단계, 실패한 에이전트를 표기하고 계속 진행하는 복구 방식, 토큰 비용을 근거로 한 팀 크기 상한.
- **확신도**: 중간
