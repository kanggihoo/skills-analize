# 노트 검색

검색을 사용하면 사용자가 제목이나 본문 텍스트로 노트를 찾고, 일치하는 노트를 열어 보며, 일치 결과가 없는 경우와 검색을 사용할 수 없는 경우를 구분할 수 있습니다.

## Sub-features

- `search-open`은 지원되는 각 브라우저 진입점에서 검색을 엽니다.
- `search-match`는 노트 데이터를 바꾸지 않고 제목과 본문 일치 결과를 반환합니다.
- `search-open-result`는 결과를 노트 편집기에서 엽니다.
- `search-empty`는 일치 결과가 없는 쿼리에 대해 완전한 빈 상태를 보여 줍니다.
- `search-clear`는 쿼리를 지우고 최근 노트 화면을 복원합니다.
- `search-cli`는 터미널에서 같은 일치 노트를 반환합니다.

## How to get to it (user POV)

- 브라우저 툴바에서 `Search` 버튼을 선택하세요.
- 포커스가 편집 가능한 필드 밖에 있을 때 브라우저에서 `/`를 누르세요.
- 터미널에서 `notes search <query>`를 실행하세요.

## Driving it with control-notes

Preconditions:

- Notes는 `http://127.0.0.1:4173`에서 정상 상태입니다.
- 일회용 데이터 디렉터리에 본문 텍스트가 `Draft budget`인 `Quarterly plan`이 있습니다.
- `control-notes doctor`가 예상되는 URL과 데이터 디렉터리를 보고합니다.

- **Toolbar entry.** `Search` 버튼을 선택하세요. `control-notes browser click --role button --name "Search"`를 실행하세요. `Search notes`라는 이름의 대화상자가 나타나며, 포커스는 그 안의 searchbox에 있습니다.
- **Keyboard entry.** 대화상자를 닫고, 페이지에 포커스를 두고 `/`를 누르세요. `control-notes browser press --key "/"`를 실행하세요. 같은 대화상자가 나타나고, 페이지에 슬래시가 입력되지 않아야 합니다.
- **Title match.** `quarterly`를 입력하세요. `control-notes browser fill --role searchbox --name "Search notes" --value "quarterly"`를 실행하세요. `Search results` 목록에 `Quarterly plan`이 있고, `Grocery list`는 없어야 합니다.
- **Body match.** 쿼리를 `budget`으로 바꾸세요. `control-notes browser fill --role searchbox --name "Search notes" --value "budget"`를 실행하세요. `Quarterly plan` 결과가 본문 일치 발췌문과 함께 계속 보여야 합니다.
- **Open result.** `Quarterly plan`을 선택하세요. `control-notes browser click --role link --name "Quarterly plan"`를 실행하세요. 대화상자가 닫히고, 편집기 제목에 `Quarterly plan`이 표시됩니다.
- **Empty state.** 검색을 다시 열고 `volcano`를 입력하세요. `control-notes browser fill --role searchbox --name "Search notes" --value "volcano"`를 실행하세요. 검색이 끝나면 `No matching notes`라는 이름의 상태 표시가 나타납니다.
- **Clear query.** `Clear search`를 선택하세요. `control-notes browser click --role button --name "Clear search"`를 실행하세요. searchbox가 비어 있고, `Recent notes` 영역이 결과 목록을 대체합니다.
- **CLI match.** 터미널에서 검색하세요. `control-notes cli -- notes search "quarterly" --format json`을 실행하세요. 종료 코드는 `0`이고, stdout에는 제목이 `Quarterly plan`인 객체 하나가 포함되어야 합니다.
- **CLI miss.** 존재하지 않는 값을 검색하세요. `control-notes cli -- notes search "volcano" --format json`을 실행하세요. 종료 코드는 `0`이고, stdout은 `[]`여야 합니다.
- **Proof.** 결과가 채워진 상태를 캡처하세요. `control-notes browser snapshot --aria --path artifacts/search/results.aria.txt`와 `control-notes browser screenshot --path artifacts/search/results.png`를 실행하세요. 두 산출물 모두 Notes, 쿼리, `Quarterly plan`을 식별할 수 있어야 합니다.

## Gotchas

- 편집기나 searchbox에 포커스가 있는 상태에서 `/`를 누르면 검색이 열리지 않고 텍스트가 입력됩니다.
- 결과는 짧은 디바운스 후에 갱신됩니다. 고정 대기 시간이 아니라 결과 목록이나 빈 상태 표시를 기다리세요.
- 보관된 노트는 사용자가 `Include archived`를 켜지 않으면 제외됩니다.
- CLI는 기본적으로 사람이 읽기 쉬운 출력을 사용합니다. 안정적인 단언을 위해서는 `--format json`을 쓰세요.
- 결과를 열면 브라우저 상태가 바뀝니다. 다른 쿼리를 증명하기 전에 검색을 다시 여세요.
