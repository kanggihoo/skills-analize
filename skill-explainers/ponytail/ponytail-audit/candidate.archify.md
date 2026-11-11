# ponytail-audit는 저장소 전체에서 어떤 문제를 보고하나? {#ponytail-audit-page}

`ponytail-audit`은 저장소의 중요한 실행 경로를 읽고, 실제 오동작 사례가 있는 문제를 보고한다. 코드 수정은 하지 않는다.[](source:map)[](source:verify)[](source:finish)

- 정확성, 안전성, 예상 부하, 테스트, 속도, 불필요한 코드 순으로 본다.[](source:priority)
- 지적에는 문제 상황과 최소 수정안을 함께 적는다.[](source:verify)[](source:output)
- 지적은 최대 20개다. 더 작은 문제를 뺐다면 그 개수를 적는다.[](source:output)

@answer scope="로컬 원본 분석 · 보고 규칙 · 코드 수정 없음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=835ad00af6ccb24e5ab01bbe0a91f878f95cc417
@source full title="ponytail/ponytail-audit/SKILL.md · 5520B · 원본" path=ponytail/ponytail-audit/SKILL.md
@source front title="ponytail/ponytail-audit/SKILL.md · 5520B · 원본" path=ponytail/ponytail-audit/SKILL.md lines=1:9
@source priority title="ponytail/ponytail-audit/SKILL.md · 5520B · 원본" path=ponytail/ponytail-audit/SKILL.md lines=11:14
@source map title="ponytail/ponytail-audit/SKILL.md · 5520B · 원본" path=ponytail/ponytail-audit/SKILL.md lines=18:28
@source criteria title="ponytail/ponytail-audit/SKILL.md · 5520B · 원본" path=ponytail/ponytail-audit/SKILL.md lines=32:55
@source verify title="ponytail/ponytail-audit/SKILL.md · 5520B · 원본" path=ponytail/ponytail-audit/SKILL.md lines=59:67
@source output title="ponytail/ponytail-audit/SKILL.md · 5520B · 원본" path=ponytail/ponytail-audit/SKILL.md lines=71:101
@source finish title="ponytail/ponytail-audit/SKILL.md · 5520B · 원본" path=ponytail/ponytail-audit/SKILL.md lines=103:103
@source help title="ponytail/ponytail-help/SKILL.md · 3264B · 원본" path=ponytail/ponytail-help/SKILL.md lines=29:29
@source other title="ponytail/ponytail-review/SKILL.md · 5244B · 원본" path=ponytail/ponytail-review/SKILL.md lines=18:28
@source producer title="ponytail/ponytail/SKILL.md · 3548B · 원본" path=ponytail/ponytail/SKILL.md lines=42:44
@source lock title="ponytail/skills-lock.json · 1497B · 설치 출처" path=ponytail/skills-lock.json

## 언제 쓰고 무엇을 읽나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 필드는 이 원문에 명시되어 있지 않다.[](source:front)

@code source=front language=yaml

원문은 저장소 감사, 전체 코드 리뷰, 불필요한 코드 찾기를 호출 맥락으로 든다. 지정한 폴더·package를 보며, 지정이 없으면 저장소 전체를 본다.[](source:front)[](source:map)

README, deploy·build config, dependency, 진입점과 테스트를 읽는다. 입력, 돈, auth, 데이터 쓰기, background job, process 공유 경로는 끝까지 추적한다. 큰 저장소는 오류 비용이 큰 경로에 집중하고 읽지 않은 부분을 밝힌다.[](source:map)

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
쓰지 않는 코드라고 판단하기 전에는 테스트, fixture, config와 문자열·동적 참조까지 전체 tree를 검색한다.[](source:verify)

@callout level=warning title="한계가 적힌 주석의 취급"
| `shortcut:` 또는 구형 `ponytail:` 주석에 한계가 적혀 있으면 의도한 선택으로 본다. 예상 부하가 이미 그 한계를 넘었을 때만 문제로 보고한다.[](source:verify) |

## 보고서는 무엇을 남기고 어디서 끝나나? {#output}

원문은 쉬운 영어를 요구한다. 이 분석 페이지는 저장소 지침에 따라 한국어로 작성했다. 각 지적의 배경, 문제, 수정, 미수정 영향을 1~2개의 짧은 문장씩 설명하게 한다.[](source:output)

| 구성 | 출력 규칙 |
|---|---|
| 시작 | `What this repo does:`로 2~3문장을 쓰고 예상 부하를 적는다.[](source:output) |
| 심각도 | `Must fix`는 bug·security·데이터 손실·예상 부하의 실패다. `Should fix`는 테스트 누락·실제 지연·중복·역할 혼합·불필요한 코드다. `Nice to have`는 작은 성능 개선·짧은 표현이다. 빈 그룹은 뺀다.[](source:output) |
| 지적 | 그룹 전체에서 번호를 이어 붙인다. 파일·줄 위치와 `What this is`, `Problem`, `Fix`, `If we skip it`을 적는다.[](source:output) |
| 상한·마무리 | 최대 20개이며 생략한 작은 지적 수를 적는다. `Verdict:`로 건강 상태나 먼저 고칠 것을 적는다. 줄일 것이 있으면 `Lean: -<N> lines, -<M> dependencies possible.`을 적는다. `Not checked:`에 읽지 못했거나 실행하지 못한 부분을 적는다.[](source:output) |
| 지적 없음 | 저장소 설명 다음에 `Healthy. Nothing to fix.`와 확인 범위를 적는다.[](source:output) |

판정 · 특정 변경의 영향만 확인하려면 ponytail-review를 선택할 수 있다. 자동 수정까지 원한다면 이 스킬의 보고 이후 별도 작업이 필요하다.[](source:other)[](source:finish)

## 다른 스킬과 어디에서 이어지나? {#position}

@workflow id=position-flow title="명령 안내와 보고의 경계"
| before | ponytail-help | external | source:help |
| current | ponytail-audit | backend | source:map |
| before > current | 참고 R03 | emphasis |

@steps
| highlight | ponytail-audit | 이 페이지의 스킬이다. 결과 보고로 끝나며 다른 스킬을 자동 호출하지 않는다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R03 · 참고 | `ponytail-help`가 명령과 목적을 안내한다. 사용자가 선택한다.[](source:help) |
| R08 · 공유 상태 | ponytail이 남긴 한계 주석을 읽는다. 예상 부하가 한계를 넘을 때만 지적으로 삼는다.[](source:producer)[](source:verify) |
| R09 · 같은 계열 | `ponytail-review`와 `ponytail-audit`는 검토 범위가 다른 선택지다. 선후 관계가 없어 workflow에서 뺐다.[](source:map)[](source:other) |
@source gain-ref title="ponytail/ponytail-gain/SKILL.md · 2216B · 원본" path=ponytail/ponytail-gain/SKILL.md lines=38:39

R11 · 넘김은 `ponytail-gain`이 현재 저장소의 줄일 부분을 `ponytail-audit`로 안내하는 관계다. 자동 실행은 아니다.[](source:gain-ref)

전체 관계는 색인 기준 `_group-minimal-code/minimal-code.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `ponytail/ponytail-audit/SKILL.md` 1개, 5,520B를 끝까지 읽었다.[](source:full) |
| 관계와 설치 출처 | 참조한 다른 스킬과 `skills-lock.json`을 포함해 텍스트 6개, 21,289B를 전부 읽었다. lock의 6개 항목을 확인했다.[](source:lock) |
| 제외 | 이 폴더의 `SKILL.ko.md`는 번역본이라 열지 않았다. 바이너리는 없다. |
| 부분 읽음 | 0개. 원자료가 없는 경우는 아래 미확인 항목에 따로 적었다. |

원본의 여섯 기준, 지적의 근거 조건, 출력 수치, 코드 수정 금지와 종료 조건을 모두 대조했다.

@callout level=open-question title="실행으로 확인하지 않은 부분"
| 이 페이지는 스킬의 지시를 분석했다. 실제 저장소를 review하거나 audit하지 않았고 보고 규칙의 효과도 측정하지 않았다. |

분석 중 원본은 수정하지 않았다. 분석 전 사용자 승인으로 컬렉션 7개 파일을 commit했다. 새 분석 초안과 HTML, 관계 원장, 색인, 검증 보고서를 작성했다. 원문의 명령과 설치·설정 변경은 실행하지 않았다.
