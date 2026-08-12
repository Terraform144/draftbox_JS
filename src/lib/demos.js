export default [
  {
    name: 'Pong',
    desc: 'Pong classique 2 joueurs. Joueur 1 : W/S • Joueur 2 : Flèches Haut/Bas • Premier à 5 points gagne.',
    code: `// PONG
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
}`
  },

  {
    name: 'Snake',
    desc: 'Le jeu du serpent classique. Flèches pour se déplacer. Mangez la pomme rouge pour grandir.',
    code: `// SERPENT
const CELLULE = 20;
let serpent, dir, nextDir, pomme, score, gameOver;

function init() {
  serpent = [{x:15,y:15},{x:14,y:15},{x:13,y:15}];
  dir = {x:1,y:0}; nextDir = {x:1,y:0};
  score = 0; gameOver = false;
  apparaitrePomme();
}

function apparaitrePomme() {
  do {
    pomme = {x:randInt(0,47), y:randInt(0,26)};
  } while (serpent.some(s => s.x === pomme.x && s.y === pomme.y));
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
  const tete = {x: serpent[0].x + dir.x, y: serpent[0].y + dir.y};
  if (tete.x < 0 || tete.x >= 48 || tete.y < 0 || tete.y >= 27 ||
      serpent.some(s => s.x === tete.x && s.y === tete.y)) {
    gameOver = true; return;
  }
  serpent.unshift(tete);
  if (tete.x === pomme.x && tete.y === pomme.y) { score++; apparaitrePomme(); }
  else serpent.pop();
}
let frameCount = 0;

function draw(ctx) {
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,canvas.width,canvas.height);
  for (let i = 0; i < serpent.length; i++) {
    ctx.fillStyle = i === 0 ? '#4ecdc4' : '#2d9e96';
    ctx.fillRect(serpent[i].x * CELLULE, serpent[i].y * CELLULE, CELLULE-1, CELLULE-1);
  }
  ctx.fillStyle = '#e94560';
  ctx.fillRect(pomme.x * CELLULE, pomme.y * CELLULE, CELLULE-1, CELLULE-1);
  ctx.fillStyle = '#8892b0'; ctx.font = '20px monospace';
  ctx.fillText('Score : ' + score, 16, 32);
  if (gameOver) {
    ctx.fillStyle = '#e94560'; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 10);
    ctx.font = '16px monospace'; ctx.fillStyle = '#8892b0';
    ctx.fillText('Appuyez sur ESPACE pour recommencer', canvas.width/2, canvas.height/2 + 30);
    ctx.textAlign = 'left';
  }
}`
  },

  {
    name: 'Space Invaders',
    desc: 'Shoot spatial classique. Flèches pour se déplacer, Espace pour tirer. Éliminez tous les aliens.',
    code: `// SPACE INVADERS
const LIGNES = 4, COLS = 10;
let joueur, balles, ballesAliens, aliens, dirAlien, score, gameOver, victoire;

function init() {
  joueur = {x:440,y:500,w:60,h:30};
  balles = []; ballesAliens = []; aliens = []; dirAlien = 1;
  score = 0; gameOver = false; victoire = false;
  for (let r = 0; r < LIGNES; r++)
    for (let c = 0; c < COLS; c++)
      aliens.push({x:70+c*80,y:40+r*50,w:50,h:30,vivant:true,ligne:r});
}

function update(dt) {
  if (gameOver || victoire) { if (keys.Space) init(); return; }

  if (keys.ArrowLeft) joueur.x -= 350 * dt;
  if (keys.ArrowRight) joueur.x += 350 * dt;
  joueur.x = clamp(joueur.x, 0, canvas.width - joueur.w);
  if (keys.Space && balles.length < 3)
    balles.push({x:joueur.x+28,y:joueur.y-10,w:4,h:12,vy:-400});
  keys.Space = false;

  for (let b of balles) b.y += b.vy * dt;
  balles = balles.filter(b => b.y > -20);

  for (let b of ballesAliens) b.y += b.vy * dt;
  ballesAliens = ballesAliens.filter(b => b.y < canvas.height + 20);

  let toucheMur = false;
  for (let a of aliens) {
    if (!a.vivant) continue;
    a.x += 80 * dt * dirAlien;
    if (a.x <= 10 || a.x + a.w >= canvas.width - 10) toucheMur = true;
    if (a.y + a.h >= joueur.y) { gameOver = true; return; }
    for (let b of balles) {
      if (rectCollide(b, a)) { a.vivant = false; b.y = -100; score += a.ligne < 1 ? 30 : a.ligne < 3 ? 20 : 10; }
    }
  }

  if (aliens.length > 0 && Math.random() < 0.6 * dt) {
    let vivants = aliens.filter(a => a.vivant);
    if (vivants.length > 0) {
      let tireur = vivants[Math.floor(Math.random() * vivants.length)];
      ballesAliens.push({x:tireur.x+24, y:tireur.y+tireur.h, w:4, h:10, vy:300});
    }
  }

  for (let b of ballesAliens) {
    if (rectCollide(b, joueur)) { gameOver = true; return; }
  }

  if (toucheMur) { dirAlien *= -1; for (let a of aliens) a.y += 20; }

  aliens = aliens.filter(a => a.vivant);
  if (aliens.length === 0) { victoire = true; }
}

function dessinerAlien(ctx, a) {
  const t = a.ligne;
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
  ctx.fillStyle = '#4ecdc4'; ctx.fillRect(joueur.x,joueur.y,joueur.w,joueur.h);
  for (let b of balles) { ctx.fillStyle = '#ffd700'; ctx.fillRect(b.x,b.y,b.w,b.h); }
  for (let b of ballesAliens) { ctx.fillStyle = '#e94560'; ctx.fillRect(b.x,b.y,b.w,b.h); }
  for (let a of aliens) dessinerAlien(ctx, a);
  ctx.fillStyle = '#8892b0'; ctx.font = '18px monospace';
  ctx.fillText('Score : ' + score, 16, 32);
  if (gameOver) {
    ctx.fillStyle = '#e94560'; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2); ctx.textAlign = 'left';
  }
  if (victoire) {
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center';
    ctx.fillText('VOUS GAGNEZ !', canvas.width/2, canvas.height/2); ctx.textAlign = 'left';
  }
}`
  },

  {
    name: 'Breakout',
    desc: 'Cassez tous les blocs ! Flèches pour la raquette, la balle rebondit sur tout.',
    code: `// CASSE-BRIQUES
let raquette, balle, briques, score, vies, gameOver, victoire;

function init() {
  raquette = {x:380,y:520,w:160,h:16};
  balle = {x:460,y:500,vx:200,vy:-250,r:6};
  briques = []; score = 0; vies = 3; gameOver = false; victoire = false;
  const couleurs = ['#e94560','#ff6b6b','#ffd700','#4ecdc4','#533483'];
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 10; c++)
      briques.push({x:12+c*94,y:30+r*34,w:84,h:26,couleur:couleurs[r],vivante:true});
}

function update(dt) {
  if (gameOver || victoire) { if (keys.Space) init(); return; }

  if (keys.ArrowLeft) raquette.x -= 500 * dt;
  if (keys.ArrowRight) raquette.x += 500 * dt;
  raquette.x = clamp(raquette.x, 0, canvas.width - raquette.w);

  if (balle.vy === 0 && balle.vx === 0) {
    balle.x = raquette.x + raquette.w/2;
    balle.y = raquette.y - 6;
    if (keys.Space) { balle.vy = -280; balle.vx = (Math.random() > 0.5 ? 1 : -1) * 180; }
    return;
  }

  balle.x += balle.vx * dt; balle.y += balle.vy * dt;
  if (balle.x <= 0 || balle.x + balle.r*2 >= canvas.width) balle.vx *= -1;
  if (balle.y <= 0) balle.vy *= -1;

  if (rectCollide({x:balle.x,y:balle.y,w:balle.r*2,h:balle.r*2}, raquette)) {
    balle.vy = -Math.abs(balle.vy);
    const contact = (balle.x + balle.r - raquette.x) / raquette.w;
    balle.vx = (contact - 0.5) * 400;
    balle.y = raquette.y - balle.r*2;
  }

  for (let b of briques) {
    if (!b.vivante) continue;
    if (rectCollide({x:balle.x,y:balle.y,w:balle.r*2,h:balle.r*2}, b)) {
      b.vivante = false; score += 10;
      const chevX = Math.min(balle.x+balle.r*2,b.x+b.w) - Math.max(balle.x,b.x);
      const chevY = Math.min(balle.y+balle.r*2,b.y+b.h) - Math.max(balle.y,b.y);
      if (chevX < chevY) balle.vx *= -1; else balle.vy *= -1;
    }
  }

  if (briques.every(b => !b.vivante)) { victoire = true; }

  if (balle.y > canvas.height) { vies--; if (vies <= 0) gameOver = true; else { balle.vx=0; balle.vy=0; } }
}

function draw(ctx) {
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#eee'; ctx.fillRect(raquette.x,raquette.y,raquette.w,raquette.h);
  ctx.fillStyle = '#fff'; ctx.beginPath();
  ctx.arc(balle.x+balle.r,balle.y+balle.r,balle.r,0,Math.PI*2); ctx.fill();
  for (let b of briques) {
    if (!b.vivante) continue;
    ctx.fillStyle = b.couleur; ctx.fillRect(b.x,b.y,b.w,b.h);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(b.x+4,b.y+4,b.w-8,6);
  }
  ctx.fillStyle = '#8892b0'; ctx.font = '18px monospace';
  ctx.fillText('Score : ' + score + '  Vies : ' + '♥'.repeat(vies), 16, 32);
  if (gameOver) {
    ctx.fillStyle = '#e94560'; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
    ctx.font = '16px monospace'; ctx.fillStyle = '#8892b0';
    ctx.fillText('Appuyez sur ESPACE pour recommencer', canvas.width/2, canvas.height/2 + 30);
    ctx.textAlign = 'left';
  }
  if (victoire) {
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center';
    ctx.fillText('VOUS GAGNEZ !  Score : ' + score, canvas.width/2, canvas.height/2);
    ctx.font = '16px monospace'; ctx.fillStyle = '#8892b0';
    ctx.fillText('Appuyez sur ESPACE pour recommencer', canvas.width/2, canvas.height/2 + 30);
    ctx.textAlign = 'left';
  }
}`
  },

  {
    name: 'Astéroïdes',
    desc: 'Traversez les astéroïdes ! Flèches pour propulser/tourner, Espace pour tirer.',
    code: `// ASTEROIDES
let vaisseau, balles, asteroides, score, gameOver;

function init() {
  vaisseau = {x:480,y:270,vx:0,vy:0,angle:-Math.PI/2,rayon:12};
  balles = []; score = 0; gameOver = false;
  asteroides = [];
  for (let i = 0; i < 5; i++) {
    let a;
    do {
      a = {x:rand(50,910),y:rand(50,490),vx:rand(-60,60),vy:rand(-60,60),rayon:rand(20,40),pdv:3};
    } while (Math.hypot(a.x-vaisseau.x,a.y-vaisseau.y) < 150);
    asteroides.push(a);
  }
}

function update(dt) {
  if (gameOver) { if (keys.Space) init(); return; }

  if (keys.ArrowUp) { vaisseau.vx += Math.cos(vaisseau.angle) * 200 * dt; vaisseau.vy += Math.sin(vaisseau.angle) * 200 * dt; }
  if (keys.ArrowLeft) vaisseau.angle -= 3 * dt;
  if (keys.ArrowRight) vaisseau.angle += 3 * dt;
  if (keys.Space && balles.length < 8) {
    balles.push({x:vaisseau.x,y:vaisseau.y,vx:Math.cos(vaisseau.angle)*500+vaisseau.vx,vy:Math.sin(vaisseau.angle)*500+vaisseau.vy,duree:2});
    keys.Space = false;
  }

  vaisseau.vx *= 0.99; vaisseau.vy *= 0.99;
  vaisseau.x += vaisseau.vx * dt; vaisseau.y += vaisseau.vy * dt;
  envelopper(vaisseau);
  for (let b of balles) { b.x += b.vx*dt; b.y += b.vy*dt; b.duree -= dt; }
  balles = balles.filter(b => b.duree > 0 && b.x > -50 && b.x < canvas.width+50 && b.y > -50 && b.y < canvas.height+50);

  for (let a of asteroides) {
    a.x += a.vx*dt; a.y += a.vy*dt; envelopper(a);
    for (let b of balles) {
      if (Math.hypot(b.x-a.x,b.y-a.y) < a.rayon) {
        b.duree = -1; a.pdv--;
        if (a.pdv <= 0) eclaterAsteroide(a);
      }
    }
    if (Math.hypot(vaisseau.x-a.x,vaisseau.y-a.y) < a.rayon + vaisseau.rayon) gameOver = true;
  }
  asteroides = asteroides.filter(a => a.pdv > 0);
}

function envelopper(o) {
  if (o.x < -50) o.x = canvas.width+50; if (o.x > canvas.width+50) o.x = -50;
  if (o.y < -50) o.y = canvas.height+50; if (o.y > canvas.height+50) o.y = -50;
}

function eclaterAsteroide(a) {
  score += 100;
  if (a.rayon > 15) {
    asteroides.push({x:a.x,y:a.y,vx:rand(-80,80),vy:rand(-80,80),rayon:a.rayon/1.5,pdv:2});
    asteroides.push({x:a.x,y:a.y,vx:rand(-80,80),vy:rand(-80,80),rayon:a.rayon/1.5,pdv:2});
  }
}

function draw(ctx) {
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,canvas.width,canvas.height);
  for (let a of asteroides) {
    ctx.strokeStyle = '#8892b0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(a.x,a.y,a.rayon,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle = 'rgba(136,146,176,0.1)'; ctx.fill();
  }
  for (let b of balles) { ctx.fillStyle = '#ffd700'; ctx.fillRect(b.x-2,b.y-2,4,4); }
  ctx.save(); ctx.translate(vaisseau.x,vaisseau.y); ctx.rotate(vaisseau.angle);
  ctx.strokeStyle = '#4ecdc4'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(16,0); ctx.lineTo(-10,-8); ctx.lineTo(-6,0); ctx.lineTo(-10,8); ctx.closePath(); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#8892b0'; ctx.font = '18px monospace'; ctx.fillText('Score : ' + score, 16, 32);
  if (gameOver) {
    ctx.fillStyle = '#e94560'; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
    ctx.font = '16px monospace'; ctx.fillStyle = '#8892b0';
    ctx.fillText('Appuyez sur ESPACE pour recommencer', canvas.width/2, canvas.height/2 + 30);
    ctx.textAlign = 'left';
  }
}`
  },

  {
    name: 'Plateforme',
    desc: 'Plateforme simple. Flèches pour se déplacer, Espace pour sauter. Collectez les pièces !',
    code: `// PLATEFORME
let joueur, pieces, plateformes, camera, score;

function init() {
  joueur = {x:50,y:300,w:28,h:32,vx:0,vy:0,auSol:false};
  score = 0;
  plateformes = [
    {x:0,y:520,w:200,h:20},{x:250,y:480,w:150,h:20},{x:450,y:430,w:160,h:20},
    {x:660,y:480,w:160,h:20},{x:870,y:450,w:120,h:20},{x:1050,y:400,w:140,h:20},
    {x:0,y:0,w:50,h:540},{x:1200,y:0,w:50,h:540},{x:0,y:540,w:1250,h:20}
  ];
  pieces = [];
  for (let i = 0; i < 8; i++)
    pieces.push({x:rand(100,1100),y:rand(100,480),w:16,h:16,collee:false});
  camera = {x:0};
}

function update(dt) {
  if (keys.ArrowLeft || keys.KeyA) joueur.vx = -250;
  else if (keys.ArrowRight || keys.KeyD) joueur.vx = 250;
  else joueur.vx *= 0.85;

  if ((keys.Space || keys.KeyW) && joueur.auSol) { joueur.vy = -420; joueur.auSol = false; }

  joueur.vy += 900 * dt;
  if (joueur.vy > 600) joueur.vy = 600;

  joueur.x += joueur.vx * dt;
  joueur.y += joueur.vy * dt;

  joueur.auSol = false;
  for (let p of plateformes) {
    if (rectCollide(joueur, p)) {
      if (joueur.vy > 0 && joueur.y + joueur.h - joueur.vy * dt <= p.y + 4) {
        joueur.y = p.y - joueur.h; joueur.vy = 0; joueur.auSol = true;
      } else if (joueur.vy < 0 && joueur.y - joueur.vy * dt >= p.y + p.h - 4) {
        joueur.y = p.y + p.h; joueur.vy = 0;
      } else {
        if (joueur.vx > 0) joueur.x = p.x - joueur.w;
        else if (joueur.vx < 0) joueur.x = p.x + p.w;
      }
    }
  }

  if (joueur.y > 600) { joueur.x = 50; joueur.y = 300; joueur.vx = 0; joueur.vy = 0; score = 0; }

  for (let c of pieces) {
    if (!c.collee && rectCollide(joueur, c)) { c.collee = true; score++; }
  }

  camera.x = lerp(camera.x, joueur.x - 400, 0.08);
  camera.x = clamp(camera.x, 0, 400);
}

function lerp(a,b,t) { return a+(b-a)*t; }

function draw(ctx) {
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.save(); ctx.translate(-camera.x, 0);

  for (let p of plateformes) {
    ctx.fillStyle = '#16213e'; ctx.fillRect(p.x,p.y,p.w,p.h);
    ctx.fillStyle = '#0f3460'; ctx.fillRect(p.x,p.y,p.w,4);
  }

  for (let c of pieces) {
    if (c.collee) continue;
    ctx.fillStyle = '#ffd700'; ctx.beginPath();
    ctx.arc(c.x+c.w/2,c.y+c.h/2,c.w/2,0,Math.PI*2); ctx.fill();
  }

  ctx.fillStyle = '#4ecdc4'; ctx.fillRect(joueur.x,joueur.y,joueur.w,joueur.h);
  ctx.fillStyle = '#2d9e96'; ctx.fillRect(joueur.x+4,joueur.y+4,joueur.w-8,6);
  ctx.restore();

  ctx.fillStyle = '#fff'; ctx.font = '18px monospace';
  ctx.fillText('Pièces : ' + score + '/8', 16, 32);
  ctx.fillText('← → pour se déplacer  ESPACE pour sauter', 16, 56);
}`
  },

  {
    name: 'Cube 3D',
    desc: 'Un cube rouge en fil de fer qui tourne en 3D. Canvas 2D pur avec projection manuelle.',
    code: `// CUBE 3D EN FIL DE FER
let angleX = 0, angleY = 0;
const V = 140;

const sommets = [
  [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
  [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]
];

const aretes = [
  [0,1],[1,2],[2,3],[3,0],
  [4,5],[5,6],[6,7],[7,4],
  [0,4],[1,5],[2,6],[3,7]
];

function update(dt) {
  angleX += 1.0 * dt;
  angleY += 1.5 * dt;
}

function draw(ctx) {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
  const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
  const cx = canvas.width / 2, cy = canvas.height / 2;

  const projete = sommets.map(([x, y, z]) => {
    let y1 = y*cosX - z*sinX, z1 = y*sinX + z*cosX;
    let x2 = x*cosY + z1*sinY, z2 = -x*sinY + z1*cosY;
    const s = 300 / (300 + z2 * V);
    return [cx + x2*V*s, cy + y1*V*s];
  });

  ctx.strokeStyle = '#e94560';
  ctx.lineWidth = 2.5;
  aretes.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(projete[a][0], projete[a][1]);
    ctx.lineTo(projete[b][0], projete[b][1]);
    ctx.stroke();
  });
}`
  },

  {
    name: 'Cube 3D (Souris)',
    desc: 'Un cube rouge en fil de fer contrôlé par la souris. Déplacez la souris pour tourner.',
    code: `// CUBE 3D — COMMANDE SOURIS
const V = 140;

const sommets = [
  [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
  [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]
];
const aretes = [
  [0,1],[1,2],[2,3],[3,0],
  [4,5],[5,6],[6,7],[7,4],
  [0,4],[1,5],[2,6],[3,7]
];

function update(dt) {}

function draw(ctx) {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const angleX = (mouse.y / canvas.height - 0.5) * Math.PI;
  const angleY = (mouse.x / canvas.width - 0.5) * Math.PI * 2;

  const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
  const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
  const cx = canvas.width / 2, cy = canvas.height / 2;

  const projete = sommets.map(([x, y, z]) => {
    let y1 = y*cosX - z*sinX, z1 = y*sinX + z*cosX;
    let x2 = x*cosY + z1*sinY, z2 = -x*sinY + z1*cosY;
    const s = 300 / (300 + z2 * V);
    return [cx + x2*V*s, cy + y1*V*s];
  });

  ctx.strokeStyle = '#e94560';
  ctx.lineWidth = 2.5;
  aretes.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(projete[a][0], projete[a][1]);
    ctx.lineTo(projete[b][0], projete[b][1]);
    ctx.stroke();
  });
}`
  },

  {
    name: 'StarGlider',
    desc: 'Simulateur de combat spatial 3D en vue cockpit, façon Starglider (1986). Flèches : tangage/roulis (virage en inclinant, comme un avion) • W/S : gaz • Espace : tirer. Radar, bouclier, altitude — évitez le sol et les pyramides. 3 vies, 3 vagues.',
    code: `// STARGLIDER 3D — Simulateur de combat spatial en vue cockpit (remake 1986)
// Vrai moteur 3D : caméra libre (tangage/roulis/lacet), sol en grille fil de fer
// jusqu'à l'horizon, ciel étoilé, chasseurs ennemis avec IA, radar, bouclier.

const W = 960, H = 540, FOVK = 480, NEAR = 3;
const MAX_INCL = 0.85;        // inclinaison max (roulis), en radians
const TAUX_TANGAGE = 1.0;     // vitesse angulaire max de tangage (rad/s)
const FACTEUR_VIRAGE = 1.4;   // le lacet dépend de l'inclinaison (virage à l'avion)
const VIT_MIN = 60, VIT_MAX = 520, VIT_BALLE = 1500, ALT_MIN = 8, ALT_MAX = 650;

const NIVEAUX = [
  { nom:'PATROUILLE', nb:6, vit:90, tir:0.35, boss:false },
  { nom:'EMBUSCADE', nb:9, vit:130, tir:0.6, boss:false },
  { nom:'BATAILLE FINALE', nb:4, vit:160, tir:0.95, boss:true }
];

// ── Modèles 3D fil de fer (nez du vaisseau vers +z local) ──
const MDL_CHASSEUR = {
  v: [[0,0,1.5],[1.6,-0.05,-0.5],[-1.6,-0.05,-0.5],[0.35,0.05,-1.3],[-0.35,0.05,-1.3],[0,0.6,-0.7],[0,-0.3,-0.3]],
  e: [[0,1],[0,2],[1,3],[2,4],[3,4],[3,5],[4,5],[0,5],[0,6],[3,6],[4,6]]
};
const MDL_BOSS = {
  v: [[0,0,2.6],[2.6,0,-0.8],[-2.6,0,-0.8],[1.0,0.1,-2.0],[-1.0,0.1,-2.0],[0,1.3,-1.2],[0,-1.1,-1.2],[1.3,-0.3,0.3],[-1.3,-0.3,0.3]],
  e: [[0,1],[0,2],[1,3],[2,4],[3,4],[3,5],[4,5],[0,5],[3,6],[4,6],[0,6],[0,7],[0,8],[7,1],[8,2],[7,6],[8,6]]
};

// ── État du jeu ──
let pos, yaw, pitch, inclinaison, vitesseTangage, vitesse;
let score, vies, bouclier, niveau, gameOver, victoire, fc, invuln, tirCooldownJ, secousse;
let ballesJ, ballesE, ennemis, particules, etoiles, pyramides, BASE;

// ── Petits utilitaires vectoriels ──
function vCross(a,b) { return { x:a.y*b.z-a.z*b.y, y:a.z*b.x-a.x*b.z, z:a.x*b.y-a.y*b.x }; }
function vNorm(v) { const l=Math.hypot(v.x,v.y,v.z)||1; return { x:v.x/l, y:v.y/l, z:v.z/l }; }

// Base caméra (avant/droite/haut) à partir de yaw/pitch/inclinaison
function calcBase() {
  const cy=Math.cos(yaw), sy=Math.sin(yaw);
  const cp=Math.cos(pitch), sp=Math.sin(pitch);
  const avant = { x:sy*cp, y:sp, z:cy*cp };
  const wUp = { x:0,y:1,z:0 };
  let droite = vNorm(vCross(wUp, avant));
  let haut = vCross(avant, droite);
  const ci=Math.cos(inclinaison), si=Math.sin(inclinaison);
  const d2 = { x:droite.x*ci-haut.x*si, y:droite.y*ci-haut.y*si, z:droite.z*ci-haut.z*si };
  const h2 = { x:droite.x*si+haut.x*ci, y:droite.y*si+haut.y*ci, z:droite.z*si+haut.z*ci };
  return { avant, droite:d2, haut:h2 };
}

// Base locale d'un objet à partir de son vecteur vitesse (le nez suit sa trajectoire)
function baseDepuisVecteur(v) {
  const len = Math.hypot(v.x,v.y,v.z);
  const avant = len>0.01 ? { x:v.x/len, y:v.y/len, z:v.z/len } : { x:0,y:0,z:1 };
  const wUp = { x:0,y:1,z:0 };
  let droite = vCross(wUp, avant);
  const dl = Math.hypot(droite.x,droite.y,droite.z);
  droite = dl>0.001 ? { x:droite.x/dl, y:droite.y/dl, z:droite.z/dl } : { x:1,y:0,z:0 };
  const haut = vCross(avant, droite);
  return { avant, droite, haut };
}

function versCamera(p, base) {
  const rx=p.x-pos.x, ry=p.y-pos.y, rz=p.z-pos.z;
  return {
    x: rx*base.droite.x + ry*base.droite.y + rz*base.droite.z,
    y: rx*base.haut.x + ry*base.haut.y + rz*base.haut.z,
    z: rx*base.avant.x + ry*base.avant.y + rz*base.avant.z
  };
}
function proj(c) { const s=FOVK/c.z; return { x:W/2+c.x*s, y:H/2-c.y*s }; }
function clipNear(cB, cF) {
  const t = (NEAR-cB.z)/(cF.z-cB.z);
  return { x:cB.x+(cF.x-cB.x)*t, y:cB.y+(cF.y-cB.y)*t, z:NEAR };
}
function ligne3D(ctx, base, p1, p2, couleur, largeur) {
  let c1=versCamera(p1,base), c2=versCamera(p2,base);
  if (c1.z<NEAR && c2.z<NEAR) return;
  if (c1.z<NEAR) c1=clipNear(c1,c2); else if (c2.z<NEAR) c2=clipNear(c2,c1);
  const s1=proj(c1), s2=proj(c2);
  ctx.strokeStyle=couleur; ctx.lineWidth=largeur;
  ctx.beginPath(); ctx.moveTo(s1.x,s1.y); ctx.lineTo(s2.x,s2.y); ctx.stroke();
}
function dessinerModele3D(ctx, base, mdl, centre, echelle, orient, couleur, largeur) {
  const pts = mdl.v.map(([x,y,z]) => ({
    x: centre.x + (x*orient.droite.x + y*orient.haut.x + z*orient.avant.x)*echelle,
    y: centre.y + (x*orient.droite.y + y*orient.haut.y + z*orient.avant.y)*echelle,
    z: centre.z + (x*orient.droite.z + y*orient.haut.z + z*orient.avant.z)*echelle
  }));
  for (const [a,b] of mdl.e) ligne3D(ctx, base, pts[a], pts[b], couleur, largeur);
}

function direction3DAleatoire() {
  const th=rand(0,Math.PI*2), ph=Math.acos(rand(-1,1));
  return { x:Math.sin(ph)*Math.cos(th), y:Math.cos(ph), z:Math.sin(ph)*Math.sin(th), tw:rand(0,1) };
}

// ── Génération du monde ──
function creerEnnemi(boss) {
  const b = calcBase();
  const d = rand(700,1700), latx = rand(-600,600), laty = rand(-150,350);
  return {
    x: pos.x + b.avant.x*d + b.droite.x*latx + b.haut.x*laty,
    y: clamp(pos.y + b.avant.y*d + b.droite.y*latx + b.haut.y*laty, 30,420),
    z: pos.z + b.avant.z*d + b.droite.z*latx + b.haut.z*laty,
    vx: rand(-20,20), vy:0, vz:rand(-20,20),
    pdv: boss?16:1, boss: !!boss, tirCd: rand(0.6,1.8)
  };
}
function demarrerNiveau() {
  const n = NIVEAUX[niveau];
  ennemis = [];
  for (let i=0;i<n.nb;i++) ennemis.push(creerEnnemi(false));
  if (n.boss) ennemis.push(creerEnnemi(true));
  invuln = 2.0;
}

function init() {
  pos = { x:0, y:90, z:0 };
  yaw=0; pitch=0; inclinaison=0; vitesseTangage=0; vitesse=220;
  score=0; vies=3; bouclier=100; niveau=0;
  gameOver=false; victoire=false; fc=0; invuln=2.5; tirCooldownJ=0; secousse=0;
  ballesJ=[]; ballesE=[]; ennemis=[]; particules=[];
  etoiles=[]; for (let i=0;i<150;i++) etoiles.push(direction3DAleatoire());
  pyramides=[];
  for (let i=0;i<14;i++) pyramides.push({ x:rand(-1400,1400), z:rand(400,7000), rayon:rand(60,160), hauteur:rand(80,260) });
  demarrerNiveau();
}

function subirDegats(qte) {
  bouclier -= qte; secousse = 0.25;
  if (bouclier<=0) {
    vies--;
    if (vies<=0) { gameOver=true; return; }
    bouclier=100; invuln=2.2; pos.y=Math.max(pos.y,80);
  }
}
function exploser(e) {
  for (let i=0;i<8;i++) particules.push({ x:e.x,y:e.y,z:e.z, vx:rand(-90,90),vy:rand(-60,90),vz:rand(-90,90), vie:rand(0.4,0.8) });
}

// ── Update ──
function update(dt) {
  if (gameOver || victoire) { if (keys.Space) init(); return; }
  fc++;

  // Pilotage : flèches = manche (tangage/roulis), virage à l'avion (dépend de l'inclinaison)
  let cibleIncl = 0;
  if (keys.ArrowLeft) cibleIncl = -MAX_INCL;
  else if (keys.ArrowRight) cibleIncl = MAX_INCL;
  inclinaison += (cibleIncl - inclinaison) * clamp(6*dt,0,1);

  let cibleTangage = 0;
  if (keys.ArrowUp) cibleTangage = TAUX_TANGAGE;
  else if (keys.ArrowDown) cibleTangage = -TAUX_TANGAGE;
  vitesseTangage += (cibleTangage - vitesseTangage) * clamp(8*dt,0,1);
  pitch = clamp(pitch + vitesseTangage*dt, -1.3, 1.3);

  yaw += inclinaison * FACTEUR_VIRAGE * dt;

  if (keys.KeyW) vitesse += 220*dt;
  if (keys.KeyS) vitesse -= 220*dt;
  vitesse = clamp(vitesse, VIT_MIN, VIT_MAX);

  const base = calcBase();
  BASE = base;
  pos.x += base.avant.x*vitesse*dt;
  pos.y += base.avant.y*vitesse*dt;
  pos.z += base.avant.z*vitesse*dt;
  pos.y = Math.min(pos.y, ALT_MAX);

  if (invuln>0) invuln -= dt;

  // Collision avec le sol
  let ecrasement = false;
  if (pos.y < ALT_MIN) { pos.y = ALT_MIN; ecrasement = true; }
  if (ecrasement && invuln<=0) subirDegats(55*dt);
  else if (!gameOver) bouclier = Math.min(100, bouclier + 3*dt);

  // Tir joueur (tir continu tant qu'Espace est maintenu, limité par le temps de recharge)
  tirCooldownJ -= dt;
  if (keys.Space && tirCooldownJ<=0 && ballesJ.length<10) {
    tirCooldownJ = 0.14;
    ballesJ.push({
      x:pos.x+base.avant.x*20, y:pos.y+base.avant.y*20, z:pos.z+base.avant.z*20,
      dx:base.avant.x*VIT_BALLE, dy:base.avant.y*VIT_BALLE, dz:base.avant.z*VIT_BALLE, vie:2.5
    });
  }

  for (const b of ballesJ) { b.x+=b.dx*dt; b.y+=b.dy*dt; b.z+=b.dz*dt; b.vie-=dt; }
  ballesJ = ballesJ.filter(b=>b.vie>0);
  for (const b of ballesE) { b.x+=b.dx*dt; b.y+=b.dy*dt; b.z+=b.dz*dt; b.vie-=dt; }
  ballesE = ballesE.filter(b=>b.vie>0);

  // IA des ennemis : approche, esquive à distance proche, orbite, tir visé
  const n = NIVEAUX[niveau];
  for (const e of ennemis) {
    const dx=pos.x-e.x, dy=pos.y-e.y, dz=pos.z-e.z;
    const dist = Math.hypot(dx,dy,dz)||1;
    const dirx=dx/dist, diry=dy/dist, dirz=dz/dist;
    const pref = e.boss?1000:480;
    let ax,ay,az;
    if (dist < pref*0.55) { ax=-dirx; ay=-diry*0.4; az=-dirz; }
    else if (dist < pref) { ax=-dirz; ay=diry*0.2; az=dirx; }
    else { ax=dirx; ay=diry*0.5; az=dirz; }
    const acc = e.boss?55:120;
    e.vx += ax*acc*dt; e.vy += ay*acc*dt; e.vz += az*acc*dt;
    const vl = Math.hypot(e.vx,e.vy,e.vz), vmax = n.vit;
    if (vl>vmax) { e.vx=e.vx/vl*vmax; e.vy=e.vy/vl*vmax; e.vz=e.vz/vl*vmax; }
    e.x+=e.vx*dt; e.y+=e.vy*dt; e.z+=e.vz*dt;
    e.y = clamp(e.y, 20, 500);

    e.tirCd -= dt;
    if (dist < (e.boss?1500:950) && e.tirCd<=0) {
      e.tirCd = rand(0.7,1.6) / n.tir;
      ballesE.push({ x:e.x,y:e.y,z:e.z, dx:dirx*360,dy:diry*360,dz:dirz*360, vie:3.2 });
      if (e.boss && Math.random()<0.5) ballesE.push({ x:e.x,y:e.y,z:e.z, dx:dirx*360,dy:diry*360,dz:dirz*360, vie:3.2 });
    }
  }

  // Collisions tirs joueur → ennemis
  for (const b of ballesJ) {
    for (const e of ennemis) {
      if (e.pdv<=0) continue;
      if (Math.hypot(b.x-e.x,b.y-e.y,b.z-e.z) < (e.boss?55:32)) {
        b.vie=-1; e.pdv--;
        if (e.pdv<=0) { score += e.boss?800:120; exploser(e); }
      }
    }
  }
  ballesJ = ballesJ.filter(b=>b.vie>0);
  ennemis = ennemis.filter(e=>e.pdv>0);

  // Collisions tirs ennemis / ennemis (tamponnage) → joueur
  if (invuln<=0 && !gameOver) {
    for (const b of ballesE) {
      if (Math.hypot(b.x-pos.x,b.y-pos.y,b.z-pos.z) < 26) { b.vie=-1; subirDegats(18); }
    }
    ballesE = ballesE.filter(b=>b.vie>0);
    for (const e of ennemis) {
      if (Math.hypot(e.x-pos.x,e.y-pos.y,e.z-pos.z) < (e.boss?70:38)) {
        subirDegats(e.boss?40:25); if (!e.boss) { e.pdv=0; score+=20; }
      }
    }
    ennemis = ennemis.filter(e=>e.pdv>0);
  }

  // Collisions avec les pyramides (obstacles au sol)
  if (invuln<=0 && !gameOver) {
    for (const p of pyramides) {
      const ddx=pos.x-p.x, ddz=pos.z-p.z, dhz=Math.hypot(ddx,ddz);
      if (dhz < p.rayon && pos.y < p.hauteur) {
        const push = p.rayon-dhz+8;
        const ux = dhz>0.01?ddx/dhz:1, uz = dhz>0.01?ddz/dhz:0;
        pos.x += ux*push; pos.z += uz*push;
        subirDegats(30); vitesse *= 0.5;
      }
    }
  }
  if (gameOver) return;

  for (const pt of particules) { pt.x+=pt.vx*dt; pt.y+=pt.vy*dt; pt.z+=pt.vz*dt; pt.vie-=dt; }
  particules = particules.filter(p=>p.vie>0);
  if (secousse>0) secousse -= dt;

  if (ennemis.length===0) {
    niveau++;
    if (niveau>=NIVEAUX.length) victoire=true; else demarrerNiveau();
  }
}

// ── Rendu ──
function dessinerEtoiles(ctx, base) {
  for (const s of etoiles) {
    const p = { x:pos.x+s.x*2000, y:pos.y+s.y*2000, z:pos.z+s.z*2000 };
    const c = versCamera(p, base);
    if (c.z<NEAR) continue;
    const sc = proj(c);
    if (sc.x<-10||sc.x>W+10||sc.y<-10||sc.y>H+10) continue;
    const taille = 1+s.tw*1.2;
    ctx.fillStyle = 'rgba(200,215,255,'+(0.35+s.tw*0.55)+')';
    ctx.fillRect(sc.x, sc.y, taille, taille);
  }
}
function dessinerGrille(ctx, base) {
  const pas=160, portee=14;
  const ox=Math.floor(pos.x/pas)*pas, oz=Math.floor(pos.z/pas)*pas, lim=pas*portee;
  const couleur='rgba(78,205,196,0.16)';
  for (let i=-portee;i<=portee;i++) { const x=ox+i*pas; ligne3D(ctx,base,{x,y:0,z:oz-lim},{x,y:0,z:oz+lim},couleur,1); }
  for (let i=-portee;i<=portee;i++) { const z=oz+i*pas; ligne3D(ctx,base,{x:ox-lim,y:0,z},{x:ox+lim,y:0,z},couleur,1); }
}
function dessinerPyramide(ctx, base, p) {
  const r=p.rayon, h=p.hauteur;
  const c=[{x:p.x-r,y:0,z:p.z-r},{x:p.x+r,y:0,z:p.z-r},{x:p.x+r,y:0,z:p.z+r},{x:p.x-r,y:0,z:p.z+r}];
  const apex={x:p.x,y:h,z:p.z}, couleur='rgba(120,140,200,0.55)';
  ligne3D(ctx,base,c[0],c[1],couleur,1.5); ligne3D(ctx,base,c[1],c[2],couleur,1.5);
  ligne3D(ctx,base,c[2],c[3],couleur,1.5); ligne3D(ctx,base,c[3],c[0],couleur,1.5);
  for (const pt of c) ligne3D(ctx,base,pt,apex,couleur,1.5);
}
function dessinerReticule(ctx, base) {
  let verrouille=false, distCible=null;
  for (const e of ennemis) {
    const c = versCamera(e, base);
    if (c.z<NEAR) continue;
    const s = proj(c);
    if (Math.hypot(s.x-W/2,s.y-H/2)<38 && (distCible===null||c.z<distCible)) { verrouille=true; distCible=c.z; }
  }
  const cx=W/2, cy=H/2;
  ctx.strokeStyle = verrouille?'#ffd700':'rgba(78,205,196,0.85)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(cx,cy,16,0,Math.PI*2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx-26,cy); ctx.lineTo(cx-10,cy); ctx.moveTo(cx+10,cy); ctx.lineTo(cx+26,cy);
  ctx.moveTo(cx,cy-26); ctx.lineTo(cx,cy-10); ctx.moveTo(cx,cy+10); ctx.lineTo(cx,cy+26);
  ctx.stroke();
  if (verrouille) {
    ctx.fillStyle='#ffd700'; ctx.font='12px monospace'; ctx.textAlign='center';
    ctx.fillText('CIBLE : '+Math.round(distCible)+'m', cx, cy+42);
    ctx.textAlign='left';
  }
}
function dessinerRadar(ctx) {
  const cx=W/2, cy=H-70, rad=55;
  ctx.save(); ctx.globalAlpha=0.85;
  ctx.fillStyle='rgba(10,15,30,0.6)'; ctx.beginPath(); ctx.arc(cx,cy,rad,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(78,205,196,0.5)'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-rad,cy); ctx.lineTo(cx+rad,cy); ctx.moveTo(cx,cy-rad); ctx.lineTo(cx,cy+rad);
  ctx.strokeStyle='rgba(78,205,196,0.15)'; ctx.stroke();
  ctx.fillStyle='#4ecdc4'; ctx.beginPath(); ctx.moveTo(cx,cy-6); ctx.lineTo(cx-4,cy+4); ctx.lineTo(cx+4,cy+4); ctx.closePath(); ctx.fill();
  const portee=1600;
  for (const e of ennemis) {
    const dx=e.x-pos.x, dz=e.z-pos.z, dist=Math.hypot(dx,dz);
    if (dist>portee) continue;
    const rx = dx*Math.cos(yaw) - dz*Math.sin(yaw);
    const rz = dx*Math.sin(yaw) + dz*Math.cos(yaw);
    const px = cx+(rx/portee)*rad, py = cy-(rz/portee)*rad;
    ctx.fillStyle = e.boss?'#ffd700':'#e94560';
    ctx.beginPath(); ctx.arc(px,py,e.boss?4:2.5,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}
function dessinerHUD(ctx) {
  ctx.fillStyle='#8892b0'; ctx.font='16px monospace';
  ctx.fillText('SCORE : '+score, 14, 24);
  ctx.fillText('VIES : '+'♥'.repeat(Math.max(0,vies)), 14, 46);
  ctx.fillStyle='#222'; ctx.fillRect(14,58,140,10);
  ctx.fillStyle = bouclier>40?'#4ecdc4':'#e94560';
  ctx.fillRect(14,58,140*clamp(bouclier,0,100)/100,10);
  ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.strokeRect(14,58,140,10);
  ctx.fillStyle='#8892b0'; ctx.font='11px monospace'; ctx.fillText('BOUCLIER', 14, 82);

  ctx.textAlign='right'; ctx.font='14px monospace'; ctx.fillStyle='#8892b0';
  ctx.fillText('VITESSE : '+Math.round(vitesse), W-14, 24);
  ctx.fillText('ALTITUDE : '+Math.round(pos.y), W-14, 44);
  ctx.textAlign='left';

  ctx.textAlign='center';
  ctx.fillStyle='#ffd700'; ctx.font='bold 18px monospace';
  ctx.fillText(NIVEAUX[Math.min(niveau,NIVEAUX.length-1)].nom, W/2, 24);
  ctx.fillStyle='#4ecdc4'; ctx.font='12px monospace';
  ctx.fillText('NIVEAU '+(niveau+1)+'/'+NIVEAUX.length, W/2, 40);
  ctx.font='11px monospace'; ctx.fillStyle='#8892b0';
  ctx.fillText('FLÈCHES : Pilotage   W/S : Gaz   ESPACE : Tirer', W/2, H-14);
  ctx.textAlign='left';

  if (pos.y<=ALT_MIN+1 && !gameOver && !victoire) {
    ctx.fillStyle = (fc%20<10)?'#e94560':'#ffd700';
    ctx.font='bold 16px monospace'; ctx.textAlign='center';
    ctx.fillText('⚠ ALTITUDE CRITIQUE ⚠', W/2, H-100);
    ctx.textAlign='left';
  }
}
function dessinerFin(ctx, gagne) {
  ctx.fillStyle='rgba(0,0,0,0.65)'; ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';
  ctx.fillStyle = gagne?'#ffd700':'#e94560'; ctx.font='bold 42px monospace';
  ctx.fillText(gagne?'VICTOIRE !':'GAME OVER', W/2, H/2-20);
  ctx.fillStyle='#8892b0'; ctx.font='18px monospace';
  ctx.fillText('Score final : '+score, W/2, H/2+20);
  ctx.font='14px monospace';
  ctx.fillText('ESPACE pour recommencer', W/2, H/2+55);
  ctx.textAlign='left';
}

function draw(ctx) {
  const base = BASE || calcBase();
  ctx.save();
  if (secousse>0) ctx.translate(rand(-4,4)*secousse*3, rand(-4,4)*secousse*3);

  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#03030c'); g.addColorStop(0.55,'#060616'); g.addColorStop(1,'#0a0a22');
  ctx.fillStyle=g; ctx.fillRect(-20,-20,W+40,H+40);

  dessinerEtoiles(ctx, base);
  dessinerGrille(ctx, base);
  for (const p of pyramides) if (Math.hypot(p.x-pos.x,p.z-pos.z) < 3200) dessinerPyramide(ctx, base, p);

  for (const e of ennemis) {
    const orient = baseDepuisVecteur({x:e.vx,y:e.vy,z:e.vz});
    dessinerModele3D(ctx, base, e.boss?MDL_BOSS:MDL_CHASSEUR, e, e.boss?46:22, orient, e.boss?'#ffd700':'#ff6b6b', e.boss?2.5:1.8);
  }

  for (const b of ballesE) ligne3D(ctx, base, {x:b.x,y:b.y,z:b.z}, {x:b.x-b.dx*0.03,y:b.y-b.dy*0.03,z:b.z-b.dz*0.03}, '#ff4d6d', 2.5);
  for (const b of ballesJ) ligne3D(ctx, base, {x:b.x,y:b.y,z:b.z}, {x:b.x-b.dx*0.025,y:b.y-b.dy*0.025,z:b.z-b.dz*0.025}, '#ffd700', 2.5);
  for (const pt of particules) ligne3D(ctx, base, {x:pt.x,y:pt.y,z:pt.z}, {x:pt.x-pt.vx*0.04,y:pt.y-pt.vy*0.04,z:pt.z-pt.vz*0.04}, 'rgba(255,180,90,'+clamp(pt.vie,0,1)+')', 1.5);

  ctx.restore();

  dessinerReticule(ctx, base);
  dessinerRadar(ctx);
  dessinerHUD(ctx);
  if (gameOver) dessinerFin(ctx, false);
  if (victoire) dessinerFin(ctx, true);
}`
  },

  {
    name: 'Tortue Logo',
    desc: 'Mini-interpréteur du langage Logo (1967), avec un panneau de commande CreateJS dessiné directement sur le canvas : choisis une forme, tape et exécute ton propre programme (ex. REPETE 3 [ AV 2 TD 144 ]), trace/aller vers des coordonnées x,y, lève/baisse le crayon, efface, ou clique sur le dessin pour y envoyer la tortue.',
    code: `// TORTUE LOGO — mini-interpréteur inspiré du langage Logo (1967)
// Panneau de commande dessiné avec CreateJS, directement sur le canvas de la scène
// (aucune interface HTML dans l'app — tout est ici, dans le code de la démo).
// Les champs de coordonnées X/Y et le champ de programme sont de vrais
// <input>/<select> HTML, posés au-dessus du canvas et calés sur lui : CreateJS
// ne sait pas dessiner une vraie zone de texte, donc on triche avec de vrais
// éléments de formulaire superposés. Tracer force le crayon baissé jusqu'à ce
// point, Aller force le crayon levé.

const ALIASES = {
  AVANCE: 'fwd', AV: 'fwd', FORWARD: 'fwd', FD: 'fwd',
  RECULE: 'bwd', RE: 'bwd', BACK: 'bwd', BK: 'bwd',
  TOURNEDROITE: 'right', TD: 'right', RIGHT: 'right', RT: 'right',
  TOURNEGAUCHE: 'left', TG: 'left', LEFT: 'left', LT: 'left',
  LEVECRAYON: 'penup', LC: 'penup', PENUP: 'penup', PU: 'penup',
  BAISSECRAYON: 'pendown', BC: 'pendown', PENDOWN: 'pendown', PD: 'pendown',
  VIDEECRAN: 'clear', EFFACE: 'clear', VE: 'clear', CLEARSCREEN: 'clear', CS: 'clear',
  ORIGINE: 'home', HOME: 'home',
  COULEUR: 'color', COLOR: 'color',
  EPAISSEUR: 'width', SETWIDTH: 'width',
  CACHETORTUE: 'hideturtle', HIDETURTLE: 'hideturtle', HT: 'hideturtle',
  MONTRETORTUE: 'showturtle', SHOWTURTLE: 'showturtle', ST: 'showturtle',
  REPETE: 'repeat', REPEAT: 'repeat'
};
const NUMERIC = { fwd: 1, bwd: 1, right: 1, left: 1, width: 1 };
const NOMS_COULEUR = { rouge: '#e94560', bleu: '#4ecdc4', vert: '#95e1d3', jaune: '#ffd700', orange: '#ff9a3c', violet: '#aa96da', blanc: '#eeeeee' };

function tokenize(src) {
  return src.replace(/\\[/g, ' [ ').replace(/\\]/g, ' ] ').split(/\\s+/).filter(Boolean);
}

function parse(tokens) {
  let i = 0;
  function bloc(dansCrochet) {
    const noeuds = [];
    while (i < tokens.length) {
      const tok = tokens[i];
      if (tok === ']') {
        if (dansCrochet) { i++; return noeuds; }
        throw new Error('crochet "]" inattendu');
      }
      const cle = ALIASES[tok.toUpperCase()];
      if (!cle) throw new Error('commande inconnue : ' + tok);
      i++;
      if (cle === 'repeat') {
        const n = parseInt(tokens[i], 10); i++;
        if (tokens[i] !== '[') throw new Error('REPETE attend "["');
        i++;
        const corps = bloc(true);
        noeuds.push({ type: 'repeat', count: Math.max(0, Math.min(2000, n || 0)), body: corps });
      } else if (cle === 'color') {
        noeuds.push({ type: 'color', value: tokens[i] }); i++;
      } else if (NUMERIC[cle]) {
        noeuds.push({ type: cle, value: parseFloat(tokens[i]) }); i++;
      } else {
        noeuds.push({ type: cle });
      }
    }
    if (dansCrochet) throw new Error('crochet "]" manquant');
    return noeuds;
  }
  return bloc(false);
}

function walk(noeuds) {
  const out = [];
  (function collecter(liste) {
    for (const n of liste) {
      if (n.type === 'repeat') for (let r = 0; r < n.count; r++) collecter(n.body);
      else out.push(n);
    }
  })(noeuds);
  return out;
}

function spiraleCode() {
  const lignes = [];
  for (let i = 1; i <= 22; i++) lignes.push('AV ' + (10 + i * 5) + ' TD 91');
  return lignes.join(' ');
}

const MOTIFS = [
  { nom: 'Carré', code: 'REPETE 4 [ AV 100 TD 90 ]', couleur: '#4ecdc4' },
  { nom: 'Triangle', code: 'REPETE 3 [ AV 130 TD 120 ]', couleur: '#ffd700' },
  { nom: 'Hexagone', code: 'REPETE 6 [ AV 90 TD 60 ]', couleur: '#e94560' },
  { nom: 'Étoile', code: 'REPETE 5 [ AV 160 TD 144 ]', couleur: '#95e1d3' },
  { nom: 'Fleur', code: 'REPETE 36 [ REPETE 4 [ AV 55 TD 90 ] TD 10 ]', couleur: '#ff9a3c' },
  { nom: 'Spirale', code: spiraleCode(), legende: 'AV (croissant) TD 91 — répété 22 fois', couleur: '#aa96da' }
];

const VITESSE_AV = 260;
const VITESSE_ROT = 260;
const PAUSE_FIN = 1.6;
const HUD_TOP = 414; // le panneau (CreateJS + inputs HTML) occupe la bande du bas
const RANGEE2_Y = 40; // rangée Tracer/Aller, relative au panneau

let encre, encreCtx;
let tortue;
let file, fi, mouvement, motifActuel, termine, minuteur;
let fileManuelle = [], mouvementManuel = null, modeAuto = true;
let programmePerso = null, erreurMessage = '';
let stage, texteLabelCrayon, texteLabelPause, texteCoords;
let overlay, champX, champY, observateur, gestionnaireResize;

function creerCommande(cmd) {
  if (cmd.type === 'fwd' || cmd.type === 'bwd') {
    const dist = cmd.type === 'bwd' ? -cmd.value : cmd.value;
    const rad = tortue.cap * Math.PI / 180;
    const x1 = tortue.x + Math.sin(rad) * dist, y1 = tortue.y + Math.cos(rad) * dist;
    return { type: 'avance', x0: tortue.x, y0: tortue.y, x1, y1, total: Math.abs(dist), fait: 0, couleur: tortue.couleur, epaisseur: tortue.epaisseur, crayon: tortue.crayonBaisse };
  }
  if (cmd.type === 'right' || cmd.type === 'left') {
    const delta = cmd.type === 'right' ? cmd.value : -cmd.value;
    return { type: 'tourne', depart: tortue.cap, delta, fait: 0, total: Math.abs(delta) };
  }
  appliquerInstantane(cmd);
  return null;
}

function appliquerInstantane(cmd) {
  switch (cmd.type) {
    case 'penup': tortue.crayonBaisse = false; break;
    case 'pendown': tortue.crayonBaisse = true; break;
    case 'clear': encreCtx.clearRect(0, 0, encre.width, encre.height); break;
    case 'home': tortue.x = 0; tortue.y = 0; tortue.cap = 0; break;
    case 'color': tortue.couleur = NOMS_COULEUR[String(cmd.value).toLowerCase()] || cmd.value; break;
    case 'width': tortue.epaisseur = clamp(cmd.value, 1, 12); break;
    case 'hideturtle': tortue.visible = false; break;
    case 'showturtle': tortue.visible = true; break;
  }
}

function avancerCommande(m, dt) {
  if (m.type === 'avance') {
    m.fait = Math.min(m.total, m.fait + VITESSE_AV * dt);
    const t = m.total === 0 ? 1 : m.fait / m.total;
    const nx = m.x0 + (m.x1 - m.x0) * t, ny = m.y0 + (m.y1 - m.y0) * t;
    if (m.crayon) tracerSegment(tortue.x, tortue.y, nx, ny, m.couleur, m.epaisseur);
    tortue.x = nx; tortue.y = ny;
    return m.fait >= m.total;
  }
  m.fait = Math.min(m.total, m.fait + VITESSE_ROT * dt);
  const t = m.total === 0 ? 1 : m.fait / m.total;
  tortue.cap = m.depart + m.delta * t;
  return m.fait >= m.total;
}

function creerCommandeManuelle(cmd) {
  // cmd.dessiner force le tracé (bouton Tracer) ou son absence (bouton
  // Aller), sans changer l'état persistant du crayon. Un clic sur le
  // dessin (sans dessiner défini) respecte l'état actuel du crayon.
  const dessiner = cmd.dessiner !== undefined ? cmd.dessiner : tortue.crayonBaisse;
  return { type: 'avance', x0: tortue.x, y0: tortue.y, x1: cmd.x, y1: cmd.y, total: Math.hypot(cmd.x - tortue.x, cmd.y - tortue.y), fait: 0, couleur: tortue.couleur, epaisseur: tortue.epaisseur, crayon: dessiner };
}

function versEcran(x, y) { return [canvas.width / 2 + x, canvas.height / 2 - y]; }

function tracerSegment(x0, y0, x1, y1, couleur, epaisseur) {
  const a = versEcran(x0, y0), b = versEcran(x1, y1);
  encreCtx.strokeStyle = couleur; encreCtx.lineWidth = epaisseur;
  encreCtx.lineCap = 'round'; encreCtx.lineJoin = 'round';
  encreCtx.beginPath(); encreCtx.moveTo(a[0], a[1]); encreCtx.lineTo(b[0], b[1]); encreCtx.stroke();
}

function chargerMotif(index) {
  motifActuel = ((index % MOTIFS.length) + MOTIFS.length) % MOTIFS.length;
  programmePerso = null; erreurMessage = '';
  const m = MOTIFS[motifActuel];
  file = walk(parse(tokenize(m.code)));
  fi = 0; mouvement = null; termine = false; minuteur = 0;
  fileManuelle = []; mouvementManuel = null; modeAuto = true;
  encreCtx.clearRect(0, 0, encre.width, encre.height);
  tortue = { x: 0, y: 0, cap: 0, crayonBaisse: true, couleur: m.couleur, epaisseur: 3, visible: true };
}

function chargerProgrammePerso(texte) {
  let programme;
  try {
    programme = walk(parse(tokenize(texte)));
    erreurMessage = '';
  } catch (e) {
    erreurMessage = e.message;
    return;
  }
  programmePerso = texte;
  file = programme;
  fi = 0; mouvement = null; termine = false; minuteur = 0;
  fileManuelle = []; mouvementManuel = null; modeAuto = true;
  encreCtx.clearRect(0, 0, encre.width, encre.height);
  tortue = { x: 0, y: 0, cap: 0, crayonBaisse: true, couleur: '#4ecdc4', epaisseur: 3, visible: true };
}

// ── Panneau CreateJS (rangée 1 : formes, crayon, effacer, pause, coords) ──

function creerBouton(parent, label, x, y, largeurMin, onClick) {
  const pad = 10, hauteur = 26;
  const txt = new createjs.Text(label, 'bold 12px monospace', '#ffffff');
  txt.textAlign = 'center';
  txt.textBaseline = 'middle';
  const largeur = Math.max(largeurMin || 0, txt.getMeasuredWidth() + pad * 2);
  const fond = new createjs.Shape();
  fond.graphics.beginFill('rgba(255,255,255,0.12)').drawRoundRect(0, 0, largeur, hauteur, 6);
  txt.x = largeur / 2;
  txt.y = hauteur / 2;
  const cont = new createjs.Container();
  cont.addChild(fond, txt);
  cont.x = x; cont.y = y;
  cont.cursor = 'pointer';
  cont.on('click', onClick);
  parent.addChild(cont);
  return { cont, fond, txt, largeur, hauteur };
}

function construirePanneauCreateJS() {
  const panneau = new createjs.Container();
  panneau.x = 0; panneau.y = HUD_TOP;

  const fond = new createjs.Shape();
  fond.graphics.beginFill('rgba(10,10,20,0.82)').drawRect(0, 0, canvas.width, canvas.height - HUD_TOP);
  panneau.addChild(fond);

  let x = 10;
  const y1 = 8;

  MOTIFS.forEach((m, i) => {
    const b = creerBouton(panneau, m.nom, x, y1, 0, () => chargerMotif(i));
    x += b.largeur + 6;
  });

  x += 8;
  const boutonCrayon = creerBouton(panneau, '', x, y1, 96, () => {
    tortue.crayonBaisse = !tortue.crayonBaisse;
  });
  texteLabelCrayon = boutonCrayon.txt;
  x += boutonCrayon.largeur + 8;

  const b = creerBouton(panneau, 'Effacer', x, y1, 0, () => {
    encreCtx.clearRect(0, 0, encre.width, encre.height);
    tortue.x = 0; tortue.y = 0; tortue.cap = 0;
    fileManuelle = []; mouvementManuel = null;
    modeAuto = false;
  });
  x += b.largeur + 8;

  const boutonPause = creerBouton(panneau, '', x, y1, 34, () => {
    modeAuto = !modeAuto;
  });
  texteLabelPause = boutonPause.txt;

  texteCoords = new createjs.Text('', '12px monospace', '#cfd8dc');
  texteCoords.textAlign = 'right';
  texteCoords.textBaseline = 'middle';
  texteCoords.x = canvas.width - 10;
  texteCoords.y = y1 + 13;
  panneau.addChild(texteCoords);

  stage.addChild(panneau);
}

// ── Rangée 2 : vrais <input> HTML pour Tracer / Aller, calés sur le canvas ──

function creerChampNombre(valeur, largeur) {
  const input = document.createElement('input');
  input.type = 'number';
  input.value = String(valeur);
  input.style.cssText = 'width:' + largeur + 'px;height:26px;padding:0 6px;border-radius:5px;' +
    'border:1px solid rgba(255,255,255,0.25);background:rgba(255,255,255,0.1);color:#fff;' +
    'font:12px monospace;box-sizing:border-box;text-align:center;';
  return input;
}

function creerBoutonHTML(label) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.style.cssText = 'height:26px;padding:0 12px;border-radius:6px;border:1px solid rgba(255,255,255,0.2);' +
    'background:rgba(255,255,255,0.1);color:#fff;font:bold 12px monospace;cursor:pointer;box-sizing:border-box;';
  b.addEventListener('mouseenter', () => { b.style.background = '#6aaf6a'; b.style.borderColor = '#6aaf6a'; });
  b.addEventListener('mouseleave', () => { b.style.background = 'rgba(255,255,255,0.1)'; b.style.borderColor = 'rgba(255,255,255,0.2)'; });
  return b;
}

function creerEtiquette(texte) {
  const s = document.createElement('span');
  s.textContent = texte;
  s.style.cssText = 'color:rgba(255,255,255,0.6);font:11px monospace;';
  return s;
}

function construireSaisiesHTML() {
  const wrapper = canvas.parentElement;
  if (!wrapper) return;
  if (getComputedStyle(wrapper).position === 'static') wrapper.style.position = 'relative';

  overlay = document.createElement('div');
  overlay.style.cssText = 'position:absolute;display:flex;flex-direction:column;gap:8px;' +
    'transform-origin:top left;z-index:6;';

  // Rangée A — Un seul jeu de coordonnées X/Y, utilisé par les deux
  // boutons : Tracer force le crayon baissé (dessine jusqu'à ce point),
  // Aller force le crayon levé (s'y déplace sans rien dessiner) — sans
  // toucher à l'état persistant du crayon (le bouton Crayon garde son
  // propre état).
  const rangeeDeplacement = document.createElement('div');
  rangeeDeplacement.style.cssText = 'display:flex;align-items:center;gap:6px;';

  champX = creerChampNombre(100, 54);
  champY = creerChampNombre(0, 54);

  const boutonTracer = creerBoutonHTML('Tracer');
  boutonTracer.title = 'Trace un trait jusqu’à ces coordonnées';
  boutonTracer.addEventListener('click', () => {
    modeAuto = false;
    fileManuelle.push({ type: 'goto', x: Number(champX.value) || 0, y: Number(champY.value) || 0, dessiner: true });
  });

  const boutonAller = creerBoutonHTML('Aller');
  boutonAller.title = 'Déplace la tortue sans dessiner';
  boutonAller.addEventListener('click', () => {
    modeAuto = false;
    fileManuelle.push({ type: 'goto', x: Number(champX.value) || 0, y: Number(champY.value) || 0, dessiner: false });
  });

  rangeeDeplacement.appendChild(creerEtiquette('X'));
  rangeeDeplacement.appendChild(champX);
  rangeeDeplacement.appendChild(creerEtiquette('Y'));
  rangeeDeplacement.appendChild(champY);
  rangeeDeplacement.appendChild(boutonTracer);
  rangeeDeplacement.appendChild(boutonAller);

  // Rangée B — un vrai programme Logo tapé au clavier (ex. "REPETE 3
  // [ AV 2 TD 144 ]"), avec une liste déroulante d'exemples à charger
  // dans le champ avant de l'exécuter.
  const rangeeProgramme = document.createElement('div');
  rangeeProgramme.style.cssText = 'display:flex;align-items:center;gap:6px;';

  const selecteur = document.createElement('select');
  selecteur.title = 'Charger un exemple dans le champ';
  selecteur.style.cssText = 'height:26px;padding:0 4px;border-radius:5px;' +
    'border:1px solid rgba(255,255,255,0.25);background:rgba(255,255,255,0.1);color:#fff;' +
    'font:12px monospace;box-sizing:border-box;';
  MOTIFS.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = m.nom;
    // Le <select> hérite ce style à l'état fermé, mais la liste déroulante
    // (rendue par le navigateur/l'OS) ignore souvent le fond translucide du
    // parent — sans ceci elle retombe sur un fond blanc, avec un texte
    // blanc devenu illisible.
    opt.style.cssText = 'background:#16213e;color:#fff;';
    selecteur.appendChild(opt);
  });

  const champProgramme = document.createElement('input');
  champProgramme.type = 'text';
  champProgramme.value = MOTIFS[0].code;
  champProgramme.title = 'Un programme Logo, ex. REPETE 3 [ AV 2 TD 144 ]';
  champProgramme.style.cssText = 'width:360px;height:26px;padding:0 8px;border-radius:5px;' +
    'border:1px solid rgba(255,255,255,0.25);background:rgba(255,255,255,0.1);color:#fff;' +
    'font:12px monospace;box-sizing:border-box;';

  selecteur.addEventListener('change', () => {
    champProgramme.value = MOTIFS[Number(selecteur.value)].code;
  });

  const boutonLancer = creerBoutonHTML('Exécuter');
  boutonLancer.title = 'Lance ce programme';
  boutonLancer.addEventListener('click', () => {
    chargerProgrammePerso(champProgramme.value);
  });
  champProgramme.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') chargerProgrammePerso(champProgramme.value);
  });

  rangeeProgramme.appendChild(creerEtiquette('Prog'));
  rangeeProgramme.appendChild(selecteur);
  rangeeProgramme.appendChild(champProgramme);
  rangeeProgramme.appendChild(boutonLancer);

  overlay.appendChild(rangeeDeplacement);
  overlay.appendChild(rangeeProgramme);

  wrapper.appendChild(overlay);

  positionnerSaisiesHTML();
  if (typeof ResizeObserver !== 'undefined') {
    observateur = new ResizeObserver(positionnerSaisiesHTML);
    observateur.observe(canvas);
  }
  gestionnaireResize = positionnerSaisiesHTML;
  window.addEventListener('resize', gestionnaireResize);
}

function positionnerSaisiesHTML() {
  if (!overlay || !canvas.parentElement) return;
  const rectCanvas = canvas.getBoundingClientRect();
  const rectParent = canvas.parentElement.getBoundingClientRect();
  const echelle = rectCanvas.width / canvas.width;
  overlay.style.left = (rectCanvas.left - rectParent.left + 10 * echelle) + 'px';
  overlay.style.top = (rectCanvas.top - rectParent.top + (HUD_TOP + RANGEE2_Y) * echelle) + 'px';
  overlay.style.transform = 'scale(' + echelle + ')';
}

function nettoyerSaisiesHTML() {
  if (observateur) { observateur.disconnect(); observateur = null; }
  if (gestionnaireResize) { window.removeEventListener('resize', gestionnaireResize); gestionnaireResize = null; }
  if (overlay && overlay.remove) { overlay.remove(); }
  overlay = null;
}

function init() {
  encre = document.createElement('canvas');
  encre.width = canvas.width; encre.height = canvas.height;
  encreCtx = encre.getContext('2d');

  if (canvas.__turtleStage) {
    try { canvas.__turtleStage.enableDOMEvents(false); } catch (e) {}
  }
  stage = new createjs.Stage(canvas);
  stage.autoClear = false;
  stage.enableMouseOver(20);
  canvas.__turtleStage = stage;

  stage.on('stagemousedown', (evt) => {
    if (evt.stageY >= HUD_TOP) return;
    modeAuto = false;
    fileManuelle.push({ type: 'goto', x: evt.stageX - canvas.width / 2, y: canvas.height / 2 - evt.stageY });
  });

  construirePanneauCreateJS();
  construireSaisiesHTML();
  chargerMotif(0);
}

function destroy() {
  if (canvas.__turtleStage) {
    try { canvas.__turtleStage.enableDOMEvents(false); } catch (e) {}
    canvas.__turtleStage = null;
  }
  nettoyerSaisiesHTML();
}

function update(dt) {
  for (let k = 1; k <= 6; k++) {
    const touche = 'Digit' + k;
    if (keys[touche]) { keys[touche] = false; chargerMotif(k - 1); }
  }
  if (keys.Space) {
    keys.Space = false;
    if (programmePerso) chargerProgrammePerso(programmePerso);
    else chargerMotif(motifActuel);
  }

  if (texteLabelCrayon) texteLabelCrayon.text = tortue.crayonBaisse ? 'Crayon : bas' : 'Crayon : haut';
  if (texteLabelPause) texteLabelPause.text = modeAuto ? '⏸' : '▶';
  if (texteCoords) {
    const cap = Math.round(((tortue.cap % 360) + 360) % 360);
    texteCoords.text = 'X ' + Math.round(tortue.x) + '   Y ' + Math.round(tortue.y) + '   CAP ' + cap + '°';
  }

  if (!mouvementManuel && fileManuelle.length) {
    mouvementManuel = creerCommandeManuelle(fileManuelle.shift());
  }
  if (mouvementManuel) {
    if (avancerCommande(mouvementManuel, dt)) mouvementManuel = null;
    return;
  }

  if (!modeAuto) return;

  if (termine) {
    minuteur -= dt;
    // Un programme personnalisé ne s'enchaîne pas automatiquement sur le
    // motif suivant : il reste affiché, terminé, jusqu'à une nouvelle action.
    if (minuteur <= 0 && !programmePerso) chargerMotif(motifActuel + 1);
    return;
  }

  while (!mouvement) {
    if (fi >= file.length) { termine = true; minuteur = PAUSE_FIN; return; }
    mouvement = creerCommande(file[fi++]);
  }
  if (avancerCommande(mouvement, dt)) mouvement = null;
}

function dessinerTortue(ctx) {
  if (!tortue.visible) return;
  const p = versEcran(tortue.x, tortue.y);
  ctx.save();
  ctx.translate(p[0], p[1]);
  ctx.rotate(tortue.cap * Math.PI / 180);
  ctx.beginPath();
  ctx.moveTo(0, -14); ctx.lineTo(10, 11); ctx.lineTo(0, 5); ctx.lineTo(-10, 11); ctx.closePath();
  ctx.fillStyle = '#4ecdc4'; ctx.fill();
  ctx.beginPath(); ctx.arc(0, -9, 2.6, 0, Math.PI * 2); ctx.fillStyle = '#ffd700'; ctx.fill();
  ctx.restore();
}

function dessinerGrille(ctx) {
  const pas = 60;
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= canvas.width; x += pas) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
  for (let y = 0; y <= canvas.height; y += pas) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.moveTo(0, canvas.height / 2); ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
}

function dessinerHUD(ctx) {
  ctx.fillStyle = '#8892b0'; ctx.font = 'bold 14px monospace';
  ctx.fillText('TORTUE LOGO', 16, 26);

  if (erreurMessage) {
    ctx.fillStyle = '#fff'; ctx.font = 'bold 20px monospace';
    ctx.fillText('Erreur dans le programme', 16, 52);
    ctx.fillStyle = '#ff6b81'; ctx.font = '13px monospace';
    ctx.fillText(erreurMessage, 16, 74);
    return;
  }

  if (programmePerso) {
    ctx.fillStyle = '#fff'; ctx.font = 'bold 20px monospace';
    ctx.fillText('Programme personnalisé', 16, 52);
    ctx.fillStyle = '#8892b0'; ctx.font = '13px monospace';
    ctx.fillText(programmePerso, 16, 74);
    return;
  }

  const m = MOTIFS[motifActuel];
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px monospace';
  ctx.fillText(m.nom, 16, 52);
  ctx.fillStyle = '#8892b0'; ctx.font = '13px monospace';
  ctx.fillText(m.legende || m.code, 16, 74);
}

function draw(ctx) {
  ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  dessinerGrille(ctx);
  ctx.drawImage(encre, 0, 0);
  dessinerTortue(ctx);
  dessinerHUD(ctx);
  stage.update();
}`
  },

  {
    name: 'Chasse aux Fantômes',
    desc: 'Un mini Pac-Man ! Flèches pour te déplacer, mange toutes les pièces sans te faire toucher par le fantôme. Espace pour rejouer. Construite avec de vrais blocs : ouvre le même jeu dans l’éditeur "Blocs" (bouton 👻 Fantômes) pour voir et modifier chaque bloc.',
    code: `// Jeu créé avec l'éditeur de Blocs de DraftBox
let joueur = { x: 450, y: 270, w: 28, h: 28, vitesse: 200 };
let fantome = { x: 450, y: 90, w: 28, h: 28, vitesse: 110 };
let pieces = [];
let score = 0;
let gameOver = false;
let victoire = false;

function init() {
  score = 0;
  gameOver = false;
  victoire = false;
  joueur.x = 450;
  joueur.y = 270;
  fantome.x = 450;
  fantome.y = 90;
  pieces = [];
  for (let i = 0; i < 18; i++) {
    pieces.push({ x: rand(40, 920), y: rand(40, 500), w: 14, h: 14, collected: false });
  }
}

function update(dt) {
  if ((gameOver || victoire)) {
    if (keys.Space) {
      init();
    }
  } else {
    if (keys.ArrowLeft || keys.KeyA) joueur.x -= 200 * dt;
    if (keys.ArrowRight || keys.KeyD) joueur.x += 200 * dt;
    if (keys.ArrowUp || keys.KeyW) joueur.y -= 200 * dt;
    if (keys.ArrowDown || keys.KeyS) joueur.y += 200 * dt;
    joueur.x = clamp(joueur.x, 0, canvas.width - joueur.w);
    joueur.y = clamp(joueur.y, 0, canvas.height - joueur.h);
    fantome.x += (joueur.x > fantome.x ? 1 : -1) * fantome.vitesse * dt;
    fantome.y += (joueur.y > fantome.y ? 1 : -1) * fantome.vitesse * dt;
    fantome.x = clamp(fantome.x, 0, canvas.width - fantome.w);
    fantome.y = clamp(fantome.y, 0, canvas.height - fantome.h);
    for (const piece of pieces) {
      if (!piece.collected) {
        if (rectCollide(joueur, piece)) {
          piece.collected = true;
          score += 1;
          audio("piece");
        }
      }
    }
    pieces = pieces.filter((it) => !it.collected);
    if (rectCollide(joueur, fantome)) {
      gameOver = true;
      audio("perdu");
    }
    if ((pieces.length === 0)) {
      victoire = true;
      audio("victoire");
    }
  }
}

function draw(ctx) {
  ctx.fillStyle = "#0a0a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const piece of pieces) {
    ctx.fillStyle = "#ffd24d";
    ctx.beginPath();
    ctx.arc(piece.x, piece.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#e94560";
  ctx.fillRect(fantome.x, fantome.y, fantome.w, fantome.h);
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(joueur.x, joueur.y, joueur.w, joueur.h);
  ctx.fillStyle = "#ffffff";
  ctx.font = "18px monospace";
  ctx.fillText("Score : " + score, 16, 32);
  if (gameOver) {
    ctx.fillStyle = "#e94560";
    ctx.font = "26px monospace";
    ctx.fillText("💀 Perdu ! Espace pour rejouer", 170, 280);
  }
  if (victoire) {
    ctx.fillStyle = "#ffd700";
    ctx.font = "26px monospace";
    ctx.fillText("🏆 Gagné ! Espace pour rejouer", 170, 280);
  }
}`
  }
];
