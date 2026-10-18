---
name: visual-pr
description: 사용자가 이 스킬을 이름으로 명시적으로 호출한 경우에만 사용하세요.
---

# Pull Request 설명 작성

현재 작업의 Pull Request를 생성하거나 업데이트하세요. 리뷰어가 변경의 이유와 구현의 형태를 이해할 수 있도록 간결한 설명을 작성합니다.

## 워크플로

1. 설명 템플릿을 읽으세요:

   `Read({SKILLBASE}/references/pr_description_template.md)`

2. Pull Request를 찾거나 생성하세요:
   - `gh pr view --json url,number,title,state,baseRefName,headRefName 2>/dev/null`로 현재 브랜치에 PR이 있는지 확인하세요.
   - PR이 없다면 `git status --short --branch`와 현재 브랜치의 커밋을 확인하세요.
   - 필요하면 작업 관련 변경을 커밋하고, 업스트림과 함께 브랜치를 push한 뒤 PR을 생성하세요. 저장소의 git 안전 프로토콜을 따르세요.
   - 현재 브랜치에 관련 작업이 없고, 안전하게 생성할 수 있는 현재 브랜치 PR도 없을 때만 사용자에게 PR 선택을 요청하세요.

3. 변경을 설명하는 데 필요한 맥락만 수집하세요:
   - 티켓과 관련 작업 산출물을 읽으세요.
   - PR diff 전체와, 동작과 소유 관계를 이해하는 데 필요한 주변 코드를 읽으세요.
   - `gh pr view`로 PR 메타데이터와 변경된 파일을 확인하세요.
   - PR 본문의 시각적 개요 규칙은 `{SKILLBASE}/references/show-me.md`를 읽어서 확인하세요.

4. 템플릿을 사용해 PR 설명을 작성하세요:
   - **변경 이유**는 정확히 한 문장으로 작성하세요.
   - **특별히 참고할 점**은 1-3개의 bullet로 작성하세요. 리뷰어 주의 사항, 마이그레이션, 호환성 제약, 의도적인 생략, 놀라운 결정을 우선하세요. 특별히 고려할 사항이 없다면 `- None.`이라고 쓰세요.
   - **변경 개요**는 산문이나 파일별 변경 로그가 아니라, `/show-me` 스타일의 간결한 구조적 개요로 작성하세요.
   - 이 PR을 설명하는 데 도움이 되는 뷰만 포함하세요.
     - SQL 테이블과 엔드포인트 계약 변경, 그리고 비즈니스 로직의 의사 코드.
     - 핵심 데이터 구조 / 타입 변경.
     - 변경된 책임을 보여주는 얕은 파일 트리.
     - 중요한 훅, 상태, 패키지 경계를 포함한 React 컴포넌트 트리 변경.
     - 호출 트리, 호출 스택, 제어 흐름, 또는 데이터 흐름 변경.
   - 기존 형태의 변경을 보여줄 때는 `diff` 블록을 선호하세요. 대부분이 새로운 형태이거나, diff 표기법이 소유 관계나 순서를 가릴 때는 완성된 목표 형태 전체를 보여주세요.
   - 각 뷰는 리뷰어에게 필요한 내용에만 집중하세요. 변경되지 않은 범주는 생략하세요.
   - 선택 사항: 티켓 ID/URL, humanlayer 작업 URL, 관련 계획/문서 URL 또는 기타 관련 링크를 알고 있다면 헤더에 포함하고, 없다면 헤더를 생략하세요.

5. 설명을 저장하고 게시하세요:
   - 작업 디렉터리가 존재하면 `.humanlayer/tasks/{task-slug}/pr-description.md`를 사용하고, 그렇지 않으면 `.humanlayer/tasks/pr-{number}/description.md`를 사용하세요.
   - `gh pr edit {number} --body-file {output-path}`로 PR을 업데이트하세요.
   - 업데이트가 성공했는지 확인하세요.

6. 완료를 보고하세요:
   - `{SKILLBASE}/references/describe_pr_final_answer.md`를 읽으세요.
   - 그 최종 답변 템플릿에 따라 PR URL, 저장된 설명 URL, 변경된 파일 목록을 간결하게 응답하세요.

항상 `{SKILLBASE}/references/pr_description_template.md`를 읽고 따르세요. PR 본문을 그 템플릿 범위 밖으로 확장하지 마세요.

한 사람이 다른 사람에게 말하듯 작성하세요. 전문 용어와 속어는 피하고, 단순하고 일관되며 간결한 언어를 사용하세요.
