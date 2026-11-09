---
name: egm-drift-report
license: Apache-2.0
disable-model-invocation: true
description: >-
  모든 design 문서에 대해 drift detection을 실행해 문서와 코드의 일관성을 점검한다.
  차이점이 담긴 실행 가능한 보고서를 만든다. 사용자가 디렉터리 안의 모든 design 문서나
  README에서 drift를 찾거나 일관성을 확인해 달라고 요청할 때 사용한다.
---

# Design과 코드의 Drift 감지

Codex 또는 ChatGPT Work에서 실행할 때는 먼저 [Codex integration](../../docs/codex.md)을 읽는다.
Claude Code 또는 Cowork에서 실행할 때는 먼저 `${CLAUDE_PLUGIN_ROOT}/docs/claude.md`를 읽는다.

사용자가 모든 design 또는 README 묶음에 대해 drift를 감지해 달라고 요청하면, 목표는
코드베이스가 그 design이나 README에 적힌 명세에서 벗어났거나 명세를 구현하지 못한
모든 사례를 찾아내는 것이다.

1.  **입력 확인**: design 문서나 README가 담긴 디렉터리가 제공됐는지 확인한다. 제공되지
    않았다면 대상 디렉터리를 지정해 달라고 사용자에게 요청한다.
2.  **문서 목록 작성**: design 디렉터리의 모든 파일을 나열한다.
3.  **분석**: design 문서 각각에 대해 다음을 수행한다.

    *   **맥락 파악**: design 문서를 읽는다. 의도, 제안된 변경 사항, 그리고 언급된
        파일명과 symbol을 파악한다.
    *   **원본 코드 찾기**: source tree에서 대응하는 소스 코드 파일을 찾는다. 경로가
        명시되어 있지 않다면 code search나 grep으로 문서에 언급된 class, function, API
        endpoint를 찾는다. 다음번 감지 비용을 줄이기 위해 누락된 링크를 문서에 추가하도록
        사용자에게 안내한다.
    *   **검증**: 해당 소스 파일의 현재 상태를 읽는다.
    *   **Drift 감지**: design과 실제 구현을 비교한다. 특히 다음을 확인한다.
        *   누락된 기능: 문서에는 설명되어 있으나 코드에는 없는 로직.
        *   불완전한 모델: design에 명시된 필드가 빠진 dataclass/Class/Struct/Proto.
        *   로직 지름길: 동적 로직이 계획되었으나 하드코딩된 값.
        *   구조적 이탈: 제안된 것과 다른 패턴이나 라이브러리를 사용한 구현.
    *   **필터링**: 차이점만 보고한다. 정상 동작하는 부분이나 일치하는 부분은 설명하지
        않는다. 코드가 design과 완전히 일치하면 "No drift detected."를 출력한다.

4.  **보고**: 발견된 모든 불일치를 담은 보고서 한 개를 만든다.

    *   파일 작성 도구를 사용해 각 파일의 분석 결과를 `{YYYY-MM-DD}_DRIFT_REPORT.md`에
        덧붙인다.
    *   엄격한 형식:

        ```markdown
        ## <DESIGN_DOC_NAME>

        <확인된 구체적 차이점의 bullet 목록>
        <또는 "No drift detected">
        ```

5.  **지침**

    -   엄격하게 검사한다. design 문서가 특정 객체, 필드, 파일명을 언급했는데 코드에 그것이
        없다면 보고 대상 drift다. 적용 범위를 다시 확인한다. design이나 README에서 다루지
        않은 로직 일부가 있다면 이것도 보고 대상 drift다.
    -   기억에 의존하지 말고 파일을 충분히 읽어서 코드의 현재 상태를 확인한다.
    -   tool 출력 버퍼가 넘치지 않도록 파일을 순서대로 처리한다.
