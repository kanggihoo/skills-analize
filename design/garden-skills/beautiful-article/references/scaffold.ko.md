# 스캐폴딩

스캐폴딩은 Phase 4에서 글 작업 공간을 만듭니다. **프로젝트 코드를 SKILL.md에 넣지 않습니다.** 프로젝트 템플릿은 Skill 에셋(`assets/scaffold-template/`)이며 `scripts/scaffold.sh`가 복사하고 연결합니다.

## 사용법

```bash
bash <path-to-beautiful-article>/scripts/scaffold.sh ./my-article --theme=tufte
bash <path-to-beautiful-article>/scripts/scaffold.sh ./brief --theme=press --no-cover
bash <path-to-beautiful-article>/scripts/scaffold.sh --list-themes
```


`--theme`에는 `theme-profiles/index.json`에 있는 id를 지정해야 합니다(현재 `tufte` / `press` / …). reacticle 저장소 안일 필요 없이 **어떤 디렉터리**에든 작업 공간을 만들 수 있습니다.

`--no-cover`는 책 표지형 글 표지를 비활성화합니다(기본값: 켜기 · 화면에서 3:4 / PDF 첫 페이지 단독 사용). Checkpoint 1에서 사용자가 “표지 · 끄기”를 선택하면 이 옵션을 전달합니다. 자세한 내용은 `references/cover.md`를 참고하세요.

## 스캐폴딩의 작업

- 작업 공간 디렉터리를 만들고 Vite / React / TS 템플릿을 복사합니다.
- npm에서 최신 배포판 `reacticle`을 설치합니다. `package.json`에는 `reacticle: "latest"`를 넣고 의존성 설치 후 `npm install reacticle@latest`를 실행해 최신 버전으로 갱신한 뒤 실제 버전을 출력합니다.
- `article/main.tsx`에 선택된 runtime theme id를 기록하고 `import "reacticle/styles.css"`를 추가합니다.
- 기본 `article/Article.tsx`와 `article/sections/`, `article/raw-blocks/`, `article/assets/`를 만듭니다. `Article.tsx` 끝에는 기본 **colophon Raw 블록**(`Made with
  [beautiful-article](github 仓库) · <主题> theme`)이 포함됩니다. 대비가 낮은 작은 글씨로 스타일링하고 `--ra-*` 토큰을 사용합니다. **삭제하면 안 됩니다**(SKILL.md의 “기본 정책” 참고).
- 기본으로 **`article/Cover.tsx`**를 만들고(책 표지형 프레임 + 자리표시자: 화면 3:4 / PDF 첫 페이지 단독 사용) `main.tsx`에서 `<ArticleDoc />` 위에 `<Cover />`를 렌더링합니다. `--no-cover` 옵션을 주면 건너뜁니다. Cover.tsx를 복사하지 않고 `main.tsx`에서 `__COVER_IMPORT_*__` / `__COVER_RENDER_*__` 마커로 감싼 두 구간을 제거합니다. 표지 디자인은 `references/cover.md`를 참고합니다.
- 작업 메모리 디렉터리 `source/`, `plan/`, `review/`를 만듭니다.
- `katex` / `prismjs`는 `reacticle` 의존성으로 자동 포함되므로 작업 공간에서 따로 선언할 필요가 없습니다.

## 컴포넌트 라이브러리 업그레이드

작업 공간은 언제든 최신 컴포넌트 라이브러리로 업그레이드할 수 있습니다.

```bash
npm install reacticle@latest
```


## 작업 공간 구조

```text
my-article/
  package.json  vite.config.ts  tsconfig.json  tsconfig.node.json  index.html
  source/   plan/   review/
  article/
    main.tsx        # 入口：<ThemeProvider theme="..."> + <Cover/> + <ArticleDoc/>
    Cover.tsx       # 书封式文章封面：屏幕 3:4 / PDF 独占首页（默认；--no-cover 时不生成）
    Article.tsx     # assembler（主 Agent 拥有）：import + 排序各 Section，不写 Section 正文
    sections/       # 一节一文件（铁律）：NN-*.tsx，每个导出一个 Section 组件
      01-opening.tsx
    raw-blocks/     # 大型 Raw 隔离：NN-*.tsx
    assets/         # 配图素材
  .theme            # 记录起步主题
```


> **Section 하나는 파일 하나에 둡니다**(`sections/NN-*.tsx`). `Article.tsx`에 여러 Section을 작성하지 않습니다. `Article.tsx`는 조립만 담당합니다. 이 원칙은 다중 Agent 병렬 개발(Checkpoint 2에서 모드를 선택)의 전제입니다. 자세한 내용은 `references/section-build.md`를 참고하세요.

## 테마 변경

두 곳을 수정합니다(스캐폴딩은 기본 테마 이름을 두 곳에 모두 삽입합니다).

1. `article/main.tsx`의 `<ThemeProvider theme="...">`(실행 중 사용할 테마).
2. `article/Article.tsx` 끝에 있는 colophon의 `· <테마> theme`(표시될 테마 이름).

두 값이 일치해야 합니다. `html-output.md`를 참고하세요.

## 빌드 / 미리보기

`references/html-output.md`를 참고하세요(`npm run dev` / `build` / `html`).
