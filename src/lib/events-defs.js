// Définitions de l'éditeur d'événements (façon GDevelop).
// Une feuille d'événements = liste d'événements, chacun composé de
// CONDITIONS (« Quand… ») et d'ACTIONS (« …alors »). Le tout est traduit
// en JavaScript pur par events-codegen.js — d'où la garantie d'un mapping
// parfait entre ce qu'on voit en blocs et le code généré.
import { ARCADE_SOUNDS } from './arcade-sounds';

let uidCounter = 0;
export function genUid() {
  uidCounter += 1;
  return 'id_' + Date.now().toString(36) + '_' + uidCounter.toString(36);
}

// ── Catégories de l'interface ──
export const CONDITION_CATEGORIES = [
  { id: 'detection', label: 'Détection', icon: '🎯', color: '#4C97FF' },
  { id: 'valeur', label: 'Valeurs', icon: '🔢', color: '#9966FF' }
];

export const ACTION_CATEGORIES = [
  { id: 'mouvement', label: 'Mouvement', icon: '🏃', color: '#4C97FF' },
  { id: 'objet', label: 'Objets & texte', icon: '🎨', color: '#9966FF' },
  { id: 'variables', label: 'Variables', icon: '📦', color: '#FF8C1A' },
  { id: 'listes', label: 'Listes', icon: '🧺', color: '#59C059' },
  { id: 'son', label: 'Son & jeu', icon: '🎵', color: '#FF6680' }
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

export const COMPARE_OPS = [
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '>=', label: '>=' },
  { value: '<=', label: '<=' },
  { value: '===', label: '=' },
  { value: '!==', label: '≠' }
];

export const TRUE_FALSE = [
  { value: 'true', label: 'vrai' },
  { value: 'false', label: 'faux' }
];

export const AXES_OPTIONS = [
  { value: '4', label: 'les 4 flèches' },
  { value: 'h', label: '← → gauche / droite' },
  { value: 'v', label: '↑ ↓ haut / bas' }
];

export const DIRECTIONS = [
  { value: 'droite', label: '→ vers la droite' },
  { value: 'gauche', label: '← vers la gauche' },
  { value: 'haut', label: '↑ vers le haut' },
  { value: 'bas', label: '↓ vers le bas' },
  { value: 'haut_aleatoire', label: '↗ vers le haut (angle au hasard)' },
  { value: 'hasard', label: '🎲 dans une direction au hasard' }
];

export const MOVE_DIRS = [
  { value: 'droite', label: '→ vers la droite' },
  { value: 'gauche', label: '← vers la gauche' },
  { value: 'haut', label: '↑ vers le haut' },
  { value: 'bas', label: '↓ vers le bas' }
];

// ── Définitions des conditions ──
export const CONDITION_DEFS = {
  start: {
    id: 'start', category: 'detection', icon: '🏁',
    label: 'au début du jeu',
    fields: {},
    // gérée spécialement par le codegen (bloc "au démarrage")
    gen: () => 'true'
  },
  key_pressed: {
    id: 'key_pressed', category: 'detection', icon: '⌨️',
    label: 'la touche {key} est appuyée',
    fields: { key: { type: 'key', default: 'Space' } },
    gen: (f) => `keys.${f.key}`
  },
  touch_obj: {
    id: 'touch_obj', category: 'detection', icon: '🤝',
    label: '{a} touche {b}',
    fields: { a: { type: 'varRef', default: 'joueur' }, b: { type: 'varRef', default: 'piece' } },
    gen: (f) => `rectCollide(${f.a}, ${f.b})`
  },
  touch_edge: {
    id: 'touch_edge', category: 'detection', icon: '🧭',
    label: '{a} touche un bord de l\'écran',
    fields: { a: { type: 'varRef', default: 'balle' } },
    gen: (f) => `(${f.a}.x <= 0 || ${f.a}.x + (${f.a}.w || 0) >= canvas.width || ${f.a}.y <= 0 || ${f.a}.y + (${f.a}.h || 0) >= canvas.height)`
  },
  touch_list: {
    id: 'touch_list', category: 'detection', icon: '💥',
    label: '{a} touche un élément de {liste}',
    fields: { a: { type: 'varRef', default: 'balle' }, liste: { type: 'listRef', default: 'aliens' } },
    gen: (f) => `(${f.liste}.some((__it) => rectCollide(${f.a}, __it)))`
  },
  mouse_clicked: {
    id: 'mouse_clicked', category: 'detection', icon: '🖱️',
    label: 'la souris est cliquée',
    fields: {},
    gen: () => 'mouse.left'
  },
  mouse_over: {
    id: 'mouse_over', category: 'detection', icon: '🖱️',
    label: 'la souris est sur {a}',
    fields: { a: { type: 'varRef', default: 'joueur' } },
    gen: (f) => `(mouse.x >= ${f.a}.x && mouse.x <= ${f.a}.x + (${f.a}.w || 0) && mouse.y >= ${f.a}.y && mouse.y <= ${f.a}.y + (${f.a}.h || 0))`
  },
  chance: {
    id: 'chance', category: 'detection', icon: '🎲',
    label: '1 chance sur {n}',
    fields: { n: { type: 'number', default: 2 } },
    gen: (f) => `Math.random() < ${(1 / Math.max(1, Number(f.n) || 1)).toFixed(6)}`
  },
  compare: {
    id: 'compare', category: 'valeur', icon: '⚖️',
    label: '{left} {op} {right}',
    fields: {
      left: { type: 'varRef', default: 'score' },
      op: { type: 'select', default: '>', options: COMPARE_OPS },
      right: { type: 'text', default: '10' }
    },
    gen: (f) => `(${f.left} ${f.op} ${f.right})`
  },
  var_true: {
    id: 'var_true', category: 'valeur', icon: '☑️',
    label: '{var} est {state}',
    fields: {
      var: { type: 'varRef', default: 'gameOver' },
      state: { type: 'select', default: 'true', options: TRUE_FALSE }
    },
    gen: (f) => (f.state === 'false' ? `!(${f.var})` : `(${f.var})`)
  },
  time: {
    id: 'time', category: 'valeur', icon: '⏱️',
    label: 'le jeu dure au moins {n} secondes',
    fields: { n: { type: 'number', default: 10 } },
    gen: (f) => `__temps >= ${Number(f.n) || 0}`
  }
};

// ── Définitions des actions ──
export const ACTION_DEFS = {
  move_keys: {
    id: 'move_keys', category: 'mouvement', icon: '🏃',
    label: 'déplacer {a} avec {axes}',
    fields: { a: { type: 'varRef', default: 'joueur' }, axes: { type: 'select', default: '4', options: AXES_OPTIONS } },
    gen: (f) => {
      const lines = [];
      if (f.axes === '4' || f.axes === 'h') {
        lines.push(`if (keys.ArrowLeft || keys.KeyA) ${f.a}.x -= ${f.a}.vitesse * dt;`);
        lines.push(`if (keys.ArrowRight || keys.KeyD) ${f.a}.x += ${f.a}.vitesse * dt;`);
      }
      if (f.axes === '4' || f.axes === 'v') {
        lines.push(`if (keys.ArrowUp || keys.KeyW) ${f.a}.y -= ${f.a}.vitesse * dt;`);
        lines.push(`if (keys.ArrowDown || keys.KeyS) ${f.a}.y += ${f.a}.vitesse * dt;`);
      }
      return lines.join('\n');
    }
  },
  move_dir: {
    id: 'move_dir', category: 'mouvement', icon: '🕹️',
    label: 'tant que {key} appuyée, déplacer {a} vers {direction} à {v} px/s',
    fields: {
      a: { type: 'varRef', default: 'joueur' },
      key: { type: 'key', default: 'ArrowUp' },
      direction: { type: 'select', default: 'haut', options: MOVE_DIRS },
      v: { type: 'text', default: '300' }
    },
    gen: (f) => {
      const v = `(${f.v})`;
      switch (f.direction) {
        case 'droite': return `if (keys.${f.key}) ${f.a}.x += ${v} * dt;`;
        case 'gauche': return `if (keys.${f.key}) ${f.a}.x -= ${v} * dt;`;
        case 'haut': return `if (keys.${f.key}) ${f.a}.y -= ${v} * dt;`;
        case 'bas': return `if (keys.${f.key}) ${f.a}.y += ${v} * dt;`;
        default: return '';
      }
    }
  },
  keep_screen: {
    id: 'keep_screen', category: 'mouvement', icon: '📐',
    label: 'garder {a} dans l\'écran',
    fields: { a: { type: 'varRef', default: 'joueur' } },
    gen: (f) => `${f.a}.x = clamp(${f.a}.x, 0, canvas.width - (${f.a}.w || 0));\n${f.a}.y = clamp(${f.a}.y, 0, canvas.height - (${f.a}.h || 0));`
  },
  set_position: {
    id: 'set_position', category: 'mouvement', icon: '📍',
    label: 'placer {a} à x {x} y {y}',
    fields: { a: { type: 'varRef', default: 'joueur' }, x: { type: 'text', default: '400' }, y: { type: 'text', default: '300' } },
    gen: (f) => `${f.a}.x = ${f.x};\n${f.a}.y = ${f.y};`
  },
  move_by: {
    id: 'move_by', category: 'mouvement', icon: '🕹️',
    label: 'déplacer {a} de dx {dx} dy {dy}',
    fields: { a: { type: 'varRef', default: 'joueur' }, dx: { type: 'text', default: '0' }, dy: { type: 'text', default: '0' } },
    gen: (f) => `${f.a}.x += ${f.dx};\n${f.a}.y += ${f.dy};`
  },
  move_toward: {
    id: 'move_toward', category: 'mouvement', icon: '🧲',
    label: 'déplacer {a} vers {b} à {v} px/s',
    fields: { a: { type: 'varRef', default: 'fantome' }, b: { type: 'varRef', default: 'joueur' }, v: { type: 'text', default: '110' } },
    gen: (f) => `{\n  const __dx = (${f.b}.x + ${f.b}.w / 2) - (${f.a}.x + ${f.a}.w / 2);\n  const __dy = (${f.b}.y + ${f.b}.h / 2) - (${f.a}.y + ${f.a}.h / 2);\n  const __dist = Math.hypot(__dx, __dy) || 1;\n  ${f.a}.x += (__dx / __dist) * ${f.v} * dt;\n  ${f.a}.y += (__dy / __dist) * ${f.v} * dt;\n}`
  },
  move_toward_mouse: {
    id: 'move_toward_mouse', category: 'mouvement', icon: '🖱️',
    label: 'déplacer {a} vers la souris à {v} px/s',
    fields: { a: { type: 'varRef', default: 'joueur' }, v: { type: 'text', default: '200' } },
    gen: (f) => `{\n  const __dx = mouse.x - (${f.a}.x + ${f.a}.w / 2);\n  const __dy = mouse.y - (${f.a}.y + ${f.a}.h / 2);\n  const __dist = Math.hypot(__dx, __dy) || 1;\n  ${f.a}.x += (__dx / __dist) * ${f.v} * dt;\n  ${f.a}.y += (__dy / __dist) * ${f.v} * dt;\n}`
  },
  apply_velocity: {
    id: 'apply_velocity', category: 'mouvement', icon: '🚀',
    label: 'faire avancer {a}',
    fields: { a: { type: 'varRef', default: 'balle' } },
    gen: (f) => `${f.a}.x += (${f.a}.vx || 0) * dt;\n${f.a}.y += (${f.a}.vy || 0) * dt;`
  },
  launch: {
    id: 'launch', category: 'mouvement', icon: '🎯',
    label: 'lancer {a} {direction} à {v} px/s',
    fields: { a: { type: 'varRef', default: 'balle' }, direction: { type: 'select', default: 'droite', options: DIRECTIONS }, v: { type: 'text', default: '250' } },
    gen: (f) => {
      const v = `(${f.v})`;
      switch (f.direction) {
        case 'droite': return `${f.a}.vx = ${v};\n${f.a}.vy = 0;`;
        case 'gauche': return `${f.a}.vx = -${v};\n${f.a}.vy = 0;`;
        case 'haut': return `${f.a}.vx = 0;\n${f.a}.vy = -${v};`;
        case 'bas': return `${f.a}.vx = 0;\n${f.a}.vy = ${v};`;
        case 'haut_aleatoire': return `${f.a}.vy = -${v};\n${f.a}.vx = rand(-1, 1) * ${v} * 0.5;`;
        default: return `const __angle = rand(0, Math.PI * 2);\n${f.a}.vx = Math.cos(__angle) * ${v};\n${f.a}.vy = Math.sin(__angle) * ${v};`;
      }
    }
  },
  set_velocity: {
    id: 'set_velocity', category: 'mouvement', icon: '🚀',
    label: 'donner à {a} une vitesse x {dx} y {dy}',
    fields: {
      a: { type: 'varRef', default: 'balle' },
      dx: { type: 'text', default: '0' },
      dy: { type: 'text', default: '-300' }
    },
    gen: (f) => `${f.a}.vx = ${f.dx};\n${f.a}.vy = ${f.dy};`
  },
  wrap: {
    id: 'wrap', category: 'mouvement', icon: '🔁',
    label: 'réapparaître {a} de l\'autre côté de l\'écran',
    fields: { a: { type: 'varRef', default: 'vaisseau' } },
    gen: (f) => `if (${f.a}.x + (${f.a}.w || 0) < 0) ${f.a}.x = canvas.width;\nif (${f.a}.x > canvas.width) ${f.a}.x = -(${f.a}.w || 0);\nif (${f.a}.y + (${f.a}.h || 0) < 0) ${f.a}.y = canvas.height;\nif (${f.a}.y > canvas.height) ${f.a}.y = -(${f.a}.h || 0);`
  },
  bounce_edges: {
    id: 'bounce_edges', category: 'mouvement', icon: '↕️',
    label: 'rebondir {a} sur les bords',
    fields: { a: { type: 'varRef', default: 'balle' } },
    gen: (f) => `if (${f.a}.x <= 0 || ${f.a}.x + (${f.a}.w || 0) >= canvas.width) ${f.a}.vx *= -1;\nif (${f.a}.y <= 0 || ${f.a}.y + (${f.a}.h || 0) >= canvas.height) ${f.a}.vy *= -1;`
  },
  bounce_against: {
    id: 'bounce_against', category: 'mouvement', icon: '🏓',
    label: 'faire rebondir {a} contre {b}',
    fields: { a: { type: 'varRef', default: 'balle' }, b: { type: 'varRef', default: 'raquette' } },
    gen: (f) => `const __delta = ${f.a}.x + ${f.a}.w / 2 - (${f.b}.x + ${f.b}.w / 2);\n${f.a}.vy = -Math.abs(${f.a}.vy);\nif (__delta < 0) ${f.a}.vx = -Math.abs(${f.a}.vx); else ${f.a}.vx = Math.abs(${f.a}.vx);`
  },
  set_bg: {
    id: 'set_bg', category: 'objet', icon: '🎨',
    label: 'changer le fond en {couleur}',
    fields: { couleur: { type: 'color', default: '#1a1a2e' } },
    gen: (f) => `__fond = ${JSON.stringify(f.couleur)};`
  },
  show_text: {
    id: 'show_text', category: 'objet', icon: '💬',
    label: 'afficher {a} : « {texte} »',
    fields: { a: { type: 'varRef', default: 'texte_info' }, texte: { type: 'text', default: 'Bravo !' } },
    gen: (f) => `${f.a}.texte = ${JSON.stringify(f.texte)};\n${f.a}.visible = true;`
  },
  hide_text: {
    id: 'hide_text', category: 'objet', icon: '🙈',
    label: 'masquer {a}',
    fields: { a: { type: 'varRef', default: 'texte_info' } },
    gen: (f) => `${f.a}.visible = false;`
  },
  set_var: {
    id: 'set_var', category: 'variables', icon: '✍️',
    label: 'mettre {cible} à {valeur}',
    fields: { cible: { type: 'varRef', default: 'score' }, valeur: { type: 'text', default: '0' } },
    gen: (f) => `${f.cible} = ${f.valeur};`
  },
  change_var: {
    id: 'change_var', category: 'variables', icon: '➕',
    label: 'ajouter {valeur} à {cible}',
    fields: { cible: { type: 'varRef', default: 'score' }, valeur: { type: 'text', default: '1' } },
    gen: (f) => `${f.cible} += ${f.valeur};`
  },
  toggle_var: {
    id: 'toggle_var', category: 'variables', icon: '🔁',
    label: 'inverser {cible} (vrai / faux)',
    fields: { cible: { type: 'varRef', default: 'touche' } },
    gen: (f) => `${f.cible} = !${f.cible};`
  },
  spawn: {
    id: 'spawn', category: 'listes', icon: '✨',
    label: 'créer {n} pièces dans {liste}',
    fields: { n: { type: 'number', default: 5 }, liste: { type: 'listRef', default: 'pieces' } },
    gen: (f, lib) => {
      const meta = lib.listMeta(f.liste);
      const t = (meta && meta.taille) || 14;
      return `for (let i = 0; i < ${Number(f.n) || 0}; i++) {\n  ${f.liste}.push({ x: rand(40, canvas.width - 40), y: rand(40, canvas.height - 40), w: ${t}, h: ${t}, vx: 0, vy: 0, collected: false });\n}`
    }
  },
  spawn_at: {
    id: 'spawn_at', category: 'listes', icon: '📍',
    label: 'créer une pièce à x {x} y {y} dans {liste}',
    fields: {
      x: { type: 'text', default: 'joueur.x' },
      y: { type: 'text', default: 'joueur.y' },
      liste: { type: 'listRef', default: 'pieces' }
    },
    gen: (f, lib) => {
      const meta = lib.listMeta(f.liste);
      const t = (meta && meta.taille) || 14;
      return `${f.liste}.push({ x: ${f.x}, y: ${f.y}, w: ${t}, h: ${t}, vx: 0, vy: 0, collected: false });`
    }
  },
  spawn_grid: {
    id: 'spawn_grid', category: 'listes', icon: '🔲',
    label: 'créer une grille de {lignes}×{colonnes} dans {liste}',
    fields: {
      liste: { type: 'listRef', default: 'briques' },
      lignes: { type: 'number', default: 5 },
      colonnes: { type: 'number', default: 10 },
      x: { type: 'text', default: '12' },
      y: { type: 'text', default: '30' },
      w: { type: 'number', default: 80 },
      h: { type: 'number', default: 26 }
    },
    gen: (f, lib) => {
      const meta = lib.listMeta(f.liste);
      const t = (meta && meta.taille) || 14;
      const w = Number(f.w) || t;
      const h = Number(f.h) || t;
      const n = `${f.liste}`;
      return `{
  let __gx = ${f.x}, __gy = ${f.y};
  for (let __r = 0; __r < ${Number(f.lignes) || 0}; __r++) {
    for (let __c = 0; __c < ${Number(f.colonnes) || 0}; __c++) {
      ${n}.push({ x: __gx, y: __gy, w: ${w}, h: ${h}, vx: 0, vy: 0, collected: false });
      __gx += ${w} + 8;
    }
    __gx = ${f.x};
    __gy += ${h} + 8;
  }
}`
    }
  },
  remove_flagged: {
    id: 'remove_flagged', category: 'listes', icon: '🧹',
    label: 'retirer de {liste} les pièces touchées',
    fields: { liste: { type: 'listRef', default: 'pieces' } },
    gen: (f) => `${f.liste} = ${f.liste}.filter((it) => !it.collected);`
  },
  play_sound: {
    id: 'play_sound', category: 'son', icon: '🔊',
    label: 'jouer le son {nom}',
    fields: { nom: { type: 'select', default: 'piece', options: ARCADE_SOUNDS.map((s) => ({ value: s.id, label: s.label })) } },
    gen: (f) => `audio(${JSON.stringify(f.nom)});`
  },
  reset_game: {
    id: 'reset_game', category: 'son', icon: '🔁',
    label: 'recommencer la partie',
    fields: {},
    gen: () => 'init();'
  }
};

// ── Helpers ──
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

export function createCondition(defId) {
  const def = CONDITION_DEFS[defId];
  if (!def) throw new Error('Condition inconnue : ' + defId);
  return { uid: genUid(), defId, fields: seedFields(def), not: false };
}

export function createAction(defId) {
  const def = ACTION_DEFS[defId];
  if (!def) throw new Error('Action inconnue : ' + defId);
  return { uid: genUid(), defId, fields: seedFields(def) };
}

export function createEvent(type = 'standard') {
  const base = { uid: genUid(), type, subevents: [] };
  if (type === 'foreach') base.item = 'objet'; 
  if (type === 'foreach') base.liste = 'pieces';
  if (type === 'repeat') base.n = 3;
  if (type === 'standard') { base.conditions = []; base.actions = []; }
  return base;
}
