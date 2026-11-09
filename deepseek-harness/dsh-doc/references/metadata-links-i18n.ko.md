# 메타데이터, 링크, 이중 언어 쌍

## 요약

README 메타데이터는 검색과 템플릿 선택을 위한 인터페이스이며, 축소판 보고서나 광고가 아닙니다. `kind` 필드는 이 스킬에 존재하는 README 템플릿 중 정확히 하나를 고르고, 문서 표준에 대응합니다. 프론트매터에는 파일 이름 규칙이나 실행되는 게이트가 이미 담당하는 필드를 넣지 않습니다. 이중 언어 페이지는 동등한 권한, 1:1 구조, 정확한 물리적 줄 정렬을 유지합니다. `*.i18n.yaml` 사이드카는 마지막으로 확인된 쌍을 기록하며 자동 병합을 지원합니다. 링크 문법은 GitHub와 문서 사이트에서 올바르게 렌더링되어야 하므로, 저장소 링크는 렌더러가 유효하게 처리하는 상대 URL로 유지합니다.

## 목차

- [README 메타데이터](#readme-metadata)
- [kind 체계](#the-kind-system)
- [설명 품질](#description-quality)
- [저장소 링크와 경로 언급](#repository-links-and-path-mentions)
- [이중 언어 줄 정렬](#bilingual-line-alignment)
- [이중 언어 일관성 기록](#bilingual-consistency-records)
- [Dev Note](#dev-note)

## README 메타데이터

작성하는 모든 README는 YAML 프론트매터로 시작합니다. 사용자 정의 필드는 허용하되, 공통 필드는 검색과 인덱싱에 충분히 안정적으로 유지합니다.

```yaml
---
description: "Example capability for users and maintainers choosing, configuring, or debugging the package."
kind: "package-reference"
---
```

패키지 README 쌍에는 `description`과 `kind`가 필수입니다. 페이지 제목과 패키지 매니페스트가 이름을 이미 담당하고, 문서의 역할과 독자 경로가 대상 독자를 드러냅니다. 이 둘을 프론트매터에 중복해도 검색 가치는 늘지 않습니다. 대응 문서의 경로는 옆 파일 이름(`README.zh.md`)에서 얻고, 쌍의 상태는 사이드카가 담당하므로 README 안의 `i18n` 메타데이터는 중복입니다. 저장소가 소유한 분류 체계와 검색 소비자가 description과 전문 검색을 넘어설 이유를 입증하기 전에는 `tags`를 추가하지 않습니다. 기존 소유자가 다른 표기를 정의하지 않는 한 키는 소문자와 하이픈을 사용하며, 자주 바뀌는 코드 목록을 프론트매터에 복사하지 않습니다.

## kind 체계

`kind`는 문서 템플릿을 직접 선택합니다. 모든 kind는 이 스킬에 존재하는 템플릿 정확히 하나에 대응하며, kind 없이 존재하는 템플릿은 없습니다. `docs/persistence-changes/YYYY-MM-DD-slug.md` 형식의 파일은 `persistence-change`를 사용합니다. `docs/persistence-changes/releases/dsh-v*.md` 파일은 `persistence-release`를 사용합니다. `docs/persistence-changes/historical-formats/vN.md` 파일은 `persistence-format`을 사용합니다. 중국어 짝 문서도 같은 kind를 사용합니다. `docs/upgrade-guide/v<version>/<item>/guide.md`와 그 `guide.zh.md` 짝 문서는 `upgrade-guide`를 사용합니다. 폴더 README는 기록이 아니라 색인입니다. 패키지 README의 kind는 다음 순서로 기계적으로 도출합니다.

1. README가 `packages/README.md` 또는 `packages/<group>/README.md`이면 → `package-group`.
2. 패키지 매니페스트가 `dsh.bundle.patch`를 선언하면 → `package-bundle`.
3. 패키지가 `scripts/doc-standard.spec.ts`의 감사된 라이브러리 레지스트리에 있으면 → `package-library`.
4. 그 밖의 모든 것(서비스 default export 또는 `apply` 플러그인)은 `package-reference`입니다.

| `kind` | 저장소 위치 | 템플릿 | 기준 |
|---|---|---|---|
| `package-group` | `packages/README.md`, `packages/<group>/README.md` | [package-group.md](../templates/package-group.md) | 그룹 맵: 기능 계열을 안내하고, 직접 속한 패키지를 매핑하며, 구성 관계를 설명하고, 패키지가 소유한 세부 내용으로 링크합니다. |
| `package-reference` | plugin 진입점을 가진 `packages/<group>/<package>/README.md` | [package-reference.md](../templates/package-reference.md) | 패키지 계약: [패키지 README 검토 기준](review.md#package-readme-review)과 정식 [패키지 문서 요구 사항](../../../../docs/cookbook/adding-a-package.md#4-write-the-package-readme)을 따릅니다. |
| `package-library` | 일반 모듈 진입점을 가진 `packages/<group>/<package>/README.md` | [package-library.md](../templates/package-library.md) | 라이브러리 계약: 소비자 진입점과 경계. 프로필 설치 경로와 마운트 설정은 없습니다. |
| `package-bundle` | `dsh.bundle.patch`를 선언하는 `packages/<group>/<package>/README.md` | [package-bundle.md](../templates/package-bundle.md) | 설치 가능한 레이어: 검증된 `dsh plugin` 설치 경로, 레이어 의미, patch 문서. |
| `persistence-change` | `docs/persistence-changes/YYYY-MM-DD-slug.md` 및 중국어 짝 문서 | [persistence-change.md](../templates/persistence-change.md) | 과거 기록 확인: 기계적으로 감지된 타입 변경, 루트별 이전 참조, 호환성 결정, 생성된 after 스키마. |
| `persistence-release` | `docs/persistence-changes/releases/dsh-v*.md` 및 중국어 짝 문서 | [persistence-release.md](../templates/persistence-release.md) | 사후 관찰: 고정된 태그, 인접한 before/after 다이제스트, 실제 버전 상수, 변경된 after 스키마. 호환성 확인은 없습니다. |
| `persistence-format` | `docs/persistence-changes/historical-formats/vN.md` 및 중국어 짝 문서 | [persistence-format.md](../templates/persistence-format.md) | 선택된 과거 형식: 소스 증거, 완전한 루트 스키마와 도달 가능한 타입. 현재 writer는 생성된 카탈로그를 사용합니다. |
| `upgrade-guide` | `docs/upgrade-guide/v<version>/<item>/guide.md` 및 중국어 짝 문서 | [upgrade-guide.md](../templates/upgrade-guide.md) | 업그레이드 경로: 디렉터리의 릴리스에서 다음 릴리스까지 외부에서 체감되는 변경 하나. `Change`와 `Migration` 섹션을 영어 500단어 이내로 씁니다. |

`package-library` 또는 `package-bundle`을 지정하기 전에 사실을 확인합니다. `package.json`에서 `dsh.bundle.patch`를, `src/index.ts`에서 진입점 형태를 읽습니다(`apply` export 또는 default service export는 플러그인이고, 일반 모듈 API는 라이브러리입니다). `dsh plugin --profile <name> add <package>`는 npm 의존성을 무엇이든 설치하지만, 프로필 reconcile은 `dsh.bundle`을 선언한 패키지에 대해서만 레이어를 활성화합니다. 이 명령을 라이브러리나 일반 플러그인의 설치 경로로 제시하지 마십시오. 문서 검사는 같은 사실에서 기대되는 kind를 도출하며, 다른 값은 거부하고, `name`, `audience`, `tags`, README 안의 `i18n` 메타데이터도 거부합니다. 새 kind는 구별되는 템플릿, 명확한 저장소 위치나 선언된 소유자, 문서를 그 kind에 대응시키는 집중된 검사가 모두 있을 때만 추가합니다.

## 설명 품질

에이전트는 전체 문서를 불러오기 전에 프론트매터의 `description` 값을 검색해 페이지 후보를 추립니다. 각 값은 Skill description처럼 씁니다. 페이지가 다루는 내용과 독자가 언제 이 페이지를 열어야 하는지를 밝힙니다. 구체적인 문장 한두 개를 쓰고, 검색 가능한 도메인 용어를 넣고, 가까운 소유자 문서와 구별합니다. 모든 섹션을 요약하거나, 우월함을 주장하거나, 제목을 되풀이하거나, 모호하게 홍보하거나, 변경 이력을 보존하거나, 기술 상태 보고서를 쓰지 않습니다.

좋은 예: `The shipped JSONL session-persistence backend for deployments and maintainers choosing, configuring, or debugging per-session durable logs with optional Zstandard compression.`

약한 예: `The best and most advanced session storage implementation with lots of optimizations.`

## 저장소 링크와 경로 언급

링크 대상은 기계가 검사할 수 있게, 경로 언급은 문맥에 상대적으로 유지합니다. 현재 페이지의 메뉴에는 fragment 전용 링크를 씁니다. 외부 리소스에는 전체 URL을 씁니다.

바람직한 내부 링크 모델은 저장소 루트를 기준으로 대상을 지정합니다. 하지만 선행 `/docs/...` Markdown URL은 GitHub에서 저장소 밖으로 해석되고, 웹사이트 projector가 건드리지 않으며, `verify-md-links`가 건너뜁니다. 저장소가 소유한 해석기가 모든 렌더러에서 루트 경로를 지원하기 전까지는, Markdown 링크에 현재 렌더러에서 유효한 상대 URL을 쓰고, `docs/`나 `packages/session/` 같은 논리적 경로 언급은 논의 맥락에 상대적으로 씁니다. 절대 경로처럼 보이게 하려고 검사되지 않은 선행 슬래시 링크를 채택하지 않습니다.

## 이중 언어 줄 정렬

영어와 간체 중국어의 권한을 동등하게 유지합니다. 프론트매터 키 순서, 제목, 빈 줄, 단락, 목록 항목, 표, 코드 펜스, 링크 대상, 전체 물리적 줄 수를 1:1로 맞춥니다. 영어 쪽은 모든 상대 링크를 `.md` 대상으로 가리킵니다. 중국어 쪽은 대응 문서가 있으면 `.zh.md` 짝 문서를, 없으면 `.md` 대상을 가리킵니다. 페어링 게이트는 `.md`와 `.zh.md` 대상을 같은 문서로 비교합니다. 산문은 대응하는 줄 안에서 자연스럽게 번역합니다. 어느 언어도 강제 줄바꿈하지 않습니다. 코드 블록은 바이트 단위로 동일하게 유지하고, 첫 등장 용어 주석은 줄 구조를 바꾸지 않고 위치만 조정합니다.

줄 수가 같다는 것은 구조 검사일 뿐, 의미가 충실하다는 증명이 아닙니다. 완전성, 용어, 자연스러운 언어, 각 줄이 같은 명제를 표현하는지는 여전히 검토가 담당합니다.

## 이중 언어 일관성 기록

모든 이중 언어 쌍에는 `*.i18n.yaml` 사이드카를 유지합니다. 사이드카는 펜스 코드 블록과 생성된 영역을 제외하고 제목 섹션마다 해시 쌍을 기록합니다. 그래서 서로 다른 섹션의 편집은 Git의 기본 텍스트 병합으로 합쳐집니다. 생성된 데이터는 생성기가 두 페이지에 쓰는 생성 영역에 둡니다. `verify-translation-pairing`은 이 항목들을 현재 내용과 비교하고 구조를 검증합니다. 어느 언어든 바뀌면 `pnpm run verify-translation-pairing --write <pair>`로 다시 기록합니다. 내용 해시를 README 프론트매터에 복사하지 마십시오. 독립적인 편집이 같은 헤더 줄을 바꾸게 되어, 원래는 병합 가능한 산문이 소유자 파일 충돌로 바뀌기 때문입니다.

## Dev Note

없음.
