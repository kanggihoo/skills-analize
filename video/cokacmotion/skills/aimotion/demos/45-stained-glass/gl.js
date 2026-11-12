/*
 * gl.js — a few WebGL2 helpers for this demo (programs with auto uniforms, textures, float render targets,
 * full-screen passes). Kept inside the demo folder on purpose: _lib/ is shared and not touched.
 */
export const FS_VERT = `#version 300 es
layout(location = 0) in vec2 p;
out vec2 vUv;
void main() { vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

export function glKit(gl) {
  const floatOK = !!gl.getExtension('EXT_color_buffer_float');
  gl.getExtension('OES_texture_float_linear');
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
      const log = gl.getShaderInfoLog(s);
      const lines = src.split('\n').map((l, i) => `${i + 1}: ${l}`);
      const m = /0:(\d+)/.exec(log || '');
      const ctx = m ? lines.slice(Math.max(0, +m[1] - 3), +m[1] + 2).join('\n') : '';
      throw new Error('shader compile: ' + log + '\n' + ctx);
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
  const SAMPLERS = new Set([gl.SAMPLER_2D, gl.SAMPLER_3D, gl.SAMPLER_2D_ARRAY, gl.INT_SAMPLER_2D, gl.UNSIGNED_INT_SAMPLER_2D]);
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
        case gl.FLOAT_MAT3: gl.uniformMatrix3fv(u.loc, false, v); break;
        case gl.FLOAT_MAT4: gl.uniformMatrix4fv(u.loc, false, v); break;
        default: break;
      }
    }
  }
  function texture(w, h, { data = null, internal = gl.RGBA8, format = gl.RGBA, type = gl.UNSIGNED_BYTE, linear = true, mip = false, wrap = gl.CLAMP_TO_EDGE } = {}) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    if (data && (data instanceof HTMLCanvasElement || (typeof ImageData !== 'undefined' && data instanceof ImageData))) {
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, format, type, data);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, data);
    }
    if (mip) gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : linear ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linear ? gl.LINEAR : gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    return t;
  }
  /** a render target; float = RGBA16F when the GPU can render to it (else RGBA8, clamped) */
  function target(w, h, { float = true, mip = false, linear = true } = {}) {
    const f = float && floatOK;
    const tex = texture(w, h, { internal: f ? gl.RGBA16F : gl.RGBA8, type: f ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, mip: false, linear });
    if (mip) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    }
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { fb, tex, w, h };
  }
  function bindTarget(tgt) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, tgt ? tgt.fb : null);
    gl.viewport(0, 0, tgt ? tgt.w : gl.drawingBufferWidth, tgt ? tgt.h : gl.drawingBufferHeight);
  }
  /** draw a full-screen triangle with prog into tgt (null = canvas) */
  function pass(prog, tgt, vals, { blend = null } = {}) {
    bindTarget(tgt);
    gl.useProgram(prog.p);
    uniforms(prog, vals);
    if (blend) { gl.enable(gl.BLEND); gl.blendFunc(blend[0], blend[1]); } else gl.disable(gl.BLEND);
    gl.bindVertexArray(tri);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
  }
  return { gl, floatOK, program, uniforms, texture, target, bindTarget, pass };
}
