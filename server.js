const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;
const SOURCES_DIR = path.join(__dirname, 'sources');

if (!fs.existsSync(SOURCES_DIR)) {
  fs.mkdirSync(SOURCES_DIR, { recursive: true });
}

app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/sources', (req, res) => {
  try {
    const files = fs.readdirSync(SOURCES_DIR).filter(f => f.endsWith('.js'));
    const sources = files.map(f => {
      const fullPath = path.join(SOURCES_DIR, f);
      const stats = fs.statSync(fullPath);
      return {
        name: f.replace('.js', ''),
        filename: f,
        size: stats.size,
        mtime: stats.mtime
      };
    });
    sources.sort((a, b) => new Date(b.mtime) - new Date(a.mtime));
    res.json(sources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sources/:name', (req, res) => {
  try {
    const filename = req.params.name.replace(/\.\./g, '').replace(/[\/\\]/g, '');
    const filepath = path.join(SOURCES_DIR, filename + '.js');
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Source not found' });
    }
    const code = fs.readFileSync(filepath, 'utf-8');
    res.json({ name: filename, code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sources', (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ error: 'name and code required' });
    const safeName = name.replace(/\.\./g, '').replace(/[\/\\]/g, '').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const filepath = path.join(SOURCES_DIR, safeName + '.js');
    fs.writeFileSync(filepath, code, 'utf-8');
    res.json({ name: safeName, filename: safeName + '.js' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sources/:name', (req, res) => {
  try {
    const filename = req.params.name.replace(/\.\./g, '').replace(/[\/\\]/g, '');
    const filepath = path.join(SOURCES_DIR, filename + '.js');
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`DraftBox server running at http://localhost:${PORT}/index.html`);
});
