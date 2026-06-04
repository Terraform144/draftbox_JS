const DocsContent = {
  sections: [],

  init() {
    this.sections = [
      { id: 'getting-started', title: 'Getting Started', content: this.gettingStarted },
      { id: 'game-loop', title: 'Game Loop', content: this.gameLoop },
      { id: 'canvas-basics', title: 'Canvas 2D Basics', content: this.canvasBasics },
      { id: 'sprites', title: 'Sprites & Images', content: this.sprites },
      { id: 'input', title: 'Input Handling', content: this.input },
      { id: 'collision', title: 'Collision Detection', content: this.collision },
      { id: 'physics', title: 'Simple Physics', content: this.physics },
      { id: 'audio', title: 'Audio & Sound', content: this.audio },
      { id: 'game-state', title: 'Game State', content: this.gameState },
      { id: 'tilemaps', title: 'Tilemaps', content: this.tilemaps },
      { id: 'animation', title: 'Animation', content: this.animation },
      { id: 'particles', title: 'Particles', content: this.particles },
      { id: 'math', title: 'Math Utilities', content: this.math },
      { id: 'patterns', title: 'Game Patterns', content: this.patterns },
      { id: 'api-ref', title: 'DraftBox API Reference', content: this.apiRef },
      { id: 'demos', title: '🎮 Retro Game Demos', content: this.demos },
    ];
    this.render();
    this.bindSearch();
  },

  render() {
    const nav = document.getElementById('docsNav');
    const content = document.getElementById('docsContent');
    const select = document.getElementById('docsNavSelect');

    nav.innerHTML = '';
    select.innerHTML = '';
    this.sections.forEach((sec, i) => {
      const label = sec.title.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const a = document.createElement('a');
      a.textContent = label;
      a.href = '#';
      a.dataset.section = sec.id;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        this.showSection(sec.id);
      });
      nav.appendChild(a);

      const opt = document.createElement('option');
      opt.value = sec.id;
      opt.textContent = label;
      select.appendChild(opt);
    });

    select.addEventListener('change', () => {
      this.showSection(select.value);
    });

    if (this.sections.length > 0) {
      this.showSection(this.sections[0].id);
    }
  },

  showSection(id) {
    const sec = this.sections.find(s => s.id === id);
    if (!sec) return;

    document.querySelectorAll('#docsNav a').forEach(a => a.classList.remove('active'));
    const navItem = document.querySelector(`#docsNav a[data-section="${id}"]`);
    if (navItem) navItem.classList.add('active');

    const select = document.getElementById('docsNavSelect');
    if (select) select.value = id;

    document.getElementById('docsContent').innerHTML = sec.content;
    document.getElementById('docsContent').scrollTop = 0;

    if (id === 'demos') this.bindDemoButtons();
  },

  bindDemoButtons() {
    document.querySelectorAll('.demo-play-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.demo);
        if (typeof App !== 'undefined' && App.loadAndRun) App.loadAndRun(i);
      });
    });
  },

  bindSearch() {
    const search = document.getElementById('docsSearch');
    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      document.querySelectorAll('#docsNav a').forEach(a => {
        const match = a.textContent.toLowerCase().includes(q);
        a.style.display = match ? 'block' : 'none';
      });
    });
  },

  get gettingStarted() { return `
<h1>Welcome to DraftBox</h1>
<p>DraftBox is a browser-based game creation tool. Design pixel art sprites, write JavaScript game code, and run your game directly in the browser — no setup required.</p>

<h2>How It Works</h2>
<ol>
  <li><strong>Pixel Editor</strong> — Draw pixel art sprites and save them with names.</li>
  <li><strong>Code Editor</strong> — Write game logic in JavaScript using the DraftBox API.</li>
  <li><strong>Scene</strong> — Run your game and see it come to life.</li>
  <li><strong>Docs</strong> — Reference documentation and examples (you are here).</li>
</ol>

<h2>Your First Game</h2>
<p>Start with the default template in the Code Editor. It creates a player character and collectible coins. Click <strong>Run</strong> to play.</p>

<div class="note">
  <strong>Tip:</strong> Press <strong>Ctrl+Enter</strong> (or Cmd+Enter) to quickly run your game from the Code Editor.
</div>

<h2>Keyboard Shortcuts</h2>
<ul>
  <li><strong>Ctrl+Enter</strong> — Run game</li>
  <li><strong>Ctrl+S</strong> — Save sprite in Pixel Editor</li>
  <li><strong>Arrow keys / WASD</strong> — Control player in the default template</li>
</ul>
`; },

  get gameLoop() { return `
<h1>Game Loop</h1>
<p>Every game needs a loop that runs continuously, updating logic and rendering frames. In DraftBox, you implement this with two functions:</p>

<h2>update(dt)</h2>
<p>Called every frame. The <code>dt</code> parameter is the <strong>delta time</strong> in seconds since the last frame. Use it to make movement frame-rate independent.</p>

<pre><code>let speed = 200; // pixels per second

function update(dt) {
  // Move 200 pixels every second, regardless of FPS
  player.x += speed * dt;
}</code></pre>

<h2>draw(ctx)</h2>
<p>Called every frame after <code>update()</code>. The <code>ctx</code> is the Canvas 2D rendering context. Clear the canvas each frame and draw everything.</p>

<pre><code>function draw(ctx) {
  // Clear the canvas
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = '#e94560';
  ctx.fillRect(player.x, player.y, 32, 32);
}</code></pre>

<h2>init()</h2>
<p>Called once when the game starts. Use it to set up initial state.</p>

<pre><code>let enemies = [];

function init() {
  for (let i = 0; i < 10; i++) {
    enemies.push({
      x: rand(0, 900), y: rand(0, 500),
      hp: 3
    });
  }
}</code></pre>

<div class="note">
  <strong>Important:</strong> The game loop runs at ~60 FPS using <code>requestAnimationFrame</code>. If your game is too fast, check that you're multiplying by <code>dt</code>.
</div>
`; },

  get canvasBasics() { return `
<h1>Canvas 2D Basics</h1>
<p>The <strong>Canvas 2D API</strong> is the primary way to draw graphics in the browser. The <code>draw(ctx)</code> function receives the 2D rendering context.</p>

<h2>Shapes</h2>

<pre><code>// Rectangle
ctx.fillStyle = 'red';
ctx.fillRect(x, y, width, height);
ctx.strokeRect(x, y, width, height); // outline only

// Circle (using arc)
ctx.beginPath();
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();

// Line
ctx.beginPath();
ctx.moveTo(x1, y1);
ctx.lineTo(x2, y2);
ctx.strokeStyle = 'white';
ctx.lineWidth = 2;
ctx.stroke();</code></pre>

<h2>Colors</h2>
<pre><code>// Named colors
ctx.fillStyle = 'red';
ctx.fillStyle = 'blue';

// Hex
ctx.fillStyle = '#e94560';

// RGBA (with transparency)
ctx.fillStyle = 'rgba(233, 69, 96, 0.5)';

// HSL
ctx.fillStyle = 'hsl(0, 80%, 60%)';</code></pre>

<h2>Text</h2>
<pre><code>ctx.fillStyle = 'white';
ctx.font = '24px monospace';
ctx.fillText('Hello, World!', x, y);

// Text alignment
ctx.textAlign = 'center'; // 'left', 'center', 'right'
ctx.textBaseline = 'middle'; // 'top', 'middle', 'bottom'

// Score display
ctx.font = 'bold 20px monospace';
ctx.fillStyle = '#ffd700';
ctx.fillText('Score: ' + score, 16, 32);</code></pre>

<h2>Transforms</h2>
<pre><code>// Save/restore state
ctx.save();
ctx.translate(x, y);
ctx.rotate(angle);
ctx.scale(1, -1); // flip vertically
// ... draw ...
ctx.restore();</code></pre>

<h2>Clear Canvas</h2>
<pre><code>ctx.fillStyle = '#0f0f23';
ctx.fillRect(0, 0, canvas.width, canvas.height);</code></pre>
`; },

  get sprites() { return `
<h1>Sprites & Images</h1>
<p>Sprites are pixel art images you create in the Pixel Editor. They are available in your game code through the <code>sprites</code> object.</p>

<h2>Using Sprites</h2>
<p>Each sprite you save in the Pixel Editor becomes a <strong>canvas element</strong> accessible by name.</p>

<pre><code>// Draw sprite at original size
ctx.drawImage(sprites.player, x, y);

// Draw sprite scaled
ctx.drawImage(sprites.player, x, y, width, height);

// Draw sprite flipped
ctx.save();
ctx.scale(-1, 1);
ctx.drawImage(sprites.player, -x - width, y, width, height);
ctx.restore();</code></pre>

<h2>Creating Sprites</h2>
<ol>
  <li>Go to the <strong>Pixel Editor</strong> tab.</li>
  <li>Draw your pixel art using the brush tools.</li>
  <li>Type a name in the sprite name field (e.g., <code>player</code>).</li>
  <li>Click <strong>Save Sprite</strong>. Your sprite appears in the sprite list.</li>
  <li>In your code, use <code>sprites.player</code> to reference it.</li>
</ol>

<h2>Simple Animation</h2>
<p>Create multiple sprites (e.g., <code>player_run1</code>, <code>player_run2</code>) and swap between them.</p>

<pre><code>let frameIndex = 0;
let frameTimer = 0;

function update(dt) {
  frameTimer += dt;
  if (frameTimer > 0.15) {
    frameTimer = 0;
    frameIndex = (frameIndex + 1) % 2;
  }
}

function draw(ctx) {
  const frame = frameIndex === 0 ? 'player_run1' : 'player_run2';
  ctx.drawImage(sprites[frame], player.x, player.y, 32, 32);
}</code></pre>

<h2>Loading External Images</h2>
<p>You can also load images from URLs using <code>Image</code> objects.</p>

<pre><code>const img = new Image();
img.src = 'https://example.com/sprite.png';
// Wait for load, then use in draw():
// ctx.drawImage(img, x, y);</code></pre>
`; },

  get input() { return `
<h1>Input Handling</h1>
<p>DraftBox provides keyboard and mouse state through the <code>keys</code> and <code>mouse</code> objects.</p>

<h2>Keyboard</h2>
<p>The <code>keys</code> object maps <strong>key codes</strong> to boolean values. <code>true</code> means the key is currently pressed.</p>

<pre><code>function update(dt) {
  // Arrow keys
  if (keys.ArrowLeft)  player.x -= speed * dt;
  if (keys.ArrowRight) player.x += speed * dt;
  if (keys.ArrowUp)    player.y -= speed * dt;
  if (keys.ArrowDown)  player.y += speed * dt;

  // WASD
  if (keys.KeyW) player.y -= speed * dt;
  if (keys.KeyA) player.x -= speed * dt;
  if (keys.KeyS) player.y += speed * dt;
  if (keys.KeyD) player.x += speed * dt;

  // Space, Enter, Shift
  if (keys.Space)  shoot();
  if (keys.Enter)  startGame();
  if (keys.ShiftLeft) run();
}</code></pre>

<h2>Mouse</h2>
<p>The <code>mouse</code> object provides cursor position and button state.</p>

<pre><code>function draw(ctx) {
  // Draw cursor position
  ctx.fillStyle = 'white';
  ctx.fillText(mouse.x + ', ' + mouse.y, mouse.x + 10, mouse.y - 10);

  // Draw crosshair at mouse position
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2);
  ctx.fill();

  // Shoot on click
  if (mouse.left) {
    // mouse.x, mouse.y is where the player clicked
  }
}</code></pre>

<h2>Common Key Codes</h2>
<ul>
  <li><strong>Letters:</strong> <code>KeyA</code> through <code>KeyZ</code></li>
  <li><strong>Numbers:</strong> <code>Digit0</code> through <code>Digit9</code></li>
  <li><strong>Arrows:</strong> <code>ArrowUp</code>, <code>ArrowDown</code>, <code>ArrowLeft</code>, <code>ArrowRight</code></li>
  <li><strong>Others:</strong> <code>Space</code>, <code>Enter</code>, <code>ShiftLeft</code>, <code>ShiftRight</code>, <code>ControlLeft</code>, <code>Escape</code></li>
</ul>
`; },

  get collision() { return `
<h1>Collision Detection</h1>
<p>Collision detection is essential for games. DraftBox provides a <code>rectCollide</code> helper for axis-aligned bounding box (AABB) collisions.</p>

<h2>Rectangle (AABB) Collision</h2>
<pre><code>const player = { x: 100, y: 100, w: 32, h: 32 };
const enemy  = { x: 120, y: 110, w: 30, h: 30 };

function update(dt) {
  if (rectCollide(player, enemy)) {
    // Collision detected!
    player.hp -= 1;
  }
}

// rectCollide checks if two rectangles overlap.
// Each rect needs: { x, y, w, h }
</code></pre>

<h2>Manual AABB Test</h2>
<pre><code>function aabb(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}</code></pre>

<h2>Circle Collision</h2>
<pre><code>function circleCollide(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < a.radius + b.radius;
}

// Usage:
const player = { x: 100, y: 100, radius: 16 };
const coin   = { x: 120, y: 110, radius: 8 };
if (circleCollide(player, coin)) collectCoin();</code></pre>

<h2>Point in Rectangle</h2>
<pre><code>function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w &&
         py >= rect.y && py <= rect.y + rect.h;
}

// Check if mouse is over a button
if (pointInRect(mouse.x, mouse.y, button)) {
  // Hover effect
}</code></pre>

<h2>Collision Response</h2>
<p>When objects collide, you typically either:</p>
<ul>
  <li><strong>Push out</strong> — move the player so they're no longer overlapping</li>
  <li><strong>Damage</strong> — reduce HP, destroy the object</li>
  <li><strong>Bounce</strong> — reverse velocity</li>
  <li><strong>Collect</strong> — pick up the item</li>
</ul>

<pre><code>function pushOut(player, wall) {
  const overlapX = Math.min(player.x + player.w, wall.x + wall.w) -
                   Math.max(player.x, wall.x);
  const overlapY = Math.min(player.y + player.h, wall.y + wall.h) -
                   Math.max(player.y, wall.y);

  if (overlapX < overlapY) {
    if (player.x < wall.x) player.x = wall.x - player.w;
    else player.x = wall.x + wall.w;
  } else {
    if (player.y < wall.y) player.y = wall.y - player.h;
    else player.y = wall.y + wall.h;
  }
}</code></pre>
`; },

  get physics() { return `
<h1>Simple Physics</h1>
<p>Add basic physics to your games — gravity, velocity, and bouncing.</p>

<h2>Velocity & Movement</h2>
<pre><code>let player = {
  x: 400, y: 300,
  vx: 0, vy: 0,
  w: 32, h: 32
};

function update(dt) {
  // Apply gravity
  player.vy += 800 * dt; // 800 px/s²

  // Update position
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  // Ground collision
  if (player.y + player.h > canvas.height) {
    player.y = canvas.height - player.h;
    player.vy = 0;
  }

  // Jump
  if (keys.Space && player.vy === 0) {
    player.vy = -400; // Jump velocity
  }
}</code></pre>

<h2>Friction</h2>
<pre><code>function update(dt) {
  // Horizontal movement
  if (keys.ArrowLeft)  player.vx = -200;
  else if (keys.ArrowRight) player.vx = 200;
  else player.vx *= 0.9; // Friction (slows down)

  player.x += player.vx * dt;
}</code></pre>

<h2>Bouncing</h2>
<pre><code>function update(dt) {
  ball.vy += 500 * dt;
  ball.y += ball.vy * dt;

  if (ball.y + ball.radius > canvas.height) {
    ball.y = canvas.height - ball.radius;
    ball.vy *= -0.7; // Bounce with energy loss
  }
}</code></pre>

<h2>Platformer Physics</h2>
<pre><code>let player = {
  x: 100, y: 300, w: 28, h: 32,
  vx: 0, vy: 0,
  onGround: false,
  jumpCount: 0
};

function update(dt) {
  // Horizontal
  if (keys.ArrowLeft)  player.vx = -250;
  else if (keys.ArrowRight) player.vx = 250;
  else player.vx *= 0.85;

  // Gravity
  player.vy += 900 * dt;
  if (player.vy > 600) player.vy = 600;

  // Jump
  if (keys.Space && player.onGround) {
    player.vy = -400;
    player.onGround = false;
  }

  // Apply velocity
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  // Ground
  if (player.y + player.h > canvas.height) {
    player.y = canvas.height - player.h;
    player.vy = 0;
    player.onGround = true;
  }
}</code></pre>
`; },

  get audio() { return `
<h1>Audio & Sound</h1>
<p>Use the <code>audio(name)</code> function to play sounds. DraftBox uses the Web Audio API for sound playback.</p>

<h2>Playing Sounds</h2>
<pre><code>function update(dt) {
  if (keys.Space) {
    audio('jump'); // Plays a sound file named 'jump'
    player.vy = -400;
  }
}

// When collecting a coin:
function collectCoin() {
  audio('coin');
  score++;
}</code></pre>

<h2>Supported Formats</h2>
<p>Browsers support these audio formats:</p>
<ul>
  <li><strong>MP3</strong> (.mp3) — widely supported</li>
  <li><strong>OGG</strong> (.ogg) — open format, good quality</li>
  <li><strong>WAV</strong> (.wav) — uncompressed, large files</li>
  <li><strong>M4A/AAC</strong> (.m4a) — good compression</li>
</ul>

<h2>Generating Sounds Programmatically</h2>
<p>You can create simple sounds using the Web Audio API directly:</p>

<pre><code>function beep(freq = 440, duration = 0.1) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = freq;
  osc.type = 'square';
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}</code></pre>

<div class="note">
  <strong>Note:</strong> Modern browsers require a user interaction (click/keypress) before playing audio. The first click in your game will unlock the audio system.
</div>
`; },

  get gameState() { return `
<h1>Game State Management</h1>
<p>Most games have different screens: menus, gameplay, game over, etc. Manage this with a simple state machine.</p>

<h2>State Machine</h2>
<pre><code>const STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  GAME_OVER: 'gameOver'
};

let state = STATE.MENU;

function update(dt) {
  switch (state) {
    case STATE.MENU:
      if (keys.Enter) state = STATE.PLAYING;
      break;

    case STATE.PLAYING:
      // Normal game logic
      if (player.hp <= 0) state = STATE.GAME_OVER;
      break;

    case STATE.GAME_OVER:
      if (keys.Enter) {
        resetGame();
        state = STATE.MENU;
      }
      break;
  }
}

function draw(ctx) {
  switch (state) {
    case STATE.MENU:
      drawMenu(ctx);
      break;
    case STATE.PLAYING:
      drawGame(ctx);
      break;
    case STATE.GAME_OVER:
      drawGameOver(ctx);
      break;
  }
}</code></pre>

<h2>Levels</h2>
<pre><code>let level = 1;
let maxLevel = 10;

function nextLevel() {
  level++;
  if (level > maxLevel) {
    state = STATE.VICTORY;
  } else {
    initLevel(level);
  }
}</code></pre>

<h2>Score Persistence</h2>
<pre><code>// Save high score
function saveHighScore(score) {
  localStorage.setItem('highscore', score);
}

// Load high score
function loadHighScore() {
  return parseInt(localStorage.getItem('highscore')) || 0;
}</code></pre>
`; },

  get tilemaps() { return `
<h1>Tilemaps</h1>
<p>Tilemaps let you create levels using a grid of tiles. Each tile has a type (wall, floor, etc.).</p>

<h2>Simple Tilemap</h2>
<pre><code>const TILE_SIZE = 32;
const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

function draw(ctx) {
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      const tile = map[row][col];
      if (tile === 1) {
        ctx.fillStyle = '#16213e';
        ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.strokeRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      } else {
        ctx.fillStyle = '#0f0f23';
        ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

// Collision with tiles
function getTile(x, y) {
  const col = Math.floor(x / TILE_SIZE);
  const row = Math.floor(y / TILE_SIZE);
  if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return 1;
  return map[row][col];
}

function canMove(x, y, w, h) {
  // Check all four corners
  return getTile(x, y) === 0 &&
         getTile(x + w - 1, y) === 0 &&
         getTile(x, y + h - 1) === 0 &&
         getTile(x + w - 1, y + h - 1) === 0;
}</code></pre>
`; },

  get animation() { return `
<h1>Animation</h1>
<p>Create frame-by-frame animations by cycling through sprites or using transformation effects.</p>

<h2>Sprite Animation (Frame Cycling)</h2>
<pre><code>let animFrame = 0;
let animTimer = 0;
const frameCount = 4; // player_walk1, player_walk2, etc.

function update(dt) {
  // Advance frame every 0.12 seconds
  animTimer += dt;
  if (animTimer >= 0.12) {
    animTimer -= 0.12;
    animFrame = (animFrame + 1) % frameCount;
  }
}

function draw(ctx) {
  const name = 'player_walk' + (animFrame + 1);
  ctx.drawImage(sprites[name], player.x, player.y, 32, 32);
}</code></pre>

<h2>Tweening / Interpolation</h2>
<pre><code>function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Smooth camera following
let camera = { x: 0, y: 0 };
function update(dt) {
  camera.x = lerp(camera.x, player.x - 400, 0.05);
  camera.y = lerp(camera.y, player.y - 250, 0.05);
}

function draw(ctx) {
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  // Draw everything in world coordinates
  ctx.restore();
}</code></pre>

<h2>Opacity / Fade Effects</h2>
<pre><code>let fadeAlpha = 0;
let fading = false;

function startFade() { fading = true; fadeAlpha = 0; }

function update(dt) {
  if (fading) {
    fadeAlpha += dt * 0.5; // Fade in over 2 seconds
    if (fadeAlpha >= 1) fading = false;
  }
}

function draw(ctx) {
  // ... draw game ...
  if (fading) {
    ctx.fillStyle = 'rgba(0, 0, 0, ' + fadeAlpha + ')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}</code></pre>

<h2>Sprite Flip (Direction)</h2>
<pre><code>let facingRight = true;

function draw(ctx) {
  ctx.save();
  if (facingRight) {
    ctx.drawImage(sprites.player, player.x, player.y, 32, 32);
  } else {
    // Flip horizontally
    ctx.translate(player.x + 32, player.y);
    ctx.scale(-1, 1);
    ctx.drawImage(sprites.player, 0, 0, 32, 32);
  }
  ctx.restore();
}</code></pre>
`; },

  get particles() { return `
<h1>Particle Effects</h1>
<p>Particle systems create visual effects like explosions, smoke, rain, and sparks.</p>

<h2>Simple Particle System</h2>
<pre><code>let particles = [];

function spawnParticles(x, y, color, count = 20) {
  for (let i = 0; i < count; i++) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(50, 200);
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: rand(0.3, 1.0),
      maxLife: rand(0.3, 1.0),
      color,
      size: rand(2, 6)
    });
  }
}

function update(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 200 * dt; // gravity
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function draw(ctx) {
  for (const p of particles) {
    const alpha = clamp(p.life / p.maxLife, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}</code></pre>

<h2>Explosion Effect</h2>
<pre><code>function explode(x, y) {
  spawnParticles(x, y, '#ff6b6b', 30);
  spawnParticles(x, y, '#ffd700', 20);
  spawnParticles(x, y, '#ff9a3c', 15);
}</code></pre>

<h2>Rain Effect</h2>
<pre><code>let rain = [];

function init() {
  for (let i = 0; i < 100; i++) {
    rain.push({
      x: rand(0, canvas.width),
      y: rand(0, canvas.height),
      speed: rand(200, 500),
      length: rand(10, 25)
    });
  }
}

function update(dt) {
  for (const drop of rain) {
    drop.y += drop.speed * dt;
    if (drop.y > canvas.height) {
      drop.y = -drop.length;
      drop.x = rand(0, canvas.width);
    }
  }
}

function draw(ctx) {
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  for (const drop of rain) {
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x - 2, drop.y - drop.length);
    ctx.stroke();
  }
}</code></pre>
`; },

  get math() { return `
<h1>Math Utilities</h1>
<p>DraftBox provides <code>rand()</code> and <code>clamp()</code> helpers. Here are more useful math functions for game development.</p>

<h2>Built-in Helpers</h2>
<pre><code>// Random float between min and max
rand(0, 100);   // e.g., 42.7
rand(-1, 1);    // e.g., -0.35

// Clamp value between min and max
clamp(150, 0, 100); // 100
clamp(-50, 0, 100); // 0
clamp(50, 0, 100);  // 50</code></pre>

<h2>Distance & Direction</h2>
<pre><code>function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function angle(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

// Move towards a target
function moveTowards(pos, target, speed, dt) {
  const dx = target.x - pos.x;
  const dy = target.y - pos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;
  pos.x += (dx / dist) * speed * dt;
  pos.y += (dy / dist) * speed * dt;
}</code></pre>

<h2>Random Integer</h2>
<pre><code>function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

// Random array element
function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}</code></pre>

<h2>Easing Functions</h2>
<pre><code>function easeIn(t) { return t * t; }
function easeOut(t) { return t * (2 - t); }
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Usage for smooth motion:
let t = 0; // 0 to 1 over time
function update(dt) {
  t = Math.min(1, t + dt * 0.5);
  player.x = lerp(100, 500, easeOut(t));
}</code></pre>

<h2>Screen Shake</h2>
<pre><code>let shakeIntensity = 0;

function shake(intensity = 5) {
  shakeIntensity = intensity;
}

function draw(ctx) {
  ctx.save();
  if (shakeIntensity > 0) {
    ctx.translate(
      rand(-shakeIntensity, shakeIntensity),
      rand(-shakeIntensity, shakeIntensity)
    );
    shakeIntensity *= 0.9;
    if (shakeIntensity < 0.5) shakeIntensity = 0;
  }
  // Draw game...
  ctx.restore();
}</code></pre>
`; },

  get patterns() { return `
<h1>Game Patterns</h1>
<p>Common game development patterns and examples to use as starting points.</p>

<h2>Object Pool</h2>
<p>Reuse objects instead of creating/destroying them to avoid garbage collection pauses.</p>
<pre><code>const bullets = [];
const POOL_SIZE = 50;
for (let i = 0; i < POOL_SIZE; i++) {
  bullets.push({ x: 0, y: 0, vx: 0, vy: 0, active: false });
}

function fireBullet(x, y, angle) {
  for (const b of bullets) {
    if (!b.active) {
      b.x = x; b.y = y;
      b.vx = Math.cos(angle) * 400;
      b.vy = Math.sin(angle) * 400;
      b.active = true;
      break;
    }
  }
}</code></pre>

<h2>Entity Component (Simple)</h2>
<pre><code>function createEntity(x, y) {
  return {
    x, y, w: 16, h: 16,
    vx: 0, vy: 0,
    hp: 1,
    alive: true,
    type: 'enemy',
    update(dt) { /* override */ },
    draw(ctx) { /* override */ }
  };
}

const enemies = [];
for (let i = 0; i < 10; i++) {
  const e = createEntity(rand(100, 800), rand(100, 400));
  e.update = function(dt) {
    this.x += this.vx * dt;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
  };
  e.draw = function(ctx) {
    ctx.fillStyle = '#e94560';
    ctx.fillRect(this.x, this.y, this.w, this.h);
  };
  enemies.push(e);
}</code></pre>

<h2>Wave Spawning</h2>
<pre><code>let wave = 1;
let enemiesInWave = 0;
let spawnTimer = 0;

function update(dt) {
  if (enemiesInWave <= 0 && enemies.length === 0) {
    startWave(++wave);
  }

  spawnTimer -= dt;
  if (spawnTimer <= 0 && enemiesInWave > 0) {
    spawnEnemy();
    enemiesInWave--;
    spawnTimer = 1.0 / wave; // Faster spawning each wave
  }
}

function startWave(n) {
  enemiesInWave = n * 5;
  spawnTimer = 0;
}</code></pre>

<h2>Camera Follow</h2>
<pre><code>const camera = { x: 0, y: 0 };
const WORLD_W = 2000;
const WORLD_H = 2000;

function update(dt) {
  // Camera follows player smoothly
  camera.x = lerp(camera.x, player.x - canvas.width/2, 0.1);
  camera.y = lerp(camera.y, player.y - canvas.height/2, 0.1);

  // Clamp to world bounds
  camera.x = clamp(camera.x, 0, WORLD_W - canvas.width);
  camera.y = clamp(camera.y, 0, WORLD_H - canvas.height);
}

function draw(ctx) {
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  // Draw world (tiles, enemies, player...)
  ctx.restore();

  // HUD (not affected by camera)
  ctx.fillStyle = '#fff';
  ctx.font = '18px monospace';
  ctx.fillText('HP: ' + player.hp, 16, 32);
}</code></pre>

<h2>Menu System</h2>
<pre><code>const menuItems = ['Start Game', 'Options', 'Credits'];
let selectedIndex = 0;

function update(dt) {
  if (keys.ArrowUp) { selectedIndex = Math.max(0, selectedIndex - 1); keys.ArrowUp = false; }
  if (keys.ArrowDown) { selectedIndex = Math.min(menuItems.length - 1, selectedIndex + 1); keys.ArrowDown = false; }
  if (keys.Enter) { selectItem(selectedIndex); }
}

function draw(ctx) {
  ctx.fillStyle = '#0f0f23';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#e94560';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('MY GAME', canvas.width/2, 100);

  ctx.font = '22px monospace';
  menuItems.forEach((item, i) => {
    ctx.fillStyle = i === selectedIndex ? '#ffd700' : '#8892b0';
    ctx.fillText((i === selectedIndex ? '> ' : '  ') + item, canvas.width/2, 200 + i * 40);
  });
  ctx.textAlign = 'left';
}</code></pre>
`; },

  get apiRef() { return `
<h1>DraftBox API Reference</h1>
<p>Complete reference for all APIs available in your game code.</p>

<h2>Game Lifecycle</h2>
<table>
  <tr><th>Function</th><th>Description</th></tr>
  <tr><td><code>init()</code></td><td>Called once when the game starts.</td></tr>
  <tr><td><code>update(dt)</code></td><td>Called every frame. <code>dt</code> = delta time in seconds (capped at 0.05).</td></tr>
  <tr><td><code>draw(ctx)</code></td><td>Called every frame after <code>update()</code>. Receives the Canvas 2D context.</td></tr>
</table>

<h2>Input</h2>
<table>
  <tr><th>Property</th><th>Description</th></tr>
  <tr><td><code>keys</code></td><td>Object with boolean values for each key code. e.g., <code>keys.Space</code>, <code>keys.ArrowLeft</code>, <code>keys.KeyW</code></td></tr>
  <tr><td><code>mouse.x</code></td><td>Mouse X position in canvas coordinates.</td></tr>
  <tr><td><code>mouse.y</code></td><td>Mouse Y position in canvas coordinates.</td></tr>
  <tr><td><code>mouse.left</code></td><td>Boolean — is the left mouse button pressed?</td></tr>
</table>

<h2>Graphics</h2>
<table>
  <tr><th>Property</th><th>Description</th></tr>
  <tr><td><code>canvas</code></td><td>The game <code>&lt;canvas&gt;</code> element (960×540). Use <code>canvas.width</code>, <code>canvas.height</code> for dimensions.</td></tr>
  <tr><td><code>sprites[name]</code></td><td>A canvas element for each sprite saved in the Pixel Editor. Use with <code>ctx.drawImage(sprites.name, x, y)</code>.</td></tr>
</table>

<h2>Utilities</h2>
<table>
  <tr><th>Function</th><th>Description</th></tr>
  <tr><td><code>rand(min, max)</code></td><td>Returns a random float between min and max (inclusive).</td></tr>
  <tr><td><code>clamp(value, min, max)</code></td><td>Clamps value to the range [min, max].</td></tr>
  <tr><td><code>rectCollide(a, b)</code></td><td>AABB collision test. Both objects need <code>{x, y, w, h}</code>. Returns boolean.</td></tr>
  <tr><td><code>audio(name)</code></td><td>Plays an audio file by name/path.</td></tr>
</table>

<h2>Canvas 2D Context (ctx)</h2>
<p>The <code>ctx</code> parameter in <code>draw(ctx)</code> is a standard <a href="https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D" target="_blank">CanvasRenderingContext2D</a>. Key methods:</p>

<table>
  <tr><th>Method</th><th>Description</th></tr>
  <tr><td><code>fillStyle</code></td><td>Set fill color (string: 'red', '#e94560', 'rgba(...)')</td></tr>
  <tr><td><code>fillRect(x, y, w, h)</code></td><td>Draw filled rectangle</td></tr>
  <tr><td><code>strokeRect(x, y, w, h)</code></td><td>Draw outlined rectangle</td></tr>
  <tr><td><code>fillText(text, x, y)</code></td><td>Draw filled text</td></tr>
  <tr><td><code>drawImage(img, x, y, w, h)</code></td><td>Draw image/sprite</td></tr>
  <tr><td><code>beginPath()</code></td><td>Start a new path for custom shapes</td></tr>
  <tr><td><code>arc(x, y, r, startAngle, endAngle)</code></td><td>Add an arc/circle to the path</td></tr>
  <tr><td><code>moveTo(x, y)</code></td><td>Move the path cursor</td></tr>
  <tr><td><code>lineTo(x, y)</code></td><td>Draw a line to (x, y)</td></tr>
  <tr><td><code>stroke()</code></td><td>Stroke the current path</td></tr>
  <tr><td><code>fill()</code></td><td>Fill the current path</td></tr>
  <tr><td><code>save() / restore()</code></td><td>Save/restore transform and style state</td></tr>
  <tr><td><code>translate(x, y)</code></td><td>Move the origin</td></tr>
  <tr><td><code>rotate(angle)</code></td><td>Rotate (in radians)</td></tr>
  <tr><td><code>scale(x, y)</code></td><td>Scale the canvas</td></tr>
  <tr><td><code>globalAlpha</code></td><td>Set transparency (0.0 to 1.0)</td></tr>
  <tr><td><code>font</code></td><td>Set font style (<code>'20px monospace'</code>, <code>'bold 24px Arial'</code>)</td></tr>
  <tr><td><code>textAlign</code></td><td>Text alignment: 'left', 'center', 'right'</td></tr>
</table>

<h2>Canvas Size</h2>
<p>The game canvas is <strong>960 × 540</strong> pixels (16:9 aspect ratio). Always use <code>canvas.width</code> and <code>canvas.height</code> for responsive code.</p>

<pre><code>// Center on screen
const cx = canvas.width / 2;
const cy = canvas.height / 2;</code></pre>

<div class="note">
  <strong>All standard JavaScript is available.</strong> You can use arrays, objects, math functions, loops, conditionals, etc. The game runs in the main page context.
</div>
`; },

  get demos() { return `
<div style="text-align:center;padding:20px 0;background:linear-gradient(135deg,#1a3a2e,#2d5a47);border-radius:16px;margin-bottom:24px;border:2px solid var(--accent);">
  <span style="font-size:48px;display:block;margin-bottom:8px;">🎮</span>
  <h1 style="margin-bottom:8px;">Retro Game Demos</h1>
  <p style="font-size:15px;max-width:500px;margin:0 auto;">Charger un jeu retro, le code apparaît dans l'éditeur et le jeu se lance tout seul. Prêt à jouer ?</p>
</div>

<div class="demo-grid">
${Demos.map((demo, i) => `
<div class="demo-card">
  <div class="demo-card-content">
    <div class="demo-card-emoji">${['🕹️','🐍','👾','🧱','☄️','🏃'][i % 6]}</div>
    <h3>${demo.name}</h3>
    <p>${demo.desc}</p>
    <button class="demo-play-btn" data-demo="${i}">▶ Jouer à ${demo.name}</button>
  </div>
</div>
`).join('')}
</div>
`; }
};
