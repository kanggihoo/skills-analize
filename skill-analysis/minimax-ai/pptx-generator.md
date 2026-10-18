# pptx-generator 분석

## 원본

- 경로: `.agents/skills/pptx-generator/SKILL.md`
- 성격: PowerPoint 프레젠테이션 읽기, 생성, 편집 스킬
- 주요 도구: PptxGenJS, markitdown, PPTX XML workflow

## 적용 조건

PPT, PPTX, PowerPoint, presentation, slide, deck 생성/수정/분석 요청에 사용한다. 기존 발표자료 읽기, template 기반 수정, 새 슬라이드 덱 생성이 모두 포함된다.

## 동작 과정

1. 작업 유형을 정한다.
   읽기/분석은 `markitdown`, 템플릿 수정은 XML workflow, 새 프레젠테이션은 PptxGenJS로 만든다.

2. 새로 만들 때는 요구사항을 조사한다.
   주제, 청중, 목적, 톤, 콘텐츠 깊이를 확인한다.

3. palette와 font를 선택한다.
   `references/design-system.md`의 color palette와 font reference를 사용한다.

4. 디자인 스타일을 고른다.
   Sharp, Soft, Rounded, Pill 중 발표 톤에 맞는 style recipe를 선택한다.

5. 모든 슬라이드를 5개 page type 중 하나로 분류한다.
   Cover, TOC, Section Divider, Content, Summary가 기본 page type이다. 같은 레이아웃 반복을 피한다.

6. slide JS 파일을 생성한다.
   `slides/slide-01.js`처럼 슬라이드당 하나의 JS 파일을 만들고, 동기 `createSlide(pres, theme)` 함수를 export한다.

7. compile script로 최종 PPTX를 만든다.
   `slides/compile.js`에서 PptxGenJS presentation을 만들고 slide module을 순서대로 호출한다.

8. QA를 수행한다.
   `references/pitfalls.md`의 QA process를 따라 최종 발표자료를 확인한다.

## 핵심 규칙

- 기본 dimension은 16:9, 10" x 5.625"다.
- 색상은 `#` 없는 6자리 hex 문자열을 사용한다.
- theme object key는 `primary`, `secondary`, `accent`, `light`, `bg`만 사용한다.
- cover를 제외한 모든 슬라이드는 오른쪽 아래 page number badge가 있어야 한다.
- slide module은 async가 아니라 synchronous 함수여야 한다.
- 중국어 font는 Microsoft YaHei, 영어 기본 font는 Arial 또는 승인된 대안을 사용한다.

## 산출물 특성

결과물은 `slides/output/presentation.pptx`와 슬라이드별 JS 파일 구조다. 각 슬라이드는 독립 preview도 가능하고, 최종 compile로 하나의 deck이 된다.

## 주의점

PptxGenJS 좌표 단위는 inch 기반이다. 색상, theme key, page badge 위치를 틀리면 일관성이 깨지므로 contract를 엄격히 지켜야 한다.
