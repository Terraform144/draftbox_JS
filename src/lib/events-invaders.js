// Projet « Space Invaders » (version événements), construit entièrement
// avec la feuille d'événements. Montre : grille de pièces, création à une
// position, vitesses (vx/vy), collision « touche un élément de la liste »,
// fin de partie / victoire.
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

export function buildInvadersProject() {
  return {
    bg: '#0a0a1a',
    objects: [
      { id: genUid(), name: 'joueur', kind: 'objet', x: 440, y: 500, w: 60, h: 30, vitesse: 350, couleur: '#4ecdc4', sprite: '', visible: true },
      { id: genUid(), name: 'texte_score', kind: 'texte', x: 16, y: 32, texte: '', prefixe: 'Score : ', variable: 'score', taille: 18, couleur: '#8892b0', visible: true },
      { id: genUid(), name: 'texte_fin', kind: 'texte', x: 200, y: 250, texte: '', prefixe: '', variable: '', taille: 30, couleur: '#ffd700', visible: false }
    ],
    variables: [
      { id: genUid(), name: 'score', kind: 'nombre', value: 0 },
      { id: genUid(), name: 'dirDroite', kind: 'booleen', value: true },
      { id: genUid(), name: 'fini', kind: 'booleen', value: false },
      { id: genUid(), name: 'gagne', kind: 'booleen', value: false },
      { id: genUid(), name: 'balles', kind: 'liste', value: null, couleur: '#ffd700', forme: 'carre', taille: 6 },
      { id: genUid(), name: 'aliens', kind: 'liste', value: null, couleur: '#e94560', forme: 'carre', taille: 30 }
    ],
    events: [
      ev('standard', {
        conditions: [cond('start', {})],
        actions: [act('spawn_grid', { liste: 'aliens', lignes: 4, colonnes: 10, x: '70', y: '40', w: 50, h: 30 })]
      }),
      ev('standard', {
        actions: [
          act('move_keys', { a: 'joueur', axes: 'h' }),
          act('keep_screen', { a: 'joueur' })
        ]
      }),
      ev('standard', {
        conditions: [
          cond('var_true', { var: 'fini', state: 'false' }),
          cond('key_pressed', { key: 'Space' })
        ],
        actions: [
          act('spawn_at', { x: 'joueur.x + 28', y: 'joueur.y - 10', liste: 'balles' }),
          act('play_sound', { nom: 'tir' })
        ]
      }),
      ev('foreach', {
        item: 'balle', liste: 'balles',
        subevents: [
          ev('standard', {
            actions: [
              act('launch', { a: 'balle', direction: 'haut', v: '400' }),
              act('apply_velocity', { a: 'balle' })
            ]
          }),
          ev('standard', {
            conditions: [cond('touch_edge', { a: 'balle' })],
            actions: [act('set_var', { cible: 'balle.collected', valeur: 'true' })]
          })
        ]
      }),
      ev('foreach', {
        item: 'alien', liste: 'aliens',
        subevents: [
          ev('standard', {
            conditions: [cond('var_true', { var: 'dirDroite', state: 'true' })],
            actions: [act('set_velocity', { a: 'alien', dx: '80', dy: '0' })]
          }),
          ev('standard', {
            conditions: [cond('var_true', { var: 'dirDroite', state: 'false' })],
            actions: [act('set_velocity', { a: 'alien', dx: '-80', dy: '0' })]
          }),
          ev('standard', {
            actions: [act('apply_velocity', { a: 'alien' })]
          }),
          ev('standard', {
            conditions: [cond('touch_edge', { a: 'alien' })],
            actions: [
              act('toggle_var', { cible: 'dirDroite' }),
              act('move_by', { a: 'alien', dx: '0', dy: '20' })
            ]
          }),
          ev('standard', {
            conditions: [cond('touch_list', { a: 'alien', liste: 'balles' })],
            actions: [act('set_var', { cible: 'alien.collected', valeur: 'true' })]
          }),
          ev('standard', {
            conditions: [cond('compare', { left: 'alien.y + alien.h', op: '>=', right: 'joueur.y' })],
            actions: [
              act('set_var', { cible: 'fini', valeur: 'true' }),
              act('play_sound', { nom: 'perdu' })
            ]
          })
        ]
      }),
      ev('foreach', {
        item: 'balle', liste: 'balles',
        subevents: [
          ev('standard', {
            conditions: [cond('touch_list', { a: 'balle', liste: 'aliens' })],
            actions: [
              act('set_var', { cible: 'balle.collected', valeur: 'true' }),
              act('change_var', { cible: 'score', valeur: '1' }),
              act('play_sound', { nom: 'explosion' })
            ]
          })
        ]
      }),
      ev('standard', {
        actions: [
          act('remove_flagged', { liste: 'balles' }),
          act('remove_flagged', { liste: 'aliens' })
        ]
      }),
      ev('standard', {
        conditions: [cond('compare', { left: 'aliens.length', op: '===', right: '0' })],
        actions: [
          act('set_var', { cible: 'gagne', valeur: 'true' }),
          act('set_var', { cible: 'fini', valeur: 'true' }),
          act('play_sound', { nom: 'victoire' })
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
