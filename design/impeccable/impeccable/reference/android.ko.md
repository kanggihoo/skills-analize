# Android 플랫폼

네이티브 Android 앱에 적용합니다. Jetpack Compose, Android Views, React Native, Expo, Flutter로 Android 기기에 출시하는 앱이 포함됩니다.

네이티브 화면에서는 방문자 모드가 시각적 표현이 플랫폼 관례보다 우선할 수 있는 범위를 좁힙니다. 모든 모드에서 구조, 탐색, 상호작용은 Material Design 3를 따릅니다. 브랜드는 Material의 테마(색상 역할, 글꼴 크기 체계, 형태, 모션)를 통해 표현합니다. Material을 전면에 적용한 크로스 플랫폼 앱을 iPhone에도 출시한다면 iOS가 그 기기에서 보장하는 안전 영역 inset, Reduce Motion, 가장자리에서 쓸어 뒤로 가기 동작도 지켜야 합니다.

## Android 품질 검사

Android에 익숙한 사용자가 앱을 신뢰할까요, 아니면 명세를 벗어난 컴포넌트에서 걸릴까요? 가장 흔한 징후는 Android 모양만 덧입힌 iOS 앱입니다. iPhone식 하단 탐색을 그대로 쓰거나, 시스템 Back 제스처를 무시하는 뒤로 가기 화살표를 두거나, Cupertino 스타일의 스위치와 대화상자를 사용하는 경우입니다. Material 3가 기준입니다. 컴포넌트를 따르고 그 안에서 브랜드 테마를 구현하세요.

## 레이아웃과 구조

- **크기에 맞는 Material 탐색**: 너비가 좁으면 하단 탐색 바(목적지 3~5개), 확장 너비에서는 탐색 rail이나 drawer를 사용합니다. 휴대전화용 하단 바를 바꾸지 않고 태블릿에 출시하지 않습니다.
- **시스템 Back은 항상 작동해야 합니다.** 예측형 Back 제스처와 Back 버튼을 따릅니다. 사용자를 가두거나 제스처를 가로채지 않습니다.
- **window inset을 반영한 edge-to-edge 화면**: 상태 표시줄, 탐색 바, 화면 cutout, IME의 inset을 적용해 콘텐츠가 시스템 바나 키보드 뒤로 숨지 않게 합니다.
- 화면 맥락에는 상단 앱 바를 사용하고, 화면에 주요 동작이 하나라면 FAB를 함께 둡니다.

## 터치 영역

- 모든 터치 대상은 최소 **48×48 dp**이며, 대상 사이에 최소 8 dp를 둡니다.

## 타이포그래피

- **Material 글꼴 크기 체계**: Display, Headline, Title, Body, Label 역할을 각각 large / medium / small 크기로 사용합니다. 텍스트에 역할을 지정하고 화면마다 임의로 크기를 고르지 않습니다.
- **시스템 기본 글꼴은 Roboto**입니다. 글꼴 크기 체계를 통해 브랜드 글꼴을 적용하되 본문, 레이블, 컨트롤의 가독성과 일관성을 지킵니다.
- 글꼴은 시스템 크기 설정을 따르도록 고정 px 대신 **sp 단위**를 사용합니다.

## 색상과 테마

- **Material 색상 역할**(primary, on-primary, surface, surface-variant, secondary-container, outline, error)을 사용합니다. 역할 토큰은 밝고 어두운 테마 및 대비 변형을 자동으로 처리하므로 원시 hex 색상은 이를 깨뜨립니다.
- 적합한 경우 **Dynamic Color(Material You)**를 사용합니다. Android 12 이상에서 사용자 배경 화면으로 색상 구성을 만들고, 정적 대체 테마도 준비합니다.
- **어두운 테마도 정식 테마입니다.** 설계하고 확인해야 합니다. 밝은 색을 반전하는 임시 방편은 피합니다.
- **Tonal elevation**: 표준 surface 색조 단계로 높낮이를 표현하고, 필요한 경우에만 그림자를 더합니다. 임의의 drop shadow를 사용하지 않습니다.

## 컴포넌트와 모션

- **Material 컴포넌트**를 사용합니다. 버튼(filled / tonal / outlined / text), FAB, 스위치, 칩, snackbar, 하단 시트, Material 대화상자, 탐색 바 / rail / drawer를 사용합니다. iOS 컨트롤을 가져오거나 임의로 대체품을 만들지 않습니다.
- **FAB 하나에 주요 동작 하나**를 맡깁니다. FAB를 여러 개 쌓거나 부차적인 작업에 사용하지 않습니다.
- 일시적인 피드백에는 **snackbar**를 사용합니다(필요하면 동작 버튼 제공, toast로 대신하지 않음). 사용을 끊고 확인을 받아야 하는 결정에만 대화상자를 씁니다.
- **Material 모션 패턴**: container transform, shared-axis, fade-through와 표준 easing 및 지속 시간을 사용합니다. 시스템의 애니메이션 제거 설정을 따라 crossfade 또는 즉시 전환을 제공합니다.

## 빌드 검증

- **스크린샷은 브라우저가 아니라 에뮬레이터나 연결된 기기에서 얻습니다.** 앱을 빌드하고 설치한 뒤 `adb exec-out screencap -p > <path>`로 캡처합니다(기기가 여러 대면 `adb -s <serial>`을 사용). 앱을 출시할 모든 기기 종류를 캡처합니다. 휴대전화는 최소 한 대, 태블릿을 대상으로 하면 태블릿도 최소 한 대 포함하고, 검토 흐름에서 찾을 수 있는 위치에 파일을 둡니다.
- **어두운 테마와 글꼴 크기도 검토에 포함합니다.** `adb shell cmd uimode night yes`로 테마를 바꾸고 `adb shell settings put system font_scale 1.3`으로 글꼴 크기를 바꿉니다. 먼저 `adb shell cmd uimode night`와 `adb shell settings get system font_scale`로 현재 설정을 확인하고, 작업 뒤 복원합니다. 대상 기기가 여러 대면 이 명령에도 `-s <serial>`을 지정합니다. 고정 레이아웃에서 잘리는 레이블을 찾아낼 수 있습니다.
- 에뮬레이터는 다양한 화면 확인에 적합하지만 제스처, 화면 주사율, 성능은 실제 기기에서 확인해야 합니다. 어떤 기기에서 증거를 얻었는지 밝힙니다.
