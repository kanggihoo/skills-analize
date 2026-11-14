# deep-security-scan은 Standard 감사를 어떻게 반복해 병합하게 하나? {#deep-security-scan-page}

`deep-security-scan`은 사용자가 deep, exhaustive, multi-pass 감사를 요청했을 때 쓴다. host가 Standard 감사를 반복 실행해 finding을 병합하고, 연속 감사가 새 결과를 더하지 못하거나 설정된 scan 한도나 시간 한도에 닿으면 멈춘다.[](source:front)[](source:loop) 부분 분석이다. 이 스킬이 읽으라고 지시하는 plugin 루트 문서 3개가 컬렉션에 없어 읽지 못했다.[](source:s1)[](source:s4)[](source:s5)

- 새 target이면 `inspect_codex_security_setup`으로 효과 설정과 출처를 먼저 보여 준다. `max_discovery_runs`는 동시에 도는 Standard scan까지 센 총 횟수 상한이다.[](source:s2)
- 새로 시작한 native scan에서 다른 Deep scan이 돌고 있으면 `Cancel (Recommended)`과 `Continue` 중 사용자의 명시 선택을 기다린다. 닫힌 dialog는 취소가 아니다.[](source:s3)
- 뒤의 pass는 이미 보고된 finding의 title과 location을 받는다.[](source:loop)
- 네 단계 스킬은 Deep worker가 호출하지 않는다고 단계 스킬 쪽 원문이 밝힌다. 이 스킬 본문은 단계 스킬 이름을 적지 않는다.[](source:p-tm)[](source:p-fd)[](source:p-val)[](source:p-ap)[](source:full)

@answer scope="원문 분석 · 스킬 폴더 2개 파일 · 도구와 명령 미실행"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source full title="codex-security/deep-security-scan/SKILL.md · 3127B · 스킬 본문(원본)" path=codex-security/deep-security-scan/SKILL.md
@source yaml title="codex-security/deep-security-scan/agents/openai.yaml · 192B · UI 표시와 default_prompt(원본)" path=codex-security/deep-security-scan/agents/openai.yaml
@source ss-full title="codex-security/security-scan/SKILL.md · 2972B · 형제 스킬(원본, R04·R05 대조용)" path=codex-security/security-scan/SKILL.md
@source diff-full title="codex-security/security-diff-scan/SKILL.md · 5405B · 형제 스킬(원본, R03 대조용)" path=codex-security/security-diff-scan/SKILL.md
@source tm-full title="codex-security/threat-model/SKILL.md · 2986B · 단계 스킬(원본, 호출 제한 확인용)" path=codex-security/threat-model/SKILL.md
@source fd-full title="codex-security/finding-discovery/SKILL.md · 5076B · 단계 스킬(원본, 호출 제한 확인용)" path=codex-security/finding-discovery/SKILL.md
@source val-full title="codex-security/validation/SKILL.md · 4619B · 단계 스킬(원본, 호출 제한 확인용)" path=codex-security/validation/SKILL.md
@source ap-full title="codex-security/attack-path-analysis/SKILL.md · 5355B · 단계 스킬(원본, 호출 제한 확인용)" path=codex-security/attack-path-analysis/SKILL.md
@source track-part title="codex-security/track-findings/SKILL.md · 13459B · 8줄만 읽음" path=codex-security/track-findings/SKILL.md lines=8:8
@source front title="codex-security/deep-security-scan/SKILL.md · 3127B · 스킬 본문(원본)" path=codex-security/deep-security-scan/SKILL.md lines=1:4
@source loop title="codex-security/deep-security-scan/SKILL.md · 3127B · 스킬 본문(원본)" path=codex-security/deep-security-scan/SKILL.md lines=8:8
@source s1 title="codex-security/deep-security-scan/SKILL.md · 3127B · 스킬 본문(원본)" path=codex-security/deep-security-scan/SKILL.md lines=10:10
@source s2 title="codex-security/deep-security-scan/SKILL.md · 3127B · 스킬 본문(원본)" path=codex-security/deep-security-scan/SKILL.md lines=11:11
@source s3 title="codex-security/deep-security-scan/SKILL.md · 3127B · 스킬 본문(원본)" path=codex-security/deep-security-scan/SKILL.md lines=12:12
@source s4 title="codex-security/deep-security-scan/SKILL.md · 3127B · 스킬 본문(원본)" path=codex-security/deep-security-scan/SKILL.md lines=13:13
@source s5 title="codex-security/deep-security-scan/SKILL.md · 3127B · 스킬 본문(원본)" path=codex-security/deep-security-scan/SKILL.md lines=14:14
@source yamlsrc title="codex-security/deep-security-scan/agents/openai.yaml · 192B · UI 표시와 default_prompt(원본)" path=codex-security/deep-security-scan/agents/openai.yaml lines=1:4
@source ss-desc title="codex-security/security-scan/SKILL.md · 2972B · 형제 스킬(원본)" path=codex-security/security-scan/SKILL.md lines=3:3
@source ss-body title="codex-security/security-scan/SKILL.md · 2972B · 형제 스킬(원본)" path=codex-security/security-scan/SKILL.md lines=10:21
@source diff-desc title="codex-security/security-diff-scan/SKILL.md · 5405B · 형제 스킬(원본)" path=codex-security/security-diff-scan/SKILL.md lines=3:3
@source p-tm title="codex-security/threat-model/SKILL.md · 2986B · 단계 스킬(원본)" path=codex-security/threat-model/SKILL.md lines=8:8
@source p-fd title="codex-security/finding-discovery/SKILL.md · 5076B · 단계 스킬(원본)" path=codex-security/finding-discovery/SKILL.md lines=14:14
@source p-val title="codex-security/validation/SKILL.md · 4619B · 단계 스킬(원본)" path=codex-security/validation/SKILL.md lines=21:21
@source p-ap title="codex-security/attack-path-analysis/SKILL.md · 5355B · 단계 스킬(원본)" path=codex-security/attack-path-analysis/SKILL.md lines=27:27

## 언제 켜지고 어떤 요청이 다른 스킬로 가나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 같은 호출 제한 필드는 frontmatter에 원문에 명시 없음이다. `agents/openai.yaml`에도 `policy` 항목이 없다.[](source:front)[](source:yaml)

@code source=front language=yaml

description은 대상과 요청 강도로 세 스킬을 가른다. deep 스킬은 저장소나 지정 경로에 deep, exhaustive, multi-pass 감사를 요청했을 때 쓴다. 변경 범위는 이름을 직접 적어 `security-diff-scan`으로 보낸다. 기본 단일 pass는 `security-scan`의 description이 맡는다.[](source:front)[](source:ss-desc)

| 요청 | 쓸 스킬 |
|---|---|
| 저장소나 지정 경로, 기본 단일 pass | `security-scan`[](source:ss-desc) |
| 저장소나 지정 경로, deep·exhaustive·multi-pass 요청 | `deep-security-scan` {good:이 스킬}[](source:front) |
| PR, commit, branch, working tree 변경 | `security-diff-scan` {caution:다른 스킬}[](source:front) |

`default_prompt`는 `$codex-security:deep-security-scan`으로 이 스킬을 불러 deep Codex Security scan을 돌리라는 예시다.[](source:yamlsrc)

@code source=yamlsrc language=yaml

## 시작부터 결과 반환까지 어떤 순서로 가나? {#procedure}

SKILL.md는 번호 5개로 순서를 적는다. 입구는 scan ID 유무로 갈리고, 새 target은 설정을 확인한 뒤 시작하며 기존 scan은 저장된 범위를 조회한다.[](source:s1)[](source:s2)[](source:s4)

@workflow id=deep-flow title="Deep scan 시작 전 확인과 실행"
| lane entry | 입구 |
| lane check | 사전 확인 |
| lane run | 실행 |
| req | 대상·범위 확정 | external | entry | source:s1 |
| hasid | scan ID가 있나? | backend | entry | source:s4 |
| setup | 설정 확인 | backend | entry | source:s2 |
| ctx | 저장된 범위 조회 | backend | entry | source:s1 |
| handoff | 해당 scan 스킬로 계속 | backend | check | source:s1 |
| dup | 다른 Deep 실행 중? | backend | check | source:s3 |
| ask | 사용자 선택 | security | check | source:s3 |
| cancel | 새 scan 취소 | backend | check | source:s3 |
| run | Deep scan 시작 | backend | run | source:s4 |
| report | 결과 반환 | external | run | source:s5 |
| req > hasid | |
| hasid > setup | 없음 |
| hasid > ctx | 있음 |
| setup > run | |
| ctx > handoff | Standard나 diff |
| ctx > dup | 새 native scan |
| dup > ask | 있음 |
| dup > run | 없음 |
| ask > cancel | Cancel |
| ask > run | Continue | emphasis |
| run > report | |

@steps id=deep-steps
| req | 대상·범위 확정 | 지정 디렉터리면 그 디렉터리를 `targetPath`, `scope: "."`로 쓴다. 이어 실행이면 `get_codex_security_scan_context`를 `scanId`와 주어진 `handoffClaimToken`으로 부르고 저장된 정체성과 범위를 쓴다. source 접근과 context 갱신은 `scan-prologue.md`를 따른다.[](source:s1) | deep-flow | req |
| setup | 설정 확인 | 새 target이면 `inspect_codex_security_setup({ targetPath, scope: ".", mode: "deep", projectConfigPath? })`를 부르고 효과 설정과 출처를 보여 준다. 프로젝트 파일은 사용자가 고른 경우에만 넘긴다. 기존 scan은 저장된 설정을 쓴다.[](source:s2) | deep-flow | setup |
| ctx | 저장된 범위 조회 | 저장된 모드가 Standard나 diff이면 대응하는 scan 스킬로 계속한다. 대응 스킬 이름은 원문에 적혀 있지 않다.[](source:s1) | deep-flow | ctx |
| dup | 다른 Deep 실행 중? | scan ID가 있는 새 native scan이면 `get_codex_security_scan_context` 결과의 `otherRunningDeepScans`를 한 번 본다. 있으면 target, phase, 읽기 쉬운 시작 시각을 보여 주고 추가 CPU, memory, token 사용을 설명한다.[](source:s3) | deep-flow | dup |
| ask | 사용자 선택 | `request_user_input`으로 `Cancel (Recommended)`과 `Continue`를 묻는다. 없으면 `request_codex_security_user_input`, 그것도 없으면 일반 chat으로 묻는다. 명시적 선택을 기다리고, 요청이 있을 때만 새 scan을 취소한다.[](source:s3) | deep-flow | ask |
| run | Deep scan 시작 | `access-advisory.md`를 따른 뒤 기존 scan이면 `start_codex_security_deep_scan({ scanId, handoffClaimToken? })`, 새 target이면 `start_codex_security_deep_scan({ targetPath, scope: ".", userContext?, projectConfigPath? })`를 부른다. 도구가 끝나기를 기다린다.[](source:s4) | deep-flow | run |
| report | 결과 반환 | SDK 소유 scan이면 host의 scan ID와 manifest 경로를 돌려준다. `completion`이 오면 생성된 `report.md`와 canonical artifacts를 링크한다.[](source:s5) | deep-flow | report |

원문은 저장된 모드가 Deep일 때 이어 실행을 어떻게 하는지 따로 적지 않는다. 판정 · 4단계가 기존 scan용 호출 형태(`scanId`)를 두므로 그 형태가 쓰이는 것으로 읽는다.[](source:s1)[](source:s4)

## 반복은 언제 멈추고 사람은 어디서 끼나? {#loop}

반복의 주체는 host다. 이 스킬은 Standard 감사를 직접 반복하지 않고 `start_codex_security_deep_scan`을 부르는 일을 맡는다.[](source:loop)[](source:s4)

@facts id=deep-loop-facts
| 반복 | host가 Standard 감사를 실행하고 finding을 병합한다 |
| 뒤 pass 입력 | 이미 보고된 finding의 title과 location |
| 같은 scan의 worker | investigation lead를 주고받고 서로의 evidence를 검증할 수 있다 |
| 멈춤 조건 | 연속 감사가 새 결과를 더하지 못함, 또는 설정된 scan 한도나 시간 한도 |
| 횟수 상한 | `max_discovery_runs`, 동시에 도는 Standard scan을 포함한 총 횟수 |
| 최종 보고 | 승인된 모든 감사를 포함한다 |

@callout level=open-question title="원문에 없는 값"
| `max_discovery_runs`의 기본값, "연속 감사"가 몇 번을 뜻하는지, "새 결과"를 무엇으로 가르는지는 원문에 명시 없음이다.[](source:loop)[](source:s2) |

| 상황 | 에이전트의 행동 |
|---|---|
| tool runner가 running cell ID를 돌려줌 | 그 cell이 scan 결과를 돌려줄 때까지 기다린다.[](source:s4) |
| 연결이 닫힘 | 같은 인자로 다시 붙는다.[](source:s4) |
| 터미널 실패 | 저장된 결과와 함께 실패를 보고한다.[](source:s4) |
| policy 거부 | 저장된 오류에서 알 수 있으면 어느 worker인지 밝힌다.[](source:s4) |
| 명시적 취소 | owning thread에서 `cancel_codex_security_scan({ scanId })`를 부른다.[](source:s4) |
| SDK 소유 scan | scan ID와 manifest 경로를 돌려줘 SDK가 finalize하게 한다.[](source:s5) |
| `completion` 반환 | `completion.scan.usage`와 별도 비용 추정으로 사용량을 `final-report.md` 형식에 맞춰 보고한다.[](source:s5) |
| 결과가 0개 | 감사가 끝났는데 finding이 0개인 경우와 감사가 하나도 끝나기 전에 deadline에 닿은 경우를 구분해 보고한다.[](source:s5) |

## 다른 스킬과 어디에서 이어지나? {#position}

@workflow id=position-flow title="deep 요청에서 이어 실행으로"
| user | 사용자의 deep 요청 | external | source:front |
| cur | deep-security-scan | backend | source:front |
| std | security-scan | backend | source:ss-desc |
| diff | security-diff-scan | backend | source:diff-desc |
| track | track-findings | backend | source:track-part |
| user > cur | 명시 요청 R02 | emphasis |
| cur > std | 저장 모드 Standard R04 | dashed |
| cur > diff | 저장 모드 diff R03 | dashed |
| cur > track | 추정 R26 | dashed |

@steps id=position-steps
| highlight | deep-security-scan | 이 페이지의 스킬이다. 이어 실행에서는 저장된 모드에 따라 다른 scan 스킬로 계속한다. | position-flow | cur |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R02 · 넘김 | `security-scan`의 description이 명시적으로 요청한 deep scan에만 이 스킬을 쓰라고 한다. 사용자와 host가 스킬을 고른다.[](source:ss-desc)[](source:front) |
| R03 · 넘김 | description이 변경 범위에는 `security-diff-scan`을 쓰라고 적는다. 이어 실행의 저장 모드가 diff일 때도 대응 scan 스킬로 계속한다. 변경 범위와 저장된 scan 정체성이 넘어가고 상태는 host가 관리한다.[](source:front)[](source:s1) |
| R04 · 넘김 | 저장 모드가 Standard이면 "the corresponding scan skill"로 계속한다. 스킬 이름은 적지 않는다.[](source:s1) |
| R05 · 참고 | host가 Standard 감사를 반복해 병합한다. 이 스킬이 `security-scan` 본문을 호출한다는 문장은 원문에 명시 없음이다.[](source:loop)[](source:ss-body) |
| R14 · 참고 | `threat-model`: "Standard scans and Deep workers build models within their own workflow rather than invoking this phase skill".[](source:p-tm) |
| R15 · 참고 | `finding-discovery`: "Standard and Deep workers use their coordinator's self-contained prompts rather than this phase skill".[](source:p-fd) |
| R16 · 참고 | `validation`: Standard scan과 Deep Scan worker는 ordinary Standard scan workflow 안에서 검증하고 단계 스킬을 호출하지 않는다.[](source:p-val) |
| R17 · 참고 | `attack-path-analysis`: 같은 문장으로 Standard scan과 Deep Scan worker의 호출을 부정한다.[](source:p-ap) |
| R26 · 산출물 호환 | 완료 때 `report.md`와 canonical artifacts를 링크한다고만 적는다. track-findings가 받는 봉인된 scan과 같은 종류인지는 이 컬렉션만으로 확정하지 못한다. 추론이다.[](source:s5)[](source:track-part) |

판정 · R14~R17은 모두 단계 스킬 쪽 문장이다. 이 스킬의 SKILL.md는 단계 스킬을 호출하거나 금지한다고 적지 않는다.[](source:full)

전체 흐름은 색인 기준 `_group-scan-vulnerabilities/scan-vulnerabilities.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `SKILL.md` 1개 3,127B, `agents/openai.yaml` 1개 192B를 끝까지 읽었다. 합계 2개, 3,319B.[](source:full)[](source:yaml) |
| 대조용 | 단계 스킬 4개 `SKILL.md` 18,036B, 형제 스킬 `security-scan`(2,972B)과 `security-diff-scan`(5,405B)을 끝까지 읽었다. 합계 6개.[](source:tm-full)[](source:ss-full)[](source:diff-full) |
| 부분 읽음 | `track-findings`(13,459B)는 8줄만 읽었다.[](source:track-part) |
| 제외 | `*.KO.md` 번역본이 없다. 이 폴더에 `references/`와 바이너리는 없다. |

원문의 활성화 안내, 5단계 절차, 사용자 선택 문구(`Cancel (Recommended)`, `Continue`), `max_discovery_runs`, 멈춤 조건, 취소·실패 처리, 호출 제한 필드 부재를 모두 대조했다. 이 스킬 원문의 수치는 5단계와 "한 번 확인"이 전부다.

@callout level=open-question title="읽지 못한 필수 자료와 확인하지 못한 동작"
| 이 스킬이 읽으라고 지시하는 plugin 루트 문서 3개가 컬렉션에 없다: `references/scan-prologue.md`(source 접근과 context 갱신), `access-advisory.md`, `final-report.md`(사용량 보고 형식). 순서나 통과 조건을 더 정하는지 알 수 없다. |
| `start_codex_security_deep_scan`, `inspect_codex_security_setup`, `request_user_input` 같은 도구의 실제 동작과 host가 Standard 감사를 반복하는 방식은 실행으로 확인하지 않았다. |

분석 중 원본은 수정하지 않았다. 이 폴더에 새 분석 초안과 HTML만 썼고 어떤 도구나 명령도 실행하지 않았다.
