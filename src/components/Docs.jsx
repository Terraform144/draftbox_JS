import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sections } from '../lib/docs-content';
import sourcesPanel from '../lib/sources-panel';
import SourcesList from './SourcesList';
import ProjectsList from './ProjectsList';
import projectPanel from '../lib/project-panel';
import { generateStandaloneHTML } from '../lib/export-html';
import { isNative } from '../lib/native-fs';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export default function Docs({ show, onRun, onLoadSource }) {
  const [activeSubTab, setActiveSubTab] = useState('documentation');
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');
  const [sources, setSources] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const docsContentRef = useRef(null);
  const projectNameRef = useRef(null);

  useEffect(() => {
    setActiveSection(sections[0]?.id || '');
  }, []);

  const handleLoadSource = useCallback(async (name) => {
    try {
      const data = await sourcesPanel.load(name);
      window.__setCode && window.__setCode(data.code);
      const input = document.getElementById('sourceNameInput');
      if (input) input.value = data.name;
      onLoadSource && onLoadSource();
    } catch (err) {
      console.error('Load source error:', err);
    }
  }, [onLoadSource]);

  const refreshSources = useCallback(async () => {
    try {
      const data = await sourcesPanel.refreshList();
      setSources(data);
    } catch (err) {
      console.error('Refresh sources error:', err);
    }
  }, []);

  const refreshProjects = useCallback(async () => {
    try {
      const data = await projectPanel.refreshList();
      setProjects(data);
    } catch (err) {
      console.error('Refresh projects error:', err);
    }
  }, []);

  useEffect(() => {
    if (activeSubTab === 'sources') refreshSources();
    if (activeSubTab === 'projects') refreshProjects();
  }, [activeSubTab, refreshSources, refreshProjects]);

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

  const handleSaveProject = useCallback(async () => {
    const name = projectNameRef.current?.value?.trim();
    if (!name) return alert('Enter a project name');
    try {
      const code = window.__getCode ? window.__getCode() : '';
      const sprites = window.__getSprites ? window.__getSprites() : {};
      await projectPanel.save(name, code, sprites);
      await refreshProjects();
      if (projectNameRef.current) projectNameRef.current.value = '';
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  }, [refreshProjects]);

  const handleLoadProject = useCallback(async (name) => {
    try {
      const data = await projectPanel.load(name);
      if (data.code && window.__setCode) {
        window.__setCode(data.code);
      }
      if (data.sprites && window.__pixelEditor) {
        await projectPanel.loadSpritesIntoEditor(data.sprites, window.__pixelEditor);
      }
      onLoadSource && onLoadSource();
    } catch (err) {
      alert('Load failed: ' + err.message);
    }
  }, [onLoadSource]);

  const handleDeleteProject = useCallback(async (name) => {
    try {
      await projectPanel.delete(name);
      await refreshProjects();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  }, [refreshProjects]);

  const handleExportHTML = useCallback(async () => {
    try {
      const code = window.__getCode ? window.__getCode() : '';
      const sprites = window.__getSprites ? window.__getSprites() : {};
      const html = generateStandaloneHTML(code, sprites);

      if (isNative()) {
        const write = await Filesystem.writeFile({
          path: 'game.html',
          directory: Directory.Cache,
          data: html,
          encoding: 'utf8'
        });
        await Share.share({ title: 'game.html', url: write.uri, dialogTitle: 'Export game.html' });
        return;
      }

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'game.html';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  }, []);

  return (
    <div className="tab-content" style={{ display: show ? 'flex' : 'none' }}>
      <div className="docs-container">
        <div className="docs-subtabs">
          <button className={'docs-subtab' + (activeSubTab === 'documentation' ? ' active' : '')} onClick={() => setActiveSubTab('documentation')}>📖 Documentation</button>
          <button className={'docs-subtab' + (activeSubTab === 'sources' ? ' active' : '')} onClick={() => setActiveSubTab('sources')}>📁 Sources</button>
          <button className={'docs-subtab' + (activeSubTab === 'projects' ? ' active' : '')} onClick={() => setActiveSubTab('projects')}>📦 Projects</button>
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
            <SourcesList sources={sources} onLoad={handleLoadSource} onRefresh={refreshSources} />
          </div>
        </div>
        <div className={'docs-subtab-content' + (activeSubTab === 'projects' ? ' active' : '')}>
          <div className="sources-container">
            <div className="editor-header">
              <h2>Projects</h2>
              <div className="sprite-controls">
                <input type="text" ref={projectNameRef} placeholder="project_name" className="source-name-input" />
                <button id="saveProjectBtn" onClick={handleSaveProject}>💾 Save Project</button>
                <button id="exportHtmlBtn" onClick={handleExportHTML}>🌐 Export HTML</button>
                <button id="refreshProjectsBtn" onClick={refreshProjects}>🔄 Refresh</button>
              </div>
            </div>
            <ProjectsList projects={projects} onLoad={handleLoadProject} onDelete={handleDeleteProject} onRefresh={refreshProjects} />
          </div>
        </div>
      </div>
    </div>
  );
}
