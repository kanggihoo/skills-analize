## impeccable/impeccable

> 분석 대상: `/Users/kkh/Desktop/skills-analize/design/impeccable/impeccable` (v4.7.1, engine 0.1.17, 작성자 pbakaus, https://impeccable.style)
> 상위 폴더 `design/impeccable/`에는 이 skill 폴더 하나만 있고 다른 top-level 파일은 없다.
> `*.ko.md`는 모두 영문 파일의 한국어 번역본(사용자 저장소에서 추가한 것으로 보임)이다. 아래 분석은 영문 원본 기준이다.

---

### 파일 구성

```
impeccable/
├─ SKILL.md (85줄, 12KB)            진입점: 원칙, Setup 3단계, 4개 Mode, Commands 표, 라우팅
├─ SKILL.ko.md (86)                 번역본
├─ agents/                          subagent 정의 (Codex용 TOML 형식)
│  ├─ impeccable_asset_producer.toml (47)       comp 잘라낸 부분 → raster "plate" 재생성, decision comp 1장 생성
│  ├─ impeccable_finish_reviewer.toml (41)      완성된 빌드를 새 context에서 검수하고 disposition 4종 반환 (reasoning high)
│  ├─ impeccable_documenter.toml (27)           완성된 빌드에서 DESIGN.md와 sidecar 역추출
│  ├─ impeccable_manual_edit_applier.toml (95)  live 모드에서 사용자가 브라우저로 고친 문구를 소스에 반영
│  └─ openai.yaml (3)                           Codex UI 표시 이름/기본 프롬프트
├─ reference/  (영문 약 450KB ≈ 110k tokens. 필요한 것만 로드)
│  ├─ routing.md (24)          인자 없이 호출 시 context 기반 메뉴 (signals + detect 실행)
│  ├─ new-work.md (152줄, 62KB)  ★핵심. 새 화면이나 시각 세계 교체 흐름 전체 (concept-seed, decision page, comp-led build-phase, finish review)
│  ├─ craft-floor.md (50)      ★UI 편집 직전 항상 로드하는 품질 하한선과 금지 목록
│  ├─ mode-persuade.md / mode-operate.md / mode-read.md (19~21)  concept-seed가 출력하는 MODE RULES 원문
│  ├─ operate.md (61)          Operate/Read 화면의 심화 규칙 (타입 스케일, 모션 ms, 컴포넌트 상태)
│  ├─ visualize.md (47)        comp 3장 생성 규칙, 승인 지점, plate/provenance
│  ├─ region-map.md (26)       comp를 region(plate/image/texture/text/control/chrome)으로 나누는 규칙
│  ├─ component-review.md (63) plate와 코드 영역 계획에 대한 사용자 검수, hero 검수 manifest
│  ├─ init.md (131)            PRODUCT.md 인터뷰와 작성
│  ├─ shape.md (59)            코드 없이 디자인 brief만 작성
│  ├─ document.md (416)        DESIGN.md 생성 (Google Stitch DESIGN.md 포맷 + .impeccable/design.json sidecar)
│  ├─ extract.md (69)          반복 패턴을 토큰과 컴포넌트로 추출
│  ├─ critique.md (841, 49KB)  UX 비평: A/B 독립 subagent, Nielsen 10 휴리스틱, 인지부하, 페르소나 5종
│  ├─ audit.md / audit.native.md (139)  기술 감사 5개 차원 0–4점 (/20)
│  ├─ polish / bolder / quieter / distill / harden / onboard / animate / colorize /
│  │  typeset / layout / delight / overdrive / clarify / adapt / optimize (.md)  개별 서브커맨드 playbook (33~362줄)
│  ├─ adapt.native.md (58), ios.md (51), android.md (46)  네이티브 플랫폼 규칙
│  ├─ live.md (327, 37KB), live-setup.md (104), generate.md (101)  브라우저 오버레이 기반 변형 생성 모드
│  ├─ hooks.md (113), doctor.md (54)   detector hook 관리, 산출물 drift 점검
│  ├─ craft.md (5)             deprecated alias
│  └─ degraded/ (finish-reviewer, documenter, asset-producer, manual-edit-applier .md)
│                               subagent가 없는 하네스에서 같은 일을 in-thread로 하는 대체 지침
└─ scripts/
   ├─ impeccable (213, sh) / impeccable.cmd (239)  launcher. 실제 엔진은 폐쇄형 단일 binary
   ├─ VERSION ("0.1.17"), command-metadata.json (98)  서브커맨드 설명과 argumentHint
   ├─ live-browser.js (13,645줄, 554KB)   페이지에 주입하는 live 오버레이 UI
   ├─ live-browser-dom.js (320) / -session.js (183) / -ignores.js (246)  오버레이 보조 (DOM, 세션 복구, detector ignore 해석)
   ├─ modern-screenshot.umd.js (29KB)     DOM 스크린샷 라이브러리 (vendored)
   └─ data/font-index.json (1.1MB, 한 줄), font-index-failures.json   Google Fonts 글꼴 형태 fingerprint index (font-match용)
```

중요: `scripts/bin/`이 **없다**. launcher는 `$IMPECCABLE_BIN`, `bin/<os>-<arch>/impeccable`, `~/.impeccable/bin/...`, PATH 순서로 binary를 찾는다. 모두 없으면 첫 실행 때 GitHub release(`engine-v0.1.17`)에서 내려받고 sha256을 검증한다. 그래서 `context`, `detect`, `concept-seed`, `comp-spec` 같은 핵심 로직은 **이 폴더에서 읽을 수 없는 폐쇄형 binary 안에 있다**.

---

### frontmatter

```yaml
name: impeccable
description: "Use when the user wants to design, redesign, shape, critique, audit, polish, simplify, harden, animate, or otherwise improve a frontend interface: websites, landing pages, dashboards, product UI, components, forms, settings, onboarding, empty states, and native iOS or Android screens. Handles UX review, hierarchy, layout, typography, color, motion, UX copy, accessibility, responsive behavior, edge cases, and capturing or documenting design systems (DESIGN.md, tokens). Also for making bland UI bolder, loud UI quieter, or ambitious visual effects. Not for backend-only or non-UI tasks."
metadata:
  version: 4.7.1
```

- `disable-model-invocation`, `allowed-tools`, `argument-hint`, `user-invocable` 같은 invocation 플래그는 **없다**. description만으로 자동 트리거된다.
- 서브커맨드의 argumentHint는 `scripts/command-metadata.json`에 따로 있다. `pin <command>`로 `$polish` 같은 독립 shortcut을 만들 수 있다.
- 호출 표기는 `$impeccable <command>`(Codex 스타일)이다. Claude Code, Codex, Cursor, Copilot, Gemini, Grok을 모두 지원하는 멀티 하네스 skill이다.

---

### 트리거와 사용 시점

- frontend UI 작업 전반이 대상이다. 새 화면, 리디자인, 리뷰, 감사, 다듬기, 모션, 카피, 반응형, 디자인 시스템 문서화가 모두 포함된다. 네이티브 iOS/Android 화면도 다룬다.
- 인자 없이 호출하면 메뉴를 보여 준다. 명시적으로 부르거나 의도가 분명한 서브커맨드는 해당 reference를 로드한다. 그 외 일반 디자인 요청은 PRODUCT.md가 없으면 `init`을 거쳐 `new-work`로 가고, 좁은 수정은 기존 코드 위에서 바로 진행한다.
- backend나 UI가 아닌 작업에는 쓰지 않는다.

### 입력 → 출력

| 입력 | 출력 |
|---|---|
| 사용자 요청과 대상(파일, route, URL), 프로젝트 코드 | 실제 UI 코드 수정(주 산출물) |
| PRODUCT.md, DESIGN.md, surface brief(있으면) | **PRODUCT.md**(제품 사실), **DESIGN.md**와 `.impeccable/design.json`(시각 토큰), surface brief(`## Direction contract`) |
| (comp-led) 이미지 생성 도구 | `.impeccable/mocks/*.png`(comp와 prompt sidecar `.json`), `.impeccable/build/spec.json`, plate 이미지, `.impeccable/review/*.png`, diff 보고서 |
| (critique/audit) | 채팅 보고서(점수표, P0–P3), `.impeccable/critique/` snapshot(이후 polish가 backlog로 읽는다) |
| (live/generate) 실행 중인 dev server | 브라우저 오버레이에서 고를 수 있는 변형 N개. 사용자가 accept하면 소스에 반영한다 |

---

### 동작 흐름 (agent가 실제로 따르는 단계)

**공통 Setup (SKILL.md)**
1. 세션마다 한 번 `scripts/impeccable context [--target <path>]`를 실행한다. binary가 PRODUCT.md, DESIGN.md, 해당 surface brief, 네이티브 플랫폼 가이드를 찾아 출력하고 directive도 함께 내보낸다(`NO_PRODUCT_MD`, `CONTEXT_STALE`, `MANUAL_DETECTOR_REQUIRED`, `IMAGE_GEN_AVAILABLE`, `UPDATE_AVAILABLE` 등). agent는 이 directive를 그대로 따르고 다시 실행하지 않는다.
   - launcher가 실패하면 "Context loading did not run…"을 먼저 알린 뒤 PRODUCT.md와 DESIGN.md를 직접 읽는다. 없는 내용을 지어내지 않는다.
2. 요청에 맞는 playbook을 로드한다. 서브커맨드면 해당 reference를, 새 화면이면 `new-work.md`를 읽는다. 편집 전에 대상과 기존 시각 상태(실제 렌더나 VR golden)를 확인한다.
3. **모든 UI 편집 직전에 `craft-floor.md`를 로드한다.** 계획만 하는 작업에서는 로드하지 않는다.
4. Mode는 요청된 surface를 기준으로 고른다(Persuade / Operate / Read / Experience). 같은 회사라도 랜딩은 Persuade, 문서는 Read다.

**Progressive disclosure 구조**: SKILL.md(약 3k tokens)는 라우터 역할만 한다. 서브커맨드별 reference는 그 커맨드를 실행할 때만 로드한다. new-work 안에서도 `visualize.md`는 comp-led일 때만 읽는다. binary가 `NEXT read <path>/visualize.md`처럼 다음에 읽을 파일을 출력해 로드 시점을 강제한다. mode 규칙은 `concept-seed`가 MODE RULES 블록으로 출력하고, 실행하지 않았을 때만 `mode-*.md`를 직접 읽는다.

**new-work 흐름 (새 화면이나 시각 세계 교체)**
1. **이미 정해진 것 판단**: Redesign이면 시각 세계를 교체한다. 기존 세계가 있으면 그것을 상속하고, 부분적인 브랜드만 있으면 확장하고, 시각적 기준이 없으면 새로 만든다. 기존 surface 안의 섹션이나 컴포넌트는 새 정체성을 만들지 않는다.
2. **질문 2–3개**(structured question tool 사용): mode별 핵심 질문을 던진다(Persuade: 누가 행동해야 하고 어떤 증거가 있는가, Operate: 과업, 상태, 빈도). CSS 값이나 미리 정해진 미학 선택지는 묻지 않는다.
3. **창작 범위 결정**
   - 기존 surface 확장: concept tournament를 하지 않는다.
   - 기존 세계 안의 새 화면 전체: 구조 5–7개를 도출한 뒤 `concept-seed --scope surface`가 무작위로 3개를 뽑아 카드로 보여 준다.
   - 세계 생성이나 교체: (a) 제품의 고유 메커니즘, 청중의 장면, 문화적 배경을 정의하고 범주의 뻔한 페이지와 그 반대를 "rut"로 배제한다. (b) 청중이 익히 아는 시각 체계, 사물, 장소, 의례에서 후보 7개를 뽑는다(같은 재료 계열이 4개 이상이면 다시 찾는다). (c) **`concept-seed --scope direction --mode <m>`를 반드시 실행한다.** 스크립트가 주사위로 지정 방향을 정하고 카탈로그 challenger를 섞는다. 이 스크립트 실행 전에 코드를 쓰면 "contract violation"이다. (d) challenger는 audience identification과 product clarity 두 축으로 평가해 wins / competitive / declined로 판정한다. declined여도 그 discipline 하나를 지정 방향에 "raise"로 이식한다. (e) **decision page**를 띄운다: `serve-question --start --payload`가 로컬 웹 페이지를 열고, 카드(assigned, IMPECCABLE'S PICK, challenger 최대 3, canon card)와 re-roll(plain/safer/bolder)을 보여 준다. `--wait`로 답을 받고, 페이지가 실패하면 structured tool로 대체한다.
4. **세계 확정**: color strategy(Restrained / Committed 30–60% / Full palette / Drenched)를 먼저 정한 뒤 색을 고른다. 다크/라이트는 사용 장면을 한 문장으로 써서 정한다. 금지 글꼴 목록을 적용하고 AI 수렴 미학 4종 calibration을 점검한다.
5. **결정 기록**: surface brief에 `## Direction contract`를 6블록(THESIS / OWN-WORLD / STORY / FIRST VIEWPORT / FORM+seed ref / FINISH)으로 쓴다. `surface-brief write/read`로 저장하고 다시 읽어 검증한다. contract는 빌드 산출물(HTML 주석, data-* 등)에 절대 넣지 않는다.
6. **빌드**
   - **Comp-led** (Persuade/Experience에 이미지 생성 도구가 있을 때 기본): `build-phase start`로 디스크 기반 state machine을 시작하고 phase를 순서대로 진행한다.
     0) comps: comp 3장을 만들어 사용자 승인을 받는다(sidecar에 `"approved": true`).
     1) spec: `comp-spec --grid`를 실행하고 regions.json을 작성한다. `font-match --measure/--rank`로 글꼴을 측정한다.
     2) plates: raster region마다 plate를 재생성한다(asset_producer subagent, 1.5배 해상도 이상). 이어서 사용자 plan/asset 검수(component-review serve)를 받는다.
     3) hero: `build-phase scaffold`가 레이아웃 CSS 변수를 생성한다. 첫 viewport를 구현한 뒤 `comp-diff`로 검사한다. 72% 이상이고 hard veto가 없어야 통과하며, 3번 실패하면 사용자 검수로 넘긴다.
     4) sections, 5) motion, 6) responsive(1440 데스크톱과 390 모바일 캡처, diff 검사).
     각 phase는 `build-phase advance`의 exit 2(실패)를 통과해야 넘어간다.
   - **Code-led** (Operate/Read는 항상 이 경로): comp 없이 FIRST VIEWPORT와 signature interaction contract로 야심을 대신한다.
7. **검수와 마무리**: 스크린샷 라운드는 최대 2번이다. hook이 없는 웹이면 `detect --json`을 한 번 실행한다. 이어서 **finish_reviewer subagent를 fork 없이 새 context로 spawn**한다. 반환값은 disposition 4종(recapture / rebuild / fix / ship)과 5섹션(persistence, fidelity, ceiling, material_fixes, keep)이다. fix는 일괄 수정, 재캡처, verdict pass 순으로 진행하며 최대 2라운드다. 마지막으로 documenter subagent가 DESIGN.md와 design.json을 작성한다. `embed-prompt --scan`으로 모든 raster에 provenance(생성 prompt 또는 출처)가 박혔는지 확인한다.

**critique 흐름**: target을 resolve한 뒤 `critique-storage slug`를 실행하고 `.impeccable/critique/ignore.md`를 읽는다. **Assessment A(디자인 리뷰)와 B(detector와 브라우저 오버레이)를 서로 격리된 두 subagent로 병렬 실행**한다. subagent를 쓸 수 없으면 `⚠️ DEGRADED` 배너를 붙인다. 두 결과를 합성해 보고서를 쓰고, snapshot을 저장하고, trend를 읽는다. 마지막으로 발견 사항에 묶인 질문 2–4개를 던진다(Priority Issue가 3개 이상이면 반드시 질문한다). 답을 받으면 추천 커맨드 순서를 제시하고 마지막은 항상 polish로 끝난다.

**live/generate 흐름**: `live`가 helper 서버를 띄운다. agent가 dev server 페이지에 `live.js`를 주입하고 600s long-poll로 이벤트를 기다린다. 사용자가 브라우저에서 요소를 고르고 action과 Go를 누르면 agent는 변형 3개를 소스 파일에 `data-impeccable-variant` wrapper로 한 번에 삽입하고 `--reply done`을 보낸다. HMR이 변형을 표시한다. 사용자가 accept하면 "carbonize"한다(선택된 변형을 실제 stylesheet로 옮기고 marker를 제거). `generate`는 이 과정에서 요소 선택을 자동화한 fast lane이다.

---

### 하위 모드와 커맨드 목록

| 커맨드 | 분류 | 하는 일 | reference |
|---|---|---|---|
| (없음) | 라우팅 | `signals`와 `detect`를 실행해 추천 2–3개와 전체 메뉴를 보여 준다. 자동 실행은 하지 않는다 | routing.md |
| (자연어 빌드 요청) | Build | 새 화면이나 세계: concept-seed, decision page, comp-led/code-led 빌드, finish review | new-work.md (+ visualize, region-map, component-review, mode-*) |
| `craft` | Build | deprecated alias로, new-work와 같다 | craft.md |
| `shape` | Build | 인터뷰 1–2라운드 후 brief 7항목을 작성하고 코드 없이 멈춘다 | shape.md |
| `init` (=`teach`) | Build | 인터뷰로 PRODUCT.md를 작성하고 buildPath(comp/code)와 live 설정을 정한다 | init.md |
| `document` | Build | 코드에서 DESIGN.md(Stitch 포맷, YAML 토큰과 8섹션)와 design.json sidecar를 만든다. 코드가 없으면 seed mode | document.md |
| `extract` | Build | 3회 이상 반복된 패턴과 하드코딩 값을 토큰과 컴포넌트로 추출하고 이전한다 | extract.md |
| `critique` | Evaluate | Nielsen 10 휴리스틱(0–4, /40), 인지부하 8항목, 페르소나, P0–P3를 평가한다. A/B subagent 격리 | critique.md |
| `audit` | Evaluate | a11y, 성능, 테마, 반응형, Implementation Integrity를 각 0–4로 매긴다(/20). 수정은 하지 않는다 | audit.md / audit.native.md |
| `polish` | Refine | 출시 전 마무리. critique snapshot의 P0/P1을 backlog로 가져와 처리한 뒤 close한다 | polish.md |
| `bolder` | Refine | 대상 섹션만, 시스템이 이미 가진 수단으로 증폭한다 | bolder.md |
| `quieter` | Refine | 채도를 70–85%로 낮추고, 굵기 900→600, 모션 10–20px로 줄인다 | quieter.md |
| `distill` | Refine | 본질만 남긴다. 색 1–2개, 폰트 1개, 크기 3–4개, primary action 1개 | distill.md |
| `harden` | Refine | 긴 텍스트, i18n(+30%, RTL), 에러, 엣지 케이스, 입력 검증을 다룬다 | harden.md |
| `onboard` | Refine | 첫 실행, 빈 상태, aha moment | onboard.md |
| `animate` | Enhance | motion thesis(focal, continuity, feedback, budget)를 세우고 duration 표와 reduced-motion을 적용한다 | animate.md |
| `colorize` | Enhance | 색을 역할 기반 시스템으로 만들고 OKLCH와 WCAG를 지킨다 | colorize.md |
| `typeset` | Enhance | 타이포 진단과 `detect --scope type`을 함께 쓰고 text-wrap balance/pretty를 적용한다 | typeset.md |
| `layout` | Enhance | squint test, spacing rhythm, `detect --scope layout` | layout.md |
| `delight` | Enhance | delight thesis 한 문장, 감정 순간별 처리 | delight.md |
| `overdrive` | Enhance | WebGL, View Transitions, scroll-driven 같은 기술적 야심. 방향 2–3개를 먼저 제안하고 승인을 받는다 | overdrive.md |
| `clarify` | Fix | UX 카피, 에러 메시지(무엇, 왜, 복구), 폼 라벨 | clarify.md |
| `adapt` | Fix | 반응형, 터치, print, email. 네이티브는 별도 문서 | adapt.md / adapt.native.md |
| `optimize` | Fix | 성능(LCP<2.5s, INP<200ms, CLS<0.1) | optimize.md |
| `live` | Iterate | 브라우저에서 요소를 고르면 변형 3개를 HMR로 바꿔 보여 주고 knob을 붙인다 | live.md, live-setup.md |
| `generate [n] [action] [element]` | Iterate | live의 자동화 버전으로, 자연어로 요소와 방향을 지정한다(기본 3, 최대 8) | generate.md |
| `hooks <on/off/status/ignore-*/reset>` | 관리 | 편집 후 detector hook 설치와 예외 관리 | hooks.md |
| `doctor` | 관리 | 산출물 schema drift를 점검하고 수정한다(auto/mention/route) | doctor.md |
| `pin/unpin <cmd>` | 관리 | `$<cmd>` shortcut을 만든다 | SKILL.md |
| (platform) | — | ios.md, android.md: 네이티브 규칙과 시뮬레이터 캡처 방법 | ios.md, android.md |

---

### 핵심 규칙과 지식 (가장 특색 있는 부분)

**1) craft-floor.md: 품질 하한과 금지 목록** (가장 가져올 가치가 큼, 50줄)
- Verify 기준값:
  - 본문과 placeholder 대비 ≥4.5:1, 큰 텍스트 ≥3:1. 색 배경 위 보조 텍스트는 그 색조에서 tint한다("never gray").
  - 본문 measure 65–75ch, display 최대 6rem, tracking 하한 -0.04em(-0.02~-0.03 권장).
  - "more space above a heading than below it".
  - 카드 radius 12–16px. pill 형태는 작은 컨트롤에만 쓴다.
  - 모션은 "one authored moment"이며 지수 ease-out을 쓴다.
  - **Browser surfaces**: selection, caret, scrollbar, focus ring, underline offset, tabular numerals도 팔레트로 테마링한다. 원문은 "the cheapest signal that a page was built rather than assembled"다.
- Refuse 목록(AI slop):
  - 같은 크기의 icon+heading+text 카드 그리드, 중첩 카드("nested cards are always wrong").
  - hero-metric 템플릿(큰 숫자, 작은 라벨, 보조 통계).
  - **kicker/eyebrow는 절대 금지**("no brief earns it back").
  - 01/02/03 섹션 번호, 불필요한 modal.
  - gradient text, 장식용 glass/blur, 1px를 넘는 컬러 border-left/right, `box-shadow: 4px 4px 0` 같은 hard offset shadow(neobrutalist가 아닐 때).
  - 장식 sparkline/progress ring, 코스튬용 monospace, 시스템 display face(Impact, Arial Black).
  - 아이콘 대신 쓴 이모지나 유니코드 glyph, 사진 윤곽을 흉내 내는 기하학 mask, 카테고리로 정한 light/dark.
  - 1px border와 넓은 soft shadow 조합(ghost card), 스케치풍 SVG와 `feTurbulence` grain, 근거 없는 stripe나 grid 배경.

**2) new-work.md: 수렴 방지 장치**
- **금지 글꼴 목록**(Persuade/Experience): Fraunces, Playfair Display, Cormorant, Lora, Crimson, Newsreader, Syne, Space Grotesk, Space Mono, IBM Plex, Inter-as-display, DM Sans, DM Serif, Outfit, Plus Jakarta Sans, Instrument Sans. 원문은 "these training-data defaults mean you stopped looking"다.
- **AI 수렴 미학 4종 calibration**: (a) warm cream 배경, 고대비 serif, terracotta 액센트 (b) near-black, 네온 액센트 하나, 글로우 엣지 (c) broadsheet 헤어라인, italic serif, 작은 tracked mono 라벨 (d) 평면 채도와 검은 박스, hard offset shadow. 원문은 "if someone could guess your aesthetic from the category alone… rework"다.
- 후보 7개, 3개 이상의 재료 계열, 범주 기본값과 그 반대는 rut로 처리한다. Operate/Read에서는 사용자가 쓰는 도구(terminal, cockpit)를 세계로 가져오는 것이 "costume"이라 금지된다.
- 무작위성 주입: `concept-seed`의 주사위로 방향을 강제 배정해 "ranking rut"를 깬다. 사용자가 고르는 standing exit(canon, 범주 표준)는 항상 열려 있지만 agent가 추천하지 않는다.
- "Prove, don't claim": 데모 데이터는 실제 수준으로 만들되 synthetic으로 표시한다. 가격, 고객, 벤치마크 같은 상업적 주장은 지어내지 않는다.
- Color strategy 4단계: Restrained / Committed(채도 높은 한 색이 표면의 30–60%) / Full palette(3–4 역할) / Drenched.

**3) Mode 체계** (Persuade / Operate / Read / Experience)
- Operate: 세계가 빌려줄 수 있는 것은 "type, palette, density, one signature move" 네 가지뿐이다. 레이아웃, 내비게이션, 컨트롤은 플랫폼 표준을 따른다. "A grey screen with one accent colour is the category default without the category's polish, not restraint."
- Read: 세계가 프레임(masthead, rail, opener)을 소유하고, 읽기 열은 차분하게 둔다(약 16px, 60–75자).
- Persuade: 첫 viewport에 범주의 실제 액션이 작동하는 형태로 있어야 한다(항공사라면 노선·날짜 검색). split hero와 카드 행은 템플릿으로 본다.

**4) operate.md 수치**: 타입 스케일 비율 1.125–1.2, fluid가 아닌 고정 rem, 전환 150–250ms, 페이지 로드 연출 금지, 인터랙티브 컴포넌트마다 7상태(default/hover/focus/active/disabled/loading/error), 로딩은 spinner 대신 skeleton, overflow:hidden 안의 dropdown 대신 `<dialog>`/popover.

**5) 커맨드별 수치**
- animate: 100–150ms 피드백, 150–300 상태, 300–500 레이아웃, 500–800 focal. `cubic-bezier(0.16,1,0.3,1)`, bounce와 elastic 금지, exit는 enter보다 빠르게.
- typeset: body 하한 16px, 45–75ch, heading `text-wrap: balance`, body `pretty`. 어두운 배경의 밝은 텍스트는 행간, 자간, 굵기를 보정한다.
- layout: 4-unit base spacing, `gap` 선호, squint test.
- colorize: OKLCH, 극단 명도에서 chroma 감소, WCAG 표(4.5/3/3).
- quieter: 채도 70–85%, 굵기 900→600·700→500, 모션 거리 10–20px, ease-out-quart.
- audit: 터치 44×44 권장, WCAG 2.5.8 기준 24×24. 전역 `0.01ms` reduced-motion kill은 결함으로 본다.
- critique: Nielsen 10×0–4 기준표와 rating band(36–40 Excellent… "Most real interfaces score 20-32"). 인지부하 8항목 체크리스트("≤4 visible options"), 페르소나 5종(Alex 파워유저, Jordan 초보, Sam 접근성, Riley 스트레스 테스터, Casey 모바일)과 interface 유형별 선택표.
- iOS: 44pt, Dynamic Type, SF, 탭바 2–5개, edge-swipe back 유지, `xcrun simctl io booted screenshot`. Android: 48dp와 8dp 간격, Material 3 roles, sp 단위, predictive Back, FAB 1개.

**6) live 변형 설계 규칙**: Phase A에서 "identity lock" 한 문장(실제 색 값, 폰트, topology, 표면 처리, 톤)을 쓴다. default mode에서는 변형 3개가 서로 다른 primary axis 6종 중 하나씩 맡는다(Hierarchy / Layout topology / Type / Color strategy / Density / Structural decomposition). departure는 사용자가 명시했을 때만 한다. squint test를 거친다. 변형마다 knob(CSS 변수 `--p-*`)을 0–4개 둔다.

**7) 운영 원칙**
- "The brief wins": 사용자가 고정한 미학이 금지 목록보다 우선한다. 단 kicker와 eyebrow는 예외 없이 금지다.
- "Refinement preserves; redesign replaces": 다듬기가 몰래 리디자인으로 번지는 것을 막는다.
- 스크린샷은 batch로 찍는다. 한 번 볼 때 여러 수정을 모아서 하고 최대 2라운드까지만 한다.
- 검수자는 새 context에서 시작한다. 원문은 "a reviewer that inherits your transcript inherits your framing, your optimism"이다.
- documenter는 craft-floor 위반을 DESIGN.md 규칙으로 canonize하지 않는다(실제 사고 사례가 적혀 있다).

---

### scripts

| 파일 | 역할 | 호출 | 의존성 |
|---|---|---|---|
| `impeccable` (sh) / `impeccable.cmd` | launcher. binary를 찾아 exec하고, 없으면 GitHub release에서 내려받아 sha256 검증 후 `~/.impeccable/bin/<ver>/`에 캐시한다 | `<skill>/scripts/impeccable <verb> …` | curl 또는 wget, shasum 또는 sha256sum, 네트워크(최초 1회). Node 불필요 |
| (폐쇄형 binary) verbs | `context`, `signals`, `detect`(HTML/CSS slop rule engine, `--json --scope type/layout`, `--cdp 9222`), `concept-seed`, `serve-question`(decision page 웹서버), `surface-brief`, `build-phase`(start/advance/scaffold/record/finish), `comp-spec`(grid/regions/crop/plate-prompt/inspect-map), `comp-diff`, `font-match`, `generate-image`(API fallback), `embed-prompt`(PNG에 prompt 메타데이터 삽입), `component-review`(plan/capture/serve/verify), `critique-storage`(slug/write/latest/trend/close), `live*`(live, live-poll, live-server, live-generate, live-wrap, live-insert, live-accept, live-complete, live-status, live-resume), `detect-csp`, `hooks`, `ignores`, `doctor`, `pin`, `engine-probe`, `update` | reference 지침에 따라 agent가 Bash로 실행 | 브라우저(캡처용), 이미지 생성 API 키(선택) |
| `live-browser.js` (+dom/session/ignores) | dev 페이지에 주입하는 오버레이. 요소 선택, action, Go, 변형 순환, knob, accept, 수동 문구 편집 | live-server가 `http://localhost:8400/live.js`로 제공 | dev server와 HMR, CSP 허용(dev 한정, 동의 필요) |
| `modern-screenshot.umd.js` | 브라우저 내 DOM 스크린샷 | live 오버레이에서 사용 | — |
| `data/font-index.json` | Google Fonts의 글꼴 형태 fingerprint. comp의 글자 crop과 가장 가까운 글꼴을 찾는 데 쓴다 | `font-match --rank` | — |
| `command-metadata.json` | 서브커맨드 설명과 argumentHint(설치기와 pin용) | binary | — |

detector rule 예시(문서에서 언급된 것): `overused-font`, `bounce-easing`, `side-tab`, `gradient text`, `glow shadow`, `design-system-font-size`, `straggler`, `unbalanced-heading`, `organic-clip-path`, `buried-raster`. hook 동작: 편집할 때마다 immediate tier(깨진 이미지, overflow, 대비, gradient text, glow, DS drift)를 검사한다. Stop 이벤트에서는 세션 전체에 deep pass(취향 계열 rule)를 한 번 돌린다.

---

### 의존성

- **필수**: 플랫폼별 impeccable engine binary(최초 실행 때 네트워크로 받는다). 샌드박스에서 egress가 막혀 있으면 `IMPECCABLE_BIN`이나 사전 설치가 필요하다.
- **강하게 권장**: subagent/Task 도구(critique A/B 격리, finish reviewer, documenter, asset producer). 없으면 `degraded/*.md`로 in-thread 대체하고 배너를 붙인다.
- **선택**:
  - 브라우저 자동화(Claude in Chrome, Cursor browser, Playwright, CDP): critique B, live, 캡처에 쓴다.
  - 이미지 생성(하네스 내장 도구 또는 API 키): comp-led 경로 전체에 필요하다.
  - structured question tool.
  - dev server와 HMR(live/generate).
  - iOS는 Xcode simctl, Android는 emulator.
- **하네스 hook 설정 파일**: `.claude/settings.local.json`, `.codex/hooks.json`, `.cursor/hooks.json`, `.github/hooks/impeccable.json`, `.gemini/settings.json`.
- **외부 포맷**: Google Stitch DESIGN.md spec(YAML 토큰은 colors/typography/rounded/spacing/components만 허용).
- MCP 직접 의존이나 다른 skill 의존은 없다(Codex의 imagegen과 Browser skill은 언급만 한다).
- 프로젝트에 생성하는 상태: `PRODUCT.md`, `DESIGN.md`, `.impeccable/`(config.json, config.local.json, design.json, critique/, mocks/, build/, review/, live/).

---

### 장점 (가져올 만한 것)

1. **craft-floor.md 전체**: 50줄 안에 검증 가능한 수치와 구체적인 AI slop 금지 목록이 들어 있다. 특히 eyebrow/kicker 금지, ghost card, side stripe, hard offset shadow, 이모지 아이콘, browser surfaces 테마링. 그대로 가져와도 token 비용이 낮다.
2. **금지 글꼴 목록과 AI 수렴 미학 4종 calibration**: 다른 skill에서 보기 힘든, 이름이 명시된 안티 디폴트다. "카테고리만 보고 미학을 맞힐 수 있으면 실패"라는 self-check도 쓸 만하다.
3. **Mode 4분류(Persuade/Operate/Read/Experience)**와 "Operate에서 세계가 빌려줄 수 있는 건 type·palette·density·signature move 네 가지뿐"이라는 규칙. 랜딩과 앱 UI에 다른 야심 수준을 적용하는 명확한 기준이다.
4. **Progressive disclosure 라우터 구조**: SKILL.md는 표와 라우팅만 두고 커맨드별 reference를 lazy load한다. "UI 편집 직전에만 floor 로드"처럼 로드 타이밍을 명시한다.
5. **critique의 평가 도구 세트**: Nielsen 0–4 기준표, 인지부하 8항목, 페르소나 5종과 선택표, P0–P3 정의, "질문은 응답 마지막에" 규칙. **A/B를 격리된 subagent로 돌려 detector가 판단을 anchor하지 않게 하는 설계**도 좋다.
6. **critique → polish backlog 연결**: snapshot을 저장하고 polish가 P0/P1을 가져와 처리한 뒤 close한다. 점수 trend도 기록한다.
7. **live 모드의 변형 설계법**: identity lock 한 문장, 서로 다른 primary axis 6종, squint test, knob 예산(시각적 무게 기준 0–4). 브라우저 오버레이 없이 텍스트로만 변형을 제안할 때도 쓸 수 있다.
8. **finish reviewer 패턴**: fork하지 않은 새 context, disposition 4단어 고정, 출력 섹션 고정, 수정은 최대 2라운드. 자기검증 편향을 줄이는 구조다.
9. **PRODUCT.md(제품 사실)와 DESIGN.md(시각 토큰)와 surface brief(화면별 전략)의 3분할**, 그리고 Stitch 호환 DESIGN.md 포맷("Named Rules", 섹션 헤더 정확히 유지).
10. **커맨드별 압축 playbook**: quieter, distill, animate 표, typeset text-wrap 규칙, clarify 에러 3요소, ios/android 체크리스트는 짧고 수치가 명확하다.
11. hook triage 규칙: 진짜 문제는 수정하고, 근거 있는 오탐은 가장 좁은 ignore에 근거를 적고, 애매하면 사용자에게 한 줄로 묻는다.

### 단점과 한계 (버릴 만한 것)

1. **폐쇄형 binary 의존**: `context`, `detect`, `concept-seed`, `comp-spec`, `build-phase` 같은 핵심이 이 폴더에 없는 다운로드 binary 안에 있다. 내부 로직을 검토하거나 복제할 수 없고, 네트워크와 샌드박스 제약에 걸린다. 공급망 신뢰 문제도 있다(sha256 검증은 한다). 내 skill로 cherry-pick할 때 스크립트 의존 부분은 사실상 가져올 수 없다.
2. **token 비용이 매우 크다**: new-work.md 하나가 62KB(약 15k tokens)이고 한 단락이 수천 자짜리 규칙 덩어리다. critique 49KB, live 37KB이고 영문 reference 합계가 약 450KB다. 새 화면 하나를 만들 때 SKILL, new-work, craft-floor, visualize, region-map, component-review, mode를 합쳐 25–30k tokens 이상을 쉽게 쓴다.
3. **과도한 프로세스와 의식(ceremony)**: 주사위 roll, decision 웹페이지, re-roll register 3종, challenger verdict와 "raise" 이식, seed reference 16hex 검증, comp → spec → plates → 사용자 검수 → hero 72% gate → responsive gate. 프론티어 모델용이라고 스스로 인정한다("Smaller or faster models… stall under the hero gate"). 일반 프로젝트에는 지나치게 무겁다.
4. **하네스별 분기 문구가 본문에 섞여 있다**: Codex, Cursor, Claude Code, Copilot, Gemini, Grok별 poll, timeout, subagent 이름 차이가 모든 문서에 흩어져 있어 노이즈가 많다. "Ask with Codex's structured user-input/question tool…" 같은 Codex 중심 문구도 남아 있다.
5. **문서 간 중복과 미세한 불일치**: Operate 규칙이 SKILL, operate.md, mode-operate.md에 3중으로 있다. critique는 AGENTS.md의 `## Design Context`(구버전 init)를 참조하는데 현재 init은 PRODUCT.md를 쓴다. 남은 흔적이다.
6. **기능 대부분이 웹 전용**: detect, live, generate, critique B는 모두 HTML/CSS에만 쓸 수 있다. 네이티브에서는 detector가 없고 critique는 A만 돌린다.
7. **이미지 생성 전제**: Persuade 화면의 기본 경로(comp-led)가 이미지 생성을 전제한다. 없으면 code-led로 떨어지는데, 이 경우의 품질 장치는 contract 문구뿐이다.
8. **강한 미학적 의견**: 금지 글꼴 목록(Inter-as-display, Space Grotesk, IBM Plex 포함), eyebrow 전면 금지, 섹션 번호 금지가 팀 디자인 시스템과 충돌할 수 있다. "brief wins"로 완화되지만 eyebrow는 예외 없이 금지다.
9. **상태 파일이 많아진다**: `.impeccable/` 아래 config, critique, mocks, build, review, live와 hook manifest 5종이 생기고, doctor로 drift를 관리해야 할 정도로 유지 부담이 있다.
10. 일부 서브커맨드(harden, optimize, onboard, adapt)는 일반적인 체크리스트 수준이라 차별점이 적다. 다른 repo의 동급 skill과 비교해 하나만 남기면 된다.

**cherry-pick 요약 권고**: craft-floor.md, new-work §4의 금지 글꼴과 calibration 단락, Mode 4분류와 mode-* 규칙(축약), critique의 평가 도구(휴리스틱 표, 인지부하, 페르소나, P0–P3)와 A/B 격리 아이디어, live의 identity lock과 6축 변형법, finish-reviewer의 disposition 패턴, operate/animate/typeset/quieter/ios/android의 수치 규칙. binary 기반 파이프라인(concept-seed, decision page, comp-spec, build-phase, live 오버레이)과 하네스 분기 문구는 버린다.
