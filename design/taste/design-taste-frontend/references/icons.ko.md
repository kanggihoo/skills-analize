# Icons

페이지가 도구 이름을 언급하면 그 도구의 실제 로고를 자기 색으로 보여 준다. Google Docs라고 쓰인 파일 카드에는 Google Docs 아이콘을, Word 파일에는 Word 파일 아이콘을 단다. 실제 아이콘이 있는데 비슷하게 그리거나, 원 안에 글자를 넣거나, 일반 페이지 글리프를 쓰지 않는다. 가상의 클라이언트의 마크는 디자인해서 만들고, 남의 마크를 빌려 쓰지 않는다.

`scripts/icons.mjs`가 유일한 resolver다. 페이지, `diagram.js`, 그 밖의 모든 파트는 이 스크립트가 쓴 SVG 파일을 읽는다. 런타임에 아이콘을 가져오거나, 색을 입히거나, 판단하지 않으며, 어떤 페이지도 아이콘을 위해 CDN을 호출하지 않는다.

## Where they come from

| set | source (pinned) | holds | drawings licence |
|---|---|---|---|
| `logos` | `cdn.jsdelivr.net/gh/gilbarbara/logos` at commit `d6960edc1b73` (26 Oct 2026; the repository has no tags) | 약 1,500개 브랜드의 full colour. 첫 번째 선택 | CC0 (커밋의 LICENSE.txt) |
| `si` | `simple-icons` 16.30.0 | 브랜드 hex로 칠한 단색 마크. 컬러 마크가 없는 경우에만 쓰는 fallback | CC0 |
| `file` | `@iconify-json/vscode-icons` 1.2.30 | 컬러 파일 타입(pdf, markdown, zip, Word, Excel, PowerPoint). 문서 타입이며, 브랜드가 아님 | MIT |
| `ui` | `@iconify-json/lucide` 1.2.100 | 인터페이스 글리프, 한 가지 선 세트 | ISC |

`si`는 Google Docs, Sheets, Slides, Forms, Chat, Tasks, Calendly, Evernote, QuickBooks, Revolut과 콘솔 및 게임 스토어 마크(PlayStation, Epic Games, Riot, Battle.net, itch.io, Roblox, EA, Ubisoft, Rockstar, Valve, CurseForge, Modrinth, GOG)에 쓴다. Xbox와 Nintendo는 허용된 세트 어디에도 없으므로, 콘솔은 글자로 이름만 쓰고 그린 마크는 쓰지 않는다. 게임의 스토어 행은 Steam, PlayStation, Epic Games다(`apps --tag gaming`). Google 편집기 마크는 브랜드 색인 파랑, 초록, 노랑으로 쓴다. Microsoft Office 마크는 허용된 어떤 출처에도 없으므로, Word, Excel, PowerPoint 파일 카드는 파일 타입 아이콘(`docx`, `xlsx`, `pptx`)을 쓴다.

**theSVG (the `brands` set) was dropped.** 이 패키지는 MIT지만, 그 라이선스는 컴필레이션에만 적용된다. 마크별로 기록된 라이선스는 소유자가 준 허가가 아니라 패키지 작성자가 붙인 라벨이며, 그중 Microsoft 마크 37개에는 "no express redistribution licence supplied"라고 적혀 있다. 프레스 키트 다운로드는 이 스킬이 택하는 경로가 아니다. `brands:` id는 이제 그 이유를 말하는 메시지와 함께 실패한다.

모든 마크는 여전히 각 소유자의 상표다. 명목적 사용(nominative use)만 허용한다. 페이지가 실제로 연동하는 도구의 이름만 쓰며, 보증을 암시하지 않는다. footer에는 "Product names and logos are trademarks of their owners"를 넣고, 사이트에는 `icons-credits.json`(file, set, commit이 포함된 source, licence, 상표 여부, 브랜드 사이트)을 둔다.

## Commands

사이트 루트에서 `node <skill>/scripts/icons.mjs ...`로 실행한다.

- `find google docs`: 모든 세트에서 일치하는 항목과 라이선스를 보여 준다.
- `apps --tag gaming`: 큐레이션된 목록으로, 짧은 이름(`google-docs`, `steam`, `pdf`)으로 된 458개 앱과 38개 파일 타입을 보여 준다. `list --tags`는 태그를 보여 준다(dev, ai, gaming, engine, hardware, chips, cloud, db, monitoring, payments, social ...). 인터페이스 글리프는 `list --set ui --tag gaming`으로 본다(435개: gamepad-2, swords, microchip, circuit-board ...).
- `fetch google-docs slack file:pdf2 ui:arrow-right --out assets/icons`: 파일을 쓰고, 붙여 넣을 태그를 출력한다.
- `scan index.html --out assets/icons`: 페이지가 이름으로 언급하는 모든 아이콘을 가져온다(diagram spec, `data-diagram` preset 이름, `data-icon`). 마지막에 실행해서 완성된 페이지에 빠진 아이콘이 없게 한다.
- `check`: 모든 항목이 resolve되는지 확인하고, 워드마크, 단색 fallback, 검은 마크와 violet 마크를 나열한다.
- `measure`: 유지보수용. headless Chrome에서 모든 컬러 마크가 그려지는 박스를 측정해(CPU flag 사용, 자기 PID로 닫는다) `index.json`의 `boxes`에 쓴다. `fetch`는 이 박스에 맞춰 자른다. 큐레이션 목록이 바뀌면 실행한다(`--profile <dir>`로 Chrome 프로필을 지정한다).
- 코드에서 사용할 때: `import { resolveIcon } from './icons.mjs'`.

쓰인 각 파일에는 결정이 기록된다. 루트에 `data-ic="violet"`, `"ink"`, `"paper"`가 붙으므로, `diagram.js`와 모든 페이지는 `icons.mjs`가 출력한 그대로 처리한다.

## Which one

- 브랜드나 파일 타입이면 컬러 아이콘을 쓴다. 큐레이션 목록(`logos`)을 먼저 보고, 목록이 허용할 때만 `si` 마크를 쓴다.
- 인터페이스 글리프(검색, 화살표, 체크, 기능 포인트)는 `ui:`만 쓴다. 두 번째 선 세트는 쓰지 않는다. 글리프는 인라인 svg이며 텍스트 색을 따른다.
- 고객 로고가 늘어선 줄, footer의 소셜 링크, 브랜드에 컬러 버전이 없는 곳에는 one-colour(`--mono`)가 더 낫다. 여러 톤의 마크는 세부를 한 색으로 유지한다. 종이색 부분은 실루엣에서 잘라 내며, 단색으로 꽉 채우지 않는다.
- 검은 마크(GitHub, Apple, X)에는 `ic-ink`를 붙인다. icon.css가 어두운 ground에서 이를 흰색으로 바꾼다. 워드마크만 있는 로고(Stripe, NVIDIA, Go)에는 `ic-wide`를 붙이고, `--tile`로 출력해 넓은 타일을 받게 한다.
- 밝은 타일 위에서 사라지는 밝은 마크는 목록에 넣지 않는다(Wise, Klarna는 이 이유로 뺐다).

### The violet rule (a judgement, stated)

"Never violet or lavender"는 페이지 자체의 디자인에 대한 규칙이다. 제3자 로고는 소유자의 마크이므로 색을 바꾸지 않는다. 다만 violet 블록은 팔레트를 깨뜨린다. 채워진 색 중 violet이 차지하는 비율(`check`가 출력한다. 짙은 네이비는 violet이 아니다)로 판단한다.

- 절반 이상(Stripe, Twitch, Google Forms, Terraform, Datadog, ClickUp, Loom, Kotlin, C#, .NET, Bootstrap, ESLint ...): `[violet]`로 표시한다. 제품이 실제로 연동하는 도구는 자기 색을 유지한다. `--colour`를 붙여 `fetch` 또는 `scan`한다(없으면 마크는 텍스트 색으로 출력되며, 알려진 로고를 회색으로 대신하는 것은 결함이다). violet 금지는 페이지의 팔레트에 적용되며 제3자 로고에는 적용되지 않는다. `--mono`는 고객 로고 줄에만 쓴다.
- 절반 미만(Figma 20%, Google Drive 14%): 그린 대로 출력한다. 실제 로고가 페이지를 공식적으로 보이게 한다. `--mono`를 주면 한 색으로 출력한다.

## How they sit

`assets/icons/icon.css`를 system.css 뒤에 링크한다. `.ic-tile`은 로고 뒤의 부드러운 타일이다(어두운 ground 위에서는 밝은 타일이라 모든 색이 읽힌다). `.ic-row`는 목록 행, `.ic-chip`은 아이콘이 붙은 이름, `.ic-stack`은 겹쳐진 타일, `.ic-grid--mosaic`와 `.ic-cell`은 통합 그리드, `.ic-file`과 `.ic-file--tile`은 파일 카드, `.ic-point`는 짧은 텍스트가 붙은 글리프다. 크기는 16, 20, 24, 28, 32, 36, 40, 48, 56이다. 아무것도 애니메이션하지 않는다. `assets/icons/demo.html`에는 모자이크, 파일 카드, 종류별 458개 도구 전체, 어두운 페이지, 글리프가 있다(모든 아이콘은 `assets/icons/demo/`에 있다).

Shape: `fetch`는 마크를 측정된 드로잉(2% 여백)에 맞춰 자르고, 잘린 비율에 따라 shape 클래스를 붙인다. `ic-wide`(1.8:1 초과), `ic-land`(1.25:1 초과), `ic-tall`(0.8:1 미만: Google Docs, Figma). 타일은 가로로 긴 마크를 너비의 70%로, 세로로 긴 마크를 높이의 68%로 맞춘다. `file` 세트는 의도적으로 자르지 않는다.

파일 카드, 통합 그리드, "reads from" 목록에는 회색 상자가 아니라 20~40px의 실제 아이콘을 쓴다. 로고는 자기 비율과 색을 유지한다.
