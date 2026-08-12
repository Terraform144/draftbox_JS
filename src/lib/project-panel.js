import { isNative, sanitizeName, writeFile, readFile, deleteFile, listDir } from './native-fs';

const PROJECTS_DIR = 'projects';

const projectPanel = {
  async save(name, code, sprites) {
    if (!name) throw new Error('Enter a project name');
    const spritesData = {};
    for (const [spriteName, canvas] of Object.entries(sprites)) {
      spritesData[spriteName] = canvas.toDataURL();
    }

    if (isNative()) {
      const safeName = sanitizeName(name);
      await writeFile(PROJECTS_DIR, safeName + '.json', JSON.stringify({ name: safeName, code, sprites: spritesData }));
      return { name: safeName, filename: safeName + '.json' };
    }

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code, sprites: spritesData })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Save failed');
    }
    return await res.json();
  },

  async load(name) {
    if (isNative()) {
      const data = await readFile(PROJECTS_DIR, name + '.json');
      return JSON.parse(data);
    }
    const res = await fetch('/api/projects/' + encodeURIComponent(name));
    if (!res.ok) throw new Error('Failed to load project');
    return await res.json();
  },

  async delete(name) {
    if (isNative()) {
      await deleteFile(PROJECTS_DIR, name + '.json');
      return { ok: true };
    }
    const res = await fetch('/api/projects/' + encodeURIComponent(name), { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    return await res.json();
  },

  async refreshList() {
    if (isNative()) {
      return await listDir(PROJECTS_DIR, '.json');
    }
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  },

  spriteDataToCanvas(dataURL) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };
      img.src = dataURL;
    });
  },

  async loadSpritesIntoEditor(spritesData, pixelEditor) {
    const names = Object.keys(spritesData);
    for (const name of names) {
      const canvas = await projectPanel.spriteDataToCanvas(spritesData[name]);
      pixelEditor.sprites[name] = canvas;
    }
    pixelEditor.onStateChange && pixelEditor.onStateChange({ sprites: { ...pixelEditor.sprites } });
  }
};

export default projectPanel;
