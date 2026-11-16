# security-audit 스킬은 에이전트의 보안 점검을 어떻게 바꾸나 {#security-audit-skill}

`security-audit`은 코드베이스에서 실제 신뢰 경계를 넘는 취약점만 골라, 소스 근거와 안전한 재현 방법, 우선순위, 가장 작은 수정안을 소유자에게 보고하도록 에이전트를 이끄는 보안 감사 스킬이다.[](source:skm-purpose)

- 보안 질문이나 집중 리뷰에는 안내 모드로 답하고, 코드베이스 audit·pen-test, 전체·종합·end-to-end 리뷰, 보고서 산출물을 요청받았을 때만 6단계 전체 감사 모드로 켜진다. 어느 쪽인지 모호하면 파일을 만들기 전에 질문을 하나 한다.[](source:skm-modes)
- 전체 감사 모드의 에이전트는 출력 폴더에 `findings.json`, `coverage-ledger.json`, `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md` 같은 파일을 쓴다. 안내 모드는 파일을 쓰지 않는다.[](source:skm-isolation)[](source:val-p6)[](source:skm-modes)
- 에이전트는 대상 소스를 고치지 않고, 배포된 endpoint와 공유 서비스에 접속하지 않으며, OS 샌드박스 통제를 모두 걸 수 없으면 대상 코드를 실행하지 않는다.[](source:skm-safety)[](source:skm-fix)
- 후보는 확정이 아니다. 그 후보를 사냥하지 않은 verifier가 다시 확인해야 `confirmed`가 되고, 심각도는 `confirmed`에만 붙는다.[](source:skm-priority)[](source:val-decide)

@answer scope="cloudflare/security-audit · 파일 20개 · 지시상 동작"
@meta locale=ko
@source skm-fm title="frontmatter" path=cloudflare/security-audit/SKILL.md lines=1:4
@source skm-purpose title="목적 정의" path=cloudflare/security-audit/SKILL.md lines=6:8
@source skm-modes title="운영 모드 선택" path=cloudflare/security-audit/SKILL.md lines=10:17
@source skm-terms title="agent 역할 용어" path=cloudflare/security-audit/SKILL.md lines=19:29
@source skm-safety title="실행 안전 규칙" path=cloudflare/security-audit/SKILL.md lines=31:42
@source skm-setup title="전체 감사 설정값" path=cloudflare/security-audit/SKILL.md lines=44:52
@source skm-isolation title="쓰기 격리" path=cloudflare/security-audit/SKILL.md lines=54:66
@source skm-promote title="산출물 승격 절차" path=cloudflare/security-audit/SKILL.md lines=68:82
@source skm-repro title="재현 기록과 run-metadata" path=cloudflare/security-audit/SKILL.md lines=84:86
@source skm-prior title="이전 실행 활용" path=cloudflare/security-audit/SKILL.md lines=88:105
@source skm-profiles title="프로필과 범위" path=cloudflare/security-audit/SKILL.md lines=107:117
@source skm-budget title="비용 예산" path=cloudflare/security-audit/SKILL.md lines=119:134
@source skm-boundary title="경계와 결과 요구" path=cloudflare/security-audit/SKILL.md lines=138:140
@source skm-local title="제한된 로컬 근거" path=cloudflare/security-audit/SKILL.md lines=142:144
@source skm-visibility title="소스 가시성" path=cloudflare/security-audit/SKILL.md lines=146:148
@source skm-priority title="심각도와 확실성 분리" path=cloudflare/security-audit/SKILL.md lines=150:162
@source skm-fix title="최소 수정 권고" path=cloudflare/security-audit/SKILL.md lines=164:166
@source skm-workflow title="6단계와 종료 상태" path=cloudflare/security-audit/SKILL.md lines=168:179
@source skm-anti title="안티패턴" path=cloudflare/security-audit/SKILL.md lines=181:192
@source rec-gate title="정찰 시작 조건" path=cloudflare/security-audit/RECONNAISSANCE.md lines=3:7
@source rec-agents title="정찰 agent 네 개" path=cloudflare/security-audit/RECONNAISSANCE.md lines=9:57
@source rec-prior title="이전 실행 입력" path=cloudflare/security-audit/RECONNAISSANCE.md lines=59:71
@source rec-arch title="architecture.md와 companion 선택" path=cloudflare/security-audit/RECONNAISSANCE.md lines=73:88
@source rec-ledger title="ledger와 coverage_id" path=cloudflare/security-audit/RECONNAISSANCE.md lines=90:102
@source rec-unit title="ledger 단위 필드" path=cloudflare/security-audit/RECONNAISSANCE.md lines=104:139
@source rec-state title="상태 표와 검증기 실행" path=cloudflare/security-audit/RECONNAISSANCE.md lines=141:156
@source hun-assign title="hunter 배정" path=cloudflare/security-audit/HUNTING.md lines=3:9
@source hun-prompt title="hunter 지시문 구성" path=cloudflare/security-audit/HUNTING.md lines=11:25
@source hun-method title="핵심 사냥 방법" path=cloudflare/security-audit/HUNTING.md lines=27:97
@source hun-promote title="승격 절차 블록" path=cloudflare/security-audit/HUNTING.md lines=99:136
@source hun-gate title="후보 통과 조건" path=cloudflare/security-audit/HUNTING.md lines=138:157
@source hun-local title="로컬 검증 경계" path=cloudflare/security-audit/HUNTING.md lines=159:166
@source hun-result title="hunter 결과 형식" path=cloudflare/security-audit/HUNTING.md lines=168:213
@source hun-consol title="ledger 갱신과 후보 통합" path=cloudflare/security-audit/HUNTING.md lines=215:219
@source hun-critic title="coverage critic 출력" path=cloudflare/security-audit/HUNTING.md lines=221:245
@source hun-loop title="critic 반복과 프로필·예산 한계" path=cloudflare/security-audit/HUNTING.md lines=247:251
@source val-p3 title="Phase 3 검증 배정" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=3:7
@source val-prompt title="verifier 지시문" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=9:46
@source val-promote title="승격 절차 블록" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=48:85
@source val-decide title="판정 승격·강등·기각" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=87:93
@source val-p4 title="findings.json 작성" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=95:118
@source val-p5 title="최종 기록 검증" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=120:149
@source val-p6 title="보고서 세 개" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=151:186
@source atk-intro title="attack class 사용 원칙" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=3:7
@source atk-route title="companion 파일 연결" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=9:27
@source atk-core title="일반 attack class 일곱 개" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=29:90
@source atk-wild title="Wildcard class" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=92:109
@source atk-obvious title="Obvious things class" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=111:130
@source ai-core title="AI·LLM 사용 조건과 핵심 원칙" path=cloudflare/security-audit/AI-AND-LLM.md lines=3:18
@source ai-val title="AI·LLM 검증 규칙" path=cloudflare/security-audit/AI-AND-LLM.md lines=76:83
@source cs-core title="클라이언트 사용 조건과 핵심 원칙" path=cloudflare/security-audit/CLIENT-SIDE.md lines=3:17
@source cs-val title="클라이언트 검증 규칙" path=cloudflare/security-audit/CLIENT-SIDE.md lines=77:83
@source cd-core title="cloud 사용 조건과 핵심 원칙" path=cloudflare/security-audit/CLOUD-AND-DEPLOYMENT.md lines=3:17
@source cd-val title="cloud 검증 규칙" path=cloudflare/security-audit/CLOUD-AND-DEPLOYMENT.md lines=80:86
@source di-core title="데이터 격리 사용 조건과 핵심 원칙" path=cloudflare/security-audit/DATA-ISOLATION-AND-LIFECYCLE.md lines=3:17
@source di-val title="데이터 격리 검증 규칙" path=cloudflare/security-audit/DATA-ISOLATION-AND-LIFECYCLE.md lines=78:84
@source dm-core title="데스크톱·모바일 사용 조건과 핵심 원칙" path=cloudflare/security-audit/DESKTOP-MOBILE-AND-LOCAL-IPC.md lines=3:17
@source dm-val title="데스크톱·모바일 검증 규칙" path=cloudflare/security-audit/DESKTOP-MOBILE-AND-LOCAL-IPC.md lines=83:89
@source ms-core title="메모리 안전 사용 조건과 핵심 원칙" path=cloudflare/security-audit/MEMORY-SAFETY-AND-BINARY.md lines=3:17
@source ms-val title="메모리 안전 검증 규칙" path=cloudflare/security-audit/MEMORY-SAFETY-AND-BINARY.md lines=95:101
@source pr-core title="프로토콜 사용 조건과 핵심 원칙" path=cloudflare/security-audit/PROTOCOLS-RPC-AND-MESSAGING.md lines=3:17
@source pr-val title="프로토콜 검증 규칙" path=cloudflare/security-audit/PROTOCOLS-RPC-AND-MESSAGING.md lines=75:81
@source re-core title="자원 고갈 사용 조건과 핵심 원칙" path=cloudflare/security-audit/RESOURCE-EXHAUSTION-AND-AVAILABILITY.md lines=3:17
@source re-val title="자원 고갈 검증 규칙" path=cloudflare/security-audit/RESOURCE-EXHAUSTION-AND-AVAILABILITY.md lines=72:78
@source sc-core title="공급망 사용 조건과 핵심 원칙" path=cloudflare/security-audit/SUPPLY-CHAIN-AND-RELEASE.md lines=3:17
@source sc-val title="공급망 검증 규칙" path=cloudflare/security-audit/SUPPLY-CHAIN-AND-RELEASE.md lines=67:73
@source wp-core title="HTTP·인증 사용 조건과 핵심 원칙" path=cloudflare/security-audit/WEB-PROTOCOL-AND-AUTH.md lines=3:17
@source wp-val title="HTTP·인증 검증 규칙" path=cloudflare/security-audit/WEB-PROTOCOL-AND-AUTH.md lines=98:105
@source sch-conf title="confirmed 분기" path=cloudflare/security-audit/report-schema.json lines=7:245
@source sch-nv title="needs_validation 분기" path=cloudflare/security-audit/report-schema.json lines=247:362
@source sch-rej title="rejected 분기" path=cloudflare/security-audit/report-schema.json lines=364:458
@source vf-limits title="입력 상한" path=cloudflare/security-audit/validate-findings.cjs lines=42:49
@source vf-read title="입력 파일 읽기" path=cloudflare/security-audit/validate-findings.cjs lines=604:649
@source vf-semantic title="의미 검사" path=cloudflare/security-audit/validate-findings.cjs lines=485:583
@source vf-run title="실행 진입점" path=cloudflare/security-audit/validate-findings.cjs lines=703:757
@source vft-branches title="분기 시험" path=cloudflare/security-audit/validate-findings.test.cjs lines=151:162
@source vft-align title="검증기 간 정렬 시험" path=cloudflare/security-audit/validate-findings.test.cjs lines=574:652
@source vl-limits title="입력 상한" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=13:21
@source vl-fields title="필수 필드와 상태 값" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=26:81
@source vl-id title="coverage_id 계산" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=354:375
@source vl-checks title="검사 기록 검증" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=421:451
@source vl-state title="상태별 불변식" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=518:566
@source vl-attempts title="재배정 기록 검증" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=568:644
@source vl-doc title="문서 단위 검사" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=761:806
@source vl-run title="실행 진입점" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=808:853
@source vlt-state title="상태 시험" path=cloudflare/security-audit/validate-coverage-ledger.test.cjs lines=330:405
@source vlt-reassign title="재배정 시험" path=cloudflare/security-audit/validate-coverage-ledger.test.cjs lines=407:491

## 요청이 오면 에이전트는 어떻게 움직이나 {#behavior-entry span=12}

스킬을 불러온 것만으로는 전체 감사가 허락되지 않는다. 에이전트는 요청을 읽어 안내 모드와 전체 감사 모드 중 하나를 고르고, 전체 감사라면 정찰 전에 여러 값을 정한다.[](source:skm-modes)

아래 frontmatter가 스킬의 호출 관련 선언 전부다. `description`은 모델이 켤지 판단할 때 참고하는 설명이고 문구가 일치해야 켜지는 사전이 아니다. `disable-model-invocation` 같은 호출 제한 필드는 frontmatter에 없고, 호출을 제한하는지는 원문에 명시 없음.[](source:skm-fm)

@code source=skm-fm language=yaml

@workflow id=entry-flow title="요청 도착부터 정찰 전까지"
| req | 보안 요청이 온다 | external |
| mode | 전체 감사 요청인가? | backend |
| ask | 한 가지만 질문 | external |
| guide | 안내 모드로 답한다 | backend |
| setup | 전체 감사 값 정하기 | backend |
| profile | 프로필과 범위 정하기 | backend |
| budget | 예산이 최소를 감당하나? | backend |
| halt | 에이전트 없이 중단 | security |
| start | 정찰로 넘어간다 | backend |
| req > mode | |
| mode > guide | 질문·부분 검토 |
| mode > ask | 모호함 |
| ask > mode | 답변 후 |
| mode > setup | 전체 감사 | emphasis |
| setup > profile | | emphasis |
| profile > budget | | emphasis |
| budget > halt | 부족 |
| budget > start | 충분 | emphasis |

이 그림은 핵심 경로만 그렸다. 안내 모드에서 focused agent를 띄우는 선택과, 안내 모드에도 똑같이 적용되는 실행 안전 규칙은 `안내 모드로 답한다` 설명과 `무엇을 강제하고 언제 쓰면 안 되나` 패널에서 풀어 쓴다. 예산이 설정되지 않았을 때의 분기는 원문에 명시 없음이라 그림에 그리지 않았다.

@steps id=entry-steps
| s-req | 보안 요청이 온다 | 에이전트는 사용자의 보안 관련 요청을 받는다. 요청은 보안 질문, 특정 지적 조사, 방법론 질문일 수도 있고 코드베이스 감사일 수도 있다. 이 스킬은 에이전트 중립적으로 쓰여 있어서 parent는 실행을 조율하고 공유 상태를 소유하는 agent, Task tool은 위임 수단, `research` agent는 소스 탐색과 사실 확인을 맡는 위임 agent, `general` agent는 넓은 조사와 제한된 로컬 실행을 맡는 위임 agent를 뜻한다.[](source:skm-terms) 이 시점에는 파일을 만들거나 agent를 띄우지 않는다. | entry-flow | req |
| s-mode | 전체 감사 요청인가? | 에이전트는 요청이 어느 모드인지 가른다. 사용자가 코드베이스 audit나 pen-test를 명시했거나, full·comprehensive·end-to-end 보안 리뷰를 요청했거나, 보고서 산출물을 요청했다면 전체 감사 모드다.[](source:skm-modes) 보안 질문, 집중 리뷰, 방법론, 분류, 특정 지적 조사라면 안내 모드다.[](source:skm-modes) 어느 쪽으로도 읽히면 파일을 만들거나 전체 워크플로를 시작하기 전에 질문을 하나 한다.[](source:skm-modes) 판정: 그림의 세 갈래(안내, 모호함, 전체 감사)는 이 세 문장을 나눈 것이고 원문이 정한 분기는 이것뿐이다. | entry-flow | mode |
| s-ask | 한 가지만 질문 | 요청이 모호하면 에이전트는 집중된 질문 하나를 사용자에게 한다.[](source:skm-modes) 질문 내용은 원문에 명시 없음이다. 판정: 이 질문은 사용자가 파일 생성을 포함한 전체 감사를 원하는지 가리는 용도로 보는 것이 자연스럽다. 답을 받기 전에는 출력 폴더를 만들거나 6단계를 시작하지 않는다.[](source:skm-modes) 답이 오면 에이전트는 앞 노드의 판단으로 돌아간다. | entry-flow | ask |
| s-guide | 안내 모드로 답한다 | 안내 모드의 에이전트는 스킬 가운데 요청과 관련된 부분만 쓴다. 6단계를 자동으로 돌리지 않고, 출력 폴더를 만들지 않고, 감사 산출물을 쓰지 않는다.[](source:skm-modes) 필요하면 집중된 agent를 띄울 수 있지만 그 agent는 결과를 지금 하는 작업으로 돌려준다.[](source:skm-modes) 실행 안전 규칙은 이 모드에서도 같다. 소스 검사는 읽기 전용이고, 대상이 통제하는 빌드·테스트·프로세스·브라우저·fuzzer는 OS 샌드박스 안에서만 돌리며, 안내 모드에서는 대상이 통제하는 파일을 남기지 않는다.[](source:skm-safety) 이 노드가 안내 모드 흐름의 끝이다. | entry-flow | guide |
| s-setup | 전체 감사 값 정하기 | 전체 감사 모드의 에이전트는 정찰 전에 다섯 값을 확정한다. 스킬 폴더(이 `SKILL.md`가 있는 절대 경로), 대상(검토할 저장소 루트의 절대 경로), repo 이름(디렉터리나 로컬 Git remote에서 얻은 안정적 식별자), 출력 폴더, 소스 ref(검토한 commit과 작업 트리가 dirty인지 여부)다.[](source:skm-setup) 출력 폴더는 대상 밖의 새 쓰기 가능 폴더이고 기본값은 `~/security-audit-skill/<repo-name>/run-<N>`이며 `<N>`은 쓰이지 않은 다음 정수다. 대상 안의 폴더는 사용자가 명시적으로 고르고 parent가 버전 관리가 폴더 전체를 무시하는지 확인했을 때만 쓴다. 그렇지 않으면 멈추고 외부 경로를 요청한다.[](source:skm-setup) 이어서 parent는 공유 파일 일곱 개의 유일한 작성자가 된다. 일곱 파일은 `run-metadata.json`, `architecture.md`, `coverage-ledger.json`, `findings.json`, `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md`다. hunter와 verifier는 각자 `<output-dir>/agents/<agent-id>/` 아래 `scratch/`와 `artifacts/`를 받고, agent는 자기 `scratch/`에만 쓴다.[](source:skm-isolation) 위임 전에 parent는 `run-metadata.json`에 `run_id`, `repo`, `target`, `source_ref`, `profile`, `scope_paths`, `budget`(없으면 null), `execution_policy: "sandboxed-source-and-local-only"`, 선택한 companion 파일, 이전 실행 경로, 공유 파일별 owner, `run_status: "in_progress"`를 최소한 적는다.[](source:skm-repro) | entry-flow | setup |
| s-profile | 프로필과 범위 정하기 | 에이전트는 사용자의 요청에서 프로필을 고르거나 대상의 크기와 위험도를 보고 하나를 제안한다. 고른 값은 `run-metadata.json`의 `profile`, `scope_paths`에 기록하고 보고서에도 적는다. 기본값은 `standard`다.[](source:skm-profiles) 범위를 좁힌 실행(scoped run)은 이름 붙인 경로, 한 subsystem, 한 companion 영역, 두 source ref 사이의 diff 중 하나만 감사한다. 이때 범위 안 진입면에만 ledger unit을 만들고 나머지는 `out_of_scope`로 적으며 `covered`로 적지 않는다. scoped 실행과 `quick` 실행은 스스로 부분 커버리지라고 밝혀야 한다.[](source:skm-profiles) 프로필은 폭과 중복만 바꾸고 증거 기준은 바꾸지 않는다. 후보 통과 조건, 소스·로컬 실행 경계, `needs_validation` 규율, 스키마 검증, `confirmed` 기록의 독립 검증은 어느 프로필에서도 줄이지 않는다.[](source:skm-profiles) | entry-flow | profile |
| s-budget | 예산이 최소를 감당하나? | 정찰 agent를 하나라도 띄우기 전에 에이전트는 엄격한 예산 통과 조건(strict budget gate)을 적용한다. 예산은 사용자가 정하거나 큰 대상에서 parent가 제안하며, `run-metadata.json`의 `budget`에 모든 단계를 통틀어 agent 호출 최대 횟수로 적는다.[](source:skm-budget) 이 조건은 기본 정찰 호출 네 번, 최종 critic 몫(`quick`은 post-wave critic 하나, `standard`와 `deep`은 post-wave critic 하나와 별도의 final-clean critic 하나), verifier 호출 최소 한 번이 예산에 들어가는지 본다.[](source:skm-budget) 추가 focused 정찰은 호출마다 이 조건을 다시 거친다.[](source:skm-budget) 예산을 정하지 않았을 때 이 조건이 어떻게 동작하는지는 원문에 명시 없음이다. 판정: 이 조건을 설명한 문장은 요청된 예산이 있다는 전제로 쓰여 있다.[](source:skm-budget) | entry-flow | budget |
| s-halt | 에이전트 없이 중단 | 예산이 이 최소를 감당하지 못하면 에이전트는 agent를 하나도 띄우지 않고 사용자에게 더 큰 예산, 좁은 범위, 다른 프로필 중 하나를 요청한다. 요청이 그대로이면 `run_status: "incomplete"`와 `incomplete_reason: "budget_cannot_fund_reconnaissance_and_reserves"`를 기록하고 감사가 한 번도 돌지 않았다고 보고한다.[](source:skm-budget) 정찰 문서도 같은 말을 한다. 예산 통과 조건이 실패하면 incomplete 상태를 `run-metadata.json`에 적고 정찰 agent를 띄우지 않는다.[](source:rec-gate) | entry-flow | halt |
| s-start | 정찰로 넘어간다 | 예산 통과 조건을 만족하면 다음 패널의 `Phase 1 정찰`이 시작된다. 정찰은 대상과 로컬에 있는 빌드·설정 상태만 읽고, 배포된 endpoint, 외부 identity provider, registry, broker, cloud API, 공유 서비스에는 접속하지 않는다.[](source:rec-gate) | entry-flow | start |

세 프로필은 hunter 반복과 verifier 구성에서 이렇게 다르다.

| 프로필 | 반복과 critic | verifier | ledger 단위 |
| --- | --- | --- | --- |
| `quick` | hunter wave 정확히 한 번, 마지막 critic 정확히 한 번[](source:skm-profiles) | 후보마다 새 verifier 하나가 후보 검증과 최종 기록 검증을 함께 맡는다[](source:skm-profiles) | surface × boundary × attack class로 거칠게 묶고 subsystem은 고정값 `profile/quick/all-in-scope-subsystems`를 쓴다[](source:skm-profiles) |
| `standard` | 원문 그대로. wave마다 post-wave critic을 돌리고, 더 할 일이 없으면 별도의 final-clean critic을 한 번 더 쓴다[](source:skm-profiles)[](source:hun-loop) | Phase 3과 Phase 5를 서로 다른 verifier가 따로 한다[](source:val-p5) | 진입면·신뢰 경계·subsystem·attack class 조합마다 한 단위[](source:rec-ledger) |
| `deep` | critic wave를 더 찾을 일이 없을 때까지 돌린다[](source:skm-profiles) | 후보 검증과 최종 기록 검증을 서로 다른 새 agent가 맡고, `prior_covered_same_source` 단위에는 독립된 두 번째 점검을 준다[](source:skm-profiles) | subsystem과 lifecycle 모드별로 나눈다[](source:skm-profiles) |

## 전체 감사는 6단계를 어떻게 돌리나 {#behavior-phases span=12}

전체 감사 모드의 에이전트는 6단계를 순서대로 모두 따른다. 끝낼 수 있는 상태는 정확히 둘이고, 단계 중간에 멈추지 않는다.[](source:skm-workflow) 그림에서 되돌림이 있는 곳은 hunter wave와 critic 사이, 그리고 검증기 오류를 고치는 구간이다.

@workflow id=audit-flow title="전체 감사 6단계"
| recon | Phase 1 정찰 | backend |
| hunt | Phase 2 hunter wave | backend |
| critic | critic이 일을 더 찾았나? | backend |
| verify | Phase 3 후보 검증 | backend |
| write | Phase 4 findings.json | backend |
| valid | 검증기 둘 통과? | backend |
| final | Phase 5 최종 기록 검증 | backend |
| report | Phase 6 보고서 | backend |
| finish | 종료 상태 둘 중 하나 | external |
| recon > hunt | ledger 완성 | emphasis |
| hunt > critic | wave 종료 | emphasis |
| critic > hunt | 예 |
| critic > verify | 아니오 | emphasis |
| verify > write | | emphasis |
| write > valid | | emphasis |
| valid > write | 오류 |
| valid > final | 통과 | emphasis |
| final > report | | emphasis |
| report > finish | | emphasis |

이 그림은 핵심 경로와 두 번의 되돌림(critic 이후 wave 반복, 검증기 오류 수정)만 그렸다. 생략한 경로는 아래와 같고 각각 해당 노드 설명에 있다.

- 예산이나 독립 verifier가 모자라 `incomplete`로 끝나는 경로: `Phase 3 후보 검증`, `Phase 5 최종 기록 검증`, `종료 상태 둘 중 하나` 설명.
- Phase 5에서 대체 기록을 새 verifier에게 다시 확인시키는 반복: `Phase 5 최종 기록 검증` 설명.
- 정찰 중 추가 focused agent: `Phase 1 정찰` 설명.
- `quick`·scoped 변형: 앞 패널의 프로필 표와 `critic이 일을 더 찾았나?` 설명.

@steps id=audit-steps
| s-recon | Phase 1 정찰 | parent는 `run-metadata.json`을 초기화하고 예산 통과 조건을 적용한 뒤 agent별 `scratch/` 폴더와 공유 ledger를 만든다.[](source:rec-gate) 그다음 `research` agent 네 개를 병렬로 띄운다. 이 agent들은 구조화된 사실을 parent에게 돌려주고 파일은 쓰지 않는다. 1a는 제품·스택·로컬 운영과 오프라인으로 돌릴 수 있는 빌드·테스트 명령(정찰 중에는 실행하지 않는다), 1b는 낮은 신뢰의 주체와 인증·인가·격리·권한 통제, 1c는 외부 입력이 들어오는 모든 진입면과 변환·복사본·싱크, 1d는 로컬 실행 가능성과 배포 가시성을 맡는다. 1d는 샌드박스 통제와 승격 통제를 로컬 플랫폼이 강제할 수 있는지도 보고하고, 샌드박스 통제가 없으면 대상 실행이, 승격 통제가 없으면 `scratch/` 파일을 증거로 쓰는 일이 막힌다.[](source:rec-agents) 서로 다른 배포 모드나 subsystem이 남으면 focused 정찰을 더하되 예산 통과 조건이 막으면 띄우지 않고 그 영역을 `deferred` unit으로 시딩해 보고서에 공개한다.[](source:rec-agents) 이전 실행이 있으면 호환되는 `coverage-ledger.json`과 `findings.json`을 모두 읽는다. 현재 소스·조건이 그대로인 이전 `confirmed`는 같은 fingerprint로 후보에 이월하고 그 근본 원인만 hunter 제외 목록에 넣으며, 소스가 바뀌었으면 재검증 unit을 만들고 제외하지 않는다. 이전 `needs_validation`·`deferred`·`blocked`·`out_of_scope`와 소스가 바뀐 unit은 모두 현재 작업이 되고, 이전 `rejected`는 변하지 않은 같은 주장만 억제한다. 호환되는 ledger가 없으면 최종 커버리지 문장에서 그 사실을 밝히고 한 번의 실행이 대상을 다 훑었다고 말하지 않는다.[](source:rec-prior)[](source:skm-prior) 정찰 결과로 parent는 약 1,000단어 상한의 `architecture.md`를 쓴다. 제품·주체·보호 자원, 비교할 만한 소프트웨어(소스 근거가 있을 때만), 스택과 배포 경로, 진입면과 주요 경로, 신뢰 경계와 가장 강한 통제, 시작 경로, 이전 빈틈과 이월 항목, companion 선택 요약이 들어간다.[](source:rec-arch) companion은 언어나 의존성 이름이 보인다고 고르지 않고, 그 파일의 `When to use this file` 경계가 정찰에서 실제로 발견되었을 때 고른다.[](source:rec-arch) 마지막으로 parent는 진입면·신뢰 경계·subsystem·attack class 조합마다 한 단위씩 `coverage-ledger.json`(최상위 JSON 배열)에 시딩한다. `coverage_id`는 네 참조를 RFC 3986 percent-encoding한 뒤 `::`로 이은 값이고, 처음 상태는 `planned`다.[](source:rec-ledger)[](source:rec-unit) 검증기는 시딩 직후, parent가 갱신할 때마다, Phase 6 전에 돌리고 오류를 모두 고친 뒤에야 작업을 배정한다.[](source:rec-state) | audit-flow | recon |
| s-hunt | Phase 2 hunter wave | parent는 `planned` unit을 `general` agent인 hunter에게 배정한다. 서로 가까운 unit은 한 hunter가 맡을 수 있지만 agent 수 제한 때문에 조용히 빠지는 unit은 없어야 하고, 예산이 닿지 않는 unit은 `deferred`와 이유 `budget_cannot_reserve_critics_and_validation`으로 남긴다.[](source:hun-assign) hunter 수가 제한되면 다음 순서로 배정한다. 인증이 필요 없는 가장 낮은 신뢰의 진입면, 가장 값진 자원(자격 증명, cross-tenant 데이터, code execution, release 권한)을 지키는 경계, 이전 실행의 빈틈과 재검증 대상과 소스가 바뀐 곳, 이 대상 유형에서 과거에 `confirmed`를 낸 class 순이고 동률은 `coverage_id` 사전순이다.[](source:hun-assign) 배정 직전 parent는 unit을 `in_progress`로 바꾸고 소문자 `agent_id`를 주고 `scratch/`와 `artifacts/`를 만든다. hunter는 소스와 parent가 준 맥락을 읽고 자기 `scratch/`에만 쓰며 구조화된 결과 하나를 Task tool로 돌려준다. 대상 소스, `architecture.md`, `coverage-ledger.json`, `findings.json`, 다른 agent의 파일은 고치지 못한다.[](source:hun-assign) hunter 지시문은 정해진 아홉 부분으로 이뤄진다. 역할 두 문장, `architecture.md` 원문, 배정 coverage ID와 unit별 블록 지도, 선택된 attack class 블록의 원문, 제외한 블록과 이유, 핵심 사냥 방법과 승격 절차 블록, 핵심 검증 규칙, 이월한 확정 지적의 fingerprint·제목·근본 원인과 동료가 맡은 coverage ID, 경로·allowlist·결과 계약이다. 블록 이름만 보내지 않고 원문을 그대로 복사한다.[](source:hun-prompt) 사냥 방법은 입력이 parsing, identity, authorization, normalization, 상태, 파생 복사본, 최종 싱크를 지나는 길을 깊이 따라가고 sibling·legacy·batch·retry·cancel·migration·error 경로까지 읽으라고 한다. 이어서 낮은 신뢰 주체와 시작 능력, 받아들인 값, 거부해야 할 통제 위치, 그 뒤의 정확한 경로를 적고 가장 작은 영향(더미 레코드, 잘못된 반환값, 프로세스 무결성 효과)에서 멈춘 뒤 소스 수준의 수정과 회귀 사례를 쓰는 여섯 단계의 불변 조건(invariant) 작업을 따른다.[](source:hun-method) 깊이는 배정된 경계에 닿는 경로로 제한하고, 불변 조건이 어느 쪽으로든 정해지면 조사를 멈추고 결과에 `covered`, `candidate`, `blocked` 중 하나나 `uncovered` 항목으로 남긴다.[](source:hun-method) 후보가 지켜야 할 통과 조건은 일곱 가지다. 후보는 완전한 repository-relative 소스 trace와 가장 강한 소스 가시 통제의 증거가 있어야 한다. `confirmed` 제안은 제한된 로컬 관찰 결과, 경계 너머의 의미 있는 영향, 완전한 조건, 막는 층의 부재가 있어야 한다. crash를 code execution으로, 일반 작업을 공유 availability로, 같은 주체의 행동을 권한 상승으로 부풀리지 않는다. 소스나 로컬로 볼 수 없는 사실이 결정적이면 `needs_validation`으로 두고 심각도를 주지 않는다. 영향받는 주체나 자원이 없는 모범 사례 누락은 제외하거나 보강 권고로 두며 소스로 반증된 후보는 `needs_validation`이 아니다. 같은 근본 원인은 어느 상태에서나 같은 fingerprint를 쓰고, 통과한 후보가 없으면 빈 배열을 돌려준다.[](source:hun-gate) 로컬 실행은 확인용이다. 허용되는 것은 샌드박스 안의 오프라인 빌드, 격리된 loopback 프로세스, 단위·통합 테스트, 작은 fixture 처리, sanitizer, 제한된 fuzz, 더미 계정의 브라우저·emulator 테스트다. 라이브 트래픽, 의존성 설치, 실제 계정, 운영 데이터, 공유 자원, 게시, 부하·비용 유발, 최소 경계 결과 이후의 작업은 금지한다.[](source:hun-local) hunter는 JSON 객체 하나만 돌려준다. 배정된 coverage ID마다 정확히 한 번 `covered`·`candidate`·`blocked` 중 하나와 검사한 경로, 검사별 `agent_id`·`invariant`·`method`·`result`·`artifact`를 적고, 예상 밖 경계는 `uncovered`로 올리며, 후보는 `verdict` 대신 `proposed_verdict`를 쓴다.[](source:hun-result) parent는 결과를 배정된 coverage ID 하나에 대응시켜 그 unit만 갱신한다. 깨졌거나 뒷받침 없는 결론은 unit을 `planned`로 남겨 재배정하고, 후보는 fingerprint, 그다음 근본 원인으로 통합해 중복 후보를 검증에 보내지 않는다.[](source:hun-consol) 예산은 wave마다 다시 계산한다. hunter 수, 검증 예비분, 곧 쓸 post-wave critic, 남겨 둘 final-clean critic이 모두 들어가는지 비교해 hunter wave를 줄이고, 모자라면 그 wave에서 hunter를 띄우지 않고 해당 unit을 `deferred`로 둔다.[](source:hun-loop)[](source:skm-budget) | audit-flow | hunt |
| s-critic | critic이 일을 더 찾았나? | wave가 끝나면 parent는 미리 예약해 둔 호출로 새 `research` coverage critic 하나를 띄운다. critic은 `architecture.md`, 블록 지도가 든 전체 ledger, 현재 후보 fingerprint와 상태, 이전 ledger 빈틈 요약을 받아 소스를 읽기만 하고 쓰거나 대상을 실행하지 않는다.[](source:hun-critic) 반환값은 `missing_units`, `reassign_ids`, `resolved_prior_leads`, `stop` 네 필드의 JSON이고, critic은 후보가 아니라 범위를 제안한다. 매핑되지 않은 진입점, 확인되지 않은 병렬 경로, 빠진 lifecycle 모드, unit 없는 선택 companion class, 근거 없는 제외, 경로나 검사 없이 닫힌 unit, 이전 `needs_validation`·소스 변경 빈틈을 점검한다.[](source:hun-critic) parent는 범위나 소스·로컬 경계 밖의 제안을 거절하고 받아들인 제안의 canonical ID를 도출해 현재 unit과 중복을 걸러내며, ID 충돌은 합치지 않고 실패로 처리한다. 근거가 있는 `reassign_id`는 기존 terminal 기록을 `attempts`에 보존한 뒤 `wave`를 올리고 새 담당 agent를 배정한다.[](source:hun-loop) 그림의 `예` 간선이 이 반복이다. `standard`와 `deep`에서는 post-wave critic이 받아들일 일을 못 찾고 `planned` unit도 남지 않았을 때 별도의 final-clean critic을 쓴다. 이 critic도 일을 못 찾아야 완전 커버리지로 보고, 찾으면 큐에 넣어 wave, post-wave critic, final-clean critic을 반복한다.[](source:hun-loop) `quick`은 wave 한 번과 마지막 critic 한 번이고, 받아들인 `missing_units` 항목은 `deferred`(이유 `quick_profile_final_critic`)로 두며 두 번째 wave는 없다. scoped 실행에서는 범위 밖 빈틈을 `out_of_scope`로 기록한다.[](source:hun-loop) 시간이나 자원 때문에 일찍 멈추면 손대지 않은 unit을 모두 `deferred`로 두고 critic의 이유를 보존해 보고서에 빈틈을 공개한다. 조용한 wave·agent 상한은 완전 커버리지의 증거가 아니다.[](source:hun-loop) | audit-flow | critic |
| s-verify | Phase 3 후보 검증 | 아무 일도 더 찾지 못한 critic 결과나 기록된 조기 종료 뒤에 parent는 후보와 이월한 이전 확정 기록을 fingerprint와 근본 원인으로 통합한다. 고유한 `confirmed`·`needs_validation` 제안마다 그 후보를 사냥하지 않은 새 `general` verifier를 배정하고, 이월 기록도 같은 경로를 탄다.[](source:val-p3) verifier는 hunter나 이전 산출물을 읽어도 되지만 인용된 현재 소스 위치를 모두 다시 읽고, 안전하게 재현할 수 있는 결정적 검사는 독립적으로 돌린다. 받는 것은 후보, 연결된 unit의 검사와 산출물 경로, 해석에 필요한 architecture 사실, 관련 companion 검증 블록, 승격 절차 블록, 실행 경계, 세 판정 결과 분기의 스키마 원문, 같은 fingerprint의 이전 기록이고, 다른 verifier의 결론은 받지 않는다.[](source:val-p3) 지시문은 `You did not write this candidate. Try to refute it`로 시작해 반박을 시도하라고 한다. verifier는 `trace`와 `evidence`의 모든 경로·줄을 확인하고, 입구가 실제로 낮은 신뢰 진입점이고 끝이 주장한 싱크인지 보며, 가장 강한 소스 가시 통제를 다시 세운다. `confirmed` 제안은 최소 관찰 결과를 독립적으로 재현하려 하고, `needs_validation` 제안은 막힌 이유가 정말 소스·로컬 관찰 밖인지 판단한다. 소스가 반박하면 기각한다.[](source:val-prompt) 반환은 `{"decision": ..., "record": ...}` JSON 하나뿐이고 고쳐 쓴 기록이 hunter의 문장을 대체한다.[](source:val-prompt) 판정 결과 규칙은 이렇다. `needs_validation`은 완전한 경로와 제한된 관찰 결과를 독립적으로 세웠을 때만 `confirmed`로 올라간다. 배포나 런타임의 구체적 사실을 알 수 없으면 `confirmed` 제안을 `needs_validation`으로 내린다. 소스, 로컬 동작, 보이는 통제, 의미 있는 영향의 부재, 불가능한 전제가 주장을 반박하면 `rejected`다. `needs_validation`은 추측을 두는 자리가 아니다.[](source:val-decide) parent는 verifier가 같은 fingerprint를 돌려줬는지(진짜 다른 근본 원인이면 예외) 확인하고, 정정을 병합하며, 연결된 모든 unit에 판정을 기록해 fingerprint마다 최종 기록 하나만 남긴다. 깨졌거나 설명 문장으로 감싼 결과는 고치지 않고 버리고 예산이 되면 새 verifier로 다시 돌린다.[](source:val-decide) 엄격한 총 예산이 모든 후보를 덮지 못하면 사냥을 멈추고 fingerprint 순으로 가능한 만큼 검증한다. 이때 `run_status: "incomplete"`와 `incomplete_reason: "validation_budget_exhausted"`를 기록하고, 검증하지 못한 후보는 어떤 판정 결과로도 `findings.json`에 넣지 않는다.[](source:skm-budget)[](source:val-decide) | audit-flow | verify |
| s-write | Phase 4 findings.json | parent는 독립적으로 판정한 기록을 fingerprint 순으로 `findings.json`에 쓴다. 담는 기록은 `confirmed`, `needs_validation`, `rejected` 셋이고, 기각한 기록을 남기는 까닭은 바뀐 근거 없이 같은 주장이 다시 나오지 않게 하려는 것이다.[](source:val-p4) 쓰기 직전에 `report-schema.json`을 읽는다. 스키마는 `additionalProperties: false`라서 hunter 래퍼 필드를 그대로 가져오면 안 된다.[](source:val-p4) 세 분기가 쓰는 필드는 서로 달라서 `confirmed`에는 `claimed_root_cause`·`blockers`·`validation_plan`·`reason`을 쓰지 않고, `needs_validation`에는 심각도·실행·수정·`reason`·확정 근본 원인을 쓰지 않으며, `rejected`에는 심각도·실행·수정·`blockers`·`validation_plan`·확정 근본 원인을 쓰지 않는다.[](source:val-p4) 모든 기록은 안정적 fingerprint, 제목, 설명, 저장소 상대 소스 경로를 갖고, 여러 단계의 trace는 `entrypoint`로 시작해 `sink`로 끝나며 그 사이에만 `propagation`을 쓴다. 전체 심각도는 입증된 영향을 넘을 수 없다.[](source:val-p4) | audit-flow | write |
| s-valid | 검증기 둘 통과? | parent는 `node <skill-dir>/validate-findings.cjs <output-dir>/findings.json`과 `node <skill-dir>/validate-coverage-ledger.cjs <output-dir>/coverage-ledger.json`을 돌리고 구조·의미 오류를 모두 고친 뒤에야 다음으로 간다. 그림의 `오류` 간선이 이 되돌림이다.[](source:val-p4) 원문은 검증 통과가 형식과 ledger 일관성만 증명한다고 적는다.[](source:val-p4) 판정: 두 스크립트는 각자 파일 하나만 인자로 받고 서로의 파일을 읽지 않으므로, `findings.json`의 fingerprint와 ledger unit을 서로 대조하는 검사는 코드에 보이지 않는다.[](source:vf-run)[](source:vl-run) 두 검증기가 실제로 무엇을 검사하는지는 `무엇이 만들어지고 검증기는 무엇을 보나` 패널에서 설명한다. | audit-flow | valid |
| s-final | Phase 5 최종 기록 검증 | parent는 최종 `confirmed`·`needs_validation` 기록마다 새 `research` verifier 하나를 병렬로 띄운다. 이 verifier는 hunter의 서술이 아니라 구조화된 기록을 검증하고 소스·로컬 경계 안에 머문다.[](source:val-p5) `confirmed`는 여섯 가지를 확인한다. `trace`와 `evidence`의 경로·줄·`scope`와 묘사된 동작, 실제 진입 인터페이스와 정확한 로컬 입력 모양, 조건·parser·정책 단계·소스 가시 방지층·관찰 결과, 영향받는 주체와 자원, 현실적 `likelihood`와 입증된 `impact`에 비춘 심각도(`overall_severity`는 `impact` 이하), 그리고 `remediation`이 신뢰를 옮기지 않고 불변 조건을 강제하는지다.[](source:val-p5) `needs_validation`은 다섯 가지를 확인한다. 소스 경로가 실재하고 `claimed_root_cause`만 지지하는지, 막힌 이유가 결정적이고 로컬로 답할 수 없는지, 경계와 구체적 결과를 말하는지, `validation_plan`이 정확한지(`deployment`는 소유자가 관찰하는 일이고 감사 트래픽을 보내지 않는다), fingerprint가 이전·현재 기록과 맞는지다.[](source:val-p5) 반환은 `{"decision":"verified","fingerprint":...}` 또는 `{"decision":"replace","reason":...,"record":...}` 하나다. 더 강한 판정 결과로 올리는 대체(어떤 `confirmed` 승격이든)나 근본 원인·trace·실행 입력·관찰 결과·영향·심각도를 실질적으로 바꾸는 대체는 바로 적용하지 않는다. hunt하지도, Phase 3 검증이나 그 대체 제안을 하지도 않은 새 verifier가 현재 소스를 다시 확인하고 결정적 로컬 결과를 독립적으로 재현해 `verified`나 또 다른 대체를 돌려줘야 적용한다. 예산이나 독립성이 없으면 분쟁 기록을 `findings.json`에서 빼고 ledger에는 해결되지 않은 후보로 두며 `run_status: "incomplete"`와 정확한 이유를 적는다. 표현이나 줄 번호 정정은 의미가 안 바뀌면 직접 적용한다.[](source:val-p5) `quick`에서는 Phase 3와 Phase 5가 합쳐지지만 `confirmed`의 독립 검토는 어느 프로필에서도 건너뛰지 않는다.[](source:val-p5) 대체를 적용할 때마다 두 검증기를 다시 돌리고 연결된 ledger 판정을 갱신하며, 별도 근본 원인이 나오면 새 fingerprint를 주고 독립 후보 검증부터 다시 받는다. `run_status: "complete"`는 모든 ledger 후보가 독립 최종 판정을 받고 남은 기록이 모두 Phase 5를 통과했을 때만 쓴다. 이 단계는 `needs_validation` 기록도 검증한다. 잘못된 인계는 소유자의 시간을 쓰게 하고 거짓 전제를 남기기 때문이다.[](source:val-p5) | audit-flow | final |
| s-report | Phase 6 보고서 | Phase 5를 통과한 기록만 `findings.json`에 남은 뒤에, parent는 최종 기록, ledger, ledger의 부가 필드에 보관한 hunter의 보강 권고 노트로 보고서 세 개를 쓴다. 보고서 문장은 판정 결과, 심각도, 막힌 이유, 입증된 영향을 바꾸지 않는다. 미완료 실행은 독립 검증된 기록만 보고할 수 있고 해결되지 않은 ledger 후보는 지적으로 제시하지 않는다.[](source:val-p6) `REPORT.md`에는 프로필·범위·예산(쓴 agent 대 계획)·source ref·샌드박스 실행 선언·이전 실행 활용·deferred와 범위 밖 커버리지(`quick`·scoped·예산 제한·미완료 실행은 부분 점검이라고 밝힘), 보안 자세 요약 한 줄, `confirmed` 표(심각도·제목·경계·관찰 결과 한 줄), `confirmed`별 상세, 심각도 없는 `NEEDS VALIDATION` 표, 보강 권고와 긍정 패턴, ledger 기준 커버리지 요약이 들어간다.[](source:val-p6) `FINDINGS-DETAIL.md`는 `medium`·`high`·`critical`인 `confirmed`마다 trace, 더미 공격자와 자원, 입력·호출·fixture, 관찰 출력, 조건, 수정과 회귀 사례를 복사한다. `NEEDS-VALIDATION.md`는 해결되지 않은 기록마다 trace, 근거, 막힌 이유, 경계, 로컬·소유자 관찰 해결 계획을 심각도 없이 복사한다.[](source:val-p6) 보고서는 대상 중립이어서 HTTP는 가능한 인터페이스 중 하나일 뿐이다. 라이브 환경이 없는 대상에 endpoint나 외부 계정을 요구하지 않고, 증거에 비례해 쓰며, 깨끗한 실행은 `confirmed`가 0개일 수 있고 LOW 지적을 지어내지 않는다.[](source:val-p6) | audit-flow | report |
| s-finish | 종료 상태 둘 중 하나 | 원문은 종료 상태를 정확히 둘로 제한한다. 하나는 모든 Phase 6 산출물을 쓰고 두 검증기가 통과한 상태이고, 다른 하나는 `run_status: "incomplete"`와 정확한 이유를 기록하고 보고서에 빈틈을 밝힌 상태다.[](source:skm-workflow) `incomplete`로 끝나는 경로는 이 문서에서 확인한 것만 세 가지다. 정찰 전 예산 부족(`budget_cannot_fund_reconnaissance_and_reserves`), 최종 critic 예비분 소진(`critic_budget_exhausted`), 후보 검증 예산 소진(`validation_budget_exhausted`)이다.[](source:skm-budget) 여기에 Phase 5에서 분쟁 기록을 재검증하지 못한 경우가 더해지지만 그 이유 문자열은 원문에 명시 없음이다.[](source:val-p5) | audit-flow | finish |

## 어떤 attack class와 companion 파일을 고르나 {#classes span=12}

에이전트는 먼저 대상 유형에 맞는 class를 고르고 큰 대상은 subsystem별로 나눈다. 모든 class는 찾고, 검증하고, 고치고, 우선순위를 매기는 일로 틀을 잡으며 payload 체인 개발, 라이브 서비스 가용성 시험, 공유 환경 조작은 하지 않는다.[](source:atk-intro)

attack class는 아홉 개이고 모두 `general` agent가 맡는다. 일곱 개는 일반 class이고 나머지 둘은 아래에서 따로 본다.[](source:atk-core)

- `Injection`: 신뢰할 수 없는 입력을 진입점에서 위험한 싱크까지 따라간다. 저장됐다가 다른 코드에서 위험하게 쓰이는 간접 주입과 키·헤더·메타데이터를 통한 주입도 본다.[](source:atk-core)
- `Access control`: 권한 검사가 있는지가 아니라 올바른 자원에 올바른 메커니즘으로 올바른 권한을 검사하는지, 같은 상태 변경에 더 약한 경로가 있는지를 본다.[](source:atk-core)
- `Resource and file handling`: path traversal, SSRF, 역직렬화, 압축 해제, TOCTOU를 본다.[](source:atk-core)
- `Cryptography and secrets`: 약한 난수, 하드코딩된 secret, 키 파생과 nonce 오용을 보고, 암호 처리가 실패했을 때 암호 없는 경로로 되돌아가는지도 본다.[](source:atk-core)
- `Business logic`: 상태 기계 위반, 비원자적 경쟁, 수량 조작, 암묵적 신뢰 가정, 시간 경계, 기본값을 본다.[](source:atk-core)
- `Feature abuse and data leakage`: export, import, search, preview, webhook 같은 정당한 기능의 오남용을 본다.[](source:atk-core)
- `Chained vulnerabilities and trust boundaries`: 개별로는 허용된 동작이 다음 단계의 더 강한 보장을 깨는 지점을 본다. 각 전제를 확인하지 않은 채 다음 효과를 가정하지 않는다.[](source:atk-core)

두 class는 성격이 다르다. `Wildcard`는 카테고리를 받지 않고 표준 class 밖의 취약점을 찾으며, 반쯤 만든 기능, 숨은 endpoint, 기능 조합, git 이력, 테스트가 다루지 않는 곳을 시작점으로 삼되 다른 class와 같은 경계·검증 요구를 지킨다.[](source:atk-wild) `Obvious things`는 하드코딩 secret, 보안 TODO, 디버그 모드, 노출된 `/debug`·`/admin` 같은 endpoint, 커밋된 `.env`, CORS와 cookie 속성, open redirect, 오류 응답의 스택 트레이스를 창의성 없이 글자 그대로 모두 점검하고 항목마다 결과를 보고한다. 단 지적을 보고하려면 전체 코드 경로를 확인해야 하고, 플래그 하나는 finding이 아니다.[](source:atk-obvious)

도메인 companion 파일은 열 개이고 ATTACK-CLASSES.md가 도메인별로 어느 파일을 쓸지 안내한다.[](source:atk-route) 각 파일의 `Core discipline`, 선택한 attack class 절, `Universal moves`, `Validation rules`가 hunter 지시문에 원문 그대로 들어간다.[](source:hun-prompt) 아래 표는 각 파일이 켜지는 조건과, 그 영역에서 단독으로는 finding이 되지 못하는 것을 보여 준다.

| 파일 | 켜지는 경계 | 단독으로는 부족한 것 |
| --- | --- | --- |
| `AI-AND-LLM.md` | 언어 모델이 신뢰가 필요한 결정에 관여할 때(챗봇, RAG, 에이전트 기억, tool-calling, MCP, 모델 출력을 실행하는 코드)[](source:ai-core) | prompt injection 자체. 코드 수준의 경계 실패가 있어야 한다[](source:ai-core) |
| `CLIENT-SIDE.md` | 신뢰 결정이나 신뢰할 수 없는 렌더링이 브라우저에서 일어날 때(SPA, 확장, webview, service worker, DOM)[](source:cs-core) | 자기 자신에게 주입하기, 공격자 자신의 데이터 공개[](source:cs-core) |
| `CLOUD-AND-DEPLOYMENT.md` | 저장소가 cloud identity, IaC, 컨테이너, Kubernetes, mesh, serverless, ingress, 환경별 설정을 정의할 때[](source:cd-core) | manifest만 보고 추론한 live 노출, secret 참조[](source:cd-core) |
| `DATA-ISOLATION-AND-LIFECYCLE.md` | 다중 테넌트 데이터, 파생 복사본(search·cache·analytics), export·restore, migration, 삭제·폐기 약속이 있을 때[](source:di-core) | 레코드의 tenant 필드, 프라이버시 선호[](source:di-core) |
| `DESKTOP-MOBILE-AND-LOCAL-IPC.md` | 데스크톱·모바일 앱, 권한 있는 helper, updater, 로컬 daemon, deep link, 로컬 IPC가 있을 때[](source:dm-core) | 같은 계정과 권한 안에서의 자해[](source:dm-core) |
| `MEMORY-SAFETY-AND-BINARY.md` | 메모리 안전하지 않거나 권한 있는 맥락에서 신뢰할 수 없는 바이트를 처리할 때(C/C++, Rust `unsafe`, FFI, 커널, parser, 로더, JIT)[](source:ms-core) | 현실적 입력이 닿지 않는 panic·crash[](source:ms-core) |
| `PROTOCOLS-RPC-AND-MESSAGING.md` | gRPC, GraphQL transport, Protobuf, 커스텀 프로토콜, queue·broker·pub/sub, webhook을 쓸 때[](source:pr-core) | "internal"이라는 이유만으로 인증된 것으로 보는 가정[](source:pr-core) |
| `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md` | 신뢰할 수 없는 작업이 공유 CPU·메모리·디스크·연결·worker·유료 API를 소모하거나 공유 서비스를 중단시킬 수 있을 때[](source:re-core) | rate limit이 없다는 사실[](source:re-core) |
| `SUPPLY-CHAIN-AND-RELEASE.md` | 의존성 해석, 신뢰할 수 없는 기여의 빌드, CI, 서명·승격, plugin, 업데이트가 있을 때[](source:sc-core) | 가변이거나 알려진 취약점이 있는 의존성[](source:sc-core) |
| `WEB-PROTOCOL-AND-AUTH.md` | HTTP 파싱·캐싱, 브라우저 인증, 세션, JWT, OAuth/OIDC, SAML, MFA, passkey, API key, mTLS가 있을 때[](source:wp-core) | 헤더·cookie 속성·MFA 프롬프트·rate limit 하나의 누락[](source:wp-core) |

companion을 고르는 기준은 두 가지다. 언어나 의존성 이름이 보인다는 이유로 고르지 않고, `When to use this file`의 신뢰 경계가 정찰에서 보였을 때 고른다. 또 다른 agent가 비슷한 attack class를 본다는 이유로 눈에 보이는 경계를 제외하지 않는다. 고르지 않은 블록은 이유와 함께 ledger 단위의 `excluded_blocks`에 적는다.[](source:rec-arch)[](source:rec-unit)

열 파일의 `Validation rules`는 마지막 항목에서 `confirmed`와 `needs_validation`을 가르는 기준을 적는다. `confirmed`는 완전한 소스 경로와 제한된 로컬 근거가 있을 때만 쓴다. 영역마다 다른 저장소 밖 사실(배포 정책, 브라우저 헤더, ABI, broker 설정 등)이 결정적이면 `needs_validation`으로 두고 필요한 확인 방법을 적는다.[](source:ai-val)[](source:cs-val)[](source:cd-val)[](source:di-val)[](source:dm-val)[](source:ms-val)[](source:pr-val)[](source:re-val)[](source:sc-val)[](source:wp-val)

## 무엇을 강제하고 언제 쓰면 안 되나 {#rules span=12}

에이전트에게 강제되는 규칙은 실행 안전, 증거 기준, 심각도, 수정 권고, 금지 패턴 다섯 묶음이다.

@callout level=warning title="통제를 하나라도 못 걸면 대상 코드를 실행하지 않는다"
| 대상이 통제하는 빌드, 테스트, 프로세스, 브라우저, emulator, fuzzer, fixture 처리는 OS가 강제하는 샌드박스 안에서만 돌린다. 샌드박스는 외부 네트워크 차단(로컬 클라이언트·서버 통신이 필요하면 격리된 loopback만), 명시한 허용 목록(allowlist)으로 채운 빈 환경(`HOME`·임시 폴더·캐시는 `scratch/` 안), 읽기 전용 대상과 toolchain(대상 프로세스는 자기 `scratch/`에만 쓰기), 명시적인 낮은 CPU·메모리·프로세스·파일 크기·디스크·실행 시간 상한을 모두 제공해야 한다.[](source:skm-safety) |
| 하나라도 강제할 수 없으면 대상 코드를 실행하지 않고, 빠진 샌드박스 기능을 `needs_validation` 막힌 이유로 보고하며 안전한 검증 계획을 준다.[](source:skm-safety) |

실행 안전 규칙은 두 모드에 모두 적용된다. 에이전트는 더미 주체·fixture·secret만 쓰고, 배포된 endpoint, 외부 서비스, 공유 인프라, 운영 계정, 다른 사용자의 데이터, 라이브 control plane을 건드리지 않는다.[](source:skm-safety) 그 밖에 하지 않는 일은 다음과 같다.

- 라이브·공유 프로세스의 가용성을 시험하지 않는다.[](source:skm-safety)
- artifact를 게시하거나 release를 바꾸지 않는다.[](source:skm-safety)
- 유료 API 한도를 쓰지 않는다.[](source:skm-safety)
- 결함 하나를 세우는 데 필요한 최소 로컬 효과를 넘어서지 않는다.[](source:skm-safety)
- 의존성을 설치하거나 빌드가 내려받게 하지 않는다.[](source:skm-safety)

결정적 사실이 소스나 샌드박스 fixture 밖에 있으면 `needs_validation`으로 보고한다.[](source:skm-safety)

대상 코드가 만든 파일은 `scratch/` 안에서 대상 통제 하에 있다. 전체 감사에서 보존할 증거는 신뢰된 parent 쪽 코드만 `artifacts/`로 승격한다.[](source:skm-promote)

승격은 허용 목록에 미리 적은 파일마다 따로 한다. 경로가 절대 경로이거나 비었거나 `.`·`..`·symlink 구성요소를 담으면 거부하고, 디렉터리 descriptor를 따라 no-follow로 걷는다. 파일이 regular file이고 link count가 정확히 1이며 크기 상한 안인지 `fstat`으로 확인한 뒤, 같은 descriptor에서 복사해 `artifacts/`에 배타적으로 만든다.[](source:skm-promote)

`scratch/`를 재귀 복사하거나 glob하지 않고 아카이브를 풀지 않으며, symlink·FIFO·socket·device·directory·hard link 파일·변하는 파일·상한을 넘는 파일은 열거나 승격하지 않는다. 확인이 하나라도 불가능하거나 실패하면 그 항목을 버리고, 결정적 증거라면 `needs_validation`과 정확한 승격 막힘 이유를 남긴다.[](source:skm-promote)

이 절차는 열한 단계이고, 원문은 `HUNTING.md`와 `VALIDATION-AND-REPORTING.md`가 같은 순서의 동일한 블록을 담는다고 적는다.[](source:skm-promote) 분석 중 두 블록의 텍스트 해시를 비교하니 같았다.[](source:hun-promote)[](source:val-promote)

증거 기준은 세 가지다.

- 경계와 결과: 후보마다 낮은 신뢰 주체, 받아들인 입력이나 행동, 의도된 통제, 넘은 경계, 영향받는 주체나 자원, 구체적으로 관찰했거나 소유자가 관찰할 수 있는 결과를 이름 붙인다. 모범 사례 누락, 짐작한 배포 동작, 일반적인 parser crash, 자기 영향은 보안 finding으로 올리지 않는다.[](source:skm-boundary)
- 제한된 로컬 근거: 소스 경로는 정적 분석으로 세우고 동작은 최소 함수 harness, 기존 단위 테스트, 작은 parser fixture, 더미 테넌트 통합 테스트, 로컬 렌더링 설정, 격리된 loopback 클라이언트로 확인한다. 잘못된 반환값이나 더미 레코드 같은 최소 효과에서 멈추고 지속성·사후 결함·은폐 자료를 만들지 않는다.[](source:skm-local)
- 소스 가시성: 배포 통제·proxy·provider 설정·브라우저 헤더·identity 정책·broker ACL·패키징·토폴로지는 실제 통제다. 필요한데 저장소에 없으면 있다고도 없다고도 가정하지 않고, `needs_validation`으로 정확한 누락 사실과 안전한 소유자 관찰·로컬 계획을 적는다.[](source:skm-visibility)

심각도는 확실성과 분리한다. `confirmed` 기록만 심각도를 받고, `likelihood`와 `impact`는 입증된 조건과 결과를 반영해야 하며 전체 심각도는 입증된 영향을 넘을 수 없다. `needs_validation`은 소스에 근거한 특정 경계 가설이 막힌 상태이지 확신이 낮은 취약점이 아니며 심각도가 없다.[](source:skm-priority)

| 심각도 | 기준 |
| --- | --- |
| `critical` | 인증 없는 행위자가 code execution, 데이터 저장소 전체 접근, 임의 계정 탈취를 얻는다[](source:skm-priority) |
| `high` | 행위자가 명시적 보안 통제를 완전히 무력화하고 실제 결과가 따른다. 인증 우회, cross-tenant 읽기·쓰기, 다른 사용자에게 영향 주는 저장형 스크립트 실행, 인증된 code execution, 공유 서비스의 인증 없는 원격 중단이 예다[](source:skm-priority) |
| `medium` | 실제 경계 위반이지만 영향 범위가 제한적이거나 전제 조건이 드물거나 결과가 좁은 자원에 갇힌다[](source:skm-priority) |
| `low` | 비밀이 아닌 내부 정보 노출이거나, 지속적 노력이 필요하고 얻는 것이 작은 효과[](source:skm-priority) |
| `informational` | 확정됐지만 영향이 미미하고 더 큰 finding의 전제로 쓸모가 있는 관찰[](source:skm-priority) |

`high`와 `medium`을 가르는 질문은 입증된 결과가 실제 결과가 있는 행동에 대해 명시적 통제를 완전히 무력화했는지, 약화만 했는지다. 구체적 피해를 말할 수 없다면 심각도는 느낌보다 낮다.[](source:skm-priority)

수정은 가장 작은 효과적 소스 변경으로 쓴다. `confirmed` 기록마다 코드가 강제해야 할 불변 조건과 마지막 신뢰 결정 지점의 가장 좁은 변경을 찾고, 일반적인 보강 조언보다 저장소 상대 경로의 구체적 변경과 회귀 테스트를 선호한다. 감사는 수정을 기술할 뿐 대상 소스를 고치지 않는다.[](source:skm-fix)

금지되는 패턴은 열 가지다.

| 번호 | 하지 않는 것 |
| --- | --- |
| 1 | 체크리스트 위반을 취약점처럼 제시하기[](source:skm-anti) |
| 2 | 도달 가능한 경계 위반 없이 defense-in-depth 조언만 하기[](source:skm-anti) |
| 3 | 제한된 로컬 근거로 모자랄 때 라이브·공유 환경에서 시험하기[](source:skm-anti) |
| 4 | 소스에 없는 provider·proxy·브라우저·identity·배포 동작을 짐작하기[](source:skm-anti) |
| 5 | 같은 주체의 의도된 권한이나 자기 영향을 경계 넘는 결과로 다루기[](source:skm-anti) |
| 6 | 관찰한 것보다 강한 parser·런타임 효과를 보고하기[](source:skm-anti) |
| 7 | 중복 제거와 검증이 불가능한 서술만 있는 hunter 결과 내기[](source:skm-anti) |
| 8 | 이월한 같은 소스의 이전 확정 기록을 다시 보고하거나 사냥을 고정하는 예시로 쓰기[](source:skm-anti) |
| 9 | `needs_validation` 기록에 심각도 주기[](source:skm-anti) |
| 10 | 독립 검증 전에 보고서를 쓰거나 서술과 JSON이 어긋나게 두기[](source:skm-anti) |

이 스킬을 쓰지 말아야 하거나 전체 감사로 키우면 안 되는 경우는 다음과 같다.

- 요청이 안내와 전체 감사 중 어느 쪽인지 모호하면 질문 없이 전체 워크플로를 시작하지 않는다.[](source:skm-modes)
- 샌드박스 통제를 하나라도 못 걸면 대상 코드를 실행하지 않고 소스 검토와 검증 계획까지만 한다.[](source:skm-safety)
- 결정적 사실이 라이브 배포나 공유 인프라에 있으면 거기를 조사하지 않고 `needs_validation`으로 넘긴다.[](source:skm-safety)[](source:skm-visibility)
- 대상 소스를 고쳐 달라는 요청에도 이 스킬은 수정안을 기술만 하고 고치지 않는다.[](source:skm-fix)
- 판정: 보안 체크리스트 점검이나 defense-in-depth 권고만 원하는 요청은 이 스킬의 목적(실제 신뢰 경계를 넘는 취약점)과 맞지 않는다.[](source:skm-purpose)[](source:skm-anti)

보안과 무관한 작업 유형을 이 스킬이 제외한다는 명시 목록은 원문에 명시 없음이다.

## 무엇이 만들어지고 검증기는 무엇을 보나 {#outputs span=12}

전체 감사는 출력 폴더에 공유 파일 일곱 개와 agent별 폴더를 만든다. 공유 파일은 parent만 쓴다.[](source:skm-isolation)

| 파일 | 만드는 시점 | 담는 것 |
| --- | --- | --- |
| `run-metadata.json` | 위임 전 | `run_id`, `repo`, `target`, `source_ref`, `profile`, `scope_paths`, `budget`, 실행 정책, 선택한 companion, 이전 실행 경로, `run_status`[](source:skm-repro) |
| `architecture.md` | Phase 1 | 제품·주체·진입면·신뢰 경계·companion 선택 요약. 약 1,000단어 상한[](source:rec-arch) |
| `coverage-ledger.json` | Phase 1에서 시딩 후 parent가 갱신 | 조사 범위의 유일한 주장. 단위마다 상태·검사·fingerprint를 기록[](source:rec-ledger)[](source:rec-state) |
| `findings.json` | Phase 4 | 독립 판정을 받은 `confirmed`·`needs_validation`·`rejected` 기록, fingerprint 순[](source:val-p4) |
| `REPORT.md` | Phase 6 | 프로필·범위·커버리지·`confirmed` 표와 상세·`NEEDS VALIDATION` 표[](source:val-p6) |
| `FINDINGS-DETAIL.md` | Phase 6 | `medium` 이상 `confirmed`의 전체 trace와 재현[](source:val-p6) |
| `NEEDS-VALIDATION.md` | Phase 6 | 해결되지 않은 기록마다 trace·막힌 이유·해결 계획[](source:val-p6) |
| `agents/<agent-id>/` | agent 배정 전 | `scratch/`는 agent가 쓰고 `artifacts/`는 parent의 승격 코드만 쓴다[](source:skm-isolation) |

`confirmed`·`needs_validation`·`rejected`는 같은 JSON 배열 안의 세 분기이고 쓰는 필드가 서로 다르다.

| 항목 | `confirmed` | `needs_validation` | `rejected` |
| --- | --- | --- | --- |
| 공통 필드 | `fingerprint`, `title`, `description`, `trace`, `evidence`[](source:sch-conf) | 같음[](source:sch-nv) | 같음[](source:sch-rej) |
| 고유 필드 | `root_cause`, `intended_behavior`, `conditions`, `execution`, `remediation`, `severity`, `confidence`[](source:sch-conf) | `claimed_root_cause`, `blockers`, `validation_plan`[](source:sch-nv) | `claimed_root_cause`, `reason`[](source:sch-rej) |
| 심각도 | 있다. `likelihood`·`impact`·`overall_severity`를 다섯 단계 값으로 적는다[](source:sch-conf) | 없다[](source:vf-semantic) | 없다[](source:vf-semantic) |
| 검증 계획 | 해당 없음 | `local`·`deployment` 중 하나 이상[](source:vf-semantic) | 해당 없음 |

스키마 모양은 이렇다. `trace` 항목의 `kind`는 `entrypoint`·`propagation`·`sink`이고 `execution`은 `attacker_perspective`, `payloads`, `instructions`, `observed_result`를 모두 요구한다. `conditions`의 `kind`는 아홉 가지(`authentication_level`, `authorization_role`, `user_interaction`, `system_configuration`, `network_routing`, `environmental_dependency`, `data_state`, `timing_dependency`, `third_party_dependency`) 중 하나다. `confidence.score`는 `low`·`medium`·`high`이고 모든 분기에서 `additionalProperties`가 `false`다.[](source:sch-conf)[](source:sch-nv)[](source:sch-rej)

검증기 둘은 parent가 돌리는 CLI 스크립트다. 인자는 JSON 파일 경로 하나이고 통과하면 `PASS`와 개수를 출력한다.[](source:vf-run)[](source:vl-run)

`validate-findings.cjs`는 `report-schema.json`을 같은 폴더에서 읽어 구조를 검사한 뒤 의미를 검사한다. 입력은 symlink가 아닌 regular file이어야 하고 UTF-8이어야 하며 no-follow·nonblocking으로 연다.[](source:vf-read)[](source:vf-run) 의미 검사 항목은 다음과 같다.[](source:vf-semantic)

- fingerprint 중복 금지와 사전순 정렬
- `file`·`file_name`이 저장소 상대의 안전한 경로인지(절대 경로, `..`, `:`, Windows 예약 이름, 제어 문자 거부)
- `trace`의 `entrypoint`→`propagation`→`sink` 모양(한 줄이면 `entrypoint` 또는 `sink`)
- 분기별 금지 필드
- `overall_severity`가 `impact`를 넘지 않는지

`validate-coverage-ledger.cjs`는 단위마다 다음을 검사한다.

- 필수 필드 열아홉 개가 모두 있는지[](source:vl-fields)
- `canonical_refs`로 `coverage_id`를 다시 계산해 일치하는지, 단위가 `coverage_id` 사전순인지, 같은 ID나 같은 의미 조합이 중복되지 않는지[](source:vl-id)[](source:vl-doc)
- 상태 여덟 가지마다 `agent_id`, `reviewed_paths`, `local_checks`, `result_fingerprints`, `unresolved`가 비어 있거나 차 있어야 하는 조건. 이 조건은 정찰 문서의 상태 표와 같다.[](source:vl-state)[](source:rec-state)
- `local` 검사는 `agents/<검사의 agent_id>/artifacts/` 아래 경로여야 하고 `source` 검사는 `artifact`가 `null`이어야 한다.[](source:vl-checks)
- 재배정 기록은 `wave`가 엄격히 증가하고 소유자와 artifact가 이전 시도와 겹치지 않는지 본다.[](source:vl-attempts)

판정: 코드에는 그 artifact 경로의 파일이 실제로 있는지 여는 줄이 없어서 경로 문자열의 형식만 본다.[](source:vl-checks)

| 검증기 | 입력 상한 | 항목 상한 | 중첩 깊이 | 오류 출력 |
| --- | --- | --- | --- | --- |
| `validate-findings.cjs` | 5 MiB[](source:vf-limits) | 배열마다 1,000개[](source:vf-limits) | 64[](source:vf-limits) | 100개[](source:vf-limits) |
| `validate-coverage-ledger.cjs` | 5 MiB[](source:vl-limits) | unit 10,000개, 중첩 컬렉션 1,000개, 전체 값 500,000개[](source:vl-limits) | 64[](source:vl-limits) | 100개[](source:vl-limits) |

두 검증기에는 각각 시험 파일이 있다. `validate-findings.test.cjs`는 스키마가 세 분기를 가진 최상위 배열이라는 점과, 두 검증기가 같은 정규식·상한·경로 판정을 쓰는지를 확인하는 시험을 담는다.[](source:vft-branches)[](source:vft-align) `validate-coverage-ledger.test.cjs`는 상태 불변식과 재배정 시 소유자 재사용 금지를 시험한다.[](source:vlt-state)[](source:vlt-reassign) 이 시험들은 실행하지 않았으므로 통과 여부는 확인하지 않았다.

## 이 분석의 범위와 한계 {#audit span=12}

`cloudflare/security-audit/`의 텍스트 원본 파일 20개를 처음부터 끝까지 모두 읽었다. 부분 읽음 파일과 바이너리 파일은 없다. 번역본은 이 폴더에 없다. 코드(`.cjs`)는 읽기만 했고 실행하지 않았으며 시험도 돌리지 않았다.

이 폴더와 `verification-skills/cloudflare/security-audit/`의 원본 20개는 내용이 같다(`diff -rq`로 확인했고, 그쪽에만 있는 파일은 번역본 `*-KO.md` 15개뿐이다). 분석하는 동안 대상 파일은 바뀌지 않았다.

| 파일 | 바이트 |
| --- | --- |
| `SKILL.md` | 22,026 |
| `RECONNAISSANCE.md` | 15,902 |
| `HUNTING.md` | 22,446 |
| `VALIDATION-AND-REPORTING.md` | 17,843 |
| `ATTACK-CLASSES.md` | 15,695 |
| `AI-AND-LLM.md` | 10,617 |
| `CLIENT-SIDE.md` | 8,594 |
| `CLOUD-AND-DEPLOYMENT.md` | 8,291 |
| `DATA-ISOLATION-AND-LIFECYCLE.md` | 7,798 |
| `DESKTOP-MOBILE-AND-LOCAL-IPC.md` | 8,739 |
| `MEMORY-SAFETY-AND-BINARY.md` | 10,513 |
| `PROTOCOLS-RPC-AND-MESSAGING.md` | 7,483 |
| `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md` | 7,476 |
| `SUPPLY-CHAIN-AND-RELEASE.md` | 7,258 |
| `WEB-PROTOCOL-AND-AUTH.md` | 12,300 |
| `report-schema.json` | 14,494 |
| `validate-findings.cjs` | 28,806 |
| `validate-findings.test.cjs` | 26,384 |
| `validate-coverage-ledger.cjs` | 33,522 |
| `validate-coverage-ledger.test.cjs` | 28,483 |

@callout level=open-question title="확인하지 못한 것"
| 이 페이지는 지시문이 말하는 동작을 정리한 것이고, 에이전트가 실제로 그렇게 움직이는지는 관찰하지 않았다. 이 스킬로 돌린 감사 결과물(`findings.json` 등)은 이 저장소에 없어서 확인하지 못했다. |
| 두 검증기와 시험 파일은 실행하지 않아서 시험 통과 여부와 실제 출력 형식은 확인하지 않았다. 정찰 문서가 말하는 "5 MiB 상한이 현실적인 unit 2,000~5,000개에 해당한다"는 수치도 검증하지 않았다.[](source:rec-state) |
| 예산이 설정되지 않았을 때 예산 통과 조건이 어떻게 동작하는지, `research`·`general` agent가 플랫폼의 어떤 구체적 기능에 대응하는지, 보강 권고 노트를 ledger의 어느 필드에 보관하는지는 원문에 명시 없음이다.[](source:skm-budget)[](source:skm-terms)[](source:hun-consol) |
| `findings.json`의 fingerprint와 ledger를 서로 대조하는 검사가 어디에 있는지는 원문과 코드에서 찾지 못했다. 이는 판정이며 다른 경로에서 대조할 가능성은 배제하지 않는다.[](source:val-p4)[](source:vf-run)[](source:vl-run) |
