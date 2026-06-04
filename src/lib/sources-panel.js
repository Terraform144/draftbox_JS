const sourcesPanel = {
  async saveSource(code, name) {
    if (!name) throw new Error('Enter a source name');
    const res = await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code })
    });
    if (!res.ok) throw new Error('Save failed');
    const data = await res.json();
    return data;
  },

  async refreshList() {
    const res = await fetch('/api/sources');
    if (!res.ok) throw new Error('Failed to fetch');
    const sources = await res.json();
    return sources;
  }
};

export default sourcesPanel;
