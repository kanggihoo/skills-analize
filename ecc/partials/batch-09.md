# batch-09

### codebase-onboarding

- **한 줄 요약**: 낯선 코드베이스를 4단계로 분석해 온보딩 가이드와 시작용 CLAUDE.md를 생성하는 스킬.
- **설명**: 새 프로젝트에 합류하거나 Claude Code를 처음 쓸 때 사용한다. Phase 1 Reconnaissance(매니페스트, 프레임워크, 진입점, 디렉터리, 설정, 테스트 구조를 Glob/Grep으로 탐지) → Phase 2 Architecture Mapping → Phase 3 Convention Detection → Phase 4 산출물 생성 순으로 진행한다. 산출물은 Onboarding Guide(스택, 진입점, 요청 수명주기, Where to Look 표)와 Starter CLAUDE.md이며, 기존 CLAUDE.md가 있으면 보존하면서 추가/변경분을 표시한다.
- **분류**: 온보딩 / 문서 생성
- **관련도**: Medium
- **관련 축**: I
- **판단 근거**: Output 2가 프로젝트 규약(코드 스타일, 테스트/빌드 명령, 커밋·PR 관례)을 담은 CLAUDE.md를 자동 생성해 AI에 대한 지침을 만든다. 나머지는 코드베이스 이해용 가이드로 통제 메커니즘과는 거리가 있다.
- **관심 포인트**: 코드에서 관례를 탐지해 CLAUDE.md를 만들되 "100줄 이하", "기존 지침 보존 후 변경분 명시", "확신 없으면 '판단 불가'로 표기, 추측 금지(Verify, don't guess)" 같은 지침 작성 규칙.
- **확신도**: 중간

### cost-tracking

- **한 줄 요약**: ECC cost-tracker hook이 남긴 로컬 JSONL 로그에서 토큰 사용량과 비용을 집계·보고하는 스킬.
- **설명**: `~/.claude/metrics/costs.jsonl`(세션 종료 시 hook이 append하는 세션별 누적 스냅샷)을 읽어 비용을 보고한다. 합산 시 세션별 최신 행만 취해야 중복 집계를 피한다는 규칙, 로그 부재 시 데이터를 지어내지 않는다는 규칙을 명시한다. Node 원라이너로 오늘/어제/전체, 모델별 비용을 출력하고 per-session 캐시(cost-snapshots)의 구조도 설명한다. 산출물은 비용 요약 리포트/CSV이다.
- **분류**: 관측 / 비용 리포트
- **관련도**: Medium
- **관련 축**: L
- **판단 근거**: 세션 단위로 토큰·비용을 hook으로 기록하는 JSONL 로그 스키마(session_id, model, 토큰, estimated_cost_usd)와 그 조회 방법이 본문 핵심이다. 통제 장치라기보다 사용량 기록/조회에 해당한다.
- **관심 포인트**: stop hook 기반 append-only 누적 스냅샷 로그, byte cursor 기반 증분 캐시, "로그 없으면 fabricate 금지", 하드코딩 가격 대신 기록된 값을 source of truth로 삼는 원칙.
- **확신도**: 높음

### latency-critical-systems

- **한 줄 요약**: 실시간/저지연 시스템의 p50/p95/p99, freshness, queue depth를 분리 측정하고 live readback으로 검증하는 가이드.
- **설명**: 핫 패스를 source→...→browser 구간별로 매핑해 각각 측정하고, 왕복 제거, 캐시, 배칭, backpressure 순의 최적화 순서를 제시한다. 배포된 표면이 있으면 HTTP 타이밍, provider freshness, 큐 상태, 브라우저 실검증 등 live readback으로 확인한다. 가드레일로 검증 생략을 통한 최적화 금지, stale 데이터를 캐시로 은폐 금지, 측정 없는 ms 주장 금지, 실주문/파괴적 마이그레이션은 승인 게이트 필요를 둔다.
- **분류**: 성능 엔지니어링 / 인프라
- **관련도**: Low
- **관련 축**: V
- **판단 근거**: 도메인(성능) 엔지니어링 지침이 중심이다. 다만 "측정 없이 주장하지 않기", live readback 검증, 승인 게이트 가드레일이 소량 포함된다.
- **관심 포인트**: -
- **확신도**: 중간

### perl-security

- **한 줄 요약**: Perl의 taint mode, 입력 검증, 안전한 프로세스 실행, DBI 파라미터화, 웹 보안, perlcritic 정책을 다루는 보안 코딩 지침.
- **설명**: Perl 코드에서 사용자 입력, 파일 경로, 시스템 명령, SQL, HTML 출력을 다룰 때 따를 안전 패턴을 예시로 정리한다. 허용목록 검증, 3-arg open, list-form system, DBI placeholder, 출력 인코딩, CSRF/세션/헤더 설정을 포함한다. perlcritic 보안 정책(.perlcriticrc)과 CI 실행 명령, 빠른 체크리스트, 안티패턴 목록도 있다.
- **분류**: 언어-코딩지침 / 보안
- **관련도**: Low
- **관련 축**: V
- **판단 근거**: 언어별 보안 코딩 패턴이 본문 대부분이다. perlcritic을 CI 게이트(`|| exit 1`)로 돌리는 정적 검사 설정만 약하게 검증과 닿는다.
- **관심 포인트**: -
- **확신도**: 높음

### perl-testing

- **한 줄 요약**: Perl의 Test2::V0/Test::More, prove, 모킹, Devel::Cover 커버리지와 TDD를 다루는 테스트 패턴 가이드.
- **설명**: RED-GREEN-REFACTOR 예시로 시작해 Test::More 기본 단언, Test2::V0 빌더, subtest, 예외 테스트, 디렉터리 구조와 prove 명령, Test::MockModule 모킹, Devel::Cover 커버리지(80% 임계 CI 실패 처리)를 설명한다. DO/DON'T 목록과 흔한 함정(done_testing 누락, over-mocking, test pollution)도 정리한다. 전부 Perl 도구 사용법이다.
- **분류**: 언어-코딩지침 / 테스트
- **관련도**: Low
- **관련 축**: V
- **판단 근거**: TDD와 커버리지 임계값 게이트가 있으나 Perl 전용 도구 문법 중심이며 AI 작업 검증이라는 범용 메커니즘은 없다. 언어 스킬이므로 Medium 미만으로 판단.
- **관심 포인트**: -
- **확신도**: 중간

### security-review

- **한 줄 요약**: 인증, 입력, 시크릿, API 등을 다룰 때 적용하는 웹 애플리케이션 보안 체크리스트와 패턴 모음.
- **설명**: 시크릿 관리, 입력 검증, SQL injection, 인증/인가, XSS, CSRF, rate limiting, 민감 데이터 노출, Solana 블록체인, 의존성 등 10개 영역별로 FAIL/PASS 코드 예시와 Verification Steps 체크박스를 제시한다. 보안 자동 테스트 예시와 Pre-Deployment Security Checklist를 포함한다. 보조 파일 cloud-infrastructure-security.md는 IAM, 시크릿 로테이션 등 클라우드 체크리스트를 다룬다.
- **분류**: 보안 / 검증 체크리스트
- **관련도**: Medium
- **관련 축**: V
- **판단 근거**: 영역별 Verification Steps와 배포 전 체크리스트가 리뷰 게이트 역할을 한다. 다만 내용은 TypeScript/Next.js/Supabase 위주의 구체 보안 코딩 패턴이며 AI 작업 통제 메커니즘 자체는 아니다.
- **관심 포인트**: 영역별 체크박스형 Verification Steps와 "Before ANY production deployment" 배포 전 게이트 목록, 인증·인가·검증·rate limit을 테스트로 고정하는 보안 테스트 예시.
- **확신도**: 중간

### unified-memory

- **한 줄 요약**: ECC Memory Vault로 Claude, Codex 등 여러 하네스 간에 검증 가능한 컨텍스트와 핸드오프를 공유하는 스킬.
- **설명**: 이식 가능한 `ecc.memory.v1` Markdown 문서를 project/team/user 스코프의 로컬 vault에 저장하고 CLI(`ecc memory search/save/handoff/doctor`)와 opt-in MCP 서버(save/search/read/doctor만 노출)로 접근한다. 흐름은 쓰기 전 recall, 저장, 핸드오프 작성, doctor 검증이다. "Recall is evidence, not certainty" 절은 회상된 내용을 신뢰하지 말고 현재 상태를 재확인하며, 불완전 스캔과 빈 결과를 구분하고, 검증된 결과와 의도를 분리 기록하라고 규정한다.
- **분류**: 메모리 / 세션 상태 / 핸드오프
- **관련도**: High
- **관련 축**: L, I, F
- **판단 근거**: 에이전트 간 메모리 기록과 핸드오프가 핵심 목적이다. 스코프 분리, fail-closed `.gitignore`, create-only 쓰기, trust: unreviewed, 비밀 저장 거부, 회상 내용을 지시로 취급 금지 등 구체적 통제 규칙이 있다.
- **관심 포인트**: 회상 내용은 untrusted 데이터이며 권한을 부여하지 못한다는 원칙, 핸드오프 본문 구성(목표/현재 상태/증거/남은 작업/다음 행동), 메모리를 정책/규칙으로 자동 승격하지 않고 사람 검토를 거치는 규칙, MCP 표면에서 overwrite/review/shell 도구를 의도적으로 제외한 최소 권한 설계, `doctor`로 vault 무결성 검증.
- **확신도**: 높음

### verification-loop

- **한 줄 요약**: build, type, lint, test(커버리지), security grep, diff review 6단계를 돌려 PASS/FAIL 검증 리포트를 만드는 스킬.
- **설명**: 기능 완료나 리팩터링 후, PR 전에 호출한다. Phase 1~6을 순서대로 실행하며 빌드 실패 시 중단하고 수정한다. 테스트는 80% 커버리지를 목표로 하고 보안 단계는 secret/console.log grep, 마지막은 git diff 리뷰다. 최종 산출물은 각 단계 PASS/FAIL과 READY/NOT READY 판정, 수정할 이슈 목록을 담은 VERIFICATION REPORT이며, 긴 세션에서는 15분마다 또는 주요 변경 후 반복하는 Continuous Mode와 PostToolUse hook 보완 관계를 언급한다.
- **분류**: 검증
- **관련도**: High
- **관련 축**: V, F
- **판단 근거**: AI 세션 작업을 게이트 방식으로 검증하고 리포트로 판정하는 것이 핵심 목적이다. 단계별 중단 조건, 정형 리포트, Continuous Mode, hook 연계를 갖춘다.
- **관심 포인트**: 빌드 실패 시 중단하는 순차 게이트, READY/NOT READY 판정 리포트 포맷, 주기적/체크포인트 재검증, 즉시 검사(hook)와 포괄 검사(스킬)의 역할 분담. 단 명령이 npm/tsc 중심이고 보안 grep이 얕다는 한계가 있다.
- **확신도**: 높음
