const sceneRunner = {
  canvas: null,
  ctx: null,
  running: false,
  rafId: null,
  lastTime: 0,
  userState: null,
  keys: null,
  mouse: null,
  onLog: null,
  onClear: null,

  init(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onLog = opts.onLog || (() => {});
    this.onClear = opts.onClear || (() => {});

    document.addEventListener('keydown', (e) => {
      if (this.running) {
        if (this.keys) this.keys[e.code] = true;
        if (this.mouse) this.mouse[e.code] = true;
      }
    });
    document.addEventListener('keyup', (e) => {
      if (this.running && this.keys) {
        this.keys[e.code] = false;
      }
    });
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.running) return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      if (this.mouse) {
        this.mouse.x = (e.clientX - rect.left) * scaleX;
        this.mouse.y = (e.clientY - rect.top) * scaleY;
      }
    });
    this.canvas.addEventListener('mousedown', (e) => {
      if (this.running && this.mouse) {
        this.mouse.left = true;
      }
    });
    this.canvas.addEventListener('mouseup', (e) => {
      if (this.running && this.mouse) {
        this.mouse.left = false;
      }
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (!this.running) return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      if (this.mouse) {
        this.mouse.x = (touch.clientX - rect.left) * scaleX;
        this.mouse.y = (touch.clientY - rect.top) * scaleY;
        this.mouse.left = true;
      }
    }, { passive: false });
    this.canvas.addEventListener('touchmove', (e) => {
      if (!this.running) return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      if (this.mouse) {
        this.mouse.x = (touch.clientX - rect.left) * scaleX;
        this.mouse.y = (touch.clientY - rect.top) * scaleY;
      }
    }, { passive: false });
    this.canvas.addEventListener('touchend', (e) => {
      if (this.running && this.mouse) {
        this.mouse.left = false;
      }
    });

    this.log('DraftBox Game Engine ready. Click Run to start.');
  },

  log(msg, type = 'log') {
    this.onLog(msg, type);
  },

  clearLog() {
    this.onClear();
  },

  run(code, sprites) {
    this.stop();
    this.clearLog();
    this.log('Starting game...');

    const spriteCanvases = {};
    for (const [name, srcCanvas] of Object.entries(sprites)) {
      const c = document.createElement('canvas');
      c.width = srcCanvas.width;
      c.height = srcCanvas.height;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(srcCanvas, 0, 0);
      spriteCanvases[name] = c;
    }

    this.keys = {};
    this.mouse = { x: 0, y: 0, left: false };

    const canvas = this.canvas;
    const ctx = this.ctx;
    const runner = this;

    const api = {
      keys: this.keys,
      mouse: this.mouse,
      sprites: spriteCanvases,
      canvas: this.canvas,
      rand(min, max) { return Math.random() * (max - min) + min; },
      clamp(val, min, max) { return Math.max(min, Math.min(max, val)); },
      rectCollide(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x &&
               a.y < b.y + b.h && a.y + a.h > b.y;
      },
      audio(name) {
        try {
          const a = new Audio(name);
          a.play().catch(() => {});
        } catch (e) { }
      },
      log(msg) { runner.log(msg); }
    };

    const contextVars = Object.keys(api);
    const contextValues = Object.values(api);

    try {
      const gameFn = new Function(
        ...contextVars,
        code + '\n' +
        'return { init: typeof init !== "undefined" ? init : function(){}, ' +
        'update: typeof update !== "undefined" ? update : function(dt){}, ' +
        'draw: typeof draw !== "undefined" ? draw : function(ctx){} };'
      );

      const game = gameFn(...contextValues);

      if (typeof game.init === 'function') {
        try { game.init(); } catch (e) { this.log('init() error: ' + e.message, 'error'); }
      }

      this.running = true;
      this.lastTime = performance.now();
      this.userState = game;

      const gameLoop = (now) => {
        if (!this.running) return;
        const dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;

        try {
          game.update(dt);
        } catch (e) {
          this.log('update() error: ' + e.message, 'error');
          this.stop();
          return;
        }

        try {
          ctx.fillStyle = '#0f0f23';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          game.draw(ctx);
        } catch (e) {
          this.log('draw() error: ' + e.message, 'error');
          this.stop();
          return;
        }

        this.rafId = requestAnimationFrame(gameLoop);
      };

      this.rafId = requestAnimationFrame(gameLoop);
      this.log('Game running.');
    } catch (e) {
      this.log('Error compiling game: ' + e.message, 'error');
    }
  },

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.running = false;
    this.log('Game stopped.', 'warn');
  },

  reset() {
    this.stop();
    const ctx = this.ctx;
    if (ctx) {
      ctx.fillStyle = '#0f0f23';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
};

export default sceneRunner;
