# 클라이언트 GUI 묶음(client-ui)은 어떻게 이어지나 {#client-ui-group}

이 묶음은 클라이언트 GUI를 설계하고 리뷰하며 증거를 남기는 스킬 다섯 개다. `dsh-client-ui-ux`가 판단 기준을 주고, 오류 보고는 `dsh-error-handling`에 위임하고, 반응형 세부는 `dsh-responsive-ui`를 참고하라고 가리킨다.[](source:ux-err)[](source:ux-resp) 공식 플러그인 그림(`dsh-official-plugin-artwork`)은 이와 다른 대상을 다루고, GUI PR의 데모 GIF는 `record-browser-gif`가 맡는다.[](source:art-fm)[](source:gif-must)

- `dsh-client-ui-ux`는 실패를 보고할 때 `dsh-error-handling`의 보고 절을 적용하고, 그 뒤 메시지 수명에 따라 어디에 보일지 고른다(r31).[](source:ux-err)
- `dsh-client-ui-ux`는 반응형 레이아웃, 터치 판별, 말줄임, 제목 줄바꿈, 아이콘 전용 버튼, 폭 변화 중 포커스를 다룰 때 `dsh-responsive-ui`를 쓰라고 한다(r32).[](source:ux-resp)
- 두 스킬 사이의 간선은 `dsh-official-plugin-artwork` → `dsh-client-ui-ux` 한 방향뿐이다. `dsh-official-plugin-artwork`는 액션 아이콘이 `dsh-client-ui-ux` 소관이라고 경계를 긋는다(r33). 반대 방향 참조는 없다.[](source:art-edge)[](source:art-fm)
- `dsh-official-plugin-artwork`는 그림 작업이 GUI PR이면 `record-browser-gif`를 따른다(r34). `dsh-client-ui-ux` 원문에는 GIF 언급이 없다.[](source:art-gif)[](source:ux-fm)

@answer scope="deepseek-harness client-ui 묶음 · 스킬 5개와 경계 스킬 원본 · 커밋 475505c · 지시상 동작"
@meta locale=ko
@source ux-fm title="deepseek-harness/dsh-client-ui-ux/SKILL.md · 9486B · frontmatter" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=1:4
@source ux-intro title="dsh-client-ui-ux/SKILL.md · 성격과 문구 소관" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=8:8
@source ux-err title="dsh-client-ui-ux/SKILL.md · 오류 보고 절 적용과 자리 고르기" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=34:34
@source ux-resp title="dsh-client-ui-ux/SKILL.md · 반응형 안내" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=59:59
@source ux-esc title="dsh-client-ui-ux/SKILL.md · 디자인 리뷰 에스컬레이션" path=deepseek-harness/dsh-client-ui-ux/SKILL.md lines=77:77
@source rui-fm title="deepseek-harness/dsh-responsive-ui/SKILL.md · 4423B · frontmatter" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=1:4
@source rui-vp title="dsh-responsive-ui/SKILL.md · 최소 뷰포트" path=deepseek-harness/dsh-responsive-ui/SKILL.md lines=10:10
@source art-fm title="deepseek-harness/dsh-official-plugin-artwork/SKILL.md · 6194B · frontmatter" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=1:4
@source art-edge title="dsh-official-plugin-artwork/SKILL.md · 액션 아이콘 경계" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=17:17
@source art-gif title="dsh-official-plugin-artwork/SKILL.md · GUI PR과 디자이너 승인" path=deepseek-harness/dsh-official-plugin-artwork/SKILL.md lines=41:41
@source eh-fm title="deepseek-harness/dsh-error-handling/SKILL.md · 2389B · frontmatter" path=deepseek-harness/dsh-error-handling/SKILL.md lines=1:4
@source eh-head title="dsh-error-handling/SKILL.md · 오류 보고 절 제목" path=deepseek-harness/dsh-error-handling/SKILL.md lines=20:20
@source gif-fm title="deepseek-harness/record-browser-gif/SKILL.md · 15698B · frontmatter" path=deepseek-harness/record-browser-gif/SKILL.md lines=1:4
@source gif-must title="record-browser-gif/SKILL.md · GUI PR은 GIF 필수" path=deepseek-harness/record-browser-gif/SKILL.md lines=12:14
@source gif-attach title="record-browser-gif/SKILL.md · gh 첨부 요건" path=deepseek-harness/record-browser-gif/SKILL.md lines=124:124
@source pd-gif title="deepseek-harness/dsh-pr-description/SKILL.md · 18973B · GUI 변경 행" path=deepseek-harness/dsh-pr-description/SKILL.md lines=63:63
@source pd-attach title="dsh-pr-description/SKILL.md · 설명 작성 절차" path=deepseek-harness/dsh-pr-description/SKILL.md lines=202:202
@source perf-gif title="deepseek-harness/dsh-speed-up-perf/SKILL.md · 12167B · 보이는 GUI 변경" path=deepseek-harness/dsh-speed-up-perf/SKILL.md lines=80:80
@source cr-list title="deepseek-harness/dsh-code-review/SKILL.md · 11550B · 읽을 자료 목록" path=deepseek-harness/dsh-code-review/SKILL.md lines=24:25
@source cr-err title="dsh-code-review/SKILL.md · 실패 경로 점검" path=deepseek-harness/dsh-code-review/SKILL.md lines=43:43

## 다섯 스킬은 서로 어떻게 가리키나 {#flow span=12}

@workflow id=client-ui-flow title="client-ui 묶음의 참조와 증거 흐름"
| art | dsh-official-plugin-artwork | backend |
| pd | dsh-pr-description | external |
| perf | dsh-speed-up-perf | external |
| ux | dsh-client-ui-ux | backend |
| err | dsh-error-handling | backend |
| resp | dsh-responsive-ui | backend |
| gif | record-browser-gif | backend |
| art > ux | r33 경계 참고 | dashed |
| ux > err | r31 위임 | default |
| ux > resp | r32 참고 | dashed |
| art > gif | r34 넘김 | emphasis |
| pd > gif | r23 위임 | default |
| perf > gif | r35 참고 | dashed |

@steps id=client-ui-steps
| s-ux | dsh-client-ui-ux | 클라이언트 GUI 변경의 판단 기준을 준다. 토큰 재사용, 피드백 자리, 오버레이 안전, 플랫폼 창 적응이 대상이다. 스스로 완전한 체크리스트가 아니라 안내라고 밝힌다. | client-ui-flow | ux |
| s-err | dsh-error-handling | 실패 분류, 처리 책임, 상태 보장, 사용자에게 보이는 오류 보고의 원칙을 준다. `dsh-client-ui-ux`는 이 스킬의 보고 절을 적용한 다음, 오류를 보일 자리를 고른다. | client-ui-flow | err |
| s-resp | dsh-responsive-ui | 반응형 레이아웃, 터치 판별, 말줄임, 아이콘 전용 버튼, 폭 변화 중 포커스를 설계하고 리뷰한다. | client-ui-flow | resp |
| s-art | dsh-official-plugin-artwork | 공식 플러그인 아이콘과 기능 미리보기 그림을 그리고 리뷰한다. 툴바·액션 아이콘은 대상이 아니다. | client-ui-flow | art |
| s-gif | record-browser-gif | GUI를 바꾸는 PR이면, 데모 GIF를 녹화하고 인코딩한다. 작업이 PR 첨부를 포함하면 `gh --attach`로 올린다. | client-ui-flow | gif |

화살표는 실행 순서가 아니라 참조 방향이다. 다섯 스킬을 순서대로 모두 거치라는 원문은 없다. 각 스킬의 내부 규칙과 수치는 `deepseek-harness/dsh-client-ui-ux/dsh-client-ui-ux.html`, `deepseek-harness/dsh-error-handling/dsh-error-handling.html`, `deepseek-harness/dsh-responsive-ui/dsh-responsive-ui.html`, `deepseek-harness/dsh-official-plugin-artwork/dsh-official-plugin-artwork.html`, `deepseek-harness/record-browser-gif/record-browser-gif.html`에 있다.

실선은 위임, 굵은 선은 넘김, 점선은 참고다. 아래 표에서 `생략`으로 표시한 행은 그림에 없다.

| rel-id | from → to | 종류 | 조건·강도 | 그림 |
| --- | --- | --- | --- | --- |
| r31 | `dsh-client-ui-ux` → `dsh-error-handling` | 내부 위임 | 실패를 보고할 때 "Localized, actionable, visible reports" 절을 적용한 다음, 메시지 수명에 따라 어디에 보일지 고른다[](source:ux-err)[](source:eh-head) | 그림 |
| r32 | `dsh-client-ui-ux` → `dsh-responsive-ui` | 참고 | 반응형 레이아웃, 모바일·터치 판별, 말줄임, 제목 줄바꿈, 아이콘 전용 버튼, 폭 변화 중 포커스를 다룰 때는 이 스킬을 쓴다[](source:ux-resp) | 그림(점선) |
| r33 | `dsh-official-plugin-artwork` → `dsh-client-ui-ux` | 참고 | 경계. 액션 아이콘은 `dsh-client-ui-ux`의 "Reuse before adding" 절 소관이다. description도 툴바·액션 아이콘은 대상이 아니라고 적는다[](source:art-edge)[](source:art-fm) | 그림(점선, 경계) |
| r34 | `dsh-official-plugin-artwork` → `record-browser-gif` | 넘김 | GUI PR이면 저장소 UI 테스트 정책과 `record-browser-gif`를 따른다. 같은 줄의 "새 글리프는 병합 전에 디자이너 승인"은 이 관계가 아닌 별도 의무다[](source:art-gif) | 그림 |
| r23 | `dsh-pr-description` → `record-browser-gif` | 내부 위임 | 제품 사용자에게 보이는 GUI를 바꾸면, 데모 GIF와 `record-browser-gif`가 요구하는 고지를 설명에 넣는다. GIF가 없으면 설명에 없는 이유를 적는다. GIF를 넣을 때는 이 스킬을 따라 `--attach`를 쓴다(묶음 경계)[](source:pd-gif)[](source:pd-attach)[](source:gif-must) | 그림 |
| r35 | `dsh-speed-up-perf` → `record-browser-gif` | 참고 | 제품에 보이는 GUI 변경이면 "필요한 브라우저 근거/GIF"를 넣는다. 원문은 `record-browser-gif`라는 스킬 이름을 적지 않는다(묶음 경계)[](source:perf-gif)[](source:gif-fm) | 그림(점선) |
| r30 | `dsh-client-ui-ux` → `dsh-prose-standard` | 참고 | UI 문구 품질 자체는 `dsh-prose-standard`를 따른다(묶음 밖)[](source:ux-intro) | 생략(묶음 밖) |
| r03 | `dsh-code-review` → `dsh-client-ui-ux` | 참고 | 읽을 자료 목록에 제품 사용자에게 보이는 GUI 변경용으로 올라 있다. 본문 점검 항목에서 따로 적용을 지시하지는 않는다(묶음 경계)[](source:cr-list) | 생략(묶음 밖) |
| r04 | `dsh-code-review` → `dsh-error-handling` | 내부 위임 | 바뀐 실패 경로에 적용한다. 상태 소유자가 이후 작업의 전제 조건을 보장하지 않으면 `catch-and-continue`를 거부한다(묶음 경계)[](source:cr-list)[](source:cr-err) | 생략(묶음 밖) |

연결이 없다는 것도 사실이므로 적어 둔다. `dsh-client-ui-ux`에서 `dsh-official-plugin-artwork`로 가는 관계와 `dsh-client-ui-ux`에서 `record-browser-gif`로 가는 관계는 원장에도 원문에도 없다. 판정: `dsh-client-ui-ux` 원문에 두 스킬의 이름도 GIF 언급도 없기 때문이다.[](source:ux-fm)[](source:ux-esc) `dsh-responsive-ui`와 `dsh-error-handling`도 이 묶음 안의 다른 스킬을 가리키지 않는다.[](source:rui-vp)[](source:eh-head)

## 어떤 파일을 함께 쓰고 읽나 {#shared-state}

| 파일·장소 | 쓰는 스킬 | 읽는 스킬 |
| --- | --- | --- |
| PR 본문의 데모 GIF 첨부(GitHub PR, r23) | `record-browser-gif`(작업이 PR 첨부를 포함할 때 `gh --attach`로 올리고 본문 참조를 바꾼다)[](source:gif-attach), `dsh-pr-description`(묶음 밖, 설명에 GIF와 고지를 넣는다)[](source:pd-gif)[](source:pd-attach) | 원문에 명시 없음 |
| 그 밖의 파일 | 원장에 이 묶음의 공유 상태 행은 위 하나뿐이다. 다섯 스킬이 같은 파일을 함께 쓴다는 원문은 없다 | 원문에 명시 없음 |

`record-browser-gif`와 `dsh-official-plugin-artwork`는 서로의 산출물을 읽지 않는다. `dsh-official-plugin-artwork`는 GUI PR이면 `record-browser-gif`를 따르라고만 적는다.[](source:art-gif)

@callout level=warning title="GIF 필수 조건과 디자이너 승인은 다른 의무다"
`record-browser-gif`는 제품 사용자에게 보이는 GUI 동작을 바꾸는 PR에 GIF 파일을 필수(MUST)로 요구한다.
`dsh-client-ui-ux`는 UI나 상호작용을 눈에 띄게 바꾸는 PR에 디자이너나 제품 리뷰를 요구하고, `dsh-official-plugin-artwork`는 새 글리프를 병합하기 전에 디자이너 승인을 요구한다.

원문 인용: GIF는 `record-browser-gif` 12~14줄, 디자이너 리뷰는 `dsh-client-ui-ux` 77줄, 글리프 승인은 `dsh-official-plugin-artwork` 41줄이다.[](source:gif-must)[](source:ux-esc)[](source:art-gif)

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: 묶음 스킬 5개의 `SKILL.md`와 경계 스킬 `dsh-pr-description`, `dsh-speed-up-perf`, `dsh-code-review`의 인용 줄. 모두 원본이다. 번역본은 이 컬렉션에 없다.
- 원문 대조: r03, r04, r23, r30~r35의 출처 줄을 원문에서 다시 읽었다. 종류와 조건이 원장과 같다.
- 원장 정정: 처음 원장의 묶음 그림 칸은 `client-ui-ux` 쪽 GUI PR 증거도 `record-browser-gif`로 모인다고 적었다. r34는 `dsh-official-plugin-artwork` → `record-browser-gif`뿐이고 `dsh-client-ui-ux`는 `record-browser-gif`를 부르지 않아, 조정자가 원장을 고쳤다. 이 페이지는 r34만 그렸다.
- 실제로 실행해 보지 않았다. 페이지의 흐름은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`dsh-official-plugin-artwork`의 선택 사항인 기능 미리보기 규칙은 원래 저장소의 쿡북 문서가 소유하고, 이 저장소에 없어 열지 못했다. 이 페이지의 흐름에는 영향이 없다.
`dsh-code-review`가 `dsh-client-ui-ux`를 본문 점검 항목에서 적용하는지는 원문에 명시 없음(r03).
