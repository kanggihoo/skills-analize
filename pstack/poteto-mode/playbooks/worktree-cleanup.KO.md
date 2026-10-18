### Worktree 및 시뮬레이터 정리

**디스크와 안전 게이트에 책임을 진다.** 공간을 되찾기 위해 병합되었거나 버려진 git worktree와 오래된 iOS 시뮬레이터를 정리한다. 삭제는 되돌릴 수 없으므로, 모든 단계는 사용 중이거나 커밋되지 않은 작업이 있는 것을 지우지 않도록 막는다.

1. 스냅샷을 찍고 감사한다. `df -h /`를 기록한 뒤 `scripts/worktree-audit.sh`를 실행한다(principle-build-the-lever). 경로는 `git worktree list`에서 읽으며 손으로 입력하지 않는다. 손으로 입력한 `myrepo-worktrees/x`는 `.cursor/worktrees/myrepo/x`에 있는 worktree를 놓치기 때문이다(principle-encode-lessons-in-structure). 이 스크립트는 크기, 나이, 병합 상태, 커밋되지 않은 작업, PR 상태, 그리고 그것을 건드린 가장 최근 채팅으로 각 worktree를 분류하고, 버킷을 제안한다. transcript 스캔은 느리므로 백그라운드로 돌린다.
2. 버킷은 조언이지 허가가 아니다. 고정된(pinned) 채팅과 활성 채팅이 실제 산출물이다. 그 집합을 사용자나 사이드바에서 얻고, 모든 후보를 대조한다. 이 도구는 사용자가 고정해 둔 worktree를 `safe`로 표시한 적이 있으므로, 고정된 집합이 우선한다.
3. 삭제 전에 사용 여부를 확인한다. `verify-recent-chat` 행이면 모두, 그리고 의심스러운 것이면 무엇이든, subagent를 내보내 transcript를 읽고 채팅이 고정되었는지 또는 진행 중인지, 그리고 어떤 worktree를 건드리는지 보고하게 한다(principle-guard-the-context-window, transcript는 방대하다). 고정된 채팅은 백그라운드 subagent를 통해 형제 worktree에 arena와 repro 트리를 만든다. 이름이 사이드바에 나타나지 않더라도 그것들은 사용 중이다.
4. 되돌릴 수 없는 손실 앞에서 멈춘다. `wip:N`은 추적되는 커밋되지 않은 편집이 N개 있다는 뜻이다. 먼저 diff를 보여주고 결정을 받는다. 깨끗한 worktree를 제거하는 것은 branch에서 복구할 수 있지만, 커밋되지 않은 작업은 사라지기 때문이다. `scratch:N`은 추적되지 않는 일회용 파일이며 버려도 안전하지만, 파일 이름을 밝힌다. Autonomy에 따라 깨끗하고, 병합되었고, 사용 중이 아닌 것은 진행한다. `wip`와 사용 중인 것은 멈춘다.
5. 확인된 집합을 정리한다. 경로마다 `git worktree remove --force <path>`를 실행한다. 디렉터리가 무시된 빌드 산출물 때문에 남는다면 `rm -rf`로 지운 뒤 `git worktree prune`을 실행한다. branch 참조는 남으므로 커밋은 잃지 않는다. `df -h /`로 확인하고 다시 목록을 본다.
6. 시뮬레이터와 그 밖의 회수 대상. 보통 시뮬레이터가 다음으로 가장 큰 이득이다. `xcrun simctl --set testing delete all`(XCTestDevices 복제본), `xcrun simctl delete unavailable`, 그리고 오래된 런타임은 `xcrun simctl runtime list`로 본 뒤 `runtime delete <id>`로 지운다. 필요하면 더 있다. Xcode `DerivedData`와 `iOS DeviceSupport`, `~/Library/Application Support/Cursor`(`state.vscdb.backup`, 그리고 워크스페이스로 연 폴더 이름을 딴 `snapshots/roots/<root>`는 부풀어 오른다), 패키지 캐시(pnpm, uv, brew, yarn). 사용자가 보관하라고 하지 않은 캐시만 비운다.

이 playbook은 코드 리뷰가 실수를 잡아 줄 장치 없이 사용자 상태를 지우는 유일한 playbook이므로, 위의 게이트가 곧 리뷰다.

**응답:** 정리 전후의 `df -h /`와 회수한 공간, 정리한 worktree, 보류한 각 항목의 한 줄 이유(어느 채팅에서 사용 중인지, 또는 커밋되지 않은 작업이 있는지).
