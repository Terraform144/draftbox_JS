// STARGLIDER 3D — Simulateur de combat spatial en vue cockpit (remake 1986)
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
}