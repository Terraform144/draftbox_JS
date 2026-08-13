// Projet « Pong » (2 joueurs), construit entièrement avec la feuille
// d'événements. Montre : déplacement au clavier libre (« tant que {touche}
// appuyée… »), rebonds, scores, fin de partie et recommencement.
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

export function buildPongProject() {
  return {
    bg: '#0a0a1a',
    objects: [
      { id: genUid(), name: 'balle', kind: 'objet', x: 480, y: 270, w: 8, h: 8, vitesse: 250, couleur: '#ffffff', sprite: '', visible: true },
      { id: genUid(), name: 'raquette1', kind: 'objet', x: 20, y: 220, w: 8, h: 60, vitesse: 400, couleur: '#4ecdc4', sprite: '', visible: true },
      { id: genUid(), name: 'raquette2', kind: 'objet', x: 932, y: 220, w: 8, h: 60, vitesse: 400, couleur: '#e94560', sprite: '', visible: true },
      { id: genUid(), name: 'texte_j1', kind: 'texte', x: 370, y: 40, texte: '', prefixe: 'J1 : ', variable: 'score1', taille: 22, couleur: '#4ecdc4', visible: true },
      { id: genUid(), name: 'texte_j2', kind: 'texte', x: 500, y: 40, texte: '', prefixe: 'J2 : ', variable: 'score2', taille: 22, couleur: '#e94560', visible: true },
      { id: genUid(), name: 'texte_fin', kind: 'texte', x: 280, y: 250, texte: '', prefixe: '', variable: '', taille: 30, couleur: '#ffd700', visible: false }
    ],
    variables: [
      { id: genUid(), name: 'score1', kind: 'nombre', value: 0 },
      { id: genUid(), name: 'score2', kind: 'nombre', value: 0 },
      { id: genUid(), name: 'fini', kind: 'booleen', value: false }
    ],
    events: [
      ev('standard', {
        conditions: [cond('start', {})],
        actions: [
          act('set_position', { a: 'balle', x: '480', y: '270' }),
          act('launch', { a: 'balle', direction: 'hasard', v: '280' })
        ]
      }),
      ev('standard', {
        conditions: [cond('var_true', { var: 'fini', state: 'false' })],
        actions: [
          act('move_dir', { a: 'raquette1', key: 'KeyW', direction: 'haut', v: '400' }),
          act('move_dir', { a: 'raquette1', key: 'KeyS', direction: 'bas', v: '400' }),
          act('keep_screen', { a: 'raquette1' })
        ]
      }),
      ev('standard', {
        conditions: [cond('var_true', { var: 'fini', state: 'false' })],
        actions: [
          act('move_dir', { a: 'raquette2', key: 'ArrowUp', direction: 'haut', v: '400' }),
          act('move_dir', { a: 'raquette2', key: 'ArrowDown', direction: 'bas', v: '400' }),
          act('keep_screen', { a: 'raquette2' })
        ]
      }),
      ev('standard', {
        conditions: [cond('var_true', { var: 'fini', state: 'false' })],
        actions: [
          act('apply_velocity', { a: 'balle' }),
          act('bounce_edges', { a: 'balle' })
        ]
      }),
      ev('standard', {
        conditions: [cond('touch_obj', { a: 'balle', b: 'raquette1' })],
        actions: [
          act('bounce_against', { a: 'balle', b: 'raquette1' }),
          act('play_sound', { nom: 'rebond' })
        ]
      }),
      ev('standard', {
        conditions: [cond('touch_obj', { a: 'balle', b: 'raquette2' })],
        actions: [
          act('bounce_against', { a: 'balle', b: 'raquette2' }),
          act('play_sound', { nom: 'rebond' })
        ]
      }),
      ev('standard', {
        conditions: [cond('compare', { left: 'balle.x', op: '<', right: '0' })],
        actions: [
          act('change_var', { cible: 'score2', valeur: '1' }),
          act('set_position', { a: 'balle', x: '480', y: '270' }),
          act('launch', { a: 'balle', direction: 'hasard', v: '280' })
        ]
      }),
      ev('standard', {
        conditions: [cond('compare', { left: 'balle.x', op: '>', right: 'canvas.width' })],
        actions: [
          act('change_var', { cible: 'score1', valeur: '1' }),
          act('set_position', { a: 'balle', x: '480', y: '270' }),
          act('launch', { a: 'balle', direction: 'hasard', v: '280' })
        ]
      }),
      ev('standard', {
        conditions: [cond('compare', { left: 'score1', op: '>=', right: '5' })],
        actions: [
          act('set_var', { cible: 'fini', valeur: 'true' }),
          act('show_text', { a: 'texte_fin', texte: '🏆 JOUEUR 1 GAGNE ! Espace pour rejouer' }),
          act('play_sound', { nom: 'victoire' })
        ]
      }),
      ev('standard', {
        conditions: [cond('compare', { left: 'score2', op: '>=', right: '5' })],
        actions: [
          act('set_var', { cible: 'fini', valeur: 'true' }),
          act('show_text', { a: 'texte_fin', texte: '🏆 JOUEUR 2 GAGNE ! Espace pour rejouer' }),
          act('play_sound', { nom: 'victoire' })
        ]
      }),
      ev('standard', {
        conditions: [
          cond('var_true', { var: 'fini', state: 'true' }),
          cond('key_pressed', { key: 'Space' })
        ],
        actions: [act('reset_game', {})]
      })
    ]
  };
}
