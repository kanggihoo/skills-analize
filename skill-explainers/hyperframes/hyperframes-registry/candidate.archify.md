# hyperframes-registry는 언제 켜지고 무엇을 강제하나? {#registry-page}

`hyperframes-registry`는 이름 붙은 시각 효과(CRT scanlines, glitch, film grain, 차트 등)를 손으로 만들기 전에 `catalog`로 기성 block·component를 찾고 `add`로 설치해 쓰게 한다.[](source:front)[](source:lead) 설치한 item은 프로젝트 안의 편집 가능한 소스다.[](source:lead)

- on-device 검색은 약 33 MB를 한 번 내려받는다. 에이전트는 크기를 사람에게 말하고, 사람이 정하며, 몰래 켜지 않는다.[](source:ondevice)[](source:tiers)
- 검색어는 항상 영어다. 영어가 아닌 글자만 있으면 `No searchable words in query`가 나오며 이는 gap이 아니다.[](source:find)[](source:english)
- 맞는 item이 없으면 직접 만들기 전에 `feedback --search-miss`로 보고한다.[](source:find)[](source:gapreport)
- 이 페이지는 `hyperframes/hyperframes-registry` 안의 텍스트 13개를 읽고 썼다. `discovery.md`는 목록형이라 구조·표본만 확인했다.[](source:discovery-head)

@answer scope="원본 SKILL.md와 references 분석 · 분석 커밋 f85af64 · 대상 CLI 실행 안 함 · 부분 분석(discovery.md 표본 확인)"
@meta locale=ko
@source front title="hyperframes/hyperframes-registry/SKILL.md · 4500B · 원본(frontmatter)" path=hyperframes/hyperframes-registry/SKILL.md lines=1:4
@source lead title="hyperframes/hyperframes-registry/SKILL.md · 4500B · 원본(도입)" path=hyperframes/hyperframes-registry/SKILL.md lines=10:12
@source beacon title="hyperframes/hyperframes-registry/SKILL.md · 4500B · 원본(usage beacon)" path=hyperframes/hyperframes-registry/SKILL.md lines=8:8
@source plugin title="hyperframes/hyperframes-registry/SKILL.md · 4500B · 원본(plugin 설치)" path=hyperframes/hyperframes-registry/SKILL.md lines=6:6
@source find title="hyperframes/hyperframes-registry/SKILL.md · 4500B · 원본(Find and install)" path=hyperframes/hyperframes-registry/SKILL.md lines=14:28
@source ondevice title="hyperframes/hyperframes-registry/SKILL.md · 4500B · 원본(on-device 동의)" path=hyperframes/hyperframes-registry/SKILL.md lines=24:24
@source whatsin title="hyperframes/hyperframes-registry/SKILL.md · 4500B · 원본(What's in it)" path=hyperframes/hyperframes-registry/SKILL.md lines=30:47
@source wiring title="hyperframes/hyperframes-registry/SKILL.md · 4500B · 원본(Wiring)" path=hyperframes/hyperframes-registry/SKILL.md lines=49:56
@source contrib-ptr title="hyperframes/hyperframes-registry/SKILL.md · 4500B · 원본(Contributing)" path=hyperframes/hyperframes-registry/SKILL.md lines=58:60
@source search-intro title="hyperframes/hyperframes-registry/references/search.md · 9416B · 검색 순서와 browse" path=hyperframes/hyperframes-registry/references/search.md lines=5:30
@source english title="hyperframes/hyperframes-registry/references/search.md · 9416B · 영어 검색어 규칙" path=hyperframes/hyperframes-registry/references/search.md lines=15:15
@source gapreport title="hyperframes/hyperframes-registry/references/search.md · 9416B · gap 보고" path=hyperframes/hyperframes-registry/references/search.md lines=32:44
@source offline title="hyperframes/hyperframes-registry/references/search.md · 9416B · 오프라인 동작" path=hyperframes/hyperframes-registry/references/search.md lines=46:56
@source tiers title="hyperframes/hyperframes-registry/references/search.md · 9416B · Search tiers" path=hyperframes/hyperframes-registry/references/search.md lines=62:67
@source discovery-head title="hyperframes/hyperframes-registry/references/discovery.md · 16593B · 구조·표본만 확인(전부 읽지 않음)" path=hyperframes/hyperframes-registry/references/discovery.md lines=57:59
@source discovery-glass title="hyperframes/hyperframes-registry/references/discovery.md · 16593B · Liquid Glass 구간(구조·표본)" path=hyperframes/hyperframes-registry/references/discovery.md lines=102:106
@source install title="hyperframes/hyperframes-registry/references/install-locations.md · 1519B · 설치 경로" path=hyperframes/hyperframes-registry/references/install-locations.md
@source wire-blocks title="hyperframes/hyperframes-registry/references/wiring-blocks.md · 2641B · block 연결" path=hyperframes/hyperframes-registry/references/wiring-blocks.md
@source wire-comps title="hyperframes/hyperframes-registry/references/wiring-components.md · 1723B · component 연결" path=hyperframes/hyperframes-registry/references/wiring-components.md
@source ex-block title="hyperframes/hyperframes-registry/examples/add-block.md · 1232B · block 설치 예" path=hyperframes/hyperframes-registry/examples/add-block.md
@source ex-comp title="hyperframes/hyperframes-registry/examples/add-component.md · 1473B · component 설치 예" path=hyperframes/hyperframes-registry/examples/add-component.md
@source demo title="hyperframes/hyperframes-registry/references/demo-html-pattern.md · 1884B · demo.html 규약" path=hyperframes/hyperframes-registry/references/demo-html-pattern.md
@source contrib title="hyperframes/hyperframes-registry/references/contributing.md · 7270B · 기여 절차" path=hyperframes/hyperframes-registry/references/contributing.md
@source templates title="hyperframes/hyperframes-registry/references/templates.md · 11451B · 기여 템플릿" path=hyperframes/hyperframes-registry/references/templates.md
@source quality title="hyperframes/hyperframes-registry/references/component-quality-bar.md · 16390B · component 품질 기준" path=hyperframes/hyperframes-registry/references/component-quality-bar.md
@source placeholder title="hyperframes/hyperframes-registry/references/placeholder-material.md · 9006B · placeholder 색 규칙" path=hyperframes/hyperframes-registry/references/placeholder-material.md
@source r26-install title="hyperframes/hyperframes/SKILL.md · 메인 스킬(구조 확인용)" path=hyperframes/hyperframes/SKILL.md lines=12:16

## 이 스킬은 언제 켜지고 무엇을 강제하나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어가 있으면 켜진다는 뜻이 아니다. `disable-model-invocation` 같은 호출 제한 필드는 이 원문에 명시 없음이다.[](source:front)

@code source=front language=yaml

원문은 호출 맥락으로 "before hand-building any named visual"과 `hyperframes add`, `catalog` 작업을 든다.[](source:front) 판정 · "먼저 검색"은 의무 어조이지만, 검색 결과가 맞지 않으면 직접 만들 길이 열려 있다. 그 길에도 gap 보고가 붙는다.[](source:find)[](source:gapreport)

@workflow id=find-install-flow title="찾고 설치하는 순서"
| need | 이름 붙은 효과가 필요하다 | external |
| query | 영어로 catalog 검색 | backend |
| fit | 결과가 맞나? | backend |
| add | add로 설치 | backend |
| wire | 장면에 연결 | backend |
| gap | gap 보고 후 직접 제작 | external |
| need > query | |
| query > fit | |
| fit > add | yes | emphasis |
| fit > gap | no | dashed |
| add > wire | |

@steps id=find-install-steps
| need | 이름 붙은 효과가 필요하다 | CRT scanlines, glitch, film grain, 차트처럼 이름 붙은 시각이 나오면 손으로 쓰기 전에 registry부터 본다.[](source:front) | find-install-flow | need |
| query | 영어로 catalog 검색 | `npx hyperframes catalog --query "<what the beat should do, in English>" --json`. 영상이 영어가 아니어도 영어로 쓴다. 검색은 local이며 아무것도 보내지 않는다.[](source:find) | find-install-flow | query |
| fit | 결과가 맞나? | `--json` envelope의 `tier`(`words` 또는 `on-device`)를 읽는다. 결과가 나왔다는 사실로 tier를 추정하지 않는다.[](source:tiers) | find-install-flow | fit |
| add | add로 설치 | `npx hyperframes add <name> --json`이 쓴 파일과 mount snippet을 출력한다. `add <tag>`는 그 tag의 block을 모두 설치하고 dependency를 먼저 설치한다.[](source:find) | find-install-flow | add |
| wire | 장면에 연결 | block은 mount, component는 복사해 붙인다. 아래 표를 본다.[](source:wiring) | find-install-flow | wire |
| gap | gap 보고 후 직접 제작 | 맞는 것이 없으면 직접 만들기 전에 보고한다. 보고는 아래 명령 한 줄이다.[](source:find) | find-install-flow | gap |

**에이전트를 멈추고 사람에게 묻는 지점**

@callout level=warning title="on-device 검색은 사람이 정한다"
| 기본 검색(`words` tier)은 item의 이름·제목·설명이 공유하는 단어만 찾는다. `--on-device`는 의미로 순위를 매기지만 약 33 MB를 한 번 내려받는다.[](source:ondevice)[](source:tiers) |
| 내려받는 것은 `bge-small-en-v1.5`의 quantized ONNX build와 tokenizer, 그리고 registry의 catalog vector다. 둘 다 `~/.hyperframes/`에 캐시되며 프로젝트나 package에 들어가지 않는다.[](source:tiers) |
| 에이전트는 크기를 소리 내어 말하고 사람이 정하게 한다. 사람이 동의하면 `--on-device`를 쓰고 prompt를 건너뛰려면 `-y`를 붙인다. 몰래 켜지 않는다("never enable it silently").[](source:ondevice)[](source:tiers) |
| 대화형 제안은 TTY에서만 뜬다. `--json`에는 prompt가 없고, 결과가 비면 같은 질문이 `warnings`에 들어간다. 그 배열을 읽고 에이전트가 사람에게 직접 묻는다.[](source:tiers) |

| 상황 | 원문이 정한 행동 |
| --- | --- |
| on-device를 쓰고 싶다 | 약 33 MB를 말하고 사람이 정한다. 사람이 설명을 요청하면 `https://hyperframes.heygen.com/developers/catalog-search`를 안내한다.[](source:tiers) |
| 맞는 item이 없다 | `npx hyperframes feedback --search-miss "<the query you ran>" --wanted "<the move you needed>" --tier <tier>`로 보고한다. `catalog --query`가 이 줄을 미리 채워 출력하고 `--json`에는 `report_gap`으로 들어 있다.[](source:find)[](source:gapreport) |
| 검색어가 영어가 아니다 | `No searchable words in query`는 query 규칙 위반이다. 없는 component가 아니므로 gap으로 보고하지 않는다.[](source:english)[](source:tiers) |
| `add`가 실패한다 | 오프라인에서는 search와 manifest 확인은 되지만 설치는 안 된다. 사용자에게 오프라인 설치를 약속하지 않는다.[](source:offline)[](source:find) |

**숫자와 적용 조건**

@facts id=numbers
| 약 450개 | block과 component를 합친 registry 규모. description의 어림값이다.[](source:front) |
| 180 blocks | `discovery.md`가 세는 block 수. 같은 문서의 표는 그중 97개만 묶은 손으로 관리하는 표본이며 의도적으로 덜 담았다.[](source:discovery-head) |
| 약 33 MB | on-device 모델을 한 번 내려받는 크기. 사람이 동의한 뒤에만 받는다.[](source:ondevice) |
| 24h | manifest 갱신 주기(TTL). 갱신에 실패해도 마지막으로 받은 manifest가 계속 검색에 쓰인다.[](source:tiers)[](source:offline) |

- 검색은 local이고 query를 어디에도 보내지 않는다. 쿼리가 전송되는 유일한 경로는 `feedback --search-miss`이며, 의도적으로 따로 실행하는 명령이다.[](source:gapreport)
- `dropped`는 registry가 설치할 수 없는 순위 항목 수이고 `unindexed`는 index가 볼 수 없는 registry item 수다. 둘은 서로 반대 방향의 어긋남이어서 검색어를 바꿔도 해결되지 않는다. `unindexed`가 0보다 크면 `--on-device`로 index를 다시 받는다. `dropped`만 0보다 크면 `~/.hyperframes/catalog/`를 비워야 한다.[](source:tiers)
- 판정 · 검색 결과가 나왔다는 사실만으로 on-device가 답했다고 단정하면 안 된다. 원문이 `tier` 확인을 명령하고 있다.[](source:tiers)
- `usage beacon`: 스킬이 시작될 때 `npx hyperframes events --skill=hyperframes-registry`를 한 번 실행하라고 적혀 있다. 스킬 이름이 CLI의 일반 telemetry와 함께 전송되고(로그인 중이면 계정과 연결), opt-out은 따른다. 이 분석은 이 명령을 실행하지 않았다.[](source:beacon)
- plugin 안에서는 `hyperframes/references/plugin-installation.md`의 plugin execution rules를 따른다. 조건은 plugin 안일 때뿐이다.[](source:plugin)

## block과 component는 무엇이 다르고 어디에 설치되나? {#block-component}

| 구분 | Block | Component |
| --- | --- | --- |
| 정의 | 자기 timeline을 가진 장면 하나. 고정 dimensions와 duration이 있다.[](source:whatsin)[](source:contrib) | 장면에 병합하는 snippet. 고정 dimensions·duration이 없다.[](source:whatsin)[](source:contrib) |
| 기본 설치 위치 | `compositions/<name>.html`[](source:wiring)[](source:install) | `compositions/components/<name>.html`[](source:wiring)[](source:install) |
| 위치를 바꾸는 설정 | `hyperframes.json#paths.blocks`[](source:install) | `hyperframes.json#paths.components`[](source:install) |
| 쓰는 법 | `data-composition-src`로 mount한다. `data-composition-id`는 block 내부 id와 같아야 한다.[](source:wiring)[](source:wire-blocks) | markup, `<style>`, script를 내 scene에 복사한다. 시작 전에 파일 상단 comment block을 읽는다.[](source:wiring)[](source:wire-comps) |
| timeline | block 내부 GSAP timeline이 독립으로 돌고 runtime이 host와 맞춰 seek한다. host GSAP에서 block timeline을 참조하지 않는다.[](source:wire-blocks) | 자기 timeline이 없고 host의 timeline에 참여한다. 노출하는 timeline call이 있으면 host timeline에 넣는다.[](source:wire-comps) |
| 종류 예 | transition, overlay·lower third, title card·kinetic type, social·chat·UI card, code·chart·data·map, 3D·shader·background.[](source:whatsin) | motion primitive·text effect, caption style, camera move, product demo·UI prop, texture·particle·effect.[](source:whatsin) |
| demo.html | 필요 없다. 이미 standalone composition이다.[](source:demo) | 저장소 안에서 preview용으로 함께 제공되며, `add`로 설치되지 않는다.[](source:demo) |

**연결할 때 지키는 규칙**

- 맞는 가장 큰 단위를 가져온 뒤 고친다. 설치한 item의 id 접두어는 바꾸지 않는다. 두 item의 id가 충돌하지 않게 하려는 규칙이다.[](source:wiring)
- item은 자기 variable을 갖는다. 한 mount에만 값을 주려면 host에 `data-variable-values`를 쓴다. `add --vars '{"title":"…"}'`가 그 속성을 써 준다. 색과 font variable은 브랜드 값으로 가리킨다.[](source:wiring)
- beat에 맞춘 block은 `npx hyperframes beats --json`의 beat 시간에서 mount의 `data-start`를 뺀 값을 hit time으로 쓴다.[](source:wiring)
- 설치 경로는 `hyperframes.json`이 정한다. 파일이 없으면 `add`가 기본값으로 만든다. 예를 들어 `paths.blocks`를 `scenes`로 바꾸면 `scenes/data-chart.html`에 쓰인다.[](source:install)
- block mount의 필수 속성은 `data-composition-src`, `data-composition-id`, `data-start`(초), `data-duration`(초, block 자체 duration 이하), `data-track-index`(높을수록 앞), `data-width`, `data-height`(block 크기와 맞춘다)다.[](source:wire-blocks)
- 연결한 뒤에는 `hyperframes lint`와 `hyperframes preview`를 돌리는 것이 두 예제의 순서다. component 문서는 연결 후 `lint`를 돌려 구조 문제를 잡으라고 한다.[](source:ex-block)[](source:ex-comp)[](source:wire-comps)

## item을 새로 기여하려면 무엇을 지켜야 하나? {#contributing}

이 절은 upstream PR을 낼 때만 해당한다. 설치해서 쓰는 사용자는 필요 없다.[](source:contrib-ptr) `contributing.md`는 Clarify, Scaffold, Build, Validate, Preview, Ship의 6단계를 정하고, Clarify에서 사용자에게 묻는다(한 문장 설명, 시각 reference, 누가 언제 쓰는지).[](source:contrib)

| 규칙 | 값과 적용 조건 |
| --- | --- |
| caption block 글자 크기 | 비례폭 font는 96px 이상, monospace는 64-72px. 의무("Non-negotiable")다.[](source:contrib) |
| caption 가독성 | `-webkit-text-stroke` 2-3px 또는 여러 겹 `text-shadow`. 모든 group에 `window.__hyperframes.fitTextFontSize()`를 호출한다.[](source:contrib) |
| 금지 | caption에서 같은 위치의 `tl.set(el, { opacity: 1 })`와 `tl.from(el, { opacity: 0 })` 병용. `tl.to`를 쓴다.[](source:contrib) |
| 모든 type | `data-composition-id`는 `window.__timelines["id"]`와 같아야 한다. `gsap.timeline({ paused: true })`, `Math.random()`·`Date.now()` 금지, 모든 element id에 접두어(2-3글자)를 붙인다.[](source:contrib) |
| VFX(Three.js) | `three@0.147.0`, `requestAnimationFrame` 없이 `tl.eventCallback("onUpdate", renderScene)`, seeded PRNG `mulberry32`.[](source:contrib)[](source:templates) |
| Validate | `hyperframes lint` 0 errors, `hyperframes check --no-contrast` 0 console errors.[](source:contrib) |
| Ship | 6단계가 모두 필수이며 하나라도 빠지면 catalog entry가 깨진다. `registry/registry.json`은 손으로 고치지 않고 `npx tsx scripts/generate-registry-items.ts`로 만든다.[](source:contrib) |

**승인과 사람이 필요한 지점**

- PR을 열려면 GitHub 계정이 필요하다. 없으면 가입 후 `gh auth login`을 안내한다.[](source:contrib)
- catalog preview 이미지는 HeyGen 내부 기여자는 `scripts/upload-docs-images.sh`(AWS profile 필요)로 올리고, 외부 기여자는 PR에 preview MP4를 붙이면 maintainer가 올린다.[](source:contrib)
- 원문의 Ship 단계에는 `git push`, `gh pr create`, `npx hyperframes publish`가 들어 있다. 이 분석에서는 실행하지 않았고, 사용자 확인 단계가 원문에 명시되어 있지 않다. 판정 · 실제 push 전에는 사람에게 확인받는 편이 안전하다.[](source:contrib)

**유지 기준**

`component-quality-bar.md`는 audit 기준이다.[](source:quality)

- 대상은 item의 자기 `<name>.html`을 단독으로 mount한 결과다. `demo.html`과 catalog page는 근거로 쓰지 않는다.[](source:quality)
- 검사는 mechanical pass(grep·hash)와 visual pass(렌더해 눈으로 확인) 두 단계다.[](source:quality)
- `hyperframes check`만으로는 판정하지 않는다. 빈 렌더도 유효한 렌더이기 때문이다.[](source:quality)

| 분류 | 내용 |
| --- | --- |
| Fatal(삭제) F1-F5 | 설명한 대상이 파일에 없음, 같은 motion과 markup의 중복, 렌더가 비어 있음, 설명한 사건이 일어나지 않음, seek 불가.[](source:quality) |
| Fixable X1-X8 | timeline 없음, 이름이 주장하는 기법이 코드에 없음, 대비 4.5:1 미만(1920x1080), 하드코딩 ink, markup 없음, seeded 아닌 randomness, `min`/`max` 없는 number variable 등.[](source:quality) |
| Never cut N1-N7 | 색이 효과인 경우, 실제 제품을 그린 경우, 의도적인 정지 등. 보호는 기준별이며 다른 기준은 여전히 적용된다.[](source:quality) |

placeholder는 모노크롬이다. ink의 alpha 단계 `L1` 72%, `L2` 45%, `L3` 18%, `L4` 8%와 hairline 14%만 쓴다. 글자는 `L1` 아래로 내리지 않고 accent는 한 composition의 한 element에만 쓴다.[](source:placeholder) 금지 hex 6개(`#7c3aed`, `#2563eb`, `#6366f1`, `#8b5cf6`, `#a855f7`, `#4f46e5`)는 점검 목록에 있다.[](source:placeholder)

## build-video 흐름에서 어디에 놓이나? {#position}

판정 · 원장 R02, R09, R26 기준으로 이 스킬은 `/hyperframes`가 손으로 만들기 전에 넘기는 선택지다. 묶음 전체 흐름은 `_group-build-video/build-video.html`을 본다.

@workflow id=position-flow title="흐름 속 위치"
| before | hyperframes | external |
| current | hyperframes-registry | backend |
| after | hyperframes-cli | backend |
| before > current | R02 이름 붙은 효과 | emphasis |
| current > after | R09 catalog·add 명령 |

@steps id=position-steps
| highlight | hyperframes-registry | 이 페이지의 스킬. `catalog`로 찾고 `add`로 설치하고 연결한다. | position-flow | current |

| 원장 관계 | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| R02 hyperframes에서 | 이름 붙은 효과·전환·caption 스타일·차트·카드 요청 | 검색 결과 후 설치 | 손으로 쓰기 전에 검색한다. 조건부 의무 어조.[](source:front)[](source:r26-install) |
| R09 hyperframes-cli와 | `catalog`, `add` 명령 안내를 이 스킬로 연결 | - | 참고 관계다. 명령표가 이 스킬을 가리킨다. |
| R17·R18 remotion-to-hyperframes, slideshow에서 | `catalog --query` 검색 권유 | 검색 결과 | 스킬 이름이 아닌 명령으로 지목한다. |
| R26 hyperframes와 공유 상태 | `compositions/`, `hyperframes.json` | 설치한 block 파일 | `hyperframes` CLI(`add`)가 파일을 쓰고 `/hyperframes`의 `index.html`이 mount한다.[](source:wiring)[](source:install) |

## 어디까지 확인했고 무엇이 남았나? {#audit}

| 구분 | 내용 |
| --- | --- |
| 읽은 텍스트 파일 | 13개, 총 85098B. 전부 읽은 파일 12개, 부분 읽음 1개 |
| 부분 읽음(구조·표본만 확인, 전부 읽지 않음) | `references/discovery.md` 16593B. 제목·manifest 필드표·Blocks 안내문·Liquid Glass 구간·Components 표 앞부분을 봤다. 항목별 표 약 85행은 일람하지 않았다 |
| 바이너리 | 0개. 이미지·음원·영상·폰트 없음 |
| 제외한 파일 | 없음. 이 폴더에 `*.KO.md` 번역본은 없었다 |
| 분석 중 바뀐 파일 | 없다. 분석 커밋 f85af64 기준으로 읽었다 |
| 실행하지 않은 것 | `npx hyperframes catalog`, `add`, `events`, `feedback`, `publish`와 대상 스킬의 설치·push 지시 전부 |
| 대조한 원장 | `skill-explainers/hyperframes/relations.md`의 R02, R09, R13, R17, R18, R26 |

@callout level=open-question title="확인하지 못한 것"
| 규모 숫자가 문서마다 다르다. description은 "About 450", `discovery.md`는 block 180개(표본 97개)를 말한다. component 수는 원문에 명시 없음이다.[](source:front)[](source:discovery-head) `placeholder-material.md`는 "across 250 items", `component-quality-bar.md`는 "97 of the 213 new components"를 말하며 서로 시점이 다른 값으로 보이나 원문만으로는 확정할 수 없다.[](source:placeholder)[](source:quality) |
| Liquid Glass block은 Brave / Chrome canary와 WebGPU가 필요하다고 한다(`PRODUCER_HEADLESS_SHELL_PATH` 설정). 설치 시 이 조건을 사용자에게 알려야 하는지는 이 스킬의 본문에 명시 없음이다.[](source:discovery-glass) |
| `catalog` 결과가 어떤 JSON 필드로 오는지, `add`의 실제 출력은 CLI를 실행하지 않아 확인하지 못했다. 원문의 서술만 옮겼다. |
| 원문 안의 URL(`registry.json`, catalog-search 문서)은 열어 보지 않았다. |
