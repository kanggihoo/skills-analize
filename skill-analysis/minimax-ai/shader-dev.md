# shader-dev 분석

## 원본

- 경로: `.agents/skills/shader-dev/SKILL.md`
- 성격: GLSL/WebGL2 기반 실시간 shader 효과 제작 스킬
- 주요 영역: ray marching, SDF, lighting, simulation, particles, procedural noise, post-processing

## 적용 조건

GLSL shader, ShaderToy 스타일 시각 효과, raymarched scene, fluid/smoke, particle, fractal, water, terrain, volumetric cloud, post-processing, WebGL2 debugging 요청에 사용한다.

## 동작 과정

1. 사용자의 요청을 technique routing table에 매핑한다.
   예를 들어 3D 수학 장면은 ray-marching + sdf-3d, fluid는 fluid-simulation + multipass-buffer, water는 water-ocean + atmospheric-scattering로 연결한다.

2. 관련 `techniques/` 파일을 읽는다.
   각 technique 파일에는 핵심 원리, 구현 단계, 코드 template가 있다.

3. 필요하면 `reference/` 파일을 추가로 읽는다.
   수학 유도나 고급 패턴이 필요할 때만 참조한다.

4. ShaderToy 스타일을 WebGL2로 변환한다.
   `#version 300 es`, `precision highp float`, `out vec4 fragColor`, `texture()`, `gl_FragCoord.xy`, `mainImage` wrapper 등을 적용한다.

5. standalone HTML을 구성한다.
   canvas full viewport, black background, no scrollbar, `iTime`, `iResolution`, `iMouse`, `iFrame` uniforms를 제공한다.

6. multi-pass가 필요하면 WebGL2 framebuffer ping-pong을 구성한다.

7. 성능 budget을 지킨다.
   ray marching step, volume sample, FBM octave, nested loop iteration 수를 제한한다.

8. shader debugging view를 활용한다.
   normals, step count, depth, UV, SDF bands, shadow/AO, material ID를 색으로 출력해 문제를 좁힌다.

## 핵심 규칙

- WebGL2에는 `fragCoord` 내장 변수가 없으므로 `gl_FragCoord.xy`를 쓴다.
- ShaderToy `mainImage`는 WebGL2 `main()`으로 감싸야 한다.
- GLSL 함수는 사용 전에 선언되어야 한다.
- `#define`에 함수 호출을 넣지 말고 `const`를 사용한다.
- script tag에서 shader source를 읽을 때 `#version`이 첫 문자여야 하므로 `.trim()`한다.
- `let/const` 변수는 TDZ 문제를 피하기 위해 script 상단에 선언한다.
- reserved word를 변수명으로 쓰지 않는다.
- ray marching main loop는 128 step 이하 등 성능 budget을 지킨다.

## 산출물 특성

결과물은 ShaderToy 호환 GLSL을 WebGL2 standalone HTML로 변환한 시각 효과다. 단일 fragment shader부터 multi-pass simulation까지 다룰 수 있다.

## 주의점

ShaderToy 코드를 그대로 브라우저 WebGL2에 붙이면 컴파일 오류가 많다. 이 스킬은 그 차이를 명시적으로 보정하는 데 중점을 둔다.
