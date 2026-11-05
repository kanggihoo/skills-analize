# egm-brainstorm 스킬은 에이전트를 어떻게 바꾸나 {#egm-brainstorm-skill}

`egm-brainstorm`을 부르면 에이전트는 아이디어를 받자마자 제안서를 쓰지 않는다. 채팅에서 열린 질문을 여러 턴 이어 가고, 사용자가 준비됐다고 확인한 뒤에야 Goldfish 리뷰어를 띄운다. 결과는 채팅이 아니라 `concepts_brief.md` 파일에 쓴다.[](source:bs-s1-gate)[](source:bs-c-artifact) **부분 분석**이다. 리뷰어를 정의한 파일과 `docs/*.md`가 저장소에 없어서, 리뷰어가 실제로 무엇을 하는지는 확인하지 못했다.

- 사용자가 준비 확인에서 `Review with Goldfishes`를 고르기 전에는 서브에이전트를 띄우지 않는다.[](source:bs-s1-only)
- 문제를 파고드는 동안에는 구조화된 질문 도구와 객관식 선택지를 쓰지 않고, 열린 질문만 한다.[](source:bs-c-clarify)
- 긴 결과물은 채팅에 붙이지 않고 파일에 쓴 뒤 경로를 알린다.[](source:bs-c-artifact)
- 칭찬, 맞장구, 사과를 하지 않고, 약점과 반론을 먼저 말한다.[](source:bs-c-stress)

@answer scope="egm/egm-brainstorm · 텍스트 5개 23,580B · 커밋 d494974 · 실행 안 함 · 지시상 동작 · 부분 분석"
@meta locale=ko
@source bs-fm title="egm/egm-brainstorm/SKILL.md · 14769B · frontmatter" path=egm/egm-brainstorm/SKILL.md lines=2:10
@source bs-ptr title="SKILL.md · 호스트별 먼저 읽을 문서" path=egm/egm-brainstorm/SKILL.md lines=15:16
@source bs-overview title="SKILL.md · 개요" path=egm/egm-brainstorm/SKILL.md lines=20:25
@source bs-deleg title="SKILL.md · 서브에이전트 띄우기와 도구가 없을 때" path=egm/egm-brainstorm/SKILL.md lines=29:36
@source bs-c-artifact title="SKILL.md · 제약 1 파일 먼저" path=egm/egm-brainstorm/SKILL.md lines=40:45
@source bs-c-clarify title="SKILL.md · 제약 2 열린 질문과 준비 확인" path=egm/egm-brainstorm/SKILL.md lines=46:53
@source bs-c-parallel title="SKILL.md · 제약 3 병렬 리뷰" path=egm/egm-brainstorm/SKILL.md lines=54:56
@source bs-c-plain title="SKILL.md · 제약 4 쉬운 영어" path=egm/egm-brainstorm/SKILL.md lines=57:62
@source bs-c-stress title="SKILL.md · 제약 5~12 반박과 금지 표현" path=egm/egm-brainstorm/SKILL.md lines=63:83
@source bs-c-gate title="SKILL.md · 제약 13 선택지 규칙" path=egm/egm-brainstorm/SKILL.md lines=84:88
@source bs-lenses title="SKILL.md · 여섯 관점 표" path=egm/egm-brainstorm/SKILL.md lines=92:99
@source bs-s1-start title="SKILL.md · 1단계 아이디어와 Author 확인" path=egm/egm-brainstorm/SKILL.md lines=105:108
@source bs-s1-drill title="SKILL.md · 1단계 열린 질문 여러 턴" path=egm/egm-brainstorm/SKILL.md lines=109:125
@source bs-s1-gate title="SKILL.md · 1단계 준비 확인 선택지" path=egm/egm-brainstorm/SKILL.md lines=126:155
@source bs-s1-only title="SKILL.md · 선택 전 서브에이전트 금지" path=egm/egm-brainstorm/SKILL.md lines=156:157
@source bs-s2-spawn title="SKILL.md · 2단계 종합 담당 띄우기" path=egm/egm-brainstorm/SKILL.md lines=161:172
@source bs-s2-merge title="SKILL.md · 2단계 중복 제거와 파일 쓰기" path=egm/egm-brainstorm/SKILL.md lines=173:177
@source bs-brief-tpl title="SKILL.md · concepts_brief.md 구조" path=egm/egm-brainstorm/SKILL.md lines=182:207
@source bs-alt title="SKILL.md · Alternatives Weighed 규칙" path=egm/egm-brainstorm/SKILL.md lines=200:203
@source bs-s3 title="SKILL.md · 3단계 알림과 반복" path=egm/egm-brainstorm/SKILL.md lines=212:218
@source bs-s4-align title="SKILL.md · 4단계 최종 확인" path=egm/egm-brainstorm/SKILL.md lines=222:223
@source bs-s4-gate title="SKILL.md · 4단계 마무리 선택지" path=egm/egm-brainstorm/SKILL.md lines=224:243
@source bs-s4-opt0 title="SKILL.md · 선택지 0 RFC 게시" path=egm/egm-brainstorm/SKILL.md lines=245:255
@source bs-s4-opt1 title="SKILL.md · 선택지 1 egm-draft로" path=egm/egm-brainstorm/SKILL.md lines=256:263
@source bs-s4-opt2 title="SKILL.md · 선택지 2 계속 다듬기" path=egm/egm-brainstorm/SKILL.md lines=264:266
@source bs-s4-opt3 title="SKILL.md · 선택지 3 보관" path=egm/egm-brainstorm/SKILL.md lines=267:269
@source ts-open title="egm/egm-brainstorm/test_scenarios.yaml · 7170B · 테스트 시나리오(열린 질문)" path=egm/egm-brainstorm/test_scenarios.yaml lines=19:32
@source ts-ready title="test_scenarios.yaml · 준비 확인 선택지" path=egm/egm-brainstorm/test_scenarios.yaml lines=34:50
@source ts-cmd title="test_scenarios.yaml · egm-draft 안내 명령 형식" path=egm/egm-brainstorm/test_scenarios.yaml lines=52:65
@source ts-route title="test_scenarios.yaml · 마무리 선택지 경로" path=egm/egm-brainstorm/test_scenarios.yaml lines=67:86
@source ts-matrix title="test_scenarios.yaml · 결정 표" path=egm/egm-brainstorm/test_scenarios.yaml lines=88:104
@source ts-author title="test_scenarios.yaml · Author 확인" path=egm/egm-brainstorm/test_scenarios.yaml lines=106:119
@source ts-alt title="test_scenarios.yaml · 기각 사유 표기" path=egm/egm-brainstorm/test_scenarios.yaml lines=121:134
@source tm-all title="egm/egm-brainstorm/TEST.md · 946B · 확인 목록" path=egm/egm-brainstorm/TEST.md lines=7:17
@source oy-all title="egm/egm-brainstorm/agents/openai.yaml · 199B · UI 표시 정보" path=egm/egm-brainstorm/agents/openai.yaml lines=1:6
@source ic-all title="egm/egm-brainstorm/assets/icon.svg · 496B · 아이콘 그림" path=egm/egm-brainstorm/assets/icon.svg
@source dr-p1 title="egm/egm-draft/SKILL.md · r01 확인용(우선순위 1 입력)" path=egm/egm-draft/SKILL.md lines=146:149
@source dr-p3 title="egm-draft/SKILL.md · r04 확인용(brief가 없을 때)" path=egm/egm-draft/SKILL.md lines=156:160
@source dr-alt title="egm-draft/SKILL.md · r03 확인용(Alternatives)" path=egm/egm-draft/SKILL.md lines=203:206
@source dr-ctx title="egm-draft/SKILL.md · r02 확인용(Context File)" path=egm/egm-draft/SKILL.md lines=73:78
@source dr-save title="egm-draft/SKILL.md · r07 확인용(저장 폴더와 SITEMAP)" path=egm/egm-draft/SKILL.md lines=306:312
@source dr-cons title="egm-draft/SKILL.md · r22 확인용(Execution Constraints)" path=egm/egm-draft/SKILL.md lines=20:71

## 언제 켜지고 무엇을 받아야 시작하나 {#trigger}

@code source=bs-fm language=yaml

- 호출 제한 필드가 `disable-model-invocation: true`다.[](source:bs-fm) 판정: 이 필드는 모델이 스스로 스킬을 켜지 못하게 막는다고 읽는다. `SKILL.md`에 이 필드를 설명하는 문장은 원문에 명시 없음.
- `description`은 스킬이 하는 일을 소개하는 문장이다. 이 단어가 있으면 켜진다는 목록은 아니다.[](source:bs-fm)
- 첫머리에서 Codex나 ChatGPT Work는 `docs/codex.md`를, Claude Code나 Cowork는 `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`를 먼저 읽으라고 한다. 두 파일은 이 저장소에 없다.[](source:bs-ptr)
- `egm-draft`는 Claude Code에서 `/egm:egm-brainstorm`으로 이 스킬을 시작하라고 안내한다.[](source:dr-p3)

| 시작할 때 필요한 것 | 규칙 |
| --- | --- |
| 아이디어 | 사용자가 처음 기능 아이디어를 주었는지 확인하고, 없으면 무엇을 브레인스토밍할지 설명해 달라고 요청한다.[](source:bs-s1-start) |
| `Author` | `git config user.name`에서 찾고, 없으면 `GIT_AUTHOR_NAME`을 본다. 둘 다 없으면 채팅으로 묻는다. 테스트 시나리오는 OS 로그인 이름이나 maintainers를 기본값으로 쓰지 않는지 검사한다.[](source:bs-s1-start)[](source:ts-author) |
| 서브에이전트 도구 | 하니스에 도구가 없으면 멈추고 "같은 컨텍스트에서 한 리뷰는 Goldfish 리뷰가 아니다"라고 사용자에게 알린다.[](source:bs-deleg) |

선행 파일이 있어야 켜진다는 제한은 원문에 명시 없음. 이전에 만든 `concepts_brief.md`를 이어 쓰는 방법도 원문에 명시 없음. 다만 3단계 반복과 4단계 선택지 2가 같은 파일을 다시 다듬는 경로를 준다.[](source:bs-s3)[](source:bs-s4-opt2)

## 어떤 순서로 일하고 사람은 어디서 개입하나 {#flow}

@workflow id=brainstorm-flow title="egm-brainstorm 4단계와 사람 개입 지점"
| lane clarify | 문제 좁히기 |
| lane review | 리뷰와 반복 |
| lane ship | 마무리 |
| ask | 열린 질문 | backend | clarify |
| ready | 준비됐나? | external | clarify |
| review | Goldfish 리뷰 | backend | review |
| brief | 요약문 쓰기 | backend | review |
| react | 반론에 대응 | external | review |
| align | 최종 확인 | external | ship |
| pick | 마무리 선택 | external | ship |
| ask > ready | |
| ready > ask | 더 설명 | dashed |
| ready > review | 예 | emphasis |
| review > brief | |
| brief > react | |
| react > ask | 다시 돌림 | dashed |
| react > align | 만족 |
| align > pick | |
| pick > react | 계속 다듬기 | dashed |

@steps id=brainstorm-steps
| ask | 열린 질문 | 아이디어와 `Author`를 확인한 뒤, 한 번 답을 듣고 바로 서브에이전트를 띄우지 않는다. 문제, 소비자와 요구 수준, 절대 제약, 범위 밖 경계, 지금의 해결 방식, 성공 척도를 열린 질문으로 여러 턴 묻는다. 구조화된 질문 도구와 객관식 선택지는 쓰지 않는다.[](source:bs-s1-start)[](source:bs-s1-drill) | brainstorm-flow | ask |
| ready | 준비됐나? | 기반이 잡히면 확정 가설을 2~3문장으로 요약하고, 질문 하나짜리 선택지를 준다. `Review with Goldfishes`를 고르면 리뷰로 간다. `Clarify additional constraints or assumptions in chat`을 고르면 1단계에 남아 설명을 받고 선택지를 다시 낸다.[](source:bs-s1-gate) | brainstorm-flow | ready |
| review | Goldfish 리뷰 | `egm-synthesizer`를 띄운다. 프롬프트에 `Mode: BRAINSTORM`과 리뷰어 6명을 적는다. 하니스가 중첩 서브에이전트를 못 쓰면 여섯 관점의 Goldfish를 병렬로 직접 띄운다.[](source:bs-s2-spawn)[](source:bs-deleg) | brainstorm-flow | review |
| brief | 요약문 쓰기 | 리뷰어들의 지적을 모아 겹치는 것을 줄이고 `concepts_brief.md`에 쓴다. 파일은 작업 폴더나 하니스의 artifact 폴더에 둔다.[](source:bs-s2-merge) | brainstorm-flow | brief |
| react | 반론에 대응 | 채팅에는 파일 경로와 핵심 반론이나 열린 위험 2~3개만 알린다. 사용자에게 방향 전환, 범위 축소, 제약 추가 같은 대응을 묻고, 1~2단계를 다시 돌려 분석을 갱신한다. 개념이 검토를 견디고 사용자가 만족할 때까지 이어진다.[](source:bs-s3) | brainstorm-flow | react |
| align | 최종 확인 | 사용자에게 최종 `concepts_brief.md`를 읽고 동의하는지 확인받는다.[](source:bs-s4-align) | brainstorm-flow | align |
| pick | 마무리 선택 | 선택지 네 개를 낸다. RFC 게시, `egm-draft` 안내, 계속 다듬기, 보관이다.[](source:bs-s4-gate) | brainstorm-flow | pick |

사람이 개입하는 곳은 네 군데다. 열린 질문에 답하는 일, 준비 확인 선택, 반론에 어떻게 대응할지 정하는 일, 마무리 선택이다.[](source:bs-s1-drill)[](source:bs-s1-gate)[](source:bs-s3)[](source:bs-s4-gate) 준비 확인 선택지와 마무리 선택지는 질문이 정확히 하나여야 하고, 그 턴의 유일한 도구 호출이어야 하며, 선택지에 `(Recommended)` 접두어를 붙이지 않는다.[](source:bs-c-gate)

종료는 마무리 선택에서 RFC 게시, `egm-draft` 안내, 보관 중 하나를 고를 때다. 계속 다듬기를 고르면 3단계로 돌아간다.[](source:bs-s4-opt0)[](source:bs-s4-opt1)[](source:bs-s4-opt2)[](source:bs-s4-opt3) 질문을 몇 턴 하는지와 3단계 반복의 횟수 상한은 원문에 명시 없음. 원문은 "필요한 만큼"과 "사용자가 만족할 때까지"라고만 적는다.[](source:bs-s1-drill)[](source:bs-s3)

## 에이전트에게 무엇을 강제하고 금지하나 {#rules}

원문은 Execution Constraints 13개를 `MUST`와 `STRICTLY FORBIDDEN`으로 적는다. 묶어 보면 다음과 같다.

| 규칙 | 내용 |
| --- | --- |
| 파일 먼저 | 큰 제안서, 초안, 브레인스토밍 요약, brief를 채팅에 직접 내놓지 않는다. 파일에 쓰고 깔끔한 링크로 알린다.[](source:bs-c-artifact) |
| 열린 질문 | 문제가 분명해질 때까지 여러 턴에 걸쳐 열린 평문 질문을 한다. `ask_question` 같은 구조화된 질문 도구와 미리 만든 객관식 답은 쓰지 않는다.[](source:bs-c-clarify) |
| 준비 확인 전 서브에이전트 금지 | 사용자가 앵커된 가설을 본 뒤 준비됐다고 확인하기 전에는 서브에이전트를 띄우지 않는다.[](source:bs-c-clarify) |
| 병렬 리뷰 | 기능 개념을 여러 관점으로 동시에 평가해서, 순서에 따른 편향을 막고 비판의 폭을 넓힌다.[](source:bs-c-parallel) |
| 쉬운 영어 | 모든 brief, RFC 요약, 소통을 단순하고 직접적이고 전문 용어가 적은 영어로 쓴다. 근거 없는 홍보 형용사(`seamless`, `robust`, `blazingly fast`)와 장식 부사(`seamlessly`, `effortlessly`, `literally`, `drastically`, `obviously`)는 쓰지 않는다.[](source:bs-c-plain) |
| 반박이 기본 | 기본값은 아이디어를 반박해 보는 것이다. 칭찬하지 않고, 아무리 강한 아이디어도 틀렸거나 빠졌거나 위험한 점을 먼저 말한다. 사용자의 프레임을 되풀이하지 않는다.[](source:bs-c-stress) |
| 반론 만들기 | 제안된 전략마다 "사용자가 못 보는 것은 무엇인가", "가장 강한 반론은 무엇인가", "반대 견해가 타당한가"를 적는다.[](source:bs-c-stress) |
| 동의는 검증 뒤에 | 엄격하고 객관적인 검토를 통과한 뒤에만 동의한다.[](source:bs-c-stress) |
| 금지 표현 | 사용자의 입력, 수정, 결정을 두고 `brilliant`, `great`, `smart`, `correct`, `perfect`, `excellent`, `spot-on`을 쓰지 않는다. 지적을 받아도 `I apologize` 같은 사과를 하지 않고, 바로잡은 기술 논리나 트레이드오프를 말한다.[](source:bs-c-stress) |
| 선택지 규칙 | 선택 게이트는 질문이 정확히 하나이고, 그 턴의 유일한 도구 호출이며, 행동 중심 선택지를 주되 `(Recommended)`를 붙이지 않는다.[](source:bs-c-gate) |

판정: 열린 질문 단계에서는 구조화된 질문 도구가 금지되는데, 두 선택 게이트에서는 그 도구를 쓰거나 평문으로 해도 된다.[](source:bs-c-clarify)[](source:bs-s1-gate) 두 규칙은 단계가 달라서 충돌하지 않는다.

여섯 관점은 2단계 리뷰에서 각 Goldfish가 던질 질문의 방향을 보여 준다.

| 관점 | 목표 | 던지는 질문의 요지 |
| --- | --- | --- |
| Contrarian / YAGNI | 코드와 복잡도 줄이기 | 이 기능이 왜 필요한가. 기존 라이브러리나 서비스가 문제의 90%를 풀지 않는가[](source:bs-lenses) |
| Cost, Quota & Token Economics | 인프라와 예산 확장성 | 최대 QPS, 메모리, DB 쿼리 부하, LLM 토큰 예산은 얼마인가. 규모가 커지면 quota 상한에 닿는가[](source:bs-lenses) |
| UX & Developer Ergonomics | 사용성과 인지 부담 | API나 CLI가 직관적인가. 생태계 관례에 맞는가. 오류 메시지로 바로 조치할 수 있는가[](source:bs-lenses) |
| Migration & Backward Compatibility | 롤아웃 안전성 | 기존 클라이언트와 데이터는 어떻게 옮기는가. 직렬화 스키마나 저장소가 깨지는가. 이전 중에 롤백은 어떻게 하는가[](source:bs-lenses) |
| Observability & SRE Debuggability | 텔레메트리와 운영 가시성 | 핵심 동작을 분산 추적으로 볼 수 있는가. 새벽 3시 장애에 온콜이 어떻게 분류하는가[](source:bs-lenses) |
| Long-Term Tech Debt & Maintenance | 장기 유지보수성 | 2년 뒤 고치기 힘든 강한 결합이나 깨지기 쉬운 상태 머신을 만드는가[](source:bs-lenses) |

2단계 프롬프트가 지정하는 리뷰어 6명은 `egm-design`, `egm-codebase-details`, `egm-zoom-out`, `egm-comprehension`, `egm-implementation-readiness`, `egm-structural`이다.[](source:bs-s2-spawn) 이 이름들과 위 여섯 관점이 하나씩 대응한다는 말은 원문에 명시 없음. 자세한 내용은 감사 패널에 둔다.

## 무엇을 만들고 어디까지 쓰나 {#output}

에이전트는 `concepts_brief.md` 하나를 만들고 갱신한다. 위치는 작업 폴더의 `./concepts_brief.md`이거나 하니스의 artifact 폴더다.[](source:bs-c-artifact) 구조는 아래 원문 그대로다.

@code source=bs-brief-tpl language=markdown

- `Author`는 1단계에서 정한 값으로 채운다.[](source:bs-s1-start)
- `Alternatives Weighed`는 이 단계에서 기각한 선택지마다 기술적 이유를 적는다. `Rejected by author: <reason>` 형식이 예로 나온다.[](source:bs-alt) 문서에는 이 절을 `egm-draft`가 `Alternatives Considered`로 옮기며, 다른 출처가 없다고 적는다.[](source:bs-alt)
- 기각을 maintainer가 했다고 쓰려면 그 사람의 issue, discussion, PR 링크가 있어야 한다. 링크가 없으면 쓰지 않는다.[](source:bs-alt)
- 테스트 시나리오는 사용자가 RabbitMQ를 기각했다고 말하면 `Rejected by author:`를 쓰고 `Rejected by maintainer`는 쓰지 않는지 검사한다.[](source:ts-alt)

마무리 선택지에 따라 에이전트가 하는 일은 이렇다.

| 선택지 | 에이전트가 하는 일 | 바뀌는 것 |
| --- | --- | --- |
| `Publish concepts_brief.md as RFC for team feedback` | `docs/designs/<feature_name>.md`에 쓰고, `docs/designs/SITEMAP.md`가 있으면 등록한다. 팀 피드백을 받은 뒤 그 파일로 `egm-draft`를 시작할 수 있다고 알린다.[](source:bs-s4-opt0) | 파일 쓰기 2곳 |
| `Proceed to egm-draft (Initialize formal design document)` | `concepts_brief.md`가 저장돼 있는지 확인하고, 사용자에게 `egm-draft`를 시작하라고 안내한다. Claude Code 예는 `/egm:egm-draft`, Codex는 skill picker다.[](source:bs-s4-opt1) | 없음 |
| `Continue refining concepts_brief.md in ideation mode` | 3단계 반복으로 돌아가 엣지 케이스를 더 다루거나 brief를 고친다.[](source:bs-s4-opt2) | brief |
| `Conclude brainstorming and keep brief for later` | 세션을 끝내고 `concepts_brief.md`가 남아 있다고 알린다.[](source:bs-s4-opt3) | 없음 |

- 에이전트가 `egm-draft`를 직접 시작한다는 말은 원문에 명시 없음. 사용자가 시작한다.[](source:bs-s4-opt1)
- 테스트 시나리오는 안내문에 접두어 없는 `/egm-draft`를 쓰지 않고, 폐기된 `/egm-discuss`로 보내지 않는지 검사한다.[](source:ts-cmd)[](source:ts-route)
- RFC 게시에서 `docs/designs/`에 쓰기 전에 사용자에게 한 번 더 묻는다는 말은 원문에 명시 없음. 판정: 선택지를 고르는 것이 곧 승인이라는 원문의 구조에서 읽은 해석이다.

## 앞뒤 스킬과 어떻게 이어지나 {#position}

`egm-brainstorm`은 컬렉션에서 처음 오는 단계다. 앞 스킬은 원문에 명시 없음. 사용자가 반쯤 굳은 아이디어를 들고 직접 부른다. 전체 흐름은 `egm/_group-idea-to-design/idea-to-design.html`에 있다.

@workflow id=brainstorm-position title="egm-brainstorm 앞뒤"
| idea | 반쯤 굳은 아이디어 | external |
| me | egm-brainstorm | backend |
| rfc | docs/designs RFC | database |
| draft | egm-draft | backend |
| idea > me | |
| me > draft | r01 선택지 1 | emphasis |
| me > rfc | r02 선택지 0 |
| rfc > draft | r02 피드백 뒤 | dashed |

@steps id=position-steps
| idea | 반쯤 굳은 아이디어 | 사용자가 아이디어를 들고 `egm-brainstorm`을 직접 부른다.[](source:bs-s1-start) | brainstorm-position | idea |
| me | egm-brainstorm | 위 4단계를 거쳐 `concepts_brief.md`를 만든다. | brainstorm-position | me |
| rfc | docs/designs RFC | 선택지 0이면 `docs/designs/<feature_name>.md`에 쓴다.[](source:bs-s4-opt0) | brainstorm-position | rfc |
| draft | egm-draft | 사용자가 `egm-draft`를 시작한다. `egm-draft`가 `concepts_brief.md`를 우선순위 1 입력으로 읽는다.[](source:bs-s4-opt1)[](source:dr-p1) | brainstorm-position | draft |

| rel-id | 종류 | 받는 것·넘기는 것 | 조건·강도·사용자 개입 | 그림 |
| --- | --- | --- | --- | --- |
| r01 | 넘김 | `concepts_brief.md`를 `egm-draft`에 넘긴다 | 선택지 1을 사용자가 고르면, 에이전트가 파일 저장을 확인하고 사용자에게 시작하라고 안내한다. 에이전트가 직접 시작한다는 말은 원문에 명시 없음[](source:bs-s4-opt1)[](source:dr-p1) | 있음 |
| r02 | 넘김 | `docs/designs/<feature_name>.md`를 `egm-draft`의 입력으로 쓸 수 있다 | 선택지 0이면 게시하고 팀 피드백 뒤에 `egm-draft`를 시작할 수 있다고 상기시킨다. 시작은 사용자가 한다[](source:bs-s4-opt0)[](source:dr-ctx) | 있음 |
| r03 | 산출물 호환 | `Alternatives Weighed` 절이 `egm-draft`의 `Alternatives Considered` 입력이다 | brainstorm이 이 절을 `egm-draft`의 유일한 출처라고 적는다. draft는 절이 없으면 사용자에게 묻는다[](source:bs-alt)[](source:dr-alt) | 생략 |
| r04 | 넘김 | `egm-draft`가 이 스킬 시작을 제안한다 | `egm-draft`에 `Context File`도 `concepts_brief.md`도 `discussion_summary.md`도 없을 때 채팅 질문과 함께 제안한다. 의무가 아니다[](source:dr-p3) | 생략 |
| r07 | 공유 상태 | `docs/designs/`와 `docs/designs/SITEMAP.md`를 둘 다 쓴다 | brainstorm은 RFC 게시 때, draft는 저장 때 쓴다. 둘 다 `SITEMAP.md`가 있으면 등록한다[](source:bs-s4-opt0)[](source:dr-save) | 생략 |
| r15 | 내부 위임 | `egm-synthesizer`에 가설과 `Mode: BRAINSTORM`을 넘긴다 | 준비 확인에서 `Review with Goldfishes`를 고른 뒤에만 띄운다. 파일이 이 저장소에 없다(범위 밖)[](source:bs-s2-spawn)[](source:bs-s1-only) | 생략 |
| r22 | 같은 계열 | `egm-draft`와 같은 Execution Constraints 묶음을 쓴다 | 두 본문의 규칙 묶음(파일 먼저, 쉬운 영어, 맞장구 금지, 질문 하나)이 같아 보인다. 판정이며 연결 지시는 없다[](source:bs-c-artifact)[](source:dr-cons) | 생략 |

## 어디까지 확인했고 무엇이 남았나 {#audit}

@facts id=audit-facts
| 읽은 텍스트 파일 | 5개, 합계 23,580B(`SKILL.md` 14,769B, `test_scenarios.yaml` 7,170B, `TEST.md` 946B, `agents/openai.yaml` 199B, `assets/icon.svg` 496B) |
| 부분 읽음(구조·표본만 본 파일) | 0개 |
| 제외한 파일 | 없음. 바이너리도 없다. `icon.svg`는 24×24 그림이고 지시가 없어 분석에 쓰지 않았다.[](source:ic-all) `openai.yaml`은 표시 이름 `EGM Brainstorm`, 설명 "Turn an idea into a clear design brief"를 담은 UI 정보다.[](source:oy-all) |
| 실행 여부 | 스킬을 실행하지 않았고 `test_scenarios.yaml`도 돌리지 않았다 |

`test_scenarios.yaml`은 upstream이 기대하는 동작을 정규식으로 검사하는 시나리오 7개다. 이 분석은 그 기대를 `SKILL.md` 문장과 맞춰 읽었을 뿐 검사를 돌리지 않았다.[](source:ts-open)[](source:ts-ready)

| 시나리오 | 기대하는 동작 |
| --- | --- |
| 열린 질문 | 초기 탐색에서 `(Recommended)`, `Option 1`, `Option A`, `[1]` 같은 객관식 표시를 쓰지 않는다[](source:ts-open) |
| 준비 확인 | 두 선택지 문구가 정확히 나오고 `(Recommended)`가 없다[](source:ts-ready) |
| 안내 명령 형식 | `egm-draft` 시작을 안내하되 접두어 없는 `/egm-draft`는 쓰지 않는다[](source:ts-cmd) |
| 마무리 경로 | RFC 게시와 `egm-draft` 선택지가 나오고, `/egm-discuss`와 `(Recommended)`는 없다[](source:ts-route) |
| 결정 표 | Kafka, RabbitMQ, Pub/Sub 비교를 Markdown 표로 만든다[](source:ts-matrix) |
| Author 확인 | git 설정이 없으면 채팅으로 묻는다[](source:ts-author) |
| 기각 사유 | `Rejected by author:`를 쓴다[](source:ts-alt) |

`TEST.md`의 확인 목록은 1단계 준비 확인, 2단계 여섯 관점, 3~4단계 `concepts_brief.md`와 인계 세 가지를 든다.[](source:tm-all)

@callout level=open-question title="확인하지 못한 것"
리뷰어 정의 파일(`agents/synthesizer.md`와 리뷰어 6명)이 스킬 폴더에 없다. `Mode: BRAINSTORM`일 때 리뷰어가 무엇을 하는지, 여섯 관점이 어디서 쓰이는지는 확인하지 못했다.[](source:bs-s2-spawn)[](source:bs-deleg)
여섯 관점 표의 이름과 2단계 리뷰어 6명의 이름이 하나씩 대응하는지 원문에 명시 없음.[](source:bs-lenses)[](source:bs-s2-spawn)
`docs/codex.md`, `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`, `docs/harnesses.md`가 저장소에 없다. 일곱 스킬 공통 안내라서 `부분 분석` 판정의 원인에는 넣지 않고 여기에만 적는다.[](source:bs-ptr)[](source:bs-deleg)
`test_scenarios.yaml`은 결정 표를 만드는 동작을 기대하지만, `SKILL.md`에는 결정 표를 만들라는 지시가 원문에 명시 없음.[](source:ts-matrix)
스킬을 실행하지 않아서, 만들어진 `concepts_brief.md`의 품질이나 Goldfish 반론의 실제 내용은 확인하지 못했다.

@callout level=note title="분석 직전에 바뀐 파일"
이번 분석 직전에 `scripts/update-skill.py`로 최신화한 결과, `egm-brainstorm`에서는 `SKILL.md`(25줄 변경)와 `test_scenarios.yaml`(51줄 변경)이 바뀌었다. 바뀐 내용은 `Author` 확인 규칙 추가, `Alternatives Weighed`의 기각 표기 규칙 추가, 안내 명령을 호스트별 형식으로 바꾼 것이다. 분석 중에는 파일이 바뀌지 않았다.
