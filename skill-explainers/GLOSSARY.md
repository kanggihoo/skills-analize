# 공유 용어집

스킬 분석 페이지에서 용어를 쓸 때 이 표를 따른다.

- 개발자가 평소 영어로 치는 용어(git·GitHub·CI·코드 도구: commit, branch, push, rebase, diff, PR, worktree, stack 등)는 영어 그대로 쓰고 조사를 바로 붙인다(`commit을`, `branch에서`). 한글로 소리 나는 대로 적거나(워크트리) 억지로 옮기지(PR 묶음) 않는다.
- 뜻이 낯설 수 있으면 처음 나올 때만 `영어(한국어 풀이)`로 쓴다. 예: flaky test(실행마다 결과가 달라지는 테스트).
- 이미 한국어로 굳은 말(스킬, 서브에이전트, 리뷰어, 근거)은 아래 "권장 표기"를 그대로 쓴다.
- 명령, 필드, 파일 경로, 스킬 이름은 백틱으로 감싸 원문 그대로 둔다.

| English | 권장 표기 | 쓰지 말 표현 | 비고 |
|---|---|---|---|
| skill | 스킬 | 기술 | |
| playbook | 플레이북 | 각본, 교본 | `poteto-mode` 안의 단계 목록. 스킬이 아니다 |
| principle | 원칙 | 원리 | `principle-*` 스킬 |
| mode skill | 모드 스킬 | | 매 턴 켜져 있는 스킬. Cursor의 Custom Mode |
| subagent | 서브에이전트 | 하위 에이전트 | |
| spawn (a subagent) | (서브에이전트를) 띄운다 | 스폰한다, 생성한다 | |
| fan out | 여러 갈래로 나눠 돌린다, 병렬로 나눈다 | 팬아웃한다 | |
| runner | runner | 러너, 실행자 | arena·architect의 후보 작성 서브에이전트. 아래 `runner (CI)`와 뜻이 다르다 |
| candidate | 후보 | 지원자 | |
| base | base | 기반 후보, 베이스 | arena에서 고른 후보. 아래 `base (branch)`와 뜻이 다르다 |
| graft | graft | 접붙이기, 이식 | 진 후보의 좋은 부분을 base에 합치기. 처음만 `graft(진 후보의 장점을 base에 합치기)` |
| reviewer | 리뷰어 | 검토자 | |
| synthesizer | 종합 담당 | 합성기 | |
| explorer / explainer | 탐색 담당 / 설명 담당 | | `how`의 역할 이름 |
| investigator | 조사 담당 | 수사관 | `why`의 역할 이름 |
| coverage map | 조사 범위표 | 커버리지 맵 | |
| code anchor | 코드 기준점 | 코드 앵커 | `why` 2단계 |
| evidence | 근거 | 증거(법정 뉘앙스일 때만) | |
| gate (테스트·검사) | 통과 조건 | 게이트 | 테스트나 CI가 막는 지점 |
| gate (사람 승인) | 사람 승인 지점 | 게이트 | 사람이 확인해야 넘어가는 지점 |
| checkpoint | 중간 확인 | 체크포인트 | `architect with checkpoint` |
| sign-off | 승인 | 사인오프 | |
| predicate | 완료 조건 | 술어 | "통과/실패가 갈리는 검사" |
| decision trail / decision log | 결정 기록 | 결정 흔적 | `show-me-your-work` |
| feature map | 기능 지도 | 피처 맵 | 검증 스킬의 `features/` |
| verification skill | 검증 스킬 | 확인 스킬 | 앱을 직접 돌리는 프로젝트 스킬 |
| lever | 지렛대(도구) | 레버 | 일을 하거나 증명하는 스크립트·코드모드 |
| slop / AI tells | AI 티 나는 표현 | 슬롭 | |
| blast radius | 영향 범위 | 폭발 반경 | |
| babysit (a PR) | PR 돌보기 | 베이비시팅 | 병합 가능 상태까지 끌고 가기 |
| land / ship | land(병합해 내보낸다) | 랜딩한다 | 처음만 풀이 |
| stack (of PRs) | stack | 스택, PR 묶음 | 처음만 `stack(앞 PR 위에 쌓은 PR 줄)` |
| worktree | worktree | 워크트리, 작업 트리 | git worktree |
| hillclimb | 수치 끌어올리기 | 힐클라임 | 한 지표를 반복 실험으로 개선 |
| non-trivial | 사소하지 않은 | 비자명한 | |
| one-way door | 되돌리기 어려운 결정 | 일방통행 문 | |
| operator | 운영자(작업을 맡긴 사람) | 오퍼레이터 | |
| autonomy grant | 자율 권한 | | "알아서 끝까지 해" 같은 허락 |
| triage | 분류 | 트리아지 | |
| transcript | 대화 기록 | 트랜스크립트, 채팅 기록 | `agent-transcripts/` |
| mining (transcripts) | 기록 분석 | 마이닝 | automate-me |
| shared record | 공유 기록 | | recall. 티켓·PR·채팅·오류 추적 등 |
| capsule (state) | capsule | 상태 요약, 캡슐 | recall 출력 틀. 처음만 `capsule(상태 요약)` |
| thread (work) | thread | 작업 줄, 스레드 | recall. 처음만 `thread(이어지는 작업 하나)` |
| confidence tier | 확신도 단계 | 신뢰 등급 | why `epistemics.md` |
| Direct / Supported / Inferred / Speculative / Unknown | 직접 / 뒷받침 / 추론 / 추측 / 모름 | | why 확신도 5단계 |
| evidence category | 근거 갈래 | 증거 카테고리 | why 일곱 갈래 |
| hedge / hedging | 얼버무림 | 헤지, 헤징 | unslop, why |
| filler | 군더더기 | 필러 | unslop |
| sycophancy | 맞장구 | 아첨 | |
| em dash | 엠 대시 | | unslop |
| reasoning effort | 추론 강도 | 노력, 이펙트 | setup-pstack. 모델 이름의 끝 토큰 |
| budget (reasoning) | 예산 | 버짓 | setup-pstack |
| model slug | 모델 이름 | 슬러그 | 처음만 `모델 이름(slug)` |
| alias | 별칭 | 앨리어스 | `inherit-parent`, `auto` |
| judge / cross-judge | 판정 담당 / 교차 심사 담당 | 심판, 크로스 저지 | figure-it-out, arena |
| verdict | 판정 결과 | 평결 | `PASS`·`FAIL` 같은 값. 분석자 `판정` 표시와 구분 |
| rubric | 채점 기준 | 루브릭 | arena, interrogate |
| finding | 지적 | 발견 사항 | 리뷰어 출력 단위 |
| lead reviewer | 선임 리뷰어 | 리드 | interrogate |
| sketch | 스케치 | 초안 | architect의 타입·시그니처 설계 |
| red flag | 위험 신호 | 레드 플래그, 적신호 | architect `design-red-flags.md` |
| interface depth / deep module | 인터페이스 깊이 / 깊은 모듈 | | |
| race / slice | race / slice | 경주 / 조각, 레이스, 슬라이스 | swarm. 처음만 `race(같은 일을 여럿이 경쟁)`, `slice(일을 나눈 한 조각)` |
| gauntlet | gauntlet | 연속 관문 시험, 건틀릿 | swarm. 처음만 `gauntlet(연달아 통과해야 하는 시험)` |
| dropout | dropout | 이탈, 드롭아웃 | 결과를 못 낸 후보·작업자 |
| keep / kill | 남기기 / 삭제 | 킵, 킬 | no-comments |
| harness | 하네스 | 마구 | 앱을 조작하는 스크립트 묶음 |
| drive (the app) | 조작한다 | 드라이브한다 | |
| doc drift | doc drift | 문서 어긋남, 드리프트 | 처음만 `doc drift(문서가 실제 동작과 어긋남)` |
| limiter | 병목 | 리미터, 한계 요인 | benchmark-checklist, explain-the-number |
| spread | 편차 | 스프레드 | |
| mistake class | 실수 유형 | 실수 클래스 | correct |
| webhook sender key | 웹훅 발신 키 | 센더 키 | make-bot-ui |
| merge frontier | merge frontier(가장 아래의 아직 병합 안 된 PR) | 병합 전선, 병합 경계 | Babysit·Shipping·Orchestrate |
| ledger (verification) | 검증 장부 | 원장 | 이 저장소의 "관계 원장"과 구분 |
| standing orders | 상시 지시 | 상비 명령 | Orchestrate `preferences.md` |
| brief | 지시문 | 브리프 | 서브에이전트에게 주는 작업 설명 |
| throughput checkpoint | 처리량 점검 | 스루풋 체크포인트 | Feature 3단계 |
| premise / census | 전제 / 행위자별 집계 | 센서스 | attack-the-premise |
| idempotent | 멱등 | | |
| scaffold | 골격 | 스캐폴드, 비계 | foundational-thinking |
| guard (code) | 방어 코드 | 가드 | gate(통과 조건)와 구분 |
| workaround | 우회책 | 꼼수 | fix-root-causes |
| reader load | 독자 부담 | 리더 로드 | |
| wave (migration) | wave | 차례, 웨이브 | migrate-callers. 처음만 `wave(한 번에 옮기는 호출자 묶음)` |
| compatibility layer / shim | 호환 계층 | 심 | |
| proxy (verification) | 대리 근거 | 프록시 | prove-it-works |
| discriminated union / sum type | 판별 유니언 / 합 타입 | 차별 유니온, 섬 타입 | |
| branded type | 브랜드 타입 | 낙인 | |
| narrowing | 좁히기 | 내로잉 | TS |
| exhaustiveness check | 빠짐없는 분기 검사 | 완전성 검사 | |
| prompt injection | 프롬프트 주입 | | |
| close call | 헷갈리는 짝 | 근접 판정 | poteto-help "Close calls" |
| rationale (document) | 설계 근거 문서 | 근거 템플릿 | architect `rationale-template.md` |
| hunter / verifier | hunter / verifier | 사냥 담당 / 검증 담당, 헌터, 베리파이어 | security-audit의 역할 이름 |
| coverage critic | coverage critic | 범위 비평 담당, 크리틱 | security-audit |
| coverage ledger | coverage ledger | 범위 장부, 커버리지 원장 | 관계 원장과 구분 |
| fingerprint (finding) | fingerprint | 지문, 핑거프린트 | 근본 원인 식별자 |
| blocker | 막힌 이유 | 블로커 | `needs_validation` |
| promotion (artifact) | 승격 | 프로모션 | 작업 폴더에서 결과 폴더로 |
| trust boundary / principal | 신뢰 경계 / 주체 | 프린시펄 | |
| sink / entrypoint | 싱크 / 진입점 | | |
| hardening | 보강 권고 | 하드닝 | 확정 취약점이 아닌 메모 |
| context pointer | 컨텍스트 포인터 | 맥락 지시자 | writing-for-agents, chief-of-staff |
| context load / cognitive load | 컨텍스트 부담 / 인지 부담 | 컨텍스트 로드 | writing-for-agents. 독자 부담(reader load)과 구분 |
| context pressure | 컨텍스트 압박 | | retro |
| progressive disclosure | 점진적 공개 | | writing-for-agents |
| leading word | leading word | 이끄는 단어, 리딩 워드 | writing-for-agents |
| no-op (instruction) | no-op 지시 | 효과 없는 지시, 노옵 | retro, writing-for-agents |
| model-invoked / user-invoked | 모델 호출형 / 사용자 호출형 | | `disable-model-invocation` 여부 |
| router skill | 길잡이 스킬 | 라우터 스킬 | |
| retrospective | 회고 | 레트로 | |
| guardrail | 안전장치 | 가드레일 | 방어 코드(guard)와 구분 |
| pit of success | 저절로 성공하는 환경 | 성공의 구덩이 | chief-of-staff |
| compaction | compaction | 컴팩션, 압축 | 처음만 `compaction(컨텍스트 압축)` |
| loop / workflow | 루프 / 워크플로 | 고리 | loop-me. 워크플로는 루프 하나의 명세 |
| checkpoint (human-in-the-loop) | 사람 확인 지점 | 체크포인트 | loop-me. architect의 "중간 확인"과 구분 |
| push right | push right | 뒤로 미루기, 오른쪽으로 밀기 | loop-me. 처음만 `push right(사람 확인을 뒤로 미루기)` |
| brief (checkpoint summary) | 요약 보고 | 브리프 | loop-me. 서브에이전트 "지시문"과 구분 |
| handoff document | 인계 문서 | 핸드오프 문서 | handoff |
| questionnaire | 질문지 | 설문지 | to-questionnaire |
| zone of proximal development | 근접 발달 영역 | ZPD | teach |
| fluency / storage strength | 유창함 / 저장 강도 | | teach |
| desirable difficulty | 바람직한 어려움 | | teach |
| retrieval practice / spacing / interleaving | 인출 연습 / 간격 두기 / 섞어 연습하기 | | teach |
| type assertion | 타입 단언 | 타입 어서션 | migrate-to-shoehorn |
| Agent Note | `Agent Note`(원어 유지) | 에이전트 노트, 에이전트 메모 | deepseek-harness `.agents/notes/`의 문서 종류. 백틱으로 감싸 조사를 띄운다 |
| supersession check | 대체 확인 | 슈퍼세션 | dsh-archive-agent-notes. 새 노트가 기존 활성 노트를 대체하는지 확인 |
| triplet (note) | 세 파일 묶음 | 트리플렛 | `foo.md`, `foo.zh.md`, `foo.i18n.yaml` |
| seal / sealed | 봉인 / 봉인된 | 실링 | 보관 노트의 해시 고정 |
| chain-of-thought leakage | 추론 흔적 | 추론 유출, CoT 누출 | dsh-trim-cot-leakage. 작성 세션 시점으로 쓴 글 |
| vantage | 시점 | 관점 | dsh-trim-cot-leakage. `HEAD` 시점과 작성 세션 시점 |
| recall batteries | 검색식 묶음 | 리콜 배터리 | dsh-trim-cot-leakage |
| contract (prose) | 계약 | | 의무·불변식·사전·사후 조건·호환 약속. dsh-prose-standard |
| complete proposition | 완전 명제 | 완전한 명제 | dsh-prose-standard |
| bilingual pair | 이중 언어 쌍 | 번역 짝, 페어 | deepseek-harness의 `foo.md` ↔ `foo.zh.md` |
| sidecar (`*.i18n.yaml`) | sidecar | 짝 기록 파일, 사이드카 | 이중 언어 쌍의 절별 해시를 적는 파일 |
| briefing (generated) | 변경 브리핑 | 브리핑 | dsh-translate-docs. 서브에이전트 "지시문"(brief)과 구분 |
| projection (website) | projection | 투영, 프로젝션 | dsh-doc. 저장소 Markdown을 웹사이트로 옮긴 것. 세션 Projection과 문맥으로 구분 |
| projection (session) | 프로젝션(Projection) | 투영 | dsh-session-projection. 세션 복구 상태. 위 웹사이트 투영과 구분 |
| checkpoint (projection state) | 복원 지점 | 체크포인트 | dsh-session-projection. "중간 확인"·"사람 확인 지점"과 구분 |
| allowlist | 허용 목록 | 화이트리스트 | |
| official stack (GitHub) | GitHub 공식 stack | 공식 스택 | GitHub의 stack 기능과 객체. 일반 개념인 stack과 구분 |
| cascading rebase | cascading rebase | 캐스케이딩 리베이스, 연쇄 rebase | 처음만 `cascading rebase(아래 층부터 차례로 rebase)`. `gh stack sync` |
| lease (push) | lease | 임대, lease 보호 | `--force-with-lease` |
| flaky test | flaky test | 플레이키, 흔들리는 테스트, 불안정 테스트 | 처음만 `flaky test(실행마다 결과가 달라지는 테스트)` |
| quiescent teardown | quiescent teardown | 완전히 멈춘 뒤의 정리, 퀴선트 | dsh-ci-test-reliability. 처음만 `quiescent teardown(모든 작업이 멈춘 뒤 정리)` |
| negative control | 음성 대조 | 부정 대조, 네거티브 컨트롤 | 고치기 전 실패를 관찰해 새 검사를 검증 |
| interleaving (async) | interleaving | 끼어들기 순서, 인터리빙 | cordis-styling-nitpicking. 학습의 interleaving(섞어 연습하기)과 문맥으로 구분 |
| catch-and-continue | `catch-and-continue` | 잡고 계속 진행 | dsh-error-handling 금지 패턴 |
| disposer / disposal | 해제 함수 / 해제 | 처분기 | Cordis |
| in-place notice | in-place notice | 제자리 알림, 인플레이스 알림 | dsh-client-ui-ux. toast와 구분 |
| truncation | 말줄임 | 잘라내기 | dsh-responsive-ui. 전역 clipping과 구분 |
| window chrome | window chrome | 창 틀, 크롬 | 제목 표시줄 포함 |
| icon-only control | 아이콘 전용 컨트롤 | | |
| ad-hoc signing | 임시 서명(`ad-hoc`) | 애드혹 서명 | dsh-cua-macos-signing |
| storyboard / evidence run | 스토리보드 / 증거 실행 | | record-browser-gif. 한 증거 실행에서 나온 상태 묶음 |
| AI involvement | AI 참여도 | AI 개입도 | dsh-pr-description. 등급(level)과 구분 |
| runner (CI) | CI runner | CI 러너 | 위 `runner`(후보 작성 서브에이전트)와 뜻이 다르다 |
| base (branch) | base branch | 베이스, base 브랜치 | 위 `base`(arena 기반 후보)와 뜻이 다르다 |
| treatment | treatment(연출 계획) | 처리, 트리트먼트 | lemo-opuscar `TREATMENT.md`. 처음만 풀이 |
| B-roll | B-roll | 비롤, 보조 영상 | motion-broll. 영어 유지 |
| cutaway | 컷어웨이 | 컷 어웨이 | motion-broll 풀프레임 클립 |
| panel clip | 패널 클립 | 투명 클립 | motion-broll. `bg:null`, `.mov` |
| PiP | PiP(화면 속 화면) | 피아이피 | 처음만 풀이 |
| mask (video) | 마스크 | 가면 | object-separation의 프레임별 PNG |
| motion blur / subframe | 모션 블러 / 서브프레임 | 움직임 흐림, 하위 프레임 | explainer 3종 렌더 인수 |
| contact sheet | 컨택트 시트(정지 화면 모음) | | motion-broll. 처음만 풀이 |
| cue | cue(소리를 넣을 시점) | 큐 | sound-effects, brag. 처음만 풀이 |
| default kit | 기본 kit | 기본 키트 | sound-effects의 `default_kit`. 7개 한 벌 |
| ducking | 덕킹 | 더킹 | 음성이 나올 때 음악을 낮춤. 처음만 풀이 |
| beat grid | beat grid | 비트 그리드 | 처음만 `beat grid(박자 위치 격자)` |
| true peak | true peak | 트루 피크 | 처음만 `true peak(샘플 사이까지 본 최대 음량)` |
| poster frame | 포스터 프레임 | 썸네일 프레임 | brag의 `brag.jpg`를 `brag.mp4`의 frame 0에 구워 넣는다 |
| beat sheet | beat sheet(화면 문구·UI 순간·시간을 적은 표) | 비트 시트 | explainer 3종. 처음만 풀이 |
| bake (precompute) | bake(미리 계산해 저장) | 굽기 | explainer 3종. 이력이 필요한 값을 로드 때 계산 |
| hero (element) | 영웅 | 주인공 | explainer-engaging. 스테이션을 지나는 요소 하나 |
| station | 스테이션 | 정거장 | explainer-engaging |
| HUD | HUD(화면 위 정보 표시) | 헤드업 디스플레이 | explainer-high-energy. 처음만 풀이 |
| style brief | `style brief`(처음만 "스타일 설계 메모") | 스타일 브리프 | bang-motion 산출물. 서브에이전트 "지시문(brief)"과 구분 |
| rundown | `rundown`(처음만 "초 단위 장면표") | 런다운 | bang-motion |
| starter | starter 파일(원어 유지) | 스타터 | bang-motion. 코드 시작 파일 |
| kartun panggung | 카툰 무대 | 카툰 스테이지 | bang-motion 설명 영상 스타일. 원문 표기 `kartun panggung` |
| sparse clone | sparse clone | 희소 복제 | lemo-opuscar `setup.sh`. 개발 용어라 영어 유지 |
