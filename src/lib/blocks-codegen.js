// Transforme l'état de l'éditeur de Blocs (variables + scripts) en code JS
// exécutable par le scene-runner de DraftBox (mêmes fonctions init/update/draw).
import { BLOCK_DEFS, resolveFields } from './blocks-defs';

function num(v, d) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function sanitizeName(name) {
  let n = String(name || '').trim().replace(/[^a-zA-Z0-9_$]/g, '_');
  if (!n) n = 'variable';
  if (/^[0-9]/.test(n)) n = '_' + n;
  return n;
}

export function variableDeclLine(v) {
  const name = sanitizeName(v.name);
  switch (v.kind) {
    case 'nombre':
      return `let ${name} = ${num(v.value, 0)};`;
    case 'texte':
      return `let ${name} = ${JSON.stringify(v.value || '')};`;
    case 'booleen':
      return `let ${name} = ${v.value ? 'true' : 'false'};`;
    case 'liste_vide':
      return `let ${name} = [];`;
    case 'objet_rect': {
      const o = v.value || {};
      return `let ${name} = { x: ${num(o.x, 0)}, y: ${num(o.y, 0)}, w: ${num(o.w, 32)}, h: ${num(o.h, 32)}, vitesse: ${num(o.vitesse, 200)} };`;
    }
    default:
      return `let ${name} = null;`;
  }
}

function indentLines(text, pad) {
  return text.split('\n').map((l) => (l.length ? pad + l : l)).join('\n');
}

function sanitizeNumberFields(def, f) {
  for (const [name, fieldDef] of Object.entries(def.fields || {})) {
    if (fieldDef.type === 'number' && (f[name] === '' || f[name] === null || Number.isNaN(Number(f[name])))) {
      f[name] = fieldDef.default;
    }
  }
  return f;
}

function compileBlock(block, level) {
  const def = BLOCK_DEFS[block.defId];
  if (!def) return '';
  const pad = '  '.repeat(level);
  const f = sanitizeNumberFields(def, resolveFields(def, block.fields));

  if (def.slots) {
    const slotTexts = {};
    for (const slotName of def.slots) {
      const children = (block.slots && block.slots[slotName]) || [];
      slotTexts[slotName] = children.length
        ? children.map((c) => compileBlock(c, level + 1)).join('\n')
        : `${pad}  // (vide)`;
    }
    return def.genWrap(f, slotTexts, pad);
  }

  return indentLines(def.gen(f), pad);
}

function compileList(list, level) {
  if (!list || list.length === 0) return '  // (vide)';
  return list.map((b) => compileBlock(b, level)).join('\n');
}

export function generateCode({ variables, scripts }) {
  const varLines = (variables || []).map(variableDeclLine).join('\n');
  const initBody = compileList(scripts.init, 1);
  const updateBody = compileList(scripts.update, 1);
  const drawBody = compileList(scripts.draw, 1);

  return `// Jeu créé avec l'éditeur de Blocs de DraftBox
${varLines}

function init() {
${initBody}
}

function update(dt) {
${updateBody}
}

function draw(ctx) {
${drawBody}
}
`;
}
