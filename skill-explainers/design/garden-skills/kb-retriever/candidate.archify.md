# kb-retriever — 계층 색인과 파일별 전처리로 로컬 지식 폴더를 단계적 검색해 답한다 {#overview}

에이전트는 로컬 지식 폴더의 계층 색인을 따라 관련 파일만 고른 뒤, 형식별 전처리와 단계적 검색으로 근거를 찾아 답한다.[](source:fm)[](source:flow12)[](source:flow56)

- 사용자가 로컬 지식 폴더에서 자료 검색이나 질의응답을 청하면 켜지며, 문서 형식(Markdown·텍스트, PDF, Excel)에 따라 처리 경로가 갈린다.[](source:fm)[](source:flow34)
- 결과로 출처(파일명과 대략의 장·행·쪽·시트 위치)가 달린 답변을 남기며, 정보가 부족하면 확인된 범위와 불확실성을 밝혀 재질문한다.[](source:flow56)[](source:reply)
- 조사 범위에서 확인된 연결 없음
- 파일 전체를 한꺼번에 읽거나, PDF·Excel 안내 문서를 읽기 전에 파일을 먼저 열거나, 지식 폴더 밖의 웹 검색을 쓰지 않는다.[](source:learn)[](source:search)[](source:tools)

@answer scope="design/garden-skills/kb-retriever · 원본 파일 8개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: name·description" path=design/garden-skills/kb-retriever/SKILL.md lines=1:4
@source root title="지식 폴더 구조와 루트 경로 확인 규칙" path=design/garden-skills/kb-retriever/SKILL.md lines=8:33
@source learn title="선학습 체크리스트와 금지 행위" path=design/garden-skills/kb-retriever/SKILL.md lines=34:47
@source flow12 title="1~2단계: 요청 파악과 계층 색인 탐색" path=design/garden-skills/kb-retriever/SKILL.md lines=50:78
@source flow34 title="3~4단계: 안내 선독과 파일별 처리" path=design/garden-skills/kb-retriever/SKILL.md lines=79:96
@source flow56 title="5~6단계: 반복 검색과 답변·출처 정리" path=design/garden-skills/kb-retriever/SKILL.md lines=97:108
@source search title="키워드·grep 원칙과 5회 반복 검색 제한" path=design/garden-skills/kb-retriever/SKILL.md lines=111:145
@source mdstrat title="Markdown·텍스트 파일 검색 전략" path=design/garden-skills/kb-retriever/SKILL.md lines=148:162
@source pdfstrat title="PDF 파일 전처리와 검색 전략" path=design/garden-skills/kb-retriever/SKILL.md lines=164:185
@source xlsstrat title="Excel 파일 구조 파악과 필터 검색 전략" path=design/garden-skills/kb-retriever/SKILL.md lines=187:211
@source tools title="도구 조합 원칙과 대용량 파일 읽기 제한" path=design/garden-skills/kb-retriever/SKILL.md lines=213:231
@source reply title="답변 언어와 정보 부족 시 안내 규칙" path=design/garden-skills/kb-retriever/SKILL.md lines=233:247
@source ref-pdf title="PDF 추출 우선순위와 파일 저장 규칙" path=design/garden-skills/kb-retriever/references/pdf_reading.md lines=1:47
@source ref-xls-read title="Excel 부분 읽기(nrows·usecols) 안내" path=design/garden-skills/kb-retriever/references/excel_reading.md lines=1:21
@source ref-xls-ana title="pandas 데이터 필터·집계 안내" path=design/garden-skills/kb-retriever/references/excel_analysis.md lines=1:16
@source script-pdfimg title="스캔 PDF 페이지 이미지 변환 스크립트" path=design/garden-skills/kb-retriever/scripts/convert_pdf_to_images.py lines=10:35
@source readme-tmpl title="data_structure.md 권장 형식" path=design/garden-skills/kb-retriever/README.md lines=73:91
@source readme-script title="도구 요구사항과 스캔 PDF 폴백 안내" path=design/garden-skills/kb-retriever/README.md lines=182:192

## 어떻게 동작하나 {#flow span=12}

에이전트는 요청을 받은 뒤 루트 폴더 확인, 계층 색인 탐색, 형식별 선학습, 추출 및 단계적 검색(최대 5회 반복), 출처 기반 답변 순으로 진행한다.[](source:flow12)[](source:flow34)[](source:search)

@workflow id=flow-diagram title="kb-retriever 흐름"
| lane prepare | 경로와 색인 탐색 |
| lane prestudy | 형식별 선학습 |
| lane retrieve | 추출과 반복 검색 |
| lane answer | 근거 정리와 답변 |
| req | 요청과 루트 확인 | external | prepare | source:flow12 |
| rootok | 루트 폴더 존재? | backend | prepare | source:root |
| askroot | 경로 확인 후 중단 | security | prepare | source:root |
| nav | 색인 트리 내려가기 | backend | prepare | source:flow12 |
| needdoc | PDF·Excel 있나? | backend | prestudy | source:learn |
| study | 처리 안내 먼저 읽기 | backend | prestudy | source:flow34 |
| search | 추출과 단계적 검색 | backend | retrieve | source:search |
| enough | 근거 충분한가? | backend | retrieve | source:search |
| reply | 출처 붙여 답변 | backend | answer | source:flow56 |
| insufficient | 부족 알림·범위 좁히기 | security | answer | source:search |
| req > rootok | |
| rootok > askroot | 없음 | dashed |
| rootok > nav | 확인됨 | emphasis |
| nav > needdoc | 후보 확정 |
| needdoc > study | PDF·Excel | emphasis |
| needdoc > search | 텍스트만 |
| study > search | 안내 숙지 |
| search > enough | |
| enough > reply | 충분함 | emphasis |
| enough > search | 부족(5회 미만) | dashed |
| enough > insufficient | 5회 도달 | dashed |

@steps id=flow-steps
| s-req | 요청과 루트 확인 | **입력** 사용자 질문 · **출력** 핵심 키워드·범위·후보 루트 경로. **처리** 질문에서 주제·기간·출력 형식을 뽑고, 지정 경로가 없으면 기본 경로 `knowledge/`를 점검 대상으로 잡는다.[](source:flow12) | flow-diagram | req |
| s-rootok | 루트 폴더 존재? | **입력** 대상 루트 경로 · **실행** `test -d knowledge` 또는 `ls -d knowledge` · **출력** 폴더 존재 여부. **처리** shell 명령으로 지식 폴더가 실제 있는지 확인하며 `Glob "knowledge" in .` 호출은 금지한다.[](source:root) | flow-diagram | rootok |
| s-askroot | 경로 확인 후 중단 | **입력** 존재 확인 실패 · **출력** 경로 지정 요청 메시지. **처리** 기본 `knowledge/` 폴더를 찾지 못하면 다른 폴더를 추측하지 않고 사용자에게 실제 경로를 물어보고 멈춘다.[](source:root)[](source:flow12) | flow-diagram | askroot |
| s-nav | 색인 트리 내려가기 | **입력** 확인된 지식 폴더 루트 · **참조** 각 디렉터리의 `data_structure.md` · **출력** 우선순위가 매겨진 후보 파일 목록. **처리** `data_structure.md` 앞부분(예: `limit=300`)을 읽어 관련 하위 폴더로만 재귀 탐색하고 일반 문서보다 주제·시점 일치 파일을 앞세운다.[](source:flow12) | flow-diagram | nav |
| s-needdoc | PDF·Excel 있나? | **입력** 후보 파일 목록 · **출력** 형식별 분기 판정. **처리** 후보 목록에 PDF나 Excel 파일이 들어 있는지 확인해 선학습 단계 진입 여부를 가른다.[](source:learn)[](source:flow34) | flow-diagram | needdoc |
| s-study | 처리 안내 먼저 읽기 | **입력** PDF 또는 Excel 후보 목록 · **참조** `references/pdf_reading.md`, `references/excel_reading.md`, `references/excel_analysis.md` · **출력** 추출·필터 도구 계획. **처리** 처리 전 해당 참조 문서를 먼저 읽어 올바른 도구와 플래그를 익히며, 읽지 않고 원문을 여는 것은 금지한다.[](source:learn)[](source:flow34) | flow-diagram | study |
| s-search | 추출과 단계적 검색 | **입력** 후보 파일과 검색 키워드 3~8개 · **실행** `pdftotext input.pdf output.txt`, `pandas`, `Grep`, 부분 `Read` · **출력** 파일명·위치·문맥 조각 모음. **처리** PDF는 파일로 추출하고 Excel은 `nrows`로 구조를 본 뒤 필터링하며, 모든 형식에서 `Grep` 뒤 매칭 앞뒤 구간(예: 200~500줄)만 읽는다.[](source:search)[](source:mdstrat)[](source:pdfstrat)[](source:xlsstrat)[](source:tools) **다음** 다중 라운드 검색 횟수를 1 증가시킨다.[](source:search) | flow-diagram | search |
| s-enough | 근거 충분한가? | **입력** 수집된 문맥 조각과 시도 횟수 · **출력** 답변 가능 판정 또는 재검색 결정. **처리** 답변을 뒷받침할 근거가 모였으면 종료하고, 부족하면서 시도 횟수가 5회 미만이면 동의어·확장어로 키워드를 고쳐 다시 검색한다.[](source:search) | flow-diagram | enough |
| s-reply | 출처 붙여 답변 | **입력** 충분한 문맥 조각 · **출력** 결론·근거·출처 위치 목록. **처리** 질문과 같은 언어로 결론을 먼저 적고 사용한 파일명과 장·행·쪽·시트 위치를 붙이며, 추정이나 미완성 부분이 있으면 명시한다.[](source:flow56)[](source:reply) | flow-diagram | reply |
| s-insufficient | 부족 알림·범위 좁히기 | **입력** 5회 시도 후 남은 문맥 · **출력** 누락 안내·가장 가까운 단서·좁히기 제안. **처리** 5회 반복에도 충분한 근거를 못 찾으면 사실 지어내기를 피하고 찾은 범위의 불확실성과 함께 더 좁은 폴더·키워드·기간 제공을 요청한다.[](source:search)[](source:reply) | flow-diagram | insufficient |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자가 로컬 지식 폴더에서 정보 검색, 자료 조회, 질의응답을 요청하면 모델이 `description`을 보고 켠다. 호출 제한 필드는 없다.[](source:fm) |
| 성격 | 계층형 `data_structure.md` 탐색과 PDF·Excel 선학습·부분 추출로 token 낭비 없이 로컬 자료를 검색하는 절차 지침이다.[](source:fm)[](source:learn) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| 없음 {#none} | - | - | 조사 범위에서 확인된 연결 없음 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 전체 6단계 흐름, 선학습 금지, 형식별 검색 전략, 5회 반복 규칙을 담는다 | 스킬이 켜지면 읽는다 | 모든 단계 |
| `references/pdf_reading.md` | `pdftotext`·`pdfplumber`·`pypdf`·OCR 우선순위와 추출 명령을 안내한다 | 후보에 PDF가 있으면 처리 전 반드시 읽는다[](source:flow34)[](source:pdfstrat) | 처리 안내 먼저 읽기 · 추출과 단계적 검색 |
| `references/excel_reading.md` | `pandas`의 `nrows`·`usecols`·`dtype` 부분 읽기 방법을 안내한다 | 후보에 Excel이 있으면 처리 전 반드시 읽는다[](source:flow34)[](source:xlsstrat)[](source:ref-xls-read) | 처리 안내 먼저 읽기 · 추출과 단계적 검색 |
| `references/excel_analysis.md` | `pandas` 조건 필터·`groupby`·정렬·피벗·정제 방법을 안내한다 | 후보에 Excel이 있으면 처리 전 반드시 읽는다[](source:flow34)[](source:xlsstrat)[](source:ref-xls-ana) | 처리 안내 먼저 읽기 · 추출과 단계적 검색 |
| `scripts/convert_pdf_to_images.py` | PDF 각 쪽을 `dpi=200`, `max_dim=1000` 제한 PNG(`page_N.png`)로 저장한다 | `README.md`에서만 스캔 PDF 폴백으로 안내하며 `SKILL.md`에는 직접 호출 지시가 없다[](source:readme-script)[](source:script-pdfimg) | 흐름 밖: 스캔 PDF 폴백 |
| `README.md` / `README.zh-CN.md` | 사용자용 설치·`data_structure.md` 템플릿·도구 의존성을 설명한다 | 사람 안내용 문서이며 에이전트 실행 지시에는 없다[](source:readme-tmpl) | 흐름 밖: 사용자 문서 |
| `manifest.json` | 스킬 이름, 버전(`1.0.1`), 호환 클라이언트 목록을 기록한다 | 메타데이터 파일로 에이전트 실행 흐름에서는 읽지 않는다 | 흐름 밖: 패키지 메타데이터 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 루트 폴더 `knowledge/` 확인 | `test -d knowledge` 또는 `ls -d knowledge`를 쓰며, `Glob "knowledge" in .` 호출을 금지한다 | [](source:root)[](source:search) |
| 기본 `knowledge/` 없음·미지정 | 다른 경로를 추측하지 않고 사용자에게 실제 지식 폴더 경로를 묻고 멈춘다 | [](source:root)[](source:flow12) |
| PDF·Excel 파일 처리 전 | 해당 참조 문서(`pdf_reading.md`, `excel_reading.md`, `excel_analysis.md`)를 읽기 전 처리와 직접 검색을 금지한다 | [](source:learn)[](source:flow34) |
| `pdftotext` 실행 방식 | 반드시 파일(`output.txt`)로 저장해 검색하며 `stdout` 직접 출력(`-`)은 token 낭비로 금지한다 | [](source:pdfstrat)[](source:ref-pdf) |
| PDF·Excel 초기 탐색 범위 | PDF는 관련 파일 1~3개만 고르고, Excel은 `nrows`로 앞 10~50행만 먼저 읽어 구조를 파악한다 | [](source:pdfstrat)[](source:xlsstrat) |
| 본문 파일 읽기 방식 | 전체 파일을 처음부터 끝까지 읽지 않고 `Grep` 매칭 주변(`limit` 200~500줄 등)만 부분 읽기한다 | [](source:tools) |
| 외부 정보 도구 사용 | 이 스킬로 지식 폴더를 조회하는 동안 웹 검색 같은 외부 지식 도구를 쓰지 않는다 | [](source:search) |
| 반복 검색 횟수 상한 | 키워드 보완 재검색을 최대 5회로 제한하고, 넘기면 찾은 한도와 불확실성을 알려주고 범위 축소를 요청한다 | [](source:search)[](source:reply) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- PDF 추출 우선순위와 OCR·암호화 처리 — `처리 안내 먼저 읽기` · `pdftotext`·`pdfplumber`·`pypdf`·`pypdfium2`·`pytesseract` 선택표와 좌표 추출, 암호 해제 예시가 개요 밖에 있다.
- `pandas` Excel 필터·집계 패턴 — `추출과 단계적 검색` · `groupby`, `pivot_table`, `merge`, 결측치·형변환 코드 패턴이 개요에 요약만 있다.

읽은 원본: 텍스트 파일 8개(`SKILL.md`, `manifest.json`, `README.md`, `README.zh-CN.md`, `references/` 3개, `scripts/` 1개). 제외: `*.ko.md` 번역본 5개.
