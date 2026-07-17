import React, { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import PixelEditor from './components/PixelEditor';
import { defaultCode } from './lib/default-code';
import Scene from './components/Scene';
import Docs from './components/Docs';
import sceneRunner from './lib/scene-runner';
import pixelEditor from './lib/pixel-editor';
import demos from './lib/demos';

const CodeEditor = lazy(() => import('./components/CodeEditor'));

export default function App() {
  const [currentTab, setCurrentTab] = useState('editor');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [code, setCode] = useState(defaultCode);
  const codeRef = useRef(code);
  codeRef.current = code;

  useEffect(() => {
    pixelEditor.init(document.getElementById('pixelCanvas'));
    sceneRunner.init(document.getElementById('sceneCanvas'), {
      onLog() {}
    });
    window.__setCode = setCode;
    window.__getCode = () => codeRef.current;
    window.__getSprites = () => pixelEditor.getAllSprites();
    window.__pixelEditor = pixelEditor;
    return () => {
      delete window.__setCode;
      delete window.__getCode;
      delete window.__getSprites;
      delete window.__pixelEditor;
      pixelEditor.destroy();
    };
  }, []);

  const handleRun = useCallback(() => {
    const sprites = pixelEditor.getAllSprites();
    sceneRunner.run(code, sprites);
    setCurrentTab('scene');
  }, [code]);

  const handleStop = useCallback(() => {
    sceneRunner.stop();
  }, []);

  const handleSwitchTab = useCallback((tab) => {
    setCurrentTab(tab);
    setSidebarOpen(false);
  }, []);

  const handleDemoRun = useCallback((demoIndex) => {
    const demo = demos[demoIndex];
    if (!demo) return;
    setCode(demo.code);
    const sprites = pixelEditor.getAllSprites();
    sceneRunner.run(demo.code, sprites);
    setCurrentTab('scene');
  }, []);

  const handleLoadSource = useCallback(() => {
    setCurrentTab('code');
  }, []);

  useEffect(() => {
    window.__demoRunner = handleDemoRun;
    return () => { delete window.__demoRunner; };
  }, [handleDemoRun]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentTab === 'editor') {
          pixelEditor.saveSprite(document.getElementById('spriteName')?.value);
        } else {
          const saveBtn = document.getElementById('saveSourceBtn');
          if (saveBtn) saveBtn.click();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentTab, handleRun]);

  return (
    <div id="app" className={sidebarOpen ? 'sidebar-open' : ''}>
      <Sidebar currentTab={currentTab} onSwitchTab={handleSwitchTab} />
      <div id="sidebarOverlay" className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      <button id="sidebarToggle" className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
      <main id="main-content">
        <PixelEditor show={currentTab === 'editor'} />
        <Suspense fallback={null}>
          <CodeEditor show={currentTab === 'code'} code={code} onCodeChange={setCode} onRun={handleRun} />
        </Suspense>
        <Scene show={currentTab === 'scene'} onRun={handleRun} />
        <Docs show={currentTab === 'docs'} onRun={handleDemoRun} onLoadSource={handleLoadSource} />
      </main>
    </div>
  );
}
