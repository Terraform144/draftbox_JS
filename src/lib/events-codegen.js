// Conversion de la feuille d'événements (objets + variables + événements)
// en code JavaScript exécutable par le scene-runner de DraftBox.
// Garantie « mapping parfait » : chaque condition/action correspond à une
// ligne de code exacte, visible en direct dans l'aperçu.
import { CONDITION_DEFS, ACTION_DEFS, resolveFields } from './events-defs';

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

// ── Déclarations des objets & variables ──
function objectDecl(o) {
  if (o.kind === 'texte') {
    return `let ${o.name} = null;`;
  }
  return `let ${o.name} = null;`;
}

function variableDecl(v) {
  switch (v.kind) {
    case 'nombre': return `let ${v.name} = ${Number(v.value) || 0};`;
    case 'texte': return `let ${v.name} = ${JSON.stringify(v.value || '')};`;
    case 'booleen': return `let ${v.name} = ${v.value ? 'true' : 'false'};`;
    case 'liste': return `let ${v.name} = [];`;
    default: return `let ${v.name} = null;`;
  }
}

function objectResetLine(o) {
  if (o.kind === 'texte') {
    return `${o.name} = { x: ${Number(o.x) || 0}, y: ${Number(o.y) || 0}, texte: ${JSON.stringify(o.texte || '')}, prefixe: ${JSON.stringify(o.prefixe || '')}, variable: ${o.variable ? JSON.stringify(o.variable) : 'null'}, taille: ${Number(o.taille) || 16}, couleur: ${JSON.stringify(o.couleur || '#ffffff')}, visible: ${o.visible !== false} };`;
  }
  return `${o.name} = { x: ${Number(o.x) || 0}, y: ${Number(o.y) || 0}, w: ${Number(o.w) || 32}, h: ${Number(o.h) || 32}, vitesse: ${Number(o.vitesse) || 200}, couleur: ${JSON.stringify(o.couleur || '#e94560')}, sprite: ${o.sprite ? JSON.stringify(o.sprite) : 'null'}, vx: 0, vy: 0, visible: ${o.visible !== false} };`;
}

function variableResetLine(v) {
  switch (v.kind) {
    case 'nombre': return `${v.name} = ${Number(v.value) || 0};`;
    case 'texte': return `${v.name} = ${JSON.stringify(v.value || '')};`;
    case 'booleen': return `${v.name} = ${v.value ? 'true' : 'false'};`;
    case 'liste': return `${v.name} = [];`;
    default: return `${v.name} = null;`;
  }
}

// ── Conditions & actions ──
function compileCondition(c) {
  const def = CONDITION_DEFS[c.defId];
  if (!def) return '';
  const f = sanitizeNumberFields(def, resolveFields(def, c.fields));
  const expr = def.gen(f);
  return c.not ? `!(${expr})` : expr;
}

function compileAction(a, lib) {
  const def = ACTION_DEFS[a.defId];
  if (!def) return '';
  const f = sanitizeNumberFields(def, resolveFields(def, a.fields));
  return def.gen(f, lib);
}

// ── Compilation d'un événement (récursif) ──
function compileEvent(ev, level, lib) {
  const pad = '  '.repeat(level);

  if (ev.type === 'foreach') {
    const body = (ev.subevents || []).map((se) => compileEvent(se, level + 1, lib)).filter(Boolean).join('\n');
    return `${pad}for (const ${ev.item || 'objet'} of ${ev.liste || 'pieces'}) {\n${body || `${pad}  // (vide)`}\n${pad}}`;
  }

  if (ev.type === 'repeat') {
    const body = (ev.subevents || []).map((se) => compileEvent(se, level + 1, lib)).filter(Boolean).join('\n');
    return `${pad}for (let __i = 0; __i < ${Number(ev.n) || 0}; __i++) {\n${body || `${pad}  // (vide)`}\n${pad}}`;
  }

  const conds = (ev.conditions || []).map(compileCondition).filter(Boolean);
  const actions = (ev.actions || []).map((a) => compileAction(a, lib)).filter(Boolean);
  const subevents = (ev.subevents || []).map((se) => compileEvent(se, level + 1, lib)).filter(Boolean);

  const body = [...actions, ...subevents].join('\n');
  if (!body) return '';

  if (!conds.length) {
    // Aucune condition → l'événement s'exécute à chaque image (comme GDevelop)
    return indentLines(body, pad);
  }

  return `${pad}if (${conds.join(' && ')}) {\n${indentLines(body, pad + '  ')}\n${pad}}`;
}

// ── Dessin ──
function listDrawLine(v) {
  const name = v.name;
  const couleur = v.couleur || '#ffd700';
  const forme = v.forme || 'cercle';
  const t = Number(v.taille) || 8;
  if (forme === 'carre') {
    return `  for (const item of ${name}) {\n    if (item.collected) continue;\n    ctx.fillStyle = ${JSON.stringify(couleur)};\n    ctx.fillRect(item.x, item.y, item.w, item.h);\n  }`;
  }
  return `  for (const item of ${name}) {\n    if (item.collected) continue;\n    ctx.fillStyle = ${JSON.stringify(couleur)};\n    ctx.beginPath();\n    ctx.arc(item.x + item.w / 2, item.y + item.h / 2, ${t}, 0, Math.PI * 2);\n    ctx.fill();\n  }`;
}

function objectDrawLine(o) {
  return `  __drawObjet(ctx, ${o.name});`;
}

function textDrawLine(o) {
  const varName = o.variable ? `, ${o.variable}` : ', null';
  return `  __drawTexte(ctx, ${o.name}${varName});`;
}

// ── Point d'entrée principal ──
export function generateCode({ objects = [], variables = [], events = [], bg = '#1a1a2e' }) {
  const names = new Set();
  objects.forEach((o) => names.add(o.name));
  variables.forEach((v) => names.add(v.name));

  const lib = {
    listMeta(name) {
      const v = variables.find((x) => x.name === name);
      if (v && v.kind === 'liste') return { couleur: v.couleur, forme: v.forme, taille: v.taille };
      return null;
    }
  };

  const decls = [
    ...objects.map(objectDecl),
    ...variables.map(variableDecl)
  ].join('\n');

  const resets = [
    ...objects.map(objectResetLine),
    ...variables.map(variableResetLine)
  ].join('\n');

  const startEvents = events.filter((ev) => (ev.conditions || []).some((c) => c.defId === 'start'));
  const otherEvents = events.filter((ev) => !startEvents.includes(ev));

  const startBody = startEvents
    .map((ev) => {
      const remaining = (ev.conditions || []).filter((c) => c.defId !== 'start');
      const ev2 = { ...ev, conditions: remaining };
      const code = compileEvent(ev2, 0, lib);
      return code;
    })
    .filter(Boolean)
    .join('\n\n');

  const updateBody = otherEvents.map((ev) => compileEvent(ev, 0, lib)).filter(Boolean).join('\n\n');

  const hasStart = startBody.length > 0;

  const drawLines = [];
  variables.filter((v) => v.kind === 'liste').forEach((v) => drawLines.push(listDrawLine(v)));
  objects.filter((o) => o.kind !== 'texte').forEach((o) => drawLines.push(objectDrawLine(o)));
  objects.filter((o) => o.kind === 'texte').forEach((o) => drawLines.push(textDrawLine(o)));

  return `// 🎮 Jeu créé avec l'éditeur d'événements DraftBox
// Chaque « Quand… → alors… » se transforme en code JavaScript.
// L'aperçu ci-contre est TOUJOURS à jour : tout ce que tu changes en
// blocs se retrouve ici, ligne pour ligne.

let __temps = 0;
let __fond = ${JSON.stringify(bg)};

// ── Objets & variables ──
${decls || '// (aucun)'}

function __reset() {
${indentLines(resets || '// (aucun)', '  ')}
}

function init() {
  __reset();
  __temps = 0;
  __started = false;
}

// ── Aides de dessin ──
function __drawObjet(ctx, o) {
  if (!o || o.visible === false) return;
  const img = o.sprite && sprites[o.sprite];
  if (img) {
    ctx.drawImage(img, o.x, o.y, o.w, o.h);
  } else {
    ctx.fillStyle = o.couleur;
    ctx.fillRect(o.x, o.y, o.w, o.h);
  }
}

function __drawTexte(ctx, t, valeur) {
  if (!t || t.visible === false) return;
  ctx.fillStyle = t.couleur;
  ctx.font = t.taille + 'px monospace';
  ctx.fillText(t.variable ? t.prefixe + (valeur) : t.texte, t.x, t.y);
}

let __started = false;
${hasStart ? `\nfunction __draftboxStart() {\n${indentLines(startBody, '  ')}\n}` : ''}

function update(dt) {
  __temps += dt;
${hasStart ? `  if (!__started) { __started = true; __draftboxStart(); }` : ''}
${updateBody ? '\n' + indentLines(updateBody, '  ') : '  // (aucun événement)'}
}

function draw(ctx) {
  ctx.fillStyle = __fond;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
${drawLines.join('\n') || '  // (rien à dessiner)'}
}`;
}
