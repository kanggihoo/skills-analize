# Reporting skills

AI가 진행한 작업의 결과를 사람이 이해하고 믿을 수 있게 보고하는 데 쓰는 스킬 모음입니다. 원본 위치에서 복사했으며, 원본은 그대로 남아 있습니다.

## 구성

| 그룹 | 스킬 | 하는 일 | 원본 |
|---|---|---|---|
| 기록 | `pstack/show-me-your-work` | 결정마다 TSV 한 줄(무엇, 왜, 증거, 결과)로 남기고, 끝날 때 대화 기록과 대조한 뒤 다른 모델이 검토해 "Attention" 섹션을 붙입니다 | `pstack/show-me-your-work` |
| 검증 | `ecc/verification-loop` | 빌드, 타입, 린트, 테스트, 보안 grep, diff를 확인하고 PASS/FAIL 보고서를 냅니다 | `ecc/verification-loop` |
| 검증 | `pstack/principle-prove-it-works` | "완료" 전에 컴파일 여부나 자기 보고가 아닌 실제 결과물로 확인합니다 | `pstack/principle-prove-it-works` |
| 검증 | `pstack/principle-explain-the-number` | 측정한 숫자를 보고하기 전에 제한 요인을 찾고, 다른 것을 잰 것은 아닌지 배제합니다 | `pstack/principle-explain-the-number` |
| 검증 | `pstack/benchmark-checklist` | 성능 측정을 7개 질문으로 점검하고, 판정을 먼저 쓰는 보고 형식을 정합니다 | `pstack/benchmark-checklist` |
| 글쓰기 | `pstack/unslop` | AI 말투(어휘, 서식, 챗봇 문구, 추상 은유)를 걷어냅니다 | `pstack/unslop` |
| 글쓰기 | `pstack/technical-writing` | Diátaxis, Google 스타일, STE, Global English 4개 층의 문서 기준입니다. PR 설명은 1분 브리핑으로 씁니다 | `pstack/technical-writing` |
| 글쓰기 | `deepseek-harness/dsh-prose-standard` | 줄이되 명제(행위자, 조건, must/never, 예외, 실패)는 보존합니다. 바꾼 것, 남긴 것, 보류한 것, 실행한 검사를 보고합니다 | `deepseek-harness/dsh-prose-standard` |

## 함께 쓰는 순서

```
작업 중   → show-me-your-work 로 결정마다 한 줄 기록
작업 후   → verification-loop (빌드·테스트 PASS/FAIL)
           + principle-prove-it-works (실제 결과물로 확인)
           + principle-explain-the-number / benchmark-checklist (숫자가 있으면)
보고 작성 → technical-writing (구조·문장) + unslop (AI 말투 제거)
           + dsh-prose-standard 원칙 (줄이되 의미 보존)
```

스킬끼리 이미 서로를 참조합니다.

- `show-me-your-work`는 로그 문장에 `unslop`을 적용합니다.
- `principle-prove-it-works`는 증거를 `show-me-your-work`로 남깁니다.
- `principle-explain-the-number`의 실제 절차는 `benchmark-checklist`입니다.
- `technical-writing`은 말투 규칙을 `unslop`에 맡깁니다.

## 주의할 점

- pstack 스킬 6개는 `disable-model-invocation: true`라 자동으로 실행되지 않습니다. `/show-me-your-work`처럼 직접 호출해야 합니다.
- `dsh-prose-standard`는 deepseek-harness 저장소 전용입니다. `vendor/` 제외 규칙, `../dsh-doc`, `../dsh-trim-cot-leakage`, `../../../docs/AGENTS.md` 링크는 이 디렉토리에서 깨져 있습니다. 다른 곳에서는 "명제 보존"과 "보고 항목" 원칙만 가져다 쓰세요.
- `verification-loop`의 명령어는 JS/TS와 Python 기준이고, 보안 검사는 grep 수준입니다.
- `show-me-your-work`의 transcript 대조는 Cursor의 `agent-transcripts/` 경로를 전제로 합니다.
- 일부 스킬에는 한국어 번역본 `SKILL.KO.md`가 함께 들어 있습니다.
