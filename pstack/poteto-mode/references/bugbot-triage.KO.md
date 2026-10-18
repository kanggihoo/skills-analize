# Bugbot 분류

Babysit 플레이북(`../playbooks/babysit.md`)이 Bugbot이나 리뷰 자동화의 댓글을 처리할 때 이 참고 자료를 사용하세요. 목표는 Bugbot을 기본적으로 무시하는 것이 아닙니다. 모든 댓글을 필수 코드 변경으로 취급하는 것을 멈추는 것입니다.

## 판단 기준

행동하기 전에 각 Bugbot 스레드를 분류하세요.

- `fix`: 댓글이 그럴듯한 정확성, 보안, 개인정보, 데이터 손실, 인증, 과금, 마이그레이션, 멱등성, 경쟁 상태, 또는 배포된 동작의 문제를 지적합니다. 가장 낮은 소유 PR에서 고치고, 커밋 SHA로 답글을 달고 스레드를 해결합니다.
- `dismiss`: 댓글이 문서화된 저위험 노이즈 패턴에 해당하고, 현재 코드와 맥락이 그 우려에 코드 변경이 필요 없음을 증명합니다. 짧은 이유로 답글을 달고 스레드를 해결합니다.
- `ask`: 댓글이 새롭거나, 심각도가 높거나, 보안·개인정보·데이터와 관련되거나, 모호합니다. 추측하지 말고 사용자에게 묻습니다.

확신이 없으면 묻습니다. 노이즈인 코드 품질 댓글을 건너뛰는 비용은 낮지만, 실제 데이터나 보안 버그를 건너뛰는 것은 그렇지 않습니다.

## 학습된 패턴 형식

앞으로의 패턴은 다음 형태로 추가하세요.

```markdown
### <short pattern name>

- Confidence: candidate | recurring | strong
- Skip when: <conditions that must be true>
- Do not skip when: <risk boundaries>
- Example signal: <phrases or code context that identify the pattern>
- Source: <PR/comment URL or short historical note>
```

예시가 한두 개뿐이면 `candidate`를 씁니다. 실제 기각이 여러 번 쌓인 뒤에는 `recurring`을 씁니다. 패턴이 좁고, 여러 번 검증되었으며, 저위험일 때만 `strong`을 씁니다.

## 반복되는 건너뛰기 후보

### 의도된 UI나 디자인 시스템의 시각적 변경

- Confidence: candidate
- Skip when: PR 설명, 스크린샷, 디자인 리뷰, 또는 주변 코드가 시각적 변경을 명시하고, Bugbot 댓글이 공유된 시각적 기본값이 바뀌었다는 사실만 다시 말할 때.
- Do not skip when: 댓글이 접근성, 포커스 가시성, 키보드 탐색, 색 대비, 또는 PR이 의도적으로 바꾸지 않은 컴포넌트 API 계약을 가리킬 때.
- Example signal: 포커스 아웃라인, 버튼 크기, 간격, 또는 공유 컴포넌트 시각 기본값에 관한 댓글인데 소유자가 "intentional" 또는 "intended"라고 답한 경우.

### Bugbot이 볼 수 없는 상위 스택이나 스택 내부의 사용

- Confidence: candidate
- Skip when: Bugbot이 export, 컴포넌트, 헬퍼, 또는 파일을 미사용으로 표시했는데, 활성 forge의 PR 목록과 diff, 상위 스택 diff, 또는 PR 맥락이 나중 PR에서 사용됨을 보여 줄 때.
- Do not skip when: 현재 PR이 스택의 일부가 아니거나, 심볼이 공개 API이거나, 상위 스택 사용을 검증할 수 없을 때.
- Example signal: "Exported component is never used"에 사람이 "used upstack"이라고 답한 경우.

### 병렬 구현 중의 일시적 중복

- Confidence: candidate
- Skip when: PR이 교체되거나 삭제될 예정이거나 검증 중인 기존 경로와 나란히 새 경로를 유지하려고 소량의 코드를 의도적으로 중복할 때.
- Do not skip when: 중복이 보안, 과금, 데이터 접근, API 동작을 바꾸거나, 오래 유지되는 공유 추상화가 위험을 분명히 줄일 때.
- Example signal: "Significant duplication" 또는 "duplicated validation logic"에 소유자가 옛 경로가 삭제될 것이라거나 중복 로직이 의도적으로 로컬이라고 설명한 경우.

### 기존 프레임워크나 컴포넌트의 불변식이 경고를 이미 다룸

- Confidence: candidate
- Skip when: 우려가 현재 diff나 주변 코드에서 보이는 공유 컴포넌트, 프레임워크 계약, 타입 불변식, 또는 단일 진실 원천으로 이미 보장될 때.
- Do not skip when: 불변식이 가정만 되고 강제되지 않거나, 타이밍에 의존하거나, 값이 갈라질 수 있는 async·상태 경계를 가로지를 때.
- Example signal: 공유 popover가 뷰포트 경계를 강제하는데 내부 popover에 max-height가 없다는 댓글, 또는 로컬에서 검사한 값과 전달한 값이 같은 출처를 공유하는 nullable 값에 관한 댓글.

### 소유자가 선언한 후속 작업이나 미뤄진 정리

- Confidence: candidate
- Skip when: PR 소유자가 그 문제가 알려진 후속 작업이라고 명시적으로 말하고, 현재 PR이 동작을 나쁘게 만들지 않으며, 댓글이 고위험 영역에 관한 것이 아닐 때.
- Do not skip when: 에이전트가 소유자의 입력 없이 행동하거나, 문제가 중간·높은 심각도의 제품 동작이거나, 미루면 새 회귀가 병합될 때.
- Example signal: "I'll worry about that later" 또는 "we'll delete this eventually".

### 스스로 철회했거나 명시적으로 거짓 양성이라고 한 규칙 댓글

- Confidence: recurring
- Skip when: 댓글 본문이나 나중의 Bugbot 답글이 그 발견이 철회되었거나, 규칙을 준수하거나, 거짓 양성이라고 명시적으로 말하고, 에이전트가 관련 규칙을 로컬에서 검증할 수 있을 때.
- Do not skip when: 고위험 문제에 대해 근거 없이 사람이 "false positive"라고만 말한 것이 유일한 증거일 때.
- Example signal: 파일 이름 규칙 댓글인데 본문이 파일이 이미 규칙을 준수한다고 말하는 경우.

## 기본적으로 묻기

이전 PR에서 비슷한 것을 기각했더라도, 다음 범주는 자동으로 건너뛰지 마세요.

- 보안, 개인정보, 인증, 과금, 데이터 보존, 학습 데이터, 권한 경계에 관한 발견.
- 높은 심각도의 발견.
- 마이그레이션, 스키마, 멱등성, 동시성, 시스템 간 동작에 관한 발견.
- 제시된 수정이 작고, 제품 의도를 바꾸지 않으면서 위험을 분명히 줄이는 댓글.

과거 데이터를 보면 사람들이 보안이나 데이터 흐름 댓글을 기각하기도 했습니다. 이것은 팀 전체의 건너뛰기 규칙이 아니라 소유자의 판단 문제로 취급하세요.

## 최근 babysit에서 얻은 후보 학습 내용

babysit 중이나 후에 팀에 유용해 보이지만 아직 충분히 성숙하지 않은 새 후보 학습 내용은 여기에 덧붙이세요. 여러 PR이 패턴을 확인하면, 반복되는 후보는 위 섹션으로 올리는 것이 좋습니다.

### 네이티브 브라우저 동작을 수동으로 재구현한 코드

- Confidence: candidate
- Skip when: 거의 없습니다. diff가 네이티브 브라우저 동작을 수동 대체물로 바꿀 때(네이티브 sticky를 JS로 위치시킨 복제본으로, 네이티브 스크롤 대상 지정을 전달된 wheel·touch 이벤트로, paint-order 가림을 마스크·clip-path로 바꾸는 경우), 그 코드에 대한 Bugbot의 로직 버그 발견은 일관되게 타당했습니다.
- Do not skip when: 발견이 이벤트 전달 누락(wheel deltaMode, touch pan, 가장자리에서의 scroll-chaining, tap slop), 마스크·clip의 hit-testing 차이, 또는 그런 코드의 observer와 React 상태 타이밍 경쟁에 관한 것일 때. 기본값은 고치기입니다.
- Example signal: "masks do not affect hit-testing", "overlay blocks wheel scroll", "ignores deltaMode", "runs in the IntersectionObserver callback before React applies state".
- Source: 하나의 sticky-occlusion PR: Bugbot 여섯 번 통과, 약 열여덟 개 발견, 모두 기각이 아니라 수정됨.

### 계약 테스트 드리프트 주장은 값싸게 검증할 수 있다. 먼저 테스트를 실행하라

- Confidence: candidate
- Skip when: 검증 자체는 건너뛰지 마세요. 명령 하나면 됩니다. PR이 프로토콜이나 문서 문장을 고정하는 계약 테스트(SKILL.md에 대한 정규식, 문서 문구의 스냅샷)를 함께 제공하고, Bugbot이 "테스트가 더 이상 문서와 맞지 않는다"(또는 그 반대)고 주장하면, 분류하기 전에 PR 끝 지점에서 그 테스트를 실행하세요. 빨간색 실행은 주장을 경험적으로 확인하고, 초록색 실행은 기각 답글을 위한 구체적인 반증입니다.
- Do not skip when: 해당 없음. 이것은 기각 패턴이 아니라 검증 지름길입니다. 반복 통과에서 "대개 기각" 경험칙은 여기서 잘못 작동할 수 있습니다. 문장을 고정하는 테스트는 앞선 수정 라운드가 문장을 고치기 때문에 어긋나기 쉽습니다.
- Example signal: 앞선 수정 커밋들이 고정된 문단을 고쳐 쓴 PR에서 "Contract test omits the pre-fix wait". 끝 지점에서 테스트를 실행하니 인용된 단언에서 정확히 실패했습니다.
- Source: 여덟 번의 Bugbot 통과를 거친 문장 고정 PR. 앞선 통과는 모두 수정되고 해결되었지만, 일곱 번째 통과의 주장은 실제였습니다.

### 최종 보안 리뷰 발견이 같은 PR의 나중 수정으로 이미 해결됨

- Confidence: candidate
- Skip when: agentic 보안 리뷰(또는 비슷한 것)가 누락된 authz·검증 호출을 주장하고, 현재 PR 끝 지점에 정확히 그 게이트가 (테스트와 함께) 포함되어 있을 때. 보통 리뷰 실행 뒤의 나중 강화 커밋에서 추가됩니다.
- Do not skip when: 인용된 헬퍼가 논의 중인 주체에게는 no-op이거나, 검사가 보호하려는 부작용 뒤에서 실행되거나, 주장된 주체의 커버리지가 없을 때.
- Example signal: 끝 지점에서 부작용 전에 정확한 가드가 이미 호출되고 있는데 HIGH "missing authorization check" 발견이 있는 경우.
- Source: 강화 커밋이 리뷰 실행보다 늦게 들어간 webhook 엔드포인트 PR 하나.

### 의도적으로 좁게 둔 오류 조건을 넓히면 실제 오류를 가리게 된다

- Confidence: candidate
- Skip when: 발견이 좁은 오류 조건(특정 `errno`, 오류 코드, 또는 상태 클래스)을 포괄적 catch-all로 넓히라고 요구하고, 그 좁음이 실제 구분을 담고 있을 때. 대표적인 형태는 `ENOENT`에 걸린 의존성 폴백입니다. "바이너리가 설치되지 않음"은 "명령은 실행됐지만 실패함"과 다른 상황입니다. 0이 아닌 모든 종료 코드에서 재시도하면 정당한 실패(찾을 수 없음, 만료된 인증, 네트워크)를 폴백에 다시 실행하고, 실제 오류 대신 폴백의 오류를 보고하게 됩니다.
- Do not skip when: 좁은 조건이 같은 범주의 사례를 놓칠 때(`EACCES` 같은 다른 "바이너리 사용 불가" errno, 다른 전송 계층 실패), 처리되지 않은 경로가 데이터를 잃거나 부분 상태를 남길 때, 또는 재시도가 멱등이면서 원래 오류도 여전히 드러날 때.
- Example signal: "only retries when X fails with ENOENT … never tries the fallback even when a working Y exists"처럼, 폴백이 실패한 작업이 아니라 없는 의존성을 위해 존재하는 코드를 가리키는 경우.
- Source: 폴백이 실패한 명령이 아니라 없는 바이너리를 위해 존재했던 CLI 이름 변경 PR 하나.
