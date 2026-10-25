---
name: newroaster
description: Roast Room에 새로운 자문위원을 추가하고 싶을 때 사용합니다. "/newroaster", "add a roaster", "add a seat", "add [name] to the council", "build a seat for [name]", "I want [name] on my board"라고 말하거나, 본인(자기 자신), 멘토, 또는 공인을 공개된 작업물로 만든 자문위원을 원할 때 사용합니다. 처음 일곱 명을 만든 방식과 같은 방식으로 자리를 만듭니다. 공개 출처를 찾아 가져오고, 병렬 하위 에이전트로 프레임워크, 규칙, 입장, 이야기, 말투를 추출하고, 두뇌(brain)를 작성하며, 모든 인용이 원문과 일치하는지 확인하고, 위원회 에이전트를 작성하며, 실제 사진을 바탕으로 방을 위한 만화 초상화를 만들고(처음 일곱 명과 같은 스타일과 말하기 프레임), 로스터에 자리를 등록합니다(요청 시 기본 보드에도 등록). 초상화를 다시 만들 때도 사용합니다("/newroaster portrait <name>"). 위원회를 여는 용도는 아닙니다(그것은 /roast-room).
argument-hint: "[full name] [--quick | --deep] [--pillar \"...\"] [--default] | portrait <name>"
---

## 이 스킬이 하는 일

Roast Room에 자리 하나를 추가합니다. 자리는 네 가지로 구성되며, 이 스킬이 네 가지를 모두 만듭니다.

1. **두뇌(brain)**: `.claude/skills/roast-room/brains/<slug>/` 아래의 파일 여덟 개. 인물의 공개 작업물에서 컴파일하며, 모든 인용은 출처 id와 함께 원문 그대로 둡니다.
2. **에이전트**: `.claude/agents/council-<key>.md`. 두뇌를 바탕으로 그 사람처럼 추론하고 말하는 하위 에이전트입니다.
3. **초상화**: 방에 들어갈 만화 프레임 네 장(`<key>-base`, `-open`, `-mid`, `-blink`). 실제 사진으로 만들며 원래 일곱 명과 정확히 같은 스타일입니다.
4. **로스터 항목**: `.claude/skills/roast-room/roster.json`에 한 줄. `/roast-room`과 방이 이 자리를 알 수 있게 합니다.

원본 출처는 git이 무시하는 로컬 빌드 폴더에 남습니다. 배포되는 것은 두뇌뿐입니다.

빌드 폴더: 프로젝트 루트의 `build/<slug>/`.

처음 실행하기 전에 읽을 파일: `references/brain-spec.md`(두뇌의 구조와 규칙), `references/extract-prompt.md`(각 추출 에이전트가 받는 내용), `references/writer-prompt.md`(각 두뇌 작성자가 받는 내용), `references/agent-template.md`(자리 에이전트).

## 누가 자문위원이 될 수 있나

- **실질적인 공개 작업물이 있는 공인**: 에세이, 서신, 책(강연에서 가르치는 방식 그대로), 주인공이 본인인 긴 인터뷰, 기조연설, 본인 채널이나 팟캐스트. 살아 있는 사람이든 역사적 인물이든 상관없습니다.
- **사용자 본인, 또는 동의한 사람**: 사용자가 제공한 자료(게시물, 녹취록, 메모)로 만듭니다. 3단계에서 `--add`를 사용합니다.
- **불가**: 허구의 인물, 동의하지 않은 사적인 개인, 공개 작업물이 너무 적은 사람. 사용 가능한 출처가 약 15개 미만이거나 6만 단어 미만이면 그렇게 알리고, `--quick`을 경고와 함께 제안하거나 다른 사람을 제안합니다.

이 자리는 시뮬레이션이지 본인이 아닙니다. 에이전트는 질문을 받으면 그 점을 밝히고, 두뇌에 있는 내용만 인용합니다.

## 깊이

| 플래그 | 출처 | 단어 수 | 추출 에이전트 | 용도 |
|---|---|---|---|---|
| `--quick` | 12~20개 | 8만 이상 | 2~3개 | 시험 삼아 만들어 볼 때 |
| 기본값 | 30~50개 | 25만 이상 | 4~6개 | 실제로 계속 쓸 자리 |
| `--deep` | 80개 이상 | 50만 이상 | 8~12개, 웨이브 단위 | 처음 일곱 명과 수준을 맞출 때 |

양보다 품질이 중요합니다. 90분짜리 기조연설 하나가 6분짜리 클립 열 개보다 가치가 큽니다.

## 1단계: 누구이며 어떤 자리인가

사용자의 메시지에서 인물의 전체 이름을 얻습니다. 아래 항목 중 빠진 것이 있으면 AskUserQuestion 한 묶음으로 질문합니다(최대 4개 질문). 첫 번째 선택지에는 가장 적절한 추정을 둡니다.

1. **필러와 이 자리가 맡을 질문.** 인물이 알려진 분야에서 하나를 제안합니다. `roster.json`의 기존 자리와 같은 형식으로 씁니다(필러: 몇 단어, 질문: 창업자가 마주칠 법한 쉬운 질문 하나). 기존 자리가 이미 그 필러를 맡고 있다면, 두 자리가 같은 말을 반복하지 않고 서로 논쟁하도록 더 날카로운 각도를 제안합니다.
2. **기본 보드?** 모든 위원회의 테이블에 항상 앉힐지, 호출할 때만 대기시킬지(`--seats`와 `ask`). 기본 보드에 이미 아홉 자리가 있다면 누구를 대신하는지 묻습니다.
3. **깊이**: quick, standard, deep 중 하나(기본값은 standard).

그다음 이름을 정합니다. `key`(짧은 소문자, 알파벳만, 로스터에서 유일해야 함, 보통 성: `naval`, `drucker`; 다른 자리가 같은 성을 가지고 있으면 이름: `leila`), `slug`(`first-last`), `short`(방에서 부르는 이름: "Naval", "Leila"), 그리고 점수표의 `dimension`(이 자리가 평가하는 것을 몇 단어로, 예: "Leverage and long-term wealth").

먼저 로스터를 확인합니다. 이미 자리가 있는 인물이면 중단하고, 대신 같은 slug로 새로고침(3단계부터)을 제안합니다. 수집 단계는 `sources.json`에 이미 있는 출처를 건너뜁니다.

## 2단계: 출처 찾기

WebSearch로 출처 목록을 만들고 좋은 순서로 정렬합니다. 다음을 찾습니다.

- 본인의 사이트, 블로그, 에세이, 뉴스레터 아카이브, 서신(가장 풍부한 텍스트이며 날짜가 있음).
- 본인이 연사인 긴 강연과 기조연설.
- 본인이 주요 게스트인 긴 인터뷰와 팟캐스트(본인의 팟캐스트도 포함).
- 공개 강연에서 가르치는 방식의 책: 저자 강연, 책에 관한 인터뷰, 무료로 공개한 장. 해적판이나 유료 장벽 뒤의 책 본문은 절대 가져오지 않습니다.
- 최근 2년간의 자료(`positions.md`가 현재 견해를 반영하도록)와 여러 해에 걸친 자료(생각이 바뀐 흔적이 드러나도록).

약 10분 미만의 클립, 팬 편집본, 반응 영상, 다른 사람이 대부분 말하는 자료는 건너뜁니다. URL을 `<build>/urls.txt`에 한 줄씩 쓰고, 그룹마다 `# 제목` 줄을 둡니다. 일부는 실패하므로 선택한 깊이의 출처 수에 약 20%를 더해 목표로 합니다.

## 3단계: 가져오기

```bash
node .claude/skills/newroaster/scripts/fetch.mjs <build> --list <build>/urls.txt
```

각 출처는 `<build>/corpus/S001-<title>.md`가 되며 `<build>/sources.json`에 기록됩니다. URL마다 `ok`, `skip`, `thin`(유료 장벽 또는 자바스크립트 페이지), `fail` 중 하나를 출력한 뒤 매니페스트를 보여 줍니다. YouTube는 yt-dlp가 설치되어 있으면 그것을 쓰고, 없으면 YouTube 자체 자막을 씁니다. 사용자가 제공한 로컬 자료는 다음과 같이 추가합니다.

```bash
node .claude/skills/newroaster/scripts/fetch.mjs <build> --add path/to/file.md --title "..." --date 2024-05-01
```

출처가 `thin`으로 돌아왔거나 실패했다면 다른 사본(전사 페이지, archive.org 사본)을 찾거나 교체합니다. `pdftotext`가 없으면 PDF는 `pending-*.pdf`로 저장됩니다. Read 도구로 읽고, 텍스트를 `.md`로 저장한 뒤 `--add`합니다. 매니페스트가 깊이 목표를 충족할 때까지 다시 실행합니다. 그다음 출처 파일 두세 개를 열어 올바른 사람의 깨끗한 텍스트인지 확인합니다. 최종 보고를 위해 매니페스트의 줄 수를 메모해 둡니다.

## 4단계: 추출(map)

출처를 각각 약 5만 단어 분량의 배치로 나눕니다(90분 강연은 약 1만 3천 단어, 긴 에세이는 5천 단어). 배치마다 추출 에이전트 하나를 **한 메시지에서** 병렬로, 포그라운드로 띄웁니다: `subagent_type: general-purpose`, `model: sonnet`, 프롬프트는 `references/extract-prompt.md`에서 가져오고 이름, 자리의 필러와 질문, 배치의 출처 id와 파일 경로, 그리고 쓸 노트 파일을 채웁니다. 한 번에 최대 여섯 개까지 실행하며, `--deep`이면 웨이브로 나눠 실행합니다.

각 에이전트는 `<build>/notes/batch-NN.md`를 씁니다. 모든 에이전트가 보고할 때까지 기다립니다. 모두 돌아오면 노트의 모든 인용을 확인합니다.

```bash
node .claude/skills/newroaster/scripts/check_quotes.mjs <build> <build>/notes
```

보고된 항목을 고칩니다. 잘못된 출처 id는 바로잡고, 찾을 수 없는 인용은 삭제합니다. 검증 가능한 인용이 없는 노트는 패러프레이즈로 남겨 둘 수 있으며, "inferred from S0xx"로 표시합니다.

## 5단계: 두뇌 작성(reduce)

`.claude/skills/roast-room/brains/<slug>/`를 만듭니다. 스크립트로 `sources.md`를 씁니다.

```bash
node .claude/skills/newroaster/scripts/fetch.mjs <build> --sources-md .claude/skills/roast-room/brains/<slug>/sources.md --name "Full Name"
```

그다음 작성 에이전트 세 개를 한 메시지에서 병렬로 띄웁니다(`general-purpose`, 기본 모델). 프롬프트는 `references/writer-prompt.md`에서 가져옵니다. 각자 모든 노트 파일과 `references/brain-spec.md`를 읽고, 스펙의 분량 기준과 규칙을 따라 두뇌 폴더에 파일을 씁니다.

- 작성자 A: `frameworks.md`, `principles.md`, `books.md`.
- 작성자 B: `positions.md`와 `stories.md`.
- 작성자 C: `voice.md`.

각 작성자에게 자리의 필러와 질문, 빌드 폴더(인용의 맥락을 확인하려고 출처 파일을 열 수 있도록), 그리고 모든 인용은 노트에서 출처 id와 함께 정확히 복사해야 한다는 점을 알려 줍니다. 작성자는 자기 파일만 씁니다.

돌아오면 완성된 여섯 파일로부터 `_hot.md`를 직접 씁니다(스펙에 무엇이 들어가는지 나와 있으며, "이 렌즈가 어긋나는 곳"도 포함). 그다음 두뇌 전체를 확인합니다.

```bash
node .claude/skills/newroaster/scripts/check_quotes.mjs <build> .claude/skills/roast-room/brains/<slug>
```

통과할 때까지 고칩니다. 모든 인용이 원문과 일치하고, 모든 id가 맞아야 합니다. 에이전트가 읽는 것처럼 `_hot.md`를 한 번 더 읽습니다. 이 인물이 어떻게 결정하는지를, 그의 말로, 800단어 미만으로 말해 주어야 합니다.

## 6단계: 에이전트 작성

`references/agent-template.md`를 바탕으로 `.claude/agents/council-<key>.md`를 씁니다. 모든 대괄호를 두뇌에서 채웁니다. 렌즈(이 인물이 어떤 결정이든 던지는 다섯~여섯 개의 질문), 말하는 방식(`voice.md`에서), 토론 방식(자연스러운 반대편 자리를 `roster.json`에서 지목하고, "이 렌즈가 어긋나는 곳"에서 무엇을 양보하는지), 그리고 하지 말아야 할 목록. 설명(description)에는 필러, 출처 수, 두뇌의 구성, 그리고 트리거 문구("what would [name] say")를 씁니다.

## 7단계: 자리 등록

```bash
node .claude/skills/newroaster/scripts/add_seat.mjs --key <key> --name "<Full Name>" --short "<Short>" --slug <slug> --pillar "<pillar>" --question "<question>" --dimension "<dimension>" [--default] [--swap <key>]
```

에이전트 파일이나 두뇌 파일이 없으면 거부합니다. `--default`는 기본 보드에 자리를 추가하고, `--swap <key>`는 같은 동작으로 다른 자리를 기본 보드에서 뺍니다. 그다음:

- `.claude/skills/roast-room/references/seats.md`에 새 자리의 "자연스러운 긴장" 줄을 한두 개 추가합니다(누구와 부딪히고, 무엇을 두고 부딪히는지).

## 8단계: 초상화

모든 자리는 실제 초상화를 가집니다. 새 자리를 기본 플레이스홀더 흉상으로 두지 마세요. 글로 된 묘사만으로 실제 사람을 그리지 마세요. 닮음은 사진에서 와야 합니다. 이는 처음 일곱 명이 거친 것과 같은 파이프라인이며, 같은 프롬프트와 같은 스타일 기준(`assets/style-reference.jpg`, Buffett 만화)을 씁니다. 초상화 폴더: `<build>/portrait/`(git이 무시함). 프레임 폴더: `app/public/portraits/`.

1. **사진 찾기.** 최근의, 선명한, 정면 사진 한 장으로, 본인만 나온 것이어야 합니다. 공식 출처에서 가져옵니다. 본인 YouTube 채널 아바타(`yt-dlp -J --flat-playlist --playlist-items 0 https://www.youtube.com/@handle`이 `avatar_uncropped`를 보여 줌, `=s0`을 `=s900`으로 바꿈), 본인 사이트, 또는 위키백과나 위키미디어 커먼즈 사진. 로고, 단체 사진, 옆모습은 건너뜁니다. 사용자 본인이나 자신의 자료로 만든 멘토라면 사용자가 제공한 사진을 씁니다.
2. **저장하고 확인하기:** `node .claude/skills/newroaster/scripts/portrait.mjs photo <build>/portrait <url>`. `photo.jpg`를 Read로 열어 맞는 사람인지, 얼굴이 선명한지 확인합니다.
3. **만화 후보 두 개:** `node .claude/skills/newroaster/scripts/portrait.mjs base <build>/portrait "<Full Name>. <hair, facial hair, eye color, skin, build, and the outfit they are known for>"`. 사진에 보이는 것을 묘사하고, 시그니처 의상이나 액세서리(모자, 안경, 목걸이)를 적습니다. 묘사는 세부를 이끌고, 닮음은 사진이 담당합니다.
4. **닮음으로 고르기:** `python .claude/skills/newroaster/scripts/build_portraits.py sheet <build>/portrait`를 실행한 뒤 `candidates.jpg`를 엽니다(사진이 먼저, 그다음 각 후보). 사진과 가장 가까운 것(얼굴형, 눈, 머리, 시그니처 디테일)을 고릅니다. 둘 다 가깝지 않으면 더 날카로운 묘사로 `base`를 다시 실행하고(눈 색과 헤어라인이 흔히 빗나가는 부분), `--n 2`를 주고 고릅니다: `portrait.mjs pick <build>/portrait <n>`.
5. **말하기 프레임:** `node .claude/skills/newroaster/scripts/portrait.mjs frames <build>/portrait`(입을 벌림, 입 모양 "oh", 눈 감음. 각각 고른 base를 편집한 결과).
6. **빌드:** `python .claude/skills/newroaster/scripts/build_portraits.py build <build>/portrait <key> --out app/public/portraits`. 각 편집본을 base에 정렬하고, 입이나 눈만 패치하고, 초록을 키잉하며, 모든 머리를 처음 일곱 명과 같은 크기로 자릅니다. `<build>/portrait/review.jpg`를 엽니다. 프레임 네 장, 같은 얼굴, 초록 테두리 없음, 바뀐 것은 입과 눈뿐이어야 합니다. 머리가 다른 자리에 비해 너무 작거나 크면 `--zoom 0.9` 또는 `--zoom 1.1`로 다시 빌드합니다.

`KIE_AI_API_KEY`(kie.ai, 자리당 이미지 작업 약 5개)가 `.env`에 필요하며, Node와 `opencv-python` 및 `numpy`가 있는 Python이 필요합니다(빌드 단계에서 없다고 하면 `pip install opencv-python numpy`). kie.ai 키가 없으면 자리는 그대로 완성합니다(방에는 그려진 플레이스홀더가 보임). 사용자에게 키 추가 방법을 한 줄로 알려 줍니다(https://kie.ai/api-key, 그다음 `.env`에 `KIE_AI_API_KEY=`), 그리고 나중에 `/newroaster portrait <name>`으로 초상화를 만들 수 있다고 알립니다.

**초상화만**(`/newroaster portrait <name>`, 또는 플레이스홀더를 보여 주는 자리): `roster.json`에 이미 있는 자리에 대해 이 단계만 실행합니다. 그 자리의 `key`와 `slug`를 사용하고, 사용자에게 방을 새로고침하라고 알립니다.

## 9단계: 자리 테스트

새 에이전트 파일은 Claude Code가 시작될 때 로드되므로, 위원회 자체가 쓰는 대체 방식으로 테스트합니다. `general-purpose`를 띄우고 `Read .claude/agents/council-<key>.md and follow it as your instructions for this whole task. Only read files; do not write anything.`를 주고, 이어서 `.claude/skills/roast-room/references/round-prompts.md`의 단일 자리 상담 프롬프트를 자리의 필러에 맞는 짧은 샘플 결정으로 줍니다. 그다음 답변을 확인합니다.

- 인물처럼 들리고(`voice.md`와 비교), 1인칭으로 말하며, 자신이 그 사람이라고 절대 주장하지 않는가.
- 프레임워크를 출처 id와 함께 언급하며, 모든 인용이 `check_quotes.mjs`를 통과하는가(답변을 `<build>/test-consult.md`에 저장하고 검사기를 실행).
- 일반적인 조언이 아니라 자기 필러를 책임지는가.

실패하면 에이전트나 `_hot.md`를 고치고 한 번 더 테스트합니다.

## 10단계: 보고

150단어 미만으로 사용자에게 알립니다.

- 추가된 사람, 그 사람의 필러와 질문, 기본 보드에 올라갔는지 여부.
- 두뇌: 출처 수, 단어 수, 다루는 연도, 작성된 파일.
- 지금 사용하는 방법: 한 답변만 받으려면 `/roast-room ask <key> ...`, 테이블에 앉히려면 `/roast-room --seats <key>,buffett,... ...`, 기본 보드를 바꾸려면 `/roast-room board`.
- 한 줄: Claude Code를 재시작하거나 새 세션을 열어야 자리가 자체 에이전트 유형으로 로드됩니다. 그전까지 위원회는 자동으로 대체 방식을 씁니다.
- 한 줄: 초상화가 방에 있다(페이지를 새로고침), 또는 kie.ai 키가 없었다면 `/newroaster portrait <name>`을 실행하기 전까지 플레이스홀더로 보인다.

## 하위 에이전트가 없는 경우(Codex 또는 에이전트를 띄울 수 없는 런타임)

4단계와 5단계를 직접 실행합니다. 배치 하나씩, 추출을 노트 파일로 한 뒤 다음 배치로 넘어갑니다. 두뇌 파일은 노트에서 하나씩 씁니다. 나머지는 모두 같습니다.

## 규칙

- 공개되고 합법적인 출처만 사용합니다. 출처 자료는 빌드 폴더에만 두며 커밋하거나 공유하지 않습니다. 두뇌에는 짧은 인용(45단어 미만)과 패러프레이즈만 담고, 책 본문은 절대 담지 않습니다.
- 두뇌의 모든 인용은 원문과 일치하고 `check_quotes.mjs`를 통과해야 합니다. 출처가 없는 줄은 추론이며, 그렇다고 표시합니다.
- 다른 자리의 두뇌와 에이전트는 건드리지 않습니다. `roster.json`의 `"seats"`와 `"default"`만 `add_seat.mjs`를 통해 바뀝니다.
- 직접 쓰는 모든 글은 평이한 영어로, 짧은 문장으로, 줄표 없이, 군더더기 없이 씁니다.
- 초상화는 모든 자리의 일부이며, 원래 일곱 명의 프롬프트와 스타일 기준을 쓰는 실제 사진에서 만듭니다. 글로 된 묘사만으로는 닮음을 정하지 않습니다.
- 비용: 표준 자리는 하위 에이전트 실행 약 8~10회와 kie.ai 이미지 작업 약 5개입니다. 사용한 깊이를 밝힙니다.
