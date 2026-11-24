# motion-broll — 말하는 사람 영상과 자막에 맞춰 모션그래픽 B-roll을 만든다 {#overview}

`motion-broll`은 에이전트가 말하는 사람 영상과 자막을 분석해, 말의 박자에 맞춰 한 도형이 끊기지 않고 변형되는 모션그래픽 B-roll 클립과 미리보기·비교 페이지를 만드는 스킬이다.[](source:s-fm)[](source:s-intro)

- 모델 호출형 스킬로, 영상(과 자막)을 주며 모션그래픽, B-roll, 애니메이션 컷어웨이 또는 오버레이를 요청할 때 켜진다.[](source:s-fm)
- 결과로 풀프레임 컷어웨이(`.mp4`)와 투명 패널 클립(`.mov`), 합성 미리보기(`preview.mp4`), `viewer.html`, `compare.html`, `TIMING.md`, `plan.json`이 `motion/out/` 아래 남는다.[](source:s-p8)
- 다른 스킬과의 관계: `sound-effects`가 `cues.json`을 만들 때 이 스킬의 `plan.json`을 가져오도록 권고(`결과 전달`)하며, 같은 `Barty-Bart` 컬렉션의 `object-separation`과는 `대안` 관계다.[](source:rel-sfx)[](source:rel-obj)
- 4단계 클립 계획 표를 사용자에게 보여 승인받기 전에는 코드를 쓰지 않으며, 자막이나 사용자가 주지 않은 수치·결과를 지어내지 않는다.[](source:s-p4)

@answer scope="video/Barty-Bart/motion-broll · 원본 파일 11개(엔진·템플릿·예제 일부는 구조·표본만 확인) · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=f53b74e8bae4a9f9a8a11d2d3d0dc2b980b855ed
@source s-fm title="frontmatter: name, description" path=video/Barty-Bart/motion-broll/SKILL.md lines=1:4
@source s-intro title="원-셰이프 모션 스타일과 폴더 구성" path=video/Barty-Bart/motion-broll/SKILL.md lines=6:20
@source s-p1 title="1단계: setup.sh로 Playwright·Chromium 설치" path=video/Barty-Bart/motion-broll/SKILL.md lines=21:28
@source s-p2 title="2단계: 1라운드 인터뷰로 입력·밀도·브랜드 수집" path=video/Barty-Bart/motion-broll/SKILL.md lines=29:45
@source s-p3 title="3단계: 영상 레이아웃과 단어 타임스탬프 추출" path=video/Barty-Bart/motion-broll/SKILL.md lines=46:59
@source s-p4 title="4단계: 클립 계획·연출 결정 및 사용자 승인 대기" path=video/Barty-Bart/motion-broll/SKILL.md lines=60:85
@source s-p5 title="5단계: HTML 클립 조각 작성 및 build.py 빌드" path=video/Barty-Bart/motion-broll/SKILL.md lines=86:95
@source s-p6 title="6단계: beats.js 정지 화면 시트 검수" path=video/Barty-Bart/motion-broll/SKILL.md lines=96:103
@source s-p7 title="7단계: render.js 4서브프레임 모션 블러 렌더" path=video/Barty-Bart/motion-broll/SKILL.md lines=104:114
@source s-p8 title="8단계: plan.json 작성 및 미리보기·비교 페이지 전달" path=video/Barty-Bart/motion-broll/SKILL.md lines=115:132
@source s-style title="기본 색상·모션 스타일과 금지 요소, 함정 목록" path=video/Barty-Bart/motion-broll/SKILL.md lines=133:150
@source api-doc title="engine-api.md: 조각 구조, M API, 상호작용 어휘, plan.json" path=video/Barty-Bart/motion-broll/reference/engine-api.md lines=1:106
@source sh-setup title="setup.sh: 의존성 확인 및 Playwright 설치" path=video/Barty-Bart/motion-broll/scripts/setup.sh lines=1:18
@source py-insp title="inspect_video.py: PiP·full·black 레이아웃 감지" path=video/Barty-Bart/motion-broll/scripts/inspect_video.py lines=1:39
@source py-words title="words.py: SRT/VTT 글자 비례 단어 시각 추정" path=video/Barty-Bart/motion-broll/scripts/words.py lines=1:18
@source py-build title="build.py: 조각 HTML과 엔진·폰트 단일화" path=video/Barty-Bart/motion-broll/engine/build.py lines=1:21
@source js-beats title="beats.js: 지정 시각 정지 화면 컨택트 시트 생성" path=video/Barty-Bart/motion-broll/engine/beats.js lines=1:14
@source js-rend title="render.js: 180도 셔터 4서브프레임 캡처 및 ProRes/MP4 인코딩" path=video/Barty-Bart/motion-broll/engine/render.js lines=1:26
@source py-comp title="composite.py: 원본 영상에 클립 하드 컷 합성" path=video/Barty-Bart/motion-broll/scripts/composite.py lines=1:14
@source py-pages title="make_pages.py: viewer.html·compare.html·TIMING.md 생성" path=video/Barty-Bart/motion-broll/scripts/make_pages.py lines=1:38
@source readme-md title="README.md: 스킬 소개 및 작동 원리" path=video/Barty-Bart/motion-broll/README.md lines=1:59
@source rel-sfx title="sound-effects: motion-broll plan.json에서 cue 가져오기" path=video/Barty-Bart/sound-effects/SKILL.md lines=62:62
@source rel-obj title="object-separation: 사용자 영상 처리 대안" path=video/Barty-Bart/object-separation/SKILL.md lines=3:3

## 어떻게 동작하나 {#flow span=12}

1단계는 첫 실행에만 돌며, 이미 답을 준 질문은 2단계 인터뷰에서 건너뛴다.[](source:s-p1)[](source:s-p2)

@workflow id=flow-diagram title="motion-broll 흐름"
| lane prep | 준비·영상 분석 |
| lane plan | 계획·승인 |
| lane build | 제작·렌더·전달 |
| setup | 1. 환경 설치 | backend | prep | source:s-p1 |
| interview | 2. 1라운드 인터뷰 | backend | prep | source:s-p2 |
| inspect | 3. 영상·자막 분석 | backend | prep | source:s-p3 |
| plan | 4. 클립 계획·승인? | backend | plan | source:s-p4 |
| build | 5. 클립 작성·빌드 | backend | build | source:s-p5 |
| beats | 6. 정지 화면 검수 | backend | build | source:s-p6 |
| render | 7. 모션 블러 렌더 | backend | build | source:s-p7 |
| deliver | 8. 합성·결과 전달 | backend | build | source:s-p8 |
| setup > interview | Playwright 준비 |
| interview > inspect | 영상·자막·밀도 확보 |
| inspect > plan | 레이아웃·단어 시각 |
| plan > build | 사용자 승인 | emphasis |
| build > beats | dist/*.html 생성 |
| beats > build | 틀어짐 수정 | dashed |
| beats > render | 시트 통과 |
| render > deliver | MP4·MOV 완성 |

@steps id=flow-steps
| s-setup | 1. 환경 설치 | **입력** 대상 프로젝트 폴더 · **실행** `bash $SKILL/scripts/setup.sh ./motion` · **출력** `motion/` 폴더와 `node_modules` 내 Playwright·Chromium. **처리** Node·Python 3·ffmpeg(`prores_ks` 포함)을 확인하고 브라우저 렌더 환경을 한 번 설치한다.[](source:s-p1)[](source:sh-setup) | flow-diagram | setup |
| s-interview | 2. 1라운드 인터뷰 | **입력** 사용자 요청 · **출력** 영상 경로, 자막, 밀도(기본 분당 4~7개), 브랜드 색상·소재, 제외·포함 목록. **처리** `AskUserQuestion` 도구로 한 번에 묻되, 평문 자막만 있으면 `faster-whisper`나 SRT를 안내한다.[](source:s-p2) | flow-diagram | interview |
| s-inspect | 3. 영상·자막 분석 | **입력** `motion/work/source.mp4`와 자막 · **실행** `python3 $SKILL/scripts/inspect_video.py` 및 `words.py` · **출력** `contact.png`, `video.json`, `words.txt`. **처리** 영상의 해상도·fps·구간(`full`/`pip`/`black`)과 PiP(화면 속 화면) 박스 변동 여부를 뽑고 단어별 시각(±0.2초 오차)을 추정한다.[](source:s-p3)[](source:py-insp)[](source:py-words) | flow-diagram | inspect |
| s-plan | 4. 클립 계획·승인? | **입력** `video.json`과 `words.txt` · **참조** `reference/engine-api.md` · **출력** 클립별 구간·대사·처리 방식 표. **처리** 각 대사에 풀프레임 컷어웨이, 빈 공간의 투명 패널 클립, 또는 유지 중 하나를 고르고 사용자 승인을 기다린다.[](source:s-p4) **다음** PiP 박스가 바뀌면 의도된 것인지 먼저 묻는다.[](source:s-p4) | flow-diagram | plan |
| s-build | 5. 클립 작성·빌드 | **입력** 승인된 계획과 `reference/engine-api.md` · **실행** `python3 $SKILL/engine/build.py motion/dist motion/clips/*.html` · **출력** `motion/dist/NN-name.html`. **처리** `M.scene`과 `M.track`으로 클립 로컬 시간(`단어 시각 - in`)에 맞춰 상태가 변하는 HTML 조각을 쓰고 단일 HTML로 묶는다.[](source:s-p5)[](source:api-doc)[](source:py-build) | flow-diagram | build |
| s-beats | 6. 정지 화면 검수 | **입력** 빌드된 HTML과 핵심 단어 시각 · **실행** `NODE_PATH=./motion/node_modules node $SKILL/engine/beats.js` · **출력** `motion/work/NN.png` 컨택트 시트(정지 화면 모음). **처리** 각 상태가 안착한 시각과 변형 중간을 찍어 글자 잘림·박자 어긋남·커서 이탈을 직접 확인하고 고친다.[](source:s-p6)[](source:js-beats) | flow-diagram | beats |
| s-render | 7. 모션 블러 렌더 | **입력** 검수된 HTML과 원본 fps · **실행** `NODE_PATH=./motion/node_modules node $SKILL/engine/render.js` · **출력** `motion/out/NN-name_0m32s40.mp4` 또는 `.mov`. **처리** 180도 셔터 기준 프레임당 4서브프레임을 캡처해 ffmpeg `tmix`로 모션 블러를 입혀 렌더한다.[](source:s-p7)[](source:js-rend) **다음** `bg:null` 패널 클립은 ProRes 4444 알파 채널 유지를 위해 `.mov`로 내보낸다.[](source:s-p7)[](source:js-rend) | flow-diagram | render |
| s-deliver | 8. 합성·결과 전달 | **입력** 렌더 클립들과 `motion/plan.json` · **실행** `composite.py` 및 `make_pages.py` · **출력** `preview.mp4`, `viewer.html`, `compare.html`, `TIMING.md`. **처리** 원본 영상 위에 클립을 하드 컷으로 합성하고, 검토용 미리보기와 편집기 투입용 클립·타이밍 표를 전달한다.[](source:s-p8)[](source:py-comp)[](source:py-pages) | flow-diagram | deliver |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 호출형(`description` 참고). 말하는 사람 영상과 자막을 주며 모션그래픽·B-roll·컷어웨이·오버레이를 요청할 때 켜진다.[](source:s-fm) |
| 성격 | 절차형(8단계 모션그래픽 B-roll 제작). 영상 분석·계획 승인 뒤 자체 Playwright·ffmpeg 엔진으로 클립을 렌더링한다.[](source:s-intro) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `sound-effects` {#rel-r03} | **이 스킬** | 결과 전달 | `sound-effects`가 `cues.json`을 만들 때 구성 소스에서 가져올 수 있으면 이 스킬의 `plan.json`을 가져오라고 권고한다(필수 순서 아님).[](source:rel-sfx) |
| **이 스킬** {#rel-r05} | `object-separation` | 대안 | 두 스킬 모두 사용자 영상을 처리하며 `motion-broll`의 README가 둘 중 하나 또는 둘 다 설치를 안내하나, `SKILL.md` 간 직접 호출은 없고 연결은 미확인이다.[](source:readme-md)[](source:rel-obj) |

@architecture id=relation-map title="motion-broll과 이어지는 스킬"
| sfx | sound-effects | backend |
| self | motion-broll(이 스킬) | backend |
| obj | object-separation | backend |
| sfx > self | 결과 전달 |
| self > obj | 대안 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 8단계 워크플로, 컷어웨이·패널 연출 규칙, 스타일·함정 목록(150줄) | 스킬이 켜질 때 읽는다 | 1. 환경 설치, 2. 1라운드 인터뷰, 3. 영상·자막 분석, 4. 클립 계획·승인?, 5. 클립 작성·빌드, 6. 정지 화면 검수, 7. 모션 블러 렌더, 8. 합성·결과 전달 |
| `reference/engine-api.md` | HTML 조각 골격, `M.scene`·`M.track`·`M.vis` API, 상호작용 어휘, `plan.json` 스키마(106줄) | 첫 클립을 쓰기 전과 계획·전달 시 반드시 읽는다[](source:s-intro)[](source:api-doc) | 4. 클립 계획·승인?, 5. 클립 작성·빌드, 8. 합성·결과 전달 |
| `scripts/setup.sh` | Node·Python·ffmpeg 확인 및 `motion/node_modules` 설치(18줄) | 첫 실행 시 1회 실행한다[](source:s-p1)[](source:sh-setup) | 1. 환경 설치 |
| `scripts/inspect_video.py` | 해상도·fps 추출, `contact.png` 및 `full`/`pip`/`black` 레이아웃 JSON 생성(39줄) | 인터뷰로 영상 경로를 받은 뒤 실행한다[](source:s-p3)[](source:py-insp) | 3. 영상·자막 분석 |
| `scripts/words.py` | SRT/VTT 자막을 단어별 추정 시각(`words.txt`)으로 변환(18줄) | 자막 파일에서 단어 타이밍을 뽑을 때 실행한다[](source:s-p3)[](source:py-words) | 3. 영상·자막 분석 |
| `engine/build.py` | 클립 HTML 조각과 `motion.js`·`base.css`·Geist 폰트를 단일 HTML로 조립(21줄) | 클립 HTML 조각을 쓴 뒤 빌드할 때 실행한다[](source:s-p5)[](source:py-build) | 5. 클립 작성·빌드 |
| `engine/beats.js` | 지정 시각의 정지 화면을 캡처해 컨택트 시트 PNG로 저장(14줄) | 빌드된 HTML의 타이밍·레이아웃을 검수할 때 실행한다[](source:s-p6)[](source:js-beats) | 6. 정지 화면 검수 |
| `engine/render.js` | 4서브프레임 캡처와 ffmpeg `tmix` 모션 블러로 MP4/ProRes MOV 인코딩(26줄) | 검수를 통과한 클립을 최종 렌더링할 때 실행한다[](source:s-p7)[](source:js-rend) | 7. 모션 블러 렌더 |
| `scripts/composite.py` | `plan.json` 기준으로 원본 영상 위에 클립을 하드 컷 합성(14줄) | 모든 클립 렌더 후 `preview.mp4`를 만들 때 실행한다[](source:s-p8)[](source:py-comp) | 8. 합성·결과 전달 |
| `scripts/make_pages.py` | `viewer.html`, `compare.html`, `TIMING.md` 생성(38줄) | `preview.mp4` 생성 직후 실행한다[](source:s-p8)[](source:py-pages) | 8. 합성·결과 전달 |
| `README.md` | 스킬 소개, 설치, 작동 원리 안내 문서(59줄) | 사람 독자용 안내 문서다[](source:readme-md) | - |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 4단계 클립 계획을 세운 뒤 | 사용자가 계획 표를 승인하거나 수정하기 전에는 클립 코드를 작성하지 않는다. | [](source:s-p4) |
| PiP 박스가 영상 도중 크기·위치가 바뀔 때 | 변경이 의도된 것인지 사용자에게 먼저 묻고, 가장 큰 박스 기준으로 맞추거나 패널을 나눈다. | [](source:s-p4)[](source:py-insp) |
| 클립 안의 숫자·인용구·결과를 채울 때 | 수치를 지어내지 않고 자막 단어·상대 막대·스켈레톤 줄만 쓰며, 실제 수치는 사용자가 줄 때만 넣는다. | [](source:s-p4)[](source:s-style) |
| 풀프레임 컷어웨이를 배치할 때 | 훅 첫 1초와 개인·감정·의견 대사는 피하고, 컷어웨이 사이에 최소 약 2초의 얼굴 노출을 남긴다. | [](source:s-p4) |
| 투명 패널 클립(`bg:null`)을 렌더할 때 | 알파 채널 보존을 위해 `.mov`(ProRes 4444)로 내보내며, 어두운 배경 위에서는 `#F4F2EE` 밝은 도형을 쓴다. | [](source:s-p7)[](source:s-style) |
| 모션·렌더링 구현 품질 규칙 | 바운시 이징·파티클·글로우·그라데이션·`will-change` 스케일·커서 화면 이탈·빈 시간을 금지한다. | [](source:s-style) |
| 8단계 결과물을 전달할 때 | `preview.mp4`는 검토용 하드 컷임을 밝히고, 최종 편집은 사용자 편집기에서 하도록 안내한다. | [](source:s-p8) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- `M.scene`·`M.track`·`M.vis` 엔진 API와 14종 상호작용 어휘 — 맡을 개요 항목: 5. 클립 작성·빌드 · 닫힌형(closed-form) 스프링 합산, 앵커 기준 좌표, 6개 `examples/opus-aoe2/` 패턴이 길어서 뺐다.
- `viewer.html`·`compare.html` 생성과 `TIMING.md` 포맷 — 맡을 개요 항목: 8. 합성·결과 전달 · ProRes `.mov`의 브라우저용 `_preview.mp4` 변환과 동기화 비교 UI 세부 구현을 뺐다.

읽은 원본: 텍스트 파일 11개(`SKILL.md`, `README.md`, `reference/engine-api.md`, `scripts/*.py`, `scripts/setup.sh`, `engine/build.py`, `engine/beats.js`, `engine/render.js`). 제외: `engine/motion.js`·`engine/base.css`·`templates/*.html`·`examples/opus-aoe2/*`(구조만 확인), `engine/fonts/*.woff2`(바이너리).
