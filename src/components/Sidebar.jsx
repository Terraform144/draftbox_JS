import React from 'react';

export default function Sidebar({ currentTab, onSwitchTab }) {
  return (
    <nav id="sidebar">
      <div className="sidebar-header">
        <h1>🎮 DraftBox</h1>
        <span className="subtitle">Game Creator</span>
      </div>
      <div className="sidebar-tabs">
        <button className={`tab-btn ${currentTab === 'editor' ? 'active' : ''}`} data-tab="editor" onClick={() => onSwitchTab('editor')}>
          <span className="tab-icon">🎨</span>
          <span className="tab-label">Pixel Editor</span>
        </button>
        <button className={`tab-btn ${currentTab === 'code' ? 'active' : ''}`} data-tab="code" onClick={() => onSwitchTab('code')}>
          <span className="tab-icon">💻</span>
          <span className="tab-label">Code Editor</span>
        </button>
        <button className={`tab-btn ${currentTab === 'scene' ? 'active' : ''}`} data-tab="scene" onClick={() => onSwitchTab('scene')}>
          <span className="tab-icon">🎬</span>
          <span className="tab-label">Scene</span>
        </button>
        <button className={`tab-btn ${currentTab === 'docs' ? 'active' : ''}`} data-tab="docs" onClick={() => onSwitchTab('docs')}>
          <span className="tab-icon">📖</span>
          <span className="tab-label">Docs</span>
        </button>
      </div>

    </nav>
  );
}
