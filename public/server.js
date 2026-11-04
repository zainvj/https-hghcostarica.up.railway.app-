const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib');
const PORT = process.env.PORT || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8' };
const FILES = ['index.html', 'robots.txt', 'sitemap.xml'];

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const name = p.slice(1);
  if (!FILES.includes(name)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not found');
  }
  const headers = {
    'Content-Type': TYPES[path.extname(name)],
    'Cache-Control': name === 'index.html' ? 'public, max-age=3600' : 'public, max-age=86400',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN'
  };
  const data = fs.readFileSync(path.join(__dirname, name));
  if ((req.headers['accept-encoding'] || '').includes('gzip')) {
    headers['Content-Encoding'] = 'gzip';
    res.writeHead(200, headers);
    return res.end(zlib.gzipSync(data));
  }
  res.writeHead(200, headers);
  res.end(data);
}).listen(PORT, () => console.log('Running on ' + PORT));
