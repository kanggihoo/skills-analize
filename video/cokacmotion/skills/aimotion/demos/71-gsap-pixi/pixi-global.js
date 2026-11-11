/*
 * PixiJS 8 as an ES module, also published as globalThis.PIXI.
 * gsap/PixiPlugin.js reads window.PIXI when it registers itself (it auto-registers on import when window.gsap
 * already exists). Without it the plugin decides "not v8" and falls back to v7 code paths, so this module is
 * imported first in main.js: ES modules evaluate in import order, so PIXI is global before the plugin runs.
 */
import * as PIXI from '../node_modules/pixi.js/dist/pixi.mjs';

globalThis.PIXI = PIXI;
export { PIXI };
