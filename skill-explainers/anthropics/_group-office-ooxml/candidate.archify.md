# docx, pptx, xlsx는 어떻게 한 묶음인가 {#office-ooxml}

세 스킬은 파일 형식만 다른 변형이다. 서로를 부르지도, 순서를 정하지도 않는다. 공통점은 파일을 ZIP+XML로 보고 `scripts/office/` 도구 사본을 각자 들고 있다는 것이다. 에이전트는 사용자가 다루는 파일 형식 하나만 골라 그 스킬을 쓴다.[](source:d-top)[](source:p-top)[](source:x-top)

- `docx`와 `pptx`는 `.docx`·`.pptx`가 ZIP 아카이브라고 설명하고, 새로 만들기와 기존 파일 편집을 나눈다.[](source:d-top)[](source:p-top)
- `xlsx`는 편집 뒤 `scripts/recalc.py`로 수식을 다시 계산해 검증한다. XML 편집과 `validate.py` 쪽은 아니다.[](source:x-top)[](source:x-recalc)
- `scripts/office/` 폴더는 세 스킬에서 파일 단위로 동일하다. 하지만 SKILL.md가 쓰라고 지시하는 범위는 스킬마다 다르다.[](source:d-val)[](source:p-tools)[](source:x-dep)

@answer scope="anthropics 묶음 office-ooxml · 커밋 b825733 · 스킬 페이지 3개와 원장 r01~r06을 대조 · 실행하지 않음(지시상 동작)"
@meta locale=ko
@source d-top title="anthropics/docx/SKILL.md · 방식 선택 표" path=anthropics/docx/SKILL.md lines=7:17
@source d-val title="anthropics/docx/SKILL.md · 렌더링과 validate.py" path=anthropics/docx/SKILL.md lines=37:57
@source p-top title="anthropics/pptx/SKILL.md · 방식 선택 표" path=anthropics/pptx/SKILL.md lines=7:19
@source p-tools title="anthropics/pptx/SKILL.md · 도구 표" path=anthropics/pptx/SKILL.md lines=21:27
@source p-qa title="anthropics/pptx/SKILL.md · 시각 QA 렌더링" path=anthropics/pptx/SKILL.md lines=226:232
@source x-top title="anthropics/xlsx/SKILL.md · 방식 선택 표" path=anthropics/xlsx/SKILL.md lines=7:18
@source x-recalc title="anthropics/xlsx/SKILL.md · recalc 명령" path=anthropics/xlsx/SKILL.md lines=30:38
@source x-dep title="anthropics/xlsx/SKILL.md · 의존 도구" path=anthropics/xlsx/SKILL.md lines=99:99
@source x-imp title="anthropics/xlsx/scripts/recalc.py · office.soffice import" path=anthropics/xlsx/scripts/recalc.py lines=19:19
@source x-vfam title="anthropics/xlsx/scripts/office/validate.py · xlsx 계열은 검증 없이 종료" path=anthropics/xlsx/scripts/office/validate.py lines=142:148
@source d-desc title="anthropics/docx/SKILL.md · description" path=anthropics/docx/SKILL.md lines=3:3
@source x-desc title="anthropics/xlsx/SKILL.md · description" path=anthropics/xlsx/SKILL.md lines=3:3
@source rel title="anthropics/relations.md" path=skill-explainers/anthropics/relations.md

## 작업 목표와 스킬 선택 {#goal}

작업 목표는 Office 문서를 만들고 고치고 검증하는 것이다. 에이전트는 파일 형식으로 스킬을 고른다. 아래 표의 상대 경로는 색인 기준이다.

| 파일 형식 | 스킬 | 만들기 | 기존 파일 편집 | 마무리 검증 | 역할 |
| --- | --- | --- | --- | --- | --- |
| Word(`.docx`·`.dotx`) | `anthropics/docx/docx.html` | `docx`(npm) 스크립트[](source:d-top) | `unzip` → `word/document.xml` 편집 → `zip`[](source:d-top) | `validate.py --original`, PDF 렌더링 후 이미지 확인[](source:d-val) | 변형 |
| PowerPoint(`.pptx`·`.potx`) | `anthropics/pptx/pptx.html` | `pptxgenjs` 스크립트[](source:p-top) | 압축 해제 후 XML 편집, `add_slide.py`[](source:p-tools) | `validate.py`, PDF 렌더링 후 이미지 확인[](source:p-qa) | 변형 |
| 스프레드시트(`.xlsx`·`.csv` 등) | `anthropics/xlsx/xlsx.html` | `openpyxl`[](source:x-top) | `openpyxl`[](source:x-top) | `scripts/recalc.py`로 수식 재계산[](source:x-recalc) | 변형 |

활성화 경계는 description 문장이다. `docx`는 PDF·스프레드시트·Google Docs를 활성화 범위에서 뺀다.[](source:d-desc) `xlsx`는 주 산출물이 Word 문서이면 켜지 않는다고 적는다.[](source:x-desc) 둘 다 경계 선언이며 다른 스킬을 부르라는 지시는 아니다(r04, r05).

`pptx`와 `pdf` 쪽에는 대응 문장을 이 분석에서 따로 대조하지 않았다.

## 공유 상태는 무엇인가 {#shared}

세 스킬이 같은 경로를 읽고 쓰는 일은 없다. 같은 도구 파일의 사본을 각자 갖고 있다(r01~r03, 근거 방식 추론).[](source:rel)

사본이라 한 스킬의 `scripts/office/`를 고쳐도 다른 스킬에는 반영되지 않는다. 판정: 스킬을 업데이트할 때 세 폴더를 함께 확인해야 한다. 이 판정을 받치는 사실은 `diff -rq`로 폴더 전체가 같다는 확인이다.

| 파일 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `scripts/office/soffice.py` | 세 스킬에 사본 | `docx`와 `pptx`는 PDF 변환 명령으로 부른다.[](source:d-val)[](source:p-qa) `xlsx`는 `recalc.py`가 import한다.[](source:x-imp) |
| `scripts/office/validate.py` | 세 스킬에 사본 | `docx`와 `pptx` SKILL.md가 부른다.[](source:d-val)[](source:p-tools) `xlsx` SKILL.md는 부르지 않고, xlsx 계열 파일을 받으면 검증 없이 `recalc.py` 안내만 내고 종료한다.[](source:x-vfam) |
| `scripts/office/validators/`, `helpers/`, `schemas/` | 세 스킬에 사본 | 세 SKILL.md 모두 폴더를 직접 언급하지 않는다. 쓰이는 범위는 각 스킬 페이지에 있다. |

@tree id=shared-tree title="스킬마다 들어 있는 scripts 폴더"
| scripts | scripts | - |
| office | scripts/office (세 스킬에서 동일) | scripts |
| soffice | soffice.py | office |
| validate | validate.py | office |
| validators | validators/ | office |
| schemas | schemas/ | office |
| recalc | recalc.py (xlsx에만 있음) | scripts |

## 원장과 어긋난 점은 무엇인가 {#audit}

- 그림에서 뺀 관계: r06(docx·pptx 시각 점검 절차 공통)은 선후 관계가 없고 근거가 `미확인`이라 표에만 남겼다. r07(pdf→xlsx)은 이 묶음에 속하지 않는다.
- 이 페이지의 모든 관계는 `anthropics/relations.md`의 rel-id와 종류·조건이 같다. 원장 r02의 xlsx 쪽 서술은 이 분석에서 `recalc.py` import 사실에 맞게 고쳤다.
- 이 묶음에는 순서·반복·위임이 없어 `@workflow`를 그리지 않았다. 억지로 그리면 원문에 없는 선후를 만든다.
- 안내 역할 스킬: 없음.

@callout level=open-question title="확인하지 못한 것"
세 스킬을 실제로 함께 쓰는 작업(예: Word 보고서를 PowerPoint로 옮기기)에서 에이전트가 어느 스킬을 먼저 고르는지는 원문에 명시 없음. 사람 검토와 브라우저 점검은 미실시.
