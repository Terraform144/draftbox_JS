// Projet « 🏓 Rebond » (façon Pong) : une balle lancée qui rebondit sur les
// bords et sur la raquette. Montre : vitesse, lancer, rebonds, axes limités.
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

export function buildBallProject() {
  return {
    bg: '#0f1b2d',
    objects: [
      { id: genUid(), name: 'balle', kind: 'objet', x: 400, y: 200, w: 18, h: 18, vitesse: 250, couleur: '#4ecdc4', sprite: '', visible: true },
      { id: genUid(), name: 'raquette', kind: 'objet', x: 360, y: 440, w: 90, h: 14, vitesse: 320, couleur: '#ffd700', sprite: '', visible: true },
      { id: genUid(), name: 'texte_info', kind: 'texte', x: 16, y: 28, texte: 'Touche la balle pour marquer un point !', prefixe: '', variable: '', taille: 16, couleur: '#a8d8ea', visible: true }
    ],
    variables: [
      { id: genUid(), name: 'score', kind: 'nombre', value: 0 }
    ],
    events: [
      ev('standard', {
        conditions: [cond('start', {})],
        actions: [
          act('launch', { a: 'balle', direction: 'hasard', v: '280' }),
          act('set_var', { cible: 'score', valeur: '0' })
        ]
      }),
      ev('standard', {
        actions: [
          act('move_keys', { a: 'raquette', axes: 'h' }),
          act('keep_screen', { a: 'raquette' }),
          act('apply_velocity', { a: 'balle' }),
          act('bounce_edges', { a: 'balle' })
        ]
      }),
      ev('standard', {
        conditions: [cond('touch_obj', { a: 'balle', b: 'raquette' })],
        actions: [
          act('bounce_against', { a: 'balle', b: 'raquette' }),
          act('change_var', { cible: 'score', valeur: '1' }),
          act('play_sound', { nom: 'rebond' })
        ]
      }),
      ev('standard', {
        conditions: [cond('touch_edge', { a: 'balle' }), cond('compare', { left: 'balle.y', op: '>', right: 'raquette.y + raquette.h' })],
        actions: [
          act('set_position', { a: 'balle', x: '400', y: '200' }),
          act('launch', { a: 'balle', direction: 'droite', v: '280' }),
          act('play_sound', { nom: 'perdu' })
        ]
      })
    ]
  };
}
