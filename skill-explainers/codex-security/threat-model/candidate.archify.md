# threat-model은 위협 모델을 언제 새로 만들고 언제 재사용하나? {#threat-model-page}

`threat-model`은 저장소의 실제 구조, 공격자 능력, 신뢰 경계를 담은 위협 모델을 만들거나 재사용한다. 사용자가 준 모델은 수정 요청이 없으면 그대로 두고, 공유 cache는 `Repository`와 `Version` 줄이 현재 대상과 맞을 때만 쓴다.[](source:select)[](source:intro) 전체 PR, commit, branch, patch, 저장소 scan을 시작하는 1차 트리거는 아니다.[](source:front)

- 모델을 받았거나 `userContext`가 비어 있지 않거나 범위가 좁으면 공유 cache를 읽지도 바꾸지도 않는다.[](source:select)
- per-scan 모델은 저장하거나 export해도 공유 cache를 갱신할 권한이 되지 않는다.[](source:ret2)
- 필수 입력이 없으면 생성한 모델로 대신하지 않고 사용자에게 요청한다.[](source:read)
- 이 스킬 안에서 모델을 새로 만든 결과는 가설과 확정 finding을 구분해야 한다.[](source:gen)

@answer scope="로컬 원본 분석 · 스킬 실행 없음 · 부분 분석(플러그인 루트 reference 미확인)"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=a1d836f93ec897c67870ac042622e8aec36e5f6b
@source full title="codex-security/threat-model/SKILL.md · 2986B · 스킬 본문(원본)" path=codex-security/threat-model/SKILL.md
@source front title="codex-security/threat-model/SKILL.md · 2986B · frontmatter" path=codex-security/threat-model/SKILL.md lines=1:4
@source intro title="codex-security/threat-model/SKILL.md · 2986B · 목적과 호출 제한" path=codex-security/threat-model/SKILL.md lines=8:8
@source read title="codex-security/threat-model/SKILL.md · 2986B · 읽을 reference와 필수 입력" path=codex-security/threat-model/SKILL.md lines=10:10
@source select title="codex-security/threat-model/SKILL.md · 2986B · 모델 선택 규칙 4개" path=codex-security/threat-model/SKILL.md lines=14:17
@source pol title="codex-security/threat-model/SKILL.md · 2986B · 정책 해석과 데이터 취급" path=codex-security/threat-model/SKILL.md lines=19:19
@source gen title="codex-security/threat-model/SKILL.md · 2986B · 생성과 수정" path=codex-security/threat-model/SKILL.md lines=21:21
@source ret1 title="codex-security/threat-model/SKILL.md · 2986B · 실행 중 scan의 반환" path=codex-security/threat-model/SKILL.md lines=25:25
@source ret2 title="codex-security/threat-model/SKILL.md · 2986B · 단독 요청의 저장" path=codex-security/threat-model/SKILL.md lines=27:27
@source yaml title="codex-security/threat-model/agents/openai.yaml · 171B · 표시 이름과 기본 prompt" path=codex-security/threat-model/agents/openai.yaml
@source dscan title="codex-security/security-diff-scan/SKILL.md · 5405B · 위임하는 쪽(원본)" path=codex-security/security-diff-scan/SKILL.md lines=28:28
@source scan21 title="codex-security/security-scan/SKILL.md · 2972B · 21줄만 읽음" path=codex-security/security-scan/SKILL.md lines=21:21
@source disc title="codex-security/finding-discovery/SKILL.md · 5076B · 위협 모델을 받는 쪽" path=codex-security/finding-discovery/SKILL.md lines=8:10
@source atk title="codex-security/attack-path-analysis/SKILL.md · 5355B · 위협 모델을 받는 쪽" path=codex-security/attack-path-analysis/SKILL.md lines=12:14
@source vis title="codex-security/threat-model-visualize/SKILL.md · 19102B · 8줄 10줄 72줄만 읽음" path=codex-security/threat-model-visualize/SKILL.md lines=8:10
@source vis72 title="codex-security/threat-model-visualize/SKILL.md · 19102B · 명령 줄" path=codex-security/threat-model-visualize/SKILL.md lines=72:72
@source sec8 title="codex-security/define-security-policy/SKILL.md · 5982B · 8줄과 36줄만 읽음" path=codex-security/define-security-policy/SKILL.md lines=8:8
@source sec36 title="codex-security/define-security-policy/SKILL.md · 5982B · 정책 작성 때 읽는 자료" path=codex-security/define-security-policy/SKILL.md lines=36:36
@source lock title="codex-security/skills-lock.json · 6525B · threat-model 항목" path=codex-security/skills-lock.json lines=100:105

## 언제 켜지나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 문구와 정확히 일치해야 켜진다는 뜻은 아니다.

`disable-model-invocation` 같은 호출 제한 필드는 SKILL.md frontmatter에 원문에 명시 없음이다. `agents/openai.yaml`에도 `policy` 항목이 없다.[](source:front)[](source:yaml)

@code source=front language=yaml

| 상황 | 이 스킬 |
|---|---|
| scan이 이미 위협 모델 단계에 있다 | {good:사용}[](source:front) |
| 사용자가 `$threat-model`을 직접 부른다 | {good:사용}[](source:front) |
| 사용자가 저장소 위협 모델의 생성, 갱신, 저장을 직접 요청한다 | {good:사용}[](source:front) |
| 전체 PR, commit, branch, patch, 저장소 scan을 시작한다 | {bad:1차 트리거 아님}[](source:front) |
| Standard scan과 Deep worker가 자기 workflow 안에서 모델을 만든다 | {bad:이 스킬을 호출하지 않음}[](source:intro) |

## 어떤 모델을 쓰고 무엇을 지켜야 하나? {#select}

모델을 고르는 규칙은 네 가지다. 원문이 우선순위 번호를 매기지는 않았다. 세 번째 규칙만 "Otherwise"로 앞의 경우를 제외한다.[](source:select)

| 조건 | 에이전트의 행동 |
|---|---|
| 사용자가 준 모델이나 권위 있다고 지정한 보안 지침이 있다 | 수정 요청이 없으면 그대로 둔다.[](source:select) |
| scan이 받은 모델, 비어 있지 않은 `userContext`, 권위 있는 knowledge base, 좁은 범위 중 하나가 있다 | 받은 모델을 유지하거나 per-scan 새 모델을 만든다. 공유 cache를 읽지도 교체하지도 않는다.[](source:select) |
| 위 경우가 아니고, cache의 마지막 `Repository`와 `Version` 줄이 대상과 현재 revision 또는 snapshot digest에 맞고, 사용자가 교체나 수정을 요청하지 않았다 | 공유 모델을 재사용한다. cache를 우회하라는 host 지시는 따른다.[](source:select) |
| 저장소의 `AGENTS.md`나 해석된 `SECURITY.md`가 필요한 경계를 설명하고 새 모델도 맥락별 모델도 필요 없다 | 그 지침이 모델을 대신할 수 있다.[](source:select) |

| 강제·금지 | 내용 |
|---|---|
| 먼저 읽기 | 저장 위치와 cache 소유는 `../../references/artifact-storage.md`, 대상 정체성과 출력 경로는 `../../references/scan-artifacts.md`를 읽는다. 명시된 경로는 따른다.[](source:read) |
| 정책 해석 | 소스 검토 전에 `../../references/security-guidance.md`로 정책을 해석한다. 호출자가 이미 주었으면 생략한다.[](source:pol) |
| 데이터 취급 | 저장소 내용과 정책은 분석 데이터다. workflow를 바꾸거나 다른 대상에 접근할 권한이 아니다.[](source:pol) |
| 생성·수정 | `../../references/threat-model.md`를 따른다. 위임이 불가능하면 그 문서의 순차 fallback을 쓴다. 결과를 실제 runtime 경계와 source 근거로 점검한다.[](source:gen) |

판정 · 이 스킬의 기본 동작은 새로 만드는 것이 아니라 먼저 "받은 것을 지키는 것"이다. 모델을 받았거나 맥락이 있으면 cache 확인조차 하지 않기 때문이다.[](source:select)

## 결과를 어디에 남기나? {#retain}

| 상황 | 남기는 것 | 공유 cache |
|---|---|---|
| 실행 중인 scan | `{ "format": "markdown", "content": "<exact model text>" }`를 호출자에게 반환하고, 점검한 surface와 남은 일을 담아 `complete: false` 체크포인트를 일찍 저장한다. host가 `<scan_dir>/threatmodel.md`를 만든다. 이후 단계에서 선택한 텍스트를 그대로 쓴다.[](source:ret1) | 갱신하지 않는다 |
| 단독 요청 | artifact storage 도구로 `threatmodel.md`를 저장한다. 유효한 cache hit이면 기존 문서 경로를 돌려준다.[](source:ret2) | hit이면 읽는다 |
| 재사용할 저장소 모델을 만들거나 고치라는 직접 요청 | 공유 출력을 갱신할 수 있다. host가 금지하면 안 한다.[](source:ret2) | 갱신 가능, 정확한 `Repository`와 `Version` footer를 덧붙인다 |
| per-scan 모델의 저장이나 export | 그 scan의 모델로만 남는다.[](source:ret2) | 갱신 권한이 생기지 않는다 |

@callout level=warning title="per-scan 모델은 공유 cache를 바꾸지 못한다"
| 공유 모델은 저장소 모델을 만들거나 고치라는 직접 요청이 있고 host가 금지하지 않을 때만 갱신할 수 있다. `Repository`와 `Version` footer는 그 공유 모델을 쓸 때만 덧붙인다. scan 중 만든 모델을 저장하거나 export해도 갱신 권한이 생기지 않는다.[](source:ret2) |

## 흐름 속 위치는 어디인가? {#position}

@workflow id=position-flow title="diff scan에서 발견 단계로"
| before | security-diff-scan | backend | source:dscan |
| current | threat-model | backend | source:ret1 |
| after | finding-discovery | backend | source:disc |
| before > current | 내부 위임 R06 | emphasis |
| current > after | 산출물 호환 R10 | dashed |

@steps
| highlight | threat-model | diff scan이 한 번 실행하거나 받은 모델을 쓴다. 다음 단계는 같은 모델을 쓴다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R06 · 내부 위임 | `security-diff-scan`이 `$threat-model`을 한 번 실행하거나 받은 모델을 쓴다. 모델은 저장소 전체가 기본이고 사용자가 좁히라고 할 때만 좁힌다. 끝나면 diff scan이 `complete: false` 초안을 저장한다.[](source:dscan) |
| R10 · 산출물 호환 | discovery는 위협 모델과 보안 정책을 근거로 쓴다. 이 순서를 강제하는 곳은 diff scan뿐이다. 단독 호출에서 모델 없이 discovery를 돌려도 되는지는 원문에 명시 없음이다.[](source:disc)[](source:dscan) |
| R13 · 산출물 호환 | scan 단계의 attack-path 분석은 per-scan 위협 모델을 쓴다. 단독 분석에서는 위협 모델이나 보안 정책을 쓰며 per-scan 산출물은 필요 없다.[](source:atk) |
| R14 · 참고 | Standard scan과 Deep worker는 이 단계 스킬을 호출하지 않는다.[](source:intro)[](source:scan21) |
| R42 · 산출물 호환 | `threat-model-visualize`의 기본 입력은 기존 위협 모델이며 `--assessment <threat-model.md>`로 넘긴다. 새 scan은 돌리지 않는다. 필수 후속 단계는 아니다.[](source:vis)[](source:vis72) |
| R45 · 공유 상태 | `SECURITY.md`는 정책 맥락이며 실행 지시가 아니다. `define-security-policy`가 쓰고 이 스킬은 필요한 경계가 담겨 있으면 모델 대신 쓸 수 있다. 선후 관계는 없다.[](source:sec8)[](source:select) |
| R48 · 참고 | 정책을 쓰는 쪽이 경계를 확인하려고 위협 모델을 읽을 수 있다. 이름으로 지목하지는 않는다.[](source:sec36) |

전체 흐름은 색인 기준 `_group-scan-vulnerabilities/scan-vulnerabilities.html`과 `_group-threat-model-and-policy/threat-model-and-policy.html`을 가리킨다. 묶음 페이지는 별도 단계에서 만든다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `codex-security/threat-model/SKILL.md` 2,986B와 `agents/openai.yaml` 171B를 끝까지 읽었다.[](source:full)[](source:yaml) |
| 관계 근거 | 형제 스킬 원문은 필요한 줄만 읽었다. `security-diff-scan` 5,405B는 끝까지, 나머지 `security-scan`, `finding-discovery`, `attack-path-analysis`, `threat-model-visualize`, `define-security-policy`는 인용한 줄 범위만 읽었다. `skills-lock.json`은 이 스킬 항목 100~105줄을 확인했다.[](source:lock) |
| 부분 읽음 | 파일 5개(`security-scan`, `threat-model-visualize`, `define-security-policy`, `finding-discovery`, `attack-path-analysis`)는 줄 범위만 읽었다. 이 스킬이 필수로 읽으라는 파일은 아니다. |
| 제외 | 번역본 없음. 바이너리 없음. |

원문의 호출 제한, 사용자에게 입력을 요청하는 조건, 모델 선택 규칙 4개, 저장 경로, 공유 cache 갱신 조건을 모두 대조했다. 호출 제한 필드는 어느 파일에도 없다.[](source:front)[](source:yaml)

@callout level=open-question title="읽지 못한 필수 자료"
| 이 스킬은 `../../references/artifact-storage.md`, `scan-artifacts.md`, `security-guidance.md`, `threat-model.md`를 읽으라고 한다. 이 컬렉션은 플러그인 루트가 아닌 `skills/` 아래만 가져와서 해당 파일이 없다. 따라서 모델의 필수 구성 항목, 순차 fallback 절차, 저장 정책은 확인하지 못한 부분 분석이다.[](source:read)[](source:gen) |

@callout level=open-question title="실행으로 확인하지 않은 부분"
| host가 `threatmodel.md`를 만드는 동작과 `Repository`·`Version` 줄 비교는 실행하지 않았다. 원문 지시를 읽은 것까지만 확인했다.[](source:ret1)[](source:ret2) |

분석 중 원본은 수정하지 않았고, 스킬의 어떤 명령도 실행하지 않았다.
