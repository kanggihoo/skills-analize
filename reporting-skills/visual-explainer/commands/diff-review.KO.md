---
name: diff-review
description: Generate a visual diff review for code changes
---

visual-explainer 스킬을 로드하고 시각적 diff 리뷰를 만드세요.

범위: `$@`를 브랜치, 커밋, 범위, PR 또는 `HEAD`로 읽으세요. 비어 있으면 작업 트리를 `main`/`master`와 비교하세요. `--quick`이 있으면 플래그를 제거하고 스킬의 Quick 모드를 따르세요.

그리기 전에 수집하세요: diff 통계, name-status, 변경된 전체 파일과 그 주변 코드 경로, 공개 API 또는 타입 변경, 테스트, 의존성 또는 설정 변경, 커밋 메시지. 모든 주장에는 경로 또는 `file:line`을 인용하세요. 근거를 지어내지 마세요.

일반적인 섹션입니다. 내용에 따라 병합, 재정렬, 삭제 또는 추가하세요:

| 섹션 | 피규어 |
|---|---|
| 결론 | 한 문장 + merge/blocked 칩 + `+N −M · K files` |
| 변경 사항 | 추가/수정/삭제 칩과 줄 수가 있는 파일 맵 |
| 동작 | 같은 SVG의 변경 전/후; 추가되거나 제거된 엣지는 강조 |
| 위험 | 심각도 칩이 있는 표: correctness, tests, API, security, performance |
| 결합도 | 변경된 코드에 의존하는 대상을 보여주는 작은 SVG |
| 다음 단계 | 차단 요소와 후속 작업을 체크리스트로 |

색상: 빨강 = 제거 또는 변경 전 · 초록 = 추가 또는 변경 후 · 호박색 = 위험 · 파랑 = 맥락. 스킬의 규칙에 따라 전달하세요.
