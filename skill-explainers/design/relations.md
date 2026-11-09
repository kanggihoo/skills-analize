# design 관계 원장
분석 커밋: 4e3fc895a4a5c4dd6c1e09e21a14bb2d1255ba9d

- 범위: `design/` 아래 `SKILL.md` 25개. 작성자 폴더 6개(`10k-websites`, `elayadesign`, `emilkowalski`, `garden-skills`, `impeccable`, `taste`)와 그 아래 스킬 폴더로 나뉜다. 원격 출처는 `design/skills-lock.json`(impeccable, 10k-websites)과 작성자 폴더마다 있는 `skills-lock.json`이다.
- **최신화**: 2026-11-07에 `scripts/update-skill.py`로 lock 5개를 모두 최신화했다. 9개 스킬이 바뀌었다(emilkowalski의 animate, animation-performance, emil-design-eng, improve-animations, review-animations / impeccable / motion-showreel / landing-page-design / design-taste-frontend). 사용자 승인을 받아 local commit `4e3fc89`로 올렸고, 위 "분석 커밋"이 그 commit이다. push는 하지 않았다.
- 번역본: 원본이 바뀐 스킬의 번역본은 `*.ko.stale.md`로 이름이 바뀌었다. 번역본(`*.ko.md`, `*.ko.stale.md`, `README.zh-CN.md`는 번역본이 아니라 중국어 README 원본일 수 있으므로 스킬 페이지에서 확인)은 열지 않는다. garden-skills의 SKILL.md 5개(beautiful-article, gpt-image-2, kb-retriever, motion-showreel, web-video-presentation)는 본문이 중국어이고 그것이 원본이다.
- 원문 비교: 25개와 이름이 같은 `SKILL.md`는 다른 컬렉션에 없다(`find`로 확인, `skill-explainers/`와 `.git` 제외).
- 이름 충돌 주의: impeccable의 `animate`는 impeccable 안의 하위 명령(`reference/animate.md`)이다. emilkowalski의 `animate` 스킬을 부르는 것이 아니다(r46). `prototype`이라는 단어도 대부분 JS의 `prototype`이나 일반 명사로 나와 관계 후보에서 뺐다. 관계로 남긴 것은 스킬 이름을 백틱으로 적은 문장뿐이다.
- 컬렉션 밖: `skill-explainers/video/relations.md`는 `motion-showreel`·`web-video-presentation`을 다른 컬렉션이라 읽지 않았다고 적는다. 이번 최신화로 `update-skill.py`가 그 원장을 "관계 재확인" 대상으로 표시했지만, video 원장에는 이 두 스킬과의 관계 행이 없어 고칠 것이 없다. 이 원장에도 video 컬렉션과의 관계는 적지 않는다(`범위 밖`).
- 조사 상태 표기: `부분`은 필수 자료 일부를 확인하지 못했다는 뜻이다. 25개 모두 필수 자료(SKILL.md와 그것이 가리키는 references)를 끝까지 읽어 `완료`다. 다만 다음은 코드·생성 데이터를 일부만 읽었고 각 페이지 감사 패널과 `files.md`에 범위를 적었다: `10k-websites`(큰 코드 12개 부분 읽음), `gpt-image-2`(템플릿 92개 중 표본 16개, 구조만 76개), `motion-showreel`(scripts·테스트 49개 구조·표본), `web-video-presentation`(테마·CSS 53개 구조·표본), `impeccable`(번들 JS 6개 구조·표본, 엔진 바이너리는 저장소 밖), `design-taste-frontend`(`consistency.mjs` 약 11%, assets 1,435개 구조·표본, 바이너리 151개 제외).

## 스킬

| 경로 ID | 한 줄 요약 | 조사 상태 | 원문 비교 | 소속 묶음 | 역할 |
|---|---|---|---|---|---|
| design/10k-websites/10k-websites | 초보자를 브리프부터 스크롤 연출 웹사이트 제작, OpenArt 이미지·영상 생성, Hostinger 배포까지 데려간다 | 완료 | - | site-design-choice | 선택지 |
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

## 묶음

| group-id | 작업 목표 | 구성 스킬과 역할 | 그림 |
|---|---|---|---|
| motion-craft | 웹 UI의 모션을 찾고, 계획하고, 만들고, 검토한다 | find-animation-opportunities(움직일 곳 찾기), improve-animations(감사·구현 계획), animate(구현), review-animations(리뷰, 명시 호출만), animation-performance(끊김 진단, 선택지), animate-expo(React Native 변형) | `@workflow`: 원장에 있는 관계만 그린다. find → improve(r10, 제안, 실선), improve·animate → review(r12·r01, "같은 기준" 점선), animation-performance·animate-expo → animate(r07·r06, 역할 구분 점선). 나머지 역할 구분 참고(r03~r05, r08, r09, r11)는 표에만 |
| ui-component | UI 조각을 라이브러리로 고르거나 여러 버전으로 만들어 보고, 최악의 데이터로 깨 본다 | animate(컴포넌트가 필요하면 넘김), pick-ui-library(라이브러리 선택, 명시 호출만), ask-sonner(Sonner 사용 안내), prototype(여러 버전 비교, 명시 호출만), break-ui(최악 데이터 검증) | `@workflow`: animate → pick-ui-library(r02, 의무형이지만 명시 호출 제한과 충돌) → ask-sonner(r22, 추론). prototype·break-ui는 역할 구분 참고(r16, r21)라 점선 없이 표에 |
| garden-visual | 만들 결과물(웹 페이지, 장문 기사, 클릭형 발표, MP4 모션 영상, 이미지)에 맞는 garden 스킬을 고른다 | web-design-engineer(웹 결과물), beautiful-article(장문 기사), web-video-presentation(클릭형 발표), motion-showreel(MP4 영상), gpt-image-2(이미지 생성, web-design-engineer가 위임) | `@workflow`: 결과물 종류? 결정 노드(판정)에서 web-design-engineer·beautiful-article·web-video-presentation·motion-showreel 네 갈래, web-design-engineer → gpt-image-2(r35, 내부 위임). 서로 돌려보내는 넘김(r30~r34)은 표에 |
| site-design-choice | 랜딩 페이지·회사 웹사이트를 만들 스킬을 고른다(작성자가 다른 대안 비교) | landing-page-design, design-taste-frontend, impeccable, 10k-websites, web-design-engineer(모두 선택지) | 그림 없음: 직접 연결이 없다(같은 계열 r40~r45). 비교 표로 보여 준다 |

독립 스킬(묶음 없음): animation-vocabulary(r49 같은 계열), apple-design·emil-design-eng(r47·r48 같은 계열, 다른 스킬이 참고로 가리킴), mobile-native(r13~r15 참고), write-swift(연결 없음), kb-retriever(연결 없음).
