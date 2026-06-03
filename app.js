const App = {
  state: {
    currentTab: 'editor',
    dirty: false,
    sources: []
  },

  init() {
    this.initTabs();
    this.initSidebarButtons();
    this.initDocsSubTabs();

    PixelEditor.init();
    CodeEditor.init();
    SceneRunner.init();
    DocsContent.init();
    SourcesPanel.init();

    this.initKeyboardShortcuts();
    console.log('DraftBox initialized.');
  },

  initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });
  },

  initDocsSubTabs() {
    document.querySelectorAll('.docs-subtab').forEach(btn => {
      btn.addEventListener('click', () => {
        const sub = btn.dataset.subtab;
        document.querySelectorAll('.docs-subtab').forEach(b => b.classList.toggle('active', b.dataset.subtab === sub));
        document.querySelectorAll('.docs-subtab-content').forEach(c => c.classList.toggle('active', c.id === 'docs-subtab-' + sub));
      });
    });
  },

  initSidebarButtons() {
    document.getElementById('runBtn').addEventListener('click', () => {
      SceneRunner.run();
      this.switchTab('scene');
    });
    document.getElementById('stopBtn').addEventListener('click', () => {
      SceneRunner.stop();
    });
  },

  switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === 'tab-' + tabId);
    });
    this.state.currentTab = tabId;

    if (tabId === 'code' && CodeEditor.editor) {
      setTimeout(() => CodeEditor.editor.refresh(), 50);
    }
    if (tabId === 'docs') {
      if (SourcesPanel) SourcesPanel.refreshList();
    }
  },

  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        SceneRunner.run();
        this.switchTab('scene');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (this.state.currentTab === 'editor') {
          PixelEditor.saveSprite();
        } else if (this.state.currentTab === 'code') {
          SourcesPanel.saveSource();
        } else {
          SourcesPanel.saveSource();
        }
      }
    });
  },

  loadAndRun(demoIndex) {
    const demo = Demos[demoIndex];
    if (!demo) return;
    CodeEditor.setCode(demo.code);
    this.switchTab('code');
    setTimeout(() => {
      SceneRunner.run();
      this.switchTab('scene');
    }, 100);
  },

  async loadSourceIntoEditor(name) {
    try {
      const res = await fetch('/api/sources/' + encodeURIComponent(name));
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      CodeEditor.setCode(data.code);
      document.getElementById('sourceNameInput').value = data.name;
      this.switchTab('code');
    } catch (err) {
      console.error('Load source error:', err);
    }
  },

  async deleteSource(name) {
    try {
      await fetch('/api/sources/' + encodeURIComponent(name), { method: 'DELETE' });
      this.state.sources = this.state.sources.filter(s => s.name !== name);
      SourcesPanel.renderList(this.state.sources);
    } catch (err) {
      console.error('Delete source error:', err);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
