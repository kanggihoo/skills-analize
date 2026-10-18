# react-native-dev 분석

## 원본

- 경로: `.agents/skills/react-native-dev/SKILL.md`
- 성격: React Native와 Expo 앱 개발 가이드
- 주요 기술: Expo Router, FlashList, expo-image, Reanimated 3, Zustand/Jotai, React Query, EAS

## 적용 조건

React Native 또는 Expo 앱 개발, native UI, animation, navigation, state management, forms, networking, performance, testing, App Store/Play Store 배포, Expo SDK 업그레이드, NativeWind 설정에 사용한다.

## 동작 과정

1. 관련 reference를 선택한다.
   navigation, components, styling, animations, state, forms, networking, performance, testing, native capabilities, engineering 중 필요한 문서를 읽는다.

2. 새 프로젝트라면 Expo 기반으로 초기화한다.
   `create-expo-app --template blank-typescript` 후 Expo Router, safe-area, screens를 설치하고 entry point와 route layout을 구성한다.

3. 컴포넌트 선택을 최적화한다.
   긴 리스트는 `FlashList`, 이미지는 `expo-image`, press는 `Pressable`, animation은 Reanimated 3, gesture는 Gesture Handler를 우선한다.

4. 상태 관리를 분리한다.
   local UI는 `useState/useReducer`, shared app state는 Zustand/Jotai, server data는 React Query, form은 React Hook Form + Zod로 관리한다.

5. navigation과 safe area를 네이티브스럽게 구성한다.
   Expo Router stack/tabs, modal/sheet, `contentInsetAdjustmentBehavior="automatic"`을 사용한다.

6. 성능을 점검한다.
   profile mode에서 frame > 16ms, bundle size, barrel import, R8, list jank, animation drop을 확인한다.

7. 테스트와 배포를 준비한다.
   Jest, React Native Testing Library, Maestro, EAS build/submit, CI/CD를 필요에 따라 적용한다.

## 핵심 규칙

- `FlatList`보다 `FlashList`를 우선한다.
- RN `<Image>`보다 `expo-image`를 우선한다.
- `TouchableOpacity`보다 `Pressable`을 사용한다.
- `expo-av` 대신 `expo-audio`/`expo-video`를 사용한다.
- animation은 `transform`과 `opacity`만 움직인다.
- barrel import를 피하고 직접 import한다.
- route file은 kebab-case를 사용하고 `app/` 안에 component/type/util을 co-locate하지 않는다.
- `{count && <Text />}` 대신 `{count > 0 && <Text />}`를 사용한다.

## 산출물 특성

이 스킬은 Expo를 기본 선택지로 보고, native 느낌과 성능을 살리는 실용적 React Native 구조를 만든다. list, image, animation, navigation에서 현대 Expo 권장값을 강하게 반영한다.

## 주의점

custom build가 필요한 native module인지 Expo Go로 충분한지 먼저 판단해야 한다. 스킬은 reference 중심 구조이므로 구현 영역에 맞는 문서를 추가로 읽는 방식이다.
