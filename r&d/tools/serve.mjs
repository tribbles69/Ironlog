// Optional local server: `node "r&d/tools/serve.mjs"` then open http://localhost:5178
// You can also just double-click index.html — this is only needed if your
// browser restricts localStorage on file:// URLs.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORT = 5178;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.csv': 'text/csv; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

/* Demo Lab saves (r&d/tools/demo-lab.html): PUT /__demos/<movement-id> writes
   r&d/data/demos/movements/<id>.json in house style and runs build-demos.cjs.
   Only accepted from this machine; the server is a dev tool, never deployed. */
const require = createRequire(import.meta.url);
function saveDemo(req, res, id) {
  let body = '';
  req.on('data', c => { body += c; if (body.length > 200000) req.destroy(); });
  req.on('end', () => {
    const send = (code, text) => { res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(text); };
    let data;
    try { data = JSON.parse(body); } catch (e) { return send(400, 'Not JSON: ' + e.message); }
    const { fmt } = require('./build-demos.cjs');
    const file = path.join(ROOT, 'r&d/data/demos/movements', id + '.json');
    const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    fs.writeFileSync(file, fmt(data) + '\n');
    try {
      const out = execFileSync(process.execPath, [path.join(ROOT, 'r&d/tools/build-demos.cjs')], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      send(200, `Saved ${id}.json\n${out}`);
    } catch (e) {
      /* a file the build rejects is put back, so index.html and the data never disagree */
      if (before == null) fs.unlinkSync(file); else fs.writeFileSync(file, before);
      send(422, `Not saved — the build rejected it:\n${(e.stdout || '') + (e.stderr || '')}`);
    }
  });
}

http.createServer((req, res) => {
  const dm = req.method === 'PUT' && req.url.match(/^\/__demos\/([a-z0-9-]+)$/);
  /* writes only from this machine, even if the server is reachable on the LAN */
  if (dm && !/^(::1|127\.|::ffff:127\.)/.test(req.socket.remoteAddress || '')) { res.writeHead(403); return res.end('local only'); }
  if (dm) return saveDemo(req, res, dm[1]);
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Ironlog running at http://localhost:${PORT} · Demo Lab: http://localhost:${PORT}/r%26d/tools/demo-lab.html`));
