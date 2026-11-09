# 템플릿: package-reference

이 템플릿은 composition에 mount되는 Cordis plugin(service default export 또는 `apply` 함수)인 패키지에 사용한다. `packages/<group>/<pkg>/README.md`의 기본 템플릿이다. `session-persistence-jsonl` README 짝 파일이 이 템플릿의 실제 예시다.

## Frontmatter

```yaml
---
description: "What the package lets a reader choose, configure, or debug, in one or two concrete sentences with searchable domain terms."
kind: "package-reference"
---
```

## 골격

```markdown
# @deepseek-ai/dsh-<name>

English | [中文](README.zh.md)

## Summary

Three to five sentences and at most 100 `wc -w`-style words on what a user or agent can DO with the package: outcomes, when to choose it, main cost, most important boundary. Apply the [Summary voice rules](../SKILL.md#voice-rules); never describe its role, type, or internal identity.

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

이 패키지를 쓰는 기본 경로를 설명하는 문장 하나.

### When to choose it

이 패키지를 선택하거나 피해야 하는 경우를 한 문단으로 쓴다. 결정 조건과 대체 패키지를 함께 적는다.

### Minimal configuration

가장 작게 동작하는 mount를 `cordis.yml` 스니펫과 설정 표로 보여 준다.

| Field | Default | Meaning |
|---|---|---|
| `<field>` | `<default>` or `required` | One-line meaning |

[생성된 configuration catalog](../../../docs/config-catalog.md#deepseek-aidsh-<name>)가 허용되는 모든 필드의 완전한 출처다.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>구현 내부 — 클릭하여 펼치기</summary>

패키지를 이해하기에 충분한 설계 개념, 컴포넌트 구조, 대략적인 dataflow를 쓴다. 정확한 세부 내용은 파일을 연결하는 source-map 표가 담당한다. API 카탈로그나 JSDoc 재서술은 넣지 않는다.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

인접 페이지 3~7개를 가장 가까운 선행 지식 순서로 나열한다. 각 항목은 짧은 구문 하나로 쓴다.

-----

<a id="model-experience"></a>
## Model Experience

<docs/cookbook/adding-a-package.md#4-write-the-package-readme의 Model Experience 계약을 따른다. 필수 형식은 verify-package-readme-model-experience 게이트가 담당한다>

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

이 패키지의 현재 제약을 최상위 bullet으로 적기 전에 문장 하나로 방향을 잡는다. 제약이 없는 패키지는 scripts/verify-package-readme-limitations.ts의 허용 목록을 사용한다.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>유지보수자를 위한 작업 맥락 — 클릭하여 펼치기</summary>

None.

</details>
```

## 규칙

- **작성 전에 사실을 확인한다.** 테스트 composition에 패키지를 mount하고, 이 README가 주장하는 명령, 설정 필드, 기본값, 동작을 모두 실행한다. 재현하지 못한 내용은 삭제한다. 필드를 다시 적지 말고 생성된 config catalog를 링크한다.
- **설치 안내.** Plugin 패키지는 `cordis.yml` 행으로 mount한다. `dsh.bundle.patch`를 선언한 패키지만 `dsh plugin --profile <name> add <package>`로 profile layer에 설치된다. 이 패키지에 그 선언이 없으면 composition에서 mount되는 방식을 설명하고, `dsh plugin add`는 쓰지 않는다.
- **Model Experience와 Known Limitations는 게이트가 관리한다.** 두 게이트가 강제하는 정확한 제목과 패키지별 형식을 맞춘다. 동작 변경으로 패키지의 형식이 바뀌면 같은 변경에서 게이트의 감사 목록도 갱신한다.
- 짝 파일을 수정한 뒤에는 `pnpm run verify-translation-pairing --write packages/<group>/<pkg>/README.md`를 다시 실행한다.
