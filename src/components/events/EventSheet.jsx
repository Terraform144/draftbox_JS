import React from 'react';
import EventRow from './EventRow';

// La feuille d'événements : la liste des événements du jeu, façon GDevelop.
export default function EventSheet({ events, ops, picker, setPicker, names, listId }) {
  return (
    <div className="event-sheet">
      <div className="event-sheet-head">
        <div>
          <div className="event-sheet-title">📜 Feuille d'événements</div>
          <div className="event-sheet-sub">
            Les événements s'exécutent de haut en bas, à chaque image. « Quand… → alors… »
          </div>
        </div>
        <div className="event-sheet-add-buttons">
          <button type="button" className="blocks-btn blocks-btn-primary event-new-btn" onClick={() => ops.addEvent('standard')}>
            ➕ Nouvel événement
          </button>
          <button type="button" className="blocks-btn blocks-btn-ghost" onClick={() => ops.addEvent('foreach')} title="Répéter des sous-événements pour chaque élément d'une liste">
            🔁 Pour chaque
          </button>
          <button type="button" className="blocks-btn blocks-btn-ghost" onClick={() => ops.addEvent('repeat')} title="Répéter des sous-événements un certain nombre de fois">
            🔂 Répéter
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="event-sheet-empty">
          <p>Pas encore d'événement. Commence par « ➕ Nouvel événement » puis ajoute des conditions et des actions !</p>
        </div>
      ) : (
        <div className="event-sheet-list">
          {events.map((ev, i, arr) => (
            <EventRow
              key={ev.uid}
              event={ev}
              ops={ops}
              picker={picker}
              setPicker={setPicker}
              names={names}
              listId={listId}
              isFirst={i === 0}
              isLast={i === arr.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
