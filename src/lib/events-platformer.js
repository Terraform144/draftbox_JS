// Projet « Plateforme », construit entièrement avec la feuille d'événements.
// Montre : la gravité et le saut, l'atterrissage sur des plateformes (liste
// de rectangles + collisions), les murs qui arrêtent le joueur, les pièces à
// ramasser et le score. Astuce : le saut ne marche que si « auSol » est vrai,
// une variable remise à faux chaque image puis revalorisée par l'atterrissage.
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

export function buildPlatformerProject() {
  return {
    bg: '#0a0a1a',
    objects: [
      { id: genUid(), name: 'joueur', kind: 'objet', x: 50, y: 300, w: 28, h: 32, vitesse: 250, couleur: '#4ecdc4', sprite: '', visible: true },
      { id: genUid(), name: 'texte_score', kind: 'texte', x: 16, y: 32, texte: '', prefixe: 'Pièces : ', variable: 'score', taille: 18, couleur: '#ffffff', visible: true },
      { id: genUid(), name: 'texte_info', kind: 'texte', x: 16, y: 56, texte: '← → pour se déplacer · ESPACE pour sauter', prefixe: '', variable: '', taille: 14, couleur: '#8892b0', visible: true }
    ],
    variables: [
      { id: genUid(), name: 'score', kind: 'nombre', value: 0 },
      { id: genUid(), name: 'plateformes', kind: 'liste', value: null, couleur: '#16213e', forme: 'carre', taille: 20 },
      { id: genUid(), name: 'pieces', kind: 'liste', value: null, couleur: '#ffd700', forme: 'cercle', taille: 16 }
    ],
    events: [
      ev('standard', {
        conditions: [cond('start', {})],
        actions: [
          act('set_var', { cible: 'score', valeur: '0' }),
          act('set_var', { cible: 'joueur.auSol', valeur: 'false' }),
          act('set_velocity', { a: 'joueur', dx: '0', dy: '0' }),
          act('set_position', { a: 'joueur', x: '50', y: '300' }),
          act('spawn', { n: 8, liste: 'pieces' }),
          act('spawn_rect', { liste: 'plateformes', x: '0', y: '520', w: 960, h: 20 }),
          act('spawn_rect', { liste: 'plateformes', x: '0', y: '0', w: 30, h: 540 }),
          act('spawn_rect', { liste: 'plateformes', x: '930', y: '0', w: 30, h: 540 }),
          act('spawn_rect', { liste: 'plateformes', x: '80', y: '450', w: 140, h: 20 }),
          act('spawn_rect', { liste: 'plateformes', x: '270', y: '400', w: 130, h: 20 }),
          act('spawn_rect', { liste: 'plateformes', x: '450', y: '360', w: 150, h: 20 }),
          act('spawn_rect', { liste: 'plateformes', x: '650', y: '410', w: 140, h: 20 }),
          act('spawn_rect', { liste: 'plateformes', x: '810', y: '330', w: 120, h: 20 })
        ]
      }),
      ev('standard', {
        actions: [act('move_keys', { a: 'joueur', axes: 'h' })]
      }),
      ev('standard', {
        conditions: [
          cond('key_pressed', { key: 'Space' }),
          cond('var_true', { var: 'joueur.auSol', state: 'true' })
        ],
        actions: [
          act('set_var', { cible: 'joueur.vy', valeur: '-420' }),
          act('set_var', { cible: 'joueur.auSol', valeur: 'false' }),
          act('play_sound', { nom: 'saut' })
        ]
      }),
      ev('standard', {
        conditions: [
          cond('key_pressed', { key: 'KeyW' }),
          cond('var_true', { var: 'joueur.auSol', state: 'true' })
        ],
        actions: [
          act('set_var', { cible: 'joueur.vy', valeur: '-420' }),
          act('set_var', { cible: 'joueur.auSol', valeur: 'false' }),
          act('play_sound', { nom: 'saut' })
        ]
      }),
      ev('standard', { actions: [act('set_var', { cible: 'joueur.auSol', valeur: 'false' })] }),
      ev('standard', { actions: [act('change_var', { cible: 'joueur.vy', valeur: '900 * dt' })] }),
      ev('standard', {
        conditions: [cond('compare', { left: 'joueur.vy', op: '>', right: '600' })],
        actions: [act('set_var', { cible: 'joueur.vy', valeur: '600' })]
      }),
      ev('standard', { actions: [act('apply_velocity', { a: 'joueur' })] }),
      ev('foreach', {
        item: 'p', liste: 'plateformes',
        subevents: [
          ev('standard', {
            conditions: [
              cond('touch_obj', { a: 'joueur', b: 'p' }),
              cond('compare', { left: 'joueur.vy', op: '>', right: '0' }),
              cond('compare', { left: 'joueur.y + joueur.h - joueur.vy * dt', op: '<=', right: 'p.y + 4' })
            ],
            actions: [
              act('set_position', { a: 'joueur', x: 'joueur.x', y: 'p.y - joueur.h' }),
              act('set_var', { cible: 'joueur.vy', valeur: '0' }),
              act('set_var', { cible: 'joueur.auSol', valeur: 'true' })
            ]
          })
        ]
      }),
      ev('foreach', {
        item: 'p', liste: 'plateformes',
        subevents: [
          ev('standard', {
            conditions: [
              cond('touch_obj', { a: 'joueur', b: 'p' }),
              cond('compare', { left: 'joueur.y + joueur.h - joueur.vy * dt', op: '<=', right: 'p.y + 4' }, true),
              cond('key_pressed', { key: 'ArrowRight' })
            ],
            actions: [act('set_position', { a: 'joueur', x: 'p.x - joueur.w', y: 'joueur.y' })]
          }),
          ev('standard', {
            conditions: [
              cond('touch_obj', { a: 'joueur', b: 'p' }),
              cond('compare', { left: 'joueur.y + joueur.h - joueur.vy * dt', op: '<=', right: 'p.y + 4' }, true),
              cond('key_pressed', { key: 'KeyD' })
            ],
            actions: [act('set_position', { a: 'joueur', x: 'p.x - joueur.w', y: 'joueur.y' })]
          }),
          ev('standard', {
            conditions: [
              cond('touch_obj', { a: 'joueur', b: 'p' }),
              cond('compare', { left: 'joueur.y + joueur.h - joueur.vy * dt', op: '<=', right: 'p.y + 4' }, true),
              cond('key_pressed', { key: 'ArrowLeft' })
            ],
            actions: [act('set_position', { a: 'joueur', x: 'p.x + p.w', y: 'joueur.y' })]
          }),
          ev('standard', {
            conditions: [
              cond('touch_obj', { a: 'joueur', b: 'p' }),
              cond('compare', { left: 'joueur.y + joueur.h - joueur.vy * dt', op: '<=', right: 'p.y + 4' }, true),
              cond('key_pressed', { key: 'KeyA' })
            ],
            actions: [act('set_position', { a: 'joueur', x: 'p.x + p.w', y: 'joueur.y' })]
          })
        ]
      }),
      ev('standard', {
        conditions: [cond('compare', { left: 'joueur.y', op: '>', right: '600' })],
        actions: [
          act('set_position', { a: 'joueur', x: '50', y: '300' }),
          act('set_velocity', { a: 'joueur', dx: '0', dy: '0' }),
          act('set_var', { cible: 'score', valeur: '0' })
        ]
      }),
      ev('foreach', {
        item: 'piece', liste: 'pieces',
        subevents: [
          ev('standard', {
            conditions: [
              cond('touch_obj', { a: 'joueur', b: 'piece' }),
              cond('compare', { left: 'piece.collected', op: '!==', right: 'true' })
            ],
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
