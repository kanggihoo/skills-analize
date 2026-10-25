# GPT-Image2 스타일 라이브러리 참조

`data/style-library.json`에서 생성했습니다. 이 파일은 GPT-Image2 프롬프트 템플릿, 시각 스타일, 범주, 장면 태그를 선택하기 위한 상세 색인입니다.

## 선택 규칙

- 먼저 명시된 제품 유형을 템플릿 범주와 연결합니다. 예: 제품, 포스터, UI, 인포그래픽, 브랜드, 사진, 캐릭터, 문서.
- 다음으로 시각적 표현을 스타일 태그와 연결합니다. 예: 사실적, 3D, 일러스트, 고전적, 브랜드, 포스터, UI.
- 다음으로 맥락 표현을 장면 태그와 연결합니다. 예: 상업, 교육, 소셜, 음식, 여행, 이야기, 역사, 기술, 창작.
- 요청이 모호하면 적합한 템플릿 방향을 2~3개 제안하고, 최종 프롬프트를 작성하기 전에 사용자가 선택하도록 합니다.
- 최종 결과에는 선택한 템플릿 이름, 복사해 사용할 수 있는 GPT-Image2 프롬프트, 텍스트·화면 비율·레이아웃·제외할 요소에 관한 간결한 제약 조건을 포함합니다.

## 템플릿 색인

### UI 스크린샷 시스템

- ID: `ui-screenshot-system`
- 범주: UI 및 인터페이스
- 스타일: UI
- 장면: 기술, 소셜
- 태그: UI, Dashboard, Screenshot
- 대표 이미지: `/images/case17.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-ui
- 예시 사례: case 17, case 2, case 4

사용 시점:
- 앱 화면, 대시보드, 소셜 미디어 스크린샷, 라이브 인터페이스 mockup에 사용합니다.

안내:

  - 플랫폼, 화면 비율, 레이아웃 계층, 화면에 표시될 정확한 텍스트를 고정합니다.
  - 상태 표시줄, 탭, 작업 행, 댓글 레이어 등 UI 크롬을 지정합니다.

주의 사항:

  - 플랫폼 이름을 모호하게 쓰거나 일반적인 앱 mockup만 요청하지 마세요.
  - 텍스트 가독성과 플랫폼별 세부 요소를 구체적으로 제한합니다.

### 인포그래픽 엔진

- ID: `infographic-engine`
- 범주: 차트 및 인포그래픽
- 스타일: Infographic, Charts
- 장면: 교육, 기술
- 태그: Infographic, Chart, Education
- 대표 이미지: `/images/case334.png`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-infographic
- 예시 사례: case 334, case 1, case 8

사용 시점:
- 설명 그래픽, 기술 도식, 타임라인, 지식 카드에 사용합니다.

안내:

  - 모듈을 3~5개로 정하고 정보 흐름, 시각적 계층, 짧은 레이블을 지정합니다.
  - 색상 그룹, 화살표, 아이콘, 충분한 여백으로 복잡도를 낮춥니다.

주의 사항:

  - 이미지 안에 긴 문단을 넣지 마세요.
  - 시각적 세부 요소를 추가하기 전에 모듈 수부터 제한합니다.

### 과학적 규모 비교 도식

- ID: `scientific-scale-diagram`
- 범주: 차트 및 인포그래픽
- 스타일: Infographic, Charts, Realistic
- 장면: 교육, 기술
- 태그: Infographic, Chart, Education
- 대표 이미지: `/images/case341.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-infographic
- 예시 사례: case 341

사용 시점:
- 미시 규모부터 거시 규모까지의 비교와 레이블이 달린 상세 확대 창이 필요한 주제에 사용합니다.

안내:

  - 규모를 보여주는 프레임을 6~8개 사용하고 각 레이블은 짧게 유지합니다.
  - 단위, 배율, 규모별로 구별되는 세부 내용을 표시합니다.

주의 사항:

  - 모든 규모 프레임을 똑같이 보이게 하지 마세요.
  - 어디에나 쓰이는 돋보기 아이콘 중심의 레이아웃을 피합니다.

### 포스터 레이아웃 시스템

- ID: `poster-layout-system`
- 범주: 포스터 및 타이포그래피
- 스타일: Poster
- 장면: 상업, 소셜
- 태그: Poster, Typography, Campaign
- 대표 이미지: `/images/case345.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-poster
- 예시 사례: case 345, case 5, case 10

사용 시점:
- 행사 포스터, 영화 포스터, 표지, 소셜 캠페인 비주얼에 사용합니다.

안내:

  - 주제, 제목, 레이아웃, 색상 팔레트, 화면 비율을 고정합니다.
  - 제목의 위계와 핵심 비주얼이 명확하게 드러나게 합니다.

주의 사항:

  - 완성된 포스터 한 장을 요청할 때는 여러 분위기의 무드보드나 작업 과정 시트를 만들지 않도록 합니다.
  - 추가 텍스트와 장식 기호를 제한합니다.

### 스포츠 캠페인 포스터

- ID: `sports-campaign-poster`
- 범주: 포스터 및 타이포그래피
- 스타일: Poster, Realistic
- 장면: 상업, 패션
- 태그: Poster, Campaign, Typography
- 대표 이미지: `/images/case350.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-poster
- 예시 사례: case 350, case 3

사용 시점:
- 스포츠 브랜드 캠페인, 선수 포스터, 제품 중심 스포츠 비주얼에 사용합니다.

안내:

  - 스포츠 종목, 선수의 자세, 핵심 소품, 제목, 브랜드 색상을 정의합니다.
  - 극적인 조명, 깔끔한 구도, 읽기 쉬운 데이터 오버레이를 사용합니다.

주의 사항:

  - 잘못된 장비와 산만한 콜라주를 피합니다.
  - 선수와 핵심 소품이 시각적으로 중심이 되게 합니다.

### 개념 타이포그래피 포스터

- ID: `conceptual-typography-poster`
- 범주: 포스터 및 타이포그래피
- 스타일: Poster
- 장면: 창작, 소셜
- 태그: Typography, Poster, Style
- 대표 이미지: `/images/case355.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-poster
- 예시 사례: case 355

사용 시점:
- 정확한 제목이 화면의 주요 구조가 되어야 할 때 사용합니다.

안내:

  - 타이포그래피를 중심 비주얼로 삼고 제목 철자를 정확히 표시합니다.
  - 인물, 사물, 풍경을 제목의 의미와 연결합니다.

주의 사항:

  - 기본 워드 아트, 무관한 아이콘, 잘못 표기된 제목을 피합니다.
  - 색상 체계를 절제된 팔레트로 제한합니다.

### 수묵 이중 노출 포스터

- ID: `ink-double-exposure-poster`
- 범주: 포스터 및 타이포그래피
- 스타일: Poster, Illustration, Classical
- 장면: 이야기, 역사
- 태그: Poster, Classical, Style
- 대표 이미지: `/images/case359.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-poster
- 예시 사례: case 359

사용 시점:
- 시적인 인물 포스터, 수묵 분위기, 여러 층으로 구성된 문화적 비주얼에 사용합니다.

안내:

  - 인물 실루엣, 수묵 질감, 분위기, 여백을 조화롭게 결합합니다.
  - 차분하고 고급스러우며 읽기 쉬운 구성을 유지합니다.

주의 사항:

  - 저렴한 판타지 콜라주와 과도하게 쌓인 풍경을 피합니다.
  - 꼭 필요한 경우가 아니라면 텍스트를 은은하게 사용하거나 생략합니다.

### 자연 과학 포스터

- ID: `nature-science-poster`
- 범주: 포스터 및 타이포그래피
- 스타일: Poster, Infographic
- 장면: 교육
- 태그: Poster, Education, Style
- 대표 이미지: `/images/case339.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-poster
- 예시 사례: case 339

사용 시점:
- 고급스럽고 깔끔한 과학 포스터 느낌이 필요한 자연 주제에 사용합니다.

안내:

  - 명확한 주제, 최소한의 문구, 부드러운 그림자, 절제된 여백을 사용합니다.
  - 과학 정보 레이블은 짧고 눈에 잘 띄게 유지합니다.

주의 사항:

  - 광고 문구가 지나치게 강한 표현을 피합니다.
  - 백과사전식 설명을 빽빽하게 넣지 않습니다.

### 제품 커머스 비주얼

- ID: `product-commerce-visual`
- 범주: 제품 및 이커머스
- 스타일: Product, Realistic
- 장면: 상업, 음식
- 태그: Product, Commerce, Packaging
- 대표 이미지: `/images/case373.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-product
- 예시 사례: case 373, case 358

사용 시점:
- 제품 대표 이미지, 포장 비주얼, 상세 페이지, 판매 포인트 레이아웃에 사용합니다.

안내:

  - 제품, 판매 포인트, 소재, 장면, 조명, 레이아웃 블록을 정의합니다.
  - 대표 제품, 장점 레이블, 보조 소품을 분리합니다.

주의 사항:

  - 제품을 알아보기 어렵게 만드는 무작위 소품은 피합니다.
  - 포장 문구와 제품 주장 표현을 제한합니다.

### 개인 맞춤형 뷰티 리포트

- ID: `personalized-beauty-report`
- 범주: 제품 및 이커머스
- 스타일: Product, UI
- 장면: 상업, 패션
- 태그: Product, Layout, Style
- 대표 이미지: `/images/case353.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-product
- 예시 사례: case 353

사용 시점:
- 뷰티 추천, 피부 보고서, 쇼핑 도우미, 라이프스타일 제품 카드에 사용합니다.

안내:

  - 진단, 추천, 제품 카드로 구성된 보고서형 위계를 사용합니다.
  - 제품 이미지, 레이블, 평점을 서로 맞춰 정렬합니다.

주의 사항:

  - 의료적 주장을 하거나 읽기 어려운 빽빽한 메모를 넣지 않습니다.
  - 추천 논리를 단순하고 명확하게 유지합니다.

### 브랜드 아이덴티티 패키지

- ID: `brand-identity-package`
- 범주: 브랜드 및 로고
- 스타일: Brand
- 장면: 상업
- 태그: Brand, Logo, Identity
- 대표 이미지: `/images/case354.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-brand
- 예시 사례: case 354

사용 시점:
- 로고 시스템, 브랜드 보드, 시각 아이덴티티 키트, 응용 mockup에 사용합니다.

안내:

  - 브랜드 이름, 포지셔닝, 색상 팔레트, 타이포그래피, 로고 사용법, 접점을 정의합니다.
  - 응용 사례가 서로 정렬된 일관성 있는 보드를 요청합니다.

주의 사항:

  - 서로 관련 없는 로고 변형과 일관성 없는 팔레트를 피합니다.
  - 브랜드 텍스트를 정확하게 유지합니다.

### 브랜드 접점 비주얼 보드

- ID: `brand-touchpoint-board`
- 범주: 브랜드 및 로고
- 스타일: Brand, Product
- 장면: 상업, 소셜
- 태그: Brand, Identity, Campaign
- 대표 이미지: `/images/case362.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-brand
- 예시 사례: case 362

사용 시점:
- 여러 접점을 보여주는 캠페인 보드와 브랜드 적용 미리보기에 사용합니다.

안내:

  - 접점 목록, 공유할 시각 규칙, mockup 배치를 지정합니다.
  - 모든 패널에서 하나의 색상 팔레트와 타이포그래피 체계를 공유합니다.

주의 사항:

  - 서로 관련 없는 캠페인 스타일을 여러 개 섞지 않습니다.
  - 가독성이 떨어지면 접점 수를 줄입니다.

### 건축 및 공간

- ID: `architecture-space`
- 범주: 건축 및 공간
- 스타일: Architecture
- 장면: 여행, 상업
- 태그: Architecture, Interior, Map
- 대표 이미지: `/images/case331.png`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-architecture
- 예시 사례: case 331, case 11

사용 시점:
- 실내 공간, 건축 렌더링, 도시 지도, 공간 계획, 환경 콘셉트에 사용합니다.

안내:

  - 시점, 규모, 소재, 조명, 공간의 기능을 정의합니다.
  - 지도에는 랜드마크, 레이블, 테두리 장식, 시각적 정확도 수준을 지정합니다.

주의 사항:

  - 콘셉트 이미지가 아닌 경우 비현실적인 투시를 피합니다.
  - 지도 레이블의 언어와 상대적 위치를 고정합니다.

### 사실적인 사진

- ID: `realistic-photography`
- 범주: 사진 및 사실적 표현
- 스타일: Photography, Realistic
- 장면: 패션, 상업
- 태그: Photography, Realistic, Lens
- 대표 이미지: `/images/case377.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-photo
- 예시 사례: case 377

사용 시점:
- 인물 사진, 거리 사진, 제품 사진, 영화적인 사실 표현에 사용합니다.

안내:

  - 카메라 거리, 렌즈, 광원, 질감, 배경, 움직임을 지정합니다.
  - 다큐멘터리 같은 사실감을 위해 그럴듯한 불완전함을 더합니다.

주의 사항:

  - 상업용 뷰티 이미지가 필요한 경우가 아니라면 피부를 지나치게 매끈하고 플라스틱처럼 표현하지 않습니다.
  - 필요하다면 손, 텍스트, 신체 구조에 관한 제외 조건을 추가합니다.

### 거리의 돌발 순간 사진

- ID: `street-accident-moment`
- 범주: 사진 및 사실적 표현
- 스타일: Photography, Realistic
- 장면: 여행, 소셜
- 태그: Photography, Realistic, Scene
- 대표 이미지: `/images/case376.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-photo
- 예시 사례: case 376

사용 시점:
- 거리 스냅, 우발적인 액체 쏟음, 휴대폰 다큐멘터리 사진, 빠른 동작 표현에 사용합니다.

안내:

  - 정확한 순간, 카메라 높이, 모션 블러, 거리 환경을 묘사합니다.
  - 연출된 자세와 가짜 광고 조명 느낌을 피하도록 제외 조건을 추가합니다.

주의 사항:

  - 지나치게 깔끔한 구도를 피합니다.
  - 사건이 그럴듯하고 현실에 기반해 보이도록 합니다.

### 일러스트 및 아트 스타일

- ID: `illustration-art-style`
- 범주: 일러스트 및 아트
- 스타일: Illustration
- 장면: 이야기, 창작
- 태그: Illustration, Art, Style
- 대표 이미지: `/images/case346.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-illustration
- 예시 사례: case 346, case 6

사용 시점:
- 애니메이션, 수채화, 수묵화, 장식 미술, 스타일 실험에 사용합니다.

안내:

  - 구도, 주제, 색상 팔레트, 붓 재질, 분위기, 렌더링의 깊이를 정의합니다.
  - 참조 이미지를 사용할 때는 반드시 유지할 요소를 명시합니다.

주의 사항:

  - 구도 설명 없이 스타일만 지정하는 프롬프트를 피합니다.
  - 참조 이미지를 사용할 때 캐릭터의 정체성을 고정합니다.

### 캐릭터 디자인 시트

- ID: `character-design-sheet`
- 범주: 캐릭터 및 인물
- 스타일: Character, Illustration
- 장면: 이야기
- 태그: Character, Pose, Style
- 대표 이미지: `/images/case347.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-character
- 예시 사례: case 347

사용 시점:
- 캐릭터 시트, 포즈 그리드, 동작 분석, 정체성 일관성 참조 자료에 사용합니다.

안내:

  - 정체성을 고정하는 특징, 의상, 비율, 포즈 수, 시트 레이아웃을 정의합니다.
  - 얼굴, 헤어스타일, 의상 세부 요소를 일관되게 유지합니다.

주의 사항:

  - 포즈마다 의상 세부 요소가 달라지지 않게 합니다.
  - 시트가 복잡해지면 포즈 수를 제한합니다.

### 3D 수집용 피규어

- ID: `3d-collectible-toy`
- 범주: 캐릭터 및 인물
- 스타일: 3D, Character
- 장면: 상업, 창작
- 태그: Character, 3D, Style
- 대표 이미지: `/images/case378.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-character
- 예시 사례: case 378

사용 시점:
- 고급 수집용 피규어, 아바타 장난감, 블라인드 박스 캐릭터, 3D 전시 렌더링에 사용합니다.

안내:

  - 참조 이미지의 얼굴과 의상 특징을 유지합니다.
  - 소재, 포장, 받침대, 조명, 수집용 피규어의 크기를 지정합니다.

주의 사항:

  - 정체성을 드러내는 세부 사항이 없는 평범한 장난감 형태를 피합니다.
  - 포장 텍스트는 최소한으로 정확하게 유지합니다.

### 장면 스토리텔링

- ID: `scene-storytelling`
- 범주: 장면 및 스토리텔링
- 스타일: Scenes, Illustration
- 장면: 이야기, 소셜
- 태그: Scene, Story, Storyboard
- 대표 이미지: `/images/case330.png`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-scene
- 예시 사례: case 330

사용 시점:
- 스토리보드, 세계관 구성, 라이브 장면, 감정 중심의 서사 프레임에 사용합니다.

안내:

  - 인물, 장소, 시간, 갈등, 감정, 카메라 구도를 정의합니다.
  - 장면의 세부 요소가 장식에 그치지 않고 서사를 뒷받침하도록 합니다.

주의 사항:

  - 어디에나 쓰이는 판타지 배경을 피합니다.
  - 서사를 암시하는 단서가 화면에서 보이도록 유지합니다.

### 역사 및 고전 테마

- ID: `history-classical-themes`
- 범주: 역사 및 고전 테마
- 스타일: History, Classical, Illustration
- 장면: 역사, 이야기
- 태그: History, Classical, Scroll
- 대표 이미지: `/images/case375.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-history
- 예시 사례: case 375, case 338

사용 시점:
- 중국 고전 테마, 두루마리 그림, 왕조별 복식, 시각적 시 표현, 역사 장면에 사용합니다.

안내:

  - 왕조, 복식 체계, 사물 참조 자료, 레이아웃 형식, 문화적 분위기를 지정합니다.
  - 두루마리, 화첩 페이지, 포스터 중 적합한 형식을 의도적으로 선택합니다.

주의 사항:

  - 역사적 정확성이 중요할 때 여러 왕조를 혼합하지 않습니다.
  - 무작위로 현대 소품이 들어가지 않도록 제한합니다.

### 문서 및 출판물

- ID: `document-publishing`
- 범주: 문서 및 출판물
- 스타일: Documents, Infographic
- 장면: 교육, 기술
- 태그: Document, Publishing, Layout
- 대표 이미지: `/images/case360.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-document
- 예시 사례: case 360

사용 시점:
- 백서, 매뉴얼, 백과사전 도판, 보고서 페이지, 출판 시스템에 사용합니다.

안내:

  - 페이지 크기, 단 수, 목차, 그림 체계, 타이포그래피 위계를 정의합니다.
  - 읽기 쉬운 제목, 표, 레이블, 페이지 리듬을 사용합니다.

주의 사항:

  - 글자가 너무 작고 빽빽하게 배치되지 않도록 합니다.
  - 차트와 캡션을 페이지 그리드에 맞춰 정렬합니다.

### 콘셉트 제품 개발 분석도

- ID: `concept-product-breakdown`
- 범주: 기타 사용 사례
- 스타일: Other Use Cases, Product
- 장면: 창작, 기술
- 태그: Creative, R&D, Special
- 대표 이미지: `/images/case370.jpg`
- 템플릿 출처: https://github.com/freestylefly/awesome-gpt-image-2/blob/main/docs/templates.md#tpl-other
- 예시 사례: case 370, case 361

사용 시점:
- 실험적인 프롬프트 작업, 연구 개발 보드, 분해도, 특수한 시각 체계에 사용합니다.

안내:

  - 결과물 유형, 구성 요소, 레이블, 소재의 논리, 최종 제시 형식을 정의합니다.
  - 명확한 콜아웃과 통제된 기술적 스타일을 사용합니다.

주의 사항:

  - 범위가 정해지지 않은 여러 작업을 한데 섞지 않습니다.
  - 레이블을 짧게 유지하고 구성 요소 간 관계가 보이도록 합니다.

## 범주

- UI 및 인터페이스: 앱, 웹사이트, 대시보드, 소셜 스크린샷, 제품 인터페이스.
- 차트 및 인포그래픽: 인포그래픽, 지식 지도, 기술 설명 자료, 구조화된 도식.
- 포스터 및 타이포그래피: 행사 포스터, 표지, 타이포그래피 중심 비주얼, 강한 레이아웃 구성.
- 제품 및 이커머스: 제품 사진, 상세 페이지, 포장, 판매 포인트, 광고.
- 브랜드 및 로고: 로고, 아이덴티티 시스템, 브랜드 접점, 캠페인 비주얼.
- 건축 및 공간: 건축 렌더링, 실내 공간, 도시 지도, 공간 콘셉트.
- 사진 및 사실적 표현: 인물 사진, 휴대폰 사진, 필름 질감, 상업 사진.
- 일러스트 및 아트: 일러스트, 아트 스타일, 소재 실험, 장식 이미지.
- 캐릭터 및 인물: 캐릭터 디자인, 포즈 참조 자료, 카드, 3D 장난감.
- 장면 및 스토리텔링: 스토리보드, 서사 장면, 라이브 스트리밍 프레임, 세계관 구성.
- 역사 및 고전 테마: 고전 두루마리 그림, 역사적 인물, 전통 테마, 시각적 시 표현.
- 문서 및 출판물: 백서, 매뉴얼, 백과사전 도판, 출판물 레이아웃.
- 기타 사용 사례: 창작 실험, 특수 작업, 혼합 워크플로, 실용적인 사례.

## 스타일

- 3D: 3D | 키워드: 3d, toy, render, 장난감
- Architecture: 건축 | 키워드: 없음
- Brand: 브랜드 | 키워드: brand, logo, identity, 브랜드, 로고
- Character: 캐릭터 | 키워드: character, avatar, pose, 캐릭터, 인물
- Characters: 인물 | 키워드: 없음
- Charts: 차트 | 키워드: 없음
- Classical: 고전 | 키워드: classical, dynasty, history, 고전풍, 역사
- Documents: 문서 | 키워드: 없음
- History: 역사 | 키워드: 없음
- Illustration: 일러스트 | 키워드: illustration, painting, watercolor, 일러스트, 회화
- Infographic: 인포그래픽 | 키워드: infographic, diagram, 인포그래픽, 도식
- Other Use Cases: 기타 사용 사례 | 키워드: 없음
- Photography: 사진 | 키워드: 없음
- Poster: 포스터 | 키워드: poster, cover, typography, 포스터, 표지
- Product: 제품 | 키워드: product, packaging, 제품, 포장
- Products: 제품 | 키워드: 없음
- Realistic: 사실적 | 키워드: photo, realistic, camera, 사진, 사실적
- Scenes: 장면 | 키워드: 없음
- UI: 인터페이스 | 키워드: ui, interface, dashboard, 인터페이스, 스크린샷

## 장면

- Creative: 창작 | 키워드: 없음
- Tech: 기술 | 키워드: ai, rag, tech, data, 기술, 데이터
- Commerce: 상업 | 키워드: product, brand, ad, campaign, 제품, 상업, 광고
- Education: 교육 | 키워드: guide, atlas, science, learning, 학습, 과학 교육
- Social: 소셜 | 키워드: social, x , wechat, 모멘트(朋友圈), 소셜
- Fashion: 패션 | 키워드: fashion, clothing, portrait, 의류, 인물 사진
- Food: 식음료 | 키워드: food, drink, coffee, tea, 음식점, 커피, 차
- Travel: 여행 | 키워드: city, map, street, 도시, 지도, 거리
- Story: 이야기 | 키워드: story, scene, world, 이야기, 장면
- History: 역사 | 키워드: history, dynasty, ancient, 역사, 고대 그리스, 당나라
