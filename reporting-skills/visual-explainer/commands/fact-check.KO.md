---
name: fact-check
description: Verify a generated document against actual code and git history
---

visual-explainer 스킬을 로드하고 `$@`에 있는 문서의 사실 여부를 확인하세요. 경로가 없으면 `VISUAL_EXPLAINER_OUTPUT_DIR`이 설정되어 있고 비어 있지 않을 때는 그 디렉터리(작업 디렉터리 기준 상대 경로)에서, 그렇지 않으면 `~/.agent/diagrams/`에서 가장 최근의 HTML 파일을 사용하세요.

1. 검증 가능한 모든 주장을 추출하세요: 경로, 이름, 동작, 데이터 흐름, API, 명령, 의존성, 테스트, 수치, git 이력. 의견은 건너뛰세요.
2. 각 주장을 소스 또는 `git show`와 대조하세요. verified, corrected, unsupported, unverifiable 중 하나로 표시하세요.
3. 오류는 페이지 소스(`<name>.src.html`이 있으면 그것, 없으면 HTML)에 작은 수정을 가하여 고친 뒤 다시 렌더링하세요. 구조와 스타일은 유지하세요. 잘못된 엣지나 라벨도 잘못된 주장입니다.
4. 페이지 상단에 검증 스트립을 추가하세요: 상태별 개수를 칩으로 표시하고, 무엇이 바뀌었는지 `<details>` 목록으로 보여주세요.

결과를 여세요. Markdown이면 경로를 보고하세요.
