import React from 'react';

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  return (bytes / 1024).toFixed(1) + ' KB';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ProjectsList({ projects, onLoad, onDelete, onRefresh }) {
  if (!projects || projects.length === 0) {
    return (
      <div id="projectsList" className="sources-list">
        <div className="empty-sources">
          <div className="empty-icon">📦</div>
          <p>No saved projects yet.</p>
          <p style={{ fontSize: 12, marginTop: 8, color: 'var(--text-secondary)' }}>
            Use the Save Project button to save your pixel art and code together.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="projectsList" className="sources-list">
      {projects.map((p) => (
        <div key={p.name} className="source-item" onClick={() => onLoad(p.name)}>
          <span className="source-icon">📦</span>
          <div className="source-info">
            <div className="source-name">{p.name}</div>
            <div className="source-meta">
              {formatSize(p.size)} &middot; {formatDate(p.mtime)}
            </div>
          </div>
          <div className="source-actions">
            <button className="source-load" title="Load project" onClick={(e) => { e.stopPropagation(); onLoad(p.name); }}>📂 Load</button>
            <button className="source-load" title="Delete project" onClick={(e) => { e.stopPropagation(); onDelete(p.name); }} style={{ color: '#e94560' }}>🗑️</button>
          </div>
        </div>
      ))}
    </div>
  );
}
