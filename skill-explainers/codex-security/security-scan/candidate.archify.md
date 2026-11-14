# security-scan은 현재 소스의 취약점을 한 번의 감사로 어떻게 찾게 하나? {#security-scan-page}

`security-scan`은 저장소 전체나 지정 경로의 **현재 소스**를 단일 pass로 감사하게 한다. 공격자가 실제로 악용할 수 있는 취약점만 소스 줄과 구체적 영향을 붙여 보고하게 한다.[](source:front)[](source:core) 부분 분석이다. 감사 방법을 담은 plugin 루트 `references/` 문서 7개가 컬렉션에 없어 읽지 못했다.[](source:core)

- 소스를 읽기 전에 대상과 범위를 scan에 묶는다. Standard scan이 실행 중이 아니거나 handoff가 실패했거나 다른 모드면 소스 검토를 시작하지 않는다.[](source:bind)[](source:m-resume)
- 대상은 읽기 전용이고 검토는 offline이다. 명시된 URL은 사용자가 읽기를 명시적으로 허가했을 때 parent만 한 번 읽는다.[](source:guard)
- 첫 threat model이 나오면 `complete: false` draft를 저장하고 후보는 도착하는 대로 checkpoint한다. 검증은 같은 깨진 통제마다 한 번만 한다.[](source:start)
- 네 단계 스킬(`threat-model`, `finding-discovery`, `validation`, `attack-path-analysis`)은 Standard scan이 호출하지 않는다. 이 문장은 각 단계 스킬 쪽 원문에 있다.[](source:p-tm)[](source:p-fd)[](source:p-val)[](source:p-ap)

@answer scope="원문 분석 · 스킬 폴더 8개 파일 · 도구와 명령 미실행"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source full title="codex-security/security-scan/SKILL.md · 2972B · 스킬 본문(원본)" path=codex-security/security-scan/SKILL.md
@source yaml title="codex-security/security-scan/agents/openai.yaml · 245B · UI 표시와 default_prompt(원본)" path=codex-security/security-scan/agents/openai.yaml
@source r-desktop title="codex-security/security-scan/references/desktop-scan.md · 580B · Codex desktop 결과 출력(원본)" path=codex-security/security-scan/references/desktop-scan.md
@source r-managed title="codex-security/security-scan/references/managed-scan.md · 1356B · managed Standard scan 시작·재개·진행(원본)" path=codex-security/security-scan/references/managed-scan.md
@source r-ledger title="codex-security/security-scan/references/scan-artifacts-and-ledger.md · 7021B · diff 단독 발견용 worklist(원본)" path=codex-security/security-scan/references/scan-artifacts-and-ledger.md
@source r-results title="codex-security/security-scan/references/scan-results.md · 2871B · scan 결과 저장(원본)" path=codex-security/security-scan/references/scan-results.md
@source r-scoped title="codex-security/security-scan/references/scoped-paths.md · 2359B · 지정 경로 inventory(원본)" path=codex-security/security-scan/references/scoped-paths.md
@source r-sdk title="codex-security/security-scan/references/sdk-files.md · 2192B · SDK scan 파일 handoff(원본)" path=codex-security/security-scan/references/sdk-files.md
@source tm-full title="codex-security/threat-model/SKILL.md · 2986B · 단계 스킬(원본, 호출 제한 확인용)" path=codex-security/threat-model/SKILL.md
@source fd-full title="codex-security/finding-discovery/SKILL.md · 5076B · 단계 스킬(원본, 호출 제한 확인용)" path=codex-security/finding-discovery/SKILL.md
@source val-full title="codex-security/validation/SKILL.md · 4619B · 단계 스킬(원본, 호출 제한 확인용)" path=codex-security/validation/SKILL.md
@source ap-full title="codex-security/attack-path-analysis/SKILL.md · 5355B · 단계 스킬(원본, 호출 제한 확인용)" path=codex-security/attack-path-analysis/SKILL.md
@source deep-full title="codex-security/deep-security-scan/SKILL.md · 3127B · 형제 스킬(원본, description·구조 확인용)" path=codex-security/deep-security-scan/SKILL.md
@source diff-full title="codex-security/security-diff-scan/SKILL.md · 5405B · 형제 스킬(원본, description 확인용)" path=codex-security/security-diff-scan/SKILL.md
@source track-part title="codex-security/track-findings/SKILL.md · 13459B · 8·24줄만 읽음" path=codex-security/track-findings/SKILL.md lines=8:8
@source track-part2 title="codex-security/track-findings/SKILL.md · 13459B · 8·24줄만 읽음" path=codex-security/track-findings/SKILL.md lines=24:24
@source vw-part title="codex-security/vulnerability-writeup/SKILL.md · 5571B · 3·42줄만 읽음" path=codex-security/vulnerability-writeup/SKILL.md lines=42:42
@source ecc-part title="ecc/security-scan/SKILL.md · 4592B · 앞 12줄과 SHA-256만 확인" path=ecc/security-scan/SKILL.md lines=1:3
@source lock title="codex-security/skills-lock.json · 6525B · 이 스킬 항목만 읽음" path=codex-security/skills-lock.json lines=82:87
@source front title="codex-security/security-scan/SKILL.md · 2972B · 스킬 본문(원본)" path=codex-security/security-scan/SKILL.md lines=1:4
@source core title="codex-security/security-scan/SKILL.md · 2972B · 스킬 본문(원본)" path=codex-security/security-scan/SKILL.md lines=10:10
@source bind title="codex-security/security-scan/SKILL.md · 2972B · 스킬 본문(원본)" path=codex-security/security-scan/SKILL.md lines=14:17
@source guard title="codex-security/security-scan/SKILL.md · 2972B · 스킬 본문(원본)" path=codex-security/security-scan/SKILL.md lines=19:19
@source start title="codex-security/security-scan/SKILL.md · 2972B · 스킬 본문(원본)" path=codex-security/security-scan/SKILL.md lines=21:21
@source yamlsrc title="codex-security/security-scan/agents/openai.yaml · 245B · UI 표시와 default_prompt(원본)" path=codex-security/security-scan/agents/openai.yaml lines=1:4
@source m-resume title="codex-security/security-scan/references/managed-scan.md · 1356B · managed Standard scan(원본)" path=codex-security/security-scan/references/managed-scan.md lines=3:5
@source m-phase title="codex-security/security-scan/references/managed-scan.md · 1356B · managed Standard scan(원본)" path=codex-security/security-scan/references/managed-scan.md lines=9:11
@source rs-sdk title="codex-security/security-scan/references/scan-results.md · 2871B · scan 결과 저장(원본)" path=codex-security/security-scan/references/scan-results.md lines=3:5
@source rs-draft title="codex-security/security-scan/references/scan-results.md · 2871B · scan 결과 저장(원본)" path=codex-security/security-scan/references/scan-results.md lines=7:9
@source rs-done title="codex-security/security-scan/references/scan-results.md · 2871B · scan 결과 저장(원본)" path=codex-security/security-scan/references/scan-results.md lines=11:13
@source rs-fail title="codex-security/security-scan/references/scan-results.md · 2871B · scan 결과 저장(원본)" path=codex-security/security-scan/references/scan-results.md lines=15:15
@source sc-all title="codex-security/security-scan/references/scoped-paths.md · 2359B · 지정 경로 inventory(원본)" path=codex-security/security-scan/references/scoped-paths.md lines=3:11
@source sdk-all title="codex-security/security-scan/references/sdk-files.md · 2192B · SDK scan 파일 handoff(원본)" path=codex-security/security-scan/references/sdk-files.md lines=3:7
@source sdk-end title="codex-security/security-scan/references/sdk-files.md · 2192B · SDK scan 파일 handoff(원본)" path=codex-security/security-scan/references/sdk-files.md lines=22:24
@source d-write title="codex-security/security-scan/references/desktop-scan.md · 580B · Codex desktop 결과 출력(원본)" path=codex-security/security-scan/references/desktop-scan.md lines=3:5
@source ledger-head title="codex-security/security-scan/references/scan-artifacts-and-ledger.md · 7021B · diff 단독 발견용 worklist(원본)" path=codex-security/security-scan/references/scan-artifacts-and-ledger.md lines=1:3
@source p-tm title="codex-security/threat-model/SKILL.md · 2986B · 단계 스킬(원본)" path=codex-security/threat-model/SKILL.md lines=8:8
@source p-fd title="codex-security/finding-discovery/SKILL.md · 5076B · 단계 스킬(원본)" path=codex-security/finding-discovery/SKILL.md lines=14:14
@source p-val title="codex-security/validation/SKILL.md · 4619B · 단계 스킬(원본)" path=codex-security/validation/SKILL.md lines=21:21
@source p-ap title="codex-security/attack-path-analysis/SKILL.md · 5355B · 단계 스킬(원본)" path=codex-security/attack-path-analysis/SKILL.md lines=27:27
@source diff-desc title="codex-security/security-diff-scan/SKILL.md · 5405B · 형제 스킬(원본)" path=codex-security/security-diff-scan/SKILL.md lines=3:3
@source deep-desc title="codex-security/deep-security-scan/SKILL.md · 3127B · 형제 스킬(원본)" path=codex-security/deep-security-scan/SKILL.md lines=3:3
@source deep-loop title="codex-security/deep-security-scan/SKILL.md · 3127B · 형제 스킬(원본)" path=codex-security/deep-security-scan/SKILL.md lines=8:8

## 언제 켜지고 어떤 요청이 다른 스킬로 가나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 같은 호출 제한 필드는 frontmatter에 원문에 명시 없음이다. `agents/openai.yaml`에도 `policy` 항목이 없다.[](source:front)[](source:yaml)

@code source=front language=yaml

description은 대상에 따라 세 스킬을 가른다. 변경 범위(PR, commit, branch, working tree)는 diff 스킬, 명시적으로 요청한 deep scan은 deep 스킬이고, 나머지 저장소·경로 감사는 이 스킬이다. diff 스킬은 이름이 아니라 역할로만 지목한다.[](source:front)

@workflow id=scan-choice title="요청 대상에 따른 스킬 선택"
| ask | 보안 감사 요청 | external |
| chg | 변경 범위인가? | backend |
| isdeep | deep scan을 명시했나? | backend |
| diff | diff 스킬 | backend | source:diff-desc |
| deep | deep 스킬 | backend | source:deep-desc |
| std | security-scan | backend | source:front |
| ask > chg | |
| chg > diff | 예 |
| chg > isdeep | 아니오 |
| isdeep > deep | 예 |
| isdeep > std | 아니오 | emphasis |

@steps id=choice-steps
| ask | 보안 감사 요청 | 사용자와 host가 스킬을 고른다. description은 선택 기준을 알려 주는 안내다. | scan-choice | ask |
| chg | 변경 범위인가? | PR, commit, branch, working-tree 변경이면 diff 스킬을 쓰라고 description이 정한다.[](source:front) | scan-choice | chg |
| isdeep | deep scan을 명시했나? | 사용자가 명시적으로 요청한 deep scan에만 deep 스킬을 쓴다.[](source:front) | scan-choice | isdeep |
| std | security-scan | 둘 다 아니면 이 스킬이 기본 단일 pass 감사다.[](source:front) | scan-choice | std |

`default_prompt`는 이 스킬을 이름으로 불러 저장소의 악용 가능한 취약점과 소스 근거를 요구하는 예시다.[](source:yamlsrc)

@code source=yamlsrc language=yaml

## 감사는 어떤 순서로 진행하고 어디에 저장하나? {#procedure}

SKILL.md는 순서를 한 문단으로 적는다. 독립 감사를 저장소 구조를 파악하는 일과 함께 시작하고, 첫 threat model에서 draft를 저장하고, 후보를 checkpoint한 뒤 배정된 검토가 돌아오면 검증하고 제출한다.[](source:start)

@workflow id=scan-flow title="Standard scan의 한 번 흐름"
| lane bind | 대상 묶기 |
| lane review | 감사 |
| lane save | 저장과 완료 |
| bind | 대상·범위 묶기 | backend | bind | source:bind |
| review | 독립 감사 시작 | backend | review | source:start |
| draft | 첫 draft 저장 | database | review | source:rs-draft |
| ckpt | 후보 checkpoint | database | review | source:rs-draft |
| valid | 통제별 검증 | backend | save | source:start |
| submit | 최종 draft 제출 | database | save | source:rs-done |
| finish | 완료 또는 SDK 반환 | external | save | source:rs-done |
| bind > review | Standard 실행 중 |
| review > draft | 첫 threat model |
| draft > ckpt | 후보 도착 |
| ckpt > valid | 배정 검토 반환 |
| valid > submit | 통제마다 1회 | emphasis |
| submit > finish | |

@steps id=scan-steps
| bind | 대상·범위 묶기 | SDK가 `CODEX_SECURITY_SCAN_ID`와 `CODEX_SECURITY_SCAN_DIR`을 주면 그 scan을 쓴다. 아니면 managed 도구를 쓴다. scan ID가 있으면 handoff token으로 `get_codex_security_scan_context`를 부른다. ID가 없으면 Codex desktop은 `start_codex_security_prompt_only_scan`(`mode: "standard"`), 다른 host는 `start_codex_security_standard_scan`을 부른다.[](source:bind) | scan-flow | bind |
| review | 독립 감사 시작 | 대상은 읽기 전용으로 두고 offline으로 검토한다. 저장소 구조를 파악하는 동안 독립 감사를 시작한다. phase는 `discovery`를 dispatch 전에 알린다.[](source:guard)[](source:start)[](source:m-phase) | scan-flow | review |
| draft | 첫 draft 저장 | 첫 threat model이 쓸 만해지면 scan ID, 필요하면 handoff token, `complete: false`, 모델, 비어 있는 findings로 `record_codex_security_scan_draft`를 부른다.[](source:rs-draft) | scan-flow | draft |
| ckpt | 후보 checkpoint | 돌아온 후보를 병합하거나 검증하기 전에 checkpoint한다. 원래 근거는 해결될 때까지 `reviewState.deferred`에 둔다.[](source:rs-draft) | scan-flow | ckpt |
| valid | 통제별 검증 | 배정된 검토가 돌아오면 서로 다른 깨진 통제마다 한 번만 검증한다. phase는 `validation`, `attack_path`, `reporting` 순으로 실제 전환 때 알린다.[](source:start)[](source:m-phase) | scan-flow | valid |
| submit | 최종 draft 제출 | 범위, 위협 모델, findings, `reviewState`를 담은 `complete: true` draft를 한 번 제출한다. 끝난 일반 작업은 `reviewState.resolvedDeferred`에 저장 ID와 사유로 닫고 미해결은 남긴다.[](source:rs-done) | scan-flow | submit |
| finish | 완료 또는 SDK 반환 | `scan-manifest.json`과 `findings.json`이 있는지 확인한다. SDK 소유 scan이면 여기서 돌려준다. 다른 managed scan은 `complete_codex_security_scan`을 같은 ID와 token으로 한 번 부르고 `report.md`와 canonical artifacts를 링크한다.[](source:rs-done) | scan-flow | finish |

host와 scan 소유자에 따라 저장과 완료 방법이 달라진다.

| 경로 | 저장 방법 | 끝내는 방법 |
|---|---|---|
| SDK scan, draft 도구 연결 | `record_codex_security_scan_draft`로 draft를 저장한다.[](source:rs-draft) | `scan-manifest.json`과 `findings.json`을 확인하고 돌려준다. SDK가 봉인하고 보고서를 만든다.[](source:rs-done) |
| SDK scan, draft 도구 없음 | `CODEX_SECURITY_SCAN_DIR`에 봉인 전 `scan-manifest.json`과 `findings.json`을 직접 쓴다. 모델은 findings가 비어도 초안에 저장한다.[](source:sdk-all) | 두 파일을 확인하고 SDK에 제어를 돌려준다. SDK가 보고서와 위협 모델을 만들고 봉인한다.[](source:sdk-end) |
| SDK 밖 managed scan | draft 도구가 필수다.[](source:rs-draft) | `complete_codex_security_scan`을 한 번 부른다.[](source:rs-done) |
| Codex desktop | 위와 같다. 완료 전에 handoff가 요구하는 finding별 write-up을 마친다.[](source:d-write) | 완료 뒤 보고서와 canonical artifacts를 링크한다.[](source:d-write) |

지정 경로 scan에서는 inventory를 먼저 만든다. SDK scan은 scan shell에서 `make-repo-scope-input` helper로 inventory를 만들고, 성공한 직후 파일 검토 전에 `CODEX_SECURITY_SCAN_PROGRESS`를 `discovery` phase, 완료 0개로 내보낸다. inventory는 직접 지정한 파일과 지정 디렉터리의 ignore되지 않은 하위 파일을 담는다. 해석이 실패하면 오류를 올리고 소스 검토 전에 멈춘다.[](source:sc-all)

@facts id=desktop-priority
| critical | `P0`, 숫자 `0` |
| high | `P1` · 숫자 `1` |
| medium | `P2` · 숫자 `2` |
| low | `P3` · 숫자 `3` |

Codex desktop은 finding마다 `::code-comment{...}` 한 줄을 가장 좁은 root control 위치나 가장 관련된 위치에 내보낸다. 위 표가 심각도 라벨과 priority 숫자의 대응이다.[](source:d-write)

## 무엇을 강제하고 언제 멈추나? {#rules}

| 조건 | 에이전트의 행동 |
|---|---|
| 소스를 읽기 전 | 요청된 target과 scope를 먼저 묶는다. 사용자 context는 분석 데이터로 보존한다.[](source:bind)[](source:guard) |
| 검토 중 | target은 읽기 전용이다. offline으로 현재 소스를 검토한다. 링크는 따라가지 않는다.[](source:guard) |
| 명시된 URL | 사용자가 명시적으로 읽기를 허가했을 때 parent만 한 번 읽는다.[](source:guard) |
| 시간 제한 | 기존 investigation allowance는 worker와 resume 사이에 그대로 둔다. 사용자가 이 대화에서 시간 제한을 요청했고 아무것도 없을 때만 time budget 템플릿을 소스 검토 전에 한 번 render한다.[](source:guard) |
| 역할 분담 | scan 관리는 parent가 맡는다. reviewer에게는 허가된 소스와 보안 context를 준다.[](source:core) |
| 보고 | 소스 줄과 구체적 영향을 붙인다. 본 범위와 남은 불확실성을 기록한다.[](source:core) |
| handoff 실패·다른 모드 | 소스 검토 전에 멈춘다. 저장된 phase를 재개한다. 아직 preflight인 옛 handoff는 `threat_model`로 한 번 올린다.[](source:m-resume) |
| 완료 실패 | 오류를 보여 주고 durable scan을 보존한다. 취소는 사용자 요청이 있을 때만 한다. 복구를 다 해 보고도 풀 수 없는 blocker가 확인됐을 때만 scan을 fail 처리한다. 끝나지 않은 일은 재개할 수 있게 둔다.[](source:rs-fail) |

@callout level=warning title="SDK 소유 scan은 여기서 끝내지 않는다"
| SDK가 만든 scan은 SDK가 finalization을 소유한다. 이 스킬은 두 파일을 확인한 뒤 scan을 돌려준다.[](source:start)[](source:rs-done) |

판정 · 사람 승인 지점은 원문에 URL 읽기 허가, 시간 제한 요청, 취소 요청 세 가지뿐이다. 그 밖에 사용자에게 묻는 단계는 원문에 명시 없음이다.[](source:guard)[](source:rs-fail)

판정 · 이 스킬의 SKILL.md는 단계 스킬 이름을 적지 않는다. 호출하지 않는다는 근거는 네 단계 스킬 쪽 문장이다.[](source:full)[](source:p-tm)[](source:p-fd)[](source:p-val)[](source:p-ap)

## 다른 스킬과 어디에서 이어지나? {#position}

@workflow id=position-flow title="security-scan에서 갈라지거나 이어지는 스킬"
| cur | security-scan | backend | source:front |
| diff | security-diff-scan | backend | source:diff-desc |
| deep | deep-security-scan | backend | source:deep-desc |
| track | track-findings | backend | source:track-part |
| cur > diff | 변경 범위 R01 | dashed |
| cur > deep | deep 요청 R02 | dashed |
| cur > track | 요청 시 R24 | dashed |

@steps id=position-steps
| highlight | security-scan | 이 페이지의 스킬이다. 대상에 따라 diff·deep 스킬로 가거나, 끝난 scan 폴더를 track-findings가 읽는다. | position-flow | cur |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R01 · 넘김 | 변경 범위에는 diff 스킬을 쓰라고 description이 정한다. 사용자와 host가 스킬을 고른다.[](source:front) |
| R02 · 넘김 | 사용자가 명시적으로 요청한 deep scan에만 deep 스킬을 쓴다.[](source:front) |
| R05 · 참고 | deep 스킬이 Standard 감사를 반복하는 주체는 host다. deep 스킬이 이 스킬 본문을 호출한다는 문장은 원문에 명시 없음이다.[](source:deep-loop) |
| R14 · 참고 | `threat-model`은 "Standard scans and Deep workers build models within their own workflow rather than invoking this phase skill"라고 적는다.[](source:p-tm) |
| R15 · 참고 | `finding-discovery`는 "Standard and Deep workers use their coordinator's self-contained prompts rather than this phase skill"라고 적는다.[](source:p-fd) |
| R16 · 참고 | `validation`은 Standard scan과 Deep Scan worker가 Standard scan workflow 안에서 검증하며 이 단계 스킬을 호출하지 않는다고 적는다.[](source:p-val) |
| R17 · 참고 | `attack-path-analysis`도 같은 문장으로 Standard scan과 Deep Scan worker의 호출을 부정한다.[](source:p-ap) |
| R21 · 참고 | Codex desktop에서만 handoff가 요구하는 finding별 write-up을 scan 완료 전에 마친다. 스킬 이름은 적지 않는다. write-up은 `findings/<slug>/<slug>.md`에 둔다.[](source:d-write)[](source:vw-part) |
| R24 · 산출물 호환 | scan이 끝나면 `scan-manifest.json`과 `findings.json`이 생기고, track-findings는 봉인된 scan 하나의 이 두 파일을 읽는다. 사용자가 요청할 때 따로 부른다. 자동 순서는 없다.[](source:rs-done)[](source:track-part)[](source:track-part2) |

전체 흐름은 색인 기준 `_group-scan-vulnerabilities/scan-vulnerabilities.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `SKILL.md` 1개 2,972B, `agents/openai.yaml` 1개 245B, `references/` 6개 16,379B를 끝까지 읽었다. 합계 8개, 19,596B.[](source:full)[](source:yaml) |
| 호출 제한 대조 | 단계 스킬 4개 `SKILL.md` 18,036B를 끝까지 읽었다. 형제 스킬 `deep-security-scan`, `security-diff-scan`도 끝까지 읽었다.[](source:tm-full)[](source:deep-full) |
| 부분 읽음 | `track-findings`(13,459B)는 8·24줄, `vulnerability-writeup`(5,571B)은 3·42줄, `ecc/security-scan/SKILL.md`(4,592B)는 앞 12줄과 SHA-256, `skills-lock.json`은 이 스킬 항목만 읽었다.[](source:lock)[](source:ecc-part) |
| 제외 | `*.KO.md` 번역본이 없다. 바이너리는 없다. |

원문의 활성화 안내, 시작 도구 분기 3가지, 읽기 전용·offline 규칙, 시간 제한 조건, 완료·실패·취소 조건, desktop priority 대응 4개를 모두 대조했다. 수치는 위 4개 대응과 `once` 표현이 전부이고 시간·횟수 임계값은 원문에 명시 없음이다.

동명 스킬이 `ecc/security-scan`에 있다. SHA-256이 다르고 ecc 쪽은 `.claude/` 설정을 AgentShield로 점검하는 스킬이다. 동명·내용 다름이며 판본의 선후 관계는 근거가 없어 적지 않는다.[](source:ecc-part)[](source:lock)

`references/scan-artifacts-and-ledger.md`는 이 스킬 폴더에 있지만 스스로 "Standard, Deep, and compact Workbench Diff scans do not use it"이라고 밝힌다. 단독·옛 diff 발견용 문서로만 읽었다.[](source:ledger-head)

@callout level=open-question title="읽지 못한 필수 자료와 확인하지 못한 동작"
| 이 스킬이 읽으라고 지시하는 plugin 루트 문서 7개가 컬렉션에 없다: `references/core-scan.md`(독립 baseline·집중 조사·검증), `access-advisory.md`, `investigation-time-budget.md`, `artifact-storage.md`, `final-report.md`, `scan-contract.md`, `scan-artifacts.md`. 순서나 통과 조건을 더 정하는지 알 수 없다. |
| `start_codex_security_standard_scan` 같은 MCP 도구와 helper의 실제 동작, host가 이 스킬을 활성화하는 방식은 실행으로 확인하지 않았다. |

분석 중 원본은 수정하지 않았다. 이 폴더에 새 분석 초안과 HTML만 썼고 어떤 도구나 명령도 실행하지 않았다.
