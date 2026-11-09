# gpt-image-2 스킬은 에이전트를 어떻게 바꾸나 {#gpt-image-2-skill}

`gpt-image-2`를 쓰면 에이전트는 이미지를 만들기 전에 먼저 지금 환경이 어느 모드인지 확인한다. 세 모드 모두 템플릿 하나를 골라 값을 채워 프롬프트를 만든다. 그다음 환경에 따라 직접 API를 부르거나(A), 호스트 에이전트의 이미지 도구에 넘기거나(B), 프롬프트만 건네고 이미지를 만들었다고 말하지 않는다(C).[](source:sk-intro)[](source:sk-table)

- 켜지는 때: GPT Image 2로 이미지를 생성하거나 편집하려는 요청이다. 호출 제한 필드는 없다.[](source:sk-fm)
- 강제하는 것: 모드부터 정하고, 가장 가까운 템플릿 파일 하나만 읽고, 빠진 값은 템플릿 필드 기준으로 좁게 묻는다.[](source:sk-flow)[](source:sk-ask)
- 남기는 것: A와 C에서는 최종 프롬프트를 반드시 `garden-gpt-image-2/prompt/`에 저장한다. 이미지 파일은 A에서만 생긴다.[](source:sk-promptsave)[](source:sk-outdir)
- 쓰면 안 되는 때: 편집 가능한 도표나 실제 데이터 차트가 필요할 때다. 기술 도표 템플릿은 PNG 비트맵만 만든다.[](source:sk-tech)[](source:tp-pub)

@answer scope="design/garden-skills/gpt-image-2 · 원본 텍스트 102개 817,301B 중 10개 전부 읽음, 템플릿 16개 표본, 76개 구조만 확인 · 커밋 4e3fc89 · 스크립트는 읽기만 하고 실행하지 않음 · 지시상 동작"
@meta locale=ko
@source sk-fm title="design/garden-skills/gpt-image-2/SKILL.md · 26643B · frontmatter" path=design/garden-skills/gpt-image-2/SKILL.md lines=1:4
@source sk-intro title="SKILL.md · 두 가지 작업과 모드 먼저" path=design/garden-skills/gpt-image-2/SKILL.md lines=6:18
@source sk-check title="SKILL.md · check-mode.js 실행" path=design/garden-skills/gpt-image-2/SKILL.md lines=20:30
@source sk-a title="SKILL.md · Mode A" path=design/garden-skills/gpt-image-2/SKILL.md lines=32:40
@source sk-b title="SKILL.md · Mode B" path=design/garden-skills/gpt-image-2/SKILL.md lines=42:57
@source sk-c title="SKILL.md · Mode C" path=design/garden-skills/gpt-image-2/SKILL.md lines=59:68
@source sk-table title="SKILL.md · 모드 결정표" path=design/garden-skills/gpt-image-2/SKILL.md lines=70:77
@source sk-unsure title="SKILL.md · 모드가 불분명할 때" path=design/garden-skills/gpt-image-2/SKILL.md lines=79:82
@source sk-asktool title="SKILL.md · 사용자 입력 도구" path=design/garden-skills/gpt-image-2/SKILL.md lines=84:90
@source sk-struct title="SKILL.md · 스킬 구조" path=design/garden-skills/gpt-image-2/SKILL.md lines=92:98
@source sk-env title="SKILL.md · 환경 변수" path=design/garden-skills/gpt-image-2/SKILL.md lines=100:117
@source sk-outdir title="SKILL.md · 기본 출력 폴더" path=design/garden-skills/gpt-image-2/SKILL.md lines=119:126
@source sk-naming title="SKILL.md · 기본 파일 이름" path=design/garden-skills/gpt-image-2/SKILL.md lines=128:147
@source sk-promptsave title="SKILL.md · 프롬프트 저장 규칙" path=design/garden-skills/gpt-image-2/SKILL.md lines=149:162
@source sk-imgsave title="SKILL.md · 이미지 저장 규칙" path=design/garden-skills/gpt-image-2/SKILL.md lines=164:170
@source sk-cmds title="SKILL.md · Mode A 명령 예" path=design/garden-skills/gpt-image-2/SKILL.md lines=172:213
@source sk-bcusage title="SKILL.md · Mode B·C 사용법" path=design/garden-skills/gpt-image-2/SKILL.md lines=215:220
@source sk-json title="SKILL.md · JSON 템플릿 쓰는 법" path=design/garden-skills/gpt-image-2/SKILL.md lines=222:232
@source sk-ask title="SKILL.md · 묻는 법" path=design/garden-skills/gpt-image-2/SKILL.md lines=234:247
@source sk-index title="SKILL.md · 템플릿 색인 머리말" path=design/garden-skills/gpt-image-2/SKILL.md lines=249:263
@source sk-cats title="SKILL.md · 분류 2~15 목록" path=design/garden-skills/gpt-image-2/SKILL.md lines=265:404
@source sk-academic title="SKILL.md · 학술 그림 분류" path=design/garden-skills/gpt-image-2/SKILL.md lines=406:428
@source sk-tech title="SKILL.md · 기술 도표 분류" path=design/garden-skills/gpt-image-2/SKILL.md lines=441:453
@source sk-flow title="SKILL.md · 모드별 프롬프트 흐름" path=design/garden-skills/gpt-image-2/SKILL.md lines=455:472
@source sk-cons title="SKILL.md · 중요 제약" path=design/garden-skills/gpt-image-2/SKILL.md lines=474:487
@source sk-when title="SKILL.md · 언제 묻나" path=design/garden-skills/gpt-image-2/SKILL.md lines=489:499
@source cm-truthy title="scripts/check-mode.js · 2213B · 스위치 판정" path=design/garden-skills/gpt-image-2/scripts/check-mode.js lines=5:14
@source cm-branch title="check-mode.js · 결과 세 갈래" path=design/garden-skills/gpt-image-2/scripts/check-mode.js lines=20:35
@source cm-out title="check-mode.js · 출력" path=design/garden-skills/gpt-image-2/scripts/check-mode.js lines=37:64
@source sh-env title="scripts/shared.js · 6324B · 환경 파일 읽기" path=design/garden-skills/gpt-image-2/scripts/shared.js lines=10:45
@source sh-names title="shared.js · slug, 시각, 기본 경로, 프롬프트 저장" path=design/garden-skills/gpt-image-2/scripts/shared.js lines=56:102
@source sh-api title="shared.js · 키 요구, 요청, 응답 해석" path=design/garden-skills/gpt-image-2/scripts/shared.js lines=137:204
@source ge-cli title="scripts/generate.js · 5681B · 옵션" path=design/garden-skills/gpt-image-2/scripts/generate.js lines=19:38
@source ge-run title="generate.js · 실행 순서" path=design/garden-skills/gpt-image-2/scripts/generate.js lines=149:191
@source ed-cli title="scripts/edit.js · 7078B · 옵션" path=design/garden-skills/gpt-image-2/scripts/edit.js lines=22:44
@source ed-run title="edit.js · 실행 순서" path=design/garden-skills/gpt-image-2/scripts/edit.js lines=158:225
@source pkg title="scripts/package.json · 67B · ESM 표시" path=design/garden-skills/gpt-image-2/scripts/package.json
@source mf title="manifest.json · 580B · 버전과 호환 호스트" path=design/garden-skills/gpt-image-2/manifest.json
@source rd-count title="README.md · 19179B · 템플릿 수(79)" path=design/garden-skills/gpt-image-2/README.md lines=13:19
@source rd-modes title="README.md · 세 모드 표" path=design/garden-skills/gpt-image-2/README.md lines=33:41
@source rd-tree title="README.md · 폴더 구조(skills/gpt-image-2/)" path=design/garden-skills/gpt-image-2/README.md lines=178:208
@source rd-env title="README.md · 환경 변수" path=design/garden-skills/gpt-image-2/README.md lines=212:236
@source rd-prin title="README.md · 설계 원칙" path=design/garden-skills/gpt-image-2/README.md lines=245:251
@source pw-struct title="references/prompt-writing.md · 24019B · 템플릿 파일 표준 구조" path=design/garden-skills/gpt-image-2/references/prompt-writing.md lines=75:114
@source pw-skel title="prompt-writing.md · JSON 골격" path=design/garden-skills/gpt-image-2/references/prompt-writing.md lines=118:132
@source pw-fields title="prompt-writing.md · 분류별 필드 경험치" path=design/garden-skills/gpt-image-2/references/prompt-writing.md lines=337:479
@source pw-params title="prompt-writing.md · 필수·기본·무작위 파라미터" path=design/garden-skills/gpt-image-2/references/prompt-writing.md lines=483:544
@source pw-ask title="prompt-writing.md · 질문 우선순위" path=design/garden-skills/gpt-image-2/references/prompt-writing.md lines=547:581
@source pw-auto title="prompt-writing.md · 자동 보완" path=design/garden-skills/gpt-image-2/references/prompt-writing.md lines=657:676
@source pw-src title="prompt-writing.md · 사례 원본 파일 언급" path=design/garden-skills/gpt-image-2/references/prompt-writing.md lines=709:713
@source pw-phase title="prompt-writing.md · 관리자용 Phase 계획" path=design/garden-skills/gpt-image-2/references/prompt-writing.md lines=812:1005
@source tp-live title="references/ui-mockups/live-commerce-ui.md · 8688B · 기본값 표본" path=design/garden-skills/gpt-image-2/references/ui-mockups/live-commerce-ui.md lines=27:65
@source tp-livevar title="live-commerce-ui.md · 변체 안내(避免事项 절 없음)" path=design/garden-skills/gpt-image-2/references/ui-mockups/live-commerce-ui.md lines=205:227
@source tp-removal title="references/editing-workflows/object-removal.md · 2896B · 자연어 템플릿 전체" path=design/garden-skills/gpt-image-2/references/editing-workflows/object-removal.md lines=42:103
@source tp-pub title="references/academic-figures/publication-chart.md · 11594B · 면책과 사용 금지" path=design/garden-skills/gpt-image-2/references/academic-figures/publication-chart.md lines=11:43
@source tp-arch title="references/technical-diagrams/system-architecture.md · 11788B · 비트맵 경고와 피할 것" path=design/garden-skills/gpt-image-2/references/technical-diagrams/system-architecture.md lines=229:240
@source tp-selfie title="references/avatars-and-profile/style-transfer-selfie.md · 5194B · 신원 보존" path=design/garden-skills/gpt-image-2/references/avatars-and-profile/style-transfer-selfie.md lines=133:140
@source tp-brand title="references/poster-and-campaigns/brand-poster.md · 4502B · 피할 것" path=design/garden-skills/gpt-image-2/references/poster-and-campaigns/brand-poster.md
@source tp-white title="references/product-visuals/white-background-product.md · 5876B · 피할 것" path=design/garden-skills/gpt-image-2/references/product-visuals/white-background-product.md
@source tp-mood title="references/scenes-and-illustrations/minimalist-mood-scene.md · 4428B · 피할 것" path=design/garden-skills/gpt-image-2/references/scenes-and-illustrations/minimalist-mood-scene.md
@source tp-title title="references/typography-and-text-layout/title-safe-poster.md · 4766B · 피할 것" path=design/garden-skills/gpt-image-2/references/typography-and-text-layout/title-safe-poster.md
@source tp-anime title="references/storyboards-and-sequences/anime-key-visual.md · 4809B · 피할 것" path=design/garden-skills/gpt-image-2/references/storyboards-and-sequences/anime-key-visual.md
@source tp-edu title="references/slides-and-visual-docs/educational-diagram-slide.md · 5238B · 피할 것" path=design/garden-skills/gpt-image-2/references/slides-and-visual-docs/educational-diagram-slide.md
@source wde-cal title="design/garden-skills/web-design-engineer/references/design-calibration.md · Optional Image-First Branch" path=design/garden-skills/web-design-engineer/references/design-calibration.md lines=113:132

## 언제 켜지고, 어디서 사람이 개입하고, 언제 쓰면 안 되나 {#trigger}

@code source=sk-fm language=yaml

frontmatter에는 `name`과 `description`만 있고 호출 제한 필드는 없다. 그래서 모델이 `description`을 참고해 스스로 켤 수 있다.[](source:sk-fm) 판정: `description`은 판단에 쓰는 설명이고, 특정 단어가 들어오면 켜지는 목록은 아니다.

- 설명의 뜻: GPT Image 2용 이미지 생성·편집 스킬이고 세 환경에서 쓸 수 있다. (A) Garden 로컬 모드는 OpenAI 호환 API로 직접 이미지를 만들어 저장한다. (B) Host-Native 모드는 렌더한 프롬프트를 호스트 에이전트의 이미지 도구에 넘긴다. (C) Advisor 모드는 이미지 도구가 없을 때 프롬프트 조언만 한다.[](source:sk-fm)
- 설명이 드는 대상: 포스터, UI, 제품, 인포그래픽, 학술 그림, 기술 아키텍처 그림, 만화, 아바타, 스토리보드, 굿즈, 편집 워크플로다.[](source:sk-fm)
- 이 스킬이 하는 작업은 두 가지뿐이다. 이미지 생성(`POST /images/generations`)과 이미지 편집(`POST /images/edits`)이다.[](source:sk-intro)
- `manifest.json`은 버전 1.0.4와 호환 호스트 6개(`claude-code`, `claude-ai`, `cursor`, `codex-cli`, `gemini-cli`, `opencode`)를 적는다.[](source:mf)

사람은 아래 지점에서 개입한다. 질문은 런타임의 사용자 입력 도구를 먼저 쓴다. 도구가 없으면 짧은 번호 매긴 질문으로 묻고, 합칠 수 있는 질문은 한 번에 묻는다.[](source:sk-asktool)

| 지점 | 에이전트가 하는 일 | 사람의 몫 |
| --- | --- | --- |
| B인지 C인지 모를 때 | "환경의 이미지 도구로 만들까요, 프롬프트만 쓸까요?"를 한 번 묻는다[](source:sk-unsure) | {caution:모드를 고른다} |
| 스위치는 켰는데 키가 없을 때(A?) | 키를 달라고 하거나 B·C로 잠시 낮춘다[](source:cm-branch) | {caution:키를 준다} |
| Mode A 스크립트가 실패할 때 | 401, 네트워크, 할당량 오류를 보고하고 B·C로 바꿀지 묻는다[](source:sk-unsure) | {caution:전환을 정한다} |
| 핵심 정보가 빠졌을 때 | 템플릿 필드에 맞춘 질문을 한다. 예: 라이브 커머스 UI면 "진행자가 누구인가", "실제 사진·유명인 이름·인물 설명·무작위 중 무엇인가"[](source:sk-ask) | {caution:값을 준다} |
| 사용자가 "알아서 채워"라고 할 때 | 가장 중요한 질문 1~2개만 묻고 나머지는 기본값이나 무작위로 채운다[](source:pw-auto) | 맡긴다 |
| Mode B의 프롬프트 저장 | 기본으로 저장을 권한다. 사용자가 필요 없다고 하면 건너뛴다[](source:sk-promptsave) | 거절할 수 있다 |
| Mode C의 결과 | 프롬프트를 보여 주고, 사용자가 자기 이미지 도구로 실행하라고 알린다[](source:sk-c) | {bad:직접 실행한다} |

에이전트가 질문하는 조건은 다섯 가지로 좁혀 있다. 프롬프트 목표가 없을 때, 편집인데 원본 이미지가 없을 때, 주체의 정체나 시각 유형이 결과를 가를 때, 상품·가격·문구·UI 텍스트가 화면의 핵심일 때, 사용자의 목표들이 서로 충돌할 때다. 나머지는 합리적인 기본값으로 진행한다.[](source:sk-when)

**쓰면 안 되는 경우**는 원문이 템플릿 안내로 밝힌다.

| 상황 | 원문의 안내 |
| --- | --- |
| 편집하고 버전 관리할 기술 도표가 필요하다 {bad:부적합} | 이 분류는 PNG 비트맵을 만든다. 편집이 필요하면 mermaid, draw.io, excalidraw, Figma를 쓴다[](source:sk-tech) |
| 실제 데이터로 발표용 차트를 만들어야 한다 {bad:부적합} | `publication-chart`는 "출판급 차트처럼 보이는 그림"이고 좌표와 데이터가 맞는다고 보장하지 않는다. matplotlib, seaborn, ggplot2, Plotly를 쓴다[](source:tp-pub) |
| 학술 그림에 수치를 넣고 싶다 {caution:금지 있음} | 수치, 등치선, 색 막대 범위, 공식을 지어내는 것을 엄격히 금지한다[](source:sk-academic) |
| 이미지 생성·편집이 아닌 작업 | 이 스킬은 두 API 작업만 한다[](source:sk-intro) |

## 세 모드는 어떻게 갈리나 {#modes}

모드 판단은 두 단계다. 앞의 두 질문은 `check-mode.js`가 환경 변수로 답한다. 호스트에 이미지 도구가 있는지는 스크립트가 보지 않으므로 에이전트가 자기 도구 목록을 보고 판단한다.[](source:cm-branch)[](source:sk-b)

@workflow id=mode-decision title="모드 결정"
| md-run | check-mode.js 실행 | backend |
| md-flag | Garden 스위치 켜짐? | backend |
| md-key | API 키 있음? | backend |
| md-a | Mode A 로컬 생성 | backend |
| md-nokey | A? 키 요청 | external |
| md-host | 호스트 이미지 도구? | backend |
| md-ask | 사용자에게 묻기 | external |
| md-b | Mode B 호스트 위임 | backend |
| md-c | Mode C 프롬프트 조언 | backend |
| md-run > md-flag | |
| md-flag > md-key | 예 |
| md-flag > md-host | 아니오 |
| md-key > md-a | 예 | emphasis |
| md-key > md-nokey | 아니오 |
| md-nokey > md-host | B·C로 낮춤 | dashed |
| md-a > md-ask | 실패 시 | dashed |
| md-host > md-b | 있음 |
| md-host > md-c | 없음 |
| md-host > md-ask | 불분명 |
| md-ask > md-b | 도구로 |
| md-ask > md-c | 프롬프트만 |

@steps id=mode-steps
| md-run | check-mode.js 실행 | 어떤 작업이든 첫 단계로 실행한다. `--json`을 붙이면 구조화된 결과를 낸다. 결과의 `mode`는 `A`, `A?`, `B-or-C` 중 하나다.[](source:sk-check)[](source:cm-out) | mode-decision | md-run |
| md-flag | Garden 스위치 켜짐? | `ENABLE_GARDEN_IMAGEGEN`이 `1`, `true`, `yes`, `on`이면 예다. 코드는 `y`도 참으로 친다.[](source:sk-a)[](source:cm-truthy) | mode-decision | md-flag |
| md-key | API 키 있음? | `OPENAI_API_KEY`가 있으면 예다.[](source:sk-a)[](source:cm-branch) | mode-decision | md-key |
| md-a | Mode A 로컬 생성 | 템플릿 선택부터 이미지 저장까지 끝까지 한다. `generate.js`로 생성하고 `edit.js`로 편집한다. 원문은 이 모드를 가장 강한 모드라고 부른다.[](source:sk-a) | mode-decision | md-a |
| md-nokey | A? 키 요청 | 스크립트 출력이 사용자에게 키를 요청하거나 B·C로 잠시 낮추라고 안내한다. 결정표에서 이 상태는 스크립트를 부르지 않는다.[](source:cm-branch)[](source:sk-table) | mode-decision | md-nokey |
| md-host | 호스트 이미지 도구? | 도구 목록에 `image_generation`, `imagegen`, `dalle`, `nano_banana`, `mcp__*image*`, `make_image` 같은 이름이 있는지 본다. ChatGPT, Codex, Gemini, Cursor처럼 이미지를 직접 만드는 클라이언트에서 불렸는지, 사용자가 "네 도구로 만들어"라고 했는지도 신호다.[](source:sk-b) | mode-decision | md-host |
| md-ask | 사용자에게 묻기 | B와 C를 가르지 못하면 한 번 묻는다. Mode A가 401, 네트워크, 할당량으로 실패해도 오류를 알리고 B·C로 바꿀지 묻는다.[](source:sk-unsure) | mode-decision | md-ask |
| md-b | Mode B 호스트 위임 | 스킬은 프롬프트 작성 안내로 낮아진다. `generate.js`를 부르지 않는다(키가 없어 반드시 실패한다). 렌더한 프롬프트를 호스트 도구에 바로 넘긴다.[](source:sk-b) | mode-decision | md-b |
| md-c | Mode C 프롬프트 조언 | 최종 프롬프트를 사용자에게 그대로 보여 주고 파일로도 저장한다. ChatGPT, Midjourney, DALL·E, Sora, Nano Banana 같은 사용처를 한 줄로 권한다. 이미지를 만든 척하지 않고 "바로 쓸 수 있는 프롬프트를 만들었으니 이미지 도구로 실행하라"고 분명히 말한다.[](source:sk-c) | mode-decision | md-c |

모드에 따라 스크립트 호출과 저장 여부가 달라진다.[](source:sk-table)

| 조건 | 모드 | 스크립트 | 프롬프트 저장 | 이미지 저장 |
| --- | --- | --- | --- | --- |
| 스위치 켜짐 + 키 있음 | A | `generate.js`, `edit.js` | 자동 | 자동 |
| 스위치 켜짐 + 키 없음 | A? | 부르지 않는다(키 먼저) | - | - |
| 스위치 꺼짐 + 호스트 도구 있음 | B | 부르지 않는다(호스트 도구) | 선택 | 호스트가 정한다 |
| 스위치 꺼짐 + 호스트 도구 없음 | C | 부르지 않는다 | {bad:반드시} | 만들 수 없다 |

판정: Claude Code처럼 기본 이미지 도구가 없는 호스트에서 환경 변수를 두지 않으면 이 스킬은 Mode C로 동작한다. 위 결정표의 마지막 행과 Mode B의 신호 목록이 근거다.[](source:sk-table)[](source:sk-b)

설정은 이 순서로 읽는다: CLI 인자, `process.env`, `<cwd>/.env`, `<cwd>/.gateway.env`, `~/.gateway.env`.[](source:sk-env)

| 변수 | 쓰임 | 기본값 |
| --- | --- | --- |
| `ENABLE_GARDEN_IMAGEGEN` | Mode A 스위치. 없거나 다른 값이면 B·C로 간다 | 없음[](source:sk-env) |
| `OPENAI_API_KEY` | Mode A에 필수. B·C에는 필요 없다 | 없음[](source:sk-env) |
| `OPENAI_BASE_URL` | 서드파티 호환 게이트웨이로 바꿀 수 있다 | `https://api.openai.com/v1`[](source:sk-env) |
| `OPENAI_IMAGE_MODEL` | 게이트웨이가 지원하는 모델로 바꿀 수 있다. 예: `gpt-image-1`, `dall-e-3` | `gpt-image-2`[](source:sk-env) |

코드에서 확인한 세부 동작이다. 실행은 하지 않았다.

- 파일에서 읽은 값은 아직 비어 있는 키만 채운다. 그래서 `process.env`가 파일보다 앞서고, `.env`가 `.gateway.env`보다 앞선다.[](source:sh-env)
- CLI로 바꿀 수 있는 값은 `--model`뿐이다. 키와 base URL을 넘기는 인자는 없다.[](source:ge-cli)[](source:ed-cli)
- `generate.js`와 `edit.js`는 `ENABLE_GARDEN_IMAGEGEN`을 보지 않고 `OPENAI_API_KEY`만 요구한다. 판정: Mode B·C에서 스크립트를 부르지 않는 규칙은 코드가 막지 않고 지시로만 지켜진다.[](source:sh-api)[](source:ge-run)

## 프롬프트는 어떻게 만드나 {#prompt-flow}

세 모드 모두 앞 6단계를 똑같이 거친다. 이미지를 내보내는 7단계에서만 갈린다.[](source:sk-flow)

@workflow id=prompt-pipeline title="모드를 아는 프롬프트 흐름"
| pf-mode | 1 모드 확인 | backend |
| pf-kind | 2 생성인가 편집인가 | backend |
| pf-cat | 3 분류 고르기 | backend |
| pf-tpl | 4 템플릿 하나 읽기 | backend |
| pf-fill | 5~6 형식대로 값 채우기 | backend |
| pf-gap | 핵심 정보 빠짐? | backend |
| pf-q | 필드 기준 질문 | external |
| pf-which | 어느 모드? | backend |
| pf-a | 7-A 스크립트 실행 | backend |
| pf-b | 7-B 호스트 도구에 전달 | backend |
| pf-c | 7-C 프롬프트 보여 주기 | backend |
| pf-mode > pf-kind | |
| pf-kind > pf-cat | |
| pf-cat > pf-tpl | |
| pf-tpl > pf-fill | |
| pf-fill > pf-gap | |
| pf-gap > pf-q | 예 |
| pf-q > pf-fill | 답 |
| pf-gap > pf-which | 아니오 |
| pf-which > pf-a | A |
| pf-which > pf-b | B |
| pf-which > pf-c | C |

@steps id=prompt-steps
| pf-mode | 1 모드 확인 | `check-mode.js`로 모드를 정한다. 위 패널의 결정 흐름이다.[](source:sk-flow) | prompt-pipeline | pf-mode |
| pf-kind | 2 생성인가 편집인가 | 새 이미지를 만드는지, 원본 이미지를 고치는지 가른다. 편집 템플릿은 `scripts/edit.js`에 대응한다.[](source:sk-flow)[](source:sk-cats) | prompt-pipeline | pf-kind |
| pf-cat | 3 분류 고르기 | 색인에서 가장 가까운 분류 폴더를 찾는다. 템플릿 설계가 처음이면 `references/prompt-writing.md`를 먼저 읽는다.[](source:sk-index) | prompt-pipeline | pf-cat |
| pf-tpl | 4 템플릿 하나 읽기 | 그 분류의 템플릿 파일 하나만 읽는다. `references/` 전체를 한꺼번에 읽지 않는다.[](source:sk-index)[](source:sk-flow) | prompt-pipeline | pf-tpl |
| pf-fill | 5~6 형식대로 값 채우기 | 템플릿 형식을 그대로 따른다. 대부분은 JSON이고, `hand-drawn-infographic.md`, `scientific-schematic.md` 같은 일부는 구조화된 자연어다. 사용자가 준 값은 바로 넣고, 없으면 `default`를 쓴다.[](source:sk-flow)[](source:sk-json) | prompt-pipeline | pf-fill |
| pf-gap | 핵심 정보 빠짐? | 빠진 정보가 결과를 크게 바꾸면 예다. "어떤 스타일을 원하세요?"처럼 넓게 묻지 않는다.[](source:sk-json)[](source:sk-ask) | prompt-pipeline | pf-gap |
| pf-q | 필드 기준 질문 | 템플릿의 "빠진 정보 질문 순서"대로 묻는다. 상품이 빠졌으면 상품 이름, 가격 지정 여부, 댓글·선물 자동 보완 여부를 묻는다.[](source:sk-ask) | prompt-pipeline | pf-q |
| pf-which | 어느 모드? | 1단계에서 정한 모드로 갈린다.[](source:sk-flow) | prompt-pipeline | pf-which |
| pf-a | 7-A 스크립트 실행 | 프롬프트를 `garden-gpt-image-2/prompt/`에 저장하고 `generate.js`나 `edit.js`를 부른다. 이미지는 `garden-gpt-image-2/image/`에 저장된다.[](source:sk-flow) | prompt-pipeline | pf-a |
| pf-b | 7-B 호스트 도구에 전달 | 최종 프롬프트를 호스트 이미지 도구에 바로 넘긴다. 필요하면 프롬프트 사본을 저장한다.[](source:sk-flow) | prompt-pipeline | pf-b |
| pf-c | 7-C 프롬프트 보여 주기 | `garden-gpt-image-2/prompt/<task-slug>-<timestamp>.md`에 저장하고 대화에 전문을 보여 준다. 사용법이나 추천 도구를 한 줄 붙인다.[](source:sk-flow) | prompt-pipeline | pf-c |
| pf-report | 8 한 줄 보고 | 끝나면 한 문장으로 알린다: 현재 모드, 프롬프트 위치, 이미지 위치(있으면). 세 갈래 모두 이 보고로 끝난다.[](source:sk-flow) | | |

모든 모드에 적용되는 제약은 이렇다.[](source:sk-cons)

- 템플릿의 JSON은 프롬프트 구조 템플릿이다. API 요청 본문 템플릿으로 쓰지 않는다.
- 이미지 모델에 넘기는 것은 렌더한 프롬프트 문자열이다. 펼친 JSON일 수도, 구조화된 자연어 문단일 수도 있다.
- 사용자가 요구하지 않으면 `SKILL.md`의 모드 설명을 최종 프롬프트에 복사하지 않는다. 그 설명은 에이전트용이다.
- Mode A에서만: 생성은 JSON body, 편집은 multipart form data로 보낸다. 응답은 `data[0].b64_json`을 먼저 보고 `data[0].url`도 받는다. 상류 API가 요구하지 않으면 특별한 query 인자를 붙이지 않는다.

템플릿 값은 `{argument name="host name" default="Elon Musk"}` 형식으로 적는다.[](source:pw-params) `prompt-writing.md`는 필드를 세 종류로 나누고, 템플릿마다 이 분류를 적게 한다.[](source:pw-params)

| 종류 | 처리 | 원문 예 |
| --- | --- | --- |
| 핵심 파라미터 | 빠지면 먼저 묻는다 | 주체가 누구인가, 상품 이름, 도시 이름, 실제 사진인지 글 설명인지[](source:pw-params) |
| 기본값 파라미터 | 기본값으로 진행한다 | 배경색, 보조 버튼 문구, 일반 조명어[](source:pw-params) |
| 무작위 파라미터 | 스타일 범위 안에서 채운다 | 지나가는 사람의 닉네임, 보조 채팅 메시지, 작은 장식[](source:pw-params) |

자동 보완을 하더라도 주체 일관성을 깨거나, 사용자가 정한 값과 충돌하거나, 터무니없는 보조 요소를 만들지 않는다.[](source:pw-auto) 질문의 일반 우선순위는 주체 출처, 이미지 용도, 핵심 대상, 자동 보완 허용 여부, 꼭 넣거나 뺄 요소 순이다.[](source:pw-ask)

템플릿 라이브러리는 분류 폴더 17개와 템플릿 파일 93개로 되어 있다. 아래 개수는 폴더를 세어 얻었다.[](source:sk-cats)[](source:sk-academic)[](source:sk-tech)

| 분류 폴더 | 파일 수 | 이 분석의 표본 |
| --- | --- | --- |
| `ui-mockups` | 6 | `live-commerce-ui` |
| `product-visuals` | 6 | `white-background-product` |
| `maps` | 5 | `illustrated-city-map` |
| `slides-and-visual-docs` | 4 | `educational-diagram-slide` |
| `poster-and-campaigns` | 8 | `brand-poster` |
| `portraits-and-characters` | 5 | `professional-portrait` |
| `scenes-and-illustrations` | 4 | `minimalist-mood-scene` |
| `editing-workflows` | 5 | `object-removal`(전부 읽음) |
| `avatars-and-profile` | 5 | `style-transfer-selfie` |
| `storyboards-and-sequences` | 8 | `anime-key-visual` |
| `grids-and-collages` | 5 | `lookbook-grid` |
| `branding-and-packaging` | 6 | `beverage-label-design` |
| `typography-and-text-layout` | 2 | `title-safe-poster` |
| `assets-and-props` | 2 | `game-screenshot-mockup` |
| `academic-figures` | 9 | `publication-chart` |
| `infographics` | 6 | `hand-drawn-infographic` |
| `technical-diagrams` | 7 | `system-architecture` |

93개 모두 제목 구조를 확인했다. 92개는 `prompt-writing.md`의 표준 구조(적용 범위, 언제 쓰나, 빠진 정보 질문 순서, 주 템플릿, 변형, 피할 것)를 따른다.[](source:pw-struct) `live-commerce-ui.md`만 "사용 규칙, 템플릿 1~3, 변형 만드는 법"으로 되어 있고 파라미터 전략·피할 것 절이 없다. 표준은 이 절들을 생략하지 말라고 한다.[](source:tp-livevar)[](source:pw-struct)

8개(편집 워크플로 5개, `style-transfer-selfie`, `hand-drawn-infographic`, `scientific-schematic`)에는 JSON 블록이 없고 자연어 템플릿이다.[](source:tp-removal)

표본 템플릿에서 확인한 수치다. 각 템플릿의 "피할 것" 목록에 든 실패 기준이고, 표본 16개 밖의 템플릿 수치는 이 분석에 없다.

@facts
| 학술 그림 전체 | 흰 배경, 주색 3개 이하, 단색 인쇄 가능. 분류 공통 규칙이다[](source:sk-academic) |
| `publication-chart` | 글자 10pt 이상, 색 6개 이하. 좌표 정확도를 보장하지 않는다[](source:tp-pub) |
| `system-architecture` | 노드가 15개를 넘으면 여러 장으로 나눈다. PostgreSQL·Redis·Kafka 실제 로고를 쓰지 않는다[](source:tp-arch) |
| `brand-poster` | slogan 12자 이하, 글꼴 3종 미만, 제품은 한 장에 하나[](source:tp-brand) |
| `white-background-product` | 상품이 화면의 40% 미만이면 안 된다. 없는 브랜드명을 지어내지 않는다[](source:tp-white) |
| `minimalist-mood-scene` | 주색 2개 이하, 글자 18자 이하[](source:tp-mood) |
| `title-safe-poster` | 표어 글자가 화면의 40%보다 작으면 안 된다. 오탈자가 가장 심각한 실패다[](source:tp-title) |
| `anime-key-visual` | 인물 7명 이하, 주색 4개 이하[](source:tp-anime) |
| `educational-diagram-slide` | 단계 7개 이하[](source:tp-edu) |

`prompt-writing.md`의 분류별 경험치에도 권고 수치가 있다. 라인업 포스터의 SKU는 보통 12~36개, 하루 여행 지도의 정류장은 5~7개를 권한다. 전체 마스코트 문서는 18개 모듈(01~18 번호)을 명시하고, 간단한 `mascot-brand-kit`(6~9칸)과 구분한다.[](source:pw-fields)

## 무엇을 저장하고, 스크립트는 실제로 무엇을 하나 {#outputs}

사용자가 경로를 정하지 않으면 작업 폴더 아래 두 폴더를 쓴다. Mode A에서는 스크립트가 폴더를 만들고, B·C에서는 에이전트가 프롬프트를 쓰기 전에 `mkdir -p`를 한다.[](source:sk-outdir)

| 무엇 | 경로 | 모드 |
| --- | --- | --- |
| 최종 프롬프트 | `garden-gpt-image-2/prompt/<task-slug>-<timestamp>.md` | A, B, C 모두 권장[](source:sk-outdir)[](source:sk-naming) |
| 이미지 | `garden-gpt-image-2/image/<task-slug>-<timestamp>.png` | A만. B는 호스트가 정하고 C는 이미지가 없다[](source:sk-outdir)[](source:sk-imgsave) |

`<task-slug>`는 사용자 요청에서 뽑은 짧은 이름이고, `<timestamp>`의 예는 `20260424-153045`다. 원문의 예: `garden-gpt-image-2/image/live-commerce-ui-20260424-153045.png`.[](source:sk-naming)

| 모드 | 프롬프트 저장 | 이유 |
| --- | --- | --- |
| A | {bad:반드시} | 실제 생성·편집에 들어가면 저장한다[](source:sk-promptsave) |
| B | 권장 | 재사용을 위해 권하고, 사용자가 필요 없다고 하면 건너뛴다[](source:sk-promptsave) |
| C | {bad:반드시} | 사용자가 프롬프트를 가져가 실행하므로 저장하지 않으면 헛수고다[](source:sk-promptsave) |

모든 모드에서 사용자가 프롬프트 파일 경로를 주면 그 파일을 입력으로 쓴다. 사용자가 프롬프트를 글로 줬어도 최종 프롬프트를 먼저 저장한다. `--prompt-output`을 주면 그 경로를 따른다.[](source:sk-promptsave) 이미지는 `--image`나 `--output`을 주면 그 경로에, 아니면 기본 폴더에 저장한다.[](source:sk-imgsave)

Mode A 명령의 예는 이렇다.[](source:sk-cmds)

```bash title="원문의 Mode A 예시(실행하지 않음)"
node skills/gpt-image-2/scripts/generate.js --prompt "A cute baby sea otter" --size 1024x1024 --quality high
node skills/gpt-image-2/scripts/edit.js --image assets/source.png --mask assets/mask.png --prompt "Replace only the masked area with a glass vase"
```

원문의 명령 경로는 `skills/gpt-image-2/`로 시작한다. README의 폴더 구조도 같다.[](source:sk-cmds)[](source:rd-tree) 이 저장소에서는 스킬이 `design/garden-skills/gpt-image-2/`에 있다. 설치 위치가 다를 때 경로를 어떻게 바꿀지는 `원문에 명시 없음`이다.

`SKILL.md`의 설명을 스크립트 코드와 대조했다. 코드는 읽기만 했다.

| `SKILL.md` 설명 | 코드 | 판정 |
| --- | --- | --- |
| 스위치 값은 `1`, `true`, `yes`, `on` | `y`도 참으로 친다[](source:cm-truthy) | 일치(추가 있음) |
| 설정 순서 첫째가 CLI 인자 | 이미지 스크립트의 CLI는 `--model`만 바꾼다. `check-mode.js`는 인자를 읽지 않는다[](source:ge-cli)[](source:cm-truthy) | 부분 일치 |
| `generate.js`, `edit.js`는 Mode A에서만 쓴다 | 두 스크립트는 스위치를 확인하지 않는다. 키만 있으면 실행된다[](source:sh-api) | 지시로만 지킴 |
| `<task-slug>`는 사용자 요청에서 뽑는다 | 프롬프트 앞 8단어를 ASCII slug로 만든다. 영문자·숫자가 없으면 `generated-image`나 `edited-image`가 된다[](source:ge-run)[](source:sh-names) | 어긋남 |
| A는 프롬프트를 반드시 저장 | API 호출 전에 저장한다. `--promptfile`로 받은 파일도 사본을 다시 저장한다[](source:ge-run)[](source:sh-names) | 일치(추가 있음) |
| 응답은 `data[0].b64_json`을 먼저, `data[0].url`도 받는다 | 같다. `--n`으로 여러 장을 요청해도 첫 장만 저장한다[](source:sh-api)[](source:ge-run) | 일치(제한 있음) |
| 이미지 이름은 `.png` | 기본 경로는 `--output-format`과 상관없이 `.png`다. 확장자가 없는 경로에는 `.png`를 붙인다[](source:sh-names) | `원문에 명시 없음` |
| 실패하면 오류를 보고하고 B·C 전환을 묻는다 | 응답이 실패면 `Image API error (<status>): <본문>`을 출력하고 exit 1로 끝난다[](source:sh-api)[](source:ge-run) | 일치 |
| 폴더가 없으면 스크립트가 만든다 | 저장 전에 상위 폴더를 재귀적으로 만든다[](source:sh-names)[](source:sh-api) | 일치 |

판정: `--json`을 붙이면 결과에 API 응답 전체(`apiResponse`)가 들어간다. `b64_json`이 오는 응답이면 이미지 전체가 base64 글자로 출력에 섞일 수 있다. 근거는 출력 객체를 만드는 줄이다.[](source:ge-run)[](source:ed-run)

## 흐름 속 위치 {#position}

@workflow id=gi-position title="gpt-image-2 앞뒤"
| pos-wde | web-design-engineer | backend |
| pos-gi | gpt-image-2 | backend |
| pos-wde > pos-gi | image-first 분기 | dashed |
| pos-gi > pos-wde | 참조 이미지 | emphasis |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `web-design-engineer`(앞) | 구조화된 이미지 생성 요청 | - | 조건부 권고다. `web-design-engineer`의 선택적 image-first 분기에서 "있으면" `gpt-image-2`를 쓰고, 없으면 호스트의 이미지 흐름을 따르거나 필요한 자산을 정직하게 남긴다[](source:wde-cal) | r35 |
| `web-design-engineer`(뒤, 복귀) | - | 생성한 참조 이미지 | `web-design-engineer`는 참조 이미지에서 구현 결정을 뽑는다. 코드와 사용자가 준 브랜드 자산이 생성된 픽셀과 충돌하면 그쪽을 따른다[](source:wde-cal) | r35 |

`gpt-image-2`의 `SKILL.md`는 `web-design-engineer`를 부르지 않는다. 연결은 `web-design-engineer` 쪽에서만 이름으로 적혀 있다.[](source:wde-cal)

판정: 위임받은 쪽이 Mode C이면 이미지 대신 프롬프트만 돌아간다. 그래서 `web-design-engineer`는 이 경우 참조 이미지를 얻지 못한다. Mode C가 이미지를 만들 수 없다는 결정표가 근거다.[](source:sk-table)

`web-design-engineer`는 image-first 분기를 시각적으로 중요한 새 작업이나 전면 개편(캠페인 랜딩, 브랜드 출시, 제품 hero, 아트 디렉션이 강한 포트폴리오)에만 쓴다. 사용자가 Figma·스크린샷·성숙한 디자인 시스템을 줬거나, 확장·수리·대시보드·폼·데이터 표 작업이거나, 이미지 생성이 비용만 늘린다면 건너뛴다.[](source:wde-cal)

전체 흐름은 `design/_group-garden-visual/garden-visual.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 스킬 폴더의 원본 텍스트는 102개, 817,301B다. 모두 커밋되어 있다. 파일별 목록과 읽은 정도는 같은 폴더의 `files.md`에 있다.
- 전부 읽은 파일은 10개, 94,680B다: `SKILL.md`, `README.md`, `manifest.json`, `scripts/` 5개(`check-mode.js`, `shared.js`, `generate.js`, `edit.js`, `package.json`), `references/prompt-writing.md`, `references/editing-workflows/object-removal.md`.[](source:pkg)
- 표본으로 일부 절을 읽은 템플릿은 16개, 101,670B다. 분류마다 하나씩 골라 적용 범위, 빠진 정보 질문 순서, 피할 것을 읽었다. `live-commerce-ui`, `publication-chart`, `system-architecture`, `style-transfer-selfie`는 앞부분도 읽었다.
- 구조만 확인한 템플릿은 76개, 620,951B다. `구조·표본만 확인(전부 읽지 않음)`: `##` 제목, `{argument` 개수, JSON 블록 개수만 셌다.
- 제외한 파일: `README.zh-CN.md`(18,942B)는 영어 `README.md`의 다른 언어판이라 열지 않았다. 번역본 `*.ko.md` 96개도 열지 않았다. 스킬 폴더에 바이너리는 없다. README가 가리키는 표지 이미지(`../../dist/imgs/covers/gpt-image-2.webp`)와 사례 갤러리는 폴더 밖 자료라 보지 않았다.
- 분석 중 바뀐 파일: 없음. 작업 트리는 commit `4e3fc89` 그대로다.
- 원문 대조 범위: 활성화 제한 1개(호출 제한 필드 없음), 모드 조건 4행, 사람 개입 7곳, 금지·제약 10개, 질문 조건 5개, 저장 규칙 3행과 통용 규칙 4개, 종료 보고 1개, 코드 대조 9행을 모두 원문과 대조했다. 관계 행 r35는 원장과 원문을 다시 대조했다.

@callout level=open-question title="확신하지 못한 곳"
- 템플릿 수가 원문마다 다르다. `description`은 "18개 대분류, 80개 넘는 템플릿", README는 "18개 분류, 79개 템플릿"이라고 한다. 실제 분류 폴더는 17개, 템플릿 파일은 93개다. 색인은 방법론 문서까지 18절로 센다.[](source:sk-fm)[](source:rd-count)[](source:sk-index)
- `prompt-writing.md`의 뒤쪽 절반은 템플릿 관리자용 Phase 계획이다. 지금 없는 `maps-and-infographics/` 폴더 이름과, 저장소에 없는 사례 원본 `skills/gpt-image-2/100+GPT-Image2提示词.md`를 가리킨다. 에이전트가 이 부분을 실행 지시로 읽을지는 원문만으로 알 수 없다.[](source:pw-src)[](source:pw-phase)
- 실존 인물과 상표를 다루는 공통 규칙은 `SKILL.md`에 `원문에 명시 없음`이다. 템플릿마다 다르다. `live-commerce-ui`의 기본값은 진행자 "Elon Musk"와 SPACEX·Tesla 로고다. 반면 `brand-poster`와 `professional-portrait`는 알아볼 수 있는 제3자 브랜드를 피하라고 하고, `style-transfer-selfie`는 실제 저작권 캐릭터 이름을 직접 쓰지 말라고 한다.[](source:tp-live)[](source:tp-brand)[](source:tp-selfie)
- `object-removal`은 저작권 로고·워터마크를 지우지 말라고 한다(사용자가 정당한 소유자일 때 제외). 이 조건을 에이전트가 어떻게 확인하는지는 `원문에 명시 없음`이다.[](source:tp-removal)
- Mode A가 실제 API에서 성공하는지, 실패할 때 B·C 전환 질문이 실제로 나오는지는 실행해 확인하지 않았다.
