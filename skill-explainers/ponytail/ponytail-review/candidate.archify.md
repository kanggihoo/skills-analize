# ponytail-review는 변경분에서 어떤 문제를 보고하나? {#ponytail-review-page}

`ponytail-review`은 diff와 연결된 코드를 읽고, 실제 오동작 사례가 있는 문제를 보고한다. 코드 수정은 하지 않는다.[](source:map)[](source:verify)[](source:finish)

- 정확성, 안전성, 예상 부하, 테스트, 속도, 불필요한 코드 순으로 본다.[](source:priority)
- 지적에는 문제 상황과 최소 수정안을 함께 적는다.[](source:verify)[](source:output)
- 대상이 없으면 미commit 변경을 보고, 그것도 없으면 마지막 commit을 본다.[](source:map)

@answer scope="로컬 원본 분석 · 보고 규칙 · 코드 수정 없음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=835ad00af6ccb24e5ab01bbe0a91f878f95cc417
@source full title="ponytail/ponytail-review/SKILL.md · 5244B · 원본" path=ponytail/ponytail-review/SKILL.md
@source front title="ponytail/ponytail-review/SKILL.md · 5244B · 원본" path=ponytail/ponytail-review/SKILL.md lines=1:9
@source priority title="ponytail/ponytail-review/SKILL.md · 5244B · 원본" path=ponytail/ponytail-review/SKILL.md lines=11:14
@source map title="ponytail/ponytail-review/SKILL.md · 5244B · 원본" path=ponytail/ponytail-review/SKILL.md lines=18:28
@source criteria title="ponytail/ponytail-review/SKILL.md · 5244B · 원본" path=ponytail/ponytail-review/SKILL.md lines=32:55
@source verify title="ponytail/ponytail-review/SKILL.md · 5244B · 원본" path=ponytail/ponytail-review/SKILL.md lines=59:67
@source output title="ponytail/ponytail-review/SKILL.md · 5244B · 원본" path=ponytail/ponytail-review/SKILL.md lines=71:99
@source finish title="ponytail/ponytail-review/SKILL.md · 5244B · 원본" path=ponytail/ponytail-review/SKILL.md lines=101:101
@source help title="ponytail/ponytail-help/SKILL.md · 3264B · 원본" path=ponytail/ponytail-help/SKILL.md lines=28:29
@source other title="ponytail/ponytail-audit/SKILL.md · 5520B · 원본" path=ponytail/ponytail-audit/SKILL.md lines=18:28
@source producer title="ponytail/ponytail/SKILL.md · 3548B · 원본" path=ponytail/ponytail/SKILL.md lines=42:44
@source lock title="ponytail/skills-lock.json · 1497B · 설치 출처" path=ponytail/skills-lock.json

## 언제 쓰고 무엇을 읽나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 필드는 이 원문에 명시되어 있지 않다.[](source:front)

@code source=front language=yaml

원문은 변경 리뷰, 마지막 commit, PR 검토, 과도한 설계 확인을 호출 맥락으로 든다. 사용자가 지정한 미commit·staged 변경, branch, PR 링크, 파일을 먼저 본다. 지정이 없으면 미commit 변경, 없으면 마지막 commit을 본다.[](source:front)[](source:map)

diff 다음에 변경 함수의 모든 호출자, 호출하는 함수, 테스트와 README를 읽는다. signature, 반환값, 동작이 바뀌면 모든 호출자를 검색한다.[](source:map)

예상 부하는 README나 배포 설정에서 찾고 보고서에 가정을 적는다. 한 사람이 쓰는 script와 여러 process가 공유하는 서비스는 같은 코드여도 문제가 생기는 조건이 다르기 때문이다.[](source:map)

## 무엇을 문제로 판단하나? {#rules}

| 기준 | 에이전트가 찾는 구체적인 문제 |
|---|---|
| Bug | 잘못된 결과, crash, 빈 값·0·마지막 항목·반올림·시간대, 호출자와 반환값의 불일치.[](source:criteria) |
| Risk | injection, 약한 난수, secrets, 입력 검사 누락, 삼킨 오류, 쓰기 순서와 transaction 누락.[](source:criteria) |
| Scale | 확인 후 쓰기의 경쟁, process마다 반복하는 작업, 계속 커지는 메모리, 항목별 query, 큰 입력의 `O(n^2)`, 공유해야 하는 개별 상태.[](source:criteria) |
| Missing test | branch, parser, 돈·security·데이터 쓰기처럼 위험한 로직을 실제로 보호하는 테스트 누락. 좋은 테스트 1개를 요구하며 coverage 목표 수치는 없다.[](source:criteria) |
| Speed | 큰 성능 저하는 문제로 본다. 작은 개선은 제안이며 millisecond가 중요한 제품 맥락도 고려한다.[](source:criteria) |
| Lean | 죽은 코드, 쓰지 않는 옵션, 추측한 기능, 재사용 가능한 중복, 불필요한 dependency·추상화·wrapper. 함께 바뀌는 사본은 합치고 서로 다른 일은 나눈다. 줄 수 때문에 함수를 나누지 않는다.[](source:criteria) |

보고 전에 구체적인 입력이나 상황으로 잘못된 결과를 설명해야 한다. 사례가 없으면 지적으로 올리지 않는다. 취향, 막연한 걱정, 불필요한 layer·framework·config 추가도 금지한다.[](source:verify)

보고 전에 호출자가 실제 있는지, 값이 비어 있을 수 있는지, 코드가 실제로 쓰이지 않는지 해당 줄을 다시 확인한다. bug fix에서 보호 테스트가 빠졌는지도 본다.[](source:verify)[](source:criteria)

@callout level=warning title="한계가 적힌 주석의 취급"
| `shortcut:` 또는 구형 `ponytail:` 주석에 한계가 적혀 있으면 의도한 선택으로 본다. 예상 부하가 이미 그 한계를 넘었을 때만 문제로 보고한다.[](source:verify) |

## 보고서는 무엇을 남기고 어디서 끝나나? {#output}

원문은 쉬운 영어를 요구한다. 이 분석 페이지는 저장소 지침에 따라 한국어로 작성했다. 각 지적의 배경, 문제, 수정, 미수정 영향을 1~2개의 짧은 문장씩 설명하게 한다.[](source:output)

| 구성 | 출력 규칙 |
|---|---|
| 시작 | `What this change does:`로 2~3문장을 쓴다.[](source:output) |
| 심각도 | `Must fix`는 bug·security·데이터 손실·예상 부하의 실패다. `Should fix`는 테스트 누락·실제 지연·중복·역할 혼합·불필요한 코드다. `Nice to have`는 작은 성능 개선·짧은 표현이다. 빈 그룹은 뺀다.[](source:output) |
| 지적 | 그룹 전체에서 번호를 이어 붙인다. 파일·줄 위치와 `What this is`, `Problem`, `Fix`, `If we skip it`을 적는다.[](source:output) |
| 마무리 | `Verdict: Ship.` 또는 `Verdict: fix 1 and 3 first.`를 적는다. 줄일 것이 있으면 `Lean: -<N> lines possible.`을 적는다. 중요한 미확인 사항이 있으면 `Not checked:`에 적는다.[](source:output) |
| 지적 없음 | 변경 설명 다음에 `Looks good. Ship.`과 확인 범위를 적는다. 지적 개수 상한은 원문에 명시 없음.[](source:output) |

판정 · 전체 저장소의 위험을 찾으려면 ponytail-audit를 선택할 수 있다. 자동 수정까지 원한다면 이 스킬의 보고 이후 별도 작업이 필요하다.[](source:other)[](source:finish)

## 다른 스킬과 어디에서 이어지나? {#position}

@workflow id=position-flow title="명령 안내와 보고의 경계"
| before | ponytail-help | external | source:help |
| current | ponytail-review | backend | source:map |
| before > current | 참고 R02 | emphasis |

@steps
| highlight | ponytail-review | 이 페이지의 스킬이다. 결과 보고로 끝나며 다른 스킬을 자동 호출하지 않는다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R02 · 참고 | `ponytail-help`가 명령과 목적을 안내한다. 사용자가 선택한다.[](source:help) |
| R07 · 공유 상태 | ponytail이 남긴 한계 주석을 읽는다. 예상 부하가 한계를 넘을 때만 지적으로 삼는다.[](source:producer)[](source:verify) |
| R09 · 같은 계열 | `ponytail-review`와 `ponytail-audit`는 검토 범위가 다른 선택지다. 선후 관계가 없어 workflow에서 뺐다.[](source:map)[](source:other) |

전체 관계는 색인 기준 `_group-minimal-code/minimal-code.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `ponytail/ponytail-review/SKILL.md` 1개, 5,244B를 끝까지 읽었다.[](source:full) |
| 관계와 설치 출처 | 참조한 다른 스킬과 `skills-lock.json`을 포함해 텍스트 5개, 19,073B를 전부 읽었다. lock의 6개 항목을 확인했다.[](source:lock) |
| 제외 | 이 폴더의 `SKILL.ko.md`는 번역본이라 열지 않았다. 바이너리는 없다. |
| 부분 읽음 | 0개. 원자료가 없는 경우는 아래 미확인 항목에 따로 적었다. |

원본의 여섯 기준, 지적의 근거 조건, 출력 수치, 코드 수정 금지와 종료 조건을 모두 대조했다.

@callout level=open-question title="실행으로 확인하지 않은 부분"
| 이 페이지는 스킬의 지시를 분석했다. 실제 저장소를 review하거나 audit하지 않았고 보고 규칙의 효과도 측정하지 않았다. |

분석 중 원본은 수정하지 않았다. 분석 전 사용자 승인으로 컬렉션 7개 파일을 commit했다. 새 분석 초안과 HTML, 관계 원장, 색인, 검증 보고서를 작성했다. 원문의 명령과 설치·설정 변경은 실행하지 않았다.
