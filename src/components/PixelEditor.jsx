import React, { useState, useEffect, useRef, useCallback } from 'react';
import pixelEditor from '../lib/pixel-editor';

function Palette({ colors, currentColor, onColorSelect }) {
  return (
    <div className="palette" id="palette">
      {colors.map((color, i) => (
        <div
          key={i}
          className={'palette-color' + (currentColor === color ? ' active' : '')}
          style={{ backgroundColor: color }}
          onClick={() => onColorSelect(color)}
        />
      ))}
    </div>
  );
}

function SpriteList({ sprites, onLoad, onDelete }) {
  const entries = Object.entries(sprites);
  if (entries.length === 0) {
    return (
      <div className="sprite-list" id="spriteList">
        <div className="empty-sprites">No sprites yet. Draw and save one!</div>
      </div>
    );
  }
  return (
    <div className="sprite-list" id="spriteList">
      {entries.map(([name, canvas]) => (
        <div key={name} className="sprite-item" onClick={() => onLoad(name)}>
          <canvas
            width={16}
            height={16}
            ref={(el) => {
              if (el) {
                const ctx = el.getContext('2d');
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(canvas, 0, 0, 16, 16);
              }
            }}
          />
          <span className="sprite-name">{name}</span>
          <button className="sprite-del" onClick={(e) => { e.stopPropagation(); onDelete(name); }}>×</button>
        </div>
      ))}
    </div>
  );
}

const PALETTE_COLORS = [
  '#000000', '#ffffff', '#e94560', '#0f3460', '#16213e', '#533483',
  '#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da',
  '#fcbad3', '#a8d8ea', '#ff9a3c', '#00b894', '#6c5ce7', '#dfe6e9'
];

export default function PixelEditor({ show }) {
  const canvasRef = useRef(null);
  const spriteNameRef = useRef(null);
  const [currentTool, setCurrentTool] = useState('brush');
  const [currentColor, setCurrentColor] = useState('#e94560');
  const [brushSize, setBrushSize] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [sprites, setSprites] = useState({});
  const [undoAvailable, setUndoAvailable] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    pixelEditor.onStateChange = (state) => {
      if (state.sprites) setSprites(state.sprites);
      if (state.undoAvailable !== undefined) setUndoAvailable(state.undoAvailable);
      if (state.colorPick) {
        setCurrentColor(state.colorPick);
      }
    };
    pixelEditor.init(canvasRef.current);
    return () => {
      pixelEditor.destroy();
      pixelEditor.onStateChange = null;
    };
  }, []);

  const handleToolClick = useCallback((tool) => {
    pixelEditor.setTool(tool);
    setCurrentTool(tool);
  }, []);

  const handleColorPicker = useCallback((e) => {
    const color = e.target.value;
    pixelEditor.setColor(color);
    setCurrentColor(color);
  }, []);

  const handlePaletteSelect = useCallback((color) => {
    pixelEditor.setColor(color);
    setCurrentColor(color);
  }, []);

  const handleBrushSize = useCallback((e) => {
    const size = parseInt(e.target.value) || 1;
    pixelEditor.setBrushSize(size);
    setBrushSize(size);
  }, []);

  const handleShowGrid = useCallback((e) => {
    pixelEditor.setShowGrid(e.target.checked);
    setShowGrid(e.target.checked);
  }, []);

  const handleClear = useCallback(() => {
    pixelEditor.clearPixels();
  }, []);

  const handleUndo = useCallback(() => {
    pixelEditor.undo();
  }, []);

  const handleSaveSprite = useCallback(() => {
    const name = spriteNameRef.current ? spriteNameRef.current.value.trim() : 'sprite';
    pixelEditor.saveSprite(name || 'sprite');
  }, []);

  const handleExportSprite = useCallback(() => {
    pixelEditor.exportSprite();
  }, []);

  const handleLoadSprite = useCallback((name) => {
    pixelEditor.loadSpriteToEditor(name);
  }, []);

  const handleDeleteSprite = useCallback((name) => {
    pixelEditor.deleteSprite(name);
  }, []);

  return (
    <div className="tab-content" style={{ display: show ? 'flex' : 'none' }}>
      <div className="pixel-editor-container">
        <div className="editor-header">
          <h2>Pixel Editor</h2>
          <div className="sprite-controls">
            <input type="text" id="spriteName" ref={spriteNameRef} placeholder="sprite_name" defaultValue="player" />
            <button id="saveSpriteBtn" onClick={handleSaveSprite}>💾 Save Sprite</button>
            <button id="exportSpriteBtn" onClick={handleExportSprite}>📤 Export PNG</button>
          </div>
        </div>
        <div className="pixel-editor-body">
          <div className="editor-left">
            <div className="toolbar">
              <input type="color" id="colorPicker" value={currentColor} onChange={handleColorPicker} />
              <button id="brushBtn" className={'tool-btn' + (currentTool === 'brush' ? ' active' : '')} title="Brush" onClick={() => handleToolClick('brush')}>✏️</button>
              <button id="eraserBtn" className={'tool-btn' + (currentTool === 'eraser' ? ' active' : '')} title="Eraser" onClick={() => handleToolClick('eraser')}>🧹</button>
              <button id="lineBtn" className={'tool-btn' + (currentTool === 'line' ? ' active' : '')} title="Line" onClick={() => handleToolClick('line')}>📏</button>
              <button id="fillBtn" className={'tool-btn' + (currentTool === 'fill' ? ' active' : '')} title="Fill" onClick={() => handleToolClick('fill')}>🪣</button>
              <button id="clearBtn" className="tool-btn" title="Clear" onClick={handleClear}>🗑️</button>
              <button id="undoBtn" className="tool-btn" title="Undo (Ctrl+Z)" onClick={handleUndo} disabled={!undoAvailable}>↩</button>
              <label className="tool-label">
                Size:
                <input type="number" id="brushSize" value={brushSize} onChange={handleBrushSize} min="1" max="10" />
              </label>
              <label className="tool-label">
                Grid:
                <input type="checkbox" id="showGrid" checked={showGrid} onChange={handleShowGrid} />
              </label>
            </div>
            <Palette colors={PALETTE_COLORS} currentColor={currentColor} onColorSelect={handlePaletteSelect} />
            <div className="canvas-wrapper">
              <canvas ref={canvasRef} id="pixelCanvas" width="512" height="512"></canvas>
            </div>
            <div className="canvas-info">Click/drag to draw • Right-click to pick color • Scroll to zoom</div>
          </div>
          <div className="editor-right">
            <h3>Sprites</h3>
            <SpriteList sprites={sprites} onLoad={handleLoadSprite} onDelete={handleDeleteSprite} />
          </div>
        </div>
      </div>
    </div>
  );
}
