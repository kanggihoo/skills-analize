# 필요한 코드를 남기고, 미룬 한계를 확인하는 ponytail 컬렉션 {#minimal-code-page}

`ponytail`은 구현 방식을 바꾸고, 나머지 스킬은 점검이나 안내를 한 번 수행한다. 사용자가 목적에 맞는 명령을 고르며, 모든 스킬을 순서대로 실행할 의무는 없다.[](source:build)[](source:help)[](source:debt)[](source:review)[](source:audit)[](source:gain)

- 구현에서 남긴 `shortcut:` 주석은 `ponytail-debt`의 집계 입력으로 이어질 수 있다.[](source:build)[](source:debt)
- `ponytail-review`는 변경분, `ponytail-audit`는 저장소 전체를 보는 선택지다.[](source:review)[](source:audit)
- gain은 공개 benchmark를 보여 주며 현재 저장소의 집계는 `ponytail-debt`로 안내한다. `ponytail-gain`의 원자료는 없어 부분 분석이다.[](source:gain)

@answer scope="로컬 스킬 6개 · 관계 14개 · gain 원자료 미확인"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=835ad00af6ccb24e5ab01bbe0a91f878f95cc417
@source build title="ponytail/ponytail/SKILL.md · 3548B · 원본" path=ponytail/ponytail/SKILL.md lines=15:44
@source help title="ponytail/ponytail-help/SKILL.md · 3264B · 원본" path=ponytail/ponytail-help/SKILL.md lines=10:36
@source review title="ponytail/ponytail-review/SKILL.md · 5244B · 원본" path=ponytail/ponytail-review/SKILL.md lines=18:28
@source audit title="ponytail/ponytail-audit/SKILL.md · 5520B · 원본" path=ponytail/ponytail-audit/SKILL.md lines=18:28
@source debt title="ponytail/ponytail-debt/SKILL.md · 1813B · 원본" path=ponytail/ponytail-debt/SKILL.md lines=15:44
@source gain title="ponytail/ponytail-gain/SKILL.md · 2216B · 원본" path=ponytail/ponytail-gain/SKILL.md lines=14:52
@source review-limit title="ponytail/ponytail-review/SKILL.md · 5244B · 원본" path=ponytail/ponytail-review/SKILL.md lines=63:64
@source audit-limit title="ponytail/ponytail-audit/SKILL.md · 5520B · 원본" path=ponytail/ponytail-audit/SKILL.md lines=63:64
@source host title="ponytail/ponytail-help/SKILL.md · 3264B · 원본" path=ponytail/ponytail-help/SKILL.md lines=38:76
@source review-end title="ponytail/ponytail-review/SKILL.md · 5244B · 종료" path=ponytail/ponytail-review/SKILL.md lines=101:101
@source audit-end title="ponytail/ponytail-audit/SKILL.md · 5520B · 종료" path=ponytail/ponytail-audit/SKILL.md lines=103:103
@source lock title="ponytail/skills-lock.json · 1497B · 설치 출처" path=ponytail/skills-lock.json

## 지금 목적에 맞는 스킬은 무엇인가? {#choose}

그림의 화살표는 원장의 참고와 선택적 넘김이다. `ponytail-help`가 명령을 실행하거나 `ponytail-gain`이 `ponytail-audit`·`ponytail-debt`를 자동 호출한다는 뜻은 아니다.[](source:help)[](source:gain)

@workflow id=collection-flow title="안내를 읽고 목적별 명령 선택"
| guide | ponytail-help | external | source:help |
| build | ponytail | backend | source:build |
| review | ponytail-review | backend | source:review |
| audit | ponytail-audit | backend | source:audit |
| debt | ponytail-debt | backend | source:debt |
| gain | ponytail-gain | backend | source:gain |
| guide > build | 참고 R01 | emphasis |
| guide > review | 참고 R02 | dashed |
| guide > audit | 참고 R03 | dashed |
| guide > debt | 참고 R04 | dashed |
| guide > gain | 참고 R05 | dashed |
| gain > debt | 넘김 R10 | dashed |
| gain > audit | 넘김 R11 | dashed |

@steps
| guide-step | ponytail-help | 수준과 스킬 명령을 안내한다. | collection-flow | guide |
| build-step | ponytail | 영향 범위를 마치면서 새 코드를 줄인다. | collection-flow | build |
| review-step | ponytail-review | 변경분과 연결 코드에서 문제를 보고한다. | collection-flow | review |
| audit-step | ponytail-audit | 저장소의 중요한 실행 경로를 감사한다. | collection-flow | audit |
| debt-step | ponytail-debt | 미룬 작업 주석을 파일별로 집계한다. | collection-flow | debt |
| gain-step | ponytail-gain | 공개 benchmark 수치를 보여 준다. | collection-flow | gain |

단계 선택기는 각 스킬의 역할을 설명한다. 실행 순서를 정하지 않는다. 각 스킬의 내부 규칙과 수치는 개별 페이지에 있다.[](source:help)

## 어떤 관계로 무엇을 주고받나? {#relations}

| rel-id·종류 | 전달물과 조건 | 그림 반영 |
|---|---|---|
| R01~R05 · 참고 | `ponytail-help`가 5개 명령을 안내한다. 사용자 선택이며 `ponytail-help`는 모드를 바꾸거나 저장하지 않는다.[](source:help) | 표시 |
| R06 · 산출물 호환 | ponytail이 한계와 재검토 조건을 적은 `shortcut:` 주석을 남기면 `ponytail-debt`가 읽을 수 있다. 필수 후속 순서는 아니다.[](source:build)[](source:debt) | workflow에서 생략 |
| R07·R08 · 공유 상태 | `ponytail-review`·`ponytail-audit`가 같은 코드와 한계 주석을 읽는다. 부하가 한계를 넘을 때만 문제로 보고한다.[](source:build)[](source:review-limit)[](source:audit-limit) | workflow에서 생략 |
| R09 · 같은 계열 | `ponytail-review`와 `ponytail-audit`는 범위가 다른 검토 선택지다. 한쪽의 보고서를 다른 쪽이 입력으로 요구하지 않는다.[](source:review)[](source:audit) | workflow에서 생략 |
| R10 · 넘김 | 현재 저장소에서 미룬 작업 집계가 필요하면 `ponytail-gain`이 `ponytail-debt`를 안내한다. 자동 실행하지 않는다.[](source:gain) | 표시 |
| R11 · 넘김 | 현재 저장소에서 줄일 부분을 찾으려면 `ponytail-gain`이 `ponytail-audit`를 안내한다. 자동 실행하지 않는다.[](source:gain) | 표시 |
| R12 · 참고 | `ponytail-gain`이 benchmark 보고서와 README를 수치 근거로 든다. 둘 다 컬렉션 밖이며 미확인이다.[](source:gain) | 생략 |
| R13 · 참고 | `ponytail-help`가 외부 저장소의 전체 문서와 예시를 안내한다.[](source:host) | 생략 |
| R14 · 참고 | `ponytail-help`가 호스트의 설정·band·업데이트 명령을 설명한다. 구현은 컬렉션에 없다.[](source:host) | 생략 |

관계의 단일 원본은 `relations.md`다. 표의 R06과 R09는 판정이며, 각각 주석 형식의 일치와 검토 목적·범위를 근거로 연결했다.[](source:build)[](source:debt)[](source:review)[](source:audit)

## 어떤 파일과 상태를 공유하나? {#state}

| 파일·상태 | 쓰는 스킬·주체 | 읽는 스킬·조건 |
|---|---|---|
| 소스의 `shortcut:` 주석 | ponytail이 한계와 재검토 조건을 남긴다.[](source:build) | `ponytail-debt`가 집계하고 `ponytail-review`·`ponytail-audit`가 예상 부하와 비교한다. 구형 `ponytail:`도 읽는다.[](source:debt)[](source:review-limit)[](source:audit-limit) |
| 저장소 코드·config·테스트 | ponytail이 요청에 필요한 범위를 바꾼다.[](source:build) | `ponytail-review`는 변경과 연결 경로, `ponytail-audit`는 지정한 범위나 전체 저장소를 읽는다.[](source:review)[](source:audit) |
| `PONYTAIL-DEBT.md` 등 | `ponytail-debt`가 별도로 물어본 뒤 저장한다. 기본 결과는 보고다.[](source:debt) | 다른 스킬의 필수 입력으로 지정한 지시는 원문에 없다.[](source:help) |
| 모드·config·band | 실제 설정과 상태는 호스트가 관리한다. `ponytail-help`는 쓰지 않는다.[](source:help)[](source:host) | `ponytail-help`는 우선순위와 명령을 설명한다. 이 컬렉션에는 호스트 구현이 없다.[](source:host) |

## 어떤 선택을 피해야 하나? {#limits}

판정 · 줄 수가 적다는 이유로 validation이나 데이터 손실 방지를 빼면 ponytail의 기준을 어긴다. 리뷰 결과가 필요할 때 `ponytail-review`·`ponytail-audit`를 쓴 뒤 실제 수정은 별도 작업으로 다룬다.[](source:build)[](source:review-end)[](source:audit-end)

| 기대 | 경계 |
|---|---|
| gain으로 이 저장소의 절감량을 알고 싶다 | 원문이 금지한다. 만들지 않은 버전의 기준선이 없기 때문이다.[](source:gain) |
| `ponytail-debt`로 모든 미룬 작업을 알고 싶다 | 표식과 검색 범위에 잡힌 주석만 집계한다. 표식 없는 작업을 찾는 절차는 없다.[](source:debt) |
| `ponytail-help`로 기본 수준을 바꾸고 싶다 | `ponytail-help`는 안내만 한다. 실제 설정은 호스트에서 별도로 적용해야 한다.[](source:help)[](source:host) |

## 어디까지 대조했고 무엇이 남았나? {#audit-panel}

스킬 원본 6개와 공통 lock 1개를 전부 읽었다. 번역본 `SKILL.ko.md` 6개는 열지 않고 제외했다. 바이너리와 부분 읽음 파일은 각각 0개다.

관계 14개를 모두 원문과 대조했다. 분석 중 원본은 수정하지 않았고, 승인된 원본 commit 뒤 분석 파일만 작성했다.[](source:lock)

@callout level=open-question title="미확인 범위"
| gain의 benchmark 보고서와 README가 없어 수치의 재현성과 측정 방법은 검증하지 못했다. gain의 원문 동작과 수치 인용만 확인했다.[](source:gain) |
| 호스트의 자동 활성화, band, plugin 업데이트는 지시상 동작으로 설명했다. 구현이나 실제 실행은 확인하지 않았다.[](source:host) |

자동 검증은 HTML 구조와 출처 해석을 확인한다. 실제 효과와 독자의 이해는 별도로 확인해야 한다. 사람 검토는 미실시다.
