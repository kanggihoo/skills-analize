# 템플릿: package-library

이 템플릿은 plugin 표면이 없는 패키지에 사용한다. Entry가 평범한 모듈 API를 export하고, composition에 아무것도 등록하지 않는다. 예: `boot/app-boot`, `util/*`, `sdk/protocol`, `typert/generator`. `boot/app-boot` README 짝 파일이 실제 예시다.

Library README는 package reference와 세 가지가 다르다. Profile 설치 안내가 없다. Library는 레이어가 아니라 의존성이다. `cordis.yml` 행이 없으므로 mount 설정도 없다. Model Experience는 게이트가 지정한 감사 형식으로만 쓴다. 대부분의 library는 `none` 또는 `indirect`다.

## Frontmatter

```yaml
---
description: "What the library lets a caller build, in one or two concrete sentences with the consuming packages or searchable domain terms."
kind: "package-library"
---
```

## 골격

```markdown
# @deepseek-ai/dsh-<name>

English | [中文](README.zh.md)

## Summary

Three to five sentences and at most 100 `wc -w`-style words: what a caller can DO with the library, who consumes it, the smallest entry point, and the main boundary. Apply the [Summary voice rules](../SKILL.md#voice-rules).

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

### When to use it

이 라이브러리를 사용하는 호출 지점(어떤 bin, 패키지, 런타임이 import하는지)을 적고, 호출자가 plugin 대신 언제 이 라이브러리를 선택해야 하는지 설명한다.

### Entry point

동작하는 가장 작은 import와 호출 예시를 `text` 또는 `ts` fence에 넣고, 성공과 실패가 어떻게 보이는지 이어서 설명한다. 정확한 내용은 `src/index.ts`의 담당 계약을 링크하고, 다시 쓰지 않는다.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>구현 내부 — 클릭하여 펼치기</summary>

설계 노트와 source-map 표를 쓴다. API 카탈로그는 넣지 않는다.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

인접 페이지를 가장 가까운 선행 지식 순서로 나열한다.

-----

<a id="model-experience"></a>
## Model Experience

verify-package-readme-model-experience 게이트가 이 패키지에 지정한 형식(`none`, `indirect`, 또는 정식 블록)만 쓴다. Library는 실제로 없는 모델 효과를 만들어 쓰지 않는다.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

현재 패키지 제약을 최상위 bullet으로 적는다. 제약이 없으면 scripts/verify-package-readme-limitations.ts의 허용 목록에 패키지를 올린다.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>유지보수자를 위한 작업 맥락 — 클릭하여 펼치기</summary>

None.

</details>
```

## 규칙

- **Entry로 분류하고, 폴더로 분류하지 않는다.** 이 템플릿을 고르기 전에 `src/index.ts`를 읽는다. `export default`로 service class를 export하거나 `apply`를 export하면 `package-reference`다. `package.json`에 `dsh.bundle.patch`가 있으면 `package-bundle`다. 이 둘이 없는 평범한 모듈 API가 library다.
- **Profile 설치 안내를 쓰지 않는다.** `dsh plugin --profile <name> add <package>`는 모든 npm 의존성을 설치하지만, profile layer를 활성화하는 것은 `dsh.bundle`을 선언한 패키지뿐이다. Library에서 이 명령은 기껏해야 의존성 추가일 뿐이므로, 설치 경로로 적지 않는다.
- 짝 파일을 수정한 뒤에는 `pnpm run verify-translation-pairing --write packages/<group>/<pkg>/README.md`를 다시 실행한다.
