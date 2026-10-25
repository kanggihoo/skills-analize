# 명령 안내

## 워크플로 질문

명령은 실행하지 않고 조언만 합니다. 아래 메뉴는 인자 없이 호출했을 때만 사용합니다. 전제 조건과 범위를 확인하려면 필요한 명령 참조 문서를 읽습니다. 더 넓은 워크플로 안내는 [문서](https://impeccable.style/docs/)를 참고하도록 링크합니다. 사용자가 실행도 요청했다면 그 요청을 따릅니다.

## 인자 없는 호출: 맥락에 맞는 메뉴

사용자가 `$impeccable`을 인자 없이 실행하면 이 문서를 읽습니다. 사용자는 “무엇을 하면 되나요?”라고 묻는 것입니다. 고정된 메뉴가 아니라 현재 맥락에 맞춰 메뉴를 구성합니다.

Setup에서 이미 `impeccable context`를 실행했습니다. 결과가 `NO_PRODUCT_MD`라면 아직 프로젝트 맥락을 기록하지 않았습니다. `$impeccable init`을 최우선 추천으로 한 줄로 이유를 설명하고 나머지 메뉴도 계속 보여 줍니다. 사용자 요청 없이 조용히 init만 실행하지 않습니다. 그 외에는 `.agents/skills/impeccable/scripts/impeccable signals`를 한 번 실행하고 JSON을 읽습니다. Signals 결과에서 뽑은 한 줄 이유와 함께 **가치가 가장 큰 다음 명령 2~3개**를 먼저 제안한 뒤, Commands 표의 전체 메뉴를 분류별로 보여 줍니다. **명령을 자동 실행하지 않습니다. 추천은 사용자가 확인할 선택지입니다.**

점수에 따르지 않고 signals를 해석합니다.

- `setup.hasDesign`은 false이고 `setup.hasCode`는 true → 시각 시스템을 기록하는 `document`
- `critique.latest`가 `null` → 프로젝트에 실제 화면이 있다면 비평한 적이 없으므로 `$impeccable critique <surface>`를 기본 제안으로 삼기 좋음
- `critique.latest`에 낮은 `score`나 0이 아닌 `p0` / `p1`이 있음 → snapshot을 backlog로 읽고 오래됐거나 모두 해결되면 닫는 `polish`
- `git.changedFiles`가 한 화면을 가리킴 → 해당 파일만 정확히 지정해 `audit` 또는 `polish`
- `devServer.running`이 true → 브라우저에서 반복 작업하는 `live`와 이름이 지정된 요소를 한 번에 변형하는 `generate` 사용 가능. false면 둘 다 먼저 추천하지 않음. **`live`, `generate`, 포함된 `impeccable detect`는 웹 전용입니다.** `setup.platform`이 `ios`, `android`, `adaptive`이면 browser overlay와 HTML 규칙 엔진은 네이티브 코드에 적용되지 않으므로 어느 명령도 먼저 추천하지 않습니다.
- 그 외에는 의도(새로 만들기 / 현재 화면 개선 / 시각적으로 반복 조정)에 따라 현재 화면과 `setup.platform`에 맞게 묶습니다.

`scan.targets`가 비어 있지 않고 `setup.platform`이 `ios`/`android`/`adaptive`가 아니면 `.agents/skills/impeccable/scripts/impeccable detect --json <scan.targets를 공백으로 연결한 값>`을 한 번 실행합니다(로컬 파일만 읽는 포함된 detector로 네트워크나 npx를 사용하지 않음. HTML/CSS를 읽으므로 네이티브 프로젝트는 제외). `scan.via`는 변경 파일(`git-changes`, dirty tree의 markup/style 파일이어서 가장 관련성이 높음), 소스 디렉터리(`source-dir`, 예: `src`, `app`), `html`, `root` 등 대상의 근거를 알려 줍니다. 결과를 선택에 반영합니다. 품질 / 대비 문제가 많으면 `audit` 또는 `polish`, 특정 시각 문제면 적합한 명령을 제안합니다(gradient 텍스트나 eyebrow → `quieter` / `typeset`, 밋밋하거나 회색뿐인 팔레트 → `colorize` 등). 이는 추측보다 정확한 현재 신호입니다. detect 오류가 나거나 트리가 너무 커서 느리면 건너뛰고 사용자에게 직접 `audit`을 실행하라고 권합니다. 제안을 위해 검사를 반드시 완료할 필요는 없습니다.

정확한 명령과 함께 핵심 제안 2~3개만 간결하게 작성합니다. 메뉴는 나머지 옵션으로 둡니다. 추천 이유부터 제시합니다.
