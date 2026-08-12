// Bibliothèque de sons d'arcade classiques, synthétisés avec l'API Web Audio
// (aucun fichier audio à fournir). Utilisée par scene-runner.js (aperçu en
// direct) ET intégrée telle quelle (via ARCADE_AUDIO_SOURCE) dans le HTML
// autonome généré par export-html.js — d'où la fonction 100% autonome
// ci-dessous (pas de closure sur des variables de module).

export const ARCADE_SOUNDS = [
  { id: 'piece', label: '🪙 Pièce', desc: 'Un bref bling aigu — ramasser une pièce ou un objet.' },
  { id: 'saut', label: '🦘 Saut', desc: 'Une note qui monte vite — un saut.' },
  { id: 'tir', label: '🔫 Tir', desc: 'Une note qui descend vite — un tir laser.' },
  { id: 'explosion', label: '💥 Explosion', desc: 'Un bruit sourd et grave — une explosion.' },
  { id: 'degat', label: '💢 Dégât', desc: 'Un bruit sec et court — le joueur est touché.' },
  { id: 'bonus', label: '⭐ Bonus', desc: 'Quatre notes qui montent — un bonus ramassé.' },
  { id: 'victoire', label: '🏆 Victoire', desc: 'Une petite fanfare — le joueur gagne.' },
  { id: 'perdu', label: '💀 Game Over', desc: 'Des notes qui descendent — la partie est perdue.' },
  { id: 'clic', label: '🔘 Clic', desc: 'Un bip très court — un menu ou un bouton.' },
  { id: 'rebond', label: '🏓 Rebond', desc: 'Un bip qui varie — une balle qui rebondit (façon Pong).' }
];

function playArcadeSound(name) {
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  if (!playArcadeSound._ctx) playArcadeSound._ctx = new AC();
  var ctx = playArcadeSound._ctx;
  if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }

  function tone(freqStart, freqEnd, duration, type, volume, delay) {
    delay = delay || 0;
    volume = volume === undefined ? 0.25 : volume;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || 'square';
    var now = ctx.currentTime + delay;
    osc.frequency.setValueAtTime(Math.max(freqStart, 1), now);
    if (freqEnd !== undefined && freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + Math.min(0.015, duration * 0.3));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function noise(duration, volume, filterStart, filterEnd, delay) {
    delay = delay || 0;
    var size = Math.max(1, Math.floor(ctx.sampleRate * duration));
    var buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource();
    src.buffer = buffer;
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    var now = ctx.currentTime + delay;
    filter.frequency.setValueAtTime(filterStart, now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(filterEnd, 40), now + duration);
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(now);
    src.stop(now + duration + 0.02);
  }

  switch (name) {
    case 'piece':
      tone(988, undefined, 0.09, 'square', 0.22, 0);
      tone(1319, undefined, 0.14, 'square', 0.22, 0.07);
      return true;
    case 'saut':
      tone(220, 660, 0.16, 'square', 0.22, 0);
      return true;
    case 'tir':
      tone(1100, 180, 0.14, 'sawtooth', 0.18, 0);
      return true;
    case 'explosion':
      noise(0.45, 0.35, 1600, 60, 0);
      tone(120, 40, 0.35, 'triangle', 0.18, 0);
      return true;
    case 'degat':
      noise(0.14, 0.3, 900, 150, 0);
      return true;
    case 'bonus':
      tone(523, undefined, 0.09, 'square', 0.2, 0);
      tone(659, undefined, 0.09, 'square', 0.2, 0.08);
      tone(784, undefined, 0.09, 'square', 0.2, 0.16);
      tone(1046, undefined, 0.16, 'square', 0.22, 0.24);
      return true;
    case 'victoire':
      tone(523, undefined, 0.12, 'square', 0.2, 0);
      tone(659, undefined, 0.12, 'square', 0.2, 0.12);
      tone(784, undefined, 0.12, 'square', 0.2, 0.24);
      tone(1046, undefined, 0.4, 'square', 0.24, 0.36);
      return true;
    case 'perdu':
      tone(392, undefined, 0.18, 'sawtooth', 0.2, 0);
      tone(330, undefined, 0.18, 'sawtooth', 0.2, 0.16);
      tone(262, undefined, 0.18, 'sawtooth', 0.2, 0.32);
      tone(196, undefined, 0.35, 'sawtooth', 0.22, 0.48);
      return true;
    case 'clic':
      tone(880, undefined, 0.045, 'square', 0.15, 0);
      return true;
    case 'rebond':
      tone(440, 300, 0.07, 'square', 0.18, 0);
      return true;
    default:
      return false;
  }
}

export { playArcadeSound };

// Source de la fonction ci-dessus, à interpoler telle quelle dans le HTML
// autonome (export-html.js) pour que les jeux exportés aient les mêmes sons.
export const ARCADE_AUDIO_SOURCE = playArcadeSound.toString();
