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
  const [logs, setLogs] = useState([]);
  const [touchState, setTouchState] = useState({});

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

  const handleStop = useCallback(() => {
    sceneRunner.stop();
  }, []);

  const handleReset = useCallback(() => {
    setLogs([]);
    sceneRunner.reset();
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
          <div className="scene-canvas-wrapper">
            <canvas ref={canvasRef} id="sceneCanvas" width="960" height="540"></canvas>
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
