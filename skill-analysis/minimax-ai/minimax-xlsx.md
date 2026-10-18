# minimax-xlsx 분석

## 원본

- 경로: `.agents/skills/minimax-xlsx/SKILL.md`
- 성격: Excel/스프레드시트 읽기, 생성, 편집, 공식 검증 스킬
- 주요 도구: XML unpack/edit/pack, pandas, xlsx_reader, formula_check

## 적용 조건

`.xlsx`, `.xlsm`, `.csv`, `.tsv`, Excel, pivot table, financial model, formula, tabular data 생성/수정/분석/검증 요청에 사용한다.

## 동작 과정

1. 작업을 라우팅한다.
   READ, CREATE, EDIT, FIX, VALIDATE 중 하나를 선택한다.

2. READ는 원본을 수정하지 않는다.
   `xlsx_reader.py`로 구조를 파악하고 pandas로 분석한다. 소수점 자리 요구가 있으면 모든 숫자에 일관되게 적용한다.

3. CREATE는 minimal XML template을 복사해 만든다.
   `templates/minimal_xlsx/`를 복사하고 XML을 직접 수정한 뒤 `xlsx_pack.py`로 묶는다.

4. 계산값은 반드시 Excel formula로 둔다.
   파생값을 하드코딩하지 않고 `<f>SUM(...)</f>` 같은 formula node로 작성한다.

5. EDIT는 기존 파일을 XML로 직접 수정한다.
   새 `Workbook()`을 만들지 않는다. unpack -> edit -> pack 흐름으로 원본 sheet, data, style을 보존한다.

6. 행/열 삽입은 helper script를 쓴다.
   열 추가는 `xlsx_add_column.py`, 행 삽입은 `xlsx_insert_row.py`를 사용한다. row는 prompt의 숫자만 믿지 말고 label text로 실제 XML row를 찾는다.

7. FIX는 깨진 formula node를 고친다.
   이 역시 EDIT task이므로 원본 구조를 보존한다.

8. VALIDATE는 static/dynamic 검증을 한다.
   `formula_check.py`와 가능하면 `libreoffice_recalc.py`를 사용한다.

## 핵심 규칙

- sub-agent를 spawn하지 않는다.
- 항상 사용자가 요청한 output file을 작성한다.
- EDIT에서 openpyxl round-trip을 쓰지 않는다.
- 기존 파일 수정 시 sheet 이름, 데이터, 스타일을 보존한다.
- output 저장 후 `xlsx_reader.py` 또는 pandas로 원본 데이터 샘플이 보존됐는지 확인한다.
- hard-coded input은 파란색, formula는 검정, cross-sheet formula는 초록색을 적용한다.
- `formula_check.py` exit code 0이 안전 기준이다.

## 산출물 특성

결과물은 실제 Excel 파일이며, 특히 기존 파일 편집에서는 zero format loss를 목표로 한다. XML 수준에서 직접 조작해 VBA, pivot, sparkline 손상을 피하는 구조다.

## 주의점

Excel XML은 sheet relation, sharedStrings, style index가 얽혀 있다. 단순히 workbook을 새로 만들면 사용자가 기대한 기존 파일이 사라지므로, EDIT에서는 반드시 unpack/edit/pack을 사용해야 한다.
