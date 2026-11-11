# ponytail-help는 모드를 바꾸나, 사용법만 보여 주나? {#ponytail-help-page}

`ponytail-help`는 수준·스킬·명령을 한 번 안내한다. `ponytail-help` 자체는 모드나 flag를 바꾸거나 파일을 저장하지 않는다. 명령을 설명하는 것과 그 명령을 실행하는 경계를 분명히 둔다.[](source:boundary)[](source:commands)

- `lite`, `full`, `ultra`와 종료 표현을 알려 준다.[](source:levels)[](source:stop)
- 여섯 스킬의 목적을 보여 주고 사용자가 고르게 한다.[](source:commands)
- 환경 변수·config·band·업데이트는 호스트의 기능으로 설명한다.[](source:host)

@answer scope="로컬 원본 분석 · 사용 안내 · 호스트 구현 미검증"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=835ad00af6ccb24e5ab01bbe0a91f878f95cc417
@source full title="ponytail/ponytail-help/SKILL.md · 3264B · 원본" path=ponytail/ponytail-help/SKILL.md
@source front title="ponytail/ponytail-help/SKILL.md · 3264B · 원본" path=ponytail/ponytail-help/SKILL.md lines=1:6
@source boundary title="ponytail/ponytail-help/SKILL.md · 3264B · 원본" path=ponytail/ponytail-help/SKILL.md lines=10:11
@source levels title="ponytail/ponytail-help/SKILL.md · 3264B · 원본" path=ponytail/ponytail-help/SKILL.md lines=13:21
@source commands title="ponytail/ponytail-help/SKILL.md · 3264B · 원본" path=ponytail/ponytail-help/SKILL.md lines=23:36
@source stop title="ponytail/ponytail-help/SKILL.md · 3264B · 원본" path=ponytail/ponytail-help/SKILL.md lines=38:41
@source host title="ponytail/ponytail-help/SKILL.md · 3264B · 원본" path=ponytail/ponytail-help/SKILL.md lines=43:76
@source producer title="ponytail/ponytail/SKILL.md · 3548B · 원본" path=ponytail/ponytail/SKILL.md lines=15:17
@source review title="ponytail/ponytail-review/SKILL.md · 5244B · 원본" path=ponytail/ponytail-review/SKILL.md lines=18:28
@source audit title="ponytail/ponytail-audit/SKILL.md · 5520B · 원본" path=ponytail/ponytail-audit/SKILL.md lines=18:28
@source debt title="ponytail/ponytail-debt/SKILL.md · 1813B · 원본" path=ponytail/ponytail-debt/SKILL.md lines=41:44
@source gain title="ponytail/ponytail-gain/SKILL.md · 2216B · 원본" path=ponytail/ponytail-gain/SKILL.md lines=44:52
@source lock title="ponytail/skills-lock.json · 1497B · 설치 출처" path=ponytail/skills-lock.json

## 언제 쓰고 어디서 끝나나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어와 정확히 일치해야 켜진다는 뜻은 아니다. `disable-model-invocation` 필드는 이 원문에 명시되어 있지 않다.[](source:front)

@code source=front language=yaml

원문은 `/ponytail-help`, `ponytail help`, 사용법 질문을 호출 맥락으로 든다. 참고 카드 표시 후 끝내며, 모드 변경·flag 파일 작성·지속 저장을 금지한다.[](source:front)[](source:boundary)

## 수준과 호출 표현은 무엇인가? {#levels}

| 사용 목적 | 원문의 안내 |
|---|---|
| `lite` | `/ponytail lite`로 요청한 것을 만들고 더 작은 선택지를 한 줄로 알린다.[](source:levels) |
| `full` | `/ponytail`의 기본이다. 완전한 최소 변경, 필요한 검사, 생략과 위험의 보고를 적용한다.[](source:levels) |
| `ultra` | `/ponytail ultra`로 구현 전에 필요도 따져 반대 의견을 낸다.[](source:levels) |
| 유지·종료 | 수준을 바꾸거나 세션이 끝날 때까지 유지한다. `stop ponytail`, `normal mode`, `/ponytail off`로 끈다. `/ponytail`로 재개한다.[](source:levels)[](source:stop) |
| 호스트별 표기 | Codex CLI·IDE는 `$ponytail:ponytail`, `$ponytail:ponytail-review`, `$ponytail:ponytail-help`를 예로 든다. Claude Code·OpenCode는 slash 명령을 안내한다.[](source:commands) |

## 어떤 스킬로 안내하나? {#position}

@workflow id=position-flow title="help를 읽은 뒤 사용자가 고르는 명령"
| current | ponytail-help | external | source:commands |
| build | ponytail | backend | source:commands |
| review | ponytail-review | backend | source:commands |
| audit | ponytail-audit | backend | source:commands |
| debt | ponytail-debt | backend | source:commands |
| gain | ponytail-gain | backend | source:commands |
| current > build | 참고 R01 | emphasis |
| current > review | 참고 R02 | dashed |
| current > audit | 참고 R03 | dashed |
| current > debt | 참고 R04 | dashed |
| current > gain | 참고 R05 | dashed |

@steps
| highlight | ponytail-help | 이 페이지의 스킬이다. 앞선 필수 단계는 없고, 명령 선택은 사용자가 한다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
|---|---|
| R01 | 구현 방식을 바꾸는 ponytail의 사용법을 알린다.[](source:commands) |
| R02·R03 | diff 검토는 `ponytail-review`, 전체 저장소 검토는 `ponytail-audit`로 안내한다.[](source:commands) |
| R04 | 미룬 작업 주석 집계는 `ponytail-debt`로 안내한다. 기본은 보고만 하며 저장은 별도 확인을 따른다.[](source:commands)[](source:debt) |
| R05 | 공개 benchmark 카드는 gain으로 안내한다. 현재 repo 절감량은 계산하지 않는다.[](source:commands)[](source:gain) |

모두 참고 관계이며 자동 실행이나 필수 순서가 아니다. 전체 관계는 색인 기준 `_group-minimal-code/minimal-code.html`에 있다.[](source:boundary)[](source:commands)

## 설정 안내와 실제 변경은 어떻게 구분하나? {#host}

| 항목 | 원문의 안내와 적용 경계 |
|---|---|
| 기본 수준 | 매 세션 `full` 자동 활성화를 설명한다. `PONYTAIL_DEFAULT_MODE` 환경 변수가 가장 먼저이며, config 파일, `full` 순으로 해석한다고 적는다. `off`는 자동 활성화를 끈다.[](source:host) |
| config 경로 | `~/.config/ponytail/config.json`, Windows의 `%APPDATA%\ponytail\config.json`을 안내한다. `defaultMode`에 `lite` 등을 넣는다. `ponytail-help`가 직접 쓰지는 않는다.[](source:host)[](source:boundary) |
| band | Claude Code의 `/ponytail band`는 표시 전환, `band on`·`band off`는 직접 지정이다. 수준은 유지한다. `band import`는 과거 세션의 cost·agent time·tokens를 board에 더한다고 설명한다.[](source:host) |
| 업데이트 | `/plugin`의 Marketplaces에서 auto-update를 켜거나 `/plugin marketplace update ponytail` 후 `/reload-plugins`를 안내한다. `/plugin`을 인식하지 못하면 Claude Code 업데이트와 재시작을 안내한다. 다른 호스트는 자체 방식을 쓴다.[](source:host) |

판정 · `ponytail-help`를 호출했다고 `ultra`가 되거나 config가 생기지는 않는다. `ponytail-help` 원문이 표시만 하도록 제한하기 때문이다. 호스트 설정·band·업데이트의 실제 구현은 컬렉션에 없다.[](source:boundary)[](source:host)

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
|---|---|
| 스킬 원본 | `ponytail/ponytail-help/SKILL.md` 1개, 3,264B를 끝까지 읽었다.[](source:full) |
| 관계와 설치 출처 | 참조한 다른 스킬과 `skills-lock.json`을 포함해 텍스트 7개, 23,102B를 전부 읽었다. lock의 6개 항목을 확인했다.[](source:lock) |
| 제외 | 이 폴더의 `SKILL.ko.md`는 번역본이라 열지 않았다. 바이너리는 없다. |
| 부분 읽음 | 0개. 원자료가 없는 경우는 아래 미확인 항목에 따로 적었다. |

원본의 수준, 호스트별 호출, 종료, 설정 우선순위와 업데이트 안내를 모두 대조했다. R13의 외부 전체 문서와 R14의 호스트 구현은 분석 범위 밖이다.

@callout level=open-question title="실행으로 확인하지 않은 부분"
| 모드 자동 활성화, band, config 해석, plugin 업데이트는 원문이 설명한 동작이다. 외부 전체 문서와 호스트를 실행해 확인하지 않았다. |

분석 중 원본은 수정하지 않았다. 분석 전 사용자 승인으로 컬렉션 7개 파일을 commit했다. 새 분석 초안과 HTML, 관계 원장, 색인, 검증 보고서를 작성했다. 원문의 명령과 설치·설정 변경은 실행하지 않았다.
