# better-interface 스킬은 에이전트를 어떻게 바꾸나 {#better-interface-skill}

`better-interface`를 쓰면 에이전트는 화면이나 흐름을 "느낌"으로 평가하지 않고, 접근성·레이아웃·카피·타이포·색·UI 순서로 도메인 스킬 여섯 개에 맡겨 리뷰한다. 결과는 심각도 순 표 하나, 검증 기록, `Block` 또는 `Approve` 판정으로 합쳐 낸다. 이 스킬이 가진 것은 진행 순서와 순위 규칙뿐이고, 개별 규칙은 도메인 스킬이 가진다.[](source:bi-own)[](source:bi-dlist)[](source:bi-dtake)

- 켜지는 때: frontmatter에 `name`과 `description`뿐이고 호출 제한 필드가 없다. 판정: 모델이 `description`을 보고 켤 수 있는 스킬이다.[](source:bi-fm)[](source:oy-all)
- 강제하는 것: 지적마다 `path/to/file:line`과 현재 구현을 보인다. escalation trigger 13개는 `HIGH`로 올리고, 지적은 최대 15개, 기본은 읽기 전용이다.[](source:bi-evidence)[](source:bi-trig-list)[](source:bi-consol)[](source:bi-ro)
- 도메인 스킬이 없으면: 그 도메인을 `Not reviewed`로 적고 이어 간다. 기억으로 규칙을 만들지 않는다.[](source:bi-dmiss)
- 쓰면 안 되는 때: branch, pull request, commit 범위, 미커밋 변경 리뷰다. 변경 리뷰라고 밝히고 사용자에게 `interface-review` 실행을 부탁한다.[](source:bi-change)

@answer scope="design/jakubkrehel/better-interface · 원본 텍스트 3개 11,008B · 커밋 0465878 · 관계 확인용으로 다른 스킬 일부 줄만 읽음 · 지시는 읽기만 하고 실행하지 않음 · 지시상 동작"
@meta locale=ko
@source bi-fm title="design/jakubkrehel/better-interface/SKILL.md · 8779B · 지시 본문과 frontmatter" path=design/jakubkrehel/better-interface/SKILL.md lines=1:4
@source bi-own title="SKILL.md · 이 스킬이 맡는 것과 안 맡는 것" path=design/jakubkrehel/better-interface/SKILL.md lines=6:12
@source bi-evid title="SKILL.md · 근거이지 취향이 아니다" path=design/jakubkrehel/better-interface/SKILL.md lines=14:18
@source bi-scope title="SKILL.md · 1 범위 먼저 정한다" path=design/jakubkrehel/better-interface/SKILL.md lines=20:26
@source bi-change title="SKILL.md · 2 변경은 interface-review로 보낸다" path=design/jakubkrehel/better-interface/SKILL.md lines=28:32
@source bi-recon title="SKILL.md · 3 판단 전에 프로젝트 파악" path=design/jakubkrehel/better-interface/SKILL.md lines=34:40
@source bi-dlist title="SKILL.md · 4 도메인 스킬 여섯 개와 순서" path=design/jakubkrehel/better-interface/SKILL.md lines=42:51
@source bi-dtake title="SKILL.md · 4 도메인에서 가져오는 것과 바꾸는 것" path=design/jakubkrehel/better-interface/SKILL.md lines=53:53
@source bi-dmiss title="SKILL.md · 4 도메인 스킬이 없을 때" path=design/jakubkrehel/better-interface/SKILL.md lines=55:55
@source bi-dtwo title="SKILL.md · 4 두 스킬이 한 문제를 다룰 때" path=design/jakubkrehel/better-interface/SKILL.md lines=57:57
@source bi-verify title="SKILL.md · 5 검증할 수 있는 것은 검증한다" path=design/jakubkrehel/better-interface/SKILL.md lines=59:61
@source bi-evidence title="SKILL.md · 근거를 요구한다" path=design/jakubkrehel/better-interface/SKILL.md lines=63:65
@source bi-sev title="SKILL.md · 사용자 영향으로 순위를 매긴다" path=design/jakubkrehel/better-interface/SKILL.md lines=67:75
@source bi-trig-list title="SKILL.md · escalation trigger 13개" path=design/jakubkrehel/better-interface/SKILL.md lines=77:91
@source bi-trig-rank title="SKILL.md · trigger는 cap보다 앞선다" path=design/jakubkrehel/better-interface/SKILL.md lines=93:93
@source bi-trig-note title="SKILL.md · trigger는 심각도만 정한다" path=design/jakubkrehel/better-interface/SKILL.md lines=95:95
@source bi-cheap title="SKILL.md · 더 싼 고침을 먼저 권한다" path=design/jakubkrehel/better-interface/SKILL.md lines=97:107
@source bi-consol title="SKILL.md · 같은 원인은 한 행, 최대 15개" path=design/jakubkrehel/better-interface/SKILL.md lines=109:111
@source bi-ro title="SKILL.md · 기본은 읽기 전용" path=design/jakubkrehel/better-interface/SKILL.md lines=113:115
@source bi-mist title="SKILL.md · 끝내기 전 점검 표 8행" path=design/jakubkrehel/better-interface/SKILL.md lines=117:128
@source bi-fmtref title="SKILL.md · 출력 형식은 review-format.md" path=design/jakubkrehel/better-interface/SKILL.md lines=130:132
@source rf-cov title="design/jakubkrehel/better-interface/review-format.md · 2126B · 출력 형식 · 범위와 coverage" path=design/jakubkrehel/better-interface/review-format.md lines=5:13
@source rf-find title="review-format.md · 지적 표" path=design/jakubkrehel/better-interface/review-format.md lines=15:29
@source rf-ver title="review-format.md · Verification" path=design/jakubkrehel/better-interface/review-format.md lines=31:33
@source rf-verdict title="review-format.md · Verdict" path=design/jakubkrehel/better-interface/review-format.md lines=35:42
@source rf-chg title="review-format.md · 변경 리뷰일 때" path=design/jakubkrehel/better-interface/review-format.md lines=44:46
@source oy-all title="design/jakubkrehel/better-interface/agents/openai.yaml · 103B · UI 표시 이름과 짧은 설명" path=design/jakubkrehel/better-interface/agents/openai.yaml lines=1:3
@source ir-fm title="design/jakubkrehel/interface-review/SKILL.md · r66 확인용 frontmatter" path=design/jakubkrehel/interface-review/SKILL.md lines=1:5
@source ir-own title="interface-review/SKILL.md · r67 확인용 역할 분담" path=design/jakubkrehel/interface-review/SKILL.md lines=11:11
@source ir-hand title="interface-review/SKILL.md · r67 확인용 better-interface로 넘김" path=design/jakubkrehel/interface-review/SKILL.md lines=93:97
@source var-scope title="design/jakubkrehel/variant/SKILL.md · r105 확인용 역할 구분" path=design/jakubkrehel/variant/SKILL.md lines=11:11
@source var-floor title="variant/SKILL.md · r105 확인용 바닥 규칙" path=design/jakubkrehel/variant/SKILL.md lines=27:30
@source brk-scope title="design/jakubkrehel/break/SKILL.md · r113 확인용" path=design/jakubkrehel/break/SKILL.md lines=11:11
@source afk-scope title="design/jakubkrehel/afk/SKILL.md · r125 확인용" path=design/jakubkrehel/afk/SKILL.md lines=11:11
@source exp-scope title="design/jakubkrehel/explain-interface/SKILL.md · r130 확인용" path=design/jakubkrehel/explain-interface/SKILL.md lines=11:11
@source imp-desc title="design/impeccable/impeccable/SKILL.md · r152 확인용 description" path=design/impeccable/impeccable/SKILL.md lines=3:3
@source dom-a11y title="design/jakubkrehel/better-accessibility/SKILL.md · r60·r103 확인용" path=design/jakubkrehel/better-accessibility/SKILL.md lines=128:128
@source dom-col title="design/jakubkrehel/better-colors/SKILL.md · r101 확인용" path=design/jakubkrehel/better-colors/SKILL.md lines=84:84
@source dom-typ title="design/jakubkrehel/better-typography/SKILL.md · r102 확인용" path=design/jakubkrehel/better-typography/SKILL.md lines=154:154
@source dom-ui title="design/jakubkrehel/better-ui/SKILL.md · r100 확인용" path=design/jakubkrehel/better-ui/SKILL.md lines=122:122

## 언제 켜지고, 무엇으로 넘어가나 {#trigger}

@code source=bi-fm language=yaml

호출 제한 필드가 없다. 같은 폴더의 `agents/openai.yaml`에도 `display_name`과 `short_description`만 있고, 암묵 호출을 막는 `policy`가 없다.[](source:oy-all) 판정: `description`은 모델이 판단할 때 참고하는 설명이다. 특정 단어가 나와야만 켜지는 목록이 아니다.

이 스킬은 규칙을 직접 갖지 않는다. 원문은 도메인마다 담당 스킬을 이름으로 정해 둔다.[](source:bi-own)

| 영역 | 담당 스킬 | 이 스킬이 맡지 않는 이유 |
| --- | --- | --- |
| 접근성 | `better-accessibility` | 규칙은 담당 스킬이 가진다 |
| 구조 | `better-layout` | 규칙은 담당 스킬이 가진다 |
| 카피 | `better-writing` | 규칙은 담당 스킬이 가진다 |
| 글자 | `better-typography` | 규칙은 담당 스킬이 가진다 |
| 색 | `better-colors` | 규칙은 담당 스킬이 가진다 |
| 시각 완성도·모션 | `better-ui` | 규칙은 담당 스킬이 가진다 |
| branch·PR·미커밋 변경 리뷰 | `interface-review` {caution:범위 밖} | 사용자 호출 전용이다. 여기서 시작할 수 없다[](source:bi-change)[](source:ir-fm) |

판정: `interface-review`는 `disable-model-invocation: true`이므로, 에이전트가 이쪽으로 넘기는 방법은 사용자에게 "그 스킬을 실행해 달라"고 부탁하는 것뿐이다. 근거는 두 스킬의 원문이 같은 말을 한다는 점이다.[](source:bi-change)[](source:ir-fm)

## 어떤 순서로 리뷰하나 {#procedure}

원문은 범위 확인을 1번, 변경 넘김을 2번으로 번호 매긴다.[](source:bi-scope)[](source:bi-change) 판정: 변경 요청이면 범위를 직접 풀지 않으므로, 그림에서는 분기를 앞에 놓았다. 변경이 아니면 화면·흐름·저장소 범위로 이어 간다.

@workflow id=review-flow title="better-interface 리뷰 순서"
| req | 요청 받음 | external |
| chg | 변경 범위인가? | backend |
| ask | interface-review 요청 | external |
| scope | 범위 확인 | backend |
| recon | 프로젝트 파악 | backend |
| dom | 도메인 6개 리뷰 | backend |
| ver | 검증 실행 | backend |
| merge | 한 표로 합침 | backend |
| verdict | Block 또는 Approve | external |
| req > chg | |
| chg > ask | 예 |
| chg > scope | 아니오 |
| scope > recon | |
| recon > dom | |
| dom > ver | |
| ver > merge | |
| merge > verdict | | emphasis |

@steps id=review-steps
| st-chg | 변경 범위인가? | branch, pull request, commit 범위, 미커밋 변경을 말하면 변경 리뷰다. 에이전트가 diff를 짐작해 고르면 아무도 확인할 수 없는 범위가 되므로, 변경 범위를 직접 풀지 않는다.[](source:bi-change) | review-flow | chg |
| st-ask | interface-review 요청 | 변경 리뷰라고 말하고 사용자에게 `interface-review` 실행을 부탁한다. 그 스킬이 사용자 호출 전용이라 여기서 시작하지 못한다.[](source:bi-change) | review-flow | ask |
| st-scope | 범위 확인 | 요청과 작업 폴더에서 화면·흐름·feature·저장소 범위를 추론해 출력에 적는다. empty, loading, error, 좁은 너비 상태가 있으면 모든 도메인에서 본다. 범위가 너무 크면 요청이 중심으로 삼은 흐름 하나로 줄이고, 없으면 모든 사용자가 지나는 진입 경로로 줄인다. 경계와 제외한 것을 밝힌다.[](source:bi-scope) | review-flow | scope |
| st-recon | 프로젝트 파악 | framework, styling system, component library, design token, 지원 viewport, preview·test 명령을 찾는다. `CONTRIBUTING.md`, `CODING_STANDARDS.md`, `AGENTS.md`, `CLAUDE.md`, 디자인 시스템 문서, Storybook 문서, 인터페이스 ADR을 읽고 찾은 이름이나 "없음"을 적는다. 고침은 프로젝트의 방식으로 쓴다.[](source:bi-recon) | review-flow | recon |
| st-dom | 도메인 6개 리뷰 | 담당 스킬 여섯 개를 모두 불러 도메인 리뷰를 끝낸 뒤 합친다. 기초 실패가 장식에 가려지지 않게 접근성, 레이아웃, 카피, 타이포, 색, UI 순서로 본다.[](source:bi-dlist) | review-flow | dom |
| st-ver | 검증 실행 | 프로젝트가 주는 안전하고 관련 있는 검사를 돌린다. 런타임이나 시각 판단이 중요하면 렌더된 화면을 보고, 실제 명령이나 조작과 결과를 적는다. 돌릴 수 없는 검사는 **Not verified**이며 지적이 아니다.[](source:bi-verify) | review-flow | ver |
| st-merge | 한 표로 합침 | 같은 근본 원인은 모든 위치를 한 행에 담는다. 지적은 최대 15개이고, 개수를 채우려고 부풀리지 않는다. 지적이 없는 결과도 유효하다.[](source:bi-consol) | review-flow | merge |
| st-verdict | Block 또는 Approve | `HIGH`가 하나라도 남으면 `Block`, 없으면 `Approve`다. 형식은 `review-format.md`에 있고, 거기에 지적을 보고해야 리뷰가 끝난다.[](source:rf-verdict)[](source:bi-fmtref) | review-flow | verdict |

도메인 스킬 사이에 겹치는 문제는 밑바탕 규칙의 담당 스킬에 배정하고, 다른 영향은 **Why** 칸에 적는다.[](source:bi-dtwo) 도메인 스킬에서는 원칙, references, 검증만 가져온다. 그쪽의 심각도 사다리와 출력 형식은 단독 사용용이라 이 스킬 것으로 바꿔 쓴다.[](source:bi-dtake)

문서화된 프로젝트 관례는 취향 문제를 정리하지만 trigger나 도메인 규칙 위반의 면죄부가 되지는 않는다. 관례가 바꾸는 것은 지적을 **어디에** 올리느냐다. 가이드라인이나 공유 token이 원인이면 그 출처에 한 번만 올리고, 컴포넌트는 위치로 단다.[](source:bi-recon)

## 무엇을 강제하고 어떻게 순위를 매기나 {#rules}

지적의 기준은 근거다. 프로젝트가 의도한 선택은 건드리지 않는다. trigger는 스타일 가이드가 뭐라 해도 실패이고, 밀도·radius·말투가 마음에 들지 않는 것은 지적이 아니다. `Approve`의 기준은 "봤다고 주장한 것을 실제로 봤는가"다.[](source:bi-evid)

모든 지적은 `path/to/file:line`과 현재 구현을 보인다. 런타임 동작이 결과를 정하면, 소스만으로는 시각 지적을 받칠 수 없고 screenshot만으로는 코드 지적을 받칠 수 없다.[](source:bi-evidence)

| 심각도 | 뜻 |
| --- | --- |
| `HIGH` | 작업을 막거나, 사용자를 오도하거나, 내용·컨트롤을 숨기거나, 데이터 손실 위험이 있거나, 반복되는 구조적 실패다[](source:bi-sev) |
| `MEDIUM` | 이해, 효율, 적응성, 일관성을 의미 있게 해친다[](source:bi-sev) |
| `LOW` | 작업에 미치는 영향이 작은 단발성 다듬기다[](source:bi-sev) |

같은 심각도 안에서는 영향이 닿는 곳이 많고, 한 번의 수정이 많이 해결하는 것을 앞에 둔다. token이나 공유 컴포넌트 수정은 잎 컴포넌트 하나의 같은 증상보다 앞선다.[](source:bi-sev)

담당 스킬이 아래 증상 중 하나를 확인하면, 표면이 사소해도 평균을 내지 않고 `HIGH`로 올린다. 증상이 있는지는 담당 스킬이 판단하고, 이 목록은 그 비용만 정한다.[](source:bi-trig-list)[](source:bi-trig-note)

@list id=trigger-list
| 접근 가능한 이름이 없는 인터랙티브 컨트롤 |
| 키보드로 닿는데 보이는 focus 표시가 없는 컨트롤 |
| 포인터로는 닿고 키보드로는 닿지 않는 컨트롤이나 경로 |
| `prefers-reduced-motion`을 무시하는 모션이나 자동 재생 내용 |
| 320px 너비나 200% 확대에서 잘리거나 겹치거나 닿을 수 없는 내용·컨트롤 |
| 렌더된 대비 쌍이 요구 비율에 못 미치는 본문·컨트롤 글자 |
| 색만으로 전달하는 상태나 의미 |
| 확인·undo·구분된 처리가 없는 파괴적 동작 |
| 전체 값에 닿을 방법이 없는 잘린 내용 |
| 스크롤 끝 너머나 보이는 단서 없는 접힘 뒤에만 있는 내용·컨트롤 |
| 복구 방법을 알려 주지 않는 에러 |
| 의미에 어긋나게 쓴 semantic color. 예: 파괴적이지 않은 동작에 위험 색 |
| 모션만으로 전달한 상태 변화. 애니메이션이 돌지 않을 때 색·아이콘·라벨이 남지 않는 경우 |

원문에 trigger마다 수치가 붙은 것은 320px 너비와 200% 확대뿐이다.[](source:bi-trig-list) 대비 비율은 "요구 비율"이라고만 적고 숫자는 도메인 스킬로 넘긴다(`원문에 명시 없음`).

@callout level=open-question title="trigger와 cap이 부딪치는 곳"
- trigger는 모든 지적보다 앞선다. 원문은 cap보다 trigger가 많으면 trigger를 먼저 적고 cap이 몇 개를 뺐는지 말하라고 한다.[](source:bi-trig-rank)
- 같은 문단은 "cap은 보고서를 줄일 수 있어도 막힌 이유를 빠뜨리는 원인이 되어서는 안 된다"고도 한다.[](source:bi-trig-rank)
- 빠진 trigger는 개수만 알리면 되는지, 위치까지 적어야 하는지는 원문에 명시 없음이다. 판정: 15개를 넘는 trigger가 나온 드문 경우에만 갈리는 문제다.

고침은 더 싼 쪽을 먼저 권한다. 여러 방법이 통하면 아래에서 가장 앞선 것을 고른다.[](source:bi-cheap)

@list id=cheap-fix ordered=true
| 삭제. 공간이 대신할 구분선, 빈도 높은 동작의 애니메이션, 네이티브 요소가 이미 해결한 ARIA 속성, 아무도 import하지 않는 ramp |
| 플랫폼 사용. 직접 만든 것 대신 네이티브 요소, 네이티브 컨트롤, 브라우저 기본 focus ring |
| 프로젝트 자산 재사용. 새 값 전에 기존 token, spacing 단계, 모션 곡선 |
| 값 교정. 잘못된 easing, radius, gap, 대비 쌍을 담당 스킬이 준 정확한 값으로 |
| 추가. 새 token, wrapper, media query, 플랫폼이 못 주는 ARIA 속성 |

리뷰 대상 코드가 **삭제**로 고쳐질 것을 새로 더했다면 그것이 지적이고, 그 지적의 **After**는 삭제다.[](source:bi-cheap)

@callout level=warning title="리뷰 요청은 읽기 전용이다"
- 사용자가 지적을 구현해 달라고 함께 요청하지 않으면 소스를 고치지 않는다.[](source:bi-ro)
- 함께 요청받아 구현하면, 합친 보고서를 변경 범위로 삼고 관련 검증을 다시 돌린다.[](source:bi-ro)

@facts
| 지적 상한 | 최대 15개. 개수를 채우려고 부풀리지 않는다(의무)[](source:bi-consol) |
| escalation trigger | 13개. 켜지면 `HIGH`(의무)[](source:bi-trig-list) |
| 도메인 스킬 | 6개. 접근성부터 UI 순서(의무)[](source:bi-dlist) |
| 고침 단계 | 5단계. 삭제 > 플랫폼 > 재사용 > 교정 > 추가(권고: "가장 앞선 것을 고른다")[](source:bi-cheap) |
| 판정 값 | 2개. `Block`, `Approve`[](source:rf-verdict) |

## 보고서는 어떤 모양으로 끝나나 {#output}

보고서는 네 덩어리를 이 순서로 담는다. 지적을 이 형식으로 보고하기 전에는 리뷰가 끝난 것이 아니다.[](source:bi-fmtref)[](source:rf-cov)

| 덩어리 | 담는 것 | 규칙 |
| --- | --- | --- |
| 범위와 coverage | 정확한 범위, stack과 스타일 관례, 프로젝트 파악에서 찾은 문서, 리뷰 경계. 그 뒤 도메인별 coverage 표 | 도메인 여섯 개를 모두 적는다[](source:rf-cov) |
| 지적 | 표 하나. 심각도 순, 그다음 영향이 닿는 범위 순 | 지적이 없으면 표를 빼고 "No actionable interface findings."라고 쓴다[](source:rf-find) |
| Verification | 검사나 조작마다 정확한 명령·단계와 관찰 결과 | 통과한 것과 **Not verified**를 나눈다[](source:rf-ver) |
| Verdict | `Block` 또는 `Approve` 하나 | 아래 표[](source:rf-verdict) |

coverage 표의 열은 `Domain`, `Evidence inspected`, `Result`다. 증거 칸에는 파일, 컴포넌트, 상태, 검사를 적고 결과 칸에는 지적 개수나 `Clear`를 적는다. `Clear`는 "봤고 조치할 지적이 없다"이며, `Not reviewed`는 이유를 적어야 한다.[](source:rf-cov)

지적 표의 열은 `Severity`, `Domain`, `Location`, `Before`, `After`, `Why`다.[](source:rf-find)

| 열 | 쓰는 법 |
| --- | --- |
| `Domain` | 담당 스킬 이름에서 `better-` 접두사를 뗀 것 |
| `Location` | `path/to/file:line`. 소스 파일이 없으면 정확한 화면과 컴포넌트 |
| `Before` / `After` | 현재 구현과 실행 가능한 대체안. 각각 자기 칸에 |
| `Why` | 위반한 원칙과 사용자 영향 |

| 판정 | 조건 | 비고 |
| --- | --- | --- |
| `Block` | `HIGH` 지적이 하나 이상 남았다 | {bad:고치기 전에는 내보내지 않는다}[](source:rf-verdict) |
| `Approve` | `HIGH` 지적이 남지 않았다 | `MEDIUM`·`LOW`는 표에 남아 할 일이 된다. 검사한 도메인만 덮고, `Not reviewed` 도메인 이름을 판정 줄에 모두 적는다[](source:rf-verdict) |

변경 리뷰를 `interface-review`가 돌려주면, 그쪽 출력 형식을 쓴다. 범위 블록, `Status` 열, pre-existing 절이 더해진다. 이때 cap과 판정은 `Introduced`와 `Regression` 지적만 센다. 그래서 `Pre-existing` 지적만 있는 변경은 `Approve`다.[](source:rf-chg)[](source:bi-change)

끝내기 전에 아래 실수를 점검한다.[](source:bi-mist)

| 실수 | 고침 |
| --- | --- |
| 도메인별로 지적 절을 따로 둔다 | 하나의 표로 합쳐 심각도, 영향 범위 순으로 둔다 |
| 렌더링 주장의 증거가 소스뿐이다 | 렌더된 상태를 보거나 **Not verified**로 표시한다 |
| 표면이 사소하다며 접근 가능한 이름이나 focus ring 누락을 `MEDIUM`으로 둔다 | trigger는 보는 즉시 `HIGH`다 |
| coverage 행의 증거 칸에 파일·컴포넌트·검사가 없다 | 그 도메인을 보거나 이유와 함께 `Not reviewed`로 둔다 |
| 담당 스킬이 불리지 않았는데 도메인을 `Clear`로 둔다 | `Not reviewed`로 두고 스킬 이름을 적는다 |
| 같은 증상을 컴포넌트마다 행으로 나눈다 | 공유 token·컴포넌트에 한 행, 위치를 모두 나열한다 |
| **After**가 wrapper, token, ARIA 속성을 더한다 | 삭제나 네이티브 요소로 먼저 고쳐지는지 본다 |
| 프로젝트가 쓰지 않는 라이브러리·스타일 방식으로 고침을 쓴다 | 프로젝트 방식으로 다시 쓴다 |

## 흐름 속 위치 {#position}

@workflow id=interface-position title="better-interface 앞뒤"
| p-user | 사용자 요청 | external |
| p-ir | interface-review | backend |
| p-bi | better-interface | backend |
| p-dom | 도메인 스킬 6개 | backend |
| p-out | 순위 보고서와 판정 | external |
| p-user > p-ir | 변경 범위 | dashed |
| p-user > p-bi | 화면·흐름·저장소 | emphasis |
| p-ir > p-bi | 범위·status | |
| p-bi > p-dom | 순서대로 위임 | |
| p-bi > p-out | | |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| 사용자(앞) | 화면·흐름·feature·저장소 리뷰 요청 | - | 이 스킬은 호출 제한이 없어 모델이 켤 수도 있다[](source:bi-fm) | - |
| `interface-review`(앞) | 범위 블록, 영향받는 화면, 모든 지적의 status | 변경 요청이면 이 스킬이 사용자에게 실행을 부탁한다 | 의무형. `interface-review`가 없으면 그쪽이 해석한 범위와 파일 목록만 보고하고 멈춘다. 심각도·cap·판정은 이 스킬 소유다[](source:ir-own)[](source:ir-hand) | r67 |
| `interface-review`(앞, 요청하는 방향) | - | 변경 범위 요청 | 의무형. 변경 범위를 직접 해석하지 않고 사용자에게 실행을 부탁한다. 그 스킬은 사용자 호출 전용이다[](source:bi-change)[](source:ir-fm) | r66 |
| `better-accessibility`(뒤 1번) | 도메인 리뷰 증거 | 리뷰할 인터페이스 | 의무형. 담당 스킬을 모두 불러 도메인 리뷰를 끝낸 뒤 합친다. 없으면 `Not reviewed`[](source:bi-dlist)[](source:bi-dmiss) | r60 |
| `better-layout`(뒤 2번) | 도메인 리뷰 증거 | 리뷰할 인터페이스 | r60과 같은 조건[](source:bi-dlist) | r61 |
| `better-writing`(뒤 3번) | 도메인 리뷰 증거 | 리뷰할 인터페이스 | r60과 같은 조건[](source:bi-dlist) | r62 |
| `better-typography`(뒤 4번) | 도메인 리뷰 증거 | 리뷰할 인터페이스 | r60과 같은 조건[](source:bi-dlist) | r63 |
| `better-colors`(뒤 5번) | 도메인 리뷰 증거 | 리뷰할 인터페이스 | r60과 같은 조건[](source:bi-dlist) | r64 |
| `better-ui`(뒤 6번) | 도메인 리뷰 증거 | 리뷰할 인터페이스 | r60과 같은 조건[](source:bi-dlist) | r65 |
| 도메인 스킬 4개(뒤에서 되가리킴) | - | - | 참고. 도메인 스킬이 자기 심각도 설명에서 이 스킬의 escalation trigger를 가리키고, 켜지면 `HIGH`라고 말한다. 대상: `better-ui`, `better-colors`, `better-typography`, `better-accessibility`[](source:dom-ui)[](source:dom-col)[](source:dom-typ)[](source:dom-a11y) | r100~r103 |
| `variant` | - | - | 참고. 후보를 만들 뿐 순위를 매기지 않는다. 후보가 picker에 들어가기 전에 이 스킬의 trigger를 통과해야 한다[](source:var-scope)[](source:var-floor) | r105 |
| `break` | - | - | 참고. 기준에 맞춘 리뷰는 이 스킬 몫이다[](source:brk-scope) | r113 |
| `afk` | - | - | 참고. 인터페이스 리뷰는 이 스킬 몫이다. `afk`가 이 스킬을 실행한다는 지시는 없다[](source:afk-scope) | r125 |
| `explain-interface` | - | - | 참고. 기준에 맞춘 리뷰는 이 스킬 몫이다. `explain-interface`는 평가하지 않고 설명한다[](source:exp-scope) | r130 |
| `impeccable`(묶음 밖) | - | - | 같은 계열(추론). 둘 다 UI를 여러 관점에서 비평·감사한다. 서로를 부르지 않는다[](source:bi-fm)[](source:imp-desc) | r152 |

그림은 이 스킬의 앞뒤만 그렸다. 사용자에게서 `interface-review`로 가는 점선은 사용자가 직접 부르는 경로다. r66은 사용자에게 부탁하는 경로라 그림에서 뺐고, r100~r103·r105·r113·r125·r130은 참고나 역할 구분이라, r152는 묶음 밖이라 표에만 남겼다.

전체 흐름은 `design/_group-interface-audit/interface-audit.html`에 있다. 관계 근거는 `design/relations.md`의 rel-id로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 텍스트 파일은 3개, 합계 11,008B다. `SKILL.md` 8,779B, `review-format.md` 2,126B, `agents/openai.yaml` 103B를 모두 읽었다. 구조·표본만 본 파일은 0개다.
- 관계 확인용으로 다른 스킬 11곳의 해당 줄만 읽었다. `interface-review` 1~5줄·11줄·93~97줄, `variant` 11줄·27~30줄, `break` 11줄, `afk` 11줄, `explain-interface` 11줄, `impeccable` 3줄, `better-accessibility` 128줄, `better-colors` 84줄, `better-typography` 154줄, `better-ui` 122줄이다. 도메인 스킬 여섯 개의 본문 규칙은 읽지 않았다.
- 제외한 파일: 번역본과 바이너리는 이 폴더에 없다(`find`로 확인, 파일 3개).
- 원문 대조 범위: 호출 제한 필드(없음), 번호 붙은 단계 5개(범위·변경 넘김·프로젝트 파악·도메인 스킬·검증)와 나머지 규칙 절, 도메인 순서 6개, escalation trigger 13개, 심각도 3단계, 고침 단계 5개, 지적 상한 15, 끝내기 전 점검 8행, 출력 형식 4덩어리와 판정 2개, 변경 리뷰 연결을 모두 대조했다. 관계 행 r60~r67, r100~r103, r105, r113, r125, r130, r152는 원장과 원문을 다시 대조했다.
- 분석 중 바뀐 파일: 없음. `design/` 아래 작업 트리는 commit `0465878` 그대로다.
- 사람 검토: 미실시.

@callout level=open-question title="확인하지 못한 것"
- 사용자 승인이나 중간 확인 지점은 `원문에 명시 없음`이다. 원문이 사람이 개입하는 곳으로 적은 것은 변경 리뷰를 `interface-review`로 보내는 것과 구현 요청 두 곳뿐이다.
- 지적이 15개를 넘을 때 어느 것을 자르는지는 위 trigger 우선 규칙 말고 `원문에 명시 없음`이다.
- 도메인 스킬 여섯 개가 정하는 구체 값(대비 비율, easing 값 등)은 이 페이지가 다루지 않는다. 각 스킬 페이지에서 확인한다.
- 이 스킬을 실제로 불러 리뷰를 받아 보지 않았다. 보고서가 형식을 지키는지는 확인하지 않았다.
