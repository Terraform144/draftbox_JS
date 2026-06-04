// DraftBox Game — saved with the game library
// Use Game.Stage, Game.Shape, Game.Tween, etc.

const stage = new Game.Stage(canvas);
stage.clearColor = '#1a1a2e';//

const player = new Game.Shape();
player.graphics.fillStyle('#e94560').fillRect(0, 0, 32, 32);
player.x = 400;
player.y = 250;
player.width = 32;
player.height = 32;
stage.add(player);

const goal = new Game.Text('Collect the coin!', '16px monospace', '#ffd700');
goal.x = 350;
goal.y = 50;
stage.add(goal);

const coin = new Game.Shape();
coin.graphics.fillStyle('#ffd700').fillCircle(8, 8, 8);
coin.x = 600;
coin.y = 200;
coin.width = 16;
coin.height = 16;
stage.add(coin);

let collected = false;
let score = 0;
const speed = 300;

function init() {
  Game.Tween.to(coin, { y: 250 }, 1.5, Game.Tween.easeInOut)
    .then(() => Game.Tween.to(coin, { y: 200 }, 1.5, Game.Tween.easeInOut));
}

function update(dt) {
  if (keys.ArrowLeft || keys.KeyA) player.x -= speed * dt;
  if (keys.ArrowRight || keys.KeyD) player.x += speed * dt;
  if (keys.ArrowUp || keys.KeyW) player.y -= speed * dt;
  if (keys.ArrowDown || keys.KeyS) player.y += speed * dt;
  player.x = clamp(player.x, 0, canvas.width - 32);
  player.y = clamp(player.y, 0, canvas.height - 32);

  if (!collected && Game.rectCollide(
    { x: player.x, y: player.y, w: 32, h: 32 },
    { x: coin.x - 8, y: coin.y - 8, w: 16, h: 16 }
  )) {
    collected = true;
    coin.visible = false;
    score++;
  }

  Game.Tween.updateAll(dt);
}

function draw(ctx) {
  stage.render();
  ctx.fillStyle = '#fff';
  ctx.font = '18px monospace';
  ctx.fillText('Score: ' + score, 16, 32);
}
