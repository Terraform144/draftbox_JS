export default [
  {
    name: 'Pong',
    desc: 'Classic 2-player pong. Player 1: W/S • Player 2: Arrow Up/Down • First to 5 wins.',
    code: `// PONG
let ball = { x: 480, y: 270, vx: 250, vy: 150, w: 8, h: 8 };
let p1 = { x: 20, y: 220, w: 8, h: 60, score: 0 };
let p2 = { x: 932, y: 220, w: 8, h: 60, score: 0 };
const SPEED = 280;
let winner = '';

function reset() {
  ball.x = 480; ball.y = 270;
  ball.vx = (Math.random() > 0.5 ? 1 : -1) * SPEED;
  ball.vy = (Math.random() * 200 - 100);
}

function update(dt) {
  if (keys.Space && winner) { p1.score = 0; p2.score = 0; winner = ''; reset(); }

  if (p1.score >= 5 || p2.score >= 5) {
    winner = p1.score >= 5 ? 'PLAYER 1' : 'PLAYER 2';
    return;
  }

  if (keys.KeyW) p1.y -= 400 * dt;
  if (keys.KeyS) p1.y += 400 * dt;
  if (keys.ArrowUp) p2.y -= 400 * dt;
  if (keys.ArrowDown) p2.y += 400 * dt;
  p1.y = clamp(p1.y, 0, canvas.height - p1.h);
  p2.y = clamp(p2.y, 0, canvas.height - p2.h);

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.y <= 0 || ball.y + ball.h >= canvas.height) ball.vy *= -1;

  if (rectCollide(ball, p1)) { ball.vx = Math.abs(ball.vx); ball.x = p1.x + p1.w; }
  if (rectCollide(ball, p2)) { ball.vx = -Math.abs(ball.vx); ball.x = p2.x - ball.w; }

  if (ball.x < -20) { p2.score++; reset(); }
  if (ball.x > canvas.width + 20) { p1.score++; reset(); }
}

function draw(ctx) {
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.fillRect(p1.x, p1.y, p1.w, p1.h);
  ctx.fillRect(p2.x, p2.y, p2.w, p2.h);
  ctx.fillRect(ball.x, ball.y, ball.w, ball.h);

  ctx.beginPath(); ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.setLineDash([8,8]); ctx.stroke(); ctx.setLineDash([]);

  ctx.font = 'bold 48px monospace'; ctx.textAlign = 'center';
  ctx.fillStyle = '#8892b0'; ctx.fillText(p1.score, canvas.width/2 - 60, 60);
  ctx.fillText(p2.score, canvas.width/2 + 60, 60);

  if (winner) {
    ctx.font = 'bold 32px monospace'; ctx.fillStyle = '#ffd700';
    ctx.fillText(winner + ' WINS!', canvas.width/2, canvas.height/2 - 20);
    ctx.font = '16px monospace'; ctx.fillStyle = '#8892b0';
    ctx.fillText('Press SPACE to restart', canvas.width/2, canvas.height/2 + 20);
  }
  ctx.textAlign = 'left';
}`
  },

  {
    name: 'Snake',
    desc: 'Classic snake game. Arrow keys to move. Eat the red apple to grow.',
    code: `// SNAKE
const CELL = 20;
let snake, dir, nextDir, apple, score, gameOver;

function init() {
  snake = [{x:15,y:15},{x:14,y:15},{x:13,y:15}];
  dir = {x:1,y:0}; nextDir = {x:1,y:0};
  score = 0; gameOver = false;
  spawnApple();
}

function spawnApple() {
  do {
    apple = {x:randInt(0,47), y:randInt(0,26)};
  } while (snake.some(s => s.x === apple.x && s.y === apple.y));
}

function randInt(a,b) { return Math.floor(rand(a,b+1)); }

function update(dt) {
  if (gameOver) {
    if (keys.Space) init();
    return;
  }

  if (keys.ArrowUp && dir.y !== 1) nextDir = {x:0,y:-1};
  if (keys.ArrowDown && dir.y !== -1) nextDir = {x:0,y:1};
  if (keys.ArrowLeft && dir.x !== 1) nextDir = {x:-1,y:0};
  if (keys.ArrowRight && dir.x !== -1) nextDir = {x:1,y:0};

  frameCount++;
  if (frameCount % 6 !== 0) return;

  dir = nextDir;
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
  if (head.x < 0 || head.x >= 48 || head.y < 0 || head.y >= 27 ||
      snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver = true; return;
  }
  snake.unshift(head);
  if (head.x === apple.x && head.y === apple.y) { score++; spawnApple(); }
  else snake.pop();
}
let frameCount = 0;

function draw(ctx) {
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,canvas.width,canvas.height);
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? '#4ecdc4' : '#2d9e96';
    ctx.fillRect(snake[i].x * CELL, snake[i].y * CELL, CELL-1, CELL-1);
  }
  ctx.fillStyle = '#e94560';
  ctx.fillRect(apple.x * CELL, apple.y * CELL, CELL-1, CELL-1);
  ctx.fillStyle = '#8892b0'; ctx.font = '20px monospace';
  ctx.fillText('Score: ' + score, 16, 32);
  if (gameOver) {
    ctx.fillStyle = '#e94560'; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 10);
    ctx.font = '16px monospace'; ctx.fillStyle = '#8892b0';
    ctx.fillText('Press SPACE to restart', canvas.width/2, canvas.height/2 + 30);
    ctx.textAlign = 'left';
  }
}`
  },

  {
    name: 'Space Invaders',
    desc: 'Classic space shooter. Arrow keys to move, Space to shoot. Eliminate all aliens.',
    code: `// SPACE INVADERS
const ROWS = 4, COLS = 10;
let player, bullets, aliens, alienDir, score, gameOver, win;

function init() {
  player = {x:440,y:500,w:60,h:30};
  bullets = []; aliens = []; alienDir = 1;
  score = 0; gameOver = false; win = false;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      aliens.push({x:70+c*80,y:40+r*50,w:50,h:30,alive:true,row:r});
}

function update(dt) {
  if (gameOver || win) { if (keys.Space) init(); return; }

  if (keys.ArrowLeft) player.x -= 350 * dt;
  if (keys.ArrowRight) player.x += 350 * dt;
  player.x = clamp(player.x, 0, canvas.width - player.w);
  if (keys.Space && bullets.length < 3)
    bullets.push({x:player.x+28,y:player.y-10,w:4,h:12,vy:-400});
  keys.Space = false;

  for (let b of bullets) b.y += b.vy * dt;
  bullets = bullets.filter(b => b.y > -20);

  let hitWall = false, reached = false;
  for (let a of aliens) {
    if (!a.alive) continue;
    a.x += 80 * dt * alienDir;
    if (a.x <= 10 || a.x + a.w >= canvas.width - 10) hitWall = true;
    if (a.y + a.h >= player.y) { gameOver = true; return; }
    for (let b of bullets) {
      if (rectCollide(b, a)) { a.alive = false; b.y = -100; score += a.row < 1 ? 30 : a.row < 3 ? 20 : 10; }
    }
  }
  if (hitWall) { alienDir *= -1; for (let a of aliens) a.y += 20; }

  aliens = aliens.filter(a => a.alive);
  if (aliens.length === 0) { win = true; }
}

function drawAlien(ctx, a) {
  const t = a.row;
  ctx.fillStyle = '#e94560';
  const p = 5;
  function px(x, y) { ctx.fillRect(a.x + x * p, a.y + y * p, p, p); }
  if (t === 0) {
    for (let x=1;x<=8;x++) px(x,0);
    for (let x=0;x<=9;x++) px(x,1);
    for (let x=0;x<=9;x++) if (x<3||x>6) px(x,2);
    for (let x=0;x<=9;x++) px(x,3);
    for (let x=0;x<=9;x++) if (x<2||x>7) px(x,4);
    for (let x=1;x<=8;x++) if (x<3||x>6) px(x,5);
    px(4,6); px(5,6);
  } else if (t === 1 || t === 2) {
    for (let x=1;x<=8;x++) px(x,0);
    for (let x=0;x<=9;x++) px(x,1);
    for (let x=0;x<=9;x++) px(x,2);
    for (let x=0;x<=9;x++) if (x<3||x>6) px(x,3);
    for (let x=0;x<=9;x++) px(x,4);
    for (let x=0;x<=9;x++) if (x<3||x>6) px(x,5);
    if (t === 2) { px(0,5); px(9,5); px(1,6); px(8,6); }
  } else {
    for (let x=2;x<=7;x++) px(x,0);
    for (let x=1;x<=8;x++) px(x,1);
    for (let x=0;x<=9;x++) px(x,2);
    for (let x=0;x<=9;x++) px(x,3);
    for (let x=1;x<=8;x++) if (x<3||x>6) px(x,4);
    px(0,4); px(9,4);
    for (let x=2;x<=7;x++) px(x,5);
    px(4,6); px(5,6);
  }
}

function draw(ctx) {
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#4ecdc4'; ctx.fillRect(player.x,player.y,player.w,player.h);
  for (let b of bullets) { ctx.fillStyle = '#ffd700'; ctx.fillRect(b.x,b.y,b.w,b.h); }
  for (let a of aliens) drawAlien(ctx, a);
  ctx.fillStyle = '#8892b0'; ctx.font = '18px monospace';
  ctx.fillText('Score: ' + score, 16, 32);
  if (gameOver) {
    ctx.fillStyle = '#e94560'; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2); ctx.textAlign = 'left';
  }
  if (win) {
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center';
    ctx.fillText('YOU WIN!', canvas.width/2, canvas.height/2); ctx.textAlign = 'left';
  }
}`
  },

  {
    name: 'Breakout',
    desc: 'Break all the bricks! Move paddle with Arrow keys, ball bounces off everything.',
    code: `// BREAKOUT
let paddle, ball, bricks, score, lives, gameOver, win;

function init() {
  paddle = {x:380,y:520,w:160,h:16};
  ball = {x:460,y:500,vx:200,vy:-250,r:6};
  bricks = []; score = 0; lives = 3; gameOver = false; win = false;
  const colors = ['#e94560','#ff6b6b','#ffd700','#4ecdc4','#533483'];
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 10; c++)
      bricks.push({x:12+c*94,y:30+r*34,w:84,h:26,color:colors[r],alive:true});
}

function update(dt) {
  if (gameOver || win) { if (keys.Space) init(); return; }

  if (keys.ArrowLeft) paddle.x -= 500 * dt;
  if (keys.ArrowRight) paddle.x += 500 * dt;
  paddle.x = clamp(paddle.x, 0, canvas.width - paddle.w);

  if (ball.vy === 0 && ball.vx === 0) {
    ball.x = paddle.x + paddle.w/2;
    ball.y = paddle.y - 6;
    if (keys.Space) { ball.vy = -280; ball.vx = (Math.random() > 0.5 ? 1 : -1) * 180; }
    return;
  }

  ball.x += ball.vx * dt; ball.y += ball.vy * dt;
  if (ball.x <= 0 || ball.x + ball.r*2 >= canvas.width) ball.vx *= -1;
  if (ball.y <= 0) ball.vy *= -1;

  if (rectCollide({x:ball.x,y:ball.y,w:ball.r*2,h:ball.r*2}, paddle)) {
    ball.vy = -Math.abs(ball.vy);
    const hit = (ball.x + ball.r - paddle.x) / paddle.w;
    ball.vx = (hit - 0.5) * 400;
    ball.y = paddle.y - ball.r*2;
  }

  for (let b of bricks) {
    if (!b.alive) continue;
    if (rectCollide({x:ball.x,y:ball.y,w:ball.r*2,h:ball.r*2}, b)) {
      b.alive = false; score += 10;
      const overlapX = Math.min(ball.x+ball.r*2,b.x+b.w) - Math.max(ball.x,b.x);
      const overlapY = Math.min(ball.y+ball.r*2,b.y+b.h) - Math.max(ball.y,b.y);
      if (overlapX < overlapY) ball.vx *= -1; else ball.vy *= -1;
    }
  }

  if (bricks.every(b => !b.alive)) { win = true; }

  if (ball.y > canvas.height) { lives--; if (lives <= 0) gameOver = true; else { ball.vx=0; ball.vy=0; } }
}

function draw(ctx) {
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#eee'; ctx.fillRect(paddle.x,paddle.y,paddle.w,paddle.h);
  ctx.fillStyle = '#fff'; ctx.beginPath();
  ctx.arc(ball.x+ball.r,ball.y+ball.r,ball.r,0,Math.PI*2); ctx.fill();
  for (let b of bricks) {
    if (!b.alive) continue;
    ctx.fillStyle = b.color; ctx.fillRect(b.x,b.y,b.w,b.h);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(b.x+4,b.y+4,b.w-8,6);
  }
  ctx.fillStyle = '#8892b0'; ctx.font = '18px monospace';
  ctx.fillText('Score: ' + score + '  Lives: ' + '♥'.repeat(lives), 16, 32);
  if (gameOver) {
    ctx.fillStyle = '#e94560'; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
    ctx.font = '16px monospace'; ctx.fillStyle = '#8892b0';
    ctx.fillText('Press SPACE to restart', canvas.width/2, canvas.height/2 + 30);
    ctx.textAlign = 'left';
  }
  if (win) {
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center';
    ctx.fillText('YOU WIN!  Score: ' + score, canvas.width/2, canvas.height/2);
    ctx.font = '16px monospace'; ctx.fillStyle = '#8892b0';
    ctx.fillText('Press SPACE to restart', canvas.width/2, canvas.height/2 + 30);
    ctx.textAlign = 'left';
  }
}`
  },

  {
    name: 'Asteroids',
    desc: 'Navigate through asteroids! Arrow keys to thrust/rotate, Space to shoot.',
    code: `// ASTEROIDS
let ship, bullets, asteroids, score, gameOver;

function init() {
  ship = {x:480,y:270,vx:0,vy:0,angle:-Math.PI/2,radius:12};
  bullets = []; score = 0; gameOver = false;
  asteroids = [];
  for (let i = 0; i < 5; i++) {
    let a;
    do {
      a = {x:rand(50,910),y:rand(50,490),vx:rand(-60,60),vy:rand(-60,60),radius:rand(20,40),lives:3};
    } while (Math.hypot(a.x-ship.x,a.y-ship.y) < 150);
    asteroids.push(a);
  }
}

function update(dt) {
  if (gameOver) { if (keys.Space) init(); return; }

  if (keys.ArrowUp) { ship.vx += Math.cos(ship.angle) * 200 * dt; ship.vy += Math.sin(ship.angle) * 200 * dt; }
  if (keys.ArrowLeft) ship.angle -= 3 * dt;
  if (keys.ArrowRight) ship.angle += 3 * dt;
  if (keys.Space && bullets.length < 8) {
    bullets.push({x:ship.x,y:ship.y,vx:Math.cos(ship.angle)*500+ship.vx,vy:Math.sin(ship.angle)*500+ship.vy,life:2});
    keys.Space = false;
  }

  ship.vx *= 0.99; ship.vy *= 0.99;
  ship.x += ship.vx * dt; ship.y += ship.vy * dt;
  wrap(ship);
  for (let b of bullets) { b.x += b.vx*dt; b.y += b.vy*dt; b.life -= dt; }
  bullets = bullets.filter(b => b.life > 0 && b.x > -50 && b.x < canvas.width+50 && b.y > -50 && b.y < canvas.height+50);

  for (let a of asteroids) {
    a.x += a.vx*dt; a.y += a.vy*dt; wrap(a);
    for (let b of bullets) {
      if (Math.hypot(b.x-a.x,b.y-a.y) < a.radius) {
        b.life = -1; a.lives--;
        if (a.lives <= 0) splitAsteroid(a);
      }
    }
    if (Math.hypot(ship.x-a.x,ship.y-a.y) < a.radius + ship.radius) gameOver = true;
  }
  asteroids = asteroids.filter(a => a.lives > 0);
}

function wrap(o) {
  if (o.x < -50) o.x = canvas.width+50; if (o.x > canvas.width+50) o.x = -50;
  if (o.y < -50) o.y = canvas.height+50; if (o.y > canvas.height+50) o.y = -50;
}

function splitAsteroid(a) {
  score += 100;
  if (a.radius > 15) {
    asteroids.push({x:a.x,y:a.y,vx:rand(-80,80),vy:rand(-80,80),radius:a.radius/1.5,lives:2});
    asteroids.push({x:a.x,y:a.y,vx:rand(-80,80),vy:rand(-80,80),radius:a.radius/1.5,lives:2});
  }
}

function draw(ctx) {
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,canvas.width,canvas.height);
  for (let a of asteroids) {
    ctx.strokeStyle = '#8892b0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(a.x,a.y,a.radius,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle = 'rgba(136,146,176,0.1)'; ctx.fill();
  }
  for (let b of bullets) { ctx.fillStyle = '#ffd700'; ctx.fillRect(b.x-2,b.y-2,4,4); }
  ctx.save(); ctx.translate(ship.x,ship.y); ctx.rotate(ship.angle);
  ctx.strokeStyle = '#4ecdc4'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(16,0); ctx.lineTo(-10,-8); ctx.lineTo(-6,0); ctx.lineTo(-10,8); ctx.closePath(); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#8892b0'; ctx.font = '18px monospace'; ctx.fillText('Score: ' + score, 16, 32);
  if (gameOver) {
    ctx.fillStyle = '#e94560'; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
    ctx.font = '16px monospace'; ctx.fillStyle = '#8892b0';
    ctx.fillText('Press SPACE to restart', canvas.width/2, canvas.height/2 + 30);
    ctx.textAlign = 'left';
  }
}`
  },

  {
    name: 'Platformer',
    desc: 'Simple platformer. Arrow keys to move, Space to jump. Collect coins!',
    code: `// PLATFORMER
let player, coins, platforms, camera, score;

function init() {
  player = {x:50,y:300,w:28,h:32,vx:0,vy:0,onGround:false};
  score = 0;
  platforms = [
    {x:0,y:520,w:200,h:20},{x:250,y:480,w:150,h:20},{x:450,y:430,w:160,h:20},
    {x:660,y:480,w:160,h:20},{x:870,y:450,w:120,h:20},{x:1050,y:400,w:140,h:20},
    {x:0,y:0,w:50,h:540},{x:1200,y:0,w:50,h:540},{x:0,y:540,w:1250,h:20}
  ];
  coins = [];
  for (let i = 0; i < 8; i++)
    coins.push({x:rand(100,1100),y:rand(100,480),w:16,h:16,collected:false});
  camera = {x:0};
}

function update(dt) {
  if (keys.ArrowLeft || keys.KeyA) player.vx = -250;
  else if (keys.ArrowRight || keys.KeyD) player.vx = 250;
  else player.vx *= 0.85;

  if ((keys.Space || keys.KeyW) && player.onGround) { player.vy = -420; player.onGround = false; }

  player.vy += 900 * dt;
  if (player.vy > 600) player.vy = 600;

  player.x += player.vx * dt;
  player.y += player.vy * dt;

  player.onGround = false;
  for (let p of platforms) {
    if (rectCollide(player, p)) {
      if (player.vy > 0 && player.y + player.h - player.vy * dt <= p.y + 4) {
        player.y = p.y - player.h; player.vy = 0; player.onGround = true;
      } else if (player.vy < 0 && player.y - player.vy * dt >= p.y + p.h - 4) {
        player.y = p.y + p.h; player.vy = 0;
      } else {
        if (player.vx > 0) player.x = p.x - player.w;
        else if (player.vx < 0) player.x = p.x + p.w;
      }
    }
  }

  if (player.y > 600) { player.x = 50; player.y = 300; player.vx = 0; player.vy = 0; score = 0; }

  for (let c of coins) {
    if (!c.collected && rectCollide(player, c)) { c.collected = true; score++; }
  }

  camera.x = lerp(camera.x, player.x - 400, 0.08);
  camera.x = clamp(camera.x, 0, 400);
}

function lerp(a,b,t) { return a+(b-a)*t; }

function draw(ctx) {
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.save(); ctx.translate(-camera.x, 0);

  for (let p of platforms) {
    ctx.fillStyle = '#16213e'; ctx.fillRect(p.x,p.y,p.w,p.h);
    ctx.fillStyle = '#0f3460'; ctx.fillRect(p.x,p.y,p.w,4);
  }

  for (let c of coins) {
    if (c.collected) continue;
    ctx.fillStyle = '#ffd700'; ctx.beginPath();
    ctx.arc(c.x+c.w/2,c.y+c.h/2,c.w/2,0,Math.PI*2); ctx.fill();
  }

  ctx.fillStyle = '#4ecdc4'; ctx.fillRect(player.x,player.y,player.w,player.h);
  ctx.fillStyle = '#2d9e96'; ctx.fillRect(player.x+4,player.y+4,player.w-8,6);
  ctx.restore();

  ctx.fillStyle = '#fff'; ctx.font = '18px monospace';
  ctx.fillText('Coins: ' + score + '/8', 16, 32);
  ctx.fillText('← → to move  SPACE to jump', 16, 56);
}`
  }
];
