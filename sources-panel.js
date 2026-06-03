const SourcesPanel = {
  init() {
    document.getElementById('saveSourceBtn').addEventListener('click', () => this.saveSource());
    document.getElementById('newSourceBtn').addEventListener('click', () => this.newSource());
    document.getElementById('refreshSourcesBtn').addEventListener('click', () => this.refreshList());
    document.getElementById('sourceNameInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.saveSource();
    });
  },

  async saveSource() {
    const name = document.getElementById('sourceNameInput').value.trim();
    if (!name) { alert('Enter a source name'); return; }
    const code = CodeEditor.getCode();
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code })
      });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      console.log('Saved:', data.name);
      this.refreshList();
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save: ' + err.message);
    }
  },

  newSource() {
    const existing = document.getElementById('sourceNameInput').value.trim();
    const name = existing || 'my_game';
    const newName = prompt('New source name:', name);
    if (!newName) return;
    document.getElementById('sourceNameInput').value = newName;
    CodeEditor.setCode(CodeEditor.defaultCode);
  },

  async refreshList() {
    try {
      const res = await fetch('/api/sources');
      if (!res.ok) throw new Error('Failed to fetch');
      const sources = await res.json();
      App.state.sources = sources;
      this.renderList(sources);
    } catch (err) {
      console.error('Refresh error:', err);
    }
  },

  renderList(sources) {
    const container = document.getElementById('sourcesList');

    if (!sources || sources.length === 0) {
      container.innerHTML =
        '<div class="empty-sources">' +
        '<div class="empty-icon">📁</div>' +
        '<p>No saved sources yet.</p>' +
        '<p style="font-size:12px;margin-top:8px;color:var(--text-secondary)">Use the Save button in the Code Editor to save your work.</p>' +
        '</div>';
      return;
    }

    container.innerHTML = sources.map(s =>
      '<div class="source-item" data-name="' + s.name + '">' +
        '<span class="source-icon">📄</span>' +
        '<div class="source-info">' +
          '<div class="source-name">' + s.name + '.js</div>' +
          '<div class="source-meta">' + formatSize(s.size) + ' &middot; ' + formatDate(s.mtime) + '</div>' +
        '</div>' +
        '<div class="source-actions">' +
          '<button class="source-load" title="Load into editor">📂 Load</button>' +
          '<button class="source-del" title="Delete source">🗑️</button>' +
        '</div>' +
      '</div>'
    ).join('');

    container.querySelectorAll('.source-load').forEach((btn, i) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        App.loadSourceIntoEditor(sources[i].name);
      });
    });
    container.querySelectorAll('.source-del').forEach((btn, i) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Delete "' + sources[i].name + '"?')) {
          App.deleteSource(sources[i].name);
        }
      });
    });
    container.querySelectorAll('.source-item').forEach((el, i) => {
      el.addEventListener('click', () => {
        App.loadSourceIntoEditor(sources[i].name);
      });
    });
  }
};

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  return (bytes / 1024).toFixed(1) + ' KB';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
