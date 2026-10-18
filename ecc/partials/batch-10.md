# batch-10

### agent-payment-x402

- **한 줄 요약**: x402 결제 프로토콜과 MCP 결제 도구로 에이전트가 지출 정책 안에서만 결제하도록 하는 스킬.
- **설명**: 에이전트가 유료 API를 직접 결제해야 할 때 쓴다. Base는 `agentwallet-sdk` MCP 서버, X Layer는 OKX Agent Payments Protocol 경로를 Decision Tree로 고르고, 판매자 측 SDK 가이드 링크도 제공한다. 모든 결제 호출에 SpendingPolicy(task별/session별 예산, 수신자 allowlist, rate limit)를 적용하며, 정책은 에이전트가 아니라 orchestrator가 위임 전에 설정한다. TypeScript 예제로 `set_policy` 성공 확인 후에만 위임하고, `preToolCheck`로 5개 실패 경로를 모두 차단(fail-closed)하는 패턴을 보여 준다.
- **분류**: 인프라 / 결제 / 안전장치
- **관련도**: Medium
- **관련 축**: F, L
- **판단 근거**: "Spending policy is set by the orchestrator ... prevents agents from escalating their own spending limits", `preToolCheck` fail-closed 훅, `list_transactions` 감사 trail, 결제 전 명시적 사용자 확인 요구가 본문에 있다. 다만 핵심은 결제 도메인 통합이며 통제 메커니즘은 부분적이다.
- **관심 포인트**: 에이전트가 자기 권한을 못 올리게 정책을 orchestrator가 설정하는 분리 원칙, 정책 설정 실패 시 위임 중단, 연결 실패/형식 오류/NaN 모두 차단하는 fail-closed 사전 검사, post-task hook으로 지출 감사 기록, 비밀키를 다루는 서브프로세스에 env 화이트리스트와 버전 pinning 적용.
- **확신도**: 높음

### agentic-engineering

- **한 줄 요약**: eval-first 실행, 작업 분해, 모델 티어 라우팅으로 에이전트 주도 개발을 운영하는 짧은 원칙 스킬.
- **설명**: 에이전트가 구현 대부분을 맡고 사람이 품질·리스크를 통제하는 워크플로를 위한 지침이다. Eval-First Loop(capability/regression eval 정의 → baseline과 실패 시그니처 기록 → 구현 → 재실행해 delta 비교)와 15분 단위 분해 규칙(독립 검증 가능, 단일 주요 리스크, 명확한 done 조건)을 제시한다. Haiku/Sonnet/Opus 라우팅, 세션 유지/신규/compact 시점, AI 생성 코드 리뷰 초점(불변식, 에러 경계, 보안·인증 가정), 작업별 비용 추적 항목을 포함한다. 분량은 짧고 체크리스트 위주다.
- **분류**: 오케스트레이션 / 워크플로 원칙
- **관련도**: High
- **관련 축**: V, I, F
- **판단 근거**: "Define completion criteria before execution", Eval-First Loop, "Review Focus for AI-Generated Code"가 AI 작업의 검증과 통제를 핵심 주제로 삼는다. 본문 전체가 이 원칙들로 구성된다.
- **관심 포인트**: 실행 전 완료 기준 정의와 baseline 대비 delta 비교, 검증 가능한 작업 단위 분해, 스타일은 자동 lint에 맡기고 리뷰는 불변식/경계/보안에 집중, 재시도·시간·성공 여부를 작업별로 기록하고 실패 시에만 모델 승급. 다만 구체 절차나 도구 없이 원칙 수준이다.
- **확신도**: 높음

### architecture-decision-records

- **한 줄 요약**: 코딩 중 발생한 아키텍처 결정을 `docs/adr/`에 번호 붙은 ADR 문서와 인덱스로 남기는 스킬.
- **설명**: "ADR this" 같은 명시 신호나 프레임워크/DB 선택, trade-off 논의 같은 암묵 신호를 감지해 Nygard 형식 ADR(Context, Decision, Alternatives, Consequences, Status)을 작성한다. 처음에는 디렉터리·README 인덱스·template 생성 전에 사용자 동의를 받고, 초안은 사용자 승인 후에만 파일로 쓴다. "왜 X를 골랐나" 질문에는 기존 ADR을 인덱스에서 찾아 읽어 답한다. 상태 수명주기(proposed → accepted → deprecated/superseded)와 Do/Don't, planner/code-reviewer 연계(ADR 없는 아키텍처 변경 PR 지적)를 정의한다.
- **분류**: 문서화 / 의사결정 기록
- **관련도**: Medium
- **관련 축**: L, I
- **판단 근거**: 결정과 근거, 기각한 대안을 코드 옆에 영속 기록하는 것이 핵심(L)이다. 암묵 신호는 자동 생성하지 않고 승인 후 기록하는 규칙이 있으나 AI 통제보다는 문서화 관례에 가깝다.
- **관심 포인트**: 결정의 "why"와 rejected alternatives를 남기는 기록 포맷, 파일 생성 전 명시 동의와 초안 승인 게이트, 대체된 결정은 후속 ADR을 링크하는 수명주기, reviewer가 ADR 누락 PR을 플래그하는 연계. 세션이 바뀌어도 AI가 과거 결정을 조회할 수 있는 외부 기억 역할을 한다.
- **확신도**: 중간

### e2e-testing

- **한 줄 요약**: Playwright 기반 E2E 테스트의 POM, 설정, flaky 대응, 산출물 관리, CI 연동 패턴 모음.
- **설명**: 테스트 디렉터리 구조, Page Object Model, 테스트 구조 예시, `playwright.config.ts`(CI 시 retries 2, `forbidOnly`, trace/screenshot/video 보존, html/junit/json reporter)를 제시한다. flaky 대응으로 `test.fixme` 격리, `--repeat-each=10` 재현, 임의 timeout 대신 조건 대기로 바꾸는 수정 예시를 담는다. GitHub Actions 워크플로(실패 시도 리포트 업로드), Test Report 템플릿, 지갑 mock과 금융 흐름 테스트(production에서는 skip) 예시도 있다. 전부 Playwright/TypeScript 구체 사용법이다.
- **분류**: 검증 / 프레임워크-테스트
- **관련도**: Low
- **관련 축**: V
- **판단 근거**: 도구(Playwright) 중심 테스트 패턴이며 AI 작업을 검증하는 범용 메커니즘은 없다. flaky 격리·재현 절차, 실패 아티팩트 보존, 리포트 템플릿, 실거래 환경 skip 가드가 참고 수준으로만 닿는다.
- **관심 포인트**: -
- **확신도**: 중간

### lead-intelligence

- **한 줄 요약**: Exa/X API로 영업·제휴 대상 리드를 점수화하고 warm path를 찾아 채널별 아웃리치 초안을 만드는 파이프라인 스킬.
- **설명**: 5단계(Signal Scoring → Mutual Ranking → Warm Path Discovery → Enrichment → Outreach Draft)로 리드를 찾고 순위화한다. 신호별 가중치 표와 bridge 점수 수식으로 중개자를 랭킹하고, 이메일/LinkedIn/X 채널 규칙에 따라 메시지를 쓴다. signal-scorer 등 4개 서브에이전트를 쓰며 `brand-voice`의 VOICE PROFILE을 재사용한다. 도메인은 영업/마케팅 자동화이다.
- **분류**: 도메인-업무 (영업/아웃리치)
- **관련도**: Low
- **관련 축**: I, F
- **판단 근거**: 본문 대부분이 리드 스코어링과 아웃리치라는 업무 도메인이다. 다만 "Untrusted Source Content" 절이 프로필/게시물을 데이터로만 취급하고 수신자는 사용자가 정하며 auto-send 금지, 초안만 만들고 승인 후 발송하도록 규정한다.
- **관심 포인트**: -
- **확신도**: 중간

### skill-scout

- **한 줄 요약**: 새 스킬을 만들기 전에 로컬/마켓플레이스/GitHub/웹에서 기존 스킬을 검색하고 외부 후보를 vetting하는 스킬.
- **설명**: 스킬 생성 요청 시 6단계로 진행한다. 의도·키워드 추출, 로컬(`~/.claude/skills`, 마켓플레이스) 검색, `gh search`와 웹 검색(최대 3 쿼리), 외부 매치 vetting, 순위화(최대 10개), "Use existing / Fork / Create fresh" 선택지 제시이다. 외부 스킬은 SKILL.md를 읽고 예상치 못한 셸 명령, 파일 쓰기, 네트워크 호출, 자격증명 처리, 패키지 설치를 점검하고, 마켓플레이스 원본을 직접 수정하지 않는다. 결과 표와 요약 예시를 포함한다.
- **분류**: 메타-스킬관리
- **관련도**: Low
- **관련 축**: I
- **판단 근거**: 스킬 중복 방지 검색 워크플로가 중심이다. Step 4의 외부 스킬 vetting(사전 읽기, 위험 동작 점검)과 "사용자가 선택하기 전에는 생성하지 않음" 승인 규칙이 약하게 지침/통제와 닿는다.
- **관심 포인트**: -
- **확신도**: 중간

### terminal-opener

- **한 줄 요약**: 실행 파일과 argv 배열을 셸 없이 WezTerm 등 보이는 터미널 창에 여는 launch plan 도구 스킬.
- **설명**: `scripts/open-terminal.js`로 명령을 문자열 보간 없이 argv로 유지하고 모든 spawn을 `shell: false`로 실행한다. 기본은 실행하지 않는 plan(dry-run/`--json`)이고, `--launch`는 사용자가 명시 요청하고 argv를 검토한 뒤에만 쓴다. WezTerm mux 실패 시 detached 시작으로 폴백하며 `muxFailure`로 원인을 진단한다. `--recover`는 사용자 설정을 건너뛰고, `--detect --json`은 터미널 가용성을 점검한다. 호출 프로세스의 환경변수를 필터링 없이 상속한다는 경고가 있다.
- **분류**: 도구 사용법 / 인프라
- **관련도**: Low
- **관련 축**: F
- **판단 근거**: 특정 터미널을 여는 도구 사용법이 본문 전부다. 기본 non-launching plan, 명시 요청 후에만 실행, 셸 인젝션 방지라는 안전 기본값이 참고할 패턴 정도다.
- **관심 포인트**: -
- **확신도**: 중간

### workspace-surface-audit

- **한 줄 요약**: repo, MCP, 플러그인, env 키 이름, 하네스 설정을 읽기 전용으로 감사하고 ECC-native 다음 조치를 추천하는 스킬.
- **설명**: "지금 이 워크스페이스가 무엇을 할 수 있고 무엇을 추가해야 하나"에 답한다. Phase 1 인벤토리, Phase 2 공식/설치된 플러그인 대비 벤치마크, Phase 3 gap을 skill/hook/agent/MCP 중 적절한 형태로 환원하는 순서다. 산출물은 Current surface, Parity, Primitive-only gaps, Missing integrations, Top 3-5 next moves의 5개 섹션이다. 비밀 값은 출력하지 않고 키 이름과 존재 여부만 표시하며, 사용자 요청 없이는 파일을 수정하지 않는다.
- **분류**: 감사 / 환경 점검
- **관련도**: Medium
- **관련 축**: I, F
- **판단 근거**: 읽기 전용 규칙과 "Never print secret values"가 안전장치다. Phase 3 표가 반복 워크플로는 Skill, 자동 강제는 Hook, 위임 역할은 Agent로 구분해 하네스 통제 수단을 선택하는 기준을 준다. 다만 주목적은 환경 인벤토리와 ECC 제품 로드맵 추천이다.
- **관심 포인트**: 자동 enforcement는 hook, 반복 워크플로는 skill로 나누는 선택 기준, 이미 가능/래핑 부족/통합 없음의 3분류, 비밀 값 마스킹과 읽기 전용 감사 원칙, 하네스 설정 파일(.mcp.json, hooks, settings) 점검 목록.
- **확신도**: 중간
