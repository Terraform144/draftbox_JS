import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sections, bindDemoButtons, bindSearch } from '../lib/docs-content';
import sourcesPanel from '../lib/sources-panel';

export default function Docs({ show, onRun, onLoadSource }) {
  const [activeSubTab, setActiveSubTab] = useState('documentation');
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');
  const [sources, setSources] = useState([]);
  const searchInputRef = useRef(null);
  const navRef = useRef(null);
  const sourcesListRef = useRef(null);

  useEffect(() => {
    setActiveSection(sections[0]?.id || '');
  }, []);

  const handleLoadSource = useCallback(async (name) => {
    try {
      const res = await fetch('/api/sources/' + encodeURIComponent(name));
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      window.__setCode && window.__setCode(data.code);
      document.getElementById('sourceNameInput').value = data.name;
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
      const sourcesWithCallbacks = data.map(s => ({
        ...s,
        _onLoad: handleLoadSource,
        _onDelete: handleDeleteSource
      }));
      setSources(sourcesWithCallbacks);
    } catch (err) {
      console.error('Refresh sources error:', err);
    }
  }, [handleLoadSource, handleDeleteSource]);

  useEffect(() => {
    if (activeSubTab === 'sources') {
      refreshSources();
    }
  }, [activeSubTab, refreshSources]);

  useEffect(() => {
    if (sourcesListRef.current) {
      sourcesPanel.renderList(sources, sourcesListRef.current);
    }
  }, [sources]);

  useEffect(() => {
    if (show && activeSubTab === 'documentation') {
      if (searchInputRef.current && navRef.current) {
        bindSearch(searchInputRef.current, navRef.current);
      }
      bindDemoButtons(onRun);
    }
  }, [show, activeSubTab, onRun, activeSection]);

  const currentContent = sections.find(s => s.id === activeSection)?.content || sections[0]?.content || '';

  return (
    <div className="tab-content" style={{ display: show ? 'flex' : 'none' }}>
      <div className="docs-container">
        <div className="docs-subtabs">
          <button className={`docs-subtab ${activeSubTab === 'documentation' ? 'active' : ''}`} data-subtab="documentation" onClick={() => setActiveSubTab('documentation')}>📖 Documentation</button>
          <button className={`docs-subtab ${activeSubTab === 'sources' ? 'active' : ''}`} data-subtab="sources" onClick={() => setActiveSubTab('sources')}>📁 Sources</button>
        </div>
        <div id="docs-subtab-documentation" className={`docs-subtab-content ${activeSubTab === 'documentation' ? 'active' : ''}`}>
          <div className="editor-header">
            <h2>Documentation</h2>
            <input type="text" id="docsSearch" placeholder="Search docs..." className="docs-search" ref={searchInputRef} />
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
            <nav className="docs-nav" id="docsNav" ref={navRef}>
              {sections.map(section => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={activeSection === section.id ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); setActiveSection(section.id); }}
                >
                  {section.title}
                </a>
              ))}
            </nav>
            <div className="docs-content" id="docsContent" dangerouslySetInnerHTML={{ __html: currentContent }} />
          </div>
        </div>
        <div id="docs-subtab-sources" className={`docs-subtab-content ${activeSubTab === 'sources' ? 'active' : ''}`}>
          <div className="sources-container">
            <div className="editor-header">
              <h2>Sources</h2>
              <button id="refreshSourcesBtn" title="Refresh list" onClick={refreshSources}>🔄 Refresh</button>
            </div>
            <div id="sourcesList" className="sources-list" ref={sourcesListRef}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
