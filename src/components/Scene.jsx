import React from 'react';

export default function Scene({ show }) {
  return (
    <div className="tab-content" style={{ display: show ? 'flex' : 'none' }}>
      <div className="scene-container">
        <div className="editor-header">
          <h2>Scene</h2>
          <div className="scene-controls">
            <button id="sceneRunBtn" className="btn-run">▶ Run</button>
            <button id="sceneStopBtn" className="btn-stop">■ Stop</button>
            <button id="sceneResetBtn">↺ Reset</button>
          </div>
        </div>
        <div className="scene-body">
          <div className="scene-canvas-wrapper">
            <canvas id="sceneCanvas" width="960" height="540"></canvas>
          </div>
          <div className="scene-output">
            <h3>Console</h3>
            <div id="consoleOutput" className="console-output"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
