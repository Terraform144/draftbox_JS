import React from 'react';
import InstructionChip from './InstructionChip';
import InstructionPicker from './InstructionPicker';

const TYPE_META = {
  standard: { icon: '📋', label: 'Événement' },
  foreach: { icon: '🔁', label: 'Pour chaque' },
  repeat: { icon: '🔂', label: 'Répéter' }
};

export default function EventRow({
  event, ops, picker, setPicker, names, listId, depth = 0, isFirst, isLast
}) {
  const meta = TYPE_META[event.type] || TYPE_META.standard;
  const pickerOpen = picker && picker.uid === event.uid;

  const addInstruction = (kind, defId) => {
    ops.addInstruction(event.uid, kind, defId);
    setPicker(null);
  };

  return (
    <div className={'event-row' + (pickerOpen ? ' picker-open' : '')} style={{ '--event-depth': depth }}>
      <div className="event-row-head">
        <span className="event-badge" style={{ '--event-color': event.type === 'foreach' ? '#59C059' : event.type === 'repeat' ? '#FFAB19' : '#4C97FF' }}>
          {meta.icon} {meta.label}
        </span>
        {event.type === 'foreach' && (
          <span className="event-loop-fields">
            <span className="block-text">pour chaque</span>
            <input
              className="block-input event-loop-item"
              type="text"
              list={listId}
              value={event.item || 'objet'}
              onChange={(e) => ops.updateEvent(event.uid, { item: e.target.value })}
            />
            <span className="block-text">dans</span>
            <input
              className="block-input"
              type="text"
              list={listId}
              value={event.liste || ''}
              onChange={(e) => ops.updateEvent(event.uid, { liste: e.target.value })}
            />
          </span>
        )}
        {event.type === 'repeat' && (
          <span className="event-loop-fields">
            <span className="block-text">répéter</span>
            <input
              className="block-input block-input-num"
              type="number"
              value={event.n ?? 3}
              onChange={(e) => ops.updateEvent(event.uid, { n: e.target.value === '' ? '' : Number(e.target.value) })}
            />
            <span className="block-text">fois</span>
          </span>
        )}
        <span className="event-row-actions">
          <button type="button" title="Monter" disabled={isFirst} onClick={() => ops.moveEvent(event.uid, -1)}>▲</button>
          <button type="button" title="Descendre" disabled={isLast} onClick={() => ops.moveEvent(event.uid, 1)}>▼</button>
          <button type="button" className="event-del" title="Supprimer" onClick={() => ops.deleteEvent(event.uid)}>🗑</button>
        </span>
      </div>

      {event.type === 'standard' && (
        <>
          <div className="event-quand">
            <div className="event-part-title">🎯 Quand</div>
            <div className="event-inst-list">
              {(event.conditions || []).map((inst, i, arr) => (
                <InstructionChip
                  key={inst.uid}
                  kind="condition"
                  inst={inst}
                  onChange={(patch) => ops.updateInstruction(event.uid, 'conditions', inst.uid, patch)}
                  onDelete={() => ops.deleteInstruction(event.uid, 'conditions', inst.uid)}
                  onMoveUp={i > 0 ? () => ops.moveInstruction(event.uid, 'conditions', inst.uid, -1) : null}
                  onMoveDown={i < arr.length - 1 ? () => ops.moveInstruction(event.uid, 'conditions', inst.uid, 1) : null}
                  listId={listId}
                />
              ))}
              {!event.conditions || event.conditions.length === 0 ? (
                <span className="event-empty-hint">(aucune condition → à chaque image)</span>
              ) : null}
              <button
                type="button"
                className="event-add-inst"
                onClick={() => setPicker(pickerOpen && picker.kind === 'condition' ? null : { uid: event.uid, kind: 'condition' })}
              >
                ➕ Condition
              </button>
            </div>
            {pickerOpen && picker.kind === 'condition' && (
              <InstructionPicker kind="condition" onAdd={(defId) => addInstruction('conditions', defId)} />
            )}
          </div>

          <div className="event-alors">
            <div className="event-part-title">⚡ Alors</div>
            <div className="event-inst-list">
              {(event.actions || []).map((inst, i, arr) => (
                <InstructionChip
                  key={inst.uid}
                  kind="action"
                  inst={inst}
                  onChange={(patch) => ops.updateInstruction(event.uid, 'actions', inst.uid, patch)}
                  onDelete={() => ops.deleteInstruction(event.uid, 'actions', inst.uid)}
                  onMoveUp={i > 0 ? () => ops.moveInstruction(event.uid, 'actions', inst.uid, -1) : null}
                  onMoveDown={i < arr.length - 1 ? () => ops.moveInstruction(event.uid, 'actions', inst.uid, 1) : null}
                  listId={listId}
                />
              ))}
              {!event.actions || event.actions.length === 0 ? (
                <span className="event-empty-hint">(aucune action → cet événement ne fait rien)</span>
              ) : null}
              <button
                type="button"
                className="event-add-inst"
                onClick={() => setPicker(pickerOpen && picker.kind === 'action' ? null : { uid: event.uid, kind: 'action' })}
              >
                ➕ Action
              </button>
            </div>
            {pickerOpen && picker.kind === 'action' && (
              <InstructionPicker kind="action" onAdd={(defId) => addInstruction('actions', defId)} />
            )}
          </div>
        </>
      )}

      {(!event.type || event.type === 'standard' || event.type === 'foreach' || event.type === 'repeat') && (
        <div className="event-subevents">
          {(event.subevents || []).map((se, i, arr) => (
            <EventRow
              key={se.uid}
              event={se}
              ops={ops}
              picker={picker}
              setPicker={setPicker}
              names={event.type === 'foreach' ? [...names, event.item].filter(Boolean) : names}
              listId={listId}
              depth={depth + 1}
              isFirst={i === 0}
              isLast={i === arr.length - 1}
            />
          ))}
          <div className="event-add-sub-wrap">
            <button
              type="button"
              className="event-add-sub"
              onClick={() => ops.addSubevent(event.uid, 'standard')}
              title="Sous-événement : ne s'exécute que si les conditions du parent sont vraies"
            >
              ➕ Sous-événement
            </button>
            <button
              type="button"
              className="event-add-sub event-add-sub-ghost"
              onClick={() => ops.addSubevent(event.uid, 'foreach')}
            >
              🔁 Sous-« pour chaque »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
