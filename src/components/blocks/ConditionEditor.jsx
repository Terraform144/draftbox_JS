import React from 'react';
import { CONDITION_TYPES, KEY_OPTIONS } from '../../lib/blocks-defs';

const COMPARE_OPS = [
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '>=', label: '>=' },
  { value: '<=', label: '<=' },
  { value: '===', label: '=' },
  { value: '!==', label: '≠' }
];

export default function ConditionEditor({ value, onChange, varListId }) {
  const cond = value || { type: 'key' };
  const set = (patch) => onChange({ ...cond, ...patch });

  return (
    <span className="block-condition">
      <select className="block-input" value={cond.type} onChange={(e) => set({ type: e.target.value })}>
        {CONDITION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      {cond.type === 'key' && (
        <select className="block-input" value={cond.key || 'Space'} onChange={(e) => set({ key: e.target.value })}>
          {KEY_OPTIONS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
        </select>
      )}

      {cond.type === 'touch' && (
        <>
          <input className="block-input" list={varListId} type="text" value={cond.a || ''} placeholder="objet A" onChange={(e) => set({ a: e.target.value })} />
          <span className="block-text">touche</span>
          <input className="block-input" list={varListId} type="text" value={cond.b || ''} placeholder="objet B" onChange={(e) => set({ b: e.target.value })} />
        </>
      )}

      {cond.type === 'compare' && (
        <>
          <input className="block-input" list={varListId} type="text" value={cond.left || ''} placeholder="gauche" onChange={(e) => set({ left: e.target.value })} />
          <select className="block-input" value={cond.op || '>'} onChange={(e) => set({ op: e.target.value })}>
            {COMPARE_OPS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input className="block-input" type="text" value={cond.right || ''} placeholder="droite" onChange={(e) => set({ right: e.target.value })} />
        </>
      )}

      {cond.type === 'flag' && (
        <>
          <input className="block-input" list={varListId} type="text" value={cond.var || ''} placeholder="ex: piece.collected" onChange={(e) => set({ var: e.target.value })} />
          <span className="block-text">est</span>
          <select className="block-input" value={cond.state || 'true'} onChange={(e) => set({ state: e.target.value })}>
            <option value="true">vrai</option>
            <option value="false">faux</option>
          </select>
        </>
      )}

      <label className="block-negate">
        <input type="checkbox" checked={!!cond.negate} onChange={(e) => set({ negate: e.target.checked })} />
        pas (non)
      </label>
    </span>
  );
}
