# Expo 애니메이션 레시피

React Native 앱에서 자주 마주치는 상황을 바로 구현할 수 있도록 정리한 레시피입니다. 해당 레시피를 출발점으로 삼아 상황에 맞게 조정하세요.

---

## 레시피에서 가정하는 설정

```bash
npx expo install react-native-reanimated react-native-worklets react-native-gesture-handler expo-haptics
```

키보드 레시피에서만 `react-native-keyboard-controller`가 필요합니다. `npm install` 대신 `expo install`을 사용하세요. `expo install`은 SDK와 호환되는 버전을 선택합니다. worklets Babel 플러그인은 `babel-preset-expo`가 자동으로 설정합니다.

앱 루트에서 `GestureHandlerRootView`로 앱을 한 번 감싸세요. Expo Router에서는 루트 `_layout`에 배치합니다.

```jsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack />
    </GestureHandlerRootView>
  );
}
```

아래 모든 레시피에서 공통으로 사용하는 import와 상수입니다.

```js
import { useState, useEffect, useMemo } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, useAnimatedReaction,
  withSpring, withTiming, interpolate, Extrapolation, Easing,
  FadeInDown, FadeOutDown, LinearTransition,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);      // strong ease-out for UI
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);  // on-screen movement
const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1);    // iOS sheet curve
```

모든 레시피에 적용되는 세 가지 규칙입니다. 각 항목마다 반복하지 않고 여기서 설명합니다.

- **공유 값은 `.get()` / `.set()`으로 읽고 씁니다.** React Compiler와 함께 쓰도록 Reanimated 문서가 권장하는 방식입니다. `.value`도 작동하지만 컴파일러가 그 접근을 추적하지 못합니다.
- **워클릿에서 React Native 런타임으로 콜백할 때 `scheduleOnRN(fn, ...args)`를 사용합니다.** 이 함수가 deprecated된 `runOnJS(fn)(...args)`를 대체합니다.
- **제스처를 `useMemo`로 감쌉니다.** 매 렌더에서 제스처를 다시 만들면 인식기가 재연결되고 한창 진행 중인 드래그가 끊길 수 있습니다.

**Gesture Handler v3:** Expo는 v2를 설치하며, 이 레시피는 v2의 `Gesture.Pan()` 빌더를 기준으로 합니다. 프로젝트가 이미 v3를 사용한다면 해당 빌더는 레거시 API입니다. 제스처마다 설정 객체를 받는 훅을 사용해야 합니다. `onStart`는 `onActivate`로, `onEnd`는 `onDeactivate`로 바뀌며, `success` 플래그는 반대 의미의 `event.canceled`로 대체됩니다. 훅이 제스처 식별성을 직접 관리하므로 `useMemo`는 제거하세요.

```jsx
const pan = usePanGesture({
  activeOffsetY: [-10, 10],
  onActivate: () => { context.set(translateY.get()); },
  onUpdate: (e) => { translateY.set(context.get() + e.translationY); },
  onDeactivate: (e) => { /* settle with withSpring as below */ },
});
```

---

## 어디서든 필요한 워클릿 두 개

모멘텀 투영(momentum projection)은 플릭이 *계속 움직였다면 어디에 도달할지* 계산합니다. 그래서 짧고 빠른 스와이프는 동작을 확정하고, 길더라도 느린 스와이프는 확정하지 않을 수 있습니다. 고무줄 효과(rubber-banding)는 경계에서 갑자기 멈추지 않고 저항을 느끼게 합니다.

```js
// Where the finger would come to rest if it kept decelerating.
// Apple's exponential-decay form — not the v²/2a from physics class.
function project(velocity, decelerationRate = 0.998) {
  'worklet';
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

// The further past the edge, the less the element follows.
function rubberband(overshoot, dimension, constant = 0.55) {
  'worklet';
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}
```

---

## 누를 때 피드백

앱 안의 모든 누를 수 있는 요소에 적용합니다. 자주 반복되는 동작인데도 허용되는 이유는 거의 알아차릴 수 없을 만큼 미세하기 때문입니다. 이 빈도의 입력에는 120ms와 3% 축소가 최대치입니다. 그보다 길거나 큰 움직임은 SKILL.md 1단계에 따라 드물게 일어나는 순간에만 허용됩니다. 제스처나 공유 값은 필요 없습니다. CSS 트랜지션만으로 구현합니다.

```jsx
import Animated from 'react-native-reanimated';
import { Pressable, StyleSheet } from 'react-native';

function PressableScale({ onPress, children }) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      hitSlop={12}
      pressRetentionOffset={16}
    >
      <Animated.View style={[styles.box, pressed && styles.pressed]}>{children}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    transform: [{ scale: 1 }],
    transitionProperty: 'transform',
    transitionDuration: '120ms',
    transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
  },
  pressed: { transform: [{ scale: 0.97 }] },
});
```

여기서는 `setState`를 써도 됩니다. 누름 한 번에 두 번만 실행되고 프레임마다 호출되지는 않습니다. `hitSlop`은 아이콘의 시각적 크기를 키우지 않고 터치 영역을 44pt까지 넓힙니다. `pressRetentionOffset`은 손가락이 조금 움직여도 누름이 취소되지 않도록 합니다.

---

## 드래그해서 닫는 바텀 시트

구현 전에 확인하세요. 시트가 독립된 화면이라면 **화면 전환** 항목처럼 `presentation: 'formSheet'`을 사용해 플랫폼의 네이티브 시트를 그대로 활용하면 됩니다. 이 레시피는 기존 화면 안에 시트를 넣어야 할 때만 사용하세요.

```jsx
const translateY = useSharedValue(0);
const context = useSharedValue(0);

const pan = useMemo(() => Gesture.Pan()
  .activeOffsetY([-10, 10])   // let a horizontal swipe win; require intent before committing
  .onStart(() => {
    context.set(translateY.get());   // start from the current on-screen value, not from 0
  })
  .onUpdate((e) => {
    const next = context.get() + e.translationY;
    // downward is free; upward past the top resists
    translateY.set(next >= 0 ? next : rubberband(next, HEIGHT));
  })
  .onEnd((e) => {
    const projected = translateY.get() + project(e.velocityY);
    if (projected > HEIGHT * 0.4) {
      translateY.set(withSpring(HEIGHT, {
        duration: 300, dampingRatio: 1, velocity: e.velocityY, overshootClamping: true,
      }, (finished) => { if (finished) scheduleOnRN(onClose); }));
    } else {
      translateY.set(withSpring(0, { duration: 300, dampingRatio: 0.8, velocity: e.velocityY }));
      scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Light);   // it snapped home
    }
  }), [onClose]);

const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.get() }] }));
```

이 네 가지 동작이 좋은 드래그를 만듭니다.

- **`onStart`에서 현재 값을 저장합니다.** 이 처리가 없으면 애니메이션 중간에 시트를 잡았을 때 위치가 순간이동합니다. 애니메이션은 사용자가 마지막으로 본 위치에서 이어져야 합니다.
- **이동 거리보다 속도를 기준으로 결정합니다.** `project()`를 적용하면 몇 픽셀만 움직인 빠른 플릭으로도 시트를 닫을 수 있습니다. 40%를 이동해야 닫히게 하면 시트가 묵직하게 느껴집니다.
- **속도를 스프링에 전달합니다.** 손가락을 떼고 애니메이션이 이어질 때 움직임이 끊기지 않습니다. 유연한 느낌과 그저 무난한 느낌을 가르는 가장 중요한 세부 사항입니다.
- **닫을 때 `overshootClamping`을 설정합니다.** 그렇지 않으면 시트가 화면 아래쪽을 지나 튀어 오르면서 빈틈이 잠깐 보입니다.

배경의 투명도도 같은 값으로 계산하므로 항상 동기화되고 별도 비용이 들지 않습니다.

```jsx
const backdropStyle = useAnimatedStyle(() => ({
  opacity: interpolate(translateY.get(), [0, HEIGHT], [1, 0], Extrapolation.CLAMP),
}));
```

---

## 행을 스와이프해 삭제

구현 전에 gesture-handler의 [`ReanimatedSwipeable`](https://docs.swmansion.com/react-native-gesture-handler/docs/components/reanimated_swipeable/)을 먼저 확인하세요. 임계값, 오버슈트, 열기/닫기 메서드를 갖춘 스와이프 액션을 이미 UI 스레드에서 처리합니다. 행에서 액션 버튼을 펼쳐 보여 주는 경우에는 이것을 사용하세요. 모멘텀을 투영해 스와이프만으로 동작을 확정하는 것처럼 상호작용의 성격이 다를 때만 제스처를 직접 구현합니다. 이 레시피가 그런 사례입니다.

```jsx
const x = useSharedValue(0);
const context = useSharedValue(0);

const pan = useMemo(() => Gesture.Pan()
  .activeOffsetX([-10, 10])   // must declare the axis, or it fights the vertical scroll
  .onStart(() => { context.set(x.get()); })   // grab mid-spring continues from where the row is, not from 0
  .onUpdate((e) => { x.set(Math.min(0, context.get() + e.translationX)); })
  .onEnd((e) => {
    const projected = x.get() + project(e.velocityX);
    if (projected < -SWIPE_THRESHOLD) {
      x.set(withTiming(-WIDTH, { duration: 200, easing: EASE_OUT }, (f) => {
        if (f) scheduleOnRN(onDelete, id);
      }));
    } else {
      x.set(withSpring(0, { duration: 300, dampingRatio: 1, velocity: e.velocityX }));
    }
  }), [onDelete, id]);
```

삭제된 행이 있던 자리를 정리하는 일은 행이 아니라 목록이 담당합니다.

```jsx
const ROW_CLOSE = LinearTransition.duration(200);   // module scope — builders rebuilt in render cost every re-render

<Animated.FlatList data={items} itemLayoutAnimation={ROW_CLOSE} ... />
```

`activeOffsetX`는 모바일에서 특히 중요합니다. 스크롤 뷰 안의 pan 핸들러에 축을 지정하지 않으면 세로 스크롤을 가로챕니다. 그러면 제스처 문제가 스크롤 문제처럼 보여 목록이 망가진 듯한 인상을 줍니다.

---

## 스크롤할 때 접히는 헤더

```jsx
const scrollY = useSharedValue(0);
const onScroll = useAnimatedScrollHandler((e) => { scrollY.set(e.contentOffset.y); });

const titleStyle = useAnimatedStyle(() => ({
  opacity: interpolate(scrollY.get(), [0, 60], [1, 0], Extrapolation.CLAMP),
  transform: [{ translateY: interpolate(scrollY.get(), [0, 60], [0, -12], Extrapolation.CLAMP) }],
}));

<Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16}>
```

**헤더를 접기 위해 `height`를 애니메이션하지 마세요.** 스크롤이 발생하는 매 프레임마다 헤더와 아래의 모든 요소를 다시 레이아웃해야 합니다. 스크롤과 동시에 레이아웃 작업이 생겨 애니메이션이 끊깁니다. 컨테이너 높이는 고정하고, 내부 콘텐츠를 translate한 뒤 `overflow: 'hidden'`으로 잘라냅니다.

`Extrapolation.CLAMP`는 반드시 필요합니다. 이 설정이 없으면 60을 넘겨 스크롤할 때 opacity가 음수로 계속 내려가고, 긴 목록 아래쪽에서 헤더가 반전된 채 다시 나타납니다.

---

## 목록 항목의 진입

```jsx
// The Reanimated docs recommend building layout animations outside components,
// or in useMemo — an inline chain in JSX rebuilds the builder on every render.
// A per-index delay can't live at module scope, so the row memoizes its own:
function Row({ item, index }) {
  const entering = useMemo(() => FadeInDown.duration(250).delay(index * 40), [index]);
  return <Animated.View entering={entering}>{/* ... */}</Animated.View>;
}

{items.map((item, i) => <Row key={item.id} item={item} index={i} />)}
```

시차는 30–80ms로 설정합니다. 더 길면 굼뜨고, 더 짧으면 항목이 한꺼번에 나타나는 것처럼 보입니다.

**`FlatList`, `FlashList` 또는 다른 가상화 목록의 행에 `entering`을 절대 지정하지 마세요.** 행은 재사용되므로 화면에 다시 들어올 때마다 애니메이션이 실행되고, 스크롤 중 목록이 깜빡이는 것처럼 보입니다. 마운트될 때 목록 컨테이너를 한 번 애니메이션하거나 재배치에만 `itemLayoutAnimation`을 사용하세요.

진입 애니메이션은 사용자가 요청해 기다리는 콘텐츠에 사용합니다. 하루 종일 스크롤해서 지나가는 목록은 처음부터 화면에 표시되어 있어야 합니다.

---

## 키보드에 동기화되는 UI

별도 모듈을 추가하고 provider를 한 번 설정해야 합니다([Expo 키보드 가이드](https://docs.expo.dev/guides/keyboard-handling/)).

```bash
npx expo install react-native-keyboard-controller
```

```jsx
import { KeyboardProvider } from 'react-native-keyboard-controller';

// Root _layout, next to GestureHandlerRootView — hooks below do nothing without it.
<KeyboardProvider>
  <Stack />
</KeyboardProvider>
```

```jsx
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';

const { height } = useReanimatedKeyboardAnimation();   // 0 → -keyboardHeight, on the UI thread
const footerStyle = useAnimatedStyle(() => ({ transform: [{ translateY: height.get() }] }));
```

`Keyboard.addListener`와 타이밍 애니메이션을 조합해 구현하지 마세요. 키보드는 시스템 내부의 전용 곡선을 따라 움직이고, 이벤트가 JS 스레드에 도착할 때는 키보드가 이미 이동 중입니다. 어떤 duration을 선택해도 UI가 눈에 띄게 뒤처지거나 앞서게 됩니다. UI는 키보드의 실제 위치를 프레임마다 따라가야 합니다.

---

## 탭 / 세그먼트 표시기

먼저 한 번 측정한 뒤 transform을 애니메이션합니다.

```jsx
const [layouts, setLayouts] = useState({});   // measured with onLayout, not per frame
const x = useSharedValue(0);
const w = useSharedValue(0);

useEffect(() => {
  const l = layouts[active];
  if (!l) return;
  x.set(withTiming(l.x, { duration: 250, easing: EASE_IN_OUT }));
  w.set(withTiming(l.width, { duration: 250, easing: EASE_IN_OUT }));
}, [active, layouts]);

const pillStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: x.get() }],
  width: w.get(),
}));
```

`width`를 애니메이션해도 되는 예외입니다. 표시기는 절대 위치이고 자식 요소가 없으므로 다른 요소의 레이아웃에 영향을 주지 않습니다. 모서리 반경도 보존됩니다. `scaleX`를 적용하면 모서리가 타원처럼 변형됩니다.

표시기는 화면을 가로질러 이동하므로 진입/퇴장에 쓰는 곡선이 아니라 `ease-in-out`을 사용합니다. 선택할 때 `Haptics.selectionAsync()`를 호출하고, 표시기가 도착할 때는 호출하지 않습니다.

---

## 화면 전환(Expo Router)

네이티브 스택 옵션을 설정하세요. 화면 전환을 JS로 직접 구현하지 마세요. 네이티브 전환은 플랫폼에서 실행되고, 뒤로 가기 제스처를 그대로 지원하며, 기기의 다른 앱들과 동작 방식이 일관됩니다.

```jsx
<Stack screenOptions={{ animation: reduced ? 'fade' : 'default' }}>
  <Stack.Screen name="settings" options={{ animation: 'slide_from_right', animationMatchesGesture: true }} />
  <Stack.Screen name="compose" options={{ presentation: 'modal' }} />
  <Stack.Screen name="filter" options={{
    presentation: 'formSheet',
    sheetAllowedDetents: 'fitToContents',
    sheetGrabberVisible: true,
  }} />
</Stack>
```

| 내비게이션 | 옵션 |
| --- | --- |
| 계층 안쪽 화면으로 이동 | `animation: 'default'` — 플랫폼의 push 전환을 그대로 사용 |
| 사용자가 취소할 수 있는 독립 작업 | `presentation: 'modal'` |
| 잠깐 수행하는 작업: 피커, 필터, 공유 | 디텐트를 설정한 `presentation: 'formSheet'` |
| 탭 사이 | `animation: 'none'` |
| 동작 줄이기 설정 | `animation: 'fade'` |

`animationMatchesGesture: true`를 설정하면 iOS에서 뒤로 스와이프를 할 때 손가락 움직임에 맞춰 전환이 역방향으로 진행됩니다. 기본 push 동작을 그대로 사용하는 것과 다릅니다. 커스텀 `animation`을 지정할 때마다 함께 켜세요. 그렇지 않으면 뒤로 드래그하는 동작이 앞으로 이동할 때와 다른 앱처럼 느껴집니다.

`formSheet`은 두 플랫폼 모두 네이티브로 지원되지만 동작은 서로 다릅니다. 자세한 항목은 [Expo 모달 문서](https://docs.expo.dev/router/advanced/modals/#form-sheet-presentation)를 확인하세요.

- **Android에서 사용할 수 있는 디텐트는 최대 세 개입니다.** `sheetAllowedDetents`에 더 많이 지정하면 iOS에서는 동작해도 Android에서는 알림 없이 잘립니다. 세 개에 맞춰 설계하세요.
- **`sheetGrabberVisible`은 iOS 전용입니다.** Android에는 손잡이가 표시되지 않으므로 드래그 가능 여부를 알리는 유일한 시각적 표시로 사용하지 마세요.
- **Android form sheet에는 네이티브 헤더나 중첩 스택을 넣을 수 없습니다.** 한 화면만 담도록 구성하고, 시트 안에 별도 내비게이션이 필요하면 `presentation: 'modal'`을 사용하세요.
- **`fitToContents`를 쓰려면 콘텐츠 크기를 명시해야 합니다.** `flex: 1` 루트에는 콘텐츠에 맞출 고유 높이가 없습니다. 크기를 정하지 않으면 디텐트가 맞지 않습니다.

---

## 토스트

```jsx
// Module scope — layout-animation builders live outside the component.
const TOAST_ENTER = FadeInDown.duration(300).easing(EASE_OUT);
const TOAST_EXIT = FadeOutDown.duration(250).easing(EASE_OUT);

<Animated.View
  entering={TOAST_ENTER}
  exiting={TOAST_EXIT}
  style={{ position: 'absolute', bottom: insets.bottom + 16, left: 16, right: 16 }}
/>
```

- **토스트에도 300ms 상한을 적용합니다.** 예외가 아닙니다. 사용자가 요청해서 나타나는 움직임이 아니므로 오히려 더 짧고 눈에 덜 띄어야 합니다.
- **등장한 방향으로 퇴장합니다.** 아래에서 나타난 토스트가 옆으로 사라지면 서로 다른 두 요소처럼 보입니다.
- **퇴장은 진입보다 약 20% 빠르게 합니다.** 사용자는 이미 내용을 읽었습니다. 나타나는 데는 시간을 들여도, 사라지는 동작까지 그럴 필요는 없습니다.
- **항상 안전 영역 인셋을 적용합니다.** `bottom: 16`에 놓인 토스트는 최신 iPhone에서 홈 인디케이터 아래에 가려집니다.

토스트가 쌓이면서 목록이 재배치되면 `itemLayoutAnimation`을 추가합니다. 재배치에 맞는 opacity 값은 공식으로 정할 수 없으므로 눈으로 조정하세요. 다음 날 다시 확인하는 것도 좋습니다.

---

## 임계값을 넘을 때 한 번만 실행하기

디텐트에 걸리거나, 스냅되거나, 당겨서 새로고침 동작이 준비되는 것처럼 임계점을 넘는 순간이 중요할 때는 JS에서 값을 계속 폴링하지 마세요. `scheduleOnRN`을 매 프레임 호출해서도 안 됩니다.

```jsx
const armed = useSharedValue(false);

useAnimatedReaction(
  () => pullDistance.get() > REFRESH_THRESHOLD,
  (isArmed, wasArmed) => {
    if (isArmed !== wasArmed) {
      armed.set(isArmed);
      scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Light);
    }
  }
);
```

비교는 매 프레임 UI 스레드에서 이루어지고 JS 호출은 당기는 동작 한 번에 두 번만 발생합니다. 애니메이션 값이 특정 지점에 도달했을 때 처리할 일이 있다면 이 패턴을 사용하세요.
