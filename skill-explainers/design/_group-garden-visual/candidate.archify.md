# 묶음: garden-visual — Garden 계열 시각 아티클·이미지·영상·지식검색을 수행한다 {#overview}

이 묶음은 Garden 계열 6개 스킬이 산출물 형태(웹 앱, 장문 아티클, 구술 발표, 모션 영상, 이미지, 로컬 지식 검색)에 따라 서로 경계를 나누고 필요한 이미지 생성을 위임하는 구성을 보여 준다.

- `web-design-engineer`가 이미지 우선 탐색 분기에서 `gpt-image-2`를 선택적으로 호출하고, `beautiful-article`·`motion-showreel`·`web-video-presentation`·`web-design-engineer`는 요청 성격에 따라 서로를 `대안`으로 라우팅한다.[](source:wde-gpt)[](source:wde-scope)[](source:ms-scope)[](source:ba-readme)
- `kb-retriever`는 로컬 지식베이스 검색을 단독으로 맡아 다른 5개 스킬과 직접 연결은 없다.[](source:skb)

@answer scope="design/_group-garden-visual · 6개 스킬 · 관계 원장 기준"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source sba title="beautiful-article 소개" path=design/garden-skills/beautiful-article/SKILL.md lines=1:21
@source ba-readme title="beautiful-article의 웹 앱 라우팅" path=design/garden-skills/beautiful-article/README.md lines=420:421
@source sgpt title="gpt-image-2 소개" path=design/garden-skills/gpt-image-2/SKILL.md lines=1:20
@source skb title="kb-retriever 소개" path=design/garden-skills/kb-retriever/SKILL.md lines=1:20
@source sms title="motion-showreel 소개" path=design/garden-skills/motion-showreel/SKILL.md lines=1:20
@source ms-scope title="motion-showreel 라우팅 표" path=design/garden-skills/motion-showreel/SKILL.md lines=28:30
@source swde title="web-design-engineer 소개" path=design/garden-skills/web-design-engineer/SKILL.md lines=1:18
@source wde-scope title="web-design-engineer 제외 범위" path=design/garden-skills/web-design-engineer/SKILL.md lines=14:19
@source wde-gpt title="web-design-engineer의 gpt-image-2 호출" path=design/garden-skills/web-design-engineer/references/design-calibration.md lines=132:132
@source swvp title="web-video-presentation 소개" path=design/garden-skills/web-video-presentation/SKILL.md lines=1:15

## 스킬 사이의 선택과 흐름 {#flow span=12}

@architecture id=group-map title="garden-visual 연결 구조"
| wde | web-design-engineer | backend |
| gpt | gpt-image-2 | backend |
| ba | beautiful-article | backend |
| wvp | web-video-presentation | backend |
| ms | motion-showreel | backend |
| kb | kb-retriever | backend |
| wde > gpt | 호출 | |
| wde > ba | 대안 | dashed |
| wde > wvp | 대안 | dashed |
| ba > wde | 대안 | dashed |
| ms > wde | 대안 | dashed |
| ms > wvp | 대안 | dashed |

@steps id=group-steps
| s-wde | web-design-engineer | 이 단계에서 하는 일: 웹페이지·대시보드·프로토타입을 설계·구현하며 필요 시 `gpt-image-2`에 이미지를 위임한다.[](source:swde)[](source:wde-gpt) | group-map | wde |
| s-gpt | gpt-image-2 | 이 단계에서 하는 일: 실행 환경을 판별해 GPT Image 2 프롬프트와 이미지를 생성·편집한다.[](source:sgpt) | group-map | gpt |
| s-ba | beautiful-article | 이 단계에서 하는 일: 원자료을 8단계 하네스와 `reacticle` 컴포넌트로 편집해 오프라인 HTML 아티클을 만든다.[](source:sba) | group-map | ba |
| s-wvp | web-video-presentation | 이 단계에서 하는 일: 원고를 구술 대본과 클릭 진행형 16:9 웹 무대로 구축해 녹화까지 지원한다.[](source:swvp) | group-map | wvp |
| s-ms | motion-showreel | 이 단계에서 하는 일: 결정론적 웹 페이지와 타임라인·오디오로 최대 20분 모션 그래픽 MP4를 렌더링한다.[](source:sms) | group-map | ms |
| s-kb | kb-retriever | 이 단계에서 하는 일: 계층적 `data_structure.md` 색인과 점진적 검색으로 로컬 지식베이스에서 근거를 찾는다.[](source:skb) | group-map | kb |

## 주고받는 것과 관계 표 {#relations span=12}

| 누가 | 누구를 | 관계 | 조건과 주고받는 것 |
| --- | --- | --- | --- |
| `web-design-engineer` {#r-10} | `gpt-image-2` | 호출 | 이미지 우선 탐색 분기에서 가용하면 구조화된 이미지 생성을 위임한다(이미지 프롬프트·에셋).[](source:wde-gpt) |
| `web-design-engineer` {#r-11} | `beautiful-article` | 대안 | 원자료→장문 HTML 아티클 변환은 전용 스킬로 라우팅한다.[](source:wde-scope) |
| `web-design-engineer` {#r-12} | `web-video-presentation` | 대안 | 구술 비트→녹화용 웹 영상 프레젠테이션은 전용 스킬로 라우팅한다.[](source:wde-scope) |
| `beautiful-article` {#r-05} | `web-design-engineer` | 대안 | 웹 앱·대시보드·폼·프로토타입·랜딩 페이지는 `web-design-engineer` 소관으로 안내하고 모호하면 멈춰 묻는다.[](source:ba-readme) |
| `motion-showreel` {#r-07} | `web-video-presentation` | 대안 | 클릭 진행·현장 발표·아티클→구술 대본 변환 요청은 `web-video-presentation`으로 라우팅한다.[](source:ms-scope) |
| `motion-showreel` {#r-08} | `web-design-engineer` | 대안 | 웹페이지·랜딩·인터랙티브 프로토타입·정적 시안은 `web-design-engineer`로 라우팅한다.[](source:ms-scope) |

## 공유 상태 {#shared-state span=12}

| 파일·폴더 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| 없음(각 스킬이 자체 작업 폴더 사용: `garden-gpt-image-2/`, `knowledge/`, `presentation/` 등) | - | - |