# security-audit 스킬은 에이전트를 어떻게 바꾸나 {#security-audit-skill}

`security-audit` 스킬을 쓰면 에이전트는 보안 문제를 "실제 신뢰 경계를 넘는가"로 먼저 거른다. 평소에는 필요한 부분만 쓰는 안내 모드로 동작한다. 명시적인 전체 감사 요청이 있을 때만 6단계 워크플로를 돌려 보고서 파일을 만든다.[](source:skm-purpose)[](source:skm-modes)

- 스킬을 불러온 것만으로는 전체 워크플로나 파일 생성이 허락되지 않는다. 감사·침투 테스트, 전체·종합 리뷰, 보고서 산출물 요청일 때만 전체 감사 모드가 된다.[](source:skm-modes)
- 대상 코드는 읽기만 한다. 대상이 통제하는 실행은 네트워크·환경·쓰기·자원을 모두 막은 OS 샌드박스에서만 한다. 하나라도 못 막으면 실행하지 않는다.[](source:skm-safety)
- 후보는 확정이 아니다. 사냥하지 않은 검증 담당이 다시 확인해야 `confirmed`가 되고, 심각도는 그때만 붙는다.[](source:skm-priority)[](source:val-p3)
- 조사 범위는 결정적인 장부로 센다. 한 번의 실행이 대상을 다 훑었다고 말하지 않는다.[](source:skm-coverage)

@answer scope="cloudflare/security-audit · 원본 21개 파일 · 커밋 5760176 · 지시상 동작"
@meta locale=ko
@source skm-fm title="cloudflare/security-audit/SKILL.md · 22026B · 본문(frontmatter)" path=cloudflare/security-audit/SKILL.md lines=1:4
@source skm-purpose title="SKILL.md · 목적" path=cloudflare/security-audit/SKILL.md lines=6:8
@source skm-modes title="SKILL.md · Operating modes" path=cloudflare/security-audit/SKILL.md lines=10:17
@source skm-terms title="SKILL.md · Platform terminology" path=cloudflare/security-audit/SKILL.md lines=19:29
@source skm-safety title="SKILL.md · Universal execution safety" path=cloudflare/security-audit/SKILL.md lines=31:42
@source skm-setup title="SKILL.md · Full audit setup" path=cloudflare/security-audit/SKILL.md lines=44:52
@source skm-isolation title="SKILL.md · Write isolation" path=cloudflare/security-audit/SKILL.md lines=54:66
@source skm-promote title="SKILL.md · 승격 절차" path=cloudflare/security-audit/SKILL.md lines=68:82
@source skm-repro title="SKILL.md · 재현 기록과 run-metadata" path=cloudflare/security-audit/SKILL.md lines=84:86
@source skm-coverage title="SKILL.md · Coverage and prior runs" path=cloudflare/security-audit/SKILL.md lines=88:105
@source skm-profiles title="SKILL.md · Run profiles and scope" path=cloudflare/security-audit/SKILL.md lines=107:117
@source skm-budget title="SKILL.md · Cost budget" path=cloudflare/security-audit/SKILL.md lines=119:134
@source skm-boundary title="SKILL.md · Require a boundary and result" path=cloudflare/security-audit/SKILL.md lines=138:140
@source skm-local title="SKILL.md · Use bounded local evidence" path=cloudflare/security-audit/SKILL.md lines=142:144
@source skm-visibility title="SKILL.md · Respect source visibility" path=cloudflare/security-audit/SKILL.md lines=146:148
@source skm-priority title="SKILL.md · Separate priority from certainty" path=cloudflare/security-audit/SKILL.md lines=150:162
@source skm-fix title="SKILL.md · Smallest effective source fix" path=cloudflare/security-audit/SKILL.md lines=164:166
@source skm-workflow title="SKILL.md · Full audit workflow" path=cloudflare/security-audit/SKILL.md lines=168:179
@source skm-anti title="SKILL.md · Anti-patterns" path=cloudflare/security-audit/SKILL.md lines=181:192
@source rec-agents title="cloudflare/security-audit/RECONNAISSANCE.md · 15902B · Phase 1 정찰 에이전트" path=cloudflare/security-audit/RECONNAISSANCE.md lines=3:57
@source rec-prior title="RECONNAISSANCE.md · Prior-run input" path=cloudflare/security-audit/RECONNAISSANCE.md lines=59:71
@source rec-arch title="RECONNAISSANCE.md · architecture.md와 보조 문서 선택" path=cloudflare/security-audit/RECONNAISSANCE.md lines=73:88
@source rec-ledger title="RECONNAISSANCE.md · 결정적 범위 장부" path=cloudflare/security-audit/RECONNAISSANCE.md lines=90:139
@source rec-state title="RECONNAISSANCE.md · 상태표와 검증기 실행" path=cloudflare/security-audit/RECONNAISSANCE.md lines=141:156
@source hunt-assign title="cloudflare/security-audit/HUNTING.md · 22446B · Phase 2 배정" path=cloudflare/security-audit/HUNTING.md lines=3:9
@source hunt-prompt title="HUNTING.md · 사냥 담당 프롬프트 구성" path=cloudflare/security-audit/HUNTING.md lines=11:25
@source hunt-method title="HUNTING.md · Core hunting method" path=cloudflare/security-audit/HUNTING.md lines=27:97
@source hunt-promote title="HUNTING.md · 승격 절차 블록" path=cloudflare/security-audit/HUNTING.md lines=99:136
@source hunt-gate title="HUNTING.md · Candidate gate" path=cloudflare/security-audit/HUNTING.md lines=138:157
@source hunt-local title="HUNTING.md · Local validation boundaries" path=cloudflare/security-audit/HUNTING.md lines=159:166
@source hunt-result title="HUNTING.md · Structured hunter result" path=cloudflare/security-audit/HUNTING.md lines=168:213
@source hunt-consolidate title="HUNTING.md · 부모의 통합과 장부 갱신" path=cloudflare/security-audit/HUNTING.md lines=215:219
@source hunt-critic title="HUNTING.md · Coverage-critic waves" path=cloudflare/security-audit/HUNTING.md lines=221:251
@source val-p3 title="cloudflare/security-audit/VALIDATION-AND-REPORTING.md · 17843B · Phase 3" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=3:7
@source val-verifier title="VALIDATION-AND-REPORTING.md · 후보 검증 프롬프트" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=9:46
@source val-decide title="VALIDATION-AND-REPORTING.md · 판정 규칙과 예산" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=87:93
@source val-p4 title="VALIDATION-AND-REPORTING.md · Phase 4" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=95:118
@source val-p5 title="VALIDATION-AND-REPORTING.md · Phase 5" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=120:149
@source val-p6 title="VALIDATION-AND-REPORTING.md · Phase 6 보고서" path=cloudflare/security-audit/VALIDATION-AND-REPORTING.md lines=151:186
@source atk-select title="cloudflare/security-audit/ATTACK-CLASSES.md · 15695B · 보조 문서 안내" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=1:27
@source atk-classes title="ATTACK-CLASSES.md · 일반 공격 유형 9개" path=cloudflare/security-audit/ATTACK-CLASSES.md lines=29:130
@source dom-ai title="cloudflare/security-audit/AI-AND-LLM.md · 10617B · 도메인 문서" path=cloudflare/security-audit/AI-AND-LLM.md lines=3:18
@source dom-web title="cloudflare/security-audit/WEB-PROTOCOL-AND-AUTH.md · 12300B · 도메인 문서" path=cloudflare/security-audit/WEB-PROTOCOL-AND-AUTH.md lines=3:17
@source dom-client title="cloudflare/security-audit/CLIENT-SIDE.md · 8594B · 도메인 문서" path=cloudflare/security-audit/CLIENT-SIDE.md lines=3:17
@source dom-mem title="cloudflare/security-audit/MEMORY-SAFETY-AND-BINARY.md · 10513B · 도메인 문서" path=cloudflare/security-audit/MEMORY-SAFETY-AND-BINARY.md lines=3:17
@source dom-supply title="cloudflare/security-audit/SUPPLY-CHAIN-AND-RELEASE.md · 7258B · 도메인 문서" path=cloudflare/security-audit/SUPPLY-CHAIN-AND-RELEASE.md lines=3:17
@source dom-cloud title="cloudflare/security-audit/CLOUD-AND-DEPLOYMENT.md · 8291B · 도메인 문서" path=cloudflare/security-audit/CLOUD-AND-DEPLOYMENT.md lines=3:17
@source dom-proto title="cloudflare/security-audit/PROTOCOLS-RPC-AND-MESSAGING.md · 7483B · 도메인 문서" path=cloudflare/security-audit/PROTOCOLS-RPC-AND-MESSAGING.md lines=3:17
@source dom-res title="cloudflare/security-audit/RESOURCE-EXHAUSTION-AND-AVAILABILITY.md · 7476B · 도메인 문서" path=cloudflare/security-audit/RESOURCE-EXHAUSTION-AND-AVAILABILITY.md lines=3:17
@source dom-data title="cloudflare/security-audit/DATA-ISOLATION-AND-LIFECYCLE.md · 7798B · 도메인 문서" path=cloudflare/security-audit/DATA-ISOLATION-AND-LIFECYCLE.md lines=3:17
@source dom-desk title="cloudflare/security-audit/DESKTOP-MOBILE-AND-LOCAL-IPC.md · 8739B · 도메인 문서" path=cloudflare/security-audit/DESKTOP-MOBILE-AND-LOCAL-IPC.md lines=3:17
@source schema title="cloudflare/security-audit/report-schema.json · 14494B · findings.json 계약" path=cloudflare/security-audit/report-schema.json lines=1:9
@source schema-c title="report-schema.json · confirmed 필수 필드" path=cloudflare/security-audit/report-schema.json lines=243:244
@source schema-nv title="report-schema.json · needs_validation 필수 필드" path=cloudflare/security-audit/report-schema.json lines=360:361
@source schema-r title="report-schema.json · rejected 필수 필드" path=cloudflare/security-audit/report-schema.json lines=456:457
@source vf-limits title="cloudflare/security-audit/validate-findings.cjs · 28806B · 한도" path=cloudflare/security-audit/validate-findings.cjs lines=42:49
@source vf-path title="validate-findings.cjs · 안전한 상대 경로" path=cloudflare/security-audit/validate-findings.cjs lines=473:483
@source vf-semantic title="validate-findings.cjs · 의미 검사" path=cloudflare/security-audit/validate-findings.cjs lines=485:583
@source vf-read title="validate-findings.cjs · 안전한 파일 읽기" path=cloudflare/security-audit/validate-findings.cjs lines=604:649
@source vf-run title="validate-findings.cjs · 실행과 종료 코드" path=cloudflare/security-audit/validate-findings.cjs lines=703:757
@source vl-limits title="cloudflare/security-audit/validate-coverage-ledger.cjs · 33522B · 한도" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=12:21
@source vl-fields title="validate-coverage-ledger.cjs · 필수 필드와 상태값" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=26:81
@source vl-checks title="validate-coverage-ledger.cjs · 확인 기록 검사" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=421:469
@source vl-state title="validate-coverage-ledger.cjs · 상태 불변식" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=518:566
@source vl-attempts title="validate-coverage-ledger.cjs · 재배정 기록 검사" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=568:644
@source vl-unit title="validate-coverage-ledger.cjs · 단위 검사" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=646:719
@source vl-doc title="validate-coverage-ledger.cjs · 문서 검사와 실행" path=cloudflare/security-audit/validate-coverage-ledger.cjs lines=761:853
@source vft-accept title="cloudflare/security-audit/validate-findings.test.cjs · 26384B · 정상 입력" path=cloudflare/security-audit/validate-findings.test.cjs lines=164:179
@source vft-reject title="validate-findings.test.cjs · 정렬·심각도·경로 거부" path=cloudflare/security-audit/validate-findings.test.cjs lines=305:361
@source vft-cli title="validate-findings.test.cjs · FIFO·심볼릭 링크 거부" path=cloudflare/security-audit/validate-findings.test.cjs lines=465:505
@source vft-align title="validate-findings.test.cjs · 두 검증기 규칙 일치" path=cloudflare/security-audit/validate-findings.test.cjs lines=574:652
@source vlt-ids title="cloudflare/security-audit/validate-coverage-ledger.test.cjs · 28483B · ID 규칙" path=cloudflare/security-audit/validate-coverage-ledger.test.cjs lines=201:249
@source vlt-artifacts title="validate-coverage-ledger.test.cjs · 산출물 소유" path=cloudflare/security-audit/validate-coverage-ledger.test.cjs lines=262:318
@source vlt-state title="validate-coverage-ledger.test.cjs · 상태별 근거" path=cloudflare/security-audit/validate-coverage-ledger.test.cjs lines=330:405
@source vlt-attempts title="validate-coverage-ledger.test.cjs · 재배정" path=cloudflare/security-audit/validate-coverage-ledger.test.cjs lines=407:491
@source vlt-limits title="validate-coverage-ledger.test.cjs · 구조 한도" path=cloudflare/security-audit/validate-coverage-ledger.test.cjs lines=169:193
@source lock title="cloudflare/skills-lock.json · 291B · 설치 기록" path=cloudflare/skills-lock.json lines=1:11

## 언제 켜지고, 어떤 모드로 동작하나 {#trigger}

@code source=skm-fm language=yaml

머리말(frontmatter)에는 `name`과 `description`만 있고 호출 제한 필드가 없다.[](source:skm-fm) 판정: 모델이 `description`을 참고해 스스로 켤 수 있다. `description`은 판단용 설명이지, 특정 단어가 있으면 켜지는 목록이 아니다.

| 모드 | 언제 | 하는 일 | 하지 않는 일 |
| --- | --- | --- | --- |
| 안내 모드(기본) | 보안 질문, 집중 리뷰, 방법론, 분류(triage), 특정 지적 조사 | 스킬에서 관련 부분만 쓴다. 쓸모 있으면 집중 에이전트를 띄우고, 결과는 현재 작업으로 돌려받는다 | 6단계 자동 실행, 출력 폴더 생성, 감사 산출물 쓰기 {bad:금지} |
| 전체 감사 모드 | 코드베이스 감사·침투 테스트를 **명시적으로** 요청, 전체·종합·처음부터 끝까지(end-to-end) 보안 리뷰 요청, 보고서 산출물 요청 | 6단계를 모두 돌리고 정해진 파일을 쓴다 {good:전체 실행} | - |

두 모드 중 어느 쪽인지 애매하면, 파일을 만들거나 전체 워크플로를 시작하기 전에 초점을 좁힌 질문 하나를 한다.[](source:skm-modes) 무엇이 "애매한" 요청인지 판단 기준은 원문에 명시 없음.

**플랫폼 용어.** 이 스킬은 특정 에이전트 제품에 묶이지 않는다. 같은 역할·쓰기 격리·프롬프트·독립성 경계를 지키면 플랫폼의 동등한 기능을 쓴다.[](source:skm-terms)

| 원문 용어 | 뜻 |
| --- | --- |
| Parent | 실행을 조율하고 공유 상태를 소유하는 에이전트(이하 부모) |
| Task tool | 플랫폼의 위임·서브에이전트 기능. 특정 제품의 도구 이름이 아니다 |
| `research` 에이전트 | 집중 소스 탐색과 사실 확인을 맡는 위임 에이전트 |
| `general` 에이전트 | 넓은 조사와 제한된 국소 실행을 맡는 위임 에이전트 |
| `subagent_type:` | 제목에 붙어, 위 두 역할 중 누가 그 일을 하는지 표시한다 |

## 어떤 실행 안전 규칙을 늘 지키나 {#safety}

이 규칙은 두 모드 모두에 적용된다. 소스는 읽기만 한다.[](source:skm-safety) 대상이 통제하는 빌드, 테스트, 프로세스, 브라우저, 에뮬레이터, 퍼저, 픽스처 처리는 아래 네 가지를 **모두** 강제하는 OS 샌드박스에서만 돌린다.

| 샌드박스 통제 | 조건 |
| --- | --- |
| 네트워크 | 외부 네트워크 없음. 로컬 클라이언트·서버 통신이 필요하면 격리된 루프백 네임스페이스만 |
| 환경 | 빈 환경에서 시작해 허용 목록의 안전한 값만 채운다. `HOME`, 임시 폴더, 캐시는 작업 폴더 안에 둔다 |
| 파일 쓰기 | 대상과 도구 체인은 읽기 전용. 대상 프로세스는 배정된 `scratch/` 안에만 쓴다 |
| 자원 | CPU, 메모리, 프로세스 수, 파일 크기, 디스크, 벽시계 시간에 낮은 한도를 명시한다 |

@callout level=warning title="통제를 하나라도 못 걸면 실행하지 않는다"
네 통제 중 하나라도 강제할 수 없으면 대상 코드를 실행하지 않는다. 빠진 샌드박스 기능을 `needs_validation`의 막힌 이유(blocker)로 보고하고, 안전한 검증 계획을 준다.[](source:skm-safety)

금지 목록은 다음과 같다.[](source:skm-safety)

- 의존성을 설치하거나 빌드가 내려받게 두지 않는다. 이미 로컬에 있는 도구만 쓴다.
- 배포된 엔드포인트, 외부 서비스, 공유 인프라, 운영 계정, 다른 사용자 데이터, 라이브 제어 평면을 건드리지 않는다.
- 라이브·공유 프로세스로 가용성을 시험하지 않는다. 산출물 게시, 릴리스 변경, 유료 API 사용도 하지 않는다.
- 결함을 입증하는 최소 국소 효과에서 멈춘다. 결정적 사실이 소스나 샌드박스 밖에 있으면 검증 필요로 보고한다.
- 가짜 주체·픽스처·비밀값만 쓴다. 안내 모드에서는 대상이 만든 파일을 남기지 않는다.

에이전트는 빌드가 소스 옆에 써야 할 때 `scratch/`에 버릴 소스 사본을 만들 수 있다.[](source:skm-safety) 대상 코드에는 자기 `scratch/` 외의 출력 폴더, 다른 에이전트 폴더, 호스트 홈, 자격 증명, 소켓, 공유 서비스를 노출하지 않는다.

## 전체 감사는 어디에 무엇을 쓰나 {#isolation}

전체 감사 모드는 정찰 전에 다섯 값을 정한다.[](source:skm-setup)

| 값 | 정하는 방법 |
| --- | --- |
| 스킬 폴더 | 이 `SKILL.md`가 있는 절대 경로 |
| 대상 | 검토할 저장소 루트의 절대 경로 |
| 저장소 이름 | 폴더나 로컬 Git 원격에서 얻은 안정된 식별자 |
| 출력 폴더 | 대상 밖의 새 폴더. 기본값 `~/security-audit-skill/<repo-name>/run-<N>`, `<N>`은 아직 안 쓴 다음 정수 |
| 소스 기준 | 검토한 커밋과 작업 트리 변경 여부. 검토하지 않은 생성·수정 파일을 다른 리비전으로 취급하지 않는다 |

대상 안의 출력 폴더는 사용자가 명시적으로 골랐고, 부모가 그 폴더 전체가 버전 관리에서 무시되는지 확인했을 때만 쓴다. 아니면 멈추고 외부 경로를 요청한다.[](source:skm-setup)

@tree id=run-dir title="출력 폴더 run-N"
| root | run-N | - |
| meta | run-metadata.json | root |
| arch | architecture.md | root |
| ledger | coverage-ledger.json | root |
| findings | findings.json | root |
| rep | REPORT.md | root |
| det | FINDINGS-DETAIL.md | root |
| nv | NEEDS-VALIDATION.md | root |
| agents | agents | root |
| aid | agent-id | agents |
| scratch | scratch | aid |
| art | artifacts | aid |

부모만 위 일곱 공유 파일을 만들고 쓴다.[](source:skm-isolation) 사냥 담당(hunter)과 검증 담당(verifier)은 각자 `<output-dir>/agents/<agent-id>/` 아래 `scratch/`와 `artifacts/`를 받는다.

- 에이전트와 대상 프로세스는 `scratch/`에만 쓴다. `artifacts/`는 부모 소유이고, 샌드박스에 노출하지 않는다.[](source:skm-isolation)
- 에이전트 ID는 `^[a-z0-9][a-z0-9_-]{0,63}$`에 맞아야 한다. `con`, `prn`, `aux`, `nul`, `com1`~`com9`, `lpt1`~`lpt9` 같은 Windows 장치 이름은 쓸 수 없다. 소문자만 써서 대소문자 충돌을 막는다.
- 에이전트는 공유 파일, 대상 소스, 보관 산출물, 다른 에이전트 폴더를 바꿀 수 없다. `/tmp`나 호스트 홈을 대체 쓰기 장소로 쓰지 않는다.

**승격(promotion) 절차.** `scratch/` 파일을 `artifacts/`로 옮기는 일은 신뢰된 부모 쪽 코드만 한다.[](source:skm-promote)

- 실행 전: 부모가 두 폴더의 디렉터리 서술자를 열어 둔다. 허용 파일 목록과 파일별·누적 바이트 한도도 기록한다.
- 서술자는 에이전트나 샌드박스에 넘기지 않는다.
- 샌드박스와 모든 프로세스가 끝난 뒤, 파일마다 아래 11단계로 따로 옮긴다.

@list ordered=true
| 선언된 상대 경로를 검사한다. 절대 경로, 빈 값, `.`, `..`, 심볼릭 링크 구성 요소는 거부한다. |
| 보관해 둔 `scratch` 서술자에서 링크를 따라가지 않는 상대 연산으로 상위 폴더를 하나씩 걷는다. 경로로 다시 열지 않는다. |
| 마지막 파일을 링크 미추적·비차단으로 연다. |
| `fstat`으로 일반 파일인지, 링크 수가 정확히 1인지, 파일별·누적 한도 안인지 확인한다. |
| 그 서술자에서 읽는 동안에도 한도를 다시 강제한다. |
| 확인한 크기만큼만 복사하고 `fstat`을 다시 한다. 정체·종류·링크 수·크기가 바뀌었으면 거부한다. |
| 목적지도 `artifacts` 서술자에서 링크 미추적으로 걷는다. 있는 구성 요소는 진짜 폴더여야 하고, 없는 폴더는 배타적으로 만든 뒤 다시 확인한다. |
| 마지막 파일을 배타적으로 만들고 일반 파일·링크 수 1을 확인한 뒤, 확인된 원본 서술자에서 복사한다. |
| 비POSIX 시스템에서는 같은 수준으로 경쟁에 안전한 API 함수를 쓴다. |
| `scratch`를 재귀 복사·글롭하지 않는다. 압축을 `artifacts`에 풀지 않는다. 심볼릭 링크, FIFO, 소켓, 장치, 폴더, 하드 링크, 변하는 파일, 한도 초과 파일은 열거나 승격하지 않는다. |
| 검사를 못 하거나 실패하면 그 항목을 버린다. 결정적 근거였다면 정확한 승격 막힘을 담아 `needs_validation`으로 남긴다. |

이 절차는 `HUNTING.md`와 `VALIDATION-AND-REPORTING.md`에 같은 코드 블록으로 들어 있다. 두 블록은 글자까지 같다(분석자가 `diff`로 확인).[](source:hunt-promote)[](source:val-verifier)

재현한 확인에는 명령, 정확한 입력, 샌드박스 한도, 허용 목록의 환경 변수 이름과 안전한 값만 기록한다. 주변 환경, 상속 변수, 자격 증명, 인증 상태, 관계없는 호스트 경로는 남기지 않는다.[](source:skm-repro) 위임 전에 부모는 `run-metadata.json`을 쓴다. 최소 필드는 `run_id`, `repo`, `target`, `source_ref`, `profile`, `scope_paths`, `budget`(없으면 null), `execution_policy: "sandboxed-source-and-local-only"`, 고른 보조 문서, 이전 실행 경로, 공유 파일 소유자, `run_status: "in_progress"`다.

## 전체 감사는 어떻게 계획하나 {#planning}

이 절의 범위·이전 실행·프로필·예산 규칙은 전체 감사 모드에만 적용된다.[](source:skm-coverage) 한 번의 실행으로 완전한 조사는 없다는 것이 출발점이다. 사냥 전에 결정적인 범위 계획을 세우고, 에이전트 결과가 올 때마다 갱신한다. 장부는 부모만 고친다.

**이전 실행이 있으면** 호환되는 `coverage-ledger.json`과 `findings.json`을 모두 읽은 뒤 계획한다.[](source:skm-coverage)[](source:rec-prior)

| 이전 기록 | 이번 실행에서 하는 일 |
| --- | --- |
| 출처가 그대로인 `confirmed` | 관련 소스·조건이 그대로이고 근거가 현재 계약을 채울 때만 후보로 가져온다. 지문(fingerprint)을 유지하고 `planned` 단위에 잇는다. 그 근본 원인만 사냥에서 뺀다. Phase 3 검증 담당이 다시 확인하며 단위 소유자가 된다 |
| 소스가 바뀐 `confirmed` | 재검증 단위를 새로 만든다. 사냥 제외 목록에 넣지 않는다. 현재 독립 검증이 다시 입증할 때만 확정으로 남는다 |
| `needs_validation`, `deferred`, `blocked`, `out_of_scope`, 소스가 바뀐 단위 | 모두 이번 작업으로 만든다. 여전히 외부 사실이 필요한 `needs_validation`은 현재 소스 추적을 확인한 뒤에만 가져온다 |
| 출처가 그대로인 `covered` 단위 | 우선순위 참고는 되지만 현재 장부에 그대로 보인다 |
| `rejected` | 바뀌지 않은 실패 주장만 막는다. 그 단위의 조사는 막지 않는다 |
| 이전 `quick`·범위 한정 장부 | 기록된 근거와 빈틈만 쓴다. "나머지는 괜찮다"는 뜻으로 읽지 않는다 |

이전 장부가 없으면 최종 범위 진술에 그렇게 적는다. 장부가 없거나 호환되지 않는 것을 빈 범위로 취급하지 않는다.[](source:skm-coverage)[](source:rec-prior)

**실행 프로필.** 요청에서 고르거나, 대상 크기와 위험도로 하나를 제안한다. 기본값은 `standard`다. `run-metadata.json`에 기록하고 보고서에 밝힌다.[](source:skm-profiles)

| 프로필 | 장부 단위 | 사냥·비평 | 검증 |
| --- | --- | --- | --- |
| `quick` | 표면 × 경계 × 공격 유형으로 거칠게. 하위 시스템은 고정값 `profile/quick/all-in-scope-subsystems` | 사냥 차수 정확히 1번, 마지막 범위 비평 정확히 1번. 추가 차수 없이 비평이 찾은 일은 `deferred` | 후보마다 새 검증 담당 하나가 후보 검증과 최종 기록 검증을 함께 한다 |
| `standard` | 원문 그대로 | 빠진 곳이 없을 때까지 차수 반복 | 후보 검증과 최종 검증을 따로 |
| `deep` | 하위 시스템과 생애 주기 모드별로 쪼갠다 | 깨끗한 비평이 나올 때까지 | 두 검증을 각각 새 에이전트로. `prior_covered_same_source` 단위도 독립 2차 확인 |
| 범위 한정 실행 | 지정 경로, 하위 시스템 하나, 보조 도메인 하나, 두 소스 기준 사이 차이 | 범위 밖은 `out_of_scope`로 기록. `covered`로 적지 않는다 | 같음 |

`quick`과 범위 한정 실행은 스스로를 부분 조사로 밝혀야 한다. 프로필은 넓이와 중복만 바꾸고 증거 기준은 바꾸지 않는다. 후보 관문, 소스·국소 실행 경계, `needs_validation` 규율, 스키마 검증, 확정 기록의 독립 검증은 줄이지 않는다.[](source:skm-profiles)

**비용 예산.** 사용자가 정하거나, 큰 대상이면 부모가 제안한다. 단위는 모든 단계의 에이전트 호출 수 최댓값이다.[](source:skm-budget)

@facts
| 단위 1개 | 사냥 담당 배정 약 1회 |
| 살아남은 후보 1개 | 프로필에 따라 검증 담당 1~2회 |
| 정찰 전 예약 | 기본 정찰 4회 + 비평(`quick` 1회, `standard`·`deep` 2회) + 검증 최소 1회 |
| 판정: 최소 예산 | `quick` 4+1+1 = 6회, `standard`·`deep` 4+2+1 = 7회 |
| 검증 예약 | 예상 후보당 약 1~2회. 모르면 비평 예약 후 잔액의 30% |

정찰 에이전트를 띄우기 전에 엄격한 예산 관문을 먼저 적용한다. 추가 정찰은 호출마다 이 관문을 다시 통과해야 한다.[](source:skm-budget) 최소 예약도 못 대면 아무 에이전트도 띄우지 않고 예산 증액, 범위 축소, 프로필 변경을 묻는다. 요청이 그대로면 `run_status: "incomplete"`로 기록하고, 감사가 전혀 돌지 않았다고 보고한다.

@list ordered=true
| 정찰, 모든 차수 후 비평, 별도 마지막 깨끗한 비평(final-clean critic)을 모두 호출 수로 센다. |
| 사냥 전에 비평과 검증을 예약한다. `standard`·`deep`은 차수마다 차수 후 비평 1회와 별도 마지막 비평 1회를 예약한다. 두 예약에 사냥 담당을 배정하지 않는다. |
| 우선순위 순서로 사냥 담당을 배정한다. 차수 후 비평 예약은 그 차수 직후 쓰고, 마지막 비평과 검증 예약은 남겨 둔다. |
| 다음 차수 전에 새 차수 후 비평을 다시 예약한다. 비평과 검증 예약을 못 대면 그 차수 사냥을 띄우지 않고, 계획 단위를 `deferred`로 돌린다. |

1차 사냥 전에 정찰 전 추정을 갱신한다. 시드 단위 수, 필요한 사냥 담당 수, 필수 비평 호출, 검증 예약, 남은 예산으로 충분한지를 적는다.[](source:skm-budget) 분명히 모자라면 근거를 몰래 줄이지 말고 범위 축소나 더 거친 프로필을 제안한다. 사용자가 정한 엄격한 예산을 말없이 넘기지 않는다.

| 상황 | 기록하는 값 | 결과 |
| --- | --- | --- |
| 정찰과 예약을 못 댄다 | `incomplete_reason: "budget_cannot_fund_reconnaissance_and_reserves"` | 에이전트를 하나도 띄우지 않는다 |
| 차수의 비평·검증 예약을 못 댄다 | 단위 사유 `budget_cannot_reserve_critics_and_validation` | 그 차수 단위는 `deferred`. 남겨 둔 마지막 비평이 빈틈을 기록한다 |
| 마지막 비평 예약까지 쓰였다 | `incomplete_reason: "critic_budget_exhausted"` | 사냥 중단, 계획 작업 모두 `deferred`, 완전 범위 주장 금지 |
| 모든 후보를 검증할 예산이 없다 | `incomplete_reason: "validation_budget_exhausted"` | 사냥 중단, 지문 순서로 검증. 미검증 후보는 장부에 `candidate`로만 남고 `findings.json`에 들어가지 않는다 |
| `quick`의 마지막 비평이 일을 찾았다 | 단위 사유 `quick_profile_final_critic` | 두 번째 차수 없이 `deferred` |

예산이 모자라 미완료가 되면, Phase 6 보고서 첫 절에 후보 검증이 끝나지 않았다고 쓰고 해당 지문과 단위를 나열한다.[](source:skm-budget)[](source:hunt-critic)

## 어떤 원칙으로 후보를 거르나 {#principles}

| 원칙 | 강제하는 것 | 거부하는 것 |
| --- | --- | --- |
| 경계와 결과를 요구한다[](source:skm-boundary) | 후보마다 낮은 신뢰 주체, 받아들인 입력·행동, 의도된 통제, 넘은 경계, 영향받은 주체·자원, 관찰했거나 소유자가 관찰할 수 있는 결과 | 빠진 모범 사례, 추측한 배포 동작, 일반 파서 충돌, 자기 자신에게만 미치는 영향 |
| 제한된 국소 근거를 쓴다[](source:skm-local) | 정적 분석으로 경로를 세우고, 통제가 다 갖춰지면 최소 하네스·기존 테스트·작은 픽스처·가짜 테넌트 테스트로 동작을 확인한다 | 최소 경계 결과를 넘는 확장, 지속·장애 이후·은폐용 자료 생성 |
| 소스 가시성을 존중한다[](source:skm-visibility) | 배포 통제, 프록시, 제공자 설정, 브라우저 헤더, ID 정책, 브로커 ACL, 패키징, 토폴로지를 실제 통제로 본다. 저장소에 없으면 `needs_validation`에 빠진 사실과 안전한 확인 계획을 적는다 | 있다고도 없다고도 가정하기 |
| 우선순위와 확실성을 나눈다[](source:skm-priority) | `confirmed`만 심각도를 받는다. 전체 심각도는 입증된 영향을 넘지 못한다 | `needs_validation`에 심각도 붙이기 |
| 가장 작은 소스 수정을 권한다[](source:skm-fix) | 코드가 지킬 불변식과, 마지막 신뢰 결정 지점에서 그것을 강제하는 가장 좁은 변경과 회귀 테스트 | 일반 보강 권고, 대상 소스 직접 수정 |

심각도는 다섯 기준점으로 맞춘다.[](source:skm-priority)

| 등급 | 기준 |
| --- | --- |
| critical | 인증 없는 행위자가 코드 실행, 데이터 저장소 전체 접근, 임의 계정 탈취를 얻는다 |
| high | 명시적 보안 통제를 완전히 무너뜨린다. 인증 우회, 테넌트 간 읽기·쓰기, 다른 사용자에게 미치는 저장형 스크립트 실행, 인증된 코드 실행, 인증 없는 원격 공유 서비스 중단 |
| medium | 실제 경계 위반이지만 영향 범위가 좁거나, 전제 조건이 드물거나, 결과가 좁은 자원에 갇힌다 |
| low | 비밀이 아닌 내부 정보 노출, 또는 큰 노력에 비해 이득이 작은 효과 |
| informational | 확정됐지만 영향이 최소인 관찰. 더 큰 지적 안의 전제 조건으로 주로 쓴다 |

`high`와 `medium`을 가르는 질문은 하나다. 입증된 결과가 실제 결과가 따르는 행동의 명시적 통제를 **완전히** 무너뜨리는가, 약하게만 하는가. 구체적 피해를 말할 수 없으면 느낌보다 심각도가 낮다.[](source:skm-priority)

## 전체 감사 6단계는 어떻게 흐르나 {#workflow}

@workflow id=audit-flow title="전체 감사 6단계"
| recon | 정찰 | backend |
| hunt | 사냥 차수 | backend |
| gap | 빠진 곳? | security |
| verify | 후보 검증 | security |
| records | 기록·재검증 | database |
| report | 보고서 | frontend |
| recon > hunt | 장부 | |
| hunt > gap | 비평 | |
| gap > hunt | 예 | dashed |
| gap > verify | 아니오 | emphasis |
| verify > records | | |
| records > report | 통과 | emphasis |

@steps id=audit-steps
| s-recon | 정찰 | `RECONNAISSANCE.md`를 읽는다. 부모가 `run-metadata.json`을 만들고 예산 관문을 적용한다. `research` 에이전트 4개(1a 제품·스택·로컬 실행, 1b 주체·권한·통제, 1c 진입 표면·사본·싱크, 1d 로컬 실행·배포 가시성)를 병렬로 띄운다. 이들은 파일을 쓰지 않고 사실만 돌려준다. 부모는 약 1,000단어 이하의 `architecture.md`, 보조 문서 선택, 결정적 범위 장부를 만든다. | audit-flow | recon |
| s-hunt | 사냥 차수 | `HUNTING.md`, `ATTACK-CLASSES.md`, 고른 도메인 문서를 쓴다. 부모가 `planned` 단위를 `general` 사냥 담당에게 배정하고 `in_progress`로 바꾼다. 프롬프트는 정해진 9개 부분을 순서대로 담고, 고른 블록은 이름이 아니라 원문 그대로 넣는다. 사냥 담당은 JSON 객체 하나만 돌려준다. | audit-flow | hunt |
| s-gap | 빠진 곳? | 차수 직후 예약해 둔 새 `research` 범위 비평 담당이 장부를 읽는다. 빠진 진입점, 확인 안 된 병렬 경로, 빠진 생애 주기, 단위 없는 보조 유형, 근거 없는 제외, 경로·확인 없이 닫힌 단위를 찾는다. 지적이 아니라 범위만 제안한다. 받아들인 `missing_units`나 `reassign_ids`가 있으면 다시 사냥한다. `standard`·`deep`은 없을 때 별도 마지막 비평을 한 번 더 돌리고, 그것도 비어야 완전 범위다. `quick`은 비평 1회로 끝내고 찾은 일은 `deferred`로 둔다. | audit-flow | gap |
| s-verify | 후보 검증 | `VALIDATION-AND-REPORTING.md` Phase 3. 지문과 근본 원인으로 후보를 합치고, 그 후보를 사냥하지 않은 새 `general` 검증 담당에게 하나씩 준다. 검증 담당은 반박을 목표로 모든 소스 위치를 다시 읽고, 안전하게 재현할 수 있는 결정적 확인은 직접 다시 돌린다. 다른 검증 담당의 결론은 받지 않는다. | audit-flow | verify |
| s-records | 기록·재검증 | Phase 4. 부모가 독립 판정된 기록을 지문 순으로 `findings.json`에 쓴다. 쓰기 직전에 `report-schema.json`을 읽는다. `validate-findings.cjs`와 `validate-coverage-ledger.cjs`를 돌려 모든 오류를 고친다. Phase 5에서는 최종 `confirmed`와 `needs_validation` 기록마다 새 `research` 검증 담당을 병렬로 띄운다. 결과는 `verified` 또는 `replace`다. 판정을 올리거나 근본 원인·재현·영향·심각도를 바꾸는 교체는 또 다른 새 검증 담당이 확인한 뒤에만 적용한다. 교체 후에는 두 검증기를 다시 돌린다. `quick`에서는 Phase 3과 합친다. | audit-flow | records |
| s-report | 보고서 | Phase 6. 모든 기록이 Phase 5를 통과한 뒤에만, 최종 기록과 장부와 보강 메모에서 `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md`를 만든다. 산문은 판정·심각도·막힌 이유·영향을 바꾸지 않는다. 라이브 탐침 지시는 넣지 않는다. | audit-flow | report |

이 순서는 `SKILL.md`의 Full audit workflow 1~6단계를 따른다.[](source:skm-workflow)[](source:rec-agents)[](source:hunt-prompt)[](source:hunt-critic)[](source:val-verifier)[](source:val-p4)[](source:val-p5)[](source:val-p6)

@callout level=note title="끝낼 수 있는 상태는 정확히 둘"
(a) Phase 6 산출물이 모두 써졌고 두 검증기가 통과했다. (b) `run_status: "incomplete"`와 정확한 사유를 기록하고 빈틈을 보고서에 밝혔다. 단계 중간에서 멈추지 않는다.[](source:skm-workflow) `run_status: "complete"`는 모든 장부 후보가 독립 최종 판정을 받고, 남긴 기록이 모두 Phase 5를 통과했을 때만 쓴다.[](source:val-p5)

**사냥 우선순위.** 예산이나 프로필이 사냥 담당 수를 제한하면 순서대로 배정하고 그 이유를 장부에 남긴다. (1) 인증 없는·가장 낮은 신뢰 진입 표면, (2) 가장 값진 자원(자격 증명, 테넌트 간 데이터, 코드 실행, 릴리스 권한)을 지키는 경계, (3) 이전 빈틈·재검증·바뀐 소스, (4) 이 대상 유형에서 확정이 잘 나온 유형 순이다. 동점은 `coverage_id` 사전 순으로 정한다.[](source:hunt-assign)

**도메인 문서는 언제 읽나.** `ATTACK-CLASSES.md`는 모든 사냥에 일반 공격 유형을 준다.[](source:atk-classes)

- 도메인 보조 문서는 그 문서의 "When to use this file"이 말하는 신뢰 민감 경계를 정찰에서 찾았을 때만 고른다. 언어나 의존성 이름만 보고 고르지 않는다.[](source:rec-arch)
- 고른 보조 문서에서는 `Core discipline`, 고른 유형, `Universal moves`, `Validation rules`를 함께 프롬프트에 넣는다.[](source:hunt-prompt)

| 문서 | 이럴 때 고른다 | 핵심 규율 한 줄 |
| --- | --- | --- |
| `ATTACK-CLASSES.md` | 항상. 정찰 결과로 유형을 고르고 큰 코드는 하위 시스템별로 나눈다 | 일반 유형 9개: 주입, 접근 제어, 자원·파일 처리, 암호·비밀, 비즈니스 로직, 기능 악용·유출, 연쇄 취약점·신뢰 경계, 와일드카드, 뻔한 것들[](source:atk-classes) |
| `AI-AND-LLM.md` | 언어 모델이 신뢰 민감 결정에 끼는 곳: 챗봇, RAG, 지속 메모리, 도구 호출, MCP, 프롬프트 조립 | 프롬프트 주입만으로는 지적이 아니다. 코드 수준 경계 실패가 있어야 한다[](source:dom-ai) |
| `WEB-PROTOCOL-AND-AUTH.md` | HTTP 파싱·캐시·브라우저 인증·ID 경계: 세션, JWT, OAuth/OIDC, SAML, MFA, 패스키, API 키, mTLS | 프레이밍·캐시 지적은 같은 요청을 두 구성 요소가 다르게 해석해야 한다[](source:dom-web) |
| `CLIENT-SIDE.md` | 브라우저 안의 신뢰 결정과 렌더링: SPA, 확장, 웹뷰, 서비스 워커, 저장소, `postMessage` | 조작 가능한 출처와 실행·노출 싱크를 둘 다 짚는다. 자기 주입은 지적이 아니다[](source:dom-client) |
| `MEMORY-SAFETY-AND-BINARY.md` | 메모리 안전하지 않거나 특권 있는 곳의 바이트 처리: C/C++, Rust `unsafe`, FFI, 커널, 파서, JIT | 충돌·새니타이저 결과는 현실적인 입력이 닿을 때만 결함이다[](source:dom-mem) |
| `SUPPLY-CHAIN-AND-RELEASE.md` | 의존성 해석, CI, 릴리스·서명·승급, 업데이트, 플러그인 | 바뀔 수 있거나 알려진 취약 의존성만으로는 지적이 아니다. 해석을 누가 조종하는지 보인다[](source:dom-supply) |
| `CLOUD-AND-DEPLOYMENT.md` | 클라우드 ID, IaC, 컨테이너, 쿠버네티스, 메시, 서버리스·엣지, 인그레스 | 매니페스트만으로 라이브 노출을 추론하지 않는다[](source:dom-cloud) |
| `PROTOCOLS-RPC-AND-MESSAGING.md` | gRPC, GraphQL 전송, Protobuf 등, 웹훅, 브로커, 큐, pub/sub | "내부"는 인증이 아니다. 홉마다 상대 ID를 짚는다[](source:dom-proto) |
| `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md` | 신뢰 안 된 작업이 공유 CPU·메모리·연결·큐·유료 비용을 쓰는 곳 | 입력→비용 경로, 빠진 한도, 다른 사용자·공유 서비스 영향이 다 있어야 한다. 부하 시험 금지[](source:dom-res) |
| `DATA-ISOLATION-AND-LIFECYCLE.md` | 멀티테넌트 저장소, 캐시·검색, 객체 링크, 내보내기·백업, 삭제·보존·복원 | 레코드의 테넌트 필드는 격리가 아니다. 읽기·쓰기 경로마다 강제 지점을 찾는다[](source:dom-data) |
| `DESKTOP-MOBILE-AND-LOCAL-IPC.md` | 데스크톱·모바일 앱, 특권 헬퍼, 로컬 데몬, 딥 링크, 웹뷰 브리지, 로컬 IPC | 같은 계정 안의 자해는 경계 위반이 아니다. 경로·이름은 상대 인증이 아니다[](source:dom-desk) |

## 무엇을 만들고, 검증기는 무엇을 막나 {#outputs}

| 산출물 | 담는 것 |
| --- | --- |
| `run-metadata.json` | 실행 기본 사실과 `run_status`. 사실이 바뀔 때만 갱신한다[](source:skm-repro) |
| `architecture.md` | 제품·주체·보호 자원, 비교 대상 기준선, 스택, 진입 표면, 신뢰 경계, 시작 경로, 이전 빈틈, 보조 문서 선택 요약. 약 1,000단어 상한[](source:rec-arch) |
| `coverage-ledger.json` | 범위 단위의 최상위 배열. 이 장부가 곧 범위 주장이다. 요약문이나 에이전트 수는 범위 근거가 아니다[](source:rec-ledger)[](source:rec-state) |
| `findings.json` | `confirmed`, `needs_validation`, `rejected` 최종 기록. 지문 순 정렬[](source:val-p4) |
| `REPORT.md` | 프로필·범위·예산 사용·소스 기준·실행 정책, 보안 상태 요약, 확정 표, 확정 상세, 별도 `NEEDS VALIDATION` 표, 보강 메모와 좋은 패턴, 장부 범위 요약[](source:val-p6) |
| `FINDINGS-DETAIL.md` | 확정된 `medium`·`high`·`critical` 기록마다 전체 추적, 가짜 주체·자원, 국소 재현, 관찰 결과, 조건, 수정안과 회귀 사례[](source:val-p6) |
| `NEEDS-VALIDATION.md` | 미해결 기록마다 추적, 확인된 근거, 막힌 이유, 경계, 국소·소유자 관찰 계획. 심각도 없이 우선순위만[](source:val-p6) |

보고서는 근거에 비례한다. 확정이 0건이어도 그렇게 쓰고 남은 한계를 밝힌다. LOW 지적을 지어내지 않는다.[](source:val-p6)

**`report-schema.json`.** 최상위가 배열이고, 항목은 세 갈래 중 정확히 하나에 맞아야 한다. 모든 갈래가 `additionalProperties: false`라서 사냥 담당의 감싸기 필드를 남기면 실패한다.[](source:schema)[](source:val-p4)

| 필드 | `confirmed` | `needs_validation` | `rejected` |
| --- | --- | --- | --- |
| 공통 | `fingerprint`, `title`, `description`, `trace`, `evidence` | 같음 | 같음 |
| 원인 | `root_cause`, `intended_behavior` | `claimed_root_cause` | `claimed_root_cause` |
| 판정 고유 | `conditions`, `execution`(재현 입력·지시·`observed_result`), `remediation`, `severity`, `confidence` | `blockers`(1개 이상), `validation_plan`(`local`·`deployment`) | `reason` |
| 심각도 | 있음 {good:필수} | 없음 {bad:금지} | 없음 {bad:금지} |

필수 필드 목록은 각 갈래의 `required`에 있다.[](source:schema-c)[](source:schema-nv)[](source:schema-r) 지문은 `^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$`에 맞아야 하고, 줄·차수·에이전트·심각도·판정을 담지 않는다.[](source:hunt-gate)

**장부 단위의 상태.** 원문은 이 표를 "정확히" 지키라고 한다.[](source:rec-state)

| 상태 | `agent_id` | `reviewed_paths`·`local_checks` | `result_fingerprints` | `unresolved` |
| --- | --- | --- | --- | --- |
| `planned` | null | 비움 | 비움 | 비움 |
| `not_applicable`, `out_of_scope`, `deferred` | null | 비움 | 비움 | 사유 필수 |
| `in_progress` | 소유자 | 비움 | 비움 | 비움 |
| `blocked` | 소유자 | 둘 다 채움 | 비움 | 막힌 이유 필수 |
| `covered` | 소유자 | 둘 다 채움 | 비움 | 비움 |
| `candidate` | 소유자 | 둘 다 채움 | 채움 | 선택 |

`coverage_id`는 표면·경계·하위 시스템·공격 유형(필요하면 생애 주기)의 기준 참조를 UTF-8 퍼센트 인코딩해 `::`로 이은 값이다. 참조는 NFC여야 하고 제어·서식 문자가 없어야 한다. 화면용 이름을 슬러그로 만들어 쓰지 않는다.[](source:rec-ledger)

**두 검증기.** 둘 다 의존성 없는 Node 스크립트다. 경로 하나를 받아, 통과하면 `PASS`와 종료 코드 0, 실패하면 오류 목록과 `FAIL`, 종료 코드 1을 낸다. 오류 출력은 100개에서 자른다.[](source:vf-run)[](source:vl-doc)

| 검증기 | 입력 | 주요 검사 | 이러면 실패한다 |
| --- | --- | --- | --- |
| `validate-findings.cjs` | `findings.json` 경로. 같은 폴더의 `report-schema.json`을 스스로 읽는다 | 스키마 갈래 정확히 하나, 필수·추가 필드, 열거값, 보이는 글자 포함, 지문 패턴. 그다음 의미 검사[](source:vf-semantic) | 지문 중복, 지문 순 정렬 아님, 줄 번호 1 미만, 안전하지 않은 경로(절대 경로, `..`, `:`, 역슬래시, Windows 예약 이름, 제어 문자), 추적 순서 위반(여러 단계면 `entrypoint`로 시작·`sink`로 끝), 판정별 금지 필드, `overall_severity`가 `impact`보다 높음, `needs_validation`에 보이는 `local`·`deployment` 계획이 하나도 없음[](source:vf-semantic)[](source:vf-path) |
| `validate-coverage-ledger.cjs` | `coverage-ledger.json` 경로 | 19개 필수 필드, 기준 참조와 `coverage_id` 재계산 일치, 상태표, 확인 기록 소유, 재배정 기록[](source:vl-fields)[](source:vl-unit) | ID 중복·충돌, 같은 의미 묶음에 다른 ID, 정렬 아님, 선택과 제외에 같은 블록, 잘못된 `prior_status`·`status`, 상태표 위반, `source` 확인에 산출물 있음, `local` 확인의 산출물이 `agents/<agent_id>/artifacts/` 밖, 단위 경로가 확인 경로의 합집합과 다름, 재배정에서 이전 소유자·산출물 재사용[](source:vl-checks)[](source:vl-state)[](source:vl-attempts) |

입력 파일 자체도 거른다. 두 검증기 모두 링크를 따라가지 않고 비차단으로 열어, 심볼릭 링크와 일반 파일이 아닌 것(FIFO 등)을 거부한다. UTF-8이 아니어도 실패한다.[](source:vf-read)

@facts
| 공통 입력 한도 | 5 MiB, 중첩 64단계, 오류 출력 100개 |
| `findings.json` | 배열마다 1,000항목[](source:vf-limits) |
| 범위 장부 | 단위 10,000개, 중첩 배열 1,000항목, 객체 필드 1,000개, 값 500,000개[](source:vl-limits) |
| 실제 상한 | 5 MiB 한도가 먼저 걸린다. 현실적 단위 약 2,000~5,000개[](source:rec-state) |

검증기 통과는 형식과 장부 일관성만 증명한다.[](source:val-p4) 판정: 두 검증기는 서로의 파일을 읽지 않는다. 그래서 `findings.json`의 지문이 장부의 `candidate` 단위와 이어지는지는 기계로 확인되지 않는다.[](source:vf-run)[](source:vl-doc)

**테스트 파일은 의도의 근거로만 읽었다.** 분석자는 테스트를 실행하지 않았다. 테스트가 기대하는 동작은 다음과 같다.

- `validate-findings.test.cjs`: 세 갈래가 모두 든 정상 문서와, `local`만 또는 `deployment`만 있는 검증 계획을 통과시킨다.[](source:vft-accept) 정렬 위반, 영향보다 높은 심각도, 위험한 경로는 거부한다.[](source:vft-reject) FIFO 입력과 심볼릭 링크 입력은 막히지 않고 바로 거부한다.[](source:vft-cli) 두 검증기의 경로·보이는 글자 규칙과 공통 한도가 같은지도 확인한다.[](source:vft-align)
- `validate-coverage-ledger.test.cjs`: 슬러그 ID, 중복, 충돌, 별칭, 정렬 위반을 거부한다.[](source:vlt-ids) 다른 소유자의 산출물을 쓰는 `local` 확인을 거부하고, 검증 담당 확인이 사냥 담당 확인과 함께 있는 것은 허용한다.[](source:vlt-artifacts) 상태표를 강제하고[](source:vlt-state), 재배정 때 새 소유자를 요구한다.[](source:vlt-attempts) 구조 한도도 시험한다.[](source:vlt-limits)

## 후보와 확정은 어떻게 다르고, 무엇을 하지 말아야 하나 {#verdicts}

| 상태 | 뜻 | 심각도 | 어디에 남나 |
| --- | --- | --- | --- |
| 후보(candidate) | 사냥 담당이 낸 주장. 아직 독립 검증 전 | 없음 | 장부의 `candidate` 단위 |
| `confirmed` | 소스 근거와 제한된 국소 검증이 경계 전체와 의미 있는 결과를 세웠다 | 있음 | `findings.json`, 보고서 |
| `needs_validation` | 소스에 근거한 구체적 경계 가설이 특정 외부 사실 때문에 막혔다. 확신 낮은 확정이 아니다 | 없음 | `findings.json`, `NEEDS-VALIDATION.md` |
| `rejected` | 소스, 국소 동작, 보이는 통제, 영향 없음, 불가능한 전제로 반박됐다 | 없음 | `findings.json`. 다음 실행이 같은 주장을 반복하지 않게 |

검증 담당은 경로 전체와 관찰 결과를 독립적으로 세웠을 때만 `needs_validation`을 `confirmed`로 올린다. 배포·런타임 사실이 모르는 채로 남으면 `confirmed`를 `needs_validation`으로 내린다. `needs_validation`은 추측을 넣어 두는 곳이 아니다.[](source:val-decide)[](source:skm-priority)

사냥 담당의 후보 관문은 일곱 줄이다.[](source:hunt-gate)

- 후보는 저장소 상대 경로로 된 완전한 추적과, 가장 강한 통제까지 포함한 근본 원인 근거가 필요하다.
- 확정 제안은 제한된 국소 관찰 결과, 경계를 넘는 의미 있는 영향, 완전한 조건, 막는 계층이 없음을 갖춘다.
- 충돌을 코드 실행으로, 평범한 작업을 공유 가용성 문제로, 같은 주체의 행동을 권한 상승으로 부풀리지 않는다.
- 필요한 사실이 소스나 국소 관찰로 안 보이면 `needs_validation`으로 두고 막힌 이유를 정확히 쓴다.
- 영향받는 주체·자원이 없는 모범 사례 누락은 제외하거나 보강 메모로 돌린다. 소스가 반박한 후보는 `needs_validation`이 아니다.
- 같은 근본 원인에는 모든 상태에서 같은 지문을 쓴다.
- 남는 것이 없으면 빈 후보 배열을 돌려준다.

원문이 꼽은 안티패턴 10개다.[](source:skm-anti)

@list ordered=true
| 체크리스트 위반을 취약점으로 내세우기 |
| 닿을 수 있는 경계 위반 없이 심층 방어 조언만 하기 |
| 제한된 국소 근거로 부족하다고 라이브·공유 환경에서 시험하기 |
| 소스에 없는 제공자·프록시·브라우저·ID·배포 동작을 짐작하기 |
| 의도된 같은 주체 권한이나 자기 영향을 경계 넘는 결과로 보기 |
| 파서·런타임 효과를 관찰한 것보다 강하게 보고하기 |
| 중복 제거·검증이 안 되는 산문 형태 사냥 결과 내기 |
| 출처가 그대로인 이전 확정 기록을 다시 보고하거나, 사냥의 본보기로 삼기 |
| `needs_validation` 기록에 심각도 붙이기 |
| 독립 검증 전에 보고서를 쓰거나, 산문과 JSON 기록이 어긋나게 두기 |

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `cloudflare/security-audit/` 아래 20개(`SKILL.md`, 참조 문서 13개, `report-schema.json`, 검증기 2개와 테스트 2개)와 `cloudflare/skills-lock.json`, 모두 21개다. 스킬 폴더 20개 합계는 314,670B다. 모두 끝까지 읽었다.
- 설치 기록: 출처 저장소 `cloudflare/security-audit-skill`, 원격 경로 `skills/security-audit/SKILL.md`다.[](source:lock)
- 제외한 파일: 없음. 이 폴더에는 번역본이 없다.
- 원문 비교: 관계 원장 기준으로 `verification-skills/cloudflare/security-audit`의 사본과 원문 동일이다. 분석자도 원본 20개 파일을 `shasum`으로 대조해 모두 같음을 확인했다. 사본 폴더에만 번역본이 더 있다.
- 관계: 컬렉션에 스킬이 하나뿐이고 소속 묶음이 없다. 그래서 흐름 속 위치 패널은 두지 않았다. 원장은 `cloudflare/relations.md`다.
- 실행하지 않음: 검증기, 테스트, 감사 워크플로를 하나도 돌리지 않았다. 이 페이지의 동작 설명은 모두 지시상 동작과 코드 읽기에 근거한다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
두 모드 사이가 "애매한" 요청의 판단 기준은 원문에 명시 없음. 부모가 프로필을 "제안"할 때 사용자 승인을 기다려야 하는지도 원문에 명시 없음.
OS가 강제하는 샌드박스를 어떤 도구로 만드는지는 원문에 명시 없음. 판정: 실행 환경이 네 통제를 못 주면 국소 확인 대신 `needs_validation`이 늘어난다.[](source:skm-safety)
문서는 `findings.json` 한도를 "최상위 1,000건"이라고 적는다.[](source:val-p4) 코드는 같은 1,000 한도를 모든 배열에 건다.[](source:vf-limits) 장부 검증기의 객체 필드 1,000개 한도도 문서에는 없다.[](source:vl-limits)
`findings.json`과 장부를 서로 대조하는 검증기는 없다. 미완료 실행의 부분 보고서가 미검증 지문을 다 밝혔는지도 기계로 확인되지 않는다.
