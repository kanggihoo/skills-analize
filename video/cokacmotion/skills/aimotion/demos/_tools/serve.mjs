#!/usr/bin/env node
// _tools/serve.mjs — serve the demos folder as the web root:  node _tools/serve.mjs [port]  → http://localhost:8080/
// (the demos use root-absolute paths like /_lib/stage.js and /node_modules/three/…, so file:// does not work)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.argv[2]) || 8080;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.wasm': 'application/wasm', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.md': 'text/plain; charset=utf-8', '.glsl': 'text/plain', '.frag': 'text/plain', '.vert': 'text/plain' };
http.createServer((req, res) => {
  const p = path.normalize(path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
  if (!p.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  fs.stat(p, (e, st) => {
    const f = !e && st.isDirectory() ? path.join(p, 'index.html') : p;
    fs.readFile(f, (err, buf) => {
      if (err) { res.writeHead(404).end('not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(buf);
    });
  });
// this computer only (loopback): other devices on the network cannot open it
}).listen(PORT, 'localhost', () => console.log(`demos: http://localhost:${PORT}/`));
