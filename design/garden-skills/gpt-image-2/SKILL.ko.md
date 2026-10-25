---
이름: gpt-이미지-2
설명: GPT 이미지 2용 이미지 생성/편집 기술입니다. 3가지 환경에서 사용할 수 있습니다: (A) OpenAI 호환 인터페이스를 통해 사진을 직접 출력하고 디스크에 배치하는 가든 로컬 모드; (B) 이 스킬을 프롬프트 단어 프로젝트 가이드로 사용하고 렌더링된 프롬프트를 호스트 에이전트의 자체 이미지 도구에 전달하여 그리기 위한 호스트-네이티브 모드. (C) 호스트에 이미지 도구가 없을 때 고품질 프롬프트 컨설턴트로 변질되는 Advisor 모드. 포스터/UI/제품/인포그래픽/학술 다이어그램/기술 아키텍처 다이어그램/만화/아바타/프로세스 보드/영화 스토리보드/IP 주변 장치/편집 워크플로 및 기타 시나리오와 같은 시나리오를 다루는 18개 주요 카테고리와 80개 이상의 구조화된 템플릿을 포함합니다.
---

# GPT 이미지 2

이는 GPT 이미지 2에 중점을 둔 스킬입니다. 세 가지 실행 환경 모두에서 사용할 수 있지만 동작이 크게 다릅니다. **첫 번째 단계는 현재 작동 모드를 결정하는 것입니다**.

두 가지 유형의 이미지 작업만 수행합니다.

- 사진 생성: `POST /images/generations`
- 사진 편집: `POST /images/edits`

이 파일에는 실행 모드, 기술 구조, 환경 변수, 저장/명명 규칙, 템플릿 색인, 모드 인식 워크플로가 포함됩니다. 모든 세부 템플릿은 계층적으로 구성되어 `references/`에 배치됩니다.

- 레벨 1: 카테고리 디렉토리
- 레벨 2: 단일 템플릿 Markdown 파일

## 실행 모드(필수 읽기, 작업 전 확인)

이 스킬은 가벼운 탐지 스크립트와 함께 제공됩니다. 먼저 한 번 실행한 후 결과에 따라 작업 방법을 결정합니다.```bash
node skills/gpt-image-2/scripts/check-mode.js
# 想拿结构化结果给上层程序用：
node skills/gpt-image-2/scripts/check-mode.js --json
```
출력은 `mode = A` / `A?` / `B-or-C` 및 `recommendation`를 제공합니다. 세 가지 모드는 다음과 같이 정의됩니다.

### 모드 A · 정원 현지 사진

**트리거 조건**: 환경 변수 `ENABLE_GARDEN_IMAGEGEN`가 true이고(`1` / `true` / `yes` / `on`) **그리고** `OPENAI_API_KEY`가 존재합니다.

**동작**: "템플릿 선택 → 프롬프트 작성 → 스크립트 호출 → 디스크에 이미지 게시"를 통해 엔드투엔드 실행을 완료합니다.

- `scripts/generate.js` 텍스트를 사용하여 그림을 생성하고 `scripts/edit.js`를 사용하여 기존 그림을 편집합니다.
- 프롬프트 기본값은 `garden-gpt-image-2/prompt/`이고 그림은 `garden-gpt-image-2/image/`입니다.
- 이것은 가장 강력한 모드입니다. 당신은 이미지 도구의 "보유자"입니다.

### 모드 B · Host-Native는 호스트에게 사진 제작을 맡깁니다.

**트리거 조건**: Garden이 활성화되지 않았지만(`ENABLE_GARDEN_IMAGEGEN`가 설정되지 않음/false) **현재 호스트 에이전트에는 자체 이미지 생성 도구 또는 이미지 MCP가 함께 제공됩니다**.

**일반적인 식별 신호**(직접 확인해야 함):

- `image_generation` / `imagegen` / `dalle` / `nano_banana` / `mcp__*image*` / `make_image` / 유사한 이름이 도구 세트에 나타납니다.
- 사용자는 ChatGPT / Codex / Gemini / Cursor 등 기본 렌더링을 지원하는 클라이언트에서 이 스킬을 호출합니다.
- 사용자가 "그림을 그리려면 자신만의 도구를 사용하세요"라고 명시적으로 말했습니다.

**행동**: 이 스킬은 **프롬프트 워드 엔지니어링 지침으로 저하됩니다**——

1. 여전히 "템플릿 선택 → 필드 채우기 → 최종 프롬프트 렌더링" 프로세스를 따릅니다.
2. **`node scripts/generate.js`를 호출하지 마세요**(API 키가 없으면 실패합니다).
3. 호스트가 제공하는 이미지 도구를 직접 호출하고 렌더링된 프롬프트를 입력으로 사용합니다.
4. 사용자가 원하는 경우 프롬프트 파일을 `garden-gpt-image-2/prompt/`에 쉽게 저장할 수 있지만 사진의 대상은 호스트에 의해 결정되며 필수는 아닙니다.

### 모드 C · Advisor 순수 프롬프트 워드 Advisor

**트리거 조건**: Garden이 활성화되지 않고 **그리고** 호스트 에이전트에 이미지 생성 도구가 없습니다.

**행동**: 이 스킬은 "고품질 프롬프트 작문 컨설턴트"로 저하됩니다.

1. "템플릿 선택 → 필드 채우기 → 최종 프롬프트 렌더링" 과정을 따르세요. 누락된 정보가 있는 경우 사용자에게 문의하세요.
2. 최종 프롬프트를 **사용자에게 직접** 인쇄하고 사본을 `garden-gpt-image-2/prompt/<task-slug>-<timestamp>.md`에 저장합니다.
3. 간단한 "사용 방법" 제안을 첨부합니다(예: ChatGPT/Midjourney/DALL·E/Sora/Nano Banana/자체 백엔드/타사 GPT Image 2 게이트웨이 포함).
4. **성공한 척하지 마세요**. 사용자에게 다음과 같이 명확하게 알립니다. "직접 재사용할 수 있는 고품질 프롬프트가 생성되었습니다. 이미지 도구를 사용하여 실행하세요."

### 패턴 결정 테이블

| 조건 | 패턴 | 호출 스크립트? | 배치 프롬프트? | 배치 사진? |
|---|---|---|---|---|
| `ENABLE_GARDEN_IMAGEGEN=1` + 키 포함 | **아** | ✅ `generate.js` / `edit.js` | ✅ 자동 | ✅ 자동 |
| `ENABLE_GARDEN_IMAGEGEN=1`이지만 키가 없습니다 | 에이? | ❌(먼저 KEY 필요) | — | — |
| 활성화되지 않음 + 호스트에 이미지 도구가 있음 | **ㄴ** | ❌ (호스트 도구 사용) | 선택사항 | 호스트에 의해 결정됨 |
| 활성화되지 않음 + 이미지 도구를 호스트하지 않음 | **씨** | ❌ | ✅ 필수 | ❌ (불가) |

### 모드가 확실하지 않은 경우

- 자신이 B인지 C인지 알 수 없다면 **사용자에게 직접 물어보세요**: "그림을 그릴 때 환경에 있는 이미지 도구를 사용해야 할까요, 아니면 그냥 프롬프트 단어를 써야 할까요?"
- 모드 A가 스크립트 조정 실패(401/Network/Quota) → 오류 보고 후 "B/C로 전환하시겠습니까?"

## 사용자 입력 도구

이 기술이 사용자에게 질문을 해야 하는 경우 다음 규칙을 따르십시오.

1. 현재 런타임에서 제공하는 사용자 입력 도구의 사용을 우선시합니다.
2. 해당 도구가 없으면 번호가 매겨진 간단한 일반 텍스트 질문을 하세요.
3. 한 번에 합쳐질 수 있는 질문을 모두 물어보세요.

## 스킬 구조

- `scripts/check-mode.js`: **먼저 실행**하여 실행 모드(A/B/C)를 감지합니다.
- `scripts/generate.js`: 텍스트가 이미지를 생성합니다(모드 A에서만 사용됨)
- `scripts/edit.js`: 원본 이미지/마스크를 기반으로 이미지 수정(모드 A에서만 사용)
- `scripts/shared.js` : 공유요청, 저장, 환경변수 읽기 로직
- `references/`: 계층 구조의 프롬프트 단어 템플릿(A/B/C 세 가지 모드 모두에서 사용됨)

## 환경 변수

다음 순서로 구성을 읽으십시오.

1. CLI 매개변수
2.`process.env`
3. `<cwd>/.env`
4.`<cwd>/.gateway.env`
5. `~/.gateway.env`

핵심 변수:

- `ENABLE_GARDEN_IMAGEGEN` — **모드 스위치**. `1` / `true` / `yes` / `on`인 경우 모드 A를 활성화합니다. 설정되지 않았거나 다른 값이 있는 경우 모드 B/C로 들어갑니다.
- `OPENAI_API_KEY` — 모드 A가 필요합니다. B/C는 필요하지 않습니다.
- `OPENAI_BASE_URL` — 기본값은 `https://api.openai.com/v1`이며 타사 호환 게이트웨이를 가리킬 수 있습니다.
- `OPENAI_IMAGE_MODEL` — 기본값은 `gpt-image-2`이며 게이트웨이에서 지원하는 모델(예: `gpt-image-1` / `dall-e-3`)로 변경할 수 있습니다.

기본 구현은 OpenAI 호환 인터페이스에 따라 작동하며 타사 게이트웨이를 하드코딩하지 않습니다.

##기본 출력 디렉터리

사용자가 출력 경로를 명시적으로 지정하지 않으면 현재 작업 공간 아래의 경로가 일관되게 사용됩니다.

- 프롬프트 워드 디렉터리: `garden-gpt-image-2/prompt/` (**재사용 및 버전 관리를 용이하게 하기 위해 A/B/C 3가지 모드에서 ** 사용을 권장합니다)
- 사진 디렉토리: `garden-gpt-image-2/image/`(**모드 A에서만 사용됨**, 모드 B는 호스트에 의해 결정되고, 모드 C는 사진을 생성하지 않음)

디렉토리가 존재하지 않으면 스크립트(모드 A)가 디렉토리를 자동으로 생성해야 합니다. 프롬프트를 작성하기 전에 모드 B/C를 수동으로 `mkdir -p`로 설정하세요.

##기본 명명 규칙

사용자가 파일 이름을 명시적으로 지정하지 않으면 스크립트는 현재 작업과 관련된 파일 이름을 자동으로 생성하고 현재 타임스탬프를 추가하여 이름이 중복되지 않도록 해야 합니다.

명명 규칙:

- 프롬프트 단어: `garden-gpt-image-2/prompt/<task-slug>-<timestamp>.md`
- 사진 : `garden-gpt-image-2/image/<task-slug>-<timestamp>.png`

그 중에는:

- `<task-slug>`: 현재 사용자 요구 사항에 따라 관련 짧은 이름을 자동으로 추출합니다.
- `<timestamp>`: 현재 타임스탬프(예: `20260424-153045`)

예:

-`garden-gpt-image-2/prompt/live-commerce-ui-20260424-153045.md`
-`garden-gpt-image-2/image/live-commerce-ui-20260424-153045.png`
-`garden-gpt-image-2/prompt/vr-headset-exploded-view-20260424-153102.md`
-`garden-gpt-image-2/image/vr-headset-exploded-view-20260424-153102.png`

## 프롬프트 저장 규칙

| 모드 | 프롬프트를 저장해야 하는지 여부 | 설명 |
|---|---|---|
| 모드 A | ✅ 필수 | 실제 생성/편집 프로세스에 들어가기 전에 디스크를 배치해야 합니다 |
| 모드 B | 추천 | 기본 권장 사항은 쉽게 재사용할 수 있도록 저장하는 것입니다. 사용자는 "필요 없음"이라고 말하면 건너뜁니다. |
| 모드 C | ✅ 필수 | 사용자는 프롬프트를 없애고 직접 실행합니다. 그렇지 않으면 노력이 낭비됩니다 |

일반 규칙(세 가지 모드에 적용 가능):

1. 사용자가 프롬프트에 파일 경로를 명시적으로 제공하면 파일을 직접 입력으로 사용할 수 있습니다.
2. 사용자가 직접 텍스트 프롬프트를 제공하는 경우 먼저 최종 프롬프트를 `garden-gpt-image-2/prompt/`에 저장해야 합니다.
3. 사용자가 `--prompt-output`를 명시적으로 지정하는 경우 사용자가 지정한 경로가 적용됩니다.
4. 그렇지 않으면 기본 명명 규칙을 사용하여 자동으로 저장합니다.

## 이미지 저장 규칙(모드 A에만 해당)

1. 사용자가 `--image` 또는 `--output`를 명시적으로 지정하는 경우 사용자가 지정한 경로가 적용됩니다.
2. 그렇지 않으면 기본적으로 `garden-gpt-image-2/image/`에 저장됩니다.
3. 파일 이름은 의미상 현재 작업과 관련이 있어야 하며 타임스탬프가 첨부되어 있어야 합니다.

모드 B는 호스트 이미지 도구에 의한 저장 방법을 결정합니다. 모드 C는 이미지를 생성하지 않습니다.

## 빠른 사용법

### 0. 실행 모드 감지 (**모든 작업의 첫 번째 단계**)```bash
node skills/gpt-image-2/scripts/check-mode.js
```
출력은 현재 모드가 모드 A/B/C임을 알려주며 이후에 `generate.js`/`edit.js`를 호출할지 여부를 결정합니다. 아래 1~4는 **Mode A**에서만 사용됩니다.

### 1. 텍스트를 이미지로 변환(모드 A)```bash
node skills/gpt-image-2/scripts/generate.js \
  --prompt "A cute baby sea otter" \
  --size 1024x1024 \
  --quality high
```
### 2. 프롬프트 단어 파일을 사용하여 그림을 생성합니다(모드 A)```bash
node skills/gpt-image-2/scripts/generate.js \
  --promptfile garden-gpt-image-2/prompt/poster-20260424-153045.md
```
### 3. 기존 사진 편집(모드 A)```bash
node skills/gpt-image-2/scripts/edit.js \
  --image assets/source.png \
  --prompt "Replace the background with a clean studio scene"
```
### 4. 마스크를 이용한 부분 편집(모드 A)```bash
node skills/gpt-image-2/scripts/edit.js \
  --image assets/source.png \
  --mask assets/mask.png \
  --prompt "Replace only the masked area with a glass vase"
```
### 5. 모드 B/C의 "용도"

명령줄 항목이 없습니다. 현재 이 스킬은 **프롬프트 워드 엔지니어링 가이드**일 뿐입니다.

- **모드 B**: 최종 프롬프트 렌더링 → 호스트와 함께 제공되는 `image_generation` 도구 호출(매개변수에 프롬프트 전달) → 그림 가져오기.
- **모드 C**: 최종 프롬프트 렌더링 → `garden-gpt-image-2/prompt/<task-slug>-<timestamp>.md`에 저장 → 사용자에게 직접 콘텐츠 표시 → 직접 재사용할 수 있는 이미지 도구를 사용자에게 묻습니다.

## JSON 템플릿 작동 방식

`references/`에서 JSON 템플릿이 제공되는 경우 다음 규칙에 따라 사용하세요.

1. 먼저 `SKILL.md`에서 가장 가까운 카테고리 디렉토리를 찾으세요.
2. 그런 다음 특정 템플릿 파일을 찾습니다.
3. 템플릿의 `{argument ...}`는 교체 가능한 매개변수를 나타냅니다.
4. 사용자가 명시적으로 제공한 값이 직접 입력됩니다.
5. 사용자가 제공하지 않았지만 템플릿에 `default`가 표시된 경우 기본값을 기본적으로 사용할 수 있습니다.
6. 누락된 정보가 결과에 큰 영향을 미칠 경우 사용자에게 적극적으로 질문합니다.
7. 사용자는 "무작위로 생성합니다"라고 명시적으로 말할 수도 있습니다. 이 경우 기본값은 템플릿에서 허용하는 범위 내에서 유지되거나 합리적으로 무작위화될 수 있습니다.

## 쿼리 규칙

“어떤 스타일을 원하세요?”라고 포괄적으로 묻지 마세요. 템플릿에 주요 변수가 누락된 경우. 질문은 템플릿 필드를 기반으로 정확하게 질문해야 합니다.

예를 들어 라이브 방송 UI 템플릿에 본체가 없는 경우 먼저 다음 사항을 질문해야 합니다.

-앵커는 누구인가?
- 실제 사진, 연예인 이름, 캐릭터 설명을 사용합니까, 아니면 완전히 무작위로 생성됩니까?

제품 정보가 누락된 경우 다음 사항에 대해 문의해야 합니다.

- 제품명이 무엇인가요?
- 상품 가격이 명시되어 있나요?
- 댓글과 선물을 자동 완성하시겠습니까?

## 템플릿 인덱스

작업 유형에 따라 가장 가까운 특정 템플릿 파일만 읽고, 전체 `references/`를 한 번에 읽지 마십시오.

### 1. 방법론 일반 문서

먼저 읽어보세요:

-`references/prompt-writing.md`

적용 대상:

- 아직 JSON 템플릿을 구성하는 방법을 결정하지 않았습니다.
- 어떤 필드를 물어봐야 하는지, 어떤 필드를 기본값으로 설정할 수 있는지, 어떤 필드를 무작위로 지정할 수 있는지 결정해야 합니다.
- 사례를 재사용 가능한 템플릿으로 추상화해야 합니다.

### 2. UI 모형(`references/ui-mockups/`)

다양한 "인터페이스+콘텐츠"에 적합한 목업비주얼입니다. 현재 구현된 사항은 다음과 같습니다.

- `live-commerce-ui.md` — 전자상거래 라이브 스트리밍 스크린샷 프로토타입(앵커 + 채팅 영역 + 선물 영역 + 제품 카드)
- `social-interface-mockup.md` — 소셜 플랫폼 동적 세부 정보 페이지 프로토타입(Twitter/X, Xiaohongshu, Weibo, Threads 등)
- `product-card-overlay.md` — 랜딩페이지 히어로 / 상세페이지 메인 이미지 (캐릭터 + 상품 + 셀링 포인트 + 가격)
- `chat-interface-scene.md` — 채팅/대화 인터페이스 프로토타입(iMessage, WeChat, 그룹 채팅, AI 도우미)
- `short-video-cover-ui.md` — 짧은 커버 영상/생방송 썸네일(YouTube, Douyin, Bilibili, VTuber 스트림)
- `landing-page-case-study.md` — 다크 SaaS/마케팅 사례 연구 **긴 페이지** UI 모형(여러 섹션 +스크롤 내러티브 + 데이터 카드 + CTA)

### 3. 제품 비주얼(`references/product-visuals/`)

"시각적 중심이 되는 제품"이 있는 사진에 적합합니다. 현재 구현된 사항은 다음과 같습니다.

- `exploded-view-poster.md` — 제품 분해도 포스터(본체 수직 적층 + 설명선 + 상단 로고 + 하단 브랜드 영역)
- `white-background-product.md` — 전자상거래 순백색 배경 메인 이미지 (단일 제품 / 멀티 앵글 / 미니멀 마케팅 오버레이)
- `premium-studio-product.md` — 하이엔드 스튜디오 상업용 제품 사진 (잡지 광고 수준의 분위기)
- `packaging-showcase.md` — 선물 상자/포장 디스플레이(외부 상자 + 내용물 디스플레이)
- `lifestyle-product-scene.md` — 라이프스타일 제품 현장 지도(제품이 실제 장면에 등장)
- `ecommerce-marketing-board.md` — 중국 전자상거래 초복합 판매 간판(메인 사진 + 상세 페이지 + 셀링 포인트 + 사용 단계 + 장면 + TVC 스토리보드 조합 사진)

### 4. 지도(`references/maps/`)

"지도와 같은 시각적 요소"에 적합합니다(인포그래픽은 독립적인 카테고리 17로 추출되었습니다). 현재 구현된 사항은 다음과 같습니다.

- `food-map.md` — 손으로 그린 도시 음식 지도(번호 포인트 + 범례 + 중앙 마스코트)
- `travel-route-map.md` — 여행 경로 지도(여러 날 일정/1일 도시 산책/야외 경로)
- `illustrated-city-map.md` — 도시 풍경 일러스트 지도(랜드마크 + 국가 + 문화 요소)
- `store-distribution-map.md` — 브랜드 매장/서비스 커버리지 분포도
- `itinerary-day-trip-map.md` — **1일 투어** 분할 포스터(왼쪽 양피지 여행 일정 카드 + 오른쪽 판타지 사실적 지도, 5-7개 사이트가 엄격하게 정렬됨)

### 5. 슬라이드 및 시각적 문서(`references/slides-and-visual-docs/`)

"한 페이지에 한 가지를 명확하게 전달"하는 데 적합한 시각적 문서입니다. 현재 구현된 사항은 다음과 같습니다.

- `dense-explainer-slides.md` — 이라스토야 × 가스미가세키 혼합 고밀도 설명 슬라이드
- `policy-style-slide.md` — 정책/정부 발표/백서 스타일 설명 슬라이드
- `visual-report-page.md` — 사업 보고서 요약/투자자 프레젠테이션/연간 보고서 개요 페이지
- `educational-diagram-slide.md` — 티칭 다이어그램(개념/메커니즘/프로세스 분해)

### 6. 포스터 및 캠페인(`references/poster-and-campaigns/`)

"브랜드 키비주얼+캠페인+배너+잡지표지"에 적합합니다. 현재 구현된 사항은 다음과 같습니다.

- `brand-poster.md` — 브랜드 메인 포스터(제품/캐릭터/순수 텍스트 제안)
- `campaign-kv.md` — 캠페인 키 비주얼 + 파생 레이아웃 시스템
- `banner-hero.md` — 웹 히어로/랜딩 페이지/앱 배너(가로 구성 + CTA)
- `editorial-cover.md` — 잡지/저널/출판물 표지
-`biomimetic-concept-poster.md`— 바이오닉 산업 디자인 컨셉 포스터(내추럴 프로토타입 → 에볼루션 바 → 히어로 렌더 → 멀티뷰 기술 다이어그램)
- `vintage-editorial-infographic.md` — 빈티지 아카이브 / 1940년대 편집 인포그래픽 포스터(캐릭터 + 공식 + 타임라인 + 모델, Bell Labs 스타일)
- `character-catalog-poster.md` — 동일한 캐릭터 인포그래픽 포스터의 여러 버전(황도대/원소/왕조/성격 시리즈 카드)
- `lineup-comparison-poster.md` — 시리즈 제품 라인업 비교 인포그래픽 포스터(30+ SKU 동일 사진 + 범례 + 레벨 키)

### 7. 인물 사진 및 캐릭터 (`references/portraits-and-characters/`)

"캐릭터 비전"에 적합합니다. 현재 구현된 사항은 다음과 같습니다.

- `professional-portrait.md` — 전문가 수준의 비즈니스 초상화(LinkedIn / 팀 페이지 / 미디어 사진)
- `founder-portrait.md` — 창립자의 미디어 블록버스터 초상화(극적인 조명 + 타이틀 공간)
- `virtual-host.md` — VTuber / 가상 앵커 개인 카드 + 라이브 방송 미리보기
- `character-sheet.md` — 종합적인 캐릭터 디자인 초안(3개 뷰 + 표정 + 의상 + 색상 팔레트)
- `pose-reference-sheet.md` — N×N 포즈/동작 사전 참조 테이블 (동일 캐릭터의 여러 포즈, 댄스/전투/피트니스)

### 8. 장면 및 일러스트레이션(`references/scenes-and-illustrations/`)

"분위기+스토리+감성"에 어울리는 일러스트 비주얼입니다. 현재 구현된 사항은 다음과 같습니다.

- `healing-scene.md` — 힐링 일일/계절 장면 일러스트
- `concept-scene.md` — 영화 같은 컨셉 장면 / IP 키 아트
- `picture-book-scene.md` — 동화책/그림책 페이지/명절 카드
- `minimalist-mood-scene.md` — 미니멀한 공백 분위기 사진 / 문학 배경화면

### 9. 작업 흐름 편집(`references/editing-workflows/`)

"기존 이미지를 기반으로 편집"(`scripts/edit.js`에 해당)의 이미지 수정 작업에 적합합니다. 현재 구현된 사항은 다음과 같습니다.

- `background-replacement.md` — 배경 교체(제품/인물/야외/창고 장면)
- `local-object-replacement.md` — 부분 개체 교체(마스크 포함 또는 제외)
- `object-removal.md` — 혼란/통행/전선/결함 제거
- `product-retouching.md` — 제품 개선(광택/라벨/그림자/결함)
- `portrait-local-edit.md` — 인물 일부 수정(헤어스타일/의상/메이크업/액세서리)

### 10. 아바타 및 프로필 (`references/avatars-and-profile/`)

"스타일화된 아바타/페르소나/그리드/스티커/시리즈 초상화"와 같은 "개인 이미지" 비주얼에 적합합니다. 현재 구현된 사항은 다음과 같습니다.

- `style-transfer-selfie.md` — 참조 캐릭터를 코스프레/고스/복고풍 영화/아이돌 사진 등 어떤 스타일로든 변환합니다.
- `character-grid-portrait.md` — 동일한 글자 n×n 격자 초상화(다양한 직업/다양한 표현/다양한 왕조/다양한 스타일)
- `themed-3d-icon.md` — Kawaii 3D / Minecraft / Skeuomorphic 3D 애플리케이션 아이콘 아바타
- `sticker-set.md` — 스티커 세트/이모티콘 패키지 컬렉션(독립 요소 + 획 + 라벨)
- `cultural-portrait-series.md` — 왕조/신화/문학/민족 초상화 시리즈

### 11. 스토리보드 및 시퀀스(`references/storyboards-and-sequences/`)

"다중 스토리보드/만화/관계 다이어그램/프로세스 단계"와 같은 "서사적 시퀀스" 비주얼에 적합합니다. 현재 구현된 사항은 다음과 같습니다.

- `four-panel-comic.md` — 4프레임 만화/풍자 만화/농담 만화(시작, 변경 및 결합 + 대화 풍선)
- `manga-spread-page.md` — 단일 페이지/이중 페이지 만화 스토리보드(불규칙한 격자 + 대화 + 음성)
- `anime-key-visual.md` — 단일 그림 애니메이션 KV / 라이트 노벨 표지 / IP 포스터
- `character-relationship-diagram.md` — 역할 관계 다이어그램 포스터(카드 + 관계 연결 + 범례)
- `recipe-process-flowchart.md` — 레시피/튜토리얼/프로세스 차트(번호 + 일러스트레이션 + 지침)
- `product-tvc-storyboard.md` — 제품 TVC 상업 광고 스토리보드(9패널 실제 샷 텍스처 + 샷 설명 + 지속 시간)
- `cinematic-storyboard-grid.md` — **영화적 내러티브 스토리보드** 밀착 시트(3×4 / 4×4, 연속 내러티브 + 영화적 스틸)
- `process-photo-board.md` — 라이브 시네마틱 프로세스 보드(장비 착용/메이크업/트레이닝/작동 분해, 넘버링 + 단계 진행)

### 12. 그리드 및 콜라주(`references/grids-and-collages/`)

"다중 패널 그리드/콜라주/프로젝트 보드" 유형의 비전에 적합합니다. 현재 구현된 사항은 다음과 같습니다.

- `banner-grid-2x2.md` — 2×2 마케팅 배너 세트(한 번에 4개의 통합 시리즈 디자인)
- `lookbook-grid.md` — 7일 룩북 / 9집 셀프케어 / TOP N 리스트
- `mixed-style-multi-panel.md` — 다중 스타일 혼합 콜라주(동일한 주제에 대한 다양한 그림 스타일 해석)
- `anime-pitch-board.md` — 애니메이션/게임/영화 및 TV 프로젝트 피치 보드(KV + 캐릭터 + 세계관 + 카피라이팅)
- `ad-banner-multi-grid.md` — 다중 산업/다중 테마 하이브리드 광고 배너 그리드(각 그리드에는 독립적인 산업 + 스타일 + 카피라이팅이 있음)

### 13. 브랜딩 및 포장(`references/branding-and-packaging/`)

"브랜드 아이덴티티 시스템/마스코트/패키지 디자인" 비주얼 카테고리에 적합합니다. 현재 구현된 사항은 다음과 같습니다.

- `brand-identity-board.md` — 브랜드 식별 시스템 보드(로고 + 색상 + 글꼴 + 애플리케이션 모형)
- `mascot-brand-kit.md` — 마스코트 다중 패널브랜드 아이덴티티 패키지(메인 이미지 + 3개 뷰 + 이모티콘 + 애플리케이션)
- `cosmetic-packaging.md` — 화장품/스킨 케어 제품 단일 병/시리즈/선물 상자 포장
- `beverage-label-design.md` — 음료/식품/조미료 라벨 디자인 (국가적 트렌드/일본식/서양식)
- `full-mascot-brand-doc.md` — **18+ 모듈 대규모 브랜드 식별 + 마스코트 전 과정 문서화** (DNA/무드보드/스케치/라인 드래프트/3D/컬러 매칭/소재/응용 사진 개요)
- `character-merch-board.md` — IP 캐릭터 + 주변기기/패키지/포스터/소셜 프로필 다요소 종합 브랜드 보드

### 14. 타이포그래피 및 텍스트 레이아웃 (`references/typography-and-text-layout/`)

"텍스트 우선/이중 언어 레이아웃" 및 기타 "텍스트 기반 시각적" 유형에 적합합니다. 현재 구현된 사항은 다음과 같습니다.

- `title-safe-poster.md` — 대형 문자 옹호 포스터(일본식 하이 에너지/스위스 미니멀리스트/복고풍 프린팅)
- `bilingual-layout-visual.md` — 중국어-영어/중국어-일본어 이중 언어 레이아웃 비주얼(문화/학술/다문화 브랜딩)

### 15. 자산 및 소품(`references/assets-and-props/`)

"아이콘 세트/게임 스크린샷" 및 기타 "재료/게임 자산 세트" 비주얼에 적합합니다. 현재 구현된 사항은 다음과 같습니다.

- `retro-skeuomorphic-icons.md` — 스큐어모픽 / Y2K / 픽셀 아이콘 세트(통합 스타일 전체 세트)
- `game-screenshot-mockup.md` — 게임 내 스크린샷 모형(HUD + 자막 + 작업 패널)

### 16. 학술 수치 (`references/academic-figures/`)

"논문/학회 제출/학술 포스터/방어 PPT/논문 방어/저널 제출 그래픽 초록"에 적합한 일러스트레이션입니다. 전체 흰색 배경 + 출판 글꼴 + 기하학적 정확성 + 저채도 엔지니어링 색상(주로 진한 파란색/회색 파란색/검정 회색, 3개 이하의 주요 색상) + 단일 색상으로 인쇄할 수 있습니다. **위조된 정량적 데이터는 엄격히 금지됩니다**(숫자 값/윤곽선/색상 범위/공식).

CS/CV/ML 방향:

- `method-pipeline-overview.md` — 방법 개요 다이어그램/파이프라인 그림(다중 단계 블록 + 데이터 흐름, 변형 4는 엔지니어링 왼쪽/중간/오른쪽 3단계 기술 로드맵 제공)
- `neural-network-architecture.md` — 신경망 아키텍처 다이어그램(레이어 블록 + 텐서 모양 + 점프 연결)
- `qualitative-comparison-grid.md` — 다중 방법 정성적 비교 그리드(**행 = 샘플, 열 = 방법**)

공학/자연 과학/국방 일반:

- `scientific-schematic.md` — 실험 장치의 개념/원리/개략도(높은 자유도, 자연어 템플릿)
- `mechanism-diagram.md` — 메커니즘 다이어그램/인과 연결/변환 경로(중앙 개체 + 다단계 변환 + 결과 영역, 3단계 인과 체인/순환적 자체 프라이밍/다분기 경쟁의 세 가지 변형 포함)
-`multi-condition-comparison.md` — **다중 작업 조건/다중 조건 결과 비교 차트** (다른 조건에서 동일한 개체의 병렬 결과, 2×2 / 1×N / M×N, 패널 간의 엄격한 균일성 강조)
- `publication-chart.md` — 게시 준비가 완료된 데이터 차트(막대/선/분산형/히트맵/상자)

개요/초록/방어 홈 페이지:

- `graphical-abstract.md` — 저널 제출 그래픽 초록 / 그래픽 초록 (가로 4세그먼트 / 중앙 확장 / 정사각형 / 세로 버전의 4가지 변형)
- `research-overview-poster.md` — 제안/방어/보고서 홈페이지 연구 개요 사진(상단, 중간, 하단 3개 레이어 + 5개 모듈, 중앙 스포크 3개 변형 포함/왼쪽 및 오른쪽 이중 기둥/미니멀리스트)

> 선택 전략: CS/CV/ML 논문에는 `method-pipeline-overview` + `qualitative-comparison-grid`가 선호됩니다. `method-pipeline-overview` 변형 4 + `mechanism-diagram` + `multi-condition-comparison`는 엔지니어링/에너지/화학/재료 방향에 선호됩니다. `graphical-abstract`는 저널 제출의 초록과 그림에 사용됩니다. `graphical-abstract`는 국방 PPT 홈페이지 `research-overview-poster`에 사용됩니다.

### 17. 인포그래픽(`references/infographics/`)

"인포그래픽/고밀도 과학 대중화/손으로 그린 인포그래픽/KPI 대시보드" 등 "정보 시각화 그림"에 적합합니다. 현재 구현된 사항은 다음과 같습니다.

- `legend-heavy-infographic.md` — 높은 전설 밀도 대중 과학/인과 사슬/진화/해부학(이중 언어)
- `hand-drawn-infographic.md` — **손으로 그린 스타일** 인포그래픽(마카롱/모란디/칠판/크래프트지, 자연어 템플릿)
- `bento-grid-infographic.md` — 도시락 모듈형 인포그래픽(고밀도 다중 모듈 위젯 배열)
- `comparison-infographic.md` — 이진/다변량 비교 인포그래픽(A vs B/패키지 수준/오해 vs 정답)
- `step-by-step-infographic.md` — 단계별 튜토리얼 인포그래픽(그림, 따뜻함, 비엔지니어링 흐름도)
- `kpi-dashboard-infographic.md` — KPI 대시보드 인포그래픽(연도 리뷰/랩핑/비즈니스 대시보드)

### 18. 기술 다이어그램(`references/technical-diagrams/`)

"시스템 아키텍처/프로세스/타이밍/상태 머신/ER/마인드 맵/네트워크 토폴로지"와 같은 엔지니어링 도식 다이어그램에 적합합니다. 통합된 어두운 격자 배경 + 고정 폭 글꼴 + 문자 인코딩 색상 일치, 각 템플릿에는 밝은 변형이 제공됩니다.

⚠️ 참고: 이 디렉토리는 **PNG 비트맵**을 생성하며 **편집할 수 없는 SVG**를 생성합니다. 편집이 필요하신 경우에는 mermaid / draw.io / excalidraw / Figma 를 대신 이용해 주시기 바랍니다. 현재 구현된 사항은 다음과 같습니다.

- `system-architecture.md` — 시스템 아키텍처 다이어그램(프론트엔드 + 백엔드 + DB +캐시 + 큐 + 외부)
- `flowchart-decision.md` — 흐름도/결정 다이어그램(BPMN 모양 의미론 + 예/아니요 분기)
- `sequence-diagram.md` — 시퀀스 다이어그램(액터 + 수명선 + 메시지 화살표 + 활성화 표시줄)
- `state-machine.md` — 상태 머신/라이프 사이클 다이어그램(상태 + 전환 + 가드/작업)
- `er-diagram.md` — ER 다이어그램/데이터 모델 다이어그램(엔티티 + 필드 + PK/FK + 까마귀 발 관계)
- `mind-map-tech.md` — 기술 테마 마인드 맵(가운데 + 방사형 가지)
- `network-topology.md` — 네트워크 토폴로지(장치 문양 + 영역 / VPC + 대역폭 / 프로토콜 레이블)

## 프롬프트 워드 워크플로(패턴 인식)

A / B / C에 상관없이 처음 6단계는 동일합니다. 차이점은 7~8단계에서 "그림을 그리는" 방법에만 있습니다.

1. **`check-mode.js`를 실행하여 모드**(A/B/C)를 결정합니다.
2. 작업이 그림을 만드는 것인지 아니면 수정하는 것인지 결정합니다.
3. 어떤 카테고리에 속하는지 확인하세요(아래 "템플릿 색인" 참조).
4. 해당하는 특정 템플릿 파일만 읽으세요. **전체 참고자료를 한꺼번에 읽지 마세요/**.
5. 템플릿 형식을 엄격히 따르세요. 대부분의 템플릿은 JSON 기본 템플릿(구조화된 작업에 선호)을 사용하고 일부 템플릿(`infographics/hand-drawn-infographic.md`, `academic-figures/scientific-schematic.md` 등)은 "구조화된 자연어 + 매개변수" 하이브리드 형식을 사용합니다. JSON을 강제하면 창작의 자유가 제한되기 때문입니다.
6. 사용자 입력을 템플릿 매개변수에 매핑합니다. 주요 정보가 불충분할 경우 사전에 목표 명확화 질문을 시작합니다.

이 시점에서 프롬프트가 렌더링되었습니다. 다음은 모드별로 분기됩니다.

7-A. **모드 A**: 최종 프롬프트를 `garden-gpt-image-2/prompt/`에 저장하고 `scripts/generate.js` 또는 `scripts/edit.js`를 호출하면 그림이 `garden-gpt-image-2/image/`로 이동합니다.
7-B. **모드 B**: 최종 프롬프트를 호스트의 이미지 도구 호출에 직접 전달합니다. 필요에 따라 프롬프트 사본을 `garden-gpt-image-2/prompt/`에 저장하십시오.
7-C. **모드 C**: 최종 프롬프트를 `garden-gpt-image-2/prompt/<task-slug>-<timestamp>.md`에 저장하고 간단한 "도구 사용/권장 방법" 제안과 함께 대화에서 사용자에게 전체 프롬프트를 표시합니다.

8. 작업이 완료된 후 사용자에게 현재 모드가 무엇인지, 메시지가 어디에 있는지, 사진(있는 경우)이 어디에 있는지를 한 문장으로 알려줍니다.

## 중요한 제약사항

일반사항:

- 템플릿 파일의 JSON은 API 요청 본문 템플릿이 아닌 **프롬프트 단어 구조 템플릿**입니다.
- 세 가지 모드에서 최종적으로 이미지 모델에 전달되는 것은 "렌더링된 프롬프트 문자열"입니다. 이는 평면화된 JSON 또는 구조화된 자연어 단락일 수 있으며 템플릿에서 그대로 사용할 수 있습니다.
- 사용자가 명시적으로 요청하지 않는 한 **SKILL.md의 "모드 설명"을 최종 프롬프트에 복사하지 마세요**——에이전트의 메타정보입니다.

모드 A에만 적용됩니다.

- JSON 본문을 사용하여 스크립트 생성
- 다중 부분 양식 데이터를 사용하여 스크립트 편집
- 응답은 먼저 `data[0].b64_json`에 따라 구문 분석되며 `data[0].url`와도 호환됩니다.
- 업스트림 인터페이스에서 명시적으로 요구하지 않는 한 추가 특수 쿼리 매개변수는 도입되지 않습니다.

## 질문할 때

이 정보가 누락되어 결과에 큰 영향을 미칠 경우에만 문의하세요.

- 프롬프트 대상 없음
- 이미지 변경시 원본이미지가 없습니다.
- 대상의 정체성이나 시각적 유형에 따라 결과가 결정됩니다.
- 상품/가격/카피라이팅/UI 텍스트가 화면의 핵심 구성 요소입니다.
- 사용자가 동시에 여러 가지 상충되는 목표를 표현합니다.

그렇지 않은 경우 합리적인 불이행 및 진행을 우선시하십시오.