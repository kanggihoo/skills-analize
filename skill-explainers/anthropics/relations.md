# anthropics 관계 원장
분석 커밋: b825733a707f8debae1a9b5d6e4e796c343b8ae1

- 범위: `anthropics/` 아래 `SKILL.md` 4개(`docx`, `pdf`, `pptx`, `xlsx`). 원격 출처는 `anthropics/skills-lock.json`이며 4개 모두 `anthropics/skills` 저장소 `main`의 `skills/<이름>/SKILL.md`다.
- **커밋 상태**: `anthropics/`는 분석 시작 때 한 번도 커밋되지 않은 상태(`?? anthropics/`)였다. `@source path=`가 커밋된 원문을 요구해서, 사용자 승인을 받아 `anthropics/`만 local commit(`b825733`)했다. push는 하지 않았다.
- 번역본: 분석 시작 시점에는 없다. 2단계 작업으로 `.ko.md` 번역본을 새로 만들지만 분석 근거는 원본이다.
- 원문 비교: 이 4개와 이름이 같은 스킬은 다른 컬렉션에 없다(`SKILL.md` frontmatter `name`을 grep으로 확인). 컬렉션 안에서는 `docx`·`pptx`·`xlsx`의 `scripts/office/` 폴더 전체가 `diff -rq` 결과 동일하다(`validate.py` 9b4a36b6…, `soffice.py` 623cfa7c… 모두 shasum 같음). 같은 파일이 세 스킬에 각각 들어 있다.
- 대문자 불일치: `pdf/SKILL.md`는 `REFERENCE.md`, `FORMS.md`를 읽으라고 하지만 실제 파일은 `pdf/reference.md`, `pdf/forms.md`(소문자)다. 대소문자를 구분하는 파일시스템에서는 지시한 이름으로 열리지 않는다. 지시상 대상은 이 두 파일로 해석한다.
- 바이너리: 없음. `scripts/office/schemas/` 아래 XSD 파일들은 텍스트지만 거대한 생성 데이터라 구조·표본만 확인한다.

## 스킬

| 경로 ID | 한 줄 요약 | 조사 상태 | 원문 비교 | 소속 묶음 | 역할 |
|---|---|---|---|---|---|
| anthropics/docx | Word 문서(.docx·.dotx)를 만들고, XML을 직접 고쳐 편집하고, 변경 추적·댓글을 다룬다 | 완료 | - | office-ooxml | 변형 |
| anthropics/pdf | PDF를 읽고 합치고 나누고 만들고 양식을 채운다 | 완료 | - | - | 단계 |
| anthropics/pptx | 슬라이드 덱(.pptx·.potx)을 만들고 템플릿을 편집하고 디자인 품질을 점검한다 | 완료 | - | office-ooxml | 변형 |
| anthropics/xlsx | 스프레드시트(.xlsx·.csv 등)를 만들고 고치고 수식을 재계산해 검증한다 | 완료 | - | office-ooxml | 변형 |

## 관계

출처 표기는 `스킬폴더/파일:줄`이다. 파일을 생략하면 그 스킬의 `SKILL.md`다. 작업 트리 기준 줄 번호다.

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r01 | docx | pptx | 공유 상태 | 추론 | 두 스킬이 `scripts/office/`(`validate.py`, `soffice.py`, `validators/`, `helpers/`, `schemas/`) 사본을 각자 갖고 있다. 폴더 전체가 `diff -rq`로 동일하다. 어느 SKILL.md도 상대를 부르지 않는다. 같은 파일의 사본이지 같은 경로를 읽고 쓰는 것은 아니다 | `scripts/office/` 도구 사본 | 파일 | 범위 내 | docx:40,57; pptx:26-27 |
| r02 | docx | xlsx | 공유 상태 | 추론 | r01과 같다. xlsx `SKILL.md`는 `scripts/office/validate.py` 등을 실행하라고 지시하지 않는다(99줄 의존성 설명에서 `soffice.py`만 언급). 다만 `scripts/recalc.py`가 `office.soffice`를 import해 쓰고, `validate.py`는 xlsx 계열 파일을 받으면 검증 없이 "recalc.py를 쓰라"는 안내만 내고 종료 코드 0으로 끝난다 | `scripts/office/` 도구 사본 | 파일 | 범위 내 | docx:40,57; xlsx:99; xlsx/scripts/recalc.py:19; xlsx/scripts/office/validate.py:142-148 |
| r03 | pptx | xlsx | 공유 상태 | 추론 | r02와 같다(xlsx 쪽 사실은 r02 참고) | `scripts/office/` 도구 사본 | 파일 | 범위 내 | pptx:26-27; xlsx:99; xlsx/scripts/recalc.py:19 |
| r04 | docx | pdf | 같은 계열 | 명시-역할 | docx description이 "Do NOT use for PDFs, spreadsheets, Google Docs"라고 활성화 범위에서 PDF·스프레드시트를 뺀다. 경계 선언이며 호출 지시는 아니다. pdf 쪽에는 docx를 뺀다는 문장이 없다(한쪽만 선언) | - | - | 범위 내 | docx:3 |
| r05 | docx | xlsx | 같은 계열 | 명시-역할 | docx description은 스프레드시트를, xlsx description은 "Word document"를 서로 활성화 범위에서 뺀다("Do NOT trigger when the primary deliverable is a Word document"). 경계 선언이다 | - | - | 범위 내 | docx:3; xlsx:3 |
| r06 | docx | pptx | 산출물 호환 | 미확인 | docx와 pptx 모두 `soffice.py`로 PDF를 만들고 `pdftoppm`으로 이미지를 뽑아 눈으로 확인하는 같은 시각 점검 절차를 쓴다. 두 스킬이 서로의 산출물을 입력으로 쓴다는 문장은 없다 | - | - | 불명 | docx:37-45; pptx:226-232 |
| r07 | pdf | xlsx | 참고 | 미확인 | pdf 예제가 `pdfplumber`로 뽑은 표를 `to_excel("extracted_tables.xlsx")`로 저장한다. xlsx 스킬을 부르라는 문장은 없고 pandas 예제일 뿐이다 | 추출한 표 → .xlsx 파일 | 파일 | 불명 | pdf:118 |
| r08 | pdf | pdf (같은 폴더 `reference.md`) | 참고 | 명시-이름 | "고급 기능은 REFERENCE.md를 보라" 안내가 네 곳에 있다. 실제 파일 이름은 소문자 `reference.md`다 | - | - | 범위 내 | pdf:11,311-314; pdf/reference.md:1 |
| r09 | pdf | pdf (같은 폴더 `forms.md`) | 넘김 | 명시-이름 | "PDF 양식을 채워야 하면 FORMS.md 지시를 따르라"는 명령형이다. 실제 파일 이름은 소문자 `forms.md`다 | 양식 PDF·필드 정보 | 파일 | 범위 내 | pdf:307,313; pdf/forms.md:1 |

## 묶음

| group-id | 작업 목표 | 구성 스킬과 역할 | 그림 |
|---|---|---|---|
| office-ooxml | Office 문서(Word·PowerPoint·Excel)를 ZIP+XML 구조로 다루며 만들기·편집·검증·시각 점검까지 한다. 세 스킬은 파일 형식만 다른 변형이고 순서는 없다 | docx(변형), pptx(변형), xlsx(변형) | 표 + 공유 도구 `@tree` |
