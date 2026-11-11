# ponytail explainer 검증 보고서

원본 스킬 6개의 개별 explainer와 묶음 explainer 1개를 작성했다. [컬렉션 색인](index.html)에서 모두 열 수 있다. 각 페이지는 원본 지시를 분석한 문서다. 스킬을 실제 실행하거나 성능 효과를 측정한 결과가 아니다.

분석 commit은 `835ad00af6ccb24e5ab01bbe0a91f878f95cc417`이다. 사용자가 승인한 `ponytail/` 원본 7개 파일만 commit했다. 분석 결과는 commit하지 않았고 push와 `.gitignore` 수정도 하지 않았다. commit은 로컬에만 있으므로 외부 GitHub 링크에서 아직 해당 commit을 볼 수 없을 수 있다. HTML의 원문 발췌는 finalize 시점에 고정했다.

## 자동 검증

7개 explainer 모두 `validate`, `deliver`, `check`를 통과했다. 표의 결과는 최신 finalize receipt에서 가져왔고, 초안과 HTML의 SHA-256이 그 receipt와 같은지도 확인했다. 이 검증은 HTML 구성과 출처 해석을 확인하며, 내용의 사실성이나 스킬 효과를 증명하지 않는다.

| 페이지 | HTML 크기(B) | validate / deliver / check | 문체 warning | browser-check |
|---|---:|---|---:|---|
| [minimal-code](_group-minimal-code/minimal-code.html) | 682,859 | pass / pass / pass | 0 | 미실시 |
| [ponytail](ponytail/ponytail.html) | 636,407 | pass / pass / pass | 0 | 미실시 |
| [ponytail-audit](ponytail-audit/ponytail-audit.html) | 649,666 | pass / pass / pass | 0 | 미실시 |
| [ponytail-debt](ponytail-debt/ponytail-debt.html) | 950,667 | pass / pass / pass | 0 | 미실시 |
| [ponytail-gain](ponytail-gain/ponytail-gain.html) | 603,996 | pass / pass / pass | 0 | 미실시 |
| [ponytail-help](ponytail-help/ponytail-help.html) | 653,237 | pass / pass / pass | 0 | 미실시 |
| [ponytail-review](ponytail-review/ponytail-review.html) | 641,576 | pass / pass / pass | 0 | 미실시 |

explainer HTML 합계는 **4,818,408B**, `4,818,408 / 1,048,576 = 4.60MiB`다. 이 합계에는 색인, 초안, receipt를 넣지 않았다. explainer의 finalize는 browser-check를 실행하지 않으며, 이번에도 브라우저 실행과 screenshot 검토는 하지 않았다.

저장소의 `scripts/build-index.py`는 Windows 기본 encoding에서 기존 한국어 원장을 읽지 못했다. `python -X utf8 scripts/build-index.py`로 실행해 색인 10개를 만들고 깨진 링크 0개를 확인했다. 스크립트 자체는 수정하지 않았다. 검증 보고서 링크를 추가한 뒤에도 전체 색인의 로컬 링크를 다시 확인했다.

최종 Archify 문체 warning은 0개다. 작성 중 길어진 문단을 나누고 감사 범위는 표로 바꿨다. 추가 문체 검사에서는 English 뒤에 한국어 조사가 붙은 표현 95개를 찾았다. `commit`, `diff`, `validation`, `dependency` 같은 개발 용어, `description` 같은 필드, 파일·도구·스킬 이름은 원문 표기를 유지했다. 일반 단어인 English와 scoreboard는 영어와 수치표로 고쳤다. 개별 위치와 유지한 표현은 [writing-review.json](writing-review.json)에 있다.

## 원문 대조

`ponytail/`에서 재귀적으로 찾은 `SKILL.md` 6개, 총 21,605B를 모두 읽었다. 설치 기록 `skills-lock.json` 1개, 1,497B도 전부 읽었다. 전체 읽음은 7개, 23,102B다. 부분 읽음 파일과 바이너리는 각각 0개다. 원본을 수정하지 않았으며 `git diff --exit-code -- ponytail`로 tracked 원본에 변경이 없음을 확인했다.

일반 설명은 표본을 뽑지 않고 **개별 초안 6개와 묶음 초안 1개 전체**를 원문과 대조했다. 분석자가 만든 적용 예시는 `설명용 예시`로 표시했고 평가에는 `판정`과 근거를 붙였다. 확인한 구체 범위는 다음과 같다.

| 원본 | 전부 대조한 조건과 규칙 |
|---|---|
| ponytail | 모든 코딩 작업이라는 호출 범위, 세션 유지, 수준 3개와 기본 full, lite의 사용자 선택, ultra의 반대 의견, 종료 표현, 영향 범위, 재사용 선택 순서, bug fix 전 호출자 검색, error handling·validation 보존, 새 로직의 테스트 1개 또는 self-check, 사소한 변경 예외, shortcut 주석, 생략 금지, 끝의 1~2줄 보고 |
| ponytail-review | 지정 범위와 미지정 시 변경분·마지막 commit 선택, 연결 코드와 예상 부하, 여섯 기준, 지적의 구체 사례, 한계 주석의 예외, 최소 수정안, 세 심각도, 연속 번호, 시작 2~3문장, 지적별 네 요소와 1~2문장, Verdict·Lean·Not checked, 지적 없음과 코드 수정 금지 |
| ponytail-audit | 미지정 시 전체 저장소, README·config·dependency·진입점·테스트, 중요한 실행 경로와 큰 저장소의 제외 범위, 여섯 기준, 동적 참조까지 검색, 한계 주석의 예외, 세 심각도, 최대 지적 20개와 생략 수, 시작 2~3문장과 부하, 지적별 네 요소와 1~2문장, 종료 보고와 코드 수정 금지 |
| ponytail-debt | .git·.gitignore 제외, 표식과 언어별 주석 접두어, 사용자 지정 표식, 미룬 작업이 아닌 항목 제외, 파일별 한 행, ceiling·upgrade 추출, 선택적 blame, no-trigger, N·M 집계와 빈 결과, 저장 전 확인, 한 번의 보고 |
| ponytail-gain | Ponytail 5·Opus 5.5·기본 effort라는 원문 주장, 39개 작업·각 5회 run·18개 hidden check 작업, 작업별 중앙값의 기하평균, 수치표의 13개 값, 감소율 4개의 산술, ASCII 막대 지시, 현재 저장소 절감량 생성 금지, debt·audit 안내, 모드·flag·파일 변경 금지 |
| ponytail-help | 한 번의 표시와 변경 금지, 수준과 유지, 여섯 스킬 안내, 호스트별 호출, off·중단·재개, band 표시·on·off·import, 기본 full과 환경 변수·config·full 우선순위, off의 의미, 설정 경로, 호스트별 업데이트 안내 |

[관계 원장](relations.md)의 **R01~R14 전부**를 from·to 원문과 대조했다. R01~R05는 참고, R06은 산출물 호환의 추론, R07·R08은 공유 상태, R09는 같은 계열의 추론, R10·R11은 선택적 넘김, R12~R14는 범위 밖 참고다. 내부 위임이나 강제된 전체 실행 순서는 원문에서 찾지 못했다. 묶음 표에는 그림에 생략한 관계도 남겼다. 범위 밖 대상은 끊긴 참조라고 판단하지 않았다.

이름이 같은 다른 컬렉션의 스킬을 찾지 못해 hash 비교 대상은 없다. 이전 분석 결과 폴더와 `.agents`는 비교에서 제외했다. 모든 스킬의 description과 호출 제한 필드는 commit된 frontmatter를 `@code`로 가져왔다. 어느 원본에도 `disable-model-invocation` 필드는 없었다. description을 정확한 단어 일치 조건으로 설명하지 않았다.

## 미확인 자료와 제외 파일

`ponytail-gain`이 수치 출처로 지목한 `benchmarks/results/2026-10-07-agentic.md`와 README는 컬렉션에 없다. 두 자료를 읽거나 benchmark를 재현하지 못했다. 따라서 gain 페이지 결론과 원장에 **부분 분석**을 표시했다. 수치가 원문과 같다는 것은 확인했지만 측정이 정확하다고 판단하지 않았다.

help가 안내하는 외부 전체 문서와 호스트 구현은 범위 밖이다. 자동 활성화, config 해석, band, plugin 업데이트는 지시상 동작만 설명했다. 설정 변경·설치·업데이트 명령은 실행하지 않았다.

작업 중 다음 번역본 6개가 나타났다. 이번 분석에서 생성한 파일이 아니며 열거나 수정하거나 commit하지 않았다.

- `ponytail/ponytail/SKILL.ko.md`
- `ponytail/ponytail-review/SKILL.ko.md`
- `ponytail/ponytail-audit/SKILL.ko.md`
- `ponytail/ponytail-debt/SKILL.ko.md`
- `ponytail/ponytail-gain/SKILL.ko.md`
- `ponytail/ponytail-help/SKILL.ko.md`

## 사람 검토

**미실시.** 독자가 설명을 이해했는지, 시각적 배치와 상호작용이 읽기 좋은지는 확인하지 않았다. 브라우저 검토와 사람 검토를 HTML 자동 검증과 구분한다.
