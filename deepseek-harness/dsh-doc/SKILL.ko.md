---
name: dsh-doc
description: DeepSeek Harness Markdown 문서, 패키지 README, 문서 웹사이트를 작성, 재구성, 검토, 감사, 마이그레이션할 때 사용한다. audience-first 계층, kind에 대응하는 YAML 메타데이터, 이중언어 줄 정렬, summary/contents 탐색, 사용자에서 개발자로 이어지는 점진적 상세, 실행으로 확인하는 사실 점검, 저장소 검증을 다룬다. 새 DSH 문서나 수정한 문서, docs 트리 구성, 문서 품질 감사와 budget, 웹사이트 페이지 게시, 이중언어 문서 구조 변경에 사용한다.
---

# DeepSeek Harness 문서

## Summary

DeepSeek Harness 문서 표준이다. 모든 페이지를 검색 가능하고, 처음 보는 사람이 읽을 수 있고, 에이전트와 메인테이너가 쓸 수 있을 만큼 정확하게 만든다. 문서 웹사이트는 테스트된 저장소 Markdown의 투영(projection)으로 유지한다. 저장소의 `AGENTS.md` 파일과 실행한 게이트를 먼저 적용하고, 그다음 이 워크플로를 적용한다. 워크플로는 kind에 대응하는 메타데이터, 점진적 상세, 줄 단위로 정렬된 이중언어 페이지, 코퍼스 감사, 웹사이트 게시를 다룬다. 사실의 owner는 하나만 둔다. 소스, 테스트, 생성된 카탈로그, 패키지 README, 가이드, Agent Notes, 임시 메모는 각자 고유한 종류의 진실을 맡는다. `session-persistence-jsonl` README 쌍이 이 형식의 참조 예시다.

## Table of Contents

- [Workflow](#workflow)
- [Fact-check procedure: test, do not assume](#fact-check-procedure-test-do-not-assume)
- [Kind system and templates](#kind-system-and-templates)
- [Voice rules](#voice-rules)
- [Quality criteria](#quality-criteria)
- [Audit the corpus](#audit-the-corpus)
- [Wordcount budgets](#wordcount-budgets)
- [Website publication](#website-publication)
- [Detailed references](#detailed-references)
- [Validation](#validation)
- [Dev Note](#dev-note)

## Workflow

요청된 범위마다 이 순서를 따른다. 일반 독자의 경로는 짧게 유지하되, 실패, 소유권, 제한 사항, 그 밖의 필수 계약을 단어 수를 줄인다는 이유로 지우지 않는다.

1. 루트와 더 구체적인 `AGENTS.md`, [the documentation standard](../../../docs/AGENTS.md), 대상 페이지, 그 소스와 테스트, navigation owner, 이중언어 기록을 읽는다.
2. 페이지를 주된 역할과 독자 하나로 분류한다. 제품 quick start, 사용자 작업 가이드, 기여자 튜토리얼, 아키텍처 개요, 패키지/서브시스템 레퍼런스, 생성된 레퍼런스, 에이전트 지침, 결정 기록, 임시 메모 중 하나다.
3. 페이지를 가장 가까운 owner 아래에 둔다. 패키지 계약은 패키지 코드 옆에 둔다. 패키지를 가로지르는 학습, 사용자, 개발자, 아키텍처, 논의, 기한이 있는 임시 자료는 `docs/`에 둔다.
4. 세부 내용을 쓰기 전에 독자의 시작 상태, 관찰 가능한 결과, 예상되는 실패, 복구 경로, 다음으로 유용한 깊이를 정한다.
5. YAML 메타데이터를 추가하거나 수정한다. 이 문서의 역할에 맞는 템플릿에 대응하는 `kind`를 지정한 뒤, 문서 유형이 허용하는 순서대로 `Summary`, `Table of Contents`, 사용자 대상 내용, 개발자 대상 내용, 선택 사항인 `Further Exploration`, 마지막 `Dev Note`를 쓴다.
6. 같은 작업 안에서 이중언어 짝도 갱신한다. 제목, 목록, 표, 코드, 링크, frontmatter 배치, 물리적 줄 수를 맞춘다.
7. 모든 주장을 코드, 테스트, 생성기, 패키지 메타데이터, 또는 현재의 결정 owner와 대조해 확인한다. 아래 사실 점검 절차에 따라 페이지가 지시하는 작업을 실제로 실행한다. 파생 산출물을 고치기 전에 owner를 먼저 고친다.
8. 집중된 검사를 실행한 뒤 `pnpm run test:docs`, `pnpm run doc-sync`, `pnpm run lint`, `git diff --check`를 실행한다. 전체 diff를 다시 읽어 정확성을 확인하고, 이어서 간결성과 저장소와의 적합성을 확인한다.

## Fact-check procedure: test, do not assume

문서는 제품이 오늘 어떻게 동작하는지를 말한다. 동작에 대한 주장을 인정하는 유일한 증거는 그 작업을 실제로 실행해 본 결과다. 이 절차는 작업을 수행하는 명령, 기본값, 오류, 플랫폼 차이를 주장하는 모든 새 문서와 모든 새 단락에 필수로 적용된다.

1. **설치 안내를 쓰기 전에 대상을 분류한다.** 폴더 이름이 아니라 사실을 읽는다. `dsh.bundle.patch` 선언은 `package.json`에서 확인한다. 플러그인의 형태는 엔트리 파일에서 확인한다. `apply` export나 기본 service export가 있으면 플러그인이고, 일반 모듈 API만 있으면 라이브러리다. 번들은 `dsh plugin --profile <name> add <package>`로 설치하며, 이 명령이 profile 레이어를 활성화하는 유일한 패키지 형태다. 플러그인은 `cordis.yml` 행으로 마운트된다. 라이브러리는 의존성이며 자체 설치 경로가 없다. 특별한 지위를 가진 패키지(라이브러리, 번들)는 자기만의 README 템플릿을 갖는다. 플러그인 README에 적용되지 않는 설치 안내를 넣지 않는다.
2. **문서가 주장하는 모든 작업을 현재 checkout에서 실행한다.** 문서에 보여 줄 모든 CLI 명령, 설정 스니펫, profile이나 patch 예시를 정확히 그대로 실행한다. 관찰한 것만 적는다. 정확한 출력, 경고, 실패 모드도 포함한다. 주장이 내가 가지지 않은 키나 네트워크에 의존한다면 그 사실을 밝히고, 동작을 단정하는 대신 검증 owner를 적는다.
3. **재현하지 못한 내용은 지운다.** 명령, 필드, 기본값, 동작을 기억, 비유, 이웃 패키지 README에서 가져오지 않는다. 주장이 재현되지 않으면 테스트를 고치지 말고 주장을 고친다.
4. **옛 문서를 최신 master와 대조한다.** 기존 페이지를 수정하기 전에 `git fetch origin`을 실행하고 해당 섹션을 `origin/master`와 비교한다. pairing sidecar는 양쪽의 마지막으로 확인된 텍스트를 복구한다. master에 있는 낡은 문장도 여전히 틀린 문장이다. 옛 문장이 아니라 코드를 기준으로 고친다.
5. **편집할 때마다 짝을 다시 기록한다.** 짝을 이루는 편집마다 `pnpm run verify-translation-pairing --write <pair>`를 다시 실행해 sidecar가 확인된 짝을 추적하게 한다.

## Kind system and templates

`kind` frontmatter 필드는 README 템플릿을 정확히 하나 고른다. [the metadata reference](references/metadata-links-i18n.md#the-kind-system)에 있는 모든 kind는 [`templates/`](templates/)의 템플릿 파일 하나에 대응하며, 모든 템플릿은 정확히 하나의 kind를 뒷받침한다. 문서 검사는 같은 기계적 사실에서 기대되는 kind를 도출한다.

- `package-group` → [templates/package-group.md](templates/package-group.md): 그룹 맵(`packages/README.md`, `packages/<group>/README.md`). 패밀리의 방향을 잡아 주고, 직접 속한 패키지를 지도로 보여 주며, 패키지가 소유한 세부 내용으로 연결한다.
- `package-reference` → [templates/package-reference.md](templates/package-reference.md): Cordis 플러그인 또는 service 패키지. mount 설정, 설정 표, 접힌 구현, gate가 정한 형식의 Model Experience와 Known Limitations를 포함한다.
- `package-library` → [templates/package-library.md](templates/package-library.md): 플러그인 표면이 없는 패키지. 소비자용 진입점을 설명하며, profile 설치 경로와 mount 설정은 없다.
- `package-bundle` → [templates/package-bundle.md](templates/package-bundle.md): `dsh.bundle.patch`를 선언하는 패키지. 검증된 `dsh plugin` 설치 경로, 레이어의 의미, patch 문서를 다룬다.
- `persistence-change` → [templates/persistence-change.md](templates/persistence-change.md): `docs/persistence-changes/`의 날짜가 붙은 기록. 감지된 타입 전환을 루트별 이전 버전과 생성된 이후 schema와 함께 인정한다.
- `persistence-release` → [templates/persistence-release.md](templates/persistence-release.md): `docs/persistence-changes/releases/`에 고정된 tag. 재구성한 과거 타입을 비교하되, 호환성 인정을 주장하지 않는다.
- `persistence-format` → [templates/persistence-format.md](templates/persistence-format.md): `docs/persistence-changes/historical-formats/`의 과거 Session 형식 체크포인트. 완전한 schema를 담는다. 현재 writer는 기존 카탈로그를 사용한다.
- `upgrade-guide` → [templates/upgrade-guide.md](templates/upgrade-guide.md): `docs/upgrade-guide/v<version>/<item>/guide.md`와 그 중국어 짝. 외부에서 인지할 수 있는 변경 하나에 대한 마이그레이션 단계이며, [dsh-create-upgrade-guide](../dsh-create-upgrade-guide/SKILL.md)가 소유한다.

글을 쓰기 전에 문서의 kind에 해당하는 템플릿을 연다. 템플릿의 골격과 규칙을 따른다. 템플릿은 그 kind가 무엇인지, 페이지가 어떻게 구성되는지, 각 섹션이 져야 하는 사실 점검을 설명한다. 새 kind는 별도의 템플릿 파일, 문서화된 저장소 위치 또는 선언된 owner, 그리고 문서를 해당 kind에 대응시키는 집중된 검사와 함께 추가할 때만 허용된다.

## Voice rules

이 규칙은 각 섹션이 무엇을 말할 수 있는지 정한다. 사람이 읽는 페이지 전체에 적용되며, 패키지 README에는 특히 강하게 적용된다.

- **Summary는 주제가 무엇을 하는지 말한다.** 문서 맨 위의 `Summary`와 사용자 대상 섹션은 사용자나 에이전트가 주제로 할 수 있는 일을 설명한다. 결과, 이점, 선택할 때, 주요 비용이 여기에 해당한다. 역할, 유형, 내부 정체성은 설명하지 않는다. 패키지 Summary에서 "무엇인지"는 독자가 볼 수 있는 기능만 뜻한다. Cordis 역할, 등록, 내부 구성 요소는 뜻하지 않는다. 독자가 설정, 명령, 공개 API에서 직접 쓰지 않는 한 소스 식별자는 생략한다. "The seam registers `ctx.x` and appends `x/event` records"는 정체성 서술이다. "메시지마다 메모를 하나씩 저장할 수 있고, 재시작 후에도 남는다"가 주제가 하는 일이다.
- **개발자 섹션은 설명하고, 나열하지 않는다.** 접힌 구현 내용은 전체 설계 개념, 아키텍처, 대략적인 데이터 흐름을 다룬다. 패키지가 어떻게 동작하는지 이해할 정도면 충분하다. 정확한 세부 내용은 코드 링크로 넘긴다. 접힌 부분 안에 전체 API 카탈로그, 빠짐없는 열 목록, 이벤트 payload 나열, JSDoc 재서술을 넣지 않는다.
- **Dev Note만 초안을 써도 되는 영역이다.** 부분적인 아이디어, 메모, 아직 정하지 않은 방향, 측정된 산출물, 작업 가설은 마지막 Dev Note에만 두고, 권위가 없다고 명시한다. 그 밖의 섹션은 다듬어진 현재 상태의 서술이다.
- **현재 상태만 쓴다.** 일반 문서는 현재 코드베이스를 설명한다. 전용 `persistence-change`, `persistence-release`, `persistence-format` 기록은 과거 타입의 증거를 보존한다. 릴리스 비교와 형식 체크포인트는 관찰된 이력을 설명하되 호환성을 주장하지 않는다. `upgrade-guide`는 버전 디렉터리의 릴리스에서 다음 릴리스로 가는 변경을 설명한다. Agent Notes와 postmortem은 각자의 과거 범위를 유지한다.
- **통제된 기술 영어를 쓴다.** 행동을 바꿀 수 있는 모호함이 있으면 각 문장에 명확한 행위자와 하나의 주된 동작을 준다. 용어는 개념마다 하나만 쓰고, 직접적인 동사를 선호한다. 겹친 지시와 조건은 나누고, 서술 방식과 예외는 그대로 보존한다. 이 규칙은 인증된 기준이 아니라 ASD-STE100에서 영감을 받은 절제 원칙이다. 정확성이 떨어질 만큼 문장을 짧게 만들지 않는다. 자세한 내용은 [the page-style reference](references/style.md#controlled-technical-english)를 본다.

## Quality criteria

검토할 때 이 정의를 사용한다. 각 섹션은 하위 섹션이나 자세한 내용을 쓰기 전에 짧은 안내 단락으로 시작한다.

- **Brief(간결함):** 일반 경로에는 그 결과에 필요한 사실만 있다. 빠짐없는 진실은 링크 하나나 상세 계층 하나 너머에 둔다.
- **Intuitive(직관적임):** 선행 개념이 의존하는 개념보다 먼저 나오고, 다음 행동이 분명하며, 제목은 독자가 검색하는 용어를 쓴다.
- **Friendly(친절함):** 독자가 성공을 알아볼 수 있고, 행동하기 전에 위험을 이해하고, 흔한 실패에서 복구하며, 더 깊이 볼지 스스로 고를 수 있다.
- **Accurate(정확함):** 지속되는 주장마다 owner가 하나 있고, 그 위험에 비례하는 검증 경로가 있다.
- **Agent-readable(에이전트가 읽을 수 있음):** 메타데이터, 안정적인 제목과 앵커, 용어, owner, 현재/제안 상태가 코퍼스 전체를 불러오지 않고도 목표를 정한 검색을 지원한다.
- **Newcomer-complete(신규 참여자가 완결함):** 저장소 맥락이 없는 전문 엔지니어가 3~5개의 링크된 페이지만으로 관련 아키텍처나 기능을 재구성할 수 있다.

빠짐없이 다루는 레퍼런스에는 보편적인 단어 수 제한을 적용하지 않는다. 대신 진입 경로의 길이, 한 번의 조회에서 훑는 무관한 자료의 양, 가장 큰 섹션, 제목 수, 페이지 크기를 잰다. 검색 비용이 높으면 기존 도메인 owner를 기준으로 나눈다.

## Audit the corpus

요약해서 다시 설명하지 말고, 소유 계약을 읽는다. 계층, 튜토리얼과 레퍼런스의 형식, 분류 체계, budget, slop 체크리스트는 [docs/AGENTS.md](../../../docs/AGENTS.md)에 있다. Agent Note의 수명 주기는 [.agents/notes/README.md](../../notes/README.md)에 있다. 이중언어 짝 규칙은 [docs/i18n/README.md](../../../docs/i18n/README.md)에 있다. 상시 지시는 [root AGENTS.md](../../../AGENTS.md)에 있다. `.agents/notes/archived/`는 감사와 편집에서 제외한다. 보관된 노트는 변하지 않는 이력이다.

범위에 든 사람이 읽는 모든 문서에 작성 순서를 적용한다. Agent Notes에는 적용하지 않는다. 문서를 찾고 그 문서가 다루는 주제를 명시한다. 허용되는 상세 수준을 정하고, 더 깊은 설명은 링크를 통해 소유하는 하위 문서로 옮긴다. 튜토리얼인지 레퍼런스인지는 경로가 아니라 의도된 사용 방식으로 분류한다. 튜토리얼이라면 개념을 선행 관계와 난이도 순으로 배열한다. 실질적으로 섞인 형식은 나눈다. 그다음 배치 제약을 확인한다. 짝을 이룬 문서는 편집할 때마다 짝 업데이트와 `--write` 재기록이 필요하다. 생성된 카탈로그는 손으로 편집하지 않는다. 문서를 옮길 때는 모든 inbound 링크를 같은 변경 안에서 고치며, 원자적으로 처리한다.

구조 점검을 마친 뒤에는 가장 저렴한 탐침부터 써서 slop 체크리스트를 확인한다. 추론 과정이 새어 나온 경우에는 [dsh-trim-cot-leakage](../dsh-trim-cot-leakage/SKILL.md)를 사용한다. 중복된 규칙은 distinctive 구문을 grep해 찾는다. 손으로 쓴 카탈로그와 상태 목록은 권위 있는 owner로 바꾼다. 구현이 끝난 Agent Note에서는 마이그레이션 계획과 미래 시제 명세 언어를 제거한다. 이상치는 `pnpm run verify-doc-budgets --list`와 단어 수 집계로 잰다. 문서를 줄이는 과정에서 설명이 아니라 약속된 동작이 바뀐다면, 먼저 동작 변경을 제안한다([dsh-find-simplifications](../dsh-find-simplifications/SKILL.md)를 따른다). 모든 필수 규칙은 보존한다. 가능하면 한 줄에서 세 줄 정도로 줄이고, 근거로 가는 링크를 붙인다. 버리는 추론을 옮기려고 새 설명을 만들지 않는다.

## Wordcount budgets

`pnpm run verify-doc-budgets`는 상시 문서를 [scripts/doc-budgets.manifest.json](../../../scripts/doc-budgets.manifest.json)의 상한과 비교한다. 빨간 게이트는 [docs/AGENTS.md](../../../docs/AGENTS.md#wordcount-budgets)의 순서 있는 relocate-condense-raise 정책을 따른다. 상한은 보호 장치이지 줄여야 할 목표가 아니다. 목표 이하이면 최소 5%의 여유를 남긴다. 단어에 공간이 필요할 때만 상한을 올리고, PR에서 manifest 변경을 정당화한다.

## Website publication

웹사이트는 테스트된 투영이며, 두 번째 사본이 아니다. [website/docs.ts](../../../website/docs.ts)는 정식 `docs/` 소스를 route 트리에 매핑하는 명시적 공개 허용 목록이다. [scripts/project-doc-site.ts](../../../scripts/project-doc-site.ts)는 이를 일회용 `website/.generated/` 트리로 다시 쓴다. VitePress가 그 트리를 빌드한다. 저장소 Markdown이 편집 가능한 유일한 콘텐츠 소스로 남는다. 번역은 `foo.md`, `foo.zh.md`, `foo.i18n.yaml`처럼 형제 짝으로 유지하며, locale 디렉터리를 쓰지 않는다. 이미 게시된 페이지는 정식 소스에서만 편집한다. 새 페이지는 manifest 항목을 하나 추가한다. 이동하거나 삭제할 때는 소스, manifest 항목, inbound 링크를 원자적으로 함께 바꾼다. `website/.generated/`, `website/.cache/`, `website/.dist/`는 절대 편집하지 않는다. 모든 `DocsPage` 필드는 의도를 가지고 설정하고, projector의 링크 규칙을 따른다. 필드, sidebar 컬렉션, 미리보기 명령은 [references/website-sync.md](references/website-sync.md)를 본다. 콘텐츠를 빌드에 동기화한다고 게시되는 것은 아니다. 배포는 별도로, 명시적으로 요청된 단계다.

## Detailed references

작업에 필요한 레퍼런스만 불러온다. 각 레퍼런스는 이 파일에서 직접 링크되므로, 스킬에는 깊은 참조 사슬이 없다.

- [Metadata, links, and bilingual pairs](references/metadata-links-i18n.md): README frontmatter, kind 체계와 그 도출 방식, description의 의미, 저장소 경로, 줄 정렬, sidecar 기록.
- [Page structure and hierarchy](references/structure-hierarchy.md): 필수 섹션 순서, 섹션 요약, 사용자에서 개발자로 가는 진행, docs 트리 배치, 작은 규칙 파일, Further Exploration, Dev Note의 owner.
- [Page style](references/style.md): 짧은 Summary, `-----` 섹션 구분선, 접을 수 있는 콘텐츠 섹션, 강조 표현의 절제.
- [Review criteria](references/review.md): 신규 참여자 테스트, 근거 점검, 패키지 README 검토, 참조 예시, 검증 명령.
- [Website publication](references/website-sync.md): manifest 필드, projector 링크 규칙, 미리보기와 검증, 배포 분리.

[`templates/`](templates/)의 템플릿은 `kind`마다 작업용 골격을 하나씩 제공한다. 문서의 kind가 가리키는 템플릿을 연 뒤에 쓴다.

문장 수준의 계약 범위와 편집 판단은 [dsh-prose-standard](../dsh-prose-standard/SKILL.md)를 사용한다. `session-persistence-jsonl` README 쌍([English](../../../packages/session/session-persistence-jsonl/README.md), [Chinese](../../../packages/session/session-persistence-jsonl/README.zh.md))이 참조 예시다. 검색 가능한 YAML, Summary와 Table of Contents, 접힌 개발자 섹션을 포함한 사용자에서 개발자로의 진행, Further Exploration, 정식 Model Experience와 Known Limitations 섹션, 마지막 Dev Note를 갖추고 있다.

## Validation

Markdown 문법만이 아니라 영향받는 형식을 검증한다. 강한 약속에는 집중된 유효 fixture와, 최상위 게이트가 실패할 수 있음을 증명하는 무효 fixture가 필요하다.

- README 메타데이터: YAML을 파싱하고, `kind`를 템플릿과 문서 표준에 대응시킨다. `name`, `audience`, 통제되지 않은 `tags`, README 로컬 `i18n` 메타데이터를 거부하고, 설명이 없거나 광고 같은 설명이면 거부한다.
- 이중언어 페이지: 구조, 정확한 줄 수, 용어, 링크 동등성, sidecar 기록을 검증한다.
- 튜토리얼: 문서화된 진입 경로를 실행하거나, 명시적인 수동 검증 owner를 적는다.
- 생성된 레퍼런스: 결정적 최신성 검사를 실행하고 검색 크기 측정값을 보고한다.
- 패키지 README: Summary 게이트를 실행한다. 영어 Summary는 `wc -w` 방식으로 100단어로 제한되며, 실패하면 이 스킬과 kind 템플릿으로 돌아가라고 안내한다. Model Experience와 Known Limitations 검사를 실행한다. 동작에 관한 주장이 바뀌었다면 패키지 중심 테스트도 실행한다. README가 지시하는 모든 명령은 그 주장을 머지하기 전에 다시 실행한다.
- 스킬: 저장소의 스킬 호출 메타데이터 검사를 실행한다.

전체 `pnpm run doc-sync`를 실행하기 전에, 빠른 종합 문서 검사로 `pnpm run test:docs`를 실행한다. 이 검사는 짝 맞춤, 줄바꿈, 링크, README 게이트, budget, 스킬 메타데이터, Agent Note 게이트를 다룬다.

## Dev Note

None.
