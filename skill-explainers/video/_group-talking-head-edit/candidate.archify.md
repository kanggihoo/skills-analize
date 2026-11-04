# talking-head-edit 묶음은 어떻게 이어지나 {#talking-head-edit-group}

이 묶음의 세 스킬은 말하는 사람 영상을 가공하는 도구인데, 원문이 직접 이어 주는 연결은 하나뿐이다. `sound-effects`가 cue 목록을 만들 때 `motion-broll`의 `plan.json`을 소스 후보로 든다(r03). `object-separation`은 어느 스킬과도 연결이 없다(r05는 같은 계열 표시일 뿐이다).[](source:th-se-cue)[](source:th-mb-readme)

- 연결의 방향에 주의한다. `plan.json`을 읽을 수 있다고 말하는 쪽은 `sound-effects`다. `motion-broll`은 `sound-effects`를 부르지 않는다.[](source:th-se-cue)[](source:th-mb-deliver)
- 권고형이다. 원문은 "구성 소스에서 가져올 수 있으면"이라고 쓰고, 안 되면 `ffmpeg`로 장면 전환을 감지하라고 한다. 필수 순서가 아니다.[](source:th-se-cue)
- 판정: `motion-broll`이 만드는 `preview.mp4`를 `sound-effects`의 입력으로 쓴다는 말은 원문에 명시 없음이다. 쓰면 코드가 입력 영상의 오디오를 버린다.[](source:th-se-map)

@answer scope="video/Barty-Bart motion-broll · sound-effects · object-separation · 커밋 23e8047 · 지시상 동작 · 영상·소리 결과는 확인하지 못함"
@meta locale=ko
@source th-mb-fm title="video/Barty-Bart/motion-broll/SKILL.md · 8941B · frontmatter" path=video/Barty-Bart/motion-broll/SKILL.md lines=1:4
@source th-mb-interview title="motion-broll/SKILL.md · 2단계 인터뷰" path=video/Barty-Bart/motion-broll/SKILL.md lines=29:44
@source th-mb-approve title="motion-broll/SKILL.md · 계획 승인" path=video/Barty-Bart/motion-broll/SKILL.md lines=60:84
@source th-mb-deliver title="motion-broll/SKILL.md · 8단계 전달" path=video/Barty-Bart/motion-broll/SKILL.md lines=115:131
@source th-mb-readme title="motion-broll/README.md · 3326B · 설치 안내" path=video/Barty-Bart/motion-broll/README.md lines=28:28
@source th-se-fm title="video/Barty-Bart/sound-effects/SKILL.md · 13793B · frontmatter" path=video/Barty-Bart/sound-effects/SKILL.md lines=1:4
@source th-se-usecase title="sound-effects/SKILL.md · 0단계 사용처 질문" path=video/Barty-Bart/sound-effects/SKILL.md lines=38:43
@source th-se-cue title="sound-effects/SKILL.md · 2단계 cue 목록" path=video/Barty-Bart/sound-effects/SKILL.md lines=61:63
@source th-se-prove title="sound-effects/SKILL.md · 6단계 헤드폰 확인" path=video/Barty-Bart/sound-effects/SKILL.md lines=97:98
@source th-se-script title="sound-effects/SKILL.md · 스크립트 실행" path=video/Barty-Bart/sound-effects/SKILL.md lines=121:127
@source th-se-swap title="sound-effects/SKILL.md · 7단계 교체 보고서" path=video/Barty-Bart/sound-effects/SKILL.md lines=129:130
@source th-se-map title="sound-effects/scripts/sound_pass.py · 14041B · 입력 영상 오디오 처리" path=video/Barty-Bart/sound-effects/scripts/sound_pass.py lines=112:112
@source th-os-fm title="video/Barty-Bart/object-separation/SKILL.md · 9414B · frontmatter" path=video/Barty-Bart/object-separation/SKILL.md lines=1:4
@source th-os-readme title="object-separation/README.md · 2140B · 설치와 요구 사항" path=video/Barty-Bart/object-separation/README.md lines=25:29

## 세 스킬은 어떻게 이어지나 {#flow span=12}

@workflow id=edit-flow title="말하는 사람 영상 가공 흐름"
| src | 영상·자막 | external |
| broll | motion-broll | backend |
| plan | plan.json | database |
| sfx | sound-effects | backend |
| check | 헤드폰 확인 5곳 | external |
| src > broll | |
| broll > plan | 8단계 산출 |
| plan > sfx | cue 소스 후보 | dashed |
| sfx > check | |

@steps id=edit-steps
| src | 영상·자막 | 사용자가 말하는 사람 영상과 자막(SRT·VTT)을 준다. 자막이 없으면 단어 시각을 음성에서 얻거나 SRT를 요청한다. | edit-flow | src |
| broll | motion-broll | 인터뷰 한 번과 계획 승인 뒤, 말 한 마디에 맞춘 B-roll 클립과 미리보기를 만든다. | edit-flow | broll |
| plan | plan.json | 클립 목록과 시각을 담은 파일이다. `motion/plan.json`에 쓴다. | edit-flow | plan |
| sfx | sound-effects | cue 목록을 만들고 박자 격자를 확인한 뒤 효과음과 음악을 입혀 음량을 측정한다. | edit-flow | sfx |
| check | 헤드폰 확인 5곳 | 가장 위험한 타임스탬프 5개를 사용자에게 주어 직접 듣게 한다. 스킬은 "소리가 좋다"고 말하지 않는다. | edit-flow | check |
| separate | object-separation | 이 흐름과 연결이 없다. 영상에서 사람·제품·손을 분리해 초록색 강조 영상과 프레임별 마스크를 만든다. | | |

그림의 점선은 `sound-effects`가 `plan.json`을 읽을 수 있다는 뜻이다. `motion-broll`이 `sound-effects`에 넘긴다는 뜻이 아니다.[](source:th-se-cue)

## 무엇을 주고받고 어디에 쓰나 {#state}

| 파일 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `motion/plan.json` | motion-broll(8단계)[](source:th-mb-deliver) | `sound-effects`가 cue 소스 후보로 든다. `cues.json`으로 옮기는 방법은 원문에 명시 없음[](source:th-se-cue) |
| `motion/out/preview.mp4` | motion-broll. 클립을 잘라 넣고 원본 오디오를 유지한다[](source:th-mb-deliver) | 읽는 스킬 원문에 명시 없음 |
| `cues.json` | sound-effects(에이전트가 작성)[](source:th-se-cue) | `sound_pass.py`[](source:th-se-script) |
| `out/after.mp4`, `report.html`, `SOUND.md`, `CREDITS.txt` | `sound-effects`의 `sound_pass.py`[](source:th-se-script) | 사용자. 교체는 `swaps.json`으로 다시 돌린다[](source:th-se-swap) |
| `.object-separation/`, 초록 강조 영상, 프레임별 마스크 | object-separation[](source:th-os-fm)[](source:th-os-readme) | 사용자. 다른 스킬이 읽는다는 말은 원문에 명시 없음 |

## 사람은 어디에서 개입하나 {#human}

| 스킬 | 사람 개입 | 근거 |
| --- | --- | --- |
| motion-broll | 인터뷰는 한 번에 끝낸다. 계획 표를 보여 주고, 사용자가 승인하거나 고치기 전에는 코드를 쓰지 않는다 | [](source:th-mb-interview)[](source:th-mb-approve) |
| sound-effects | 발행처(사용처)를 묻는다. 음악 출처와 라이선스를 묻고, 교체 보고서에서 선택을 받고, 마지막에 헤드폰으로 5곳을 확인하게 한다 | [](source:th-se-usecase)[](source:th-se-swap)[](source:th-se-prove) |
| object-separation | 지점이 여러 곳이다. 자세한 내용은 `video/Barty-Bart/object-separation/object-separation.html`에 있다 | [](source:th-os-fm) |

두 스킬 사이에 사람이 중간에 넘겨 주는 지점(예: `motion-broll` 결과를 `sound-effects`에 넘기는 승인)은 원문에 명시 없음이다.

@callout level=warning title="preview.mp4를 `sound-effects`에 넣으면 원본 음성이 사라질 수 있다"
`motion-broll`의 `preview.mp4`는 원본 오디오를 유지한다.[](source:th-mb-deliver) `sound_pass.py`는 입력 영상에서 영상 스트림만 가져오고 오디오는 새로 믹스한 것으로 바꾼다(`-map 0:v -map 1:a`).[](source:th-se-map)
판정: 원문은 두 스킬 사이의 파일 연결로 `plan.json`만 말한다. 그러나 `preview.mp4`를 입력으로 쓰면 말하는 사람의 음성이 출력에서 빠진다. 스크립트 사용 예시는 입력을 `silent.mp4`로 적는다.[](source:th-se-script) 코드는 실행하지 않았고 줄만 읽었다.

@callout level=open-question title="확인하지 못한 것"
`motion-broll`의 최종 결과는 사용자가 자기 편집기에서 클립을 직접 배치해서 만든다. 그래서 `sound-effects`가 어느 판본의 영상에 소리를 입히는지는 원문에 명시 없음이다.
`motion-broll`과 `object-separation`을 이어서 쓰는 방법은 원문에 없다. 설치 안내가 둘을 같이 고르게 할 뿐이다(r05).[](source:th-mb-readme)
영상과 소리가 실제로 잘 나오는지는 확인하지 못했다. 세 스킬을 실행하지 않았다.
