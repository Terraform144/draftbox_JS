// Projet « Serpent » (façon Snake), construit entièrement avec la feuille
// d'événements. Montre : une liste qui sert de corps, un mouvement par pas
// de grille (compteur + modulo), un objet qui suit la direction, la pomme à
// ramasser qui fait grandir le serpent, les collisions avec soi-même et les
// bords, le score et le game over.
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

export function buildSnakeProject() {
  return {
    bg: '#0a0a1a',
    objects: [
      { id: genUid(), name: 'tete', kind: 'objet', x: 300, y: 300, w: 20, h: 20, vitesse: 0, couleur: '#4ecdc4', sprite: '', visible: true },
      { id: genUid(), name: 'pomme', kind: 'objet', x: 460, y: 260, w: 18, h: 18, vitesse: 0, couleur: '#e94560', sprite: '', visible: true },
      { id: genUid(), name: 'texte_score', kind: 'texte', x: 16, y: 32, texte: '', prefixe: 'Score : ', variable: 'score', taille: 20, couleur: '#8892b0', visible: true },
      { id: genUid(), name: 'texte_fin', kind: 'texte', x: 200, y: 260, texte: '', prefixe: '', variable: '', taille: 30, couleur: '#e94560', visible: false }
    ],
    variables: [
      { id: genUid(), name: 'score', kind: 'nombre', value: 0 },
      { id: genUid(), name: 'compteur', kind: 'nombre', value: 0 },
      { id: genUid(), name: 'dirX', kind: 'nombre', value: 1 },
      { id: genUid(), name: 'dirY', kind: 'nombre', value: 0 },
      { id: genUid(), name: 'nextX', kind: 'nombre', value: 1 },
      { id: genUid(), name: 'nextY', kind: 'nombre', value: 0 },
      { id: genUid(), name: 'mange', kind: 'booleen', value: false },
      { id: genUid(), name: 'gameOver', kind: 'booleen', value: false },
      { id: genUid(), name: 'serpent', kind: 'liste', value: null, couleur: '#2d9e96', forme: 'carre', taille: 18 }
    ],
    events: [
      ev('standard', {
        conditions: [cond('start', {})],
        actions: [
          act('set_var', { cible: 'score', valeur: '0' }),
          act('set_var', { cible: 'compteur', valeur: '0' }),
          act('set_var', { cible: 'gameOver', valeur: 'false' }),
          act('set_var', { cible: 'mange', valeur: 'false' }),
          act('set_var', { cible: 'dirX', valeur: '1' }),
          act('set_var', { cible: 'dirY', valeur: '0' }),
          act('set_var', { cible: 'nextX', valeur: '1' }),
          act('set_var', { cible: 'nextY', valeur: '0' }),
          act('set_position', { a: 'tete', x: '300', y: '300' }),
          act('spawn_at', { x: 'tete.x - 20', y: 'tete.y', liste: 'serpent' }),
          act('spawn_at', { x: 'tete.x - 40', y: 'tete.y', liste: 'serpent' }),
          act('set_position', { a: 'pomme', x: 'Math.floor(rand(0, 47)) * 20', y: 'Math.floor(rand(0, 26)) * 20' })
        ]
      }),
      ev('standard', { actions: [act('change_var', { cible: 'compteur', valeur: '1' })] }),
      ev('standard', {
        conditions: [
          cond('key_pressed', { key: 'ArrowUp' }),
          cond('compare', { left: 'dirY', op: '!==', right: '1' })
        ],
        actions: [
          act('set_var', { cible: 'nextX', valeur: '0' }),
          act('set_var', { cible: 'nextY', valeur: '-1' })
        ]
      }),
      ev('standard', {
        conditions: [
          cond('key_pressed', { key: 'ArrowDown' }),
          cond('compare', { left: 'dirY', op: '!==', right: '-1' })
        ],
        actions: [
          act('set_var', { cible: 'nextX', valeur: '0' }),
          act('set_var', { cible: 'nextY', valeur: '1' })
        ]
      }),
      ev('standard', {
        conditions: [
          cond('key_pressed', { key: 'ArrowLeft' }),
          cond('compare', { left: 'dirX', op: '!==', right: '1' })
        ],
        actions: [
          act('set_var', { cible: 'nextX', valeur: '-1' }),
          act('set_var', { cible: 'nextY', valeur: '0' })
        ]
      }),
      ev('standard', {
        conditions: [
          cond('key_pressed', { key: 'ArrowRight' }),
          cond('compare', { left: 'dirX', op: '!==', right: '-1' })
        ],
        actions: [
          act('set_var', { cible: 'nextX', valeur: '1' }),
          act('set_var', { cible: 'nextY', valeur: '0' })
        ]
      }),
      ev('standard', {
        conditions: [
          cond('var_true', { var: 'gameOver', state: 'false' }),
          cond('compare', { left: 'compteur % 6', op: '===', right: '0' })
        ],
        actions: [
          act('spawn_at', { x: 'tete.x', y: 'tete.y', liste: 'serpent' }),
          act('set_position', { a: 'tete', x: 'tete.x + nextX * 20', y: 'tete.y + nextY * 20' }),
          act('set_var', { cible: 'dirX', valeur: 'nextX' }),
          act('set_var', { cible: 'dirY', valeur: 'nextY' })
        ]
      }),
      ev('standard', {
        conditions: [
          cond('var_true', { var: 'gameOver', state: 'false' }),
          cond('compare', { left: 'compteur % 6', op: '===', right: '0' }),
          cond('touch_obj', { a: 'tete', b: 'pomme' })
        ],
        actions: [
          act('change_var', { cible: 'score', valeur: '1' }),
          act('set_var', { cible: 'mange', valeur: 'true' }),
          act('set_position', { a: 'pomme', x: 'Math.floor(rand(0, 47)) * 20', y: 'Math.floor(rand(0, 26)) * 20' }),
          act('play_sound', { nom: 'piece' })
        ]
      }),
      ev('standard', {
        conditions: [
          cond('var_true', { var: 'gameOver', state: 'false' }),
          cond('compare', { left: 'compteur % 6', op: '===', right: '0' }),
          cond('var_true', { var: 'mange', state: 'false' })
        ],
        actions: [act('remove_last', { liste: 'serpent' })]
      }),
      ev('standard', {
        conditions: [
          cond('var_true', { var: 'gameOver', state: 'false' }),
          cond('compare', { left: 'compteur % 6', op: '===', right: '0' })
        ],
        actions: [act('set_var', { cible: 'mange', valeur: 'false' })]
      }),
      ev('standard', {
        conditions: [
          cond('var_true', { var: 'gameOver', state: 'false' }),
          cond('touch_list', { a: 'tete', liste: 'serpent' })
        ],
        actions: [
          act('set_var', { cible: 'gameOver', valeur: 'true' }),
          act('play_sound', { nom: 'perdu' })
        ]
      }),
      ev('standard', {
        conditions: [
          cond('var_true', { var: 'gameOver', state: 'false' }),
          cond('touch_edge', { a: 'tete' })
        ],
        actions: [
          act('set_var', { cible: 'gameOver', valeur: 'true' }),
          act('play_sound', { nom: 'perdu' })
        ]
      }),
      ev('standard', {
        conditions: [cond('var_true', { var: 'gameOver', state: 'true' })],
        actions: [act('show_text', { a: 'texte_fin', texte: '💀 GAME OVER. Espace pour rejouer' })]
      }),
      ev('standard', {
        conditions: [
          cond('var_true', { var: 'gameOver', state: 'true' }),
          cond('key_pressed', { key: 'Space' })
        ],
        actions: [act('reset_game', {})]
      })
    ]
  };
}
