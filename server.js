import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tự động nạp biến môi trường từ .env nếu có
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split(/\r?\n/)) {
      const match = line.match(/^\s*([\w]+)\s*=\s*(.*)?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    }
  }
} catch (e) {
  console.warn('Không thể đọc .env:', e.message);
}

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
};

const server = http.createServer(async (req, res) => {
  // ── Xử lý API Serverless /api/ai-personalize trên Local ────────────
  if (req.url.startsWith('/api/ai-personalize')) {
    try {
      const { default: apiHandler } = await import('./api/ai-personalize.js');

      // Đọc body nếu có
      let bodyText = '';
      req.on('data', chunk => { bodyText += chunk; });
      req.on('end', async () => {
        try {
          req.body = bodyText ? JSON.parse(bodyText) : {};
        } catch {
          req.body = bodyText;
        }

        // Mock response helper cho serverless handler
        const mockRes = {
          statusCode: 200,
          headers: {},
          setHeader(name, value) {
            this.headers[name] = value;
            return this;
          },
          status(code) {
            this.statusCode = code;
            return this;
          },
          json(data) {
            this.setHeader('Content-Type', 'application/json; charset=utf-8');
            this.setHeader('Access-Control-Allow-Origin', '*');
            res.writeHead(this.statusCode, this.headers);
            res.end(JSON.stringify(data));
          },
          end(data) {
            res.writeHead(this.statusCode, this.headers);
            res.end(data);
          }
        };

        try {
          await apiHandler(req, mockRes);
        } catch (apiErr) {
          console.error('Lỗi API:', apiErr);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: apiErr.message }));
        }
      });
      return;
    } catch (importErr) {
      console.error('Không tìm thấy API handler:', importErr);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Không thể nạp API handler: ' + importErr.message }));
      return;
    }
  }

  // ── Normalize URL & Pretty Link rewrite ────────────────────────────
  const urlParts = req.url.split('?');
  let reqPath = decodeURI(urlParts[0]);
  const queryString = urlParts[1] || '';

  // Rewrite Pretty URL:
  // 1. /dam-cuoi-:couple/:guest
  // 2. /dam-cuoi/:couple/:guest
  const prettyMatch = reqPath.match(/^\/dam-cuoi(?:-|\/)([^/]+)\/([^/]+)\/?$/);
  if (prettyMatch) {
    const couple = prettyMatch[1];
    const guest = prettyMatch[2];
    reqPath = '/thiep.html';
    // Append couple and guest into search params
    req.url = `/thiep.html?couple=${encodeURIComponent(couple)}&guest=${encodeURIComponent(guest)}${queryString ? '&' + queryString : ''}`;
  }

  if (reqPath === '/' || reqPath === '') {
    reqPath = '/mau-thiep.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(ROOT, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>404 Not Found</h1><p>Không tìm thấy file: ${reqPath}</p><p><a href="/mau-thiep.html">Về trang Mẫu thiệp</a></p>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`WedStory Local Dev Server đang chạy tại:`);
  console.log(`- Quản lý khách mời AI: http://localhost:${PORT}/quan-ly-khach.html`);
  console.log(`- Mẫu thiệp (Giao diện chính): http://localhost:${PORT}/mau-thiep.html`);
  console.log(`- Trình chỉnh sửa thiệp: http://localhost:${PORT}/editor.html`);
  console.log(`- Pretty Link thử nghiệm: http://localhost:${PORT}/dam-cuoi-minh-khoa-thu-ha/bac-ca`);
});
