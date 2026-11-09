# ffmpeg Recipes

Trim, 검사용 프레임, join, 스틸 이미지를 위한 처리 방법이다. 일상적인 웹 인코딩은 `encode.mjs`를 쓴다. 승인된 스토리를 보존한다. 국소적인 repair는 장면을 자르거나 페이싱을 바꿀 권한을 주지 않는다. 확인된 중복 끝점 하나를 제거하는 것은 로컬 join repair에 해당하며, 그때는 한 프레임의 타이밍 차이를 기록하고 명시적으로 요구된 정확한 runtime을 지킨다.

## Folder discipline

Raw render와 review 사본은 `review/`에 두고, 사용자의 원본은 `photos/`에 둔다. 완성된 웹용 파일만 `site/assets/`에 둔다. 사이트가 라이브 상태가 되고 남은 review가 모두 끝날 때까지 raw clip은 보관한다.

## The scrub encode

`node .10k/tools/encode.mjs <raw.mp4> site/assets [--mobile --focus 0.5] [--poster last|SECONDS]`를 사용한다(`engine.md` 참고). 기본 poster는 마지막 프레임이며, 이는 합성된 reveal과 일치한다. 의도적으로 승인된 대안이 있을 때만 명시적 timestamp를 쓴다.

이 도구는 키프레임 간격을 촘촘하게 하고, B-frame 없이, 오디오 없이, index를 앞쪽에 두는 방식으로 재인코딩하며, poster를 만들고 `<video>` 태그를 출력한다. 수동 대안은 다음과 같다:

```sh
ffmpeg -i review/hero-joined.mp4 -vf "scale='min(1920,iw)':-2" -an -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -r 30 -g 6 -keyint_min 6 -sc_threshold 0 -bf 0 -movflags +faststart site/assets/hero.mp4
```

Generation master는 delivery asset보다 품질이 높을 수 있다. 승인된 필름을 훼손하지 않으면서 최종 다운로드 파일을 최적화한다. gradient의 banding, particle의 breakup, 제품 디테일의 smearing을 검사한다. 한 번에 설정 하나만 바꾸고, 스크러빙하면서 검사한다. 파일 크기 상한을 맞추려고 내용을 조용히 삭제하지 말고, 실제 로딩 성능을 측정한다.

## Review playback and frames

일반 재생, 0.5배속, seek, 프레임 단위 이동이 가능한 신뢰할 수 있는 review player를 연다:

```sh
node .10k/tools/review.mjs review/hero-joined.mp4 --port 8081
```

영상 전체를 보고, 모든 join을 양방향으로 본다. Contact sheet는 review를 돕지만 연속성이나 페이싱을 증명하지는 못한다. 최종 wide 및 portrait encode에 대해서도 반복한다. Repair 전에 승인된 파일명과 duration을 기록한다.

6초짜리 clip의 경우 다음 명령은 검사용 샘플을 제공할 뿐, 완전한 영상 review가 아니다:

```sh
ffmpeg -ss 0 -i review/raw.mp4 -frames:v 1 -q:v 2 review/frame-start.jpg
ffmpeg -ss 3 -i review/raw.mp4 -frames:v 1 -q:v 2 review/frame-mid.jpg
ffmpeg -sseof -0.1 -i review/raw.mp4 -update 1 -frames:v 1 -q:v 2 review/frame-near-end.jpg
```

중복 끝점이나 ghosting을 검사할 때는 각 join 주변의 짧은 프레임 시퀀스를 추출한다. 알려진 join timestamp와 실제 frame rate를 사용한다. 두 프레임이 비슷해 보인다는 이유만으로 중복이라고 추론하지 않는다.

## Tail trims are a creative change

사용자가 더 일찍 끝내 달라고 요청하거나 제안된 ending repair를 승인했다면, 근처 후보를 검사해서 합성된 정지 프레임(steady frame)을 고른다. 승인된 trim의 예는 다음과 같다:

```sh
ffmpeg -i review/raw.mp4 -t 4.3 -c:v libx264 -crf 16 -an review/hero-trimmed.mp4
```

재인코딩하고, 최종 poster를 다시 생성하고, wide·short·phone viewport에서 header 아래에 보이는 새 정지 프레임을 검증한다. Duration이 바뀌면 스토리 비트가 스크롤 진행도에 대응하는 방식도 바뀐다. 밴드를 다시 조정하고 review한다. 엔진이 progress를 사용한다는 이유로 짧아진 클립이 영향이 없다고 설명하지 않는다.

Motion-difference curve는 정지 지점을 찾는 데 도움이 되지만 판단을 대신하지는 않는다. 피사체가 정지해 있어도 조명 변화만으로 점수가 높게 나올 수 있다:

```sh
ffmpeg -i review/raw.mp4 -vf "tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG" -f null -
```

## Full-quality chaining frames

다음 segment에 추출한 시작 이미지가 필요하면, 정확히 선택된 끝점에서 full-quality PNG를 사용한다. Review용 JPG는 이후 세대에 압축을 구워 넣는다. 마지막으로 디코딩된 프레임은 다음과 같이 추출한다:

```sh
ffmpeg -sseof -1 -i review/seg.mp4 -fps_mode passthrough -update 1 review/final.png
```

`openart.md`의 workflow에 따라 OpenArt에 업로드하기 전에, 추출한 프레임이 끝점과 일치하는지 검증한다. 공유 계획 키프레임을 쓰면 보통 이 rescue 단계를 생략할 수 있지만, 생성된 clip이 그 키프레임과 정확히 일치한다는 보장은 없다.

## Join with matched cuts first

RAW clip을 공통 크기, 종횡비, frame rate로 정규화한 뒤, 고품질 중간 파일로 join하고, 웹 인코딩은 한 번만 한다. 파라미터를 맞추면 기술적 불일치는 막을 수 있지만, 시각적 seam이 생기지 않는다는 뜻은 아니다.

공유 키프레임과 움직임이 뒷받침할 때는 matched hard cut으로 시작한다. 다음 예는 두 wide clip을 24 fps로 정규화한다:

```sh
filter="fps=24,scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,setsar=1,setpts=PTS-STARTPTS"
ffmpeg -i review/clip1-raw.mp4 -i review/clip2-raw.mp4 -filter_complex "[0:v]$filter[a];[1:v]$filter[b];[a][b]concat=n=2:v=1:a=0[v]" -map "[v]" -c:v libx264 -crf 16 -pix_fmt yuv420p -an review/hero-joined.mp4
node .10k/tools/encode.mjs review/hero-joined.mp4 site/assets --mobile --focus 0.5
```

실제 master에 맞는 해상도, 종횡비, rate를 사용한다. Portrait master를 wide 예제에 억지로 넣지 않는다. 다른 clip을 추가할 때는 정규화된 input을 하나 더 넣고 `concat`의 input 개수를 늘린다.

Frame 단위 review로 공유 끝점이 두 번 나타난다고 확인되면, 다음 clip에서 중복된 프레임만 정확히 제거한다. 정규화 후 concat 전에 해당 input에 `trim=start_frame=1,setpts=PTS-STARTPTS`를 적용한다. 이는 승인된 join 수정 안의 국소 repair이며, 한 프레임 변경을 기록한다. 사용자가 정확한 runtime을 명시적으로 요구하면, 적절한 정지 hold를 두어 보존하거나 변경에 대한 합의를 받는다. 나쁜 join을 가리기 위해 임의의 구간을 자르지 않는다. 모델이 표기한 5초라는 명목상 라벨을 믿지 말고, `ffprobe`로 실제 duration과 frame rate를 확인한다.

## Short blends only when they improve the join

Blend는 작은 끝점 불일치를 가릴 수 있지만, 피사체를 두 번 보이게 하거나, 디테일을 흐리게 하거나, 멈춤을 만들 수도 있다. Full playback과 양방향 프레임 step에서 matched cut과 비교한다. 깨끗하게 동작하는 가장 짧은 전환을 쓴다. 둘 다 통하지 않으면, 승인된 iteration 허용량 안에서 해당 clip을 repair한다.

정규화된 6초 input의 경우, 0.25초 blend는 5.75초에서 시작한다:

```sh
ffmpeg -i review/seg1-normalized.mp4 -i review/seg2-normalized.mp4 -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.25:offset=5.75[v]" -map "[v]" -c:v libx264 -crf 16 -pix_fmt yuv420p -an review/hero-joined.mp4
```

Offset은 측정한 첫 duration에서 blend duration을 뺀 값을 사용한다. Blend를 하나 추가할 때마다 전체 길이가 겹친 만큼 줄고, 체감 페이스가 바뀔 수 있다. 승인된 장면과 hold를 보존하고, 그 차이를 기록하고, 승인된 필름을 교체하기 전에 전체 결과를 review한다. 시청자가 seam을 못 본다고 가정하지 말고, crossfade가 항상 문제를 해결한다고 가정하지도 않는다.

## Web stills and posters

인코더는 기본적으로 portrait crop을 포함한 최종 reveal poster를 만든다. 실제 header와 최종 카피와 함께 검사한다. 앞쪽 프레임은 review용 에셋일 뿐이며, 합성된 reveal을 자동으로 대체하지 않는다.

섹션 이미지는 보통 렌더링된 크기에 가까운 WebP로 배포한다. 보통 약 1,600px 폭이며, 큰 full-bleed 처리에는 2,400px을 쓴다:

```sh
ffmpeg -i review/section-1.png -vf scale=1600:-2 -c:v libwebp -quality 82 site/assets/section-1.webp
```

이 FFmpeg 빌드에 `libwebp`가 없으면, 리사이즈 후 설치된 `cwebp`를 쓰거나 `cwebp -resize 1600 0 -q 82 review/section-1.png -o site/assets/section-1.webp`를 쓴다. 날카로운 경계를 가진 적합한 인터페이스 이미지에는 무손실 인코딩을 쓴다. 출력 파일이 존재하고, 정상적으로 열리고, 예상한 크기를 갖는지 확인하기 전에는 성공했다고 보고하지 않는다.

## Verify after every encode

사용하기 전에 실제 재생, 끝점, join, poster, 크기, duration, delivery 용량을 검사한다. 에셋을 교체한 뒤에는 타이밍, 대비, 휴대폰 crop이 바뀌었을 수 있으므로 사이트 전체를 다시 확인한다.
