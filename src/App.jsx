import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
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

  useEffect(() => {
    pixelEditor.init('pixelCanvas');
    sceneRunner.init('sceneCanvas');
    window.__setCode = setCode;
    return () => { delete window.__setCode; };
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
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentTab === 'editor') {
          pixelEditor.saveSprite();
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
      <Sidebar currentTab={currentTab} onSwitchTab={handleSwitchTab} onRun={handleRun} onStop={handleStop} />
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
