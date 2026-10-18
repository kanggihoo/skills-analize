# dsh-client-ui-ux 분석

컬렉션: deepseek-harness / 분석 대상: 스킬 1개 (`dsh-client-ui-ux`)
인용 표기: `SKILL.md:N` 은 SKILL.md의 줄 번호(frontmatter 포함, 1부터).

## 1. 개요

### 1-1. 경로와 읽은 파일 목록
- 원본 경로: `/Users/kkh/Desktop/skills-analize/deepseek-harness/dsh-client-ui-ux/`
- 디렉터리 전수 조사 결과(`find . -type f`): 파일은 1개뿐이다.

| 파일 | 크기 | 줄 수 | 역할 |
|---|---|---|---|
| `SKILL.md` | 7,776 bytes | 62줄 | 유일한 파일. frontmatter + 본문 9개 H2 섹션 |
| `references/` | 없음 | - | 디렉터리 자체가 존재하지 않음 |
| `scripts/` | 없음 | - | 실행 스크립트 없음 |
| `templates/` | 없음 | - | 출력 템플릿 없음 |
| `assets/` | 없음 | - | 없음 |

- 보조 파일 목록: 원문에 명시 없음(보조 파일이 없다). 대신 SKILL.md 가 외부 문서를 링크로 위임한다(아래 1-3).
- 형제 디렉터리(같은 컬렉션)에는 `dsh-prose-standard`, `dsh-code-review`, `dsh-doc` 등이 존재한다(`ls ..` 결과). 본 분석은 이들의 내용을 읽지 않았고 판단 근거로 쓰지 않는다.

### 1-2. 본문 구조 (섹션 지도)
| H2 섹션 | 줄 범위 | 항목 수(불릿) |
|---|---|---|
| (서문 단락) | 8 | - |
| Visual foundation | 10-16 | 5 |
| Reuse before adding | 18-23 | 4 |
| Feedback surfaces | 25-32 | 4 (+ 도입 1문장) |
| Loading states | 34-38 | 3 |
| Overlays and menus | 40-48 | 3 (+ 도입 1문장, 스크롤바 단락 1) |
| Platform window adaptation | 50-53 | 2 |
| Spacing review | 55-58 | 2 |
| Design review escalation | 60-62 | 1 |

### 1-3. 외부로 위임하는 참조 (파일은 이 디렉터리 밖)
SKILL.md:8 이 링크로 지목하는 대상 4개. 이 분석에서는 존재 여부·내용을 확인하지 않았다(범위 밖).
- `../dsh-prose-standard/SKILL.md` — 카피 품질
- `../../notes/implemented/architecture/2026-08-23-locale-owned-client-ui-copy.md` — 로케일 소유 결정
- `../../../docs/web-styling.md` — 스타일링 소유권·토큰 규칙
- `../../../packages/client/ui-primitives/README.md#component-catalog` — 컴포넌트 카탈로그

### 1-4. 성격 한 줄
**감사(audit) + 계획(planning)의 혼합형 판단 가이드.** "추가·변경 시 지침"과 "PR 리뷰 시 지침"을 겸한다. 실행 가능한 단계 절차는 없고, 판단 기준 목록이다. 생성(construction) 스킬도 아니고 자동 검증(verification) 스킬도 아니다(스크립트·명령 없음).

### 1-5. 원문 자기 규정
> This skill is guidance, not a complete checklist. It covers judgment calls that lint, typecheck, and the i18n gate cannot make: where feedback appears, what gets reused, and how surfaces behave at window edges and across platforms. (`SKILL.md:8`)

번역: 이 스킬은 완전한 체크리스트가 아니라 가이드다. lint, typecheck, i18n 게이트가 판단할 수 없는 영역(피드백이 어디에 뜨는가, 무엇을 재사용하는가, 창 가장자리·플랫폼별 동작)을 다룬다.

> this skill adds judgment on top of those rules, not a second copy of them. (`SKILL.md:8`)

번역: 기존 규칙 위에 판단을 얹을 뿐 두 번째 사본이 아니다. 즉 토큰·스타일링 규칙의 정본은 이 파일이 아니다.

## 2. 활성화 조건 (언제 켜지는가)

### 2-1. frontmatter `description` 전문
> Design and review DeepSeek Harness client UI changes — visual token discipline, reuse-before-adding, feedback surfaces (toast vs in-place notice vs empty state), overlay and menu safety, platform window adaptation, loading states, and error copy placement. Use when adding or changing product-user-visible GUI behavior in packages/client, or when reviewing such a PR. (`SKILL.md:3`)

번역: DeepSeek Harness 클라이언트 UI 변경을 설계·리뷰한다. (토큰 규율, 추가 전 재사용, 피드백 표면, 오버레이·메뉴 안전, 플랫폼 창 적응, 로딩 상태, 오류 카피 배치). `packages/client` 에서 제품 사용자에게 보이는 GUI 동작을 추가·변경할 때, 또는 그런 PR을 리뷰할 때 사용.

### 2-2. 트리거 구조 분해
| 조건 | 원문 표현 | 의미 |
|---|---|---|
| 대상 위치 | `in packages/client` | 클라이언트 패키지 한정 |
| 변경 성격 | `product-user-visible GUI behavior` | 제품 사용자에게 보이는 GUI 동작 |
| 행위 | `adding or changing` / `reviewing such a PR` | 작성과 리뷰 둘 다 |

### 2-3. 매칭되는 사용자 발화 예시 (description 키워드로부터 추출, 8개)
1. "packages/client 에 새 설정 페이지를 추가해줘" (adding … GUI behavior)
2. "삭제 실패했을 때 토스트로 알려주는 거 맞아? 이 PR 리뷰해줘" (feedback surfaces, reviewing such a PR)
3. "사이드바에 새 탭 추가하는데 어떻게 붙여야 해?" (sidebar slot, `SKILL.md:22`)
4. "이 드롭다운 메뉴가 창 가장자리에서 잘려" (overlay and menu safety)
5. "macOS 타이틀바 때문에 페이지 헤더가 겹쳐" (platform window adaptation)
6. "목록 로딩 중 스피너 위치가 어색해" (loading states)
7. "에러 문구가 너무 길어, 어디에 띄워야 해?" (error copy placement)
8. "다크 모드에서 이 텍스트 색이 안 보여" (visual token discipline)

위 발화는 description의 키워드에서 뽑은 예시이며, 실제 사용자 로그가 아니다. 원문에 발화 예시 목록은 명시 없음.

### 2-4. 의도적으로 배제되는 발화와 위임 대상
- 라우팅 규칙으로 박힌 것은 1건뿐이다: 카피 품질은 다른 스킬로 넘긴다.
  > Copy quality itself follows [dsh-prose-standard](../dsh-prose-standard/SKILL.md) (`SKILL.md:8`)
  - 즉 "문구가 자연스러운가/문체" 류 요청 → `dsh-prose-standard`.
- 로케일 소유(어느 로케일이 카피를 소유하는가)는 스킬이 아니라 결정 노트로 위임: `locale-owned-client-ui-copy` 노트 (`SKILL.md:8`).
- 스타일링 소유권·토큰 규칙은 `docs/web-styling.md` 로 위임 (`SKILL.md:8`).
- description 에 명시된 제외 문구("Do not use when…")는 원문에 명시 없음. 배제는 "packages/client 밖", "제품 사용자에게 보이지 않는 변경"이라는 범위 한정에서만 암시된다(해석이 아니라 범위 조건의 반대).
- 그 외 형제 스킬(`dsh-code-review` 등)로 넘기라는 지시는 원문에 명시 없음.

### 2-5. 기타 frontmatter 필드
- 존재하는 필드: `name`(`dsh-client-ui-ux`), `description` 두 개뿐 (`SKILL.md:2-3`).
- `allowed-tools`, `model`, `metadata`, 기타: 없음. 도구 제한이 걸려 있지 않다.

## 3. 적합 / 부적합

### 3-1. 적합 (원문이 직접 가정하는 상황)
- 전체 페이지(full-page surface)를 신설할 때: "the Plugins page is the usual reference for full-page surfaces" (`SKILL.md:12`).
- 토스트, 메뉴, 메시지 내 아티팩트 프리뷰, 사이드바 탭 레이아웃, 색, 여백(clearance), 페이지 패딩 등 이미 확립된 컴포넌트가 있는 영역을 건드릴 때 (`SKILL.md:12`).
- 삭제처럼 요청한 패널·탭이 닫힐 수 있는 비동기 작업의 결과 알림을 설계할 때 (`SKILL.md:29`).
- 메뉴·팝오버·툴팁을 추가·변경할 때 (`SKILL.md:42`).
- macOS/Windows 창 크롬(window chrome)과 맞물리는 헤더나 페이지를 추가할 때 (`SKILL.md:52`).
- UI 변경이 큰 PR을 리뷰하면서 디자이너 리뷰가 필요한지 판단할 때 (`SKILL.md:62`).
- 아이콘을 추가하는 PR 리뷰 (`SKILL.md:21`).

### 3-2. 부적합 / 과함 (원문 범위 조건에서 도출되는 것만)
- `packages/client` 밖의 코드(서버, CLI 등): description 의 `in packages/client` 범위 밖.
- 제품 사용자에게 보이지 않는 변경(내부 리팩터링, 테스트 전용 코드): description 의 `product-user-visible` 조건 밖.
- 카피 문장 품질만 다듬는 일: 본문이 `dsh-prose-standard` 로 넘긴다 (`SKILL.md:8`).
- 토큰 값 자체의 정의·수정: `docs/web-styling.md` 와 ui-primitives 카탈로그가 정본 (`SKILL.md:8`).
- 프로토타입·핫픽스에서의 완화 규칙: 원문에 명시 없음. 스킬은 "before merge"(`SKILL.md:42`) 기준이며 예외 조항이 없다.

### 3-3. 형제 스킬 대신 이걸 고르는 판정 기준 한 줄
GUI의 "어디에 띄우고 무엇을 재사용하고 가장자리에서 어떻게 동작하는가"를 판단해야 하면 이 스킬, 문장 자체의 품질이면 `dsh-prose-standard`, 일반 PR 코드 리뷰이면 `dsh-code-review`(후자는 본 스킬 본문에 언급이 없고 이름이 형제 디렉터리에 존재한다는 사실만 확인됨).

## 4. 전제 조건과 외부 의존성

### 4-1. 실행 환경
| 항목 | 내용 |
|---|---|
| 실행 스크립트 | 없음 (`scripts/` 부재) |
| 런타임·패키지 | 원문에 명시 없음 |
| CLI 도구 (git, gh, docker, playwright 등) | 원문에 명시 없음 |
| API 키·환경변수·네트워크 | 불필요 |
| 비용 발생 지점 | 유료 API·CI 호출 지시 없음. 토큰 비용은 SKILL.md 7,776 bytes 로딩분 + 아래 링크 문서 읽기 |

### 4-2. 리포지토리 전제 (원문에서 읽히는 것)
- 모노레포 구조: `packages/client`, `packages/client/ui-primitives`, `docs/web-styling.md` (`SKILL.md:3,8`).
- 이미 존재하는 게이트: "lint, typecheck, and the i18n gate" (`SKILL.md:8`). 스킬이 이 게이트들을 전제로 하고 그 위에서 동작한다.
- 존재를 전제하는 UI 구성요소(명명 그대로):
  - 토큰: color, radius, spacing, theme typography variables (`SKILL.md:12,15`)
  - Toast 프리미티브, `shell.overlay` 엔트리, `RowActionToast` (`SKILL.md:29`)
  - Tooltip, HoverCard (`SKILL.md:23`)
  - Menu, Modal, overlay 프리미티브 (`SKILL.md:52`)
  - CSS 변수 `--dsh-frame-top-clearance` (`SKILL.md:52`)
  - 속성 셀렉터 `[data-platform='darwin']` (`SKILL.md:52`)
  - 공유 scrollbar 스타일 (`SKILL.md:48`)
  - 아이콘 라이브러리, 우측 사이드바 슬롯 (`SKILL.md:21-22`)
  - ui-theme 의 markdown typography 토큰 (`SKILL.md:14`)
- 테스트 러너·CI·린터·커밋 권한·브랜치 전략: 요구 서술은 원문에 명시 없음. 다만 "assert the override in the page's stylesheet spec" (`SKILL.md:52`)은 페이지별 stylesheet spec(스타일시트 테스트)이 있다는 전제다.
- 시각 검증 도구(스크린샷, 브라우저 자동화): 지시 없음. 라이트/다크, 가장자리 클리핑 등을 "어떻게" 확인하라는 방법은 원문에 명시 없음.

### 4-3. 상태 파일·산출물 디렉터리
- 스킬이 만드는 상태 파일(`plan.md`, `TODO`, `.claude/` 등): 없음. 원문에 명시 없음.
- 쓰기 지시가 있는 곳은 단 하나, 페이지 stylesheet spec에 platform override 단언을 추가하는 것(`SKILL.md:52`)과, 같은 스킬 내 명단을 갱신하는 것(`SKILL.md:62`, 아래 7절).

## 5. 워크플로우

이 스킬은 번호가 붙은 순차 절차가 아니다. 섹션 간 실행 순서 지시(`run in order`, `do not skip`)는 원문에 명시 없음. 아래는 원문 섹션 순서대로 "입력 → 행동 → 출력 → 통과 조건"으로 환산한 것이다. 환산은 구조화이며 새 규칙을 더한 것이 아니다.

### 5-0. 순서 강제 여부
- 순서 강제 문구: 없음.
- 유일한 필수 시점 표기: "Every menu, popover, and tooltip must be verified for all three before merge" (`SKILL.md:42`) — merge 전.
- 유일한 필수 결과 표기: "must get a designer or product review" (`SKILL.md:62`).
- 루프(재시도 상한, 수렴 조건): 원문에 명시 없음. 반복 구조 없음.

### 5-1. Visual foundation (`SKILL.md:10-16`) — 비게이트
| 단계 | 입력 | 행동 | 출력 | 통과 조건 |
|---|---|---|---|---|
| a. 토큰 탐색 | 변경 대상 페이지 | 리터럴 값 도입 전 대상 페이지와 가장 가까운 형제를 검색 | 기존 토큰/값 채택 | "adopt it" — 별도 판정 기준 없음 |
| b. 테마 검증 | 잉크/배경 쌍 | 라이트·다크 둘 다에서 가독성 확인 | 두 테마 모두 읽힘 | "must stay readable under both themes before it ships" |
| c. 굵기 | feature CSS | 600+ 금지 | 최대 500 | 숫자 상한 500 |
| d. 글자 크기 | 페이지 | 테마 변수 또는 페이지 기존 스케일에서 선택 | 소수의 크기 | 평행 콘텐츠는 한 크기 |
| e. 정렬·비례 | 요소들 | 기준선/수직 중심/공유 가장자리 중 하나에 정렬 | 비례 맞는 아이콘·텍스트 | 정렬 기준 없는 요소 금지 |

### 5-2. Reuse before adding (`SKILL.md:18-23`) — 부분 게이트
| 단계 | 행동 | 탈락 시 |
|---|---|---|
| 기존 컴포넌트 확장 | 새 요소 대신 메뉴 항목·prop 추가 | 병렬 요소를 만들었다면 반려 대상(원문은 "beats a parallel element"라고만 서술) |
| **[게이트] 새 아이콘** | 기존 라이브러리에서 의미상 가장 가까운 것 선택 | "a new glyph requires designer approval before it lands — when reviewing a PR that adds one, suggest requesting a designer review." |
| 사이드바 | 기존 사이드바에 slot 등록 | 별도 사이드바 금지. 모든 탭은 의미에 맞는 tab icon 선언 |
| 툴팁 | 의미 불명확한 아이콘-only 동작에 Tooltip, 포인터를 올려둬야 하거나 선택해야 하는 정보는 HoverCard | ad-hoc `title` 속성 대신 공유 프리미티브 |

### 5-3. Feedback surfaces (`SKILL.md:25-32`) — 결정 분기
도입 문장: "Choose the surface by the lifetime of the message relative to the surface that produced it" (`SKILL.md:27`).

```
메시지 발생
 ├─ 일시적 작업 결과(transient operation outcome)
 │    → 앱 전역 Toast  (success/failure만, pending 보고 금지)
 │    → 토스트 상태·렌더링은 shell.overlay 엔트리 등 "outlives the reporting surface" 호스트에
 │    → 실패 시에도 데이터는 유지(예: 삭제 실패 시 행 유지)
 └─ 표면 자체에 묶인 상태(surface-tied state)
      ├─ 쿼리 실패 + Retry, 폼 필드 검증 → in-place notice
      ├─ 데이터가 있는 패널 → 보존된 콘텐츠 옆의 compact notice
      └─ 비어 있는 패널 → 가운데 정렬 full error state
```

- 오류 카피 규칙은 5-3 말미에서 6절 표로 정리.
- 게이트 여부: 명시적 탈락 절차는 없고, "Never blank content to show an error for a transient operation" 위반 시 위반으로 간주된다(`SKILL.md:30`).

### 5-4. Loading states (`SKILL.md:34-38`) — 비게이트
| 대상 | 규칙 |
|---|---|
| 리스트 | 자체 skeleton 사용 |
| 그 외 페이지 단위 로드 | 가운데 정렬된 bare spinner |
| 금지 | 페이지 모서리에 spinner 배치 |
| 동시 영역 | 페이지/컴포넌트당 로딩 처리 방식 1개 |
| 텍스트 | 맥락이 필요할 때만; 좁은 사이드바는 거의 불필요 |

### 5-5. Overlays and menus (`SKILL.md:40-48`) — **게이트 (merge 전)**
> Every menu, popover, and tooltip must be verified for all three before merge (`SKILL.md:42`)

세 검증 항목(모두 통과해야 함, 하나라도 빠지면 탈락으로 읽힌다 — "all three"):
1. **Dismissable**: "outside click (and Escape where focusable) closes it."
2. **Viewport-fitting**: "it slides or flips to stay inside the window with an edge margin, and flips only into a side that actually fits (no oscillation when neither side fits)."
3. **Unclipped**: "it escapes `overflow` ancestors and containing blocks (portal to body where needed) and is never covered by neighbouring elements."

탈락 시 행동에 대한 구체 지시(수정 방법 외): 원문에 명시 없음. 해결 수단으로 "portal to body where needed"만 언급.

스크롤바 후속 규칙 (`SKILL.md:48`): 공유 scrollbar 스타일 사용, 컨테이너를 넘치지도 둥근 모서리에 잘리지도 않는지 검증, 가장자리에 붙이지 않고 작은 inset 유지.

### 5-6. Platform window adaptation (`SKILL.md:50-53`) — 부분 게이트
- 입력: 새 헤더 요소 또는 새 전체 페이지.
- 행동: macOS 타이틀바 clearance 는 `--dsh-frame-top-clearance` 를 사용(Menu, Modal, overlay 프리미티브가 top safe margin 으로 소비). 페이지 개별 보정은 `[data-platform='darwin']` 스코프 override 로.
- 출력: 페이지 자체 inset 에 대한 override + stylesheet spec 단언.
- 통과 조건: "assert the override in the page's stylesheet spec." 및 리뷰 시 "State the intended total offset (clearance + page inset)".
- 사람 개입: 리뷰어가 총 오프셋 합을 명시해야 함(`SKILL.md:53`).

### 5-7. Spacing review (`SKILL.md:55-58`) — 비게이트 점검
- "Review every changed region for gaps": 이웃과 의도 없이 맞닿으면 안 됨.
- "Prefer symmetry for parallel elements"; 설명 없는 일회성 간격은 "usually signals a missed shared value."

### 5-8. Design review escalation (`SKILL.md:60-62`) — **게이트 (사람 개입)**
> A PR with extensive UI changes, or any clearly user-perceivable change to UI or interaction, must get a designer or product review. (`SKILL.md:62`)

- 승인자가 없을 때 행동: "suggest requesting one from the design/product reviewers".
- 승인자 명단: yx zhang, yifffan, zhangziya, gaokaige (roster as of 2026-09).
- 갱신 의무: "update this list here when membership changes".
- "extensive"와 "clearly user-perceivable"의 경계 수치: 원문에 명시 없음.

### 5-9. 사람 개입 지점 요약
| 위치 | 개입 |
|---|---|
| `SKILL.md:21` | 새 아이콘 → 디자이너 승인 / 리뷰 요청 제안 |
| `SKILL.md:53` | 리뷰 시 총 오프셋 명시 |
| `SKILL.md:62` | 대규모·사용자 체감 UI 변경 → 디자이너/프로덕트 리뷰 |
질문 라운드(사용자에게 되묻기) 지시: 원문에 명시 없음.

## 6. 엔지니어링 규칙 분석

### 6-1. 금지 규칙 (anti-pattern) 전수
| # | 원문 | 줄 | 막으려는 실패 모드 |
|---|---|---|---|
| 1 | "Do not use 600+ for emphasis" | 14 | 임의 굵기 강조로 시각 위계 흐트러짐 |
| 2 | "never put a dimmed color on text without checking both" | 13 | 한쪽 테마에서 텍스트 가독성 붕괴 |
| 3 | "never invent a size for a single element" | 15 | 요소 단위 일회성 글자 크기의 난립 |
| 4 | "never ship an element that aligns to nothing or visibly outweighs its neighbours" | 16 | 정렬 축 없는 요소, 이웃을 압도하는 아이콘 |
| 5 | "instead of inventing a parallel one" | 12 | 토스트·메뉴 등 병렬 컴포넌트 증식 |
| 6 | 새 glyph 는 designer approval 없이 금지 | 21 | 아이콘 체계 오염 |
| 7 | "never a separate sidebar" | 22 | 사이드바 파편화 |
| 8 | ad-hoc `title` 속성 지양 ("Prefer these shared primitives over ad-hoc title attributes") | 23 | 일관성 없는 툴팁 |
| 9 | 토스트로 "do not report still-pending states" | 29 | 진행 중 상태 소음 |
| 10 | 패널이 직접 토스트 렌더링 금지 ("a toast rendered by the panel itself unmounts with that panel") | 29 | 패널·탭이 닫히면 알림이 같이 사라짐 |
| 11 | "Never blank content to show an error for a transient operation" | 30 | 일시적 오류로 데이터 화면이 비워짐 |
| 12 | 기술 명사·내부 jargon 금지 ("No internal jargon or technical nouns unless an error code must be exposed for debugging") | 32 | 사용자가 이해 못 하는 오류 문구 |
| 13 | 알림이 레이아웃을 깨면 안 됨 ("never shift neighbouring elements") | 32 | 알림 등장 시 레이아웃 시프트 |
| 14 | "Never place a spinner in a corner of the page" | 36 | 눈에 띄지 않는 로딩 표시 |
| 15 | 동시 영역이 각자 다른 로딩 스타일 금지 ("concurrent regions must not each flash their own style") | 37 | 로딩 스타일 난립·깜빡임 |
| 16 | 컴포넌트별 scrollbar 셀렉터 금지 ("use the shared scrollbar styles rather than component-specific selectors") | 48 | 스크롤바 스타일 중복 |
| 17 | 한 페이지를 위해 전역 변수 변경 금지 ("never change the global variable to fix one page") | 52 | 모든 Menu·Modal·overlay 에 파급 |
| 18 | 가장자리에 flush 금지 ("nothing sits flush against its neighbour without an intentional gap") | 57 | 맞닿은 요소 |
| 19 | 스크롤바를 컨테이너 가장자리에 flush 로 두지 말 것 ("keep a small inset") | 48 | 모서리 클리핑 |
| 20 | 양쪽 이웃 중 한쪽에만 맞는 크기 합의 금지(총합 합의 요구) ("agree on the sum, not just one addend") | 53 | 페이지 간 top spacing 불일치 |

### 6-2. 강제 규칙 (수치·임계값 표)
스킬 전체에서 숫자가 등장하는 곳은 다음이 전부다.

| 항목 | 값 | 원문 | 줄 |
|---|---|---|---|
| 최대 font-weight | 500 (600+ 금지) | "Font weight tops out at 500 in feature CSS you add or change." | 14 |
| 기준 행/상세 글자 크기 | 13px | "13px is the established row/detail size" | 15 |
| 중문 오류 문구의 마침표 생략 조건 | 문장 2개 이하 | "A Chinese notice of at most two sentences omits the trailing 句号（。）" | 32 |
| 오류 설명 길이 | 한 문장 선호, 2문장으로 설명 가능하면 문단화 금지 | "Prefer one clear sentence; anything explainable in two sentences must not grow into paragraphs." | 32 |
| 오버레이 검증 항목 수 | 3개 모두 | "verified for all three before merge" | 42 |
| 로딩 처리 방식 | 페이지/컴포넌트당 1개 | "One loading treatment per page/component" | 37 |
| 승인자 명단 시점 | 2026-09, 4명 | "roster as of 2026-09: yx zhang, yifffan, zhangziya, gaokaige" | 62 |

숫자가 없는 항목(원문이 수치를 주지 않음): 가장자리 margin 크기, scrollbar inset 크기, 허용되는 서로 다른 글자 크기 개수("small"), 아이콘 비례 비율, 색 대비 비율(WCAG 등). 모두 원문에 명시 없음.

### 6-3. 검증 방식 — "됐다"의 판정 근거
- 자동 테스트·커버리지·빌드: 이 스킬은 요구하지 않음. 서문은 오히려 lint/typecheck/i18n gate 로 못 잡는 영역이라고 선언 (`SKILL.md:8`).
- 유일한 코드 수준 검증 지시: `[data-platform='darwin']` override 를 stylesheet spec 에서 단언 (`SKILL.md:52`).
- 나머지 판정 근거:
  - 사람의 눈 확인: "Verify every color in both light and dark mode" (`SKILL.md:13`), 오버레이 3항목 "verified" (`SKILL.md:42`), scrollbar "verify the bar neither overflows…" (`SKILL.md:48`).
  - 리뷰어 자기 진술: 리뷰 시 총 오프셋을 "State" 할 것 (`SKILL.md:53`).
  - 사람 승인: 디자이너/프로덕트 리뷰 (`SKILL.md:62`), 새 아이콘 디자이너 승인 (`SKILL.md:21`).
- 즉 "됐다"는 대부분 자기 진술 + 사람 리뷰다. 스크린샷 첨부·결과 증빙 포맷에 대한 요구는 원문에 명시 없음.

### 6-4. 도구 사용 규칙
- 지시하는 "탐색" 행위: 리터럴 도입 전 "search the target page and its nearest established sibling" (`SKILL.md:12`). 검색 도구 종류(grep 등)는 원문에 명시 없음.
- 지시하는 UI 도구(프리미티브): Toast, Tooltip, HoverCard, Menu, Modal, overlay (`SKILL.md:23,29,52`).
- 금지하는 도구/기법: ad-hoc `title` 속성 선호 안 함(`SKILL.md:23`), 컴포넌트별 scrollbar 셀렉터(`SKILL.md:48`).
- 에이전트 도구(Bash, Edit, 브라우저 등) 사용 규칙: 원문에 명시 없음. `allowed-tools` 도 없음.

### 6-5. 컨텍스트·토큰 규율
- 파일 읽기 범위 지시: 대상 페이지 + 가장 가까운 형제 페이지로 한정 (`SKILL.md:12`).
- 외부 문서 읽기 시점 지시: 원문에 명시 없음(링크만 있음). 링크 4개를 언제 읽으라는 규칙 없음.
- 서브에이전트 위임, 요약·압축 지시: 원문에 명시 없음.
- 스킬 본체 크기: 7,776 bytes, 62줄. 전부를 한 번에 읽는 구조.

### 6-6. 모호어의 조작적 정의
| 모호어 | 원문의 환산 | 환산 규칙 유무 |
|---|---|---|
| "existing tokens" | 대상 페이지와 가장 가까운 형제 페이지에서 이미 쓰는 token/value | 부분 있음 (`SKILL.md:12`) |
| "readable" | "An ink/background pair must stay readable under both themes" | 수치(대비비) 없음 — 환산 규칙 없음 |
| "plain language" | 내부 jargon·기술 명사 없음, 한 문장 선호 | 부분 있음 (`SKILL.md:32`) |
| "short" (오류 카피) | "anything explainable in two sentences must not grow into paragraphs" | 부분 있음(문단 금지) |
| "small number of distinct sizes" | 숫자 없음, 13px 이 기준 행/상세 크기 | 없음(대표값 1개만) |
| "proportionate" | "never ship an element that … visibly outweighs its neighbours" | 수치 없음 — 환산 규칙 없음 |
| "extensive UI changes" | 경계 없음 | 없음 |
| "clearly user-perceivable change" | 경계 없음 | 없음 |
| "obvious" (아이콘 의미) | 판정 기준 없음 | 없음 |
| "where needed" (portal) | `overflow` 조상·containing block 에 의해 잘리는 경우 | 부분 있음 (`SKILL.md:46`) |
| "small inset" (scrollbar) | 크기 수치 없음 | 없음 |
| "edge margin" | 크기 수치 없음 | 없음 |
| "dimmed tones" | "suit decorative surfaces, but on text they routinely fall below readability in one theme" | 정의보다 경고만 있음 |
| "done / production-grade / clean / simple" | 이 단어들은 원문에 등장하지 않음 | 해당 없음 |

### 6-7. 핵심 개념 정의 (원문 어휘 그대로)
| 용어 | 원문 의미 |
|---|---|
| transient operation outcome | 일시적 작업 결과. Toast 대상 (`SKILL.md:29`) |
| in-place notice | 표면 자체에 묶인 상태 알림. 쿼리 실패(+Retry), 폼 필드 검증 (`SKILL.md:31`) |
| empty state | 비어 있는 패널의 가운데 정렬 full error state (`SKILL.md:31`) |
| shell.overlay entry | 토스트를 보고 표면보다 오래 사는 호스트의 예 (`RowActionToast` 가 쓰는 방식) (`SKILL.md:29`) |
| dimmed tones | 장식 표면에는 적합하나 텍스트에는 가독성 문제를 자주 일으키는 톤 (`SKILL.md:13`) |
| slot | 우측 사이드바 콘텐츠가 등록되는 단위 (`SKILL.md:22`) |

## 7. 산출물

### 7-1. 최종 결과물의 형태
- 스킬이 정의하는 출력 포맷: 원문에 명시 없음. 리포트·판정문·체크리스트 템플릿 없음.
- 스킬이 암시하는 결과물 유형 두 가지(본문에서 읽히는 것만):
  1. 코드 변경: 토큰 채택, 기존 컴포넌트 확장, 프리미티브 사용, `[data-platform='darwin']` override + stylesheet spec 단언 (`SKILL.md:52`).
  2. 리뷰 코멘트: "suggest requesting a designer review" (`SKILL.md:21`), "suggest requesting one from the design/product reviewers" (`SKILL.md:62`), "State the intended total offset" (`SKILL.md:53`).
- 강제 템플릿 인용: 없음(템플릿이 없다).

### 7-2. 리뷰 시 에이전트가 해야 하는 표현 행위
| 상황 | 행위 | 줄 |
|---|---|---|
| PR 이 새 아이콘 추가 | 디자이너 리뷰 요청을 제안 | 21 |
| 두 페이지가 같은 top spacing 으로 정렬 | 총 오프셋(clearance + page inset) 명시 | 53 |
| 대규모/체감 UI 변경 + 승인자 없음 | design/product 리뷰어에게 요청 제안 | 62 |

### 7-3. 커밋·PR·브랜치·파괴적 동작
- 커밋·브랜치·PR 생성 지시: 원문에 명시 없음.
- 파일 삭제, force push, 마이그레이션 등 파괴적 동작: 없음. 
- 리뷰 대상이 PR 이라는 사실만 언급됨 (`SKILL.md:3,21,62`).
- 스킬 자신의 파일을 갱신하라는 지시가 하나 있다: 승인자 명단이 바뀌면 이 스킬 파일의 목록을 갱신 ("update this list here when membership changes", `SKILL.md:62`). 즉 하드코딩된 인명 목록을 이 파일이 소유하고 있다.
- 사용자 의도 확인 없이 에이전트가 승인자 명단을 직접 고치는 것을 허용하는지는 원문에 명시 없음.

## 8. 주의점 / 한계 (여기서만 평가)

### 8-1. 오작동·과잉작동 시나리오
1. **과잉 트리거**: description 이 "adding or changing product-user-visible GUI behavior"처럼 넓다. 문구 한 줄, 아이콘 색 한 곳 수정에도 켜질 수 있고, 그러면 디자이너 리뷰 에스컬레이션(`SKILL.md:62`)까지 연상시켜 소소한 PR 에도 불필요한 승인 요청이 늘 수 있다. "extensive"와 "clearly user-perceivable"의 경계가 없어서 에이전트마다 해석이 갈린다.
2. **수치 공백으로 인한 해석 편차**: 읽혀야 할 숫자는 500, 13px 뿐이다. "small inset", "edge margin", "small number of distinct sizes", "readable" 은 에이전트가 임의로 채운다. 같은 코드를 두 번 리뷰하면 판정이 달라질 수 있다.
3. **토스트 호스트 규칙의 구현 의존**: "a `shell.overlay` entry, as RowActionToast does"(`SKILL.md:29`)는 특정 구현명에 묶여 있다. 해당 이름이 리팩터링되면 에이전트가 존재하지 않는 API 를 찾아다닐 수 있다. 파일 경로가 없어 탐색이 필요하다.
4. **전역 변수 보호의 한계**: `--dsh-frame-top-clearance` 변경 금지(`SKILL.md:52`)는 명확하지만, 페이지별 override 가 쌓이면 `[data-platform='darwin']` 규칙이 분산된다. 이를 모아 관리하는 방법은 원문에 없다.
5. **중문 마침표 규칙의 범위**: "A Chinese notice of at most two sentences omits the trailing 句号（。）"(`SKILL.md:32`)는 중문에만 서술되어 있다. 다른 로케일(한국어, 영어 등)에 대한 마침표 규칙은 원문에 명시 없고, 로케일 규칙은 외부 노트로 위임되어 있으나 내용은 이 스킬만으로 알 수 없다.
6. **Windows 처리 공백**: "account for macOS and Windows window chrome"(`SKILL.md:52`)라면서 구체 지시는 macOS 만 있다(`--dsh-frame-top-clearance`, `[data-platform='darwin']`). Windows 쪽 변수·속성 셀렉터는 원문에 명시 없음. Linux 언급도 없음.

### 8-2. 다른 스킬·CLAUDE.md 규칙과의 충돌 가능 지점
- `dsh-prose-standard` 와 카피 소유 경계: 이 스킬은 "error copy placement"를 다루고 카피 품질은 prose-standard 에 넘긴다(`SKILL.md:3,8`). 그런데 같은 스킬 안에서 "Error copy is plain language, and short"와 문장 수 제한을 직접 규정한다(`SKILL.md:32`). 오류 카피의 길이 규칙이 두 스킬에 중복 정의될 위험이 있다(prose-standard 본문은 이번 범위에서 읽지 않음, 충돌 여부는 확인 불가).
- `docs/web-styling.md` 와의 이중 규칙: 서문이 "not a second copy"라고 하면서도 font-weight 500, 13px 같은 값을 본문에 직접 갖고 있다(`SKILL.md:14-15`). 정본 문서가 값을 바꾸면 이 파일이 낡는다.
- 외부 저장소 CLAUDE.md 에 "리팩터링 최소 diff" 같은 규칙이 있으면, 이 스킬의 "extend an existing component … before creating a new one"(`SKILL.md:20`)과 방향이 어긋날 수 있다. 다만 실제 CLAUDE.md 내용은 접근하지 않았으므로 가능성 지적에 그친다.
- 컬렉션의 다른 스킬(`dsh-code-review` 등)이 UI 리뷰를 일반 코드 리뷰 맥락에서 같이 수행하면 지적이 중복될 수 있다. 내용 미확인.

### 8-3. 검증 공백 (원문이 확인하지 않고 넘어가는 것)
- 접근성(키보드 포커스 이동, 스크린리더, ARIA, 색 대비 비율): 원문에 명시 없음. Escape 닫기만 언급 (`SKILL.md:44`).
- 반응형·창 크기 극단(최소 창 크기, 매우 작은 viewport): "edge margin"만 있고 수치·최소 창 크기 규정 없음.
- 애니메이션·모션 규칙: 원문에 명시 없음.
- 실제 렌더링 증빙(스크린샷, 두 테마·두 플랫폼 캡처) 요구: 원문에 명시 없음. "verify"가 자기 진술로 끝날 수 있다.
- 토스트 지속 시간, 최대 개수, 중복 합치기: 원문에 명시 없음.
- 오류 코드 노출 형식("unless an error code must be exposed for debugging", `SKILL.md:32`): 어떤 경우가 "must"인지 기준 없음.
- 로딩 skeleton 과 spinner 의 전환 임계 시간: 원문에 명시 없음.
- i18n: 서문에서 i18n gate 의 존재만 언급, 규칙 내용은 위임.

### 8-4. 유지보수 리스크
| 리스크 | 근거 |
|---|---|
| 하드코딩 인명 4명 + 시점 | `SKILL.md:62` "roster as of 2026-09: yx zhang, yifffan, zhangziya, gaokaige" — 인원이 바뀌면 낡음. 스킬이 스스로 "update this list here"라고 인정 |
| 구현명 하드코딩 | `RowActionToast`, `shell.overlay`, `--dsh-frame-top-clearance`, `[data-platform='darwin']` (`SKILL.md:29,52`) |
| 상대 경로 링크 4개 | `../dsh-prose-standard/SKILL.md`, `../../notes/implemented/architecture/2026-08-23-locale-owned-client-ui-copy.md`, `../../../docs/web-styling.md`, `../../../packages/client/ui-primitives/README.md#component-catalog` — 디렉터리 이동·파일 이름 변경 시 끊김. 이번 분석에서는 존재를 확인하지 않음 |
| 기준 페이지 지정 | "the Plugins page is the usual reference" (`SKILL.md:12`) — Plugins 페이지가 바뀌거나 사라지면 기준 상실 |
| 값 중복 | 500, 13px 가 정본 문서와 이중 보관 |
| 로케일 편중 | 중문 句号 규칙 (`SKILL.md:32`) — 다른 로케일 확장 시 본문 수정 필요 |
| 모델명·외부 CLI 버전 의존 | 없음 (원문에 명시 없음) |

### 8-5. 강점 (원문이 실제로 잘하는 것)
- 자동 도구가 못 잡는 영역을 선언하고(`SKILL.md:8`) 그 안에서만 규칙을 둔다. 범위가 좁아 오탐이 적다.
- 토스트 수명 규칙이 구체적이다. "a toast rendered by the panel itself unmounts with that panel" 라는 실패 메커니즘을 이유와 함께 적어, 에이전트가 원리를 추론할 수 있다.
- 전역 변수를 건드리지 말고 스코프 override + spec 단언을 하라는 지시는 파급 범위와 회귀 방지를 함께 다룬다 (`SKILL.md:52`).
- 오버레이 3항목은 체크 가능한 이진 항목이다.
- 총 오프셋 합의 요구(`SKILL.md:53`)는 두 페이지 정렬 시 흔한 오류를 직접 겨냥한다.

### 8-6. 한 줄 판정
**조건부 도입 권장** — `packages/client` UI 를 다루는 작업과 UI PR 리뷰에서는 토스트 수명·오버레이 3항목·macOS 오프셋 규칙이 구체적이어서 가치가 크지만, 수치 기준("small inset", "extensive")이 비어 있고 인명·구현명이 하드코딩되어 있어 관리자가 정기적으로 갱신해야 한다.
