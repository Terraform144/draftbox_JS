import { isNative, sanitizeName, writeFile, readFile, listDir } from './native-fs';

const SOURCES_DIR = 'sources';

const sourcesPanel = {
  async saveSource(code, name) {
    if (!name) throw new Error('Enter a source name');

    if (isNative()) {
      const safeName = sanitizeName(name);
      await writeFile(SOURCES_DIR, safeName + '.js', code);
      return { name: safeName, filename: safeName + '.js' };
    }

    const res = await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code })
    });
    if (!res.ok) throw new Error('Save failed');
    const data = await res.json();
    return data;
  },

  async load(name) {
    if (isNative()) {
      const code = await readFile(SOURCES_DIR, name + '.js');
      return { name, code };
    }
    const res = await fetch('/api/sources/' + encodeURIComponent(name));
    if (!res.ok) throw new Error('Failed to load');
    return await res.json();
  },

  async refreshList() {
    if (isNative()) {
      return await listDir(SOURCES_DIR, '.js');
    }
    const res = await fetch('/api/sources');
    if (!res.ok) throw new Error('Failed to fetch');
    const sources = await res.json();
    return sources;
  }
};

export default sourcesPanel;
