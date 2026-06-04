import React, { useCallback, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { undo, redo } from '@codemirror/commands';
import sourcesPanel from '../lib/sources-panel';
import { defaultCode } from '../lib/default-code';

export default function CodeEditor({ show, code, onCodeChange, onRun }) {
  const editorRef = useRef(null);

  const handleUndo = useCallback(() => {
    const view = editorRef.current?.view;
    if (view) undo(view);
  }, []);

  const handleRedo = useCallback(() => {
    const view = editorRef.current?.view;
    if (view) redo(view);
  }, []);

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
          <button title="Undo (Ctrl+Z)" onClick={handleUndo}>↩</button>
          <button title="Redo (Ctrl+Y)" onClick={handleRedo}>↪</button>
        </div>
      </div>
      <div className="code-editor-body">
        <div className="code-editor-wrapper">
          <CodeMirror
            ref={editorRef}
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
