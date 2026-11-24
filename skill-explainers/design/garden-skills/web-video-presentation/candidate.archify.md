# web-video-presentation — 글·대본을 클릭 진행형 16:9 웹 프레젠테이션으로 만든다 {#overview}

에이전트는 원고나 구술 대본을 한 걸음씩 전체 화면을 채우는 16:9 웹 프레젠테이션과 단계별 음성으로 만들어, 브라우저 전체 화면에서 한 번에 영상으로 녹화하게 한다.[](source:fm)[](source:wf-top)

- 글·원고·구술 대본·제품 시연·강의를 움직이는 16:9 웹 발표나 녹화용 영상으로 바꿀 때 켜지며, 사용자가 준 입력(원문·직접 대본·주제만)에 따라 처리 갈래가 나뉜다.[](source:fm)[](source:p11)
- 결과로 작업 폴더 안에 `script.md`(원문 언어를 유지한 구술 대본), `outline.md`(개발 계획과 장별 정보 풀), `presentation/`(Vite·React·TypeScript 웹 프로젝트)이 남고, 음성을 합성하면 `audio-segments.json`과 `public/audio/` 아래 `.mp3` 파일이 추가된다.[](source:workdir)
- `motion-showreel`과 `web-design-engineer`가 클릭 진행 발표·아티클-대본 변환·녹화용 웹 프레젠테이션 요청을 이 스킬 쪽으로 보내는 `대안` 관계가 확인된다.[](source:ms-route)[](source:wde-route)
- 소재 없이 주제만 있을 때 글 내용을 대신 지어내지 않고, `outline.md`에 구체적인 애니메이션 기법·CSS 구현·밀리초 수치를 미리 적지 않으며, 순수 글만 나열한 장과 `chrome`(머리글·바닥글·쪽 번호 같은 장식 틀) 및 명암 반전을 금지한다.[](source:p11)[](source:outline-bound)[](source:craft-rules)[](source:themes-intro)

@answer scope="design/garden-skills/web-video-presentation · 원본 파일 95개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: name·description" path=design/garden-skills/web-video-presentation/SKILL.md lines=1:4
@source wf-top title="4단계 공정과 확인 지점 개요" path=design/garden-skills/web-video-presentation/SKILL.md lines=25:50
@source workdir title="작업 폴더 구조와 narrations.ts 단일 진실원" path=design/garden-skills/web-video-presentation/SKILL.md lines=51:78
@source selfcheck title="하드 자체점검 프로토콜(Teams·서브에이전트·자가점검)" path=design/garden-skills/web-video-presentation/SKILL.md lines=81:103
@source readguide title="단계별 필수 문서 읽기 지침" path=design/garden-skills/web-video-presentation/SKILL.md lines=106:124
@source p11 title="Phase 1.1 입력 형태별 분기와 무소재 반문" path=design/garden-skills/web-video-presentation/SKILL.md lines=129:136
@source p12 title="Phase 1.2 script.md·outline.md 일괄 산출" path=design/garden-skills/web-video-presentation/SKILL.md lines=137:164
@source outline-bound title="outline.md 작성 허용·금지 경계" path=design/garden-skills/web-video-presentation/SKILL.md lines=147:160
@source cp-plan title="Checkpoint Plan 5개 항목 동시 정렬" path=design/garden-skills/web-video-presentation/SKILL.md lines=167:231
@source p21 title="Phase 2.1 골격 생성과 01-example 제거" path=design/garden-skills/web-video-presentation/SKILL.md lines=236:257
@source p22 title="Phase 2.2 1장 메인 스레드 구현과 강제 검수" path=design/garden-skills/web-video-presentation/SKILL.md lines=258:286
@source p23 title="Phase 2.3 2~N장 개발 모드(A·B·C) 선택 규칙" path=design/garden-skills/web-video-presentation/SKILL.md lines=287:329
@source p24 title="Phase 2.4~2.5 장 구현과 STORAGE_KEY 갱신" path=design/garden-skills/web-video-presentation/SKILL.md lines=330:350
@source cp-audio title="Checkpoint Audio 합성 여부 확인" path=design/garden-skills/web-video-presentation/SKILL.md lines=353:373
@source p3 title="Phase 3 오디오 추출·합성 절차" path=design/garden-skills/web-video-presentation/SKILL.md lines=376:392
@source p4 title="Phase 4 자동·수동 녹화 경로" path=design/garden-skills/web-video-presentation/SKILL.md lines=395:405
@source ten-rules title="웹 영상 프레젠테이션 10대 원칙 표" path=design/garden-skills/web-video-presentation/SKILL.md lines=408:425
@source script-ref title="정보 보존 비율 60% 하한과 원문 언어 유지" path=design/garden-skills/web-video-presentation/references/SCRIPT-STYLE.md lines=6:50
@source script-check title="구술 대본 3층 점검과 단일 Checkpoint 합병 메모" path=design/garden-skills/web-video-presentation/references/SCRIPT-STYLE.md lines=353:404
@source outline-ref title="outline.md 이중 원천 원칙과 장별 정보 풀" path=design/garden-skills/web-video-presentation/references/OUTLINE-FORMAT.md lines=8:26
@source craft-rules title="시각 데모 필수, 단계적 공개, 이중 원천 규칙" path=design/garden-skills/web-video-presentation/references/CHAPTER-CRAFT.md lines=5:86
@source craft-code title="코드 경선, narrations.ts 제약, 완공 자체점검" path=design/garden-skills/web-video-presentation/references/CHAPTER-CRAFT.md lines=153:224
@source themes-intro title="단일 테마 고정, 2층 토큰 계약, 23종 내장 테마" path=design/garden-skills/web-video-presentation/references/THEMES.md lines=1:43
@source audio-ref title="narrations.ts 기반 추출과 기본 TTS 2종" path=design/garden-skills/web-video-presentation/references/AUDIO.md lines=1:72
@source audio-play title="폴백 안내, ffprobe 15초 경고, Auto 200ms 규칙" path=design/garden-skills/web-video-presentation/references/AUDIO.md lines=154:225
@source rec-ref title="Auto 일괄 녹화와 Manual 수동 녹화 절차" path=design/garden-skills/web-video-presentation/references/RECORDING.md lines=10:66
@source sh-scaffold title="scaffold.sh 골격 복사, 패키지 주입, 5174 포트 안내" path=design/garden-skills/web-video-presentation/scripts/scaffold.sh lines=51:217
@source ts-extract title="extract-narrations.ts 정규식 파싱과 무음 건너뛰기" path=design/garden-skills/web-video-presentation/templates/scripts/extract-narrations.ts lines=44:129
@source sh-synth title="synthesize-audio.sh 직렬 합성 및 jq 검사" path=design/garden-skills/web-video-presentation/templates/scripts/synthesize-audio.sh lines=50:145
@source ts-stepper title="useStepper.ts STORAGE_KEY와 키보드 제어" path=design/garden-skills/web-video-presentation/templates/src/hooks/useStepper.ts lines=8:178
@source ts-auto title="useAudioPlayer.ts 재생 완료 후 200ms·추정치 폴백" path=design/garden-skills/web-video-presentation/templates/src/hooks/useAudioPlayer.ts lines=41:99
@source ts-mode title="useAutoMode.ts URL 매개변수와 Space 게이트 해제" path=design/garden-skills/web-video-presentation/templates/src/hooks/useAutoMode.ts lines=6:65
@source ts-vite title="vite.config.ts 개발 서버 포트(5174) 설정" path=design/garden-skills/web-video-presentation/templates/vite.config.ts lines=1:10
@source ts-pb title="ProgressBar.tsx 기본 GitHub 링크 설정" path=design/garden-skills/web-video-presentation/templates/src/components/ProgressBar.tsx lines=16:36
@source readme-old title="README.md의 구 Checkpoint A1·A2·B 도식과 트리" path=design/garden-skills/web-video-presentation/README.md lines=41:78
@source readme-map title="README.md의 미존재 PRINCIPLES·PATTERNS 안내" path=design/garden-skills/web-video-presentation/README.md lines=314:318
@source ms-route title="motion-showreel의 웹 발표 라우팅 표" path=design/garden-skills/motion-showreel/SKILL.md lines=28:29
@source wde-route title="web-design-engineer의 구술 웹 영상 제외 규칙" path=design/garden-skills/web-design-engineer/SKILL.md lines=18:18

## 어떻게 동작하나 {#flow span=12}

에이전트는 원고에서 구술 대본과 계획을 함께 뽑아 `Checkpoint Plan`으로 다섯 가지를 확정한 뒤, 1장을 본보기로 승인받아 2장 이후를 이어 만들고 `Checkpoint Audio` 선택에 따라 음성 합성과 녹화로 넘긴다.[](source:wf-top)[](source:cp-plan)[](source:p22)[](source:cp-audio) `script.md`, `outline.md`, 각 장 코드가 끝날 때마다 리뷰어 에이전트나 자체점검으로 실패 항목을 먼저 고치고 다음 단계로 나간다.[](source:selfcheck)

@workflow id=flow-diagram title="web-video-presentation 흐름"
| lane intake | 입력 판별 |
| lane plan | 대본·계획 |
| lane web | 골격과 장별 웹 무대 구현 |
| lane audio | 음성 합성 확인과 생성 |
| lane finish | 화면 녹화 |
| intake | 입력 판별? | external | intake | source:p11 |
| asksrc | 소재 요청 후 중단 | security | intake | source:p11 |
| author | 대본·개요·자체점검 | backend | plan | source:p12 |
| cpplan | Checkpoint Plan | security | plan | source:cp-plan |
| ch1 | 골격·1장 본보기 구현 | backend | web | source:p21 |
| ch1ok | 1장 사용자 검수 | security | web | source:p22 |
| chn | 2~N장 모드별 구현 | backend | web | source:p23 |
| cpaudio | Checkpoint Audio | security | audio | source:cp-audio |
| tts | 단위별 음성 합성 | backend | audio | source:p3 |
| record | 자동·수동 녹화 안내 | external | finish | source:p4 |
| intake > asksrc | 소재 없음 | dashed |
| intake > author | 있음 | emphasis |
| author > cpplan | 완료 |
| cpplan > author | 수정 | dashed |
| cpplan > ch1 | 확정 | emphasis |
| ch1 > ch1ok | |
| ch1ok > ch1 | 1장 수정 | dashed |
| ch1ok > chn | 1장 통과 | emphasis |
| chn > cpaudio | 전체 장 완료 | emphasis |
| cpaudio > tts | 합성 선택 | |
| cpaudio > record | 합성 생략 | dashed |
| tts > record | 길이 확인 완료 | emphasis |

@steps id=flow-steps
| s-intake | 입력·소재 판별? | **입력** 사용자 요청과 원고·대본 · **출력** 입력 유형 판정. **처리** 원고(`article.md`), 완성된 구술 대본, 주제만 준 요청 중 어느 것인지 가른다.[](source:p11) **다음** 원고에 60% 보존만으로 담기 어려울 만큼 긴 분량이면 압축하지 않고 분량 조정이나 분할을 먼저 알린다.[](source:script-ref) | flow-diagram | intake |
| s-asksrc | 소재 요청 후 중단 | **입력** 소재 없는 주제 요청 · **출력** 원고·개요 요청 메시지. **처리** 에이전트가 내용을 임의로 창작하지 않고 사용자에게 소재나 개요를 달라고 반문하며 멈춘다.[](source:p11) | flow-diagram | asksrc |
| s-author | 대본·개요·자체점검 | **입력** 원고 또는 직접 대본 · **참조** `references/SCRIPT-STYLE.md`, `references/OUTLINE-FORMAT.md` · **출력** `script.md`, `outline.md`(이중 원천 정보 풀과 소재 목록 포함). **처리** 한 번의 작업 흐름에서 원문 언어를 지킨 구술 대본(`정보 보존 비율` 60% 이상)과 애니메이션 명세를 비운 개발 계획을 작성한 뒤 3층 점검·수정까지 마친다.[](source:p12)[](source:script-ref)[](source:script-check)[](source:outline-ref) **다음** `article.md`는 삭제하지 않고 화면 밀도 원천으로 남긴다.[](source:p12) | flow-diagram | author |
| s-cpplan | Checkpoint Plan | **입력** 점검 마친 `script.md`·`outline.md` · **참조** `themes/*/theme.json`, 필요 시 `references/THEMES.md` · **출력** 5개 합의 사항(대본·계획·테마·소재·개발 모드). **처리** `theme.json`을 동적으로 읽어 가장 맞는 2~3개 테마를 추천하고, 5개 결정을 한 자리에서 확인받을 때까지 멈춘다.[](source:cp-plan) **다음** 테마가 정해지기 전에는 Phase 2로 넘어가지 않는다.[](source:cp-plan) | flow-diagram | cpplan |
| s-ch1 | 골격·1장 본보기 구현 | **입력** 확정된 테마·계획·소재 계획 · **참조** `references/CHAPTER-CRAFT.md`, 선택한 `themes/<id>/theme.json` · **실행** `bash <path>/scripts/scaffold.sh ./presentation --theme=<id>`, `npx tsc --noEmit` (→ 내부: `scaffold.sh`가 Vite `react-ts` 앱과 `tsx`를 설치하고 `templates/`·선택 테마 `tokens.css`와 오디오 npm 스크립트를 심은 뒤 타입 검사를 돌린다(코드 확인)) · **출력** `01-example`이 제거된 프로젝트와 1장 `<Chapter>.tsx`·`<Chapter>.css`·`narrations.ts`. **처리** 뼈대만 만들지 않고 이후 장들의 기준 본보기 구실을 할 완전한 1장을 메인 스레드에서 구현해 자체점검과 타입 검사를 통과시킨다.[](source:p21)[](source:p22)[](source:sh-scaffold) | flow-diagram | ch1 |
| s-ch1ok | 1장 사용자 검수 | **입력** 완성된 1장과 로컬 개발 서버 · **출력** 1장 승인 또는 수정 지시. **처리** 시각 기조·리듬·내용 기반 움직임·이중 원천 정보 밀도를 사용자가 확인할 때까지 무조건 멈춘다.[](source:p22) **다음** 2~N장 개발 모드와 무관하게 1장 확인은 건너뛸 수 없다.[](source:p22) | flow-diagram | ch1ok |
| s-chn | 2~N장 모드별 구현 | **입력** 1장 코드 본보기, `outline.md`, `article.md` · **참조** `references/CHAPTER-CRAFT.md` · **실행** 장 완료마다 `npx tsc --noEmit` · **출력** 장별 폴더 `src/chapters/0N-<id>/`와 갱신된 `chapters.ts`·`STORAGE_KEY`. **처리** 모드 A(장마다 멈춰 검수, 기본값), B(메인 스레드 순차 구현), C(서브에이전트 병렬 구현) 중 택한 방식으로 나머지 장을 만들고 매 장 자체점검과 수정을 거친다.[](source:p23)[](source:p24)[](source:craft-code) **다음** 도중에 다른 모드로 바꿀 수 있으며 장 수나 `narrations.ts` 길이가 바뀌면 `useStepper.ts`의 `STORAGE_KEY` 버전을 올린다.[](source:p23)[](source:p24)[](source:ts-stepper) | flow-diagram | chn |
| s-cpaudio | Checkpoint Audio | **입력** 완성된 전체 장 웹 프로젝트 · **출력** 음성 합성 진행 여부 결정. **처리** 장 수·총 `step` 수와 개발 서버 주소를 보고하고 자동 녹화용 음성 합성을 진행할지 질문하며 멈춘다.[](source:cp-audio) | flow-diagram | cpaudio |
| s-tts | 단위별 음성 합성 | **입력** 모든 장의 `narrations.ts` · **참조** `references/AUDIO.md`, 필요 시 `templates/scripts/tts-providers/README.md` · **실행** `npm run extract-narrations`, `npm run synthesize-audio` (`PRESENTATION_TTS=openai` 등 선택), `ffprobe` 길이 확인 (→ 내부: `extract-narrations.ts`가 `chapters.ts`를 정규식으로 파싱해 `1`부터 번호를 매긴 `audio-segments.json`을 만들고 빈 문자열을 건너뛰며, `synthesize-audio.sh`가 `jq` 검사 뒤 `tts-providers/<name>.sh`를 직렬 호출해 이미 있는 mp3를 건너뛴다(코드 확인)) · **출력** `audio-segments.json`과 `public/audio/<chapter-id>/<step>.mp3`. **처리** 추출된 narration(step마다 읽을 구어 문구) 목록을 사용자가 확인한 뒤 TTS를 돌리고, 15초 이상 긴 구간을 짚어 조정을 제안한다.[](source:p3)[](source:audio-ref)[](source:audio-play)[](source:ts-extract)[](source:sh-synth) | flow-diagram | tts |
| s-record | 자동·수동 녹화 안내 | **입력** 완성된 웹 무대와(선택 시) 합성 음성 · **참조** `references/RECORDING.md` · **출력** 녹화 경로 안내(전체 화면 URL과 후편집 요령). **처리** 음성을 합성했으면 `?auto=1`에서 `Space` 한 번으로 끝까지 자동 진행하며 녹화하게 안내하고, 건너뛰었으면 기본 수동 모드로 클릭 진행하며 녹화한 뒤 후편집으로 더빙하게 안내한다.[](source:p4)[](source:rec-ref)[](source:ts-mode) | flow-diagram | record |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 사용자가 글·원고·구술 대본·강의·제품 데모를 클릭 진행형 16:9 웹 프레젠테이션이나 녹화용 영상으로 만들자고 요청하면 모델이 `description`을 보고 켠다. 호출 제한 필드는 없다.[](source:fm) |
| 성격 | 단순 슬라이드 변환기가 아니라 대본 재작성, 다섯 가지 기획 정렬, 기준 본보기 장 검증, 장별 독립 시각 구현, 교체 가능한 TTS·자동 녹화를 묶은 제작 워크플로다.[](source:fm)[](source:wf-top) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| motion-showreel {#rel-r07} | **이 스킬** | 대안 | `motion-showreel`은 클릭 진행·현장 발표·인터랙티브 웹 발표나 아티클→구술 대본 변환 요청이면 `web-video-presentation`으로 라우팅한다(사용자 개입 없음).[](source:ms-route) |
| web-design-engineer {#rel-r12} | **이 스킬** | 대안 | `web-design-engineer`는 구술 비트→녹화용 웹 영상 프레젠테이션을 적용 제외로 두고 전용 스킬이 있으면 이쪽으로 라우팅한다(사용자 개입 없음).[](source:wde-route) |

@architecture id=relation-map title="web-video-presentation과 이어지는 스킬"
| ms | motion-showreel | backend |
| wde | web-design-engineer | backend |
| self | web-video-presentation(이 스킬) | backend |
| ms > self | 대안 |
| wde > self | 대안 |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 전체 4단계 공정, 2개 필수 확인 지점, 하드 자체점검, 10대 원칙을 담는다 | 스킬이 켜지면 읽는다 | 모든 단계 |
| `references/SCRIPT-STYLE.md`, `references/OUTLINE-FORMAT.md` | 정보 보존 비율 60% 기준, 원문 언어 유지, AI 티 제거 점검, 이중 원천 정보 풀과 `outline.md` 형식을 정한다 | Phase 1.2 대본·계획 작성 시 반드시 읽는다[](source:readguide) | 대본·개요·자체점검 |
| `references/CHAPTER-CRAFT.md` | 장 구현의 유일한 필수 진입 문서로 10대 원칙, 시각 도구함, 코드 규약, 완공 점검표를 제공한다 | 1장과 2~N장 각 장을 구현할 때마다 반드시 읽는다[](source:readguide) | 골격·1장 본보기 구현 · 2~N장 모드별 구현 |
| `references/THEMES.md`, `themes/<23개 id>/` | 23개 내장 테마(`theme.json`, `tokens.css`), 2층 토큰 계약, 새 테마 제작·4.5:1 대비 기준을 담는다 | `Checkpoint Plan` 추천 시 `themes/*/theme.json`을 동적으로 읽고 테마 선택·제작 시 참조한다[](source:readguide)[](source:cp-plan) | Checkpoint Plan · 골격·1장 본보기 구현 |
| `references/EXAMPLES/` | `hook-chapter`, `list-reveal`, `case-tech-review` 3개 구조 본보기 코드와 개요 발췌를 담는다 | 필수가 아니며 장 구상이 막힐 때 형태 참고용으로만 읽는다[](source:readguide) | 흐름 밖: 선택 참고 예제 |
| `scripts/scaffold.sh`, `templates/` | Vite·React·TS 1920×1080 무대, `useStepper`·`useAudioPlayer`·`useAutoMode`, 숨김 진행 바, 예제 장을 생성한다 | Phase 2.1에서 1회 실행해 대상 프로젝트를 만든다[](source:p21)[](source:sh-scaffold) | 골격·1장 본보기 구현 · 2~N장 모드별 구현 |
| `references/AUDIO.md`, `templates/scripts/` | `extract-narrations.ts`, 직렬 실행기 `synthesize-audio.sh`, 내장 2종(`minimax.sh`, `openai.sh`)과 5종 TTS 안내를 제공한다 | Phase 3 음성 합성 시 읽고 실행한다[](source:readguide)[](source:audio-ref) | 단위별 음성 합성 |
| `references/RECORDING.md` | `?auto=1` 자동 진행 녹화와 수동 녹화·후편집 도구를 안내한다 | Phase 4 녹화 안내 시 읽는다[](source:readguide) | 자동·수동 녹화 안내 |
| `README.md`, `README.zh-CN.md`, `manifest.json` | 사람용 소개·테마 갤러리와 패키지 메타데이터(`1.2.3`)를 담는다 | 에이전트 실행 지시에서는 읽지 않는다 | 흐름 밖: 사용자 문서·메타 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 소재 없이 주제만 제시 | 내용을 대신 지어내지 않고 멈춰서 소재나 개요를 먼저 요청한다 | [](source:p11) |
| 원고 길이 과다 vs `정보 보존 비율` 60% 하한 | `len(script) / len(article) >= 0.6`이 최우선이며, 30% 수준으로 무단 압축하지 않고 분량 연장과 다회차 분할을 제안한다 | [](source:script-ref) |
| `outline.md` 작성 범위 | 금지: 애니메이션 기법, CSS 수단, 밀리초·초 단위 연출 수치를 적지 않고 `(~Ts)` 음성 추정 시간과 이중 원천 정보 풀만 적는다 | [](source:outline-bound) |
| `Checkpoint Plan`, `1장 검수`, `Checkpoint Audio` | 강제 정지: 세 지점에서는 답변·승인 없이 다음 단계로 진행하지 못하며 1장은 모드 선택과 무관하게 필수다 | [](source:cp-plan)[](source:p22)[](source:cp-audio) |
| `script.md`·`outline.md`·각 장 자체점검 | 강제: Teams·서브에이전트·엄격 자가점검 중 하나로 짚고, 실패 항목을 고친 뒤에야 사용자에게 보고한다 | [](source:selfcheck)[](source:script-check)[](source:craft-code) |
| 무대·장 코드 규약과 `narrations.ts` | 강제: `1920×1080` 고정 무대에 `chrome`·`setTimeout`·순수 글 장·목록 동시 등장을 금지하며, 최대 `step` 번호 `+ 1 === narrations.length`와 애니메이션 시간 `<=` 음성 길이를 맞춘다 | [](source:ten-rules)[](source:craft-rules)[](source:craft-code) |
| 자동 진행 재생(`?auto=1`)의 실제 동작 | 음성 재생 종료 뒤 `200ms` 여유(`trailMs`) 후 다음으로 넘어가며, 애니메이션 완료를 기다리지 않고 무음·누락 시 `max(1500ms, 글자 수 * 250ms)` 추정치로 넘긴다(코드 확인) | [](source:audio-play)[](source:ts-auto) |
| 장 추가·삭제·재배치 또는 `narrations.ts` 변경 뒤 | `useStepper.ts`의 `STORAGE_KEY`(현재 `presentation-cursor-v4`) 버전을 올려 옛 로컬 커서가 없는 `step`에 걸리지 않게 한다 | [](source:p24)[](source:ts-stepper) |
| 개발 서버 포트·확인 지점·문서 목록 불일치 | `SKILL.md`·`RECORDING.md`는 `5173` 포트를 적었으나 `scaffold.sh`·`vite.config.ts` 실제 포트는 `5174`다. `README.md`는 옛 `Checkpoint A1·A2·B` 도식과 없는 `PRINCIPLES.md`·`PATTERNS.md`를 적었다 | [](source:p22)[](source:ts-vite)[](source:sh-scaffold)[](source:readme-old)[](source:readme-map) |
| `ProgressBar.tsx` 기본 외부 링크 탑재 | 템플릿 진행 바가 별도 `githubUrl={null}` 전달이 없으면 기본 GitHub 링크(`github.com/ConardLi/garden-skills`)를 우하단 hover 영역에 함께 그린다(코드 확인) | [](source:ts-pb) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 구술 대본 8원칙·AI 티 제거 5범주와 플랫폼 변체 — `대본·개요·자체점검` · Bilibili·YouTube 등 플랫폼별 길이·호흡 규칙과 3층 점검 항목을 개요에서 생략했다.
- 장별 시각 도구함(`CHAPTER-CRAFT.md`)과 테마 23종 토큰 — `골격·1장 본보기 구현`과 `2~N장 모드별 구현` · 관계→움직임 결정 트리, 4계층(CSS·SVG·Canvas·JS) 연출 수단, 23개 테마별 성격·금지 규칙이 개요 밖에 있다.
- TTS 공급자 3함수 계약과 5종 어댑터 코드 — `단위별 음성 합성` · ElevenLabs·edge-tts·macOS `say`·Azure·Google Cloud 구현 조각과 `bash 3.2` 빈 배열 우회 규약을 담지 않았다.

@callout level=open-question title="확인하지 못한 것"
| `themes/` 23개 테마(46개 파일) 중 기본 테마 `midnight-press`(`theme.json`·`tokens.css`)만 읽고 나머지 22개 테마 정의(44개 파일)는 읽지 않았다. |
| `references/EXAMPLES/` 3개 예제 하위 파일 8개와 `templates/src/` 나머지 스타일·초기 예제 파일(`base.css` 81~415줄, `Example.tsx`, `*.css` 5개)은 읽지 않았다. |
| `README.md` 72·314·318줄이 가리킨 `references/PRINCIPLES.md`와 `references/PATTERNS.md`는 저장소에 존재하지 않는다(`CHAPTER-CRAFT.md`로 통합된 것으로 보인다). |

읽은 원본: 텍스트 파일 95개 중 36개 전체 읽기(`SKILL.md`, `manifest.json`, `README.md`, `references/*.md` 6개, `references/EXAMPLES/README.md`, `scripts/scaffold.sh`, `templates/` 스크립트·설정·핵심 React·Hook·CSS 23개, `themes/midnight-press/` 2개; 외부 라우팅 대상 `motion-showreel/SKILL.md`·`web-design-engineer/SKILL.md` 일부 대조) 및 1개 부분 확인(`templates/src/styles/base.css` 1~80줄). 미읽음: 나머지 22개 테마 44개, `EXAMPLES/` 하위 8개, `templates/src/` 예제·스타일 5개. 제외: `README.zh-CN.md` 1개(`README.md`의 중국어판), `*.ko.md` 번역본 14개.
