# dsh-trim-cot-leakage 분석

## 1. 개요

- 원본 경로: `/Users/kkh/Desktop/skills-analize/deepseek-harness/dsh-trim-cot-leakage/`
- 컬렉션: deepseek-harness
- 읽은 파일 전체 (하위 디렉터리 재귀, scripts/ templates/ assets/ 는 존재하지 않음):

| 파일 | 바이트 | 줄 수 | 역할 |
|---|---|---|---|
| `SKILL.md` | 7679 | 45 | 핵심 파일. frontmatter, 판정 테스트 1개, 분류 8종, 비(非)누출 9종, 워크플로우 5단계 |
| `references/examples.md` | 12566 | 275 | few-shot 보정 예시. Leaked/Fixed 쌍, Keeps, Overcorrection traps |
| `references/recall-batteries.md` | 5041 | 52 | `rg` 기반 탐지 프로브 모음, 호출 규칙, 알려진 오탐 패밀리 |

- 합계 25286 바이트, 372줄. 실행 스크립트·템플릿·assets 없음.
- 성격 한 줄: **감사(audit) + 수정(construction)의 혼합**. 읽기 전용 감사(Workflow 2단계) 후 산문 수정(3단계), 검증(5단계)으로 이어진다. 라우팅 요소(표면별 owner 위임)도 있다.
- 원문 자기 규정:
  > Chain-of-thought leakage is prose whose vantage is the authoring session rather than the repository: it cites artifacts only that session could see, narrates the change instead of the state, or argues with a reviewer who has left.
  > It is guidance, not a script. (`SKILL.md:8`)
- 이 스킬이 에이전트의 행동을 바꾸는 방식: 주석·JSDoc·문서·Agent Notes 안의 "작성 세션 시점" 산문(결정 번호, PR 서사, 리뷰어 변론)을 찾아 "HEAD 시점에서 독립적으로 읽히는 명제"로 재서술하게 한다. 단순 삭제를 금지하고, 사실 절(clause)은 살려서 다시 쓰게 한다.
- 선행 의존 문서(저장소 내 다른 위치): `dsh-prose-standard` (complete-proposition 규칙의 owner), `notes/implemented/process/2026-08-09-committed-artifact-citations.md` (인용 규칙 근거), `docs/AGENTS.md` (change-story routing, writing-rules), `dsh-doc` (이중언어 fence). 이 파일들은 이 스킬 디렉터리 밖이므로 본 분석에서 내용은 다루지 않는다. 같은 컬렉션의 `../dsh-prose-standard/SKILL.md`, `../dsh-doc/SKILL.md` 는 존재하지만 이 분석의 대상이 아니다.

## 2. 활성화 조건 (언제 켜지는가)

### 2.1 frontmatter description 전문

> Use when auditing or fixing prose that reads like a leaked reasoning transcript — dead design-session citations such as (decision N), audit item codes, or §N of uncommitted drafts; change narration such as "used to", "no longer", "this cut"; stack or review vantage ("a later PR in this stack", "rejected in review"); reviewer-addressed justifications; control-flow narration; or hedged planning residue in comments, JSDoc, docs, or Agent Notes.

### 2.2 트리거 구조

- 시작 문구는 `Use when auditing or fixing`. 즉 "감사" 와 "수정" 두 동작 모두에 반응한다.
- 대상 표면: `comments, JSDoc, docs, or Agent Notes` (description), 본문에는 추가로 README, 생성 카탈로그, 타입 동치 fence, 이중언어 문서가 등장 (`SKILL.md:12`, `SKILL.md:43`).
- description 에 나열된 6개 패밀리: (1) dead design-session citation, (2) change narration, (3) stack/review vantage, (4) reviewer-addressed justification, (5) control-flow narration, (6) hedged planning residue. 본문 taxonomy 는 이를 8종으로 확장한다 (Review choreography 분리, Authoring-language slips 추가).

### 2.3 매칭되는 사용자 발화 예시 (트리거 사전 추출)

원문에 발화 예시 목록은 없다 (`원문에 명시 없음`). 아래는 description 어휘에 직접 대응하는 발화이다.

1. "주석에 `(decision 7)` 같은 인용이 남아 있는데 정리해줘" → `(decision N)` 매칭
2. "JSDoc 에서 `used to`, `no longer` 같은 변경 서사를 현재형으로 바꿔줘" → "used to", "no longer" 매칭
3. "README 에 `this PR adds ...` 라고 쓰여 있다. 고쳐줘" → 예시 `This PR adds cursor-based pagination...` (`examples.md` Stack and PR vantage)
4. "코드 주석에 `the cast is safe — it simply ...` 같은 변명이 있다" → reviewer-addressed justification
5. "Agent Notes 에 `Rejected in review:` 문구가 박혀 있다" → description 의 "rejected in review"
6. "`design §4.7`, `plan §1.4` 같은 섹션 번호 인용을 감사해줘" → taxonomy 1번
7. "`probably fine for now` 같은 hedge 를 TODO 로 승격해줘" → taxonomy 7번
8. "영어 문서에 `端`, `设计稿` 같은 중국어 잔재가 섞였다" → taxonomy 8번
9. "리포 전체에서 CoT 누출 문장을 찾아줘 (audit item code 포함)" → description 의 "audit item codes"

### 2.4 의도적으로 배제되는 발화 / 넘겨야 할 스킬

- 이 스킬의 본문은 "무엇을 하지 말라"는 발화 라우팅 규칙을 description 에 두지 않는다 (`원문에 명시 없음`). 배제는 "What is not leakage" 섹션(콘텐츠 수준)과 Workflow 1단계(범위 수준)로 이뤄진다.
- 본문에 박힌 위임 규칙:
  - 범위·제외 규칙 → `dsh-prose-standard`: 
    > require an explicit scope; never touch `vendor/` or `.agents/notes/archived/`. (`SKILL.md:41`)
  - 모델/사용자에게 노출되는 문자열 → `dsh-prose-standard`:
    > model- or user-visible strings → route through dsh-prose-standard and change only with owning behavior evidence, otherwise leave unchanged and report the deferral. (`SKILL.md:43`)
  - 이중언어 fence → `dsh-doc`: 
    > bilingual fences → copy the corrected verbatim block byte-for-byte into both sides per dsh-doc (`SKILL.md:43`)
  - 변경 서사(change story) 의 "정식 거처" → Agent Notes / `docs/AGENTS.md` 의 routing (class 3 가 보낸다. `SKILL.md:12`)
  - 이연 작업 → `TODO` 마커 또는 issue 참조 (`SKILL.md:17`)
- 발화 단위로 배제되는 대상: vendor 코드, 아카이브된 노트, 녹화된 fixture/snapshot:
  > Recorded fixtures and snapshots are derivatives, not prose targets: change the owning source or scenario and regenerate them only when an authorized behavior change requires new evidence. (`SKILL.md:41`)

### 2.5 frontmatter 필드

- 존재: `name: dsh-trim-cot-leakage`, `description`.
- `allowed-tools`, `model`, `metadata` 등 그 외 필드: 없음.

## 3. 적합 / 부적합

### 3.1 적합

- 에이전트가 장기 세션에서 작성한 PR/스택 코드: 주석·JSDoc 에 세션 어휘가 새기 쉬운 상황. 원문이 말하는 출처는 "2026-08 repo-wide purge" (`examples.md:3`, `recall-batteries.md:3`).
- Agent Notes(`.agents/` 아래) 와 bilingual docs(`*.zh.md` 쌍) 가 있는 저장소. batteries 가 `.agents/` 와 `*.zh.md` 를 전제로 쓰였다.
- 생성 카탈로그, `verify-type-equiv`, `doc-sync` 등 파생물 게이트가 있는 저장소 (Workflow 3, 5단계가 이 게이트를 호출).
- 외부 감사 후 후속 정리: "each review round of the original purge found cases the batteries missed" 라는 문구로 반복 라운드를 상정.

### 3.2 부적합 · 과함

원문에 부적합 상황을 직접 열거한 문장은 없다 (`원문에 명시 없음`). 원문 구조에서 읽히는 제약만 기록한다.

- `dsh-prose-standard`, `docs/AGENTS.md`, `rg`, `.agents/` 구조, `doc-sync`/`verify-type-equiv`/`verify-translation-pairing` 게이트가 없는 저장소에서는 Workflow 3, 5단계를 그대로 수행할 수 없다. 스킬이 이 대체물을 제시하지 않는다.
- 범위가 명시되지 않은 요청: `require an explicit scope` 때문에 시작 불가.
- `vendor/`, `.agents/notes/archived/` 는 건드리지 않는다.
- 모델 노출 문자열(프롬프트, GUI 문구)은 behavior evidence 없이는 수정하지 않고 "deferral 보고" 만 한다.

### 3.3 형제 스킬 대신 이걸 고르는 판정 기준 (한 줄)

- 문제가 "산문의 시점(vantage)이 작성 세션인가" 이면 이 스킬; 산문의 일반 문장 규칙(명제 완결성, 범위, 모델 노출 문자열)이면 `dsh-prose-standard`; 문서 구조·이중언어 fence 이면 `dsh-doc`. (세 번째 항목은 원문의 위임 문장에서 추출, 형제 스킬의 description 은 읽지 않았으므로 경계 상세는 `원문에 명시 없음`.)

## 4. 전제 조건과 외부 의존성

- 실행 스크립트: **없음**. 원문: `It is guidance, not a script.` (`SKILL.md:8`)
- CLI 도구: ripgrep (`rg`). recall-batteries 의 모든 프로브가 `rg -n --hidden ...` 형태. 
- 필요 CLI/게이트 명칭 (저장소 쪽에 있어야 함, 이 스킬은 정의하지 않음):
  - `doc-sync` (docs), `verify-type-equiv`, `verify-translation-pairing` (`SKILL.md:45`)
  - `verify-doc-typecheck` (`examples.md` trap 3 에서 언급)
  - "lightweight routine" 과 `docs/AGENTS.md#writing-rules` (이중언어 산문 갱신 후 기록)
- 런타임/패키지: 원문에 명시 없음 (이 스킬은 `rg` 외 런타임을 요구하지 않음).
- API 키·환경변수·네트워크: 불필요 (원문에 요구 없음).
- 저장소 전제:
  - `.agents/` 디렉터리 (Agent Notes, 스킬 디렉터리 `.agents/skills/dsh-trim-cot-leakage/`): `recall-batteries.md:8` 의 제외 glob 에 경로가 하드코딩됨.
  - `.agents/notes/archived/` 존재 및 제외 대상.
  - `notes/implemented/process/2026-08-09-committed-artifact-citations.md` (소유 노트).
  - 이중언어(`*.zh.md`) 문서 체계, 생성 카탈로그, 타입 동치 페이지 (`SKILL.md:43`).
  - 린터: 예시에 `oxlint-disable` 이 등장 (`SKILL.md:31`, `examples.md` Keeps) — 린터 선택은 요구가 아니라 예시.
  - 테스트 러너, CI, 커밋 권한, 브랜치 전략: 원문에 명시 없음.
- 비용 발생 지점: 유료 API 없음. 토큰 비용은 "densest prose in scope" 를 패턴 없이 읽는 단계(`SKILL.md:42`)와 재생성 단계에서 발생. 수치화된 한도 `원문에 명시 없음`.
- 상태 파일·산출물 디렉터리: 이 스킬이 만드는 상태 파일 없음 (`원문에 명시 없음`). 단, 소유 노트의 "quoted evidence" 를 검증에 사용한다고만 적혀 있다 (`SKILL.md:45`).
- 스킬 디렉터리 자체가 탐색 제외 대상인 이유 (자기 참조):
  > (the skill's own files quote leaked wording as calibration) (`recall-batteries.md:8`)

## 5. 워크플로우

원문 `## Workflow` 는 번호 1~5 의 순서 목록이다. 순서 강제 문구(`do not skip`, `in order`)는 없다 (`원문에 명시 없음`). 다만 4단계가 "Before deleting anything" 으로 3단계 내부 삭제의 선행 조건을 명시한다.

### 5.0 사전: 판정 테스트 (모든 의심 구절에 적용, 게이트 성격)

> For every suspect passage ask: **could a reader at HEAD, with no access to any session transcript, PR thread, or uncommitted draft, resolve every reference and verify every claim?** (`SKILL.md:12`)

- 입력: 의심 구절
- 행동: 해결 가능성 판정
- 출력/분기:
  - No → "restate the surviving facts from the repository's vantage and delete the rest"
  - Yes → "it is not leakage, however historical it sounds"
  - 단서: "resolvability only clears this skill's bar: on current-state surfaces (READMEs, docs, JSDoc) a resolvable change story is still change narration, and class 3 routes it to its sanctioned home."
- 이 테스트는 탈락 가능한 **게이트**(구절 단위)다.

### 5.1 단계 1: 범위와 제외 (게이트: 범위 없으면 시작 불가)

- 입력: 사용자 요청
- 행동: `dsh-prose-standard` 에 따라 명시 범위 확인, 제외 경로 적용
- 출력: 확정된 범위
- 통과 조건: 
  > require an explicit scope; never touch `vendor/` or `.agents/notes/archived/`.
- Fixture/snapshot: 직접 편집 금지, 소유 소스/시나리오를 바꾸고 "authorized behavior change requires new evidence" 일 때만 재생성.
- 탈락 시 행동: 범위가 없을 때 에이전트가 무엇을 해야 하는지 `원문에 명시 없음` (질문하라는 문구 없음; `dsh-prose-standard` 에 위임).

### 5.2 단계 2: 읽기 전용 감사 (비게이트, 단 보정 조건 있음)

- 입력: 확정 범위
- 행동: recall batteries 실행 (`--hidden` 필수), 각 프로브를 "known positive" 와 "near-miss negative" 로 보정한 뒤 신뢰, 모든 hit 를 의미 판단. 이어 "densest prose in scope (module JSDoc, READMEs, Agent Notes)" 를 패턴 없이 읽기.
- 출력: 판정된 후보 목록 (형식 강제 없음, `원문에 명시 없음`)
- 통과 조건 (보정 게이트):
  > A zero-hit pattern proves nothing until it matches a known positive, and a noisy pattern proves nothing until it rejects a near-miss negative. (`recall-batteries.md:11`)
- 근거:
  > The batteries are probes, not the definition — each review round of the original purge found cases the batteries missed (`SKILL.md:42`)

### 5.3 단계 3: 표면별 owner 우선 수정 (분기 규칙)

원문은 표면별로 "owner 먼저" 수정한다. 표로 정리:

| 표면 | 원문 지시 |
|---|---|
| generated catalogs | trace every consumer, fix the source JSDoc or generator template, then regenerate all derivatives |
| type-equivalence fences | fix the source JSDoc, then re-paste both bilingual pages (`verify-type-equiv` pins them) |
| bilingual prose | update the counterpart minimally and re-record it through the lightweight routine |
| bilingual fences | copy the corrected verbatim block byte-for-byte into both sides per `dsh-doc`, then re-record the pair |
| model- or user-visible strings | route through `dsh-prose-standard`; change only with owning behavior evidence, otherwise leave unchanged and report the deferral |

- 사람 개입 지점: "report the deferral" (보고) 외에 승인 요청 문구는 `원문에 명시 없음`.
- `examples.md` "Behavior-visible candidates" 가 이 분기를 예시로 보강: 
  > Wrong: Rewrite only the source sentence during a prose-only purge, or hand-edit only the generated catalog.
  > Right: Trace the source's generated fan-out, update the owner, regenerate every derivative, and update the owning runnable snapshot.
  > If the authorized scope has no owning scenario, leave the wording unchanged and report the deferral.

### 5.4 단계 4: 삭제 전 명제 열거 (게이트: 오버커렉션 체크)

- 입력: 삭제 후보 구절
- 행동: passage 의 propositions 를 열거 (prose-standard), overcorrection traps 확인
- 출력: 살릴 명제 목록
- 통과 조건 (탈락 4유형):
  > trims that flip an obligation into an endorsement, promote a hypothetical to a shipped feature, delete a true fact, or drop the evidence source. (`SKILL.md:44`)
- 탈락 시: 재서술해서 명제를 보존 ("Delete clauses, not sentences, when propositions share a line." `examples.md`).

### 5.5 단계 5: 검증 (게이트)

> re-run the batteries expecting only sanctioned keeps, this skill's own directory, and the owning note's quoted evidence; confirm every remaining citation resolves at HEAD; run the gates for touched surfaces (`doc-sync` for docs, `verify-type-equiv`, `verify-translation-pairing`). (`SKILL.md:45`)

- 통과 조건 3개: (a) 배터리 재실행 시 잔여 hit 는 sanctioned keep / 스킬 자신의 디렉터리 / 소유 노트의 인용 증거뿐, (b) 남은 모든 인용이 HEAD 에서 해결, (c) 건드린 표면의 게이트 통과.
- 게이트 실패 시 행동: `원문에 명시 없음` (재시도 상한·루프 규칙 없음).

### 5.6 루프 구조 도식

```
[범위 확정] -> [배터리 + 무패턴 정독] -> 후보별 [판정 테스트]
     ^                                      |No        |Yes
     |                                      v          v
     |                         [명제 열거/overcorrection 점검]  (keep)
     |                                      |
     |                              [owner-first 수정]
     |                                      |
     +-------- (batteries 재실행, 잔여가 keep뿐이 아니면?) -- [검증 5]
```

- 재시도 횟수 상한, 수렴 조건의 수치: `원문에 명시 없음`. 암묵적 반복 근거는 "each review round of the original purge" 한 구절뿐.

## 6. 엔지니어링 규칙 분석

### 6.1 금지 규칙 (anti-pattern) 과 막으려는 실패 모드

| 금지 / 안티패턴 (원문) | 막으려는 실패 모드 |
|---|---|
| "The fix is never deletion alone when a passage carries factual clauses" (`SKILL.md:8`) | 사실 절까지 삭제하여 정보 손실 |
| 사실 절이 없는 구절(audit code, control-flow narration)을 남기기: "a passage carrying none ... is deleted outright" | 의미 없는 세션 약어 잔존 |
| Taxonomy 1: `(decision 7)`, `(audit C2)`, `design §4.7`, `plan §1.4`, 라벨 `T4`, `W3`, `P-I`, "the design ledger", "(B ruling)" | 해결 불가능한 포인터 |
| Taxonomy 2: "a later PR in this stack", "this PR adds", "the previous commit" | 스택 위치가 영구 문서에 들어감 |
| Taxonomy 3: "used to", "no longer", "the old X", "v1", "this cut", "today", 과거와 대비하는 "now" ; 수정된 회귀를 "used to Y" 로 쓰기 | 저장소 고고학(archaeology) 서술, 금세 stale |
| Taxonomy 4: "Rejected in review:", "the reviewer confirmed", "v5 of this note", 라운드 귀속 | 사람/시점이 근거가 됨 |
| Taxonomy 5: "the cast is safe — it simply…", "this is correct because…" | 떠난 리뷰어에게 변론 |
| Taxonomy 6: "first we X, then we Y", 테스트 워크스루, 자명한 분기의 증명 | 코드 재진술 |
| Taxonomy 7: "probably fine for now", "should be enough", 마커 없는 이연 | 소유자 없는 계획 잔재 |
| Taxonomy 8: 端, 设计稿, `---- 私有 ----` 등 작업 언어 조각 | 언어 혼입 |
| 파생물 직접 수정 (fixtures, snapshots, generated catalog 만 손편집) | 소스와 파생물 불일치 |
| `vendor/`, `.agents/notes/archived/` 수정 | 범위 침범 |
| 모델/사용자 노출 문자열을 behavior evidence 없이 수정 | 행동 변경 |
| 이슈 참조를 Agent Notes 로 옮기기: "Do not relocate them to Agent Notes." | 내구성 있는 참조 파괴 |
| 번역을 구현만 다르게: "Translating the code comment differently in the Chinese counterpart breaks the pairing contract" (`examples.md`) | 이중언어 fence 불일치 |

### 6.2 강제 규칙 (수치·임계값)

이 스킬의 규칙에는 커버리지 %, 줄 수 상한, 재시도 횟수, 타임아웃 같은 **자체 수치 임계값이 없다** (`원문에 명시 없음`). 원문에 나오는 숫자는 전부 (a) 규칙 대상 패턴 예시, (b) 보정용 예시 값, (c) 날짜 식별자이다.

| 숫자 | 위치 | 성격 |
|---|---|---|
| 8 | taxonomy 항목 수 (`SKILL.md:16-23`) | 분류 개수 |
| 5 | Workflow 단계 수 | 단계 개수 |
| 2026-08, 2026-08-09 | `recall-batteries.md:3`, `SKILL.md:8` | purge 시기, 소유 노트 날짜 |
| 7 (English battery 줄 수) | `recall-batteries.md:17-23` 의 `rg` 7줄 | 프로브 개수 |
| 4 (Chinese battery 줄 수) | `recall-batteries.md:30-37` 의 `rg` 4줄 | 프로브 개수 |
| `#1470` | Keep 예시 | issue 참조 예 |
| `512 nests ≈ 0.15s`, `4096` | Measured bounds 예 (`SKILL.md:33`, `examples.md`) | 보존해야 할 측정값 예시 |
| `64 KiB`, `48 KiB` | Vague sizing 예 | "should be enough" → 실제 한계 치환 예 |
| `4 MiB`, `3.1 MiB` | Trap 4 | "measured" 를 보존해야 하는 예 |
| `RFC 9110 §10.1.5` | Keep 예 | 외부 표준 §는 허용 |
| `decision 21`, `decision 7`, `audit R3`, `v2 §3.2`, `T4`, `P-I`, `PR #88`, `v5` | 예시 | 누출 예 |

- 지시 규칙(수치 없음) 정리:
  - "Name the owning note's path at least once per file — as a link where the surface supports one — and later mentions may use the searchable name alone." (`examples.md`) — 유일한 빈도 규칙 ("at least once per file").
  - 제외 glob 순서: "Exclusions go last so a later include cannot re-admit them" (`recall-batteries.md:8`).
  - `-i` 규칙: 자연어 줄은 `-i`, 첫 줄(코드 패턴 `\bT\d\b`, `\bP-I\b`)은 대소문자 구분 유지 (`recall-batteries.md:9`).

### 6.3 Keep 규칙 (비누출 판정표, "What is not leakage")

| Keep 항목 | 근거/예 |
|---|---|
| Issue references | `#1470`, `TODO(name):`, "issue #N owns the follow-up" — "keep them on any surface, including READMEs" |
| Agent Notes/postmortems 안의 merged-PR, issue 인용 | "sanctioned evidence per the documentation standard's change-story routing" |
| Suppression justifications | `oxlint-disable … -- reason`, coverage-ignore, empty-catch 설명: "fix a false reason, never delete it" |
| Counterfactual-present regression pins | "without X, Y happens", "a naive X would…" |
| Measured bounds | "(measured: 512 nests ≈ 0.15s)"; "the evidence word 'measured' is load-bearing" |
| Runtime old/new states | "the old connection drains before the new one accepts" |
| 노트 change-story 섹션의 역사적 단계명 | "the first cut shipped X" 허용, 그러나 "indexical stamps ('this cut') stay banned everywhere" |
| 외부 참조 | RFC 9110 §10.1.5, Figma frame 이름; "§-ban covers uncommitted internal drafts" |
| 프로젝트 보이스·장르 | "we"; Alternatives-considered 섹션 |

### 6.4 알려진 오탐 패밀리 (recall-batteries.md:40-52)

- Instrumental "used to" ("the key used to sign requests"): 주어 상태가 앞에 있는 경우만 시간적.
- Runtime old/new.
- "This PR" in process docs: "documentation about PR workflow ... legitimately says 'PR'".
- `v1` as protocol or path segment (`/v1/chat`).
- `§N` with a committed owner.
- Contrastive "actually" and noun "wait".
- Runtime "today" and recorded timestamps.
- 본버전 in zh prose: "本版本" 은 "this release" 의 정당한 번역, 금지 대상은 bare stamp 인 "本版".
- Alternatives-considered 안의 "rejected".

### 6.5 검증 방식 (무엇이 "됐다"인가)

- 근거 유형: (1) 도구 출력 — 배터리 재실행 결과, `doc-sync`/`verify-type-equiv`/`verify-translation-pairing` 게이트; (2) 사람/에이전트 판단 — "judge every hit semantically", 명제 열거, "confirm every remaining citation resolves at HEAD".
- 자기 진술 단독 완료 판정은 아니다: 5단계가 게이트를 호출한다. 단, 게이트 통과 후 사람 확인 요구는 `원문에 명시 없음`.
- 의미 판단 부분(hit 판정, 명제 열거)은 에이전트의 자기 판단 외의 독립 검증이 `원문에 명시 없음`.
- 프로브 자체에 대한 검증 요구: known positive / near-miss negative 보정 (`recall-batteries.md:11`).

### 6.6 도구 사용 규칙

- `rg` 필수 옵션: `-n --hidden`, 그리고 `--glob '!.git/**'`. 이유:
  > ripgrep skips dot-directories by default and the purge's biggest miss risk was Agent Notes. (`recall-batteries.md:7`)
- 제외 glob (맨 뒤에):
  `--glob '!vendor/**' --glob '!node_modules/**' --glob '!.agents/notes/archived/**' --glob '!.agents/skills/dsh-trim-cot-leakage/**'` + 범위 내 fixture/snapshot 디렉터리.
- 구문 규칙: 완전한 구를 경계로 묶는다 ("`\bthis PR\b` must match 'this PR adds' without matching 'this project', 'this process', or 'this provider'").
- 이중언어 프로브: 반대 언어 표면에 맞춘다 ("Target authoring-language probes at the opposite-language surface"); 중국어 산문에서 영어 잔재를 ASCII 로 찾는 것은 "too noisy" — 대신 counterpart 와 추가분을 비교.
- 프로브 파일 glob: `*.zh.md`, `*.md`, `*.{ts,tsx,js,jsx,mjs,cjs,css}`, `*.py` 별 개별 규칙.
- 금지 도구: 명시적 금지 도구 목록은 `원문에 명시 없음`.

### 6.7 English battery 7줄 (원문 그대로, `recall-batteries.md:17-23`)

1. `\(decision \d|\(audit [A-Z]\d|design §|plan §|design ledger|\(B ruling|\bP-I\b|\bW\d\b|\bT\d\b` (case-sensitive)
2. `-i '\bthis PR\b|\bthis branch\b|\bthis stack\b|\blater PRs?\b|\bprevious commits?\b|\bthis commit\b'`
3. `-i '\bused to\b|\bno longer\b|\bpreviously\b|\bthe old\b|\bwas renamed\b|\bwas moved\b'`
4. `-i '\bv1\b|this cut|\bcut \d|\btoday\b|\bfor now\b|roadmap'`
5. `-i 'rejected in review|review round|reviewer|as of v\d'`
6. `-i 'probably |should be enough|should suffice|it simply|is safe —|is safe --'`
7. `'§\d'`

- taxonomy 대응: 1줄 → 분류 1; 2줄 → 분류 2; 3·4줄 → 분류 3; 5줄 → 분류 4; 6줄 → 분류 5·7; 7줄 → 분류 1 (섹션 번호). 분류 6(restatement)에 대응하는 배터리는 없다 (control-flow narration 은 패턴이 아니라 정독 대상. 원문이 이를 직접 말하지는 않으며 사실 관계만 기록).
- Chinese batteries 4줄: `*.zh.md` 변경 서사(`评审|上一?轮|旧版|老的|不再|以前|本版|遗留`), 영어 md 의 중국어 잔재(+ `设计稿|私有|端`), 영어 코드 주석/JSDoc (`.ts/.tsx/.js/.jsx/.mjs/.cjs/.css`), 파이썬 주석 `#`.

### 6.8 컨텍스트·토큰 규율

- 파일 읽기 범위: "also read the densest prose in scope (module JSDoc, READMEs, Agent Notes) without a pattern in hand" — 범위 안의 고밀도 산문은 전부 정독.
- 서브에이전트 위임, 요약·압축 지시: `원문에 명시 없음`.
- 토큰 예산 수치: `원문에 명시 없음`.

### 6.9 모호어의 조작적 정의

| 모호어 | 원문 환산 |
|---|---|
| leakage (누출) | "could a reader at HEAD, with no access to any session transcript, PR thread, or uncommitted draft, resolve every reference and verify every claim?" 의 No |
| resolvable (해결 가능) | HEAD 에서 읽는 사람이 참조를 해소하고 주장을 검증할 수 있는가. 형식이 아니라 해소 가능성: "The test is resolvability, not form" (`examples.md`) |
| durable / owner | committed owner: 저장소에 커밋된 파일이 이름·경로로 응답하는가 |
| stale | 인덱스적 표지("this cut", "v1", "today") — 병합 즉시 낡는다 |
| hedge | 소유자(marker) 없는 불확정 표현. 치환: `TODO(name): ...` 또는 실제 bound + 초과 시 실패 동작 |
| measured | 측정 증거를 가리키는 단어. 삭제 금지 |
| "done" | 5단계 3개 통과 조건 (위 5.5). 그 이상의 정의 `원문에 명시 없음` |
| "simple/clean" | 사용되지 않음 |

## 7. 산출물

- 최종 형태: **코드/문서 diff** (주석, JSDoc, README, Agent Notes, 이중언어 문서의 산문 수정) + 필요시 **재생성된 파생물**(generated catalogs, type-equivalence 페이지).
- 보고 형태를 강제하는 템플릿: `원문에 명시 없음`. 유일한 보고 요구는 "report the deferral" (모델/사용자 노출 문자열을 바꾸지 않았을 때, `SKILL.md:43`).
- Leaked → Fixed 변환 패턴 (출력 규범으로 작용하는 예):
  - 소유자 있는 결정 번호: "Slash input resolves against the visible catalog (decision 21)." → "— the plain-text-reference decision, owned by [the web input-machine note](...)"
  - 소유자 없는 결정 번호: "(decision 7: names are flat, no namespacing)" → "names are flat, with no namespacing" (사실 절 보존)
  - audit code: 삭제
  - 허구의 미래를 가정으로 표시: "A hypothetical IPC-based shell — no such shell exists — would subclass the executor and override `spawn`."
- 삭제 결과가 "(deleted.)" 로 표기되는 경우: control-flow narration, 리뷰어 권위 호출 (`@returns` 에 순서가 이미 명시되어 있는 경우), unmarked deferral (TODO 가 이미 있는 경우).
- 커밋·PR·브랜치 조작: 이 스킬에는 지시 없음 (`원문에 명시 없음`).
- 파괴적 동작:
  - 구절 삭제(산문) 및 파생물 재생성이 유일한 변경. 
  - 파일 삭제, force push, 마이그레이션: `원문에 명시 없음`.
  - 파괴 방지 장치: `never touch vendor/ or .agents/notes/archived/`; fixture/snapshot 직접 수정 금지; 모델 노출 문자열은 evidence 없으면 불변.
- `TODO(name):` 마커 생성: 이연 작업이 마커 없이 hedge 로 남아 있을 때 새 마커를 쓰라는 지시 (`examples.md`: "If no marker exists, write one (`TODO(name): coalesce per animation frame`)"). 이 마커 이름 규약(`name`)의 정의는 `원문에 명시 없음`.

## 8. 주의점 / 한계 (여기서만 평가)

### 8.1 오작동 · 과잉작동 시나리오

1. **오탐으로 인한 과삭제.** 배터리가 "over-match by design" 이다 (`recall-batteries.md:3`). `used to` (instrumental), `today` (런타임 시각), `v1` (`/v1/chat`), `this PR` (PR 프로세스 문서) 등 최소 9개 오탐 패밀리가 목록화돼 있어도, 에이전트가 의미 판단을 건너뛰고 패턴 hit 를 일괄 치환하면 정당한 문장을 훼손한다. 스킬은 이를 막는 방법을 "judge every hit semantically" 로만 규정한다.
2. **과소탐지.** 분류 6(제어 흐름 서술)과 5(변명)는 배터리가 약하다: 6번에 대응하는 프로브가 없고, 5번은 `it simply`/`is safe —` 두 구뿐이다. 나머지는 정독에 의존하므로 에이전트의 읽기량에 따라 결과가 달라진다. 원문도 "each review round ... found cases the batteries missed" 라고 인정한다.
3. **명제 반전.** Trap 1(의무→승인), Trap 2(가설→출시 기능)처럼 줄이는 과정에서 modality 가 뒤집힌다. 4단계는 열거를 요구하지만 열거 결과를 제3자가 검증하는 단계가 없다.
4. **issue 참조 오삭제.** 비지시 패스가 이슈 참조를 삭제한 전례가 Keeps 에 기록돼 있다 ("An unaided pass deleted this"). 반대로 dead name-drop("widget-rendering RFC")을 "naming the owner by topic" 으로 보존한 전례도 있다. 양방향 오류가 모두 실제 발생했다는 뜻.
5. **파생물 불일치.** generated catalog 를 손으로 고치거나 소스만 고치고 재생성을 빠뜨리면 불일치가 생긴다. 스킬이 `Wrong` 으로 명시하나 강제 장치는 하류 게이트에 의존한다.
6. **이중언어 쌍 깨짐.** fence 를 한쪽만 번역하면 `verify-translation-pairing` 이 깨진다 (예시에서 byte-exact 복사 요구).

### 8.2 충돌 가능 지점

- **자기 디렉터리 모순.** 스킬 파일이 누출 문구를 보정 자료로 인용한다 (`examples.md:3`). 배터리가 스킬 디렉터리를 제외하지 않은 상태(예: 이 컬렉션을 다른 경로로 복사, `.agents/skills/` 경로가 아님)에서는 스킬 자신이 hit 된다. 제외 glob 이 경로 하드코딩이다.
- **`dsh-prose-standard` 와의 경계.** 모델 노출 문자열, 범위 규칙, complete-proposition 규칙을 위임하지만 위임받는 쪽의 규칙은 이 분석 범위 밖이라 충돌 여부 `원문에 명시 없음`.
- **docs/AGENTS.md 의 change-story routing.** class 3 이 "sanctioned home" 으로 보낸다고 하지만 그 홈의 규칙은 외부 문서에 있다.
- 사용자 CLAUDE.md 가 "변경 이력 주석 허용" 같은 반대 규칙을 두면 충돌 가능. 이 스킬은 CLAUDE.md 우선순위 규칙을 정의하지 않는다 (`원문에 명시 없음`).
- 최소 diff 지향 스킬/사용자 지시와 충돌: 이 스킬은 문장 단위가 아니라 clause 단위 재서술을 요구하므로 diff 가 커질 수 있다.

### 8.3 검증 공백

- 의미 판단의 합격 기준이 인간 리뷰 없이는 자기 판단이다. "confirm every remaining citation resolves at HEAD" 를 어떻게 확인하는지(링크 체커, 스크립트) 절차가 없다.
- 재시도 상한·종료 조건이 없다: 배터리를 몇 번 돌려야 끝인지 `원문에 명시 없음`.
- 정독 단계의 커버리지 측정(어디까지 읽었는지)이 없다.
- 변경 후 문장이 원문과 같은 명제를 보존했는지에 대한 자동 검증 없음.
- 범위가 큰 리포에서의 비용·시간 가이드 없음.
- 예시의 대부분이 TypeScript/JS (`oxlint`, JSDoc, `.ts`) 환경이다. 파이썬은 `#` 주석 프로브 1줄뿐, 다른 언어 주석 구문(`--`, `;` 등)은 배터리에 없다.

### 8.4 유지보수 리스크

- 하드코딩: `.agents/`, `.agents/skills/dsh-trim-cot-leakage/`, `notes/implemented/process/2026-08-09-committed-artifact-citations.md`, `docs/AGENTS.md#writing-rules`, `../../../notes/archived/architecture/2026-07-25-web-input-machine-and-slash-pipeline.md` 같은 상대 경로. 소유 노트가 이동·archive 되면 링크가 죽는다. 스킬이 스스로 금지하는 "dead pointer" 가 될 수 있다.
- 도구명 하드코딩: `oxlint`, `doc-sync`, `verify-type-equiv`, `verify-translation-pairing`, `verify-doc-typecheck`.
- 시기 하드코딩: "2026-08 purge" 에서 튜닝된 프로브이므로 새 어휘(다른 팀의 phase label 등)는 갱신되어야 한다.
- 예시 속 가상 식별자(`widget`, `py-types`, `#1470`)는 보정용이지만 실제 리포와 혼동될 수 있다.

### 8.5 한 줄 판정

**조건부 도입 권장** — `rg`, `.agents/` 구조, `doc-sync`/`verify-type-equiv`/`verify-translation-pairing` 게이트, `dsh-prose-standard` 가 갖춰진 저장소에서는 "복원 가능성 테스트 + 오탐/오삭제 사례 목록" 이 정밀하지만, 이 전제가 없으면 Workflow 3·5단계를 실행할 수 없다.
