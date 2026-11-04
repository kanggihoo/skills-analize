# benchmark-checklist 스킬은 에이전트를 어떻게 바꾸나 {#benchmark-checklist-skill}

`benchmark-checklist`를 켜면, 에이전트는 직접 잰 성능 수치를 바로 보고하지 않는다. 에이전트는 질문 7개에 실행 근거로 답한 뒤에야 판정과 수치를 낸다.[](source:skill-intro)

- 에이전트는 측정하기 전에 내보낼 주장을 문장으로 먼저 적는다. 질문 7개는 그 문장을 시험한다.[](source:skill-before)
- 답은 코드에 대한 짐작이 아니라 실행에서 얻은 근거여야 한다.[](source:skill-intro)
- 에이전트는 비교 대상 각 쪽을 5회 이상 번갈아 돌리고 중앙값과 범위를 보고한다.[](source:skill-q5)
- 병목(limiter)을 대지 못하거나, 한쪽이 튜닝되지 않았거나, 4번·7번을 확인하지 못하면, 에이전트는 판정을 "결론 없음"으로 쓴다.[](source:skill-report)

@answer scope="pstack/benchmark-checklist · 원본 텍스트 파일 1개 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/benchmark-checklist/SKILL.md · 5409B · frontmatter" path=pstack/benchmark-checklist/SKILL.md lines=1:5
@source skill-intro title="pstack/benchmark-checklist/SKILL.md · 쓰는 때" path=pstack/benchmark-checklist/SKILL.md lines=9:9
@source skill-ballpark title="pstack/benchmark-checklist/SKILL.md · 대략치 예외" path=pstack/benchmark-checklist/SKILL.md lines=11:11
@source skill-before title="pstack/benchmark-checklist/SKILL.md · 돌리기 전에" path=pstack/benchmark-checklist/SKILL.md lines=13:17
@source skill-q1 title="pstack/benchmark-checklist/SKILL.md · 질문 1" path=pstack/benchmark-checklist/SKILL.md lines=21:21
@source skill-q2 title="pstack/benchmark-checklist/SKILL.md · 질문 2" path=pstack/benchmark-checklist/SKILL.md lines=22:22
@source skill-q3 title="pstack/benchmark-checklist/SKILL.md · 질문 3" path=pstack/benchmark-checklist/SKILL.md lines=23:23
@source skill-q4 title="pstack/benchmark-checklist/SKILL.md · 질문 4" path=pstack/benchmark-checklist/SKILL.md lines=24:24
@source skill-q5 title="pstack/benchmark-checklist/SKILL.md · 질문 5" path=pstack/benchmark-checklist/SKILL.md lines=25:25
@source skill-q6 title="pstack/benchmark-checklist/SKILL.md · 질문 6" path=pstack/benchmark-checklist/SKILL.md lines=26:26
@source skill-q7 title="pstack/benchmark-checklist/SKILL.md · 질문 7" path=pstack/benchmark-checklist/SKILL.md lines=27:27
@source skill-report title="pstack/benchmark-checklist/SKILL.md · 보고" path=pstack/benchmark-checklist/SKILL.md lines=29:34
@source skill-fit title="pstack/benchmark-checklist/SKILL.md · 다른 성능 자료와의 관계" path=pstack/benchmark-checklist/SKILL.md lines=36:39
@source pm-trigger title="pstack/poteto-mode/SKILL.md · benchmark-checklist 호출 조건" path=pstack/poteto-mode/SKILL.md lines=31:31
@source pb-hill title="pstack/poteto-mode/playbooks/hillclimb.md · 하네스 검증" path=pstack/poteto-mode/playbooks/hillclimb.md lines=8:8
@source pb-perf title="pstack/poteto-mode/playbooks/perf-issue.md · 기준선 검증" path=pstack/poteto-mode/playbooks/perf-issue.md lines=5:5
@source pb-pr title="pstack/poteto-mode/playbooks/opening-a-pr.md · PR의 성능 수치" path=pstack/poteto-mode/playbooks/opening-a-pr.md lines=22:22
@source etn title="pstack/principle-explain-the-number/SKILL.md · 성능 수치는 이 스킬로" path=pstack/principle-explain-the-number/SKILL.md lines=19:19

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 그래서 이 스킬은 사용자가 `/benchmark-checklist`를 입력하거나 다른 스킬이 부를 때 켜진다. 본문은 성능 수치를 만들 때 쓰라고 한다. 예는 PR의 전후 비교, 성능 저하(regression) 주장, 수치 끌어올리기(hillclimb) 하네스, 라이브러리나 설정 선택이다.[](source:skill-intro)

| 누가 부르나 | 조건 | rel-id |
| --- | --- | --- |
| 사용자 | `/benchmark-checklist` 입력 | - |
| `poteto-mode` | 벤치마크를 돌리거나, 성능을 직접 재거나, 잰 개선·저하를 보고할 때 부른다. 수치를 보고하거나 그 수치로 행동하기 전에 부른다[](source:pm-trigger) | r09 |
| `principle-explain-the-number` | 성능 수치이면, 이 스킬로 전체 절차를 돌린다[](source:etn) | r95 |
| hillclimb 플레이북 | 하네스를 고정하기 전에 검증한다[](source:pb-hill) | 원장 플레이북 표 |
| perf-issue 플레이북 | 기준선과 그 뒤 모든 수치를 검증한다[](source:pb-perf) | 원장 플레이북 표 |

이 스킬이 왜 필요한지는 `principle-explain-the-number`가 설명한다고 본문이 적는다(r94).[](source:skill-intro) 묶음에 속하지 않은 독립 스킬이다.

## 어떤 순서로 진행하나 {#flow}

@workflow id=bench-flow title="benchmark-checklist 진행 흐름"
| prep | 사전 준비 | backend |
| kind | 대략치? | backend |
| quick | 1회 실행 | backend |
| full | 질문 7개 | backend |
| report | 보고 | frontend |
| prep > kind | | |
| kind > quick | 예 | |
| kind > full | 아니오 | emphasis |
| quick > report | | |
| full > report | | |

@steps id=bench-steps
| s-prep | 사전 준비 | 에이전트는 내보낼 주장을 실제 문장으로 적는다(예: "60k행 데이터셋에서 p50 기준 `export`가 30% 빠르다"). 측정 스크립트를 읽고 무엇을 재고, 세고, 무시하는지 적는다. `uptime`으로 부하 평균을, `nproc`로 코어 수를 본다. 기계가 바쁘면, 무엇이 도는지 찾는다. 도는 것을 멈출 수 없으면, 두 쪽을 번갈아 돌려 같은 잡음을 받게 하고, 보고서에 그렇게 했다고 적는다. | bench-flow | prep |
| s-kind | 대략치? | 에이전트는 사용자가 빠른 대략치를 요청했는지 본다. 선택지 사이에서 고르는 일은 절대 대략치가 아니다. | bench-flow | kind |
| s-quick | 1회 실행 | 에이전트는 한 번만 돌린다. 한 번만 돌려도 4번(오류)과 7번(일이 실제로 일어났나)은 확인한다. 한 번 돌린 결과라고 밝힌다. 결과가 이상해 보이지 않으면, 나머지 질문은 건너뛴다. | bench-flow | quick |
| s-full | 질문 7개 | 에이전트는 아래 표의 질문 7개에 모두 실행 근거로 답한다. | bench-flow | full |
| s-report | 보고 | 에이전트는 판정을 먼저 쓰고, 수치, 단위, 실행 횟수, 범위, 병목을 붙인다. | bench-flow | report |

그림의 대략치 분기는 원문 11줄을, 나머지는 13~34줄을 따랐다.[](source:skill-ballpark)[](source:skill-before)[](source:skill-report) 판정: 대략치 분기와 사전 준비 중 무엇이 먼저인지는 원문에 명시 없음. 그래서 그림은 사전 준비를 두 경로의 공통 첫 단계로 둔다.

## 질문 7개는 무엇을 확인하나 {#questions}

| 질문 | 확인하는 것 | 실패하면 |
| --- | --- | --- |
| 1 왜 두 배가 아닌가 | 에이전트가 병목을 댄다. 이때 보고하지 않을 별도 실행에서 프로파일한다. 프로세스별 CPU(`top`, `pidstat`), 런타임 프로파일러(`node --cpu-prof`, `py-spy`, `perf`), I/O 대기, 시스템 콜 수(`strace -c`)를 보고, 부하 생성기도 본다[](source:skill-q1) | 부하 생성기가 먼저 포화되면, 잰 것은 부하 생성기다. 수치가 안 움직였어도, 병목을 찾기 전에는 변경이 쓸모없다고 하지 않는다 |
| 2 튜닝했나 | 에이전트가 모든 쪽을 운영 환경처럼 돌린다. 조건은 릴리스 빌드, 운영 플래그와 환경 변수, 배치·트랜잭션 설정, 연결 풀, 운영과 같은 캐시 상태, 같은 버전과 데이터다[](source:skill-q2) | 한쪽이 기본값이면, 구현이 아니라 설정을 비교한 것이다. 튜닝한 뒤 다시 잰다. 튜닝할 수 없으면, 그 실행으로 승자를 고르지 않는다 {bad:승자 금지} |
| 3 한계를 넘었나 | 에이전트가 산수로 확인한다. 초당 바이트는 디스크·네트워크 대역폭과, 초당 연산 × 연산당 비용은 코어 수와 비교한다[](source:skill-q3) | 한계를 넘은 결과는 캐시, 아무 일도 안 하는 코드, 버그를 잰 것이다 |
| 4 오류가 났나 | 에이전트가 실패와 비정상 응답을 센다. 출력이 있는지가 아니라 맞는지 본다. 스크립트가 오류를 세지 않으면, 세도록 고친다[](source:skill-q4) | 오류를 세지 않으면, 거절은 빠르고 시간 초과·재시도는 느려서 수치가 왜곡된다 |
| 5 재현되나 | 에이전트가 각 쪽을 5회 이상 A, B, A, B로 번갈아 돌리고, 중앙값과 범위를 보고한다. 차이가 아슬아슬하면, 순위합 검정이나 하네스 자체 통계를 쓴다[](source:skill-q5) | 실행 간 변동보다 작은 차이는 "측정 가능한 차이 없음"이다 |
| 6 중요한가 | 에이전트가 미시 결과 옆에 사용자가 기다리는 전체 경로를 현실적인 데이터 크기와 동시성으로 잰다. 미시 결과는 전체 대비 비율로 보고한다[](source:skill-q6) | 요청의 1%를 쓰는 헬퍼는 아무리 빨라져도 요청을 최대 1%만 빠르게 한다 |
| 7 실제로 일어났나 | 에이전트가 측정 구간 안에서 일이 돌았는지 본다. 요청이 서버에 닿았고, 행이 쓰였고, 바이트를 읽었고, 코드가 결과를 썼는지[](source:skill-q7) | 아무도 순회하지 않는 제너레이터, 기다리지 않는 프로미스, JIT 컴파일러가 버리는 결과, 시간 초과는 일어나지 않은 일의 수치를 만든다 |

@facts
| 실행 횟수 | 각 쪽 최소 5회, 번갈아 실행(의무) |
| 보고 통계 | 중앙값과 범위(의무) |
| 대략치 | 1회. 4번·7번은 그래도 확인(사용자가 요청할 때만) |
| 한계 예시 | 10%를 쓰는 부분을 없애면 최대 약 11% 빨라진다 |
| PR 본문 | 대표 수치 하나 |

10% 예시의 계산: 실행 시간이 100에서 90이 되면 속도는 100/90 ≈ 1.11배다. 그래서 "약 11%"가 상한이다.[](source:skill-q3)

## 무엇을 보고하나 {#report}

| 규칙 | 원문의 강도 |
| --- | --- |
| 판정을 먼저 쓴다. 빠름, 느림, 측정 가능한 차이 없음, 결론 없음 중 하나[](source:skill-report) | 의무 |
| 수치와 단위, 실행 횟수, 범위, 병목을 함께 쓴다[](source:skill-report) | 의무 |
| 차이를 주장하는데 병목을 못 대거나, 한쪽이 튜닝되지 않았거나, 4번·7번을 확인하지 못했으면, 판정은 "결론 없음"이다. 무엇이 비었는지 밝힌다[](source:skill-report) | 의무 |
| PR 본문에는 대표 수치 하나만 쓴다. 실행 기록, 범위, 병목 근거는 링크한 산출물이나 노트 파일에 둔다[](source:skill-report) | 의무 |
| 현재 출시 설정으로 주장을 좁혀도 튜닝 문제는 풀리지 않는다. 사용자는 오늘의 설정이 아니라 선택지를 도입하기 때문이다[](source:skill-q2) | 금지(우회 불가) |

원문의 보고 예시는 이렇다. "p50 41 ms → 33 ms, 각 쪽 7회 실행의 중앙값, 이후 범위 32~35 ms, 코어 하나에서 JSON 파싱에 묶임."[](source:skill-report) PR 대표 수치 규칙은 opening-a-pr 플레이북을 따른다. 그 플레이북은 `before → after` 형태의 수치 하나를 단위와 함께 쓰라고 한다.[](source:pb-pr)

perf-issue 플레이북이 느린 곳을 찾아 고치면, 이 스킬은 그 기준선과 이후 모든 수치를 검증한다. hillclimb 플레이북에서는 하네스를 고정하기 전에 검증한다. 고정된 하네스가 오류 수와 일한 양을 출력한다. 그래서 유지·되돌리기를 판단할 때마다 4번과 7번을 따로 하지 않아도, 그 출력으로 확인된다.[](source:skill-fit)

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 하나. 이 폴더의 원본은 이것뿐이다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: `reporting-skills/pstack/benchmark-checklist/SKILL.md`와 원문 동일(원장 기준, `shasum` 일치).
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
원장에는 이 스킬이 opening-a-pr, perf-issue, hillclimb 플레이북을 가리키는 관계 행이 없다. 원문은 34·38·39줄에서 세 플레이북을 이름으로 가리킨다. "아슬아슬한" 차이의 수치 기준과 순위합 검정의 유의 수준은 원문에 명시 없음. Linux 외 환경에서 `strace -c` 대신 쓸 도구도 원문에 명시 없음.
