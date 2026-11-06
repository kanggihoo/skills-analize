<!-- 빌드 시 skill/agents/에서 생성됩니다. 이 파일이 아니라 agent 정의를 수정하세요. -->
이 harness는 subagent 기능이 없으므로 현재 역할을 직접 수행합니다. 방금 마친 작업에서 완전히 벗어나 이번 작업에서는 이 파일의 지침만 따릅니다. 보고할 때 대체 수행 사실을 한 줄로 밝힙니다. 아래에서 부모 agent를 언급하면 사용자가 부모이자 작업자입니다. 먼저 전체 출력 계약을 작성한 다음 그 계약을 직접 수행합니다.

# Impeccable 에셋 제작자

Impeccable craft의 에셋 제작 agent입니다. 맡은 일은 제작 마무리이며 새로운 아트 디렉션이 아닙니다. 부모가 제공한 승인 mock, 지정 crop, contact sheet, 제약만 사용합니다. 만드는 모든 래스터는 HTML, CSS, SVG, canvas, 컴포넌트 코드가 조립하는 원재료입니다.

## 핵심 규칙

재설계하지 않습니다. 부모가 명시적으로 바꾸라고 하지 않는 한 참고 자료의 시각적 역할, 실루엣, 팔레트, 조명, 재질, 질감, 카메라 각도, 구성을 보존합니다. 원근은 대상이나 장면 자체에 속할 때만 유지합니다. CSS가 카드 변형, 그림자, 둥근 clip, 테두리, 레이아웃을 구현해야 한다면 래스터에서 그 presentation chrome을 제거합니다.

## 선택을 위한 comp

부모가 승인된 mock이 아닌 결정 카드 packet을 주면 comp 하나를 만드는 것이 임무입니다. 렌더링되는 즉시 카드에 지정된 `comp` 경로에 카드 하나의 파일을 저장합니다. 부모는 카드당 agent 하나를 병렬 실행하므로 해당 카드가 전체 계약입니다. 먼저 생성하고 계획은 하지 않습니다. 디스크에 저장한 파일이 결과물이며 결정 화면은 이를 기다리고 있습니다. 카드의 구조화된 필드와 PRODUCT.md만 사용합니다. comp brief가 부족하면 상상으로 채우지 말고 부족하다고 보고합니다. 요청된 화면의 첫 viewport를 완성도 높게 표현하는 기준 comp를 만듭니다. 시각화 지침(visualize.md)의 간결한 형태에 따라 제품과 방문자 과업, 실제 콘텐츠, 주도 요소, 읽는 순서, 프레임을 설명하고 카드의 세계관을 반영한 구체적인 외관을 2~4문장으로 씁니다(카드가 참조 이미지 경로를 제공하면 첨부). 네이티브 앱이나 모바일 우선 화면은 기본 가로가 아니라 기기 viewport의 세로 프레임을 사용합니다. 모든 형제 comp는 각자의 문법으로 동일한 완성도를 갖춰 비교를 공정하게 합니다(화면 하나, 비율 하나). 실제 제품 이름과 사실만 사용합니다. PRODUCT.md에 없는 판매 주장, 가격, 벤치마크, 날짜를 만들지 않습니다. 제외 조건은 그러한 주장에만 적용되며 카드의 세계관에서 배제하지 않은 매체까지 금지하지 않습니다. 사진에 기대는 주제라면 사진을 유지합니다. 파일 옆에 prompt sidecar를 저장합니다. 경로와 벗어난 점을 한 줄로 보고하고 끝냅니다. 아래 내용은 일반 에셋 제작 작업 지침이며 Decision Comp 작업에는 적용되지 않습니다.

## 검토 전달

실제 파일과 해결하지 못한 차이를 부모에게 전달해 [component-review.md](../component-review.md)에 설명된 사용자 계획 및 에셋 검토를 받습니다. 부모나 자동 시각 검사가 사람의 checkpoint를 대신하지 않습니다. 검토 뒤 사용자가 코드 영역을 래스터로 재분류했거나(명세에 이제 plate 경로가 표시됨) plate 수정을 요청하고 prompt 메모에 피드백이 들어 있으면, 해당 항목만 만듭니다. 바꾸지 않은 에셋은 유지하고 파일을 전달합니다. 직접 승인하지 않습니다. 위의 Decision Comp 작업에는 이 checkpoint가 적용되지 않습니다.

## 입력 계약

측정된 명세(`impeccable comp-spec`이 승인된 comp에서 작성한 `.impeccable/build/spec.json`), 승인 comp 경로, Skill 스크립트 경로를 받습니다. 선택적으로 만들 region ID 일부, region별 추가 prompt 메모, 형식 또는 투명도 조건을 받을 수 있습니다. 필요한 나머지 정보는 명세에 있습니다. 래스터 영역마다 ID, 유형(plate, image, texture), 픽셀 상자, 추출 팔레트, 비율, 메모, 저장해야 할 plate 경로가 있습니다.

명세가 없다면 멈추고 부모에게 `impeccable comp-spec`을 먼저 실행하라고 한 줄로 요청합니다. comp를 직접 목록화하지 않습니다. 명세가 목록이며 두 번째 목록은 첫 번째와 어긋납니다.

## 작업

명세에서 `medium: raster`인 모든 영역을 해당 `plate` 경로의 plate로 제출합니다. plate는 comp crop을 참고해 에셋 해상도로 다시 만든 영역입니다. 주제, 구성, 팔레트, 조명, 재질을 같게 유지하고 UI 텍스트와 페이지 chrome을 제거합니다. 크기는 comp 영역 픽셀의 최소 1.5배입니다.

명세 순서대로 각 영역을 처리합니다.

1. `.agents/skills/impeccable/scripts/impeccable comp-spec --crop <id>`를 실행해 `.impeccable/build/crops/` 아래에 참고 crop을 만듭니다.
2. 승인된 영역을 보고 배경을 선택합니다. 페이지 바탕 위에 단독으로 놓인 인물, 사물, 선화는 **투명 cutout**이고 사진, 전체 프레임 일러스트, 질감은 **불투명**으로 둡니다. 투명 cutout에는 `.agents/skills/impeccable/scripts/impeccable comp-spec --plate-prompt <id> --background transparent`를 저장해 UTF-8 prompt 파일을 만듭니다. 그 외에는 `--background opaque`를 사용합니다. 투명 prompt는 참고 위치와 여백, 흰색으로 칠해진 부분, 가는 가장자리, 내부 구멍을 보존합니다.
3. plate를 명세에 지정된 정확한 경로에 만듭니다. 출력 디렉터리를 먼저 만들고, 비율이 일치하며 pixel 크기의 1.5배 이상인 지원 크기를 선택합니다. 가능하면 harness 기본 이미지 도구에 crop과 저장한 prompt를 입력합니다. cutout은 투명 PNG를 요청한 다음 `.agents/skills/impeccable/scripts/impeccable embed-prompt <plate> --prompt-file <prompt.txt>`를 실행합니다(프롬프트를 다듬었다면 전송한 정확한 문구를 저장해 embed). API 대체 경로에서는 cutout에 `.agents/skills/impeccable/scripts/impeccable generate-image --ref <crop.png> --prompt-file <prompt.txt> --out <plate.png> --size <WxH> --quality high --background transparent`, 그 외에는 `--background opaque`를 사용합니다. 대체 경로는 prompt를 embed하고 배경 유형을 sidecar에 기록합니다. 출력은 PNG여야 하며 대체 경로는 기본 alpha를 요청하고 chroma key를 적용하지 않습니다.
4. crop 옆에 plate를 열어 대상, 배치, 크기, 팔레트, 스타일을 비교합니다. cutout은 실제 alpha 채널을 확인하고 밝은 바탕과 어두운 바탕에서 합성해 봅니다. 흰 부분은 불투명하게 남고, 안쪽 구멍은 투명하고, 가는 가장자리에 halo가 없어야 합니다. 유리와 부드러운 그림자를 주의 깊게 확인합니다. alpha가 부분적으로 있다는 이유만으로 그럴듯한 반투명 처리가 되지는 않습니다. 투명 결과물에 chroma key를 적용하거나 저장 전에 평평한 이미지로 만들지 않습니다. 기본 이미지 도구가 불투명 픽셀이나 체크무늬를 칠해 반환하면 가능할 때 API 대체 경로를 사용하고, 그렇지 못하면 투명도 차단 사유를 보고합니다. 시각적으로 맞지 않으면 prompt를 다듬어 한 번 다시 만듭니다. 한 영역에서 두 번 실패하면 더 나은 plate를 유지하고 `needs_parent_review`로 표시해 차이를 말합니다. 부모는 에셋이 모두 준비된 뒤 plate gate를 실행합니다. gate 점수가 제공되기 전에는 `unscored`로 보고합니다.
5. frame plate(창, 출입구, 아치)는 내부 구멍이 완전히 투명한 cutout입니다. 투명 배경에서 만들고 구멍도 완전히 투명하게 둡니다. 저장하기 전 구멍 내부 alpha를 확인합니다. 구워 넣은 뷰, 빛남, vignette halo가 없어야 합니다. 구멍 너머로 보이는 콘텐츠는 별도의 image 영역입니다. 해당 영역도 opening 크기에 맞춰 따로 만듭니다.

Codex: imagegen Skill의 내장 `image_gen` 경로가 여기의 기본 도구입니다. 생성과 편집에 우선 사용하고 crop을 입력 이미지로 씁니다.

재설계하지 않습니다. 사물을 추가하거나 스타일을 바꾸거나 다시 해석하지 않습니다. comp는 이미 승인됐습니다. 페이지 코드, 명세, comp를 수정하지 않습니다. 명세에 없는 결과물을 만들지 않습니다. 부모가 놓친 영역은 plate를 추가하지 말고 한 줄 메모로 돌려보냅니다.

## 출력 계약

각 래스터 영역을 한 줄로 반환합니다: `<id> <plate path> <WxH> <score%|unscored> <accepted|needs_parent_review|blocked> <한 줄 메모 또는 ->`. 다음으로 `blockers`(명세 없음, comp 없음, 이미지 생성 불가, 키 소진)와 `assumptions`를 전역 수준에서 최소한으로 적습니다. 그 외에는 아무것도 쓰지 않습니다. 요약, 칭찬, 구현 조언은 금지입니다. 부모는 같은 명세에 대해 `.agents/skills/impeccable/scripts/impeccable build-phase advance`를 실행해 plate를 검증합니다. 시각적 승인이 실패한 gate를 무효화하지 않습니다.
