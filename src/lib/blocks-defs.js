// Définition de tous les blocs disponibles dans l'éditeur "Blocs".
// Chaque bloc décrit : sa catégorie, son libellé (avec des {champs} injectés
// comme des widgets), et comment le traduire en code JavaScript.
import { genUid } from './blocks-tree';

export const CATEGORIES = [
  { id: 'mouvement', label: 'Mouvement', icon: '🏃', color: '#4C97FF' },
  { id: 'apparence', label: 'Apparence', icon: '🎨', color: '#9966FF' },
  { id: 'controle', label: 'Contrôle', icon: '🧭', color: '#FFAB19' },
  { id: 'variables', label: 'Variables', icon: '📦', color: '#FF8C1A' },
  { id: 'listes', label: 'Listes', icon: '🧺', color: '#59C059' },
  { id: 'son', label: 'Son', icon: '🔊', color: '#FF6680' }
];

export const KEY_OPTIONS = [
  { value: 'ArrowLeft', label: '← Gauche' },
  { value: 'ArrowRight', label: '→ Droite' },
  { value: 'ArrowUp', label: '↑ Haut' },
  { value: 'ArrowDown', label: '↓ Bas' },
  { value: 'Space', label: 'Espace' },
  { value: 'KeyW', label: 'W' },
  { value: 'KeyA', label: 'A' },
  { value: 'KeyS', label: 'S' },
  { value: 'KeyD', label: 'D' }
];

const COMPARE_OPS = [
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '>=', label: '>=' },
  { value: '<=', label: '<=' },
  { value: '===', label: '=' },
  { value: '!==', label: '≠' }
];

// ── Aide pour les conditions du bloc "Si" (type de champ 'condition') ──
export const CONDITION_TYPES = [
  { value: 'key', label: 'Une touche est appuyée' },
  { value: 'touch', label: 'Deux objets se touchent' },
  { value: 'mouse', label: 'La souris est cliquée' },
  { value: 'compare', label: 'Comparer deux nombres' },
  { value: 'flag', label: 'Un état vrai / faux' }
];

export function buildCondition(cond) {
  if (!cond) return 'true';
  let expr;
  switch (cond.type) {
    case 'key':
      expr = `keys.${cond.key || 'Space'}`;
      break;
    case 'touch':
      expr = `rectCollide(${cond.a || 'a'}, ${cond.b || 'b'})`;
      break;
    case 'mouse':
      expr = 'mouse.left';
      break;
    case 'compare':
      expr = `(${cond.left || '0'} ${cond.op || '>'} ${cond.right || '0'})`;
      break;
    case 'flag':
      expr = cond.state === 'false' ? `!${cond.var || 'valeur'}` : `${cond.var || 'valeur'}`;
      break;
    default:
      expr = 'true';
  }
  return cond.negate ? `!(${expr})` : expr;
}

const DEFAULT_CONDITION = { type: 'key', key: 'Space', a: 'joueur', b: 'ennemi', op: '>', left: 'score', right: '0', var: 'piece.collected', state: 'true', negate: false };

// ── Définitions des blocs ──
export const BLOCK_DEFS = {
  // MOUVEMENT
  move_arrows: {
    id: 'move_arrows', category: 'mouvement',
    label: 'déplacer {var} avec les flèches (vitesse {vitesse})',
    fields: { var: { type: 'varRef', default: 'joueur' }, vitesse: { type: 'text', default: '200' } },
    gen: (f) => `if (keys.ArrowLeft || keys.KeyA) ${f.var}.x -= ${f.vitesse} * dt;\nif (keys.ArrowRight || keys.KeyD) ${f.var}.x += ${f.vitesse} * dt;\nif (keys.ArrowUp || keys.KeyW) ${f.var}.y -= ${f.vitesse} * dt;\nif (keys.ArrowDown || keys.KeyS) ${f.var}.y += ${f.vitesse} * dt;`
  },
  set_position: {
    id: 'set_position', category: 'mouvement',
    label: 'placer {var} à x: {x} y: {y}',
    fields: { var: { type: 'varRef', default: 'joueur' }, x: { type: 'text', default: '400' }, y: { type: 'text', default: '300' } },
    gen: (f) => `${f.var}.x = ${f.x};\n${f.var}.y = ${f.y};`
  },
  change_position: {
    id: 'change_position', category: 'mouvement',
    label: 'déplacer {var} de dx: {dx} dy: {dy}',
    fields: { var: { type: 'varRef', default: 'joueur' }, dx: { type: 'text', default: '0' }, dy: { type: 'text', default: '0' } },
    gen: (f) => `${f.var}.x += ${f.dx};\n${f.var}.y += ${f.dy};`
  },
  apply_velocity: {
    id: 'apply_velocity', category: 'mouvement',
    label: 'appliquer la vitesse (vx, vy) de {var} à sa position',
    fields: { var: { type: 'varRef', default: 'balle' } },
    gen: (f) => `${f.var}.x += ${f.var}.vx * dt;\n${f.var}.y += ${f.var}.vy * dt;`
  },
  bounce_edges: {
    id: 'bounce_edges', category: 'mouvement',
    label: 'faire rebondir {var} sur les bords de l\'écran',
    fields: { var: { type: 'varRef', default: 'balle' } },
    gen: (f) => `if (${f.var}.x <= 0 || ${f.var}.x + (${f.var}.w||0) >= canvas.width) ${f.var}.vx *= -1;\nif (${f.var}.y <= 0 || ${f.var}.y + (${f.var}.h||0) >= canvas.height) ${f.var}.vy *= -1;`
  },
  keep_on_screen: {
    id: 'keep_on_screen', category: 'mouvement',
    label: 'garder {var} à l\'intérieur de l\'écran',
    fields: { var: { type: 'varRef', default: 'joueur' } },
    gen: (f) => `${f.var}.x = clamp(${f.var}.x, 0, canvas.width - ${f.var}.w);\n${f.var}.y = clamp(${f.var}.y, 0, canvas.height - ${f.var}.h);`
  },
  move_toward_mouse: {
    id: 'move_toward_mouse', category: 'mouvement',
    label: 'déplacer {var} vers la souris (vitesse {vitesse})',
    fields: { var: { type: 'varRef', default: 'joueur' }, vitesse: { type: 'text', default: '200' } },
    gen: (f) => `{\n  const dx = mouse.x - (${f.var}.x + ${f.var}.w / 2);\n  const dy = mouse.y - (${f.var}.y + ${f.var}.h / 2);\n  const dist = Math.hypot(dx, dy) || 1;\n  ${f.var}.x += (dx / dist) * ${f.vitesse} * dt;\n  ${f.var}.y += (dy / dist) * ${f.vitesse} * dt;\n}`
  },

  // APPARENCE
  clear_bg: {
    id: 'clear_bg', category: 'apparence',
    label: 'effacer l\'écran avec la couleur {couleur}',
    fields: { couleur: { type: 'color', default: '#1a1a2e' } },
    gen: (f) => `ctx.fillStyle = ${JSON.stringify(f.couleur)};\nctx.fillRect(0, 0, canvas.width, canvas.height);`
  },
  draw_rect: {
    id: 'draw_rect', category: 'apparence',
    label: 'dessiner {var} comme un rectangle {couleur}',
    fields: { var: { type: 'varRef', default: 'joueur' }, couleur: { type: 'color', default: '#e94560' } },
    gen: (f) => `ctx.fillStyle = ${JSON.stringify(f.couleur)};\nctx.fillRect(${f.var}.x, ${f.var}.y, ${f.var}.w, ${f.var}.h);`
  },
  draw_circle: {
    id: 'draw_circle', category: 'apparence',
    label: 'dessiner un cercle à x: {x} y: {y} rayon: {rayon} couleur: {couleur}',
    fields: { x: { type: 'text', default: '100' }, y: { type: 'text', default: '100' }, rayon: { type: 'text', default: '8' }, couleur: { type: 'color', default: '#ffd700' } },
    gen: (f) => `ctx.fillStyle = ${JSON.stringify(f.couleur)};\nctx.beginPath();\nctx.arc(${f.x}, ${f.y}, ${f.rayon}, 0, Math.PI * 2);\nctx.fill();`
  },
  draw_sprite: {
    id: 'draw_sprite', category: 'apparence',
    label: 'dessiner le sprite "{nom}" à la position de {var}',
    fields: { nom: { type: 'text', default: 'player' }, var: { type: 'varRef', default: 'joueur' } },
    gen: (f) => `if (sprites[${JSON.stringify(f.nom)}]) {\n  ctx.drawImage(sprites[${JSON.stringify(f.nom)}], ${f.var}.x, ${f.var}.y, ${f.var}.w, ${f.var}.h);\n}`
  },
  draw_text: {
    id: 'draw_text', category: 'apparence',
    label: 'écrire {texte} à x: {x} y: {y} couleur: {couleur} taille: {taille}',
    fields: { texte: { type: 'text', default: 'Bonjour !' }, x: { type: 'text', default: '16' }, y: { type: 'text', default: '32' }, couleur: { type: 'color', default: '#ffffff' }, taille: { type: 'number', default: 18 } },
    gen: (f) => `ctx.fillStyle = ${JSON.stringify(f.couleur)};\nctx.font = ${JSON.stringify(f.taille + 'px monospace')};\nctx.fillText(${JSON.stringify(f.texte)}, ${f.x}, ${f.y});`
  },
  draw_var_text: {
    id: 'draw_var_text', category: 'apparence',
    label: 'écrire "{prefixe}" + {var} à x: {x} y: {y} couleur: {couleur} taille: {taille}',
    fields: { prefixe: { type: 'text', default: 'Score : ' }, var: { type: 'varRef', default: 'score' }, x: { type: 'text', default: '16' }, y: { type: 'text', default: '32' }, couleur: { type: 'color', default: '#ffffff' }, taille: { type: 'number', default: 18 } },
    gen: (f) => `ctx.fillStyle = ${JSON.stringify(f.couleur)};\nctx.font = ${JSON.stringify(f.taille + 'px monospace')};\nctx.fillText(${JSON.stringify(f.prefixe)} + ${f.var}, ${f.x}, ${f.y});`
  },

  // CONTRÔLE (blocs conteneurs)
  if_block: {
    id: 'if_block', category: 'controle',
    label: 'si {condition} alors :',
    fields: { condition: { type: 'condition', default: DEFAULT_CONDITION } },
    slots: ['then'], slotLabels: { then: '' },
    genWrap: (f, s, pad) => `${pad}if (${buildCondition(f.condition)}) {\n${s.then}\n${pad}}`
  },
  if_else_block: {
    id: 'if_else_block', category: 'controle',
    label: 'si {condition} alors :',
    fields: { condition: { type: 'condition', default: DEFAULT_CONDITION } },
    slots: ['then', 'else'], slotLabels: { then: '', else: 'sinon :' },
    genWrap: (f, s, pad) => `${pad}if (${buildCondition(f.condition)}) {\n${s.then}\n${pad}} else {\n${s.else}\n${pad}}`
  },
  repeat_block: {
    id: 'repeat_block', category: 'controle',
    label: 'répéter {n} fois :',
    fields: { n: { type: 'number', default: 5 } },
    slots: ['body'], slotLabels: { body: '' },
    genWrap: (f, s, pad) => `${pad}for (let i = 0; i < ${f.n}; i++) {\n${s.body}\n${pad}}`
  },
  foreach_block: {
    id: 'foreach_block', category: 'controle',
    label: 'pour chaque {nom} dans {liste} :',
    fields: { nom: { type: 'text', default: 'item' }, liste: { type: 'varRef', default: 'pieces' } },
    slots: ['body'], slotLabels: { body: '' },
    genWrap: (f, s, pad) => `${pad}for (const ${f.nom || 'item'} of ${f.liste}) {\n${s.body}\n${pad}}`
  },

  // VARIABLES
  set_var: {
    id: 'set_var', category: 'variables',
    label: 'mettre {cible} à {valeur}',
    fields: { cible: { type: 'varRef', default: 'score' }, valeur: { type: 'text', default: '0' } },
    gen: (f) => `${f.cible} = ${f.valeur};`
  },
  change_var: {
    id: 'change_var', category: 'variables',
    label: 'changer {cible} de {valeur}',
    fields: { cible: { type: 'varRef', default: 'score' }, valeur: { type: 'text', default: '1' } },
    gen: (f) => `${f.cible} += ${f.valeur};`
  },
  toggle_bool: {
    id: 'toggle_bool', category: 'variables',
    label: 'inverser {cible} (vrai / faux)',
    fields: { cible: { type: 'varRef', default: 'piece.collected' } },
    gen: (f) => `${f.cible} = !${f.cible};`
  },
  reset_game: {
    id: 'reset_game', category: 'variables',
    label: 'recommencer la partie',
    fields: {},
    gen: () => 'init();'
  },

  // LISTES
  spawn_objects: {
    id: 'spawn_objects', category: 'listes',
    label: 'créer {n} objets dans {liste}, position aléatoire x: {xmin} → {xmax} y: {ymin} → {ymax}, taille {w}×{h}',
    fields: {
      n: { type: 'number', default: 5 }, liste: { type: 'varRef', default: 'pieces' },
      xmin: { type: 'text', default: '50' }, xmax: { type: 'text', default: '850' },
      ymin: { type: 'text', default: '50' }, ymax: { type: 'text', default: '450' },
      w: { type: 'text', default: '16' }, h: { type: 'text', default: '16' }
    },
    gen: (f) => `for (let i = 0; i < ${f.n}; i++) {\n  ${f.liste}.push({ x: rand(${f.xmin}, ${f.xmax}), y: rand(${f.ymin}, ${f.ymax}), w: ${f.w}, h: ${f.h}, collected: false });\n}`
  },
  remove_flagged: {
    id: 'remove_flagged', category: 'listes',
    label: 'retirer de {liste} les éléments où {champ} est vrai',
    fields: { liste: { type: 'varRef', default: 'pieces' }, champ: { type: 'text', default: 'collected' } },
    gen: (f) => `${f.liste} = ${f.liste}.filter((it) => !it.${f.champ});`
  },

  // SON
  play_sound: {
    id: 'play_sound', category: 'son',
    label: 'jouer le son "{nom}"',
    fields: { nom: { type: 'text', default: 'coin' } },
    gen: (f) => `audio(${JSON.stringify(f.nom)});`
  }
};

export function seedFields(def) {
  const out = {};
  for (const [name, fieldDef] of Object.entries(def.fields || {})) {
    out[name] = JSON.parse(JSON.stringify(fieldDef.default));
  }
  return out;
}

export function resolveFields(def, fields) {
  const out = {};
  for (const [name, fieldDef] of Object.entries(def.fields || {})) {
    out[name] = fields && Object.prototype.hasOwnProperty.call(fields, name) ? fields[name] : fieldDef.default;
  }
  return out;
}

export function createBlock(defId) {
  const def = BLOCK_DEFS[defId];
  if (!def) throw new Error('Bloc inconnu : ' + defId);
  const block = { uid: genUid(), defId, fields: seedFields(def) };
  if (def.slots) {
    block.slots = {};
    for (const slotName of def.slots) block.slots[slotName] = [];
  }
  return block;
}

export const COMPARE_OPTIONS = COMPARE_OPS;
