# scan 전에 읽을 보안 맥락은 어느 스킬이 만들고 누가 읽나 {#threat-model-and-policy-page}

세 스킬은 scan이 참고할 보안 맥락 두 가지를 만든다. 위협 모델(`threatmodel.md`)은 `threat-model`이 만들고, 정책 `SECURITY.md`는 `define-security-policy`가 쓴다. `threat-model-visualize`는 기존 위협 모델을 HTML explorer로 바꾼다.[](source:tm-intro)[](source:sp-intro)[](source:vis-in) 세 스킬 사이에 필수 순서는 없다. **부분 분석**이다. `threat-model-visualize`의 renderer, 빌드 스크립트, 참고 문서 대부분은 읽지 않았다.

- `threat-model-visualize`가 읽는 입력은 기존 위협 모델이다. 새 assessment와 새 scan은 하지 않는다.[](source:vis-in)
- `threatmodel.md`를 쓰는 쪽은 둘이다. 단독 `threat-model`은 저장소 캐시에 쓰고, scan 안에서는 host가 scan 폴더에 쓴다. 둘의 끝부분 형식이 다르다.[](source:tm-ret)[](source:doc-ts)
- `SECURITY.md`는 여러 스킬이 읽는 공유 파일이다. 가장 가까운 정책이 우선하고, 정책은 workflow를 바꿀 권한이 없다.[](source:sg-chain)
- `threat-model`은 전체 scan의 첫 진입점이 아니다. scan의 threat-modeling 단계이거나 사용자가 명시 요청할 때만 쓴다.[](source:tm-front)

@answer scope="스킬 3개 · 원장 관계 14개 · 그림 1개 · 지시상 동작 · 코드 실행 없음"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source tm-front title="threat-model 호출 조건" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=1:4
@source tm-intro title="threat-model 목적" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=8:8
@source tm-pick title="threat-model 캐시 재사용 조건" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=14:17
@source tm-ret title="threat-model 결과 보관" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=25:27
@source sp-fm title="define-security-policy 호출 조건" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=1:4
@source sp-intro title="define-security-policy 목적" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=8:8
@source sp-chain title="define-security-policy 정책 찾기" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=20:30
@source sp-bound title="define-security-policy 경계 근거" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=36:36
@source sp-apply title="define-security-policy 적용" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=89:91
@source vis-fm title="threat-model-visualize 호출 조건" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=1:4
@source vis-in title="threat-model-visualize 입력" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=8:10
@source vis-build title="threat-model-visualize 빌드" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=71:72
@source vis-site title="threat-model-visualize 사이트 호스팅" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=83:83
@source sg-chain title="정책 해석 규칙" path=codex-security/plugins/codex-security/references/security-guidance.md lines=34:36
@source store-footer title="공유 캐시 footer 규칙" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=49:53
@source scan-art title="scan별 위협 모델 파일" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=28:29
@source scan-contract title="Deep scan의 primary model" path=codex-security/plugins/codex-security/references/scan-contract.md lines=173:173
@source doc-ts title="host의 threatmodel.md 렌더링" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts lines=33:70
@source core-pol title="core-scan의 정책 적용" path=codex-security/plugins/codex-security/references/core-scan.md lines=26:26
@source diff-tm title="diff scan의 threat-model 호출" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=28:28
@source diff-pol title="diff scan의 정책 적용" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=16:16
@source disc-pol title="finding-discovery의 정책 적용" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=10:10
@source tri-pol title="triage-finding의 정책 검토" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=39:39
@source core-tm title="core-scan의 threat-model.md 참조" path=codex-security/plugins/codex-security/references/core-scan.md lines=11:11

## 위협 모델은 어디서 만들어져 어떻게 explorer가 되나 {#flow span=12}

`threat-model`과 scan 안의 host가 각자 `threatmodel.md`를 쓰고, `threat-model-visualize`가 그 파일을 읽는다. 판정: 필수 순서가 아니라 산출물이 이어지는 경로다. `threat-model-visualize`를 먼저 부를 수도 있지만, 원문은 위협 모델이 없을 때의 처리를 적지 않는다(원문에 명시 없음). 최신 artifact가 없으면 오래된 것을 쓰기 전에 알리라는 지시만 있다.[](source:vis-in)

`define-security-policy`는 이 경로에 없다. 아래 공유 파일 표에서 다룬다.

@workflow id=model-flow title="위협 모델 만들기에서 explorer까지"
| tm | threat-model | backend | source:tm-ret |
| host | scan 안 host | external | source:doc-ts |
| file | threatmodel.md | database | source:scan-art |
| vis | threat-model-visualize | frontend | source:vis-build |
| tm > file | 단독 요청이면 저장 |
| host > file | scan.threatModel을 렌더링 |
| file > vis | 결과 전달 | emphasis |

@steps id=model-steps
| s-tm | threat-model | 저장소 구조와 공격자 능력으로 위협 모델을 만들거나 캐시 hit이면 기존 경로를 돌려준다.[](source:tm-intro)[](source:tm-ret) | model-flow | tm |
| s-host | scan 안 host | scan이 저장한 `scan.threatModel`로 `<scan_dir>/threatmodel.md`를 쓴다. 스킬이 아니라 host 동작이다.[](source:scan-art) | model-flow | host |
| s-file | threatmodel.md | 두 쪽이 쓰는 같은 이름의 파일이다. 끝부분 형식은 서로 다르다.[](source:tm-ret)[](source:doc-ts) | model-flow | file |
| s-vis | threat-model-visualize | 기존 위협 모델에서 view model을 만들고 `build_explorer.py`로 standalone HTML을 만든다.[](source:vis-in)[](source:vis-build) | model-flow | vis |

## 어떤 파일을 누가 쓰고 누가 읽나 {#state span=12}

쓰는 주체는 원문이 지시한 동작이다. 실행으로 확인하지 않았다.

| 파일 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `SECURITY.md` (루트·컴포넌트별) | `define-security-policy`가 새로 쓰거나 고친다. 검토 요청이면 초안을 보여 주기만 한다.[](source:sp-intro)[](source:sp-apply) | `finding-discovery`, `triage-finding`, `security-diff-scan`, `security-scan`, Deep worker가 각자 검토 경로에서 읽는다. `threat-model`은 경계를 대신 채울 때 읽는다.[](source:disc-pol)[](source:tri-pol)[](source:diff-pol)[](source:core-pol)[](source:tm-pick) |
| `threatmodel.md` (단독 요청, 공유 캐시) | `threat-model`이 저장한다. 공유 캐시를 쓸 때만 `Repository`·`Version` 두 줄을 붙인다.[](source:tm-ret) | `threat-model`이 두 줄이 일치할 때 재사용한다. `threat-model-visualize`가 입력으로 읽는다.[](source:store-footer)[](source:vis-in) |
| `<scan_dir>/threatmodel.md` (scan 안) | host가 `scan.threatModel`에서 렌더링한다. scan이 끝나기 전에는 provisional 표시가 붙는다.[](source:doc-ts) | `threat-model-visualize`가 "last scan" 요청에서 읽는다.[](source:vis-in)[](source:scan-art) |

`SECURITY.md` 규칙은 두 가지다. 루트부터 대상 디렉터리까지 이어 붙이고, 충돌하면 가장 가까운 정책이 우선한다. 정책은 분석 자료일 뿐 명령 실행, 파일 편집, workflow 변경을 허가하지 않는다.[](source:sg-chain)[](source:sp-chain)

공유 캐시의 `Repository`·`Version` 일치는 스킬 본문 지시로만 확인했다. 비교하는 코드는 원장 조사에서 찾지 못했다(원장 R42).

## 스킬 사이에 무엇을 넘기고 참고하나 {#relations span=12}

원장의 관계 중 이 묶음의 스킬이 한쪽 끝인 행이다. 그림에는 `threat-model`에서 `threat-model-visualize`로 가는 R42와, scan 안 host가 쓰는 파일(R71·R72)만 그렸다. 나머지는 그림에서 생략했다. 묶음 밖 참조 문서로 가는 R69, R70은 표에서도 뺐다.

| 행 | 누가 | 누구를 | 관계 | 조건과 강도 | 그림 |
| --- | --- | --- | --- | --- | --- |
| R42 {#g-r42} | `threat-model` | `threat-model-visualize` | 결과 전달 | visualize의 기본 입력이 기존 위협 모델이다. `--assessment <threat-model.md>`로 넘긴다. 새 assessment는 하지 않는다.[](source:vis-in) | 그림 |
| R71 {#g-r71} | `security-diff-scan` | `threat-model-visualize` | 결과 전달 | diff scan의 모델도 host가 `threatmodel.md`로 렌더링한다. visualize 쪽에 diff scan만 가리키는 문장은 없다.[](source:diff-tm)[](source:doc-ts) | 그림(host 노드) |
| R72 {#g-r72} | `deep-security-scan` | `threat-model-visualize` | 결과 전달 | Deep 부모 scan의 첫 모델이 primary다. `threatmodel.md`는 그 projection이고 별도 입력이 아니다.[](source:scan-contract) | 그림(host 노드) |
| R43 {#g-r43} | `security-scan` | `threat-model-visualize` | 결과 전달 | "last scan of X" 요청이면 충분하다. 최신 artifact가 없으면 알린 뒤 오래된 것을 쓴다. 새 scan은 돌리지 않는다.[](source:vis-in)[](source:scan-art) | 그림에서 생략 |
| R06 {#g-r06} | `security-diff-scan` | `threat-model` | 호출 | `$threat-model`을 한 번 실행하거나 사용자가 준 모델을 쓴다. 모델은 `complete: false` 초안으로 저장한다.[](source:diff-tm) | 그림에서 생략 |
| R14 {#g-r14} | `threat-model` | `security-scan` | 참고 | Standard scan과 Deep worker는 이 스킬을 부르지 않는다. 대신 `core-scan.md`가 같은 `references/threat-model.md`를 읽게 한다.[](source:tm-intro)[](source:core-tm) | 그림에서 생략 |
| R10 {#g-r10} | `threat-model` | `finding-discovery` | 결과 전달 | discovery가 위협 모델을 근거로 쓴다. 단독 호출에서 위협 모델이 필수인지는 원문에 명시 없음.[](source:disc-pol) | 그림에서 생략 |
| R13 {#g-r13} | `threat-model` | `attack-path-analysis` | 결과 전달 | scan 단계에서는 위협 모델을 쓰고, 단독 분석에서는 있으면 쓴다. 원문 줄은 원장의 출처 열에 있다. | 그림에서 생략 |
| R45 {#g-r45} | `define-security-policy` | `threat-model` | 같은 파일 | `SECURITY.md`나 `AGENTS.md`가 필요한 경계를 담으면 위협 모델을 대신할 수 있다. 선후 관계는 없다.[](source:tm-pick) | 표로 대체 |
| R48 {#g-r48} | `define-security-policy` | `threat-model` | 참고 | 정책을 쓸 때 경계 근거로 "threat models"를 읽을 수 있다. 스킬 이름은 지목하지 않는다.[](source:sp-bound) | 그림에서 생략 |
| R44 {#g-r44} | `define-security-policy` | `finding-discovery` | 같은 파일 | discovery가 검토 경로마다 해당 정책을 찾아 쓴다. 선후 관계는 없다.[](source:disc-pol) | 표로 대체 |
| R46 {#g-r46} | `define-security-policy` | `triage-finding` | 같은 파일 | 코드를 따라가기 전에 영향받는 파일마다 루트와 범위 정책을 검토한다. 코드 근거가 claim을 받쳐야 한다.[](source:tri-pol) | 표로 대체 |
| R47 {#g-r47} | `define-security-policy` | `security-diff-scan` | 같은 파일 | "Apply relevant `SECURITY.md` guidance". 선후 관계는 없다.[](source:diff-pol) | 표로 대체 |
| R73 {#g-r73} | `define-security-policy` | `security-scan` | 같은 파일 | core-scan이 시작 scope와 하위 디렉터리마다 정책을 해석해 reportability에도 적용한다. 사용자의 명시적 제외가 scope를 정한다.[](source:core-pol) | 표로 대체 |

위 표의 R13은 원장 출처 줄에서만 확인했고 이 페이지는 `attack-path-analysis` 본문을 읽지 않았다.

@callout level=open-question title="이 페이지가 확인하지 못한 것"
`threat-model-visualize`의 renderer, 빌드 스크립트, 참고 문서 `references/view-model.md`와 `references/context-explorer.md`의 내용은 이 페이지에서 읽지 않았다. 사이트 호스팅은 사용자가 명시 요청할 때만 하라는 지시가 있지만 호스팅 workflow 문서는 이 저장소에 없다.[](source:vis-site)
