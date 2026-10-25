# 영역 지도

에셋 제작 전에 승인된 comp에서 실제로 보이는 항목을 영역 지도로 기록합니다. 이는 페이지를 빌드하거나 에셋을 승인하는 절차가 아닙니다.

1. `.agents/skills/impeccable/scripts/impeccable comp-spec --comp <comp.png> --grid`를 실행하고 원본 및 격자 이미지를 엽니다.
2. JSON 필드를 확인하려면 `.agents/skills/impeccable/scripts/impeccable comp-spec --schema`를 실행합니다. `regions` 배열을 포함하는 `regions.json`을 작성합니다. 각 영역에는 안정적인 `id`, `kind`, `note`와 `pixelBox`, 정규화된 `box`, `grid` 중 정확히 하나가 있어야 합니다. 원본 comp의 크기를 사용합니다.
3. `.agents/skills/impeccable/scripts/impeccable comp-spec --comp <comp.png> --regions regions.json --inspect-map`을 실행합니다. 출력은 보고서, overlay, 정확한 crop, mask를 적용한 참조 이미지의 `COMPARE` sheet 경로를 알려 줍니다. 기본 출력은 발견 사항만 보여주고 `--json`은 전체 보고서를 출력하며 sheet 경로는 `comparisonSheets`에 들어갑니다.
4. 먼저 comparison sheet를 열어 영향받은 crop을 한꺼번에 살펴보고, 더 자세한 내용이 필요하면 개별 crop을 엽니다. 각 경계를 원본과 비교합니다. 도형 오류뿐 아니라 제외된 전경 픽셀도 확인합니다. 겹치는 컨테이너가 아닌 코드 상자는 빈 공간을 포함해 전체가 mask 처리됩니다. 떨어진 텍스트 요소를 각각 별도 영역으로 지정해 사이의 그림이 계속 보이게 합니다. 컨테이너는 자식 요소를 대체하지 않고 레이아웃 범위를 나타냅니다. 지도를 수정하고 다시 검사하며 매번 새 출력 디렉터리를 사용합니다. 오류가 0개라고 crop의 정확성이 증명되는 것은 아닙니다. 커버리지 경고는 단서이지 완전성의 증거가 아닙니다.

요청 범위가 영역 매핑에서 끝나면 지도, 검사 보고서, 해결되지 않은 발견 사항을 전달하고 멈춥니다. 빌드를 계속하려면 검사한 지도를 `comp-spec --comp <comp.png> --regions regions.json`으로 측정하고 [new-work.md](new-work.md)를 따릅니다.

`--auto`는 가로 band의 뼈대를 만들 뿐 요소를 식별하지 않습니다. 선택적으로 사용할 수 있지만 직접 지도를 작성하는 작업을 대신하지 않습니다.

## 포함 관계

`parentId`는 `container: true` 영역으로 감싸는 부모를 식별합니다. 부모와 자식은 별도의 ID와 crop을 유지합니다. 포함 관계가 승인 상태를 이전하지는 않습니다.

## 독립적으로 달라지는 항목

독립적으로 바뀌는 콘텐츠(사이트에서 교체하는 방 사진, 제품, 사람), 움직이는 부분(hover나 시그니처 상호작용으로 움직이는 모든 것), 구조(frame, 테두리, 장식)에 따라 영역을 나눕니다. 방에 열린 셔터가 달린 창문은 세 종류의 영역입니다. 내부가 투명하게 뚫린 surround는 plate, 뒤에 보이는 방은 image 영역, 셔터 각각은 별도 plate입니다. 페이지에서 겹친 영역을 합성합니다. frame과 frame이 열어 보이는 장면을 한꺼번에 묘사한 note가 있는 래스터 영역은 `comp-spec`이 `baked-composite`로 표시하며 plan 및 asset review에서 먼저 사용자에게 보여 줍니다.

## 칠해진 재료

측정할 때 `comp-spec`은 crop이 색이 많거나 부드러운 gradient인 등 칠해진 것처럼 보이는 `text`, `control`, `chrome` 영역(컨테이너 포함)을 `painted-pixels`로 표시하고 요약에 나열합니다. Plan 및 asset review에서 표시된 영역과 사용자가 코드로 그리도록 선택한 칠한 재료(`codeDrawn`)를 먼저 사용자에게 보여 줍니다. 사용자가 놓친 부분을 대신 발견하게 하지 마세요. 영역이 인물, 사진, 금속이나 종이 표면처럼 칠해진 재료라면 지금 `plate`, `image`, `texture`로 분류합니다.

Comp crop은 제작용 에셋이 아니라 참고 근거입니다. 지도의 inspector는 PNG에 comp에서 나온 표시를 붙입니다.
