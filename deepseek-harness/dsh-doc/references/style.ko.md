# 페이지 스타일

## Summary

DSH 페이지를 훑어보기 쉽고 잘못 읽히기 어렵게 만드는 페이지 단위 스타일 기본값이다. 짧은 Summary, 통제된 기술 영어, 주요 부분 사이의 `-----` 구분선, 섹션 제목을 보이게 두는 `<details>` 접기, 절제된 강조를 포함한다. 템플릿은 `session-persistence-jsonl` README 짝 파일이다.

## Table of Contents

- [짧은 summary](#short-summary)
- [통제된 기술 영어](#controlled-technical-english)
- [섹션 구분선](#section-separators)
- [접을 수 있는 콘텐츠 섹션](#foldable-content-sections)
- [강조의 절제](#emphasis-discipline)
- [Dev Note](#dev-note)

## 짧은 summary

모든 작성 페이지는 짧은 `Summary`로 시작한다. 한 문단, 3~5문장으로 독자가 할 수 있거나 관찰할 수 있는 것, 독자가 신경 쓸 이유, 운영 모델, 가장 중요한 경계를 적는다. 목차와 섹션이 세부 내용을 담당한다. 배치와 섹션 순서는 [structure-hierarchy.md](structure-hierarchy.md)에 있다. 영어 패키지 README의 Summary는 `verify-package-readme-summaries`가 `wc -w` 방식으로 100단어 이하로 추가 제한한다.

## 통제된 기술 영어

Agent, 번역자, 또는 비원어민 독자가 파싱해야 하는 영어 산문에는 [ASD-STE100](https://www.asd-ste100.org/)에서 영감을 받은 검토 과정을 적용한다. 이는 명확성을 위한 규율이지 ASD-STE100 인증 준수가 아니다. 저장소는 이 표준의 통제 어휘를 재현하거나 검증하지 않는다.

- 행위자와 동작을 적는다. 행위자가 중요하면 능동태를 우선한다.
- 개념마다 안정된 용어 하나를 쓴다. 다양성을 위해 동의어를 바꿔 쓰지 않는다.
- 직접적인 동사를 쓴다. 정확한 동사가 있으면 명사형과 모호한 구동사를 바꾼다.
- 한 문장에는 지시 하나만 담는다. 세 단계 이상의 절차나 조건은 목록으로 쓴다.
- 세미콜론과 긴 절의 연쇄를 나눈다. 각 문단은 한 주제만 다룬다.
- 근거 없는 품질 형용사와 겹친 완곡어법을 뺀다. 원문의 모든 사실과 불확실성의 정도는 보존한다.

지시문 20단어, 설명문 25단어는 기계적 게이트가 아니라 검토 신호로 본다. 나누면 조건이나 관계가 숨겨지는 경우에는 긴 문장을 유지한다. 길이 목표를 맞추려고 `must`, `may`, `never`, 시간, 예외, 숫자, 그 밖의 계약 용어를 빼거나 강하게 바꾸지 않는다. 완전한 명제 규칙은 [prose standard](../../dsh-prose-standard/SKILL.md)가 담당한다.

## 섹션 구분선

페이지의 주요 부분은 `-----` 가로선으로 구분한다. 가로선은 자기 줄에 두고, 앞뒤로 빈 줄을 둔다. 문단 바로 뒤의 가로선은 Setext 제목으로 파싱된다. 패키지 README의 마지막 두 H2 섹션 안에 가로선을 두면 Model Experience 게이트가 깨진다. 템플릿은 front matter → 사용 섹션 → 접힌 개발자 섹션 → Further Exploration → Model Experience 순서로 구분한다.

## 접을 수 있는 콘텐츠 섹션

개발자용 세부 내용과 마지막 Dev Note는 GitHub 기본 `<details>`/`<summary>` 블록 안에 접는다. 섹션 제목(H2 또는 H3)과 `<a id>` 앵커는 계속 보이게 두고, 제목 아래 콘텐츠만 접는다. 블록 안에서는 `<summary>` 뒤에 빈 줄을 두고, 모든 Markdown 줄은 0번 열에서 시작한다. 들여쓴 내용은 코드 블록이 된다. `</details>`는 빈 줄 뒤에 닫는다. 접힌 블록 안의 제목, 목록, 표, 링크는 정상적으로 파싱되고 앵커도 유지된다. `session-persistence-jsonl` README 짝 파일이 구현 섹션과 Dev Note 두 접기를 모두 보여 준다.

패키지 README에서는 `## Model Experience`와 `## Known Limitations and Deferred Work`를 마지막 두 H2 제목으로 둔다. Limitations 앵커는 H2 바로 뒤에 두어, 앞의 Model Experience 본문에 포함되지 않게 한다. 마지막 Dev Note는 limitations 섹션 아래에 앵커가 붙은 H3로 둔다. Limitations 섹션이 명시적으로 면제된 패키지는 H2 Dev Note를 쓸 수 있다.

## 강조의 절제

굵은 글씨는 동작을 바꾸는 절이나 중요한 비교에만 쓴다. 벤치마크 표에서는 표 헤더와 각 행의 최고 값을 굵게 표시한다. 기준 예시를 따른다.

## Dev Note

None.
