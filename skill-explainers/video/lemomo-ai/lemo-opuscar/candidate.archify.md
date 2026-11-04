# lemo-opuscar 스킬은 에이전트를 어떻게 바꾸나 {#lemo-opuscar-skill}

`lemo-opuscar`를 쓰면 에이전트는 영상을 직접 설계하기 전에, 외부 Lemo-Opuscar 라이브러리를 내려받고 그 안의 `AGENTS.md`를 읽어 시키는 대로 따른다. 이 스킬 자체는 입구일 뿐이다. 스타일 고르기, 질문, treatment(연출 계획), 제작 규칙은 라이브러리에 있고 이 저장소에는 없어서 **부분 분석**이다.[](source:sk-intro)[](source:sk-s3)

- 에이전트는 `setup.sh`로 라이브러리를 받고, 핵심 도구 설치(`deps`)를 곧바로 시작한다. 스타일 선택보다 앞선다.[](source:sk-s1)[](source:sk-s2)
- 시스템 도구(Node, ffmpeg, Python)가 없으면 에이전트는 설치하지 않고 한 번의 질문에서 알린다.[](source:sk-s2)
- 영상 연출 규칙은 `$LIB/AGENTS.md`, `$LIB/DIRECTOR.md`에 있다. 이 페이지는 그 내용을 확인하지 못했다.[](source:sk-s3)[](source:sk-deliver)
- 기존 영상을 단순히 자르거나 변환하는 요청에는 쓰지 않는다고 `description`이 밝힌다.[](source:sk-fm)

@answer scope="video/lemomo-ai/lemo-opuscar · 원본 텍스트 2개 · 커밋 23e8047 · 라이브러리 내용 미확인(부분 분석) · 지시상 동작"
@meta locale=ko
@source sk-fm title="video/lemomo-ai/lemo-opuscar/SKILL.md · 3452B · 스킬 본문과 frontmatter" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=1:4
@source sk-intro title="SKILL.md · 스킬의 역할" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=8:8
@source sk-s1 title="SKILL.md · 1단계 라이브러리 확보" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=10:10
@source sk-s2 title="SKILL.md · 2단계 핵심 도구 설치" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=11:11
@source sk-s3 title="SKILL.md · 3단계 라이브러리 따르기" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=12:12
@source sk-folder title="SKILL.md · 스킬 모드의 프로젝트 폴더" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=18:18
@source sk-run title="SKILL.md · 스킬 모드의 도구 실행" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=19:19
@source sk-pages title="SKILL.md · 스킬 모드의 페이지 경로" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=20:20
@source sk-build title="SKILL.md · 스킬 모드의 스크립트 경로" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=21:21
@source sk-demo title="SKILL.md · 스킬 모드의 데모 소스" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=22:22
@source sk-deliver title="SKILL.md · 전달" path=video/lemomo-ai/lemo-opuscar/SKILL.md lines=24:24
@source su-head title="video/lemomo-ai/lemo-opuscar/scripts/setup.sh · 6845B · 라이브러리 설치 스크립트" path=video/lemomo-ai/lemo-opuscar/scripts/setup.sh lines=1:9
@source su-repo title="setup.sh · 저장소 주소" path=video/lemomo-ai/lemo-opuscar/scripts/setup.sh lines=11:11
@source su-libsel title="setup.sh · 라이브러리 위치 고르기" path=video/lemomo-ai/lemo-opuscar/scripts/setup.sh lines=13:19
@source su-sparse title="setup.sh · sparse 체크아웃 범위" path=video/lemomo-ai/lemo-opuscar/scripts/setup.sh lines=21:27
@source su-managed title="setup.sh · 자체 clone 갱신" path=video/lemomo-ai/lemo-opuscar/scripts/setup.sh lines=29:33
@source su-clone title="setup.sh · 새로 clone" path=video/lemomo-ai/lemo-opuscar/scripts/setup.sh lines=34:41
@source su-pyfind title="setup.sh · Python 선택" path=video/lemomo-ai/lemo-opuscar/scripts/setup.sh lines=51:57
@source su-deps title="setup.sh · deps 하위 명령" path=video/lemomo-ai/lemo-opuscar/scripts/setup.sh lines=60:85
@source su-demo title="setup.sh · demo 하위 명령" path=video/lemomo-ai/lemo-opuscar/scripts/setup.sh lines=86:93
@source su-miss title="setup.sh · 시스템 도구 점검" path=video/lemomo-ai/lemo-opuscar/scripts/setup.sh lines=96:108

## 언제 켜지고 언제 쓰면 안 되나 {#trigger}

@code source=sk-fm language=yaml

이 스킬에는 호출 제한 필드가 없어서, 모델이 `description`을 참고해 켤 수 있다.[](source:sk-fm) 판정: `description`은 판단용 설명이고, 이름 붙은 스타일이나 중국어 표기가 있으면 켜지는 목록이 아니다. 중국어 표기의 한국어 풀이는 분석자가 붙인 것이다. 油画厚涂는 두껍게 바른 유화, 水彩笔刷는 수채 붓질, 浮世绘는 우키요에, 卫星简报는 위성 브리핑, 产品拆解는 제품 분해다.

아래 표는 `description`이 내세운 분기마다 본문이 어디까지 다루는지 대조한 결과다.

| `description`의 분기 | 본문에서 다루는 곳 | 확인 범위 |
| --- | --- | --- |
| 이름 붙은 스타일로 영상·단편·애니메이션·홍보 영상(视频、短片、动画、宣传片) | 1~3단계 전체. 스타일은 라이브러리에서 찾는다[](source:sk-s3) | 라이브러리 안의 스타일 목록과 규칙은 확인하지 못했다 {caution:부분} |
| 위성 이미지·레이저 스캔·CAD·아카이브 스캔으로 만드는 데이터 해설·과학 설명·제품 분해(数据解说、科普、产品拆解) | 전용 단계 원문에 명시 없음 | 본문에는 이 자료를 직접 말하는 줄이 없다 {bad:본문 없음} |
| 기록 영상·문서로 새 영상 편집(剪辑与纪实, 예: 用档案影像剪一支新闻片, 기록 영상으로 뉴스 영상 편집) | 22행의 예외 한 줄: "Edit & Documentary" 스타일은 treatment 전에 데모 소스를 받아, 그 `STYLE.md`가 가리키는 `demo/tools/`의 소재 도구를 쓴다[](source:sk-demo) | 어떤 스타일이 이 갈래인지, 위성·CAD 요청이 여기에 드는지는 원문에 명시 없음 {caution:부분} |
| 주제는 있고 스타일을 못 정함: 고르도록 돕는다 | 3단계 "finding the style"[](source:sk-s3) | 돕는 방법은 `$LIB/AGENTS.md`에 있어서 확인하지 못했다 {caution:부분} |
| 스타일을 자기 것으로 바꾸기·빈 페이지에서 시작·저장한 내 스타일(改风格、从空白开始、我的风格) | 3단계 "making their own", 사용자 스타일 폴더 `~/lemo-my-styles/`[](source:sk-s3) | 만드는 절차는 라이브러리에 있다. 이 폴더에 쓰는 시점은 원문에 명시 없음 {caution:부분} |
| 아무 말 없이 스킬만 시작 | 3단계: 언어 질문을 먼저 하고 그다음 시작 방법을 보여 준다[](source:sk-s3) | 질문 문구와 선택지는 확인하지 못했다 {caution:부분} |
| 어떤 영상 스타일이 있는지 질문 | 원문에 명시 없음. `setup.sh`의 사용법 문구가 슬러그 목록을 `$LIB/styles/README.md`라고 적을 뿐이다[](source:su-demo) | 목록 내용은 확인하지 못했다 {bad:본문 없음} |
| 쓰지 않는 경우: 기존 영상 파일의 단순 편집·자르기·변환 | `description`의 마지막 문장뿐이다[](source:sk-fm) | 본문에 이 요청을 걸러 내는 단계는 원문에 명시 없음 |

- 활성화 제한: `description`의 "Not for plain editing, trimming or converting the user's existing video files"가 전부다. 호출 제한 필드는 없다.[](source:sk-fm)
- 영상 길이·해상도·장수 같은 수치는 원문에 명시 없음. `description`은 "short film"이라고만 쓴다.[](source:sk-fm)
- 같은 계열: `video/Barty-Bart/explainer-default`도 설명·홍보 영상을 코드로 만든다. 직접 연결은 없고 이 스킬은 이름 붙은 스타일을 고르는 방식이다(`r13`, 추론, 관계 원장 `video/relations.md`).

## 에이전트는 무엇을 순서대로 하나 {#flow}

@workflow id=opuscar-flow title="lemo-opuscar 진행 순서"
| get | 라이브러리 받기 | backend |
| deps | 핵심 도구 설치 | backend |
| read | AGENTS.md 읽기 | backend |
| lib | 스타일·질문·제작 | external |
| out | 결과 전달 | backend |
| get > deps | |
| deps > read | 병행 가능 |
| read > lib | 따른다 | emphasis |
| lib > out | |

@steps id=opuscar-steps
| get | 라이브러리 받기 | 에이전트가 `sh "<skill base directory>/scripts/setup.sh"`를 실행한다. 라이브러리를 clone하거나 갱신하고, 마지막 줄에 `LIB=<path>`를 찍는다.[](source:sk-s1) | opuscar-flow | get |
| deps | 핵심 도구 설치 | 에이전트가 `setup.sh deps`를 바로 시작한다. 처음에는 몇 분 걸리므로 가능하면 뒤에서 돌린다. 목소리와 음악이 필요한 영상이면 나중에 `deps voice`나 `deps music`을 더한다.[](source:sk-s2) | opuscar-flow | deps |
| read | AGENTS.md 읽기 | 에이전트가 `$LIB/AGENTS.md`를 읽고 시키는 대로 한다. 첫 항목은 "Start"다.[](source:sk-s3) | opuscar-flow | read |
| lib | 스타일·질문·제작 | 스타일 찾기나 만들기, 질문 한 번, treatment, 제작, 전달이 라이브러리 쪽 순서다. 이 페이지는 그 내용을 열어 보지 못했다.[](source:sk-s3) | opuscar-flow | lib |
| out | 결과 전달 | 에이전트가 `$LIB/DIRECTOR.md` §11이 적은 산출물을 프로젝트 폴더에 두고 위치를 알린다.[](source:sk-deliver) | opuscar-flow | out |

스킬 모드에서 라이브러리 안내문의 경로를 바꿔 읽는 규칙은 아래와 같다.

| 항목 | 규칙 |
| --- | --- |
| 프로젝트 폴더 | 사용자가 시작한 폴더 안의 `<name>/`. 이름은 소문자·숫자·하이픈이고 경로에 `#`, `?`를 피한다. 안내문의 `films/<name>/`은 이 폴더로 읽는다.[](source:sk-folder) |
| 도구 실행 | `$LIB`에서, 프로젝트의 절대 경로를 넘겨 실행한다. 예: `cd "$LIB" && node core/render/still.mjs "<project>" 1.5 3`.[](source:sk-run) |
| 페이지에서 라이브러리 파일 | 절대 URL(`/core/lib.js`, `/node_modules/three/…`)을 쓴다. 프로젝트는 `/@film/`로 서빙된다.[](source:sk-pages) |
| 스크립트·`build.sh`에서 | `$LIB/…`를 쓰고 `build.sh` 맨 위에 `LIB=<path>`를 둔다. `../..`는 쓰지 않는다.[](source:sk-build) |
| 데모 소스 | 받지 않는다. `TREATMENT.md`를 쓴 뒤에만 `setup.sh demo <slug>`로 받아 기법을 읽고, 렌더링 대상이 아니다. Edit & Documentary 스타일만 예외로 treatment 전에 받는다.[](source:sk-demo) |

@callout level=warning title="사람이 개입하는 곳과 개입이 없는 곳"
사람이 끼는 곳은 "one round of questions"(질문 한 번)와 시스템 도구 부족 보고다. 에이전트는 Node, ffmpeg, Python 같은 시스템 소프트웨어를 스스로 설치하지 않는다. 스타일이 요구하는 패키지(`STYLE.md`가 나열)는 에이전트가 프로젝트 폴더에 직접 설치한다.[](source:sk-s2) 외부 저장소 clone과 `deps` 설치를 시작하기 전에 사용자 승인을 받으라는 말은 원문에 명시 없음. 사용자 승인 지점, 스킬 자체의 종료 조건과 재시도 횟수도 원문에 명시 없음. 끝은 "전달 후 위치 알림"뿐이다.[](source:sk-deliver)

## setup.sh는 무엇을 내려받고 설치하나 {#setup}

`setup.sh`는 이 스킬이 가진 유일한 스크립트다. 에이전트는 이 스크립트를 실행하라고 지시받는다. 이 분석에서는 실행하지 않았고 줄만 읽었다. 아래 내용은 모두 코드상의 동작이다.

| 하위 명령 | 하는 일 |
| --- | --- |
| (인자 없음) | 라이브러리를 clone하거나 갱신하고, 시스템 도구 점검 결과와 `LIB=<path>`를 출력한다.[](source:su-head)[](source:su-miss) |
| `deps` | `npm install`, 헤드리스 브라우저(`chromium-headless-shell`) 설치, `.venv` 만들기, Python 패키지 설치를 한다. `voice`를 더하면 TTS 모델도 `tools/fetch.sh voice`로 받는다.[](source:su-deps) |
| `demo <slug>` | 그 스타일의 데모 소스와 포스터를 sparse 체크아웃에 추가한다. 참고용이다.[](source:su-demo) |

- 원격: 기본 `https://github.com/lemomo-ai/lemo-opuscar.git`이고 `LEMO_OPUSCAR_REPO`로 바꿀 수 있다.[](source:su-repo) 브랜치는 `main`이다. 커밋이나 태그 고정은 원문에 명시 없음.[](source:su-clone)
- 위치 우선순위: `LEMO_OPUSCAR_HOME`, 지금 서 있는 clone(`AGENTS.md`와 `core/render`가 있을 때), `~/lemo-opuscar` 순이다.[](source:su-libsel)
- 받는 범위: depth 1 sparse clone이다. 데모 소스, 갤러리(`styleboard/`), 큰 이미지는 빼고 가이드·`core/`·모든 `STYLE.md`만 받는다. 큰 자산은 `tools/fetch.sh`로 받는다.[](source:su-head)[](source:su-sparse)

@workflow id=setup-flow title="setup.sh의 라이브러리 확보 분기"
| managed | 자체 clone인가? | backend |
| update | main으로 맞춤 | backend |
| islib | 이미 라이브러리인가? | backend |
| asis | 그대로 사용 | backend |
| empty | 폴더가 비었나? | backend |
| clone | sparse clone | backend |
| stop | 중단 | security |
| managed > update | 예 |
| managed > islib | 아니오 |
| islib > asis | 예 |
| islib > empty | 아니오 |
| empty > clone | 예 |
| empty > stop | 아니오 | security |

@steps id=setup-steps
| managed | 자체 clone인가? | `git config lemo.managed`가 `true`이면 `setup.sh`가 만든 clone이다. 이 clone에는 사용자 파일이 없다고 보고 `origin`을 `main`에 맞춘다.[](source:su-managed) | setup-flow | managed |
| update | `main`으로 맞춤 | `git fetch --depth 1 origin main` 뒤 `reset --hard FETCH_HEAD`를 한다. 실패하면(오프라인 등) 알리고 로컬 복사본을 쓴다.[](source:su-managed) | setup-flow | update |
| islib | 이미 라이브러리인가? | `AGENTS.md`와 `core/render`가 있으면 라이브러리다. 사용자가 직접 받은 clone이면 이 경로로 가고 갱신하지 않는다.[](source:su-libsel)[](source:su-clone) | setup-flow | islib |
| empty | 폴더가 비었나? | 폴더가 있는데 비어 있지 않고 라이브러리도 아니면 `LEMO_OPUSCAR_HOME`을 바꾸라는 메시지와 함께 종료한다. `git`이 없어도 종료한다.[](source:su-clone) | setup-flow | empty |
| clone | sparse clone | `git clone --depth 1 --filter=blob:none --sparse --branch main`으로 받고 `lemo.managed`를 `true`로 표시한다.[](source:su-clone) | setup-flow | clone |

@facts id=setup-limits
| 시스템 도구 요구(점검만, 설치 안 함) | Node 20+, ffmpeg 7+(버전을 읽을 수 있을 때), Python 3.11+ 또는 `uv`. 없으면 `! missing:`을 찍고 계속 진행한다[](source:su-miss) |
| `deps` 선결 조건 | `npm`이 없으면 종료한다(Node 20+ 설치 안내). Python 3.11+도 `uv`도 없으면 종료한다[](source:su-deps) |
| Python 선택 순서 | 3.12, 3.13, 3.11, 기본 `python3`. 이유는 주석 한 줄이다: voice 단계의 `kokoro-onnx`가 3.14 미만을 요구한다[](source:su-pyfind) |
| 설치 시간 | "몇 분"(첫 실행). 단위가 분이라는 것 외의 수치는 원문에 명시 없음[](source:sk-s2) |

@callout level=warning title="판정: 외부 `main`의 지시를 따르는 구조다"
판정: 에이전트는 매번 `main`의 최신본을 받아(자체 clone이면 `reset --hard`) 그 안의 `AGENTS.md`를 "do what it says"로 따른다.[](source:sk-s3)[](source:su-managed) 이 저장소에는 라이브러리가 없어서, 어떤 지시가 오는지 이 스킬만으로는 알 수 없다. 받은 뒤 `deps`가 `npm install`로 외부 패키지를 설치하고 헤드리스 브라우저를 내려받는다.[](source:su-deps) 이 스킬 자체가 업데이트마다 바뀌는 외부 지시에 의존한다는 점이 핵심 위험이다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: 텍스트 2개, 합계 10,297B. `SKILL.md` 3,452B, `scripts/setup.sh` 6,845B. 둘 다 원본이고 번역본은 없다.
- 제외한 파일: 없다. 폴더에 바이너리도 없다.
- 설치 기록: 이 스킬의 출처는 한 단계 위 폴더의 `skills-lock.json`이 `lemomo-ai/lemo-opuscar`의 `plugin/skills/lemo-opuscar/SKILL.md`로 적고 있다. 원격 저장소 자체는 열지 않았다.
- 실행하지 않았다. `setup.sh`와 `deps`, 렌더 명령은 모두 지시상 동작으로만 읽었다.
- 원문 대조: 활성화 제한 2개(호출 제한 필드 없음, `description`의 제외 문장), 강제 6개(1~3단계, 시스템 도구 비설치, 프로젝트 폴더·경로 규칙 5행, 데모 소스 규칙), 수치 5개(Node 20+, ffmpeg 7+, Python 3.11+, 3.14 미만, "몇 분"), 종료 조건 1개(전달 후 위치 알림)를 줄 단위로 대조했다. `setup.sh` 분기는 줄 단위로 읽었다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것: 부분 분석"
`$LIB/AGENTS.md`, `$LIB/DIRECTOR.md` §11, `$LIB/TECHNIQUE.md` §1, `$LIB/styles/README.md`, 각 `STYLE.md`는 외부 저장소(github.com/lemomo-ai/lemo-opuscar)에 있고 이 저장소에는 없다. 그래서 스타일 목록, 스타일을 못 정한 사용자를 돕는 방법, 내 스타일 만들기, 질문 한 번의 내용, 산출물 목록, 위성 이미지·레이저 스캔·CAD·아카이브 자료를 쓰는 흐름이 실제로 어떻게 진행되는지 확인하지 못했다. 영상 결과물이 실제로 어떻게 보이는지도 확인하지 못했다. 그 내용은 분석 대상에서 뺐다.
