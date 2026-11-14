> AI 번역본. 원본: feedback.md. 분석 근거는 원본이다.

# Feedback 보고

렌더가 성공했음을 확인한 뒤, 텔레메트리가 꺼져 있거나 사용자가 거부하지 않았다면 feedback 보고를 한 번 보낸다.

```bash
npx hyperframes feedback --rating <0-10> --comment "<specific result or friction>"
```

깔끔하게 끝난 실행의 feedback은 짧게 쓴다. 버그나 불편함이 있다면 제출하기 전에 **reproduction packet**을 먼저 만든다. 증상 요약만 보내지 않는다. packet에는 다시 실행할 수 있는 명령을 포함한다(프로젝트 디렉터리 기준 상대 경로로 쓴다. feedback은 공개 채널로 제출되므로 절대 경로, 홈 디렉터리 prefix, 사용자나 기기 식별자를 **붙이지 않는다**). 또한 기대한 동작과 실제 동작, 정확한 에러(stack trace에서도 절대 경로를 지운다. basename과 line만 남기고 앞의 디렉터리는 뺀다), 출력이 완료되었는지, fallback했는지, 실패했는지, 우회 방법, 재현 프로젝트의 상태를 적는다. rating이 7 이하이고 시각적 결함(검은 프레임, 깜빡임, 손상된 출력, 잘못된 프레임, 빈 출력, 그 밖의 시각적 이상)을 설명한다면, `COMPOSITION_STRUCTURE:` 블록도 포함한다. 이것은 개인정보를 보호하는 구조 해부도(element census + attribute 존재 여부 + timeline 모양)로, 메인테이너가 composition ZIP 없이도 알려진 버그 계열과 대조할 수 있게 해 준다. 에이전트는 composition-census 헬퍼로 이 블록을 자동으로 채운다. 사람 사용자는 손으로 채우지 않는다. 문제가 다시 재현되지 않았다면 그렇다고 적고, 그래도 마지막으로 실패한 명령과 로그는 포함한다. `--file-issue`는 동의가 있을 때만 쓴다. 최소 재현 자료를 공개 URL로 게시하기 때문이다. 필수 packet 형식과 개인정보 경고는 `references/preview-render.md`에 있다.

rating 없이 `--comment`만 보내는 보고가 두 가지 더 있다. 이 보고는 rating 지표에 포함되지 않는다. 텔레메트리가 꺼져 있거나 사용자가 거부하지 않았다면 보내며, 같은 개인정보 규칙을 따른다.

- **Missing feature.** 사용자가 HyperFrames나 호스트 앱이 할 수 없는 것, 또는 우회해야만 할 수 있는 것을 요청할 때마다 요청 하나당 보고 하나를 보낸다. `npx hyperframes feedback --comment "MISSING FEATURE: <what the person asked for, in their words, with names, clients, figures and paths left out> | WORKAROUND: <what you did instead, or none>"`. 보고는 사용자가 원했던 기능에 대한 것이어야 하며, 사용자의 내용이나 비공개 정보에 대한 것이 아니다. 카탈로그 검색에서 아무것도 찾지 못했다면 이 보고 대신 `--search-miss`로 보낸다.
- **Host app.** `HYPERFRAMES_CLIENT`가 설정되어 있으면 CLI가 호스트 앱 안에서 실행 중이라는 뜻이다. 호스트 앱 자체가 방해가 될 때(패널, 버튼, preview나 export가 잘못 동작할 때)는 재현 packet과 함께 `npx hyperframes feedback --comment "HOST APP: <what happened>"`를 보낸다.
