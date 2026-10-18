---
name: no-comments
description: "Spawn Comment Sicko, fix accepted findings, and offer encodings for claimed constraints."
disable-model-invocation: true
---

# No comments

Comment Sicko를 띄웁니다. 승인된 지적 사항을 처리합니다.

Comment Sicko의 새로운 관점을 존중하세요.

## 범위

호출자가 지정한 파일이나 diff를 사용합니다. 지정이 없으면 현재 diff를 base 브랜치(기본값 `main`)와 비교하고, working tree를 포함합니다.

## 단계

1. `subagent_type: "Comment Sicko"`로 `Task`를 띄웁니다. 범위를 전달합니다. 규칙을 다시 적지 마세요.
2. 보고서와 diff를 검토합니다. 애플리케이션 코드 수정, 범위 이탈, 예외로 보호된 삭제, 잘못 적힌 `MUST KILL` 사유, 의도된 코드를 유죄로 취급하는 지적은 거부합니다. 우리 코드에서 나온 예상 밖의 지적은 실행 가능한 상태로 유지합니다. 이 주석을 복원하지 마세요. 유지(keep)는 우리가 바꿀 수 없는 무엇에 관한 것이라는 증거가 있을 때만 살아남습니다. 누락된 범위 지정 lint 및 TypeScript 억제 주석을 감사하세요. 정확성이나 안전성 관련 억제 주석은 실행 가능한 `MUST KILL`로 남깁니다. 삭제는 정확한 예외와 범위 증명이 있을 때만 복원합니다. 얇은 `IMPORTANT` 또는 `do not remove` 판정 kill이나 keep을 승인하기 전에, 해당 심볼에 대해 `/how` 또는 `/why`를 실행합니다. kill이 모호하면 복원하지 마세요. keep이 반박되었거나 여전히 모호하면 삭제합니다. 거부된 보고서 하나는 실패 사유를 명시해 되돌리고 다시 실행합니다. 두 번째로 거부되면 열린 상태로 보고하고 `/no-comments`를 실패 처리합니다.
3. 사소한 승인 지적은 직접 고칩니다. 죽은 경로를 삭제하고, 매개변수를 빼고, 실제 API를 사용하는 방식입니다. 어떤 수정이든 형태 설계가 필요하다면, 승인된 지적 묶음과 주변 코드에 대해 `/architect`를 한 번 실행합니다. 스케치 단계에서 멈추세요. 형태는 Architect가 정하고, 구현은 4단계에서 합니다.
4. 범위 안에서 가장 작은 근본 원인 수정을 구현합니다. 명명된 우회 코드를 모두 제거합니다. 근본 원인이 범위 밖에 있다면, 범위 안에서 가장 작은 수정을 적용하고 나머지는 열린 상태로 보고합니다. **principle-fix-root-causes**와 **principle-redesign-from-first-principles** 스킬은 의도를 안내할 뿐입니다. 어느 쪽도 범위의 울타리를 넓히거나 범위 밖 사례를 고치는 것을 허락하지 않습니다. 증상을 막는 보호 코드를 덧붙이지 마세요.
5. 제약 주석은 `do not remove`, `do not change wording`, 또는 `talk to X before changing`입니다. 우리가 바꿀 수 없는 것에 관한 유지 주석은 그대로 둡니다. 범위 안에서 가장 저렴한 타입, 런타임, 테스트, 또는 CI lint를 제안합니다. 대화형 승인을 기다립니다. 무인 실행과 eval은 호출자의 사전 승인이 필요합니다. 승인되면 인코딩한 뒤 삭제합니다. 그렇지 않으면 삭제하고, 제약을 열린 상태로 보고하며, 범위 밖 작업을 스케치합니다.
6. 삭제 개수, 복원된 주석, 재실행, architect 스케치, 수정 사항, 인코딩 제안, 인코딩 결과, 강제되지 않은 제약, 그 밖의 열린 작업을 보고합니다.
