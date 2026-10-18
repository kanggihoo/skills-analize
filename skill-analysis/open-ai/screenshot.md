# screenshot 분석

## 원본

- 원본 경로: `.agents/skills/screenshot/`
- 핵심 파일: `SKILL.md`
- 보조 파일: `scripts/`, `agents/openai.yaml`, `assets/`
- 확인한 규모: 11개 파일, 약 1,482줄
- 성격: OS 수준 screenshot을 안전하게 캡처하고 저장 경로를 관리하는 실행형 스킬

## 적용 조건

이 스킬은 사용자가 명시적으로 desktop/system screenshot을 요청하거나, browser/Figma/Playwright 같은 도구별 screenshot 기능으로는 필요한 화면을 얻을 수 없을 때 동작한다.

대표 요청은 다음과 같다.

- 전체 화면 screenshot 찍어줘
- 특정 앱이나 창 캡처
- 특정 pixel region 캡처
- 현재 화면을 보고 설명
- 브라우저 도구 screenshot이 불가능해서 OS-level capture가 필요함

도구별 screenshot 기능이 존재하면 우선순위는 그쪽이 높다. 예를 들어 브라우저 UI는 Playwright나 agent-browser screenshot이 더 적합하다.

## 저장 위치 규칙

항상 다음 순서로 저장 경로를 결정한다.

1. 사용자가 path를 지정하면 그 경로에 저장한다.
2. 사용자가 path 없이 screenshot을 요청하면 OS 기본 screenshot 위치에 저장한다.
3. Codex가 자체 확인을 위해 찍는 screenshot이면 temp directory에 저장한다.

## 동작 과정

1. screenshot 목적과 capture 범위를 결정한다.
   전체 화면, 앱, 창 제목, window id, active window, pixel region, interactive selection 중 하나를 고른다.

2. 더 적합한 도구가 있는지 먼저 판단한다.
   Figma MCP, Playwright, browser automation 도구로 충분하면 이 스킬 대신 그 도구를 사용한다.

3. OS를 구분한다.
   macOS/Linux는 Python helper, Windows는 PowerShell helper를 쓴다.

4. macOS에서는 권한 preflight를 먼저 수행한다.
   `scripts/ensure_macos_permissions.sh`가 Screen Recording permission을 점검하고 필요한 설명을 제공한다.

5. helper script를 실행한다.
   기본 helper는 `scripts/take_screenshot.py`이고, Windows는 `scripts/take_screenshot.ps1`이다.

6. helper가 출력한 path를 읽는다.
   multi-display나 여러 window match가 있으면 여러 path가 출력될 수 있다.

7. 필요한 경우 `view_image`로 파일을 확인한다.

8. 최종 응답에 저장된 파일 경로를 반드시 보고한다.

## Python helper 구조

`scripts/take_screenshot.py`는 macOS와 Linux를 처리한다.

주요 기능은 다음과 같다.

- `--path`: 명시적 저장 경로 또는 디렉토리
- `--mode default|temp`: OS 기본 위치 또는 temp 저장
- `--format`: 기본 png
- `--app`: macOS 앱 이름 기반 창 캡처
- `--window-name`: macOS window title substring
- `--list-windows`: macOS window id 목록 출력
- `--region x,y,w,h`: pixel region 캡처
- `--window-id`: 특정 window id 캡처
- `--active-window`: active window 캡처
- `--interactive`: OS interactive selection 사용

인자 충돌도 명확히 검증한다. 예를 들어 `--region`과 `--window-id`, `--region`과 `--app`, `--interactive`와 `--window-id`는 동시에 사용할 수 없다.

macOS에서는 `screencapture`를 사용하고, display가 여러 개면 `-d<display>` suffix를 붙인 여러 출력 파일을 만들 수 있다. window capture는 `-l<window-id>`, region capture는 `-R<x,y,w,h>`를 사용한다.

Linux에서는 가능한 도구를 순서대로 선택한다.

1. `scrot`
2. `gnome-screenshot`
3. ImageMagick `import`

region capture는 `scrot` 또는 ImageMagick이 필요하고, active window는 `scrot`, `gnome-screenshot`, 또는 `import + xdotool` 조합을 사용한다.

## macOS 보조 스크립트

`scripts/ensure_macos_permissions.sh`는 Swift helper를 사용해 Screen Recording 권한을 요청하고, Swift module cache를 temp 쪽으로 보내 sandbox 관련 permission prompt를 줄인다.

Swift 파일의 역할은 다음과 같다.

- `macos_permissions.swift`: screen capture 권한 확인 및 요청
- `macos_window_info.swift`: window id, app name, title, layer, bounds 등을 조회하고 rank 계산
- `macos_display_info.swift`: display 정보 조회

## Windows helper

`scripts/take_screenshot.ps1`은 PowerShell 기반이다.

지원 기능은 다음과 같다.

- 기본 위치 저장
- temp 저장
- 명시 path 저장
- region capture
- active window capture
- window handle 기반 capture

## 핵심 규칙

- 사용자가 screenshot을 요청했으면 저장된 path를 반드시 알려야 한다.
- Codex 내부 검증용 screenshot은 temp에 저장한다.
- macOS 앱/window capture 전에 권한 preflight를 수행한다.
- sandbox에서 화면 캡처가 막히면 권한 상승 재실행이 필요할 수 있다.
- `--app`, `--window-name`, `--list-windows`는 macOS 전용이다.
- Linux에서 앱 이름 기반 capture는 지원하지 않는다.

## 산출물 특성

정상 산출물은 하나 이상의 이미지 파일 경로다.

예시는 다음과 같다.

- OS 기본 screenshot 폴더의 png
- temp directory의 `codex-shot-...png`
- 사용자가 지정한 `output/screen.png`
- multi-display 또는 multi-window인 경우 suffix가 붙은 여러 파일

## 주의점

- screenshot은 GUI/OS 권한과 sandbox에 민감하다.
- macOS에서 앱 이름으로 캡처했는데 match가 없으면 `--list-windows --app "AppName"`으로 window id를 찾고 다시 시도해야 한다.
- Linux에서 필요한 도구가 없으면 `scrot`, `gnome-screenshot`, ImageMagick 중 하나 설치를 안내해야 한다.
- helper script 사용이 우선이고, `screencapture`, `scrot`, `gnome-screenshot`, `import` 직접 호출은 fallback이다.
