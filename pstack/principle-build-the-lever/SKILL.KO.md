---
name: principle-build-the-lever
description: "Apply to any non-trivial work, not just bulk work: edits, migrations, analyses, checks. Build the tool that does it or proves it (codemod, script, generator, or a skill your subagents follow) instead of working by hand. The tool is the artifact a reviewer can rerun."
disable-model-invocation: true
---
# 지렛대 만들기

작업이 사소하지 않다면, 손으로 하는 대신 그 일을 해 주는 도구를 만들어라.

**이유:** 여기에는 두 가지 이득이 있다. 처리량: 코드모드, 생성기, 스크립트는 매번 같은 방식으로 일을 하고, 다시 실행하는 데 비용이 들지 않는다. 신뢰도: 도구는 리뷰어가 읽고 다시 실행해 작업을 검증할 수 있는 하나의 산출물이다. 손으로 한 변경은 다시 해 보는 것 말고는 재검증할 방법이 없다. 결정적인 스크립트는 "나를 믿어라"를 "이걸 실행해 보라"로 바꿔 준다.

**패턴:** 기본값은 지렛대를 만드는 것이다. 작업이 사소할 때, 즉 한눈에 보이는 몇 가지 명백한 편집일 때만 건너뛴다.

- 첫 번째 단위는 손으로 해서 레시피를 익힌 다음 도구를 만든다. 그 단위에서 도구를 다시 실행하고 손으로 한 버전과 diff를 비교해 증명한다. 지렛대는 다시 실행해도 안전하도록 만든다.
- 편집에는 코드모드나 스크립트, 반복되는 파일에는 생성기, 분석에는 sqlite 덤프 쿼리, 검증에는 다시 실행 가능한 점검 도구를 쓴다.
- 결정적인 지렛대는 팬아웃을 이긴다. 도구 하나가 한 번에 모든 단위를 처리할 수 있다면 직접 실행하라. 스크립트로 할 수 있는 일을 손으로 적용하라고 위임자(delegate)들에게 팬아웃하지 마라.
- 하위 에이전트에게 작업을 팬아웃할 때는, 레시피, 검증 계약, 건드리면 안 되는 경계를 하나의 산출물에 담은 스킬로 지렛대를 작성해 모두가 읽게 하라. 위임자들이 계약을 몰래 고칠 수 없도록 그 파일은 위임자들의 쓰기 범위 밖에 둬라.
- 이 원칙을 적용하면 파일이 하나 생긴다. 이 원칙을 인용했는데 diff에 코드모드, 스크립트, 생성기, 위임자용 스킬 중 어느 것도 없다면, 적용하지 않은 것이다.
- 작업이 세션을 넘어 살아남을 때는 지렛대를 커밋하라.

**균형:** 기준은 반복 여부가 아니라 사소함이다. 일회성 작업이라도, 지렛대가 있어야 결과를 검증할 수 있다면 지렛대를 만들 가치가 있다. [Laziness Protocol](../principle-laziness-protocol/SKILL.md)에 따라, 작업을 하거나 증명하는 가장 작은 스크립트를 만들고, 프레임워크는 절대 만들지 마라.

이 원칙은 [Encode Lessons in Structure](../principle-encode-lessons-in-structure/SKILL.md)와 구별된다. 그쪽은 반복되는 지시를 지속 가능한 가드레일로 만드는 것이고, 이 원칙은 눈앞의 작업에 대한 처리량과 검토 가능성을 다룬다. 검증 자체를 스크립트로 만드는 방법은 [Prove It Works](../principle-prove-it-works/SKILL.md)를 보라.
