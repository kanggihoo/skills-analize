---
name: web-video-presentation
description: 글이나 내레이션 원고를 클릭으로 진행되는 16:9 웹 프레젠테이션으로 만들어 영상처럼 보이게 하고, 선택적으로 내레이션 오디오를 합성합니다. 흐름: 원문 → **한 번에 생성**하는 내레이션 원고 + 개발 계획 개요 → 사용자가 **한 번에 확인**하는 5개 항목 (원고 / outline / 테마 / 소재 / 개발 방식) → 웹 개발 (장별 / 순차 / 병렬) → 선택 오디오 합성 (provider 불문: 내장 MiniMax mmx-cli + OpenAI TTS, ElevenLabs / edge-tts / Azure / 자체 TTS로 교체 가능). **outline은 리듬과 정보 밀도만 계획하고 애니메이션은 계획하지 않습니다** — 애니메이션은 장을 개발할 때 PRINCIPLES + ANTI-AI 규칙에 따라 즉석에서 설계합니다. 클릭 한 번이 내레이션 원고의 한 박자를 진행하고 각 단계는 전체 화면을 독점합니다. 진행 표시줄은 평소 숨기고 마우스를 올렸을 때만 보여줍니다. 사용 사례: 웹으로 영상 만들기 (동적 PPT지만 PPT처럼 보이지 않게), 내레이션 원고 / 글을 상호작용형 설명으로 바꾸기, Bilibili / YouTube / 영상 채널용 녹화 튜토리얼, 영화적인 제품 데모 / 토크 데모 제작. 이 Skill은 디자인 방법론과 협업 절차를 정리한 것이며 특정 스타일 / 글꼴 / 색상에 묶이지 않으므로 어떤 테마와 미학에도 재사용할 수 있습니다.
---

# Web Video Presentation

글이나 내레이션 원고를 단계별로 화면 녹화할 수 있는 “영상으로 위장한 웹 페이지”로 만들고, 선택적으로 내레이션 오디오를 합성합니다. 산출물은 Vite + React + TS 프로젝트와 장별로 나눈 오디오입니다.

## 사용 사례

- “내레이션 원고 / 글이 있는데 영상으로 만들어 주세요” — 내레이션 중심 콘텐츠
- “동적 PPT”를 만들고 싶을 때
- 16:9 가로 화면 녹화, 큰 글자, 여백, 매 화면의 움직임이 필요한 경우
- 교육 / 제품 시연 / 키노트에 영화적 분위기를 더하고 싶은 경우
- Bilibili / YouTube / TikTok 영상 콘텐츠

이 Skill은 **방법론과 협업 절차를 핵심으로 삼습니다.** 스캐폴드 템플릿은 토큰과 기본 요소를 제공하지만 색상, 글꼴, 움직임의 분위기 등 미학적 결정은 주제에 맞춰 새로 설계해야 합니다. 기존 스타일을 그대로 베끼지 않습니다.

---

## 워크플로 개요

```text
Phase 1   콘텐츠 작성
   1.1  사용자 입력 파악
   1.2  script.md + outline.md 한 번에 생성
        (내레이션 원고 + 개발 계획)
   ▼
[Checkpoint Plan]      ← 반드시 멈춤. 5개 항목을 한 번에 맞춤:
                         원고 / outline / 테마 / 소재 / 개발 방식
   ▼
Phase 2   웹 개발
   2.1  스캐폴드 (선택한 테마로)
   2.2  1장 = 메인 에이전트에서 완성본 구현 (필수 기준점)
        ▼
        [필수 단계] 사용자가 1장 검수 ← 건너뛸 수 없음
        ▼
   2.3  2~N장 (선택한 방식: A 장별 / B 순차 / C 병렬)
   ▼
[Checkpoint Audio]     ← 반드시 멈춤. 오디오 합성 여부 확인
   ▼
Phase 3   오디오 합성 (선택)
   ▼
Phase 4   화면 녹화 + 후반 작업
```

작업 디렉터리 규칙 (에이전트는 사용자의 현재 디렉터리에서 생성 / 편집):

```text
my-video/
├── article.md          # 사용자가 원문을 제공하면 필수 — 삭제하지 않음! 개발 단계 화면의 정보 출처
├── script.md           # 필수: 원문 언어를 유지한 플랫폼용 내레이션 원고 (박자 결정)
├── outline.md          # 필수: 개발 계획 (장 나누기 + 각 단계 내용 + 정보 풀)
└── presentation/       # 스캐폴드가 생성한 Vite + React + TS 프로젝트
    ├── src/chapters/<NN>-<id>/
    │   ├── <Chapter>.tsx     # 시각적 구현
    │   ├── <Chapter>.css
    │   └── narrations.ts     # ★ 단계 수 + 내레이션 문구의 단일 기준 원본
    ├── scripts/
    │   ├── extract-narrations.ts   # 모든 narrations.ts → audio-segments.json 추출
    │   ├── synthesize-audio.sh     # provider 불문 실행기 (segments 반복 처리)
    │   └── tts-providers/          # provider마다 .sh 파일 하나 (기본 제공 2개)
    │       ├── README.md           # 3개 함수 계약 + 바로 쓸 수 있는 코드 5종 (11labs / edge-tts / say / azure / gcloud)
    │       ├── minimax.sh          # 기본 provider, mmx-cli 사용
    │       └── openai.sh           # 내장 OpenAI TTS (curl + OPENAI_API_KEY)
    ├── audio-segments.json         # extract 결과 (합성 전 검토)
    └── public/audio/<id>/<N>.mp3   # 선택: 합성 오디오
```

> **핵심**: `narrations.ts`가 단계 수와 오디오 합성의 **단일 기준 원본**입니다. 장 `.tsx` 안의 `if (step === N)`에 나오는 최댓값 N + 1은 반드시 `narrations.length`와 같아야 합니다. 이 규칙으로 script / outline / 장 코드 / chapters.ts / 오디오 파일 다섯 곳이 어긋나지 않게 합니다.

---

## 필수 자체 검수 절차 (Skill 전체에 적용)

다음 세 가지 산출물은 각각 **완료 후 반드시 자체 검수 → 수정 → 보고 / 다음 단계 진행**을 거칩니다.

| 산출물 | 자체 검수 목록 |
|---|---|
| `script.md` | [`SCRIPT-STYLE.md`](references/SCRIPT-STYLE.md) 3단계 검수 (형식 / 기풍 / 소리 내 읽기) |
| `outline.md` | [`OUTLINE-FORMAT.md`](references/OUTLINE-FORMAT.md) 검수 |
| 단일 장 구현 완료 | [`CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md) 완료 검수 |

**수행 방식** (가능한 능력에 따라 선택하며, **격리 수준이 높은 방식을 우선**):

1. **Agent Teams (최선)**: 별도의 검토 에이전트를 열고 “산출물 경로 + 해당 체크리스트 + 핵심 맥락”을 전달해 항목별로 확인하고 **엄격하게 결론을 보고**하게 합니다 (통과 / 실패 항목 + 근거 + 수정 제안).
2. **subAgent (차선)**: Teams 기능이 없지만 subagent를 실행할 수 있으면 같은 절차를 사용합니다.
3. **자체 검수 (대안)**: 위 기능이 모두 없으면 직접 **항목별로 엄격히** 확인합니다. 대충 눈으로 훑고 통과시켜서는 안 됩니다.

**원칙**: 검토 결과를 받으면 **실패 항목부터 수정한 뒤** 사용자에게 “완료 + 검수 결론 + 수정 사항”을 보고합니다. **원래 결론만 그대로 전달하고 수정하지 않으면 규칙 위반**입니다.

---

## 단계별 파일 참조 안내

단계마다 필요한 파일이 다릅니다. **긴 세션에서는 에이전트가 원칙을 잊기 쉬우며**, 특히 Phase 2.4 “단일 장 구현”을 N번 반복하므로 매번 핵심 제약을 다시 확인해야 합니다.

| 단계 | 필수 참조 (매번 읽기) | 한 번 읽기 / 필요 시 참조 |
|---|---|---|
| Phase 1.1–1.2 콘텐츠 작성 | `references/SCRIPT-STYLE.md` + `references/OUTLINE-FORMAT.md` + `article.md` (사용자 원문이 있으면) | — |
| **Checkpoint Plan에서 테마 선택** | — | `themes/*/theme.json` (모두 동적으로 읽고 목록 + `bestFor` 추천 + `descriptionZh` 준비); `references/THEMES.md` (사용자가 테마 시스템을 알고 싶어 할 때) |
| Phase 2.1 스캐폴드 | — | SKILL.md의 이 절을 한 번 확인 |
| **Phase 2.4 단일 장 구현 (2.2 / 2.3에서 호출, N회 반복)** | **`references/CHAPTER-CRAFT.md`** 단일 진입점 — Part 0 10가지 원칙 / Part 1 시작 전 질문 5개 / Part 2 관계→동작 의사결정 트리 / Part 3 시각 도구함 / Part 4 길이 참고 / Part 5 AI 티 제거 반패턴 / Part 6 코드 하드 규칙 (**narrations.ts 필수 규칙 포함**) / Part 7 완료 검수 / Part 8 피드백 빠른 참조 + 현재 테마 `themes/<id>/theme.json` + 현재 장의 outline.md 단락 + **`article.md`의 현재 장 관련 단락** + 소재 목록 | `references/EXAMPLES/` (구조 예시이며 복제 템플릿 아님); `references/THEMES.md` 전체 토큰 계약 |
| Phase 3 오디오 합성 | `references/AUDIO.md` (`narrations.ts` → segments.json → 원하는 provider 절차, 기본 minimax + openai 포함) | `templates/scripts/tts-providers/README.md` (provider 교체 / 자체 TTS 사용 시) |
| Phase 4 화면 녹화 + 후반 작업 | `references/RECORDING.md` (`?auto=1` 자동 녹화 포함) | — |
| 테마 선택 / 제작 / 교체 | — | `references/THEMES.md` |

> **장을 작성할 때는 `CHAPTER-CRAFT.md` 하나만 읽습니다.** 10가지 원칙 / 시작 전 자기 질문 / 의사결정 트리 / AI 티 제거 반패턴 / 완료 검수가 단일 진입점에 모두 들어 있습니다. `EXAMPLES/`는 **필수 참조가 아닙니다**. 먼저 콘텐츠에 맞춰 자유롭게 설계하고 막힐 때만 참고합니다 (기준점에서 “형태”를 참고할 뿐 베끼지 않음).

---

## Phase 1 — 콘텐츠 작성 (한 번에 생성)

### 1.1 사용자 입력 파악

| 사용자가 제공한 것 | 해야 할 일 |
|---|---|
| 원문 (문어체 / 공식 계정 글 / 논문 / 블로그) | `script.md` + `outline.md`를 한 번에 생성 (1.2), Checkpoint Plan으로 이동 |
| 바로 사용할 내레이션 원고 / 영상 대본 | `script.md`로 저장하고 `outline.md` (1.2 축약 버전)를 한 번에 생성한 뒤 Checkpoint Plan으로 이동 |
| 아무것도 없이 “X 주제 영상 만들어 줘”라고만 요청 | **질문하기**: 먼저 소재나 개요를 제공해 달라고 한다. Skill이 사용자 대신 콘텐츠를 구상하지 않음 |

### 1.2 script.md + outline.md 한 번에 생성

**두 산출물을 한 번의 사고 과정에서 완성합니다.**

1. **`script.md` 생성**: [`references/SCRIPT-STYLE.md`](references/SCRIPT-STYLE.md) 규칙에 따라 글을 원문 언어를 유지하는 플랫폼용 내레이션 원고로 바꿉니다. **`article.md`는 삭제하지 않고 보존**합니다 — outline의 정보 풀과 장 구현의 화면 디테일을 제공하는 자료입니다 (이중 출처 원칙).
2. **`outline.md` 생성**: [`references/OUTLINE-FORMAT.md`](references/OUTLINE-FORMAT.md) 규칙에 따라 장과 단계를 나누고 각 장 첫 부분에서 **정보 풀**을 추출합니다.

**outline의 범위** (중요):

| outline에 포함할 것 | outline에서 제외할 것 |
|---|---|
| 장 구분 / 장별 단계 수 / 예상 길이 | 구체적인 애니메이션 종류 (blur clear / wipe / spring) |
| 단계별 화면 내용 (hero / 데이터 / 슬로건 / 목록 항목) | CSS 구현 방식 (filter / SVG / clip-path) |
| 장 단위 **정보 풀**: article에서 추출한 수치 / 인용 / 사례 / 라벨 | 애니메이션 시간값 (~2.5s / 80~120ms 등) |
| 단계별 관계 이름 접두어 (“대비”, “점진 목록”, “핵심 문장” 등 선택적 힌트) | 지속적인 미세 움직임 / 순차 지연량 등 세부 리듬 |

> **outline에 애니메이션을 적지 않는 이유**: 애니메이션을 고정하면 chapter agent가 번역기처럼 퇴화합니다. 여백을 두면 각 단계를 시작할 때 [`CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md)의 “콘텐츠 기반 의사결정 트리”에 따라 자유롭게 설계할 수 있어야 진짜 영상 느낌이 납니다. 자세한 내용은 [`CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md) Part 0 원칙 7을 확인하세요.

**파일로 저장한 뒤 Checkpoint Plan에 들어가기 전에 반드시 자체 검수합니다.** 위의 “필수 자체 검수 절차”를 따라 `script.md` / `outline.md`를 각각 검토하고 (Agent Teams → subAgent → 자체 검수 순으로 우선), 결과에 따라 고친 다음 Checkpoint Plan으로 이동합니다.

---

## Checkpoint Plan — 5개 항목을 한 번에 확인 (**필수 단계**)

`script.md`와 `outline.md` 작성 후 반드시 멈춥니다. **사용자가 한 단계에서 다섯 항목을 함께 확인해야 합니다.**

### 에이전트가 준비할 사항

1. 모든 `themes/*/theme.json`을 읽어 `nameZh` / `descriptionZh` / `bestFor` / `mood`를 준비합니다 — **테마 목록을 하드코딩하지 않습니다.**
2. `script.md`의 콘텐츠 종류 / 키워드 / 어조에 맞춰 `bestFor`를 확인하고 테마 중 **가장 잘 맞는 2–3개를 먼저 추천**합니다.
3. `outline.md` 끝부분의 “소재 목록”을 훑습니다.

### 요약 템플릿 (기본 구조, 상황에 맞게 채우기)

```text
콘텐츠 계획을 작성했습니다. 산출 파일:
  📄 article.md     {사용자가 원문을 제공했다면 보존}
  📄 script.md      {X}자 / 약 {T}분
  📄 outline.md     {N}장 / {M}단계 + 장별 정보 풀 + 끝부분 소재 목록

장 미리보기:
  1. <id>     <장 제목>    <S>단계 약 <T>초
  2. ...

다음 다섯 항목을 한 번에 확인해 주세요.

  1. 원고 (script.md)를 수정할까요?
     파일을 직접 편집하거나 원하는 수정 방향을 말해 주세요.

  2. 개발 계획 (outline.md)을 수정할까요? 다음을 확인해 주세요.
     - 장 구분 / 단계 수 / 예상 길이가 적절한가 (참고: 장당 30~60초)
     - 각 단계에 표시할 화면 내용이 명확한가
     - 각 장 첫 부분의 “정보 풀”에 화면을 구성할 article 디테일이 충분한가
     - 마지막 소재 목록이 완전한가

  3. 어떤 테마를 선택할까요? 추천:
     ★ <추천 1: nameZh (id)> — <bestFor와 맞는 이유>; <descriptionZh 요약>
     ★ <추천 2 / 추천 3>
     다른 선택: <나머지 테마, nameZh + 한 문장 설명>
     새 테마 제작도 요청할 수 있습니다 (references/THEMES.md 참고).

  4. 실제 소재를 어떻게 준비할까요? 영상에 필요한 이미지를 대략 정리했습니다: <목록>
     a) <현재 소재 경로>에서 제가 고름   b) 직접 제공   c) 전부 placeholder

  5. 개발 방식은 어떤 것으로 할까요?

     **방식과 관계없이 1장은 메인 에이전트가 완성하고 사용자가 검수해야 합니다** (필수 기준점).
     차이는 2장 이후입니다.

     A) 기본 · 장별 확인 (추천)
        장을 완성할 때마다 멈춰 검수 → 위험을 제어하고 리듬을 안정적으로 유지
     B) 1장 이후 순차 개발 (병렬 아님)
        메인 에이전트가 2~N장을 순차로 완성한 뒤 한 번에 검수 → 중간 속도 / 병렬 작업 미지원 환경에 적합
     C) 1장 이후 병렬 개발 (subagent)
        subagent가 2~N장을 병렬 처리 → 가장 빠름 / 병렬 수는 사용자가 지정 (한 번에 몇 장인지)
        ⚠️ 장별 스타일 차이가 있을 수 있음 (예상된 결과이며 테마 금지 규칙이 기준을 잡음)
```

피드백을 받은 뒤:
- 원고 / outline을 고쳐야 하면 파일을 직접 편집하고 완료 후 한 번 알립니다 (또는 수정 내용을 말로 설명).
- **Phase 2로 넘어가기 전에 테마를 확정해야 합니다.** 사용자가 “테마는 골라 줘”라고 하면 첫 번째 추천을 선택하고, **무엇을 골랐고 이유가 무엇인지 알린 뒤** 사용자가 바꿀 기회를 줍니다.
- 개발 방식이 정해지면 Phase 2로 이동합니다.

---

## Phase 2 — 웹 개발

### 2.1 스캐폴드

```bash
bash <path-to-web-video-presentation>/scripts/scaffold.sh \
  ./presentation \
  --theme=<사용자가 선택한 theme id>

bash <path-to-web-video-presentation>/scripts/scaffold.sh --list-themes
```

> 사용자 지정 테마는 [`references/THEMES.md`](references/THEMES.md)의 “새 테마 만들기” 절차에 따라 `themes/<my-theme>/`를 만든 뒤 `--theme=<my-theme>`를 지정합니다.

스캐폴드는 `01-example` 데모를 포함합니다. 첫 번째 실제 장을 작성하기 전에 **삭제합니다.**

```bash
rm -rf presentation/src/chapters/01-example
```

그리고 `presentation/src/registry/chapters.ts`에서 `EXAMPLE_CHAPTER` import와 배열 항목을 제거합니다.

### 2.2 1장 — 메인 스레드에서 구현 + 필수 검수

**핵심**: 1장은 처음부터 완성본으로 한 번에 만듭니다 (리듬 + 시각 요소 + 실제 소재까지 갖춤). **“뼈대 버전”은 없습니다** — 사용자가 바로 검수할 수 있는 기준 장을 만들어야 합니다.

1장을 메인 스레드에서 만들어야 하는 이유:

- [`CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md) 지침을 **현재 테마 + 현재 주제**에 처음 적용합니다.
- 지침에 빈틈이 있거나 테마 색상 / 글꼴 토큰이 부족하면 1장에서 드러납니다. 이때 사용자 피드백으로 지침이나 테마를 조정할 수 있어 **일찍 고칠수록 비용이 낮습니다.**
- 다음 장은 순차든 병렬이든 1장 코드 패턴을 참고해야 합니다. 따라서 1장은 해당 프로젝트의 “스타일 기준점”입니다 (장 사이에 일관성을 강제하지 않지만 각 장은 독립적으로 설득력이 있어야 함).

**1장을 끝내면 반드시 멈추고** 사용자 검수를 기다립니다.

```text
1장 <id>를 완성했고 개발 서버가 localhost:5173에서 실행 중입니다.

검수할 내용:
  □ 시각적 분위기가 맞나요? <theme nameZh>의 예상과 부합하나요?
  □ 리듬이 맞나요? 너무 빠르거나 느린 단계, 정보가 부족한 단계가 있나요?
  □ 콘텐츠 기반 애니메이션이 충분한가요? 아니면 무의미한 등장 애니메이션이 있나요?
  □ 이중 출처 원칙: 화면에 “내레이션에서 읽지 않았지만 article에서 가져온” 디테일이 있나요?
  □ AI 티 점검: 보라·분홍 그라데이션 / 둥근 컬러 테두리 / 가짜 삽화 / 이모지가 있나요?

문제를 알려 주시면 해당 부분을 수정합니다. 괜찮으면 “계속”이라고 말해 주세요. 선택한 방식에 따라 2장 이후를 진행합니다.
```

### 2.3 2~N장 — 선택한 방식으로 진행

**모든 방식에 공통인 규칙**: 각 장은 [`CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md)에 따라 독립적으로 개발합니다. **장 사이의 스타일을 완전히 통일할 필요는 없습니다.** 테마 색상 / 글꼴 토큰이 시각적 통일성을 제공하고 애니메이션 / 리듬 / 시각 연출은 장마다 자유롭게 설계하는 것이 의도된 방식입니다.

#### 방식 A · 기본 · 장별 확인

2장 완성 → 멈춰 검수 → 승인 → 3장 제작 → 멈춤 → ... → N장. **각 장을 독립적으로 검수**하고 문제는 언제든 수정합니다. **위험이 가장 낮고 진행이 안정적입니다.** 사용자가 방식을 명확히 고르지 않으면 이 방식을 기본으로 사용합니다.

#### 방식 B · 1장 이후 순차 개발

2장 → 3장 → ... → N장을 **메인 스레드에서 순차적으로 완성한 뒤 한 번에 검수**합니다. 중간 속도이며 병렬 작업을 지원하지 않는 에이전트 환경에 적합합니다.

#### 방식 C · 1장 이후 병렬 개발 (subagent)

subagent를 사용해 2~N장을 병렬로 완성합니다. 최대 병렬 수는 사용자가 결정합니다 (“한 번에 4장” / “한 번에 2장”). **가장 빠르지만 장마다 스타일이 달라질 수 있습니다.** 이는 예상된 결과이며 이유는 다음과 같습니다.

1. 각 subagent가 다른 subagent의 결과를 볼 수 없어 기계적으로 스타일을 맞출 수 없습니다.
2. 장 코드가 물리적으로 분리되어 (장마다 폴더 / 자체 CSS 접두어) 서로를 망가뜨리지 않습니다.
3. 테마 토큰이 색상 / 글꼴 / hero 숫자 / 카드 / 구분선의 성격 / 장식을 일관되게 잡아 분위기가 벗어나지 않게 합니다.
4. **스타일 차이는 사람이 쓴 영상의 호흡감**입니다 (서로 다른 목소리와 관점).

병렬 subagent 프롬프트에는 반드시 다음을 포함합니다.

- 현재 장 outline 단락 (정보 풀 포함)
- `references/CHAPTER-CRAFT.md` 경로 (**단일 필수 참조** — 시각 연출 요구 + 단계별 공개 + 이중 출처 원칙 + AI 티 제거 + 코드 금지선 + 완료 검수가 모두 포함)
- 현재 테마 `theme.json`의 `descriptionZh` / `mood` / `bestFor` (분위기 참고용. 애니메이션 / 시간 / 글자 크기 / 이모지는 chapter agent가 자유롭게 결정)
- **1장 코드를 “코드 스타일” 참고로 제공** (시각적 복제 대상 아님)
- 하드 규칙: 장마다 CSS 접두어를 분리 (`.cd-` / `.mg-` / `.pm-` / ...); `chapters.ts`를 수정하지 않음; 완료 후 `npx tsc --noEmit` 실행

**중요**: 어떤 방식을 골랐든 사용자는 언제든 중간에 방식을 바꿀 수 있습니다. 2장을 승인한 다음 “남은 장은 병렬로” / “남은 장은 장별로”라고 요청해도 됩니다.

### 2.4 단일 장 구현 (모든 장에 필수)

자세한 지침은 [`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md)를 봅니다 — 시각 연출 요구 / 단계별 공개 / 콘텐츠 선별 / 이중 출처 원칙 / 영상 연출 기본 미학 / AI 티 제거 / 코드 금지선 / 완료 검수를 다루는 **단일 필수 진입점**입니다.

**핵심 사항** (`CHAPTER-CRAFT.md`의 상세 내용):

- **모든 장에는 CSS / SVG / Canvas / JS 시각 연출이 있어야 하며**, 텍스트만 있는 장은 금지합니다.
- **단계별 공개**: 목록은 항목 하나당 step 하나여야 하며 모든 항목을 한 번에 표시하지 않습니다.
- **이중 출처 원칙**: 리듬은 내레이션 원고를 따르고 (순서를 바꾸지 않음), 디테일은 원문 article에서 가져옵니다 (정보 풀 + 해당 장 article 단락).
- **완료 체크리스트를 항목별로 검토**하고 미달이면 수정합니다. 위의 “필수 자체 검수 절차”를 따르며 (Agent Teams → subAgent → 자체 검수 우선), **고친 뒤 해당 장 결과를 사용자에게 보고합니다.**

### 2.5 큰 변경 후 STORAGE_KEY 증가

`chapters.ts`를 변경 (장 추가 / 삭제 / 순서 변경 또는 장의 `narrations.ts` 길이 변경)하면 `presentation/src/hooks/useStepper.ts`의 `STORAGE_KEY`를 **증가**시킵니다 (예: `v4` → `v5`). 이렇게 해야 저장된 커서가 존재하지 않는 단계에 놓이지 않습니다.

---

## Checkpoint Audio — 오디오 합성 여부 (**필수 단계**)

Phase 2가 끝나면 반드시 멈춰 사용자에게 묻습니다.

```text
웹 프레젠테이션이 완성됐습니다. {N}장 {M}단계이며 개발 서버가 localhost:5173에서 실행 중입니다.

“자동 재생 화면 녹화”용 오디오를 합성할까요?
  ✓ 합성 → 모든 장의 narrations.ts를 스캔해 audio-segments.json을 만들고,
           TTS provider를 불러 각 단계의 mp3를 public/audio/에 합성합니다.
           합성 후 ?auto=1 모드로 영상 전체를 한 번에 녹화하면 오디오와 영상이 자동 동기화됩니다.
           기본 제공 provider 두 가지:
             • minimax (mmx-cli)    —— 기본, 중국어 음성 안정적
             • openai (OPENAI_API_KEY) —— curl 기반, 이미 API 키가 있는 경우에 편리
           다른 백엔드 (ElevenLabs / 무료 edge-tts / 오프라인 macOS say /
           Azure / Google)는 scripts/tts-providers/README.md의 예제 참고.
  ✗ 합성하지 않음 → Phase 3을 건너뛰고 Phase 4에서 수동 녹화 + 후시 녹음
```

합성을 원하면 Phase 3, 원하지 않으면 바로 Phase 4로 이동합니다.

---

## Phase 3 — 오디오 합성 (선택)

자세한 절차는 [`references/AUDIO.md`](references/AUDIO.md)를 봅니다. 간단한 절차:

```bash
cd presentation
npm run extract-narrations   # 모든 narrations.ts → audio-segments.json 스캔
# 사용자가 audio-segments.json을 훑어 텍스트가 맞는지 확인하도록 요청
npm run synthesize-audio                       # 기본 minimax provider, 변경된 구간만 처리
# 내장 openai 사용 (OPENAI_API_KEY 필요):
PRESENTATION_TTS=openai npm run synthesize-audio
# 사용자 지정 provider: scripts/tts-providers/<name>.sh를 작성하고 해당 디렉터리 README.md 참고
```

합성 후 사용자에게 출력 위치 / 총 구간 수 / 길이가 이상한 구간을 알립니다 (너무 길면 해당 step 분할, 너무 짧으면 문구가 빈약함). 리듬을 마지막으로 조정할 기회를 준 다음 Phase 4로 이동합니다.

---

## Phase 4 — 화면 녹화 + 후반 작업

자세한 내용은 [`references/RECORDING.md`](references/RECORDING.md)를 참고합니다. 두 가지 방식:

| 상황 | 권장 방식 |
|---|---|
| Phase 3에서 오디오를 합성함 | **Auto 모드로 한 번에 녹화**: 브라우저에서 `localhost:5173/?auto=1` 열기 → SPACE 입력 → 전체 자동 재생 → 녹화 중단 → 앞뒤 자르기만 하면 완성. **후반 작업에서 오디오 트랙을 동기화할 필요 없음.** |
| Phase 3 생략 | 기본 Manual 모드에서 클릭으로 진행 → 원하는 편집 도구로 후반에 내레이션 추가 |

> 에이전트는 Phase 3 / Checkpoint Audio 이후 사용자에게 적절한 녹화 방식을 **먼저 알려야 합니다.**

---

## 10가지 원칙 (한 줄 요약)

전체 설명은 [`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md) Part 0을 봅니다 — **장 작성 중 자세한 내용은 여기에서 확인**하고 아래 표는 요약으로만 사용합니다.

| # | 원칙 | 한 줄 설명 |
|---|---|---|
| 1 | 16:9 고정 무대 | 콘텐츠는 1920×1080 + transform scale. 반응형으로 만들지 않음 |
| 2 | 전역 step 카운터 | 장은 step의 순수 함수이며 타이머 없음 |
| 3 | 단계마다 전체 화면 사용 | `if (step === N) return <FullScene />` |
| 4 | 내레이션 박자 = step | 한 박자 = step 하나 = 초점 아이디어 하나 |
| 5 | 숨겨진 가장자리 컨트롤 | 진행 표시줄 / 페이지 넘김 컨트롤은 기본 opacity 0 |
| 6 | 무대에 UI 장식 없음 | header / footer / 페이지 번호 / 브랜드 바 없음 |
| 7 | **콘텐츠 기반 애니메이션** | 내재된 동작부터 찾고 없을 때만 등장 애니메이션을 대안으로 사용. 지속적인 미세 움직임은 신중히 사용 |
| 8 | 여러 항목은 하나씩 공개 | 항목 1개 = step 하나. N개 항목을 stagger로 동시에 올리지 않음 |
| 9 | 전체 영상에서 같은 테마 | 장 사이에 표면 색을 바꾸지 않음. **색상 / 글꼴은 토큰을 따르고**, 다른 규모의 장은 자유롭게 설계 |
| 10 | 이중 출처 원칙 | script는 박자를 정하고 **article은 화면 정보 밀도**를 정함 (정보 풀에 반영) |

---

## 흔한 사용자 피드백 빠른 참조

간단한 표는 [`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md) Part 8 “흔한 피드백 빠른 참조”를 봅니다. **핵심**: 먼저 문제의 층위 (리듬 / 시각 / 콘텐츠 / 코드)를 찾고 가장 작은 부분을 수정합니다. **장 전체를 다시 만들지 않습니다.**

---

## 관련 자료

한꺼번에 전부 읽지 않도록 “읽을 시점”을 표시합니다.

| 파일 | 읽을 시점 | 내용 |
|---|---|---|
| [`references/SCRIPT-STYLE.md`](references/SCRIPT-STYLE.md) | Phase 1.2 필수 | 글 → 내레이션 원고 규칙, 플랫폼별 변형 |
| [`references/OUTLINE-FORMAT.md`](references/OUTLINE-FORMAT.md) | Phase 1.2 필수 | outline.md 필드 사양, 명명 규칙, 장 분할, 정보 풀 |
| [`references/CHAPTER-CRAFT.md`](references/CHAPTER-CRAFT.md) | **Phase 2.4에서 장마다 단일 필수 진입점** | Part 0 10가지 원칙 / Part 1 시작 전 질문 5개 / Part 2 관계→동작 의사결정 트리 / Part 3 시각 도구함 / Part 4 길이 / Part 5 AI 티 제거 반패턴 / Part 6 코드 하드 규칙 / Part 7 완료 검수 / Part 8 피드백 빠른 참조 |
| [`references/EXAMPLES/`](references/EXAMPLES/) | **선택 — 구조 참고용** | 장 구조 예시 (hook / list-reveal / case-tech-review); **복제 템플릿 아님** |
| [`references/THEMES.md`](references/THEMES.md) | 테마를 선택 / 제작 / 교체할 때 | 전체 토큰 계약 + 기본 테마 목록 + 제작 절차 |
| [`references/AUDIO.md`](references/AUDIO.md) | Phase 3에서만 읽기 | provider 불문 오디오 합성 절차, minimax 기본 사용법, provider 교체, 문제 해결 |
| [`templates/scripts/tts-providers/README.md`](templates/scripts/tts-providers/README.md) | TTS provider를 교체 / 추가할 때 | 3개 함수 계약 + 기본 2종 (minimax / openai) + 바로 쓸 수 있는 코드 5종 (ElevenLabs / edge-tts / macOS say / Azure / Google) |
| [`references/RECORDING.md`](references/RECORDING.md) | Phase 4에서만 읽기 | 화면 녹화 도구 + 후반 합성 |
| [`themes/`](themes) | Checkpoint Plan / Phase 1.2 | 기본 테마 (각 테마에 `theme.json` + `tokens.css` 포함) |
| [`scripts/scaffold.sh`](scripts/scaffold.sh) | Phase 2.1에서 한 번 실행 | 프로젝트 스캐폴드를 한 번에 생성 |
