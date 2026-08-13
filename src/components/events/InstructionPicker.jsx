import React, { useState } from 'react';
import { CONDITION_DEFS, CONDITION_CATEGORIES, ACTION_DEFS, ACTION_CATEGORIES } from '../../lib/events-defs';

function plainLabel(label) {
  return label.replace(/\{(\w+)\}/g, (_, name) => {
    const pretty = { a: 'objet', b: 'objet', cible: 'variable', n: 'nombre', v: 'vitesse' }[name];
    return pretty ? `<${pretty}>` : `<${name}>`;
  });
}

// Palette compacte pour ajouter une condition ou une action à un événement,
// avec une petite recherche et les catégories colorées (façon GDevelop).
export default function InstructionPicker({ kind, onAdd }) {
  const defs = kind === 'condition' ? CONDITION_DEFS : ACTION_DEFS;
  const categories = kind === 'condition' ? CONDITION_CATEGORIES : ACTION_CATEGORIES;
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const defList = Object.values(defs).filter((d) => !q || d.label.toLowerCase().includes(q));

  return (
    <div className={`inst-picker inst-picker-${kind}`}>
      <div className="inst-picker-head">
        <span>{kind === 'condition' ? '🎯 Ajouter une condition' : '⚡ Ajouter une action'}</span>
        <input
          className="block-input inst-picker-search"
          type="text"
          placeholder="Cherche…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>
      <div className="inst-picker-body">
        {categories.map((cat) => {
          const items = defList.filter((d) => d.category === cat.id);
          if (!items.length) return null;
          return (
            <div className="inst-picker-cat" key={cat.id}>
              <div className="inst-picker-cat-label" style={{ '--cat-color': cat.color }}>
                {cat.icon} {cat.label}
              </div>
              <div className="inst-picker-items">
                {items.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className="inst-picker-item"
                    style={{ '--cat-color': cat.color }}
                    title={d.label}
                    onClick={() => onAdd(d.id)}
                  >
                    <span className="inst-picker-item-icon">{d.icon}</span>
                    <span>{plainLabel(d.label)}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {defList.length === 0 && <p className="blocks-hint">Rien ne correspond…</p>}
      </div>
    </div>
  );
}
