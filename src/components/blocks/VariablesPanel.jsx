import React, { useCallback } from 'react';

const KINDS = [
  { value: 'nombre', label: '🔢 Nombre' },
  { value: 'texte', label: '🔤 Texte' },
  { value: 'booleen', label: '☑️ Vrai / Faux' },
  { value: 'objet_rect', label: '🟥 Objet (x, y, largeur, hauteur, vitesse)' },
  { value: 'liste_vide', label: '🧺 Liste vide' }
];

function defaultValueFor(kind) {
  switch (kind) {
    case 'nombre': return 0;
    case 'texte': return '';
    case 'booleen': return false;
    case 'objet_rect': return { x: 100, y: 100, w: 32, h: 32, vitesse: 200 };
    case 'liste_vide': return null;
    default: return null;
  }
}

let counter = 0;
function nextId() {
  counter += 1;
  return 'var_' + Date.now().toString(36) + counter;
}

export default function VariablesPanel({ variables, onChange }) {
  const updateVar = useCallback((id, patch) => {
    onChange(variables.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }, [variables, onChange]);

  const changeKind = useCallback((id, kind) => {
    onChange(variables.map((v) => (v.id === id ? { ...v, kind, value: defaultValueFor(kind) } : v)));
  }, [variables, onChange]);

  const changeObjectField = useCallback((id, field, num) => {
    onChange(variables.map((v) => (v.id === id ? { ...v, value: { ...v.value, [field]: num } } : v)));
  }, [variables, onChange]);

  const addVariable = useCallback(() => {
    onChange([...variables, { id: nextId(), name: 'variable' + (variables.length + 1), kind: 'nombre', value: 0 }]);
  }, [variables, onChange]);

  const removeVariable = useCallback((id) => {
    onChange(variables.filter((v) => v.id !== id));
  }, [variables, onChange]);

  return (
    <div className="blocks-variables">
      <div className="blocks-variables-header">
        <h3>📦 Variables du jeu</h3>
        <button className="blocks-add-var-btn" onClick={addVariable}>+ Ajouter une variable</button>
      </div>
      <p className="blocks-hint">Ce sont les "boîtes" qui gardent en mémoire le joueur, le score, les pièces... Donne-leur un nom simple, sans espace.</p>
      <div className="blocks-variables-list">
        {variables.map((v) => (
          <div className="blocks-variable-row" key={v.id}>
            <input
              className="block-input blocks-var-name"
              type="text"
              value={v.name}
              onChange={(e) => updateVar(v.id, { name: e.target.value })}
            />
            <select className="block-input" value={v.kind} onChange={(e) => changeKind(v.id, e.target.value)}>
              {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
            </select>

            {v.kind === 'nombre' && (
              <input className="block-input" type="number" value={v.value} onChange={(e) => updateVar(v.id, { value: e.target.value })} />
            )}
            {v.kind === 'texte' && (
              <input className="block-input" type="text" value={v.value} onChange={(e) => updateVar(v.id, { value: e.target.value })} />
            )}
            {v.kind === 'booleen' && (
              <label className="block-negate">
                <input type="checkbox" checked={!!v.value} onChange={(e) => updateVar(v.id, { value: e.target.checked })} />
                vrai
              </label>
            )}
            {v.kind === 'objet_rect' && (
              <span className="blocks-object-fields">
                <label>x <input className="block-input block-input-num" type="number" value={v.value.x} onChange={(e) => changeObjectField(v.id, 'x', e.target.value)} /></label>
                <label>y <input className="block-input block-input-num" type="number" value={v.value.y} onChange={(e) => changeObjectField(v.id, 'y', e.target.value)} /></label>
                <label>larg. <input className="block-input block-input-num" type="number" value={v.value.w} onChange={(e) => changeObjectField(v.id, 'w', e.target.value)} /></label>
                <label>haut. <input className="block-input block-input-num" type="number" value={v.value.h} onChange={(e) => changeObjectField(v.id, 'h', e.target.value)} /></label>
                <label>vitesse <input className="block-input block-input-num" type="number" value={v.value.vitesse} onChange={(e) => changeObjectField(v.id, 'vitesse', e.target.value)} /></label>
              </span>
            )}
            {v.kind === 'liste_vide' && <span className="block-text">[ ] (vide au départ)</span>}

            <button className="blocks-del-btn" title="Supprimer" onClick={() => removeVariable(v.id)}>🗑</button>
          </div>
        ))}
        {variables.length === 0 && <p className="blocks-hint">Aucune variable pour l'instant.</p>}
      </div>
    </div>
  );
}
