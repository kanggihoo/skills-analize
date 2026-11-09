# interface-audit 묶음은 어떻게 이어지나 {#interface-audit-group}

jakubkrehel의 리뷰 스킬 여덟 개는 `better-interface`가 중심이다. 이 스킬이 여섯 개의 도메인 스킬을 순서대로 불러 리뷰를 끝낸 뒤, 심각도·지적 상한·판정(`Block`/`Approve`)을 한 보고서로 정한다. branch·PR·미커밋 변경이 대상이면 `interface-review`가 변경 범위를 정하고 그 결과를 `better-interface`에 넘긴다. 단, `interface-review`는 사용자가 직접 불러야만 켜진다.[](source:bi-dom)[](source:bi-ir)[](source:ir-fm)

- 화면·흐름·저장소 리뷰는 `better-interface`로 바로 시작한다. 변경 리뷰 요청이면 `better-interface`는 변경 리뷰라고 말하고, 사용자에게 `interface-review` 실행을 요청한다(r66).[](source:bi-ir)
- `better-interface`는 `better-accessibility`, `better-layout`, `better-writing`, `better-typography`, `better-colors`, `better-ui` 순서로 모든 도메인 리뷰를 끝낸 뒤 통합한다(r60~r65). 규칙은 도메인 스킬이 갖고, 심각도 사다리와 형식은 `better-interface`의 것으로 대체된다.[](source:bi-dom)
- `interface-review`는 `better-interface`가 없으면 해석한 범위와 파일 목록만 보고하고 멈춘다. 심각도·상한·판정을 스스로 만들지 않는다(r67).[](source:ir-hand)
- 도메인 스킬 여섯 개는 서로 "이건 저 스킬의 몫"이라고 경계를 적을 뿐, 서로 실행하라는 지시는 없다(r75~r99).[](source:acc-own)[](source:lay-own)

@answer scope="design/jakubkrehel 리뷰 스킬 8개 · 커밋 0465878 · 지시상 동작 · 스킬 간 관계는 원장 rel-id 기준 · 스킬을 실행해 확인하지 않음"
@meta locale=ko
@source bi-fm title="design/jakubkrehel/better-interface/SKILL.md · frontmatter(호출 제한 없음)" path=design/jakubkrehel/better-interface/SKILL.md lines=1:4
@source bi-own title="better-interface/SKILL.md · 오케스트레이션만 소유한다" path=design/jakubkrehel/better-interface/SKILL.md lines=8:12
@source bi-ir title="better-interface/SKILL.md · 변경은 interface-review로 보낸다" path=design/jakubkrehel/better-interface/SKILL.md lines=28:32
@source bi-dom title="better-interface/SKILL.md · 도메인 스킬이 규칙의 원본이다" path=design/jakubkrehel/better-interface/SKILL.md lines=42:57
@source bi-verify title="better-interface/SKILL.md · 검증할 수 있는 것은 검증한다" path=design/jakubkrehel/better-interface/SKILL.md lines=59:61
@source bi-sev title="better-interface/SKILL.md · 심각도와 escalation trigger" path=design/jakubkrehel/better-interface/SKILL.md lines=67:95
@source bi-cap title="better-interface/SKILL.md · 한 원인은 한 지적, 최대 15개" path=design/jakubkrehel/better-interface/SKILL.md lines=109:115
@source rf-verdict title="better-interface/review-format.md · 판정" path=design/jakubkrehel/better-interface/review-format.md lines=35:46
@source ir-fm title="design/jakubkrehel/interface-review/SKILL.md · frontmatter(호출 제한)" path=design/jakubkrehel/interface-review/SKILL.md lines=1:5
@source ir-own title="interface-review/SKILL.md · 범위·분류·변경 보고서를 소유한다" path=design/jakubkrehel/interface-review/SKILL.md lines=7:17
@source ir-repo title="interface-review/SKILL.md · 변경이 없을 때 선택지" path=design/jakubkrehel/interface-review/SKILL.md lines=35:46
@source ir-blast title="interface-review/SKILL.md · 영향 화면은 한 단계, 최대 5곳" path=design/jakubkrehel/interface-review/SKILL.md lines=48:54
@source ir-rm title="interface-review/SKILL.md · 제거된 줄을 담당 스킬로 보낸다" path=design/jakubkrehel/interface-review/SKILL.md lines=58:60
@source ir-cls title="interface-review/SKILL.md · finding 상태 세 가지" path=design/jakubkrehel/interface-review/SKILL.md lines=62:70
@source ir-hand title="interface-review/SKILL.md · better-interface에 넘긴다" path=design/jakubkrehel/interface-review/SKILL.md lines=93:97
@source ir-ro title="interface-review/SKILL.md · 읽기 전용과 렌더 검증" path=design/jakubkrehel/interface-review/SKILL.md lines=99:103
@source ir-out title="interface-review/SKILL.md · 변경 리뷰 출력 형식" path=design/jakubkrehel/interface-review/SKILL.md lines=122:149
@source rs-68 title="interface-review/scope-resolution.md · 폰트·이미지 예외" path=design/jakubkrehel/interface-review/scope-resolution.md lines=68:68
@source rm-tbl title="interface-review/removed-signals.md · 제거 신호와 담당 스킬" path=design/jakubkrehel/interface-review/removed-signals.md lines=5:17
@source acc-fm title="design/jakubkrehel/better-accessibility/SKILL.md · frontmatter" path=design/jakubkrehel/better-accessibility/SKILL.md lines=1:4
@source acc-own title="better-accessibility/SKILL.md · 소개와 다른 스킬의 몫" path=design/jakubkrehel/better-accessibility/SKILL.md lines=8:12
@source lay-fm title="design/jakubkrehel/better-layout/SKILL.md · frontmatter" path=design/jakubkrehel/better-layout/SKILL.md lines=1:4
@source lay-own title="better-layout/SKILL.md · 소개와 다른 스킬의 몫" path=design/jakubkrehel/better-layout/SKILL.md lines=8:12
@source wri-fm title="design/jakubkrehel/better-writing/SKILL.md · frontmatter" path=design/jakubkrehel/better-writing/SKILL.md lines=1:4
@source wri-own title="better-writing/SKILL.md · 소개와 다른 스킬의 몫" path=design/jakubkrehel/better-writing/SKILL.md lines=8:12
@source typ-fm title="design/jakubkrehel/better-typography/SKILL.md · frontmatter" path=design/jakubkrehel/better-typography/SKILL.md lines=1:4
@source typ-own title="better-typography/SKILL.md · 소개와 다른 스킬의 몫" path=design/jakubkrehel/better-typography/SKILL.md lines=8:10
@source col-fm title="design/jakubkrehel/better-colors/SKILL.md · frontmatter" path=design/jakubkrehel/better-colors/SKILL.md lines=1:4
@source col-own title="better-colors/SKILL.md · 소개와 다른 스킬의 몫" path=design/jakubkrehel/better-colors/SKILL.md lines=8:12
@source ui-fm title="design/jakubkrehel/better-ui/SKILL.md · frontmatter" path=design/jakubkrehel/better-ui/SKILL.md lines=1:4
@source ui-own title="better-ui/SKILL.md · 소개와 다른 스킬의 몫" path=design/jakubkrehel/better-ui/SKILL.md lines=8:16

## 요청은 어디서 시작해 어디로 가나 {#route span=12}

@workflow id=audit-route title="리뷰 요청이 가는 길"
| req | 인터페이스 리뷰 요청 | external |
| scope | 변경 범위인가? | backend |
| ask | 사용자에게 실행 요청 | external |
| ir | interface-review | backend |
| bi | better-interface | backend |
| dom | 도메인 스킬 6개 | backend |
| out | 보고서와 판정 | external |
| req > scope | |
| scope > bi | 아니오: 화면·흐름·저장소 |
| scope > ask | 예: branch·PR·미커밋 | dashed |
| ask > ir | 사용자가 직접 실행 | emphasis |
| ir > bi | 범위 블록 | emphasis |
| bi > dom | 순서대로 | emphasis |
| dom > out | |

@steps id=audit-steps
| req | 인터페이스 리뷰 요청 | 사용자가 화면·흐름·저장소를 리뷰해 달라고 하거나 branch·PR·미커밋 변경을 리뷰해 달라고 한다. | audit-route | req |
| scope | 변경 범위인가? | `better-interface`가 판단한다. branch·PR·commit 범위·미커밋 변경이 이름으로 나오면 변경 리뷰다. 변경 범위를 `better-interface`가 직접 해석하지 않는다(r66, 의무형).[](source:bi-ir) | audit-route | scope |
| ask | 사용자에게 실행 요청 | `interface-review`는 사용자 호출 전용이라 `better-interface`가 시작할 수 없다. 사용자에게 실행을 요청하고 멈춘다.[](source:bi-ir)[](source:ir-fm) | audit-route | ask |
| ir | interface-review | 변경 범위를 정하고, 변경이 닿는 화면을 넓히고, 제거된 줄을 읽고, 모든 finding에 상태를 붙인다.[](source:ir-own) | audit-route | ir |
| bi | better-interface | 범위·영향 화면·상태를 받아 도메인 리뷰를 모으고 한 보고서로 통합한다(r67, 의무형).[](source:ir-hand) | audit-route | bi |
| dom | 도메인 스킬 6개 | 접근성 → 레이아웃 → 카피 → 타이포 → 색 → UI 순서로 하나씩 리뷰한다(r60~r65).[](source:bi-dom) | audit-route | dom |
| out | 보고서와 판정 | 범위·coverage·findings 표·검증·판정(`Block` 또는 `Approve`)을 낸다.[](source:rf-verdict) | audit-route | out |

점선은 사용자가 끼어드는 지점이다. 판정: 변경 리뷰는 `better-interface`에서 `interface-review`로 자동 이어지지 않는다. 사용자가 두 번째로 명령을 내려야 한다. 근거는 `better-interface` 30줄과 `interface-review` frontmatter다.[](source:bi-ir)[](source:ir-fm)

## 누가 무엇을 정하나 {#ownership span=12}

| 스킬 | 소유하는 것 | 소유하지 않는 것 |
| --- | --- | --- |
| `better-interface` | 범위 확정, 도메인 스킬을 부르는 순서, 심각도 3단계, escalation trigger 13개, 지적 상한 15개, 판정 `Block`/`Approve`, 보고서 형식[](source:bi-own)[](source:bi-sev)[](source:bi-cap)[](source:rf-verdict) | 각 도메인의 규칙. 도메인 스킬이 없으면 기억으로 만들지 않고 그 도메인을 `Not reviewed`로 표시한다[](source:bi-dom) |
| `interface-review` | 변경 범위(`$BASE`), 영향 화면 확장(최대 5곳), 제거 신호 대조, finding 상태 3가지, 변경 보고서 형식[](source:ir-own)[](source:ir-cls) | 도메인 규칙, 심각도·통합·coverage·상한·판정. 이것들은 `better-interface` 몫이다[](source:ir-own) |
| 도메인 스킬 6개 | 자기 영역의 규칙, references, 검증 점검. 자기 심각도 사다리와 형식은 단독으로 쓸 때만 쓴다[](source:bi-dom) | 다른 도메인의 규칙. 소개 문단이 경계를 적는다 |

판정: 같은 문제를 두 스킬이 다룰 때는 "근본 규칙의 소유자에게 배정하고 부수 효과는 Why 칸에 적는다"가 원문이 정한 해결이다. 도메인 스킬 사이의 경계 문장들이 이 규칙의 재료다.[](source:bi-dom)

## 여섯 도메인은 서로 무엇을 넘기나 {#boundaries span=12}

순서는 `better-interface`가 정한다. 번호가 앞일수록 "기초 실패가 장식에 가려지지 않게" 먼저 본다. 아래 "다른 스킬의 몫"은 각 스킬 소개 문단이 직접 적은 경계이며, 서로 실행하라는 지시가 아니다.[](source:bi-dom)

| 순서 | 도메인 스킬 | 이 스킬이 하는 일 | 다른 스킬의 몫으로 적은 것 | rel-id |
| --- | --- | --- | --- | --- |
| 1 | `better-accessibility` | 키보드·focus, ARIA, 접근 가능한 이름, 폼, 안내, 모션·확대를 WCAG 2.2 기준으로 리뷰한다[](source:acc-fm) | 대비 측정·색 수정(`better-colors`), 글자 크기·iOS input 확대·언어 메타(`better-typography`), target 간격·공간 RTL(`better-layout`), 라벨·에러·alt 문구(`better-writing`), 애니메이션 레시피·hover·스크롤 격리(`better-ui`)[](source:acc-own) | r79~r83 |
| 2 | `better-layout` | 묶음·정렬·반응형 구조를 정하고 크기·번역·RTL로 스트레스 테스트한다[](source:lay-fm) | hit area·focus(`better-accessibility`), radius·shadow·애니메이션(`better-ui`), 줄 길이·글자 간격·말줄임(`better-typography`), 문구(`better-writing`)[](source:lay-own) | r86~r90 |
| 3 | `better-writing` | 라벨·에러·빈 상태·확인 창 카피를 제품 어조에 맞춰 쓰고 리뷰한다[](source:wri-fm) | 렌더링(`better-typography`), 에러 마크업·접근 가능한 이름(`better-accessibility`), 번역 공간(`better-layout`)[](source:wri-own) | r96~r99 |
| 4 | `better-typography` | type scale·간격·폰트 기능·줄바꿈·문장부호를 정하고 리뷰한다[](source:typ-fm) | 문구(`better-writing`), heading 구조 의미(`better-accessibility`), 공간 RTL(`better-layout`), 대비 측정(`better-colors`)[](source:typ-own) | r91~r95 |
| 5 | `better-colors` | 팔레트·semantic token·색 형식·대비 수치를 다룬다[](source:col-fm) | 어떤 쌍이 통과해야 하는지(`better-accessibility`), 표면·shadow·아이콘 색(`better-ui`)[](source:col-own) | r84, r85 |
| 6 | `better-ui` | radius·광학 정렬·shadow·아이콘·모션을 정확한 값으로 다듬는다[](source:ui-fm) | 글자 렌더링(`better-typography`), hit area·키보드·ARIA·reduced-motion 요구(`better-accessibility`), 묶음·breakpoint·공간 RTL(`better-layout`), color token·대비(`better-colors`)[](source:ui-own) | r75~r78 |

네 도메인 스킬(`better-ui`, `better-colors`, `better-typography`, `better-accessibility`)은 `better-interface`의 escalation trigger를 따른다고 적는다. 켜지면 표면이 사소해도 `HIGH`다(r100~r103).[](source:bi-sev)

## 무엇을 주고받나 {#handoff span=12}

| rel-id | from → to | 종류 | 조건·강도 | 주고받는 것 |
| --- | --- | --- | --- | --- |
| r60~r65 | `better-interface` → 도메인 스킬 6개 | 내부 위임 | 의무형. 모든 도메인 리뷰를 끝낸 뒤 통합한다. 도메인 스킬이 없으면 그 도메인은 `Not reviewed`로 두고 이어 간다[](source:bi-dom) | 도메인 리뷰 증거 |
| r66 | `better-interface` → `interface-review` | 넘김 | 변경 범위 요청이면 사용자에게 `interface-review` 실행을 요청한다(의무형). 직접 시작하지 못한다[](source:bi-ir) | 사용자 요청 |
| r67 | `interface-review` → `better-interface` | 넘김 | 의무형. `better-interface`가 없으면 범위와 파일 목록만 보고하고 중단한다[](source:ir-hand) | 범위 블록, 영향 화면, finding과 status |
| r68 | `interface-review` → `better-interface` | 넘김 | 제안. 변경이 없고 사용자가 저장소 전체 감사를 고를 때만. 범위 블록·status·pre-existing 섹션 없이 넘긴다[](source:ir-repo) | 사용자 선택 |
| r69~r73 | `interface-review` → `better-accessibility`·`better-colors`·`better-layout`·`better-typography`·`better-writing` | 내부 위임 | 조건부. 제거된 줄이 신호 표와 맞고 변경 안에 대체물이 없을 때만 담당 스킬이 판단한다. 확인된 것만 `Regression`이다[](source:ir-rm)[](source:rm-tbl) | 일치한 제거 줄 |
| r74, r156 | `interface-review` → `better-ui`, `better-typography` | 참고 | 컴포넌트에 추가된 이미지는 `better-ui`와 `better-accessibility`, 폰트 파일 변경은 `better-typography` 변경이다. 바이트가 아니라 참조하는 코드를 본다[](source:rs-68) | - |
| r153 | `interface-review` → `better-interface` | 참고 | 규칙 덮어쓰기. 렌더 검증은 선택이고 `better-interface`의 "Verify what can be verified"를 대신한다. 시각·런타임 주장은 `Not verified`로 표시한다[](source:ir-ro)[](source:bi-verify) | - |

## 읽기 전용인가, 어디서 사람이 멈추나 {#gates span=12}

@callout level=warning title="interface-review는 사용자만 켤 수 있고, 두 스킬 모두 기본이 읽기 전용이다"
`interface-review`는 `disable-model-invocation: true`다. 그래서 `better-interface`는 변경 리뷰를 직접 시작하지 못하고 사용자에게 실행을 요청한다(r66).[](source:ir-fm)[](source:bi-ir)
리뷰 요청은 읽기 전용이다. `better-interface`는 사용자가 구현까지 요청했을 때만 소스를 고친다.[](source:bi-cap) `interface-review`는 working tree를 바꾸지 않는다. `git fetch`는 허용하고 `gh pr checkout`, `git checkout`, `git switch`, `git stash`는 허용하지 않는다.[](source:ir-ro)

@facts id=audit-facts
| better-interface 지적 상한 | 15개(의무). 넘기지 않는다 |
| escalation trigger | 13개. 켜지면 `HIGH`(의무) |
| interface-review 영향 화면 | 소비자 최대 5곳(두 단계 합계). 확장하지 않은 수를 적는다. 근거는 `interface-review` 48~54줄 |
| interface-review `Pre-existing` 출력 | 최대 3개(출력 상한), 심각도 높은 순 |
| 공유 파일 | 원문에 명시 없음. 두 스킬은 서로 파일을 읽고 쓰지 않고 보고서만 주고받는다 |

판정: 변경이 없을 때(작업 트리가 깨끗하고 merge base보다 앞선 commit이 없을 때) `interface-review`는 마지막 commit을 임의로 고르지 않는다. 경로를 보여 주고 사용자의 응답을 기다린다. 이때 사용자가 `interface-review`로 직접 갈 수도, 저장소 감사로 `better-interface`로 갈 수도 있다.[](source:ir-repo)

@callout level=open-question title="원문이 정하지 않은 것"
`better-interface` 93줄은 trigger가 상한보다 많으면 먼저 적고 상한이 뺀 개수를 말하라고 한다. 같은 문장에서 "상한이 막힌 이유를 빠뜨리는 원인이 되어서는 안 된다"고도 한다. 빠진 trigger의 위치까지 적어야 하는지는 `원문에 명시 없음`이다.[](source:bi-sev)
`interface-review`가 가리키는 "프로젝트의 일반 코드 리뷰" 스킬의 이름은 `원문에 명시 없음`이다.[](source:ir-own)

## 그림에서 뺀 관계와 확인 범위 {#omitted span=12}

| 뺀 관계 | rel-id | 이유 |
| --- | --- | --- |
| 도메인 스킬 사이의 경계 참고 25행 | r75~r99 | 순서나 호출이 아니라 몫 구분이라 "여섯 도메인" 표에 정리했다 |
| 도메인 스킬 → `better-interface` escalation trigger 참고 4행 | r100~r103 | 같은 이유로 표에 문장으로 적었다 |
| 도메인 스킬 → `better-interface` 심각도 겹침 | r154, r155 | `better-writing`·`better-layout`의 `HIGH` 기준이 trigger와 겹친다. 호출 관계가 아니다. 각 스킬 페이지에서 다룬다 |
| 같은 계열(`better-interface`↔`impeccable`, `better-ui`↔`emil-design-eng`, `better-ui`↔`review-animations`) | r151, r152, r157 | 다른 묶음의 스킬과의 대안 관계다. `design/relations.md`에서 본다 |

- 읽은 파일: 이 페이지는 `better-interface`·`interface-review`의 `SKILL.md`와 보조 문서 3개를 줄 단위로 다시 확인했다. 여섯 도메인 스킬은 소개 문단과 frontmatter만 다시 읽었고, 본문 규칙은 각 스킬 페이지(`design/jakubkrehel/<스킬>/<스킬>.html`)가 다룬다.
- 분석 중 바뀐 파일: 없음. 스킬을 실제로 실행하지 않았다(지시상 동작). 사람 검토는 미실시다.
- 스킬 페이지와 대조: 이 페이지의 `interface-review` 줄 번호는 분석 커밋 `0465878`이다.
