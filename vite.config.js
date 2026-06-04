import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const SOURCES_DIR = path.resolve('sources');

if (!fs.existsSync(SOURCES_DIR)) {
  fs.mkdirSync(SOURCES_DIR, { recursive: true });
}

function readJSON(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function apiMiddleware(req, res, next) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;

  if (!pathname.startsWith('/api/sources')) return next();

  // GET /api/sources
  if (req.method === 'GET' && pathname === '/api/sources') {
    try {
      const files = fs.readdirSync(SOURCES_DIR).filter(f => f.endsWith('.js'));
      const sources = files.map(f => {
        const stats = fs.statSync(path.join(SOURCES_DIR, f));
        return { name: f.replace('.js', ''), filename: f, size: stats.size, mtime: stats.mtime };
      });
      sources.sort((a, b) => new Date(b.mtime) - new Date(a.mtime));
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(sources));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // GET /api/sources/:name
  if (req.method === 'GET' && pathname.startsWith('/api/sources/')) {
    try {
      const name = pathname.replace('/api/sources/', '').replace(/\.\./g, '').replace(/[\/\\]/g, '');
      const filepath = path.join(SOURCES_DIR, name + '.js');
      if (!fs.existsSync(filepath)) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: 'Source not found' }));
      }
      const code = fs.readFileSync(filepath, 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ name, code }));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // POST /api/sources
  if (req.method === 'POST' && pathname === '/api/sources') {
    (async () => {
      try {
        const { name, code } = await readJSON(req);
        if (!name || !code) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'name and code required' }));
        }
        const safeName = name.replace(/\.\./g, '').replace(/[\/\\]/g, '').replace(/[^a-zA-Z0-9_\-]/g, '_');
        fs.writeFileSync(path.join(SOURCES_DIR, safeName + '.js'), code, 'utf-8');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ name: safeName, filename: safeName + '.js' }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
    })();
    return;
  }

  // DELETE /api/sources/:name
  if (req.method === 'DELETE' && pathname.startsWith('/api/sources/')) {
    try {
      const name = pathname.replace('/api/sources/', '').replace(/\.\./g, '').replace(/[\/\\]/g, '');
      const filepath = path.join(SOURCES_DIR, name + '.js');
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  next();
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-routes',
      configureServer(server) {
        server.middlewares.use(apiMiddleware);
      }
    }
  ],
  server: {
    host: '212.227.93.180',
    port: 5173
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
        }
      }
    }
  }
});
