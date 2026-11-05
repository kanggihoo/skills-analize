# egm-bootstrap과 egm-drift-report는 어떻게 이어지나 {#contract-and-drift-group}

`egm-bootstrap`이 폴더마다 README 계약 파일을 쓰고, 끝에서 사용자가 승낙하면 `egm-drift-report`가 그 계약 파일을 실제 코드와 비교한다. 이 연결은 선택이다. `egm-bootstrap`은 마지막에 "drift report를 돌릴까요?"를 묻고, 사용자가 `Yes`를 골라야 `egm-drift-report`를 실행한다(r20).[](source:c-bs-drift)

- `egm-bootstrap`은 문서만 쓴다. 코드는 쓰거나 고치지 않고, `git commit`과 `git add`도 하지 않는다.[](source:c-bs-cons)
- 탐색 중 폴더가 15개를 넘으면 `egm-bootstrap`은 바로 멈추고 사용자 승인을 기다린다.[](source:c-bs-gate)
- `egm-drift-report`는 어긋난 곳만 보고서에 쓰고, 어긋남이 없으면 `No drift detected`라고 쓴다.[](source:c-dr-filter)
- 이 묶음의 조사 상태는 **부분 분석**이다. `egm-bootstrap`이 띄우는 하위 오케스트레이터의 정의 파일이 저장소에 없다.

@answer scope="egm · bootstrap · drift-report · 커밋 d494974 · 지시상 동작 · 하위 오케스트레이터 정의는 확인하지 못함(부분 분석)"
@meta locale=ko
@source c-bs-off title="egm/egm-bootstrap/SKILL.md · 호출 제한" path=egm/egm-bootstrap/SKILL.md lines=4:4
@source c-dr-off title="egm/egm-drift-report/SKILL.md · 호출 제한" path=egm/egm-drift-report/SKILL.md lines=4:4
@source c-bs-over title="egm-bootstrap/SKILL.md · 개요와 Peanuts·Hay" path=egm/egm-bootstrap/SKILL.md lines=13:24
@source c-bs-inputs title="egm-bootstrap/SKILL.md · 입력" path=egm/egm-bootstrap/SKILL.md lines=37:47
@source c-bs-cons title="egm-bootstrap/SKILL.md · Execution Constraints" path=egm/egm-bootstrap/SKILL.md lines=49:68
@source c-bs-bfs title="egm-bootstrap/SKILL.md · 폴더 탐색" path=egm/egm-bootstrap/SKILL.md lines=100:110
@source c-bs-gate title="egm-bootstrap/SKILL.md · 15개 초과 승인" path=egm/egm-bootstrap/SKILL.md lines=112:124
@source c-bs-prune title="egm-bootstrap/SKILL.md · 가지치기" path=egm/egm-bootstrap/SKILL.md lines=126:152
@source c-bs-direct title="egm-bootstrap/SKILL.md · 5개 이하 직접 실행" path=egm/egm-bootstrap/SKILL.md lines=158:164
@source c-bs-swarm title="egm-bootstrap/SKILL.md · 5개 초과 병렬" path=egm/egm-bootstrap/SKILL.md lines=166:198
@source c-bs-correct title="egm-bootstrap/SKILL.md · 기존 파일 보정 정책" path=egm/egm-bootstrap/SKILL.md lines=224:241
@source c-bs-scout title="egm-bootstrap/SKILL.md · 스카우트 제약" path=egm/egm-bootstrap/SKILL.md lines=243:269
@source c-bs-verify title="egm-bootstrap/SKILL.md · 최종 검증" path=egm/egm-bootstrap/SKILL.md lines=381:400
@source c-bs-drift title="egm-bootstrap/SKILL.md · drift 점검 제안" path=egm/egm-bootstrap/SKILL.md lines=402:418
@source c-dr-goal title="egm-drift-report/SKILL.md · 목적" path=egm/egm-drift-report/SKILL.md lines=17:19
@source c-dr-input title="egm-drift-report/SKILL.md · 입력 확인" path=egm/egm-drift-report/SKILL.md lines=21:23
@source c-dr-analyze title="egm-drift-report/SKILL.md · 문서마다 분석" path=egm/egm-drift-report/SKILL.md lines=24:40
@source c-dr-filter title="egm-drift-report/SKILL.md · 차이만 보고" path=egm/egm-drift-report/SKILL.md lines=41:44
@source c-dr-report title="egm-drift-report/SKILL.md · 보고서 형식" path=egm/egm-drift-report/SKILL.md lines=45:56
@source c-dr-guide title="egm-drift-report/SKILL.md · 지침" path=egm/egm-drift-report/SKILL.md lines=58:67
@source c-draft-save title="egm-draft/SKILL.md · 설계 문서 저장(r21 확인용)" path=egm/egm-draft/SKILL.md lines=309:312

## 두 스킬은 어떤 순서로 이어지나 {#flow}

@workflow id=contract-flow title="계약 파일 작성에서 drift 점검까지"
| boot | egm-bootstrap | backend |
| verify | 계약 파일 최종 검증 | backend |
| ask | drift 점검할까? | external |
| drift | egm-drift-report | backend |
| rep | 보고서 쓰기 | backend |
| end | 끝 | external |
| boot > verify | |
| verify > ask | |
| ask > drift | 예 | emphasis |
| ask > end | 아니오 |
| drift > rep | |
| rep > end | |

@steps id=contract-steps
| boot | egm-bootstrap | 폴더 트리를 훑어 폴더마다 `README.md` 계약 파일을 만들거나 고친다.[](source:c-bs-over) | contract-flow | boot |
| verify | 계약 파일 최종 검증 | 만들거나 고친 계약 파일을 하나도 빼지 않고 직접 읽어 확인한다.[](source:c-bs-verify) | contract-flow | verify |
| ask | drift 점검할까? | 사용자에게 예·아니오를 묻는다. 선택지 첫 번째에 `(Recommended)`가 붙어 있다.[](source:c-bs-drift) | contract-flow | ask |
| drift | egm-drift-report | 수정한 계약 파일 하나씩 읽고 코드와 비교해 어긋난 곳을 찾는다.[](source:c-dr-analyze) | contract-flow | drift |
| rep | 보고서 쓰기 | `{YYYY-MM-DD}_DRIFT_REPORT.md`에 문서마다 덧붙인다.[](source:c-dr-report) | contract-flow | rep |
| end | 끝 | `egm-bootstrap`은 점검 선택 뒤 정상 종료한다. 사람이 불일치를 분류한다.[](source:c-bs-drift) | contract-flow | end |

원문은 `egm-drift-report`가 설계 문서용이지만 계약 파일에도 변형으로 쓸 수 있다고 적는다.[](source:c-bs-drift) 점검 대상은 문서에 적힌 method, route, enum, database table, invariant를 로컬 소스와 맞춰 보는 것이다. 코드에 없는 부분과 코드에 없는데 문서에 있는 부분을 모두 본다.[](source:c-bs-drift)

## egm-bootstrap은 폴더 수에 따라 어떻게 일하나 {#scale}

@facts id=bootstrap-numbers
| 직접 실행 | 가지치기 뒤 폴더가 5개 이하면 현재 스레드에서 순서대로 쓴다[](source:c-bs-direct) |
| 병렬 실행 | 5개를 넘으면 파티션 3~5개로 나눠 하위 오케스트레이터를 병렬로 띄운다[](source:c-bs-swarm) |
| 사용자 승인 | 탐색 중 발견한 폴더가 15개를 넘으면 즉시 멈추고 승인을 요청한다(의무)[](source:c-bs-gate) |
| 스카우트 읽기 단위 | 호출 하나에 약 1,500줄. 파일 크기 제한은 따로 없고 비테스트 파일은 전부 읽는다[](source:c-bs-scout) |
| 템플릿·설정 파일 | 파일당 200줄까지, 설정만 있는 폴더는 800줄까지[](source:c-bs-scout) |

15개와 5개는 세는 대상이 다르다.

- 15개는 탐색하며 발견한 폴더의 누적 수다.[](source:c-bs-gate)
- 5개는 가지치기를 끝낸 폴더 수다. 가지치기는 소스 코드가 없고 소스가 있는 하위 폴더도 없는 폴더, 테스트만 든 폴더를 뺀다.[](source:c-bs-prune)[](source:c-bs-direct)
- 판정: 승인 질문은 탐색 루프 도중에 나오고 가지치기는 탐색이 끝난 뒤라서, 승인이 먼저라고 읽힌다. 가지치기 전에 받는지 뒤에 받는지는 원문에 명시 없음.[](source:c-bs-gate)[](source:c-bs-prune)

## 두 스킬의 확인은 어떻게 다른가 {#checks}

| 기준 | egm-bootstrap 최종 검증 | egm-drift-report |
| --- | --- | --- |
| 대상 | 이번에 만들거나 고친 계약 파일 전부. 하나도 건너뛰지 않는다[](source:c-bs-verify) | 문서 하나씩 순서대로[](source:c-dr-analyze)[](source:c-dr-guide) |
| 보는 것 | `Interface`·`Invariants`·`Side Effects` 절이 있고 실제 코드 심볼을 인용하는지, Markdown 문법, 링크 대상 파일이 있는지, 검증 명령 문법[](source:c-bs-verify) | 빠진 기능, 필드가 빠진 모델, 동적이어야 할 곳의 하드코딩, 제안과 다른 패턴·라이브러리[](source:c-dr-analyze) |
| 기준선 | 스카우트가 코드에서 뽑은 심볼 {caution:쓴 쪽이 확인}[](source:c-bs-verify) | 코드를 그때 다시 읽는다. 기억에 의존하지 않는다 {good:별도 점검}[](source:c-dr-guide) |
| 결과 | 깨진 링크는 고치거나 지운다[](source:c-bs-verify) | 차이만 쓴다. 일치하면 `No drift detected`[](source:c-dr-filter) |

판정: `egm-bootstrap`의 최종 검증은 같은 실행이 쓴 파일을 스스로 확인하는 것이다. `egm-drift-report`는 따로 도는 점검이라서 두 번째 확인으로 둘 수 있다. 원문이 이 둘을 그런 목적으로 구분한다고 밝힌 문장은 원문에 명시 없음.

`egm-drift-report`의 기준은 엄격하다. 문서가 특정 객체·필드·파일 이름을 말하는데 코드에 없으면 보고 대상이다. 어느 문서에도 적히지 않은 로직도 보고 대상이다.[](source:c-dr-guide) 이 마지막 규칙을 보고서의 어느 항목에 쓰는지는 원문에 명시 없음.

## 두 스킬은 어떤 파일을 주고받나 {#state}

| 파일·폴더 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `README.md` 또는 `target_filename`(예: `EGM.md`) | egm-bootstrap[](source:c-bs-inputs) | egm-drift-report. 수정한 계약 파일이 입력이다(r20)[](source:c-bs-drift) |
| `.gitignore`, `.egmignore` | 사용자 | egm-bootstrap. 맞는 패턴은 무시한다[](source:c-bs-bfs) |
| `{YYYY-MM-DD}_DRIFT_REPORT.md` | egm-drift-report. 저장 위치는 원문에 명시 없음[](source:c-dr-report) | 사용자 |
| `docs/designs/`의 설계 문서 | egm-draft가 쓴다[](source:c-draft-save) | egm-drift-report. 입력 조건에 맞지만 서로를 부르지는 않는다(r21, 추론) |

## 쓰기 전에 조심할 것 {#cautions}

@callout level=warning title="egm-bootstrap은 파일을 많이 쓴다"
폴더마다 계약 파일을 쓰므로 변경량이 크다. 이미 `README.md`가 있으면 통째로 덮어쓰지 않고 읽어 병합하며, 개발자가 쓴 설명은 보존한다.[](source:c-bs-correct) 사람이 관리하는 README를 건드리고 싶지 않으면 `target_filename`을 `EGM.md` 같은 다른 이름으로 준다.[](source:c-bs-inputs) 커밋은 하지 않으므로 변경은 작업 폴더에 남고, commit은 사용자 몫이다.[](source:c-bs-cons)

- 폴더 탐색은 한 층씩 한다. `find`나 `ls -R` 같은 재귀 검색은 쓰지 말라고 적는다. 심볼릭 링크와 `.git`, `node_modules` 같은 숨김·빌드 폴더는 무시한다.[](source:c-bs-bfs)
- 스카우트는 읽기 전용이다. 파일을 쓰거나 고치지 않는다.[](source:c-bs-scout)
- `egm-drift-report`는 문서나 README가 든 디렉터리를 받는다. 없으면 사용자에게 묻는다.[](source:c-dr-input) 이 스킬이 코드를 읽기만 하는지 고치기도 하는지는 원문에 명시 없음. 쓰기로 적힌 것은 보고서 파일뿐이다.[](source:c-dr-report)
- 두 스킬 모두 `disable-model-invocation: true`라서 사용자가 이름으로 불러야 켜진다.[](source:c-bs-off)[](source:c-dr-off)

## 그림에서 뺀 관계 {#omitted}

| rel-id | 종류 | 그림에 있나 | 내용 |
| --- | --- | --- | --- |
| r20 | 넘김 | 있음 | bootstrap → drift-report |
| r21 | 산출물 호환 | 표 | egm-draft의 설계 문서가 입력 조건에 맞는다. 근거 방식은 추론이다[](source:c-draft-save)[](source:c-dr-input) |
| r16 | 내부 위임 | 생략 | 5개 초과일 때 `agents/bootstrap_orchestrator.md`의 하위 오케스트레이터를 파티션마다 띄운다. 정의 파일은 범위 밖이다[](source:c-bs-swarm) |
| r17 | 내부 위임 | 생략 | `is_worker=true`면 `egm-bootstrap`이 워커 모드로 다시 돌고 JSON을 돌려준다[](source:c-bs-swarm) |
| r26 | 참고 | 생략 | `docs/codex.md`를 먼저 읽으라는 안내. 파일이 없어 `불명`이다 |

@callout level=open-question title="확인하지 못한 것"
하위 오케스트레이터 정의(`agents/bootstrap_orchestrator.md`)가 저장소에 없다. 병렬 실행에서 워커가 정확히 무엇을 지시받는지는 확인하지 못했다.
`egm-bootstrap`은 선택지 첫 번째에 `(Recommended)`를 붙이는데, `egm-brainstorm`·`egm-draft`·`egm-review`는 그 표기를 금지한다. `egm-bootstrap`에는 그런 금지 규칙이 원문에 명시 없음.[](source:c-bs-drift)
`egm-bootstrap`이 어느 계약 파일이 "수정된 것"인지 `egm-drift-report`에 어떻게 알려 주는지 원문에 명시 없음.
일곱 스킬 공통으로 `docs/codex.md`와 `docs/claude.md`를 먼저 읽으라고 하지만 파일이 없다. 스킬은 실행하지 않았고 이 페이지는 지시상 동작이다.

@callout level=note title="이 묶음의 읽은 원문"
`egm-bootstrap`, `egm-drift-report`의 `SKILL.md`와 `egm-draft/SKILL.md` 309~312줄(r21 확인)을 다시 읽고 줄 번호를 확인했다. 각 스킬 내부 규칙과 수치는 `egm/egm-bootstrap/egm-bootstrap.html`, `egm/egm-drift-report/egm-drift-report.html`에 있다.
