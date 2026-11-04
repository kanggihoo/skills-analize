# dsh-ci-test-reliability 스킬은 에이전트를 어떻게 바꾸나 {#dsh-ci-test-reliability-skill}

`dsh-ci-test-reliability`가 켜지면 에이전트는 테스트를, 조용한 워크스테이션에서 혼자 돌 때만이 아니라 실제 CI 구조에서도 맞도록 설계·리뷰·진단한다. 이 스킬이 맡는 일은 격리와 신뢰성 판단이다. 테스트 계층 정책을 대신하지 않고, push 전에 돌릴 명령도 고르지 않는다.[](source:skill-intro)

- 에이전트는 테스트가 같은 파일, 다른 파일, 한 job 안의 독립 프로세스, 호스트를 나눠 쓰는 다른 job까지 겹칠 수 있다고 가정한다. 테스트가 얻은 자원마다 소유자와 원자적 할당, 준비 신호, 정리, 완료 신호를 정한다.[](source:skill-layers)[](source:skill-owner)
- 에이전트는 시간 초과 늘리기, 재시도 붙이기, 전부 직렬로 돌리기를 근본 원인 수정으로 내놓지 않는다.[](source:skill-reject)
- 에이전트는 고정된 sleep 대신 준비 신호와 상태 전이를 기다리고, 정리는 완료 신호가 올 때까지 기다려 끝낸다.[](source:skill-sync)[](source:skill-dispose)
- 이미 flaky한 CI 실패는 증거 고정, 분류, 가장 작은 구조에서 재현의 순서로 진단한다. 진단만 요청받으면 읽기 전용이다.[](source:skill-diag)[](source:ref-scope)

@answer scope="deepseek-harness/dsh-ci-test-reliability · 원본 텍스트 파일 2개 · 커밋 475505c · 실행하지 않음"
@meta locale=ko
@source skill-fm title="deepseek-harness/dsh-ci-test-reliability/SKILL.md · 9442B · frontmatter" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=1:4
@source skill-intro title="SKILL.md · 목적과 범위" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=8:8
@source skill-read title="SKILL.md · 먼저 읽을 규칙" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=12:16
@source skill-layers title="SKILL.md · 겹칠 수 있는 네 층" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=20:25
@source skill-owner title="SKILL.md · 자원 소유 속성과 직렬화 금지" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=27:29
@source skill-alloc title="SKILL.md · 원자적 할당" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=33:41
@source skill-global title="SKILL.md · 프로세스 전역 상태" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=45:54
@source skill-platform title="SKILL.md · 플랫폼 소유 의미론" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=58:65
@source skill-budget title="SKILL.md · 시간 제한 예산" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=69:73
@source skill-sync title="SKILL.md · 상태에 동기화" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=77:83
@source skill-dispose title="SKILL.md · 정지 상태까지 정리" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=87:89
@source skill-prove title="SKILL.md · 의도한 회귀 증명" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=93:100
@source skill-reject title="SKILL.md · 플레이크 가림 수정 거부" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=104:116
@source skill-diag title="SKILL.md · 기존 플레이크 진단" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=120:120
@source skill-report title="SKILL.md · 검증과 보고" path=deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=124:131
@source ref-scope title="references/ci-flake-diagnosis.md · 5346B · 진단 범위" path=deepseek-harness/dsh-ci-test-reliability/references/ci-flake-diagnosis.md lines=3:3
@source ref-freeze title="ci-flake-diagnosis.md · 증거 고정" path=deepseek-harness/dsh-ci-test-reliability/references/ci-flake-diagnosis.md lines=7:11
@source ref-classes title="ci-flake-diagnosis.md · 분류" path=deepseek-harness/dsh-ci-test-reliability/references/ci-flake-diagnosis.md lines=15:26
@source ref-repro title="ci-flake-diagnosis.md · 재현" path=deepseek-harness/dsh-ci-test-reliability/references/ci-flake-diagnosis.md lines=30:42
@source ref-fix title="ci-flake-diagnosis.md · 소유자에서 수정" path=deepseek-harness/dsh-ci-test-reliability/references/ci-flake-diagnosis.md lines=46:48
@source ref-close title="ci-flake-diagnosis.md · 종료 조건" path=deepseek-harness/dsh-ci-test-reliability/references/ci-flake-diagnosis.md lines=52:60
@source dup-copy title="verification-skills/deepseek-harness/dsh-ci-test-reliability/SKILL.md · 동명 사본 · diff 비교만" path=verification-skills/deepseek-harness/dsh-ci-test-reliability/SKILL.md lines=13:13

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`description`은 모델이 스킬을 켤지 판단할 때 읽는 설명이다. 켜는 경우는 세 가지로 적혀 있다.

- 동시성, 공유 호스트 자원, 시계, 프로세스 전역 상태, 서브프로세스, 네트워크 리스너, 비동기 정리 때문에 비결정적으로 실패할 수 있는 테스트나 픽스처를 추가하거나 바꿀 때다.[](source:skill-fm)
- flaky한 CI를 조사할 때다.[](source:skill-fm)
- 테스트 격리를 리뷰할 때다.[](source:skill-fm)

이 스킬은 어떤 명령을 돌릴지 고르지 않는다. `description`이 push 전 명령 선택은 `dsh-pre-push-checks`로 따로 하라고 적는다.[](source:skill-fm) 이 스킬은 격리와 신뢰성 판단을 맡을 뿐 저장소의 테스트 계층 정책을 대체하지 않는다.[](source:skill-intro) 호출 제한 필드는 원문에 명시 없음.

## 테스트를 쓸 때 무엇을 강제하나 {#rules}

에이전트는 먼저 소유 규칙을 읽는다. 읽을 것은 테스트 정책, 방어 패턴 문서, 활성 Vitest 설정과 GitHub 워크플로(워커·job 구조가 테스트에 영향을 줄 때), 기록된 세션 시나리오라면 스냅샷 지침이다.[](source:skill-read) 이 문서들은 원래 deepseek-harness 저장소의 `docs/`와 `snapshots/`에 있어 이 저장소에는 없다. 범위 밖이다.

@facts id=layers
| 1층 | 한 Vitest 파일 안의 테스트들[](source:skill-layers) |
| 2층 | 서로 다른 Vitest 파일이나 워커 프로세스[](source:skill-layers) |
| 3층 | 한 job 안의 독립된 Vitest·저장소 통과 조건 프로세스[](source:skill-layers) |
| 4층 | runner가 한 호스트를 나눠 쓰는 서로 다른 Actions job[](source:skill-layers) |

활성 설정이 반증하지 않는 한 이 네 층이 겹칠 수 있다고 가정한다. 프로세스를 나눠도 호스트 포트, 예측 가능한 경로, 외부 서비스, DB, 소켓, 상속된 자식 프로세스는 격리되지 않는다.[](source:skill-owner)

| 영역 | 규칙 | 강도 |
| --- | --- | --- |
| 자원 소유 | 얻은 자원마다 소유자, 원자적 할당 방식, 눈으로 볼 수 있는 준비 신호, 등록된 정리, 완료 신호를 가려낸다[](source:skill-owner) | 의무 |
| 직렬화 | 픽스처 하나가 격리되지 않았다는 이유로 스위트 전체를 직렬로 돌리지 않는다. 독점 범위를 좁히거나 자원 할당을 바꾼다. Vitest의 순차 블록은 다른 파일·프로세스·job·runner로부터 호스트 자원을 지켜 주지 못한다[](source:skill-owner) | 금지 |
| 네트워크 | 루프백에 `listen(0)`으로 묶고, 서버가 listening이라고 알린 뒤에만 배정된 주소를 읽는다. 빈 포트를 찾아 두었다가 나중에 묶지 않는다[](source:skill-alloc) | 의무, 금지 |
| 파일 경로 | 테스트마다 `mkdtemp`로 전용 임시 루트를 만든다. 예측 가능한 공유 경로를 얻지 않는다. 경로가 없어야 하면 배타적 생성을 쓴다[](source:skill-alloc) | 의무, 금지 |
| 공유 DB·소켓·세션·출력 위치 | 테스트마다 고유한 이름 공간을 준다[](source:skill-alloc) | 의무 |
| 기록된 값과 전송 주소 | 안정된 기록 식별자와 임시 전송 주소를 분리하고, 변환은 픽스처 안에서 한다. 살아 있는 자원에 기록된 값을 쓰도록 강요하지 않는다[](source:skill-alloc) | 의무 |
| 파서 입력·기대값인 리터럴 | 파서 입력이나 기대값인 리터럴은 얻은 자원이 아니다. 고정돼 보인다는 이유만으로 고치지 않는다[](source:skill-alloc) | 금지 |
| 전역 상태 | `process.env`, `cwd`, 가짜 타이머, 로캘·시간대, 모듈 mock, 레지스트리, 콘솔 훅, `globalThis`, 전역 `fetch` 가로채기는 독점 가변 자원으로 다룬다. 주입된 의존성이나 인스턴스 로컬 어댑터를 먼저 쓴다[](source:skill-global) | 권고(우선), 의무 |
| 변경이 불가피할 때 | 원래 값이 없었는지 있었는지 기록한다. 그 상태 그대로 복원한다. 복원을 즉시 등록한다. 가장 작은 변경 범위에 `try/finally`를 쓴다. 로컬 `finally` 앞에서 실패할 수 있으면 `afterEach` 대체 복원을 둔다. 픽스처가 소유한 가장 좁은 요청이나 호출만 가로챈다[](source:skill-global) | 의무 |
| 플랫폼 | CI는 Windows와 POSIX 호스트에서 같은 스위트를 돌린다. 운영체제가 소유한 값은 쓴 그대로 돌아오지 않을 수 있다. 가능하면 모든 플랫폼에서 성립하는 관찰을 쓰고, 정말 안 되는 케이스만 그 플랫폼에서 명시로 제외한다[](source:skill-platform) | 의무 |
| 시간 제한 예산 | `describe`나 케이스의 시간 제한은 runner의 `--testTimeout`보다 우선한다. 그래서 레인의 예산보다 낮은 값은 CI가 이미 준 시간을 깎는다. 프로세스 생성에 묶인 스위트는 레인 예산을 쓰고, 더 빡빡한 값에는 그 이유를 붙인다. 훅 예산도 테스트 예산과 함께 올린다[](source:skill-budget) | 의무 |
| 시간 제한이 대상일 때 | 검증하려는 시간 제한보다 바깥 대기를 훨씬 크게 둔다. 20 ms 마감이 울리는지 증명하는 케이스가 하네스 자체 대기와 겨루면, 부하가 어느 마감이 먼저 보고될지 정한다[](source:skill-budget) | 의무 |
| 동기화 | 고정 `sleep`은 준비나 정리가 끝났다는 근거가 아니다. 준비 이벤트, 핸드셰이크, 상태 전이, 소유한 promise, 밖에서 관찰되는 조건을 기다린다. 경쟁 상태는 지연 promise나 배리어로 정해진 지점에 놓는다. 시간 제한은 대기의 상한으로만 쓰고 단언을 옳게 만드는 조건으로 쓰지 않는다[](source:skill-sync) | 의무, 금지 |
| 스케줄러 순서 | 그 순서가 제품 동작이 아니라면 스케줄러에 달린 순서를 단언하지 않는다. 시간 자체가 대상이면 시계를 주입하거나 가짜로 만들고 실제 타이머를 반드시 복원한다[](source:skill-sync) | 금지, 의무 |
| 정리 | 자원을 얻은 직후 정리를 등록해 단언이 실패해도 풀리게 한다. 새 콜백·요청을 멈추고, 리스너를 떼고, 전역 훅을 복원하고, 소유한 작업을 끝내고, 자식 종료·서버 닫힘·워커 종료 같은 완료 신호를 기다린다. 신호를 기다리지 않는 `abort()`·`close()`·`kill()`은 불완전한 정리다[](source:skill-dispose) | 의무 |

플랫폼 규칙의 구체 사례는 네 가지다.[](source:skill-platform)

- 값을 되돌려 쓰는 동작은, 단언이 되돌려 쓰기 실패를 견딜 때만 안전하다. `mtime`을 되돌려 놓고 지문이 어쨌든 무효가 되는지 증명하는 단언은 어디서나 성립한다. 기록이 유효하게 남는지 증명하려는 경우에는, NTFS의 100나노초 틱이 밀리초 아래 값을 손실 없이 왕복시키지 못한다. 단언이 복원에 의존하면, 기억해 둔 값 대신 새로 읽은 값을 기대값으로 쓴다.
- Windows는 환경 변수 이름의 대소문자를 구분하지 않는다. `http_proxy`와 `HTTP_PROXY`를 따로 심어도 항목이 하나가 된다.
- Windows는 파일 핸들을 비동기로 푼다. POSIX에서 즉시 끝나는 이름 변경·삭제에는 관측된 경합 크기에 맞춘 제한된 재시도가 필요하다.
- Windows에는 POSIX 권한·시그널 의미가 없다. 그에 기대는 케이스는 이유를 적은 명시 플랫폼 제외를 쓰고, 단언을 모든 곳에서 약하게 만들지 않는다.

## 회귀를 어떻게 증명하고 무엇을 거부하나 {#prove}

회귀 증명 규칙은 아래와 같다.[](source:skill-prove)

- 일반 회귀는 가능하면 수정 전에 테스트가 실패하는 것을 본다.
- 새 정적·말뭉치 가드는 거부돼야 할 사례를 잠깐 넣어서, 가드가 의도한 대로 실패하는지 본다.
- 경쟁 상태는 배리어로 겹침을 증명한다. 반복 실행만으로는 경쟁 테스트가 아니다.
- 포트·소켓·공유 경로·서브프로세스 같은 호스트 자원은 교차 프로세스 격리가 수정의 일부일 때 독립된 테스트 프로세스를 동시에 돌린다.
- 픽스처가 자체 마감으로 자식을 띄우면, 종료 상태를 단언하기 전에 시그널이나 시간 초과가 자식을 끝내지 않았음을 먼저 단언한다.
- 컴포넌트의 자기 보고를 믿지 않고 외부 상태, 이벤트, 파일, 로그, 종료, 정리를 직접 확인한다.
- 반복 부하 실행은 결정적 회귀를 보충할 뿐 대체하지 못한다.[](source:skill-prove)

@callout level=warning title="결정적 로컬 테스트의 근본 원인 수정으로 내놓지 않는 것"
근본 원인 수정으로 내놓지 않는 대상은 다음과 같다. 기다리는 상태를 짚지 않고 시간 제한 늘리기, 재시도 붙이기, 모든 파일 직렬화, 오류나 처리되지 않은 rejection 삼키기, 단언 약화, 불안정한 동작을 정규화해 지우기, 정리나 단언 앞에 sleep 넣기다.[](source:skill-reject)

예외가 둘 있다. 첫째, 문서화된 일시적 외부 provider 테스트는 실제 API 정책 아래에서 재시도가 유효하며, 이 예외는 외부 경계에 둔다.[](source:skill-reject) 둘째, 예산 복원은 가림이 아니다. 시간 제한을 이미 있던 레인 예산으로 올리거나, runner에서 실제로 잰 경합에 맞춰 제한된 재시도의 크기를 정하는 것은, 기다리는 작업을 짚고 CI가 준 것을 돌려놓는 일이라고 원문이 구분한다.[](source:skill-reject)

보고할 때는 가장 작은 집중 회귀를 돌린다. 여기에 변경 종류별 근거를 더한다. 전역 변경에는 복원 근거, 생명주기·서브프로세스에는 quiescent teardown(모든 작업이 멈춘 뒤의 정리) 근거, 포트·소켓·공유 경로에는 독립 프로세스 동시 실행 근거, 새 가드에는 음성 대조(negative control)를 더한다. 정확한 명령과 관측 결과를 적고, 재시도·건너뛴 테스트·대기 중인 CI를 통과라고 하지 않는다.[](source:skill-report)

판정: 이 스킬은 "통과했다"는 결과보다 "왜 통과하는가"를 요구한다. 스킬이 외부 상태를 직접 확인하게 하고, 반복 실행을 증거로 인정하지 않고, 가림용 수정을 목록으로 막기 때문이다.[](source:skill-prove)[](source:skill-reject)

## 이미 flaky한 CI 실패는 어떻게 진단하나 {#diagnosis}

에이전트는 `references/ci-flake-diagnosis.md`를 이미 존재하는 확률적 테스트·CI 실패를 조사할 때만 쓴다. 진단을 한다고 해서 수정·워크플로 재실행·CI 설정 변경이 허가되는 것은 아니다. 진단만 요청받았으면 원인과 증거만 보고한다.[](source:ref-scope)[](source:skill-diag)

@workflow id=diagnosis-flow title="CI 플레이크 진단"
| freeze | 증거 고정 | backend |
| classify | 원인 분류 | backend |
| repro | 작은 구조에서 재현 | backend |
| auth | 수정 허가? | backend |
| fix | 소유자에서 수정 | security |
| close | 종료 확인 | backend |
| report | 원인·증거 보고 | backend |
| freeze > classify | |
| classify > repro | |
| repro > auth | |
| auth > fix | 예 | emphasis |
| auth > report | 아니오 | |
| fix > close | |
| close > report | |

@steps id=diagnosis-steps
| d-freeze | 증거 고정 | 에이전트는 저장소, 워크플로, job, commit SHA, runner 레이블, 시각, 정확한 실패 테스트나 명령, 처음 안정적으로 나온 실패 서명을 기록한다. 인프라 메시지는 테스트 출력과 분리한다. 실패한 실행과 통과한 실행을 여러 개 비교하고 가능하면 같은 SHA끼리 본다. 재실행 한 번이 통과해도 인프라 결함이 증명되지 않고, 시간 초과 한 번이 났어도 제품 경쟁 상태가 증명되지 않는다.[](source:ref-freeze) | diagnosis-flow | freeze |
| d-classify | 원인 분류 | 최종 수정이 아니라 기록된 증거를 보고 분류한다. 아래 표의 여덟 갈래 중 하나로 정한다. 독립된 사실이 여럿이면 각각 보고한다. 시간 초과·시그널·종료 코드·단언을 하나의 추정 결과로 뭉뚱그리지 않는다.[](source:ref-classes) | diagnosis-flow | classify |
| d-repro | 작은 구조에서 재현 | 소유 테스트 파일이나 집중한 테스트 이름에서 시작해, 서명이 재현되는 첫 구조에 이를 때까지만 동시성을 높인다. 순서는 한 프로세스, 동시 테스트·파일, 독립된 Vitest 프로세스 여럿, 구성된 워커 수의 저장소 통과 조건, 같은 호스트 자원을 나눠 쓰는 별개 job 또는 runner 프로세스다.[](source:ref-repro) | diagnosis-flow | repro |
| d-auth | 수정 허가? | 구현이 허가된 경우에만 고친다. 진단만 요청받았다면 원인과 증거를 보고하고 끝낸다.[](source:ref-scope)[](source:skill-diag) | diagnosis-flow | auth |
| d-fix | 소유자에서 수정 | 자원을 할당하고, 준비 신호를 내고, 전역 상태를 바꾸고, 정리를 소유한 컴포넌트를 고친다. 스냅샷 정규화기, 재시도 래퍼, 넓은 시간 제한, 전역 직렬화 설정, 약한 단언에 실패를 숨기지 않는다.[](source:ref-fix) | diagnosis-flow | fix |
| d-close | 종료 확인 | 원래 서명의 분류가 근거로 뒷받침되고, 가장 작은 관련 구조가 재현하거나 외부 증거가 충분하며 재현 한계를 밝혔을 때 증거가 완결이다.[](source:ref-close) | diagnosis-flow | close |
| d-report | 원인·증거 보고 | 남은 Actions 체크는 관측한 상태대로 통과·대기·건너뜀·실패로 보고한다. 우연히 통과할 때까지 돌리고 안정적이라 부르지 않는다. 선택한 증거가 결론을 세우면 멈추거나, 분류를 막는 빠진 사실을 보고한다.[](source:ref-close) | diagnosis-flow | report |

@facts id=diagnosis-numbers
| 원인 분류 갈래 | 8가지[](source:ref-classes) |
| 재현 단계 | 5단계. 가능한 가장 낮은 단계부터 올린다[](source:ref-repro) |
| 종료 증거 항목 | 5가지[](source:ref-close) |

| 분류 | 판단 기준(기록된 증거에서) |
| --- | --- |
| 호스트 자원 충돌 | 같은 포트·소켓·DB·예측 가능한 경로·캐시·외부 이름 공간을 독립된 프로세스나 job이 얻는다[](source:ref-classes) |
| 불완전한 생명주기 | 자식·워커·스트림·서버·콜백이 완전히 멈추기 전에 정리가 반환되고, 나중 출력이나 변경이 다른 테스트에 나타난다[](source:ref-classes) |
| 프로세스 전역 오염 | 결과가 테스트 순서나 샌 `process.env`·`cwd`·가짜 타이머·전역·mock·로캘·모듈 상태에 달려 있다[](source:ref-classes) |
| 부하에 민감한 동기화 | sleep, 폴링 간격, 가정한 이벤트 루프 턴이 관찰 가능한 준비·완료를 대신한다[](source:ref-classes) |
| 플랫폼·진입 경로 불일치 | 실패가 운영체제·셸·파일시스템 규칙·소스/빌드 모드·실행 진입점을 일관되게 따른다. 타임스탬프 정밀도, 환경 변수 이름 대소문자, 핸들 해제 시점, 권한 의미가 Windows와 POSIX에서 다르므로 macOS에서 통과한 케이스는 Windows 레인에 대해 아무것도 말해 주지 않는다[](source:ref-classes) |
| 제품 동시성 결함 | 테스트가 자원을 통제하고, 명시적 겹침으로 결정적으로 재현되며, 출시된 동작의 경쟁 상태를 드러낸다[](source:ref-classes) |
| 외부 provider 일시 실패 | 실패가 실제 API·네트워크 경계 소유이고 문서화된 재시도 정책에 들어맞는다[](source:ref-classes) |
| runner 인프라 | 체크아웃·의존성 내려받기·디스크·호스트 프로세스·runner 서비스가 테스트 명령과 무관하게 실패한다. 이 갈래는 runner에서 직접 얻은 증거를 요구한다. 자체 호스팅 풀이 호스트 지표를 주지 않으면 지표가 없다고 밝히고, 한 풀에서 서로 무관한 branch에 같은 서명이 반복되면 호스트를 검사하지 못해도 공유 호스트 경합의 증거로 본다[](source:ref-classes) |

재현에는 세 가지 규칙이 따른다.[](source:ref-repro)

- 활성 Vitest 설정, 환경 노브, 소스/빌드 모드, 플랫폼을 맞춘다. 운영 시간 제한을 낮추거나 다른 실패를 만들려고 무작위 부하를 넣지 않는다.
- 서명이 속한 플랫폼을 가진 호스트가 돌릴 수 없으면, 단계를 올리는 순서는 닿는 마지막 단계에서 멈춘다. 그 한계를 적고, 다른 플랫폼의 통과 실행으로 대신하지 않는다. CI를 재현 수단으로 쓰되, 실행마다 의심 소유자를 하나만 바꿔서 결과를 그 소유자에게 귀속시킨다.
- 경쟁 상태가 의심되면 확률적 타이밍을 다툼이 일어나는 전이의 배리어로 바꾼다. 호스트 충돌이 의심되면 같은 식별자의 동시 획득이나 원자적 고유 할당이 충돌을 없앤다는 것을 증명한다.

## 흐름 속 위치 {#position}

@workflow id=ci-test-position title="ci-test-reliability 앞뒤의 스킬"
| cr | dsh-code-review | backend |
| sp | dsh-speed-up-perf | backend |
| me | dsh-ci-test-reliability | backend |
| pp | dsh-pre-push-checks | backend |
| cr > me | 해당 테스트일 때 | |
| sp > me | 프로세스·시계·비동기 정리 | |
| me > pp | 설계가 탄탄해진 뒤 | emphasis |

| 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- |
| `dsh-code-review`의 리뷰 대상 테스트 | 리뷰 지적 | 자원을 소유하거나 비동기이거나 플랫폼에 민감하거나 flaky test(실행마다 결과가 달라지는 테스트)일 때만 적용한다 | r02 |
| `dsh-speed-up-perf`의 프로세스·시계·브라우저 테스트·비동기 정리 | - | 해당 요소가 있을 때 이 스킬을 쓴다 | r39 |
| 설계가 정리된 바뀐 테스트 | push 전 검증 명령 선택 | 테스트 설계가 탄탄해진 뒤 `dsh-pre-push-checks`로 따로 한다. 재시도·건너뛴 테스트·대기 중인 CI를 통과라고 하지 않는다 | r20 |
| `dsh-pre-push-checks`의 호출 | 필요한 근거 종류(복원, 음성 대조, quiescent teardown, 동시 프로세스) | 나가는 변경이 자원 소유·비동기 테스트, 픽스처, 헬퍼, CI 실행 경로를 바꿀 때. 이 방향은 위 그림에서 생략했다. 명령 선택은 `dsh-pre-push-checks`가 계속 맡는다 | r21 |

전체 흐름은 `deepseek-harness/_group-ship/ship.html`에 있고, 리뷰 쪽 위치는 `deepseek-harness/_group-review/review.html`에 있다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md`, `references/ci-flake-diagnosis.md`. 둘 다 원본이다.
- 제외한 파일: 없다. 이 폴더에 번역본은 없다.
- 원문 비교: `verification-skills/deepseek-harness/dsh-ci-test-reliability`에 이름이 같은 사본이 있다(원장 기준 동명·내용 다름). `diff`로 확인하니 `SKILL.md`는 한 줄만 다르다. 사본은 방어 패턴 링크가 `docs/defensive-patterns.md`이고 이쪽은 `docs/defensive-patterns/general.md`다. `references/ci-flake-diagnosis.md`는 두 폴더가 같다. 이 페이지는 `deepseek-harness/` 쪽 원문만 분석한다.[](source:skill-read)[](source:dup-copy)
- 실행하지 않았다. 원문의 명령은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
원문이 링크한 `docs/testing.md`, `docs/defensive-patterns/general.md`, `snapshots/AGENTS.md`는 원래 deepseek-harness 저장소의 파일이라 이 저장소에 없다. 범위 밖이므로 "테스트 계층 정책"이 구체적으로 무엇을 요구하는지는 알 수 없다. 레인의 `--testTimeout` 값, 실제 Vitest 설정, GitHub 워크플로의 워커 수는 원문에 명시 없음. 이 스킬의 규칙이 모든 테스트에 적용되는지, 원문이 말하는 위험이 있는 테스트에만 적용되는지는 `description`의 "with those risks"를 따라 후자로 읽었다(판정).
