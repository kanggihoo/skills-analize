# dsh-doc 스킬은 에이전트를 어떻게 바꾸나 {#dsh-doc-skill}

`dsh-doc`을 쓰면 에이전트는 DeepSeek Harness 문서를 쓰기 전에 독자와 문서 종류를 정하고, `kind` 필드 하나로 템플릿을 고른다. 문서에 적을 명령과 동작은 읽는 것으로 끝내지 않고 실행해서 확인한다. 영어·중국어 쌍은 같은 작업에서 줄 수까지 맞추고, 문서 웹사이트에는 허용 목록에 있는 글만 projection(사이트용 파일로 변환)한다.[](source:dm-summary)

- 문서 종류는 `kind` 필드가 정한다. 종류 8개마다 템플릿이 하나씩 있고, 템플릿 없는 종류는 없다.[](source:dm-kind-intro)[](source:meta-derive)
- 동작·명령·기본값·오류·플랫폼 차이를 말하는 문단은 현재 체크아웃에서 실행해 본 것만 남긴다. 재현하지 못한 것은 지운다.[](source:dm-fact-intro)[](source:dm-f3)
- 영어·중국어 쌍은 같은 작업에서 고치고, 고칠 때마다 sidecar 파일(번역 쌍의 해시 기록)을 다시 기록한다.[](source:dm-s6)[](source:dm-f5)
- 웹사이트에 동기화해도 인터넷에 게시되지 않는다. 사용자가 배포를 명시적으로 요청하고 호스팅 정책을 확인해 줄 때만, 에이전트가 배포 설정을 더한다.[](source:web-dep)

@answer scope="deepseek-harness/dsh-doc · 원본 텍스트 파일 14개 · 커밋 475505c · 지시상 동작"
@meta locale=ko
@source dm-fm title="deepseek-harness/dsh-doc/SKILL.md · 18418B · frontmatter" path=deepseek-harness/dsh-doc/SKILL.md lines=1:4
@source dm-summary title="SKILL.md · Summary" path=deepseek-harness/dsh-doc/SKILL.md lines=10:10
@source dm-flow title="SKILL.md · Workflow 도입" path=deepseek-harness/dsh-doc/SKILL.md lines=28:28
@source dm-s1 title="SKILL.md · 1단계" path=deepseek-harness/dsh-doc/SKILL.md lines=30:30
@source dm-s2 title="SKILL.md · 2단계" path=deepseek-harness/dsh-doc/SKILL.md lines=31:31
@source dm-s3 title="SKILL.md · 3단계" path=deepseek-harness/dsh-doc/SKILL.md lines=32:32
@source dm-s4 title="SKILL.md · 4단계" path=deepseek-harness/dsh-doc/SKILL.md lines=33:33
@source dm-s5 title="SKILL.md · 5단계" path=deepseek-harness/dsh-doc/SKILL.md lines=34:34
@source dm-s6 title="SKILL.md · 6단계" path=deepseek-harness/dsh-doc/SKILL.md lines=35:35
@source dm-s7 title="SKILL.md · 7단계" path=deepseek-harness/dsh-doc/SKILL.md lines=36:36
@source dm-s8 title="SKILL.md · 8단계" path=deepseek-harness/dsh-doc/SKILL.md lines=37:37
@source dm-fact-intro title="SKILL.md · 사실 확인 절차 도입" path=deepseek-harness/dsh-doc/SKILL.md lines=41:41
@source dm-f1 title="SKILL.md · 사실 확인 1" path=deepseek-harness/dsh-doc/SKILL.md lines=43:43
@source dm-f2 title="SKILL.md · 사실 확인 2" path=deepseek-harness/dsh-doc/SKILL.md lines=44:44
@source dm-f3 title="SKILL.md · 사실 확인 3" path=deepseek-harness/dsh-doc/SKILL.md lines=45:45
@source dm-f4 title="SKILL.md · 사실 확인 4" path=deepseek-harness/dsh-doc/SKILL.md lines=46:46
@source dm-f5 title="SKILL.md · 사실 확인 5" path=deepseek-harness/dsh-doc/SKILL.md lines=47:47
@source dm-kind-intro title="SKILL.md · 종류 체계 도입" path=deepseek-harness/dsh-doc/SKILL.md lines=51:51
@source dm-kind-list title="SKILL.md · 종류와 템플릿 목록" path=deepseek-harness/dsh-doc/SKILL.md lines=53:60
@source dm-kind-open title="SKILL.md · 템플릿을 먼저 연다" path=deepseek-harness/dsh-doc/SKILL.md lines=62:62
@source dm-v1 title="SKILL.md · Summary 규칙" path=deepseek-harness/dsh-doc/SKILL.md lines=68:68
@source dm-v2 title="SKILL.md · 개발자 절 규칙" path=deepseek-harness/dsh-doc/SKILL.md lines=69:69
@source dm-v3 title="SKILL.md · Dev Note 규칙" path=deepseek-harness/dsh-doc/SKILL.md lines=70:70
@source dm-v4 title="SKILL.md · 현재 상태만" path=deepseek-harness/dsh-doc/SKILL.md lines=71:71
@source dm-v5 title="SKILL.md · 통제된 기술 영어" path=deepseek-harness/dsh-doc/SKILL.md lines=72:72
@source dm-q title="SKILL.md · 품질 기준 여섯 가지" path=deepseek-harness/dsh-doc/SKILL.md lines=78:83
@source dm-q-limit title="SKILL.md · 보편 단어 한도 없음" path=deepseek-harness/dsh-doc/SKILL.md lines=85:85
@source dm-audit-own title="SKILL.md · 감사: 소유 계약과 제외" path=deepseek-harness/dsh-doc/SKILL.md lines=89:89
@source dm-audit-order title="SKILL.md · 감사: 문서 쓰는 순서와 배치 제약" path=deepseek-harness/dsh-doc/SKILL.md lines=91:91
@source dm-audit-slop title="SKILL.md · 감사: AI 티 나는 표현 점검" path=deepseek-harness/dsh-doc/SKILL.md lines=93:93
@source dm-budget title="SKILL.md · 단어 수 예산" path=deepseek-harness/dsh-doc/SKILL.md lines=97:97
@source dm-web title="SKILL.md · 웹사이트 게시" path=deepseek-harness/dsh-doc/SKILL.md lines=101:101
@source dm-ref115 title="SKILL.md · 문장 규칙 위임과 참고 예시" path=deepseek-harness/dsh-doc/SKILL.md lines=115:115
@source dm-val title="SKILL.md · 검증" path=deepseek-harness/dsh-doc/SKILL.md lines=121:128
@source dm-val-pkg title="SKILL.md · 검증: 패키지 README" path=deepseek-harness/dsh-doc/SKILL.md lines=125:125
@source meta-fm title="deepseek-harness/dsh-doc/references/metadata-links-i18n.md · 9495B · 머리말·종류·이중 언어" path=deepseek-harness/dsh-doc/references/metadata-links-i18n.md lines=28:28
@source meta-derive title="metadata-links-i18n.md · 종류 도출 순서" path=deepseek-harness/dsh-doc/references/metadata-links-i18n.md lines=32:37
@source meta-table title="metadata-links-i18n.md · 종류 표" path=deepseek-harness/dsh-doc/references/metadata-links-i18n.md lines=39:48
@source meta-check title="metadata-links-i18n.md · 종류 점검과 설치 명령" path=deepseek-harness/dsh-doc/references/metadata-links-i18n.md lines=50:50
@source meta-desc title="metadata-links-i18n.md · description 품질" path=deepseek-harness/dsh-doc/references/metadata-links-i18n.md lines=54:54
@source meta-links title="metadata-links-i18n.md · 저장소 링크" path=deepseek-harness/dsh-doc/references/metadata-links-i18n.md lines=62:64
@source meta-align title="metadata-links-i18n.md · 줄 맞춤" path=deepseek-harness/dsh-doc/references/metadata-links-i18n.md lines=68:68
@source meta-eq title="metadata-links-i18n.md · 줄 일치의 한계" path=deepseek-harness/dsh-doc/references/metadata-links-i18n.md lines=70:70
@source meta-sidecar title="metadata-links-i18n.md · sidecar 파일" path=deepseek-harness/dsh-doc/references/metadata-links-i18n.md lines=74:74
@source rev-newcomer title="deepseek-harness/dsh-doc/references/review.md · 6060B · 리뷰 기준" path=deepseek-harness/dsh-doc/references/review.md lines=18:18
@source rev-run title="review.md · 실행이 근거" path=deepseek-harness/dsh-doc/references/review.md lines=24:24
@source rev-class title="review.md · 설치 안내 분류" path=deepseek-harness/dsh-doc/references/review.md lines=26:26
@source rev-pkg title="review.md · 패키지 README 점검" path=deepseek-harness/dsh-doc/references/review.md lines=34:43
@source struct-order title="deepseek-harness/dsh-doc/references/structure-hierarchy.md · 6276B · 페이지 구조" path=deepseek-harness/dsh-doc/references/structure-hierarchy.md lines=21:28
@source struct-except title="structure-hierarchy.md · 예외와 패키지 README 끝 구조" path=deepseek-harness/dsh-doc/references/structure-hierarchy.md lines=30:30
@source struct-fold title="structure-hierarchy.md · 접는 블록" path=deepseek-harness/dsh-doc/references/structure-hierarchy.md lines=42:44
@source struct-move title="structure-hierarchy.md · 이동은 한 주제씩" path=deepseek-harness/dsh-doc/references/structure-hierarchy.md lines=65:65
@source struct-fe title="structure-hierarchy.md · Further Exploration" path=deepseek-harness/dsh-doc/references/structure-hierarchy.md lines=77:77
@source style-sum title="deepseek-harness/dsh-doc/references/style.md · 4117B · 페이지 문체" path=deepseek-harness/dsh-doc/references/style.md lines=18:18
@source style-cte title="style.md · 통제된 기술 영어" path=deepseek-harness/dsh-doc/references/style.md lines=24:29
@source style-len title="style.md · 문장 길이" path=deepseek-harness/dsh-doc/references/style.md lines=31:31
@source style-sep title="style.md · 구분선" path=deepseek-harness/dsh-doc/references/style.md lines=35:35
@source style-fold title="style.md · 접는 블록과 패키지 README 끝 구조" path=deepseek-harness/dsh-doc/references/style.md lines=39:41
@source style-bold title="style.md · 강조" path=deepseek-harness/dsh-doc/references/style.md lines=45:45
@source web-own title="deepseek-harness/dsh-doc/references/website-sync.md · 6850B · 웹사이트 게시" path=deepseek-harness/dsh-doc/references/website-sync.md lines=19:21
@source web-class title="website-sync.md · 변경 유형" path=deepseek-harness/dsh-doc/references/website-sync.md lines=25:31
@source web-link title="website-sync.md · 링크 규칙" path=deepseek-harness/dsh-doc/references/website-sync.md lines=49:58
@source web-prev title="website-sync.md · 미리보기와 검증" path=deepseek-harness/dsh-doc/references/website-sync.md lines=62:87
@source web-dep title="website-sync.md · 배포 분리" path=deepseek-harness/dsh-doc/references/website-sync.md lines=91:91
@source tg-rules title="deepseek-harness/dsh-doc/templates/package-group.md · 1867B · package-group 규칙" path=deepseek-harness/dsh-doc/templates/package-group.md lines=55:59
@source tr-rules title="deepseek-harness/dsh-doc/templates/package-reference.md · 3860B · package-reference 규칙" path=deepseek-harness/dsh-doc/templates/package-reference.md lines=100:103
@source tl-rules title="deepseek-harness/dsh-doc/templates/package-library.md · 3546B · package-library 규칙" path=deepseek-harness/dsh-doc/templates/package-library.md lines=94:96
@source tb-rules title="deepseek-harness/dsh-doc/templates/package-bundle.md · 3409B · package-bundle 규칙" path=deepseek-harness/dsh-doc/templates/package-bundle.md lines=101:103
@source pc-gen title="deepseek-harness/dsh-doc/templates/persistence-change.md · 4312B · persistence-change" path=deepseek-harness/dsh-doc/templates/persistence-change.md lines=16:16
@source pc-rules title="persistence-change.md · 규칙" path=deepseek-harness/dsh-doc/templates/persistence-change.md lines=66:70
@source pr-rules title="deepseek-harness/dsh-doc/templates/persistence-release.md · 3123B · persistence-release" path=deepseek-harness/dsh-doc/templates/persistence-release.md lines=3:3
@source pr-chain title="persistence-release.md · 인정 체인에 끼우지 않는다" path=deepseek-harness/dsh-doc/templates/persistence-release.md lines=30:30
@source pf-sec title="deepseek-harness/dsh-doc/templates/persistence-format.md · 2412B · persistence-format" path=deepseek-harness/dsh-doc/templates/persistence-format.md lines=3:3
@source pf-keep title="persistence-format.md · 현재 카탈로그를 복제하지 않는다" path=deepseek-harness/dsh-doc/templates/persistence-format.md lines=25:25
@source tu-skel title="deepseek-harness/dsh-doc/templates/upgrade-guide.md · 909B · upgrade-guide" path=deepseek-harness/dsh-doc/templates/upgrade-guide.md lines=3:3
@source rel-ps title="deepseek-harness/dsh-prose-standard/SKILL.md · 9899B · 관계 확인용(8번 줄만)" path=deepseek-harness/dsh-prose-standard/SKILL.md lines=8:8
@source rel-tc title="deepseek-harness/dsh-trim-cot-leakage/SKILL.md · 7699B · 관계 확인용(43번 줄만)" path=deepseek-harness/dsh-trim-cot-leakage/SKILL.md lines=43:43

## 언제 켜지고 언제 쓰지 않나 {#trigger}

@code source=dm-fm language=yaml

머리말(frontmatter)에는 `name`과 `description`만 있고 호출 제한 필드가 없다.[](source:dm-fm) 판정: 모델이 `description`을 참고해 스스로 켤 수 있는 모델 호출형 스킬이다. `description`은 모델이 판단할 때 참고하는 설명이며, 특정 단어가 나오면 켜지는 목록이 아니다.

`description`이 쓸 곳으로 드는 것은 새 DSH 문서나 고친 문서, `docs/` 트리 정리, 문서 품질 감사와 예산, 웹사이트 페이지 게시, 이중 언어 문서의 구조 변경이다.[](source:dm-fm)

| 상황 | 원문의 지시 |
| --- | --- |
| 사람이 읽는 DSH 문서(패키지 README, `docs/` 문서, 웹사이트 페이지) | 이 워크플로를 따른다.[](source:dm-flow) |
| `Agent Note`, 사후 분석(postmortem) | 저장소가 정한 골격을 그대로 둔다. 권장 페이지 순서와 감사의 "문서 쓰는 순서"는 `Agent Note`에 적용하지 않는다.[](source:struct-order)[](source:dm-audit-order) {caution:일부만 적용} |
| 구현이 끝난 `Agent Note` | 감사 때 이행 계획과 미래형 명세 문장을 지운다.[](source:dm-audit-slop) |
| `.agents/notes/archived/` | 감사와 수정에서 뺀다. 보관된 노트는 얼어붙은 기록이다.[](source:dm-audit-own) {bad:건드리지 않음} |
| 작은 기계 소유 파일, 생성 조각, 다른 머리말을 정의하는 형식 | 요약·목차 틀을 억지로 씌우지 않는다. 예외는 형식 소유자 쪽에 적는다.[](source:struct-except) |
| 확장 번역 스킬 | 자동으로 부르지 않는다. 이중 언어 문서를 고칠 때는 `docs/AGENTS.md`의 가벼운 일상 경로를 따른다.[](source:web-own) |
| 웹사이트 공개 범위 | `docs/`에 있다는 이유로 RFC, postmortem, 테스트 가이드, `AGENTS.md`, 유지보수 워크플로를 올리지 않는다. 사용자가 공개 범위를 명시적으로 넓힐 때만 더한다.[](source:web-class) |
| 웹사이트 배포 | GitHub Pages 권한, 배포 워크플로, 사용자 도메인, 공개 호스팅은 사용자가 배포를 명시적으로 요청하고 호스팅 정책을 확인했을 때만 더한다.[](source:web-dep) {bad:묻기 전에는 금지} |

## 작업은 어떤 순서로 진행하나 {#workflow}

요청받은 범위 하나마다 여덟 단계를 이 순서로 따른다. 일반 독자가 읽는 경로는 짧게 유지한다. 그러나 실패·소유자·한계 같은 필수 계약은 단어 수를 줄이려고 지우지 않는다.[](source:dm-flow)

@workflow id=doc-flow title="dsh-doc 작업 순서"
| lane prep | 준비 |
| lane write | 쓰기 |
| lane prove | 확인 |
| read | 자료 읽기 | backend | prep |
| classify | 종류 분류 | backend | prep |
| place | 위치 정하기 | backend | prep |
| reader | 독자 상태 정의 | backend | prep |
| write | 머리말·본문 쓰기 | backend | write |
| pair | 중국어 쌍 맞추기 | backend | write |
| verify | 주장 검증 | security | prove |
| check | 검사·diff 재독 | backend | prove |
| read > classify | |
| classify > place | |
| place > reader | |
| reader > write | |
| write > pair | |
| pair > verify | |
| verify > check | 통과 | emphasis |

@steps id=doc-steps
| read | 자료 읽기 | 루트와 더 구체적인 `AGENTS.md`, 문서 표준(`docs/AGENTS.md`), 대상 페이지와 그 근거 코드·테스트, 내비게이션 소유자, 이중 언어 기록을 읽는다.[](source:dm-s1) | doc-flow | read |
| classify | 종류 분류 | 페이지를 주된 일 하나와 독자로 분류한다. 후보는 제품 빠른 시작, 사용자 과제 가이드, 기여자 튜토리얼, 아키텍처 개요, 패키지·하위 시스템 레퍼런스, 생성 레퍼런스, 에이전트 지시, 결정 기록, 임시 메모다.[](source:dm-s2) | doc-flow | classify |
| place | 위치 정하기 | 가장 가까운 소유자에 둔다. 패키지 계약은 패키지 코드 옆에 두고, 패키지에 걸친 학습·사용자·개발자·아키텍처·논의 자료와 만료되는 임시 자료는 `docs/`에 둔다.[](source:dm-s3) | doc-flow | place |
| reader | 독자 상태 정의 | 세부 내용을 쓰기 전에 독자의 시작 상태, 관찰할 결과, 있을 법한 실패, 복구 경로, 다음 깊이를 정한다.[](source:dm-s4) | doc-flow | reader |
| write | 머리말·본문 쓰기 | 이 문서의 일에 맞는 `kind`를 머리말에 적는다. 그다음 `Summary`, `Table of Contents`, 사용자용 내용, 개발자용 내용, 선택 `Further Exploration`, 마지막 `Dev Note` 순으로 쓴다. 문서 종류가 허용할 때만 이 순서를 따른다.[](source:dm-s5) | doc-flow | write |
| pair | 중국어 쌍 맞추기 | 같은 작업에서 짝 문서도 고친다. 제목·목록·표·코드·링크·머리말 배치·물리적 줄 수를 맞춘다.[](source:dm-s6) | doc-flow | pair |
| verify | 주장 검증 | 모든 주장을 코드·테스트·생성기·패키지 메타데이터·현재 결정 소유자와 대조하고, 문서가 시키는 동작은 실행한다. 파생 산출물보다 소유자를 먼저 고친다.[](source:dm-s7) | doc-flow | verify |
| check | 검사·diff 재독 | 초점 검사를 돌린 뒤 `pnpm run test:docs`, `pnpm run doc-sync`, `pnpm run lint`, `git diff --check`를 돌린다. 전체 diff를 정확성 기준으로 한 번, 간결성과 저장소 적합성 기준으로 한 번 다시 읽는다.[](source:dm-s8) | doc-flow | check |

원문은 이 여덟 단계 어디에서도 사용자에게 묻도록 하지 않는다. 사람이 개입하는 경우는 배포 요청·공개 범위 확대처럼 위 표에 적은 경우뿐이다. 에이전트는 쓰기 전에 템플릿을 열고, 종류가 가리키는 템플릿 파일의 뼈대와 규칙을 따른다.[](source:dm-kind-open)

@callout level=warning title="읽는 것이 아니라 실행하는 것이 근거다"
새 문서와, 동작·명령·기본값·오류·플랫폼 차이를 주장하는 새 문단마다 아래 절차가 의무다.[](source:dm-fact-intro) 실행한 근거가 없는 주장은 문서에 남기지 않는다.

@list ordered=true
| 설치 안내를 쓰기 전에 대상을 분류한다. 폴더 이름이 아니라 `package.json`의 `dsh.bundle.patch`와 진입 파일의 모양을 본다.[](source:dm-f1) |
| 주장하는 모든 명령·설정 예·프로필 예를 문서에 나올 모양 그대로 현재 체크아웃에서 실행한다. 관찰한 출력·경고·실패 방식만 적는다. 키나 네트워크가 없어 확인할 수 없으면 그렇게 쓰고 검증 소유자를 적는다.[](source:dm-f2)[](source:rev-run) |
| 재현하지 못한 것은 지운다. 기억, 유추, 이웃 패키지 README에서 가져오지 않는다. 주장이 재현되지 않으면 테스트가 아니라 주장을 고친다.[](source:dm-f3) |
| 기존 페이지는 고치기 전에 `git fetch origin`으로 가져와 `origin/master`의 같은 절과 비교한다. master에 남은 낡은 진술도 틀린 것이다. 옛 문장이 아니라 코드를 기준으로 고친다.[](source:dm-f4) |
| 짝을 고칠 때마다 `pnpm run verify-translation-pairing --write <pair>`를 다시 돌려 확인된 쌍을 기록한다.[](source:dm-f5) |

## 문서 종류와 템플릿은 어떻게 고르나 {#kind}

`kind` 필드가 템플릿 하나를 고른다. 문서 점검은 같은 기계적 사실로 기대하는 종류를 계산하고, 다른 값이 적혀 있으면 거부한다.[](source:dm-kind-intro)[](source:meta-check) 새 종류는 별도의 템플릿 파일, 저장소 안의 분명한 위치나 선언된 소유자, 문서를 그 종류에 대응시키는 검사가 함께 있을 때만 더한다.[](source:dm-kind-open)

| `kind` | 문서 위치 | 템플릿이 요구하는 것 |
| --- | --- | --- |
| `package-group` | `packages/README.md`, `packages/<group>/README.md` | 계열의 지도다. 직접 속한 패키지를 한 줄 역할과 함께 표로 보이고 패키지 계약은 되풀이하지 않는다. `Model Experience`와 `Known Limitations` 절은 넣지 않는다.[](source:meta-table)[](source:tg-rules) |
| `package-reference` | 플러그인 진입점이 있는 패키지 README | 테스트 구성에 마운트해 모든 명령·필드·기본값을 실행해 본 것만 쓴다. 설치는 `cordis.yml` 행으로 설명한다. 두 절은 통과 조건이 정한 형식에 맞춘다.[](source:meta-table)[](source:tr-rules) |
| `package-library` | 평범한 모듈 진입점이 있는 패키지 README | 프로필 설치 안내와 마운트 설정을 쓰지 않는다. 소비자 진입점과 경계를 쓴다.[](source:meta-table)[](source:tl-rules) |
| `package-bundle` | `dsh.bundle.patch`를 선언한 패키지 README | 임시 프로필에서 `dsh plugin --profile <name> add`를 실행해 경고·레이어 활성화·실패 방식을 확인한 뒤 쓴다. 라이브러리나 단일 플러그인처럼 쓰지 않는다.[](source:meta-table)[](source:tb-rules) |
| `persistence-change` | `docs/persistence-changes/YYYY-MM-DD-slug.md`와 중국어 짝 | 기계가 탐지한 영속 타입 변경만 설명한다. 선언 블록은 하나이고 영·중 블록이 바이트 동일하다.[](source:meta-table)[](source:pc-gen)[](source:pc-rules) |
| `persistence-release` | `docs/persistence-changes/releases/dsh-v*.md`와 중국어 짝 | 태그된 릴리스의 타입을 재구성한 관찰 기록이다. 호환성 인정이 아니다.[](source:meta-table)[](source:pr-rules)[](source:pr-chain) |
| `persistence-format` | `docs/persistence-changes/historical-formats/vN.md`와 중국어 짝 | 선택한 과거 Session 포맷의 완전한 스키마를 담는다. 현재 카탈로그를 과거 파일 이름으로 복제하지 않는다.[](source:meta-table)[](source:pf-sec)[](source:pf-keep) |
| `upgrade-guide` | `docs/upgrade-guide/v<version>/<item>/guide.md`와 중국어 짝 | `Change`와 `Migration` 두 절만 둔다. 영어 500단어 이하다. 범위·배치·유지·길이 규칙은 `dsh-create-upgrade-guide`가 소유한다.[](source:meta-table)[](source:tu-skel) |

패키지 README의 종류는 아래 순서로 기계적으로 도출한다.[](source:meta-derive)

@list ordered=true
| README가 `packages/README.md` 또는 `packages/<group>/README.md`면 `package-group`이다. |
| 패키지 매니페스트가 `dsh.bundle.patch`를 선언하면 `package-bundle`이다. |
| `scripts/doc-standard.spec.ts`의 감사된 라이브러리 목록에 있으면 `package-library`다. |
| 그 밖의 서비스 기본 내보내기나 `apply` 플러그인은 `package-reference`다. |

설치 안내는 패키지 모양에 맞는 것만 쓴다. 다른 모양을 위해 쓴 설치 안내는 리뷰에서 거부한다.[](source:rev-class)

| 모양 | 판별 사실 | 설치 안내 |
| --- | --- | --- |
| 번들 | `package.json`에 `dsh.bundle.patch`가 있다 | `dsh plugin --profile <name> add <package>`만이 프로필 레이어를 켠다.[](source:dm-f1) |
| 플러그인 | 진입 파일이 `apply`나 기본 서비스를 내보낸다 | `cordis.yml` 행으로 마운트한다. `dsh plugin add`를 설치 경로로 쓰지 않는다. {bad:쓰지 않음}[](source:dm-f1)[](source:tr-rules) |
| 라이브러리 | 평범한 모듈 API다 | 의존성이며 자체 설치 경로가 없다. {bad:쓰지 않음}[](source:dm-f1)[](source:tl-rules) |

머리말은 `description`과 `kind`만 필수로 둔다. `name`, `audience`, 관리되지 않는 `tags`, README 로컬 `i18n` 메타데이터는 거부한다.[](source:meta-check) `description`은 스킬 설명처럼 쓴다. 페이지가 다루는 것과 이 페이지를 언제 열어야 하는지를 한두 문장으로 쓰고, 이웃 문서와 구별하며, 변경 이력이나 상태 보고를 넣지 않는다.[](source:meta-desc)

## 페이지는 어떻게 쓰고 이중 언어 쌍은 어떻게 맞추나 {#writing}

사람이 읽는 페이지는 아래 순서를 따른다. 문서 종류의 소유자가 허용할 때만 적용한다.[](source:struct-order)

@list ordered=true
| YAML 머리말. |
| H1 제목. |
| 이중 언어 페이지의 언어 전환 링크. |
| `## Summary`. 읽는 사람이 무엇을 할 수 있고 왜 필요한지, 작동 방식, 가장 중요한 경계를 3~5문장으로 쓴다. |
| `## Table of Contents`. 페이지의 H2 절로 가는 링크만 둔다. |
| 사용자용 내용에서 개발자용 설계·운영 세부 순서의 본문. |
| 선택 `## Further Exploration`. |
| 마지막 `## Dev Note`. 비권위 작업 맥락이다. |

패키지 README는 마지막 두 H2를 `Model Experience`와 `Known Limitations and Deferred Work`로 둔다. `Further Exploration`은 그 앞에 두고, 마지막 `### Dev Note`는 한계 H2 안에 둔다.[](source:struct-except)

| 규칙 | 내용 |
| --- | --- |
| `Summary`는 무엇을 하는지 쓴다 | 역할·타입·내부 정체성이 아니라 사용자나 에이전트가 할 수 있는 일을 쓴다. Cordis 역할, 등록, 내부 구성요소는 쓰지 않는다. 소스 식별자는 독자가 설정·명령·공개 API에서 직접 쓸 때만 쓴다.[](source:dm-v1) |
| 개발자 절은 설명하되 나열하지 않는다 | 설계 개념, 아키텍처, 대략적 데이터 흐름과 코드 링크를 쓴다. API 전체 목록, 컬럼 목록, 이벤트 페이로드 열거, JSDoc 재서술은 접는 블록 안에서도 금지한다.[](source:dm-v2)[](source:struct-fold) |
| `Dev Note`만 덜 다듬어도 된다 | 부분 아이디어, 메모, 정해지지 않은 방향, 측정 산출물, 작업 가설은 마지막 `Dev Note`에만 두고 비권위로 표시한다. 나머지 절은 다듬은 현재 상태 문장이다.[](source:dm-v3) |
| 현재 상태만 쓴다 | 일반 문서는 현재 코드베이스를 쓴다. 과거 타입 증거는 `persistence-*` 기록이 맡고, `upgrade-guide`는 그 폴더의 릴리스에서 다음 릴리스로의 변화를 쓴다.[](source:dm-v4) |
| 통제된 기술 영어를 쓴다 | 모호함이 동작을 바꿀 수 있으면, 문장마다 주체와 주된 행동을 하나씩 둔다. 개념마다 용어를 하나만 쓰고, 직접 동사를 쓰고, 한 문장에는 지시를 하나만 담고, 세 개 이상의 단계나 조건은 목록으로 쓴다. 이 규율은 ASD-STE100에서 영감을 얻었지만 인증받은 것이 아니고, 통제 사전은 검증하지 않는다.[](source:dm-v5)[](source:style-cte) |
| 굵은 글씨를 아낀다 | 행동을 바꾸는 절이나 중요한 비교에만 쓴다.[](source:style-bold) |

접는 블록과 구분선에는 형식 규칙이 있다.

- 개발자용 세부와 `Dev Note`는 `<details>`로 접는다. 절 제목(H2·H3)과 `<a id>` 앵커는 보이게 둔다.[](source:style-fold)
- 블록 안에서는 `<summary>` 뒤에 빈 줄을 두고 모든 마크다운 줄을 0열에 둔다. 들여쓰면 코드 블록이 되기 때문이다.[](source:style-fold)
- 큰 부분 사이에는 앞뒤에 빈 줄을 둔 `-----`를 쓴다. 문단 바로 뒤의 `-----` 줄은 Setext 제목으로 읽힌다. 패키지 README의 마지막 두 H2 안에 구분선을 두면 `Model Experience` 통과 조건이 깨진다.[](source:style-sep)

@facts id=doc-numbers
| `Summary` 길이 | 3~5문장. 영어 패키지 README는 `wc -w` 방식으로 100단어 이하이고 `verify-package-readme-summaries`가 강제한다.[](source:style-sum)[](source:dm-val-pkg) |
| `Further Exploration` | 직접 관련된 페이지 3~7개. 가까운 선행부터 놓고 각각 무엇을 더하는지 짧게 적는다. 사이트 전체 색인으로 키우지 않는다.[](source:struct-fe) |
| 문장 길이 | 지시문 20단어, 설명문 25단어는 리뷰 신호이며 기계적 통과 조건이 아니다. `must`, `may`, `never`, 시점, 예외, 수치를 길이 때문에 빼거나 강화하지 않는다.[](source:style-len) |
| 단어 수 예산 | 단어 수가 목표 이하일 때 5% 이상 여유를 남긴다. 천장은 가드레일이고, 줄여야 할 목표가 아니다. 천장은 말이 실제로 필요할 때만 올리고, PR에서 manifest 변경을 정당화한다.[](source:dm-budget) |
| 새내기 시험 | 저장소 맥락이 없는 전문 엔지니어가 연결된 페이지 3~5개를 읽고 기능, 안전한 사용법, 상태 위치, 소유 컴포넌트, 실패 방식, 고칠 곳을 답할 수 있어야 한다.[](source:rev-newcomer)[](source:dm-q) |

원문은 방대한 레퍼런스에 보편 단어 한도를 적용하지 않는다. 대신 진입 경로 길이, 조회 하나에 훑는 무관한 내용, 가장 큰 절, 제목 수, 페이지 크기를 잰다. 조회 비용이 크면, 기존 도메인 소유자를 기준으로 쪼갠다.[](source:dm-q-limit)

**이중 언어 쌍.** 영어와 간체 중국어는 동등한 권위를 가진다. 머리말 키 순서, 제목, 빈 줄, 문단, 목록 항목, 표, 코드 펜스, 링크 대상, 전체 물리적 줄 수를 일대일로 맞춘다.[](source:meta-align)

- 영어 쪽 상대 링크는 `.md`를 가리킨다. 중국어 쪽은 짝이 있으면 `.zh.md`를, 없으면 `.md`를 가리킨다.[](source:meta-align)
- 산문은 대응하는 줄 안에서 자연스럽게 번역하고 어느 쪽도 하드랩하지 않는다. 코드 블록은 바이트 동일하게 둔다.[](source:meta-align)
- `*.i18n.yaml` sidecar 파일은 제목 절마다 해시 쌍을 적는다. 코드 블록과 생성 영역은 뺀다. 어느 언어가 바뀌든 `--write`로 다시 기록한다.[](source:meta-sidecar)
- 내용 해시를 README 머리말에 복사하지 않는다. 독립 편집이 같은 머리말 줄을 건드려 병합 충돌이 나기 때문이다.[](source:meta-sidecar)
- 줄 수가 같다는 것은 구조 검사일 뿐 의미가 충실하다는 증명이 아니다. 완전성, 용어, 자연스러움, 각 줄이 같은 명제를 말하는지는 리뷰가 맡는다.[](source:meta-eq)

## 감사·예산·웹사이트·검증은 어떻게 하나 {#audit-website}

**감사.** 먼저 소유 계약(`docs/AGENTS.md`, `.agents/notes/README.md`, `docs/i18n/README.md`, 루트 `AGENTS.md`)을 요약하지 않고 읽는다.[](source:dm-audit-own) 구조를 먼저 점검하고, 그다음 AI 티 나는 표현 점검표를 비용이 적게 드는 탐침부터 적용한다.[](source:dm-audit-order)[](source:dm-audit-slop)

- 추론 흔적은 `dsh-trim-cot-leakage`로 찾는다.
- 독특한 구절을 검색해 중복된 규칙을 찾는다.
- 손으로 쓴 카탈로그와 상태 목록은 권위 있는 소유자로 바꾼다.
- 구현이 끝난 `Agent Note`에서 이행 계획과 미래형 명세 문장을 지운다.
- 이상치는 `pnpm run verify-doc-budgets --list`와 단어 수 스캔으로 잰다.
- 산문을 지웠을 때 설명이 아니라 약속한 동작이 바뀌면, 동작 변경을 먼저 제안한다. 이때 제안은 `dsh-find-simplifications`를 따른다(원장 r47, 넘김). 누구에게 제안하는지는 원문에 명시 없음.
- 다른 내용이 기대고 있는 규칙(load-bearing)은 1~3줄과 근거 링크로 남기고, 버려도 되는 판단 과정을 다른 곳으로 옮기려고 새 설명을 만들지 않는다.

문서를 이동할 때는 한 번에 한 주제만 옮기고, 인바운드 링크와 웹사이트 매핑을 같은 변경에서 고친다.[](source:struct-move) `pnpm run verify-doc-budgets`가 빨갛게 되면 `docs/AGENTS.md`의 "옮기기 → 줄이기 → 올리기" 순서를 따른다.[](source:dm-budget)

**웹사이트.** `website/docs.ts`가 공개 허용 목록이고, `scripts/project-doc-site.ts`가 이 목록을 일회용 `website/.generated/`로 바꾸고, VitePress가 그 트리를 빌드한다.[](source:dm-web) 번역은 형제 쌍(`foo.md`, `foo.zh.md`, `foo.i18n.yaml`)으로 두고, 로케일 디렉터리는 쓰지 않는다.[](source:dm-web)

| 변경 | 할 일 |
| --- | --- |
| 이미 게시된 페이지 편집 | 정본 마크다운만 고친다. 경로나 내비게이션 메타데이터가 바뀔 때만 manifest를 고친다.[](source:web-class) |
| 새 페이지 | 소유 `docs/` 계층에 만들고 manifest 항목을 하나 더한다.[](source:web-class) |
| 이름 변경·이동·삭제 | 정본 파일, manifest 항목, 인바운드 링크를 한 변경에서 고친다. 낡은 항목은 지운다.[](source:web-class) |
| 생성 카탈로그 | 카탈로그를 손으로 고치지 않고 생성기나 소스 메타데이터를 고친다.[](source:web-class) |
| 사이트 구조 | 보통 manifest만 고친다. 기존 사이드바·섹션·로케일 모델로 못 담을 때만 VitePress 설정을 고친다.[](source:web-class) |

@callout level=warning title="웹사이트에서 건드리지 않는 것"
`website/.generated/`, `website/.cache/`, `website/.dist/`는 편집도 commit도 하지 않는다. `website/AGENTS.md`를 뺀 `website/` 아래에는 마크다운을 더하지 않는다. `website/zh-CN/`, `website/en/`, `website/api/` 같은 로케일·경로 폴더는 소스 구조로 쓸 수 없다.[](source:web-own)

링크는 저장소 상대 링크로 쓴다. projector는 링크 대상에 따라 링크를 다르게 바꾼다.[](source:web-link)

- projector는 manifest에 있는 대상을 사이트 경로로 바꾸고, manifest에 없지만 존재하는 대상은 GitHub 소스 링크로 바꾼다. 이미지는 생성 트리로 복사한다.
- 외부 URL, 사이트 절대 경로, 메일, 조각 링크는 그대로 둔다. 존재하지 않는 상대 대상이 있으면 projection이 실패한다.
- 미리보기는 `pnpm docs:dev`, 검사는 `pnpm docs:check`다. push 전에는 `dsh-pre-push-checks`를 쓴다.[](source:web-prev)
- 바뀐 정본 파일, 추가·삭제한 manifest 항목, 영향받는 공개 경로, 실제 실행한 검사를 보고한다.[](source:web-prev)

**검증.** 원문은 Markdown 문법이 아니라 영향받는 형식을 검증하라고 한다. 강한 약속에는 통과하는 고정 입력과, 최상위 통과 조건이 실패할 수 있음을 보이는 실패 입력이 함께 필요하다.[](source:dm-val)

| 대상 | 확인 |
| --- | --- |
| README 머리말 | YAML을 파싱하고 `kind`를 템플릿에 대응시킨다. `name`, `audience`, 관리되지 않는 `tags`, README 로컬 `i18n`, 빠졌거나 광고 같은 `description`을 거부한다.[](source:dm-val) |
| 이중 언어 페이지 | 구조, 정확한 줄 수, 용어, 링크 일치, sidecar 기록을 확인한다.[](source:dm-val) |
| 튜토리얼 | 문서의 진입 경로를 실행하거나 수동 검증 소유자를 적는다.[](source:dm-val) |
| 생성 레퍼런스 | 결정적 최신성 검사를 돌리고 조회 크기 지표를 보고한다.[](source:dm-val) |
| 패키지 README | 요약 검사, `Model Experience`·한계 검사, 동작 주장이 바뀌면 패키지 테스트. README가 시키는 명령은 병합 전에 모두 다시 실행한다.[](source:dm-val-pkg) |
| 스킬 | 저장소의 스킬 호출 메타데이터 검사를 돌린다.[](source:dm-val) |

## 흐름 속 위치 {#position}

`docs` 묶음에서 `dsh-doc`은 문서 구조와 통과 조건을 맡고, 문장 판단과 추론 흔적 제거는 이웃 스킬에 맡긴다. 원장에는 `dsh-doc`으로 넘겨 오는 `넘김` 관계가 없어서 그림에서는 앞 노드를 두지 않았다. 들어오는 `참고`·`내부 위임`은 아래 표에 있다.

@workflow id=doc-position title="dsh-doc 앞뒤의 스킬"
| doc | dsh-doc | backend |
| pm | dsh-prose-standard | backend |
| tc | dsh-trim-cot-leakage | backend |
| pp | dsh-pre-push-checks | backend |
| ug | dsh-create-upgrade-guide | backend |
| doc > pm | 문장 판단 | emphasis |
| doc > tc | 추론 흔적 | emphasis |
| doc > pp | push 전 | emphasis |
| doc > ug | 종류 소관 | dashed |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `dsh-prose-standard` | 문장 단위 계약 범위와 편집 판단 | 문서 초안 | 위임. `style.md`도 완전한 명제 규칙은 `dsh-prose-standard` 소관이라고 적는다. 반대로 `dsh-prose-standard`는 배치·예산·이중 언어 쌍·통과 조건을 `dsh-doc`에 맡긴다(참고)[](source:dm-ref115)[](source:style-len)[](source:rel-ps) | r11, r09 |
| `dsh-trim-cot-leakage` | 추론 흔적 찾기 결과 | 군더더기 점검 대상 | 구조 점검을 마치고 군더더기를 훑을 때 위임한다. 반대로 `dsh-trim-cot-leakage`는 이중 언어 코드 울타리를 고칠 때 이 스킬의 규칙대로 양쪽에 바이트 그대로 복사하고, 쌍을 다시 기록한다[](source:dm-audit-slop)[](source:rel-tc) | r12, r17 |
| `dsh-create-upgrade-guide` | - | `upgrade-guide` 종류의 문서 작업 | 참고. 범위·배치·유지·길이 규칙은 `dsh-create-upgrade-guide`가 소유하고 `pnpm run verify-upgrade-guides`가 강제한다. 이 스킬은 템플릿을 제공한다[](source:dm-kind-list)[](source:tu-skel) | r13, r14 |
| `dsh-pre-push-checks` | - | 웹사이트 동기화 뒤의 변경 | 넘김. push 전에 쓴다[](source:web-prev) | r26 |
| 대상 저장소의 `docs/upgrade-guide/`와 sidecar 기록 | sidecar 기록, 버전별 가이드 폴더 | 같은 sidecar 기록 | 공유 상태. `dsh-create-upgrade-guide`, `dsh-translate-docs`와 함께 `--write`로 sidecar 기록을 다시 남긴다. 폴더와 스크립트는 이 저장소에 없다(범위 밖)[](source:dm-f5)[](source:dm-kind-list) | r43, r44 |
| `dsh-translate-docs` | - | - | 같은 계열. 둘 다 이중 언어 문서를 다룬다. 이 스킬은 확장 번역 스킬을 자동으로 부르지 않는다[](source:web-own) | r46 |

전체 흐름은 `deepseek-harness/_group-docs/docs.html`에 있다. 관계 근거는 `deepseek-harness/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 1개, `references/` 5개, `templates/` 8개로 모두 14개, 74,654바이트다. 모두 원본이다.
- 관계 확인용으로 이웃 스킬의 한 줄씩만 읽었다. `dsh-prose-standard/SKILL.md` 8번 줄과 `dsh-trim-cot-leakage/SKILL.md` 43번 줄이다. 두 파일의 나머지는 이 분석 범위 밖이다.
- 제외한 파일: 없음. 이 컬렉션에는 번역본이 없다.
- 원문 비교: 원장 기준으로 다른 컬렉션에 이름이 같은 사본이 없다.
- 범위 밖: 원문의 `../../../docs/...`, `scripts/...`, `website/...`, `packages/...` 링크는 원래 deepseek-harness 저장소의 파일이다. 이 저장소에 없어 읽지 않았다. 참고 예시로 든 `session-persistence-jsonl` README 쌍도 같다.
- 실행하지 않았다. 문서 작성, 명령 실행, 검사는 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`verify-package-readme-summaries`, `verify-doc-budgets`, `verify-translation-pairing` 같은 통과 조건이 실제로 무엇을 어떻게 판정하는지는 이 저장소에 없는 스크립트에 있어서 확인하지 못했다. 이 페이지의 통과 조건 서술은 원문이 말하는 내용이다.

`description` 말고 "이 스킬을 쓰지 않을 요청"을 가르는 기준과, 사용자에게 묻는 단계는 원문에 명시 없음. 산문 삭제가 동작 변경이 되는 경우 누구에게 제안하는지도 원문에 명시 없음. `docs/AGENTS.md`의 예산 정책과 표준의 내용은 링크만 있고 읽지 못했다.
