# 테마와 런타임 선택기

사용자가 전환 가능한 테마나 폰트를 요청하거나, 팔레트 이름을 지정한 경우에만 사용하세요. 테마는 밝음/어두움 쌍이 아니라 하나로 고정된 팔레트입니다. 선택기가 독자의 밝음/어두움 제어 역할을 하므로, 테마 값은 `prefers-color-scheme`에 넣지 마세요.

## 팔레트

열은 토큰에 대응합니다. 텍스트 토큰은 이미 4.5:1에 도달합니다. `-dim` 변형은 같은 hex에 약 12% 알파(`#rrggbb1f`)를 준 것입니다. `--border`는 어두운 테마에서 `rgba(255,255,255,.08)`, 밝은 테마에서 `rgba(0,0,0,.08)`입니다. `--border-bright`는 `--text-dim` 값을 씁니다. `--node-a/b/c`는 텍스트가 아니라 채우기, 선, 칩 마커용입니다.

| id | mode | --bg | --surface | --text | --text-dim | --accent | --node-a | --node-b | --node-c | --ok | --warn | --risk | --info |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| dracula | dark | #282a36 | #44475a | #f8f8f2 | #adb6d0 | #caa8fa | #8be9fd | #50fa7b | #ff79c6 | #50fa7b | #ffb86c | #ff9b9b | #8be9fd |
| nord | dark | #2e3440 | #3b4252 | #eceff4 | #a9aeb7 | #88c0d0 | #88c0d0 | #a3be8c | #b48ead | #a3be8c | #daa08e | #d89fa4 | #88c0d0 |
| one-dark | dark | #282c34 | #2c313a | #abb2bf | #9398a1 | #61afef | #61afef | #98c379 | #c678dd | #98c379 | #e5c07b | #e37981 | #61afef |
| catppuccin-mocha | dark | #1e1e2e | #313244 | #cdd6f4 | #989baa | #cba6f7 | #89b4fa | #a6e3a1 | #f5c2e7 | #a6e3a1 | #fab387 | #f38ba8 | #89b4fa |
| tokyo-night | dark | #1a1b26 | #24283b | #a9b1d6 | #898fac | #7aa2f7 | #7aa2f7 | #9ece6a | #bb9af7 | #9ece6a | #ff9e64 | #f7768e | #7aa2f7 |
| gruvbox-dark | dark | #282828 | #3c3836 | #ebdbb2 | #afa18e | #fe8019 | #83a598 | #b8bb26 | #d3869b | #b8bb26 | #fe8019 | #fc7c6d | #88a99c |
| synthwave-84 | dark | #262335 | #241b2f | #ffffff | #848bbd | #ff7edb | #36f9f6 | #72f1b8 | #fede5d | #72f1b8 | #ff8b39 | #fe4652 | #36f9f6 |
| solarized-light | light | #fdf6e3 | #eee8d5 | #526970 | #526970 | #00629b | #00629b | #859900 | #d33682 | #606e00 | #b54314 | #c42d2a | #00629b |
| github-light | light | #ffffff | #f6f8fa | #1f2328 | #656d76 | #0969da | #0969da | #1a7f37 | #8250df | #1a7f37 | #bc4c00 | #cf222e | #0969da |
| catppuccin-latte | light | #eff1f5 | #ccd0da | #4c4f69 | #54565f | #7230c9 | #1e66f5 | #40a02b | #ea76cb | #29661c | #983c07 | #b30d30 | #1851c2 |
| gruvbox-light | light | #fbf1c7 | #ebdbb2 | #3c3836 | #6b5f56 | #ad3903 | #076678 | #79740e | #8f3f71 | #67630c | #ad3903 | #9d0006 | #076678 |

폰트 조합(id → 본문 / 고정폭): `dm` DM Sans / Fira Code · `instrument` Instrument Sans / JetBrains Mono · `plex` IBM Plex Sans / IBM Plex Mono · `bricolage` Bricolage Grotesque / JetBrains Mono · `jakarta` Plus Jakarta Sans / Azeret Mono. 모두 Google Fonts 링크 하나에 담아 로드하세요. 제목용 디스플레이 서체는 `--font-display`에 머무르며, 선택기와 함께 바뀌지 않습니다.

## 선택기 계약

- 오른쪽 위에 고정된 막대 하나: 테마 점(채우기 `--surface`, 링 `--accent`), 구분선, 그리고 각자 고유한 글꼴로 표시되는 `Aa` 폰트 칩. 모든 컨트롤은 `aria-pressed`를 쓰며, 활성 링은 흰색이 아니라 `var(--text)`입니다. 인쇄에서는 막대를 숨기세요.
- 점과 칩은 손으로 만들지 말고 `THEMES` / `FONT_PAIRS` 데이터에서 생성하세요.
- 기본 테마와 폰트는 `:root`에 평범한 CSS로 두어, JS 없이도 페이지가 렌더링되게 하세요.
- `applyTheme(id)`는 위의 모든 열을 `root.style.setProperty`로 설정합니다. `applyFont(id)`는 `--font-body`와 `--font-mono`를 설정합니다. 둘 다 `aria-pressed`를 갱신한 뒤, 색을 굳혀 넣었거나 텍스트 크기를 측정한 것(예: canvas 차트)을 다시 그립니다.
- 규칙은 폰트를 `var(--font-body)`와 `var(--font-mono)`를 통해서만 읽습니다.

## 프로젝트 기본값

`visual-explainer.config.md`에서 `theme:`와 `font:`를 위의 id로 설정할 수 있습니다. Claude Code에서는 `.claude/visual-explainer.local.md`가 개인 취향을 위해 이를 덮어씁니다. 둘 다 기본값만 정하며, 알 수 없는 값은 페이지 자체의 선택으로 대체됩니다.
