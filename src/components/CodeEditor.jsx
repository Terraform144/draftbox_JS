import React, { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import sourcesPanel from '../lib/sources-panel';

const defaultCode = `// DraftBox Game
// Available API:
//   init()           - called once at start
//   update(dt)       - called every frame (dt in seconds)
//   draw(ctx)        - called every frame to render
//   keys             - keyboard state (e.g. keys.Space, keys.ArrowLeft)
//   mouse            - mouse state (mouse.x, mouse.y, mouse.left)
//   sprites          - sprite canvases from Pixel Editor
//   canvas           - the game canvas element
//   rand(min, max)   - random float
//   clamp(v, min, max)
//   rectCollide(a, b)
//   audio(name)      - play a sound

let player = { x: 400, y: 250, w: 32, h: 32, speed: 300 };
let score = 0;
let coins = [];

function init() {
  for (let i = 0; i < 5; i++) {
    coins.push({
      x: rand(50, 850),
      y: rand(50, 450),
      w: 16, h: 16,
      collected: false
    });
  }
}

function update(dt) {
  if (keys.ArrowLeft || keys.KeyA) player.x -= player.speed * dt;
  if (keys.ArrowRight || keys.KeyD) player.x += player.speed * dt;
  if (keys.ArrowUp || keys.KeyW) player.y -= player.speed * dt;
  if (keys.ArrowDown || keys.KeyS) player.y += player.speed * dt;

  player.x = clamp(player.x, 0, canvas.width - player.w);
  player.y = clamp(player.y, 0, canvas.height - player.h);

  for (let coin of coins) {
    if (!coin.collected && rectCollide(player, coin)) {
      coin.collected = true;
      score++;
    }
  }
}

function draw(ctx) {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let coin of coins) {
    if (!coin.collected) {
      if (sprites.player) {
        ctx.drawImage(sprites.player, coin.x, coin.y, coin.w, coin.h);
      } else {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(coin.x + 8, coin.y + 8, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (sprites.player) {
    ctx.drawImage(sprites.player, player.x, player.y, player.w, player.h);
  } else {
    ctx.fillStyle = '#e94560';
    ctx.fillRect(player.x, player.y, player.w, player.h);
  }

  ctx.fillStyle = '#fff';
  ctx.font = '18px monospace';
  ctx.fillText('Score: ' + score, 16, 32);
}
`;

export default function CodeEditor({ show, code, onCodeChange, onRun }) {
  const handleSave = useCallback(async () => {
    const name = document.getElementById('sourceNameInput').value;
    try {
      await sourcesPanel.saveSource(code, name);
    } catch (err) {
      console.error('Save failed:', err);
    }
  }, [code]);

  const handleNew = useCallback(() => {
    onCodeChange(defaultCode);
    const input = document.getElementById('sourceNameInput');
    if (input) input.value = 'my_game';
  }, [onCodeChange]);

  const handleFormat = useCallback(() => {
    try {
      const formatted = code
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n');
      onCodeChange(formatted);
    } catch (e) {
      console.error('Format failed:', e);
    }
  }, [code, onCodeChange]);

  const handleChange = useCallback((value) => {
    onCodeChange(value);
  }, [onCodeChange]);

  return (
    <div className="tab-content code-editor-container" style={{ display: show ? 'flex' : 'none' }}>
      <div className="editor-header">
        <h2>Code Editor</h2>
        <div className="code-controls">
          <span className="file-name" id="currentFileName">game.js</span>
          <input type="text" id="sourceNameInput" placeholder="source_name" defaultValue="my_game" className="source-name-input" />
          <button id="saveSourceBtn" title="Save source (Ctrl+S)" onClick={handleSave}>💾 Save</button>
          <button id="newSourceBtn" title="New source" onClick={handleNew}>📄 New</button>
          <button id="formatBtn" title="Format Code" onClick={handleFormat}>🔧</button>
        </div>
      </div>
      <div className="code-editor-body">
        <div className="code-editor-wrapper">
          <CodeMirror
            value={code || defaultCode}
            onChange={handleChange}
            extensions={[javascript()]}
            theme={oneDark}
            height="100%"
            indentWithTab={false}
          />
        </div>
        <div className="code-sidebar">
          <h3>Game API</h3>
          <div className="api-ref">
            <div className="api-item">
              <code>update(dt)</code>
              <span>Called every frame. dt = delta time in seconds.</span>
            </div>
            <div className="api-item">
              <code>draw(ctx)</code>
              <span>Called every frame to render.</span>
            </div>
            <div className="api-item">
              <code>init()</code>
              <span>Called once at game start.</span>
            </div>
            <div className="api-item">
              <code>keys</code>
              <span>Object with keyboard state (<code>keys.Space</code>, <code>keys.ArrowLeft</code>)</span>
            </div>
            <div className="api-item">
              <code>mouse</code>
              <span>Mouse state (<code>mouse.x</code>, <code>mouse.y</code>, <code>mouse.left</code>)</span>
            </div>
            <div className="api-item">
              <code>sprites</code>
              <span>Object with sprite canvases by name.</span>
            </div>
            <div className="api-item">
              <code>audio(name)</code>
              <span>Play a sound by name.</span>
            </div>
            <div className="api-item">
              <code>rand(min, max)</code>
              <span>Random float between min and max.</span>
            </div>
            <div className="api-item">
              <code>clamp(val, min, max)</code>
              <span>Clamp value between min and max.</span>
            </div>
            <div className="api-item">
              <code>rectCollide(a, b)</code>
              <span>AABB collision test between two rects <code>{'{x,y,w,h}'}</code>.</span>
            </div>
            <div className="api-item">
              <code>canvas</code>
              <span>The game canvas element.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
