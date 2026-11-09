# The Launch Kit: Brand Assets, the Launch Report, and the Client Kit

## Brand kit (every build, end of Phase 8)

웹사이트 폴더에서 실행한다:
```sh
node .10k/tools/brand.mjs site --name "Your Business" --tagline "One line about what you do" \
  --bg "#f4efe6" --ink "#241d16" --accent "#b5652e" --image site/assets/hero-poster.webp [--logo site/assets/logo.svg] [--font fonts/Display.ttf]
```
이 명령은 favicon, app icon, web manifest, `og.jpg`(링크를 공유할 때 보이는 이미지)를 쓰고, `<head>` 태그를 출력한다. `og.jpg`는 직접 확인한다. 이름이 읽혀야 하고, 사진은 브랜드의 가장 좋은 프레임이어야 한다. 로고가 없으면 브랜드 색으로 모노그램을 그린다. 사용자가 로고를 보냈다면 SVG로 저장한다(단순한 마크는 깔끔한 SVG path로 직접 옮긴다). 또는 PNG를 넘긴다. `--font`에는 display font의 .ttf 또는 .otf 파일을 넣어, 공유 이미지에 브랜드의 고유 타입을 쓰게 한다(Google Fonts에서 다운로드할 수 있다).

## Search basics (every build)

- 모든 페이지에서: `<title>`은 65자 미만, meta description은 50자 이상 160자 이하, `<html>`에 `lang`, `<h1>`은 정확히 하나, 의미 있는 모든 이미지에 alt 텍스트, canonical link가 있어야 한다.
- 홈페이지에는 맞는 가장 구체적인 타입을 골라 JSON-LD로 구조화된 비즈니스 데이터를 넣는다: `Hotel`, `Restaurant`, `Store`, `Dentist`, `LegalService`, `HomeAndConstructionBusiness`, `ProfessionalService`, `LocalBusiness`. 이름, 설명, 주소, 전화번호, 영업시간, 가격대, 그리고 실제인 경우 `sameAs` 소셜 링크를 포함한다. 어떤 값도 지어내지 않는다.
- Canonical, hreflang, og 주소는 전체 `https://` 주소여야 한다. DEPLOY STEP 주석 위치에서 채워 넣는다.
- 주소가 확정되면 `node .10k/tools/report.mjs site review --seo https://their-domain.com --seo-only`를 실행해 `sitemap.xml`과 `robots.txt`를 쓴다.

## The launch report (after going live, Phase 10)

```sh
node .10k/tools/report.mjs https://their-domain.com review
```
이 명령은 휴대폰과 데스크톱에 대해 Lighthouse를 실행한다(한 번 설치하며, 약 170 MB). Speed, Accessibility, Best practices, SEO 점수와 페이지별 search basics를 출력한다. 리포트가 지목한 90점 미만 항목을 고친다(보통 이미지 크기, 대비, 누락된 label). 다시 배포하고 다시 실행한다. 그다음 사용자를 위해 브라우저에서 `review/lighthouse-mobile.report.html`을 연다. 기술 점수는 창작 품질 및 실제 이메일 수신 여부와 분리해서 다룬다. 점수가 높다고 독특한 디자인이나 정상 동작하는 이메일을 증명하지는 않는다. 점수는 실행마다 달라지므로, 측정된 결과를 보고하고 100점을 약속하지 않는다. 리포트는 라이브 robots 규칙, robots meta, noindex 응답 헤더도 확인한다. Googlebot 제한은 따로 점검한다. Lighthouse SEO가 통과해도, 호스팅이 업로드된 robots를 덮어쓸 수 있다. 미리보기 도메인의 인덱싱 제한은 공개해야 할 한계이지, 승인 없이 도메인을 구매할 이유가 아니다.

## Client mode (Phase 2 asks: your business, or a client's?)

사이트가 고객을 위한 것이면 세 가지가 달라진다:
1. **The preview link.** 고객이 도메인 비용을 내기 전에, 빌더가 실제 링크를 공유할 수 있도록 적격한 임시 Hostinger 주소를 쓴다(`deploy.md`의 Address and deployment package 참고). 기존 게시 승인 절차를 따른다. 고객이 승인하면 고객의 도메인을 연결한다.
2. **Ownership.** 고객의 호스팅과 도메인은 고객 본인의 Hostinger 계정에 있어야 한다. Hostinger가 지원하면 빌더를 collaborator로 추가한다. 이를 분명히 말한다: 고객이 사이트를 소유한다.
3. **The client kit**, Phase 10 마지막에 만든다. 디자인 패키지와 plan 파일로 `.10k/kit.json`을 작성한다(형식은 `tools/kit.mjs` 상단에 있다). 그다음 다음을 실행한다:
```sh
node .10k/tools/kit.mjs .10k/kit.json site client-kit
```
이 명령은 `client-kit/brand-guide.pdf`(색상, 타입, 말투, 단어, 사진 스타일, 공유 이미지)와 `client-kit/handover.pdf`(주소, 소유 항목, 갱신, 수정 요청 방법, 포함되지 않은 항목)를 PNG 미리보기와 함께 쓴다. 사용자에게 보여주기 전에 두 미리보기를 모두 확인한다. Kit은 `site/` 밖에 있으며 온라인에 올리지 않는다.

## Private backend and local tooling

백엔드를 서빙하거나 Lighthouse를 실행하지 않고 sitemap/robots만 생성하려면 `--seo-only`를 쓴다. 안전한 로컬 서버는 PHP, 비공개 폴더, dotfile, 상위 경로 이탈을 차단한다. PHP 문의함을 실행할 수는 없다. 최종 보고에는 라이브 URL을 쓴다. 로컬 리포트, 도구 의존성, 비공개 설정을 미리보기 산출물로 게시하지 않는다. 브랜드 이미지 렌더링이 제공된 폰트를 무시하면, 생성된 이미지를 확인한다. 대체 폰트를 조용히 배포하지 말고, 프로젝트 로컬 font renderer를 설정하거나 지원되는 폰트 파일을 사용한다.
