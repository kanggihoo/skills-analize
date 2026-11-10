# docx 스킬은 에이전트를 어떻게 바꾸나 {#docx-skill}

`docx` 스킬을 쓰면 에이전트는 Word 문서 작업을 새로 만들기, 편집, 읽기 세 갈래로 나눠 각각 다른 도구를 쓴다. 새 문서는 `docx`(npm) 스크립트로 쓰고, 기존 문서는 압축을 풀어 `word/document.xml`을 직접 고치고, 읽기는 `pandoc`으로 한다.[](source:tbl) 만든 문서는 PDF로 렌더해 눈으로 확인하고, 편집한 문서는 `validate.py`로 검사한다.[](source:vf)[](source:ed)

- 켜지는 범위는 넓다. `description`은 `.docx`·`.dotx` 생성, 읽기, 편집, 변경 추적, 댓글, 이미지 교체, 찾아 바꾸기까지 든다. 반대로 PDF, 스프레드시트, Google Docs, 문서 생성과 무관한 코딩에는 쓰지 말라고 한다. `disable-model-invocation` 같은 호출 제한 필드는 원문에 명시 없음.[](source:fm)
- 강제와 금지는 docx-js 함정 목록과 편집 규칙에 모여 있다. `npm install` 먼저 금지, 표 셀마다 폭 지정, `ShadingType.SOLID` 금지, `\n` 금지, `document.xml` 서식 정리 금지 같은 항목이다.[](source:npm)[](source:gt)[](source:ed)
- 사람이 끼어드는 지점과 승인 절차는 원문에 명시 없음. 끝나는 조건도 따로 적지 않았고, 검사 스크립트가 `All validations PASSED!`를 찍는 것이 가장 가까운 종료 신호다.[](source:v4)
- 스크립트 코드를 읽었지만 실행해 보지는 않았다. 아래 동작은 모두 지시상 동작이고, 코드에서 어긋난 곳은 판정으로 표시했다.

@answer scope="텍스트 22개 · XSD 39개 표본 · 지시상 동작"
@meta locale=ko
@source fm title="SKILL.md · 6897B · frontmatter(name, description, license)" path=anthropics/docx/SKILL.md lines=1:5
@source tbl title="SKILL.md · 작업별 접근 표" path=anthropics/docx/SKILL.md lines=9:15
@source npm title="SKILL.md · docx는 사전 설치, npm install 먼저 금지" path=anthropics/docx/SKILL.md lines=21:21
@source gt title="SKILL.md · docx-js 함정 11개" path=anthropics/docx/SKILL.md lines=23:33
@source vf title="SKILL.md · 렌더해서 눈으로 확인" path=anthropics/docx/SKILL.md lines=35:45
@source ed title="SKILL.md · 기존 문서 편집 절차" path=anthropics/docx/SKILL.md lines=47:59
@source runs title="SKILL.md · run 조각화와 merge_runs.py" path=anthropics/docx/SKILL.md lines=61:61
@source trk title="SKILL.md · 변경 추적 규칙" path=anthropics/docx/SKILL.md lines=63:63
@source acc title="SKILL.md · 변경 수락과 빈 문단 한계" path=anthropics/docx/SKILL.md lines=65:72
@source cm title="SKILL.md · 댓글 helper" path=anthropics/docx/SKILL.md lines=74:87
@source dep title="SKILL.md · 의존 도구" path=anthropics/docx/SKILL.md lines=89:91
@source lic title="LICENSE.txt · 11357B · 라이선스(앞 3줄만 확인)" path=anthropics/docx/LICENSE.txt lines=1:3
@source sinit title="scripts/__init__.py · 1B · 빈 패키지 표지" path=anthropics/docx/scripts/__init__.py
@source cp1 title="scripts/comment.py · 14054B · 사용법과 ID 규칙" path=anthropics/docx/scripts/comment.py lines=1:23
@source cp2 title="scripts/comment.py · 관계·content type 보강" path=anthropics/docx/scripts/comment.py lines=164:232
@source cpm title="scripts/comment.py · marker 안내 문구" path=anthropics/docx/scripts/comment.py lines=49:70
@source cp3 title="scripts/comment.py · add_comment" path=anthropics/docx/scripts/comment.py lines=235:310
@source cp4 title="scripts/comment.py · 인자와 기본 작성자" path=anthropics/docx/scripts/comment.py lines=313:368
@source ac1 title="scripts/accept_changes.py · 4051B · 프로필 경로" path=anthropics/docx/scripts/accept_changes.py lines=16:17
@source ac2 title="scripts/accept_changes.py · 변환 실행과 제한 시간" path=anthropics/docx/scripts/accept_changes.py lines=36:88
@source mr1 title="scripts/merge_runs.py · 9398B · 목적과 범위" path=anthropics/docx/scripts/merge_runs.py lines=1:24
@source mr2 title="scripts/merge_runs.py · 합칠 수 있는 조건" path=anthropics/docx/scripts/merge_runs.py lines=195:203
@source tc title="scripts/templates/comments.xml · 2603B · 빈 comments 뼈대" path=anthropics/docx/scripts/templates/comments.xml
@source te title="scripts/templates/commentsExtended.xml · 2611B" path=anthropics/docx/scripts/templates/commentsExtended.xml
@source ti title="scripts/templates/commentsIds.xml · 2619B" path=anthropics/docx/scripts/templates/commentsIds.xml
@source tx title="scripts/templates/commentsExtensible.xml · 2707B" path=anthropics/docx/scripts/templates/commentsExtensible.xml
@source tp title="scripts/templates/people.xml · 115B · 빈 people 뼈대" path=anthropics/docx/scripts/templates/people.xml
@source v1 title="scripts/office/validate.py · 6142B · 사용법과 자동 수리 범위" path=anthropics/docx/scripts/office/validate.py lines=1:14
@source v2 title="scripts/office/validate.py · --author·--original 규칙" path=anthropics/docx/scripts/office/validate.py lines=54:106
@source v3 title="scripts/office/validate.py · 형식별 검사기 선택" path=anthropics/docx/scripts/office/validate.py lines=124:151
@source v4 title="scripts/office/validate.py · 수리와 종료 코드" path=anthropics/docx/scripts/office/validate.py lines=153:169
@source so1 title="scripts/office/soffice.py · 5927B · 목적" path=anthropics/docx/scripts/office/soffice.py lines=1:16
@source so2 title="scripts/office/soffice.py · run_soffice" path=anthropics/docx/scripts/office/soffice.py lines=27:46
@source so3 title="scripts/office/soffice.py · AF_UNIX shim" path=anthropics/docx/scripts/office/soffice.py lines=53:74
@source hp1 title="scripts/office/helpers/__init__.py · 3358B · 확장자와 형식 대응" path=anthropics/docx/scripts/office/helpers/__init__.py lines=10:17
@source hp2 title="scripts/office/helpers/__init__.py · safe_extract, rezip" path=anthropics/docx/scripts/office/helpers/__init__.py lines=74:111
@source vi title="scripts/office/validators/__init__.py · 336B" path=anthropics/docx/scripts/office/validators/__init__.py
@source dv1 title="scripts/office/validators/docx.py · 17482B · 검사 순서" path=anthropics/docx/scripts/office/validators/docx.py lines=27:67
@source dv2 title="scripts/office/validators/docx.py · 공백 보존 검사" path=anthropics/docx/scripts/office/validators/docx.py lines=69:113
@source dv3 title="scripts/office/validators/docx.py · del 안의 w:t, instrText 검사" path=anthropics/docx/scripts/office/validators/docx.py lines=115:164
@source dv4 title="scripts/office/validators/docx.py · ins 안의 delText 검사" path=anthropics/docx/scripts/office/validators/docx.py lines=205:244
@source dv5 title="scripts/office/validators/docx.py · 문단 수 비교" path=anthropics/docx/scripts/office/validators/docx.py lines=246:255
@source dv6 title="scripts/office/validators/docx.py · paraId·durableId 한도" path=anthropics/docx/scripts/office/validators/docx.py lines=260:314
@source dv7 title="scripts/office/validators/docx.py · 댓글 marker 짝 검사" path=anthropics/docx/scripts/office/validators/docx.py lines=316:402
@source dv8 title="scripts/office/validators/docx.py · durableId 수리" path=anthropics/docx/scripts/office/validators/docx.py lines=404:462
@source rl1 title="scripts/office/validators/redlining.py · 11231B · 범위(본문만)" path=anthropics/docx/scripts/office/validators/redlining.py lines=1:12
@source rl2 title="scripts/office/validators/redlining.py · 추적 안 된 편집 판정" path=anthropics/docx/scripts/office/validators/redlining.py lines=38:88
@source rl3 title="scripts/office/validators/redlining.py · 실패 원인 안내" path=anthropics/docx/scripts/office/validators/redlining.py lines=151:179
@source b1 title="scripts/office/validators/base.py · 33756B · 무시 오류 패턴" path=anthropics/docx/scripts/office/validators/base.py lines=26:29
@source b2 title="scripts/office/validators/base.py · 고유 ID 요구 목록" path=anthropics/docx/scripts/office/validators/base.py lines=31:47
@source b3 title="scripts/office/validators/base.py · 파일 참조 검사" path=anthropics/docx/scripts/office/validators/base.py lines=310:406
@source b4 title="scripts/office/validators/base.py · XSD 검사와 원본 기준선" path=anthropics/docx/scripts/office/validators/base.py lines=623:659
@source b5 title="scripts/office/validators/base.py · 공백 보존 수리" path=anthropics/docx/scripts/office/validators/base.py lines=127:160
@source px title="scripts/office/validators/pptx.py · 15966B · pptx 전용 검사 순서" path=anthropics/docx/scripts/office/validators/pptx.py lines=28:72
@source pxc title="scripts/office/helpers/pptx_chart.py · 5862B · pptx 차트 검사" path=anthropics/docx/scripts/office/helpers/pptx_chart.py lines=1:6
@source pxs title="scripts/office/helpers/pptx_slide.py · 1675B · pptx 슬라이드 오류 목록" path=anthropics/docx/scripts/office/helpers/pptx_slide.py lines=1:7
@source pxt title="scripts/office/helpers/pptx_theme.py · 3510B · pptx 테마 공유 검사" path=anthropics/docx/scripts/office/helpers/pptx_theme.py lines=1:6
@source wml title="scripts/office/schemas/ISO-IEC29500-4_2016/wml.xsd · 171367B · 앞부분 표본" path=anthropics/docx/scripts/office/schemas/ISO-IEC29500-4_2016/wml.xsd lines=1:12

## 이 스킬은 언제 켜지고, 언제 쓰면 안 되나 {#trigger}

`description`이 활성화 범위의 전부다. 모델이 판단할 때 참고하는 설명이지 단어가 있으면 켜지는 사전이 아니다.

@code source=fm language=yaml

| 구분 | 원문 | 비고 |
| --- | --- | --- |
| 켜지는 일 | `.docx`·`.dotx`를 만들고, 읽고, 고치고, 변경 추적·댓글·이미지 교체·찾아 바꾸기를 하는 일. 목차·제목·쪽 번호·레터헤드가 있는 문서도 든다.[](source:fm) | 예시 나열이며 정확히 일치해야 켜진다는 말은 없다 |
| 보고서·메모·편지 | Word나 `.docx` 파일로 달라고 할 때 쓴다.[](source:fm) | 파일 형식을 말하지 않은 요청은 이 문장으로는 판단할 수 없다. 판정 |
| 쓰지 말 것 | PDF, 스프레드시트, Google Docs, 문서 생성과 무관한 일반 코딩.[](source:fm) {bad:명시된 제외} | 경계 선언이고 다른 스킬을 부르라는 지시는 아니다. 원장 r04, r05 |
| 호출 제한 | `disable-model-invocation` 등 필드는 원문에 명시 없음.[](source:fm) | 없다고 해서 자동 호출이 안전하다는 근거는 아니다 |

판정: 제외 목록이 PDF와 스프레드시트를 이름으로 든 만큼, 같은 요청이 PDF나 `.xlsx`를 낳는 것이라면 이 스킬 대상이 아니다. 근거는 `description`의 `Do NOT use` 문장이다.[](source:fm)

## 작업은 어떤 도구로 갈라지고, 편집은 어떤 순서인가 {#flow}

첫 표가 도구를 정한다. `docx-js`는 기존 파일을 열지 못하므로 편집에는 쓰지 않는다.[](source:tbl)

| 작업 | 접근 |
| --- | --- |
| 새 문서 만들기 | `docx`(npm) 스크립트 작성. 아래 함정 목록을 따른다.[](source:tbl) |
| 기존 문서 편집 | `unzip`, `word/document.xml` 수정, `zip`.[](source:tbl) |
| 내용 읽기 | `pandoc -t markdown file.docx`.[](source:tbl) |

편집 절차는 코드 블록 하나다. 오래된 `.doc`은 먼저 `soffice.py --headless --convert-to docx`로 바꿔야 한다.[](source:ed)

@workflow id=docx-edit-flow title="기존 .docx 편집 절차"
| unpack | 압축 풀기 | backend |
| links | symlink 삭제 | security |
| merge | run 합치기 | backend |
| edit | document.xml 수정 | backend |
| pack | 다시 압축 | backend |
| check | validate.py 검사 | backend |
| unpack > links | |
| links > merge | |
| merge > edit | |
| edit > pack | |
| pack > check | emphasis |

@steps id=docx-edit-steps
| unpack | 압축 풀기 | `unzip -q doc.docx -d unpacked/`로 푼다. | docx-edit-flow | unpack |
| links | symlink 삭제 | `find unpacked -type l -delete`. 외부에서 받은 docx는 신뢰하지 않는다는 이유가 적혀 있다. | docx-edit-flow | links |
| merge | run 합치기 | `merge_runs.py unpacked/`. Word가 문장을 여러 `w:r`로 쪼개 놓아 문구가 XML에 이어진 문자열로 없을 수 있다. | docx-edit-flow | merge |
| edit | document.xml 수정 | 제자리에서 고친다. 서식 정리나 pretty-print는 하지 않는다. | docx-edit-flow | edit |
| pack | 다시 압축 | `zip -Xr`로 `out.docx`를 만든다. | docx-edit-flow | pack |
| check | validate.py 검사 | `validate.py out.docx --original doc.docx`. 변경 추적 작업이면 `--author`를 붙인다. | docx-edit-flow | check |

그림은 SKILL.md의 코드 블록 순서만 옮겼다.[](source:ed) 검사 실패 뒤 다시 고치라는 되돌림 문장은 원문에 명시 없음이라 되돌아가는 간선은 그리지 않았다. 렌더 확인은 편집 절차 밖의 별도 절이며, 순서 연결도 원문에 명시 없음.[](source:vf)

```bash title="렌더 확인(원문 예시, 해상도 100은 예시값)"
python scripts/office/soffice.py --headless --convert-to pdf output.docx
pdftoppm -jpeg -r 100 output.pdf page
ls page-*.jpg
```

`pdftoppm`은 쪽 번호를 쪽 수 자릿수에 맞춰 0으로 채운다(`page-01.jpg`~`page-12.jpg`).[](source:vf)

## 무엇을 강제하고 무엇을 금지하나, 수치는 의무인가 {#rules}

`MUST`나 `ALWAYS` 같은 강한 표현은 원문에 없다. 금지는 `never`, `do not`, `don't`로 쓰였고 나머지는 "이렇게 하라"는 명령형이다. 아래 구분은 원문 어휘를 그대로 옮긴 것이다.

| 규칙 | 구분 | 이유(원문) | 출처 |
| --- | --- | --- | --- |
| `npm install`을 먼저 하지 않는다. `require('docx')`가 실패할 때만 설치한다 | 금지 | `docx`는 사전 설치돼 있다 | [](source:npm) |
| 쪽 크기를 명시한다. 기본은 A4이고 US Letter는 `width: 12240, height: 15840` | 명령(단위 DXA) | 기본값이 A4다 | [](source:gt) |
| 가로 방향은 세로 치수를 넣고 `PageOrientation.LANDSCAPE`를 쓴다 | 명령 | docx-js가 폭과 높이를 내부에서 바꾼다 | [](source:gt) |
| 표에는 `columnWidths`와 모든 셀의 `width`를 `WidthType.DXA`로 둘 다 지정하고, 열 폭 합은 표 폭과 같아야 한다 | 명령 | PERCENTAGE는 Google Docs에서 깨진다 | [](source:gt) |
| 표 음영은 `ShadingType.CLEAR`를 쓰고 `SOLID`는 쓰지 않는다 | 금지 | SOLID는 검게 렌더된다 | [](source:gt) |
| 글머리 `•`를 문자로 넣지 않고 `numbering`의 `LevelFormat.BULLET`을 쓴다 | 금지 | 원문에 이유 명시 없음 | [](source:gt) |
| `ImageRun`에는 `type:`을 준다. `PageBreak`는 `Paragraph` 안에 둔다. `\n` 대신 `Paragraph`를 나눈다 | 명령, 금지(`\n`) | 원문에 이유 명시 없음 | [](source:gt) |
| 목차는 기본 `HeadingLevel.*`를 쓴다. 사용자 제목 스타일은 `outlineLevel`이 있어야 목차에 나온다 | 명령 | 없으면 목차에서 빠진다 | [](source:gt) |
| 표를 가로줄로 쓰지 않고 문단 아래 테두리를 쓴다. 점선 탭은 `PositionalTab`을 쓴다 | 금지, 명령 | 점이나 공백 채우기 금지 | [](source:gt) |
| 변경 추적은 `w:ins`/`w:del`에 `w:id`, `w:author`, `w:date`를 달고, `w:del` 안 텍스트는 `w:delText`로 쓴다 | 명령 | `w:t`는 틀린 요소다 | [](source:trk) |
| `w:del`은 `rPr` 다른 자식보다 앞에 둔다 | 명령 | 순서를 스키마가 강제한다 | [](source:trk) |
| 변경 추적 검증은 `--author "<이름>"`과 `--original`을 함께 쓴다 | 명령 | 추적 안 하고 바꾼 텍스트를 보고한다 | [](source:trk)[](source:ed) |
| 댓글 marker를 `document.xml`에 넣기 전에는 댓글이 보이지 않는다 | 사실 | 정의만 있고 위치가 없다 | [](source:cm) |

표의 수치는 예시가 아니라 docx-js 설정값이다. 이유가 적혀 있지 않은 항목은 "명시 없음"으로 적었다.

@callout level=warning title="자동 변환 도구의 알려진 한계"
| `pandoc --track-changes=accept`는 삭제된 문단 표식을 합치지 않아 빈 글머리 문단이 남는다. |
| `accept_changes.py`는 합치지만, 삭제된 문단 뒤에 빈 spacer 문단이 오면 예외다. |
| 원문은 이 빈 글머리를 보는 방식이 만든 흔적이라 보고, 문단 삭제는 XML에서 확인하라고 한다.[](source:acc) |

@facts
| 기본 쪽 크기 | A4 (US Letter는 12240 × 15840 DXA)[](source:gt) |
| DXA 환산 | 1440 DXA = 1인치[](source:gt) |
| 렌더 해상도 예시 | `-r 100` (예시)[](source:vf) |
| 사람 승인·종료 조건 | 원문에 명시 없음 |

## 스크립트는 지시대로 동작하고, 어디서 어긋나나 {#scripts}

SKILL.md는 `scripts/` 아래 스크립트 네 개를 부른다. 코드를 읽고 지시와 비교했다.[](source:ed)[](source:cm)

| 스크립트 | 지시상 동작 | 코드에서 확인한 한계 |
| --- | --- | --- |
| `merge_runs.py` | 인접하고 서식이 같은 run을 합치고 `rsid`와 `proofErr`를 지운다.[](source:mr1) | `word/document.xml`만 처리한다. 머리글·바닥글·각주는 건드리지 않는다. 서로 다른 `w:ins`/`w:del` 안의 run은 합치지 않는다.[](source:mr1) `rPr` XML 문자열이 같을 때만 합친다.[](source:mr2) |
| `comment.py` | 댓글 파일 네 개, 관계, content type을 쓰고 ID를 `최댓값 + 1`로 붙인다(없으면 0).[](source:cp1)[](source:cp3) | 기본 작성자는 `Claude`, 약자는 `C`다.[](source:cp4) `--parent`로 답글을 달 수 있다.[](source:cp4) marker는 `w:p`의 직접 자식이어야 한다고 안내한다.[](source:cpm) `people.xml` 템플릿은 폴더에 있으나 `comment.py`는 쓰지 않는다. 판정: 사용처는 코드에서 확인하지 못했다.[](source:tp) |
| `accept_changes.py` | LibreOffice 매크로로 변경을 모두 수락한다. `.docx`만 받는다.[](source:ac2) | 제한 시간 30초가 지나면 오류가 아니라 성공 메시지를 돌려준다.[](source:ac2) 프로필을 `/tmp/libreoffice_docx_profile`에 만든다.[](source:ac1) 판정: 시간 초과를 성공으로 보고하므로 결과 파일은 직접 확인해야 한다. |
| `office/validate.py` | 형식별 검사기를 고르고 `--auto-repair`로 고친 뒤 검사한다.[](source:v3)[](source:v4) | `--author`는 `--original`이 있어야 하고 docx 전용이다.[](source:v2) 이 이름은 필터가 아니라 "편집 작업 중"이라는 표시일 뿐이다.[](source:v2) |
| `office/soffice.py` | 임시 프로필로 `soffice`를 돌린다.[](source:so2) | AF_UNIX 소켓이 막힌 환경이면 `LD_PRELOAD` shim을 `gcc`로 만들어 쓴다.[](source:so3) 판정: `gcc`가 없는 환경에서 shim이 필요하면 실패한다. 이 경우 처리는 코드에 없다. |

`validate.py`가 docx에서 도는 검사는 12개다. XML 구문, `Ignorable` 네임스페이스 선언, 고유 ID, 파일 참조, content type, XSD, 공백 보존, `w:del` 안 `w:t`, `w:ins` 안 `w:delText`, 관계 ID, ID 한도, 댓글 marker 짝을 확인하고 문단 수 변화는 검사 없이 출력만 한다.[](source:dv1)[](source:dv5)

- `--original`을 주면 원본에 이미 있던 XSD 오류는 새 오류로 세지 않는다. 주지 않으면 모든 XSD 오류를 보고하고 변경 추적 검사는 건너뛴다.[](source:b4)[](source:v2)
- 어떤 파일에서도 참조되지 않는 파일은 오류다. 깨진 참조와 함께 "문서가 손상돼 보인다"고 경고한다.[](source:b3)
- XSD 오류 중 `hyphenationZone`과 `purl.org/dc/terms`가 든 것은 무시한다.[](source:b1)
- `paraId`는 `0x80000000` 미만, `durableId`는 `0x7FFFFFFF` 미만이어야 한다. `numbering.xml`의 `durableId`는 10진수다.[](source:dv6)
- 변경 추적 검사는 본문만 비교한다. 새 변경을 되돌린 뒤 텍스트가 원본과 다르면 추적 없이 고친 것으로 보고한다.[](source:rl1)[](source:rl2)
- 변경 추적이 있는데 `--author`를 주지 않으면 "검사하지 않았다"는 안내만 찍는다.[](source:v3)
- xlsx 형식에는 XSD 검사를 하지 않고 종료 코드 0으로 끝난다. pptx 전용 검사는 docx 파일에서는 돌지 않는다.[](source:v3)[](source:px)

@callout level=warning title="자동 수리의 실제 범위"
| `validate.py` 머리말은 `--auto-repair`가 `paraId`/`durableId` 한도 초과를 고친다고 쓴다.[](source:v1) 코드에서 고치는 것은 `durableId`와 `xml:space="preserve"` 누락뿐이다.[](source:dv8)[](source:b5) |
| 판정: `paraId`가 한도를 넘으면 검사는 실패하지만 자동 수리는 되지 않는다. 근거는 `repair()`가 `repair_whitespace_preservation`과 `repair_durableId`만 부르는 구조다. |

## 흐름 속 위치: 같은 묶음의 다른 스킬과 어떻게 이어지나 {#position}

`docx`는 묶음 `office-ooxml`의 변형 스킬이다. 이 묶음은 순서가 없고, 원장에서 확인되는 관계는 공유 상태와 같은 계열뿐이라 앞뒤 흐름 그림은 그리지 않았다. 순서 없는 변형 관계를 선후 화살표로 그리면 없는 단계를 만들기 때문이다. 전체 구성은 `anthropics/_group-office-ooxml/office-ooxml.html`을 본다.

| 관계 | 상대 | 종류 | 받는 것·넘기는 것 | 조건·경계 |
| --- | --- | --- | --- | --- |
| r01 | `pptx` | 공유 상태 | `scripts/office/` 도구 사본 | 폴더 전체가 동일한 사본이다. 서로 부르지 않고, 같은 경로를 읽고 쓰지도 않는다 |
| r02 | `xlsx` | 공유 상태 | `scripts/office/` 도구 사본 | r01과 같다. `xlsx`가 사본을 실제로 쓰는지는 `xlsx` 페이지에서 확인한다 |
| r04 | `pdf` | 같은 계열 | 없음 | `docx`의 `description`이 PDF를 활성화 범위에서 뺀다. 경계 선언이며 호출 지시가 아니다 |
| r05 | `xlsx` | 같은 계열 | 없음 | 서로 상대 파일 형식을 활성화 범위에서 뺀다. 경계 선언이다 |
| r06 | `pptx` | 산출물 호환(미확인) | 없음 | 둘 다 `soffice.py`로 PDF를 만들고 `pdftoppm`으로 이미지를 뽑는 시각 점검을 쓴다. 서로의 산출물을 입력으로 쓴다는 문장은 없다. 그림에서 뺐다 |

판정: 이 묶음 안에서 `docx`를 쓰다가 다른 스킬로 넘어가는 지시는 원장에 없다. 사본이 같다는 것은 `scripts/office/` 폴더를 `diff -rq`로 비교한 원장의 결과이고, 이 페이지에서 다시 비교하지는 않았다. 이 페이지에서 확인한 것은 `docx` 쪽 `validate.py`, `soffice.py`와 그 하위 파일을 읽었다는 점이다.[](source:v3)[](source:so2)

## 이 분석의 범위, 어긋난 곳, 확인하지 못한 것 {#audit}

| 구분 | 수 | 내용 |
| --- | --- | --- |
| 읽은 텍스트 파일 | 22 | `SKILL.md` 1개, `.py` 15개(`scripts` 직속 4개 중 `__init__.py` 포함, `office` 직속 2개, `helpers` 4개, `validators` 5개), 템플릿 XML 5개, `LICENSE.txt` 1개. XSD를 뺀 합계 161,658B |
| 부분 읽음 | 1 | `LICENSE.txt`는 앞 3줄만 읽었다. 라이선스 본문은 분석 대상이 아니다 |
| 구조·표본만 확인(전부 읽지 않음) | 39 | `scripts/office/schemas/` XSD 39개, 합계 976,913B. 파일 목록과 크기를 확인하고 `wml.xsd` 앞 12줄과 `schemaLocation` 구조를 봤다 |
| 바이너리 | 0 | 없다 |
| 제외한 것 | - | 대상 스킬의 지시(`npm install`, `unzip`, `soffice` 실행 등)는 실행하지 않았다 |

템플릿 XML은 `xmlns` 선언이 줄 대부분을 차지해 선언 문자열을 제외하고 뼈대만 확인했다.[](source:tc)[](source:te)[](source:ti)[](source:tx)[](source:tp)

pptx 전용 파일(`validators/pptx.py`, `helpers/pptx_chart.py`, `pptx_slide.py`, `pptx_theme.py`)은 읽었지만 docx 처리 경로에서는 호출되지 않는다.[](source:px)[](source:pxc)[](source:pxs)[](source:pxt)

@callout level=open-question title="확인하지 못한 것"
| 스크립트를 실행하지 않았다. `accept_changes.py`의 시간 초과 동작과 `soffice.py` shim 실패는 코드 읽기만으로 판정했다. |
| `validate.py`의 XSD 검사에 드는 시간은 원문에 명시 없음. |
| 생성한 `.docx`가 Word에서 정상으로 열리는지는 확인하지 못했다. 이 스킬도 LibreOffice 렌더만 지시한다.[](source:vf) |
| 사람 검토는 미실시. |

@callout level=note title="원장과 대조"
| 원장 r01, r02, r04, r05, r06의 `docx` 쪽 출처 줄(`docx:3`, `docx:37-45`, `docx:40,57`)을 SKILL.md와 맞춰 봤고 줄 번호는 맞다. 분석 중 바뀐 파일은 없다. |
