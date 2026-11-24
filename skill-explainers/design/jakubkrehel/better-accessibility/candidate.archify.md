# better-accessibility — WCAG 2.2 기준으로 키보드·포커스·ARIA·폼·확대를 리뷰하고 수정한다 {#overview}

better-accessibility는 웹 인터페이스의 시맨틱 구조, 키보드와 포커스 동작, 스크린 리더용 이름과 알림, 폼 입력, 클릭 영역, 모션·확대 대응을 WCAG 2.2 기준으로 검토하고 프로젝트의 스타일 체계에 맞춰 수정안을 내는 스킬이다.[](source:intro)

- 접근성 리뷰나 수정을 요청받거나, `better-interface` 통합 리뷰의 1번 도메인이나 `interface-review`·`afk` 실행 중 접근성 판단이 필요할 때 켜진다.[](source:fm)[](source:bi-rel)[](source:ir-rel)[](source:afk-rel)
- 결과로 남는 것은 위반한 WCAG 2.2 조항 번호와 `path/to/file:line` 근거, 수정 전후 코드, `Block` 또는 `Approve` 판정이다. `better-interface`가 호출할 때는 통합 보고서 형식과 심각도로 대체된다.[](source:criteria)[](source:ref-rep)
- 다른 스킬과의 관계: `better-interface`·`interface-review`·`afk`가 이 스킬을 `호출`하고, 이 스킬은 렌더링 대비 측정을 `better-colors`에 `호출`한다. `better-layout`·`better-typography`·`better-writing`·`better-ui`·`build-design`·`teardown`과는 소유 영역을 구분하는 `참고` 관계다.[](source:bi-rel)[](source:ir-rel)[](source:afk-rel)[](source:names-color)[](source:intro)[](source:typ-rel)[](source:ui-rel)[](source:wri-rel)[](source:bld-rel)[](source:td-rel)
- 하지 않는 것: AAA 기준이나 관례를 `HIGH` 위반으로 올리지 않고, 대비 측정이 실패해도 요청받지 않았으면 색상을 임의로 고치지 않으며, 점검하지 않은 영역을 `Approve`로 처리하지 않는다.[](source:criteria)[](source:names-color)[](source:ref-rep)

@answer scope="design/jakubkrehel/better-accessibility · 원본 파일 9개 · 지시상 동작"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize.git repo_revision=caba31d31edb29a8f8573e8766a333a2e4ac93e6
@source fm title="frontmatter: name·description" path=design/jakubkrehel/better-accessibility/SKILL.md lines=1:4
@source intro title="개요, 두 차례 점검 순서, 도메인별 소유권 경계" path=design/jakubkrehel/better-accessibility/SKILL.md lines=8:12
@source criteria title="지적 근거 기준(WCAG 2.2 A/AA)과 권고 구분" path=design/jakubkrehel/better-accessibility/SKILL.md lines=14:16
@source native title="네이티브 요소 우선과 disabled 대 aria-disabled" path=design/jakubkrehel/better-accessibility/SKILL.md lines=18:24
@source focus-kbd title="포커스 링, 키보드 지원, 포커스 트랩과 SPA 라우트 이동" path=design/jakubkrehel/better-accessibility/SKILL.md lines=26:44
@source hit title="최소 hit area, 충돌 방지, 장식 레이어, 드래그 대안" path=design/jakubkrehel/better-accessibility/SKILL.md lines=46:52
@source forms title="폼 레이블, autocomplete, 제출 시 검증과 오류 알림" path=design/jakubkrehel/better-accessibility/SKILL.md lines=54:62
@source names-color title="접근 가능한 이름, 색 외 보조 단서, 대비 기준과 better-colors 위임" path=design/jakubkrehel/better-accessibility/SKILL.md lines=64:80
@source motion-zoom title="reduced motion, 5초 타이머, 동적 알림, 대체 텍스트, 확대와 리플로우" path=design/jakubkrehel/better-accessibility/SKILL.md lines=82:106
@source finish title="마무리 전 자가 점검 13개 패턴과 브라우저 유무별 검증" path=design/jakubkrehel/better-accessibility/SKILL.md lines=108:130
@source ref-sem title="시맨틱 요소, ARIA 4원칙, 버튼 vs 링크, 비활성 상태" path=design/jakubkrehel/better-accessibility/semantics-and-aria.md lines=1:79
@source ref-focus title="포커스 링, skip link, tabindex, 모달 트랩, APG 키 맵" path=design/jakubkrehel/better-accessibility/focus-and-keyboard.md lines=1:141
@source ref-hit title="hit area 확장, 겹침 해소, pointer-events, 드래그·제스처 대안" path=design/jakubkrehel/better-accessibility/hit-areas.md lines=1:94
@source ref-forms title="폼 레이블, 오류 연결, autocomplete·inputmode, 제출 중 버튼 처리" path=design/jakubkrehel/better-accessibility/forms.md lines=1:78
@source ref-motion title="prefers-reduced-motion 분기, 자동 재생·타이머, 320px/400% 리플로우" path=design/jakubkrehel/better-accessibility/motion-and-zoom.md lines=1:47
@source ref-sr title=".sr-only, live region 3종, alt 기준, SVG·영상·오디오" path=design/jakubkrehel/better-accessibility/screen-readers.md lines=1:94
@source ref-rep title="단독 리뷰 심각도·표 형식과 escalation trigger" path=design/jakubkrehel/better-accessibility/reporting.md lines=1:14
@source yaml title="UI 표시 이름과 짧은 설명" path=design/jakubkrehel/better-accessibility/agents/openai.yaml lines=1:3
@source bi-rel title="better-interface 1번 도메인 로드 규칙" path=design/jakubkrehel/better-interface/SKILL.md lines=44:54
@source ir-rel title="interface-review 제거 신호의 better-accessibility 소유 항목" path=design/jakubkrehel/interface-review/removed-signals.md lines=7:11
@source typ-rel title="better-typography와의 제목 구조·대비 판정 경계" path=design/jakubkrehel/better-typography/SKILL.md lines=10:10
@source ui-rel title="better-ui와의 3:1 경계·포커스 링·아이콘 버튼 이름 경계" path=design/jakubkrehel/better-ui/SKILL.md lines=16:28
@source wri-rel title="better-writing과의 오류 마크업·알림·접근성 속성 경계" path=design/jakubkrehel/better-writing/SKILL.md lines=12:12
@source wri-btn title="better-writing 아이콘 버튼 이름 속성 경계" path=design/jakubkrehel/better-writing/SKILL.md lines=57:57
@source wri-lbl title="better-writing 가시적 레이블 요건 경계" path=design/jakubkrehel/better-writing/SKILL.md lines=120:120
@source afk-rel title="afk 5단계 구현의 소유 도메인 스킬 통과 의무" path=design/jakubkrehel/afk/SKILL.md lines=95:95
@source bld-rel title="build-design의 도메인 충돌 경계" path=design/jakubkrehel/build-design/SKILL.md lines=12:12
@source bld-rep title="build-design 도메인 충돌 보고" path=design/jakubkrehel/build-design/SKILL.md lines=67:67
@source td-rel title="teardown의 접근성 임베딩 참조" path=design/jakubkrehel/teardown/SKILL.md lines=14:14

## 어떻게 동작하나 {#flow span=12}

원칙형이다. 일곱 분야의 WCAG 2.2 규칙과 자가 점검 표에 따라 판단하고 수정안을 제시한다.

| 적용 상황 | 참조 파일 | 바뀌는 판단 | 출력 사례 |
| --- | --- | --- | --- |
| 판단 기준과 단독 보고 | `SKILL.md`, `reporting.md` | WCAG 2.2 Level A/AA 조항·보조기술 작업 차단·escalation trigger(켜지면 표면이 사소해도 `HIGH`인 증상)만 정식 지적으로 올리고, AAA·APG 관례·44px 휴리스틱은 권고로 낮춘다. | 5열 지적 표(Severity·Location·Before·After·Why)와 `Block`/`Approve` 판정 결과[](source:criteria)[](source:ref-rep) |
| 시맨틱 요소·ARIA·비활성 상태 | `SKILL.md`, `semantics-and-aria.md` | `<div onClick>` 대신 `<button>`/`<a href>`를 우선 쓰고, 비활성 컨트롤은 `disabled`가 기본이며 포커스가 필요할 때만 `aria-disabled="true"`를 쓴다(`disabled`와 동시 사용 금지). | `<div onClick={...}>`를 `<button>`으로 교체하고 중복 `role="button"` 삭제[](source:native)[](source:ref-sem) |
| 포커스 링·키보드·오버레이 이동 | `SKILL.md`, `focus-and-keyboard.md` | `:focus-visible`에 3:1 이상 대비 링을 유지하고 양수 `tabindex`를 금지하며, 모달은 `<dialog>` `showModal()`이나 배경 `inert`로 포커스를 가뒀다가 닫힐 때 트리거로 돌려보낸다. | `outline-none` 제거·커스텀 링 3:1 확인, SPA 이동 시 `document.title` 갱신 후 `<h1>` 포커스[](source:focus-kbd)[](source:ref-focus) |
| hit area·드래그·제스처 대안 | `SKILL.md`, `hit-areas.md` | WCAG 2.5.8 AA 최소 `24×24px`(휴리스틱 터치 `44×44px`, 데스크톱 `40×40px`)을 넘기고 겹침을 막으며, 드래그(2.5.7)·멀티포인트 제스처(2.5.1)마다 단일 포인터 대안을 둔다. | `<button>`/`<label>` 가상 요소로 hit area 확장, 장식 레이어에 `pointer-events: none` 추가[](source:hit)[](source:ref-hit) |
| 폼 레이블·오류 안내·자동완성 | `SKILL.md`, `forms.md` | placeholder 대신 `<label for>`나 감싸는 `<label>`을 붙이고 사용자 정보에 `autocomplete`(1.3.5)를 넣으며, 제출 버튼 비활성화 대신 제출 시 검증해 첫 오류 필드에 포커스한다. | `disabled={!isValid}` 제거, `aria-invalid="true"`·`aria-describedby` 연결, 전송 중 `aria-disabled="true"` 유지[](source:forms)[](source:ref-forms) |
| 모션·타이머·확대 리플로우 | `SKILL.md`, `motion-and-zoom.md` | 이동·크기·블러는 `@media (prefers-reduced-motion: no-preference)` 안에 두고, 5초 초과 자동 이동·업데이트(2.2.2)에 일시정지를 주며, 200% 확대(1.4.4)·320px 리플로우(1.4.10)를 통과시킨다. | 액션·오류 토스트 자동 사라짐 금지, `maximum-scale=1`·`user-scalable=no` 제거[](source:motion-zoom)[](source:ref-motion) |
| 스크린 리더·접근 가능한 이름·대비 | `SKILL.md`, `screen-readers.md` | 아이콘 전용 컨트롤에 `aria-label`을 두고, 동적 알림을 `aria-describedby`·안정적 빈 `role="status"`·`role="alert"`로 나누며, 색 단독 상태(1.4.1)를 금지하고 4.5:1/3:1 대비 기준 적용 여부를 판정한다. | `{msg && <div role="status">}` 대신 빈 `role="status"`를 먼저 마운트, 장식 이미지 `alt=""` 지정[](source:names-color)[](source:ref-sr)[](source:finish) |

리뷰는 두 차례 순회로 진행한다. 먼저 마우스 없이 모든 흐름을 마칠 수 있는지 키보드 전용으로 훑고, 이어서 모든 컨트롤이 이름·역할·상태를 알리는지 스크린 리더 관점으로 훑는다.[](source:intro) 판단이 애매할 때는 커스텀 재구현 대신 플랫폼 기본 동작을 고르고, ARIA를 더하기보다 빼는 쪽을 택한다.[](source:intro) 단독 리뷰는 `reporting.md` 형식으로 `Block` 또는 `Approve`를 내지만, `better-interface`가 호출하면 그쪽 보고서 형식과 심각도로 대체된다.[](source:ref-rep)

## 누가 켜고 어느 스킬과 이어지나 {#relations span=12}

@facts
| 직접 켜는 방법 | 모델 호출형이다(`description` 기준 모델이 판단해 켠다). frontmatter에 호출 제한 필드가 없다.[](source:fm) |
| 성격 | WCAG 2.2 기반 접근성 규칙을 소유해 단독 리뷰를 수행하고 `better-interface`·`interface-review`·`afk`에 기준을 제공하는 도메인 스킬.[](source:intro)[](source:bi-rel) |

| 누가 | 누구를 | 관계 | 언제 |
| --- | --- | --- | --- |
| better-interface {#rel-r46} | **이 스킬** | 호출 | 의무: `better-interface`가 1번 순서로 로드·리뷰한 뒤 결과를 통합한다. 형식과 심각도는 `better-interface`가 대체한다(사용자 개입 없음).[](source:bi-rel) |
| interface-review {#rel-r56} | **이 스킬** | 호출 | diff의 제거 신호(포커스·ARIA·`alt`·`prefers-reduced-motion` 등) 및 이미지 변경 시 확인을 위임한다(사용자 개입 없음).[](source:ir-rel) |
| **이 스킬** {#rel-r62} | better-colors | 호출 | 의무: 렌더링 색상 대비 측정은 `better-colors`를 쓴다. 색상 수정은 사용자 요청 시에만 수행한다.[](source:names-color) |
| **이 스킬** {#rel-r63} | better-layout | 참고 | 포커스 가림 방지 패딩, 텍스트 컨테이너 `min-height`, breakpoint 소유권을 참조한다(사용자 개입 없음).[](source:focus-kbd)[](source:motion-zoom) |
| **이 스킬** {#rel-r64} | better-typography | 참고 | 텍스트 크기, iOS `16px` 입력 줌 방지, 언어 메타데이터 소유권을 참조한다(사용자 개입 없음).[](source:intro)[](source:motion-zoom) |
| **이 스킬** {#rel-r65} | better-writing | 참고 | 레이블·오류·`alt` 텍스트 문구 자체의 소유권을 구분한다(사용자 개입 없음).[](source:intro) |
| **이 스킬** {#rel-r66} | better-ui | 참고 | 호버 스타일링과 스크롤 가둠 소유권을 구분한다(사용자 개입 없음).[](source:intro) |
| better-typography {#rel-r70} | **이 스킬** | 참고 | 시맨틱 제목 구조와 대비 통과 판정 소유권을 참조한다(사용자 개입 없음).[](source:typ-rel) |
| better-ui {#rel-r72} | **이 스킬** | 참고 | 폼 입력 3:1 경계 대비·포커스 링·아이콘 버튼의 접근 가능한 이름(accessible name) 규칙 소유로 참조한다(사용자 개입 없음).[](source:ui-rel) |
| better-writing {#rel-r73} | **이 스킬** | 참고 | 아이콘 버튼 접근성 속성·가시적 레이블 필요 여부·실행 취소 토스트 유지 시간 규칙 소유로 참조한다(사용자 개입 없음).[](source:wri-rel)[](source:wri-btn)[](source:wri-lbl) |
| afk {#rel-r75} | **이 스킬** | 호출 | `afk` 5단계 구현 중 UI 작업이 포함되면 소유 도메인 스킬(예: 이 스킬) 규칙을 통과해야 한다(사용자 개입 없음).[](source:afk-rel) |
| build-design {#rel-r84} | **이 스킬** | 참고 | 디자인과 도메인 규칙이 충돌할 때 소유 스킬로 보고하고 준수한다(사용자 개입 없음).[](source:bld-rel)[](source:bld-rep) |
| teardown {#rel-r87} | **이 스킬** | 참고 | 일러스트 제품 임베딩 시 접근성 이름·부품 목록 대안·컨트롤 규칙을 참조한다(사용자 개입 없음).[](source:td-rel) |

@architecture id=relation-map title="better-accessibility와 이어지는 스킬"
| bi | better-interface | backend |
| ir | interface-review | backend |
| afk | afk | backend |
| self | better-accessibility(이 스킬) | backend |
| col | better-colors | backend |
| lay | better-layout | backend |
| typ | better-typography | backend |
| wri | better-writing | backend |
| ui | better-ui | backend |
| bi > self | 호출 | |
| ir > self | 호출 | |
| afk > self | 호출 | |
| self > col | 호출 | |
| self > lay | 참고 | dashed |
| self > typ | 참고 | dashed |
| self > wri | 참고 | dashed |
| self > ui | 참고 | dashed |

@code source=fm language=yaml

## 어떤 파일로 이루어지나 {#files span=12}

| 파일 | 역할 | 읽기·실행 조건 | 쓰는 단계 |
| --- | --- | --- | --- |
| `SKILL.md` | WCAG 2.2 핵심 규칙, 자가 점검 13패턴, 도메인 경계, 브라우저 유무별 검증 | 스킬이 켜지면 읽는다 | 판단 기준과 단독 보고, 시맨틱 요소·ARIA·비활성 상태, 포커스 링·키보드·오버레이 이동, hit area·드래그·제스처 대안, 폼 레이블·오류 안내·자동완성, 모션·타이머·확대 리플로우, 스크린 리더·접근 가능한 이름·대비 |
| `reporting.md` | 단독 리뷰의 심각도, escalation trigger, 표 형식, `Block`/`Approve` 판정 | 단독 리뷰 보고 시 읽는다 | 판단 기준과 단독 보고 |
| `semantics-and-aria.md` | ARIA 4원칙, 버튼 vs 링크 vs `div`, 랜드마크, 접근 가능한 이름 우선순위, 비활성 상태 | 시맨틱·ARIA·비활성 상태를 다룰 때 읽는다 | 시맨틱 요소·ARIA·비활성 상태 |
| `focus-and-keyboard.md` | `:focus-visible`, skip link, `tabindex`, roving tabindex, 모달 트랩, APG 키 맵, SPA 이동 | 포커스·키보드·오버레이를 다룰 때 읽는다 | 포커스 링·키보드·오버레이 이동 |
| `hit-areas.md` | 24px/44px/40px 타깃, 가상 요소 확장, 충돌 해소, `pointer-events: none`, 드래그·제스처 대안 | 타깃 크기·장식 겹침·드래그를 다룰 때 읽는다 | hit area·드래그·제스처 대안 |
| `forms.md` | 레이블 연결, 오류 마크업, `autocomplete`·`inputmode` 표, 전송 중 `aria-disabled` | 폼 입력·검증·제출을 다룰 때 읽는다 | 폼 레이블·오류 안내·자동완성 |
| `motion-and-zoom.md` | `prefers-reduced-motion` 분기, 5초 타이머, 320px/400% 리플로우, `rem`/`em` 쿼리 | 모션·타이머·확대를 다룰 때 읽는다 | 모션·타이머·확대 리플로우 |
| `screen-readers.md` | `.sr-only`, `live region` 3종(`role="status"`, `role="alert"`, `aria-describedby`), `alt`, SVG, 영상·오디오 | 동적 알림·대체 텍스트·SVG·미디어를 다룰 때 읽는다 | 스크린 리더·접근 가능한 이름·대비 |
| `agents/openai.yaml` | UI 표시 이름과 짧은 설명 메타데이터[](source:yaml) | UI가 스킬을 보여 줄 때 쓴다. 지시 본문이 아니다 | 원문에 명시 없음 |

## 무엇을 지키고 언제 멈추나 {#limits span=12}

| 조건 | 결과 | 출처 |
| --- | --- | --- |
| 지적이 WCAG 2.2 A/AA, 보조기술 작업 차단, `reporting.md` `escalation trigger`에 해당하지 않음 | 권고로만 적고 `HIGH`로 올리지 않는다(AAA, APG 관례, `44px`/`40px`, 단일 `<h1>` 포함) | [](source:criteria) |
| 대비 측정 결과 텍스트(4.5:1)·큰 텍스트(3:1)·UI 경계(3:1)가 기준 미달임 | 쌍과 위반 조항만 보고하고, 요청받기 전에는 색상을 수정하지 않는다 | [](source:names-color) |
| 확인된 대체 수단 없는 `outline: none` 또는 포커스 링 3:1 미달 | 금지다. 브라우저 기본 링을 살리거나 검증된 커스텀 링으로 바꾼다 | [](source:focus-kbd)[](source:finish) |
| 양수 `tabindex`, `<div onClick>`, `aria-hidden` 안의 포커스 가능 요소 | 금지다. DOM 순서·네이티브 요소(`<button>`, `<a href>`)로 고치고 `aria-hidden`을 푼다 | [](source:native)[](source:focus-kbd)[](source:finish) |
| 폼 제출 버튼에 `disabled={!isValid}` 사용 또는 붙여넣기 차단 | 금지다(객체 이름 입력 같은 파괴적 확인 제외). 제출 시 검증하고 붙여넣기를 허용한다 | [](source:forms)[](source:finish) |
| `disabled`와 `aria-disabled` 동시 선언, 또는 네이티브 `disabled` 위 툴팁 | 금지다. 둘 중 하나만 쓰고, 사유 설명은 옆 텍스트나 `aria-disabled="true"`로 남긴다 | [](source:ref-sem)[](source:finish) |
| 24×24 CSS px 미달 타깃, 확장된 hit area 겹침, 드래그·제스처 단독 동작 | 예외(간격·동등 컨트롤 등)가 없으면 겹치지 않게 조정하고 단일 포인터 대안을 추가한다 | [](source:hit)[](source:ref-hit) |
| 5초를 넘는 자동 이동·깜빡임·갱신 콘텐츠, 액션·오류 토스트 | 일시정지·정지·숨김 컨트롤이 필수다. 액션·오류 토스트는 타이머로 자동 종료하지 않는다 | [](source:motion-zoom)[](source:ref-motion) |
| 뷰포트 메타 `maximum-scale=1`·`user-scalable=no` 또는 `role="status"` 초기 마운트 누락 | 제거하고 빈 `role="status"` 영역을 DOM에 먼저 둔 뒤 텍스트만 갱신한다 | [](source:motion-zoom)[](source:finish) |
| 브라우저 없이 리뷰하거나 일부 영역을 검사하지 못함 | 돌리지 못한 검사는 `Not verified`로 보고하고, 미검토 영역은 절대 `Approve`하지 않는다 | [](source:finish)[](source:ref-rep) |

## 더 자세히 읽으려면 {#more span=12}

공개된 상세:

- 아직 없음

상세 후보(요청하면 만든다):

- ARIA APG 위젯별 키 맵과 포커스 트랩 구현 — 포커스 링·키보드·오버레이 이동 · Dialog·Tabs·Menu·Disclosure·Combobox·Listbox 키 동작과 `inert` 코드를 개요에서 줄였다.
- hit area 예외 5가지와 가상 요소 충돌 계산 — hit area·드래그·제스처 대안 · 간격 예외(`20px` 타깃 `4px` 여백 등)와 `<label>`/`<button>` 확장 CSS를 개요에 다 넣지 않았다.
- 폼 `autocomplete`·`inputmode` 표와 live region 규칙 — 폼 레이블·오류 안내·자동완성과 스크린 리더·접근 가능한 이름·대비 · 필드별 토큰 8종, `alt` 목적별 5분류, `.sr-only` CSS를 상세로 풀 수 있다.

@callout level=open-question title="확인하지 못한 것"
| `SKILL.md` 12줄은 애니메이션 기법 소유 스킬로 `better-motion`을 지목하지만, `design/jakubkrehel/better-motion`은 이 저장소에 없어 연계 상세를 확인할 수 없다. |

읽은 원본: 텍스트 파일 9개(`SKILL.md`, `reporting.md`, `semantics-and-aria.md`, `focus-and-keyboard.md`, `hit-areas.md`, `forms.md`, `motion-and-zoom.md`, `screen-readers.md`, `agents/openai.yaml`)와 관계 대조용 형제 스킬 원문 일부(`better-interface/SKILL.md`, `interface-review/removed-signals.md`, `better-typography/SKILL.md`, `better-ui/SKILL.md`, `better-writing/SKILL.md`, `afk/SKILL.md`, `build-design/SKILL.md`, `teardown/SKILL.md`). 제외: 없음.
