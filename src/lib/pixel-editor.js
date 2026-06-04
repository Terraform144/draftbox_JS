const pixelEditor = {
  canvas: null,
  ctx: null,
  pixelSize: 8,
  gridCols: 64,
  gridRows: 64,
  isDrawing: false,
  currentTool: 'brush',
  currentColor: '#e94560',
  pixels: [],
  lineStart: null,
  lineEnd: null,
  sprites: {},
  undoStack: [],
  undoMaxDepth: 5,
  showGrid: true,
  brushSize: 1,
  onStateChange: null,

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridCols = canvas.width / this.pixelSize;
    this.gridRows = canvas.height / this.pixelSize;
    this.initPixels();
    this.bindCanvasEvents();
    this.draw();
    this.onStateChange && this.onStateChange({ sprites: { ...this.sprites }, undoAvailable: this.undoStack.length > 0 });
  },

  destroy() {
    this.unbindCanvasEvents();
  },

  initPixels() {
    this.pixels = [];
    for (let y = 0; y < this.gridRows; y++) {
      this.pixels[y] = [];
      for (let x = 0; x < this.gridCols; x++) {
        this.pixels[y][x] = null;
      }
    }
  },

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < this.gridRows; y++) {
      for (let x = 0; x < this.gridCols; x++) {
        if (this.pixels[y] && this.pixels[y][x]) {
          ctx.fillStyle = this.pixels[y][x];
          ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
        }
      }
    }

    if (this.currentTool === 'line' && this.lineStart && this.lineEnd) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      const dx = Math.abs(this.lineEnd.x - this.lineStart.x);
      const dy = -Math.abs(this.lineEnd.y - this.lineStart.y);
      const sx = this.lineStart.x < this.lineEnd.x ? 1 : -1;
      const sy = this.lineStart.y < this.lineEnd.y ? 1 : -1;
      let err = dx + dy;
      let px = this.lineStart.x, py = this.lineStart.y;
      while (true) {
        ctx.fillRect(px * this.pixelSize, py * this.pixelSize, this.pixelSize, this.pixelSize);
        if (px === this.lineEnd.x && py === this.lineEnd.y) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; px += sx; }
        if (e2 <= dx) { err += dx; py += sy; }
      }
    }

    if (this.showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= this.gridCols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * this.pixelSize, 0);
        ctx.lineTo(i * this.pixelSize, this.canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i <= this.gridRows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * this.pixelSize);
        ctx.lineTo(this.canvas.width, i * this.pixelSize);
        ctx.stroke();
      }
    }
  },

  getPixelCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const clientX = e.clientX !== undefined ? e.clientX : e.pageX;
    const clientY = e.clientY !== undefined ? e.clientY : e.pageY;
    const x = Math.floor((clientX - rect.left) * scaleX / this.pixelSize);
    const y = Math.floor((clientY - rect.top) * scaleY / this.pixelSize);
    return { x: Math.max(0, Math.min(x, this.gridCols - 1)), y: Math.max(0, Math.min(y, this.gridRows - 1)) };
  },

  drawPixel(x, y) {
    const size = this.brushSize;
    const half = Math.floor(size / 2);
    for (let dy = -half; dy < size - half; dy++) {
      for (let dx = -half; dx < size - half; dx++) {
        const px = x + dx;
        const py = y + dy;
        if (px >= 0 && px < this.gridCols && py >= 0 && py < this.gridRows) {
          if (!this.pixels[py]) this.pixels[py] = [];
          this.pixels[py][px] = this.currentTool === 'eraser' ? null : this.currentColor;
        }
      }
    }
    this.draw();
  },

  drawLinePixels(x0, y0, x1, y1) {
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = x0, y = y0;
    while (true) {
      this.drawPixel(x, y);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x += sx; }
      if (e2 <= dx) { err += dx; y += sy; }
    }
  },

  floodFill(startX, startY) {
    const targetColor = this.pixels[startY] && this.pixels[startY][startX];
    if (targetColor === this.currentColor) return;
    const stack = [[startX, startY]];
    const visited = new Set();
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = x + ',' + y;
      if (visited.has(key)) continue;
      if (x < 0 || x >= this.gridCols || y < 0 || y >= this.gridRows) continue;
      if (this.pixels[y] && this.pixels[y][x] !== targetColor) continue;
      visited.add(key);
      if (!this.pixels[y]) this.pixels[y] = [];
      this.pixels[y][x] = this.currentColor;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    this.draw();
  },

  saveState() {
    this.undoStack.push(this.clonePixels());
    if (this.undoStack.length > this.undoMaxDepth) {
      this.undoStack.shift();
    }
    this.onStateChange && this.onStateChange({ undoAvailable: true });
  },

  clonePixels() {
    return this.pixels.map(row => [...row]);
  },

  undo() {
    if (this.undoStack.length === 0) return;
    this.pixels = this.undoStack.pop();
    this.lineStart = null;
    this.lineEnd = null;
    this.draw();
    this.onStateChange && this.onStateChange({ undoAvailable: this.undoStack.length > 0 });
  },

  clearPixels() {
    this.saveState();
    this.cancelLine();
    this.initPixels();
    this.draw();
  },

  cancelLine() {
    if (this.currentTool === 'line' && this.lineStart !== null) {
      this.lineStart = null;
      this.lineEnd = null;
      this.draw();
    }
  },

  exportSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = this.gridCols;
    canvas.height = this.gridRows;
    const ctx = canvas.getContext('2d');
    for (let y = 0; y < this.gridRows; y++) {
      for (let x = 0; x < this.gridCols; x++) {
        if (this.pixels[y] && this.pixels[y][x]) {
          ctx.fillStyle = this.pixels[y][x];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    const link = document.createElement('a');
    link.download = 'sprite.png';
    link.href = canvas.toDataURL();
    link.click();
  },

  saveSprite(name) {
    const spriteName = (name || 'sprite').trim() || 'sprite';
    const canvas = document.createElement('canvas');
    canvas.width = this.gridCols;
    canvas.height = this.gridRows;
    const ctx = canvas.getContext('2d');
    for (let y = 0; y < this.gridRows; y++) {
      for (let x = 0; x < this.gridCols; x++) {
        if (this.pixels[y] && this.pixels[y][x]) {
          ctx.fillStyle = this.pixels[y][x];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    this.sprites[spriteName] = canvas;
    this.onStateChange && this.onStateChange({ sprites: { ...this.sprites } });
    return spriteName;
  },

  deleteSprite(name) {
    delete this.sprites[name];
    this.onStateChange && this.onStateChange({ sprites: { ...this.sprites } });
  },

  loadSpriteToEditor(name) {
    const srcCanvas = this.sprites[name];
    if (!srcCanvas) return;
    this.saveState();
    this.initPixels();
    const srcCtx = srcCanvas.getContext('2d');
    const imageData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
    for (let y = 0; y < Math.min(srcCanvas.height, this.gridRows); y++) {
      for (let x = 0; x < Math.min(srcCanvas.width, this.gridCols); x++) {
        const i = (y * srcCanvas.width + x) * 4;
        const r = imageData.data[i], g = imageData.data[i + 1], b = imageData.data[i + 2], a = imageData.data[i + 3];
        if (a > 128) {
          const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
          this.pixels[y][x] = hex;
        }
      }
    }
    this.draw();
  },

  getSpriteCanvas(name) {
    return this.sprites[name] || null;
  },

  getAllSprites() {
    return this.sprites;
  },

  setTool(tool) {
    this.cancelLine();
    this.currentTool = tool;
  },

  setColor(color) {
    this.currentColor = color;
  },

  setBrushSize(size) {
    this.brushSize = Math.max(1, Math.min(10, parseInt(size) || 1));
  },

  setShowGrid(show) {
    this.showGrid = show;
    this.draw();
  },

  _canvasEventListeners: {},

  bindCanvasEvents() {
    const self = this;

    const mousedown = (e) => {
      if (e.button === 2) {
        const { x, y } = self.getPixelCoords(e);
        const color = self.pixels[y] && self.pixels[y][x];
        if (color) {
          self.currentColor = color;
          self.onStateChange && self.onStateChange({ colorPick: color });
        }
        return;
      }
      const { x, y } = self.getPixelCoords(e);
      if (self.currentTool === 'fill') { self.saveState(); self.floodFill(x, y); }
      else if (self.currentTool === 'line') {
        if (self.lineStart === null) {
          self.lineStart = { x, y }; self.lineEnd = { x, y }; self.draw();
        } else {
          self.saveState();
          self.drawLinePixels(self.lineStart.x, self.lineStart.y, x, y);
          self.lineStart = null; self.lineEnd = null; self.draw();
        }
      } else {
        self.saveState();
        self.isDrawing = true; self.drawPixel(x, y);
      }
    };

    const mousemove = (e) => {
      if (self.currentTool === 'line' && self.lineStart !== null) {
        const { x, y } = self.getPixelCoords(e);
        self.lineEnd = { x, y }; self.draw(); return;
      }
      if (!self.isDrawing) return;
      const { x, y } = self.getPixelCoords(e);
      self.drawPixel(x, y);
    };

    const mouseup = () => self.isDrawing = false;

    const mouseleave = () => {
      self.isDrawing = false;
      if (self.currentTool === 'line' && self.lineStart !== null) {
        self.lineStart = null; self.lineEnd = null; self.draw();
      }
    };

    const contextmenu = (e) => e.preventDefault();

    const touchstart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const { x, y } = self.getPixelCoords(touch);
      if (self.currentTool === 'fill') { self.saveState(); self.floodFill(x, y); }
      else if (self.currentTool === 'line') {
        if (self.lineStart === null) {
          self.lineStart = { x, y }; self.lineEnd = { x, y }; self.draw();
        } else {
          self.saveState();
          self.drawLinePixels(self.lineStart.x, self.lineStart.y, x, y);
          self.lineStart = null; self.lineEnd = null; self.draw();
        }
      } else {
        self.saveState();
        self.isDrawing = true; self.drawPixel(x, y);
      }
    };

    const touchmove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (self.currentTool === 'line' && self.lineStart !== null) {
        const { x, y } = self.getPixelCoords(touch);
        self.lineEnd = { x, y }; self.draw(); return;
      }
      if (!self.isDrawing) return;
      const { x, y } = self.getPixelCoords(touch);
      self.drawPixel(x, y);
    };

    const touchend = (e) => {
      e.preventDefault();
      self.isDrawing = false;
    };

    const wheel = (e) => {
      e.preventDefault();
      self.pixelSize = Math.max(2, Math.min(32, self.pixelSize + (e.deltaY > 0 ? -1 : 1)));
      self.draw();
    };

    this.canvas.addEventListener('mousedown', mousedown);
    this.canvas.addEventListener('mousemove', mousemove);
    this.canvas.addEventListener('mouseup', mouseup);
    this.canvas.addEventListener('mouseleave', mouseleave);
    this.canvas.addEventListener('contextmenu', contextmenu);
    this.canvas.addEventListener('touchstart', touchstart, { passive: false });
    this.canvas.addEventListener('touchmove', touchmove, { passive: false });
    this.canvas.addEventListener('touchend', touchend, { passive: false });
    this.canvas.addEventListener('wheel', wheel, { passive: false });

    this._canvasEventListeners = { mousedown, mousemove, mouseup, mouseleave, contextmenu, touchstart, touchmove, touchend, wheel };
  },

  unbindCanvasEvents() {
    if (!this.canvas) return;
    const listeners = this._canvasEventListeners;
    this.canvas.removeEventListener('mousedown', listeners.mousedown);
    this.canvas.removeEventListener('mousemove', listeners.mousemove);
    this.canvas.removeEventListener('mouseup', listeners.mouseup);
    this.canvas.removeEventListener('mouseleave', listeners.mouseleave);
    this.canvas.removeEventListener('contextmenu', listeners.contextmenu);
    this.canvas.removeEventListener('touchstart', listeners.touchstart);
    this.canvas.removeEventListener('touchmove', listeners.touchmove);
    this.canvas.removeEventListener('touchend', listeners.touchend);
    this.canvas.removeEventListener('wheel', listeners.wheel);
  }
};

export default pixelEditor;
