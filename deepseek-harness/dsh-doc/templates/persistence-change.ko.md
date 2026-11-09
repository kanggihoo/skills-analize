# 템플릿: persistence-change

이 템플릿은 `docs/persistence-changes/YYYY-MM-DD-slug.md`와 그 중국어 짝 파일을 만들 때 사용한다. 폴더의 README는 색인이지 기록이 아니다. 기록은 기계적으로 감지된 persistence 타입 변경만 인정한다. 생성되는 JSON 짝 파일은 완전한 after 스키마를 보존하므로, 검증에 Git 기준선이 필요 없다.

## Frontmatter

```yaml
---
description: "The persisted types changed and the compatibility decision this record explains."
kind: persistence-change
---
```

## 골격

생성기는 기계용 선언, 스키마 짝 파일, 일관성 기록을 채운다. 확립된 같은 버전 사례 밖의 구조 변경에는 명시적인 호환성 결정이 필요하다. `--prose` JSON에 `en`과 `zh` 객체를 제공한다. 각 객체에는 작성한 `summary`, `compatibility`, `verification` 문자열이 들어간다. Compatibility에는 두 reader 방향을 모두 설명하고, Verification에는 실제로 실행한 검사를 기록한다. [cookbook](../../../../docs/cookbook/reviewing-persistence-type-changes.md)에 작업 방법이 나온다. 아래 필드에는 실제로 생성된 root 이름, 기록 id, digest를 사용한다.

````markdown
# Persistence change: <specific persisted change>

English | [中文](YYYY-MM-DD-slug.zh.md)

## Summary

Describe the mechanically detected change and its version decision.

## Table of Contents

- [Declaration](#declaration)
- [Compatibility](#compatibility)
- [Verification](#verification)
- [Dev Note](#dev-note)

<a id="declaration"></a>
## Declaration

```yaml persistence-change
schemaVersion: 1
id: YYYY-MM-DD-slug
baseline: false
changes:
  - root: event:example/message
    previous: YYYY-MM-DD-predecessor
    after: <generated-64-character-sha256-hex>
    decision: same-version
```

<a id="compatibility"></a>
## Compatibility

Explain the declared decision for every detected path: how older readers preserve meaning, safely ignore optional data, or refuse required features before execution or recovery; and how new readers preserve historical meaning and mixed representations. Feature absence retains existing behavior. For a version bump, link the adjacent migration and its verification owner.

<a id="verification"></a>
## Verification

Record the commands actually run and their outcomes. Link focused tests or preserved evidence that support the compatibility explanation.

<a id="dev-note"></a>
## Dev Note

None.
````

## 규칙

- `yaml persistence-change` 블록은 정확히 하나만 둔다. 영어 블록과 중국어 블록은 바이트 단위로 같아야 한다. 검증기는 영어 기록을 한 번 파싱하고 짝 파일을 확인한다.
- 파일 이름 stem과 `id`는 일치해야 한다. Root의 `previous`는 선행 기록을 가리킨다. `null`이면 root를 새로 도입한다는 뜻이다. `after`는 생성된 companion 스키마 digest와 일치해야 한다. `null`은 삭제를 기록한다.
- 전체 인벤토리를 덮는 `baseline: true` 기록은 처음에 하나만 만든다. 일상적인 변경은 `baseline: false`를 쓰고, 인정된 선행 기록을 보존한다. 버전을 올리는 기록은 자체적으로 증가하는 `SessionHeader.version` 전이를 담는다.
- 구조 차이만으로 버전 상승을 추론하지 않는다. 검토가 필요한 같은 버전 변경에는 명시적인 `--decision same-version`이 필요하다. Header 버전이 바뀌었으면 `version-bump`로 추론한다. 명시적 결정으로도 필수 header 증가를 면제할 수 없다. 이 명령은 소스 변경이나 검증 주장을 제공하지 않는다.
- 감지된 persistence 타입 변경만 설명한다. 이 kind는 해당 전이에 필요한 before/after 사실과 과거 증거만 허용한다. 동작만 바뀐 변경은 범위 밖이다.
- 기록을 만들거나 terminal 기록을 갱신하면 catalog 짝 파일과 일관성 sidecar가 생성된다. 두 언어를 모두 검토하고 생성된 companion을 유지한다. 산문을 직접 고친 경우에도 pairing을 다시 기록해야 한다. 스키마 노드와 digest는 직접 관리하지 않는다.
- 인정되지 않은 terminal 기록을 고칠 때만 명시적 `--update`를 쓴다. 기준선과 다른 기록이 의존하는 기록은 거부된다. `--prose`는 작성된 설명을 교체하고, 생략하면 기존 설명을 보존한다. 표시된 같은 버전 갱신에는 명시적 `--decision same-version`이 필요하다. 전체 전이를 기준으로 설명을 다시 평가한다. 인정된 기록에는 후속 기록이 생긴다.
- [폴더 reference](../../../../docs/persistence-changes/README.md)가 호환성 규칙을 담당한다. [cookbook](../../../../docs/cookbook/reviewing-persistence-type-changes.md)이 명령과 복구를 담당한다.
