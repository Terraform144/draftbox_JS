export const defaultCode = `// DraftBox Game
// Available API:
//   init()           - called once at start
//   update(dt)       - called every frame (dt in seconds)
//   draw(ctx)        - called every frame to render
//   keys             - keyboard state (e.g. keys.Space, keys.ArrowLeft)
//   mouse            - mouse state (mouse.x, mouse.y, mouse.left)
//   sprites          - sprite canvases from Pixel Editor
//   canvas           - the game canvas element
//   rand(min, max)   - random float
//   clamp(v, min, max)
//   rectCollide(a, b)
//   audio(name)      - play a sound

let player = { x: 400, y: 250, w: 32, h: 32, speed: 300 };
let score = 0;
let coins = [];

function init() {
  for (let i = 0; i < 5; i++) {
    coins.push({
      x: rand(50, 850),
      y: rand(50, 450),
      w: 16, h: 16,
      collected: false
    });
  }
}

function update(dt) {
  if (keys.ArrowLeft || keys.KeyA) player.x -= player.speed * dt;
  if (keys.ArrowRight || keys.KeyD) player.x += player.speed * dt;
  if (keys.ArrowUp || keys.KeyW) player.y -= player.speed * dt;
  if (keys.ArrowDown || keys.KeyS) player.y += player.speed * dt;

  player.x = clamp(player.x, 0, canvas.width - player.w);
  player.y = clamp(player.y, 0, canvas.height - player.h);

  for (let coin of coins) {
    if (!coin.collected && rectCollide(player, coin)) {
      coin.collected = true;
      score++;
    }
  }
}

function draw(ctx) {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let coin of coins) {
    if (!coin.collected) {
      if (sprites.player) {
        ctx.drawImage(sprites.player, coin.x, coin.y, coin.w, coin.h);
      } else {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(coin.x + 8, coin.y + 8, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (sprites.player) {
    ctx.drawImage(sprites.player, player.x, player.y, player.w, player.h);
  } else {
    ctx.fillStyle = '#e94560';
    ctx.fillRect(player.x, player.y, player.w, player.h);
  }

  ctx.fillStyle = '#fff';
  ctx.font = '18px monospace';
  ctx.fillText('Score: ' + score, 16, 32);
}
`;
