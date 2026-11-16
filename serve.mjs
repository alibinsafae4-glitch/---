/**
 * خادم محلي بسيط لمنصة مراقبة الجودة — كاك بنك
 * التشغيل:  node serve.mjs   ثم فتح http://127.0.0.1:8787
 * لا يحتاج أي حزم خارجية.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const HOST = '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

const server = createServer(async (req, res) => {
  try {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    let rel = url === '/' ? '/index.html' : url;
    const filePath = normalize(join(ROOT, rel));
    if (!filePath.startsWith(normalize(ROOT + sep)) && normalize(filePath) !== normalize(ROOT)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    const info = await stat(filePath);
    if (info.isDirectory()) { res.writeHead(302, { Location: rel + '/index.html' }); res.end(); return; }
    const body = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'Content-Length': body.length
    });
    res.end(body);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<div style="font-family:Tahoma;direction:rtl;padding:30px">الصفحة غير موجودة — <a href="/">العودة إلى المنصة</a></div>');
  }
});

server.listen(PORT, HOST, () => {
  const link = `http://${HOST}:${PORT}/`;
  console.log('\n==============================================');
  console.log('  منصة مراقبة الجودة — كاك بنك');
  console.log('  تعمل الآن على: ' + link);
  console.log('  للإيقاف: Ctrl + C');
  console.log('==============================================\n');
  try {
    if (process.platform === 'win32') exec(`start "" "${link}"`, () => { });
    else if (process.platform === 'darwin') exec(`open "${link}"`, () => { });
  } catch (e) {
    console.log('  افتح الرابط أعلاه يدويًا في المتصفح.');
  }
});
