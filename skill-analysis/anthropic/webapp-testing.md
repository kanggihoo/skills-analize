# webapp-testing 분석

## 원본

- 원본 경로: `.agents/skills/webapp-testing/`
- 핵심 파일: `SKILL.md`
- 보조 파일: `scripts/with_server.py`, `examples/*.py`, `LICENSE.txt`
- 확인한 규모: 6개 파일, 약 512줄
- 성격: Playwright Python으로 로컬 웹앱을 실행/탐색/테스트하는 스킬

## 적용 조건

사용자가 로컬 웹앱의 UI 동작 검증, frontend debugging, screenshot capture, browser log 확인, 자동화 테스트를 요청할 때 사용한다.

## 동작 과정

1. static HTML인지 dynamic webapp인지 판단한다.

2. static HTML이면 HTML 파일을 직접 읽어 selector를 파악하고, file URL 기반 Playwright script를 작성한다.

3. dynamic webapp이고 server가 실행 중이 아니면 `scripts/with_server.py --help`를 먼저 실행한다.
   이 환경에서는 `python3 .agents/skills/webapp-testing/scripts/with_server.py --help`로 usage를 확인했다.

4. `with_server.py`를 사용해 하나 이상의 server를 띄우고 port readiness를 기다린 뒤 automation script를 실행한다.

5. server가 이미 실행 중이면 reconnaissance-then-action pattern을 따른다.
   navigate, `networkidle` wait, screenshot 또는 DOM inspection, selector 식별, action 실행 순서다.

6. Playwright script는 native Python으로 작성하고 `sync_playwright()`를 사용한다.

7. browser는 headless Chromium으로 실행하고, 끝나면 반드시 닫는다.

## 보조 파일 역할

- `scripts/with_server.py`: `--server`, `--port`, `--timeout`을 받아 server process를 시작하고 port readiness를 socket으로 polling한 뒤 command를 실행하고 cleanup한다.
- `examples/element_discovery.py`: button/link/input discovery 예시
- `examples/static_html_automation.py`: local HTML file automation 예시
- `examples/console_logging.py`: browser console log capture 예시

## 핵심 규칙

- helper script는 source를 먼저 읽지 말고 `--help`부터 실행한다.
- dynamic app에서는 DOM inspection 전에 `page.wait_for_load_state('networkidle')`를 반드시 수행한다.
- server lifecycle은 가능한 helper script에 맡긴다.
- selector는 rendered state에서 발견한 뒤 action에 사용한다.
- browser는 항상 close한다.

## 산출물 특성

- Playwright Python automation script
- screenshot 또는 DOM inspection 결과
- console log capture
- local webapp 기능 검증 결과
- server lifecycle이 포함된 테스트 실행

## 주의점

- DOM을 너무 빨리 읽으면 JS 실행 전 상태를 보고 잘못된 selector를 잡을 수 있다.
- helper는 black-box로 쓰도록 설계되어 있으므로 불필요하게 source를 읽어 context를 낭비하지 않는다.
- 여러 server가 필요한 경우 `--server`와 `--port` 개수를 맞춰야 한다.
