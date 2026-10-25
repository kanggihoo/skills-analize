# Sonner API 참조

정확한 props, 타입, 기본값을 정리합니다. `toast()`에 전달한 옵션은 Toaster의 `toastOptions`에 지정된 같은 옵션보다 우선합니다.

## `<Toaster />`

| Prop | Type | Default | 설명 |
| --- | --- | --- | --- |
| `theme` | `string` | `'light'` | `'light'`, `'dark'`, `'system'` 중 하나입니다. |
| `richColors` | `boolean` | `false` | 오류 및 성공 상태의 색상을 더 다채롭게 표시합니다. |
| `expand` | `boolean` | `false` | 토스트를 기본으로 펼칩니다(끄면 호버했을 때 펼칩니다). |
| `visibleToasts` | `number` | `3` | 화면에 표시할 토스트 개수입니다. |
| `id` | `string` | – | Toaster ID입니다. `toast()`의 `toasterId` 옵션으로 지정합니다. |
| `position` | `string` | `'bottom-right'` | `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right` 중 하나입니다. |
| `closeButton` | `boolean` | `false` | 모든 토스트에 닫기 버튼을 추가합니다. |
| `offset` | `string \| number \| object` | `'32px'` | 화면 가장자리와의 간격입니다. 객체로 지정하면 면마다 설정합니다: `{ bottom: '24px', right: '16px' }`. |
| `mobileOffset` | `string \| number \| object` | `'16px'` | 화면 너비가 600px 미만일 때의 간격입니다. |
| `swipeDirections` | `array` | 위치에 따라 결정 | 스와이프해서 닫을 수 있는 방향입니다. |
| `dir` | `string` | `'ltr'` | 텍스트 방향입니다. |
| `hotkey` | `string` | `⌥/alt + T` | 키보드 단축키로 Toaster 영역에 포커스를 둡니다. |
| `invert` | `boolean` | `false` | 밝은 테마에서는 어두운 토스트를, 어두운 테마에서는 밝은 토스트를 표시합니다. |
| `toastOptions` | `object` | – | 모든 토스트에 적용할 기본 옵션입니다(아래 `toast()` 옵션 중 하나). |
| `gap` | `number` | `14` | 토스트가 펼쳐졌을 때 토스트 사이의 간격입니다. |
| `icons` | `object` | – | 기본 아이콘을 교체합니다: `{ success, info, warning, error, loading }`. 특정 아이콘에 `null`을 지정하면 제거합니다. |

## `toast()` 옵션

`toast(message, options)` — 메시지는 문자열, JSX 또는 JSX를 반환하는 함수입니다. 토스트의 ID를 반환합니다.

| Option | Type | Default | 설명 |
| --- | --- | --- | --- |
| `description` | `ReactNode` | – | 제목 아래에 표시합니다. JSX를 반환하는 함수도 받을 수 있습니다. |
| `closeButton` | `boolean` | `false` | 닫기 버튼을 추가합니다. |
| `invert` | `boolean` | `false` | 밝은 테마에서는 어두운 토스트를, 어두운 테마에서는 밝은 토스트를 표시합니다. |
| `duration` | `number` | `4000` | 자동으로 닫히기 전까지의 시간(밀리초)입니다. `Infinity`이면 계속 표시합니다. |
| `position` | `string` | `'bottom-right'` | 이 토스트를 표시할 위치입니다. |
| `dismissible` | `boolean` | `true` | `false`이면 사용자가 토스트를 닫을 수 없습니다. |
| `icon` | `ReactNode` | – | 텍스트 앞에 표시할 아이콘입니다. `null`이면 기본 아이콘을 제거합니다. |
| `action` | `ReactNode \| { label, onClick }` | – | 기본 버튼입니다. 클릭하면 토스트를 닫습니다. `onClick`에서 `event.preventDefault()`를 호출하면 닫히지 않습니다. |
| `cancel` | `ReactNode \| { label, onClick }` | – | 보조 버튼입니다. 클릭하면 토스트를 닫습니다. |
| `actionButtonStyle` | `object` | `{}` | 기본 버튼에 적용할 스타일입니다. |
| `cancelButtonStyle` | `object` | `{}` | 취소 버튼에 적용할 스타일입니다. |
| `id` | `string` | – | 사용자 지정 ID입니다. 같은 ID로 `toast()`를 다시 호출하면 기존 토스트가 갱신됩니다. |
| `testId` | `string` | – | e2e 테스트용 `data-testid`로 렌더링됩니다. |
| `toasterId` | `string` | – | 이 토스트를 표시할 Toaster의 ID입니다. |
| `style` | `object` | – | 토스트에 적용할 인라인 스타일입니다. |
| `classNames` | `object` | – | 각 부분에 적용할 클래스입니다: `{ toast, title, description, actionButton, cancelButton, closeButton }`. `unstyled`가 아니면 `!important`가 필요합니다. |
| `unstyled` | `boolean` | `false` | 기본 스타일을 모두 제거합니다. |
| `onDismiss` | `(toast) => void` | – | 닫기 버튼을 클릭하거나 토스트를 스와이프해 닫을 때 실행됩니다. |
| `onAutoClose` | `(toast) => void` | – | `duration`이 지난 뒤 토스트가 자동으로 닫힐 때 실행됩니다. |
| `containerAriaLabel` | `string` | `'Notifications'` | 토스트 컨테이너의 ARIA 레이블입니다. |

## 함수

| Function | 목적 |
| --- | --- |
| `toast(message, opts?)` | 토스트를 표시하고 ID를 반환합니다. |
| `toast.success / .error / .info / .warning(message, opts?)` | 해당 아이콘이 포함된 유형별 토스트를 표시합니다. |
| `toast.loading(message, opts?)` | 스피너가 있는 토스트를 표시합니다. ID를 사용해 갱신할 수 있습니다. |
| `toast.promise(promise, { loading, success, error })` | promise의 진행 상태를 보여 주는 토스트입니다. `success` / `error`에는 문자열, JSX, 결과를 받는 함수, 토스트 옵션 객체를 전달할 수 있습니다. |
| `toast.custom((t) => jsx, opts?)` | headless 토스트입니다. JSX는 직접 제공하고 동작은 Sonner가 처리합니다. |
| `toast.dismiss(id?)` | 특정 토스트를 닫습니다. ID 없이 호출하면 모두 닫습니다. |
| `toast.getActiveToasts()` | React 외부에서도 사용할 수 있는 활성 토스트 목록을 반환합니다. |
| `useSonner()` | `{ toasts }`를 반환하는 React 훅입니다. |
