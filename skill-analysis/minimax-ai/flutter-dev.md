# flutter-dev 분석

## 원본

- 경로: `.agents/skills/flutter-dev/SKILL.md`
- 성격: Flutter 3와 Dart 기반 크로스플랫폼 앱 개발 가이드
- 주요 기술: Flutter, Dart, Riverpod, Bloc/Cubit, GoRouter, DevTools

## 적용 조건

Flutter 앱 개발, 상태 관리 구현, GoRouter 네비게이션, 커스텀 위젯, 성능 최적화, 테스트, 플랫폼별 구현을 할 때 사용한다.

## 동작 과정

1. 필요한 구현 영역을 분류한다.
   위젯, 상태 관리, async data, stream, navigation, responsive layout, list, form, hooks 중 어느 영역인지 파악한다.

2. 적절한 패턴을 선택한다.
   단순 상태는 Riverpod `StateProvider`, 복잡 상태는 `NotifierProvider` 또는 Bloc, 비동기는 `FutureProvider`/`AsyncNotifierProvider`, navigation은 GoRouter를 사용한다.

3. 위젯 최적화를 적용한다.
   정적 위젯은 `const`, 리스트 항목에는 Key, state 의존 위젯은 `ConsumerWidget`, 재사용 위젯은 별도 파일로 추출한다.

4. 상태 관리를 안전하게 만든다.
   상태 객체는 immutable로 두고 직접 mutation하지 않는다. `select()`로 필요한 필드만 watch해 rebuild를 줄인다.

5. 레이아웃과 반응형 규칙을 적용한다.
   8pt spacing, mobile/tablet/desktop breakpoints, Material 3/Cupertino 기준을 사용한다.

6. 성능을 측정한 뒤 최적화한다.
   DevTools로 frame time을 확인하고, `RepaintBoundary`, `ListView.builder`, `compute()` isolate, image caching을 적용한다.

7. 테스트 전략을 맞춘다.
   widget test, business logic unit test, integration test, Bloc `blocTest()`를 구분한다.

## 핵심 규칙

- 가능한 모든 정적 위젯에 `const` 생성자를 붙인다.
- rebuild를 줄이기 위해 `provider.select(...)`를 사용한다.
- 긴 리스트는 builder 기반 lazy list를 사용한다.
- 60fps를 위해 frame time은 16ms 미만을 목표로 한다.
- 무거운 계산은 `compute()`로 isolate에 넘긴다.

## 산출물 특성

이 스킬은 Flutter 구현에서 가장 자주 문제가 되는 rebuild, navigation, 상태 관리, 성능을 빠르게 정리하는 참조형 가이드다. 전체 세부 구현은 `references/`의 주제별 문서로 확장된다.

## 주의점

원본은 간결한 상위 가이드이고, 실제 상세 코드는 reference 파일을 필요에 따라 읽는 구조다. 어떤 상태 관리 도구를 쓸지는 기존 프로젝트 패턴과 사용자의 요구에 맞춰야 한다.
