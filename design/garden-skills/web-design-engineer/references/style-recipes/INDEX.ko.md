# 스타일 레시피 - 카탈로그 색인

25개의 명명된 고정 디자인 레시피 카탈로그 - 각 레시피는 실제 브랜드/스튜디오/디자이너와 연결되어 있으며 **이 디렉토리에 자체 파일로 저장**됩니다. 이 색인을 읽고 사용 가능한 항목과 선택 방법을 알아보세요. 그런 다음 **레시피 파일 하나**를 읽어 3단계의 구체적인 값을 얻으세요.

```
references/style-recipes/
├── INDEX.md                       ← you are here
├── apple-hig.md
├── muji-kenya-hara.md
├── aesop.md
├── ... (25 recipe files total)
```

이 카탈로그는 **고정 라이브러리**입니다. `../design-directions.md`는 모호한 요청 대화에 대한 **학교 분류**입니다. 두 가지가 함께 작동합니다.| 경로 | 도구 | 언제 |
|---|---|---|
| 사용자가 전혀 모른다 - 안내가 필요함 | `../design-directions.md`(6교 3선대화) | "좋은 걸 만들어 주세요" / "어떤 스타일을 원하는지 모르겠어요" |
| 사용자가 염두에 두고 있는 앵커가 있습니다 | 여기에서 **한 개의** 파일을 직접 읽기 | "리니어 스타일로 만들어 보세요" / "스트라이프 프레스 느낌" / "아레나 바이브" |
| 방향 조언자는 학교로 좁혀졌지만 사용자는 구체성을 원함 | 해당 학교의 레시피에 대한 이 INDEX를 읽고 → 그런 다음 2~3개의 특정 레시피 파일을 읽으세요 | 대화 도중 핸드오프 |

---

## 레시피 파일을 읽어야 하는 경우

**단일 레시피 파일을 읽는 경우**:1. **사용자는 브랜드, 스튜디오, 디자이너별로 앵커 이름을 지정합니다** — "선형 랜딩 페이지 만들기", "이솝 느낌의 제품 페이지", "MUJI 조용함", "펜타그램급 유형 시스템". **해당 앵커의 파일**(`linear.md`, `aesop.md` 등)만 읽으십시오. 전체 카탈로그는 읽지 마십시오.
2. **방향 조언자는 학교로 좁혀졌습니다** — 이 색인을 읽고 해당 학교에 어떤 레시피가 있는지 확인한 다음 2~3개의 특정 파일을 읽어 사용자에게 구체적인 선택 사항을 제시합니다.
3. **3단계에 있으며 잘 알려진 팔레트/타이포그래피/간격 콤보가 필요합니다** — 학교별 또는 아래 표에 가장 적합한 레시피를 선택한 다음 해당 단일 파일을 읽고 적용하세요.

모든 레시피 파일을 미리 로드하지 **마세요**. 함께 로드할 경우 전체 카탈로그는 ~1400줄입니다. 하나의 레시피를 로드하는 데는 최대 50줄이 소요됩니다. **하나의 레시피만 필요할 때 전체 카탈로그를 로드하는 것은 이 분할이 방지하도록 설계된 정확한 안티 패턴입니다.**다음과 같은 경우 레시피 파일을 읽지 **하지 마세요**.
- 사용자가 자신의 브랜드 자산/Figma/코드베이스를 제공했습니다. 대신 해당 자산에서 추출했습니다(자산 > 사양).
- 작업은 확장 중인 기존 UI에 따라 결정됩니다. 이미 존재하는 시각적 어휘와 일치시키고 레시피를 강요하지 마세요.
- 사용자가 특정 참조 페이지의 스크린샷을 제공했습니다. 해당 스크린샷은 *레시피*입니다. 직접 추출합니다.

---

## 파일 형식 규칙(모든 레시피 파일은 이 구조를 따릅니다)- **제목 줄** — `# <anchor-id> — <Human-readable name>`
- **앵커 및 학교** — 실제 참조 및 그것이 속한 방향 고문 학교
- **바이브 및 최고** — 한 줄의 바이브 요약과 실제로 제공되는 시나리오
- **기준** — 살펴봐야 할 실제 제품/객체/출판물 이름이 하나 이상 있음(기억에 의존하기 전에 검색 및 확인)
- **팔레트** — 역할(잉크/표면/액센트/그라운드)별로 이름이 지정된 16진수 값입니다. 항상 제한됩니다. 절대로 12스톱 램프가 아닙니다.
- **타이포그래피** — 무게 숫자와 크기 안내가 포함된 실제 글꼴 이름입니다. 앵커 자체에서 사용하지 않는 한 "Inter/Roboto" 대체는 없습니다.
- **간격 시스템** — 구체적인 가치 사다리
- **반경/그림자/모션 문자** — 코드가 아닌 **디자인 언어**로 설명됨
- **시그니처 동작** — 이 레시피를 *인식 가능*하게 만드는 3~5개의 구체적이고 독선적이며 복사 가능한 디자인 결정입니다. 이것이 바로 디자인 DNA입니다.
- **피하십시오** — 이 레시피 내의 안티 패턴(예: 자동으로 AI로 전환하는 것)슬롭)
- **AI 프롬프트 시드** — 지원 이미지를 생성할 때 DNA에 머물기 위해 무엇을 요청해야 하는지
- **사용하지 마세요** — 경계; 이 레시피가 잘못 실행되는 상황
- **바닥글** — 같은 학교의 동료 레시피 + 이 INDEX로 돌아가는 링크

**이 파일에는 코드가 포함되어 있지 않습니다.** 16진수 코드, 글꼴 이름 및 간격 사다리는 코드가 아닌 *단어로 설명된 디자인 토큰*입니다. 에이전트는 프로젝트 스택을 사용하여 3단계 이상에서 이를 CSS/JSX로 변환합니다.

---

## 색인 1 — 학교별| 학교 | 조리법 |
|---|---|
| **편집자 / 미니멀리스트** | [`apple-hig`](./apple-hig.md) · [`muji-kenya-hara`](./muji-kenya-hara.md) · [`aesop`](./aesop.md) · [`dieter-rams-braun`](./dieter-rams-braun.md) · [`monocle-magazine`](./monocle-magazine.md) |
| **정보 아키텍처** | [`pentagram`](./pentagram.md) · [`vignelli-swiss-helvetica`](./vignelli-swiss-helvetica.md) · [`bloomberg-terminal`](./bloomberg-terminal.md) · [`tufte-dataink`](./tufte-dataink.md) · [`nyt-the-daily`](./nyt-the-daily.md) |
| **최신 도구/빌더 SaaS** | [`linear`](./linear.md) · [`vercel-mesh`](./vercel-mesh.md) · [`raycast`](./raycast.md) · [`notion-pre-ai`](./notion-pre-ai.md) |
| **모션/실험** | [`field-io`](./field-io.md) · [`active-theory`](./active-theory.md) · [`resn-storytelling`](./resn-storytelling.md) |
| **브루털리스트/로우** | [`are-na`](./are-na.md) · [`bloomberg-businessweek-turley`](./bloomberg-businessweek-turley.md) · [`balenciaga-post-2017`](./balenciaga-post-2017.md)|
| **따뜻한 휴머니스트** | [`mailchimp-freddie`](./mailchimp-freddie.md) · [`stripe-press`](./stripe-press.md) · [`headspace-meditation`](./headspace-meditation.md) |
| **전문 분야/장르**(어드바이저를 통해 공개되지 않음) | [`y2k-retrofuturism`](./y2k-retrofuturism.md) · [`mid-century-modern`](./mid-century-modern.md) |

처음 6개 학교는 Direction Advisor의 6개 학교(`../design-directions.md`)를 반영합니다. 따라서 Advisor가 그 중 하나를 선택하면 어떤 레시피 파일이 표시되는지 알 수 있습니다. 7번째 학교(전문 분야/장르)는 **직접 앵커 이름 지정을 통해서만 접근할 수 있습니다** — Y2K 또는 Mid-Century를 원하는 사용자는 항상 앵커를 손에 들고 도착하며 Advisor를 통하지 않습니다.

## 색인 2 — Best-For 기준| 시나리오 | 첫 번째 선택 요리법 |
|---|---|
| B2B SaaS/개발자 도구 | [`linear`](./linear.md) · [`vercel-mesh`](./vercel-mesh.md) · [`raycast`](./raycast.md) · [`pentagram`](./pentagram.md) |
| 프리미엄 소비자/라이프스타일 | [`aesop`](./aesop.md) · [`muji-kenya-hara`](./muji-kenya-hara.md) · [`stripe-press`](./stripe-press.md) · [`monocle-magazine`](./monocle-magazine.md) |
| 데이터 상품/대시보드/금융 | [`bloomberg-terminal`](./bloomberg-terminal.md) · [`tufte-dataink`](./tufte-dataink.md) · [`vignelli-swiss-helvetica`](./vignelli-swiss-helvetica.md) |
| 편집/출판/장문 | [`nyt-the-daily`](./nyt-the-daily.md) · [`monocle-magazine`](./monocle-magazine.md) · [`stripe-press`](./stripe-press.md) · [`mailchimp-freddie`](./mailchimp-freddie.md) |
| 출시 순간/브랜드 영상/시상식 | [`field-io`](./field-io.md) · [`active-theory`](./active-theory.md) · [`resn-storytelling`](./resn-storytelling.md) · [`vercel-mesh`](./vercel-mesh.md) |
| 차별화 /반문화/예술가 | [`are-na`](./are-na.md) · [`bloomberg-businessweek-turley`](./bloomberg-businessweek-turley.md) · [`balenciaga-post-2017`](./balenciaga-post-2017.md) |
| 다가가는 B2C/커뮤니티/헬스 | [`mailchimp-freddie`](./mailchimp-freddie.md) · [`headspace-meditation`](./headspace-meditation.md) · [`notion-pre-ai`](./notion-pre-ai.md) |
| 레트로/테마/디케이드코드 | [`y2k-retrofuturism`](./y2k-retrofuturism.md) · [`mid-century-modern`](./mid-century-modern.md) |

## 색인 3 — 모드별(밝음/어두움/둘 중 하나)| 모드 | 조리법 |
|---|---|
| 빛 우선 | [`apple-hig`](./apple-hig.md) · [`muji-kenya-hara`](./muji-kenya-hara.md) · [`aesop`](./aesop.md) · [`dieter-rams-braun`](./dieter-rams-braun.md) · [`monocle-magazine`](./monocle-magazine.md) · [`pentagram`](./pentagram.md) · [`nyt-the-daily`](./nyt-the-daily.md) · [`stripe-press`](./stripe-press.md) · [`headspace-meditation`](./headspace-meditation.md) · [`mailchimp-freddie`](./mailchimp-freddie.md) · [`mid-century-modern`](./mid-century-modern.md) |
| 어둠 우선 | [`linear`](./linear.md) · [`vercel-mesh`](./vercel-mesh.md) · [`raycast`](./raycast.md) · [`bloomberg-terminal`](./bloomberg-terminal.md) · [`field-io`](./field-io.md) · [`active-theory`](./active-theory.md) · [`resn-storytelling`](./resn-storytelling.md) · [`y2k-retrofuturism`](./y2k-retrofuturism.md) |
| 어느 쪽이든 작동 | [`vignelli-swiss-helvetica`](./vignelli-swiss-helvetica.md) · [`tufte-dataink`](./tufte-dataink.md) · [`notion-pre-ai`](./notion-pre-ai.md) ·[`are-na`](./are-na.md) · [`bloomberg-businessweek-turley`](./bloomberg-businessweek-turley.md) · [`balenciaga-post-2017`](./balenciaga-post-2017.md) |

---

## 교차 방지 패턴(25개 레시피 모두에 적용)

이는 이 카탈로그의 모든 레시피에 적용됩니다. 이를 위반하면 레시피가 AI 기본 슬로프로 다시 축소됩니다. **개별 레시피 파일을 읽기 전에 먼저 읽어보세요** — 각 파일에 중복되지 않습니다.

### ❌ 페이지 중간에 두 가지 레시피를 결합하지 마세요.

**하나** 레시피를 선택하고 완전히 인스턴스화하세요. "이솝 액센트가 있는 선형" 또는 "Y2K 영웅이 있는 오각형"을 추가하면 일반적으로 원본이 아닌 혼란스러운 것으로 읽힙니다. 두 가지 레시피 리믹스는 사용자가 명시적으로 질문하고 결혼이 일관적인 *이유*를 명확히 설명할 수 있는 경우에만 작동합니다(예: "편집본이 있는 약종상 카탈로그에 대한 펜타그램 그리드의 이솝 팔레트").

### ❌ 잔혹행위에 반쯤 헌신하지 마세요 / Y2K / 미드센츄리전문/장르 및 브루탈리스트/생 레시피에는 완전한 헌신이 필요합니다. Half-Y2K는 "깨진 모던 사이트"로 읽혀집니다. 반잔인주의는 "미완성 디자인"으로 읽힌다. 올인하거나 다른 레시피를 선택하세요.

### ❌ 디스플레이를 Inter / Roboto / Arial / system-ui로 기본 설정하지 마세요.

선택한 레시피에서 글꼴을 지정하는 경우 해당 글꼴(또는 *레시피에 이름이 지정된 실제 대체 글꼴*)을 사용하세요. Inter를 기본값으로 설정하면 일반적으로 서명의 30~40%에 해당하는 레시피의 인쇄상의 정체성이 지워집니다.

### ❌ 팔레트의 모든 색상을 가져오지 마세요.

각 레시피에는 의도적으로 제한된 팔레트가 나열되어 있습니다. 레시피에 4가지 색상이 있는 경우 "균형을 맞추기" 위해 5번째 색상을 추가하지 마세요. 제한은 *레시피*입니다.

### ❌ "팝업하기 위해" 자신만의 AI 기본 터치를 추가하지 마세요.

레시피에 "그림자 없음"이라고 적혀 있으면 미묘한 그림자를 추가하지 마세요. "그라디언트 없음"이라고 표시되면 그라디언트 메쉬를 추가하지 마세요. '이모티콘 없음'이라고 표시되면 추가하지 마세요. 모든 AI 기본 추가는 평균에 대한 레시피의 고유성을 감소시킵니다.### ❌ CSS로 사진 스타일을 위조하지 마세요

Aesop, Stripe Press, MUJI, Apple HIG, Mailchimp 및 Headspace와 같은 레시피는 특정 사진이나 일러스트레이션 스타일을 사용합니다. 해당 이미지를 소스/생성할 수 없는 경우 **사용자에게 그렇게 말**하세요. CSS 모양을 대체하지 마세요. 품질이 60%인 실제 영웅 사진이 포함된 레시피는 인식값이 0%인 CSS 대체물이 포함된 동일한 레시피보다 더 좋습니다.

### ❌ 새로운 레시피를 조용히 개발하지 마세요

나열된 레시피에서 벗어나는 경우 **사용자에게** 다음과 같이 말하세요. "25가지 레시피 중 적합한 레시피가 없습니다. 대신 제가 제안하는 레시피는 다음과 같습니다." 새로운 레시피에는 고유한 기준, 구체적인 가치, 고유한 동작이 표현될 자격이 있습니다. 표류는 이 전체 카탈로그가 방지하기 위해 구축된 AI 기본값을 생성합니다.

### ❌ 하나의 레시피가 필요할 때 전체 카탈로그를 읽지 마세요.실제로 필요한 레시피 파일만 로드하세요. 사용자가 "선형 스타일"이라고 말한 경우 [`linear.md`](./linear.md)를 읽으십시오. 25개가 전부는 아닙니다. 한 번에 1개 파일을 처리하는 패턴이 이 카탈로그를 효율적으로 만드는 것입니다. 모든 것을 미리 로드하면 점진적인 공개가 무효화됩니다.

---

## 25가지 중 하나도 맞지 않을 때

옵션은 다음과 같습니다.

1. **사용자 요청을 다시 읽어보세요** — 때로는 올바른 방법이 돌이켜보면 분명할 때도 있습니다(사용자가 이름을 지정하지 않은 경우에도 "데이터 기반 조사 도구"는 거의 항상 [`tufte-dataink`](./tufte-dataink.md) 또는 [`bloomberg-terminal`](./bloomberg-terminal.md)입니다)
2. 명시적인 프레임을 사용하여 **의도적으로 두 가지 레시피를 결합**합니다. 위의 경고를 참조하세요.
3. **`../design-directions.md`에 전달** — 3개의 차별화된 학교를 제안하고 사용자가 선택하도록 합니다.
4. **새 레시피 명시** — 앵커 이름 지정, 구체적인 값 나열, 사용자 승인을 받은 후 진행

코드가 시작되기 전에 사용자가 확인할 수 있도록 항상 3단계 디자인 시스템 선언에서 레시피 선택을 명시적으로 지정하세요.