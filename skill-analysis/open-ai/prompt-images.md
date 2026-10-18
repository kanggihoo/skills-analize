# prompt-images 분석

## 원본

- 원본 경로: `.agents/skills/prompt-images/`
- 핵심 파일: `SKILL.md`
- 확인한 규모: 1개 파일, 약 207줄
- 성격: Replicate 이미지 모델을 대상으로 한 prompt 작성 원칙을 정리한 지식형 스킬

## 적용 조건

이 스킬은 이미지 모델 prompt를 작성하거나, 이미지 생성 기능을 설계하거나, Replicate 이미지 모델을 선택해 실행하려는 작업에서 동작한다.

대표 요청은 다음과 같다.

- 이미지 생성 prompt를 잘 써줘
- Replicate 이미지 모델 prompt를 작성해줘
- 이미지 편집 prompt를 개선해줘
- product photography, text rendering, style transfer, character consistency prompt 전략이 필요함
- 이미지 생성 feature를 만들기 위한 prompt pattern이 필요함

## 핵심 전제

이 스킬은 특정 모델 이름을 기억에 의존해 고르지 말라고 한다. 이미지 모델 환경은 자주 바뀌므로, 모델 선택은 별도 `find-models` 스킬과 Replicate API 조회를 통해 현재 schema를 확인해야 한다.

즉 이 스킬은 “어떤 모델이 최신인가”보다 “이미지 모델에게 어떻게 명확히 지시할 것인가”에 집중한다.

## 동작 과정

1. 이미지 작업의 목적을 파악한다.
   사진, 제품 사진, 텍스트 렌더링, style transfer, character consistency, editing, storyboard, product/commercial work 등으로 나눈다.

2. 모델 선택이 필요하면 현재 Replicate API를 조회해야 한다고 판단한다.
   이 스킬 자체는 model catalog를 고정하지 않는다.

3. prompt를 keyword list가 아니라 자연어 문장으로 작성한다.
   최신 image model은 문법과 context를 잘 이해하므로 comma-separated tag보다 구체적인 문장이 유리하다는 원칙을 따른다.

4. 색상, 재질, 조명, 카메라, 공간 관계를 구체화한다.
   “멋지게” 같은 추상 표현보다 “overcast sky, flat diffused light, tilt-shift lens effect”처럼 관찰 가능한 조건을 적는다.

5. 피사체는 대명사 대신 직접 명명한다.
   “the woman with short black hair”, “the red car”처럼 ambiguity를 줄인다.

6. 복잡한 장면은 긴 prompt를 허용하되 누락 가능성을 고려한다.
   많은 조건을 넣을 수 있지만, 조건이 많을수록 일부가 빠질 수 있음을 전제로 iteration한다.

7. 이미지 편집에서는 바꿀 것과 유지할 것을 동시에 명시한다.
   “replace background”만 쓰지 않고 subject position, lighting, camera angle, framing, perspective 보존을 함께 적는다.

8. 결과를 보고 작은 변경 단위로 반복한다.
   한 번에 모든 것을 고치기보다 작게 수정하고 검증하는 흐름을 권장한다.

## 세부 prompt 원칙

### 사진 언어

사진형 결과에는 다음 요소를 적극 사용한다.

- camera/lens: 50mm, 85mm, wide-angle, macro
- film stock: Kodak Portra, Fuji Velvia, Ilford HP5
- depth of field: shallow, deep
- shooting time: golden hour, blue hour
- lighting: Rembrandt, soft diffused studio, rim light, flat diffused, volumetric
- composition: rule of thirds, centered, symmetry, high angle, low angle, bird's-eye view

### 텍스트 렌더링

이미지 안 텍스트는 다음 방식으로 작성한다.

- 원하는 문구를 큰따옴표 안에 넣는다.
- “Change 'old text' to 'new text'” 같은 편집 패턴을 사용한다.
- 글자 수 차이가 크면 layout이 바뀔 수 있음을 고려한다.
- typography와 placement를 명시한다.
- 복잡한 typography는 모델 선택이 중요하다.

### 스타일 전환

style transfer에서는 스타일 이름만 쓰지 않고 스타일의 시각적 특징도 설명한다.

- visible brushstrokes
- thick paint texture
- rich color depth
- keep original composition
- reference image가 가능하면 palette, texture, composition, mood를 설명한다.

### 캐릭터 일관성

동일 캐릭터 유지가 어렵다는 전제를 둔다.

- 얼굴, 머리, 눈, 의상 등 reference description을 고정한다.
- 바뀌는 것과 유지할 것을 나눈다.
- reference image를 지원하는 모델을 활용한다.
- 복잡한 변화는 outfit 변경, scene 변경처럼 단계로 나눈다.

## 핵심 규칙

- 이미지 모델 선택은 기억이 아니라 현재 API와 schema 확인에 기반해야 한다.
- prompt는 keyword list보다 자연어 문장으로 작성한다.
- 색상, 재질, 조명, 카메라, 공간 관계를 구체적으로 적는다.
- 대명사 대신 피사체를 직접 지칭한다.
- 편집 요청에는 바꿀 대상과 유지할 대상을 함께 적는다.
- 복잡한 결과는 한 번에 해결하려 하지 않고 작은 변경 단위로 반복한다.
- 모델이 지원하지 않는 negative prompt나 parameter를 가정하지 않는다.

## 흔한 실패와 대응

이 스킬은 다음을 대표적인 pitfall로 본다.

- keyword-stuffed prompt 사용
- 작은 edit에 “transform” 같은 과도한 동사 사용
- 유지해야 할 요소를 적지 않음
- negative prompt를 지원하지 않는 모델에 negative prompt를 넣음
- guidance scale을 과도하게 올림
- 이미지 모델에 실시간 지식을 기대함
- 복잡한 장면에 너무 짧은 prompt 사용
- aspect ratio와 권장 해상도 무시
- 작업에 맞지 않는 모델 선택
- iteration 없이 한 번에 끝내려 함

## 산출물 특성

이 스킬 자체는 이미지를 생성하지 않고 prompt 전략을 산출한다. 결과물은 보통 다음과 같다.

- 개선된 이미지 prompt
- edit prompt의 invariant 목록
- model selection 시 API 조회가 필요하다는 판단
- text rendering, style transfer, product photography 등 작업 유형별 prompt guide

## 주의점

- 이 스킬은 Replicate 중심 prompt 지식이다. OpenAI built-in `image_gen` 실행 규칙은 `imagegen` 스킬이 담당한다.
- 모델 선택은 기억에 의존하지 않고 현재 API schema를 확인해야 한다.
- background reading에 2024-2026 Replicate blog 글들이 언급되어 있지만, 블로그의 특정 모델 상태를 현재 사실로 고정하면 안 된다.
- 이 스킬은 prompt quality를 높이는 역할이지, 배포나 파일 저장 정책을 정하는 역할은 아니다.
