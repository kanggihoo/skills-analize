# script-to-motion은 언제 켜지고, 무엇을 지키게 하나 {#script-to-motion-page}

대본·주제·기획서를 받아 **브라우저에서 재생되는 나레이션 모션그래픽 영상 프로젝트**를 끝까지 만드는 스킬이다. 에이전트는 조사·대본·스토리보드·빌드·검증·고도화를 사용자에게 묻지 않고 혼자 마치고, **사용자의 목소리 녹음만 사용자가 승인할 때까지 멈춘다.**[](source:st-handsoff)

- 결과물은 MP4가 아니라 소스 코드와 오디오 폴더다. 사용자가 화면을 녹화하거나 `render.py`로 MP4를 만든다. 에이전트는 요청 없이 MP4를 만들지 않는다.[](source:st-intro)
- 청취자는 대사를 한 번만 듣고 에이전트의 맥락을 모른다. 모든 대사는 첫 청자 검사 다섯 질문, 이음새 검사, 서브에이전트 검토를 통과해야 한다.[](source:st-stop)
- 화면은 슬라이드가 아니라 재질·빛·깊이·카메라가 있는 하나의 세계여야 하고, 에이전트는 화면을 `render.py --screenshot` 시트로만 본다.[](source:st-nobox)[](source:st-look)
- 이미지·음악·아이콘 같은 외부 소재는 쓰지 않는다. 사용자가 준 파일만 예외다.[](source:st-orig)

@answer scope="script-to-motion · 커밋 f415191 · 지시상 동작 · 결과 영상은 확인하지 못함"
@meta locale=ko
@source st-desc title="video/script-to-motion/SKILL.md · 97091B · frontmatter" path=video/script-to-motion/SKILL.md lines=2:3
@source st-hooks title="script-to-motion/SKILL.md · frontmatter hooks" path=video/script-to-motion/SKILL.md lines=4:9
@source st-intro title="script-to-motion/SKILL.md · 개요" path=video/script-to-motion/SKILL.md lines=12:23
@source st-stop title="script-to-motion/SKILL.md · 맨 위 절대 규칙 상자" path=video/script-to-motion/SKILL.md lines=25:56
@source st-world-box title="script-to-motion/SKILL.md · 만든 세계 상자" path=video/script-to-motion/SKILL.md lines=57:68
@source st-tree title="script-to-motion/SKILL.md · 프로젝트 폴더" path=video/script-to-motion/SKILL.md lines=72:113
@source st-collab title="script-to-motion/SKILL.md · 사용자와 일하는 법" path=video/script-to-motion/SKILL.md lines=115:163
@source st-handsoff title="script-to-motion/SKILL.md · 끝까지 혼자 마친다" path=video/script-to-motion/SKILL.md lines=144:150
@source st-rate title="script-to-motion/SKILL.md · 나레이션은 항상 1배속" path=video/script-to-motion/SKILL.md lines=151:159
@source st-look title="script-to-motion/SKILL.md · 화면은 render.py 시트로만" path=video/script-to-motion/SKILL.md lines=165:204
@source st-nobox title="script-to-motion/SKILL.md · 슬라이드·박스 금지" path=video/script-to-motion/SKILL.md lines=206:235
@source st-crafted title="script-to-motion/SKILL.md · 만든 세계와 시네마틱 룩" path=video/script-to-motion/SKILL.md lines=237:283
@source st-listener title="script-to-motion/SKILL.md · 첫 청자 규칙과 게이트" path=video/script-to-motion/SKILL.md lines=285:356
@source st-cushion title="script-to-motion/SKILL.md · 주제가 바뀔 때의 쿠션" path=video/script-to-motion/SKILL.md lines=358:437
@source st-length title="script-to-motion/SKILL.md · 길이가 아니라 내용" path=video/script-to-motion/SKILL.md lines=439:460
@source st-orig title="script-to-motion/SKILL.md · 원본 소재만" path=video/script-to-motion/SKILL.md lines=462:531
@source st-fonts title="script-to-motion/SKILL.md · 글꼴은 OFL 1.1만" path=video/script-to-motion/SKILL.md lines=533:635
@source st-s1 title="script-to-motion/SKILL.md · 1단계 입력 읽기와 화면 비율" path=video/script-to-motion/SKILL.md lines=641:689
@source st-s2 title="script-to-motion/SKILL.md · 2단계 프로젝트 만들기" path=video/script-to-motion/SKILL.md lines=691:702
@source st-s3 title="script-to-motion/SKILL.md · 3단계 cue 쓰기" path=video/script-to-motion/SKILL.md lines=704:747
@source st-s4 title="script-to-motion/SKILL.md · 4단계 나레이션 녹음" path=video/script-to-motion/SKILL.md lines=749:815
@source st-s5 title="script-to-motion/SKILL.md · 5단계 스토리보드" path=video/script-to-motion/SKILL.md lines=817:887
@source st-s6 title="script-to-motion/SKILL.md · 6단계 빌드" path=video/script-to-motion/SKILL.md lines=889:940
@source st-s6b title="script-to-motion/SKILL.md · 6b 3D와 셰이더" path=video/script-to-motion/SKILL.md lines=942:973
@source st-s7 title="script-to-motion/SKILL.md · 7단계 검증" path=video/script-to-motion/SKILL.md lines=975:1030
@source st-s7b title="script-to-motion/SKILL.md · 7b 고도화" path=video/script-to-motion/SKILL.md lines=1032:1047
@source st-s8 title="script-to-motion/SKILL.md · 8단계 인수" path=video/script-to-motion/SKILL.md lines=1049:1096
@source st-rev title="script-to-motion/SKILL.md · 수정 요청" path=video/script-to-motion/SKILL.md lines=1098:1131
@source st-cokac title="script-to-motion/references/cokacmotion.md · 기법 도서관 연결" path=video/script-to-motion/references/cokacmotion.md lines=57:66
@source st-cokac-lib title="script-to-motion/references/cokacmotion.md · 라이브러리 추가" path=video/script-to-motion/references/cokacmotion.md lines=115:117
@source st-cokac-tool title="script-to-motion/scripts/cokacmotion.mjs · 내려받기와 실행" path=video/script-to-motion/scripts/cokacmotion.mjs lines=85:95
@source st-cokac-run title="script-to-motion/scripts/cokacmotion.mjs · 받은 스크립트 실행" path=video/script-to-motion/scripts/cokacmotion.mjs lines=179:183
@source st-tts-appr title="script-to-motion/scripts/tts.mjs · --approved 검사" path=video/script-to-motion/scripts/tts.mjs lines=286:293
@source st-tts-key title="script-to-motion/scripts/tts.mjs · 키 없음" path=video/script-to-motion/scripts/tts.mjs lines=144:153
@source st-guard title="script-to-motion/scripts/hooks/look_guard.py · 막는 패턴" path=video/script-to-motion/scripts/hooks/look_guard.py lines=28:37
@source st-guard-run title="script-to-motion/scripts/hooks/look_guard.py · 도구별 동작" path=video/script-to-motion/scripts/hooks/look_guard.py lines=105:137
@source st-newproj title="script-to-motion/scripts/new_project.mjs · 가드 설치" path=video/script-to-motion/scripts/new_project.mjs lines=186:194
@source st-blender title="references/blender-mcp.md · 내려받기 사전 안내" path=video/script-to-motion/references/blender-mcp.md lines=58:59
@source st-blender-mcp title="references/blender-mcp.md · MCP 설정 변경" path=video/script-to-motion/references/blender-mcp.md lines=122:123
@source st-browser title="references/browser-setup.md · 내려받기 사전 안내" path=video/script-to-motion/references/browser-setup.md lines=24:25
@source st-elevate title="references/elevate.md · 고도화 라운드 수" path=video/script-to-motion/references/elevate.md lines=145:146
@source st-render-clear title="references/render.md · --clear" path=video/script-to-motion/references/render.md lines=101:101
@source st-sound-a title="references/sound.md · 죽은 공기 창 수(14)" path=video/script-to-motion/references/sound.md lines=40:41
@source st-sound-b title="references/sound.md · 죽은 공기 창 수(8)" path=video/script-to-motion/references/sound.md lines=49:49
@source st-fonts-w title="references/fonts.md · 글꼴 굵기 상한" path=video/script-to-motion/references/fonts.md lines=127:127
@source st-md-w title="references/motion-design.md · 주인공 글자 굵기" path=video/script-to-motion/references/motion-design.md lines=83:83
@source st-fx-calm title="references/fx-kit.md · 사용자는 차분함을 선호" path=video/script-to-motion/references/fx-kit.md lines=52:54
@source st-fx-flash title="references/fx-kit.md · flash 기본값" path=video/script-to-motion/references/fx-kit.md lines=88:88
@source st-evals title="script-to-motion/evals/evals.json · 22452B · 평가 25개" path=video/script-to-motion/evals/evals.json
@source st-readme title="script-to-motion/README.md · 33944B · 내레이션 안내" path=video/script-to-motion/README.md lines=56:62

## 언제 켜지나 {#activation}

켜짐 여부는 모델이 `description`을 보고 판단한다. 정확히 일치해야 켜지는 사전이 아니다. 호출을 막는 필드(`disable-model-invocation` 등)는 원문에 명시 없음이다.[](source:st-desc)

@code id=st-desc-code source=st-desc language=yaml

frontmatter에는 `hooks`도 있다. 이 스킬이 호출되면 `Read`·`Bash`·`Write`·`Edit`·`MultiEdit`·`NotebookEdit` 호출마다 `look_guard.py`가 먼저 실행된다.[](source:st-hooks)

| 상황(설명용 예시) | 켜질까 | 이유 |
| --- | --- | --- |
| "이 대본으로 유튜브 영상 만들어줘" | {good:켜질 만함} | 대본·영상·설명 영상을 `description`이 든다[](source:st-desc) |
| 주제 한 줄만 주고 "영상 만들어줘" | {good:켜질 만함} | 주제·기사·기획서를 조사해 대본으로 쓴다고 `description`이 적는다[](source:st-desc) |
| 만든 영상의 대본을 고치거나 시간을 다시 맞춘다 | {good:켜질 만함} | 수정 요청·리뷰 노트를 다룬다고 적는다[](source:st-desc) |
| 영상 없이 이미지 한 장이나 슬라이드 덱을 만든다 | {caution:판단 불가} | 영상이 아닌 산출물은 원문에 명시 없음 |
| 대본 없이 완성된 MP4를 바로 받겠다는 요청 | {bad:맞지 않음} | 결과물은 소스와 오디오이고 MP4는 사용자가 만든다고 적는다[](source:st-intro) |

## 에이전트는 어떤 순서로 일하나 {#process}

@workflow id=stm-flow title="요청에서 인수까지"
| lane prep | 준비 |
| lane make | 제작 |
| lane done | 인수 |
| brief | 입력 읽기 | external | prep |
| project | 프로젝트 만들기 | backend | prep |
| cues | cue 쓰기 | backend | prep |
| storyb | 스토리보드 | backend | make |
| build | 빌드 | backend | make |
| verify | 검증 | backend | make |
| elevate | 고도화 | backend | make |
| hand | 인수 보고 | backend | done |
| approve | 녹음 승인? | external | done |
| rec | 녹음과 정리 | backend | done |
| wait | 무음으로 대기 | backend | done |
| brief > project | |
| project > cues | |
| cues > storyb | |
| storyb > build | |
| build > verify | |
| verify > elevate | |
| elevate > hand | 혼자 끝냄 | emphasis |
| hand > approve | |
| approve > rec | 예 | emphasis |
| approve > wait | 아직 | dashed |

@steps id=stm-steps
| brief | 입력 읽기 | 대본·주제·기획서 중 무엇을 받았는지로 말의 출처가 갈린다. 언어·화면 비율·톤은 묻지 않고 추론한다.[](source:st-s1) | stm-flow | brief |
| project | 프로젝트 만들기 | `new_project.mjs`가 런타임을 복사하고 글꼴·GSAP를 내려받는다. `voice`는 일부러 비워 둔다.[](source:st-s2) | stm-flow | project |
| cues | cue 쓰기 | 문장 하나가 cue 하나다. 사용자가 준 대본은 그대로 쓰고 `say`의 발음만 바꾼다.[](source:st-s3) | stm-flow | cues |
| storyb | 스토리보드 | 세계관 문서(world bible)를 먼저 쓰고 beat마다 기법을 cokacmotion에서 찾는다.[](source:st-s5) | stm-flow | storyb |
| build | 빌드 | `scenes.js`의 모든 tween을 `tl`에 두고 cue 라벨에 맞춘다.[](source:st-s6) | stm-flow | build |
| verify | 검증 | 시트로 화면을 보고, `check.mjs` 등으로 코드·글꼴·소리를 잰다.[](source:st-s7) | stm-flow | verify |
| elevate | 고도화 | 별도 서브에이전트(아트 디렉터)가 점수를 매기고 에이전트가 다시 짓는다.[](source:st-s7b) | stm-flow | elevate |
| hand | 인수 보고 | 폴더 경로, 재생·녹화 방법, 기본값, 미해결 사항을 알린다.[](source:st-s8) | stm-flow | hand |
| approve | 녹음 승인? | 사용자가 영상을 본 뒤 녹음하라고 해야 `tts.mjs --approved`를 돌린다.[](source:st-s4) | stm-flow | approve |

기본값은 녹음 보류다. 키와 음성이 있어도 `--approved` 없이는 모든 cue가 무음 placeholder이고 API를 부르지 않는다.[](source:st-tts-appr) 키나 음성이 없으면 `narration: false`로 소리 없는 영상을 만든다.[](source:st-tts-key)

판정: 이 스킬에서 에이전트가 멈춰 사용자를 기다리는 지점은 녹음 승인 하나뿐이다. 근거는 "묻지 말고 끝까지 마친다"와 "목소리 녹음만 사용자가 정한다"는 두 문장이다.[](source:st-handsoff) 다만 `script-writing.md`는 채널 서명이 알려져 있지 않으면 한 번 묻는다고 적어 이 문장과 가볍게 어긋난다.

## 무엇을 강제하고 무엇을 금지하나 {#rules}

| 구분 | 규칙 | 어기면 |
| --- | --- | --- |
| 대사 | 모든 대사는 첫 청자 다섯 질문, 이웃 대사, 이음새 검사, 내부 이름 목록, 처음 보는 서브에이전트의 검토를 통과해야 한다. `--approved` 전에 필수다[](source:st-listener)[](source:st-s4) | 녹음에 크레딧을 쓴 뒤 다시 해야 한다 |
| 주제 전환 | 새 주제는 쿠션(앞 주제 닫기, 숨 돌리기, 왜 지금인지 열기) 없이 시작하지 않는다. 경계어 하나는 쿠션이 아니다[](source:st-cushion) | 사용자가 "갑작스럽다"고 지적한 실패 |
| 길이 | 영상·챕터·대사에 목표 길이가 없다. 시간 때문에 설명·쿠션·단계를 줄이지 않는다[](source:st-length) | 이해가 빠진 영상 |
| 화면 구성 | 박스·카드·글머리표·표에 글을 담지 않는다. 상자는 이야기 속 사물(브라우저 창, 휴대폰 등)일 때만 허용된다[](source:st-nobox) | 슬라이드로 판정되면 다시 설계 |
| 화면 품질 | 첫 빌드부터 세계·재질·키 라이트·깊이·카메라를 갖춘다. 인포그래픽 룩은 실패다[](source:st-crafted) | 장식으로 고치지 않고 다시 만든다 |
| 보기 | 화면은 `render.py --screenshot` 시트로만 본다. 직접 만든 스크린샷 코드, ffmpeg 프레임 추출, 시트가 아닌 이미지 열기를 금지한다[](source:st-look) | 가드 hook이 호출을 막는다[](source:st-guard-run) |
| 소재 | 이미지·사진·아이콘·스톡·GIF·Lottie·음악·효과음·외부 생성 서비스 결과를 쓰지 않는다. 사용자가 준 파일은 `provenance.json`에 적는다[](source:st-orig) | `check.mjs`가 기록 없는 파일을 거부한다 |
| 글꼴 | SIL OFL 1.1 글꼴만, 수정하지 않고, 라이선스 파일과 함께 쓴다. 시스템 글꼴·이모지 금지[](source:st-fonts) | 도구가 설치를 거부하고 `check.mjs`가 실패한다 |
| 결정성 | `Math.random`·`Date`·타이머·CSS transition·독립 `gsap.to`를 쓰지 않는다[](source:st-s6) | 시간을 옮기면 화면이 달라진다 |
| 속도 | 나레이션과 소리 있는 클립은 항상 1배속이다. `playbackRate`를 쓰지 않는다[](source:st-rate) | `check.mjs`가 오류로 막는다 |
| 사람 승인(녹음) | 목소리 녹음은 사용자가 정한다. `--force`·`--only`는 `--approved` 없이 실행되지 않는다[](source:st-tts-appr) | 스크립트가 중단한다 |
| 사람 승인(라이브러리) | `assets/vendor/catalog.json`에 새 라이브러리를 더하려면 사용자 승인이 필요하다. 한 줄로 제안만 하고 스스로 하지 않는다[](source:st-cokac-lib) | 원문에 명시 없음 |

@callout level=warning title="MP4는 사용자가 만든다"
에이전트는 요청이 없으면 MP4를 렌더하지 않고 다른 캡처 파이프라인도 만들지 않는다. 시트가 낡았다고 알리지도 않는다. `--clear`도 사용자가 요청할 때만 쓴다.[](source:st-collab)[](source:st-render-clear)

@facts id=stm-facts
| 기본 화면 | 16:9, 1920×1080. 9:16은 1080×1920이고 위 240·아래 480·오른쪽 180 px는 플랫폼 UI 안전 여백이다(지시, 근사값)[](source:st-s1) |
| 죽은 공기 | 소리 없는 구간 0.4초 이상 금지(필수). 영상 클립을 통째로 보여 줄 때의 구간만 예외다[](source:st-s4) |
| 문장 어미 | 합쇼체(~니다) 약 75%, 해요체(~요) 약 25%(권고)[](source:st-s3) |
| 고도화 | 장·연출·디자인·모션을 1–5점으로 매기고 모두 4점 이상이면 멈춘다. 최대 3라운드(기본)[](source:st-s7b)[](source:st-elevate) |
| 캔버스 예산 | 챕터당 약 30–40M px, JS 프레임당 p95 8 ms 아래(권고)[](source:st-s6)[](source:st-s7) |
| 글꼴 | 카탈로그 7종, 핵심 3종(Pretendard, D2Coding, Noto Sans KR)은 모든 프로젝트에 들어간다[](source:st-fonts) |
| 평가 | `evals.json`에 평가 25개(번호 13–15는 없음)[](source:st-evals) |

## 설치와 부작용은 무엇이 있나 {#effects}

@tree id=stm-layout title="만드는 프로젝트 폴더(일부)"
| root | project/ | - |
| idx | index.html, css/style.css | root |
| js | js/scenes.js, js/cues.js, js/sync.js | root |
| aud | audio/ (narration.mp3, cues/) | root |
| scr | script.json, script.txt, storyboard.md | root |
| gen | generated.json, provenance.json | root |
| ven | vendor/gsap/, fonts/ | root |
| rp | render.py | root |

이 목록은 일부다. 전체는 원문 폴더 설명에 있다.[](source:st-tree)

| 동작 | 언제 | 사용자에게 알리나 |
| --- | --- | --- |
| 글꼴·GSAP를 네트워크에서 내려받는다 | `new_project.mjs` 첫 실행[](source:st-s2) | 한 줄 안내는 원문에 명시 없음 |
| `.claude/settings.local.json`에 가드 hook을 쓴다 | `new_project.mjs`가 기본으로 한다. `--no-guard`로 끈다[](source:st-newproj) | 한 줄로 알린다고 적는다[](source:st-s2) |
| Chromium 약 115 MB를 내려받는다 | `setup_browser.mjs`, 브라우저가 없을 때 | 첫 실행 전 한 줄로 알린다[](source:st-browser) |
| Blender 약 400 MB를 내려받는다 | 3D beat가 필요할 때 | 첫 실행 전 한 줄로 알린다[](source:st-blender) |
| `.mcp.json`에 Blender MCP 항목을 넣는다 | 선택 | 먼저 사용자에게 묻는다[](source:st-blender-mcp) |
| cokacmotion 저장소를 `~/.cache`에 받아 그 안의 스크립트를 실행한다 | 기법을 찾을 때(5단계) | 첫 다운로드 전 한 줄로 알린다[](source:st-cokac) |

판정: `cokacmotion.mjs`는 `git clone --depth 1`로 저장소 최신본을 받은 뒤 `node`로 받은 `aimotion.mjs`를 직접 실행한다.[](source:st-cokac-tool)[](source:st-cokac-run) 고정된 commit이나 해시 확인은 이 두 구간에서 보이지 않는다. 같은 코드가 `README`에서는 "기법 모음(약 70MB)을 받아 둔다"고만 적혀 있다.[](source:st-readme)

## 다른 스킬과 어떻게 이어지나 {#position}

묶음 `narrated-motion-video`에 속한다. 전체 흐름은 `video/_group-narrated-motion-video/narrated-motion-video.html`에 있다.

@workflow id=stm-position title="기법 찾기까지의 앞뒤"
| board | script-to-motion 5단계 | backend |
| lib | aimotion 기법 찾기 | backend | emphasis |
| build | script-to-motion 6단계 | backend |
| board > lib | beat마다 |
| lib > build | 옮기기 | emphasis |

| rel-id | 받는 것 / 넘기는 것 | 조건·강도 |
| --- | --- | --- |
| r16 | `cokacmotion.mjs search`로 기법을 찾고 데모의 `NOTES.md`·소스를 읽는다. 데모 파일은 프로젝트에 불러오지 않는다[](source:st-cokac) | 5단계에서 beat마다 기법을 찾는다(의무형) |
| r18 | `bang-motion`과 목적이 비슷하다. 둘 다 HTML·GSAP로 설명·홍보 영상을 만든다 | 같은 계열, 직접 연결 없음 |
| r19 | `explainer-default`와 목적이 비슷하다 | 같은 계열, 직접 연결 없음 |

## 읽은 범위와 한계 {#audit}

@callout level=open-question title="원문끼리 맞지 않는 곳"
`sound.md`는 한 곳에서 "50 ms 창 14개가 연속이면 0.4초"라고 쓰고, 다른 곳에서는 8개가 0.4초라고 쓴다. 14개는 0.7초이므로 앞의 숫자가 틀린 것으로 보인다.[](source:st-sound-a)[](source:st-sound-b)
`fonts.md`는 표시용 굵기를 800 이하로 제한하는데, `motion-design.md`의 주인공 글자 굵기 표는 800–900을 적는다. 우선순위는 원문에 명시 없음이다.[](source:st-fonts-w)[](source:st-md-w)
`fx-kit.md`는 "사용자는 flash를 최대 0.08, 0.7초 이상으로 차분하게 쓴다"고 하면서 `flash`의 기본값은 peak 0.3, 0.45초다.[](source:st-fx-calm)[](source:st-fx-flash)

@callout level=open-question title="확인하지 못한 것"
영상이 실제로 만들어지는지, `render.py`가 MP4를 내는지, 가드 hook이 서브에이전트까지 막는지는 실행하지 않아 확인하지 못했다. 이 스킬의 지시는 모두 분석할 자료로만 읽었다.
Fish Audio 키·음성이 없어 녹음 경로는 코드로만 읽었다. `evals.json`의 기대 출력이 지시대로 지켜지는지는 확인하지 못했다. 평가 17은 계획에 "약 2분"을 적는데 `SKILL.md`는 목표 길이가 없다고 한다.
부분 분석이다. `SKILL.md`는 직접 전부 읽었고, `references/` 22개와 `scripts/`는 서브에이전트가 읽은 보고를 받아 인용한 줄 번호만 직접 대조했다(`references/cokacmotion.md`는 직접 읽음). 읽은 파일 전체 목록(99개)과 정도는 `video/script-to-motion/files.md`(색인 기준)에 있다.
바이너리와 큰 생성 파일은 읽었다고 하지 않는다: `three.bundle.min.js`(약 797 KB)·`three.fx.bundle.min.js`(약 1.29 MB)·`package-lock.json`은 읽지 않았고, `render.py`와 `assets/template/js·css`는 앞부분만 읽었다.
분석 중 `video/script-to-motion/.git`(저장소 내부 git)을 사용자 승인으로 지우고 commit했다.
