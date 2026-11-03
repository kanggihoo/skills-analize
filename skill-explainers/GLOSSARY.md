# 공유 용어집

스킬 분석 페이지에서 영어 용어를 옮길 때 이 표를 따른다. 처음 나올 때만 `한국어(English)`로 쓰고, 그다음부터는 한국어만 쓴다. 명령, 필드, 파일 경로, 스킬 이름은 백틱으로 감싸 원문 그대로 둔다.

| English | 권장 한국어 | 쓰지 말 표현 | 비고 |
|---|---|---|---|
| skill | 스킬 | 기술 | |
| playbook | 플레이북 | 각본, 교본 | `poteto-mode` 안의 단계 목록. 스킬이 아니다 |
| principle | 원칙 | 원리 | `principle-*` 스킬 |
| mode skill | 모드 스킬 | | 매 턴 켜져 있는 스킬. Cursor의 Custom Mode |
| subagent | 서브에이전트 | 하위 에이전트 | |
| spawn (a subagent) | (서브에이전트를) 띄운다 | 스폰한다, 생성한다 | |
| fan out | 여러 갈래로 나눠 돌린다, 병렬로 나눈다 | 팬아웃한다 | |
| runner | 러너 | 실행자 | arena·architect의 후보 작성 서브에이전트 |
| candidate | 후보 | 지원자 | |
| base | 기반 후보 | 베이스 | arena에서 고른 후보 |
| graft | 접붙이기 | 이식 | 진 후보의 좋은 부분을 기반에 합치기 |
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
| land / ship | 병합해 내보낸다 | 랜딩한다 | |
| stack (of PRs) | PR 묶음(쌓인 PR) | 스택 | 앞 PR 위에 쌓은 PR 줄 |
| worktree | 워크트리 | 작업 트리 | git worktree |
| hillclimb | 수치 끌어올리기 | 힐클라임 | 한 지표를 반복 실험으로 개선 |
| non-trivial | 사소하지 않은 | 비자명한 | |
| one-way door | 되돌리기 어려운 결정 | 일방통행 문 | |
| operator | 운영자(작업을 맡긴 사람) | 오퍼레이터 | |
| autonomy grant | 자율 권한 | | "알아서 끝까지 해" 같은 허락 |
| triage | 분류 | 트리아지 | |
| transcript | 대화 기록 | 트랜스크립트, 채팅 기록 | `agent-transcripts/` |
| mining (transcripts) | 기록 분석 | 마이닝 | automate-me |
| shared record | 공유 기록 | | recall. 티켓·PR·채팅·오류 추적 등 |
| capsule (state) | 상태 요약 | 캡슐 | recall 출력 틀 |
| thread (work) | 작업 줄 | 스레드 | recall |
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
| race / slice | 경주 / 조각 | 레이스, 슬라이스 | swarm |
| gauntlet | 연속 관문 시험 | 건틀릿 | swarm |
| dropout | 이탈 | 드롭아웃 | 결과를 못 낸 후보·작업자 |
| keep / kill | 남기기 / 삭제 | 킵, 킬 | no-comments |
| harness | 하네스 | 마구 | 앱을 조작하는 스크립트 묶음 |
| drive (the app) | 조작한다 | 드라이브한다 | |
| doc drift | 문서 어긋남 | 드리프트 | maintain-verification-skill |
| limiter | 병목 | 리미터, 한계 요인 | benchmark-checklist, explain-the-number |
| spread | 편차 | 스프레드 | |
| mistake class | 실수 유형 | 실수 클래스 | correct |
| webhook sender key | 웹훅 발신 키 | 센더 키 | make-bot-ui |
| merge frontier | 병합 경계(가장 아래 미병합 PR) | 병합 전선 | Babysit·Shipping·Orchestrate |
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
| wave (migration) | 차례 | 웨이브 | migrate-callers |
| compatibility layer / shim | 호환 계층 | 심 | |
| proxy (verification) | 대리 근거 | 프록시 | prove-it-works |
| discriminated union / sum type | 판별 유니언 / 합 타입 | 차별 유니온, 섬 타입 | |
| branded type | 브랜드 타입 | 낙인 | |
| narrowing | 좁히기 | 내로잉 | TS |
| exhaustiveness check | 빠짐없는 분기 검사 | 완전성 검사 | |
| prompt injection | 프롬프트 주입 | | |
| close call | 헷갈리는 짝 | 근접 판정 | poteto-help "Close calls" |
| rationale (document) | 설계 근거 문서 | 근거 템플릿 | architect `rationale-template.md` |
| hunter / verifier | 사냥 담당 / 검증 담당 | 헌터, 베리파이어 | security-audit |
| coverage critic | 범위 비평 담당 | 크리틱 | security-audit |
| coverage ledger | 범위 장부 | 커버리지 원장 | 관계 원장과 구분 |
| fingerprint (finding) | 지문 | 핑거프린트 | 근본 원인 식별자 |
| blocker | 막힌 이유 | 블로커 | `needs_validation` |
| promotion (artifact) | 승격 | 프로모션 | 작업 폴더에서 결과 폴더로 |
| trust boundary / principal | 신뢰 경계 / 주체 | 프린시펄 | |
| sink / entrypoint | 싱크 / 진입점 | | |
| hardening | 보강 권고 | 하드닝 | 확정 취약점이 아닌 메모 |
| context pointer | 컨텍스트 포인터 | 맥락 지시자 | writing-for-agents, chief-of-staff |
| context load / cognitive load | 컨텍스트 부담 / 인지 부담 | 컨텍스트 로드 | writing-for-agents. 독자 부담(reader load)과 구분 |
| context pressure | 컨텍스트 압박 | | retro |
| progressive disclosure | 점진적 공개 | | writing-for-agents |
| leading word | 이끄는 단어 | 리딩 워드 | writing-for-agents |
| no-op (instruction) | 효과 없는 지시 | 노옵 | retro, writing-for-agents |
| model-invoked / user-invoked | 모델 호출형 / 사용자 호출형 | | `disable-model-invocation` 여부 |
| router skill | 길잡이 스킬 | 라우터 스킬 | |
| retrospective | 회고 | 레트로 | |
| guardrail | 안전장치 | 가드레일 | 방어 코드(guard)와 구분 |
| pit of success | 저절로 성공하는 환경 | 성공의 구덩이 | chief-of-staff |
| compaction | (컨텍스트) 압축 | 컴팩션 | |
| loop / workflow | 루프 / 워크플로 | 고리 | loop-me. 워크플로는 루프 하나의 명세 |
| checkpoint (human-in-the-loop) | 사람 확인 지점 | 체크포인트 | loop-me. architect의 "중간 확인"과 구분 |
| push right | 뒤로 미루기 | 오른쪽으로 밀기 | loop-me |
| brief (checkpoint summary) | 요약 보고 | 브리프 | loop-me. 서브에이전트 "지시문"과 구분 |
| handoff document | 인계 문서 | 핸드오프 문서 | handoff |
| questionnaire | 질문지 | 설문지 | to-questionnaire |
| zone of proximal development | 근접 발달 영역 | ZPD | teach |
| fluency / storage strength | 유창함 / 저장 강도 | | teach |
| desirable difficulty | 바람직한 어려움 | | teach |
| retrieval practice / spacing / interleaving | 인출 연습 / 간격 두기 / 섞어 연습하기 | | teach |
| type assertion | 타입 단언 | 타입 어서션 | migrate-to-shoehorn |
