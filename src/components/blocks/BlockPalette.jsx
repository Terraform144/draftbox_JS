import React, { useState } from 'react';
import { CATEGORIES, BLOCK_DEFS } from '../../lib/blocks-defs';

function plainLabel(label) {
  return label.replace(/\{(\w+)\}/g, (_, name) => `[${name}]`);
}

export default function BlockPalette({ onAddBlock }) {
  const [openCategory, setOpenCategory] = useState(CATEGORIES[0].id);

  const blocksByCategory = (catId) => Object.values(BLOCK_DEFS).filter((d) => d.category === catId);

  return (
    <div className="blocks-palette">
      <div className="blocks-palette-title">🧰 Choisis un bloc !</div>
      {CATEGORIES.map((cat) => (
        <div className="palette-category" key={cat.id}>
          <button
            type="button"
            className={'palette-category-header' + (openCategory === cat.id ? ' open' : '')}
            style={{ '--cat-color': cat.color }}
            onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
          >
            <span>{cat.icon} {cat.label}</span>
            <span className="palette-caret">{openCategory === cat.id ? '▾' : '▸'}</span>
          </button>
          {openCategory === cat.id && (
            <div className="palette-category-body">
              {blocksByCategory(cat.id).map((def) => (
                <button
                  type="button"
                  key={def.id}
                  className="palette-block"
                  style={{ '--cat-color': cat.color }}
                  title="Ajouter dans la zone active"
                  onClick={() => onAddBlock(def.id)}
                >
                  {plainLabel(def.label)}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
