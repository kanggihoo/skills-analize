# kb-retriever 스킬은 에이전트를 어떻게 바꾸나 {#kb-retriever-skill}

`kb-retriever`를 쓰면 에이전트는 로컬 지식 폴더에서 답을 찾을 때 파일을 통째로 읽지 않는다. 폴더마다 있는 색인 파일 `data_structure.md`를 따라 관련 있는 곳만 내려가고, `grep`으로 위치를 찾은 뒤 그 주변만 읽는다. PDF나 Excel을 만나면 스킬 안의 처리법 문서부터 읽고, 파일을 텍스트로 바꾼 다음에 검색한다.[](source:kb-fm)[](source:kb-learn)

- 켜지는 때: 지식 폴더에서 질문에 답하거나 자료를 찾아 달라는 요청이다. 호출 제한 필드는 없다.[](source:kb-fm)
- 강제하는 것: PDF·Excel 처리 전에 `references/`의 문서를 읽는다. 검색은 최대 5회다. 이 스킬로 답할 때는 웹 검색을 쓰지 않는다.[](source:kb-learn)[](source:kb-iter)[](source:kb-note)
- 사람의 몫: 기본 폴더 `knowledge/`가 없으면 에이전트가 다른 폴더를 추측하지 않고 사용자에게 경로를 묻는다.[](source:kb-locate)
- 끝나는 때: 답할 근거를 찾았거나, 5회를 채웠는데 못 찾았을 때다. 못 찾으면 없다고 말하고 가장 가까운 정보와 불확실성을 함께 준다.[](source:kb-iter)

@answer scope="design/garden-skills/kb-retriever · 원본 텍스트 7개 36,875B · 커밋 4e3fc89 · SKILL.md는 중국어 원본 · 지시상 동작 · 실행하지 않음"
@meta locale=ko
@source kb-fm title="design/garden-skills/kb-retriever/SKILL.md · 13984B · frontmatter(중국어 원본)" path=design/garden-skills/kb-retriever/SKILL.md lines=1:4
@source kb-root title="SKILL.md · 지식 폴더 구조와 기본 경로" path=design/garden-skills/kb-retriever/SKILL.md lines=8:21
@source kb-locate title="SKILL.md · knowledge 루트 찾기" path=design/garden-skills/kb-retriever/SKILL.md lines=23:32
@source kb-learn title="SKILL.md · 먼저 배우고 처리한다(강제 점검표와 금지)" path=design/garden-skills/kb-retriever/SKILL.md lines=34:46
@source kb-s1 title="SKILL.md · 1 요구 이해와 루트 결정" path=design/garden-skills/kb-retriever/SKILL.md lines=50:58
@source kb-s2 title="SKILL.md · 2 색인 단계별 탐색" path=design/garden-skills/kb-retriever/SKILL.md lines=60:77
@source kb-s3 title="SKILL.md · 3 처리법 읽기" path=design/garden-skills/kb-retriever/SKILL.md lines=79:87
@source kb-s4 title="SKILL.md · 4 형식별 처리와 검색" path=design/garden-skills/kb-retriever/SKILL.md lines=89:95
@source kb-s5 title="SKILL.md · 5 반복 검색" path=design/garden-skills/kb-retriever/SKILL.md lines=97:98
@source kb-s6 title="SKILL.md · 6 답과 출처" path=design/garden-skills/kb-retriever/SKILL.md lines=100:107
@source kb-kw title="SKILL.md · 키워드 고르기" path=design/garden-skills/kb-retriever/SKILL.md lines=111:114
@source kb-grep title="SKILL.md · grep 원칙" path=design/garden-skills/kb-retriever/SKILL.md lines=116:120
@source kb-iter title="SKILL.md · 반복 검색(최대 5회)과 종료 조건" path=design/garden-skills/kb-retriever/SKILL.md lines=122:139
@source kb-note title="SKILL.md · 주의 사항(Glob 금지, 웹 검색 금지)" path=design/garden-skills/kb-retriever/SKILL.md lines=141:144
@source kb-md title="SKILL.md · Markdown·텍스트 전략" path=design/garden-skills/kb-retriever/SKILL.md lines=148:162
@source kb-pdf title="SKILL.md · PDF 전략" path=design/garden-skills/kb-retriever/SKILL.md lines=164:185
@source kb-xls title="SKILL.md · Excel 전략" path=design/garden-skills/kb-retriever/SKILL.md lines=187:211
@source kb-tools title="SKILL.md · 도구 사용 원칙" path=design/garden-skills/kb-retriever/SKILL.md lines=213:231
@source kb-style title="SKILL.md · 답하는 방식과 오류 처리" path=design/garden-skills/kb-retriever/SKILL.md lines=233:247
@source rd-what title="design/garden-skills/kb-retriever/README.md · 7249B · 하는 일" path=design/garden-skills/kb-retriever/README.md lines=9:16
@source rd-tree title="README.md · 스킬 구조" path=design/garden-skills/kb-retriever/README.md lines=30:42
@source rd-setup title="README.md · 지식 폴더 준비" path=design/garden-skills/kb-retriever/README.md lines=46:71
@source rd-tmpl title="README.md · data_structure.md 틀" path=design/garden-skills/kb-retriever/README.md lines=73:90
@source rd-table title="README.md · 형식별 도구 표" path=design/garden-skills/kb-retriever/README.md lines=124:130
@source rd-faq title="README.md · FAQ" path=design/garden-skills/kb-retriever/README.md lines=166:178
@source rd-tools title="README.md · 필요한 도구와 스크립트 용도" path=design/garden-skills/kb-retriever/README.md lines=182:191
@source mf-all title="design/garden-skills/kb-retriever/manifest.json · 546B · 버전과 호환 도구" path=design/garden-skills/kb-retriever/manifest.json lines=1:15
@source pr-head title="design/garden-skills/kb-retriever/references/pdf_reading.md · 9486B · 머리말" path=design/garden-skills/kb-retriever/references/pdf_reading.md lines=1:5
@source pr-table title="pdf_reading.md · 빠른 결정표" path=design/garden-skills/kb-retriever/references/pdf_reading.md lines=7:15
@source pr-prio title="pdf_reading.md · 텍스트 추출 우선순위" path=design/garden-skills/kb-retriever/references/pdf_reading.md lines=17:23
@source pr-quick title="pdf_reading.md · pdftotext는 파일로 출력" path=design/garden-skills/kb-retriever/references/pdf_reading.md lines=25:46
@source pr-ocr title="pdf_reading.md · 스캔 PDF OCR" path=design/garden-skills/kb-retriever/references/pdf_reading.md lines=258:276
@source pr-perf title="pdf_reading.md · 성능 최적화" path=design/garden-skills/kb-retriever/references/pdf_reading.md lines=336:342
@source pr-ref title="pdf_reading.md · 빠른 참조표" path=design/garden-skills/kb-retriever/references/pdf_reading.md lines=344:353
@source er-all title="design/garden-skills/kb-retriever/references/excel_reading.md · 1742B · pandas 읽기" path=design/garden-skills/kb-retriever/references/excel_reading.md lines=1:21
@source er-big title="excel_reading.md · 큰 파일" path=design/garden-skills/kb-retriever/references/excel_reading.md lines=61:72
@source ea-head title="design/garden-skills/kb-retriever/references/excel_analysis.md · 2745B · 빠른 참조" path=design/garden-skills/kb-retriever/references/excel_analysis.md lines=1:15
@source ea-group title="excel_analysis.md · 분석 예시" path=design/garden-skills/kb-retriever/references/excel_analysis.md lines=17:34
@source sc-all title="design/garden-skills/kb-retriever/scripts/convert_pdf_to_images.py · 1123B · PDF 페이지를 PNG로" path=design/garden-skills/kb-retriever/scripts/convert_pdf_to_images.py lines=1:35

## 언제 켜지고, 사람은 어디서 개입하나 {#trigger}

@code source=kb-fm language=yaml

`description`은 중국어 원문이다. 로컬 지식 폴더를 대상으로 한 검색·질의응답 도우미라고 밝히고, 사용자 질문이 "지식 폴더에서 답하기, 정보 검색, 자료 찾기"에 해당하면 쓰라고 한다.[](source:kb-fm) 호출 제한 필드가 없어서 모델이 이 설명을 참고해 켤 수 있다. 판정: `description`은 판단용 설명이지, 특정 단어가 있으면 켜지는 목록이 아니다.

이 스킬은 지식 폴더를 들고 오지 않는다. 사용자가 자기 자료를 준비해야 한다.[](source:rd-setup)

| 지점 | 에이전트가 하는 일 | 사람의 몫 |
| --- | --- | --- |
| 루트 경로 | 사용자가 경로를 말했으면 그대로 쓴다. 원문 예: "我的知识库在 /data/kb", "用 ./docs 这个目录作为知识库"[](source:kb-root) | {good:경로를 말한다} |
| 기본 경로가 없을 때 | `test -d knowledge`로 확인하고, 없으면 다른 폴더를 추측하지 않는다. 기본 루트를 못 찾았다고 알리고 실제 경로를 묻는다[](source:kb-locate) | {caution:경로를 알려 준다} |
| 색인 준비 | 각 폴더의 `data_structure.md`를 읽어 길을 정한다. README가 Purpose, Files, Coverage 절로 된 틀을 준다[](source:kb-root)[](source:rd-tmpl) | {caution:색인을 써 둔다} |
| 정보가 부족할 때 | 못 찾았다고 말하고, 가장 가까운 정보와 불확실성을 준다. 더 구체적인 파일, 키워드, 기간을 달라고 한다[](source:kb-iter)[](source:kb-style) | 범위를 좁혀 준다 |

**쓰면 안 되는 때.** 원문이 이 스킬 사용 자체를 막는 작업은 `원문에 명시 없음`이다. 이 스킬을 쓰는 동안 금지하는 행동은 분명하다.

| 금지 | 원문의 이유 |
| --- | --- |
| 웹 검색 등 다른 도구로 지식을 가져온다 {bad:금지} | 이 스킬로 지식 폴더를 조회할 때의 규칙이다[](source:kb-note) |
| `Glob "knowledge" in .`처럼 Glob으로 폴더가 있는지 판단한다 {bad:금지} | Glob은 파일 경로만 돌려줘서, 빈 결과로는 "폴더 없음"과 "폴더가 비어 있음"을 가르지 못한다. 폴더 확인은 `test -d`(차선 `ls -d`)로 한다[](source:kb-locate)[](source:kb-note) |
| `pdf_reading.md`를 읽지 않고 PDF를 처리한다 {bad:금지} | 강제 점검표[](source:kb-learn) |
| `excel_reading.md`를 읽지 않고 Excel을 처리한다 {bad:금지} | 강제 점검표. Excel은 `excel_analysis.md`도 먼저 읽는다[](source:kb-learn)[](source:kb-s3) |
| 변환 단계를 건너뛰고 원본 PDF·Excel에서 바로 검색한다 {bad:금지} | 강제 점검표[](source:kb-learn) |
| 큰 파일을 처음부터 끝까지 읽는다 {bad:금지} | 색인, 목차, 키워드로 범위를 먼저 좁힌다[](source:kb-tools) |
| 사실을 지어낸다 {bad:금지} | 정보가 없거나 불확실하면 그렇다고 말한다[](source:kb-style) |

판정: 이 스킬은 `design` 컬렉션에 있지만 디자인 작업과 관련이 없다. 관계 원장에도 다른 스킬과 연결이 없는 독립 스킬로 올라 있다.

## 어떤 순서로 찾고 언제 멈추나 {#procedure}

@workflow id=kb-flow title="지식 폴더 검색 흐름"
| lane find | 찾을 곳 정하기 |
| lane read | 읽고 검색하기 |
| lane answer | 답하기 |
| kf-need | 1 요구 이해 | external | find |
| kf-root | 루트 폴더 있나? | backend | find |
| kf-ask | 경로 묻기 | external | find |
| kf-index | 2 색인 따라 내려가기 | backend | find |
| kf-learn | 3 처리법 읽기(PDF·Excel) | backend | read |
| kf-search | 4 변환과 검색 | backend | read |
| kf-enough | 답할 근거 충분? | backend | read |
| kf-answer | 6 답과 출처 | backend | answer |
| kf-short | 부족하다고 알림 | backend | answer |
| kf-need > kf-root | |
| kf-root > kf-ask | 아니오 |
| kf-root > kf-index | 예 |
| kf-index > kf-learn | 대상 목록 | emphasis |
| kf-learn > kf-search | |
| kf-search > kf-enough | |
| kf-enough > kf-search | 아니오, 5회 미만 |
| kf-enough > kf-answer | 예 | emphasis |
| kf-enough > kf-short | 5회 도달 |

@steps id=kb-steps
| kf-need | 1 요구 이해 | 질문에서 주제·분야 키워드(예: "销售报表", "接口文档"), 시간·범위 조건(예: "2023 年 Q1"), 원하는 결과 종류(설명, 요약, 특정 값)를 뽑는다.[](source:kb-s1) | kb-flow | kf-need |
| kf-root | 루트 폴더 있나? | 사용자가 준 경로가 먼저다. 없으면 현재 프로젝트의 `knowledge/`를 `test -d`로 확인한다. 폴더가 확인된 뒤에만 Glob을 쓴다. 예: `pattern="**/data_structure.md"`, `path="knowledge"`.[](source:kb-locate) | kb-flow | kf-root |
| kf-ask | 경로 묻기 | 기본 루트가 없거나 구조가 이상하면 추측하지 않고 사용자에게 묻는다.[](source:kb-s1)[](source:kb-locate) | kb-flow | kf-ask |
| kf-index | 2 색인 따라 내려가기 | 현재 폴더의 `data_structure.md`를 앞부분부터 읽는다(예: limit=300, 필요하면 나눠 읽기). 질문과 가장 관련 있는 하위 폴더·파일을 골라 그 폴더로 들어가 같은 일을 되풀이한다. 모든 갈래를 한꺼번에 파지 않는다. 고른 파일이 검색 대상 목록이 된다.[](source:kb-s2) | kb-flow | kf-index |
| kf-learn | 3 처리법 읽기(PDF·Excel) | 대상 목록에 PDF나 Excel이 있을 때만 강제되는 단계다. Markdown·텍스트만 있으면 건너뛴다. PDF면 `references/pdf_reading.md`, Excel이면 `excel_reading.md`와 `excel_analysis.md`를 읽는다. 원문은 이 폴더가 지식 폴더가 아닌 스킬 폴더 안에 있다고 거듭 짚는다.[](source:kb-s3) | kb-flow | kf-learn |
| kf-search | 4 변환과 검색 | 배운 방법으로 파일을 추출·변환한 뒤, 가장 관련 있는 파일부터 국소적으로 검색한다. 한 파일에서 만족스러운 정보가 없으면 다음 후보로 넘어간다.[](source:kb-s4) | kb-flow | kf-search |
| kf-enough | 답할 근거 충분? | 매 회차 키워드를 갱신하고, 덜 본 파일이나 부분을 골라 검색하고, 찾은 조각으로 답할 수 있는지 판단한다. 시도 횟수를 세고 최대 5회에서 멈춘다.[](source:kb-iter) | kb-flow | kf-enough |
| kf-answer | 6 답과 출처 | 결론을 먼저 말하고 근거를 짧게 붙인다. 쓴 파일 이름과 대략의 위치를 적는다. 원문 예: "design/api_gateway.md 第 100 行附近", "reports/2023_Q1_sales.xlsx Summary 工作表". 질문한 언어로 답한다.[](source:kb-s6)[](source:kb-style) | kb-flow | kf-answer |
| kf-short | 부족하다고 알림 | 지식 폴더에 없을 수 있다고 분명히 말하고, 가장 가까운 정보를 불확실성과 함께 준다. 범위를 좁힐 방법(파일 이름, 키워드, 기간)을 제안한다.[](source:kb-iter) | kb-flow | kf-short |

추론으로 답했거나 정보가 불완전하면 에이전트는 가정과 불확실성을 표시한다.[](source:kb-s6) 색인에서 우선순위를 정할 때는 용도 설명이 주제와 잘 맞는 폴더·파일을 먼저 보고, 시간·버전 조건을 그다음으로 본다. README나 전체 설계 같은 일반 설명 문서는 뒤로 미룬다.[](source:kb-s2)

## 파일 형식마다 무엇을 쓰고, 수치는 무엇인가 {#formats}

| 형식 | 에이전트가 하는 일 | 원문 규칙 |
| --- | --- | --- |
| Markdown·텍스트(`.md`, `.txt`, `.log`) | 색인과 파일 이름으로 후보를 고르고, 요약·설계 개요 같은 목차형 문서를 먼저 본다. `grep`에 확장자를 지정하고, 맞은 줄 앞뒤 수십 줄만 offset과 limit으로 읽는다[](source:kb-md) | 목차뿐인 문서는 링크나 소제목을 따라 더 들어간다[](source:kb-md) |
| PDF | `data_structure.md` 설명으로 가장 관련 있는 1~3개를 고른다. 사용자가 지목한 PDF가 있으면 그것이 먼저다. `pdftotext input.pdf output.txt`로 파일에 추출하고 그 텍스트를 `grep`한다. 표는 pdfplumber로 뽑는다[](source:kb-pdf) | 추출 결과를 stdout으로 내보내지 않는다. 토큰을 많이 먹기 때문이다. 위치는 "파일 이름 + 페이지 + 조각"으로 남긴다[](source:kb-pdf)[](source:pr-quick) |
| Excel | 색인과 시트 이름으로 표를 고른다. "报表", "统计", "日志", "配置", "映射"이 든 통합 문서·시트를 먼저 본다. pandas로 `nrows`를 걸어 앞 10~50행만 읽고 열 이름과 타입을 파악한다[](source:kb-xls) | 질문과 맞는 열로 거르고 집계한다(예: `df[df['column'] == value]`). 기간 조건이 있으면 시간 필터를 넣는다. 표 전체를 한 번에 읽지 않는다[](source:kb-xls) |

@facts
| 키워드 수 | 질문에서 3~8개. 영어 약어, 동의어, 상위·하위어를 포함한다(예: "uv", "pv", "GMV")[](source:kb-kw) |
| 검색 횟수 | 최대 5회(의무). 회차마다 횟수를 센다[](source:kb-iter) |
| Read 범위 | 합리적인 limit, 예로 200~500줄과 알맞은 offset을 늘 지정한다[](source:kb-tools) |
| 색인 읽기 | 예시 limit=300. 필요하면 나눠 읽는다[](source:kb-s2) |
| PDF 후보 | 가장 관련 있는 1~3개[](source:kb-pdf) |
| Excel 미리보기 | `nrows`로 앞 10~50행[](source:kb-xls) |
| `grep` 범위 | include와 path를 최대한 좁혀 지정하고, 폴더 전체를 검색하지 않는다[](source:kb-grep) |

**`pdf_reading.md`가 정한 도구 순서.** 이 문서는 PDF를 다루기 전에 "끝까지" 읽으라고 머리말에 적는다.[](source:pr-head) 텍스트 추출 우선순위는 pdftotext 명령, pdfplumber(레이아웃·표), pypdf(가벼운 추출), OCR(스캔 PDF 전용) 순이다.[](source:pr-prio)

| 상황 | 권장 도구 | 예시 |
| --- | --- | --- |
| 일반 텍스트 추출 | pdftotext | `pdftotext input.pdf output.txt`[](source:pr-table) |
| 레이아웃 유지 | `pdftotext -layout` | `pdftotext -layout input.pdf output.txt`[](source:pr-table) |
| 표 추출 | pdfplumber | `page.extract_tables()`[](source:pr-table) |
| 메타데이터 | pypdf | `reader.metadata`[](source:pr-table) |
| 스캔 PDF | OCR(pytesseract) | 이미지로 바꾼 뒤 OCR[](source:pr-table)[](source:pr-ocr) |
| 큰 PDF | 페이지 범위 추출 | `pdftotext -f 1 -l 5 input.pdf output.txt`[](source:pr-quick)[](source:rd-faq) |

**Excel 문서.** `excel_reading.md`는 `sheet_name`, `nrows`, `usecols`로 필요한 부분만 읽는 법과 `dtype`, 엔진 선택을 다룬다. 큰 파일은 앞 몇 행으로 구조부터 본다.[](source:er-all)[](source:er-big) `excel_analysis.md`는 조건 필터, `groupby` 집계, 정렬, 파생 열, `describe`의 예를 든다.[](source:ea-head)

**스크립트.** `scripts/convert_pdf_to_images.py`는 PDF 각 페이지를 dpi 200으로 이미지로 바꾸고, 가로·세로가 1000px를 넘으면 줄여 `page_N.png`로 저장한다. 인자는 입력 PDF와 출력 폴더 두 개다.[](source:sc-all)

`SKILL.md`는 이 스크립트를 부르지 않는다. README만 텍스트 추출이 쓸모없는 스캔 PDF용 대안으로 소개한다.[](source:rd-tools) 이 분석에서는 실행하지 않았다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 7개, 합계 36,875B다. `SKILL.md` 13,984B, `README.md` 7,249B, `manifest.json` 546B, `references/pdf_reading.md` 9,486B, `references/excel_reading.md` 1,742B, `references/excel_analysis.md` 2,745B, `scripts/convert_pdf_to_images.py` 1,123B다. 구조·표본만 본 파일은 없다.
- 제외한 파일 6개: 번역본 `SKILL.ko.md`, `README.ko.md`, `references/*.ko.md` 3개, 그리고 `README.zh-CN.md`다. `README.zh-CN.md`는 같은 폴더에 영어 `README.md`가 있어 브리프 규칙대로 번역본으로 보고 열지 않았다. `SKILL.md`가 중국어 원본이므로 이 판단이 틀렸을 수 있다. 이 스킬의 지시 내용은 `SKILL.md`와 `references/`가 근거라 결론에는 영향이 없다고 본다.
- 바이너리: 스킬 폴더에 없다. README가 가리키는 표지 이미지 `../../dist/imgs/covers/kb-retriever.webp`는 이 저장소에 없다.
- `manifest.json`은 version 1.0.1, 분류 "Retrieval / Local Knowledge Base", 호환 도구로 claude-code, claude-ai, cursor, codex-cli, gemini-cli, opencode를 적는다.[](source:mf-all)
- 관계: `design/relations.md`에서 독립 스킬이고 다른 스킬과 연결이 없다. 원문에도 형제 스킬 이름이 나오지 않는다.
- 원문 대조 범위: 활성화 제한 1개(호출 제한 필드 없음), 사람 개입 4곳, 금지 7행, 종료 조건 2개(근거 확보, 5회 도달), 수치 7행(3~8, 5회, 200~500줄, limit=300, 1~3개, 10~50행, 그리고 스크립트의 dpi 200·1000px)을 모두 대조했다.
- 분석 중 바뀐 파일: 없다.

@callout level=open-question title="원문끼리 부딪치거나 확인하지 못한 곳"
- 루트 기본값이 두 군데에서 다르다. 지식 폴더 절과 루트 찾기 절은 기본을 `knowledge/`로 두는데, 2단계는 사용자가 지정하지 않으면 "当前目录"(현재 폴더)에서 시작한다고 적는다. 우선순위는 원문에 없다.[](source:kb-root)[](source:kb-s2)
- 지식 폴더 절은 PDF·Excel을 "对应 Skill"(해당 스킬)로 구조화하라고 하고, 반복 검색 절도 "专用 Skill 调用"을 든다. 어느 스킬인지 이름이 없어 `불명`이다. 나머지 절은 같은 일을 `references/` 문서로 처리하게 한다.[](source:kb-root)[](source:kb-iter)
- `pdf_reading.md`의 빠른 참조표는 텍스트 추출 최적 도구를 pdfplumber로, 명령행 예를 출력 파일 없는 `pdftotext -layout input.pdf`로 적는다. 같은 문서의 우선순위(pdftotext 먼저)와 "파일로만 출력" 규칙과 어긋난다.[](source:pr-ref)[](source:pr-prio)[](source:pr-quick)
- `excel_analysis.md`의 예시는 `pd.read_excel("sales.xlsx")`로 표 전체를 읽는다. `SKILL.md`의 "표 전체를 한 번에 읽지 않는다"와 다르다. 예시는 분석 문법을 보여 주는 용도로 읽힌다(판정).[](source:ea-group)[](source:kb-xls)
- 5단계는 반복 검색 규칙을 "上文"(위에서 본) 공통 원칙이라 부르지만, 그 절은 실제로 아래에 있다. 내용 차이는 없다.[](source:kb-s5)
- 이 스킬이 실제로 토큰을 얼마나 줄이는지, 5회 안에 답을 찾는 비율이 어떤지는 실행하지 않아 확인하지 못했다.
