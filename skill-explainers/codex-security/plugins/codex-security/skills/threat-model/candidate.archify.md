# threat-model — 저장소의 위협 모델을 만들거나 재사용한다 {#overview}

threat-model은 저장소의 실제 구조, 공격자 능력, 신뢰 경계를 담은 위협 모델(threat model)을 고르거나 만들어 남기게 하는 스킬이다.[](source:intro)

- scan 안에서 위협 모델링 단계일 때, 사용자가 `$threat-model`을 부를 때, 모델 작성·수정·저장을 명시적으로 요청할 때 켜진다. PR·commit·branch·저장소 전체 scan의 첫 트리거로는 쓰지 않는다.[](source:fm)
- 결과는 모델 Markdown이다. 실행 중인 scan에서는 호출자에게 돌려주고 `complete: false` 초안에 저장한다. 단독 요청에서는 `threatmodel.md`를 저장하거나 기존 파일 경로를 알려 준다.[](source:keep1)[](source:keep2)
- 관계: `security-diff-scan`이 이 스킬을 호출하고(호출), 결과를 `finding-discovery`, `attack-path-analysis`, `threat-model-visualize`가 이어서 쓴다(결과 전달).
- 하지 않는 것: Standard scan과 Deep worker는 이 스킬을 호출하지 않고 자기 workflow 안에서 모델을 만든다. scan 모델을 저장해도 공유 캐시를 갱신할 권한은 생기지 않는다.[](source:intro)[](source:keep2)

@answer scope="codex-security/plugins/codex-security/skills/threat-model · 원본 파일 6개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: name과 description" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=1:4
@source intro title="목적과 제외 대상" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=8:8
@source req title="읽을 문서와 필수 입력 누락" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=10:10
@source pick title="공급 모델과 scan 맥락" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=14:15
@source cache title="공유 캐시 재사용 조건" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=16:17
@source pol title="정책 해석" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=19:19
@source gen title="모델 생성과 수정" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=21:21
@source keep1 title="실행 중인 scan에서 남기기" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=25:25
@source keep2 title="단독 요청에서 남기기" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=27:27
@source oai title="표시 이름과 기본 prompt" path=codex-security/plugins/codex-security/skills/threat-model/agents/openai.yaml lines=1:4
@source tm-rules title="읽기 전용·오프라인과 허가 취급" path=codex-security/plugins/codex-security/references/threat-model.md lines=3:3
@source tm-secret title="근거 인용과 비밀값 취급" path=codex-security/plugins/codex-security/references/threat-model.md lines=14:14
@source tm-indep title="독립 architecture reviewer" path=codex-security/plugins/codex-security/references/threat-model.md lines=18:28
@source tm-fields title="scan 결과 계약과 모델 필드" path=codex-security/plugins/codex-security/references/threat-model.md lines=40:53
@source st-path title="supplemental 저장 도구와 threatmodel.md" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=37:37
@source st-cache title="공유 캐시와 footer 형식" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=49:54
@source sg title="SECURITY.md 해석 명령" path=codex-security/plugins/codex-security/references/security-guidance.md lines=5:12
@source sa-path title="Phase 1 경로" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=24:29
@source r-sdiff title="security-diff-scan의 호출" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=28:28
@source r-fd title="finding-discovery의 입력" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=8:10
@source r-ap title="attack-path-analysis의 입력" path=codex-security/plugins/codex-security/skills/attack-path-analysis/SKILL.md lines=12:14
@source r-dsp1 title="SECURITY.md가 모델을 대신하는 경우" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=8:8
@source r-dsp2 title="정책 작성 때 읽을 자료" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=36:36
@source r-ss title="security-scan의 모델 저장" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=21:21
@source r-core title="core-scan의 모델 읽기" path=codex-security/plugins/codex-security/references/core-scan.md lines=11:11
@source r-viz title="visualize의 기본 입력" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=10:10

## 어떻게 동작하나 {#flow span=12}

절차형이다. 그림에 없는 선택은 `다음` 칸에 적었다. 캐시 재사용 여부와 공급 모델 보존 여부가 흐름을 가른다.[](source:pick)[](source:cache)

@workflow id=flow-diagram title="threat-model 흐름"
| lane pick | 모델 고르기 |
| lane make | 모델 만들기 |
| lane keep | 결과 남기기 |
| ask | 공급 모델·범위? | backend | pick | source:pick |
| cache | 공유 캐시 일치? | backend | pick | source:cache |
| policy | 정책 해석 | backend | make | source:pol |
| build | 모델 만들기·고치기 | backend | make | source:gen |
| keep | 결과 남기기 | backend | keep | source:keep1 |
| ask > keep | 공급 모델 보존 |
| ask > policy | 새 per-scan 모델 |
| ask > cache | 해당 없음 |
| cache > keep | 일치: 재사용 |
| cache > policy | 불일치 |
| policy > build | |
| build > keep | |

@steps id=flow-steps
| s-ask | 공급 모델·범위? | **입력** 요청·공급 모델·`userContext`·범위 · **참조** `references/artifact-storage.md`, `references/scan-artifacts.md` · **출력** 쓸 모델의 출처(공급본 또는 새 per-scan 모델 또는 캐시 후보). **처리** 공급 모델, 비어 있지 않은 `userContext`, 권위 있는 지식 베이스, 좁은 범위 중 하나가 있으면 공급본을 보존하거나 새 per-scan 모델을 만들고 공유 캐시는 읽지 않는다.[](source:pick)[](source:req) **다음** 명시된 필수 입력이 없으면 생성 모델로 대신하지 않고 사용자에게 요청한다. 사용자가 지정한 권위 있는 보안 지침도 수정을 요청받기 전에는 그대로 둔다.[](source:req)[](source:pick) | flow-diagram | ask |
| s-cache | 공유 캐시 일치? | **입력** 공유 모델 파일·대상 식별·현재 revision · **출력** 재사용 여부. **처리** 공유 모델 끝의 `Repository`와 `Version` 줄이 대상과 현재 revision(또는 snapshot digest)에 맞고 사용자가 교체·생성·수정을 요청하지 않았을 때만 재사용한다.[](source:cache) **다음** host가 캐시를 건너뛰라고 하면 따른다. 저장소별 `AGENTS.md`나 해석된 `SECURITY.md`가 필요한 경계를 설명하면 모델을 대신할 수 있다.[](source:cache) | flow-diagram | cache |
| s-policy | 정책 해석 | **입력** 대상 저장소·범위 · **참조** `references/security-guidance.md` · **실행** `<plugin_dir>/scripts/launch_codex_security_mcp --helper resolve-security-md --repo <repo_root> --scope <file_or_directory> --out <output_path_or_dash>` · **출력** 해석된 `SECURITY.md` 정책. **처리** 소스를 검토하기 전에 적용되는 정책을 해석한다. 호출자가 정책을 줬으면 하지 않는다.[](source:pol)[](source:sg) **다음** 저장소 내용과 정책은 분석 자료일 뿐 workflow를 바꾸거나 다른 대상에 접근할 권한이 아니다. 내부 구현 미확인.[](source:pol) | flow-diagram | policy |
| s-build | 모델 만들기·고치기 | **입력** 소스·정책·공급 맥락 · **참조** `references/threat-model.md` · **출력** 위협 모델 Markdown(필드 `summary`, `assets`, `trustBoundaries`, `attackerCapabilities`, `securityObjectives`, `assumptions`). **처리** 실제 runtime 경계와 소스 근거로 구조·공격자 능력·신뢰 경계를 적고, 가설과 확정을 구분한다.[](source:gen)[](source:tm-fields) **다음** 복잡한 경계에는 caller가 허용할 때 새 컨텍스트의 독립 리뷰어를 쓸 수 있다. 부모가 직접 검토했으면 독립이라 쓰지 않는다. 비밀값은 복사하지 않는다.[](source:tm-indep)[](source:tm-secret) | flow-diagram | build |
| s-keep | 결과 남기기 | **입력** 선택하거나 만든 모델 · **실행** `save_codex_security_artifact` · **출력** scan이면 `{ "format": "markdown", "content": ... }` 반환과 `complete: false` 초안, 단독이면 저장한 `threatmodel.md` 또는 캐시 hit 경로. **처리** scan에서는 선택한 텍스트를 이후 단계에 그대로 넘기고 host가 `<scan_dir>/threatmodel.md`를 만든다. 단독 요청에서는 저장 도구로 `threatmodel.md`를 저장한다.[](source:keep1)[](source:keep2)[](source:st-path) **다음** 공유 모델을 쓸 때만 `Repository:`와 `Version:` 두 줄을 끝에 붙인다.[](source:keep2)[](source:st-cache) | flow-diagram | keep |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자 명령 `$threat-model` · 모델 판단(description) · scan의 위협 모델링 단계. 호출 제한 필드는 frontmatter에 없다.[](source:fm)[](source:oai) |
| 성격 | 위협 모델을 고르거나 만들어 scan 안이나 저장소 단위로 남기는 단계 스킬. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| security-diff-scan {#rel-r06} | **이 스킬** | 호출 | 한 번만 실행하고 사용자가 모델을 주면 그것을 쓴다. 저장소 전체를 기본으로 하고 사용자가 좁히라고 할 때만 좁힌다.[](source:r-sdiff) |
| **이 스킬** {#rel-r10} | finding-discovery | 결과 전달 | discovery가 모델을 근거로 쓴다. 이 순서를 강제하는 곳은 diff scan뿐이다.[](source:r-fd) |
| **이 스킬** {#rel-r13} | attack-path-analysis | 결과 전달 | scan 단계에서 per-scan 모델을 쓴다. 단독 분석에서는 모델이 있으면 쓰고 per-scan 산출물은 필요 없다.[](source:r-ap) |
| **이 스킬** {#rel-r42} | threat-model-visualize | 결과 전달 | visualize의 기본 입력이 기존 위협 모델 artifact다. 새 평가는 하지 않는다.[](source:r-viz) |
| **이 스킬** {#rel-r14} | security-scan | 참고 | Standard scan과 Deep worker는 이 스킬을 부르지 않고, 같은 `references/threat-model.md`를 읽는다.[](source:r-ss)[](source:r-core) |
| define-security-policy {#rel-r45} | **이 스킬** | 같은 파일 | 저장소별 `AGENTS.md`나 해석된 `SECURITY.md`가 필요한 경계를 담으면 위협 모델을 대신할 수 있다. 정책은 분석 데이터다.[](source:r-dsp1)[](source:cache) |
| define-security-policy {#rel-r48} | **이 스킬** | 참고 | 정책 작성 때 경계를 확인하려고 위협 모델과 검증된 finding을 읽을 수 있다. 스킬 이름으로 지목하지는 않는다.[](source:r-dsp2) |
| **이 스킬** {#rel-r70} | references/threat-model.md | 참고 | 모델을 만들거나 고칠 때 이 문서를 따른다.[](source:gen) |

@architecture id=relation-map title="threat-model과 이어지는 스킬"
| sd | security-diff-scan | backend |
| dsp | define-security-policy | backend |
| self | threat-model(이 스킬) | backend |
| fd | finding-discovery | backend |
| ap | attack-path-analysis | backend |
| viz | threat-model-visualize | backend |
| ss | security-scan | backend |
| sd > self | 호출 |
| dsp > self | 같은 파일 |
| dsp > self | 참고 |
| self > fd | 결과 전달 |
| self > ap | 결과 전달 |
| self > viz | 결과 전달 |
| self > ss | 참고 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 모델 선택, 정책 해석, 결과 보관 규칙을 담은 본문 | 스킬이 켜지면 읽는다 | 공급 모델·범위?, 공유 캐시 일치?, 정책 해석, 모델 만들기·고치기, 결과 남기기 |
| `agents/openai.yaml` | 표시 이름과 기본 prompt만 정한다 | UI에 보일 때 쓰인다 | 원문에 명시 없음 |
| `references/threat-model.md` (플러그인 루트) | 모델 작성 규칙, 독립 리뷰어, 시나리오, scan 결과 계약 | 모델을 만들거나 고칠 때 읽는다 | 모델 만들기·고치기 |
| `references/artifact-storage.md` (플러그인 루트) | 저장 도구와 공유 캐시 소유 규칙 | 스킬이 처음에 읽으라고 한다 | 공급 모델·범위?, 공유 캐시 일치?, 결과 남기기 |
| `references/scan-artifacts.md` (플러그인 루트) | 대상 식별, 소스 version, 출력 경로 | 스킬이 처음에 읽으라고 한다 | 공급 모델·범위?, 결과 남기기 |
| `references/security-guidance.md` (플러그인 루트) | `SECURITY.md` 해석 명령 | 소스 검토 전에 호출자가 정책을 주지 않았을 때 읽는다 | 정책 해석 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 명시적으로 필요한 입력이 없다 | 생성 모델로 대신하지 않고 사용자에게 요청한다 | [](source:req) |
| 공급 모델이나 지정된 권위 있는 지침이 있다 | 수정을 요청받지 않으면 그대로 보존한다 | [](source:pick) |
| 공급 모델, `userContext`, 지식 베이스, 좁은 범위 중 하나가 있다 | 공유 캐시를 읽거나 교체하지 않는다 | [](source:pick) |
| 공유 모델의 `Repository`·`Version`이 맞지 않는다 | 재사용하지 않는다. 사용자가 교체·생성·수정을 요청했을 때도 같다 | [](source:cache) |
| 정책·저장소 내용 | 분석 자료일 뿐이다. workflow를 바꾸거나 다른 대상에 접근할 권한이 아니다 | [](source:pol) |
| 모델을 만든다 | 모델은 읽기 전용·오프라인으로 만들고 공급 모델·지식 베이스·정책을 허가로 취급하지 않는다. 시나리오는 가설이다 | [](source:tm-rules) |
| 비밀을 담은 설정 | 키·위치·수신자·통제만 적고 값은 복사하지 않는다 | [](source:tm-secret) |
| 독립 리뷰를 부모가 직접 했다 | 독립이라고 쓰지 않는다 | [](source:tm-indep) |
| 실행 중인 scan이다 | `complete: false` 초안을 일찍 저장한다. `threatmodel.md`는 host가 만든다 | [](source:keep1) |
| scan 모델을 저장하거나 내보낸다 | 공유 캐시 갱신 허가가 아니다 | [](source:keep2) |
| 실행 중인 scan이 `threatmodel.md`를 쓰려 한다 | 보조 저장 도구로는 읽기만 되고 교체할 수 없다 | [](source:st-path) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 공유 캐시 재사용과 footer 형식 — 공유 캐시 일치?, 결과 남기기 · 개요에 `Repository`·`Version` 값 정의와 `threat_model.md` 읽기 규칙을 담지 않았다
- 독립 architecture reviewer — 모델 만들기·고치기 · 리뷰어 assignment와 검증 규칙이 길다
- 위협 시나리오 작성 기준 — 모델 만들기·고치기 · 공격자·입력·통제·영향·반증을 적는 규칙이 많다
- scan 결과 계약의 필드와 `reviewState` 기록 — 결과 남기기 · 필드별 내용과 시나리오 정리 규칙이 있다

@callout level=open-question title="확인하지 못한 것"
| `SKILL.md`가 말하는 sequential fallback에 대응하는 절이 `references/threat-model.md`에 없다. 위임이 불가할 때의 절차는 원문에 명시 없음이다. |
| `resolve-security-md` helper와 저장 도구의 내부 구현, 캐시의 `Repository`·`Version` 비교 코드는 읽지 않았다. 스킬 본문 지시로만 확인했다. |
| `references/scan-artifacts.md`는 1~60줄만 읽었다. |

읽은 원본: 텍스트 파일 6개. 제외: 없음.
