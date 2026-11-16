# 이미 있는 영상·코드·스타일에서 출발할 때 어느 스킬로 가나? {#start-from-reference-page}

출발점이 영상 파일이면 `reverse-any-video`, 영상을 만든 코드(Remotion 등)면 `remotion-to-hyperframes`, 검증된 스타일 5종 중 하나면 `style-sampling`으로 간다. 세 스킬은 서로 대안이고 함께 실행하지 않는다. 길을 고르는 안내는 `hyperframes`의 요청 안내표가 한다.[](source:hf-route)

- 영상 하나를 프레임 단위로 다시 만들려면 `reverse-any-video`다. HyperFrames Pro 기능이고, 원본과 맞는지 `diff`로 확인한다.[](source:rev-intro)
- 기존 영상 코드와 footage를 HyperFrames로 가져오려면 `remotion-to-hyperframes`다. Native, Hosted, Media 세 수준 중 가장 높은 수준으로 가져온다.[](source:rem-levels)
- 스타일 템플릿 5종 중 하나로 새 에피소드를 만들려면 `style-sampling`이다. 5종 밖 스타일은 `reverse-any-video`나 `hyperframes`로 보낸다.[](source:sty-outside)

@answer scope="스킬 4개 · SKILL.md 기준 · 관계 R04·R05·R07·R14·R15·R21·R22·R28 · 폴더 밖 참조 대상은 읽지 않음"
@meta locale=ko
@source hf-route title="hyperframes/hyperframes/SKILL.md · 7481B · 원본(요청별 안내표)" path=hyperframes/hyperframes/SKILL.md lines=60:79
@source rev-intro title="hyperframes/reverse-any-video/SKILL.md · 원본(결과물과 Pro)" path=hyperframes/reverse-any-video/SKILL.md lines=12:14
@source rem-levels title="hyperframes/remotion-to-hyperframes/SKILL.md · 원본(세 수준)" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=12:20
@source rem-native title="hyperframes/remotion-to-hyperframes/SKILL.md · 원본(Native 번역)" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=22:26
@source sty-pick title="hyperframes/style-sampling/SKILL.md · 원본(템플릿 고르기)" path=hyperframes/style-sampling/SKILL.md lines=26:28
@source sty-outside title="hyperframes/style-sampling/SKILL.md · 원본(5종 밖 스타일)" path=hyperframes/style-sampling/SKILL.md lines=30:30
@source sty-start title="hyperframes/style-sampling/SKILL.md · 원본(시작과 로그인)" path=hyperframes/style-sampling/SKILL.md lines=32:38
@source sty-credit title="hyperframes/style-sampling/SKILL.md · 원본(credit)" path=hyperframes/style-sampling/SKILL.md lines=52:54

## 어느 길로 가나? {#flow}

화살표는 원장의 넘김이다. `hyperframes`의 안내표는 요청 종류를 알려 줄 뿐이며 스킬을 자동 호출하지 않는다. `style-sampling`이 5종 밖 스타일을 `reverse-any-video`로 보내는 것은 제안이고, 사용자가 길을 고른다.[](source:hf-route)[](source:sty-outside)

@workflow id=start-flow title="출발점에 따른 스킬 선택"
| hf | hyperframes | frontend | source:hf-route |
| rev | reverse-any-video | backend | source:rev-intro |
| rem | remotion-to-hyperframes | backend | source:rem-levels |
| sty | style-sampling | backend | source:sty-pick |
| hf > rev | 영상 파일 R04 | emphasis |
| hf > rem | Remotion 코드 R07 | emphasis |
| hf > sty | 스타일 에피소드 R05 | emphasis |
| sty > rev | 5종 밖 제안 R21 | dashed |

@steps id=start-steps
| hf-step | hyperframes | 요청 종류를 보고 갈 스킬을 알려 준다. | start-flow | hf |
| rev-step | reverse-any-video | 영상 하나를 편집 가능한 프로젝트로 다시 만들고 원본과 대조한다. | start-flow | rev |
| rem-step | remotion-to-hyperframes | 영상 코드를 Native·Hosted·Media 중 한 수준으로 가져와 대조한다. | start-flow | rem |
| sty-step | style-sampling | 템플릿 5종 중 하나를 pull해 사용자 주제의 새 에피소드를 만든다. | start-flow | sty |

각 스킬 내부 규칙과 수치는 개별 페이지에 있다. 색인 기준 `hyperframes/reverse-any-video/reverse-any-video.html`, `hyperframes/remotion-to-hyperframes/remotion-to-hyperframes.html`, `hyperframes/style-sampling/style-sampling.html`에서 본다.

## 어떤 관계로 무엇을 주고받나? {#relations}

| rel-id·종류 | 조건과 전달물 | 그림 반영 |
|---|---|---|
| R04·R05·R07 · 넘김 | `hyperframes` 안내표가 복사·재현할 영상은 `/reverse-any-video`, 검증된 스타일 에피소드는 `/style-sampling`, Remotion source는 `/remotion-to-hyperframes`로 안내한다. 강제는 아니다. `/remotion-to-hyperframes`는 온디맨드 스킬이라 설치돼 있지 않을 수 있다.[](source:hf-route) | 표시 |
| R21 · 넘김 | 5종 밖 스타일(채널·영화를 이름으로 댄 경우)이면 `style-sampling`이 한 줄로 알리고 두 길을 제안한다. 영상 하나를 프레임 단위로 다시 만들고 내용을 바꾸는 `/reverse-any-video`가 그중 하나다. 사용자가 고른다.[](source:sty-outside) | 표시 |
| R22 · 넘김 | 다른 길은 그 스타일의 문법을 가져와 새 영화를 만드는 `/hyperframes`("From a reference")다. 이름만 댄 스타일은 예시 영상을 요청한다.[](source:sty-outside) | 생략(되돌아가는 선) |
| R14·R15 · 참고 | `reverse-any-video`는 결과물을 `/hyperframes` 계약에 맞춰 만들고, `remotion-to-hyperframes`는 Native 단계에서 `/hyperframes` 계약으로 번역한다.[](source:rev-intro)[](source:rem-native) | 생략(되돌아가는 선) |
| R28 · 같은 계열 | `reverse-any-video`(영상 파일)와 `remotion-to-hyperframes`(영상 코드)는 모두 기존 작업을 HyperFrames로 가져와 원본과 프레임 단위로 대조한다. 직접 연결은 없다. 판정이며 두 description이 근거다.[](source:rev-intro)[](source:rem-levels) | 생략 |
| R23·R24 · 참고·공유 상태 | `style-sampling`은 생성 media에 `media-use`의 Credits 규칙을 따르고, 사용자가 말한 한도를 `.hyperframes/credit-limit.json`에 쓴다.[](source:sty-credit) | 생략 |

관계의 단일 원본은 `relations.md`다.

## 어떤 파일과 상태를 공유하나? {#state}

| 파일·상태 | 쓰는 스킬·주체 | 읽는 스킬·조건 |
|---|---|---|
| `.hyperframes/credit-limit.json` | `style-sampling`이 사용자가 말한 한도를 쓴다.[](source:sty-credit) | `media-use`의 유료 호출이 이 한도를 확인한다(지시상 동작). `reverse-any-video`는 한도가 있었다면 재개할 때 아직 유효한지 묻는다.[](source:rev-intro) |
| `templates/<slug>/` | `style-sampling`이 `templates pull`로 받는다. 이 저장소에는 없다.[](source:sty-start) | 원문에 명시 없음 |
| `REVERSE.md`, `TRANSLATION_NOTES.md` | `reverse-any-video`가 재현 결과를, `remotion-to-hyperframes`가 번역하지 못한 부분을 쓴다. 각 스킬 페이지의 감사 패널에서 확인한다. | 다른 스킬이 읽는다는 지시는 확인하지 못했다. |

## 어떤 선택을 피해야 하나? {#limits}

판정 · 새 영상을 기획하거나 스타일만 빌릴 때는 `reverse-any-video`가 맞지 않는다. 이 스킬의 원문에 직접 금지 문장은 없고, 영상 한 편을 그대로 복원하는 목적이라는 점과 `style-sampling`의 제안이 근거다.[](source:rev-intro)[](source:sty-outside) 또 `style-sampling`은 5종 템플릿을 기억이나 웹에서 다시 만들지 않는다.[](source:sty-start)

@callout level=open-question title="확인하지 못한 것"
이 페이지는 네 스킬의 SKILL.md와 원장만 근거로 썼다. `style-sampling`이 받는 외부 템플릿 안의 `REMIX.md`와 폴더 밖 참조는 열지 않았다. 부분 분석이다.
