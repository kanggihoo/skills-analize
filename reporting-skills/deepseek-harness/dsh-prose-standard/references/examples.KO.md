# 정제된 산문 예시

이 예시들은 문장 템플릿이 아니라 지배적인 원칙을 파악하는 데 쓰십시오. “균형 잡힌” 문장이란 모든 핵심 명제를 보존하면서, 해당 위치에 필요한 최소한의 설명만 담은 문장입니다.

## 사실 절을 모두 보존하기

**원문:** “The coordinator carefully serializes writes per session, flushes buffered events before disposal resolves, and reports backend failures to the caller.”

**과도하게 줄인 문장:** “The coordinator serializes persistence.”

**균형 잡힌 문장:** “The coordinator serializes writes per session, flushes buffered events before disposal resolves, and reports backend failures to the caller.”

장식과 반복은 제거하되 명제는 제거하지 마십시오. 행위자, 세션별 범위, disposal 순서, 실패 가시성은 각각 별개의 사실입니다.

## 명시된 스킬 범위는 기능이다

**과도하게 줄인 문장:** “Read the sources and use judgment.”

**균형 잡힌 문장:** “This skill is guidance, not a complete checklist. Use judgment beyond the named checks; documented requirements still apply.”

**과도하게 상세한 문장:** 목록이 독립적인 추론을 대체할 수 없는 이유를 설명하는 여러 단락.

명시된 한계는 유지하십시오. 에이전트가 워크플로를 적용하는 방식을 바꾸기 때문입니다. 반복되는 설득은 줄이되, 가드레일은 줄이지 마십시오.

## 쿡북은 실행과 검증을 함께 유지한다

**과도하게 줄인 문장:** “Add tests for the tool.”

**균형 잡힌 문장:** “Test registration and disposal at unit level, exercise the tool through the real loader path, and add a snapshot when its rendered output changes. Verify the assertion observes the external result rather than the model's report.”

**과도하게 상세한 문장:** 예제 코드에 이미 보이는 모든 픽스처 파일과 assertion을 하나씩 따라가는 설명.

테스트 계층, 필수 동작, 실제 진입 경로, 관찰 가능한 검증을 유지하십시오. 픽스처에 대한 서술은 제거하십시오.

## 소유권과 시점을 보존한다

**과도하게 줄인 문장:** “Provider work is cancelled during teardown.”

**균형 잡힌 문장:** “The runtime requests provider cancellation before releasing the child scope; the provider remains responsible for joining its workers before disposal resolves.”

**과도하게 상세한 문장:** teardown을 구현하는 모든 promise와 callback을 시간순으로 설명하는 글.

행위자, 순서, 소유권이 바뀌는 지점, 완료 보장은 각각 별개의 사실 절입니다.

## 이벤트 JSDoc은 경계 시점을 보존한다

**과도하게 줄인 문장:** “Composes and caches the session prefix.”

**균형 잡힌 문장:** “Composes the session prefix once before the first pre-step and model request. Listener appends join the current request, and pre-step pressure accounting receives the composed prefix.”

**과도하게 상세한 문장:** 이 순서를 구현하는 루프 헬퍼, 캐시 필드, promise callback을 따라가는 설명.

이벤트 순서와 그로 인해 현재 요청에 미치는 영향은 호출자가 관찰하는 동작이며, 구현에 대한 서술이 아닙니다.

## 복잡한 코드는 서술하지 않고 방향을 잡아 준다

**과도하게 줄인 문장:** “Worker realm support.”

**균형 잡힌 문장:** “Owns the worker realm and its host bridge. Realm initialization is single-shot; disposal terminates the worker and rejects later calls. See the worker-isolation Agent Note for the protocol rationale.”

**과도하게 상세한 문장:** 아래 클래스와 헬퍼 함수를 단락마다 미리 설명하는 글.

모듈의 역할, 의존성, 책임, 자명하지 않은 lifecycle 동작은 유지하십시오. 아키텍처 근거는 링크로 연결하고, 지역적인 제어 흐름은 코드가 보여 주도록 두십시오.

## 공개 JSDoc에는 실패 조건을 포함한다

**과도하게 줄인 문장:** “Returns the realm global.”

**균형 잡힌 문장:** “Returns the initialized realm global. Throws if initialization has not completed or the realm has already been disposed.”

**과도하게 상세한 문장:** 각 throw로 이어지는 내부 상태 기계의 분기와 정확한 헬퍼 호출.

throw와 상태 전제 조건은 호출자가 볼 수 있는 계약 사실입니다.

## 간결한 구현 대응표를 유지한다

**과도하게 줄인 문장:** “Search provider backed by an external API.”

**균형 잡힌 문장:** “Maps each provider result to the shared search-result fields, preserving the title, URL, and text while omitting provider-only ranking metadata.”

**과도하게 상세한 문장:** 매핑 코드를 필드별로 다시 적은 글. 이름이 같은 필드나 자명한 대입도 포함됨.

어댑터가 정보를 어디서 버리거나 바꾸는지 설명하는 매핑 세부사항은 유지하십시오.

## 근거는 링크하되 지역 계약은 유지한다

**과도하게 줄인 문장:** “Disposal is documented in the lifecycle Agent Note.”

**균형 잡힌 문장:** “Disposal aborts the run and waits for provider quiescence. See the lifecycle Agent Note for ownership and race handling.”

**과도하게 상세한 문장:** 모든 disposer 옆에 Agent Note의 promise 흐름과 기각된 소유권 모델을 반복해서 적는 글.

호출자가 필요로 하는 위치에 동작과 완료 보장을 남기십시오. 알고리즘과 근거는 적극적으로 링크하되, 링크가 지역 계약을 대신할 수는 없습니다.

## 구현이 끝난 Agent Note는 검증 계약을 유지한다

**과도하게 줄인 문장:** Agent Note가 이미 배포되었다는 이유로 Testing 섹션 전체를 삭제하는 것.

**균형 잡힌 문장:** “Unit tests cover cancellation before and after publication, disposal quiescence, and provider reload. A built-entry smoke covers the real loader path; snapshot coverage is deferred because the transport is process-specific.”

**과도하게 상세한 문장:** 추가적인 행동상의 차이가 없는 픽스처와 assertion을 파일별로 따라가는 설명.

마이그레이션 작업과 테스트 서술은 제거하십시오. 테스트 계층, 그 테스트가 고정하는 동작, 실제 진입 경로, 명시된 커버리지 공백은 유지하십시오.

## 보안 경계에는 구체적인 예시 하나가 필요할 수 있다

**과도하게 줄인 문장:** “Mounted plugins share the host's authority.”

**균형 잡힌 문장:** “Mounted plugins share the host's authority; for example, access to `ctx.shell` permits commands with the host executor's privileges.”

**과도하게 상세한 문장:** 플러그인이 악용할 수 있는 모든 서비스와 가상의 공격을 나열하는 목록.

추상적인 보안 한계를 운영상 분명하게 만드는 예시 하나는 유지하십시오.

## 추론 기록은 통째로 삭제한다

**과도하게 상세한 문장:** “First the loop checks whether the value is absent. If it is absent, the next branch returns early. Otherwise it continues, which is why the final assertion is safe.”

**균형 잡힌 문장:** 코드가 이미 그 분기를 표현하고 있다면 주석을 달지 마십시오. 조기 return이 자명하지 않은 불변식을 지킨다면, 그 불변식만 서술하십시오.

추론 기록을 더 짧은 서술로 압축하지 마십시오. 제거하십시오.

## 설정 주석은 트리가 보여 줄 수 없는 것을 설명한다

**과도하게 상세한 문장:** “This entry loads the local filesystem provider, followed by the policy plugin, followed by the read, write, and edit tools,” 인접한 항목들이 이미 그 순서를 보여 주고 있는데도 이렇게 적는 것.

**균형 잡힌 문장:** “Load policy before the model-facing tools so their write and edit calls pass through the read-before-mutation gate.”

순서가 가진 결과, 놀라운 범위 규칙, 보안 경계는 유지하십시오. 설정 자체가 항목 목록을 보여 주도록 두십시오.

## 단어 수만을 기준으로 줄이지 않는다

**현재:** “The adapter converts provider errors into the shared error type so callers can handle authentication, rate-limit, and transient failures uniformly.”

**더 짧지만 나쁜 문장:** “The adapter normalizes provider errors.”

**균형 잡힌 결정:** 링크나 주변 계약이 이미 실패 범주를 나열하고 있지 않다면 현재 문장을 유지하십시오. 더 짧은 버전은 구조를 개선하지 않으면서 결과와 구분을 잃습니다.

## 모델에 보이는 텍스트는 소유권을 따른다

**과도하게 줄인 문장:** “The tool returns errors when a call fails.”

**과도하게 상세한 문장:** 다른 패키지의 스키마와 렌더러 문자열을 이 백엔드의 README에 그대로 복사하는 것.

**균형 잡힌 문장:** 이 패키지가 소유한 안정적인 프롬프트, 결과, 오류 텍스트는 인용하십시오. 스키마는 생성된 도구 카탈로그에, 다른 패키지가 소유한 텍스트는 소비자 README에 링크하고, 이 패키지의 조건이나 차이만 지역적으로 서술하십시오.

모델에 도달하는 문구는 동작이지만, 중복은 시간이 지나면서 어긋납니다. 정확성은 소유자에게 두십시오.

산문만 검토하는 감사에서 의심스러운 문구를 찾았더라도, 그 문구를 소유하는 실행 가능한 스냅샷이 없다면 조용히 바꾸지 마십시오. 그대로 두고 보류를 보고하거나, 허용된 변경 범위를 소유자 시나리오와 필요한 GUI 증거까지 확장하십시오.

## 생성된 요약은 단독으로 읽혀야 한다

**과도하게 줄인 문장:** “Approval request and policy service.” 소유자는 정책 순서와 감사 로깅을 나중에 설명하지만, 카탈로그는 첫 문장만 내보냅니다.

**과도하게 상세한 문장:** 서비스의 전체 lifecycle과 프롬프트 공지 동작을 추출되는 문장 안으로 옮겨 넣는 것.

**균형 잡힌 문장:** “Approval service that applies session policy before answerers and logs every ask/outcome pair to the requesting session.” 카탈로그 밖의 세부사항은 뒤쪽 문장에 두십시오.

생성기가 무엇을 추출하는지 아십시오. 그 조각은 생성된 출력에서 필요한 계약을 보존해야 합니다.

## 한계는 기술 부채 목록이 아니라 계약이다

**과도하게 줄인 문장:** 설정을 바꾸면 플러그인 reload가 필요해지는 프로세스 수명 캐시를 빠뜨리는 것.

**과도하게 상세한 문장:** 호출자나 유지보수자에게 결과가 없는 private 헬퍼 정리 작업과 사용되지 않는 테스트 전용 accessor를 나열하는 것.

**균형 잡힌 문장:** “Provider selection is cached for the plugin lifetime; installing or repairing a provider requires reload.” 일반적인 정리 작업은 TODO나 Agent Note에 두십시오.

사용이나 안전한 유지보수에 영향을 주는 공백과 자명하지 않은 제약은 유지하십시오. 패키지 README는 백로그를 쏟아 놓는 곳이 아닙니다.
