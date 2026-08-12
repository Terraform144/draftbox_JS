// Utilitaires génériques pour manipuler l'arbre de blocs (façon Scratch).
// Un bloc a la forme : { uid, defId, fields: {...}, slots?: { nomSlot: [bloc, ...] } }
// `slots` n'existe que pour les blocs "conteneurs" (Si, Répéter, Pour chaque...).

let uidCounter = 0;
export function genUid() {
  uidCounter += 1;
  return 'blk_' + Date.now().toString(36) + '_' + uidCounter.toString(36);
}

// Met à jour le bloc dont l'uid correspond, où qu'il soit dans l'arbre (récursif).
export function updateBlock(list, uid, updater) {
  return list.map((b) => {
    if (b.uid === uid) return updater(b);
    if (b.slots) {
      let changed = false;
      const slots = {};
      for (const key of Object.keys(b.slots)) {
        const next = updateBlock(b.slots[key], uid, updater);
        slots[key] = next;
        if (next !== b.slots[key]) changed = true;
      }
      return changed ? { ...b, slots } : b;
    }
    return b;
  });
}

// Retire le bloc dont l'uid correspond. Retourne [nouvelleListe, blocRetiréOuNull].
export function removeBlock(list, uid) {
  let removed = null;
  const out = [];
  for (const b of list) {
    if (b.uid === uid) {
      removed = b;
      continue;
    }
    if (b.slots) {
      const slots = {};
      for (const key of Object.keys(b.slots)) {
        const [nl, r] = removeBlock(b.slots[key], uid);
        slots[key] = nl;
        if (r) removed = r;
      }
      out.push({ ...b, slots });
    } else {
      out.push(b);
    }
  }
  return [out, removed];
}

// Insère `newBlock` à la fin de la racine (containerUid = null) ou à la fin
// du slot `slot` du bloc dont l'uid est `containerUid`.
export function insertBlock(list, containerUid, slot, newBlock) {
  if (!containerUid) return [...list, newBlock];
  return list.map((b) => {
    if (b.uid === containerUid && b.slots) {
      const current = b.slots[slot] || [];
      return { ...b, slots: { ...b.slots, [slot]: [...current, newBlock] } };
    }
    if (b.slots) {
      const slots = {};
      for (const key of Object.keys(b.slots)) {
        slots[key] = insertBlock(b.slots[key], containerUid, slot, newBlock);
      }
      return { ...b, slots };
    }
    return b;
  });
}

// Déplace un bloc d'une position (-1 haut, +1 bas) au sein de sa propre liste.
export function moveBlock(list, uid, dir) {
  const idx = list.findIndex((b) => b.uid === uid);
  if (idx !== -1) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= list.length) return list;
    const copy = [...list];
    const [item] = copy.splice(idx, 1);
    copy.splice(newIdx, 0, item);
    return copy;
  }
  return list.map((b) => {
    if (!b.slots) return b;
    const slots = {};
    for (const key of Object.keys(b.slots)) {
      slots[key] = moveBlock(b.slots[key], uid, dir);
    }
    return { ...b, slots };
  });
}

// Vérifie qu'un uid de conteneur existe encore dans l'arbre (utile après suppression).
export function containerExists(list, uid) {
  for (const b of list) {
    if (b.uid === uid) return true;
    if (b.slots) {
      for (const key of Object.keys(b.slots)) {
        if (containerExists(b.slots[key], uid)) return true;
      }
    }
  }
  return false;
}
