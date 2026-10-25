# 검토 체크리스트와 Reviewer

> 이 파일의 핵심 목적: **각 단계가 올바른 일을 올바른 방식으로 하게 하는 것**입니다. 하위 에이전트를 불필요하게 만들거나 잘못된 파일에 쓰는 일을 막습니다. 불필요한 하위 에이전트 실행 / 잘못된 review 파일 작성이 우선 해결할 성능 문제입니다. 전체 규칙은 SKILL.md의 “엄격한 품질 검증 프로토콜” 절을 참고하세요.

## 단계별 품질 검사 방식(엄격한 규칙)

| 단계 | 품질 검사 방법 | 산출물 |
| --- | --- | --- |
| **Phase 1 Source(기본)** | 주 Agent가 체크리스트 5개를 인라인으로 확인(`source-to-markdown.md` 참고) | 파일 없음 |
| Phase 1 Source(복잡하거나 신뢰도 낮은 원본만) | Source Reviewer 하위 에이전트(`original.*` diff 대조) | `review/source-review.md` |
| **Phase 2 Plan / Checkpoint 1 전** | **주 Agent 인라인 자체 점검(하위 에이전트 금지)** | **파일 없음** |
| **Phase 4 First Spread / Checkpoint 2 전** | First Spread Reviewer 하위 에이전트 | `review/first-spread-review.md` |
| **Phase 5 각 Section** | Section Reviewer 하위 에이전트 | **메시지로 pass/fail + 수정 항목 반환, 파일 작성 금지** |
| **Phase 6 최종 검토 / Checkpoint 3 전** | Editorial + Visual + Technical Reviewer 하위 에이전트 | `review/final-review.md` |

검토 결과를 받으면 **먼저 fail 항목에 맞춰 결과물을 수정하고 사용자에게 보고합니다.** 결과만 받고 수정하지 않은 채 보고하면 규칙 위반입니다.

---

## Plan 자체 점검(Phase 2 → Checkpoint 1 · 주 Agent 인라인 · 5개 항목)

`plan/plan.md` 작성 직후 이 자리에서 다섯 항목을 확인하고 결론에 따라 `plan/plan.md` 자체를 고칩니다(새 파일 작성 금지).

1. **Brief / Outline 일관성:** 정보 보존 비율이 각 절의 “보존할 정보”와 맞아야 합니다. Outline에 Brief에서 약속하지 않은 내용을 몰래 넣거나 Brief의 필수 내용을 빠뜨리지 않습니다.
2. **정보 취사선택에 근거가 있음:** “삭제 가능” 항목마다 이유(중복 / 곁가지 / 오래된 내용)가 있어야 합니다. “반드시 보존” 항목은 각각 `source.md`의 구체적인 문단 / 표 / 코드 위치를 가리켜야 합니다.
3. **컴포넌트 과잉 사용 없음:** 각 절의 “필요한 컴포넌트”에 모든 내용을 Aside / Quote / Table로 감싸지 않습니다. 본문이 중심이어야 합니다(prose-first, `component-policy.md` 참고).
4. **Raw / 이미지의 목적이 분명함:** Outline에서 “Raw 필요” 또는 “Image 필요”로 표시한 곳은 각각 어떤 논점 / 표현을 돕는지 한 문장으로 설명할 수 있어야 합니다. 장식만을 위한 요소는 없어야 합니다.
5. **섹션 번호가 타당함:** Outline 섹션 번호는 연속적이고 단조롭게 증가합니다(01 / 02 / 03 …). 하위 절 번호는 부모 섹션 접두사와 일치해야 합니다(08장 아래는 8.1 / 8.2만 허용, 5.1 금지).

> 이 단계에서는 **절대로 하위 에이전트를 실행하지 않습니다.** 내용이 적고 맥락이 이미 있으므로 하위 에이전트의 별도 초기화가 오히려 느립니다.

---

## First Spread 자체 점검(Phase 4 → Checkpoint 2 전 · 하위 에이전트)

하위 에이전트는 `article/Article.tsx`, `article/sections/01-*.tsx`, 표지가 있다면 `article/Cover.tsx`, `plan/plan.md`, 선택한 테마 `theme-profiles/<id>.md`를 읽고 체크리스트를 확인한 뒤 `review/first-spread-review.md`에 기록합니다.

- **표지**(켜져 있으면 `cover.md`의 5개 자체 점검 참고): 텍스트와 이미지가 함께 있음, 테마를 따름(`--ra-*` 토큰만 사용), 콘텐츠와 일치(표지 비주얼이 본문 주제와 관련 있음), 비율에 적응(화면 3:4 + PDF 첫 페이지 단독 사용 시 어긋나지 않음), Hero 문구를 반복하지 않음.
- 첫 화면이 랜딩 페이지가 아니라 글처럼 보이는가? 독자가 무엇을 설명할지 바로 파악할 수 있는가?
- 첫 Section에 읽는 리듬이 있는가? Raw는 이해를 돕는가? 이미지는 표현을 뒷받침하는가? 모바일에서 읽을 수 있는가?
- 테마의 분위기가 맞는가? 레이아웃 너비가 적절한가?
- 빌드가 성공하는가(`npm run dev` 오류 없음), 브라우저 콘솔에 오류가 없는가?

prompt 템플릿:

```text
请作为 First Spread Reviewer。读取 article/Cover.tsx（若有）、article/Article.tsx、
article/sections/01-*.tsx、plan/plan.md、theme-profiles/<id>.md、references/cover.md
（若有封面），对照 First Spread 自检清单逐项核查。把结论写进
review/first-spread-review.md（pass / fail + 证据 + 必须修复项 + 改写建议）。
不要替我改文件，也不要泛泛夸奖。
```


주 Agent는 결과를 받은 뒤 **fail 항목을 먼저 수정한 다음** Checkpoint 2로 이동합니다.

---

## Section 자체 점검(Phase 5 각 Section · 하위 에이전트 · 메시지 반환)

하위 에이전트는 담당한 `sections/<NN>-*.tsx`, `plan/plan.md`의 해당 절, `source/source.md`의 관련 원문을 읽고 체크리스트에 따라 확인한 뒤 **메시지로 결과를 반환합니다.**

- 해당 절이 Outline 작업을 완료했는가?
- Brief의 정보 보존 비율과 필수 보존 정보에 맞는가?
- 앞뒤 절과 자연스럽게 연결되며 반복이나 모순은 없는가?
- 컴포넌트를 지나치게 많이 쓰지 않았는가? 본문이 충분한가?
- Raw와 이미지의 목적이 분명한가?
- **절 번호가 일관되는가:** `Section index`가 주 Agent가 지정한 `<NN>`과 같고 각 `Subsection` 접두사도 `<NN>`과 일치하는가(예: `<NN>=08`이면 하위 절은 8.1 / 8.2, **5.1은 금지**)?

prompt 템플릿:

```text
请作为 Section Reviewer。读取 article/sections/<NN>-*.tsx、plan/plan.md 本节段落、
source/source.md 本节对应内容、theme-profiles/<id>.md。
对照 Section 自检清单逐项核查，**直接以消息形式返回**：
- 第一行：pass / fail
- 若 fail：列出修复点（带行号 / 代码片段证据）
不要写任何 review 文件。不要替我改文件。不要泛泛夸奖。
```


주 Agent는 fail 항목을 받은 뒤 **해당 section 파일만 직접 수정**하고 그 절의 결과를 보고합니다.

---

## Phase 6 최종 검토 — 세 관점(하위 에이전트 · `review/final-review.md`에 작성)

**Editorial Reviewer**(글의 성격, 정보 취사선택, 구조)

- 웹 앱이 아니라 여전히 글인가?
- Brief의 정보 보존 비율을 지켰고 반드시 남길 내용이 모두 있는가?
- 전체 언어가 Brief의 목표 언어를 따르는가? 자연스럽고 번역투가 없으며 원문 언어가 남지 않았는가(캡션 / 인용 / 용어 포함)?
- 내용이 빈 제목, 카드 과잉, 과도한 요약 없이 구성됐는가?

**Visual Reviewer**(테마, Raw, 이미지, 모바일)

- 테마 분위기가 일관되는가? Raw에 임의 스타일이 없는가(모두 `--ra-*` 토큰 사용)?
- 이미지가 테마와 맥락에 맞고 본문을 압도하지 않으며 Raw와 중복되지 않는가?
- 눈에 띄는 AI 냄새(장식용 비주얼, 보라·분홍 그라데이션, 둥근 컬러 카드, 가짜 일러스트, 이모지 장식)가 없는가?
- 데스크톱과 모바일 모두에서 읽을 수 있고 텍스트 넘침 / 가림 / 비정상적으로 빈 영역이 없는가?

**Technical Reviewer**(빌드, 콘솔, 코드 / 공식, 접근성, 번호)

- `npm run html`이 성공하고 `article/article.html`을 열고 공유할 수 있는가?
- 브라우저 콘솔에 오류가 없고 코드 / 공식 강조 스타일이 테마와 일치하는가?
- 이미지에 alt가 있고 링크가 동작하며 제목 위계가 올바른가?
- **전체 섹션 번호가 일관되는가**(`index`는 문자열을 직접 지정하며 컴포넌트가 자동 번호를 붙이거나 검증하지 않음):
  - `Section` 번호가 연속적으로 증가하는가(`01 / 02 / 03 …`), 누락 / 중복 / 순서 오류가 없는가?
  - 각 `Subsection` 접두사가 부모 `Section` 번호와 같은가? 08장 아래는 `8.1 / 8.2`여야 하며 **`5.1`은 절대 허용되지 않음**.
  - 번호가 화면에 렌더링된 번호(또는 TOC), 왼쪽 TOC, `plan/plan.md` Outline 순서 사이에서 일치하는가?
  - 각 `Section` / `Subsection`에서 렌더링된 번호와 TOC 번호를 하나씩 기록해 대조합니다. **코드 순서만 보지 않습니다.** 병렬 모드(개발 모드 B)의 하위 에이전트는 전체 구조를 모를 수 있어 여기서 번호 오류가 자주 납니다.

prompt 템플릿:

```text
请作为 <Editorial / Visual / Technical> Reviewer。读取 plan/plan.md、source/source.md、
article/Article.tsx 和所有 article/sections/*.tsx、theme-profiles/<id>.md。
对照本视角的终审清单逐项核查，把结论追加到 review/final-review.md 的
"<视角>"段（pass / fail + 证据 + 必须修复项 + 改写建议）。
不要替我改文件，不要泛泛夸奖。
```


세 관점은 하위 에이전트 세 개로 병렬 검토할 수 있습니다. 주 Agent는 결과를 모두 받은 뒤 fail 항목을 최소 단위로 수정합니다(`repair-policy.md` 참고).
