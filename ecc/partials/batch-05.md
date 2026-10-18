# batch-05

### accessibility

- **한 줄 요약**: Web/iOS/Android UI를 WCAG 2.2 AA 기준으로 설계·구현·감사하기 위한 접근성 지침.
- **설명**: UI 컴포넌트 명세나 접근성 감사 시 사용한다. 컴포넌트 역할 식별 → 인지 가능 속성(대비 4.5:1, 대체 텍스트) → 조작 가능(타깃 24x24px, 포커스 표시) → 이해 가능(오류 메시지, Redundant Entry) → Robust(Name/Role/Value, aria-live) 5단계로 구성된다. Web/iOS/Android 속성 매핑표, 예제 코드, 안티패턴(div-button, 색상만 의미, 포커스 미포함 모달)과 체크리스트를 제공한다.
- **분류**: 도메인-코딩지침 / UI 접근성
- **관련도**: None
- **관련 축**: -
- **판단 근거**: 본문 전체가 WCAG 기준과 플랫폼별 UI 속성 코딩 지침이다. AI 작업의 통제·검증 메커니즘은 없고, 끝의 체크리스트는 UI 산출물 품질 항목일 뿐이다.
- **관심 포인트**: -
- **확신도**: 높음

### agent-eval

- **한 줄 요약**: 코딩 에이전트(Claude Code, Aider, Codex 등)를 YAML 과제와 judge로 나란히 비교해 pass rate, 비용, 시간, 일관성을 측정하는 CLI 스킬.
- **설명**: 에이전트 선택이나 모델/도구 변경 시 인상이 아닌 측정값으로 판단하려고 쓴다. 과제를 YAML(prompt, 대상 파일, judge, 고정 commit)로 정의하고, 실행마다 git worktree를 새로 만들어 격리한 뒤 prompt를 넘기고 judge를 돌려 pass/fail, 비용, 시간을 기록한다. judge는 pytest/command(결정적), grep(패턴), llm(LLM-as-judge) 세 종류다. `agent-eval report`로 비교 표를 만든다.
- **분류**: 검증 / 에이전트 평가
- **관련도**: High
- **관련 축**: V
- **판단 근거**: 에이전트 산출물을 결정적 judge와 LLM judge로 채점하고 반복 실행의 일관성까지 측정하는 것이 핵심 목적이다. Best Practices에 "3회 이상 반복(비결정성)", "commit 고정", "결정적 judge 최소 1개 포함(LLM judge는 노이즈)"이 명시돼 있다.
- **관심 포인트**: 확률적 에이전트를 반복 시행과 consistency 지표로 다루는 방식, worktree 격리로 재현성 확보, 결정적 judge와 LLM judge를 섞되 결정적 judge를 필수로 두는 규칙, 과제 정의를 테스트 픽스처처럼 버전 관리하는 원칙, 비용을 pass rate와 함께 추적.
- **확신도**: 높음

### benchmark-methodology

- **한 줄 요약**: 범위가 정해진 경쟁사 집합을 9개 차원, 1~5점 증거 기반 루브릭으로 채점해 프로필 카드를 만드는 경쟁 분석 방법론.
- **설명**: competitive-platform-analysis 이후, competitive-report-structure 이전 단계에서 쓴다. 먼저 고객 positioning brief(전략적 긴장, 차별점)를 확정하고 9개 가중 차원(포지셔닝, 보이스, 비주얼, 패키징, 증거, 엔터프라이즈 준비도, 사고 리더십, 가격, 긴장 축)을 채점한다. 점수마다 한 줄 근거와 출처를 요구하며 단일 종합 점수와 긴장 축 평균을 금지한다. 산출물은 경쟁사별 프로필 카드와 tension 2x2 플롯이다.
- **분류**: 도메인-업무 / 경쟁 분석
- **관련도**: Low
- **관련 축**: V
- **판단 근거**: 주제는 마케팅/브랜드 경쟁 벤치마킹으로 도메인 업무 자동화다. 다만 "증거 없는 점수 금지", asserted vs proven 구분, 편향 통제, 세트 전체 재보정 같은 채점 규율이 참고할 만한 패턴이다.
- **관심 포인트**: -
- **확신도**: 중간

### competitive-platform-analysis

- **한 줄 요약**: 벤치마킹 전에 경쟁사 집합을 선정하고 Direct/Adjacent/Aspirational 티어로 나누며 출처를 정하는 경쟁 지형 스코핑 스킬.
- **설명**: 경쟁 분석의 첫 단계다. positioning brief가 없으면 진행하지 않고 브랜드 디스커버리 인터뷰로 확보하라고 규정한다. 8개 축(포지셔닝, 전문화, 규모, 계약 형태 등)으로 후보를 배치하고 1~5점 사전 필터 매트릭스로 10~18개를 8~12개 프로필 대상으로 줄인다. 모든 속성은 최소 두 출처로 교차 검증하며, 산출물은 티어와 출처 링크가 붙은 경쟁사 집합이다.
- **분류**: 도메인-업무 / 경쟁 분석
- **관련도**: None
- **관련 축**: -
- **판단 근거**: 마케팅/전략 리서치 업무 자동화다. "brief 없이 진행 금지", "두 출처 교차 검증"은 일반 리서치 규율일 뿐 AI 작업 통제 장치가 본문의 중심이 아니다.
- **관심 포인트**: -
- **확신도**: 높음

### content-hash-cache-pattern

- **한 줄 요약**: SHA-256 내용 해시를 키로 파일 처리 결과를 캐시하고 서비스 레이어로 분리하는 Python 캐싱 패턴.
- **설명**: PDF 파싱 같은 비싼 파일 처리를 반복할 때 쓴다. 청크 단위 SHA-256으로 키를 만들어 `{hash}.json`으로 저장하고, 파일 이동/이름 변경은 캐시 히트로, 내용 변경은 자동 무효화로 처리한다. 캐시 손상은 miss로 취급하고 hit/miss를 로그로 남긴다. 순수 처리 함수와 캐시 래퍼(`extract_with_cache`)를 분리하라는 SRP 원칙과 사용하지 말아야 할 경우(설정 의존 결과 등)를 제시한다.
- **분류**: 언어-코딩지침 / 캐싱 패턴
- **관련도**: None
- **관련 축**: -
- **판단 근거**: 범용 소프트웨어 캐싱 설계 패턴이며 AI 작업의 통제나 검증과 무관하다. 캐시 hit/miss 로깅이 있으나 애플리케이션 디버깅용이다.
- **관심 포인트**: -
- **확신도**: 높음

### laravel-security

- **한 줄 요약**: Laravel 앱의 인증, 인가, Eloquent, CSRF, XSS, API, 업로드, 배포 설정을 다루는 보안 코딩 지침.
- **설명**: Laravel 인증/인가 구성이나 보안 리뷰, 프로덕션 배포 때 참고한다. 프로덕션 설정(APP_DEBUG, HTTPS), Sanctum/Passport, Gate/Policy, mass assignment, SQL injection, CSRF, Blade XSS, 보안 헤더, 검증, rate limiting, CORS, 파일 업로드, composer audit, 큐 암호화를 PHP 예시로 보여준다. security 로그 채널과 SecurityLogger, 끝의 Quick Security Checklist 표도 포함한다.
- **분류**: 언어-코딩지침 / 보안
- **관련도**: Low
- **관련 축**: V, L
- **판단 근거**: 본문 대부분이 Laravel 전용 보안 코딩 패턴이다. 체크리스트 표와 `composer audit` CI, 보안 이벤트 감사 로그(SecurityLogger)가 약하게 검증·기록과 닿지만 AI 통제 메커니즘은 아니다.
- **관심 포인트**: -
- **확신도**: 높음

### orch-change-feature

- **한 줄 요약**: 동작 중인 기능의 동작을 바꿀 때 테스트를 새 명세로 먼저 수정한 뒤 구현하고 리뷰와 게이트 커밋까지 진행하는 오케스트레이션 래퍼.
- **설명**: 버그가 아닌 요구 변경("X 대신 Y")에 쓰며 공유 엔진 `orch-pipeline`의 얇은 래퍼다. 기본 크기는 small이고 phase mask는 0 → (필요 시 1) → light 2 → 4 → 5 → 6이다. 첫 동작(phase 4)은 기존 테스트를 새 동작에 맞게 고친 뒤 통과할 때까지 구현을 바꾸는 것이다. Gate 1(계획/변경된 테스트 승인)과 Gate 2(커밋 전)에서 멈추며, 보안 트리거가 있으면 security-reviewer를 추가한다. 형제 스킬(orch-fix-defect, orch-add-feature)과의 구분 기준도 명시한다.
- **분류**: 오케스트레이션
- **관련도**: High
- **관련 축**: F, V, I
- **판단 근거**: 단계 마스크, 두 개의 승인 게이트(Gate 1, Gate 2), 테스트 선행 변경, 리뷰와 조건부 security-reviewer가 본문 전체를 이룬다. 다만 엔진 본체는 orch-pipeline에 있고 이 스킬은 설정값만 정의하는 얇은 래퍼다.
- **관심 포인트**: "테스트를 먼저 바꾸는 것이 tweak와 fix를 가른다"는 규칙, 사람 승인 게이트를 계획/변경 테스트와 커밋 직전 두 곳에 두는 구조, 작업 유형별(변경/수정/추가) phase mask와 크기 하한으로 작업 흐름을 표준화하는 방식, 보안 트리거 시 리뷰어 추가. 상세 메커니즘은 orch-pipeline 확인 필요.
- **확신도**: 중간

### search-first

- **한 줄 요약**: 코드를 쓰기 전에 repo, npm/PyPI, MCP, 스킬, GitHub에서 기존 해결책을 찾아 adopt/extend/compose/build를 결정하는 리서치 선행 워크플로우.
- **설명**: 새 기능이나 의존성 추가, 유틸 작성 직전에 쓴다. Step 0 도구 가용성 preflight(어떤 검색 채널을 쓸 수 있는지 확인하고 건너뛴 채널을 정직하게 보고)부터 시작해 필요 분석, researcher 에이전트 병렬 검색, 후보 평가, 결정 매트릭스, 구현 순으로 진행한다. 간단한 건 Quick Mode(5문항 점검), 비자명한 건 Full Mode(에이전트 위임)를 쓴다. planner/architect 에이전트와 연계하고 "silent skipping", "jumping to code" 등을 안티패턴으로 둔다.
- **분류**: 워크플로우 / 사전 조사
- **관련도**: Medium
- **관련 축**: I, F
- **판단 근거**: 구현 전에 조사와 결정 단계를 강제해 AI의 작업 순서를 제약하는 지침이다. Step 0 preflight와 "검색 채널 불가 시 'nothing found'로 보고 금지" 규칙이 부분적으로 통제 장치지만 핵심은 재사용 우선 개발 습관이다.
- **관심 포인트**: 조사 채널 가용성 preflight와 건너뛴 채널을 숨기지 않고 보고하는 규칙(커버리지 과장 방지), adopt/extend/compose/build 결정표로 구현 전에 의사결정을 구조화, planner가 설계 전에 researcher를 호출하는 단계 삽입.
- **확신도**: 중간
