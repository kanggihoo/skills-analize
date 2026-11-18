# 이미 있는 영상·코드·스타일에서 출발할 때 네 스킬은 어떻게 갈리나? {#group-start-from-reference}

에이전트는 `hyperframes`의 안내표로 요청 종류를 가르고, 영상 파일이면 `reverse-any-video`, 기존 영상 코드면 `remotion-to-hyperframes`, 검증된 스타일의 새 에피소드면 `style-sampling`으로 간다. **세 스킬은 서로 고르는 선택지이고, 안내표는 강제가 아니다.**[](source:hf-route)

- `hyperframes`는 안내표의 한 행으로 세 스킬을 가리키고 스스로 실행하지 않는다.[](source:hf-route)
- `reverse-any-video`와 `remotion-to-hyperframes`는 둘 다 결과를 `/hyperframes` 계약에 맞춰 만들고 원본과 프레임 단위로 대조한다.[](source:rev-top)[](source:rem-top)
- `style-sampling`은 5개 템플릿 밖의 스타일이면 두 길(`/reverse-any-video`, `/hyperframes`)을 제안하고 사용자가 고른다.[](source:sty-offer)
- 스킬 내부 규칙은 각 스킬의 개요 페이지에서 본다. 이 페이지는 스킬 사이의 갈림길과 주고받는 것만 다룬다.

@answer scope="hyperframes 컬렉션 · 묶음 start-from-reference · 스킬 4개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=3098961a8768980c88b0f52a476209e63154c4d1
@source hf-route title="요청별 안내표 중 복제·스타일·look 행" path=hyperframes/hyperframes/SKILL.md lines=62:66
@source hf-more title="deck·Remotion·Figma 안내" path=hyperframes/hyperframes/SKILL.md lines=79:79
@source hf-contract title="HyperFrames 계약 본문" path=hyperframes/hyperframes/SKILL.md lines=18:33
@source rev-top title="reverse 목표와 계약 준수" path=hyperframes/reverse-any-video/SKILL.md lines=12:14
@source rev-desc title="reverse frontmatter" path=hyperframes/reverse-any-video/SKILL.md lines=1:4
@source rem-top title="import 수준과 Native 변환" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=10:28
@source rem-desc title="remotion frontmatter" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=1:4
@source sty-desc title="style-sampling frontmatter" path=hyperframes/style-sampling/SKILL.md lines=1:4
@source sty-which title="템플릿 고르기" path=hyperframes/style-sampling/SKILL.md lines=26:30
@source sty-offer title="5종 밖 스타일의 두 길 제안" path=hyperframes/style-sampling/SKILL.md lines=30:30
@source sty-credit title="credit 한도 파일" path=hyperframes/style-sampling/SKILL.md lines=52:54
@source sty-plug title="plugin 규칙 지목(style-sampling)" path=hyperframes/style-sampling/SKILL.md lines=6:6
@source rev-plug title="plugin 규칙 지목(reverse)" path=hyperframes/reverse-any-video/SKILL.md lines=6:6
@source rem-plug title="plugin 규칙 지목(remotion)" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=6:6

## 에이전트는 어떤 요청에서 어느 스킬로 가나? {#flow span=12}

`hyperframes`가 요청 종류를 가르고, 갈림길마다 한 스킬이 맡는다. 그림은 갈림길과 제안만 그렸고("다른 영상의 스타일" 길은 `style-sampling`의 제안 노드에만 그렸다) 각 스킬 안의 단계는 개요 페이지에 맡긴다.

@workflow id=ref-flow title="기존 자료에서 출발하는 흐름"
| hf | hyperframes 안내표 읽기 | frontend | source:hf-route |
| kind | 무엇에서 출발하나? | backend | source:hf-route |
| rev | reverse-any-video | backend | source:rev-top |
| rem | remotion-to-hyperframes | backend | source:rem-top |
| sty | style-sampling | backend | source:sty-which |
| ep | 템플릿으로 에피소드 만들기 | backend | source:sty-which |
| offer | 두 길 제안 | external | source:sty-offer |
| rev2 | reverse-any-video로 복제 | backend | source:sty-offer |
| look | hyperframes From a reference | frontend | source:sty-offer |
| hf > kind | |
| kind > rev | 영상 파일 |
| kind > rem | 영상 코드 |
| kind > sty | 검증된 스타일 |
| sty > ep | 5종 중 하나 | emphasis |
| sty > offer | 5종 밖 |
| offer > rev2 | 프레임 단위 복제 |
| offer > look | 새 영화 |

@steps id=ref-steps
| s-hf | hyperframes 안내표 읽기 | 요청이 복제·스타일 에피소드·다른 영상의 스타일·Remotion source 중 무엇인지 안내표로 확인한다.[](source:hf-route)[](source:hf-more) | ref-flow | hf |
| s-kind | 무엇에서 출발하나? | 영상 파일이면 `/reverse-any-video`, Remotion 등 영상 코드면 `/remotion-to-hyperframes`, 검증된 스타일의 에피소드면 `/style-sampling`, 다른 영상의 스타일이면 `references/look.md`로 간다. 안내표의 한 행이고 강제가 아니다.[](source:hf-route)[](source:hf-more) | ref-flow | kind |
| s-rev | reverse-any-video | 영상 하나를 편집 가능한 HyperFrames 프로젝트로 다시 만들고 원본과 프레임 단위로 대조한다.[](source:rev-top) | ref-flow | rev |
| s-rem | remotion-to-hyperframes | 기존 영상 코드를 Native, Hosted, Media 중 가장 높은 수준으로 옮기고 원본과 대조한다.[](source:rem-top) | ref-flow | rem |
| s-sty | style-sampling | 사용자가 템플릿을 말했거나 주제가 하나에만 맞으면 그대로 진행하고, 5종 밖의 스타일(채널이나 영화를 이름으로 댄 경우)이면 한 줄로 알린다.[](source:sty-which) | ref-flow | sty |
| s-ep | 템플릿으로 에피소드 만들기 | 템플릿을 pull해 사용자 주제의 새 에피소드를 만든다. 이 페이지는 그 내부를 다루지 않는다.[](source:sty-which) | ref-flow | ep |
| s-offer | 두 길 제안 | `/reverse-any-video`와 `/hyperframes`(From a reference) 두 길을 제안하고 사용자가 고른다. 고르기 전에 아무것도 pull하지 않는다.[](source:sty-offer) | ref-flow | offer |
| s-rev2 | reverse-any-video로 복제 | 사용자가 고르면 예시 영상 하나를 프레임 단위로 다시 만들고 내용을 바꾸는 `/reverse-any-video`로 간다. 내부는 위 `reverse-any-video` 단계와 같다.[](source:sty-offer) | ref-flow | rev2 |
| s-look | hyperframes From a reference | 그 스타일의 문법을 가져와 사용자 주제의 새 영화를 `/hyperframes`로 만든다.[](source:sty-offer)[](source:hf-route) | ref-flow | look |

## 스킬 사이에 무엇을 넘기고 참고하나? {#relations span=12}

원장의 관계 중 이 묶음의 스킬끼리 이어진 행이다. 다음 안내는 제안이고 자동 실행이 아니다.

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| `hyperframes` {#g2-r04} | `reverse-any-video` | 다음 안내 | "복사하거나 다시 만들 영상"이 요청일 때. 안내표의 한 행이고 강제 아님[](source:hf-route) |
| `hyperframes` {#g2-r05} | `style-sampling` | 다음 안내 | "검증된 스타일의 에피소드"가 요청일 때. 안내표의 한 행이고 강제 아님[](source:hf-route) |
| `hyperframes` {#g2-r07} | `remotion-to-hyperframes` | 다음 안내 | 입력이 Remotion source일 때 `/remotion-to-hyperframes`. 온디맨드 스킬이라 설치돼 있지 않을 수 있다[](source:hf-more) |
| `reverse-any-video`, `remotion-to-hyperframes`, `style-sampling` {#g2-r13} | `hyperframes` | 참고 | 세 스킬이 모두 첫 줄에서 HyperFrames plugin 안일 때만 `plugin-installation.md` 규칙을 따르라고 한다. 원장 행은 일곱 스킬을 묶었다[](source:rev-plug)[](source:rem-plug)[](source:sty-plug) |
| `reverse-any-video` {#g2-r14} | `hyperframes` | 참고 | 결과물은 `/hyperframes` 계약에 맞춰 만든다. 의무 어조[](source:rev-top) |
| `remotion-to-hyperframes` {#g2-r15} | `hyperframes` | 참고 | Native 단계에서 `/hyperframes` 계약으로 번역하고 Hosted 단계는 `runtimes.md`의 seek 규약을 따른다[](source:rem-top) |
| `style-sampling` {#g2-r21} | `reverse-any-video` | 다음 안내 | 5개 템플릿에 없는 스타일이면 한 줄로 알리고 두 길을 제안한다. 사용자가 고르고, 고르기 전에 아무것도 pull하지 않는다. 이름만 댄 스타일은 예시 영상을 요청한다[](source:sty-offer) |
| `style-sampling` {#g2-r22} | `hyperframes` | 다음 안내 | R21의 다른 길. 그 스타일의 문법을 가져와 새 영화를 만드는 `/hyperframes`("From a reference", `look.md`). 제안이고 사용자가 고른다[](source:sty-offer) |
| `reverse-any-video` {#g2-r28} | `remotion-to-hyperframes` | 대안 | 둘 다 기존 작업(영상 파일 또는 영상 코드)을 HyperFrames로 가져와 원본과 프레임 단위로 대조한다. 직접 연결 없음. 근거 방식은 추론이다[](source:rev-desc)[](source:rem-desc) |

이 묶음 밖으로 가는 관계(R06 `/slideshow`, R08 `/figma`, R16~R20, R23, R24)는 생략했다.

## 어떤 파일과 상태를 함께 쓰나? {#state span=12}

이 묶음의 스킬 사이에서 원장이 확인한 공유 파일은 없다. 묶음 안에서 오가는 것은 스킬이 아니라 사용자의 선택과 예시 영상이다.

| 파일·상태 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| 예시 영상 | 사용자가 준다. 이름만 댄 스타일이면 `style-sampling`이 요청한다[](source:sty-offer) | `reverse-any-video` 또는 `/hyperframes`의 `look.md` 경로[](source:sty-offer) |
| `.hyperframes/credit-limit.json` | `style-sampling`이 사용자가 말한 한도를 쓴다[](source:sty-credit) | 원문에 명시 없음. 원장은 `media-use`가 이 파일로 유료 호출을 막는다고 적었다(묶음 밖) |
