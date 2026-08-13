import React, { useCallback } from 'react';
import { genUid } from '../../lib/events-defs';

const OBJECT_KINDS = [
  { value: 'objet', label: '🟥 Objet (rectangle / sprite)' },
  { value: 'texte', label: '💬 Texte à l\'écran' }
];

const VARIABLE_KINDS = [
  { value: 'nombre', label: '🔢 Nombre' },
  { value: 'texte', label: '🔤 Texte' },
  { value: 'booleen', label: '☑️ Vrai / Faux' },
  { value: 'liste', label: '🧺 Liste de pièces' }
];

const LIST_FORMS = [
  { value: 'cercle', label: '⏺ Cercle' },
  { value: 'carre', label: '⬛ Carré' }
];

function defaultObject(kind) {
  if (kind === 'texte') {
    return { id: genUid(), name: 'texte_info', kind, x: 16, y: 28, texte: 'Bonjour !', prefixe: '', variable: '', taille: 16, couleur: '#ffffff', visible: true };
  }
  return { id: genUid(), name: 'objet1', kind, x: 400, y: 250, w: 32, h: 32, vitesse: 250, couleur: '#e94560', sprite: '', visible: true };
}

function defaultVariable(kind) {
  const base = { id: genUid(), name: 'variable', kind };
  switch (kind) {
    case 'nombre': base.value = 0; break;
    case 'texte': base.value = ''; break;
    case 'booleen': base.value = false; break;
    case 'liste': base.value = null; base.couleur = '#ffd700'; base.forme = 'cercle'; base.taille = 8; break;
    default: base.value = null;
  }
  return base;
}

function uniqueName(base, used) {
  let name = base;
  let i = 2;
  while (used.has(name)) { name = base + i; i += 1; }
  return name;
}

export default function ObjectsPanel({ objects, variables, onChangeObjects, onChangeVariables, listId }) {
  const used = new Set([...objects.map((o) => o.name), ...variables.map((v) => v.name)]);

  const updateObject = useCallback((id, patch) => {
    onChangeObjects(objects.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, [objects, onChangeObjects]);

  const addObject = useCallback((kind) => {
    const o = defaultObject(kind);
    o.name = uniqueName(kind === 'texte' ? 'texte_info' : 'objet', used);
    onChangeObjects([...objects, o]);
  }, [objects, onChangeObjects, used]);

  const removeObject = useCallback((id) => {
    onChangeObjects(objects.filter((o) => o.id !== id));
  }, [objects, onChangeObjects]);

  const updateVariable = useCallback((id, patch) => {
    onChangeVariables(variables.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }, [variables, onChangeVariables]);

  const addVariable = useCallback((kind) => {
    const v = defaultVariable(kind);
    v.name = uniqueName(kind === 'liste' ? 'pieces' : 'variable', used);
    onChangeVariables([...variables, v]);
  }, [variables, onChangeVariables, used]);

  const removeVariable = useCallback((id) => {
    onChangeVariables(variables.filter((v) => v.id !== id));
  }, [variables, onChangeVariables]);

  return (
    <div className="objects-panel">
      <div className="objects-section">
        <div className="objects-section-head">
          <h3>🟦 Mes objets</h3>
          <button className="blocks-add-var-btn" onClick={() => addObject('objet')}>➕ Objet</button>
          <button className="blocks-add-var-btn blocks-add-var-btn-ghost" onClick={() => addObject('texte')}>➕ Texte</button>
        </div>
        <p className="blocks-hint">
          Ce sont les personnages et les choses du jeu. Ils s'affichent automatiquement — pas besoin de « dessiner » !
        </p>
        <div className="objects-list">
          {objects.map((o) => (
            <div className="object-row" key={o.id}>
              <div className="object-row-top">
                <input
                  className="block-input object-name"
                  type="text"
                  value={o.name}
                  onChange={(e) => updateObject(o.id, { name: e.target.value })}
                  placeholder="nom"
                />
                <select className="block-input" value={o.kind} onChange={(e) => updateObject(o.id, defaultObject(e.target.value))}>
                  {OBJECT_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                </select>
                <label className="block-negate object-visible">
                  <input type="checkbox" checked={o.visible !== false} onChange={(e) => updateObject(o.id, { visible: e.target.checked })} />
                  visible au début
                </label>
                <button className="blocks-del-btn" title="Supprimer" onClick={() => removeObject(o.id)}>🗑</button>
              </div>

              {o.kind === 'objet' ? (
                <div className="object-row-fields">
                  <label>x <input className="block-input block-input-num" type="number" value={o.x} onChange={(e) => updateObject(o.id, { x: e.target.value })} /></label>
                  <label>y <input className="block-input block-input-num" type="number" value={o.y} onChange={(e) => updateObject(o.id, { y: e.target.value })} /></label>
                  <label>larg. <input className="block-input block-input-num" type="number" value={o.w} onChange={(e) => updateObject(o.id, { w: e.target.value })} /></label>
                  <label>haut. <input className="block-input block-input-num" type="number" value={o.h} onChange={(e) => updateObject(o.id, { h: e.target.value })} /></label>
                  <label>vitesse <input className="block-input block-input-num" type="number" value={o.vitesse} onChange={(e) => updateObject(o.id, { vitesse: e.target.value })} /></label>
                  <label>couleur <input className="block-input block-input-color" type="color" value={o.couleur} onChange={(e) => updateObject(o.id, { couleur: e.target.value })} /></label>
                  <label>sprite (facultatif) <input className="block-input" type="text" list="pixelSpriteNames" value={o.sprite} onChange={(e) => updateObject(o.id, { sprite: e.target.value })} placeholder="nom du sprite" /></label>
                </div>
              ) : (
                <div className="object-row-fields">
                  <label>texte <input className="block-input object-field-wide" type="text" value={o.texte} onChange={(e) => updateObject(o.id, { texte: e.target.value })} /></label>
                  <label>affiche la variable <input className="block-input" list={listId} type="text" value={o.variable} onChange={(e) => updateObject(o.id, { variable: e.target.value })} placeholder="(optionnel)" /></label>
                  <label>préfixe <input className="block-input" type="text" value={o.prefixe} onChange={(e) => updateObject(o.id, { prefixe: e.target.value })} /></label>
                  <label>x <input className="block-input block-input-num" type="number" value={o.x} onChange={(e) => updateObject(o.id, { x: e.target.value })} /></label>
                  <label>y <input className="block-input block-input-num" type="number" value={o.y} onChange={(e) => updateObject(o.id, { y: e.target.value })} /></label>
                  <label>taille <input className="block-input block-input-num" type="number" value={o.taille} onChange={(e) => updateObject(o.id, { taille: e.target.value })} /></label>
                  <label>couleur <input className="block-input block-input-color" type="color" value={o.couleur} onChange={(e) => updateObject(o.id, { couleur: e.target.value })} /></label>
                </div>
              )}
            </div>
          ))}
          {objects.length === 0 && <p className="blocks-hint">Aucun objet pour l'instant. Clique sur « ➕ Objet » !</p>}
        </div>
      </div>

      <div className="objects-section">
        <div className="objects-section-head">
          <h3>📦 Mes variables</h3>
          <button className="blocks-add-var-btn" onClick={() => addVariable('nombre')}>➕ Nombre</button>
          <button className="blocks-add-var-btn blocks-add-var-btn-ghost" onClick={() => addVariable('liste')}>➕ Liste</button>
          <button className="blocks-add-var-btn blocks-add-var-btn-ghost" onClick={() => addVariable('booleen')}>➕ Vrai/Faux</button>
          <button className="blocks-add-var-btn blocks-add-var-btn-ghost" onClick={() => addVariable('texte')}>➕ Texte</button>
        </div>
        <p className="blocks-hint">Ce sont les « boîtes » qui gardent en mémoire le score, une liste de pièces, un état vrai/faux…</p>
        <div className="objects-list">
          {variables.map((v) => (
            <div className="object-row" key={v.id}>
              <div className="object-row-top">
                <input className="block-input object-name" type="text" value={v.name} onChange={(e) => updateVariable(v.id, { name: e.target.value })} placeholder="nom" />
                <select className="block-input" value={v.kind} onChange={(e) => updateVariable(v.id, defaultVariable(e.target.value))}>
                  {VARIABLE_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                </select>
                <button className="blocks-del-btn" title="Supprimer" onClick={() => removeVariable(v.id)}>🗑</button>
              </div>
              <div className="object-row-fields">
                {v.kind === 'nombre' && (
                  <label>valeur <input className="block-input block-input-num" type="number" value={v.value} onChange={(e) => updateVariable(v.id, { value: e.target.value })} /></label>
                )}
                {v.kind === 'texte' && (
                  <label>valeur <input className="block-input" type="text" value={v.value} onChange={(e) => updateVariable(v.id, { value: e.target.value })} /></label>
                )}
                {v.kind === 'booleen' && (
                  <label className="block-negate">
                    <input type="checkbox" checked={!!v.value} onChange={(e) => updateVariable(v.id, { value: e.target.checked })} />
                    vraie au début
                  </label>
                )}
                {v.kind === 'liste' && (
                  <>
                    <label>couleur <input className="block-input block-input-color" type="color" value={v.couleur} onChange={(e) => updateVariable(v.id, { couleur: e.target.value })} /></label>
                    <label>forme
                      <select className="block-input" value={v.forme} onChange={(e) => updateVariable(v.id, { forme: e.target.value })}>
                        {LIST_FORMS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </label>
                    <label>taille <input className="block-input block-input-num" type="number" value={v.taille} onChange={(e) => updateVariable(v.id, { taille: e.target.value })} /></label>
                    <span className="block-text">(vide au départ — l'action « créer des pièces » la remplit)</span>
                  </>
                )}
              </div>
            </div>
          ))}
          {variables.length === 0 && <p className="blocks-hint">Aucune variable pour l'instant.</p>}
        </div>
      </div>
    </div>
  );
}
