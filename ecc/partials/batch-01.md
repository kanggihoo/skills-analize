# batch-01

### continuous-learning-v2

- **한 줄 요약**: PreToolUse/PostToolUse hook으로 세션을 관찰해 신뢰도 점수가 붙은 원자적 "instinct"를 만들고, 이를 skill/command/agent로 진화시키는 학습 시스템.
- **설명**: observe.sh hook이 프롬프트와 tool 호출을 프로젝트별 `observations.jsonl`에 기록하고, 백그라운드 observer agent(Haiku)가 이를 분석한다. 사용자 교정, 에러 해결, 반복 워크플로우를 패턴으로 잡아 trigger/action/evidence/confidence(0.3~0.9)를 가진 instinct 파일을 만든다. 프로젝트 단위로 격리 저장하며 2개 이상 프로젝트에서 평균 신뢰도 0.8 이상이면 global로 승격한다. `/instinct-status`, `/evolve`, `/promote`, `/instinct-export`, `/instinct-import`, `/projects` 명령으로 관리하고, `/evolve`는 instinct를 클러스터링해 skill/command/agent로 만든다.
- **분류**: 메모리 / 학습 / 관측 hook
- **관련도**: High
- **관련 축**: L, F, I
- **판단 근거**: 핵심 목적이 hook 기반 세션 관찰 기록(observations.jsonl)과 그로부터 학습된 규칙(instinct)의 축적이다. 본문 "Why Hooks vs Skills" 절은 skill은 확률적으로 50~80%만 발동하지만 hook은 100% 결정적이라 관찰에 hook을 쓴다고 명시한다. 신뢰도 구간별 적용 방식(0.3 제안만, 0.7 자동 적용)과 승격 기준도 구체적이다.
- **관심 포인트**: 확률적 skill 대신 결정적 hook으로 기록을 보장하는 설계, 신뢰도 점수(교정 시 하락, 반복 관찰 시 상승)와 임계값별 적용 강도, 프로젝트 스코프 격리와 승격 기준(2+ 프로젝트, 평균 0.8), 사용자 교정을 학습 신호로 쓰는 방식. 보조 파일에서는 hook 단계의 secret 정규식 scrub, 30일 자동 purge, `disabled` 파일 kill switch, observer 기본 비활성, session-guardian.sh(활성 시간대, 프로젝트별 cooldown, idle 검사)로 백그라운드 agent를 제어하는 안전장치가 있다. 한계로 자동 생성 instinct에 사람 검토 단계가 약하고(0.7 자동 승인), SKILL.md가 이를 명시적 게이트로 다루지는 않는다.
- **확신도**: 높음
