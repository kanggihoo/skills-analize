# dsh-create-upgrade-guide 스킬은 에이전트를 어떻게 바꾸나 {#upgrade-guide-skill}

`dsh-create-upgrade-guide`를 쓰면 에이전트는 저장소 밖에서 보이는 표면을 깨는 변경에 업그레이드 가이드를 붙인다. 가이드는 그 변경 안에서, 깨짐을 알아챈 즉시 쓴다. 릴리스 준비로 미루지 않는다.[](source:ug-intro)

- 대상은 저장소 밖의 사람이 업그레이드한 뒤 관찰할 수 있는 깨짐뿐이다. 같은 변경에서 소비자를 모두 고치는 안정화 전 내부 API는 가이드가 필요 없다.[](source:ug-scope)[](source:ug-internal)
- 가이드는 `docs/upgrade-guide/v<version>/<item>/guide.md`와 중국어 짝 `guide.zh.md`, sidecar 기록(번역 쌍의 해시) `guide.i18n.yaml` 세 파일이다. 색인도 첨부도 두지 않는다.[](source:ug-loc)
- `verify-upgrade-guides`가 형식을 강제한다. 가이드에는 `Change`·`Migration` 두 절만 있고, `guide.md`는 머리말을 포함해 500단어 이하다.[](source:ug-format)
- 루트 버전이 그대로인 동안에는 같은 폴더의 가이드를 고쳐 간다. 버전을 올린 뒤 이전 폴더는 얼린다.[](source:ug-maint)

@answer scope="deepseek-harness/dsh-create-upgrade-guide · 원본 텍스트 파일 1개(+ 템플릿 1개 참조) · 커밋 475505c · 지시상 동작"
@meta locale=ko
@source ug-fm title="deepseek-harness/dsh-create-upgrade-guide/SKILL.md · 3734B · frontmatter" path=deepseek-harness/dsh-create-upgrade-guide/SKILL.md lines=1:4
@source ug-intro title="SKILL.md · 목적과 시점" path=deepseek-harness/dsh-create-upgrade-guide/SKILL.md lines=8:8
@source ug-scope title="SKILL.md · Scope 대상 목록" path=deepseek-harness/dsh-create-upgrade-guide/SKILL.md lines=12:18
@source ug-internal title="SKILL.md · 안정화 전 내부 API와 Session 형식" path=deepseek-harness/dsh-create-upgrade-guide/SKILL.md lines=20:20
@source ug-loc title="SKILL.md · Location" path=deepseek-harness/dsh-create-upgrade-guide/SKILL.md lines=24:28
@source ug-maint title="SKILL.md · Maintenance" path=deepseek-harness/dsh-create-upgrade-guide/SKILL.md lines=32:32
@source ug-tpl title="SKILL.md · 템플릿에서 시작" path=deepseek-harness/dsh-create-upgrade-guide/SKILL.md lines=36:36
@source ug-format title="SKILL.md · 검사가 강제하는 형식" path=deepseek-harness/dsh-create-upgrade-guide/SKILL.md lines=36:40
@source ug-sections title="SKILL.md · 두 절의 내용" path=deepseek-harness/dsh-create-upgrade-guide/SKILL.md lines=42:42
@source ug-overflow title="SKILL.md · 500단어를 넘을 때" path=deepseek-harness/dsh-create-upgrade-guide/SKILL.md lines=44:44
@source ug-prose title="SKILL.md · 문장 규칙과 중국어 짝" path=deepseek-harness/dsh-create-upgrade-guide/SKILL.md lines=46:46
@source ug-verify title="SKILL.md · Verify" path=deepseek-harness/dsh-create-upgrade-guide/SKILL.md lines=48:54
@source tpl-ug title="deepseek-harness/dsh-doc/templates/upgrade-guide.md · 909B · 시작점 템플릿" path=deepseek-harness/dsh-doc/templates/upgrade-guide.md lines=3:3
@source tpl-skel title="upgrade-guide.md · 뼈대" path=deepseek-harness/dsh-doc/templates/upgrade-guide.md lines=17:29

## 언제 켜지고 무엇이 대상인가 {#trigger}

@code source=ug-fm language=yaml

머리말(frontmatter)에는 `name`과 `description`만 있고 호출 제한 필드가 없다.[](source:ug-fm) 판정: 모델이 `description`을 참고해 스스로 켤 수 있는 모델 호출형 스킬이다. `description`은 모델이 판단할 때 참고하는 설명이며, 특정 단어가 나오면 켜지는 목록이 아니다.

`description`이 드는 상황은 두 가지다. 외부에서 보이는 표면을 깨는 변경이 있을 때, 그리고 아직 릴리스되지 않은 업그레이드 가이드가 이미 다루는 표면을 바꿀 때다.[](source:ug-fm) 앞의 경우는 새 가이드를 쓰고, 뒤의 경우는 있는 가이드를 고친다.

원문은 저장소 밖에서 관찰되는 깨짐에만 가이드를 쓰라고 한다. 대상은 다섯 가지다.[](source:ug-scope)

| 표면 | 원문의 예 |
| --- | --- |
| CLI | `dsh` 명령, 플래그, 프로필 이름 |
| 설정 | `cordis.yml`, 패치, 오버레이, 설정 키와 허용 값 |
| 사용자 데이터 | Session 로그, SQLite 저장소, 사용자 데이터 폴더 |
| API·메시지 | TypeScript·Python SDK 내보내기, JSON-RPC, HTTP, ACP 메시지 |
| 패키지 | 게시된 패키지 이름과 진입점 |

| 상황 | 원문의 지시 |
| --- | --- |
| 안정화 전 내부 API이고 소비자가 모두 같은 변경에서 갱신된다 | 가이드가 필요 없다.[](source:ug-internal) {good:쓰지 않음} |
| Session 형식이 바뀐다 | 타입 인정(type acknowledgement) 절차를 그대로 따른다. 가이드는 독자가 할 일만 쓰고 그 기록으로 링크한다. 기록 문서는 이 저장소에 없다(범위 밖).[](source:ug-internal) |
| 가이드를 언제 쓰나 | 깨짐을 알아챈 즉시, 그 깨짐을 일으킨 변경 안에서 쓴다. 릴리스 준비로 미루지 않는다.[](source:ug-intro) {caution:미루기 금지} |

판정: 원문이 가이드를 쓰는 시점을 그 변경 안으로 정해 두었기 때문에, 릴리스 때 몰아 쓰다가 깨짐을 놓치는 일을 막는다. 근거는 "소개 문장의 시점 지시"다.[](source:ug-intro)

## 가이드는 어디에 두고 어떻게 유지하나 {#location}

경로는 `docs/upgrade-guide/v<version>/<item>/guide.md`다. 가이드는 `<version>` 릴리스에서 그다음 릴리스로 올리는 독자를 위한 것이다.[](source:ug-loc)

| 조각 | 값 |
| --- | --- |
| `<version>` | 가이드를 쓰는 시점의 루트 `package.json`의 `version` 필드. 원문의 예는 `v0.1.7-rc.2`[](source:ug-loc) |
| `<item>` | 바뀐 표면의 kebab-case 이름. 예는 `profile-flag-rename`[](source:ug-loc) |
| 항목 폴더의 내용 | `guide.md`, 중국어 짝 `guide.zh.md`, sidecar 기록 `guide.i18n.yaml` 정확히 이 셋. 색인도 첨부도 없다[](source:ug-loc) |

| 상황 | 할 일 |
| --- | --- |
| 루트 버전이 그대로인 동안 | 현재 버전 폴더가 vT에서 현재 `master`까지의 차이를 설명한다.[](source:ug-maint) |
| 나중 변경이 가이드가 다루는 표면을 건드린다 | 같은 변경에서 그 가이드를 고친다.[](source:ug-maint) |
| 깨짐을 되돌린다 | 가이드를 지운다.[](source:ug-maint) |
| 버전을 올린 뒤 | 이전 버전 폴더의 가이드는 얼어붙는다. 새 깨짐은 새 버전 폴더에 쓴다.[](source:ug-maint) {bad:이전 폴더 수정 금지} |
| 어떤 경우에도 | 한 가이드가 한 릴리스를 넘어서 걸치지 않는다.[](source:ug-maint) |

## 가이드는 어떤 형식으로 쓰고 무엇으로 검사하나 {#format}

@workflow id=guide-flow title="가이드 작성 순서"
| break | 깨짐 인지 | external |
| scope | 외부에서 보이나? | backend |
| none | 가이드 없음 | external |
| place | 폴더 정하기 | backend |
| en | guide.md 쓰기 | backend |
| zh | guide.zh.md 쓰기 | backend |
| pair | sidecar 기록 | backend |
| verify | 검사 세 개 | security |
| break > scope | |
| scope > none | 아니오 |
| scope > place | 예 | emphasis |
| place > en | |
| en > zh | |
| zh > pair | |
| pair > verify | 통과 | emphasis |

@steps id=guide-steps
| break | 깨짐 인지 | 깨짐을 알아채는 즉시 쓰기 시작한다.[](source:ug-intro) | guide-flow | break |
| scope | 외부에서 보이나? | 위 표의 다섯 표면 중 하나를 저장소 밖에서 관찰할 수 있을 때만 가이드를 쓴다.[](source:ug-scope) | guide-flow | scope |
| none | 가이드 없음 | 안정화 전 내부 API이고 소비자를 모두 같은 변경에서 고치면 가이드를 쓰지 않는다.[](source:ug-internal) | guide-flow | none |
| place | 폴더 정하기 | 루트 `package.json`의 `version`으로 버전 폴더를, 바뀐 표면의 kebab-case 이름으로 항목 폴더를 정한다.[](source:ug-loc) | guide-flow | place |
| en | guide.md 쓰기 | `dsh-doc`의 업그레이드 가이드 템플릿에서 시작해 `Change`와 `Migration`을 쓴다.[](source:ug-tpl)[](source:ug-sections) | guide-flow | en |
| zh | guide.zh.md 쓰기 | 같은 변경에서 중국어 짝을 쓴다. 절 제목은 `## 变更`과 `## 迁移`이다.[](source:ug-prose)[](source:ug-format) | guide-flow | zh |
| pair | sidecar 기록 | `pnpm run verify-translation-pairing --write docs/upgrade-guide/v<version>/<item>/guide.md`로 쌍을 기록한다.[](source:ug-prose) | guide-flow | pair |
| verify | 검사 세 개 | 아래 세 명령을 돌린다.[](source:ug-verify) | guide-flow | verify |

판정: 이 그림은 원문의 절 순서(Scope, Location, Format, Verify)를 따라 그렸다. 절 순서가 곧 실행 순서라는 명시는 원문에 없다.

`verify-upgrade-guides`가 강제하는 형식은 세 가지다.[](source:ug-format)

- 머리말은 정확히 `kind: upgrade-guide`와, 무엇이 깨지는지 적은 한 문장짜리 `description`이다. 키를 더하려면 그 키의 검사를 함께 더하고 모든 가이드를 보충한다.
- `#` 제목 하나, 그다음 `guide.md`에는 `## Change`와 `## Migration`, `guide.zh.md`에는 `## 变更`과 `## 迁移`를 이 순서로 둔다. 절은 이 둘뿐이다.
- `guide.md`는 머리말을 포함해 500단어 이하다.

@facts id=guide-numbers
| 단어 수 | `guide.md` 500단어 이하, 머리말 포함. 단어를 세는 방법과 `guide.zh.md`의 한도는 원문에 명시 없음.[](source:ug-format) |
| 머리말 키 | 정확히 `kind`와 `description` 두 개[](source:ug-format) |
| 본문 절 | 정확히 두 개: `Change`, `Migration`[](source:ug-format) |

두 절이 담을 내용은 다음과 같다.[](source:ug-sections)

| 절 | 내용 |
| --- | --- |
| `Change` | 표면의 이전 동작과 새 동작, 그리고 영향받는 사람 |
| `Migration` | 정확한 파일·키·명령·심볼을 이름으로 적은 순서 있는 단계와, 마이그레이션이 성공했는지 확인하는 방법 |

템플릿의 뼈대도 같다. 제목 아래에 `English | [中文](guide.zh.md)` 줄이 있고, 그다음에 `## Change`와 `## Migration`이 온다. `Migration`의 첫 단계에는 바꿀 파일·키·명령·심볼에 이전/이후 조각을 붙이고, 둘째 단계에는 확인 방법을 쓴다.[](source:tpl-skel)

500단어에 담기지 않으면, 넘치는 글은 다른 곳으로 보낸다.[](source:ug-overflow)

- 코드를 되풀이하지 말고 소스 파일이나 심볼로 링크한다.
- 근거 설명은 `Agent Note`로 옮긴다.
- 반복되는 기계적 단계는 가이드가 부르는 스크립트나 `dsh` 명령으로 바꾼다.

문장은 `dsh-prose-standard`를 따른다. 중국어 짝은 같은 변경에서 이중 언어 짝 규칙(`docs/AGENTS.md`, 범위 밖)에 맞춰 쓰고 쌍을 기록한다.[](source:ug-prose) 원문이 끝에서 시키는 검사는 세 개다.[](source:ug-verify)

```sh title="원문이 Verify 절에서 나열한 명령(지시상 동작)"
pnpm run verify-upgrade-guides
pnpm run verify-translation-pairing docs/upgrade-guide/v<version>/<item>/guide.md
pnpm run verify-md-links
```

## 흐름 속 위치 {#position}

`docs` 묶음에서 이 스킬은 `dsh-doc`이 문서 종류로 가리키는 업그레이드 가이드를 맡는다. 템플릿은 `dsh-doc`에서 받고, 문장은 `dsh-prose-standard`에 맡긴다.

@workflow id=guide-position title="dsh-create-upgrade-guide 앞뒤의 스킬"
| doc | dsh-doc | backend |
| ug | dsh-create-upgrade-guide | backend |
| ps | dsh-prose-standard | backend |
| doc > ug | 템플릿 | dashed |
| ug > ps | 문장 규칙 | emphasis |

| 상대 | 받는 것 | 넘기는 것 | 조건 | rel-id |
| --- | --- | --- | --- | --- |
| `dsh-doc` | `templates/upgrade-guide.md` 템플릿 | - | "Start from"이라는 지시다. 반대 방향으로는, `dsh-doc`이 `upgrade-guide` 종류의 범위·배치·유지·길이 규칙을 이 스킬 소관으로 적고 `pnpm run verify-upgrade-guides`가 강제한다고 말한다(참고)[](source:ug-tpl)[](source:tpl-ug) | r14, r13 |
| `dsh-prose-standard` | 문장 규칙 | 쓴 가이드 문장 | "Follow"라는 의무형 지시. 가이드를 쓸 때 따른다[](source:ug-prose) | r15 |
| 대상 저장소의 `docs/upgrade-guide/`와 sidecar 기록 | sidecar 기록 | 같은 sidecar 기록 | 공유 상태. `dsh-doc`, `dsh-translate-docs`와 같은 `--write` 기록을 쓴다. 폴더와 스크립트는 이 저장소에 없다(범위 밖)[](source:ug-loc)[](source:ug-prose) | r43, r44 |

전체 흐름은 `deepseek-harness/_group-docs/docs.html`에 있다. 관계 근거는 `deepseek-harness/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `dsh-create-upgrade-guide/SKILL.md` 1개(3,734바이트). 원본이다. 관계 확인을 위해 `dsh-doc/templates/upgrade-guide.md`(909바이트)도 읽었다. 이 스킬이 "Start from"으로 지목한 파일이다.
- 제외한 파일: 없음. 이 스킬 폴더에는 `SKILL.md` 하나뿐이고 번역본이 없다.
- 원문 비교: 원장 기준으로 다른 컬렉션에 이름이 같은 사본이 없다.
- 범위 밖: `../../../docs/cookbook/reviewing-persistence-type-changes.md`, `../../notes/README.md`, `../../../docs/AGENTS.md`는 원래 deepseek-harness 저장소의 파일이다. 이 저장소에 없어 읽지 않았다.
- 실행하지 않았다. 가이드 작성, sidecar 기록, 검사 명령은 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
`<version>`의 정의와 경로가 서로 맞지 않는다. 경로는 `v<version>/`이고, `<version>`은 "루트 `package.json`의 `version` 필드"이며, 예는 `v0.1.7-rc.2`다. 이 둘을 그대로 합치면 `vv0.1.7-rc.2`가 된다. 필드 값에 `v`가 붙는지는 원문에 명시 없고, 어느 쪽을 따르라는 우선순위도 없어서 충돌을 그대로 둔다.

`verify-upgrade-guides`가 단어를 어떻게 세는지, `guide.zh.md`에 한도가 있는지, 템플릿의 `English | [中文](guide.zh.md)` 줄이 "제목 하나 뒤에는 두 절만" 규칙과 어떻게 함께 통과하는지는 이 저장소에 없는 스크립트가 정하므로 확인하지 못했다. 사용자에게 묻는 단계는 원문에 명시 없음.
