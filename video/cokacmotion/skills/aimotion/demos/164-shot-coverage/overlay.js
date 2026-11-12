/*
 * overlay.js — the returning teaching element: a small plan card in the top-left corner.
 *   left   the plan seen from above: table, A and B (with a tick toward each one's gaze target), the axis line,
 *          the allowed half-plane (tinted), the strawberry (the one red dot) and the current camera's cone.
 *          Plan distances are compressed radially, g(r) = R·tanh(r / s): directions — and so the side of the axis
 *          line every point is on — are preserved exactly, while a 3 m wide camera still fits in the card.
 *   right  shot number, shot-size label, lens, and a strip of the shot lengths (the cutting rhythm).
 * Redrawn in full every frame into a 2D canvas, uploaded as a texture and drawn in the last WebGL pass.
 */
import * as THREE from 'three';
import { clamp, ease } from '../_lib/stage.js';
import { SHOTS, DURATION, ASPECT } from './shots.js';
import { CH, TABLE_R } from './layout.js';
import { PAL } from './cast.js';

const CW = 600, CHT = 272;                 // canvas size (px), drawn 1:1 on the stage
const PX = 36, PY = 36, PS = 200;          // plan panel
const R0 = 92, S0 = 1.25;                  // compression g(r) = R0·tanh(r / S0)
const g = (r) => R0 * Math.tanh(r / S0);
const COCOA = PAL.cocoa, MUTED = '#9b8576';

export function createOverlay(HL) {
  const cv = document.createElement('canvas');
  cv.width = CW; cv.height = CHT;
  const ctx = cv.getContext('2d', HL ? { willReadFrequently: true } : undefined);
  // the card body with its soft shadow, baked once
  const bg = document.createElement('canvas');
  bg.width = CW; bg.height = CHT;
  {
    const b = bg.getContext('2d', HL ? { willReadFrequently: true } : undefined);
    b.shadowColor = 'rgba(74,40,20,0.22)'; b.shadowBlur = 22; b.shadowOffsetY = 6;
    b.fillStyle = 'rgba(253,248,240,0.93)';
    b.beginPath(); b.roundRect(14, 12, CW - 28, CHT - 30, 30); b.fill();
    b.shadowColor = 'transparent';
    b.fillStyle = 'rgba(74,51,41,0.045)';
    b.beginPath(); b.roundRect(PX, PY - 6, PS, PS + 12, 22); b.fill();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
  const scene = new THREE.Scene();
  const ortho = new THREE.OrthographicCamera(0, 1080, 0, -1920, -10, 10);
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(CW, CHT), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false }));
  const SX = 26, SY = 40;
  plane.position.set(SX + CW / 2, -(SY + CHT / 2), 0);
  scene.add(plane);

  const pcx = PX + PS / 2, pcy = PY + PS * 0.42;
  const map = (x, z) => { const r = Math.hypot(x, z); if (r < 1e-6) return [pcx, pcy]; const k = g(r) / r; return [pcx + x * k, pcy + z * k]; };

  function cone(c, P, sub, alpha) {
    if (alpha <= 0.001) return;
    c.save();
    c.globalAlpha = alpha;
    const [x0, y0] = map(P.pos.x, P.pos.z);
    if (P.pitch < -1.0) {
      // looking almost straight down: draw the frame's footprint on the table instead of a wedge
      const fx = Math.tan(P.fov / 2) * ASPECT, fy = Math.tan(P.fov / 2);
      const h = P.pos.y - sub.y, cy = Math.cos(P.yaw), sy = Math.sin(P.yaw);
      const pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => {
        const dx = u * fx * h, dz = -v * fy * h;      // screen up ≈ −z when looking down from the +z side
        return map(sub.x + dx * cy + dz * sy, sub.z - dx * sy + dz * cy);
      });
      c.fillStyle = 'rgba(74,51,41,0.13)'; c.strokeStyle = 'rgba(74,51,41,0.7)'; c.lineWidth = 1.6;
      c.setLineDash([5, 4]);
      c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); c.stroke();
      c.setLineDash([]);
      c.fillStyle = COCOA;
      c.beginPath(); c.arc(x0, y0, 5, 0, Math.PI * 2); c.fill();
      c.restore();
      return;
    }
    const hf = Math.atan(Math.tan(P.fov / 2) * ASPECT);
    const fwd = Math.atan2(-Math.sin(P.yaw), -Math.cos(P.yaw));      // plan heading (x, z) of the optical axis
    const [sx, sy] = map(sub.x, sub.z);
    const L = Math.hypot(sx - x0, sy - y0) + 18;
    const ray = (a) => [x0 + Math.sin(a) * L, y0 + Math.cos(a) * L];
    const [ax, ay] = ray(fwd - hf), [bx, by] = ray(fwd + hf);
    const grd = c.createLinearGradient(x0, y0, (ax + bx) / 2, (ay + by) / 2);
    grd.addColorStop(0, 'rgba(74,51,41,0.26)'); grd.addColorStop(1, 'rgba(74,51,41,0.04)');
    c.fillStyle = grd;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(ax, ay); c.lineTo(bx, by); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(74,51,41,0.55)'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(x0, y0); c.lineTo(bx, by); c.stroke();
    // camera body
    c.translate(x0, y0); c.rotate(-fwd);
    c.fillStyle = COCOA;
    c.beginPath(); c.roundRect(-7, -9, 14, 11, 3); c.fill();
    c.beginPath(); c.roundRect(-4, 1, 8, 5, 1.5); c.fill();
    c.restore();
  }

  return {
    scene, ortho,
    /** state: { t, i (shot), P (pose), prevP, gaze: {A, B}, berry (bool), cat (Vector3|null) } */
    draw(st) {
      const c = ctx;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.setLineDash([]); c.lineCap = 'butt'; c.lineJoin = 'miter'; c.filter = 'none';
      c.clearRect(0, 0, CW, CHT);
      // the card arrives once at the start (rises and fades in) and then stays
      const enter = ease.outCubic(clamp((st.t - 0.15) / 0.45));
      plane.material.opacity = enter;
      plane.position.y = -(SY + CHT / 2) - (1 - enter) * 26;
      c.drawImage(bg, 0, 0);
      const s = SHOTS[st.i];
      const since = st.t - s.t0;
      // plan panel (clipped)
      c.save();
      c.beginPath(); c.roundRect(PX, PY - 6, PS, PS + 12, 22); c.clip();
      // the allowed half-plane: everything on the camera side of the axis line
      c.fillStyle = 'rgba(159,191,143,0.24)';
      c.fillRect(PX, pcy, PS, PS);
      // axis line through A and B
      c.strokeStyle = 'rgba(74,51,41,0.55)'; c.lineWidth = 1.6; c.setLineDash([6, 5]);
      c.beginPath(); c.moveTo(PX, pcy); c.lineTo(PX + PS, pcy); c.stroke();
      c.setLineDash([]);
      c.font = '700 14px "Pretendard Variable"'; c.fillStyle = MUTED; c.textAlign = 'right'; c.textBaseline = 'bottom';
      c.fillText('180°', PX + PS - 10, pcy - 5);
      // table
      const [tx, ty] = map(0, 0);
      c.fillStyle = 'rgba(223,194,156,0.6)'; c.strokeStyle = 'rgba(74,51,41,0.35)'; c.lineWidth = 1.4;
      c.beginPath(); c.arc(tx, ty, g(TABLE_R), 0, Math.PI * 2); c.fill(); c.stroke();
      if (st.berry) { c.fillStyle = PAL.berry; c.beginPath(); c.arc(tx, ty - 1, 4.6, 0, Math.PI * 2); c.fill(); }
      // camera cone: the previous set-up fades out fast, the new one comes in (a cut is a jump, not a move)
      const kin = ease.outCubic(clamp(since / 0.18)), kout = 1 - clamp(since / 0.1);
      if (st.prevP && kout > 0) cone(c, st.prevP, SHOTS[st.i - 1].sub, kout * 0.8);
      cone(c, st.P, s.sub, kin);
      // characters + gaze ticks
      for (const k of ['A', 'B']) {
        const [x, y] = map(CH[k].x, 0);
        const gz = st.gaze[k];
        const a = Math.atan2(gz.x - CH[k].x, gz.z);
        c.fillStyle = COCOA;
        c.save(); c.translate(x, y); c.rotate(-a);
        c.beginPath(); c.moveTo(-4.5, 10.5); c.lineTo(0, 17); c.lineTo(4.5, 10.5); c.closePath(); c.fill();
        c.restore();
        c.fillStyle = k === 'A' ? PAL.butter : PAL.sage;
        c.strokeStyle = COCOA; c.lineWidth = 2;
        c.beginPath(); c.arc(x, y, 9.5, 0, Math.PI * 2); c.fill(); c.stroke();
        c.fillStyle = COCOA; c.font = '800 11px "Pretendard Variable"'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(k, x, y + 0.5);
      }
      if (st.cat) {
        const [x, y] = map(st.cat.x, st.cat.z);
        c.fillStyle = PAL.ash;
        c.beginPath(); c.moveTo(x - 7, y - 3); c.lineTo(x - 6, y - 11); c.lineTo(x - 1, y - 6); c.lineTo(x + 1, y - 6); c.lineTo(x + 6, y - 11); c.lineTo(x + 7, y - 3);
        c.arc(x, y, 7.5, 0, Math.PI, false); c.closePath(); c.fill();
        c.fillStyle = PAL.berry; c.beginPath(); c.arc(x, y + 6.5, 4, 0, Math.PI * 2); c.fill();
      }
      c.restore();

      // label block
      const TX = PX + PS + 30;
      const k = ease.outCubic(clamp(since / 0.2));
      c.save();
      c.globalAlpha = k;
      c.translate(0, (1 - k) * 12);
      c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      c.font = '700 21px "Pretendard Variable"'; c.fillStyle = MUTED;
      c.fillText(`샷 ${String(st.i + 1).padStart(2, '0')}  /  ${SHOTS.length}`, TX, PY + 26);
      const maxW = CW - TX - 34;
      c.font = '800 44px "Pretendard Variable"';
      const w = c.measureText(s.label).width;
      const fs = Math.min(44, (44 * maxW) / w);
      c.font = `800 ${fs.toFixed(1)}px "Pretendard Variable"`;
      c.fillStyle = COCOA;
      c.fillText(s.label, TX, PY + 82);
      c.font = '600 22px "Pretendard Variable"'; c.fillStyle = MUTED;
      c.fillText(`${s.f}mm · f/${s.N}`, TX, PY + 118);
      c.restore();
      // cutting rhythm: one segment per shot, width ∝ length; the running one fills as it plays
      const SX0 = TX, SW = CW - TX - 34, gap = 3, Y = PY + 150, Hs = 12;
      const scale = (SW - gap * (SHOTS.length - 1)) / DURATION;
      let x = SX0;
      c.save();
      for (const sh of SHOTS) {
        const wseg = (sh.t1 - sh.t0) * scale;
        c.fillStyle = sh.i < st.i ? 'rgba(74,51,41,0.45)' : 'rgba(74,51,41,0.12)';
        c.beginPath(); c.roundRect(x, Y, wseg, Hs, 3); c.fill();
        if (sh.i === st.i) {
          c.fillStyle = COCOA;
          c.beginPath(); c.roundRect(x, Y, Math.max(2, wseg * clamp((st.t - sh.t0) / (sh.t1 - sh.t0))), Hs, 3); c.fill();
        }
        x += wseg + gap;
      }
      c.font = '600 15px "Pretendard Variable"'; c.fillStyle = MUTED; c.textAlign = 'left';
      c.fillText('컷 길이', SX0, Y + 36);
      c.textAlign = 'right';
      c.fillText(`${(s.t1 - s.t0).toFixed(2)}초`, SX0 + SW, Y + 36);
      c.restore();
      tex.needsUpdate = true;
    },
  };
}
export const OVERLAY_GLYPHS = '샷 / 0123456789 와이드투어깨너머(역)인서트익스트림클로즈업바스부감 mm·f.컷길이초 180°AB';
