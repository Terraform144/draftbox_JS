import React, { useState, useMemo, useCallback } from 'react';
import { createBlock } from '../lib/blocks-defs';
import { updateBlock, removeBlock, insertBlock, moveBlock } from '../lib/blocks-tree';
import { generateCode } from '../lib/blocks-codegen';
import { buildStarterProject } from '../lib/blocks-starter';
import BlockPalette from './blocks/BlockPalette';
import BlockCanvas from './blocks/BlockCanvas';
import VariablesPanel from './blocks/VariablesPanel';

const SCRIPT_TABS = [
  { id: 'variables', label: '📦 Variables' },
  { id: 'init', label: '🚩 Au démarrage' },
  { id: 'update', label: '🔁 Chaque image' },
  { id: 'draw', label: '🖼️ Dessiner' }
];

const ROOT_TARGET = { uid: null, slot: null };
const EMPTY_SCRIPTS = { init: [], update: [], draw: [] };

export default function BlocksEditor({ show, onRunCode, onSendToCode }) {
  const starter = useMemo(() => buildStarterProject(), []);
  const [variables, setVariables] = useState(starter.variables);
  const [scripts, setScripts] = useState(starter.scripts);
  const [activeTab, setActiveTab] = useState('update');
  const [activeTarget, setActiveTarget] = useState(ROOT_TARGET);

  const isScriptTab = activeTab === 'init' || activeTab === 'update' || activeTab === 'draw';

  const selectTab = useCallback((tab) => {
    setActiveTab(tab);
    setActiveTarget(ROOT_TARGET);
  }, []);

  const addBlockToActive = useCallback((defId) => {
    if (!isScriptTab) return;
    const newBlock = createBlock(defId);
    setScripts((prev) => ({
      ...prev,
      [activeTab]: insertBlock(prev[activeTab], activeTarget.uid, activeTarget.slot, newBlock)
    }));
  }, [isScriptTab, activeTab, activeTarget]);

  const blockOps = useMemo(() => ({
    onUpdateField(uid, fieldName, value) {
      setScripts((prev) => ({
        ...prev,
        [activeTab]: updateBlock(prev[activeTab], uid, (b) => ({ ...b, fields: { ...b.fields, [fieldName]: value } }))
      }));
    },
    onDelete(uid) {
      setScripts((prev) => {
        const [next] = removeBlock(prev[activeTab], uid);
        return { ...prev, [activeTab]: next };
      });
      setActiveTarget((t) => (t.uid === uid ? ROOT_TARGET : t));
    },
    onMoveUp(uid) {
      setScripts((prev) => ({ ...prev, [activeTab]: moveBlock(prev[activeTab], uid, -1) }));
    },
    onMoveDown(uid) {
      setScripts((prev) => ({ ...prev, [activeTab]: moveBlock(prev[activeTab], uid, 1) }));
    }
  }), [activeTab]);

  const generatedCode = useMemo(() => generateCode({ variables, scripts }), [variables, scripts]);

  const hasAnyBlocks = scripts.init.length + scripts.update.length + scripts.draw.length > 0;

  const loadStarterExample = useCallback(() => {
    if (hasAnyBlocks && !window.confirm('Remplacer les blocs actuels par l\'exemple "Attrape-pièces" ?')) return;
    const fresh = buildStarterProject();
    setVariables(fresh.variables);
    setScripts(fresh.scripts);
    setActiveTarget(ROOT_TARGET);
  }, [hasAnyBlocks]);

  const clearAll = useCallback(() => {
    if (!window.confirm('Tout effacer (variables et blocs) ?')) return;
    setVariables([]);
    setScripts(EMPTY_SCRIPTS);
    setActiveTarget(ROOT_TARGET);
  }, []);

  return (
    <div className="tab-content blocks-editor-container" style={{ display: show ? 'flex' : 'none' }}>
      <div className="editor-header">
        <h2>🧩 Éditeur de Blocs</h2>
        <div className="code-controls">
          <button onClick={loadStarterExample} title="Charger un exemple qui fonctionne déjà">✨ Exemple</button>
          <button onClick={clearAll} title="Tout effacer">🗑️ Effacer</button>
          <button onClick={() => onSendToCode(generatedCode)} title="Voir/modifier le code dans l'éditeur de code">📤 Vers le code</button>
          <button className="btn-run" onClick={() => onRunCode(generatedCode)} title="Lancer le jeu (Ctrl+Enter)">▶ Lancer</button>
        </div>
      </div>

      <div className="blocks-editor-body">
        <div className="blocks-palette-col">
          {!isScriptTab && <p className="blocks-hint blocks-hint-warning">Choisis un onglet "Au démarrage", "Chaque image" ou "Dessiner" pour ajouter des blocs.</p>}
          <BlockPalette onAddBlock={addBlockToActive} />
        </div>

        <div className="blocks-workspace-col">
          <div className="blocks-script-tabs">
            {SCRIPT_TABS.map((t) => (
              <button key={t.id} className={activeTab === t.id ? 'active' : ''} onClick={() => selectTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="blocks-workspace-body">
            {activeTab === 'variables' ? (
              <VariablesPanel variables={variables} onChange={setVariables} />
            ) : (
              <BlockCanvas
                list={scripts[activeTab]}
                containerUid={null}
                slot={null}
                blockOps={blockOps}
                activeTarget={activeTarget}
                onSetActiveTarget={setActiveTarget}
                varListId="blocksVarNames"
              />
            )}
          </div>
        </div>

        <div className="blocks-preview-col">
          <h3>Code généré</h3>
          <pre className="blocks-code-preview">{generatedCode}</pre>
        </div>
      </div>

      <datalist id="blocksVarNames">
        {variables.map((v) => <option key={v.id} value={v.name} />)}
      </datalist>
    </div>
  );
}
