# 노트 만들기

노트 만들기는 사용자가 브라우저나 CLI에서 제목이 있는 노트를 저장하고, 끝내지 않은 초안을 취소하며, 저장된 노트를 두 번째 사용자 대상 화면에서 확인할 수 있게 합니다.

## Sub-features

- `create-open`은 브라우저의 각 진입점에서 빈 편집기를 엽니다.
- `create-save`는 제목과 본문을 저장합니다.
- `create-cancel`은 끝내지 않은 브라우저 초안을 버립니다.
- `create-cli`는 터미널에서 같은 형태의 노트를 만듭니다.

## How to get to it (user POV)

- 브라우저 툴바에서 `New note` 버튼을 선택하세요.
- 포커스가 편집 가능한 필드 밖에 있을 때 브라우저에서 `n`을 누르세요.
- 터미널에서 `notes create --title <title> --body <body>`를 실행하세요.

## Driving it with control-notes

Preconditions:

- Notes는 `http://127.0.0.1:4173`에서 정상 상태입니다.
- `Release checklist`라는 제목의 노트가 없습니다.
- `control-notes doctor`가 예상되는 URL과 일회용 데이터 디렉터리를 보고합니다.

- **Open editor.** `New note`를 선택하세요. `control-notes browser click --role button --name "New note"`를 실행하세요. `Note editor`라는 이름의 폼이 나타나고, 포커스는 `Title` textbox에 있습니다.
- **Enter content.** 제목과 본문을 입력하세요. `control-notes browser fill --role textbox --name "Title" --value "Release checklist"`와 `control-notes browser fill --role textbox --name "Body" --value "Tag and publish"`를 실행하세요. `Save note` 버튼이 활성화됩니다.
- **Save note.** `Save note`를 선택하세요. `control-notes browser click --role button --name "Save note"`를 실행하세요. `Note saved`라는 이름의 상태 표시가 나타나고, 제목에는 `Release checklist`가 표시됩니다.
- **Confirm persistence.** 노트 목록으로 돌아가 노트를 다시 여세요. `control-notes browser click --role link --name "All notes"`와 `control-notes browser click --role link --name "Release checklist"`를 실행하세요. 편집기에 저장된 두 값이 모두 표시됩니다.
- **Cancel draft.** 새 노트를 열고 `Discard me`를 입력한 뒤 `Cancel`을 선택하세요. `control-notes browser click --role button --name "New note"`, `control-notes browser fill --role textbox --name "Title" --value "Discard me"`, `control-notes browser click --role button --name "Cancel"`을 실행하세요. 노트 목록으로 돌아가며, `Discard me` 링크가 없어야 합니다.
- **CLI entry.** 두 번째 노트를 만드세요. `control-notes cli -- notes create --title "CLI note" --body "Created from terminal" --format json`을 실행하세요. 종료 코드는 `0`이고, stdout에는 새 노트의 ID와 제목이 포함되어야 합니다.
- **Proof.** `All notes`에서 저장된 두 노트를 다시 여세요. `control-notes browser snapshot --aria --path artifacts/create-note/list.aria.txt`와 `control-notes browser screenshot --path artifacts/create-note/list.png`를 실행하세요. 산출물에 `Release checklist`와 `CLI note`가 보여야 합니다.

## Gotchas

- 텍스트박스에 포커스가 있는 상태에서 `n`을 누르면 새 편집기가 열리지 않고 문자가 입력됩니다.
- 저장할 때 제목의 앞뒤 공백이 제거됩니다. 초안 입력값이 아니라 렌더링된 제목을 검증하세요.
- 저장 상태 표시만으로는 충분한 증거가 아닙니다. 목록에서 노트를 다시 열어 확인하세요.
- 픽스처 정리 과정에서 `Release checklist`와 `CLI note`는 삭제하되, 증명 산출물은 보관하세요.
