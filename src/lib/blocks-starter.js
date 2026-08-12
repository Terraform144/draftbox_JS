// Projet de démarrage "Attrape-pièces", construit entièrement à partir de
// vrais blocs (pas de code à la main) pour donner un exemple qui fonctionne
// dès l'ouverture de l'onglet Blocs.
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

export function buildStarterProject() {
  const variables = [
    { id: 'v1', name: 'joueur', kind: 'objet_rect', value: { x: 400, y: 250, w: 32, h: 32, vitesse: 250 } },
    { id: 'v2', name: 'score', kind: 'nombre', value: 0 },
    { id: 'v3', name: 'pieces', kind: 'liste_vide', value: null }
  ];

  const scripts = {
    init: [
      block('spawn_objects', { n: 5, liste: 'pieces', xmin: '50', xmax: '850', ymin: '50', ymax: '450', w: '16', h: '16' })
    ],
    update: [
      block('move_arrows', { var: 'joueur', vitesse: '250' }),
      block('keep_on_screen', { var: 'joueur' }),
      block('foreach_block', { nom: 'piece', liste: 'pieces' }, {
        body: [
          block('if_block', { condition: { type: 'flag', var: 'piece.collected', state: 'false' } }, {
            then: [
              block('if_block', { condition: { type: 'touch', a: 'joueur', b: 'piece' } }, {
                then: [
                  block('set_var', { cible: 'piece.collected', valeur: 'true' }),
                  block('change_var', { cible: 'score', valeur: '1' })
                ]
              })
            ]
          })
        ]
      })
    ],
    draw: [
      block('clear_bg', { couleur: '#1a1a2e' }),
      block('foreach_block', { nom: 'piece', liste: 'pieces' }, {
        body: [
          block('if_block', { condition: { type: 'flag', var: 'piece.collected', state: 'false' } }, {
            then: [
              block('draw_circle', { x: 'piece.x', y: 'piece.y', rayon: '8', couleur: '#ffd700' })
            ]
          })
        ]
      }),
      block('draw_rect', { var: 'joueur', couleur: '#e94560' }),
      block('draw_var_text', { prefixe: 'Score : ', var: 'score', x: '16', y: '32', couleur: '#ffffff', taille: 18 })
    ]
  };

  return { variables, scripts };
}
