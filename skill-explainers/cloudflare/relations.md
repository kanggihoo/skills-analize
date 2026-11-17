# cloudflare 관계 원장
분석 커밋: da3be34f22adbe6a3095252847b21c5f2e13b661

- 범위: `cloudflare/` 아래 `SKILL.md` 1개.
- 최신화: 2026-11-04에 `scripts/update-skill.py cloudflare/skills-lock.json`으로 원격(`cloudflare/security-audit-skill`, `skills/security-audit/SKILL.md`)과 비교했다. 내용 해시가 lock과 같아 바뀐 파일이 없다. 2026-11-17 재분석에서는 `git diff --stat 5760176 HEAD`로 원본 파일(`.ko.md` 제외)이 이전 분석 커밋 이후 바뀌지 않았음을 확인했다.
- 번역본: `*.ko.md` 15개가 같은 폴더에 있다(commit `19e6137`). 분석 입력으로 열지 않았다.
- 커밋 여부: `git ls-files cloudflare`가 36개를 돌려준다. 모두 커밋돼 있다.

## 스킬

| 경로 ID | 한 줄 요약 | 조사 상태 | 원문 비교 | 소속 묶음 | 역할 |
|---|---|---|---|---|---|
| cloudflare/security-audit | 실제 신뢰 경계를 넘는 취약점을 소스 근거로 찾아 우선순위와 최소 수정안까지 보고한다 | 완료 | 원문 동일: verification-skills/cloudflare/security-audit (번역본 `*-KO.md`만 다르고 원본 파일 20개 모두 같음) | - | - |

## 관계

| rel-id | from | to | 종류 | 근거 방식 | 조건·강도·사용자 개입 | 전달물·상태 | 상태 관리 주체 | 해석 상태 | 출처 |
|---|---|---|---|---|---|---|---|---|---|

관계 행이 없다. 컬렉션에 스킬이 하나뿐이고, 원본 `.md` 15개를 모두 읽어도 다른 스킬 이름이나 슬래시 명령을 가리키는 지시가 없다. 스킬 폴더 안의 참조 문서(`RECONNAISSANCE.md` 등)와 스크립트는 스킬 내부 구성이므로 스킬 페이지가 다룬다.

`SKILL.md` 26~27줄의 `research` agent와 `general` agent는 이 스킬이 하위 작업에 쓰는 위임 역할이다. 다른 스킬이 아니므로 관계로 적지 않는다.

컬렉션 밖에서 이름이 겹치는 곳: `ecc/autonomous-loops/SKILL.md:105`의 `security-audit.md`는 그 예시 안의 파일 이름이다. 이 스킬을 가리키지 않는다(판정: 관계 아님).

## 묶음

| group-id | 작업 목표 | 구성 스킬과 역할 | 그림 |
|---|---|---|---|
