# anthropics/pptx 읽은 파일 목록

분석 커밋: b825733a707f8debae1a9b5d6e4e796c343b8ae1
`anthropics/pptx/` 아래 텍스트 파일 56개, 합계 1,149,051B. 바이너리는 없다. 스크립트는 실행하지 않았다.

- 끝까지 읽음: 16개, 160,781B (`scripts/__init__.py`는 0B 빈 파일).
- 구조·표본만 확인(전부 읽지 않음): 40개, 988,270B. `LICENSE.txt` 1개(Apache License 2.0 표준 텍스트, 앞부분만 확인)와 `scripts/office/schemas/` XSD 39개(976,913B).

## 끝까지 읽음 (16개)

| 경로 | 바이트 | 역할 |
|---|---:|---|
| `anthropics/pptx/SKILL.md` | 20782 | 본문. 접근 선택, pptxgenjs 함정, 템플릿 편집, 디자인 규칙, QA |
| `anthropics/pptx/scripts/__init__.py` | 0 | 빈 파일 |
| `anthropics/pptx/scripts/clean.py` | 10415 | 압축 푼 폴더에서 참조 안 되는 슬라이드·미디어·rels 삭제 |
| `anthropics/pptx/scripts/add_slide.py` | 14537 | 슬라이드 복제 또는 레이아웃에서 새 슬라이드, 등록 작업 |
| `anthropics/pptx/scripts/thumbnail.py` | 9802 | 슬라이드 썸네일 격자 이미지 |
| `anthropics/pptx/scripts/office/validate.py` | 6142 | OOXML 검증 진입점 |
| `anthropics/pptx/scripts/office/soffice.py` | 5927 | LibreOffice 실행 래퍼, 소켓 shim |
| `anthropics/pptx/scripts/office/validators/__init__.py` | 336 | 검증기 export |
| `anthropics/pptx/scripts/office/validators/base.py` | 33756 | 공통 검증 로직 |
| `anthropics/pptx/scripts/office/validators/pptx.py` | 15966 | pptx 전용 검증 순서와 검사 |
| `anthropics/pptx/scripts/office/validators/docx.py` | 17482 | docx 전용 검증(pptx 경로에서는 호출되지 않음) |
| `anthropics/pptx/scripts/office/validators/redlining.py` | 11231 | 변경 추적 검증(docx 전용) |
| `anthropics/pptx/scripts/office/helpers/__init__.py` | 3358 | 확장자 계열 표, 안전 압축 해제, 재압축 |
| `anthropics/pptx/scripts/office/helpers/pptx_chart.py` | 5862 | PowerPoint가 거부하는 chart 결함 탐지 |
| `anthropics/pptx/scripts/office/helpers/pptx_slide.py` | 1675 | 치명적인 slide XML 스키마 오류 선별 |
| `anthropics/pptx/scripts/office/helpers/pptx_theme.py` | 3510 | master가 theme를 공유하는 결함 탐지 |

## 구조·표본만 확인(전부 읽지 않음) (40개)

| 경로 | 바이트 | 확인한 범위 |
|---|---:|---|
| `anthropics/pptx/LICENSE.txt` | 11357 | 앞 12줄(Apache License 2.0 표준 머리말)만 |
| `anthropics/pptx/scripts/office/schemas/ISO-IEC29500-4_2016/` | 27개 | 파일 목록. `pml.xsd`(83,612B)는 머리 700B와 `presentation`·`sld`·`notesMasterIdLst`·`sldIdLst` 위치 grep. `dml-chart.xsd`, `dml-main.xsd`, `shared-documentPropertiesExtended.xsd`, `shared-documentPropertiesCustom.xsd`는 크기와 element 수만 |
| `anthropics/pptx/scripts/office/schemas/ecma/fouth-edition/` | 4개 | 파일 목록. `opc-contentTypes.xsd`는 머리 12줄, 나머지 둘은 크기와 element 수만 |
| `anthropics/pptx/scripts/office/schemas/mce/` | 1개 | `mc.xsd` 파일 이름만 |
| `anthropics/pptx/scripts/office/schemas/microsoft/` | 7개 | 파일 이름만. 모두 `wml-*` 계열이라 pptx 경로의 `SCHEMA_MAPPINGS`가 직접 쓰지 않는다 |

XSD 39개 합계 976,913B는 공개 표준에서 생성한 스키마 데이터다. `base.py`의 `SCHEMA_MAPPINGS`가 가리키는 파일 이름 8개가 실제로 있는지만 확인했다.
