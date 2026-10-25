# 컴포넌트 사용 정책(reacticle 규약)

글은 `reacticle` 컴포넌트 규약에 맞춰 작성합니다. **맨 `div` / `className` / 인라인 `style` / CSS를 직접 작성하지 않습니다.** 구조는 의미 컴포넌트로, 본문은 문단으로, 사용자 지정 비주얼은 `Raw`로 표현합니다. 패키지 진입점에서 가져옵니다.

```tsx
import { ThemeProvider, Article, Hero, Lead, Section, Aside, Table, Raw } from "reacticle";
```


## 핵심 규칙(항상 적용)

1. **Prose-first, 컴포넌트는 필요한 만큼만, Raw는 자유롭게.**
   - **본문이 중심입니다.** 일반 문단은 `Section`의 children으로 작성하며 글의 대부분을 차지해야 합니다.
   - **의미 컴포넌트는 해당 내용이 실제로 그 구조일 때만 강조 용도로 씁니다.** `Summary` / `Aside` / `Quote` / `Table` / `RiskList` / `Decision` 등이 해당합니다. 장식처럼 쌓지 마세요. 카드 더미는 글을 부자연스럽고 조각나 보이게 합니다. 판별 기준: 문장 / 목록 / 표 / Raw 블록 중 하나로 쓰면 더 나은가? 그렇다면 해당 형식을 씁니다.
   - **반대로 `Raw`는 적극 활용합니다.** 인터랙션, 애니메이션, 사용자 지정 시각화, 새로운 타이포그래피 등 Markdown으로 할 수 없는 요소가 글을 단순히 “읽을 수 있는 것”에서 “읽을 가치가 있는 것”으로 바꿉니다. Raw는 읽기를 방해하지 않고 밀도 높은 텍스트에 리듬과 호흡을 더합니다.
2. **레이아웃이 아니라 의미를 표현합니다.** “이것은 인사이트 / 위험 / 결정이다”라고 설명하고 “파란 카드, 여백 24px”라고 하지 않습니다.
3. **Props는 규약입니다.** 필수 필드는 채우고 실제로 해당 사항이 없으면 비워 둡니다. 컴포넌트가 `⚠ 未指定xxx`를 명시적으로 표시해 누락을 드러냅니다. **누락을 감추려고 내용을 꾸며내지 않습니다.**
4. **스타일은 테마에서 정하고 직접 작성하지 않습니다.** 작성자는 `ThemeProvider`로 테마 하나를 선택하고 컴포넌트 스타일을 직접 지정하지 않습니다.
5. **항상 `<ThemeProvider theme="...">`로 `<Article>`을 감쌉니다.**
6. **레이아웃과 테마를 분리합니다.** `Article`의 `width`(`narrow` / `regular` / `wide` / `full`, 기본 `regular`)로 본문 열 너비를 결정하고 `toc`(이 스킬에서는 기본 활성화)로 왼쪽 목차를 표시할지 정합니다. 둘 다 콘텐츠에 맞춰 결정하고 Plan Checkpoint에서 확인하며 **테마가 정하지 않습니다.** `references/layout.md` 참고.
7. **Section 하나당 파일 하나를 사용합니다.** 각 Section은 독립 컴포넌트(`article/sections/NN-*.tsx`)여야 합니다. 여러 Section을 컴포넌트 하나에 몰아 넣는 것은 **절대 허용하지 않습니다.** `Article.tsx`는 조립기(assembler) 역할만 합니다. 여러 Agent의 병렬 작업에 필요한 원칙입니다. 자세한 내용은 `references/section-build.md` 참고.

## 컴포넌트는 기본 핵심과 분야별 예외의 두 층으로 나뉩니다

**기본 핵심 컴포넌트(대부분 글은 이것들 + 본문 + Raw만으로 작성):**

- 구조: `Article`, `Hero`, `Lead`, `Section`, `Subsection`, `Conclusion`, `TOC`
- 의견: `Summary`, `Aside`, `Quote`
- 데이터: `Table`
- 기술: `CodeBlock`(코드는 **항상 이것만 사용**), `Formula`
- 미디어: `Image`
- 자유 레이어: `Raw`

**분야별 예외 컴포넌트(내용이 실제로 그 구조일 때만 선택적으로 사용. 유형상 해당한다는 이유만으로 전부 넣지 않음):**

- 의사 결정 / 검토: `RiskList`, `Decision`, `ActionList`, `Checkpoint`, `Tradeoff`, `Incident`
- 코드 리뷰: `DiffReview`
- 접이식 인터랙션: `Detail`, `Tabs`
- 리치 미디어: `Video`, `Audio`

> **작성자에게 공개하지 않을 항목:** `HighlightedCode`는 `CodeBlock`의 내부 구현입니다. 코드는 항상 `CodeBlock`으로 작성하며 `HighlightedCode`를 직접 쓰지 않습니다.

컴포넌트를 선택하기 전에 판별 기준(규칙 1)을 적용합니다. 본문 / 목록 / 표 / Raw가 더 적절하면 컴포넌트를 쓰기 위해 억지로 사용하지 않습니다. 분야별 예외 컴포넌트를 하나 더 쓸 때마다 “이 콘텐츠는 본질적으로 왜 이 구조인가?”에 답할 수 있어야 합니다.

전체 컴포넌트 API(prop와 사용법)는 라이브러리 자체의 reference인 `skill/references/{structure,insight,structured,decision,technical}.md`(reacticle-authoring skill)에 있습니다. 필요한 파일만 읽고 한꺼번에 모두 읽지 않습니다.

## 사용 원칙

- 본문이 중심입니다. 컴포넌트는 의미 표현용이지 장식이 아닙니다.
- Raw는 글의 표현 레이어이지 앱을 만드는 진입점이 아닙니다(범위는 `raw-policy.md` 참고).
- `Table`은 2차원 정보, `Image`는 실제 또는 생성형 이미지, `Raw`는 자유로운 웹 레이어(임의의 HTML / CSS / JS / React: 인터랙션, 사용자 지정 레이아웃과 타이포그래피, 모션, 삽입형 소형 도구, 필요한 경우 SVG / canvas 도식)를 담당합니다. SVG는 선택지 중 하나일 뿐 기본값이 아닙니다.
- **`Raw`와 `Image`는 직교하는 선택지이며 서로를 대체하지 않습니다.** `Raw`는 기본으로 항상 사용합니다. `Image`를 사용할지와 출처는 Plan Checkpoint의 이미지 전략에서 선택합니다(`references/asset-policy.md` 참고). 이미지 모드 `none`은 외부 이미지를 쓰지 않는다는 뜻이며 `Raw`에는 영향이 없습니다.

## 정보 밀도와 컴포넌트 / 시각 요소 비율

`information-density.md` 참고: 보존율 100%에서는 장문을 우선하고 Raw는 핵심 개념을 강조합니다. 밀도가 낮아질수록 시각 요소 비율은 올라가지만 **글의 형태를 유지해야 합니다.**

## 최소 구조(비율에 유의: 본문 다수 + 강조 컴포넌트 하나 + Raw 한 블록)

```tsx
import { ThemeProvider, Article, Hero, Lead, Section, Aside, Raw } from "reacticle";

export function Article_() {
  return (
    <ThemeProvider theme="tufte">
      <Article>
        <Hero title="标题" subtitle="副标题" meta={[{ label: "日期", value: "2026-06-08" }]} />
        <Lead>导语，框定主题。</Lead>
        <Section index="01" title="第一节">
          <p>正文段落用 children —— 这应是文章主体，尽量多写正文。</p>
          <p>再写一段，把背景、推理、结论用文字讲清楚。</p>
          <Aside tone="principle" label="核心判断">一句话的核心判断。</Aside>
          <Raw title="为本段现写的内联 SVG">
            <svg viewBox="0 0 240 60" width="100%">
              <polyline points="0,50 40,42 80,46 120,20 160,28 200,8 240,14"
                fill="none" stroke="var(--ra-color-accent)" strokeWidth="2" />
            </svg>
          </Raw>
        </Section>
      </Article>
    </ThemeProvider>
  );
}
```

