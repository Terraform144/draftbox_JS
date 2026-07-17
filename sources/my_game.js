// PONG
let balle = { x: 480, y: 270, vx: 250, vy: 150, w: 8, h: 8 };
let p1 = { x: 20, y: 220, w: 8, h: 60, score: 0 };
let p2 = { x: 932, y: 220, w: 8, h: 60, score: 0 };
const VITESSE = 280;
let gagnant = '';

function reinitialiser() {
  balle.x = 480; balle.y = 270;
  balle.vx = (Math.random() > 0.5 ? 1 : -1) * VITESSE;
  balle.vy = (Math.random() * 200 - 100);
}

function update(dt) {
  if (keys.Space && gagnant) { p1.score = 0; p2.score = 0; gagnant = ''; reinitialiser(); }

  if (p1.score >= 5 || p2.score >= 5) {
    gagnant = p1.score >= 5 ? 'JOUEUR 1' : 'JOUEUR 2';
    return;
  }

  if (keys.KeyW) p1.y -= 400 * dt;
  if (keys.KeyS) p1.y += 400 * dt;
  if (keys.ArrowUp) p2.y -= 400 * dt;
  if (keys.ArrowDown) p2.y += 400 * dt;
  p1.y = clamp(p1.y, 0, canvas.height - p1.h);
  p2.y = clamp(p2.y, 0, canvas.height - p2.h);

  balle.x += balle.vx * dt;
  balle.y += balle.vy * dt;

  if (balle.y <= 0 || balle.y + balle.h >= canvas.height) balle.vy *= -1;

  if (rectCollide(balle, p1)) { balle.vx = Math.abs(balle.vx); balle.x = p1.x + p1.w; }
  if (rectCollide(balle, p2)) { balle.vx = -Math.abs(balle.vx); balle.x = p2.x - balle.w; }

  if (balle.x < -20) { p2.score++; reinitialiser(); }
  if (balle.x > canvas.width + 20) { p1.score++; reinitialiser(); }
}

function draw(ctx) {
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.fillRect(p1.x, p1.y, p1.w, p1.h);
  ctx.fillRect(p2.x, p2.y, p2.w, p2.h);
  ctx.fillRect(balle.x, balle.y, balle.w, balle.h);

  ctx.beginPath(); ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.setLineDash([8,8]); ctx.stroke(); ctx.setLineDash([]);

  ctx.font = 'bold 48px monospace'; ctx.textAlign = 'center';
  ctx.fillStyle = '#8892b0'; ctx.fillText(p1.score, canvas.width/2 - 60, 60);
  ctx.fillText(p2.score, canvas.width/2 + 60, 60);

  if (gagnant) {
    ctx.font = 'bold 32px monospace'; ctx.fillStyle = '#ffd700';
    ctx.fillText(gagnant + ' GAGNE !', canvas.width/2, canvas.height/2 - 20);
    ctx.font = '16px monospace'; ctx.fillStyle = '#8892b0';
    ctx.fillText('Appuyez sur ESPACE pour recommencer', canvas.width/2, canvas.height/2 + 20);
  }
  ctx.textAlign = 'left';
}