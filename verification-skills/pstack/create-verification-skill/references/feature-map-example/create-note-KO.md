# Create a note

노트 만들기(Create note)를 통해 사용자는 브라우저나 CLI에서 제목이 있는 노트를 저장하고, 작성 중인 초안을 취소하고, 저장된 노트를 두 번째 사용자 대면 뷰에서 확인할 수 있다.

## Sub-features (하위 기능)

- `create-open`은 각 브라우저 진입점에서 빈 편집기를 연다.
- `create-save`는 제목과 본문을 영속화한다.
- `create-cancel`은 작성 중인 브라우저 초안을 버린다.
- `create-cli`는 터미널에서 같은 형태의 노트를 만든다.

## How to get to it (user POV) (접근 방법, 사용자 관점)

- 브라우저 툴바에서 `New note` 버튼을 선택한다.
- 편집 가능한 필드 밖에 포커스가 있을 때 브라우저에서 `n`을 누른다.
- 터미널에서 `notes create --title <title> --body <body>`를 실행한다.

## Driving it with control-notes (control-notes로 구동하기)

Preconditions:

- Notes가 `http://127.0.0.1:4173`에서 정상이다.
- 제목이 `Release checklist`인 노트가 없다.
- `control-notes doctor`가 기대하는 URL과 일회용 데이터 디렉터리를 보고한다.

- **Open editor.** `New note`를 선택한다. `control-notes browser click --role button --name "New note"`를 실행한다. `Title` 텍스트박스에 포커스가 있는 `Note editor`라는 이름의 폼이 나타난다.
- **Enter content.** 제목과 본문을 입력한다. `control-notes browser fill --role textbox --name "Title" --value "Release checklist"`와 `control-notes browser fill --role textbox --name "Body" --value "Tag and publish"`를 실행한다. `Save note` 버튼이 활성화된다.
- **Save note.** `Save note`를 선택한다. `control-notes browser click --role button --name "Save note"`를 실행한다. `Note saved`라는 이름의 상태가 나타나고 제목(heading)이 `Release checklist`로 표시된다.
- **Confirm persistence.** 노트 목록으로 돌아가 노트를 다시 연다. `control-notes browser click --role link --name "All notes"`와 `control-notes browser click --role link --name "Release checklist"`를 실행한다. 편집기에 저장된 두 값이 모두 표시된다.
- **Cancel draft.** 새 노트를 열고 `Discard me`를 입력한 뒤 `Cancel`을 선택한다. `control-notes browser click --role button --name "New note"`, `control-notes browser fill --role textbox --name "Title" --value "Discard me"`, `control-notes browser click --role button --name "Cancel"`를 실행한다. 노트 목록이 돌아오고 `Discard me` 링크가 없다.
- **CLI entry.** 두 번째 노트를 만든다. `control-notes cli -- notes create --title "CLI note" --body "Created from terminal" --format json`을 실행한다. 종료 코드 `0`이고 stdout에 새 노트 ID와 제목이 들어 있다.
- **Proof.** `All notes`에서 저장된 두 노트를 다시 연다. `control-notes browser snapshot --aria --path artifacts/create-note/list.aria.txt`와 `control-notes browser screenshot --path artifacts/create-note/list.png`를 실행한다. 산출물에 `Release checklist`와 `CLI note`가 표시된다.

## Gotchas (주의점)

- 텍스트박스에 포커스가 있을 때 `n`을 누르면 새 편집기가 열리는 대신 그 문자가 입력된다.
- 제목은 저장 시 앞뒤 공백이 제거된다. 초안 입력값이 아니라 렌더링된 제목을 assertion하라.
- 저장 상태만으로는 증명이 충분하지 않다. 목록에서 노트를 다시 열어라.
- 픽스처 정리 중에 `Release checklist`와 `CLI note`는 제거하되, 그 증명 산출물은 보존한다.
