# 취약점 scan은 대상에 따라 어느 스킬이 맡고, 단계 스킬은 어떻게 이어지나? {#scan-vulnerabilities-page}

대상이 저장소 전체나 지정 경로의 현재 소스이면 `security-scan`, PR·commit·branch·working-tree 변경이면 `security-diff-scan`, 사용자가 deep scan을 명시했으면 `deep-security-scan`이 맡는다. 세 스킬은 서로를 이름으로 부르지 않고 description이 선택 기준만 적는다.[](source:ss-desc)[](source:ds-desc)[](source:dp-desc) 단계 스킬 네 개를 원문이 순서대로 부르는 곳은 `security-diff-scan` 하나뿐이고, Standard scan과 Deep worker는 이 단계 스킬을 부르지 않는다.[](source:ds-s1)[](source:ds-s4)[](source:ss-wb)[](source:dp-lead) 부분 분석이다. plugin 루트의 `references/`·`schemas/`와 호스트 도구를 읽지 못해 거기서 정해지는 순서와 통과 조건은 알 수 없다.

- `security-diff-scan`은 `threat-model`, `finding-discovery`, `validation`, `attack-path-analysis`를 이 순서로 맡긴다. 후보가 있을 때만 `validation`을 한 번 돌리고, 공격 경로 단계는 `reportable`이나 `deferred` 후보에만 돌린다.[](source:ds-s1)[](source:ds-s3)[](source:ds-s4)
- 단계 스킬 네 개는 이미 해당 phase 안에 있거나 사용자가 명시로 요청할 때 쓰고, 전체 PR·commit·branch·patch·repository scan의 첫 진입점으로 쓰지 않는다.[](source:tm-desc)[](source:fd-desc)[](source:val-desc)[](source:ap-desc)
- `deep-security-scan`은 Standard 감사를 호스트가 반복 실행해 결과를 병합한다. 반복 횟수 상한은 `max_discovery_runs`이고 같이 도는 Standard scan까지 센다.[](source:dp-lead)[](source:dp-cap)
- 원문이 충돌한다. `security-diff-scan`은 "후보가 있을 때 validation 1회"라 하고 `validation`은 빈 집합이어도 `validations: []`를 제출하라고 한다. 우선순위는 원문에 없다.[](source:ds-s4)[](source:val-empty)

@answer scope="스킬 7개 · 관계 32개 · 호스트 도구와 plugin 루트 문서 미확인"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source ss-full title="codex-security/security-scan/SKILL.md · 2972B · 선택지(원본, 전부 읽음)" path=codex-security/security-scan/SKILL.md
@source ds-full title="codex-security/security-diff-scan/SKILL.md · 5405B · 선택지(원본, 전부 읽음)" path=codex-security/security-diff-scan/SKILL.md
@source dp-full title="codex-security/deep-security-scan/SKILL.md · 3127B · 선택지(원본, 전부 읽음)" path=codex-security/deep-security-scan/SKILL.md
@source tm-full title="codex-security/threat-model/SKILL.md · 2986B · 단계(원본, 전부 읽음)" path=codex-security/threat-model/SKILL.md
@source fd-full title="codex-security/finding-discovery/SKILL.md · 5076B · 단계(원본, 전부 읽음)" path=codex-security/finding-discovery/SKILL.md
@source val-full title="codex-security/validation/SKILL.md · 4619B · 단계(원본, 전부 읽음)" path=codex-security/validation/SKILL.md
@source ap-full title="codex-security/attack-path-analysis/SKILL.md · 5355B · 단계(원본, 전부 읽음)" path=codex-security/attack-path-analysis/SKILL.md
@source res-full title="codex-security/security-scan/references/scan-results.md · 2871B · 결과 저장 규칙(원본, 전부 읽음)" path=codex-security/security-scan/references/scan-results.md
@source led-full title="codex-security/security-scan/references/scan-artifacts-and-ledger.md · 7021B · diff 단독 발견용 worklist(원본, 앞부분 12줄만 읽음)" path=codex-security/security-scan/references/scan-artifacts-and-ledger.md lines=1:12
@source desk-full title="codex-security/security-scan/references/desktop-scan.md · 580B · desktop 결과 handoff(원본, 앞부분만 읽음)" path=codex-security/security-scan/references/desktop-scan.md lines=1:5
@source ss-desc title="security-scan/SKILL.md · description" path=codex-security/security-scan/SKILL.md lines=3:3
@source ss-core title="security-scan/SKILL.md · 감사 방식" path=codex-security/security-scan/SKILL.md lines=8:10
@source ss-tools title="security-scan/SKILL.md · scan 시작과 호스트 도구" path=codex-security/security-scan/SKILL.md lines=14:17
@source ss-wb title="security-scan/SKILL.md · Standard의 자기 workflow" path=codex-security/security-scan/SKILL.md lines=21:21
@source ds-desc title="security-diff-scan/SKILL.md · description" path=codex-security/security-diff-scan/SKILL.md lines=3:3
@source ds-secmd title="security-diff-scan/SKILL.md · SECURITY.md 적용" path=codex-security/security-diff-scan/SKILL.md lines=16:16
@source ds-s1 title="security-diff-scan/SKILL.md · 1단계 threat-model" path=codex-security/security-diff-scan/SKILL.md lines=28:28
@source ds-s2 title="security-diff-scan/SKILL.md · 2단계 변경 inventory" path=codex-security/security-diff-scan/SKILL.md lines=29:29
@source ds-s3 title="security-diff-scan/SKILL.md · 3단계 finding-discovery" path=codex-security/security-diff-scan/SKILL.md lines=30:30
@source ds-s4 title="security-diff-scan/SKILL.md · 4단계 validation·attack-path" path=codex-security/security-diff-scan/SKILL.md lines=31:31
@source ds-s5 title="security-diff-scan/SKILL.md · 5단계 보고 계약" path=codex-security/security-diff-scan/SKILL.md lines=32:32
@source ds-s6 title="security-diff-scan/SKILL.md · 6단계 완료" path=codex-security/security-diff-scan/SKILL.md lines=33:33
@source ds-end title="security-diff-scan/SKILL.md · 종료 조건" path=codex-security/security-diff-scan/SKILL.md lines=35:35
@source dp-desc title="deep-security-scan/SKILL.md · description" path=codex-security/deep-security-scan/SKILL.md lines=3:3
@source dp-lead title="deep-security-scan/SKILL.md · 호스트의 반복 실행" path=codex-security/deep-security-scan/SKILL.md lines=8:8
@source dp-cont title="deep-security-scan/SKILL.md · 이어 실행" path=codex-security/deep-security-scan/SKILL.md lines=10:10
@source dp-cap title="deep-security-scan/SKILL.md · max_discovery_runs" path=codex-security/deep-security-scan/SKILL.md lines=11:11
@source dp-done title="deep-security-scan/SKILL.md · 완료 보고" path=codex-security/deep-security-scan/SKILL.md lines=14:14
@source tm-desc title="threat-model/SKILL.md · description" path=codex-security/threat-model/SKILL.md lines=3:3
@source tm-intro title="threat-model/SKILL.md · Standard·Deep의 자기 workflow" path=codex-security/threat-model/SKILL.md lines=8:8
@source tm-ret title="threat-model/SKILL.md · 결과 보관" path=codex-security/threat-model/SKILL.md lines=25:27
@source fd-desc title="finding-discovery/SKILL.md · description" path=codex-security/finding-discovery/SKILL.md lines=3:3
@source fd-intro title="finding-discovery/SKILL.md · 입력 근거" path=codex-security/finding-discovery/SKILL.md lines=8:10
@source fd-sel title="finding-discovery/SKILL.md · workflow 선택" path=codex-security/finding-discovery/SKILL.md lines=14:18
@source fd-rep title="finding-discovery/SKILL.md · 반복 금지" path=codex-security/finding-discovery/SKILL.md lines=31:31
@source val-desc title="validation/SKILL.md · description" path=codex-security/validation/SKILL.md lines=3:3
@source val-fp title="validation/SKILL.md · false_positive_feedback.json" path=codex-security/validation/SKILL.md lines=14:14
@source val-int title="validation/SKILL.md · scan 연동" path=codex-security/validation/SKILL.md lines=21:21
@source val-wb title="validation/SKILL.md · Compact Workbench Diff" path=codex-security/validation/SKILL.md lines=25:30
@source val-empty title="validation/SKILL.md · 빈 집합 제출" path=codex-security/validation/SKILL.md lines=28:28
@source ap-desc title="attack-path-analysis/SKILL.md · description" path=codex-security/attack-path-analysis/SKILL.md lines=3:3
@source ap-in title="attack-path-analysis/SKILL.md · 입력" path=codex-security/attack-path-analysis/SKILL.md lines=12:14
@source ap-cont title="attack-path-analysis/SKILL.md · Continuum evidence" path=codex-security/attack-path-analysis/SKILL.md lines=21:21
@source ap-int title="attack-path-analysis/SKILL.md · Standard·Deep의 자기 workflow" path=codex-security/attack-path-analysis/SKILL.md lines=27:27
@source ap-wb title="attack-path-analysis/SKILL.md · Compact Workbench Diff" path=codex-security/attack-path-analysis/SKILL.md lines=31:36
@source res-draft title="security-scan/references/scan-results.md · 첫 초안과 canonical artifacts" path=codex-security/security-scan/references/scan-results.md lines=7:7
@source res-done title="security-scan/references/scan-results.md · scan-manifest.json과 findings.json" path=codex-security/security-scan/references/scan-results.md lines=13:13
@source led-intro title="security-scan/references/scan-artifacts-and-ledger.md · 사용 범위" path=codex-security/security-scan/references/scan-artifacts-and-ledger.md lines=1:3
@source desk-intro title="security-scan/references/desktop-scan.md · per-finding write-up" path=codex-security/security-scan/references/desktop-scan.md lines=3:3
@source vw-desc title="vulnerability-writeup/SKILL.md · description" path=codex-security/vulnerability-writeup/SKILL.md lines=3:3
@source vw-path title="vulnerability-writeup/SKILL.md · 최종 보고 저장 경로" path=codex-security/vulnerability-writeup/SKILL.md lines=42:42
@source ph-desc title="propose-security-hardening/SKILL.md · description" path=codex-security/propose-security-hardening/SKILL.md lines=3:3
@source ph-path title="propose-security-hardening/SKILL.md · 자동 최종 보고의 저장 경로" path=codex-security/propose-security-hardening/SKILL.md lines=41:46
@source tf-sealed title="track-findings/SKILL.md · sealed scan 입력" path=codex-security/track-findings/SKILL.md lines=8:8
@source tf-read title="track-findings/SKILL.md · 읽는 파일" path=codex-security/track-findings/SKILL.md lines=24:24
@source pf-cont title="publish-findings/SKILL.md · AWS Continuum 행" path=codex-security/publish-findings/SKILL.md lines=25:25
@source vis-in title="threat-model-visualize/SKILL.md · 기본 입력" path=codex-security/threat-model-visualize/SKILL.md lines=8:10
@source sp-8 title="define-security-policy/SKILL.md · SECURITY.md 성격" path=codex-security/define-security-policy/SKILL.md lines=8:8
@source tm-sel title="threat-model/SKILL.md · 모델 선택과 SECURITY.md 대용" path=codex-security/threat-model/SKILL.md lines=14:19
@source sp-helper title="define-security-policy/SKILL.md · resolve-security-md helper" path=codex-security/define-security-policy/SKILL.md lines=14:28

## 요청 대상에 따라 어느 scan 스킬을 쓰나? {#choose}

그림의 결정 노드는 `security-scan` description이 적은 선택 기준을 그린 것이다. 원장의 R01·R02는 `security-scan`에서 나가는 넘김이다. 어느 스킬을 쓸지는 사용자와 호스트가 정하고, 세 스킬이 서로를 자동으로 호출하지는 않는다.[](source:ss-desc)[](source:ds-desc)[](source:dp-desc)

@workflow id=scan-choice title="대상 범위에 따라 scan 스킬 고르기"
| req | 스캔 요청 | external |
| scope | 대상이 무엇인가? | backend |
| std | security-scan | backend | source:ss-desc |
| diff | security-diff-scan | backend | source:ds-desc |
| deep | deep-security-scan | backend | source:dp-desc |
| req > scope | |
| scope > std | 기본 | emphasis |
| scope > diff | 변경분 R01 | |
| scope > deep | deep 요청 R02 | |
| deep > diff | 이어 실행 R03 | dashed |
| deep > std | 이어 실행 R04 | dashed |

@steps id=choose-steps
| std-step | security-scan | 저장소 전체나 지정 경로의 현재 소스를 한 번의 패스로 감사한다. | scan-choice | std |
| diff-step | security-diff-scan | 변경 파일 전체를 검토하되 단계 스킬 네 개에 맡긴다. | scan-choice | diff |
| deep-step | deep-security-scan | 호스트가 Standard 감사를 반복 실행해 결과를 병합한다. | scan-choice | deep |

| rel-id·종류 | 전달물과 조건 | 그림 반영 |
|---|---|---|
| R01 · 넘김 | 대상이 PR, commit, branch, working-tree 변경이면 diff 스킬을 쓰라고 description이 정한다. 스킬 이름은 적지 않는다. 사용자와 호스트가 스킬을 고른다.[](source:ss-desc)[](source:ds-desc) | 표시 |
| R02 · 넘김 | 사용자가 deep scan을 명시적으로 요청했을 때만 deep 스킬을 쓰라고 한다. 스킬 이름은 적지 않는다.[](source:ss-desc)[](source:dp-desc) | 표시 |
| R03 · 넘김 | deep description이 PR, commit, branch, working tree 변경에는 `security-diff-scan`을 쓰라고 정한다. 이어 실행하는 scan의 저장된 모드가 diff이면 대응하는 scan 스킬로 계속한다. 저장된 scan 정체성과 범위는 호스트(`get_codex_security_scan_context`, handoff token)가 관리한다.[](source:dp-desc)[](source:dp-cont)[](source:ds-desc) | 표시 |
| R04 · 넘김 | 이어 실행하는 scan의 저장된 모드가 Standard이면 "the corresponding scan skill"로 계속한다. 대응 스킬 이름은 적지 않는다.[](source:dp-cont)[](source:ss-desc) | 표시 |
| R05 · 참고 | 호스트가 Standard audit를 반복 실행해 finding을 병합한다. 연속 audit가 새 결과를 더하지 못하거나 설정된 scan 또는 시간 한도에 닿으면 멈춘다. `max_discovery_runs`는 같이 도는 Standard scan까지 센 총 횟수 상한이다. Deep scan이 `security-scan` 본문을 호출한다는 문장은 없다. 이미 보고된 finding의 제목과 위치가 다음 pass에 전달된다.[](source:dp-lead)[](source:dp-cap)[](source:ss-desc) | 생략(R04와 같은 두 노드 쌍이라 간선 하나만 그렸다) |

## diff scan은 단계 스킬 네 개를 어떤 순서로 맡기나? {#diff-delegation}

그림은 `security-diff-scan` 본문의 1·3·4단계가 적은 순서만 따른다. 각 단계 스킬이 끝나면 diff scan으로 돌아온다. 이 순서는 원문이 명시한 곳이 `security-diff-scan` 하나뿐이다. 다른 곳에서는 순서를 강제하지 않는다.[](source:ds-s1)[](source:ds-s3)[](source:ds-s4)

@workflow id=diff-order-flow title="security-diff-scan이 단계 스킬에 맡기는 순서"
| start | security-diff-scan | external | source:ds-s1 |
| tm | threat-model | backend | source:ds-s1 |
| fd | finding-discovery | backend | source:ds-s3 |
| has | 후보가 있는가? | backend | source:ds-s4 |
| val | validation | backend | source:ds-s4 |
| ap | attack-path-analysis | backend | source:ds-s4 |
| wrap | 결과 정리와 완료 | external | source:ds-s6 |
| start > tm | 한 번 R06 | emphasis |
| tm > fd | 모델 유지 R07 | emphasis |
| fd > has | |
| has > val | 예 R08 | emphasis |
| val > ap | reportable·deferred R09 | emphasis |
| has > wrap | 아니오 | |
| ap > wrap | | |

@steps id=delegation-steps
| tm-step | threat-model | 한 번 실행하거나 사용자가 준 모델을 쓴다. 저장소 전체가 기본이다. | diff-order-flow | tm |
| fd-step | finding-discovery | 변경 파일 inventory 전체에서 후보를 찾아 한 번에 기록한다. | diff-order-flow | fd |
| val-step | validation | 후보가 있을 때 한 번 실행해 후보마다 처분을 낸다. | diff-order-flow | val |
| ap-step | attack-path-analysis | `reportable`이나 `deferred` 후보의 공격 경로와 보고 여부를 정한다. | diff-order-flow | ap |

| rel-id·종류 | 전달물과 조건 | 그림 반영 |
|---|---|---|
| R06 · 내부 위임 | "Run `$threat-model` once, or use the supplied model". 한 번만 실행하고 사용자가 모델을 주면 그것을 쓴다. 모델은 저장소 전체가 기본이고 사용자가 좁히라고 할 때만 좁힌다. 위임이 끝나면 diff scan이 `complete: false` 초안을 저장한다. 호스트 workbench가 `threatmodel.md`를 쓴다.[](source:ds-s1)[](source:tm-ret) | 표시 |
| R07 · 내부 위임 | "Run `$finding-discovery` in compact diff mode across that inventory". 사용 가능한 worker에 독립 `assignment`를 나눠 주고 나머지 파일은 직접 본다. 순위 목록, finding별 장부, discovery 보고서는 만들지 않는다. 후보는 `record_codex_security_discovery_candidates`에 한 번에 기록한다.[](source:ds-s3)[](source:fd-sel) | 표시 |
| R08 · 내부 위임 | "If candidates exist, run `$validation` once". 후보가 없으면 실행하지 않는다. 후보 전체는 `list_codex_security_candidates`로 읽고 처분 전체를 한 번에 제출한다.[](source:ds-s4)[](source:val-wb) | 표시 |
| R09 · 내부 위임 | validation 다음에 한 번, `reportable` 또는 `deferred`로 표시된 후보에만 실행한다. 이 단계에 들어갈 후보가 없으면 `attackPaths: []`를 제출한다.[](source:ds-s4)[](source:ap-wb) | 표시 |

@callout level=open-question title="validation 실행 조건이 원문 두 곳에서 갈린다"
| `security-diff-scan`은 "If candidates exist, run `$validation` once"라 적어 후보가 없으면 실행하지 않는 것으로 읽힌다.[](source:ds-s4) |
| `validation`의 workbench diff 절은 처분 전체를 한 번에 제출하며 빈 집합이면 `validations: []`를 제출하라고 한다.[](source:val-empty) |
| 두 문장 사이의 우선순위는 원문에 명시 없음이다. 후보가 없을 때 `validation`을 실행하는지 제출만 하는지 이 분석은 정하지 않는다. `attackPaths: []`도 같은 모양이다.[](source:ap-wb) |

## 단계 스킬끼리 무엇을 주고받고, Standard·Deep은 이 단계를 부르나? {#handoff}

단계 스킬끼리의 산출물 호환은 diff scan 밖에서 순서를 강제하지 않는다. 그림에서 뺀 이유다. Standard scan과 Deep worker는 단계 스킬을 호출하지 않으므로 이 표의 R14~R17은 "호출하지 않는다"는 경계로만 읽는다.[](source:tm-intro)[](source:ss-wb)

| rel-id·종류 | 전달물과 조건 | 그림 반영 |
|---|---|---|
| R10 · 산출물 호환 | `finding-discovery`는 "the threat model and applicable security policy"를 근거로 쓴다. 이 순서를 강제하는 곳은 diff scan(R06~R09)뿐이다. 단독 호출에서 위협 모델 없이 discovery를 돌려도 되는지는 원문에 명시 없음이다.[](source:fd-intro)[](source:tm-ret) | 생략 |
| R11 · 산출물 호환 | `validation`은 discovery의 candidate ID와 discovery 필드를 보존해 이어받는다. discovery 안에서 validation을 반복하지 않는다("Do not repeat validation or attack-path phases inside discovery").[](source:fd-rep)[](source:val-wb) | 생략 |
| R12 · 산출물 호환 | `attack-path-analysis`는 "all validated candidates" 중 `reportable` 또는 `deferred`만 분석하고 후보 정체성과 기존 필드를 보존한다.[](source:ap-wb)[](source:val-wb) | 생략 |
| R13 · 산출물 호환 | scan 단계에서는 per-scan 위협 모델과 후보 집합을 쓴다. 단독 분석에서는 위협 모델이나 보안 정책이 있으면 쓰고 per-scan 산출물은 필요 없다.[](source:ap-in)[](source:tm-ret) | 생략 |
| R14 · 참고 | Standard scan과 Deep worker는 위협 모델을 자기 workflow 안에서 만들며 `threat-model`을 호출하지 않는다.[](source:tm-intro)[](source:ss-wb) | 생략 |
| R15 · 참고 | "Standard and Deep workers use their coordinator's self-contained prompts rather than this phase skill". Standard와 Deep은 `finding-discovery` 본문을 쓰지 않는다.[](source:fd-sel)[](source:ss-wb) | 생략 |
| R16 · 참고 | Standard scan과 Deep Scan worker는 validation을 자기 workflow 안에서 하며 `validation`을 호출하지 않는다.[](source:val-int)[](source:ss-wb) | 생략 |
| R17 · 참고 | Standard scan과 Deep Scan worker는 공격 경로를 자기 workflow 안에서 평가하며 `attack-path-analysis`를 호출하지 않는다.[](source:ap-int)[](source:ss-wb) | 생략 |
| R18 · 참고 | compact inventory 없이 diff를 단독으로 발견할 때 `../security-scan/references/scan-artifacts-and-ledger.md`를 읽고 변경 파일 worklist(`rank_input.jsonl` 등)와 단계별 산출물을 만든다. 그 파일은 "standalone or legacy diff discovery"에만 쓰고 Standard, Deep, compact Workbench Diff는 쓰지 않는다고 스스로 밝힌다.[](source:fd-sel)[](source:led-intro) | 생략 |

## 어떤 파일과 상태를 공유하나? {#state}

공유 상태는 호스트 workbench와 scan 폴더에 있다. 이 컬렉션에는 workbench 구현이 없어서 도구 이름과 파일 이름은 지시상 동작으로만 적는다.

| 파일·상태 | 쓰는 스킬·주체 | 읽는 스킬·조건 |
|---|---|---|
| `<scan_dir>/threatmodel.md` | diff scan이 모델로 `complete: false` 초안을 저장하면 호스트가 쓴다. 단독 요청에서는 `threat-model`이 저장한다.[](source:ds-s1)[](source:tm-ret) | 이후 단계가 같은 모델을 이어받는다. `threat-model-visualize`는 기존 위협 모델을 기본 입력으로 읽는다(R42·R43).[](source:ds-s1)[](source:vis-in) |
| 후보 목록(workbench) | `finding-discovery`가 `record_codex_security_discovery_candidates`로 한 번에 기록한다. `validation`이 `record_codex_security_candidate_validations`로, `attack-path-analysis`가 `record_candidate_attack_paths`로 처분을 덧붙인다.[](source:ds-s3)[](source:val-wb)[](source:ap-wb) | `validation`과 `attack-path-analysis`가 `list_codex_security_candidates`로 읽는다. 후보 순서와 discovery 필드는 도구가 보존한다.[](source:val-wb)[](source:ap-wb) |
| `<discovery_dir>/validation_artifacts/<candidate_id>/` | `validation`이 실제 근거가 있을 때만 만든다.[](source:val-wb) | 처분 기록이 보관 파일로 참조한다.[](source:val-wb) |
| `<context_dir>/false_positive_feedback.json` | 원문에 명시 없음. | `validation`이 근거로 읽는다. 지시가 아니다. 현재 코드와 통제에 이유가 아직 맞을 때만 일치 후보를 `suppressed`로 처분한다.[](source:val-fp) |
| `SECURITY.md`(루트와 컴포넌트별) | `define-security-policy`가 쓴다. 정책 맥락이며 실행 지시가 아니다.[](source:sp-8) | `finding-discovery`가 검토 경로마다 찾아 쓰고(R44), `security-diff-scan`이 관련 지침을 적용하고(R47), `threat-model`이 필요한 경계가 있으면 모델 대신 쓴다(R45). 선후 관계는 없다. 해석은 호스트 helper인 `resolve-security-md`가 한다.[](source:fd-intro)[](source:ds-secmd)[](source:tm-sel)[](source:sp-helper) |
| `scan-manifest.json`, `findings.json` | 호스트 workbench가 만든다. SDK가 맡은 scan은 SDK가 봉인한다.[](source:res-done) | `security-scan`이 두 파일이 있는지 확인한다. `track-findings`가 봉인된 scan만 읽는다(R24).[](source:res-done)[](source:tf-read) |
| `report.md`, SARIF, canonical artifacts | 완료 처리가 만든다. diff scan은 `report.md`와 SARIF, deep scan은 `report.md`와 canonical artifacts를 링크한다.[](source:ds-s6)[](source:dp-done) | 최종 보고가 링크한다.[](source:ds-s6)[](source:dp-done) |
| 단독 diff 발견용 worklist | `finding-discovery`가 compact inventory 없이 diff를 발견할 때 만든다(R18).[](source:fd-sel)[](source:led-intro) | 같은 phase의 산출물로 쓴다. Standard, Deep, compact Workbench Diff는 쓰지 않는다.[](source:led-intro) |

@callout level=note title="이 묶음에 안내 역할 스킬은 없다"
| 원장은 세 scan 스킬을 모두 선택지, 네 단계 스킬을 모두 단계로 둔다. 목록만 나열하는 허브 스킬은 이 묶음에 없다. `security-scan` description이 선택 기준을 적지만 다른 스킬을 대신 호출하지는 않는다.[](source:ss-desc) |

## scan 바깥으로 이어지는 관계는 무엇인가? {#outbound}

아래 관계는 다른 묶음의 스킬과 맺는 것이다. 모두 사용자가 따로 요청할 때 쓰며 자동 순서는 없다. 그림에서 뺐다.

| rel-id·종류 | 전달물과 조건 | 그림 반영 |
|---|---|---|
| R19 · 참고 | diff scan의 최종 보고 단계가 "Detailed write-ups and hardening plans are optional requested outputs"라고 적는다. 사용자가 요청할 때만 `vulnerability-writeup`의 상세 write-up을 만든다. 스킬 이름은 적지 않는다.[](source:ds-s5)[](source:vw-desc) | 생략 |
| R20 · 참고 | R19와 같은 문장. hardening plan은 `propose-security-hardening`의 요청된 선택 산출물이다. 스킬 이름은 적지 않는다.[](source:ds-s5)[](source:ph-desc) | 생략 |
| R21 · 참고 | Codex desktop scan에서만 "per-finding write-ups"를 요구하는 handoff를 따르고 scan 완료 전에 마친다. 보고서는 `findings/<slug>/<slug>.md`(`writeup.reportPath`)다. 스킬 이름은 적지 않는다.[](source:desk-intro)[](source:vw-path) | 생략 |
| R22 · 참고(불명) | `propose-security-hardening`이 "when a top-level scan requests final-report hardening guidance"라고만 적는다. 어느 scan인지 정하지 않아 `security-scan`, `security-diff-scan`, `deep-security-scan` 중 어디인지 해석하지 못했다. 자동 보고에서는 `hardening/hardening.md`를 저장하고 상대 경로를 orchestrator에 돌려준다(`scan.hardening.portfolioPath`).[](source:ph-desc)[](source:ph-path) | 생략 |
| R23 · 참고(불명) | `vulnerability-writeup`이 "During Codex Security final reporting"이라고만 적고 어느 scan인지 정하지 않는다. 보고서는 `findings/<slug>/<slug>.md`에 두고 `writeup.reportPath`로 돌려준다.[](source:vw-path) | 생략 |
| R24 · 산출물 호환 | scan이 끝나면 `scan-manifest.json`과 `findings.json`이 생긴다. `track-findings`는 "one sealed scan"만 받고 이 두 파일을 읽는다. 사용자가 요청할 때 따로 호출한다. 자동 순서는 없다. 호스트 workbench나 SDK가 봉인하고 사용자가 폴더를 준다.[](source:res-done)[](source:tf-sealed)[](source:tf-read) | 생략 |
| R25 · 산출물 호환(추론) | diff scan이 완료 시 `report.md`와 SARIF가 생긴다고만 적고 `findings.json`은 이름으로 쓰지 않는다. `track-findings`가 받는 sealed scan과 같은 종류인지 이 컬렉션만으로 확정하지 못한다.[](source:ds-s6)[](source:tf-sealed) | 생략 |
| R26 · 산출물 호환(추론) | deep scan이 완료 시 `report.md`와 "canonical artifacts"를 링크한다고만 적는다. sealed scan과 같은 종류인지 확정하지 못한다.[](source:dp-done)[](source:tf-sealed) | 생략 |
| R36 · 넘김(들어옴) | `publish-findings`가 AWS Continuum 항목에 한해 "give `$attack-path-analysis` the selected issue's stored `.evidence`, including its validation artifacts"라고 한다. `attack-path-analysis`는 Continuum의 `source_data.evidence_artifacts`를 읽는 규칙을 따로 갖는다. 선택한 issue를 에이전트가 넘긴다.[](source:pf-cont)[](source:ap-cont) | 생략 |
| R43 · 산출물 호환 | `threat-model-visualize`는 "Visualize the threat model generated in the last scan of X"라는 요청만으로 충분하다. 최신 artifact가 없으면 오래된 것을 쓰기 전에 알리고 새 scan은 돌리지 않는다. from 줄(`scan-results.md`)은 "canonical artifacts"라고만 쓰고 `threatmodel.md`를 이름으로 지목하지 않아 직접 근거는 to 줄 쪽이다. diff scan과 deep scan의 위협 모델도 같은 방식인지는 원문에 명시 없음이다.[](source:res-draft)[](source:vis-in) | 생략 |

R22와 R23은 해석 상태가 `불명`이다. 두 스킬이 호출 scan을 정하지 않으므로 이 페이지는 어느 scan이 어느 보고서를 요구하는지 정하지 않는다.[](source:ph-desc)[](source:vw-path)

## 어디까지 대조했고 무엇이 남았나? {#audit-panel}

스킬 본문 7개와 `security-scan`의 references 3개를 읽었다. references 중 `scan-artifacts-and-ledger.md`와 `desktop-scan.md`는 앞부분만 읽었다. `skills-lock.json`과 번역본은 열지 않았고 다른 묶음 스킬의 본문은 해당 줄만 대조했다. 대상 스킬의 지시는 읽기만 했고 도구나 스크립트는 실행하지 않았다.

관계 32개(R01~R26, R36, R43, 상태 표에서 인용한 R42·R44·R45·R47)를 원문의 해당 줄과 대조했다. 위 관계 표에서 R22·R23만 `불명`이다.

| 범위 밖 참조 | 관련 스킬 | 이 묶음에서 알 수 없는 것 |
|---|---|---|
| 플러그인 루트 `references/artifact-storage.md` (R60) | `security-diff-scan`, `threat-model`, `finding-discovery`, `validation`, `attack-path-analysis` | 저장 경로와 정책 |
| `references/security-guidance.md` (R61) | `finding-discovery`, `threat-model` | `SECURITY.md` chain 해석 규칙 |
| `references/`의 scan 규약 문서(`scan-runtime.md`, `scan-artifacts.md`, `final-report.md`, `core-scan.md`, `access-advisory.md` 등) (R62) | scan 스킬 3개와 단계 스킬 | 단계 순서, 최종 보고 계약, 시간 예산 틀 |
| `references/static-finding-assessment.md`, `default-severity-rubric.md` (R63) | `validation`, `attack-path-analysis` | 정적 근거 평가와 severity 기준 |
| `schemas/tools/candidate-validations.schema.json` (R64) | `validation` | 처분 JSON 형식 |
| Codex Security 호스트 도구와 `launch_codex_security_mcp` (R65) | scan 스킬 3개, `threat-model`, `finding-discovery` | scan 시작과 기록, 완료 처리의 실제 동작 |

@callout level=open-question title="미확인 범위"
| 위 표의 범위 밖 문서와 호스트 도구를 읽지 못했다. 표의 문서가 순서나 통과 조건을 더 정하는지는 알 수 없다. 이 페이지가 "순서가 없다"고 쓴 곳은 이 컬렉션의 원문에 순서가 없다는 뜻이다. |
| `security-diff-scan`과 `validation`·`attack-path-analysis`가 빈 후보 집합을 다루는 우선순위는 원문에 없다. |
| R25·R26은 추론이다. diff·deep scan의 산출물이 `track-findings`가 받는 sealed scan과 같은지 확정하지 못했다. |

자동 검증은 HTML 구조와 출처 해석을 확인한다. 사실 대조와 사람 검토는 별도다. 사람 검토는 미실시다.
