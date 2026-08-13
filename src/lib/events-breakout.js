// Projet « Casse-briques » (façon Breakout), construit entièrement avec la
// feuille d'événements. Montre : grille de briques, balle qui suit la
// raquette puis se lance à l'espace, rebond contre les briques, vies,
// victoire et game over.
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

export function buildBreakoutProject() {
  return {
    bg: '#0a0a1a',
    objects: [
      { id: genUid(), name: 'raquette', kind: 'objet', x: 380, y: 520, w: 160, h: 16, vitesse: 500, couleur: '#ffffff', sprite: '', visible: true },
      { id: genUid(), name: 'balle', kind: 'objet', x: 460, y: 500, w: 8, h: 8, vitesse: 250, couleur: '#ffffff', sprite: '', visible: true },
      { id: genUid(), name: 'texte_score', kind: 'texte', x: 16, y: 32, texte: '', prefixe: 'Score : ', variable: 'score', taille: 18, couleur: '#8892b0', visible: true },
      { id: genUid(), name: 'texte_vies', kind: 'texte', x: 200, y: 32, texte: '', prefixe: 'Vies : ', variable: 'vies', taille: 18, couleur: '#8892b0', visible: true },
      { id: genUid(), name: 'texte_fin', kind: 'texte', x: 200, y: 250, texte: '', prefixe: '', variable: '', taille: 30, couleur: '#ffd700', visible: false }
    ],
    variables: [
      { id: genUid(), name: 'score', kind: 'nombre', value: 0 },
      { id: genUid(), name: 'vies', kind: 'nombre', value: 3 },
      { id: genUid(), name: 'fini', kind: 'booleen', value: false },
      { id: genUid(), name: 'gagne', kind: 'booleen', value: false },
      { id: genUid(), name: 'briques', kind: 'liste', value: null, couleur: '#e94560', forme: 'carre', taille: 8 }
    ],
    events: [
      ev('standard', {
        conditions: [cond('start', {})],
        actions: [
          act('spawn_grid', { liste: 'briques', lignes: 5, colonnes: 10, x: '12', y: '30', w: 80, h: 26 }),
          act('set_var', { cible: 'vies', valeur: '3' }),
          act('set_var', { cible: 'fini', valeur: 'false' }),
          act('set_var', { cible: 'gagne', valeur: 'false' }),
          act('set_velocity', { a: 'balle', dx: '0', dy: '0' })
        ]
      }),
      ev('standard', {
        actions: [
          act('move_keys', { a: 'raquette', axes: 'h' }),
          act('keep_screen', { a: 'raquette' })
        ]
      }),
      ev('standard', {
        conditions: [cond('compare', { left: 'balle.vx', op: '===', right: '0' })],
        actions: [act('set_position', { a: 'balle', x: 'raquette.x + raquette.w / 2 - 4', y: 'raquette.y - 10' })]
      }),
      ev('standard', {
        conditions: [
          cond('key_pressed', { key: 'Space' }),
          cond('compare', { left: 'balle.vx', op: '===', right: '0' })
        ],
        actions: [act('launch', { a: 'balle', direction: 'haut_aleatoire', v: '250' })]
      }),
      ev('standard', {
        conditions: [
          cond('compare', { left: 'balle.vx', op: '===', right: '0' }),
          cond('compare', { left: 'balle.vy', op: '!==', right: '0' })
        ],
        actions: [act('set_velocity', { a: 'balle', dx: 'rand(-120, 120) || 1', dy: '-250' })]
      }),
      ev('standard', {
        conditions: [cond('var_true', { var: 'fini', state: 'false' })],
        actions: [
          act('apply_velocity', { a: 'balle' }),
          act('bounce_edges', { a: 'balle' })
        ]
      }),
      ev('standard', {
        conditions: [
          cond('var_true', { var: 'fini', state: 'false' }),
          cond('touch_obj', { a: 'balle', b: 'raquette' })
        ],
        actions: [
          act('bounce_against', { a: 'balle', b: 'raquette' }),
          act('play_sound', { nom: 'rebond' })
        ]
      }),
      ev('foreach', {
        item: 'brique', liste: 'briques',
        subevents: [
          ev('standard', {
            conditions: [cond('touch_obj', { a: 'balle', b: 'brique' })],
            actions: [
              act('set_var', { cible: 'brique.collected', valeur: 'true' }),
              act('change_var', { cible: 'score', valeur: '10' }),
              act('bounce_against', { a: 'balle', b: 'brique' }),
              act('play_sound', { nom: 'rebond' })
            ]
          })
        ]
      }),
      ev('standard', { actions: [act('remove_flagged', { liste: 'briques' })] }),
      ev('standard', {
        conditions: [cond('compare', { left: 'balle.y', op: '>', right: 'canvas.height' })],
        actions: [
          act('change_var', { cible: 'vies', valeur: '-1' }),
          act('set_velocity', { a: 'balle', dx: '0', dy: '0' }),
          act('set_position', { a: 'balle', x: '460', y: '500' }),
          act('play_sound', { nom: 'degat' })
        ]
      }),
      ev('standard', {
        conditions: [cond('compare', { left: 'briques.length', op: '===', right: '0' })],
        actions: [
          act('set_var', { cible: 'gagne', valeur: 'true' }),
          act('set_var', { cible: 'fini', valeur: 'true' }),
          act('play_sound', { nom: 'victoire' })
        ]
      }),
      ev('standard', {
        conditions: [cond('compare', { left: 'vies', op: '<=', right: '0' })],
        actions: [
          act('set_var', { cible: 'fini', valeur: 'true' }),
          act('play_sound', { nom: 'perdu' })
        ]
      }),
      ev('standard', {
        conditions: [cond('var_true', { var: 'gagne', state: 'true' })],
        actions: [act('show_text', { a: 'texte_fin', texte: '🏆 VOUS GAGNEZ ! Espace pour rejouer' })]
      }),
      ev('standard', {
        conditions: [
          cond('var_true', { var: 'fini', state: 'true' }),
          cond('var_true', { var: 'gagne', state: 'false' })
        ],
        actions: [act('show_text', { a: 'texte_fin', texte: '💀 GAME OVER. Espace pour rejouer' })]
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
