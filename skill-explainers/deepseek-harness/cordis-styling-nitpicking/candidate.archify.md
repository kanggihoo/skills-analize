# cordis-styling-nitpicking 스킬은 에이전트를 어떻게 바꾸나 {#cordis-styling-nitpicking-skill}

`cordis-styling-nitpicking`을 쓰면 에이전트는 Cordis 플러그인 코드에서 세 가지 P0 위반만 찾는다. 세 가지는 프로세스 전역 싱글턴 상태, 해제 뒤에도 남는 부작용, 소비자가 끝나기 전에 풀려 버리는 정리 의존이다.[](source:cd-fm)[](source:cd-report) 이 스킬은 스타일을 지적하는 스킬이 아니라, 소유권과 수명주기를 보는 의미 리뷰다.[](source:cd-intro)

- 에이전트는 위반을 지적하기 전에, 그 위반이 성립하는 interleaving(작업이 끼어드는 순서)과 눈에 보이는 영향을 만들어 보여야 한다. 그러지 못한 후보는 지적이 아니라 기각 목록에 들어간다.[](source:cd-wf5)[](source:cd-report)
- 대상은 플러그인 진입점에서 닿는 코드뿐이다. 무관한 헬퍼, 빌드 도구, CLI 경로, 테스트는 지적 대상에서 뺀다. 벤더링한 Cordis 코드에 결함이 있어도 이 스킬로 보고하지 않는다.[](source:cd-intro)
- 에이전트는 패턴 검색만 해 놓고 "전부 안전하다"고 말하지 않는다. 확인한 범위, 기각한 후보, 재현의 한계를 함께 적는다.[](source:cd-report)

@answer scope="deepseek-harness/cordis-styling-nitpicking · 원본 텍스트 파일 1개 · 커밋 475505c · 지시상 동작"
@meta locale=ko
@source cd-fm title="deepseek-harness/cordis-styling-nitpicking/SKILL.md · 9200B · frontmatter" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=1:4
@source cd-intro title="SKILL.md · 범위와 제외 대상" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=8:8
@source cd-sot title="SKILL.md · Sources of truth" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=12:15
@source cd-wf1 title="SKILL.md · 절차 1 소유자 찾기" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=19:19
@source cd-wf2 title="SKILL.md · 절차 2 컨텍스트로 소유 추적" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=20:20
@source cd-wf3 title="SKILL.md · 절차 3 정리 추적" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=21:21
@source cd-wf4 title="SKILL.md · 절차 4 완료 시점 비교" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=22:22
@source cd-wf5 title="SKILL.md · 절차 5 실패 순서 증명" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=23:23
@source cd-single title="SKILL.md · P0 싱글턴" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=27:29
@source cd-effect title="SKILL.md · P0 되돌리지 않는 부작용" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=33:35
@source cd-dep title="SKILL.md · P0 소비자보다 먼저 풀리는 정리 의존" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=39:43
@source cd-vendor title="SKILL.md · 벤더링 Cordis의 현재 동작 서술" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=41:41
@source cd-wa title="SKILL.md · 현재 우회책" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=47:51
@source cd-wa-limit title="SKILL.md · 우회책의 한계" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=53:55
@source cd-nofind title="SKILL.md · 보고하지 않는 것" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=57:57
@source cd-test title="SKILL.md · 회귀 테스트" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=59:59
@source cd-report title="SKILL.md · Reporting" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=63:63
@source cd-notes title="SKILL.md · 기록 요청과 출력 스키마" path=deepseek-harness/cordis-styling-nitpicking/SKILL.md lines=65:65
@source rel-cd title="relations.md · r06, r38" path=skill-explainers/deepseek-harness/relations.md lines=49:49

## 언제 켜지고 어떻게 찾나 {#trigger}

@code source=cd-fm language=yaml

`description`은 Cordis 플러그인과 그 진입점에서 닿는 헬퍼를 PR로 리뷰할 때, 그리고 수명주기만 따로 점검할 때 쓰라고 한다.[](source:cd-fm) 호출을 막는 필드(`disable-model-invocation` 등)는 원문에 명시 없음. `description`은 모델이 스킬을 쓸지 판단할 때 참고하는 설명이다.

저장소 전체를 감사할 때, 에이전트는 내보낸 플러그인 진입점(`apply` 또는 Cordis가 호출하는 구체적인 기본 export)에서 시작한다. 거기서 모듈 초기화, 등록한 서비스, 리스너, 이펙트, 해제 함수, 그리고 이어지는 호출을 따라간다. 테스트와 벤더링한 Cordis는 동작을 확인하려고 읽을 뿐이다. 생성된 결함은 그것을 만든 원본 소스에 귀속한다.[](source:cd-intro)

@workflow id=cordis-audit title="P0 후보 확인 절차"
| own | 소유자 찾기 | backend |
| ctx | 실제 컨텍스트로 추적 | backend |
| clean | 정리 끝까지 추적 | backend |
| cmp | 완료 시점 비교 | backend |
| proof | 실패 순서 성립? | security |
| rep | 지적으로 보고 | frontend |
| rej | 기각 목록에 적기 | external |
| own > ctx | |
| ctx > clean | |
| clean > cmp | |
| cmp > proof | |
| proof > rep | 예 | emphasis |
| proof > rej | 아니오 | dashed |

@steps id=cordis-audit-steps
| own | 소유자 찾기 | 에이전트가 플러그인 루트에서 닿는 가변 소유자, 등록, 자원 획득, 작업 수용 지점을 찾는다. 범위가 크면 디렉터리별로 따로 훑고, 같은 소비자와 자원에 얽힌 결과는 합친다.[](source:cd-wf1) | cordis-audit | own |
| ctx | 실제 컨텍스트로 추적 | 서비스 메서드에서는 `this.ctx`가 호출자의 컨텍스트다. 에이전트는 효과마다 소유자와 해제 함수를 정한다.[](source:cd-wf2) | cordis-audit | ctx |
| clean | 정리 끝까지 추적 | 에이전트가 모든 `await`를 지나, 마지막 서비스 호출, 보낸 이벤트, 확인 응답한 작업, 영속 쓰기까지 따라간다. 간접 이벤트 전달과 abort·kill·취소 뒤의 정리도 포함한다.[](source:cd-wf3) | cordis-audit | clean |
| cmp | 완료 시점 비교 | 에이전트가 소비자가 끝나는 시점과, 필요한 리스너·레지스트리·기록기·연결·도메인·전송이 못 쓰게 되는 시점을 비교한다. 시작 순서를 뒤집은 것이나 의존 등록만으로는 완료 순서가 정해지지 않는다. 그래서 현재 Cordis 구현을 직접 본다.[](source:cd-wf4) | cordis-audit | cmp |
| proof | 실패 순서 성립? | 에이전트가 성립할 수 있는 실패 순서와 관찰 가능한 영향을 세운다. 그 전에 기존 취소, 명시적 순서 보장, 문서화된 폐기 의미가 있는지 먼저 본다. 가능하면 제어 가능한 프라미스로 재현하고, 소스만 읽은 결과는 그렇게 표시한다.[](source:cd-wf5) | cordis-audit | proof |

## 어떤 세 가지를 P0로 보나 {#rules}

세 규칙 모두 P0이고, 이 스킬은 이 셋 외에는 보고하지 않는다.[](source:cd-report)

| 규칙 | 지적하는 것 | 지적하지 않는 것 | 요구하는 수정 |
| --- | --- | --- | --- |
| 싱글턴 | 모듈 로딩, 정적 필드, 전역 심벌, 숨은 캐시, `getInstance()`로 정체성이나 수명이 정해지는 프로세스 전역 인스턴스·가변 상태 소유자. 약한 키, 크기 제한, 세대 확인, 동작을 바꾸지 않는 메모이제이션을 써도 Cordis가 소유하는 상태가 되지는 않는다[](source:cd-single) | 불변 스칼라 상수, 얼린 순수 표, 상태 없는 함수, 명시적으로 범위가 정해진 소유자 안에서 만든 객체[](source:cd-single) | Cordis 서비스로 두고, 소비자 의존은 선언하거나 해석되게 한다. 수명이 더 좁으면 범위 컨텍스트나, 서비스가 소유한 키별 레코드를 쓴다[](source:cd-single) |
| 되돌리지 않는 부작용 | 해제 뒤에도 살아 있는 리스너, 등록, 타이머, 감시자, 자식 파이버, 프로세스, 연결, 임시 파일, 구독, 환경 패치, 비동기 작업. 정리 함수가 소유 작업이 멈추기 전에 반환될 수 있는데도, 완료를 기다리지 않고 `abort`·`kill`로 끝내는 것도 위반이다[](source:cd-effect) | 제대로 소유한 `ctx.on()`·`ctx.plugin()`·`ctx.effect()`는 이미 되돌려지므로, 호출자가 일찍 받은 해제 함수를 쥘 필요가 없다. 의도한 영속 쓰기와 원격 변경의 롤백은 요구하지 않는다[](source:cd-effect) | 관리되지 않는 자원에는 소유한 이펙트나 명시적으로 기다리는 정리가 필요하다. 영속 쓰기에 쓴 임시·살아 있는 자원에도 소유자가 필요하다[](source:cd-effect) |
| 소비자가 끝나기 전에 풀리는 정리 의존 | 정리를 끝내는 데 필요한 서비스 호출이나 이벤트 전달은 수명주기 의존이다. 소비자가 최종 결과 게시와 영속 쓰기까지 끝내기 전에 그 자원이나 리스너를 못 쓰게 되면 위반이다. 제공자의 해제 프라미스가 소비자보다 늦게 끝났다고 해서 자원이 끝까지 살아 있었다는 증거는 아니다[](source:cd-dep) | `inject` 누락만 있는 경우, 도달 가능한 소비자가 없는 "늦은 호출이 있을 수도 있다"는 가능성만 있는 경우, 선택 알림을 의도적으로 억제한 경우는 보고하지 않는다. 필수 영속화와 완료 관찰자는 선택 알림이 아니다[](source:cd-nofind) | 다음 순서를 명시적으로 소유하고 기다린다. 먼저 새 수용을 멈추고, 받아들인 소비자가 의존을 쓸 수 있는 동안 끝내게 하고, 그다음 자원을 비워 해제한다. 새 수용 거부와 이미 받은 작업의 완료는 범위를 따로 잡는다[](source:cd-dep) |

판정: 셋째 규칙은 앞의 둘과 달리 현재 Cordis 구현의 동작에 기대고 있다.

원문의 서술은 이렇다. 벤더링한 `fiber.ts`가 형제 해제 함수를 동시에 시작한다. `reflect.ts`의 서비스 철회가 자기 해제 함수 안에서 의존 파이버를 기다리는 동안, 형제 자원 닫기가 이미 돌 수 있다.[](source:cd-vendor) 이 두 파일은 이 저장소에 없어서, 서술이 맞는지 확인하지 못했다.

## 어떻게 고치고 어떻게 보고하나 {#fix-report}

현재 우회책은 함수형 제공자 플러그인 하나에 `ctx.effect(function* () { ... })`를 두는 것이다.[](source:cd-wa)

1. 자원과 필요한 완료 리스너를 얻고, 각 등록이 돌려준 해제 함수를 `yield`한다. 자원 정리도 `ctx.effect()`로 등록하고, 그 해제 함수를 `yield`한다.[](source:cd-wa)
2. 서비스는 마지막에 `yield ctx.provide(name, service)`로 게시한다. 그러면 역순 해제에서 서비스를 먼저 철회하고, Cordis에 아직 등록된 의존 소비자를 기다린 뒤에, 앞선 자원 이펙트를 해제한다.[](source:cd-wa)
3. 별도의 수용 차단이 필요하면, 그 정리를 마지막에 `yield`한다. 그러면 서비스를 철회하기 전에 새 수용부터 멈춘다. 받아들인 정리 작업은 소비자가 끝날 때까지 쓸 수 있어야 한다.[](source:cd-wa)

@callout level=warning title="우회책이 해결하지 못하는 것"
이 우회책은 소비자가 등록돼 있는 동안 제공자 철회 순서를 맞출 뿐이다. 둘러싼 소유자 전체의 종료를 고치는 수정은 아니다. 소비자 해제는 정리가 끝나기 전에 레지스트리에서 파이버를 지우므로 서비스 철회가 이미 해제 중인 소비자를 놓칠 수 있다. 루트·둘러싼 소유자의 해제와 독립적으로 시작된 소비자 정리에서는, 실제 소비자 해제 작업을 명시적 소유자로 쥐고 기다린다. `yield`는 합성한 `ctx.effect()` 생성기 안에 두어야 한다. 이미 등록된 해제 함수를 감싼 대체 래퍼를 `yield`하면, 원래 이펙트가 따로 소유된 채 먼저 닫힐 수 있다. 소비자가 가진 포착되지 않은 리스너와 정리 실패 처리도 이 우회책이 대신하지 않는다.[](source:cd-wa-limit)

회귀 테스트는 다음 순서로 만든다.[](source:cd-test)

1. 소비자를 마지막 의존 사용 직전에 멈춘다.
2. 제공자나 둘러싼 소유자의 해제를 시작한다.
3. 자원과 필요한 리스너가 계속 쓸 수 있는지 확인한 뒤 소비자를 풀어 준다.
4. 소비자의 실제 최종 결과와 영속 출력을 단언하고, 완료 전까지 해제가 보류 상태로 남는지도 단언한다.
5. 제공자의 언로드·교체와 소비자만의 정리를 모두 덮는다. 호출 횟수나 한가한 정상 경로 해제만으로는 부족하다.

보고 규칙은 다음과 같다.[](source:cd-report)[](source:cd-notes)

- 에이전트는 근거 있는 P0 위반만 보고한다. 보고에는 좁은 소스 위치, 플러그인 루트, 소비자와 자원 소유자, 실패 interleaving, 관찰 가능한 영향, 수정안, 결정적인 인수 테스트를 적는다. 같은 실패를 이루는 여러 위치는 하나로 합친다.
- 확인한 범위, 기각한 후보, 재현의 한계를 적는다. 패턴 검색만으로 전부 안전하다고 주장하지 않는다.
- 위반이 없으면, 확인한 범위에서 P0 위반을 찾지 못했다고 쓴다. 중요한 근거에 공백이 있으면 그 공백도 밝힌다.
- 제안 `Agent Note`는 미해결 지적을 기록해 달라는 요청이 있을 때만 쓴다. 노트에는 근거, 대안, 인수 기준, 위험, 활성 노트 대체 확인을 넣는다. 요청이 없으면 지적을 바로 돌려준다.
- 호출자가 구조화된 출력 스키마를 주면 그 스키마를 쓰되 규칙 이름과 심각도는 이 스킬의 것을 쓴다. 규칙 지시가 충돌하면 자동 감사를 실행하기 전에 알린다.

## 흐름 속 위치 {#position}

이 스킬은 묶음 `review`의 하위 점검이다. `dsh-code-review`가 리뷰하는 코드가 Cordis 코드이면, 이 스킬을 불러 쓴다. 단독 수명주기 감사로도 쓸 수 있다.[](source:cd-fm)[](source:rel-cd)

@workflow id=cordis-position title="cordis-styling-nitpicking 앞뒤"
| hub | dsh-code-review | security |
| me | cordis-styling-nitpicking | backend |
| note | dsh-archive-agent-notes | database |
| hub > me | Cordis 코드 | emphasis |
| me > note | 기록 요청 시 | dashed |

| rel-id | 받는 것 | 넘기는 것 | 조건 |
| --- | --- | --- | --- |
| r06 | `dsh-code-review`가 넘긴 Cordis 플러그인 코드와 진입점에서 닿는 헬퍼의 변경 | P0 지적 | 허브가 "load and apply"한다. 세 가지 P0 규칙을 확인한다(내부 위임)[](source:rel-cd) |
| r38 | 해결되지 않은 지적 | 제안 `Agent Note`(대상 저장소 `.agents/notes/`) | 기록하라는 요청이 있을 때만. 활성 노트 대체 확인을 한다. 스킬 이름은 부르지 않고 역할만 가리킨다(공유 상태, 명시-역할)[](source:cd-notes) |

전체 흐름은 `deepseek-harness/_group-review/review.html`에 있다. 관계 근거는 `deepseek-harness/relations.md`의 `rel-id`로 확인한다.

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 1개. 이 폴더에는 다른 텍스트 파일이 없다.
- 제외한 파일: 없음. 번역본도 없다.
- 범위 밖: `AGENTS.md`, `docs/cordis-tutorial/…`, `docs/defensive-patterns/general.md`, `vendor/cordis/src/fiber.ts`, `vendor/cordis/src/reflect.ts` 링크는 원래 deepseek-harness 저장소의 파일이다. 이 저장소에 없어서 Cordis 동작에 대한 원문 서술을 코드로 검증하지 못했다.[](source:cd-sot)
- 원문 비교: 같은 이름의 다른 컬렉션 사본이 없다(원장 기준).
- 실행하지 않았다. 감사와 재현은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
"P0"가 머지 차단을 뜻하는지는 원문에 명시 없음. 이 스킬이 P0 밖의 문제(P1 이하)를 어떻게 다루는지도 원문에 명시 없음. 에이전트가 이 스킬을 불러야 하는 시점을 허브 말고 다른 진입점이 정하는지도 원문에 명시 없음.
