import { ARCADE_AUDIO_SOURCE } from './arcade-sounds';

export function generateStandaloneHTML(code, sprites) {
  const spriteData = {};
  for (const [name, canvas] of Object.entries(sprites)) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const pixels = [];
    for (let y = 0; y < h; y++) {
      const row = [];
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2], a = imgData.data[i + 3];
        if (a > 128) {
          row.push('#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join(''));
        } else {
          row.push(null);
        }
      }
      pixels.push(row);
    }
    spriteData[name] = { width: w, height: h, pixels };
  }

  const spriteInitCode = Object.entries(spriteData).map(([name, data]) => {
    return `  var c${name} = document.createElement('canvas');
  c${name}.width = ${data.width};
  c${name}.height = ${data.height};
  var ctx${name} = c${name}.getContext('2d');
  var px${name} = ${JSON.stringify(data.pixels)};
  for (var y = 0; y < ${data.height}; y++) {
    for (var x = 0; x < ${data.width}; x++) {
      if (px${name}[y][x]) {
        ctx${name}.fillStyle = px${name}[y][x];
        ctx${name}.fillRect(x, y, 1, 1);
      }
    }
  }
  sprites['${name}'] = c${name};`;
  }).join('\n\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>DraftBox Game</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/createjs/1.0.1/createjs.min.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { overflow: hidden; height: 100%; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
  body { background: #0a0a1a; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: monospace; touch-action: none; }
  #gameCanvas { display: block; image-rendering: pixelated; image-rendering: crisp-edges; max-width: 100vw; max-height: 100vh; width: auto; height: auto; touch-action: none; }

  #touchControls { position: fixed; inset: 0; pointer-events: none; display: none; z-index: 10; font-family: monospace; }
  #touchControls.active { display: block; }

  .tc-btn { pointer-events: auto; background: rgba(255,255,255,0.12); border: 2px solid rgba(255,255,255,0.4); border-radius: 10px; color: #fff; font-size: 18px; display: flex; align-items: center; justify-content: center; -webkit-user-select: none; user-select: none; touch-action: none; }
  .tc-btn.pressed { background: rgba(255,255,255,0.4); }

  .tc-dpad { position: absolute; left: max(16px, env(safe-area-inset-left)); bottom: max(16px, env(safe-area-inset-bottom)); width: 168px; height: 168px; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 4px; }
  .tc-dpad .tc-up { grid-column: 2; grid-row: 1; }
  .tc-dpad .tc-left { grid-column: 1; grid-row: 2; }
  .tc-dpad .tc-right { grid-column: 3; grid-row: 2; }
  .tc-dpad .tc-down { grid-column: 2; grid-row: 3; }

  .tc-action-cluster { position: absolute; right: max(16px, env(safe-area-inset-right)); bottom: max(16px, env(safe-area-inset-bottom)); pointer-events: none; display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .tc-fire { pointer-events: auto; width: 92px; height: 92px; border-radius: 50%; background: rgba(233,69,96,0.35); border: 2px solid rgba(233,69,96,0.85); color: #fff; font-size: 14px; font-weight: bold; letter-spacing: 1px; }
  .tc-fire.pressed { background: rgba(233,69,96,0.7); }
  .tc-kb-toggle { pointer-events: auto; width: 46px; height: 46px; border-radius: 10px; font-size: 22px; }

  #virtualKeyboard { position: absolute; left: 50%; bottom: max(210px, calc(env(safe-area-inset-bottom) + 210px)); transform: translateX(-50%); pointer-events: auto; display: none; flex-direction: column; gap: 6px; background: rgba(10,10,26,0.9); padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.25); }
  #virtualKeyboard.open { display: flex; }
  #virtualKeyboard .vk-row { display: flex; gap: 6px; }
  #virtualKeyboard .tc-btn { width: 40px; height: 38px; font-size: 13px; }
  #virtualKeyboard .tc-btn.vk-wide { width: 90px; }
</style>
</head>
<body>
<canvas id="gameCanvas" width="960" height="540"></canvas>

<div id="touchControls">
  <div class="tc-dpad">
    <button class="tc-btn tc-up" data-code="ArrowUp">▲</button>
    <button class="tc-btn tc-left" data-code="ArrowLeft">◀</button>
    <button class="tc-btn tc-right" data-code="ArrowRight">▶</button>
    <button class="tc-btn tc-down" data-code="ArrowDown">▼</button>
  </div>
  <div class="tc-action-cluster">
    <button class="tc-kb-toggle tc-btn" id="tcKbToggle" title="Virtual keyboard">⌨</button>
    <button class="tc-fire tc-btn" id="tcFire">TIR</button>
  </div>
  <div id="virtualKeyboard">
    <div class="vk-row">
      <button class="tc-btn" data-code="ArrowUp">↑</button>
      <button class="tc-btn" data-code="ArrowLeft">←</button>
      <button class="tc-btn" data-code="ArrowDown">↓</button>
      <button class="tc-btn" data-code="ArrowRight">→</button>
      <button class="tc-btn" data-code="KeyW">W</button>
      <button class="tc-btn" data-code="KeyA">A</button>
      <button class="tc-btn" data-code="KeyS">S</button>
      <button class="tc-btn" data-code="KeyD">D</button>
    </div>
    <div class="vk-row">
      <button class="tc-btn vk-wide" data-code="Space">SPACE</button>
      <button class="tc-btn vk-wide" data-code="Enter">ENTER</button>
    </div>
  </div>
</div>

<script>
(function() {
  var canvas = document.getElementById('gameCanvas');
  var ctx = canvas.getContext('2d');
  var keys = {};
  var mouse = { x: 0, y: 0, left: false };
  var sprites = {};

${spriteInitCode}

  document.addEventListener('keydown', function(e) { keys[e.code] = true; });
  document.addEventListener('keyup', function(e) { keys[e.code] = false; });

  (function setupTouchControls() {
    var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    var controls = document.getElementById('touchControls');
    if (!isTouch) return;
    controls.classList.add('active');

    function bindKeyButton(el) {
      var code = el.dataset.code;
      function press(e) { e.preventDefault(); keys[code] = true; el.classList.add('pressed'); }
      function release(e) { keys[code] = false; el.classList.remove('pressed'); }
      el.addEventListener('pointerdown', press);
      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', release);
      el.addEventListener('pointerleave', release);
      el.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    }
    Array.prototype.forEach.call(controls.querySelectorAll('.tc-btn[data-code]'), bindKeyButton);

    var fireBtn = document.getElementById('tcFire');
    function firePress(e) { e.preventDefault(); keys['Space'] = true; mouse.left = true; fireBtn.classList.add('pressed'); }
    function fireRelease(e) { keys['Space'] = false; mouse.left = false; fireBtn.classList.remove('pressed'); }
    fireBtn.addEventListener('pointerdown', firePress);
    fireBtn.addEventListener('pointerup', fireRelease);
    fireBtn.addEventListener('pointercancel', fireRelease);
    fireBtn.addEventListener('pointerleave', fireRelease);

    var vkToggle = document.getElementById('tcKbToggle');
    var vkPanel = document.getElementById('virtualKeyboard');
    vkToggle.addEventListener('click', function(e) {
      e.preventDefault();
      vkPanel.classList.toggle('open');
    });
  })();
  canvas.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    mouse.x = (e.clientX - rect.left) * scaleX;
    mouse.y = (e.clientY - rect.top) * scaleY;
  });
  canvas.addEventListener('mousedown', function() { mouse.left = true; });
  canvas.addEventListener('mouseup', function() { mouse.left = false; });
  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var t = e.touches[0];
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    mouse.x = (t.clientX - rect.left) * scaleX;
    mouse.y = (t.clientY - rect.top) * scaleY;
    mouse.left = true;
  }, { passive: false });
  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    var t = e.touches[0];
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    mouse.x = (t.clientX - rect.left) * scaleX;
    mouse.y = (t.clientY - rect.top) * scaleY;
  }, { passive: false });
  canvas.addEventListener('touchend', function() { mouse.left = false; });
  canvas.addEventListener('touchcancel', function() { mouse.left = false; });

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
  function rectCollide(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  var playArcadeSound = ${ARCADE_AUDIO_SOURCE};
  function audio(name) {
    try {
      if (playArcadeSound(name)) return;
      new Audio(name).play().catch(function() {});
    } catch (e) {}
  }

  var gameCode = ${JSON.stringify(code)};

  try {
    var gameFn = new Function(
      'createjs', 'canvas', 'ctx', 'keys', 'mouse', 'sprites', 'rand', 'clamp', 'rectCollide', 'audio',
      gameCode + '\\n' +
      'return { init: typeof init !== "undefined" ? init : function(){}, ' +
      'update: typeof update !== "undefined" ? update : function(dt){}, ' +
      'draw: typeof draw !== "undefined" ? draw : function(ctx){} };'
    );
    var game = gameFn(window.createjs, canvas, ctx, keys, mouse, sprites, rand, clamp, rectCollide, audio);

    if (typeof game.init === 'function') game.init();

    var running = true;
    var lastTime = performance.now();

    function gameLoop(now) {
      if (!running) return;
      var dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      try { game.update(dt); } catch(e) { running = false; throw e; }
      ctx.fillStyle = '#0f0f23';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      try { game.draw(ctx); } catch(e) { running = false; throw e; }
      requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
  } catch(e) {
    ctx.fillStyle = '#e94560';
    ctx.font = '16px monospace';
    ctx.fillText('Error: ' + e.message, 16, 32);
  }
})();
</script>
</body>
</html>`;

  return html;
}
