# 코드 고고학 (git + 저장소 내부)

## 이 소스에 담긴 것

- 커밋 이력(메시지, 날짜, 작성자, diff)
- PR 설명, 리뷰 댓글, 토론 스레드(`gh` 사용)
- 인라인 코드 주석, TODO, FIXME, 폐기(deprecation) 노트
- 저장소가 보관하는 경우 ADR(architectural decision records, 아키텍처 결정 기록)
- 테스트. 테스트 이름과 단언문에는 변경을 촉발한 엣지 케이스가 종종 담겨 있습니다
- 같은 커밋에서 함께 수정된 관련 파일(동시 변경 신호)
- CHANGELOG 항목, 저장소 내 릴리스 노트
- 커밋 메시지와 PR 본문에 언급된 이슈 / 티켓 ID

가장 신뢰할 수 있고, 코드에 직접 연결되어 있으며, 가장 완전한 소스입니다. 저장소를 거친 모든 것이 여기에 있어야 합니다.

## 검색 방법

시드 커밋 목록을 확장하십시오.

```bash
# Full history of the file through renames
git log --follow --oneline -- <file>

# Pickaxe: commits that added or removed this exact text
git log -S '<exact_string_from_code>' -- <file>

# Or for patterns:
git log -G '<regex>' -- <file>

# Who wrote each line and when
git blame -L <start>,<end> <file>

# The full diff of a specific commit
git show <hash>

# Commits between two points affecting this file
git log <old>..<new> -p -- <file>
```

의미 있는 커밋마다 PR 맥락을 가져오십시오.

```bash
# Find the PR number from the merge commit or branch
git log -1 --format=%B <hash>

# Full PR context: body, review comments, linked issues
gh pr view <number> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews,files

# The --json reviews and comments fields are where the real signal is
```

문서 중 저장소 밖에 있는 것도 찾아보십시오.

```bash
# ADRs often live in docs/adr/ or similar
rg -l -i 'architecture.decision' --glob '*.md'

# TODOs and FIXMEs near the target
rg -n -C2 '(TODO|FIXME|HACK|XXX|NOTE)' <target_file>

# Related tests. Names often encode the "why"
rg -l '<symbol>' --glob '*test*'
```

## 좋은 증거의 모습

- 변경만이 아니라 해결하는 문제를 설명하는 PR 설명("이것은 X를 일으킨 페이지네이션 버그를 고친다")
- 대안이 논쟁된 긴 리뷰 스레드
- 대상 줄 근처에서 자명하지 않은 제약을 설명하는 인라인 코드 주석
- 변경을 촉발한 엣지 케이스를 드러내는 `test_handles_edge_case_when_X`라는 이름의 테스트
- 티켓 또는 인시던트 ID를 참조하는 커밋 메시지
- 사용자에게 보이는 근거를 요약한 CHANGELOG 항목

## 흔한 함정

- **Squash-merge 평탄화.** 저장소가 PR을 squash하면 브랜치 이력의 개별 커밋은 사라집니다. PR 본문과 댓글로 대체하십시오.
- **오해를 부르는 커밋 메시지.** "Small refactor"가 의도적인 동작 변경을 숨기기도 합니다. 메시지가 아니라 diff를 보십시오.
- **컬트 패턴(Cargo-culted patterns).** 작성자가 이유를 이해하지 못한 채 패턴을 복사했을 수 있습니다. 그 패턴이 코드베이스의 더 이른 곳에서 시작되었는지 확인하고, *그* 커밋을 조사하십시오.
- **봇 커밋과 자동 머지.** Dependabot, Renovate, 자동 백포트는 보통 동기를 담고 있지 않습니다. 의도를 찾을 때는 건너뛰십시오.
- **코드를 의도의 증거로 취급하기.** 코드 자체는 왜 존재하는지에 대한 증거가 아닙니다. 증거는 커밋 메시지, PR, 댓글, 테스트, 문서에서 옵니다. "함수 이름이 X이니까"를 의도의 증거로 인용하지 마십시오.

## 반환할 내용

질문에 관련된 모든 커밋, PR, 댓글에 대해 다음을 포함합니다.
- 정확한 텍스트(인용)
- 해시 / PR 번호 / 파일:줄 번호
- 작성자와 날짜
- 직접적인지(질문을 명시적으로 다루는지) 정황적인지
