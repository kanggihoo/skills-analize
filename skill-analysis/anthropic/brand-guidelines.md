# brand-guidelines 분석

## 원본

- 원본 경로: `.agents/skills/brand-guidelines/`
- 핵심 파일: `SKILL.md`
- 보조 파일: `LICENSE.txt`
- 확인한 규모: 2개 파일, 약 276줄
- 성격: Anthropic 공식 색상과 typography를 artifact에 적용하는 스타일 가이드 스킬

## 적용 조건

Anthropic 브랜드 look-and-feel이 필요한 artifact, 문서, 슬라이드, 시각 자료, UI formatting 요청에서 사용한다.

트리거 키워드는 branding, corporate identity, visual identity, brand colors, typography, Anthropic brand, visual formatting, visual design 등이다.

## 동작 과정

1. 대상 artifact가 Anthropic brand styling을 적용할 만한지 판단한다.

2. 색상 palette를 적용한다.
   main color와 accent color를 역할에 맞게 배정한다.

3. typography를 적용한다.
   heading에는 Poppins, body에는 Lora를 우선 사용하고, fallback으로 Arial/Georgia를 둔다.

4. heading과 body text를 구분한다.
   24pt 이상 heading은 Poppins, 본문은 Lora를 쓰는 방식으로 hierarchy를 유지한다.

5. 배경과 텍스트 대비를 고려해 smart color selection을 한다.

6. non-text shape에는 accent color를 순환 적용한다.
   orange, blue, green 계열을 사용해 브랜드 안에서 시각적 리듬을 만든다.

## 브랜드 리소스

### Main Colors

- Dark: `#141413` - primary text, dark background
- Light: `#faf9f5` - light background, dark background 위 text
- Mid Gray: `#b0aea5` - secondary element
- Light Gray: `#e8e6dc` - subtle background

### Accent Colors

- Orange: `#d97757` - primary accent
- Blue: `#6a9bcc` - secondary accent
- Green: `#788c5d` - tertiary accent

### Typography

- Heading: Poppins, fallback Arial
- Body: Lora, fallback Georgia

## 핵심 규칙

- Anthropic 스타일이 필요한 artifact에만 적용한다.
- 색상은 임의 palette가 아니라 지정된 brand color를 사용한다.
- custom font가 없으면 fallback font를 사용해 readability를 유지한다.
- shape와 accent는 브랜드 accent color 안에서 변주한다.
- 텍스트 hierarchy를 유지하고, 색상 fidelity를 지킨다.

## 산출물 특성

- Anthropic palette가 적용된 문서, 슬라이드, 웹 artifact, 이미지성 자료
- heading/body typography가 구분된 artifact
- accent color를 통해 일관된 Anthropic visual identity를 가진 결과물

## 주의점

- 이 스킬은 brand styling용이다. artifact의 본질적 내용 생성 workflow는 다른 스킬이 담당할 수 있다.
- Poppins/Lora가 설치되어 있지 않은 환경에서도 fallback을 통해 깨지지 않게 해야 한다.
- 색을 많이 추가해 palette를 흐리지 않는 것이 중요하다.
