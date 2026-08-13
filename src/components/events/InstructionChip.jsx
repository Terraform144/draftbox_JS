import React from 'react';
import { CONDITION_DEFS, ACTION_DEFS, CONDITION_CATEGORIES, ACTION_CATEGORIES, resolveFields } from '../../lib/events-defs';
import { renderLabel } from './Field';

const CATEGORY_BY_ID = Object.fromEntries(
  [...CONDITION_CATEGORIES, ...ACTION_CATEGORIES].map((c) => [c.id, c])
);

// Une condition ou une action rendue sous forme de « pastille » colorée,
// modifiable directement dans la feuille d'événements.
export default function InstructionChip({ kind, inst, onChange, onDelete, onMoveUp, onMoveDown, listId }) {
  const defs = kind === 'condition' ? CONDITION_DEFS : ACTION_DEFS;
  const def = defs[inst.defId];
  if (!def) return null;
  const cat = CATEGORY_BY_ID[def.category];

  const handleChange = (fieldName, value) => {
    onChange({ ...inst, fields: { ...inst.fields, [fieldName]: value } });
  };

  return (
    <div
      className={`inst-chip inst-chip-${kind}${inst.not ? ' inst-not' : ''}`}
      style={{ '--inst-color': cat?.color || '#888' }}
    >
      <span className="inst-chip-icon">{def.icon}</span>
      <span className="inst-chip-label">
        {renderLabel(def, resolveFields(def, inst.fields), handleChange, listId)}
      </span>
      <span className="inst-chip-actions">
        {kind === 'condition' && (
          <button
            type="button"
            className={`inst-not-btn${inst.not ? ' active' : ''}`}
            title="Inverser la condition (pas / non)"
            onClick={() => onChange({ ...inst, not: !inst.not })}
          >
            {inst.not ? 'non ✓' : 'non'}
          </button>
        )}
        <button type="button" title="Monter" disabled={!onMoveUp} onClick={onMoveUp}>▲</button>
        <button type="button" title="Descendre" disabled={!onMoveDown} onClick={onMoveDown}>▼</button>
        <button type="button" className="inst-chip-del" title="Supprimer" onClick={onDelete}>✕</button>
      </span>
    </div>
  );
}
