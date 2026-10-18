---
name: automation-audit-ops
description: ECC를 위한 증거 우선(evidence-first) 자동화 인벤토리 및 중복 감사 워크플로. 무엇이든 고치기 전에 어떤 작업, 훅, 커넥터, MCP 서버, 래퍼가 활성 상태인지, 깨졌는지, 중복되는지, 누락되었는지 알고 싶을 때 사용하세요.
metadata:
  origin: ECC
---

# 자동화 감사 운영

사용자가 어떤 자동화가 활성 상태인지, 어떤 작업이 깨졌는지, 어디에 중복이 있는지, 또는 어떤 도구와 커넥터가 실제로 유용한 일을 하고 있는지 물을 때 사용합니다.

이것은 감사 우선(audit-first) 운영자 스킬입니다. 목표는 무엇이든 다시 작성하기 전에, 증거에 근거한 인벤토리와 keep / merge / cut / fix-next 권고 세트를 만드는 것입니다.

## 스킬 스택

관련이 있을 때 다음 ECC 기본 스킬을 워크플로에 끌어들이세요.

- 커넥터, MCP, 훅, 앱 인벤토리에는 `workspace-surface-audit`
- 감사에서 라이브 repo 상태와 지속 가능한 맥락을 대조해야 할 때는 `knowledge-ops`
- 답이 CI, 예약 워크플로, 이슈, 또는 PR 자동화에 달려 있을 때는 `github-ops`
- 진짜 문제가 자매 앱 repo의 webhook 팬아웃, 대기 작업, 또는 과금 소모일 때는 `ecc-tools-cost-audit`
- 로컬 인벤토리를 현재 플랫폼 지원이나 공개 문서와 비교해야 할 때는 `research-ops`
- 가정된 복구 대신 수정 후 상태를 증명해야 할 때는 `verification-loop`

## 사용 시점

- 사용자가 "내가 어떤 자동화를 갖고 있지", "지금 뭐가 활성 상태이지", "뭐가 깨졌지", "뭐가 겹치지"라고 물을 때
- 작업이 cron 작업, GitHub Actions, 로컬 훅, MCP 서버, 커넥터, 래퍼, 또는 앱 통합에 걸쳐 있을 때
- 사용자가 다른 에이전트 시스템에서 무엇이 이식되었고 ECC 안에서 무엇을 다시 만들어야 하는지 알고 싶을 때
- 작업공간에 같은 일을 하는 방법이 여러 개 쌓여 있고, 사용자가 하나의 표준 경로를 원할 때

## 가드레일

- 사용자가 명시적으로 수정을 요청하지 않았다면 읽기 전용으로 시작
- 다음을 구분할 것:
  - 설정됨(configured)
  - 인증됨(authenticated)
  - 최근 검증됨(recently verified)
  - 오래되었거나 깨짐(stale or broken)
  - 완전히 누락됨(missing entirely)
- 스킬이나 설정이 어떤 도구를 참조한다고 해서 그 도구가 활성 상태라고 주장하지 말 것
- 증거 표가 만들어지기 전에는 겹치는 표면을 병합하거나 삭제하지 말 것

## 워크플로

### 1. 실제 표면 인벤토리 작성

이론을 세우기 전에 현재 활성 표면을 읽으세요.

- repo 훅과 로컬 훅 스크립트
- GitHub Actions와 예약 워크플로
- MCP 설정과 활성화된 서버
- 커넥터 또는 앱 기반 통합
- 래퍼 스크립트와 repo별 자동화 진입점

다음 표면별로 묶으세요.

- 로컬 런타임
- repo CI / 자동화
- 연결된 외부 시스템
- 메시징 / 알림
- 과금 / 고객 운영
- 리서치 / 모니터링

### 2. 각 항목을 라이브 상태로 분류

발견된 모든 자동화에 대해 다음을 표시하세요.

- 설정됨(configured)
- 인증됨(authenticated)
- 최근 검증됨(recently verified)
- 오래되었거나 깨짐(stale or broken)
- 누락됨(missing)

그런 다음 문제 유형을 분류하세요.

- 활성 장애(active breakage)
- 인증 장애(auth outage)
- 오래된 상태(stale status)
- 중복 또는 여분(overlap or redundancy)
- 누락된 기능(missing capability)

### 3. 증명 경로 추적

중요한 모든 주장을 구체적인 출처에 연결하세요.

- 파일 경로
- 워크플로 실행 기록
- 훅 로그
- 설정 항목
- 최근 명령 출력
- 정확한 실패 시그니처

현재 상태가 모호하면, 감사가 완료된 척하지 말고 그렇다고 직접 말하세요.

### 4. keep / merge / cut / fix-next로 마무리

겹치거나 의심스러운 표면마다 하나의 판단을 반환하세요.

- keep
- merge
- cut
- fix next

가치는 역사적 경로를 모두 보존하는 데 있지 않고, 시끄러운 자동화를 하나의 표준 ECC 경로로 모으는 데 있습니다.

## 출력 형식

```text
CURRENT SURFACE
- automation
- source
- live state
- proof

FINDINGS
- active breakage
- overlap
- stale status
- missing capability

RECOMMENDATION
- keep
- merge
- cut
- fix next

NEXT ECC MOVE
- exact skill / hook / workflow / app lane to strengthen
```

## 함정

- 라이브 인벤토리를 읽을 수 있는데 기억에 의존해 답하지 말 것
- "설정 파일에 있다"를 "작동한다"로 취급하지 말 것
- 고가치 경로가 깨졌다고 명명하기 전에 저가치 중복을 먼저 고치지 말 것
- 사용자가 인벤토리를 먼저 요청했다면, 작업을 repo 재작성으로 넓히지 말 것

## 검증

- 중요한 주장에는 라이브 증명 경로가 인용되어 있는가
- 발견된 각 자동화에 명확한 라이브 상태 범주가 붙어 있는가
- 최종 권고가 keep / merge / cut / fix-next를 구분하는가
