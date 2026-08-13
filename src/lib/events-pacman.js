// Projet « Chasse aux Fantômes » (façon Pac-Man), construit entièrement avec
// la feuille d'événements. Montre : conditions combinées (et/non), « pour
// chaque », comparaisons, texte de fin de partie et recommandation.
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

export function buildPacmanProject() {
  return {
    bg: '#0a0a1a',
    objects: [
      { id: genUid(), name: 'joueur', kind: 'objet', x: 450, y: 270, w: 28, h: 28, vitesse: 200, couleur: '#ffd700', sprite: '', visible: true },
      { id: genUid(), name: 'fantome', kind: 'objet', x: 450, y: 90, w: 28, h: 28, vitesse: 110, couleur: '#e94560', sprite: '', visible: true },
      { id: genUid(), name: 'texte_score', kind: 'texte', x: 16, y: 28, texte: '', prefixe: 'Score : ', variable: 'score', taille: 18, couleur: '#ffffff', visible: true },
      { id: genUid(), name: 'texte_perdu', kind: 'texte', x: 170, y: 280, texte: '💀 Perdu ! Espace pour rejouer', prefixe: '', variable: '', taille: 26, couleur: '#e94560', visible: false },
      { id: genUid(), name: 'texte_victoire', kind: 'texte', x: 170, y: 280, texte: '🏆 Gagné ! Espace pour rejouer', prefixe: '', variable: '', taille: 26, couleur: '#ffd700', visible: false }
    ],
    variables: [
      { id: genUid(), name: 'score', kind: 'nombre', value: 0 },
      { id: genUid(), name: 'gameOver', kind: 'booleen', value: false },
      { id: genUid(), name: 'victoire', kind: 'booleen', value: false },
      { id: genUid(), name: 'pieces', kind: 'liste', value: null, couleur: '#ffd24d', forme: 'cercle', taille: 6 }
    ],
    events: [
      ev('standard', {
        conditions: [cond('start', {})],
        actions: [
          act('set_var', { cible: 'gameOver', valeur: 'false' }),
          act('set_var', { cible: 'victoire', valeur: 'false' }),
          act('spawn', { n: 18, liste: 'pieces' })
        ]
      }),
      ev('standard', {
        conditions: [
          cond('var_true', { var: '(gameOver || victoire)', state: 'true' }),
          cond('key_pressed', { key: 'Space' })
        ],
        actions: [act('reset_game', {})]
      }),
      ev('standard', {
        conditions: [cond('var_true', { var: '(gameOver || victoire)', state: 'true' }, true)],
        actions: [
          act('move_keys', { a: 'joueur', axes: '4' }),
          act('keep_screen', { a: 'joueur' }),
          act('move_by', {
            a: 'fantome',
            dx: '(joueur.x > fantome.x ? 1 : -1) * fantome.vitesse * dt',
            dy: '(joueur.y > fantome.y ? 1 : -1) * fantome.vitesse * dt'
          }),
          act('keep_screen', { a: 'fantome' })
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
      ev('standard', { actions: [act('remove_flagged', { liste: 'pieces' })] }),
      ev('standard', {
        conditions: [cond('touch_obj', { a: 'joueur', b: 'fantome' })],
        actions: [
          act('set_var', { cible: 'gameOver', valeur: 'true' }),
          act('play_sound', { nom: 'perdu' })
        ]
      }),
      ev('standard', {
        conditions: [cond('compare', { left: 'pieces.length', op: '===', right: '0' })],
        actions: [
          act('set_var', { cible: 'victoire', valeur: 'true' }),
          act('play_sound', { nom: 'victoire' })
        ]
      }),
      ev('standard', {
        conditions: [cond('var_true', { var: 'gameOver', state: 'true' })],
        actions: [act('show_text', { a: 'texte_perdu', texte: '💀 Perdu ! Espace pour rejouer' })]
      }),
      ev('standard', {
        conditions: [cond('var_true', { var: 'victoire', state: 'true' })],
        actions: [act('show_text', { a: 'texte_victoire', texte: '🏆 Gagné ! Espace pour rejouer' })]
      })
    ]
  };
}
