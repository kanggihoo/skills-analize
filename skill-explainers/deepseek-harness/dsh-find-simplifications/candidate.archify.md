# dsh-find-simplifications 스킬은 에이전트를 어떻게 바꾸나 {#find-simplifications-skill}

`dsh-find-simplifications`가 켜지면 에이전트는 지울 수 있는 코드의 개수를 세지 않는다. 대신 없애면 유지 의무가 줄어드는 후보를 근거와 함께 몇 개만 고른다. 조사해도 된다는 것과 구현해도 된다는 것을 구분하고, 실행하지 않은 검색을 전수라고 부르지 않는다.[](source:fs-intro)[](source:fs-report)

- 에이전트는 후보마다 소유자, 생산자·소비자 경로, 사라지는 것, 남는 것, 호환 영향, 유지해야 할 가장 강한 이유를 적는다.[](source:fs-record)
- `LLM` 어댑터 두 개와 영속화 이음매는 사용자가 명시적으로 뒤집지 않는 한 삭제 후보로 올리지 않는다.[](source:fs-protect)
- 새 `Agent Note`를 쓸 때마다 `dsh-archive-agent-notes`로 범위를 좁힌 대체 확인을 거친다.[](source:fs-supersede)
- 에이전트는 실제로 실행한 명령만 보고한다.[](source:fs-report)

@answer scope="dsh-find-simplifications · 파일 2개 · 커밋 475505c · 지시상 동작"
@meta locale=ko
@source rel-doc title="dsh-doc/SKILL.md · r47 상대 줄" path=deepseek-harness/dsh-doc/SKILL.md lines=93:93
@source fs-fm title="deepseek-harness/dsh-find-simplifications/SKILL.md · 11425B · frontmatter" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=1:4
@source fs-intro title="SKILL.md · 목적과 범위" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=8:8
@source fs-scope title="SKILL.md · 먼저 읽을 문서와 보관 노트" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=12:12
@source fs-protect title="SKILL.md · 보호 제약" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=14:14
@source fs-broad title="SKILL.md · 넓은 요청의 영역 분담" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=16:16
@source fs-search title="SKILL.md · 탐색 질문 머리말" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=20:20
@source fs-q-effect title="SKILL.md · 질문 1 효과 경로" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=22:22
@source fs-q-distinct title="SKILL.md · 질문 2 구분" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=23:23
@source fs-q-explicit title="SKILL.md · 질문 3 더 작은 명시적 동작" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=24:24
@source fs-q-derive title="SKILL.md · 질문 4 권위 있는 값 읽기" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=25:25
@source fs-q-compose title="SKILL.md · 질문 5 구성과 정책" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=26:26
@source fs-q-cost title="SKILL.md · 질문 6 전체 유지 비용" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=27:27
@source fs-reach title="SKILL.md · 도달성 증명" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=31:33
@source fs-record title="SKILL.md · 후보 기록과 세 갈래" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=35:39
@source fs-reject title="SKILL.md · 기각 규칙" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=41:41
@source fs-own title="SKILL.md · 소유권과 신뢰 경계" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=45:45
@source fs-async title="SKILL.md · 비동기 장치" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=47:47
@source fs-dep title="SKILL.md · 의존성 교체" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=51:51
@source fs-dep-test title="SKILL.md · 교체 시험" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=53:53
@source fs-prose title="SKILL.md · 글 범위" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=57:57
@source fs-note title="SKILL.md · 제안 노트 골격" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=59:59
@source fs-supersede title="SKILL.md · 새 노트의 대체 확인" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=61:61
@source fs-fold title="SKILL.md · 다른 브랜치 합치기" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=63:63
@source fs-report title="SKILL.md · 검증과 보고" path=deepseek-harness/dsh-find-simplifications/SKILL.md lines=65:65
@source hp-intro title="deepseek-harness/dsh-find-simplifications/references/historical-patterns.md · 8573B · 사용법" path=deepseek-harness/dsh-find-simplifications/references/historical-patterns.md lines=3:3
@source hp-effect title="historical-patterns.md · 완전한 효과 경로" path=deepseek-harness/dsh-find-simplifications/references/historical-patterns.md lines=5:9
@source hp-distinct title="historical-patterns.md · 소비자가 결정하는 구분" path=deepseek-harness/dsh-find-simplifications/references/historical-patterns.md lines=11:15
@source hp-trade title="historical-patterns.md · 더 작은 명시적 약속" path=deepseek-harness/dsh-find-simplifications/references/historical-patterns.md lines=17:21
@source hp-assume title="historical-patterns.md · 소비 연산의 가정" path=deepseek-harness/dsh-find-simplifications/references/historical-patterns.md lines=23:27
@source hp-derive title="historical-patterns.md · 사용 시점 파생" path=deepseek-harness/dsh-find-simplifications/references/historical-patterns.md lines=29:33
@source hp-compose title="historical-patterns.md · 우연한 구성 소유자" path=deepseek-harness/dsh-find-simplifications/references/historical-patterns.md lines=35:39
@source hp-reject title="historical-patterns.md · 기각된 실험" path=deepseek-harness/dsh-find-simplifications/references/historical-patterns.md lines=41:45

## 언제 켜지고 무엇이 늘 지켜지나 {#trigger}

@code source=fs-fm language=yaml

머리말에는 `name`과 `description`만 있고 호출 제한 필드가 없다.[](source:fs-fm) 판정: 모델이 `description`을 참고해 스스로 켤 수 있다. `description`은 판단용 설명이지, 특정 단어가 있으면 켜지는 키워드 목록이 아니다.

설명이 드는 용도는 네 가지다. 코드·API·설정·테스트·글에서 근거 있는 단순화를 찾는 일, 제안을 쓰거나 합치는 일, 작은 인라인 정리를 가려내는 일, 다른 branch의 단순화를 평가하는 일이다. 대상은 죽은·중복된·추측성·불필요하게 유지되는 동작과 기반 시설이다.[](source:fs-fm)

원문은 이 스킬을 "체크리스트가 아닌 지침"이라고 밝힌다. 에이전트는 사용자가 준 범위를 지키고, 조사(survey)와 그 제안을 구현해도 된다는 허락을 구분한다.[](source:fs-intro)

@callout level=warning title="삭제 제안에서 뺄 것"
`LLM` 어댑터 두 개는 의도된 설계다. `JSONL`은 유일한 자체 세션 영속화 제공자이고, 백엔드 중립인 서비스 정의(Service Definition)는 저장소 밖 제공자를 지원한다. 사용자가 이 제약을 명시적으로 뒤집지 않는 한 `LLM` 쌍이나 영속화 이음매의 삭제를 제안하지 않는다.[](source:fs-protect)
보호된 설계 안에서 쓰이지 않는 멤버는 여전히 후보가 될 수 있다. 제거해도 그 설계의 목적이 지켜질 때만 그렇다.[](source:fs-protect)

판단 전에 읽을 것은 다음과 같다.[](source:fs-scope)

- `AGENTS.md`, 구조 문서(패키지를 판단하기 전에), 방어 패턴 문서, 테스트 정책. 이 문서들은 원래 저장소에 있어 이 분석의 범위 밖이다.
- 의도된 결정을 확인할 관련 활성 `Agent Note`. 새 기록은 노트 규칙을 따른다.
- 보관된 노트는 역사적 예시일 뿐 현재 권위가 아니다. 보관 노트의 바깥 링크는 열어 보거나 검증하거나 고치지 않는다.

요청이 넓으면 독립 영역 다섯 개를 서브에이전트에 나눠 맡긴다.[](source:fs-broad)

- 영역: 루프와 영속화, 모델·도구 조립, `Host`·`Client`·SDK, 하위 프로세스와 실행 제공자, 구성·스크립트·테스트·문서.
- 서브에이전트마다 범위를 한정하고 소비자 근거와 기각한 대안을 요구한다.
- 첫 삭제 후보에서 멈추지 않는다. 눈에 띄는 미사용 심볼뿐 아니라 큰 프로덕션 장치도 살핀다.

## 후보는 어떻게 찾고 거르나 {#method}

@workflow id=simplify-flow title="단순화 후보 찾기"
| lane prep | 준비 |
| lane prove | 증명 |
| lane out | 결과 |
| scope | 범위·제약 확인 | external | prep |
| search | 제거할 의무 탐색 | backend | prove |
| prove | 도달성 증명 | backend | prove |
| hold | 기각 조건에 해당? | backend | prove |
| cand | 후보 제안 | frontend | out |
| defer | 기각·보류 | backend | out |
| record | 노트·검증 | database | out |
| scope > search | |
| search > prove | |
| prove > hold | |
| hold > cand | 아니오 | emphasis |
| hold > defer | 예 | dashed |
| cand > record | |

@steps id=simplify-steps
| t-scope | 범위·제약 확인 | 먼저 읽을 문서와 활성 노트로 의도된 결정을 확인한다. 보호 제약과 사용자 범위를 지킨다. | simplify-flow | scope |
| t-search | 제거할 의무 탐색 | 여섯 질문으로 유지 의무를 찾는다. 검토 대상 코드가 도입한 요구·검사·노트는 필요성의 독립 근거가 아니다. | simplify-flow | search |
| t-prove | 도달성 증명 | `rg`로 시작해 매치를 읽고 생산자·소비자 경로를 확인한다. 후보마다 기록 항목을 채운다. | simplify-flow | prove |
| t-hold | 기각 조건에 해당? | 유지 의무를 깨거나, 같은 복잡도를 옮길 뿐이거나, 의미 있는 감소가 없으면 기각한다. | simplify-flow | hold |
| t-cand | 후보 제안 | 도달할 수 없는 동작의 제거, 또는 명시적 손실이 있는 더 좁은 동작으로 분류해 제안한다. | simplify-flow | cand |
| t-defer | 기각·보류 | 보호된 의무이거나 근거가 부족한 항목은 이유와 함께 남긴다. | simplify-flow | defer |
| t-record | 노트·검증 | 필요하면 노트를 쓰고 정해진 검사를 돌려 실행한 명령만 보고한다. | simplify-flow | record |

원문의 세 갈래는 다음과 같다. 도달할 수 없거나 읽히지 않는 동작의 제거, 명시적 손실이 있는 더 좁은 공개·제품 동작, 보호된 의무 또는 불충분한 근거다.[](source:fs-record) 후보 기록에는 현재 소유자, 실제 생산자·소비자 경로, 사라지는 것, 남는 것, 능력·호환 영향, 유지해야 할 가장 강한 이유가 들어간다.[](source:fs-record)

**탐색 질문 여섯 개.** 원문은 이 질문을 "발견을 이끄는 용도"라고 한다.[](source:fs-search)

| 질문 | 확인할 것 |
| --- | --- |
| 선언된 기능에 완전한 효과 경로가 있나 | 생산자, 변환, 제공자·끝점 지원, 관찰 결과를 따라간다. 모든 곳에 복사돼 있는데 setter나 reader가 없거나 거부하는 구현만 있는 필드가 있을 수 있다. 설정 전달값은 읽기 우선순위를 따라가 사용 전에 가려지는 값을 찾는다.[](source:fs-q-effect) |
| 어떤 구분이 소비자의 행동을 바꾸나 | 구분·필드·어댑터가 필요한지부터 묻는다. 전송 전용 표식을 더하기 전에 기존 소스 필드와 판별자를 방출·권한 검사까지 추적한다. 권한·상주·내구성·소유 동작은 지키고, 쓸 수 없는 선택만 부르는 공개 구분을 없앤다.[](source:fs-q-distinct) |
| 더 작은 명시적 동작이 서브시스템을 없앨 수 있나 | 고정 간격, 호출자가 주는 시간대, 보고되는 활성화 실패가 일반 달력·영속 기본값·자동 롤백을 없앨 수 있다. 포기하는 능력과 지우는 장치를 적는다. 프로덕션 호출자가 있으면 자동 기각이 아니라 동작 결정이다.[](source:fs-q-explicit) |
| 소비자가 필요할 때 권위 있는 값을 읽을 수 있나 | 복사된 기록, 승격 장부, 무효화 이벤트 뒤의 읽기, 공유 투영 스트림 옆의 기능 캐시를 찾는다. 먼저 필요한 관찰 시점을 정한다.[](source:fs-q-derive) |
| 구성을 정책으로 착각하고 있나 | 선택적 서비스의 존재, 제공자 메서드, 형제 도구는 배포 동작을 정하지 않고 가용성만 표현할 수 있다. 소유나 완료 시점이 다른 연산은 나눠 둔다.[](source:fs-q-compose) |
| 전체 유지 비용은 누가 소유하나 | 중복 애플리케이션 트리, 제품이 쓰는 데모 런처, 해석 전용 워크스페이스, 자체 업그레이드 수명 주기가 있는 설치 도우미를 추적한다. 제거되는 시스템 전체와 대체물(잔여 접착 코드 포함)을 비교한다.[](source:fs-q-cost) |

**도달성 증명.** 아래는 원문의 지시다.[](source:fs-reach)

- `rg`로 시작한 뒤 매치를 읽는다. 정확한 심볼, 속성 읽기·쓰기, 판별자, 이벤트·와이어 문자열, 설정 키, 패키지 이름을 찾고 `.method(`와 `method(` 두 형태를 모두 본다.
- 테스트와 선언은 계약을 보일 뿐, 배포된 생산자나 소비자를 증명하지 않는다.
- 패키지 소스, `apps/`, `python/`, 런타임 스크립트, 배포 프로필·오버레이, 매니페스트·export, 로더 해석, 생성된 런타임 자산, 설치된 패키지의 소비자까지 포함한다.
- 예시와 픽스처는 디렉터리 이름이 아니라 실제 진입점으로 분류한다. 모델이 쓴 플러그인 마운트가 쓰는 생성 카탈로그는 동적 제품 API이고, 문서 전용 목록은 고정 호출자가 아니다.
- 저장소 안 호출 지점이 0이어도 공개 제3자 확장 경로는 의도된 것일 수 있다.

기각은 제안 단위로 읽는다. 오래된 목록이나 섞인 제안에서 기각된 동작이 있어도, 그것이 독립 항목까지 판정하지는 않는다. 다시 제안하려면 증거를 새로 확인한다.[](source:fs-reject)

## 무엇을 강제하고 무엇을 금지하나 {#rules}

| 규칙 | 원문의 강도 |
| --- | --- |
| 사용자가 명시적으로 뒤집지 않는 한 `LLM` 쌍과 영속화 이음매의 삭제를 제안하지 않는다[](source:fs-protect) | {bad:금지} |
| 보관된 노트의 바깥 링크는 열어 보거나 검증하거나 고치지 않는다[](source:fs-scope) | {bad:금지} |
| 검토 대상 코드가 도입한 요구·검사·노트를 그 구분이 필요하다는 독립 근거로 쓰지 않는다[](source:fs-search) | 판단 기준 |
| 복사·동결·검증기·콜백 캡처는 값의 출처, 다음 소유자, 신뢰 경계를 이름 붙인다. 같은 프로세스의 타입 호출은 보통 읽기 전용 값을 빌리고, 파서·설정 로더·큐·모델/도구 JSON·내구 파일·워커·프로세스·와이어 디코더는 입력을 소유하거나 검증한다[](source:fs-own) | 의무 |
| 악의적 getter나 콜백 교체 시험만으로는 요구가 성립하지 않는다. 동결된 루트는 자손의 불변을 증명하지 않고, id가 같다고 객체가 같지는 않다[](source:fs-own) | 판단 기준 |
| 비동기 장치는 promise·플래그·취소 경로·disposer·예약마다 소유자와 전이를 짚고, 같은 사실을 표현할 때만 합친다. 동기 게시와 롤백, 콜백 격리, 첫 종료 결과 중재, 워커·프로세스 소유, 정지까지 폐기를 필요한 곳에서 지킨다[](source:fs-async) | 의무 |
| 중단된 작업을 버리는 것은 중복 로그 정리가 아니라 능력 손실이다. 내구 시작·끝 표시는 렌더러가 무시해도 실제 사실일 수 있다[](source:fs-async) | 판단 기준 |
| 패키지를 추가하기 전에 기존 의존성과 엔진 하한의 Node 내장을 먼저 찾는다. 교체가 지우는 구현과 전용 테스트, 유지·전이 비용, 접착 코드가 지킬 잔여 동작을 밝힌다[](source:fs-dep) | 의무 |
| 프로토콜 절단, 취소·정리, 설정 한도, 결정적 테스트 시계, 플랫폼 패키징, 소스와 빌드 진입점의 불일치를 시험한다. 크기 한도를 강제하려고 같은 프레이밍을 다시 짜야 하면 단순화가 아니다[](source:fs-dep-test) | 의무 |
| 의존성의 일반 명세를 다시 증명하지 말고 하네스 고유 접착 코드를 시험한다. 허용한 경계 동작 변경은 제안과 해당 테스트에 적는다[](source:fs-dep-test) | 의무 |
| 글이 범위에 들면 `dsh-prose-standard`를 쓴다. 코드를 되풀이하는 설명은 지우되 동작·시점·소유·실패 의무는 남긴다. 영향받는 README, JSDoc, 모델에 보이는 카탈로그, 설정, 스냅샷, 생성 파일은 그것을 소유한 변경과 함께 고친다[](source:fs-prose) | 의무 |
| 큰 제안은 필수 골격 다섯 절(`Problem`, `Proposal`, `Alternatives considered`, `Acceptance criteria`, `Risks`)을 쓴다. 구체적 소비자 근거, 제거되는 유지 비용, 포기하는 능력, 관찰 가능한 수용 조건을 넣는다[](source:fs-note) | 의무 |
| 같은 결정이면 기존 소유자를 고친다. 후보 수를 맞추려고 중복 노트를 만들지 않는다[](source:fs-note) | {bad:금지} |
| 작은 지역 개선은 실행 가능한 `TODO`·`FIXME`·`XXX` 주석으로 둔다. 독립 설계 기록으로 만들지 않는다[](source:fs-reject) | 의무 |
| 새 노트마다 `dsh-archive-agent-notes`로 범위를 좁힌 대체 확인을 한다. 코드 조사가 저장소 전체 노트 감사를 뜻하지 않는다. 부분 대체와 현재의 내구·와이어·호환·기각 대안 의무는 보존한다[](source:fs-supersede) | 의무 |
| 다른 branch를 합칠 때는 대상 기준 branch(base)와 견준 독립 `diff`를 비교하고, 지지되는 비중복 제안만 옮기며, 겹치는 근거는 합친다. 다른 PR을 닫으려면 권한이나 명확한 소유가 있어야 한다[](source:fs-fold) | 조건부 |

판정: 이 스킬의 강제는 "삭제하라"가 아니라 "삭제하기 전에 증명하라"에 있다. 지침이 후보 수보다 근거 있는 몇 개를 앞세우고, 보호 제약과 기각 규칙을 함께 둔 것이 그 근거다.[](source:fs-intro)[](source:fs-reject)

검증과 보고는 다음 순서다.[](source:fs-report)

- 문서만 다루는 `Agent Note` 작업은 `pnpm run doc-sync`, `pnpm run lint`, `git diff --check`를 돌린다. 스킬이나 주석 수정이면 해당 검증기를 더한다.
- 그 밖의 검사는 `dsh-pre-push-checks`로 고른다.
- 조사한 영역, 지지된 후보, 의미 있는 기각·보류, 추가·통합·유지·제거한 노트, 실제 실행한 명령을 보고한다.
- 조사가 넓어지는 동안은 초안(draft) PR을 쓴다. 검증하지 않은 검색을 전수라고 하지 않는다.

## 역사 사례는 어디에 쓰나 {#patterns}

`references/historical-patterns.md`는 후보의 가치가 미사용 심볼 검색만으로 서지 않을 때 쓰는 보정용 예시다. 기록된 결정을 설명할 뿐 지금 지울 대상의 목록이 아니다.[](source:hp-intro)

- 보관된 출처는 얼어 있는 스냅샷이다. 인용된 노트 자체를 읽되 그 바깥 링크는 따라가거나 고치지 않는다.
- 적용하기 전에 현재 소유자와 배포된 데이터 의무를 확인한다.
- 인용된 노트 경로는 원래 저장소에 있어 이 분석의 범위 밖이다.

| 절 | 가르치는 판단 | 반대편 사례 |
| --- | --- | --- |
| 완전한 효과 경로 요구 | 생산자 없는 변형과 모든 어댑터가 거부하는 설정값은 선언·전달·거부 시험·생성 문서까지 함께 지웠다 | 고정 호출자가 0이어도 의도된 제3자 등록 경로는 남겼다[](source:hp-effect) |
| 소비자가 결정하는 곳에서 구분 줄이기 | 모델에는 쓸 수 있는 팀 대상 하나만 보이고, 내부 라우팅은 세션 신원과 상주를 유지했다 | 한 렌더러가 무시한다는 이유로 내구 시작·완료 사실을 지우는 안은 기각했다[](source:hp-distinct) |
| 일반 동작을 더 작은 명시적 약속과 교환 | 고정 간격 스케줄은 달력 반복과 놓친 실행 재생을 포기해 파서·평가기·상태를 지웠고, 비트랜잭션 로더는 자동 롤백을 포기했다 | 중단된 턴을 잘라 복구를 단순화하는 안은 실제 작업을 잃어 기각했다[](source:hp-trade) |
| 가정을 소비 연산에서 명시 | 시간대를 스케줄 연산에 명시하게 해 세션 기본값과 탭 간 충돌 상태를 없앴다 | 호스트 쪽 입력 검증은 남겼다. 요구를 강제하는 위치 너머로 옮기지 않았다[](source:hp-assume) |
| 사용 시점에 파생하거나 기존 전달 소유자 재사용 | 피드백 시점에 정본 세션 접두를 읽어 복사 버퍼를 없앴고, 공유 스트림을 재사용했다 | 수동 배치는 활동 시각으로 도출할 수 없다. 남는 의무를 이름 붙인다[](source:hp-derive) |
| 우연한 구성 소유자 제거 | 중복 구성과 해석 전용 워크스페이스를 없애고, 명시적 배포 정책을 썼다 | 패키지 수가 줄었다는 것만으로는 부족하다. 소유와 완료 시점이 다른 호출 의도는 나눈다[](source:hp-compose) |
| 기각된 실험으로 동등성 주장 시험 | SSE 파서 교체는 일반 프레이밍을 지우고 제공자 고유 종료 처리를 남겼다 | 내장 `timer-promises`는 결정적 가짜 시계 시험을 깨 기각했다. 과거 기각은 영구 금지 목록이 아니라 범위가 한정된 반증이다[](source:hp-reject) |

## 흐름 속 위치 {#position}

이 스킬은 묶음 `cleanup`의 단계 스킬이다. 전체 흐름은 `deepseek-harness/_group-cleanup/cleanup.html`에 있다.

이 스킬로 들어오는 관계는 r47 하나다. `dsh-doc`은 문서 감사 중 글을 지우면 약속한 동작이 바뀔 때 이 스킬로 넘긴다. 직접 요청의 입력은 사용자 요청과 범위다.[](source:fs-intro) 아래 그림은 앞 스킬 하나와 뒤의 두 넘김을 그린다.

@workflow id=find-position title="cleanup 안의 위치"
| doc | 문서 감사 | external |
| me | 단순화 후보(이 스킬) | security |
| archive | 노트 대체 확인 | backend |
| push | 검사 고르기 | backend |
| doc > me | r47 동작 변경 | emphasis |
| me > archive | r36 새 노트마다 | emphasis |
| me > push | r27 추가 검사 | dashed |

| 구분 | 관계(rel-id, 상대) | 종류 | 전달물·상태 | 조건·강도 |
| --- | --- | --- | --- | --- |
| 받는 것 | r47 `dsh-doc` | 넘김 | 동작 변경 제안 | 감사에서 글을 지우면 설명이 아니라 약속한 동작이 바뀔 때, 동작 변경을 먼저 제안하고 그 제안은 이 스킬을 따른다. 이 쪽 원문에는 `dsh-doc`을 부르는 말이 없다[](source:rel-doc) |
| 넘기는 것: 노트 | r36 `dsh-archive-agent-notes` | 내부 위임 | 새 `Agent Note`. 상태는 대상 저장소 `.agents/notes/` | 새 노트마다 범위를 좁힌 대체 확인을 거친다(의무형 "requires"). 코드 조사가 전체 노트 감사를 뜻하지 않는다[](source:fs-supersede) |
| 넘기는 것: 검사 | r27 `dsh-pre-push-checks` | 넘김 | 바꾼 범위 | 문서만 다루는 `Agent Note` 작업은 `doc-sync`, `lint`, `git diff --check`를, 스킬·주석 수정은 해당 검증기도 돌린다. 그 밖의 검사는 이 스킬로 고른다[](source:fs-report) |
| 조건: 글 | r37 `dsh-prose-standard` | 내부 위임 | 글 변경 | 글이 범위에 들 때 적용한다. 그림에서는 뺐다[](source:fs-prose) |


## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `deepseek-harness/dsh-find-simplifications/` 아래 2개다. `SKILL.md` 11,425B와 `references/historical-patterns.md` 8,573B로, 합계 19,998B다. 모두 끝까지 읽었다.
- 원장 대조를 위해 `dsh-doc/SKILL.md` 93줄(r47)을 확인했다. 그 줄만 읽었다.
- 제외한 파일: 없음. 이 컬렉션에는 번역본이 없다.
- 범위 밖: 본문과 참조 문서가 링크한 `docs/`, `notes/` 문서는 원래 저장소(deepseek-harness)에 있어 읽지 않았다. 노트 규칙, 의존성 정책, 인용된 결정 노트의 본문은 이 페이지에 없다.
- 원문 비교: 원장 기준 다른 컬렉션에 같은 이름의 스킬이 없다.
- 실행하지 않았다. 검색, 노트 작성, 검사는 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
머리말은 "작은 인라인 정리를 가려낸다"고 하고, 본문은 작은 지역 개선을 `TODO`·`FIXME`·`XXX` 주석에 두라고 한다.[](source:fs-fm)[](source:fs-reject) 에이전트가 작은 정리를 직접 고쳐도 되는 조건은 원문에 명시 없음.
조사와 구현 허락을 구분하라고 하지만, 사용자에게 승인을 구하는 시점이나 방법은 원문에 명시 없음.[](source:fs-intro)
"넓은 요청"의 기준과 서브에이전트 수의 상한은 원문에 명시 없음.[](source:fs-broad)
