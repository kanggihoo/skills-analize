# deep-security-scan은 무엇을 하는 스킬이고, Deep scan은 어떻게 반복되다 멈추나? {#deep-security-scan-page}

`deep-security-scan`은 같은 코드를 Standard 감사로 여러 번 돌려 결과를 하나로 합치는 deep scan을 시작하고, 끝난 결과를 사용자에게 보고하는 스킬이다. 감사를 반복하고 병합하고 멈추는 일은 에이전트가 아니라 host의 코디네이터가 한다. 에이전트가 하는 일은 대상과 설정을 확정하고, 필요하면 사람의 선택을 기다린 뒤, 시작 도구를 호출해 결과를 기다리고 보고하는 것이다.[](source:sk-intro)[](source:sp-coord)

- 사용자가 deep, exhaustive, multi-pass 감사를 요청했을 때 쓴다. PR, commit, branch, working tree의 변경분은 `security-diff-scan`의 일이고, 시작 도구도 전체 대상(`scope: "."`)만 받는다.[](source:front)[](source:srv-chk)
- host는 기본값으로 worker 4개를 동시에 돌리고, 연속 4번 새 finding이 없으면 멈춘다. 감사 시작 횟수는 40번, 시간은 96시간이 상한이고 연속 오류 3번이면 오류로 끝난다.[](source:cfg-def)[](source:co-stop)[](source:co-err)
- 사람이 개입하는 곳은 하나다. 다른 Deep scan이 이미 돌고 있으면 `Cancel (Recommended)`와 `Continue` 중 하나를 명시적으로 고를 때까지 기다린다. 닫힌 dialog는 취소가 아니다.[](source:sk-3)
- 에이전트는 끝나면 생성된 `report.md`와 canonical artifacts를 링크하고 token 사용량을 보고한다. SDK가 소유한 scan이면 scan ID와 manifest 경로만 SDK에 돌려준다. 코드를 실행하거나 파일을 직접 고치지 않는다.[](source:sk-5)[](source:fr-own)

@answer scope="분석 커밋 cd5035b · 필수 참조 문서와 Deep 코디네이터 구현의 필요한 줄 범위까지 읽음 · 코드와 도구는 실행하지 않음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source front title="description과 frontmatter" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=1:4
@source sk-intro title="동작 개요" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=8:8
@source sk-1 title="1단계 대상과 scope 확정" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=10:10
@source sk-2 title="2단계 설정 확인" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=11:11
@source sk-3 title="3단계 다른 Deep scan 확인" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=12:12
@source sk-4 title="4단계 시작과 대기" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=13:13
@source sk-5 title="5단계 완료 보고" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=14:14
@source yaml title="UI 표시와 default_prompt" path=codex-security/plugins/codex-security/skills/deep-security-scan/agents/openai.yaml
@source readme title="벤더의 스킬 선택 안내" path=codex-security/plugins/codex-security/skills/README.md lines=7:9
@source ss-desc title="형제 스킬 description" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=3:3
@source ss-core title="형제 스킬의 감사 방식" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=10:10
@source ds-desc title="형제 스킬 description" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=3:3
@source tr-8 title="이어지는 스킬의 입력 조건" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=8:8
@source tr-24 title="이어지는 스킬이 읽는 파일" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=24:24
@source vis-10 title="이어지는 스킬의 입력 조건" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=10:10
@source sp-top title="적용 범위" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=3:3
@source sp-own title="setup과 scan 소유권" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=7:11
@source sp-ctx title="사용자 context와 phase 소유권" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=15:17
@source sp-res title="도구 결과 확인" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=21:21
@source sp-coord title="코디네이터 책임" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=27:27
@source sp-fail title="worker 실패와 자격 증명" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=31:33
@source sp-cancel title="취소와 복구" path=codex-security/plugins/codex-security/references/scan-prologue.md lines=37:37
@source adv title="접근 안내 절차" path=codex-security/plugins/codex-security/references/access-advisory.md lines=3:11
@source fr-own title="결과 소유자와 완료 조건" path=codex-security/plugins/codex-security/references/final-report.md lines=3:16
@source fr-info title="informational finding 표시" path=codex-security/plugins/codex-security/references/final-report.md lines=30:30
@source fr-err title="오류와 복구" path=codex-security/plugins/codex-security/references/final-report.md lines=55:61
@source fr-resp title="응답과 usage 보고" path=codex-security/plugins/codex-security/references/final-report.md lines=73:79
@source as-own title="scan 소유권과 저장 규칙" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=3:9
@source as-supp title="보조 파일 저장 규칙" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=11:13
@source as-store title="저장 위치 선택" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=20:22
@source cs-intro title="감사 목적과 시간 allowance" path=codex-security/plugins/codex-security/references/core-scan.md lines=3:5
@source cs-ctx title="1단계 맥락 확정" path=codex-security/plugins/codex-security/references/core-scan.md lines=9:9
@source cs-base title="2단계 baseline 감사" path=codex-security/plugins/codex-security/references/core-scan.md lines=10:10
@source cs-tm title="3단계 위협 모델" path=codex-security/plugins/codex-security/references/core-scan.md lines=11:11
@source cs-pk title="4단계 조사 packet" path=codex-security/plugins/codex-security/references/core-scan.md lines=12:12
@source cs-inv title="5단계 집중 조사 위임" path=codex-security/plugins/codex-security/references/core-scan.md lines=13:13
@source cs-ck title="6단계 후보 checkpoint" path=codex-security/plugins/codex-security/references/core-scan.md lines=14:14
@source cs-val title="7단계 검증" path=codex-security/plugins/codex-security/references/core-scan.md lines=15:15
@source cs-asm title="8단계 최종 draft 조립" path=codex-security/plugins/codex-security/references/core-scan.md lines=16:16
@source cs-end title="단계 스킬 금지와 마무리" path=codex-security/plugins/codex-security/references/core-scan.md lines=18:20
@source cs-src title="검색 도구와 SECURITY.md" path=codex-security/plugins/codex-security/references/core-scan.md lines=24:26
@source cs-sec title="소스에 노출된 secret" path=codex-security/plugins/codex-security/references/core-scan.md lines=30:32
@source cs-sev title="severity 채점" path=codex-security/plugins/codex-security/references/core-scan.md lines=34:36
@source ba-chk title="baseline 감사의 점검 항목" path=codex-security/plugins/codex-security/references/baseline-auditor.md lines=3:12
@source ba-lim title="baseline 감사의 제약과 반환 형식" path=codex-security/plugins/codex-security/references/baseline-auditor.md lines=14:18
@source fi-inv title="집중 조사 방법" path=codex-security/plugins/codex-security/references/focused-investigator.md lines=3:7
@source fi-lim title="집중 조사의 제약과 반환 형식" path=codex-security/plugins/codex-security/references/focused-investigator.md lines=9:13
@source sc-docs title="canonical 문서" path=codex-security/plugins/codex-security/references/scan-contract.md lines=9:14
@source sc-status title="scan status 의미" path=codex-security/plugins/codex-security/references/scan-contract.md lines=32:41
@source sc-deep title="Deep 부모의 review state" path=codex-security/plugins/codex-security/references/scan-contract.md lines=114:114
@source sc-modes title="scan mode 값" path=codex-security/plugins/codex-security/references/scan-contract.md lines=122:132
@source sc-dm title="whole-repository Deep scan의 mode 값" path=codex-security/plugins/codex-security/references/scan-contract.md lines=144:144
@source sc-tm title="Deep 위협 모델 보관" path=codex-security/plugins/codex-security/references/scan-contract.md lines=173:173
@source dd-cfg title="worker 설정 JSON과 범위" path=codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md lines=1:7
@source dd-peer title="peer note" path=codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md lines=9:9
@source dd-sev title="severity rubric" path=codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md lines=11:11
@source dd-save title="checkpoint 저장" path=codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md lines=13:13
@source dd-block title="막혔을 때의 중단" path=codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md lines=15:15
@source dd-final title="최종 결과 제출" path=codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md lines=17:17
@source tpl-ctx title="worker 설정 JSON 키" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/templates.ts lines=21:37
@source tpl-prev title="이전 finding 전달" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/templates.ts lines=42:44
@source tpl-fp title="false-positive 피드백 전달" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/templates.ts lines=45:50
@source co-const title="상수" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=55:59
@source co-dl title="마감 계산" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=575:597
@source co-dl-stop title="마감 도달 처리" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=599:607
@source co-init title="저장된 count 복원" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=752:762
@source co-replay title="재개 때 결과 재생" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=764:787
@source co-merge title="병합과 연속 무발견 세기" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=796:838
@source co-err title="연속 오류 중단" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=839:846
@source co-stop title="중단 조건과 이유 라벨" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=847:865
@source co-disp title="다음 batch 배정" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=867:878
@source co-out title="worker 결과 처리" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=880:903
@source co-mrg title="batch 병합 호출" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/coordinator.ts lines=907:935
@source ct-peer title="worker용 peer note 도구" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=267:287
@source ex-spawn title="worker thread 시작과 재개" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/executor.ts lines=455:476
@source ex-input title="worker 입력에 붙는 skill 읽기 지시" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/executor.ts lines=480:484
@source ps-mt title="project 설정 시간 한도" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/project-config.schema.json lines=24:28
@source ps-val title="project 설정 validation 파일" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/project-config.schema.json lines=104:108
@source ps-deep title="project 설정 deep 값" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/project-config.schema.json lines=109:157
@source pre-id title="worker permission profile 이름" path=codex-security/plugins/codex-security/mcp-app/src/deep-scan/permission-profile-preflight.ts lines=13:15
@source srv-insp title="setup 확인 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=796:801
@source srv-ui title="사용자 선택 대체 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=681:686
@source srv-desc title="Deep scan 시작 도구 설명" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=892:900
@source srv-chk title="Deep scan 시작 입력 검사" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=912:954
@source srv-done title="Deep scan 완료 분기" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=955:998
@source srv-cancel title="취소 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1200:1208
@source srv-fail title="실패 처리 도구" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=1624:1631
@source cfg-def title="번들 기본값" path=codex-security/plugins/codex-security/scripts/deep_scan_defaults.json lines=1:8
@source cfg-path title="사용자 TOML 경로" path=codex-security/plugins/codex-security/scripts/deep_scan_config.py lines=36:48
@source cfg-res title="설정 우선순위와 출처 라벨" path=codex-security/plugins/codex-security/scripts/deep_scan_config.py lines=56:122
@source cfg-req title="설정 값 검증" path=codex-security/plugins/codex-security/scripts/deep_scan_config.py lines=125:147
@source cdt-path title="범위 경로 검사" path=codex-security/plugins/codex-security/scripts/check_deep_scan_target.py lines=13:42
@source cdt-empty title="빈 대상 거부" path=codex-security/plugins/codex-security/scripts/check_deep_scan_target.py lines=75:87
@source mcp-t title="MCP 서버 시간 제한" path=codex-security/plugins/codex-security/.mcp.json lines=65:66
@source test-set title="동시 Deep scan 시험 준비" path=codex-security/plugins/codex-security/tests/test_deep_security_scan_concurrency_guard.py lines=14:19
@source test-assert title="동시 Deep scan 시험 기대값" path=codex-security/plugins/codex-security/tests/test_deep_security_scan_concurrency_guard.py lines=48:70

## 에이전트는 deep scan을 어떻게 시작하고 보고하나? {#agent-flow span=12}

SKILL.md는 다섯 단계를 번호 목록으로 쓴다. 그림은 그 다섯 단계를 "scan ID가 있는가"로 먼저 가른 뒤 한 줄로 이어 그렸다.[](source:sk-1)[](source:sk-5)

설명용 예시로, 사용자가 "이 저장소를 철저하게 여러 번 감사해 줘"라고 하고 host가 scan ID를 주지 않았다면 에이전트는 새 대상 경로를 탄다. 저장소 경로를 `targetPath`로 정하고 `scope: "."`로 두어 설정을 보인 뒤 시작 도구를 부른다.[](source:sk-1)[](source:sk-2)[](source:sk-4)

@workflow id=agent-start title="에이전트의 시작과 보고"
| ask | deep 감사 요청 | external | source:front |
| hasid | scan ID가 있나? | backend | source:sk-1 |
| ctx | scan context 읽기 | backend | source:sk-1 |
| mode | 저장된 mode는? | backend | source:sk-1 |
| hand | 대응 스킬로 계속 | external | source:sk-1 |
| set | 설정과 출처 보이기 | backend | source:sk-2 |
| busy | 다른 Deep scan이 있나? | backend | source:sk-3 |
| pick | 사용자 선택 | security | source:sk-3 |
| cancel | 새 scan 취소 | external | source:sk-3 |
| adv | 접근 안내 확인 | backend | source:adv |
| run | 시작하고 대기 | backend | source:sk-4 |
| rep | 결과 보고 | external | source:sk-5 |
| ask > hasid | |
| hasid > ctx | 있음 |
| hasid > set | 없음 |
| ctx > mode | |
| mode > hand | Standard·diff |
| mode > busy | Deep |
| busy > pick | 있음 |
| busy > adv | 없음 |
| pick > cancel | Cancel |
| pick > adv | Continue |
| set > adv | |
| adv > run | |
| run > rep | 끝남 | emphasis |

@steps id=agent-start-steps
| ask | deep 감사 요청 | 에이전트는 사용자의 요청이 deep, exhaustive, multi-pass 감사인지 판단한다. description은 모델이 호출을 판단할 때 참고하는 설명이고 특정 단어가 있어야 켜지는 사전이 아니다. 판단 기준은 description 한 문장뿐이고, `disable-model-invocation` 같은 호출 제한 필드는 frontmatter에 원문에 명시 없음이다. 요청이 PR, commit, branch, working tree 변경분이면 이 스킬이 아니라 `security-diff-scan`으로 간다. 이 노드가 다음으로 넘기는 것은 감사할 저장소나 지정 경로다.[](source:front)[](source:yaml) | agent-start | ask |
| hasid | scan ID가 있나? | 에이전트는 host가 scan ID와 `handoffClaimToken`을 넘겼는지 본다. 있으면 1단계의 이어 실행 경로로 가고, 없으면 새 대상으로 허가된 target과 scope를 직접 확정한다. 지정 디렉터리를 감사할 때는 그 디렉터리를 `targetPath`로 쓰고 `scope`는 항상 `"."`이다. 원문에 명시 없음: 3단계가 말하는 "새로 시작한 native scan의 scan ID"가 1단계의 이어 실행과 같은 경로인지는 두 문장이 서로를 가리키지 않는다. 판정: 둘 다 scan ID로 들어오는 경로이므로 같은 경로로 읽었다.[](source:sk-1)[](source:sk-3) | agent-start | hasid |
| ctx | scan context 읽기 | 에이전트는 받은 `scanId`와 `handoffClaimToken`으로 `get_codex_security_scan_context`를 한 번 부른다. 돌려받은 scan 정체성, 폴더, 대상, scope, mode, 사용자가 준 context 원문, token을 그대로 보존하고 저장된 정체성과 scope를 쓴다. 필요한 context가 없거나 형식이 틀리거나 다른 mode의 것이면 식별자를 지어내거나 대체 scan을 만들거나 대상을 넓히지 않는다. 그 진입 스킬이 원래 하던 오류 처리나 라우팅을 따른다. 소스 접근과 context 갱신은 `scan-prologue.md`를 따른다.[](source:sk-1)[](source:sp-own)[](source:sp-ctx) | agent-start | ctx |
| mode | 저장된 mode는? | 에이전트는 돌려받은 저장 mode를 읽는다. mode가 Standard나 diff이면 이 스킬로 계속하지 않고 대응하는 scan 스킬로 이어 간다. 대응 스킬의 이름은 원문에 명시 없음이고, 판정으로 `security-scan`과 `security-diff-scan`으로 읽는다. mode가 Deep일 때 무엇을 하라는 문장은 없다. 판정: 이 경우는 이어지는 3~5단계로 진행하는 것으로 읽었다.[](source:sk-1) | agent-start | mode |
| hand | 대응 스킬로 계속 | 이 스킬은 여기서 끝난다. 에이전트는 저장된 scan 정체성과 scope를 그대로 들고 Standard 또는 diff 스킬의 절차로 이어 간다. Deep 시작 도구는 부르지 않는다. 이 방향은 도구 쪽에서도 맞물린다. `start_codex_security_deep_scan`은 새 대상에 `scope: "."`만 받으므로 변경분 scan은 이 도구로 시작할 수 없다.[](source:sk-1)[](source:srv-chk) | agent-start | hand |
| set | 설정과 출처 보이기 | 새 대상일 때만 에이전트가 `inspect_codex_security_setup({ targetPath, scope: ".", mode: "deep", projectConfigPath? })`를 부른다. 이 도구는 설정을 저장하지 않고 모델 작업 전에 실효 한도와 각 값의 출처를 돌려준다. 에이전트는 그 설정과 출처를 사용자에게 보인다. 프로젝트 설정 파일은 사용자가 고른 경우에만 넘긴다. `max_discovery_runs`는 같이 도는 Standard scan까지 센 총 횟수 상한임도 함께 알린다. 이어 실행하는 scan은 저장된 설정을 쓰므로 이 노드를 건너뛴다.[](source:sk-2)[](source:srv-insp) | agent-start | set |
| busy | 다른 Deep scan이 있나? | 새로 시작한 native scan이 scan ID를 받았으면 에이전트는 `get_codex_security_scan_context` 결과의 `otherRunningDeepScans`를 한 번 살핀다. 대상 기반 setup 미리 보기에는 scan ID가 없으므로 이 확인이 없다. 시험은 이 목록의 범위를 보여 준다. 현재 scan, Standard scan, 실패한 scan, 완료된 scan은 목록에서 빠지고 실행 중인 다른 Deep scan만 `phase`, `scanId`, `startedAt`, `targetPath`, `updatedAt`로 나온다. 목록이 비어 있으면 곧바로 접근 안내 확인으로 간다.[](source:sk-3)[](source:test-set)[](source:test-assert) | agent-start | busy |
| pick | 사용자 선택 | 다른 Deep scan이 있으면 에이전트는 그 대상, phase, 사람이 읽기 쉬운 시작 시각을 보이고 추가 CPU, 메모리, token 사용을 설명한다. 이어서 `Cancel (Recommended)`와 `Continue`를 `request_user_input`으로 묻는다. 없으면 `request_codex_security_user_input`, 그것도 없으면 평문 채팅으로 묻는다. 명시적 선택이 올 때까지 기다리며 닫힌 dialog는 취소가 아니다. `request_codex_security_user_input`은 headless나 자동화 같은 비대화형 세션에서는 부르지 않는다. Continue를 고르면 다음 노드로, Cancel을 고르면 취소 노드로 간다.[](source:sk-3)[](source:srv-ui) | agent-start | pick |
| cancel | 새 scan 취소 | 사용자가 Cancel을 고르면 에이전트는 새로 시작한 scan만 취소한다. 이미 돌고 있던 다른 Deep scan은 건드리지 않는다. 3단계 문장은 취소 도구 이름을 적지 않는다. 4단계가 명시 취소에 `cancel_codex_security_scan({ scanId })`를 owning thread에서 부르라고 하므로 판정으로 같은 도구로 읽었다. 이 도구는 owning thread 컨텍스트가 없으면 거부하고, 도구 설명은 진행 중인 SDK worker도 함께 취소한다고 쓴다.[](source:sk-3)[](source:sk-4)[](source:srv-cancel) | agent-start | cancel |
| adv | 접근 안내 확인 | 에이전트는 시작 도구를 부르기 직전에 `access-advisory.md`를 따른다. `get_codex_security_daybreak_access`가 세션에 이미 있을 때만 부르고, 없거나 Bedrock이나 API-key 전용 세션이면 조용히 건너뛴다. 실패, `unknown`, `stale: true`이면 경고 없이 계속한다. fresh `granted`이면 상태와 Daybreak program을 보고하고, fresh `not_granted`이면 다른 시작 진행보다 먼저 눈에 띄는 경고와 `enrollmentUrl`(없으면 `https://chatgpt.com/cyber`) 링크를 보인다. 어느 경우든 안내는 scan을 허가하거나 막지 않고, 반복해서 부르지도 않는다.[](source:adv) | agent-start | adv |
| run | 시작하고 대기 | 에이전트는 scan ID가 있으면 `start_codex_security_deep_scan({ scanId, handoffClaimToken? })`를, 새 대상이면 `start_codex_security_deep_scan({ targetPath, scope: ".", userContext?, projectConfigPath? })`를 부른다. 설정 때 고른 프로젝트 파일을 다시 쓴다. 도구가 끝날 때까지 기다리고, 도구 실행기가 실행 중인 cell ID를 돌려주면 그 cell이 scan 결과를 돌려줄 때까지 기다린다. 연결이 끊기면 같은 인자로 다시 붙는다. 결과는 JSON으로 읽기 전에 `isError: true`나 실패 종료 코드를 먼저 확인한다. 끝난 scan이 terminal failure이면 저장된 결과와 함께 보고하고, 정책 거부이면 가능할 때 저장된 오류에서 worker를 가려 밝힌다. 명시 취소만 `cancel_codex_security_scan`으로 처리한다.[](source:sk-4)[](source:sp-res)[](source:sp-cancel) | agent-start | run |
| rep | 결과 보고 | 에이전트는 SDK가 소유한 scan이면 host의 scan ID와 manifest 경로를 돌려주고 끝낸다. 그 밖에는 도구가 `completion`을 돌려줄 때 생성된 `report.md`와 canonical artifacts를 링크한다. `completion.scan.usage`와 별도 비용 추정으로 usage를 `final-report.md`에 따라 보고한다. 감사가 끝났는데 finding이 0개인 경우와 첫 감사가 끝나기 전에 마감에 닿은 경우를 구분해 말한다. finalization이 성공하고 `report.md`가 있기 전에는 완료를 주장하지 않는다. 승인 없이 추가 외부 작업이나 scan을 시작하지 않는다.[](source:sk-5)[](source:fr-own)[](source:fr-resp) | agent-start | rep |

그림이 뺀 것이 있다. 연결 끊김 뒤의 재접속, terminal failure 보고, 명시 취소 처리는 `run` 노드 설명에 문장으로 풀었다. 이 경로들을 원문상 불가능한 경로로 읽으면 안 된다.

시작 도구는 입력을 먼저 검사하고 어긋나면 `isError` 결과로 거부한다. `scanId`와 `targetPath`는 정확히 하나만 받는다. `scanId`가 있으면 `scope`, `userContext`, `projectConfigPath`를 생략해야 하고, 저장된 scan이 권위를 가진다.[](source:srv-chk)

`targetPath`로 시작할 때는 `scope`가 `"."`이어야 하고 `handoffClaimToken`은 받지 않는다. owning Codex thread 컨텍스트가 없어도 거부한다.[](source:srv-chk)

## host 코디네이터는 감사를 어떻게 반복하고 언제 멈추나? {#coordinator-panel span=12}

반복은 에이전트가 아니라 코디네이터가 한다. 에이전트가 시작 도구를 부르면 코디네이터가 worker를 배정하고 결과를 병합하고 멈출지 정한다. 아래 그림은 코드의 반복문을 줄여 그렸다. 재개 때 저장된 횟수를 복원하는 부분과 worker가 실패해 교체되는 부분은 `@steps`에 문장으로 풀었다.[](source:sp-coord)[](source:co-init)[](source:co-out)

@workflow id=coordinator-loop title="코디네이터의 반복 loop"
| plan | worker 배정 | backend | source:co-disp |
| audit | Standard 감사 | backend | source:dd-cfg |
| merge | 병합과 새 결과 세기 | database | source:co-merge |
| errq | 연속 오류 한도인가? | backend | source:co-err |
| stopq | 멈출 조건인가? | backend | source:co-stop |
| fail | 오류로 종료 | security | source:co-err |
| seal | 봉인과 보고 | external | source:srv-done |
| plan > audit | 이전 finding 전달 |
| audit > merge | |
| merge > errq | |
| errq > fail | 예 |
| errq > stopq | 아니오 |
| stopq > plan | 아니오 | emphasis |
| stopq > seal | 예 |

@steps id=coordinator-loop-steps
| plan | worker 배정 | 코디네이터는 `workers`와 `maxDiscoveryRuns`에서 이미 배정한 수를 뺀 값 중 작은 수만큼 worker를 새로 배정한다. 배정한 수는 worker가 실행되기 전에 총 배정 횟수에 더한다. 그래서 실패한 worker도 이미 센 값이고, 그 자리를 채우려고 새로 배정한 worker도 다시 센다. 지금까지 병합된 finding이 있으면 각각 `경로:줄 제목` 문자열로 만들어 함께 넘긴다. 경로와 줄은 `root_control` 위치를 우선하고 없으면 첫 위치를 쓴다. 첫 batch에는 넘길 finding이 없다.[](source:co-disp)[](source:tpl-prev) | coordinator-loop | plan |
| audit | Standard 감사 | 각 worker는 별도 SDK session에서 prompt 템플릿을 받는다. 템플릿은 worker에게 Standard scan 하나를 돌리라고 하고, `core-scan.md`를 직접 읽어 그 감사를 따르라고 한다. 감사 범위는 `includePaths`가 정한 경로이고 기본값은 scope 하나다. 넘어온 이전 finding 제목은 untrusted data로 취급하고 "다른 도달 경로와 서로 다른 결함을 우선하라"는 문장이 prompt에 붙는다. 기존 reviewer false-positive 피드백 파일이 있으면 읽되, 기록된 이유가 현재 소스와 통제에서도 유효할 때만 일치하는 finding을 억제한다. worker 내부 절차는 아래 worker 절에서 따로 설명한다.[](source:dd-cfg)[](source:tpl-ctx)[](source:tpl-prev)[](source:tpl-fp)[](source:ex-input) | coordinator-loop | audit |
| merge | 병합과 새 결과 세기 | 코디네이터는 받아들인 audit를 launch 순서대로 병합하고 audit마다 새로 더해진 finding 수를 얻는다. 수가 0이면 연속 무발견 횟수를 하나 올리고 하나라도 있으면 0으로 되돌린다. 이 횟수는 batch가 아니라 audit마다 센다. 재개할 때는 저장소에 남은 worker 결과를 dispatch 순서로 다시 재생해 연속 오류 수를 되살린다. 병합 결과는 dedup 폴더의 `result.json`에 원자적으로 쓰고, 연속 무발견 횟수와 연속 오류 수를 함께 저장소에 기록한다. 판정: 병합 중복 판단은 비교용 호출(`compareReports`)로 이루어지는 것으로 읽었다. 중복 판정 알고리즘 자체는 읽지 않았다. 비교 호출이 되돌릴 수 없는 오류를 내면 이미 받은 worker를 checkpoint한 뒤 중단한다.[](source:co-merge)[](source:co-mrg)[](source:co-replay)[](source:co-init) | coordinator-loop | merge |
| errq | 연속 오류 한도인가? | worker가 성공하면 연속 오류 수를 0으로 되돌리고, 교체할 수 있는 실패면 하나 올린다. 교체할 수 없는 실패는 한도와 관계없이 그 오류로 바로 끝난다. 마감 때문이 아닌데 worker가 예상치 못하게 취소되어도 오류로 끝난다. 연속 오류 수가 `stopAfterConsecutiveErrors`에 닿고 마지막 실패가 있으면 다음 판단으로 넘어가지 않고 오류로 끝난다. 기본값은 3이다.[](source:co-err)[](source:co-out)[](source:cfg-def) | coordinator-loop | errq |
| stopq | 멈출 조건인가? | 코디네이터는 마감에 닿았거나, 연속 무발견 횟수가 `stopAfterNoNew`에 닿았거나, 배정한 수가 `maxDiscoveryRuns`에 닿았으면 멈춘다. 그렇지 않으면 다음 batch를 배정하러 돌아간다. 멈춘 이유는 마감에 닿지 않았고 연속 무발견일 때만 `saturated`이고, 배정 상한이나 마감이면 `capped`이다. 한도에 닿았는데 받아들인 audit가 하나도 없고 마감 때문도 아니면 "configured discovery limit without accepting a complete discovery" 오류로 끝난다. 마감 때문이면 이 오류 없이 `capped`로 끝난다. 이 판단은 방금 batch를 끝까지 병합한 뒤에 하므로 한 batch 안에서 횟수가 한도를 넘어도 그 batch는 모두 반영된다.[](source:co-stop)[](source:co-merge) | coordinator-loop | stopq |
| fail | 오류로 종료 | 코디네이터는 마지막 실패의 종류와 메시지를 담아 연속 오류 한도 오류를 던지고 반복을 끝낸다. 메시지의 정확한 문구는 읽지 않았다. 에이전트 쪽에서는 SKILL.md 4단계가 terminal failure를 저장된 결과와 함께 보고하라고 한다. 원문에 명시 없음: 오류로 끝난 scan의 `scan.status` 값이 `failed`가 되는지, 저장된 checkpoint가 어떻게 남는지는 읽은 줄에서 확인하지 못했다.[](source:co-err)[](source:sk-4)[](source:sc-status) | coordinator-loop | fail |
| seal | 봉인과 보고 | 반복이 `saturated` 또는 `capped`로 돌려준 뒤 scan은 봉인되고 `report.md`가 생긴다. 읽은 코드에서는 시작 도구의 처리기가 scan이 성공했고 SDK가 완료를 소유하지 않을 때 workbench의 `complete-scan`을 불러 `scan.progress.status`, `reportAvailable`, usage, 비용 추정을 돌려준다. 완료 호출이 실패하면 오류와 scan ID를 돌려준다. 한편 도구 설명과 `final-report.md`는 호출자가 떨어져 나가도 코디네이터가 부모 scan을 봉인한다고 쓴다. 봉인 계약은 whole-repository Deep scan의 mode로 `deep_repository`를 쓰라고 한다. 마감 전에 끝나지 못한 검토가 있으면 host가 유효한 checkpoint finding과 남은 작업을 마감 사유와 함께 보존한다.[](source:srv-done)[](source:srv-desc)[](source:fr-own)[](source:sc-modes)[](source:sc-dm)[](source:sc-deep) | coordinator-loop | seal |

설명용 예시로 기본값(workers 4, `stopAfterNoNew` 4, `maxDiscoveryRuns` 40)에서 첫 batch의 audit 4개가 새 finding을 `[2, 0, 0, 0]`개씩 더했다면 첫 audit 때문에 연속 무발견 횟수는 0으로 유지되고 이어진 0 세 번으로 3이 된다. 다음 batch에서 audit 하나만 0을 더해도 횟수는 4가 되어 이번 batch를 끝까지 병합한 뒤 `saturated`로 멈춘다. 첫 batch가 `[0, 0, 0, 0]`이면 횟수가 4에 닿아 batch 하나로 멈춘다. 상한 쪽은 `maxDiscoveryRuns`가 10이라고 가정하면 `min(4, 10-0)`, `min(4, 10-4)`, `min(4, 10-8)`로 4, 4, 2개를 배정하고 합이 10이 되어 `capped`로 멈춘다.[](source:co-merge)[](source:co-stop)[](source:co-disp)

기본값과 시간 한도는 다음과 같다. 모두 설정으로 바꿀 수 있는 값이다.[](source:cfg-def)

@facts id=deep-defaults
| `workers` | 4. 동시에 도는 discovery worker의 최대 수 |
| `subagents` | 3. worker마다 쓸 수 있는 subagent 수. 0도 허용한다 |
| `stopAfterNoNew` | 4. 새 결과 없이 이어진 audit가 이 수에 닿으면 중지 |
| `stopAfterConsecutiveErrors` | 3. 연속 discovery 오류가 이 수에 닿으면 오류로 종료 |
| `maxDiscoveryRuns` | 40. 같이 도는 Standard scan까지 센 총 배정 상한 |
| `maxTimeHours` | 96. project schema의 `max_time_minutes`는 기본·최대 5760분이고 5760 ÷ 60 = 96시간이다 |

마감은 scan이 만들어진 시각에서 잰다. 저장된 생성 시각이 없으면 지금부터 잰다. 한도는 코디네이터 옵션이 있으면 그 값, 없으면 설정의 `maxTimeHours`, 그것도 없으면 96시간이다.[](source:co-dl)

남은 시간이 0 이하이면 곧바로 멈추고, 아니면 타이머를 걸어 마감에 닿을 때 discovery를 중단 신호로 멈춘다.[](source:co-dl)[](source:co-dl-stop)

마감 전에 끝난 audit가 하나도 없을 때를 위해 "configured discovery time limit elapsed before any source review completed"라는 문구가 상수로 있다. MCP 서버의 도구 timeout은 349200초로 설정되어 있고 349200 ÷ 3600 = 97시간이다. 판정: 96시간 마감보다 1시간 길어 마감 뒤 마무리 시간을 두는 값으로 읽히지만 이유는 원문에 명시 없음이다.[](source:co-dl)[](source:co-dl-stop)[](source:co-const)[](source:ps-mt)[](source:mcp-t)

설정은 위에서부터 우선한다. 프로젝트 설정 파일이 가장 앞서고, 다음이 사용자 TOML, 마지막이 번들 기본값이다. 사용자 TOML은 `CODEX_SECURITY_DEEP_SCAN_CONFIG_PATH`가 있으면 그 경로, 없으면 `$CODEX_HOME/codex-security/config.toml`이고 `CODEX_HOME`이 비어 있으면 `~/.codex`를 쓴다. `[deep_scan]` 표만 읽고 모르는 키는 오류로 거부한다.[](source:cfg-path)[](source:cfg-res)

설정 해석기가 값마다 붙이는 출처 라벨은 `project`, `default`, 그리고 사용자 TOML 값에 붙는 `legacy`이다.[](source:cfg-res)[](source:cfg-path)

값 검증은 `workers`, `stopAfterNoNew` 등은 1 이상의 정수, `subagents`는 0 이상의 정수, 시간은 0 초과 96 이하의 수다. `workers`에 `"auto"`를 주면 기본값 4가 된다. project schema에서 `max_time_hours`는 deprecated이고 `scan.validation_file`은 active deep scan에서 지원하지 않는다.[](source:cfg-res)[](source:cfg-path)[](source:cfg-req)[](source:ps-deep)[](source:ps-val)

## 각 worker는 한 번의 감사에서 무엇을 하나? {#worker-audit span=12}

worker 하나가 하는 일은 Standard 감사 하나다. `security-scan`도 같은 `core-scan.md`를 쓰므로 두 스킬은 이 문서를 공유한다. 다만 Deep 쪽이 `security-scan`의 SKILL.md를 호출한다는 문장은 없다.[](source:ss-core)[](source:dd-cfg)

worker 입력에는 "assigned workflow가 Codex Security 스킬을 부르면 `codex-security:` 접두어를 떼고 `skills/<이름>/SKILL.md`를 읽으라"는 일반 지시만 붙는다.[](source:dd-cfg)[](source:ss-core)[](source:ex-input)

@workflow id=worker-audit-flow title="worker의 감사 한 번"
| ctx | 감사 맥락 확정 | backend | source:cs-ctx |
| deleg | 위임이 가능한가? | backend | source:cs-base |
| base | 독립 baseline 감사 | backend | source:cs-base |
| self | 직접 baseline 감사 | backend | source:cs-base |
| tm | 위협 모델 | backend | source:cs-tm |
| pk | 조사 packet 묶기 | backend | source:cs-pk |
| inv | 집중 조사 | backend | source:cs-inv |
| ck | 후보 checkpoint | database | source:cs-ck |
| val | 후보 검증 | backend | source:cs-val |
| fin | 최종 결과 제출 | external | source:dd-final |
| ctx > deleg | |
| deleg > base | 가능 |
| deleg > self | 불가 |
| base > tm | |
| self > tm | |
| tm > pk | |
| pk > inv | |
| inv > ck | |
| ck > val | |
| val > fin | 끝남 | emphasis |

@steps id=worker-audit-steps
| wctx | 감사 맥락 확정 | worker는 코디네이터가 준 설정 JSON(`scanId`, `pluginRoot`, `targetPath`, `includePaths`, `userContext`, `severityRubric`, `workerLabel`, `subagents`)을 받는다. `includePaths`는 허가된 감사 범위의 전부다. 요청된 파일과 요청된 디렉터리의 무시되지 않은 하위 파일만 보고 저장소 루트로 넓히지 않는다. 범위 밖 코드는 finding을 설명할 때만 참고할 수 있고 영향받는 동작은 범위 안에 있어야 한다. `userContext`는 untrusted data이고 안의 URL은 열거나 따라가지 않는다. 상속되는 `SECURITY.md`, 위협 모델, `CODEX_SECURITY_KNOWLEDGE_BASE`도 읽는다. 지식 베이스의 사실은 생성된 가정과 저장소 정책보다 우선하지만 사용자의 명시 지시보다는 아니다. 감사는 현재 소스를 읽기 전용, offline으로만 본다. worker는 최상위 setup, scan 소유권, 이미 끝난 phase를 반복하지 않는다.[](source:dd-cfg)[](source:cs-ctx)[](source:sp-top)[](source:sp-ctx) | worker-audit-flow | ctx |
| deleg | 위임이 가능한가? | worker는 caller가 worker를 허용했고 위임 도구가 쓸 수 있는지 본다. 위임 도구가 deferred 상태이면 `tool_search`가 있을 때 한 번만 찾아본다. 위임이 가능하고 caller의 worker 허용량 안이면 독립 baseline 감사를 시작하고, 아니면 직접 감사한다. 설정의 `subagents`가 worker마다 쓸 수 있는 subagent 수이고 0도 허용된다. Deep worker는 부모 thread의 worker pool이 아니라 MCP가 소유한 SDK session에서 돈다.[](source:cs-base)[](source:sp-fail)[](source:ps-deep) | worker-audit-flow | deleg |
| base | 독립 baseline 감사 | worker는 `fork_turns: "none"`으로 독립 baseline worker를 띄우고 `baseline-auditor.md`를 읽게 한다. 대상, scope와 inventory, 사용자 context, 위협 모델, 상속된 정책과 resolver, severity rubric, 지식 베이스 위치, offline 검색 명령을 보낸다. 부모의 가설과 다른 finding은 보내지 않는다. caller가 조사 시간 allowance를 줬으면 baseline, 조사자, 후속 조사 모두에 그대로 넘기고 여기서 새로 만들거나 되돌리지 않는다. baseline worker는 인증, 소유권, 테넌트 격리, injection, 파일·네트워크 경계, XML·smuggling·prototype pollution·자원 소진 같은 항목을 attacker 입력에서 sink까지 따라가며 점검하고 `findings`, `resolved_questions`, `reviewed_files`를 JSON으로 돌려준다. 이 하위 worker는 scan을 시작하거나 위임하거나 앱 코드를 실행하거나 파일을 고치거나 외부 서비스에 접근하거나 발견한 credential을 쓰거나 도구를 내려받을 수 없다.[](source:cs-intro)[](source:cs-base)[](source:ba-chk)[](source:ba-lim) | worker-audit-flow | base |
| self | 직접 baseline 감사 | 위임이 불가하면 worker가 `baseline-auditor.md`를 직접 읽고 같은 점검을 하며, 그 감사에 독립 검토자가 없었다고 기록한다. 독립 검토를 하지 못한 사실이 결과에 남는다는 점이 이 갈림의 핵심이다.[](source:cs-base) | worker-audit-flow | self |
| tm | 위협 모델 | worker는 `threat-model.md`를 읽어 구조와 보안 경계를 잡고 중요한 주장은 소비하는 코드에서 확인한다. 이미 주어진 모델은 바꾸지 않는다. 직접 만든 모델은 finding이 아직 없어도 `complete: false`, `findings: []`인 이른 checkpoint에 보관하고 최종 조립까지 근거를 유지한다. 구조 파악만으로는 감사 coverage가 채워진 것이 아니다. 원문은 이 파일의 경로를 적지 않았고 읽지 않았다. 판정: 부모 scan의 첫 모델이 `scan.threatModel`에 남고 다른 worker의 모델은 worker 기록에 남는다.[](source:cs-tm)[](source:sc-tm) | worker-audit-flow | tm |
| pk | 조사 packet 묶기 | worker는 가능성 있는 질문을 공격자, 보호 대상, 진입점, 기대 통제, 민감 동작, 소스 anchor로 묶어 조사 packet을 만든다. 서로 다른 경계와 메커니즘은 따로 둔다. packet은 작업용 맥락일 뿐 별도 필수 산출물이나 ledger가 아니다.[](source:cs-pk) | worker-audit-flow | pk |
| inv | 집중 조사 | worker는 독립적으로 볼 packet 묶음을 caller의 worker 허용량 안에서 위임하고, 부모가 맡은 packet은 `focused-investigator.md`를 직접 읽어 조사한다. 위임 수는 복잡도와 공유 코드로 정하고 고정하지 않는다. 조사자는 attacker 입력에서 앞으로, 또는 민감 동작에서 거꾸로 따라가며 guard가 확인한 대상과 실제 동작이 쓰는 대상을 비교하고 검사가 첫 민감 효과 전에 일어나는지 본다. 길을 따라가다 다른 깨진 통제를 만나면 범위와 남은 예산 안에서 따라가며, 원래 가설의 처분은 새 finding과 따로 기록한다. 같은 통제를 쓰는 형제 동작과 구현도 점검한다. 조사자도 baseline worker와 같은 금지 목록을 받는다.[](source:cs-inv)[](source:fi-inv)[](source:fi-lim) | worker-audit-flow | inv |
| ck | 후보 checkpoint | worker는 돌아온 후보와 반증을 합치거나 검증하기 전에 `record_codex_security_scan_draft`로 보존한다. `complete: false`, 안정적인 `candidateId`, 이유와 원본 payload를 담은 `reviewState.deferred`를 쓴다. Deep worker의 draft 도구는 worker에게 묶여 있다. 후보나 검증된 finding이 생기는 즉시, 그리고 검증 판정을 내릴 때마다 저장한다. 저장한 checkpoint가 worker의 완료는 아니다.[](source:cs-ck)[](source:dd-save)[](source:as-own)[](source:fr-own) | worker-audit-flow | ck |
| val | 후보 검증 | worker는 caller가 검증 handoff를 줬으면 따르고, 없으면 후보마다 소스에 비추어 검증한다. 받아들인 finding은 `provenance.candidateId`를 유지한다. 기각은 후보 정체성, 원래 근거, 소스에 기반한 반증을 `rejected` coverage surface에 남긴다. severity는 이 scan에 주어진 rubric으로 매기고 없으면 기본 rubric을 쓴다. 자기 자신에게만 영향을 주거나 권한이 있어야만 가능한 동작은 의미 있는 추가 보안 영향이 없으면 제외한다. 소스에 노출된 credential은 소스를 읽는 사람이 읽기 이상의 권한을 얻으면 disclosure 경로로 보며, 발견한 credential을 쓰거나 서비스에 연락해 검증하지 않는다. 같은 깨진 통제와 같은 수정으로 묶이는 관찰만 한 finding으로 묶는다. 검증 방법을 자세히 적은 `validate-scan-findings.md`와 `default-severity-rubric.md`는 읽지 않았다.[](source:cs-val)[](source:cs-ck)[](source:cs-sev)[](source:cs-sec)[](source:dd-sev) | worker-audit-flow | val |
| fin | 최종 결과 제출 | worker는 같은 도구로 `complete: true`와 남긴 finding, 명시적 기각, 미해결 작업을 한 번 제출한다. 거부되면 보고된 필드만 고쳐 다시 제출하고 다른 결과를 버리지 않는다. 최종 수락 뒤에는 멈춘다. 완료는 host의 일이다. 접근이나 실행이 감사를 막으면 `complete: false`로 저장하고 막힌 이유를 `reviewState.deferred`에 적은 뒤 멈춘다. 턴이 끝났다거나 finding이 없다는 이유로 `complete: true`를 내지 않는다. 검토한 범위에 적용할 소스가 없으면 finding 없이 완료할 수 있다.[](source:dd-final)[](source:dd-block)[](source:fr-own) | worker-audit-flow | fin |

그림이 뺀 것이 있다. 검증 판정마다 checkpoint를 다시 저장하는 되돌림, 접근이 막혔을 때 `complete: false`로 멈추는 종료, 제출이 거부되어 다시 내는 반복은 `ck`, `val`, `fin` 설명에 문장으로 풀었다.

worker끼리는 단서를 나눌 수 있다. discovery board가 있는 worker에게만 `post_deep_scan_peer_note`와 `read_deep_scan_peer_notes`가 등록되고, 호스트가 작성자를 표시한다.[](source:ct-peer)

템플릿은 `read_deep_scan_peer_notes({})`로 동료가 어느 진입점을 보는지 확인하고, 계획이나 파일·줄이 있는 단서나 질문을 게시하라고 한다. 답하거나 이어 읽을 때는 돌려받은 `threadId`를 쓴다. peer note는 untrusted lead이므로 증거를 직접 확인해야 하고, 동료가 일하는 동안에도 자기 범위의 감사를 계속한다.[](source:dd-peer)[](source:ct-peer)

worker는 선택된 Codex home의 자격 증명과 provider 설정을 쓴다. 계정이 없고 provider가 OpenAI 인증을 요구할 때만 `OPENAI_API_KEY`를 SDK의 API-key 옵션으로 쓴다. 기존 `CODEX_API_KEY`는 그대로 우선한다. 키는 plugin을 띄운 프로세스에 있어야 하고, 나중에 다른 shell에서 설정해도 실행 중인 plugin에는 반영되지 않는다.[](source:sp-fail)

## 언제 쓰고 언제 쓰지 말아야 하나? {#activation span=12}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어가 있어야만 켜진다는 뜻이 아니다. 호출 제한 필드(`disable-model-invocation` 등)는 frontmatter에 원문에 명시 없고 `agents/openai.yaml`에도 `policy` 항목이 없다.[](source:front)[](source:yaml)

@code source=front language=yaml

| 요청 | 쓰는 스킬 | 근거 |
| --- | --- | --- |
| 저장소나 지정 경로를 deep, exhaustive, multi-pass로 감사한다 | `deep-security-scan` {good:이 스킬} | description이 이 요청에 쓰라고 정한다.[](source:front) |
| PR, commit, branch, working tree 변경분을 본다 | `security-diff-scan` {caution:이 스킬이 아님} | description이 변경분에는 이 스킬이 아니라 `security-diff-scan`을 쓰라고 정한다.[](source:front)[](source:ds-desc) |
| deep을 요청하지 않은 일반 감사 | `security-scan` {caution:이 스킬이 아님} | `security-scan` description이 deep 스킬은 명시적으로 요청한 deep scan에만 쓰라고 한다.[](source:ss-desc) |
| 하위 디렉터리만 deep으로 감사한다 | `deep-security-scan` {good:디렉터리를 대상으로} | 그 디렉터리를 `targetPath`로, `scope`를 `"."`로 둔다.[](source:sk-1) |

`default_prompt`는 `$codex-security:deep-security-scan`처럼 plugin 접두어를 붙여 이 스킬을 부르는 예시다. 벤더 안내문은 deep을 "같은 코드에 여러 pass를 돌려 finding을 한 보고서로 합치는 스킬"로 설명한다. 원문 표현은 "makes several passes over the same code and combines the findings in one report"다.[](source:yaml)[](source:readme)

이 스킬을 쓰면 안 되는 경우는 다음과 같다.

@list id=not-for
| 변경분 검토에는 쓰지 않는다. 시작 도구가 `scope: "."` 외의 scope를 거부하므로 변경분 scan은 이 도구로 시작할 수 없다.[](source:front)[](source:srv-chk) |
| deep을 요청하지 않았는데 쓰지 않는다. 일반 감사는 `security-scan`이다.[](source:ss-desc) |
| 이어 실행하는 scan의 저장된 mode가 Standard나 diff이면 이 스킬로 계속하지 않고 대응하는 scan 스킬로 계속한다.[](source:sk-1) |
| 선택한 대상에 파일이 없고 빈 디렉터리뿐이면 쓰지 않는다. 검사 스크립트가 "Deep Scan target is empty; no security audit was performed."라며 거부한다. 이 스크립트를 부르는 쪽은 읽지 않았다.[](source:cdt-empty) |
| 경로가 저장소 밖을 가리키거나 symbolic link를 지나면 쓰지 않는다. 같은 스크립트가 "Scope must be inside repo"와 "Requested scope must not contain symbolic links" 오류로 거부한다.[](source:cdt-path) |

## 이 스킬은 어떤 흐름 속에 있나? {#flow-position span=12}

이 스킬은 `scan-vulnerabilities` 묶음에서 대상 범위에 따른 선택지 중 하나다. 전체 흐름은 `codex-security/_group-scan-vulnerabilities/scan-vulnerabilities.html`에 있다. 그림은 앞과 뒤만 그렸고 변경분이나 Standard mode로 넘기는 갈래는 표에만 남겼다.

@workflow id=deep-scan-position title="deep-security-scan의 앞뒤"
| ss | security-scan | backend | source:ss-desc |
| dp | deep-security-scan | security | source:front |
| tf | track-findings | backend | source:tr-8 |
| vz | threat-model-visualize | backend | source:vis-10 |
| ss > dp | deep 요청 | emphasis |
| dp > tf | 봉인된 scan | emphasis |
| dp > vz | 위협 모델 | emphasis |

@steps id=deep-scan-position-steps
| ss | security-scan | 기본 단일 pass 감사다. description이 명시적으로 요청한 deep scan에는 deep 스킬을 쓰라고 정하지만 스킬 이름은 적지 않는다. 벤더 안내문은 `security-scan`을 일반 검토의 출발점으로 둔다. 선택은 사용자와 host가 하며 자동으로 넘어가지 않는다.[](source:ss-desc)[](source:readme) | deep-scan-position | ss |
| dp | deep-security-scan | 이 스킬이다. 위 흐름에서 받은 deep 요청으로 시작해 봉인된 scan과 `report.md`를 만든다. | deep-scan-position | dp |
| tf | track-findings | 봉인된 scan 하나의 finding을 provider 한 곳에 추적한다. `scan-manifest.json`과 `findings.json`을 읽고 보고서나 SARIF가 이를 대신하지 못한다. 쓰기 전에 payload를 미리 보이고 승인받는다. Deep이 봉인하는 scan은 같은 봉인 계약을 따르므로 같은 종류다. 다만 stopped 상태 bundle을 거부하는 검사 코드는 찾지 못했다.[](source:tr-8)[](source:tr-24)[](source:sc-docs) | deep-scan-position | tf |
| vz | threat-model-visualize | 기본 입력은 기존 위협 모델 artifact이고 scan이 끝났다고 자동으로 가져오지 않는다. Deep 부모는 첫 모델을 `scan.threatModel`에 두고 host가 그 primary 모델에서 `threatmodel.md`를 만든다. 다른 worker의 모델을 자동으로 합치는지는 원문에 명시 없고, 시각화 스킬은 snapshot을 조용히 합치지 않는다고 한다.[](source:vis-10)[](source:sc-tm) | deep-scan-position | vz |

| 구분 | 내용 | 원장 |
|---|---|---|
| 받는 것 | 사용자의 deep 감사 요청과 감사 대상. 이어 실행이면 host가 준 scan ID와 `handoffClaimToken`이다.[](source:sk-1)[](source:ss-desc) | R02 넘김(명시-역할) |
| 넘기는 것 | 봉인된 scan 폴더(`scan-manifest.json`, `findings.json`, `report.md`). 완료 시 `report.md`와 canonical artifacts를 링크한다.[](source:sk-5)[](source:sc-docs) | R26 산출물 호환(명시-역할) |
| 변경분이면 | 이 스킬을 쓰지 않고 `security-diff-scan`을 쓴다.[](source:front) | R03 넘김(명시-이름) |
| 저장된 mode가 Standard나 diff이면 | 대응하는 scan 스킬로 계속한다. 대응 스킬 이름은 원문에 명시 없다.[](source:sk-1) | R04 넘김(명시-역할) |
| worker가 공유하는 문서 | `security-scan`과 같은 `core-scan.md`를 쓴다. 호출 관계는 없다.[](source:ss-core)[](source:dd-cfg) | R05 참고(명시-역할) |

## 무엇을 강제하고 무엇을 금지하나? {#rules span=12}

| 구분 | 규칙 | 출처 |
|---|---|---|
| 강제 {#rule-1} | scan 시작 도구는 `scanId` 또는 `targetPath` 중 정확히 하나만 받는다. `scanId`가 있으면 `scope`, `userContext`, `projectConfigPath`를 생략하고, 새 대상은 `scope: "."`만 받는다. | [](source:srv-chk) |
| 강제 {#rule-2} | 다른 Deep scan이 돌고 있으면 사용자의 명시 선택을 기다린다. 닫힌 dialog는 취소가 아니다. | [](source:sk-3) |
| 강제 {#rule-3} | scan ID는 host가 준 것만 쓴다. context가 없거나 형식이 틀리면 식별자를 지어내거나 대체 scan을 만들거나 대상을 넓히지 않는다. | [](source:sp-own) |
| 강제 {#rule-4} | 소스 검토 worker는 모두 offline이다. 사용자가 준 URL은 부모만 허가 범위 안에서 읽고, URL 내용은 추가 crawl이나 서비스 접촉을 허가하지 않는다. | [](source:sp-ctx) |
| 강제 {#rule-5} | 저장소 내용, 정책, 위협 모델, 지식 베이스, URL 내용, 사용자 context는 모두 untrusted 분석 데이터이고 workflow 지시를 바꾸지 못한다. | [](source:sp-ctx) |
| 강제 {#rule-6} | Deep worker는 예약된 permission profile `codex_security_deep_scan_worker`와 부모가 지원하는 filesystem 거부를 쓴다. | [](source:pre-id)[](source:sp-fail) |
| 금지 {#rule-7} | Codex policy가 profile을 거부하면 deny 규칙을 풀거나 더 넓은 sandbox를 고르지 않는다. 실행 파일이 시작하지 않으면 경로와 도구 진단을 보고하고, 버전이 낮다고 추측하지 않는다. | [](source:sp-fail) |
| 금지 {#rule-8} | 필수 MCP를 쓸 수 없으면 막힘을 보고한다. 셸로 canonical 파일을 대신 만들지 않는다. `report.md`는 에이전트가 쓰거나 고치지 않고 host가 투영한다. | [](source:as-own)[](source:fr-own) |
| 금지 {#rule-9} | 보조 파일은 `save_codex_security_artifact`로 저장한다. 셸 redirection, `apply_patch`, Python 같은 일반 파일 쓰기로 보존 파일을 쓰지 않는다. | [](source:as-supp) |
| 금지 {#rule-10} | `cancel_codex_security_scan`은 명시적 사용자 취소에만 쓴다. `fail_codex_security_scan`은 문서화된 복구를 다 쓴 뒤 확정된 복구 불가 장애에만 쓰고, 활성 worker, 부분 산출물, 미완 작업, 일시적 preflight 문제, 끝나는 턴에는 쓰지 않는다. | [](source:sp-cancel)[](source:srv-fail) |
| 금지 {#rule-11} | finalization이 성공하고 `report.md`가 생기기 전에는 완료를 주장하지 않는다. 승인 없이 추가 외부 작업이나 scan을 시작하지 않는다. | [](source:fr-own)[](source:fr-resp) |
| 금지 {#rule-12} | 하위 baseline·집중 조사 worker는 scan 시작, phase skill과 artifact 도구 호출, 위임, 앱 코드 실행, 파일 수정, 외부 서비스 접근, 발견한 credential 사용, 도구 내려받기를 하지 않는다. | [](source:ba-lim)[](source:fi-lim) |
| 금지 {#rule-13} | 감사는 한 번의 자기완결 audit 안에서 끝낸다. 별도 phase 스킬, ranking phase, 파일별 ledger, 별도 phase worker pool, receipt 파일을 만들지 않는다. | [](source:cs-end) |
| 금지 {#rule-14} | 발견한 credential로 서비스에 접속하거나 유효성을 확인하지 않는다. 출처 위치, credential 종류, 맥락, 불확실성만 남긴다. | [](source:cs-sec) |
| 권고 {#rule-15} | 도구 결과는 JSON으로 읽기 전에 `isError: true`나 실패 종료 코드를 먼저 확인한다. 입력 검증 거부(`-32602`)는 같은 요청을 반복하지 않고 거부된 필드만 고쳐 다시 낸다. | [](source:sp-res)[](source:fr-err) |
| 수치 {#rule-16} | 시작 횟수 40, worker 4, 연속 무발견 4, 연속 오류 3, 시간 96시간(최대 96)이 기본값이다. | [](source:cfg-def)[](source:ps-deep) |

산출물은 scan 폴더에 쌓인다. 기본 저장 위치는 `$CODEX_SECURITY_STATE_DIR/scans`이고 그 override가 없으면 `$CODEX_HOME/state/plugins/codex-security/scans`다. `CODEX_HOME`의 기본값은 `~/.codex`다. 봉인되는 정식 문서는 `scan-manifest.json`과 `findings.json`이고 `report.md`는 봉인에 들지 않는 투영물이다.[](source:as-store)[](source:sc-docs)

완료 상태 `completed`만 완료된 scan이라는 결론을 뒷받침하고, `failed`, `canceled`, `interrupted`로 멈춘 scan에서 finding이 없는 것은 결론이 아니다. 생성된 `report.md`는 informational finding의 개수만 세고 세부는 `findings.json`에서 읽는다.[](source:as-store)[](source:sc-docs)[](source:sc-status)[](source:fr-info)

## 어디까지 확인했고 무엇이 남았나? {#audit-panel span=12}

@facts id=deep-audit
| 읽은 텍스트 파일 | 28개. 이 스킬 폴더 2개, 필수 참조 21개, 형제·후행 스킬 5개 |
| 전부 읽은 스킬·참조 문서(바이트) | `SKILL.md` 3,127 · `openai.yaml` 192 · `scan-prologue.md` 5,747 · `access-advisory.md` 1,373 · `final-report.md` 12,135 · `artifact-storage.md` 7,947 · `core-scan.md` 7,479 · `baseline-auditor.md` 2,839 · `focused-investigator.md` 2,548 · `scan-contract.md` 16,529 |
| 전부 읽은 구현·설정 파일(바이트) | `discovery.md` 2,215 · `templates.ts` 1,768 · `project-config.schema.json` 8,208 · `deep_scan_defaults.json` 143 · `deep_scan_config.py` 6,510 · `check_deep_scan_target.py` 3,538 · `.mcp.json` 2,078 · 시험 파일 2,613 |
| 줄 범위만 읽은 구현 파일(바이트) 1 | `coordinator.ts` 40,348 중 55~59, 575~607, 740~935줄 · `executor.ts` 48,414 중 440~520줄 · `permission-profile-preflight.ts` 32,222 중 1~30줄 |
| 줄 범위만 읽은 구현 파일(바이트) 2 | `server.ts` 84,254 중 681~690, 790~805, 892~1010, 1200~1215, 1620~1635줄 · `compact-artifact-tools.ts` 15,421 중 262~290줄 |
| 줄 범위만 읽은 형제 스킬 파일(바이트) | `README.md` 3,752 중 7~9줄 · `security-scan/SKILL.md` 2,972 중 3, 10줄 · `security-diff-scan/SKILL.md` 5,405 중 3줄 · `track-findings/SKILL.md` 13,459 중 8, 24줄 · `threat-model-visualize/SKILL.md` 19,102 중 10줄 |
| 합계 | 352,338 B. 바이너리와 번역본은 없고 열지 않았다. 외부 URL은 열지 않았고 어떤 코드나 도구도 실행하지 않았다. |

@callout level=open-question title="확인하지 못한 것"
`deep-scan/` 아래 병합 알고리즘(`same-fix`), `iteration`, `store`, `worker-runner`와 `mcp-app/tests/`는 읽지 않았다. 그래서 중복 finding을 어떤 기준으로 합치는지, 재개 때 저장소가 count를 어떻게 복원하는지는 확인하지 못했다.
`check_deep_scan_target.py`가 어디서 언제 불리는지, 오류로 끝난 Deep scan의 `scan.status`가 무엇이 되는지, 오류 재시도 지연(60초, 180초, 540초 상수만 있다)이 어떻게 쓰이는지는 읽은 줄에서 확인하지 못했다.
`core-scan.md`가 가리키는 `threat-model.md`, `validate-scan-findings.md`, `default-severity-rubric.md`, `finding-detail-fields.md`, `security-guidance.md`는 이 스킬의 필수 참조가 아니어서 읽지 않았다.

@callout level=open-question title="원문끼리 맞물리지 않는 곳"
Deep scan을 누가 봉인하는지가 두 갈래로 적혀 있다. `final-report.md`의 소유자 표와 도구 설명은 코디네이터가 부모 scan을 봉인한다고 쓴다. 읽은 코드에서는 시작 도구의 처리기가 workbench `complete-scan`을 부른다. 우선순위나 두 경로의 관계는 원문에 명시 없고, 코디네이터가 호출자 없이 봉인하는 코드는 읽지 않았다.
SKILL.md 3단계의 "새로 시작한 native scan"과 1단계의 "이어 실행"이 같은 경로인지, 이미 돌던 scan에 다시 붙는 경우에도 `otherRunningDeepScans`를 확인하는지는 원문에 명시 없다.
시험은 handoff가 `delivered`인 scan만 "다른 실행 중 Deep scan"으로 세는 표본을 쓰지만 목록 필터가 handoff 상태를 보는지는 구현을 읽지 않아 확인하지 못했다.
