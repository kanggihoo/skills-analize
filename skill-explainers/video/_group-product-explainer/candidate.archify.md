# product-explainer 묶음은 어떻게 고르나 {#product-explainer-group}

`explainer-default`, `explainer-engaging`, `explainer-high-energy`는 한 작성자가 만든 세 형제 스킬이다. 서로 부르거나 파일을 주고받지 않고, 사용자가 영상 길이와 연출 느낌에 따라 하나를 고른다(r06~r08).[](source:pe-readme-sisters)[](source:pe-readme-table)

- `explainer-default`는 45~90초(기본 60초)의 차분한 제품 데모다. 짧은 문구 뒤에 실제 UI 동작을 크게 보여 준다.[](source:pe-readme-table)
- `explainer-engaging`은 10~30초(기본 12초 루프) 원테이크 영상이다. 한 요소가 캔버스의 정거장들을 순서대로 지난 뒤 전체 그림으로 빠진다.[](source:pe-readme-table)
- `explainer-high-energy`는 12~20초(기본 15초)의 빠른 홍보 영상이다. 박자마다 장면을 바꾸며 도형이 다음 장면으로 이어진다.[](source:pe-readme-table)

@answer scope="video/Barty-Bart product-explainer 3종 · 커밋 f53b74e · 지시상 동작 · 렌더 결과는 확인하지 못함"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=f53b74e8bae4a9f9a8a11d2d3d0dc2b980b855ed
@source pe-readme-sisters title="explainer-default/README.md · 형제 스킬 안내" path=video/Barty-Bart/explainer-default/README.md lines=7:9
@source pe-readme-table title="explainer-default/README.md · 세 스킬 비교표" path=video/Barty-Bart/explainer-default/README.md lines=11:15
@source pe-readme-use title="explainer-default/README.md · 사용법과 산출물" path=video/Barty-Bart/explainer-default/README.md lines=17:21
@source pe-se-desc title="sound-effects/SKILL.md · r04 관련 description" path=video/Barty-Bart/sound-effects/SKILL.md lines=3:3
@source pe-se-nosynth title="sound-effects/SKILL.md · 합성 금지 규칙" path=video/Barty-Bart/sound-effects/SKILL.md lines=28:28

## 세 스킬 중 무엇을 고르나 {#choose span=12}

@workflow id=pe-choice title="product-explainer 선택 갈림길"
| pick | 제품 소개 영상 필요 | external |
| mood | 원하는 연출과 길이는? | backend |
| def | explainer-default (차분한 데모) | backend |
| eng | explainer-engaging (원테이크) | backend |
| high | explainer-high-energy (빠른 홍보) | backend |
| pick > mood | |
| mood > def | 45~90초 데모 |
| mood > eng | 10~30초 흐름 |
| mood > high | 12~20초 홍보 |

@steps id=pe-steps
| pick | 제품 소개 영상 필요 | 사용자가 제품 설명과 원하는 길이·분위기를 정해 세 스킬 중 하나를 직접 부른다. | pe-choice | pick |
| mood | 원하는 연출과 길이는? | README 비교표를 기준으로 길이와 화면 구성을 고른다. 세 스킬 사이에 실행 순서는 없다. | pe-choice | mood |
| def | explainer-default (차분한 데모) | 1단계 브리프 질문 뒤 대본과 `seek(t)` HTML을 만들고 초안·최종 MP4로 렌더링한다. | pe-choice | def |
| eng | explainer-engaging (원테이크) | 한 주인공 요소가 스테이션을 지나는 단일 캔버스 HTML을 만들고 MP4로 렌더링한다. | pe-choice | eng |
| high | explainer-high-energy (빠른 홍보) | 박자에 맞춘 빠른 전환과 도형 연결 장면으로 HTML을 만들고 MP4로 렌더링한다. | pe-choice | high |

세 스킬은 모두 질문 한 번으로 브리프를 받고 사실을 지어내지 않는다.[](source:pe-readme-use)

## 세 스킬은 무엇을 남기나 {#state}

세 스킬은 서로 파일을 주고받지 않는다. 각 스킬이 독립된 작업 폴더에 `demo.html`, 초안 MP4, 최종 MP4, 무음 MP4를 남긴다.[](source:pe-readme-use)

| 파일 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `demo.html` | explainer-default, explainer-engaging, explainer-high-energy | 같은 스킬의 렌더 단계·사용자 브라우저 |
| 초안·최종·무음 MP4 | explainer-default, explainer-engaging, explainer-high-energy | 사용자 |

## 그림에서 뺀 관계와 쓰면 안 될 때 {#omitted}

| rel-id | 종류 | 그림에 있나 | 내용 |
| --- | --- | --- | --- |
| r06~r08 | 대안 | 있음 | README가 세 스킬을 형제 스킬로 소개하며 연출과 길이를 비교한다[](source:pe-readme-sisters) |
| r04 | 결과 전달 | 생략 | `sound-effects`가 Claude Code 모션그래픽 영상을 대상으로 하지만, 세 스킬은 자체 `buildAudio`로 소리를 합성하고 `sound-effects`는 합성을 금한다. 실제 연계 여부는 `미확인`이다[](source:pe-se-desc)[](source:pe-se-nosynth) |
| r11~r14 | 대안 | 생략 | `bang-motion`, `lemo-opuscar`, `brag`와 목적이 겹치지만 직접 연결은 없다 |

@callout level=open-question title="확인하지 못한 것"
세 스킬을 실행하지 않아 실제 `demo.html`과 MP4 렌더 결과, 그리고 `sound-effects`와의 후속 연계 가능 여부는 확인하지 못했다.
