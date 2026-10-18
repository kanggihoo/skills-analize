---
name: principle-sequence-verifiable-units
description: "Apply to multi-step work (sweeps, migrations, runs of similar edits) and to how you stack commits and PRs. Break work into small units that each end in a verifiable state, check each before the next, and order delivery so the sequence proves itself to a reviewer."
disable-model-invocation: true
---

# 검증 가능한 단위로 작업 순서 정하기

작업을 작은 단위들의 순서로 배열한다. 각 단위는 확인 가능한 상태로 끝나야 하며, 현재 단위가 녹색이 되기 전에는 다음으로 넘어가지 않는다.

**이유:** 문제를 일으킨 단위에서 바로 잡힌 깨짐은 위치를 찾기 쉽고 비용이 적다. 배치가 끝난 뒤에야 잡힌 깨짐은 묻히고, 이미 깨진 기반 위에 더 많이 쌓은 뒤다. 같은 단위들을 리뷰어가 다시 재생할 수 있는 전달물로 정렬하면, "나를 믿어라"가 "빨갛게 됐다가 녹색이 되는 것을 지켜보라"로 바뀐다.

**실행.** 일괄 수정(sweep), 마이그레이션, 또는 비슷한 편집의 연속에서는 다음 변경을 시작하기 전에 각 변경을 검증한다. 각 단위는 전후가 맞물린 괄호 구조다: 알려진 정상 상태, 한 번의 변경, 검사 실행, 그다음 진행. 모든 검사가 실제 기준선에 대해 측정되도록 먼저 깨끗한 trunk에 리베이스한다. 레버(lever)가 편집을 수행하는 경우 단위별 검사는 거의 공짜다. 그래도 실행한다.

**전달.** 작업이 증명되는 순서로 커밋과 PR을 쌓는다. 전형적인 형태는 실패하는 테스트가 먼저 오고, 그 위에 수정이 오는 것이다. 다른 서사 순서로는 재구성 전의 제거, 처리 전의 기준선 캡처, 기능 전의 뼈대 등이 있다. 각 커밋은 독립적으로 반영될 수 있어야 하며, 그 순서 자체가 하나의 논증으로 읽혀야 한다.

이것은 **prove-it-works** 원칙 스킬의 순서 측면 보완이다. 그 스킬은 각 검사가 실제인지를 보장하고, **build-the-lever** 원칙 스킬은 단위별 검사를 저렴하게 만든다.
