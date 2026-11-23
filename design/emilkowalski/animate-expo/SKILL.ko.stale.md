---
name: animate-expo
description: React Native와 Expo 앱의 애니메이션을 직접 구현합니다. 애니메이션이 필요한지, 어느 스레드에서 실행할지, 어떤 속성을 사용할지, 스프링과 타이밍 중 무엇을 택할지, 제스처의 속도를 어떻게 넘길지, 성능이 떨어질 때 어떻게 처리할지를 순서대로 판단합니다. Reanimated, Gesture Handler, Expo Router, expo-haptics를 사용해 구현합니다. Expo 앱에서 애니메이션이나 제스처, 시트, 화면 전환, 누름 피드백, 햅틱을 만들거나 실기기에서 끊기는 움직임을 고칠 때 사용합니다. 웹 애니메이션에는 `animate`를 사용합니다.
---

# Expo 애니메이션 구현

## 첫 응답

별도의 질문 없이 이 스킬이 처음 호출되면 아래 문장만 응답합니다.

> I'm ready to build animations in Expo and React Native that feel right on a real device, my knowledge comes from Emil Kowalski's animation philosophy.

사용자가 질문할 때까지 다른 정보를 덧붙이지 않습니다.

이 스킬은 React Native 애니메이션을 구현합니다. 움직임 요청을 실제 기기의 엄격한 검토를 통과할 수 있는 코드로 바꿉니다. 시뮬레이터나 개발 모드의 최신 고급 기기에서만 잘 돌아가는 구현은 기준에 맞지 않습니다.

모바일에서는 애니메이션을 다루는 방식이 세 가지 달라집니다. 이 스킬의 원칙은 모두 이 차이에서 출발합니다.

1. **호버가 없습니다.** 웹에서 호버로 제공하던 신호는 누름 상태나 배치로 옮기거나, 아예 없애야 합니다.
2. **런타임이 두 개입니다.** Reanimated 4의 Worklets가 이 구분을 드러냅니다. React 렌더링과 앱 로직은 React Native 런타임에서 실행되고, 워클릿은 매 프레임 UI 런타임에서 실행됩니다(백그라운드 작업용 워커 런타임도 선택적으로 쓸 수 있습니다). 애니메이션이 RN 런타임에 의존하면 앱이 다른 작업을 하는 순간 끊깁니다. 움직임을 UI 런타임에 유지하는 것이 핵심입니다.
3. **사용자의 손가락이 요소에 닿아 있습니다.** 제스처가 주요 입력 방식이므로 움직임을 중단할 수 있어야 하고 손가락의 속도가 자연스럽게 이어져야 합니다. 이것들은 다듬기 위한 부가 기능이 아니라 기본 요건입니다.

## 작업 방식

직접 애니메이션을 구현하는 시니어 모바일 엔지니어로 행동합니다. 판단을 내리고 이유를 한 줄로 설명한 뒤 코드를 작성합니다. 움직임 선택지를 메뉴처럼 나열하지 않습니다.

실패는 두 가지 방식으로 나타나며, 첫 번째가 더 심각합니다.

1. **애니메이션할 이유가 없는 대상에 움직임을 넣는 경우.** 아래 판단 기준에 따라 코드가 한 줄도 나오지 않을 수 있습니다.
2. **맞는 대상이라도 잘못된 스레드에서 애니메이션하는 경우.** 프레임마다 `setState`를 하거나 `PanResponder`를 사용하거나 `height`를 움직이는 경우입니다. 개발 모드의 최신 휴대폰에서는 괜찮아 보여도 3년 된 Android 기기에서는 20fps까지 떨어질 수 있습니다.

## 반드시 지킬 규칙

1. **정해진 순서대로 판단합니다.** 1단계와 2단계를 통과해야 다음으로 넘어갑니다.
2. **코어 `Animated` 대신 Reanimated를 사용합니다.** 코어 `Animated`를 제스처로 제어하려면 브리지를 건너야 하고, `useNativeDriver`도 transform과 opacity만 지원합니다. Reanimated 워클릿은 UI 스레드에서 계속 실행되므로 JS가 바쁜 동안에도 움직임을 유지합니다.
3. **값을 짐작해 정하지 않습니다.** 곡선과 스프링 설정은 아래 표의 값을 사용합니다.
4. **움직임 줄이기 설정도 애니메이션과 함께 구현합니다.** 나중으로 미루지 않습니다.
5. **지원 대상 중 가장 느린 기기의 릴리스 빌드에서 느낌을 확인합니다.** 다른 환경에서의 확인은 검증으로 보지 않습니다.

## 구현 순서

### 1. 애니메이션이 필요한가?

| 빈도 | 결정 |
| --- | --- |
| 하루 100회 이상 — 탭 전환, 키보드 열기/닫기, 스크롤, 설정의 토글 | **애니메이션하지 않습니다.** 플랫폼 기본 동작을 쓰거나 그대로 둡니다. 여기서 멈춥니다. |
| 하루 수십 회 — 누름 피드백, 목록 이동, 행 선택 | 거의 알아차리지 못할 정도만 허용합니다. 150ms 미만 또는 없음 |
| 가끔 — 시트, 모달, 토스트, 온보딩 단계 | 표준 애니메이션 |
| 드물거나 처음 한 번 — 성공 상태, 빈 상태 일러스트, 축하 | 사용자의 즐거움을 위한 움직임은 이때만 허용합니다. |

**탭 전환에는 슬라이드를 쓰지 않습니다.** 탭은 같은 계층의 동등한 항목입니다. 슬라이드는 실제로 없는 깊이감을 암시하고, 사용자는 한 세션에서 이를 수십 번 겪습니다. `animation: 'none'`을 지정합니다.

이 기준에 맞지 않는 요청이라면 그 이유를 설명하고 애니메이션 코드는 작성하지 않습니다.

### 2. 목적을 정합니다

계속하기 전에 목적을 하나로 정합니다. **피드백**, **공간적 일관성**, **상태 표시**, **갑작스러운 변화 완화**, **설명**, 또는 드문 상황에서만 허용되는 **즐거움(delight)** 중 하나입니다.

목적을 정할 수 없다면 애니메이션하지 않습니다.

### 3. 도구 선택 — 필요한 기능을 가장 간단하게 구현할 도구

표를 위에서부터 살펴보고 요구에 맞는 첫 번째 도구를 선택합니다.

| 필요 | 도구 |
| --- | --- |
| 제스처 없이 상태 변화로 제어 — 누름, 토글, 색상, 값 전환 | **Reanimated CSS 트랜지션** (스타일의 `transitionProperty`) |
| 반복, 여러 단계로 구성된 동작, 상태 변화 없이 마운트 시 재생 | **Reanimated CSS 애니메이션** (`animationName` 키프레임) |
| 요소가 마운트되거나 제거될 때, 또는 목록이 재배치될 때 | **레이아웃 애니메이션** (`entering` / `exiting` / `itemLayoutAnimation`) |
| 손가락으로 조작하거나 스크롤 위치에 따라 움직이는 요소 | **`useSharedValue` + `Gesture` + `useAnimatedStyle`** |
| 화면 간 이동 | **Expo Router 네이티브 스택 옵션.** 직접 구현하지 않습니다 |
| 별도 화면으로 동작하는 바텀 시트 | **`presentation: 'formSheet'`** — 네이티브 UISheetPresentationController를 그대로 사용합니다 |
| 탭 바 | **`NativeTabs`** (`expo-router/unstable-native-tabs`에서) — 동작과 전환을 포함한 플랫폼의 실제 탭 바입니다 |
| 컨텍스트 메뉴, 길게 눌러 미리보기 | **`Link.Menu` / `Link.Preview`** (Expo Router, iOS 전용) — JS로 재구현하지 말고 네이티브 메뉴와 미리보기를 씁니다 |
| 큰 제목 형태로 접히는 헤더 | 네이티브 스택의 **`headerLargeTitleEnabled`** (iOS 전용; `headerLargeTitle`은 deprecated) — 스크롤 워클릿으로 만들지 않습니다 |
| 당겨서 새로고침 | **`RefreshControl`** — 앱을 대표하는 고유 동작일 때만 직접 구현합니다(임계값 레시피 참고) |
| 키보드에 맞춰 움직이는 UI | **`react-native-keyboard-controller`** — 실제 키보드 위치를 프레임마다 UI 스레드에서 읽습니다 |
| 벡터 일러스트, 축하 장면, 빈 상태 그래픽 | **Lottie** — 일러스트에만 쓰고 UI 상태 표현에는 쓰지 않습니다 |
| 규모가 큰 애니메이션 장면, 자유 형식 드로잉 | **`@shopify/react-native-skia`** — 뷰 계층이 병목일 때 사용할 캔버스입니다 |

값이 연속적으로 변하거나 움직임을 중단할 수 있을 때만 공유 값을 사용합니다. 누름 효과에는 CSS 트랜지션을, 드래그에는 공유 값을 씁니다. 두 상태만 오가는 토글에 워클릿을 도입하는 것은 페이드 하나 때문에 모션 라이브러리를 설치하는 것과 다르지 않습니다.

**의존성 설치.** `npx expo install <package>`를 사용합니다. 프로젝트 SDK와 호환되는 버전을 선택해 주지만, 일반 `npm install`은 그렇지 않습니다.

| 필요 | 패키지 |
| --- | --- |
| 애니메이션 | `react-native-reanimated` + `react-native-worklets` |
| 제스처 | `react-native-gesture-handler` |
| 내비게이션, 시트, 네이티브 탭, 메뉴 | `expo-router` |
| 햅틱 | `expo-haptics` |
| 키보드를 따르는 UI | `react-native-keyboard-controller` (루트에 `KeyboardProvider` 필요 — 키보드 레시피 참고) |
| 일러스트, 축하 | `lottie-react-native` |
| 매우 큰 애니메이션 장면, 커스텀 드로잉 | `@shopify/react-native-skia` |

### 4. 속성 선택

- **`transform`과 `opacity`는 레이아웃을 다시 계산하지 않습니다.** 그 밖의 속성은 레이아웃 패스를 유발합니다. `width`, `height`, `margin`, `padding`, `flex`, `top`, `left`, `gap`은 매 프레임 해당 노드*뿐 아니라 형제 노드*에 대해서도 Yoga를 다시 실행합니다.
- **예외는 자식이 없는 절대 위치 요소입니다.** 탭 표시기나 진행 막대 채움처럼 레이아웃 흐름에서 분리된 요소는 다른 항목을 밀어내지 않습니다. 이런 경우 `width`를 애니메이션해도 되고, `scaleX`처럼 모서리 반경이 찌그러지지도 않습니다.
- **`scale(0)`으로 시작하지 않습니다.** `scale(0.9–0.97)`과 `opacity: 0`을 사용합니다. 실제 사물이 무에서 갑자기 생겨나지는 않습니다.
- **`transform`은 배열이고 순서에 따라 결과가 달라집니다.** `[{ translateY }, { scale }]`은 먼저 이동한 뒤 확대/축소합니다. 순서를 바꾸면 이동량에도 스케일이 적용됩니다. 이동량을 그대로 유지하려면 translate를 앞에 둡니다.
- **Android의 그림자는 `elevation`으로 표현하며, 이를 움직이면 프레임마다 그림자를 다시 그립니다.** 그림자가 이미 적용된 레이어의 opacity를 바꾸세요.
- **`BlurView`의 intensity는 애니메이션하지 않습니다.** Android에서 매 프레임 블러를 다시 렌더링하기 때문입니다. 대신 고정된 `BlurView`의 opacity를 크로스페이드하세요.
- **`translate`는 퍼센트 값을 지원하며 기준은 요소 자신의 크기입니다.** `translateY('100%')`를 적용하면 콘텐츠 구성에 관계없이 시트 높이만큼 이동합니다.

### 5. 타이밍과 스프링 중 선택

**손가락이 움직임에 관여했다면 스프링을 사용합니다.** 스프링은 중단되어도 속도를 이어가지만, 타이밍 곡선은 새로 시작합니다. 나머지에는 타이밍을 적용합니다.

Reanimated의 스프링은 Apple이 디자이너용으로 만든 두 매개변수를 직접 받습니다. mass/stiffness/damping 설정 대신 아래 형식을 사용하세요.

| 인터랙션 | 설정 |
| --- | --- |
| 기본 정착, 오버슈트 없음 | `{ duration: 400, dampingRatio: 1 }` |
| 드래그 후 제자리로 복귀 / 스냅백 | `{ duration: 400, dampingRatio: 0.8, velocity }` |
| 시트, 드로어 | `{ duration: 300, dampingRatio: 0.8, velocity }` |
| 단단한 가장자리를 넘으면 안 될 때 | `overshootClamping: true` 추가 |

**제스처에 관성이 실린 경우에만 바운스를 줍니다.** 서서히 나타나는 메뉴가 지나치게 튀면 어색하지만, 손가락으로 튕긴 카드가 조금 튀는 것은 자연스럽습니다.

손가락 제스처가 관여하지 않는 움직임에는 다음 **이징**을 사용합니다.

| 상황 | 이징 |
| --- | --- |
| 등장 또는 퇴장 | `ease-out` |
| 화면에서 이동하거나 모핑 | `ease-in-out` |
| 일정한 움직임(진행, 마퀴) | `linear` |
| 기본값 | `ease-out` |

**UI에서 `ease-in`은 사용하지 않습니다.** 시작이 느려 사용자가 기다리는 순간에 반응이 늦어집니다. Reanimated의 기본 이징은 CSS 기본값처럼 충분히 강하지 않으므로 다음 곡선을 사용하세요.

```js
import { Easing } from 'react-native-reanimated';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);      // strong ease-out for UI
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);  // on-screen movement
const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1);    // iOS sheet curve
```

**지속 시간:**

| 요소 | 지속 시간 |
| --- | --- |
| 누름 피드백 | 100–150ms |
| 토글, 칩, 작은 상태 변화 | 150–200ms |
| 시트, 모달, 드로어 | 스프링, 체감상 약 300ms |
| 화면 전환 | 플랫폼 기본값 — 재정의하지 마세요 |

모바일 UI 애니메이션도 웹처럼 300ms 미만으로 제한합니다. 플랫폼 전환은 더 길 수 있습니다(iOS push는 350ms). 내비게이션은 기본값을 따르고, 다른 움직임은 그보다 빠르게 만드세요.

### 6. JS 스레드에서 실행하지 않기

여기가 모바일 애니메이션의 핵심이며 대부분의 React Native 움직임이 끊기는 원인이기도 합니다.

- **제스처나 스크롤 핸들러에서 `setState`를 호출하지 마세요.** 매 프레임 React 렌더를 유발하는 것이 RN 앱 끊김의 가장 큰 원인입니다. 공유 값과 `useAnimatedStyle`을 연결하면 React를 다시 렌더링하지 않아도 됩니다.
- **`onUpdate`나 스크롤 핸들러 안에서 RN 런타임으로 매번 되돌아가지 마세요.** `react-native-worklets`의 `scheduleOnRN(fn, ...args)`는 deprecated된 `runOnJS(fn)(...args)`를 대신하는 Reanimated 4 API입니다. RN 런타임 호출을 큐에 넣으므로 `onUpdate`에서 사용하면 초당 60–120회 호출됩니다. `onEnd`에서 한 번 호출하거나, 값이 임계값을 넘을 때 반응하는 `useAnimatedReaction` 안에서 사용하세요.
- **렌더 중에 공유 값을 읽지 마세요**(예: JSX 안의 `translateY.get()`). 값이 갱신되지 않는 스냅샷이 되어 화면과 조용히 어긋납니다. **렌더 중에 값을 쓰지도 마세요.** 재조정 중에 쓰기가 발생하고, 예상하지 못한 재렌더가 그 쓰기를 반복할 수 있습니다. 워클릿, 핸들러, 이펙트 안에서만 공유 값을 다룹니다.
- **`.value` 대신 `.get()` / `.set()`을 쓰세요.** 기능은 같지만 `.value` 직접 접근은 React Compiler가 분석하지 못합니다. Reanimated 문서도 컴파일러와 호환되는 방법으로 `get`/`set`을 권합니다. `set`에는 함수형 업데이트도 전달할 수 있습니다: `sv.set((v) => v + 1)`.
- **워클릿이 호출하는 함수는 첫 줄에 `'worklet'`을 선언해야 합니다.** 이 선언이 없으면 디버거에서는 작동하더라도 실기기에서 런타임 오류가 발생합니다.

### 7. 호버 대신 누름 상태 사용

웹에서 쓰던 호버 신호는 그대로 옮기지 말고 모바일 입력에 맞게 다시 설계합니다.

- **누르는 순간 반응하고, 손을 뗄 때 동작을 확정합니다.** 탭이 끝난 뒤에야 반응하면 인터페이스가 멈춘 듯 느껴집니다. 사용자가 체감하는 지연은 바로 이 부분입니다.
- **누를 수 있는 요소는 `Pressable`과 CSS 트랜지션으로 `scale: 0.97`을 100–150ms 적용합니다.** 라벨과 아이콘까지 함께 줄어들어 실제로 누르는 감각을 줍니다.
- **터치 영역은 최소 44×44pt**(Android는 48dp)로 설정합니다. 시각 요소가 작다면 크기는 그대로 두고 `hitSlop`으로 터치 영역을 넓힙니다.
- **`pressRetentionOffset`을 설정해 손가락이 조금 움직여도 사용자가 의도한 누름이 취소되지 않도록 합니다.**
- **Android 리플 효과는 Material 스타일 앱에서만 사용합니다.** 커스텀 디자인에서는 한 플랫폼에만 리플을 넣기보다 양쪽에서 동일한 축소 효과를 쓰는 편이 통일감 있습니다.

### 8. 햅틱 피드백

모바일에는 웹에서 제공할 수 없는 촉각 피드백이 있습니다. 적절히 쓰면 앱의 완성도를 높이지만, 남용하면 사용자가 기능을 꺼 버립니다.

| 순간 | 호출 |
| --- | --- |
| 값이 한 단계씩 바뀌는 순간 — 피커, 슬라이더 디텐트, 세그먼트 컨트롤 | `Haptics.selectionAsync()` |
| 요소가 제자리에 안착하거나 시트가 디텐트에 걸림, 드래그가 확정되는 순간 | `Haptics.impactAsync(ImpactFeedbackStyle.Light)` |
| 무거운 물체가 떨어지거나 파괴적 동작이 실행되는 순간 | `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` |
| 작업 성공 또는 실패 | `Haptics.notificationAsync(NotificationFeedbackType.Success / Error)` |

세 가지 규칙은 예외 없이 지켜야 합니다.

- **시각 변화와 같은 프레임에 실행합니다.** 햅틱이 애니메이션보다 늦으면 피드백이 아니라 오류처럼 느껴집니다. 애니메이션이 끝날 때가 아니라 디텐트에 걸리는 등 변화를 일으키는 순간에 호출하세요.
- **사용자 동작 한 번에 한 번만 호출합니다.** 스크롤 중이나 매 프레임, 사용자가 시작하지 않은 진입 애니메이션에서는 실행하지 않습니다.
- **햅틱만으로 상태를 알리지 않습니다.** 많은 사용자가 시스템 설정에서 햅틱을 끄고, 대부분의 Android 기기에서는 지원되지 않습니다. 시각적 표시만으로도 의미가 전달되어야 합니다.

워클릿에서 햅틱을 호출할 때는 RN 런타임으로 넘겨야 합니다: `scheduleOnRN(Haptics.selectionAsync)`.

### 9. 움직임 줄이기와 접근성

```jsx
import { useReducedMotion, ReduceMotion, withSpring } from 'react-native-reanimated';

const reduced = useReducedMotion();
const y = useSharedValue(reduced ? 0 : SHEET_HEIGHT);

// or let each animation decide
withSpring(0, { duration: 300, dampingRatio: 0.8, reduceMotion: ReduceMotion.System });
```

움직임 줄이기 설정은 **애니메이션을 없애는 것이 아니라 수를 줄이고 강도를 낮추는 것**입니다. 상태 변화를 이해하는 데 필요한 opacity와 색상 변화는 유지하고 이동, 확대/축소, 패럴랙스, 오버슈트를 제거합니다. 화면 전환에는 `animation: 'fade'`를 사용합니다.

**텍스트 크기는 사용자가 바꿀 수 있습니다.** 기본값으로 `allowFontScaling`이 켜져 있으므로 기본 글꼴 크기에서 잰 높이는 글자가 200%로 커졌을 때 맞지 않습니다. 높이를 고정해 애니메이션하지 말고 `onLayout`으로 측정하거나 transform을 사용하세요.

## 애니메이션을 눈에 띄지 않게 고장 내는 설정

“애니메이션이 아예 실행되지 않는다”면 다음 항목을 먼저 확인합니다.

- Expo를 통해 설치해 SDK와 버전을 맞춥니다: `npx expo install react-native-reanimated react-native-worklets`. Expo 프로젝트에서는 `babel-preset-expo`가 worklets Babel 플러그인을 자동 구성하므로 `babel.config.js`를 따로 수정할 필요가 없습니다. 이 프리셋을 사용하지 않는 bare RN 프로젝트에서만 플러그인을 수동으로 추가하며, 반드시 목록 마지막에 둡니다. 플러그인이 빠졌거나 잘못 배치되면 예전처럼 조용히 대체되지 않고 런타임에 `Failed to create a worklet` 오류가 발생합니다.
- 오류 없이 제스처가 작동하지 않으면 앱을 `GestureHandlerRootView`로 감쌌는지 확인합니다.
- Reanimated 4에는 New Architecture가 필요합니다.
- **Expo Go는 성능을 판단할 환경이 아닙니다.** 릴리스 빌드에서 움직임을 확인하세요. 개발 빌드의 JS 스레드는 찾으려는 성능 문제를 가릴 만큼 느립니다.

## 120fps 지원

ProMotion을 지원하는 iPhone에서 `CADisableMinimumFrameDurationOnPhone`을 설정하지 않으면 서드파티 애니메이션은 60fps로 제한됩니다. 최근 Expo SDK는 이를 기본으로 설정하므로 설정 여부를 확인하고, 빠져 있으면 추가하세요.

```json
{ "expo": { "ios": { "infoPlist": { "CADisableMinimumFrameDurationOnPhone": true } } } }
```

설정하면 프레임당 처리 예산이 16ms에서 8ms로 줄어듭니다. 그래서 모바일에서는 웹보다 UI 스레드 애니메이션이 더욱 중요합니다.

## 구현 레시피

누름 피드백, 드래그로 닫는 시트, 스와이프 삭제, 접히는 헤더, 목록 진입, 키보드 동기화 UI, 탭 표시기, 화면 전환의 구현 예제는 [RECIPES.md](RECIPES.md)에 있습니다. 요청이 이 사례에 해당하면 해당 파일을 열고 처음부터 만들지 말고 레시피를 조정해 사용하세요.

## 배포하면 안 되는 구현

| 금지 | 대신 |
| --- | --- |
| `PanResponder` | gesture-handler의 `Gesture.Pan()` |
| 제스처나 스크롤 핸들러에서 `setState` | 공유 값 + `useAnimatedStyle` |
| `runOnJS` (Reanimated 4에서 deprecated) | `react-native-worklets`의 `scheduleOnRN` |
| 프레임마다 `scheduleOnRN` | `onEnd`, 또는 임계값에서 `useAnimatedReaction` |
| 렌더 중 공유 값을 읽거나 쓰기 | 워클릿, 핸들러, 이펙트 안에서 `.get()` / `.set()` |
| 손가락으로 조작하는 요소에 코어 `Animated` 사용 | Reanimated |
| `height` / `width` / `margin` / `flex` / `top` 애니메이션 | `transform` + `opacity` (절대 위치의 자식 없는 요소는 예외) |
| `BlurView` intensity 또는 Android `elevation` 애니메이션 | 정적 레이어를 크로스페이드 |
| 가상화된 목록의 행에 `entering` 적용 | 컨테이너를 애니메이션하거나 `itemLayoutAnimation` 사용 |
| JS로 다시 만든 화면 전환 | 네이티브 스택 `animation` |
| 탭 사이를 슬라이드 | `animation: 'none'` |
| UI 요소에 `Easing.in(...)` | `Easing.bezier(0.23, 1, 0.32, 1)` |
| `scale(0)` 등장 | `scale(0.95)` + `opacity: 0` |
| 거리만으로 닫힘 여부 결정 | 속도 **또는** 거리를 봅니다. 빠르게 튕기는 동작만으로도 충분합니다. |
| 경계에서 즉시 멈춤 | 고무줄처럼 저항을 줍니다. |
| 매 프레임 햅틱을 실행하거나 유일한 피드백으로 사용 | 확정 동작마다 한 번만, 항상 시각 피드백과 함께 |
| Expo Go나 시뮬레이터에서 느낌 판단 | 릴리스 빌드, 지원하는 가장 느린 기기 |

## 결과 형식

코드를 작성한 다음 몇 줄 이내로 다음을 설명합니다.

- **판단 결과** — 사용 빈도 등급과 애니메이션의 목적. 요청에서 제외한 동작이 있다면 이유도 밝힙니다.
- **구현 요소** — 사용한 도구, 속성, 스프링 또는 곡선과 지속 시간, 실행 스레드.
- **기기에서 확인할 동작** — 코드만으로는 제스처, 속도 전달, 햅틱 타이밍을 판단할 수 없습니다. 빠르게 튕기고, 움직이는 중간에 끊고, 방향을 바꾸고, 지원하는 가장 느린 Android 기기에서 실행해 보라고 구체적으로 안내합니다.

결과물은 코드입니다. 설명을 불필요하게 늘리지 않습니다.

## 문체

분명한 판단을 짧게 전합니다. 답이 “이 동작은 애니메이션하면 안 됩니다” 또는 “실기기에서 확인하기 전에는 적절한지 알 수 없습니다”라면 그대로 말합니다.
