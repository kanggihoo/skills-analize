---
name: ponytail-debt
description: >
  모든 `shortcut:` 주석(과 예전의 `ponytail:` 주석)을 부채 장부(debt ledger)로 모읍니다. 한 번 실행하는 보고서이며 아무것도 바꾸지 않습니다. "ponytail debt", "what did ponytail defer", "list the shortcuts", /ponytail-debt에 씁니다.
---

> 원본: `SKILL.md`. 프런트매터 키와 트리거 문구, 명령어는 원문 그대로 둡니다.

ponytail이 의도적으로 택한 모든 shortcut에는 `shortcut:` 주석이 달려 있고, 그 주석에는 한계(ceiling)와 업그레이드 경로가 적혀 있습니다(예전 코드에는 `ponytail:`이라고 적혀 있을 수 있습니다). 이 명령은 그 주석들을 하나의 장부로 모읍니다. 그래야 미뤄 둔 작업이 소리 없이 영구적인 것이 되지 않습니다.

## 스캔

주석 표지를 저장소에서 grep합니다. `.git`과 `.gitignore` 파일이 무시하는 모든 것(의존성, 빌드 결과물, 캐시, 어떤 스택이든)은 건너뜁니다.

`git grep --no-index --exclude-standard -nE '(#|//|/[*]) ?(shortcut|ponytail):'` (스택이 다른 주석 접두사를 쓰면 추가합니다)

사용자가 자신의 표지 단어를 지정하면(`/ponytail-debt TODO`), 그 단어를 대신 grep합니다.

검색 결과 한 줄이 장부의 한 행입니다. 주석 접두사 덕분에 이 관례를 단순히 언급하기만 한 글은 장부에 들어가지 않습니다. 미룬 작업이 아닌 결과(예: 키보드 단축키에 대한 메모)는 건너뜁니다.

## 출력

표지마다 한 행씩, 파일별로 묶어서 씁니다.

`<file>:<line>, <what was simplified>. ceiling: <the limit named>. upgrade: <the trigger to revisit>.`

관례는 `shortcut: <ceiling>, <upgrade path>`이므로, 한계와 재검토 시점은 주석에서 그대로 가져옵니다. 행마다 담당자도 알고 싶다면 `git blame -L<line>,<line>`을 더합니다.

업그레이드 경로나 재검토 시점을 적지 않은 표지 주석에는 `no-trigger` 태그를 붙여 부패 위험(rot risk)을 표시합니다. 이런 주석이 조용히 썩어 갑니다.

마지막에 `<N> markers, <M> with no trigger.`를 씁니다. 발견된 것이 없으면 `No shortcut debt. Clean ledger.`를 씁니다.

## 경계

읽고 보고만 하며 아무것도 바꾸지 않습니다. 파일로 남기려면 사용자에게 물어본 뒤, 장부를 파일(예: `PONYTAIL-DEBT.md`)로 씁니다. 한 번 실행하는 명령입니다.
