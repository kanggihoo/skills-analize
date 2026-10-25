# 계획 및 에셋 검토

comp 중심 제작에서는 모든 래스터 영역의 plate가 준비되고 plate gate에서 점수를 받은 뒤, 페이지 코드를 만들기 전에 이 checkpoint를 진행합니다. 승인된 comp가 기준입니다. 사용자는 두 가지를 검토합니다. 출시할 plate와 나머지 모든 제작 계획, 즉 코드로 그릴 영역입니다. 그림으로 표현하기로 한 영역을 코드로 만들 계획하는 것은 comp 중심 제작에서 가장 비용이 큰 실수이며, 사용자가 이 단계에서 발견할 수 있습니다. 텍스트, 컨트롤, chrome은 조립된 첫 viewport에서 나중에 평가합니다.

## 계획 작성, 캡처, 검토 화면 제공

`.agents/skills/impeccable/scripts/impeccable component-review plan`을 실행합니다. 측정된 명세, comp, plate 파일을 바탕으로 `.impeccable/review/components.json`을 작성하며, 래스터 영역에 plate가 없으면 각 영역 이름을 밝히고 거부합니다. 이 단계에서 그 파일을 직접 만들거나 편집하지 않습니다. packet은 명세에서 파생되므로 모든 변경은 regions 파일에 반영해야 합니다.

harness가 `component_review`를 제공하면 `manifest_path`를 `.impeccable/review/components.json`으로 지정해 호출합니다. 호스트가 캡처하고 검토 화면을 보여준 뒤 사용자의 결정을 반환합니다. 요청이 일시 중단된 상태라면 사용자의 응답을 기다리는 중입니다. 빌드 실패나 승인 상태가 아닙니다.

그 외에는 `.agents/skills/impeccable/scripts/impeccable component-review capture --manifest .impeccable/review/components.json`을 실행한 다음 `.agents/skills/impeccable/scripts/impeccable component-review serve --session <returned session>`을 백그라운드에서 시작합니다. 출력된 URL을 사용 가능한 브라우저에서 열고 사용자의 결정을 기다립니다. `serve`는 사용자가 제출하면 종료 코드 0으로 끝납니다. `.agents/skills/impeccable/scripts/impeccable component-review status --session <id>`로 결정을 읽고, `.agents/skills/impeccable/scripts/impeccable component-review verify --manifest .impeccable/review/components.json`로 승인 여부를 확인합니다. 검증 명령은 결정이 대기 중이거나, 수정이 필요하거나, 입력값이 오래된 경우 거부합니다. 사용자를 대신해 페이지를 제출하거나 승인 영수증을 작성하지 않습니다.

현재 브라우저가 없는 세션에서 `serve`가 2를 반환하거나, 결정 없이 30분간 활동이 없어 종료되면 4를 반환합니다. 어느 경우든 검토가 진행 중이지 않습니다. 기다림을 멈추고, 직접 승인하지 말며, 이 checkpoint를 지나 빌드하지 않습니다. 세션 ID와 함께 계획 및 에셋 검토가 대기 중이라고 보고하고 사용자가 재개하도록 합니다. 검토 대기는 완료된 빌드가 아니라 미완료 작업입니다.

## 검토 결과에 따라 작업

사용자 결정을 그대로 적용하며, 자신이 대신 내린 긍정적인 판단으로 바꾸지 않습니다.

- **approve**: 모든 항목이 승인되고 목록이 확인되면 hero 단계로 넘어갑니다.
- **revise**(plate): 사용자 피드백을 반영해 같은 경로에 해당 plate를 다시 생성합니다.
- **revise with split**(asset): regions 파일에서 해당 영역을 레이어로 대체합니다. 투명한 구멍이 있는 frame plate(`kind` `plate`, 같은 box), 구멍 위치의 콘텐츠를 별도 `image` 영역으로, 셔터나 문처럼 움직이는 부분도 각자 plate로 만듭니다. 다음 검토에서 사용자 요청 항목으로 보이도록 각 레이어에 원래 영역의 이름을 붙입니다(예: `<id>-frame`, `<id>-view`, `<id>-shutter-left`). `.agents/skills/impeccable/scripts/impeccable comp-spec --comp <comp.png> --regions <regions.json>`을 다시 실행하고 plate를 만듭니다.
- **revise**(계획 항목): 피드백에 맞게 regions 파일을 수정합니다(래스터 영역 크기 조정 또는 확장, 재질을 별도 plate 영역으로 분리, 코드 영역 조정). `.agents/skills/impeccable/scripts/impeccable comp-spec --comp <comp.png> --regions <regions.json>`을 다시 실행하고 새 plate를 만듭니다.
- **reclassify**(코드 영역): regions 파일에서 해당 영역의 `kind`를 사용자가 선택한 것으로 바꾸고 `note`를 재질 설명으로 고칩니다. `.agents/skills/impeccable/scripts/impeccable comp-spec --comp <comp.png> --regions <regions.json>`을 다시 실행한 뒤, subagent가 있으면 asset producer와 함께 새 plate를 만듭니다.
- **missing**: regions 파일에 영역을 추가하고 `.agents/skills/impeccable/scripts/impeccable comp-spec --comp <comp.png> --regions <regions.json>`을 다시 실행한 뒤, 래스터 영역이면 plate를 만듭니다.

그런 다음 `plan`, `capture`, `serve`를 다시 실행합니다. 변경하지 않은 결정은 유지되어 바뀐 부분만 사용자에게 표시됩니다. 명세가 바뀌거나 승인된 plate를 교체하면 새로운 검토가 필요합니다. 현재 명세가 승인될 때까지 빌드 단계 gate를 열지 않습니다.

## 조립 및 검토

승인된 plate와 계획을 바탕으로 첫 viewport를 만들고 hero gate를 실행합니다. 사람의 검토가 무결성 검사를 면제하지는 않습니다. hero 시도에 세 번 실패하거나 첫 viewport가 승인되기 전에 반응형 시도에서 세 번 실패하면 반복을 멈추고 현재 빌드로 첫 viewport 검토를 요청합니다. 측정 결과만으로 해결할 수 없는 부분은 사용자의 판단을 받습니다.

두 번째 manifest는 `.impeccable/review/hero.json`에 작성합니다. 이번 파일은 직접 작성하며 형식이 고정되어 있습니다.

```json
{
  "schemaVersion": 2,
  "stage": "hero",
  "id": "hero",
  "title": "First viewport",
  "comp": {"path": ".impeccable/mocks/comp.png", "width": 1536, "height": 1024},
  "components": [{
    "id": "first-viewport",
    "name": "First viewport",
    "medium": "HTML / CSS",
    "note": "Assembled first viewport",
    "box": {"x": 0, "y": 0, "w": 1, "h": 1},
    "preview": {"kind": "page", "path": "index.html"},
    "dependencies": ["styles.css", "assets/plates/sky.png", "fonts/display.woff2"]
  }]
}
```

- `schemaVersion`은 2입니다. 버전 3은 계획 검토 packet이며 `stage`가 `components`여야 합니다. `codeRegions`와 `specSha256`은 버전 3에만 존재하므로 여기서는 거부됩니다. `reviewGroup`도 허용되지 않습니다. 버전 3에서는 거부되고, 다른 버전에서는 `components` 단계 manifest의 page preview에서만 허용되며 hero manifest에는 쓸 수 없습니다.
- `comp.path`는 `.impeccable/build/spec.json`의 `comp` 값이며 `width`와 `height`는 PNG의 픽셀 크기입니다.
- 컴포넌트는 정확히 하나여야 하며 `box`는 정확히 `{"x": 0, "y": 0, "w": 1, "h": 1}`이어야 합니다. `name`, `medium`, `note`는 문자열입니다.
- `preview.path`는 빌드 gate가 검사하는 페이지 시작 파일(`.impeccable/build/state.json`의 `artifact`)입니다.
- `dependencies`에는 페이지가 불러오는 다른 모든 파일(stylesheet, script, plate, 이미지, 글꼴)을 일반 문자열로 나열합니다. 여기와 위의 모든 경로는 프로젝트 기준 상대 경로여야 합니다. 앞에 `./` 또는 `/`, `..`, URL, `?`, `#`, `%`, `:`, 역슬래시를 넣지 않습니다. 목록에 없는 파일이나 다른 호스트를 요청하면 캡처가 실패합니다.

참고 기준은 승인된 comp로 유지합니다. 같은 호스트 검토 도구를 호출하거나 이 manifest로 `capture`, `serve`, `verify`를 실행합니다. 수정 필요 피드백은 조립 단계를 다시 시작합니다.

승인되면 이 빌드에 대한 사람의 검토가 종료됩니다. 페이지가 사용자가 승인한 대로 렌더링되는 한 hero 점수, 팔레트 검사, 모든 수치 판독은 참고 정보입니다. 다만 실제 veto 조건은 계속 적용됩니다(plate 누락 또는 참조되지 않음, SVG 일러스트, 유기적 clip, 잘린 plate, 임의로 만든 잉크, 렌더링된 요소 누락). 승인된 스크린샷에도 텍스트, 컨트롤, chrome 영역이 없으면 그 부분은 사용자 승인으로 확정됩니다. 없는 plate는 gate의 사유에 명시된 대로 사용자에게 물어야 합니다. 직접 방향을 바꾸지 말고 답을 반영해 plate를 배치합니다. 캡처가 승인된 스크린샷과 달라지면 승인된 상태로 복구하고, 그 전까지는 판독값을 적용합니다. 승인된 첫 viewport를 시각 방향으로 삼아 페이지 나머지, 반응형 동작, 완료 검사, 문서화를 진행합니다. 이는 첫 viewport 조정이지 페이지 전체를 사용자가 검토했다는 뜻이 아닙니다. 공통 stylesheet 수정은 승인을 다시 열지 않습니다. 승인된 방향을 유지하고 사용자의 나중 요청으로 바뀌면 새 작업으로 처리합니다.

조립된 페이지 캡처는 고정된 입력에서 인라인 및 선언된 로컬 script를 실행합니다. 네트워크 API, frame, worker는 사용할 수 없습니다. 초기 viewport는 캡처 전에 안정된 상태가 되어야 합니다. 검토를 통과하려고 실제 페이지 동작을 제거하지 말고 그대로 유지한 뒤 script를 선언합니다.
