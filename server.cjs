const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3002;
const SOURCES_DIR = path.join(__dirname, 'sources');

if (!fs.existsSync(SOURCES_DIR)) {
  fs.mkdirSync(SOURCES_DIR, { recursive: true });
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));
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

const PROJECTS_DIR = path.join(__dirname, 'projects');

if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

app.get('/api/projects', (req, res) => {
  try {
    const files = fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith('.json'));
    const projects = files.map(f => {
      const fullPath = path.join(PROJECTS_DIR, f);
      const stats = fs.statSync(fullPath);
      return {
        name: f.replace('.json', ''),
        filename: f,
        size: stats.size,
        mtime: stats.mtime
      };
    });
    projects.sort((a, b) => new Date(b.mtime) - new Date(a.mtime));
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', (req, res) => {
  try {
    const { name, code, sprites } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const safeName = name.replace(/\.\./g, '').replace(/[\/\\]/g, '').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const filepath = path.join(PROJECTS_DIR, safeName + '.json');
    fs.writeFileSync(filepath, JSON.stringify({ name: safeName, code, sprites }, null, 2), 'utf-8');
    res.json({ name: safeName, filename: safeName + '.json' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:name', (req, res) => {
  try {
    const filename = req.params.name.replace(/\.\./g, '').replace(/[\/\\]/g, '');
    const filepath = path.join(PROJECTS_DIR, filename + '.json');
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:name', (req, res) => {
  try {
    const filename = req.params.name.replace(/\.\./g, '').replace(/[\/\\]/g, '');
    const filepath = path.join(PROJECTS_DIR, filename + '.json');
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`DraftBox server running at http://localhost:${PORT}/index.html`);
});
