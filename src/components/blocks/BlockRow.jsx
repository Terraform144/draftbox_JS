import React from 'react';
import { BLOCK_DEFS, CATEGORIES } from '../../lib/blocks-defs';
import ConditionEditor from './ConditionEditor';
import BlockCanvas from './BlockCanvas';

const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

function renderField(name, fieldDef, value, onChange, varListId) {
  switch (fieldDef.type) {
    case 'number':
      return <input key={name} className="block-input block-input-num" type="number" value={value} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />;
    case 'color':
      return <input key={name} className="block-input block-input-color" type="color" value={value} onChange={(e) => onChange(e.target.value)} />;
    case 'checkbox':
      return <input key={name} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />;
    case 'varRef':
      return <input key={name} className="block-input" list={varListId} type="text" value={value} onChange={(e) => onChange(e.target.value)} />;
    case 'condition':
      return <ConditionEditor key={name} value={value} onChange={onChange} varListId={varListId} />;
    case 'text':
    default:
      return <input key={name} className="block-input" type="text" value={value} onChange={(e) => onChange(e.target.value)} />;
  }
}

function renderLabel(def, block, onFieldChange, varListId) {
  const parts = def.label.split(/(\{\w+\})/g);
  return parts.map((part, i) => {
    const m = part.match(/^\{(\w+)\}$/);
    if (!m) return part ? <span className="block-text" key={i}>{part}</span> : null;
    const fieldName = m[1];
    const fieldDef = def.fields[fieldName];
    if (!fieldDef) return null;
    const value = block.fields[fieldName];
    return renderField(fieldName, fieldDef, value, (v) => onFieldChange(fieldName, v), varListId);
  });
}

export default function BlockRow({ block, blockOps, activeTarget, onSetActiveTarget, varListId, isFirst, isLast }) {
  const def = BLOCK_DEFS[block.defId];
  if (!def) return null;
  const category = CATEGORY_BY_ID[def.category];

  const onFieldChange = (fieldName, value) => blockOps.onUpdateField(block.uid, fieldName, value);

  return (
    <div className="block-row" style={{ '--block-color': category?.color || '#888' }}>
      <div className="block-row-main">
        <span className="block-row-icon">{category?.icon}</span>
        <span className="block-row-label">{renderLabel(def, block, onFieldChange, varListId)}</span>
        <span className="block-row-actions">
          <button title="Monter" disabled={isFirst} onClick={() => blockOps.onMoveUp(block.uid)}>▲</button>
          <button title="Descendre" disabled={isLast} onClick={() => blockOps.onMoveDown(block.uid)}>▼</button>
          <button title="Supprimer" className="block-row-del" onClick={() => blockOps.onDelete(block.uid)}>🗑</button>
        </span>
      </div>

      {def.slots && def.slots.map((slotName) => (
        <div className="block-row-slot" key={slotName}>
          {def.slotLabels && def.slotLabels[slotName] ? <div className="block-slot-label">{def.slotLabels[slotName]}</div> : null}
          <BlockCanvas
            list={(block.slots && block.slots[slotName]) || []}
            containerUid={block.uid}
            slot={slotName}
            blockOps={blockOps}
            activeTarget={activeTarget}
            onSetActiveTarget={onSetActiveTarget}
            varListId={varListId}
          />
        </div>
      ))}
    </div>
  );
}
