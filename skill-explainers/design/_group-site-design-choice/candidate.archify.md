# 묶음: site-design-choice — 랜딩 페이지와 웹사이트를 처음부터 설계·구축한다 {#overview}

이 묶음은 신규 웹사이트나 랜딩 페이지를 제작할 때 선택할 수 있는 5개 독립 워크플로우 스킬을 모았다. 모두 웹사이트 제작이라는 같은 목표를 갖지만, 직접 호출이나 공유 파일로 이어지지 않고 작업 방식과 검증 수단에 따라 하나를 골라 쓰는 선택지 관계다.

- 초보자 안내와 호스팅 배포까지 한 번에 끝내려면 `10k-websites`, 전환율 중심 카피와 단일 `SKILL.md` 규칙을 원하면 `landing-page-design`, 무작위 뽑기와 Chrome `Stop` 훅 게이트를 원하면 `design-taste-frontend`, 5다이얼·3단계 확인을 원하면 `web-design-engineer`, 전 주기 커맨드와 `DESIGN.md`를 원하면 `impeccable`을 고른다.[](source:s10k)[](source:selaya)[](source:staste)[](source:swde)[](source:simp)
- 결과로 남는 것은 각 스킬이 만드는 웹사이트 소스 코드와 선택적 디자인 문서(`DESIGN.md`, `brand-spec.md`)다.

@answer scope="design/_group-site-design-choice · 5개 스킬 · 관계 원장 기준"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source s10k title="10k-websites 소개" path=design/10k-websites/10k-websites/SKILL.md lines=1:15
@source selaya title="landing-page-design 소개" path=design/elayadesign/landing-page-design/SKILL.md lines=1:18
@source selaya-ref title="landing-page-design 출처 고지" path=design/elayadesign/landing-page-design/SKILL.md lines=451:451
@source staste title="design-taste-frontend 소개" path=design/taste/design-taste-frontend/SKILL.md lines=1:20
@source swde title="web-design-engineer 소개" path=design/garden-skills/web-design-engineer/SKILL.md lines=1:18
@source simp title="impeccable 소개" path=design/impeccable/impeccable/SKILL.md lines=1:20

## 스킬 사이의 선택과 흐름 {#flow span=12}

다섯 스킬은 순차 파이프라인이 아니라 작업 스타일에 따라 고르는 5개 선택지다. 그림에는 `landing-page-design`과 `design-taste-frontend` 사이의 참고·대안 연결만 표시했다.

@architecture id=group-map title="site-design-choice 선택지"
| w10k | 10k-websites | backend |
| elaya | landing-page-design | backend |
| taste | design-taste-frontend | backend |
| wde | web-design-engineer | backend |
| imp | impeccable | backend |
| elaya > taste | 참고 · 대안 | dashed |
| elaya > w10k | 대안 | dashed |

@steps id=group-steps
| s-w10k | 10k-websites | 이 단계에서 하는 일: OpenArt 이미지·영상과 내장 씬 엔진으로 스크롤 웹사이트를 만들고 Hostinger 배포까지 안내한다.[](source:s10k) | group-map | w10k |
| s-elaya | landing-page-design | 이 단계에서 하는 일: 단일 오퍼·타깃·CTA 전략과 엄격한 시각 규칙으로 전환형 랜딩 페이지를 만든다.[](source:selaya) | group-map | elaya |
| s-taste | design-taste-frontend | 이 단계에서 하는 일: 업종별 뽑기와 내장 키트·Chrome `Stop` 훅 게이트로 AI 티 없이 웹사이트를 제작한다.[](source:staste) | group-map | taste |
| s-wde | web-design-engineer | 이 단계에서 하는 일: 5개 설계 다이얼과 3개 확인 지점을 거쳐 웹페이지·대시보드·프로토타입을 구현한다.[](source:swde) | group-map | wde |
| s-imp | impeccable | 이 단계에서 하는 일: 24+개 서브 커맨드와 전용 서브에이전트·훅으로 UI 구축·비평·다듬기를 전 주기 관리한다.[](source:simp) | group-map | imp |

## 주고받는 것과 관계 표 {#relations span=12}

| 누가 | 누구를 | 관계 | 조건과 주고받는 것 |
| --- | --- | --- | --- |
| `landing-page-design` {#r-01} | `design-taste-frontend` | 참고 | redesign audit·콘텐츠·모션 아이디어를 `taste-skill`에서 차용·재작성했다(전달물 없음).[](source:selaya-ref) |
| `landing-page-design` {#r-03} | `10k-websites` | 대안 | 추론: 같은 웹사이트 제작 목적이나 직접 호출·파일 공유는 없다.[](source:selaya)[](source:s10k) |
| `landing-page-design` {#r-04} | `design-taste-frontend` | 대안 | 추론: 같은 웹사이트 제작 목적이나 직접 호출·파일 공유는 없다.[](source:selaya)[](source:staste) |

## 공유 상태 {#shared-state span=12}

| 파일·폴더 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| 없음(각 스킬이 독립 작업 폴더 사용: `.10k/`, `.taste-skill/`, `.impeccable/`) | - | - |