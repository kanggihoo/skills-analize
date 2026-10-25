이 프로젝트의 Impeccable 산출물과 설치된 버전이 읽는 내용 사이의 불일치를 보고하고 수정합니다. 대상은 PRODUCT.md, DESIGN.md와 `.impeccable/design.json` 보조 파일, `.impeccable/config.json`, 저장된 화면 브리프, 디자인 hook입니다.

이 작업은 유지보수이지 디자인 작업이 아닙니다. 재설계하지 않습니다. 보고서에서 지정한 파일 외에는 열지 말고, 부수 효과로 다른 명령을 실행하지 않습니다.

## 여기서 다루는 불일치와 다루지 않는 불일치

“오래됨”으로 묶이는 불일치에는 세 종류가 있습니다. 구분해서 다룹니다.

- **도구 버전**: 설치된 Skill이 공개된 최신 버전보다 오래되었습니다. 부팅 시 `impeccable context`가 `UPDATE_AVAILABLE`로 보고하며 `npx impeccable update` 또는 플러그인 설치의 경우 harness 플러그인 관리자에서 수정합니다. 이 명령의 대상이 아닙니다.
- **스키마 불일치**: 더 오래된 Impeccable이 산출물을 작성했습니다. 현재는 읽지 않는 필드, 이제 필요한 필드, 더 이상 쓰지 않는 위치의 파일 등이 해당합니다. 기계적으로 확인할 수 있고 대부분 이 명령이 수정합니다.
- **사실 불일치**: 코드가 바뀌어 문서가 더 이상 현재 코드와 맞지 않습니다. 파일 비교만으로 결론을 낼 수 없습니다. DESIGN.md는 `document`, PRODUCT.md는 `init`이 담당합니다. 이 명령은 막연한 의심 대신 구체적인 차이를 전달합니다.

## 1단계: 검사 실행

```
.agents/skills/impeccable/scripts/impeccable doctor --json
```

사용자가 monorepo 내 workspace, 파일, 경로를 지정했다면 `--target <path>`를 추가합니다. 지정하지 않으면 보고서가 저장소 루트를 대상으로 하며 monorepo에서는 대개 엉뚱한 프로젝트가 됩니다.

출력에는 각각 `id`, `artifact`, `path`, `severity`, `summary`, `fix`를 가진 `findings`가 포함됩니다. monorepo에서는 각 앱의 제품 및 디자인 설정 해석 결과를 담은 `workspaces`도 반환합니다. `ruleRegistryAvailable: false`는 무시된 규칙 ID를 검증할 수 없었다는 뜻입니다. 목록에 문제가 없다고 암시하지 말고 그 사실을 알립니다.

`findings` 배열이 비어 있으면 좋은 결과입니다. 한 줄로 말하고 끝냅니다.

## 2단계: 심각도에 따라 처리

심각도는 **해야 할 일**을 나타내며 문제가 얼마나 심한지는 말하지 않습니다.

- **`auto`**는 별도의 결정을 요구하지 않습니다. `.agents/skills/impeccable/scripts/impeccable doctor --fix`를 한 번 실행해 적용하고 변경한 사항을 한 줄로 보고합니다. 먼저 허락을 구하거나, 사후에 다시 허락을 구하지 않습니다.
- **`mention`**은 사용자가 알아야 하지만 지금 결정할 필요는 없습니다. 각각 수정 방법과 함께 한 문장으로 설명합니다.
- **`route`**는 특정 명령이 필요합니다. 명령과 해결될 공백을 말합니다. 이번 turn에서 사용자가 요청한 경우에만 실행합니다. `init`과 `document`는 대화형 흐름이므로 사용자의 요청 없이 알아서 수리하지 않습니다.

세 그룹 모두 한 번에 보고합니다. 발견 항목은 오류가 아니며 이 명령은 발견 사항이 있어도 실패로 종료되지 않습니다.

## 3단계: 폐기된 필드는 현재 지침에 반영하지 않기

폐기된 필드를 보고하는 발견 사항(현재 사용하는 필드는 `## Register`)은 단순한 스타일 메모가 아닙니다. 해당 값을 무엇이든 앞으로의 판단에서 없는 것으로 취급하고 그 섹션을 삭제하겠다고 제안합니다. “혹시 모르니” 보존하면 이미 폐기한 기준이 계속 산출물을 좌우하게 됩니다.

## 4단계: 사실 불일치를 과장하지 않기

`design-md-drift`는 DESIGN.md를 마지막으로 편집한 시점부터 시각적 소스 디렉터리에서 발생한 commit 수를 계산합니다. commit 수만으로 모순을 입증할 수 없습니다. 횟수와 이 수치가 의미하는 바를 보고하고, 문서가 실제로 틀렸는지 알고 싶다면 현재 토큰 및 컴포넌트와 DESIGN.md를 비교해 답합니다. 숫자가 크다는 이유만으로 DESIGN.md가 오래됐다고 단정하지 않습니다.

`workspace-context-inherited`에도 같은 주의가 필요합니다. 상속은 의도된 동작입니다. 제품 기록 하나가 여러 앱을 정확히 설명하는지는 사용자가 답할 문제이지 고쳐야 할 결함이 아닙니다.

## Monorepo 참고 사항

- `workspace-platform-native-evidence`는 여기서 가장 중요한 발견입니다. 네이티브 빌드 파일이 있는 workspace가 웹용으로 해석되는 루트 기록을 상속하면 평생 웹 가이드만 받고 [ios.md](ios.md)나 [android.md](android.md)를 불러오지 않습니다. 해당 workspace 안에 자식 PRODUCT.md를 만들어 수정합니다. 상속되는 루트 기록 하나에 두 플랫폼을 함께 담을 수 없습니다.
- `config-project-roots-match-nothing`은 모든 `projectRoots` glob이 일치하지 않아 저장소 루트가 현재 프로젝트로 조용히 사용되는 경우입니다. 흔한 원인은 workspace 디렉터리 이름 변경입니다. 패턴을 보고하고 어느 디렉터리를 가리켜야 하는지 묻습니다.
- `config-invalid-build-path`와 `config-build-path-unset`은 `.impeccable/config.json` 또는 개발자별 설정인 Git 제외 `.impeccable/config.local.json`의 `buildPath` 하나를 다룹니다. local 파일이 우선합니다. 이 값은 `comp` 또는 `code`이며, 새로운 Persuade 및 Experience 화면을 생성된 comp로 만들지 코드로 바로 만들지 정합니다. Operate와 Read 화면은 어떤 값이든 코드 중심으로 제작합니다. 값을 읽지 못했다고 반대 경로를 대신 선택하지 않습니다. 따라서 `code`가 의도된 프로젝트는 comp 중심으로 제작되고 있었을 수 있습니다. 정확한 값을 보고합니다. 설정 미지정 발견 사항은 해당 프로젝트가 방향 설정 작업을 수행했지만 선호 경로를 기록하지 않은 경우에만 발생합니다. 이미지 생성 기능을 사용할 수 있을 때만 선택지를 제안합니다. 이미지 생성 기능이 없다면 선택할 것이 없으므로 언급하지 않습니다.
- 변경을 제안하기 전에 `workspaces` 표를 사용해 자체 맥락을 가진 앱, 루트를 상속하는 앱, 맥락이 전혀 없는 앱을 사용자가 알 수 있게 보여줍니다.

## 부팅 검사 비활성화

`impeccable context`는 세션 시작 때 이 발견 항목 중 간단한 범위를 보고하며 프로젝트마다 주 1회로 제한됩니다. 이를 끄려면 `.impeccable/config.json`에 `"stalenessCheck": false`를 설정하거나 한 세션에서만 `IMPECCABLE_NO_STALENESS_CHECK=1`을 사용합니다. 검사를 끄더라도 이 명령은 계속 작동합니다. 사용자가 요청할 때만 보고를 받고 싶은 경우 이 조합을 안내합니다.
