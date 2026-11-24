# object-separation — SAM 2로 영상 속 피사체를 배경에서 분리해 마스크를 뽑는다 {#overview}

`object-separation`은 에이전트가 사용자 컴퓨터의 하드웨어를 먼저 스캔해 알맞은 SAM 2 모델을 고른 뒤, 지정한 영상 구간에서 사람·제품·손 같은 피사체 하나를 배경에서 분리해 녹색 강조 영상과 프레임별 마스크 파일로 저장하는 스킬이다.[](source:s-fm)[](source:s-intro)

- 모델 호출형 스킬로, 사용자가 영상에서 특정 대상을 분리하거나 로토스코핑해 달라고 요청할 때 켜진다.[](source:s-fm)
- 결과로 피사체가 녹색으로 강조된 확인용 영상(`work/separated.mp4`)과 프레임마다 1장씩 저장된 흑백 마스크(`work/masks/subject/*.png`)가 남는다.[](source:s-p5)
- 다른 스킬과의 관계: 같은 `Barty-Bart` 컬렉션의 `motion-broll`과 사용자 영상을 가공하는 `대안` 관계이며, 두 `SKILL.md` 사이에 직접 호출 연결은 없다.[](source:rel-mb)
- 모든 처리는 사용자 로컬 환경에서 실행되며 외부로 영상을 업로드하지 않는다(첫 실행 시 모델 다운로드만 인터넷 필요).[](source:s-intro)[](source:s-note)

@answer scope="video/Barty-Bart/object-separation · 원본 파일 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=f53b74e8bae4a9f9a8a11d2d3d0dc2b980b855ed
@source s-fm title="frontmatter: name, description" path=video/Barty-Bart/object-separation/SKILL.md lines=1:4
@source s-intro title="스킬 목적과 로컬 실행 방식" path=video/Barty-Bart/object-separation/SKILL.md lines=6:11
@source s-p1 title="1단계: 삭제 가능한 가상환경 설치" path=video/Barty-Bart/object-separation/SKILL.md lines=12:22
@source s-p2 title="2단계: 컴퓨터 스캔 및 SAM 2 모델 선택" path=video/Barty-Bart/object-separation/SKILL.md lines=23:60
@source s-p3 title="3단계: 시작 프레임 격자 저장 및 클릭 좌표 선택" path=video/Barty-Bart/object-separation/SKILL.md lines=62:83
@source s-p4 title="4단계: 60프레임 청크 단위 분리 및 마스크 저장" path=video/Barty-Bart/object-separation/SKILL.md lines=85:123
@source s-p5 title="5단계: 녹색 강조 영상 렌더링 및 결과 검수" path=video/Barty-Bart/object-separation/SKILL.md lines=125:156
@source s-p6 title="6단계: 가상환경 및 모델 캐시 정리(선택)" path=video/Barty-Bart/object-separation/SKILL.md lines=157:162
@source s-note title="마스크 한계, 가변 FPS 변환, 인터넷 요구 조건" path=video/Barty-Bart/object-separation/SKILL.md lines=163:168
@source readme title="README.md: 설치·사용 안내" path=video/Barty-Bart/object-separation/README.md lines=1:33
@source rel-mb title="motion-broll README.md: 함께 설치 안내" path=video/Barty-Bart/motion-broll/README.md lines=28:28

## 어떻게 동작하나 {#flow span=12}

@workflow id=flow-diagram title="object-separation 흐름"
| lane prep | 환경·좌표 준비 |
| lane run | 분리·검수·정리 |
| setup | 1. 가상환경 설치 | backend | prep | source:s-p1 |
| scan | 2. 기기 스캔·모델 선택 | backend | prep | source:s-p2 |
| points | 3. 클릭 좌표 선택 | backend | prep | source:s-p3 |
| separate | 4. 청크 단위 분리·마스크 저장 | backend | run | source:s-p4 |
| render | 5. 녹색 강조 영상 렌더·검수 | backend | run | source:s-p5 |
| cleanup | 6. 환경·캐시 삭제(선택) | backend | run | source:s-p6 |
| setup > scan | 준비 |
| scan > points | 로드 |
| points > separate | 좌표 |
| separate > render | 마스크 |
| render > separate | 오류 | dashed |
| render > cleanup | 완료 |

@steps id=flow-steps
| s-setup | 1. 가상환경 설치 | **입력** 프로젝트 폴더 · **실행** `python3 -m venv .object-separation && .object-separation/bin/pip install torch transformers opencv-python-headless pillow numpy` · **출력** 독립 가상환경 `.object-separation/`. **처리** 작업 뒤 한 폴더만 지워 치울 수 있게 가상환경을 만든다.[](source:s-p1) **다음** Windows NVIDIA GPU 환경이면 일반 pip 대신 pytorch.org의 CUDA용 torch를 먼저 설치한다.[](source:s-p1) | flow-diagram | setup |
| s-scan | 2. 기기 스캔·모델 선택 | **입력** 로컬 GPU·CPU 환경 · **출력** 장치·모델·예상 속도 안내 및 로드된 SAM 2 모델. **처리** CUDA VRAM 12 GB 이상이면 `large`, 그 미만이나 Apple Silicon이면 `base-plus`, CPU만 있으면 `tiny`를 고르고 사용자에게 알린다.[](source:s-p2) **다음** GPU 없이 영상이 길면 필요한 구간만 자르도록 제안한다.[](source:s-p2) | flow-diagram | scan |
| s-points | 3. 클릭 좌표 선택 | **입력** 대상 영상과 시작 프레임 번호 · **출력** 좌표 격자 이미지(`work/preview.jpg`)와 `PTS`/`LBL` 배열. **처리** 너비 960px 기준 격자 이미지를 저장해 피사체 위(`1`)와 제외 대상(`0`) 좌표를 2~3개 이상 고른다.[](source:s-p3) **다음** 피사체가 명확하지 않으면 고른 좌표를 사용자에게 먼저 보여 준다.[](source:s-p3) | flow-diagram | points |
| s-separate | 4. 청크 단위 분리·마스크 저장 | **입력** 영상 프레임과 `PTS`/`LBL` · **출력** `work/masks/subject/{f:05d}.png` 마스크 파일 묶음. **처리** 메모리를 아끼기 위해 60프레임씩 끊어 앞 청크의 마지막 마스크를 다음 청크 시드로 넘기며 분리한다.[](source:s-p4) **다음** 전체 구간을 돌리기 전에 약 20프레임 짧은 구간을 먼저 시험해 결과를 확인한다.[](source:s-p4) | flow-diagram | separate |
| s-render | 5. 녹색 강조 영상 렌더·검수 | **입력** 원본 영상과 프레임별 마스크 · **실행** `ffmpeg` subprocess 파이프 · **출력** `work/separated.mp4`와 경로 안내 메시지. **처리** 피사체에 녹색 틴트·외곽선·글로우를 입히고 원본 오디오를 합쳐 내보낸 뒤 시작·중간·가림 프레임을 확인한다.[](source:s-p5) **다음** 녹색이 배경으로 번지거나 피사체가 빠지면 `label 0`/`1` 좌표를 추가해 4단계로 돌아간다.[](source:s-p5) | flow-diagram | render |
| s-cleanup | 6. 환경·캐시 삭제(선택) | **입력** 사용자 작업 완료 여부 · **출력** 정리된 프로젝트와 디스크. **처리** 후속 작업까지 끝나면 `.object-separation` 폴더와 HuggingFace 모델 캐시 삭제 방법을 안내한다.[](source:s-p6) | flow-diagram | cleanup |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 호출형(`description` 참고). 영상에서 사람·제품·손을 분리하거나 로토스코핑해 달라는 요청에 반응한다.[](source:s-fm) |
| 성격 | 절차형(6단계 로컬 영상 피사체 분리). Python 스크립트를 직접 작성·실행해 마스크와 확인 영상을 만든다.[](source:s-intro) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `motion-broll` {#rel-r05} | **이 스킬** | 대안 | 두 스킬 모두 사용자 영상을 처리하며 `motion-broll`의 README가 둘 중 하나 또는 둘 다 설치를 안내하지만, `SKILL.md` 간 직접 호출은 없고 파이프라인 연결은 미확인 상태다.[](source:rel-mb)[](source:s-fm) |

@architecture id=relation-map title="object-separation과 이어지는 스킬"
| mb | motion-broll | backend |
| self | object-separation(이 스킬) | backend |
| mb > self | 대안 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 6단계 분리 워크플로와 검증된 인라인 Python 코드 블록을 담은 유일한 지침 파일(168줄) | 스킬이 켜질 때 읽고 단계별 Python 코드를 환경에 맞게 실행한다 | 1. 가상환경 설치, 2. 기기 스캔·모델 선택, 3. 클릭 좌표 선택, 4. 청크 단위 분리·마스크 저장, 5. 녹색 강조 영상 렌더·검수, 6. 환경·캐시 삭제(선택) |
| `README.md` | 설치 명령, 하드웨어별 모델 표, 실행 예시를 설명하는 저장소 안내 문서(33줄) | 에이전트 실행 지시에는 쓰이지 않으며 사람 독자용 안내다[](source:readme) | - |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 영상 처리·업로드 보안 기준 | 모든 연산은 로컬에서 돌며 영상을 외부로 업로드하지 않는다(첫 실행 모델 다운로드만 인터넷 필요). | [](source:s-intro)[](source:s-note) |
| 하드웨어별 모델·속도 기준 | NVIDIA 12 GB+는 `large`(898 MB), 12 GB 미만·Apple Silicon은 `base-plus`(323 MB), CPU는 `tiny`(156 MB, 프레임당 약 5초)를 쓴다. | [](source:s-p2) |
| CPU 환경에서 긴 영상을 분리할 때 | 처리 시간이 매우 길어지므로 필요한 구간만 잘라서 분리하도록 사용자에게 제안한다. | [](source:s-p2) |
| 입력 영상이 가변 프레임레이트(VFR)일 때 | `ffmpeg -i in.mp4 -vsync cfr -r 30 out.mp4`로 고정 프레임레이트 변환을 먼저 해야 한다. | [](source:s-p2)[](source:s-note) |
| 작업 해상도와 청크 크기 기준 | 작업 너비는 `960`px, 청크는 `60`프레임으로 고정하며, 전체 실행 전 약 `20`프레임으로 먼저 시험한다. | [](source:s-p2)[](source:s-p4) |
| 포장재·필름이나 머리카락 경계 처리 | 피사체에 붙은 포장재 등은 `label 0` 점을 찍어야 제외되며, 부드러운 머리카락보다 물체·손 경계가 깔끔하다. | [](source:s-p3)[](source:s-note) |
| 녹색 강조 영상 검수에서 오류가 보일 때 | 시작·중간·가림 프레임을 확인해 녹색 번짐(`label 0`)이나 누락(`label 1`) 좌표를 보완한 뒤 4단계를 다시 돌린다. | [](source:s-p5) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- 인라인 Python 구현과 ffmpeg 파이프 세부 — 맡을 개요 항목: 4. 청크 단위 분리·마스크 저장, 5. 녹색 강조 영상 렌더·검수 · `Sam2VideoModel` 세션 초기화, 60프레임 시드 전달, 녹색 틴트·글로우 합성 식이 길어서 뺐다.

읽은 원본: 텍스트 파일 2개(`SKILL.md`, `README.md`). 제외: 없음.
