# security-scan — 저장소나 지정 경로의 현재 소스에서 악용 가능한 취약점을 한 번에 찾는다 {#overview}

security-scan은 에이전트가 저장소 전체나 지정 경로의 현재 소스를 한 번의 audit로 읽고, 공격자가 실제로 악용할 수 있는 취약점만 근거 줄과 함께 보고하게 하는 스킬이다.[](source:purp)

- PR·commit·branch·working-tree 변경이면 diff 스킬을, 사용자가 deep scan을 명시했으면 deep 스킬을 쓴다. 그 밖의 일반 검토가 이 스킬의 몫이다.[](source:fm) SDK가 scan을 주었는지에 따라 시작 방법이 갈린다.[](source:sdk)[](source:mgd)
- 결과로 `scan-manifest.json`과 `findings.json`이 남는다. managed scan이면 생성된 `report.md` 링크도 남는다.[](source:res-done)
- 관계: diff 스킬과 deep 스킬은 대상에 따라 고르는 다음 안내이고, 위협 모델 같은 단계 스킬은 부르지 않는다(참고). 끝난 scan은 track-findings와 threat-model-visualize가 입력으로 쓴다(결과 전달).
- 하지 않는 것: 대상 소스는 읽기 전용·오프라인으로만 본다. 발견한 자격 증명은 쓰지 않고, 링크도 따라가지 않는다.[](source:ro)[](source:cs-sec)

@answer scope="codex-security/plugins/codex-security/skills/security-scan · 원본 파일 21개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: name과 description" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=1:4
@source purp title="목적과 core audit 사용" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=8:10
@source sdk title="SDK가 준 scan 사용" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=14:16
@source mgd title="managed scan 시작" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=17:17
@source ro title="읽기 전용·오프라인과 시간 허용치" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=19:19
@source fin title="조사 시작부터 제출까지" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=21:21
@source yaml title="openai.yaml: 표시 이름과 기본 prompt" path=codex-security/plugins/codex-security/skills/security-scan/agents/openai.yaml lines=1:4
@source sc-sdk title="SDK scan의 대상과 진행 보고" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=3:5
@source sc-draft title="첫 위협 모델 저장과 SDK 파일 handoff" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=7:9
@source sc-final title="최종 draft 제출" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=11:11
@source res-done title="결과 파일 확인과 scan 완료" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=13:13
@source sc-fail title="완료 실패와 취소" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=15:15
@source mg-start title="managed scan 재개 규칙" path=codex-security/plugins/codex-security/skills/security-scan/references/managed-scan.md lines=3:5
@source mg-prog title="phase 진행 보고 순서" path=codex-security/plugins/codex-security/skills/security-scan/references/managed-scan.md lines=9:11
@source desk title="desktop scan 결과 형식" path=codex-security/plugins/codex-security/skills/security-scan/references/desktop-scan.md lines=3:5
@source scoped title="범위 지정 입력 만들기" path=codex-security/plugins/codex-security/skills/security-scan/references/scoped-paths.md lines=3:11
@source sdkf title="draft 도구 없는 SDK scan의 파일 쓰기" path=codex-security/plugins/codex-security/skills/security-scan/references/sdk-files.md lines=3:24
@source ledger title="diff 단독 발견용 worklist 문서" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md lines=3:3
@source cs-ctx title="core-scan 1단계: 대상·정책·context 확인" path=codex-security/plugins/codex-security/references/core-scan.md lines=9:9
@source cs-base title="core-scan 2단계: 독립 baseline audit" path=codex-security/plugins/codex-security/references/core-scan.md lines=10:10
@source cs-tm title="core-scan 3단계: 위협 모델" path=codex-security/plugins/codex-security/references/core-scan.md lines=11:11
@source cs-pkt title="core-scan 4~5단계: packet과 위임" path=codex-security/plugins/codex-security/references/core-scan.md lines=12:13
@source cs-ckpt title="core-scan 6단계: 후보 checkpoint" path=codex-security/plugins/codex-security/references/core-scan.md lines=14:14
@source cs-val title="core-scan 7~8단계: 검증과 조립" path=codex-security/plugins/codex-security/references/core-scan.md lines=15:16
@source cs-none title="phase 스킬을 부르지 않는다" path=codex-security/plugins/codex-security/references/core-scan.md lines=18:18
@source cs-wait title="돌아온 review의 정리" path=codex-security/plugins/codex-security/references/core-scan.md lines=20:20
@source cs-pol title="오프라인 검색과 정책 해석" path=codex-security/plugins/codex-security/references/core-scan.md lines=24:26
@source cs-sec title="소스 안 자격 증명" path=codex-security/plugins/codex-security/references/core-scan.md lines=30:32
@source cs-sev title="심각도 기준" path=codex-security/plugins/codex-security/references/core-scan.md lines=36:36
@source val title="후보 검증 규칙" path=codex-security/plugins/codex-security/references/validate-scan-findings.md lines=3:3
@source basel title="baseline auditor 금지 사항과 반환 형식" path=codex-security/plugins/codex-security/references/baseline-auditor.md lines=16:18
@source tb title="조사 시간 허용치 템플릿" path=codex-security/plugins/codex-security/references/investigation-time-budget.md lines=3:11
@source adv title="Daybreak access advisory" path=codex-security/plugins/codex-security/references/access-advisory.md lines=3:11
@source fr-sub title="최종 draft 제출 주체" path=codex-security/plugins/codex-security/references/final-report.md lines=7:14
@source fr-err title="입력 검증 실패와 복구" path=codex-security/plugins/codex-security/references/final-report.md lines=57:61
@source srv title="start_codex_security_standard_scan 계약" path=codex-security/plugins/codex-security/mcp-app/server.ts lines=570:608
@source diff-d title="security-diff-scan description" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=3:3
@source deep-d title="deep-security-scan: Standard audit 반복" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=8:10
@source thr-d title="threat-model: Standard는 phase 스킬을 쓰지 않는다" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=21:21
@source fd-d title="finding-discovery: Standard는 phase 스킬을 쓰지 않는다" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=14:14
@source va-d title="validation: Standard는 phase 스킬을 쓰지 않는다" path=codex-security/plugins/codex-security/skills/validation/SKILL.md lines=21:21
@source ap-d title="attack-path-analysis: Standard는 phase 스킬을 쓰지 않는다" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=27:27
@source pol-d title="define-security-policy: SECURITY.md 역할" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=8:8
@source wr-d title="vulnerability-writeup: scan 안 보고서 경로" path=codex-security/plugins/codex-security/skills/vulnerability-writeup/SKILL.md lines=42:42
@source trk-d title="track-findings: 봉인된 scan 입력" path=codex-security/plugins/codex-security/skills/track-findings/SKILL.md lines=8:8
@source viz-d title="threat-model-visualize: 마지막 scan의 모델" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=8:10

## 어떻게 동작하나 {#flow span=12}

절차형이다. 그림은 SDK 소유 scan과 managed scan을 한 줄로 그렸다. SDK 소유 scan은 제출까지만 하고 완료는 SDK가 맡는다.[](source:res-done) Standard scan은 단계 스킬을 부르지 않고 `core-scan.md` 한 문서 안에서 조사·검증·공격 경로 판단을 모두 한다.[](source:cs-none)

@workflow id=flow-diagram title="security-scan 흐름"
| lane open | scan 열기 |
| lane review | 조사 |
| lane report | 제출 |
| sdk | SDK scan이 있나? | backend | open | source:sdk |
| reuse | 등록된 scan 쓰기 | backend | open | source:sc-sdk |
| managed | managed scan 열기 | backend | open | source:mgd |
| map | 위협 모델 만들기 | backend | review | source:cs-tm |
| audit | baseline·집중 조사 | backend | review | source:cs-base |
| validate | 후보 검증 | backend | review | source:val |
| submit | draft 제출 | backend | report | source:sc-final |
| finish | scan 완료 | backend | report | source:res-done |
| sdk > reuse | 예 |
| sdk > managed | 아니오 |
| reuse > map | |
| managed > map | |
| map > audit | |
| audit > validate | |
| validate > submit | |
| submit > finish | managed scan |

@steps id=flow-steps
| s-sdk | SDK scan이 있나? | **입력** 환경 값 `CODEX_SECURITY_SCAN_ID`·`CODEX_SECURITY_SCAN_DIR` · **출력** 쓸 scan 경로(SDK 또는 managed). **처리** SDK가 두 값을 주었으면 그 등록된 scan을 쓰고, 아니면 managed scan 도구를 쓴다.[](source:sdk) **다음** 소스를 읽기 전에 대상과 범위를 먼저 묶는다.[](source:sdk) | flow-diagram | sdk |
| s-reuse | 등록된 scan 쓰기 | **입력** SDK launch 안내(없으면 `references/scan-results.md`)·`CODEX_SECURITY_REPOSITORY`·선택적 target-paths 파일 · **참조** `references/scoped-paths.md` · **실행** `"$CODEX_SECURITY_PLUGIN_ROOT/scripts/launch_codex_security_mcp" --helper make-repo-scope-input --repo "$CODEX_SECURITY_REPOSITORY" --scopes-file "$CODEX_SECURITY_TARGET_PATHS_FILE" --out "$CODEX_SECURITY_SCAN_DIR/scoped-source-input.jsonl"` · **출력** 범위 지정 inventory와 `CODEX_SECURITY_SCAN_PROGRESS` 줄. **처리** 에이전트가 SDK scan의 대상을 저장소로 잡고, 범위가 있으면 요청된 파일과 하위 파일만 inventory로 만든다.[](source:sc-sdk)[](source:scoped) **다음** inventory 해석이 실패하면 오류를 알리고 소스 검토 전에 멈춘다.[](source:scoped) | flow-diagram | reuse |
| s-managed | managed scan 열기 | **입력** 요청한 대상·범위·사용자 context 원문 · **참조** `references/managed-scan.md` · **실행** `start_codex_security_prompt_only_scan`(mode `standard`, 확인된 Codex desktop) 또는 `start_codex_security_standard_scan`(그 외 host) · **출력** scan ID·directory·phase·handoff token. **처리** scan ID가 이미 있으면 `get_codex_security_scan_context`로 그 scan을 불러오고, 없으면 새 Standard scan을 시작해 running 상태를 확인한다.[](source:mgd) **다음** handoff가 실패했거나 다른 모드면 소스 검토 전에 멈춘다. 계정 access advisory는 launch가 지시할 때만 따른다.[](source:mg-start)[](source:mgd) → 내부: `server.ts`(코드 확인) 도구는 owning thread가 없으면 거부하고, 새 scan이 `threat_model` phase가 아니면 오류를 낸다.[](source:srv) | flow-diagram | managed |
| s-map | 위협 모델 만들기 | **입력** 대상·범위·상속된 `SECURITY.md`·사용자 context·(있으면) 공급된 위협 모델 · **참조** `references/core-scan.md`, `references/threat-model.md` · **실행** `<plugin_dir>/scripts/launch_codex_security_mcp --helper resolve-security-md --repo <repo_root> --scope <file_or_directory> --out -` · **출력** 위협 모델과 `complete: false` checkpoint. **처리** 구조와 신뢰 경계를 그려 첫 usable 모델이 나오면 `record_codex_security_scan_draft`로 저장한다.[](source:cs-ctx)[](source:cs-tm)[](source:cs-pol)[](source:sc-draft) **다음** 공급된 위협 모델은 바꾸지 않는다. 사용자가 이 대화에서 시간 제한을 요청했고 허용치가 없으면, 소스 검토 전에 시간 허용치 템플릿을 한 번 렌더링한다.[](source:cs-tm)[](source:ro) | flow-diagram | map |
| s-audit | baseline·집중 조사 | **입력** 위협 모델·조사 packet(공격자·자산·진입점·기대 통제로 묶은 질문) · **참조** `references/baseline-auditor.md`, `references/focused-investigator.md` · **출력** 후보 finding·반증·`reviewed_files`를 담은 JSON. **처리** 지도를 그리는 동안 독립 baseline audit worker가 `fork_turns: "none"`으로 시작하고, 이어서 집중 조사 worker가 packet을 나눠 조사한다.[](source:fin)[](source:cs-base)[](source:cs-pkt)[](source:basel) **다음** worker를 쓸 수 없으면 부모가 브리프를 읽고 직접 조사하며 독립 reviewer가 없었다고 기록한다. 후보는 합치거나 검증하기 전에 `complete: false` draft에 checkpoint한다.[](source:cs-base)[](source:cs-ckpt) | flow-diagram | audit |
| s-validate | 후보 검증 | **입력** 돌아온 후보·반증 · **참조** `references/validate-scan-findings.md` · **출력** 검증된 finding과 기각 기록. **처리** 서로 다른 후보마다 로컬 소스로 공격자·통제·영향을 한 번 검증하고, 소스에 근거한 반증이 있을 때만 기각한다.[](source:val)[](source:fin) **다음** 호출자가 validation handoff를 주었으면 그것을 따른다. 아직 안 돌아온 배정만 기다린다.[](source:cs-val)[](source:cs-wait) | flow-diagram | validate |
| s-submit | draft 제출 | **입력** scope·threatModel·findings·`reviewState` · **참조** `references/final-report.md` · **실행** `record_codex_security_scan_draft`(`complete: true`) · **출력** `scan-manifest.json`·`findings.json`. **처리** 모든 배정이 끝나면 정직한 coverage와 함께 최종 draft를 한 번 제출하고 두 파일이 생겼는지 확인한다.[](source:sc-final)[](source:res-done) **다음** SDK 소유 scan이면 여기서 돌아간다. SDK가 봉인하고 report를 만든다. 입력 검증 거절은 같은 draft에서 고쳐 다시 제출하며 같은 요청을 반복하지 않는다.[](source:res-done)[](source:fr-err) | flow-diagram | submit |
| s-finish | scan 완료 | **입력** 승인된 최종 draft·같은 scan ID와 token · **참조** `references/desktop-scan.md` · **실행** `complete_codex_security_scan` · **출력** 생성된 `report.md`와 canonical artifacts 링크. **처리** 에이전트가 완료를 한 번 부르고 report 링크를 사용자에게 준다. 전체 finding은 요청이 있을 때만 가져온다.[](source:res-done) **다음** desktop이면 완료 전에 finding마다 `::code-comment`를 낸다. 완료가 실패하면 오류를 알리고 scan을 보존한다.[](source:desk)[](source:sc-fail) | flow-diagram | finish |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령 `$security-scan`(`openai.yaml` 기본 prompt)과 모델 판단(description). 호출 제한 필드는 frontmatter에 없다.[](source:fm)[](source:yaml) |
| 성격 | 저장소 현재 소스를 한 번의 audit로 읽고 취약점을 보고하는 기본 scan 스킬 |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-diff} | security-diff-scan | 다음 안내 | 대상이 PR, commit, branch, working-tree 변경이면 diff 스킬을 쓰라고 description이 정한다. 스킬 이름은 적지 않는다.[](source:fm)[](source:diff-d) |
| **이 스킬** {#rel-deep} | deep-security-scan | 다음 안내 | 사용자가 deep scan을 명시적으로 요청했을 때만 deep 스킬을 쓴다.[](source:fm) |
| deep-security-scan {#rel-deep-back} | **이 스킬** | 다음 안내 | deep 스킬이 이어 받은 scan의 저장된 모드가 Standard이면 대응하는 scan 스킬로 계속한다. 대응 스킬 이름은 적지 않는다.[](source:deep-d) |
| threat-model {#rel-thr} | **이 스킬** | 참고 | Standard scan은 이 단계 스킬을 부르지 않는다. 대신 같은 `references/threat-model.md`를 읽는다.[](source:cs-none)[](source:thr-d) |
| finding-discovery {#rel-fd} | **이 스킬** | 참고 | Standard scan은 coordinator의 prompt를 쓰고 이 단계 스킬을 쓰지 않는다.[](source:fd-d)[](source:cs-none) |
| validation {#rel-va} | **이 스킬** | 참고 | Standard scan은 검증을 자기 workflow 안에서 하고 이 단계 스킬을 부르지 않는다.[](source:va-d)[](source:cs-val) |
| attack-path-analysis {#rel-ap} | **이 스킬** | 참고 | Standard scan은 공격 경로를 자기 workflow 안에서 평가한다. 심각도는 `core-scan.md`의 기준으로 매긴다.[](source:ap-d)[](source:cs-sev) |
| define-security-policy {#rel-pol} | **이 스킬** | 같은 파일 | 이 스킬이 상속된 `SECURITY.md`를 해석해 reportability 판단에 쓴다. 선후 관계는 없다.[](source:pol-d)[](source:cs-pol) |
| **이 스킬** {#rel-wr} | vulnerability-writeup | 참고 | Codex desktop scan에서만 "per-finding write-ups"를 요구하는 handoff를 따른다. 스킬 이름은 적지 않는다.[](source:desk)[](source:wr-d) |
| **이 스킬** {#rel-trk} | track-findings | 결과 전달 | scan이 끝나면 생기는 두 파일을 track-findings가 입력으로 읽는다. 사용자가 따로 요청할 때 부르고 자동 순서는 없다.[](source:res-done)[](source:trk-d) |
| **이 스킬** {#rel-viz} | threat-model-visualize | 결과 전달 | "마지막 scan의 위협 모델을 시각화하라"는 요청이면 이 scan의 위협 모델을 읽는다. 새 scan은 돌리지 않는다.[](source:viz-d)[](source:sc-draft) |
| **이 스킬** {#rel-mcp} | Codex Security MCP의 Standard scan 도구 | 참고 | SDK가 scan을 주지 않았을 때 managed 도구로 scan을 열고, 진행·draft·완료를 보고한다.[](source:mgd)[](source:mg-prog)[](source:sc-final) |

deep 스킬이 Standard audit를 반복해 병합하는 관계(deep > 이 스킬, 참고)는 그림과 표에서 뺐다.[](source:deep-d)

@architecture id=relation-map title="security-scan과 이어지는 스킬"
| thr | threat-model | backend |
| fd | finding-discovery | backend |
| va | validation | backend |
| ap | attack-path-analysis | backend |
| pol | define-security-policy | backend |
| self | security-scan(이 스킬) | backend |
| diff | security-diff-scan | backend |
| deep | deep-security-scan | backend |
| wr | vulnerability-writeup | backend |
| trk | track-findings | backend |
| viz | threat-model-visualize | backend |
| mcp | Codex Security MCP | external |
| thr > self | 참고 |
| fd > self | 참고 |
| va > self | 참고 |
| ap > self | 참고 |
| pol > self | 같은 파일 |
| self > diff | 다음 안내 |
| self > deep | 다음 안내 |
| self > wr | 참고 |
| self > trk | 결과 전달 |
| self > viz | 결과 전달 |
| self > mcp | 참고 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 대상 묶기, 읽기 전용 규칙, 조사 시작과 제출 순서를 담은 본문 | 스킬이 켜지면 읽는다 | SDK scan이 있나?, managed scan 열기 |
| `agents/openai.yaml` | 표시 이름 "Security Scan"과 기본 prompt | 호스트가 스킬 목록에 표시할 때 쓴다 | SDK scan이 있나? |
| `references/scan-results.md` | SDK 대상, 첫 위협 모델 저장, 최종 draft, 완료 | 첫 위협 모델 때와 조사가 끝났을 때 읽는다 | 등록된 scan 쓰기, 위협 모델 만들기, draft 제출, scan 완료 |
| `references/managed-scan.md` | managed scan 재개와 phase 진행 보고 순서 | managed scan을 열거나 phase가 바뀔 때 읽는다 | managed scan 열기, baseline·집중 조사 |
| `references/scoped-paths.md` | target-paths 파일로 범위 지정 inventory를 만드는 helper | 범위 파일이 있고 준비된 inventory가 없을 때 읽는다 | 등록된 scan 쓰기 |
| `references/sdk-files.md` | draft 도구 없는 SDK scan이 `scan-manifest.json`과 `findings.json`을 직접 쓰는 방법 | SDK가 draft 도구를 묶어 주지 않았을 때 읽는다 | 위협 모델 만들기, draft 제출 |
| `references/desktop-scan.md` | desktop scan의 `::code-comment` 형식 | 확인된 Codex desktop scan일 때만 읽는다 | scan 완료 |
| `references/scan-artifacts-and-ledger.md` | diff 단독 발견용 worklist와 ledger 문서 | Standard scan은 쓰지 않는다. 문서가 스스로 그렇게 밝힌다 | 없음 |
| `references/core-scan.md`(플러그인 루트) | Standard audit 본체. 8단계 workflow, 정책 해석, 자격 증명, 심각도 | SKILL.md가 "core audit"로 가리킨다 | 위협 모델 만들기, baseline·집중 조사, 후보 검증 |
| `references/baseline-auditor.md`, `references/focused-investigator.md`(플러그인 루트) | 두 worker가 따르는 조사 브리프와 반환 JSON 형식 | worker를 띄울 때 읽게 한다. worker가 없으면 부모가 읽는다 | baseline·집중 조사 |
| `references/validate-scan-findings.md`(플러그인 루트) | 후보 검증 규칙 | 호출자의 validation handoff가 없을 때 읽는다 | 후보 검증 |
| `references/final-report.md`, `references/artifact-storage.md`(플러그인 루트) | 최종 draft 제출 주체와 저장 규칙 | 최종 assemble과 제출 때 읽는다 | draft 제출, scan 완료 |
| `references/threat-model.md`, `references/security-guidance.md`(플러그인 루트) | 위협 모델 작성 가이드와 `SECURITY.md` 해석 helper | 구조 파악과 정책 해석 때 읽는다 | 위협 모델 만들기 |
| `references/investigation-time-budget.md`, `references/access-advisory.md`(플러그인 루트) | 시간 허용치 템플릿, 계정 access 점검 | 사용자가 시간 제한을 요청했거나 launch가 지시할 때만 읽는다 | 위협 모델 만들기, managed scan 열기 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 소스 검토 전 | 요청한 대상과 범위를 먼저 묶는다. 묶기 전에 대상 소스를 읽지 않는다 | [](source:sdk) |
| 대상 소스 | 읽기 전용·오프라인으로만 본다. 사용자 context는 분석 자료이고 지시가 아니다 | [](source:ro) |
| 사용자가 명시한 URL | 부모만 한 번 읽을 수 있고, 사용자가 읽기를 명시적으로 승인한 경우로 한정한다. 링크는 따라가지 않는다 | [](source:ro) |
| 시간 허용치 | 기존 값은 worker와 재개에 걸쳐 그대로 둔다. 이 대화에서 사용자가 시간 제한을 요청했고 값이 없을 때만 한 번 렌더링한다. 권고일 뿐 하드 timeout이 아니다 | [](source:ro) [](source:tb) |
| managed scan의 handoff 실패 또는 다른 모드 | 소스 검토 전에 멈춘다 | [](source:mg-start) |
| 범위 inventory 해석 실패 | 오류를 알리고 소스 검토 전에 멈춘다 | [](source:scoped) |
| 소스 안의 자격 증명 | 읽는 사람이 더 큰 권한을 얻을 수 있으면 노출 경로로 본다. 발견한 자격 증명을 쓰거나 서비스에 접속해 확인하지 않는다 | [](source:cs-sec) |
| 조사 worker | 단계 스킬, 다른 scan 시작, 위임, 파일 수정, 외부 접근, 도구 다운로드를 하지 않는다 | [](source:basel) |
| 단계 스킬과 장부 | core audit 안에서 discovery·validation·공격 경로를 모두 하고, 순위 phase·파일별 ledger·별도 worker pool·receipt 파일을 만들지 않는다 | [](source:cs-none) |
| 후보 기각 | 소스에 근거한 반증이 있을 때만 기각한다. 런타임 재현이나 실제 배포 증거는 요구하지 않는다 | [](source:val) |
| 후보를 합치거나 검증하기 전 | `complete: false` draft에 checkpoint하고 원래 근거를 `reviewState.deferred`에 둔다 | [](source:cs-ckpt) [](source:sc-draft) |
| 최종 draft | 모든 배정이 끝난 뒤 `complete: true`를 한 번 제출한다. 입력 검증 거절은 같은 draft에서 고쳐 다시 제출한다 | [](source:sc-final) [](source:fr-err) |
| SDK 소유 scan | 파일 확인 뒤 돌아간다. 완료 호출과 봉인은 SDK가 한다 | [](source:res-done) [](source:fr-sub) |
| managed scan 완료 | 같은 ID와 token으로 `complete_codex_security_scan`을 한 번만 부른다 | [](source:res-done) |
| 완료 호출이 실패 | 오류를 알리고 durable scan을 보존한다. 취소는 사용자가 요청할 때만 하고, fail은 복구를 다한 뒤 확정된 blocker에만 쓴다 | [](source:sc-fail) |
| 사용량 보고 | 측정이 끝난 사용량만 보고하고, 대기 중인 값은 host에 맡긴다 | [](source:res-done) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 독립 baseline audit와 집중 조사 브리프 — baseline·집중 조사 · 점검 클래스 목록, 반환 JSON 필드, worker 위임 규칙(`fork_turns`, `followup_task`)
- 후보 검증과 finding 필드 — 후보 검증 · 검증 항목, 근거 요약 필드, `finding-detail-fields.md`의 풍부한 필드
- 자격 증명 노출 규칙 — baseline·집중 조사 · 소스 reader 기준, 더미 값 구분, 사용 금지
- phase 진행 보고 — managed scan 열기 · `update_codex_security_scan_progress`의 phase 순서와 investigator 집계
- SDK 파일 handoff — draft 제출 · `scan-manifest.json` 필드, `scan.mode` 값, 범위 바인딩 helper
- 심각도 기준 — 위협 모델 만들기 · 기본 rubric의 Critical~Informational 조건과 desktop priority 대응
- 정책 해석(`SECURITY.md`) — 위협 모델 만들기 · root부터 leaf까지의 policy chain과 closest-wins 규칙

@callout level=open-question title="확인하지 못한 것"
| `references/finding-detail-fields.md`와 `references/scan-contract.md`는 core audit이 가리키지만 전부 읽지 않았다. scan-contract는 scan mode 표 일부만 확인했다. |
| `mcp-app/server.ts`는 Standard scan 시작 도구의 입력과 검사 부분만 읽었다. progress·draft·complete 도구의 내부 구현은 확인하지 못했다. |
| `launch_codex_security_mcp`의 `--helper` 내부 구현과 SDK handoff를 만드는 코드는 읽지 않았다. 위 실행 칸은 원문이 에이전트에게 지시한 명령이다. |
| desktop host에서 `::code-comment`를 내는 정확한 시점은 원문에 명시 없음. 완료 전에 write-up을, 완료 뒤에 report 링크를 두라는 말만 있다. |

읽은 원본: 텍스트 파일 21개(스킬 폴더 8개, 플러그인 루트 references 13개). 제외: 없음.
