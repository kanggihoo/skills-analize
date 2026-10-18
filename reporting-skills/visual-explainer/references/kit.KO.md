# 킷

킷은 모든 페이지가 공유하는 CSS, 폰트, SVG defs, 스크립트입니다. 마커 줄 하나만 작성하면, 렌더러가 그 자리에 킷을 넣습니다. 이 문서는 킷이 제공하는 것을 나열하고, `diagrams.md`는 그리기 규칙을 설명합니다.

## 소스

```html
<!doctype html>
<html lang="en" data-register="blueprint">
<head>
<title>94% of reads never touch the database</title>
<link rel="stylesheet" href="kit.css" data-ve-kit>
<style>/* 이 페이지만의 CSS */</style>
</head>
<body><main>
  <header>
    <p class="eyebrow">Read path</p>
    <h1><span class="num">94%</span> of reads never touch the database</h1>
    <p class="lead">One sentence. <b>One key phrase.</b></p>
    <p class="meta">service · source · date range</p>
  </header>
  <figure>
    <div class="frame"><svg class="ve-svg" viewBox="0 0 800 300" role="img" aria-label="What the picture shows">…</svg></div>
    <figcaption><span class="fig-n">Fig. 1</span>The claim in one sentence.</figcaption>
  </figure>
  <section>
    <div class="sec-head"><p class="ve-label caps">Load</p><h2>The takeaway as a heading</h2></div>
    …
  </section>
  <section class="sources" aria-label="Sources"><p class="ve-label caps">Sources</p><p><code>src/cache/user.ts:14</code></p></section>
</main></body>
</html>
```

렌더러는 charset, viewport, favicon, 폰트, 킷 CSS와 스크립트, SVG defs(`#ve-ah` 화살촉, `#ve-node` 채우기, `#ve-w-on` / `#ve-w-off` 와플 셀)를 추가합니다.

**레지스터:** `data-register="instrument"`(기본값), `blueprint`, `paper`, 또는 `editorial`(`style-guide.md`). 토큰은 `var(--accent)`, `var(--s-4)`처럼 사용하세요. 페이지 자체의 `:root { --accent: … }`가 킷보다 우선합니다.

## 부품

| 부품 | 마크업 |
|---|---|
| 노드 | `<g class="ve-n [is-key]"><rect class="sh"/> [<path class="gl"/>] <text/> [<text class="sub"/>]</g>`; 데이터 저장소는 `path.sh` + `ellipse.sh.lid`; `<text class="ve-kind">`는 종류를 표시 |
| 엣지 | `<path class="ve-e [is-hot\|is-async]"/>` + `<text class="ve-el [l\|r]">verb</text>`; 엣지는 노드보다 먼저 그리기 |
| 플래그 | `.ve-n` 또는 `.ve-e`에 `.is-new`, `.is-gone`; `<text class="ve-x">✕</text>`는 차단된 엣지를 표시 |
| KPI 띠 | `.kpis` › `.kpi`: `<span class="ve-label">Hit rate</span><span class="val"><span data-count="94">94</span><span class="unit">%</span></span>` + 데이터 태그; `data-count`는 올라가며 셈 |
| 작은 다중 그림 | `.cases` › `<div class="case" data-st="ok\|warn\|risk">`: 칩, `<h3>`, `<svg class="ve-mini" viewBox="0 0 240 128">`; 바뀐 부분은 `.is-st`, 없는 부분은 `.is-off` |
| 칩 | `<span class="chip ok\|warn\|risk">word</span>` |
| 연결된 강조 | 어떤 부분에든 `data-ref="redis"`; 산문 용어는 `<span class="ve-ref" data-ref="redis" tabindex="0">`(`diagrams.md`) |
| 단계 진행, 재생, 콜아웃, 치수, 흐름 점 | `data-s`가 있는 `.ve-steps`, `.ve-tok`, `.ve-at`, `.ve-vals`; `.ve-co`; `.ve-dim`; `data-flow`: 마크업은 `diagrams.md` |

## 데이터 태그

태그는 자신이 설명하는 SVG가 됩니다. `<ve-bars>`와 `<ve-waffle>`은 `.kpi`나 `<figure>`에, `<ve-stack>`은 `.frame`에 넣으세요. `.frame`은 좁은 화면에서 이를 가로 스크롤시킵니다. `label`은 스크린 리더가 그림 대신 읽는 문장입니다.

```html
<ve-bars unit="ms" max="9" label="A hit takes 1 ms; a miss takes 9 ms"><ve-bar value="1" hot>hit</ve-bar><ve-bar value="9">miss</ve-bar></ve-bars>
<ve-waffle value="94" note="6 misses" label="94 of 100 reads hit Redis"></ve-waffle>
<ve-stack unit="k" label="Postgres serves 6k of 100k reads"><ve-bar value="94">Redis</ve-bar><ve-bar value="6" hot>Postgres</ve-bar></ve-stack>
```

- **막대:** 적힌 순서대로 0에서 시작하는 행, 각 값에 단위를 붙입니다. `hot`은 중요한 막대를 표시합니다. 같은 `max`를 쓰는 차트는 같은 눈금을 공유하며, 라벨은 최대 9자, 값은 최대 6자입니다.
- **와플:** `value`는 0부터 100까지의 정수입니다. `note`는 꺼진 셀을 설명합니다.
- **스택:** 비율대로 나뉜 막대 하나. 좁은 구간의 라벨은 한 행 아래로 내려갑니다.

`<ve-flow>`는 상자와 화살표를 격자 위에 배치하므로 좌표를 쓸 필요가 없으며, 자체 `.frame`을 가집니다.

```html
<figure class="ve-steps">
  <ve-flow label="The API asks Redis; a miss reads Postgres.">
    <ve-node id="api" at="1 1" sub="user-service" key data-s="1" data-ref="api">API</ve-node>   <!-- at="열 행" -->
    <ve-node id="redis" at="2 1" data-s="0 2" data-ref="redis">Redis</ve-node>
    <ve-node id="pg" at="1 2" shape="db" data-s="3">Postgres</ve-node>
    <ve-edge from="api" to="redis" label="get key" data-s="2"/>
    <ve-edge from="api" to="pg" label="miss · 9 ms" hot data-s="3"/>
  </ve-flow>
  <div class="ve-player">…</div>
  <figcaption>…</figcaption>
</figure>
```

플래그: `key`, `hot`, `async`, `new`, `gone`. `data-s`와 `data-ref`는 그리기 부분에서와 같이 동작합니다. `data-s`가 있는 각 화살표는 재생 토큰을 받습니다. 화살표 라벨은 최대 약 12자로 하세요. 렌더링 오류는 줄 번호를 알려줍니다: `line 42 <ve-bar>: value="-3" is negative`.

`<ve-ask id="ttl" q="Key lifetime?"><ve-opt value="60">60 s</ve-opt><ve-opt value="300">5 min</ve-opt></ve-ask>`는 독자에게 선택을 요청하며, 그 답은 독자의 응답에 포함됩니다. `default`와 `multi`는 선택 사항입니다.
