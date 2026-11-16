# hyperframes-cli는 에이전트에게 어떤 순서로 명령을 쓰게 하나? {#hyperframes-cli-page}

`hyperframes-cli`는 에이전트가 `npx hyperframes` 명령을 작업별로 고르게 하고, lint → check → snapshot → preview → render 순서로 확인하게 한다. 사용자가 preview에서 보고 승인하기 전에는 render하지 않는다.[](source:s-l4)[](source:p-render-note) 부분 분석이다. 스킬 밖 reference 4개를 읽지 않았다.

- 명령 이름을 외우게 하지 않고 작업별 표로 묶는다. 표의 각 행은 읽을 reference를 가리킨다.[](source:s-table)[](source:s-refs)
- check는 오류 0건이어야 통과하고, 에이전트는 snapshot의 PNG를 직접 읽어 영상을 본다.[](source:s-l2)[](source:s-l3)
- 타임라인 편집은 `--plan`으로 미리 보고, 모든 쓰기는 history로 되돌릴 수 있다.[](source:s-tl2)[](source:s-hist)
- 렌더 위치는 local이 기본이고 Docker, batch, cloud, Lambda, Cloud Run은 필요가 있을 때 고른다.[](source:s-wtable)

@answer scope="원문 분석 · 폴더 13개 파일 · 명령 미실행"
@meta locale=ko repo_url=https://github.com/kanggihoo/skills-analize repo_revision=3a759297764c8a3d0993ac558b0502acfccd81f9
@source skill title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md
@source init title="hyperframes/hyperframes-cli/references/init-and-scaffold.md · 6792B · init, capture, skills 명령 안내(원본)" path=hyperframes/hyperframes-cli/references/init-and-scaffold.md
@source lint title="hyperframes/hyperframes-cli/references/lint-validate-inspect.md · 20082B · lint, check, snapshot 안내(원본)" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md
@source compare title="hyperframes/hyperframes-cli/references/compare-and-batch.md · 4378B · compare, grade-compare, render --batch 안내(원본)" path=hyperframes/hyperframes-cli/references/compare-and-batch.md
@source beats title="hyperframes/hyperframes-cli/references/beats.md · 992B · beats 명령 안내(원본)" path=hyperframes/hyperframes-cli/references/beats.md
@source preview title="hyperframes/hyperframes-cli/references/preview-render.md · 36764B · preview, play, render, share, publish 안내(원본)" path=hyperframes/hyperframes-cli/references/preview-render.md
@source doctor title="hyperframes/hyperframes-cli/references/doctor-browser.md · 4411B · doctor, browser 안내(원본)" path=hyperframes/hyperframes-cli/references/doctor-browser.md
@source cloud title="hyperframes/hyperframes-cli/references/cloud.md · 13024B · auth, cloud, 변수 안내(원본)" path=hyperframes/hyperframes-cli/references/cloud.md
@source lambda title="hyperframes/hyperframes-cli/references/lambda.md · 17907B · AWS Lambda 렌더 안내(원본)" path=hyperframes/hyperframes-cli/references/lambda.md
@source cloudrun title="hyperframes/hyperframes-cli/references/cloudrun.md · 3553B · Google Cloud Run 렌더 안내(원본)" path=hyperframes/hyperframes-cli/references/cloudrun.md
@source misc title="hyperframes/hyperframes-cli/references/upgrade-info-misc.md · 11866B · info, upgrade, timeline, docs, usage 등 안내(원본)" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md
@source conv title="hyperframes/hyperframes-cli/references/conventions.md · 2092B · CLI 관례(원본)" path=hyperframes/hyperframes-cli/references/conventions.md
@source feedback title="hyperframes/hyperframes-cli/references/feedback.md · 2539B · feedback 보고 규칙(원본)" path=hyperframes/hyperframes-cli/references/feedback.md
@source skill-ko title="hyperframes/hyperframes-cli/SKILL.KO.md · 9279B · 한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/SKILL.KO.md
@source init-ko title="hyperframes/hyperframes-cli/references/init-and-scaffold.KO.md · 8233B · 한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/init-and-scaffold.KO.md
@source lint-ko title="hyperframes/hyperframes-cli/references/lint-validate-inspect.KO.md · 24282B · 한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.KO.md
@source compare-ko title="hyperframes/hyperframes-cli/references/compare-and-batch.KO.md · 5108B · 한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/compare-and-batch.KO.md
@source beats-ko title="hyperframes/hyperframes-cli/references/beats.KO.md · 1224B · 한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/beats.KO.md
@source preview-ko title="hyperframes/hyperframes-cli/references/preview-render.KO.md · 40281B · 한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/preview-render.KO.md
@source doctor-ko title="hyperframes/hyperframes-cli/references/doctor-browser.KO.md · 5126B · 한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/doctor-browser.KO.md
@source cloud-ko title="hyperframes/hyperframes-cli/references/cloud.KO.md · 14857B · 한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/cloud.KO.md
@source lambda-ko title="hyperframes/hyperframes-cli/references/lambda.KO.md · 19755B · 한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/lambda.KO.md
@source cloudrun-ko title="hyperframes/hyperframes-cli/references/cloudrun.KO.md · 4198B · 한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/cloudrun.KO.md
@source misc-ko title="hyperframes/hyperframes-cli/references/upgrade-info-misc.KO.md · 13856B · 한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.KO.md
@source conv-ko title="hyperframes/hyperframes-cli/references/conventions.KO.md · 2626B · 한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/conventions.KO.md
@source feedback-ko title="hyperframes/hyperframes-cli/references/feedback.KO.md · 3241B · 한국어 번역본(읽기용, 근거 아님)" path=hyperframes/hyperframes-cli/references/feedback.KO.md
@source s-front title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=1:4
@source s-beacon title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=6:8
@source s-run title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=12:12
@source s-notice title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=14:14
@source s-table title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=18:29
@source s-captions title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=31:31
@source s-deprec title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=33:33
@source s-l1 title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=37:37
@source s-l2 title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=38:38
@source s-l3 title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=39:39
@source s-l4 title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=40:40
@source s-l5 title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=41:41
@source s-ctx title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=43:43
@source s-tl1 title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=47:49
@source s-tl2 title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=50:50
@source s-tl3 title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=51:51
@source s-tl4 title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=52:52
@source s-hist title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=56:58
@source s-histtag title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=54:54
@source s-wtable title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=64:70
@source s-detach title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=72:72
@source s-fb title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=74:74
@source s-fail title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=78:85
@source s-refs title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=89:103
@source s-clean title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=85:85
@source i-init title="hyperframes/hyperframes-cli/references/init-and-scaffold.md · 6792B · init, capture, skills 명령 안내(원본)" path=hyperframes/hyperframes-cli/references/init-and-scaffold.md lines=19:29
@source i-tw title="hyperframes/hyperframes-cli/references/init-and-scaffold.md · 6792B · init, capture, skills 명령 안내(원본)" path=hyperframes/hyperframes-cli/references/init-and-scaffold.md lines=31:36
@source i-capture title="hyperframes/hyperframes-cli/references/init-and-scaffold.md · 6792B · init, capture, skills 명령 안내(원본)" path=hyperframes/hyperframes-cli/references/init-and-scaffold.md lines=54:71
@source i-skills title="hyperframes/hyperframes-cli/references/init-and-scaffold.md · 6792B · init, capture, skills 명령 안내(원본)" path=hyperframes/hyperframes-cli/references/init-and-scaffold.md lines=75:75
@source l-intro title="hyperframes/hyperframes-cli/references/lint-validate-inspect.md · 20082B · lint, check, snapshot 안내(원본)" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=3:3
@source l-disc title="hyperframes/hyperframes-cli/references/lint-validate-inspect.md · 20082B · lint, check, snapshot 안내(원본)" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=7:13
@source l-flags title="hyperframes/hyperframes-cli/references/lint-validate-inspect.md · 20082B · lint, check, snapshot 안내(원본)" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=31:44
@source l-craft title="hyperframes/hyperframes-cli/references/lint-validate-inspect.md · 20082B · lint, check, snapshot 안내(원본)" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=50:55
@source l-audio title="hyperframes/hyperframes-cli/references/lint-validate-inspect.md · 20082B · lint, check, snapshot 안내(원본)" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=56:63
@source l-sev title="hyperframes/hyperframes-cli/references/lint-validate-inspect.md · 20082B · lint, check, snapshot 안내(원본)" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=68:68
@source l-hatch title="hyperframes/hyperframes-cli/references/lint-validate-inspect.md · 20082B · lint, check, snapshot 안내(원본)" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=70:77
@source l-contrast title="hyperframes/hyperframes-cli/references/lint-validate-inspect.md · 20082B · lint, check, snapshot 안내(원본)" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=88:88
@source l-motion title="hyperframes/hyperframes-cli/references/lint-validate-inspect.md · 20082B · lint, check, snapshot 안내(원본)" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=108:115
@source l-snap title="hyperframes/hyperframes-cli/references/lint-validate-inspect.md · 20082B · lint, check, snapshot 안내(원본)" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=129:131
@source l-storage title="hyperframes/hyperframes-cli/references/lint-validate-inspect.md · 20082B · lint, check, snapshot 안내(원본)" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=139:141
@source l-depr title="hyperframes/hyperframes-cli/references/lint-validate-inspect.md · 20082B · lint, check, snapshot 안내(원본)" path=hyperframes/hyperframes-cli/references/lint-validate-inspect.md lines=157:164
@source c-compare title="hyperframes/hyperframes-cli/references/compare-and-batch.md · 4378B · compare, grade-compare, render --batch 안내(원본)" path=hyperframes/hyperframes-cli/references/compare-and-batch.md lines=32:34
@source c-grade title="hyperframes/hyperframes-cli/references/compare-and-batch.md · 4378B · compare, grade-compare, render --batch 안내(원본)" path=hyperframes/hyperframes-cli/references/compare-and-batch.md lines=63:70
@source c-batch title="hyperframes/hyperframes-cli/references/compare-and-batch.md · 4378B · compare, grade-compare, render --batch 안내(원본)" path=hyperframes/hyperframes-cli/references/compare-and-batch.md lines=95:105
@source b-req title="hyperframes/hyperframes-cli/references/beats.md · 992B · beats 명령 안내(원본)" path=hyperframes/hyperframes-cli/references/beats.md lines=3:15
@source p-url title="hyperframes/hyperframes-cli/references/preview-render.md · 36764B · preview, play, render, share, publish 안내(원본)" path=hyperframes/hyperframes-cli/references/preview-render.md lines=16:26
@source p-ctx title="hyperframes/hyperframes-cli/references/preview-render.md · 36764B · preview, play, render, share, publish 안내(원본)" path=hyperframes/hyperframes-cli/references/preview-render.md lines=30:38
@source p-ctxfail title="hyperframes/hyperframes-cli/references/preview-render.md · 36764B · preview, play, render, share, publish 안내(원본)" path=hyperframes/hyperframes-cli/references/preview-render.md lines=58:66
@source p-play title="hyperframes/hyperframes-cli/references/preview-render.md · 36764B · preview, play, render, share, publish 안내(원본)" path=hyperframes/hyperframes-cli/references/preview-render.md lines=76:78
@source p-render-note title="hyperframes/hyperframes-cli/references/preview-render.md · 36764B · preview, play, render, share, publish 안내(원본)" path=hyperframes/hyperframes-cli/references/preview-render.md lines=102:102
@source p-flags title="hyperframes/hyperframes-cli/references/preview-render.md · 36764B · preview, play, render, share, publish 안내(원본)" path=hyperframes/hyperframes-cli/references/preview-render.md lines=123:125
@source p-quality title="hyperframes/hyperframes-cli/references/preview-render.md · 36764B · preview, play, render, share, publish 안내(원본)" path=hyperframes/hyperframes-cli/references/preview-render.md lines=124:124
@source p-docker title="hyperframes/hyperframes-cli/references/preview-render.md · 36764B · preview, play, render, share, publish 안내(원본)" path=hyperframes/hyperframes-cli/references/preview-render.md lines=137:143
@source p-summary title="hyperframes/hyperframes-cli/references/preview-render.md · 36764B · preview, play, render, share, publish 안내(원본)" path=hyperframes/hyperframes-cli/references/preview-render.md lines=153:153
@source p-fb title="hyperframes/hyperframes-cli/references/preview-render.md · 36764B · preview, play, render, share, publish 안내(원본)" path=hyperframes/hyperframes-cli/references/preview-render.md lines=159:188
@source p-publish title="hyperframes/hyperframes-cli/references/preview-render.md · 36764B · preview, play, render, share, publish 안내(원본)" path=hyperframes/hyperframes-cli/references/preview-render.md lines=199:199
@source p-where title="hyperframes/hyperframes-cli/references/preview-render.md · 36764B · preview, play, render, share, publish 안내(원본)" path=hyperframes/hyperframes-cli/references/preview-render.md lines=203:203
@source p-share title="hyperframes/hyperframes-cli/references/preview-render.md · 36764B · preview, play, render, share, publish 안내(원본)" path=hyperframes/hyperframes-cli/references/preview-render.md lines=209:225
@source d-doctor title="hyperframes/hyperframes-cli/references/doctor-browser.md · 4411B · doctor, browser 안내(원본)" path=hyperframes/hyperframes-cli/references/doctor-browser.md lines=9:33
@source d-sandbox title="hyperframes/hyperframes-cli/references/doctor-browser.md · 4411B · doctor, browser 안내(원본)" path=hyperframes/hyperframes-cli/references/doctor-browser.md lines=34:45
@source d-ffmpeg title="hyperframes/hyperframes-cli/references/doctor-browser.md · 4411B · doctor, browser 안내(원본)" path=hyperframes/hyperframes-cli/references/doctor-browser.md lines=49:59
@source d-browser title="hyperframes/hyperframes-cli/references/doctor-browser.md · 4411B · doctor, browser 안내(원본)" path=hyperframes/hyperframes-cli/references/doctor-browser.md lines=73:78
@source cl-use title="hyperframes/hyperframes-cli/references/cloud.md · 13024B · auth, cloud, 변수 안내(원본)" path=hyperframes/hyperframes-cli/references/cloud.md lines=12:17
@source cl-auth title="hyperframes/hyperframes-cli/references/cloud.md · 13024B · auth, cloud, 변수 안내(원본)" path=hyperframes/hyperframes-cli/references/cloud.md lines=21:35
@source cl-size title="hyperframes/hyperframes-cli/references/cloud.md · 13024B · auth, cloud, 변수 안내(원본)" path=hyperframes/hyperframes-cli/references/cloud.md lines=51:68
@source cl-flags title="hyperframes/hyperframes-cli/references/cloud.md · 13024B · auth, cloud, 변수 안내(원본)" path=hyperframes/hyperframes-cli/references/cloud.md lines=85:104
@source cl-vars title="hyperframes/hyperframes-cli/references/cloud.md · 13024B · auth, cloud, 변수 안내(원본)" path=hyperframes/hyperframes-cli/references/cloud.md lines=116:118
@source cl-wait title="hyperframes/hyperframes-cli/references/cloud.md · 13024B · auth, cloud, 변수 안내(원본)" path=hyperframes/hyperframes-cli/references/cloud.md lines=130:143
@source cl-retry title="hyperframes/hyperframes-cli/references/cloud.md · 13024B · auth, cloud, 변수 안내(원본)" path=hyperframes/hyperframes-cli/references/cloud.md lines=157:163
@source la-use title="hyperframes/hyperframes-cli/references/lambda.md · 17907B · AWS Lambda 렌더 안내(원본)" path=hyperframes/hyperframes-cli/references/lambda.md lines=28:31
@source la-pre title="hyperframes/hyperframes-cli/references/lambda.md · 17907B · AWS Lambda 렌더 안내(원본)" path=hyperframes/hyperframes-cli/references/lambda.md lines=35:37
@source la-deploy title="hyperframes/hyperframes-cli/references/lambda.md · 17907B · AWS Lambda 렌더 안내(원본)" path=hyperframes/hyperframes-cli/references/lambda.md lines=51:60
@source la-foot title="hyperframes/hyperframes-cli/references/lambda.md · 17907B · AWS Lambda 렌더 안내(원본)" path=hyperframes/hyperframes-cli/references/lambda.md lines=108:108
@source la-batch title="hyperframes/hyperframes-cli/references/lambda.md · 17907B · AWS Lambda 렌더 안내(원본)" path=hyperframes/hyperframes-cli/references/lambda.md lines=135:142
@source la-destroy title="hyperframes/hyperframes-cli/references/lambda.md · 17907B · AWS Lambda 렌더 안내(원본)" path=hyperframes/hyperframes-cli/references/lambda.md lines=159:166
@source cr-use title="hyperframes/hyperframes-cli/references/cloudrun.md · 3553B · Google Cloud Run 렌더 안내(원본)" path=hyperframes/hyperframes-cli/references/cloudrun.md lines=3:9
@source cr-life title="hyperframes/hyperframes-cli/references/cloudrun.md · 3553B · Google Cloud Run 렌더 안내(원본)" path=hyperframes/hyperframes-cli/references/cloudrun.md lines=23:25
@source cr-batch title="hyperframes/hyperframes-cli/references/cloudrun.md · 3553B · Google Cloud Run 렌더 안내(원본)" path=hyperframes/hyperframes-cli/references/cloudrun.md lines=56:62
@source m-info title="hyperframes/hyperframes-cli/references/upgrade-info-misc.md · 11866B · info, upgrade, timeline, docs, usage 등 안내(원본)" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=13:13
@source m-upgrade title="hyperframes/hyperframes-cli/references/upgrade-info-misc.md · 11866B · info, upgrade, timeline, docs, usage 등 안내(원본)" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=19:26
@source m-timeline title="hyperframes/hyperframes-cli/references/upgrade-info-misc.md · 11866B · info, upgrade, timeline, docs, usage 등 안내(원본)" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=35:35
@source m-nesting title="hyperframes/hyperframes-cli/references/upgrade-info-misc.md · 11866B · info, upgrade, timeline, docs, usage 등 안내(원본)" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=49:50
@source m-docs title="hyperframes/hyperframes-cli/references/upgrade-info-misc.md · 11866B · info, upgrade, timeline, docs, usage 등 안내(원본)" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=85:87
@source m-bench title="hyperframes/hyperframes-cli/references/upgrade-info-misc.md · 11866B · info, upgrade, timeline, docs, usage 등 안내(원본)" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=98:98
@source m-tele title="hyperframes/hyperframes-cli/references/upgrade-info-misc.md · 11866B · info, upgrade, timeline, docs, usage 등 안내(원본)" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=108:108
@source m-asset title="hyperframes/hyperframes-cli/references/upgrade-info-misc.md · 11866B · info, upgrade, timeline, docs, usage 등 안내(원본)" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=124:126
@source m-usage title="hyperframes/hyperframes-cli/references/upgrade-info-misc.md · 11866B · info, upgrade, timeline, docs, usage 등 안내(원본)" path=hyperframes/hyperframes-cli/references/upgrade-info-misc.md lines=130:134
@source cv-doctor title="hyperframes/hyperframes-cli/references/conventions.md · 2092B · CLI 관례(원본)" path=hyperframes/hyperframes-cli/references/conventions.md lines=3:8
@source cv-clean title="hyperframes/hyperframes-cli/references/conventions.md · 2092B · CLI 관례(원본)" path=hyperframes/hyperframes-cli/references/conventions.md lines=12:13
@source cv-shader title="hyperframes/hyperframes-cli/references/conventions.md · 2092B · CLI 관례(원본)" path=hyperframes/hyperframes-cli/references/conventions.md lines=14:14
@source cv-upload title="hyperframes/hyperframes-cli/references/conventions.md · 2092B · CLI 관례(원본)" path=hyperframes/hyperframes-cli/references/conventions.md lines=16:17
@source f-after title="hyperframes/hyperframes-cli/references/feedback.md · 2539B · feedback 보고 규칙(원본)" path=hyperframes/hyperframes-cli/references/feedback.md lines=3:9
@source f-more title="hyperframes/hyperframes-cli/references/feedback.md · 2539B · feedback 보고 규칙(원본)" path=hyperframes/hyperframes-cli/references/feedback.md lines=11:14
@source plugin-rel title="hyperframes/hyperframes-cli/SKILL.md · 7573B · 스킬 본문(원본)" path=hyperframes/hyperframes-cli/SKILL.md lines=6:6

## 이 스킬은 언제 켜지고, 사람은 어디서 개입하나? {#activation}

description은 모델이 호출 여부를 판단할 때 참고하는 설명이다. 특정 단어가 있어야 켜진다는 뜻은 아니다. 호출을 막는 `disable-model-invocation` 필드는 front matter에 원문에 명시 없음이다.[](source:s-front)

@code source=s-front language=yaml

원문은 이 스킬이 다루는 일을 scaffold, frame 확인, timeline 편집, preview, render, share, project history로 든다. JSON 결과를 읽고 실패에서 복구하는 일도 포함한다.[](source:s-front)

- 에이전트는 `npx hyperframes <command>`를 실행한다. 프로젝트가 wrapper를 주면 wrapper를 쓴다.[](source:s-run)
- 이 CLI는 Node.js 22+와 FFmpeg가 필요하다.[](source:s-run)
- 모든 명령에 `--help`가 있고 대부분 `--json`을 받는다.[](source:s-run)
- 실패하면 `✗ …`와 `Fix:` 줄을 출력하고 non-zero로 끝난다.[](source:s-run)

HyperFrames plugin 안에서는 `../hyperframes/references/plugin-installation.md`의 plugin execution rules를 따른다. 이 파일은 스킬 밖이라 읽지 않았다.[](source:plugin-rel)

판정 · 원문은 "실패하면 non-zero"라고 하지만 예외가 있다. `doctor --json`은 항상 0으로 끝나서 payload의 `ok`로 판단한다.[](source:cv-doctor) `auth status`는 로그인하지 않은 offline 상태에서 1로 끝나며 명령 실패가 아니다.[](source:cl-auth) `lambda render-batch --json`은 일부 항목이 시작에 실패해도 0으로 끝나서 모든 행의 `status`를 확인해야 한다.[](source:la-batch)

| 사람이 개입하는 지점 | 에이전트가 하는 일 | 근거 |
| --- | --- | --- |
| `--json` 결과에 `_meta.updateNotice`가 있을 때 | 새 HyperFrames release가 나왔다는 사실을 대화당 한 번, 자기 말로, 자연스러운 멈춤 지점에 전한다. 업데이트 여부는 사람이 정한다. | [](source:s-notice) |
| preview를 열 때 | `preview --background`로 띄우고 URL이 200을 주는지 확인한 뒤 project URL을 건네고 기다린다. 사람이 파일을 요청했거나 멈추지 말라고 했을 때만 기다리지 않는다. | [](source:s-l4) |
| 사용자가 "이 요소"처럼 가리킬 때 | `preview --context --json --context-fields selection`을 실행한다. `no-selection`이면 사람에게 요소를 클릭해 달라고 요청한다. | [](source:s-ctx)[](source:p-ctxfail) |
| 스킬 설치와 갱신 | `init`에 항상 `--skip-skills`를 붙인다. 스킬 설치는 사람의 일이라, 빠진 core skill이 있으면 `npx hyperframes skills update`를 안내만 하고 직접 돌리지 않는다. | [](source:i-init)[](source:i-skills) |
| cloud 로그인 | `auth login`은 OAuth로 브라우저를 연다. 사람이 로그인해야 한다. | [](source:cl-auth) |
| 영상 공유 범위 | `share --public`은 사람이 링크를 가진 누구나 보게 하자고 명시했을 때만 쓴다. `--yes`는 공개 범위 동의가 아니다. | [](source:p-share) |
| 공개 repro 게시 | `feedback --file-issue`는 동의가 있을 때만 쓴다. 최소 repro를 공개 URL에 올린다. | [](source:f-after) |
| 자체 클라우드 인프라 | Lambda와 Cloud Run은 사람이 자체 AWS 또는 GCP 인프라를 명시적으로 원할 때만 쓴다. | [](source:la-use)[](source:cr-use) |
| 유료 plan의 cloud render가 거절되거나 실패할 때 | 로컬에서 render하고 이유를 사람에게 알린다. | [](source:cl-use) |
| macOS agent sandbox가 Chrome 시작을 막을 때 | 막힌 사실을 밝히고 check를 통과한 composition을 전달한다. 대체 rasterizer를 만들지 않는다. | [](source:d-sandbox) |
| harness 사용량 확인 | `usage --json` 결과를 알린다. 범위와 workflow 선택은 사람에게 둔다. | [](source:m-usage) |

## 명령은 작업별로 어떻게 묶이고, 무엇을 쓰지 말라고 하나? {#commands}

에이전트는 명령 이름이 아니라 작업을 먼저 정하고 표에서 명령을 고른다. 마지막 열은 그 명령을 실행하기 전에 읽으라고 지정된 reference다.[](source:s-table)[](source:s-refs)

| 작업 | 명령 | 먼저 읽을 reference |
| --- | --- | --- |
| 시작 | `init <dir> --skip-skills`(빈 프로젝트. `--example <name>`은 사람이 요청했을 때만), `capture <url>` | `init-and-scaffold.md`[](source:s-table) |
| 프로젝트 읽기 | `info`, `compositions`, `timeline --json`, `docs <topic>` | `upgrade-info-misc.md`[](source:s-refs) |
| 검사 | 작성 중에는 `lint`, 통과 조건으로는 `check --json` | `lint-validate-inspect.md`[](source:s-table) |
| 눈으로 보기 | `snapshot`(`--at`, `--range START,END`, `--composition <id>`, `--zoom`, `--angle`, `--against <video>`), `keyframes`, `compare`, `audio` | `lint-validate-inspect.md`, `compare-and-batch.md`, `../hyperframes/references/motion.md`[](source:s-refs) |
| 타임라인 편집 | `timeline`의 `move`, `trim`, `split`, `set`, `duplicate`, `delete`, `apply`, `undo`, `ids` | `upgrade-info-misc.md`[](source:s-table) |
| 재사용 | `catalog`, `add`(`/hyperframes-registry`) | 스킬 밖[](source:s-table) |
| media와 소리 | `media-treatment`, `grade-compare`, `remove-background`, `tts`, `transcribe`, `beats`, `normalize-audio`(`/media-use`) | `compare-and-batch.md`, `beats.md`[](source:s-refs) |
| 보여 주고 내보내기 | `preview`, `present`(`/slideshow`), `render`, `share`, `publish`(legacy), `cloud`, `lambda`, `cloudrun` | `preview-render.md`, `cloud.md`, `lambda.md`, `cloudrun.md`[](source:s-refs) |
| desktop app | `open`, `catch-up` | 원문에 명시 없음[](source:s-table) |
| 유지보수 | `doctor`, `browser`, `upgrade`, `usage`, `clean`, `feedback` | `doctor-browser.md`, `upgrade-info-misc.md`, `conventions.md`, `feedback.md`[](source:s-refs) |

`captions`는 명령이 아니다. `transcribe`를 실행한 뒤 `../hyperframes/references/captions.md`를 읽는다.[](source:s-captions)

@callout level=warning title="쓰지 말라고 한 명령"
| `validate`, `inspect`, `layout`은 `check`의 deprecated alias다. 지금도 동작하지만 stderr에 deprecation notice를 찍고 `--json`에 `_meta.deprecated: true`를 넣는다. 원문은 "Don't run them"이라고 쓰고, 스크립트는 단일 `check` 호출로 옮기라고 한다.[](source:s-deprec)[](source:l-depr) `events`는 skills 자체 telemetry 명령이라 같은 문장에서 실행 금지 대상에 든다. 같은 SKILL.md 8행은 이 스킬이 시작할 때 `npx hyperframes events --skill=hyperframes-cli`를 한 번 실행하라고 해서 두 지시가 충돌한다. 우선순위는 원문에 명시 없음이다.[](source:s-beacon)[](source:s-deprec) |

references 12개가 각각 정하는 것은 아래 표와 같다.

| 파일 | 정하는 것 |
| --- | --- |
| `init-and-scaffold.md` | `init` 기본값(TTY에서는 wizard, 비TTY에서는 centered blank), 해상도 preset, `--skip-skills` 항상 사용, Tailwind v4 runtime 규칙, `capture`의 hard stop 조건(non-zero, `ok: false`, `BLOCKED.md`)과 새 `-o` 폴더 재시도, `skills`는 사람의 일회성 설정.[](source:i-init)[](source:i-tw)[](source:i-capture)[](source:i-skills) |
| `lint-validate-inspect.md` | `lint`는 반복 중 정적 확인, `check`는 필수 최종 gate. runtime, layout, motion, contrast, craft, audio 검사, `*.motion.json` assertion, `snapshot` 옵션과 보관 정책, deprecated 3종.[](source:l-intro)[](source:l-flags)[](source:l-motion)[](source:l-snap) |
| `compare-and-batch.md` | `compare`(최대 16 variant)와 `grade-compare`(후보 최대 16개)는 시각 검토용이고 gate가 아니다. `render --batch`의 입력 형식, 동시성, manifest.[](source:c-compare)[](source:c-grade)[](source:c-batch) |
| `beats.md` | 프로젝트의 music `<audio>`에서 Studio용 beat file을 만든다. 일정한 박이 없으면 실패하고 아무것도 쓰지 않는다.[](source:b-req) |
| `preview-render.md` | `preview`의 URL 형식과 Studio selection bridge, `play`, `render` 플래그와 품질 단계, feedback reproduction packet, `publish`와 `share`의 차이.[](source:p-url)[](source:p-ctx)[](source:p-flags)[](source:p-fb)[](source:p-share) |
| `doctor-browser.md` | `doctor`가 보는 항목과 실패별 조치, FFmpeg 경로 환경변수, 고정된 Chrome을 관리하는 `browser`.[](source:d-doctor)[](source:d-ffmpeg)[](source:d-browser) |
| `cloud.md` | HeyGen cloud render의 인증 우선순위, 7단계 pipeline, 200 MB 업로드 한도와 `.hyperframesignore` 절차, 옵션, 변수, webhook, 안전한 재시도.[](source:cl-auth)[](source:cl-size)[](source:cl-flags)[](source:cl-retry) |
| `lambda.md` | 자체 AWS 배포·렌더·batch·destroy 절차와 재시도하지 말아야 할 오류, IAM 정책 검증.[](source:la-deploy)[](source:la-batch)[](source:la-destroy) |
| `cloudrun.md` | 자체 GCP 배포·렌더·JSONL batch 절차와 `--strict-variables` 한계.[](source:cr-life)[](source:cr-batch) |
| `upgrade-info-misc.md` | `info`, `upgrade`, `timeline`의 출력 구조, `compositions`, `docs`, `benchmark`, telemetry, 자산 전처리 명령, `usage`.[](source:m-info)[](source:m-upgrade)[](source:m-timeline)[](source:m-usage) |
| `conventions.md` | 에이전트·CI에서 `--json` 선호, `doctor` 판정법, `clean` 범위, `--strict` 계열, shader lint 대응, 업로드 한도 초과 대응.[](source:cv-doctor)[](source:cv-clean)[](source:cv-shader)[](source:cv-upload) |
| `feedback.md` | 검증된 render 뒤 `feedback --rating` 한 번, 기능 부재와 host app 문제는 rating 없는 보고, 공개 채널이므로 절대 경로 제거.[](source:f-after)[](source:f-more) |

## 작업 루프는 어떤 순서로 돌고, 무엇이 통과 조건인가? {#loop}

@workflow id=work-loop title="작업 루프"
| write | HTML 쓰기 | frontend |
| lint | lint | backend |
| check | check --json | backend |
| clean | 오류 0건? | backend |
| snap | snapshot | backend |
| prev | preview 전달 | external |
| ok | 사람 승인? | external |
| render | render | backend |
| verify | 출력 확인 | backend |
| write > lint | |
| lint > check | |
| check > clean | |
| clean > write | 오류 있음 |
| clean > snap | 통과 | emphasis |
| snap > prev | |
| prev > ok | |
| ok > render | 승인 | emphasis |
| render > verify | |

@steps id=loop-steps
| write | HTML 쓰기 | 에이전트가 composition을 쓴다. [](source:s-l1) | work-loop | write |
| lint | lint | 첫 작성 뒤와 구조를 바꾼 뒤에 실행한다. 반복 중 정적 확인용이고 별도 최종 gate가 아니다.[](source:s-l1)[](source:l-disc) | work-loop | lint |
| check | check --json | 오류를 모두 고친다. lint 오류가 남아 있으면 layout과 contrast 검사가 돌지 않고, "0 samples"는 아무것도 검사하지 않았다는 뜻이다.[](source:s-l2) | work-loop | check |
| clean | 오류 0건? | 한 sample에서만 보이는 문제(진행 중인 entrance)는 info다. 3 s 이상 영상이 전혀 변하지 않으면 `sweep_static`으로 실패한다.[](source:s-l2)[](source:l-sev) | work-loop | clean |
| snap | snapshot | PNG를 읽는다. `.hyperframes/artifacts/snapshots/`에 쌓이고, 이것이 에이전트가 영상을 보는 방법이다. sub-composition이 있으면 모든 scene의 중간 시점을 찍는다.[](source:s-l3) | work-loop | snap |
| prev | preview 전달 | `preview --background`, URL이 200인지 확인, project URL 전달 후 대기.[](source:s-l4) | work-loop | prev |
| ok | 사람 승인? | 검사 통과만으로는 render할 이유가 되지 않는다. 사람이 파일을 요청했거나 멈추지 말라고 했을 때는 예외다.[](source:s-l4)[](source:p-render-note) | work-loop | ok |
| render | render | `render --quality looks -o out.mp4`. 반복 중에는 `draft`, 최종본은 `delivery`.[](source:s-l5) | work-loop | render |
| verify | 출력 확인 | 파일이 비어 있지 않고 `ffprobe` duration이 root의 `data-duration`과 맞는지 확인한 뒤 decode된 frame을 본다.[](source:s-l5) | work-loop | verify |

원문은 승인을 받지 못했을 때 어느 단계로 돌아가는지 원문에 명시 없음이라 그림에서 그 간선을 뺐다.

단계별 통과 조건과 수치는 아래 표와 같다.

| 검사 | 통과 조건·기준 | 단위·적용 조건 |
| --- | --- | --- |
| `check` 기본 sampling | sample 9개, 허용 overflow 2 px, render-ready와 navigation 최소 timeout 3000 / 10000 ms. 옵션 `--samples`, `--tolerance`, `--timeout`으로 바꾼다.[](source:l-flags) | 기본값이며 의무가 아니다 |
| `sweep_static` | 3 s 이상 composition이 모든 sample에서 변하지 않으면 실패한다. 멈춰 있는 GSAP, CSS, Web animation은 seek가 페이지를 움직이지 못한다는 신호다.[](source:l-sev) | 의도한 정지 영상은 root에 `data-no-timeline`을 둔다 |
| contrast | 일반 글자 4.5:1, 큰 글자(24 px+ 또는 bold 19 px+) 3:1. 실패는 error이고 `suggestedColor`를 준다.[](source:l-contrast)[](source:s-l2) | WCAG AA, 5개 grid point 표본 |
| motion sidecar | `appearsBy`, `before`, `staysInFrame`, `keepsMoving`. `keepsMoving`은 `maxStaticSec` 기본 2 s를 넘는 정지 구간을 실패로 본다. 마지막 3 s는 세지 않는다.[](source:l-motion) | `*.motion.json`이 있을 때만 |
| craft 경고 | `line_unread`(30 px+ 글줄이 1~2단어면 0.4 s 미만), `dead_stretch`(3 s 초과 무변화, 마지막 3 s 제외), `text_below_floor`(1080 기준 28 px 미만 글자가 0.5 s 이상), `first_frame_empty`, `film_silent`(15 s 초과 영상에 소리 없음).[](source:l-craft) | 항상 warning이며 `--strict`에서도 실패하지 않는다 |
| audio | `audio_source_unreadable`, `audio_source_rejected`는 error이고 render가 멈춘다. `audio_src_not_found`는 `lint`가 error로 낸다.[](source:l-audio) | remote 음원은 가져오지 않는다 |
| `render` 확인 | non-empty 파일, `ffprobe` duration과 `data-duration` 일치.[](source:s-l5) | 모든 로컬 render |

판정 · 원문은 `lint`를 루프 1단계로 두면서 reference에서는 `check` 바로 앞에 중복 `lint`를 두지 말라고 쓴다. 두 문장은 "첫 작성 뒤 한 번, 이후 구조 변경 때"로 읽으면 양립하지만 어느 쪽이 우선인지는 원문에 명시 없음이다.[](source:s-l1)[](source:l-intro)

판정 · 에이전트가 레이아웃 오류를 자동 판정에만 맡기지 않게 하는 장치가 있다. 원문은 PNG를 먼저 보고 경고를 조정하라고 하고, 의도한 겹침은 `data-layout-allow-*` 속성으로 표시하라고 한다.[](source:l-disc)[](source:l-hatch)

## 타임라인은 어떤 규칙으로 고치고, 기록은 어떻게 지키나? {#edit-history}

타임라인 편집은 Studio가 하는 편집과 같은 명령이라 결과가 Studio 형식을 유지한다.[](source:s-tl1)

| 규칙 | 에이전트가 하는 일 |
| --- | --- |
| clip 찾기 | `timeline --json`이 `absStart`, `absEnd`, 소유 `file`, 편집 명령이 받는 `#id` ref를 준다. id가 없으면 `timeline ids`가 채운다.[](source:s-tl1) |
| 미리 보기 | `timeline move`, `trim`, `split`, `set`, `duplicate`, `delete`에 `<ref> … --plan --json`을 붙여 한 편집을 미리 보고, `--plan` 없이 다시 실행한다. `--start`, `--end`, `--duration`이 한쪽 끝이나 길이를 정한다.[](source:s-tl2) |
| overlap 거부 | 이웃 clip과 겹치거나 composition 끝을 넘으면 편집이 거부된다. 겹침은 `--overwrite`를 쓰거나 이웃을 먼저 옮긴다.[](source:s-tl3) |
| `data-duration` | 끝을 넘는 편집이면 root의 `data-duration`을 먼저 키운다. 이 값을 바꾸는 명령은 없다.[](source:s-tl3) |
| 여러 편집 | `[{"verb": "move", "ref": "#outro", "time": "9"}]` 같은 JSON 파일을 `timeline apply plan.json --json`으로 실행한다.[](source:s-tl4) |
| receipt와 undo | 실행마다 `receipt`가 출력된다. 저장해 두면 `timeline undo receipt.json`이 되돌린다.[](source:s-tl4) |

`timeline`은 브라우저 없이 파일을 정적으로 읽는다. 한 단계 중첩만 읽고, sub-composition 안의 sub-composition은 `children=unread`로 표시되며 그 안의 clip은 세지 않는다.[](source:m-timeline)[](source:m-nesting)

project history는 아래 규칙을 따른다.

모든 쓰기는 기록되고 되돌릴 수 있다. 에이전트는 turn을 시작할 때 `history begin --who <you> --label "<plan>"`을 실행하고 `history --since mine --who <you>`로 사람이 바꾼 것을 읽은 뒤 그 위에 만든다. check가 실패했거나 사람이 나빠졌다고 하면 `history undo --who <you>`를 쓰고, 손으로 되돌리지 않는다.

turn은 `history end`로 끝낸다.[](source:s-hist)

이 절은 원문에서 "history (trial)" 주석 안에 들어 있고, 명령과 함께 지우라고 적혀 있어 시험 중인 기능이다.[](source:s-histtag)

@callout level=warning title=".hyperframes는 지우지 않는다"
| `.hyperframes`에는 history도 들어 있다. 디스크가 부족하면 `clean --dry-run`으로 목록을 본 뒤 `clean`을 실행한다.[](source:s-clean) `clean`은 죽은 render가 남긴 것과 다시 만들어지는 cache를 지우고, output, 원본, 실행 중인 render가 쓰는 것은 건드리지 않는다.[](source:cv-clean) |

managed snapshot 폴더는 최근 10개를 유지하고, 24시간 이내이거나 활성인 것도 보존한다. 의도한 before/after 증거는 이 저장소 밖에 복사한다. `clean --snapshots`는 snapshot 증거를 지우므로 필요 없을 때만 쓴다.[](source:l-storage)

## 어디서 render하고, 실패하면 어떻게 하나? {#render-fail}

| 필요 | 명령 | 고르는 조건 |
| --- | --- | --- |
| 로컬 | `render --quality looks -o out.mp4`(`draft`, `delivery`) | 기본. 작성 중 반복에 가장 빠르다.[](source:s-wtable)[](source:cl-use) |
| 재현 가능한 container | `render --docker --strict -o out.mp4` | 호스트가 달라도 같은 출력이 필요할 때.[](source:s-wtable)[](source:p-docker) |
| 변수 batch | `render --batch rows.json -o "renders/{name}.mp4"` | 행마다 변수 집합이 다른 template 출력. `--variables`와 함께 쓰지 못한다.[](source:s-wtable)[](source:c-batch) |
| HeyGen hosted | `cloud render` | 로컬 Chrome과 FFmpeg 없이 render. "클라우드에서 render"의 기본 답이다.[](source:s-wtable)[](source:cl-use) |
| 자체 AWS, GCP | `lambda render`, `cloudrun render` | 사람이 해당 클라우드 소유를 명시했을 때만. Lambda는 긴 영상, 4K, 큰 병렬 batch에 쓴다.[](source:s-wtable)[](source:la-use)[](source:cr-use) |

유료 plan이면 사람이 받는 최종 render는 `cloud render --fps <data-fps> --quality high -o <path>`다. `auth status`가 `Billing: HyperFrames`와 Free가 아닌 plan을 보여 줄 때 해당한다. Free에서는 사람이 요청하지 않으면 로컬에서 render한다. 소수 frame rate이거나 16:9, 9:16, 1:1이 아닌 frame은 로컬에서 render한다.[](source:cl-use)

| 수치 | 값 | 조건 |
| --- | --- | --- |
| 30 s 영화 render | 1~2분 | 원문의 예상이며 측정값이 아니다. 이 정도면 foreground로 돌리고, tool timeout보다 길 때만 detach한다.[](source:s-detach) |
| 품질 단계 | `draft`, `looks`(기본, CRF 16), `delivery`(= `high`), `standard`, `high` | 로컬 `--quality`.[](source:p-quality) |
| fps | 60 fps는 render 시간을 두 배로 한다. Lambda와 Cloud Run은 24, 25, 30, 60만 받는다. | `--fps` 1~240 또는 `30000/1001` 같은 유리수.[](source:p-flags) |
| cloud 업로드 | 압축 파일 200 MB 한도. `cloud render <project> --dry-run --json`으로 크기를 먼저 본다. | 한도 초과일 때 큰 파일을 무작정 ignore하지 않는다.[](source:cl-size) |
| cloud 4K | 1.5배 과금. 4K는 webm, mov와 함께 쓰지 못한다. | `--resolution 4k`.[](source:cl-flags) |
| cloud 대기 | poll 간격 2 s, 최대 대기 60분 | 기본값. `--no-wait`로 즉시 반환.[](source:cl-wait) |
| Lambda 기본값 | concurrency 8, memory 10240 MB, chunk 240 frames, 병렬 chunk 16, batch 동시 실행 50 | `--concurrency`, `--memory`, `--chunk-size`, `--max-parallel-chunks`, `--max-concurrent`.[](source:la-deploy)[](source:la-batch) |
| Cloud Run batch | 동시 실행 기본 50 | `--max-concurrent`.[](source:cr-batch) |
| 로컬 `--batch` | 동시성 기본 1 | `--batch-concurrency`.[](source:c-batch) |

render를 detach하는 방법은 `HYPERFRAMES_RENDER_DETACHED=1`, 별도 process group, log 파일 출력이다. 종료는 `until grep -qE 'Render (complete|failed)' render.log; do sleep 5; done`으로 기다리고 `pgrep -f`는 쓰지 않는다. `pgrep -f`는 자기 loop와 일치해 tool timeout까지 기다리게 만든다.[](source:s-detach)

render를 검증한 뒤에는 `feedback --rating`을 한 번 보낸다. 사람이 요청했는데 HyperFrames가 못 하는 일은 `MISSING FEATURE:` 보고를 따로 보낸다. telemetry를 껐거나 사람이 거부했으면 보내지 않는다. 보고는 공개 채널로 가므로 절대 경로와 사용자 식별자를 지운다.[](source:s-fb)[](source:f-after)[](source:f-more)

명령이 실패하면 증상별로 아래 조치를 한다.

| 증상 | 조치 | 근거 |
| --- | --- | --- |
| Chrome이 없거나 시작하지 않는다 | `npx hyperframes browser ensure`. `doctor --json`은 항상 0으로 끝나므로 `.ok`로 판단한다. | [](source:s-fail)[](source:d-doctor) |
| 무거운 페이지가 제때 준비되지 않는다 | `check`나 `snapshot`의 `--timeout`을 올린다. | [](source:s-fail) |
| 특이한 codec이 빈 화면으로 보인다 | `--proxy`를 켜 둔다(기본값). | [](source:s-fail) |
| Linux에서 render가 느리다 | 요약 둘째 줄에 `screenshot`과 `software gpu`가 보이면 느린 경로다. `--debug`로 경로를 알아내지 않는다. | [](source:s-fail)[](source:p-summary) |
| `capture`가 실패하거나 `BLOCKED.md`를 쓴다 | 부분 파일에서 아무것도 가져오지 않고, 새 `-o` 폴더로 다시 시도한다. | [](source:s-fail)[](source:i-capture) |
| 디스크가 부족하다 | `clean --dry-run` 뒤 `clean`. `.hyperframes`는 지우지 않는다. | [](source:s-fail) |
| FFmpeg가 없다 | `brew install ffmpeg`나 패키지 관리자로 설치하거나 `HYPERFRAMES_FFMPEG_PATH`, `HYPERFRAMES_FFPROBE_PATH`로 경로를 준다. project 폴더 안의 binary는 자동으로 쓰지 않는다. | [](source:d-doctor)[](source:d-ffmpeg) |
| 메모리가 부족하다 | 다른 Chrome을 닫고 `--workers`를 줄이거나 `--quality draft`를 쓴다. worker 하나가 Chrome 하나(약 256 MB)를 띄운다. | [](source:d-doctor)[](source:p-docker) |
| Lambda에서 `ChromeBinaryUnavailableError`, `FFMPEG_VERSION_MISMATCH`, `PLAN_HASH_MISMATCH`가 보인다 | 같은 `lambda render`를 다시 던지지 않는다. 새 실행 환경을 만들거나 `lambda deploy`를 다시 한다. | [](source:la-destroy) |
| `lambda render --width 3840 --height 2160`이 1080p로 나온다 | composition의 `data-width`가 1920이면 flag가 layout에 무시된다. `--output-resolution 4k`를 쓴다. | [](source:la-foot) |
| `cloudrun render-batch`에 `--strict-variables`를 줬다 | flag는 받지만 행을 검증하지 않는다. 보내기 전에 JSONL 변수 객체를 schema로 직접 검증한다. | [](source:cr-batch) |
| cloud 업로드가 크기 한도 오류를 낸다 | dry-run으로 큰 파일을 본다. 참조를 모든 HTML, CSS, JS에서 검색해 확인한 뒤에만 `.hyperframesignore`에 좁은 경로를 추가한다. `index.html`, 선택한 composition, font, 이미지, 오디오, 비디오, script는 크다는 이유로 ignore하지 않는다. | [](source:cl-size)[](source:cv-upload) |
| cloud 업로드를 재시도해야 한다 | upload는 idempotent하지 않아 맹목적 재시도가 중복 asset과 이중 과금을 만든다. `--idempotency-key`를 준다. | [](source:cl-retry) |

판정 · 원문은 Lambda 상태 파일 `<cwd>/.hyperframes/lambda-stack-<name>.json`처럼 `.hyperframes` 안에 사람의 인프라 정보까지 둔다. 삭제 금지 규칙은 history 때문이라고 적혀 있지만 이 파일들도 같은 폴더에 있다.[](source:la-destroy)[](source:s-clean)

## 이 스킬은 흐름 어디에 있고 무엇을 주고받나? {#position}

묶음 `build-video`에서 `hyperframes-cli`는 단계 역할이다. 앞에는 `hyperframes`(안내)가 있고, 명령표의 일부가 `hyperframes-registry`와 `media-use`를 가리킨다.

@workflow id=position-flow title="build-video 안의 위치"
| before | hyperframes | external | source:s-run |
| current | hyperframes-cli | backend | source:s-table |
| reg | hyperframes-registry | external | source:s-table |
| media | media-use | external | source:s-table |
| before > current | R01 참고 | emphasis |
| current > reg | R09 참고 | dashed |
| current > media | R10 참고 | dashed |

@steps id=position-steps
| highlight | hyperframes-cli | 이 페이지의 스킬이다. 명령 사용법과 확인 루프를 맡는다. 다른 스킬을 자동 호출하지 않는다. | position-flow | current |

| 관계 | 받는 것·넘기는 것·조건 |
| --- | --- |
| R01 · 참고, R29 · 참고 | 원장에 따르면 `hyperframes`가 명령 실행법을 이 스킬로 안내한다. 의무 표현은 없다. 이 스킬은 `npx hyperframes <command>` 실행법을 준다.[](source:s-run) |
| R09 · 참고 | 명령표의 `catalog`, `add`를 `/hyperframes-registry`로 연결한다. 이 스킬은 두 명령의 사용법을 풀어 쓰지 않는다.[](source:s-table) |
| R10 · 참고 | `media-treatment`, `tts` 등 media 명령을 `/media-use`로 연결한다.[](source:s-table) |
| R11 · 참고 | `present`를 `/slideshow`로 연결한다.[](source:s-table) |
| R12 · 참고 | `captions`는 명령이 아니므로 `transcribe`를 실행한 뒤 `../hyperframes/references/captions.md`를 읽는다. `keyframes`는 `../hyperframes/references/motion.md`를 읽는다.[](source:s-captions)[](source:s-refs) |
| R13 · 참고 | HyperFrames plugin 안일 때만 `../hyperframes/references/plugin-installation.md`의 plugin execution rules를 따른다.[](source:plugin-rel) |
| R27 · 공유 상태 | 이 스킬은 `.hyperframes/` history를 `hyperframes` CLI로 쓰고 지우지 않는다. 원장에 따르면 `hyperframes` 스킬도 변경 전에 `history --since mine`으로 사람의 변경을 읽는다. 상태는 CLI가 관리하며, 이 설명은 지시상 동작이다.[](source:s-hist)[](source:s-clean) |

R11, R12, R13, R27은 선후 순서가 아니라 참고나 공유 상태라 workflow 그림에서 뺐다. 전체 흐름은 색인 기준 `_group-build-video/build-video.html`에 있다.

## 어디까지 읽고 확인했나? {#audit}

| 조사 구분 | 확인 범위 |
| --- | --- |
| 읽은 텍스트 파일 | 13개를 끝까지 읽었다. `SKILL.md` 1개와 `references/` 12개이며 합계 131,973B다.[](source:skill)[](source:preview)[](source:lint)[](source:lambda)[](source:cloud)[](source:misc)[](source:init)[](source:compare)[](source:doctor)[](source:cloudrun)[](source:conv)[](source:feedback)[](source:beats) |
| 부분 읽음 | 0개. 전부 처음부터 끝까지 읽었다. |
| 제외한 파일 | `*.KO.md` 번역본 13개(합계 152,066B)는 열지 않았다. 분석 근거는 원본이다. |
| 바이너리 | 이미지, 음원, 영상, 폰트 모두 0개. |
| 읽지 않은 스킬 밖 참조 | `../hyperframes/references/plugin-installation.md`, `captions.md`, `motion.md`, `format.md` 4개. 이 스킬이 지목하지만 이 분석 범위 밖이라 부분 분석이다. |
| 대조한 것 | 원문의 활성화 설명, 사람 개입 11개 지점, 금지 명령, 루프 단계와 통과 조건, 타임라인 규칙, history, 렌더 위치 6가지, 실패 증상 6개와 reference의 추가 증상, 수치. |

@callout level=open-question title="확인하지 못한 항목"
| 스킬의 지시를 읽고 분석했을 뿐 `npx hyperframes`를 한 번도 실행하지 않았다. 따라서 `check`의 실제 출력, 30 s 영화의 1~2분 render 시간, preview URL 동작은 검증하지 않았다. `events`를 시작 때 한 번 실행하라는 8행과 실행하지 말라는 33행의 우선순위는 원문에 없다. `cloud.md` 165행의 docs 경로 `/deploy/cloud`, `/packages/cli#hyperframes-cloud`는 외부 문서라 읽지 않았다. `publish`의 60일 안내 기간은 시작일이 정해지지 않았다고 적혀 있어 종료 시점을 알 수 없다.[](source:s-deprec)[](source:s-beacon)[](source:p-share) |

분석 중 바뀐 파일은 없다. 스킬 폴더는 분석 시작과 끝에 `git status`가 깨끗했다. 원문에 있는 명령과 설치, 로그인, 공개 게시는 실행하지 않았다.
