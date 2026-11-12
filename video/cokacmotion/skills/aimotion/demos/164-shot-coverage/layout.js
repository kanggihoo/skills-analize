/*
 * layout.js — the one staged scene every camera shares (metres, y up). Nothing here depends on time.
 *
 *   plan (top view, +x right, +z toward the camera side):
 *
 *        back wall · window · sill (the cat sleeps here)
 *                     cat spot on the table (later)
 *          A ●────────── cake ──────────● B        ← the axis line A→B (the 180° line)
 *                 every camera stands down here (z > 0)
 *
 * Both bodies are "cheated" 32° toward the camera side, so the faces stay open to every set-up while the eyes still
 * look across the table.
 */
import * as THREE from 'three';

export const TABLE_Y = 0.72, TABLE_R = 0.36;
export const SEAT = 0.47;                     // |x| of each seat centre
export const CHEAT = 0.56;                    // rad (32°): bodies turned from the axis toward the camera side
export const BODY = { r: 0.2, sy: 0.92, cy: 0.885, pivot: 0.70 };   // round body; lean pivot at the seat
export const SIZE_CH = 0.40;                  // visible height of a character (table top → crown): the shot-size yardstick
export const EYE = { ex: 0.30, ey: 0.16, r: 0.034 };               // eye placement on the body sphere (rad), sclera radius

// yaw of the body (its local +z = the face direction); cam = sign of local x that points to the camera side
export const CH = {
  A: { key: 'A', x: -SEAT, yaw: Math.atan2(Math.cos(CHEAT), Math.sin(CHEAT)), cam: -1 },
  B: { key: 'B', x: SEAT, yaw: Math.atan2(-Math.cos(CHEAT), Math.sin(CHEAT)), cam: 1 },
};

/** rest-pose point on a character's body surface at body angles (ex, ey), pushed out by `out` along the normal */
export function facePoint(ch, ex, ey, out = 0, target = new THREE.Vector3()) {
  const dx = Math.sin(ex) * Math.cos(ey), dy = Math.sin(ey), dz = Math.cos(ex) * Math.cos(ey);
  const n = new THREE.Vector3(dx, dy / BODY.sy, dz).normalize();
  const lx = BODY.r * dx + n.x * out, ly = BODY.cy + BODY.r * dy * BODY.sy + n.y * out, lz = BODY.r * dz + n.z * out;
  const c = Math.cos(ch.yaw), s = Math.sin(ch.yaw);
  return target.set(ch.x + lx * c + lz * s, ly, -lx * s + lz * c);
}

// ---- props on the table
export const PLATE_Y = TABLE_Y + 0.012;
export const CAKE_H = 0.062;
export const SLICE = { apexZ: 0.06, r: 0.112, half: 0.46 };          // wedge: apex toward the camera, arc at the back
export const DOLLOP = new THREE.Vector3(0, PLATE_Y + CAKE_H, -0.012);  // cream swirl the strawberry sits on
export const BERRY = new THREE.Vector3(0, DOLLOP.y + 0.034, -0.012);   // strawberry centre (on the dollop)
export const MEET = new THREE.Vector3(0, DOLLOP.y + 0.024, -0.012);    // where the two fork tips meet: where the berry was
export const FORK_LEN = 0.168;

// ---- the cat: asleep on the sill cushion, later sitting on the far edge of the table
export const WINDOW = { cx: -0.22, y0: 1.0, w: 1.15, h: 1.5 };          // arched window in the back wall
export const SILL = { x0: WINDOW.cx - WINDOW.w / 2 - 0.07, x1: WINDOW.cx + WINDOW.w / 2 + 0.07, y: 1.0, z0: -1.75, z1: -1.47 };
export const CAT_SILL = new THREE.Vector3(-0.5, SILL.y + 0.05, -1.6);
export const CAT_TABLE = new THREE.Vector3(0.0, TABLE_Y, -0.325);

// ---- the room
export const ROOM = { back: -1.72, left: -2.3, right: 2.3, ceil: 2.75 };
export const SUN_DIR = new THREE.Vector3(0.12, -0.5, 0.86).normalize();   // late sun through the window, toward the camera side
