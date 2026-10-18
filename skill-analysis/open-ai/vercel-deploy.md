# vercel-deploy 분석

## 원본

- 원본 경로: `.agents/skills/vercel-deploy/`
- 핵심 파일: `SKILL.md`
- 보조 파일: `scripts/deploy.sh`, `agents/openai.yaml`, `assets/`
- 확인한 규모: 6개 파일, 약 421줄
- 성격: Vercel preview deployment를 수행하고 URL을 사용자에게 반환하는 실행형 배포 스킬

## 적용 조건

이 스킬은 사용자가 앱이나 웹사이트를 Vercel에 배포해 달라고 할 때 동작한다.

대표 요청은 다음과 같다.

- Vercel에 deploy 해줘
- preview deployment 만들어줘
- live URL 줘
- 이 앱을 배포해서 링크 알려줘
- production 배포를 명시적으로 요청한 경우

## 기본 원칙

가장 중요한 규칙은 기본 배포가 production이 아니라 preview라는 점이다. 사용자가 명시적으로 production을 요청한 경우에만 `--prod`를 사용한다.

또한 `command -v vercel` 같은 설치 여부 확인은 권한 상승 없이 실행하고, 실제 deploy가 sandbox 네트워크 문제로 실패했을 때만 권한 상승을 고려한다.

## 동작 과정

1. Vercel CLI 설치 여부를 확인한다.
   `command -v vercel`로 확인하며 이 단계는 escalated permission 없이 수행한다.

2. CLI가 있으면 preview deploy를 실행한다.
   기본 명령은 `vercel deploy [path] -y`이며, build 시간이 길 수 있으므로 10분 timeout이 필요하다.

3. 사용자가 production을 명시한 경우만 production deploy를 실행한다.
   명령은 `vercel deploy [path] --prod -y`다.

4. CLI가 없거나 인증 오류가 나면 fallback script를 사용한다.
   fallback은 `.agents/skills/vercel-deploy/scripts/deploy.sh`다.

5. fallback script는 프로젝트를 tarball로 패키징하고 claimable deploy endpoint로 전송한다.
   응답 JSON에서 `previewUrl`, `claimUrl`, `deploymentId`, `projectId`를 받는다.

6. 사용자에게 deployment URL을 보여준다.
   fallback 배포의 경우 claim URL도 함께 보여줘야 한다.

7. 배포된 URL을 `curl`로 검증하지 않는다.
   `SKILL.md`가 명시적으로 “Do not curl or fetch the deployed URL to verify it works”라고 규정한다.

## fallback deploy.sh 동작

`scripts/deploy.sh`는 계정 인증 없이 claimable deployment를 만들기 위한 fallback이다.

주요 흐름은 다음과 같다.

1. 입력을 받는다.
   인자가 없으면 현재 디렉토리, 인자가 있으면 directory 또는 `.tgz` tarball로 처리한다.

2. 프로젝트 framework를 감지한다.
   `package.json`의 dependency를 문자열 검색해 Next.js, Gatsby, Remix, Astro, SvelteKit, Nuxt, Angular, Vite, Express, Hono 등 여러 framework slug를 결정한다.

3. 임시 디렉토리를 만든다.
   `mktemp -d`로 staging directory와 tarball path를 만들고, `trap cleanup EXIT`로 종료 시 정리한다.

4. directory 입력이면 source tree를 staging으로 복사한다.
   `node_modules`, `.git`, `.env`, `.env.*`는 제외한다.

5. package.json이 없는 static HTML 프로젝트면 root의 단일 HTML 파일을 `index.html`로 rename할 수 있다.

6. staging directory를 `.tgz`로 압축한다.

7. `https://codex-deploy-skills.vercel.sh/api/deploy` endpoint에 multipart form으로 tarball과 framework를 전송한다.

8. 응답에 error가 있으면 stderr로 출력하고 실패한다.

9. `previewUrl`과 `claimUrl`을 추출한다.

10. preview URL을 polling한다.
    5초 간격으로 최대 60회 확인한다. 200이면 준비 완료, 5xx면 계속 build 중으로 판단, 4xx는 앱이 응답한다고 보고 준비 완료로 처리한다.

11. 마지막에 원본 JSON 응답을 stdout으로 출력한다.

## 핵심 규칙

- 기본은 preview deployment다.
- production은 사용자가 명시적으로 요청한 경우에만 한다.
- Vercel CLI 설치 확인은 권한 상승하지 않는다.
- deploy network call이 sandbox 문제로 실패했을 때만 escalated permission을 요청한다.
- CLI 인증 오류나 CLI 부재 시 fallback script를 사용한다.
- fallback 결과에는 preview URL과 claim URL을 모두 보여준다.
- 배포 URL을 fetch/curl로 검증하지 않는다.

## 산출물 특성

정상 산출물은 다음과 같다.

- Vercel preview URL
- fallback 사용 시 claim URL
- fallback JSON 응답의 deployment metadata
- production 명시 요청 시 production deployment URL

## 주의점

- fallback script는 `.env`와 `.env.*`를 제외해 배포 패키지에 비밀값이 들어가지 않도록 한다.
- framework detection은 `package.json` 문자열 기반이므로 복잡한 monorepo에서는 path를 정확히 지정해야 한다.
- fallback endpoint는 외부 네트워크에 의존한다.
- deploy는 시간이 오래 걸릴 수 있으므로 timeout을 짧게 잡으면 안 된다.
- `agents/openai.yaml`의 default prompt는 “Vercel deployment를 만들고 URL을 공유”하는 UI 메타데이터이며, 실제 실행 흐름은 `SKILL.md`와 `deploy.sh`가 정의한다.
