# Diagrams

`assets/diagrams/diagram.js`는 작은 JSON spec으로 card 패널(약 560 x 340)이나 섹션(1200 x 560)에 노드와 선으로 된 그림을 그린다. `presets.json`에는 바로 쓸 수 있는 spec 27개가 있으며, 각각 맞는 페이지 종류(`types`: software, tech, gaming, product, service)가 표시되어 있다. `demo.html`은 feature card에서 light와 dark로 보여 주고(`?type=gaming`), `lab.html`은 직접 만드는 도구다(아래 참고).

## When a diagram, when a UI fragment

- 다이어그램은 요점이 연결 관계일 때 쓴다. 읽어 오는 도구들, 하나의 입력이 병렬 작업으로 나뉘는 경우, 여러 원천이 한 곳으로 모이는 경우, 두 시스템이 동기화되는 경우, 단계가 순서대로 이어지는 경우, 지역을 보여 주는 경우.
- UI 조각(`assets/ui`)은 요점이 사용자가 보거나 하는 것일 때 쓴다. 작성된 답장, 캘린더, 대시보드. 화면을 다이어그램으로 그리지 않는다.
- 섹션당 다이어그램 하나, 페이지당 최대 둘(테크). 제품이나 서비스 페이지는 하나를 정지 상태로 둔다. 장소 페이지에는 다이어그램을 두지 않는다. 게임 페이지에서 다이어그램은 게임의 시스템(매칭, 저장, 상점)을 보여 준다. 게임 자체의 그림을 대신하지 않는다.

## Pick a layout and a preset

| layout | 보여 주는 것 | presets |
|---|---|---|
| `hub` | 중심과 그 도구들. `children`이 있으면 마인드맵, `"shape": "radial"`이면 웹 | hub-tools, hub-branches, hub-web, hub-stack(tech), hub-stores(gaming) |
| `ring` | 궤도 위의 로고나 지역 | ring-apps, ring-regions, ring-edge(tech), ring-servers(gaming) |
| `tree` | 하나에서 가지가 나뉘는 것 | tree-orders, tree-release(tech) |
| `lanes` | 하나의 입력, 코어, 병렬 레인(세 개의 스레드) | lanes-agent, lanes-media, lanes-deploy, lanes-render(tech), lanes-matchmaking(gaming) |
| `fanin`, `bowtie` | 여럿에서 하나로. 그리고 하나에서 여럿으로 | fanin-warehouse, fanin-telemetry(tech), bowtie-events, bowtie-model(tech) |
| `sync` | 두 시스템, 기록이 오가는 모습 | sync-crm, sync-saves(gaming) |
| `timeline` | 차례대로 끝난 단계 | timeline-onboarding, timeline-season(gaming) |
| `grid` | 파일이 파이프라인으로 들어가는 모습 | grid-documents, grid-assets(gaming) |
| `free` | 직접 정한 노드와 간선 | free-approval |

페이지 종류로 거른다. `dg.presets()`가 객체를 반환하며, `types`에 그 페이지의 종류가 있는 것만 고른다. gaming과 tech 페이지는 pulse가 있는 tech와 gaming preset을 쓴다. 제품이나 서비스 페이지는 최대 하나를 쓰며, 정지 상태로 둔다.

```html
<link rel="stylesheet" href="assets/diagrams/diagram.css">
<div class="panel"><div class="dg" data-diagram="lanes-agent"></div></div>
<script type="module" src="assets/diagrams/mount.js"></script>
```

preset을 `data-diagram='{...}'`에 복사한 뒤, 모든 라벨, 아이콘, 숫자를 고객 자신의 것으로 바꾼다. 작은따옴표 속성 안에 아포스트로피나 따옴표(`it's`)가 든 라벨은 속성을 끊으므로, 그럴 때는 spec을 요소 안의 script에 넣는다.

```html
<div class="panel"><div class="dg" data-diagram><script type="application/json">{"layout": "hub", ...}</script></div></div>
```

파싱되지 않는 spec은 `console.error`를 남기고, 읽을 수 있었던 이름만 남긴다.

## The builder page (the tool for building one fast)

http로 `assets/diagrams/lab.html`을 연다. 페이지 종류와 preset을 고르고 JSON을 고친다(입력할 때마다 다시 그려진다). 또는 조절 장치를 쓴다(ground, light, 선 모양, 2.5에서 4초 주기). card, section, phone을 전환하고, light와 dark를 바꾸며, 루프를 다시 시작한 뒤, 마크업과 아이콘 줄을 복사한다. card 안에서는 목업이 아니라 실제 모습을 보여 준다. 새 다이어그램은 preset에 고객의 말을 더한 것이다. `free`는 상자의 비율 위치에 노드를 놓고, 간선은 직접 나열한다.

## Icons: one resolver, run it last

`diagram.js`는 아이콘 파일만 읽는다. CDN도, 색 입히기도, 런타임의 Simple Icons 호출도 없다. 사이트 루트에서 다음을 실행한다.

`node <skill>/scripts/icons.mjs scan index.html --out assets/icons`

이 명령은 페이지의 다이어그램이 이름을 댄 모든 id를 가져온다(`gmail`, `steam`, `google-docs` 같은 큐레이션된 짧은 이름, `logos:`, `file:`, `si:` id, `ui:` 글리프). 컬러 마크는 전체 색의 logos 세트에서 가져온다. 그것이 없으면(Google Docs, Sheets, Slides) Simple Icons 마크를 브랜드 hex 색으로 `icons.mjs`가 칠한다. 아이콘이 없으면 이름의 첫 글자가 보이고, 콘솔에 `diagram.js: N icons are not in .../assets/icons ...`와 가져오기 줄이 출력된다. 그러면 이 명령을 실행한다. 완성된 페이지에는 그런 줄이 없다. 보라색 계열이 강한 마크(Stripe, Twitch)는 글자 색으로 그리고, 검은 마크는 잉크 색을 쓴다. 워드마크는 2:1 자리를 받고, 타일은 pill이 된다. 이 모든 것은 `icons.mjs`가 정하여 파일에 구워 넣는다(`data-ic`). 요소나 그 감싸는 요소의 `data-icon-base`는 폴더 위치를 옮긴다.

## Motion: one cycle of 2.5 to 4 s

- 다이어그램 card의 펄스는 자체 루프다(card 묶음마다 하나가 아니다). 프로그램은 물결처럼 배치된다. 각 spoke, 가지, 경로는 바로 앞의 것에서 한 박자(0.24에서 0.5초, stagger) 뒤에 시작한다. 전체 프로그램은 ONE cycle 3.2초에 맞춰진다(`"motion": {"cycle": 2.5..4}`). 선은 나머지 시간 동안 페이드된다. `d.T`는 항상 2.5에서 4초다. 반복된다. hero 아래에서는 두 루프가 한 화면을 공유하지 않는다. 움직이는 조각 옆에서는 둘 중 하나가 멈춘다(`motion.md`).
- 포인터가 card에 들어오거나(마우스와 펜), 키보드로 포커스가 들어오면 첫 박자에서 다시 시작한다.
- 화면에 있을 때만 돈다. 휴대폰(640px 미만)과 reduced motion에서는 가장 바쁜 순간 하나로 정지한다. `"pulse": "none"`도 정지한다. `data-dg-still`은 손으로 정지를 지정하며, 포인터가 card 위에 있는 동안에만 재생한다. `data-ui-still`은 다이어그램을 멈추지 않는다. 도는 루프는 일시정지 원판을 가진다.
- 빛은 빛나는 머리가 있는 그라데이션 혜성이다(`"pulse": "dot"`는 머리만 쓴다). accent는 빛과 그 빛이 닿는 곳에만 쓴다. 선은 가는 실선이며, 코어는 잉크 타일이다. card 자체는 움직이지 않으며, 스크롤로 아무것도 시작하지 않는다.
- ground는 기본으로 다양하다(허브 주위의 `rings`, 궤도, 타임라인, sync에서는 `none`, 흐름에는 `dots`. 섹션을 이끄는 다이어그램에는 `glow`를 더한다). `ground`로 정한다. 제품이나 서비스 페이지(그 페이지의 유일한 정지 다이어그램, kind other)에서는 `"ground": "none"`과 `"motion": {"pulse": "none"}`를 설정한다. 패턴, 글로우, 펄스는 테크 전용이다. 크기: 평면 그림은 맞으면 한 단계 더 큰 크기를 쓴다. `"size": "band"` 또는 `"card"`는 강제로 지정한다.
- 선: 허브의 spoke는 코어 가장자리에서 나오는 직선 광선이다(`"curve": "curve"`, `"elbow"`, `"swirl"`로 바꾼다). 흐름은 둥근 꺾임으로 휜다.

## Labels plain

- 도구는 이름으로(Gmail, Zendesk), 단계는 결과로(Reply drafted, Label printed), 장소는 도시로 쓴다. 한 단어에서 세 단어까지.
- `meta`에는 실제처럼 보이는 숫자를 쓴다(2,481, 14 ms).
- 전문 용어 노드는 쓰지 않는다("Orchestration layer", "AI engine"). 코어는 제품이 부르는 이름으로 부른다.
- spoke는 최대 8개, card 안의 노드는 최대 12개. 빽빽하다면 목록으로 바꿔야 한다는 뜻이다.
- 다이어그램 아래에 캡션을 달지 않는다. card 제목이 무엇을 보여 주는지 말한다. spec의 `alt`가 스크린 리더를 위해 그것을 말한다.
- 도구의 마크는 자기 색을 쓰며, 원 안의 글자로 대신하지 않는다. 아이콘이 없는 코어는 이름이 적힌 pill이다.
