# Notes 검증 맵(Notes verification map)

이 디렉터리는 Notes의 사용자 대면 동작을 검증하기 위해 유지되는 원천이다. 앱을 구동하기 전에 인덱스를 읽고, 해당하는 기능 파일을 레시피로 사용한다.

## 기준 사전 조건(Baseline preconditions)

- 일회용 데이터 디렉터리로 Notes를 `http://127.0.0.1:4173`에서 실행한다.
- 동시 실행들이 상태를 공유하지 않도록 `NOTES_DATA_DIR=/tmp/notes-verify-$RUN_ID`를 설정한다.
- 제목이 `Quarterly plan`과 `Grocery list`인 노트를 시드한다.
- `control-notes`와 `notes` CLI를 `PATH`에 둔다.
- `control-notes doctor`를 실행하고 기대하는 URL, 데이터 디렉터리, 빌드 리비전을 요구한다.
- 이 검증 실행이 시작하지 않은 인스턴스는 절대 구동하지 마라.

## 구동 규약(Driving conventions)

- 레시피의 사전 조건이 달리 말하지 않는 한 모든 레시피는 기준 상태에서 시작한다.
- CSS 셀렉터나 DOM 위치보다 ARIA role과 접근 가능한 이름(accessible name)을 선호한다.
- 모든 명령을 문자 그대로 취급한다. 따옴표로 묶인 이름과 플래그를 바꾸지 마라.
- 브라우저 동작은 `control-notes browser`로 실행한다.
- 터미널 동작은 `control-notes cli -- <command>`로 실행한다.
- 변경(mutation) 후에는 시드 데이터를 복원한다. 정리 중에 증명 산출물을 제거하지 마라.

## 증명 및 건너뜀 보고(Proof and skip reporting)

- 최종 화면만이 아니라 사용자 동작과 그 결과 상태를 캡처한다.
- UI 증명에는 ARIA 스냅샷과, 앱 정체성이 보이는 스크린샷이 포함된다.
- CLI 증명에는 명령, stdout, stderr, 종료 코드가 포함된다.
- 변경(mutation) 증명에는 저장된 값에 대한 읽기 전용의 두 번째 뷰가 포함된다.
- 모든 산출물과 함께 사용한 기능 ID와 진입점을 기록한다.
- 도달할 수 없는 경로는 시도한 명령과 충족되지 않은 사전 조건과 함께 보고한다.
- 건너뛴 진입점을 다른 경로를 통해 검증된 것으로 보고하지 마라.

## 기능 항목 계약(Feature entry contract)

각 기능 파일은 H1 제목과, 사용자에게 보이는 동작을 설명하는 한 단락으로 시작한다. 그다음 정확히 네 개의 H2 섹션을 이 순서로 사용한다.

1. `Sub-features`는 짧은 ID들과 각 동작당 한 줄을 나열한다.
2. `How to get to it (user POV)`는 모든 사용자 진입점을 나열한다.
3. `Driving it with <harness>`는 `Preconditions:`로 시작하며, 각 사용자 동작을 정확한 명령 및 관찰 가능한 결과와 짝짓는 레이블 달린 글머리 기호를 사용한다.
4. `Gotchas`는 검증 실행을 낭비하게 하거나 무효화할 수 있는 함정들을 나열한다.

구현 세부 사항은 맵에 넣지 마라. 사용자 경로, 안정적인 핸들, 필요한 상태, 명령, 관찰 가능한 증명만 명시한다.

## 기능(Features)

- [Create a note](./create-note-KO.md)는 브라우저와 CLI에서의 생성, 취소, 영속성, 정리를 다룬다.
- [Search notes](./search-KO.md)는 툴바, 키보드, CLI 검색을 일치, 빈 결과, 초기화 상태와 함께 다룬다.
