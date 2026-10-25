# 글 유형 라우팅

글 유형은 **구조 결정**, 테마는 **미적 결정**입니다(`theme-selection.md` 참고). 두 선택은 서로 완전히 독립적입니다.

**글 유형과 정보 보존 비율의 관계(중요):** 이론적으로 콘텐츠 보존은 별도 결정이지만 **실제로는 두 선택이 강하게 묶여 있습니다.** 각 글 유형에는 기본 정보 보존 비율이 정해져 있습니다(아래 표의 “권장 정보 보존” 열). `longform + 20%` / `tutorial + 20%` / `briefing + 100%`는 **가짜 선택지**입니다. 유형이 달라지거나(`briefing+100%`는 `full-report`에 가까움), 내용이 비게 됩니다(8개 장으로 나눈 `longform`에 장마다 2문단뿐인 경우). 따라서 Plan Checkpoint 1에서는 “보존 비율”을 “글 유형” 의미 선택에 포함해 받습니다(SKILL.md Phase 3 참고). 사용자가 명확히 정밀 편집을 원할 때만(예: “longform인데 60%만”) `plan.md`에 비표준 조합으로 적습니다.

Phase 2에서 유형을 정한 뒤 `article-types/<type>.md`를 읽어 구조 / 컴포넌트 / Raw 범위 / 이미지 성향 / 자체 점검 항목을 확인합니다. **비표준 조합**은 `plan/plan.md`의 Brief에 “기본값 X% → 사용자 재정의 Y%”를 함께 기록하고, 각 절을 작성할 때 본문과 시각 요소의 비율을 주 에이전트가 직접 조정해야 합니다(`article-types/<type>.md`의 기본 권고를 그대로 따르면 안 됨).

| 유형 | 권장 정보 보존 | 용도 | 일반적인 구조 | 세부 지침 |
| --- | --- | --- | --- | --- |
| `longform` | 100% | 완전한 장문, 아카이브, 심층 읽기 | Hero / Lead / Summary / 여러 Section / Raw 보강 / Conclusion | `article-types/longform.md` |
| `full-report` | 80% | 연구 보고서, 공식 분석 | 실행 요약 / 배경 / 근거 / 데이터 / 위험 / 결론 | `article-types/full-report.md` |
| `tutorial` | 80–100% | 교육, 단계별 절차, 시작 안내 | 목표 / 단계 / 예시 / 연습 / 요약 | `article-types/tutorial.md` |
| `explainer` | 80% | 기술, 시스템, 개념 설명 | 문제 / 메커니즘 / 도식 / 예시 / 흔한 오해 | `article-types/explainer.md` |
| `dialogue` | 80% | 대화 / Q&A / 인터뷰 / 팟캐스트 / AMA | Hero / 게스트 / 여러 주제의 Section / 핵심 의견 요약 | `article-types/dialogue.md` |
| `review` | 60–80% | PR / 계획 / 사고 / 디자인 검토 | 배경 / 발견 / 영향 / 권고 / 실행 항목 | `article-types/review.md` |
| `essay` | 60–80% | 의견, 논평, 서사 | 도입 / 주장 / 사례 / 전환 / 마무리 | `article-types/essay.md` |
| `briefing` | 40–60% | 바쁜 사람이 빠르게 판단 | 결론 우선 / 핵심 근거 / 상충 관계 / 다음 단계 | `article-types/briefing.md` |
| `interactive-explainer` | ~25%(원문 발췌 비율, **75%를 삭제한다는 뜻이 아님**) | **Raw 인터랙션을 주요 매체로 삼아 직접 다뤄서 배우는 페이지**(3blue1brown / distill.pub / ciechanow.ski 참고). 핵심은 **콘텐츠 재구성**이며 핵심 지식만 발췌하고 나머지는 새로 창작 | 지식 하나마다: 정의 / 인터랙티브 시연 / 직접 시도 / 이해 확인 | `article-types/interactive-explainer.md` |
| `visual-essay` | 20–60% | 전시, 공유, 이미지 중심 스토리텔링 | 짧은 문구 / 큰 시각 요소 / 강한 리듬 / 짧은 절 | `article-types/visual-essay.md` |

## 유형 선택 힌트

- 원본의 정보 밀도가 높고 전체를 보존해야 함 → `longform`.
- 원본이 소화된 보고서 / 공식 분석(실행 요약 + 데이터 + 위험 + 권고)임 → `full-report`.
- 메커니즘 / 개념을 명확하게 설명해야 함(본문이 중심) → `explainer`.
- 독자가 개념을 **직접 다뤄 이해하도록** 함(Raw 인터랙션이 중심이고 본문은 보조, 지식마다 시연 포함) → `interactive-explainer`.
- 대화 / Q&A / 인터뷰 / 팟캐스트 녹취 / AMA → `dialogue`.
- 구체적인 **엔지니어링** PR / 계획 / 사고 / 디자인을 검토 → `review`.
- 의사 결정자가 빠르게 판단 → `briefing`.
- 의견, 논평, 제품 / 책 / 논문 리뷰 → `essay`.
- 독자가 따라 하며 익혀야 함(단계별로 완료) → `tutorial`.
- 공유 / 전시, 이미지 중심 → `visual-essay`.

유형은 **구조의 경향**만 정하며 정보 밀도와 테마를 고정하지 않습니다. 사용자는 Plan Checkpoint에서 재정의할 수 있습니다.
