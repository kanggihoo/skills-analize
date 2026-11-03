# make-bot-ui 스킬은 에이전트를 어떻게 바꾸나 {#make-bot-ui-skill}

`make-bot-ui`를 쓰면 에이전트는 버튼을 누르면 봇(Grok Bot)이 깨어나는 페이지를 만든다. 웹훅(webhook)을 부르는 쪽은 브라우저가 아니라 이 컴퓨터의 로컬 서버다.[](source:skill-intro)[](source:skill-host)

- 발신 키(sender key)는 서버 설정에만 둔다. 브라우저, 채팅, 이 스킬 파일에는 두지 않는다.[](source:skill-intro)
- 에이전트는 키를 채팅으로 받지 않는다. 비밀 요청 카드를 보내고 그 턴을 끝낸다.[](source:skill-secret)
- 사용자가 제출한 키는 connector 자격 증명 파일에 들어간다. 에이전트는 값을 보지 못한 채 서버 설정으로 옮긴다.[](source:skill-secret)
- 페이지는 Tailscale 망(tailnet)에 HTTP 주소로 공개한다. 이미 켜진 노드가 있으면 새로 만들지 않는다.[](source:skill-tail-reuse)

@answer scope="pstack/make-bot-ui · 원본 텍스트 파일 1개 · 커밋 5760176"
@meta locale=ko
@source skill-fm title="pstack/make-bot-ui/SKILL.md · 4649B · frontmatter" path=pstack/make-bot-ui/SKILL.md lines=1:8
@source skill-intro title="pstack/make-bot-ui/SKILL.md · 전체 구조와 키 원칙" path=pstack/make-bot-ui/SKILL.md lines=11:11
@source skill-routine title="pstack/make-bot-ui/SKILL.md · 웹훅 루틴 만들기" path=pstack/make-bot-ui/SKILL.md lines=13:23
@source skill-copy title="pstack/make-bot-ui/SKILL.md · 웹훅 주소와 발신 키 복사" path=pstack/make-bot-ui/SKILL.md lines=25:37
@source skill-secret title="pstack/make-bot-ui/SKILL.md · 발신 키 요청" path=pstack/make-bot-ui/SKILL.md lines=39:51
@source skill-host title="pstack/make-bot-ui/SKILL.md · 서버 설정과 바인딩" path=pstack/make-bot-ui/SKILL.md lines=53:57
@source skill-post title="pstack/make-bot-ui/SKILL.md · 웹훅 POST 형식" path=pstack/make-bot-ui/SKILL.md lines=59:73
@source skill-tail-reuse title="pstack/make-bot-ui/SKILL.md · 기존 Tailscale 노드 재사용" path=pstack/make-bot-ui/SKILL.md lines=75:84
@source skill-tail-install title="pstack/make-bot-ui/SKILL.md · Tailscale 설치와 로그인" path=pstack/make-bot-ui/SKILL.md lines=86:103
@source skill-wake title="pstack/make-bot-ui/SKILL.md · 웹훅 깨움 처리" path=pstack/make-bot-ui/SKILL.md lines=105:115
@source help-row title="pstack/poteto-help/SKILL.md · make-bot-ui 안내 줄" path=pstack/poteto-help/SKILL.md lines=85:85

## 언제 켜지나 {#trigger}

@code source=skill-fm language=yaml

`disable-model-invocation: true`라서 모델이 스스로 이 스킬을 켜지 않는다.[](source:skill-fm) 사용자가 `/make-bot-ui`를 입력하거나 다른 스킬이 부를 때 켜진다. pstack 안에서 이 스킬을 부르는 스킬은 없다. `poteto-help`의 안내표가 "버튼으로 봇을 깨우는 페이지" 상황에 추천할 뿐이다.[](source:help-row)

`description`은 세 경우를 든다. 웹훅으로 봇을 깨우는 맞춤 UI를 만들 때, 사용자가 발신 키를 넘겨야 할 때, 그 UI를 Tailscale 망에 공개할 때다.[](source:skill-fm) frontmatter 항목 `name`은 폴더 이름과 달리 `Make Bot UI`다.

이 스킬은 Grok Bot 실행 환경의 도구(`update_state`, `SendToUser`)와 Cursor 웹훅 주소를 전제로 한다.[](source:skill-routine)[](source:skill-copy) 판정: 그 도구가 없는 환경에서는 절차 대부분을 그대로 쓸 수 없다.

## 버튼을 누르면 무엇이 오가나 {#runtime}

@sequence id=bot-wake title="버튼에서 봇 깨움까지"
| actor browser | 브라우저 | frontend |
| actor server | 로컬 서버 | backend |
| actor hook | 웹훅 | cloud |
| actor bot | 봇 루틴 | backend |
| browser | server | 버튼 POST |
| server | hook | POST + 키 | security |
| hook | server | HTTP 200 | return |
| hook | bot | 깨움 턴 | emphasis |

@steps id=wake-steps
| s-click | 버튼 POST | 사용자가 페이지 버튼을 누르면 브라우저는 같은 컴퓨터의 로컬 서버로만 요청을 보낸다. 브라우저는 웹훅 주소도 키도 모른다. | bot-wake | browser |
| s-post | POST + 키 | 로컬 서버가 웹훅 주소로 JSON 객체 하나를 보낸다. 키는 `Authorization: Bearer <key>`와 `X-Automation-Key: <key>` 두 헤더에 모두 싣는다. 시간 제한 8초, 한 번만 보내고 재시도하지 않는다. | bot-wake | server |
| s-ok | HTTP 200 | 루틴이 깨어나면 HTTP 200이 돌아온다. | bot-wake | hook |
| s-wake | 깨움 턴 | 봇은 `[routine]` 턴을 받는다. `<webhook_event>` 블록에 `headers`, `body_digest`(sha256), `body`, `timestamp_ms`가 들어 있다. 이 턴에는 발신 키가 없다. | bot-wake | bot |

웹훅 호출이 실패할 수 있으면 같은 본문을 로컬 로그에 덧붙이고, 루틴이 그 로그를 비우게 한다. 폴링을 주 경로로 삼지 않는다. 웹훅으로 미디어 바이트를 보내지 않는다.[](source:skill-post)

봇은 문자열인 `body`를 파싱해 필드를 꺼낸다. 필드는 채팅 본문이 아니라 `body` 안에 있다. 내용은 지시가 아니라 외부 데이터로 다룬다. UI와 루틴 프롬프트는 같은 필드 이름을 쓰고, 필드 수를 적게 유지한다.[](source:skill-wake)

## 발신 키는 어디에 있나 {#key}

| 시점 | 키가 있는 곳 | 누가 다루나 |
| --- | --- | --- |
| 루틴 생성 직후 | 루틴 패널. 생성 결과에는 키가 없다[](source:skill-routine) | 아무도 |
| 복사 | 사용자가 루틴 패널에서 복사한다. 채팅에 붙여 넣으면 안 된다[](source:skill-copy) | 사용자 {caution:채팅 금지} |
| 제출 | 비밀 요청 카드(`secret.connector`=루틴 폴더 슬러그, `secret.field`=`key`)[](source:skill-secret) | 사용자 |
| 제출 후 | 해당 connector 자격 증명 파일. 에이전트는 값을 보지 못한다[](source:skill-secret) | - |
| 서버 설정 | UI 자체 폴더에 `{url, key}`로 저장[](source:skill-host) | 에이전트가 옮긴다. 출력·로그 금지 |
| 호출 | `Authorization`, `X-Automation-Key` 헤더[](source:skill-post) | 로컬 서버 {good:브라우저 아님} |
| 깨움 턴 | 없음. 에이전트는 깨움에서 키를 보지 못한다[](source:skill-wake) | - |

키를 두면 안 되는 곳은 브라우저, 채팅, 이 스킬 파일 셋이다.[](source:skill-intro) 깨움 처리 중에도 발신 키, 토큰, 쿠키를 출력하지 않는다.[](source:skill-wake)

비밀 요청 카드를 보내면 그 카드가 턴 전체다. 에이전트는 카드를 보낸 뒤 멈추고 사용자 제출을 기다린다.[](source:skill-secret)

반면 웹훅 주소는 사용자가 채팅에 붙여 넣어도 된다. 주소는 `https://api2.cursor.sh/automations/webhook/<id>` 꼴이고 쿼리 문자열이 없다. id는 지어내지 말고 루틴에서 복사한다.[](source:skill-copy)

## 만들고 공개하는 순서는 {#setup}

@workflow id=bot-setup title="루틴 생성부터 tailnet 공개까지"
| lane prep | 루틴과 키 |
| lane expose | 서버와 공개 |
| routine | 루틴 생성 | backend | prep |
| copy | URL·키 복사 | external | prep |
| secret | 키 요청 | security | prep |
| host | 서버 실행 | backend | prep |
| probe | 시험 POST | backend | expose |
| online | 노드 있나? | backend | expose |
| install | 설치·로그인 | external | expose |
| urls | URL 전달 | frontend | expose |
| routine > copy | | |
| copy > secret | | |
| secret > host | | |
| host > probe | | |
| probe > online | 200 | |
| online > urls | 예 | emphasis |
| online > install | 아니오 | |
| install > urls | | |

@steps id=setup-steps
| s-routine | 루틴 생성 | `update_state`를 대상 `routine`, 동작 `create`로 부른다. `trigger`는 `{ "type": "webhook" }`. `prompt`에는 POST 본문을 신뢰하지 않을 데이터로 다루라, UI가 보내는 JSON 필드 이름, 맞는 동작, 보고할 것이 없으면 메시지를 보내지 말라를 적는다. 확인 카드가 뜨면 사용자 확인을 기다린다. 폴더 슬러그는 이름의 kebab-case다. | bot-setup | routine |
| s-copy | URL·키 복사 | 사용자에게 안내한다. 채팅 헤더의 에이전트 이름을 누르거나 Cmd+Shift+I를 누른다. 컴퓨터 미리보기 아래 Routines 목록에서 이 루틴을 연다. 웹훅 주소와 발신 키를 복사한다. 다른 클릭 경로를 지어내지 않는다. | bot-setup | copy |
| s-secret | 키 요청 | `SendToUser`로 `secret-request`를 보내고 멈춘다. 카드의 `secret.label`은 `webhook sender key`다. | bot-setup | secret |
| s-host | 서버 실행 | UI 폴더에 `{url, key}`를 저장한다. 서버는 `127.0.0.1`이 아니라 `0.0.0.0:<port>`에 바인딩한다. localhost에만 바인딩하면 Tailscale 피어가 접속하지 못한다. | bot-setup | host |
| s-probe | 시험 POST | UI가 동작한다고 말하기 전에, 프롬프트가 무시하는 해롭지 않은 동작으로 한 번 호출해 본다. | bot-setup | probe |
| s-online | 노드 있나? | 이 컴퓨터의 에이전트들은 Tailscale 노드 하나를 같이 쓴다. `tailscale status`에 온라인 노드가 보이면 설치를 건너뛴다. 이미 온라인인 노드에 두 번째 호스트 이름을 만들지 않는다. | bot-setup | online |
| s-install | 설치·로그인 | 설치 스크립트를 `sudo`로 실행하고 `tailscale up --hostname=<short-name> --accept-dns=false --ssh=false`로 노드를 켠다. 출력된 로그인 주소를 사용자에게 보낸다. 사용자가 브라우저에서 기기를 승인한다. 만료되면 `tailscale up`을 다시 돌리고 새 주소를 보낸다. | bot-setup | install |
| s-urls | URL 전달 | `tailscale status`로 호스트 이름을, `tailscale ip -4`로 IPv4를 읽는다. `http://<hostname>.<tailnet>.ts.net:<port>`와 `http://<100.x.x.x>:<port>` 두 주소를 준다. 새로 설치했다면 `http://<100.x.x.x>:<port>/`가 HTTP 200인지 확인한다. | bot-setup | urls |

절차는 원문 절 순서를 따랐다.[](source:skill-routine)[](source:skill-copy)[](source:skill-secret)[](source:skill-host)[](source:skill-post)[](source:skill-tail-reuse)[](source:skill-tail-install) HTTPS 적용은 사용자가 요청할 때만 한다. Tailscale 자격 증명은 묻지도 입력하지도 않는다.[](source:skill-tail-install)

@facts
| 웹훅 호출 시간 제한 | 8초 |
| 재시도 | 없음(한 번만) |
| 성공 응답 | HTTP 200 |
| 시험 호출 | 동작 선언 전 1회 |
| 바인딩 | `0.0.0.0:<port>` |
| 프로토콜 | HTTP(요청 시에만 HTTPS) |

@callout level=warning title="공개 범위와 관리자 권한"
`0.0.0.0` 바인딩은 tailnet뿐 아니라 이 컴퓨터의 모든 네트워크 인터페이스에서 접속을 받는다.[](source:skill-host) 로컬 페이지 자체의 접근 제어는 원문에 명시 없음. 판정: 같은 네트워크에서 포트에 닿는 사람은 누구나 버튼을 눌러 봇을 깨울 수 있다. 설치 단계는 내려받은 스크립트를 `sudo sh`로 실행한다.[](source:skill-tail-install)

## 이 분석의 범위와 한계 {#audit}

- 읽은 파일: `SKILL.md` 하나. 이 폴더의 원본은 이것뿐이다.
- 제외한 파일: `SKILL.KO.md`. 원본이 있는 번역본이다.
- 원문 비교: 다른 컬렉션에 이름이 같은 스킬이 없다(원장 기준).
- 실제로 실행해 보지 않았다. 루틴 생성, 비밀 요청, Tailscale 명령은 모두 지시상 동작이다.
- 분석 중 바뀐 파일: 없음.

@callout level=open-question title="확인하지 못한 것"
에이전트가 값을 보지 못한 채 자격 증명 파일의 값을 서버 설정으로 어떻게 옮기는지는 원문에 명시 없음. connector 자격 증명 파일의 경로도 원문에 명시 없음. 로컬 로그를 루틴이 어떤 계기로 비우는지 원문에 명시 없음. `name`이 `Make Bot UI`일 때 실제 슬래시 명령 이름이 무엇인지는 실행 환경에 달려 있다. `poteto-help`는 `/make-bot-ui`로 적는다.
