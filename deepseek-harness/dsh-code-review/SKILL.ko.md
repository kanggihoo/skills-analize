---
name: dsh-code-review
description: Use when reviewing a pull request in the deepseek-harness repo — 리뷰어가 이 코드베이스의 기준(AGENTS.md 규칙, 방어적 패턴, ADR, 품질 게이트)과 코드만으로는 드러나지 않는 리뷰 전용 점검 항목을 파악하도록 안내한다
---

# DeepSeek-Harness PR 리뷰하기

**이 스킬은 안내이지 완전한 체크리스트가 아니다.** PR의 현재 base와 정확한 head를 확인하고 가져온 뒤, diff를 읽기 전에 `pnpm --silent run change-scope --base <verified-base-ref> --head <verified-head-ref>`를 실행하고, 설계를 이해할 만큼 주변 코드를 충분히 읽는다. 보고서는 경로와 dirty 계층을 알려 줄 뿐 의미 기반 리뷰를 대신하지 않는다. retarget이나 merge가 일어나면 base를 다시 확인하고 명령을 다시 실행한다. 스타일보다 correctness, lifecycle, security, 필수 동작의 파손을 우선한다. 지적 사항 하나라도 근거가 확실한 blocker 하나가 여러 개의 사소한 nit 목록보다 낫다.

**diff를 판단하기 전에 요구사항을 먼저 읽는다.** 변경된 경로를 아래 기준 문서에 대응시키고, [Sources of truth](#sources-of-truth)에서 해당 문서를 각각 연 다음에 그 요구사항에 비추어 diff를 읽는다. 규칙을 기억에 의존해 판단하면 위반을 놓친다.

## Sources of truth

- [AGENTS.md](../../../AGENTS.md)와 [packages/AGENTS.md](../../../packages/AGENTS.md): 저장소와 패키지의 상시 작성 규칙이다.
- [docs/defensive-patterns/](../../../docs/defensive-patterns/README.md): 변경이 충족해야 하는 아키텍처 요구사항과 그 바탕이 되는 습관이다. 각 문서는 아티팩트 하나를 담당하므로 diff가 건드리는 문서는 모두 읽는다.
  - [general.md](../../../docs/defensive-patterns/general.md) — 타이밍, 비동기 상태, 값 표현, 공유 소유권, 분산화, 리팩터링, 마이그레이션, 성능 근거, disposal, callback, subprocess.
  - [package-surface.md](../../../docs/defensive-patterns/package-surface.md) — export, 패키지 형태, build face, 의존성 선언, resolve hook.
  - [remote-and-api.md](../../../docs/defensive-patterns/remote-and-api.md) — 원격 서비스, `@Remote` 메서드, API dispatch, `packages/api`의 비즈니스 소유권.
  - [client-components.md](../../../docs/defensive-patterns/client-components.md) — 클라이언트 컴포넌트, slot, store, hook, effect, 공유 base 패키지.
  - [conversation-and-session.md](../../../docs/defensive-patterns/conversation-and-session.md) — projection 읽기, Session 보존, conversation node, renderer.
- [docs/AGENTS.md](../../../docs/AGENTS.md): 문서의 위치와 산문 작성 원칙.
- [dsh-prose-standard](../dsh-prose-standard/SKILL.md): 주석, 문서, 프롬프트, 설명, 사용자에게 보이는 문자열에 요구되는 coverage와 편집 판단 기준.
- [dsh-ci-test-reliability](../dsh-ci-test-reliability/SKILL.md): 자원을 소유하거나 비동기이거나 flaky한 테스트와 fixture의 격리 및 회귀 방지 규칙.
- [dsh-client-ui-ux](../dsh-client-ui-ux/SKILL.md): 제품 사용자에게 보이는 GUI 변경에 대한 피드백 표면 선택, overlay 안전성, 플랫폼 창 대응, 시각 토큰 규율.
- [dsh-error-handling](../dsh-error-handling/SKILL.md): 실패 분류, 처리 소유권, 격리, 상태 보장, 실행 가능한 보고.
- [dsh-session-projection](../dsh-session-projection/SKILL.md): projection 소유권, 상태 크기, 과거 기록 읽기, 마이그레이션.
- [docs/testing.md](../../../docs/testing.md)와 [quality-gates reference](../../../docs/testing.md): 필수 테스트 계층과 게이트.
- [Agent Notes](../../notes/README.md): 설계 근거. Agent Note와 의견이 다르면 자동 거부가 아니라 설계 논의로 취급한다.
- 이중 언어 변경에는 [translation-rules.md](../../../docs/i18n/translation-rules.md)와 [terminology.md](../../../docs/i18n/terminology.md)를 읽는다. 확장 번역 스킬은 자동 리뷰 범위 밖이며 사용자가 명시적으로 호출할 때만 실행한다.

## 필수 요구사항 (blocking)

1. **새 산문은 의미 기반 리뷰를 받는다.** 추가되거나 바뀐 Markdown 문단, JSDoc, 주석, 프롬프트, 설명, diagnostic, 사용자에게 보이는 문자열 전부를 [dsh-prose-standard](../dsh-prose-standard/SKILL.md)로 비판적으로 검토한다. coverage, 정확성, 위치, 편집 품질을 담당 코드나 동작에 비추어 확인한다. 자동 검사는 이 속성들을 증명하지 못한다.
2. **문서는 코드와 일치한다.** 설정, 기본값, 오류, wire 필드, 이벤트, 공개 동작이 바뀌면 같은 diff에서 패키지 README와 JSDoc도 갱신한다. 주석은 자명하지 않은 계약을 말해야 한다. 구현 서술, 테스트 설명, 리뷰 이력, 중복된 근거는 삭제하거나 단일 출처로 링크하도록 지적한다.
3. **핵심 타입 문서가 맞아야 한다.** spine이나 seam 용어를 바꾸면 해당 [subsystems](../../../docs/subsystems/README.md) 페이지와 `type-equiv` 항목을 갱신한다. 내부 타입은 카탈로그 항목이 필요 없다.
4. **Cordis 소유권과 정리.** Cordis 플러그인 코드나 그 entrypoint에서 도달 가능한 helper를 리뷰할 때는 [cordis-styling-nitpicking](../cordis-styling-nitpicking/SKILL.md)을 읽고 변경된 동작과 영향받는 소비자에 적용한다. P0 규칙 세 가지인 singleton 상태, 되돌려지지 않은 effect, 소비자가 끝나기 전에 해제된 cleanup 의존성을 확인한다. 새 registry 기여마다 [packages/AGENTS.md](../../../packages/AGENTS.md)가 요구하는 disposal 테스트를 통과하는지 검증한다.
5. **필수 증거가 존재한다.** 작성자가 diff에 맞는 [relevant local checks](../../../AGENTS.md#run-relevant-checks-locally)를 실행했는지, CI가 전체 matrix를 다루는지 확인한다. 둘 다 발견하지 못하는 의미상의 공백은 직접 리뷰한다.
6. **클라이언트 UI 문구는 locale이 소유한다.** JSX, 템플릿, helper 반환값, 접근성 속성, primitive 기본값에 제품 문구가 직접 들어 있으면 거부한다. 타입이 지정된 dictionary key, 표준 `t` seat 또는 명시적 localized prop, `verify-client-ui-i18n`, 영향받는 각 locale의 동작 증거를 요구한다. 사용자, 모델, wire 데이터와 코드 토큰은 원문 그대로 보존한다.

## 수동 점검

- **의도와 인터페이스 계약:** 변경된 인터페이스의 양쪽을 모두 추적한다. 구현이 PR과 Agent Note에 맞는지 확인하되, 오류, 취소, 소유권, disposal까지 포함해서 본다.
- **오류 처리:** 변경된 실패 경로에는 [dsh-error-handling](../dsh-error-handling/SKILL.md)을 적용해 상태 보장과 최종 사용자 보고까지 검토한다. 상태 소유자가 복구 후에도 이후 작업의 전제 조건이 성립함을 확인하지 않았다면 catch 후 계속 진행하는 코드는 거부한다.
- **Lifecycle과 동시성:** 비동기 setup, callback, 프로세스, teardown에는 [defensive-patterns/general.md](../../../docs/defensive-patterns/general.md)를 적용한다. 게시 전 race, await 중 취소, 독립적인 오류 보고, callback 격리, 재진입 전 소유권 확보, 완전한 detach 정리, 정지 상태의 disposal을 확인한다.
- **범위, 소유권, 필요성:** 새로 생긴 구분, 필드, adapter, 상태 기계, 옵션, 방어적 복사, 호환성 경로마다 그 뒤에 있는 필수 동작을 먼저 식별한다. PR이 도입한 요구사항, 검사, Agent Note는 설계 선택으로 평가할 대상이지 필요성의 독립적인 증거가 아니다. 다른 표현을 받아들이기 전에 기존 source 필드, discriminant, 그 소비자를 비교한다. 개념을 삭제하는 것과 선언 위치를 옮기는 것을 구분한다. 불필요한 개념을 소유자 가까이 옮기는 것은 단순화가 아니다. 관련 없는 기능과 추측성 일반화는 [the root rules](../../../AGENTS.md#conventions)에 비추어 문제 삼는다.
- **기능과 소비자 적합성:** 현재 소비자를 모두 추적하고, [the package rules](../../../packages/AGENTS.md)에 따라 특정 소비자의 동작이 인터페이스로 새는지 지적한다. 필수 동작이라면 지역 구현이 복잡도를 거의 더하지 않을 때 생산자나 소비자 가까이에 있는 기존 확장 지점을 우선한다. 이때 [the ownership rule](../../../docs/defensive-patterns/general.md#a-business-capability-owns-itself)을 따른다. 생산자가 소유한 declaration merging과 멀리 있는 core나 공유 타입 선언 변경을 비교한다. 반대 방향도 지적한다. 레지스트리, 세션, 에이전트 같은 generic 서비스에 새 public 메서드를 추가했는데 호출자가 내부 소비자 하나뿐이라면 불필요한 API 확장이다. 이 경우 그 소비자에게 생성 시점에 private capability closure를 넘기도록 요구한다.
- **설정과 공개 선택지:** 다른 CLI나 설정의 pass-through를 받아들이기 전에 권위 있는 읽기 지점과 우선순위를 추적한다. 전달된 값이 사용 전에 가려질 수 있기 때문이다. 각 기본값, 공개 operation 집합, 포맷, 가져온 외부 개념에 현재 소비자의 증거나 선행 사례가 있는지 묻는다. 그 증거가 없으면 명시적 선택이나 연기를 요구한다.
- **모델 관점:** 영향받는 모든 모드에서 모델이 받는 정확한 프롬프트, tool schema, 결과, diagnostic을 검토한다. 모델의 작업 바깥에 있는 개념을 지적하고, 고정 텍스트는 원문 그대로 검증하며, 동적 동작은 snapshot이나 end-to-end 테스트로 확인한다.
- **Enforcement:** 거부 경로를 모두 따라가서 실제로 실행하는 operation까지 확인한다. schema, 프롬프트, facade, wrapper, listener 순서를 우회할 수 있는 직접 호출자와 대체 호출자를 모두 실행해 본다.
- **빌려온 상태와 파생 상태:** 보존되는 각 값이 패키지 계약상 borrowed인지 owned인지 판단한다. 그다음 알림과, 모든 cache, 프롬프트, UI echo, replay, query view를 문서화된 성공 지점과 권위 있는 원본까지 추적한다.
- **상한은 최종 operation을 덮어야 한다:** wrapper와 metadata를 포함해 방출되거나 보존되는 결과 전체의 소유자를 찾는다. byte 상한은 아주 작은 값과 정확히 맞는 값, 크기를 넘는 단일 chunk, 다중 바이트 텍스트로 검증한다.
- **실제 진입 경로:** 관련이 있으면 테스트가 배포되는 Loader, bin, worker, ACP bridge, subprocess를 실제로 실행하는지 확인한다. 수동으로 마운트한 plugin은 잘못된 Loader export를 잡지 못한다. function plugin은 namespace를 named export로 노출해야 하며 default export가 없어야 한다.
- **테스트 강도:** assertion은 의도한 회귀에서 실패해야 하고, 구현을 되풀이하지 않고 외부 상태, 로그, 이벤트, disposal을 검증해야 한다. 에이전트의 보고를 그대로 믿지 않는다. coverage는 필요하지만 시나리오가 옳다는 증거는 아니다.
- **테스트 신뢰성:** 자원을 소유하거나 비동기이거나 플랫폼에 민감하거나 flaky한 테스트에는 [dsh-ci-test-reliability](../dsh-ci-test-reliability/SKILL.md)를 적용해 실제 worker/job 구조, 자원 할당, 전역 상태 복원, 동기화, timeout 예산, 정지 상태의 teardown을 점검한다.
- **Negative control:** 변경된 수용 규칙마다 의도적으로 잘못된 케이스가 실제 runner에서 실패하는지 확인한다.
- **구현된 Agent Note와 실제 상태의 일치:** PR이 제안된 Agent Note를 구현했다면, 같은 diff에서 그 노트를 현재형의 구현된 상태로 옮기고 다시 쓴다. 그다음 경로, 이름, 메커니즘을 구현과 대조해 검증한다.
- **Transcript 변경:** 편집기나 모델에 보이는 변경은 snapshot을 갱신하거나 snapshot이 적용되지 않는 이유를 설명해야 한다. 기대 출력의 diff는 형식 잡음이 아니라 동작 변경으로 검토한다.
- **이중 언어 변경:** 양쪽의 의미와 용어를 비교한다. 쌍을 맞춘 hash가 통과했다고 번역 품질이 증명되지는 않는다.

## 발견 사항 보고

결함, 위치, 영향, 근거를 적는다. 위치가 국소적인 결함은 관련 diff 범위에 직접 단다. 여러 부분에 걸친 아키텍처, 범위, 리뷰 전체의 종합은 PR 수준 comment로 남긴다. blocker와 제안을 구분하고, 이미 green gate가 잡는 문제는 제외한다. 답변은 기존 GitHub review thread에 단다. 리뷰를 받을 때는 각 주장을 검증하고, 기술적 근거로 수정하거나 반박하며, 형식적으로 동의하지 않는다.
