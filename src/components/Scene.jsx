import React, { useState, useEffect, useRef, useCallback } from 'react';
import sceneRunner from '../lib/scene-runner';

function ConsoleOutput({ logs }) {
  const consoleRef = useRef(null);
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);
  return (
    <div id="consoleOutput" className="console-output" ref={consoleRef}>
      {logs.map((log, i) => (
        <div key={i} className={log.type}>{'> ' + log.msg}</div>
      ))}
    </div>
  );
}

export default function Scene({ show, onRun }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [touchState, setTouchState] = useState({});
  // CSS-only "fake" fullscreen (position:fixed overlay) instead of the
  // native Fullscreen API: the app is commonly embedded in an <iframe>
  // (e.g. gamecreator.debrouillard.be) that isn't granted the "fullscreen"
  // Permissions-Policy, which makes element.requestFullscreen() silently
  // reject in there. A CSS overlay needs no permission and works the same
  // whether the page is top-level or embedded.
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    sceneRunner.init(canvasRef.current, {
      onLog(msg, type) {
        setLogs(prev => [...prev, { msg, type }]);
      },
      onClear() {
        setLogs([]);
      }
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!isFullscreen) {
      canvas.style.width = '';
      canvas.style.height = '';
      return;
    }
    const applySize = () => {
      const ratio = 960 / 540;
      let w = window.innerWidth;
      let h = w / ratio;
      if (h > window.innerHeight) { h = window.innerHeight; w = h * ratio; }
      canvas.style.width = Math.round(w) + 'px';
      canvas.style.height = Math.round(h) + 'px';
    };
    applySize();
    window.addEventListener('resize', applySize);
    const onKey = (e) => { if (e.key === 'Escape') setIsFullscreen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', applySize);
      document.removeEventListener('keydown', onKey);
    };
  }, [isFullscreen]);

  const handleStop = useCallback(() => {
    sceneRunner.stop();
  }, []);

  const handleReset = useCallback(() => {
    setLogs([]);
    sceneRunner.reset();
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(f => !f);
  }, []);

  const handleTouchStart = useCallback((keyCode) => (e) => {
    e.preventDefault();
    if (sceneRunner.running && sceneRunner.keys) {
      sceneRunner.keys[keyCode] = true;
    }
    setTouchState(prev => ({ ...prev, [keyCode]: true }));
  }, []);

  const handleTouchEnd = useCallback((keyCode) => (e) => {
    e.preventDefault();
    if (sceneRunner.running && sceneRunner.keys) {
      sceneRunner.keys[keyCode] = false;
    }
    setTouchState(prev => ({ ...prev, [keyCode]: false }));
  }, []);

  const touchBtn = (id, label, keyCode) => (
    <div
      className={'touch-btn' + (touchState[keyCode] ? ' pressed' : '') + (label === '' ? ' empty' : '')}
      id={id}
      onTouchStart={handleTouchStart(keyCode)}
      onTouchEnd={handleTouchEnd(keyCode)}
      onTouchCancel={handleTouchEnd(keyCode)}
      onMouseDown={() => { if (sceneRunner.running && sceneRunner.keys) sceneRunner.keys[keyCode] = true; }}
      onMouseUp={() => { if (sceneRunner.running && sceneRunner.keys) sceneRunner.keys[keyCode] = false; }}
      onMouseLeave={() => { if (sceneRunner.running && sceneRunner.keys) sceneRunner.keys[keyCode] = false; }}
    >
      {label}
    </div>
  );

  return (
    <div className="tab-content" style={{ display: show ? 'flex' : 'none' }}>
      <div className="scene-container">
        <div className="editor-header">
          <h2>Scene</h2>
          <div className="scene-controls">
            <button id="sceneRunBtn" className="btn-run" onClick={onRun}>▶ Run</button>
            <button id="sceneStopBtn" className="btn-stop" onClick={handleStop}>■ Stop</button>
            <button id="sceneResetBtn" onClick={handleReset}>↺ Reset</button>
          </div>
        </div>
        <div className="scene-body">
          <div className={'scene-canvas-wrapper' + (isFullscreen ? ' pseudo-fullscreen' : '')} ref={wrapperRef}>
            <canvas ref={canvasRef} id="sceneCanvas" width="960" height="540"></canvas>
            <button
              className="scene-fullscreen-btn"
              onClick={handleToggleFullscreen}
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
              aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 4v3a2 2 0 0 1-2 2H4" /><path d="M20 9h-3a2 2 0 0 1-2-2V4" /><path d="M4 15h3a2 2 0 0 1 2 2v3" /><path d="M15 20v-3a2 2 0 0 1 2-2h3" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 9V6a2 2 0 0 1 2-2h3" /><path d="M15 4h3a2 2 0 0 1 2 2v3" /><path d="M20 15v3a2 2 0 0 1-2 2h-3" /><path d="M9 20H6a2 2 0 0 1-2-2v-3" />
                </svg>
              )}
            </button>
          </div>
          <div className="scene-output">
            <h3>Console</h3>
            <ConsoleOutput logs={logs} />
          </div>
        </div>
        <div className="scene-touch-controls active" id="touchControls">
          <div className="touch-dpad">
            <div className="touch-btn empty"></div>
            {touchBtn('touch-up', '▲', 'ArrowUp')}
            <div className="touch-btn empty"></div>
            {touchBtn('touch-left', '◀', 'ArrowLeft')}
            {touchBtn('touch-down', '▼', 'ArrowDown')}
            {touchBtn('touch-right', '▶', 'ArrowRight')}
          </div>
          <div className="touch-actions">
            {touchBtn('touch-a', 'A', 'Space')}
            {touchBtn('touch-b', 'B', 'KeyX')}
          </div>
        </div>
      </div>
    </div>
  );
}
