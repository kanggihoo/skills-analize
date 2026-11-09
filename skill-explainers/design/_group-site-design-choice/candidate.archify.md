# 랜딩 페이지·회사 사이트는 어느 스킬로 만드나 {#site-design-choice-group}

이 묶음의 다섯 스킬은 서로를 부르지 않는 대안이다. 작성자가 모두 다르고, 같은 요청("랜딩 페이지 만들어 줘")에 다섯 다 켜질 수 있다. 그래서 고르는 기준은 이름이 아니라 **에이전트에게 무엇을 고정시키고 싶은가**다(판정, 같은 계열 r40~r45).[](source:lp-fm)[](source:tf-fm)[](source:im-fm)[](source:tk-fm)[](source:wd-fm)

- 고정된 시각 규칙과 전환율 중심 카피를 원하면 `landing-page-design`이다. 글꼴 4종, spacing 13개 값처럼 값 자체를 정해 둔다.[](source:lp-font)[](source:lp-space)
- 업종에 따라 허용 범위를 가르고 브라우저 검사기로 수치 판정까지 받으려면 `design-taste-frontend`다.[](source:tf-run6)[](source:tf-kind)
- 이미 있는 제품 UI를 비평·감사·다듬기까지 명령 단위로 다루려면 `impeccable`이다.[](source:im-design)
- 코드를 모르는 사람이 이미지·영상 생성부터 배포까지 맡기려면 `10k-websites`다.[](source:tk-intro)

@answer scope="design 컬렉션 다섯 스킬 · 커밋 4e3fc89 · 지시상 동작 · 결과물 품질은 비교하지 않음"
@meta locale=ko
@source lp-fm title="design/elayadesign/landing-page-design/SKILL.md · frontmatter" path=design/elayadesign/landing-page-design/SKILL.md lines=1:4
@source lp-intro title="landing-page-design/SKILL.md · 한 제안·한 대상·한 행동" path=design/elayadesign/landing-page-design/SKILL.md lines=6:12
@source lp-scope title="landing-page-design/SKILL.md · 적용 범위" path=design/elayadesign/landing-page-design/SKILL.md lines=14:18
@source lp-intake title="landing-page-design/SKILL.md · 질문 단계" path=design/elayadesign/landing-page-design/SKILL.md lines=24:50
@source lp-font title="landing-page-design/SKILL.md · 승인된 글꼴" path=design/elayadesign/landing-page-design/SKILL.md lines=146:162
@source lp-space title="landing-page-design/SKILL.md · spacing 값" path=design/elayadesign/landing-page-design/SKILL.md lines=239:259
@source lp-credit title="landing-page-design/SKILL.md · taste-skill 출처 표기(r40)" path=design/elayadesign/landing-page-design/SKILL.md lines=451:451
@source tf-fm title="design/taste/design-taste-frontend/SKILL.md · frontmatter" path=design/taste/design-taste-frontend/SKILL.md lines=1:12
@source tf-intro title="design-taste-frontend/SKILL.md · 실행 환경" path=design/taste/design-taste-frontend/SKILL.md lines=16:21
@source tf-hr title="design-taste-frontend/SKILL.md · house rule" path=design/taste/design-taste-frontend/SKILL.md lines=23:25
@source tf-kind title="design-taste-frontend/SKILL.md · 사진·글자·단색 업종" path=design/taste/design-taste-frontend/SKILL.md lines=68:70
@source tf-run6 title="design-taste-frontend/SKILL.md · 검사기 반복" path=design/taste/design-taste-frontend/SKILL.md lines=194:208
@source im-fm title="design/impeccable/impeccable/SKILL.md · frontmatter" path=design/impeccable/impeccable/SKILL.md lines=1:6
@source im-setup title="impeccable/SKILL.md · 세션 시작과 문맥 파일" path=design/impeccable/impeccable/SKILL.md lines=15:21
@source im-design title="impeccable/SKILL.md · 다듬기와 교체를 섞지 않는다" path=design/impeccable/impeccable/SKILL.md lines=23:28
@source im-animate title="impeccable/SKILL.md · animate 하위 명령(r46)" path=design/impeccable/impeccable/SKILL.md lines=58:58
@source im-vz title="impeccable/reference/visualize.md · comp 승인" path=design/impeccable/impeccable/reference/visualize.md lines=25:33
@source tk-fm title="design/10k-websites/10k-websites/SKILL.md · frontmatter" path=design/10k-websites/10k-websites/SKILL.md lines=1:4
@source tk-intro title="10k-websites/SKILL.md · 소개" path=design/10k-websites/10k-websites/SKILL.md lines=8:8
@source tk-pipe title="10k-websites/SKILL.md · 고정 도구" path=design/10k-websites/10k-websites/SKILL.md lines=19:21
@source tk-p5 title="10k-websites/SKILL.md · 이야기·지출 승인" path=design/10k-websites/10k-websites/SKILL.md lines=65:69
@source wd-fm title="design/garden-skills/web-design-engineer/SKILL.md · frontmatter" path=design/garden-skills/web-design-engineer/SKILL.md lines=1:4
@source wd-scope title="web-design-engineer/SKILL.md · 적용 범위" path=design/garden-skills/web-design-engineer/SKILL.md lines=14:18
@source wd-advisor title="web-design-engineer/SKILL.md · 막연한 요청이면 방향 조언 모드" path=design/garden-skills/web-design-engineer/SKILL.md lines=59:59

## 다섯 스킬은 무엇이 다른가 {#compare span=12}

| 기준 | `landing-page-design` | `design-taste-frontend` | `impeccable` | `10k-websites` | `web-design-engineer` |
| --- | --- | --- | --- | --- | --- |
| 먼저 하는 일 | 목표 행동·대상을 묻고 섹션을 정한다[](source:lp-intake) | 업종을 여섯 종류 중 하나로 정하고 스크립트로 색·글꼴·hero를 뽑는다[](source:tf-fm) | `scripts/impeccable context`로 `PRODUCT.md`·`DESIGN.md`를 읽는다[](source:im-setup) | 초보자의 브리프와 간단한 선택을 받는다[](source:tk-intro) | 디자인 문맥을 모으고, 막연하면 방향 조언 모드로 바꾼다[](source:wd-advisor) |
| 무엇을 고정하나 | 글꼴 4종, type scale, spacing 13개 값 {good:값이 정해져 있다}[](source:lp-font)[](source:lp-space) | house rule 9개와 업종별 허용 범위[](source:tf-hr)[](source:tf-kind) | 다듬기와 교체를 섞지 않는다는 원칙, 하위 명령별 절차[](source:im-design) | 이미지·영상은 OpenArt, 게시는 Hostinger {caution:도구가 고정}[](source:tk-pipe) | 원문에 고정 값 없음. 문맥에 맞춘 디자인 판단 |
| 어떻게 확인하나 | 원문에 자동 검사기 없음 | headless Chrome 검사기의 FAIL을 모두 고칠 때까지 반복 {good:수치 판정}[](source:tf-run6) | 별도 리뷰어 판정과 검사 엔진(엔진은 실행 시점에 내려받는다) | 배포한 사이트가 실제로 열리는지 확인 | description이 브라우저 확인·QA를 적용 대상으로 든다[](source:wd-fm) |
| 사람이 정하는 곳 | 빠진 정보만 한 번에 답한다. 답이 없으면 가정을 밝히고 계속한다[](source:lp-intake) | 원문 기준은 스킬 페이지 참고 | 방향 카드 고르기, comp 승인[](source:im-vz) | 이야기와 지출 승인, 로그인·결제[](source:tk-p5) | 방향 조언 모드에서 세 방향 중 고르기[](source:wd-advisor) |
| 범위 밖 | 기존 사이트 개선은 `redesign-existing-projects`(이 저장소에 없음)[](source:lp-scope) | Node 22와 Chrome 계열이 없는 환경, 대시보드·앱 화면[](source:tf-intro)[](source:tf-fm) | 백엔드 전용, UI가 아닌 작업[](source:im-fm) | framework·build step이 있는 사이트[](source:tk-pipe) | 백엔드·CLI, 장문 기사, 클릭형 영상 발표[](source:wd-scope) |

판정: 다섯 스킬 모두 호출 제한 필드가 없다. 한 프로젝트에 여러 개가 설치돼 있으면 같은 요청에 어느 것이 켜질지는 모델 판단에 달려 있다. 원문은 서로의 존재를 전제하지 않는다.[](source:lp-fm)[](source:tf-fm)[](source:im-fm)[](source:tk-fm)[](source:wd-fm)

## 서로 어떻게 이어져 있나 {#relations}

직접 넘기거나 부르는 관계는 없다. 아래는 모두 `같은 계열`이다.

| rel-id | 두 스킬 | 근거 방식 | 내용 |
| --- | --- | --- | --- |
| r40 | `landing-page-design` · `design-taste-frontend` | 명시-이름 | `landing-page-design`이 일부를 taste-skill에서 가져와 다시 썼다고 출처를 적는다. 사용 지시가 아니라 계보 표기다[](source:lp-credit) |
| r41 | `landing-page-design` · `impeccable` | 추론 | 둘 다 랜딩 페이지·웹 UI를 만들고 리뷰한다 |
| r42 | `design-taste-frontend` · `impeccable` | 추론 | 둘 다 일반적인 "AI 티"를 없애는 것을 목표로 든다 |
| r43 | `web-design-engineer` · `impeccable` | 추론 | 둘 다 페이지·대시보드·UI를 만들고 비평한다 |
| r44 | `10k-websites` · `design-taste-frontend` | 추론 | 둘 다 회사·브랜드 사이트를 처음부터 만든다 |
| r45 | `web-design-engineer` · `landing-page-design` | 추론 | 둘 다 랜딩 페이지·프로토타입·컴포넌트를 만든다 |
| r46 | `impeccable` · `animate`(emilkowalski) | 추론 | `impeccable`의 `animate` 하위 명령은 이름만 같다. emilkowalski의 `animate` 스킬을 부르지 않는다[](source:im-animate) |

공유하는 파일이나 상태는 없다. 각자 자기 문맥 파일을 쓴다(예: `impeccable`의 `PRODUCT.md`·`DESIGN.md`).[](source:im-setup) `web-design-engineer`는 다른 결과물 고르기 묶음에도 속한다(`design/_group-garden-visual/garden-visual.html`). 각 스킬의 규칙과 수치는 스킬 페이지(`design/impeccable/impeccable/impeccable.html` 등)에 있다.

@callout level=open-question title="이 비교가 답하지 않는 것"
다섯 스킬을 같은 요청으로 실행해 결과물을 비교하지 않았다. 표의 차이는 원문이 무엇을 지시하는지의 차이이고, 어느 쪽 결과가 더 좋은지는 판정하지 않았다.
