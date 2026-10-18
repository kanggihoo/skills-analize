---
name: principle-attack-the-premise
description: "Apply when two or more fixes that share one premise have failed the same gate. Take a census of which actors hold the imbalance before the next fix, then question the premise instead of writing another fix that assumes it."
disable-model-invocation: true
---

# 전제 공격하기

하나의 전제를 공유한 둘 이상의 수정이 같은 게이트에서 실패했다면, 수정들이 아니라 전제를 의심하라.

**이유:** 공유된 전제 아래서 생긴 실패 하나하나가 그 전제에 대한 증거다.

**패턴:**
- **전제를 적어 둔다.** 전제는 실패한 모든 수정이 가정했던 하나의 문장이다.
- **다음 수정 전에 전수 조사(census)를 한다.** 행위자별로 불균형을 센다. 전수 조사는 불균형이 얼마나 큰지가 아니라 어떤 행위자가 불균형을 떠안고 있는지를 보여 준다. 전수 조사는 [Build the Lever](../principle-build-the-lever/SKILL.md)에 따라 다시 실행할 수 있는 스크립트로 작성한다.
- **편향을 읽는다.** 매 실행마다 같은 소수의 행위자가 불균형의 대부분을 떠안는다면, 무언가가 그들에게 그 역할을 배정하고 있는 것이다. 그 배정을 하는 것이 무엇인지 찾아라. 그 배정이 [Fix Root Causes](../principle-fix-root-causes/SKILL.md)에서 말하는 다음 "왜"다.
- **비대칭을 보정하지 말고 제거한다.** [Laziness Protocol](../principle-laziness-protocol/SKILL.md)에 따라, 어떤 행위자도 매 실행마다 그 역할을 맡지 않도록 역할을 순환시키거나, 배정을 무작위화하거나, 역할을 옮겨라. 되돌아오는 경로, 공유 풀, 일괄 인계, 주기적 재조정은 배정을 그대로 두면서 매 실행마다 작업만 늘린다.

**중단 조건:**
- 전제가 적히고 전수 조사가 존재하기 전에는 다음 수정을 시작하지 마라.
- 전수 조사가 행위자들 사이에서 고르게 나온다면, 전제는 원인이 아니다. 원인을 다른 곳에서 찾고, 전수 조사는 증거로 남겨 두어라.

이 원칙은 [Redesign from First Principles](../principle-redesign-from-first-principles/SKILL.md)와 구별된다. 그쪽은 새로운 요구사항을 중심으로 설계를 다시 짜는 것이고, 이 원칙은 현재 설계가 전제하고 있는 사실 하나를 의심하는 것이다.
