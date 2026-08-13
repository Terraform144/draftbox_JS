import React, { useState, useMemo, useCallback } from 'react';
import { createCondition, createAction, createEvent, genUid } from '../lib/events-defs';
import { mapEvent, moveEvent, removeEvent, moveInstruction } from '../lib/events-tree';
import { generateCode } from '../lib/events-codegen';
import { buildStarterProject } from '../lib/events-starter';
import { buildPacmanProject } from '../lib/events-pacman';
import { buildBallProject } from '../lib/events-ball';
import { buildPongProject } from '../lib/events-pong';
import { buildInvadersProject } from '../lib/events-invaders';
import { buildBreakoutProject } from '../lib/events-breakout';
import { buildAsteroidsProject } from '../lib/events-asteroids';
import EventSheet from './events/EventSheet';
import ObjectsPanel from './events/ObjectsPanel';

const NAME_LIST_ID = 'eventsNameList';
const SPRITE_LIST_ID = 'pixelSpriteNames';

export default function BlocksEditor({ show, onRunCode, onSendToCode }) {
  const starter = useMemo(() => buildStarterProject(), []);
  const [bg, setBg] = useState(starter.bg);
  const [objects, setObjects] = useState(starter.objects);
  const [variables, setVariables] = useState(starter.variables);
  const [events, setEvents] = useState(starter.events);
  const [picker, setPicker] = useState(null);
  const [collapsed, setCollapsed] = useState({ objects: false, events: false, preview: false });

  const toggleCol = useCallback((key) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // ── Liste de noms proposés (objets + variables) pour les champs ──
  const names = useMemo(
    () => [
      ...objects.map((o) => o.name).filter(Boolean),
      ...variables.map((v) => v.name).filter(Boolean)
    ],
    [objects, variables]
  );

  // ── Opérations sur la feuille d'événements ──
  const ops = useMemo(() => {
    const updateEvent = (uid, patch) => setEvents((prev) => mapEvent(prev, uid, (ev) => ({ ...ev, ...patch })));

    return {
      addEvent(type) {
        const e = createEvent(type);
        setEvents((prev) => [...prev, e]);
        setPicker({ uid: e.uid, kind: 'condition' });
      },
      addSubevent(uid, type) {
        const e = createEvent(type);
        setEvents((prev) => mapEvent(prev, uid, (ev) => ({ ...ev, subevents: [...(ev.subevents || []), e] })));
        setPicker({ uid: e.uid, kind: 'condition' });
      },
      updateEvent,
      deleteEvent(uid) {
        setEvents((prev) => removeEvent(prev, uid));
        setPicker(null);
      },
      moveEvent(uid, dir) {
        setEvents((prev) => moveEvent(prev, uid, dir));
      },
      addInstruction(uid, kind, defId) {
        const inst = kind === 'conditions' ? createCondition(defId) : createAction(defId);
        const key = kind === 'conditions' ? 'conditions' : 'actions';
        setEvents((prev) => mapEvent(prev, uid, (ev) => ({ ...ev, [key]: [...(ev[key] || []), inst] })));
      },
      updateInstruction(uid, kind, instUid, patch) {
        const key = kind === 'conditions' ? 'conditions' : 'actions';
        setEvents((prev) => mapEvent(prev, uid, (ev) => ({
          ...ev,
          [key]: (ev[key] || []).map((i) => (i.uid === instUid ? { ...i, ...patch } : i))
        })));
      },
      deleteInstruction(uid, kind, instUid) {
        const key = kind === 'conditions' ? 'conditions' : 'actions';
        setEvents((prev) => mapEvent(prev, uid, (ev) => ({ ...ev, [key]: (ev[key] || []).filter((i) => i.uid !== instUid) })));
      },
      moveInstruction(uid, kind, instUid, dir) {
        const key = kind === 'conditions' ? 'conditions' : 'actions';
        setEvents((prev) => moveInstruction(prev, uid, key, instUid, dir));
      }
    };
  }, []);

  const generatedCode = useMemo(
    () => generateCode({ objects, variables, events, bg }),
    [objects, variables, events, bg]
  );

  const hasAnyContent = events.length > 0 || objects.length > 0 || variables.length > 0;

  const loadProject = useCallback((build, label) => {
    if (hasAnyContent && !window.confirm(`Remplacer le projet actuel par l'exemple « ${label} » ?`)) return;
    const fresh = build();
    setBg(fresh.bg);
    setObjects(fresh.objects);
    setVariables(fresh.variables);
    setEvents(fresh.events);
    setPicker(null);
  }, [hasAnyContent]);

  const clearAll = useCallback(() => {
    if (!window.confirm('Tout effacer (objets, variables et événements) ?')) return;
    setBg('#1a1a2e');
    setObjects([]);
    setVariables([]);
    setEvents([]);
    setPicker(null);
  }, []);

  const spriteNames = (() => {
    try {
      const editor = window.__pixelEditor;
      return editor && typeof editor.getAllSprites === 'function' ? Object.keys(editor.getAllSprites()) : [];
    } catch (e) {
      return [];
    }
  })();

  return (
    <div className="tab-content blocks-editor-container" style={{ display: show ? 'flex' : 'none' }}>
      <div className="editor-header">
        <h2>📜 Éditeur d'Événements</h2>
        <div className="code-controls blocks-header-controls">
          <button className="blocks-btn blocks-btn-ghost" onClick={() => loadProject(buildStarterProject, 'Attrape-pièces')} title="Charger un exemple qui fonctionne déjà">✨ Attrape-pièces</button>
          <button className="blocks-btn blocks-btn-ghost" onClick={() => loadProject(buildPacmanProject, 'Chasse aux Fantômes')} title="Le mini Pac-Man, en événements">👻 Fantômes</button>
          <button className="blocks-btn blocks-btn-ghost" onClick={() => loadProject(buildBallProject, 'Pong')} title="Une balle qui rebondit sur une raquette">🏓 Rebond</button>
          <button className="blocks-btn blocks-btn-ghost" onClick={() => loadProject(buildPongProject, 'Pong 2 joueurs')} title="Le vrai Pong à 2 joueurs (W/S et flèches)">🆚 Pong</button>
          <button className="blocks-btn blocks-btn-ghost" onClick={() => loadProject(buildInvadersProject, 'Space Invaders')} title="Space Invaders en événements : grille d'aliens, tirs, scores">👾 Invaders</button>
          <button className="blocks-btn blocks-btn-ghost" onClick={() => loadProject(buildBreakoutProject, 'Casse-briques')} title="Breakout en événements : grille de briques, rebonds, vies">🧱 Casse-briques</button>
          <button className="blocks-btn blocks-btn-ghost" onClick={() => loadProject(buildAsteroidsProject, 'Astéroïdes')} title="Astéroïdes en événements : esquive, tirs, roches qui explosent">☄️ Astéroïdes</button>
          <button className="blocks-btn blocks-btn-ghost" onClick={clearAll} title="Tout effacer">🗑️ Effacer</button>
          <button className="blocks-btn blocks-btn-secondary" onClick={() => onSendToCode(generatedCode)} title="Voir/modifier le code généré dans l'éditeur de code">📤 Vers le code</button>
          <button className="blocks-btn blocks-btn-primary" onClick={() => onRunCode(generatedCode)} title="Lancer le jeu (Ctrl+Enter)">▶ Lancer</button>
        </div>
      </div>

      <div className="blocks-editor-body">
        <div className={`blocks-objects-col blocks-col${collapsed.objects ? ' collapsed' : ''}`}>
          <button type="button" className="blocks-col-head" onClick={() => toggleCol('objects')} title={collapsed.objects ? 'Afficher les objets et variables' : 'Replier cette colonne'} aria-expanded={!collapsed.objects}>
            <span>🟦 Objets &amp; Variables</span>
            <span className="blocks-col-toggle">{collapsed.objects ? '◂' : '▾'}</span>
          </button>
          {!collapsed.objects && (
            <div className="blocks-col-body">
              <ObjectsPanel
                objects={objects}
                variables={variables}
                onChangeObjects={setObjects}
                onChangeVariables={setVariables}
                listId={NAME_LIST_ID}
              />
              <div className="objects-bg">
                <label className="block-text">Fond de l'écran :</label>
                <input className="block-input block-input-color" type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className={`blocks-workspace-col events-workspace blocks-col${collapsed.events ? ' collapsed' : ''}`}>
          <button type="button" className="blocks-col-head" onClick={() => toggleCol('events')} title={collapsed.events ? 'Afficher les événements' : 'Replier cette colonne'} aria-expanded={!collapsed.events}>
            <span>📜 Événements</span>
            <span className="blocks-col-toggle">{collapsed.events ? '▸' : '▾'}</span>
          </button>
          {!collapsed.events && (
            <div className="blocks-col-body">
              <EventSheet
                events={events}
                ops={ops}
                picker={picker}
                setPicker={setPicker}
                names={names}
                listId={NAME_LIST_ID}
              />
            </div>
          )}
        </div>

        <div className={`blocks-preview-col blocks-col${collapsed.preview ? ' collapsed' : ''}`}>
          <button type="button" className="blocks-col-head" onClick={() => toggleCol('preview')} title={collapsed.preview ? 'Afficher le code' : 'Replier cette colonne'} aria-expanded={!collapsed.preview}>
            <span>💻 Code en direct</span>
            <span className="blocks-col-toggle">{collapsed.preview ? '◂' : '▾'}</span>
          </button>
          {!collapsed.preview && (
            <div className="blocks-col-body">
              <h3>Ton code, en direct</h3>
              <p className="blocks-hint blocks-hint-small">
                Chaque condition/action se traduit ici, ligne pour ligne. Aucune surprise : ce code est exactement celui qui tourne.
              </p>
              <pre className="blocks-code-preview">{generatedCode}</pre>
            </div>
          )}
        </div>
      </div>

      <datalist id={NAME_LIST_ID}>
        {names.map((n) => <option key={n} value={n} />)}
      </datalist>
      <datalist id={SPRITE_LIST_ID}>
        {spriteNames.map((n) => <option key={n} value={n} />)}
      </datalist>
    </div>
  );
}
