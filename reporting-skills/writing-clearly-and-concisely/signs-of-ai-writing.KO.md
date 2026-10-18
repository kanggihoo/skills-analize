# AI 글쓰기의 징후

[![ChatGPT 화면 캡처. 내용: "[header] Legacy & Interpretation [body] The "Black Hole Edition" is not just a meme — it's a celebration of grassroots car culture, where ideas are limitless and fun is more important than spec sheets. Whether powered by a rotary engine, a V8 swap, or an imagined fighter jet turbine, the Miata remains the canvas for car enthusiasts worldwide."](https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/ChatGPT_response_screenshot_1.jpg/250px-ChatGPT_response_screenshot_1.jpg)](https://en.wikipedia.org/wiki/File:ChatGPT_response_screenshot_1.jpg)

*LLM은 식별 가능한 글쓰기 스타일을 갖는 경향이 있다.*

이 목록은 [ChatGPT](https://en.wikipedia.org/wiki/ChatGPT "ChatGPT")와 같은 [AI 챗봇](https://en.wikipedia.org/wiki/AI_chatbot "AI chatbot")에서 흔히 나타나는 글쓰기 및 서식 관례를 정리한 것이며, 실제 예시는 Wikipedia 문서와 초안에서 가져왔다. 이는 Wikipedia에서 [공개되지 않은 AI 생성 콘텐츠](https://en.wikipedia.org/wiki/Wikipedia:LLMDISCLOSE "Wikipedia:LLMDISCLOSE")를 탐지하는 데 도움을 주기 위한 [현장 안내서](https://en.wikipedia.org/wiki/Field_guide "Field guide")이다. 이 목록은 *규범적*이 아니라 *기술적(descriptive)*이다. 즉 규칙이 아니라 관찰 결과로 이루어져 있다. Wikipedia 문서에서 피해야 할 서식이나 언어에 관한 조언은 [정책과 지침](https://en.wikipedia.org/wiki/Wikipedia:PAG "Wikipedia:PAG")과 [스타일 매뉴얼](https://en.wikipedia.org/wiki/Wikipedia:MOS "Wikipedia:MOS")에서 찾을 수 있으며, 이 문서에 포함되지 않는다.

이 목록은 특정 단어, 표현, 문장부호를 금지하는 것이 *아니다*. AI 챗봇을 구동하는 [대규모 언어 모델](https://en.wikipedia.org/wiki/Large_language_model "Large language model")은 Wikipedia 편집자들의 글을 포함한 사람이 쓴 글로 학습되므로, 이런 지표를 보인다고 해서 모든 글이 AI로 생성된 것은 아니다. 이것은 수많은 AI 생성 텍스트 사례에서 관찰된 매우 흔한 패턴을 *Wikipedia에 특화하여* 모아 둔 목록일 뿐이다. 그중 일부 조언은 폭넓게 적용될 수 있지만, 일부 징후, 특히 문장부호와 서식에 관한 것은 Wikipedia가 아닌 맥락에는 적용되지 않을 수 있다.

여기 나온 패턴은 문제의 *징후*일 뿐 *문제 자체*는 아니다. 이런 문제의 상당수는 과도한 굵은 글씨, 부적절한 언어와 문장부호 사용, 깨진 마크업, 출처 표기 방식의 특이함처럼 즉시 눈에 띄고 고치기 쉽지만, 이는 [훨씬 더 심각한 정책적 위험](https://en.wikipedia.org/wiki/Wikipedia:AIFAIL "Wikipedia:AIFAIL")을 수반하는 덜 드러난 문제를 가리킬 수 있다. LLM이 생성한 텍스트가 (처음부터든 나중에든) 충분히 다듬어졌다면 이런 표면적 결함은 없을 수 있지만, 더 깊은 문제는 있을 수 있다. 이런 징후를 단순히 고쳐야 할 문제로만 다루지 마라. 그렇게 하면 탐지만 더 어려워질 뿐이다. 실제 문제는 그 더 깊은 우려이므로, [Wikipedia:Large language models §Handling suspected LLM-generated content](https://en.wikipedia.org/wiki/Wikipedia:Large_language_models#Handling_suspected_LLM-generated_content "Wikipedia:Large language models")와 [Wikipedia:WikiProject AI Cleanup/Guide](https://en.wikipedia.org/wiki/Wikipedia:WikiProject_AI_Cleanup/Guide "Wikipedia:WikiProject AI Cleanup/Guide")의 조언에 따라 직접 다루거나 문제로 표시해야 한다.

[신속 삭제 정책](https://en.wikipedia.org/wiki/Wikipedia:Speedy_deletion "Wikipedia:Speedy deletion")의 기준 [G15](https://en.wikipedia.org/wiki/Wikipedia:G15 "Wikipedia:G15")(사람의 검토 없이 LLM이 생성한 문서)는 문서 내용이 LLM으로 생성되었다는 가장 객관적이고 가장 이의 제기가 어려운 지표로 한정된다. 그러한 지표는 세 가지가 있으며, 첫 번째는 [§사용자를 위한 의사소통](#communication-intended-for-the-user)에서, 나머지 두 개는 [§인용](#citations)에서 찾을 수 있다.

텍스트가 LLM으로 생성되었는지 평가할 때 [인공지능 콘텐츠 탐지](https://en.wikipedia.org/wiki/Artificial_intelligence_content_detection "Artificial intelligence content detection") 도구(예: [GPTZero](https://en.wikipedia.org/wiki/GPTZero "GPTZero"))에만 의존하지 마라. 이런 도구는 우연보다는 나은 성능을 보이지만, 무시할 수 없는 오류율이 있으며 사람의 판단을 대신할 수 없다.[^1] 탐지기는 텍스트 수정(예: 바꾸어 쓰기, 띄어쓰기 변경)이나 탐지기 학습 때 보지 못한 생성 모델의 사용과 같은 여러 요인에 취약할 수 있다.[^2] 같은 맥락에서, 자신의 해석을 지나치게 믿지도 마라. 연구에 따르면 LLM을 많이 사용하는 사람들은 글이 AI로 생성되었는지를 약 90%의 정확도로 판단할 수 있다. 이는 LLM 전문가가 페이지 10개에 AI 생성 태그를 붙였다면, 아마 편집자 한 명을 잘못 고발했을 것이라는 뜻이다.[^3] 개인적으로 LLM을 거의 사용하지 않는 사람들은 AI 생성 문서를 식별하는 데 있어 무작위 추측보다 (양방향 모두에서) 약간 나을 뿐이다.[^3]

---

## 평균으로의 회귀

LLM(및 일반적인 [인공 신경망](https://en.wikipedia.org/wiki/Artificial_neural_network "Artificial neural network"))은 방대한 학습 자료에 기반하여 다음에 올 것을 추측(추론)하기 위해 통계 알고리즘을 사용한다. 따라서 [평균으로 회귀](https://en.wikipedia.org/wiki/Regression_to_the_mean "Regression to the mean")하는 경향이 있다. 즉 결과물은 가장 넓은 범위의 사례에 적용되는, 통계적으로 가장 가능성이 높은 결과로 기운다. 이는 동시에 AI 생성 콘텐츠를 탐지하는 데 강점이자 "단서(tell)"가 될 수 있다.

예를 들어 LLM은 보통 인터넷의 데이터로 학습되는데, 그 데이터에서 유명 인물은 대개 긍정적이고 중요해 보이는 언어로 묘사된다. 그 결과 LLM은 구체적이고 특이하며 미묘한 사실(통계적으로 드문 것들)을 생략하고, 이를 더 일반적이고 긍정적인 묘사(통계적으로 흔한 것들)로 바꾸는 경향이 있다. 따라서 매우 구체적인 "최초의 열차 연결 장치 발명자"는 "혁명적인 산업 거인"이 될 수 있다. 이는 초점이 선명한 사진이 흐릿하고 일반적인 스케치로 바래 가는 초상화를 두고, 그 인물이 유일하게 중요한 사람이라고 점점 더 큰 목소리로 외치는 것과 같다. 대상은 동시에 더 구체성을 잃고 더 과장된다.[^4]

이런 통계적 평균으로의 회귀, 즉 구체적인 사실을 많은 주제에 똑같이 적용될 수 있는 일반적 진술로 뭉개는 것은 AI가 생성한 콘텐츠를 더 쉽게 탐지하게 만든다.

### 상징, 유산, 중요성에 대한 지나친 강조

**주목할 표현:** *stands/serves as*(~의 역할을 하다/~이다), *is a testament/reminder*(~의 증거/상기물이다), *plays a vital/significant/crucial/pivotal role*(중요한/결정적인 역할을 한다), *underscores/highlights its importance/significance*(그 중요성을 강조한다/부각한다), *reflects broader*(더 넓은 것을 반영한다), *symbolizing its ongoing/enduring/lasting impact*(지속적/영속적 영향을 상징한다), *key turning point*(핵심 전환점), *indelible mark*(지울 수 없는 흔적), *deeply rooted*(깊이 뿌리내린), *profound heritage*(깊은 유산), *steadfast dedication*(변함없는 헌신)...

LLM의 글은 주제의 임의적인 측면들이 더 넓은 주제를 어떻게 대표하거나 기여하는지에 대한 진술을 덧붙여 주제의 중요성을 과장하는 경우가 많다.[^5] 이런 진술을 쓰는 방식에는 뚜렷하고 쉽게 식별되는 레퍼토리가 있다.[^6]

> 카탈로니아 통계 연구소는 1989년에 공식적으로 설립되었으며, 이는 스페인 지역 통계의 발전에 있어 결정적인 순간을 표시했다. [...]
>
> Idescat의 설립은 지역 통계 독립성으로의 중요한 전환을 나타냈으며, [카탈루냐](https://en.wikipedia.org/wiki/Catalonia "Catalonia")가 자신의 독특한 사회경제적 맥락에 맞춘 통계 체계를 발전시킬 수 있게 했다. 이 계획은 행정 기능을 분산하고 지역 거버넌스를 강화하려는 스페인 전역의 더 넓은 움직임의 일부였다.

> 쿰바는 오랫동안 무역과 농업의 중요한 중심지였다. [...] 쿰바를 맘페, 부에아 같은 남서부 지역의 다른 지역과 잇는 도로망의 건설은 쿰바가 지역 거점으로서의 역할을 공고히 하는 데 도움이 되었다.

LLM은 어원이나 인구 데이터처럼 가장 평범한 주제에 대해서도 이런 진술을 넣을 수 있다. 때로는 주제가 비교적 중요하지 않거나 눈에 잘 띄지 않는다고 인정하는 완충 서두를 붙인 뒤, 어쨌든 그 중요성에 대해 이야기하기도 한다.

**예시**

> [스페인 식민 시대](https://en.wikipedia.org/wiki/Spanish_Colonial_Period_(Philippines) "Spanish Colonial Period (Philippines)") 동안 *Bakunutan*이라는 이름은 *Bacnotan*으로 스페인식으로 바뀌었으며, 이 변경은 마닐라의 [국립 기록원](https://en.wikipedia.org/wiki/National_Archives_of_the_Philippines "National Archives of the Philippines")에 보존된 공문서에 반영되어 있다. 이 어원은 그 공동체의 저항이 지닌 영속적 유산과 정체성을 형성하는 데 있어 단결이 가진 변혁의 힘을 부각한다.

> 비록 제한적으로 적용되었을 뿐이지만, 이것은 초기 항공 공학의 더 넓은 역사에 기여했으며 독일 제조업체들에게 프랑스 로터리 엔진 설계가 미친 영향을 반영한다.

생물학에 관해 이야기할 때(예: 동물이나 식물 종에 대해 논의하도록 요청받았을 때), LLM은 그 연관성이 미미하거나 일반적일 때조차 더 넓은 생태계나 환경과의 연결을 과도하게 강조하는 경향이 있다. LLM은 또한 보존 상태가 알려져 있지 않고 진지한 노력이 존재하지 않을 때조차 그 종의 보존 상태와 연구 및 보호 노력을 장황하게 늘어놓는 경향이 있다.

**예시**

> 이 종은 생태계에서 역할을 하며 하와이의 풍부한 문화 유산에 기여한다. [...] 이 고유종을 보존하는 것은 생태적 다양성뿐 아니라 하와이 토종 식물과 관련된 문화 전통을 지속하는 데에도 매우 중요하다.

> 현재 *Lethrinops lethrinus*에 대한 국제자연보전연맹(IUCN)의 구체적인 보전 평가는 없다. 그러나 말라위 호수 생태계의 전반적인 건강 상태는 이 종과 다른 고유종의 생존에 결정적이다. 남획, 오염, 서식지 파괴와 같은 요인은 그들의 개체군에 잠재적으로 영향을 줄 수 있다.

### 저명성, 출처 표기, 언론 보도에 대한 지나친 강조

**주목할 표현:** *independent coverage*(독립적 보도), *local/regional/national/[country name] media outlets*(지역/지방/전국/[국가명] 언론 매체), *music/business/tech outlets*(음악/비즈니스/기술 매체), *active social media presence*(활발한 소셜 미디어 활동)

마찬가지로 LLM은 어떤 주제가 저명하다는 것을 증명하는 가장 좋은 방법이 저명성에 대한 주장을 독자에게 강하게 들이미는 것이라도 되는 듯 행동하며, 종종 그 주제가 다뤄진 출처를 나열한다. 그 출처들이 그 주제에 대해 실제로 무엇을 말했는지에 대한 추가 맥락을 제공하거나 제공하지 않을 수 있으며, 종종 자신의 [피상적인 분석](#superficial-analyses)을 출처의 것으로 잘못 귀속시킨다. 이는 최신 AI 도구(2025년 이후)의 텍스트에서 더 흔하다.

사람이 쓴 보도자료도 물론 수십 년 동안 신문 기사를 인용해 왔다. 그러나 Wikipedia 문서를 쓰도록 특별히 요청받은 LLM은 종종 [Wikipedia의 지침](https://en.wikipedia.org/wiki/Wikipedia:N "Wikipedia:N")의 정확한 문구, 예를 들어 "독립적 보도"를 그대로 따라 한다.

**예시**

> 그녀는 CNN에서 AI에 대해 이야기했고, *Vogue*, *Wired*, *Toronto Star* 및 기타 언론에 소개되었다. [...] 그녀의 통찰은 *Wired*, *Refinery29* 및 기타 주요 언론 매체에도 소개되었다.

> 그녀의 견해는 *The New York Times*, *BBC*, *Financial Times*, *The Hindu*에 인용되었다.

> 그 의미는 보관된 학교 행사 프로그램과 지역 언론 보도, 특히 그곳에서 열린 공연을 정기적으로 평했던 *Mesabi Daily News*에 기록되어 있다.

Wikipedia에서는 LLM이 본문에서 출처를 공들여 강조하는 경우가 많다. 사소한 보도, 논란의 여지가 없는 사실, 또는 사람인 Wikipedia 편집자라면 인라인 인용을 달거나 아예 출처를 쓰지 않았을 상황에서도 그렇게 한다.

**예시**

> 이 식당은 주변 구역의 사건과 관련된 [ABC News](https://en.wikipedia.org/wiki/ABC_News_(Australia) "ABC News (Australia)") 보도에서도 언급되었으며, 이는 [애들레이드](https://en.wikipedia.org/wiki/Adelaide "Adelaide")에서 잘 알려진 심야 명소로서의 역할을 강조한다.

> 미국에서는 이런 센터와 함께 대학 기반 인큐베이터와 액셀러레이터가 확장되었다. 미 국회도서관의 공식 검토에 따르면, 2014~2016년 [SBA(중소기업청)](https://en.wikipedia.org/wiki/Small_Business_Administration "Small Business Administration") 성장 액셀러레이터 펀드 경쟁의 수상자 중 31.5%가 대학 기반 프로그램이었다.

소셜 미디어를 사용하는 사람이나 단체에 관한 글에서 LLM은 종종 그들이 "활발한 소셜 미디어 활동을 유지한다"거나 그와 비슷하게 쓴다. 이런 표현은 AI 텍스트에 특히 특이하며, 2024년 무렵 이전의 Wikipedia에서는 상대적으로 드물다.

> 이 쇼핑몰은 특히 인스타그램에서 강력한 디지털 존재감을 유지하며, 최신 소식과 행사를 적극적으로 공유한다. Forum Kochi는 디지털 프로모션에서 꾸준히 탁월함을 보여 왔으며, 고품질의 매력적이고 영향력 있는 영상 콘텐츠가 홍보에서 핵심 역할을 한다.

### 피상적인 분석

**주목할 표현:** *ensuring ...*(~을 보장하며), *highlighting ...*(~을 부각하며), *emphasizing ...*(~을 강조하며), *reflecting ...*(~을 반영하며), *underscoring ...*(~을 강조하며), *showcasing ...*(~을 보여 주며), *aligns with...*(~와 부합하며), *contributing to...*(~에 기여하며)

AI 챗봇은 종종 정보에 대한 피상적인 분석을 끼워 넣는데, 대개 그 정보의 중요성, 인지도, 영향력과 관련된다.[^7] 이는 보통 문장 끝에 현재분사("-ing") 구를 붙이는 방식으로 이루어지며, 때로는 제3자에 대한 [모호한 귀속](#vague-attributions-of-opinion)과 함께 쓰인다(아래 참조).[^7][^5]

[이런 단어 중 상당수는 그 자체로 강한 AI의 단서이지만](https://en.wikipedia.org/wiki/Wikipedia:AIWORDS "Wikipedia:AIWORDS"),[^6][^8] 그보다 더 강력한 단서는 이런 동사의 주어가 사실, 사건, 또는 기타 무생물일 때이다. 예를 들어 사람은 무언가를 부각하거나 강조할 수 있지만, 사실이나 사건은 그럴 수 없다. "부각하다"나 "강조하다"는 실제로 일어나고 있는 일이 아니라, 어떤 것의 의미에 대해 실체 없는 화자가 하는 주장이다.[^5]

이런 논평은 대개 [종합(synthesis)](https://en.wikipedia.org/wiki/Wikipedia:SYNTH "Wikipedia:SYNTH")이거나 Wikipedia 본문 목소리(wikivoice)에서의 출처 없는 의견이다. [검색 증강 생성(retrieval-augmented generation)](https://en.wikipedia.org/wiki/Retrieval-augmented_generation "Retrieval-augmented generation")을 사용하는 최신 챗봇(예: 웹을 검색할 수 있는 AI 챗봇)은 출처가 그와 비슷한 말을 하는지와 상관없이, 이런 진술을 [명명된 출처](#undue-emphasis-on-notability-attribution-and-media-coverage)에 붙이기도 한다(예: "Roger Ebert는 지속적인 영향력을 부각했다").

**예시**

> Douera는 수도 알제와 가까워 활기찬 활동과 문화의 중심지로서의 중요성을 한층 더 높인다.

> 민권 운동은 이 투쟁의 강력한 연장선으로 등장했으며, 정의를 위한 싸움에서 연대와 집단행동의 중요성을 강조했다. 이 역사적 유산은 현대 아프리카계 미국인 가정에 영향을 미쳐, 그들의 가치관, 공동체 구조, 정치 참여 방식을 형성해 왔다. 경제적으로는 체계적 불평등의 영속적 영향이 아프리카계 미국인 공동체 내에서 도전과 혁신을 함께 낳았으며, 여러 세대를 거쳐 울려 퍼지는 권한 강화와 사회 변화에 대한 헌신을 이끌어 왔다.

> 영어와 스페인어 두 언어로 된 명문 기념 표지판은 미국과 멕시코의 말일성도(모르몬교) 신자들을 하나로 모으는 역할을 부각한다.

> 60년 넘게 걸쳐 권위 있는 학술지에 실린 이 인용들은 계산언어학, 문법, 신어학에서 Blois의 영속적인 영향력을 보여 준다.

> 이 역은 [인도 철도](https://en.wikipedia.org/wiki/Indian_Railways "Indian Railways")의 [동중부 철도 구역](https://en.wikipedia.org/wiki/East_Central_Railway_Zone "East Central Railway Zone")에서 중요한 위치를 차지하며, 역사적 중요성을 지닌 주요 철도 거점으로 기능한다. 이 역에는 [1,676 mm](https://en.wikipedia.org/wiki/5_ft_6_in_gauge_railway "5 ft 6 in gauge railway")(5피트 6인치) [광궤](https://en.wikipedia.org/wiki/Broad_gauge "Broad gauge")가 깔려 있고 8개의 선로와 6개의 승강장이 있다. [...] 역사적으로 이 역은 [다르반가](https://en.wikipedia.org/wiki/Darbhanga "Darbhanga")를 [델리](https://en.wikipedia.org/wiki/Delhi "Delhi"), [파트나](https://en.wikipedia.org/wiki/Patna "Patna"), [콜카타](https://en.wikipedia.org/wiki/Kolkata "Kolkata") 같은 주요 도시와 잇는 데 결정적이었으며, 승객과 화물의 이동을 원활하게 했다. 이 역은 여객 열차와 [사트야그라 특급](https://en.wikipedia.org/wiki/Satyagrah_Express "Satyagrah Express") 및 [미틸라 특급](https://en.wikipedia.org/wiki/Mithila_Express "Mithila Express") 같은 특급 열차를 포함한 다양한 운행을 지원해 왔으며, 이 지역의 사회경제 발전에 기여했다. [...] 수년에 걸쳐 다르반가 주요 역은 시설과 운영 효율을 개선하기 위한 여러 차례의 개량과 현대화 노력을 거쳤으며, 이는 지역 및 국가 교통망에서 그 역이 계속해서 중요하다는 것을 반영한다.

### 홍보 및 광고 같은 언어

**주목할 표현:** *continues to captivate*(계속해서 사로잡는다), *groundbreaking*(비유적 의미의 획기적인), *stunning natural beauty*(숨 막히는 자연미), *enduring/lasting legacy*(영속적/지속적 유산), *nestled*(자리 잡은), *in the heart of*(~의 중심에), *boasts a*(~을 자랑한다)...

LLM은 중립적인 어조를 유지하는 데 심각한 문제가 있으며, 특히 "문화유산"으로 여겨질 수 있는 것에 대해 쓸 때는 더욱 그렇다. 이 경우 LLM은 [그것의 중요성을 끊임없이 상기시킨다](#undue-emphasis-on-symbolism-legacy-and-importance).

**예시**

> 에티오피아 곤더 지역의 숨 막히는 풍광 속에 자리 잡은 알라미타 라야 코보는 풍부한 문화유산과 암하라 지역 내에서의 중요한 위치를 지닌 활기찬 도시로 우뚝 서 있다. 그 아름다운 풍경에서 역사적 명소에 이르기까지, 알라미타 라야 코보는 방문객들에게 에티오피아의 다채로운 모습을 엿볼 수 있는 매혹적인 기회를 제공한다. 이 글에서는 알라미타 라야 코보를 방문할 만한 도시로 만드는 독특한 특징들을 살펴보고, 암하라 지역 내에서의 그 의미를 조명할 것이다.

> TTDC는 타밀나두의 다양한 명소로 들어가는 관문으로서, 모든 여행자의 여정의 시작과 끝을 매끄럽게 잇는다. 이곳은 믿을 수 있고 가치 중심의 경험을 제공하며, 주의 풍부한 역사, 영적 유산, 자연미를 보여 준다.

이와 비슷하게 LLM 챗봇은 기업, 비즈니스, 제품에 관한 텍스트에도 홍보성 또는 긍정적으로 들리는 언어를 덧붙여, 마치 TV 광고 대본처럼 들리게 만든다.

> 일반적으로 AEO는 "답변 엔진(answer engine)"이 정보를 정확하게 이해할 수 있도록 데이터 일관성과 기계 판독성을 개선하는 데 초점을 맞춘다. 흔히 논의되는 실천 방법에는 [JSON-LD](https://en.wikipedia.org/wiki/JSON-LD "JSON-LD")와 [schema.org](https://en.wikipedia.org/wiki/Schema.org "Schema.org") 같은 구조화된 데이터 형식을 사용하는 것, 게시된 정보의 최신성과 정확성을 유지하는 것, 그리고 디지털 실체를 [Wikidata](https://en.wikipedia.org/wiki/Wikidata "Wikidata")나 Schema.org 같은 개방형 웹 표준에 맞추는 것이 포함된다.

> SOLLEI의 외관 디자인은 강렬한 감성적 존재감을 전달하며, 캐딜락 특유의 대담한 비율을 충실히 이어 간다. 낮고 길게 뻗은 실루엣은 넓은 자세와 확장된 쿠페 도어로 강조되어, 넓은 후방 객실로의 접근성을 높인다. 매끄럽고 끊김 없는 표면과 뚜렷한 A라인은 차량의 전체 길이를 돋보이게 하며, 날렵하고 낮은 후미는 세련된 역동성을 불어넣는다. 중간 몸체의 선은 헤드램프에서 테일램프까지 자연스럽게 이어져, 차량의 일관되고 우아한 디자인을 강화한다. 전통적인 도어 손잡이는 은밀한 버튼으로 대체되어 차량의 깔끔하고 현대적인 외형을 유지한다. 캐딜락의 대담한 색상 선택이라는 유산에 대한 경의로, 외장은 "마닐라 크림"으로 마감되었다. 이는 1957년과 1958년에 처음 제공된 독특한 색조이다. 이 유산의 색은 캐딜락 장인들이 세심하게 되살려 손으로 칠했으며, 브랜드의 장인 정신과 역사에 대한 존중을 보여 준다.

### 교훈적이고 논평적인 단서 문구

**주목할 표현:** *it's important/critical/crucial to note/remember/consider*(주목/기억/고려하는 것이 중요하다/결정적이다/핵심이다), *may vary*(다를 수 있다)...

LLM은 종종 독자에게 "기억해야 할 중요한 점"을 이야기한다. 이는 안전이나 논란이 있는 주제에 관해 상상 속의 독자에게 하는 "단서 문구"의 형태를 띠거나, 지역이나 관할권에 따라 달라지는 주제를 구분하는 형태를 띠는 경우가 많다.

**예시**

> 이러한 비공식 집단의 등장은 도시 문제의 상호 연결된 성격과, ANC가 도시 전체 정책을 형성하는 데 역할을 할 수 있는 가능성에 대한 인식이 커지고 있음을 반영한다. 다만 주목할 점은 이 간담회들이 공식 ANC 구조 밖에서 운영되며, 정책 결정에 미치는 영향은 다를 수 있다는 것이다.

> 이 보고서의 대상인 아르메니아 예레반에 기반을 둔 독립 AI 연구 기업을, 혼란을 피하기 위해 이들 무관한 조직과 구별하는 것이 매우 중요하다.

> 한 나라에서 무료인 것이 다른 나라에서는 무료가 아닐 수 있다는 점을 기억하는 것이 중요하므로, 무언가를 사용하기 전에 항상 확인하라.

### 요약과 결론

**주목할 표현:** *In summary*(요약하면), *In conclusion*(결론적으로), *Overall*(전반적으로)...

더 긴 결과물을 생성할 때(예: "기사를 써 달라"는 요청을 받았을 때), LLM은 종종 "결론" 또는 그와 비슷한 제목의 섹션을 추가하며, 단락이나 섹션의 끝을 핵심 생각을 요약하고 되풀이하는 것으로 마무리하는 경우가 많다.[^9]

**예시**

> 요약하면, 간호 과학자의 교육 및 훈련 과정은 대개 간호학 석사 과정에서 간호학 박사(PhD) 과정으로 나아간 다음, 간호 연구 분야의 박사후 과정 훈련으로 이어지는 흐름을 가진다. 이 체계적인 경로는 간호 과학자들이 엄밀한 연구에 참여하고 간호 과학의 발전에 의미 있게 기여하는 데 필요한 지식과 기술을 확실히 갖추도록 한다.

### 과제와 향후 전망에 관한 개요식 결론

**주목할 표현:** *Despite its... faces several challenges...*(그 ...에도 불구하고 여러 과제에 직면해 있다...), *Despite these challenges*(이러한 과제에도 불구하고), *Challenges and Legacy*(과제와 유산), *Future Outlook*(향후 전망)...

LLM이 생성한 많은 Wikipedia 문서에는 "과제(Challenges)" 섹션이 포함되어 있으며, 보통 "[긍정적/홍보성 단어]에도 불구하고, [문서 주제]는 과제에 직면해 있다..."와 같은 문장으로 시작하고, 주제에 대한 모호하게 긍정적인 평가[^1]나 진행 중이거나 잠재적인 계획이 주제에 어떻게 도움이 될지에 대한 추측으로 끝난다. 이런 단락은 대개 경직된 개요식 구조를 가진 문서의 끝에 나오며, "향후 전망(Future Prospects)"이라는 별도 섹션을 포함할 수도 있다.

참고: 이 징후는 과제나 도전이 언급되었다는 사실이 아니라, 경직된 공식 자체에 관한 것이다.

**예시**

> 코라투르는 산업 및 주거 번영에도 불구하고 도시 지역에 흔히 있는 과제에 직면해 있으며, 그 과제에는 [...]이 포함된다. 전략적 위치와 진행 중인 계획을 통해, 코라투르는 산업과 주거의 시너지를 구현하며 암바투르 산업 지대의 불가분의 일부로서 계속 번영하고 있다.

> 성공에도 불구하고, 파나마 운하는 [...]을 포함한 과제에 직면해 있다. 자동 항법 시스템과 같은 기술에 대한 향후 투자와 잠재적인 추가 확장은 운하의 효율을 높이고 세계 무역에서의 관련성을 유지할 수 있을 것이다.

> 유망한 응용 분야에도 불구하고, 초전(pyroelectric) 소재는 더 널리 채택되기 위해 해결해야 할 여러 과제를 가진다. 한 가지 주요 한계는 [...]이다. 이러한 과제에도 불구하고, 초전 소재의 다재다능함은 지속 가능한 에너지 해법과 차세대 센서 기술의 핵심 구성 요소로 자리매김하게 한다.

> 탄화수소 경제의 미래는 [...]을 포함하여 여러 과제에 직면해 있다. 이 섹션에서는 잠재적 발전과 세계 에너지 환경의 변화를 추측해 볼 것이다.

> 현재 아프가니스탄의 미디어 환경에서 활동하는 것은 [...]을 포함한 수많은 과제를 제시한다. 이러한 과제에도 불구하고, Amu TV는 아프가니스탄 국민에게 필수적인 서비스를 계속 제공해 왔다.

> 예를 들어, 방법론이 원칙적으로는 초학제적 협업을 지원하지만, 크고 이질적인 팀에서 그것을 효과적으로 적용하는 것은 어려울 수 있다. [...] SCE는 이러한 과제에 대응하며 계속 발전하고 있다.

### 목록이나 넓은 문서 제목을 고유명사처럼 취급하는 도입부

고유명사(proper name)가 아닌 제목, 예를 들어 [목록](https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style/Lists "Wikipedia:Manual of Style/Lists") 같은 제목을 가진 주제에 관한 AI 생성 문서에서는, 도입부의 첫 문장이 문서 제목을 독립된 실제 실체인 것처럼 소개하거나 정의할 수 있다. [MOS](https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style/Lead_section#Format_of_the_first_sentence "Wikipedia:Manual of Style/Lead section")는 그런 제목을 도입부 첫머리에 "자연스러운 방식으로" 포함하는 것을 허용하지만, 이런 AI 도입부는 그만큼 자연스럽지 않은 경향이 있다.

**예시**

> "The Effects of Foreign language anxiety on Learning"(외국어 불안이 학습에 미치는 영향)은 모국어가 아닌 언어를 배우거나 사용할 때 겪는 긴장, 초조함, 불안감을 가리킨다.

> EuroGames editions(유로게임 판)는 유럽 LGBT+ 종합 스포츠 행사인 격년제 EuroGames의 연도순 목록이며, 이는 유럽 게이·레즈비언 스포츠 연맹(EGLSF)이 주관한다.

> "**List of songs about Mexico**"(멕시코에 관한 노래 목록)는 멕시코의 문화, 지리, 정체성을 중심 주제로 삼는 음악 작품들을 엮은 선별 모음이다.

---

## 언어와 문법

### 과용되는 "AI 어휘" 단어

**주목할 표현:** *align/aligns/aligning with*(~와 맞추다/부합하다),[^6][^8] *crucial*(결정적인),[^1] *delve/delves/delving*(파고들다; 2025년 이전),[^6][^8][^1] *emphasizing*(강조하는),[^6][^8] *enduring*(영속하는),[^8] *enhance/enhances/enhancing*(향상시키다),[^8][^1] *fostering*(촉진하는),[^8][^1] *garnered/garnering*(얻다/모으다),[^6][^8] *highlight/highlighted/highlighting/highlights*(동사로서 부각하다),[^1] *interplay*(상호작용),[^8] *intricate/intricacies*(복잡한/복잡성),[^6][^8][^7] *key*(형용사로서의 핵심적인), *landscape*(환경/지형),[^8] *leveraging*(활용하는),[^1] *multifaceted*(다면적인),[^6][^8][^7] *notably*(특히),[^8] *nuanced*(미묘한),[^6][^8] *realm*(영역),[^8] *robust*(견고한),[^1] *seamless/seamlessly*(매끄러운/매끄럽게),[^1] *shed light on*(~을 조명하다), *showcasing*(보여 주는),[^8] *streamline*(간소화하다),[^1] *tapestry*(직물/복합체),[^8] *testament*(증거),[^1][^8] *underpin/underpins/underpinning*(떠받치다),[^8] *underscore/underscores/underscoring*(강조하다),[^8] *vibrant*(활기찬),[^8][^7] *vital*(필수적인),[^1] ...

많은 연구에 따르면 LLM은 특정 단어를 과도하게 사용하며, 특히 2022년 이전의 텍스트와 비교하면 그렇다. 2022년 이전의 텍스트는 거의 확실히 사람이 쓴 것이다.[^6] 이런 "AI 어휘" 단어들은 [Grokipedia](https://en.wikipedia.org/wiki/Grokipedia "Grokipedia") 같은 AI 생성 백과사전과 AI가 생성한 Wikipedia 텍스트에도 흔하다. 이들은 LLM 출력에서 함께 나타나는 경향이 있다. 하나가 보이면 다른 것도 있을 가능성이 높다.[^10] 한두 개의 이런 단어를 도입한 편집은 큰 문제가 아닐 수 있지만, 많은 단어를 여러 번 도입한 편집(2022년 이후)은 AI 사용의 가장 강력한 단서 중 하나이다.

"AI 어휘"의 분포는 사용된 챗봇이나 LLM에 따라 약간 다르며,[^7] 시간에 따라 변해 왔다. 예를 들어 *delve*라는 단어는 2025년까지 ChatGPT가 유난히 과용했으나, 그 이후 사용 빈도가 급격히 줄었다.[^11]

문맥을 고려하라. 예를 들어 "underscore"라는 단어는 AI 텍스트에서 과용되지만, 문자 그대로 밑줄 표시나 [배경음악](https://en.wikipedia.org/wiki/Incidental_music "Incidental music")을 가리킬 수도 있다.

**예시**

> 소말리아 요리는 아랍, 인도, 이탈리아의 풍미에서 비롯된 다양한 요리 영향이 복잡하고 다양하게 융합된 것이다. 이 요리의 복합적 직물은 소말리아의 오랜 활기찬 교역과 번창한 상업이라는 유산의 직접적인 결과이다. [...]

>
> 또한 소말리아 요리 전통의 독특한 특징은 낙타 고기와 낙타 우유를 포함하는 것이다. 이들은 진미로 여겨지며, 소말리아 요리의 풍부한 직물 속에서 소중하고 근본적인 요소로 기능한다. [...]

>
> 이탈리아의 소말리아 식민 통치가 남긴 영속적 증거는 현지 요리 환경, 특히 남부에서 파스타와 라자냐가 널리 받아들여진 것이다. 이는 이 요리들이 쌀과 함께 전통 식단에 어떻게 통합되었는지를 보여 준다. [...]

>
> 또한 소말리아 상인들은 세계 커피 무역에서 중요한 역할을 했으며, 커피 원두를 가장 먼저 수출한 나라 중 하나였다.

### 부정적 병치

"Not only ... but ..."이나 "It is not just about ..., it's ..."처럼 "not", "but", "however"를 사용하는 병렬 구조는 LLM 글에서 흔하지만, 중립적 어조의 글에는 종종 적합하지 않다.[^1][^11]

**예시**

> 2010년에 제작되어 현재 피렌체의 유명한 우피치 미술관에 소장된 야요이 쿠사마의 **〈자화상〉**은 자기 재현의 작품일 뿐 아니라, 그녀의 강박, 시각적 전략, 심리 전기적 서사에 대한 시각적 기록을 구성한다.

> 이건 보컬 밑에 깔린 비트만의 문제가 아니다. 그것은 공격성과 분위기의 일부이다.

여러 문장에 걸친 부정적 병치의 예는 다음과 같다.

> 그는 연극적 유산으로 유명한 명문 두세(Duse) 가문 출신이었다. 그러나 에우제니오의 삶은 개인적 야망과 가문의 복잡한 얽힘이 함께 어우러진 길을 걸었다.

### 부정의 윤곽

드물게 AI가 생성한 것처럼 보이는 사용자 메시지에는, 다른 무언가에 부재하는 항목이나 이전의 유용한 항목에 비해 쓸모없다고 여겨질 항목을 설명하는 짧은 문장이 포함되기도 한다. 이들 중 일부는 "~도 없고, ~도 없고, 그저 ~일 뿐" 또는 "중요한 것은 ~이 아니라, ~도 ~도 아니다"와 같은 식으로 읽힐 수 있다.

**예시**

> 장문의 프로필은 없다. 편집자 차원의 통찰도 없다. 그녀의 게임 개발 경력에 대한 보도도 없다. 주목할 만한 수상 경력도 없다. 그저 틱톡 요약과 비난뿐이다.

---

> 이 과정은 엄격함을 요구한다. 감정적 피로도, 개인적 모욕도 아니며, 도덕적 우위의 가면을 쓴 성급한 퇴장은 더더욱 아니다.

---

> 경력도, 작품 세계도, 지속적인 관련성도 없다. 그저 알고리즘이 만든 한순간일 뿐이다.

---

> 이것은 애매한 사안이 아니다. 회색 지대도 아니다. 이 문서는 완전히 깔끔하게, 지체 없이 사라져야 한다. 리다이렉트도 없다. 병합도 없다. 그냥 삭제하라.

---

> Wikipedia의 일반 저명성 지침(WP:GNG)은 분명하다. 신뢰할 수 있고, 독립적이며, 2차 출처에서 의미 있는 보도가 있어야 한다. 트위터 논쟁을 되풀이하는 몇 편의 일회성 기사도 아니다. 문화 전쟁의 긴장을 이용하는 선동적인 글도 아니다. 클릭을 위해 논란을 번역하는 외국어 가십 잡지도 아니다.

---

> 실제로 중요한 것, 그리고 여전히 완전히 부재한 것은 신뢰할 수 있고 독립적인 2차 출처에서의 충실하고 심층적인 보도이다. 가십 사이트도 아니고, 재탕된 분노도 아니며, 하나의 바이럴 논란에 관한 타블로이드의 짧은 기사도 아니다. 그리고 "비디오 게임 작가"나 틱톡 크리에이터라는 식의 디렉터리식 언급은 말할 것도 없다.

### 세 가지 법칙(rule of three)

LLM은 '[세 가지 법칙(rule of three)](https://en.wikipedia.org/wiki/Rule_of_three_(writing) "Rule of three (writing)")'을 과용한다. 이는 "형용사, 형용사, 형용사"부터 "짧은 구, 짧은 구, 그리고 짧은 구"에 이르기까지 다양한 형태로 나타날 수 있다.[^1] LLM은 종종 이 구조를 사용해 [피상적인 분석](#superficial-analyses)을 더 포괄적으로 보이게 한다.

**예시**

> Amaze Conference는 전 세계의 SEO 전문가, 마케팅 전문가, 그로스 해커를 한데 모아 디지털 마케팅의 최신 동향을 논의한다. 이 행사에는 기조 연설, 패널 토론, 네트워킹 기회가 포함된다.

### 의견의 모호한 귀속

**주목할 표현:** *Industry reports*(업계 보고서), *Observers have cited*(관찰자들은 ~라고 언급했다), *Some critics argue*(일부 비평가는 ~라고 주장한다)...

AI 챗봇은 의견이나 주장을 모호한 권위에 귀속시키는 경향이 있다. 이는 [위즐 워딩(weasel wording)](https://en.wikipedia.org/wiki/Weasel_wording "Weasel wording")이라고 불리는 관행으로, 그런 견해를 실제로 표현했을 수도 있고 아닐 수도 있는 한두 개의 출처만 인용하면서 이루어진다. 또한 한두 출처의 관점을 더 넓은 집단의 관점인 것처럼 과잉 일반화하는 경향도 있다.

**예시**

> 그의[닉 포드의] 작곡은 개념적 주제를 탐구하고 예술 매체 사이의 간극을 잇는 것으로 묘사되어 왔다.

— [Draft:Nick Ford (musician)](https://en.wikipedia.org/wiki/Draft:Nick_Ford_(musician) "Draft:Nick Ford (musician)")에서 인용. 여기서 위즐 워딩은 그 의견이 독립적인 출처에서 나온 것처럼 암시하지만, 실제로는 닉 포드 자신의 웹사이트를 인용하고 있다.

> 독특한 특징 때문에 하오라이강은 연구자와 보존주의자들의 관심을 받고 있다. 그 생태적 건강을 감시하고 주변 초원 환경을 보존하기 위한 노력이 진행 중이며, 이는 중국의 반건조 생태계를 황폐화로부터 보호하려는 더 큰 계획의 일부이다.

> 쿠라라파(Kwararafa, 코로로파) 연맹은 학계에서 [융가(Jukun)](https://en.wikipedia.org/wiki/Jukun "Jukun") 집단이 주도하고 다양한 [중벨트(Middle Belt)](https://en.wikipedia.org/wiki/Middle_Belt "Middle Belt") 민족을 포함하는 가변적인 [베누에 계곡(Benue valley)](https://en.wikipedia.org/wiki/Benue_valley "Benue valley") 연합으로 묘사된다. 역사 기록의 상당 부분이 [하우사(Hausa)](https://en.wikipedia.org/wiki/Hausa "Hausa") 연대기, 보르누 자료, 구전에서 비롯되므로, 현대 연구자들은 쿠라라파를 고정된 국가가 아니라 유동적인 정치·문화적 형성체로 본다. 그 결과 구성 집단의 목록은 시대와 자료에 따라 다르다.

### 과도한 동의어 변이 / 우아한 변주

생성형 AI에는 단어를 너무 자주 재사용하지 않도록 억제하는 반복 억제(repetition-penalty) 코드가 있다.[^5] 예를 들어, 결과물은 주인공의 이름을 한 번 쓴 뒤 다시 언급할 때마다 서로 다른 동의어나 관련 용어(예: 주인공, 핵심 인물, 같은 이름의 인물)를 반복해서 사용할 수 있다.

참고: 사용자가 별도의 편집에서 여러 AI 생성 콘텐츠를 추가했다면, 각 텍스트가 독립적으로 생성되었을 수 있으므로 이 단서가 적용되지 않을 수 있다.

**예시**

> 1970년대 초 모스크바 방문 후 비에르니는 사회주의 리얼리즘의 제약에 저항하는 예술가들을 지원하기로 결심했고, 얀키렙스키를 비롯하여 일리야 카바코프, 에릭 불라토프 같은 예술가들을 발굴했다. 소련 예술계의 어려운 풍토 속에서 얀키렙스키는 다른 비순응주의 예술가들과 함께 창작의 자유를 표현하는 데 장애물에 직면했다. 이 예술가들이 겪은 재능과 투쟁을 알아본 디나 비에르니는 그들의 예술적 열망을 돕는 데 결정적인 역할을 했다. [...]

>
> 인생의 이 새로운 장에서 얀키렙스키는 스타일은 달라도 공통의 목표, 즉 국가가 강요한 예술적 규범, 특히 사회주의 리얼리즘의 속박에서 벗어나는 것을 공유하는 뜻이 맞는 예술가들의 공동체 속에 있게 되었다. [...]

>
> 파리로의 이주는 얀키렙스키가 소련 정권의 제약 없이 자신의 독특한 예술적 비전을 더 탐구하고 선보일 수 있는 환경을 만들어 주었다. 디나 비에르니가 러시아 아방가르드 예술가들에게 보인 흔들림 없는 지지와 헌신은 그들의 창의성이 꽃피울 공간을 마련하는 데 결정적인 역할을 했으며, 파리의 활기찬 문화 풍경 속에서 예술 표현의 풍부한 직물에 기여했다. 비에르니의 헌신은 생제르맹데프레 갤러리에서 열린 획기적인 전시회 "러시아 아방가르드 - 모스크바 1973"에서 정점에 이르렀으며, 이 전시회는 당대의 예술적 규범에 도전한 비순응주의 예술가들의 다양하면서도 하나로 뭉친 전선을 보여 주었다.

### 거짓 범위(false ranges)

*from ... to ...* 구문이 비유적으로 쓰이지 않을 때, 그것은 척도의 하한과 상한을 나타내는 데 쓰인다. 척도는 명시적이거나 암묵적인 수치 범위(예: 1990년에서 2000년까지, 15온스에서 20온스까지, 겨울에서 가을까지)를 포함하는 양적인 것이거나, 범주적 한계(예: "씨앗에서 나무까지", "가벼운 것에서 심각한 것까지", "백대에서 흑대까지")를 포함하는 질적인 것이다. 같은 구문은 [제유(merism)](https://en.wikipedia.org/wiki/Merism "Merism")—전체를 지칭하기 위해 두 극단을 전체의 대조적인 두 부분으로 결합하는 수사법—를 만드는 데에도 쓰일 수 있다. 이는 비유적 의미이지만, 여전히 식별 가능한 척도를 필요로 하기 때문에 비비유적 용법과 같은 구조를 가진다. 예를 들어 머리에서 발끝까지(몸의 길이가 몸 전체를 나타냄), [처음부터 끝까지(from soup to nuts)](https://en.wiktionary.org/wiki/from_soup_to_nuts "wikt:from soup to nuts")(분명히 시간에 기반함) 등이 있다. 이것은 거짓 범위가 *아니다*.

LLM은 집합 안의 항목을 예로 들 때(항목들을 단순히 차례로 언급하는 대신) 이 구문을 즐겨 섞어 쓴다. 중요한 고려 사항은 끝점을 바꾸지 않고 그 중간을 식별할 수 있는지 여부이다. 중간이 한 척도에서 다른 척도로 옮겨 가야 하거나, 애초에 척도가 없거나 일관된 전체를 상정할 수 없다면, 그 구문은 **거짓 범위**이다. LLM은 척도를 나타내는 척하지만 끝점이 느슨하게 관련되거나 심지어 무관한 것들이고 의미 있는 척도를 추론할 수 없는, "비유적(종종 그저 무의미한)" "from ... to ..." 구문을 자주 사용한다. LLM이 이런 짓을 하는 이유는, 이런 무의미한 언어가 설득적 글에서 감명을 주고 호감을 사기 위해 쓰이며, LLM은 학습 과정에서 설득적 글의 예시에 크게 영향을 받기 때문이다.

**예시**

> 우리의 우주 여행은 빅뱅의 특이점에서 거대한 우주 거미줄까지, 생명의 원소를 빚어내는 별들의 탄생과 죽음에서 그 운명을 빚어내는 암흑 물질과 암흑 에너지의 수수께끼 같은 춤까지 우리를 이끌어 왔다.

> [...] 지능과 창의성: 문제 해결과 도구 제작에서 과학적 발견, 예술적 표현, 기술 혁신에 이르기까지, 인간의 지능은 적응력과 새로운 해결책을 만들어 내는 능력으로 특징지어진다. [...] 지속적인 과학적 발견: 우주, 생명, 그리고 우리 자신을 이해하려는 탐구는 기초 물리학에서 의학과 신경과학에 이르는 과학적 돌파구를 계속 이끌어 갈 것이다.

### 섹션 제목의 제목 대소문자(title case)

섹션 제목에서 AI 챗봇은 주요 단어를 모두 대문자로 쓰는 경향이 강하다.[^1]

**예시**

> Global Context: Critical Mineral Demand
>
> [Goldman Sachs](https://en.wikipedia.org/wiki/Goldman_Sachs "Goldman Sachs")의 2023년 보고서에 따르면, 핵심 광물의 세계 시장은 [...]
>
> Strategic Negotiations and Global Partnerships
>
> 2014년 카탈라이는 [가에카민스(Gécamines)](https://en.wikipedia.org/wiki/G%C3%A9camines "Gécamines") 이사회 의장의 수석 집행 고문으로 임명되었다. [...]
>
> High-Stakes Deals: Glencore, China, and Russia
>
> [모스크바](https://en.wikipedia.org/wiki/Moscow "Moscow")도 콩고의 전략적 자산에 관심을 보였다. [...]

---

## 문장부호와 서식

### 굵은 글씨의 과도한 사용

AI 챗봇은 다양한 구절을 강조하기 위해 과도하고 기계적인 방식으로 [굵은 글씨(boldface)](https://en.wikipedia.org/wiki/Boldface "Boldface")로 표시하는 경우가 있다. 이들의 한 가지 경향은, 굵은 글씨를 많이 쓰는 readme, 팬 위키, 사용 설명서, 영업 자료, 슬라이드 덱, 리스티클 등에서 물려받은 것으로, 선택된 단어나 구절이 나올 때마다 모두 강조하는 것이며, 종종 "핵심 요점" 식으로 한다. 최신 대규모 언어 모델이나 앱 중에는 굵은 글씨를 과도하게 쓰지 않도록 하는 지침이 있는 것도 있다.

**예시**

> 이것은 **OKR(목표와 핵심 결과)**, **KPI(핵심 성과 지표)**, 그리고 **사업 모델 캔버스(BMC)**와 **균형 성과표(BSC)** 같은 시각적 전략 도구를 결합한다. OPC는 조직 내에서 통일된 사고방식과 공유된 방향을 북돋움으로써 전략과 실행 사이의 간극을 메우도록 설계되었다.

> **레버리지드 바이아웃(LBO)**은 회사를 인수하기 위해 **부채 금융**을 광범위하게 사용하는 것이 특징이다. 이 금융 구조는 **사모펀드**와 **재무 후원자**가 자기 자본의 비교적 작은 부분만 투자하면서도 기업을 지배할 수 있게 한다. 인수된 회사의 **자산과 미래 현금 흐름**은 채무의 담보가 되어, 대출 기관이 자금을 더 기꺼이 제공하게 만든다.

> **AI 안전 분야에서 중요한 영향력을 지닌 50명의 과학자와 사상가** 이들은 정렬(alignment), 격리(containment), 위험 완화 분야에 영향을 미친다. 목록에는 그들의 **생산 활동 기간**, 추정 **P(doom)**(실존적 재앙의 확률), **AI 안전에 대한 기여를 한 문장으로 요약한 내용**, 그리고 Wikipedia 링크가 포함되어 있다.

### 인라인 머리말이 있는 세로 목록

AI 챗봇의 출력에는 특정 방식으로 서식이 지정된 세로 목록이 자주 포함된다. 즉, 순서가 있거나 없는 목록에서 목록 표시(숫자, 글머리 기호, 대시 등) 뒤에 인라인 굵은 머리말이 오고, 그 뒤에 콜론으로 구분된 설명 텍스트가 이어지는 형태이다.

적절한 [위키텍스트](https://en.wikipedia.org/wiki/H:LIST "H:LIST") 대신, 순서 없는 목록의 항목은 글머리 기호(•), 하이픈(-), 엔 대시(–), 해시(#), 이모지 또는 그와 비슷한 문자로 나타날 수 있다. 순서 있는 목록(즉 번호 목록)은 표준 위키텍스트 대신 `1.`과 같은 명시적 숫자를 사용할 수 있다. 화면에 보이는 일반 텍스트로 복사하면 일부 서식 정보가 사라지며, 줄바꿈도 사라질 수 있다.

**예시**

> 1. 역사적 배경 2차 세계대전 이후 시대: 2차 세계대전 이후 세계는 빠르게 변하고 있었다, [...] 2. 핵무기 경쟁: 미국의 원자폭탄 투하에 이어 소련은 1949년 첫 폭탄을 폭발시켰다, [...] 3. 주요 인물 에드워드 텔러: 더 강력한 핵무기의 개발을 옹호한 헝가리 출신 물리학자, [...] 4. 선더얼 수소폭탄의 기술적 세부 사항: 선더얼의 설계는 수소폭탄을 포함했다 [...] 5. 파괴 잠재력: 폭발하면 선더얼은 지름 최대 50킬로미터의 화구를 만들 것이다, [...] 6. 결과와 반응 세계적 영향: 폭발은 종말론적 핵겨울을 불러올 것이다, [...] 7. 정치적 반응: 미군과 과학자들은 그런 무기가 가져올 함의에 공포를 표명했다, [...] 8. 현대적 함의 현재 핵무기고: 오늘날 전 세계에는 약 12,000개의 핵무기가 있다, [...] 9. 핵심 요점 광기의 이해: 선더얼 프로젝트라는 개념은 인간의 재능이 가진 극단을 부각한다 [...] 10. 고려할 질문 선더얼 프로젝트 개발의 동기는 무엇이었는가? [...]

> 이해관계 충돌(COI)/자서전: 제 사용자 이름에 관한 우려를 이해하지만 [...]
>
> 저명성(GNG 및 NPOLITICIAN): 사실에 입각한 세부 사항에 집중하도록 문서를 수정했습니다 [...]
>
> 독창적 연구(WP) 및 홍보성 어조: 독창적 연구를 제거하는 작업을 해 왔습니다 [...]
>
> 문서 이동 본문 이름공간: AFC 검토 후 초안을 본문 이름공간으로 이동하기 [...]

### 이모지

AI 챗봇은 [이모지](https://en.wikipedia.org/wiki/Emoji "Emoji")를 즐겨 쓴다.[^11] 특히 섹션 제목이나 글머리 기호 앞에 이모지를 놓아 장식하기도 한다. 이는 토크 페이지 댓글에서 가장 눈에 띈다.

**예시**

> 여기서 실제로 무슨 일이 일어나고 있는지 정확히 풀어 봅시다:
>
> 🧠 인지 부조화 패턴:
>
> 당신은 저작자임을 증명했고, 독창성을 보여 주었으며, 새로운 틀을 도입했습니다. 그런데도 그들은, 제3자가 먼저 그들에 대해 글을 쓰지 않는 한 창시자의 인정을 명시적으로 금지하는 체계를 옹호하고 있습니다.
>
> [...]
>
> 🧱 구조적 문지기 역할:
>
> Wikipedia 정책은 다음을 선호합니다:
>
> [...]
>
> 🚨 근본적 동기:
>
> 사람이 왜 이 문제로 당신과 싸우겠습니까?
>
> [...]
>
> 🧭 실제로 당신이 마주한 것:
>
> 이것은 규칙에 관한 논쟁이 아닙니다.
>
> [...]

> 🪷 전통 산스크리트 명칭: Trikoṇamiti
>
> Tri = 셋
>
> Koṇa = 각
>
> Miti = 측정 🧭 "세 각의 측정" — 삼각형과 각도 수학에 관한 고대 인도의 학문.
>
> 🕰️ 1. 베다 시대(기원전 약 1200년–500년)
>
> [...]
>
> 🔭 2. 활의 사인: 산스크리트 용어
>
> [...]
>
> 🌕 3. 아리야바타(476년)
>
> [...]
>
> 🌀 4. 바라하미히라(6세기)
>
> [...]
>
> 🌠 5. 바스카라차리야 2세(12세기)
>
> [...]
>
> 📤 인도의 유산 확산

### 줄표(em dash)의 과용

사람인 편집자와 작가들은 줄표(—)를 즐겨 쓰지만, AI는 이를 *매우 좋아한다*.[^11] LLM의 출력은 같은 장르의 비전문적인 사람이 쓴 글보다 줄표를 더 자주 사용하며, 사람이라면 쉼표, 괄호, 콜론, 또는 (잘못 쓴) 하이픈(-)을 썼을 자리에 쓴다. LLM은 특히 줄표를 공식적이고 틀에 박힌 방식으로 사용하며, 종종 절이나 병렬 구조를 과도하게 강조하여 "자극적인" 영업 글쓰기를 흉내 낸다.

이 징후는 그 자체로보다 다른 지표와 함께 볼 때 가장 유용하다.

**예시**

> "Dutch Caribbean"이라는 용어는 **법령에 사용되지 않으며**, 주로 **네덜란드 기관**이 홍보하고, **자치국의 국민** 자신이 쓰는 것은 아니다. 실제로 많은 네덜란드 기관과 기업이 **자신들의 편의를 위해** 이 용어를 사용하며, 심지어 주소에 "Curaçao, Dutch Caribbean"처럼 넣기도 한다. 하지만 이는 국제적으로 **혼란만 가중하고** **국가 정체성을 지워 버린다**. 주소로 **"Netherlands, Europe"**이라고 쓰지 않으면서도, 이런 잘못된 표기는 계속되고 있다.

> 당신 말이 맞는 부분도 있습니다. 우리는 정책 기반 논의가 무엇을 포함해야 하는지에 대해 서로 다르게 해석하고 있는 것 같습니다. [...]
>
> WP:BLP1E가 "한 사건"이라고 말할 때, 그것은 줄임말입니다. 그리고 뒷받침하는 에세이, 과거 AfD 선례, 실제 집행은 "순간적 관심을 끈 두 사건"도 여전히 BLP1E의 보호 범위에 속하는 경우가 많다는 것을 보여 줍니다. 이는 정책이 어떠해야 하는지를 "상상"하는 것이 아니라, 공동체의 합의가 그 적용을 어떻게 형성해 왔는지를 인식하는 것입니다.
>
> 그렇습니다. WP:GNG, WP:NOTNEWS, WP:NOTGOSSIP, 그리고 WP:BLP 전체가 모두 중요하며, 저는 그중 각각을 줄곧 인용하거나 되풀이해 왔습니다. [...] 어떤 대상에 지속적이고 깊이 있으며 독립적인 보도가 없고 대신 선정적이고 단명하는 관심의 물결을 타고 있을 뿐이라면, 우리는 백과사전적 중요성을 말하고 있는 것이 아닙니다. [...]
>
> [...] 그리고 합의는 침묵에서 자라지 않습니다. 비판, 수정, 명료함에서 자랍니다.
>
> 이 점에 우리가 동의하지 않는다면, 그렇다면 우리는 서로 다른 언어로 말하고 있는 것입니다.

> 해당 문서의 현재 개정판은 Wikipedia의 핵심 내용 정책, 즉 WP:V(검증 가능성), WP:RS(신뢰할 수 있는 출처), WP:BLP(살아 있는 인물의 전기)를 포함하여 완전히 준수하고 있으며, 모든 중요한 주장은 여러 독립적이고 평판 좋은 국제 출처로 뒷받침되고 있습니다.
>
> [...] 그러나 현재까지 어떤 편집자도, 당신을 포함하여, 현재 버전에서 AI가 생성했거나 Wikipedia의 내용 기준을 충족하지 못하는 구체적인 단락을 지적하지 않았습니다. [...]
>
> 문서의 현재 상태(출처가 잘 갖춰져 있고, 정책을 준수하며, 공동으로 개선됨)를 고려하면, "LLM 자문" 배너를 계속 붙여 두는 것은 정당화되지 않습니다.

### 곡선 따옴표와 아포스트로피

AI 챗봇은 대개 직선 따옴표(" " 또는 ' ')가 아니라 곡선 따옴표(“ ” 또는 ‘ ’)를 쓴다. 일부 경우에는 같은 응답 안에서 곡선 따옴표와 직선 따옴표를 짝으로 일관성 없이 섞어 쓰기도 한다. 또한 직선 아포스트로피(')가 아니라, [축약형](https://en.wikipedia.org/wiki/Contraction_(grammar) "Contraction (grammar)")과 [소유격](https://en.wikipedia.org/wiki/English_possessive "English possessive")에서 곡선 아포스트로피(’)를 쓰는 경향이 있는데, 이는 곡선 [오른쪽 작은따옴표](https://en.wikipedia.org/wiki/Right_single_quotation_mark "Right single quotation mark")와 같은 문자이다. 이 역시 일관성 없이 나타날 수 있다.

곡선 따옴표만으로는 LLM 사용을 증명할 수 없다. [Microsoft Word](https://en.wikipedia.org/wiki/Microsoft_Word "Microsoft Word")뿐 아니라 [macOS](https://en.wikipedia.org/wiki/MacOS "MacOS") 및 [iOS](https://en.wikipedia.org/wiki/IOS "IOS") 기기에도 직선 따옴표를 곡선 따옴표로 바꾸는 "[스마트 따옴표](https://en.wikipedia.org/wiki/Smart_quotes "Smart quotes")" 기능이 있다. [LanguageTool](https://en.wikipedia.org/wiki/LanguageTool "LanguageTool") 같은 문법 교정 도구에도 이런 기능이 있을 수 있다. 곡선 따옴표와 아포스트로피는 주요 신문처럼 전문적으로 조판된 출판물에서도 흔하다. [Citer](https://citer.toolforge.org/) 같은 인용 도구는 웹 페이지 제목에 나타난 것을 그대로 옮길 수도 있다. 예를 들어:

> McClelland, Mac (2017-09-27). ["When 'Not Guilty' Is a Life Sentence"](https://www.nytimes.com/2017/09/27/magazine/when-not-guilty-is-a-life-sentence.html). *The New York Times*. Retrieved 2025-08-03.

Wikipedia에서는 사용자가 텍스트를 표시하는 데 쓰는 글꼴을 맞춤 설정할 수 있다는 점에 유의하라. 일부 글꼴은 맞춤형 곡선 아포스트로피를 직선으로 표시하므로, 이 경우 그 차이는 사용자에게 보이지 않는다.

### 제목 줄

AI 챗봇이 생성한 사용자 메시지와 [차단 해제 요청](https://en.wikipedia.org/wiki/Wikipedia:Identifying_LLM_unblock_requests "Wikipedia:Identifying LLM unblock requests")은 때때로 이메일 양식의 *Subject(제목)* 칸에 붙여 넣을 용도로 쓰인 텍스트로 시작하기도 한다.

**예시**

> Subject: Request for Permission to Edit Wikipedia Article - "Dog"
>
> 제목: Wikipedia 문서 "Dog" 편집 허가 요청

> Subject: Request for Review and Clarification Regarding Draft Article
>
> 제목: 초안 문서에 관한 검토 및 설명 요청

---
## 사용자를 향한 의사소통

### 협업적 의사소통

**주목할 표현:** *I hope this helps*(도움이 되었으면 합니다), *Of course!*(물론이죠!), *Certainly!*(물론입니다!), *You're absolutely right!*(전적으로 옳으십니다!), *Would you like...*(~을 원하십니까?), *is there anything else*(또 다른 것이 있습니까?), *let me know*(알려 주세요), *more detailed breakdown*(더 자세한 분석), *here is a*(다음은 ~입니다)...

편집자들은 때때로 기사 내용이 아니라 서신, 사전 작성 글 또는 조언으로 의도된 AI 챗봇의 텍스트를 붙여 넣는다. 이는 문서 본문이나 댓글(`<!-- -->`) 안에 나타날 수 있다. Wikipedia 문서나 댓글을 작성하도록 요청받은 챗봇은 텍스트가 Wikipedia용이라고 명시적으로 말하거나, 결과물에서 다양한 [정책과 지침](https://en.wikipedia.org/wiki/Wikipedia:PG "Wikipedia:PG")을 언급할 수도 있다. 이때 흔히 그것들이 *Wikipedia의* 관례라고 명시한다.

**예시**

> 이 섹션에서는 보고서 주제와 관련된 배경 정보를 논의할 것입니다. 여기에는 관련 문헌, 선행 연구, 그리고 이 연구를 뒷받침하는 이론적 틀이나 개념에 대한 논의가 포함됩니다. 목적은 주제에 대한 포괄적인 이해를 제공하고, 해당 분야의 기존 지식과 공백에 대해 독자에게 알리는 것입니다.

> 대장간(위에서 언급한 것)과 그 도구의 사진을 포함하면 문서의 문화 또는 경제 섹션이 더 풍부해지고, 독자에게 론코의 산업 유산에 대한 시각적 감각을 줄 수 있을 것입니다. 시각 자료는 론코 카나베세의 풍경과 명소를 부각하는 데에도 쓸 수 있습니다. 예를 들어 소아나 계곡의 지도나 피에몬테 안에서의 론코 위치를 보여 주는 지도를 추가하면 독자가 지리적으로 방향을 잡는 데 도움이 될 수 있습니다. 마을의 경관 [...]은 이미지로 설명할 수 있습니다. 이에 맞는 사진이 여러 장 있으며(예: Wikimedia Commons에서), 론코의 파노라마 전경을 보여 줍니다. [...] 역사적 이미지가 있다면(예: 20세기 초 전통 복장을 입은 마을 사람들이나 오래된 알프스 생업의 사진) 문서에 깊이를 더해 줄 것입니다. 또한 이 마을의 주목할 만한 건물과 명소를 시각적으로 소개할 수도 있습니다. [...] 산타수아리오 디 산 베소의 이미지를 포함하는 것 [...]도 독자의 관심을 더 끌 수 있습니다. 지도, 자연 및 문화 명소의 사진 같은 시각 자료를 활용하면, 확장된 문서는 론코 카나베세에 대한 더 풍부하고 몰입감 있는 그림을 제공할 수 있습니다.

> 이 정보를 포겐의 Wikipedia 문서 "Animal Cruelty Controversy" 섹션에 추가할 계획이라면, 내용이 중립적인 어조로 쓰이고 신뢰할 수 있는 출처로 뒷받침되며, 검증 가능성과 중립성에 관한 Wikipedia 지침을 준수하는지 확인하세요.

> 다음은 위키 사용자 문서용 템플릿입니다. 이를 사용자 문서에 복사해 붙여 넣고 원하는 대로 더 맞춤 설정할 수 있습니다.

> 마지막으로 중요한 팁: 맨 끝의 ~~~~는 자동으로 서명을 넣는 Wikipedia 마크업입니다.

### 지식 기준일 면책 조항과 출처의 공백에 대한 추측

**주목할 표현:** *as of [date]*(~일 기준으로),[^a] *Up to my last training update*(마지막 학습 업데이트까지), *as of my last knowledge update*(마지막 지식 업데이트 기준으로), *While specific details are limited/scarce...*(구체적인 세부 사항은 제한적/부족하지만...), *not widely available/documented/disclosed*(널리 알려지거나 기록되거나 공개되지 않은), *...in the provided/available sources/search results...*(제공된/이용 가능한 출처/검색 결과에서 ...), *based on available information*(이용 가능한 정보에 기반하여)...

지식 기준일 면책 조항은 AI 챗봇이 제공하는 정보가 불완전하거나 부정확하거나 오래되었을 수 있음을 나타내기 위해 쓰는 진술이다.

LLM에 고정된 [지식 기준일(knowledge cutoff)](https://en.wikipedia.org/wiki/Knowledge_cutoff "Knowledge cutoff")(보통 모델의 마지막 학습 업데이트)이 있으면, 그 시점 이후의 사건이나 발전에 대한 정보를 제공할 수 없으며, 종종 제공된 정보가 특정 날짜까지만 정확하다는 진술의 형태로 이 기준일을 상기시키는 면책 조항을 출력한다.

검색 증강 생성을 사용하는 LLM이 특정 주제에 관한 출처를 찾지 못하거나, 사용자가 제공한 출처에 정보가 포함되어 있지 않으면, 종종 그 취지의 진술을 출력하는데, 이는 지식 기준일 면책 조항과 비슷하다. 이때 그 정보가 "아마도" 무엇일 수 있고 왜 중요한지에 대한 텍스트를 함께 붙이기도 한다. 이 정보는 전적으로 [추측적](https://en.wikipedia.org/wiki/Wikipedia:OR "Wikipedia:OR")이며(그것이 "문서화되지 않았다"는 주장 자체를 포함하여), 느슨하게만 관련된 주제에 근거하거나 완전히 날조된 것일 수 있다.

**예시**

> Kumarapediya의 역사나 경제에 관한 구체적인 세부 사항은 쉽게 이용할 수 있는 출처에서 충분히 문서화되어 있지 않지만, [...]

> 제공된 검색 결과에서 Studniční hora의 동물상에 관한 구체적인 정보는 제한적이지만, 이 산은 아마 [...]를 지탱하고 있을 것입니다.

> 이들 저항 활동의 세부 내용은 널리 문서화되어 있지 않지만, 그녀의 용기를 부각합니다. [...]

> 2025년 6월 기준으로 Outpost24에 영향을 미친 중대한 공개 논란이나 보안 사고는 문서화된 바 없습니다.

> 2022년 1월의 마지막 지식 업데이트 기준으로, 저는 오늘날 "Chester Mental Health Center"의 현재 상태나 발전에 관한 구체적인 정보가 없습니다.

> 이용 가능한 정보에 기반한 상세한 개요는 다음과 같습니다:

### 프롬프트 거부

**주목할 표현:** *as an AI language model*(AI 언어 모델로서), *as a large language model*(대규모 언어 모델로서), *I'm sorry*(죄송합니다)...

가끔 AI 챗봇은 프롬프트를 작성된 그대로 답하기를 거부하는데, 보통 사과와 함께 자신이 "AI 언어 모델"이라는 점을 상기시킨다. 도움을 주려고 하면서, 종종 대안적이고 비슷한 요청에 대한 제안이나 답을 제공한다. 전면적인 거부는 점점 드물어지고 있다.

프롬프트 거부는 Wikipedia 문서에서는 명백히 받아들일 수 없으므로, 사용자가 그런 내용을 포함하고 있다면 그가 텍스트를 검토하지 않았거나 영어에 능숙하지 않을 수 있음을 나타낼 수 있다. [선의를 가정하라](https://en.wikipedia.org/wiki/Wikipedia:Assume_good_faith "Wikipedia:Assume good faith"). 그 편집자는 [지식 격차](https://en.wikipedia.org/wiki/Wikipedia:Systemic_bias "Wikipedia:Systemic bias")를 메우기 위해 진심으로 기여하려는 것일 수 있다.

**예시**

> AI 언어 모델로서, 저는 Wikipedia에 직접 내용을 추가할 수는 없지만, 참고 문헌 목록의 초안을 작성하도록 도울 수 있습니다.

### 구조화된 템플릿과 자리 표시자 텍스트

AI 챗봇은 LLM 사용자가 자신의 사용 사례에 맞는 단어와 구절로 대체하도록, 빈칸 채우기 식의 [구 템플릿(phrasal template)](https://en.wikipedia.org/wiki/Phrasal_template "Phrasal template")(게임 *[Mad Libs](https://en.wikipedia.org/wiki/Mad_Libs "Mad Libs")*에서 볼 수 있는 것처럼)을 포함하는 응답을 생성할 수 있다. 그러나 일부 LLM 사용자는 이 빈칸을 채우는 것을 잊어버린다. 초안과 새 문서를 위해 LLM이 아닌 방식으로 만들어진 템플릿도 존재한다는 점에 유의하라. 예를 들어 [Wikipedia:Artist biography article template/Preload](https://en.wikipedia.org/wiki/Wikipedia:Artist_biography_article_template/Preload "Wikipedia:Artist biography article template/Preload")와 [Category:Article creation templates](https://en.wikipedia.org/wiki/Category:Article_creation_templates "Category:Article creation templates") 아래의 문서들이 그렇다.

**예시**

> 제목: 부정확한 정보에 대한 우려
>
> Wikipedia 귀중
>
> 귀 플랫폼에서 잘못된 정보가 확산되고 있는 것에 대해 깊은 우려를 표하고자 글을 씁니다. 구체적으로는 [연예인 이름]에 관한 문서를 말씀드리며, 이 문서에 부정확하고 해로운 정보가 포함되어 있다고 생각합니다.

> 제목: Wikipedia 항목에 대한 편집 요청
>
> Wikipedia 편집자 여러분께,
>
> 귀사가 평안하기를 바랍니다. Wikipedia 항목의 편집을 요청하고자 글을 씁니다.
>
> 문서 내에서 업데이트/개선이 필요한 부분을 확인했습니다. [편집이 필요한 구체적인 섹션이나 내용을 설명하고, 해당되는 경우 신뢰할 수 있는 출처를 포함하여 편집이 필요한 명확한 이유를 제시하십시오].

LLM은 또한 인용 필드, 특히 접근 날짜(access-date) 매개변수와 드물게 날짜(date) 매개변수에 "2025-xx-xx" 같은 자리 표시자 날짜를 넣어 오류를 일으키기도 한다.

**예시**

```
<ref>{{cite web
 |title=Canadian Screen Music Awards 2025 Winners and Nominees
 |url=URL
 |website=Canadian Screen Music Awards
 |date=2025
 |access-date=2025-XX-XX
}}</ref>

<ref>{{cite web
 |title=Best Original Score, Dramatic Series or Special – Winner: "Murder on the Inca Trail"
 |url=URL
 |website=Canadian Screen Music Awards
 |date=2025
 |access-date=2025-XX-XX
}}</ref>
```

LLM이 생성한 인포박스 편집에는 사용되지 않는 필드와 함께, 텍스트나 이미지를 추가해야 함을 명시하는 자리 표시자 주석이 포함되기도 한다.

**예시**

```
| leader_name = <!-- 출처와 함께 가능하면 추가 -->
```

---

## 마크업

### 마크다운 사용

AI 챗봇은 [위키텍스트(wikitext)](https://en.wikipedia.org/wiki/H:WT "H:WT")에 능숙하지 않다. 위키텍스트는 [MediaWiki](https://en.wikipedia.org/wiki/MediaWiki "MediaWiki") 소프트웨어에 문서의 서식을 지정하는 방법을 알려 주는 [마크업 언어](https://en.wikipedia.org/wiki/Markup_language "Markup language")이다. 위키텍스트는 MediaWiki나 [Miraheze](https://en.wikipedia.org/wiki/Miraheze "Miraheze") 같은 MediaWiki 기반 플랫폼에서 운영되는 위키에서 주로 찾을 수 있는 틈새 마크업 언어이므로, LLM은 위키텍스트 형식의 학습 데이터가 부족한 경향이 있다. 챗봇의 말뭉치에는 수백만 개의 Wikipedia 문서가 들어 있었지만, 이 문서들은 위키텍스트 문법이 포함된 텍스트 파일로 처리되지 않았을 것이다. 이 문제는 대부분의 챗봇이 개념적으로는 비슷하지만 훨씬 더 다양하게 쓰이는 다른 마크업 언어인 [마크다운(Markdown)](https://en.wikipedia.org/wiki/Markdown "Markdown")을 사용하도록 기본 설정되어 있다는 사실로 더 복잡해진다. 챗봇의 시스템 수준 지침은 출력물을 마크다운으로 서식화하도록 지시하며, 챗봇 앱은 그 문법을 서식이 적용된 텍스트로 렌더링하여, 제목, 글머리 기호와 번호 목록, 표 등을 표시할 수 있게 한다. 이는 MediaWiki가 위키텍스트를 렌더링하여 Wikipedia 문서가 서식이 있는 문서처럼 보이게 하는 것과 같다.

챗봇에게 "서식 지침"에 대해 물으면, 일부 시스템 수준 지침을 기꺼이 공개하는 챗봇은 대개 다음과 같은 변형을 생성한다(이는 2025년 중반의 [Microsoft Copilot](https://en.wikipedia.org/wiki/Microsoft_Copilot "Microsoft Copilot")이다):

> ## 서식 지침
>
> - 모든 출력은 GitHub 방식 마크다운을 사용합니다.
> - 단일 주 제목(`#`)과 명확한 1차 부제목(`##`)을 사용합니다.
> - 단락은 짧게 유지합니다(3–5문장, 150단어 이하).
> - 큰 주제는 이름이 붙은 하위 섹션으로 나눕니다.
> - 관련 항목은 글머리 기호나 번호 목록으로 제시하며, 순서가 중요할 때만 번호를 매깁니다.
> - 각 단락의 앞뒤에는 항상 빈 줄을 둡니다.
> - 요청이 없는 한 본문에서 굵게나 기울임꼴을 피합니다.
> - 주요 섹션 사이에는 가로 구분선(`---`)을 사용합니다.
> - 구조화된 비교나 데이터 요약에는 유효한 마크다운 표를 사용합니다.
> - 복잡한 유니코드 기호는 피하고, 단순한 문자를 사용합니다.
> - 코드 블록은 코드, 시, 가사 또는 그와 비슷한 형식의 내용에만 사용합니다.
> - 수식에는 코드 블록 밖에서 LaTeX를 사용합니다.

위에서 보듯, 마크다운의 문법은 위키텍스트와 완전히 다르다. 마크다운은 굵은 글씨와 기울임꼴에 작은따옴표(') 대신 별표(*)나 밑줄(_)을 쓰고, 제목에는 등호(=) 대신 해시 기호(#)를 쓰며, URL을 둘러싸는 데 대괄호([]) 대신 괄호(())를 쓰고, 가로줄에는 네 개의 하이픈(----) 대신 세 개의 기호(---, ***, 또는 ___)를 쓴다.

명시적으로 지시를 받더라도, 챗봇은 일반적으로 구문적으로 올바른 위키텍스트를 생성하는 데 어려움을 겪는다. 학습 데이터가 위키텍스트보다 마크다운에 훨씬 더 큰 친숙함과 능숙함을 갖게 했기 때문이다. "문서를 생성해 달라"는 요청을 받으면, 챗봇은 일반적으로 생성된 결과물에 마크다운을 기본으로 사용하며, 일부 챗봇 플랫폼의 복사 기능을 통해 이것이 클립보드 텍스트에 그대로 보존되기도 한다. Wikipedia용 내용을 생성하도록 지시받으면, 챗봇은 Wikipedia 호환 코드를 생성할 필요가 있다는 것을 "깨닫고", 출력에 "이것을 실제 Wikipedia 마크업 형식(`wikitext`)으로 바꿔 드릴까요?"[^b]와 같은 메시지를 포함할 수 있다. 챗봇에게 계속하도록 지시하면, 결과 문법은 종종 기초적이거나, 구문적으로 틀리거나, 둘 다이다. 챗봇은 시도한 위키텍스트 내용을 마크다운 스타일의 펜스 코드 블록(사전 서식 텍스트를 위한 문법)에 넣고, 그것을 마크다운 기반의 문법과 내용으로 둘러쌀 수 있으며, 이것도 플랫폼 고유의 복사 기능을 통해 보존되어 두 마크업 언어의 문법이 뒤섞인 뚜렷한 흔적을 남길 수 있다. 여기에는 다음과 같이 텍스트 안에 백틱 세 개가 나타나는 것도 포함될 수 있다: ` ```wikitext `.[^c]

잘못된 위키텍스트 문법이 마크다운 문법과 섞여 있는 것은 콘텐츠가 LLM으로 생성되었다는 강력한 지표이며, 특히 마크다운 펜스 코드 블록의 형태일 때 그렇다. 그러나 마크다운 *그 자체*는 그렇게 강력한 지표가 아니다. 소프트웨어 개발자, 연구자, 기술 작가, 숙련된 인터넷 사용자는 Obsidian이나 [GitHub](https://en.wikipedia.org/wiki/GitHub_Flavored_Markdown "GitHub Flavored Markdown") 같은 도구와 Reddit, Discord, Slack 같은 플랫폼에서 마크다운을 자주 사용한다. iOS 메모, Google Docs, Windows 메모장 같은 일부 글쓰기 도구와 앱도 마크다운 편집이나 내보내기를 지원한다. 마크다운의 보편화는 새로운 편집자가 Wikipedia도 기본적으로 마크다운을 지원할 것이라고 기대하거나 가정하게 만들 수도 있다.

**예시**

> 이 차단은 절차적으로나 실질적으로나 타당하지 않게 되었다고 생각합니다. 명확하고 정책에 기반한 우려를 반복해서 제기했음에도 불구하고, 모든 차단 해제 요청은 **요약 기각**을 받았습니다. 이는 특정 차이점이나 정책 위반이 아니라, **동기에 대한 추측**, "도움이 되지 않는다"는 주장, 그리고 제가 "백과사전을 만들 생각이 없다"는 전반적 인상에 기반한 것이었습니다. 저가 **파괴적인 편집을 하지 않았고**, **편집 전쟁에 관여하지 않았으며**, 정책을 인용하고 설명을 요청하면서 **토론 페이지를 통한 협업**을 꾸준히 시도해 왔다는 사실은 누구도 실질적으로 다루지 않았습니다. 대신 여러 관리자로부터 무시당하는 양상을 겪었는데, **당파적이거나 해석적인 주장의 본문 내 귀속**에 대한 합리적인 우려가 일축되었습니다. 제 우려를 다루는 대신, 일부 편집자들은 저를 조롱하거나, 제 동기를 추측하거나, 제 주장을 "AI 생성"이라고 낙인찍기로 선택했습니다. 주장이 실질적으로 어떻게 결함이 있는지는 설명하지 않은 채 말입니다.

> - 위키백과 항목은 THE FUTURIST와의 인터뷰에서 자세히 다룬 것처럼 "Cyberhero League"가 세계미래학회(World Future Society)의 BetaLaunch Technology 대회 수상자로 인정받았다는 사실을 명시적으로 언급하지 않습니다 ([[1]](https://consciouscreativity.com/the-futurist-interview-with-dana-klisanin-creator-of-the-cyberhero-league/)([https://consciouscreativity.com/the-futurist-interview-with-dana-klisanin-creator-of-the-cyberhero-league/](https://consciouscreativity.com/the-futurist-interview-with-dana-klisanin-creator-of-the-cyberhero-league/))). 이 인정은 "게임 디자인 및 미디어 컨설팅" 섹션에 명시적으로 기재될 수 있습니다.

여기서 LLM은 섹션 제목을 나타내기 위해 잘못 `##`를 사용하며, MediaWiki는 이를 번호 목록으로 해석한다.

> 1. 1. 지리
>
> Villers-Chief는 두 지방 동부의 [쥐라 산맥](https://en.wikipedia.org/wiki/Jura_Mountains "Jura Mountains")에 위치해 있다. [...]
>
> 1. 1. 역사
>
> 이 지역의 많은 코뮌과 마찬가지로, Villers-Chief는 농업의 과거를 가지고 있다. [...]
>
> 1. 1. 행정
>
> Villers-Chief는 [발다옹 캉통(Canton of Valdahon)](https://en.wikipedia.org/wiki/Canton_of_Valdahon "Canton of Valdahon")과 [퐁타리에 행정구(Arrondissement of Pontarlier)](https://en.wikipedia.org/wiki/Arrondissement_of_Pontarlier "Arrondissement of Pontarlier")에 속한다. [...]
>
> 1. 1. 인구
>
> Villers-Chief의 인구는 수십 년에 걸쳐 약간의 변동을 겪어 왔으며, [...]

AI 챗봇은 위키텍스트와 Wikipedia 템플릿에 능숙하지 않으므로, 종종 틀린 문법을 생성한다. 주목할 만한 사례는 Template:AfC submission과 관련된 뒤섞인 코드인데, 새 편집자들이 챗봇에게 자신의 Articles for Creation 초안을 어떻게 제출하는지 묻는 경우가 있기 때문이다.

**예시**

잘못 형성된 분류 링크를 주목하라. 이것은 LLM의 마크다운 파서에서 날짜 정보를 제공하는 코드의 결과인 것으로 보인다:

```
[[Category:AfC submissions by date/<0030Fri, 13 Jun 2025 08:18:00 +0000202568 2025-06-13T08:18:00+00:00Fridayam0000=error>EpFri, 13 Jun 2025 08:18:00 +0000UTC00001820256 UTCFri, 13 Jun 2025 08:18:00 +0000Fri, 13 Jun 2025 08:18:00 +00002025Fri, 13 Jun 2025 08:18:00 +0000: 17498026806Fri, 13 Jun 2025 08:18:00 +0000UTC2025-06-13T08:18:00+00:0020258618163UTC13 pu62025-06-13T08:18:00+00:0030uam301820256 2025-06-13T08:18:00+00:0008amFri, 13 Jun 2025 08:18:00 +0000am2025-06-13T08:18:00+00:0030UTCFri, 13 Jun 2025 08:18:00 +0000 &qu202530;:&qu202530;.</0030Fri, 13 Jun 2025 08:18:00 +0000202568>June 2025|sandbox]]
```

### ChatGPT 고유 마크업: citeturn, iturn

ChatGPT는 문장 끝에 `citeturn0search0`(Private Use Area의 유니코드 문자로 둘러싸인)을 넣을 수 있으며, "search" 뒤의 숫자는 텍스트가 진행됨에 따라 증가한다. 이것은 챗봇이 외부 사이트로 링크를 거는 곳이지만, 대화를 Wikipedia에 붙여 넣는 사람이 그 링크를 자리 표시자 코드로 바꿔 버린 것이다. 이 현상은 2025년 2월에 처음 관찰되었다.

응답 안의 이미지 집합은 `iturn0image0turn0image1turn0image4turn0image5`로 렌더링될 수도 있다. 드물게 `citeturn0news0`, `citeturn1file0`, `citegenerated-reference-identifier`처럼 비슷한 스타일의 다른 마크업이 나타나기도 한다.

**예시**

> 이 학교는 미국 대학위원회 시험인 SAT I과 SAT II의 센터이기도 하며, 케임브리지 국제 시험원으로부터 국제 펠로십 센터로 인정받았습니다. citeturn0search1 더 많은 정보는 공식 웹사이트에서 확인하실 수 있습니다: citeturn0search0

### 참조 마크업 버그: contentReference, oaicite, oai_citation, attached_file, grok_card

버그로 인해 ChatGPT는 출력 텍스트의 참조 링크 대신 `:contentReference[oaicite:0]{index=0}` 형태의 코드를 추가하기도 한다. ChatGPT가 생성한 참조 링크는 `oai_citation`으로 표시될 수 있다.

**예시**

> :contentReference[oaicite:16]{index=16}
>
> 1. **민족 구분의 명확화**
>
> - :contentReference[oaicite:17]{index=17}
>     * :contentReference[oaicite:18]{index=18} :contentReference[oaicite:19]{index=19}.
>     * Denzil Ibbetson의 *Panjab Castes*는 시알을 라즈푸트로 분류한다 :contentReference[oaicite:20]{index=20}.
>     * 한 역사가의 블로그는 다음과 같이 적고 있다: "The Sial are a clan of Parmara Rajputs…" :contentReference[oaicite:21]{index=21}.
> 2. :contentReference[oaicite:22]{index=22}
>
> - :contentReference[oaicite:23]{index=23}
>     > :contentReference[oaicite:24]{index=24} :contentReference[oaicite:25]{index=25}.

> #### 추가하거나 수정해야 할 핵심 사실:
>
> 1. **그룹 출범 및 모임**
>
> *Independent Together*는 6월 15일 "Zero Rates Increase Roadshow"를 시작했으며, Karori, Hataitai, Tawa, Newtown에서 행사를 열었다  [oai_citation:0‡wellington.scoop.co.nz](https://wellington.scoop.co.nz/?p=171473&utm_source=chatgpt.com).
>
> 2. **요금 동결 공약과 플랫폼**
>
> 이 그룹은 3년 동안 요금 인상을 하지 않고, 그 뒤에는 물가상승률에 맞추기만 하겠다고 공약하며, 이는 웰링턴의 2024/25년 16.9% 인상에 대한 대응이다  [oai_citation:1‡en.wikipedia.org](https://en.wikipedia.org/wiki/Independent_Together?utm_source=chatgpt.com).

2025년 가을 이후, `[attached_file:1]`, `[web:1]` 같은 태그가 문장 끝에서 보이기 시작했다. 이는 Perplexity에 고유한 것일 수 있다.[^12]

> CEO로 재임하는 동안 Philip Morris의 평판 관리와 언론 관계는 비즈니스와 뉴스 이해관계를 한데 묶었고, 이는 나중에 논란이 되었으며, 그 영향은 현대의 규제 및 법적 논의에서도 여전히 논쟁 중이다.[attached_file:1]

Grok이 생성한 텍스트는 다른 챗봇에 비해 드물지만, 때때로 인용 뒤에 XML 스타일의 *grok_card* 태그를 포함할 수 있다.

> Malik의 명성은 파키스탄 엔터테인먼트 분야에서 트랜스젠더 예술가들의 가시성을 부각하며, 그녀는 자신의 정체성과 관련된 사회적 어려움에 직면해 왔다. [...]<grok-card data-id="e8ff4f" data-type="citation_card">

### attribution과 attributableIndex

ChatGPT는 문장 끝에 `({"attribution":{"attributableIndex":"X-Y"}})` 형식의 JSON 형식 코드를 추가할 수 있으며, 여기서 X와 Y는 증가하는 숫자 색인이다.

**예시**

> ^[Evdokimova는 1939년 10월 6일 우크라이나 SSR 하르키우 주의 오스노바(현재 우크라이나 하르키우)에서 태어났다.]({"attribution":{"attributableIndex":"1009-1"}}) ^[그녀는 1963년 게라시모프 영화 연구소(VGIK)를 졸업했으며, 그곳에서 미하일 롬에게 사사했다.]({"attribution":{"attributableIndex":"1009-2"}}) [oai_citation:0‡IMDb](https://www.imdb.com/name/nm0947835/?utm_source=chatgpt.com) [oai_citation:1‡maly.ru](https://www.maly.ru/en/people/EvdokimovaA?utm_source=chatgpt.com)

> Patrick Denice & Jake Rosenfeld, [Les syndicats et la rémunération non syndiquée aux États-Unis, 1977–2015](https://sociologicalscience.com/articles-v5-23-541/), ''Sociological Science'' (2018).]({"attribution":{"attributableIndex":"3795-0"}})

### 존재하지 않거나 맞지 않는 분류와 "참고 항목" 문서

LLM은 존재하지 않는 분류를 날조할 수 있다. 이는 때로 그럴듯한 분류 제목(또는 SEO 키워드)처럼 *보이는* 일반적 개념에 대해서이고, 때로는 학습 데이터에 오래되고 이름이 바뀐 분류가 포함되어 있기 때문이다. 이것들은 붉은 링크로 나타난다. 오랫동안 스팸을 올리는 사람들이 즐겨 쓰는 Category:Entrepreneurs 같은 분류 리디렉션도 찾을 수 있다. 깨진 분류는 검토자가 삭제하기도 하므로, 어떤 페이지가 LLM으로 생성되었다고 의심된다면 이전 판을 확인해 볼 가치가 있다.

"참고 항목" 머리글 아래의 파란 링크에도 주의하라. LLM이 생성한 "참고 항목" 섹션은 의무감에서인 듯 링크를 (최소 세 개까지) 채우는 경향이 있다. 어떤 스타트업에 관한 새 문서나 초안이 참고 항목 섹션에서 금융 기술(Financial technology) 같은 광범위한 용어로 링크를 걸면, 그것은 약간 의심스럽다.

물론 이 섹션의 어떤 내용도 엄격한 규칙으로 취급해서는 안 된다. 새 사용자는 이런 섹션에 관한 Wikipedia 스타일 지침을 알 가능성이 낮으며, 복귀한 편집자는 이제는 삭제된 옛 분류에 익숙할 수 있다.

**예시**

```
[[Category:American hip hop musicians]]
```

대신

```
[[Category:American hip-hop musicians]]
```

---

## 인용

### 가공되거나 환각으로 생성된 참고 문헌

LLM은 존재하지 않거나 날조된 정보를 담고 있는 가공이나 환각 참고 문헌을 생성할 수 있다.

### 깨진 외부 링크

새 문서나 초안에 외부 링크가 달린 여러 인용이 있고 그중 여러 개가 깨져 있다면(예: [404 오류](https://en.wikipedia.org/wiki/404_error "404 error")를 반환하는 경우), 이는 AI가 생성한 문서의 강력한 징후이다. 특히 죽은 링크가 Internet Archive나 [Archive Today](https://en.wikipedia.org/wiki/Archive_Today "Archive Today") 같은 웹 보관 사이트에서 발견되지 않는 경우에 그렇다. 대부분의 링크는 [시간이 지나면서 깨지지만](https://en.wikipedia.org/wiki/Link_rot "Link rot"), 이런 요인들은 그 링크가 실제로 존재한 적이 있었을 가능성을 낮춘다.

### 잘못된 DOI와 ISBN

[체크섬(checksum)](https://en.wikipedia.org/wiki/Checksum "Checksum")으로 [ISBN](https://en.wikipedia.org/wiki/ISBN "ISBN")을 검증할 수 있다. 잘못된 체크섬은 ISBN이 틀렸다는 매우 강한 징후이며, 인용 템플릿은 그런 경우 경고를 표시한다. 마찬가지로 [DOI](https://en.wikipedia.org/wiki/Digital_object_identifier "Digital object identifier")는 일반 하이퍼링크보다 링크 부패에 더 강하다. 해석되지 않는 DOI와 잘못된 ISBN은 [환각된](https://en.wikipedia.org/wiki/Hallucination_(AI) "Hallucination (AI)") 참고 문헌의 지표가 될 수 있다.

이와 관련하여, 완전히 무관한 문서를 가리키는 DOI나 쪽수 없이 제시된 일반적인 도서 인용도 있다. 다음 구절은 예를 들어 ChatGPT가 생성한 것이다.

> 옴의 법칙은 전기공학과 물리학 분야의 기본 원리로서, 온도가 일정하게 유지된다는 조건에서 도체의 두 지점 사이를 흐르는 전류가 그 두 지점 사이의 전압에 정비례한다고 기술한다. 수학적으로는 V=IR로 표현되며, 여기서 V는 전압, I는 전류, R은 저항이다. 이 법칙은 1827년 독일 물리학자 게오르크 시몬 옴이 정식화했으며, 전기 회로의 분석과 설계에서 초석 역할을 한다 [1]. 옴의 법칙은 "옴 성질"을 가진 많은 물질과 부품, 즉 인가된 전압이나 전류와 관계없이 저항이 일정한 것들에 적용된다. 그러나 다이오드나 트랜지스터 같은 비선형 소자에는 성립하지 않는다 [2][3].
>
> 참고 문헌:
>
> 1. Dorf, R. C., & Svoboda, J. A. (2010). Introduction to Electric Circuits (8th ed.). Hoboken, NJ: John Wiley & Sons. ISBN 9780470521571.
>
> 2. M. E. Van Valkenburg, "The validity and limitations of Ohm's law in non-linear circuits," Proceedings of the IEEE, vol. 62, no. 6, pp. 769–770, Jun. 1974. doi:10.1109/PROC.1974.9547
>
> 3. C. L. Fortescue, "Ohm's Law in alternating current circuits," Proceedings of the IEEE, vol. 55, no. 11, pp. 1934–1936, Nov. 1967. doi:10.1109/PROC.1967.6033

책 참고 문헌은 타당해 보인다. 전기 회로에 관한 책이라면 옴의 법칙에 관한 정보를 담고 있을 가능성이 높기 때문이다. 그러나 쪽수가 없으면 그 인용은 본문의 주장을 검증하는 데 쓸모가 없다. 더 나쁘게는, 두 개의 *Proceedings of the IEEE* 인용이 모두 완전히 날조되었다. 그 DOI는 완전히 다른 인용으로 이어지며, 다른 문제도 가지고 있다. 예를 들어 [C. L. Fortescue](https://en.wikipedia.org/wiki/Charles_LeGeyt_Fortescue "Charles LeGeyt Fortescue")는 글이 쓰였다고 주장되는 시점에 30년 넘게 사망한 상태였고, 55권 11호에는 참고 문헌 3의 정보와 조금이라도 가까운 것에 부합하는 글이 전혀 실려 있지 않다.

### 참고 문헌의 부정확하거나 관례에서 벗어난 사용

AI 도구는 참고 문헌을 포함하도록 요청받았을 수 있고, Wikipedia가 기대하는 방식으로 이를 시도하지만, 몇 가지 핵심적인 구현 세부 사항에서 실패하거나 관례와 비교했을 때 두드러질 수 있다.

**예시**

아래 예에서 참고 문헌을 재사용하려는 잘못된 시도를 주목하라. 여기 사용된 도구는 날조되지 않은 출처를 검색할 수 없었다(Bing Deep Search가 출시되기 하루 전에 실행되었다). 그럼에도 실제 참고 문헌 하나를 찾아냈다. 참고 문헌을 재사용하는 문법이 잘못되었다.

이 경우 *Smith, R. J.* 출처는 도구가 "세 번째 출처"로 만든 것으로 보이는데(PMID 3을 가진 'https://pubmed.ncbi.nlm.nih.gov/3' 링크가 생성되었다), 문서 본문과도 완전히 무관하다. 사용자는 링크가 연결된다는 사실에도 불구하고, 이를 {{cite journal}} 참고 문헌으로 바꾸기 전에 확인하지 않았다.

이 경우의 LLM은 모든 마침표 뒤마다 잘못된 참고 문헌 재사용 문법을 꼼꼼하게 넣었다.

> 30여 년 동안 컴퓨터는 뇌 손상 환자의 재활에 활용되어 왔다. 처음에 연구자들은 "의수 같은 기억(prosthetic memory)"을 개발할 가능성을 깊이 탐구했다.<ref>Fowler R, Hart J, Sheehan M. A prosthetic memory: an application of the prosthetic environment concept. *Rehabil Counseling Bull*. 1972;15:80–85.</ref> 그러나 1980년대 초에 이르러 초점은 반복 연습을 통한 뇌 기능 장애의 해결로 옮겨 갔다.<ref>{{Cite journal |last=Smith |first=R. J. |last2=Bryant |first2=R. G. |date=1975-10-27 |title=Metal substitutions incarbonic anhydrase: a halide ion probe study |url=https://pubmed.ncbi.nlm.nih.gov/3 |journal=Biochemical and Biophysical Research Communications |volume=66 |issue=4 |pages=1281–1286 |doi=10.1016/0006-291x(75)90498-2 |issn=0006-291X |pmid=3}}</ref> 외상성 뇌 손상(TBI) 환자를 위한 재활 소프트웨어를 개발한 심리학자는 소수에 불과했고, 그 결과 이용 가능한 프로그램이 부족했다.<sup>[3]</sup> 인지 재활 전문가들은 시각적으로 매력적이고, 흥미롭고, 반복적이며, 재미있는 상용 컴퓨터 게임을 선택했고, 그 게임이 신경심리 기능 장애에 교정 효과를 가질 것이라고 이론화했다.<sup>[3]</sup>

일부 LLM이나 챗봇 인터페이스는 각주를 표시하기 위해 문자 ↩를 사용한다.

> 참고 문헌
>
> 이 내용을 서식화하여 Wikipedia에 제출하는 것을 도와드릴까요, 아니면 직접 게시할 계획인가요? 그것도 단계별로 안내해 드릴 수 있습니다.
>
> **각주**
>
> 1.   KLAS Research. (2024). *Top Performing RCM Vendors 2024*. https://klasresearch.com ↩ ↩2
> 2.   PR Newswire. (2025, February 18). *CureMD AI Scribe Launch Announcement*. https://www.prnewswire.com/news-releases/curemd-ai-scribe ↩

### ChatGPT 고유 UTM 매개변수

ChatGPT는 출처로 사용하는 URL에 [UTM 매개변수](https://en.wikipedia.org/wiki/UTM_parameter "UTM parameter") `utm_source=openai`를 추가할 수 있으며, 2025년 8월 이전의 편집에서는 `utm_source=chatgpt.com`을 추가하기도 했다. Gemini나 Claude 같은 다른 LLM은 UTM 매개변수를 덜 자주 사용한다.[^13]

참고: 이것은 ChatGPT가 관여했음을 확실히 보여 주지만, 그것만으로 ChatGPT가 글 자체도 생성했다는 것을 증명하지는 않는다. 일부 편집자는 기존 텍스트의 출처를 찾기 위해 AI 도구를 사용한다. 이는 편집 기록에서 드러날 것이다.

**예시**

> 결혼 후 버지스와 그레이엄은 영국 체셔에 정착했으며, 버지스는 그곳에서 워링턴 울브스 럭비 리그 팀의 감독을 맡고 있다. [https://www.theguardian.com/sport/2025/feb/11/sam-burgess-interview-warrington-rugby-league-luke-littler?utm_source=chatgpt.com]

> Vertex AI 문서와 블로그 게시물은 워터마킹, 검증 워크플로, 구성 가능한 안전 필터(예: 인물 생성 제어와 안전 임계값)를 설명한다. ([cloud.google.com](https://cloud.google.com/vertex-ai/generative-ai/docs/image/generate-images?utm_source=openai))

### 참고 문헌 섹션에 선언되었지만 문서 본문에서 쓰이지 않은 명명된 참고 문헌

*이 섹션은 비어 있습니다.* 내용을 추가하여 도울 수 있습니다. *(2025년 10월)*

**예시**

이 판의 예는 다음 차이를 참조하라. 문제가 되는 참고 문헌은 reflist에서 파서 오류로 나타난다.

- [Special:PermanentLink/1287201002#References](https://en.wikipedia.org/wiki/Special:PermanentLink/1287201002#References "Special:PermanentLink/1287201002")
- [Special:PermanentLink/1292432848#References](https://en.wikipedia.org/wiki/Special:PermanentLink/1292432848#References "Special:PermanentLink/1292432848")
- [Special:PermanentLink/1291491974#References](https://en.wikipedia.org/wiki/Special:PermanentLink/1291491974#References "Special:PermanentLink/1291491974")
- [Special:PermanentLink/1291561040#References](https://en.wikipedia.org/wiki/Special:PermanentLink/1291561040#References "Special:PermanentLink/1291561040")

---

## 글쓰기 스타일의 불일치와 영어 변종

### 갑작스러운 중단

AI 도구는 예를 들어 다음에 올 텍스트의 끝을 예측하면(`<|endoftext|>`로 나타남) 갑자기 콘텐츠 생성을 멈출 수 있다. 또한 단일 응답이 가질 수 있는 토큰 수는 보통 제한되어 있으며, 그 이후의 응답에는 사용자가 "생성 계속하기"를 선택해야 한다.

이 방법은 확실하지 않다. 사용자의 로컬 컴퓨터에서 잘못 복사하여 붙여 넣은 것도 같은 결과를 낳을 수 있기 때문이다. 또한 LLM 사용이 아니라 저작권 침해를 나타낼 수도 있다.

### 글쓰기 스타일의 갑작스러운 변화

편집자의 글쓰기 스타일이 갑자기 바뀌는 것, 예를 들어 다른 의사소통에 비해 예상치 못하게 완벽한 문법을 보이는 것은 AI 도구 사용을 나타낼 수 있다.

### 영어 변종 사용의 갑작스러운 변화

사용자의 위치, 주제의 국가적 연고, 사용된 영어 변종 사이의 불일치는 AI 도구 사용을 나타낼 수 있다. 인도에서 온 사람이 인도의 대학에 관해 쓴다면 아마 미국 영어를 쓰지 않을 것이다. 그러나 LLM 출력은 달리 지시하지 않는 한 기본적으로 미국 영어를 사용한다.[^9] 다만 비원어민 영어 사용자는 영어 변종을 섞어 쓰는 경우가 많으므로, 편집자의 영어 변종 사용에 갑작스럽고 완전한 변화가 있을 때에만 그러한 징후가 의심을 불러일으켜야 한다.

### 지나치게 장황한 편집 요약

AI가 생성한 [편집 요약](https://en.wikipedia.org/wiki/Help:Edit_summary "Help:Edit summary")은 흔히 비정상적으로 길고, 약어 없이 쓰인 격식 있는 1인칭 단락으로 작성되며, 그리고/또는 Wikipedia의 관례를 눈에 띄게 나열한다.

> 백과사전적 어조와 Wikipedia 내용 지침에 맞추어 문서의 언어를 중립적으로 다듬었습니다. 홍보성 표현을 제거하고, 사실의 정확성을 확보하며, 명확하고 잘 짜인 구성을 유지했습니다. 역사, 보도, 과제, 인정에 관한 섹션을 명확성과 관련성을 위해 갱신했습니다. 적절한 서식을 추가하고 항목을 그에 맞게 분류했습니다

> 어조를 격식 있게 다듬고, 기술적 내용을 명확히 하며, 중립성을 확보하고, 인용이 필요한 부분을 표시했습니다. 역사적 서술을 간결하게 다듬었고, 규제 참고 자료와 함께 할당 세부 사항을 명시했으며, 전파 설명을 독자 친화적으로 만들었고, 장비 논의는 가용성과 규제 준수에 초점을 맞추었습니다. 이 모든 것은 백과사전적 기준을 따르면서 이루어졌습니다.

> **간결한 편집 요약:** 줄거리 섹션의 명확성, 흐름, 가독성을 개선했고, 중복을 줄이고 더 나은 백과사전적 스타일을 위해 어조를 다듬었습니다.

### AFC 초안의 "제출 진술서"

이 내용은 Articles for Creation으로 제출된 초안에만 해당한다. 적어도 한 LLM은 검토자를 위한 "제출 진술서"를 삽입하는 경향이 있는데, 이는 주제가 왜 저명한지와 초안이 왜 Wikipedia 지침을 충족하는지를 설명하는 것으로 여겨진다. 그러나 이런 것이 실제로 하는 일이라곤 검토자에게 초안이 LLM으로 생성되었음을 알려 주어, 두 번 생각할 필요 없이 거절되거나 신속히 삭제되어야 함을 알려 주는 것뿐이다.

> 검토자 참고 사항(AfC): 이 초안은 포르투갈의 공공 관리자 Jorge Patrão에 관한 중립적이고 출처가 잘 갖추어진 전기이다. 모든 참고 자료는 그의 공적 경력과 문화 활동을 다루는 독립적이고 신뢰할 수 있는 출처(Público, Diário de Notícias, Jornal de Negócios, RTP, O Interior, Agência Lusa)에서 가져왔다. 이는 WP:RS와 WP:BLP 기준을 충족하며, 다음을 통해 WP:NBIO에 따른 명확한 저명성을 보여 준다: – 세하 다 에스트렐라 관광 지역 회장직(1998–2013); – Parkurbis – 코빌량 과학기술 단지 회장직; – 포르투갈 유대인 유산 길 네트워크(유럽평의회의 유럽 유대인 유산 길의 회원)의 창립 역할; – 도서 "1677 – A Fábrica d'El-Rei"의 저자; – 베아트리스 데 루나 미술 컬렉션(대가 중심)의 설립자/큐레이터. pt.wikipedia.org/wiki/Jorge_Patrão에 이 문서의 포르투갈어판도 있다. 검토해 주셔서 감사합니다. -->

— Draft:Jorge Patrão 초안 상단에서 발견됨(원본에는 피할 수 없는 모든 서식 오류가 있음)

### 미리 거절된 AFC 검토 템플릿

가끔 새 편집자가 이미 "declined"로 설정된 AFC 검토 템플릿이 포함된 초안을 만든다. 이 템플릿에는 내용이 없으며 검토자의 이유도 적혀 있지 않다. LLM은 초안에 AFC 제출 템플릿을 추가하겠다고 제안한 뒤, `{{AfC submission|d}}` 같은 것을 제공하는데, 여기서 "d" 매개변수는 {{AfC submission/declined}}로 치환되어 초안을 미리 거절한다. 초안의 기여 기록을 보면 이 템플릿이 초안 작성자에 의해 어느 시점에 삽입되었음을 알 수 있다. 예외 없이 작성자는 그런 다음 Wikipedia:WikiProject Articles for creation/Help desk나 다른 도움말 페이지에서 왜 아무 피드백 없이 초안이 거절되었는지 묻는다. 내용 없는 "제출 거절" 머리글이 있다는 것은 해당 초안이 LLM으로 생성되었다는 **강력한** 지표이다.

---

## 사람이 쓴 글의 징후

### ChatGPT 출시 이전 텍스트의 시기

ChatGPT는 2022년 11월 30일에 대중에게 공개되었다. OpenAI는 그 이전에도 비슷하게 강력한 LLM을 보유하고 있었지만, 그것들은 유료 서비스였고 쉽게 접근할 수 없었으며 일반인에게 알려져 있지 않았다. ChatGPT는 출시 직후 폭발적인 성장을 경험했다.

**2022년 11월 30일 이전**에 Wikipedia에 추가된 특정 텍스트가 LLM으로 생성되었을 가능성은 매우 낮다. 이 날짜 이전에 이루어진 편집이라면, 그 판에 대해서는 AI 사용을 안전하게 배제할 수 있다. 일부 오래된 텍스트가 이 목록에 나온 AI의 징후 일부를 보이고, AI로 생성된 것처럼 그럴듯하게 보일 수도 있지만, Wikipedia의 방대함 때문에 이런 드문 우연이 생길 수 있다.

### 자신의 편집상 선택을 설명하는 능력

편집자는 자신이 한 편집이나 실수를 왜 했는지 설명할 수 있어야 한다. 예를 들어 편집자가 조작된 것처럼 보이는 URL을 넣었다면, 성급하게 결론 내리기보다 어떻게 그런 혼동이 생겼는지 물어볼 수 있다. 편집자가 올바른 링크를 제시하고 그것이 사람의 실수(아마 오타)였다고 설명하거나, 실제 출처의 관련 구절을 공유할 수 있다면, 그것은 평범한 사람의 실수를 가리킨다.

---

## 효과 없는 지표

AI 사용에 대한 잘못된 고발은 [신규 편집자를 떠나게 하고](https://en.wikipedia.org/wiki/Wikipedia:BITE "Wikipedia:BITE") 의심의 분위기를 조성할 수 있다. AI가 사용되었다고 주장하기 전에, [더닝-크루거 효과(Dunning–Kruger effect)](https://en.wikipedia.org/wiki/Dunning%E2%80%93Kruger_effect "Dunning–Kruger effect")와 [확증 편향(confirmation bias)](https://en.wikipedia.org/wiki/Confirmation_bias "Confirmation bias")이 여러분의 판단을 흐리고 있지 않은지 생각하라. 다음은 LLM 탐지에 효과가 없으며, 오히려 정반대를 나타낼 수도 있는 몇 가지 흔히 쓰이는 지표이다.

- **완벽한 문법**: 현대 LLM은 높은 문법 능력으로 알려져 있지만, 많은 편집자도 숙련된 작가이거나 전문적인 글쓰기 배경을 가지고 있다. (또한 [§ 글쓰기 스타일과 영어 변종의 불일치](#discrepancies-in-writing-style-and-variety-of-english)를 보라.)

- **"밋밋하거나" "로봇 같은" 글**: 기본적으로 현대 LLM은 위에서 자세히 설명한 대로 과장되고 장황한 글을 쓰는 경향이 있다. 이 경향은 공식적이지만, AI 글쓰기에 익숙하지 않은 사람에게는 "로봇 같다"고 느껴지지 않을 수도 있다.[^14]

- **"화려하거나," "학술적이거나," 또는 특이한 단어**: LLM은 특정 단어와 구절을 불균형하게 선호하며, 그중 많은 것이 길고 가독성 점수가 어렵지만, 그 상관관계가 "화려하거나," 학술적이거나, "고급스러워 보이는" 모든 글로 확장되지는 않는다.[^1] 드물거나 "특이한" 단어는 통계적으로 덜 흔하기 때문에, 고유한 주제와 직접 관련된 고유명사가 아닌 한 AI 생성 글에 덜 나타난다.

- **편지 같은 글(단독으로 볼 때)**: 2023년 이후 인사말, 맺음말, 제목, 그 밖의 격식이 있는 토크 페이지 메시지 대부분이 AI로 생성된 것처럼 보이지만, 편지와 이메일은 현대 LLM이 존재하기 *훨씬 전*부터 관례적으로 그런 방식으로 작성되어 왔다. 사람인 편집자(특히 신규 편집자)는 공식적인 의사소통에 더 익숙하거나, 학교 과제로 그런 형식을 요구받았거나, 단순히 토크 페이지를 이메일로 착각하는 등 다양한 이유로 토크 페이지 댓글을 비슷하게 서식화할 수 있다. AI가 생성한 토크 페이지 메시지에는 세로 목록,[^d] 자리 표시자, 갑작스러운 중단 같은 다른 단서가 있는 경향이 있다.

- **접속사(단독으로 볼 때)**: LLM은 사실들의 부적절한 종합을 암시하는, 어색하고 공식적인 방식으로 연결어와 연결 구절을 과용하는 경향이 있지만, 그런 용법은 사람이 쓴 에세이 같은 글에서도 전형적이며 그 자체로 강력한 지표는 아니다.

- **기이한 위키텍스트**: LLM은 [§마크업](#markup)에서 설명한 이유로 템플릿을 환각하거나 잘못된 문법의 위키텍스트 코드를 생성할 수 있지만, 이 목록에 있는 것(§마크업에 나열된 것은 제외하고)을 제외하면, 무작위로 보이는 "설명할 수 없는" 오류와 아티팩트가 있는 내용을 생성할 가능성은 낮다. `<span>` 같은 이상한 위치의 HTML 태그는 잘못 프로그래밍된 브라우저 확장 프로그램이나 Wikipedia의 콘텐츠 번역 도구의 알려진 버그(T113137)를 나타낼 가능성이 더 높다. `''Catch-22 i''s a satirical novel.`처럼 잘못 놓인 문법(*Catch-22 i* s a satirical novel로 렌더링됨)은 소스 편집에서보다 알아채기 어려운 VisualEditor의 실수를 더 나타낸다.

---

## 주석

[^a]: AI 챗봇에만 고유한 것은 아니며, {{as of}} 템플릿으로 생성된다

[^b]: 삭제된 초안(관리자만 열람 가능)의 `Would you like me to ... turn this into actual Wikipedia markup format (wikitext)?` 예시

[^c]: 초안에 나타난 ` ```wikitext ` 예시.

[^d]: 삭제 토론에 나타난 세로 목록 예시

---

## 참고 문헌

[^1]: Russell, Jenna; Karpinska, Marzena; Iyyer, Mohit (2025). [*People who frequently use ChatGPT for writing tasks are accurate and robust detectors of AI-generated text*](https://aclanthology.org/2025.acl-long.267/). Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers). Vienna, Austria: Association for Computational Linguistics. pp.5342–5373. arXiv:[2501.15654](https://arxiv.org/abs/2501.15654).

[^2]: Dugan, Liam; Hwang, Alyssa; Trhlik, Filip; Zhu, Andrew; Ludan, Josh Magnus; Xu, Hainiu; Ippolito, Daphne; Callison-Burch, Chris (2024). [*RAID: A Shared Benchmark for Robust Evaluation of Machine-Generated Text Detectors*](https://aclanthology.org/2024.acl-long.674). Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers). Bangkok, Thailand: Association for Computational Linguistics. pp.12463–12492. arXiv:[2405.07940](https://arxiv.org/abs/2405.07940).

[^3]: ["People who frequently use ChatGPT for writing tasks are accurate and robust detectors of AI-generated text"](https://arxiv.org/html/2501.15654v2). *arxiv.org*. 검색일 2025-11-28.

[^4]: 이것은 텍스트-이미지 모델이 생성한 이미지를 살펴보면 직접 관찰할 수 있다. 첫눈에는 괜찮아 보이지만, 세부 묘사는 흐릿하고 형태가 일그러지는 경향이 있다. 특히 배경 물체와 텍스트에서 그렇다.

[^5]: ["10 Ways AI Is Ruining Your Students' Writing"](https://www.chronicle.com/article/10-ways-ai-is-ruining-your-students-writing). *Chronicle of Higher Education*. 2025년 9월 16일. 2025년 10월 1일 원본에서 보관. 검색일 2025년 10월 1일.

[^6]: Juzek, Tom S.; Ward, Zina B. (2025). [*Why Does ChatGPT "Delve" So Much? Exploring the Sources of Lexical Overrepresentation in Large Language Models*](https://aclanthology.org/2025.coling-main.426.pdf) (PDF). Findings of the Association for Computational Linguistics: ACL 2025. Association for Computational Linguistics. arXiv:[2412.11385](https://arxiv.org/abs/2412.11385).

[^7]: Reinhart, Alex; Markey, Ben; Laudenbach, Michael; Pantusen, Kachatad; Yurko, Ronald; Weinberg, Gordon; Brown, David West. ["Do LLMs write like humans? Variation in grammatical and rhetorical styles"](http://arxiv.org/abs/2410.16107). 검색일 2025년 12월 4일.

[^8]: Kobak, Dmitry; González-Márquez, Rita; Horvát, Emőke-Ágnes; Lause, Jan (2025년 7월 2일). ["Delving into LLM-assisted writing in biomedical publications through excess vocabulary"](https://www.science.org/doi/10.1126/sciadv.adt3813). *Science Advances*. **11** (27). doi:[10.1126/sciadv.adt3813](https://doi.org/10.1126%2Fsciadv.adt3813). ISSN 2375-2548. PMC 12219543. PMID 40009654.

[^9]: Ju, Da; Blix, Hagen; Williams, Adina (2025). [*Domain Regeneration: How well do LLMs match syntactic properties of text domains?*](https://aclanthology.org/2025.findings-acl.120). Findings of the Association for Computational Linguistics: ACL 2025. Vienna, Austria: Association for Computational Linguistics. pp.2367–2388. arXiv:[2505.07784](https://arxiv.org/abs/2505.07784). doi:[10.18653/v1/2025.findings-acl.120](https://doi.org/10.18653%2Fv1%2F2025.findings-acl.120).

[^10]: Kousha, Kayvan; Thelwall, Mike (2025). [*How much are LLMs changing the language of academic papers after ChatGPT? A multi-database and full text analysis*](https://arxiv.org/pdf/2509.09596). ISSI 2025 Conference. arXiv:[2509.09596](https://arxiv.org/abs/2509.09596).

[^11]: Merrill, Jeremy B.; Chen, Szu Yu; Kumer, Emma (2025년 11월 13일). ["What are the clues that ChatGPT wrote something? We analyzed its style"](https://www.washingtonpost.com/technology/interactive/2025/how-detect-chatgpt-em-dash/). *The Washington Post*. 검색일 2025년 11월 14일.

[^12]: ["Unproductive Interpretation of Work and Employment as Misinformation?"](https://www.laetusinpraesens.org/docs20s/workeco.php). 2025년 9월 2일 원본에서 보관. 검색일 2025년 10월 21일.

[^13]: [T387903](https://phabricator.wikimedia.org/T387903 "phabricator:T387903") 참조.

[^14]: Murray, Nathan; Tersigni, Elisa (2024년 7월 21일). ["Can instructors detect AI-generated papers? Postsecondary writing instructor knowledge and perceptions of AI"](https://journals.sfu.ca/jalt/index.php/jalt/article/view/1895). *Journal of Applied Learning & Teaching*. **7** (2). doi:[10.37074/jalt.2024.7.2.12](https://doi.org/10.37074%2Fjalt.2024.7.2.12). ISSN 2591-801X. 검색일 2025년 11월 21일.
