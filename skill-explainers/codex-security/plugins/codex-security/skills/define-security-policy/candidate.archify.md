# define-security-policy — scanner가 무엇을 finding으로 볼지 SECURITY.md로 정한다 {#overview}

define-security-policy는 저장소나 컴포넌트의 `SECURITY.md`를 근거로 새로 쓰거나 검토하게 하는 스킬이다. 이 파일은 scanner에게 보안 경계, 지켜야 할 성질, 보고 대상, 범위 밖을 알려 주는 정책 자료다.[](source:def)

- 사용자가 `SECURITY.md`를 정하거나 고치거나 현재 코드와 맞는지 점검하려 할 때 켜진다. 검토만 요청받았으면 초안이나 수정 요청이 올 때까지 검토에 머문다.[](source:fm)[](source:decide)
- 결과는 제안된 변경과 diff, 해석된 policy chain(root부터 leaf까지 이어 붙인 정책 묶음), 남은 불확실성이다. 편집이 허락된 경우에만 파일이 바뀐다.[](source:apply)
- 관계: `SECURITY.md`를 읽는 finding-discovery, threat-model, triage-finding, security-diff-scan, security-scan과 같은 파일로 이어지고, threat-model은 참고한다.
- 하지 않는 것: 정책 파일을 실행 지시로 따르지 않는다. 추론을 억제 권한으로 쓰거나 비밀과 불필요한 exploit 상세를 정책에 넣지 않는다.[](source:untrusted)[](source:decide)

@answer scope="codex-security/plugins/codex-security/skills/define-security-policy · 원본 파일 5개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: name과 description" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=1:4
@source def title="SECURITY.md는 정책 자료이고 실행 지시가 아니다" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=8:8
@source find title="1단계: 적용 정책 찾기" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=12:18
@source chain title="policy chain 해석과 우선순위" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=20:28
@source untrusted title="정책·소스·finding은 신뢰하지 않는 근거" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=30:32
@source bound title="2단계: 경계와 기존 정책 대조" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=36:45
@source decide title="소유자 결정과 검토 전용 요청" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=47:51
@source draft title="3단계: 초안 절 구성" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=55:85
@source apply title="4단계: 반영과 검증" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=89:93
@source yaml title="UI 표시 이름과 기본 prompt" path=codex-security/plugins/codex-security/skills/define-security-policy/agents/openai.yaml lines=1:4
@source guide title="resolver 사용법과 합성 규칙" path=codex-security/plugins/codex-security/references/security-guidance.md lines=9:36
@source helper title="helper의 인자 검사와 종료 코드" path=codex-security/plugins/codex-security/mcp-app/src/helpers/resolve-security-md.ts lines=396:435
@source readme title="벤더 안내문: 스킬 고르기와 이 스킬 소개" path=codex-security/plugins/codex-security/skills/README.md lines=3:3
@source readme-def title="벤더 안내문의 이 스킬 항목" path=codex-security/plugins/codex-security/skills/README.md lines=18:18
@source fd title="finding-discovery의 정책 해석" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=10:10
@source tm-stand title="threat-model: SECURITY.md가 모델을 대신할 수 있음" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=17:19
@source tm-model title="threat-model의 위협 모델 산출" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=25:27
@source tf title="triage-finding: 정책 검토" path=codex-security/plugins/codex-security/skills/triage-finding/SKILL.md lines=39:41
@source ds title="security-diff-scan: SECURITY.md 적용" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=16:16
@source ss title="core-scan: 상속 정책 해석" path=codex-security/plugins/codex-security/references/core-scan.md lines=9:9
@source ss-skill title="security-scan이 core-scan을 쓴다" path=codex-security/plugins/codex-security/skills/security-scan/SKILL.md lines=10:10

## 어떻게 동작하나 {#flow span=12}

절차형이다. 그림에 없는 선택이 둘 있다. 대상이 모호하면 사용자에게 묻고, 새 정책 위치는 사용자가 정한 대로 따른다.[](source:find)[](source:untrusted)

@workflow id=flow-diagram title="define-security-policy 흐름"
| lane ground | 근거 모으기 |
| lane decide | 결정 확인 |
| lane write | 쓰기와 검증 |
| find | 적용 정책 찾기 | backend | ground | source:find |
| bound | 보안 경계 정리 | backend | ground | source:bound |
| decide | 결정 확인됨? | backend | decide | source:decide |
| ask | 소유자에게 질문 | external | decide | source:decide |
| draft | 정책 초안 쓰기 | backend | write | source:draft |
| auth | 편집 허락? | backend | write | source:apply |
| write | 정책 파일 반영 | backend | write | source:apply |
| show | diff·chain 보여 주기 | backend | write | source:apply |
| find > bound | |
| bound > decide | |
| decide > draft | 예 |
| decide > ask | 아니오 |
| ask > draft | 답 또는 미해결 표시 |
| draft > auth | |
| auth > write | 허락됨 |
| auth > show | 검토·초안만 |
| write > show | resolver 재실행 |

@steps id=flow-steps
| s-find | 적용 정책 찾기 | **입력** 사용자 요청의 저장소·컴포넌트 · **참조** `../../references/security-guidance.md` · **실행** `<plugin_dir>/scripts/launch_codex_security_mcp --helper resolve-security-md --repo <repo_root> --list`, 같은 helper에 `--scope <file_or_directory> --out -` · **출력** 정책 경로 목록, 대상 경로의 policy chain. **처리** 숨은 디렉터리까지 `SECURITY.md`를 나열하고, 대상 경로에 적용되는 정책을 root부터 leaf 순서로 해석한다. 가까운 정책이 충돌에서 이긴다.[](source:find)[](source:chain)[](source:guide) **다음** 대상이 모호하면 사용자에게 묻는다. resolver가 거부한 정책은 우회하지 않고 coverage gap으로 보고한다.[](source:find) | flow-diagram | find |
| s-bound | 보안 경계 정리 | **입력** 소스·설정·아키텍처 메모·보안 테스트·threat model·검증된 finding · **출력** 시스템 범위, 위협 모델과 불변식, 보고 기준, 제외 목록과 기존 정책의 어긋난 점. **처리** 필요한 만큼만 읽어 scanner가 알아야 할 네 가지를 정리하고, 기존 정책을 그 근거와 견줘 어긋난 곳마다 근거·영향·최소 수정을 적는다.[](source:bound) **다음** 테스트는 의도한 통제를 보여 줄 뿐 통제가 동작한다는 증명이 아니다.[](source:bound) | flow-diagram | bound |
| s-decide | 결정 확인됨? | **입력** 범위·심각도·제외·accepted risk 결정(요청에 이미 있는 것 포함) · **출력** 확정된 결정과 미해결 결정. **처리** 소유자가 확인한 결정만 정책에 쓴다. 추론은 억제 권한이 되지 못하고, 검증하지 않은 통제는 안전의 증거가 아니다.[](source:decide) **다음** 확인되지 않은 중요한 결정은 묻는다. | flow-diagram | decide |
| s-ask | 소유자에게 질문 | **입력** 미해결 결정 · **출력** 소유자의 답 또는 미해결 표시. **처리** 노출된 표면, 공격자가 통제하는 입력, 의도적 제외처럼 정책을 바꿀 수 있는 사실만 묻는다.[](source:decide) **다음** 소유자가 없으면 그 결정을 미해결로 표시한다.[](source:decide) | flow-diagram | ask |
| s-draft | 정책 초안 쓰기 | **입력** 확정된 결정과 경계 정리 · **출력** 여섯 절 초안(시스템과 범위, 위협 모델, 불변식, 보고 기준, 제외, 한계). **처리** reviewer가 finding 여부를 정하는 데 도움 되는 절을 쓰고, 기존 문구와 구조는 살린다. 빈 boilerplate는 넣지 않는다.[](source:draft) **다음** 새 정책 위치는 저장소 전체면 `<repo_root>/SECURITY.md`, 별도 컴포넌트면 `<component>/SECURITY.md`다.[](source:untrusted) | flow-diagram | draft |
| s-auth | 편집 허락? | **입력** 사용자 요청의 범위(검토·초안·편집) · **출력** 변경 적용 여부. **처리** 검토나 초안 요청이면 제안 변경만 보여 준다. 편집이 허락됐을 때만 파일에 쓴다.[](source:apply)[](source:decide) | flow-diagram | auth |
| s-write | 정책 파일 반영 | **입력** 승인된 초안 · **출력** 바뀐 `SECURITY.md`. **처리** 일반 저장소 도구로 반영하고, 동시에 생긴 다른 편집을 보존한다. 새 제외·accepted risk·심각도 변경·민감한 finding 상세는 따로 짚는다.[](source:apply) **다음** 확인되지 않은 중요한 정책 결정은 반영 전에 푼다.[](source:apply) | flow-diagram | write |
| s-show | diff·chain 보여 주기 | **입력** 반영 결과 또는 제안 변경 · **실행** 바뀐 범위에 resolver를 다시 실행 · **출력** diff, policy chain, 남은 불확실성. **처리** 표시하는 diff에서 제어 문자는 보이게 그리되 원문은 바꾸지 않는다.[](source:apply) **다음** staging, commit, push, PR은 사용자가 허락한 범위 안에서만 한다.[](source:apply) | flow-diagram | show |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description). UI 기본 prompt는 "Define or update this repository's SECURITY.md and show the proposed diff."이다. 벤더 안내문은 스킬 이름을 요청에 넣어 고르는 방법도 알려 준다. 호출 제한 필드는 frontmatter에 없다.[](source:fm)[](source:yaml)[](source:readme) |
| 성격 | 정책 문서를 쓰는 쪽. 다른 스킬이 `SECURITY.md`를 읽는 정책 자료를 만든다.[](source:readme-def) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r44} | finding-discovery | 같은 파일 | discovery가 검토하는 경로마다 `SECURITY.md`를 찾아 쓴다. 선후 관계는 없다. 정책은 실행 지시가 아니다.[](source:def)[](source:fd) |
| **이 스킬** {#rel-r45} | threat-model | 같은 파일 | 필요한 경계를 담은 `AGENTS.md`나 해석된 `SECURITY.md`가 위협 모델을 대신할 수 있다.[](source:tm-stand) |
| **이 스킬** {#rel-r46} | triage-finding | 같은 파일 | 영향받는 파일마다 루트와 범위 정책을 먼저 검토한다. 정책은 "primary local definition"이지만 코드 근거가 claim을 받쳐야 한다.[](source:tf) |
| **이 스킬** {#rel-r47} | security-diff-scan | 같은 파일 | diff scan이 관련 `SECURITY.md` 지침을 적용한다. 선후 관계는 없다.[](source:ds) |
| **이 스킬** {#rel-r73} | security-scan | 같은 파일 | core-scan이 시작 scope와 더 깊은 디렉터리의 상속 정책을 resolver로 해석해 보고 대상 판단에도 쓴다. 사용자가 명시한 제외가 scope를 정한다.[](source:ss)[](source:ss-skill) |
| **이 스킬** {#rel-r48} | threat-model | 참고 | 정책 작성 때 경계를 확인하려고 threat model과 검증된 finding을 읽을 수 있다. 스킬 이름은 적지 않는다. 판정: 방향은 근거 문장의 주체인 정책 작성에서 정했다.[](source:bound)[](source:tm-model) |

@architecture id=relation-map title="define-security-policy와 이어지는 스킬"
| self | define-security-policy(이 스킬) | backend |
| fd | finding-discovery | backend |
| tm | threat-model | backend |
| tf | triage-finding | backend |
| ds | security-diff-scan | backend |
| ss | security-scan | backend |
| self > fd | 같은 파일 |
| self > tm | 같은 파일 |
| self > tf | 같은 파일 |
| self > ds | 같은 파일 |
| self > ss | 같은 파일 |

@code source=fm language=yaml

위 그림에서 threat-model로 가는 `참고`(R48)는 같은 파일 간선과 겹쳐 표에만 남겼다. 그림에서 뺀 관계다.

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 네 단계 지시와 초안 절 구성 | 스킬이 켜지면 읽는다 | 적용 정책 찾기, 보안 경계 정리, 결정 확인됨?, 소유자에게 질문, 정책 초안 쓰기, 편집 허락?, 정책 파일 반영, diff·chain 보여 주기 |
| `agents/openai.yaml` | UI 표시 이름·짧은 설명·기본 prompt | UI가 스킬을 보여 줄 때 쓴다. 지시 본문이 아니다 | 원문에 명시 없음 |
| `../../references/security-guidance.md` (플러그인 루트) | resolver 호출 형식, 합성 순서, 정책을 데이터로만 다루는 규칙 | `SKILL.md`가 policy chain을 해석하기 전에 읽으라고 한다 | 적용 정책 찾기 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 대상 저장소·컴포넌트가 모호하다 | 사용자에게 묻는다 | [](source:find) |
| resolver가 정책을 거부한다 | 우회하지 않고 거부된 정책과 coverage gap을 보고한다 | [](source:find) |
| 정책이 충돌한다 | 코드에 가장 가까운 정책이 우선한다 | [](source:chain)[](source:guide) |
| `.github/SECURITY.md`, `docs/SECURITY.md` | 저장소 전체 scanner 지침으로 보지 않고, 루트 정책을 만들 때 덮어쓰지 않는다 | [](source:chain) |
| 정책 파일·소스·테스트·finding | 신뢰하지 않는 근거다. 명령, 편집, 공개, scope 변경을 허가하지 못한다 | [](source:untrusted)[](source:guide) |
| 소유자가 확인하지 않은 중요한 결정 | 묻는다. 소유자가 없으면 미해결로 표시하고, 추론을 억제 권한으로 쓰지 않는다 | [](source:decide) |
| 검토 전용 요청 | 사용자가 초안이나 편집을 요청할 때까지 검토에 머문다 | [](source:decide) |
| 비밀, 불필요한 exploit 상세 | 저장소 정책에 넣지 않는다 | [](source:decide)[](source:draft) |
| 편집이 허락되지 않은 요청 | 제안한 변경만 보여 준다 | [](source:apply) |
| 반영한 뒤 | 바뀐 범위에 resolver를 다시 실행하고 diff, policy chain, 남은 불확실성을 보여 준다 | [](source:apply) |
| staging, commit, push, PR | 사용자가 허락한 범위 안에서만 한다 | [](source:apply) |
| helper 인자 오류(`--repo` 없음, `--list`와 `--scope` 함께 씀) | 오류 메시지를 내고 종료 코드 2로 끝난다. 코드를 읽어 확인했다 | [](source:helper) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 정책 해석기 입출력 — 적용 정책 찾기 · `--list`와 `--scope`의 출력, Windows launcher, 거부되는 symlink·비UTF-8 파일 같은 구현 세부
- 초안 여섯 절의 작성 기준 — 정책 초안 쓰기 · 절마다 무엇을 쓰고 무엇을 쓰지 않는지
- 기존 정책 대조 체크 — 보안 경계 정리 · 낡은 노출 주장, 넓은 제외, 새 표면 같은 어긋남 유형
- 다른 스킬이 정책을 쓰는 방식 — 같은 파일 관계 · 스킬마다 정책을 해석하고 적용하는 문장 비교

@callout level=open-question title="확인하지 못한 것"
| `launch_codex_security_mcp` helper는 인자 처리와 오류 종료 부분만 읽었다. 정책 합성과 symlink 검사 같은 내부 구현은 이 개요가 근거로 삼지 않았다. |
| 정책 작성 때 "threat models, and validated findings"를 어디서 읽는지는 원문에 명시 없음. |

읽은 원본: 텍스트 파일 5개(`SKILL.md`, `agents/openai.yaml`, `security-guidance.md`, helper 일부, `skills/README.md` 일부). 제외: 없음.
