---
name: landing-page-design
description: "전환율이 높은 랜딩 페이지를 만드는 완전한 시스템이다. 인테이크 질문, 페이지 구조, 레이아웃 선택, 전환 중심 카피라이팅, SEO에 더해 타이포그래피, 간격, 모서리 반경, 배경, 히어로 레이아웃, 아이콘, 모션에 대한 엄격한 시각 규칙을 담는다. 랜딩 페이지, 마케팅 사이트, 웹 UI, 페이지 섹션, 컴포넌트, 프로토타입을 만들거나 수정하거나 스타일링하거나 검토하거나 카피를 쓸 때 항상 사용한다. 사용자가 디자인, 전환, 토큰, 디자인 시스템을 언급하지 않아도 마찬가지다. 페이지 섹션, 헤드라인, CTA, 폰트, 글자 크기, 간격 값, 모서리 반경, 배경색, 아이콘, 트랜지션을 고르기 전에 반드시 참고한다."
---

# Landing Page Design

랜딩 페이지는 홈페이지가 아니다. 홈페이지는 여러 의도를 함께 다룬다. 랜딩 페이지는 의도 하나를 이긴다.

**하나의 오퍼 → 하나의 대상 → 하나의 기본 행동.**

이 스킬은 두 부분으로 나뉜다. **Part A**는 페이지가 무엇을 말하고 어떻게 구성될지 정한다. **Part B**는 타협할 수 없는 시각 시스템이다. B를 건드리기 전에 A를 먼저 끝낸다.

## Scope

모든 웹 UI 작업에 적용한다. 랜딩 페이지, 마케팅 사이트, 컴포넌트, 대시보드, 프로토타입, 디자인 검토가 여기에 포함된다. 이 파일의 규칙이 프레임워크 기본값과 충돌하면 이 파일이 우선한다. 사용자의 명시적 요청이 규칙과 충돌하면 사용자가 우선한다.

**보조 스킬.** 새로 만드는 것이 아니라 *기존* 사이트를 개선할 때는 `redesign-existing-projects`([github.com/elayadesign/redesign-skill](https://github.com/elayadesign/redesign-skill))를 사용한다. 이 스킬은 일반적인 패턴을 진단하고, 구체적인 값은 모두 이 파일을 따른다.

---

# PART A — Strategy and structure (전략과 구조)

## A1. Intake (인테이크)

디자인이나 작성을 시작하기 전에 다음 항목을 먼저 확보한다. 부족한 것만 묻고, 질문은 하나씩 던지지 말고 한 번에 묶어서 한다.

**Purpose (목적)**
- 기본 행동은 하나뿐인가? (체험, 데모, 구매, 대기자 등록, 다운로드)
- 오퍼는 정확히 무엇인가? 사용자가 무엇을 받는가?
- 무엇을 전환으로 보는가? (클릭, 가입, 구매)

**Audience and context (대상과 맥락)**
- ICP는 누구인가?
- 그들이 풀려는 문제는 무엇인가?
- 가장 흔한 반론 세 가지는 무엇인가? 즉 지금 왜 전환하지 않는가
- 유입 경로는 광고, 검색, 소셜, 이메일 중 무엇인가?
- 방문자는 도착했을 때 이미 무엇을 알고 있는가?

**Proof and assets (근거와 자산)**
- 근거 자료: 로고, 추천사, 수치, 사례 연구
- 스크린샷, 데모 영상, 제품 GIF
- 보증, 환불 조건, 해지 조건

**Constraints (제약)**
- 브랜드 목소리: 캐주얼한가 전문적인가
- 디자인 방향: 미니멀 에디토리얼, 플레이풀 3D, 글래스 UI
- 모바일이 우선인가?

사용자가 답하지 못하면 합리적인 가정을 하고 한 줄로 밝힌 뒤 계속한다. 빌드를 멈추지 않는다.

## A2. Page structure (페이지 구조)

**Above the fold (필수, 첫 화면)**
1. 헤드라인: 결과와 대상
2. 서브헤드라인: 방법을 설명하고 구체성을 더한다
3. 기본 CTA: 명확한 동사와 받게 될 것
4. 근거 신호 하나: 로고 띠, 수치, 짧은 추천사 중 하나
5. 히어로 비주얼: 제품 스크린샷이나 영상, 또는 강한 일러스트레이션

**Mid page (논증)**
6. 문제에서 해결로, 한 섹션
7. 혜택 세 개에서 다섯 개, 결과 중심
8. 작동 방식, 세 단계
9. 소셜 프루프: 추천사 또는 사례 연구

**Bottom (반론 처리)**
10. FAQ, 여섯 개에서 열두 개 질문
11. 위험 역전: 체험, 언제든 해지, 보증
12. 최종 CTA, 상단과 동일하게

B11의 필수 태그라인 공개 섹션은 중반부 논증 어딘가에 넣는다. 보통 히어로 바로 다음이나 혜택 다음에 둔다.

## A3. Layout selection (레이아웃 선택)

하나를 고르고 이유를 밝힌다.

| 유형 | 사용 시점 |
|---|---|
| **A. Classic hero plus sections** (클래식 히어로와 섹션) | 제품이 히어로 스크린샷만 봐도 이해되는 경우. 가장 흔하다. |
| **B. Long form story** (긴 서사형) | 교육이 필요하고 회의론을 넘어야 하는 경우. |
| **C. Minimal conversion page** (미니멀 전환 페이지) | 의도가 강한 트래픽(알려진 사용자에게 보내는 이메일)이거나, 다운로드나 대기자 등록처럼 짧은 오퍼인 경우. |
| **D. Comparison page** (비교 페이지) | 검색 의도에 대안("X vs Y", "best for")이 포함된 경우. 보통 SEO 페이지와 함께 쓴다. |

## A4. Conversion rules (전환 규칙)

**Match message to source (메시지를 유입원에 맞춘다).** 트래픽이 광고에서 온다면 광고 헤드라인을 히어로에 그대로 옮기고, 같은 약속과 같은 시각적 톤을 유지한다.

**Make the next step obvious (다음 단계를 분명히 한다).** 기본 CTA는 하나만 둔다. 첫 화면 위에 경쟁하는 CTA를 두지 않는다.

**Write benefit first (혜택을 먼저 쓴다).** 기능은 제품이 무엇을 하는지를 말한다. 혜택은 그것이 사용자에게 무엇을 뜻하는지를 말한다.

**Be specific (구체적으로 쓴다).**
- ❌ "Save time and streamline"
- ✅ "Cut your weekly reporting from 4 hours to 15 minutes"

**Reduce risk (위험을 줄인다).** 다음 중 최소 하나를 넣는다: 무료 체험, 무료 플랜, 신용카드 불필요, 언제든 해지, 환불 보증.

**Treat objections as a section, not a footnote (반론은 각주가 아니라 섹션으로 다룬다).** 마찰이 큰 오퍼라면 FAQ를 앞쪽으로 옮긴다. 근거는 그것이 뒷받침하는 주장 바로 옆에 둔다.

## A5. Copywriting (카피라이팅)

**Headline formulas (헤드라인 공식)**
- "{Outcome} without {pain}"
- "The {category} for {audience}"
- "Ship {result} in {time}"

**Subheadline (서브헤드라인).** 한두 문장으로 무엇인지와 누구를 위한 것인지 밝힌다.

**CTA.** 동사와 받게 될 것을 함께 쓴다. "Learn more"나 "Submit"은 쓰지 않는다. "Start free trial", "Book a demo", "Get the checklist"를 쓴다.

**Benefit bullets (혜택 목록).** 굵게 쓴 혜택 뒤에 근거나 세부 내용을 잇는다. 예: **Faster iteration** — generate three layout variants in one click.

참고: B1의 카피 규칙도 여전히 적용된다. 문장 안에 하이픈을 쓰지 않고, 단어를 고립시키지 않는다.

## A6. Build order (빌드 순서)

다음 순서로 섹션 단위로 작업한다.

1. 히어로
2. 혜택
3. 작동 방식
4. 근거
5. FAQ
6. 최종 CTA

반복할 때마다 페이지 전체를 다시 만들지 않는다. 섹션 단위로 작업해야 통제가 유지되고 변경 내용을 검토하기 쉽다.

## A7. SEO and AEO (SEO와 AEO)

**Do not index (색인하지 않는다).** 광고 전용 캠페인 페이지와 기한이 빠듯한 오퍼 페이지는 색인하지 않는다. `noindex`를 쓰거나 색인되지 않는 경로 뒤에 둔다.

**Do index (색인한다).** 상시 오퍼와 검색 의도가 약속과 맞는 페이지는 색인한다. 명확한 title과 meta description을 달고, 홈페이지와 기능 페이지에서 내부 링크를 걸며, AEO를 위해 FAQ를 평문 질문과 답 형식으로 둔다. 적절하다면 FAQ 스키마를 추가한다.

## A8. Pitfalls (흔한 함정)

- 첫 화면 위에 CTA가 너무 많음
- "streamline", "optimize" 같은 모호한 가치 제안
- 결과 없이 기능만 긴 목록으로 나열함
- 근거가 맨 아래에 묻혀 있음
- 가독성을 해치는 모바일 레이아웃
- 다음 단계가 분명하지 않음

---

# PART B — Visual system (시각 시스템)

모든 시각 값은 즉흥적으로 정하지 말고 이 규칙을 거쳐 정해야 한다.

## B1. Typography (타이포그래피)

### Fonts (폰트)

**Use (사용):** Geist, Manrope, Geist Mono, Poppins.

**Never use (절대 쓰지 않음):** Inter, Roboto, Arial, Open Sans, Helvetica.

**Never use italic fonts (이탤릭 폰트는 인터페이스 어디에서도 쓰지 않는다).**

**One typeface per site (사이트당 서체는 하나).** 프롬프트가 명시적으로 요구하지 않는 한 두 서체를 짝지어 쓰지 않는다. Geist Mono는 기본 서체와 함께 코드, 데이터, 숫자 UI에서 모노스페이스가 기능적으로 꼭 필요한 경우에만 허용한다.

**Never use ultra bold weights (초굵은 두께는 쓰지 않는다, 900 / black).** 최대 semibold 또는 bold까지만 쓴다.

### Copy rules (카피 규칙)

**No hyphens in text (텍스트에 하이픈을 쓰지 않는다).** 본문, 제목, 레이블 안에 `-`를 쓰지 않는다. 대신 문장을 다시 쓴다.

**No orphaned words (고립된 단어를 두지 않는다).** 단어 하나가 마지막 줄에 홀로 남아서는 안 된다. 제목에는 `text-wrap: balance`를, 본문에는 `text-wrap: pretty`를 적용한다.

### Type scale (타입 스케일)

글자 크기는 항상 Tailwind 기본 타입 스케일 값으로 맞춘다. `text-[19px]`, `font-size: 22px`, `1.4rem` 같은 임의 값을 그대로 두지 않는다.

기존 크기가 어떤 단계에도 정확히 맞지 않으면, 크기와 짝을 이루는 line height를 함께 고려해 **바로 아래 단계**로 맞춘다.

| 클래스 | 크기 | Line height |
|---|---|---|
| `text-xs` | 12px (0.75rem) | 16px |
| `text-sm` | 14px (0.875rem) | 20px |
| `text-base` | 16px (1rem) | 24px |
| `text-lg` | 18px (1.125rem) | 28px |
| `text-xl` | 20px (1.25rem) | 28px |
| `text-2xl` | 24px (1.5rem) | 32px |
| `text-3xl` | 30px (1.875rem) | 36px |
| `text-4xl` | 36px (2.25rem) | 40px |
| `text-5xl` | 48px (3rem) | 1 |
| `text-6xl` | 60px (3.75rem) | 1 |
| `text-7xl` | 72px (4.5rem) | 1 |
| `text-8xl` | 96px (6rem) | 1 |
| `text-9xl` | 128px (8rem) | 1 |

감사(audit) 중에 스케일 맞춤과 별도로 정한 custom line height를 함께 적용하지 않는다. 자간과 line height는 맞춰진 단계가 이미 제공하는 값 **안에서만** 조정해서 두 규칙이 서로 충돌하지 않게 한다.

### Text styles (텍스트 스타일)

모든 텍스트는 아래의 이름 붙은 스타일 중 하나를 쓴다. 느슨한 크기와 두께를 직접 지정하지 않는다. 대문자 표기를 포함해 이름을 정확히 그대로 쓴다.

| 스타일 | 스케일 단계 | 크기 / line height | 두께 |
|---|---|---|---|
| Heading 1 | `text-6xl` | 60 / 60 | Semibold |
| Heading 2 | `text-5xl` | 48 / 48 | Semibold |
| Heading 3 | `text-4xl` | 36 / 40 | Semibold |
| Heading 4 | `text-3xl` | 30 / 36 | Semibold |
| Heading 5 | `text-2xl` | 24 / 32 | Semibold |
| Heading 6 | `text-xl` | 20 / 28 | Semibold |
| Title 1 | `text-xl` | 20 / 28 | Medium |
| Title 2 | `text-lg` | 18 / 28 | Medium |
| Title 3 | `text-base` | 16 / 24 | Medium |
| Title 4 | `text-sm` | 14 / 20 | Medium |
| Title 5 | `text-xs` | 12 / 16 | Medium |
| Body 1 | `text-base` | 16 / 24 | Semibold |
| Body 2 | `text-base` | 16 / 24 | Medium |
| Body 3 | `text-base` | 16 / 24 | Regular |
| Body 4 | `text-sm` | 14 / 20 | Semibold |
| Body 5 | `text-sm` | 14 / 20 | Medium |
| Body 6 | `text-sm` | 14 / 20 | Regular |
| Button-lg | `text-lg` | 18 / 28 | Semibold |
| Button-md | `text-base` | 16 / 24 | Semibold |
| Button-sm | `text-sm` | 14 / 20 | Semibold |
| Button-Xsm | `text-xs` | 12 / 16 | Semibold |
| Caption 1 | `text-sm` | 14 / 20 | Medium |
| Caption 2 | `text-sm` | 14 / 20 | Regular |
| Caption 3 | `text-xs` | 12 / 16 | Semibold |
| Caption 4 | `text-xs` | 12 / 16 | Medium |
| Caption 5 | `text-xs` | 12 / 16 | Regular |

각 그룹의 역할은 다음과 같다.

- **Heading**: 페이지와 섹션 제목에 쓴다. 큰 것부터 작은 순서로 간다. Heading 1이 히어로다.
- **Title**: 카드 제목, 목록 항목 제목, 블록을 이끄는 레이블, 내비게이션 항목에 쓴다.
- **Body**: 본문 텍스트에 쓴다. 같은 크기 안에서는 숫자가 작을수록 두께가 강하고, 마지막 번호가 Regular이다.
- **Button**: 버튼 안의 텍스트에만 쓴다. 기본 버튼은 Button-md를, 작은 헤더 버튼은 Button-sm을 쓴다.
- **Caption**: 메타데이터, 도움말 텍스트, 배지, 타임스탬프, 작은 글씨에 쓴다.

모든 크기는 위 타입 스케일에서 가져오므로, 스타일이 스케일에 없는 값을 새로 도입하지 않는다. 프로젝트에 새 스타일이 필요하면 새 이름을 만들지 말고 같은 그룹의 다음 번호를 붙인다(예: Body 7). 이때 값은 스케일 단계에서 가져온다.

코드에서는 각 스타일을 한 번만 정의하고, 이름을 kebab case로 옮긴 같은 이름의 재사용 가능한 클래스나 토큰으로 만든다(`heading-1`, `body-4`, `button-md`, `caption-2`). 그리고 요소마다 크기와 두께 유틸리티를 반복하지 않고 이 클래스를 적용한다.

## B2. Spacing (간격)

아래 값만 쓴다. 그 사이의 값이나 바깥의 값은 쓰지 않는다.

| 토큰 | 값 |
|---|---|
| Spacing-0 | 0 |
| Spacing-25 | 2px |
| Spacing-50 | 4px |
| Spacing-75 | 8px |
| Spacing-100 | 12px |
| Spacing-200 | 16px |
| Spacing-300 | 24px |
| Spacing-400 | 32px |
| Spacing-500 | 40px |
| Spacing-600 | 48px |
| Spacing-700 | 64px |
| Spacing-800 | 80px |
| Spacing-900 | 96px |

**Main buttons (기본 버튼):** 세로 패딩 8px, 가로 패딩 12px.

## B3. Corner radius (모서리 반경)

Tailwind의 radius 값만 쓴다.

**Nested radius formula (중첩 반경 공식).** 한 도형이 다른 도형 안에 들어 있고 둘 사이의 간격이 **32px 미만**이면 다음을 적용한다.

```
inner radius = outer radius − gap
```

결과가 **2보다 클 때만** 적용한다. 2 이하이면 안쪽 도형은 직각으로 두거나 그대로 둔다.

예: 바깥 카드가 `rounded-2xl`(16px)이고 내부 패딩이 8px이면, 안쪽 요소의 반경은 8px(`rounded-lg`)이 된다.

## B4. Borders and backgrounds (테두리와 배경)

- **Never apply a border to only one side of a card (카드의 한쪽 면에만 테두리를 주지 않는다).** 테두리는 사방을 모두 두르거나, 아예 두지 않는다.
- **Never use gradients in backgrounds (배경에 그라데이션을 쓰지 않는다).** 배경은 평면이다.

### Dark mode background colors (다크 모드 배경색)

다음 색만 쓴다.

`#000000` · `#181818` · `#1F1F1F` · `#272727` · `#313131` · `#131209`

## B5. Hero section (히어로 섹션)

### Heading color (제목 색)

- **Dark theme (다크 테마):** 제목 텍스트에 왼쪽에서 오른쪽으로 가는 그라데이션을 적용한다. `#FFFFFF` → `#9B9B9B`.
- **Light theme (라이트 테마):** 제목 텍스트에 왼쪽에서 오른쪽으로 가는 그라데이션을 적용한다. `#000000` → `#666666`.

그라데이션을 쓰는 곳은 이 한 곳뿐이며, 배경이 아니라 텍스트에만 쓴다.

### Layout (레이아웃)

- 제목과 부제목 모두 **최대 너비 680px**을 가진다.
- 제목 카피를 읽고 **의미 있는** 지점에서 줄을 나눈다.
- 구절을 어색하게 끊거나 문장을 읽기 어렵게 만드는 방식으로 줄을 나누지 않는다. 생각이 끊기는 곳에서 줄을 나눈다.

## B6. Icons (아이콘)

**Use (사용):** Phosphor, Solar, Iconamoon.

**Never use (절대 쓰지 않음):** Material Icons, Material Symbols.

## B7. Motion (모션)

모션은 무게감이 있고, 자리에 안착하면서 감속해야 한다. 브라우저 기본 곡선(`ease`, `linear`, `ease-in-out`)은 절대 내보내지 않는다.

**Base curve (기본 곡선):** 레이아웃과 위치 변화에는 `ease-[cubic-bezier(0.22,1,0.36,1)]`와 `duration-500`을 쓴다. 호버 시의 색과 불투명도 변화에는 `duration-300`을 쓸 수 있으며, 200ms보다 짧게 쓰지 않는다.

`transform`과 `opacity`만 애니메이션한다. `top`, `left`, `width`, `height`는 절대 애니메이션하지 않는다.

`prefers-reduced-motion`을 존중한다. 움직임은 단순한 opacity 변화로 대체한다.

### Navigation (내비게이션)

**Resting state (기본 상태).** 상단 가장자리에 붙지 않고 살짝 떠 있는 컴팩트한 바다. 가운데 정렬되며 내용 크기에 맞춘다. 반투명 표면에 배경 블러를 주어 뒤의 페이지 내용이 희미하게 보이게 한다. 간격은 B2에서, 반경은 B3에서 가져온다.

**Menu toggle (메뉴 토글).** 열기와 닫기 아이콘은 즉시 바뀌지 않고 두 상태 사이에서 변형된다. B6의 아이콘을 쓰거나 선을 직접 그린다. 어느 쪽이든 변화는 기본 곡선으로 애니메이션한다.

**Mobile menu (모바일 메뉴).** 작은 드롭다운이 아니라 화면 전체 높이의 패널로 열린다. 패널 배경은 테마의 기본 표면을 높은 불투명도와 강한 블러로 처리한다.

**Link entrance (링크 등장).** 열린 메뉴 안의 링크는 읽는 순서대로 하나씩 등장한다. 각 항목은 짧은 거리(Spacing-300, 24px)만큼 위로 올라오면서 동시에 페이드인한다. 항목마다 이전 항목 뒤 60ms씩 지연하고, 전체 시퀀스는 400ms로 제한해서 긴 메뉴도 느리게 느껴지지 않게 한다.

### Scroll reveals (스크롤 공개)

뷰포트에 들어오는 섹션은 짧은 거리(Spacing-400, 32px)만큼 올라오면서 기본 곡선으로 600~800ms에 걸쳐 0에서 완전한 불투명도까지 페이드인한다. 각 섹션은 한 번만 공개하고, 위로 다시 스크롤해도 재생하지 않는다.

공개 트리거에는 `IntersectionObserver`나 Framer Motion의 `whileInView`를 쓴다. 제한 없는 `window.addEventListener('scroll')`에는 작업을 붙이지 않는다. 그 리스너는 매 프레임 실행되어 모바일 성능을 떨어뜨린다.

---

## B8. Content realism (콘텐츠 현실성)

모든 샘플 콘텐츠는 실제 사용자가 있는 실제 제품에서 가져온 것처럼 읽혀야 한다.

- **Write the copy (카피를 쓴다).** 의미 없는 라틴어 placeholder나 "Your headline here" 같은 문구를 쓰지 않는다. 제품의 목소리로 실제 문장을 쓴다.
- **People (사람).** 추천사와 팀원에게는 제품의 대상과 지역에 맞는 구체적인 전체 이름을 준다. 한 얼굴을 두 사람에게 재사용하지 않는다.
- **Brands and logos (브랜드와 로고).** 제품 업계에 어울리는 이름을 만든다. 물류 도구의 고객은 일반적인 테크 스타트업이 아니라 물류 회사처럼 들려야 한다.
- **Never invent facts (사실을 지어내지 않는다).** 실제 제품 페이지에서 가격, 보증, 통계, 고객 수, 추천사, 로고는 사용자나 실제 출처에서 와야 한다. 정보가 없으면 `{{price}}`나 `{{testimonial}}`처럼 명확히 표시된 placeholder를 쓴다. 만들어 내지 않는다.
- **Sample numbers (샘플 수치).** 허구의 데모와 프로토타입에서는(위에서 말한 허구의 이름과 브랜드는 괜찮다) 지나치게 둥근 숫자를 피한다. 가격은 실제 가격처럼 보여야 하고, 지표에는 소수점이나 끝자리가 홀수인 값을 넣으며, 목록의 날짜는 서로 달라야 한다.
- **Banned filler words (금지된 군더더기 단어).** "revolutionize", "supercharge", "cutting edge", "effortless", "transform your workflow", "take it to the next level", "harness the power", "world class"를 쓰지 않는다. 대신 제품이 무엇을 하는지 평이한 말로 쓴다.
- **Sentence case (문장형 대소문자)** 를 제목과 버튼에 쓴다.
- **System messages (시스템 메시지).** 확인 메시지는 차분하고 구체적으로 쓴다("Invoice sent to Dana"). 오류 메시지는 무엇이 실패했고 다음에 무엇을 해야 하는지 말한다("Upload failed. The file is over 20 MB."). 장난스러운 감탄이나 느낌표는 쓰지 않는다.

## B9. States (상태)

모든 인터랙티브 요소는 전체 상태 세트를 갖춰서 내보낸다.

- **Hover (호버)**: 배경 변화, 약간의 scale, 또는 translate
- **Active (활성)**: 물리적 피드백을 위해 `scale(0.98)` 또는 `translateY(1px)`
- **Focus (포커스)**: 보이는 포커스 링. 접근성 요구 사항이므로 선택 사항이 아니다.
- **Loading (로딩)**: 원형 스피너가 아니라 실제 레이아웃 모양을 닮은 스켈레톤 로더
- **Empty (빈 상태)**: 빈 패널이 아니라 잘 구성된 "시작하기" 화면
- **Error (오류)**: 인라인이고 구체적으로 표시한다. `window.alert()`는 절대 쓰지 않는다.

죽은 링크를 두지 않는다. `#`을 가리키는 버튼은 실제 링크를 달거나 시각적으로 비활성화한다. 현재 페이지는 내비게이션에서 표시한다.

## B10. Ship requirements (출시 요구 사항)

페이지를 미완성처럼 보이게 만드는, 자주 빠뜨리는 항목이다.

- 푸터에 개인정보 처리방침과 약관 링크
- 브랜드가 적용된 맞춤형 404 페이지
- 이메일 형식과 필수 필드에 대한 클라이언트 측 폼 검증
- 키보드 사용자를 위한 본문 바로가기 링크(skip to content)
- 관할 지역이 요구하는 경우 쿠키 동의
- 브랜드가 적용된 파비콘
- `<title>`, meta description, `og:image`, 소셜 공유 태그
- 의미 있는 모든 이미지에 대체 텍스트(alt)
- 시맨틱 HTML: `<nav>`, `<main>`, `<article>`, `<aside>`, `<section>`
- 모든 페이지에서 돌아갈 수 있는 경로
- 390px 너비에서의 점검: 가로 넘침이 없고, 버튼의 텍스트가 버튼 안에 머물며, 기본 행동이 첫 화면에서 보인다

## B11. Tagline reveal section (태그라인 공개 섹션, 필수)

모든 랜딩 페이지에는 히어로와 분리된, 핵심 혜택이나 태그라인을 큰 타이포그래피로 보여 주는 섹션이 하나 있어야 한다. 이 섹션은 페이지 아래쪽에 독립된 순간으로 배치한다. 히어로 바로 아래에 겹쳐 쌓지 않는다.

**Copy (카피)**
- 최소 두 줄의 텍스트.
- 일반적인 섹션 제목이 아니라 A5의 목소리로 쓴 혜택 진술이나 태그라인.

**Typography (타이포그래피)**
- 줄 수에 따라 B1 텍스트 스타일의 Heading 3에서 Heading 1까지 사용한다.
- 히어로와 같은 방식으로 최대 너비를 제한해서 B5에 따라 의미 있는 지점에서 줄이 나뉘게 한다.

**Animation (애니메이션)**
- 텍스트는 테마 기본 텍스트 색의 약 25~35% 불투명도인 은은하고 흐린 톤으로 시작한다.
- 섹션이 뷰포트에 들어오면 각 단어가 읽는 순서대로 그 흐린 톤에서 전체 텍스트 색으로 개별 전환된다.
- 블록 전체가 한꺼번에 뒤집히지 않고, 단어가 트리거 라인을 지날 때 하나씩 활성화된다. 전환은 선형 페이드가 아니라 B7의 기본 곡선을 쓴다.
- 단어마다 `IntersectionObserver`를 두거나, `requestAnimationFrame`으로 스로틀된 스크롤 리스너 하나로 구현한다. B7에 따라 제한 없는 `window.addEventListener('scroll')`은 쓰지 않는다.
- `prefers-reduced-motion`에서는 단어 단위 애니메이션 없이 최종 텍스트를 즉시 전체 색으로 보여 준다.

---

# Output format (출력 형식)

처음부터 랜딩 페이지를 만들 때는 코드를 작성하기 전에 다음 항목을 이 순서대로 제시한다.

1. **Page outline (페이지 개요)**: 섹션과 그 순서
2. **Hero copy (히어로 카피)**: 헤드라인, 서브헤드라인, CTA, 근거 한 줄
3. **Benefits (혜택)**: 결과 중심의 혜택 세 개에서 다섯 개
4. **How it works (작동 방식)**: 세 단계
5. **FAQ**: 여섯 개에서 열두 개의 질문과 답
6. **SEO / AEO**: index 또는 noindex 권장 사항과, 색인할 경우 title과 meta
7. **Layout recommendation (레이아웃 권장)**: A, B, C, D 중 하나와 그 이유

그다음 A6에 따라 섹션 단위로 만든다.

---

# Quick checklist (빠른 체크리스트)

**Strategy (전략)**
- [ ] 오퍼 하나, 대상 하나, 기본 행동 하나
- [ ] 첫 화면 위에 경쟁하는 CTA가 없음
- [ ] 모호한 동사 대신 구체적인 숫자 사용
- [ ] 위험 역전이 최소 하나 있음
- [ ] 근거가 뒷받침하는 주장 바로 옆에 있음
- [ ] 레이아웃 유형을 의도적으로 골랐음

**Visual (시각)**
- [ ] 승인된 서체 하나, 이탤릭 없음, 초굵은 두께 없음
- [ ] 카피에 하이픈 없음, 고립된 단어 없음
- [ ] 모든 글자 크기가 Tailwind 스케일 단계에 맞음
- [ ] 모든 텍스트 요소가 이름 붙은 텍스트 스타일(Heading, Title, Body, Button, Caption)을 사용함
- [ ] 모든 간격 값이 간격 표에서 나옴
- [ ] 중첩 반경이 공식을 따름
- [ ] 카드의 한쪽 면 테두리 없음, 배경 그라데이션 없음
- [ ] 히어로 제목과 부제목이 680px로 제한되고 의미 있는 위치에서 줄이 나뉨
- [ ] 아이콘은 Phosphor, Solar, Iconamoon 중에서 씀
- [ ] 모든 전환이 B7의 기본 곡선을 쓰고, 스크롤 공개는 IntersectionObserver를 씀
- [ ] 태그라인 공개 섹션이 있음, 최소 두 줄, 스크롤에 따라 단어가 하나씩 활성화됨
- [ ] 지어낸 가격, 수치, 추천사 없음. 정보가 없으면 표시된 placeholder 사용
- [ ] 390px에서 넘침 없이 확인함

**Content and ship (콘텐츠와 출시)**
- [ ] 실제 초안 카피, 그럴듯한 이름과 숫자, 금지된 군더더기 단어 없음
- [ ] hover, active, focus, loading, empty, error 상태가 모두 있음
- [ ] 죽은 링크 없음, 현재 내비게이션 항목 표시됨
- [ ] 404, 법적 링크, 폼 검증, 파비콘, meta 태그, alt 텍스트

---

## Credits (크레딧)

"지어낸 사실을 쓰지 않는다"는 규칙과 태그라인 공개 섹션의 reduced motion 지원은 [#1](https://github.com/elayadesign/ai-design-skills/pull/1)에서 [@allen-baler](https://github.com/allen-baler)가 제안했다.

이 스킬의 일부는 Leon Lin([@LexnLin](https://x.com/LexnLin))의 [taste-skill](https://github.com/Leonxlnx/taste-skill)(MIT 라이선스)을 바탕으로 했다. 그 저장소의 리디자인 감사 구조, 콘텐츠 현실성 점검, 모션과 내비게이션 아이디어가 여기의 해당 섹션에 반영되었으며, 이후 다시 작성되었다.

<details>
<summary>taste-skill 라이선스</summary>

```
MIT License

Copyright (c) 2026 Leonxlnx

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
</details>
