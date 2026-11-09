# garden-visual 묶음은 어떻게 이어지나 {#garden-visual-group}

garden-skills의 시각 결과물 스킬 다섯 개는 차례로 거치는 단계가 아니다. 사용자가 원하는 **결과물 종류**에 따라 하나를 고르는 선택지이고, 서로 "그건 저 스킬로 가라"고 적어 잘못 켜진 요청을 돌려보낸다(r30~r34). 스킬이 도중에 다른 스킬을 쓰는 곳은 `web-design-engineer`가 참조 이미지를 `gpt-image-2`로 만드는 한 곳뿐이다(r35).[](source:ms-scope)[](source:wd-scope)[](source:wd-img)

- 웹 페이지·랜딩·프로토타입은 `web-design-engineer`, 소재를 읽기 좋은 장문 기사로 바꾸는 일은 `beautiful-article`이다.[](source:wd-scope)[](source:ba-readme)
- 클릭으로 넘기는 발표는 `web-video-presentation`, 렌더한 MP4 영상은 `motion-showreel`이다.[](source:ms-scope)
- `gpt-image-2`는 이미지를 직접 요청받을 때도 켜지고, `web-design-engineer`의 선택적 image-first 분기에서도 쓰인다.[](source:gi-fm)[](source:wd-img)

@answer scope="design/garden-skills 다섯 스킬 · 커밋 4e3fc89 · 지시상 동작 · kb-retriever는 시각 결과물이 아니라 제외"
@meta locale=ko
@source ba-fm title="design/garden-skills/beautiful-article/SKILL.md · frontmatter" path=design/garden-skills/beautiful-article/SKILL.md lines=1:4
@source ba-flow title="beautiful-article/SKILL.md · Checkpoint 1·2·3" path=design/garden-skills/beautiful-article/SKILL.md lines=36:49
@source ba-readme title="beautiful-article/README.md · 웹앱·랜딩은 web-design-engineer로(r34)" path=design/garden-skills/beautiful-article/README.md lines=421:421
@source gi-fm title="design/garden-skills/gpt-image-2/SKILL.md · frontmatter(세 모드)" path=design/garden-skills/gpt-image-2/SKILL.md lines=1:4
@source gi-out title="gpt-image-2/SKILL.md · Mode A 저장 경로" path=design/garden-skills/gpt-image-2/SKILL.md lines=36:39
@source gi-switch title="gpt-image-2/SKILL.md · 모드 스위치 환경변수" path=design/garden-skills/gpt-image-2/SKILL.md lines=112:112
@source ms-fm title="design/garden-skills/motion-showreel/SKILL.md · frontmatter" path=design/garden-skills/motion-showreel/SKILL.md lines=1:4
@source ms-scope title="motion-showreel/SKILL.md · 적용 범위 표(r30·r31)" path=design/garden-skills/motion-showreel/SKILL.md lines=22:31
@source ms-len title="motion-showreel/SKILL.md · 최대 20분" path=design/garden-skills/motion-showreel/SKILL.md lines=33:33
@source wv-fm title="design/garden-skills/web-video-presentation/SKILL.md · frontmatter" path=design/garden-skills/web-video-presentation/SKILL.md lines=1:4
@source wv-cp title="web-video-presentation/SKILL.md · Checkpoint Plan·Audio" path=design/garden-skills/web-video-presentation/SKILL.md lines=33:44
@source wd-fm title="design/garden-skills/web-design-engineer/SKILL.md · frontmatter" path=design/garden-skills/web-design-engineer/SKILL.md lines=1:4
@source wd-scope title="web-design-engineer/SKILL.md · 적용 범위와 전용 스킬로 넘기기(r32·r33)" path=design/garden-skills/web-design-engineer/SKILL.md lines=14:18
@source wd-img title="web-design-engineer/references/design-calibration.md · 선택적 image-first 분기(r35)" path=design/garden-skills/web-design-engineer/references/design-calibration.md lines=113:132

## 어떤 결과물이면 어느 스킬로 가나 {#route span=12}

@workflow id=garden-route title="결과물 종류에 따른 garden 스킬 선택"
| req | 시각 결과물 요청 | external |
| kind | 결과물 종류? | backend |
| gi | gpt-image-2 | backend |
| wde | web-design-engineer | backend |
| ba | beautiful-article | backend |
| wvp | web-video-presentation | backend |
| ms | motion-showreel | backend |
| req > kind | |
| kind > wde | 웹 페이지 |
| kind > ba | 장문 기사 |
| kind > wvp | 클릭형 발표 |
| kind > ms | MP4 영상 |
| wde > gi | 참조 이미지 | emphasis |

@steps id=route-steps
| kind | 결과물 종류? | 판정: 이 갈림길은 다섯 description과 서로 돌려보내는 규칙(r30~r34)을 모아 그린 것이다. 한 스킬이 이 분기를 정해 두지는 않았다. | garden-route | kind |
| wde | web-design-engineer | 페이지·대시보드·프로토타입·슬라이드를 만든다. 소재→장문 기사, 원고→녹화용 발표는 "있으면 전용 스킬로" 넘긴다(r32·r33). | garden-route | wde |
| ba | beautiful-article | URL·PDF·문서를 단일 HTML 기사로 만든다. Checkpoint 1·2·3에서 반드시 멈춰 사람 확인을 받는다. | garden-route | ba |
| wvp | web-video-presentation | 글이나 원고를 클릭으로 넘기는 16:9 웹 발표로 만든다. `Checkpoint Plan`에서 다섯 가지를 한 번에 맞추고, `Checkpoint Audio`에서 음성 합성 여부를 묻는다. | garden-route | wvp |
| ms | motion-showreel | 코드로 모션 영상을 만들어 MP4와 소스로 낸다. 클릭형 발표나 웹페이지 요청이면 다른 스킬로 보낸다(r30·r31). | garden-route | ms |
| gi | gpt-image-2 | 그림에는 `web-design-engineer`가 위임하는 길만 그렸다. 이미지를 직접 요청받아도 켜진다. 환경에 따라 직접 생성(Mode A), 호스트 도구에 맡기기(Mode B), 프롬프트만 주기(Mode C)로 갈린다. | garden-route | gi |

근거: 적용 범위 표와 넘기는 대상은 `motion-showreel` 22~31줄,[](source:ms-scope) `web-design-engineer` 14~18줄,[](source:wd-scope) `beautiful-article` README 421줄이다.[](source:ba-readme) 사람 확인 지점은 `beautiful-article` 36~49줄,[](source:ba-flow) `web-video-presentation` 33~44줄이다.[](source:wv-cp)

## 서로 무엇을 넘기나 {#handoff}

| rel-id | from → to | 종류 | 근거 방식 | 조건·강도 |
| --- | --- | --- | --- | --- |
| r30 | `motion-showreel` → `web-video-presentation` | 넘김 | 명시-이름 | 클릭 진행, 현장 발표, 대화형 웹 데모, 글→원고 작업이면 그쪽을 쓰라[](source:ms-scope) |
| r31 | `motion-showreel` → `web-design-engineer` | 넘김 | 명시-이름 | 웹페이지·랜딩·프로토타입·정적 시안은 ❌로 표시하고 그쪽을 쓰라[](source:ms-scope) |
| r32 | `web-design-engineer` → `beautiful-article` | 넘김 | 명시-역할 | 소재→장문 HTML 기사는 대상이 아니다. "있으면" 전용 스킬로. 이름은 적지 않았다[](source:wd-scope) |
| r33 | `web-design-engineer` → `web-video-presentation` | 넘김 | 명시-역할 | 원고 박자→녹화용 웹 발표는 대상이 아니다. "있으면" 전용 스킬로[](source:wd-scope) |
| r34 | `beautiful-article` → `web-design-engineer` | 넘김 | 명시-이름 | README만 적는다. 웹앱·대시보드·폼·프로토타입·랜딩이면 그쪽으로 가고, 애매하면 멈추고 묻는다[](source:ba-readme) |
| r35 | `web-design-engineer` → `gpt-image-2` | 내부 위임 | 명시-이름 | 시각이 중요한 신규·전면 개편 작업에서만. Figma·디자인 시스템이 있거나 대시보드·폼이면 건너뛴다. 없으면 호스트 이미지 흐름이나 정직한 자산 요구로 대신한다[](source:wd-img) |
| r50 | `motion-showreel` · `web-video-presentation` | 같은 계열 | 추론 | 둘 다 "영상" 결과물을 코드로 만든다. 렌더 MP4와 클릭형 웹 발표로 나뉜다[](source:ms-fm)[](source:wv-fm) |

@callout level=note title="r35는 이미지를 받아 다시 돌아온다"
`web-design-engineer`는 생성한 이미지를 페이지에 그대로 붙이지 않는다. 구현 결정을 뽑는 참조로 쓰고, 코드나 사용자가 준 브랜드 자산과 충돌하면 그쪽을 따른다.[](source:wd-img) 판정: `gpt-image-2`가 Mode C로 돌면 이미지 대신 프롬프트만 돌아온다. 이 경우 어떻게 이어 가는지는 원문에 명시 없음이다.[](source:gi-fm)

## 함께 건드리는 파일이 있나 {#state}

| 파일·상태 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| `garden-gpt-image-2/prompt/`, `garden-gpt-image-2/image/` | `gpt-image-2`(Mode A일 때)[](source:gi-out) | `web-design-engineer`가 참조로 쓸 수 있다. 경로를 읽으라는 지시는 원문에 명시 없음 |
| `ENABLE_GARDEN_IMAGEGEN` 환경변수 | 사용자 | `gpt-image-2`가 Mode A 여부를 정한다[](source:gi-switch) |

다른 네 스킬은 각자 자기 프로젝트 폴더에 결과물을 만든다. 같은 파일을 함께 읽고 쓰는 곳은 원문에 없다. 각 스킬의 단계와 수치는 스킬 페이지에 있다. 예: `design/garden-skills/motion-showreel/motion-showreel.html`(최대 20분, 1200초)[](source:ms-len).

@callout level=open-question title="그림에서 뺀 것과 확인하지 못한 것"
`web-design-engineer`는 `site-design-choice` 묶음(작성자가 다른 웹 디자인 스킬 비교)에도 속한다. 그 관계(r43, r45)는 이 페이지에서 뺐다. 같은 컬렉션의 `kb-retriever`는 시각 결과물을 만들지 않아 이 묶음에 넣지 않았다. 다섯 스킬을 실제로 실행해 서로 넘기는 장면은 확인하지 않았다.
