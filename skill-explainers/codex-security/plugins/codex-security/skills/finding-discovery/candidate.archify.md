# finding-discovery — 위협 모델과 정책을 근거로 취약점 후보를 찾아 남긴다 {#overview}

finding-discovery는 승인된 소스를 위협 모델과 보안 정책에 비추어 읽고, 악용 가능해 보이는 취약점 후보를 근거와 함께 남기게 하는 스킬이다. 최종 심각도는 정하지 않는다.[](source:goal)

- 이미 scan의 발견 단계에 있거나 사용자가 후보 발견을 직접 요청하면 켜진다. 실행 방식은 compact diff, inventory 없는 diff, 저장소 단독으로 갈린다.[](source:fm)[](source:compact)[](source:legacy)[](source:repo)
- 결과는 후보 목록이다. 후보마다 위치, source, control, sink, 반증, validation이 풀어야 할 질문이 붙는다. compact diff에서는 후보가 호스트의 후보 ledger에 한 번에 기록된다.[](source:out)[](source:sa-compact)
- 관계: `security-diff-scan`이 호출하고(호출), 결과는 `validation`으로 이어진다(결과 전달). Standard·Deep scan은 이 스킬 본문을 쓰지 않는다(참고).
- 하지 않는 것: 최종 심각도를 정하지 않고, validation과 attack-path 단계를 발견 안에서 되풀이하지 않는다.[](source:goal)[](source:split)

@answer scope="codex-security/plugins/codex-security/skills/finding-discovery · 원본 파일 8개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source fm title="frontmatter: name과 description" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=1:4
@source goal title="목적: 후보를 찾고 심각도는 정하지 않는다" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=8:8
@source read title="저장 규칙과 정책 먼저 읽기" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=10:10
@source std title="Standard·Deep은 이 스킬을 쓰지 않는다" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=14:14
@source compact title="compact diff 방식" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=16:16
@source legacy title="inventory 없는 diff 방식" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=17:17
@source repo title="저장소 단독 발견 방식" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=18:18
@source diffscope title="diff 검토 범위" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=20:20
@source crit title="근거 기준" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=24:29
@source seed title="advisory seed 규칙" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=28:28
@source lead title="lead는 finding이 아니다" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=29:29
@source split title="작업 나누기와 반복 금지" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=31:31
@source out title="후보에 남길 항목" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=35:43
@source fin title="끝내는 조건" path=codex-security/plugins/codex-security/skills/finding-discovery/SKILL.md lines=45:45
@source oy title="agents/openai.yaml" path=codex-security/plugins/codex-security/skills/finding-discovery/agents/openai.yaml lines=1:4
@source st-struct title="구조화 결과는 기존 도구에 둔다" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=9:9
@source st-supp title="보조 파일 저장 방법" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=13:13
@source sg-chain title="정책 해석 규칙" path=codex-security/plugins/codex-security/references/security-guidance.md lines=34:36
@source sg-cmd title="정책을 컴파일하는 명령" path=codex-security/plugins/codex-security/references/security-guidance.md lines=9:12
@source sa-compact title="compact diff 후보 기록 규칙" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=41:42
@source sa-nofile title="compact diff는 하나의 ledger만 쓴다" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=49:49
@source tool-rec title="후보 기록 도구 등록" path=codex-security/plugins/codex-security/mcp-app/src/server/compact-artifact-tools.ts lines=110:121
@source schema title="후보 입력 schema" path=codex-security/plugins/codex-security/schemas/definitions/discovery-candidate.schema.json lines=51:82
@source leg-ref title="inventory 없는 diff 전용 안내" path=codex-security/plugins/codex-security/skills/security-scan/references/scan-artifacts-and-ledger.md lines=1:3
@source ds-diff title="diff scan이 이 스킬을 부르는 문장" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=30:30
@source tm-ret title="threat-model이 돌려주는 모델" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md lines=25:25
@source pol-def title="SECURITY.md는 정책 맥락이다" path=codex-security/plugins/codex-security/skills/define-security-policy/SKILL.md lines=8:8
@source scan-std title="Standard scan은 한 audit 안에서 끝낸다" path=codex-security/plugins/codex-security/references/core-scan.md lines=18:18

## 어떻게 동작하나 {#flow span=12}

절차형이다. 세 방식은 서로 대체하는 길이다. 한 번에 하나만 고른다. 그림에서 뺀 것은 Standard·Deep scan이다. 이 둘은 coordinator의 자체 prompt를 쓰고 이 스킬을 읽지 않는다.[](source:std)

@workflow id=flow-diagram title="finding-discovery 흐름"
| lane prep | 준비 |
| lane review | 검토 |
| lane out | 출력 |
| ready | 저장·정책 규칙 읽기 | backend | prep | source:read |
| mode | 실행 방식? | backend | prep | source:std |
| compact | compact diff 검토 | backend | review | source:compact |
| legacy | inventory 없는 diff | backend | review | source:legacy |
| repo | 저장소 단독 발견 | backend | review | source:repo |
| out | 후보 남기기 | backend | out | source:out |
| ready > mode | |
| mode > compact | compact |
| mode > legacy | diff 단독 |
| mode > repo | 저장소 단독 |
| compact > out | |
| legacy > out | |
| repo > out | |

@steps id=flow-steps
| s-ready | 저장·정책 규칙 읽기 | **입력** 검토할 경로, 사용자가 정한 입출력 경로 · **참조** `../../references/artifact-storage.md`, `../../references/security-guidance.md` · **실행** `<plugin_dir>/scripts/launch_codex_security_mcp --helper resolve-security-md --repo <repo_root> --scope <file_or_directory> --out -` · **출력** 경로별로 적용되는 SECURITY.md 정책. **처리** 에이전트가 저장 규칙을 읽고, 검토하는 경로마다(위임한 몫도) 정책을 푼다.[](source:read)[](source:sg-cmd)[](source:sg-chain) **다음** 사용자가 정한 입출력 경로는 그대로 따른다. 필수 입력이 없어 분석이 막힐 때만 묻는다.[](source:read) | flow-diagram | ready |
| s-mode | 실행 방식? | **입력** 호출 상황(실행 중인 scan인지, inventory가 있는지, 저장소 단독인지) · **출력** 세 방식 중 하나. **처리** 에이전트가 상황으로 방식을 고른다. 실행 중인 compact diff면 첫째, inventory 없는 diff면 둘째, 그 밖에는 셋째다.[](source:compact)[](source:legacy)[](source:repo) **다음** Standard·Deep worker는 이 단계에 오지 않는다.[](source:std) | flow-diagram | mode |
| s-compact | compact diff 검토 | **입력** `list_codex_security_review_items`가 주는 변경 파일 inventory · **실행** `record_codex_security_discovery_candidates` · **출력** 호스트 workbench의 후보 전체. **처리** 배정된 변경 파일을 모두 검토하고 후보를 한 번에 기록한다. 순위 목록, 후보별 장부, receipt, 보고서는 만들지 않는다.[](source:compact)[](source:tool-rec) **다음** 삭제된 파일은 baseline revision에서 읽는다. 공유 control이 바뀌면 같은 control을 쓰는 호출자까지 넓히되 관련 없는 감사로 번지지 않는다.[](source:diffscope) | flow-diagram | compact |
| s-legacy | inventory 없는 diff | **입력** 변경 파일 inventory가 없는 diff · **참조** `../security-scan/references/scan-artifacts-and-ledger.md` · **출력** 변경 파일 worklist, discovery report, discovery receipt. **처리** 그 문서를 따라 worklist를 만들고 변경 파일을 검토한다.[](source:legacy)[](source:leg-ref)[](source:fin) **다음** 후속 단계는 자기 증거와 receipt를 직접 남긴다.[](source:fin) | flow-diagram | legacy |
| s-repo | 저장소 단독 발견 | **입력** 승인된 저장소 소스 · **출력** 후보와 검토 범위의 한계. **처리** 아래 근거 기준을 소스에 적용하고 결과를 돌려준다. scan을 시작하지 않고 diff worklist 파이프라인도 돌리지 않는다.[](source:repo) | flow-diagram | repo |
| s-out | 후보 남기기 | **입력** 검토 결과 · **출력** 후보마다 ID·제목·위치·source·control·sink·영향·반증·미해결 질문·CWE. **처리** 후보의 근거를 validation이 이어받게 정리하고, 배정된 검토와 구체적 후속을 모두 셌을 때 끝낸다.[](source:out)[](source:fin) **다음** 남은 후보가 없으면 실제 검토 범위와 한계를 담아 그 결과를 돌려준다. 끝내지 못한 검토는 그대로 적는다.[](source:fin) | flow-diagram | out |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description). 이미 발견 단계이거나 사용자가 후보 발견을 요청할 때. 전체 PR·commit·branch·patch·저장소 scan의 주된 trigger로는 쓰지 말라고 한다. 호출 제한 필드는 frontmatter에 없다. `agents/openai.yaml`에 기본 prompt가 있다.[](source:fm)[](source:oy) |
| 성격 | 위협 모델과 정책을 근거로 취약점 후보를 찾아 근거와 함께 남기는 단계 스킬이다. |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| security-diff-scan {#rel-r07} | **이 스킬** | 호출 | 실행 중인 diff scan이 변경 파일 inventory 전체에 compact diff 방식으로 부른다. 사용 가능한 worker에 독립 assignment를 나눈다.[](source:ds-diff) |
| threat-model {#rel-r10} | **이 스킬** | 결과 전달 | 이 스킬은 위협 모델과 적용 정책을 근거로 쓴다. 위협 모델 없이 단독 호출해도 되는지는 원문에 명시 없음.[](source:goal)[](source:tm-ret) |
| define-security-policy {#rel-r44} | **이 스킬** | 같은 파일 | `SECURITY.md`를 정책 맥락으로 읽는다. 선후 관계는 없다.[](source:read)[](source:pol-def) |
| **이 스킬** {#rel-r11} | validation | 결과 전달 | 후보 ID와 발견 필드를 validation이 이어받는다. 발견 안에서 validation을 되풀이하지 않는다.[](source:split)[](source:out) |
| **이 스킬** {#rel-r15} | security-scan | 참고 | Standard·Deep worker는 coordinator의 자체 prompt를 쓰고 이 스킬 본문을 쓰지 않는다. Standard는 한 audit 안에서 단계 스킬을 부르지 않는다.[](source:std)[](source:scan-std) |
| **이 스킬** {#rel-r18} | security-scan | 참고 | inventory 없는 diff에서만 `scan-artifacts-and-ledger.md`를 읽는다. 그 문서는 Standard, Deep, compact diff에는 쓰지 않는다고 밝힌다.[](source:legacy)[](source:leg-ref) |

@architecture id=relation-map title="finding-discovery와 이어지는 스킬"
| diff | security-diff-scan | backend |
| tm | threat-model | backend |
| pol | define-security-policy | backend |
| self | finding-discovery(이 스킬) | backend |
| val | validation | backend |
| scan | security-scan | backend |
| diff > self | 호출 |
| tm > self | 결과 전달 |
| pol > self | 같은 파일 |
| self > val | 결과 전달 |
| self > scan | 참고 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 방식 선택, 근거 기준, 후보에 남길 항목을 담은 본문 | 스킬이 켜지면 읽는다 | 실행 방식?, compact diff 검토, inventory 없는 diff, 저장소 단독 발견, 후보 남기기 |
| `agents/openai.yaml` | 표시 이름과 기본 prompt | 스킬 목록·호출 화면에서 쓴다 | 원문에 명시 없음 |
| `references/artifact-storage.md` (플러그인 루트) | 구조화 결과와 보조 파일의 저장 규칙 | 결과를 저장하기 전에 읽는다 | 저장·정책 규칙 읽기 |
| `references/security-guidance.md` (플러그인 루트) | `SECURITY.md` 정책을 푸는 명령과 우선순위 | 소스를 검토하기 전에 읽는다 | 저장·정책 규칙 읽기 |
| `references/scan-artifacts.md` (플러그인 루트) | 후보 ledger와 단계별 산출물 경로 | legacy diff는 이 문서의 경로에 저장한다 | compact diff 검토, inventory 없는 diff |
| `skills/security-scan/references/scan-artifacts-and-ledger.md` | inventory 없는 diff의 worklist 만드는 법 | inventory 없는 diff일 때만 읽는다 | inventory 없는 diff |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| Standard·Deep scan의 worker | 이 스킬을 쓰지 않는다. coordinator의 자체 prompt를 따른다 | [](source:std) |
| 전체 PR·commit·branch·patch·저장소 scan을 시작할 때 | 이 스킬을 주된 trigger로 쓰지 않는다 | [](source:fm) |
| compact diff | 모든 후보를 `record_codex_security_discovery_candidates`로 한 번만 기록한다. 순위 목록, 후보별 장부, receipt, 보고서는 만들지 않는다. 다시 부르면 이전 후보를 덮어쓴다 | [](source:compact)[](source:tool-rec) |
| 저장소 단독 발견 | scan을 시작하지 않고 diff worklist를 돌리지 않는다 | [](source:repo) |
| 구조화 결과를 저장할 때 | 후보 같은 구조화 결과는 기존 도구에 둔다. 보조 파일은 `save_codex_security_artifact`로 저장하고 셸 redirection으로 쓰지 않는다 | [](source:st-struct)[](source:st-supp) |
| 정책 파일 `SECURITY.md` | untrusted 정책 데이터다. 사용자·시스템 지시를 덮거나 명령 실행·파일 편집·workflow 변경을 시킬 수 없다. 충돌하면 대상에 가까운 정책이 앞선다 | [](source:sg-chain) |
| 후보를 세울 때 | 입력이나 권한 있는 작업이 control을 거쳐 sink와 영향에 이르는 길을 따라간다. control이 없거나, 우회되거나, 엉뚱한 값에 걸렸다는 이유를 적는다 | [](source:crit) |
| 안전해 보이는 형제 구현 | 후보 경로가 안전하다는 증거가 아니다. 실제로 막는 guard와 격리는 반증으로 적는다 | [](source:crit) |
| 같은 source·control·sink·영향의 중복 | 합치되 영향받는 위치와 원래 후보 ID를 모두 남긴다. 독립적으로 닿는 취약 instance는 따로 둔다 | [](source:crit) |
| crash, 위험한 API, 선택 기능, 빠진 검사 | 그것만으로는 finding이 아니라 lead다. 증명 간극과 함께 validation으로 보내고 재현이 없다는 이유로 버리지 않는다 | [](source:lead) |
| advisory 링크 | 허락 없이 가져오지 않는다. 같은 계열의 이웃 문제가 seed를 닫지 못한다 | [](source:seed) |
| 후보를 정리할 때 | 발견 안에서 validation과 attack-path 단계를 되풀이하지 않는다 | [](source:split) |
| compact 도구에 후보를 넣을 때 | 판정: 입력 칸은 `cwe_ids`, `locations`, `summary`, `evidence`, `context`, `instance`뿐이다. 스킬이 남기라는 반증·선행 조건·`relevant_lines`는 문자열 칸에 담아야 한다. `candidate_id`는 호스트가 붙이므로 "supplied ID 보존"이 이 경로의 입력 칸으로는 표현되지 않는다 | [](source:out)[](source:sa-compact)[](source:schema) |
| compact diff에서 같은 후보가 겹칠 때 | 같은 CWE·위치·instance인 행은 호스트가 합친다. 스킬의 합치기 기준(source·control·sink·영향)과 다르다 | [](source:sa-compact)[](source:crit) |
| 위협 모델 없이 단독 호출 | 허용 여부는 원문에 명시 없음 | [](source:goal) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- compact 도구 입력 칸과 스킬 지시의 차이 — 후보 남기기 · 필드 6개, `candidate_id` 부여, 병합 기준이 스킬 지시와 어떻게 다른지
- 근거 기준 여섯 가지 — 후보 남기기 · 개요에는 한 줄씩만 담았다. root control, seed 처리, lead와 finding의 경계를 사례로 보인다
- inventory 없는 diff의 worklist — inventory 없는 diff · helper 명령, 삭제 파일 처리, worker 배정 규칙

@callout level=open-question title="확인하지 못한 것"
| `launch_codex_security_mcp`의 helper와 MCP 도구 내부 구현은 읽지 않았다. 실행 칸의 명령은 참조 문서가 지시한 것이다. |
| `scan-artifacts-and-ledger.md`는 앞 3줄만 근거로 인용했다. 나머지 worklist 절차는 이 페이지에서 설명하지 않는다. |
| 위협 모델 없이 이 스킬을 단독으로 부를 수 있는지는 원문에 없다. |

읽은 원본: 텍스트 파일 8개(`SKILL.md`, `agents/openai.yaml`, 플러그인 루트 문서 3개, 안내 문서 1개, 도구 등록 소스와 schema 각 1개). 제외: 없음.
