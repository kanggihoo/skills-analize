# pdf 분석

## 원본

- 원본 경로: `.agents/skills/pdf/`
- 핵심 파일: `SKILL.md`
- 보조 파일: `forms.md`, `reference.md`, `scripts/`
- 확인한 규모: 12개 파일, 약 1,849줄
- 성격: PDF 읽기, 생성, 변환, 병합, 분할, OCR, form filling을 처리하는 문서 처리 스킬

## 적용 조건

사용자가 `.pdf` 파일을 언급하거나 PDF를 읽기, 추출, 결합, 분할, 회전, watermark, 생성, form filling, 암호화/복호화, 이미지 추출, OCR, searchable PDF 변환 등을 요청할 때 사용한다.

## 동작 과정

1. PDF 작업 유형을 분류한다.
   읽기/텍스트 추출, table extraction, merge/split/rotate, create PDF, OCR, form filling 중 무엇인지 정한다.

2. 기본 작업은 Python library 또는 CLI tool로 처리한다.
   `pypdf`, `pdfplumber`, `reportlab`, `pdftotext`, `qpdf`, `pdftk`, `pdfimages` 등이 사용된다.

3. table extraction은 `pdfplumber`를 우선 고려한다.
   필요하면 pandas로 DataFrame을 만들고 xlsx로 내보낸다.

4. PDF 생성은 ReportLab canvas 또는 Platypus를 사용한다.
   subscript/superscript는 Unicode 문자를 쓰지 않고 ReportLab markup tag를 사용한다.

5. scanned PDF는 image 변환 후 OCR한다.
   `pdf2image`와 `pytesseract` 흐름을 사용한다.

6. fillable form이면 먼저 field 정보를 추출하고 값 JSON을 만든 뒤 fill script로 채운다.

7. non-fillable form이면 구조 추출 또는 이미지 좌표 추정으로 annotation을 추가한다.

8. 출력 PDF를 다시 image로 변환해 placement를 검증한다.

## 보조 스크립트 역할

- `check_fillable_fields.py`: PDF가 fillable field를 갖는지 확인
- `extract_form_field_info.py`: fillable field id, page, rect, type, checkbox/radio/choice option 추출
- `fill_fillable_fields.py`: field_values JSON으로 실제 fillable field 채우기
- `extract_form_structure.py`: non-fillable form의 text label, line, checkbox, row boundary 추출
- `check_bounding_boxes.py`: fields.json의 bbox overlap과 font size 대비 box 크기 검증
- `fill_pdf_form_with_annotations.py`: annotation 방식으로 non-fillable PDF에 텍스트 삽입
- `convert_pdf_to_images.py`: PDF 페이지를 이미지로 변환
- `create_validation_image.py`: field bbox 검증용 이미지 생성

## 핵심 규칙

- form filling은 `forms.md`의 순서를 지켜야 한다.
- fillable field가 있는지 먼저 확인한다.
- non-fillable form은 구조 기반 좌표를 먼저 시도하고, 안 되면 visual estimation으로 fallback한다.
- bbox는 채우기 전에 반드시 검증한다.
- ReportLab built-in font에는 Unicode subscript/superscript glyph가 없으므로 markup tag를 사용한다.
- 좌표계가 PDF coordinates인지 image coordinates인지 명확히 구분한다.

## 산출물 특성

- 추출된 text/table
- 병합/분할/회전/워터마크/암호화 PDF
- 새로 생성된 PDF
- OCR text 또는 searchable 처리 결과
- filled PDF form
- 검증용 page image

## 주의점

- PDF form filling은 좌표 오차가 가장 큰 위험이다. zoom refinement와 validation image가 중요하다.
- scanned PDF는 text extraction이 실패할 수 있으므로 OCR fallback이 필요하다.
- 큰 PDF는 streaming/chunk processing을 고려해야 한다.
- encrypted/corrupted PDF는 qpdf repair/decrypt 절차가 필요할 수 있다.
