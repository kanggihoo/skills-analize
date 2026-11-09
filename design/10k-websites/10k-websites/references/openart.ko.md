# OpenArt: image and film production

모든 생성 이미지와 영상은 ChatGPT용 **OpenArt connector**(도구 이름이 `openart_`로 시작한다)를 통해 OpenArt에서 나온다. 선택된 모델의 현재 컨트롤(참조 이미지, 엔드포인트, 해상도, 오디오)을 확인한다. 승인된 장면을 지원하는 방법을 고른다. 모든 모델이 같은 설정을 지원한다고 가정하지 않는다. 사용자가 승인한 생산 허용량 안에서 도구를 호출한다.

## Connect OpenArt (Phase 1)

1. **Account first.** OpenArt 계정이 없으면, SKILL.md의 Sign-up links 섹션(moment 1)에 있는 OpenArt 링크로 사용자가 가입한다. 실제 크레딧과 현재 플랜 조건을 확인한 뒤, 구매를 권하기 전에 계획한 제작 비용을 산정한다.
2. **Add the connector.** `codex mcp add openart --url https://mcp.openart.ai/mcp`를 실행한다(ChatGPT가 사용자에게 승인을 요청한다). 로그인 링크를 출력하고 브라우저를 연다. 사용자는 OpenArt에 로그인하고 **Allow**를 누른다. 명령을 쓸 수 없으면, 사용자가 앱에서 직접 추가한다: **Settings**, **MCP servers**, **Add server**, 이름 `openart`, 타입 Streamable HTTP, URL `https://mcp.openart.ai/mcp`, 그다음 Save and Authenticate.
3. **Reload only when needed.** Connector 도구를 쓸 수 있는지 확인한다. 이 설치가 앱 재시작을 요구하면, plan을 저장하고 재시작 후 돌아오라는 간단한 안내를 한 번 준다. 도구가 이미 동작하면 재시작을 요구하지 않는다.
4. **Verify.** `openart_account_get`을 호출한다. 플랜과 크레딧 잔액을 반환해야 한다. 실제 잔액을 사용자에게 말한다.

Connector 도구가 OpenArt 업그레이드 링크를 반환하면, Sign-up links 섹션에 있는 제작자의 OpenArt 링크를 대신 공유한다.

## Production level, allowance and live model selection

선택된 등급의 단일 모델/지출 정책은 [production.md](production.md)를 읽는다. Full throttle에서는 전 과정에 최상위 GPT를 쓰고, 현재 적합한 가장 강력한 image/video 모델을 고품질 설정으로 쓴다. 여기에 더 저렴한 모델 기본값을 다시 넣지 않는다.

매 빌드마다 `openart_model_list`로 모델을 찾고, `openart_model_form_get(model, mode)`로 정확한 컨트롤을 확인하고, `openart_model_cost(model, mode, params)`로 정확한 설정과 참조의 견적을 낸다. Full throttle video 평가는 최신의 적합한 Seedance flagship 또는 후속 모델에서 시작하고, 근거가 더 강한 대안도 고려한다. Image 생성/편집 모델은 독립적으로 고른다. 사용자가 명시한 모델 선택은 보존한다. 대안을 제안하기 전에 부족한 기능을 먼저 밝힌다. 모델 ID, 설정, 날짜, 근거를 plan에 기록한다. 오래된 프로젝트의 모델 이름, 가격, 기능은 과거 근거일 뿐이며 현재 순위가 아니다.

첫 생성 전에 구체적인 컨셉의 비용을 산정한다. 탐색, 키프레임, clip, 보조 이미지, 휴대폰 treatment, 지정된 수정을 모두 포함한다. 사용자는 기술적인 모델 메뉴가 아니라 결과와 생산 허용량을 승인한다. 보편적인 1,000 크레딧 시작 예산 대신 현재 비용을 견적한다. 잔액이 많다고 해서 더 많은 지출이 자동으로 허용되지는 않는다. Full throttle에서 잔액이 부족하면 자동 하향이 아니라 충전 또는 명시적 대안 중 하나를 선택하게 한다.

### Execution rules

- 모든 유료 호출 전에 preflight를 하고 실제 잔액을 확인한다. 하나의 승인된 허용량은 명시된 프리미엄 clip과 수정을 포함한다. 별도의 clip별 임계값은 없다. 의미 있는 변경은 짧게 보고하고, 실제 청구 금액과 대조한다. 전체 허용량 안의 작은 변동은 포함된다. 더 큰 범위나 총액은 수정된 제안이 필요하다.
- Full throttle은 고품질 원본 생성을 쓰며, 유용한 곳에서는 더 높은 해상도를 허용한다. Studio와 Focused budget은 선택한 품질/비용 절충을 따른다. delivery 에셋은 master를 보존한 채 따로 압축한다. 높은 지출을 낭비성 재시도의 허가로 해석하지 않는다.
- 필름 길이는 스토리와 스크롤 페이싱을 기준으로 설계한다. 10~15초는 최대치나 목표가 아니라 유용한 출발점이다. 선택된 모델이 지원하는 실제 길이를 기준으로 견적한다. 크레딧이 많다는 이유만으로 장면을 늘리지 않는다.
- 웹사이트는 조용하게 유지한다. 모델의 실제 오디오 설정을 확인하고, 생성 사운드를 끈다. 다른 모델의 파라미터 이름을 폼 확인 없이 복사하지 않는다.
- 연속성이 필요하면 주체/정체성 참조를 쓴다. 같은 조각이나 제품은 실제로 다른 구도에서도 같은 것으로 보여야 한다. 적절한 참조를 쓰기 전에 실패를 두 번 겪을 필요는 없다.
- 재시도는 결함이나 의미 있는 창작상의 불확실성을 명시하고, 관련 프롬프트/설정을 바꿔야 한다. 같은 실패가 반복되면 다음 배치 전에 원인을 진단한다. 국소적인 join repair에서는 승인된 장면과 페이싱을 보존하고, `ffmpeg-recipes.md`의 중복 프레임 예외를 따른다. 허용량을 다 쓰면, 비용과 함께 다음 유용한 iteration을 제안한다. 승인된 Full throttle 방향을 조용히 단순화하지 않는다.

## Generate

**Images.** `openart_generate_image`에 `model`, `mode`(`text2image`, 또는 편집이나 프레임 매칭을 위한 `image2image`), `params`(프롬프트와 선택된 모델의 검증된 설정)를 넣는다. Image-to-image에서는 완료된 생성물의 `id`와 `url`을 가져와 `visualReferences: [{"type":"image","id":"<asset id>","url":"<cdn url>","label":"<short label>"}]` 형태로 참조를 넘긴다.

**Video.** `openart_generate_video`에 `model`, `mode: "image2video"`, 그리고 위의 설정과 프롬프트를 포함한 `params`, 다음 항목을 넣는다:
```json
"startFrame": {"type":"image","id":"<START asset id>","url":"<START url>","label":"start"},
"endFrame":   {"type":"image","id":"<END asset id>","url":"<END url>","label":"end"}
```

**Waiting.** 생성 요청은 `historyId`를 반환한다. 같은 턴에 머물면서 직접 기다린다(connector가 `openart_creation_wait`을 제공하면 그것을 쓰고, 여전히 실행 중이라고 하면 다시 호출한다). 시작한 생성이 아직 실행 중일 때 턴을 끝내지 않는다. 사용자가 결과를 보려고 "계속"이라고 입력할 필요가 없어야 한다. 독립적인 작업은 적절할 때 함께 제출하고, 완료를 기다린 뒤 같은 작업 안에서 검사한다. 결과 카드만 갱신되는 것은 작업이 끝난 것이 아니다. **Wait cheaply:** 확인을 한 번 할 때마다 전체 채팅이 다시 전송되므로, OpenArt 도구를 호출하는 작은 스크립트를 실행할 수 있으면, 한 단계씩 확인하지 말고 스크립트 하나 안에서 폴링한다(20초마다 확인하고, 긴 대기 중에는 진행 상황을 내보내며, 모든 작업이 끝나거나 실제 실행 제한에 걸릴 때까지 계속한다). 영상은 몇 분 걸린다. 이를 한 줄로 알리고, 렌더링되는 동안 섹션 이미지와 페이지 골격을 만든다.

**Saving.** 완료된 모든 결과를 `curl -fsSL "<url>" -o review/<name>`로 `review/`에 내려받고, `.10k/plan.md`에 생성마다 한 줄씩 기록한다(내용, 모델, 크레딧, 파일). 승인된 파일만 `site/assets/`에 복사한다.

## One photoshoot, not a stock collection

$10,000짜리 사이트는 한 사진작가가 하루에 모든 것을 찍은 것처럼 보인다.
1. **Write a style line once.** 스타일 라인을 한 번 쓰고 plan 파일에 저장한다. 빛, 렌즈 느낌, 재질로 표현한 팔레트, 질감, 장면별 제외 항목(요청하지 않은 글자나 산만하게 하는 소품 등)을 적는다. 승인된 제품 마크는 보존한다.
2. **Use references deliberately.** 반복되는 제품은 승인된 피사체 참조로 정체성을 보존한다. 일관성이 좋아지는 경우 스타일 참조를 추가한다. REST 프레임이 올바른 정체성과 룩을 나타낼 때 유용하지만, 모든 구도를 제약할 필요는 없다.
3. **Give each image a role.** 스토리가 넘어갈 때는 새로운 구도를 만든다. 의도적으로 반복되는 모티프, 디테일 crop, 전후 비교는 유효하다. 빈 공간을 채우려고만 쓰인 반복되는 히어로 crop은 유효하지 않다.
4. **Check the set side by side.** 보여 주기 전에 세트를 나란히 검사한다. 어려운 디테일 crop, 참조의 역할, 의존 에셋을 만들기 전의 cross-view 연속성은 [visual-validation.md](visual-validation.md)를 쓴다. 공유된 조명과 스타일이 물리적 내용의 일치를 보장하지는 않는다. 드러난 불일치는 승인된 범위 안에서 다시 grade하거나 수정한다.

## The user's real photos

- **Getting them in:** 사용자가 사진을 채팅으로 드래그한다. `openart_upload_import`로 가져온다(채팅에 첨부된 파일을 그대로 받는다). 폴더에만 있는 사진은 `openart_upload_sign`으로 업로드를 요청하고, `curl -X PUT --upload-file <file> "<signURL>"`로 파일을 보낸 뒤, `openart_upload_metadata_get`으로 확인한다.
- **Polishing:** 사진을 유일한 참조로 사용해 image-to-image로 처리한다:
```
Professional photo retouch of this exact [PRODUCT OR PLACE]. Keep the [PRODUCT OR PLACE]
exactly as it is: same shape, same colours, same materials, same label and logo, same
details. Do not add, remove, or redesign anything on it. Improve only the photography:
[LIGHTING], colour grade toward [PALETTE AS MATERIALS AND LIGHT], sharper detail, a clean
[BACKGROUND], extend the scene naturally to a wide 16:9 frame. Photorealistic. No new
text, no new logos, no lettering anywhere.
```
- **Compare** 결과를 원본과 나란히 비교한 뒤 보여 준다(SKILL.md의 Phase 6). 원본은 `photos/`에 보관한다.

## Balance and top-ups

- 모든 유료 단계 전에 `openart_account_get`으로 잔액을 확인한다.
- 잔액이 다음 승인된 단계를 감당하지 못하면, 정확한 부족분을 밝히고 OpenArt 링크(Sign-up links 섹션의 moment 2)를 공유한다. 선택된 제작 등급을 유지한다. 더 저렴한 경로는 명시적 대안으로만 제시한다. Full throttle은 사용자가 그 선택을 바꾸지 않는 한, 자금이 준비된 후 최상위 모델로 계속한다. 지출 결정이 대기 중이어도 독립적인 작업은 계속한다.
- 사용자를 위해 크레딧을 구매하거나 플랜을 바꾸지 않는다. 플랜마다 상업적 사용 조건이 다르다. 실제 사업이라면, 공개 전에 OpenArt의 plans 페이지에서 그 조건을 확인하라고 권한다.

## If the connector will not work

한 번 정직하게 재시도한 뒤에도 안 되면, 문제를 해결하는 동안 OpenArt 명령줄 도구로 이미지와 단일 프레임 영상을 만들 수 있다: `curl -fsSL https://raw.githubusercontent.com/OpenArt-AI/cli/main/install.sh | sh`(Windows: `irm https://raw.githubusercontent.com/OpenArt-AI/cli/main/install.ps1 | iex`), `openart login`, 그다음 `openart generate image "<prompt>" --model <id> -o review/`와 `openart generate video "<prompt>" --model <id> --image <start.png> --duration 5 --async`. 의존하기 전에 CLI의 현재 기능을 확인한다. CLI가 승인된 모델, 품질, 필수 엔드포인트 컨트롤을 보존할 수 없다면, 그 한계를 설명하고 생성 전에 해결한다. Connector 실패가 Full throttle을 조용히 더 약한 제작 방식으로 바꿔서는 안 된다. 지원되는 대체 경로도 승인된 모델/설정을 사용하며, 같은 시각 검토를 거쳐야 한다.
