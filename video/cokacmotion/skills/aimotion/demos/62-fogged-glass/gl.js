/*
 * gl.js — a small WebGL2 kit for this demo (kept in the demo folder: _lib/ is shared and not touched).
 * Programs with auto-discovered uniforms, textures, render targets, full-screen passes, GPU copies.
 */
export const FS_VERT = `#version 300 es
layout(location = 0) in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

export function glKit(gl) {
  if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('EXT_color_buffer_float missing (float render targets)');
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
      const lines = src.split('\n').map((l, i) => `${i + 1}: ${l}`);
      const m = /0:(\d+)/.exec(log);
      throw new Error('shader compile: ' + log + '\n' + (m ? lines.slice(Math.max(0, +m[1] - 3), +m[1] + 2).join('\n') : ''));
    }
    return s;
  }
  function program(fs, vs = FS_VERT) {
    const p = gl.createProgram();
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
    const U = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      U[info.name.replace(/\[0\]$/, '')] = { loc: gl.getUniformLocation(p, info.name), type: info.type, size: info.size };
    }
    return { p, U };
  }
  const SAMPLERS = new Set([gl.SAMPLER_2D, gl.SAMPLER_3D, gl.SAMPLER_2D_ARRAY]);
  function uniforms(prog, vals) {
    let unit = 0;
    for (const k in vals) {
      const u = prog.U[k];
      if (!u) continue;
      const v = vals[k];
      if (SAMPLERS.has(u.type)) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, v && v.tex ? v.tex : v);
        gl.uniform1i(u.loc, unit++);
        continue;
      }
      switch (u.type) {
        case gl.FLOAT: u.size > 1 ? gl.uniform1fv(u.loc, v) : gl.uniform1f(u.loc, v); break;
        case gl.FLOAT_VEC2: gl.uniform2fv(u.loc, v); break;
        case gl.FLOAT_VEC3: gl.uniform3fv(u.loc, v); break;
        case gl.FLOAT_VEC4: gl.uniform4fv(u.loc, v); break;
        case gl.INT: case gl.BOOL: gl.uniform1i(u.loc, v); break;
        default: break;
      }
    }
  }
  function params(linear, wrap, mip) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : linear ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linear ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
  }
  /** a sampled texture from a canvas or typed array (row 0 = first row of the data = v 0) */
  function texture(w, h, { data = null, internal = gl.RGBA8, format = gl.RGBA, type = gl.UNSIGNED_BYTE, linear = true, mip = false, wrap = gl.CLAMP_TO_EDGE } = {}) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    if (data && typeof HTMLCanvasElement !== 'undefined' && data instanceof HTMLCanvasElement) gl.texImage2D(gl.TEXTURE_2D, 0, internal, format, type, data);
    else gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, data);
    if (mip) gl.generateMipmap(gl.TEXTURE_2D);
    params(linear, wrap, mip);
    return { tex: t, w, h };
  }
  /** a render target. kind: 'f32' (RGBA32F) / 'rg32' (RG32F) — nearest, simulation state; 'f16' (RGBA16F) / 'rg16' (RG16F) / 'u8' (RGBA8) — linear */
  function target(w, h, { kind = 'f16', linear = kind === 'f16' || kind === 'rg16' || kind === 'u8', mip = false } = {}) {
    const internal = { f32: gl.RGBA32F, rg32: gl.RG32F, f16: gl.RGBA16F, rg16: gl.RG16F, u8: gl.RGBA8 }[kind];
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const levels = mip ? 1 + Math.floor(Math.log2(Math.max(w, h))) : 1;
    gl.texStorage2D(gl.TEXTURE_2D, levels, internal, w, h);
    params(linear, gl.CLAMP_TO_EDGE, mip);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error(`incomplete framebuffer (${kind} ${w}×${h})`);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex, fb, w, h, kind, mip };
  }
  function bindTarget(tgt) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, tgt ? tgt.fb : null);
    gl.viewport(0, 0, tgt ? tgt.w : gl.drawingBufferWidth, tgt ? tgt.h : gl.drawingBufferHeight);
  }
  /** a full-screen triangle with prog into tgt (null = the canvas) */
  function pass(prog, tgt, vals) {
    bindTarget(tgt);
    gl.useProgram(prog.p);
    uniforms(prog, vals);
    gl.bindVertexArray(tri);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }
  /** exact GPU copy between two targets of the same size and format */
  function copy(src, dst) {
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, src.fb);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dst.fb);
    gl.blitFramebuffer(0, 0, src.w, src.h, 0, 0, dst.w, dst.h, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
  }
  function mipmap(tgt) {
    gl.bindTexture(gl.TEXTURE_2D, tgt.tex);
    gl.generateMipmap(gl.TEXTURE_2D);
  }
  return { gl, program, uniforms, texture, target, bindTarget, pass, copy, mipmap };
}
