# ask-sonner — React 토스트 라이브러리 Sonner를 설정·스타일링·진단하는 스킬 {#overview}

`ask-sonner`는 에이전트가 Sonner 설치와 호출 선택, 4단계 스타일링, 13개 증상별 트러블슈팅을 `SKILL.md` 기준으로 먼저 답하고 정확한 prop·기본값은 `API.md`에서 찾게 하는 스킬이다.[](source:s-fm)[](source:s-init)

- React 앱에 Sonner를 처음 붙이거나, `toast()` 호출 패턴 선택, 스타일·테마·아이콘·다중 배치, 토스트 미노출·중복·모달 뒤 가림 같은 오류를 해결할 때 켜진다. 질문 없이 불리면 고정 문구 한 줄만 답하고 기다린다.[](source:s-fm)[](source:s-init)
- 결과로 `<Toaster />` 배치 코드, 용도에 맞는 `toast()` 호출·스타일링 코드, 증상 원인 진단이 나온다.[](source:s-setup)[](source:s-pick)[](source:s-trouble)
- 다른 스킬과의 관계: 조사 범위에서 확인된 연결 없음.
- 하지 않는 것: `<Toaster />`를 페이지마다 또는 조건부로 중복 마운트하지 않고, 서버 코드 안에서 `toast()`를 직접 부르지 않으며, `!important`를 많이 붙이지 않고 헤드리스로 넘긴다.[](source:s-setup)[](source:s-style)

@answer scope="design/emilkowalski/ask-sonner · 원본 파일 2개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source s-fm title="frontmatter: name과 description" path=design/emilkowalski/ask-sonner/SKILL.md lines=1:4
@source s-init title="초기 응답과 API.md 참조 원칙" path=design/emilkowalski/ask-sonner/SKILL.md lines=8:16
@source s-setup title="설치·배치 2가지 규칙" path=design/emilkowalski/ask-sonner/SKILL.md lines=18:28
@source s-pick title="용도별 toast() 호출 선택표" path=design/emilkowalski/ask-sonner/SKILL.md lines=30:40
@source s-recipes title="토스트 갱신·유지·다중 배치·콜백 레시피" path=design/emilkowalski/ask-sonner/SKILL.md lines=42:58
@source s-style title="스타일링 4단계 사다리·아이콘·테마" path=design/emilkowalski/ask-sonner/SKILL.md lines=59:71
@source s-trouble title="증상별 트러블슈팅 13항목" path=design/emilkowalski/ask-sonner/SKILL.md lines=72:88
@source a-toaster title="Toaster prop 18개 명세" path=design/emilkowalski/ask-sonner/API.md lines=1:26
@source a-toast title="toast() 옵션 19개 명세" path=design/emilkowalski/ask-sonner/API.md lines=27:52
@source a-fn title="내보낸 함수 8개 목록" path=design/emilkowalski/ask-sonner/API.md lines=53:64

## 어떻게 동작하나 {#flow span=12}

원문은 고정된 실행 절차 대신 요청 유형별 안내 규칙과 증상표를 둔다. 스타일링만 필요한 최소 단계까지만 올라가는 단계형 판단을 따른다.[](source:s-init)[](source:s-style)

| 적용 상황 | 참조 파일 | 바뀌는 판단 | 출력 사례 |
| --- | --- | --- | --- |
| 질문 없는 초기 호출 | `SKILL.md` (`Initial Response`) | 다른 안내나 API 목록을 먼저 띄우지 않고 고정 문구 한 줄만 출력한 뒤 질문을 기다린다. | Emil Kowalski 기반 준비 문구 한 줄만 출력[](source:s-init) |
| Sonner 설치와 배치 | `SKILL.md` (`Setup`) | `<Toaster />`는 Next.js `layout.tsx` 같은 루트에 한 개만 마운트하고, `toast()`는 서버 액션 반환 후 클라이언트 코드에서만 부른다. | 루트 레이아웃의 `<Toaster />`와 클라이언트 `toast()`[](source:s-setup) |
| 알림 유형별 호출 선택 | `SKILL.md` (`Picking the right call`) | 단순 안내, 상태 아이콘, 수동 로딩, 비동기 완료 추적, 버튼 포함, 기본 틀 유지 JSX, 무스타일 JSX 7갈래 중 맞는 호출을 고른다. | `toast.promise(p, { loading, success, error })`[](source:s-pick) |
| 상태 갱신·다중 배치·콜백 | `SKILL.md` (`Recipes`) | 같은 `id`로 덮어쓰기, `Infinity` 유지, `id`·`toasterId` 분리, `onDismiss`와 `onAutoClose` 분리 처리 중 필요한 패턴을 쓴다. | `toast.loading(...)` 뒤 `toast.success(..., { id })`[](source:s-recipes) |
| 스타일링 4단계 사다리 | `SKILL.md` (`Styling`) | 기본·`richColors` → 인라인 `style` → `classNames`+`!important` → `toast.custom()` 순으로 필요한 만큼만 쓰고, `!important`가 많아지면 헤드리스로 간다. | 디자인 시스템용 `toast.custom()` 래퍼 구성[](source:s-style) |
| 오류·스타일 누락 진단 | `SKILL.md` (`Troubleshooting`) | 미노출·중복·클래스 무시·Astro/Shadow DOM 무스타일·모달 뒤 가림·다크 모드 미적용 등 13개 증상표에서 원인과 해법을 매칭한다. | Astro 뷰 전환 시 `import 'sonner/dist/styles.css'`[](source:s-trouble) |
| 정확한 prop·기본값 조회 | `API.md` | 개념과 패턴은 `SKILL.md`로 먼저 답하고, `<Toaster />` 18개 prop·`toast()` 19개 옵션·8개 함수의 정확한 이름과 기본값이 필요할 때만 `API.md`를 읽는다. | 기본 `duration` `4000`ms, `visibleToasts` `3`, `gap` `14`[](source:s-init)[](source:a-toaster)[](source:a-toast)[](source:a-fn) |

`SKILL.md`를 먼저 읽고 `API.md`를 필요할 때만 여는 구조 덕분에 일반 사용 질문에는 불필요한 prop 표를 읽지 않는다.[](source:s-init) 스타일링에서도 `unstyled: true`는 중간 타협책일 뿐이며, 커스텀 비중이 크면 위치·스택·스와이프만 유지한 `toast.custom()` 헤드리스를 권장한다.[](source:s-style)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 판단(description). Sonner 설치·사용법·스타일링이나 토스트 미노출·중복·다크 모드 오류 해결 요청에서 켜진다. 호출 제한 필드는 frontmatter에 없다.[](source:s-fm) |
| 성격 | React 토스트 라이브러리 Sonner의 배치 원칙, 호출 선택표, 스타일링 사다리, 트러블슈팅, API 참조를 제공하는 안내형 원칙 스킬이다.[](source:s-init)[](source:s-style) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| 없음 {#none} | - | - | 조사 범위에서 확인된 연결 없음 |

@code source=s-fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | 초기 응답, 설치 2원칙, 호출 7종, 레시피, 스타일링 4단계, 트러블슈팅 13증상 | 스킬이 켜질 때 가장 먼저 읽는다.[](source:s-init) | 질문 없는 초기 호출, Sonner 설치와 배치, 알림 유형별 호출 선택, 상태 갱신·다중 배치·콜백, 스타일링 4단계 사다리, 오류·스타일 누락 진단 |
| `API.md` | `<Toaster />` 18개 prop, `toast()` 19개 옵션, 내보낸 함수 8개의 타입과 기본값 표 | 정확한 prop 이름, 타입, 기본값이 필요할 때 읽는다.[](source:s-init) | 정확한 prop·기본값 조회 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 구체적 질문 없이 스킬이 처음 켜진 경우 | 고정 문구 한 줄만 출력하고 질문이 올 때까지 멈춘다. | [](source:s-init) |
| `<Toaster />` 배치 개수와 위치 | 루트에 한 개만 마운트한다. 페이지별·조건부 렌더링이나 `id` 없는 두 번째 `<Toaster />`는 모든 토스트를 중복 출력한다. | [](source:s-setup)[](source:s-trouble) |
| 서버 컴포넌트·서버 액션에서 토스트 띄우기 | `toast()`는 서버에서 아무 일도 하지 않으므로 서버 액션 결과를 반환받아 클라이언트 코드에서 호출한다. | [](source:s-setup) |
| `classNames`로 스타일 덮어쓰기 | 기본 스타일이 우선하므로 `!important`를 붙여야 하며, 몇 개 이상 `!important`가 필요하면 중단하고 `toast.custom()` 헤드리스로 전환한다. | [](source:s-style) |
| 다중 `<Toaster />` 타겟팅 | `id`가 있는 `<Toaster />`는 해당 `toasterId`만, `id`가 없는 `<Toaster />`는 `toasterId`가 없는 토스트만 표시한다. | [](source:s-recipes) |
| 모달·포털 뒤 가림이나 잘림 | `<Toaster />`를 `transform`, `filter`, `overflow` 조상이나 다이얼로그·포털 컨테이너 밖인 문서 루트로 옮긴다. | [](source:s-trouble) |
| 테마와 닫힘 콜백 | `theme` 기본값은 OS를 따르지 않는 `'light'`다. 닫힘 단일 콜백은 없으므로 수동 닫힘(`onDismiss`)과 시간 만료(`onAutoClose`)를 각각 연결한다. | [](source:s-recipes)[](source:s-style) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- `<Toaster />`·`toast()` 전체 API 명세 — 정확한 prop·기본값 조회 · 18개 prop, 19개 옵션, 8개 함수의 타입·기본값을 개요에서 요약했다.
- 트러블슈팅 13개 증상·원인·해법표 — 오류·스타일 누락 진단 · StrictMode 중복, Shadow DOM 스타일 복사, 모바일 `mobileOffset` 기준(`600px` 미만 `16px`) 등 개별 증상을 뺐다.

@callout level=open-question title="확인하지 못한 것"
| `SKILL.md`가 안내하는 prop·CSS 동작(`sonner/dist/styles.css`, `[data-sonner-toaster]`, 기본값 `4000`ms 등)은 `sonner` 패키지 소스 코드가 저장소에 없어 실제 구현을 대조하지 못했다. |

읽은 원본: 텍스트 파일 2개. 제외: `SKILL.ko.stale.md`, `API.ko.stale.md`(낡은 번역본이라 읽지 않음).
