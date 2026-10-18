# minimax-docx 분석

## 원본

- 경로: `.agents/skills/minimax-docx/SKILL.md`
- 성격: OpenXML SDK 기반 DOCX 생성/편집/서식 적용 스킬
- 주요 도구: .NET, C#, OpenXML SDK, MiniMaxAIDocx CLI

## 적용 조건

Word 문서, `.docx`, 보고서, 제안서, 계약서, 공문, 양식 작성, 템플릿 적용, 문서 서식 변경 등 최종 산출물이 Word 문서인 작업에 사용한다. 사용자가 docx를 명시하지 않아도 공식/인쇄용 문서가 요구되면 적용한다.

## 동작 과정

1. 환경을 확인한다.
   최초 세팅은 `scripts/setup.sh`, 세션 첫 작업은 `scripts/env_check.sh`를 실행하고 `NOT READY`면 진행하지 않는다.

2. 입력 문서 유무로 pipeline을 나눈다.
   입력 파일이 없으면 CREATE, 입력 docx가 있고 내용 변경이면 FILL-EDIT, 입력 docx에 서식/템플릿 적용이면 FORMAT-APPLY로 라우팅한다.

3. CREATE에서는 문서 유형과 미학 레시피를 고른다.
   `scenario_a_create.md`, typography/design references를 읽고 단순 문서는 CLI, 복잡한 구조는 C#을 직접 작성한다.

4. EDIT/FILL에서는 preview와 analyze 후 변경한다.
   단순 텍스트 치환이나 placeholder 채움은 CLI를 쓰고, 구조 변경/표/이미지/스타일 조작은 C#과 relevant samples를 사용한다.

5. TEMPLATE 적용은 C-1/C-2로 나눈다.
   순수 style template이면 overlay, 구조가 있는 template이면 base-replace를 사용한다. 복잡한 multi-section header/footer는 template base를 보존한다.

6. OpenXML element order를 지킨다.
   `pPr`는 run보다 먼저, `rPr`는 text보다 먼저, `sectPr`는 body의 마지막 child여야 한다.

7. validation pipeline을 실행한다.
   `merge-runs`, XSD validate, business validate를 돌린다. Scenario C는 gate-check가 hard requirement다.

8. preview와 diff로 최종 확인한다.
   template 적용에서는 원본 내용 보존 여부와 direct formatting contamination을 확인한다.

## 핵심 규칙

- C# 작성 전 관련 `Samples/*.cs`를 읽는다.
- Word XML element order를 어기면 파일이 깨질 수 있다.
- template 복사 시 inline direct formatting은 template style을 덮으므로 제거한다.
- heading style에는 `OutlineLevel`이 있어야 TOC와 navigation pane이 작동한다.
- multi-template merge에서 paragraph를 중복 삽입하거나 빈 paragraph padding을 넣지 않는다.
- complex template header/footer는 새로 만들지 말고 template XML을 보존한다.

## 산출물 특성

결과물은 검증 가능한 `.docx` 파일이다. 이 스킬은 단순 텍스트 생성보다 OpenXML 구조 안정성, 템플릿 보존, 서식 contamination 방지, XSD/business validation을 중요하게 본다.

## 주의점

DOCX 조작은 XML 순서와 스타일 상속이 엄격하다. 복잡한 문서에서는 CLI보다 C# 직접 작성이 더 안전하다고 명시되어 있으며, 반드시 sample 기반으로 구현해야 한다.
