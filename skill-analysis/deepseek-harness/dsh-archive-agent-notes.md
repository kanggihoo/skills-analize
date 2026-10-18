# dsh-archive-agent-notes 분석

## 1. 개요

- 원본 경로: `/Users/kkh/Desktop/skills-analize/deepseek-harness/dsh-archive-agent-notes/`
- 컬렉션: deepseek-harness
- 읽은 파일 전체 (디렉터리 재귀 조사 결과 파일은 1개뿐)

| 파일 | 크기 | 줄 수 | 역할 |
|---|---|---|---|
| `SKILL.md` | 6721 바이트 | 68줄 | 유일한 파일. 스킬 본문 전체 |

- 보조 파일: `references/`, `scripts/`, `templates/`, `assets/` 디렉터리 모두 존재하지 않음. 하위 `*.md` 없음.
- 본문이 링크로 가리키지만 이 디렉터리에는 없는 외부 문서(읽지 않음, 이 스킬 폴더 밖):
  - `../../notes/README.md` (Agent Note rules, 앵커 `#when-to-write-one`)
  - `../../notes/archived/AGENTS.md` (archive instructions)
  - `../dsh-pre-push-checks/SKILL.md` (형제 스킬)
  - "applicable active lifecycle instructions" (경로 명시 없음)
- 성격 한 줄: **감사(audit) + 계획(planning)** 성격의 분류 스킬이면서, 마지막에 파일 이동·삭제·해시 봉인까지 수행하는 **정리(pruning) 실행** 스킬. 생성·검증·라우팅 중 어느 하나로 순수하게 분류되지는 않음. 새 노트 작성 시에는 "supersession 검사"라는 감사 단계를 끼워 넣는다.
- 원문 자기 규정:
  > Reduce the active decision corpus without erasing history that can still guide work. Judge every note semantically; word count and age are discovery aids, never archive criteria. (`SKILL.md:8`)
- 대상 객체: deepseek-harness 저장소의 "Agent Note". 각 노트는 `foo.md`, `foo.zh.md`, `foo.i18n.yaml` 세 파일 묶음(triplet)이며 `implemented/<kind>/`, `archived/<kind>/` 같은 수명주기 디렉터리에 놓인다 (`SKILL.md:56`).

## 2. 활성화 조건 (언제 켜지는가)

### 2.1 frontmatter `description` 전문
> Use when adding, auditing, pruning, archiving, restoring, or reviewing Agent Notes in deepseek-harness; checks every new note for superseded active records, deletes small UI and purely mechanical records, classifies other implemented notes by future decision value, deletes rejected notes that no longer prevent a tempting fallacy, and applies the frozen archived/{kind} triplet and manifest rules. (`SKILL.md:3`)

트리거 동사: adding / auditing / pruning / archiving / restoring / reviewing. 대상: "Agent Notes in deepseek-harness".

### 2.2 매칭되는 사용자 발화 예시 (description 동사에서 추출)
1. "새 Agent Note 하나 추가할게. 기존 notes랑 겹치는 거 있는지 봐줘." (adding)
2. "deepseek-harness의 implemented notes 전체 audit 해줘." (auditing)
3. "active notes 너무 많아. pruning 좀 하자." (pruning)
4. "이 implemented triplet을 archived로 옮겨줘." (archiving)
5. "archived로 보낸 노트를 다시 active로 복원해야 해." (restoring) — 단, 본문에는 복원 절차가 없음 (8장 참조)
6. "이 PR에서 바뀐 Agent Notes 리뷰해줘." (reviewing)
7. "rejected 노트 중 지워도 되는 것 골라줘." (description의 "deletes rejected notes")
8. "verify-archived-agent-notes 가 실패하는데 확인해줘." (description의 "manifest rules")

위 발화는 description의 동사·명사에서 추출한 것이며, 원문에 발화 예시 목록 자체는 `원문에 명시 없음`.

### 2.3 의도적으로 배제되는 발화와 넘길 스킬
- 본문에 "이 요청이면 다른 스킬로 가라"는 명시적 라우팅 규칙은 `원문에 명시 없음`.
- 유일한 형제 스킬 참조: 검증 증거 선택에 한해
  > select any additional evidence through [dsh-pre-push-checks](../dsh-pre-push-checks/SKILL.md). (`SKILL.md:66`)
  이는 배제 규칙이 아니라 후속 위임.
- description이 "in deepseek-harness"로 범위를 한정하므로 다른 저장소의 노트·문서 정리는 범위 밖임이 문면상 드러남. 그 경우 넘길 스킬은 `원문에 명시 없음`.

### 2.4 `name` / `description` 외 필드
- frontmatter 필드는 `name`, `description` 2개뿐 (`SKILL.md:1-4`).
- `allowed-tools`: 없음. `model`: 없음. `metadata`: 없음. 기타 필드 없음.

## 3. 적합 / 부적합

(이 섹션은 원문에서 읽히는 적용 범위만 기술하고, 가치 판단은 8장으로 미룬다.)

### 3.1 적합 (원문이 전제하는 상황)
- deepseek-harness 저장소 안에서 `notes/` 아래 Agent Note 코퍼스를 관리하는 작업. 근거: 읽어야 할 계약이 `../../notes/README.md`, `../../notes/archived/AGENTS.md`에 있다고 박혀 있음 (`SKILL.md:12`).
- 새 노트를 쓰는 PR: "Every new Agent Note triggers a scoped audit of active notes covering the same decision, mechanism, or rejected alternative." (`SKILL.md:16`)
- implemented 상태 노트가 쌓여 active 코퍼스를 줄여야 하는 시점. 근거: "Reduce the active decision corpus" (`SKILL.md:8`)
- 노트가 `foo.md` / `foo.zh.md` / `foo.i18n.yaml` 3종 세트로 존재하고, `pnpm run verify-archived-agent-notes` 및 `doc-sync` 스크립트가 있는 저장소.

### 3.2 부적합
- Agent Note 체계(위 triplet, `archived/{kind}` 디렉터리, 매니페스트)가 없는 저장소: 본문 전 단계가 이 구조에 결박되어 있음. 이 경우의 대체 동작은 `원문에 명시 없음`.
- 이미 archived로 봉인된 노트의 수정: "After the triplet is sealed, never edit, move, translate, reformat, or delete it." (`SKILL.md:62`) 이므로 봉인 후 변경 목적의 사용은 불가.
- 일반 문서 정리(README, 설계문서 등): description이 "Agent Notes"로 한정. 그 외 문서는 `원문에 명시 없음`.

### 3.3 형제 스킬 대신 이걸 고르는 판정 기준 한 줄
- 컬렉션에 존재가 확인된 형제는 `dsh-pre-push-checks` 하나(링크). 판정 기준: 변경 대상이 코드 검증 일반이면 `dsh-pre-push-checks`, 변경 대상이 "Agent Note의 추가/분류/삭제/아카이브"이면 이 스킬. 이 기준은 description과 `SKILL.md:66`에서 도출한 것이며 원문에 한 줄 규칙으로 명시되어 있지는 않다(`원문에 명시 없음`).

## 4. 전제 조건과 외부 의존성

### 4.1 실행 스크립트·런타임
- 이 스킬 디렉터리 안에 실행 스크립트: 없음 (`scripts/` 부재).
- 본문이 호출하라고 지시하는 저장소 측 명령 (스킬 외부에 존재해야 함):
  - `pnpm run verify-archived-agent-notes --write` (`SKILL.md:60`)
  - `pnpm run verify-archived-agent-notes` (`SKILL.md:66`)
  - "the archive verifier's focused test" — 명령어 이름은 `원문에 명시 없음` (`SKILL.md:66`)
  - `pnpm run doc-sync` (`SKILL.md:66`)
  - `pnpm run lint` (`SKILL.md:66`)
  - `git diff --check` (`SKILL.md:66`)
- 런타임/패키지 매니저: `pnpm` (Node 버전 등은 `원문에 명시 없음`).
- 기타 CLI: `git` (diff --check, 그리고 "same PR" 언급으로 PR 흐름 전제). `gh`, docker, playwright 등은 `원문에 명시 없음`.

### 4.2 API 키·환경변수·네트워크
- API 키, 환경변수, 네트워크: 원문에 요구 언급 없음 → 불필요(`원문에 명시 없음`).

### 4.3 리포지토리 전제
| 전제 | 원문 근거 |
|---|---|
| 노트 규칙 문서 | `../../notes/README.md` (`SKILL.md:12`) |
| 아카이브 지침 | `../../notes/archived/AGENTS.md` (`SKILL.md:12`) |
| 수명주기 디렉터리 | `implemented/<kind>/`, `archived/<kind>/` (`SKILL.md:56`) |
| 사이드카 해시 파일 | `foo.i18n.yaml`에 해시 기록 (`SKILL.md:58`) |
| 아카이브 검증기(봉인 매니페스트) | `verify-archived-agent-notes` (`SKILL.md:60`) |
| 문서 동기화 검사 | `pnpm run doc-sync` (`SKILL.md:66`) |
| 린터 | `pnpm run lint` (`SKILL.md:66`) |
| PR 흐름 | "in the same PR" (`SKILL.md:16`) |
| 추가 증거 선택 | `dsh-pre-push-checks` 스킬 (`SKILL.md:66`) |

- 테스트 러너: "the archive verifier's focused test"라고만 언급, 러너 이름 `원문에 명시 없음`.
- CI, 타입 시스템, 브랜치 전략, 커밋 권한: `원문에 명시 없음` (커밋 자체를 지시하는 문장 없음).
- 현재 코드·설정·패키지 문서·생성 카탈로그·더 새로운 Agent Note·inbound link를 증거로 쓰므로 저장소 읽기 권한 필요 (`SKILL.md:12`).

### 4.4 비용 발생 지점
- 유료 API, CI 분: `원문에 명시 없음`.
- 토큰: 모든 노트를 읽도록 강제 — "Inspect every note in scope" (`SKILL.md:29`). 노트 수·크기가 원문에 없으므로 규모는 `원문에 명시 없음`.

### 4.5 상태 파일·산출물 디렉터리
- 이 스킬이 새로 만드는 `plan.md`, `TODO`, `.claude/` 류 상태 파일: `원문에 명시 없음`.
- 변경되는 저장소 경로:
  - `notes/.../implemented/<kind>/foo.{md,zh.md,i18n.yaml}` → `notes/.../archived/<kind>/` 로 이동 (`SKILL.md:56`)
  - 아카이브 봉인 해시 매니페스트: `--write`가 갱신 ("adds only the new triplet hashes", `SKILL.md:60`). 매니페스트 파일 경로는 `원문에 명시 없음`.
  - `foo.i18n.yaml` 내부 해시 (`SKILL.md:58`).

## 5. 워크플로우

원문은 명시적 단계 번호가 있는 부분(아카이브 5단계)과 절(section) 단위 흐름으로 구성. 전체를 절 순서로 정리한다.

### 5.0 절 순서
1. `## Read the contracts` (`SKILL.md:10-12`)
2. `## Check supersession when adding a note` (`SKILL.md:14-16`)
3. `## Classify by future value` (`SKILL.md:18-29`)
4. `## Calibrated examples` (`SKILL.md:31-52`)
5. `## Archive one implemented triplet` (`SKILL.md:54-62`)
6. `## Validate and report` (`SKILL.md:64-68`)

"run in order", "do not skip" 류의 전체 순서 강제 문구: `원문에 명시 없음`. 단 개별 순서 제약은 있음:
- "Read ... before classifying." (`SKILL.md:12`) — 읽기 → 분류.
- "Before drafting, apply the creation criteria." (`SKILL.md:16`)
- "Apply this criterion before keep/archive classification." (`SKILL.md:22`) — 삭제 판정 → keep/archive 판정.
- "Run the normal verifier afterward." (`SKILL.md:60`)

### 5.1 단계 A — 계약 읽기 (비게이트)
- 입력: 대상 노트 범위.
- 행동: README 규칙, archived/AGENTS.md, 해당 active 수명주기 지침을 읽는다. 현재 코드, 설정, 패키지 문서, 생성 카탈로그, 더 새로운 Agent Note, inbound link로 "rationale가 아직 무언가를 소유하거나 제약하는지" 확인.
  > Use current code, configuration, package docs, generated catalogs, newer Agent Notes, and inbound links to establish whether a rationale still owns or constrains anything. (`SKILL.md:12`)
- 출력: 분류 근거.
- 통과 조건: 명시 없음.

### 5.2 단계 B — 새 노트 추가 시 supersession 검사 (게이트성)
- 입력: 새로 쓰려는 노트 초안.
- 행동 순서:
  1. "Before drafting, apply the creation criteria" — README의 `#when-to-write-one` 기준 적용 (`SKILL.md:16`). 기준에 미달 시 쓰지 않는다는 문장은 이 파일에는 없음; 기준 본문은 외부 문서.
  2. 같은 decision / mechanism / rejected alternative를 다루는 active 노트를 범위 한정 감사.
  3. 완전/부분 supersession 각각 분류:
     - 완전: "archive qualifying implemented triplets in the same PR"
     - 부분 또는 독립적으로 유용한 rationale: "retain and cross-link"
     - 낡은 proposal: "reject obsolete proposals"
     - 더 이상 실수를 막지 못하는 rejected: "delete rejected notes that no longer prevent a plausible mistake"
  4. 새 소유자가 모든 고유 명제를 흡수하면 "Agent Note consolidation rule" 적용 (규칙 본문은 외부, `원문에 명시 없음`).
- 금지: "do not defer a known match to a later corpus audit." (`SKILL.md:16`)
- 출력: 같은 PR 내 아카이브/삭제/상호링크/reject 변경.
- 통과 조건: 알려진 매칭이 같은 PR에서 모두 처리됨.
- 탈락 시 행동: 원문에 "탈락" 개념 없음. 대신 미처리 매칭을 나중으로 미루는 것이 금지됨.

### 5.3 단계 C — 미래 가치에 따른 분류 (판정 단계, 6갈래)
판정 순서는 "삭제 기준 먼저" (`SKILL.md:22`). 결과 표:

| 수명주기 상태 | 판정 | 조건 (원문) | 후속 동작 |
|---|---|---|---|
| Implemented | **delete** | "complete triplets that only describe small UI adjustments or purely mechanical changes" | inbound link "repair or remove" |
| Implemented | **keep active** | "rationale, alternatives, negative guarantees, durable/wire semantics, ownership boundary, security rule, or reintroduction condition is likely to guide a future change" | 유지 |
| Implemented | **archive** | "substantive historical decision ... complete and unlikely to guide future work, but its historical rationale still warrants preservation" | 5.5의 5단계 절차 |
| Proposed | **never archive** | 살아있는 proposal | 가치 없으면 "reject it with an honest reason and satisfy the rejected lifecycle format" |
| Rejected | **keep (guardrail)** | "the losing proposal remains a tempting, meaningful mistake and the note explains why it loses" | 유지 |
| Rejected | **delete** | "obsolete, superseded, no longer plausible, or unlikely to prevent re-litigation" | 전체 triplet 삭제, inbound link 수리/삭제 |

삭제 제외 조항(어떤 것이 "implemented → delete"가 아닌가):
> Local bug fixes, performance changes, new capabilities, and substantive behavior or ownership decisions do not qualify merely because they are implemented. (`SKILL.md:22`)

keep의 보충 조항:
> Classify the decision, not the mechanics of its implementation: a mechanical rename or type extraction can still record lasting naming, compatibility, or ownership rules. Length does not matter. (`SKILL.md:23`)

archive 제외 조항: "Do not archive records that meet the direct-deletion criterion." (`SKILL.md:24`)

범위·태도 규칙 (`SKILL.md:29`):
> Do not archive toward a quota. Inspect every note in scope, classify analogous groups under one principle, use best judgment for close cases, and record genuinely borderline decisions for the handoff.

### 5.4 단계 D — 보정 예시 (비게이트, 기준 보정용)
`SKILL.md:33`: "These examples set the bar; the word counts demonstrate that size is not the test."

| 판정 | 노트 | 단어 수 | 이유 (원문) |
|---|---|---|---|
| Delete (implemented) | collapsed sidebar control rail | 533 | closed, minor UI behavior |
| Delete (implemented) | issue-policy module ownership | 원문에 명시 없음 | completed function relocation and import rewiring with unchanged behavior |
| Keep (implemented) | event-sourced sessions | 248 | foundational authority and durability boundary |
| Keep (implemented) | single Harness-home resolver | 596 | cross-product ownership rule |
| Keep (implemented) | project session directories | 628 | durable storage and identity policy |
| Keep (implemented) | parallel pre-push gates | 400 | borderline, but still guides gate scheduling and resource tuning |
| Keep (implemented) | dropped image content block | 334 | keep until multimodal support lands, because it states the coordinated reintroduction condition |
| Keep (rejected) | folding the compaction package split | 426 | the temptation to merge the packages remains meaningful |
| Delete (rejected) | streaming workflow progress through tool calls | 972 | its ACP/UI premise is obsolete |
| Delete (rejected) | dropping ACP terminal metadata | 362 | the later automation-only ACP decision resolved the question |

### 5.5 단계 E — implemented triplet 하나 아카이브 (5단계, 번호 순서)
(`SKILL.md:56-60`)

| # | 입력 | 행동 | 출력 | 통과 조건 |
|---|---|---|---|---|
| 1 | `implemented/<kind>/foo.{md,zh.md,i18n.yaml}` | 세 파일을 통째로 `archived/<kind>/` 로 이동. "`implemented` is deliberately absent from the archive path." | `archived/<kind>/foo.*` | 3개 모두 이동 |
| 2 | 이동된 `foo.md`, `foo.zh.md` | 본문 수정 금지. `Status: implemented` 바로 아래에 `Archived: YYYY-MM-DD` 한 줄만 삽입. 두 언어 파일 동일 날짜 | 메타데이터 한 줄 추가 | 두 파일에 같은 날짜 |
| 3 | 사이드카 `foo.i18n.yaml` | 두 메타데이터 편집분에 대해 해시를 기계적으로 재기록. 번역·재서식·사실 갱신·링크 수리 금지 | 갱신된 해시 | 해시 일치 |
| 4 | active prose의 inbound link | 현재 권위 문서로 redirect / 역사적 스냅샷을 의도적으로 인용할 때만 archived 경로로 retarget / 삭제. "Never verify or repair links out of the archived note." | 정리된 링크 | active 쪽에 깨진 링크 없음 |
| 5 | 저장소 | `pnpm run verify-archived-agent-notes --write` 실행, 이후 일반 verifier 실행 | 매니페스트에 새 triplet 해시 추가 | 검증기 통과 |

**게이트 (탈락 가능):** 5단계의 검증기.
> Its append-only mode first proves every existing seal still matches, then adds only the new triplet hashes. (`SKILL.md:60`)
기존 봉인 중 하나라도 불일치하면 `--write`가 어떻게 동작하는지(중단/오류 코드)는 `원문에 명시 없음`. 탈락 시 에이전트가 해야 할 일도 `원문에 명시 없음`.

3단계의 보존 규정:
> Existing title punctuation, blank-line layout, and language-switcher wording are preserved, not prerequisites for archival. (`SKILL.md:58`)

봉인 후 불변 규칙:
> After the triplet is sealed, never edit, move, translate, reformat, or delete it. Archived notes remain valid inbound-link targets but are historical snapshots, not authority for current behavior. (`SKILL.md:62`)

### 5.6 단계 F — 검증과 보고 (게이트 + 보고)
(`SKILL.md:66-68`)

- 실행 목록 (게이트, 실패 가능):
  1. archive verifier의 focused test
  2. `pnpm run verify-archived-agent-notes`
  3. `pnpm run doc-sync`
  4. `pnpm run lint`
  5. `git diff --check`
  6. "select any additional evidence through dsh-pre-push-checks"
- 위 6개 실행 순서의 강제 문구는 `원문에 명시 없음` (나열만 됨).
- 실패 시 재시도 상한, 타임아웃: `원문에 명시 없음`.
- 보고 항목:
  > Report active implemented notes kept, implemented notes deleted or archived, rejected notes kept/deleted, proposed notes rejected if any, and every genuinely borderline case with its word count and chosen outcome. Do not claim archived outbound links are valid: the archive verifier intentionally never checks them.

### 5.7 루프 구조
```
[새 노트 추가?] --yes--> supersession 감사 --> 동일 PR 안에서 archive/retain/reject/delete
        |
        v
[범위 내 노트 전수 검사]
   각 노트 --> (implemented?) 삭제 기준 먼저 --> keep / archive
          --> (proposed?)    keep active 또는 honest reject
          --> (rejected?)    guardrail이면 keep, 아니면 delete
   --> archive 대상: 5단계 절차 --> verify --write --> verify
   --> 검증 6종 --> 보고
```

- 재시도 상한, 수렴 조건: `원문에 명시 없음`.
- red-green-refactor 류 루프: 없음.

### 5.8 사람 개입 지점
- 명시적 승인 요청, 질문 라운드: `원문에 명시 없음`.
- 사람에게 넘기는 유일한 지점: "record genuinely borderline decisions for the handoff" (`SKILL.md:29`) 및 보고 시 borderline 사례를 단어 수와 선택 결과와 함께 나열 (`SKILL.md:68`). 삭제·이동 실행 전 사람의 사전 승인 절차는 원문에 없음.

## 6. 엔지니어링 규칙 분석

### 6.1 금지 규칙 (anti-pattern)
| # | 원문 | 막으려는 실패 모드 |
|---|---|---|
| 1 | "word count and age are discovery aids, never archive criteria." (`SKILL.md:8`) | 길이·연식 기반 기계적 아카이브로 가치 있는 결정 소실 |
| 2 | "Do not archive toward a quota." (`SKILL.md:29`) | 감사 목표 수치 채우기 |
| 3 | "do not defer a known match to a later corpus audit." (`SKILL.md:16`) | 중복·대체 노트의 방치 누적 |
| 4 | "Do not archive records that meet the direct-deletion criterion." (`SKILL.md:24`) | 지워야 할 것을 archived에 쌓아 보존 비용 증가 |
| 5 | "Proposed — never archive" (`SKILL.md:25`) | 살아있는 proposal의 사장 |
| 6 | "Make no body edits." (`SKILL.md:57`) | 봉인 전 본문 변경으로 역사 왜곡 |
| 7 | "Do not translate, reformat, update facts, or repair links inside the note." (`SKILL.md:58`) | 아카이브 본문 오염, 해시 불일치 |
| 8 | "Never verify or repair links out of the archived note." (`SKILL.md:59`) | 스냅샷 변조 |
| 9 | "never edit, move, translate, reformat, or delete it." (`SKILL.md:62`) | 봉인 후 변경 |
| 10 | "Do not claim archived outbound links are valid" (`SKILL.md:68`) | 검증기가 보지 않는 영역에 대한 거짓 보증 |
| 11 | implemented라는 이유만으로 삭제 금지: "Local bug fixes, performance changes, new capabilities, and substantive behavior or ownership decisions do not qualify merely because they are implemented." (`SKILL.md:22`) | 구현 완료를 곧 가치 소멸로 오인 |
| 12 | 구현 메커니즘이 아니라 결정을 분류: "Classify the decision, not the mechanics of its implementation" (`SKILL.md:23`) | 기계적 변경에 담긴 명명/호환/소유 규칙 소실 |

### 6.2 강제 규칙과 수치·임계값 (표)
| 항목 | 값 | 출처 |
|---|---|---|
| triplet 구성 파일 수 | 3 (`foo.md`, `foo.zh.md`, `foo.i18n.yaml`) | `SKILL.md:56` |
| 삽입 메타데이터 줄 수 | 1 (`Archived: YYYY-MM-DD`), 양 언어 파일 동일 날짜 | `SKILL.md:57` |
| 삽입 위치 | `Status: implemented` 바로 아래 | `SKILL.md:57` |
| 아카이브 절차 단계 수 | 5 | `SKILL.md:56-60` |
| 검증 명령 수 | 5개 명시 + 추가 증거 1항 | `SKILL.md:66` |
| 단어 수 임계값(아카이브/삭제 기준) | 없음 — "never archive criteria" | `SKILL.md:8` |
| 연식 임계값 | 없음 | `SKILL.md:8` |
| 아카이브 quota | 없음 — "Do not archive toward a quota." | `SKILL.md:29` |
| 재시도 횟수 / 타임아웃 / 커버리지 % / 함수 길이 / 커밋 단위 | `원문에 명시 없음` | — |

예시에 등장하는 단어 수(533, 248, 596, 628, 400, 334, 426, 972, 362)는 임계값이 아니라 "size is not the test"를 보이는 보정 값이다 (`SKILL.md:33`). 이 중 최솟값 248(keep)과 최댓값 972(delete)가 서로 반대 판정이라는 점이 원문 의도.

### 6.3 검증 방식
- 아카이브 무결성: **해시 기반 기계 검증** (`verify-archived-agent-notes`가 기존 봉인 전체 재증명 후 새 해시만 추가, `SKILL.md:60`).
- 문서 일관성: `doc-sync` (검사 내용은 `원문에 명시 없음`).
- 코드 품질: `lint`, `git diff --check`.
- 분류 정확성(keep/archive/delete 판정 자체): 기계 검증 수단 없음. 근거는 에이전트의 의미 판단("Judge every note semantically", `SKILL.md:8`)과 현재 코드·설정·newer notes·inbound links 대조 (`SKILL.md:12`). 즉 분류 정확성 판정은 사실상 에이전트 자기 판단이며, 최종 보고서의 borderline 목록으로 사람이 사후 확인하는 구조.
- 아카이브된 노트의 outbound link: 검증기가 의도적으로 검사하지 않음 (`SKILL.md:68`).

### 6.4 도구 사용 규칙
- 지정 도구: `pnpm run ...` 스크립트 4종, `git diff --check`, 필요시 `dsh-pre-push-checks`.
- "검색" 지시: "Search for inbound links from active prose." (`SKILL.md:59`) — 도구(grep 등) 지정은 `원문에 명시 없음`.
- 금지 도구: `원문에 명시 없음`.
- 파일 이동·삭제에 사용할 명령(`git mv` 등): `원문에 명시 없음`.
- 해시 재기록은 수동 계산이 아니라 `--write` 모드로 "mechanically" 수행 (`SKILL.md:58,60`).

### 6.5 컨텍스트·토큰 규율
- 읽기 범위: "Inspect every note in scope" (`SKILL.md:29`) — 전수. 사전 규칙 문서 3종 읽기 (`SKILL.md:12`).
- 서브에이전트 위임, 요약·압축 지시: `원문에 명시 없음`.
- 유사 노트는 묶어서 같은 원칙으로: "classify analogous groups under one principle" (`SKILL.md:29`).

### 6.6 모호어의 조작적 정의
| 모호어 | 원문 환산 |
|---|---|
| "small UI adjustments" | 예시: collapsed sidebar control rail (533 words) — "closed, minor UI behavior". 일반 환산 규칙(줄 수·화면 수 등)은 `원문에 명시 없음` |
| "purely mechanical changes" | 예시: issue-policy module ownership — "completed function relocation and import rewiring with unchanged behavior". 단서: 기계적 rename도 "lasting naming, compatibility, or ownership rules"를 기록할 수 있음 |
| "substantive historical decision" | 정의 없음. 삭제 대상이 아닌 implemented라는 부정형 정의만 존재 |
| "unlikely to guide future work" | 수치·검사 항목 없음. keep 조건 목록(rationale, alternatives, negative guarantees, durable/wire semantics, ownership boundary, security rule, reintroduction condition)에 해당하지 않음으로 간접 정의 |
| "tempting, meaningful mistake" | 예시: compaction package split 병합 유혹 |
| "obsolete" | 예시: ACP/UI premise 소멸, 후속 automation-only ACP decision이 해결 |
| "borderline" | 예시: parallel pre-push gates (400 words) |
| "close cases" | 정의 없음 ("use best judgment") |
| "done" (완료) | 검증 5종 통과 + 보고서 제출로 해석되나 "done"이라는 단어 정의는 `원문에 명시 없음` |

## 7. 산출물

### 7.1 최종 결과물의 형태
- 저장소 변경(파일 이동·삭제, 메타데이터 한 줄 삽입, 해시 갱신, inbound link 수정)과 **보고문** 두 가지.
- 보고문 필수 항목 (`SKILL.md:68`):
  1. active implemented notes kept
  2. implemented notes deleted or archived
  3. rejected notes kept/deleted
  4. proposed notes rejected (if any)
  5. 모든 genuinely borderline 사례 — 단어 수와 선택한 결과 포함
  6. archived outbound links가 유효하다고 주장하지 말 것
- 보고 포맷(마크다운 표, 템플릿 등)을 강제하는 템플릿: `원문에 명시 없음`. 위 항목 나열만 있음.

### 7.2 커밋·PR·브랜치
- 커밋/푸시/브랜치 생성 지시: `원문에 명시 없음`.
- PR 언급: 새 노트 추가 시 "archive qualifying implemented triplets in the same PR" (`SKILL.md:16`) — 같은 PR에 묶으라는 요구.
- 커밋 메시지 형식, PR 본문 형식: `원문에 명시 없음`.

### 7.3 파괴적 동작
| 동작 | 근거 | 되돌림 수단 |
|---|---|---|
| implemented triplet 전체 삭제 | `SKILL.md:22` | 원문 언급 없음 (git 이력은 저장소 속성이며 원문에 명시 없음) |
| rejected triplet 전체 삭제 | `SKILL.md:27` | 위와 동일 |
| triplet 이동 | `SKILL.md:56` | 봉인 후 이동 금지 (`SKILL.md:62`) |
| 봉인된 매니페스트에 해시 추가 | `SKILL.md:60` | append-only |
| inbound link 삭제 | `SKILL.md:27,59` | `원문에 명시 없음` |
| force push, DB 마이그레이션 | 해당 없음 (`원문에 명시 없음`) | — |

- 삭제는 사용자 확인 절차 없이 기술되어 있음 (확인 지시 `원문에 명시 없음`).
- 복원(restoring)은 description에 나열되었으나 본문에 복원 절차 섹션은 없음 (`원문에 명시 없음`). 단 봉인 후 "move"가 금지(`SKILL.md:62`)이므로 archived에서 active로의 이동과 문면상 충돌하는 지점이 있다.

## 8. 주의점 / 한계 (여기서만 평가)

### 8.1 오작동·과잉작동 시나리오
1. **과잉 삭제.** "Implemented — delete"는 확인 절차 없이 triplet 전체 삭제를 허용한다. "small UI" 및 "purely mechanical"의 경계가 예시 2개(533 words 사이드바, issue-policy 모듈 이동)에만 의존하므로, 에이전트가 리네임·타입 추출을 기계적이라고 보고 삭제하면 `SKILL.md:23`이 경고한 "lasting naming, compatibility, or ownership rules"를 잃는다. 삭제 판정이 archive보다 먼저 적용되도록 지정(`SKILL.md:22`)되어 있어 오판 시 보존 단계로 가지 못한다. 삭제는 봉인도 해시도 없는 비가역 동작에 가깝다.
2. **supersession 감사의 범위 팽창.** "Every new Agent Note triggers a scoped audit"인데 "scoped"의 경계(어떤 검색으로 겹침을 찾는가)가 정의되지 않았다. 에이전트가 너무 좁게 보면 매칭을 놓치고, 넓게 보면 새 노트 한 건당 코퍼스 전수 감사가 된다. 동시에 "do not defer a known match"는 놓친 매칭에 대한 책임을 모호하게 만든다.
3. **봉인된 노트와 복원 요구의 충돌.** description은 "restoring"을 활성화 조건으로 내세우지만 본문에는 복원 절차가 없고, "never edit, move, translate, reformat, or delete it"(`SKILL.md:62`)와 정면으로 부딪힌다. 이 상황에서 에이전트가 임의로 이동·수정하면 검증기 실패를 만든다.
4. **분류 오류의 은닉.** 분류의 정답성은 기계 검증이 안 되므로 에이전트가 borderline을 보고서에 적지 않고 넘기면 사람이 알 방법이 없다. 보고 항목은 있으나 보고 누락을 막는 장치는 없다.
5. **복수 노트 일괄 처리 시 유사성 편향.** "classify analogous groups under one principle"(`SKILL.md:29`)는 일관성을 주지만 그룹 내 예외 한 건이 동일하게 삭제될 위험이 있다.

### 8.2 다른 스킬·CLAUDE.md 규칙과의 충돌 가능 지점
- 저장소의 일반 "삭제 전 확인" 규칙이나 CLAUDE.md의 파괴적 동작 승인 규칙이 있으면, 이 스킬의 무확인 triplet 삭제와 충돌한다 (해당 CLAUDE.md는 이 분석 범위 밖, 존재 여부 `원문에 명시 없음`).
- `../../notes/archived/AGENTS.md`와 본문이 겹치는 규칙(봉인, 무편집)을 이중으로 기술한다. 두 문서가 어긋날 때 우선순위는 `원문에 명시 없음`.
- 검증 증거 선택을 `dsh-pre-push-checks`로 넘기는데 그 스킬의 요구와 이 스킬의 6종 검증 목록이 중복·충돌하는지는 이 스킬 단독으로 확인 불가.

### 8.3 검증 공백
- 분류(keep/archive/delete) 정확성에 대한 자동 검증 없음. 해시 검증기는 "변조되지 않았음"만 증명하고 "아카이브가 적절했음"은 증명하지 않는다.
- 삭제된 triplet의 inbound link 잔존 여부를 확인하는 명시적 검증 단계가 없다. `doc-sync`가 이를 잡는지는 `원문에 명시 없음`.
- archived outbound link는 "intentionally never checks"(`SKILL.md:68`). 의도된 공백이며 보고서에 주장 금지로 명시했다.
- 한국어/영어 두 언어 파일 외 다른 언어 또는 `i18n.yaml`의 구조 검증은 `원문에 명시 없음`.
- 단계 F의 6개 검증이 실패했을 때의 처리(롤백, 재시도)가 없다.
- "focused test"의 정확한 명령이 적혀 있지 않아 에이전트가 찾아야 한다.

### 8.4 유지보수 리스크
- 하드코딩된 상대 경로: `../../notes/README.md`, `../../notes/archived/AGENTS.md`, `../dsh-pre-push-checks/SKILL.md`, 앵커 `#when-to-write-one`. 디렉터리 이동·헤더명 변경 시 끊긴다.
- 하드코딩된 스크립트명: `verify-archived-agent-notes`, `doc-sync` 및 `--write` 플래그.
- 보정 예시가 특정 노트 제목(collapsed sidebar control rail 등)과 단어 수에 고정되어 있어 해당 노트가 삭제·변경되면 예시가 허공에 뜬다. 실제로 예시 중 삭제 대상으로 든 노트는 이 스킬을 따르면 사라진다.
- 모델명, 도구 버전 하드코딩: 없음.
- 외부 규칙(README) 변경에 본문이 동기화되는 장치 없음.

### 8.5 한 줄 판정
**조건부 도입.** deepseek-harness의 Agent Note 구조·검증 스크립트가 갖춰진 저장소에서만 가치가 있고, 근거는 분류 기준이 의미 판단 중심으로 정교하게 작성되어 있으나(keep 조건 7항목, 보정 예시 10건) 삭제가 무확인·비가역이고 복원 절차가 없으므로 삭제 단계는 사람 승인 하에 쓰는 것이 안전하다.
