# tasteskill v2 (`design-taste-frontend`)

코딩 에이전트를 위한 디자인 Skill입니다. 2026년 10월 One Page Love와 Awwwards Sites of the Day에서 선정한 사이트 247개를 조사해 만들었습니다. 에이전트가 평균적인 랜딩 페이지로 회귀하지 않고 아트 디렉션을 따르게 하며, 장식 없는 엄격한 하우스 스타일을 적용하고, 작업을 마치기 전에 스스로 렌더링 결과를 확인하게 합니다.

## 동작 방식

1. **목록화**: 에이전트는 이 고객만의 정보를 나열합니다. 이름과 의미, 거리, 수치, 한 가지 제약, 재료, 영업 시간 등입니다.
2. **방향 추첨**: `scripts/draw.mjs`는 20개 방향(조사한 강력한 사이트의 아이디어를 실행하는 엔진) 중 세 가지를 뽑습니다. 에이전트는 목록의 소재를 담을 수 있는 하나를 선택하고, 스크립트는 나머지를 추첨합니다. hero 구성, 섹션 구성, 실제 무료 글꼴의 타이포그래피 시스템, 팔레트, 사진, 모션, 참고 사이트, 각 청사진에서 하우스 규칙과 다른 지점을 나열한 목록이 포함됩니다. 프로젝트가 방향을 반복하지 않도록 최근 추첨 결과를 기억합니다.
3. **아이디어와 실제 동작**: 고객 고유의 소재와 방향의 장치를 연결하는 한 문장을 만들고 가장 가까운 경쟁 제품을 기준으로 검토합니다. 방문자가 페이지에서 할 수 있는 동작도 하나 지정합니다.
4. **시트 기반 구현**: 문구부터 시작하고 콘텐츠를 모두 작성합니다. 프로젝트 자체 사진이 없다면 `scripts/assets.mjs`가 공개 이미지 컬렉션에서 대상 세계의 실제 사진(오래된 엽서 속 거리, 옛 지도, 재료, 업종을 묘사한 판화, 박물관 소장품 등)을 찾습니다. 프로젝트에 내려받고 출처를 기록합니다. 정직하게 쓸 사진이 없을 때만 대상을 코드로 그립니다.
5. **품질 gate**: `scripts/lint.mjs`(소스)와 `scripts/inspect.mjs`(실제 브라우저, 1440 / 768 / 390)가 하우스 규칙을 측정합니다. 제목 최대 두 줄, eyebrow 레이블 없음, monospace 없음, 01/02/03 없음, 가는 선 없음, 그라데이션 없음, 기본 상태 그림자 없음, 크림과 테라코타 조합 없음, 보라색 없음 등을 확인합니다. 더불어 초점 부재, 빈 화면, 가리거나 잘린 텍스트, 지나치게 긴 핀, 가로 방향 행, 흐린 텍스트처럼 블라인드 심사자가 감점한 결함도 검사합니다.
6. **살펴보기**: inspector가 스크린샷을 저장합니다. 에이전트는 Awwwards 비중을 반영한 기준표로 평가하고, 가장 큰 문제 세 가지를 수정한 뒤 반복합니다. 최대 세 번 진행합니다.

무(無) Skill 기준선과 다른 디자인 Skill을 상대로 진행한 블라인드 테스트 다섯 회 결과는 `references/research.md` §11에 기록되어 있습니다.

## 내용

```
SKILL.md                 실행 흐름, 하우스 규칙, 법칙
references/              문구, 타이포그래피, 색상, 레이아웃, 이미지, 모션, 비평, 징후, 조사
scripts/draw.mjs         선택지/방향 추첨, 다시 출력/추첨; --alternatives, --photos, --site
scripts/assets.mjs       공개 이미지 컬렉션(Openverse, Wikimedia Commons, Art Institute of
                         Chicago, Met) 검색 및 --video 사용 시 실제 영상(Wikimedia Commons,
                         Internet Archive, NASA) 검색; --get으로 출처와 함께 다운로드, --credits로 출력
scripts/lint.mjs         금지 패턴 및 상투 문구 정적 검사
scripts/inspect.mjs      렌더링, 측정, 스크린샷
scripts/lib/             의존성 없는 Chrome DevTools 클라이언트, 페이지 내 probe, 규칙
library/                 방향(20개), hero, 섹션, 타이포그래피 시스템, 팔레트, 사진, 연구 사이트, 모션
assets/base.css, base.js 선택적 중립 기반 파일
evals/evals.json         무 Skill 기준선과 비교하기 위한 평가 브리프 여섯 개
```

## 요구사항

`inspect.mjs`를 사용하려면 Node 22 이상과 Chrome, Edge 또는 Chromium이 설치되어 있어야 합니다(Node 내장 WebSocket으로 DevTools 프로토콜을 통해 브라우저를 제어하며 별도 설치 없음). `draw.mjs`, `lint.mjs`, `assets.mjs`는 Node 18 이상에서 실행합니다. `assets.mjs`에는 네트워크 연결이 필요하지만 API 키는 필요하지 않습니다. 브라우저가 일반적인 위치에 없다면 `CHROME_PATH`를 설정합니다.

## 설치

이 폴더를 예를 들어 `~/.claude/skills/design-taste-frontend/` 같은 Skills 디렉터리에 복사하거나 `.claude/skills/` 아래의 저장소에 둡니다.

## 참고

- 라이브러리의 사진은 Unsplash 라이선스에 따라 Lorem Picsum에서 제공합니다. 분위기 참고용 자리표시자이므로 프로젝트 사진으로 교체합니다.
- `assets.mjs`로 찾은 사진은 각자의 라이선스를 유지합니다. 기본적으로 CC0, public domain, CC BY, CC BY-SA만 제공합니다. `--get`은 다운로드한 각 파일의 제목, 제작자, 라이선스, 출처를 `assets/credits.json`에 기록합니다. 페이지에 출처를 표시해야 하며(`--credits`로 출력 가능)
- `assets.mjs --video`는 대상 세계의 짧은 클립을 찾아 720p 이하 버전을 받습니다. `--max-mb`를 전달하지 않으면 25MB보다 큰 파일은 거부하고, 각 클립의 포스터 프레임도 저장합니다. 페이지에서 사용하는 방법(음소거 반복, 포스터, 모션 감소 설정 때 정지)은 `references/imagery.md` §11에 있습니다.
- 글꼴은 Google Fonts와 Fontshare에서 불러옵니다. 각 글꼴의 라이선스가 사용 목적에 맞는지 확인합니다.
- `references/research.md`의 점수는 스크린샷을 바탕으로 모델이 판단한 결과이며 Awwwards 점수가 아닙니다.
- 추첨 이력은 `~/.taste-skill/history.json`에 저장합니다. 다른 위치를 쓰려면 `TASTE_SKILL_HISTORY`를 설정합니다. 초기화하려면 파일을 지웁니다.
- 전체 관찰 및 수정 흐름을 사용하는 빌드는 에이전트 작업 기준 약 30~45분, 수십만 토큰이 걸립니다. 프로젝트에 사진이 없으면 대부분은 사진을 찾거나 만드는 데 사용됩니다.
