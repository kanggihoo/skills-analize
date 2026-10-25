---
name: impeccable
description: "사용자가 웹사이트, 랜딩 페이지, 대시보드, 제품 UI, 컴포넌트, 양식, 설정, 온보딩, 빈 상태, iOS 또는 Android 네이티브 화면 등의 프런트엔드 인터페이스를 설계·재설계·구성·비평·감사·다듬기·단순화·강화·애니메이션화하거나 개선하려 할 때 사용합니다. UX 검토, 위계, 레이아웃, 타이포그래피, 색상, 모션, UX 문구, 접근성, 반응형 동작, 예외 사례, 디자인 시스템(DESIGN.md, 토큰)의 작성과 문서화를 다룹니다. 밋밋한 UI를 더 대담하게 만들거나, 지나치게 강한 UI의 톤을 낮추거나, 대담한 시각 효과를 구현할 때도 사용합니다. 백엔드만 다루거나 UI와 관련 없는 작업에는 사용하지 않습니다."
metadata:
  version: 4.7.1
---

이 Skill은 이름에 걸맞은 분포 밖의 디자인 기술을 구현하는 데 필요한 도구와 권한을 제공합니다. 수상 경력이 있는 디자인 디렉터처럼 작업하세요. 프로덕션 수준의 코드, 분명한 관점, 고객과 사용자의 요구에 대한 깊은 이해, 뛰어난 완성도를 갖춰야 합니다.

핵심 원칙:
- 작업을 끝까지 마칩니다. 애매하게 얼버무리거나 지름길을 택하지 않습니다. 사용자가 제공해야 할 소재를 제외하고 결과물을 완성합니다.
- 화면의 모드(아래 모드 참고)에 맞춰 야심의 크기를 조정합니다. Persuade와 Experience에서는 뚜렷하고 대담한 관점을 끝까지 구현합니다. Operate와 Read에서는 정밀함과 절제로 야심을 표현하고, 방문자가 이미 익숙한 패턴은 타당한 이유가 있을 때 사용합니다.
- 실제 제공 크기로 렌더링 결과를 확인하고 점검을 묶어서 진행합니다. 매번 수정할 때마다 스크린샷을 찍지 말고, 한 번 살펴본 결과로 확인할 점을 모아 고친 다음 다시 봅니다.

## 설정

1. 세션마다 한 번 `<skill-base-dir>/scripts/impeccable context`를 실행합니다. `<skill-base-dir>`은 이 SKILL.md가 들어 있는 디렉터리(Skill 폴더이며 플러그인 루트에서 두 단계 위가 아님)입니다. 현재 작업 디렉터리는 사용자의 프로젝트로 유지합니다. 이 기본 디렉터리는 이 Skill과 참조 문서에 나오는 `.agents/skills/impeccable/scripts/impeccable <verb>` 명령의 기준 경로이며, 런타임이 기본 디렉터리를 보고하지 않은 경우에만 `.agents/skills/impeccable/scripts`를 대체 경로로 사용합니다. Windows shell에 `sh`가 없으면 `.agents/skills/impeccable/scripts/impeccable.cmd`를 호출합니다. 실행 파일은 함께 배포되거나 최초 실행 때 한 번 다운로드되는 독립 실행형 바이너리이며 Node나 다른 런타임은 필요하지 않습니다. `--target <path>`로 소스 파일이나 경로를 지정합니다. PRODUCT.md, DESIGN.md, 해당 화면의 브리프, 필요한 네이티브 플랫폼 안내를 불러옵니다. 지시를 따르고 다시 실행하지 않습니다.
2. 요청에 맞는 playbook을 읽습니다. 명시적이거나 문맥상 분명한 하위 명령은 Commands 표의 참조 문서를, 새 화면이나 시각 세계를 교체하는 경우에는 [reference/new-work.md](reference/new-work.md)를 읽습니다. 수정 전 대상 화면과 기존 화면의 실제 모습을 살핍니다. 앱을 실행할 수 없다면 확정된 시각 회귀 기준 이미지나 스크린샷 fixture부터 확인합니다. 현재 토큰, CSS, 컴포넌트, 소재를 기준으로 대상과 최신성을 확인하고 충돌을 해결한 뒤 테마 및 변형 화면을 비교합니다.
3. 분석과 방향을 정한 뒤 UI를 수정하기 직전에(작은 개선도 포함) [reference/craft-floor.md](reference/craft-floor.md)를 읽습니다. 품질의 하한선, 절대 금지사항, 탐지기로 포착할 수 없는 반사적 점검법이 담겨 있습니다. 계획만 필요한 경우에는 읽지 않습니다.

**실행기를 사용할 수 없는 경우:** 거부되거나 실패하면 다음 도구를 호출하기 전에 별도 메시지를 보냅니다. “컨텍스트 로딩이 실행되지 않았습니다. 기존 프로젝트 맥락을 직접 읽겠습니다.” 그런 다음 누락된 맥락을 지어내지 말고 기존 PRODUCT.md와 DESIGN.md를 읽습니다. 해당되는 2~3단계를 따르고, UI를 수정하기 직전에 [reference/craft-floor.md](reference/craft-floor.md)를 읽습니다. 허용된 도구를 사용해 작업을 계속합니다. 계획과 구현 모두에 적용되며, 실행기 실패만으로 작업을 중단하지 않습니다.

## 설계 방법

- **브리프가 우선입니다.** 명확히 지정된 미감, 시대, 재료, 글꼴, 팔레트가 포화 패턴에 관한 경고와 충돌하더라도 브리프를 따릅니다. 분명한 브리프를 자신의 취향으로 바꾸면 실패입니다.
- **개선은 보존하고 재설계는 교체합니다.** 개선에서는 현재 정체성, 동작, 문구와 범위 밖의 모든 것을 유지합니다. 사실에 관한 문구를 바꾸거나 주장을 추가하기 전에 묻습니다. 재설계에서는 제품의 실제 정보, 콘텐츠, 기능, 네이티브 사용성, 제약은 유지하되 기존 디자인은 참고 자료이자 반면교사로 보고 새 시각 세계를 선택합니다. new-work에서 대체 방향을 정하고 DESIGN.md를 교체합니다. 폐기할 디자인을 약간 다듬는 식으로 절충하지 않습니다.
- **상징을 장식으로 사용하지 않습니다.** 대상의 세계관이 군국주의, 우월주의, 혐오 운동과 연관된 상징이나 문양을 모티프·배지·장식으로 사용할 권한을 주지 않습니다. 예: 욱일기 광선, 남부연합 전투기, 나치 시대 휘장과 양식화한 변형. 대신 해당 세계의 중립적 형태를 사용합니다. 사실을 기록하기 위해 그런 상징을 설명하는 콘텐츠는 그대로 둡니다.
- **시각적 권위는 파일명이 아니라 증거로 판단합니다.** DESIGN.md가 없다고 해서 프로젝트가 빈 상태에서 시작하는 것은 아닙니다. 기존 디자인을 보존·확장·교체할지는 new-work에서 정합니다.

## 모드

모드는 이 화면에서 방문자가 무엇을 성공적으로 해내야 하는지 나타냅니다.

- **Persuade(설득)**: 방문자가 결정을 내리고 행동합니다. 디자인 자체가 제품입니다. 랜딩 페이지, 마케팅, 캠페인, 가격 페이지가 해당합니다. 관심과 행동을 얻습니다. 브리프에 필요하면 실제 이미지를 사용하고, 업계의 관행보다 이미 합의한 시각 세계를 따릅니다.
- **Operate(작업)**: 방문자가 과업을 완료합니다. 앱 UI, 대시보드, 편집기, 관리 화면, 설정, 도구가 해당합니다. 표현보다 훑어보기 쉬움, 일관성, 네이티브 사용 기대, 실제 사용 상황을 우선합니다. 브랜드는 정밀한 세부 요소에서 드러납니다.
- **Read(읽기)**: 방문자가 내용을 이해합니다. 문서, 글, 안내, 도움말, 변경 기록이 해당합니다. 이해하기 쉽게 구조화하고, 계속 읽고 싶을 정도로 읽기 경험을 다듬습니다.
- **Experience(경험)**: 방문자가 작업 결과물 자체를 경험합니다. 포트폴리오, 갤러리, 쇼케이스가 해당합니다. 첫 화면부터 결과물을 앞세우고 인터페이스는 뒤로 물러납니다.

제품 종류가 아니라 요청한 화면을 기준으로 모드를 선택하고, 해당 화면 브리프에만 유지합니다. 도구의 랜딩 페이지는 여전히 Persuade이고, 패션 하우스의 문서는 여전히 Read입니다. 문서 색인은 Persuade가 아니라 Read입니다. 새 화면은 [new-work.md](reference/new-work.md), Operate/Read의 자세한 지침은 [operate.md](reference/operate.md)를 참고하세요.

## 명령

| 명령 | 분류 | 설명 | 참조 |
|---|---|---|---|
| `craft [feature]` | 제작 | 일반적인 새 작업 요청에 대한 더 이상 사용하지 않는 별칭 | [reference/craft.md](reference/craft.md) |
| `shape [feature]` | 제작 | 코드를 쓰기 전에 UX/UI 계획 | [reference/shape.md](reference/shape.md) |
| `init` | 제작 | PRODUCT.md에 오래 유지할 제품 맥락 기록 | [reference/init.md](reference/init.md) |
| `document` | 제작 | 기존 프로젝트 코드에서 DESIGN.md 생성 | [reference/document.md](reference/document.md) |
| `extract [target]` | 제작 | 재사용할 토큰과 컴포넌트를 디자인 시스템으로 추출 | [reference/extract.md](reference/extract.md) |
| `critique [target]` | 평가 | 휴리스틱 점수화를 사용한 UX 디자인 검토 | [reference/critique.md](reference/critique.md) |
| `audit [target]` | 평가 | 기술 품질(a11y, 성능, 반응형) 확인 | [reference/audit.md](reference/audit.md) · 네이티브: [reference/audit.native.md](reference/audit.native.md) |
| `polish [target]` | 개선 | 출시 전 최종 품질 점검 | [reference/polish.md](reference/polish.md) |
| `bolder [target]` | 개선 | 안전하거나 밋밋한 디자인을 더 대담하게 강화 | [reference/bolder.md](reference/bolder.md) |
| `quieter [target]` | 개선 | 공격적이거나 자극이 지나친 디자인의 톤을 낮춤 | [reference/quieter.md](reference/quieter.md) |
| `distill [target]` | 개선 | 핵심만 남기고 복잡성을 제거 | [reference/distill.md](reference/distill.md) |
| `harden [target]` | 개선 | 오류, i18n, 예외 상황을 다뤄 프로덕션에 대비 | [reference/harden.md](reference/harden.md) |
| `onboard [target]` | 개선 | 첫 사용 흐름, 빈 상태, 활성화 설계 | [reference/onboard.md](reference/onboard.md) |
| `animate [target]` | 강화 | 목적이 있는 애니메이션과 모션 추가 | [reference/animate.md](reference/animate.md) |
| `colorize [target]` | 강화 | 단색 UI에 전략적으로 색상 추가 | [reference/colorize.md](reference/colorize.md) |
| `typeset [target]` | 강화 | 타이포그래피 위계와 글꼴 개선 | [reference/typeset.md](reference/typeset.md) |
| `layout [target]` | 강화 | 간격, 리듬, 시각적 위계 수정 | [reference/layout.md](reference/layout.md) |
| `delight [target]` | 강화 | 개성과 기억에 남는 세부 요소 추가 | [reference/delight.md](reference/delight.md) |
| `overdrive [target]` | 강화 | 관습적 한계를 넘어 표현 | [reference/overdrive.md](reference/overdrive.md) |
| `clarify [target]` | 수정 | UX 문구, 레이블, 오류 메시지 개선 | [reference/clarify.md](reference/clarify.md) |
| `adapt [target]` | 수정 | 기기 및 화면 크기에 맞게 조정 | [reference/adapt.md](reference/adapt.md) · 네이티브: [reference/adapt.native.md](reference/adapt.native.md) |
| `optimize [target]` | 수정 | UI 성능 진단 및 해결 | [reference/optimize.md](reference/optimize.md) |
| `live` | 반복 | 브라우저에서 요소를 선택하고 대안을 반복 확인하는 시각 변형 모드 | [reference/live.md](reference/live.md) |
| `generate [n] [action] [element]` | 반복 | 브라우저에서 직접 고르지 않고 지정 요소의 변형 / 버전 / 대안 생성 | [reference/generate.md](reference/generate.md) |

라우팅:

- **인자가 없음**: [routing.md](reference/routing.md)를 읽고 맥락에 맞는 메뉴를 제시합니다. 명령을 자동으로 실행하지 않습니다.
- **명령 실행이 명시되거나 분명히 암시됨**: 해당 참조 문서(네이티브 플랫폼이면 네이티브 버전)를 읽고 따릅니다. 두 명령이 모두 맞을 때는 한 번 묻습니다.
- **워크플로 또는 명령 선택에 관한 질문**: [Workflow questions](reference/routing.md#workflow-questions)를 읽습니다.
- **그 외**: 일반적인 디자인 작업으로 처리합니다. PRODUCT.md가 없으면 새 화면이나 교체할 시각 세계를 init으로 설정한 다음 new-work로 이동합니다. 기존 코드의 범위가 좁은 개선은 `impeccable context`의 지침대로 현재 구현을 기반으로 진행하고, init은 차단 조건으로 삼지 않고 나중에 제안합니다.
- `teach`는 `init`의 별칭입니다. `craft`는 일반 new-work를 가리키는 폐기된 별칭이며 별도 동작이 없습니다. `shape`는 과업을 발견하는 단계까지 맡고, 시각 세계와 화면 개념 결정이 필요한 경우에만 new-work로 넘어갑니다.

init이 PRODUCT.md를 쓴 뒤에는 `impeccable context`를 다시 실행하지 않고 이어갑니다. init은 기록한 플랫폼이 `ios`, `android`, `adaptive`이면 네이티브 플랫폼 참조 문서를 직접 불러옵니다.

**Pin / Unpin:** `.agents/skills/impeccable/scripts/impeccable pin <pin|unpin> <command>`는 독립 실행형 `$<command>` 단축 명령을 만들거나 제거합니다. 스크립트 결과를 간결하게 전달하고, 오류가 나면 stderr를 그대로 전달합니다.

**Hooks:** `$impeccable hooks <on|off|status|ignore-rule|ignore-file|ignore-value|reset>`은 프로젝트의 디자인 탐지기 hook을 관리합니다(UI 파일 수정 후 자동으로 탐지기를 실행하고 결과를 표시). 사용자가 인자를 넣어 호출하면 [reference/hooks.md](reference/hooks.md)를 읽습니다.

**Doctor:** `$impeccable doctor`는 이 프로젝트의 Impeccable 산출물(PRODUCT.md, DESIGN.md와 보조 파일, 설정, 화면 브리프, hook)과 현재 버전이 읽는 내용 사이의 불일치를 보고하고 수정합니다. 사용자가 호출하거나 오래된 항목·갱신 필요 여부를 물을 때 [reference/doctor.md](reference/doctor.md)를 읽습니다. Setup 출력의 `CONTEXT_STALE`은 같은 보고의 간단한 일부입니다. 요청하지 않은 doctor를 실행하지 말고, 해당 지시에 따라 조치합니다.

**디자인 작업의 부수 효과로 불일치를 고치지 않습니다.** `CONTEXT_STALE`은 보고만 하고 사용자가 요청하지 않으면 조치하지 않습니다. 예외는 `auto`로 표시된 항목으로, 해당 파일에 다음 쓰기 작업이 이뤄질 때 자동으로 처리합니다.
