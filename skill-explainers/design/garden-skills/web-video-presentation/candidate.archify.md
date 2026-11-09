# web-video-presentation 스킬은 에이전트를 어떻게 바꾸나 {#web-video-presentation-skill}

`web-video-presentation`을 쓰면 에이전트는 글을 받자마자 코드를 짜지 않는다. 먼저 구어 원고 `script.md`와 개발 계획 `outline.md`를 한 번에 쓰고, 자체 검사로 고친 뒤 멈춘다. 사용자와 5가지를 한 자리에서 맞춘 다음에야 클릭으로 넘기는 16:9 웹 발표를 만든다.[](source:sk-flow)[](source:sk-cpp)

- 켜지는 때: 글이나 구어 원고를 "영상처럼 보이는" 클릭형 웹 발표로 만들고, 필요하면 음성을 합성하려 할 때다. 호출 제한 필드는 없다.[](source:sk-fm)
- 사람 확인 지점: `Checkpoint Plan`(5가지 한 번에 맞추기), 1장 검수, `Checkpoint Audio`(음성 합성 여부) 세 곳은 반드시 멈춘다.[](source:sk-flow)
- 경계: outline은 리듬과 정보 밀도만 계획하고 애니메이션은 계획하지 않는다. 애니메이션은 장을 만들 때 정한다.[](source:sk-fm)[](source:sk-bound)
- 쓰면 안 되는 때: 원문은 사용 금지 작업을 따로 적지 않는다. 소재 없이 "X 주제 영상 만들어 줘"라고만 하면 에이전트가 소재를 먼저 달라고 되묻는다. 스킬이 내용을 대신 구상하지 않는다.[](source:sk-input)

@answer scope="design/garden-skills/web-video-presentation v1.2.2 · 원본 텍스트 94개 중 41개 정독, 53개 구조·표본 · 커밋 4e3fc89 · 지시상 동작 · 스크립트·TTS 실행 안 함"
@meta locale=ko
@source sk-fm title="design/garden-skills/web-video-presentation/SKILL.md · 23239B · frontmatter(중국어 원본)" path=design/garden-skills/web-video-presentation/SKILL.md lines=1:4
@source sk-scope title="SKILL.md · 적용 장면과 결과물" path=design/garden-skills/web-video-presentation/SKILL.md lines=8:21
@source sk-flow title="SKILL.md · 작업 흐름 개요" path=design/garden-skills/web-video-presentation/SKILL.md lines=25:49
@source sk-dir title="SKILL.md · 작업 폴더 구성" path=design/garden-skills/web-video-presentation/SKILL.md lines=51:72
@source sk-truth title="SKILL.md · narrations.ts 단일 진실 원천" path=design/garden-skills/web-video-presentation/SKILL.md lines=74:77
@source sk-self title="SKILL.md · 자체 검사 규약" path=design/garden-skills/web-video-presentation/SKILL.md lines=81:102
@source sk-read title="SKILL.md · 단계별 읽을 파일" path=design/garden-skills/web-video-presentation/SKILL.md lines=106:123
@source sk-input title="SKILL.md · 1.1 입력 확인" path=design/garden-skills/web-video-presentation/SKILL.md lines=129:135
@source sk-12 title="SKILL.md · 1.2 script와 outline 한 번에" path=design/garden-skills/web-video-presentation/SKILL.md lines=137:146
@source sk-bound title="SKILL.md · outline의 경계" path=design/garden-skills/web-video-presentation/SKILL.md lines=147:163
@source sk-cpp title="SKILL.md · Checkpoint Plan 준비 작업" path=design/garden-skills/web-video-presentation/SKILL.md lines=167:178
@source sk-cpp-tpl title="SKILL.md · Checkpoint Plan 요약 틀" path=design/garden-skills/web-video-presentation/SKILL.md lines=180:224
@source sk-cpp-fb title="SKILL.md · 피드백 후 처리" path=design/garden-skills/web-video-presentation/SKILL.md lines=226:230
@source sk-scaf title="SKILL.md · 2.1 골격 생성" path=design/garden-skills/web-video-presentation/SKILL.md lines=236:256
@source sk-ch1 title="SKILL.md · 2.2 1장과 검수" path=design/garden-skills/web-video-presentation/SKILL.md lines=258:285
@source sk-modes title="SKILL.md · 2.3 모드 A·B·C" path=design/garden-skills/web-video-presentation/SKILL.md lines=287:314
@source sk-sub title="SKILL.md · 병렬 서브에이전트 지시문과 모드 전환" path=design/garden-skills/web-video-presentation/SKILL.md lines=316:328
@source sk-24 title="SKILL.md · 2.4 단일 장 핵심" path=design/garden-skills/web-video-presentation/SKILL.md lines=330:343
@source sk-25 title="SKILL.md · 2.5 STORAGE_KEY" path=design/garden-skills/web-video-presentation/SKILL.md lines=345:349
@source sk-cpa title="SKILL.md · Checkpoint Audio" path=design/garden-skills/web-video-presentation/SKILL.md lines=353:372
@source sk-p3 title="SKILL.md · Phase 3 음성 합성" path=design/garden-skills/web-video-presentation/SKILL.md lines=376:391
@source sk-p4 title="SKILL.md · Phase 4 녹화" path=design/garden-skills/web-video-presentation/SKILL.md lines=395:404
@source sk-ten title="SKILL.md · 열 가지 원칙" path=design/garden-skills/web-video-presentation/SKILL.md lines=408:424
@source sk-fbk title="SKILL.md · 피드백 대응" path=design/garden-skills/web-video-presentation/SKILL.md lines=428:432
@source cc-ppt title="design/garden-skills/web-video-presentation/references/CHAPTER-CRAFT.md · 10676B · 영상이지 PPT가 아니다" path=design/garden-skills/web-video-presentation/references/CHAPTER-CRAFT.md lines=5:33
@source cc-reveal title="CHAPTER-CRAFT.md · 하나씩 드러내기" path=design/garden-skills/web-video-presentation/references/CHAPTER-CRAFT.md lines=37:54
@source cc-dual title="CHAPTER-CRAFT.md · 두 출처 원칙" path=design/garden-skills/web-video-presentation/references/CHAPTER-CRAFT.md lines=58:85
@source cc-look title="CHAPTER-CRAFT.md · 글자 크기·여백·애니메이션" path=design/garden-skills/web-video-presentation/references/CHAPTER-CRAFT.md lines=89:99
@source cc-ai title="CHAPTER-CRAFT.md · AI 티 피하기" path=design/garden-skills/web-video-presentation/references/CHAPTER-CRAFT.md lines=102:117
@source cc-frame title="CHAPTER-CRAFT.md · 이미 만들어진 틀" path=design/garden-skills/web-video-presentation/references/CHAPTER-CRAFT.md lines=121:129
@source cc-token title="CHAPTER-CRAFT.md · token 필수와 자유" path=design/garden-skills/web-video-presentation/references/CHAPTER-CRAFT.md lines=137:160
@source cc-eng title="CHAPTER-CRAFT.md · 공학 금지선" path=design/garden-skills/web-video-presentation/references/CHAPTER-CRAFT.md lines=162:177
@source cc-check title="CHAPTER-CRAFT.md · 완료 자체 검사" path=design/garden-skills/web-video-presentation/references/CHAPTER-CRAFT.md lines=181:224
@source of-cc title="design/garden-skills/web-video-presentation/references/OUTLINE-FORMAT.md · 8523B · CHAPTER-CRAFT 먼저 읽기" path=design/garden-skills/web-video-presentation/references/OUTLINE-FORMAT.md lines=6:6
@source of-box title="OUTLINE-FORMAT.md · outline은 개발 계획" path=design/garden-skills/web-video-presentation/references/OUTLINE-FORMAT.md lines=8:25
@source of-dur title="OUTLINE-FORMAT.md · 시간 표기 규칙" path=design/garden-skills/web-video-presentation/references/OUTLINE-FORMAT.md lines=59:61
@source of-meta title="OUTLINE-FORMAT.md · 머리 정보와 장 제목" path=design/garden-skills/web-video-presentation/references/OUTLINE-FORMAT.md lines=72:93
@source of-pool title="OUTLINE-FORMAT.md · 정보 풀" path=design/garden-skills/web-video-presentation/references/OUTLINE-FORMAT.md lines=95:109
@source of-step title="OUTLINE-FORMAT.md · step 한 줄 규칙" path=design/garden-skills/web-video-presentation/references/OUTLINE-FORMAT.md lines=111:124
@source of-split title="OUTLINE-FORMAT.md · 장 나누기 경험칙" path=design/garden-skills/web-video-presentation/references/OUTLINE-FORMAT.md lines=151:159
@source of-check title="OUTLINE-FORMAT.md · 소재 목록과 자체 검사" path=design/garden-skills/web-video-presentation/references/OUTLINE-FORMAT.md lines=163:203
@source ss-base title="design/garden-skills/web-video-presentation/references/SCRIPT-STYLE.md · 17950B · 세 가지 하한선" path=design/garden-skills/web-video-presentation/references/SCRIPT-STYLE.md lines=6:20
@source ss-keep title="SCRIPT-STYLE.md · 정보 보존 60%" path=design/garden-skills/web-video-presentation/references/SCRIPT-STYLE.md lines=24:49
@source ss-short title="SCRIPT-STYLE.md · 한 문장 20자" path=design/garden-skills/web-video-presentation/references/SCRIPT-STYLE.md lines=71:80
@source ss-hook title="SCRIPT-STYLE.md · 도입 훅" path=design/garden-skills/web-video-presentation/references/SCRIPT-STYLE.md lines=93:110
@source ss-sep title="SCRIPT-STYLE.md · --- 로 박자 나누기" path=design/garden-skills/web-video-presentation/references/SCRIPT-STYLE.md lines=112:129
@source ss-ai title="SCRIPT-STYLE.md · AI 티 다섯 유형" path=design/garden-skills/web-video-presentation/references/SCRIPT-STYLE.md lines=189:194
@source ss-plat title="SCRIPT-STYLE.md · 플랫폼 변형" path=design/garden-skills/web-video-presentation/references/SCRIPT-STYLE.md lines=297:311
@source ss-check title="SCRIPT-STYLE.md · 3층 자체 검사" path=design/garden-skills/web-video-presentation/references/SCRIPT-STYLE.md lines=337:390
@source ss-same title="SCRIPT-STYLE.md · 같은 작업에서 outline까지" path=design/garden-skills/web-video-presentation/references/SCRIPT-STYLE.md lines=392:403
@source au-truth title="design/garden-skills/web-video-presentation/references/AUDIO.md · 11126B · 진실 원천과 provider" path=design/garden-skills/web-video-presentation/references/AUDIO.md lines=7:24
@source au-extract title="AUDIO.md · segments 추출과 확인" path=design/garden-skills/web-video-presentation/references/AUDIO.md lines=50:71
@source au-mmx title="AUDIO.md · minimax 합성" path=design/garden-skills/web-video-presentation/references/AUDIO.md lines=84:105
@source au-oai title="AUDIO.md · openai 합성" path=design/garden-skills/web-video-presentation/references/AUDIO.md lines=107:126
@source au-fall title="AUDIO.md · provider가 없을 때" path=design/garden-skills/web-video-presentation/references/AUDIO.md lines=154:184
@source au-len title="AUDIO.md · 길이 확인" path=design/garden-skills/web-video-presentation/references/AUDIO.md lines=188:201
@source au-run title="AUDIO.md · 런타임 모드와 자동 진행" path=design/garden-skills/web-video-presentation/references/AUDIO.md lines=205:224
@source au-5000 title="AUDIO.md · mmx 길이 상한" path=design/garden-skills/web-video-presentation/references/AUDIO.md lines=249:249
@source rc-auto title="design/garden-skills/web-video-presentation/references/RECORDING.md · 2988B · Auto 녹화" path=design/garden-skills/web-video-presentation/references/RECORDING.md lines=10:34
@source rc-modes title="RECORDING.md · 모드 표" path=design/garden-skills/web-video-presentation/references/RECORDING.md lines=44:53
@source th-one title="design/garden-skills/web-video-presentation/references/THEMES.md · 23359B · 한 테마와 token 두 층" path=design/garden-skills/web-video-presentation/references/THEMES.md lines=3:17
@source th-list title="THEMES.md · 내장 테마 23개" path=design/garden-skills/web-video-presentation/references/THEMES.md lines=40:77
@source th-rule title="THEMES.md · 새 테마 규칙" path=design/garden-skills/web-video-presentation/references/THEMES.md lines=258:270
@source th-meta title="THEMES.md · theme.json 필드" path=design/garden-skills/web-video-presentation/references/THEMES.md lines=294:309
@source ex-not title="design/garden-skills/web-video-presentation/references/EXAMPLES/README.md · 5155B · 베끼는 틀이 아님" path=design/garden-skills/web-video-presentation/references/EXAMPLES/README.md lines=3:17
@source ct-old title="design/garden-skills/web-video-presentation/references/EXAMPLES/case-tech-review/README.md · 2917B · 옛 판 경고" path=design/garden-skills/web-video-presentation/references/EXAMPLES/case-tech-review/README.md lines=6:22
@source rd-flow title="design/garden-skills/web-video-presentation/README.md · 17939B · 옛 작업 흐름" path=design/garden-skills/web-video-presentation/README.md lines=37:61
@source rd-ships title="README.md · 파일 구성(PRINCIPLES.md)" path=design/garden-skills/web-video-presentation/README.md lines=67:78
@source rd-map title="README.md · 참조 지도" path=design/garden-skills/web-video-presentation/README.md lines=312:321
@source sc-def title="design/garden-skills/web-video-presentation/scripts/scaffold.sh · 9537B · 기본 테마" path=design/garden-skills/web-video-presentation/scripts/scaffold.sh lines=23:26
@source sc-guard title="scaffold.sh · 대상 폴더와 npm 확인" path=design/garden-skills/web-video-presentation/scripts/scaffold.sh lines=81:100
@source sc-tsc title="scaffold.sh · typecheck" path=design/garden-skills/web-video-presentation/scripts/scaffold.sh lines=180:187
@source sc-msg title="scaffold.sh · 완료 안내(포트, Part 목차)" path=design/garden-skills/web-video-presentation/scripts/scaffold.sh lines=189:233
@source vite title="design/garden-skills/web-video-presentation/templates/vite.config.ts · 196B · 포트" path=design/garden-skills/web-video-presentation/templates/vite.config.ts lines=6:9
@source app-est title="design/garden-skills/web-video-presentation/templates/src/App.tsx · 2487B · 길이 추정과 오디오 경로" path=design/garden-skills/web-video-presentation/templates/src/App.tsx lines=22:52
@source st-key title="design/garden-skills/web-video-presentation/templates/src/hooks/useStepper.ts · 5192B · STORAGE_KEY" path=design/garden-skills/web-video-presentation/templates/src/hooks/useStepper.ts lines=4:8
@source st-next title="useStepper.ts · narrations.length로 진행" path=design/garden-skills/web-video-presentation/templates/src/hooks/useStepper.ts lines=89:109
@source st-kbd title="useStepper.ts · 키보드 처리" path=design/garden-skills/web-video-presentation/templates/src/hooks/useStepper.ts lines=139:160
@source am-kbd title="design/garden-skills/web-video-presentation/templates/src/hooks/useAutoMode.ts · 2473B · M과 Space" path=design/garden-skills/web-video-presentation/templates/src/hooks/useAutoMode.ts lines=49:63
@source ap-auto title="design/garden-skills/web-video-presentation/templates/src/hooks/useAudioPlayer.ts · 3768B · 자동 진행" path=design/garden-skills/web-video-presentation/templates/src/hooks/useAudioPlayer.ts lines=25:40
@source stage title="design/garden-skills/web-video-presentation/templates/src/components/Stage.tsx · 1507B · 클릭 진행 예외" path=design/garden-skills/web-video-presentation/templates/src/components/Stage.tsx lines=34:41
@source pb-gh title="design/garden-skills/web-video-presentation/templates/src/components/ProgressBar.tsx · 3837B · 기본 GitHub 링크" path=design/garden-skills/web-video-presentation/templates/src/components/ProgressBar.tsx lines=16:35
@source exm title="design/garden-skills/web-video-presentation/templates/src/chapters/01-example/Example.tsx · 3878B · masthead" path=design/garden-skills/web-video-presentation/templates/src/chapters/01-example/Example.tsx lines=12:23
@source ext title="design/garden-skills/web-video-presentation/templates/scripts/extract-narrations.ts · 4717B · 빈 문자열 건너뜀" path=design/garden-skills/web-video-presentation/templates/scripts/extract-narrations.ts lines=98:122
@source syn title="design/garden-skills/web-video-presentation/templates/scripts/synthesize-audio.sh · 5119B · 직렬 합성과 건너뜀" path=design/garden-skills/web-video-presentation/templates/scripts/synthesize-audio.sh lines=111:145
@source ms-route title="design/garden-skills/motion-showreel/SKILL.md · r30 확인용" path=design/garden-skills/motion-showreel/SKILL.md lines=29:29
@source ms-desc title="design/garden-skills/motion-showreel/SKILL.md · r50 확인용 description" path=design/garden-skills/motion-showreel/SKILL.md lines=3:3
@source wde-scope title="design/garden-skills/web-design-engineer/SKILL.md · r33 확인용" path=design/garden-skills/web-design-engineer/SKILL.md lines=18:18

## 언제 켜지고, 무엇을 넘겨받나 {#trigger}

@code source=sk-fm language=yaml

`description`은 중국어 원본이다. 호출 제한 필드는 없어서, 모델이 이 설명을 참고해 켤 수 있다.[](source:sk-fm) 판정: `description`은 판단용 설명이다. 특정 단어가 있다고 켜지는 목록으로 읽으면 안 된다.

원문이 드는 적용 장면은 다음과 같다.[](source:sk-scope)

- "구어 원고나 글이 있는데 영상으로 만들어 달라"는 구어 주도 콘텐츠
- PPT 같지 않은 "움직이는 PPT"
- 16:9 가로 녹화용, 큰 글자와 여백, 화면마다 움직임
- 교육, 제품 시연, keynote에 영화 같은 느낌을 원할 때
- Bilibili, YouTube, Douyin 영상 콘텐츠

결과물은 Vite + React + TS 프로젝트와 장별로 나뉜 음성 파일이다.[](source:sk-scope) 에이전트가 받는 입력에 따라 첫 행동이 다르다.[](source:sk-input)

| 사용자가 준 것 | 에이전트가 하는 일 |
| --- | --- |
| 원래 글(서면체, 공식 계정 글, 논문, 블로그) | `script.md`와 `outline.md`를 한 번에 만들고 `Checkpoint Plan`으로 간다 |
| 바로 쓸 구어 원고나 영상 대본 | 그대로 `script.md`에 저장하고, 줄인 1.2 절차로 `outline.md`만 만든다 |
| 아무것도 없이 "X 주제 영상 만들어 줘" | {bad:되묻는다} 소재나 개요를 먼저 달라고 한다. 스킬이 내용을 대신 구상하지 않는다 |

`article.md`는 사용자가 원래 글을 줬을 때 반드시 남기고 지우지 않는다. 개발 단계에서 화면 정보를 가져오는 출처이기 때문이다.[](source:sk-dir)[](source:sk-12)

## 어떤 순서로 일하고, 사람은 어디서 멈추나 {#flow}

@workflow id=wvp-flow title="web-video-presentation 작업 순서"
| lane content | 내용 작성 |
| lane build | 웹 개발 |
| lane audio | 음성 |
| lane rec | 녹화 |
| w-in | 1.1 입력 확인 | backend | content |
| w-has | 소재가 있나? | backend | content |
| w-ask | 소재 요청 | external | content |
| w-plan | 1.2 script·outline | backend | content |
| w-self | 자체 검사·수정 | backend | content |
| w-cpp | Checkpoint Plan | external | content |
| w-scaf | 2.1 골격 생성 | backend | build |
| w-ch1 | 2.2 1장 완성본 | backend | build |
| w-acc1 | 1장 검수 | external | build |
| w-rest | 2.3 2~N장 | backend | build |
| w-cpa | Checkpoint Audio | external | audio |
| w-tts | 3 음성 합성 | backend | audio |
| w-rec | 4 녹화·후반 | backend | rec |
| w-in > w-has | |
| w-has > w-ask | 아니오 |
| w-ask > w-in | 소재 |
| w-has > w-plan | 예 |
| w-plan > w-self | |
| w-self > w-cpp | |
| w-cpp > w-scaf | 5가지 확정 | emphasis |
| w-scaf > w-ch1 | |
| w-ch1 > w-acc1 | |
| w-acc1 > w-rest | 계속 | emphasis |
| w-rest > w-cpa | |
| w-cpa > w-tts | 합성 |
| w-cpa > w-rec | 안 함 |
| w-tts > w-rec | |

@steps id=wvp-steps
| w-in | 1.1 입력 확인 | 사용자가 준 것이 원래 글인지, 구어 원고인지, 아무것도 없는지 가른다.[](source:sk-input) | wvp-flow | w-in |
| w-has | 소재가 있나? | 주제만 있으면 아니오다.[](source:sk-input) | wvp-flow | w-has |
| w-ask | 소재 요청 | 소재나 개요를 먼저 달라고 되묻는다.[](source:sk-input) | wvp-flow | w-ask |
| w-plan | 1.2 script·outline | 한 번의 생각 안에서 두 파일을 만든다. `script.md`는 `SCRIPT-STYLE.md`대로 원래 글의 언어를 유지한 구어 원고다. `outline.md`는 `OUTLINE-FORMAT.md`대로 장과 step을 나누고, 장마다 첫머리에 정보 풀(信息池)을 뽑는다. `OUTLINE-FORMAT.md`는 outline을 쓰기 전에 `CHAPTER-CRAFT.md` 전체를 읽으라고 한다.[](source:sk-12)[](source:ss-same)[](source:of-cc) | wvp-flow | w-plan |
| w-self | 자체 검사·수정 | `script.md`는 3층 검사, `outline.md`는 형식 검사를 한다. 독립 리뷰어 에이전트(Agent Teams), 서브에이전트, 직접 검사 순으로 더 격리된 방법을 먼저 쓴다. 실패 항목을 고친 뒤에 다음으로 간다.[](source:sk-self)[](source:sk-bound) | wvp-flow | w-self |
| w-cpp | Checkpoint Plan | 반드시 멈춘다. 사용자가 원고, outline, 테마, 소재, 개발 모드 5가지를 한 자리에서 확인한다. 아래 표에 자세히 있다.[](source:sk-cpp) | wvp-flow | w-cpp |
| w-scaf | 2.1 골격 생성 | `scripts/scaffold.sh ./presentation --theme=<id>`로 골격을 만든다. 첫 장을 쓰기 전에 예제 장 `01-example`을 지우고 `chapters.ts`의 `EXAMPLE_CHAPTER` 등록도 뺀다.[](source:sk-scaf) | wvp-flow | w-scaf |
| w-ch1 | 2.2 1장 완성본 | 어느 모드든 1장은 메인 스레드에서 완성본으로 만든다. 리듬, 시각, 실제 소재가 다 갖춰져야 하고 "뼈대 판"은 없다. 이 장이 이번 프로젝트의 코드 스타일 기준이 된다.[](source:sk-ch1) | wvp-flow | w-ch1 |
| w-acc1 | 1장 검수 | 건너뛸 수 없는 사람 확인 지점이다. 에이전트는 다섯 가지를 확인해 달라고 한다. 시각 분위기, 리듬, 내용이 이끄는 애니메이션, 두 출처 원칙, AI 티(보라·분홍 그라디언트, 둥근 색 테두리, 가짜 그림, emoji)다. 그리고 사용자가 "계속"이라고 할 때까지 기다린다.[](source:sk-ch1) | wvp-flow | w-acc1 |
| w-rest | 2.3 2~N장 | 고른 모드(A·B·C)대로 만든다. 장마다 `CHAPTER-CRAFT.md`를 따르고 완료 자체 검사를 거친다. 사용자는 중간에 언제든 모드를 바꿀 수 있다.[](source:sk-modes)[](source:sk-sub) | wvp-flow | w-rest |
| w-cpa | Checkpoint Audio | 반드시 멈추고 음성을 합성할지 묻는다. 합성하면 각 step의 mp3를 만들어 `?auto=1`로 한 번에 녹화할 수 있다. 안 하면 수동 녹화 후 후반 더빙으로 간다.[](source:sk-cpa) | wvp-flow | w-cpa |
| w-tts | 3 음성 합성 | `npm run extract-narrations`로 `audio-segments.json`을 만들고, 사용자가 문구를 훑어본 뒤 합성한다. 끝나면 위치, 총 개수, 길이가 이상한 항목을 알린다. 너무 길면 step을 나누고, 너무 짧으면 문구가 얇다는 뜻이다.[](source:sk-p3)[](source:au-extract) | wvp-flow | w-tts |
| w-rec | 4 녹화·후반 | 음성을 합성했으면 Auto 모드로 한 번에 녹화하고 머리와 꼬리만 자른다. 안 했으면 수동으로 클릭하며 녹화하고 따로 더빙한다. 에이전트가 맞는 녹화 경로를 먼저 알려 준다.[](source:sk-p4)[](source:rc-auto) | wvp-flow | w-rec |

`Checkpoint Plan`에서 맞추는 5가지는 다음과 같다. 원문 표현은 "一次对齐 5 件事"(5가지를 한 번에 맞춘다)다.[](source:sk-cpp-tpl)

| # | 맞출 것 | 에이전트가 미리 하는 일 | 사용자의 몫 |
| --- | --- | --- | --- |
| 1 | 원고 `script.md` | 글자 수와 예상 분량을 보고한다 | 파일을 직접 고치거나 방향을 말한다 |
| 2 | 개발 계획 `outline.md` | 장 나누기, step 수, 예상 시간(장마다 30~60초가 기준), 화면 내용, 정보 풀, 소재 목록을 보여 준다 | 고칠 곳을 말한다 |
| 3 | 테마 | `themes/*/theme.json`을 모두 읽는다. 목록을 하드코딩하지 않는다. `bestFor`가 맞는 2~3개를 ★로 추천하고 나머지도 한 줄씩 보인다 | {caution:테마를 분명히 고른다} |
| 4 | 소재 | outline 끝의 소재 목록을 훑어 필요한 그림을 대략 적는다 | 기존 소재에서 고르기 / 직접 제공 / 전부 자리표시 중 하나 |
| 5 | 개발 모드 | A·B·C를 설명한다 | 모드를 고른다 |

준비 작업과 요약 틀은 `SKILL.md`에 있다.[](source:sk-cpp)[](source:sk-cpp-tpl) 피드백을 받은 뒤의 규칙도 정해져 있다.[](source:sk-cpp-fb)

- 테마가 분명해야 Phase 2로 간다.
- 사용자가 "테마는 네가 골라"라고 하면, 에이전트는 추천 1순위를 고른다. 무엇을 왜 골랐는지 말하고 바꿀 기회를 준다.
- 원고나 outline을 고치라고 하면 파일을 직접 고친다.

개발 모드는 2장부터 다르다. 1장은 모든 모드에서 메인 스레드 완성본과 사용자 검수가 의무다.[](source:sk-cpp-tpl)[](source:sk-modes)

| 모드 | 2~N장 진행 | 검수 | 원문의 평가 |
| --- | --- | --- | --- |
| A 장마다 확인 | 한 장 끝날 때마다 멈춘다 | 장마다 | 위험이 가장 낮고 리듬이 가장 안정적이다. 사용자가 모드를 고르지 않으면 이 모드다 {good:기본값} |
| B 1장 후 순차 | 메인 스레드가 차례로 만든다 | 끝에 한 번 | 속도 중간. 병렬을 못 하는 에이전트에 맞다 |
| C 1장 후 병렬 | 서브에이전트가 동시에 만든다. 한 번에 몇 장인지는 사용자가 정한다 | 원문에 명시 없음 | 가장 빠르다. 장마다 스타일 차이가 생기며 원문은 이를 예상된 결과로 본다 {caution:스타일 차이} |

모드 C의 서브에이전트 지시문에는 다섯 가지가 꼭 들어간다. 해당 장의 outline 단락(정보 풀 포함), `CHAPTER-CRAFT.md` 경로, 테마의 `descriptionZh`·`mood`·`bestFor`, 코드 스타일 참고용 1장 코드, 금지선이다. 금지선은 장마다 다른 CSS 접두사, `chapters.ts` 수정 금지, 완료 시 `npx tsc --noEmit` 실행이다.[](source:sk-sub)

## outline은 어디까지 계획하나 {#outline}

원문은 outline을 "개발 계획이지 시각 계획이 아니다"라고 정한다. 애니메이션을 미리 정해 두면 장을 만드는 에이전트가 번역기로 전락한다는 이유다. 비워 둬야 각 step을 만들 때 내용에 맞춰 설계할 수 있다고 본다.[](source:sk-bound)[](source:of-box)

| outline에 반드시 쓴다 | outline에 쓰지 않는다 |
| --- | --- |
| 장 나누기, 장별 step 수, 예상 시간 | 구체 애니메이션 종류(blur clear, wipe, 스프링) {bad:쓰지 않음} |
| step마다 화면 내용(hero, 데이터, 표어, 목록 항목) | CSS 구현 수단(filter, SVG, clip-path) |
| 장 단위 정보 풀: 글에서 뽑은 숫자, 인용, 사례, 태그 | 시간 수치(`~2.5s`, `80~120ms` 같은 값) |
| step 관계 이름 접두사("대비", "점층 목록", "금언" 등 선택 힌트) | 지속 미세 움직임, 시차량 같은 미세 리듬 |

`(~Ts)` 형태의 구어 예상 시간만 예외로 쓴다. 이 값은 소리와 화면을 맞추는 데 쓴다.[](source:of-dur) outline의 step 수는 첫 예상이다. 최종 step 수는 장을 만들 때의 `narrations.ts`가 정하고, 다르면 outline을 맞춰 고친다.[](source:of-box)

outline을 다 쓰면 자체 검사를 반드시 한다. 검사 없이 `Checkpoint Plan`으로 가는 것은 금지다.[](source:of-check)

- [ ] step마다 화면 내용 한 줄이고, "애니메이션" 줄이나 "수단" 줄이 없다
- [ ] `(~Ts)` 말고는 밀리초·초 값을 쓴 step이 없다
- [ ] 장마다 정보 풀이 있고, 글에서 뽑은 항목이 3개 이상이며, 항목마다 `—— 来源 article §X / Lxx` 같은 출처가 붙어 있다
- [ ] 모든 step의 `(~Ts)` 합이 머리에 적은 총 길이와 10% 안으로 맞는다
- [ ] 장마다 3~8 step, 30~60초, 한 가지 주제다
- [ ] 끝의 소재 목록이 장별로 ✓ / ⚠️ 표시와 함께 있다
- [ ] 원고에 제목이나 번호처럼 말로 읽지 않는 내용이 없다

## 무엇을 강제하고 금지하나 {#rules}

**자체 검사 규약**은 원고, outline, 각 장 완성에 모두 걸린다. 에이전트는 검사 결과를 받으면 실패 항목을 먼저 고친다. 그다음 "완료 + 검사 결론 + 고친 것"을 보고한다. 고치지 않고 결과만 보고하면 원문은 위반으로 본다.[](source:sk-self)

원고(`script.md`)의 규칙은 다음과 같다.

- 하한선 세 가지 중 하나라도 어기면 원고 전체를 다시 쓴다. 정보 보존 60% 이상, AI 티 제거, 원래 언어 유지다. 영어 글이면 영어 원고를 쓰고, 번역은 사용자가 요청할 때만 한다.[](source:ss-base)
- 정보 보존은 `len(script.md) ÷ len(article.md) ≥ 0.6`으로 잰다. 숫자, 사례, 논증의 중간 단계, 반대 의견·한계는 줄이지 않는다. 글이 너무 길면 30%로 줄이고 끝난 척하지 않는다. "60%를 지키려면 약 Y분이 필요하다"고 사용자에게 알린다.[](source:ss-keep)
- 생각 하나가 끝날 때마다 `---`로 나눈다. `---` 사이가 outline의 step 하나가 된다.[](source:ss-sep)
- AI 티 다섯 유형을 다 쓴 뒤 따로 훑어 지운다. 가짜 공감, 가짜 깊이, 자기 과시, 만능 상투구, 반복 나열이다.[](source:ss-ai)
- 마지막 검사는 실제로 소리 내어 읽는 것이다. 세 단락을 골라 소리 내 읽고, 자연스러워질 때까지 고친다.[](source:ss-check)

장(章) 구현의 규칙은 다음과 같다.

- 장마다 CSS·SVG·Canvas·JS로 그린 시각 시연이 1~2곳 이상 있어야 한다. 글자만 있는 장은 검수 불합격이다.[](source:cc-ppt)
- 화자가 "첫째 X, 둘째 Y"처럼 하나씩 말하는 목록은 1항목 = 1 step으로 드러낸다. 한 step에 stagger로 모두 올리는 것은 금지다. 앞 항목은 회색으로 남겨 맥락으로 쓴다.[](source:cc-reveal)
- 두 출처 원칙: 리듬과 순서는 `script.md`를 따르고, 화면의 숫자·인용·사례는 `article.md`의 해당 단락에서 가져온다. 화면 정보가 구어보다 많아야 한다.[](source:cc-dual)
- 색과 글꼴 패밀리는 테마 token만 쓴다. hex·rgb·색 이름, 글꼴 이름 하드코딩은 금지다. 글자 크기, 간격, 애니메이션 시간은 장에서 자유롭게 정한다.[](source:cc-token)
- `setTimeout`·`setInterval`로 애니메이션을 움직이지 않고 CSS keyframes를 쓴다. 장 안의 버튼 같은 조작 요소에는 `data-no-advance`를 붙인다. 장끼리 import하지 않는다.[](source:cc-eng)
- 장마다 `narrations.ts`가 있어야 한다. 배열 길이는 장 코드의 `if (step === N)` 최댓값 N + 1과 같아야 한다. 문구는 `script.md`와 뜻이 같아야 하고, 소리 없는 step은 `""`로 둔다.[](source:cc-eng)[](source:sk-truth)
- 각 step의 애니메이션은 그 step의 구어 길이보다 짧아야 한다. 길면 구어를 늘리거나, step을 나누거나, 애니메이션을 빠르게 한다.[](source:cc-eng)
- 머리글·바닥글·쪽 번호·브랜드 띠 같은 chrome은 금지다. 보라·분홍 그라디언트, 둥근 카드 + 색 테두리, emoji 아이콘, 가짜 데이터·로고도 금지다. 없는 소재는 "image · 16:9" 같은 자리표시로 인정한다.[](source:cc-ai)[](source:sk-ten)
- `chapters.ts`를 바꾸거나 `narrations.ts` 길이가 바뀌면 `useStepper.ts`의 `STORAGE_KEY`를 올린다(예: `v4` → `v5`).[](source:sk-25)
- 피드백을 받으면 리듬·시각·내용·코드 중 어느 층인지 먼저 정하고, 가장 작은 조각만 고친다. 장 전체를 다시 만들지 않는다.[](source:sk-fbk)
- 테마는 발표 전체에 하나만 쓴다. 장 사이에 밝기를 뒤집지 않는다.[](source:th-one)

수치는 의무·권고·예시를 구분해 읽는다.

| 값 | 성격 | 적용 조건 |
| --- | --- | --- |
| 무대 1920×1080, 반응형 없음 | 원칙(틀이 이미 구현) | 모든 장[](source:sk-ten)[](source:cc-frame) |
| hero 글자 80px 이상, 무대 사방 안전 영역 80px 이상 | 의무("至少") | 장 구현[](source:cc-look)[](source:cc-frame) |
| 장마다 시각 시연 1~2곳 이상 | 의무. 없으면 다시 만든다 | 장 구현[](source:cc-ppt)[](source:cc-check) |
| 정보 보존 60% 이상 | 최상위 의무. 어기면 원고를 다시 쓴다 | `script.md`[](source:ss-keep) |
| 한 문장 20자 이하, 3초 안에 훅 | Bilibili 기본값. 플랫폼마다 다르다(Douyin 12자·1초, YouTube 30자·30초 도입 허용 등) | `script.md`[](source:ss-short)[](source:ss-hook)[](source:ss-plat) |
| 중국어 초당 4자, 분당 약 250자 | 예상 시간 계산 기준 | outline과 길이 추정[](source:of-meta)[](source:of-step) |
| step 예상 3~10초 | 범위 규칙 | outline[](source:of-step) |
| 장마다 3~8 step, 30~60초. 장 수 ≈ 총 길이 ÷ 30초 | 경험칙. 느린 테마는 2~3 step, 정보 밀집형은 8~10 step까지 | outline[](source:of-split) |
| 정보 풀 3개 이상, step 합과 총 길이 오차 10% 미만 | 자체 검사 의무 | outline[](source:of-check) |
| 오디오 끝 + 200ms 뒤 자동 진행 | 구현된 동작 | Auto 모드[](source:au-run)[](source:app-est) |
| 오디오가 없으면 `max(1500ms, 글자 수 × 250ms)` | 대체 추정 | Auto 모드[](source:au-run)[](source:app-est) |
| 15초 이상인 음성 | 주의 대상. 원고를 고칠지 step을 나눌지 사용자가 정한다 | 합성 후[](source:au-len) |
| mmx 한 항목 약 5000자 상한 | provider 한계 | 합성[](source:au-5000) |
| 글자 대비 4.5:1 이상(96px 이상 제목은 3:1) | 새 테마 규칙 | 테마 만들기[](source:th-rule) |

## 흐름 속 위치 {#position}

@workflow id=wvp-position title="web-video-presentation 앞뒤"
| pos-ms | motion-showreel | backend |
| pos-wde | web-design-engineer | backend |
| pos-wvp | web-video-presentation | backend |
| pos-user | 녹화한 영상 | external |
| pos-ms > pos-wvp | 클릭형 발표면 |
| pos-wde > pos-wvp | 원고 영상이면 | dashed |
| pos-wvp > pos-user | 프로젝트·mp3 | emphasis |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `motion-showreel`(앞) | 사용자 요청 | - | `motion-showreel`의 적용 판단 표가 클릭으로 넘기는 발표, 현장 발표, 대화형 웹 데모, 글 → 구어 원고 작업이면 이 스킬을 쓰라고 한다(명시-이름)[](source:ms-route) | r30 |
| `web-design-engineer`(앞) | 사용자 요청 | - | `web-design-engineer`가 "원고 박자 → 녹화용 웹 영상 발표"를 비적용으로 두고 전용 스킬이 있으면 넘기라고 한다. 이름은 부르지 않는다(명시-역할)[](source:wde-scope) | r33 |
| `motion-showreel` | - | - | 같은 계열(추론). 둘 다 코드로 "영상"을 만든다. `motion-showreel`은 렌더한 MP4, 이 스킬은 클릭으로 넘기는 웹 발표다[](source:ms-desc)[](source:sk-fm) | r50 |
| (뒤) | - | `presentation/` 프로젝트, `public/audio/<id>/<N>.mp3`, `audio-segments.json` | 뒤에 오는 스킬은 없다. 이 스킬의 원문은 다른 스킬 이름을 부르지 않는다. 녹화와 후반 작업은 사람이 한다[](source:sk-dir)[](source:sk-p4) | - |

그림에서 r33은 이름 없이 역할로 가리키는 넘김이라 점선으로 그렸다. r50은 같은 계열이라 표에만 남겼다. 전체 흐름은 `design/_group-garden-visual/garden-visual.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 확인하지 못한 것 {#audit}

- 읽은 파일: 원본 텍스트 94개(합계 337,456B) 중 41개(206,600B)는 끝까지 읽었다. 53개(130,856B)는 구조·표본만 확인했다(전부 읽지 않음). 테마 파일 45개, 템플릿 CSS 5개, 예제 장 CSS 2개, `tts-providers/README.md`다. 목록은 `skill-explainers/design/garden-skills/web-video-presentation/files.md`에 있다.
- 제외한 파일: 번역본 15개(합계 204,042B). `*.ko.md` 14개와 `README.zh-CN.md` 1개다. `SKILL.md`는 중국어 본문이고 그것이 원본이다. 바이너리는 이 폴더에 없다.
- 실행하지 않았다. `scaffold.sh`(`npm create vite@latest`, `npm install`을 부른다), `synthesize-audio.sh`, TTS provider는 읽기만 했다. 페이지의 동작은 지시상 동작이다.[](source:sc-guard)
- 원문 비교: 다른 컬렉션에 같은 이름의 스킬은 없다(원장).
- 분석 중 바뀐 파일: 없음. `design/`은 commit `4e3fc89` 그대로다.
- 원문 대조 범위: 사람 확인 지점 3개와 보조 확인 2개(`audio-segments.json` 훑어보기, 합성 후 길이 보고), 5가지 맞추기 항목, 개발 모드 3개, outline 경계 8칸, outline 자체 검사 7항목, 수치 13행, 관계 행 r30·r33·r50을 원문과 대조했다.

코드를 읽어 문서와 대조한 결과다. 실행은 하지 않았다.

| 문서 설명 | 코드 | 판정 |
| --- | --- | --- |
| `narrations.ts`가 step 수의 유일한 원천 | 커서 이동과 진행 바가 모두 `narrations.length`를 쓴다[](source:app-est)[](source:st-next) | 일치 |
| 빈 narration은 합성을 건너뛰고 1부터 번호 | `extract-narrations.ts`가 빈 문자열을 세고 건너뛰며 `step = i + 1`로 적는다[](source:ext) | 일치 |
| 합성은 직렬, 있는 파일은 건너뜀, 실패해도 계속 | 같다. 실패가 하나라도 있으면 종료 코드 2다[](source:syn) | 일치 |
| 오디오 끝 + 200ms, 없으면 글자 수 추정 | 같다. 오디오가 없거나 실패해도 추정값으로 진행한다[](source:ap-auto)[](source:app-est) | 일치 |
| 버튼·링크·`data-no-advance`는 클릭해도 진행 안 함 | `Stage.tsx`가 `button, a, input, [data-no-advance]`를 걸러 낸다[](source:stage) | 일치 |
| dev server `localhost:5173` | `vite.config.ts`와 `scaffold.sh` 안내는 5174다[](source:sk-ch1)[](source:vite)[](source:sc-msg) | 어긋남 |
| Auto 모드에서 Space를 한 번 누르면 step 0부터 시작 | `useAutoMode`(Auto 시작)와 `useStepper`(다음 step) 둘 다 `window`에서 Space를 받는다. 시작하면서 한 step 넘어갈 수 있다고 읽힌다. 실행해 확인하지 않았다[](source:rc-auto)[](source:am-kbd)[](source:st-kbd) | 미확인 |
| 머리글·바닥글 금지, chrome 없음 | 예제 장은 `<header className="masthead">`를 쓴다. 진행 바는 기본값으로 garden-skills GitHub 링크를 함께 띄운다(hover 때만)[](source:exm)[](source:pb-gh)[](source:cc-ai) | 어긋남 |

원문끼리 어긋나는 곳이다. 원문이 우선순위를 밝히지 않아 그대로 보여 준다. 판정: 작업 흐름은 `SKILL.md`가 가장 새로 고친 판으로 보인다. `SCRIPT-STYLE.md`가 옛 흐름은 사람 확인 지점이 둘이었다가 하나로 합쳐졌다고 적기 때문이다.[](source:ss-same)

| # | 어긋나는 곳 | 근거 |
| --- | --- | --- |
| 1 | `description`은 애니메이션을 "PRINCIPLES + ANTI-AI 법칙"으로 정한다고 하고, README는 `references/PRINCIPLES.md`와 `PATTERNS.md`를 목록에 올린다. 두 파일 모두 이 폴더에 없다 | [](source:sk-fm)[](source:rd-ships)[](source:rd-map) |
| 2 | `SKILL.md`, `scaffold.sh` 안내, `EXAMPLES/README.md`는 `CHAPTER-CRAFT.md`의 "Part 0 열 가지 원칙 / Part 1 시작 5문 / Part 2 결정 트리 … Part 8"과 "Part 0 원칙 7"을 가리킨다. 지금 `CHAPTER-CRAFT.md`에는 Part 구분도, 결정 트리도, 시작 5문도 없다 | [](source:sk-read)[](source:sk-bound)[](source:sc-msg)[](source:ex-not) |
| 3 | README의 작업 흐름은 Checkpoint A1(원고·테마), A2(outline·모드), B(음성) 세 단계다. `SKILL.md`는 원고·outline·테마·소재·모드를 `Checkpoint Plan` 하나로 합치고, 1장 검수를 따로 둔다 | [](source:rd-flow)[](source:sk-flow) |
| 4 | Auto 모드 진입: `AUDIO.md`는 "`?auto=1` 또는 `M` 두 번", `RECORDING.md`는 "`?audio=1` + `M` 한 번 더"라고 쓴다. 코드는 `M`이 manual → audio → auto 순으로 돈다. 출발 모드에 따라 둘 다 맞다 | [](source:au-run)[](source:rc-modes)[](source:am-kbd) |
| 5 | 테크 리뷰 사례 outline에는 애니메이션 줄과 시간 값이 있다. 사례 README가 이를 옛 판이라 밝히고, 배울 것과 배우지 말 것을 나눈다 | [](source:ct-old)[](source:of-step) |

@callout level=open-question title="확인하지 못한 것"
결과물이 실제로 "PPT 같지 않은 영상"으로 보이는지는 실행해 보지 않아 판단하지 않았다. `PRINCIPLES.md`, 결정 트리, "시작 5문"은 여러 문서가 가리키지만 저장소에 없어 내용을 확인할 수 없다. 모드 C에서 병렬로 만든 2~N장을 언제 누가 검수하는지는 `원문에 명시 없음`이다.[](source:sk-modes)
