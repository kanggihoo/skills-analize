# sound-effects — 박자·음량·라이선스를 측정해 모션그래픽 영상에 소리를 입힌다 {#overview}

`sound-effects`는 듣지 못하는 에이전트가 느낌으로 판단하지 않고, `cue`(소리를 넣을 시점) 목록과 `beat grid`(박자 위치 격자)를 계산해 내장 CC0 효과음과 음악을 입히고 내보낸 MP4의 음량과 파형을 측정해 검증하는 스킬이다.[](source:s-fm)[](source:s-intro)

- 모델 호출형 스킬로, 모션그래픽 영상에 효과음이나 배경 음악을 넣고 싶거나 AI 영상의 싸구려 비프음을 바꾸고 싶을 때 켜진다.[](source:s-fm)
- 결과로 소리가 입혀진 영상(`after.mp4`), 큐별 재생·교체용 `report.html`, 음량·라이선스·헤드폰 확인 시각 5개가 담긴 `SOUND.md`, 크레딧 목록 `CREDITS.txt`, 검수 이미지(`beatgrid.png`, `checks/`)가 남는다.[](source:s-script)
- 다른 스킬과의 관계: `cues.json`을 만들 때 `motion-broll`의 `plan.json`에서 타이밍을 가져오라고 권고(`결과 전달`)하며, 같은 컬렉션 `explainer` 3종과의 후속 연결은 `미확인`이다.[](source:s-fm)[](source:s-p2)
- 코드로 음악이나 효과음을 합성하는 행위를 금지하고, 모든 음원은 사용처 기준 라이선스 확인을 거친 실제 녹음 파일만 쓴다.[](source:s-rule)

@answer scope="video/Barty-Bart/sound-effects · 원본 파일 8개(대용량 manifest 구조·표본만 확인) · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=f53b74e8bae4a9f9a8a11d2d3d0dc2b980b855ed
@source s-fm title="frontmatter: name, description" path=video/Barty-Bart/sound-effects/SKILL.md lines=1:4
@source s-intro title="측정 기반 접근과 Vox 출처 표기" path=video/Barty-Bart/sound-effects/SKILL.md lines=6:11
@source s-kit title="기본 kit 7종 구성" path=video/Barty-Bart/sound-effects/SKILL.md lines=12:25
@source s-rule title="음원 합성 금지, 라이선스·음량 측정 규칙" path=video/Barty-Bart/sound-effects/SKILL.md lines=27:36
@source s-p0 title="0단계: 사용처 확인 및 라이선스 페이지 대조" path=video/Barty-Bart/sound-effects/SKILL.md lines=38:52
@source s-p1 title="1단계: 가상환경 및 오디오 라이브러리 설치" path=video/Barty-Bart/sound-effects/SKILL.md lines=54:59
@source s-p2 title="2단계: cue 목록 추출 및 카테고리 매핑" path=video/Barty-Bart/sound-effects/SKILL.md lines=61:81
@source s-p3 title="3단계: librosa beat grid와 120 Hz 이하 킥 비교" path=video/Barty-Bart/sound-effects/SKILL.md lines=83:84
@source s-p4 title="4단계: 하드 컷·리빌 박자 정렬" path=video/Barty-Bart/sound-effects/SKILL.md lines=86:87
@source s-p5 title="5단계: SFX·음악 믹싱 및 -16 LUFS 측정" path=video/Barty-Bart/sound-effects/SKILL.md lines=89:95
@source s-p6 title="6단계: 큐별 전후 프레임·파형 증명 및 5개 타임스탬프 선정" path=video/Barty-Bart/sound-effects/SKILL.md lines=97:98
@source s-script title="sound_pass.py 실행 명령과 출력물" path=video/Barty-Bart/sound-effects/SKILL.md lines=121:127
@source s-p7 title="7단계: report.html 대안 교체와 보고 원칙" path=video/Barty-Bart/sound-effects/SKILL.md lines=129:133
@source py-pass title="sound_pass.py: 3~6단계 자동화 및 라이선스·충돌 검사" path=video/Barty-Bart/sound-effects/scripts/sound_pass.py lines=1:169
@source py-rep title="report.py: 큐별 오디오 재생 및 swaps.json 내보내기 HTML 생성" path=video/Barty-Bart/sound-effects/scripts/report.py lines=1:27
@source man-head title="manifest.json: 포맷, 정규화, category_map 표본" path=video/Barty-Bart/sound-effects/sfx/manifest.json lines=1:30
@source music-md title="MUSIC.md: 분위기별 Mixkit 추천 트랙 및 라이선스 한계" path=video/Barty-Bart/sound-effects/MUSIC.md lines=1:52
@source top-md title="TOP-PICKS.md: 기본 kit 및 카테고리별 추천 음원" path=video/Barty-Bart/sound-effects/TOP-PICKS.md lines=1:65
@source lic-md title="LICENSES.md: 내장 CC0 음원 109종 및 비번들 소스 정리" path=video/Barty-Bart/sound-effects/LICENSES.md lines=1:133
@source readme-md title="README.md: 스킬 소개 및 라이브러리 구성" path=video/Barty-Bart/sound-effects/README.md lines=1:55
@source rel-exp title="explainer-default: 자체 buildAudio 합성 음향" path=video/Barty-Bart/explainer-default/SKILL.md lines=21:21

## 어떻게 동작하나 {#flow span=12}

`sound_pass.py`가 3~6단계를 한 번에 실행하며, 사용자가 `report.html`에서 소리를 바꿔 `swaps.json`을 내보내면 `--swaps` 옵션으로 다시 돌려 재믹싱한다.[](source:s-script)[](source:s-p7)

@workflow id=flow-diagram title="sound-effects 흐름"
| lane prep | 라이선스·큐 준비 |
| lane pass | 박자·믹싱·검증 |
| lic | 0. 라이선스 확인 | backend | prep | source:s-p0 |
| setup | 1. 가상환경 설치 | backend | prep | source:s-p1 |
| cues | 2. cue 목록 작성 | backend | prep | source:s-p2 |
| beat | 3. beat grid 검출·보정 | backend | pass | source:s-p3 |
| align | 4. 컷·박자 정렬 | backend | pass | source:s-p4 |
| mix | 5. SFX·음악 믹싱·측정 | backend | pass | source:s-p5 |
| prove | 6~7. 증명·교체 보고 | backend | pass | source:s-p6 |
| lic > setup | 사용처·약관 통과 |
| setup > cues | 라이브러리 준비 |
| cues > beat | cues.json·음원 전달 |
| beat > align | 보정된 박자 격자 |
| align > mix | 음악 시작 오프셋 |
| mix > prove | -16 LUFS MP4 완성 |
| prove > mix | swaps.json 교체 재실행 | dashed |

@steps id=flow-steps
| s-lic | 0. 라이선스 확인 | **입력** 게시 플랫폼과 사용 음원 목록 · **참조** `MUSIC.md` · **출력** 허용 여부 보고 및 `--use-case` 인자. **처리** 영상을 올릴 곳을 묻고 실제 쓸 모든 소스의 현재 라이선스 페이지를 열어 사용 가능 여부를 확인한다.[](source:s-p0) **다음** 약관이 바뀌었거나 사용처가 허용되지 않으면 내보내기 전에 해당 음원을 교체한다.[](source:s-p0) | flow-diagram | lic |
| s-setup | 1. 가상환경 설치 | **입력** 프로젝트 폴더 · **실행** `python3 -m venv .sound-effects && .sound-effects/bin/pip install librosa soundfile numpy scipy matplotlib` · **출력** `.sound-effects/` 가상환경. **처리** 오디오 분석과 파형 플롯 생성에 필요한 Python 패키지를 격리 폴더에 설치한다.[](source:s-p1) | flow-diagram | setup |
| s-cues | 2. cue 목록 작성 | **입력** 무음 영상(`silent.mp4`) 또는 구성 소스 · **참조** `sfx/manifest.json` · **실행** `ffprobe` / `ffmpeg` 장면 전환 감지 · **출력** `cues.json`. **처리** 타임라인 소스(`motion-broll`의 `plan.json` 등)나 장면 전환 감지로 시각 이벤트를 뽑아 큐 유형별 효과음 카테고리를 매핑한다.[](source:s-p2) | flow-diagram | cues |
| s-beat | 3. beat grid 검출·보정 | **입력** 배경 음악 파일 · **실행** `scripts/sound_pass.py` · **출력** `beatgrid.png`와 보정된 박자 격자. **처리** `librosa.beat.beat_track` 박자선과 `120 Hz` 이하 킥 드럼 피크의 중앙값 오차를 비교해 어긋나면 격자 전체를 민다.[](source:s-p3)[](source:py-pass) | flow-diagram | beat |
| s-align | 4. 컷·박자 정렬 | **입력** `cues.json`의 `scene_cut`/`reveal` 시각과 박자 격자 · **출력** 음악 시작 오프셋(`mstart`)과 컷별 오차(ms). **처리** 애니메이션 타이밍을 바꿀 수 없으면 컷과 박자의 오차 합이 최소가 되는 음악 시작 지점을 찾는다.[](source:s-p4)[](source:py-pass) | flow-diagram | align |
| s-mix | 5. SFX·음악 믹싱·측정 | **입력** 큐별 음원과 배경 음악 · **실행** `ffmpeg` `ebur128` 측정 루프 · **출력** `after.mp4`. **처리** 기본 kit 우선 배치(런타임 Mixkit은 프로젝트 캐시에 다운로드) 후 내보낸 MP4가 `-16 LUFS`·`true peak` `-4 dBFS` 미만이 되도록 게인과 리미터를 반복 조정한다.[](source:s-kit)[](source:s-p5)[](source:py-pass) | flow-diagram | mix |
| s-prove | 6~7. 증명·교체 보고 | **입력** `after.mp4`와 배치 로그 · **참조** `scripts/report.py` · **출력** `checks/cue-*.png`, `report.html`, `SOUND.md`, `CREDITS.txt`. **처리** 큐 전후 프레임·파형 이미지와 교체용 HTML을 만들고, 위험한 타임스탬프 5개와 측정치를 사용자에게 보고한다.[](source:s-p6)[](source:s-p7)[](source:py-rep) **다음** 사용자가 `report.html`에서 고른 `swaps.json`을 주면 `--swaps`로 재실행한다.[](source:s-p7) | flow-diagram | prove |

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 호출형(`description` 참고). 모션그래픽 영상에 효과음·사운드 디자인·음악을 넣거나 비프음을 개선할 때 켜진다.[](source:s-fm) |
| 성격 | 절차형(7단계 측정 기반 사운드 패스). `sound_pass.py`로 박자 정렬·믹싱·음량 측정·증명 리포트를 자동 실행한다.[](source:s-script) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| **이 스킬** {#rel-r03} | `motion-broll` | 결과 전달 | `cues.json`을 만들 때 구성 소스에서 가져올 수 있으면 `motion-broll`의 `plan.json`을 가져오라고 권고한다(필수 순서 아님).[](source:s-fm)[](source:s-p2) |
| **이 스킬** {#rel-r04} | `explainer-default`, `explainer-engaging`, `explainer-high-energy` | 결과 전달 | 적용 대상이 모션그래픽 영상이지만 `explainer` 3종은 자체 `buildAudio` 합성을 쓰고, 이 스킬은 코드 합성을 금지한다. 서로 호출하지 않아 후속 연결은 미확인이다.[](source:s-rule)[](source:rel-exp) |

@architecture id=relation-map title="sound-effects과 이어지는 스킬"
| self | sound-effects(이 스킬) | backend |
| mb | motion-broll | backend |
| exp | explainer 3종(미확인) | backend |
| self > mb | 결과 전달 |
| self > exp | 결과 전달 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 7단계 사운드 패스 절차, 기본 kit 표, 라이선스·믹싱 규칙(133줄) | 스킬이 켜질 때 읽는다 | 0. 라이선스 확인, 1. 가상환경 설치, 2. cue 목록 작성, 3. beat grid 검출·보정, 4. 컷·박자 정렬, 5. SFX·음악 믹싱·측정, 6~7. 증명·교체 보고 |
| `scripts/sound_pass.py` | 박자 보정, 컷 정렬, 믹싱, `-16 LUFS` 루프, `SOUND.md`·`CREDITS.txt` 생성(169줄) | 3~6단계를 끝까지 실행하거나 `--swaps`로 재믹싱할 때 돌린다[](source:s-script) | 3. beat grid 검출·보정, 4. 컷·박자 정렬, 5. SFX·음악 믹싱·측정, 6~7. 증명·교체 보고 |
| `scripts/report.py` | 큐별 오디오 재생과 대안 선택·`swaps.json` 저장 UI를 담은 `report.html` 생성기(27줄) | `sound_pass.py` 마지막 줄에서 import해 호출한다[](source:py-pass) | 6~7. 증명·교체 보고 |
| `sfx/manifest.json` | 기본 kit 7종, 내장 CC0 103종, 런타임 Mixkit 40종 메타데이터(1750줄, 구조·표본만 확인) | 큐 유형 매핑과 음원 선택·다운로드 시 참조한다[](source:s-kit)[](source:man-head) | 2. cue 목록 작성, 5. SFX·음악 믹싱·측정 |
| `MUSIC.md` | 분위기별 무료 Mixkit 추천 트랙 12곡과 라이선스 허용 범위(52줄) | 사용자에게 배경 음악이 없을 때 2~3곡을 제안할 때 읽는다[](source:s-rule)[](source:music-md) | 0. 라이선스 확인 |
| `TOP-PICKS.md` | 카테고리별 추천 효과음과 기본 kit 크레딧 문구(65줄) | 기본 kit 외 추천 음원이나 크레딧 표기를 확인할 때 참조한다[](source:s-kit)[](source:top-md) | - |
| `LICENSES.md` | 내장 CC0 109종 목록과 Mixkit·Pixabay·Sonniss 등 소스별 제한(133줄) | 번들 라이선스 근거와 제외 소스 기준을 확인할 때 참조한다[](source:lic-md) | - |
| `README.md` | 스킬 개요, 라이브러리 구성, 설치·라이선스 안내 문서(55줄) | 사람 독자용 안내 문서로 에이전트 실행 지시에는 쓰이지 않는다[](source:readme-md) | - |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 효과음이나 음악을 만들 때 | 코드로 오실레이터·사인파 비프음을 합성하지 않고 실제 녹음 파일만 쓴다. | [](source:s-rule) |
| Mixkit 등 런타임 음원·음악을 받을 때 | 스킬 폴더나 저장소에 커밋하지 않고 사용자 프로젝트(`sound-effects-cache/`)에만 받는다. | [](source:s-kit)[](source:s-rule)[](source:s-p0) |
| 알 수 없는 라이선스 음원이 발견될 때 | 해당 음원 이름·라이선스·출처 링크를 밝히고 확인 또는 교체 전까지 게시를 막는다. | [](source:s-rule)[](source:s-p0) |
| 음악 출처·라이선스 확인이 안 될 때 | `LICENCE NOT CONFIRMED`로 기록하고 사용자에게 확인되지 않았음을 그대로 알린다. | [](source:s-rule)[](source:py-pass) |
| 믹싱 우선순위와 목표 음량 기준 | `음성 > SFX > 음악`(효과음 아래 `-12 dB`, 음성 시 `8~12 dB` 덕킹)으로 두고, 내보낸 `after.mp4`의 스테레오·모노 모두 `-16 LUFS`·`true peak` `-4 dBFS` 미만으로 맞춘다. | [](source:s-rule)[](source:s-p5) |
| 최종 결과를 사용자에게 보고할 때 | 절대 "소리가 좋다"고 말하지 않고, 위험 타임스탬프 5개를 헤드폰으로 확인하게 넘긴다. | [](source:s-intro)[](source:s-p7) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- `sound_pass.py` 믹싱·게인 루프와 큐 유형별 게인·선행 프레임 규칙 — 맡을 개요 항목: 5. SFX·음악 믹싱·측정 · 큐 유형별 `-4/-6/-8 dB` 감쇠, `2/fps` 선행 배치, 리미터 계수 조정 로직이 길어서 뺐다.
- `sfx/manifest.json` 전체 음원 목록과 원본 고음질 교체 규칙 — 맡을 개요 항목: 2. cue 목록 작성 · 103개 내장 파일과 40개 런타임 항목, Freesound·Kenney 원본 추출 규칙은 대용량이라 구조·표본만 확인했다.

읽은 원본: 텍스트 파일 8개(`SKILL.md`, `README.md`, `MUSIC.md`, `TOP-PICKS.md`, `LICENSES.md`, `scripts/sound_pass.py`, `scripts/report.py`, `sfx/manifest.json` 앞부분 표본). 제외: `sfx/**/*.ogg` 바이너리 음원 파일 전체.
