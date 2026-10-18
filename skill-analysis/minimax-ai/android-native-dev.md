# android-native-dev 분석

## 원본

- 경로: `.agents/skills/android-native-dev/SKILL.md`
- 성격: Android 네이티브 앱 개발 및 UI 설계 가이드
- 주요 기술: Kotlin, Jetpack Compose, Gradle, Material Design 3, AndroidX, ViewModel, Coroutine

## 적용 조건

Android 네이티브 앱을 만들거나 수정할 때 사용한다. 새 Android 프로젝트 초기화, Gradle 설정, Kotlin/Compose 구현, Material 3 UI 검토, 빌드 오류 진단, Android 테스트 전략을 다룬다.

## 동작 과정

1. 프로젝트 상태를 먼저 판별한다.
   빈 디렉토리인지, Gradle Wrapper가 있는지, Android Studio 프로젝트인지, 일부 파일만 있는 불완전한 프로젝트인지 확인한다.

2. 빌드 가능한 최소 구성을 확보한다.
   비즈니스 로직 작성 전 `gradle.properties`, `settings.gradle.kts`, 루트와 app 모듈 `build.gradle.kts`, `AndroidManifest.xml`, `MainActivity.kt`, 리소스 구조를 갖추고 `./gradlew assembleDebug`가 통과해야 한다.

3. Gradle/AndroidX 설정을 정리한다.
   `android.useAndroidX=true`, `android.enableJetifier=true`, Kotlin 스타일, 병렬 빌드, JVM 메모리 설정을 점검한다.

4. Kotlin 표준을 적용한다.
   null safety, 예외 전파, `Result` 사용, coroutine dispatcher 분리, visibility, `lateinit` 오용 방지, 서버 응답 DTO nullable 처리, lifecycle observer 해제, 로그 레벨을 관리한다.

5. Compose 규칙을 적용한다.
   Composable 호출 컨텍스트, `LaunchedEffect`로 suspend 호출, `remember`, `derivedStateOf`, `StateFlow`, ViewModel 연결, recomposition 비용을 고려한다.

6. 리소스와 아이콘을 점검한다.
   mipmap 해상도별 아이콘, adaptive icon, 리소스 네이밍, Android 예약어 충돌을 피한다.

7. 빌드 오류를 진단한다.
   `Unresolved reference`, `Type mismatch`, `@Composable invocations`, `Duplicate class`, `AAPT error`를 원인별로 좁히고 `clean assembleDebug`, dependency tree, stacktrace를 사용한다.

8. Material Design 3와 품질 기준을 검토한다.
   앱 카테고리에 맞는 시각 스타일을 고르고 8dp grid, 48dp 터치 타깃, 명도 대비, dark theme, contentDescription, startup time 등을 확인한다.

9. 테스트는 요청 시 추가한다.
   사용자가 테스트를 요구할 때만 의존성을 추가하며, unit, Robolectric, instrumentation, Compose UI, managed device 계층을 구분한다.

## 핵심 규칙

- 비즈니스 로직보다 먼저 `assembleDebug` 성공을 만든다.
- 서버 응답 DTO 필드는 nullable로 둔다.
- 네트워크/파일 I/O는 `Dispatchers.IO`, UI 갱신은 Main에서 처리한다.
- Compose에서 객체를 매번 생성하지 말고 `viewModel()` 또는 `remember`를 쓴다.
- interactive element에는 `contentDescription`을 제공한다.
- 48dp 미만 터치 타깃, 5개 초과 bottom nav, dark theme 미지원은 피한다.

## 산출물 특성

이 스킬은 단순 코드 작성보다 "빌드 가능한 Android 앱"을 우선한다. 프로젝트 설정, Kotlin 안정성, Compose 상태 관리, Material 3, 빌드 진단까지 포함하는 개발 절차형 스킬이다.

## 주의점

참조 문서가 여러 개 있지만, 작업에 필요한 항목만 읽도록 설계되어 있다. 테스트 의존성은 사용자가 명시적으로 요청한 경우에만 추가한다는 제한이 있다.
