# 이미지와 에셋 정책

이미지는 장식이 아니라 글을 돕는 요소입니다. Phase 2에서 이미지 전략과 이미지별 계획을 `plan/plan.md`의 **Assets** 단락에 기록합니다(`plan-template.md` 참고). 더 이상 별도 `asset-plan.md` 파일을 만들지 않습니다.

## Raw와 직교: 이미지 전략은 Image만 다루고 Raw는 다루지 않음(절대 원칙)

**이미지 전략은 외부 `Image`를 사용할지와 어떤 출처를 쓸지만 정합니다. Raw와는 완전히 별개의 축이며 서로 대체하는 양자택일이 아닙니다.**

- **`Raw`는 항상 있습니다.** 모든 글에서 기본으로 쓸 수 있는 표현 레이어입니다(임의의 HTML / CSS / JS / React: 인터랙션, 사용자 지정 레이아웃, 모션, 작은 도구, 필요하면 SVG / canvas 도식). 이미지 전략에 영향을 받지 않으며 사용자가 “켜야” 하는 기능도 아닙니다.
- **`Image`는 별도로 선택하는 레이어입니다.** 이미지 전략에서 사용할지와 출처를 정합니다.
- `none`을 선택했다고 **이미지를 Raw로 대체한다는 뜻은 아닙니다.** 외부 이미지를 사용하지 않는다는 뜻이며 `Raw`는 계속 사용할 수 있습니다.

> 이를 “Image 대 Raw”로 설명하지 마세요. 올바른 개념은 “Raw는 항상 있고, Image의 사용 여부와 출처는 사용자가 Plan Checkpoint에서 명시적으로 선택한다”입니다.

## 이미지용 네 가지 출처 모드

| 모드 | 설명 | 적합한 상황 |
| --- | --- | --- |
| `user-assets` | 사용자가 스크린샷 / 사진 / 차트 / 에셋 디렉터리를 제공 | 제품 관련 글, 코드 리뷰, 실제 보고서 |
| `placeholders` | 이미지 자리표시자나 슬롯으로 먼저 구성 | 사용자가 나중에 실제 에셋을 제공하는 경우 |
| `ai-generated` | 글과 테마에 맞춰 AI가 이미지 프롬프트를 생성 | 비주얼 에세이, 개념 설명, 표지 이미지 |
| `none` | 외부 이미지 미사용(`Raw` 자유 레이어 / 표에는 영향이 없으며 계속 사용) | tufte 스타일, 기술 분석, 근거 중심 글 |

**사용자가 명시적으로 선택하지 않는 한 AI 이미지를 생성하지 않습니다.** `ai-generated`는 반드시 사용자가 골라야 합니다. `none`을 선택해도 `Raw`에는 영향이 없습니다.

## 에셋 체크포인트에서 반드시 질문(Plan Checkpoint 안에서 선택 필수, 기본값으로 통과시키지 않음)

이미지 모드는 **필수 선택**입니다. 기본값 하나를 정해 그대로 넘기지 않습니다. 먼저 “Raw는 그대로 사용한다”고 한 문장으로 설명한 뒤 **Image** 출처 네 가지 중 하나를 고르게 합니다.

```text
配图模式（这一项只决定是否使用外部 Image；Raw 自由层 —— 交互 / 布局 / 动效 / 图解 —— 不受影响，照常使用）。
请从以下四种里选一种：
- none：不使用外部图片，靠正文 + Raw + 表格表达（推荐给技术 / 证据型文章）。
- user-assets：你提供素材目录或截图，我据此排版。
- placeholders：先放占位图，我在 plan.md 的 Assets 段标注每张图应替换成什么。
- ai-generated：我先生成配图提示词，等你确认后再生成图片。
我的推荐：<策略>，原因：<一句话>。你确认或改成别的？
```


## ai-generated 프롬프트 원칙

`ai-generated`를 골라도 임의로 이미지를 곧장 생성하지 않습니다. 먼저 `plan/plan.md`의 Assets 단락에 이미지마다 다음 항목을 정리합니다.

위치 · 뒷받침할 단락 / 주장 · 목적 · 테마 스타일 · 구도 · 금지 항목 · 프롬프트 · 대체 프롬프트.

예시:

```text
Image 01
位置：Hero 背景
目的：建立"技术出版物"气质，不解释具体机制
主题：press
风格：warm editorial still life, paper texture, low saturation
禁止：3D icon, neon gradient, SaaS stock photo, smiling office people
Prompt: Warm editorial photograph of a desk with annotated technical notes,
printed code snippets, a graphite pencil, soft morning light, low saturation,
refined book-publishing mood, no screens, no logos.
```


## 이미지별 자체 점검

- 글의 구체적인 위치에 도움이 되는가? 선택한 테마 `theme-profiles/<id>.md`의 미디어 스타일과 일치하는가?
- 단순 장식이 아닌가? 본문을 압도하지 않는가? Raw로 표현한 내용과 중복되지 않는가?
- caption / source / alt 텍스트가 있는가?

에셋 자체 점검은 Plan 자체 점검 다섯 항목 중 하나인 “Raw / 이미지에 목적이 있는가”에 포함합니다. 주 Agent가 직접 확인하며 **별도 Asset Reviewer SubAgent를 만들지 않습니다.** 자세한 내용은 `review-checklist.md`의 Plan 자체 점검을 참고합니다.
