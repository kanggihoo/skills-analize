---
name: dsh-find-simplifications
description: DeepSeek Harness의 코드, API, 설정, 테스트, 산문에서 근거에 기반한 단순화를 찾고, 제안을 작성하거나 통합하고, 작은 inline 정리를 식별하거나, 다른 브랜치의 단순화를 평가한다. Use for removing dead, duplicated, speculative, or unnecessarily maintained behavior and infrastructure.
---

# DeepSeek Harness 단순화 찾기

유지보수 의무를 없애는 변경을 찾는다. 대상은 API, 표현 방식, lifecycle 상태, 설정 경로, 의존성, 테스트, 문서다. 삭제 건수를 채우기보다 근거가 충분한 후보 몇 개를 우선한다. 이 문서는 안내이지 체크리스트가 아니다. 사용자의 범위를 지키고, 조사(survey)와 그 제안을 구현해도 된다는 허가를 구분한다.

## 범위와 제약 확인

패키지를 판단하기 전에 `AGENTS.md`, [architecture](../../../docs/architecture.md), [defensive patterns](../../../docs/defensive-patterns/README.md), [testing policy](../../../docs/testing.md)를 읽는다. 의도된 결정은 관련 활성 Agent Note에서 확인하고, 새 기록은 [note rules](../../notes/README.md)에 따라 작성한다. 보관된(archived) 노트는 과거 사례일 뿐 현재의 권위가 아니다. 그 노트의 외부 링크를 검사, 확인, 수정하지 않는다.

두 LLM adapter는 의도된 설계다. JSONL은 유일한 first-party Session 영속화 provider이고, backend에 중립적인 Service Definition은 저장소 밖의 provider를 지원한다. 사용자가 이 제약을 명시적으로 뒤집지 않는 한 LLM twin이나 영속화 seam을 삭제하자고 제안하지 않는다. 보호된 설계 안에 있는 미사용 멤버는 그 목적을 해치지 않고 제거할 수 있을 때만 후보가 된다.

넓은 요청이면 독립된 영역을 하위 agent에게 나눠 맡긴다. 영역은 loop와 영속화, 모델과 tool 조립, Host, Client, SDK, subprocess와 실행 provider, composition, 스크립트, 테스트, 문서다. 각 agent에게 범위를 제한하고, 소비자 증거와 기각한 대안을 함께 보고하게 한다. 눈에 띄는 미사용 심볼만 보지 말고 상당한 규모의 production 기계 장치도 검사한다. 첫 번째 삭제 후보에서 멈추지 않는다.

## 제거 가능한 의무 찾기

아래 질문으로 탐색 방향을 잡는다. 검토 중인 코드가 도입한 요구사항, 검사, Agent Note는 설계 선택으로 평가할 대상이지 그 구분이 필요하다는 독립적인 증거가 아니다. 후보를 보정해야 할 때는 [historical patterns](references/historical-patterns.md)의 관련 절을 읽는다. 그 예시는 결정을 보여 줄 뿐 현재의 삭제 목록이 아니다.

- **선언된 기능에 완전한 효과 경로가 있는가?** producer, 변환, provider나 endpoint의 지원, 관찰 가능한 결과까지 추적한다. 모든 곳에서 복사되지만 setter도 reader도 없거나 구현체가 모두 거부하는 필드가 있을 수 있다. CLI와 설정의 pass-through라면 권위 있는 읽기 지점과 우선순위를 따라가서, 사용 전에 가려져 버리는 전달 값을 찾는다. 호출자뿐 아니라 생성자와 discriminant emitter도 검색한다.
- **어떤 구분이 소비자의 행동을 바꾸는가?** 먼저 그 구분, 필드, adapter가 애초에 필요한지 묻는다. transport 전용 표지를 추가하기 전에 기존 source 필드와 discriminant가 어떤 emitter에서 나오고 어떤 권한이나 capability 검사에 쓰이는지 추적한다. 넓은 envelope 범주가 source 필드와 같은 의미를 가질 필요는 없다. 구분을 삭제하는 것과 그 선언 위치를 옮기는 것을 따로 고려하고, 각 대안이 어떤 입력이나 capability를 허용하는지 밝힌다. 여러 내부 상태가 모델에게 보이는 하나의 상태나 쓸 수 있는 식별자 하나로 귀결될 수도 있다. 필수적인 권한, 거주(residency), 내구성, 소유권 동작은 보존한다. 쓸모없는 선택지만 부추기는 공개 구분은 제거한다.
- **더 작은 명시적 동작으로 하위 시스템을 없앨 수 있는가?** 고정 간격, 호출자가 넘기는 시간대, 보고된 활성화 실패로 일반화된 캘린더, 영속화된 기본값, 자동 롤백을 없앨 수 있다. 포기하는 capability와 삭제되는 기계 장치를 함께 적는다. 실제 호출자가 있는지는 동작에 대한 결정이지 자동 거부 사유가 아니다. 구현은 사용자가 허락한 범위 안에서 해야 한다.
- **소비자가 필요할 때 권위 있는 값을 읽을 수 있는가?** 복사된 이력, 승격 원장, 무효화 이벤트 뒤에 이어지는 읽기, 공유 projection 스트림 옆의 feature cache를 찾는다. 파생이나 재사용으로 구독, 보존 데이터, stale 응답 처리, 복구 경로가 함께 사라질 수 있다. 먼저 필요한 관찰 시점을 확정한다.
- **구성을 정책으로 착각하고 있지 않은가?** 선택적 서비스의 존재, provider 메서드, 형제 tool은 배포 동작을 결정하지 않고도 가용성을 나타낼 수 있다. 명시적 설정이나 호출자 의도를 드러내는 operation이 있으면 registry와 의존성 검사가 필요 없어질 수 있다. 소유권이나 완료 시점이 다르면 서로 다른 operation을 유지한다.
- **유지보수 비용 전체를 누가 지는가?** 중복된 application tree, 제품이 쓰는 데모 launcher, resolver 전용 workspace, 자체 업그레이드 주기를 가진 설치 helper를 추적한다. 필수 동작이라면 declaration merging을 포함해 기존 생산자/소비자 확장 지점을, [the ownership rule](../../../docs/defensive-patterns/general.md#a-business-capability-owns-itself)에 따라 멀리 있는 core나 공유 타입 선언 변경과 비교한다. 제거되는 전체 시스템과 대체 구현을 남는 glue까지 포함해 비교한다. 불필요한 개념을 소유자 가까이 옮기거나 중복 정의가 같은지 확인하는 게이트를 추가하는 것은 유지보수 비용을 없애지 못한다.

## 도달 가능성과 트레이드오프 증명

`rg`로 시작하고 결과를 직접 읽는다. 정확한 심볼, 속성 읽기와 쓰기, discriminant, 이벤트와 wire 문자열, 설정 키, 패키지 이름을 검색하고 `.method(` 형태와 `method(` 형태를 모두 찾는다. 테스트와 선언은 계약을 보여 줄 수 있어도 production provider나 소비자가 실제로 있음을 증명하지는 못한다.

검색 범위에는 `packages/*/*/src`, `apps/`, `python/`, 런타임 스크립트, 배포되는 profile과 overlay, 패키지 manifest와 export, loader resolution, 생성된 런타임 자산, 설치된 패키지의 소비자를 포함한다. 예제와 fixture는 디렉터리 이름이 아니라 실제 진입 경로로 분류한다. 생성된 카탈로그는 소비자까지 따라간다. 모델이 작성한 plugin mount가 사용하는 카탈로그는 동적 제품 API이고, 문서에만 나오는 목록은 고정된 호출자가 아니다. 저장소 안에 호출 지점이 없어도 공개된 제3자 extension 경로는 의도된 것일 수 있다. 정적 미사용 코드 검사기는 manifest 기반 로딩, 생성된 출력, 컴파일러 face를 다루어야 하며, 워크스페이스마다 예외 목록을 따로 관리하지 않는다.

각 후보에 대해 현재 소유자, 실제 생산자/소비자 경로, 사라지는 것, 남는 것, capability와 호환성 영향, 그것을 유지해야 하는 가장 강한 이유를 기록한다. 다음을 구분한다.

- 도달 불가능하거나 읽히지 않는 동작의 제거;
- 명시적 손실을 동반한 더 좁은 공개 동작 또는 제품 동작;
- 보호되는 의무 또는 증거 부족.

후보가 남아 있는 의무를 깨거나, 같은 복잡도를 다른 곳으로 옮기기만 하거나, 의미 있는 감소가 없으면 기각한다. 기각 사유는 제안된 변경의 단위에서 읽는다. 오래된 목록이나 섞인 제안에서 기각된 동작이 독립적인 항목 전체를 결정하지는 않는다. 다시 제안하기 전에 증거를 새로 확인한다. 작은 지역적 개선은 독립된 설계 기록이 아니라 [urgency rules](../../../docs/development.md)에 따른 실행 가능한 `TODO`/`FIXME`/`XXX` 주석으로 남긴다.

## 소유권과 실패 의미 보존

복사, freeze, validator, callback 캡처마다 값의 출처, 다음 소유자, 신뢰 경계를 밝힌다. 타입이 지정된 같은 프로세스 내 호출은 보통 readonly 값을 빌린다. parser, 설정 loader, 큐, 모델과 tool의 JSON, 영속 파일, worker, 프로세스, wire decoder는 입력을 소유하거나 검증한다. hostile getter나 callback 교체를 시험하는 테스트만으로는 요구사항이 증명되지 않는다. root가 frozen이라고 해서 하위 객체까지 불변인 것은 아니며, 같은 id가 같은 객체를 뜻하지도 않는다.

비동기 기계 장치는 각 promise, flag, 취소 경로, disposer, reservation을 소유자와 상태 전이에 대응시킨다. 같은 사실을 표현할 때만 여러 메커니즘을 합친다. 동기적 게시와 롤백, callback 격리, 첫 번째 종료 결과의 중재, worker/process 소유권, 필요한 곳의 quiescent 상태까지 disposal하는 동작은 보존한다. 내구성 있는 시작/종료 표지는 transcript renderer가 무시하더라도 실제 사실을 기록한 것일 수 있다. 중단된 작업을 버리는 것은 중복 로그를 정리한 것이 아니라 capability의 손실이다.

## 순 감소가 있을 때만 인프라를 교체한다

[dependency policy](../../notes/implemented/process/2026-07-26-dependencies-over-hand-rolling.md)를 따른다. 패키지를 추가하기 전에 기존 의존성과 엔진 기준선의 Node builtin을 검색한다. 교체로 삭제되는 정확한 구현과 전용 테스트, 그 유지보수와 전이 비용, glue가 보존해야 하는 모든 잔여 동작을 밝힌다.

교체가 실패하기 쉬운 불일치를 실제로 확인한다. 프로토콜 truncation, 취소와 teardown, 설정된 상한, 결정론적 테스트 clock, 플랫폼 패키징, source와 built entry point의 차이가 그것이다. framing은 처리하지만 크기 제한을 강제하려면 같은 framing을 다시 만들어야 하는 라이브러리는 단순화가 아니다. 허용한 edge 동작의 변경은 제안과 관련 테스트에 적는다. 의존성의 일반 명세를 다시 증명하면서 harness 전용 shim의 테스트는 빠뜨리지 않는다.

## 기록, 통합, 검증

산문이 범위에 있으면 [dsh-prose-standard](../dsh-prose-standard/SKILL.md)를 쓴다. 코드를 그대로 되풀이하거나 원격에서 소유한 설명은 제거하되, 지역 동작, 타이밍, 소유권, 실패 의무는 남긴다. 영향받는 README, JSDoc, 모델에 보이는 카탈로그, 설정, snapshot, 생성된 파일은 소유 변경과 함께 갱신한다.

상당한 규모의 제안은 필수 노트 골격을 쓴다: `Problem`, `Proposal`, `Alternatives considered`, `Acceptance criteria`, `Risks`. 구체적인 소비자 증거, 제거되는 유지보수 비용, 포기하는 capability, 관찰 가능한 수용 조건을 포함한다. 이미 구현된 결정은 [implemented format](../../notes/README.md#the-body-skeleton)을 쓴다. 결정이 같다면 기존 소유자를 갱신하고, 후보 수를 유지하려고 중복 노트를 만들지 않는다.

새 노트마다 [dsh-archive-agent-notes](../dsh-archive-agent-notes/SKILL.md)를 통해 범위가 정해진 supersession 검사를 해야 한다. 보존, 통합, triplet 삭제, 고정된 archive 절차는 그 워크플로가 담당한다. 코드 조사가 저장소 전체 노트 감사를 뜻하지는 않는다. 부분적 supersession, 현재 살아 있는 내구성, wire, 호환성, 기각된 대안의 의무는 보존한다.

다른 브랜치를 가져와 합칠 때는 그 독립된 diff를 대상 base와 비교한다. 지원되고 겹치지 않는 제안만 옮기고, 겹치는 근거는 하나로 통합한다. 다른 PR을 닫으려면 허락이나 그 정리 작업에 대한 명확한 소유권이 필요하다.

docs-only Agent Note 작업이면 `pnpm run doc-sync`, `pnpm run lint`, `git diff --check`를 실행한다. skill이나 주석을 고쳤다면 해당 validator도 실행한다. 다른 검사는 [dsh-pre-push-checks](../dsh-pre-push-checks/SKILL.md)로 고른다. 보고에는 조사한 영역, 지원되는 후보, 의미 있는 기각이나 연기, 추가·통합·유지·삭제한 노트, 실제로 실행한 명령을 적는다. 조사가 진행 중이면 draft PR을 쓰고, 검증하지 않은 검색을 완전한 조사라고 설명하지 않는다.
