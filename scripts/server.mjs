// Minimal static server for scripts (check, og). Mirrors Workers
// "auto-trailing-slash": /dir/ serves /dir/index.html.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../public/', import.meta.url));
const scripts = fileURLToPath(new URL('./', import.meta.url));
const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml',
  '.webp':'image/webp', '.png':'image/png', '.woff2':'font/woff2', '.txt':'text/plain', '.xml':'application/xml' };

export function start(port = 8811) {
  const srv = http.createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let base = root;
    if (p === '/__og.html') { base = scripts; p = '/og.html'; }
    if (p.endsWith('/')) p += 'index.html';
    const file = normalize(join(base, p));
    if (!file.startsWith(base)) { res.writeHead(403).end(); return; }
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' }).end(body);
    } catch { res.writeHead(404).end('not found'); }
  });
  return new Promise(r => srv.listen(port, () => r(srv)));
}
