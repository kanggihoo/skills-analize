# motion-broll 스킬은 에이전트를 어떻게 바꾸나 {#motion-broll-skill}

`motion-broll`을 쓰면 에이전트는 영상을 받자마자 코드를 짜지 않는다. 인터뷰 한 번과 영상 점검을 거쳐 클립 계획표를 만들고, 사용자가 승인한 뒤에야 첫 클립 코드를 쓴다. 클립은 끊기지 않는 도형 하나가 모양을 바꾸는 방식이고, 모든 변화는 화자가 말한 단어에 맞춘다.[](source:mb-intro)[](source:mb-approve)

- 계획표를 보여 주고 사용자가 승인하거나 고치기 전에는 어떤 클립 코드도 쓰지 않는다.[](source:mb-plan-table)[](source:mb-approve)
- 클립마다 풀프레임 컷어웨이, 빈 공간 패널, 아무것도 안 함 중 하나를 고르고 이유를 적는다.[](source:mb-direction)
- 숫자, 인용, 가격, 결과는 지어내지 않는다. 사용자가 준 실제 수치만 넣는다.[](source:mb-content)
- 산출물은 편집기에 넣을 클립이다. 함께 만드는 `preview.mp4`는 검토용이며 최종본이 아니다.[](source:mb-deliver)

@answer scope="motion-broll · 텍스트 23개 · 커밋 23e8047 · 실행 안 함 · 지시상 동작"
@meta locale=ko
@source mb-fm title="video/Barty-Bart/motion-broll/SKILL.md · 8941B · frontmatter" path=video/Barty-Bart/motion-broll/SKILL.md lines=1:4
@source mb-intro title="SKILL.md · 만드는 것과 폴더 구성" path=video/Barty-Bart/motion-broll/SKILL.md lines=6:19
@source mb-setup title="SKILL.md · 1단계 준비" path=video/Barty-Bart/motion-broll/SKILL.md lines=21:27
@source mb-interview title="SKILL.md · 2단계 인터뷰" path=video/Barty-Bart/motion-broll/SKILL.md lines=29:44
@source mb-inspect title="SKILL.md · 3단계 영상 점검" path=video/Barty-Bart/motion-broll/SKILL.md lines=46:58
@source mb-plan-table title="SKILL.md · 4단계 계획표" path=video/Barty-Bart/motion-broll/SKILL.md lines=60:64
@source mb-direction title="SKILL.md · 클립이 프레임을 얼마나 차지할지" path=video/Barty-Bart/motion-broll/SKILL.md lines=66:76
@source mb-content title="SKILL.md · 내용 규칙" path=video/Barty-Bart/motion-broll/SKILL.md lines=78:82
@source mb-approve title="SKILL.md · 계획 승인 대기" path=video/Barty-Bart/motion-broll/SKILL.md lines=84:84
@source mb-build title="SKILL.md · 5단계 제작" path=video/Barty-Bart/motion-broll/SKILL.md lines=86:94
@source mb-stills title="SKILL.md · 6단계 정지 화면 점검" path=video/Barty-Bart/motion-broll/SKILL.md lines=96:102
@source mb-render title="SKILL.md · 7단계 렌더" path=video/Barty-Bart/motion-broll/SKILL.md lines=104:113
@source mb-deliver title="SKILL.md · 8단계 전달" path=video/Barty-Bart/motion-broll/SKILL.md lines=115:131
@source mb-style title="SKILL.md · 스타일 기본값과 금지" path=video/Barty-Bart/motion-broll/SKILL.md lines=133:140
@source mb-gotchas title="SKILL.md · Gotchas" path=video/Barty-Bart/motion-broll/SKILL.md lines=142:149
@source mb-readme-out title="video/Barty-Bart/motion-broll/README.md · 3326B · 설치·사용 안내" path=video/Barty-Bart/motion-broll/README.md lines=10:20
@source mb-readme-req title="README.md · 요구 사항" path=video/Barty-Bart/motion-broll/README.md lines=28:32
@source mb-readme-how title="README.md · 동작 원리" path=video/Barty-Bart/motion-broll/README.md lines=50:54
@source api-intro title="video/Barty-Bart/motion-broll/reference/engine-api.md · 5994B · 클립 작성 규약" path=video/Barty-Bart/motion-broll/reference/engine-api.md lines=3:3
@source api-cam title="engine-api.md · 좌표와 카메라" path=video/Barty-Bart/motion-broll/reference/engine-api.md lines=40:40
@source api-vocab title="engine-api.md · 상호작용 어휘" path=video/Barty-Bart/motion-broll/reference/engine-api.md lines=73:89
@source api-plan title="engine-api.md · plan.json 스키마" path=video/Barty-Bart/motion-broll/reference/engine-api.md lines=91:106
@source sh-setup title="video/Barty-Bart/motion-broll/scripts/setup.sh · 1161B · 환경 준비" path=video/Barty-Bart/motion-broll/scripts/setup.sh lines=7:17
@source py-inspect-layout title="video/Barty-Bart/motion-broll/scripts/inspect_video.py · 2738B · 영상 점검" path=video/Barty-Bart/motion-broll/scripts/inspect_video.py lines=11:15
@source py-inspect-box title="inspect_video.py · PiP 상자 변화 경고" path=video/Barty-Bart/motion-broll/scripts/inspect_video.py lines=33:37
@source py-words title="video/Barty-Bart/motion-broll/scripts/words.py · 1169B · 단어 시각 추정" path=video/Barty-Bart/motion-broll/scripts/words.py lines=1:3
@source py-composite title="video/Barty-Bart/motion-broll/scripts/composite.py · 1231B · 미리보기 합성" path=video/Barty-Bart/motion-broll/scripts/composite.py lines=1:3
@source py-composite-cmd title="composite.py · ffmpeg 명령 조립" path=video/Barty-Bart/motion-broll/scripts/composite.py lines=7:13
@source py-pages title="video/Barty-Bart/motion-broll/scripts/make_pages.py · 3712B · 페이지와 TIMING.md" path=video/Barty-Bart/motion-broll/scripts/make_pages.py lines=33:37
@source py-build title="video/Barty-Bart/motion-broll/engine/build.py · 1711B · 클립을 HTML 하나로 조립" path=video/Barty-Bart/motion-broll/engine/build.py lines=1:2
@source js-render title="video/Barty-Bart/motion-broll/engine/render.js · 2591B · 프레임별 렌더" path=video/Barty-Bart/motion-broll/engine/render.js lines=1:2
@source js-render-enc title="render.js · 인코더 설정" path=video/Barty-Bart/motion-broll/engine/render.js lines=11:14
@source js-beats title="video/Barty-Bart/motion-broll/engine/beats.js · 1562B · 정지 화면 모음" path=video/Barty-Bart/motion-broll/engine/beats.js lines=1:1
@source js-motion title="video/Barty-Bart/motion-broll/engine/motion.js · 8760B · 모션 엔진" path=video/Barty-Bart/motion-broll/engine/motion.js lines=1:2
@source css-base title="video/Barty-Bart/motion-broll/engine/base.css · 1356B · 페이지 틀 스타일" path=video/Barty-Bart/motion-broll/engine/base.css
@source ofl title="video/Barty-Bart/motion-broll/engine/fonts/OFL-Geist.txt · 4368B · 글꼴 라이선스" path=video/Barty-Bart/motion-broll/engine/fonts/OFL-Geist.txt
@source ex-01 title="video/Barty-Bart/motion-broll/examples/opus-aoe2/01-opus-drop.html · 2791B · 예시 클립" path=video/Barty-Bart/motion-broll/examples/opus-aoe2/01-opus-drop.html
@source ex-02 title="video/Barty-Bart/motion-broll/examples/opus-aoe2/02-pip-builds.html · 8932B · 예시 패널 클립" path=video/Barty-Bart/motion-broll/examples/opus-aoe2/02-pip-builds.html
@source ex-03 title="video/Barty-Bart/motion-broll/examples/opus-aoe2/03-effort-slider.html · 2979B · 예시 클립" path=video/Barty-Bart/motion-broll/examples/opus-aoe2/03-effort-slider.html
@source ex-04 title="video/Barty-Bart/motion-broll/examples/opus-aoe2/04-master-prompt.html · 5172B · 예시 클립" path=video/Barty-Bart/motion-broll/examples/opus-aoe2/04-master-prompt.html
@source ex-05 title="video/Barty-Bart/motion-broll/examples/opus-aoe2/05-low-vs-max.html · 4186B · 예시 클립" path=video/Barty-Bart/motion-broll/examples/opus-aoe2/05-low-vs-max.html
@source ex-06 title="video/Barty-Bart/motion-broll/examples/opus-aoe2/06-chapter.html · 1066B · 예시 클립" path=video/Barty-Bart/motion-broll/examples/opus-aoe2/06-chapter.html
@source ex-plan title="video/Barty-Bart/motion-broll/examples/opus-aoe2/plan.json · 1606B · 예시 plan.json" path=video/Barty-Bart/motion-broll/examples/opus-aoe2/plan.json
@source tpl-viewer title="video/Barty-Bart/motion-broll/templates/viewer.html · 7109B · viewer 틀" path=video/Barty-Bart/motion-broll/templates/viewer.html lines=1:5
@source tpl-compare title="video/Barty-Bart/motion-broll/templates/compare.html · 10224B · compare 틀" path=video/Barty-Bart/motion-broll/templates/compare.html lines=1:5
@source se-desc title="video/Barty-Bart/sound-effects/SKILL.md · r03 확인용(description)" path=video/Barty-Bart/sound-effects/SKILL.md lines=3:3
@source se-cue title="sound-effects/SKILL.md · r03 확인용(cue 목록)" path=video/Barty-Bart/sound-effects/SKILL.md lines=62:62
@source os-desc title="video/Barty-Bart/object-separation/SKILL.md · r05 확인용(description)" path=video/Barty-Bart/object-separation/SKILL.md lines=3:3

## 언제 켜지고 무엇을 받아야 시작하나 {#trigger}

@code source=mb-fm language=yaml

- 호출 제한 필드가 없어서 모델이 `description`을 참고해 스킬을 켤 수 있다.[](source:mb-fm) 판정: `description`은 판단용 설명이지, 특정 단어가 있으면 켜지는 목록이 아니다.
- README는 사용자가 `/motion-broll`로 직접 부르는 길도 안내한다.[](source:mb-readme-out)
- "자막이 없으면 켜지지 않는다" 같은 활성화 제한은 원문에 명시 없음. `description`은 자막이 "ideally"(있으면 좋은 것)라고만 적는다.[](source:mb-fm)

에이전트는 `AskUserQuestion` 도구로 질문하되 한 라운드로 끝낸다. 사용자가 이미 답한 질문은 건너뛴다.[](source:mb-interview)

| 받는 것 | 규칙 |
| --- | --- |
| 영상 | 경로. `motion/work/source.*`로 복사하거나 참조한다[](source:mb-interview) |
| 자막 | SRT나 VTT가 가장 좋다. 평문뿐이면 `faster-whisper`로 단어 시각을 뽑거나 SRT를 요청한다[](source:mb-interview) |
| 밀도 | 세 단계 중 고른다. 기본은 보통(아래 표)[](source:mb-interview) |
| 룩 | 기본 팔레트 또는 사용자 브랜드. 브랜드는 로고·스크린샷·색을 `motion/inputs/`에 넣게 하고 에이전트가 읽는다[](source:mb-interview) |
| 피할 것·넣을 것 | 얼굴로 남길 대사, 보여 줄 실제 숫자나 이름, 재현할 제품 화면[](source:mb-interview) |

@facts id=density-facts
| 가벼움 | 분당 2~4개. 가장 강한 순간만[](source:mb-interview) |
| 보통(기본) | 분당 4~7개[](source:mb-interview) |
| 많음 | 대부분의 대사를 덮고, 얼굴이 나오는 짧은 틈을 둔다[](source:mb-interview) |

필요한 도구는 Node, Python 3, ffmpeg다. README는 Node 18 이상과 ProRes 인코더가 들어 있는 ffmpeg를 요구한다.[](source:mb-readme-req) `setup.sh`는 `node`, `ffmpeg`, `python3`가 PATH에 있는지만 확인하고 Node 버전은 확인하지 않는다.[](source:sh-setup)

@callout level=warning title="준비 단계가 설치를 하는데, 설치 전 승인 절차는 원문에 없다"
`SKILL.md`는 1단계를 "Node, Python 3, ffmpeg를 확인하고 Playwright와 Chromium을 `motion/node_modules`에 설치한다"고만 쓴다.[](source:mb-setup) `setup.sh`는 여기에 더해 `numpy`가 없으면 `pip install --user numpy`를 하고, 실패하면 `--break-system-packages`로 다시 설치한다.[](source:sh-setup) 이 pip 설치는 `SKILL.md` 설명에 나오지 않는다. 설치 전에 사용자에게 묻는다는 문장도 원문에 명시 없음. 이 분석에서는 어느 것도 실행하지 않았다.

## 어떤 순서로 일하고 사람은 어디서 개입하나 {#flow}

@workflow id=broll-flow title="motion-broll 8단계와 사람 개입 지점"
| lane prep | 준비 |
| lane plan | 계획 |
| lane make | 제작 |
| lane ship | 전달 |
| setup | 환경 준비 | backend | prep |
| ask | 인터뷰 | external | prep |
| look | 영상 점검 | backend | prep |
| plan | 클립 계획표 | backend | plan |
| ok | 계획 승인? | external | plan |
| build | 클립 제작 | backend | make |
| still | 정지 화면 점검 | backend | make |
| render | 렌더 | backend | make |
| out | 전달 | backend | ship |
| setup > ask | 첫 실행 |
| ask > look | |
| look > plan | |
| plan > ok | |
| ok > plan | 수정 요청 | dashed |
| ok > build | 승인 | emphasis |
| build > still | |
| still > build | 고친 뒤 | dashed |
| still > render | 이상 없음 |
| render > out | |

@steps id=broll-steps
| setup | 환경 준비 | 첫 실행에서만 `setup.sh ./motion`을 돌린다. `motion/` 안에 `clips`, `dist`, `out`, `work`를 만든다.[](source:mb-setup)[](source:sh-setup) | broll-flow | setup |
| ask | 인터뷰 | 한 라운드로 영상, 자막, 밀도, 룩, 피할 것을 묻는다.[](source:mb-interview) | broll-flow | ask |
| look | 영상 점검 | `inspect_video.py`로 해상도·fps·레이아웃 구간을 얻고 `contact.png`를 직접 본다. `words.py`로 단어 시각을 뽑는다.[](source:mb-inspect) | broll-flow | look |
| plan | 클립 계획표 | 클립마다 구간, 대사, 도형이 할 일, 처리 방식, 이유를 표로 보여 준다.[](source:mb-plan-table) | broll-flow | plan |
| ok | 계획 승인? | 사용자가 승인하거나 고칠 때까지 기다린다. 승인 전에는 코드를 쓰지 않는다.[](source:mb-approve) | broll-flow | ok |
| build | 클립 제작 | 클립마다 `motion/clips/NN-name.html` 조각을 쓰고 `build.py`로 `motion/dist/`에 만든다. 클립 안 시각 = 단어 시각 − 클립 시작점이다.[](source:mb-build) | broll-flow | build |
| still | 정지 화면 점검 | `beats.js`로 키 단어 시각의 정지 화면을 뽑아 에이전트가 직접 본다. 답답하거나 잘리거나 읽기 어렵거나 단어에서 어긋나면 고치고 한 번 더 본다.[](source:mb-stills) | broll-flow | still |
| render | 렌더 | `render.js`로 영상 fps에 맞춰 렌더한다. 패널은 `.mov`다.[](source:mb-render) | broll-flow | render |
| out | 전달 | `plan.json`을 쓰고 `composite.py`와 `make_pages.py`를 돌려 `motion/out/`에 모은다. 미리보기는 검토용이라고 분명히 말한다.[](source:mb-deliver) | broll-flow | out |

사람이 개입하는 곳은 세 군데다. 인터뷰, 계획 승인, 그리고 영상 점검에서 PiP 상자가 바뀐다는 경고가 나왔을 때 "의도한 변화인지" 묻는 것이다.[](source:mb-interview)[](source:mb-approve)[](source:mb-direction) 판정: 인터뷰는 "한 라운드"로 제한되지만 PiP 경고 질문은 그 뒤에 따로 생길 수 있어서, 원문 안에서 두 규칙이 같이 있다. 우선순위는 원문에 명시 없음.

종료 조건은 8단계 전달이다. 정지 화면 점검을 몇 번 반복하는지, 언제 멈추는지는 "고친 뒤 한 번 더 본다"는 말 외에 원문에 명시 없음.[](source:mb-stills) 렌더가 느리면 멀티코어 기기에서 클립 두 개를 병렬로 돌리라고 권한다.[](source:mb-render)

## 클립 하나를 어떻게 계획하나 {#plan-rules}

가장 중요한 판단은 클립이 프레임을 얼마나 차지하느냐다. 에이전트는 이것을 클립마다 정하고 이유를 계획표에 적는다.[](source:mb-direction)

| 처리 | 언제 | 규칙 |
| --- | --- | --- |
| 풀프레임 컷어웨이 | 프레임이 전부 화자이고, 대사가 제품·과정·비교·숫자·챕터 전환처럼 볼 만한 것을 말할 때 | 아이디어 길이만큼(3~10초) 컷어웨이하고 얼굴을 돌려준다. 컷어웨이 사이에는 얼굴을 약 2초 이상 둔다[](source:mb-direction) |
| 빈 공간 패널 | PiP 상자, 분할, 빈 영역처럼 편집이 이미 자리를 비워 둘 때 | 투명 클립(`bg:null`)을 빈 영역 중앙에 놓는다. 화자 상자와 모든 순간 겹치지 않게 크기를 잡는다. 화자가 계속 보이므로 15초 이상 하나의 연속 변형도 된다[](source:mb-direction) |
| 아무것도 안 함 | 대사가 화자 자신에 대한 것이거나, 다른 클립과 너무 가까울 때 | 얼굴을 그대로 둔다[](source:mb-direction) |

@callout level=warning title="컷어웨이를 하면 안 되는 자리"
후크의 첫 1초에는 컷어웨이하지 않는다. 개인적인 말, 감정적인 말, 의견을 말하는 대사에도 하지 않는다.[](source:mb-direction) `inspect_video.py`가 PiP 상자의 크기나 위치가 바뀐다고 경고하면, 에이전트는 의도한 변화인지 사용자에게 묻는다. 그런 뒤 가장 큰 상자에 맞춰 크기를 잡거나 변화 지점에서 패널을 나눈다.[](source:mb-direction)

내용 규칙은 다음과 같다.[](source:mb-content)

- 화자의 말에서 대상의 실제 물건(폴더, 터미널, 파일, 제품, 결과)을 뽑아 보여 준다. 각 아이디어는 인터랙션 어휘(알약과 클릭, 진행, 체크, 상태 섬, 드래그 카드, 슬라이더, 토글, 탭, 툴팁 차트, 검색·필터, 파일 드래그앤드롭, 터미널 타이핑, 나란히 비교, 챕터 카드)에 대응시킨다.[](source:api-vocab)
- 숫자, 인용, 가격, 결과는 절대 지어내지 않는다. 상대 길이의 막대, 뼈대 텍스트 줄, 자막에서 가져온 라벨을 쓰고, 예시용인 것은 목록으로 적는다. 실제 수치는 사용자가 줄 때만 넣는다.
- 클립 하나에 아이디어 하나. 이어지는 구간(PiP 구간 전체)은 상태가 여럿인 긴 클립 하나가 될 수 있다.
- 속도는 음악이 아니라 말에 맞춘다. 말의 박자마다 변화 하나, 간격은 약 0.4~1.2초다.

@facts id=timing-facts
| 단어 시각 오차 | SRT·VTT에서 추정한 값은 ±0.2초. 한 자막 안에서 흘러갈 수 있어 중요한 변화는 자막의 첫 단어나 마지막 단어에 둔다[](source:mb-inspect)[](source:mb-gotchas) |
| 단어 시각 추정 방식 | `words.py`가 각 자막 구간을 글자 수에 비례해 단어에 나눈다[](source:py-words) |
| 해상도·fps | 클립은 영상의 해상도와 fps에 맞춘다(의무형)[](source:mb-inspect) |
| 레이아웃 구간 | `full`, `pip`, `black` 셋으로 나뉜다[](source:mb-inspect) |

판정: `inspect_video.py`는 오른쪽이나 왼쪽 약 37.5%(96열 중 36열)가 거의 검은 구간만 `pip`로 본다(1초에 4프레임, 96×54로 줄인 회색 이미지에서 열 평균이 8 미만). 위나 아래가 비어 있는 레이아웃은 이 판별 대상이 아니다.[](source:py-inspect-layout) 상자 변화는 가장자리가 `2*W/96`px(너비의 약 2%)보다 크게 움직일 때 경고한다.[](source:py-inspect-box) `SKILL.md`가 말한 "PiP 상자, 분할, 빈 영역" 중 스크립트가 자동으로 찾아 주는 것은 좌우가 빈 경우뿐이다.

## 무엇을 금지하고 어디서 자주 깨지나 {#rules}

스타일 기본값은 사용자 브랜드가 있으면 그쪽이 이긴다.[](source:mb-style)

@facts id=style-facts
| 색 | 캔버스 `#E9E7E2`, 잉크 `#0B0B0B`, 흰 컴포넌트, 포인트 하나 `#FF5A1F`. 어두운 영상 위 패널은 밝은 도형(`#F4F2EE`)[](source:mb-style) |
| 글꼴·아이콘 | UI는 Geist, 코드·파일명·터미널은 Geist Mono. 아이콘은 한 세트에 선 굵기 하나(`M.icon`)[](source:mb-style) |
| 모션 | 스프링에 오버슈트는 아주 작게. 앞 가장자리와 뒤 가장자리는 서로 다른 스프링을 써서 표시자가 늘어나게 한다. 카메라는 각 상태가 프레임을 채우도록 확대한다[](source:mb-style) |
| 카메라 배율 | 카드 1.2~1.6, 알약 1.8~2.2가 대략의 기준[](source:api-cam) |

@callout level=warning title="금지 목록 (Banned)"
튀는 이징(bouncy easing), 파티클, 글로, UI 크롬에 그라데이션, 서로 다른 선 굵기의 아이콘, 죽은 시간, 템플릿처럼 보이는 것, 지어낸 데이터를 쓰지 않는다.[](source:mb-style) 원문은 이 목록을 "Banned"로 적었고 예외 조건은 명시하지 않았다.

Gotchas는 일곱 개이고 모두 원문에 있다.[](source:mb-gotchas)

| 주의점 | 이유와 대처 |
| --- | --- |
| 카메라가 확대하는 요소에 `will-change`를 걸지 않는다 | 글자가 흐리게 렌더된다 |
| 모양이 바뀌는 컨테이너 안에서 텍스트를 바꾸려면 따로 들어오고 나가는 시점을 준다 | `M.vis`의 `din`/`lin`/`lout`으로 정한다. 안 그러면 새 글자와 옛 글자가 겹친다 |
| `mix-blend-mode: difference` 라벨은 그 블렌드 모드를 직접 가진 레이어에 둔다 | 필터가 걸린 부모가 라벨을 고립시킨다 |
| 하이라이트 밑으로 미끄러지는 항목에는 `M.FAST` 스프링을 쓴다 | 안 그러면 하이라이트 행이 잠깐 비어 있다 |
| 모든 카메라 배율에서, 변형 도중에도 커서를 프레임 안에 둔다 | 커서가 프레임 밖으로 나가는 것을 고칠 대상으로 본다[](source:mb-stills) |
| SRT 단어 추정은 자막 안에서 흘러간다 | 중요한 변화는 자막의 첫 단어나 마지막 단어에 둔다 |
| 클립은 마지막 상태를 유지한 채 끝난다 | 슬롯이 더 길면 합성 단계가 마지막 프레임을 붙잡는다 |

## 무엇을 만들고, 엔진 자료는 어떻게 쓰라고 하나 {#outputs}

작업은 사용자 프로젝트 안의 `motion/` 폴더에서 한다.[](source:mb-intro) `SKILL.md`와 `setup.sh`가 가리키는 구조는 다음과 같다.

@tree id=motion-folder title="사용자 프로젝트의 motion 폴더"
| root | motion/ | - |
| inputs | inputs/ (브랜드 자료) | root |
| work | work/ (source, contact.png, video.json, words.txt) | root |
| clips | clips/ (NN-name.html) | root |
| dist | dist/ (빌드된 HTML) | root |
| out | out/ (클립, preview, 페이지) | root |
| plan | plan.json | root |
| deps | node_modules/ | root |

`inputs/`는 `SKILL.md`가 말하고, 나머지 네 폴더는 `setup.sh`가 만든다.[](source:mb-interview)[](source:sh-setup) `plan.json`은 8단계에서 `motion/plan.json`으로 쓴다.[](source:mb-deliver)

사용자가 받는 것은 모두 `motion/out/`에 있다.[](source:mb-deliver)

| 산출물 | 내용 |
| --- | --- |
| 클립 | 풀프레임은 MP4, 패널은 투명 ProRes 4444 `.mov`. 파일 이름 끝이 타임라인 시작점(`0m32s40` = 0:32.40)[](source:mb-render)[](source:mb-readme-out) |
| `preview.mp4` | 영상에 클립을 하드 컷으로 끼운 것. 원본 오디오[](source:mb-deliver) |
| `viewer.html` | 클립을 하나씩 넘겨 보는 페이지 |
| `compare.html` | 원본과 preview를 동기화해 나란히, 위아래, 와이프로 비교 |
| `TIMING.md` | 파일, 시작, 끝, 덮는 대사, 처리 방식, 예시용인 것의 목록[](source:mb-deliver)[](source:py-pages) |

`SKILL.md`는 이 자료들을 이렇게 쓰라고 한다.

| 자료 | `SKILL.md`의 지시 |
| --- | --- |
| `reference/engine-api.md` | 첫 클립을 쓰기 전에 읽는다(의무형). 클립은 `seek(t)`가 시간 `t`의 프레임을 그리는 HTML 조각이고, 스타일은 모두 `t`의 순수 함수다. CSS 트랜지션도 타이머도 없다[](source:mb-intro)[](source:api-intro) |
| `examples/opus-aoe2/` | 54초 영상용 완성 클립 6개. 품질 기준이자 출발점이다[](source:mb-intro)[](source:ex-plan) |
| `engine/` | `build.py`, `beats.js`, `render.js`를 단계마다 실행한다. 엔진 코드를 고치라는 말은 원문에 명시 없음[](source:mb-intro)[](source:mb-build) |
| `scripts/` | `setup.sh`, `inspect_video.py`, `words.py`, `composite.py`, `make_pages.py`를 단계마다 실행한다[](source:mb-intro) |
| `templates/` | `SKILL.md`는 이름을 직접 말하지 않는다. `make_pages.py`가 `viewer.html`과 `compare.html`의 틀로 읽는다[](source:py-pages)[](source:tpl-viewer) |

렌더와 합성에는 정해진 수치가 있다.

@facts id=render-facts
| 부표본 수 | 프레임당 4개, 180° 셔터에 걸쳐 찍고 ffmpeg가 섞어 모션 블러를 만든다[](source:mb-readme-how)[](source:js-render) |
| 렌더 속도 | 프레임당 부표본 4개라 실시간보다 느리다. 멀티코어에서는 클립 두 개를 병렬로[](source:mb-render) |
| 투명 클립 | `prores_ks` 프로파일 4, `yuva444p10le`. 투명 클립은 `.mov`여야 한다(의무형)[](source:js-render-enc)[](source:mb-render) |
| 불투명 클립 | `libx264`, `crf 14`, `yuv420p`[](source:js-render-enc) |
| preview 합성 | `libx264 crf 18`, 오디오 AAC 192k. 클립이 슬롯보다 짧으면 마지막 프레임을 붙잡는다[](source:py-composite-cmd) |
| ProRes 인코더 없음 | `setup.sh`가 "투명 패널 클립이 실패한다"고 알린다[](source:sh-setup) |

판정: `composite.py`는 클립을 크기 조정 없이 영상 위에 `overlay`한다. 그래서 "클립은 영상 해상도에 맞춘다"는 규칙은 스크립트가 아니라 에이전트가 지켜야 한다.[](source:py-composite-cmd)[](source:mb-inspect) 한편 `viewer.html`과 `compare.html`은 Google Fonts를 네트워크에서 불러온다. 오프라인에서 열면 글꼴만 대체 글꼴로 보일 수 있다는 점은 원문에 명시 없음.[](source:tpl-viewer)[](source:tpl-compare)

## 흐름 속 위치 {#position}

@workflow id=broll-position title="motion-broll 앞뒤의 스킬"
| broll | motion-broll | backend |
| sfx | sound-effects | backend |
| broll > sfx | plan.json | dashed |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| (앞) | 없음. 이 스킬은 묶음의 첫 단계다 | - | 앞 스킬을 부르는 문장은 원문에 명시 없음 | - |
| `sound-effects` | - | `plan.json` | 방향 주의: 읽는 쪽은 `sound-effects`다. cue 목록을 만들 때 "구성 소스에서 가져올 수 있으면" 가져오는 곳 중 하나로 motion-broll의 `plan.json`을 든다. 권고형이며 필수 순서가 아니다. 적용 대상 설명에도 motion-broll이 있다. `motion-broll`의 `SKILL.md`는 `sound-effects`를 부르지 않는다[](source:se-desc)[](source:se-cue) | r03 |
| `object-separation` | - | - | 같은 계열. 둘 다 사용자 영상을 가공한다. README가 "둘 중 하나 또는 둘 다 설치"를 안내한다. 두 `SKILL.md`는 서로를 부르지 않고 파이프라인 연결은 확인되지 않았다(미확인)[](source:mb-readme-req)[](source:mb-fm)[](source:os-desc) | r05 |

- 그림에는 r03만 점선으로 그렸다. 화살표는 "`sound-effects`가 `plan.json`을 읽을 수 있다"는 뜻이지, motion-broll이 `sound-effects`를 부른다는 뜻이 아니다.
- r05는 연결이 없어 그림에서 뺐고 표에만 남겼다.
- 전체 흐름은 `video/_group-talking-head-edit/talking-head-edit.html`에 있다. 관계 근거는 `video/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: 텍스트 23개, 합계 92,685바이트. `SKILL.md`, `README.md`, `reference/engine-api.md`, `scripts/` 5개, `engine/`의 `base.css`, `beats.js`, `build.py`, `motion.js`, `render.js`와 `OFL-Geist.txt`, `examples/opus-aoe2/`의 HTML 6개와 `plan.json`, `templates/` 2개다. 관계 확인을 위해 `sound-effects`와 `object-separation`의 `SKILL.md` 해당 줄을 읽었다.
- 제외한 파일: `engine/fonts/Geist-Variable.woff2`(69,652B)와 `GeistMono-Medium.woff2`(51,500B)는 바이너리라 읽었다고 하지 않는다. 번역본은 이 폴더에 없다.
- 엔진·예시 코드는 `SKILL.md`가 이것들을 어떻게 쓰라고 하는지를 중심으로 읽었다. `motion.js`의 스프링 수식과 예시 클립의 개별 레이아웃은 줄 단위로 설명하지 않았다.
- README의 `../../docs/demo-panel.gif`, `demo-cutaway.gif`는 열 수 없어 읽었다고 하지 않는다.[](source:mb-readme-out)
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(`relations.md` 확인).
- 관계 확인: r03은 `sound-effects` 3행과 62행에서 확인했고 원장과 같다. r05는 README 28행에서 확인했다.
- 실행하지 않았다. 페이지의 동작은 모두 지시상 동작이다. `setup.sh`, `ffmpeg`, `npx`, 렌더는 하나도 돌리지 않았다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
결과 영상이 실제로 좋은지, 클립 모션이 말한 단어에 맞는지는 확인하지 못했다. 영상 내용과 렌더 결과는 분석 대상이 아니고, 예시 클립도 실행하지 않았다. 설치 전 승인 절차, 정지 화면 점검의 반복 횟수 한계, 인터뷰 한 라운드와 PiP 경고 질문의 우선순위는 원문에 명시 없음.
