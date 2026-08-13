// Utilitaires pour manipuler la feuille d'événements (liste d'événements
// potentiellement imbriqués). Un événement a la forme :
//   { uid, type: 'standard'|'foreach'|'repeat', conditions: [...], actions: [...], subevents: [...] }

// Applique `updater` à l'événement dont l'uid correspond, où qu'il soit.
// Retourne une nouvelle liste (immutable) ; identité préservée si rien ne change.
export function mapEvent(list, uid, updater) {
  return list.map((ev) => {
    if (ev.uid === uid) return updater(ev);
    if (ev.subevents && ev.subevents.length) {
      const next = mapEvent(ev.subevents, uid, updater);
      return next === ev.subevents ? ev : { ...ev, subevents: next };
    }
    return ev;
  });
}

// Déplace un événement d'une position (-1 haut, +1 bas) dans sa propre liste.
export function moveEvent(list, uid, dir) {
  const idx = list.findIndex((ev) => ev.uid === uid);
  if (idx !== -1) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= list.length) return list;
    const copy = [...list];
    const [item] = copy.splice(idx, 1);
    copy.splice(newIdx, 0, item);
    return copy;
  }
  return list.map((ev) => {
    if (!ev.subevents || !ev.subevents.length) return ev;
    const next = moveEvent(ev.subevents, uid, dir);
    return next === ev.subevents ? ev : { ...ev, subevents: next };
  });
}

// Supprime l'événement dont l'uid correspond.
export function removeEvent(list, uid) {
  const next = list.filter((ev) => ev.uid !== uid);
  if (next.length !== list.length) return next;
  return list.map((ev) => {
    if (!ev.subevents || !ev.subevents.length) return ev;
    const sub = removeEvent(ev.subevents, uid);
    return sub === ev.subevents ? ev : { ...ev, subevents: sub };
  });
}

// Déplace une instruction (condition/action) dans un événement donné.
// kind = 'conditions' | 'actions'
export function moveInstruction(list, eventUid, kind, instUid, dir) {
  return mapEvent(list, eventUid, (ev) => {
    if (!ev[kind]) return ev;
    const idx = ev[kind].findIndex((c) => c.uid === instUid);
    if (idx === -1) return ev;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= ev[kind].length) return ev;
    const copy = [...ev[kind]];
    const [item] = copy.splice(idx, 1);
    copy.splice(newIdx, 0, item);
    return { ...ev, [kind]: copy };
  });
}
