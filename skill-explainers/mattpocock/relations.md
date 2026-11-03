# mattpocock 관계 원장
분석 커밋: 0f0d1b0

- 범위: `mattpocock/` 아래 `SKILL.md` 12개. 번역본(`*.KO.md`, `*.KO.stale.md`)은 열지 않았다.
- 최신화: 2026-11-04에 `scripts/update-skill.py mattpocock/skills-lock.json`으로 원격(`mattpocock/skills`)과 비교했다. `chief-of-staff`가 바뀌었고, 기존 번역본은 `SKILL.KO.stale.md`가 됐다. 같은 날 사용자가 4개를 추가하고(git-guardrails-claude-code, teach, wait-what, writing-for-agents) 4개를 지웠다(claude-handoff, writing-beats, writing-fragments, writing-shape). lock도 그에 맞춰 정리했다. 커밋 `0f0d1b0`.
- 모든 스킬에 `agents/openai.yaml`이 있다. `disable-model-invocation: true`인 스킬은 이 파일에도 `allow_implicit_invocation: false`가 있다.

## 스킬

| 경로 ID | 한 줄 요약 | 조사 상태 | 원문 비교 | 소속 묶음 | 역할 |
|---|---|---|---|---|---|
| mattpocock/chief-of-staff | 긴 목표 하나를 한 세션에서 서브에이전트와 위키로 끌고 가며 작업 환경까지 고친다 | 완료 | - | env-improve | 단계(허브) |
| mattpocock/retro | 코딩 세션을 돌아보고 다음 실행을 위해 환경 개선 후보를 심각도 순으로 낸다 | 완료 | - | env-improve | 단계 |
| mattpocock/writing-for-agents | 스킬·AGENTS.md처럼 에이전트가 읽는 문서를 쓰는 기준 | 완료 | 원문 동일(`SKILL.md`, `SKILL-MECHANICS.md`): 사용자 전역 스킬 `~/.claude/skills/writing-for-agents` (저장소 밖) | env-improve | 안내(참고 자료) |
| mattpocock/git-guardrails-claude-code | 위험한 git 명령을 막는 Claude Code 훅을 설치한다 | 완료 | - | - | 단계 |
| mattpocock/setup-pre-commit | Husky·lint-staged·Prettier로 커밋 전 검사를 설치한다 | 완료 | - | - | 단계 |
| mattpocock/handoff | 지금 대화를 다음 에이전트가 이어받을 인계 문서로 압축한다 | 완료 | - | - | 단계 |
| mattpocock/loop-me | 반복되는 일을 찾아 위임할 워크플로 명세를 질문으로 다듬는다 | 완료 | - | - | 단계 |
| mattpocock/teach | 작업 폴더에 학습 상태를 쌓으며 여러 세션에 걸쳐 가르친다 | 완료 | 원문 동일(`SKILL.md`와 `*-FORMAT.md` 4개): learning/teach · 동명·내용 다름: pstack/teach | - | 단계 |
| mattpocock/to-questionnaire | 혼자 답할 수 없는 결정을 다른 사람이 채울 질문지로 만든다 | 완료 | - | - | 단계 |
| mattpocock/wait-what | 직전 답변을 맥락과 쉬운 영어로 다시 설명하게 한다 | 완료 | - | - | 단계 |
| mattpocock/migrate-to-shoehorn | 테스트의 `as` 단언을 shoehorn 함수로 바꾼다 | 완료 | - | - | 단계 |
| mattpocock/scaffold-exercises | 린트를 통과하는 강의 연습 문제 폴더 골격을 만든다 | 완료 | - | - | 단계 |

## 관계

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|
| r01 | chief-of-staff | retro | 내부 위임 | 명시-이름 | 서브에이전트 세션 약 5개 중 1개에 실행. 문제가 있던 세션부터 고른다. Skill 도구가 아니라 `../retro/SKILL.md` 파일을 읽고 따른다. retro의 마지막 단계(사용자에게 제시) 대신 chief-of-staff가 직접 고르고 실행한다. 원문은 두 스킬이 나란히 설치됐다고 전제한다. 원격에서는 chief-of-staff가 `skills/in-progress/`, retro가 `skills/engineering/`에 있어 원격 구조 그대로면 이 상대 경로가 풀리지 않을 수 있다. 이 저장소에서는 풀린다 | 세션 기록 → 개선 후보 | - | 범위 내 | chief-of-staff:51,53; retro:25 |
| r02 | chief-of-staff | to-spec, to-tickets, implement-spec | 내부 위임 | 명시-이름 | 큰 작업이면 명세 → 티켓 → 이슈 트래커 게시 → 구현. 경로 `../to-spec/SKILL.md` 등이 가리키는 폴더가 이 저장소에 없다 | 명세, 티켓 | 이슈 트래커 | 불명 | chief-of-staff:54 |
| r03 | retro | writing-for-agents | 내부 위임 | 명시-이름 | 1단계에서 Skill 도구로 불러 문체 기준을 얻는다(의무형). 4단계 참고 절에서도 스킬 작성은 이 기준을 따르라고 한다 | - | - | 범위 내 | retro:11,44; writing-for-agents:3 |
| r04 | loop-me | grilling | 내부 위임 | 명시-이름 | `/grilling` 방식(한 번에 질문 한 묶음, 질문마다 추천 답)으로 진행 | - | - | 범위 밖 | loop-me:8 |
| r05 | wait-what | (저장소의) GLOSSARY.md, GLOSSARY-MAP.md | 참고 | 명시-이름 | 공용어(ubiquitous language)를 이 파일에서 가져온다. 어느 스킬이 만드는지는 원문에 명시 없음 | - | 대상 저장소 | 범위 밖 | wait-what:7 |
| r06 | teach | wait-what | 미확인 | 미확인 | teach의 `GLOSSARY-FORMAT.md`도 `GLOSSARY.md`를 정의한다. 하지만 teach는 학습 작업 폴더의 용어집이고, wait-what은 코드 저장소의 공용어 파일이라 같은 파일이라는 근거가 없다 | `GLOSSARY.md` | - | 범위 내 | teach/GLOSSARY-FORMAT.md:3; wait-what:7 |
| r07 | teach | loop-me | 같은 계열 | 추론 | 둘 다 "within this workspace" 상태형 스킬이고, 둘 다 현재 폴더의 `NOTES.md`에 기록한다. 같은 폴더에서 돌리면 `NOTES.md`를 함께 쓰게 된다(판정) | `NOTES.md` | 현재 작업 폴더 | 범위 내 | teach:3,20; loop-me:3,32 |
| r08 | git-guardrails-claude-code | setup-pre-commit | 같은 계열 | 추론 | 둘 다 사람이 아닌 장치로 실수를 막는 설치 스킬이다. 막는 시점이 다르다(명령 실행 전 훅 / 커밋 전 훅) | - | - | 범위 내 | git-guardrails-claude-code:3; setup-pre-commit:3 |
| r09 | retro | setup-pre-commit, git-guardrails-claude-code | 산출물 호환 | 추론 | retro는 "guardrail이 없는 저장소(pre-commit 훅도 CI도 없음)"를 개선 후보로 낸다. 이 후보를 실행하는 도구가 될 수 있다. retro는 두 스킬을 이름으로 부르지 않는다 | 개선 후보 | - | 범위 내 | retro:18; setup-pre-commit:3 |
| r10 | chief-of-staff | writing-for-agents | 참고 | 명시-이름 | 위키 작성 예시 문장에 "retro가 1단계에서 writing-for-agents를 부른다"가 나온다. 실행 지시가 아닌 예시 | - | - | 범위 내 | chief-of-staff:45 |

판정: `retro`와 `chief-of-staff`는 `disable-model-invocation: true`라 다른 스킬이 Skill 도구로 부를 수 없다. 그래서 chief-of-staff는 retro의 `SKILL.md`를 파일 경로로 읽는다(r01). 반대로 `writing-for-agents`는 이 필드가 없어서 retro가 Skill 도구로 부를 수 있다(r03). 이 차이는 `writing-for-agents/SKILL-MECHANICS.md:9-14`가 설명하는 규칙과 맞는다.

## 묶음

| group-id | 작업 목표 | 구성 스킬과 역할 | 그림 |
|---|---|---|---|
| env-improve | 긴 목표를 추진하면서 에이전트가 일하는 환경을 계속 고친다 | chief-of-staff(허브: 위키·서브에이전트·일정), retro(세션 회고로 개선 후보 찾기), writing-for-agents(개선 내용을 문서로 쓸 때의 기준) | `@workflow`: chief-of-staff → retro → writing-for-agents, 불명(폴더 없음) to-spec/to-tickets/implement-spec은 점선 |

독립 스킬(묶음 없음): git-guardrails-claude-code, setup-pre-commit, handoff, loop-me, teach, to-questionnaire, wait-what, migrate-to-shoehorn, scaffold-exercises. 같은 계열 관계(r07, r08)와 추론 관계(r09)는 있지만 하나의 흐름으로 이어지지는 않는다(판정).
