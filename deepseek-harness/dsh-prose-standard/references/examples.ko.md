# 정제된 문장 예시

이 예시들은 문장 템플릿이 아니라, 그 밑에 있는 원칙을 찾아내는 데 쓴다. "균형 잡힘"은 주장 하나하나를 빠짐없이 남기되, 그 위치에서 꼭 필요한 설명만 붙인다는 뜻이다.

## 사실 절은 모두 남긴다

**원문:** "The coordinator carefully serializes writes per session, flushes buffered events before disposal resolves, and reports backend failures to the caller."

**과도한 축약:** "The coordinator serializes persistence."

**균형 잡힌 예:** "The coordinator serializes writes per session, flushes buffered events before disposal resolves, and reports backend failures to the caller."

장식과 반복은 덜어내되 명제는 덜어내지 않는다. 행위 주체, 세션별 범위, disposal 순서, 실패 가시성은 서로 다른 사실이다.

## 명시된 스킬 범위는 기능이다

**과도한 축약:** "Read the sources and use judgment."

**균형 잡힌 예:** "This skill is guidance, not a complete checklist. Use judgment beyond the named checks; documented requirements still apply."

**과도한 상세:** 목록이 독립적인 판단을 대신할 수 없는 이유를 여러 문단에 걸쳐 변호하는 경우.

이 명시적 한계는 에이전트가 워크플로를 적용하는 방식을 바꾸므로 남긴다. 반복되는 설득 문장은 줄이되, 가드레일은 줄이지 않는다.

## 쿡북에는 행동과 검증을 함께 남긴다

**과도한 축약:** "Add tests for the tool."

**균형 잡힌 예:** "Test registration and disposal at unit level, exercise the tool through the real loader path, and add a snapshot when its rendered output changes. Verify the assertion observes the external result rather than the model's report."

**과도한 상세:** 예시 코드에 이미 보이는 fixture 파일과 assertion을 하나씩 따라가는 설명.

테스트 계층, 필요한 행동, 실제 진입 경로, 관찰 가능한 검증을 남긴다. fixture 설명은 지운다.

## 소유권과 타이밍을 보존한다

**과도한 축약:** "Provider work is cancelled during teardown."

**균형 잡힌 예:** "The runtime requests provider cancellation before releasing the child scope; the provider remains responsible for joining its workers before disposal resolves."

**과도한 상세:** teardown을 구현하는 모든 promise와 callback을 시간순으로 적는 설명.

행위 주체, 순서, 소유권이 바뀌는 지점, 완료 보장은 각각 별개의 사실 절이다.

## 이벤트 JSDoc은 경계 타이밍을 보존한다

**과도한 축약:** "Composes and caches the session prefix."

**균형 잡힌 예:** "Composes the session prefix once before the first pre-step and model request. Listener appends join the current request, and pre-step pressure accounting receives the composed prefix."

**과도한 상세:** 순서를 구현하는 loop helper, cache 필드, promise callback을 하나씩 설명하는 경우.

이벤트 순서와 그것이 현재 요청에 미치는 영향은 호출자에게 보이는 동작이지, 구현 설명이 아니다.

## 복잡한 코드는 해설하지 않고 방향만 잡아 준다

**과도한 축약:** "Worker realm support."

**균형 잡힌 예:** "Owns the worker realm and its host bridge. Realm initialization is single-shot; disposal terminates the worker and rejects later calls. See the worker-isolation Agent Note for the protocol rationale."

**과도한 상세:** 아래 클래스와 helper 함수를 문단마다 미리 훑는 설명.

모듈의 역할, 의존성, 책임, 명확하지 않은 lifecycle 동작은 남긴다. 아키텍처의 근거는 링크로 돌리고, 지역 제어 흐름은 코드가 보여 주게 둔다.

## 공개 JSDoc에는 실패 조건을 포함한다

**과도한 축약:** "Returns the realm global."

**균형 잡힌 예:** "Returns the initialized realm global. Throws if initialization has not completed or the realm has already been disposed."

**과도한 상세:** 각 throw로 이어지는 내부 상태 기계의 분기와 정확한 helper 호출.

throw와 상태 전제 조건은 호출자에게 보이는 계약 사실이다.

## 구현 매핑은 간결하게 유지한다

**과도한 축약:** "Search provider backed by an external API."

**균형 잡힌 예:** "Maps each provider result to the shared search-result fields, preserving the title, URL, and text while omitting provider-only ranking metadata."

**과도한 상세:** 매핑 코드를 필드별로 다시 적는 설명. 이름이 같은 필드와 자명한 대입까지 포함한다.

어댑터가 정보를 어디서 버리거나 바꾸는지 설명하는 매핑 세부사항은 남긴다.

## 근거는 링크하되 지역 계약은 남긴다

**과도한 축약:** "Disposal is documented in the lifecycle Agent Note."

**균형 잡힌 예:** "Disposal aborts the run and waits for provider quiescence. See the lifecycle Agent Note for ownership and race handling."

**과도한 상세:** Agent Note의 promise 흐름과 기각된 소유권 모델을 disposer마다 반복하는 경우.

호출자에게 필요한 동작과 완료 보장은 해당 위치에 남긴다. 알고리즘과 근거는 적극적으로 링크하되, 링크가 지역 계약을 대신할 수는 없다.

## 구현된 Agent Note는 검증 계약을 유지한다

**과도한 축약:** Agent Note가 이미 구현되었다는 이유로 Testing 섹션 전체를 삭제하는 경우.

**균형 잡힌 예:** "Unit tests cover cancellation before and after publication, disposal quiescence, and provider reload. A built-entry smoke covers the real loader path; snapshot coverage is deferred because the transport is process-specific."

**과도한 상세:** 추가 행동 차이가 없는 fixture와 assertion을 파일별로 설명하는 경우.

마이그레이션 작업과 테스트 설명은 지운다. 테스트 계층, 그들이 고정하는 동작, 실제 진입 경로, 명명된 커버리지 공백은 남긴다.

## 보안 경계에는 구체적인 예시 하나가 필요할 수 있다

**과도한 축약:** "Mounted plugins share the host's authority."

**균형 잡힌 예:** "Mounted plugins share the host's authority; for example, access to `ctx.shell` permits commands with the host executor's privileges."

**과도한 상세:** 플러그인이 악용할 수 있는 모든 서비스와 가상의 exploit 목록.

추상적인 보안 한계가 운영상 분명해지는 예시 하나는 남긴다.

## 추론 기록은 통째로 삭제한다

**과도한 상세:** "First the loop checks whether the value is absent. If it is absent, the next branch returns early. Otherwise it continues, which is why the final assertion is safe."

**균형 잡힌 예:** 코드가 이미 그 분기를 드러내고 있다면 주석을 달지 않는다. 이른 return이 명확하지 않은 invariant를 보호한다면, 그 invariant만 적는다.

추론 기록을 더 짧은 해설로 압축하지 않는다. 지운다.

## 설정 주석은 트리가 드러내지 못하는 것을 설명한다

**과도한 상세:** "This entry loads the local filesystem provider, followed by the policy plugin, followed by the read, write, and edit tools," 인접한 항목이 이미 같은 순서를 보여 주는 경우.

**균형 잡힌 예:** "Load policy before the model-facing tools so their write and edit calls pass through the read-before-mutation gate."

순서가 가져오는 결과, 놀라운 범위 규칙, 보안 경계는 남긴다. 목록 자체는 설정이 스스로 보여 주게 한다.

## 단어 수만 줄이려고 다듬지 않는다

**현재:** "The adapter converts provider errors into the shared error type so callers can handle authentication, rate-limit, and transient failures uniformly."

**더 짧지만 나쁜 예:** "The adapter normalizes provider errors."

**균형 잡힌 판단:** 링크나 주변 계약이 이미 실패 범주를 나열하지 않는 한 현재 문장을 유지한다. 짧은 버전은 구조를 개선하지 않으면서 결과와 구분을 잃는다.

## 모델에 보이는 텍스트는 소유자를 따른다

**과도한 축약:** "The tool returns errors when a call fails."

**과도한 상세:** 다른 패키지의 schema와 renderer 문자열을 이 백엔드 README에 그대로 복사하는 경우.

**균형 잡힌 예:** 이 패키지가 소유한 안정적인 prompt, result, error 텍스트는 인용한다. schema는 생성된 tool catalog에, 다른 패키지가 소유한 텍스트는 소비자 README에 링크한다. 이 패키지의 조건이나 차이만 지역적으로 적는다.

모델에 도달하는 문구는 동작이지만, 중복은 여전히 어긋난다. 정확성은 소유자 쪽에 둔다.

산문만 감사하는 작업은 의심스러운 문구를 식별할 수 있지만, 그 문구를 소유하는 실행 가능한 snapshot이 없다면 조용히 바꾸지 않는다. 그대로 두고 보류를 보고하거나, 승인된 변경 범위를 소유자 시나리오와 필요한 GUI 증거까지 넓힌다.

## 생성되는 요약은 단독으로 읽혀야 한다

**과도한 축약:** "Approval request and policy service." 소유자는 정책 순서와 감사 로그를 뒤에서 설명하지만, 카탈로그는 첫 문장만 내보낸다.

**과도한 상세:** 서비스의 전체 lifecycle과 prompt 고지 동작을 추출되는 문장에 옮겨 담는 경우.

**균형 잡힌 예:** "Approval service that applies session policy before answerers and logs every ask/outcome pair to the requesting session." 카탈로그 밖의 세부사항은 뒤쪽 문장에 남긴다.

생성기가 무엇을 추출하는지 알아야 한다. 그 조각은 생성된 출력에서 필요한 계약을 보존해야 한다.

## 한계는 기술 부채 목록이 아니라 계약이다

**과도한 축약:** 설정 변경 시 plugin reload가 필요하게 만드는 process 수명 cache를 빠뜨리는 경우.

**과도한 상세:** 호출자나 유지보수자에게 결과가 없는 private helper 정리 작업과 미사용 test 전용 accessor를 나열하는 경우.

**균형 잡힌 예:** "Provider selection is cached for the plugin lifetime; installing or repairing a provider requires reload."

사용이나 안전한 유지보수에 영향을 주는 공백과 명확하지 않은 제약은 남긴다. 일반 정리 작업은 TODO나 Agent Note에 둔다. 패키지 README는 백로그 덤프가 아니다.
