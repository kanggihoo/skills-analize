# DESIGN.md — 병합 포맷 스펙

Google `design.md`(alpha)를 **기반 컨테이너**로 삼고, `taste-skills`와 `ui-ux-pro`의
장점만 얹은 형식. 도메인 무관하게 재사용 가능하다.

**설계 원칙: 확장하지 말고 편입한다.**
Google 린터를 깨지 않는 것을 최우선으로 두고, 불가피한 확장 2개(`dials`, `motion`)만
명시적으로 표시한다.

```
design-md/
├── SPEC.md                            ← 이 문서 (포맷 규약)
├── DESIGN.md                          ← 범용 스타터 템플릿 (lint 0/0)
└── examples/
    └── trading-terminal.DESIGN.md     ← 데이터 밀집 UI 적용 예 (lint 0/0)
```

---

## 1. 세 시스템에서 가져온 것

| 요소 | 출처 | 편입 방식 |
|---|---|---|
| 단일 파일 YAML+Markdown 컨테이너 | **Google** | 기반 골격 그대로 |
| `{path.to.token}` 참조 | **Google** | 그대로 |
| canonical 섹션 순서 8개 + 중복 heading 거부 | **Google** | 그대로. 확장 섹션은 뒤에 append |
| `lint` / `diff` / `export` CLI | **Google** | 그대로 (세 시스템 중 `diff`는 Google만 보유) |
| **3층 토큰** (primitive → semantic → component) | **ui-ux-pro** | **명명 규칙으로 편입, 스키마 확장 0** |
| **상태·변형 매트릭스** | **ui-ux-pro** | Google 관례(`--hover`)에 매핑, 확장 0 |
| **소스코드 린트** | **ui-ux-pro** | `validate-tokens.cjs` 를 검증 2단계로 병행 |
| 오버라이드 계층 + 덮어쓰기 보호 | **ui-ux-pro** | 선택 사양 (§6) |
| **다이얼(조건부 규칙 발동)** | **taste-skills** | EXTENSION — `dials` 키 + Overview 재기술 |
| **구체적 Banned 목록** | **taste-skills** | `Do's and Don'ts` + Colors/Typography 하위 소제목 |
| 토큰에 **근거(rationale) 강제** | **taste-skills** | Colors 섹션을 "역할 + 근거" 표로 |
| 반응형 규칙 | **taste-skills** | Google `Layout` 섹션에 흡수 (순서 유지) |
| **모션 인계 계약** | **taste-skills** | EXTENSION — "구현은 코드 단계" 명시 |

---

## 2. 호환성 등급

| 등급 | 의미 | 항목 |
|---|---|---|
| **CORE** | Google 스펙 그대로 | version / name / description / omitted / colors / typography / rounded / spacing / components + 8개 canonical 섹션 |
| **CONVENTION** | 스키마 확장 없이 **명명 규칙**만으로 얻는 것 (경고 0) | semantic 층, 상태·변형, 3층 토큰 |
| **EXTENSION** | 스펙에 없는 키·섹션 | `dials`, `motion`, `## Motion`, `## Accessibility Contract` |

### 린터 실측으로 확인된 확장 규칙 (alpha)

| 상황 | 결과 |
|---|---|
| 미지 top-level key + **숫자/자유문자열** 값 (`dials`) | ✅ 경고 없음 |
| 미지 top-level key + **dimension 문자열** (`"150ms"`) | ⚠️ `token-like-ignored` — "silently ignored by export commands" |
| 미지 `##` 섹션 (`## Motion`) | ✅ 보존, 경고 없음 |
| 미지 component property | ⚠️ 경고 — **8개 외 확장 금지** |

→ 모션 토큰은 **`durationMs: 150`(숫자)** 로 쓴다. `"150ms"` 는 경고.
→ 어느 쪽이든 **`export` 결과에 확장 키는 포함되지 않는다** (§4 참조).

---

## 3. YAML Front Matter

```yaml
---
# ── CORE ──────────────────────────────────────────────
version: alpha
name: <string>
description: <string>            # optional — dtcg export 의 $description 이 됨

# ⚠ omitted 는 "마크다운 섹션"이 아니라 **YAML 토큰 그룹**용이다.
#   유효값: colors / typography / spacing / rounded / components
#   마크다운 섹션은 그냥 빼면 되고 경고도 없다.
omitted:                         # optional
  - spacing
  - section: rounded
    reason: "브랜드북에 라운드 정의 없음"

# ── EXTENSION ─────────────────────────────────────────
dials:                           # 값은 순수 숫자여야 경고가 없다
  density: 1-10
  variance: 1-10
  motion: 1-10

# ── CORE + CONVENTION ─────────────────────────────────
# colors 는 3층을 명명 규칙으로 분리한다.
#   1층 primitive : 원시값.        <hue>-<step>
#   2층 semantic  : 역할. 참조로만. {colors.<primitive>}
#   3층 component : components 에서 semantic 참조
#
# 스펙: "For most token groups, the reference must point to a primitive value"
#       → colors 안에서 다른 color 를 참조하는 것은 primitive reference 라 합법.
colors:
  brand-600: "#2563EB"                # 1층
  primary:   "{colors.brand-600}"     # 2층  ← 스키마 확장 없이 성립

typography:
  <token-name>:
    fontFamily: / fontSize: / fontWeight: / lineHeight:
    letterSpacing: / fontFeature: / fontVariation:

rounded:
  <scale-level>: <Dimension>     # ⚠ `0` 은 error. `0px` 로 쓸 것

spacing:
  <scale-level>: <Dimension | number>

components:
  # 상태·변형은 Google 관례(별도 엔트리 + 관련 명명). 스키마 확장 아님.
  #   <component>  /  <component>--hover  /  --active  /  --disabled  /  --focus
  <component-name>:
    backgroundColor: / textColor: / typography: / rounded:
    padding: / size: / height: / width:
    # ⚠ 이 8개 외 property 추가 시 경고

# ── EXTENSION ─────────────────────────────────────────
motion:
  <token-name>:
    durationMs: <number>         # 숫자. "150ms" 로 쓰면 경고
    easing: <string>
    intent: <string>             # 이 모션이 무엇을 전달하는가
---
```

---

## 4. Markdown Body — 섹션 순서

canonical 8개를 **그대로 유지**하고 확장 2개를 **뒤에 append** 한다.
(스펙: "those present should appear in the sequence listed" — 중간 삽입은 순서 경고 위험)

| # | 섹션 | 별칭 | 무엇을 쓰는가 |
|---|---|---|---|
| 1 | **Overview** | Brand & Style | 제품 성격 + **다이얼 값과 발동 규칙을 산문으로 재기술** |
| 2 | **Colors** | | semantic 토큰의 **역할 + 근거** 표. hex 중복 기재 금지. **Banned** 소제목 |
| 3 | **Typography** | | 스택·스케일의 의도 + **Banned** 소제목 |
| 4 | **Layout** | Layout & Spacing | 그리드 + **반응형·브레이크포인트·테스트 뷰포트 흡수** |
| 5 | **Elevation & Depth** | Elevation | 그림자 스케일. ⚠ **스키마에 shadow 토큰 타입이 없어 프로즈 전용** |
| 6 | **Shapes** | | radius 전략 + 혼용 규칙 |
| 7 | **Components** | | **상태 매트릭스** + 필수 비상태 화면(loading/empty/error) |
| 8 | **Do's and Don'ts** | | ✅/❌ 대조. **값·문자열 단위**로 구체적으로. **기본 금지 목록이 템플릿에 탑재됨**(아래) |
| 9 | *Motion* | EXTENSION | 토큰 표 + **누가 구현하는지 인계 계약** |
| 10 | *Accessibility Contract* | EXTENSION | 대비 하한, 색 단독 의존 금지, 감소모션, 포커스 |

**규칙**
- 중복 `##` heading → **파일 거부**(error)
- 섹션 순서는 CORE 8개의 **상대 순서**만 검사한다. 순서가 어긋나면 `section-order`(warning)
- 확장 섹션 2개는 CORE 8개 뒤에만 위치
- `<h1>` 은 문서 제목용으로 허용되며 섹션으로 파싱되지 않는다

**Do's and Don'ts 기본 탑재 (37개 스킬 분석에서 수렴한 항목)**

`DESIGN.md` 템플릿은 이 섹션을 빈 칸으로 두지 않고 8개 범주(토큰 규율 / 타이포그래피 /
컬러·표면 / 레이아웃 / 상태·피드백 / 모션 / 콘텐츠·카피 / 코드 품질)의 `| 금지 | 대신 |`
표로 미리 채워 배포한다. 출처는 `taste-skills/stitch-design-taste` 의 Anti-Patterns 목록을
기준으로 `emilkowalski`(모션), `ui-ux-pro-max`(접근성·상태), `redesign-existing-projects`
(콘텐츠·마크업 누락)에서 중복 없이 병합한 것이다.

- **기본값이지 절대 규칙이 아니다.** 예외는 브랜드 스펙이 명시적으로 요구할 때만 허용하고,
  그 이유를 해당 섹션 프로즈에 기록한다.
- 다이얼 연동 금지(`variance` / `density` / `motion` 값에 따라 켜지는 금지)를 별도 소제목으로 둔다.
- 합의가 갈리는 항목(em-dash 전면 금지 등)은 **`프로젝트에 따라 선택 (기본 미적용)`** 으로 격리한다.
  em-dash 는 한국어·일본어 조판에서 정상 문장부호이므로 기본 금지에서 제외했다.
- Colors / Typography 의 `### Banned` 소제목에는 **프로젝트 고유 금지만** 남기고
  범용 금지는 이 섹션으로 일원화한다. 같은 금지를 두 곳에 쓰면 갱신 시 갈라진다.

---

## 5. 검증 — 2단 구성

Google `lint` 는 **스펙 파일 구조**만 본다. 실제 소스의 하드코딩은 잡지 못한다.
`ui-ux-pro` 의 `validate-tokens.cjs` 는 **소스코드**를 스캔한다. 겹치지 않으므로 함께 건다.

| 단계 | 명령 | 검사 대상 |
|---|---|---|
| 1 | `npx @google/design.md lint DESIGN.md` | 구조·참조·대비·고아 토큰·섹션 순서 |
| 2 | `node validate-tokens.cjs --dir src/` | **소스코드의 하드코딩 hex/폰트명** |
| 3 | `npx @google/design.md diff OLD.md NEW.md` | 토큰 변경·회귀 감지 |
| 4 | `npx @google/design.md export --format <fmt>` | Tailwind v3/v4 · DTCG 산출 |

> Windows: `.md` 확장자가 파일 연결과 충돌하므로 `npx -p @google/design.md designmd lint DESIGN.md`

### export 실측 (alpha)

```
lint  → errors 0 / warnings 0 / infos 1
export --format dtcg          → $schema: designtokens.org/schemas/2025.10/format.json  ✅
export --format css-tailwind  → @theme { --color-*, --font-*, --text-* ... }           ✅
export --format json-tailwind → theme.extend 객체                                       ✅
확장 키(dials/motion)          → 3개 포맷 모두 0건                                       ⚠️
```

**semantic 3층은 export 시 평탄화된다.** `primary: "{colors.brand-600}"` 가
`--color-primary: #2563eb` 로 resolve 되어 나온다. 소스에서만 3층이고 산출물은 flat —
Tailwind 가 flat 을 요구하므로 정상 동작이다.

`ui-ux-pro/design-system` 의 `design-tokens-starter.json` 도
`$schema: design-tokens.org` + `$value`/`$type` 계열이므로 `dtcg` 산출물과 같은 계보다.
다만 스키마 버전이 다를 수 있으니(2025.10) 병합 전 키 구조를 대조할 것.

### 확장 키를 잃지 않으려면

`dials` / `motion` 은 export 에서 사라진다. 셋 중 하나를 택한다.

1. **프로즈 이중 기재** — Overview / `## Motion` 에 표로 재기술 (에이전트는 프로즈를 읽는다) ← **템플릿 기본값**
2. **별도 파일 분리** — `motion.tokens.json` 을 자체 빌드가 소비
3. **감수** — 경고 없이 파일 안에는 남으므로 export 를 안 쓰면 무해

---

## 6. 오버라이드 계층 (선택, ui-ux-pro 방식)

단일 파일로 부족한 규모라면:

```
design/
├── DESIGN.md              ← 전역 진실 소스
└── pages/
    ├── dashboard.md       ← 이 화면 규칙이 DESIGN.md 를 override
    └── marketing.md
```

조회 순서: `pages/<page>.md` 존재 시 그 규칙 우선 → 없으면 `DESIGN.md`
**덮어쓰기 보호**: 기존 `DESIGN.md` 는 명시적 승인 없이 재생성하지 않는다.

---

## 7. 실측으로 드러난 함정

| 증상 | 원인 | 해결 |
|---|---|---|
| `error: '0' is not a valid dimension` | `rounded: { none: "0" }` | **`0px`** — 단위 없는 0 은 거부 |
| `warning: missing-primary` | `primary` 토큰 부재 | semantic 층에 `primary` 필수. 없으면 에이전트가 임의 생성 |
| `warning: orphaned-tokens` | 색 토큰이 **components 에서 참조되지 않음** | 구분선·차트 계열 등도 컴포넌트로 모델링. `primary`/`neutral` 등 표준명은 면제 |
| `warning: token-like-ignored` | 확장 키에 dimension 문자열 (`"150ms"`) | 숫자(`150`)로 변경 |
| `warning: unknown-omission` | `omitted` 에 마크다운 섹션명 기재 | YAML 토큰 그룹명만 허용 |
| `warning: contrast-ratio` | 컴포넌트 bg/text 쌍이 4.5:1 미만 | 값 상향. **비활성 상태도 검사 대상** |

### 부수 효과: 린터가 실제 디자인 결함을 잡는다

외부 스타일 가이드나 앵커 레시피의 값을 그대로 옮기면 대비 미달이 자주 나온다.
실제로 이 저장소의 예제 작업 중 다음이 걸렸다.

- 참조 레시피의 muted label `#5E6680` → 해당 패널 배경 대비 **3.13:1 (AA 미달)**
- 흔히 쓰이는 `#16A34A`(green) → 흰 배경 **3.30:1 (미달)**
- 흔히 쓰이는 `#D97706`(amber) → 흰 배경 **3.19:1 (미달)**

**외부에서 가져온 팔레트는 반드시 lint 를 통과시킨 뒤 채택할 것.**
이것이 taste-skills·ui-ux-pro 의 자기 선언 체크리스트로는 얻을 수 없는, Google CLI 의 실질적 이득이다.
