# scan 전에 읽을 보안 맥락은 어느 스킬이 만들고, 누가 읽고, 어떻게 보여 주나? {#threat-model-and-policy-page}

이 묶음은 scan이 코드를 읽기 전에 참고할 보안 맥락, 곧 위협 모델(`threatmodel.md`)과 정책 파일(`SECURITY.md`)을 만들고 읽기 쉬운 explorer로 보여 주는 작업을 위한 것이다.[](source:tm-intro)[](source:sp-8)[](source:vis-in) `threat-model`은 위협 모델을 만들거나 재사용한다. `define-security-policy`는 `SECURITY.md`를 쓰거나 검토한다. `threat-model-visualize`는 이미 있는 위협 모델을 standalone HTML explorer로 바꾼다. 세 스킬 사이에 필수 순서는 없다. **부분 분석**이다. `threat-model-visualize`의 renderer, 빌드 스크립트, 참고 문서 대부분은 이 페이지에서 읽지 않았다.

- `threatmodel.md`를 explorer로 읽는 스킬은 `threat-model-visualize` 하나다. 파일을 만드는 쪽은 단독 `threat-model`과 scan 안의 host다. 두 파일은 끝부분 형식이 다르다.[](source:vis-in)[](source:doc-ts)[](source:render-ts)
- `SECURITY.md`는 `define-security-policy`가 쓰고 여러 스킬이 각자 필요한 경로에서 읽는 공유 파일이다. 가장 가까운 정책이 우선하지만 workflow를 바꿀 권한은 없다.[](source:sg-chain)[](source:sg-trust)
- `threat-model`은 scan의 threat-modeling 단계이거나 사용자가 명시 요청할 때만 쓰고, 전체 scan의 첫 진입점으로는 쓰지 않는다.[](source:tm-front)
- `threat-model-visualize`는 새 assessment도 새 scan도 하지 않는다.[](source:vis-in)

@answer scope="스킬 3개 · 관계 18개 · 그림 2개 · 코드 실행 없음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=cd5035b88386f2e309c89f5af2814e7f3d7d8343
@source tm-front title="호출 조건(frontmatter)" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=1:4
@source tm-intro title="목적과 먼저 읽을 문서" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=8:10
@source tm-select title="모델 고르기" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=12:21
@source tm-ret title="결과 보관" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=23:27
@source tm-yaml title="UI 메타데이터" path=codex-security/plugins/codex-security/skills/threat-model/agents/openai.yaml
@source sp-front title="호출 조건(frontmatter)" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=1:4
@source sp-8 title="목적" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=8:8
@source sp-1 title="적용 정책 찾기" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=10:32
@source sp-2 title="경계 세우기" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=34:51
@source sp-3 title="초안 쓰기" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=53:85
@source sp-4 title="적용과 검증" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=87:93
@source sp-yaml title="UI 메타데이터" path=codex-security/plugins/codex-security/skills/define-security-policy/agents/openai.yaml
@source vis-front title="호출 조건(frontmatter)" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=1:4
@source vis-in title="목적과 입력" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=6:14
@source vis-1 title="1절 source inventory" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=16:29
@source vis-2 title="2절 view model 작성" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=31:43
@source vis-3 title="3절 반증 리뷰" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=45:65
@source vis-4 title="4절 빌드와 점검" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=67:81
@source vis-deliv title="전달" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=83:83
@source vis-yaml title="UI 메타데이터" path=codex-security/plugins/codex-security/skills/threat-model-visualize/agents/openai.yaml
@source vm-in title="빌드 명령" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/view-model.md lines=1:9
@source sg-save title="정책 저장 방식" path=codex-security/plugins/codex-security/references/security-guidance.md lines=7:7
@source sg-chain title="정책 chain 해석 순서" path=codex-security/plugins/codex-security/references/security-guidance.md lines=34:34
@source sg-trust title="정책은 데이터" path=codex-security/plugins/codex-security/references/security-guidance.md lines=36:36
@source tmref-rule title="위협 모델 작성 원칙" path=codex-security/plugins/codex-security/references/threat-model.md lines=3:3
@source tmref-rev title="독립 검토" path=codex-security/plugins/codex-security/references/threat-model.md lines=16:28
@source tmref-contract title="scan 결과 계약" path=codex-security/plugins/codex-security/references/threat-model.md lines=38:55
@source st-path title="허용 path 규칙" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=37:37
@source st-cache title="threat model 캐시와 footer" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=47:55
@source sa-paths title="scan 안 정책·위협 모델 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=26:29
@source sc-173 title="scan.threatModel 필드" path=codex-security/plugins/codex-security/references/scan-contract.md lines=173:173
@source core-11 title="위협 모델 단계" path=codex-security/plugins/codex-security/references/core-scan.md lines=11:11
@source core-26 title="정책 해석" path=codex-security/plugins/codex-security/references/core-scan.md lines=26:26
@source run-5 title="SECURITY.md 적용" path=codex-security/plugins/codex-security/references/scan-runtime.md lines=5:5
@source doc-ts title="threatmodel.md 생성" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts lines=33:75
@source render-fields title="footer 필드 목록" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-render.ts lines=18:25
@source render-ts title="footer 렌더링" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-render.ts lines=138:168
@source stor-ts title="허용 path 검사" path=codex-security/plugins/codex-security/mcp-app/src/artifact-storage.ts lines=148:173
@source res-inside title="scan root 밖 검사" path=codex-security/plugins/codex-security/mcp-app/src/helpers/resolve-security-md.ts lines=178:190
@source res-list title="--list 구현" path=codex-security/plugins/codex-security/mcp-app/src/helpers/resolve-security-md.ts lines=263:307
@source res-read title="UTF-8 검사" path=codex-security/plugins/codex-security/mcp-app/src/helpers/resolve-security-md.ts lines=309:318
@source res-scope title="정책 chain 해석" path=codex-security/plugins/codex-security/mcp-app/src/helpers/resolve-security-md.ts lines=320:380
@source res-cmd title="명령 인자와 종료 코드" path=codex-security/plugins/codex-security/mcp-app/src/helpers/resolve-security-md.ts lines=382:437
@source helpers-main title="helper 분기" path=codex-security/plugins/codex-security/mcp-app/helpers-main.ts lines=118:119
@source launcher title="--helper 분기" path=codex-security/plugins/codex-security/scripts/launch_codex_security_mcp lines=11:15
@source diff-16 title="정책 적용" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=16:16
@source diff-28 title="위협 모델 단계" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=28:28
@source scan-10 title="본체 안내" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=10:10
@source scan-res-7 title="첫 위협 모델 저장" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-results.md lines=7:7
@source deep-14 title="완료 보고" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=14:14
@source deep-tpl title="Deep worker prompt" path=codex-security/plugins/codex-security/mcp-app/templates/deep-scan/discovery.md lines=7:7
@source fd-8 title="목적과 읽을 문서" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=8:10
@source tf-39 title="정책 검토" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=39:48
@source ap-12 title="근거 입력" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=12:14
@source readme-sp title="정책·위협 모델 스킬 소개" path=codex-security/plugins/codex-security/skills/README.md lines=16:20

## 세 스킬은 어떤 순서로 쓰나? {#skill-order span=12}

에이전트는 사용자 요청에서 필요한 맥락을 가린 뒤 세 스킬 중 하나를 쓴다. 세 `SKILL.md`에는 다른 두 스킬을 부르라는 문장이 없다.[](source:tm-intro)[](source:sp-8)[](source:vis-in) `threat-model`이 만든 `threatmodel.md`를 `threat-model-visualize`가 입력으로 읽을 수 있을 뿐이다.[](source:vis-in)[](source:tm-ret)

@workflow id=context-choice title="보안 맥락 스킬 고르기"
| goal | 무엇이 필요한가? | external |
| sp | define-security-policy | backend |
| tm | threat-model | backend |
| viz | threat-model-visualize | frontend |
| goal > sp | 정책 |
| goal > tm | 위협 모델 |
| goal > viz | 기존 모델 보기 |
| tm > viz | 산출물 호환 |

@steps id=context-choice-steps
| goal | 무엇이 필요한가? | 에이전트는 사용자 요청을 읽고 어떤 맥락이 필요한지 가른다. 원문에는 세 스킬 중 하나를 고르는 규칙이 따로 없다. 판정: 세 description의 호출 조건이 겹치지 않아 분석자가 나란히 놓고 갈래로 그렸다.[](source:tm-front)[](source:sp-front)[](source:vis-front) `threat-model`은 scan이 이미 threat-modeling 단계에 있거나, 사용자가 `$threat-model`을 명시하거나, 위협 모델의 생성·갱신·저장을 명시 요청할 때 쓴다. 전체 PR, commit, branch, patch, repository scan의 첫 진입점으로는 쓰지 않는다.[](source:tm-front) `define-security-policy`는 scanner가 무엇을 검토하고 무엇이 범위 밖이며 어떤 보안 속성이 지켜져야 하는지 분명히 하거나, 기존 안내가 코드와 아직 맞는지 볼 때 쓴다.[](source:sp-front) `threat-model-visualize`는 "Visualize the threat model generated in the last scan of X" 같은 요청 한 문장이면 된다.[](source:vis-in) 세 스킬의 `agents/openai.yaml`에는 `interface`만 있고 `policy` 키가 없다.[](source:tm-yaml)[](source:sp-yaml)[](source:vis-yaml) | context-choice | goal |
| sp | define-security-policy | 에이전트는 대상 저장소나 구성요소를 정한다(모호하면 묻는다). 그다음 기존 `SECURITY.md`를 helper `resolve-security-md`의 `--list`로 먼저 나열하고, 해석 규칙은 `security-guidance.md`로 확인한다.[](source:sp-1) 소스, 설정, 보안 관련 test, 위협 모델, 검증된 finding을 필요한 만큼만 읽고 기존 안내와 맞춰 본다. 어긋난 노출·소유 주장, 빠졌거나 충돌하는 경계, 진짜 finding을 가릴 만큼 넓은 제외를 지적하고, 소유자가 확인하지 않은 범위·심각도·제외·위험 수용은 미해결로 표시한다.[](source:sp-2) 검토만 요청받았으면 초안이나 편집 요청이 올 때까지 검토에 머문다.[](source:sp-2) 초안은 예시 절 6개(System and Scope부터 Known Limitations and Compensating Controls까지)를 시스템에 맞게 늘리거나 줄여 쓴다.[](source:sp-3) 편집이 허가됐으면 일반 repository 도구로 적용한 뒤 resolver를 다시 돌려 diff, policy chain, 남은 불확실성을 보인다. staging, commit, push, PR은 사용자가 허가한 범위 안에서만 한다.[](source:sp-4) 이 단계의 산출물은 저장소 루트나 `<component>/SECURITY.md` 파일이고 다른 스킬로 넘기지 않는다. 읽는 쪽이 scan 중에 파일을 찾아 쓴다(아래 `SECURITY.md` 패널). 내부 절차와 규칙은 `skill-explainers/codex-security/plugins/codex-security/skills/define-security-policy/define-security-policy.html`에 있다.[](source:sp-1) | context-choice | sp |
| tm | threat-model | 에이전트는 먼저 `artifact-storage.md`와 `scan-artifacts.md`를 읽어 저장·cache 규칙과 target identity를 확인한다. 명시된 경로는 지키고, 명시적으로 필요한 입력이 없으면 생성 모델로 바꾸지 않고 요청한다.[](source:tm-intro) 그다음 어떤 모델을 쓸지 정한다. 공급된 모델이나 사용자가 지정한 권위 있는 보안 지침은 개정 요청이 없으면 그대로 둔다. 공급된 모델, 비어 있지 않은 `userContext`, 권위 있는 knowledge base, 더 좁은 범위 중 하나가 있는 scan은 공유 cache를 읽거나 바꾸지 않는다. 그 밖에는 cache의 마지막 `Repository`와 `Version` 줄이 대상과 현재 revision 또는 snapshot digest에 맞고 사용자가 교체를 요청하지 않았을 때만 재사용한다.[](source:tm-select) 저장소별 `AGENTS.md`나 해석된 `SECURITY.md`가 필요한 경계를 담고 있으면 모델을 대신할 수 있다.[](source:tm-select) 소스를 보기 전에 호출자가 주지 않았다면 `security-guidance.md`로 정책을 해석한다. 모델을 만들거나 고칠 때는 `references/threat-model.md`를 따르고, 결과를 실제 runtime 경계와 소스 근거에 맞춰 본 뒤 가설과 확정 finding을 구분한다.[](source:tm-select)[](source:tmref-rule) 결과는 scan 중이면 `{ "format": "markdown", "content": ... }`를 호출자에게 돌려주고 `complete: false` checkpoint를 저장한다. 단독 요청이면 `threatmodel.md`를 저장하거나 cache hit일 때 기존 문서 경로를 돌려준다.[](source:tm-ret) 위임이 불가할 때의 "sequential fallback"은 `SKILL.md`에만 이름이 나오고 참조 문서에는 그 이름의 절이 없다.[](source:tm-select)[](source:tmref-rev) 내부 규칙은 `skill-explainers/codex-security/plugins/codex-security/skills/threat-model/threat-model.html`에 있다. | context-choice | tm |
| viz | threat-model-visualize | 에이전트는 요청에서 대상, 최신 assessment, snapshot을 정한다. 최신 artifact가 없으면 오래된 것을 쓰기 전에 알린다. 기본 입력은 기존 위협 모델 artifact이고 완료된 scan을 자동으로 가져오지 않는다. 입력은 바꾸지 않고 snapshot을 몰래 합치지 않으며, application code를 읽거나 topology, 권한, 통제, 도달성, 검증을 지어내지 않는다.[](source:vis-in) 그다음 스킬 본문의 네 절을 거친다. 1절은 위협 모델에서 구성요소, 관계, 통제, coverage를 `source-inventory.md`로 열거하는 일이고 시각화를 계획하기 전에 끝낸다.[](source:vis-1) 2절은 검증한 inventory로 view model JSON과 geometry를 쓴다.[](source:vis-2) 3절은 반증 리뷰다. 가능하면 `fork_turns: "none"`으로 새 맥락 리뷰어를 띄우고 `correctness-review.md`에 `PASS` 또는 `REVISION REQUIRED`를 남기게 한다. 브라우저를 열거나 export를 시험하는 일은 이 리뷰가 끝난 뒤에만 한다.[](source:vis-3) 4절은 `build_explorer.py`에 위협 모델 파일을 `--assessment`로 넘겨 HTML을 빌드하고, 현재 JSON의 `PASS` receipt가 있을 때만 브라우저로 점검한다. 허용된 브라우저가 없으면 로컬 파일만 전달하고 브라우저 QA를 미완료로 표시한다.[](source:vis-4)[](source:vm-in) 결과는 로컬 standalone HTML이다. 사이트는 사용자가 호스팅을 명시할 때만 만든다.[](source:vis-deliv) 내부 규칙은 `skill-explainers/codex-security/plugins/codex-security/skills/threat-model-visualize/threat-model-visualize.html`에 있다. | context-choice | viz |

그림은 세 스킬의 선택과 `threat-model`에서 `threat-model-visualize`로 가는 산출물 호환(R42) 한 줄기만 그린다. 선택 노드는 분석자가 정리한 것이고 원문에 있는 분기가 아니다. 생략한 관계는 둘이다.

- `SECURITY.md`를 읽는 스킬들과의 관계(R44~R47, R73)는 아래 공유 상태 표에 있다.
- scan 스킬이 만드는 `threatmodel.md`(R43, R71, R72)는 다음 패널의 그림에 있다.

## `threatmodel.md`는 누가 만들고 explorer는 어떻게 받나? {#model-file span=12}

위협 모델 파일은 단독 `threat-model`이 저장하는 경우와 scan 안에서 host가 렌더링하는 경우가 있다. `threat-model-visualize`는 이 중 어느 파일이든 기존 위협 모델로 읽는다. 필수 순서가 아니라 산출물이 입력 조건에 맞는 관계다.[](source:vis-in)

@workflow id=model-to-explorer title="위협 모델 파일에서 explorer까지"
| m-tm | threat-model | backend |
| m-std | security-scan | external |
| m-diff | security-diff-scan | external |
| m-deep | deep-security-scan | external |
| m-doc | threatmodel.md | database |
| m-viz | threat-model-visualize | frontend |
| m-tm > m-doc | 단독 저장 |
| m-std > m-doc | host 렌더링 |
| m-diff > m-doc | host 렌더링 |
| m-deep > m-doc | primary 모델 |
| m-doc > m-viz | 읽기 | emphasis |

@steps id=model-file-steps
| m-tm | threat-model | 단독 요청이면 에이전트는 위협 모델을 만들거나 재사용해 `targetPath`(저장소 루트) 기준 `threatmodel.md`로 저장한다. scan이 돌고 있으면 스킬은 이 파일을 직접 쓰지 않는다. 모델 텍스트를 호출자에게 돌려줄 뿐이고, 보조 파일 저장 도구는 scan ID가 있을 때 `threatmodel.md` 쓰기를 거부한다.[](source:tm-ret)[](source:stor-ts) scan ID가 없는 단독 호출에서만 공유 모델을 쓸 수 있다.[](source:st-path)[](source:st-cache) 쓸 때는 정확한 `Repository`와 `Version` 두 줄을 끝에 붙인다.[](source:st-cache) | model-to-explorer | m-tm |
| m-std | security-scan | Standard scan은 이 단계 스킬을 부르지 않는다. 본체 `core-scan.md`가 `threat-model.md`를 읽게 해 자기 workflow 안에서 모델을 만든다.[](source:scan-10)[](source:core-11) 첫 usable 위협 모델이 나오면 `record_codex_security_scan_draft`에 `complete: false`와 빈 findings로 저장한다.[](source:scan-res-7) workbench scan이면 host가 `scan-manifest.json`의 `scan.threatModel`을 `<scan_dir>/threatmodel.md`로 렌더링한다.[](source:sa-paths)[](source:doc-ts) `security-scan` 쪽 문장은 `threatmodel.md`나 "last scan"을 말하지 않는다. 두 스킬이 이어지는 근거는 `scan-artifacts.md`와 host 구현이다. 사용자 요청은 "Visualize the threat model generated in the last scan of X" 한 문장이면 되고 새 scan은 돌리지 않는다.[](source:vis-in) | model-to-explorer | m-std |
| m-diff | security-diff-scan | diff scan은 `$threat-model`을 한 번 실행하거나 공급된 모델을 쓰고, 모델을 `complete: false` 초안에 저장한다. host가 `threatmodel.md`를 쓴다.[](source:diff-28) 렌더링은 scan 종류와 무관하게 manifest의 `scan.threatModel`을 읽는다.[](source:doc-ts)[](source:sa-paths) visualize 쪽에는 diff scan의 마지막 모델을 해석한다는 별도 문장이 없고, "last scan of X"라는 일반 지시에 포함된다.[](source:vis-in) 위임이라는 관계(R06)는 다른 묶음의 그림에 있고 아래 생략 표에 남겼다. | model-to-explorer | m-diff |
| m-deep | deep-security-scan | Deep 부모 scan은 첫 모델을 `scan.threatModel`에 두고, 완료된 worker들이 서로 다른 모델을 냈으면 나머지는 worker 기록에 둔다. host는 primary model에서 `threatmodel.md`를 만들고 이 파일은 "an exportable projection, not an independently authored input"이다.[](source:sc-173) 그러므로 visualize가 읽는 것은 부모의 primary model뿐이다. 다른 worker 모델을 자동으로 합치는지는 원문에 명시 없고, visualize는 snapshot을 몰래 합치지 않는다고 한다.[](source:vis-in) `deep-security-scan/SKILL.md`의 완료 줄은 `report.md`와 canonical artifacts 링크만 말하고 위협 모델 보존은 말하지 않는다.[](source:deep-14) | model-to-explorer | m-deep |
| m-doc | threatmodel.md | 이 파일은 두 종류다. 단독 `threat-model`이 저장하는 공유 파일과, scan 안에서 host가 렌더링하는 `<scan_dir>/threatmodel.md`다. 이름은 같지만 끝부분 형식이 다르다(아래 표). visualize의 view-model 문서가 같은 파일을 `threat-model.md`로 예시하는데 이는 로컬 파일명 표기다.[](source:vm-in)[](source:render-ts) | model-to-explorer | m-doc |
| m-viz | threat-model-visualize | 에이전트는 이 파일을 `--assessment <threat-model.md>`로 `build_explorer.py`에 넘긴다. 새 assessment는 하지 않으므로 파일에 없는 토폴로지나 통제를 채우지 않는다. 최신 artifact가 없으면 오래된 것을 쓰기 전에 알린다.[](source:vis-4)[](source:vis-in) | model-to-explorer | m-viz |

그림은 네 생산자가 같은 `threatmodel.md` 이름으로 모이는 모양만 보여 준다. 생략한 것은 두 가지다. 위협 모델을 `references/threat-model.md`가 어떻게 만들게 하는지는 `threat-model` 패널에 적었다. scan 스킬이 `threat-model`을 부르는 위임(R06)과 Standard가 단계 스킬을 부르지 않는 점(R14)은 아래 생략 표에 있다.

| rel-id · 종류 | 방향과 조건 | 그림 반영 |
|---|---|---|
| R42 · 산출물 호환 | `threat-model`에서 `threat-model-visualize`로 간다. visualize의 기본 입력은 "the existing threat-model artifact"이고 `--assessment <threat-model.md>`로 넘긴다. `threat-model`은 단독 요청에서 `threatmodel.md`를 저장한다. 필수 순서는 아니다.[](source:vis-in)[](source:vm-in)[](source:tm-ret) | 실선 `단독 저장`과 `읽기` |
| R43 · 산출물 호환 | `security-scan`에서 `threat-model-visualize`로 간다. 마지막 scan의 모델은 요청 한 문장으로 충분하고, 최신 artifact가 없으면 오래된 것을 쓰기 전에 알린다. 새 scan은 돌리지 않는다. 두 스킬이 이어지는 근거는 `scan-artifacts.md`와 host 구현이다.[](source:vis-in)[](source:scan-res-7)[](source:sa-paths)[](source:doc-ts) | 실선 `host 렌더링`과 `읽기` |
| R71 · 산출물 호환 | `security-diff-scan`에서 `threat-model-visualize`로 간다. diff scan도 모델을 `scan.threatModel`로 저장하고 host가 `threatmodel.md`를 렌더링한다. visualize 쪽에 diff scan만 가리키는 문장은 없다.[](source:diff-28)[](source:doc-ts)[](source:vis-in) | 실선 `host 렌더링`과 `읽기` |
| R72 · 산출물 호환 | `deep-security-scan`에서 `threat-model-visualize`로 간다. host가 primary model에서 `threatmodel.md`를 만들고, 다른 worker 모델을 자동으로 합치는지는 원문에 명시 없다.[](source:sc-173)[](source:vis-in)[](source:deep-14) | 실선 `primary 모델`과 `읽기` |

R42의 두 파일은 같은 이름이지만 같은 형식이 아니다. 아래 표는 둘을 맞춰 본 것이다.

| 항목 | 단독 `threat-model`이 저장하는 공유 파일 | scan 안 `<scan_dir>/threatmodel.md` |
| --- | --- | --- |
| 누가 쓰나 | `threat-model`이 `targetPath` 기준으로 저장한다. 보조 파일 저장 도구는 scan ID가 없을 때만 이 파일을 쓰게 한다.[](source:st-cache)[](source:stor-ts) | host가 canonical 모델에서 렌더링한다. scan ID가 있으면 보조 파일 저장 도구로는 읽기만 된다.[](source:doc-ts)[](source:st-path)[](source:stor-ts) |
| 끝부분 | 정확한 `Repository: ...`와 `Version: ...` 두 줄로 끝난다. 공유 모델을 쓸 때만 붙인다.[](source:st-cache)[](source:tm-ret) | 본문 뒤에 `---`와 `## Saved Model Context` footer(Source, Scan, Target, Revision, Snapshot, Result status, Model origin, 모델·scan 범위)가 붙는다. `Repository:`·`Version:` 줄은 쓰지 않는다.[](source:render-fields)[](source:render-ts) {caution:형식이 다름} |
| 완료 전 표시 | 원문에 명시 없음. | scan이 `complete`가 되기 전에는 "This is a provisional model saved before successful completion." 문구가 붙는다.[](source:render-ts)[](source:doc-ts) |
| 캐시 재사용 | `Repository`와 `Version` 줄이 대상과 현재 revision 또는 snapshot digest에 맞고 사용자가 교체를 요청하지 않았을 때만 재사용한다.[](source:tm-select)[](source:st-cache) | 공급된 모델, 비어 있지 않은 `userContext`, 권위 있는 knowledge base, 더 좁은 범위가 있는 scan은 공유 cache를 읽거나 바꾸지 않는다. scan 모델을 저장하거나 내보내도 공유 cache를 갱신할 권한이 생기지 않는다.[](source:tm-select)[](source:tm-ret) |

판정: scan 안 `threatmodel.md`는 `Repository`·`Version` 줄로 끝나지 않으므로 공유 cache의 재사용 조건과 같은 형식이 아니다. 근거는 렌더러의 footer 필드와 스킬이 정한 cache 조건이다.[](source:render-ts)[](source:st-cache)[](source:tm-select)

## `SECURITY.md`는 누가 쓰고 누가 읽나? {#policy-state span=12}

`SECURITY.md`는 선후 관계가 없는 공유 상태다. `define-security-policy`가 쓰고, 읽는 스킬은 각자 검토하는 경로마다 정책을 찾아 쓴다. 읽는 일은 스킬이 직접 파일을 여는 것이 아니라 셸 launcher의 `--helper resolve-security-md`를 거친다.[](source:sp-8)[](source:launcher)[](source:helpers-main)

| 파일 | 쓰는 스킬 | 읽는 스킬 | 관계와 조건 |
| --- | --- | --- | --- |
| `SECURITY.md`(루트와 `<component>/SECURITY.md`) {#sec-discovery} | `define-security-policy` | `finding-discovery` | R44 · 공유 상태. 검토하는 경로마다 해당 정책을 찾아 쓴다. 선후 관계는 없다.[](source:sp-8)[](source:fd-8) |
| `SECURITY.md` {#sec-threat-model} | `define-security-policy` | `threat-model` | R45 · 공유 상태. 해석된 `SECURITY.md`가 필요한 경계를 담고 있으면 위협 모델을 대신할 수 있다.[](source:tm-select) |
| `SECURITY.md` {#sec-triage} | `define-security-policy` | `triage-finding` | R46 · 공유 상태. 코드를 따라가기 전에 영향받는 파일마다 루트와 범위 정책을 검토한다. 정책은 "the primary local definition"이지만 코드 근거가 claim을 받쳐야 한다.[](source:tf-39) |
| `SECURITY.md` {#sec-diff} | `define-security-policy` | `security-diff-scan` | R47 · 공유 상태. "Apply relevant `SECURITY.md` guidance". 선후 관계는 없다.[](source:diff-16)[](source:run-5) |
| `SECURITY.md` {#sec-scan} | `define-security-policy` | `security-scan`과 Deep worker | R73 · 공유 상태. 시작 scope와 더 깊은 디렉터리마다 상속된 정책을 해석하고 report 가능 여부에도 아키텍처에도 적용한다. 명시적인 사용자 제외가 여전히 범위를 정한다.[](source:core-26)[](source:scan-10)[](source:deep-tpl) |
| `artifacts/01_context/security_guidance.md`(선택) | 에이전트가 helper 출력을 `save_codex_security_artifact`로 저장 | 원문에 읽는 스킬 명시 없음 | 필요할 때만 저장한다. helper에는 영속 artifact 경로를 넘기지 않는다.[](source:sg-save)[](source:sa-paths) |
| 공유 `threatmodel.md`(단독) | `threat-model` | `threat-model`, `threat-model-visualize` | cache 조건이 맞으면 `threat-model`이 재사용하고 visualize가 입력으로 읽는다. 위 패널의 R42.[](source:tm-select)[](source:vis-in) |
| `<scan_dir>/threatmodel.md`와 `scan.threatModel` | host(`threat-model`이 텍스트를 돌려주고 scan 스킬이 draft로 저장) | `threat-model-visualize`와 이후 scan 단계 | 이후 단계는 retained canonical 내용이나 이 projection을 쓴다. 위 패널의 R43, R71, R72.[](source:sa-paths)[](source:vis-in) |
| `source-inventory.md`, `correctness-review.md`, model JSON, `explorer.html` | `threat-model-visualize`와 그 리뷰어 | 같은 스킬의 다음 절 | 다른 스킬이 읽는다는 문장은 원문에 명시 없음.[](source:vis-1)[](source:vis-3)[](source:vis-4) |

정책 해석의 규칙은 아래 값으로 모았다. 스킬 본문과 resolver 구현을 맞춰 본 것이다.

@facts id=policy-chain-facts
| 해석 순서 | scan root에서 대상 디렉터리까지 비어 있지 않은 `SECURITY.md`를 root-to-leaf로 이어 붙인다. 충돌하면 대상에 가장 가까운 정책이 우선한다.[](source:sg-chain)[](source:sp-1) |
| 적용 범위 | `SECURITY.md`는 그 파일이 든 디렉터리와 모든 하위 디렉터리에 적용된다.[](source:sg-chain) |
| 정책이 못 하는 일 | 사용자·시스템 지시를 덮거나 명령 실행, secret 접근, 파일 편집, workflow 변경을 할 수 없다.[](source:sg-trust) |
| 충돌 해소 | resolver는 이어 붙이기만 한다. 우선순위는 `security-guidance.md`가 문서로 정한다.[](source:res-scope)[](source:sg-chain) |
| 쓰이지 않는 경로 | `.github/SECURITY.md`와 `docs/SECURITY.md`를 저장소 전체 scanner 지침으로 보지 말라는 문장은 `define-security-policy`에만 있다. resolver 구현은 이 경로를 특별 취급하지 않고 이름이 `SECURITY.md`인 파일을 그 디렉터리 이하의 정책으로 다룬다.[](source:sp-1)[](source:res-list)[](source:res-scope) |

resolver가 정책 파일에서 멈추는 조건은 `--scope`와 `--list`가 다르다.

| 상황 | `--scope`로 정책 chain 해석 | `--list`로 목록 출력 |
| --- | --- | --- |
| 공백뿐인 `SECURITY.md` | chain에서 뺀다.[](source:res-scope) | 검증하지 않고 나열한다.[](source:res-list) |
| repo 밖을 가리키는 symlink | scope 해석 전체가 오류로 멈추고 종료 코드 2를 낸다. 출력은 쓰이지 않는다.[](source:res-scope)[](source:res-inside)[](source:res-cmd) | symlink 대상은 검증하지 않고 나열한다. 디렉터리를 가리키는 symlink만 정책으로 치지 않는다.[](source:res-list) |
| UTF-8이 아닌 파일 | 같은 방식으로 종료 코드 2의 오류다.[](source:res-read)[](source:res-cmd) | 검증하지 않는다.[](source:res-list) |
| 인자 조합 | `--scope`도 `--list`도 없으면 오류다.[](source:res-cmd) | `--list`와 `--scope`를 함께 주면 오류다.[](source:res-cmd) |

@callout level=warning title="정책은 권한이 아니라 분석 데이터다"
| `SECURITY.md`는 scan이 무엇을 finding으로 볼지 알려 주지만 사용자·시스템 지시를 덮거나 scan workflow를 바꿀 수 없다.[](source:sg-trust) |
| 예시나 fixture의 경계가 정책에 있으면 포함 제품의 disclosure 자격이 아니라 synthetic impact로 평가한다.[](source:core-26) |

## 그림에서 뺀 관계는 무엇인가? {#omitted-relations span=12}

아래 관계는 위 그림과 표에 넣지 않았다. 다른 묶음의 그림에 있거나, 안내 성격이라 순서를 그릴 수 없다. 원장의 종류와 조건을 그대로 적었다. 이 표의 모든 행은 그림에서 생략했다.

| rel-id · 종류 | 방향과 조건 | 그림 반영 |
|---|---|---|
| R06 · 내부 위임 | `security-diff-scan`에서 `threat-model`로 간다. "Run `$threat-model` once, or use the supplied model". 한 번만 실행하고 사용자가 모델을 주면 그것을 쓴다. 모델은 저장소 전체가 기본이고 사용자가 좁히라고 할 때만 좁힌다. 끝나면 diff scan이 `complete: false` 초안을 저장하고 host가 `threatmodel.md`를 렌더링한다.[](source:diff-28)[](source:tm-ret)[](source:tmref-contract)[](source:doc-ts) | 생략(`scan-vulnerabilities` 묶음 그림에 있음) |
| R10 · 산출물 호환 | `threat-model`에서 `finding-discovery`로 간다. discovery는 "the threat model and applicable security policy"를 근거로 쓴다. 이 순서를 강제하는 곳은 diff scan뿐이다. 단독 호출에서 위협 모델 없이 discovery를 돌려도 되는지는 원문에 명시 없음.[](source:fd-8)[](source:tm-ret) | 생략 |
| R13 · 산출물 호환 | `threat-model`에서 `attack-path-analysis`로 간다. scan 단계에서는 per-scan 위협 모델과 후보 집합을 쓴다. 단독 분석에서는 위협 모델이나 보안 정책이 있으면 쓰고 per-scan 산출물은 필요 없다.[](source:ap-12)[](source:tm-ret) | 생략 |
| R14 · 참고 | `threat-model`에서 `security-scan`으로 간다. Standard scan과 Deep worker는 위협 모델을 자기 workflow 안에서 만들고 이 단계 스킬을 부르지 않는다. `core-scan.md`가 `threat-model.md`를 읽게 하므로 두 쪽이 같은 참조 문서를 공유한다.[](source:tm-intro)[](source:tm-select)[](source:scan-10)[](source:core-11) | 생략 |
| R48 · 참고 | `define-security-policy`에서 `threat-model`로 간다. 정책을 쓸 때 경계를 확인하려고 "threat models, and validated findings"를 읽을 수 있다. 스킬 이름으로 지목하지 않는다. 방향은 근거 문장의 주체(정책 작성)를 따른다.[](source:sp-2)[](source:tm-ret) | 생략 |
| R60 · 참고 | 여러 스킬(이 묶음에서는 `threat-model`)이 파일을 만들거나 보관하기 전에 `artifact-storage.md`를 읽고 storage policy를 따르라고 한다. `threat-model`은 저장소·cache 소유 규칙을 이 파일에서 읽는다.[](source:tm-intro)[](source:st-path)[](source:st-cache) | 생략 |
| R61 · 참고 | 여러 스킬(이 묶음에서는 `define-security-policy`, `threat-model`)이 정책 해석을 `security-guidance.md` 기준으로 한다. helper는 MCP 도구가 아니라 셸 launcher의 `--helper` 분기로 실행한다. 긴 옵션은 줄여 쓸 수 없다.[](source:sp-1)[](source:tm-select)[](source:sg-save)[](source:launcher) | 생략 |
| R69 · 참고(범위 밖) | `threat-model-visualize`에서 SKILL.md가 가리키는 "Sites workflow", "visualize integration", `spawn_agent`의 `fork_turns` 옵션으로 간다. 사이트 호스팅은 사용자가 명시적으로 요청할 때만 하고, 새 맥락 리뷰어는 `spawn_agent`로 띄우라고 한다. 이 플러그인 트리에는 그 문서와 도구 정의가 없다.[](source:vis-3)[](source:vis-deliv) | 생략(정의가 이 트리에 없음) |
| R70 · 참고 | `threat-model`에서 `references/threat-model.md`로 간다. 위협 모델을 만들거나 고칠 때 따른다. 모델은 읽기 전용·오프라인으로 만들고 supplied model, knowledge base, 정책을 허가로 취급하지 않는다. 복잡한 경계에는 독립 architecture reviewer를 쓸 수 있고 위임이 불가할 때 하라는 절은 이 문서에 없다. 생성한 `threatModel`은 `complete: false` 초안에 즉시 저장한다.[](source:tm-select)[](source:tmref-rule)[](source:tmref-rev)[](source:tmref-contract) | 생략 |

## 이 묶음에 안내 역할 스킬이 있나? {#guide-role span=12}

없다. 세 스킬은 모두 단계 역할이고, 스킬 여러 개를 나열만 하는 허브 스킬은 이 묶음에 없다. 벤더의 `skills/README.md`는 세 스킬을 "Security policy and threat models" 항목에 나란히 소개한다. 이 항목은 사용자가 고르기 위한 목록이고 스킬끼리의 호출 관계를 정하지 않는다.[](source:readme-sp)

| 스킬 | README의 소개 요지 |
| --- | --- |
| `define-security-policy` | repo 루트나 component 폴더의 `SECURITY.md`를 쓰거나 고쳐 이후 review의 규칙(무엇이 finding이고 무엇이 범위 밖인지)을 정한다.[](source:readme-sp) |
| `threat-model` | 현재 코드가 무엇을 보호하고 공격자가 어디로 들어올 수 있는지 그린다. scan 출력 폴더나 단독 실행 시 plugin artifact storage에서 `threatmodel.md`를 찾으라고 한다.[](source:readme-sp) |
| `threat-model-visualize` | 이미 있는 모델을 탐색할 수 있는 그림으로 바꾼다.[](source:readme-sp) |

## 어디까지 읽고 확인했나? {#audit span=12}

| 구분 | 확인 범위 |
| --- | --- |
| 스킬 폴더 원본 | `threat-model`, `define-security-policy`, `threat-model-visualize`의 `SKILL.md`와 `agents/openai.yaml`을 끝까지 읽었다. `references/view-model.md`는 1~9줄만 읽었다. |
| 부분만 읽은 것 | `threat-model-visualize`의 `references/context-explorer.md`, `scripts/build_explorer.py`, `assets/`, `tests/`는 이 페이지에서 열지 않았다. 스킬 페이지도 이 파일들을 일부만 읽었다. |
| 플러그인 참조 | `references/security-guidance.md`는 7·34·36줄, `references/threat-model.md`는 3·16~28·38~55줄, `artifact-storage.md`는 37·47~55줄, `scan-artifacts.md`는 26~29줄, `scan-contract.md`는 173줄, `core-scan.md`는 11·26줄, `scan-runtime.md`는 5줄만 인용했다. |
| 구현 | `threat-model-document.ts` 33~75줄, `threat-model-render.ts` 18~25·138~168줄, `artifact-storage.ts` 148~173줄, `resolve-security-md.ts` 178~190·263~437줄, `helpers-main.ts`와 `launch_codex_security_mcp`의 helper 분기 줄을 읽었다. native 소스는 읽지 않았다. |
| 상대 스킬 | `security-diff-scan` 16·28줄, `security-scan` 10줄과 `scan-results.md` 7줄, `deep-security-scan` 14줄, `deep-scan/discovery.md` 7줄, `finding-discovery` 8~10줄, `triage-finding` 39~48줄, `attack-path-analysis` 12~14줄, `skills/README.md` 16~20줄만 읽었다. |
| 제외 | 번역본과 바이너리는 열지 않았다. 어떤 스크립트나 도구도 실행하지 않았고 외부 URL을 열지 않았다. 대상 스킬 안의 지시(CLI 실행, 파일 저장, 브라우저 열기, 사이트 호스팅)는 분석할 자료로만 읽었다. |

@callout level=open-question title="확인하지 못했거나 원문에 명시가 없는 부분"
| `threat-model-visualize`의 renderer assets, `build_explorer.py`, `context-explorer.md`, 테스트는 이 페이지에서 읽지 않아 부분 분석이다. |
| 공유 cache의 `Repository`·`Version` 일치를 비교하는 코드는 `mcp-app/src`와 `scripts/`에서 grep으로 찾지 못했다. 스킬 본문 지시로만 확인했다(R42). |
| `threat-model-document.ts`는 scan layout이 아니면 `result.json`의 `threatModel`로도 `threatmodel.md`를 쓰는 분기가 있다. 원장 R42는 단독 요청의 저장을 스킬이 artifact 도구로 하는 것으로만 적었고, 두 서술이 어떻게 맞물리는지는 원문에 명시 없음.[](source:doc-ts)[](source:tm-ret) |
| `threat-model`이 위임 불가일 때 "sequential fallback"이 정확히 무엇인지는 원문에 명시 없음. `threat-model.md`에 그 이름의 절이 없다(R70).[](source:tm-select)[](source:tmref-rev) |
| 단독 호출에서 위협 모델 없이 `finding-discovery`를 돌려도 되는지는 원문에 명시 없음(R10).[](source:fd-8) |
| Sites workflow, visualize integration 문서, `spawn_agent` 도구 정의는 이 트리에 없다(R69, 범위 밖).[](source:vis-3)[](source:vis-deliv) |
| host 쪽 동작(`threatmodel.md` 렌더링, resolver)은 구현 줄을 읽고 지시상 동작으로 서술했다. 실행하지 않았다.[](source:doc-ts)[](source:res-cmd) |

자동 검증은 HTML 구조와 출처 해석만 확인한다. 사람 검토는 미실시다.
