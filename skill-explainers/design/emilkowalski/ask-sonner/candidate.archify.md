# ask-sonner 스킬은 에이전트를 어떻게 바꾸나 {#ask-sonner-skill}

`ask-sonner`를 쓰면 에이전트는 React toast 라이브러리 Sonner에 관한 질문에 이 스킬의 파일을 먼저 보고 답한다. 설치는 `<Toaster />` 한 번 mount와 client 쪽 `toast()` 호출 두 조각으로 정리하고, 흔한 고장은 증상별 원인과 해결로 짚는다. 정확한 prop 이름, 타입, 기본값이 필요하면 `API.md`를 읽는다.[](source:as-guide)[](source:as-setup)

- 켜지는 때: Sonner로 작업하거나 고장을 고칠 때다. 호출 제한 필드가 없어서 모델이 `description`을 보고 켤 수 있다.[](source:as-fm)
- 강제하는 것: `<Toaster />`는 root 가까이에 딱 한 번 둔다. 페이지마다 두거나 조건부로 그리지 않는다.[](source:as-setup)
- 스타일 규칙: 바꾸려는 만큼만 사다리를 오른다. 중간 단계에 오래 머물지 말고, `!important`가 여러 개 필요해지면 headless로 간다.[](source:as-ladder)
- 쓰지 않는 때: Sonner와 상관없는 작업이다. 원문은 그 밖의 금지 상황을 적지 않는다(`원문에 명시 없음`).[](source:as-fm)

@answer scope="design/emilkowalski/ask-sonner · 원본 텍스트 2개 11,778B · 커밋 4e3fc89 · 지시상 동작이며 Sonner 실제 버전과 대조하지 않음"
@meta locale=ko
@source as-fm title="design/emilkowalski/ask-sonner/SKILL.md · 7233B · 지시 본문과 frontmatter" path=design/emilkowalski/ask-sonner/SKILL.md lines=1:4
@source as-init title="SKILL.md · 첫 응답" path=design/emilkowalski/ask-sonner/SKILL.md lines=8:14
@source as-guide title="SKILL.md · guide 스킬 설명" path=design/emilkowalski/ask-sonner/SKILL.md lines=16:16
@source as-setup title="SKILL.md · Setup" path=design/emilkowalski/ask-sonner/SKILL.md lines=18:28
@source as-calls title="SKILL.md · 호출 고르기" path=design/emilkowalski/ask-sonner/SKILL.md lines=30:40
@source as-recipes title="SKILL.md · Recipes" path=design/emilkowalski/ask-sonner/SKILL.md lines=42:57
@source as-ladder title="SKILL.md · 스타일 사다리" path=design/emilkowalski/ask-sonner/SKILL.md lines=59:66
@source as-icons title="SKILL.md · Icons와 Theme" path=design/emilkowalski/ask-sonner/SKILL.md lines=68:70
@source as-trouble title="SKILL.md · Troubleshooting" path=design/emilkowalski/ask-sonner/SKILL.md lines=72:88
@source api-head title="design/emilkowalski/ask-sonner/API.md · 4545B · prop 표" path=design/emilkowalski/ask-sonner/API.md lines=1:3
@source api-toaster title="API.md · Toaster props" path=design/emilkowalski/ask-sonner/API.md lines=5:24
@source api-toast title="API.md · toast() options" path=design/emilkowalski/ask-sonner/API.md lines=26:51
@source api-fn title="API.md · Functions" path=design/emilkowalski/ask-sonner/API.md lines=53:64
@source pk-sonner title="design/emilkowalski/pick-ui-library/SKILL.md · 관계 확인용 줄(r22 Sonner 추천)" path=design/emilkowalski/pick-ui-library/SKILL.md lines=34:34
@source pk-hand title="design/emilkowalski/pick-ui-library/SKILL.md · 관계 확인용 줄(r22 손으로 만든 toast)" path=design/emilkowalski/pick-ui-library/SKILL.md lines=80:80

## 언제 켜지고 어떻게 답하나 {#trigger}

@code source=as-fm language=yaml

호출 제한 필드가 없다. 그래서 모델이 `description`을 참고해 스스로 켤 수 있다.[](source:as-fm) 판정: `description`에 나오는 증상(안 보이는 toast, 두 번 뜨는 toast, Tailwind class 무시, modal 뒤에 숨음, dark mode 무시)은 판단을 돕는 예시이고, 그 문구가 있어야 켜지는 목록은 아니다.

질문 없이 스킬만 불리면 에이전트는 "I'm ready to help you set up, style, and troubleshoot Sonner, …"라는 한 문장만 답하고 기다린다.[](source:as-init)

작업에 Sonner가 들어 있으면 에이전트는 `SKILL.md`에서 먼저 답을 찾는다. `<Toaster />`와 `toast()`의 전체 prop 표는 `API.md`에 있고, 정확한 prop 이름·타입·기본값이 필요할 때 그 파일을 읽는다.[](source:as-guide) `API.md`는 `toast()`에 넘긴 옵션이 Toaster의 `toastOptions`에 같은 옵션보다 우선한다고 적는다.[](source:api-head)

이 스킬에는 사용자 승인 지점이나 파일 쓰기 규칙이 따로 없다. 원문은 답의 내용만 정한다(`원문에 명시 없음`).

## 설치 두 조각과 toast 호출은 어떻게 고르나 {#setup}

설치는 두 조각뿐이다.[](source:as-setup)

1. `<Toaster />`를 한 번만, root에 가깝게 mount한다. Next.js에서는 `layout.tsx`에 두고, server component 안에서도 동작한다. 페이지마다 두거나 조건부로 그리면 안 된다. Toaster가 두 개 mount되면 모든 toast가 두 번 뜬다.
2. `toast()`는 client 코드(event handler, effect, callback)에서 부른다. hook이나 provider 없이 쓰는 함수지만, server에서는 아무것도 하지 않는다. server action에서는 결과를 돌려주고, 그 결과를 받은 client 코드에서 `toast()`를 부른다.

| 원하는 것 | 호출 |
| --- | --- |
| 단순 메시지 | `toast('Title')`. 둘째 줄은 `{ description }`[](source:as-calls) |
| 성공·오류·정보·경고 아이콘 | `toast.success('…')`, `toast.error('…')` 등[](source:as-calls) |
| 상태를 직접 관리하며 spinner | `toast.loading('…')` 뒤에 id로 갱신[](source:as-calls) |
| promise에 묶인 loading → success/error | `toast.promise(promise, { loading, success, error })`. success/error에는 결과값·오류를 받는 함수도 된다[](source:as-calls) |
| 동작하는 버튼 | `{ action: { label, onClick } }`. `onClick`이 `event.preventDefault()`를 부르지 않으면 toast가 닫힌다. 보조 버튼은 `cancel`[](source:as-calls) |
| 기본 toast 틀에 custom JSX | `toast(<jsx />)`[](source:as-calls) |
| 스타일 전혀 없는 custom JSX | `toast.custom((t) => <jsx />)`. headless이고 `t`로 닫을 id를 받는다[](source:as-calls) |

자주 쓰는 레시피는 이렇다.[](source:as-recipes)

- 갱신: 같은 `id`로 `toast()`를 다시 부르면 넘긴 prop만 바뀐다. `toast.success(…, { id })`로 부르면 종류가 바뀐다. `toast.promise` 없이 loading → success를 만드는 방법이다.
- 유지·닫기: `{ duration: Infinity }`면 계속 남는다. `toast.dismiss(id)`는 하나, `toast.dismiss()`는 전부 닫는다.
- 열린 toast 읽기: React 안에서는 `useSonner()`, 밖에서는 `toast.getActiveToasts()`다.
- 텍스트에 링크·컴포넌트: 제목이나 설명에 함수를 넘긴다. 예: `toast(() => <a href="…">View</a>)`.
- 여러 Toaster: Toaster마다 `id`를 주고 `toast('…', { toasterId: 'canvas' })`로 겨냥한다. `toasterId`가 없으면 모든 Toaster가 그 toast를 그린다.
- 닫힘 callback: `onDismiss`는 닫기 버튼이나 swipe에서, `onAutoClose`는 시간 초과에서 불린다. 둘을 합친 "closed" callback은 없다.

## 스타일은 어떤 순서로 바꾸나 {#styling}

에이전트는 바꾸려는 만큼만 사다리를 오른다. 처음부터 맨 위로 가는 것은 괜찮다고 원문은 말한다. 맨 위가 권장하는 최종 상태이기 때문이다. 중간 단계에 오래 머무는 것은 안 된다.[](source:as-ladder)

@workflow id=style-ladder title="스타일 사다리"
| sl-default | 1 기본값 | backend |
| sl-inline | 2 inline 조정 | backend |
| sl-class | 3 부분별 class | backend |
| sl-many | important가 많나? | backend |
| sl-headless | 4 headless | backend |
| sl-default > sl-inline | 더 필요 |
| sl-inline > sl-class | 더 필요 |
| sl-class > sl-many | |
| sl-many > sl-headless | 예 | emphasis |
| sl-default > sl-headless | 바로 가도 됨 | dashed |

@steps id=style-steps
| sl-default | 1 기본값 | 기본 스타일에 Toaster의 `richColors`(성공·오류를 색으로), `invert`(테마와 반대 색)를 더한다.[](source:as-ladder) | style-ladder | sl-default |
| sl-inline | 2 inline 조정 | Toaster의 `toastOptions={{ style: {…} }}`로 전체를, `toast()`마다 `style`로 하나를 바꾼다.[](source:as-ladder) | style-ladder | sl-inline |
| sl-class | 3 부분별 class | `toastOptions={{ classNames: { toast, title, description, actionButton, cancelButton, closeButton } }}`. Sonner가 넣는 스타일이 cascade에서 이기므로 class마다 `!important`가 필요하다(Tailwind는 `!text-red-900`).[](source:as-ladder) | style-ladder | sl-class |
| sl-many | important가 많나? | `!important`를 몇 개 넘게 붙이고 있으면 멈추고 headless로 간다. 원문은 "more than a few"라고만 하고 숫자는 정하지 않는다.[](source:as-ladder) | style-ladder | sl-many |
| sl-headless | 4 headless | `toast.custom()`에 직접 만든 JSX를 넣고 Sonner의 위치·쌓기·swipe는 그대로 쓴다. design system toast라면 이것을 자기 `toast()` 함수로 감싸는 방식을 권한다. `unstyled: true`는 중간 단계로 있지만 같은 노력으로 headless가 더 많이 통제한다고 본다.[](source:as-ladder) | style-ladder | sl-headless |

아이콘은 Toaster의 `icons` prop으로 종류별로, `icon`으로 toast별로 바꾸고, `null`로 없앤다.[](source:as-icons) 테마는 기본이 `'light'`이고 OS를 따르지 않는다. `theme="system"`을 주거나 `next-themes`의 `<Toaster theme={resolvedTheme} />`처럼 테마 provider와 잇는다.[](source:as-icons)

## 고장이 나면 어디부터 보나 {#trouble}

| 증상 | 원인과 해결(원문) |
| --- | --- |
| toast가 아예 안 뜬다 | `<Toaster />`가 없거나 unmount됐다(조건부 렌더, 페이지별 배치). root에 하나 둔다. server action에서 불렀다면 client에서 결과로 부른다[](source:as-trouble) |
| 같은 toast가 두 번 뜬다 | Toaster가 layout과 page에 둘 mount됐다. 또는 React StrictMode의 개발용 이중 실행 아래 effect에서 불렀다. event handler에서 부르거나 고정 `id`를 넘긴다[](source:as-trouble) |
| Tailwind·CSS class가 안 먹는다 | 기본 스타일이 덮는다. `!important`를 붙이거나 `unstyled`나 headless로 간다[](source:as-trouble) |
| 스타일이 통째로 없다(Astro, view transition) | 주입된 stylesheet가 사라졌다. layout에서 `import 'sonner/dist/styles.css'`[](source:as-trouble) |
| Shadow DOM 안에서 스타일 없음 | 스타일이 shadow root가 아닌 `document.head`에 들어간다. `[data-sonner-toaster]`가 든 style 태그를 shadow root로 복사한다[](source:as-trouble) |
| modal·overlay 뒤에 숨거나 잘린다 | 조상이 stacking context(`transform`, `filter`, `overflow`)를 만들거나 overlay의 z-index가 더 높다. `<Toaster />`를 dialog·portal 밖 document root로 옮긴다[](source:as-trouble) |
| dark mode를 무시한다 | `theme` 기본값이 `'light'`다. `theme="system"`이나 해석된 테마를 넘긴다[](source:as-trouble) |
| 성공·오류가 회색이다 | 기본값이다. Toaster에 `richColors`를 더한다[](source:as-trouble) |
| toast가 안 닫힌다 | `duration: Infinity`, `dismissible: false`, 또는 끝나지 않는 promise의 `toast.promise`[](source:as-trouble) |
| `toast.promise`가 loading에 멈춘다 | 첫 인자가 promise(또는 promise를 돌려주는 함수)여야 하고 실제로 resolve/reject해야 한다[](source:as-trouble) |
| swipe 닫기 방향이 틀리거나 안 된다 | 방향은 `position`에서 정해진다. Toaster의 `swipeDirections`로 바꾼다[](source:as-trouble) |
| 모든 Toaster에 같은 toast가 뜬다 | Toaster마다 `id`를 주고 `toast()`에 `toasterId`를 넘긴다[](source:as-trouble) |
| 모바일에서 화면 끝에 너무 붙는다 | `offset`(데스크톱, 기본 32px)과 `mobileOffset`(600px 미만, 기본 16px). 숫자, CSS 문자열, 면별 객체가 된다[](source:as-trouble) |

`API.md`가 적은 기본값 가운데 고장과 자주 엮이는 것들이다.[](source:api-toaster)[](source:api-toast)

@facts
| `theme` | `'light'`(`'dark'`, `'system'` 가능) |
| `position` | `'bottom-right'`(여섯 위치) |
| `visibleToasts` | 3 |
| `duration` | 4000ms. `Infinity`면 유지 |
| `gap` | 14(펼쳤을 때 toast 사이) |
| `offset` / `mobileOffset` | `'32px'` / `'16px'`(화면 폭 600px 미만) |
| `hotkey` | `⌥/alt + T`(Toaster 영역에 포커스) |
| `containerAriaLabel` | `'Notifications'` |

`API.md`의 함수 표에는 `toast()`, 종류별 `toast.success` 등, `toast.loading`, `toast.promise`, `toast.custom`, `toast.dismiss`, `toast.getActiveToasts()`, `useSonner()`가 있다. `toast()`는 그 toast의 id를 돌려준다.[](source:api-fn)

## 흐름 속 위치 {#position}

@workflow id=sonner-position title="ask-sonner 앞뒤"
| sp-pick | pick-ui-library | backend |
| sp-sonner | ask-sonner | backend |
| sp-code | 프로젝트 코드 | external |
| sp-pick > sp-sonner | Sonner 선택(추론) | dashed |
| sp-sonner > sp-code | 설정·수정 안내 | emphasis |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `pick-ui-library`(앞) | 라이브러리 선택(Sonner) | - | 산출물 호환, 근거 방식은 추론이다. `pick-ui-library`는 toast·알림에 Sonner를 추천하고 손으로 만든 toast를 Sonner로 바꾸라고 한다. 이 스킬은 그 Sonner의 사용 안내다. 두 스킬은 서로 이름을 부르지 않는다. 상태는 프로젝트 `package.json`에 남는다[](source:pk-sonner)[](source:pk-hand)[](source:as-fm) | r22 |
| (뒤) | 이 스킬 뒤에 오는 스킬은 없다 | Sonner 설정과 수정 방법 | 받는 쪽은 사용자의 프로젝트 코드다[](source:as-guide) | - |

r22는 직접 호출이 없는 추론 관계라 점선으로 그렸다. `pick-ui-library`는 명시 호출만 되는 스킬이라, 그 스킬이 끝난 뒤 이 스킬이 이어지는 흐름은 사용자가 두 스킬을 차례로 쓸 때만 생긴다. 판정이며, 근거는 원장 r22와 `pick-ui-library`의 호출 제한이다.

전체 흐름은 `design/_group-ui-component/ui-component.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 2개, 합계 11,778B다. `SKILL.md` 7,233B, `API.md` 4,545B다.
- 관계 확인용으로 `pick-ui-library/SKILL.md`의 34줄과 80줄을 봤다. 읽은 파일 수에는 넣지 않았다.
- 구조·표본만 본 파일과 바이너리 파일은 없다.
- 제외한 파일: `SKILL.ko.md`(9,405B), `API.ko.md`(5,831B)는 번역본이라 열지 않았다.
- 원문 대조 범위: 활성화 제한 1개(호출 제한 필드 없음), 설치 규칙 2개, 호출 표 7행, 레시피 6개, 스타일 사다리 4단과 아이콘·테마 규칙, 고장 표 13행, `API.md` 기본값 8개를 모두 대조했다. `API.md`는 전부 읽었고, 페이지에는 기본값 8개와 함수 표만 옮겼다. 관계 행 r22는 원장과 원문을 다시 대조했고 같다.
- 분석 중 바뀐 파일: 없음. `design/` 아래 작업 트리는 commit `4e3fc89` 그대로다.

@callout level=open-question title="원문만으로 정해지지 않는 것"
- 이 스킬은 Sonner 버전을 적지 않는다. 설명이 지금 배포된 Sonner와 맞는지는 실제 패키지와 대조하지 않았다(`원문에 명시 없음`).[](source:as-guide)
- `SKILL.md`는 `offset` 기본값을 "32px", `API.md`는 `'32px'` 문자열로 적는다. 같은 값으로 읽었다.[](source:as-trouble)[](source:api-toaster)
- `!important`를 "몇 개" 넘게 붙이면 headless로 가라는 기준에 숫자가 없다.[](source:as-ladder)
