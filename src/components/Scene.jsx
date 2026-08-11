import React, { useState, useEffect, useRef, useCallback } from 'react';
import sceneRunner from '../lib/scene-runner';

const SHAPES = ['Carré', 'Triangle', 'Hexagone', 'Étoile', 'Fleur', 'Spirale'];

function getFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement ||
    document.mozFullScreenElement || document.msFullscreenElement || null;
}

function requestFullscreen(el) {
  const fn = el.requestFullscreen || el.webkitRequestFullscreen ||
    el.mozRequestFullScreen || el.msRequestFullscreen;
  if (!fn) return Promise.reject(new Error('Fullscreen API not supported on this browser'));
  return fn.call(el);
}

function exitFullscreen() {
  const fn = document.exitFullscreen || document.webkitExitFullscreen ||
    document.mozCancelFullScreen || document.msExitFullscreen;
  if (!fn) return Promise.reject(new Error('Fullscreen API not supported on this browser'));
  return fn.call(document);
}

const FULLSCREEN_CHANGE_EVENTS = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];

function TurtlePanel({ report }) {
  const [shape, setShape] = useState(SHAPES[0]);
  const [distance, setDistance] = useState(60);
  const [goX, setGoX] = useState(0);
  const [goY, setGoY] = useState(0);

  const runShape = useCallback(() => {
    sceneRunner.sendCommand({ type: 'shape', name: shape });
  }, [shape]);

  const runTrace = useCallback(() => {
    sceneRunner.sendCommand({ type: 'avance', value: Number(distance) || 0 });
  }, [distance]);

  const runGoto = useCallback(() => {
    sceneRunner.sendCommand({ type: 'aller', x: Number(goX) || 0, y: Number(goY) || 0 });
  }, [goX, goY]);

  const runPenUp = useCallback(() => sceneRunner.sendCommand({ type: 'penup' }), []);
  const runPenDown = useCallback(() => sceneRunner.sendCommand({ type: 'pendown' }), []);
  const runClear = useCallback(() => sceneRunner.sendCommand({ type: 'clear' }), []);

  const live = !!report;
  const isAuto = live ? report.auto !== false : true;
  const toggleAuto = useCallback(() => {
    sceneRunner.sendCommand({ type: isAuto ? 'pause' : 'resume' });
  }, [isAuto]);

  return (
    <div className="turtle-panel">
      <div className="turtle-panel-group">
        <span className="turtle-panel-icon" aria-hidden="true">🐢</span>
        <select className="turtle-select" value={shape} onChange={(e) => setShape(e.target.value)} aria-label="Forme">
          {SHAPES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="turtle-btn turtle-btn-primary" onClick={runShape}>▶ Exécuter</button>
        <button
          className={'turtle-btn turtle-icon-btn' + (isAuto ? ' turtle-btn-active' : '')}
          onClick={toggleAuto}
          title={isAuto ? 'Mettre le dessin automatique en pause' : 'Reprendre le dessin automatique'}
        >
          {isAuto ? '⏸' : '▶'}
        </button>
      </div>

      <div className="turtle-panel-divider" />

      <div className="turtle-panel-group">
        <label className="turtle-field">
          Tracer
          <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} />
        </label>
        <button className="turtle-btn" onClick={runTrace}>Tracer</button>
      </div>

      <div className="turtle-panel-divider" />

      <div className="turtle-panel-group">
        <button className="turtle-btn" onClick={runPenUp} title="Lever le crayon">✎↑ Lever</button>
        <button className="turtle-btn" onClick={runPenDown} title="Abaisser le crayon">✎↓ Abaisser</button>
      </div>

      <div className="turtle-panel-divider" />

      <div className="turtle-panel-group">
        <label className="turtle-field turtle-field-goto">
          Aller à
          <input type="number" value={goX} onChange={(e) => setGoX(e.target.value)} aria-label="Coordonnée X cible" />
          <span className="turtle-field-sep">,</span>
          <input type="number" value={goY} onChange={(e) => setGoY(e.target.value)} aria-label="Coordonnée Y cible" />
        </label>
        <button className="turtle-btn" onClick={runGoto}>Aller à</button>
      </div>

      <div className="turtle-panel-divider" />

      <button className="turtle-btn turtle-btn-danger" onClick={runClear} title="Effacer le dessin">🧹 Effacer</button>

      <div className="turtle-panel-divider" />

      <div className="turtle-coords">
        <span className={'turtle-coords-dot' + (live ? ' live' : '')} aria-hidden="true" />
        <span className="turtle-coords-item"><b>X</b>{live ? report.x : '—'}</span>
        <span className="turtle-coords-item"><b>Y</b>{live ? report.y : '—'}</span>
        <span className="turtle-coords-item"><b>CAP</b>{live ? report.cap + '°' : '—'}</span>
      </div>
    </div>
  );
}

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
  const [turtleReport, setTurtleReport] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported] = useState(() => {
    const el = document.documentElement;
    return !!(el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen);
  });

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
    sceneRunner.onReport = (data) => setTurtleReport(data);
    return () => { sceneRunner.onReport = null; };
  }, []);

  useEffect(() => {
    // Compute the canvas pixel size directly instead of relying only on CSS
    // (object-fit on <canvas> and :fullscreen sizing behave inconsistently
    // across browsers/embeds), so fullscreen zoom is guaranteed everywhere.
    const applySize = () => {
      const canvas = canvasRef.current;
      const fsEl = getFullscreenElement();
      const active = !!fsEl && fsEl === wrapperRef.current;
      setIsFullscreen(active);
      if (!canvas) return;
      if (active) {
        const ratio = 960 / 540;
        let w = window.innerWidth;
        let h = w / ratio;
        if (h > window.innerHeight) { h = window.innerHeight; w = h * ratio; }
        canvas.style.width = Math.round(w) + 'px';
        canvas.style.height = Math.round(h) + 'px';
      } else {
        canvas.style.width = '';
        canvas.style.height = '';
      }
    };
    FULLSCREEN_CHANGE_EVENTS.forEach(evt => document.addEventListener(evt, applySize));
    window.addEventListener('resize', applySize);
    return () => {
      FULLSCREEN_CHANGE_EVENTS.forEach(evt => document.removeEventListener(evt, applySize));
      window.removeEventListener('resize', applySize);
    };
  }, []);

  const handleStop = useCallback(() => {
    sceneRunner.stop();
  }, []);

  const handleReset = useCallback(() => {
    setLogs([]);
    setTurtleReport(null);
    sceneRunner.reset();
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!getFullscreenElement()) {
      if (!wrapperRef.current) return;
      requestFullscreen(wrapperRef.current).catch((err) => {
        console.warn('Plein écran indisponible :', err.message);
      });
    } else {
      exitFullscreen().catch(() => {});
    }
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
          <div className="scene-canvas-wrapper" ref={wrapperRef}>
            <canvas ref={canvasRef} id="sceneCanvas" width="960" height="540"></canvas>
            {fullscreenSupported && (
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
            )}
            <TurtlePanel report={turtleReport} />
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
