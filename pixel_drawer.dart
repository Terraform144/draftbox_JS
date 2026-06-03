import 'dart:io';

void main() {
  final htmlContent = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pixel Drawer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'JetBrains Mono', monospace;
      background: #1a1a2e;
      color: #eee;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
    }
    h1 { margin-bottom: 20px; color: #e94560; }
    .toolbar {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .toolbar button, .toolbar input {
      padding: 10px 15px;
      border: 2px solid #16213e;
      background: #0f3460;
      color: #eee;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }
    .toolbar button:hover { background: #e94560; border-color: #e94560; }
    .toolbar button.active { background: #e94560; border-color: #e94560; }
    .toolbar input[type="color"] { width: 50px; height: 40px; padding: 2px; }
    .toolbar input[type="number"] { width: 70px; }
    .canvas-container {
      border: 3px solid #16213e;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    canvas { display: block; cursor: crosshair; }
    .palette {
      display: flex;
      gap: 5px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      justify-content: center;
      max-width: 500px;
    }
    .palette-color {
      width: 30px;
      height: 30px;
      border: 2px solid #16213e;
      border-radius: 4px;
      cursor: pointer;
    }
    .palette-color:hover { transform: scale(1.1); }
    .palette-color.active { border-color: #fff; }
    .info { margin-top: 20px; color: #888; font-size: 12px; }
  </style>
</head>
<body>
  <h1>🎨 Pixel Drawer</h1>
  <div class="toolbar">
    <input type="color" id="colorPicker" value="#e94560">
    <button id="brushBtn" class="active">Brush</button>
    <button id="eraserBtn">Eraser</button>
    <button id="lineBtn">Line</button>
    <button id="fillBtn">Fill</button>
    <button id="clearBtn">Clear</button>
    <button id="saveBtn">Save PNG</button>
    <label>Size: <input type="number" id="brushSize" value="1" min="1" max="10"></label>
    <label>Grid: <input type="checkbox" id="showGrid" checked></label>
  </div>
  <div class="palette" id="palette"></div>
  <div class="canvas-container">
    <canvas id="canvas" width="512" height="512"></canvas>
  </div>
  <div class="info">Click and drag to draw • Line: click start, move, click end • Right-click to pick color • Scroll to zoom</div>

  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('colorPicker');
    const brushSizeInput = document.getElementById('brushSize');
    const showGridCheckbox = document.getElementById('showGrid');
    const paletteContainer = document.getElementById('palette');
    
    let pixelSize = 8;
    let gridCols = canvas.width / pixelSize;
    let gridRows = canvas.height / pixelSize;
    let isDrawing = false;
    let currentTool = 'brush';
    let currentColor = '#e94560';
    let pixels = [];
    let lineStart = null;
    let lineEnd = null;
    
    const paletteColors = [
      '#000000', '#ffffff', '#e94560', '#0f3460', '#16213e', '#533483',
      '#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da',
      '#fcbad3', '#a8d8ea', '#ff9a3c', '#00b894', '#6c5ce7', '#dfe6e9'
    ];
    
    function initPixels() {
      pixels = [];
      for (let y = 0; y < gridRows; y++) {
        pixels[y] = [];
        for (let x = 0; x < gridCols; x++) {
          pixels[y][x] = null;
        }
      }
    }
    
    function createPalette() {
      paletteColors.forEach(color => {
        const div = document.createElement('div');
        div.className = 'palette-color';
        div.style.backgroundColor = color;
        div.addEventListener('click', () => {
          currentColor = color;
          colorPicker.value = color;
          document.querySelectorAll('.palette-color').forEach(c => c.classList.remove('active'));
          div.classList.add('active');
        });
        paletteContainer.appendChild(div);
      });
    }
    
    function draw() {
      ctx.fillStyle = '#0f0f23';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (let y = 0; y < gridRows; y++) {
        for (let x = 0; x < gridCols; x++) {
          if (pixels[y] && pixels[y][x]) {
            ctx.fillStyle = pixels[y][x];
            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
          }
        }
      }
      
      if (currentTool === 'line' && lineStart && lineEnd) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        const dx = Math.abs(lineEnd.x - lineStart.x);
        const dy = -Math.abs(lineEnd.y - lineStart.y);
        const sx = lineStart.x < lineEnd.x ? 1 : -1;
        const sy = lineStart.y < lineEnd.y ? 1 : -1;
        let err = dx + dy;
        let px = lineStart.x, py = lineStart.y;
        while (true) {
          ctx.fillRect(px * pixelSize, py * pixelSize, pixelSize, pixelSize);
          if (px === lineEnd.x && py === lineEnd.y) break;
          const e2 = 2 * err;
          if (e2 >= dy) { err += dy; px += sx; }
          if (e2 <= dx) { err += dx; py += sy; }
        }
      }

      if (showGridCheckbox.checked) {
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= gridCols; i++) {
          ctx.beginPath();
          ctx.moveTo(i * pixelSize, 0);
          ctx.lineTo(i * pixelSize, canvas.height);
          ctx.stroke();
        }
        for (let i = 0; i <= gridRows; i++) {
          ctx.beginPath();
          ctx.moveTo(0, i * pixelSize);
          ctx.lineTo(canvas.width, i * pixelSize);
          ctx.stroke();
        }
      }
    }
    
    function getPixelCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX / pixelSize);
      const y = Math.floor((e.clientY - rect.top) * scaleY / pixelSize);
      return { x: Math.max(0, Math.min(x, gridCols - 1)), y: Math.max(0, Math.min(y, gridRows - 1)) };
    }
    
    function drawPixel(x, y) {
      const size = parseInt(brushSizeInput.value);
      const half = Math.floor(size / 2);
      for (let dy = -half; dy < size - half; dy++) {
        for (let dx = -half; dx < size - half; dx++) {
          const px = x + dx;
          const py = y + dy;
          if (px >= 0 && px < gridCols && py >= 0 && py < gridRows) {
            if (!pixels[py]) pixels[py] = [];
            pixels[py][px] = currentTool === 'eraser' ? null : currentColor;
          }
        }
      }
      draw();
    }
    
    function floodFill(startX, startY) {
      const targetColor = pixels[startY] && pixels[startY][startX];
      if (targetColor === currentColor) return;
      
      const stack = [[startX, startY]];
      const visited = new Set();
      
      while (stack.length > 0) {
        const [x, y] = stack.pop();
        const key = x + ',' + y;
        if (visited.has(key)) continue;
        if (x < 0 || x >= gridCols || y < 0 || y >= gridRows) continue;
        if (pixels[y] && pixels[y][x] !== targetColor) continue;
        
        visited.add(key);
        if (!pixels[y]) pixels[y] = [];
        pixels[y][x] = currentColor;
        
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
      draw();
    }
    
    function drawLinePixels(x0, y0, x1, y1) {
      const dx = Math.abs(x1 - x0);
      const dy = -Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      let x = x0, y = y0;
      while (true) {
        drawPixel(x, y);
        if (x === x1 && y === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x += sx; }
        if (e2 <= dx) { err += dx; y += sy; }
      }
    }

    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        const { x, y } = getPixelCoords(e);
        const color = pixels[y] && pixels[y][x];
        if (color) {
          currentColor = color;
          colorPicker.value = color;
        }
        return;
      }
      const { x, y } = getPixelCoords(e);
      if (currentTool === 'fill') {
        floodFill(x, y);
      } else if (currentTool === 'line') {
        if (lineStart === null) {
          lineStart = { x, y };
          lineEnd = { x, y };
          draw();
        } else {
          drawLinePixels(lineStart.x, lineStart.y, x, y);
          lineStart = null;
          lineEnd = null;
          draw();
        }
      } else {
        isDrawing = true;
        drawPixel(x, y);
      }
    });
    
    canvas.addEventListener('mousemove', (e) => {
      if (currentTool === 'line' && lineStart !== null) {
        const { x, y } = getPixelCoords(e);
        lineEnd = { x, y };
        draw();
        return;
      }
      if (!isDrawing) return;
      const { x, y } = getPixelCoords(e);
      drawPixel(x, y);
    });
    
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseleave', () => {
      isDrawing = false;
      if (currentTool === 'line' && lineStart !== null) {
        lineStart = null;
        lineEnd = null;
        draw();
      }
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      pixelSize = Math.max(2, Math.min(32, pixelSize + (e.deltaY > 0 ? -1 : 1)));
      gridCols = Math.floor(canvas.width / pixelSize);
      gridRows = Math.floor(canvas.height / pixelSize);
      initPixels();
      draw();
    });
    
    colorPicker.addEventListener('input', (e) => {
      currentColor = e.target.value;
      document.querySelectorAll('.palette-color').forEach(c => c.classList.remove('active'));
    });
    
    function cancelLine() {
      if (currentTool === 'line' && lineStart !== null) {
        lineStart = null;
        lineEnd = null;
        draw();
      }
    }

    document.getElementById('brushBtn').addEventListener('click', () => {
      cancelLine();
      currentTool = 'brush';
      updateToolButtons();
    });
    
    document.getElementById('eraserBtn').addEventListener('click', () => {
      cancelLine();
      currentTool = 'eraser';
      updateToolButtons();
    });
    
    document.getElementById('lineBtn').addEventListener('click', () => {
      currentTool = 'line';
      lineStart = null;
      lineEnd = null;
      updateToolButtons();
      draw();
    });
    
    document.getElementById('fillBtn').addEventListener('click', () => {
      cancelLine();
      currentTool = 'fill';
      updateToolButtons();
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
      cancelLine();
      initPixels();
      draw();
    });
    
    document.getElementById('saveBtn').addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'pixel-art.png';
      link.href = canvas.toDataURL();
      link.click();
    });
    
    showGridCheckbox.addEventListener('change', draw);
    
    function updateToolButtons() {
      document.querySelectorAll('.toolbar button').forEach(btn => btn.classList.remove('active'));
      document.getElementById(currentTool + 'Btn').classList.add('active');
    }
    
    createPalette();
    initPixels();
    draw();
  </script>
</body>
</html>''';

  FileSystemEntity.typeSync('draftbox/pixel_drawer.html');
  final file = File('draftbox/pixel_drawer.html');
  file.writeAsStringSync(htmlContent);

  print(
      'Created draftbox/pixel_drawer.html - Open in a browser to use the pixel editor');
}
