---
name: docx
description: "사용자가 Word 문서(.docx 파일)나 Word 템플릿(.dotx 파일)을 만들거나, 읽거나, 편집하거나, 조작하려고 할 때 이 스킬을 사용합니다. 'Word doc', 'word document', '.docx', '.dotx' 언급이나, 목차·제목·페이지 번호·레터헤드 같은 서식을 갖춘 전문 문서를 만들어 달라는 요청이 트리거입니다. .docx나 .dotx 파일에서 내용을 추출하거나 재구성할 때, 문서의 이미지를 삽입하거나 교체할 때, Word 파일에서 찾기 및 바꾸기를 수행할 때, 변경 내용 추적(tracked changes)이나 댓글을 다룰 때, 내용을 다듬어진 Word 문서로 변환할 때도 사용합니다. 사용자가 '보고서', '메모', '편지', '템플릿' 같은 결과물을 Word나 .docx 파일로 원하면 이 스킬을 사용합니다. PDF, 스프레드시트, Google Docs, 문서 생성과 무관한 일반 코딩 작업에는 사용하지 않습니다."
license: Complete terms in LICENSE.txt
---

# DOCX 생성, 편집, 분석

`.docx`는 XML 파일들을 묶은 ZIP 아카이브입니다. 작업에 따라 접근 방법을 고릅니다.

| 작업 | 접근 방법 |
|---|---|
| 새 문서 **생성** | `docx`(npm) 스크립트를 작성합니다. 아래 주의사항을 참고하세요 |
| 기존 문서 **편집** | `unzip` → `word/document.xml` 편집 → `zip` (docx-js는 기존 파일을 열 수 없습니다) |
| 내용 **읽기** | `pandoc -t markdown file.docx` |

> 아래 스크립트 경로는 이 스킬 디렉터리 기준입니다.

## docx-js로 생성할 때 주의사항

`docx`는 미리 설치되어 있으므로 `npm install`을 먼저 실행하지 말고, 스크립트를 쓰고 `require('docx')`를 바로 호출합니다. 그 require가 실패할 때만 `npm install docx`를 실행합니다. API는 모델이 이미 알고 있으니, 여기서는 실수하기 쉬운 부분만 정리합니다.

- **페이지 크기 기본값은 A4입니다.** US Letter를 쓰려면 `page: { size: { width: 12240, height: 15840 } }`로 지정합니다(단위는 DXA, 1440 = 1인치).
- **가로 방향:** 세로 방향 치수를 넘기고 `orientation: PageOrientation.LANDSCAPE`를 지정합니다. docx-js가 너비와 높이를 내부에서 바꿔 줍니다.
- **표는 너비를 두 곳에 지정해야 합니다.** 표에 `columnWidths`를, 모든 셀에 `width`를 설정하고, 둘 다 `WidthType.DXA`를 씁니다(PERCENTAGE는 Google Docs에서 깨집니다). 열 너비의 합은 표 너비와 같아야 합니다.
- **표 배경색:** `ShadingType.SOLID`는 쓰지 말고 `ShadingType.CLEAR`를 씁니다(SOLID는 검은색으로 렌더링됩니다).
- **목록:** `•` 문자를 직접 넣지 말고, `LevelFormat.BULLET`을 쓰는 `numbering` 설정을 사용합니다.
- **`ImageRun`에는 `type:`이 필요합니다**(`"png"`, `"jpg"` 등).
- **`PageBreak`는 `Paragraph` 안에 있어야 합니다.**
- **`\n`은 쓰지 않습니다.** 줄을 나누려면 별도의 `Paragraph` 요소를 사용합니다.
- **목차(TOC):** 제목에는 내장 `HeadingLevel.*`을 써야 합니다. 커스텀 제목 스타일은 `outlineLevel`을 설정해야 목차에 나타납니다.
- **표를 가로선 대신 쓰지 마세요.** 대신 문단의 아래쪽 테두리를 사용합니다.
- **점선 리더(dot leader)와 같은 줄 우측 정렬:** 리터럴 `.`이나 공백으로 채우지 말고, `TextRun` 안에 `PositionalTab`(`alignment: PositionalTabAlignment.RIGHT`, `leader: PositionalTabLeader.DOT`)을 넣습니다.

## 결과물 검증

`.docx`를 작성한 뒤에는 렌더링해서 직접 확인합니다.

```bash
python scripts/office/soffice.py --headless --convert-to pdf output.docx
pdftoppm -jpeg -r 100 output.pdf page
ls page-*.jpg   # 그다음 이미지를 Read로 읽습니다
```

`pdftoppm`은 페이지 번호를 총 페이지 수의 자릿수에 맞춰 0으로 채웁니다(`page-01.jpg`…`page-12.jpg`).

## 기존 문서 편집

구형 `.doc` 파일은 먼저 변환해야 합니다: `python scripts/office/soffice.py --headless --convert-to docx file.doc`.

```bash
unzip -q doc.docx -d unpacked/
find unpacked -type l -delete   # 심볼릭 링크 항목을 제거합니다. 외부에서 받은 docx는 신뢰할 수 없습니다
python scripts/merge_runs.py unpacked/   # 쪼개진 run을 합쳐서 텍스트를 검색할 수 있게 합니다
# unpacked/word/document.xml을 제자리에서 편집합니다. 서식을 다시 맞추거나 pretty-print하지 마세요
(cd unpacked && rm -f ../out.docx && zip -Xr ../out.docx .)
python scripts/office/validate.py out.docx --original doc.docx   # XSD 검사. --auto-repair는 흔한 문제를 고칩니다
# 변경 추적(redlining)을 한다면 --author "<redline에 사용한 이름>"을 추가해서 모든 수정이 추적되었는지 확인합니다
```

Word는 텍스트를 여러 `<w:r>` run으로 나눠 저장합니다(수정 ID, 맞춤법 검사 표시 등). 그래서 문서에서 보이는 구절이 XML에서는 연속된 문자열로 존재하지 않는 경우가 많습니다. `merge_runs.py`는 내용이나 렌더링을 바꾸지 않고, 서식이 같은 인접 run들을 `word/document.xml`에서 합칩니다. `.docx` 파일을 직접 넘겨도 됩니다(`python scripts/merge_runs.py doc.docx -o merged.docx`).

**변경 내용 추적(Tracked changes):** redline을 작성할 때는 `--author "<redline에 사용한 이름>"`을 붙여 검증합니다(`--original`이 필요합니다). 그러면 `<w:ins>`/`<w:del>`로 감싸지 않은 텍스트 변경을 보고합니다. 이런 실수는 쉽게 일어나고, 수락된 보기(accepted view)에서는 보이지 않습니다. run은 `w:id`, `w:author`, `w:date` 속성을 가진 `<w:ins>`/`<w:del>`로 감쌉니다. `<w:del>` 안에서는 텍스트 요소가 `<w:t>`가 아니라 `<w:delText>`입니다. 삭제된 문단 기호(`<w:pPr><w:rPr><w:del w:id=".." w:author=".." w:date=".."/></w:rPr></w:pPr>`)는 "이 문단을 다음 문단과 병합한다"는 뜻입니다. 따라서 문단 전체를 삭제하려면 이것에 더해 모든 run을 `<w:del>`로 감싸야 합니다. `<w:del/>`은 rPr의 다른 자식 요소보다 앞에 와야 합니다. 이 순서는 스키마가 강제합니다.

모든 변경 내용을 수락한 깨끗한 사본은 `python scripts/accept_changes.py in.docx out.docx`로 만듭니다.

삭제된 문단 기호를 수락하면, 그 문단은 아래 문단과 합쳐져야 합니다. 그래서 run이 *전부* 삭제된 문단은 사라져야 합니다. Word는 이렇게 동작합니다. 하지만 `accept_changes.py`와 `pandoc --track-changes=accept`는 항상 그렇게 하지는 않습니다. 두 도구 모두 같은 방식으로 실패합니다. 삭제된 텍스트는 지우지만, 비어 버린 문단을 남깁니다. 이 문단이 자동 번호 매기기가 적용된 목록이었다면, 빈 글머리 기호처럼 보입니다.

- `pandoc --track-changes=accept`는 문단을 절대 합치지 않습니다.
- `accept_changes.py`(LibreOffice)는 대부분 올바르게 합칩니다. 다만 삭제된 문단 바로 뒤에 빈 간격용 문단이 있으면 합치지 못합니다.

두 보기 중 어느 쪽에서든 보이는 빈 글머리 기호는 보기 방식이 만든 결과물이지, 문서의 결함이 아닙니다. 문단 삭제는 XML에서 직접 확인하세요.

## 댓글

댓글 하나에는 서로 연결된 파일 여섯 개가 필요합니다. 헬퍼 스크립트를 사용합니다. `document.xml`도 함께 편집할 예정이면 디렉터리 모드를 쓰고(unzip/rezip 과정을 한 번 줄일 수 있습니다), 그렇지 않으면 `.docx` 직접 모드를 씁니다.

```bash
# 이미 압축 해제된 디렉터리 대상(마커도 함께 배치할 때 권장)
python scripts/comment.py unpacked/ "Fees & expenses cap is too low"
python scripts/comment.py unpacked/ "Agreed" --parent 0

# .docx 파일 직접 대상
python scripts/comment.py contract.docx "This cap is too low" -o annotated.docx
```

스크립트는 `comments.xml`, `commentsExtended.xml`, `commentsIds.xml`, `commentsExtensible.xml`, 관계 정의, content-type 오버라이드를 작성합니다. 댓글 ID는 자동으로 할당됩니다. 이후 스크립트는 댓글이 특정 텍스트에 연결되도록 `word/document.xml`에 추가할 `<w:commentRangeStart>`/`<w:commentRangeEnd>`/`<w:commentReference>` 스니펫을 출력합니다. 이 마커를 배치하기 전까지 댓글은 존재하지만 보이지 않습니다.

## 의존성

`docx`(npm, 미리 설치됨. `require('docx')`가 실패할 때만 설치) · `pandoc` · LibreOffice(`soffice`) · `pdftoppm`(Poppler)
