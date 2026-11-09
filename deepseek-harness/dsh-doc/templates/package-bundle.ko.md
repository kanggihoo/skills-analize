# 템플릿: package-bundle

이 템플릿은 manifest에 `dsh.bundle.patch`를 선언한 패키지에 사용한다. 설치 가능한 profile layer다. 예: `packages/bundle/*`, `dsh-subagent-codex`, `dsh-subagent-claude-code`. `bundle/base` README 짝 파일이 실제 예시다.

Bundle README는 profile 설치 경로와 layer 의미를 먼저 설명한다. 구현 접기는 patch 문서를 설명한다. 이 패키지를 import할 라이브러리나 mount할 단일 plugin으로 소개하지 않는다.

## Frontmatter

```yaml
---
description: "What the bundle layer adds to a dsh --profile surface, for users composing or customizing a profile."
kind: "package-bundle"
---
```

## 골격

```markdown
# @deepseek-ai/dsh-<name>

English | [中文](README.zh.md)

## Summary

Three to five sentences and at most 100 `wc -w`-style words: what a profile gains from this layer, which profiles already include it, how a user adds or removes it, and the main boundary. Apply the [Summary voice rules](../SKILL.md#voice-rules).

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

### Install into a profile

현재 checkout에 대해 작성 전에 실행해 확인한 설치 경로:

```text
dsh plugin --profile <name> add @deepseek-ai/dsh-<name>
dsh plugin --profile <name> remove @deepseek-ai/dsh-<name>
```

In-box bundle이 어디에서 resolve되는지, reconcile 단계가 무엇을 활성화하는지, patch 선언이 없으면 무엇이 실패하는지 적는다.

### What you get

이 layer가 추가하는 관찰 가능한 surface를 적는다. 도구, provider, UI 행이 해당하며, 각 행의 동작을 어느 패키지가 담당하는지도 함께 적는다.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>구현 내부 — 클릭하여 펼치기</summary>

Patch 문서를 설명한다. insert 목록, row id, 플랫폼 gating, override 의미를 포함한다. `cordis.patch.yml`과 `src/`를 연결하는 source-map 표를 둔다. API 카탈로그는 넣지 않는다.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

인접 페이지를 나열한다. 그룹 맵, profile 계약, composition 그래프가 여기에 해당한다.

-----

<a id="model-experience"></a>
## Model Experience

verify-package-readme-model-experience 게이트가 지정한 형식을 쓴다. Bundle carrier는 `indirect` 또는 `none`이다. 삽입된 각 행의 패키지가 모델과 관련된 동작을 담당하기 때문이다.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

현재 제약을 적는다. Override 의미, 플랫폼 gate, 사용자가 지켜야 하는 충돌 규칙이 여기에 해당한다.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>유지보수자를 위한 작업 맥락 — 클릭하여 펼치기</summary>

None.

</details>
```

## 규칙

- **`dsh.bundle.patch` 패키지만 이 템플릿을 쓴다.** 분류하기 전에 `package.json`의 선언을 확인한다. `dsh plugin` reconcile은 정확히 이 패키지들에 대해서만 layer를 활성화한다.
- **설치 경로를 직접 테스트한다.** 임시 profile에서 `dsh plugin --profile <name> add <this-package>`를 실행하고, 문서에 쓰기 전에 문서화할 경고, layer 활성화, 실패 모드를 재현한다.
- 짝 파일을 수정한 뒤에는 `pnpm run verify-translation-pairing --write packages/<group>/<pkg>/README.md`를 다시 실행한다.
