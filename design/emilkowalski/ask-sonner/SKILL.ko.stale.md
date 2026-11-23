---
name: ask-sonner
description: React 토스트 라이브러리 Sonner의 설치와 Toaster 연결, 적절한 `toast()` 호출 선택, promise 및 로딩 토스트, 토스트 갱신·닫기·유지, 스타일·테마·아이콘, 위치와 여러 Toaster 사용을 안내합니다. Sonner를 쓰거나 문제를 해결할 때 사용합니다. 토스트가 나타나지 않거나 두 번 나타날 때, 스타일이 사라지거나 Tailwind 클래스를 무시할 때, 모달 뒤에 놓이거나 다크 모드를 따르지 않을 때도 사용합니다.
---

# Sonner 사용 안내

## 첫 응답

이 스킬이 구체적인 질문 없이 처음 호출되면 다음 문장만 응답합니다.

> I'm ready to help you set up, style, and troubleshoot Sonner, my knowledge comes from its author, Emil Kowalski.

사용자가 질문하기 전까지 다른 정보를 제공하지 않습니다.

[Sonner](https://sonner.emilkowal.ski)는 토스트 라이브러리입니다. Sonner가 포함된 작업(연결, 토스트 표시, 스타일 지정, 문제 수정)을 맡으면 먼저 이 파일을 기준으로 답합니다. `<Toaster />`와 `toast()`의 전체 prop 표는 [API.md](API.md)에 있습니다. 정확한 prop 이름, 타입, 기본값이 필요할 때 확인합니다.

## 설정

구성 요소는 두 개뿐입니다.

1. **`<Toaster />` 하나를 가능한 루트 가까이에 한 번만 마운트합니다.** Next.js에서는 `layout.tsx`에 두면 됩니다. 서버 컴포넌트 안에서도 작동합니다. 페이지마다 또는 조건부로 렌더링하지 마세요. Toaster를 두 개 마운트하면 토스트도 두 번 표시됩니다.
2. **클라이언트 코드에서 `toast()`를 호출합니다.** 이벤트 핸들러, 이펙트, 콜백에서 호출합니다. 일반 함수이므로 훅이나 provider는 필요하지 않습니다. 단, 서버에서는 동작하지 않습니다. 서버 액션에서는 결과를 반환하고, 그 결과를 받은 클라이언트 코드에서 `toast()`를 호출하세요.

```jsx
import { Toaster } from 'sonner'; // once, in layout
import { toast } from 'sonner';   // anywhere client-side
```

## 적절한 호출 선택

| 필요한 결과 | 호출 |
| --- | --- |
| 일반 메시지 | `toast('Title')` — 두 번째 줄이 필요하면 `{ description }`을 추가합니다. |
| 성공 / 오류 / 정보 / 경고 아이콘 | `toast.success('…')`, `toast.error('…')` 등 |
| 상태를 직접 관리하는 동안 스피너 표시 | `toast.loading('…')`을 호출한 다음 ID로 갱신합니다. |
| promise와 연결된 로딩 → 성공/오류 | `toast.promise(promise, { loading, success, error })` — success/error에는 완료된 값이나 오류를 받는 함수도 전달할 수 있습니다. |
| 동작을 실행하는 버튼 | `{ action: { label, onClick } }` — `onClick`에서 `event.preventDefault()`를 호출하지 않으면 토스트가 닫힙니다. `cancel`은 보조 버튼입니다. |
| JSX를 쓰되 기본 토스트 외형 유지 | `toast(<jsx />)` |
| 스타일 없이 사용자 지정 JSX 사용 | `toast.custom((t) => <jsx />)` — headless 방식이며 `t`에서 닫을 토스트의 ID를 얻습니다. |

## 레시피

**토스트 갱신** — 같은 `id`로 `toast()`를 다시 호출합니다. 전달한 prop만 바뀝니다. `toast.success(…, { id })`로 전환하면 유형도 바뀝니다. `toast.promise` 없이 로딩에서 성공으로 전환하는 방법입니다.

```jsx
const id = toast.loading('Uploading…');
toast.success('Uploaded', { id });
```

**유지** — `{ duration: Infinity }`를 사용합니다. **닫기** — `toast.dismiss(id)`를 호출하고, 모두 닫으려면 `toast.dismiss()`를 호출합니다. **활성 토스트 읽기** — React 안에서는 `useSonner()`, 밖에서는 `toast.getActiveToasts()`를 사용합니다.

**텍스트에 링크나 컴포넌트 넣기** — 제목이나 설명에 함수를 전달합니다: `toast(() => <a href="…">View</a>)`.

**여러 Toaster 사용** — 각 Toaster에 `id`를 주고 `toast('…', { toasterId: 'canvas' })`로 대상을 지정합니다. `toasterId`가 없으면 모든 Toaster가 토스트를 표시합니다.

**닫힘 콜백** — 닫기 버튼을 누르거나 스와이프하면 `onDismiss`가 실행되고, 시간이 지나 자동으로 닫히면 `onAutoClose`가 실행됩니다. 둘은 별도 콜백이며 일반적인 “닫힘” 단일 콜백은 없습니다.

## 스타일 지정 — 단계별 선택

필요한 수준까지만 적용합니다. 처음부터 가장 높은 단계로 가는 것도 괜찮습니다(권장하는 최종 방식입니다). 중간 단계에 오래 머무르지는 마세요.

1. **기본값** — 성공/오류에 색을 더하려면 Toaster에 `richColors`를 추가하고, 현재 테마에 반전해서 표시하려면 `invert`를 설정합니다.
2. **인라인 조정** — 모든 토스트는 Toaster의 `toastOptions={{ style: {…} }}`로, 개별 토스트는 각 `toast()` 호출의 `style`로 바꿉니다.
3. **부분별 클래스** — `toastOptions={{ classNames: { toast, title, description, actionButton, cancelButton, closeButton } }}`를 사용합니다. Sonner가 주입하는 스타일이 우선하므로 각 클래스에 `!important`가 필요합니다(Tailwind에서는 `!text-red-900`). 중요한 속성이 몇 개를 넘으면 중단하고 headless 방식으로 전환하세요.
4. **Headless** — `toast.custom()`에 직접 만든 JSX를 넣으면서 Sonner의 위치 지정, 쌓기, 스와이프 동작을 유지합니다. 디자인 시스템의 토스트에는 이 방식을 권장합니다. 자체 `toast()` 추상화 안에서 감싸세요. (`unstyled: true`도 중간 선택지이지만, headless가 같은 노력으로 더 많은 제어권을 제공합니다.)

**아이콘** — Toaster의 `icons` prop으로 유형별 기본 아이콘을 바꾸고, 토스트별로 바꾸려면 `icon`을 씁니다. `null`을 지정하면 제거합니다.

**테마** — 기본값은 `'light'`이며 OS 테마를 따라가지 않습니다. `theme="system"`을 전달하거나 테마 provider를 연결합니다: `next-themes`를 쓴다면 `<Toaster theme={resolvedTheme} />`로 설정합니다.

## 문제 해결

| 증상 | 원인 → 해결 |
| --- | --- |
| 토스트가 전혀 나타나지 않음 | `<Toaster />`가 없거나 조건부 렌더링 / 페이지별 배치로 이미 언마운트됐을 수 있습니다. 루트에 하나를 마운트하세요. 서버 액션에서 호출한다면 `toast()`는 클라이언트 전용이므로 결과를 받은 클라이언트에서 호출합니다. |
| 같은 토스트가 두 번 나타남 | Toaster가 두 개 마운트됐을 수 있습니다(레이아웃 **및** 페이지). 하나만 남기세요. 또는 React StrictMode 개발 모드에서 이펙트가 두 번 호출되며 `toast()`가 실행됐을 수 있습니다. 이벤트 핸들러에서 호출하거나 안정적인 `id`를 전달해 중복 생성 대신 기존 토스트를 갱신하세요. |
| Tailwind/CSS 클래스가 적용되지 않음 | 기본 스타일이 우선할 수 있습니다. `!important`를 쓰거나 위 단계에 나온 `unstyled` / headless 방식을 사용합니다. |
| 토스트의 스타일이 모두 사라짐(Astro, view transitions에서 흔함) | Sonner가 주입한 스타일시트가 사라졌을 수 있습니다. 레이아웃에서 `import 'sonner/dist/styles.css'`로 명시적으로 가져옵니다. |
| Shadow DOM 안에서 스타일이 사라짐 | 스타일이 shadow root가 아니라 `document.head`에 삽입됩니다. 텍스트에 `[data-sonner-toaster]`가 포함된 스타일 태그를 shadow root 안으로 복사합니다. |
| 토스트가 모달 / 오버레이 뒤에 있거나 잘려 보임 | 조상 요소가 스태킹 컨텍스트(`transform`, `filter`, `overflow`)를 만들었거나 오버레이의 z-index가 Toaster보다 높을 수 있습니다. `<Toaster />`를 다이얼로그 / portal 컨테이너 바깥의 문서 루트로 옮깁니다. |
| 다크 모드를 무시함 | 기본 `theme`은 `'light'`입니다. `theme="system"`을 지정하거나 해결된 테마를 전달합니다(위 테마 항목 참고). |
| 성공 / 오류 토스트가 초록색 / 빨간색이 아니라 회색임 | 기본 동작입니다. Toaster에 `richColors`를 추가합니다. |
| 토스트가 닫히지 않음 | `duration: Infinity`, `dismissible: false`, 또는 완료되지 않는 `toast.promise` 때문일 수 있습니다. promise가 끝나지 않으면 로딩 토스트도 계속 표시됩니다. |
| `toast.promise`가 로딩 상태에서 멈춤 | 첫 번째 인수는 promise 또는 promise를 반환하는 함수여야 하고, promise가 실제로 resolve 또는 reject되어야 합니다. |
| 스와이프 방향이 반대이거나 동작하지 않음 | 방향은 `position`에 따라 결정됩니다. Toaster의 `swipeDirections`로 재정의하세요. |
| 토스트가 모든 Toaster에 표시됨 | 여러 Toaster를 쓸 때는 대상을 지정해야 합니다. 각 Toaster에 `id`를 주고 `toast()` 호출에 `toasterId`를 전달합니다. |
| 모바일에서 토스트가 화면 가장자리에 너무 가까움 | `offset`은 데스크톱 간격(기본 32px), `mobileOffset`은 600px 미만 화면의 간격(기본 16px)입니다. 숫자, CSS 문자열, 면별 객체를 사용할 수 있습니다. |
