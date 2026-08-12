import React from 'react';

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  return (bytes / 1024).toFixed(1) + ' KB';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function SourcesList({ sources, onLoad, onRefresh }) {
  if (!sources || sources.length === 0) {
    return (
      <div id="sourcesList" className="sources-list">
        <div className="empty-sources">
          <div className="empty-icon">📁</div>
          <p>No saved sources yet.</p>
          <p style={{ fontSize: 12, marginTop: 8, color: 'var(--text-secondary)' }}>
            Use the Save button in the Code Editor to save your work.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="sourcesList" className="sources-list">
      {sources.map((s, i) => (
        <div key={s.name} className="source-item" onClick={() => onLoad(s.name)}>
          <span className="source-icon">📄</span>
          <div className="source-info">
            <div className="source-name">{s.name}.js</div>
            <div className="source-meta">
              {formatSize(s.size)} &middot; {formatDate(s.mtime)}
            </div>
          </div>
          <div className="source-actions">
            <button className="source-load" title="Load into editor" onClick={(e) => { e.stopPropagation(); onLoad(s.name); }}>📂 Load</button>
          </div>
        </div>
      ))}
    </div>
  );
}
