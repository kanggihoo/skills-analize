# hyperframes-registry는 무엇을 위한 스킬이고 에이전트를 어떻게 움직이나? {#registry-page}

`hyperframes-registry`는 영상에 넣을 이름 붙은 시각 효과를 에이전트가 직접 만들지 않고, 기성 item을 찾아 설치해 쓰게 하는 스킬이다.[](source:intro) item은 약 450개의 block과 component이고, 설치하면 프로젝트 안의 편집 가능한 소스가 된다.[](source:front)[](source:intro) 이 페이지는 폴더 안 텍스트 13개를 전부 읽었지만 폴더 밖 참조 파일은 읽지 않아 **부분 분석**이다.

- HyperFrames 영상에서 CRT scanlines, glitch, film grain, 차트처럼 이름 붙은 시각이 필요할 때, 또는 `hyperframes add`와 `catalog`를 다룰 때 쓴다.[](source:front)
- 에이전트는 영어 검색어로 `catalog`를 검색하고, 맞는 item을 `add`로 설치해 장면에 mount하거나 복사해 붙인다. 맞는 item이 없으면 직접 만들기 전에 gap을 보고한다.[](source:cmd)[](source:rules)[](source:blockw)[](source:compw)
- 에이전트는 on-device 검색을 몰래 켜지 않고, 오프라인 설치를 약속하지 않으며, 검색어를 `feedback --search-miss` 외의 경로로 보내지 않는다.[](source:rules)[](source:s-fall)[](source:s-gap)
- 새 item을 upstream에 기여하는 절차와 item 품질 기준도 이 스킬에 들어 있다. 설치해 쓰는 사용자에게는 필요 없다.[](source:contribptr)

@answer scope="스킬 폴더 텍스트 13개 전부 읽음 · CLI 실행 안 함 · 부분 분석(폴더 밖 참조 미확인)"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=243a9028dc78fe13c6f64b1a5c199bc9939ccc06
@source front title="frontmatter(name, description)" path=hyperframes/hyperframes-registry/SKILL.md lines=1:4
@source plugin title="plugin 설치 안내" path=hyperframes/hyperframes-registry/SKILL.md lines=6:6
@source beacon title="usage beacon" path=hyperframes/hyperframes-registry/SKILL.md lines=8:8
@source intro title="도입" path=hyperframes/hyperframes-registry/SKILL.md lines=10:12
@source cmd title="Find and install 명령" path=hyperframes/hyperframes-registry/SKILL.md lines=16:21
@source rules title="Find and install 규칙" path=hyperframes/hyperframes-registry/SKILL.md lines=23:26
@source ptr title="search.md 안내" path=hyperframes/hyperframes-registry/SKILL.md lines=28:28
@source whatsin title="What's in it" path=hyperframes/hyperframes-registry/SKILL.md lines=30:47
@source blockw title="block 연결" path=hyperframes/hyperframes-registry/SKILL.md lines=51:51
@source compw title="component 연결" path=hyperframes/hyperframes-registry/SKILL.md lines=52:52
@source wrules title="연결 규칙" path=hyperframes/hyperframes-registry/SKILL.md lines=53:56
@source contribptr title="Contributing 안내" path=hyperframes/hyperframes-registry/SKILL.md lines=58:60
@source s-intro title="검색 우선 원칙과 예" path=hyperframes/hyperframes-registry/references/search.md lines=5:13
@source s-english title="영어 검색어 규칙" path=hyperframes/hyperframes-registry/references/search.md lines=15:15
@source s-drop title="설치 가능 여부와 dropped" path=hyperframes/hyperframes-registry/references/search.md lines=17:17
@source s-browse title="browse와 filter" path=hyperframes/hyperframes-registry/references/search.md lines=19:30
@source s-gap title="gap 보고" path=hyperframes/hyperframes-registry/references/search.md lines=32:44
@source s-fall title="CLI 불통과 오프라인 동작" path=hyperframes/hyperframes-registry/references/search.md lines=46:56
@source s-tier-a title="Search tiers 검색 원칙" path=hyperframes/hyperframes-registry/references/search.md lines=62:63
@source s-tier-env title="--json envelope와 dropped·unindexed" path=hyperframes/hyperframes-registry/references/search.md lines=64:65
@source s-tier-gap title="Search tiers gap 보고" path=hyperframes/hyperframes-registry/references/search.md lines=66:66
@source s-tier-od title="on-device 동의" path=hyperframes/hyperframes-registry/references/search.md lines=67:67
@source d-cmd title="catalog 명령 안내" path=hyperframes/hyperframes-registry/references/discovery.md lines=5:19
@source d-man title="manifest와 item 필드" path=hyperframes/hyperframes-registry/references/discovery.md lines=21:53
@source d-head title="Blocks 표의 성격" path=hyperframes/hyperframes-registry/references/discovery.md lines=57:59
@source d-shader title="Shader transitions" path=hyperframes/hyperframes-registry/references/discovery.md lines=61:63
@source d-gallery title="Transition galleries" path=hyperframes/hyperframes-registry/references/discovery.md lines=82:84
@source d-glass title="Liquid Glass" path=hyperframes/hyperframes-registry/references/discovery.md lines=102:104
@source d-vfx title="VFX" path=hyperframes/hyperframes-registry/references/discovery.md lines=114:116
@source d-code title="Code snippets와 Code Animations" path=hyperframes/hyperframes-registry/references/discovery.md lines=176:188
@source wb-intro title="block 기본 연결" path=hyperframes/hyperframes-registry/references/wiring-blocks.md lines=3:24
@source wb-attrs title="block 필수 속성" path=hyperframes/hyperframes-registry/references/wiring-blocks.md lines=26:36
@source wb-time title="block timeline 조정" path=hyperframes/hyperframes-registry/references/wiring-blocks.md lines=38:40
@source wb-pos title="block 위치와 여러 block" path=hyperframes/hyperframes-registry/references/wiring-blocks.md lines=42:61
@source wc-proc title="component 연결 절차" path=hyperframes/hyperframes-registry/references/wiring-components.md lines=3:14
@source wc-ex title="grain-overlay 예" path=hyperframes/hyperframes-registry/references/wiring-components.md lines=16:32
@source wc-prin title="component 원칙" path=hyperframes/hyperframes-registry/references/wiring-components.md lines=34:39
@source i-paths title="기본 설치 경로" path=hyperframes/hyperframes-registry/references/install-locations.md lines=3:15
@source i-json title="hyperframes.json과 경로 바꾸기" path=hyperframes/hyperframes-registry/references/install-locations.md lines=17:45
@source demo title="demo.html 규약" path=hyperframes/hyperframes-registry/references/demo-html-pattern.md
@source ex-b title="block 설치 예제" path=hyperframes/hyperframes-registry/examples/add-block.md
@source ex-c title="component 설치 예제" path=hyperframes/hyperframes-registry/examples/add-component.md
@source c-top title="기여 6단계 개요" path=hyperframes/hyperframes-registry/references/contributing.md lines=3:9
@source c-clar title="Clarify" path=hyperframes/hyperframes-registry/references/contributing.md lines=11:22
@source c-scaf title="Scaffold" path=hyperframes/hyperframes-registry/references/contributing.md lines=24:54
@source c-cap title="Build의 caption 규칙" path=hyperframes/hyperframes-registry/references/contributing.md lines=56:81
@source c-vfx title="Build의 VFX 규칙" path=hyperframes/hyperframes-registry/references/contributing.md lines=83:88
@source c-all title="Build의 공통 규칙" path=hyperframes/hyperframes-registry/references/contributing.md lines=90:105
@source c-val title="Validate" path=hyperframes/hyperframes-registry/references/contributing.md lines=107:112
@source c-prev title="Preview" path=hyperframes/hyperframes-registry/references/contributing.md lines=114:130
@source c-ship title="Ship" path=hyperframes/hyperframes-registry/references/contributing.md lines=132:169
@source c-gate title="Quality Gate 체크리스트" path=hyperframes/hyperframes-registry/references/contributing.md lines=171:180
@source t-cap title="Caption 템플릿" path=hyperframes/hyperframes-registry/references/templates.md lines=5:180
@source t-vfx title="VFX 템플릿" path=hyperframes/hyperframes-registry/references/templates.md lines=184:312
@source t-json title="registry-item.json 템플릿과 tag" path=hyperframes/hyperframes-registry/references/templates.md lines=316:366
@source t-comp title="Component 템플릿" path=hyperframes/hyperframes-registry/references/templates.md lines=370:417
@source q-one title="품질 기준의 한 규칙" path=hyperframes/hyperframes-registry/references/component-quality-bar.md lines=1:19
@source q-pass title="audit 두 단계와 mount harness" path=hyperframes/hyperframes-registry/references/component-quality-bar.md lines=21:53
@source q-fatal title="Fatal F1-F5" path=hyperframes/hyperframes-registry/references/component-quality-bar.md lines=55:92
@source q-fix title="Fixable X1-X8" path=hyperframes/hyperframes-registry/references/component-quality-bar.md lines=93:140
@source q-dup title="중복에서 남기는 쪽" path=hyperframes/hyperframes-registry/references/component-quality-bar.md lines=141:160
@source q-never title="Never cut N1-N7" path=hyperframes/hyperframes-registry/references/component-quality-bar.md lines=162:187
@source q-mech title="Mechanical first pass" path=hyperframes/hyperframes-registry/references/component-quality-bar.md lines=189:200
@source q-vis title="Visual pass" path=hyperframes/hyperframes-registry/references/component-quality-bar.md lines=202:209
@source q-cal title="Calibration" path=hyperframes/hyperframes-registry/references/component-quality-bar.md lines=211:237
@source q-chk title="품질 기준 체크리스트" path=hyperframes/hyperframes-registry/references/component-quality-bar.md lines=239:250
@source p-rule title="placeholder 한 규칙" path=hyperframes/hyperframes-registry/references/placeholder-material.md lines=3:17
@source p-ramp title="ink alpha 단계" path=hyperframes/hyperframes-registry/references/placeholder-material.md lines=19:50
@source p-depth title="색 없이 깊이 주기" path=hyperframes/hyperframes-registry/references/placeholder-material.md lines=52:68
@source p-kinds title="종류별 흑백 표현" path=hyperframes/hyperframes-registry/references/placeholder-material.md lines=70:91
@source p-acc title="accent 규칙" path=hyperframes/hyperframes-registry/references/placeholder-material.md lines=93:125
@source p-grad title="남기는 gradient" path=hyperframes/hyperframes-registry/references/placeholder-material.md lines=127:140
@source p-chk title="placeholder 체크리스트" path=hyperframes/hyperframes-registry/references/placeholder-material.md lines=142:149
@source x-hf title="hyperframes의 registry 검색 지시" path=hyperframes/hyperframes/SKILL.md lines=16:16
@source x-hfidx title="hyperframes의 index.html과 compositions" path=hyperframes/hyperframes/SKILL.md lines=14:14
@source x-cli title="hyperframes-cli 명령표의 Reuse 행" path=hyperframes/hyperframes-cli/SKILL.md lines=25:25
@source x-rem title="remotion-to-hyperframes의 검색 권유" path=hyperframes/remotion-to-hyperframes/SKILL.md lines=41:41
@source x-slide title="slideshow의 검색 권유" path=hyperframes/slideshow/SKILL.md lines=47:47
@source x-mu title="media-use caption reference의 registry 지목" path=hyperframes/media-use/audio/references/captions/authoring.md lines=43:43

## 에이전트는 효과를 어떻게 찾고 고르나? {#find-panel span=12}

이 패널은 효과가 필요해진 순간부터 item 하나를 고르거나 gap을 보고하기까지를 다룬다. 설치와 연결은 다음 패널이 이어받는다. 그림이 가장 흔한 경로만 보여 주므로, 생략한 것은 그림 아래와 각 노드 설명에서 글로 풀었다.

@workflow id=find-flow title="효과를 찾고 고르는 순서"
| need | 이름 붙은 효과 | external | source:front |
| query | 영어로 검색 | backend | source:cmd |
| fit | 결과가 맞나? | backend | source:s-tier-env |
| tier | words만 썼나? | backend | source:s-tier-od |
| consent | on-device 동의 | external | source:s-tier-od |
| gap | gap 보고, 직접 제작 | backend | source:s-gap |
| pick | item 고르기 | backend | source:wrules |
| need > query | |
| query > fit | |
| fit > pick | yes | emphasis |
| fit > tier | no |
| tier > consent | words |
| tier > gap | on-device |
| consent > query | 동의 |
| consent > gap | 거절 |

그림은 `catalog`의 browse 모드와 `--type`·`--tag` 좁히기, `dropped`·`unindexed` 점검, 오프라인 동작을 생략했다. 이 내용은 `영어로 검색`과 `결과가 맞나?` 설명에 있다. `거절` 간선은 원문이 직접 쓰지 않은 판정이며 `on-device 동의` 설명에서 근거를 밝혔다.

@steps id=find-steps
| st-need | 이름 붙은 효과 | 에이전트는 영상 작업 중 CRT scanlines, glitch, film grain, 차트처럼 이름 붙은 시각이 필요해지면 이 스킬을 쓴다. description은 "Use it before hand-building any named visual"이라고 하고 `hyperframes add`와 `catalog` 작업도 호출 맥락으로 든다.[](source:front) description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어가 있으면 켜진다는 뜻으로 읽으면 안 된다. `disable-model-invocation` 같은 호출 제한 필드는 원문에 명시 없음이다. 스킬이 시작되면 원문은 usage beacon `npx hyperframes events --skill=hyperframes-registry`를 한 번 실행하라고 한다. 스킬 이름이 CLI의 일반 telemetry와 함께 전송되고 로그인 상태면 계정과 연결되며 opt-out을 따른다고 적혀 있다.[](source:beacon) HyperFrames plugin 안에서 쓰면 `../hyperframes/references/plugin-installation.md`의 plugin execution rules를 따르라고 한다. 이 분석은 그 파일을 읽지 않았다.[](source:plugin) 판정 · 본문은 "faster and usually better"라는 권고 어조로 시작하고,[](source:intro) `search.md`는 "Search the catalog before writing motion by hand"라고 명령형으로 쓴다.[](source:s-tier-a) 그래서 시작 전 검색은 의무에 가깝다. 이 노드를 지나면 에이전트는 효과를 손으로 쓰지 않고 `영어로 검색`으로 간다. | find-flow | need |
| st-query | 영어로 검색 | 에이전트는 `npx hyperframes catalog --query "<what the beat should do, in English>" --json`을 실행한다.[](source:cmd) 영상이 일본어나 중국어여도 검색어는 영어로 쓴다. catalog가 영어로 색인되어 있어 다른 문자만 있으면 검색어가 비고 `No searchable words in query`가 나온다. 원문은 이것을 없는 item이 아니라 규칙 위반으로 보고, gap으로 보고하지 말라고 한다.[](source:rules)[](source:s-english) 화면에 보일 문구는 영상 언어로 써도 된다.[](source:s-english) 검색은 local이고 아무것도 보내지 않는다.[](source:rules) 기본 tier인 `words`는 이름·제목·설명이 검색어와 단어를 공유하는 item만 찾는다. `Search tiers` 절은 tag도 든다.[](source:s-intro)[](source:s-tier-a) 범위를 좁히려면 `--type block`이나 `--type component`와 `--tag <tag>`를 붙인다.[](source:rules) 원문은 목록을 눈으로 훑는 것을 느린 길이라고 하며 먼저 의도로 검색하라고 한다.[](source:s-intro) 둘러보기는 `catalog`, `catalog --type block`, `catalog --type block --tag social`, `catalog --json`, `catalog --human-friendly`로 한다. 표 모드와 `--json`은 목록만 보여 주고 아무것도 설치하지 않는다. `--human-friendly`는 고른 item을 바로 설치하는 picker라서 CI나 에이전트 작업에서는 `--json` 뒤 명시적 `add`를 쓰라고 한다.[](source:s-browse)[](source:d-cmd) | find-flow | query |
| st-fit | 결과가 맞나? | 에이전트는 결과가 나왔다는 사실로 tier를 추정하지 않고 `--json` envelope를 읽는다. envelope에는 `query`, `tier`(`on-device` 또는 `words`), `tier_detail`, `dropped`, `unindexed`, `shown`, `total`, `results`가 들어 있고, `top_score`는 점수를 내는 tier일 때만 붙는다.[](source:s-tier-env) 같은 약한 결과라도 `words`에서는 예상된 일이고 `on-device`에서는 버그라고 원문은 말한다. `top_score`에는 기준값이 없어서 통과·실패 판정이 아니라 근거로만 읽는다.[](source:s-tier-env) `dropped`는 registry가 설치할 수 없는 이름이 순위에 올랐다는 뜻이라 가장 강한 일치가 빠진다. `unindexed`는 index가 아예 보지 못하는 registry item 수다. 둘 다 검색어를 바꿔서는 해결되지 않는다. `unindexed`가 0보다 크면 `--on-device`를 다시 돌려 index를 새로 받는 것이 사용자에게 건넬 처방이다. `dropped`만 0보다 크면 `~/.hyperframes/catalog/`를 비워야 한다. 두 값은 결과가 아니라 이름 수라서 `total`보다 클 수 있다.[](source:s-tier-env)[](source:s-drop) 결과 중 하나가 효과를 해결하면 `item 고르기`로 가고, 해결하는 것이 없으면 `words만 썼나?`로 간다. | find-flow | fit |
| st-tier | words만 썼나? | 맞는 결과가 없을 때 에이전트는 먼저 어느 tier가 답했는지 본다. `words`가 답했다면 더 나은 tier가 남아 있으므로 사람에게 물을 차례다. 이미 `on-device`가 답했는데도 맞는 것이 없으면 물을 것이 없으므로 `gap 보고, 직접 제작`으로 간다. 후자는 원문이 보고를 "on either tier"에 요구한 데서 나온 판정이다.[](source:s-gap)[](source:s-tier-gap) `--json` 모드에는 prompt가 없고, 결과가 비었는데 더 나은 tier가 동의를 기다리면 같은 질문이 `warnings` 배열에 들어간다. 에이전트는 이 배열을 읽고 사람에게 직접 묻는다.[](source:s-tier-od) | find-flow | tier |
| st-consent | on-device 동의 | 이 노드에서 에이전트는 멈추고 사람에게 묻는다. `--on-device`는 의미로 순위를 매기지만 약 33 MB를 한 번 내려받는다. 받는 것은 `bge-small-en-v1.5`의 quantized ONNX build, tokenizer, registry의 catalog vector이고 모두 `~/.hyperframes/`에 캐시되며 프로젝트나 package에는 들어가지 않는다.[](source:s-tier-od) 원문은 크기를 소리 내어 말하고 사람이 정하게 하라고 하며 몰래 켜지 말라("never enable it silently")고 한다.[](source:rules)[](source:s-tier-od) 대화형 제안은 TTY에서만 뜬다. 사람이 동의하면 `--on-device`를 붙여 `영어로 검색`으로 되돌아가고, prompt를 건너뛰려면 `-y`를 함께 쓴다. 사람이 이 download가 무엇인지, 왜 이 모델인지, 무엇이 기기 밖으로 나가는지 물으면 `https://hyperframes.heygen.com/developers/catalog-search`를 안내하라고 한다. 이 분석은 그 URL을 열지 않았다.[](source:s-tier-od) 사람이 거절했을 때의 행동은 원문에 명시 없음이다. 판정 · 거절하면 맞는 item이 없는 상태가 남으므로 `gap 보고, 직접 제작`으로 간다고 읽었다.[](source:s-gap) | find-flow | consent |
| st-gap | gap 보고, 직접 제작 | 어느 tier에서든 맞는 것이 없으면 에이전트는 직접 만들기 전에 `npx hyperframes feedback --search-miss "<the query you ran>" --wanted "<the move you needed>" --tier <tier>`로 보고한다. `catalog --query`가 이 줄을 미리 채워 출력하고 `--json`에는 `report_gap`으로 들어 있어서 에이전트는 `--wanted`만 채우면 된다.[](source:rules)[](source:s-gap) `--wanted`에는 상상한 item 이름이 아니라 원한 효과를 쓴다. 이 명령은 검색어가 어딘가로 전송되는 유일한 경로이고, 평범한 검색이 "아무것도 보내지 않는다"는 약속을 지키도록 일부러 따로 둔 명령이다. 평점은 싣지 않는다.[](source:s-gap) `words`에서도 보고하는 이유는, on-device가 동의가 필요한 ~33 MB 다운로드라서 에이전트 실행 대부분이 `words`에 머물고, on-device를 기다리면 보고가 거의 사라지기 때문이다.[](source:s-gap)[](source:s-tier-gap) 보고가 끝나면 에이전트는 효과를 직접 만든다. 직접 만드는 방법은 이 스킬에 명시 없음이다. CLI가 registry에 닿지 못할 때 원문은 `curl -s https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry/registry.json`으로 raw manifest를 보는 fallback을 적는다. 이 분석은 실행하지 않았다.[](source:s-gap)[](source:s-fall) | find-flow | gap |
| st-pick | item 고르기 | 에이전트는 결과에서 맞는 가장 큰 단위를 고른 뒤 고친다.[](source:wrules) 설치한 item은 평범한 소스라서 바꾸고 줄이고 restyle할 수 있다.[](source:intro) 고를 때 원문이 알려 주는 것이 있다. `discovery.md`의 표는 손으로 관리하는 표본이라 180개 block 중 97개만 묶고 의도적으로 덜 담았다. 그래서 표에 없다는 사실은 registry에 없다는 증거가 아니고, 증거는 빈 `catalog --query ... --json` 결과뿐이다.[](source:d-head) shader-transition block의 이름과 HyperShader runtime의 내부 이름은 다르다. 설치 때 함께 오는 showcase HTML이 정식 이름을 보여 준다. 한 영상에 shader transition은 2개 이하로 쓴다.[](source:d-head)[](source:d-shader) Transition gallery는 CSS 전환을 고르는 참고용이고 그대로 embed하지 않는다.[](source:d-gallery) Liquid Glass block은 WebGPU가 켜진 Brave나 Chrome canary가 필요하고 `PRODUCER_HEADLESS_SHELL_PATH`로 그 브라우저를 가리키며 engine이 `--enable-unsafe-webgpu`를 자동으로 넘긴다. 이 조건을 설치 전에 사람에게 알리라는 문장은 원문에 명시 없음이다.[](source:d-glass) code snippet 24종은 chrome만 다르고 구조·wiring·설치가 같아서 이름으로 고른다.[](source:d-code) | find-flow | pick |

## 고른 item은 어떻게 설치하고 장면에 연결하나? {#install-panel span=12}

이 패널은 `item 고르기` 다음부터 장면에 붙이고 확인하기까지를 다룬다. block과 component는 연결법이 달라 `block인가?`에서 갈라진다.

@workflow id=install-flow title="설치하고 연결하는 순서"
| add | add로 설치 | backend | source:cmd |
| kind | block인가? | backend | source:whatsin |
| mount | data 속성으로 mount | backend | source:wb-attrs |
| paste | 복사해 합치기 | backend | source:wc-proc |
| verify | lint와 preview | backend | source:ex-b |
| add > kind | |
| kind > mount | block | emphasis |
| kind > paste | component |
| mount > verify | |
| paste > verify | |

그림은 variable 지정, beat 맞춤, 설치 경로 바꾸기를 생략했다. 이 내용은 `add로 설치`, `data 속성으로 mount`, `복사해 합치기` 설명에 있다.

@steps id=install-steps
| st-add | add로 설치 | 에이전트는 `npx hyperframes add <name> --json`을 실행한다. 이 명령은 쓴 파일 목록과 mount snippet을 출력한다.[](source:cmd) `add <tag>`는 그 tag를 가진 block을 모두 설치하고 dependency를 먼저 설치한다.[](source:rules) 각 item의 `registry-item.json`에는 `name`, `type`, `title`, `description`, `tags`, `dimensions`와 `duration`(block만), `files`, 다른 item에 의존할 때의 `registryDependencies`가 있다.[](source:d-man) `add`는 전에 설치한 item이라도 네트워크가 필요하다. 원문은 manifest만 캐시되고 item 파일은 설치할 때마다 받기 때문이라고 설명한다. 오프라인에서는 검색과 item 확인까지만 되고 설치는 실패하므로 사용자에게 오프라인 설치를 약속하지 않는다.[](source:rules)[](source:s-fall) 설치 경로는 `hyperframes.json`이 정한다. 파일이 없으면 `add`가 기본값으로 만든다. block은 `compositions/<name>.html`, component는 `compositions/components/<name>.html`에 쓰이며, `paths.blocks`와 `paths.components`가 각 접두어를 바꾼다. `paths.blocks`를 `scenes`로 바꾸면 `scenes/data-chart.html`에 쓰이고 출력 snippet도 바뀐 경로를 반영한다.[](source:i-paths)[](source:i-json) | install-flow | add |
| st-kind | block인가? | 에이전트는 설치한 item이 block인지 component인지 가른다. block은 자기 timeline을 가진 장면 하나이고, component는 장면에 병합하는 snippet이다.[](source:whatsin) block은 고정 dimensions와 duration을 갖고 component는 갖지 않는다.[](source:c-clar) 판단 근거는 `add`가 출력한 설치 경로와 item의 `type`이다. 둘이 어떻게 보이는지의 구체적 출력은 CLI를 실행하지 않아 확인하지 못했다. 같은 item이 block 목록과 component 목록 중 어느 쪽인지는 `What's in it`의 두 표가 알려 준다. block에는 transition, overlay와 lower third, title card와 kinetic type, social·chat·UI card, code·chart·data·map, 3D·shader·background가 있고(예: `beat-freeze-cut`, `lt-clean-bar`, `data-chart`, `aurora`). component에는 motion primitive와 text effect, caption style, camera move, product demo와 UI prop, texture·particle·effect가 있다(예: `blur-in`, `caption-clip-wipe`, `camera-shake`, `grain-overlay`).[](source:whatsin) | install-flow | kind |
| st-mount | data 속성으로 mount | block은 다른 composition 안의 `<div>`로 mount한다. 필수 속성은 `data-composition-src`(index.html 기준 block 파일 경로), `data-composition-id`(block 내부 id와 같아야 한다), `data-start`(host timeline에서 나타나는 초), `data-duration`(초, block 자체 duration 이하), `data-track-index`(클수록 앞), `data-width`와 `data-height`(block 크기와 맞춘다)다.[](source:wb-attrs) `add`가 출력한 snippet이 출발점이다.[](source:blockw) block 내부 GSAP timeline은 독립으로 돌고, runtime이 sub-composition을 읽어 `window.__timelines` 등록을 찾은 뒤 `data-start`만큼 어긋나게 host와 맞춰 seek한다. 그래서 host의 GSAP 코드에서 block timeline을 참조하지 않는다.[](source:wb-time) 화면 일부에만 놓으려면 `<div>`에 `style="position: absolute; right: 0; top: 0; width: 40%; height: 100%;"` 같은 CSS를 준다. block을 여럿 쓰려면 `data-start`가 겹치거나 겹치지 않는 `<div>` 형제를 더하고 각 timeline은 독립이다.[](source:wb-pos) 맞는 가장 큰 단위를 가져오고, 설치한 item의 id 접두어는 바꾸지 않는다. 두 item의 id가 충돌하지 않게 하려는 규칙이다.[](source:wrules) item은 자기 variable을 갖는다. 한 mount에만 값을 주려면 host에 `data-variable-values`를 쓰고, `add --vars '{"title":"…"}'`가 그 속성을 써 준다. 색과 font variable은 브랜드 값을 가리키게 한다.[](source:wrules) beat에 맞춘 block은 `npx hyperframes beats --json`의 beat 시간에서 mount의 `data-start`를 뺀 값을 hit time으로 쓴다.[](source:wrules) 설명용 예시 · `data-chart`를 5초에 15초 동안 화면 오른쪽 40%에 놓는 예제가 원문에 있다.[](source:ex-b) | install-flow | mount |
| st-paste | 복사해 합치기 | component는 timeline이 없고 host composition의 timeline에 참여한다.[](source:wc-proc) 에이전트는 설치된 `compositions/components/<name>.html`을 열어 상단 comment header의 사용법을 읽는다. 그리고 HTML 요소는 `<div data-composition-id="...">` 안에, CSS는 composition의 `<style>`에, JS 준비는 timeline 코드 앞의 `<script>`에, timeline call은 component가 노출할 때만 GSAP timeline에 복사한다.[](source:compw)[](source:wc-proc) `grain-overlay`는 CSS만 쓰는 예라서 overlay div와 CSS keyframes만 붙이고 GSAP call이 필요 없다.[](source:wc-ex) `shimmer-sweep`은 timeline 통합이 필요한 예다. 대상 요소를 `.shimmer-sweep-target`으로 감싸고 `.shimmer-mask` 자동 주입 script와 CSS를 붙인 뒤 `tl.fromTo`로 `--shimmer-pos`를 `-20%`에서 `120%`로 1.2초, `power2.inOut`, `stagger` 0.15로 1.5초 지점에 더한다. 이 값들은 원문의 예제 값이다.[](source:ex-c) 조절할 수 있는 값은 `--shimmer-color`, `--shimmer-width`(기본 20%), `--shimmer-angle`(기본 120deg)와 timeline의 `duration`, `ease`, `stagger`다.[](source:ex-c) component는 host composition의 dimensions와 duration을 물려받으므로 z-index를 내용 기준으로 맞춘다.[](source:wc-prin) component는 저장소에서 `demo.html`을 함께 제공하지만 `add`로 설치되지 않는다. block은 이미 standalone composition이라 demo가 필요 없다.[](source:demo) | install-flow | paste |
| st-verify | lint와 preview | 연결이 끝나면 에이전트는 `hyperframes lint`를 돌려 구조 문제를 잡고 `hyperframes preview`로 본다. 두 예제가 이 순서를 쓰고, `wiring-components.md`는 연결 뒤 `lint`를 돌리라고 말한다.[](source:ex-b)[](source:ex-c)[](source:wc-prin) 예제의 마지막 단계는 선택("Customize (optional)")이다. block이면 `compositions/data-chart.html`에서 script 맨 위의 data 배열과 CSS 색을 고친다.[](source:ex-b) 이 스킬이 합격 기준 수치나 반복 횟수를 정하는 문장은 원문에 명시 없음이다. 렌더와 `check` 같은 최종 확인은 이 스킬 원문에 명시 없음이고, 이 스킬의 동작은 연결과 `lint`·`preview`에서 끝난다고 읽었다. | install-flow | verify |

## 언제 켜지고 무엇을 강제하거나 금지하나? {#rules-panel span=12}

켜지는 조건은 description이 정한다. 원문 그대로 가져온 frontmatter는 다음과 같다.

@code source=front language=yaml

description은 모델이 판단할 때 참고하는 설명이다. 이 단어가 있으면 켜진다는 사전이 아니다. 호출 제한 필드는 이 파일에 없다. 이 스킬을 쓰지 말아야 하는 조건을 적은 문장도 원문에 명시 없음이다.

원문이 선을 긋는 곳은 두 군데다. `hyperframes registry`라는 명령은 없고 검색은 `catalog`, 설치는 `add`다.[](source:cmd) 영어가 아닌 글자만 있는 검색어는 아무것도 찾지 못한다.[](source:s-english)

| 규칙 | 강도 | 조건과 이유 |
| --- | --- | --- |
| 이름 붙은 효과는 손으로 쓰기 전에 `catalog`를 검색한다 | 명령형 | 먼저 의도로 검색한다. 목록을 훑는 것은 느린 길이다.[](source:s-intro)[](source:s-tier-a) |
| 검색어는 영어로 쓴다 | "Always" | 영상 언어와 상관없다. 영어로 색인되어 있기 때문이다.[](source:s-english) |
| on-device 검색을 몰래 켜지 않는다 | 금지 | 약 33 MB 다운로드를 말하고 사람이 정한다.[](source:rules)[](source:s-tier-od) |
| 맞는 item이 없으면 직접 만들기 전에 보고한다 | 명령형 | `words`와 `on-device` 모두에서 한다.[](source:s-gap)[](source:s-tier-gap) |
| 보고에는 원한 효과를 쓰고 상상한 item 이름을 쓰지 않는다 | 명령형 | 존재하지 않는 이름을 담은 보고는 쓸모가 없다.[](source:s-gap) |
| `No searchable words in query`는 gap으로 보고하지 않는다 | 금지 | 영어가 아닌 검색어 때문에 나온 결과다.[](source:rules)[](source:s-tier-a) |
| 오프라인 설치를 약속하지 않는다 | 금지 | `add`는 항상 네트워크가 필요하다.[](source:s-fall) |
| CI나 에이전트에서는 `--human-friendly`를 쓰지 않는다 | 권고("prefer") | 고른 item을 바로 설치하기 때문이다. `--json` 뒤 `add`를 쓴다.[](source:s-browse) |
| 설치한 item의 id 접두어를 바꾸지 않는다 | 규칙 | 두 item이 충돌하지 않게 한다.[](source:wrules) |
| `registry/registry.json`을 손으로 고치지 않는다 | 금지 | 기여할 때만 해당한다. 아래 기여 패널에서 다룬다.[](source:c-ship) |

@facts id=registry-numbers
| 약 450개 | block과 component를 합친 registry 규모. description의 어림값이고, component 수는 원문에 명시 없음이다.[](source:front) |
| 180 blocks | `discovery.md`가 센 block 수. 같은 문서의 표가 묶은 것은 97개이고 97 ÷ 180 ≈ 54%다.[](source:d-head) |
| 약 33 MB | on-device 모델을 한 번 내려받는 크기. 사람이 동의한 뒤에만 받는다.[](source:s-tier-od) |
| 24h | manifest 갱신 주기(TTL). 갱신에 실패해도 마지막으로 받은 manifest로 검색과 목록은 계속된다.[](source:s-tier-env)[](source:s-fall) |
| 2개 이하 | 한 영상에 쓸 shader transition 수. 권고다.[](source:d-shader) |

@callout level=warning title="에이전트가 멈추고 사람에게 묻는 지점"
| 검색에서는 on-device 다운로드 한 곳이다. 사람이 크기를 알고 정하며, 에이전트가 먼저 켜지 않는다.[](source:s-tier-od) |
| 기여에서는 사용자가 만들 item을 에이전트에게 설명하는 Clarify 단계와, GitHub 계정이 없을 때 가입과 `gh auth login`을 안내하는 지점이 있다.[](source:c-clar)[](source:c-ship) 원문의 Ship 단계에 `git push`와 `gh pr create`가 들어 있지만 실행 전 사용자 확인을 정한 문장은 원문에 명시 없음이다. 판정 · push 전에 사람에게 확인받는 편이 안전하다.[](source:c-ship) |

## 새 item을 기여하려면 어떤 순서를 따르나? {#contrib-panel span=12}

이 절은 upstream PR을 낼 때만 쓴다.[](source:contribptr) 에이전트는 사용자를 아이디어에서 병합된 PR까지 안내하고, `contributing.md`는 Clarify, Scaffold, Build, Validate, Preview, Ship의 여섯 단계를 정한다.[](source:c-top)

@workflow id=contrib-flow title="기여 6단계"
| clarify | Clarify | external | source:c-clar |
| scaffold | Scaffold | backend | source:c-scaf |
| build | Build | backend | source:c-all |
| validate | Validate | backend | source:c-val |
| preview | Preview | backend | source:c-prev |
| ship | Ship | external | source:c-ship |
| clarify > scaffold | |
| scaffold > build | |
| build > validate | |
| validate > preview | |
| preview > ship | | emphasis |

그림은 직선만 그렸다. `Validate`가 실패하면 `Build`로 돌아간다는 문장은 원문에 명시 없음이고, 원문은 오류 0개를 요구할 뿐이다.

@steps id=contrib-steps
| st-clarify | Clarify | 에이전트는 사용자에게 무엇을 만드는지 묻는다. item은 두 종류다. block(`registry/blocks/`, type `hyperframes:block`)은 고정 dimensions와 duration을 가진 독립 composition이고 caption style, VFX, title card, lower third가 해당한다. component(`registry/components/`, type `hyperframes:component`)는 dimensions와 duration이 없고 어떤 composition 크기에도 맞는 snippet이다. 이어서 효과의 한 문장 설명, 시각 reference(URL, screenshot, 설명), 누가 언제 쓰는지를 묻는다.[](source:c-clar) | contrib-flow | clarify |
| st-scaffold | Scaffold | 에이전트는 `registry/blocks/{block-name}/` 또는 `registry/components/{component-name}/`에 `{name}.html`과 `registry-item.json`을 만든다.[](source:c-scaf) 모든 element id에 2~3글자 접두어를 붙인다. `cap-hormozi`는 `hz`, `cap-typewriter`는 `tw`, `vfx-chrome`은 `vc`가 원문의 예다. sub-composition 안에서 id가 충돌하지 않게 하려는 규칙이다.[](source:c-scaf) `registry-item.json`은 `templates.md`의 정식 템플릿을 쓴다. block 템플릿은 `dimensions`와 `duration`을 갖고 `target`이 `compositions/<name>.html`이며, component 템플릿은 둘 다 없고 `target`이 `compositions/components/<name>.html`이다.[](source:t-json) | contrib-flow | scaffold |
| st-build | Build | 에이전트는 type에 맞는 템플릿을 적용한다. caption은 `templates.md`의 Caption 템플릿, VFX는 Three.js 기반 VFX 템플릿, component는 배경이 투명한 snippet 템플릿이다.[](source:c-cap)[](source:t-cap)[](source:t-vfx)[](source:t-comp) 모든 type이 지킬 규칙은 `data-composition-id`가 `window.__timelines["id"]`와 같아야 하고, `gsap.timeline({ paused: true })`를 항상 쓰며, `Math.random()`과 `Date.now()`를 쓰지 않는 것이다.[](source:c-all) item이 싣고 오는 파일은 script가 경로를 만들 때 `__hyperframes.assetUrl("assets/...")`로 불러야 한다. `src`와 `href` 속성은 mount될 때 rebase되지만 script 안 문자열은 rebase되지 않아 맨 `"assets/..."`가 `compositions/<name>/` 아래에서 404가 나기 때문이다. item의 asset이 프로젝트의 `assets/`에 설치되는 경우(target이 `compositions/<name>.html`)는 프로젝트 루트 경로를 그대로 쓴다.[](source:c-all) 각 type의 세부 규칙은 아래 표에 있다. | contrib-flow | build |
| st-validate | Validate | 에이전트는 `hyperframes lint`가 오류 0개, `hyperframes check --no-contrast`가 console error 0개일 때까지 돌린다.[](source:c-val) 끝의 Quality Gate 체크리스트는 `check`를 `--no-contrast` 없이 적는다. 두 문장이 다르며 어느 쪽이 우선인지는 원문에 명시 없음이다.[](source:c-gate) 원문은 `component-quality-bar.md`에서 `check`는 시각 검사가 아니라고 못박는다. 빈 render도 유효한 render라서 아무것도 그리지 않는 composition이 `check`를 통과한다.[](source:q-pass) | contrib-flow | validate |
| st-preview | Preview | 에이전트는 `hyperframes render -o preview.mp4`로 preview 영상을, `hyperframes snapshot --at "1.0,3.0,5.0,7.0"`로 시각 QA용 snapshot을 만들고 `npx hyperframes publish`로 hyperframes.studio에 올려 리뷰어가 보게 한다.[](source:c-prev) catalog 기본 PNG는 `docs/images/catalog/{kind}/{name}.png`에 두며 `{kind}`는 `blocks` 또는 `components`다. HeyGen 내부 기여자는 저장소 루트에서 `scripts/upload-docs-images.sh`를 돌리고(AWS profile `engineering-767398024897` 필요), 외부 기여자는 PR 설명에 preview MP4를 붙이면 maintainer가 병합 전에 올린다. `registry-item.json`에 `preview`가 있으면 카드가 `poster` URL을 쓰고, `poster`가 없는 `preview`는 이미지 fallback이 없다.[](source:c-prev) | contrib-flow | preview |
| st-ship | Ship | 원문은 이 단계의 모든 항목이 필수이고 하나라도 빠지면 catalog entry가 깨진다고 한다.[](source:c-ship) 순서는 branch `feat/registry-{name}` 만들기, `npx oxfmt registry/{kind}/{name}/*.html`, `npx tsx scripts/generate-registry-items.ts`로 `registry/registry.json` 재생성, `npx tsx scripts/generate-catalog-pages.ts`, `npx hyperframes publish`, `git add registry/{kind}/{name}/ registry/registry.json docs/catalog/`, `git commit -m "feat(registry): add {name} — {one sentence}"`, `git push origin feat/registry-{name}`, `gh pr create`다. `registry.json`은 손으로 고치지 않는다. 손으로 넣은 항목은 다음 재생성 때 사라지고, 디렉터리가 없어진 항목이 남으면 `hyperframes add <name>`이 이름은 찾지만 파일이 없어 실패해서 더 나쁘다.[](source:c-ship) GitHub 계정이 없으면 가입한 뒤 `gh auth login`을 안내한다.[](source:c-ship) 끝에는 8개 항목의 Quality Gate 체크리스트가 있다. `lint` 오류 0, `check` console error 0, `oxfmt --check` 통과, `registry.json` 갱신, 문서 페이지 생성, `publish` 실행, preview MP4 또는 PNG, 모든 id의 유일성과 접두어다.[](source:c-gate) 이 분석은 이 명령을 하나도 실행하지 않았다. | contrib-flow | ship |

Build 단계의 type별 규칙은 찾아보는 용도라 표로 정리한다.

| 대상 | 규칙 | 강도 |
| --- | --- | --- |
| caption 글자 크기 | 비례폭 font는 96px 이상, monospace는 64-72px다.[](source:c-cap) | "Non-negotiable" |
| caption 가독성 | `-webkit-text-stroke` 2-3px 또는 여러 겹 `text-shadow`로 읽기 쉽게 한다.[](source:c-cap) | "Non-negotiable" |
| caption 글자 맞춤 | 모든 group에 `window.__hyperframes.fitTextFontSize()`를 호출한다.[](source:c-cap) | "Non-negotiable" |
| caption hard kill | 모든 group 끝에 `tl.set(groupEl, { opacity: 0, visibility: "hidden" }, g.end)`로 hard kill한다.[](source:c-cap)[](source:t-cap) | "Non-negotiable", 템플릿은 "mandatory" |
| caption from·set 병용 | 같은 위치에서 `tl.from(el, { opacity: 0 })`와 `tl.set(el, { opacity: 1 })`를 함께 쓰지 않는다. from이 set을 덮어쓰므로 `tl.to`를 쓴다.[](source:c-cap) | 금지("Never") |
| 글자 단위 animation | 각 글자를 `{prefix}-ch-{group}-{char}` id의 `<span>`으로 감싼다. 커서 같은 장식은 CSS animation이 seek되지 않으므로 `tl.set`을 일정 간격으로 쓴다.[](source:c-cap) | 규칙 |
| VFX 렌더 방식 | `three@0.147.0` CDN을 쓰고 `tl.eventCallback("onUpdate", renderScene); renderScene();`로 그린다. `requestAnimationFrame`은 쓰지 않는다.[](source:c-vfx)[](source:t-vfx) | 규칙 |
| VFX 상태와 난수 | 상태 proxy 패턴(GSAP이 plain object를 움직이고 render 함수가 읽는다)과 seeded PRNG `mulberry32`를 쓴다.[](source:c-vfx)[](source:t-vfx) | 규칙 |
| component snippet | `data-composition-id`와 `window.__timelines`를 두지 않는다. 부모 composition이 timing을 쥐고, class와 id는 이름 접두어를 쓴다. 배경은 `transparent`다.[](source:t-comp) | 템플릿 지침 |

## item은 어떤 기준으로 남고 어떤 기준으로 빠지나? {#quality-panel span=12}

`SKILL.md`는 품질 기준을 `component-quality-bar.md`에 둔다.[](source:contribptr) 이 문서는 item 심사 기준이며, 설치해 쓰는 에이전트가 따를 절차가 아니다. 기준은 결함을 직접 확인한 근거에서 나온 것이라고 문서가 말한다.[](source:q-one)

한 규칙은 "item이 설치한 파일 하나를 자기 ground 위에 단독으로 mount했을 때 이름이 약속한 주제를 그리고 설명대로 움직이면 자리를 얻는다"이다. 이를 못 지키고 다른 item이 하지 않는 것으로 고칠 수도 없으면 삭제한다.[](source:q-one)

심사는 두 단계다. mechanical pass는 grep과 hash로 중복, timeline 없음, 금지 hex, 빈 markup, 이름 불일치, 범위 없는 변수를 찾고, visual pass는 렌더해 눈으로 본다. 기계 신호는 후보일 뿐 판정이 아니고, 렌더하지 않은 item은 통과가 아니다.[](source:q-pass)[](source:q-mech)[](source:q-vis)

mount harness는 세 가지를 지킨다. `data-composition-id`가 있는 파일은 `data-composition-src="./<name>.html"`을 가진 clip으로 mount하고 없는 snippet은 `class="clip"` div에 붙여 넣는다. item 자신의 바탕색(ground)을 `demo.html` body 규칙에서 가져온다. GSAP을 불러 paused root timeline을 등록한 뒤 `hyperframes snapshot . --at 0.05,1.2,2.5,4.0 --no-end`로 contact sheet를 읽는다.[](source:q-pass)

잘못된 harness가 만든 오판 사례가 보정 표(Calibration)에 있다. 어두운 stage 때문에 대비가 약 1.5:1로 나온 `spring-scale-in`, 복귀 상태가 recipe의 `from` 상태라 비어 보인 `confetti`, sub-composition을 inline해서 검게 나온 `char-slam-explode`다.[](source:q-cal)

| 분류 | 뜻과 근거 |
| --- | --- |
| F1 Fatal | 설명한 주제가 파일에 없다. 이름을 다른 item 이름으로 바꿔도 파일이 그대로면 label만 붙은 generic shell이다.[](source:q-fatal) |
| F2 Fatal | 살아남는 다른 item과 motion fingerprint와 markup skeleton이 모두 같다. wipe 하나가 같은 속성으로 8번 있다.[](source:q-fatal) |
| F3 Fatal | 제대로 mount하고 recipe를 적용해도 frame이 비어 있다. frame 4장과 원인이 근거다.[](source:q-fatal) |
| F4 Fatal | 설명한 사건이 일어나지 않는다. 예를 들어 두 번째 panel을 드러내지 않는 wipe다.[](source:q-fatal) |
| F5 Fatal | frame N이 frame N-1에 닫힌 식 없이 의존해 seek 가능하게 만들 수 없다. 드물다.[](source:q-fatal) |
| X1 Fixable | `__timelines` 등록이 없다. 새 component 213개 중 97개가 이 상태라고 한다. 10~15분의 수리로 본다.[](source:q-fix) |
| X2 Fixable | 이름이 주장하는 기법이 코드에 없다. 예: `spring-*`에 `elastic`, `back.`, `bounce`가 없다. 코드 영역만 grep한다.[](source:q-fix) |
| X3 Fixable | 1920x1080에서 글자 대비가 4.5:1 미만이거나 의미 있는 가장 작은 요소가 약 24px 미만이다.[](source:q-fix) |
| X4-X8 Fixable | 대체 gradient의 보라·파랑 palette, theme token 없는 하드코딩 ink, markup 없음, `Math.random()` 기반 scatter, `min`·`max`가 없는 number variable이다.[](source:q-fix) |
| N1-N7 Never cut | 색 자체가 효과인 경우, 실제 제품을 그린 경우, 의도적 정지, 환경 set, 복귀 상태가 `from` 상태인 경우, 부착형 snippet은 각각 해당 기준에서만 면제된다. `origin/main`에 이미 있는 36개는 audit 범위 밖이다.[](source:q-never) |

중복 묶음에서는 한 item만 남기며 순서가 있다. 공유 motion이 실제로 하는 일을 설명하는 이름, 그다음 그 이름에만 맞는 markup이 더 많은 쪽, 그다음 이미 `origin/main`에 있는 쪽을 남긴다. 이름이 공유 구현이 하지 않는 것을 주장하는 item은 절대 남기지 않는다.[](source:q-dup)

묶음의 모든 item이 F1이면 묶음을 통째로 자른다. 같은 motion이라도 주제가 다르면 중복이 아니다.[](source:q-dup) environment set은 frame 사이 PSNR이 45 이상이고 실제로 움직이는 것은 17~24라는 측정값이 문서에 있다.[](source:q-never)

**placeholder는 색을 쓰지 않는다.** registry item은 사용자의 screenshot이나 수치 자리에 대역 내용을 싣고, 이 대역은 monochrome이다. 이유는 placeholder 색이 항상 임의여서 250개 item에 걸쳐 같은 세 가지 임의의 hue가 catalog의 정체성이 되기 때문이다.[](source:p-rule)

규칙은 이렇다. placeholder는 composition의 ink를 ground 위에 네 단계 alpha로 얹은 것과 hairline만 쓰고, accent는 한 composition의 element 하나에만 쓰며 placeholder에는 쓰지 않는다.[](source:p-rule)

@facts id=ink-ramp
| L1 72% | 주제. 차트 막대, 채운 logo mark, 앞의 avatar.[](source:p-ramp) |
| L2 45% | 보조. 비교 series, 뒤의 avatar, 보조 icon.[](source:p-ramp) |
| L3 18% | 미디어 fill과 skeleton 글줄.[](source:p-ramp) |
| L4 8% | 안쪽에 들어간 plate 내부. 카드를 얹는 tray.[](source:p-ramp) |
| hair 14% | 모든 1px 경계선.[](source:p-ramp) |

각 단계는 아래 단계의 alpha보다 1.6배 이상이어야 한다. 72 ÷ 45 = 1.6이고 45 ÷ 18 = 2.5, 18 ÷ 8 = 2.25로 모두 만족한다. 이 이상 단계를 더하려는 충동은 palette가 아니라 layout을 고쳐야 한다는 신호다.[](source:p-ramp)

대비는 두 ground에서 쟀다. L1이 7.7:1(밝은 `#fcfcfd`)과 8.9:1(어두운 `#1b1230`), L2가 3.1:1과 4.4:1이고 L3·L4는 설계상 3:1 미만이다. 따라서 글자는 L1 아래로 내리지 않고 L2는 비교해야 하는 graphic의 하한이며 L3·L4는 면에만 쓴다.[](source:p-ramp)

깊이는 value 단계, hairline, 여백, 가장 고운 질감 순서로 만든다. 그림자는 무채색이고 퍼진 것만 허용하며 색이 있는 glow는 금지다.[](source:p-depth) 막대 안의 gradient가 금지인 이유는 가장 높은 막대가 눈이 높이를 비교하는 자리에서 가장 옅어지기 때문이다.[](source:p-kinds)

accent는 의미가 곧 accent인 경우(선택된 tier, 현재 단계, count-up이 도착하는 수치)에만 한 element에 쓴다.[](source:p-acc) 남기는 gradient는 물리적 표면, sheen과 sweep, scrim과 vignette, gradient가 주제인 효과(aurora, liquid glass, chromatic aberration, grain, shader transition) 네 종류뿐이다.[](source:p-grad) 금지 hex는 `#7c3aed`, `#2563eb`, `#6366f1`, `#8b5cf6`, `#a855f7`, `#4f46e5` 여섯 개다.[](source:p-chk)

## 이 스킬은 흐름 속 어디에 놓이나? {#position-panel span=12}

`hyperframes/relations.md`의 R02, R09, R13, R17, R18, R26, R30, R32로 확인한 위치다. 이 스킬은 묶음 `build-video`의 선택지이고, 전체 흐름은 `hyperframes/_group-build-video/build-video.html`에 있다.

@workflow id=position-flow title="build-video 안의 위치"
| p-hf | hyperframes | frontend |
| p-reg | hyperframes-registry | backend |
| p-proj | 프로젝트 compositions | database |
| p-hf > p-reg | R02 넘김 | emphasis |
| p-reg > p-proj | R26 공유 상태 | emphasis |

R26은 공유 상태라서 화살표는 파일을 쓰는 방향일 뿐 선후 관계가 아니다. 이 스킬을 가리키거나 이 스킬이 가리키는 나머지 관계(R09, R13, R17, R18, R30, R32)는 그림에서 빼고 아래 표에 남겼다.

@steps id=position-steps
| st-p-hf | hyperframes | `/hyperframes`는 이름 붙은 효과·transition·caption style·차트·카드를 손으로 쓰기 전에 registry를 검색하라고 한다. 강제가 아니라 조건부 권고이며 이 스킬로 넘긴다.[](source:x-hf) | position-flow | p-hf |
| st-p-reg | hyperframes-registry | 이 페이지의 스킬이다. `catalog`로 찾고 `add`로 설치해 장면에 연결한다. | position-flow | p-reg |
| st-p-proj | 프로젝트 compositions | `add`가 설치한 block은 `compositions/`에 쓰이고, `/hyperframes`의 `index.html`이 `compositions/`의 sub-composition을 mount한다. 설치 경로는 `hyperframes.json`이 정한다. 파일을 통한 연결이라 선후 관계는 없다.[](source:x-hfidx)[](source:blockw)[](source:i-paths) | position-flow | p-proj |

| 관계 | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| R02 hyperframes에서 | 이름 붙은 효과·전환·caption style·차트·카드 요청 | 검색 결과와 설치된 파일 | 손으로 쓰기 전에 검색한다. 조건부 의무 어조다.[](source:x-hf) |
| R09 hyperframes-cli가 가리킴 | 명령표 Reuse 행의 `catalog`, `add` 안내 | 없음 | 참고 관계다. 의무 표현이 없다.[](source:x-cli) |
| R17·R18 remotion-to-hyperframes, slideshow가 가리킴 | `catalog --query` 검색 권유 | 검색 결과 | 스킬 이름이 아니라 명령으로 지목한다.[](source:x-rem)[](source:x-slide) |
| R32 media-use가 가리킴 | marker highlight 같은 효과는 registry를 검색하라는 권유 | 검색 결과 | 스킬 이름 `/hyperframes-registry`로 지목한다.[](source:x-mu) |
| R26 hyperframes와 공유 상태 | `compositions/`, `compositions/components/`, `hyperframes.json` | 설치한 block 파일 | `hyperframes` CLI(`add`)가 쓰고 `/hyperframes`의 `index.html`이 mount한다.[](source:blockw)[](source:i-paths) |
| R30 hyperframes로 가리킴 | Liquid Glass 등은 `/hyperframes`의 `references/runtimes.md`의 runtime이라는 안내 | 없음 | 참고 관계다.[](source:d-glass)[](source:d-vfx) |
| R13 plugin 안일 때 | `plugin-installation.md`를 따르라는 첫 줄 | 없음 | 조건은 plugin 안일 때뿐이다.[](source:plugin) |

## 어디까지 확인했고 무엇이 남았나? {#audit-panel span=12}

이 스킬 폴더의 텍스트 13개를 전부 읽었다. 바이트 수는 `SKILL.md` 4500, `references/search.md` 9416, `references/discovery.md` 16593, `references/wiring-blocks.md` 2641, `references/wiring-components.md` 1723, `references/install-locations.md` 1519, `references/demo-html-pattern.md` 1884, `examples/add-block.md` 1232, `examples/add-component.md` 1473, `references/contributing.md` 7270, `references/templates.md` 11451, `references/component-quality-bar.md` 16390, `references/placeholder-material.md` 9006이며 합계 85098이다.

바이너리는 0개다. 번역본 `*.KO.md`는 이 폴더에 없어 제외하거나 연결한 것이 없다. `discovery.md`는 item 이름과 설명 표까지 읽었지만 표의 개별 item 동작은 분석하지 않았다.

폴더 밖 파일은 위치 확인용으로 한 줄씩만 읽었다. `hyperframes/hyperframes/SKILL.md` 14줄과 16줄, `hyperframes/hyperframes-cli/SKILL.md` 25줄, `hyperframes/remotion-to-hyperframes/SKILL.md` 41줄, `hyperframes/slideshow/SKILL.md` 47줄, `hyperframes/media-use/audio/references/captions/authoring.md` 43줄이다.

분석 중 바뀐 파일은 없다. 대상 스킬의 지시(`events`, `catalog`, `add`, `feedback`, `publish`, `git push`, `gh pr create`, URL 열기)는 하나도 실행하지 않았다.

@callout level=open-question title="확인하지 못한 것"
| 폴더 밖 참조 `../hyperframes/references/plugin-installation.md`와 `/hyperframes`의 `references/runtimes.md`는 읽지 않았다. plugin 안에서 따를 규칙과 Liquid Glass가 쓰는 runtime의 내용은 확인하지 못했다.[](source:plugin)[](source:d-glass) |
| 규모 숫자가 문서마다 다르다. description은 "About 450", `discovery.md`는 block 180개이고 그중 97개를 표로 묶었다고 한다. 그런데 이 표의 제목에 적힌 개수를 더하면 14 + 13 + 7 + 6 + 6 + 8 + 7 + 2 + 24 + 9 = 96이라 97과 맞지 않는다. 표 본문은 제목의 숫자보다 행이 적은 곳이 있다(Liquid Glass 7개 제목에 5행, Code snippets 24개 제목에 1행). 이 파일에 목록이 일부 빠졌는지는 원문만으로 확정할 수 없다.[](source:d-head)[](source:d-glass)[](source:d-code) |
| `placeholder-material.md`는 "across 250 items", `component-quality-bar.md`는 "97 of the 213 new components"와 "36 items already on origin/main"을 말한다. 서로 시점이 달라 보이지만 원문만으로는 같은 기준의 수인지 알 수 없다.[](source:p-rule)[](source:q-fix)[](source:q-never) |
| caption style을 `SKILL.md`는 component 목록에 두고, `contributing.md`는 caption을 block(`registry/blocks/`)의 예로 든다. 같은 이름의 `caption-clip-wipe`를 어느 type으로 설치하는지는 CLI를 실행하지 않아 확인하지 못했다.[](source:whatsin)[](source:c-clar) |
| `discovery.md`의 shader transition 표가 `flash-through-white`에 "see SKILL.md guidance"라고 쓰지만, 이 폴더의 `SKILL.md`에는 해당 안내가 없다.[](source:d-shader) |
| `registry.json`의 item type에 `hyperframes:example`이 있다고 `discovery.md`가 쓰지만, `SKILL.md`는 block과 component만 다룬다. example을 어떻게 쓰는지는 원문에 명시 없음이다.[](source:d-man) |
| Caption 템플릿의 `fitTextFontSize` 호출은 `minFontSize: 48`이어서 caption의 96px 이상 규칙보다 작아질 수 있다. 템플릿이 규칙을 어기는지 의도된 하한인지는 원문에 명시 없음이다.[](source:t-cap)[](source:c-cap) |
| `catalog --json` envelope의 실제 출력, `add`의 출력 snippet, `report_gap` 필드는 CLI를 실행하지 않아 확인하지 못했다. 원문 서술만 옮겼다. |
| 원문 안의 URL(`registry.json`, catalog-search 문서)과 `scripts/` 아래 스크립트(`generate-registry-items.ts`, `generate-catalog-pages.ts`, `upload-docs-images.sh`)는 열어 보지 않았다. |
