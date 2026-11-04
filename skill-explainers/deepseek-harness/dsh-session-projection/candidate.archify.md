# dsh-session-projection 스킬은 에이전트를 어떻게 바꾸나 {#dsh-session-projection-skill}

`dsh-session-projection`을 쓰면 에이전트는 세션에서 복구해야 할 사실을 모두 프로젝션(Projection)에 둔다. 그리고 읽기는 그 상태를 가진 서비스의 도메인 메서드로만 열어 준다. 프로젝션 정의나 핸들은 프로덕션 읽기 API로 내보내지 않는다.[](source:sp-sum)[](source:sp-r1)[](source:sp-r2) 이 스킬의 열 가지 규칙은 프로젝션을 만들거나 늘리거나 옮기거나 리뷰할 때 쓴다.[](source:sp-fm)

- `init`과 `apply`는 동기 함수이고 결정적이다. 이 함수들은 I/O를 하지 않고, Cordis 훅·모델·도구를 부르지 않는다.[](source:sp-r3)
- 상태는 고정 크기나 선형보다 느리게 느는(sublinear) 쪽으로 둔다. 이벤트 기록 크기만큼 자라는 색인을 습관으로 들고 있지 않는다.[](source:sp-r5)
- 에이전트는 필요한 등록이 끝난 뒤에만 동기 리더를 열고, 과거 복구가 끝난 뒤에만 세션을 동기 리더에 게시한다.[](source:sp-r7)[](source:sp-r8)
- 읽기 경로를 바꾸기 전에, 에이전트는 공식 소비자(플러그인, CLI/GUI, SDK 두 개)를 모두 찾는다. 동기 호출자는 명시적으로 옮길 때까지 유지한다.[](source:sp-r9)

@answer scope="deepseek-harness/dsh-session-projection · 원본 텍스트 파일 1개 · 커밋 475505c · 지시상 동작"
@meta locale=ko
@source sp-fm title="deepseek-harness/dsh-session-projection/SKILL.md · 5476B · frontmatter" path=deepseek-harness/dsh-session-projection/SKILL.md lines=1:4
@source sp-sum title="SKILL.md · Summary" path=deepseek-harness/dsh-session-projection/SKILL.md lines=10:10
@source sp-r1 title="SKILL.md · 규칙 1 상태를 프로젝션에 둔다" path=deepseek-harness/dsh-session-projection/SKILL.md lines=12:12
@source sp-r2 title="SKILL.md · 규칙 2 핸들은 비공개" path=deepseek-harness/dsh-session-projection/SKILL.md lines=14:16
@source sp-r3 title="SKILL.md · 규칙 3 init/apply 동기·결정적" path=deepseek-harness/dsh-session-projection/SKILL.md lines=18:18
@source sp-r4 title="SKILL.md · 규칙 4 JSON 상태와 버전" path=deepseek-harness/dsh-session-projection/SKILL.md lines=20:20
@source sp-r5 title="SKILL.md · 규칙 5 상태 크기" path=deepseek-harness/dsh-session-projection/SKILL.md lines=22:22
@source sp-r6 title="SKILL.md · 규칙 6 캐시" path=deepseek-harness/dsh-session-projection/SKILL.md lines=24:24
@source sp-r7 title="SKILL.md · 규칙 7 등록을 기다린 뒤 리더를 연다" path=deepseek-harness/dsh-session-projection/SKILL.md lines=26:26
@source sp-r8 title="SKILL.md · 규칙 8 등록 준비와 세션 복구 분리" path=deepseek-harness/dsh-session-projection/SKILL.md lines=28:28
@source sp-r9 title="SKILL.md · 규칙 9 소비자 확인" path=deepseek-harness/dsh-session-projection/SKILL.md lines=30:30
@source sp-r10 title="SKILL.md · 규칙 10 검증" path=deepseek-harness/dsh-session-projection/SKILL.md lines=32:32
@source rel-sp title="relations.md · r05" path=skill-explainers/deepseek-harness/relations.md lines=48:48

## 언제 켜지나 {#trigger}

@code source=sp-fm language=yaml

`description`은 프로젝션을 만들거나, 늘리거나, 리뷰할 때, 그리고 세션에서 파생된 복구 상태를 프로젝션으로 옮길 때 쓰라고 한다.[](source:sp-fm) 호출을 막는 필드(`disable-model-invocation` 등)는 원문에 명시 없음. `description`은 모델이 스킬을 쓸지 판단할 때 참고하는 설명이다.

프로젝션의 준비·등록·읽기·정리 계약은 `packages/session/session-projection/README.md`가 정한다고 원문이 가리킨다.[](source:sp-sum) 이 파일은 이 저장소에 없어서 확인하지 못했다.

## 상태는 어디에 두고 어떻게 읽게 하나 {#design}

규칙 1~6은 "무엇을 어디에 두고, 얼마나 키우고, 어떻게 읽게 하나"를 정한다.

| 규칙 | 요구 | 원문의 강도 |
| --- | --- | --- |
| 1 | 저장하거나 복원하는 세션 파생 상태는 호스트 전용이라도 모두 프로젝션에 둔다. 맞는 기존 소유자가 있으면 재사용한다. 외부 자원과 프로세스 범위 소유는 저장 상태 밖에 둔다. 등록 핸들, 프라미스, 런타임 자원이 아니라 사실을 저장한다[](source:sp-r1) | 의무 |
| 2 | 프로젝션 정의나 핸들을 프로덕션 읽기 API로 내보내지 않는다. 준비된 핸들은 비공개로 두고, 소비자는 소유 서비스의 도메인 메서드를 쓴다. 핸들은 활성화 때마다 다시 만드는 프로세스 지역 리더다. 서비스가 `sessionProjections`에 의존하면 그것을 필수로 요구하고, 선택 등록은 선택 기여에만 쓴다. 필수 의존이 없는 것을 다른 복구 경로로 감추지 않는다[](source:sp-r2) | 금지·의무 |
| 2(이어서) | 런타임이 프로젝션 상태를 여러 개 읽어야 하면 `handle.readerFor(session)`로 만든 콜백 객체 하나를 받는다. 상태가 늘면 생성자 인자나 기능별 리더를 늘리지 않고 속성을 추가한다. 콜백 타입은 `() => S`이고, 목적이 하나인 협력자는 콜백을 직접 받는다. 이 호스트 상태 리더는 와이어 스냅샷이나 살아 있는 Cordis 컨텍스트와 별개이며, 등록, 해제, 캐시, I/O를 소유하지 않는다[](source:sp-r2) | 의무 |
| 3 | `init`과 `apply`로 하는 복구는 동기이고 결정적이다. I/O를 하지 않고 훅·모델·도구를 부르지 않는다(그 효과는 런타임 훅이 소유하고 재생이 되풀이해서는 안 된다). 관련 없는 이벤트에는 같은 상태 참조를 돌려준다. 뷰는 동기이며 보이는 값이 같으면 참조를 보존한다[](source:sp-r3) | 의무·금지 |
| 4 | 스키마가 받는 JSON 상태를 저장한다. `README`의 상태 버전과 복원 지점(checkpoint) 워터마크 규칙을 따른다. 복원 지점에서 시작해 뒷부분을 재생한 결과는 전체 재생과 같아야 한다. 상태 필드나 복구 의미가 바뀌면 버전을 바꾼다[](source:sp-r4) | 의무 |
| 5 | 고정 크기나 선형보다 느리게 느는(sublinear) 상태를 선호한다. 증가는 무시할 만큼 느릴 때만 허용한다. 불가피한 선형 상태는 현재 용도와 메모리·재생·이벤트당 비용을 명시한다. 이벤트 시퀀스 컬렉션을 포함해 기록 크기만큼 자라는 색인을 습관으로 들고 있지 않는다. 크기를 줄이려고 필요한 데이터를 버리거나 동작을 바꾸지 않는다. 완전한 구현으로 시작하고 구체적 필요가 있을 때 최적화한다[](source:sp-r5) | 권고·조건부 의무·금지 |
| 6 | 캐시는 버려도 동작이 바뀌지 않게 다시 만들 수 있어야 한다. 동기 소비자가 페이로드를 필요로 하면 시퀀스 참조만으로는 부족하므로, 규칙 5 안에서 현재 값을 저장하거나 명시적 비동기 경로로 준비한다. 캐시 미스에 전체 로그 읽기를 숨기지 않는다. `snapshotEvents`, `eventAt`, `ownEvents` 또는 같은 역할의 래퍼를 추가하지 않는다. 비동기 래퍼는 동기 기록 읽기를 비동기로 만들지 못한다. 기존 호스트 재생은 이름 붙은 지원 호출자, 소유자, 제거 조건이 있을 때만 남길 수 있고, 클라이언트 캐시 미스의 전체 로그 읽기는 허용하지 않는다. 대체된 복구 헬퍼는 지우고, 캐시 재구성이 복구 규칙을 중복하지 않게 한다[](source:sp-r6) | 금지·조건부 허용 |

적용 전후는 분석자가 규칙을 설명하려고 지어낸 예시다(설명용 예시).

| 설명용 예시 | 규칙 없이 | 규칙을 적용하면 |
| --- | --- | --- |
| 소비자가 프로젝션 값을 읽는다 | 프로젝션 핸들을 내보내 소비자가 직접 읽는다 {bad:규칙 2 위반} | 소유 서비스가 도메인 메서드로 값을 돌려준다 {good:규칙 2}[](source:sp-r2) |
| 캐시에 이벤트 번호만 있는데 동기 소비자가 페이로드를 원한다 | 캐시 미스가 나면 전체 로그를 읽는다 {bad:규칙 6 위반} | 필요한 현재 값을 상태에 저장하거나 명시적 비동기 경로로 페이로드를 준비한다 {good:규칙 6}[](source:sp-r6) |
| 도메인 `getter`가 아직 복구 안 된 세션을 만난다 | getter 안에서 I/O로 복구한다 {bad:규칙 8 위반} | 세션 준비 소유자가 복구를 끝낸 뒤 게시하고 `getter`는 읽기만 한다 {good:규칙 8}[](source:sp-r8) |

## 활성화·이전·검증은 어떻게 하나 {#lifecycle}

규칙 7~10은 "언제 열고, 누가 준비하고, 무엇을 옮기고, 어떻게 확인하나"를 정한다. 규칙 7과 8의 준비는 서로 다른 것이다.[](source:sp-r7)[](source:sp-r8)

| 준비 | 끝나기 전에 하지 않을 것 | 누가 맡나 |
| --- | --- | --- |
| 필수 등록(규칙 7) | 그 핸들을 쓰는 동기 리더를 열거나 콜백을 설치한다 | 주로 `[Service.init]`. 등록이 거부되면 그 활성화가 실패한다[](source:sp-r7) |
| 세션 과거 복구(규칙 8) | 세션을 동기 리더에 게시한다 | 비동기 세션 로딩·준비 소유자[](source:sp-r8) |

| 규칙 | 요구 | 원문의 강도 |
| --- | --- | --- |
| 7 | 필수 등록을 기다린 뒤에 동기 리더를 열거나 그 핸들을 쓰는 콜백을 설치한다. 대기 중에도 이벤트가 올 수 있으니, 이벤트를 놓치지 않으려는 경우에만 리스너를 더 일찍 설치한다. 기다릴 수 있는 콜백에서만 기다린다. 리스너 위치를 옮기거나 대기를 기계적으로 넣지 않는다. 파이버 정리 소유를 유지하고, 명시적 해제를 기다리며, 소유자가 해제된 뒤에는 이펙트를 만들지 않는다[](source:sp-r7) | 의무·금지 |
| 8 | 등록 준비와 세션 복구를 분리한다. 비동기 세션 로딩·준비 소유자가 과거 복구를 끝낸 뒤에 세션을 동기 리더에 게시한다. 레지스트리가 지원하는 수명주기를 쓰고, 도메인 `getter`에 복원이나 숨은 I/O를 넣지 않는다. 복구는 상태를 준비하고 `getter`는 읽는다. 단위와 세션별 레지스트리 오류 범위를 보존한다[](source:sp-r8) | 의무·금지 |
| 9 | 읽기 경로를 바꾸기 전에 플러그인, CLI/GUI, SDK 두 개를 포함한 모든 공식 소비자를 찾는다. 동기 호출자는 명시적으로 옮길 때까지 유지한다. 프라미스는 동기 API를 구현할 수 없다. 새 필수 서비스나 활성화 단계는 소비자 갱신과 업그레이드 가이드가 필요하다. 호환은 실제 지원하는 호출자에 맞추고 테스트 전용 조합에 맞추지 않는다[](source:sp-r9) | 의무 |
| 10 | 실제 진입점으로 값, 알림, 오류 범위와 시점, 복구를 검증한다. 기존 동작 단언을 유지한다. 소비자 전용 오류를 즉시 실행하는 프로젝션 처리로 옮기지 않는다. 수명주기를 바꾸면 늦은 등록, 거부, 교체, 대기 중 해제를 시험한다. 부분적인 세션 모의 객체나 마이크로태스크 횟수가 아니라 실제 세션·저장소 수명주기와 명시적 장벽을 쓴다. 해제된 상태뿐 아니라 오류 로그도 본다. 복구 테스트는 쓸 수 있는, 없는, 호환되지 않는 복원 지점과 뒷부분 재생을 런타임 효과 없이 덮는다[](source:sp-r10) | 의무 |

판정: 규칙 5의 "무시할 만큼 느린"은 수치 기준이 없다. 원문은 허용 기준을 숫자로 주지 않으므로 에이전트의 판단에 달려 있다.[](source:sp-r5)

## 흐름 속 위치 {#position}

이 스킬은 묶음 `review`에 속한다. `dsh-code-review`는 프로젝션 소유권·상태 크기·과거 읽기·이전이 걸린 변경에서 읽을 자료 목록에 이 스킬을 올려 둔다. 다만 본문 점검 항목에서 이 스킬을 적용하라고 따로 지시하지는 않는다.[](source:rel-sp) 이 스킬이 다른 스킬로 넘기는 관계는 없다.

@workflow id=projection-position title="dsh-session-projection 앞"
| hub | dsh-code-review | security |
| me | dsh-session-projection | backend |
| hub > me | 참고 | dashed |

| rel-id | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| r05 | 프로젝션 소유권·상태 크기·과거 읽기·이전 변경의 리뷰 | 없음 | 읽을 자료 목록에만 올라 있다(참고). 리뷰어가 읽을지는 원문이 지시하지 않는다[](source:rel-sp) |

전체 흐름은 `deepseek-harness/_group-review/review.html`에 있다. 관계 근거는 `deepseek-harness/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 1개. 이 폴더에는 다른 텍스트 파일이 없다.
- 제외한 파일: 없음. 번역본도 없다.
- 범위 밖: `packages/session/session-projection/README.md`, `docs/defensive-patterns/conversation-and-session.md` 링크는 원래 deepseek-harness 저장소의 파일이다. 상태 버전, 복원 지점 워터마크, 프로젝션 등록 계약, "Client cache-miss full-log reads" 절의 내용은 확인하지 못했다.
- 원문 비교: 같은 이름의 다른 컬렉션 사본이 없다(원장 기준).
- 실행하지 않았다. 프로젝션 작성과 마이그레이션은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`sessionProjections`, `readerFor`, `[Service.init]` 같은 이름이 실제 코드에서 어떤 모양인지는 원문에 명시 없음. 어떤 호스트 재생이 "이름 붙은 지원 호출자"에 드는지, 업그레이드 가이드를 언제 쓰는지(`dsh-create-upgrade-guide`와의 연결)도 원문에 명시 없음. 이 스킬 안에서 규칙끼리 충돌할 때의 우선순위도 원문에 명시 없음.
