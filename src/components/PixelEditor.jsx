import React from 'react';

export default function PixelEditor({ show }) {
  return (
    <div className="tab-content" style={{ display: show ? 'flex' : 'none' }}>
      <div className="pixel-editor-container">
        <div className="editor-header">
          <h2>Pixel Editor</h2>
          <div className="sprite-controls">
            <input type="text" id="spriteName" placeholder="sprite_name" defaultValue="player" />
            <button id="saveSpriteBtn">💾 Save Sprite</button>
            <button id="exportSpriteBtn">📤 Export PNG</button>
          </div>
        </div>
        <div className="pixel-editor-body">
          <div className="editor-left">
            <div className="toolbar">
              <input type="color" id="colorPicker" defaultValue="#e94560" />
              <button id="brushBtn" className="tool-btn active" title="Brush">✏️</button>
              <button id="eraserBtn" className="tool-btn" title="Eraser">🧹</button>
              <button id="lineBtn" className="tool-btn" title="Line">📏</button>
              <button id="fillBtn" className="tool-btn" title="Fill">🪣</button>
              <button id="clearBtn" className="tool-btn" title="Clear">🗑️</button>
              <label className="tool-label">
                Size:
                <input type="number" id="brushSize" defaultValue="1" min="1" max="10" />
              </label>
              <label className="tool-label">
                Grid:
                <input type="checkbox" id="showGrid" defaultChecked />
              </label>
            </div>
            <div className="palette" id="palette"></div>
            <div className="canvas-wrapper">
              <canvas id="pixelCanvas" width="512" height="512"></canvas>
            </div>
            <div className="canvas-info">Click/drag to draw • Right-click to pick color • Scroll to zoom</div>
          </div>
          <div className="editor-right">
            <h3>Sprites</h3>
            <div id="spriteList" className="sprite-list"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
