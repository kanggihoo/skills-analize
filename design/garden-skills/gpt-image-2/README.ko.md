# GPT Image 2 스킬

**GPT Image 2 전용 이미지 생성 / 편집 스킬입니다. 하나의 SKILL 정의가 세 가지 실행 환경에 자동으로 적응합니다 — 로컬 직접 생성, 호스트 기본 이미지 도구, 프롬프트 전용 어드바이저.**

[영어](./README.md) · [컬렉션 홈으로 돌아가기](../../README.zh-CN.md)

![GPT Image 2 Skill](../../dist/imgs/covers/gpt-image-2.webp)

---

## 이 스킬의 역할

GPT Image 2(및 OpenAI 호환 이미지 API)를 위한 구조화된 프롬프트 엔지니어링 + 이미지 생성 패키지입니다. `POST /images/generations`와 `POST /images/edits` 두 작업만 수행하지만, 사용자에게 불편을 주지 않고 세 가지 서로 다른 실행 환경에서 동작합니다.

포함 기능:

- **모드 인식 워크플로**: 에이전트가 API 키를 보유하든, 호스트에 기본 이미지 도구가 있든, 이미지 도구가 전혀 없든 같은 스킬을 사용할 수 있습니다.
- **구조화된 템플릿 라이브러리**: 18개 대분류와 프롬프트 템플릿 79개로 포스터, UI 목업, 제품 이미지, 인포그래픽, 학술 도표, 기술 아키텍처, 만화, 아바타, 편집 워크플로를 다룹니다.
- **재사용 가능한 프롬프트 + 이미지 보관**: 기본적으로 `garden-gpt-image-2/prompt/`와 `garden-gpt-image-2/image/`에 저장하며 `<task-slug>-<timestamp>` 형식으로 이름을 지정합니다.

---

## 세 가지 실행 모드

모든 작업은 다음 탐지 스크립트를 실행하는 것부터 시작합니다.

```bash
node skills/gpt-image-2/scripts/check-mode.js
# 구조화된 결과를 얻으려면:
node skills/gpt-image-2/scripts/check-mode.js --json
```

결과는 다음 세 가지 중 하나로 판정됩니다.

| 모드 | 조건 | 동작 |
|---|---|---|
| **A · Garden 로컬 이미지 생성** | `ENABLE_GARDEN_IMAGEGEN`이 참 **이고** `OPENAI_API_KEY`가 설정됨 | 엔드 투 엔드: 템플릿 선택 → 프롬프트 렌더링 → `generate.js` / `edit.js` 호출 → 이미지 저장 |
| **B · 호스트 기본 도구에 위임** | Garden은 비활성화됐지만 호스트 에이전트에 기본 이미지 도구(`image_generation` / `dalle` / `nano_banana` / 이미지 MCP 등)가 있음 | 프롬프트를 렌더링한 뒤 **호스트의 이미지 도구에 전달**해 생성 |
| **C · 프롬프트 어드바이저** | Garden이 비활성화되고 호스트에도 이미지 도구가 없음 | "고품질 프롬프트 작성 어드바이저"로 전환해 프롬프트를 `garden-gpt-image-2/prompt/`에 저장하고 사용자가 ChatGPT / Midjourney / DALL·E / Sora / Nano Banana / 자체 게이트웨이에서 실행하도록 안내 |

세 모드 모두 프롬프트 파일 저장을 권장합니다(A와 C는 필수, B는 권장). 하지만 이미지 파일을 생성하는 것은 A뿐입니다. B는 호스트가 결정하고 C에서는 이미지를 만들 수 없습니다.

---

## 빠른 시작

### 0. 실행 모드 확인(항상 첫 단계)

```bash
node skills/gpt-image-2/scripts/check-mode.js
```

아래 1~4단계는 **모드 A**에서만 사용합니다.

### 1. 텍스트로 이미지 생성

```bash
node skills/gpt-image-2/scripts/generate.js \
  --prompt "A cute baby sea otter" \
  --size 1024x1024 \
  --quality high
```

### 2. 프롬프트 파일로 이미지 생성

```bash
node skills/gpt-image-2/scripts/generate.js \
  --promptfile garden-gpt-image-2/prompt/poster-20260424-153045.md
```

### 3. 기존 이미지 편집

```bash
node skills/gpt-image-2/scripts/edit.js \
  --image assets/source.png \
  --prompt "Replace the background with a clean studio scene"
```

### 4. 마스크를 사용한 부분 편집

```bash
node skills/gpt-image-2/scripts/edit.js \
  --image assets/source.png \
  --mask  assets/mask.png \
  --prompt "Replace only the masked area with a glass vase"
```

모드 B / C에는 CLI 진입점이 없습니다. 스킬은 최종 프롬프트를 렌더링한 뒤 호스트 이미지 도구에 전달하거나(B) 사용자에게 직접 제시합니다(C).

---

## 사례 갤러리

공개 사례 라이브러리는 현재 18개 대분류, 79개 템플릿, 160개 이상의 생성 / 편집 결과를 포함합니다. 전체 인덱스가 아니라 기능 범위를 대표하는 주요 사례를 골랐습니다. 각 썸네일은 온라인 사례 페이지로 연결되며 이미지는 별도 `ConardLi/gpt-image-2-101` 사례 저장소에서 가져옵니다.

### UI 목업

<table>
  <tr>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/ui-mockups%2Flive-commerce-ui%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/ui-mockups/live-commerce-ui/1-thumb.webp" alt="라이브 커머스 UI 사례" width="100%"></a><br/><strong><code>live-commerce-ui</code></strong><br/><sub>상품, 실시간 댓글, 선물, 상태 표시가 포함된 유명인 라이브 커머스 화면。</sub></td>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/ui-mockups%2Fsocial-interface-mockup%2F3"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/ui-mockups/social-interface-mockup/3-thumb.webp" alt="소셜 인터페이스 목업 사례" width="100%"></a><br/><strong><code>social-interface-mockup</code></strong><br/><sub>기술 브랜드 공식 계정의 제품 업데이트 공지。</sub></td>
  </tr>
  <tr>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/ui-mockups%2Fproduct-card-overlay%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/ui-mockups/product-card-overlay/1-thumb.webp" alt="제품 랜딩 페이지 오버레이 사례" width="100%"></a><br/><strong><code>product-card-overlay</code></strong><br/><sub>모델, 제품, 장점 배지가 포함된 스킨케어 랜딩 페이지 히어로.</sub></td>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/ui-mockups%2Fchat-interface-scene%2F3"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/ui-mockups/chat-interface-scene/3-thumb.webp" alt="채팅 인터페이스 사례" width="100%"></a><br/><strong><code>chat-interface-scene</code></strong><br/><sub>대화 위계와 구조화된 답변을 강조하는 Claude 스타일 AI 어시스턴트 화면。</sub></td>
  </tr>
</table>

### 제품과 브랜드

<table>
  <tr>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/product-visuals%2Fexploded-view-poster%2F2"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/product-visuals/exploded-view-poster/2-thumb.webp" alt="제품 분해도 사례" width="100%"></a><br/><strong><code>exploded-view-poster</code></strong><br/><sub>Vision Pro 2의 광학 모듈과 연산 모듈 분해 대표 이미지。</sub></td>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/product-visuals%2Fpremium-studio-product%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/product-visuals/premium-studio-product/1-thumb.webp" alt="고급 스튜디오 제품 사진 사례" width="100%"></a><br/><strong><code>premium-studio-product</code></strong><br/><sub>공식 웹사이트 히어로와 잡지 양면 광고에 적합한 고급 스킨케어 정물 사진。</sub></td>
  </tr>
  <tr>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/branding-and-packaging%2Fcosmetic-packaging%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/branding-and-packaging/cosmetic-packaging/1-thumb.webp" alt="화장품 포장 사례" width="100%"></a><br/><strong><code>cosmetic-packaging</code></strong><br/><sub>소재와 브랜드 분위기를 함께 살린 중국산 고급 스킨케어 선물 세트。</sub></td>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/branding-and-packaging%2Fbeverage-label-design%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/branding-and-packaging/beverage-label-design/1-thumb.webp" alt="음료 라벨 디자인 사례" width="100%"></a><br/><strong><code>beverage-label-design</code></strong><br/><sub>중국풍 탄산수 병 라벨과 상업 사진 장면。</sub></td>
  </tr>
</table>

### 이미지 편집 워크플로

<table>
  <tr>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/editing-workflows%2Fbackground-replacement%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/editing-workflows/background-replacement/1-thumb.webp" alt="배경 교체 사례" width="100%"></a><br/><strong><code>background-replacement</code></strong><br/><sub>낮에 촬영한 인물 사진을 타임스퀘어 야경으로 옮기고 조명을 다시 맞춤。</sub></td>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/editing-workflows%2Fobject-removal%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/editing-workflows/object-removal/1-thumb.webp" alt="불필요한 요소 제거 사례" width="100%"></a><br/><strong><code>object-removal</code></strong><br/><sub>졸업 단체 사진 가장자리에 우연히 들어온 인물을 지우고 배경을 복원。</sub></td>
  </tr>
  <tr>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/editing-workflows%2Fproduct-retouching%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/editing-workflows/product-retouching/1-thumb.webp" alt="제품 정밀 보정 사례" width="100%"></a><br/><strong><code>product-retouching</code></strong><br/><sub>AirPods 전자상거래 메인 이미지의 질감, 가장자리, 라벨을 선명하게 보정。</sub></td>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/editing-workflows%2Fportrait-local-edit%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/editing-workflows/portrait-local-edit/1-thumb.webp" alt="인물 사진 국소 편집 사례" width="100%"></a><br/><strong><code>portrait-local-edit</code></strong><br/><sub>인물 정체성을 유지하며 머리색과 헤어스타일을 조정。</sub></td>
  </tr>
</table>

### 인포그래픽과 시각 문서

<table>
  <tr>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/infographics%2Fbento-grid-infographic%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/infographics/bento-grid-infographic/1-thumb.webp" alt="벤토 그리드 인포그래픽 사례" width="100%"></a><br/><strong><code>bento-grid-infographic</code></strong><br/><sub>벤토 그리드로 고밀도 정보를 구성한 iPhone 16 Pro 기능 분석。</sub></td>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/infographics%2Fcomparison-infographic%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/infographics/comparison-infographic/1-thumb.webp" alt="비교 인포그래픽 사례" width="100%"></a><br/><strong><code>comparison-infographic</code></strong><br/><sub>구매 결정 기준에 따라 정보를 구성한 휴대전화 비교 이미지。</sub></td>
  </tr>
  <tr>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/slides-and-visual-docs%2Fdense-explainer-slides%2F2"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/slides-and-visual-docs/dense-explainer-slides/2-thumb.webp" alt="고밀도 설명 슬라이드 사례" width="100%"></a><br/><strong><code>dense-explainer-slides</code></strong><br/><sub>AI 에이전트 작동 방식을 한 페이지로 설명한 기술 교육 자료。</sub></td>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/slides-and-visual-docs%2Fvisual-report-page%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/slides-and-visual-docs/visual-report-page/1-thumb.webp" alt="시각 보고서 페이지 사례" width="100%"></a><br/><strong><code>visual-report-page</code></strong><br/><sub>KPI 카드와 추세 차트 리듬을 결합한 비즈니스 경영진 요약 페이지。</sub></td>
  </tr>
</table>

### 학술 및 기술 도표

<table>
  <tr>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/academic-figures%2Fmethod-pipeline-overview%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/academic-figures/method-pipeline-overview/1-thumb.webp" alt="방법 파이프라인 도표 사례" width="100%"></a><br/><strong><code>method-pipeline-overview</code></strong><br/><sub>논문 개요에 적합한 RAG 장문 문맥 질의응답 방법 흐름도。</sub></td>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/academic-figures%2Fneural-network-architecture%2F2"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/academic-figures/neural-network-architecture/2-thumb.webp" alt="신경망 아키텍처 도표 사례" width="100%"></a><br/><strong><code>neural-network-architecture</code></strong><br/><sub>Patch Embedding과 텐서 흐름을 포함한 ViT-B/16 아키텍처 도표。</sub></td>
  </tr>
  <tr>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/technical-diagrams%2Fsystem-architecture%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/technical-diagrams/system-architecture/1-thumb.webp" alt="시스템 아키텍처 도표 사례" width="100%"></a><br/><strong><code>system-architecture</code></strong><br/><sub>멀티테넌트 AI 고객지원 SaaS 프로덕션 아키텍처 개요。</sub></td>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/technical-diagrams%2Fsequence-diagram%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/technical-diagrams/sequence-diagram/1-thumb.webp" alt="시퀀스 다이어그램 사례" width="100%"></a><br/><strong><code>sequence-diagram</code></strong><br/><sub>OAuth 2.0 인증 코드 + PKCE 표준 시퀀스。</sub></td>
  </tr>
</table>

### 이야기, 지도, 캐릭터

<table>
  <tr>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/storyboards-and-sequences%2Fanime-key-visual%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/storyboards-and-sequences/anime-key-visual/1-thumb.webp" alt="애니메이션 메인 비주얼 사례" width="100%"></a><br/><strong><code>anime-key-visual</code></strong><br/><sub>여러 비율의 크롭을 고려한 동양 판타지 게임 출시 KV。</sub></td>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/maps%2Ffood-map%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/maps/food-map/1-thumb.webp" alt="맛집 지도 사례" width="100%"></a><br/><strong><code>food-map</code></strong><br/><sub>일러스트 랜드마크를 포함한 상하이 우캉루 시티워크 맛집 지도。</sub></td>
  </tr>
  <tr>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/maps%2Ftravel-route-map%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/maps/travel-route-map/1-thumb.webp" alt="여행 경로 지도 사례" width="100%"></a><br/><strong><code>travel-route-map</code></strong><br/><sub>경유지 삽화와 경로 리듬을 담은 교토 3일 느긋한 여행 지도。</sub></td>
    <td width="50%" align="center"><a href="https://gpt-image2.mmh1.top/#/case/portraits-and-characters%2Fprofessional-portrait%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/portraits-and-characters/professional-portrait/1-thumb.webp" alt="전문직 초상화 사례" width="100%"></a><br/><strong><code>professional-portrait</code></strong><br/><sub>회사 소개와 미디어 페이지에 적합한 절제된 기업 리더 초상화。</sub></td>
  </tr>
</table>

<sub>전체 사례 라이브러리: <a href="https://gpt-image2.mmh1.top/#/case"><b>온라인 사례 브라우저</b></a> · <a href="https://github.com/ConardLi/gpt-image-2-101/tree/main/public/case">사례 리소스 저장소</a> · 로컬 인덱스 <code>website/gpt-image2-website/public/case/INDEX.md</code>。</sub>

---

## 스킬 구조

```
skills/gpt-image-2/
├── SKILL.md                       메인 스킬 정의
├── scripts/
│   ├── check-mode.js              모드 A/B/C 탐지기(먼저 실행)
│   ├── generate.js                텍스트로 이미지 생성(모드 A 전용)
│   ├── edit.js                    이미지 편집 / 부분 편집(모드 A 전용)
│   ├── shared.js                  공유 요청 / 저장 / 환경 변수 파싱
│   └── package.json
└── references/
    ├── prompt-writing.md          방법론: 템플릿 설계 및 누락 필드 질문 방식
    ├── ui-mockups/                라이브 커머스, 소셜, 제품 카드, 채팅, 짧은 영상 표지
    ├── product-visuals/           분해도, 순백 배경, 스튜디오, 포장, 라이프스타일
    ├── infographics/              信息图
    ├── poster-and-campaigns/      브랜드 포스터, 캠페인 KV, 배너, 잡지 표지
    ├── slides-and-visual-docs/    고밀도 설명, 정책 스타일, 비즈니스 보고서, 교육 도식
    ├── portraits-and-characters/  전문직 초상, 창업자 초상, 가상 스트리머, 캐릭터 설정
    ├── scenes-and-illustrations/  힐링 장면, 콘셉트 대형 장면, 그림책, 미니멀 여백
    ├── editing-workflows/         배경 교체, 국소 교체, 제거, 제품 보정, 인물 편집
    ├── avatars-and-profile/       스타일 변환 셀피, 캐릭터 그리드, 3D 아이콘, 스티커, 문화 시리즈
    ├── storyboards-and-sequences/ 4칸 만화, 만화 콘티, 애니메이션 KV, 캐릭터 관계도, 순서도
    ├── grids-and-collages/        2×2 배너, 룩북, 혼합 스타일 콜라주, 애니메이션 피치 보드
    ├── branding-and-packaging/    브랜드 아이덴티티 시스템, 마스코트, 화장품 포장, 음료 라벨
    ├── typography-and-text-layout/ 타이포그래피 포스터, 이중 언어 레이아웃
    ├── assets-and-props/          스큐어모픽 아이콘, 게임 스크린샷 목업
    ├── academic-figures/          방법 파이프라인, 신경망 아키텍처, 정성 비교
    ├── technical-diagrams/        아키텍처, 순서도, 시퀀스 다이어그램
    └── maps/                      맛집 지도, 여행 경로 지도, 도시 일러스트, 매장 분포
```

---

## 환경 변수

다음 순서로 값을 읽습니다: CLI 인수 → `process.env` → `<cwd>/.env` → `<cwd>/.gateway.env` → `~/.gateway.env`.

| 변수 | 필수 여부 | 설명 |
|---|---|---|
| `ENABLE_GARDEN_IMAGEGEN` | 모드 A 필수 | 모드 스위치: `1` / `true` / `yes` / `on`이면 모드 A 활성화 |
| `OPENAI_API_KEY` | 모드 A 필수 | 실제 이미지 API 호출에 사용 |
| `OPENAI_BASE_URL` | 선택 사항 | 기본값 `https://api.openai.com/v1`, 모든 OpenAI 호환 게이트웨이를 지정할 수 있음 |
| `OPENAI_IMAGE_MODEL` | 선택 사항 | 기본값 `gpt-image-2`, `gpt-image-1` / `dall-e-3` 등으로 변경 가능 |

기본 구현은 OpenAI 호환 인터페이스를 엄격히 따르며 어떤 서드파티 게이트웨이에도 **종속되지 않습니다**.

---

## 출력 규칙

사용자가 출력 경로를 명확히 지정하지 않은 경우:

| 항목 | 저장 위치 | 적용 모드 |
|---|---|---|
| 렌더링된 프롬프트 | `garden-gpt-image-2/prompt/<task-slug>-<timestamp>.md` | A / B / C |
| 생성된 이미지 | `garden-gpt-image-2/image/<task-slug>-<timestamp>.png` | A만 해당(B는 호스트가 결정하고 C는 생성하지 않음) |

`<task-slug>`는 사용자 요청에서 자동으로 파생되며 `<timestamp>`는 `YYYYMMDD-HHMMSS` 형식입니다.

예시:

- `garden-gpt-image-2/prompt/live-commerce-ui-20260424-153045.md`
- `garden-gpt-image-2/image/vr-headset-exploded-view-20260424-153102.png`

---

## 설계 원칙

1. **먼저 모드를 판별한 뒤 작업합니다.** 호스트에 API 키가 없다고 조용히 실패하지 않고 B / C로 자연스럽게 전환해 현재 상태를 사용자에게 명확히 알립니다.
2. **자유 형식 프롬프트보다 템플릿을 우선합니다.** 18개 대분류의 사전 검증된 구조화 템플릿에는 `{argument ...}` 매개변수 슬롯과 `default` 표시가 명시되어 있어 "원하는 게 뭔가요?"라고 묻는 것보다 품질이 훨씬 높습니다.
3. **구체적으로 질문하고 막연하게 묻지 않습니다.** 템플릿 필드가 빠지면 항목별로 정확히 질문합니다(예: "스트리머는 누구인가요? 실제 사진 / 유명인 이름 / 자유 설명 / 무작위 생성 중 어떤 방식인가요?"). "어떤 스타일을 원하시나요?"처럼 뭉뚱그려 묻지 않습니다.
4. **항상 프롬프트를 보관합니다.** 어드바이저 모드에서도 렌더링한 프롬프트를 저장해 재사용할 수 있게 합니다.
5. **기본적으로 OpenAI와 호환됩니다.** 특정 게이트웨이에 종속되지 않습니다.

---

## 라이선스

MIT
