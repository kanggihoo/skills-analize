---
name: docx
description: "사용자가 Word 문서(.docx 파일)나 Word 템플릿(.dotx 파일)을 만들거나, 읽거나, 편집하거나, 가공하려 할 때 이 스킬을 사용한다. 트리거는 'Word doc', 'word document', '.docx', '.dotx' 같은 표현이 나오는 경우 전부이며, 목차, 제목, 페이지 번호, 레터헤드 같은 서식을 갖춘 문서를 요청하는 경우도 포함한다. .docx 또는 .dotx 파일에서 내용을 추출하거나 재구성할 때, 문서의 이미지를 삽입하거나 교체할 때, Word 파일에서 찾기 및 바꾸기를 수행할 때, 변경 내역(tracked changes)이나 주석을 다룰 때, 내용을 잘 다듬어진 Word 문서로 변환할 때도 사용한다. '보고서', '메모', '편지', '템플릿' 같은 산출물을 Word나 .docx 파일로 달라고 하면 이 스킬을 쓴다. PDF, 스프레드시트, Google Docs, 문서 생성과 무관한 일반 코딩 작업에는 사용하지 않는다."
license: Complete terms in LICENSE.txt
---

# DOCX 생성, 편집, 분석

`.docx`는 XML 파일을 묶은 ZIP 아카이브다. 작업 종류에 따라 접근 방식을 고른다.

| 작업 | 접근 방식 |
|---|---|
| **생성**: 새 문서 만들기 | `docx`(npm) 스크립트를 작성한다. 아래 주의사항을 참고한다 |
| **편집**: 기존 문서 수정하기 | `unzip`으로 풀고 `word/document.xml`을 고친 뒤 `zip`으로 다시 묶는다 (docx-js는 기존 파일을 열 수 없다) |
| **읽기**: 내용 확인하기 | `pandoc -t markdown file.docx` |

> 아래 스크립트 경로는 이 스킬 디렉터리 기준 상대 경로다.

## docx-js로 생성할 때 주의사항

`docx`는 미리 설치되어 있다. `npm install`부터 실행하지 말고 스크립트를 쓴 뒤 `require('docx')`를 바로 호출한다. 그 require가 실패할 때만 `npm install docx`를 실행한다. API는 모델이 이미 알고 있으므로, 여기에는 실수하기 쉬운 부분만 적었다.

- **페이지 크기 기본값은 A4다.** US Letter가 필요하면 `page: { size: { width: 12240, height: 15840 } }`로 설정한다(DXA 단위이며 1440 = 1인치).
- **가로 방향:** 세로 기준 치수를 넣고 `orientation: PageOrientation.LANDSCAPE`를 지정한다. docx-js가 가로/세로 값을 내부에서 바꿔 준다.
- **표는 너비를 두 곳에 지정한다:** 표에 `columnWidths`를, 모든 셀에 `width`를 `WidthType.DXA`로 설정한다. PERCENTAGE는 Google Docs에서 깨진다. 열 너비의 합은 표 너비와 같아야 한다.
- **표 배경색:** `SOLID`가 아니라 `ShadingType.CLEAR`를 쓴다. `SOLID`를 쓰면 검은색으로 렌더링된다.
- **목록:** `•` 문자를 직접 넣지 않는다. `numbering` 설정에 `LevelFormat.BULLET`을 사용한다.
- **`ImageRun`에는 `type:`이 필요하다**(`"png"`, `"jpg"` 등).
- **`PageBreak`는 `Paragraph` 안에 넣는다.**
- **`\n`은 쓰지 않는다.** 줄이 나뉘어야 하면 별도의 `Paragraph` 요소를 만든다.
- **목차(TOC):** 제목은 내장 `HeadingLevel.*`을 써야 한다. 커스텀 제목 스타일은 `outlineLevel`을 설정하지 않으면 목차에 나타나지 않는다.
- **표를 가로줄 대용으로 쓰지 않는다.** 대신 문단의 하단 테두리(bottom border)를 쓴다.
- **점선 리더(dot leader)나 같은 줄 오른쪽 정렬:** `.` 문자나 공백으로 채우지 말고, `TextRun` 안에 `PositionalTab`(`alignment: PositionalTabAlignment.RIGHT`, `leader: PositionalTabLeader.DOT`)을 쓴다.

## 출력물 검증

`.docx`를 작성한 뒤에는 렌더링해서 직접 확인한다.

```bash
python scripts/office/soffice.py --headless --convert-to pdf output.docx
pdftoppm -jpeg -r 100 output.pdf page
ls page-*.jpg   # 그다음 Read로 이미지 확인
```

`pdftoppm`은 페이지 번호를 총 페이지 수의 자릿수에 맞춰 앞에 0을 붙인다(`page-01.jpg`…`page-12.jpg`).

## 기존 문서 편집

구형 `.doc` 파일은 먼저 변환해야 한다: `python scripts/office/soffice.py --headless --convert-to docx file.doc`.

```bash
unzip -q doc.docx -d unpacked/
find unpacked -type l -delete   # 심볼릭 링크 항목 제거 — 외부에서 받은 docx는 신뢰할 수 없다
python scripts/merge_runs.py unpacked/   # 쪼개진 run을 합쳐 텍스트를 검색할 수 있게 한다
# unpacked/word/document.xml을 제자리에서 편집한다 — 서식을 다시 맞추거나 pretty-print 하지 않는다
(cd unpacked && rm -f ../out.docx && zip -Xr ../out.docx .)
python scripts/office/validate.py out.docx --original doc.docx   # XSD 검사. --auto-repair로 흔한 문제를 자동 수정
# 변경 내역 추적(redlining)이라면 --author "<redline에 쓴 이름>"을 추가해 모든 수정이 추적됐는지 확인
```

Word는 텍스트를 여러 `<w:r>` run으로 쪼갠다(revision id, 맞춤법 검사 표시 등). 그래서 문서에서 보이는 구절이 XML에서는 연속된 문자열로 존재하지 않는 경우가 많다. `merge_runs.py`는 `word/document.xml`에서 서식이 같은 인접 run을 내용이나 렌더링을 바꾸지 않고 합친다. `.docx` 파일을 직접 넘겨도 된다(`python scripts/merge_runs.py doc.docx -o merged.docx`).

**변경 내역 추적(Tracked changes):** redlining을 할 때는 `--author "<redline에 쓴 이름>"`을 붙여 검증한다(`--original` 필요). 이 옵션은 `<w:ins>`/`<w:del>`로 감싸지 않은 텍스트 변경을 모두 보고한다. 이런 실수는 쉽게 일어나고, 변경을 수락한 뷰에서는 보이지 않는다. run은 `w:id`, `w:author`, `w:date` 속성을 가진 `<w:ins>`/`<w:del>`로 감싼다. `<w:del>` 안에서 텍스트 요소는 `<w:t>`가 아니라 `<w:delText>`다. 삭제된 문단 기호(`<w:pPr><w:rPr><w:del w:id=".." w:author=".." w:date=".."/></w:rPr></w:pPr>`)는 "이 문단을 다음 문단에 병합"한다는 뜻이다. 따라서 문단 전체를 삭제하려면 이 표시에 더해 모든 run을 `<w:del>`로 감싸야 한다. `<w:del/>`은 rPr의 다른 자식 요소보다 앞에 와야 한다. 순서는 스키마로 강제된다.

변경 내역을 모두 수락한 깨끗한 사본은 `python scripts/accept_changes.py in.docx out.docx`로 만든다.

삭제된 문단 기호를 수락하면 그 문단은 아래 문단과 합쳐져야 한다. 따라서 run이 *전부* 삭제된 문단은 사라진다. Word는 이렇게 처리한다. 하지만 `accept_changes.py`와 `pandoc --track-changes=accept`는 항상 그렇지 않다. 두 도구 모두 같은 방식으로 실패한다. 삭제된 텍스트는 지우지만, 비어 버린 문단을 남긴다. 그 문단이 자동 번호 매기기 목록이었다면 빈 글머리 기호로 보인다.

- `pandoc --track-changes=accept`는 문단을 절대 합치지 않는다.
- `accept_changes.py`(LibreOffice 기반)는 대부분 제대로 합치지만, 삭제된 문단 뒤에 빈 간격용 문단이 오면 합치지 못한다.

두 뷰 중 어느 쪽에서든 보이는 빈 글머리 기호는 그 뷰의 부작용이지 문서의 결함이 아니다. 문단 삭제는 XML에서 확인한다.

## 주석

주석은 서로 연결된 파일 여섯 개가 필요하다. `document.xml`도 함께 편집할 거라면 디렉터리 모드를 쓴다. 압축을 풀고 다시 묶는 단계를 줄일 수 있다. 그렇지 않으면 `.docx` 직접 모드를 쓴다.

```bash
# 이미 압축 해제된 디렉터리 기준 (마커도 함께 넣을 때 권장)
python scripts/comment.py unpacked/ "Fees & expenses cap is too low"
python scripts/comment.py unpacked/ "Agreed" --parent 0

# .docx 파일을 직접 대상으로 할 때
python scripts/comment.py contract.docx "This cap is too low" -o annotated.docx
```

스크립트는 `comments.xml`, `commentsExtended.xml`, `commentsIds.xml`, `commentsExtensible.xml`, 관계(relationship) 정의, 콘텐츠 타입 재정의를 작성한다. 주석 ID는 자동으로 붙는다. 그다음 `word/document.xml`에 추가할 `<w:commentRangeStart>`/`<w:commentRangeEnd>`/`<w:commentReference>` 스니펫을 출력한다. 이 마커를 넣기 전까지는 주석이 존재하지만 보이지 않는다.

## 의존성

`docx`(npm, 미리 설치됨 — `require('docx')`가 실패할 때만 설치) · `pandoc` · LibreOffice(`soffice`) · `pdftoppm`(Poppler)
