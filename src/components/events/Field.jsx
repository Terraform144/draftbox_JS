import React from 'react';
import { KEY_OPTIONS } from '../../lib/events-defs';

// Rendu des champs d'une condition/action : le libellé est découpé autour
// des {champs} remplacés par de vrais widgets (nombre, texte, couleur,
// liste déroulante, référence à un objet/variable...).
function FieldInput({ fieldDef, value, onChange, listId }) {
  switch (fieldDef.type) {
    case 'number':
      return (
        <input
          className="block-input block-input-num"
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
      );
    case 'color':
      return (
        <input className="block-input block-input-color" type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      );
    case 'select':
      return (
        <select className="block-input" value={value} onChange={(e) => onChange(e.target.value)}>
          {(fieldDef.options || []).map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    case 'key':
      return (
        <select className="block-input" value={value} onChange={(e) => onChange(e.target.value)}>
          {KEY_OPTIONS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
        </select>
      );
    case 'varRef':
    case 'listRef':
      return (
        <input className="block-input block-input-ref" list={listId} type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      );
    case 'text':
    default:
      return <input className="block-input" type="text" value={value} onChange={(e) => onChange(e.target.value)} />;
  }
}

export function renderLabel(def, fields, onFieldChange, listId) {
  const parts = def.label.split(/(\{\w+\})/g);
  return parts.map((part, i) => {
    const m = part.match(/^\{(\w+)\}$/);
    if (!m) return part ? <span className="block-text" key={i}>{part}</span> : null;
    const fieldName = m[1];
    const fieldDef = def.fields[fieldName];
    if (!fieldDef) return null;
    return (
      <FieldInput
        key={i}
        fieldDef={fieldDef}
        value={fields[fieldName]}
        onChange={(v) => onFieldChange(fieldName, v)}
        listId={listId}
      />
    );
  });
}
