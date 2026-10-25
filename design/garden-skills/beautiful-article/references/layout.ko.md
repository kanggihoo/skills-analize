# 레이아웃: 너비 모드와 TOC

레이아웃은 **테마와 독립된 별도 결정**입니다. 테마는 미적 분위기를 정하고, 너비 / 목차는 읽기 레이아웃을 정합니다. 정보 밀도와 테마가 분리되는 방식과 같습니다. Plan Checkpoint(Phase 3)에서 사용자가 확인하고 `plan/plan.md`의 Brief에 기록합니다.

## 너비 모드(`Article`의 `width`, reacticle ≥ 0.2.0 필요)

너비는 `<Article width="...">`로 설정하며 **더는 테마가 결정하지 않습니다.** 일반적인 모드는 네 가지입니다.

| 모드 | 본문 열 너비 | 적합한 콘텐츠 |
| --- | --- | --- |
| `narrow` | 약 34rem | 집중해서 읽는 짧은 글, `essay`, `briefing`, 인용문 리듬이 강한 글 |
| `regular`(기본값) | 약 46rem | `longform` / `explainer` 등 일반적인 장문 |
| `wide` | 약 58rem | 표 / 코드 / 데이터가 많은 글(`full-report`, `review`, `tutorial`) |
| `full` | 약 78rem | 이미지 중심, 넓은 미디어를 쓰는 글(`visual-essay`) |

모든 테마는 모든 너비 모드와 조합할 수 있습니다(서로 독립). 예: 데이터 표가 많은 글에는 `tufte + wide`, 여유 있는 수필에는 `press + narrow`.

## TOC(`Article`의 `toc`)

`<Article toc>`는 왼쪽 목차를 렌더링합니다(`Section` / `Subsection`에서 자동으로 만들며 최대 세 단계, 스크롤 위치에 맞춰 강조 표시).

- **이 Skill은 기본으로 TOC를 켭니다.** 장문을 탐색하기 쉽게 하기 위함이지만, **Plan Checkpoint에서 반드시 사용자 확인을 받습니다.**
- 아주 짧은 글(`briefing` / 짧은 `visual-essay`)에서는 본문보다 목차가 두드러지는 것을 막기 위해 끌 수 있습니다.
- TOC를 켜면 “왼쪽 목차 + 본문” 2열 레이아웃이 됩니다. 좁은 뷰포트(1000px 미만)에서는 자동으로 단일 열로 바뀝니다.

## 사용 예

```tsx
// 默认：常规宽度 + 开 TOC
<Article toc width="regular"> ... </Article>

// 数据密集报告：更宽 + TOC
<Article toc width="wide"> ... </Article>

// 短随笔：窄列、不要目录
<Article width="narrow"> ... </Article>
```


## 자체 점검

- 너비가 콘텐츠에 맞는가?(표 / 코드가 많으면 최소 `wide`, 순수한 서사라면 `regular` / `narrow`)
- 테마가 아니라 콘텐츠를 기준으로 너비를 골랐는가?
- TOC 사용 여부를 사용자에게 확인했는가? 짧은 글에서 목차를 불필요하게 켜 두지 않았는가?
- 모바일에서 2열이 제대로 1열로 바뀌는가?
