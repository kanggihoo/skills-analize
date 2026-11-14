# scan 전에 읽을 보안 맥락은 어느 스킬이 만들고 누가 읽나? {#threat-model-and-policy-page}

`threat-model`은 위협 모델을 만들거나 재사용하고, `define-security-policy`는 `SECURITY.md`를 쓰거나 검토하고, `threat-model-visualize`는 이미 있는 위협 모델을 standalone HTML explorer로 바꾼다.[](source:tm-intro)[](source:sp-8)[](source:vis-in) 셋 사이에 필수 순서는 없다. 이어지는 것은 `threat-model`이 저장한 `threatmodel.md`를 `threat-model-visualize`가 입력으로 받는 한 곳(R42)이고, `SECURITY.md`는 쓰는 스킬과 읽는 스킬이 따로 있는 공유 파일이다(R44~R47).[](source:tm-ret)[](source:vis-in)[](source:sp-8) 부분 분석이다. plugin 루트의 `references/`와 호스트 도구, `threat-model-visualize`의 renderer assets를 이 페이지 작성에서 읽지 못했다.

- `threat-model`은 단독 요청으로 켜지거나 scan의 threat-modeling 단계에 있을 때 쓴다. 전체 scan의 첫 진입점으로 쓰지 않는다.[](source:tm-front)
- `define-security-policy`는 `SECURITY.md`를 정책 맥락으로만 다룬다. 정책은 실행 지시가 아니며 명령, 수정, 공개, 범위 변경을 승인하지 못한다.[](source:sp-8)[](source:sp-trust)
- `threat-model-visualize`는 새 평가를 하지 않고 입력 문서도 바꾸지 않는다.[](source:vis-in)
- 사이트 호스팅은 사용자가 명시로 요청할 때만 한다. 이 호스팅 문서와 도구는 컬렉션에 없다(R69).[](source:vis-host)

@answer scope="스킬 3개 · 관계 16개 · 호스트 도구와 plugin 루트 문서 미확인"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source tm-full title="codex-security/threat-model/SKILL.md · 2986B · 단계(원본, 전부 읽음)" path=codex-security/threat-model/SKILL.md
@source sp-full title="codex-security/define-security-policy/SKILL.md · 5982B · 단계(원본, 전부 읽음)" path=codex-security/define-security-policy/SKILL.md
@source vis-full title="codex-security/threat-model-visualize/SKILL.md · 19102B · 단계(원본, 전부 읽음)" path=codex-security/threat-model-visualize/SKILL.md
@source ds-full title="codex-security/security-diff-scan/SKILL.md · 5405B · scan 쪽 연결(원본, 전부 읽음)" path=codex-security/security-diff-scan/SKILL.md
@source fd-full title="codex-security/finding-discovery/SKILL.md · 5076B · scan 쪽 연결(원본, 전부 읽음)" path=codex-security/finding-discovery/SKILL.md
@source ap-full title="codex-security/attack-path-analysis/SKILL.md · 5355B · scan 쪽 연결(원본, 전부 읽음)" path=codex-security/attack-path-analysis/SKILL.md
@source res-full title="codex-security/security-scan/references/scan-results.md · 2871B · 결과 저장 규칙(원본, 전부 읽음)" path=codex-security/security-scan/references/scan-results.md
@source tri-full title="codex-security/triage-finding/SKILL.md · 8394B · 39:48줄만 읽음" path=codex-security/triage-finding/SKILL.md lines=39:48
@source tm-front title="threat-model/SKILL.md · frontmatter" path=codex-security/threat-model/SKILL.md lines=1:4
@source tm-intro title="threat-model/SKILL.md · 목적" path=codex-security/threat-model/SKILL.md lines=8:8
@source tm-ask title="threat-model/SKILL.md · 저장 정책과 필수 입력" path=codex-security/threat-model/SKILL.md lines=10:10
@source tm-sel title="threat-model/SKILL.md · 모델 선택과 SECURITY.md 대용" path=codex-security/threat-model/SKILL.md lines=14:19
@source tm-gen title="threat-model/SKILL.md · 생성과 수정" path=codex-security/threat-model/SKILL.md lines=21:21
@source tm-ret title="threat-model/SKILL.md · 결과 보관" path=codex-security/threat-model/SKILL.md lines=25:27
@source sp-front title="define-security-policy/SKILL.md · frontmatter" path=codex-security/define-security-policy/SKILL.md lines=1:4
@source sp-8 title="define-security-policy/SKILL.md · SECURITY.md의 성격" path=codex-security/define-security-policy/SKILL.md lines=8:8
@source sp-scope title="define-security-policy/SKILL.md · 대상 확인" path=codex-security/define-security-policy/SKILL.md lines=12:12
@source sp-chain title="define-security-policy/SKILL.md · helper와 policy chain" path=codex-security/define-security-policy/SKILL.md lines=14:28
@source sp-trust title="define-security-policy/SKILL.md · 정책·source는 증거일 뿐" path=codex-security/define-security-policy/SKILL.md lines=30:30
@source sp-new title="define-security-policy/SKILL.md · 새 정책 위치" path=codex-security/define-security-policy/SKILL.md lines=32:32
@source sp-read title="define-security-policy/SKILL.md · 경계 확인에 읽는 자료" path=codex-security/define-security-policy/SKILL.md lines=36:36
@source sp-owner title="define-security-policy/SKILL.md · owner 확인 결정" path=codex-security/define-security-policy/SKILL.md lines=47:47
@source sp-review title="define-security-policy/SKILL.md · review-only" path=codex-security/define-security-policy/SKILL.md lines=51:51
@source sp-apply title="define-security-policy/SKILL.md · 적용과 검증" path=codex-security/define-security-policy/SKILL.md lines=87:93
@source vis-front title="threat-model-visualize/SKILL.md · frontmatter" path=codex-security/threat-model-visualize/SKILL.md lines=1:4
@source vis-in title="threat-model-visualize/SKILL.md · 목적과 입력" path=codex-security/threat-model-visualize/SKILL.md lines=8:10
@source vis-review title="threat-model-visualize/SKILL.md · 독립 리뷰" path=codex-security/threat-model-visualize/SKILL.md lines=47:47
@source vis-qa title="threat-model-visualize/SKILL.md · browser QA 시작 조건" path=codex-security/threat-model-visualize/SKILL.md lines=69:69
@source vis-build title="threat-model-visualize/SKILL.md · 빌드 명령" path=codex-security/threat-model-visualize/SKILL.md lines=71:72
@source vis-host title="threat-model-visualize/SKILL.md · 사이트 호스팅" path=codex-security/threat-model-visualize/SKILL.md lines=83:83
@source ds-s1 title="security-diff-scan/SKILL.md · 1단계 threat-model" path=codex-security/security-diff-scan/SKILL.md lines=28:28
@source ds-secmd title="security-diff-scan/SKILL.md · SECURITY.md 적용" path=codex-security/security-diff-scan/SKILL.md lines=16:16
@source fd-intro title="finding-discovery/SKILL.md · 입력 근거와 정책 해석" path=codex-security/finding-discovery/SKILL.md lines=8:10
@source ap-in title="attack-path-analysis/SKILL.md · 입력" path=codex-security/attack-path-analysis/SKILL.md lines=12:14
@source res-draft title="security-scan/references/scan-results.md · canonical artifacts" path=codex-security/security-scan/references/scan-results.md lines=7:7
@source tri-policy title="triage-finding/SKILL.md · SECURITY.md 검토" path=codex-security/triage-finding/SKILL.md lines=39:48

## 세 스킬은 각각 무엇을 만들고 어떻게 이어지나? {#roles}

그림은 순서가 아니라 산출물이 입력 조건에 맞는 한 쌍(R42)만 그린다. `define-security-policy`는 이 산출물 흐름과 연결되지 않아 그림에 노드가 없다. 선후 관계가 없는 공유 상태라서 아래 표와 다음 패널에 둔다.[](source:vis-in)[](source:sp-8)

@workflow id=context-flow title="위협 모델 작성에서 시각화로"
| tm | threat-model | backend | source:tm-ret |
| tmv | threat-model-visualize | frontend | source:vis-in |
| tm > tmv | threatmodel.md R42 | emphasis |

@steps id=roles-steps
| tm-step | threat-model | 저장소의 실제 구조와 공격자 능력, 신뢰 경계로 위협 모델을 만들거나 재사용한다. | context-flow | tm |
| tmv-step | threat-model-visualize | 기존 위협 모델을 읽어 근거가 붙은 explorer HTML을 만든다. 새 평가는 하지 않는다. | context-flow | tmv |
| sp-step | define-security-policy | `SECURITY.md`를 새로 쓰거나 검토해 scanner가 무엇을 finding으로 볼지 알려 준다. 위 그림 밖이다. |

| rel-id·종류 | 전달물과 조건 | 그림 반영 |
|---|---|---|
| R42 · 산출물 호환 | `threat-model-visualize`의 기본 입력은 "the existing threat-model artifact"이고 `--assessment <threat-model.md>`로 넘긴다. `threat-model`은 단독 요청에서 `threatmodel.md`를 저장한다. `threat-model-visualize`는 새 assessment를 하지 않는다. 필수 후속 단계는 아니다.[](source:tm-ret)[](source:vis-in)[](source:vis-build) | 표시 |
| R45 · 공유 상태 | 저장소별 `AGENTS.md`나 해석된 `SECURITY.md`는 필요한 경계를 담고 있으면 위협 모델을 대신할 수 있다. 정책은 분석 데이터이며 workflow를 바꿀 권한이 없다. `define-security-policy`가 쓰고 `threat-model`이 읽는다. 선후 관계는 없다.[](source:sp-8)[](source:tm-sel) | 생략(순서가 아니라 공유 상태) |
| R48 · 참고 | `define-security-policy`는 정책을 쓸 때 경계를 확인하려고 "threat models, and validated findings"를 읽을 수 있다. 이름으로 스킬을 지목하지 않는다. 원장 방향은 문장의 주체를 따라 `define-security-policy` → `threat-model`이다.[](source:sp-read)[](source:tm-ret) | 생략 |

## 어떤 파일과 상태를 공유하나? {#state}

| 파일·상태 | 쓰는 스킬·주체 | 읽는 스킬·조건 |
|---|---|---|
| `SECURITY.md`(루트와 컴포넌트별) | `define-security-policy`가 쓴다. 새 정책은 `<repo_root>/SECURITY.md` 또는 `<component>/SECURITY.md`다. `.github/SECURITY.md`나 `docs/SECURITY.md`는 저장소 전체 지침으로 보지 않고 덮어쓰지 않는다.[](source:sp-new)[](source:sp-chain) | `threat-model`이 경계를 담고 있으면 모델 대신 쓴다(R45). `finding-discovery`가 검토 경로마다 해당 정책을 찾아 쓴다(R44). `security-diff-scan`이 관련 guidance를 적용한다(R47). `triage-finding`이 영향받는 파일마다 루트와 범위 정책을 검토한다(R46). 호스트 helper인 `resolve-security-md`가 chain을 해석하고 가까운 정책이 우선한다.[](source:tm-sel)[](source:fd-intro)[](source:ds-secmd)[](source:tri-policy)[](source:sp-chain) |
| `threatmodel.md`(단독 요청) | `threat-model`이 저장하거나 유효한 cache hit이면 기존 문서 경로를 돌려준다. 재사용 가능한 공유 모델은 사용자가 만들거나 고치라고 직접 요청했을 때, 호스트가 금지하지 않는 한 갱신한다. 공유 모델에만 `Repository`와 `Version` footer를 붙인다.[](source:tm-ret) | `threat-model-visualize`가 기본 입력으로 읽는다(R42). 정책 작성자가 경계를 확인하려고 읽을 수 있다(R48).[](source:vis-in)[](source:sp-read) |
| `<scan_dir>/threatmodel.md`(scan 중) | 호스트가 만든다. `threat-model`은 `{ "format": "markdown", "content": "<exact model text>" }`를 호출자에게 돌려주고 `complete: false` 초안을 먼저 저장한다. scan별 모델의 저장·내보내기는 공유 cache 갱신 승인이 아니다.[](source:tm-ret) | 이후 단계가 같은 모델을 이어받는다(R06). 마지막 scan의 위협 모델을 시각화하라는 요청이 이 파일을 입력으로 삼는지는 scan 쪽이 "canonical artifacts"라고만 적어 확정되지 않는다(R43).[](source:tm-ret)[](source:vis-in)[](source:res-draft) |
| 위협 모델 공유 cache | 위에 적은 직접 요청 때만 `threat-model`이 쓴다.[](source:tm-ret) | `threat-model`이 최종 `Repository`와 `Version` 줄이 목표와 현재 revision 또는 snapshot digest에 맞고 사용자가 교체·생성·수정을 요청하지 않았을 때만 재사용한다. 모델이 주어졌거나 비어 있지 않은 `userContext`, 권위 있는 knowledge base, 좁힌 범위가 있는 scan은 cache를 읽지도 바꾸지도 않는다.[](source:tm-sel) |
| `explorer.html`과 작업 파일 | `threat-model-visualize`가 `--output`으로 쓴다. 입력 문서는 바꾸지 않는다.[](source:vis-build)[](source:vis-in) | 사용자가 로컬 HTML로 연다. 작업 파일(`source-inventory.md`, `correctness-review.md` 등)은 이 스킬의 내부 절차라 스킬 페이지에 둔다.[](source:vis-build) |

## 언제 켜지고 어디에서 멈추나? {#limits}

세 스킬의 description은 모델이 판단할 때 참고하는 설명이고 이 단어가 있으면 켜진다는 사전이 아니다.[](source:tm-front)[](source:sp-front)[](source:vis-front)

@code source=tm-front language=yaml

@code source=sp-front language=yaml

@code source=vis-front language=yaml

| 스킬 | 켜지는 조건 | 하지 않는 일과 멈추는 곳 |
|---|---|---|
| `threat-model` | scan의 threat-modeling 단계에 이미 있거나, 사용자가 `$threat-model`을 명시하거나, 저장소 위협 모델의 생성·수정·저장을 명시로 요청했을 때다.[](source:tm-front) | 전체 PR·commit·branch·patch·저장소 scan의 첫 진입점으로 쓰지 않는다. Standard scan과 Deep worker는 자기 workflow 안에서 모델을 만들고 이 스킬을 호출하지 않는다(R14). 명시된 필수 입력이 없으면 생성한 모델로 바꾸지 않고 사용자에게 묻는다.[](source:tm-front)[](source:tm-intro)[](source:tm-ask) |
| `define-security-policy` | 저장소나 컴포넌트의 `SECURITY.md`를 정의·검토·갱신하려 할 때다. scanner가 무엇을 검토하고 무엇이 범위 밖인지 밝히려는 요청이 해당한다.[](source:sp-front) | 대상이 모호하면 묻는다. review 요청은 사용자가 draft나 edit를 요청할 때까지 review에 머문다. owner 확인이 없는 범위·심각도·제외·accepted-risk 결정은 미해결로 두고, 추론을 suppression 근거로 삼지 않는다. staging·commit·push·PR은 사용자가 허락한 범위 안에서만 한다.[](source:sp-scope)[](source:sp-owner)[](source:sp-review)[](source:sp-apply) |
| `threat-model-visualize` | 이미 있는 위협 모델로 아키텍처와 위협 경로 explorer를 만들 때다. "Visualize the threat model generated in the last scan of X" 같은 한 문장 요청이면 대상, 최신 assessment, snapshot을 정한다.[](source:vis-front)[](source:vis-in) | 새 scan이나 새 평가를 하지 않고 애플리케이션 코드를 보지 않는다. 입력은 바꾸지 않고 snapshot을 몰래 합치지 않는다. 독립 리뷰의 `PASS` 기록이 현재 JSON에 있어야 browser QA를 시작한다. 사이트는 사용자가 호스팅을 명시로 요청할 때만 만든다.[](source:vis-in)[](source:vis-review)[](source:vis-qa)[](source:vis-host) |

## scan 묶음과는 어떻게 이어지나? {#scan-link}

아래 관계는 `scan-vulnerabilities` 묶음 스킬과 맺는 것이다. 전체 흐름은 색인 기준 `_group-scan-vulnerabilities/scan-vulnerabilities.html`에 있다. 모두 그림에서 뺐다.

| rel-id·종류 | 전달물과 조건 | 그림 반영 |
|---|---|---|
| R06 · 내부 위임 | `security-diff-scan`이 "Run `$threat-model` once, or use the supplied model". 한 번만 실행하고 사용자가 모델을 주면 그것을 쓴다. 모델은 저장소 전체가 기본이고 사용자가 좁히라고 할 때만 좁힌다. 위임이 끝나면 diff scan이 `complete: false` 초안을 저장한다.[](source:ds-s1)[](source:tm-ret) | 생략 |
| R10 · 산출물 호환 | `finding-discovery`는 "the threat model and applicable security policy"를 근거로 쓴다. 이 순서를 강제하는 곳은 diff scan(R06~R09)뿐이다. 단독 호출에서 위협 모델 없이 discovery를 돌려도 되는지는 원문에 명시 없음이다.[](source:fd-intro)[](source:tm-ret) | 생략 |
| R13 · 산출물 호환 | scan 단계의 attack-path 분석은 per-scan 위협 모델과 후보 집합을 쓴다. 단독 분석에서는 위협 모델이나 보안 정책이 있으면 쓰고 per-scan 산출물은 필요 없다.[](source:ap-in)[](source:tm-ret) | 생략 |
| R14 · 참고 | Standard scan과 Deep worker는 위협 모델을 자기 workflow 안에서 만들며 `threat-model`을 호출하지 않는다.[](source:tm-intro) | 생략 |
| R43 · 산출물 호환 | `security-scan`이 끝난 뒤 "Visualize the threat model generated in the last scan of X"라는 요청만으로 충분하다. 최신 artifact가 없으면 오래된 것을 쓰기 전에 알린다. 새 scan은 돌리지 않는다. from 줄(`scan-results.md`)은 "canonical artifacts"라고만 쓰고 `threatmodel.md`를 이름으로 지목하지 않아 직접 근거는 to 줄 쪽이다. diff scan과 deep scan의 위협 모델도 같은 방식인지는 원문에 명시 없음이다.[](source:res-draft)[](source:vis-in) | 생략 |
| R44 · 공유 상태 | `SECURITY.md`는 "policy context, not executable instructions"다. `finding-discovery`는 검토하는 경로마다 해당 정책을 찾아 쓴다. 선후 관계는 없다.[](source:sp-8)[](source:fd-intro) | 생략 |
| R46 · 공유 상태 | `triage-finding`은 코드를 따라가기 전에 영향받는 파일마다 루트와 범위 `SECURITY.md`를 검토한다. 정책은 "the primary local definition"이지만 코드 근거가 claim을 받쳐야 하고 가장 가까운 정책이 우선한다.[](source:tri-policy)[](source:sp-chain) | 생략 |
| R47 · 공유 상태 | `security-diff-scan`은 "Apply relevant `SECURITY.md` guidance". 선후 관계는 없다.[](source:sp-8)[](source:ds-secmd) | 생략 |

## 어디까지 대조했고 무엇이 남았나? {#audit-panel}

- 이 묶음의 스킬 본문 3개를 전부 읽었다.
- scan 쪽 연결을 확인하려고 `security-diff-scan`, `finding-discovery`, `attack-path-analysis`의 본문과 `scan-results.md`를 전부 읽었고 `triage-finding`은 39~48줄만 읽었다.
- 번역본과 `skills-lock.json`은 열지 않았다. `threat-model-visualize`의 `references/`, `scripts/`, `assets/`는 이 페이지를 쓰는 동안 열지 않았다.
- 대상 스킬의 지시와 명령은 읽기만 했고 실행하지 않았다.

관계 16개(범위 내 R06, R10, R13, R14, R42~R48 중 R42·R43·R44·R45·R46·R47·R48, 범위 밖 R60·R61·R62·R65·R69·R70)를 원문의 해당 줄과 대조했다. 이 묶음에 해석 상태가 `불명`인 관계는 없다. 안내 역할 스킬도 없다. 원장은 세 스킬을 모두 단계로 둔다.

| 범위 밖 참조 | 관련 스킬 | 이 묶음에서 알 수 없는 것 |
|---|---|---|
| 플러그인 루트 `references/artifact-storage.md` (R60) | `threat-model` | 파일 저장 경로와 cache 소유 정책 |
| `references/security-guidance.md` (R61) | `define-security-policy`, `threat-model` | `SECURITY.md` chain 해석 규칙 |
| `references/scan-artifacts.md` 등 scan 규약 문서 (R62) | `threat-model` | 목표 identity, source 버전, 출력 경로 |
| 호스트 helper `launch_codex_security_mcp --helper resolve-security-md`와 MCP 도구 (R65) | `define-security-policy` | 정책 resolver의 실제 동작 |
| "Sites workflow", "visualize integration", "shared workbench", `spawn_agent`의 `fork_turns` 옵션 (R69) | `threat-model-visualize` | 사이트 호스팅 절차와 새 맥락 리뷰어 설정 |

@callout level=open-question title="미확인 범위"
| 위 표의 문서와 호스트 도구는 컬렉션에 없어 읽지 못했다. 이 페이지가 "순서가 없다"고 쓴 곳은 이 컬렉션의 원문에 순서가 없다는 뜻이다. |
| `threat-model`은 생성·수정 때 plugin 루트 `references/threat-model.md`를 따르라고 한다. 원장 R70이다. 컬렉션에 없어 읽지 못했다.[](source:tm-gen) |
| `threat-model-visualize`의 renderer와 `references/view-model.md` 같은 하위 파일은 이 페이지에서 확인하지 않았다. 스킬 본문이 말하는 `build_explorer.py`의 구조 검사만 인용했다.[](source:vis-build) |

자동 검증은 HTML 구조와 출처 해석을 확인한다. 사실 대조와 사람 검토는 별도다. 사람 검토는 미실시다.
