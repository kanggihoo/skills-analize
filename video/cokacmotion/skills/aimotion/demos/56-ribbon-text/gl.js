/*
 * gl.js — small WebGL2 helpers for this demo: programs with a uniform-location map, render targets
 * (RGBA16F when the GPU can render to half floats), and a full-screen triangle pass.
 * Kept inside the demo folder on purpose: _lib/ is shared and not touched.
 */
export const QUAD_VS = `#version 300 es
layout(location = 0) in vec2 p;
out vec2 uv;
void main() { uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

export function createGL(gl) {
  const half = !!gl.getExtension('EXT_color_buffer_float');
  const tri = gl.createVertexArray();
  gl.bindVertexArray(tri);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(s) || '';
      const m = /0:(\d+)/.exec(log);
      const lines = src.split('\n');
      const ctx = m ? lines.slice(Math.max(0, +m[1] - 3), +m[1] + 2).map((l, i) => `${Math.max(1, +m[1] - 2) + i}: ${l}`).join('\n') : '';
      throw new Error('shader compile: ' + log + '\n' + ctx);
    }
    return s;
  }
  function program(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const name = gl.getActiveUniform(p, i).name;
      u[name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, name);
    }
    return { p, u };
  }
  function target(w, h) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, half ? gl.RGBA16F : gl.RGBA8, w, h, 0, gl.RGBA, half ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (!ok) throw new Error(`render target ${w}×${h} incomplete`);
    return { tex, fb, w, h };
  }
  function bind(rt) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, rt ? rt.fb : null);
    gl.viewport(0, 0, rt ? rt.w : gl.drawingBufferWidth, rt ? rt.h : gl.drawingBufferHeight);
  }
  function tex(unit, t, loc) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t && t.tex ? t.tex : t);
    gl.uniform1i(loc, unit);
  }
  /** full-screen pass of prog into rt (null = canvas); set(u) binds its uniforms */
  function pass(prog, rt, set) {
    bind(rt);
    gl.useProgram(prog.p);
    set(prog.u);
    gl.bindVertexArray(tri);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }
  return { gl, half, program, target, bind, tex, pass };
}
