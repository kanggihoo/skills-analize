# dsh-speed-up-perf 스킬은 에이전트를 어떻게 바꾸나 {#speed-up-perf-skill}

`dsh-speed-up-perf`가 켜지면 에이전트는 "빨라졌다"고 말하기 전에, 사용자가 실제로 겪는 경로를 닮은 벤치마크부터 만든다. 고치기 전 코드로 회귀를 먼저 증명하고, 그다음에야 동작을 바꾸지 않는 작은 수정을 낸다.[](source:sp-intro)[](source:sp-base-run)

- 에이전트는 구현 전에 측정 카드 일곱 칸(사용자 동작, 워크로드, 진입 경로, 시계, 메모리, 판정, 동작)을 채운다.[](source:sp-card)
- 수정 뒤에는 강화한 단언이 원래 구현에서 실패하는지 확인한다. 이것이 음성 대조(negative control)다.[](source:sp-onefactor)
- 출력·순서·취소·폐기 같은 동작은 지킨다. 기록을 몰래 자르거나 도구 결과를 건너뛰어 숫자를 맞추지 않는다.[](source:sp-behavior)
- 실행한 근거만 보고한다. 로컬 시간 측정이 CI runner(CI를 돌리는 머신)의 안정성을 증명한다고 가정하지 않는다.[](source:sp-prepush)

@answer scope="dsh-speed-up-perf · 파일 1개 · 커밋 475505c · 지시상 동작"
@meta locale=ko
@source sp-fm title="deepseek-harness/dsh-speed-up-perf/SKILL.md · 12167B · frontmatter" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=1:4
@source sp-intro title="SKILL.md · 목적" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=8:8
@source sp-auth title="SKILL.md · 먼저 읽을 문서" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=12:12
@source sp-agree title="SKILL.md · 합의할 것과 측정 분리" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=14:14
@source sp-base title="SKILL.md · 현재 기준 커밋과 증거 구분" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=16:16
@source sp-survey title="SKILL.md · 사용자 경로 조사" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=20:25
@source sp-drivers title="SKILL.md · 비용 요인 분리" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=27:27
@source sp-rank title="SKILL.md · 후보 순위" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=29:29
@source sp-bench title="SKILL.md · 기존 레인 확장" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=33:33
@source sp-corpus title="SKILL.md · 로컬 코퍼스와 고정 입력" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=35:35
@source sp-card title="SKILL.md · 측정 카드" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=37:47
@source sp-node title="SKILL.md · 빌드된 JS와 브라우저 자산" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=49:49
@source sp-fresh title="SKILL.md · 콜드·웜 샘플" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=51:51
@source sp-budget title="SKILL.md · 샘플 보고와 예산" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=53:53
@source sp-e2e title="SKILL.md · 종단 지연과 메모리" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=55:55
@source sp-browser title="SKILL.md · 브라우저 반응성" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=57:57
@source sp-base-run title="SKILL.md · 수정 전 측정" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=61:61
@source sp-patterns title="SKILL.md · 시험할 패턴" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=63:72
@source sp-onefactor title="SKILL.md · 한 요인씩, 음성 대조" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=74:74
@source sp-behavior title="SKILL.md · 동작과 자원 소유 보존" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=78:78
@source sp-minor title="SKILL.md · 눈에 보이는 차이와 GUI 근거" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=80:80
@source sp-reject title="SKILL.md · 기각 조건" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=82:82
@source sp-note title="SKILL.md · `Agent Note`" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=86:86
@source sp-stack title="SKILL.md · 스택 PR" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=88:88
@source sp-prepush title="SKILL.md · push 전 검사와 리뷰 대응" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=90:90
@source sp-summary title="SKILL.md · 결과 요약과 종료" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=92:92

## 언제 켜지고 무엇을 먼저 정하나 {#trigger}

@code source=sp-fm language=yaml

머리말에는 `name`과 `description`만 있고 호출 제한 필드가 없다.[](source:sp-fm) 판정: 모델이 `description`을 참고해 스스로 켤 수 있다. `description`은 판단용 설명이지, 특정 단어가 있으면 켜지는 키워드 목록이 아니다.

`description`이 드는 용도는 성능 조사와 최적화, 현실적인 합성 벤치마크나 CI 성능 통과 조건 설계, 긴 세션과 웹 반응성 프로파일링, 성능 PR 근거를 측정된 수정으로 바꾸는 일이다.[](source:sp-fm) 원문은 이 스킬을 "지침이지 할당량이나 스크립트가 아니다"라고 밝힌다. 에이전트는 넓게 조사하고, 측정된 비용을 따라가고, 사용자가 실제로 돌리는 작업을 낫게 하지 못하는 수정은 기각한다.[](source:sp-intro)

시작하기 전에 에이전트는 세 가지를 한다.

- 저장소 `AGENTS.md`, 구조·테스트·방어 패턴 문서, 영향받는 패키지의 지침과 `Agent Note`를 읽는다. 이 문서들은 원래 저장소에 있어 이 분석의 범위 밖이다.[](source:sp-auth)
- 사용자에게 보이는 끝점, 워크로드 범위, 자원 제약, 허용할 사소한 동작 차이, 멈춤 기준을 합의한다.[](source:sp-agree)
- 현재 기준 commit(base)과 병합된 최종 diff, 소유 소스, 테스트, 해결된 리뷰 스레드를 읽는다. PR 본문은 폐기된 구현을 설명할 수 있기 때문이다.[](source:sp-base)

원문은 두 가지를 구분하라고 한다. 백엔드와 브라우저 종단 측정은 따로 둔다. 모델·네트워크 지연을 뺀 로컬 오버헤드를 재면 그 제외를 밝히고, 제품 전체 지연이라고 부르지 않는다.[](source:sp-agree) 증거는 병합됨, 닫힘(미병합), 대체됨, 추정, 새로 측정함으로 나눈다.[](source:sp-base)

## 어떤 순서로 진행하나 {#flow}

@workflow id=perf-flow title="성능 개선 진행"
| lane prep | 측정 준비 |
| lane prove | 회귀 증명과 수정 |
| lane close | 마무리 |
| scope | 범위 합의 | external | prep |
| survey | 경로 조사·순위 | backend | prep |
| card | 측정 카드·벤치 | backend | prep |
| base | 수정 전 측정 | backend | prove |
| fix | 한 요인씩 수정 | backend | prove |
| keep | 끝단에서도 이득? | backend | prove |
| ship | 결과 보고 | frontend | close |
| reject | 기각 기록 | backend | close |
| scope > survey | |
| survey > card | |
| card > base | |
| base > fix | 회귀 확인 |
| fix > keep | |
| keep > ship | 예 | emphasis |
| keep > reject | 아니오 | dashed |

@steps id=perf-steps
| s-scope | 범위 합의 | 끝점, 워크로드 범위, 자원 제약, 허용할 차이, 멈춤 기준을 정한다. 백엔드와 브라우저 측정은 나눈다. | perf-flow | scope |
| s-survey | 경로 조사·순위 | 시작·첫 읽기, 긴 기록, 초기 전송·첫 페인트, 실시간 스트림의 네 영역을 훑고, 후보를 사용자 지연·CPU·메모리·빈도·확신도로 순위 매긴다. | perf-flow | survey |
| s-card | 측정 카드·벤치 | 구현 전에 측정 카드를 쓰고, 기존 필수 레인을 확장해 합성 벤치마크를 만든다. | perf-flow | card |
| s-base | 수정 전 측정 | 최적화하지 않은 워크로드를 돌려 명령, 리비전, 환경, 입력 크기, 원시 측정, 판정을 저장한다. | perf-flow | base |
| s-fix | 한 요인씩 수정 | 원인 요인 하나만 바꾸고, 집중 시나리오와 종단 상위 시나리오를 모두 다시 돌린다. | perf-flow | fix |
| s-keep | 끝단에서도 이득? | 아래 네 경우 중 하나면 수정을 기각한다. | perf-flow | keep |
| s-ship | 결과 보고 | 워크로드, 전후 절대값과 비율, 끝점·메모리 의미, 동작 근거, 음성 대조, 실행한 검사, 제외 항목 순으로 요약한다. | perf-flow | ship |
| s-reject | 기각 기록 | 기각한 가설을 짧게 적고 범위를 넓히지 않는다. | perf-flow | reject |

**조사 단계.** 원문의 지시는 다음과 같다.

- 영역이 독립적이고 넓이가 도움이 되면 서브에이전트에 나눠 맡기고, 서브에이전트에게 추측이 아니라 측정과 프로덕션 호출 위치를 요구한다.[](source:sp-survey)
- 바이트, 내구 이벤트, 압축 기록, 원시 델타, 턴, 도구, 자식, 화면 DOM 노드는 서로 다른 양이다. 작은 메시지가 많다는 이유로 "현실적"이라고 부르지 않는다.[](source:sp-drivers)
- 후보마다 프로덕션 소비자, 반복되는 일, 예상 복잡도, 가장 작은 반증 가능 개입, 유지할 동작을 적는다. 수상한 루프나 안 쓰는 캐시, 큰 파일만으로는 병목의 증거가 아니다.[](source:sp-rank)

**수정 전 측정.** 실패하는 시나리오는 실제 병목이 남을 때까지 줄이고, 프로파일·할당 샘플·작업 횟수·단계별 시간으로 가설을 가른 다음 고친다.[](source:sp-base-run)

**기각 조건.** 다음 중 하나면 최적화를 기각한다.[](source:sp-reject)

- 이득이 종단에서 사라진다.
- 일반 워크로드가 눈에 띄게 나빠진다.
- 작은 이득에 비해 복잡도가 크다.
- 취소·보유·내구성을 설명하고 시험할 수 없다.

**끝내는 조건.** 합의한 시나리오와 수정 범위에서 멈춘다. 관련 없는 기회를 쫓지 않고 순위를 매긴 짧은 후속 목록만 남긴다.[](source:sp-summary) 기각 뒤에 다음 가설로 돌아가는지는 원문에 명시 없음.

**시험해 볼 패턴.** 원문은 이 목록을 "자동 처방이 아니다"라고 밝힌다.[](source:sp-patterns)

- 압축 표현을 하류 읽기까지 유지한다. 소비자가 정착된 내용이나 집계 하나만 필요하면 델타마다 객체를 만들지 않는다.
- 중복 파싱·복사·동결·검증은 소유권과 신뢰 전환을 확인한 뒤에만 지운다. 같은 프로세스 안의 타입 빌림이 내구 저장이나 전송 파싱을 약화해도 된다는 허락은 아니다.
- 산출물 변환은 스트리밍하고 중간 상태를 제한한다. 게시·검증·쓰기 준비 의무는 사용자 동작이 요구하는 곳에서 남긴다.
- 읽기 전용 준비와 쓰기·게시 작업을 나눈다. 정확성에 필요한 끝점을 넘어 기다리는 작업은 옮기지 않는다.
- 비활성 뷰와 접힌 상세의 작업은 미룬다. 첫 활성화와 유지 상태도 잰다. 미룸은 삭제가 아니고, 뷰포트 하이라이트는 완전한 가상화가 아니다.
- 식별자를 안정시키고 구독을 좁혀 노드 하나가 전체 기록을 무효화하지 않게 한다. 갱신 순서와 즉시 이벤트 동작은 지킨다.
- 반복 이동·스캔·재구성은 알맞은 자료구조로 바꾼다. 컨테이너 연산 하나가 아니라 소비자 전체 경로를 잰다.
- 개정 키 재사용과 한 번만 실행하기(singleflight)는 명시적 무효화, 제한된 보유, 대기자별 독립 취소, 폐기 소유권이 있을 때만 쓴다. 반복 벤치마크가 빨라 보이도록 확장 표현을 캐시하지 않는다.

## 무엇을 강제하고 무엇을 금지하나 {#rules}

측정 카드는 구현 전에 일곱 칸을 모두 채운다.[](source:sp-card)

| 칸 | 정해야 하는 것 |
| --- | --- |
| 사용자 동작 | 정확한 동작과 밖에서 관찰할 수 있는 완료 조건 |
| 워크로드 | 고정 차원, 분포, 생성 시드·상수, 일반 사용과 꼬리 사용을 함께 건드리는 이유 |
| 진입 경로 | 프로덕션 호출·구성과 빌드된 산출물. 모의하는 외부 경계 |
| 시계 | 포함할 준비 작업, 콜드·웜 상태, 시작·끝 시점, 제외할 비용 |
| 메모리 | 끝점에서 닿는 객체, 기준선, GC 정책, 유지와 일시 한도 |
| 판정 | 원시 샘플, 결정하는 집계, 보정한 절대·비율·메모리 한도, 음성 대조 |
| 동작 | 소유 기능 테스트·스냅샷과 허용할 사소한 차이 |

| 규칙 | 원문의 강도 |
| --- | --- |
| 사용자가 허가한 경우에만 로컬 코퍼스를 본다. 집계 특성만 뽑는다. 프롬프트·출력·경로·신원·ID·자격 증명·녹화·알아볼 수 있는 조각을 픽스처·로그·스크린샷·PR·산출물에 복사하지 않는다[](source:sp-corpus) | 조건부 허가, {bad:복사 금지} |
| 고정 입력은 검토된 상수로 만든다. 벤치마크가 사용자 홈, 주변 저장소, 네트워크 서비스, 개인 데이터에 기대지 않는다[](source:sp-corpus) | 의무 |
| 기존 필수 레인을 확장한다. 경쟁하는 보정·보고 기반을 새로 만들지 않는다[](source:sp-bench) | 의무 |
| 수정 전 코드를 먼저 돌려 증거를 저장한다[](source:sp-base-run) | 의무 |
| 강화한 단언이 원래 구현(또는 되살린 비용)에서 실패해야 한다. 회귀를 통과시킬 만큼 관대하거나 검증된 소음 바닥 아래인 예산은 보호가 아니다[](source:sp-onefactor) | {good:음성 대조 필수} |
| 예산은 소스 상수이며 환경 변수로 덮어쓰지 않는다. 예산을 넓히거나 운 좋은 실행을 골라 회귀를 숨기지 않는다[](source:sp-budget) | {bad:금지} |
| Node 레인은 기존 공유 시간 보정과 검토된 편차 여유를 쓴다. 바이트·개수·무차원 비율을 CPU 속도로 스케일하지 않는다[](source:sp-budget) | 의무, 금지 |
| 필수 브라우저 성능 케이스는 레인 결정과, 실제 CI 브라우저·runner에서의 반복 측정을 거친 뒤에야 타이밍 예산을 채택한다. 수동 브라우저 진단에는 임계값을 두지 않는다[](source:sp-budget) | 조건 |
| 빌드된 JavaScript 산출물을 순수 `node`에서 잰다. 측정만을 위한 프로덕션용 `export`를 더하거나 알고리즘을 "벤치마크 구현"에 복사하지 않는다[](source:sp-node) | 의무, 금지 |
| 콜드 샘플은 새 자식 프로세스와 비공개 임시 루트를 쓴다. 웜 샘플은 유지할 캐시를 명시한다[](source:sp-fresh) | 의무 |
| 브라우저 반응성은 실제 브라우저 입력을 주고 UI 갱신을 관찰한다. Node 폴드, 가짜 DOM, 사용자 정의 heartbeat 이벤트만으로는 입증하지 못한다[](source:sp-browser) | 판단 기준 |
| 종단 지연은 단계별 시간과 따로 재고, 유지 메모리와 일시 압력도 따로 잰다. 유지량이 무제한인 빠름은 자동으로 이득이 아니다[](source:sp-e2e) | 의무 |
| 출력·순서·페이징·스트림 인덱스·오류·취소·동시성·폐기를 지키는 소유 테스트를 실행하거나 추가한다. 기록을 자르거나 도구 결과를 건너뛰거나 수명 주기 의미를 바꿔 숫자를 맞추지 않는다[](source:sp-behavior) | 의무, {bad:금지} |
| 의도한 사소한 차이는 명시하고 소유 스냅샷으로 검증한다. GUI 변경이 제품에 보이면 요구되는 브라우저 근거나 GIF 녹화를 넣는다[](source:sp-minor) | 의무 |

판정: 음성 대조 요구와 "운 좋은 실행 선택 금지"는 같은 위험을 막는다. 그 위험은 결과를 본 뒤에 통과 기준을 맞추는 일이다.[](source:sp-onefactor)[](source:sp-budget)

이 스킬에는 수치 한도가 없다. 시간 예산과 보정 값은 저장소 `benchmarks/`의 소스 상수에 있고 이 분석의 범위 밖이다.[](source:sp-bench)

## 다른 스킬과 어떻게 이어지나 {#relations}

이 스킬은 어느 묶음에도 속하지 않는 독립 스킬이다. 판정: 성능 개선이라는 자기 목표가 따로 있다. 원장 기준으로 아래 여섯 관계가 있다. 상대가 이름으로 불리지 않는 행은 근거 방식 칸에 적었다.

| rel-id | 상대 | 종류 | 조건·강도 | 근거 방식 |
| --- | --- | --- | --- | --- |
| r39 | `dsh-ci-test-reliability` | 내부 위임 | 프로세스, 시계, 브라우저 테스트, 비동기 정리에 쓰라고 한다[](source:sp-auth) | 명시-이름 |
| r29 | `dsh-pre-push-checks` | 넘김 | 적용하고, 실행한 근거만 보고한다. CI를 확인하고 로컬 시간 측정이 runner 안정성을 증명한다고 가정하지 않는다[](source:sp-prepush) | 명시-이름 |
| r35 | `record-browser-gif` | 참고 | 제품에 보이는 GUI 변경이면 필요한 브라우저 근거(GIF 포함)를 넣는다. 스킬 이름은 부르지 않는다[](source:sp-minor) | 명시-역할 |
| r41 | `dsh-archive-agent-notes` | 공유 상태 | `Agent Note` 규칙으로 근거를 남기고 관련 노트의 대체 여부를 확인한다. 저장소 전체 글 정리로 키우지 않는다. 상태는 대상 저장소 `.agents/notes/`에 있다[](source:sp-note) | 명시-역할 |
| r40 | `dsh-merging-stacked-prs` | 산출물 호환 | stack PR을 요구받으면 편집 전에 층을 정하고 GitHub 공식 stack과 별도 worktree를 쓴다. 이름은 부르지 않는다[](source:sp-stack) | 추론 |
| r45 | `dsh-merging-stacked-prs`(방향: 그쪽에서 이 스킬로) | 공유 상태 | 둘 다 GitHub 공식 stack 객체와 `gh stack` 명령을 쓴다. stack 규칙·CI·순서·병합 상태는 GitHub 쪽이 갖는다. 범위 밖(CLI)[](source:sp-stack) | 명시-역할 |

stack을 쓰면 층마다 병합할 수 있어야 한다. 벤치마크 기반은 측정한 기준선을 지키고, 최적화 층은 수정과 기능 시험과 더 엄격한 예산을 함께 담는다. 독립 병목은 별도 stack을 쓸 수 있고, 발견된 문제는 소유 층에서 먼저 고친다.[](source:sp-stack)

PR을 준비 완료로 표시한 뒤에는 리뷰 지적을 코드와 실행 가능한 근거로 평가한다. 이유나 수정으로 답하고 처리한 스레드를 닫는다. 봇이 낸 보고라는 이유만으로 무시하지 않는다.[](source:sp-prepush)

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `deepseek-harness/dsh-speed-up-perf/SKILL.md` 1개, 12,167B. 폴더에 다른 파일이 없다. 끝까지 읽었다.
- 제외한 파일: 없음. 이 컬렉션에는 번역본이 없다.
- 범위 밖: 본문이 링크한 `AGENTS.md`, `docs/`, `benchmarks/AGENTS.md`, `notes/` 문서는 원래 저장소(deepseek-harness)에 있어 읽지 않았다. 그래서 예산 수치, 보정 방식, `Agent Note` 규칙은 이 페이지에 없다.
- 원문 비교: 원장 기준 다른 컬렉션에 같은 이름의 스킬이 없다.
- 실행하지 않았다. 벤치마크, 프로파일, 검사는 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
측정 카드와 범위를 "합의"하는 상대는 원문에 명시 없음. 사용자에게 승인받는 지점도 명시 없음. 원문이 승인을 말하는 곳은 사용자가 로컬 코퍼스 조사를 허가하는 경우뿐이다.[](source:sp-corpus)
수정을 기각한 뒤 다음 가설로 돌아가는지는 원문에 명시 없음.
PR을 "준비 완료로 표시"하는 주체와 시점은 원문에 명시 없음.[](source:sp-prepush)
