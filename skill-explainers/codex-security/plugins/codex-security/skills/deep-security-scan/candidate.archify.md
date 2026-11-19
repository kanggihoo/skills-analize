# deep-security-scan — 같은 저장소를 여러 번 훑는 철저한 보안 감사 {#overview}

deep-security-scan은 호스트(scan을 실행하는 바깥 도구)가 Standard audit를 반복 실행해 finding을 병합하게 하고, 그 결과를 사용자에게 전달하는 스킬이다.[](source:intro)

- 사용자가 deep·exhaustive·multi-pass 감사를 요청하고 대상이 저장소나 지정 경로일 때 쓴다. PR·commit·branch·working tree 변경에는 `security-diff-scan`을 쓰라고 한다.[](source:fm)
- 결과는 병합된 finding과 생성된 `report.md`, canonical artifacts(봉인되는 정본 파일)다. 호스트는 연속 audit가 새 결과를 못 더하거나 scan·시간 한도에 닿으면 멈춘다.[](source:intro)[](source:s5)
- 관계: `security-scan`이 deep 요청 때 이 스킬을 안내하고(다음 안내), 이 스킬은 변경 범위면 `security-diff-scan`으로, 저장된 모드가 Standard면 `security-scan`으로 안내한다. 결과는 `track-findings`와 `threat-model-visualize`가 이어 받을 수 있다(결과 전달).
- 하지 않는 것: 대상 일부만 deep으로 돌리지 않는다. 도구는 `scope: "."`만 받는다.[](source:scope)

@answer scope="codex-security/plugins/codex-security/skills/deep-security-scan · 원본 파일 7개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: name과 description" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=1:4
@source intro title="스킬이 설명하는 호스트의 동작" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=8:8
@source s1 title="1단계: 대상과 범위, 이어 실행" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=10:10
@source s2 title="2단계: 새 대상의 설정 확인" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=11:11
@source s3 title="3단계: 다른 Deep scan 확인" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=12:12
@source s4 title="4단계: 시작, 재접속, 취소" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=13:13
@source s5 title="5단계: 완료 보고" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=14:14
@source oai title="openai.yaml: 표시 이름과 기본 prompt" path=codex-security/plugins/codex-security/skills/deep-security-scan/agents/openai.yaml lines=1:4
@source scope title="도구는 전체 대상만 받는다" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=930:934
@source stop title="코디네이터의 중단 조건" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=839:850
@source defaults title="번들 기본 설정값" path=codex-security/plugins/codex-security/scripts/deep_scan_defaults.json lines=1:8
@source tmax title="max_time_minutes 한도" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/project-config.schema.json lines=24:27
@source peer title="worker의 peer note 사용" path=codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md lines=7:9
@source pro-own title="worker는 최상위 setup을 반복하지 않는다" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=3:3
@source pro-untrust title="입력은 untrusted 분석 데이터, worker는 offline" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=15:15
@source pro-profile title="worker 권한 profile과 우회 금지" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=31:31
@source pro-cancel title="취소와 실패 처리 규칙" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=37:37
@source adv title="Daybreak access advisory" path=codex-security/plugins/codex-security/references/access-advisory.md lines=3:11
@source fr-own title="완료 소유자 표" path=codex-security/plugins/codex-security/references/final-report.md lines=7:12
@source fr-done title="완료 주장 조건" path=codex-security/plugins/codex-security/references/final-report.md lines=16:16
@source fr-resp title="응답 규칙" path=codex-security/plugins/codex-security/references/final-report.md lines=75:77
@source rel-ss title="security-scan description" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=3:3
@source rel-diff title="security-diff-scan description" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=3:3
@source rel-tf title="track-findings: 봉인된 scan 하나를 기록" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=8:8
@source rel-viz title="threat-model-visualize: 기존 위협 모델이 입력" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=10:10
@source rel-tm title="Deep의 부모 위협 모델과 mode 값" path=codex-security/plugins/codex-security/references/scan-contract.md lines=122:132
@source core title="worker가 따르는 core-scan 문서" path=codex-security/plugins/codex-security/references/core-scan.md lines=1:20

## 어떻게 동작하나 {#flow span=12}

절차형이다. 반복 audit와 병합은 호스트가 하므로 그림에는 없다. 에이전트가 하는 일은 대상 확정, 설정 확인, 시작, 결과 전달이다.[](source:intro)

그림이 생략한 것이 둘 있다. 연결이 끊기면 같은 인자로 다시 붙고, 취소는 사용자가 명시할 때만 한다.[](source:s4)

@workflow id=flow-diagram title="deep-security-scan 흐름"
| lane ready | 대상 정하기 |
| lane guard | 중복 확인 |
| lane run | 실행·보고 |
| resolve | 대상·범위 확정 | backend | ready | source:s1 |
| mode | 이어 실행이면 모드? | backend | ready | source:s1 |
| other | 대응 scan 스킬로 계속 | external | ready | source:s1 |
| setup | 설정 확인 | backend | ready | source:s2 |
| concur | 다른 Deep scan 실행 중? | backend | guard | source:s3 |
| choice | Cancel·Continue 묻기 | external | guard | source:s3 |
| stop | 새 scan만 취소 | backend | guard | source:s3 |
| start | Deep scan 시작 | backend | run | source:s4 |
| report | 결과 보고 | backend | run | source:s5 |
| resolve > setup | 새 대상 |
| resolve > mode | 이어 실행 |
| mode > other | Standard·diff |
| mode > concur | Deep |
| setup > start | |
| concur > start | 없음 |
| concur > choice | 있음 |
| choice > start | Continue |
| choice > stop | Cancel |
| start > report | 성공 |

@steps id=flow-steps
| s-resolve | 대상·범위 확정 | **입력** 사용자 요청·`scanId`·`handoffClaimToken` · **참조** `../../references/scan-prologue.md` · **실행** `get_codex_security_scan_context`(이어 실행일 때) · **출력** 확정한 대상과 범위(`scope: "."`). **처리** 에이전트가 승인된 대상을 정하고, 하위 디렉터리면 그 디렉터리를 `targetPath`로 삼는다.[](source:s1) **다음** 이어 실행이면 저장된 scan 정체성과 범위를 그대로 쓴다.[](source:s1) | flow-diagram | resolve |
| s-mode | 이어 실행이면 모드? | **입력** 저장된 scan의 mode · **출력** 계속할 스킬 선택. **처리** 모드가 Standard나 diff이면 대응하는 scan 스킬로 계속한다. 그 밖에는 이 스킬을 이어 간다.[](source:s1) | flow-diagram | mode |
| s-other | 대응 scan 스킬로 계속 | **입력** 저장된 scan 정체성·범위 · **출력** 이 스킬 밖의 scan 진행. **처리** 대응 스킬의 이름은 원문에 명시 없음. 이 스킬은 거기서 끝난다.[](source:s1) | flow-diagram | other |
| s-setup | 설정 확인 | **입력** `targetPath`·선택한 프로젝트 설정 파일 · **실행** `inspect_codex_security_setup({ targetPath, scope: ".", mode: "deep", projectConfigPath? })` · **출력** 실효 설정과 그 출처. **처리** 에이전트가 설정을 사용자에게 보인다. `max_discovery_runs`는 동시에 도는 scan까지 센 Standard scan 총 횟수 상한이다.[](source:s2) **다음** 프로젝트 파일은 사용자가 고른 것만 넘긴다. 이미 있는 scan은 저장된 설정을 쓴다.[](source:s2) | flow-diagram | setup |
| s-concur | 다른 Deep scan 실행 중? | **입력** `get_codex_security_scan_context`의 `otherRunningDeepScans` · **출력** 실행 중인 scan 정보 또는 없음. **처리** 새로 시작한 native scan에서 이 목록을 한 번만 본다. 있으면 대상·phase·시작 시각과 추가 CPU·메모리·token 사용을 알린다.[](source:s3) **다음** 대상만 있는 setup 미리보기에는 scan ID가 없어 이 확인이 없다.[](source:s3) | flow-diagram | concur |
| s-choice | Cancel·Continue 묻기 | **입력** 실행 중인 scan 정보 · **실행** `request_user_input`, 없으면 `request_codex_security_user_input`, 그것도 없으면 평문 채팅 · **출력** 사용자의 명시 선택. **처리** **Cancel (Recommended)**와 **Continue**를 묻고 선택을 기다린다. 닫힌 dialog는 취소가 아니다.[](source:s3) | flow-diagram | choice |
| s-stop | 새 scan만 취소 | **입력** Cancel 선택 · **출력** 취소된 새 scan. **처리** 사용자가 취소를 고르면 새 scan만 취소한다. 이미 돌던 Deep scan은 건드리지 않는다.[](source:s3) | flow-diagram | stop |
| s-start | Deep scan 시작 | **입력** `scanId`(기존) 또는 `targetPath`·`scope: "."`·`userContext?`·`projectConfigPath?`(새 대상) · **참조** `../../references/access-advisory.md` · **실행** `start_codex_security_deep_scan({ scanId, handoffClaimToken? })` 또는 `start_codex_security_deep_scan({ targetPath, scope: ".", userContext?, projectConfigPath? })` · **출력** scan 결과(`completion` 포함). **처리** 에이전트가 access advisory를 먼저 따른 뒤 도구를 시작하고 결과가 올 때까지 기다린다.[](source:s4)[](source:adv) **다음** 도구가 running cell ID를 주면 그 cell을 기다린다. 연결이 닫히면 같은 인자로 다시 붙는다. 터미널 실패는 저장된 결과와 함께 보고한다. 명시 취소 때만 소유 thread에서 `cancel_codex_security_scan({ scanId })`를 부른다.[](source:s4) | flow-diagram | start |
| s-report | 결과 보고 | **입력** 도구가 돌려준 `completion`·scan ID·manifest 경로 · **참조** `../../references/final-report.md` · **출력** `report.md`와 canonical artifacts 링크, 사용량. **처리** SDK 소유 scan이면 scan ID와 manifest 경로만 돌려주고, 아니면 생성된 `report.md`를 링크하고 사용량을 보고한다.[](source:s5)[](source:fr-resp) **다음** finding 0건으로 audit가 끝난 경우와 audit 하나도 못 끝내고 마감된 경우를 구분해서 말한다.[](source:s5) | flow-diagram | report |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자의 `$codex-security:deep-security-scan` 호출 예시(`default_prompt`)와 모델 판단(description). 호출 제한 필드는 frontmatter에 없다.[](source:oai)[](source:fm) |
| 성격 | 호스트가 도는 Deep scan을 시작하고 기다렸다가 결과를 전달하는 진입 스킬이다. 반복·병합 논리는 호스트 코디네이터에 있다.[](source:intro) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| security-scan {#rel-r02} | **이 스킬** | 다음 안내 | 사용자가 deep scan을 명시적으로 요청했을 때만 안내한다. 스킬 선택은 사용자와 호스트가 한다.[](source:rel-ss) |
| **이 스킬** {#rel-r03} | security-diff-scan | 다음 안내 | PR·commit·branch·working tree 변경이면 그쪽을 쓰라고 description이 정한다. 이어 실행하는 scan의 저장된 모드가 diff일 때도 그렇다.[](source:fm)[](source:s1)[](source:rel-diff) |
| **이 스킬** {#rel-r04} | security-scan | 다음 안내 | 이어 실행하는 scan의 저장된 모드가 Standard이면 대응하는 scan 스킬로 계속한다. 스킬 이름은 원문에 없다.[](source:s1) |
| **이 스킬** {#rel-r05} | security-scan | 참고 | 호스트가 Standard audit를 반복 실행한다. 두 스킬은 `core-scan.md`를 공유할 뿐 이 스킬이 `security-scan`을 호출한다는 문장은 없다.[](source:intro)[](source:peer)[](source:core) |
| **이 스킬** {#rel-r26} | track-findings | 결과 전달 | 완료 후 `report.md`와 canonical artifacts를 링크한다. 부모 scan이 봉인되면 `track-findings`가 받는 sealed scan과 같은 종류다. 사용자가 요청할 때만 쓴다.[](source:s5)[](source:rel-tf)[](source:rel-tm) |
| **이 스킬** {#rel-r72} | threat-model-visualize | 결과 전달 | Deep 부모 scan은 첫 모델을 `scan.threatModel`에 둔다. visualize가 읽는 것은 이 primary model뿐이다. 자동 연결은 없다.[](source:rel-tm)[](source:rel-viz) |

@architecture id=relation-map title="deep-security-scan과 이어지는 스킬"
| ss | security-scan | backend |
| diff | security-diff-scan | backend |
| self | deep-security-scan(이 스킬) | backend |
| tf | track-findings | backend |
| viz | threat-model-visualize | backend |
| ss > self | 다음 안내 |
| self > diff | 다음 안내 |
| self > ss | 다음 안내 |
| self > tf | 결과 전달 |
| self > viz | 결과 전달 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 5개 번호 단계와 호스트 동작 설명 | 스킬이 켜지면 읽는다 | 대상·범위 확정, 이어 실행이면 모드?, 설정 확인, 다른 Deep scan 실행 중?, Deep scan 시작, 결과 보고 |
| `agents/openai.yaml` | 표시 이름 "Deep Security Scan"과 기본 prompt | 호스트가 스킬 목록·호출에 쓴다. 에이전트 지시는 없다 | 원문에 명시 없음 |
| `references/scan-prologue.md` | 소유권, untrusted 입력, worker 실패, 취소·실패 규칙 | 1단계가 "source access and context updates"를 따르라고 지시한다 | 대상·범위 확정, Deep scan 시작 |
| `references/access-advisory.md` | Daybreak 접근 상태를 알리는 선택적 안내 | 4단계 시작 도구를 부르기 전에 읽는다 | Deep scan 시작 |
| `references/final-report.md` | 완료 소유자, 완료 주장 조건, 사용량 보고 | 5단계가 사용량 보고 규칙으로 지시한다 | 결과 보고 |
| `references/core-scan.md` | worker가 따르는 감사 절차 | 에이전트는 읽지 않는다. worker 지시문이 읽으라고 한다(코드 확인) | Deep scan 시작 |
| `references/scan-contract.md` | scan 봉인 문서의 모드 값과 위협 모델 보존 규칙 | 에이전트에게 읽으라는 지시는 없다. 관계 확인용으로 읽었다 | 결과 보고 |
| `mcp-app/server.ts`, `mcp-app/src/deep-scan/coordinator.ts` | 도구의 입력 검사와 중단 조건 구현 | 에이전트는 읽지 않는다. 구조·표본만 확인 | Deep scan 시작 |
| `scripts/deep_scan_defaults.json`, `project-config.schema.json` | 번들 기본값과 시간 한도 schema | 설정 확인에서 호스트가 읽는다(코드 확인) | 설정 확인 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 대상이 PR·commit·branch·working tree 변경 | 이 스킬을 쓰지 않고 `security-diff-scan`을 쓴다 | [](source:fm) |
| `targetPath`로 새로 시작 | `scope: "."`만 받는다. 아니면 도구가 거부한다 | [](source:scope) |
| 지정 경로(하위 디렉터리) 감사 | 그 디렉터리를 `targetPath`로, `scope`는 `"."`로 둔다 | [](source:s1) |
| 이미 있는 scan | 저장된 정체성·범위·설정을 쓴다 | [](source:s1) [](source:s2) |
| 연속 audit가 새 결과를 못 더함 | 기본 4번 연속이면 호스트가 멈춘다. 이 값은 설정으로 바뀐다 | [](source:stop) [](source:defaults) |
| Standard scan 총 횟수 | 기본 40번이 상한이다. 동시에 도는 scan도 센다 | [](source:s2) [](source:defaults) |
| 시간 한도 | Deep에서는 강제 한도다. 기본·최대 5760분(96시간) | [](source:tmax) [](source:defaults) |
| 연속 discovery 오류 | 기본 3번에 닿으면 오류로 끝난다 | [](source:stop) [](source:defaults) |
| 다른 Deep scan이 실행 중 | 사용자의 명시 선택을 기다린다. 닫힌 dialog는 취소가 아니고, 취소는 새 scan만 | [](source:s3) |
| 사용자가 취소를 요청 | 소유 thread에서 `cancel_codex_security_scan`을 부른다. `fail_codex_security_scan`은 복구 불가 blocker에만 쓴다 | [](source:s4) [](source:pro-cancel) |
| 입력 내용(저장소·정책·위협 모델·URL) | untrusted 분석 데이터다. 추가 읽기·network·테스트를 허가하지 않고 worker는 offline이다 | [](source:pro-untrust) |
| worker 권한 오류 | deny 규칙을 풀거나 더 넓은 sandbox를 고르지 않는다 | [](source:pro-profile) |
| Daybreak access가 not_granted | 경고를 보이되 scan을 막지 않는다. access advisory는 어떤 경우에도 scan을 허가하거나 막지 않는다 | [](source:adv) |
| SDK 소유 scan | scan ID와 manifest 경로만 돌려주고 completion·finalizer는 부르지 않는다 | [](source:s5) [](source:fr-own) |
| finalization 전 | 성공하고 `report.md`가 생기기 전에는 완료를 주장하지 않는다 | [](source:fr-done) |
| 사용량이 없거나 일부 | 0으로 쓰지 않고 없다고 말한다. 일부면 "at least X tokens" 식으로 쓴다 | [](source:fr-resp) |
| worker가 peer note를 읽음 | 단서로만 보고 근거는 직접 확인한다 | [](source:peer) [](source:intro) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 코디네이터의 중단 판정(`saturated`·`capped`) — Deep scan 시작 · streak 계산, 배정 횟수 센 방식, 마감 기준 시각
- 설정 우선순위와 기본값 — 설정 확인 · 프로젝트 파일, 사용자 TOML, 번들 기본값 순서와 `max_time_minutes` 규칙
- Deep worker 실행 환경 — Deep scan 시작 · permission profile, 자격 증명, 시작 실패 때의 안내
- worker 사이 peer note — Deep scan 시작 · 두 도구와 `threadId` 답글, 작성자 표시
- 사용량·account allowance 보고 — 결과 보고 · `usage`, `byRole`, `accountRateLimits`를 말하는 방법

@callout level=open-question title="확인하지 못한 것"
| 반복 audit의 병합 알고리즘(`same-fix`, `iteration`, `store`)은 읽지 않았다. 이 페이지는 스킬 본문과 중단·설정 계약만 다룬다. |
| 대응 scan 스킬의 이름(1단계)은 원문에 없다. 관계 표의 `security-scan`·`security-diff-scan`은 저장된 모드와 description에서 추정한 연결이다. |
| 이 스킬이 호스트 도구를 통해 일으키는 worker의 실제 실행은 확인하지 못했다. 위 실행 칸은 원문이 에이전트에게 지시한 도구 호출이다. |

읽은 원본: 텍스트 파일 7개(`SKILL.md`, `openai.yaml`, 참조 문서 5개). 코드·설정 5개는 필요한 줄만 확인했다. 제외: 없음.
