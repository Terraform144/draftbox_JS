import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sections } from '../lib/docs-content';
import sourcesPanel from '../lib/sources-panel';
import SourcesList from './SourcesList';

export default function Docs({ show, onRun, onLoadSource }) {
  const [activeSubTab, setActiveSubTab] = useState('documentation');
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');
  const [sources, setSources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const docsContentRef = useRef(null);

  useEffect(() => {
    setActiveSection(sections[0]?.id || '');
  }, []);

  const handleLoadSource = useCallback(async (name) => {
    try {
      const res = await fetch('/api/sources/' + encodeURIComponent(name));
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      window.__setCode && window.__setCode(data.code);
      const input = document.getElementById('sourceNameInput');
      if (input) input.value = data.name;
      onLoadSource && onLoadSource();
    } catch (err) {
      console.error('Load source error:', err);
    }
  }, [onLoadSource]);

  const handleDeleteSource = useCallback(async (name) => {
    try {
      await fetch('/api/sources/' + encodeURIComponent(name), { method: 'DELETE' });
      const updated = sources.filter(s => s.name !== name);
      setSources(updated);
    } catch (err) {
      console.error('Delete source error:', err);
    }
  }, [sources]);

  const refreshSources = useCallback(async () => {
    try {
      const data = await sourcesPanel.refreshList();
      setSources(data);
    } catch (err) {
      console.error('Refresh sources error:', err);
    }
  }, []);

  useEffect(() => {
    if (activeSubTab === 'sources') {
      refreshSources();
    }
  }, [activeSubTab, refreshSources]);

  useEffect(() => {
    if (!show || activeSubTab !== 'documentation') return;
    const el = docsContentRef.current;
    if (!el) return;
    const handler = (e) => {
      const btn = e.target.closest('.demo-play-btn');
      if (btn && btn.dataset.demo !== undefined) {
        onRun && onRun(parseInt(btn.dataset.demo));
      }
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [show, activeSubTab, onRun]);

  const currentContent = sections.find(s => s.id === activeSection)?.content || sections[0]?.content || '';

  const filteredSections = searchQuery
    ? sections.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : sections;

  return (
    <div className="tab-content" style={{ display: show ? 'flex' : 'none' }}>
      <div className="docs-container">
        <div className="docs-subtabs">
          <button className={'docs-subtab' + (activeSubTab === 'documentation' ? ' active' : '')} onClick={() => setActiveSubTab('documentation')}>📖 Documentation</button>
          <button className={'docs-subtab' + (activeSubTab === 'sources' ? ' active' : '')} onClick={() => setActiveSubTab('sources')}>📁 Sources</button>
        </div>
        <div className={'docs-subtab-content' + (activeSubTab === 'documentation' ? ' active' : '')}>
          <div className="editor-header">
            <h2>Documentation</h2>
            <input type="text" id="docsSearch" placeholder="Search docs..." className="docs-search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <select
            id="docsNavSelect"
            className="docs-nav-select"
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
          >
            {sections.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
          <div className="docs-body">
            <nav className="docs-nav" id="docsNav">
              {filteredSections.map(section => (
                <a
                  key={section.id}
                  href={'#' + section.id}
                  className={activeSection === section.id ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); setActiveSection(section.id); }}
                >
                  {section.title}
                </a>
              ))}
            </nav>
            <div className="docs-content" id="docsContent" ref={docsContentRef} dangerouslySetInnerHTML={{ __html: currentContent }} />
          </div>
        </div>
        <div className={'docs-subtab-content' + (activeSubTab === 'sources' ? ' active' : '')}>
          <div className="sources-container">
            <div className="editor-header">
              <h2>Sources</h2>
              <button id="refreshSourcesBtn" onClick={refreshSources}>🔄 Refresh</button>
            </div>
            <SourcesList sources={sources} onLoad={handleLoadSource} onDelete={handleDeleteSource} onRefresh={refreshSources} />
          </div>
        </div>
      </div>
    </div>
  );
}
