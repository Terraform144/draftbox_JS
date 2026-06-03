/* DraftBox Game Library — lightweight framework inspired by CreateJS */

const Game = (() => {
  /* ─── DisplayObject ─── */
  class DisplayObject {
    constructor() {
      this.x = 0; this.y = 0; this.scaleX = 1; this.scaleY = 1;
      this.rotation = 0; this.alpha = 1; this.visible = true;
      this.width = 0; this.height = 0;
      this.parent = null;
    }
    globalToLocal(gx, gy) {
      let x = gx - this.x, y = gy - this.y;
      if (this.rotation) {
        const cos = Math.cos(-this.rotation), sin = Math.sin(-this.rotation);
        return { x: x * cos - y * sin, y: x * sin + y * cos };
      }
      return { x: x / this.scaleX, y: y / this.scaleY };
    }
    localToGlobal(lx, ly) {
      let x = lx * this.scaleX, y = ly * this.scaleY;
      if (this.rotation) {
        const cos = Math.cos(this.rotation), sin = Math.sin(this.rotation);
        return { x: x * cos - y * sin + this.x, y: x * sin + y * cos + this.y };
      }
      return { x: x + this.x, y: y + this.y };
    }
  }

  /* ─── Graphics ─── */
  class Graphics {
    constructor() { this.commands = []; }
    clear() { this.commands = []; return this; }
    fillStyle(color) { this.commands.push({ t: 'fs', v: color }); return this; }
    strokeStyle(color) { this.commands.push({ t: 'ss', v: color }); return this; }
    lineWidth(w) { this.commands.push({ t: 'lw', v: w }); return this; }
    fillRect(x, y, w, h) { this.commands.push({ t: 'fr', v: [x, y, w, h] }); return this; }
    strokeRect(x, y, w, h) { this.commands.push({ t: 'sr', v: [x, y, w, h] }); return this; }
    fillCircle(x, y, r) { this.commands.push({ t: 'fc', v: [x, y, r] }); return this; }
    strokeCircle(x, y, r) { this.commands.push({ t: 'sc', v: [x, y, r] }); return this; }
    moveTo(x, y) { this.commands.push({ t: 'mt', v: [x, y] }); return this; }
    lineTo(x, y) { this.commands.push({ t: 'lt', v: [x, y] }); return this; }
    closePath() { this.commands.push({ t: 'cp' }); return this; }
    fill() { this.commands.push({ t: 'fl' }); return this; }
    stroke() { this.commands.push({ t: 'st' }); return this; }
    beginPath() { this.commands.push({ t: 'bp' }); return this; }
    exec(ctx) {
      for (const c of this.commands) {
        switch (c.t) {
          case 'fs': ctx.fillStyle = c.v; break;
          case 'ss': ctx.strokeStyle = c.v; break;
          case 'lw': ctx.lineWidth = c.v; break;
          case 'fr': ctx.fillRect(c.v[0], c.v[1], c.v[2], c.v[3]); break;
          case 'sr': ctx.strokeRect(c.v[0], c.v[1], c.v[2], c.v[3]); break;
          case 'fc': ctx.beginPath(); ctx.arc(c.v[0], c.v[1], c.v[2], 0, Math.PI * 2); ctx.fill(); break;
          case 'sc': ctx.beginPath(); ctx.arc(c.v[0], c.v[1], c.v[2], 0, Math.PI * 2); ctx.stroke(); break;
          case 'mt': ctx.moveTo(c.v[0], c.v[1]); break;
          case 'lt': ctx.lineTo(c.v[0], c.v[1]); break;
          case 'bp': ctx.beginPath(); break;
          case 'cp': ctx.closePath(); break;
          case 'fl': ctx.fill(); break;
          case 'st': ctx.stroke(); break;
        }
      }
    }
  }

  /* ─── Shape ─── */
  class Shape extends DisplayObject {
    constructor() { super(); this.graphics = new Graphics(); }
    render(ctx) {
      if (!this.visible || this.alpha <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.scaleX, this.scaleY);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.alpha;
      this.graphics.exec(ctx);
      ctx.restore();
    }
    hitTest(px, py) {
      const local = this.globalToLocal(px, py);
      return local.x >= 0 && local.x <= (this.width || 32) &&
             local.y >= 0 && local.y <= (this.height || 32);
    }
  }

  /* ─── Text ─── */
  class Text extends DisplayObject {
    constructor(text = '', font = '16px monospace', color = '#fff') {
      super();
      this.text = text; this.font = font; this.color = color;
      this.textAlign = 'left'; this.textBaseline = 'top';
    }
    render(ctx) {
      if (!this.visible || this.alpha <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.scaleX, this.scaleY);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.alpha;
      ctx.font = this.font; ctx.fillStyle = this.color;
      ctx.textAlign = this.textAlign; ctx.textBaseline = this.textBaseline;
      ctx.fillText(this.text, 0, 0);
      ctx.restore();
    }
  }

  /* ─── Sprite ─── */
  class Sprite extends DisplayObject {
    constructor(image, width, height) {
      super();
      this.image = image;
      this.width = width || (image ? image.width : 32);
      this.height = height || (image ? image.height : 32);
      this.sourceX = 0; this.sourceY = 0;
      this.sourceW = this.width; this.sourceH = this.height;
    }
    render(ctx) {
      if (!this.visible || this.alpha <= 0 || !this.image) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.scaleX, this.scaleY);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.alpha;
      ctx.drawImage(this.image, this.sourceX, this.sourceY, this.sourceW, this.sourceH,
                    0, 0, this.width, this.height);
      ctx.restore();
    }
    hitTest(px, py) {
      const local = this.globalToLocal(px, py);
      return local.x >= 0 && local.x <= this.width &&
             local.y >= 0 && local.y <= this.height;
    }
  }

  /* ─── Stage ─── */
  class Stage {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.children = [];
      this.clearColor = '#0a0a1a';
    }
    add(child) { this.children.push(child); child.parent = this; }
    remove(child) {
      const idx = this.children.indexOf(child);
      if (idx >= 0) { this.children.splice(idx, 1); child.parent = null; }
    }
    clear() {
      for (const c of this.children) c.parent = null;
      this.children = [];
    }
    update() { /* override for per-frame logic */ }
    render() {
      const ctx = this.ctx;
      ctx.fillStyle = this.clearColor;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      for (const child of this.children) {
        if (child.render) child.render(ctx);
      }
    }
    hitTest(px, py) {
      for (let i = this.children.length - 1; i >= 0; i--) {
        if (this.children[i].hitTest && this.children[i].hitTest(px, py))
          return this.children[i];
      }
      return null;
    }
  }

  /* ─── Tween ─── */
  class Tween {
    constructor(target, props, duration, easing) {
      this.target = target;
      this.startProps = {};
      this.endProps = props;
      this.duration = duration || 1;
      this.elapsed = 0;
      this.easing = easing || Tween.easeLinear;
      this.done = false;
      this.onComplete = null;
      for (const k in props) this.startProps[k] = target[k];
    }
    static easeLinear(t) { return t; }
    static easeIn(t) { return t * t; }
    static easeOut(t) { return t * (2 - t); }
    static easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
    static easeBounce(t) {
      if (t < 0.363) return 7.5625 * t * t;
      if (t < 0.727) { t -= 0.545; return 7.5625 * t * t + 0.75; }
      if (t < 0.909) { t -= 0.818; return 7.5625 * t * t + 0.9375; }
      t -= 0.954; return 7.5625 * t * t + 0.984375;
    }
    update(dt) {
      if (this.done) return;
      this.elapsed += dt;
      const t = Math.min(this.elapsed / this.duration, 1);
      const e = this.easing(t);
      for (const k in this.endProps) {
        this.target[k] = this.startProps[k] + (this.endProps[k] - this.startProps[k]) * e;
      }
      if (t >= 1) { this.done = true; if (this.onComplete) this.onComplete(); }
    }
    then(fn) { this.onComplete = fn; return this; }
    static to(target, props, duration, easing) {
      const tween = new Tween(target, props, duration, easing);
      Tween._active.push(tween);
      return tween;
    }
    static _active = [];
    static updateAll(dt) {
      for (let i = Tween._active.length - 1; i >= 0; i--) {
        Tween._active[i].update(dt);
        if (Tween._active[i].done) Tween._active.splice(i, 1);
      }
    }
  }

  /* ─── Scene Manager ─── */
  const scenes = {};
  let currentScene = null;

  function addScene(name, scene) { scenes[name] = scene; }
  function switchScene(name) {
    if (currentScene && currentScene.exit) currentScene.exit();
    currentScene = scenes[name];
    if (currentScene && currentScene.enter) currentScene.enter();
  }
  function getScene(name) { return scenes[name]; }

  /* ─── Keyboard helper ─── */
  const keys = {};
  document.addEventListener('keydown', e => { keys[e.code] = true; });
  document.addEventListener('keyup', e => { keys[e.code] = false; });
  function keyPressed(code) { return !!keys[code]; }
  function keyJustPressed(code) {
    const v = keys[code];
    if (v === true) { keys[code] = 'used'; return true; }
    return false;
  }

  /* ─── Collision ─── */
  function rectCollide(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function circleCollide(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy) < a.r + b.r;
  }
  function dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }
  function angle(x1, y1, x2, y2) { return Math.atan2(y2 - y1, x2 - x1); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

  /* ─── Exports ─── */
  return {
    DisplayObject, Graphics, Shape, Text, Sprite,
    Stage, Tween,
    scenes, addScene, switchScene, getScene, currentScene,
    keys, keyPressed, keyJustPressed,
    rectCollide, circleCollide, dist, angle,
    lerp, clamp, rand, randInt
  };
})();
