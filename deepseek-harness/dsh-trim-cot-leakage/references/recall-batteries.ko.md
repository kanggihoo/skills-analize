# Recall batteries

[분류 체계](../SKILL.md#taxonomy)를 탐지하는 probe들이며, 2026-08 purge 때 조정했다. 모든 hit에는 의미 판단이 필요하다. 배터리는 설계상 과다 매칭하고, 본질적으로 과소 매칭한다. purge의 각 리뷰 라운드에서 어떤 배터리도 잡지 못한 사례가 나왔다. 그러므로 패턴 없이 범위 안에서 가장 밀도 높은 산문을 직접 읽는 것과 함께 사용한다.

## 호출 규칙

- `.agents/`가 검색되도록 `--hidden --glob '!.git/**'`를 추가한다. ripgrep은 기본적으로 점(.)으로 시작하는 디렉터리를 건너뛰는데, purge에서 가장 큰 누락 위험은 Agent Notes였다.
- 제외 옵션은 마지막에 둔다. 그래야 뒤에 오는 include가 제외 대상을 다시 포함시키지 못한다: `--glob '!vendor/**' --glob '!node_modules/**' --glob '!.agents/notes/archived/**' --glob '!.agents/skills/dsh-trim-cot-leakage/**'` (스킬 자신의 파일은 누출된 표현을 보정용으로 인용한다). 범위 안의 기록된 fixture 및 snapshot 디렉터리도 같은 방식으로 제외한다. [소유 참조 문서](../SKILL.md)도 인용한 근거를 통해 스스로 hit된다. 이를 사용 사례가 아니라 근거로 판단한다.
- 자연어 패턴 줄에는 `-i`를 붙여 문장 첫머리의 대문자도 잡히게 한다("This PR adds…", "Probably fine…"). 코드 패턴에 맞추는 첫 줄은 대소문자를 구분한 채로 둔다. `-i`를 붙이면 `\bT\d\b`와 `\bP-I\b`가 잡음이 되기 때문이다.
- 완전한 구절은 경계를 지정한다. `\bthis PR\b`은 "this PR adds"에는 맞아야 하고, "this project", "this process", "this provider"에는 맞으면 안 된다.
- hit가 0인 패턴은 알려진 양성 사례에 맞기 전까지 아무것도 증명하지 않는다. 잡음이 많은 패턴은 근접한 음성 사례를 걸러 내기 전까지 아무것도 증명하지 않는다. 코퍼스 결과를 믿기 전에 둘 다 보정한다.
- 작성 언어 probe는 반대 언어 표면을 겨냥한다. 영문 Markdown과 코드 주석/JSDoc에 남은 중국어를 찾고, `*.zh.md` 안의 중국어 변경 서술을 찾는다. 중국어 산문에 남은 영어를 일반 ASCII 검색으로 찾는 것은 코드와 식별자 주변에서 잡음이 너무 많다. 대신 산문에 추가된 부분을 대응하는 쪽과 비교한다.

## 영문 배터리

```sh
rg -n --hidden '\(decision \d|\(audit [A-Z]\d|design §|plan §|design ledger|\(B ruling|\bP-I\b|\bW\d\b|\bT\d\b' ...
rg -n --hidden -i '\bthis PR\b|\bthis branch\b|\bthis stack\b|\blater PRs?\b|\bprevious commits?\b|\bthis commit\b' ...
rg -n --hidden -i '\bused to\b|\bno longer\b|\bpreviously\b|\bthe old\b|\bwas renamed\b|\bwas moved\b' ...
rg -n --hidden -i '\bv1\b|this cut|\bcut \d|\btoday\b|\bfor now\b|roadmap' ...
rg -n --hidden -i 'rejected in review|review round|reviewer|as of v\d' ...
rg -n --hidden -i 'probably |should be enough|should suffice|it simply|is safe —|is safe --' ...
rg -n --hidden '§\d' ...
```

## 중문 배터리

```sh
# Change or review narration in Chinese counterparts.
rg -n --hidden '评审|上一?轮|旧版|老的|不再|以前|本版|遗留' --glob '*.zh.md' ...

# Chinese authoring-language slips in English Markdown.
rg -n --hidden '设计稿|评审|上一?轮|旧版|老的|不再|以前|本版|遗留|私有|(^|[^a-zA-Z])端([^a-zA-Z]|$)' --glob '*.md' --glob '!*.zh.md' ...

# Chinese authoring-language slips in English code comments and JSDoc.
rg -n --hidden '(^[[:space:]]*(//|/\*|\*)|//|/\*)[^\r\n]*(设计稿|评审|上一?轮|旧版|老的|不再|以前|本版|遗留|私有|端)' --glob '*.{ts,tsx,js,jsx,mjs,cjs,css}' ...
rg -n --hidden '#[^\r\n]*(设计稿|评审|上一?轮|旧版|老的|不再|以前|本版|遗留|私有|端)' --glob '*.py' ...
```

## 알려진 오탐 유형

purge 중에 판단해 남긴 항목이다. 다시 나타날 것을 예상한다:

- **도구적 "used to"** — "the key used to sign requests"는 시간적이 아니라 도구적 의미다. 시간적 용법은 앞에 주어의 상태가 온다("colors used to come from…").
- **런타임 old/new** — "the old connection drains before the new one accepts"는 인계 중의 살아 있는 객체를 가리키지, 저장소 상태를 가리키지 않는다.
- **프로세스 문서의 "This PR"** — PR 워크플로 *자체*를 설명하는 문서("the PR body should…", 템플릿, 이 저장소의 프로세스 메모)는 "PR"이라고 쓰는 것이 정당하다. 금지되는 것은 한 PR의 관점에서 코드를 설명하는 문서다.
- **프로토콜이나 경로 세그먼트로서의 `v1`** — `/v1/chat` 엔드포인트와 wire 형식 이름은 식별자이지 버전 표기가 아니다.
- **소유자가 있는 `§N`** — 외부 표준(RFC 9110 §10.1.5)과 자체 §-번호를 소유한 커밋된 문서는 섹션 번호로 인용할 수 있다.
- **대조의 "actually"와 명사 "wait"** — 일반적인 영어이며 얼버무림이 아니다. 커밋된 줄 중에 이를 probe하는 것은 없으므로, 더 넓은 얼버무림 패턴으로 배터리를 확장할 때에만 드러난다.
- **런타임 "today"와 기록된 타임스탬프** — 현재 날짜를 묻는 프롬프트나 테스트는 저장소 버전 표기가 아니라 자연스러운 시간을 쓴다. 기록된 CLI 출력은 원래 목소리를 유지한다. 모델이나 사용자에게 전달되는 문구는 수정 전에 여전히 동작 근거 규칙을 따른다.
- **중문 산문의 本版本** — 버전이 붙은 산출물 맥락에서 "this release"를 옮긴 정당한 표현이다. 금지되는 지시어는 "this cut"을 그대로 옮긴 단독 표기로서의 本版이다.
- **검토한 대안 섹션** — Agent Note의 장르 자리에 있는 "rejected"는 허용된 위치이며, 리뷰 연출이 아니다.
