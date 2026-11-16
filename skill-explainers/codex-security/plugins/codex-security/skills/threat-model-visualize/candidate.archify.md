# threat-model-visualize는 위협 모델 문서를 어떻게 explorer HTML로 바꾸나? {#tmv-page}

`threat-model-visualize`는 이미 만들어진 위협 모델 문서를 읽어, 구조와 위협 경로와 통제를 눌러 볼 수 있는 standalone HTML explorer로 바꾸는 스킬이다.[](source:skill-md)[](source:purpose) 새 평가는 하지 않는다. 문서에 없는 내용이 그림에 들어가지 못하도록 인벤토리 작성, 독립 리뷰, 빌드 검사를 차례로 거친다.[](source:req)[](source:rv-when)

- 앱 팀과 경영진이 "무엇이 잘못될 수 있고, 어떻게 일어나며, 왜 중요하고, 어디서 통제가 막는가"를 보고 싶을 때 쓴다. "Visualize the threat model generated in the last scan of X" 같은 한 문장 요청이면 충분하다.[](source:purpose)[](source:req)
- 에이전트가 내놓는 것은 `source-inventory.md`, `correctness-review.md`, view model JSON, 그리고 `build_explorer.py`가 만든 offline HTML 한 장이다. 기본 전달 방식은 로컬 파일이다.[](source:inv-when)[](source:rv-receipt)[](source:b-cmd)[](source:b-deliver)
- 하지 않는 것은 새 scan과 새 assessment, 애플리케이션 코드 검사, Mermaid, 위상·권한·통제·도달성 지어내기, 사용자 요청 없는 사이트 게시다.[](source:purpose)[](source:req)[](source:b-deliver)
- **부분 분석**이다. 스킬 본문, 두 계약 문서, builder, renderer 코드 대부분은 읽었지만 SVG 예시 2개와 CSS와 일부 test는 표본만 봤고 아무것도 실행하지 않았다. 범위는 마지막 패널에 있다.

@answer scope="스킬·계약·builder·renderer 코드 읽음 · 실행 없음 · SVG 예시 2개와 CSS와 test 일부는 표본만 확인한 부분 분석"
@meta locale=ko
@source skill-md title="스킬 본문 frontmatter" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=1:4
@source purpose title="스킬 목적과 금지" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=6:8
@source req title="요청 해석, 입력, 배포 맥락, 다중 artifact" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=10:12
@source regen title="새 후보와 재생성 규칙" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=14:14
@source inv-when title="1단계 시점과 저장 파일" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=16:18
@source inv-rec title="1단계 기록과 열거 네 묶음" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=20:25
@source inv-rev title="1단계 대조, 교정, 완료 조건" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=27:29
@source c-arch title="2단계 구성 기본값과 선택 표시" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=31:37
@source c-cover title="2단계 coverage 장부" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=39:39
@source c-bind title="2단계 근거 묶기와 시작 행위자" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=41:41
@source c-ctrl title="2단계 통제와 제안 표시" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=43:43
@source rv-when title="3단계 시점과 리뷰어 조건" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=45:47
@source rv-obl title="3단계 의무 목록과 선택 해석" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=49:51
@source rv-modes title="3단계 반증 영역 다섯 개" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=53:57
@source rv-find title="3단계 지적 형식과 수정 확인" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=59:61
@source rv-receipt title="3단계 PASS 기록과 재검토" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=63:65
@source b-cmd title="4단계 시작 조건과 빌드 명령" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=67:73
@source b-browser title="4단계 browser 선택과 HTTP preview" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=75:77
@source b-warn title="4단계 connector 경고" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=79:79
@source b-qa title="4단계 browser 검사 항목" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=81:81
@source b-deliver title="4단계 전달과 사이트 게시 조건" path=codex-security/plugins/codex-security/skills/threat-model-visualize/SKILL.md lines=83:83
@source yaml title="표시 이름과 기본 prompt" path=codex-security/plugins/codex-security/skills/threat-model-visualize/agents/openai.yaml
@source vm-intro title="view-model 계약 서두" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/view-model.md lines=3:9
@source vm-map title="map과 geometry 계약" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/view-model.md lines=13:19
@source vm-route title="scenario와 route 계약" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/view-model.md lines=23:27
@source vm-src title="source 역할 계약" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/view-model.md lines=31:35
@source vm-ctrl title="control과 effect 계약" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/view-model.md lines=37:43
@source vm-evid title="evidence와 export 계약" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/view-model.md lines=47:49
@source ce-pal title="고정 팔레트" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/context-explorer.md lines=3:3
@source ce-arch title="아키텍처 먼저, 그룹 분리 규칙" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/context-explorer.md lines=5:9
@source ce-prop title="제안 통제 표기" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/context-explorer.md lines=11:11
@source ce-geo title="connector와 글자 배치" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/context-explorer.md lines=13:15
@source ce-qa title="QA 실패 기준과 SVG 참조" path=codex-security/plugins/codex-security/skills/threat-model-visualize/references/context-explorer.md lines=17:21
@source py-top title="builder 머리말" path=codex-security/plugins/codex-security/skills/threat-model-visualize/scripts/build_explorer.py lines=1:16
@source py-graph title="builder 그래프와 geometry 검사" path=codex-security/plugins/codex-security/skills/threat-model-visualize/scripts/build_explorer.py lines=40:110
@source py-routes title="builder source와 route와 step 검사" path=codex-security/plugins/codex-security/skills/threat-model-visualize/scripts/build_explorer.py lines=111:298
@source py-ctrl title="builder 통제와 효과 검사" path=codex-security/plugins/codex-security/skills/threat-model-visualize/scripts/build_explorer.py lines=299:463
@source py-quote title="builder 인용과 hash 검사" path=codex-security/plugins/codex-security/skills/threat-model-visualize/scripts/build_explorer.py lines=464:496
@source py-warn title="builder connector 경고" path=codex-security/plugins/codex-security/skills/threat-model-visualize/scripts/build_explorer.py lines=509:537
@source py-main title="builder 입출력과 HTML 조립" path=codex-security/plugins/codex-security/skills/threat-model-visualize/scripts/build_explorer.py lines=540:590
@source html title="explorer HTML 틀" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/explorer.html
@source fx-scope title="통제 적용 범위와 선택" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/control-effects.js lines=3:32
@source fx-caption title="통제 문구와 근거 표시" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/control-effects.js lines=34:58
@source rp title="route 도달 계산" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/route-paths.js lines=4:67
@source sr title="source 역할 팔레트와 선택" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/source-roles.js lines=4:43
@source ex-hash title="선택 상태 URL 저장" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/explorer.js lines=53:65
@source ex-map title="지도 그리기와 layout 상태" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/explorer.js lines=191:287
@source ex-evid title="근거 dialog" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/explorer.js lines=289:293
@source ex-export title="SVG와 HTML 내려받기" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/explorer.js lines=342:367
@source sl-node title="node 글자 크기와 넘침 판정" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/svg-layout.js lines=143:147
@source css title="화면 스타일" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/explorer.css
@source svg-overview title="개요 화면 참조 예시" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/context-reference-overview.svg
@source svg-path title="선택 경로 화면 참조 예시" path=codex-security/plugins/codex-security/skills/threat-model-visualize/assets/context-reference-path.svg
@source t-py title="builder 단위 test" path=codex-security/plugins/codex-security/tests/test_threat_model_visualize.py
@source t-fx title="통제 효과 test" path=codex-security/plugins/codex-security/tests/threat-model-visualize/control-effects.test.mjs
@source t-scope title="renderer 범위 test" path=codex-security/plugins/codex-security/tests/threat-model-visualize/renderer-scope.test.mjs
@source t-rp title="route 도달 test" path=codex-security/plugins/codex-security/tests/threat-model-visualize/route-paths.test.mjs
@source t-sr title="source 역할 test" path=codex-security/plugins/codex-security/tests/threat-model-visualize/source-roles.test.mjs
@source t-sl title="SVG layout test" path=codex-security/plugins/codex-security/tests/threat-model-visualize/svg-layout.test.mjs
@source t-smoke title="browser 내려받기 smoke test" path=codex-security/plugins/codex-security/tests/threat-model-visualize/browser/export-smoke.test.mjs
@source t-fixture title="browser test 표본 데이터" path=codex-security/plugins/codex-security/tests/threat-model-visualize/browser/fixture.mjs
@source t-readme title="browser test 실행 안내" path=codex-security/plugins/codex-security/tests/threat-model-visualize/browser/README.md
@source tm-ret title="threat-model의 결과 반환과 저장" path=codex-security/plugins/codex-security/skills/threat-model/SKILL.md
@source art-model title="위협 모델 cache와 footer 규칙" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=47:53
@source art-supp title="보조 파일 저장 규칙" path=codex-security/plugins/codex-security/references/artifact-storage.md lines=9:13
@source sa-doc title="scan 폴더의 threatmodel.md 정의" path=codex-security/plugins/codex-security/references/scan-artifacts.md lines=26:31
@source tmd title="host가 threatmodel.md를 만드는 코드" path=codex-security/plugins/codex-security/mcp-app/src/threat-model-document.ts
@source ds-model title="diff scan의 위협 모델 보존" path=codex-security/plugins/codex-security/skills/security-diff-scan/SKILL.md lines=28:28
@source deep-end title="Deep scan 완료 처리" path=codex-security/plugins/codex-security/skills/deep-security-scan/SKILL.md lines=12:16
@source sc-model title="Deep scan의 primary model" path=codex-security/plugins/codex-security/references/scan-contract.md lines=171:175

## 켜지면 에이전트는 어떤 순서로 무엇을 읽고 판단하나? {#flow span=12}

원문은 일을 네 단계로 나눈다. 단계 앞에 요청을 해석하는 일이 있고, 단계 사이에는 "이것을 끝내기 전에 저것을 시작하지 않는다"는 순서 조건이 걸려 있다.

아래 그림은 이 흐름을 둘로 나눠 그린다. 첫 그림은 요청 해석부터 view model 작성까지, 둘째 그림은 독립 리뷰부터 전달까지다. 첫 그림의 마지막 노드인 view model 작성이 끝나면 저장된 JSON이 둘째 그림의 독립 리뷰로 넘어간다.[](source:inv-when)[](source:rv-when)

@workflow id=prepare-flow title="요청 해석부터 view model 작성까지"
| req | 요청 해석 | external | source:req |
| found | 최신 모델 있나? | backend | source:req |
| older | 이전 모델 사용 알림 | backend | source:req |
| inv | source inventory | backend | source:inv-rec |
| invrev | 인벤토리 대조 | backend | source:inv-rev |
| compose | view model 작성 | backend | source:c-arch |
| req > found | |
| found > inv | 있음 | emphasis |
| found > older | 없음 |
| older > inv | |
| inv > invrev | |
| invrev > compose | 근거 확인 | emphasis |

그림은 핵심 경로만 그린다. 여러 artifact를 사용자가 직접 줄 때의 합본 규칙, 새 후보와 일반 수정의 차이, 사람이 요청하지 않은 사이트 게시 금지는 아래 `요청 해석`과 `view model 작성` 설명에 문장으로 풀어 썼다.

@steps id=prepare-steps
| s-req | 요청 해석 | 에이전트는 사용자의 요청을 받아 대상, 최신 assessment, snapshot을 정한다.[](source:req) 원문이 드는 충분한 요청은 "Visualize the threat model generated in the last scan of X" 한 문장이다.[](source:req) 기본 입력은 이미 있는 위협 모델 artifact이고, 끝난 scan 전체를 자동으로 가져오는 것이 아니다.[](source:req) 입력은 바뀌지 않게 두고 서로 다른 snapshot은 몰래 합치지 않는다. 애플리케이션 코드를 읽지 않고, 위상과 권한과 통제와 도달성과 검증 결과를 지어내지 않는다.[](source:req) 소스가 뒷받침하는 배포 맥락(노출, 신뢰·테넌트·프로세스 경계, 신원, 조건부 배포 가정)은 적어 두되 저장소 기본값을 실제 배포 설정의 증거로 쓰지 않는다.[](source:req) 사용자가 artifact를 여러 개 명시해서 주면 합친 문서 하나를 `--assessment`에 넘기고, 발췌마다 출처 identity와 snapshot과 원래 finding 상태를 붙인다. finding과 hypothesis를 구분하고 로컬 ID를 밝히며 충돌하는 설명과 원본 artifact를 남긴다.[](source:req) 갈림은 요청 종류에서 생긴다. 새 후보나 재생성이면 이전 후보의 모델이나 HTML을 고치거나 복사하지 않고 view model을 새로 쓴다. 일반 수정은 기존 모델을 다시 써도 되고, renderer만 다듬는 일은 표시 갱신이지 새 생성이 아니다.[](source:regen) 이 노드가 다음으로 넘기는 것은 정해진 대상과 assessment 파일이다. | prepare-flow | req |
| s-found | 최신 모델 있나? | 이 노드는 해석된 대상의 최신 assessment가 실제로 있는지 판단한다. 있으면 그것을 그대로 입력으로 삼아 source inventory로 간다. 최신 artifact가 없으면 오래된 것으로 대신하기 전에 그 사실을 먼저 알린다.[](source:req) 오래된 것을 써도 되는지 사용자에게 묻는지, 알리기만 하고 진행하는지는 원문에 명시 없음이다. 최신 것이 없을 때 새 scan으로 채우는 길은 열려 있지 않다. 새 scan을 돌리지 말라는 문장이 이미 목적 문단에 있다.[](source:purpose) | prepare-flow | found |
| s-older | 이전 모델 사용 알림 | 이 노드에서 에이전트는 "최신 artifact가 없다"는 사실과 대신 쓰려는 이전 artifact가 무엇인지 사용자에게 알린다.[](source:req) 알린 뒤에도 입력을 바꾸지 않는다는 규칙과, snapshot을 몰래 합치지 않는다는 규칙은 그대로 적용된다. 알린 다음 사용자 응답을 기다리는지는 원문에 명시 없음이다. 이전 artifact를 쓰게 되면 그 identity와 snapshot이 다음 노드의 인벤토리 기록에 들어간다. | prepare-flow | older |
| s-inv | source inventory | 에이전트는 시각화를 계획하기 전에 이 단계를 끝내야 한다. 표시 묶음 고르기, route 정하기, geometry 배정, explorer JSON 작성도 모두 이 단계가 끝난 다음이다.[](source:inv-when) 결과는 workspace의 `source-inventory.md`에 저장한다. 먼저 assessment의 identity, 파일의 정확한 hash, 범위를 적고, 행마다 의미 ID와 근거 줄 범위 또는 정확한 인용을 붙인다. 시각 node나 edge ID는 이 단계에서 붙이지 않는다.[](source:inv-rec) 열거 대상은 네 묶음이다. 첫째는 구성요소와 역할로, 행위자와 입력과 저장소와 외부 의존성과 신뢰 경계를 담고 신뢰하는 운영자, 가정된 침해, 통제 가능한 입력, 소유 자산, 강제하는 구성요소를 구분한다. 둘째는 관계와 권한으로, 호출자에서 operation을 거쳐 수신자로 가는 관계마다 독립적으로 충분한 권한이나 진입 조건과 전제를 적는다. 같은 operation에 계정 세션과 발급된 capability가 둘 다 권한이 될 수 있으니 대안을 operation별로 나열하고, 전송 방식이나 순서를 모르면 논리적 capability만 남기고 다른 진입점의 전제를 가져오지 않는다. 셋째는 통제와 한정 조건으로, 보호 메커니즘에서 강제 owner와 제한받는 구성요소와 보호받는 operation으로 이어지는 연결에 조건과 근거를 붙인다. 강제하는 쪽을 못 찾으면 "매핑 안 됨"이라고 명시하고, 기존 메커니즘, 제안, 보안 목표, 설정 동작, 주의사항을 따로 분류한다. 넷째는 위협 모델 coverage로, 실질적 위협과 제공된 finding과 hypothesis와 영향이 큰 설정을 관련 구성요소와 관계와 통제에 연결하고 원래의 confidence와 영향과 미해결 질문을 남긴다.[](source:inv-rec) 검증 대상은 애플리케이션 구현이 아니라 제공된 assessment에 대한 충실도이고, 빈틈을 새 평가로 메우지 않는다.[](source:inv-when) | prepare-flow | inv |
| s-invrev | 인벤토리 대조 | 에이전트는 인벤토리를 완전한 assessment와 다시 대조한다. 같은 객체와 호출자와 operation과 owner를 그 근거가 실제로 받치는지 확인하고, 설정 전달과 보호되는 operation, 자산과 그 관리자를 구분한다. 서로 다른 입력 사이에 검증 규칙을 옮기지 않고 그룹 라벨에서 플랫폼 endpoint를 추정하지 않는다. 실질적인 우려는 하나도 빠뜨리지 않고 설명해야 하며, alias는 정리하고 모순은 해결을 지어내지 않고 그대로 기록한다. 뒷받침되지 않는 주장, 잘못 분류된 통제, 설명 없는 누락은 이 자리에서 바로 고친다.[](source:inv-rev) 마칠 때는 원문 대조에서 나온 교정과 미해결 gap을 인벤토리 끝에 적는다. 이후의 모델 수리 메모와 리뷰 판정은 이 파일이 아니라 `correctness-review.md`로 간다. 인벤토리는 주장이 뒷받침되거나 명시적으로 unknown이고 coverage가 정리됐을 때 구성 단계로 넘어갈 수 있다. 소스의 불확실성은 남아도 되지만, 그것이 말없이 시각 관계나 safeguard로 바뀌면 안 된다.[](source:inv-rev) 이 단계에서는 시각화를 계획하지 않는다. 사람 승인을 받으라는 문장은 원문에 명시 없음이다. | prepare-flow | invrev |
| s-compose | view model 작성 | 에이전트는 `references/view-model.md`와 `references/context-explorer.md`를 읽고, 검증된 인벤토리에서 소스에 근거한 JSON 모델과 geometry를 만든다. 색, 상호작용, export는 shell이 맡는다.[](source:c-arch) 기본 fidelity는 standard이고, `simple`은 더 묶은 요약, `detailed`는 쓸모 있는 보조 연결과 facet을 더한다. 이 값은 주장 내용을 바꾸지 않고 UI selector도 필요하지 않다.[](source:c-cover) 먼저 위협을 얹기 전의 읽기 쉬운 아키텍처 개요를 만든다. 행위자와 진입점, 신뢰 경계, 앱·라이브러리 구성요소, 신원과 권한 부여, 저장소, 외부 의존성을 요청과 데이터와 권한 관계로 잇고, 위협 하나가 선택돼도 기본 아키텍처는 muted 색으로 계속 보인다.[](source:c-arch) 인벤토리가 coverage 장부 역할을 한다. 실질적 operation과 그 권한 대안마다 선택할 수 있는 관계와 통제를 대응시키거나, 소스가 뒷받침하는 범위 제외를 적는다. 사용자가 일부만 요청했으면 불완전하다고 표시한다.[](source:c-cover) 케이스마다 mechanism, priority, 전제, impact, 근거를 자기 소스 절에 묶고, 인용이 주장과 같은 객체와 operation과 owner를 받치는지 확인한다. 모호한 문장을 더 구체적인 기존 safeguard로 바꾸지 않고 순서나 권한 상승이나 성공한 전이를 지어내지 않는다. 신뢰하는 운영자나 관리자의 활동은 소스가 그 남용이나 침해를 명시적으로 모델링할 때만 위협 source가 된다.[](source:c-bind) 통제는 실제 operation과 강제하는 owner에 표시한다. owner를 못 찾으면 받는 쪽에 붙이지 않고 gap을 공개하며, 제안은 **Proposed control**과 "Would block" 또는 "Would limit"로 조건부 표기하고 배포됐거나 검증됐다고 쓰지 않는다.[](source:c-ctrl) 이 노드가 넘기는 것은 저장된 view model JSON이다. | prepare-flow | compose |

그림 속 "근거 확인" 간선은 인벤토리가 위 완료 조건을 만족했을 때의 경로다. 조건을 못 채웠을 때 인벤토리 안에서 다시 고치는 되돌림은 원문에 "지금 교정한다"는 문장으로만 있고 별도 간선으로 그리지 않았다.[](source:inv-rev)

@workflow id=review-flow title="독립 리뷰부터 전달까지"
| review | 독립 리뷰 | security | source:rv-when |
| pass | PASS 기록 확인? | security | source:rv-receipt |
| fix | JSON 수정 | backend | source:rv-find |
| build | explorer 빌드 | backend | source:b-cmd |
| qa | browser QA | frontend | source:b-qa |
| deliver | 로컬 HTML 전달 | external | source:b-deliver |
| review > pass | |
| pass > build | PASS | emphasis |
| pass > fix | 수정 필요 |
| fix > review | 재검토 |
| build > qa | |
| qa > deliver | 완료 또는 QA 미완 | emphasis |

그림은 핵심 경로를 그린 것이다. 필수 교정이 남았을 때 초안으로 전달하는 길은 `PASS 기록 확인?` 행에 있고 그림에는 없다.

browser QA 중 JSON을 고치면 영향받는 선택을 다시 검사하고 바뀐 hash의 새 receipt를 받아야 하지만, 그 되돌림 간선은 레이아웃 때문에 그리지 않았다. 설명은 `browser QA` 행에 있다. 정적 이미지 요청과 사이트 게시도 그리지 않았고 `로컬 HTML 전달` 행에 있다.[](source:rv-receipt)[](source:b-deliver)

@steps id=review-steps
| s-review | 독립 리뷰 | 이 노드는 preview server를 띄우거나 explorer를 browser로 열거나 export를 시험하기 전에 끝나야 한다. 정적 빌드와 구조 검증은 리뷰가 진행되는 동안 돌려도 되지만 browser 작업은 안 된다.[](source:rv-when) 에이전트는 가능하면 새 맥락의 리뷰어를 띄운다. 기록을 상속하지 않게 `spawn_agent`에 `fork_turns: "none"`을 주고, 저자의 결론이나 screenshot 없이 리뷰 과제와 artifact 경로만 보낸다. 이 옵션을 빼면 저자의 작업이 상속될 수 있다. 리뷰와 그 수정 확인이 끝나기를 기다린다. 위임을 쓸 수 없거나 시도가 실패했을 때만 따로 self-review를 쓰고, 구체적 사유와 독립성의 한계를 적는다. 리뷰가 아직 안 끝났다는 것은 그 대체의 사유가 아니다.[](source:rv-when) 리뷰어는 전체 assessment와 view-model 계약을 먼저 읽고, 출력이 잘렸으면 빠진 부분을 다시 가져온다. 그다음 인벤토리와 JSON을 보기 전에 `correctness-review.md`에 소스에서 나온 의무 목록을 저장한다. 의무에는 명시적으로 신뢰하는 역할과 허가된 operation과 범위 제외, 시작 권한, operation과 결과와 수신자와 자산의 결과, 배포 조건, 통제와 그 강제 owner가 들어간다. 그런 다음 인벤토리와 실제 JSON을 의무 목록과 비교한다. 검증된 인벤토리나 저자의 coverage 장부는 JSON이 소스를 보존한다는 증거가 못 된다.[](source:rv-obl) 선택마다 상속된 기본값, override, 묶인 구성원, 분기, 통제 효과를 반영해 실제로 강조되는 관계와 적용 통제를 풀어 본다. 풀어 낸 ID를 시나리오 문장이 아니라 정의와 대조한다. 다섯 영역을 반증하려 한다. 권한과 전제는 독립적으로 충분한 권한마다 선택이나 정당한 제외가 대응되는지 본다. 통제 소유는 통제마다 강제자와 제한받는 구성요소와 보호받는 operation과 `control.nodes` 표시를 적고, 설정을 싣고 있거나 제한을 받는 쪽을 owner로 착각하지 않는다. 효과와 도달성은 차단 미리보기마다 실제 `step`과 `edge`와 `arrival`과 traffic 동작에서 닿는 node와 분기를 계산한다. 근거와 분류는 인용한 구절이 주장을 받치는지 읽고 기존 메커니즘과 제안과 목표와 주의사항을 구분한다. 선택과 coverage는 "A 또는 B"를 B로 줄이지 않았는지, 소스의 개념에서 빠진 독립 진입점이 없는지, 관련 없는 맥락에서 빌려 온 강조가 없는지 본다.[](source:rv-obl)[](source:rv-modes) 지적에는 구체적인 claim이나 선택, JSON pointer, 근거 줄 범위, 불일치 설명이 있어야 하고 필수 교정과 선택적 개선을 구분한다. 충실한 grouping과 소스가 뒷받침하는 제외와 설명용 통제와 명시된 불확실성은 유효하며, 더 구체적으로 보이게 하려고 지어낸 위상이나 순서를 요구해서는 안 된다.[](source:rv-find) | review-flow | review |
| s-pass | PASS 기록 확인? | 이 노드는 리뷰어가 `correctness-review.md`에 남긴 기록을 본다. 기록에는 시간대를 포함한 시각, `PASS` 또는 `REVISION REQUIRED`, assessment와 현재 JSON의 hash, 방법, 선택 검사, 지적, 확인된 교정, 해결되지 않은 한계가 들어간다.[](source:rv-receipt) `PASS`는 필수 교정이 남지 않았다는 뜻이고, 선택적 개선과 충실하게 표현된 소스 불확실성은 남아 있어도 된다. 저자는 저장된 JSON의 hash가 이 기록과 일치하는지 확인하고 나서야 browser QA로 간다. 저자가 쓴 요약이나 재확인 요청은 리뷰어의 종료로 인정하지 않는다.[](source:rv-receipt) 필수 교정이 남았다면 두 길이 있다. 계속 고치거나, 남은 지적과 browser QA 미완을 분명히 적은 초안으로 전달한다.[](source:rv-receipt) 두 길 중 무엇을 고를지 기준은 원문에 명시 없음이다. 초안으로 전달하는 길은 그림에 노드로 그리지 않았다. 이 초안이 `build_explorer.py`가 만든 HTML을 포함하는지는 원문에 명시 없음이다. 판정: browser QA는 `PASS` 기록이 있어야만 시작하므로 초안에는 browser 검사가 없을 수밖에 없다.[](source:b-cmd) | review-flow | pass |
| s-fix | JSON 수정 | 에이전트는 뒷받침되는 지적을 설명이 아니라 JSON에서 고친다. 리뷰어는 바뀐 JSON을 다시 읽고, 같은 객체나 기본값을 공유하는 다른 선택까지 포함해 영향받는 선택을 확인한다.[](source:rv-find) 새로 생긴 의미 주장은 인벤토리 검토도 통과해야 한다. 리뷰를 닫기 전에 소스에서 나온 의무를 전부 최종 선택과 다시 대조한다. 저자가 만든 수정 목록만 확인하는 것으로는 부족하다.[](source:rv-find) 이 노드가 넘기는 것은 고친 JSON이고, 다시 독립 리뷰가 받는다. | review-flow | fix |
| s-build | explorer 빌드 | browser QA는 현재 JSON의 `PASS` 기록이 있을 때만 시작한다.[](source:b-cmd) 에이전트는 `python3.12 <skill-directory>/scripts/build_explorer.py <model.json> --assessment <threat-model.md> --output <explorer.html>`을 실행한다.[](source:b-cmd) 이 스크립트는 참조, geometry, 정확한 인용, 일부 통제 의미를 검사하고 HTML 한 장을 쓴다. 검사 항목은 다음 패널에 있다. 에이전트는 builder의 connector 경고를 읽는다. node를 옮기거나 크기를 바꾼 뒤에는 인접한 꺾임을 포트에 맞추고 connector가 node 바깥에서 들어오는지 확인하며, 고친 점으로 다시 빌드한다.[](source:b-warn) 이 노드가 넘기는 것은 로컬의 standalone HTML이다. | review-flow | build |
| s-qa | browser QA | 에이전트는 먼저 환경에서 허용되는 browser 도구를 고른다. CLI나 CI에서는 Playwright와 Chromium 같은 설치된 headless browser를 알려진 위치에서 찾고, 데스크톱 browser 호스트가 있다고 가정하지 않는다. 데스크톱 호스트가 없다고 모든 browser가 없다는 결론이 되지 않고, 정책의 거부가 우회를 허가하지도 않는다. 허용된 browser가 없으면 로컬 파일을 전달하고 browser QA를 미완으로 표시한다.[](source:b-browser) Codex의 in-app browser 자동화는 `file:` URL을 지원하지 않으니 거기서는 로컬 HTTP preview를 쓴다. 서버는 `127.0.0.1`의 미사용 또는 OS가 배정한 port에 직접 묶고 출력 디렉터리만 서빙하며 QA 뒤에 멈춘다. 이미 떠 있는 다른 프로세스가 같은 port에서 이 파일을 서빙한다고 가정하지 않는다.[](source:b-browser) 점검 대상은 desktop 크기의 개요와 선택된 시나리오와 대표 통제다. 대표적인 source와 route 대안, 막힌 상태와 복원된 상태, 기본 fit에서 읽히는 글자, 단순한 connector 경로, 글자와 구성요소의 충돌, 통제 marker, 근거, 이동, 범위, residual을 본다. 확대에 기대지 말고 다시 배치한다. 작은 connector 교차는 구불구불한 우회보다 낫다. offline 로딩과 SVG export도 확인한다.[](source:b-qa) builder는 구조와 정확한 인용만 검사하고 주장의 진위나 시각적 명료함은 검사하지 않는다.[](source:b-qa) browser에서 JSON을 고치면 영향받는 source와 선택 검사를 반복하고, 전달할 hash에 대한 새 리뷰 receipt를 받는다. 처음의 browser 전 receipt는 순서를 알 수 있게 보존한다. CSS만 고쳤고 JSON hash가 그대로면 시각 QA만 한다. 독립 리뷰, self-review, browser QA는 따로 보고하며 서로를 대신하지 못한다.[](source:rv-receipt) | review-flow | qa |
| s-deliver | 로컬 HTML 전달 | 기본은 standalone HTML을 로컬에 전달하는 것이다. 사이트를 만들거나 갱신하거나 게시하는 일은 사용자가 사이트 호스팅이나 게시를 명시적으로 요청할 때만 한다. "시각화해 줘"나 "preview" 요청만으로는 부족하고, 로컬이나 inline preview에는 사이트를 만들지 않는다. 요청받은 호스팅은 Sites workflow를 쓰고 요청된 청중을 보존하며, inline preview는 visualize integration을 쓴다. 정적 이미지를 달라는 요청은 같은 선택 상태의 SVG나 PNG로 답한다.[](source:b-deliver) Sites workflow와 visualize integration 문서는 이 트리에 없어 읽지 못했다. | review-flow | deliver |

## build_explorer.py와 explorer는 무엇을 검사하고 어떻게 보여 주나? {#engine span=12}

`build_explorer.py`는 Python 표준 라이브러리만 쓰는 builder다.[](source:py-top) 모델 JSON과 assessment 원문 bytes를 받아 검증하고, 통과하면 모델과 assessment와 모든 asset을 한 HTML 파일에 내장해 쓴다.[](source:py-main) 오류가 나면 종료 코드 2로 멈추고, 출력이 모델이나 assessment와 같은 파일이면 덮어쓰지 않는다.[](source:py-main) 이 패널은 builder가 거르는 것과 shell이 보여 주는 것을 찾아보는 용도로 정리한다.

| 검사 영역 | builder가 거부하는 경우 |
| --- | --- |
| 배열과 ID | `nodes`, `edges`, `scenarios`, `evidence`의 ID가 비었거나 중복됐다. node가 하나도 없다.[](source:py-graph) |
| geometry | `canvas`와 node와 region의 값이 유한한 양수가 아니다. edge 끝점이 풀리지 않거나 점이 두 개 미만이다.[](source:py-graph) |
| route | route가 끊겼거나 같은 edge를 반복한다. 시나리오 step이 route에 순서대로 들어 있지 않다. 분기가 route에 붙어 있지 않다.[](source:py-routes) |
| source 역할 | 근거나 시작 권한이 없다. `basis`가 명시되지 않았다. source가 여러 개인데 `sourceMode`가 없다.[](source:py-routes) |
| 통제 효과 | proposal인데 basis가 `hypothetical`이 아니다. 근거 없는 effect다. `unverified` 효과가 `blocks`다. 막는 효과에 step이나 marker가 없다.[](source:py-ctrl) |
| marker | 폭이 180 미만이거나 높이 72를 포함해 canvas 안에 들어가지 않는다.[](source:py-ctrl) |
| 인용 | 인용이 assessment bytes의 정확한 부분 문자열이 아니거나 지정한 줄 범위 밖에 있다. 인용된 path가 인용문 안에 없다.[](source:py-quote) |
| assessment hash | `assessmentSha256`이 있는데 bytes의 SHA-256과 다르다. 줄바꿈 정규화로는 통과시키지 않는다.[](source:py-quote)[](source:vm-map) |

builder가 거부하지 않고 경고만 하는 것은 connector 두 가지다. 양 끝 꺾임이 대각선이면서 이웃 구간은 축에 맞는 경우, 그리고 connector가 node 내부로 들어가는 경우다.[](source:py-warn) 이 검사는 구조만 보므로 주장이 참인지, 글자가 읽히는지는 알려 주지 않는다.[](source:b-qa)

explorer 쪽 규칙은 세 곳에 나뉘어 있다. 먼저 통제 효과가 시나리오의 걸음을 멈추는지 여부다. 아래 표는 `effect.outcome`별 동작을 정리한 것이다.

| outcome | 걸음을 멈추나 | 화면 문구 |
| --- | --- | --- |
| `blocks`, traffic 기본값 `stops` | 멈춘다. step이 정수이고 basis가 `unverified`가 아닐 때만이다.[](source:fx-scope) | 기존이면 "Blocks", 제안이면 "Would block"이다. `arrival`이 켜지면 "decision after arrival"이 붙는다.[](source:fx-caption) |
| `blocks`, traffic `continues` | 멈추지 않는다. 막는 것은 위해이고 보이는 일반 흐름은 이어진다.[](source:fx-scope)[](source:vm-ctrl) | "leaves traffic open"이 붙는다.[](source:fx-caption) |
| `limits`, `detects`, `does-not-block`, `unknown` | 멈추지 않는다.[](source:fx-scope) | "path continues" 또는 "Effect not established"다.[](source:fx-caption) |

멈추는 통제가 여럿이면 step이 작은 것이 먼저고, 같은 step에서는 도착 전에 막는 것이 도착 후 판단보다 앞서며, 그것도 같으면 existing이 proposed보다 앞선다.[](source:fx-scope) 설명용 예시로, 지어낸 시나리오의 step 2에서 기존 통제가 `arrival: true`로 막고 제안 통제가 `arrival` 없이 막는다고 하자. 사용자가 제안을 켜면 제안이 blocker가 된다. 도착을 막는 쪽이 도착 후 검사보다 먼저 작용하기 때문이다.[](source:fx-scope)[](source:vm-ctrl)

route 도달 계산은 명시적으로 적힌 route만 따른다. 그래프에서 가까운 것을 도달 가능하다고 추정하지 않는다.[](source:rp) 막는 step 이후의 edge는 흐린 점선으로 끊어 그리고 node는 "unreached"로 둔다.[](source:ex-map) 분기는 `beforeStep`이면 그 결정 시점에, `afterStep`이면 그 행동이 성공한 뒤에만 보이고, 둘 다 없으면 node 도달성으로 정한다.[](source:rp)[](source:vm-route)

source 역할은 고정 팔레트 다섯 가지(adversary, compromised-component, untrusted-input, unknown, authorized-user)로 칠하고, alternatives 모드에서는 선택한 하나만 칠한다. source가 `node: null`이면 받는 listener를 대신 칠하지 않는다.[](source:sr)[](source:ce-pal)

화면 상태는 URL hash에 담긴다. 키는 `scenario`, `route`, `source`, `step`, `node`, `control`, `preview`, `panel`, `context`다.[](source:ex-hash)

근거 버튼을 누르면 정확한 인용문과 줄 범위를 dialog에 보여 주고, SVG 내려받기는 선택 상태, 통제 문구, 근거 한정 문구를 푸터에 넣어 쓴다.[](source:ex-evid)[](source:ex-export)

지도를 그리는 코드가 겹침을 해결하지 못하면 `data-layout-status`를 `unresolved`로 표시하고, 이것이 browser QA의 실패 기준이다.[](source:ex-map)[](source:ce-qa) assets에서 `fetch`, `XMLHttpRequest`, `WebSocket`, `eval`, `localStorage`, `sendBeacon`, `window.open`, `@import`를 읽기 전용 `grep`으로 찾았고 해당이 없었다. 외부 URL 문자열은 SVG namespace 두 곳뿐이다. 이 검색은 분석자가 한 확인이다.

## 무엇을 강제하고 금지하며, 언제 쓰면 안 되나? {#rules span=12}

원문은 켜지는 조건을 호출 제한 필드가 아니라 `description` 한 줄로만 말한다. `description`은 모델이 판단할 때 쓰는 설명이고, 이 단어가 있으면 켜진다는 사전이 아니다.

@code id=tmv-frontmatter source=skill-md language=yaml

`disable-model-invocation` 같은 호출 제한 필드는 이 frontmatter에 원문에 명시 없음이다. `agents/openai.yaml`은 표시 이름 "Threat Model Explorer"와 기본 prompt만 가진다.[](source:skill-md)[](source:yaml)

| 구분과 항목 | 규칙 | 근거 |
| --- | --- | --- |
| 금지: 새 평가와 Mermaid 금지 | 새 scan과 새 assessment를 하지 않는다. Mermaid를 쓰지 않는다. 대신 공유 workbench와 역할 팔레트를 쓴다.[](source:purpose) | 목적 문단 |
| 금지: 코드 검사와 지어내기 금지 | 애플리케이션 코드를 검사하지 않고, 위상과 권한과 통제와 도달성과 검증 결과를 지어내지 않는다.[](source:req) | 요청 해석 |
| 강제: 입력 불변 | 입력은 바뀌지 않게 두고 snapshot을 몰래 합치지 않는다.[](source:req) | 요청 해석 |
| 강제: 인벤토리 먼저 | 시각화를 계획하기 전에 `source-inventory.md`를 끝낸다.[](source:inv-when) | 1단계 |
| 강제: 불확실성 유지 | 인벤토리의 소스 불확실성은 시각 관계나 safeguard로 말없이 바뀌면 안 된다.[](source:inv-rev) | 1단계 |
| 강제: 리뷰 먼저, browser 나중 | 리뷰는 preview server와 browser와 export 시험보다 먼저 끝난다. 정적 빌드와 구조 검증은 리뷰 중에도 돌릴 수 있다.[](source:rv-when) | 3단계 |
| 강제: PASS 기록 필요 | browser QA는 현재 JSON의 `PASS` 기록이 있을 때만 시작한다. 저자의 요약은 리뷰 종료가 아니다.[](source:rv-receipt)[](source:b-cmd) | 3·4단계 |
| 강제: 새 후보는 새로 작성 | 새 후보나 재생성은 이전 모델이나 HTML을 고치거나 복사하지 않고 새로 쓴다.[](source:regen) | 도입부 |
| 금지: 사이트 게시 제한 | 사이트를 만들거나 게시하지 않는다. 사용자가 사이트 호스팅이나 게시를 명시적으로 요청할 때만 한다.[](source:b-deliver) | 4단계 |
| 금지: browser 정책 우회 금지 | 정책이 browser 사용을 거부해도 우회하지 않는다. 허용된 browser가 없으면 로컬 파일을 전달하고 QA를 미완으로 표시한다.[](source:b-browser) | 4단계 |

수치는 의무로 적힌 것만 옮긴다. marker 폭은 180 이상이어야 하고 초기 예약 높이는 72다.[](source:vm-ctrl)

기본 fit에서 핵심 글자는 약 11 CSS px 이상을 목표로 한다. node 제목, 부제, connector 라벨은 각각 17, 14, 13 단위다.[](source:vm-map) 화살촉을 위해 도착 직전 직선 구간은 대략 14 단위 이상이 필요하다.[](source:vm-map) 에이전트가 이 값을 목표로 잡는 것이고 builder가 강제하는 것은 marker 폭과 canvas 안 배치뿐이다.[](source:py-ctrl)

| 상황 | 맞는가 | 이 스킬이 하는 일 |
| --- | --- | --- |
| 이미 있는 위협 모델의 최신 scan 결과를 보여 달라는 요청 | {good:맞다} | 이 스킬의 중심 사용이다.[](source:req) |
| 위협 모델이 아직 없고 새로 만들어 달라는 요청 | {bad:아니다} | 새 assessment는 하지 않는다. 위협 모델을 만드는 일은 `threat-model` 스킬의 몫이다.[](source:purpose)[](source:tm-ret) |
| 새 scan을 돌려 달라는 요청 | {bad:아니다} | 새 scan을 돌리지 않는다.[](source:purpose) |
| 사용자가 사이트 게시를 명시한 요청 | {caution:조건부} | 게시는 요청이 있을 때만 하고 Sites workflow를 쓰는데, 그 문서는 이 트리에 없다.[](source:b-deliver) |
| 정적 이미지 요청 | {caution:조건부} | 같은 선택 상태의 SVG나 PNG를 낸다.[](source:b-deliver) |

## 흐름 속에서 어디에 놓이나? {#position span=12}

이 스킬은 위협 모델 문서를 만드는 스킬의 뒤에 온다. 원장 기준으로 앞에는 `threat-model`(R42)과 scan 세 종류(`security-scan` R43, `security-diff-scan` R71, `deep-security-scan` R72)가 있고, 모두 `threatmodel.md`라는 같은 문서를 남긴다. 뒤에는 다른 스킬이 없고(판정: 원장에 이 스킬에서 나가는 스킬 넘김이 없다) 사용자가 explorer HTML을 받는다. 전체 흐름은 `codex-security/_group-threat-model-and-policy/threat-model-and-policy.html`을 가리킨다.

@workflow id=position-flow title="위협 모델 문서에서 explorer까지"
| tm | threat-model | backend | source:tm-ret |
| scans | scan 스킬 세 종류 | backend | source:sa-doc |
| current | threat-model-visualize | frontend | source:purpose |
| out | explorer HTML | external | source:b-deliver |
| tm > current | R42 threatmodel.md | emphasis |
| scans > current | R43 R71 R72 | emphasis |
| current > out | 로컬 파일 | emphasis |

@steps id=position-steps
| s-tm | threat-model | 앞 스킬이다. 단독 요청이면 `threatmodel.md`를 저장하고, 재사용 가능한 공유 모델이면 끝에 `Repository:`와 `Version:` 두 줄을 붙인다. 이 스킬은 그 artifact를 `--assessment`로 받는다. 필수 순서는 아니다(R42, 산출물 호환).[](source:tm-ret)[](source:art-model)[](source:req)[](source:b-cmd) | position-flow | tm |
| s-scans | scan 스킬 세 종류 | 앞 스킬이다. host가 scan의 `scan.threatModel`을 `scan-manifest.json`에서 읽어 `<scan_dir>/threatmodel.md`로 렌더링하고, scan이 끝나지 않았으면 provisional로 표시한다.[](source:sa-doc)[](source:tmd) diff scan도 모델을 `complete: false` draft로 저장해 같은 길을 탄다(R71).[](source:ds-model) Deep scan은 첫 모델을 부모의 `scan.threatModel`에 두고 다른 worker의 모델은 worker 기록에 두므로, 이 스킬이 읽는 것은 부모의 primary model이 만든 `threatmodel.md`다(R72).[](source:deep-end)[](source:sc-model) 이 스킬 쪽에는 scan 종류별 문장이 없고 "last scan of X"라는 일반 요청이 이를 포괄한다. 여러 snapshot을 합치지 말라는 규칙이 여기서도 적용된다.[](source:req) | position-flow | scans |
| s-current | threat-model-visualize | 이 페이지의 스킬이다. 위 문서를 받아 새 평가 없이 explorer로 바꾼다. 앞 스킬이 끝났는지를 확인하라는 문장은 원문에 명시 없음이다. | position-flow | current |
| s-out | explorer HTML | 이 스킬이 넘기는 것이다. 기본은 로컬 파일이고, 사용자가 명시적으로 요청하면 사이트 게시, inline preview는 visualize integration, 정적 요청은 SVG나 PNG다. 이 뒤쪽 호스팅 문서들은 이 트리에 없어 읽지 못했다(R69, 범위 밖).[](source:b-deliver) | position-flow | out |

| 관계 | 종류 | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- | --- |
| R42 `threat-model` to 이 스킬 | 산출물 호환 | `threatmodel.md` | explorer HTML | 필수 순서가 아니고, 사용자가 기존 위협 모델을 줄 때다.[](source:req) |
| R43 `security-scan` to 이 스킬 | 산출물 호환 | 마지막 scan의 `threatmodel.md` | explorer HTML | 최신 artifact가 없으면 이전 것을 쓰기 전에 알린다.[](source:req) |
| R71 `security-diff-scan` to 이 스킬 | 산출물 호환 | diff scan이 남긴 `threatmodel.md` | explorer HTML | 원문에 diff scan만 따로 말한 문장은 없다.[](source:ds-model)[](source:req) |
| R72 `deep-security-scan` to 이 스킬 | 산출물 호환 | 부모의 primary model | explorer HTML | worker 모델을 자동으로 합치지 않는다.[](source:sc-model)[](source:req) |

## 어디까지 읽었고 무엇을 확인하지 못했나? {#audit span=12}

대상 스킬 폴더의 텍스트 파일 14개 전부를 읽거나 표본으로 봤고, 필수 참조 파일 9개와 관계 확인용 원문 7개를 더해 모두 30개다. 어떤 스크립트나 test도 실행하지 않았고 browser도 열지 않았다. 바이트 수는 파일당 한 번만 적는다.

| 구분 | 파일과 바이트 | 읽은 범위 |
| --- | --- | --- |
| 전부 읽음: 스킬 폴더 | `SKILL.md` 19102B, `agents/openai.yaml` 259B, `references/view-model.md` 12062B, `references/context-explorer.md` 5636B, `scripts/build_explorer.py` 27557B, `assets/explorer.html` 2673B, `assets/control-effects.js` 4005B, `assets/route-paths.js` 3648B, `assets/source-roles.js` 2762B | 줄 끝까지 읽었다.[](source:skill-md)[](source:yaml)[](source:html)[](source:rp)[](source:sr) |
| 전부 읽음: 필수 참조 test | `tests/.../control-effects.test.mjs` 6982B, `source-roles.test.mjs` 3269B, `browser/export-smoke.test.mjs` 9736B, `browser/fixture.mjs` 2722B, `browser/README.md` 1754B | 전부 읽었다.[](source:t-fx)[](source:t-sr)[](source:t-smoke)[](source:t-fixture)[](source:t-readme) |
| 전부 읽음: 관계 확인 원문 | `skills/threat-model/SKILL.md` 2986B, `mcp-app/src/threat-model-document.ts` 2657B | 전부 읽었다.[](source:tm-ret)[](source:tmd) |
| 부분 읽음: explorer.js | 42283B | 372줄을 모두 훑었지만 긴 줄 일부의 끝이 잘렸다.[](source:ex-map) |
| 부분 읽음: svg-layout.js | 11530B | 75~96줄 일부는 도구 출력이 잘려 읽지 못했고 나머지는 읽었다. 함수 목록은 확인했다.[](source:sl-node) |
| 구조·표본만 확인: CSS와 SVG | `assets/explorer.css` 12126B, `assets/context-reference-overview.svg` 36850B, `assets/context-reference-path.svg` 60788B | CSS는 선택자 목록과 외부 URL 검색, SVG는 화면 문구 표본만 봤다.[](source:css)[](source:svg-overview)[](source:svg-path) |
| 구조·표본만 확인: test | `tests/test_threat_model_visualize.py` 38192B, `renderer-scope.test.mjs` 35787B, `route-paths.test.mjs` 12918B, `svg-layout.test.mjs` 10318B | Python test는 앞 200줄과 test 이름, mjs 세 개는 test 이름과 앞부분만 봤다.[](source:t-py)[](source:t-scope)[](source:t-rp)[](source:t-sl) |
| 부분 읽음: 관계 확인 원문 | `references/artifact-storage.md` 7947B, `references/scan-artifacts.md` 11701B, `skills/security-diff-scan/SKILL.md` 5405B, `skills/deep-security-scan/SKILL.md` 3127B, `references/scan-contract.md` 16529B | 필요한 줄만 읽었다.[](source:art-model)[](source:sa-doc)[](source:ds-model)[](source:deep-end)[](source:sc-model) |

읽은 텍스트 파일은 전부 읽음 16개(필수 참조와 관계 확인 포함)와 부분·표본 14개다. 번역본(`*.KO.md`)은 없고 바이너리는 이 스킬 폴더에 없다. 분석 중 바뀐 파일은 없다(`git status`로 이 경로 아래를 확인했다).

@callout level=open-question title="확인하지 못한 항목"
| 선택, 장벽 미리보기, 글자 배치, SVG export가 실제 browser에서 계약대로 나오는지는 실행하지 않아 확인하지 못했다. `svg-layout.js`와 `explorer.js`의 일부, 거대한 test 파일 대부분은 표본만 봤다.[](source:ex-map)[](source:sl-node)[](source:t-scope) |
| `spawn_agent`와 `fork_turns` 옵션을 정의한 도구, "Sites workflow", "visualize integration", "shared workbench" 문서는 이 트리에 없어 읽지 못했다(R69, 범위 밖).[](source:rv-when)[](source:b-deliver) |
| 보조 Markdown은 `save_codex_security_artifact`로 저장하라는 저장 규칙이 있다. 스킬은 `source-inventory.md`와 `correctness-review.md`를 "workspace"에 저장하라고 한다. 두 규칙 중 무엇이 우선하는지는 원문에 명시 없음이다. 이 스킬은 `artifact-storage.md`를 읽으라고 지시하지 않는다.[](source:art-supp)[](source:inv-when)[](source:rv-receipt) |
| browser smoke test의 README는 browser가 없으면 test가 실패하고 건너뛰지 않는다고 하고, 스킬 본문은 허용된 browser가 없으면 QA를 미완으로 표시하라고 한다. 한쪽은 저장소의 test 실행, 다른 쪽은 에이전트 절차를 말하므로 충돌로 보지 않지만, 어느 쪽이 우선하는지 적은 원문은 없다.[](source:t-readme)[](source:b-browser) |
| `PASS` 기록이 없는 초안에 `build_explorer.py`를 돌려도 되는지, 최신 모델이 없을 때 사용자 응답을 기다리는지, 사람이 승인해야 하는 단계가 있는지는 원문에 명시 없음이다.[](source:b-cmd)[](source:req) |
