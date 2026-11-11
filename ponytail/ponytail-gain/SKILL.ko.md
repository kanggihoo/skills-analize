---
name: ponytail-gain
description: >
  벤치마크로 측정한 ponytail의 절감 효과(코드, 비용, 속도)를 보여 줍니다. 한 번 실행하는 표시 명령입니다. /ponytail-gain, "what does ponytail save", "ponytail impact"에 씁니다.
---

> 원본: `SKILL.md`. 프런트매터 키와 트리거 문구, 명령어, 출력 카드는 원문 그대로 둡니다.

# Ponytail Gain

호출되면 이 점수표를 보여 줍니다. 한 번 실행하는 명령이므로 모드를 바꾸거나, 플래그 파일을 쓰거나, 아무것도 저장하지 않습니다.

수치는 Ponytail 5의 공개된 agentic 벤치마크 결과입니다. headless Claude Code(Opus 5.5, 기본 effort)가 39개 작업을 수행했습니다. 작업은 실제 FastAPI + React 저장소의 기능 티켓, 버그 수정, 보안과 개인정보 사례, 작은 앱으로 구성됩니다. 작업마다 5번씩 실행했고, 같은 에이전트에서 스킬을 쓰지 않은 경우와 비교했습니다. 작업 중 18개에는 정확성과 안전성을 확인하는 숨은 검사(hidden check)가 있습니다. 각 수치는 작업별 중앙값의 기하평균입니다. 현재 저장소에서 계산한 값이 아니라 측정한 값입니다.
출처: `benchmarks/results/2026-10-07-agentic.md`와 README.

## 점수표

일반 ASCII 막대를 그립니다. 막대 길이는 스킬을 쓰지 않은 기준선 대비 ponytail의 비율을 보여 주고, 정확한 수치는 라벨에 적습니다.

```
  ponytail gain           benchmark · 39 tasks × 5 runs · Opus 5.5

  no-skill        ████████████████████  100%
  Lines of code   █████████···········   47%   ▼ 53%
  Output tokens   ███████████·········   55%   ▼ 45%
  Cost            ███████████████·····   74%   ▼ 26%
  Time            ████████████········   59%   ▼ 41%
  Hidden checks passed   97%  (no-skill 96%)
  Tests where the logic needs one   98%  (no-skill 68%)

  This repo:  /ponytail-debt  (shortcuts you deferred)
              /ponytail-audit (what's still cuttable)
```

## 정직성의 경계

이 수치는 벤치마크 평균이며, 이 저장소의 값이 아닙니다. 저장소별 절감량(예: "여기서 X줄, X 토큰을 아꼈습니다")은 절대 출력하지 않습니다. 만들지 않은 버전은 실제로 작성된 적이 없으므로, 실제 저장소에서는 뺄 기준선이 없습니다. 저장소별로 실제 수치를 얻는 곳은 `/ponytail-debt`(세어 둔 장부)뿐이며, 이 카드는 그 명령을 가리키고 수치를 지어내지 않습니다.

## 경계

한 번 실행하는 표시입니다. 아무것도 편집하지 않고, 모드를 바꾸지 않습니다.
