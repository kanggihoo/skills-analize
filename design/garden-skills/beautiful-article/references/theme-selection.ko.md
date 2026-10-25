# 테마 선택

테마는 **미적 분위기, 타이포그래피 언어, 이미지 스타일, Raw 스타일, 코드 / 공식 스타일**을 정합니다. CSS 스킨도 아니고 정보 밀도 규칙도 아닙니다.

> CSS는 브라우저를 위한 것이고 theme profile은 AI를 위한 것입니다.

- **컴포넌트 라이브러리가 실행 시 테마를 관리합니다.** CSS 토큰, `ThemeProvider` 등록, 실제 렌더링을 담당합니다. 등록된 runtime theme id는 `src/theme/ThemeProvider.tsx`에서 확인합니다(현재 `tufte`, `press`).
- **Skill이 테마 작성 프로필을 관리합니다.** `theme-profiles/index.json` + `<id>.md`가 AI의 테마 선택과 사용 방법을 안내합니다.

## 선택 절차

1. `theme-profiles/index.json`을 읽어 각 테마의 `bestFor` / `mood`를 확인합니다.
2. `source.md`의 콘텐츠 유형 / 어조를 기준으로 `bestFor`에서 맞는 테마 하나 또는 두 개를 추천합니다.
   - 기술 / 근거 / 데이터 중심 → `tufte`.
   - 서사 / 논평 / 출판 / 제품 노트 → `press`.
3. 선택한 테마의 `theme-profiles/<id>.md`를 읽습니다(작성, 이미지 선택, Raw, 코드 작성 전의 기준 문서).
4. 선택과 이유를 `plan/plan.md`의 **Theme** 단락에 기록합니다(`plan-template.md` 참고).

## 밀도와 테마는 독립

theme profile은 정보 밀도별 표현을 제안할 수 있지만 **제약으로 만들어서는 안 됩니다.** 예시:

- `tufte + 100% longform`: 절제된 장문, 데이터 근거, 핵심 개념을 강조하는 Raw.
- `tufte + 40% visual-essay`: 여전히 적합하며 Raw를 도식 / 근거 중심, 저장식으로 사용.
- `press + 100% longform`: 깊이 있는 출판형 글로 구성 가능.
- `press + 40% briefing`: 편집 리듬과 글 / 이미지의 여백을 더 강조.

## 테마 선택 자체 점검

- 테마가 글의 유형과 어울리는가?
- 현재 정보 밀도에 맞춰 본문 / Raw / 이미지 비율을 어떻게 조정해야 하는가?
- Raw가 이 테마에서 자연스럽게 보이는가? 이미지 전략이 테마에 맞는가?
- 테마와 원본 자료 사이에 충돌이 있는가?(있다면 `plan/plan.md`의 Theme 단락에 설명)
- runtime theme id가 실제 컴포넌트 라이브러리에 있는가? Skill profile도 존재하는가?

## 새 테마 추가 제약

새 테마는 다음 세 가지를 **모두** 충족해야 합니다.

1. 컴포넌트 라이브러리에 runtime theme CSS와 `ThemeProvider` 등록이 있어야 합니다(`src/theme/themes/<id>/`).
2. Skill에 해당 `theme-profiles/<id>.md`가 있어야 합니다.
3. `theme-profiles/index.json`이 올바른 runtime theme id를 가리켜야 합니다.

- Skill profile만 있고 컴포넌트 라이브러리 runtime theme이 없으면 후보일 뿐이며 정식 생성에 사용할 수 없습니다.
- 컴포넌트 라이브러리 runtime theme만 있고 Skill profile이 없으면 Agent가 먼저 추천할 수 없습니다.
