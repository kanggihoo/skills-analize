# animate-expo 스킬은 에이전트를 어떻게 바꾸나 {#animate-expo-skill}

`animate-expo`를 쓰면 에이전트는 Expo·React Native 앱의 모션을 만들 때 "움직여야 하나"를 먼저 정하고, 그다음 모션이 어느 스레드에서 도는지를 가장 중요하게 따진다. 손가락이 닿는 모션은 spring과 UI thread에서 돌리고, 화면 전환·sheet·tab bar는 직접 만들지 않고 플랫폼 기본 기능을 쓴다. 느낌은 release build와 지원하는 가장 느린 기기에서만 확인된 것으로 친다.[](source:ex-why)[](source:ex-hard)

- 켜지는 때: Expo 앱에서 무언가를 움직이거나, 제스처·sheet·화면 전환·press 피드백·haptics를 더하거나, 기기에서 끊기는 모션을 고칠 때다. 호출 제한 필드는 없다.[](source:ex-fm)
- 강제하는 것: 9단계를 순서대로 밟는다. core `Animated` 대신 Reanimated를 쓰고, 값은 표에서만 가져오며, reduced motion을 함께 낸다.[](source:ex-hard)
- 대표 수치: 모바일 UI도 300ms 미만, press 피드백 100~150ms, 터치 영역 최소 44×44pt(Android 48dp), 120Hz에서 프레임 예산 8ms다.[](source:ex-s5dur)[](source:ex-s7)[](source:ex-120)
- 쓰면 안 되는 때: 웹 애니메이션이다. description이 그때는 `animate`를 쓰라고 한다.[](source:ex-fm)

@answer scope="design/emilkowalski/animate-expo · 원본 텍스트 2개 34,699B · 커밋 4e3fc89 · 지시상 동작 · 설치 명령과 레시피 코드는 읽기만 하고 실행하지 않음"
@meta locale=ko
@source ex-fm title="design/emilkowalski/animate-expo/SKILL.md · 17891B · frontmatter" path=design/emilkowalski/animate-expo/SKILL.md lines=1:4
@source ex-init title="SKILL.md · 첫 응답" path=design/emilkowalski/animate-expo/SKILL.md lines=8:14
@source ex-why title="SKILL.md · 모바일이 바꾸는 세 가지" path=design/emilkowalski/animate-expo/SKILL.md lines=16:22
@source ex-posture title="SKILL.md · 작업 자세와 두 실패" path=design/emilkowalski/animate-expo/SKILL.md lines=24:31
@source ex-hard title="SKILL.md · Hard Rules 5개" path=design/emilkowalski/animate-expo/SKILL.md lines=33:39
@source ex-s1 title="SKILL.md · 1단계 빈도 관문" path=design/emilkowalski/animate-expo/SKILL.md lines=43:54
@source ex-s2 title="SKILL.md · 2단계 목적" path=design/emilkowalski/animate-expo/SKILL.md lines=56:60
@source ex-s3 title="SKILL.md · 3단계 도구 표" path=design/emilkowalski/animate-expo/SKILL.md lines=62:82
@source ex-deps title="SKILL.md · 의존성 표" path=design/emilkowalski/animate-expo/SKILL.md lines=84:94
@source ex-s4 title="SKILL.md · 4단계 속성" path=design/emilkowalski/animate-expo/SKILL.md lines=96:104
@source ex-s5spring title="SKILL.md · 5단계 spring 표" path=design/emilkowalski/animate-expo/SKILL.md lines=106:119
@source ex-s5ease title="SKILL.md · 5단계 easing" path=design/emilkowalski/animate-expo/SKILL.md lines=121:138
@source ex-s5dur title="SKILL.md · 5단계 duration" path=design/emilkowalski/animate-expo/SKILL.md lines=140:149
@source ex-s6 title="SKILL.md · 6단계 JS thread 밖에 두기" path=design/emilkowalski/animate-expo/SKILL.md lines=151:159
@source ex-s7 title="SKILL.md · 7단계 press" path=design/emilkowalski/animate-expo/SKILL.md lines=161:169
@source ex-s8 title="SKILL.md · 8단계 haptics" path=design/emilkowalski/animate-expo/SKILL.md lines=171:188
@source ex-s9 title="SKILL.md · 9단계 reduced motion과 글자 크기" path=design/emilkowalski/animate-expo/SKILL.md lines=190:204
@source ex-setup title="SKILL.md · 모션을 조용히 깨는 설정" path=design/emilkowalski/animate-expo/SKILL.md lines=206:213
@source ex-120 title="SKILL.md · 120fps" path=design/emilkowalski/animate-expo/SKILL.md lines=215:223
@source ex-recipes title="SKILL.md · 레시피 안내" path=design/emilkowalski/animate-expo/SKILL.md lines=225:227
@source ex-never title="SKILL.md · Never Ship 표" path=design/emilkowalski/animate-expo/SKILL.md lines=229:249
@source ex-out title="SKILL.md · 출력과 어조" path=design/emilkowalski/animate-expo/SKILL.md lines=251:263
@source xr-setup title="design/emilkowalski/animate-expo/RECIPES.md · 16808B · 레시피 전제 설정" path=design/emilkowalski/animate-expo/RECIPES.md lines=7:27
@source xr-conv title="RECIPES.md · 공통 import와 세 관례" path=design/emilkowalski/animate-expo/RECIPES.md lines=29:51
@source xr-gh3 title="RECIPES.md · Gesture Handler v3" path=design/emilkowalski/animate-expo/RECIPES.md lines=53:62
@source xr-work title="RECIPES.md · project와 rubberband worklet" path=design/emilkowalski/animate-expo/RECIPES.md lines=66:83
@source xr-press title="RECIPES.md · Press feedback" path=design/emilkowalski/animate-expo/RECIPES.md lines=87:121
@source xr-sheet title="RECIPES.md · 끌어 닫는 bottom sheet" path=design/emilkowalski/animate-expo/RECIPES.md lines=125:171
@source xr-swipe title="RECIPES.md · Swipe to delete" path=design/emilkowalski/animate-expo/RECIPES.md lines=175:207
@source xr-header title="RECIPES.md · Collapsing header" path=design/emilkowalski/animate-expo/RECIPES.md lines=211:227
@source xr-list title="RECIPES.md · List entrances" path=design/emilkowalski/animate-expo/RECIPES.md lines=231:249
@source xr-kb title="RECIPES.md · Keyboard-synced UI" path=design/emilkowalski/animate-expo/RECIPES.md lines=253:277
@source xr-tab title="RECIPES.md · Tab indicator" path=design/emilkowalski/animate-expo/RECIPES.md lines=281:305
@source xr-screen title="RECIPES.md · Screen transitions" path=design/emilkowalski/animate-expo/RECIPES.md lines=309:340
@source xr-toast title="RECIPES.md · Toast" path=design/emilkowalski/animate-expo/RECIPES.md lines=344:363
@source xr-thresh title="RECIPES.md · 임계점에서 한 번 실행" path=design/emilkowalski/animate-expo/RECIPES.md lines=367:385
@source an-scope title="design/emilkowalski/animate/SKILL.md · r05 확인용 역할 구분" path=design/emilkowalski/animate/SKILL.md lines=16:16
@source an-toast title="design/emilkowalski/animate/RECIPES.md · 웹 toast 비교용" path=design/emilkowalski/animate/RECIPES.md lines=126:143
@source pf-scope title="design/emilkowalski/animation-performance/SKILL.md · r09 확인용 역할 구분" path=design/emilkowalski/animation-performance/SKILL.md lines=16:16
@source mn-scope title="design/emilkowalski/mobile-native/SKILL.md · r14 확인용" path=design/emilkowalski/mobile-native/SKILL.md lines=3:3

## 언제 켜지고, 언제 쓰면 안 되나 {#trigger}

@code source=ex-fm language=yaml

이 스킬에는 호출 제한 필드가 없어서, 모델이 `description`을 참고해 스스로 켤 수 있다.[](source:ex-fm) 판정: `description`은 판단용 설명이라, 거기 적힌 단어가 나온다고 반드시 켜지지는 않는다.

구체적인 질문 없이 처음 불리면, 에이전트는 정해진 한 문장("I'm ready to build animations in Expo and React Native…")만 답하고 사용자가 물을 때까지 기다린다.[](source:ex-init)

원문은 모바일이 애니메이션을 세 가지 면에서 바꾼다고 보고, 나머지 규칙을 모두 여기서 끌어낸다.[](source:ex-why)

| 모바일의 차이 | 에이전트가 하는 일 |
| --- | --- |
| hover가 없다 | 웹에서 hover에 두던 표시를 press, 위치로 옮기거나 없앤다 |
| 런타임이 둘이다 | React가 렌더하는 RN runtime과 매 프레임 worklet이 도는 UI runtime을 나누고, 모션을 UI runtime에 둔다. RN runtime을 건드리는 모션은 앱이 다른 일을 하는 순간 끊긴다 |
| 손가락이 요소 위에 있다 | 중단할 수 있는 모션과 속도 이어받기를 기본으로 만든다 |

**쓰면 안 되는 때**는 웹 애니메이션이다. `animate-expo`의 description은 웹이면 `animate`를 쓰라고 하고(r06), `animate`도 React Native는 이 스킬 몫이라고 적는다(r05).[](source:ex-fm)[](source:an-scope) 관문에서 떨어진 요청도 만들지 않는다. 하루 100번 넘게 하는 동작(tab 전환, 키보드 열고 닫기, 스크롤, 설정 toggle)은 플랫폼 기본값이나 아무것도 쓰지 않는다.[](source:ex-s1)

사람이 개입하는 곳은 마지막 기기 확인이다. 원문은 제스처, 속도 이어받기, haptic 시점을 코드로 판단할 수 없다고 하고, 에이전트가 사람에게 시험할 것을 알려 주게 한다. 튕겨 보기, 중간에 끊어 보기, 되돌려 보기, 가장 느린 Android에서 돌려 보기다.[](source:ex-out) Expo Go와 simulator에서 느낌을 판단하는 것은 Never Ship 항목이다.[](source:ex-never)

## 무엇을 어떤 순서로 정하나 {#sequence}

1단계와 2단계가 나머지를 막는 관문이다. 에이전트는 메뉴처럼 선택지를 내밀지 않고 결정한 뒤, 이유를 한 줄로 말하고 코드를 쓴다.[](source:ex-hard)[](source:ex-posture)

@workflow id=expo-flow title="animate-expo 9단계"
| lane gate | 관문 |
| lane build | 재료 |
| lane mobile | 모바일 고유 |
| x1 | 1 움직여도 되나? | backend | gate |
| x2 | 2 목적을 댈 수 있나? | backend | gate |
| xstop | 만들지 않음 | external | gate |
| x3 | 3 도구 고르기 | backend | build |
| x4 | 4 속성 고르기 | backend | build |
| x5 | 5 spring 또는 timing | backend | build |
| x6 | 6 JS thread 밖에 두기 | backend | mobile |
| x7 | 7 hover 대신 press | backend | mobile |
| x8 | 8 haptics | backend | mobile |
| x9 | 9 reduced motion | backend | mobile |
| xout | 코드와 기기 확인 메모 | external | mobile |
| x1 > x2 | 예 |
| x1 > xstop | 아니오 |
| x2 > x3 | 예 |
| x2 > xstop | 아니오 |
| x3 > x4 | |
| x4 > x5 | |
| x5 > x6 | |
| x6 > x7 | |
| x7 > x8 | |
| x8 > x9 | |
| x9 > xout | | emphasis |

@steps id=expo-steps
| x1 | 1 움직여도 되나? | 하루 100번 넘게 하는 동작은 애니메이션을 넣지 않는다. 하루 수십 번(press 피드백, 목록 이동, 행 선택)은 150ms 미만으로 거의 느껴지지 않게 하거나 넣지 않는다. 가끔(sheet, modal, toast, onboarding 단계)은 표준, 드물거나 처음(성공 상태, 빈 상태 그림, 축하)에만 즐거움을 위한 연출을 쓴다. tab 전환은 절대 미끄러지지 않고 `animation: 'none'`이다. tab은 계층이 아니라 대등한 화면이기 때문이다. 떨어지면 그렇다고 말하고 쓰지 않는다.[](source:ex-s1) | expo-flow | x1 |
| x2 | 2 목적을 댈 수 있나? | 목적을 feedback, spatial consistency, state indication, preventing a jarring change, explanation, delight(드문 단계만) 중 한 단어로 댄다. 못 대면 만들지 않는다.[](source:ex-s2) | expo-flow | x2 |
| xstop | 만들지 않음 | 관문에서 떨어진 요청은 코드를 쓰지 않는다. 원문은 이 관문이 가끔 코드 0줄을 내기 위해 있다고 한다.[](source:ex-s1)[](source:ex-posture) | expo-flow | xstop |
| x3 | 3 도구 고르기 | 위에서부터 처음 맞는 도구에서 멈춘다. 상태 변화는 Reanimated CSS transition, 반복·mount는 Reanimated CSS animation, mount·unmount·목록 재배치는 layout animation, 손가락이나 스크롤이 움직이는 값은 `useSharedValue` + `Gesture` + `useAnimatedStyle`이다. 화면 전환, sheet, tab bar, context menu, 큰 제목 header, pull to refresh, 키보드 추적은 Expo Router와 플랫폼 기능을 쓰고 직접 만들지 않는다. 두 상태 toggle에 worklet을 쓰지 않는다.[](source:ex-s3) | expo-flow | x3 |
| x4 | 4 속성 고르기 | `transform`과 `opacity`만 공짜다. `width`·`height`·`margin`·`padding`·`flex`·`top`·`left`·`gap`은 매 프레임 그 node와 형제의 Yoga layout을 다시 돌린다. 예외는 자식 없는 absolute 요소(tab pill, 진행 막대)다. `scale(0)` 대신 `scale(0.9~0.97)` + `opacity: 0`, transform 배열은 translate를 먼저 둔다. Android `elevation`과 `BlurView` 강도는 움직이지 않고 정적 layer의 opacity를 바꾼다.[](source:ex-s4) | expo-flow | x4 |
| x5 | 5 spring 또는 timing | 손가락이 관여했으면 spring, 아니면 timing이다. spring은 Apple식 `duration`·`dampingRatio`로 쓰고 mass/stiffness/damping을 쓰지 않는다. bounce는 제스처에 관성이 있을 때만 쓴다. UI에는 `ease-in`을 쓰지 않는다.[](source:ex-s5spring)[](source:ex-s5ease) | expo-flow | x5 |
| x6 | 6 JS thread 밖에 두기 | 원문이 RN 모션이 가장 많이 죽는 곳이라고 부르는 단계다. 제스처·스크롤 handler에서 `setState`를 하지 않는다. `onUpdate`나 스크롤 handler 안에서 `scheduleOnRN`을 부르지 않는다(초당 60~120번이 된다). 렌더 중에 shared value를 읽거나 쓰지 않는다. `.value` 대신 `.get()`/`.set()`을 쓴다. worklet에서 부르는 함수는 첫 줄에 `'worklet'`을 둔다.[](source:ex-s6) | expo-flow | x6 |
| x7 | 7 hover 대신 press | press-in에 피드백, press-out에 확정한다. 모든 pressable에 `scale: 0.97`을 100~150ms로 준다. 터치 영역은 최소 44×44pt(Android 48dp)이고, 모자라면 시각 크기 대신 `hitSlop`을 늘린다. `pressRetentionOffset`을 둔다. Android ripple은 Material 스타일 앱에서만 쓴다.[](source:ex-s7) | expo-flow | x7 |
| x8 | 8 haptics | 원문이 절대 규칙이라고 부르는 세 가지가 있다. 시각 변화와 같은 프레임에, 사용자 동작 하나에 한 번, 유일한 피드백으로 쓰지 않는다. worklet에서는 `scheduleOnRN(Haptics.selectionAsync)`로 RN runtime에 넘긴다.[](source:ex-s8) | expo-flow | x8 |
| x9 | 9 reduced motion | reduced motion은 0이 아니라 "더 적고 부드럽게"다. opacity와 색 변화는 남기고 이동·scale·parallax·overshoot를 뺀다. 화면 전환은 `animation: 'fade'`가 된다. 글자 크기가 200%로 커질 수 있으니 고정 높이로 움직이지 않고 `onLayout`으로 재거나 transform을 쓴다.[](source:ex-s9) | expo-flow | x9 |
| xout | 코드와 기기 확인 메모 | 코드를 쓰고 몇 줄로 관문 결과, 재료(도구, 속성, spring이나 곡선과 시간, 스레드), 기기에서 느껴 볼 것을 적는다. 보고서로 부풀리지 않는다. 확인은 사람이 실제 기기에서 한다.[](source:ex-out) | expo-flow | xout |

## 수치는 무엇인가 {#numbers}

곡선과 spring 설정은 아래 표에서만 가져온다(어림값 금지).[](source:ex-hard)

| 상호작용 | spring 설정 |
| --- | --- |
| 기본 정착, overshoot 없음 | `{ duration: 400, dampingRatio: 1 }` |
| drag 뒤 제자리로 | `{ duration: 400, dampingRatio: 0.8, velocity }` |
| sheet, drawer | `{ duration: 300, dampingRatio: 0.8, velocity }` |
| 단단한 경계를 넘으면 안 됨 | `overshootClamping: true` 추가 |

위 표는 원문 spring 표 그대로다.[](source:ex-s5spring)

@facts
| `EASE_OUT`(UI) | `Easing.bezier(0.23, 1, 0.32, 1)` |
| `EASE_IN_OUT`(화면 안 이동) | `Easing.bezier(0.77, 0, 0.175, 1)` |
| `EASE_SHEET`(iOS sheet) | `Easing.bezier(0.32, 0.72, 0, 1)` |
| press 피드백 | 100~150ms |
| toggle, chip, 작은 상태 변화 | 150~200ms |
| sheet, modal, drawer | spring, 체감 약 300ms |
| 화면 전환 | 플랫폼 기본값. 덮어쓰지 않는다 |
| 모바일 UI 상한(규칙) | 300ms 미만. 탐색은 플랫폼에 맞추고(iOS push 350ms) 나머지는 그보다 빠르게 |
| 하루 수십 번 쓰는 동작 | 150ms 미만이거나 없음 |
| 터치 영역(최소) | 44×44pt, Android 48dp |
| `scheduleOnRN`을 `onUpdate`에 두면 | 초당 60~120번 호출 |
| 120Hz 프레임 예산 | 8ms(60Hz는 16ms) |

수치 출처: 곡선[](source:ex-s5ease), 시간과 상한[](source:ex-s5dur), 관문[](source:ex-s1), 터치 영역[](source:ex-s7), 호출 빈도[](source:ex-s6), 프레임 예산[](source:ex-120).

| 내보내면 안 되는 것 | 대신 |
| --- | --- |
| `PanResponder` | gesture-handler의 `Gesture.Pan()` |
| 제스처·스크롤 handler의 `setState` | shared value + `useAnimatedStyle` |
| `runOnJS`(Reanimated 4에서 deprecated) | `react-native-worklets`의 `scheduleOnRN` |
| 프레임마다 `scheduleOnRN` | `onEnd`, 또는 임계점의 `useAnimatedReaction` |
| 렌더 중 shared value 읽기·쓰기 | worklet, handler, effect에서 `.get()` / `.set()` |
| 손가락이 닿는 것에 core `Animated` | Reanimated |
| `height`·`width`·`margin`·`flex`·`top` 애니메이션 | `transform` + `opacity`(자식 없는 absolute 요소 예외) |
| `BlurView` 강도나 Android `elevation` 애니메이션 | 정적 layer를 crossfade |
| 가상화 목록 행의 `entering` | 컨테이너를 움직이거나 `itemLayoutAnimation` |
| JS로 다시 만든 화면 전환 | native stack `animation` |
| tab 사이 미끄러짐 | `animation: 'none'` |
| UI 요소의 `Easing.in(...)` | `Easing.bezier(0.23, 1, 0.32, 1)` |
| `scale(0)` 진입 | `scale(0.95)` + `opacity: 0` |
| 거리만 보는 닫힘 기준 | 속도 **또는** 거리. 튕기기만 해도 된다 |
| 경계에서 딱 멈춤 | rubber-band 저항 |
| 프레임마다, 또는 유일한 피드백인 haptic | 확정 한 번에 하나, 항상 시각과 짝 |
| Expo Go나 simulator에서 느낌 판단 | release build, 지원하는 가장 느린 기기 |

Never Ship 표 17행을 그대로 옮겼다.[](source:ex-never)

@callout level=open-question title="300ms 상한과 400ms spring"
원문은 모바일 UI도 300ms 미만이라고 하면서, spring 표의 기본 정착과 drag 뒤 복귀는 `duration: 400`을 쓴다.[](source:ex-s5dur)[](source:ex-s5spring) sheet는 "체감 약 300ms"라고 적어 spring의 `duration`과 체감 시간이 다를 수 있음을 내비치지만, 400ms spring이 300ms 규칙과 어떻게 맞는지는 `원문에 명시 없음`이다.

## 설정 함정과 레시피 {#setup-recipes}

"애니메이션이 그냥 안 돈다"면 원문은 설정부터 확인하라고 한다.[](source:ex-setup) 이 분석은 아래 설치 명령을 실행하지 않았다.

- 버전이 SDK와 맞도록 `npx expo install`로 설치한다. 일반 `npm install`은 SDK에 맞는 버전을 고르지 않는다.[](source:ex-deps)[](source:ex-setup)
- Expo 프로젝트는 `babel-preset-expo`가 worklets Babel plugin을 자동으로 설정한다. 그 preset이 없는 bare RN 프로젝트만 plugin을 직접 넣고, 목록 맨 끝에 둔다. plugin이 없거나 자리가 틀리면 runtime에 `Failed to create a worklet`이 난다.[](source:ex-setup)
- `GestureHandlerRootView`가 앱을 감싸지 않으면 제스처가 오류 없이 아무것도 하지 않는다. Reanimated 4는 New Architecture가 필요하다.[](source:ex-setup)
- Expo Go는 성능 환경이 아니다. 느낌은 release build에서 판단한다.[](source:ex-setup)
- ProMotion iPhone은 `CADisableMinimumFrameDurationOnPhone`이 없으면 외부 애니메이션이 60fps로 묶인다. 최근 Expo SDK는 기본으로 넣지만, 에이전트는 있는지 확인하고 없으면 `app.json`의 `infoPlist`에 넣는다.[](source:ex-120)

요청이 레시피와 맞으면 `RECIPES.md`를 읽고 레시피에서 시작한다.[](source:ex-recipes) 레시피 파일은 공통 관례 셋을 먼저 정한다. shared value는 `.get()`/`.set()`, RN runtime 호출은 `scheduleOnRN`, 제스처는 `useMemo`로 감싼다. 프로젝트가 Gesture Handler v3이면 hook 형식(`onStart` → `onActivate`, `onEnd` → `onDeactivate`)으로 바꾸고 `useMemo`를 뺀다.[](source:xr-conv)[](source:xr-gh3)

| 레시피 | 핵심 값과 이유 |
| --- | --- |
| 공통 worklet 둘 | `project(velocity, decelerationRate = 0.998)`로 튕긴 손가락이 멈출 곳을 계산하고, `rubberband(overshoot, dimension, constant = 0.55)`로 경계 밖 저항을 준다[](source:xr-work) |
| Press feedback | 120ms, `scale` 0.97, `hitSlop={12}`, `pressRetentionOffset={16}`. 자주 쓰는 동작의 상한이라 이보다 길거나 크면 안 된다. 여기서 `setState`는 프레임마다가 아니라 누를 때 두 번이라 괜찮다[](source:xr-press) |
| bottom sheet | 자기 화면이면 먼저 `presentation: 'formSheet'`를 쓴다. 직접 만들면 투영 위치가 `HEIGHT * 0.4`를 넘을 때 닫고, 닫힘은 `duration: 300, dampingRatio: 1, overshootClamping: true`, 복귀는 `dampingRatio: 0.8`과 Light haptic이다. `onStart`에서 현재 값을 잡고 속도를 spring에 넘긴다[](source:xr-sheet) |
| Swipe to delete | 행이 action 버튼을 드러내는 것이면 `ReanimatedSwipeable`을 쓴다. 직접 만들면 `activeOffsetX([-10, 10])`로 축을 선언하고, 삭제는 200ms timing, 빈자리는 `LinearTransition.duration(200)`이다[](source:xr-swipe) |
| Collapsing header | header `height`를 움직이지 않는다. 0~60px 스크롤에 opacity 1→0, translateY 0→-12, `Extrapolation.CLAMP`는 필수다[](source:xr-header) |
| List entrances | `FadeInDown.duration(250).delay(index * 40)`, stagger 30~80ms. `FlatList`·`FlashList` 같은 가상화 목록의 행에는 `entering`을 두지 않는다[](source:xr-list) |
| 키보드 따라가기 | `react-native-keyboard-controller`와 `KeyboardProvider`를 쓰고, `Keyboard.addListener` + timing으로 만들지 않는다[](source:xr-kb) |
| Tab indicator | 250ms `EASE_IN_OUT`. 자식 없는 absolute pill이라 `width`를 움직여도 된다. haptic은 pill이 도착할 때가 아니라 누를 때다[](source:xr-tab) |
| Screen transitions | native stack 옵션을 쓴다. custom `animation`을 주면 `animationMatchesGesture: true`도 준다. Android는 detent를 3개까지만 받고 `sheetGrabberVisible`은 iOS 전용이다[](source:xr-screen) |
| Toast | 들어올 때 300ms, 나갈 때 250ms(약 20% 빠르게), 들어온 길로 나간다. 위치는 `insets.bottom + 16`이다[](source:xr-toast) |
| 임계점에서 한 번 | `useAnimatedReaction`으로 비교는 UI thread에서 매 프레임, JS 호출은 당길 때 두 번만 한다[](source:xr-thresh) |

판정: `SKILL.md`의 레시피 안내는 8종을 나열하지만 `RECIPES.md`에는 Toast와 임계점 레시피, 공통 worklet 절이 더 있다.[](source:ex-recipes)[](source:xr-toast)[](source:xr-thresh)

판정: 웹 `animate`의 toast 레시피는 400ms `ease`를 쓰고 Sonner의 성격에 맞춘 것이라고 설명한다.[](source:an-toast) 이 스킬의 toast는 "300ms 상한은 여기서도 지킨다"고 적는다.[](source:xr-toast) 두 스킬이 같은 컴포넌트에 다른 기준을 쓰므로, 웹 기준을 모바일로 그대로 옮기면 안 된다.

## 흐름 속 위치 {#position}

@workflow id=expo-position title="animate-expo 앞뒤"
| q-animate | animate | backend |
| q-perf | animation-performance | backend |
| q-expo | animate-expo | backend |
| q-device | 기기 확인(사람) | external |
| q-animate > q-expo | RN이면 | dashed |
| q-perf > q-expo | RN 스레드 | dashed |
| q-expo > q-device | 시험할 것 | emphasis |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `animate` | - | - | 서로 역할을 나눈다. `animate`는 React Native를 이 스킬에 미루고(r05), 이 스킬의 description은 웹을 `animate`에 미룬다(r06). 넘김 지시는 없다[](source:an-scope)[](source:ex-fm) | r05, r06 |
| `animation-performance` | - | - | 그쪽이 React Native 스레드 문제를 이 스킬 몫이라고 한다[](source:pf-scope) | r09 |
| `mobile-native`(묶음 밖) | - | - | 그쪽 description이 React Native는 이 스킬을 쓰라고 한다[](source:mn-scope) | r14 |
| (뒤) | 뒤에 오는 스킬은 없다 | 코드와 기기 확인 메모 | 받는 쪽은 사람이다. 실제 기기에서 튕기고, 끊고, 되돌려 본다[](source:ex-out) | - |

원장에서 이 스킬의 역할은 motion-craft 묶음의 `변형`이다. 관계는 모두 역할 구분 참고라서 그림에 점선으로만 그렸다. r14는 묶음 밖이라 표에만 두었다.

전체 흐름은 `design/_group-motion-craft/motion-craft.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 2개, 합계 34,699B다. `SKILL.md` 17,891B와 `RECIPES.md` 16,808B를 모두 읽었다. 구조·표본만 본 파일은 없다.
- 관계 확인용으로 다른 스킬의 해당 줄만 읽었다. `animate/SKILL.md` 16줄(r05), `animate/RECIPES.md` 126~143줄(toast 비교), `animation-performance` 16줄(r09), `mobile-native` 3줄(r14)이다.
- 제외한 파일: 번역본 `SKILL.ko.md`(23,526B)와 `RECIPES.ko.md`(20,171B)는 열지 않았다. 바이너리 파일은 이 폴더에 없다.
- 원문 대조 범위(앞부분): 활성화 제한 1개(호출 제한 필드 없음)와 첫 응답 규칙, Hard Rules 5개, 빈도 표 4행과 tab 규칙, 도구 표 13행, 의존성 표 7행, 속성 규칙 7개를 대조했다.
- 원문 대조 범위(수치): spring 표 4행, easing 표 4행과 곡선 3개, duration 표 4행과 상한, 스레드 규칙 5개, press 규칙 5개를 대조했다.
- 원문 대조 범위(나머지): haptics 표 4행과 절대 규칙 3개, reduced motion, 설정 함정 4개, 120fps, Never Ship 17행, 출력 3항목을 대조했다. 레시피 11절(전제 설정 절 제외)의 수치도 모두 대조했다. 관계 행 r05, r06, r09, r14는 원장과 원문을 다시 대조했고 같다.
- 분석 중 바뀐 파일: 없음. 작업 트리는 commit `4e3fc89` 그대로다.
- 사람 검토: 미실시.

@callout level=open-question title="확인하지 못한 것"
- Reanimated, Expo Router API 이름(`scheduleOnRN`, `NativeTabs`, `headerLargeTitleEnabled` 등)이 현재 라이브러리 버전과 맞는지는 공식 문서로 확인하지 않았다. 원문은 버전에 강하게 묶여 있다.
- 레시피 코드를 기기에서 돌려 보지 않았다.
- 400ms spring과 300ms 상한의 관계는 원문이 설명하지 않는다.
