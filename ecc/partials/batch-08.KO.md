# batch-08

### autonomous-agent-harness

- **한 줄 요약**: Claude Code의 /loop, `claude -p`, 메모리, MCP, 컴퓨터 사용을 조합해 상시/예약 자율 에이전트를 구성하는 셋업 패턴 가이드.
- **설명**: 지속 실행·예약 실행이 필요할 때 쓴다. Persistent Memory(내장 메모리 + MCP memory server), Scheduled Operations(`/loop`, OS cron/CI 스케줄 + `claude -p`), Dispatch(CI/웹훅이 `claude -p` 호출), Computer Use, Task Queue(memory 파일의 task-queue.md)의 5개 구성요소를 설명한다. Hermes 구성요소와 ECC 대응표, 설정 단계, PR 리뷰어/리서치/미팅 준비 예시 워크플로를 포함한다. 산출물은 설정 절차와 큐/메모리 파일 패턴이다.
- **분류**: 오케스트레이션 / 자율 에이전트 셋업
- **관련도**: Medium
- **관련 축**: F, L, I
- **판단 근거**: 맨 앞 "Consent and Safety Boundaries"가 스케줄 생성·원격 dispatch·메모리 쓰기·컴퓨터 제어·외부 게시를 사용자 승인 전엔 금지하고 dry-run/로컬 큐를 먼저 쓰라고 규정한다. Constraints에 "스케줄 작업 완료를 항상 검증, cron 프롬프트에 에러 처리"가 있고, 메모리 3계층과 task-queue 파일이 기록 장치로 쓰인다. 나머지는 구성/설치 안내다.
- **관심 포인트**: 자율 동작의 명시적 동의·범위 제한과 dry-run 우선 원칙, 미검증 npm 패키지를 `npx -y`로 등록하지 말고 버전을 고정·검토하라는 공급망 주의, 메모리 계층(세션/프로젝트/그래프)과 파일 기반 task queue, 스케줄 작업의 완료 검증 요구.
- **확신도**: 중간

### autonomous-loops

- **한 줄 요약**: `claude -p` 순차 파이프라인부터 RFC 기반 멀티에이전트 DAG(Ralphinho)까지 자율 루프 6가지 패턴과 선택 기준을 정리한 스킬(continuous-agent-loop으로 대체 예정).
- **설명**: 자율 개발 루프를 설계할 때 참조한다. Sequential Pipeline, NanoClaw REPL, Infinite Agentic Loop, Continuous Claude PR Loop, De-Sloppify, Ralphinho DAG를 복잡도 순으로 소개하고 결정 매트릭스와 조합법, Anti-Patterns를 제공한다. Continuous Claude는 `--max-runs/--max-cost/--max-duration`·완료 신호·CI 실패 자동 수정·`SHARED_TASK_NOTES.md`로 반복 간 맥락을 잇는다. Ralphinho는 RFC를 의존성 DAG 작업 단위로 분해하고 난이도 tier별 파이프라인, 별도 컨텍스트의 리뷰, eviction이 있는 merge queue, SQLite 상태 저장을 쓴다.
- **분류**: 오케스트레이션 / 자율 루프
- **관련도**: High
- **관련 축**: F, V, L, I
- **판단 근거**: 루프 제어가 핵심 목적이다. 종료 조건(max-runs/cost/duration, completion-threshold 3회 연속), Ralphinho의 "리뷰어는 작성자가 아니다" 규칙, tier별 리뷰 깊이, merge queue의 rebase→테스트→land/evict 게이트와 eviction 컨텍스트 재투입, "any loop + verification-loop" 게이트, 중단 후 SQLite 재개가 본문에 구체적으로 있다.
- **관심 포인트**: 무한 루프 방지용 다중 종료 조건, 작성자-리뷰어 컨텍스트 분리로 author bias 제거, 부정 지시 대신 별도 De-Sloppify 패스를 두는 설계, 실패 시 맹목 재시도 대신 오류 컨텍스트를 다음 시도에 주입, 반복 간 SHARED_TASK_NOTES.md 기록, 작업 계획을 사람 개입의 최고 레버리지 지점으로 보는 원칙, `--allowedTools`로 단계별 권한 제한.
- **확신도**: 높음

### compose-multiplatform-patterns

- **한 줄 요약**: Compose Multiplatform/Jetpack Compose의 상태 관리, 내비게이션, 컴포저블 설계, expect/actual, 성능, 테마 패턴 모음.
- **설명**: KMP 또는 Android에서 Compose UI를 만들 때 참조한다. ViewModel + 단일 State 객체, Event Sink, 타입 안전 Navigation, 슬롯 API, Modifier 순서, `@Stable/@Immutable`, `LazyColumn key`, `derivedStateOf`, Material 3 동적 테마를 Kotlin 예시로 보인다. Anti-Patterns 목록으로 마무리한다. 전부 프레임워크 코딩 지침이다.
- **분류**: 언어-코딩지침 (Kotlin/Compose)
- **관련도**: None
- **관련 축**: -
- **판단 근거**: 본문이 전부 Compose 코드 패턴이다. 검증, 지시, 기록, 흐름 제어 같은 AI 통제 메커니즘이 없다.
- **관심 포인트**: -
- **확신도**: 높음

### connections-optimizer

- **한 줄 요약**: X·LinkedIn 팔로우/연결 네트워크를 점수화해 정리·추가 후보를 내고 사용자 어조의 아웃리치 초안을 만드는 소셜 네트워크 관리 스킬.
- **설명**: 사용자 우선순위, 대상 플랫폼, do-not-touch 목록, 모드(light-pass/default/aggressive)를 받아 팔로잉 인벤토리를 가져오고 상호성·활동성·브리지 가치 등으로 prune/keep/add 후보를 점수화한다. 채널(X DM, LinkedIn, Apple Mail 초안)을 고르고 brand-voice를 거쳐 초안을 쓴다. 산출물은 Prune Queue/Review Queue/Keep/Add Targets/Drafts를 담은 CONNECTIONS OPTIMIZER REPORT다.
- **분류**: 도메인-업무 (소셜/아웃리치)
- **관련도**: Low
- **관련 축**: F
- **판단 근거**: 소셜 그래프 관리라는 업무 도메인이 본문의 중심이다. 다만 Safety Defaults가 review-first, 자동 pruning 금지, DM/초대/이메일 자동 발송 금지, 적용 전 랭크된 액션 플랜 제시를 정해 승인 게이트 패턴을 약하게 보여 준다.
- **관심 포인트**: -
- **확신도**: 중간

### dashboard-builder

- **한 줄 요약**: Grafana/SigNoz 등에서 운영자 질문에서 출발해 허영 패널 없는 모니터링 대시보드를 만드는 가이드.
- **설명**: 대시보드를 만들 때 레이아웃이 아니라 건강/지연/처리량/포화도/서비스별 위험이라는 운영 질문에서 시작하라고 한다. 기존 대시보드 JSON 스키마를 먼저 조사하고, overview→performance→resources→service-specific 구조의 최소 보드를 만든 뒤 질문에 답하지 않는 패널을 제거한다. Elasticsearch/Kafka/API gateway 예시 패널 세트와 품질 체크리스트(유효 JSON, 제목·단위, 임계값, 변수, 시간 범위)를 제공한다.
- **분류**: 도메인-업무 / 관측 대시보드
- **관련도**: None
- **관련 축**: -
- **판단 근거**: 모니터링 대시보드 제작 방법론으로, AI 작업의 검증·지시·기록·흐름 통제를 다루지 않는다. 체크리스트도 산출 대시보드 품질용이다.
- **관심 포인트**: -
- **확신도**: 높음

### opensource-pipeline

- **한 줄 요약**: 비공개 프로젝트를 forker, sanitizer, packager 3개 에이전트로 fork → 비밀 제거 검증 → 패키징해 안전하게 공개하는 파이프라인.
- **설명**: `/opensource fork|verify|package|list|status` 명령으로 동작한다. forker가 파일을 복사하고 시크릿을 제거하며 `.env.example`과 FORK_REPORT.md를 만든다. sanitizer가 시크릿·PII·내부 참조·위험 파일·설정 완전성·git 히스토리 6개 범주를 스캔해 SANITIZATION_REPORT.md에 PASS/FAIL을 낸다. 통과하면 packager가 CLAUDE.md, setup.sh, README, LICENSE 등을 생성하고, 사용자 승인 후에만 `gh repo create --public`으로 게시한다.
- **분류**: 오케스트레이션 / 보안 게이트
- **관련도**: High
- **관련 축**: F, V, I
- **판단 근거**: 단계 사이에 독립 sanitizer 에이전트를 안전 게이트로 두는 것이 핵심이다. FAIL이면 중단하고 사용자에게 수정/중단을 묻고 재스캔은 최대 3회로 제한하며, 3회 실패 시 수동 수정을 요구한다. Anti-Patterns가 "사용자 승인 없는 push 금지, sanitizer 생략 금지, FAIL 후 진행 금지"를 명시한다.
- **관심 포인트**: 생성 에이전트와 검증 에이전트의 분리, 보고서 파일(FORK/SANITIZATION_REPORT)을 단계 간 인계 산출물로 쓰는 방식, PASS/FAIL 게이트와 재시도 상한(3회), 비가역 행위(public 게시) 직전의 명시적 사용자 승인, staging 디렉터리에서의 검토 후 게시.
- **확신도**: 높음

### quarkus-verification

- **한 줄 요약**: Quarkus 서비스를 build, 정적 분석, 테스트+JaCoCo, 보안 스캔, 네이티브 컴파일, 헬스체크 등 10단계로 검증하는 루프.
- **설명**: PR 전, 대규모 리팩터링/의존성 업그레이드 후, 배포 전에 실행한다. Phase 1 Build(실패 시 중단) → Checkstyle/PMD/SpotBugs → 테스트와 80% 커버리지 → OWASP dependency-check·ZAP → GraalVM native → K6 부하 → 헬스 → 컨테이너 이미지·Trivy → 설정 검증 → 문서 검토 순이다. 카테고리별 체크리스트, `set -e` 자동화 스크립트, GitHub Actions 예시도 있다. 산출물은 각종 리포트와 체크리스트 통과 여부다.
- **분류**: 검증 / 프레임워크 특화 (Quarkus/Java)
- **관련도**: Medium
- **관련 축**: V, F
- **판단 근거**: 순차 게이트, 커버리지 임계값, 체크리스트, CI 통합을 갖춘 검증 루프다. 그러나 명령과 예제가 전부 Maven/Quarkus/GraalVM 전용이고 AI 작업을 검증하는 범용 메커니즘(리포트 판정 포맷, AI 대상 게이트)은 없다. GUIDE의 프레임워크 검증 섹션 기준으로 Medium까지만 부여한다.
- **관심 포인트**: 빌드 실패 시 중단하는 단계 구조, 커버리지 임계값 강제(`jacoco:check`), `set -e` 스크립트와 CI에 동일 게이트 이식, 정적 분석-테스트-보안-배포 순의 계층 검증. 단 PASS/FAIL 판정 리포트 형식은 없다.
- **확신도**: 중간

### security-bounty-hunter

- **한 줄 요약**: 저장소에서 원격 도달 가능하고 버그 바운티에 인정될 만한 취약점만 골라 PoC와 보고서까지 만드는 헌팅 워크플로.
- **설명**: 취약점 제보/바운티 제출을 준비할 때 쓴다. SSRF, 인증 우회, 역직렬화, SQLi, 커맨드 인젝션, 경로 순회, 자동 XSS를 in-scope로 두고, 로컬 전용 pickle/eval, 보안 헤더 누락, self-XSS 등은 skip 목록으로 제외한다. 워크플로는 스코프 확인 → 진입점 탐색 → semgrep 등 정적 도구를 triage 입력으로만 사용 → 코드 경로 끝까지 읽기 → 최소 PoC → 중복 확인이다. Report Structure와 제출 전 Quality Gate를 제공한다.
- **분류**: 보안 / 도메인-업무 (취약점 헌팅)
- **관련도**: Low
- **관련 축**: V
- **판단 근거**: 대상 코드의 취약점 탐지라는 보안 도메인 작업이 중심이다. 정적 도구 출력을 triage 입력으로만 보고 "PoC가 동작", "사용자 입력이 sink에 도달함을 증명" 같은 증거 기반 Quality Gate를 두는 점이 약하게 검증과 닿는다.
- **관심 포인트**: -
- **확신도**: 중간
