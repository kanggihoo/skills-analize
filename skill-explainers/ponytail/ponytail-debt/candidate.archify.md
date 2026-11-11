# ponytail-debt는 미뤄 둔 작업을 어떻게 드러내나? {#ponytail-debt-page}

`ponytail-debt`는 주석에 적힌 한계와 재검토 조건을 모아 보고한다. 주석을 읽어서 집계하므로, 표시하지 않은 작업이나 실제 절감량까지 알아내지는 못한다.[](source:scan)[](source:output)

- `shortcut:`과 구형 `ponytail:`을 찾고 파일별로 한 줄씩 묶는다.[](source:scan)[](source:output)
- 재검토 조건이 없는 항목에는 `no-trigger`를 붙인다.[](source:output)
- 기본은 읽기와 보고만 한다. 파일 저장은 별도로 물어본 뒤 한다.[](source:boundary)

@answer scope="로컬 원본 분석 · 주석 집계 절차 · 실제 검색 미실행"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=835ad00af6ccb24e5ab01bbe0a91f878f95cc417
@source full title="ponytail/ponytail-debt/SKILL.md · 1813B · 원본" path=ponytail/ponytail-debt/SKILL.md
@source front title="ponytail/ponytail-debt/SKILL.md · 1813B · 원본" path=ponytail/ponytail-debt/SKILL.md lines=1:7
@source scan title="ponytail/ponytail-debt/SKILL.md · 1813B · 원본" path=ponytail/ponytail-debt/SKILL.md lines=9:24
@source output title="ponytail/ponytail-debt/SKILL.md · 1813B · 원본" path=ponytail/ponytail-debt/SKILL.md lines=26:39
@source boundary title="ponytail/ponytail-debt/SKILL.md · 1813B · 원본" path=ponytail/ponytail-debt/SKILL.md lines=41:44
@source producer title="ponytail/ponytail/SKILL.md · 3548B · 원본" path=ponytail/ponytail/SKILL.md lines=42:42
@source help title="ponytail/ponytail-help/SKILL.md · 3264B · 원본" path=ponytail/ponytail-help/SKILL.md lines=30:30
@source gain title="ponytail/ponytail-gain/SKILL.md · 2216B · 원본" path=ponytail/ponytail-gain/SKILL.md lines=38:48
@source lock title="ponytail/skills-lock.json · 1497B · 설치 출처" path=ponytail/skills-lock.json

## 언제 쓰고 무엇을 입력받나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 필드는 이 원문에 명시되어 있지 않다.[](source:front)

@code source=front language=yaml

원문은 미룬 작업 확인, 지름길 목록과 `/ponytail-debt`를 호출 맥락으로 든다. `/ponytail-debt TODO`처럼 사용자가 표식을 지정하면 기본 표식 대신 그 단어를 검색한다.[](source:front)[](source:scan)

## 어떤 순서로 주석을 거르나? {#scan}

@workflow id=debt-flow title="검색 결과에서 미룬 작업만 집계"
| search | 주석 검색 | backend | source:scan |
| defer | 미룬 작업? | backend | source:scan |
| skip | 제외 | external | source:scan |
| collect | 파일별 집계 | backend | source:output |
| search > defer | |
| defer > skip | 아니오 |
| defer > collect | 예 | emphasis |

@steps
| search-step | 주석 검색 | `.git`과 `.gitignore`가 무시하는 파일을 제외한다. 언어에 필요한 주석 접두어를 더한다.[](source:scan) | debt-flow | search |
| defer-step | 미룬 작업? | 표식 규칙을 설명하는 문장과 단축키 같은 동음이의 항목을 뺀다.[](source:scan) | debt-flow | defer |
| collect-step | 파일별 집계 | 적합한 주석 하나당 원장 한 줄을 만든다.[](source:output) | debt-flow | collect |

원문의 검색 명령은 분석 자료로만 읽었다. 여기서는 실행하지 않았다.[](source:scan)

## 무엇을 보고하고 무엇을 못하나? {#output}

| 출력·제약 | 동작 |
|---|---|
| 한 행 | `<file>:<line>`, 단순화한 것, `ceiling`, `upgrade`를 주석에서 그대로 가져온다.[](source:output) |
| 재검토 조건 누락 | upgrade 경로나 trigger가 없으면 `no-trigger`를 붙인다.[](source:output) |
| 담당자 | 원하면 `git blame -L<line>,<line>`을 더해 담당자를 찾는다. 필수 단계가 아니다.[](source:output) |
| 끝 | `<N> markers, <M> with no trigger.`로 집계한다. 없으면 `No shortcut debt. Clean ledger.`로 끝낸다.[](source:output) |
| 저장 | 읽고 보고하는 한 번의 작업이다. 저장하려면 물어본 다음 `PONYTAIL-DEBT.md` 같은 파일을 쓴다.[](source:boundary) |

판정 · 주석이 없다고 미룬 작업이 전혀 없다고 단정할 수는 없다. 검색 범위와 표식에 맞는 항목만 원장에 들어가기 때문이다. 설명용 예시로, `shortcut: 한 process까지만 지원`은 재검토 조건이 없어 `no-trigger`가 붙는다.[](source:scan)[](source:output)

## 다른 스킬과 어디에서 이어지나? {#position}

@workflow id=position-flow title="구현 주석을 선택적으로 집계"
| before | ponytail | backend | source:producer |
| current | ponytail-debt | backend | source:scan |
| before > current | 호환 R06 | emphasis |

@steps
| highlight | ponytail-debt | 이 페이지의 스킬이다. 앞 단계와 강제된 실행 순서는 없다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R06 · 산출물 호환 | ponytail이 한계와 재검토 조건을 남기면 `ponytail-debt`가 집계할 수 있다.[](source:producer)[](source:scan) |
| R04 · 참고 | `ponytail-help`는 `ponytail-debt` 명령을 안내한다. `ponytail-help`의 표에 tracked ledger라고 적혀 있어도 기본 저장은 저장 규칙의 별도 확인을 따른다.[](source:help)[](source:boundary) |
| R10 · 넘김 | gain은 현재 저장소의 집계를 알고 싶을 때 `ponytail-debt`를 안내한다. 자동 실행하지 않는다.[](source:gain) |

전체 관계는 색인 기준 `_group-minimal-code/minimal-code.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `ponytail/ponytail-debt/SKILL.md` 1개, 1,813B를 끝까지 읽었다.[](source:full) |
| 관계와 설치 출처 | 참조한 다른 스킬과 `skills-lock.json`을 포함해 텍스트 5개, 12,338B를 전부 읽었다. lock의 6개 항목을 확인했다.[](source:lock) |
| 제외 | 이 폴더의 `SKILL.ko.md`는 번역본이라 열지 않았다. 바이너리는 없다. |
| 부분 읽음 | 0개. 원자료가 없는 경우는 아래 미확인 항목에 따로 적었다. |

검색 제외, 표식 교체, 주석 필터, 선택적 blame, 집계 형식과 저장 전 확인을 모두 대조했다.

@callout level=open-question title="실행으로 확인하지 않은 부분"
| 검색 명령의 실제 호환성과 표식 누락률은 실행으로 확인하지 않았다. 사용자 정의 표식에서도 적용할 정확한 검색식은 원문에 명시 없음. |

분석 중 원본은 수정하지 않았다. 분석 전 사용자 승인으로 컬렉션 7개 파일을 commit했다. 새 분석 초안과 HTML, 관계 원장, 색인, 검증 보고서를 작성했다. 원문의 명령과 설치·설정 변경은 실행하지 않았다.
