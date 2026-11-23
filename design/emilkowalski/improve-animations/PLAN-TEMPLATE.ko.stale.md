# 계획 템플릿

`improve-animations`에서 작성하는 모든 계획은 이 구조를 따릅니다. 실행자는 맥락도 취향도 없는 낮은 성능의 모델일 수 있으므로, 계획만 보고도 모든 작업을 정확히 수행할 수 있어야 합니다. “위 감사에서 논의한 이징”이라고 적지 않습니다.

```markdown
# NNN — <Short imperative title>

- **Status**: TODO
- **Commit**: <output of `git rev-parse --short HEAD` when this plan was written>
- **Severity**: HIGH | MEDIUM | LOW
- **Category**: <audit category>
- **Estimated scope**: <n files, rough size>

## Problem

What is wrong, where, and why it matters to how the product feels. Cite every
location as `path/to/file.tsx:123` and include the current code verbatim:

​```css
/* src/components/dropdown.css:14 — current */
.dropdown { transition: all 400ms ease-in; }
​```

## Target

The exact end state. Every value spelled out — curves, durations, spring
configs, media queries. Never "use a nicer easing":

​```css
/* target */
.dropdown {
  transition: transform 200ms var(--ease-out), opacity 200ms var(--ease-out);
  transform-origin: var(--transform-origin);
}
​```

## Repo conventions to follow

How this codebase already does it, with one exemplar the executor should
imitate (token names, file placement, prop patterns):

- Easing tokens live in `src/styles/tokens.css`; add new curves there, e.g. `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);`
- <exemplar file:line that already does this correctly>

## Steps

1. <One concrete edit per step: file, what changes, resulting code.>
2. …

## Boundaries

- Do NOT touch <files/components out of scope>.
- Do NOT change markup/structure — motion properties only (unless a step says otherwise).
- Do NOT add new dependencies.
- If a step doesn't match the code you find (drift since the commit stamp), STOP and report instead of improvising.

## Verification

- **Mechanical**: <exact commands — typecheck, lint, build — with expected outcome>.
- **Feel check**: run the UI, trigger <interaction>, and confirm:
  - <observable check, e.g. "the dropdown scales from its trigger, not from center">
  - <e.g. "spamming the toggle never restarts the animation from zero">
  - In DevTools, set playback to 10% (Animations panel) and confirm <detail>.
  - Toggle `prefers-reduced-motion` (Rendering panel) and confirm movement is dropped but opacity feedback remains.
- **Done when**: <machine- or eye-checkable completion criteria>.
```


## 계획 작성자를 위한 참고 사항

- 발견 사항마다 계획 하나를 작성합니다. 두 발견이 같은 파일에서 같은 수정 패턴을 요구한다면(예: 여러 컴포넌트의 이징 토큰을 같은 방식으로 바꾸기) 하나로 합칠 수 있습니다.
- 모든 값을 [AUDIT.md](AUDIT.md)에서 가져옵니다. 기억에 의존해 어림잡지 않습니다.
- 느낌 확인은 필수입니다. 움직임은 코드상 정확해도 느낌이 좋지 않을 수 있습니다. 실행자나 변경 diff를 검토하는 사람에게 느린 재생이나 프레임 단위 확인 중 무엇을 볼지 구체적으로 알려 줍니다.
- 계획을 작성한 뒤 `plans/README.md`를 만들거나 갱신합니다. 계획 표(번호, 제목, 심각도, 상태), 권장 실행 순서, 계획 사이의 의존성을 포함합니다.
