# scroll-craft 분석

## 1. 개요

**원본 경로**: `/Users/kkh/Desktop/skills-analize/skill-analysis/scroll-craft`
(`skills-lock.json` 기준 출처: `nateherkai/scroll-craft`, `plugins/nateherk-design/skills/scroll-craft/SKILL.md`)

**핵심 파일**: `SKILL.md` — 24,784 bytes

**전체 파일 목록 (24개, 전수 조사 완료)**

| 파일 | bytes | 역할 |
|---|---|---|
| `SKILL.md` | 24,784 | 진입점. Step 0~5 워크플로우, Hard rules 표, 출력 규정 |
| `CHANGELOG.md` | 33,591 | 스킬 자체의 변경 이력. 각 규칙이 어느 빌드의 실패에서 나왔는지 기록 |
| `references/uniqueness.md` | 23,527 | 구조 축. 8개 page grammar, signature move, fingerprint gate |
| `references/verify.md` | 24,189 | 검증 절차. 하네스가 무엇을 보고 무엇을 못 보는지, 실패 사례표 |
| `references/devices.md` | 26,648 | 디바이스 킷 10종의 마크업·수치·함정 |
| `references/worldflight.md` | 16,155 | 연속 세계 페이지 모드의 마크업·트랙 수학·seam 법칙 |
| `references/taste.md` | 14,874 | 타이포·간격·색·모션의 "바닥선(taste floor)" |
| `references/assets.md` | 13,194 | kie.ai 생성 파이프라인, 인코딩, 실사 푸티지 그레이딩, 비용 |
| `references/feel.md` | 13,181 | 감정 축. feeling curve, peak, tell-someone test, feel check |
| `references/approved-collection.md` | 11,664 | 승인된 10개 사이트 재빌드 표준 + 배포 전 증거 게이트 |
| `references/device-diag.html` | 9,149 | 실기기(아이폰) 스크럽 진단 페이지. MOVING/FROZEN 판정 |
| `references/worlds.md` | 8,046 | 8개 아트디렉션 world와 style preamble 원문 |
| `references/template.html` | 6,418 | 6막 스켈레톤 HTML |
| `references/hero-depth.md` | 6,316 | 히어로 레이어링(입체감) 기준선 + Sonder 승인 예시 |
| `engine/scrollcraft.js` | 58,540 | 런타임. `data-sc-*` 를 읽어 스크롤로 구동. DOM 생성 없음 |
| `engine/scrollcraft.css` | 19,769 | 토큰·유틸리티·reduced-motion·모바일 폴백 |
| `scripts/shoot.mjs` | 33,308 | 검증 하네스. 액트별 샘플링, 콘트라스트/데드스크롤/프로즌클립 |
| `scripts/worldflight-assert.mjs` | 12,951 | worldflight 모드 기계적 단언 24종 |
| `scripts/kie.mjs` | 7,780 | kie.ai 이미지/영상 생성 CLI (`probe`/`still`/`shot`) |
| `scripts/doctor.mjs` | 7,117 | 프리플라이트. node/ffmpeg/playwright/Chrome/키/워크스페이스 |
| `scripts/workspace.mjs` | 3,707 | 워크스페이스 경로 해석 (`SCROLLCRAFT_HOME` → `.scrollcraft.json` → `<git root>/scrollcraft`) |
| `scripts/encode.sh` | 3,222 | 스크럽용 조밀 GOP 인코딩 |
| `scripts/serve.mjs` | 2,063 | 정적 서버 (`file://` 로는 검증 불가하므로 필수) |
| `templates/FINGERPRINTS.md` | 2,387 | 빈 레지스트리 시드 파일 |

**성격 한 줄**: 생성(construction) 스킬이다. 다만 계획 단계에 탈락 가능한 게이트 1개(fingerprint gate)와 배포 전 검증 게이트 1개(Step 5 하네스)를 내장하고 있어, 순수 생성형보다 통과 조건이 훨씬 촘촘하다.

**원문 자기 규정**

> **What you produce:** an interview brief, a page grammar, a customer-journey map,
> a feeling curve with one engineered peak, a scroll score, one signature move,
> generated assets, one real HTML page on a token-driven design floor, and a strip
> of screenshots proving it holds up at every scroll position.
> (`SKILL.md:26-29`)

> Scroll is the only input every visitor already knows how to use. This skill
> treats it as a timeline: the wheel is a scrubber, the page is a film with real
> text on top (`SKILL.md:21-23`)

---

## 2. 활성화 조건 (언제 켜지는가)

### frontmatter `description` 전문

```
Build premium scroll-driven landing pages for service, product, food, and
drink brands. Plan the visitor journey, page grammar, emotional peak, and
bespoke signature move. Create dimensional heroes with independent visual
planes, restrained motion, and separate mobile composition. Use supplied
photos and footage or generate photoreal assets through kie.ai, write semantic
HTML, and verify desktop, mobile, and reduced-motion scroll states visually.
Use for "scrollcraft", "scroll craft", "layered hero", "premium hero",
"cinematic hero", "scrollytelling", "scroll animation site", "a site where
scrolling plays a video", "Apple-style landing page", "3D scroll world",
"interactive landing page", "make my brand a scroll experience", "this looks
like a template", or requests for a distinctive website that feels like an
experience rather than a document.
```

### 매칭되는 실제 사용자 발화 예시

1. "우리 커피 브랜드 랜딩페이지를 Apple 스타일로 만들어줘" — `"Apple-style landing page"` 직격
2. "스크롤하면 영상이 재생되는 사이트 만들어줘" — `"a site where scrolling plays a video"` 직격
3. "이 페이지 너무 템플릿 같아 보이는데 고쳐줘" — `"this looks like a template"` 직격
4. "히어로를 시네마틱하게, 레이어 있게 만들어줘" — `"layered hero"`, `"cinematic hero"`
5. "scrollytelling 되는 브랜드 사이트" — `"scrollytelling"`
6. "문서 같지 않고 경험처럼 느껴지는 웹사이트" — `requests for a distinctive website that feels like an experience rather than a document`
7. "3D 스크롤 월드 인터랙티브 페이지" — `"3D scroll world"`, `"interactive landing page"`

### 의도적으로 배제되는 발화

description은 다른 스킬 이름을 지목하지 않는다. **외부 스킬로의 라우팅 규칙은 원문에 명시 없음.** 대신 스킬 **내부** 라우팅이 강하게 박혀 있다.

- 대시보드/작업용 화면: `hero-depth.md`에 배제 문구가 있다.
  > Working surfaces such as dashboards do not need an invented marketing hero.
- 정적/단순 지시가 명시된 경우: > Honor explicit static or simpler directions.
- "하나의 끊김 없는 세계"를 원하면 act 모드가 아니라 worldflight 모드로 강제 이동:
  > **This grammar REQUIRES worldflight mode.** `data-sc-mode="worldflight"` (`uniqueness.md` §2.4)
- 소프트웨어 데모형 요구는 live surface grammar로, 단 진짜로 동작하지 않으면 사용 금지:
  > If the panels cannot actually compute, the grammar is unavailable. Pick another.
- 개념/가상/출시 전 브랜드는 숫자 카운터 금지:
  > **A concept, fictional or pre-launch brand has no verified figures, so it has no counters.** (`devices.md` §7)

### frontmatter 기타 필드

- `allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion` — 존재함.
- `model`, `metadata`, `version`, `license` 등: **없음. 원문에 명시 없음.**
- 참고: `allowed-tools`에 웹 접근 도구(WebFetch/WebSearch/브라우저)가 없다. 이 사실은 §8에서 다룬다.

---

## 3. 적합 / 부적합

### 적합

- 실제 브랜드 자산(로고·제품컷·푸티지·브랜드 가이드)이 이미 있는 마케팅 랜딩 1페이지.
  > A build from the user's own photos and footage needs no key and no spend, and that is a first-class route, not a fallback. (`SKILL.md:198-201`)
- 소비재·식음료·서비스처럼 "느낌"이 전환에 직결되는 브랜드. description이 명시: `service, product, food, and drink brands`.
- 사람이 인터뷰에 답할 수 있는 상황. 8문항이 워크플로우의 입력이다.
- 이미 여러 개를 만들어 봤고 **서로 달라야 하는** 경우. fingerprint gate가 존재 이유 그 자체다.
- Node/ffmpeg/Chrome/Playwright를 깔 수 있는 로컬 환경.

### 부적합·과함

- 대시보드·관리도구·내부 툴: 위 §2 배제 문구.
- 문서형 사이트, 블로그, 문서 포털: 이 스킬은 "document"의 반대를 정의로 삼는다.
- 자산이 하나도 없고 생성 예산도 없는 경우 — 다만 원문은 대안을 제시한다:
  > Also the right answer when there are no good assets and generating them would produce eight plausible, forgettable frames. (`uniqueness.md` §2.5 typographic poster)
- 핫픽스·소규모 수정: Step 0 인터뷰 → Step 5 하네스까지 전 과정이 하드룰로 묶여 있다.
  > | Shipping without running Step 5 | Run Step 5 | (`SKILL.md` Hard rules)
- 길이를 억지로 늘리는 상황은 원문이 직접 금지한다:
  > Never add filler or empty pinning to hit a length target.

### 형제 스킬 대신 이걸 고르는 판정 기준

이 컬렉션에는 스킬이 `scroll-craft` 하나뿐이다(디렉터리 내 다른 SKILL.md 없음). **형제 스킬 비교 대상 원문에 명시 없음.** 내부 선택 기준은 하나로 요약된다: 페이지가 "읽히는 문서"여야 하면 이 스킬이 아니고, "지나가는 경험"이어야 하면 이 스킬이다.

---

## 4. 전제 조건과 외부 의존성

### 실행 스크립트 / 런타임

| 항목 | 요구 | 근거 |
|---|---|---|
| Node | `major >= 18` | `doctor.mjs` — `add("required", "node", major >= 18, ...)` |
| ffmpeg | **full build**, 필터 개수 > 200 | `doctor.mjs` — `add("required", "ffmpeg (full build)", filterCount > 200, ...)` |
| libwebp 인코더 | optional | `"Posters fall back to JPEG. Not fatal, just heavier."` |
| playwright-core | 검증 시 필요. **빌드 폴더에서** 설치 | `"Run \`npm i playwright-core\` inside the build folder."` |
| Chrome | 설치본 필수. 번들 Chromium 불가 | > **Real Chrome, not bundled Chromium.** Chromium ships without an h264 decoder (`verify.md`) |
| bash | `encode.sh` | `#!/usr/bin/env bash`, `set -euo pipefail` |

### API 키·환경변수·네트워크

- `KIE_AI_API_KEY`: **자산을 생성할 때만 필요.** `doctor.mjs`에서 등급이 `optional`.
- 네트워크: `https://api.kie.ai` (createTask / recordInfo / chat/credit), `https://kieai.redpandaai.co/api/file-base64-upload` (로컬 참조 이미지 업로드). 그 외 `localhost:4500` 등 로컬 서버.
- 환경변수 전체: `SCROLLCRAFT_HOME`, `SCROLLCRAFT_FFMPEG`, `SCROLLCRAFT_CHROME`, `SCROLLCRAFT_CRF`, `KIE_AI_API_KEY`.

### 요구하는 리포지토리 전제

- 테스트 러너·CI·린터·타입시스템: **요구하지 않음. 원문에 명시 없음.**
- 커밋 권한·브랜치 전략: **요구하지 않음.** git은 워크스페이스 루트 탐색에만 쓰인다 —
  > `<project root>/scrollcraft`, where the project root is the nearest ancestor holding a `.git` (`SKILL.md:186-187`)
- 빌드 프로젝트에 `package.json`이 필요하다(‑ `playwright-core` 해석이 `cwd`의 `package.json` 기준).

### 비용 발생 지점

> **Published unit costs** (kie.ai, as of August 2026): `seedream/5-pro` still =
> **28 credits**, `kling/v2-1-pro` 5s clip = **160 credits**. A seven-still,
> two-clip page is therefore around 520 credits. (`assets.md`)

> Two reconciliations against the account with no other consumer put actual
> debits at about 38% of the per-call sum: 1447 summed against 530 debited, and
> 2252 summed against 856 debited. (`assets.md`)

> **Plan against those rates; expect the ledger to debit roughly 0.4x of them.**

- 병렬 빌드 시 잔액 델타로는 원가 귀속 불가:
  > three parallel builds each read the same 7597 → 7067 and each reported 530 (`verify.md`)
- CI 분: 사용 없음. 토큰: 참조 문서가 총 ~200KB, 상황에 따라 다수를 읽는다.

### 상태 파일·산출물 디렉터리

- 워크스페이스 해석 순서(`SKILL.md:183-187`, `workspace.mjs`):
  1. `SCROLLCRAFT_HOME`
  2. cwd에서 위로 올라가며 찾은 `.scrollcraft.json` 의 `{ "workspace": "..." }`
  3. `<project root>/scrollcraft` (project root = `.git` 보유 최근접 조상, 없으면 cwd)
- 생성물:
  - `<workspace>/builds/` , `<workspace>/lab/` (mkdir recursive)
  - `<workspace>/builds/<name>/BRIEF.md`
  - `<workspace>/FINGERPRINTS.md` (없으면 `templates/FINGERPRINTS.md` 복사, **빈 레지스트리**)
  - 빌드 폴더 내 `scrollcraft.js` / `scrollcraft.css` 복사본, `assets/`, `out/`
  - 검증 산출물 `lab/shots/NN.png`, `lab/shots/report.json`, `lab/shots/sheet.png`, `lab/mobile`, `lab/reduced`

---

## 5. 워크플로우

순서 강제 문구가 곳곳에 박혀 있다.

> **Establish the brief before generating anything.** (`SKILL.md:84`)
> Environment, not a stage of the work. Do it once the interview is answered and before Step 1. (`SKILL.md:157-158`)
> Three things in order, and the first two come before any act planning. (`SKILL.md:249`)
> **Write the feeling curve before the score table.** ... Curve first, acts second (`SKILL.md:272-273`)
> Read taste.md before writing markup, not after (`SKILL.md:349-350`)
> Run it in this order, and do not reread BRIEF.md first. The whole value is in arriving cold. (`feel.md` §6)

### Step 0 — 브리프와 창작 권한

- **입력**: 사용자 요청.
- **행동**: 8문항 1패스 인터뷰. (1) vibe 3~5단어 + 최대 3개 레퍼런스(사이트는 금지), (2) 섹션별 스크롤 여정, (3) 에너지 곡선, (4) 단계별 감정 + 기억할 ONE moment, (5) 다른 사이트가 안 하는 한 가지, (6) premium-minimal에서 얼마나 멀리, (7) **one unbroken world vs distinct scenes**, (8) 보유 자산.
- **출력**: `<workspace>/builds/<name>/BRIEF.md`. 최소 포함물: 8주제 + 축어 답변, feeling curve(막당 1줄), peak(친구에게 말할 문장), tell-someone 문장, 의도된 침묵.
- **통과 조건**: 하드룰 —
  > | Generating before the brief and creative authority are clear | Run Step 0. Record actual answers or explicitly delegated authored decisions in `BRIEF.md` |
- **사람 개입 지점 O.** 두 개의 우회로가 명시돼 있다: 명시적 위임 시 `Self-authored under explicit creative delegation`, 사람이 정말 부재하면 `Self-authored, not interviewed` 로 표시하고 최종 보고에 밝힌다. 후자는 fallback으로 규정.

### Bootstrap — 환경 (**게이트**)

- `node <skill>/scripts/doctor.mjs`
- **탈락 조건**: `Required failures exit non-zero.` — `doctor.mjs`가 `process.exit(1)`.
- 탈락 시 행동: > Say plainly which items are missing rather than working around them silently.
- `node <skill>/scripts/workspace.mjs --ensure`, 엔진 2파일 복사.
  > Never edit the engine per-project; it is the mechanism.

### Step 1 — 여정

- **입력**: Step 0 답변. 5문항 추가(무엇/누구, 끝났을 때 믿어야 할 한 문장, 다음 행동 1개, 보유물, 아트디렉션).
- **행동**: 4~7 beats 작성.
- **통과 조건**: > a section that serves no beat is cut, however nice the shot is.

### Step 2 — 그래머 → 시그니처 무브 → **fingerprint gate** → feeling curve → score

- **grammar**: 8종(filmic one-shot / chaptered editorial / live surface / continuous world / typographic poster / gallery-catalog / split stage / rhythmic cutlist) 중 택1. 새 그래머는 구조적 제약을 새로 정의해야 인정.
  > A new grammar is allowed when its navigation, sequence, ending, and explicit bans describe a different structure; a new label alone earns no credit.
  > filmic one-shot을 고르면 > say in the report why the other seven did not fit the interview.
- **signature move**: 페이지 전용 인터랙션 1개. 엔진 수정 금지.
  > The test: **describe the move to someone who has seen the other builds. If they cannot tell it apart from something the kit already does, it is not a signature move.**
- **fingerprint gate (탈락 가능)**:
  > **The gate: a new build must differ from EVERY existing row on at least 4 of the 6.** Not 4 of 6 on average across the table. Four against each row, individually.
  > 6차원: grammar / nav treatment / hero device / act-sequence shape / close pattern / signature move.
  > Dimension 6 is free ... So the gate really asks for three more out of the remaining five.
  - **탈락 시 행동**: > **If the planned build fails the gate, change the plan, not the log.**
- **feeling curve → score table**: 막당 감정 1줄 → 이후 beat별 device 배정 표.

**빌드 전 체크 (8개, 모두 Step 2 통과 조건)**

| 체크 | 원문 |
|---|---|
| 그래머 금지 준수 | `The grammar's bans hold.` |
| 디바이스 패밀리 | `Four or more distinct device families.` |
| 연속 금지 | `No device family twice in a row.` |
| scrub 상한 | `At most two \`scrub\` acts.` |
| 인접 감정 | `No two adjacent acts carry the same feeling. If they do, one is filler.` |
| peak | `One act is the peak and it has the largest span by a visible margin.` |
| 길이 | `Eight to fourteen viewport-heights is a pacing reference ... not a quota.` |
| 지문 밴드 | `The act count and total length do not land in the 6-to-7 acts at 13.6-13.8vh band that all four prior builds hit.` |

### Step 3 — 자산 생성

- `kie.mjs probe` → `still` → `shot` → `encode.sh` (desktop / mobile 2회).
- 4가지 결정 요인: 하나의 style preamble을 **축어 재사용**, 모든 PNG를 눈으로 확인, 스크럽용 인코딩, 히어로 레이어링.
- 통과 조건은 육안 판정. > **Look at every asset before you use it. Read the PNG.**

### Step 4 — 페이지 작성

- `references/template.html`에서 시작, 토큰 6색 + 2폰트만 오버라이드.
- > The engine reads `data-sc-*` attributes off your markup and drives it; it never generates DOM.

### Step 5 — 스크롤로 검증 (**게이트**)

```bash
npm i playwright-core
node <skill>/scripts/serve.mjs --root . --port 4500 &
node <skill>/scripts/shoot.mjs --url http://localhost:4500 --out lab/shots
node <skill>/scripts/shoot.mjs --url ... --out lab/mobile --width 390 --height 844
node <skill>/scripts/shoot.mjs --url ... --out lab/reduced --reduced-motion
```

- 하네스 보고 항목: **DEAD SCROLL**, **FROZEN CLIP**, **CUES THAT NEVER PEAK**, **CONTRAST**(합성 화면 기준, 라인별 방향 판정), 콘솔 에러/실패 요청. worldflight면 legs never reach full opacity / legs stuck on poster 추가.
- worldflight는 추가 게이트: `node <skill>/scripts/worldflight-assert.mjs --url ...` — 24종 단언, 실패 시 `process.exit(1)`.
- 기계가 못 보는 부분은 사람/모델이 본다: `sheet.png` 읽기, 탭 포커스 순서, **feel check**(콜드 스크롤 → 단어 1개/막 → BRIEF.md와 diff).
  > **Where they disagree, the page is wrong, not the brief.**
- **루프**: > Fix what you found and shoot it again. — **재시도 상한·수렴 조건 원문에 명시 없음.**
- 실기기 한계 고지 의무: > **And say what a green run does not cover: a real phone.** 모바일 결함 보고 시 **첫 라운드에** `device-diag.html`을 함께 배포.

### 워크플로우 도식

```
Step 0 인터뷰(8문항, 사람) ──┐
                            ├─> BRIEF.md ─> Bootstrap[게이트: doctor exit≠0]
                            │
Step 1 journey(4~7 beats) <─┘
   │
Step 2  grammar ─> signature move ─> [게이트: fingerprint 4/6 vs 모든 행]
                                        └ 실패 → 계획 수정(로그 수정 금지)
   ├─> feeling curve ─> score table ─> 8개 체크
   │
Step 3 assets (kie.mjs / 실사 푸티지) ─> encode.sh (desktop+mobile)
   │
Step 4 HTML (template.html + taste.md 선독)
   │
Step 5 [게이트] serve → shoot ×3 → (worldflight면 assert) → sheet.png 육안 → feel check
   └── 결함 → 수정 → 재촬영 (상한 없음)
   │
출력: 빌드 폴더 + 리포트 + FINGERPRINTS.md 행 추가
```

---

## 6. 엔지니어링 규칙 분석

### 금지 규칙(anti-pattern) — `SKILL.md` Hard rules 원문과 막으려는 실패 모드

| Never (원문) | 막으려는 실패 모드 |
|---|---|
| `Clay diorama / low-poly / claymation as the default world` | AI 생성 사이트의 하우스 스타일화. `A clay render of a can does not make anyone thirsty.` |
| `A "scroll" cue, arrow, or animated mouse icon` | 불필요한 지시문. `They are looking at the hero; they know` |
| `01 / 06` section counters | 정보가 아닌 장식 |
| `An eyebrow above every section heading` | 리듬 없는 나열. 상한 `At most one per three sections` |
| `Em dash anywhere visible` | AI 문체 표식 |
| `Centred copy in every act` | 앵커 단조로움 |
| `The same device twice in a row` | 5개 섹션이 사실상 1개 |
| `Generating before the brief and creative authority are clear` | 근거 없는 자산 낭비 |
| `A page with no engineered peak, or with three competing ones` | peak-end rule 붕괴. `A page with three peaks has none.` |
| `An ending that trails off, fades out, or just becomes a footer` | 마지막 감정 소실 |
| `Planning acts before the feeling curve exists` | `a device chosen before the feeling is a device looking for a reason` |
| `Shipping without one bespoke signature move` | 리스킨 |
| `A build that clears fewer than 4 of 6 fingerprint dimensions against any existing row` | 자기 복제 |
| `Editing the engine to get a bespoke behaviour` | 엔진 포크 분기 |
| `Reaching for filmic one-shot because it is what the last build did` | 기본값 회귀 |
| `A full-frame dark overlay to fix contrast` | 사진 전체를 버림 |
| `Text baked into a generated image` | 선택·번역·해상도 손실 |
| `Invented statistics in a counter` | 신뢰·법적 리스크 |
| `transition: all`, or animating width/height/top/left | 레이아웃 스래싱 |
| `Gradient text, neon glow, zero-offset coloured halo shadows` | 가짜 깊이 |
| `Autoplaying audio, or any audio at all on a scrub clip` | 자동재생 정책 위반 |
| `Shipping without running Step 5` | 검증 생략 |

`taste.md`의 "refuse list"는 이보다 넓다(카드 그리드 구조, 3열 피처카드, 중첩 카드, 커스텀 커서, 이모지 아이콘, monospace 코스프레, `border-left` 1px 초과, `elevate/seamless/unleash/next-gen/revolutionize/supercharge` 등 filler 동사, 히어로 텍스트 요소 4개 초과, 히어로 헤드라인 2줄 초과·서브텍스트 20단어 초과). 단 성격이 다르다:
> Category defaults, not bans on principle. The brief's own words can earn any of them.

각 grammar의 `Bans:` 목록은 별개의 강제 금지다. 예: chaptered editorial은 `scrub` beyond one chapter / `spotlight` / `magnet` 금지, rhythmic cutlist는 `pin`/`spotlight`/`magnet`/`dwell`/`parallax` 금지 및 `any act over ~1.4 viewport-heights` 금지.

### 강제 규칙 — 수치 전량

**구조/페이싱**

| 항목 | 값 | 출처 |
|---|---|---|
| journey beats | 4~7 | `SKILL.md` Step 1 |
| device families | ≥ 4 | `SKILL.md` Step 2 |
| 같은 family 연속 | 금지 | 〃 |
| `scrub` act | 최대 2 | 〃 / `devices.md` §1 |
| 페이지 총 길이 | 8~14 viewport-heights (참조값, 쿼터 아님) | `SKILL.md`, `feel.md` §5 |
| 금지 밴드 | 6~7 acts @ 13.6~13.8vh | `SKILL.md` |
| fingerprint | 6차원 중 **4** 이상 상이, 모든 행 개별 비교 | `uniqueness.md` §4 |
| cutlist act 상한 | ~1.4vh, `dwell` ≤ 0.1, 섹션 12~20개 | `uniqueness.md` §2.8 |

**디바이스 (`devices.md`)**

| 항목 | 값 |
|---|---|
| `scrub` 히어로 span | 2.2~3.0 (`Below 1.8 the clip flies past; above 3.5 the reader starts wondering whether the page is broken.`) |
| `data-sc-dwell` | 0~0.6 |
| lerp | 기본 0.18, `clamped to 0.02 to 1`, reduced motion 1.0, worldflight 권장 0.12 |
| deadband | `8ms desktop, 20ms mobile` |
| `pin` 최소 span | ~1.2 (span ≤ 1이면 travel 1px) |
| cue overlap | `roughly 15% of the act`, ramp 기본 각 30% |
| `pan` span | 아이템당 ~1vh + 1. 오버플로 `at least half a viewport` |
| `reveal` iris | `roughly once per page` |
| `kinetic` | `One kinetic headline per act, at most` |
| `parallax` | `rate * (p - 0.5) * 100` px. 프레임 내부 0.3~1.5, 풀블리드 1~2, 총 travel ~200px 초과 금지, 3레이어 (`five is a diorama`) |
| 레퍼런스 히어로 지연율 | far 31%, mid 17%, product 20%, foreground·copy 1x. 인접 plane 차이 10~30% |
| 섹션 바닥 페이드 | 마지막 200~300px |
| `count` | ease-out, 1.2~1.8초 (기본 `data-sc-count-ms` 1400), 절반 가시 시 1회 |
| `in` | opacity 0 + rise ~14px / 620ms, stagger 30~80ms, 트리거 `-12%` |
| `tilt` / `magnet` | 5~9도(12 초과 = 장난감) / 0.2~0.35, primary CTA 한정 |
| `drift` | 3~5 stops |

**worldflight (`worldflight.md`, 엔진 확인)**

| 항목 | 값 |
|---|---|
| `data-sc-w` 기본 | 1.3 |
| `data-sc-seam` 기본 | 0.12, `clamp(seam, 0.02, 0.4)` |
| `data-sc-linger` | 최대 0.6 |
| spacer 높이 | `(sum of the leg weights + 1) viewport-heights`, px로 기입 |
| 프리페치 | `±1.6vh` |
| copy translate 상한 | `4vh` (+2vh → -2vh) |
| pointer events | opacity > 0.5 |
| z-index | 현재 leg 120, 나머지 `100 + opacity × 10` |
| poster push-in | `scale(1.03 + local × 0.14)` |
| 페이스 | `rate = weight / clip_seconds`, `0.21 to 0.22vh per second of film is a good floor` (orrery 36% 편차 → 6%) |

**인코딩/자산 (`encode.sh`, `assets.md`)**

| 항목 | 값 |
|---|---|
| desktop | 1080p, `-g 8`, `-keyint_min 8`, `-sc_threshold 0`, crf 20, `-an`, `+faststart` |
| mobile | 720p, `-g 4`, crf 24 |
| CRF 오버라이드 | 4번째 위치인자 > `SCROLLCRAFT_CRF` > 기본 |
| 용량 기대치 | 5s 1080p ~3MB, 720p ~1.5MB, 2클립 ~9MB. grain-heavy는 5~6MB, crf 22~23 |
| 6막 페이지 자산 | 클립 2개 + 스틸 4~6개 |
| seedream `--ar` | `16:9`→2736x1520, `9:16`→1520x2736, `3:4`→1776x2352, **`4:5` rejected** |
| 실사 푸티지 | 24~30fps로 데시메이트, `-c copy` 금지, 레벨 확장은 중간 파일에서 |
| kling seam | 인코딩된 mp4에서 `-sseof -0.15`로 추출. orrery 10leg 이음매 PSNR 28.5~39.8 dB |
| kie 타임아웃 | still 15분, shot 20분. 폴링 4000ms부터 ×1.25, 최대 15000ms |

**타이포/색 (`taste.md`, `scrollcraft.css`)**

| 항목 | 값 |
|---|---|
| 폰트 패밀리 | 최대 2개 |
| body measure | 45~75ch, `--sc-measure: 62ch` |
| line-height | display 0.94~1.06, body 1.6 (`--sc-leading-body: 1.62`) |
| display 상한 | 히어로 외 ~6rem. `--sc-t-4xl: clamp(3.4rem, 1.9rem + 6.6vw, 7.5rem)` |
| 700px 이하 | 히어로를 `--sc-t-2xl`로 한 단 내림 |
| 색 역할 | 6개 + accent 1개 (하드컷 라이트/다크 페이지는 1 hue 2 lightness 예외) |
| 대비 | body ≥ 4.5:1, large ≥ 3:1, controls·focus ≥ 3:1 |
| 간격 | 4px 베이스 `--sc-1`(0.25rem) ~ `--sc-11`(12rem) |
| elevation | 3단계 (`--sc-e1/2/3`) |
| grain | 4~5% (`opacity: 0.045`) |
| UI 전환 | < 300ms, hover 120~180ms, buttons 100~160ms |
| easing | `--sc-ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `ease-in` 금지 |
| enter scale | `scale(0.95)`, `scale(0)` 금지. press `scale(0.97)` 또는 `translateY(1px)` |
| 모바일 브레이크포인트 | 860px, `.sc-stage { height: 100svh }` |

**하네스 임계값 (`shoot.mjs`)**

| 항목 | 값 |
|---|---|
| 샘플링 | 액트당 기본 6 (`--per-act`), 액트 내 `p = 0.02 + f * 0.96` |
| scrub 추가 샘플 | 진입/이탈 슬라이드 각 3점 (스테이지 가시율 0.6 / 0.75 / 0.9) |
| worldflight | leg당 동일 밀도 + seam당 4점 (`-0.5, -0.2, 0.2, 0.5 × seam`) |
| 뷰포트 | 1440×900, dpr 2 / 모바일 390×844 |
| settle | `|cur - target| < 0.002 && !seeking`, 타임아웃 4000ms |
| dead scroll 최소 간격 | act 0.25vh, worldflight 0.12vh |
| frozen clip | 가시율 ≥ 0.55, Δt < 0.012s, 최소 0.15vh (중간 홀드는 0.5vh) |
| cue 약함 | 최대 opacity < 0.8 |
| contrast 채점 | opacity ≥ 0.85인 라인만. FAIL < 3:1, THIN 3~4.5:1 |
| contact sheet | `scale=520:-1`, `tile=min(5,n)×rows` |
| worldflight assert | 24종, lerp 기본 0.18 확인, copy translate ≤ 4vh, seam 단조성, reduced motion 시 클립 fetch 0건 |

**승인 컬렉션 증거량 (`approved-collection.md` §7)**
> The approved collection recorded 819 section samples, 30 desktop/phone/reduced runs, 24 additional interaction/fallback checks, and 11 package-root browser checks. Those counts describe its evidence, not quotas for every future site.

### 검증 방식 — 무엇을 근거로 "됐다"고 하는가

세 층으로 나뉜다.

1. **기계 측정 (자동, 재현 가능)** — `shoot.mjs`의 dead scroll / frozen clip / weak cue / composited contrast / console errors / failed requests, `worldflight-assert.mjs`의 24종 단언. 이것만이 통과·실패가 수치로 나온다.
2. **육안 판정 (모델 자기 진술)** — `sheet.png` 읽기, 구도·모션 부드러움·의미. 원문이 스스로 한계를 인정한다:
   > **Whether the composition is any good.** ... **Whether the page means anything.** Six acts that each work and together say nothing is the most expensive failure available here.
3. **자기 진술 (검증 불가)** — feel check(콜드 스크롤 후 막당 단어 1개, BRIEF.md와 diff), fingerprint gate 통과 여부, "왜 다른 7개 그래머가 탈락했는지". 어떤 스크립트도 이것들을 확인하지 않는다. **fingerprint gate는 전적으로 자기 진술이며, 레지스트리 행을 고쳐서 통과시키는 것을 금지하는 문장만 존재한다.**

원문이 인정한 검증 공백(그대로 옮김):

- `Cues are keyed by their text.` — 같은 문자열 두 개는 한 행으로 합쳐짐
- `Lines under 0.85 opacity are skipped.`
- `The floor is not size-aware.`
- `Acts with no [data-sc-cue] elements are not graded at all.`
- `Ordinary flow acts are excluded from dead-scroll checks.`
- `A pan act whose rail does not overflow is reported as healthy.` (pigment 빌드: 1368px 레일 / 1440px 뷰포트 → travel 0, 매 패스 `no dead scroll detected`)
- 실기기: > every probe reported the hero clip scrubbing perfectly for **four consecutive rounds while the real phone showed a frozen frame**.
- 포트 점유: > `shoot.mjs` then gets a perfectly good `200` from **whatever else is on that port** ... writes a full contact sheet and a clean report for a site you did not build.

### 도구 사용 규칙

- 손으로 확인하지 말고 프리플라이트 실행: > **Run the preflight rather than checking by hand.**
- `file://` 금지, `serve.mjs` 사용. 번들 Chromium 금지, 설치된 Chrome 사용.
- 포스터 추출 시 맨 `ffmpeg` 금지, `encode.sh`가 해석한 바이너리 사용:
  > **Use the same ffmpeg `encode.sh` resolved, not bare `ffmpeg`.**
- 엔진 편집 금지, 페이지 로컬 JS로 `--sc-p` 구동.
- 자동화 컨텍스트에서 네이티브 포인터 락/캡처 비활성 (`shoot.mjs`가 `addInitScript`로 강제).
  > Never request pointer lock for parallax.
- 모바일 결함 보고 시 첫 라운드에 `device-diag.html` 배포.
- 병렬 생성 시 잔액 델타로 원가 주장 금지.

### 컨텍스트·토큰 규율

**서브에이전트 위임·요약·압축·파일 읽기 범위 지시는 원문에 명시 없음.** 유일한 규율은 조건부 선독 지시("Read X before Y")뿐이며, 이는 토큰 절약이 아니라 순서 강제 목적이다. 실제로는 참조 문서 총 ~200KB 중 다수를 읽게 되는 구조다.

### 모호어의 조작적 정의

| 단어 | 원문이 환산하는 값 |
|---|---|
| **premium** | 히어로의 실제 평면 분리 + 차등 이동(`Several stacked elements moving as one image do not meet this preference.`), taste floor 전 항목, 대비 4.5:1, 6색 토큰, 3단 elevation, grain 4~5% |
| **unique / not a template** | fingerprint 6차원 중 4개 이상 상이 + signature move 1개 + 8 grammar 중 근거 있는 선택 |
| **done / ship** | Step 5 3회 촬영 + sheet.png 육안 + feel check diff + (worldflight면) assert 24종 + FINGERPRINTS 행 추가 |
| **memorable** | tell-someone 문장이 디바이스 이름이 아니라 경험이어야 함. `"it has a scrub video" is a device name. No memory hook yet.` |
| **peak** | 페이지에서 가장 큰 span + 자산 예산 + 앞의 침묵. `A page with three peaks has none.` |
| **smooth** | `weight / clip_seconds` 편차 수 % 이내 + lerp 0.18(worldflight 0.12) |
| **simple / clean** | **환산 규칙 없음. 원문에 명시 없음.** |

---

## 7. 산출물

### 최종 결과물의 형태

- 빌드 폴더 하나: `index.html`(직접 작성한 시맨틱 마크업), 복사된 `scrollcraft.js` / `scrollcraft.css`, `assets/`(mp4 desktop+mobile, webp 포스터), `BRIEF.md`, `lab/shots|mobile|reduced`(PNG 시퀀스 + `report.json` + `sheet.png`).
- 짧은 리포트(텍스트) + `<workspace>/FINGERPRINTS.md`에 행 1줄 추가.

### 출력 포맷을 강제하는 템플릿

**리포트 (`SKILL.md` Output 원문)**

> The build folder, including `BRIEF.md`, then a short report: the grammar and why
> the other seven lost, the signature move, the fingerprint gate result against
> each existing row, the journey, the feeling curve and the peak, the feel-check
> diff (intended curve against felt curve, and what you changed), the score table
> (device per beat), what you generated, what you verified with screenshots, and
> anything you could not verify. Say if the brief was self-authored rather than
> interviewed. Give the local URL. Keep it brief; the page is the deliverable.
>
> Then append the build's row to `<workspace>/FINGERPRINTS.md`.

**score table 형식** (`SKILL.md` Step 2): `| Beat | Device | Why this one |`

**FINGERPRINTS 행 형식** (`templates/FINGERPRINTS.md`): `| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |` + "What is taken" 불릿.
> Rows are append-only. A build that has been superseded stays in the table.

**BRIEF.md 최소 구성**: 8주제 축어 답변 / feeling curve / peak / tell-someone 문장 / 의도된 침묵.

**패키징 규칙** (`approved-collection.md` §7): > Package only needed assets and licenses; exclude keys, private submissions, and local databases. State which hosting or integrations remain unconfigured.

### 커밋·PR·파괴적 동작

- **git 커밋/브랜치/PR 조작: 전혀 없음.** git은 워크스페이스 루트 탐색에만 사용.
- **force push, 마이그레이션: 없음.**
- 파일 삭제: 명시적 삭제 없음. 단 덮어쓰기는 있다 — `encode.sh`의 `ffmpeg -y`, `kie.mjs`의 `fs.writeFileSync`, `shoot.mjs`의 `page.screenshot({path})`가 같은 `lab/` 경로에 반복 기록.
- 디렉터리 생성: `workspace.mjs --ensure`가 `<workspace>/builds`, `<workspace>/lab`을 `recursive`로 생성. 워크스페이스가 미설정이면 **git 루트에 `scrollcraft/` 디렉터리가 새로 생긴다.**
- 외부 전송: `kie.mjs`가 로컬 참조 이미지를 base64로 `kieai.redpandaai.co`에 업로드한다(`uploadPath: "scrollcraft"`). 브랜드 자산이 제3자 호스트로 나간다.
- `serve.mjs`는 읽기 전용이며 루트 밖 접근을 차단한다(`if (!file.startsWith(ROOT)) 403`).

---

## 8. 주의점 / 한계 (여기서만 평가)

### 오작동·과잉작동 시나리오

1. **fingerprint gate의 점진적 교착.** 6차원 중 signature move는 정의상 항상 다르므로 실질 요구는 나머지 5개 중 3개다. 레지스트리가 10행쯤 쌓이면 "모든 행에 대해 개별적으로 3/5"를 만족시키는 조합이 급격히 줄고, 8개 그래머와 유한한 nav/close 패턴 조합이 먼저 소진된다. 원문은 `change the plan, not the log`만 말하고 **레지스트리 은퇴·리셋 절차를 규정하지 않는다**(`Rows are append-only`). 결국 브랜드에 부적합한 그래머를 "아직 안 쓴 칸"이라는 이유로 고르게 되는 압력이 생긴다.
2. **게이트가 자기 진술이라는 점.** fingerprint 통과, "다른 7개 그래머가 왜 졌는지", feel check diff는 모두 모델이 스스로 보고한다. 검증 스크립트가 없다. 정직하게 수행하면 강력하지만, 압박이 걸리면 가장 먼저 형해화될 층이다. 원문도 이를 알고 문장으로만 막는다: `A build that reports them as identical on the first pass either got lucky or did not do the check cold.`
3. **핫픽스·소규모 요청에 전 과정이 발동.** "히어로 문구만 바꿔줘"에도 Step 0~5가 하드룰로 걸려 있어 과잉 작동 위험이 크다. 부분 실행에 대한 예외 규정은 원문에 없다.
4. **비용 오발.** `--ref`를 붙인 재생성 루프("generation is cheap; reroll")는 명시적으로 권장되는데, 상한이 없다. 유일한 안전장치는 `probe` 전후 비교이고 병렬 실행 시 그마저 귀속 불가라고 원문이 인정한다.
5. **하네스 그린의 오독.** `pan` 레일 오버플로 0, flow act, opacity 0.85 미만 라인, cue 없는 act는 애초에 채점 대상이 아니다. `no dead scroll detected` + `contrast clean`을 "페이지 정상"으로 보고하면 원문이 열거한 실패를 그대로 재현한다.

### 다른 스킬·기존 CLAUDE.md 규칙과 충돌 가능 지점

- **`allowed-tools`에 웹 도구가 없다.** 그런데 `approved-collection.md` §1은 요구한다: > Research visual references in the browser, including their intermediate scroll states. Godly, Awwwards, motion galleries ... A list of URLs is not evidence of design research. 또 §1은 > For an existing product, inspect its current official website and documentation. 도구 권한과 지시가 정면 충돌한다. 실행 환경이 WebFetch/브라우저를 별도로 주지 않으면 이 요구는 수행 불가이며, "했다"고 보고되면 그게 곧 허위 진술이다.
- **미니멀·최소 diff 지향 스킬/규칙과 정면 충돌.** 이 스킬은 6막·2클립·수백 KB 자산·전용 검증 하네스를 요구한다. "가장 단순한 해법", "최소 변경" 계열 규칙과 같은 세션에 있으면 매 단계 충돌한다.
- **전역 문체 규칙 오염 위험.** `Em dash anywhere visible` 금지, `01 / 06` 금지, filler 동사 금지는 **페이지 카피에 대한 규칙**인데 문장이 일반적이어서 대화 전반으로 새기 쉽다.
- **엔진 사본 관리.** `Never edit the engine per-project`인데 동시에 빌드마다 엔진 2파일을 복사한다. CHANGELOG는 수동 동기화를 반복 기록한다: `Synced byte-identical to all eight build folders and cmp-verified.` 사본 수만큼 드리프트 위험이 선형 증가하고, 이를 자동화하는 스크립트는 패키지에 없다.
- **워크스페이스 부작용.** 설정이 없으면 git 루트에 `scrollcraft/` 디렉터리를 만든다. 남의 리포에서 실행하면 예상 밖의 디렉터리가 생긴다.

### 검증 공백 (원문이 확인하지 않고 넘어가는 것)

- 원문이 자인한 목록은 §6에 옮겼다. 그 외에 스킬 어디에서도 확인하지 않는 것들:
  - **접근성 자동 검사 없음.** 탭 순서·focus ring은 "탭해 보라"는 사람/모델 지시뿐이고, `axe` 류 자동 점검은 없다. 핀 액트의 키보드 포커스는 엔진이 못 고친다고 명시돼 있으며 (`It does not fix a pinned act, and cannot with this approach.`) 페이지 로컬 핸들러 작성을 개발자에게 넘긴다.
  - **성능 예산 없음.** 9MB 영상 가이드 외에 LCP/CLS/TBT 같은 지표나 측정 절차가 없다.
  - **SEO/메타/OG 검증 없음.** 템플릿에 `<title>`과 `description`만 있다.
  - **저작권/라이선스 검증 없음.** 생성 자산과 공급 푸티지의 권리 확인 절차가 없다.
  - **`worldflight-assert.mjs`는 lerp가 정확히 0.18인지 단언**(`ok("lerp rate is the 0.18 default", Math.abs(trace.lerp - 0.18) < 1e-9)`)하는데, 같은 패키지의 `worldflight.md`는 이 모드에서 **0.12를 권장**한다. 권장을 따르면 이 단언은 실패한다. 문서 대 스크립트의 직접 모순이다.

### 유지보수 리스크

- **하드코딩된 모델명·가격.** `seedream/5-pro-text-to-image`, `seedream/5-pro-image-to-image`, `kling/v2-1-pro`, 그리고 `as of August 2026` 기준 28/160 크레딧. 모델이 바뀌면 `kie.mjs`의 `MODELS` 상수와 `assets.md` 표가 동시에 썩는다.
- **검증된 aspect ratio 표가 경험칙.** `Treat the table as the verified set rather than as the whole allowed list` — API가 목록을 주지 않으므로 표는 추정 불가 영역으로 남는다.
- **끊긴 참조.** `uniqueness.md` §4와 `templates/FINGERPRINTS.md`가 모두 `EXAMPLES.md`를 가리키는데(`A worked twelve-row registry ships as EXAMPLES.md in the scroll-craft repository`) **이 패키지에는 없다.**
- **타인 머신 경로.** `hero-depth.md`의 `OtherWorlds/sonder-studio/`(optional로 명시), `CHANGELOG.md`의 `OtherWorlds/Ultimate Websites/builds/`. 후자는 optional 표기 없이 서술된다.
- **특정 개인 취향의 규범화.** 여러 파일이 "Nate"라는 실명 개인의 선호를 baseline으로 못박는다: `Nate's standing hero preference`, `On September 4, 2026, Nate approved the rebuilt ten-site collection`. 다른 클라이언트의 브리프와 충돌할 때 무엇이 이기는지 규정이 없다. `hero-depth.md`가 `Honor explicit static or simpler directions.`로 일부만 완화한다.
- **플랫폼 편향된 경로 탐색.** ffmpeg/Chrome 후보 목록이 Windows WinGet 경로부터 하드코딩돼 있다. macOS/Linux 경로도 있지만 비표준 설치는 환경변수로만 구제된다.
- **`shoot.mjs`의 서버 부작용.** > a `shoot.mjs` run can take the background server process down with it when it finishes. 매 라운드 포트 확인이 사실상 필수인데 자동화돼 있지 않다.

### 한 줄 판정

**조건부 도입.** 근거: 검증 하네스(`shoot.mjs` + `worldflight-assert.mjs`)가 실제로 측정 가능한 실패(frozen clip, 합성 대비, dead scroll)를 잡아내고 그 임계값이 전부 문서화돼 있어 값이 분명하다 — 다만 핵심 차별화 장치인 fingerprint gate와 feel check가 전적으로 자기 진술이고, `allowed-tools`가 `approved-collection.md`가 요구하는 브라우저 리서치를 지원하지 않으므로, **브랜드 마케팅 랜딩 1페이지를 로컬 Node/ffmpeg/Chrome 환경에서 만들 때만** 켜고 그 외 작업에서는 꺼야 한다.
