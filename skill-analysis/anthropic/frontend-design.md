# frontend-design 분석

## 원본

- 원본 경로: `.agents/skills/frontend-design/`
- 핵심 파일: `SKILL.md`
- 보조 파일: `LICENSE.txt`
- 확인한 규모: 2개 파일, 약 234줄
- 성격: 새 UI 또는 기존 UI redesign에서 템플릿처럼 보이지 않는 독창적 시각 방향을 잡는 디자인 리더십 스킬

## 적용 조건

사용자가 frontend UI, web design, visual redesign, landing page, product interface, distinctive design direction을 요청할 때 사용한다.

이 스킬은 “무난한 SaaS 템플릿”을 피하고 brief의 subject, audience, page job에 맞는 palette, typography, layout, signature element를 설계하도록 한다.

## 동작 과정

1. brief가 불명확하면 subject를 직접 고정한다.
   구체적인 subject, audience, page의 single job을 정하고 그 선택을 명시한다.

2. subject의 세계에서 디자인 언어를 끌어온다.
   재료, 도구, 산물, 현장 언어, 문화적 맥락을 palette와 layout의 근거로 삼는다.

3. compact design plan을 만든다.
   color 4-6개 hex, typeface role 2개 이상, layout concept, ASCII wireframe, signature element를 정리한다.

4. 계획을 generic default와 비교해 자체 critique한다.
   warm cream + serif + terracotta, black + acid accent, broadsheet hairline layout 같은 AI default가 brief 없이 반복되는지 점검한다.

5. generic해 보이는 부분은 구현 전에 수정한다.
   무엇을 바꿨고 왜 바꿨는지 내부적으로 확인한 뒤 code를 작성한다.

6. 구현 중에도 selector specificity, spacing, type scale, responsive behavior, keyboard focus, reduced motion을 고려한다.

7. build 후 screenshot이 가능하면 직접 critique한다.
   signature element는 하나에 집중하고 주변 장식은 절제한다.

## 핵심 규칙

- subject를 모르면 먼저 구체화한다.
- hero는 페이지의 thesis여야 한다.
- typography는 personality를 운반해야 하며 기본 폰트 조합으로 끝내지 않는다.
- structural marker는 장식이 아니라 정보 구조를 encode해야 한다.
- animation은 subject를 돕는 경우에만 쓴다.
- boldness는 한 곳에 집중한다.
- copy 역시 design material이므로 UI 용어는 사용자가 이해하는 행동 중심으로 쓴다.

## 산출물 특성

- subject-specific visual direction
- palette, typography, layout, signature element가 명확한 frontend
- 템플릿 감이 덜한 hero/section/UI
- responsive, accessible, content-aware interface

## 주의점

- 사용자가 명시한 시각 방향이 있으면 그 brief가 우선이다.
- “01/02/03” 같은 numbering은 실제 sequence일 때만 의미가 있다.
- 과도한 centered layout, 흔한 gradient, generic SaaS card 반복은 피해야 한다.
- copy가 generic하면 디자인도 generic하게 보인다.
