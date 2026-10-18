# Search notes

검색(Search)을 통해 사용자는 제목이나 본문 텍스트로 노트를 찾고, 일치하는 노트를 살펴보고, 일치 항목 없음과 사용할 수 없는 검색을 구분할 수 있다.

## Sub-features (하위 기능)

- `search-open`은 지원되는 각 브라우저 진입점에서 검색을 연다.
- `search-match`는 노트 데이터를 바꾸지 않고 제목 및 본문 일치 항목을 반환한다.
- `search-open-result`는 결과를 노트 편집기에서 연다.
- `search-empty`는 일치 항목이 없는 쿼리에 대해 완전한 빈 상태를 표시한다.
- `search-clear`는 쿼리를 지우고 최근 노트 보기를 복원한다.
- `search-cli`는 터미널에서 같은 일치 노트들을 반환한다.

## How to get to it (user POV) (접근 방법, 사용자 관점)

- 브라우저 툴바에서 `Search` 버튼을 선택한다.
- 편집 가능한 필드 밖에 포커스가 있을 때 브라우저에서 `/`를 누른다.
- 터미널에서 `notes search <query>`를 실행한다.

## Driving it with control-notes (control-notes로 구동하기)

Preconditions:

- Notes가 `http://127.0.0.1:4173`에서 정상이다.
- 일회용 데이터 디렉터리에 본문 텍스트가 `Draft budget`인 `Quarterly plan`이 있다.
- `control-notes doctor`가 기대하는 URL과 데이터 디렉터리를 보고한다.

- **Toolbar entry.** `Search` 버튼을 선택한다. `control-notes browser click --role button --name "Search"`를 실행한다. 검색박스에 포커스가 있는 `Search notes`라는 이름의 대화상자가 나타난다.
- **Keyboard entry.** 대화상자를 닫고 페이지에 포커스를 둔 뒤 `/`를 누른다. `control-notes browser press --key "/"`를 실행한다. 같은 대화상자가 나타나고 페이지에는 슬래시가 입력되지 않는다.
- **Title match.** `quarterly`를 입력한다. `control-notes browser fill --role searchbox --name "Search notes" --value "quarterly"`를 실행한다. `Search results` 목록에 `Quarterly plan`이 있고 `Grocery list`는 없다.
- **Body match.** 쿼리를 `budget`으로 바꾼다. `control-notes browser fill --role searchbox --name "Search notes" --value "budget"`를 실행한다. 결과 `Quarterly plan`이 본문 일치 발췌와 함께 계속 보인다.
- **Open result.** `Quarterly plan`을 선택한다. `control-notes browser click --role link --name "Quarterly plan"`을 실행한다. 대화상자가 닫히고 편집기 제목(heading)이 `Quarterly plan`으로 표시된다.
- **Empty state.** 검색을 다시 열고 `volcano`를 입력한다. `control-notes browser fill --role searchbox --name "Search notes" --value "volcano"`를 실행한다. 검색이 완료된 뒤 `No matching notes`라는 이름의 상태가 나타난다.
- **Clear query.** `Clear search`를 선택한다. `control-notes browser click --role button --name "Clear search"`를 실행한다. 검색박스가 비고 `Recent notes` 영역이 결과 목록을 대체한다.
- **CLI match.** 터미널에서 검색한다. `control-notes cli -- notes search "quarterly" --format json`을 실행한다. 종료 코드 `0`이고 stdout에 제목이 `Quarterly plan`인 객체 하나가 들어 있다.
- **CLI miss.** 존재하지 않는 값을 검색한다. `control-notes cli -- notes search "volcano" --format json`을 실행한다. 종료 코드 `0`이고 stdout은 `[]`이다.
- **Proof.** 결과가 채워진 상태를 캡처한다. `control-notes browser snapshot --aria --path artifacts/search/results.aria.txt`와 `control-notes browser screenshot --path artifacts/search/results.png`를 실행한다. 두 산출물 모두 Notes, 쿼리, `Quarterly plan`을 식별할 수 있다.

## Gotchas (주의점)

- 편집기나 검색박스에 포커스가 있을 때 `/`를 누르면 검색이 열리는 대신 텍스트가 입력된다.
- 결과는 짧은 디바운스 후에 갱신된다. 고정된 sleep이 아니라 결과 목록이나 빈 상태 표시를 기다려라.
- 사용자가 `Include archived`를 활성화하지 않는 한 보관된 노트는 제외된다.
- CLI는 기본적으로 사람이 읽을 수 있는 출력을 낸다. 안정적인 assertion에는 `--format json`을 사용하라.
- 결과를 열면 브라우저 상태가 바뀐다. 다른 쿼리를 증명하기 전에 검색을 다시 열어라.
