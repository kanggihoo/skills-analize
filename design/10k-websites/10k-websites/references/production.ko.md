# Production levels and model authority

생산 등급에 합의할 때, 또는 등급 없이 빌드를 복구할 때 읽는다. 이 문서가 모델과 지출 정책의 단일 기준이다. 다른 참조 문서는 이 정책을 적용하며, 자체 기본값을 만들지 않는다.

## Choose once, carry forward

**Full throttle**, **Studio**, **Focused budget** 세 가지를 제시한다. 최고 품질, 최고 모델, 예산 제한 없음을 원하는 브리프에는 Full throttle을 권한다. 야망과 비용의 균형을 원하는 사용자에게는 Studio를 권한다. 명확한 상한을 원하면 Focused budget을 권한다. 계정 잔액을 쓸 승인을 추측하지 않는다. 실제 승인 내역과 함께 `.10k/plan.md`에 `production_level: full-throttle | studio | focused`를 기록한다. 기존 로그에 `MODE=astra/save`만 있으면, 사용자의 기존 선호로 해결되지 않을 때만 생산 등급을 묻는다.

모든 등급은 원래의 방향성, 읽기 쉬운 모션, 접근성, 동작하는 웹사이트를 보장한다. 등급은 모델 선택, 제작 깊이, iteration 리소스를 바꾼다. Budget 옵션을 의도적으로 일반적인 디자인처럼 보이게 하지 않는다.

| Decision | Full throttle | Studio | Focused budget |
|---|---|---|---|
| GPT | Top current GPT for the entire workflow and every delegated task | Top GPT for direction and creative judgment; agreed capable everyday GPT for routine execution | Agreed efficient GPT, allocating stronger review where useful |
| Image generation | Strongest current suitable generation/editing model, high quality by default | Strong model/settings, premium for visibly important assets | Best suitable quality inside the ceiling |
| Video generation | Strongest currently suitable flagship, assessed from latest Seedance/successor and current alternatives | Strong realistic motion and control, premium where justified | Reliable suitable model balancing quality and cost |
| Exploration | Include a curated comparison of meaningfully different visual treatments and directed refinements | Explore the consequential design choices | Concentrate on one strong direction |
| Phone | Plan portrait storytelling early, including separate assets when materially better | Plan early; crop or portrait according to result and quote | Compose the master carefully for both; quote exceptions |

## Resolve the GPT model separately from media

현재 앱/호스트의 모델 메타데이터나 모델 카탈로그를 먼저 확인한다. 필요하면 현재 공식 OpenAI 안내를 쓴다. 이 사용자가 실제로 쓸 수 있는 가장 강력한 현재 GPT를 찾고, 정확한 식별자, 근거와 날짜, 활성 상태를 기록한다. 구독 라벨에서 능력을 추론하거나, 알파벳 순서 첫 번째를 고르지 않는다. 모델 식별자는 시간이 지나면 바뀌므로, 이 참조는 의도적으로 특정 모델을 고정하지 않는다.

Full throttle에서는 최상위 GPT가 리서치, 컨셉, 스토리보드, 생성 프롬프트, 코딩, 테스트, 리뷰, 수정, 게시를 맡는다. Helper는 이를 상속하거나, 지원되는 경우 같은 모델을 명시적으로 선택한다. 구현을 일상용 모델에 맡기지 않는다. 사용자 몰래 모델을 바꾸지 않는다. 선택기를 바꿀 수 있는 도구가 없다면 바꿨다고 주장하지 않는다. 필요하면 정확한 선택기 변경을 한 번 요청하고, 그 후 확인한다. 사용자의 승인 없이 모델만 바꾸기 위해 새 채팅을 만들지 않는다.

최상위 모델 접근이나 사용량 때문에 작업을 계속할 수 없으면, 작업을 보존하고 대기나 접근 복구, 또는 사용자가 선택한 명시적 변경을 제안한다. 사용량 임계값 때문에 Full throttle이 Studio로 조용히 바뀌는 일은 없어야 한다. 실제 duration과 reset 정보를 보여 준다. OpenArt 잔액과 GPT 한도는 서로 무관하다.

## Resolve the image and video models independently

OpenArt의 현재 모델 카탈로그, 정확한 폼, 견적을 확인한다. Full throttle video 평가는 최신의 적합한 Seedance 계열 flagship 또는 후속 모델에서 시작한다. 그다음 현재 근거가 뒷받침하는 더 강력한 대안을 검토한다. 필요한 생성/편집과 참조 충실도에 맞는 가장 강력한 image 모델은 따로 고른다. 가장 새롭거나, 가장 비싸거나, 해상도가 가장 높다고 우월함이 증명되지 않는다. 카탈로그 필드는 능력을 증명하지만 평점을 증명하지는 않는다.

현재 제공자 문서, 신뢰할 만한 비교 품질 근거, 실제 샷 요구사항을 활용한다. 근거가 불충분하고 차이가 중요하면, 승인 범위에 포함될 경우 실제 장면으로 작은 비교를 실행하거나, 먼저 견적을 낸다. 가장 어려운 디테일은 맞춘 배율에서 판단하고, [visual-validation.md](visual-validation.md)로 정체성과 구도를 확인한다. 불확실성은 정직하게 말한다. 테스트하지 않은 모델을 보편적 최고로 라벨링하지 않는다. 모델 ID, 날짜, 필요한 컨트롤, 정확한 설정, 그 장면에 맞는 이유를 기록한다. 사용자가 명시적으로 요청한 모델은 사용할 수 없거나 호환되지 않는 경우가 아니면 존중한다. 대체가 필요하면 조용히 바꾸지 말고 논의한다.

Full throttle은 기본적으로 고품질 설정을 쓴다. 구성, 텍스처, 출력 크기, 세로 리프레이밍에 도움이 되면 더 높은 해상도의 master도 허용한다. 임의의 clip별 상한, 중간 품질 기본값, 4K 전면 금지를 적용하지 않는다. 원본 품질과 웹 delivery는 분리한다. Master를 보존하고, 반응형의 가벼운 에셋을 인코딩한다. 비싼 모델이 계획된 샷을 수행할 수 없다면, 숨은 타협이 아니라 수정된 방법이나 모델이 필요하다.

## Approve a concrete production allowance

컨셉을 고른 후, 정확한 계획 설정과 참조를 견적한다: 시각 탐색, 키프레임, clip, 보조 사진, 휴대폰 treatment, 수정 여유분. 총액과 실제 잔액을 한 번 보여 준다. Full throttle은 리소스를 늘리지만, 새 구매, 무제한 재시도, 관련 없는 작업을 자동으로 승인하지 않는다. 사용자가 고정 상한이 없음을 명시적으로 선택해도, 다음 구체적인 배치를 밝히고 그 지출 승인을 생성 전에 받는다. 현재 잔액이 충전을 요구한다는 이유로 더 낮은 등급이나 더 저렴한 컨셉을 강요하지 않는다.

승인 하나는 공개된 배치와 허용량 안의 수정을 포함한다. 비싼 모델도 마찬가지다. 정확한 호출을 preflight하고 자금은 비공개로 확인한다. 호출마다 새 권한을 묻지 말고, 의미 있는 변경만 짧게 알린다. 전체 허용량 안의 작은 가격 변동은 포함된다. 더 큰 총액, 새로운 유료 범위, 바뀐 모델 선호, 소진된 허용량은 구체적인 수정안이 필요하다. 사용자가 충전하거나 구매한다. 에이전트가 대신 하지 않는다.

실제 청구 금액과 승인/현재/거절된 에셋을 추적한다. 각 재시도는 명명된 문제를 해결해야 한다. 반복 실패 후에는 다시 지출하기 전에 진단한다. 시각적 목표를 달성하면 중단하고, 쓰지 않은 허용량은 아낀다. 더 비싸거나 긴 결과가 본질적으로 더 성공적인 것은 아니다.

완료된 청구, 대기 중인 약정, 남은 산출물을 끝내는 데 드는 최신 견적을 별도로 추적한다. 다음 유료 수정 전에 이들의 합계를 승인된 상한 및 현재 자금과 비교한다. 한 포맷의 반복 수정 때문에 합의된 휴대폰 treatment, 보조 에셋, 필요한 delivery 작업이 밀려나지 않도록 보호한다. 다음 호출에 자금이 있다고 완료 계획에 자금이 있다는 뜻은 아니다. 제안된 재시도가 필수 작업을 밀어내면 그 지출은 보류하고, 독립적인 작업은 계속하며, 구체적인 비용/범위 선택지를 제시한다. "계속해"나 충전만으로 더 큰 상한을 추정하지 않는다.

활성 plan은 간결하게 유지한다: 현재 승인 범위, 선택된 에셋 버전, 미해결 결함, 남은 비용, 다음 액션. 대체된 상세 내용은 따로 보관한다. 사용자가 공지된 한계와 함께 검토된 버전을 게시하기로 하면, 연기된 작업을 기록하고, 취소된 개선 작업을 다시 열지 않고 승인된 launch를 마무리한다.
