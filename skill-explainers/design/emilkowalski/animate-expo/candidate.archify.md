# animate-expo — Expo·React Native 애니메이션을 UI 스레드 중심으로 구현하는 스킬 {#overview}

`animate-expo`는 에이전트가 React Native와 Expo 앱에서 빈도·목적 관문을 통과한 애니메이션만 골라 UI 런타임 위주로 구현하고 기기 검증 지점을 짚게 하는 스킬이다.[](source:s-fm)[](source:s-hard)

- Expo 앱에 제스처, 시트, 화면 전환, 누름 피드백, 햅틱, 끊기는 모션 수정을 요청할 때 켜진다. 질문 없이 처음 불리면 고정 문구 한 줄만 답하고 기다린다.[](source:s-fm)[](source:s-init)
- 결과로 Reanimated, Gesture Handler, Expo Router, `expo-haptics` 기반 코드와 짧은 요약(관문 결과·적용 재료·실기기 느낌 확인 대상)이 남는다.[](source:s-fm)[](source:s-out)
- 웹 모션 설계는 `animate`, 웹 성능 진단은 `animation-performance`, 모바일 웹 CSS 수정은 `mobile-native`가 맡는다(모두 대안).[](source:s-fm)[](source:rel-anim)[](source:rel-perf)[](source:rel-mob)
- 하지 않는 것: 선택지 메뉴를 제시하지 않고, `PanResponder`나 코어 `Animated`·`runOnJS`·프레임당 `setState`를 쓰지 않으며, 시뮬레이터나 Expo Go만으로 느낌을 판정하지 않는다.[](source:s-posture)[](source:s-never)

@answer scope="design/emilkowalski/animate-expo · 원본 파일 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source s-fm title="frontmatter: name과 description" path=design/emilkowalski/animate-expo/SKILL.md lines=1:4
@source s-init title="초기 응답과 모바일 3대 차이" path=design/emilkowalski/animate-expo/SKILL.md lines=8:23
@source s-posture title="작업 태도와 두 가지 실패 유형" path=design/emilkowalski/animate-expo/SKILL.md lines=24:32
@source s-hard title="필수 규칙 5가지" path=design/emilkowalski/animate-expo/SKILL.md lines=33:40
@source s-freq title="1단계: 빈도 관문과 탭 전환 규칙" path=design/emilkowalski/animate-expo/SKILL.md lines=43:54
@source s-purpose title="2단계: 목적 이름 붙이기" path=design/emilkowalski/animate-expo/SKILL.md lines=56:60
@source s-tool title="3단계: 도구와 Expo 패키지 선택" path=design/emilkowalski/animate-expo/SKILL.md lines=62:95
@source s-props title="4단계: 속성 규칙" path=design/emilkowalski/animate-expo/SKILL.md lines=96:105
@source s-timing title="5단계: timing과 spring 규칙" path=design/emilkowalski/animate-expo/SKILL.md lines=106:150
@source s-thread title="6단계: JS 스레드 분리 규칙" path=design/emilkowalski/animate-expo/SKILL.md lines=151:160
@source s-press title="7단계: hover 대신 누름 피드백" path=design/emilkowalski/animate-expo/SKILL.md lines=161:170
@source s-haptics title="8단계: 햅틱 시점과 규칙" path=design/emilkowalski/animate-expo/SKILL.md lines=171:189
@source s-a11y title="9단계: reduced motion과 글꼴 확대" path=design/emilkowalski/animate-expo/SKILL.md lines=190:205
@source s-setup title="무음 실패를 막는 설정과 120fps" path=design/emilkowalski/animate-expo/SKILL.md lines=206:224
@source s-recipes title="레시피 안내" path=design/emilkowalski/animate-expo/SKILL.md lines=225:227
@source s-never title="Never Ship 17항목" path=design/emilkowalski/animate-expo/SKILL.md lines=229:250
@source s-out title="출력 형식과 어조" path=design/emilkowalski/animate-expo/SKILL.md lines=251:263
@source r-setup title="레시피 공통 설정과 Gesture Handler v3" path=design/emilkowalski/animate-expo/RECIPES.md lines=1:63
@source r-helpers title="모멘텀 투영과 rubber-banding worklet" path=design/emilkowalski/animate-expo/RECIPES.md lines=66:84
@source rel-anim title="animate 소개" path=design/emilkowalski/animate/SKILL.md lines=1:20
@source rel-perf title="animation-performance 소개" path=design/emilkowalski/animation-performance/SKILL.md lines=1:20
@source rel-mob title="mobile-native 소개" path=design/emilkowalski/mobile-native/SKILL.md lines=1:20

## 어떻게 동작하나 {#flow span=12}

9단계 구현 순서와 설정·`Never Ship` 점검을 3개 국면으로 묶었다. 구현 전 `빈도·목적 통과?`에서 탈락하면 코드를 쓰지 않고 끝난다.[](source:s-freq)

@workflow id=flow-diagram title="animate-expo 흐름"
| lane gate | 관문 판단 |
| lane core | 도구와 런타임 설계 |
| lane check | 설정·점검·출력 |
| ask | 구체적 질문 있나? | backend | gate | source:s-init |
| greet | 고정 문구 후 대기 | external | gate | source:s-init |
| freq | 빈도·목적 통과? | backend | gate | source:s-freq |
| noanim | 모션 없이 대안 제시 | external | gate | source:s-freq |
| tool | 도구·패키지 선택 | backend | core | source:s-tool |
| prop | 속성·타이밍·spring | backend | core | source:s-props |
| thread | UI 스레드·누름·햅틱 | backend | core | source:s-thread |
| setup | 접근성·설치·120fps 확인 | backend | check | source:s-a11y |
| never | Never Ship 점검 | backend | check | source:s-never |
| deliver | 코드·실기기 확인 출력 | backend | check | source:s-out |
| ask > greet | 없음 |
| ask > freq | 있음 |
| freq > noanim | 거절 |
| freq > tool | 통과 |
| tool > prop | |
| prop > thread | |
| thread > setup | |
| setup > never | |
| never > deliver | emphasis |

@steps id=flow-steps
| s-ask | 구체적 질문 있나? | **입력** 사용자 호출과 요청 문구 · **출력** 질문 유무 판단. **처리** 에이전트가 구체적인 모바일 애니메이션 질문 없이 처음 불렸는지 확인한다.[](source:s-init) | flow-diagram | ask |
| s-greet | 고정 문구 후 대기 | **입력** 질문 없는 초기 호출 · **출력** Emil Kowalski 철학 준비 문구 한 줄. **처리** 고정 문구만 출력하고 사용자가 질문을 보낼 때까지 기다린다.[](source:s-init) | flow-diagram | greet |
| s-freq | 빈도·목적 통과? | **입력** 대상 UI와 사용 빈도 · **출력** 빈도 등급과 목적 이름 하나. **처리** 하루 100회 이상 쓰는 동작(탭 전환, 키보드 여닫기, 설정 토글)은 모션을 빼고 6가지 목적 중 하나를 정한다.[](source:s-freq)[](source:s-purpose) **다음** 탭 전환에는 `animation: 'none'`을 두고 슬라이드시키지 않는다.[](source:s-freq) | flow-diagram | freq |
| s-noanim | 모션 없이 대안 제시 | **입력** 거절된 요청과 이유 · **출력** 거절 사유와 기본 동작 안내. **처리** 관문을 넘지 못한 이유를 말하고 애니메이션 코드를 작성하지 않는다.[](source:s-posture)[](source:s-freq) | flow-diagram | noanim |
| s-tool | 도구·패키지 선택 | **입력** 상태·제스처·화면 전환 요구 · **참조** `RECIPES.md` · **실행** `npx expo install <package>`(의존성 필요 시) · **출력** 가장 단순한 도구와 설치 패키지. **처리** Reanimated CSS transition·애니메이션, Layout 애니메이션, `useSharedValue`+`Gesture`, Expo Router 네이티브 스택(`formSheet`, `NativeTabs` 등), Lottie, Skia 순으로 고르고 `npm install` 대신 `npx expo install`을 쓴다.[](source:s-tool) **다음** 제스처가 없으면 공유 값을 쓰지 않고, 해당 패턴이 있으면 레시피부터 적응시킨다.[](source:s-tool)[](source:s-recipes) | flow-diagram | tool |
| s-prop | 속성·타이밍·spring | **입력** 선택한 도구와 대상 요소 · **참조** `RECIPES.md` · **출력** 속성 배열과 `spring` 또는 `Easing.bezier` 설정. **처리** `transform`과 `opacity`만 쓰고 `scale(0)`과 `Easing.in`을 피하며, 손가락이 닿는 드래그·튕기기는 `duration`+`dampingRatio` 형태의 `spring`, 그 외는 300ms 미만 타이밍을 고른다.[](source:s-props)[](source:s-timing) **다음** `transform` 배열은 이동 뒤 크기 순서를 지키고, Android `elevation`이나 `BlurView` 강도는 직접 애니메이션하지 않는다.[](source:s-props) | flow-diagram | prop |
| s-thread | UI 스레드·누름·햅틱 | **입력** 제스처·스크롤·누름·햅틱 요구 · **참조** `RECIPES.md` · **출력** UI 런타임 `worklet`과 누름·햅틱 코드. **처리** 핸들러 안에서 `setState`나 매 프레임 `scheduleOnRN`을 금지하고 `.get()`·`.set()`과 `'worklet'` 지시어를 지키며, hover 대신 누름 피드백(`scale: 0.97`, 44×44pt 터치 영역)과 같은 프레임의 햅틱을 맞춘다.[](source:s-thread)[](source:s-press)[](source:s-haptics) **다음** 경계 저항에는 `rubber-banding`(끝에서 넘어갈수록 커지는 저항)과 모멘텀 투영(`project`)을 쓰고, Gesture Handler v3 여부도 확인한다.[](source:r-setup)[](source:r-helpers) | flow-diagram | thread |
| s-setup | 접근성·설치·120fps 확인 | **입력** 구현 코드와 Expo 설정 · **출력** `prefers-reduced-motion` 처리와 앱 래퍼·plist 점검. **처리** `useReducedMotion`·`ReduceMotion.System`과 `onLayout` 글꼴 확대 대응을 넣고, `GestureHandlerRootView` 래핑, New Architecture, iOS `CADisableMinimumFrameDurationOnPhone`(120fps, 8ms 프레임 예산) 설정을 확인한다.[](source:s-a11y)[](source:s-setup) | flow-diagram | setup |
| s-never | Never Ship 점검 | **입력** 완성된 코드와 설정 · **출력** 17개 금지 기준 통과 여부. **처리** `PanResponder`, `runOnJS`, 렌더 중 공유 값 읽기·쓰기, 가상화 리스트 행의 `entering`, 거리만 보는 닫기 임계값 등 17개 금지 항목이 없는지 점검한다.[](source:s-never) | flow-diagram | never |
| s-deliver | 코드·실기기 확인 출력 | **입력** 점검 통과 코드 · **출력** 구현 코드, 짧은 요약, 실기기 느낌 확인 목록. **처리** 코드를 내보낸 뒤 관문 결과와 사용 재료(도구·속성·spring/커브·스레드)를 각 한 줄로 적고, 지원하는 가장 느린 Android·iOS 릴리즈 빌드에서 확인할 항목을 적는다.[](source:s-hard)[](source:s-out) | flow-diagram | deliver |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description). Expo·React Native 모션, 제스처, 시트, 화면 전환, 햅틱, 실기기 끊김 해결 요청에서 켜진다. 호출 제한 필드는 frontmatter에 없다.[](source:s-fm) |
| 성격 | 모바일 환경 제약(hover 없음·이중 런타임·직접 터치)에 맞춰 UI 스레드 중심 Reanimated 코드를 구현하는 절차형 스킬이다.[](source:s-init) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `animate` {#rel-r18} | **이 스킬** | 대안 | 역할 경계: 웹이 아니라 React Native/Expo 애니메이션이면 `animate-expo`를 사용한다(사용자 선택).[](source:rel-anim)[](source:s-fm) |
| **이 스킬** {#rel-r20} | `animate` | 대안 | 역할 경계: 웹 애니메이션은 `animate`를 사용한다(사용자 선택).[](source:s-fm)[](source:rel-anim) |
| `animation-performance` {#rel-r23} | **이 스킬** | 대안 | 역할 경계: React Native 스레드 처리는 `animate-expo`를 사용한다(사용자 선택).[](source:rel-perf)[](source:s-thread) |
| `mobile-native` {#rel-r38} | **이 스킬** | 대안 | 역할 경계: 모바일 웹이 아니라 React Native 앱이면 `animate-expo`를 사용한다(사용자 선택).[](source:rel-mob)[](source:s-fm) |

@architecture id=relation-map title="animate-expo와 이어지는 스킬"
| anim | animate | backend |
| perf | animation-performance | backend |
| mob | mobile-native | backend |
| self | animate-expo(이 스킬) | backend |
| anim > self | 대안 | dashed |
| self > anim | 대안 | dashed |
| perf > self | 대안 | dashed |
| mob > self | 대안 | dashed |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 초기 응답, 5대 규칙, 9단계 순서, 햅틱·설치·120fps, `Never Ship` 17항목 | 스킬이 켜질 때 읽는다. | 구체적 질문 있나?, 고정 문구 후 대기, 빈도·목적 통과?, 모션 없이 대안 제시, 도구·패키지 선택, 속성·타이밍·spring, UI 스레드·누름·햅틱, 접근성·설치·120fps 확인, Never Ship 점검, 코드·실기기 확인 출력 |
| `RECIPES.md` | `project`·`rubberband` worklet, 누름, 드래그 시트, 스와이프 삭제, 접히는 헤더, 리스트 등장, 키보드 동기, 탭 표시기, 화면 전환, 토스트, 임계값 반응 레시피 9종 | 요청이 해당 모바일 패턴과 맞을 때 백지 대신 시작점으로 읽는다.[](source:s-recipes) | 도구·패키지 선택, 속성·타이밍·spring, UI 스레드·누름·햅틱 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 구체적 질문 없이 스킬이 처음 켜진 경우 | 고정 문구 한 줄만 출력하고 질문이 올 때까지 멈춘다. | [](source:s-init) |
| 하루 100회 이상 동작과 탭 전환 | 애니메이션을 넣지 않고 멈춘다. 탭 전환은 슬라이드 대신 `animation: 'none'`을 둔다. | [](source:s-freq) |
| 6가지 목적 이름 중 하나를 못 붙인 경우 | 구현하지 않고 멈춘다. | [](source:s-purpose) |
| 의존성 설치 명령 선택 | `npm install` 대신 SDK 버전을 맞추는 `npx expo install`을 쓴다. | [](source:s-tool) |
| 제스처·스크롤 핸들러 내부와 렌더 도중 | `setState`, 매 프레임 `scheduleOnRN`, `runOnJS`, `PanResponder`, 렌더 중 공유 값 읽기·쓰기는 모두 금지한다. | [](source:s-thread)[](source:s-never) |
| Android `elevation`, `BlurView`, 가상화 리스트 행 | 직접 애니메이션하거나 `entering`을 달지 않는다. 정적 레이어 불투명도 전환이나 컨테이너·`itemLayoutAnimation`으로 바꾼다. | [](source:s-props)[](source:s-never) |
| 햅틱 사용 조건 | 커밋·스냅마다 한 번만, 시각 변화와 같은 프레임에 발화하며, 시각 피드백 없이 단독으로 쓰지 않는다. | [](source:s-haptics) |
| `GestureHandlerRootView`·New Architecture·120fps | 앱 루트 래핑과 Reanimated 4의 New Architecture, iOS용 `CADisableMinimumFrameDurationOnPhone` 설정을 확인한다. | [](source:s-setup) |
| 느낌과 성능 판정 시점 | Expo Go나 시뮬레이터가 아니라 지원하는 가장 느린 실기기의 릴리즈 빌드에서만 검증된 것으로 본다. | [](source:s-hard)[](source:s-setup) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- Expo 레시피 9종과 Gesture Handler v3 대응 — 도구·패키지 선택 · `project()`/`rubberband()` worklet, 드래그 시트, `ReanimatedSwipeable` 기준, `KeyboardProvider`, Android `formSheet` 4대 제약을 뺐다.
- 도구·패키지 표와 `spring`·커브·햅틱 매핑 — 속성·타이밍·spring · 13행 도구 선택표, `dampingRatio` 표, 4종 햅틱 API 표를 개요에서 요약했다.
- `Never Ship` 17항목 전체 대조표 — Never Ship 점검 · 금지 항목과 대체 구현 17짝을 개요에서 줄였다.

@callout level=open-question title="확인하지 못한 것"
| `review-animations`처럼 `animate-expo` 전용 리뷰 스킬이나 `choreograph`가 존재하는지는 저장소에 없어 확인하지 못했다. |
| 코드 분석만 수행했으므로 120fps·Android 실기기 릴리즈 빌드에서의 실제 프레임 시간은 실행으로 확인하지 않았다. |

읽은 원본: 텍스트 파일 2개. 제외: `SKILL.ko.stale.md`, `RECIPES.ko.stale.md`(낡은 번역본이라 읽지 않음).
