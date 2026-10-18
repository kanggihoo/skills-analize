# algorithmic-art 분석

## 원본

- 원본 경로: `.agents/skills/algorithmic-art/`
- 핵심 파일: `SKILL.md`
- 보조 파일: `templates/viewer.html`, `templates/generator_template.js`, `LICENSE.txt`
- 확인한 규모: 4개 파일, 약 1,429줄
- 성격: p5.js 기반 생성 예술을 만드는 창작형 스킬

## 적용 조건

사용자가 코드 기반 예술, generative art, algorithmic art, flow field, particle system, seeded randomness, interactive parameter exploration을 요청할 때 사용한다.

이 스킬은 기존 작가의 스타일을 복제하지 않고, 사용자의 요청에서 은근한 conceptual seed를 추출해 독창적인 algorithmic philosophy와 p5.js artifact로 표현하도록 설계되어 있다.

## 동작 과정

1. 사용자의 요청에서 미묘한 개념적 실마리를 찾는다.
   요청을 문자 그대로 시각화하기보다, 알고리즘 내부에 숨어 있는 “quiet conceptual DNA”로 바꾼다.

2. 먼저 `Algorithmic Philosophy` Markdown을 만든다.
   1-2단어의 movement name을 정하고, 4-6문단으로 계산 과정, emergent behavior, randomness, particle dynamics, field dynamics, temporal evolution을 설명한다.

3. 철학 문서 안에는 반복적으로 craftsmanship 기준을 박아 넣는다.
   결과 알고리즘이 “수많은 반복과 정교한 최적화를 거친 master-level implementation”처럼 보여야 한다는 요구가 핵심이다.

4. 구현 전에 반드시 `templates/viewer.html`을 읽는다.
   이 파일은 단순 참고가 아니라 literal starting point다.

5. `viewer.html`의 고정 영역은 유지한다.
   Anthropic branding, Poppins/Lora font, light color system, sidebar layout, seed controls, actions section은 그대로 둔다.

6. variable 영역만 교체한다.
   p5.js algorithm, `params` object, parameter controls, optional color controls를 해당 artwork에 맞게 바꾼다.

7. p5.js 구현은 seeded randomness를 사용한다.
   `randomSeed(params.seed)`와 `noiseSeed(params.seed)`를 통해 같은 seed가 같은 결과를 내야 한다.

8. seed navigation과 parameter controls가 동작해야 한다.
   previous, next, random, jump-to-seed, regenerate, reset, download PNG 같은 interaction을 유지한다.

9. 최종 산출물은 단일 self-contained HTML artifact다.
   p5.js CDN 외에는 외부 파일 없이 HTML 안에 알고리즘과 UI를 모두 포함한다.

## 보조 파일 역할

- `templates/viewer.html`: 실제 interactive artifact의 기반 템플릿이다. Anthropic 브랜드 스타일, sidebar, seed UI, parameter UI, action buttons, 기본 p5.js scaffold를 포함한다.
- `templates/generator_template.js`: p5.js 구현 원칙 예시다. `params` object, seeded randomness, `setup`/`draw`, class structure, utility functions, parameter update, export function의 구조를 보여준다.

## 핵심 규칙

- static image가 아니라 살아 있는 algorithmic system을 만든다.
- philosophy 먼저, code 구현은 그 다음이다.
- template HTML을 처음부터 다시 만들면 안 된다.
- seed reproducibility는 필수다.
- parameter는 “패턴 종류”가 아니라 시스템의 조절 가능한 속성에서 나온다.
- UI 구조와 Anthropic branding은 유지하고, 알고리즘과 조절 항목만 작품마다 바꾼다.
- 결과는 독창적이어야 하며 기존 작가의 스타일을 복제하면 안 된다.

## 산출물 특성

- algorithmic philosophy `.md`
- self-contained p5.js `.html`
- 필요 시 generative algorithm `.js` 참고 구조
- seed와 parameter로 변형을 탐색할 수 있는 interactive artwork

## 주의점

- visual artifact를 HTML from scratch로 만들면 스킬 지시를 어기는 것이다.
- flow field 예제를 그대로 복사하면 안 된다. 철학이 요구하는 알고리즘을 새로 설계해야 한다.
- “미묘한 reference”는 노골적으로 드러내지 않고 알고리즘의 구조, 파라미터, emergence 안에 숨긴다.
- artifact가 브라우저와 claude.ai artifact에서 바로 실행되어야 한다.
