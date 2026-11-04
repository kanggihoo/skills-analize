# object-separation 스킬은 에이전트를 어떻게 바꾸나 {#object-separation-skill}

`object-separation`을 쓰면 에이전트는 사용자 컴퓨터에서 SAM 2로 영상 속 피사체 하나를 배경에서 분리한다. 먼저 기기를 점검해 모델 크기를 고르고 그 결과를 사용자에게 알린다. 결과는 피사체가 초록색으로 표시된 영상과 프레임마다 저장된 마스크다. 영상 편집이나 배경 교체까지는 이 스킬이 하지 않는다.[](source:os-intro)[](source:os-output)

- 모델 크기는 GPU 종류와 메모리로 정한다. NVIDIA 12GB 이상이면 `large`(898MB), 그 아래거나 Apple Silicon이면 `base-plus`(323MB), GPU가 없으면 `tiny`(156MB)다.[](source:os-model)
- GPU가 없으면 프레임당 약 5초가 든다. 긴 클립이면 필요한 부분만 분리하라고 제안한다.[](source:os-model)
- 짧은 구간(약 20프레임)을 먼저 돌려 확인하고 나서 전체 구간을 돌린다.[](source:os-chunk)
- 전부 지울 수 있게 가상환경 폴더 하나에 설치하고, 끝나면 지우는 법을 알려 준다.[](source:os-setup)[](source:os-clean)

@answer scope="object-separation · 텍스트 2개 · 커밋 23e8047 · 실행 안 함 · 영상 결과 미확인 · 지시상 동작"
@meta locale=ko
@source os-fm title="video/Barty-Bart/object-separation/SKILL.md · 9414B · frontmatter" path=video/Barty-Bart/object-separation/SKILL.md lines=1:4
@source os-intro title="SKILL.md · 목적과 코드 블록 안내" path=video/Barty-Bart/object-separation/SKILL.md lines=6:10
@source os-setup title="SKILL.md · 1단계 가상환경 설치" path=video/Barty-Bart/object-separation/SKILL.md lines=12:21
@source os-model title="SKILL.md · 2단계 모델 표와 속도" path=video/Barty-Bart/object-separation/SKILL.md lines=23:33
@source os-params title="SKILL.md · 사용자가 정하는 값" path=video/Barty-Bart/object-separation/SKILL.md lines=35:41
@source os-scan title="SKILL.md · 기기 점검 코드와 작업 폭" path=video/Barty-Bart/object-separation/SKILL.md lines=44:60
@source os-points title="SKILL.md · 3단계 클릭 점 고르기" path=video/Barty-Bart/object-separation/SKILL.md lines=62:64
@source os-chunk title="SKILL.md · 4단계 분리와 청크" path=video/Barty-Bart/object-separation/SKILL.md lines=85:87
@source os-chunk-code title="SKILL.md · 분리 코드" path=video/Barty-Bart/object-separation/SKILL.md lines=89:123
@source os-render title="SKILL.md · 5단계 초록색 영상" path=video/Barty-Bart/object-separation/SKILL.md lines=125:151
@source os-output title="SKILL.md · 결과 확인과 전달" path=video/Barty-Bart/object-separation/SKILL.md lines=153:155
@source os-clean title="SKILL.md · 6단계 정리" path=video/Barty-Bart/object-separation/SKILL.md lines=157:161
@source os-notes title="SKILL.md · Notes" path=video/Barty-Bart/object-separation/SKILL.md lines=163:168
@source osr-intro title="video/Barty-Bart/object-separation/README.md · 2140B · 안내" path=video/Barty-Bart/object-separation/README.md lines=3:7
@source osr-does title="README.md · 하는 일" path=video/Barty-Bart/object-separation/README.md lines=9:23
@source osr-req title="README.md · 사용법과 요구 사항" path=video/Barty-Bart/object-separation/README.md lines=27:29
@source mb-readme title="video/Barty-Bart/motion-broll/README.md · r05 확인용" path=video/Barty-Bart/motion-broll/README.md lines=28:28
@source mb-desc title="video/Barty-Bart/motion-broll/SKILL.md · r05 확인용(description)" path=video/Barty-Bart/motion-broll/SKILL.md lines=3:3

## 언제 켜지고 무엇을 입력받나 {#trigger}

@code source=os-fm language=yaml

- 호출 제한 필드가 없어서 모델이 `description`을 참고해 스킬을 켤 수 있다.[](source:os-fm) 판정: `description`은 판단용 설명이지, 특정 단어가 있으면 켜지는 목록이 아니다.
- README는 "use object-separation to separate me from the background in clip.mp4"처럼 부르라고 안내한다.[](source:osr-req)
- 활성화 제한은 원문에 명시 없음. 한 번에 피사체 하나만 분리한다고 적는다.[](source:os-intro)

사용자에게서 받는 값은 코드 블록 맨 위에 있다. 에이전트가 사용자 요청에서 채운다.[](source:os-params)

| 값 | 규칙 |
| --- | --- |
| `VIDEO` | 영상 경로. 프레임 번호가 0부터이고 영상은 고정 프레임률(constant frame rate)이어야 한다[](source:os-params) |
| `START`, `END` | 분리할 프레임 범위. 예시는 `0, 89`(30fps면 3초). 클릭 점은 `START` 프레임에서 고른다[](source:os-params) |
| `PTS` | 960 픽셀 너비 기준 클릭 좌표. 피사체 위 점을 먼저, 빼야 할 것 위 점을 뒤에[](source:os-params) |
| `LBL` | 점마다 `1`(피사체) 또는 `0`(피사체가 아님)[](source:os-params) |

환경은 python 3.10 이상과 ffmpeg가 필요하다.[](source:os-setup) README는 64비트 Windows·Mac·Linux에 RAM 8GB를 요구한다.[](source:osr-req)

@callout level=warning title="설치와 다운로드 전에 사용자 승인을 받는다는 문장은 원문에 없다"
1단계는 가상환경을 만들고 `torch`, `transformers`, `opencv-python-headless`, `pillow`, `numpy`를 `pip`로 설치하라고 쓴다.[](source:os-setup) 2단계 코드는 `from_pretrained`로 모델을 내려받는다("downloads on first run").[](source:os-scan) 이때 다운로드 크기(156~898MB)와 속도를 사용자에게 "알린다"는 지시는 있다.[](source:os-model) 알린 뒤 사용자의 동의를 기다리는지는 원문에 명시 없음. 이 분석에서는 설치도 다운로드도 하지 않았다.

## 모델은 어떻게 고르고 얼마나 걸리나 {#model}

에이전트는 작업을 시작하기 전에 기기를 점검한다. 그리고 사용자에게 장치, 고른 모델, 다운로드 크기, 예상 속도를 알린다.[](source:os-model)

| 기기 | 모델 | 다운로드 |
| --- | --- | --- |
| NVIDIA GPU, 12GB 이상 | `facebook/sam2.1-hiera-large` | 898MB |
| NVIDIA GPU, 12GB 미만 또는 Apple Silicon | `facebook/sam2.1-hiera-base-plus` | 323MB |
| GPU 없음(CPU만) | `facebook/sam2.1-hiera-tiny` | 156MB |

표의 기준은 점검 코드와 같다. CUDA가 있으면 GPU 메모리가 12GB 이상일 때 `large`, 아니면 `base-plus`를 고른다. CUDA가 없고 MPS(Apple)가 있으면 `base-plus`, 둘 다 없으면 CPU와 `tiny`다.[](source:os-scan)

@facts id=speed-facts
| CPU 속도 | 프레임당 약 5초. 30fps 10초 클립은 300프레임이라 약 1,500초(약 25분)이고, 원문은 "약 반 시간"이라고 적는다[](source:os-model) |
| CPU 메모리 | RAM 2GB 미만을 쓴다[](source:os-model) |
| GPU | "훨씬 빠르다"고만 적고 수치는 원문에 명시 없음[](source:os-model) |
| 긴 클립과 GPU 없음 | 필요한 부분만 분리하라고 제안한다[](source:os-model) |
| 작업 너비 `W` | 960. SAM 2가 1024로 다시 조정하므로 더 작은 너비라고 빨라지지 않는다[](source:os-scan) |
| 청크 크기 | 60프레임. 메모리를 낮추려고 나누고, 각 청크는 앞 청크의 마지막 마스크에서 시작한다[](source:os-chunk) |
| 시험 구간 | 약 20프레임을 먼저 돌려 확인한 뒤 전체를 돌린다[](source:os-chunk) |

Windows에서 NVIDIA 카드를 쓰면 pytorch.org에서 CUDA 빌드 `torch`를 먼저 설치하라고 한다. 그냥 `pip`로 설치하면 더 느린 CPU 빌드가 깔리기 때문이다.[](source:os-setup) 모델은 처음 한 번만 인터넷이 필요하다.[](source:os-notes)

## 어떤 순서로 일하고 사람은 어디서 확인하나 {#flow}

@workflow id=sep-flow title="object-separation 6단계"
| lane prep | 준비 |
| lane work | 분리 |
| lane check | 확인과 전달 |
| setup | 가상환경 설치 | backend | prep |
| scan | 기기 점검 | backend | prep |
| pick | 클릭 점 고르기 | backend | prep |
| test | 짧은 구간 시험 | backend | work |
| full | 전체 구간 분리 | backend | work |
| green | 초록색 영상 | backend | work |
| look | 프레임 확인? | external | check |
| hand | 전달 | backend | check |
| clean | 정리(선택) | external | check |
| setup > scan | |
| scan > pick | 알림 |
| pick > test | |
| test > full | 확인 뒤 |
| full > green | |
| green > look | |
| look > pick | 점 추가 | dashed |
| look > hand | 이상 없음 | emphasis |
| hand > clean | 사용자 완료 | dashed |

@steps id=sep-steps
| setup | 가상환경 설치 | 프로젝트 폴더 안 `.object-separation`에 설치해서 이 폴더 하나만 지우면 모두 사라진다.[](source:os-setup) | sep-flow | setup |
| scan | 기기 점검 | 장치와 모델을 고르고 사용자에게 알린다. 모델은 점검 코드가 내려받는다.[](source:os-model)[](source:os-scan) | sep-flow | scan |
| pick | 클릭 점 고르기 | `START` 프레임에 좌표 격자를 그려 저장하고 직접 본다. 피사체에 두세 점, 빼야 할 것(잡은 손가락, 포장, 탁자)에 `0` 점을 둔다. 분명하지 않으면 고른 점을 사용자에게 보여 준다.[](source:os-points) | sep-flow | pick |
| test | 짧은 구간 시험 | 약 20프레임을 먼저 돌려 확인한다.[](source:os-chunk) | sep-flow | test |
| full | 전체 구간 분리 | 60프레임 청크로 전체 범위를 돌리고 `work/masks/subject/`에 프레임별 PNG를 쓴다.[](source:os-chunk)[](source:os-chunk-code) | sep-flow | full |
| green | 초록색 영상 | 피사체를 초록으로 표시한 `work/separated.mp4`를 원본 오디오와 함께 만든다.[](source:os-render) | sep-flow | green |
| look | 프레임 확인 | 시작, 중간, 손이나 물체가 앞을 지나가는 순간을 본다. 초록이 엉뚱한 곳에 번지면 거기에 `0` 점을 더하고, 피사체 일부가 빠지면 `1` 점을 더해 4단계를 다시 돌린다.[](source:os-output) | sep-flow | look |
| hand | 전달 | 두 파일의 위치를 사용자에게 알린다.[](source:os-output) | sep-flow | hand |
| clean | 정리(선택) | 사용자가 끝났다고 하면 가상환경과 모델 캐시를 지울 수 있다.[](source:os-clean) | sep-flow | clean |

사람이 개입하는 곳은 세 군데다. 기기 점검 결과를 사용자에게 알리고(승인 대기는 원문에 명시 없음), 클릭 점이 분명하지 않으면 보여 주고, 끝난 뒤 지울지를 사용자가 정한다.[](source:os-model)[](source:os-points)[](source:os-clean) 종료 조건은 5단계 영상을 확인하고 파일 위치를 알리는 것이다. 확인과 재실행을 몇 번 반복하는지는 원문에 명시 없음.[](source:os-output)

## 무엇을 만들고, 한계는 무엇인가 {#outputs}

@tree id=sep-files title="분리가 남기는 파일"
| root | 프로젝트 폴더 | - |
| venv | .object-separation/ (가상환경) | root |
| work | work/ | root |
| prev | preview.jpg (점 고르기용) | work |
| masks | masks/subject/NNNNN.png | work |
| out | separated.mp4 | work |

| 산출물 | 내용 |
| --- | --- |
| `work/separated.mp4` | 피사체가 초록 틴트·글로·밝은 가장자리로 표시된 영상. 원본 오디오를 `aac`로 다시 인코딩하고 영상은 `libx264`, `crf 18`이다[](source:os-render) |
| `work/masks/subject/` | 프레임당 PNG 하나. 흰색이 피사체. 이후 작업은 분리를 다시 돌리지 않고 이 마스크에서 시작할 수 있다[](source:os-output) |
| `work/preview.jpg` | 클릭 점을 고르려고 좌표 격자를 입힌 프레임[](source:os-points) |

판정: 저장되는 마스크는 작업 너비 960 기준이다.

- 분리 코드가 `original_sizes=[[H, W]]`로 후처리하고, 저장할 때 원본 크기로 되돌리는 코드는 없다.[](source:os-scan)[](source:os-chunk-code)
- 초록색 영상을 만들 때만 마스크를 프레임 크기로 키운다.[](source:os-render)
- 원문은 마스크의 해상도를 말하지 않는다. 원본 해상도가 필요한 후속 작업에서는 확인해야 할 점이다.

@callout level=warning title="결과가 달라지는 경우"
마스크는 모서리가 딱 떨어진다. 물체와 손에는 깨끗하지만 부드러운 머리카락에는 덜 깨끗하다.[](source:os-notes)
피사체에 붙은 것은 모두 피사체로 본다(포장, 떼어 내는 필름). 그런 것에는 `0` 점을 둔다.[](source:os-notes)
영상이 가변 프레임률이면 먼저 변환해야 한다. 원문 명령은 `ffmpeg -i in.mp4 -vsync cfr -r 30 out.mp4`이고, 프레임률을 원본과 상관없이 30으로 고정한다.[](source:os-notes)

정리는 선택이다. 지우는 대상은 두 가지다.[](source:os-clean)

- 가상환경: `.object-separation` 폴더를 지운다.
- 모델: `~/.cache/huggingface/hub/models--facebook--sam2.1-hiera-*`를 지운다. Windows는 `C:\Users\<name>\.cache\huggingface\hub`다.
- 원문은 이 삭제를 에이전트가 직접 하라고 쓰지 않고 "everything can be removed"(모두 지울 수 있다)라고만 쓴다. 이 분석에서는 삭제도 하지 않았다.

## 흐름 속 위치 {#position}

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| (앞) | 없음 | - | 앞 스킬을 부르는 문장은 원문에 명시 없음 | - |
| (뒤) | - | 마스크 PNG와 초록색 영상 | 어떤 스킬이 마스크를 이어받는지는 원문에 명시 없음. 마스크가 디스크에 남아 후속 작업의 출발점이 된다고만 쓴다[](source:os-output) | - |
| `motion-broll` | - | - | 같은 계열. 둘 다 사용자 영상을 가공한다. motion-broll README가 "둘 중 하나 또는 둘 다 설치"를 안내한다. 두 `SKILL.md`는 서로를 부르지 않고 파이프라인 연결은 확인되지 않았다(미확인)[](source:mb-readme)[](source:mb-desc)[](source:os-fm) | r05 |

이 스킬은 연결된 앞뒤가 없어서 그림을 그리지 않았다. 전체 흐름은 `video/_group-talking-head-edit/talking-head-edit.html`에 있다. 관계 근거는 `video/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: 텍스트 2개(`SKILL.md` 9,414B, `README.md` 2,140B), 합계 11,554바이트. 관계 확인을 위해 `motion-broll`의 `README.md` 28행과 `SKILL.md` 3행을 읽었다.
- 제외한 파일: README 3행의 `../../docs/object-separation.gif`는 열 수 없어 읽었다고 하지 않는다. 번역본은 이 폴더에 없다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(`relations.md` 확인).
- 코드 블록(`pip`, `ffmpeg`, SAM 2 호출, 삭제 경로)은 분석 자료로만 읽었다. 하나도 실행하지 않았다.
- `SKILL.md`는 코드 블록이 "tested"라고 쓴다. 이 분석에서는 확인하지 못했다.[](source:os-intro)
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
분리 결과가 실제로 좋은지, 청크 경계에서 마스크가 흔들리지 않는지는 확인하지 못했다. 영상 내용은 분석 대상이 아니다.
README는 결과를 "피사체를 새 배경에 올린" 영상이라 쓰고, 이 안내의 GIF 설명도 같다.[](source:osr-does)[](source:osr-intro) 그러나 `SKILL.md`가 만드는 것은 초록색 표시 영상과 마스크이고 배경 교체 코드는 없다.[](source:os-output) 두 문서가 다른 결과를 말한다. 어느 쪽이 맞는지 정하는 우선순위는 원문에 명시 없음.
설치와 모델 다운로드 전 승인 절차, 확인·재실행의 반복 한계는 원문에 명시 없음.
