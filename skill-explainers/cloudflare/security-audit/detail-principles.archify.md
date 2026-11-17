# 핵심 원칙과 심각도 기준 — 무엇을 finding이라 부르고 무엇을 버리나 {#principles-detail}

이 페이지는 `SKILL.md`의 `Core principles`와 `Anti-patterns`를 맡는다. 개요의 어느 한 노드에 묶이지 않고 사냥, 후보 검증, 최종 검증, 보고서 전체에 적용되는 판단 기준이다. 시작 입력은 hunter나 verifier가 본 후보 하나이고, 끝 출력은 그 후보를 `confirmed`, `needs_validation`, 기각 중 어디에 둘지에 대한 판단이다. 원칙형이라 순서를 만들지 않는다.

@answer scope="cloudflare/security-audit · SKILL.md 136~192줄 · 지시상 동작"
@meta locale=ko
@source skm-pr-boundary title="경계와 결과 요구" path=cloudflare/security-audit/SKILL.md lines=138:140
@source skm-pr-local title="제한된 local 증거" path=cloudflare/security-audit/SKILL.md lines=142:144
@source skm-pr-vis title="소스 가시성" path=cloudflare/security-audit/SKILL.md lines=146:148
@source skm-pr-sev title="심각도와 확실성 분리" path=cloudflare/security-audit/SKILL.md lines=150:152
@source skm-pr-anchor title="심각도 기준점" path=cloudflare/security-audit/SKILL.md lines=154:162
@source skm-pr-fix title="최소 수정 권고" path=cloudflare/security-audit/SKILL.md lines=164:166
@source skm-anti title="안티패턴 열 개" path=cloudflare/security-audit/SKILL.md lines=181:192

## 다섯 원칙은 판단을 어떻게 바꾸나 {#principles span=12}

아래 "적용 전후"는 원문에 없는 설명용 예시다. 값은 지어낸 것이고, 원칙의 효과를 보이려는 용도다.

| 원칙 | 원문 규칙 | 바뀌는 판단 | 적용 전후(설명용 예시) |
| --- | --- | --- | --- |
| 경계와 결과를 요구한다 | 후보마다 낮은 신뢰 주체, 받아들인 입력·행동, 의도한 통제, 넘은 경계, 영향받는 주체나 자원, 관찰됐거나 소유자가 관찰할 수 있는 결과를 적는다. 빠진 모범 사례, 추측한 배포 동작, 일반 parser crash, 자기 자신에게만 미치는 영향은 finding으로 올리지 않는다[](source:skm-pr-boundary) | "검증이 없다"는 관찰을 finding으로 삼지 않고, 그 입력으로 누가 무엇을 얻는지 말할 수 있어야 한다 | 전: "입력 검증이 없다" 한 줄. 후: 요청자가 다른 tenant의 더미 레코드를 읽었다는 결과가 있어야 후보가 된다 |
| 제한된 local 증거를 쓴다 | 정적 분석은 소스 경로를 세운다. 모든 실행 통제가 있을 때만 샌드박스 local test로 동작을 푼다. 틀린 반환값, 권한 없는 더미 레코드, sanitizer finding, 정책 차이 같은 최소 효과에서 멈추고 지속·사후 오류·은닉 자료는 만들지 않는다[](source:skm-pr-local) | 재현은 경계 결과가 나오는 데까지만 한다 | 전: exploit 체인을 이어 간다. 후: 더미 레코드 하나가 읽히면 거기서 멈춘다 |
| 소스 가시성을 존중한다 | 배포 통제, proxy 동작, provider 설정, browser header, identity 정책, broker ACL, packaging, topology는 실제 통제다. 필요한데 저장소에 없으면 있다고도 없다고도 가정하지 않고 `needs_validation`에 정확한 빠진 사실과 안전한 소유자 확인·local 계획을 적는다[](source:skm-pr-vis) | repo 밖 사실이 결정적이면 추측하지 않고 막힌 후보로 남긴다 | 전: "proxy가 없을 테니 노출된다"고 단정. 후: "proxy가 header를 지우는지"를 blocker로 적는다 |
| 심각도와 확실성을 분리한다 | severity는 `confirmed`에만 붙는다. likelihood와 impact는 증명된 조건과 결과를 반영해야 하고, 전체 severity가 증명된 impact를 넘을 수 없다. `needs_validation`은 소스 근거가 있는 경계 가설이 막힌 것이지 확신이 낮은 `confirmed`가 아니며 severity가 없다[](source:skm-pr-sev) | 확실성이 낮다고 낮은 severity를 붙이지 않는다 | 전: 불확실한 후보에 `low`. 후: severity 칸을 비우고 blocker를 쓴다 |
| 가장 작은 수정을 권한다 | `confirmed` finding마다 코드가 지켜야 할 invariant와, 마지막 신뢰된 결정 지점에서 그것을 강제하는 가장 좁은 소스 변경을 찾는다. 일반적인 hardening 조언보다 저장소 상대 변경과 regression test를 우선한다. 감사는 수정을 설명할 뿐 대상 소스를 고치지 않는다[](source:skm-pr-fix) | 보고서의 수정안이 "전반 강화"에서 "이 줄의 이 검사"로 바뀐다 | 전: "입력을 전반적으로 검증하라". 후: 소유자 검사를 마지막 결정 지점 한 곳에 추가하고 그 경우를 regression test로 둔다 |

## 심각도는 어떤 기준점으로 맞추나 {#severity span=12}

전체 severity는 아래 기준점에 맞춘다.[](source:skm-pr-anchor)

| severity | 기준 |
| --- | --- |
| `critical` | 인증 없는 주체가 code execution, 전체 data store 접근, 임의 계정 탈취를 얻는다 |
| `high` | 주체가 명시된 보안 통제를 완전히 무력화하고 실제 결과가 있다. 인증 우회, tenant 간 읽기·쓰기, 다른 사용자에게 미치는 stored script 실행, 인증된 code execution, 인증 없는 공유 서비스 원격 중단 등이다 |
| `medium` | 실제 경계 위반이지만 영향 범위가 제한적이거나 전제 조건이 드물거나 결과가 좁은 자원 집합에 한정된다 |
| `low` | 비밀이 아닌 내부 정보 노출, 또는 이득이 작은데 지속적인 노력이 드는 효과 |
| `informational` | 확인됐지만 영향이 최소인 관찰. 더 큰 finding 안의 선행 조건으로 주로 쓰인다 |

`high`와 `medium`을 가르는 질문은 하나다. 증명된 결과가 실제 결과가 있는 행동에 대해 명시된 통제를 완전히 무력화했는가, 아니면 약화했을 뿐인가. 구체적인 피해를 말할 수 없으면 severity는 느낌보다 낮다.[](source:skm-pr-anchor)

## 어떤 보고를 anti-pattern으로 보나 {#anti-patterns span=12}

원문은 열 가지를 anti-pattern으로 든다.[](source:skm-anti)

@list id=anti-pattern-list ordered=true
| 체크리스트 위반을 취약점으로 제시한다.[](source:skm-anti) |
| 도달 가능한 경계 위반이 없는 defense-in-depth 조언을 낸다.[](source:skm-anti) |
| 제한된 local 증거로 부족한데 live 환경이나 공유 환경에서 시험한다.[](source:skm-anti) |
| 소스에 없는 provider, proxy, browser, identity, 배포 동작을 추측한다.[](source:skm-anti) |
| 같은 주체의 의도된 권한이나 자기 영향을 경계를 넘은 결과로 다룬다.[](source:skm-anti) |
| 관찰한 것보다 강한 parser·runtime 효과를 보고한다.[](source:skm-anti) |
| 중복 제거와 검증이 불가능한 산문뿐인 hunter 결과를 내보낸다.[](source:skm-anti) |
| 이전의 같은 소스 `confirmed` record를 다시 보고하거나, 사냥을 한쪽으로 끌어당기는 예시로 쓴다.[](source:skm-anti) |
| `needs_validation` record에 severity를 매긴다.[](source:skm-anti) |
| 독립 검증 전에 보고서를 쓰거나 산문과 JSON이 서로 다르게 둔다.[](source:skm-anti) |

## 다른 페이지 {#other-pages span=12}

| 파일 | 내용 |
| --- | --- |
| `security-audit.html` | 개요 |
| `security-audit.verify.html` | 후보를 `confirmed`·`needs_validation`·`rejected`로 가르는 규칙 |
| `security-audit.records.html` | severity와 confidence가 `findings.json`에서 갖는 형식 |
| `security-audit.rules.html` | 영역별 validation rules |
