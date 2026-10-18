# docx 분석

## 원본

- 원본 경로: `.agents/skills/docx/`
- 핵심 파일: `SKILL.md`
- 보조 파일: `scripts/`, `scripts/office/`, XML schema, comment templates
- 확인한 규모: 61개 파일, 약 3,922줄, Python 15개, XSD 39개, XML template 5개
- 성격: Word `.docx` 생성, 읽기, 편집, 추적 변경, 댓글, 검증을 처리하는 Office 문서 스킬

## 적용 조건

사용자가 Word document, `.docx`, report, memo, letter, template, Word 형식 산출물, tracked changes, comments, find-and-replace, image insertion, content extraction을 요청할 때 사용한다.

PDF, spreadsheet, Google Docs, 일반 코딩 작업에는 사용하지 않는다.

## 동작 과정

1. 작업 유형을 분류한다.
   읽기/분석은 `pandoc` 또는 raw XML unpack, 새 문서 생성은 `docx-js`, 기존 문서 편집은 unpack → XML edit → pack 흐름이다.

2. legacy `.doc`이면 먼저 LibreOffice로 `.docx`로 변환한다.
   `scripts/office/soffice.py --headless --convert-to docx`를 사용한다.

3. 새 문서는 JavaScript `docx` package로 생성한다.
   page size를 명시하고, style, heading, list, table, image, page break, TOC, header/footer 등을 `docx-js` API로 구성한다.

4. 새로 만든 문서는 `scripts/office/validate.py`로 검증한다.
   실패하면 unpack해서 XML을 고치고 다시 pack한다.

5. 기존 문서는 `scripts/office/unpack.py`로 압축을 푼다.
   이 과정에서 XML pretty print, adjacent run merge, smart quote entity escaping이 수행된다.

6. XML은 직접 특정 문자열/element를 편집한다.
   추적 변경과 댓글에서는 author 기본값을 `Claude`로 사용한다.

7. 댓글 추가는 `scripts/comment.py`가 boilerplate를 처리한다.
   comments.xml, relationships, content types, people/comment id 관련 파일을 맞춘 뒤 document.xml에 marker를 넣는다.

8. `scripts/office/pack.py`로 다시 `.docx`를 만든다.
   pack 단계는 validation, auto-repair, XML condense를 수행한다.

## 보조 스크립트 역할

- `accept_changes.py`: LibreOffice macro 기반으로 tracked changes를 accept한 clean document 생성
- `comment.py`: comment/reply XML과 relationship/content type boilerplate 생성
- `office/unpack.py`: DOCX unzip, XML pretty print, smart quote escaping
- `office/pack.py`: XML condense, validation, repair, zip packaging
- `office/validate.py`: schema validator 실행
- `office/soffice.py`: sandbox 환경에 맞춘 LibreOffice 실행 wrapper
- `office/helpers/merge_runs.py`: adjacent run 병합
- `office/helpers/simplify_redlines.py`: tracked change 병합/author 추론
- `office/validators/*.py`: DOCX/PPTX/schema/redlining 검증 로직
- `templates/*.xml`: comment 관련 Word XML part template

## 핵심 규칙

- `docx-js`는 기본이 A4이므로 page size를 명시한다.
- bullet은 unicode bullet을 직접 넣지 않고 numbering config를 사용한다.
- table은 table width, columnWidths, cell width를 모두 맞춰야 한다.
- table width는 `WidthType.DXA`를 사용하고 percentage는 피한다.
- image에는 `type`과 altText를 명시한다.
- page break는 paragraph 안에 넣는다.
- TOC heading은 `HeadingLevel`을 사용하고 heading style에는 outlineLevel이 필요하다.
- tracked change는 `<w:r>` 내부에 억지로 넣지 않고 run 전체를 `<w:del>`/`<w:ins>` sibling으로 교체한다.

## 산출물 특성

- 새 `.docx` 문서
- 편집된 `.docx`
- tracked changes가 포함된 문서
- comments/replies가 포함된 문서
- clean accepted-change 문서
- Markdown/text 추출 결과 또는 XML unpack directory

## 주의점

- `.docx`는 ZIP + XML 구조이므로 포맷 규칙을 어기면 파일이 깨진다.
- XML namespace를 망가뜨리는 임의 parser나 무차별 문자열 조작을 피해야 한다.
- smart quote는 XML entity로 넣는 것이 안전하다.
- pack 단계 validation이 실패하면 자동 repair 범위를 넘어선 schema/nesting/relationship 문제를 직접 고쳐야 한다.
