# xlsx 스킬은 에이전트를 어떻게 바꾸나 {#xlsx-skill}

`xlsx`를 쓰면 에이전트는 `openpyxl`로 수식이 든 스프레드시트를 쓰고, 마지막에 `scripts/recalc.py`로 LibreOffice가 모든 수식을 계산하게 한다. 그리고 JSON의 `status`와 `total_errors`를 읽어 수식 오류가 0이 될 때까지 고친다. 결과물은 수식이 살아 있고 수식 오류가 0건인 `.xlsx` 파일이다. 파일은 recalc 때 제자리에서 다시 쓰인다.[](source:x-recalc)[](source:x-req)

- 계산한 합계를 값으로 넣지 않는다. `=SUM(B2:B9)` 같은 수식을 쓴다.[](source:x-req)
- `recalc.py`가 `errors_found`를 보고하면 내보내지 않는다. 종료 코드 0이 깨끗하다는 뜻은 아니다.[](source:x-json)
- `XLOOKUP`, `XMATCH`, `SORT`, `FILTER`, `UNIQUE`, `SEQUENCE`는 쓰지 않는다. `INDEX`/`MATCH`를 쓴다.[](source:x-nevernew)
- `scripts/office/` 폴더가 스킬에 들어 있지만 `SKILL.md`가 쓰라고 하는 것은 `recalc.py`뿐이다. `office/` 안에서는 `recalc.py`가 import하는 `soffice.py`만 쓰인다.[](source:x-deps)[](source:r-imp)

@answer scope="anthropics/xlsx · 원본 텍스트 13개 전부 읽음, XSD 39개와 LICENSE는 구조·표본만 · 커밋 b825733 · 실행하지 않음(지시상 동작)"
@meta locale=ko
@source x-fm title="anthropics/xlsx/SKILL.md · 8584B · frontmatter" path=anthropics/xlsx/SKILL.md lines=1:5
@source x-tbl title="SKILL.md · 작업별 방식 표" path=anthropics/xlsx/SKILL.md lines=9:16
@source x-path title="SKILL.md · 스크립트 경로 기준" path=anthropics/xlsx/SKILL.md lines=18:18
@source x-req title="SKILL.md · 모든 출력의 요구 사항" path=anthropics/xlsx/SKILL.md lines=20:28
@source x-recalc title="SKILL.md · recalc 필수 이유와 명령" path=anthropics/xlsx/SKILL.md lines=30:38
@source x-json title="SKILL.md · recalc JSON 해석" path=anthropics/xlsx/SKILL.md lines=40:46
@source x-green title="SKILL.md · 초록불은 맞다는 뜻이 아니다" path=anthropics/xlsx/SKILL.md lines=48:50
@source x-ext title="SKILL.md · 외부 파일 링크" path=anthropics/xlsx/SKILL.md lines=52:59
@source x-prefer title="SKILL.md · 2007 시기 함수 우선" path=anthropics/xlsx/SKILL.md lines=63:66
@source x-xlfn title="SKILL.md · _xlfn. 접두어 함수 여섯 개" path=anthropics/xlsx/SKILL.md lines=67:67
@source x-nevernew title="SKILL.md · 쓰지 말 함수" path=anthropics/xlsx/SKILL.md lines=68:69
@source x-gotcha title="SKILL.md · openpyxl 주의점" path=anthropics/xlsx/SKILL.md lines=71:78
@source x-fin-color title="SKILL.md · 재무 모델 색" path=anthropics/xlsx/SKILL.md lines=82:86
@source x-fin-num title="SKILL.md · 재무 모델 숫자 서식" path=anthropics/xlsx/SKILL.md lines=88:91
@source x-fin-struct title="SKILL.md · 재무 모델 구조" path=anthropics/xlsx/SKILL.md lines=93:95
@source x-deps title="SKILL.md · 의존성과 soffice.py 언급" path=anthropics/xlsx/SKILL.md lines=97:99
@source r-imp title="scripts/recalc.py · import office.soffice" path=anthropics/xlsx/scripts/recalc.py lines=19:19
@source r-const title="scripts/recalc.py · 상수와 외부 참조 정규식" path=anthropics/xlsx/scripts/recalc.py lines=23:28
@source r-macro title="scripts/recalc.py · 재계산 매크로" path=anthropics/xlsx/scripts/recalc.py lines=30:38
@source r-ext title="scripts/recalc.py · 외부 링크 위험 셀 검사" path=anthropics/xlsx/scripts/recalc.py lines=81:121
@source r-pre title="scripts/recalc.py · 실행 전 점검과 거부" path=anthropics/xlsx/scripts/recalc.py lines=124:156
@source r-run title="scripts/recalc.py · 타임아웃과 soffice 실행" path=anthropics/xlsx/scripts/recalc.py lines=164:197
@source r-fail title="scripts/recalc.py · 실패 반환 조건" path=anthropics/xlsx/scripts/recalc.py lines=199:212
@source r-scan title="scripts/recalc.py · 오류 문자열 검사" path=anthropics/xlsx/scripts/recalc.py lines=214:241
@source r-status title="scripts/recalc.py · status와 error_summary" path=anthropics/xlsx/scripts/recalc.py lines=243:256
@source r-count title="scripts/recalc.py · 수식 수 세기" path=anthropics/xlsx/scripts/recalc.py lines=258:276
@source r-catch title="scripts/recalc.py · 예외는 error로" path=anthropics/xlsx/scripts/recalc.py lines=278:279
@source r-main title="scripts/recalc.py · main과 종료 코드" path=anthropics/xlsx/scripts/recalc.py lines=282:304
@source s-doc title="scripts/office/soffice.py · 5927B · 용도 설명" path=anthropics/xlsx/scripts/office/soffice.py lines=1:16
@source s-run title="scripts/office/soffice.py · run_soffice" path=anthropics/xlsx/scripts/office/soffice.py lines=27:46
@source v-xlsx title="scripts/office/validate.py · xlsx 가족은 검증하지 않는다" path=anthropics/xlsx/scripts/office/validate.py lines=142:148
@source v-pick title="scripts/office/validate.py · 가족별 검증기 선택" path=anthropics/xlsx/scripts/office/validate.py lines=124:151
@source b-map title="scripts/office/validators/base.py · SCHEMA_MAPPINGS" path=anthropics/xlsx/scripts/office/validators/base.py lines=55:71
@source xsd-sml title="scripts/office/schemas/ISO-IEC29500-4_2016/sml.xsd · 242277B · 앞부분 표본" path=anthropics/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/sml.xsd lines=1:10
@source xsd-rel title="scripts/office/schemas/ecma/fouth-edition/opc-relationships.xsd · 앞부분 표본" path=anthropics/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-relationships.xsd lines=1:8
@source lic title="anthropics/xlsx/LICENSE.txt · 11357B · 앞 15줄만(Apache License 2.0)" path=anthropics/xlsx/LICENSE.txt lines=1:15
@source rel-r02 title="skill-explainers/anthropics/relations.md · r02·r03 행" path=skill-explainers/anthropics/relations.md lines=26:27

## 언제 켜지고, 언제 맞지 않나 {#trigger}

@code source=x-fm language=yaml

`license` 외에 호출 제한 필드(`disable-model-invocation` 등)는 없다. 그래서 모델이 `description`을 보고 켜거나 사용자가 직접 부를 수 있다.[](source:x-fm) 판정: `description`은 판단용 설명이지 단어가 있으면 켜지는 목록이 아니다.

켜지는 조건은 "스프레드시트 파일이 주된 입력이나 출력일 때"다. 사용자가 파일 이름이나 경로를 말하며 뭔가 시키는 경우를 특히 꼽는다. 설명용 예시: "내 다운로드 폴더의 xlsx에 합계 열 추가해 줘"[](source:x-fm)

| 요청 | 이 스킬 | 근거 |
| --- | --- | --- |
| `.xlsx` `.xlsm` `.xltx` `.csv` `.tsv`를 열고 읽고 고친다 | {good:맞다} | `description`의 첫 항목[](source:x-fm) |
| 새 스프레드시트를 처음부터, 또는 다른 데이터로 만든다 | {good:맞다} | `description`의 둘째 항목[](source:x-fm) |
| 표 형식 파일을 서로 바꾼다 | {good:맞다} | `description`의 셋째 항목[](source:x-fm) |
| 깨진 행, 엉뚱한 헤더, 쓰레기 값이 든 표 파일을 제대로 된 스프레드시트로 정리한다 | {good:맞다} | `description`이 따로 꼽는다[](source:x-fm) |
| 결과물이 Word 문서이거나 HTML 보고서다 | {bad:쓰지 않는다} | "Do NOT trigger" 목록[](source:x-fm) |
| 결과물이 독립 실행 Python 스크립트이거나 데이터베이스 파이프라인이다 | {bad:쓰지 않는다} | 같은 목록. 표 데이터가 있어도 마찬가지다[](source:x-fm) |
| Google Sheets API로 연동한다 | {bad:쓰지 않는다} | 같은 목록[](source:x-fm) |

판정: 한 줄로 줄이면 "산출물이 스프레드시트 파일이어야 한다"가 경계다. `description`이 마지막에 "The deliverable must be a spreadsheet file"이라고 못박는다.[](source:x-fm)

원문에 명시 없음: `.ods` 같은 다른 스프레드시트 형식, 그리고 PDF에서 표를 뽑는 요청을 이 스킬이 맡는지는 `description`에 적혀 있지 않다. 이 둘은 활성화 판단에서 모델이 정해야 한다.

## 무엇을 강제하고 무엇을 금지하나 {#rules}

`SKILL.md`가 의무형으로 쓴 규칙부터 모았다. 원문이 "Unless the user says otherwise" 같은 조건을 달면 그 조건을 같이 적었다.

| 규칙 | 내용 | 예외·조건 |
| --- | --- | --- |
| 글꼴 | Arial이나 Times New Roman 같은 전문적인 글꼴을 전체에 쓴다 | 사용자가 달리 말하면 따른다[](source:x-req) |
| 수식 오류 | 수식 오류 0건. `errors_found`가 나오면 내보내지 않는다 | 이미 있던 오류라고 생각되면 증명한다. 원본을 `data_only=True`로 열어 그 셀을 본다. 내가 만든 오류와 물려받은 오류는 똑같이 보인다[](source:x-req) |
| 하드코딩 | 계산 결과를 값으로 넣지 않고 `=SUM(B2:B9)`처럼 수식을 쓴다. 입력이 바뀌면 시트가 다시 계산돼야 한다 | 원문에 명시 없음[](source:x-req) |
| 사용자 명세 | 탭 이름, 열 머리글, 사용자가 쓴 수식을 글자 그대로 따른다. 다른 걸 계산하는 재설계는 아무리 세련돼도 실패다 | 없음[](source:x-req) |
| 가정 문서화 | 모든 가정과 하드코딩 숫자를 독자가 볼 곳에 적는다(셀 주석이나 표 끝의 옆 셀). 실제 출처가 있으면 인용하고, 사용자가 준 숫자는 그렇다고 밝힌다 | 없음[](source:x-req) |
| 채우는 용 워크북 | 새로 만든 워크북에는 편집할 셀을 알리는 짧은 범례와, 현실적인 값을 넣은 예시 행 한 줄을 둔다 | 편집을 요청받은 기존 파일에는 예시 행을 넣지 않는다[](source:x-req) |
| 기존 파일 편집 | 파일의 관례를 정확히 따른다. 이 관례가 이 표의 다른 지침보다 우선한다. 입력 셀(글꼴 색이나 채우기로 구분)을 먼저 찾아 거기에만 쓰고 기존 수식은 건드리지 않는다 | 우선순위가 원문에 명시돼 있다[](source:x-req) |

수식 함수는 LibreOffice가 계산할 수 있는지로 갈린다. 계산하지 못하는 함수는 `#NAME?`이 파일에 그대로 박혀 나간다.[](source:x-prefer)

@facts id=formula-rules
| 우선 | `SUMIFS`, `INDEX`, `MATCH`, `IFERROR`, `SUMPRODUCT` 같은 Excel 2007 시기 함수. 접두어가 필요 없다[](source:x-prefer) |
| `_xlfn.` 접두어와 함께만 | `TEXTJOIN`, `CONCAT`, `IFS`, `SWITCH`, `MAXIFS`, `MINIFS` 여섯 개. 접두어 없이 쓰면 `#NAME?`이다[](source:x-xlfn) |
| 쓰지 않는다 | `XLOOKUP`, `XMATCH`, `SORT`, `FILTER`, `UNIQUE`, `SEQUENCE`. 어떤 접두어로도 이 런타임의 LibreOffice가 계산하지 못한다[](source:x-nevernew) |

새 빌드는 이 여섯 개를 계산하기도 하지만, spill(결과가 옆 칸으로 번지는 배열) 정보가 없는 openpyxl 파일에서는 범위의 왼쪽 위 셀만 값을 얻는다. 그래도 `recalc.py`는 `total_errors: 0`을 보고한다. 그래서 금지 이유는 오류가 보이지 않는 것이다.[](source:x-nevernew)

정렬, 필터, 중복 제거는 Python에서 한 뒤 셀에 쓴다.[](source:x-nevernew) LibreOffice가 해석하지 못한 수식은 소문자로 다시 쓰여, `#NAME?` 옆에서 단서가 된다.[](source:x-nevernew)

openpyxl 주의점은 여섯 가지다.[](source:x-gotcha)

| 주의점 | 이유 |
| --- | --- |
| 모델을 읽으려면 로드를 두 번 한다 | `data_only=True`는 캐시된 값만, 기본은 수식 문자열만 준다[](source:x-gotcha) |
| `data_only=True`로 연 워크북은 저장하지 않는다 | 수식이 값으로 영구히 바뀐다[](source:x-gotcha) |
| 방금 openpyxl로 쓴 파일을 `data_only=True`로 열면 전부 `None`이다 | 먼저 `recalc.py`를 돌린다. 결과가 `""`인 수식도 `None`으로 읽힌다[](source:x-gotcha) |
| 병합 셀은 왼쪽 위 셀에만 쓴다 | 나머지는 읽기 전용 `MergedCell`이다[](source:x-gotcha) |
| `.xlsm`은 `keep_vba=True`로 연다 | 아니면 매크로를 잃는다[](source:x-gotcha) |
| 공백이 든 시트 이름은 따옴표로 감싼다 | 예: `='Assumptions Inputs'!$B$5`. 따옴표가 없으면 `#VALUE!`다[](source:x-gotcha) |

재무 모델은 사용자가 달리 말하거나 기존 파일이 다르게 하지 않는 한 아래 서식을 따른다.[](source:x-fin-color)

| 항목 | 규칙 |
| --- | --- |
| 글자색 | 하드코딩 입력과 시나리오 변수는 파랑(0,0,255), 수식은 검정, 다른 시트로 가는 링크는 초록(0,128,0), 다른 파일로 가는 링크는 빨강(255,0,0). 핵심 가정과 사용자가 채울 셀은 노란 채우기(255,255,0)[](source:x-fin-color) |
| 통화 | `$#,##0`, 단위는 머리글에(`Revenue ($mm)`). 0은 `-`로, 음수는 괄호로: `$#,##0;($#,##0);-`[](source:x-fin-num) |
| 퍼센트 | `0.0%`. 분수로 저장한다. `0.15`는 `15.0%`로 보이고 `15`를 넣으면 `1500.0%`다[](source:x-fin-num) |
| 배수·연도 | 평가 배수는 `0.0x`, 연도는 텍스트(`"2024"`, 2,024가 아니다)[](source:x-fin-num) |
| 구조 | 가정마다 이름 붙은 셀 하나, 수식은 그 셀을 참조(`=B5*(1+$B$6)`, `=B5*1.05`는 안 됨). 모든 예측 기간에서 수식이 일관돼야 한다. 0이 될 수 있는 분모는 막는다[](source:x-fin-struct) |

@callout level=note title="사용자 개입"
이 스킬은 에이전트에게 사용자에게 묻거나 승인받으라고 지시하는 문장이 없다(원문에 명시 없음). 사용자가 개입하는 곳은 요청 자체와 "달리 말하면 따른다"는 예외뿐이다. 설치도 시키지 않는다. `openpyxl`, `pandas`, `markitdown`은 이미 설치돼 있다고 보고, import가 실패할 때만 `pip install` 하라고 한다.[](source:x-tbl)

## recalc는 어떻게 판정하고 어디서 멈추나 {#recalc}

`recalc.py`를 부르는 것은 "수식이 든 파일이면 필수"다. openpyxl은 수식을 문자열로만 쓰고 계산값을 저장하지 않아서, 재계산 전에는 `pandas`나 `data_only=True`가 모든 수식 셀을 `None`으로 읽는다.[](source:x-recalc)

```bash title="원문 명령 (이 분석에서는 실행하지 않았다)"
python scripts/recalc.py output.xlsx [timeout_seconds]   # default 30
```

@workflow id=recalc-flow title="recalc.py 실행 순서"
| lane pre | 실행 전 |
| lane run | LibreOffice |
| lane read | 결과 읽기 |
| exists | 파일이 있고 쓸 수 있나? | external | pre |
| links | 외부 링크 셀이 위험한가? | backend | pre |
| profile | 임시 프로필과 매크로 | backend | run |
| calc | calculateAll과 저장 | backend | run |
| stamp | 파일이 다시 쓰였나? | backend | run |
| scan | 오류 문자열 검사 | backend | read |
| out | status JSON | backend | read |
| exists > links | 예 |
| links > profile | 아니오 |
| profile > calc | |
| calc > stamp | |
| stamp > scan | 예 |
| scan > out | |

@steps id=recalc-steps
| exists | 파일이 있고 쓸 수 있나? | 없거나 쓰기 권한이 없으면 `error`를 반환한다. 제자리에 다시 쓰기 때문이다.[](source:r-pre) | recalc-flow | exists |
| links | 외부 링크 셀이 위험한가? | `xl/externalLinks/`가 있고, `[1]` 같은 외부 참조 수식인데 캐시 값이 `None`인 셀이 있으면 거부하고 `error`와 셀 목록(최대 100개)을 낸다. `--force`가 아니면 그렇다.[](source:r-ext)[](source:r-pre) | recalc-flow | links |
| profile | 임시 프로필과 매크로 | 임시 LibreOffice 프로필을 만들고 `RecalculateAndSave` 매크로를 넣는다.[](source:r-macro) | recalc-flow | profile |
| calc | calculateAll과 저장 | 매크로가 `calculateAll()`, `store()`, `close(True)`를 차례로 부른다.[](source:r-macro)[](source:r-run) | recalc-flow | calc |
| stamp | 파일이 다시 쓰였나? | 수정 시각과 크기가 그대로면 `error`다. 실행이 깨끗이 끝나도 아무것도 재계산되지 않은 것이다.[](source:r-fail) | recalc-flow | stamp |
| scan | 오류 문자열 검사 | `data_only=True`로 다시 열어 일곱 가지 오류 문자열이 든 셀을 센다.[](source:r-scan) | recalc-flow | scan |
| out | status 또는 error JSON | `status`, `total_errors`, `error_summary`, `total_formulas`를 낸다.[](source:r-status)[](source:r-count) | recalc-flow | out |

그림은 끝까지 간 경로만 그렸다. 파일이 없거나, 외부 링크가 위험하거나, 파일이 다시 쓰이지 않은 경우는 모두 중간에 `error` JSON을 내고 멈춘다.[](source:r-pre)[](source:r-fail) JSON을 읽는 법이 이 스킬의 종료 조건이다. 키 하나가 의미를 가른다.[](source:x-json)

| JSON | 뜻 | 종료 코드 | 에이전트가 할 일 |
| --- | --- | --- | --- |
| `status: "success"`, `total_errors: 0` | 수식이 계산됐고 오류 문자열이 없다 | 0 | 오류 조건은 충족. 숫자가 맞는지는 별도로 확인한다[](source:r-status)[](source:x-green) |
| `status: "errors_found"` | 오류가 있다. `error_summary`에 오류 종류별 `count`와 `locations`가 있다 | 0 | 이름 붙은 셀을 고치고 다시 돌린다. 내보내지 않는다[](source:x-json)[](source:r-main) |
| `error` 키가 있고 `status`가 없다 | 재계산이 일어나지 않았다 | 1 | 원인을 보고 고치거나 다시 돌린다. 그때까지 재계산됐다고 보지 않는다[](source:x-json)[](source:r-main) |

- 수식 오류 문자열은 일곱 가지다: `#VALUE!`, `#DIV/0!`, `#REF!`, `#NAME?`, `#NULL!`, `#NUM!`, `#N/A`.[](source:r-scan)
- `locations`는 오류 종류마다 최대 100개다. 넘으면 `locations_truncated`가 숨긴 개수를 알려 준다. 원문 지시는 목록 길이가 아니라 `total_errors`를 믿으라는 것이다.[](source:x-json)[](source:r-status)
- `errors_found`도 종료 코드 0이다. 종료 코드만 보고 깨끗하다고 판단하면 안 된다.[](source:x-json)[](source:r-main)
- 타임아웃 기본값은 30초다. 이 값은 프로필 생성에 먼저 쓰이고, 남은 시간(최소 5초)이 재계산에 쓰인다. 초과하면 "formulas were NOT recalculated" 메시지의 `error`다. 더 긴 시간으로 다시 돌리라고 안내한다.[](source:r-run)[](source:r-fail)
- 인수 없이 부르면 사용법을 출력하고 종료 코드 1로 끝난다. 이 경우 JSON이 아니다.[](source:r-main)

@callout level=warning title="초록불은 맞다는 뜻이 아니다"
`success`는 수식이 평가됐다는 뜻이다. 맞게 평가됐다는 뜻이 아니다. 범위가 한 칸 어긋나거나 엉뚱한 행을 참조하면 오류 없이 틀린 숫자가 나온다. 원문 지시는 격자를 만들기 전에 수식 2~3개를 먼저 써서 기대한 값을 끌어오는지 확인하는 것이다.[](source:x-green)

@callout level=warning title="외부 파일 링크는 재저장하면 사라진다"
`='[1]Returns Analysis'!$B$2`의 `[1]`은 시트가 아니라 별도 파일의 인덱스다. openpyxl이 저장하면서 캐시 값을 지우고, LibreOffice가 그 참조를 풀지 못해 `#NAME?`을 쓰고 링크를 모두 지운다. 그래서 `recalc.py`는 이 상태에서 거부한다. 원문 지시는 저장 전에 원본에서 그 셀들의 값을 따로 복사해 두라는 것이다. `--force`는 손실을 받아들이고 돌린다.[](source:x-ext)[](source:r-pre) 차트나 조건부 서식도 외부 참조를 가질 수 있어서 거부 메시지의 셀 목록이 전부가 아닐 수 있다고 코드가 직접 밝힌다.[](source:r-pre)

## 흐름 속 위치 {#position}

`anthropics/xlsx`는 `office-ooxml` 묶음의 변형이다. `docx`, `pptx`, `xlsx`는 파일 형식만 다르고 순서가 없다. 그래서 앞뒤가 있는 흐름 그림은 그리지 않고 표로 대신한다.[](source:rel-r02)

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `anthropics/docx` | - | - | 공유 상태(추론). 두 스킬이 같은 `scripts/office/` 사본을 각자 갖고 있다. 같은 경로를 읽고 쓰는 것이 아니라 파일 사본이다. 순서 없음[](source:rel-r02) | r02 |
| `anthropics/pptx` | - | - | r02와 같다. 순서 없음[](source:rel-r02) | r03 |
| `anthropics/docx`의 활성화 경계 | - | - | 같은 계열(명시-이름). 서로의 `description`이 상대 문서 종류를 활성화 범위에서 뺀다. xlsx 쪽 문장은 "Do NOT trigger when the primary deliverable is a Word document"다. 경계 선언이고 호출 지시가 아니다[](source:x-fm) | r05 |

묶음 전체 그림은 `anthropics/_group-office-ooxml/office-ooxml.html`에 있다. 관계 근거는 `anthropics/relations.md`의 rel-id로 확인한다.

원장 r02·r03은 "xlsx는 `scripts/office/`를 SKILL.md에서 부르지 않는다"고 쓴다. 원문을 확인한 결과는 이렇다.

| 파일 | `SKILL.md`의 지시 | 실제 쓰임 |
| --- | --- | --- |
| `scripts/office/soffice.py` | 의존성 줄에서 "auto-configured for sandboxed environments via `scripts/office/soffice.py`"라고 언급만 한다. 실행하라는 명령은 없다[](source:x-deps) | `recalc.py`가 `office.soffice`를 import해 LibreOffice 실행과 환경 설정에 쓴다[](source:r-imp)[](source:s-run) |
| `scripts/office/validate.py` | `validate`라는 말이 한 번도 없다(원문에 명시 없음) | xlsx 가족 파일을 주면 XSD 검증을 하지 않고 "수식 오류는 `scripts/recalc.py`를 쓰라"는 안내를 출력하고 종료 코드 0으로 끝난다[](source:v-xlsx) |
| `validators/`, `helpers/`, `schemas/` | 언급 없음 | `validate.py`가 docx와 pptx 검증기만 고른다. `base.py`에 `xl` 매핑이 있어도 xlsx 경로는 이 검증기를 쓰지 않는다[](source:v-pick)[](source:b-map) |

판정: xlsx 스킬에서 `scripts/office/`는 `soffice.py` 하나만 살아 있는 의존성이고 나머지는 docx·pptx 스킬과 폴더를 똑같이 맞추려고 들어 있는 사본으로 보인다. 근거는 위 표다. 사본이라는 이유 자체는 원문에 명시 없음.[](source:v-xlsx)[](source:x-deps)

## 이 분석의 범위와 한계 {#audit}

- 전부 읽은 텍스트 13개: `SKILL.md` 8584B, `scripts/recalc.py` 10670B(전부), `scripts/office/soffice.py` 5927B, `validate.py` 6142B, `helpers/` 4개(`__init__.py` 3358B, `pptx_chart.py` 5862B, `pptx_slide.py` 1675B, `pptx_theme.py` 3510B), `validators/` 5개(`__init__.py` 336B, `base.py` 33756B, `docx.py` 17482B, `pptx.py` 15966B, `redlining.py` 11231B). 합계 124,499B.
- 구조·표본만 확인(전부 읽지 않음) 40개: `LICENSE.txt` 11357B는 앞 15줄(Apache License 2.0 제목부)만 봤다. `scripts/office/schemas/` 아래 XSD 39개, 합계 976,913B는 폴더 구조, 파일 이름, `sml.xsd`와 `opc-relationships.xsd`의 앞부분만 봤다. 둘 다 거대한 생성 데이터거나 표준 문서이고, `SKILL.md`가 직접 읽으라고 지시하지 않는다.[](source:xsd-sml)[](source:xsd-rel)[](source:lic)
- 읽은 파일 수와 부분 읽음 수는 따로 센다: 읽음 13개, 부분 읽음 40개, 전체 53개. 선언한 `@source`가 30개를 넘지 않아 `files.md`는 두지 않았다.
- 제외한 파일: 번역본과 바이너리는 이 폴더에 없다.
- 원문 비교: 같은 이름의 스킬은 다른 컬렉션에 없다. `scripts/office/` 폴더 전체는 `docx`, `pptx`의 사본과 `diff -rq`로 대조했고 같았다.
- 관계 확인: r02, r03, r05를 `anthropics/relations.md`와 대조했다. r05는 같다. r02·r03은 위 "흐름 속 위치"에서 보인 대로 `soffice.py` 부분이 원장과 어긋난다.
- 대조 범위: 활성화 제한, 강제·금지, 수치, 종료 조건으로 표에 옮긴 항목은 줄 번호가 붙은 원문과 모두 대조했다. `validators/`와 `helpers/`의 세부 검사 규칙은 이 스킬이 쓰지 않는 코드라 내용을 옮기지 않았다.
- 실행하지 않았다. 페이지의 동작은 모두 지시상 동작이고 `recalc.py`, LibreOffice, `pip install`은 돌리지 않았다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`recalc.py`가 실제 LibreOffice에서 어떻게 동작하는지, 그리고 `SKILL.md`가 말하는 "이 런타임의 LibreOffice" 버전은 확인하지 못했다. 이 분석은 코드와 지시를 읽은 것이다.
`XLOOKUP` 계열이 새 빌드에서 왼쪽 위 셀만 값을 얻는다는 주장은 원문 설명이다. 이 분석은 측정하지 않았다.
`.ods` 같은 형식과 PDF 표 추출 요청에 대한 활성화 판단은 원문에 명시 없음.
