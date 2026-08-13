// Projet « Astéroïdes » (version événements simplifiée), construit
// entièrement avec la feuille d'événements. Montre : déplacement libre au
// clavier, réapparition de l'autre côté de l'écran, tirs, astéroïdes qui
// tombent, grosse roche qui éclate en petites, game over et score.
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

export function buildAsteroidsProject() {
  return {
    bg: '#0a0a1a',
    objects: [
      { id: genUid(), name: 'vaisseau', kind: 'objet', x: 480, y: 270, w: 20, h: 20, vitesse: 250, couleur: '#4ecdc4', sprite: '', visible: true },
      { id: genUid(), name: 'texte_score', kind: 'texte', x: 16, y: 32, texte: '', prefixe: 'Score : ', variable: 'score', taille: 18, couleur: '#8892b0', visible: true },
      { id: genUid(), name: 'texte_fin', kind: 'texte', x: 200, y: 250, texte: '', prefixe: '', variable: '', taille: 30, couleur: '#e94560', visible: false }
    ],
    variables: [
      { id: genUid(), name: 'score', kind: 'nombre', value: 0 },
      { id: genUid(), name: 'fini', kind: 'booleen', value: false },
      { id: genUid(), name: 'balles', kind: 'liste', value: null, couleur: '#ffd700', forme: 'carre', taille: 4 },
      { id: genUid(), name: 'grosRoches', kind: 'liste', value: null, couleur: '#8892b0', forme: 'carre', taille: 16 },
      { id: genUid(), name: 'petitsRoches', kind: 'liste', value: null, couleur: '#8892b0', forme: 'carre', taille: 6 }
    ],
    events: [
      ev('standard', {
        conditions: [cond('start', {})],
        actions: [
          act('set_var', { cible: 'fini', valeur: 'false' }),
          act('set_var', { cible: 'score', valeur: '0' })
        ]
      }),
      ev('standard', {
        actions: [
          act('move_dir', { a: 'vaisseau', key: 'ArrowLeft', direction: 'gauche', v: '250' }),
          act('move_dir', { a: 'vaisseau', key: 'ArrowRight', direction: 'droite', v: '250' }),
          act('move_dir', { a: 'vaisseau', key: 'ArrowUp', direction: 'haut', v: '250' }),
          act('move_dir', { a: 'vaisseau', key: 'ArrowDown', direction: 'bas', v: '250' }),
          act('wrap', { a: 'vaisseau' })
        ]
      }),
      ev('standard', {
        conditions: [
          cond('var_true', { var: 'fini', state: 'false' }),
          cond('key_pressed', { key: 'Space' })
        ],
        actions: [
          act('spawn_at', { x: 'vaisseau.x', y: 'vaisseau.y', liste: 'balles' }),
          act('play_sound', { nom: 'tir' })
        ]
      }),
      ev('foreach', {
        item: 'balle', liste: 'balles',
        subevents: [
          ev('standard', {
            actions: [
              act('launch', { a: 'balle', direction: 'haut', v: '450' }),
              act('apply_velocity', { a: 'balle' })
            ]
          }),
          ev('standard', {
            conditions: [cond('touch_edge', { a: 'balle' })],
            actions: [act('set_var', { cible: 'balle.collected', valeur: 'true' })]
          })
        ]
      }),
      ev('standard', {
        conditions: [cond('chance', { n: 30 })],
        actions: [act('spawn', { n: 1, liste: 'grosRoches' })]
      }),
      ev('foreach', {
        item: 'grosRoche', liste: 'grosRoches',
        subevents: [
          ev('standard', {
            actions: [
              act('set_velocity', { a: 'grosRoche', dx: '0', dy: '130' }),
              act('apply_velocity', { a: 'grosRoche' }),
              act('wrap', { a: 'grosRoche' })
            ]
          }),
          ev('standard', {
            conditions: [cond('touch_list', { a: 'grosRoche', liste: 'balles' })],
            actions: [
              act('set_var', { cible: 'grosRoche.collected', valeur: 'true' }),
              act('spawn_at', { x: 'grosRoche.x', y: 'grosRoche.y', liste: 'petitsRoches' }),
              act('spawn_at', { x: 'grosRoche.x', y: 'grosRoche.y', liste: 'petitsRoches' })
            ]
          })
        ]
      }),
      ev('foreach', {
        item: 'petitRoche', liste: 'petitsRoches',
        subevents: [
          ev('standard', {
            actions: [
              act('set_velocity', { a: 'petitRoche', dx: '0', dy: '190' }),
              act('apply_velocity', { a: 'petitRoche' }),
              act('wrap', { a: 'petitRoche' })
            ]
          })
        ]
      }),
      ev('foreach', {
        item: 'balle', liste: 'balles',
        subevents: [
          ev('standard', {
            conditions: [cond('touch_list', { a: 'balle', liste: 'grosRoches' })],
            actions: [
              act('set_var', { cible: 'balle.collected', valeur: 'true' }),
              act('change_var', { cible: 'score', valeur: '1' }),
              act('play_sound', { nom: 'explosion' })
            ]
          }),
          ev('standard', {
            conditions: [cond('touch_list', { a: 'balle', liste: 'petitsRoches' })],
            actions: [
              act('set_var', { cible: 'balle.collected', valeur: 'true' }),
              act('change_var', { cible: 'score', valeur: '2' }),
              act('play_sound', { nom: 'explosion' })
            ]
          })
        ]
      }),
      ev('standard', {
        actions: [
          act('remove_flagged', { liste: 'balles' }),
          act('remove_flagged', { liste: 'grosRoches' }),
          act('remove_flagged', { liste: 'petitsRoches' })
        ]
      }),
      ev('standard', {
        conditions: [
          cond('var_true', { var: 'fini', state: 'false' }),
          cond('touch_list', { a: 'vaisseau', liste: 'grosRoches' })
        ],
        actions: [
          act('set_var', { cible: 'fini', valeur: 'true' }),
          act('play_sound', { nom: 'perdu' })
        ]
      }),
      ev('standard', {
        conditions: [
          cond('var_true', { var: 'fini', state: 'false' }),
          cond('touch_list', { a: 'vaisseau', liste: 'petitsRoches' })
        ],
        actions: [
          act('set_var', { cible: 'fini', valeur: 'true' }),
          act('play_sound', { nom: 'perdu' })
        ]
      }),
      ev('standard', {
        conditions: [cond('var_true', { var: 'fini', state: 'true' })],
        actions: [act('show_text', { a: 'texte_fin', texte: '💀 BOOM ! Espace pour rejouer' })]
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
