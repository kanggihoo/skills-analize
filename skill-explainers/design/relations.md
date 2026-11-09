# design 관계 원장
분석 커밋: 2ce2ebf5a567a8faeb0f9e5eebf126d04a6469c0

- 범위: `design/` 아래 `SKILL.md` 41개. 작성자 폴더 8개(`10k-websites`, `benjitaylor`, `elayadesign`, `emilkowalski`, `garden-skills`, `impeccable`, `jakubkrehel`, `taste`)와 그 아래 스킬 폴더로 나뉜다. 원격 출처는 `design/skills-lock.json`(impeccable, 10k-websites, jakubkrehel 15개 — 원격 `jakubkrehel/skills`)과 작성자 폴더마다 있는 `skills-lock.json`이다.
- **jakubkrehel 추가**: 2026-11-09에 `design/jakubkrehel/` 스킬 15개가 새로 들어왔다. 사용자 승인을 받아 local commit `0465878`로 올렸고, 위 "분석 커밋"이 그 commit이다(push는 하지 않았다). 기존 25개 스킬의 파일은 이 commit에서 바뀌지 않았다. 관계는 r60~r159에, 묶음은 interface-audit·component-workbench에 추가했다.
- **benjitaylor 추가**: 2026-11-10에 `design/benjitaylor/stageshow/`(원격 `benjitaylor/skills`, 원본 commit `299140f`, 파일 372개)가 새로 들어왔다. 사용자 승인을 받아 local commit `2ce2ebf`로 올렸고, 위 "분석 커밋"이 그 commit이다(push는 하지 않았다). lock 항목은 `design/skills-lock.json`에 합쳤다. 기존 40개 스킬의 파일은 바뀌지 않았다. 다른 스킬의 `SKILL.md`에 `stageshow`를 가리키는 문장이 없어(`grep`으로 확인) 관계 행은 추가하지 않았고, 같은 계열 후보는 확정하지 않았다.
- **최신화**: 2026-11-07에 `scripts/update-skill.py`로 lock 5개를 모두 최신화했다. 9개 스킬이 바뀌었다(emilkowalski의 animate, animation-performance, emil-design-eng, improve-animations, review-animations / impeccable / motion-showreel / landing-page-design / design-taste-frontend). 사용자 승인을 받아 local commit `4e3fc89`로 올렸고, 위 "분석 커밋"이 그 commit이다. push는 하지 않았다.
- 번역본: 원본이 바뀐 스킬의 번역본은 `*.ko.stale.md`로 이름이 바뀌었다. 번역본(`*.ko.md`, `*.ko.stale.md`, `README.zh-CN.md`는 번역본이 아니라 중국어 README 원본일 수 있으므로 스킬 페이지에서 확인)은 열지 않는다. garden-skills의 SKILL.md 5개(beautiful-article, gpt-image-2, kb-retriever, motion-showreel, web-video-presentation)는 본문이 중국어이고 그것이 원본이다.
- 원문 비교: 기존 25개와 이름이 같은 `SKILL.md`는 다른 컬렉션에 없다(`find`로 확인, `skill-explainers/`와 `.git` 제외). jakubkrehel 15개는 아래 "이름 충돌 확인" 줄에 적는다.
- 이름 충돌 확인: jakubkrehel 15개 이름(`afk`, `better-*` 6개와 `better-interface`, `break`, `build-design`, `explain-interface`, `interface-review`, `state-machine`, `teardown`, `variant`)과 같은 폴더 이름의 `SKILL.md`는 `design/jakubkrehel/` 밖에 없다(`find`로 확인). 이름이 비슷한 다른 작성자 스킬(`emilkowalski/break-ui`, `emilkowalski/prototype`, `emilkowalski/emil-design-eng`, `impeccable`)은 이름이 달라 충돌이 아니며 `같은 계열`로만 잇는다(r149~r152).
- 이름 충돌 주의: impeccable의 `animate`는 impeccable 안의 하위 명령(`reference/animate.md`)이다. emilkowalski의 `animate` 스킬을 부르는 것이 아니다(r46). `prototype`이라는 단어도 대부분 JS의 `prototype`이나 일반 명사로 나와 관계 후보에서 뺐다. 관계로 남긴 것은 스킬 이름을 백틱으로 적은 문장뿐이다.
- 컬렉션 밖: `skill-explainers/video/relations.md`는 `motion-showreel`·`web-video-presentation`을 다른 컬렉션이라 읽지 않았다고 적는다. 이번 최신화로 `update-skill.py`가 그 원장을 "관계 재확인" 대상으로 표시했지만, video 원장에는 이 두 스킬과의 관계 행이 없어 고칠 것이 없다. 이 원장에도 video 컬렉션과의 관계는 적지 않는다(`범위 밖`).
- 조사 상태 표기: `부분`은 필수 자료 일부를 확인하지 못했다는 뜻이다. `stageshow`가 이 값이다(`kit/`와 `examples/` 코드 310개와 `scripts/` 11개를 읽지 않았다). 기존 25개와 jakubkrehel 15개 모두 필수 자료(SKILL.md와 그것이 가리키는 references)를 끝까지 읽어 `완료`다. jakubkrehel에서 코드를 일부만 읽은 것은 `teardown` 하나다(텍스트 30개 중 26개 전부, `assets/geometry.js`·`assets/projection.js`·`assets/viewer.html`·`scripts/test-geometry.cjs` 4개는 구조·표본만 확인, 페이지 감사 패널에 적음). 다만 다음은 코드·생성 데이터를 일부만 읽었고 각 페이지 감사 패널과 `files.md`에 범위를 적었다: `10k-websites`(큰 코드 12개 부분 읽음), `gpt-image-2`(템플릿 92개 중 표본 16개, 구조만 76개), `motion-showreel`(scripts·테스트 49개 구조·표본), `web-video-presentation`(테마·CSS 53개 구조·표본), `impeccable`(번들 JS 6개 구조·표본, 엔진 바이너리는 저장소 밖), `design-taste-frontend`(`consistency.mjs` 약 11%, assets 1,435개 구조·표본, 바이너리 151개 제외).

## 스킬

| 경로 ID | 한 줄 요약 | 조사 상태 | 원문 비교 | 소속 묶음 | 역할 |
|---|---|---|---|---|---|
| design/10k-websites/10k-websites | 초보자를 브리프부터 스크롤 연출 웹사이트 제작, OpenArt 이미지·영상 생성, Hostinger 배포까지 데려간다 | 완료 | - | site-design-choice | 선택지 |
| design/benjitaylor/stageshow | 실제 제품처럼 보이는 가짜 UI를 still이나 cursor 데모로 만들고, 가까운 gold example 복사와 촬영 통과 조건으로 품질을 맞춘다 | 부분 | - | - | 선택지 |
| design/elayadesign/landing-page-design | 질문·섹션 구성·카피·SEO와 엄격한 시각 규칙으로 전환율 높은 랜딩 페이지를 만든다 | 완료 | - | site-design-choice | 선택지 |
| design/emilkowalski/animate | 웹 애니메이션을 "움직일지부터 퇴장까지" 정해진 순서로 결정하며 직접 구현한다 | 완료 | - | motion-craft, ui-component | 단계 |
| design/emilkowalski/animate-expo | React Native·Expo 앱의 애니메이션과 제스처를 스레드·스프링 순서로 결정해 구현한다 | 완료 | - | motion-craft | 변형 |
| design/emilkowalski/animation-performance | 끊기는 웹 애니메이션의 원인을 찾아 프레임 예산 안에 들게 고친다 | 완료 | - | motion-craft | 선택지 |
| design/emilkowalski/animation-vocabulary | "팝오버 열릴 때 통통 튀는 거"처럼 흐릿한 묘사를 정확한 모션 용어로 바꿔 준다 | 완료 | - | - | 안내 |
| design/emilkowalski/apple-design | Apple의 유체 인터페이스·스프링 모션 원칙을 웹 구현 규칙으로 옮겨 적용한다 | 완료 | - | - | 안내 |
| design/emilkowalski/ask-sonner | React toast 라이브러리 Sonner의 설치·사용법과 흔한 고장을 답한다 | 완료 | - | ui-component | 안내 |
| design/emilkowalski/break-ui | 긴 이름·빈 값·이모지 같은 최악의 데이터를 넣어 UI가 깨지는 곳을 찾고 고칠 방법을 보고한다 | 완료 | - | ui-component | 단계 |
| design/emilkowalski/emil-design-eng | Emil Kowalski의 UI 다듬기·애니메이션 판단 원칙으로 UI를 만들고 리뷰한다 | 완료 | - | - | 안내 |
| design/emilkowalski/find-animation-opportunities | 아직 움직이지 않는 곳 중 애니메이션이 정말 필요한 곳만 골라 수치와 함께 제안한다(코드는 안 고침) | 완료 | - | motion-craft | 단계 |
| design/emilkowalski/improve-animations | 코드베이스의 모션 코드를 감사해 우선순위 목록과 다른 에이전트가 실행할 구현 계획을 쓴다 | 완료 | - | motion-craft | 단계 |
| design/emilkowalski/mobile-native | 휴대폰에서 웹앱이 "웹사이트 티"가 나는 CSS·meta 문제를 하나씩 고친다 | 완료 | - | - | 안내 |
| design/emilkowalski/pick-ui-library | 프론트엔드 작업(toast, 차트, 드래그 등)에 맞는 라이브러리를 정해진 추천 목록에서 고른다(명시 호출만) | 완료 | - | ui-component | 단계 |
| design/emilkowalski/prototype | 설명한 UI 조각을 서로 다른 버전 여러 개로 만들어 화면 선택기로 비교하게 한다(명시 호출만) | 완료 | - | ui-component | 단계 |
| design/emilkowalski/review-animations | 애니메이션 코드를 높은 기준으로 리뷰한다. 기본은 지적이고 통과는 얻어 내야 한다(명시 호출만) | 완료 | - | motion-craft | 단계 |
| design/emilkowalski/write-swift | 값 타입·Swift 6 동시성·Swift Testing 등 최신 Swift를 제대로 쓰고 리뷰·이전하게 한다 | 완료 | - | - | 안내 |
| design/garden-skills/beautiful-article | URL·PDF·문서 같은 소재를 오프라인으로 열리는 단일 HTML 장문 웹 기사로 만든다 | 완료 | - | garden-visual | 선택지 |
| design/garden-skills/gpt-image-2 | GPT Image 2용 템플릿으로 이미지를 생성·편집하거나, 도구가 없으면 프롬프트를 짜 준다 | 완료 | - | garden-visual | 선택지 |
| design/garden-skills/kb-retriever | 로컬 지식 폴더를 색인 따라 단계적으로 검색해 질문에 답한다(PDF·Excel은 처리법부터 읽음) | 완료 | - | - | 단계 |
| design/garden-skills/motion-showreel | 코드로 그래픽·글자·UI 모션 영상을 만들어 MP4와 편집 가능한 소스로 낸다(최대 20분) | 완료 | - | garden-visual | 선택지 |
| design/garden-skills/web-design-engineer | HTML·CSS·JS·React로 페이지·대시보드·프로토타입·슬라이드 같은 시각 결과물을 만든다 | 완료 | - | garden-visual, site-design-choice | 선택지 |
| design/garden-skills/web-video-presentation | 글이나 원고를 클릭으로 넘기는 "영상 같은" 16:9 웹 발표로 만들고 음성을 붙인다 | 완료 | - | garden-visual | 선택지 |
| design/impeccable/impeccable | 프론트엔드 UI를 설계·비평·감사·다듬는 명령 24개 모음. 디자인 문맥 파일·검사 엔진·편집별 hook을 함께 쓴다 | 완료 | - | site-design-choice | 선택지 |
| design/taste/design-taste-frontend | 업종(6종)에 따라 허용 범위를 정하고, AI 티를 없앤 회사·제품 웹사이트를 만들어 headless Chrome 검사기로 수치 판정한다 | 완료 | - | site-design-choice | 선택지 |
| design/jakubkrehel/afk | 사용자가 자리를 비운 몇 시간 동안 프로젝트에서 개선점을 넓게 찾아 local branch에 만들고, 돌아오면 읽을 보고서를 남긴다(명시 호출만) | 완료 | - | - | 선택지 |
| design/jakubkrehel/better-accessibility | 키보드·focus, ARIA, 접근 가능한 이름, 폼, 스크린 리더 안내, 모션·확대를 WCAG 2.2 기준으로 리뷰하고 고친다 | 완료 | - | interface-audit | 단계 |
| design/jakubkrehel/better-colors | 팔레트를 만들고 semantic token 이름을 정하고 색 형식을 바꾸며 대비를 수치로 잰다 | 완료 | - | interface-audit | 단계 |
| design/jakubkrehel/better-interface | 화면·흐름·저장소 전체를 접근성·레이아웃·카피·타이포·색·UI 완성도로 리뷰해 순위 매긴 보고서 하나로 합친다 | 완료 | - | interface-audit | 단계 |
| design/jakubkrehel/better-layout | 묶음·정렬·읽는 순서·반응형 구조·번역 글자 여유를 정해 크기·번역·좌우 반전에도 버티는 레이아웃을 만든다 | 완료 | - | interface-audit | 단계 |
| design/jakubkrehel/better-typography | type scale, 간격, 폰트 기능, 줄바꿈·말줄임, 문장부호까지 글자가 그려지는 방식을 정하고 리뷰한다 | 완료 | - | interface-audit | 단계 |
| design/jakubkrehel/better-ui | border radius, 광학 정렬, shadow, 아이콘 상태, 애니메이션의 정확한 값으로 표면·아이콘·모션을 다듬는다 | 완료 | - | interface-audit | 단계 |
| design/jakubkrehel/better-writing | 라벨·에러·빈 상태·확인 창 같은 인터페이스 카피를 제품 어조에 맞게 쓰고 리뷰해 다음 행동을 알려 준다 | 완료 | - | interface-audit | 단계 |
| design/jakubkrehel/break | 고른 컴포넌트를 닿을 수 있는 모든 시나리오로 임시 페이지에 그려 스트레스 테스트한다(명시 호출만) | 완료 | - | component-workbench | 선택지 |
| design/jakubkrehel/build-design | Figma 파일이나 디자인 이미지를 프로젝트의 기존 token·컴포넌트로 같은 모양의 UI로 만든다 | 완료 | - | - | 선택지 |
| design/jakubkrehel/explain-interface | 실제 URL이나 스크린샷을 보고 웹사이트·시각 효과·애니메이션이 어떻게 만들어졌는지 설명한다(평가하지 않음, 명시 호출만) | 완료 | - | - | 선택지 |
| design/jakubkrehel/interface-review | branch·PR·미커밋 변경이 새로 만들거나 퇴보시킨 인터페이스 문제를 diff 단위로 리뷰하고 better-interface에 넘긴다(명시 호출만) | 완료 | - | interface-audit | 단계 |
| design/jakubkrehel/state-machine | 고른 컴포넌트가 가질 수 있는 모든 상태를 mock 데이터와 전환기를 단 임시 페이지에 그려 상태별로 작업하게 한다(명시 호출만) | 완료 | - | component-workbench | 선택지 |
| design/jakubkrehel/teardown | 물리 물체나 디스플레이 픽셀·인터페이스 레이어 같은 작동 원리를 분해도·가는 선·부품 색으로 그린 기술 일러스트를 만든다 | 완료 | - | - | 선택지 |
| design/jakubkrehel/variant | 작업 중인 컴포넌트를 의도적으로 다른 3가지 버전으로 만들어 실제 페이지의 picker로 비교·선택하게 한다(순위는 매기지 않음, 명시 호출만) | 완료 | - | component-workbench | 선택지 |

## 관계

출처 표기는 `스킬폴더/파일:줄`이다. 파일을 생략하면 그 스킬의 `SKILL.md`다. 줄 번호는 분석 커밋 기준이다.

### emilkowalski 모션 스킬 사이

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r01 | animate | review-animations | 참고 | 명시-이름 | animate의 기준은 review-animations가 강제하는 기준과 같고, "그 리뷰를 한 번에 통과하게 쓰라"고 한다. 끝내기 전 자체 점검 목록은 "review-animations에서 자동으로 막히는 항목"이다. review-animations를 실행하라는 지시는 없다 | - | - | 범위 내 | animate:3,20,177 |
| r02 | animate | pick-ui-library | 넘김 | 명시-이름 | 작업에 애니메이션이 아니라 컴포넌트(toast, drawer, command menu, dropdown)가 필요하면 "멈추고 pick-ui-library를 호출하라"는 의무형. 단 pick-ui-library는 `disable-model-invocation: true`라서 모델이 스스로 켤 수 없다는 지시와 부딪친다. 실제 동작은 확인하지 않았다(지시상 동작) | 작업 설명 | - | 범위 내 | animate:81; pick-ui-library:4 |
| r03 | animate | improve-animations | 참고 | 명시-이름 | 역할 구분: 코드베이스 감사는 improve-animations의 몫이라고 한다 | - | - | 범위 내 | animate:3,16 |
| r04 | animate | find-animation-opportunities | 참고 | 명시-이름 | 역할 구분: 움직일 곳 찾기는 find-animation-opportunities의 몫 | - | - | 범위 내 | animate:16 |
| r05 | animate | animate-expo | 참고 | 명시-이름 | 역할 구분: React Native는 animate-expo의 몫 | - | - | 범위 내 | animate:16 |
| r06 | animate-expo | animate | 참고 | 명시-이름 | description에서 "웹 애니메이션은 animate를 쓰라"고 한다 | - | - | 범위 내 | animate-expo:3 |
| r07 | animation-performance | animate | 참고 | 명시-이름 | easing·duration·애니메이션 여부 결정은 animate를 쓰라고 한다(description과 역할 구분) | - | - | 범위 내 | animation-performance:3,16 |
| r08 | animation-performance | review-animations | 참고 | 명시-이름 | 모션 전체 리뷰와 "움직여야 하는가" 판단은 review-animations의 몫 | - | - | 범위 내 | animation-performance:3,16 |
| r09 | animation-performance | animate-expo | 참고 | 명시-이름 | React Native 스레드 문제는 animate-expo의 몫 | - | - | 범위 내 | animation-performance:16 |
| r10 | find-animation-opportunities | improve-animations | 넘김 | 명시-이름 | 제안을 구현해 달라고 하면 직접 고치지 않고 넘긴다. 예로 `improve-animations plan <description>`을 든다("e.g.", 다른 에이전트에 레시피를 가져가도 된다). 보고서 끝은 `improve-animations plan <suggestion>`을 안내하며 닫는다(제안) | 제안 표의 한 행(레시피) | - | 범위 내 | find-animation-opportunities:26,136 |
| r11 | find-animation-opportunities | review-animations | 참고 | 명시-이름 | 이미 있는 애니메이션을 고치는 일은 improve-animations나 review-animations를 쓰라고 한다 | - | - | 범위 내 | find-animation-opportunities:3,16 |
| r12 | improve-animations | review-animations | 참고 | 명시-이름 | 한 diff 리뷰는 review-animations의 몫이다. `execute <plan>` 모드에서는 실행 서브에이전트의 diff를 "review-animations 기준으로" 판정한다. review-animations 스킬을 호출한다는 문장은 없다 | 실행 diff | - | 범위 내 | improve-animations:18,104 |
| r13 | mobile-native | animate | 참고 | 명시-이름 | 모션 자체는 animate를 쓰라. press 피드백은 코드베이스가 animate 스킬의 토큰을 쓰면 그것을 따르라(권고) | animate 토큰 | 코드베이스 | 범위 내 | mobile-native:3,16,144 |
| r14 | mobile-native | animate-expo | 참고 | 명시-이름 | React Native는 animate-expo의 몫 | - | - | 범위 내 | mobile-native:3,16 |
| r15 | mobile-native | review-animations | 참고 | 명시-이름 | 모션 리뷰는 review-animations의 몫 | - | - | 범위 내 | mobile-native:16 |

### emilkowalski UI 컴포넌트 스킬 사이

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r16 | break-ui | prototype | 참고 | 명시-이름 | 역할 구분: 컴포넌트 재설계는 prototype의 몫. prototype은 `disable-model-invocation: true`라 모델이 스스로 넘길 수 없다. 같은 파일의 "prototype route"는 일반 명사라 관계가 아니다 | - | - | 범위 내 | break-ui:16 |
| r17 | break-ui | emil-design-eng | 참고 | 명시-이름 | 시각 디자인 비평은 emil-design-eng를 쓰라 | - | - | 범위 내 | break-ui:3,16 |
| r18 | break-ui | review-animations | 참고 | 명시-이름 | 모션은 review-animations를 쓰라. review-animations는 `disable-model-invocation: true`라 사용자가 직접 불러야 한다 | - | - | 범위 내 | break-ui:3,16 |
| r19 | prototype | review-animations | 참고 | 명시-이름 | 역할 구분: 기존 UI 리뷰는 review-animations의 몫 | - | - | 범위 내 | prototype:17 |
| r20 | prototype | improve-animations | 참고 | 명시-이름 | 역할 구분: 기존 UI 수정 계획은 improve-animations의 몫 | - | - | 범위 내 | prototype:17 |
| r21 | prototype | pick-ui-library | 참고 | 명시-이름 | 역할 구분: 의존성 고르기는 pick-ui-library의 몫 | - | - | 범위 내 | prototype:17 |
| r22 | pick-ui-library | ask-sonner | 산출물 호환 | 추론 | pick-ui-library는 toast·알림에 Sonner를 추천하고, 손으로 만든 toast를 Sonner로 바꾸라고 한다. ask-sonner는 그 Sonner의 사용 안내다. 두 스킬은 서로 이름을 부르지 않는다 | 라이브러리 선택(Sonner) | 프로젝트 `package.json` | 범위 내 | pick-ui-library:34,80; ask-sonner:3 |

### garden-skills 사이

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r30 | motion-showreel | web-video-presentation | 넘김 | 명시-이름 | 적용 판단 표에서 클릭으로 넘기는 발표, 현장 발표, 대화형 웹 데모, 글→원고 작업이면 web-video-presentation을 쓰라고 한다 | 사용자 요청 | - | 범위 내 | motion-showreel:29; motion-showreel/README.md:25 |
| r31 | motion-showreel | web-design-engineer | 넘김 | 명시-이름 | 웹페이지·랜딩·대화형 프로토타입·정적 시안이면 ❌로 표시하고 web-design-engineer를 쓰라고 한다 | 사용자 요청 | - | 범위 내 | motion-showreel:30; motion-showreel/README.md:25 |
| r32 | web-design-engineer | beautiful-article | 넘김 | 명시-역할 | 소재 → 장문 HTML 기사 변환은 적용 대상이 아니며 "있으면 전용 스킬로 넘기라"(when available). description도 "source-to-longform article conversion"은 대상이 아니라고 적는다. 이름은 적지 않았고, 같은 컬렉션에서 그 역할에 맞는 스킬은 beautiful-article 하나다 | 사용자 요청 | - | 범위 내 | web-design-engineer:3,18; beautiful-article:3 |
| r33 | web-design-engineer | web-video-presentation | 넘김 | 명시-역할 | 원고 박자 → 녹화용 웹 영상 발표는 적용 대상이 아니며 "있으면 전용 스킬로 넘기라". 역할에 맞는 스킬은 web-video-presentation 하나다 | 사용자 요청 | - | 범위 내 | web-design-engineer:3,18; web-video-presentation:3 |
| r34 | beautiful-article | web-design-engineer | 넘김 | 명시-이름 | README에서 웹앱·대시보드·폼·프로토타입·일반 랜딩 페이지는 web-design-engineer로 가라고 하고, 애매하면 멈추고 묻는다고 한다. SKILL.md는 "기사만 만든다"는 범위만 적고 이름은 부르지 않는다 | 사용자 요청 | - | 범위 내 | beautiful-article/README.md:421; beautiful-article:3 |
| r35 | web-design-engineer | gpt-image-2 | 내부 위임 | 명시-이름 | 선택적 image-first 분기에서만 쓴다. 시각이 중요한 신규·전면 개편 작업(캠페인 랜딩, 브랜드 출시, 제품 hero, 아트 디렉션이 강한 포트폴리오)일 때 쓰고, Figma·스크린샷·성숙한 디자인 시스템이 주어졌거나 확장·수리·대시보드·폼·표 작업이거나 비용만 늘 때는 건너뛴다. 쓸 때 gpt-image-2가 있으면 그것으로 구조화 생성을 하고, 없으면 호스트 이미지 흐름을 따르거나 필요한 자산을 정직하게 남긴다(조건부 권고). 생성 이미지는 구현 결정을 뽑는 참조이고, 코드·사용자 브랜드 자산과 충돌하면 그쪽이 우선이다 | 참조 이미지 | - | 범위 내 | web-design-engineer/references/design-calibration.md:113-132 |

### 같은 계열

작성자가 달라도 목적이 같은 스킬이다. 근거는 두 description이다. 순서나 호출 관계는 없다.

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r40 | landing-page-design | design-taste-frontend | 같은 계열 | 명시-이름 | landing-page-design 끝의 출처 표기: 일부를 taste-skill(MIT)에서 가져와 다시 썼다(리디자인 감사 구조, 콘텐츠 현실성 점검, 모션·내비게이션 아이디어). taste-skill은 design-taste-frontend의 원격 저장소(`Leonxlnx/taste-skill`)다. 사용 지시가 아니라 계보 표기다 | - | - | 범위 내 | landing-page-design:451; taste/skills-lock.json |
| r41 | landing-page-design | impeccable | 같은 계열 | 추론 | 둘 다 랜딩 페이지·웹 UI를 만들고 리뷰한다. landing-page-design은 전환율과 고정 시각 규칙, impeccable은 명령별 디자인 작업이 중심이다 | - | - | 범위 내 | landing-page-design:3; impeccable:3 |
| r42 | design-taste-frontend | impeccable | 같은 계열 | 추론 | 둘 다 회사·제품 웹 UI를 만들고 다듬으며, 일반적인 "AI 티"를 없애는 것을 목표로 든다 | - | - | 범위 내 | design-taste-frontend:3-11; impeccable:3 |
| r43 | web-design-engineer | impeccable | 같은 계열 | 추론 | 둘 다 페이지·대시보드·UI를 만들고 디자인을 비평한다 | - | - | 범위 내 | web-design-engineer:3; impeccable:3 |
| r44 | 10k-websites | design-taste-frontend | 같은 계열 | 추론 | 둘 다 회사·브랜드 웹사이트를 처음부터 만든다. 10k-websites는 초보자 안내·이미지 생성·배포까지, design-taste-frontend는 품질 규칙과 검사기가 중심이다 | - | - | 범위 내 | 10k-websites:3; design-taste-frontend:3-11 |
| r45 | web-design-engineer | landing-page-design | 같은 계열 | 추론 | 둘 다 랜딩 페이지·프로토타입·컴포넌트를 만든다 | - | - | 범위 내 | web-design-engineer:3; landing-page-design:3 |
| r46 | impeccable | animate | 같은 계열 | 추론 | impeccable에는 `animate [target]` 하위 명령이 있다(`reference/animate.md`). 이름이 같을 뿐 emilkowalski의 animate 스킬을 부르지 않는다. 둘 다 UI에 목적 있는 모션을 더한다 | - | - | 범위 내 | impeccable:58; animate:3 |
| r47 | emil-design-eng | apple-design | 같은 계열 | 추론 | 둘 다 UI 다듬기와 모션의 원칙을 담는다. emil-design-eng는 Emil Kowalski의 철학, apple-design은 Apple WWDC 원칙의 웹 번역이다 | - | - | 범위 내 | emil-design-eng:3; apple-design:3 |
| r48 | review-animations | emil-design-eng | 같은 계열 | 추론 | review-animations의 기준은 "Emil Kowalski의 디자인 엔지니어링 철학에서 나왔다"고 한다. emil-design-eng가 그 철학을 담은 스킬이지만, 이름으로 부르지는 않는다 | - | - | 범위 내 | review-animations:3; emil-design-eng:3 |
| r49 | animation-vocabulary | animate | 같은 계열 | 명시-역할 | animation-vocabulary는 "효과의 이름을 붙이는 것이지 설계·구현이 아니다"라고 범위를 긋는다. 구현 역할은 이름 없이 언급된다 | - | - | 범위 내 | animation-vocabulary:3 |
| r50 | motion-showreel | web-video-presentation | 같은 계열 | 추론 | 둘 다 코드로 "영상" 결과물을 만든다. motion-showreel은 렌더된 MP4, web-video-presentation은 클릭으로 넘기는 웹 발표다(r30이 둘을 나누는 기준) | - | - | 범위 내 | motion-showreel:3; web-video-presentation:3 |

### jakubkrehel 스킬 사이

출처 표기는 `스킬폴더/파일:줄`이다. 파일을 생략하면 그 스킬의 `SKILL.md`다. 줄 번호는 분석 커밋 기준이다. `better-*` 도메인 스킬 여섯 개와 better-interface 사이는 규칙 담당 구분이라 대부분 `참고`다. 네 명시 호출 전용 스킬(variant·break·state-machine·afk)은 서로 역할만 가른다.

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r60 | better-interface | better-accessibility | 내부 위임 | 명시-이름 | 의무형. 담당 스킬을 모두 불러 도메인 리뷰를 끝낸 뒤 통합한다. 순서는 1번째("기초 실패가 장식에 가려지지 않게" 이 순서). 스킬에서는 원칙·references·검증만 가져오고 심각도·형식은 better-interface 것으로 대체한다. 스킬이 없으면 그 도메인을 `Not reviewed`로 표시하고 이어 가며, 기억으로 규칙을 만들지 않는다 | 도메인 리뷰 증거 | - | 범위 내 | better-interface:42-57; better-accessibility:3 |
| r61 | better-interface | better-layout | 내부 위임 | 명시-이름 | 의무형. 담당 스킬을 모두 불러 도메인 리뷰를 끝낸 뒤 통합한다. 순서는 2번째("기초 실패가 장식에 가려지지 않게" 이 순서). 스킬에서는 원칙·references·검증만 가져오고 심각도·형식은 better-interface 것으로 대체한다. 스킬이 없으면 그 도메인을 `Not reviewed`로 표시하고 이어 가며, 기억으로 규칙을 만들지 않는다 | 도메인 리뷰 증거 | - | 범위 내 | better-interface:42-57; better-layout:3 |
| r62 | better-interface | better-writing | 내부 위임 | 명시-이름 | 의무형. 담당 스킬을 모두 불러 도메인 리뷰를 끝낸 뒤 통합한다. 순서는 3번째("기초 실패가 장식에 가려지지 않게" 이 순서). 스킬에서는 원칙·references·검증만 가져오고 심각도·형식은 better-interface 것으로 대체한다. 스킬이 없으면 그 도메인을 `Not reviewed`로 표시하고 이어 가며, 기억으로 규칙을 만들지 않는다 | 도메인 리뷰 증거 | - | 범위 내 | better-interface:42-57; better-writing:3 |
| r63 | better-interface | better-typography | 내부 위임 | 명시-이름 | 의무형. 담당 스킬을 모두 불러 도메인 리뷰를 끝낸 뒤 통합한다. 순서는 4번째("기초 실패가 장식에 가려지지 않게" 이 순서). 스킬에서는 원칙·references·검증만 가져오고 심각도·형식은 better-interface 것으로 대체한다. 스킬이 없으면 그 도메인을 `Not reviewed`로 표시하고 이어 가며, 기억으로 규칙을 만들지 않는다 | 도메인 리뷰 증거 | - | 범위 내 | better-interface:42-57; better-typography:3 |
| r64 | better-interface | better-colors | 내부 위임 | 명시-이름 | 의무형. 담당 스킬을 모두 불러 도메인 리뷰를 끝낸 뒤 통합한다. 순서는 5번째("기초 실패가 장식에 가려지지 않게" 이 순서). 스킬에서는 원칙·references·검증만 가져오고 심각도·형식은 better-interface 것으로 대체한다. 스킬이 없으면 그 도메인을 `Not reviewed`로 표시하고 이어 가며, 기억으로 규칙을 만들지 않는다 | 도메인 리뷰 증거 | - | 범위 내 | better-interface:42-57; better-colors:3 |
| r65 | better-interface | better-ui | 내부 위임 | 명시-이름 | 의무형. 담당 스킬을 모두 불러 도메인 리뷰를 끝낸 뒤 통합한다. 순서는 6번째("기초 실패가 장식에 가려지지 않게" 이 순서). 스킬에서는 원칙·references·검증만 가져오고 심각도·형식은 better-interface 것으로 대체한다. 스킬이 없으면 그 도메인을 `Not reviewed`로 표시하고 이어 가며, 기억으로 규칙을 만들지 않는다 | 도메인 리뷰 증거 | - | 범위 내 | better-interface:42-57; better-ui:3 |
| r66 | better-interface | interface-review | 넘김 | 명시-이름 | 변경 범위 요청(branch·PR·commit 범위·미커밋 변경)이면 변경 리뷰라고 말하고 사용자에게 interface-review 실행을 요청한다. interface-review는 사용자 호출 전용이라 여기서 시작하지 못한다. 변경 범위를 직접 해석하지 않는다(의무형) | 사용자 요청 | - | 범위 내 | better-interface:28-32; interface-review:4 |
| r67 | interface-review | better-interface | 넘김 | 명시-이름 | 의무형. 범위 블록·영향받은 화면·모든 finding의 status를 건네 보고한다. 심각도·통합·coverage·cap·verdict는 better-interface 소유. better-interface가 없으면 해석된 범위와 파일 목록만 보고하고 중단하며 심각도·cap·verdict를 만들지 않는다. better-interface는 이 리뷰를 받으면 Introduced·Regression finding만 cap과 verdict에 센다 | 범위 블록, 영향 화면, finding+status | - | 범위 내 | interface-review:11,93-97; better-interface:32; better-interface/review-format.md:46 |
| r68 | interface-review | better-interface | 넘김 | 명시-이름 | 제안. 변경이 없을 때 사용자에게 보여 주는 선택지 하나: 저장소 전체 인터페이스 감사는 변경 리뷰가 아니므로 범위 블록·status·pre-existing 섹션 없이 repository-scope 리뷰로 better-interface에 넘긴다. 사용자가 고를 때만 | 사용자 선택 | - | 범위 내 | interface-review:44 |
| r69 | interface-review | better-accessibility | 내부 위임 | 명시-이름 | 조건부. 변경의 제거된 줄(`-` 쪽)이 removed-signals 표의 신호와 맞으면 담당 스킬로 보내 판단하게 한다. 신호는 단서일 뿐이고 대체물이 변경 안에 없을 때만 회귀이며, 담당 스킬이 확인한 것만 `Regression`으로 보고한다 | 일치한 제거 줄 | - | 범위 내 | interface-review:58-60; interface-review/removed-signals.md:7-11 |
| r70 | interface-review | better-colors | 내부 위임 | 명시-이름 | 조건부. 변경의 제거된 줄(`-` 쪽)이 removed-signals 표의 신호와 맞으면 담당 스킬로 보내 판단하게 한다. 신호는 단서일 뿐이고 대체물이 변경 안에 없을 때만 회귀이며, 담당 스킬이 확인한 것만 `Regression`으로 보고한다 | 일치한 제거 줄 | - | 범위 내 | interface-review:58-60; interface-review/removed-signals.md:12,16 |
| r71 | interface-review | better-layout | 내부 위임 | 명시-이름 | 조건부. 변경의 제거된 줄(`-` 쪽)이 removed-signals 표의 신호와 맞으면 담당 스킬로 보내 판단하게 한다. 신호는 단서일 뿐이고 대체물이 변경 안에 없을 때만 회귀이며, 담당 스킬이 확인한 것만 `Regression`으로 보고한다 | 일치한 제거 줄 | - | 범위 내 | interface-review:58-60; interface-review/removed-signals.md:13 |
| r72 | interface-review | better-typography | 내부 위임 | 명시-이름 | 조건부. 변경의 제거된 줄(`-` 쪽)이 removed-signals 표의 신호와 맞으면 담당 스킬로 보내 판단하게 한다. 신호는 단서일 뿐이고 대체물이 변경 안에 없을 때만 회귀이며, 담당 스킬이 확인한 것만 `Regression`으로 보고한다 | 일치한 제거 줄 | - | 범위 내 | interface-review:58-60; interface-review/removed-signals.md:14-15 |
| r73 | interface-review | better-writing | 내부 위임 | 명시-이름 | 조건부. 변경의 제거된 줄(`-` 쪽)이 removed-signals 표의 신호와 맞으면 담당 스킬로 보내 판단하게 한다. 신호는 단서일 뿐이고 대체물이 변경 안에 없을 때만 회귀이며, 담당 스킬이 확인한 것만 `Regression`으로 보고한다 | 일치한 제거 줄 | - | 범위 내 | interface-review:58-60; interface-review/removed-signals.md:17 |
| r74 | interface-review | better-ui | 참고 | 명시-이름 | 제외 경로의 예외: 컴포넌트에 추가된 이미지는 better-ui와 better-accessibility 변경이다(outline·`alt` 텍스트). 폰트 파일 추가·교체는 better-typography 변경이다. 바이트가 아니라 참조하는 코드를 리뷰한다. 폰트 파일 변경이 better-typography 변경이라는 점은 별도 행 r156 | - | - | 범위 내 | interface-review/scope-resolution.md:68 |
| r75 | better-ui | better-typography | 참고 | 명시-이름 | 경계 구분: 글자 줄바꿈·폰트 렌더링·tabular numbers·글자 간격은 better-typography의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-ui:16; better-typography:3 |
| r76 | better-ui | better-accessibility | 참고 | 명시-이름 | 경계 구분: hit area·키보드·ARIA·reduced-motion 요구와, focus ring·form input의 3:1 비텍스트 대비는 better-accessibility의 몫이다. 호출하라는 지시는 아니다. icon-only 버튼의 접근 가능한 이름도 better-accessibility의 몫이다 | - | - | 범위 내 | better-ui:16,28,52; better-accessibility:3; better-ui/icons.md:105 |
| r77 | better-ui | better-layout | 참고 | 명시-이름 | 경계 구분: 묶음·섹션 간격·breakpoint·공간 RTL(방향 아이콘 뒤집기만 better-ui)은 better-layout의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-ui:16; better-layout:3 |
| r78 | better-ui | better-colors | 참고 | 명시-이름 | 경계 구분: color token과 대비 측정은 better-colors의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-ui:16; better-colors:3 |
| r79 | better-accessibility | better-colors | 참고 | 명시-이름 | 경계 구분: 대비 측정과 색 수정은 better-colors의 몫이다. 에이전트는 렌더된 쌍을 better-colors로 재고, 실패하면 쌍과 놓친 기준만 보고하며 요청이 없으면 색을 바꾸지 않는다(better-accessibility:80). 호출하라는 지시는 아니다 | - | - | 범위 내 | better-accessibility:12,80; better-colors:3 |
| r80 | better-accessibility | better-typography | 참고 | 명시-이름 | 경계 구분: 글자 크기·iOS input 확대(`16px` 규칙)·언어 메타데이터는 better-typography의 몫이다. 호출하라는 지시는 아니다. `translate="no"`로 브랜드명·코드 토큰을 자동 번역에서 빼는 일은 better-typography의 몫이다 | - | - | 범위 내 | better-accessibility:12,106; better-typography:3; better-accessibility/semantics-and-aria.md:61 |
| r81 | better-accessibility | better-layout | 참고 | 명시-이름 | 경계 구분: target 사이 간격·공간 RTL·200% 확대 수정의 나머지·sticky 가림 수정은 better-layout의 몫이다. 호출하라는 지시는 아니다. sticky 요소에 가려진 focus의 `scroll-padding` 레시피와 media query breakpoint 위치도 better-layout의 몫이다 | - | - | 범위 내 | better-accessibility:12,32,106; better-layout:3; better-accessibility/focus-and-keyboard.md:39; better-accessibility/motion-and-zoom.md:48 |
| r82 | better-accessibility | better-writing | 참고 | 명시-이름 | 경계 구분: 라벨·에러·alt 텍스트의 문구는 better-writing의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-accessibility:12; better-writing:3 |
| r83 | better-accessibility | better-ui | 참고 | 명시-이름 | 경계 구분: 애니메이션 레시피·hover 스타일·스크롤 격리는 better-ui의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-accessibility:12; better-ui:3 |
| r84 | better-colors | better-accessibility | 참고 | 명시-이름 | 경계 구분: 어떤 쌍이 통과해야 하는지(요구 기준)와 색만으로 의미를 전하지 말라는 요구는 better-accessibility의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-colors:12,42; better-colors/contrast.md:5; better-accessibility:3 |
| r85 | better-colors | better-ui | 참고 | 명시-이름 | 경계 구분: 표면·shadow·아이콘 색은 better-ui의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-colors:12; better-ui:3 |
| r86 | better-layout | better-accessibility | 참고 | 명시-이름 | 경계 구분: hit area·focus 동작은 better-accessibility의 몫이다. 확장된 hit area가 겹치지 않게 간격을 잡는 것은 better-layout이 한다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-layout:12; better-layout/spacing-and-adaptivity.md:30; better-accessibility:3 |
| r87 | better-layout | better-ui | 참고 | 명시-이름 | 경계 구분: radius·shadow·애니메이션은 better-ui의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-layout:12; better-ui:3 |
| r88 | better-layout | better-typography | 참고 | 명시-이름 | 경계 구분: 줄 길이·글자 간격·말줄임 방식과, 숫자 정렬의 tabular figures·bidi 규칙은 better-typography의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-layout:12,42; better-layout/grouping-and-alignment.md:49,84; better-typography:3 |
| r89 | better-layout | better-writing | 참고 | 명시-이름 | 경계 구분: 문구 자체는 better-writing의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-layout:12; better-writing:3 |
| r90 | better-layout | better-colors | 참고 | 명시-이름 | 경계 구분: 주 행동을 색으로 표시하는 방식은 better-colors의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-layout:36; better-colors:3 |
| r91 | better-typography | better-writing | 참고 | 명시-이름 | 경계 구분: 문구 자체는 better-writing의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-typography:10; better-writing:3 |
| r92 | better-typography | better-accessibility | 참고 | 명시-이름 | 경계 구분: heading 구조의 의미와 대비 통과 여부는 better-accessibility의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-typography:10; better-accessibility:3 |
| r93 | better-typography | better-layout | 참고 | 명시-이름 | 경계 구분: 공간 RTL 레이아웃과, 잘린 값에서 전체 글자로 돌아가는 길은 better-layout의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-typography:10,77; better-layout:3 |
| r94 | better-typography | better-colors | 참고 | 명시-이름 | 경계 구분: 대비 측정은 better-colors의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-typography:10; better-colors:3 |
| r95 | better-typography | better-ui | 참고 | 명시-이름 | 경계 구분: 밑줄 외 애니메이션의 모션은 better-ui의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-typography:89; better-ui:3 |
| r96 | better-writing | better-typography | 참고 | 명시-이름 | 경계 구분: `text-transform`·말줄임·스마트 문장부호 같은 렌더링은 better-typography의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-writing:12; better-typography:3 |
| r97 | better-writing | better-accessibility | 참고 | 명시-이름 | 경계 구분: 에러 마크업·안내·접근 가능한 이름을 싣는 속성·undo toast 표시 시간·visible label 필요 여부는 better-accessibility의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-writing:12,57,120; better-writing/patterns.md:15; better-accessibility:3 |
| r98 | better-writing | better-layout | 참고 | 명시-이름 | 경계 구분: 번역 문자열의 여유 공간은 better-layout의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-writing:12; better-layout:3 |
| r99 | better-writing | better-colors | 참고 | 명시-이름 | 경계 구분: 파괴 버튼의 구분되는 색은 better-colors의 몫이다. 호출하라는 지시는 아니다 | - | - | 범위 내 | better-writing:98; better-colors:3 |
| r100 | better-ui | better-interface | 참고 | 명시-이름 | 이 도메인의 escalation trigger(better-interface가 정한 목록)는 켜지면 표면이 사소해도 `HIGH`다. 심각도 사다리와 형식은 better-interface 것을 따른다 | - | - | 범위 내 | better-ui:122; better-interface:77-95 |
| r101 | better-colors | better-interface | 참고 | 명시-이름 | 이 도메인의 escalation trigger(better-interface가 정한 목록)는 켜지면 표면이 사소해도 `HIGH`다. 심각도 사다리와 형식은 better-interface 것을 따른다 | - | - | 범위 내 | better-colors:84; better-interface:77-95 |
| r102 | better-typography | better-interface | 참고 | 명시-이름 | 이 도메인의 escalation trigger(better-interface가 정한 목록)는 켜지면 표면이 사소해도 `HIGH`다. 심각도 사다리와 형식은 better-interface 것을 따른다 | - | - | 범위 내 | better-typography:154; better-interface:77-95 |
| r103 | better-accessibility | better-interface | 참고 | 명시-이름 | 이 도메인의 escalation trigger(better-interface가 정한 목록)는 켜지면 표면이 사소해도 `HIGH`다. 심각도 사다리와 형식은 better-interface 것을 따른다 | - | - | 범위 내 | better-accessibility:128; better-interface:77-95 |
| r104 | variant | interface-review | 참고 | 명시-이름 | 역할 구분: 기존 UI 리뷰는 interface-review의 몫. variant는 후보를 만들 뿐 순위를 매기지 않는다 | - | - | 범위 내 | variant:11; interface-review:3-4 |
| r105 | variant | better-interface | 참고 | 명시-이름 | 역할 구분: 기존 UI 리뷰는 better-interface의 몫. 또 변형이 picker에 들어가기 전에 better-interface의 escalation trigger를 통과해야 한다(바닥 규칙, 의무형) | - | - | 범위 내 | variant:11,27-30; better-interface:77-91 |
| r106 | variant | break | 참고 | 명시-이름 | 역할 구분: 한 컴포넌트 스트레스 테스트는 break의 몫 | - | - | 범위 내 | variant:11; break:3 |
| r107 | variant | state-machine | 참고 | 명시-이름 | 역할 구분: 컴포넌트 상태를 하나씩 작업하는 일은 state-machine의 몫 | - | - | 범위 내 | variant:11; state-machine:3 |
| r108 | variant | better-layout | 참고 | 명시-이름 | 변형 축 표에서 Structure·Density 축의 담당 스킬로 적는다. 변형을 만들 때 그 스킬의 원칙을 쓰라는 안내 | - | - | 범위 내 | variant:17-24; better-layout:3 |
| r109 | variant | better-colors | 참고 | 명시-이름 | 변형 축 표에서 Emphasis 축의 담당 스킬로 적는다. 변형을 만들 때 그 스킬의 원칙을 쓰라는 안내 | - | - | 범위 내 | variant:17-24; better-colors:3 |
| r110 | variant | better-typography | 참고 | 명시-이름 | 변형 축 표에서 Type 축의 담당 스킬로 적는다. 변형을 만들 때 그 스킬의 원칙을 쓰라는 안내 | - | - | 범위 내 | variant:17-24; better-typography:3 |
| r111 | variant | better-writing | 참고 | 명시-이름 | 변형 축 표에서 Voice 축의 담당 스킬로 적는다. 변형을 만들 때 그 스킬의 원칙을 쓰라는 안내 | - | - | 범위 내 | variant:17-24; better-writing:3 |
| r112 | break | interface-review | 참고 | 명시-이름 | 역할 구분: 코드를 기준에 맞춰 리뷰하는 일은 interface-review의 몫. break는 판단하지 않고 페이지에서 눈에 띄게 깨진 것만 관찰한다 | - | - | 범위 내 | break:11; interface-review:3-4 |
| r113 | break | better-interface | 참고 | 명시-이름 | 역할 구분: 기준에 맞춘 리뷰는 better-interface의 몫 | - | - | 범위 내 | break:11; better-interface:3 |
| r114 | break | variant | 참고 | 명시-이름 | 역할 구분: 디자인 대안 탐색은 variant의 몫. variant는 실제 페이지를 고집하지만 break는 일부러 컴포넌트를 격리한다 | - | - | 범위 내 | break:11,13; variant:3 |
| r115 | break | state-machine | 참고 | 명시-이름 | 역할 구분: 제품 상태를 한 번에 하나씩 작업하는 일은 state-machine의 몫. break는 적대적 시나리오를 한 페이지에 쌓는다 | - | - | 범위 내 | break:11; state-machine:11 |
| r116 | break | better-typography | 참고 | 명시-이름 | 발견한 깨짐을 고칠 담당 스킬의 어휘로 이름 붙인다. 시나리오 표가 깨짐 종류마다 담당 스킬을 적는다. 호출 지시는 아니다. 사용자가 고치라고 요청하면 owner 스킬의 규칙을 따른 뒤 실패한 시나리오를 다시 그린다(break:64). owner 스킬을 호출한다는 문장은 아니며, 호출인지 규칙만 읽는 것인지는 원문에 명시 없음 | - | - | 범위 내 | break:11; break:57; break/scenarios.md:19,33; better-typography:3; break:64 |
| r117 | break | better-layout | 참고 | 명시-이름 | 발견한 깨짐을 고칠 담당 스킬의 어휘로 이름 붙인다. 시나리오 표가 깨짐 종류마다 담당 스킬을 적는다. 호출 지시는 아니다. 사용자가 고치라고 요청하면 owner 스킬의 규칙을 따른 뒤 실패한 시나리오를 다시 그린다(break:64). owner 스킬을 호출한다는 문장은 아니며, 호출인지 규칙만 읽는 것인지는 원문에 명시 없음 | - | - | 범위 내 | break:11; break/scenarios.md:19,33,46,58; better-layout:3; break:64 |
| r118 | break | better-writing | 참고 | 명시-이름 | 발견한 깨짐을 고칠 담당 스킬의 어휘로 이름 붙인다. 시나리오 표가 깨짐 종류마다 담당 스킬을 적는다. 호출 지시는 아니다. 사용자가 고치라고 요청하면 owner 스킬의 규칙을 따른 뒤 실패한 시나리오를 다시 그린다(break:64). owner 스킬을 호출한다는 문장은 아니며, 호출인지 규칙만 읽는 것인지는 원문에 명시 없음 | - | - | 범위 내 | break:11; break:58; break/scenarios.md:19,46; better-writing:3; break:64 |
| r119 | break | better-accessibility | 참고 | 명시-이름 | 발견한 깨짐을 고칠 담당 스킬의 어휘로 이름 붙인다. 시나리오 표가 깨짐 종류마다 담당 스킬을 적는다. 호출 지시는 아니다. 사용자가 고치라고 요청하면 owner 스킬의 규칙을 따른 뒤 실패한 시나리오를 다시 그린다(break:64). owner 스킬을 호출한다는 문장은 아니며, 호출인지 규칙만 읽는 것인지는 원문에 명시 없음 | - | - | 범위 내 | break:11; break/scenarios.md:72,78; better-accessibility:3; break:64 |
| r120 | break | better-ui | 참고 | 명시-이름 | 발견한 깨짐을 고칠 담당 스킬의 어휘로 이름 붙인다. 시나리오 표가 깨짐 종류마다 담당 스킬을 적는다. 호출 지시는 아니다. 사용자가 고치라고 요청하면 owner 스킬의 규칙을 따른 뒤 실패한 시나리오를 다시 그린다(break:64). owner 스킬을 호출한다는 문장은 아니며, 호출인지 규칙만 읽는 것인지는 원문에 명시 없음 | - | - | 범위 내 | break:11; break/scenarios.md:72; better-ui:3; break:64 |
| r121 | break | better-colors | 참고 | 명시-이름 | 발견한 깨짐을 고칠 담당 스킬의 어휘로 이름 붙인다. 시나리오 표가 깨짐 종류마다 담당 스킬을 적는다. 호출 지시는 아니다. 사용자가 고치라고 요청하면 owner 스킬의 규칙을 따른 뒤 실패한 시나리오를 다시 그린다(break:64). owner 스킬을 호출한다는 문장은 아니며, 호출인지 규칙만 읽는 것인지는 원문에 명시 없음 | - | - | 범위 내 | break:11; break/scenarios.md:78; better-colors:3; break:64 |
| r122 | state-machine | break | 참고 | 명시-이름 | 역할 구분: 적대적 시나리오를 한 페이지에 쌓아 한 번 보는 일은 break의 몫 | - | - | 범위 내 | state-machine:11; break:3 |
| r123 | state-machine | variant | 참고 | 명시-이름 | 역할 구분: 대안 디자인 탐색은 variant의 몫 | - | - | 범위 내 | state-machine:11; variant:3 |
| r124 | state-machine | interface-review | 참고 | 명시-이름 | 역할 구분: 끝난 작업 리뷰는 interface-review의 몫 | - | - | 범위 내 | state-machine:11; interface-review:3-4 |
| r125 | afk | better-interface | 참고 | 명시-이름 | 역할 구분: 인터페이스 리뷰는 better-interface의 몫. afk가 이 스킬을 실행한다는 지시는 없다 | - | - | 범위 내 | afk:11; better-interface:3 |
| r126 | afk | interface-review | 참고 | 명시-이름 | 역할 구분: diff 리뷰는 interface-review의 몫. afk가 이 스킬을 실행한다는 지시는 없다 | - | - | 범위 내 | afk:11; interface-review:3-4 |
| r127 | afk | variant | 참고 | 명시-이름 | 역할 구분: 한 컴포넌트의 대안 탐색은 variant의 몫. afk가 이 스킬을 실행한다는 지시는 없다 | - | - | 범위 내 | afk:11; variant:3 |
| r128 | afk | break | 참고 | 명시-이름 | 역할 구분: 한 컴포넌트 스트레스 테스트는 break의 몫. afk가 이 스킬을 실행한다는 지시는 없다 | - | - | 범위 내 | afk:11; break:3 |
| r129 | explain-interface | interface-review | 참고 | 명시-이름 | 역할 구분: 기준에 맞춘 리뷰는 interface-review의 몫. explain-interface는 평가하지 않고 설명한다(verdict 없음) | - | - | 범위 내 | explain-interface:11; interface-review:3-4 |
| r130 | explain-interface | better-interface | 참고 | 명시-이름 | 역할 구분: 기준에 맞춘 리뷰는 better-interface의 몫. explain-interface는 평가하지 않고 설명한다(verdict 없음) | - | - | 범위 내 | explain-interface:11; better-interface:3 |
| r131 | explain-interface | variant | 참고 | 명시-이름 | 역할 구분: 내 인터페이스의 대안 탐색은 variant의 몫. explain-interface는 평가하지 않고 설명한다(verdict 없음) | - | - | 범위 내 | explain-interface:11; variant:3 |
| r132 | explain-interface | better-colors | 참고 | 명시-이름 | 측정 기준으로 쓴다. 찾은 값을 담당 스킬이 정한 기준(예: 간격 2× 이상, 본문 60~75자)과 비교해 보고하지만 판정하지는 않는다. SKILL.md:11은 찾은 것을 담당 도메인 스킬의 어휘로 이름 붙이라고 한다(어휘 참조, 호출 아님) | 측정값 | - | 범위 내 | explain-interface/from-an-image.md:21-25; explain-interface/read-the-system.md:87; better-colors:3 |
| r133 | explain-interface | better-typography | 참고 | 명시-이름 | 측정 기준으로 쓴다. 찾은 값을 담당 스킬이 정한 기준(예: 간격 2× 이상, 본문 60~75자)과 비교해 보고하지만 판정하지는 않는다. SKILL.md:11은 찾은 것을 담당 도메인 스킬의 어휘로 이름 붙이라고 한다(어휘 참조, 호출 아님) | 측정값 | - | 범위 내 | explain-interface/from-an-image.md:37; better-typography:3; explain-interface:11 |
| r134 | explain-interface | better-layout | 참고 | 명시-이름 | 측정 기준으로 쓴다. 찾은 값을 담당 스킬이 정한 기준(예: 간격 2× 이상, 본문 60~75자)과 비교해 보고하지만 판정하지는 않는다. SKILL.md:11은 찾은 것을 담당 도메인 스킬의 어휘로 이름 붙이라고 한다(어휘 참조, 호출 아님) | 측정값 | - | 범위 내 | explain-interface/from-an-image.md:45; explain-interface/read-the-system.md:124; better-layout:3 |
| r135 | build-design | better-accessibility | 참고 | 명시-이름 | build-design은 도메인 규칙을 소유하지 않는다. 디자인이 대비 요구와 focus·시맨틱 규칙을 깨면 디자인대로 만들고 충돌을 better-accessibility에 보고한다(의무형). 충돌은 소유 스킬을 호출하는 것이 아니라 최종 보고의 `Domain conflicts` 목록에 소유 스킬 이름과 함께 적는 것이다. 대비·focus 변경이 디자인에 없으면 복원하고 같은 방식으로 충돌을 보고한다 | 충돌 보고 | - | 범위 내 | build-design:12; better-accessibility:3; build-design:67,81 |
| r136 | build-design | better-colors | 참고 | 명시-이름 | build-design은 도메인 규칙을 소유하지 않는다. 디자인이 대비 측정과 팔레트 규칙을 깨면 디자인대로 만들고 충돌을 better-colors에 보고한다(의무형). 충돌은 소유 스킬을 호출하는 것이 아니라 최종 보고의 `Domain conflicts` 목록에 소유 스킬 이름과 함께 적는 것이다. 대비·focus 변경이 디자인에 없으면 복원하고 같은 방식으로 충돌을 보고한다 | 충돌 보고 | - | 범위 내 | build-design:12; better-colors:3; build-design:67,81 |
| r137 | build-design | better-typography | 참고 | 명시-이름 | build-design은 도메인 규칙을 소유하지 않는다. 디자인이 글자 규칙을 깨면 디자인대로 만들고 충돌을 better-typography에 보고한다(의무형). 충돌은 소유 스킬을 호출하는 것이 아니라 최종 보고의 `Domain conflicts` 목록에 소유 스킬 이름과 함께 적는 것이다 | 충돌 보고 | - | 범위 내 | build-design:12; better-typography:3; build-design:67,81 |
| r138 | build-design | better-layout | 참고 | 명시-이름 | build-design은 도메인 규칙을 소유하지 않는다. 디자인이 간격·구조 규칙을 깨면 디자인대로 만들고 충돌을 better-layout에 보고한다(의무형). 충돌은 소유 스킬을 호출하는 것이 아니라 최종 보고의 `Domain conflicts` 목록에 소유 스킬 이름과 함께 적는 것이다 | 충돌 보고 | - | 범위 내 | build-design:12; better-layout:3; build-design:67,81 |
| r139 | build-design | better-writing | 참고 | 명시-이름 | build-design은 도메인 규칙을 소유하지 않는다. 디자인이 카피 규칙을 깨면 디자인대로 만들고 충돌을 better-writing에 보고한다(의무형). 충돌은 소유 스킬을 호출하는 것이 아니라 최종 보고의 `Domain conflicts` 목록에 소유 스킬 이름과 함께 적는 것이다 | 충돌 보고 | - | 범위 내 | build-design:12; better-writing:3; build-design:67,81 |
| r140 | build-design | better-ui | 참고 | 명시-이름 | build-design은 도메인 규칙을 소유하지 않는다. 디자인이 표면·아이콘·모션 규칙을 깨면 디자인대로 만들고 충돌을 better-ui에 보고한다(의무형). 충돌은 소유 스킬을 호출하는 것이 아니라 최종 보고의 `Domain conflicts` 목록에 소유 스킬 이름과 함께 적는 것이다 | 충돌 보고 | - | 범위 내 | build-design:12; better-ui:3; build-design:67,81 |
| r141 | build-design | interface-review | 참고 | 명시-이름 | 역할 구분: 끝난 작업 리뷰는 interface-review의 몫 | - | - | 범위 내 | build-design:12; interface-review:3-4 |
| r142 | build-design | variant | 참고 | 명시-이름 | 역할 구분: 대안 탐색은 variant의 몫 | - | - | 범위 내 | build-design:12; variant:3 |
| r143 | build-design | break | 참고 | 명시-이름 | 역할 구분: 컴포넌트 스트레스 테스트는 break의 몫 | - | - | 범위 내 | build-design:12; break:3 |
| r144 | teardown | better-typography | 참고 | 명시-이름 | 경계 구분: 글자 렌더링은 better-typography의 몫이다. 호출 지시는 아니다 | - | - | 범위 내 | teardown:14; better-typography:3 |
| r145 | teardown | better-colors | 참고 | 명시-이름 | 경계 구분: 팔레트와 렌더된 대비는 better-colors의 몫이다. 호출 지시는 아니다 | - | - | 범위 내 | teardown:14; teardown/preview-page.md:71; better-colors:3 |
| r146 | teardown | better-accessibility | 참고 | 명시-이름 | 경계 구분: 접근 가능한 임베딩(SVG `title`·`desc` 외 부품 목록 대안)은 better-accessibility의 몫이다. 호출 지시는 아니다. 컨트롤 시맨틱과 키보드 동작도 better-accessibility의 몫이다 | - | - | 범위 내 | teardown:14; teardown/sheet-and-svg.md:58; better-accessibility:3; teardown/preview-page.md:31 |
| r147 | teardown | better-layout | 참고 | 명시-이름 | 경계 구분: 주변 인터페이스와 반응형 배치는 better-layout의 몫이다. 호출 지시는 아니다 | - | - | 범위 내 | teardown:14; teardown/preview-page.md:31; better-layout:3 |
| r148 | teardown | better-writing | 참고 | 명시-이름 | 경계 구분: 컨트롤 카피는 better-writing의 몫이다. 호출 지시는 아니다 | - | - | 범위 내 | teardown/preview-page.md:31; better-writing:3 |
| r149 | break | break-ui | 같은 계열 | 추론 | 둘 다 컴포넌트에 긴 이름·빈 값 같은 최악의 데이터를 넣어 깨지는 곳을 찾는다. break는 가능한 모든 시나리오를 임시 페이지에 그리고 판단하지 않고 관찰한다. 작성자가 다르고 서로 부르지 않는다 | - | - | 범위 내 | break:3; break-ui:3 |
| r150 | variant | prototype | 같은 계열 | 추론 | 둘 다 UI 조각을 의도적으로 다른 여러 버전으로 만들어 화면의 선택기로 비교하게 하고, 둘 다 명시 호출만 한다. 작성자가 다르고 서로 부르지 않는다 | - | - | 범위 내 | variant:3-4; prototype:3 |
| r151 | better-ui | emil-design-eng | 같은 계열 | 추론 | 둘 다 UI 다듬기와 모션을 정확한 수치 원칙으로 다룬다. better-ui는 표면·아이콘·모션의 값, emil-design-eng는 Emil Kowalski의 판단 원칙. 작성자가 다르고 서로 부르지 않는다 | - | - | 범위 내 | better-ui:3; emil-design-eng:3 |
| r152 | better-interface | impeccable | 같은 계열 | 추론 | 둘 다 UI를 여러 관점에서 비평·감사한다. better-interface는 여섯 도메인 리뷰를 한 보고서로 합친다. 작성자가 다르고 서로 부르지 않는다 | - | - | 범위 내 | better-interface:3; impeccable:3 |
| r153 | interface-review | better-interface | 참고 | 명시-이름 | 규칙 덮어쓰기: 렌더 검증은 interface-review에서 선택(opt-in)이며 better-interface의 "Verify what can be verified"를 대신한다. 시각·런타임 주장은 프로젝트가 싸게 미리보기를 주거나 사용자가 렌더 리뷰를 요청하지 않으면 `Not verified`로 표시한다 | - | - | 범위 내 | interface-review:103; better-interface:59-61 |
| r154 | better-writing | better-interface | 참고 | 명시-이름 | better-writing의 `HIGH` 기준(복구 방법 없는 에러, 확인도 undo도 없는 파괴 동작)은 better-interface의 escalation trigger(89, 86)와 겹친다. 파괴 동작은 trigger 쪽이 "distinct treatment"가 있으면 발동하지 않아 기준이 다르다. better-writing의 심각도·형식은 better-interface가 대체한다 | - | - | 범위 내 | better-writing:140; better-interface:48-49,86,89 |
| r155 | better-layout | better-interface | 참고 | 추론 | better-layout의 `HIGH` 기준(320px·200% 확대에서 잘림, 복귀 길 없는 말줄임, 단서 없는 숨은 내용)이 better-interface의 escalation trigger와 겹친다. better-layout 원문은 better-interface를 이름으로 부르지 않는다 | - | - | 범위 내 | better-layout:86; better-interface:77-93 |
| r156 | interface-review | better-typography | 참고 | 명시-이름 | 제외 경로의 예외: 폰트 파일 추가·교체는 better-typography 변경이다. 바이트가 아니라 참조하는 코드를 리뷰한다 | - | - | 범위 내 | interface-review/scope-resolution.md:68; better-typography:3 |
| r157 | better-ui | review-animations | 같은 계열 | 추론 | 둘 다 모션을 수치로 점검한다. 값이 다르다: 눌림 scale `0.96`·150ms(better-ui) 대 `0.97`(범위 0.95~0.98)·160ms(review-animations), stagger 100ms 대 30~80ms. better-ui는 `0.96` 미만을 지적하므로 review-animations의 허용 범위 0.95는 better-ui에서 지적된다. 어느 쪽이 우선한다는 문장은 없다(충돌을 그대로 둔다). 작성자가 다르고 서로 부르지 않는다 | - | - | 범위 내 | better-ui:109; emilkowalski/review-animations/STANDARDS.md:59,149-151 |
| r158 | explain-interface | chrome-devtools-mcp | 참고 | 명시-이름 | 외부 도구. 라이브 URL에서 계산된 스타일·레이어를 읽을 때 chrome-devtools-mcp나 Playwright `page.evaluate`를 쓰라고 한다. 스킬이 아니라 외부 도구라 `범위 밖`이다 | - | - | 범위 밖 | explain-interface:40 |
| r159 | build-design | Figma MCP 서버 | 참고 | 명시-이름 | 외부 의존. Figma 도구(`get_design_context` 등)가 없거나 로그인이 안 되어 있으면 멈춘다. 서버와 도구는 스킬이 아니라 `범위 밖`이다 | Figma 디자인 컨텍스트 | - | 범위 밖 | build-design:16; build-design/figma.md:9-20 |

## 묶음

| group-id | 작업 목표 | 구성 스킬과 역할 | 그림 |
|---|---|---|---|
| motion-craft | 웹 UI의 모션을 찾고, 계획하고, 만들고, 검토한다 | find-animation-opportunities(움직일 곳 찾기), improve-animations(감사·구현 계획), animate(구현), review-animations(리뷰, 명시 호출만), animation-performance(끊김 진단, 선택지), animate-expo(React Native 변형) | `@workflow`: 원장에 있는 관계만 그린다. find → improve(r10, 제안, 실선), improve·animate → review(r12·r01, "같은 기준" 점선), animation-performance·animate-expo → animate(r07·r06, 역할 구분 점선). 나머지 역할 구분 참고(r03~r05, r08, r09, r11)는 표에만 |
| ui-component | UI 조각을 라이브러리로 고르거나 여러 버전으로 만들어 보고, 최악의 데이터로 깨 본다 | animate(컴포넌트가 필요하면 넘김), pick-ui-library(라이브러리 선택, 명시 호출만), ask-sonner(Sonner 사용 안내), prototype(여러 버전 비교, 명시 호출만), break-ui(최악 데이터 검증) | `@workflow`: animate → pick-ui-library(r02, 의무형이지만 명시 호출 제한과 충돌) → ask-sonner(r22, 추론). prototype·break-ui는 역할 구분 참고(r16, r21)라 점선 없이 표에 |
| garden-visual | 만들 결과물(웹 페이지, 장문 기사, 클릭형 발표, MP4 모션 영상, 이미지)에 맞는 garden 스킬을 고른다 | web-design-engineer(웹 결과물), beautiful-article(장문 기사), web-video-presentation(클릭형 발표), motion-showreel(MP4 영상), gpt-image-2(이미지 생성, web-design-engineer가 위임) | `@workflow`: 결과물 종류? 결정 노드(판정)에서 web-design-engineer·beautiful-article·web-video-presentation·motion-showreel 네 갈래, web-design-engineer → gpt-image-2(r35, 내부 위임). 서로 돌려보내는 넘김(r30~r34)은 표에 |
| site-design-choice | 랜딩 페이지·회사 웹사이트를 만들 스킬을 고른다(작성자가 다른 대안 비교) | landing-page-design, design-taste-frontend, impeccable, 10k-websites, web-design-engineer(모두 선택지) | 그림 없음: 직접 연결이 없다(같은 계열 r40~r45). 비교 표로 보여 준다 |
| interface-audit | 화면·흐름·저장소나 branch·PR 변경을 여섯 도메인 스킬로 리뷰해 순위 매긴 보고서 하나로 합친다 | better-interface(오케스트레이션·심각도·verdict), interface-review(변경 범위 리뷰, 명시 호출만), better-accessibility·better-layout·better-writing·better-typography·better-colors·better-ui(도메인 규칙, 이 순서로 리뷰) | `@workflow`: 요청 범위? → 화면·흐름·저장소면 better-interface로 직행, 변경이면 사용자가 interface-review 실행(r66, 제안·사용자 개입) → better-interface(r67, 의무형) → 도메인 여섯 개 순서대로(r60~r65, 내부 위임) → 보고서. interface-review의 removed-signals 위임(r69~r73)과 도메인 사이 경계 참고(r75~r103)는 표에 |
| component-workbench | 한 컴포넌트를 상태별·대안별·최악의 데이터로 임시 페이지에서 작업한다 | variant(대안 3개 비교), break(최악 시나리오 스트레스), state-machine(상태별 작업) — 모두 명시 호출만 | 그림 없음: 서로 역할만 가르고 순서가 없다(r104~r152 중 variant·break·state-machine 행 참고 행). 선택 기준 비교 표로 보여 준다 |

독립 스킬(묶음 없음): animation-vocabulary(r49 같은 계열), apple-design·emil-design-eng(r47·r48 같은 계열, 다른 스킬이 참고로 가리킴), mobile-native(r13~r15 참고), write-swift(연결 없음), kb-retriever(연결 없음), stageshow(연결 없음).
