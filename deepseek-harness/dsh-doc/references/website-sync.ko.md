# 웹사이트 발행

## 요약

문서 웹사이트는 저장소 Markdown을 테스트된 방식으로 투영한 결과이며, 두 번째 복사본이 아니다. [website/docs.ts](../../../../website/docs.ts)가 명시적인 공개 allowlist이고, [scripts/project-doc-site.ts](../../../../scripts/project-doc-site.ts)가 매핑된 원본을 버릴 수 있는 `website/.generated/` 트리로 다시 쓰며, VitePress가 그 트리를 빌드한다. 빌드는 같은 manifest에서 모든 route의 raw-Markdown 쌍과 루트 `llms.txt` 인덱스도 함께 낸다. 이 reference는 manifest 필드, projector의 링크 규칙, 미리보기와 검증 명령, 배포 경계를 소유한다.

## 목차

- [Manifest 소유권](#manifest-ownership)
- [변경 분류](#classify-the-change)
- [DocsPage 필드](#docspage-fields)
- [링크 동작 보존](#preserve-link-behavior)
- [미리보기와 검증](#preview-and-validate)
- [배포는 분리해서 유지](#keep-deployment-separate)
- [Dev Note](#dev-note)

## Manifest 소유권

manifest를 바꾸기 전에 [docs/AGENTS.md](../../../../docs/AGENTS.md)와 [website/docs.ts](../../../../website/docs.ts)의 현재 `DocsPage` 타입 및 항목을 읽는다. 기억에 있는 필드 목록에 의존하지 않는다. 새 섹션, sidebar collection, locale, 최상위 navigation 항목을 추가하기 전에는 [website/.vitepress/config.ts](../../../../website/.vitepress/config.ts)를 읽는다. 수정하는 bilingual 원본은 [docs/AGENTS.md](../../../../docs/AGENTS.md#writing-rules)의 가벼운 루틴과 [pairing contract](../../../../docs/i18n/README.md)를 따른다. 확장 번역 skill은 자동으로 호출하지 않는다.

`website/.generated/`, `website/.cache/`, `website/.dist/`는 절대 수정하거나 커밋하지 않는다. `website/AGENTS.md`를 제외하고, `website/` 아래에 Markdown을 추가하지 않는다. `website/zh-CN/`, `website/en/`, `website/api/` 같은 locale이나 route 디렉터리는 잘못된 원본 레이아웃이다. 생성된 catalog는 `docs/` 아래에 두고, 그곳에서 freshness gate를 걸며, manifest를 통해 발행한다.

## 변경 분류

- **이미 발행된 페이지 수정:** 정식 Markdown 원본만 바꾼다. route나 navigation 메타데이터가 바뀌지 않는다면 manifest는 건드리지 않는다.
- **새 페이지 발행:** 소유 티어인 `docs/` 아래에 만들고, manifest 항목을 하나 추가한다.
- **페이지 이름 변경, 이동, 삭제:** 정식 파일, manifest 항목, 저장소 내부 inbound 링크를 한 번에 갱신한다. 오래된 manifest 항목은 제거한다. 원본이 없으면 `docs:check`가 거부한다.
- **생성된 catalog 발행:** 생성된 `docs/` 파일을 매핑한다. 다만 catalog를 손으로 고치지 말고, generator나 원본 메타데이터를 바꾼다.
- **사이트 구조 변경:** 일반 페이지는 manifest를 갱신한다. 기존 sidebar, section, locale 모델로 표현할 수 없을 때만 VitePress 설정을 바꾼다.

manifest는 명시적인 공개 allowlist로 유지한다. RFC, postmortem, 테스트 가이드, `AGENTS.md`, 유지보수자 워크플로는 `docs/` 아래에 있다는 이유만으로 공개하지 않는다. 사용자가 사이트에 공개할 대상을 명시적으로 넓힌 경우에만 내부 자료를 추가한다.

## DocsPage 필드

모든 `DocsPage` 필드는 의도를 가지고 설정한다. 정식 필드 집합과 `DocsSidebar` 유니온은 [website/docs.ts](../../../../website/docs.ts)에 있으며, 값을 산문에 옮겨 적지 말고 그 파일에서 읽는다. section은 그 파일의 `sections` 레코드가 소유하며, VitePress 설정에는 별도의 순서 목록이 없다.

- `source`: 저장소 기준 상대 정식 Markdown 경로. 완전한 bilingual 쌍이면 `pairedPages()`를 통해 영어 `.md` 경로를 추가한다. 그러면 `.zh.md` 형제, content locale, counterpart alias가 파생된다.
- `route`: `.md` 접미사를 포함한 공개 VitePress 경로.
- `label`: sidebar 라벨이다. 문서의 H1과 같을 필요는 없다.
- `sidebar`: 정보 구조상 새 collection이 꼭 필요하지 않다면 기존 `DocsSidebar` collection을 재사용한다.
- `section`: 가능하면 기존 section을 재사용한다. 새로 추가하면 `sections` 레코드에도 정의한다.
- `order`: section 안에서의 안정적인 순서.
- `sourceAliases`: 링크를 투영할 때 이 페이지로 해석되어야 하는 추가 저장소 경로. 새 공개 route를 만들지는 않는다.

`mirroredPages()`는 두 route 트리에서 같은 사용 가능한 언어로 의도적으로 fallback하는 원본에만 쓴다. 대응 언어가 추가되면 그 항목을 `pairedPages()`로 바꾼다. 사이트 route 트리는 원본 레이아웃과 독립적이다. `foo.zh.md`는 루트 route로, `foo.md`는 맞는 `/en/` route로 투영된다.

## 링크 동작 보존

정식 문서에는 일반적인 저장소 상대 Markdown 링크를 쓴다. projector는 다음 규칙을 적용한다.

- manifest에 있는 대상은 사이트 상대 route가 된다.
- manifest에 없는 존재하는 대상은 GitHub 원본 링크가 된다. 지원되는 줄 접미사도 포함한다.
- 이미지는 예외다. 파일을 생성된 트리로 복사하고 그곳에서 참조하므로, 저장소 공개 여부와 무관하게 사이트가 제공한다. 저장소 안의 일반 파일이어야 한다.
- 외부 URL, 사이트 절대 URL, 이메일 링크, fragment-only 링크는 그대로 둔다.
- 저장소 상대 대상이 없으면 조용히 깨진 링크를 만들지 않고 투영이 실패한다.
- 페이지 간 fragment는 영어 GitHub heading id를 정식 id로 쓴다. 작성된 heading이 다른 VitePress id를 만들면, 바로 앞에 명시적인 `<a id="..."></a>`를 둔다. 생성된 alias는 소유 generator에 추가한다.

정식 Markdown에 VitePress를 맞추려고 웹사이트 전용 route를 쓰지 않는다. 디렉터리 형식의 저장소 링크가 매핑된 index 페이지로 해석되어야 하면 `sourceAliases`를 쓴다.

## 미리보기와 검증

편집하는 동안 로컬 미리보기를 실행한다.

```sh
pnpm docs:dev
```

dev 서버는 매핑된 원본 파일을 감시하고 다시 투영한다. manifest를 바꾼 뒤 새 원본이 자동으로 반영되지 않으면 서버를 다시 시작한다.

매핑이 유효하다고 보기 전에 집중 웹사이트 gate를 실행한다.

```sh
pnpm docs:check
```

Markdown 링크 검사는 통과했지만 사이트 빌드가 누락된 fragment를 보고하면, `verify-doc-site-fragments`의 원본 경로와 대상 경로를 따라간다. 영어 GitHub id는 작성된 Markdown이나 소유 generator의 명시적 alias로 보존한다.

웹사이트 문서 변경을 커밋하기 전에 다음을 실행한다.

```sh
pnpm run test:docs
pnpm run doc-sync
pnpm run lint
git diff --check
```

push 전에는 [dsh-pre-push-checks](../../dsh-pre-push-checks/SKILL.md)를 사용한다. 정식 파일 변경, 추가되거나 제거된 manifest 항목, 영향을 받은 공개 route, 실행한 정확한 검사를 보고한다.

## 배포는 분리해서 유지

VitePress 빌드에 내용을 동기화하는 것은 인터넷에 공개하는 것이 아니다. 사용자가 배포를 명시적으로 요청하고 호스팅 정책을 확인하기 전에는 GitHub Pages 권한, 배포 workflow, custom domain, 공개 호스팅을 추가하지 않는다.

## Dev Note

없음.
