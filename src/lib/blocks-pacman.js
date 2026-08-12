// Projet "Chasse aux Fantômes" (façon Pac-Man), construit entièrement à
// partir de vrais blocs — comme blocks-starter.js — pour que la démo listée
// dans "🎮 Démos de Jeux Rétro" (voir demos.js) soit identique, bloc pour
// bloc, à ce qu'on obtient en cliquant sur "👻 Fantômes" dans l'éditeur de
// Blocs. Si tu modifies ce fichier, régénère l'entrée de demos.js avec
// generateCode({ variables, scripts }) pour que les deux restent en phase.
import { createBlock } from './blocks-defs';

function block(defId, fields, slots) {
  const b = createBlock(defId);
  Object.assign(b.fields, fields);
  if (slots) {
    for (const [slotName, children] of Object.entries(slots)) {
      b.slots[slotName] = children;
    }
  }
  return b;
}

export function buildPacmanProject() {
  const variables = [
    { id: 'v1', name: 'joueur', kind: 'objet_rect', value: { x: 450, y: 270, w: 28, h: 28, vitesse: 200 } },
    { id: 'v2', name: 'fantome', kind: 'objet_rect', value: { x: 450, y: 90, w: 28, h: 28, vitesse: 110 } },
    { id: 'v3', name: 'pieces', kind: 'liste_vide', value: null },
    { id: 'v4', name: 'score', kind: 'nombre', value: 0 },
    { id: 'v5', name: 'gameOver', kind: 'booleen', value: false },
    { id: 'v6', name: 'victoire', kind: 'booleen', value: false }
  ];

  const scripts = {
    init: [
      block('set_var', { cible: 'score', valeur: '0' }),
      block('set_var', { cible: 'gameOver', valeur: 'false' }),
      block('set_var', { cible: 'victoire', valeur: 'false' }),
      block('set_position', { var: 'joueur', x: '450', y: '270' }),
      block('set_position', { var: 'fantome', x: '450', y: '90' }),
      block('set_var', { cible: 'pieces', valeur: '[]' }),
      block('spawn_objects', { n: 18, liste: 'pieces', xmin: '40', xmax: '920', ymin: '40', ymax: '500', w: '14', h: '14' })
    ],
    update: [
      block('if_else_block', { condition: { type: 'flag', var: '(gameOver || victoire)', state: 'true' } }, {
        then: [
          block('if_block', { condition: { type: 'key', key: 'Space' } }, {
            then: [
              block('reset_game', {})
            ]
          })
        ],
        else: [
          block('move_arrows', { var: 'joueur', vitesse: '200' }),
          block('keep_on_screen', { var: 'joueur' }),
          block('change_position', {
            var: 'fantome',
            dx: '(joueur.x > fantome.x ? 1 : -1) * fantome.vitesse * dt',
            dy: '(joueur.y > fantome.y ? 1 : -1) * fantome.vitesse * dt'
          }),
          block('keep_on_screen', { var: 'fantome' }),
          block('foreach_block', { nom: 'piece', liste: 'pieces' }, {
            body: [
              block('if_block', { condition: { type: 'flag', var: 'piece.collected', state: 'false' } }, {
                then: [
                  block('if_block', { condition: { type: 'touch', a: 'joueur', b: 'piece' } }, {
                    then: [
                      block('set_var', { cible: 'piece.collected', valeur: 'true' }),
                      block('change_var', { cible: 'score', valeur: '1' }),
                      block('play_sound', { nom: 'piece' })
                    ]
                  })
                ]
              })
            ]
          }),
          block('remove_flagged', { liste: 'pieces', champ: 'collected' }),
          block('if_block', { condition: { type: 'touch', a: 'joueur', b: 'fantome' } }, {
            then: [
              block('set_var', { cible: 'gameOver', valeur: 'true' }),
              block('play_sound', { nom: 'perdu' })
            ]
          }),
          block('if_block', { condition: { type: 'compare', left: 'pieces.length', op: '===', right: '0' } }, {
            then: [
              block('set_var', { cible: 'victoire', valeur: 'true' }),
              block('play_sound', { nom: 'victoire' })
            ]
          })
        ]
      })
    ],
    draw: [
      block('clear_bg', { couleur: '#0a0a1a' }),
      block('foreach_block', { nom: 'piece', liste: 'pieces' }, {
        body: [
          block('draw_circle', { x: 'piece.x', y: 'piece.y', rayon: '6', couleur: '#ffd24d' })
        ]
      }),
      block('draw_rect', { var: 'fantome', couleur: '#e94560' }),
      block('draw_rect', { var: 'joueur', couleur: '#ffd700' }),
      block('draw_var_text', { prefixe: 'Score : ', var: 'score', x: '16', y: '32', couleur: '#ffffff', taille: 18 }),
      block('if_block', { condition: { type: 'flag', var: 'gameOver', state: 'true' } }, {
        then: [
          block('draw_text', { texte: '💀 Perdu ! Espace pour rejouer', x: '170', y: '280', couleur: '#e94560', taille: 26 })
        ]
      }),
      block('if_block', { condition: { type: 'flag', var: 'victoire', state: 'true' } }, {
        then: [
          block('draw_text', { texte: '🏆 Gagné ! Espace pour rejouer', x: '170', y: '280', couleur: '#ffd700', taille: 26 })
        ]
      })
    ]
  };

  return { variables, scripts };
}
