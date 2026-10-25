# 하네스 관점

이 Skill의 핵심은 “프롬프트”가 아니라 작은 하네스입니다. 하네스가 답해야 할 질문은 여섯 가지입니다.

| 하네스 구성 요소 | 이 Skill이 해결하는 질문 | 설계 방식 |
| --- | --- | --- |
| 맥락 관리 | 모델이 실제로 본 정보는 무엇인가? | 원본 자료를 `source.md`로 통일하고 단계에 따라 reference를 읽음 |
| 도구 시스템 | 어떤 입력 / 출력을 처리할 수 있는가? | URL / PDF / DOCX / Markdown / 스크린샷 / 이미지 에셋 / 로컬 빌드 / 브라우저 검사 |
| 실행 조율 | 다음에는 무엇을 해야 하는가? | Phase, 체크포인트, 첫 화면 샘플, 전체 생성, 승인과 수정 |
| 상태와 기억 | 단계 간 결정을 어떻게 유지하는가? | `source.md`, `plan/plan.md`(Brief/Outline/Theme/Assets 네 부분을 한 파일로 통합), `review/first-spread-review.md`, `review/final-review.md` |
| 평가와 관찰 | 글이 좋은지 어떻게 판단하는가? | Plan은 주 Agent가 인라인 자체 점검; First Spread / Final은 하위 Agent가 파일에 기록; Section은 하위 Agent가 수행하고 메시지로 반환 |
| 제약과 복구 | 작업이 방향을 벗어나면 어떻게 고치는가? | 최소 범위만 수정하며 글 전체를 무작정 다시 쓰지 않음 |

## 상태 파일은 장기 기억입니다

Agent가 핵심 결정을 대화 맥락에 **의존해 기억해서는 안 됩니다.** 여러 단계에 걸친 결정은 다음 파일에 기록합니다. 이전보다 약 5개 파일을 줄였습니다.

```text
source/source.md             # 统一后的源材料（原始语言，事实底座）
source/source.<lang>.md      # 仅当需翻译：地道翻译版，作为后续编写的事实底座
source/extraction-notes.md   # 抽取风险 / 丢失 / 待补充 / 语言与翻译说明
plan/plan.md                 # 唯一规划文件：Brief / Outline / Theme / Assets 四段合一
review/first-spread-review.md  # First Spread SubAgent 结论（首屏验收依据）
review/final-review.md         # 终审三视角结论（交付物的一部分）
review/source-review.md        # 仅复杂/低置信源时
review/repair-log.md           # 仅有修复时
```



긴 대화에서 확인된 결정이 불확실하면 **이 파일들을 다시 읽습니다.** 기억에 의존해 다시 만들어 내지 않습니다.

## 한 문장 소개

> Beautiful Article은 자료를 편집해 아름다운 웹 글로 만듭니다. 가장 먼저 **글**이어야 하며,
> 웹 앱이 아닙니다. 인터랙션, Raw, 이미지는 모두 읽기를 돕습니다.
