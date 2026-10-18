# pptx 분석

## 원본

- 원본 경로: `.agents/skills/pptx/`
- 핵심 파일: `SKILL.md`
- 보조 파일: `editing.md`, `pptxgenjs.md`, `scripts/`, XML schema
- 확인한 규모: 59개 파일, 약 4,488줄
- 성격: PowerPoint `.pptx` 읽기, 생성, 편집, template adaptation, QA를 수행하는 프레젠테이션 스킬

## 적용 조건

사용자가 `.pptx`, deck, slides, presentation, pitch deck, speaker notes, comments, template, slide editing, slide extraction을 언급할 때 사용한다. PPTX가 input 또는 output 중 하나라도 관련되면 트리거된다.

## 동작 과정

1. 작업 유형을 분류한다.
   read/analyze는 `python -m markitdown`, visual overview는 `scripts/thumbnail.py`, raw XML은 unpack workflow를 사용한다.

2. 기존 deck/template 기반이면 `editing.md` workflow를 따른다.
   thumbnail과 markitdown으로 slide layout과 placeholder text를 분석한다.

3. slide mapping을 계획한다.
   content section별로 어떤 template slide를 쓸지 정하고, 같은 layout 반복을 피한다.

4. `scripts/office/unpack.py`로 PPTX를 푼다.

5. 구조 변경을 먼저 끝낸다.
   slide 삭제, duplicate, reorder, slide id list 조정을 한 뒤 content edit로 넘어간다.

6. slide XML을 편집한다.
   subagent 사용이 가능하면 slide별 XML 편집은 병렬화할 수 있지만, structural changes는 직접 수행한다.

7. `scripts/clean.py`로 orphaned slides/media/rels를 제거한다.

8. `scripts/office/pack.py`로 다시 `.pptx`를 만들고 validation한다.

9. scratch deck은 `pptxgenjs.md` 규칙에 따라 PptxGenJS로 만든다.

10. QA를 수행한다.
    markitdown으로 content QA, LibreOffice + pdftoppm으로 image 변환 후 visual QA를 수행한다.

## 보조 파일 역할

- `editing.md`: template-based workflow, unpack/add/clean/pack, XML editing rule
- `pptxgenjs.md`: scratch deck creation, text, shapes, images, charts, icons, pitfalls
- `scripts/add_slide.py`: layout 또는 기존 slide에서 새 slide 생성
- `scripts/clean.py`: orphaned slide, rels, unused media 제거
- `scripts/thumbnail.py`: template 분석용 slide grid 생성
- `scripts/office/*`: unpack/pack/soffice/validate와 XML schema validation

## 핵심 규칙

- 텍스트만 있는 지루한 slide를 만들지 않는다.
- palette는 topic-specific해야 하며 generic blue를 피한다.
- 모든 slide에는 image, chart, icon, shape 등 visual element가 필요하다.
- title 밑 accent line은 AI-generated slide의 흔한 흔적으로 금지된다.
- unicode bullet 대신 PPTX list formatting을 쓴다.
- PptxGenJS hex color에는 `#`를 붙이지 않는다.
- shadow opacity를 8자리 hex에 넣지 않고 `opacity` property를 쓴다.
- visual QA는 문제를 찾는 bug hunt 방식으로 수행한다.

## 산출물 특성

- 새 `.pptx`
- template 기반으로 편집된 `.pptx`
- slide thumbnail grid
- slide image render
- QA 수정 loop를 거친 최종 deck

## 주의점

- 첫 render가 맞다고 가정하면 안 된다.
- visual QA에서 issue가 하나도 없으면 충분히 본 것이 아닐 가능성이 있다.
- one fix가 다른 layout 문제를 만들 수 있어 affected slide 재검증이 필요하다.
- XML namespace를 망가뜨리면 PPTX가 깨질 수 있으므로 edit는 구체적으로 해야 한다.
