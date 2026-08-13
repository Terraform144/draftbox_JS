// Projet de démarrage « Attrape-pièces », construit entièrement avec la
// feuille d'événements (conditions → actions) — l'exemple parfait pour
// comprendre GDevelop : un objet joueur, des pièces, un score.
import { genUid, createCondition, createAction, createEvent } from './events-defs';

function cond(defId, fields, not) {
  const c = createCondition(defId);
  Object.assign(c.fields, fields);
  c.not = !!not;
  return c;
}

function act(defId, fields) {
  const a = createAction(defId);
  Object.assign(a.fields, fields);
  return a;
}

function ev(type, fields) {
  const e = createEvent(type);
  if (fields) Object.assign(e, fields);
  return e;
}

export function buildStarterProject() {
  return {
    bg: '#1a1a2e',
    objects: [
      { id: genUid(), name: 'joueur', kind: 'objet', x: 400, y: 250, w: 32, h: 32, vitesse: 250, couleur: '#e94560', sprite: '', visible: true },
      { id: genUid(), name: 'texte_score', kind: 'texte', x: 16, y: 28, texte: '', prefixe: 'Score : ', variable: 'score', taille: 18, couleur: '#ffffff', visible: true }
    ],
    variables: [
      { id: genUid(), name: 'score', kind: 'nombre', value: 0 },
      { id: genUid(), name: 'pieces', kind: 'liste', value: null, couleur: '#ffd700', forme: 'cercle', taille: 8 }
    ],
    events: [
      ev('standard', { conditions: [cond('start', {})], actions: [act('spawn', { n: 5, liste: 'pieces' })] }),
      ev('standard', {
        actions: [
          act('move_keys', { a: 'joueur', axes: '4' }),
          act('keep_screen', { a: 'joueur' })
        ]
      }),
      ev('foreach', {
        item: 'piece', liste: 'pieces',
        subevents: [
          ev('standard', {
            conditions: [cond('touch_obj', { a: 'joueur', b: 'piece' })],
            actions: [
              act('set_var', { cible: 'piece.collected', valeur: 'true' }),
              act('change_var', { cible: 'score', valeur: '1' }),
              act('play_sound', { nom: 'piece' })
            ]
          })
        ]
      }),
      ev('standard', { actions: [act('remove_flagged', { liste: 'pieces' })] })
    ]
  };
}
