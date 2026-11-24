# talking-head-edit 묶음은 어떻게 이어지나 {#talking-head-edit-group}

`motion-broll`, `sound-effects`, `object-separation`은 사용자가 가진 영상을 가공하는 Barty-Bart 계열 스킬이다. `sound-effects`는 `motion-broll`의 `plan.json`을 cue 목록 입력으로 읽을 수 있고(r03), `object-separation`은 같은 영상 가공 계열이지만 다른 두 스킬과 직접 연결은 없다(r05).[](source:the-mb-intro)[](source:the-se-cues)[](source:the-os-intro)

- `motion-broll`은 말하는 사람 영상과 자막에서 말에 맞춘 모션그래픽 B-roll 클립과 `plan.json`을 만든다.[](source:the-mb-intro)
- `sound-effects`는 모션그래픽 영상에 효과음과 음악을 입히고, `-16 LUFS`·true peak `-4 dBFS` 미만 기준을 MP4에서 측정한다.[](source:the-se-desc)
- `object-separation`은 SAM 2로 영상 속 피사체를 분리해 초록 강조 영상과 프레임별 마스크를 만든다.[](source:the-os-intro)

@answer scope="video/Barty-Bart talking-head-edit 3종 · 커밋 f53b74e · 지시상 동작 · 실행 결과 미확인"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=f53b74e8bae4a9f9a8a11d2d3d0dc2b980b855ed
@source the-mb-intro title="motion-broll/SKILL.md · 소개와 산출물" path=video/Barty-Bart/motion-broll/SKILL.md lines=1:11
@source the-se-desc title="sound-effects/SKILL.md · frontmatter" path=video/Barty-Bart/sound-effects/SKILL.md lines=1:4
@source the-se-cues title="sound-effects/SKILL.md · cue 목록 작성" path=video/Barty-Bart/sound-effects/SKILL.md lines=61:64
@source the-os-intro title="object-separation/SKILL.md · 소개" path=video/Barty-Bart/object-separation/SKILL.md lines=1:9

## B-roll 제작과 소리 입히기는 어떻게 이어지나 {#flow span=12}

@workflow id=the-flow title="talking-head-edit 연결 흐름"
| mb | motion-broll (B-roll 클립) | backend |
| se | sound-effects (소리 입히기) | backend |
| mb > se | plan.json 전달(권고) |

@steps id=the-steps
| mb | motion-broll (B-roll 클립) | 영상과 자막을 받아 B-roll 클립과 타임라인 계획(`plan.json`), 합성 프리뷰를 만든다. | the-flow | mb |
| se | sound-effects (소리 입히기) | `plan.json`을 읽어 `cues.json`을 만들고, CC0·Mixkit 효과음과 음악을 섞어 MP4 음량을 검증한다. | the-flow | se |

`motion-broll`과 `sound-effects`의 연결은 필수 순서가 아니라 권고다. `sound-effects`는 구성 소스가 없으면 `ffmpeg` 장면 전환 감지로 cue를 만든다.[](source:the-se-cues)

## 세 스킬은 무엇을 주고받고 어디에 쓰나 {#state}

| 파일·폴더 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `motion/plan.json` | motion-broll | sound-effects(권고 입력)[](source:the-se-cues) |
| `cues.json`, `CREDITS.txt`, `SOUND.md` | sound-effects | 사용자 |
| 분리 영상, 프레임별 마스크 PNG | object-separation | 사용자 |

## 그림에서 뺀 관계와 쓰면 안 될 때 {#omitted}

| rel-id | 종류 | 그림에 있나 | 내용 |
| --- | --- | --- | --- |
| r03 | 결과 전달 | 있음 | `sound-effects`가 `motion-broll`의 `plan.json`을 cue 소스로 읽을 수 있다[](source:the-se-cues) |
| r05 | 대안 | 생략 | `motion-broll` README가 `object-separation`과 함께 설치를 안내하지만, 두 `SKILL.md` 사이 직접 호출이나 파일 연결은 없다 |
| r04 | 결과 전달 | 생략 | `sound-effects`와 `explainer` 3종 연계 여부는 원문에 근거가 없어 `미확인`이다 |

@callout level=open-question title="확인하지 못한 것"
`motion-broll`의 `plan.json`을 `sound-effects`가 실제로 파싱해 끝까지 믹싱하는 실행 결과는 확인하지 못했다.
