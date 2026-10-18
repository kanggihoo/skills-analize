# dsh-translate-docs 분석
## 1. 개요
- 컬렉션: deepseek-harness
- 원본 경로: `/Users/kkh/Desktop/skills-analize/deepseek-harness/dsh-translate-docs/`
- 디렉터리 전수 조사 결과 (`find . -type f`): 파일은 1개뿐이며 `references/`, `scripts/`, `templates/`, `assets/` 는 존재하지 않는다.
| 파일 | 크기 | 줄 수 | 역할 |
|---|---|---|---|
| `SKILL.md` | 10,604 바이트 | 74줄 | 스킬 본문 전체. frontmatter + 9개 `##` 섹션 |
| 보조 파일 | 없음 | - | 원문에 명시 없음 (디렉터리에 존재하지 않음) |
- SKILL.md 가 링크로 참조하지만 이 디렉터리에는 없는 외부 문서 (이번 분석에서 읽지 못함, 내용은 원문 링크 문구로만 인용한다):
  - `docs/AGENTS.md`, `docs/i18n/README.md`, `docs/i18n/translation-rules.md`, `docs/i18n/terminology.md`, `docs/i18n/translation-prompt.md`, `docs/i18n/style-samples.md`
  - `../../notes/archived/process/2026-07-26-briefed-minimal-translation-updates.md`
  - `scripts/translation-pairing.manifest.json`
  - 형제 스킬: `../dsh-prose-standard/SKILL.md`, `../dsh-pre-push-checks/SKILL.md`, `../dsh-code-review/SKILL.md`
- 성격 한 줄: **라우팅 + 생성(construction) + 검증(verification) 혼합**. 변경 유형(Update / New pair / Deleted·renamed)에 따라 경로를 갈라 주는 라우팅이 뼈대이고, 새 쌍 번역은 생성, `verify-translation-pairing` 으로 기록·확인하는 부분은 검증이다. 감사(audit)·계획(planning) 성격은 원문에 명시 없음.
- 원문 자기 규정:
  > **This skill is guidance, not a translation memory.** It is the workflow map for keeping `foo.md ↔ foo.zh.md` pairs consistent and natural in both languages. (`SKILL.md:16`)
  > Both languages carry equal authority — a change is authored in either one, and that side is the source for that update. (`SKILL.md:16`)
  > You are the translator: the rules below say what must hold, not how to phrase any particular sentence — phrasing judgment is yours, terminology is not. (`SKILL.md:16`)
- 제목: `# Translating DeepSeek-Harness docs` (`SKILL.md:8`)
- 이 스킬 자체가 "extended" 워크플로우임을 description 이 밝힌다: "Manually run the extended DeepSeek Harness bilingual-document workflow". 일상 번역은 `docs/AGENTS.md` 의 "one-shot, one-pass rule" 이 맡는다 (`SKILL.md:12`).

## 2. 활성화 조건 (언제 켜지는가)
### 2.1 frontmatter 전문 (`SKILL.md:1-6`)
```
---
name: dsh-translate-docs
description: Manually run the extended DeepSeek Harness bilingual-document workflow, including generated briefings, delegated prose translation, whole-document translation, and scoped pairing verification.
disable-model-invocation: true
user-invocable: true
---
```

### 2.2 name / description 외 필드
| 필드 | 값 | 의미(원문 근거) |
|---|---|---|
| `name` | `dsh-translate-docs` | - |
| `description` | 위 인용 | "Manually run" 으로 시작 |
| `disable-model-invocation` | `true` | 모델이 자동으로 선택·로드하지 못하게 하는 플래그. 본문 `SKILL.md:12` 의 "Never select or load it ..." 와 같은 방향 |
| `user-invocable` | `true` | 사용자가 직접 호출 가능 |
| `allowed-tools` | 없음 | 원문에 명시 없음 |
| `model` | 없음 | 원문에 명시 없음 |
| `metadata` | 없음 | 원문에 명시 없음 |

### 2.3 호출 경계 (본문)
> Run this extended workflow only when the user explicitly invokes `dsh-translate-docs` by name. Never select or load it for ordinary documentation work, from another skill, or from an inferred translation need; routine translation follows the one-shot, one-pass rule in [docs/AGENTS.md](../../../docs/AGENTS.md). (`SKILL.md:12`)

세 가지 금지 경로가 명시된다.
1. ordinary documentation work 에서의 선택·로드
2. 다른 스킬로부터의 로드
3. 추론된(inferred) 번역 필요에 의한 로드

### 2.4 매칭되는 사용자 발화 예시 (명시적 이름 호출만 해당)
호출 조건이 "by name" 이므로 아래는 모두 스킬 이름을 포함해야 한다. 원문에 발화 예시 목록은 없으며, 아래는 `SKILL.md:12` 의 조건을 적용해 구성한 사전이다.

1. `/dsh-translate-docs` (슬래시 호출, `user-invocable: true`)
2. "dsh-translate-docs 로 docs/guide.md 의 중국어 쌍을 만들어 줘" (New pair)
3. "dsh-translate-docs 실행해서 out-of-sync 쌍 전부 브리핑 돌려" (`gen-translation-brief` 무인자 경로, `SKILL.md:30`)
4. "dsh-translate-docs 로 foo.zh.md 수정분을 foo.md 에 반영해" (중국어 쪽이 원본인 Update, `SKILL.md:16`)
5. "dsh-translate-docs: 삭제한 문서의 counterpart 와 .i18n.yaml 정리" (`SKILL.md:22`)

### 2.5 의도적으로 배제되는 발화와 넘길 곳
| 배제되는 상황 | 원문이 지시하는 대응 | 근거 |
|---|---|---|
| 스킬 이름 없이 "이 문서 번역해줘" 같은 일반 번역 요청 | 이 스킬을 쓰지 않고 `docs/AGENTS.md` 의 one-shot, one-pass rule 을 따른다 | `SKILL.md:12` |
| 다른 스킬이 번역 필요를 발견함 | 다른 스킬이 이 스킬을 로드해서는 안 된다 ("from another skill") | `SKILL.md:12` |
| `.agents/notes/archived/` 아래 Frozen Agent Notes | 번역 작업이 아님. 갱신·재기록·수리 모두 금지 | `SKILL.md:24` |
| 산문 품질 판단 | 별도 스킬 `dsh-prose-standard` 를 적용 | `SKILL.md:46` |
| 푸시 전 점검 | `dsh-pre-push-checks` 에 따라 PR 수준에서 `pnpm run doc-sync` | `SKILL.md:69` |
| 번역 리뷰 응답의 보고 방식 | `dsh-code-review` 의 `#reporting-findings` | `SKILL.md:74` |

## 3. 적합 / 부적합
### 적합
- `foo.md ↔ foo.zh.md` 한 쌍과 `foo.i18n.yaml` 을 유지하는 DeepSeek-Harness 저장소 (`SKILL.md:16`, `SKILL.md:42`). 이 구조가 없는 저장소에 대한 설명은 원문에 명시 없음.
- 이미 쌍이 있고 한쪽만 고친 경우 (Update). 원문은 이 경로를 "deliberately cheap" 로 규정한다 (`SKILL.md:20`).
- 코드 펜스만 바뀐 기계적 변경 (`--apply` 로 서브에이전트 없이 처리, `SKILL.md:31`).
- 번역할 문서가 아직 없는 새 쌍 (whole-document path, `SKILL.md:36-56`).
- 문서 삭제·이름 변경으로 counterpart 와 yaml 을 같이 정리해야 할 때 (`SKILL.md:22`).
- 번역 리뷰 코멘트가 용어 선택에 관한 것이고 `terminology.md` 를 갱신해야 할 때 (`SKILL.md:74`).

### 부적합 · 과함
- 스킬 이름을 부르지 않은 평범한 문서 작업. 원문이 명시적으로 금지 (`SKILL.md:12`).
- `.agents/notes/archived/` 의 동결 노트. "never update, re-record, or repair either side after archival" (`SKILL.md:24`).
- 이중 언어 쌍 규약 밖의 문서. 제외 대상은 "genuine generated, instructional, or bilingual-by-construction exclusion" 이며 `scripts/translation-pairing.manifest.json` 으로만 다룬다 (`SKILL.md:68`).
- 업데이트인데 문서 전체를 재번역하려는 경우. "Never re-translate a whole document to apply an update" (`SKILL.md:20`).
- DeepSeek-Harness 가 아닌 저장소: 스킬이 `pnpm run gen-translation-brief` 등 저장소 고유 스크립트와 `docs/i18n/*` 에 묶여 있어 그 외 저장소 사용 여부는 원문에 명시 없음.

### 형제 스킬 대신 이걸 고르는 판정 기준 한 줄
사용자가 `dsh-translate-docs` 를 이름으로 직접 불렀고 작업 대상이 `foo.md`/`foo.zh.md`/`foo.i18n.yaml` 쌍이면 이 스킬, 그렇지 않으면 `docs/AGENTS.md` 의 일상 번역 규칙.

## 4. 전제 조건과 외부 의존성
### 4.1 실행 스크립트
이 스킬 디렉터리에 `scripts/` 는 없다. 스킬이 호출하는 스크립트는 모두 호출 대상 저장소의 `pnpm` 스크립트다.
| 명령 | 용도 | 근거 |
|---|---|---|
| `pnpm run gen-translation-brief <any file of the pair>` | 브리핑 생성. 인자 없으면 out-of-sync 쌍 전부 | `SKILL.md:30` |
| `pnpm run gen-translation-brief --apply <pair>` | 코드 펜스 전용 변경을 counterpart 에 splice 하고 구조 검증 후 기록 | `SKILL.md:31` |
| `pnpm run verify-translation-pairing --write <pair>` | 쌍의 섹션별 해시를 `foo.i18n.yaml` 에 기록 | `SKILL.md:34`, `SKILL.md:67` |
| `pnpm run verify-translation-pairing <pair>` | 범위 지정 검증 | `SKILL.md:34` |
| `pnpm run verify-translation-pairing --list` | 문서별 missing / out-of-sync / ok 출력 | `SKILL.md:60` |
| `pnpm run doc-sync` | 코퍼스 전체 페어링 검사 + `verify-md-wrap` + `verify-md-links` | `SKILL.md:69` |

### 4.2 런타임 · 패키지 · CLI
- `pnpm` (모든 명령이 `pnpm run ...`). Node 버전, pnpm 버전은 원문에 명시 없음.
- git: 브리핑이 "authored side's diff since the last confirmed-consistent state" 를 담는다고 서술하지만 (`SKILL.md:30`), git 명령 호출 자체는 원문에 명시 없음. 오히려 update path 는 "no git archaeology" 로 규정 (`SKILL.md:20`).
- `gh`, docker, playwright 등: 원문에 명시 없음.

### 4.3 API 키 · 환경변수 · 네트워크
- API 키, 환경변수, 네트워크: 원문에 명시 없음. 스킬 본문이 요구하는 것은 로컬 `pnpm` 스크립트와 저장소 내 문서뿐이다.
- 다만 `translation-prompt.md` 에 대해 "the automated pipeline's calibrated machine-consumed template" 이라고 서술해 별도의 자동화 파이프라인이 존재함을 시사한다 (`SKILL.md:45`). 그 파이프라인의 키·네트워크 요구는 원문에 명시 없음.

### 4.4 리포지토리 전제
| 전제 | 원문 근거 |
|---|---|
| 세 파일 쌍 `foo.md`, `foo.zh.md`, `foo.i18n.yaml` | `SKILL.md:42` |
| 섹션별 해시를 담는 consistency record | `SKILL.md:42`, `SKILL.md:67` |
| 언어 전환 라인(switcher) 규약 | `SKILL.md:66` |
| `docs/i18n/` 아래 README, translation-rules, terminology, translation-prompt, style-samples | `SKILL.md:42-45`, `SKILL.md:50` |
| `scripts/translation-pairing.manifest.json` 제외 매니페스트 | `SKILL.md:68` |
| CI/`doc-sync` 게이트 ("the gate goes red if you forget") | `SKILL.md:62` |
| PR 기반 워크플로우 ("Before the PR", "Keep the PR reviewable") | `SKILL.md:69-70` |
| 서브에이전트 생성 능력 ("spawn a subagent") | `SKILL.md:38` |
| 테스트 러너, 린터, 타입 시스템, 브랜치 전략 | 원문에 명시 없음 |

### 4.5 비용 발생 지점
- 유료 API 단가·CI 분 수치: 원문에 명시 없음.
- 토큰 비용에 대한 서술: update path 를 "at a fraction of the cost" 로 규정하고 (`SKILL.md:28`), "deliberately cheap: no guidance-corpus reading, no git archaeology" 라고 한다 (`SKILL.md:20`). 비용의 정량값은 원문에 명시 없음.
- 서브에이전트 호출이 비용 지점이다: 산문 diff 는 서브에이전트에 위임 (`SKILL.md:32`), 새 쌍은 "spawn a subagent" (`SKILL.md:38`).

### 4.6 상태 파일 · 산출물 경로
| 경로 | 생성/수정 | 근거 |
|---|---|---|
| `foo.zh.md` / `foo.md` (counterpart) | 생성 또는 최소 수정 | `SKILL.md:20`, `SKILL.md:38` |
| `foo.i18n.yaml` | `--write` 로 섹션 해시 기록 | `SKILL.md:67` |
| `scripts/translation-pairing.manifest.json` | 제외 정책이 문서화된 경우에만 수정 | `SKILL.md:68` |
| `docs/i18n/terminology.md` | 리뷰어의 용어 결정 반영 시 수정 | `SKILL.md:74` |
| `.agents/notes/archived/**` | 수정 금지 | `SKILL.md:24` |
| `plan.md`, `TODO`, `.claude/` 류 | 원문에 명시 없음 | - |

## 5. 워크플로우
### 5.0 전체 분기 (게이트: Triage)
`## Triage by change type — this decides everything else` (`SKILL.md:18`). 이 분기가 이후 모든 것을 결정한다.

```
변경 유형?
 ├─ Update (pair exists, one side edited) ──> 5.1 Update path
 ├─ New pair (no counterpart yet)          ──> 5.2 Whole-document path
 └─ Deleted or renamed doc                 ──> counterpart + .i18n.yaml 같이 삭제/이름변경
```

삭제/이름변경 단계 입력→행동→출력→통과:
- 입력: 삭제 또는 이름이 바뀐 문서
- 행동: "delete or rename the counterpart and the `.i18n.yaml` alongside it"
- 출력: 쌍 3파일이 모두 일관되게 정리된 상태
- 통과 조건: "the gate reports an incomplete pair otherwise" (`SKILL.md:22`) — 즉 안 하면 게이트가 불완전 쌍을 보고한다.

### 5.1 Update path (briefing-driven) `SKILL.md:26-34`
순서 강제: 번호 1~5 로 나열. "run in order" 같은 명시적 문구는 원문에 명시 없음.
| # | 단계 | 입력 | 행동 | 출력 | 통과 조건 |
|---|---|---|---|---|---|
| 1 | Generate the briefing | 쌍의 파일 아무거나 하나 (또는 인자 없음) | `pnpm run gen-translation-brief <any file of the pair>` | 변경 단위 지도 + diff + 단위별 3자 텍스트 + 용어 행 + 최초 등장 이동 노트 + 규칙 다이제스트 | 브리핑 출력됨. 원문은 별도 수치 기준 제시하지 않음 |
| 2 | Mechanical-only diff? `--apply` | 브리핑이 "모든 변경이 쌍이 byte-identical 하게 공유하는 코드 펜스 안"이라고 밝힘 | `pnpm run gen-translation-brief --apply <pair>` | 편집된 펜스가 counterpart 에 splice 됨 | "structure-validates the result before writing" — 구조 검증 통과해야 기록 |
| 3 | Prose diff? 서브에이전트에 위임 | 브리핑(또는 생성 명령) | 서브에이전트가 브리핑만으로 번역 | counterpart 의 수정 | 서브에이전트는 guidance corpus 재독·diff 재도출 금지 |
| 4 | Smallest edit | 서브에이전트 결과 | diff 가 건드리지 않은 부분의 검토된 표현 보존, 변경 hunk 를 원문과 절 단위로 대조 | 최소 수정된 counterpart | "nothing added, nothing dropped, terminology per the inline rows, code spans verbatim" |
| 5 | Record and verify, scoped | 확인한 쌍 | `verify-translation-pairing --write <pair>` 후 `verify-translation-pairing <pair>` | `.i18n.yaml` 해시 갱신 | 범위 지정 검증 통과 |

단계 1 브리핑의 구성요소 (`SKILL.md:30`):
> The briefing maps the change at the narrowest safely aligned granularity — changed Markdown units (paragraph, table row, list item, heading), then whole heading sections, then whole document

즉 granularity 폴백 순서: (a) 변경된 Markdown 단위(문단, 표 행, 리스트 항목, 제목) → (b) 제목 섹션 전체 → (c) 문서 전체.

브리핑에 담기는 것 (원문 열거):
- the authored side's diff since the last confirmed-consistent state
- each changed unit's last-confirmed source, current source, and current counterpart text (with line numbers)
- the terminology rows the change touches
- first-occurrence movement notes
- a digest of the binding update rules

단계 2 [게이트성 분기]: `--apply` 는 "when every change lies inside code fences that the pair shares byte-identically" 일 때만 쓴다. 이 조건이 아니면 단계 3 으로 간다.

단계 3 에스컬레이션 조건 (서브에이전트가 "whole-document path's sources of truth" 로 올라가는 경우, `SKILL.md:32`):
1. "an unlisted term with no precedent in the surrounding text"
2. "a whole-document briefing (`BOTH sides changed`, or neither units nor sections align), which always means reconciling by hand under [translation-rules.md]"

단계 5 의 범위 규칙:
> `--write` names exactly the pairs you confirmed — it refuses to run bare so a bulk re-record is always an explicit `--all`. The corpus-wide check still runs in `doc-sync`/CI; do not run it per-update. (`SKILL.md:34`)

탈락(게이트 실패) 시 에이전트 행동: 단계 5 검증 실패 시의 구체 지시는 원문에 명시 없음. 다만 `SKILL.md:60` 이 "Missing and out-of-sync rows are contract violations; the normal check rejects them." 라고 한다.

### 5.2 Whole-document path (new pairs) `SKILL.md:36-56`
[역할 분리 규칙]
> When translations need to be written from scratch, the orchestrating agent does not translate: spawn a subagent to do the translation work. (`SKILL.md:38`)
> The translator reads the sources of truth below first, then translates the whole file into the other language — section by section for long documents, keeping each section's structure locked to the source as you go rather than fixing structure at the end. (`SKILL.md:38`)

(a) 읽어야 할 sources of truth (`SKILL.md:40-46`, "read, don't re-summarize")
| 문서 | 원문 설명 |
|---|---|
| `docs/i18n/README.md` | "the pairing contract: the three-file pair (`foo.md`, `foo.zh.md`, `foo.i18n.yaml`), the consistency record's per-section hashes, the language-switcher lines, scope, and exclusions." |
| `docs/i18n/translation-rules.md` | "how to translate: faithfulness, structure preservation, terminology discipline, typography (MUST/SHOULD levels)." |
| `docs/i18n/terminology.md` | "the terminology table, binding in both directions. Load it BEFORE translating, not when a term feels uncertain; the terms you don't notice are the ones that drift." |
| `docs/i18n/translation-prompt.md` | "the automated pipeline's calibrated machine-consumed template. Agents using this skill do not render it; the terminology table is the only repository file the automated renderer injects, while this skill and `translation-rules.md` remain binding for agent-authored translations." |
| `dsh-prose-standard` | "required prose coverage and editorial judgment. Apply it to both sides without adding or dropping source propositions." |

(b) Translate 단계 (`SKILL.md:48-56`)
| 단계 | 입력 | 행동 | 출력 | 통과 조건 |
|---|---|---|---|---|
| Pass 1 — write, don't transpose | 의미 단위 하나 | 가장 가까운 style sample 의 register 로 네이티브 기술 저자처럼 재서술. "Preserve the required frame without forcing sentence-by-sentence correspondence." | 번역 초안(파일에는 최종 텍스트만) | 구조 프레임 보존 |
| Pass 2 — verify against the source, clause by clause | Pass 1 결과 + 원문 | "confirm nothing was added or dropped, every term follows the table, and each code span survived verbatim." | 수정된 번역 | 위 3개 확인. "Fix by rewriting the sentence natively, not by patching words into it." |
| Read the completed counterpart alone | 완성된 번역 파일 | 원문 없이 단독으로 읽고 어색한 표현 재작성 | 최종 파일 | 격리 상태에서 어색함 없음 (정량 기준 없음) |
> Fidelity is checked here, not written in (`SKILL.md:51`)

(c) 파일 기록 규칙: "Write only the final text to the file, never drafts or notes." (`SKILL.md:53`)

(d) 자동 게이트와 수동 검증의 분담 (`SKILL.md:56`)
- 게이트(자동) 검사 항목: heading depths, fenced blocks, table row and column counts, list kinds, ordered-list starts, list item counts, link locale, semantic targets.
- Pass 2 에서 수동 확인할 항목: list and table order, noncanonical list numbering, inline code, emphasis, meaning, terminology, tone.

### 5.3 Find the work `SKILL.md:58-62`
| 방법 | 설명 |
|---|---|
| `pnpm run verify-translation-pairing --list` | in-scope 문서 전부를 missing / out-of-sync / ok 로 출력 |
| `pnpm run gen-translation-brief` (무인자) | out-of-sync 쌍 전체 브리핑 |
| PR diff | "every changed side of a pair needs its counterpart updated and the pair re-recorded in the same PR, and the gate goes red if you forget." |

### 5.4 Finish the pair `SKILL.md:64-70`
| # | 내용 | 통과/게이트 |
|---|---|---|
| 1 | Switcher: 중국어 파일 H1 바로 뒤 `[English](foo.md) \| 中文`, 영어 파일 H1 뒤 `English \| [中文](foo.zh.md)`. 새 쌍이면 둘 다 추가. 예외: generator-owned English source 는 generator 출력과 byte-identical 유지, switcher 생략, 중국어 쪽은 여전히 되돌아가는 링크 유지 | 구조 게이트가 확인하는지는 원문에 명시 없음 (link locale 은 게이트 항목이나 switcher 는 "cross-locale exception", `SKILL.md:55`) |
| 2 | `verify-translation-pairing --write <pair>` 로 해시 기록. "only run it after you actually have [confirmed]" | 사람(에이전트)의 확인 선언이 전제 |
| 3 | 일반 문서는 매니페스트 항목 불필요. 정책 문서가 정당한 제외를 명시한 경우에만 manifest 수정 | - |
| 4 | PR 전: 건드린 쌍이 scoped check 통과. `pnpm run doc-sync` 는 PR 수준에서 한 번 ("not inside each translation task") | 게이트(CI 포함) |
| 5 | PR 가독성: 신규 쌍 vs 최소 업데이트 쌍을 구분해 서술, 「待定术语」 를 눈에 띄게 나열 | 사람 리뷰 지점 |

### 5.5 번역 리뷰 응답 `SKILL.md:72-74`
> Follow the [code-review reporting guidance](../dsh-code-review/SKILL.md#reporting-findings): evaluate each comment on its merits, and for terminology comments, remember the terminology table is the contract — apply a reviewer's rendering decision to [terminology.md](../../../docs/i18n/terminology.md), not only to one file.

### 5.6 루프 구조 도식
```
[Update]
 brief ──> (펜스만?) ──yes──> --apply ──(구조검증 실패 시 기록 안 함)──> --write ──> verify
        └─no──> subagent(브리핑만 사용)
                   ├─ 답 불가(미등재 용어 / BOTH sides changed) ──> whole-document 소스 + 수동 조정
                   └─ 최소 수정 ──> clause-by-clause 대조 ──> --write <pair> ──> verify <pair>

[New pair]
 orchestrator ──spawn──> translator subagent
   sources 읽기 ──> section 단위 Pass1 ──> Pass2 ──> 단독 읽기 ──> switcher ──> --write ──> verify ──> (PR 수준) doc-sync
```
- 재시도 상한, 수렴 조건의 수치: 원문에 명시 없음. Red-green-refactor 형 루프는 없다.
- 사람 개입 지점: (1) 사용자의 명시적 호출 (`SKILL.md:12`), (2) PR 리뷰와 「待定术语」 목록 (`SKILL.md:70`), (3) 리뷰어의 용어 결정 (`SKILL.md:74`). 질문 라운드·승인 요청 문구는 원문에 명시 없음.

## 6. 엔지니어링 규칙 분석
### 6.1 금지 규칙 (anti-pattern)
| # | 원문 | 막으려는 실패 모드 | 근거 |
|---|---|---|---|
| 1 | "Never select or load it for ordinary documentation work, from another skill, or from an inferred translation need" | 가벼운 번역 요청마다 무거운 확장 워크플로우가 켜짐 | `SKILL.md:12` |
| 2 | "Never re-translate a whole document to apply an update" | 이미 검토된 표현이 재번역으로 날아감 ("a re-translation throws that review away") | `SKILL.md:20` |
| 3 | "no guidance-corpus reading, no git archaeology" (update path) | 업데이트 한 건에 과도한 컨텍스트·비용 | `SKILL.md:20` |
| 4 | "never update, re-record, or repair either side after archival" | 봉인된 triplet 이 아카이브 verifier 에서 깨짐 | `SKILL.md:24` |
| 5 | "the subagent does not re-read the guidance corpus ... and does not re-derive the diff" | 브리핑이 이미 준 정보를 서브에이전트가 중복 탐색 | `SKILL.md:32` |
| 6 | "the orchestrating agent does not translate: spawn a subagent" | 오케스트레이터가 직접 번역하며 컨텍스트를 소모 | `SKILL.md:38` |
| 7 | "Write only the final text to the file, never drafts or notes." | 파일에 초안·메모가 남음 | `SKILL.md:53` |
| 8 | "Never invent a rendering inline." | 용어표에 없는 번역어를 즉석 창작 | `SKILL.md:54` |
| 9 | "Load it BEFORE translating, not when a term feels uncertain" | 인지하지 못한 용어가 드리프트함 | `SKILL.md:44` |
| 12 | `--write` 는 bare 로 실행 불가 ("it refuses to run bare") | 일괄 재기록으로 확인되지 않은 쌍까지 기록 | `SKILL.md:34` |
| 13 | "Agents using this skill do not render it" (`translation-prompt.md`) | 자동화 파이프라인용 템플릿을 에이전트가 직접 사용 | `SKILL.md:45` |
| 14 | "Pass 1 — write, don't transpose" | 문장 단위 직역 | `SKILL.md:50` |
| 15 | "Fix by rewriting the sentence natively, not by patching words into it." | 단어 패치로 어색한 문장이 남음 | `SKILL.md:51` |

### 6.2 강제 규칙 (수치 · 임계값 · 고정 형식)
| 항목 | 값 | 근거 |
|---|---|---|
| 파일 쌍 구성 | 3파일 (`foo.md`, `foo.zh.md`, `foo.i18n.yaml`) | `SKILL.md:42` |
| 번역 pass 수 | 2 pass + 단독 읽기 1회 | `SKILL.md:50-52` |
| 브리핑 granularity 단계 | 3단계 (변경 단위 → 제목 섹션 → 문서 전체) | `SKILL.md:30` |
| 코드 블록 | "byte-identical across the pair, comments included" | `SKILL.md:55` |
| 링크: 영어 쪽 | 활성 이중언어 코퍼스 내 대상은 `.md` | `SKILL.md:55` |
| 링크: 중국어 쪽 | 활성 이중언어 코퍼스 내 대상은 `.zh.md` | `SKILL.md:55` |
| 링크: 쿼리/프래그먼트 | "exact query/fragment suffix" 유지 | `SKILL.md:55` |
| 코퍼스 밖 링크 | "keep their authored path" | `SKILL.md:55` |
| 범위 내 counterpart 누락 링크 | "a missing in-scope counterpart is an error" | `SKILL.md:55` |
| switcher 위치 | H1 바로 뒤 | `SKILL.md:66` |
| 중국어 파일 switcher | `[English](foo.md) \| 中文` | `SKILL.md:66` |
| 영어 파일 switcher | `English \| [中文](foo.zh.md)` | `SKILL.md:66` |
| 미등재 중국어 용어 | "citable Chinese OSS/vendor precedent or stays English under 「待定术语」" | `SKILL.md:54` |
| 영어 타깃에서 모호한 원문 용어 | 짧은 gloss 로 보존하고 pending 으로 나열 | `SKILL.md:54` |
| 중국어 타깃 용어 컬럼 | 중국어 컬럼 + first-occurrence 컬럼 | `SKILL.md:54` |
| 영어 타깃 용어 컬럼 | 영어 컬럼 + 확립된 영어 기술 용어 | `SKILL.md:54` |
| 룰 수준 | MUST/SHOULD 두 단계 (`translation-rules.md` 의 typography 등) | `SKILL.md:43` |
| `--write` 범위 | 확인한 쌍만 명시. 전체는 명시적 `--all` | `SKILL.md:34` |
| `doc-sync` 실행 빈도 | PR 수준 1회 | `SKILL.md:69` |
| 게이트 검사 8항목 | heading depths / fenced blocks / table row·column counts / list kinds / ordered-list starts / list item counts / link locale / semantic targets | `SKILL.md:56` |

코드 커버리지 %, 파일 줄 수 상한, 재시도 횟수, 타임아웃, 함수 길이, 커밋 단위 등 숫자 임계값: 원문에 명시 없음. 이 스킬에서 숫자라고 할 만한 것은 위 표의 개수(3파일, 2 pass, 3단계, 8개 게이트 항목)가 전부다.

### 6.3 검증 방식 — 무엇을 근거로 "됐다"고 판정하는가
| 검증 | 성격 | 근거 |
|---|---|---|
| `verify-translation-pairing <pair>` 통과 | 스크립트(구조 검사: 8개 항목) | `SKILL.md:34`, `SKILL.md:56` |
| `--apply` 의 "structure-validates the result before writing" | 스크립트 | `SKILL.md:31` |
| `doc-sync` (페어링 + `verify-md-wrap` + `verify-md-links`) | 스크립트/CI | `SKILL.md:69` |
| 아카이브 verifier | 스크립트 (동결 노트용) | `SKILL.md:24` |
| Pass 2 절 단위 대조 (추가/누락 없음, 용어, 코드 스팬) | 에이전트 자기 확인 | `SKILL.md:51` |
| 리스트·표 순서, 비표준 번호, 인라인 코드, 강조, 의미, 용어, 어조 | 에이전트 수동 확인 ("manually verify") — 게이트가 못 잡는 영역 | `SKILL.md:56` |
| 단독 읽기 | 에이전트 자기 확인 | `SKILL.md:52` |
| `--write` 로 기록되는 해시 | 에이전트의 "I confirmed these two say the same thing" 진술을 해시로 고정 | `SKILL.md:67` |
| PR 리뷰 | 사람 확인 ("The yaml diff in your PR is the reviewable statement") | `SKILL.md:67` |

핵심 사실: 의미 동등성(meaning)은 스크립트가 아니라 에이전트의 자기 확인과 사람 PR 리뷰로만 판정된다. `.i18n.yaml` 해시는 "확인했다는 선언"을 기록할 뿐이며, 원문 스스로 "only run it after you actually have" 라고 선언의 정직성에 의존한다 (`SKILL.md:67`). 번역 품질 점수, 역번역 비교, 샘플링 검증 등은 원문에 명시 없음.

### 6.4 도구 사용 규칙
- 사용: `pnpm run gen-translation-brief`, `pnpm run verify-translation-pairing`, `pnpm run doc-sync` (§4.1).
- 서브에이전트: 산문 diff 와 새 쌍 번역은 위임 (`SKILL.md:32`, `SKILL.md:38`). 기계적 diff 는 서브에이전트 없이 `--apply` ("no subagent, no hand-editing", `SKILL.md:31`).
- 금지 도구: 명시적 금지 도구 목록은 원문에 명시 없음. 단 "no hand-editing" 은 `--apply` 경로에서의 지시이다.
- Claude Code 도구(Read/Edit/Bash 등)의 이름 언급: 원문에 명시 없음.
- `allowed-tools` frontmatter: 없음.

### 6.5 컨텍스트 · 토큰 규율
- Update path: 브리핑이 번역자의 "whole working set" 이다. 서브에이전트는 guidance corpus 를 재독하지 않는다. "the rules digest, terminology rows, and each changed unit's three-way context are inline" (`SKILL.md:32`).
- 브리핑은 변경 granularity 를 가장 좁게 잡는다 ("narrowest safely aligned granularity", `SKILL.md:30`).
- 오케스트레이터는 번역하지 않고 서브에이전트에 위임 (`SKILL.md:38`).
- 긴 문서는 "section by section" 으로 번역 (`SKILL.md:38`).
- 요약·압축 지시: sources of truth 는 "read, don't re-summarize" (`SKILL.md:40`). 컨텍스트 윈도 한도 수치는 원문에 명시 없음.
- 벤치마크 근거: 아카이브 노트 `2026-07-26-briefed-minimal-translation-updates.md` 가 "the benchmark evidence" 를 기록한다 (`SKILL.md:28`). 수치 자체는 이 스킬 원문에 없다.

### 6.6 모호어의 조작적 정의
| 모호어 | 원문 환산 | 근거 |
|---|---|---|
| "consistent" | 섹션별 해시가 `.i18n.yaml` 에 기록되고 scoped 검증을 통과한 상태 | `SKILL.md:42`, `SKILL.md:67` |
| "natural" | 가장 가까운 style sample 의 register 로 쓴 네이티브 기술 저자 문체. 수치 기준 없음 | `SKILL.md:50` |
| "out-of-sync" | `verify-translation-pairing --list` 가 보고하는 상태. 판정 알고리즘은 이 파일에 없음 | `SKILL.md:60` |
| "minimal update" | "Smallest edit that covers the diff", diff 가 건드리지 않은 곳의 표현 보존 | `SKILL.md:33` |
| "faithful" | "nothing added, nothing dropped, terminology per the inline rows, code spans verbatim" | `SKILL.md:33` |
| "mechanical-only diff" | "every change lies inside code fences that the pair shares byte-identically" | `SKILL.md:31` |
| "confirmed" | 에이전트가 두 쪽이 같은 말을 한다고 실제로 확인한 후 `--write` 실행 | `SKILL.md:67` |
| "equal authority" | 어느 쪽에서 수정하든 그 쪽이 그 업데이트의 원본(source) | `SKILL.md:16` |
| "genuine ... exclusion" | "generated, instructional, or bilingual-by-construction" | `SKILL.md:68` |
| "natural" 이외 "awkwardness" | 환산 규칙 없음. 단독 읽기에서 판단 | `SKILL.md:52` |
| "binding" | 용어표는 "binding in both directions" | `SKILL.md:44` |

"production-grade", "clean", "done", "simple" 같은 단어는 원문에 쓰이지 않는다 (원문에 명시 없음). 가장 가까운 "done" 환산은 §5.4 의 Finish the pair 5단계다.

## 7. 산출물
### 7.1 최종 결과물 형태
- **파일 diff**: counterpart 문서 (`foo.md` 또는 `foo.zh.md`), `foo.i18n.yaml`, 필요 시 `terminology.md`, `translation-pairing.manifest.json`.
- **PR**: 마지막 단계가 "Keep the PR reviewable: state which pairs are new versus minimally updated and list 「待定术语」 prominently." (`SKILL.md:70`)
- **중간 산출물**: 브리핑 (stdout 출력, 저장 경로는 원문에 명시 없음).
- 리포트·판정문 파일 형식: 원문에 명시 없음.

### 7.2 출력 포맷을 강제하는 템플릿
| 템플릿 | 내용 | 근거 |
|---|---|---|
| Switcher 라인 | 중국어: `[English](foo.md) \| 中文`, 영어: `English \| [中文](foo.zh.md)` | `SKILL.md:66` |
| `.i18n.yaml` | 섹션별 해시. 스키마의 세부는 `docs/i18n/README.md` 소관이며 이 스킬에 없음 | `SKILL.md:42`, `SKILL.md:67` |
| 용어 pending 표기 | 「待定术语」 | `SKILL.md:54`, `SKILL.md:70` |
| PR 서술 형식 | 신규 쌍 / 최소 업데이트 쌍 구분 + 「待定术语」 | `SKILL.md:70` |

### 7.3 커밋 · PR · 브랜치, 파괴적 동작
- 커밋 명령, 브랜치 생성, push: 원문에 명시 없음. PR 언급은 있으나 (`SKILL.md:62`, `SKILL.md:69-70`) `git commit` / `gh pr` 실행 지시는 없다.
- 파괴적 동작:
  - 문서 삭제·이름 변경 시 counterpart 와 `.i18n.yaml` 삭제·이름 변경 (`SKILL.md:22`).
  - `--apply` 는 counterpart 파일에 splice 해서 기록 (`SKILL.md:31`). 구조 검증을 통과해야 기록.
  - `--write` 는 `.i18n.yaml` 을 덮어쓴다 (recomputes and records).
  - force push, 마이그레이션: 원문에 명시 없음.
- 보호 장치: `--write` bare 실행 거부 (`SKILL.md:34`), 동결 노트 수정 금지 (`SKILL.md:24`).

## 8. 주의점 / 한계 (여기서만 평가)
### 8.1 오작동 · 과잉작동 시나리오
1. **이름 없이 호출되지 않는 스킬이라 발견성이 낮다.** `disable-model-invocation: true` 이므로 에이전트는 스스로 이 스킬을 켜지 못한다. 사용자가 이름을 모르면 평범한 번역 요청은 `docs/AGENTS.md` 경로로만 처리되고, 이 스킬이 가진 브리핑·scoped 검증 흐름을 쓰지 못한다. 설계 의도(비용 통제)와 맞바꾼 것이다.
2. **"해시 = 확인했다는 선언"에 의존한다.** `--write` 는 에이전트가 실제로 확인했는지 검증하지 못한다. 의미 동등성은 게이트 검사 8항목(구조) 밖이고 (`SKILL.md:56`), 자기 확인과 PR 리뷰만 남는다. 서브에이전트가 번역하고 오케스트레이터가 `--write` 하는 구조라면, 오케스트레이터가 서브에이전트 결과를 얼마나 대조했는지 원문은 규정하지 않는다.
3. **BOTH sides changed 가 수동 경로로 낙하한다.** 양쪽이 동시에 바뀐 경우 "always means reconciling by hand" (`SKILL.md:32`). 브리핑의 저비용 이점이 사라지고, 자동 규칙이 없어 판단이 에이전트에 달린다. 어느 쪽이 우선인지 규정은 "equal authority" 뿐이다 (`SKILL.md:16`).
4. **오케스트레이터가 번역하지 않는 규칙과 `--apply` 경로의 긴장.** `--apply` 는 서브에이전트 없이 splice 하므로, 펜스 판정이 틀리면(브리핑이 "shares byte-identically" 라고 오판) 구조 검증만 믿고 기록된다. 구조 검증이 코드 펜스 내용 일치까지 보는지 이 파일만으로는 알 수 없다 (원문에 명시 없음).
5. **용어표 갱신의 파급.** 리뷰어의 용어 결정을 `terminology.md` 에 반영하면 (`SKILL.md:74`) 이미 기록된 다른 쌍들의 일관성이 깨질 수 있다. 이에 대한 후속 처리(영향 쌍 재번역·재기록) 지침은 원문에 명시 없음.
6. **「待定术语」 가 누적될 수 있다.** 미등재 용어는 인용 가능한 선례가 없으면 영어로 두고 pending 목록에 올린다 (`SKILL.md:54`). 해소 절차·기한은 원문에 명시 없음.

### 8.2 다른 스킬 · CLAUDE.md 와의 충돌 가능 지점
- `docs/AGENTS.md` 의 "one-shot, one-pass rule" 과 이 스킬의 2-pass + 단독 읽기가 의도적으로 분리되어 있다 (`SKILL.md:12`). 사용자가 이름을 부르는 순간 후자가 우선하며, 두 규칙 사이의 우선순위 명문화는 이 파일에 없다.
- `dsh-prose-standard` 를 "Apply it to both sides" 로 요구한다 (`SKILL.md:46`). 해당 스킬의 규칙이 번역 규칙(구조 보존, 문장 대응 강제 안 함)과 충돌할 경우의 해소 규칙은 원문에 명시 없음.
- `dsh-pre-push-checks` 는 `doc-sync` 를 PR 수준 1회로 규정한다고 이 스킬이 인용한다 (`SKILL.md:69`). 두 스킬이 어긋나면 이 파일만으로 판단 불가.
- 일반 CLAUDE.md 의 "수정 후 전체 테스트 실행" 류 규칙이 있다면 "corpus-wide check ... do not run it per-update" (`SKILL.md:34`) 와 충돌할 수 있다. 사용자 CLAUDE.md 내용은 원문에 명시 없음.
- 오케스트레이터 번역 금지 (`SKILL.md:38`) 는 서브에이전트를 생성할 수 없는 환경에서는 실행 불가다. 그 경우의 대체 경로는 원문에 명시 없음.

### 8.3 검증 공백
- 번역 품질의 자동 측정(역번역, 샘플링, 모델 평가) 없음.
- 의미 동등성은 게이트 밖 (`SKILL.md:56` 의 수동 항목).
- Pass 2 의 "nothing added, nothing dropped" 는 에이전트 자기 진술이다. 증빙(체크리스트 출력 등)을 남기라는 지시는 원문에 명시 없음.
- 단독 읽기 단계의 통과 기준 없음.
- 검증 실패 시 재시도 횟수·에스컬레이션 규정 없음.
- `--apply` 가 거부된 경우의 지시는 "structure-validates the result before writing" 외에 원문에 명시 없음.
- 이 분석은 스킬 디렉터리 내 파일만 읽었다. 링크된 `docs/i18n/*`, 아카이브 노트, 형제 스킬은 읽지 못했으므로 그곳의 규칙과 수치는 본 분석에 포함되지 않았다.

### 8.4 유지보수 리스크
- 하드코딩된 상대 경로: `../../../docs/...`, `../../notes/archived/process/2026-07-26-briefed-minimal-translation-updates.md`, `../dsh-prose-standard/SKILL.md` 등. 디렉터리를 옮기면 링크가 깨진다.
- 스크립트 이름 3종(`gen-translation-brief`, `verify-translation-pairing`, `doc-sync`)과 플래그(`--apply`, `--write`, `--list`, `--all`)에 의존. 스크립트 CLI 가 바뀌면 스킬이 어긋난다.
- 날짜가 박힌 아카이브 노트 파일명(2026-07-26)과 동결 규칙. 스킬 본문이 자신의 근거(벤치마크)를 외부 노트에 위임해 이 파일만으로 검증 불가.
- 중국어 전용 표기 「待定术语」 가 규약에 고정되어 있다. 다른 언어 추가 시 규칙 재작성이 필요하다 (원문에 명시 없음, 구조상의 관찰).
- 스킬 하나가 양쪽 규칙 문서(`translation-rules.md`)와 `translation-prompt.md` 사이의 "binding" 범위를 다르게 서술한다 (`SKILL.md:45`). 문서 간 역할이 바뀌면 이 문단을 같이 고쳐야 한다.

### 8.5 한 줄 판정
**조건부 도입 권장** — DeepSeek-Harness 와 같이 `foo.md`/`foo.zh.md`/`foo.i18n.yaml` 쌍, `pnpm` 스크립트 3종, `docs/i18n/*` 문서군이 갖춰진 저장소에서만 의미가 있으며, 근거는 브리핑 기반 최소 수정 + 스크립트 구조 게이트 + 명시적 호출 한정이라는 비용 통제 설계가 원문에 일관되게 서술되어 있기 때문이다 (단, 의미 동등성은 자기 확인과 PR 리뷰에만 의존).
