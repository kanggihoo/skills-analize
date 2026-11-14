> AI 번역본. 원본: spec.md. 분석 근거는 원본이다.

# 스펙(spec)

기본 룩은 형용사가 있는 자리에 산다. "premium, modern, clean"이 주어지면 모델은 빈 자리를 자기 기본값으로 채우고, 그래서 매번 같은 모습이 나온다. 어두운 공허, 글로우, 가운데 떠 있는 작은 타입, 모든 것의 페이드인이 그렇다. 형용사 하나를 수치로 바꿀 때마다 그 기본값에게서 결정권을 되찾는다.

그래서 어떤 씬보다 먼저, 프로젝트 루트에 `SPEC.md`를 쓴다. 영상을 나 자신에게 주는 디렉터 브리프로 적되, 형용사를 쓰고 싶은 곳마다 수치를 쓴다. 이 스펙을 기준으로 만들고, 이 스펙에 맞춰 확인하며, 리뷰로 영상이 바뀌면 스펙도 바꾼다.

스펙은 스토리를 위해 있다. 그 반대가 아니다(`story.md`). 스토리 속 사물을 추상적인 도형으로 바꾸는 룩은, 프레임이 아무리 인상적이어도 실패한 것이다.

## 템플릿

```text
GOAL:    what the viewer feels or does at the end, one sentence
OUTPUT:  HyperFrames, W x H, fps
TIME:    seconds x fps = frames; BPM and frames per beat when there is music
LOOK:    ground (hex, texture and its amount), ink, one accent and where it may appear;
         display face + weight + size in px + tracking, body face the same;
         the medium (paper and ink, photographs, product UI, glass, clay, 3D studio) with its numbers;
         light and depth: shadow offset, blur and opacity, grain %, vignette %
OBJECTS: every thing the story needs the viewer to recognise (a mirror, a clock, a phone, a person),
         drawn with the material and details that make it read without a label: a mirror is
         silvered glass with a bright edge and a mount, not a bar
MOTION:  eases by role as named curves (enter, move, exit, camera); springs as damping ratio;
         durations and staggers in frames
SHOTS:   one line per shot: frame range, the one hero move, what the viewer reads (with its window),
         the sound, and how it hands off to the next shot
BANNED:  the defaults below, plus anything this film must not become
QA:      the frames to check, and what each must show
```

## 단어를 숫자로 바꾸기

| 단어      | 바뀌는 모습                                                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| premium   | 수치가 있는 재질: 2% 그레인의 새틴 종이, 접촉 그림자 0.55의 심리스 스윕 위 제품, 거칠기 0.05의 크롬                                       |
| modern    | 카메라와 타입 체계: 하나의 이징으로 30프레임 push, 프레임 높이의 9%에 -2% 트래킹을 준 디스플레이 서체                                     |
| clean     | 그리드와 절제: 12열, 96px 여백, 샷마다 한 단어에만 악센트                                                                                  |
| dynamic   | 비트에 맞춘 컷, 마디마다(4비트마다) 레이아웃 변화, 샷마다 히어로 움직임 하나                                                              |
| playful   | 위치와 크기에만 댐핑 0.45–0.6의 스프링(불투명도나 색에는 절대 안 씀), 포즈를 10–30% 과장                                                  |
| cinematic | 렌즈와 빛: 35mm 프레이밍, 왼쪽 위에서 오는 키 라이트, 뒤에서 오는 림 라이트, 6% 비네트                                                      |

## 구도 수치

- 샷의 히어로는 프레임 높이나 너비의 최소 40%를 채운다. 빈 프레임 가운데 있는 작은 사물은 샷이 될 수 없다. 밀고 들어가거나, 자르거나, 주변 세계를 준다.
- 샷마다 히어로 움직임은 하나만 둔다. 보조 움직임은 50–70%의 거리만 움직이고, 히어로보다 100–200ms 뒤에 시작한다. 나머지는 모두 가만히 있다.
- 스토리 영상에서는 모든 샷이 스토리를 한 칸 나아가게 한다. 어떤 일이 일어나서 다음 샷을 부른다. 대사는 슬로건이 아니라 원인과 결과로 읽혀야 한다("그래서…", "그러니까…").
- 정보 카드(토킹 헤드 위에 올린 B-roll, 데이터 비트, 세로형 설명 카드)는 다르다. 정보가 약 2.5초 안에 화면에 올라오고, 그 뒤로 멈춰 있어야 한다. 그래야 어느 일시정지 프레임이든 완성된 포스터처럼 보인다.
- 영상 전체에서 2–4초마다 새로운 무언가가 나와야 한다. 음악이 있으면 마디마다 새 레이아웃이 있어야 한다.
- 읽히려고 하는 텍스트는 1080 기준 최소 28px(짧은 변의 2.6%)이고, 단어당 0.5초 + 0.3초씩 유지한다. 단어가 너무 많으면 글자를 줄이지 말고 단어를 줄인다.

## 기본값으로 금지되는 것

아무것도 정하지 않았을 때 생성된 영상이 떨어지는 곳들이다. 브랜드 자체 소재나 사용자의 레퍼런스가 쓰는 경우에만, 그들이 쓰는 방식 그대로 허용한다:

- 어둡거나 짙은 네이비의 공허를 바탕으로 깔고, 작은 요소를 그 가운데에 띄우는 것;
- 글로우, 블룸, 네온, 렌즈 플레어, 빛나는 구슬과 고리, 장식으로 떠다니는 파티클;
- 보라색이나 파란색 그라데이션, 메시 그라데이션, 글래스 카드;
- 세리프 디스플레이, 이탤릭 악센트 단어, "01 / 02" 번호 라벨, 작은 모노스페이스 대문자 라벨, 알약 모양 칩과 버튼이 있는 크림이나 오프화이트 종이 바탕;
- 모든 것을 가운데 정렬하는 것; 모든 것이 한꺼번에 페이드인하는 것; 모든 요소가 페이드되며 위로 슬라이드하는 것;
- 읽는 동안 움직이는 텍스트; 자리 잡은 뒤에도 계속 떠다니는 제목;
- 장식으로 쓰는 모서리 라벨, 프레임 테두리, 모서리 브래킷, HUD 수치;
- 한 줄에 놓인 카드 세 장, KPI 그리드, 어둡게 처리한 스크린샷 위의 제목;
- 모서리에 붙은 로고.

첫 렌더 후에는 목록에 있든 없든, 실제로 쓰인 기본값을 모두 이름으로 적는다. 그리고 각각을 영상의 BANNED 줄에 추가한 뒤 고친다. 이 목록은 영상마다 늘어난다.

## 매체에서 만든 룩

룩은 팔레트가 아니라 한 매체의 규칙으로 만들 때 일관성이 생긴다. 예를 들어 리소그래프 룩은 다섯 부분으로만 이루어진다:

- **종이**: 섬유 노이즈가 있는 단색 하나, 그라데이션은 없다;
- **잉크 A**: 반드시 읽혀야 하는 모든 단어와 구조선;
- **잉크 B**: 형광 악센트 하나, 프레임마다 초점 하나(숫자, 막대, 도장);
- **오버프린트**: 두 잉크가 겹치는 곳에 세 번째 색이 생기며, B 판은 3px 어긋나게 찍힌다;
- **하프톤**: 모든 그라데이션은 점으로 찍힌다.

모션도 같은 매체에서 나온다. 프레임은 페이드인하는 것이 아니라, 판 하나하나를 찍어 나간다. 어떤 룩이든 이런 식으로 적는다. 부품이 무엇인지, 각 부품이 무엇을 담을 수 있는지, 그리고 매체 자체가 어떻게 움직이는지를 적는다(종이는 잘려서 들리고, 잉크는 찍히고, 유리는 빛을 굴절시키고, 점토는 눌려 찍힌다).
