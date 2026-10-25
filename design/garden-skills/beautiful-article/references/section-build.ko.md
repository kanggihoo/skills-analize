# Section 구축과 다중 Agent 병렬 작업

## 절대 규칙: Section 하나는 컴포넌트 파일 하나

각 Section은 **반드시** 독립 컴포넌트 파일이어야 합니다. 하나의 컴포넌트에 여러 Section을 직접 작성하는 것은 **절대 허용되지 않습니다.**

```text
article/
  Article.tsx          # assembler（主 Agent 拥有）：import + 排序各 Section
  sections/
    01-opening.tsx     # export function SectionOpening() { return <Section .../> }
    02-context.tsx
    03-mechanism.tsx
  raw-blocks/
    01-token-flow.tsx  # 大型 / 复用的 Raw 隔离到这里，被对应 section import
```

- 각 `sections/NN-*.tsx` 파일은 컴포넌트 하나를 export하고 내부에서 `<Section index="NN" title="...">…</Section>`을 사용합니다.
- `Article.tsx`는 조립만 담당합니다.

  ```tsx
  import { Article, Hero, Lead, Conclusion } from "reacticle";
  import { SectionOpening } from "./sections/01-opening";
  import { SectionContext } from "./sections/02-context";
  export function ArticleDoc() {
    return (
      <Article toc width="regular">
        <Hero ... /><Lead>…</Lead>
        <SectionOpening />
        <SectionContext />
        <Conclusion>…</Conclusion>
      </Article>
    );
  }
  ```

- 파일 단위로 분리하고 reacticle에 맨 CSS가 없으므로(스타일은 전부 테마 토큰 사용) 여러 Agent가 각자 다른 Section 파일을 수정해도 **서로 덮어쓰지 않습니다.**

## 장 번호는 주 Agent가 일괄 부여(번호 오류 방지)

`Section` / `Subsection`의 `index`는 **직접 지정하는 문자열**입니다. 컴포넌트가 자동으로 번호를 만들거나 검사하지 않고 그대로 표시합니다. 따라서 Section 파일에서 번호를 잘못 쓰면(병렬 작업에서 하위 에이전트가 전체 문서 위치를 모른 채 8장 아래에 “5.1”을 붙이는 경우 등) 오류가 그대로 결과물에 들어갑니다. 규칙은 다음과 같습니다.

- **전체 번호는 주 Agent(assembler)가 관리합니다.** `Article.tsx`에서 최종 순서를 정한 뒤, 각 `Section`의 `index`를 `01 / 02 / 03 …` 형식에 맞춰 조정합니다. 각 `Subsection` 접두사도 부모 `Section`에 맞춥니다(08장 아래에는 `8.1 / 8.2 …`만 허용).
- **하위 에이전트는 전체 번호를 임의로 정하지 않습니다.** 주 Agent가 작업을 할당할 때 “전체 문서의 `<NN>`장”이라고 알려 줍니다. 하위 에이전트는 이 `<NN>`으로 `Section index`와 본 절 `Subsection` 접두사를 작성합니다. 확실하지 않으면 Outline에 적힌 자리표시자를 유지하고 주 Agent가 마지막으로 통일합니다.
- **조립한 뒤 반드시 검증합니다.** TOC 표시와 `outline.md` 순서를 비교해 번호가 이어지고, 하위 절 접두사가 맞는지 확인합니다. 최종 기술 검토의 “전체 장 번호 일관성” 항목에 포함합니다.

## 개발 모드 두 가지(Checkpoint 2에서 사용자 선택)

어느 모드든 첫 Section은 **주 Agent가 직접 완성하고 검토**합니다(스타일 기준점 역할). 두 번째 Section부터 차이가 생깁니다.

### A · 단일 Agent 순차 작업(기본값, 가장 안정적)

주 Agent가 `02 → 03 → …` 순서로 작성합니다. 스타일 일관성이 가장 높고 수시로 확인할 수 있습니다.

### B · 여러 Agent 병렬 작업(가장 빠름)

하위 에이전트마다 `sections/NN-*.tsx` **파일 하나를 담당**해 병렬로 개발합니다. **주 Agent가 병합과 안정성을 책임집니다.**

- `Article.tsx`의 import와 Section 순서를 관리합니다(유일한 조립 지점으로 충돌 방지). 최종 순서에 따라 모든 Section `index`와 Subsection 접두사를 **통일해서 조정합니다**(위의 “장 번호는 주 Agent가 일괄 부여” 참고).
- 병렬 작업 라운드가 끝날 때마다 `npm run typecheck` + `npm run build`를 실행하고 빌드 오류를 고칩니다.
- 테마와 스타일을 일치시킵니다(색상 / 글꼴 / 간격은 토큰 사용, 분위기를 벗어나지 않도록 함).
- 인접 Section 사이에서 논점이 이어지는지 중복되거나 끊기는 부분을 해결합니다.

병렬 모드에서는 스타일이 약간 달라질 수 있습니다(예상된 현상이며 테마 토큰이 전체적인 시각 일관성을 보완합니다).

### 병렬 하위 에이전트 prompt에 반드시 포함할 내용

```text
你负责文件 article/sections/<NN>-<id>.tsx，只改这一个文件，导出一个 Section 组件。
你是全篇第 <NN> 章（这个编号由主 Agent 指定，你看不到自己在全篇的位置，不要自己另编）。
读取：plan/plan.md 的 Outline 段本节段落 + Brief 段（信息保留比例）+
      source/source.md 本节对应内容 + 选定主题 theme-profiles/<id>.md +
      references/component-policy.md + references/raw-policy.md +
      第一个 section 文件作为“代码风格”参考（不是抄袭对象）。
硬规则：
- 一个文件 = 一个 Section 组件；不要碰 Article.tsx 或别的 section 文件。
- 正文为主体，组件按需（默认核心组件优先），Raw 用 --ra-* token 现写。
- 符合本节 outline 任务与信息保留比例；与前后节衔接。
- 序号：<Section index="<NN>">；本节所有 <Subsection> 的序号前缀必须等于 <NN>
  （如 <NN>=08 则小节是 8.1 / 8.2 …），不要从别的章节复制序号。
- 完工自检对照 references/review-checklist.md 的 Section 清单。
不要修改 Article.tsx（主 Agent 统一组装与序号校准），不要改主题。
```

## 각 Section 완료 시(필수 품질 검사 · 하위 에이전트 · 메시지로 반환)

엄격한 품질 검사 규칙에 따라 **Section Reviewer** 하위 에이전트를 생성해 다음을 확인합니다. Outline 작업 완료 / 정보 보존 비율 준수 / 앞뒤 절과 연결 / 컴포넌트 남용 없음 / 본문 충분 / Raw와 이미지의 목적이 분명함 / **절 번호 일관성**(`Section index`는 `<NN>`, 모든 `Subsection` 접두사도 `<NN>`과 일치).

**하위 에이전트는 pass/fail과 수정 항목을 메시지로 반환합니다**(pass면 한 줄이면 충분하고, fail이면 수정할 점을 나열). `review/section-NN-review.md` 파일은 **작성하지 않습니다.** 주 Agent는 fail 항목을 해당 Section 파일에서 직접 수정한 뒤 절 완료를 보고합니다. 전체 prompt 템플릿은 `references/review-checklist.md`의 Section 절에 있습니다.
