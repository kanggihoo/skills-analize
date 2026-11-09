# 과거 단순화 패턴

이 패턴들은 미사용 심볼 검색으로 가치가 확인되지 않은 후보를 보정하는 데 쓴다. 현재 제거 대상이 아니라 기록된 결정을 설명한다. 보관된 소스는 동결된 스냅샷이다. 인용된 노트 자체를 읽고, 그 노트의 외부 링크를 따라가거나 고치지 않는다. 패턴을 적용하기 전에 현재 소유자와 공개된 데이터의 의무를 확인한다.

## 완전한 효과 경로를 요구한다

선언, 직렬화 분기, 테스트는 실제로는 작동하지 않는 기능을 그럴듯하게 지지하는 것처럼 보일 수 있다. 양쪽 끝을 추적한다. 값을 만들어 내는 주체가 있어야 하고, 구현이 그 값을 존중해야 한다. [생산자 없는 variant 결정](../../../notes/archived/simplification/2026-07-04-prune-producerless-vocabulary-variants.md)은 emitter가 없는 예약된 union 구성원과 cache 힌트를 제거했다. [비활성 request knob 결정](../../../notes/archived/simplification/2026-07-04-drop-inert-request-knobs.md)은 모든 어댑터가 거부하는 knob과 hook에서 쓸 수 있는 작동하는 request 필드를 구분했다. 삭제에는 선언, forwarding, 거부만 확인하는 테스트, 생성된 문서가 포함되었다.

고정 호출자가 0개라는 것은 도달 불가능하다는 것보다 약한 증거다. [skill 등록 거부 결정](../../../notes/rejected/simplification/2026-07-12-prune-unused-skill-registry-api.md)은 의도된 third-party 등록 경로를 보존했다. 카탈로그화된 service라면, dead라고 판단하기 전에 일반적인 plugin 호출과 반환값을 확인한다. 작동하는 확장 지점과 어떤 provider도 이행할 수 없는 필드는 서로 다른 판정을 받아야 한다.

## 소비자가 결정하는 곳에서만 구분을 줄인다

공개된 모든 variant가 어떤 소비자 행동을 가능하게 하는지 대응시킨다. [archived 모델 agent 가용성 결정](../../../notes/archived/simplification/2026-09-15-model-agent-availability-and-team-targets.md)은 모델에 하나의 사용 가능한 Team target을 주고, 여러 residency 상태를 같은 가용성으로 투영했다. 내부 routing은 Session 정체성과 residency를 유지한다. [capability 중립 sandbox 컨텍스트](../../../notes/archived/simplification/2026-07-31-capability-neutral-sandbox-policy-context.md)는 두 개의 근사적 capability registry를 진실한 조건부 정책 문구로 대체했다. 정확한 도구 가용성은 도구 schema에 남는다. 이득에는 등록 메서드, disposal 상태, invalidation, 조합 테스트가 포함된다.

하나의 renderer가 무시한다고 해서 서로 다른 내구성 있는 사실을 지우지 않는다. [durable step-boundary 기각 결정](../../../notes/rejected/simplification/2026-06-20-drop-durable-step-boundaries.md)은 빈 실패 step, crash 복구, 검사에 필요한 명시적 시작과 완료 사실을 유지했다. 기저의 구분이 여전히 필요할 때만 투영을 단순화한다.

## 일반적인 동작을 더 작고 명시적인 약속과 맞바꾼다

사용 중인 기능이라도 필요한 결과를 만족시키는 데 비용이 많이 들 수 있다. [고정 주기 Schedule 결정](../../../notes/archived/simplification/2026-08-09-bounded-fixed-rate-schedule.md)은 달력 반복과 놓친 발생의 재생을 포기하고, parser, evaluator, 레코드 간 gate, durable variant, backlog 상태를 제거했다. [트랜잭션이 아닌 Loader 결정](../../../notes/implemented/simplification/2026-09-09-nontransactional-loader.md)은 자동 plugin 롤백을 포기했지만 실패 보고와 소비자 소유의 활성화 검사는 유지했다. 일반적인 롤백을 다른 패키지로 옮기면 그 비용이 그대로 남는다.

삭제만큼 손실도 분명히 적는다. [중단된 turn 절단 기각 결정](../../../notes/rejected/simplification/2026-06-20-truncate-interrupted-turns.md)은 더 단순한 복구 알고리즘을 거절했다. 완료되지 않은 turn에는 상당한 실제 작업이 들어 있을 수 있기 때문이다. 편의성, 더 작은 union, 더 적은 테스트만으로는 필요한 데이터나 동작의 손실을 정당화할 수 없다. 조사는 이러한 트레이드오프를 제안할 수 있지만, 그것을 구현해도 된다는 허가로 보지 않는다.

## 소비 작업에서 가정을 명시한다

공유 저장소, 동기화, 확인 기계를 얻은 로컬 기본값을 찾는다. [명시적 Schedule 시간대 결정](../../../notes/implemented/simplification/2026-08-09-explicit-schedule-time-zone.md)은 브라우저 사실을 원래 요청에 남기고, 스케줄링 작업에 명시적인 시간대를 요구했다. 그 결과 Session 기본값과 탭 간 충돌 상태를 제거했다. [archived 주입 콘텐츠 envelope 결정](../../../notes/archived/simplification/2026-07-20-unwrap-injected-content-envelopes.md)은 framing을 호출자에게 남기고, 관련 없는 계층을 거쳐 전달되던 envelope 제어를 제거했다. 두 결정 모두 하나의 가정을 해석해야 하는 소유자의 수를 줄인다.

강제해야 하는 쪽에서 요구사항을 옮기지 않는다. [archived Host 전용 Remote 입력 검증 결정](../../../notes/archived/simplification/2026-09-15-host-only-remote-input-validation.md)은 중복된 Client schema 실행을 제거하면서도, lookup과 비즈니스 호출 전에 Host 검증, 그리고 지역 arity와 Context 바인딩 검사를 유지했다. 문서화된 비용은 잘못된 입력의 실패가 뒤로 밀리는 것과, Client 파싱이 우연히 해주던 redaction을 잃는 것이다.

## 사용 시점이나 재사용 시점에 파생하거나 기존 전달 소유자를 쓴다

모든 cache나 이벤트 subscription에 대해, 소비자가 값을 언제 필요로 하는지, 그리고 권위 있는 소스가 이미 그것을 보존하고 있는지 묻는다. [피드백 telemetry 결정](../../../notes/archived/simplification/2026-08-06-buffer-free-feedback-telemetry.md)은 피드백 시점에 정식 Session prefix를 읽어, 지속적으로 복사되는 피드백 전 버퍼와 그 listener를 삭제했다. [archived Workspace 최근성 결정](../../../notes/archived/simplification/2026-09-10-derived-workspace-recency.md)은 승격 이력을 저장하는 대신 현재 요약을 정렬한다. 수동 정렬은 사용자의 독립 상태로 남는다. [archived Web subagent 투영 결정](../../../notes/archived/simplification/2026-09-08-web-subagent-catalog-projections.md)은 공유 스트림과 투영 저장소를 재사용해, 기능 알림, 반복 읽기, 두 번째 멤버십 cache를 제거했다.

이 방식이 성립하는지는 시간 약속에 달려 있다. 피드백 시점의 redaction은 캡처 시점의 redaction과 다르다. 수동 배치는 활동 타임스탬프에서 파생될 수 없다. 스트림 기준선이 없을 때는 초기 과거 읽기가 여전히 필요할 수 있다. 모든 cache가 중복이라고 선언하지 말고, 남는 의무를 명시한다.

## 우발적인 구성 소유자를 제거한다

이름(demo, support, example 등)을 믿기 전에, 실제 실행과 해석 경로를 확인한다. [공유 기본 설정 결정](../../../notes/archived/simplification/2026-07-29-shared-base-config-overlays.md)은 중복된 구성과 통과만 하는 설정을 제거했다. 실제 Loader 동작이 overlay의 위치를 결정한다. [소유자 로컬 profile과 가이드 결정](../../../notes/archived/simplification/2026-08-24-owner-local-profile-tests-and-guides.md)은 resolver 전용 workspace를 제거하고, 테스트, 가이드, 배포 자산을 각 소유자에게 배정했다. [병합된 subagent 서비스 결정](../../../notes/archived/simplification/2026-07-26-merge-subagent-control-service.md)은 provider나 형제 도구의 존재에서 배포 정책을 추론하는 대신 명시적인 배포 정책을 사용하며, 선택적 의존성은 내부적으로 유지했다.

패키지 수가 줄었다고 충분하지 않다. 서로 다른 호출자의 의도는 서로 다른 소유권과 완료 타이밍을 가질 수 있고, 유지되는 Service Definition은 독립된 provider들이 함께 쓸 수도 있다. 대체안의 실제 구성과 의존성 동작을 증명하고, 남은 모든 설정과 lifecycle 접착 코드를 계산에 넣는다.

## 기각된 실험으로 동등성 주장을 검증한다

[SSE parser 대체 결정](../../../notes/archived/simplification/2026-07-26-eventsource-parser-for-deepseek-sse.md)은 범용 framing과 그 conformance 테스트를 삭제하면서도, provider 전용 종료 shim을 유지하고 더 엄격한 잘린 tail 동작을 문서화했다. 반대로 [timer-promises 기각 결정](../../../notes/rejected/simplification/2026-07-26-builtin-timer-promises-for-hand-rolled-sleeps.md)은 이름상 동등해 보이는 내장 기능이, 작은 삭제를 위해 결정적인 fake-clock 테스트를 무력화했다고 기록했다. [의존성 교체 감사](../../../notes/rejected/simplification/2026-07-26-dependency-swaps-rejected-by-nih-audit.md)는 교체 가능한 범용 코드와, 라이브러리가 구현하지 않는 설정된 경계, 보안 규칙, lifecycle 소유권, 배포 동작을 구분했다.

과거의 기각은 범위가 정해진 반증 사례이지, 패키지의 영구적인 블랙리스트가 아니다. 기각의 전제를 다루는 새 증거가 있을 때만 다시 검토한다. 구현, 접착 코드, 테스트, 의존성, 지원되는 동작을 함께 측정한다.
