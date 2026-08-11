import Demos from './demos.js';

const gettingStarted = `
<h1>Bienvenue sur DraftBox</h1>
<p>DraftBox est un outil de création de jeux dans le navigateur. Dessinez des sprites en pixel art, écrivez du code JavaScript et lancez votre jeu directement — aucune installation requise.</p>

<h2>Comment ça marche</h2>
<ol>
  <li><strong>Éditeur de Sprites</strong> — Dessinez des sprites en pixel art et sauvegardez-les avec un nom.</li>
  <li><strong>Éditeur de Code</strong> — Écrivez la logique du jeu en JavaScript avec l'API DraftBox.</li>
  <li><strong>Scène</strong> — Lancez votre jeu et regardez-le prendre vie.</li>
  <li><strong>Doc</strong> — Documentation de référence et exemples (vous êtes ici).</li>
</ol>

<h2>Votre Premier Jeu</h2>
<p>Commencez avec le modèle par défaut dans l'éditeur de code. Il crée un personnage et des pièces à collecter. Cliquez sur <strong>Lancer</strong> pour jouer.</p>

<div class="note">
  <strong>Astuce :</strong> Appuyez sur <strong>Ctrl+Enter</strong> (ou Cmd+Enter) pour lancer rapidement votre jeu depuis l'éditeur de code.
</div>

<h2>Raccourcis Clavier</h2>
<ul>
  <li><strong>Ctrl+Enter</strong> — Lancer le jeu</li>
  <li><strong>Ctrl+S</strong> — Sauvegarder le sprite dans l'éditeur</li>
  <li><strong>Flèches / WASD</strong> — Contrôler le joueur dans le modèle par défaut</li>
</ul>
`;

const download = `
<div class="apk-download-card">
  <span style="font-size:52px;display:block;margin-bottom:10px;">📱</span>
  <h1 style="margin-bottom:10px;">Emportez DraftBox partout</h1>
  <p style="font-size:15px;max-width:480px;margin:0 auto 24px;opacity:0.9;">Installez l'application sur votre téléphone ou tablette Android et créez vos jeux même hors ligne. Rapide, léger, sans pub.</p>

  <a href="/gameCreator.apk" download="gameCreator.apk" class="apk-download-btn">
    <span class="apk-download-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
    </span>
    <span class="apk-download-text">
      <span class="apk-download-label">Télécharger sur</span>
      <span class="apk-download-name">gameCreator.apk</span>
    </span>
  </a>

  <p style="font-size:13px;opacity:0.6;margin-top:16px;">Android 7.0+ · ~4,7 Mo · Dernière build</p>
</div>

<h2>Comment installer</h2>
<ol>
  <li>Téléchargez <code>gameCreator.apk</code> avec le bouton ci-dessus depuis votre appareil Android.</li>
  <li>Ouvrez le fichier téléchargé. Si Android bloque l'installation, autorisez <strong>« Installer des applications inconnues »</strong> pour votre navigateur dans les réglages.</li>
  <li>Confirmez l'installation, puis lancez DraftBox depuis votre écran d'accueil. 🎉</li>
</ol>

<div class="note">
  <strong>Astuce :</strong> L'APK n'est pas signé via le Play Store, c'est normal pour une build de développement — Android vous préviendra, il suffit de confirmer l'installation.
</div>
`;

const gameLoop = `
<h1>Boucle de Jeu</h1>
<p>Chaque jeu a besoin d'une boucle qui tourne en continu, mettant à jour la logique et affichant les images. Dans DraftBox, vous implémentez cela avec deux fonctions :</p>

<h2>update(dt)</h2>
<p>Appelée à chaque image. Le paramètre <code>dt</code> est le <strong>temps écoulé</strong> en secondes depuis la dernière image. Utilisez-le pour rendre les mouvements indépendants du framerate.</p>

<pre><code>let vitesse = 200; // pixels par seconde

function update(dt) {
  // Se déplace de 200 pixels chaque seconde, peu importe le FPS
  joueur.x += vitesse * dt;
}</code></pre>

<h2>draw(ctx)</h2>
<p>Appelée à chaque image après <code>update()</code>. Le <code>ctx</code> est le contexte de rendu Canvas 2D. Effacez le canvas et dessinez tout à chaque image.</p>

<pre><code>function draw(ctx) {
  // Effacer le canvas
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dessiner le joueur
  ctx.fillStyle = '#e94560';
  ctx.fillRect(joueur.x, joueur.y, 32, 32);
}</code></pre>

<h2>init()</h2>
<p>Appelée une seule fois au démarrage du jeu. Utilisez-la pour initialiser l'état du jeu.</p>

<pre><code>let ennemis = [];

function init() {
  for (let i = 0; i < 10; i++) {
    ennemis.push({
      x: rand(0, 900), y: rand(0, 500),
      pdv: 3
    });
  }
}</code></pre>

<div class="note">
  <strong>Important :</strong> La boucle de jeu tourne à ~60 FPS avec <code>requestAnimationFrame</code>. Si votre jeu est trop rapide, vérifiez que vous multipliez bien par <code>dt</code>.
</div>
`;

const canvasBasics = `
<h1>Canvas 2D — Les Bases</h1>
<p>L'<strong>API Canvas 2D</strong> est la principale façon de dessiner des graphismes dans le navigateur. La fonction <code>draw(ctx)</code> reçoit le contexte de rendu 2D.</p>

<h2>Formes</h2>

<pre><code>// Rectangle
ctx.fillStyle = 'red';
ctx.fillRect(x, y, largeur, hauteur);
ctx.strokeRect(x, y, largeur, hauteur); // contour uniquement

// Cercle (avec arc)
ctx.beginPath();
ctx.arc(x, y, rayon, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();

// Ligne
ctx.beginPath();
ctx.moveTo(x1, y1);
ctx.lineTo(x2, y2);
ctx.strokeStyle = 'white';
ctx.lineWidth = 2;
ctx.stroke();</code></pre>

<h2>Couleurs</h2>
<pre><code>// Couleurs nommées
ctx.fillStyle = 'red';
ctx.fillStyle = 'blue';

// Hexadécimal
ctx.fillStyle = '#e94560';

// RGBA (avec transparence)
ctx.fillStyle = 'rgba(233, 69, 96, 0.5)';

// HSL
ctx.fillStyle = 'hsl(0, 80%, 60%)';</code></pre>

<h2>Texte</h2>
<pre><code>ctx.fillStyle = 'white';
ctx.font = '24px monospace';
ctx.fillText('Bonjour !', x, y);

// Alignement du texte
ctx.textAlign = 'center'; // 'left', 'center', 'right'
ctx.textBaseline = 'middle'; // 'top', 'middle', 'bottom'

// Affichage du score
ctx.font = 'bold 20px monospace';
ctx.fillStyle = '#ffd700';
ctx.fillText('Score : ' + score, 16, 32);</code></pre>

<h2>Transformations</h2>
<pre><code>// Sauvegarder/restaurer l'état
ctx.save();
ctx.translate(x, y);
ctx.rotate(angle);
ctx.scale(1, -1); // retourner verticalement
// ... dessiner ...
ctx.restore();</code></pre>

<h2>Effacer le Canvas</h2>
<pre><code>ctx.fillStyle = '#0f0f23';
ctx.fillRect(0, 0, canvas.width, canvas.height);</code></pre>
`;

const canvas3DBasics = `
<h1>Canvas 3D — Les Bases</h1>
<p>Vous pouvez afficher des graphismes 3D sur un canvas 2D en utilisant une <strong>projection manuelle</strong>. Définissez des points 3D, appliquez une rotation, puis projetez-les en coordonnées 2D à l'écran.</p>

<h2>Sommets et Arêtes</h2>
<p>Un cube est composé de 8 points (sommets) reliés par 12 lignes (arêtes) :</p>
<pre><code>const sommets = [
  [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
  [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]
];
const aretes = [
  [0,1],[1,2],[2,3],[3,0],
  [4,5],[5,6],[6,7],[7,4],
  [0,4],[1,5],[2,6],[3,7]
];</code></pre>

<h2>Rotation</h2>
<p>Rotation de chaque sommet autour des axes X et Y avec sin/cos :</p>
<pre><code>let y1 = y * Math.cos(ax) - z * Math.sin(ax);
let z1 = y * Math.sin(ax) + z * Math.cos(ax);
let x2 = x * Math.cos(ay) + z1 * Math.sin(ay);
let z2 = -x * Math.sin(ay) + z1 * Math.cos(ay);</code></pre>

<h2>Projection Perspective</h2>
<p>Conversion 3D vers 2D. Les points éloignés apparaissent plus petits :</p>
<pre><code>const echelle = longueurFocale / (longueurFocale + z);
const xEcran = cx + x * echelle;
const yEcran = cy + y * echelle;</code></pre>

<h2>Exemple Complet</h2>
<p>Un cube rouge en fil de fer qui tourne sur lui-même. Utilise le pattern standard <code>update(dt)</code> / <code>draw(ctx)</code> :</p>
<pre><code>// CUBE 3D EN FIL DE FER
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
  const projete = sommets.map(([x, y, z]) =&gt; {
    let y1 = y*cosX - z*sinX, z1 = y*sinX + z*cosX;
    let x2 = x*cosY + z1*sinY, z2 = -x*sinY + z1*cosY;
    const s = 300 / (300 + z2 * V);
    return [cx + x2*V*s, cy + y1*V*s];
  });
  ctx.strokeStyle = '#e94560';
  ctx.lineWidth = 2.5;
  aretes.forEach(([a, b]) =&gt; {
    ctx.beginPath();
    ctx.moveTo(projete[a][0], projete[a][1]);
    ctx.lineTo(projete[b][0], projete[b][1]);
    ctx.stroke();
  });
}</code></pre>

<div style="text-align:center;margin:24px 0;">
  <button class="demo-play-btn" data-demo="6" style="padding:12px 28px;font-size:16px;font-weight:bold;background:linear-gradient(135deg,#e94560,#c23152);color:white;border:none;border-radius:8px;cursor:pointer;">▶ Exécuter l'exemple</button>
</div>

<h2>Cube Contrôlé par la Souris</h2>
<p>Au lieu d'une rotation automatique, associez la position de la souris aux angles de rotation. Déplacez la souris sur le canvas pour faire tourner le cube dans toutes les directions :</p>
<pre><code>// Convertir la position de la souris en angles
const angleX = (mouse.y / canvas.height - 0.5) * Math.PI;
const angleY = (mouse.x / canvas.width - 0.5) * Math.PI * 2;</code></pre>
<p>L'objet <code>mouse</code> fournit <code>mouse.x</code> et <code>mouse.y</code> en coordonnées canvas (0–960, 0–540). Le centre du canvas donne une rotation nulle ; en déplaçant vers les bords, le cube tourne.</p>

<div style="text-align:center;margin:24px 0;">
  <button class="demo-play-btn" data-demo="7" style="padding:12px 28px;font-size:16px;font-weight:bold;background:linear-gradient(135deg,#e94560,#c23152);color:white;border:none;border-radius:8px;cursor:pointer;">▶ Exécuter l'exemple (souris)</button>
</div>
`;

const turtleLogo = `
<h1>Tortue Logo — Construire un Mini-Langage</h1>
<p>En 1967, Seymour Papert invente <strong>Logo</strong> au MIT : un langage où l'on dirige une tortue avec des ordres tout simples — avancer, tourner, lever le crayon — pour lui faire dessiner des figures. C'est un excellent projet pour apprendre une technique très utile en dev de jeu : <strong>lire du texte et le transformer en actions</strong> (le même principe sert pour des dialogues scriptés, des cinématiques ou un système de modding).</p>

<h2>Le langage</h2>
<p>Le mini-Logo de cette démo comprend huit commandes :</p>
<table>
  <tr><th>Commande</th><th>Exemple</th><th>Effet</th></tr>
  <tr><td><code>AVANCE n</code> / <code>AV n</code></td><td><code>AV 100</code></td><td>Avance de n pas</td></tr>
  <tr><td><code>RECULE n</code> / <code>RE n</code></td><td><code>RE 50</code></td><td>Recule de n pas</td></tr>
  <tr><td><code>TOURNEDROITE n</code> / <code>TD n</code></td><td><code>TD 90</code></td><td>Tourne à droite de n degrés</td></tr>
  <tr><td><code>TOURNEGAUCHE n</code> / <code>TG n</code></td><td><code>TG 45</code></td><td>Tourne à gauche de n degrés</td></tr>
  <tr><td><code>LEVECRAYON</code> / <code>LC</code></td><td><code>LC</code></td><td>Se déplacer sans dessiner</td></tr>
  <tr><td><code>BAISSECRAYON</code> / <code>BC</code></td><td><code>BC</code></td><td>Recommencer à dessiner</td></tr>
  <tr><td><code>COULEUR nom</code></td><td><code>COULEUR bleu</code></td><td>Change la couleur du trait</td></tr>
  <tr><td><code>REPETE n [ ... ]</code></td><td><code>REPETE 4 [AV 100 TD 90]</code></td><td>Répète les instructions n fois</td></tr>
</table>
<div class="note">
  <strong>Astuce géométrie :</strong> pour refermer un polygone à n côtés, il faut toujours tourner de 360 ÷ n degrés à chaque étape. C'est pour ça que <code>REPETE 6 [AV 90 TD 60]</code> dessine un hexagone parfait (360 ÷ 6 = 60).
</div>

<h2>Étape 1 — Découper le texte en mots (tokenize)</h2>
<p>Avant d'interpréter quoi que ce soit, on sépare le programme en petits morceaux (des « tokens »). On ajoute des espaces autour des crochets pour qu'ils deviennent des tokens à part entière :</p>
<pre><code>function tokenize(src) {
  return src.replace(/\\[/g, ' [ ').replace(/\\]/g, ' ] ').split(/\\s+/).filter(Boolean);
}

tokenize('REPETE 4 [ AV 100 TD 90 ]');
// -> ['REPETE', '4', '[', 'AV', '100', 'TD', '90', ']']</code></pre>

<h2>Étape 2 — Transformer les tokens en instructions (parse)</h2>
<p>On lit les tokens un par un. La plupart deviennent une instruction directe ; <code>REPETE</code> est spécial car il doit lire son crochet fermant et se répéter lui-même (récursion) :</p>
<pre><code>if (cle === 'repeat') {
  const n = parseInt(tokens[i], 10); i++;
  if (tokens[i] !== '[') throw new Error('REPETE attend "["');
  i++;
  const corps = bloc(true); // ré-appelle la même fonction jusqu'au ']'
  noeuds.push({ type: 'repeat', count: n, body: corps });
}</code></pre>
<p>Une erreur claire (crochet manquant, commande inconnue…) vaut toujours mieux qu'un plantage silencieux — c'est ce que fait <code>throw new Error(...)</code> ici.</p>

<h2>Étape 3 — Faire avancer la tortue image par image</h2>
<p>Comme toute animation DraftBox, on ne saute pas directement à la position finale : on avance un peu à chaque appel de <code>update(dt)</code>, en traçant le segment parcouru sur un calque d'encre séparé (un second <code>&lt;canvas&gt;</code> créé en mémoire) pour que le dessin reste affiché une fois le trait terminé :</p>
<pre><code>function avancerCommande(m, dt) {
  m.fait = Math.min(m.total, m.fait + VITESSE_AV * dt);
  const t = m.fait / m.total;
  const nx = m.x0 + (m.x1 - m.x0) * t, ny = m.y0 + (m.y1 - m.y0) * t;
  if (m.crayon) tracerSegment(tortue.x, tortue.y, nx, ny, m.couleur, m.epaisseur);
  tortue.x = nx; tortue.y = ny;
  return m.fait >= m.total; // vrai quand le mouvement est terminé
}</code></pre>

<h2>Un panneau de commande dessiné avec CreateJS</h2>
<p>Plutôt qu'une interface HTML par-dessus le canvas, la démo dessine son propre panneau de commande directement dedans, avec <a href="https://createjs.com/" target="_blank">CreateJS</a> (déjà disponible dans DraftBox via la variable <code>createjs</code>). Chaque bouton est un <code>Container</code> CreateJS avec une forme et un texte, et un simple <code>.on('click', …)</code> :</p>
<pre><code>function creerBouton(parent, label, x, y, largeurMin, onClick) {
  const txt = new createjs.Text(label, 'bold 12px monospace', '#ffffff');
  txt.textAlign = 'center'; txt.textBaseline = 'middle';
  const largeur = Math.max(largeurMin, txt.getMeasuredWidth() + 20);

  const fond = new createjs.Shape();
  fond.graphics.beginFill('rgba(255,255,255,0.12)').drawRoundRect(0, 0, largeur, 26, 6);
  txt.x = largeur / 2; txt.y = 13;

  const cont = new createjs.Container();
  cont.addChild(fond, txt);
  cont.x = x; cont.y = y;
  cont.cursor = 'pointer';
  cont.on('click', onClick);
  parent.addChild(cont);
  return { cont, largeur };
}</code></pre>
<p>Le <code>Stage</code> CreateJS partage le même <code>&lt;canvas&gt;</code> que le dessin de la tortue (fait au pinceau avec <code>ctx</code> classique). Le point clé : <code>stage.autoClear = false</code>, sinon CreateJS effacerait le dessin de la tortue avant de poser ses boutons par-dessus.</p>
<pre><code>function draw(ctx) {
  ctx.fillRect(0, 0, canvas.width, canvas.height); // efface
  // ... dessine la grille, l'encre, la tortue ...
  stage.update(); // pose le panneau CreateJS par-dessus, sans re-effacer</code></pre>

<h2>Saisir des nombres — de vrais &lt;input&gt; par-dessus le canvas</h2>
<p>CreateJS sait dessiner des boutons, mais pas un vrai champ de texte éditable. Pour les coordonnées X/Y partagées par <strong>Tracer</strong> et <strong>Aller</strong>, la démo crée directement de vrais <code>&lt;input type="number"&gt;</code> HTML et les pose au-dessus du canvas, calés sur la deuxième rangée du panneau :</p>
<pre><code>function positionnerSaisiesHTML() {
  const rectCanvas = canvas.getBoundingClientRect();
  const rectParent = canvas.parentElement.getBoundingClientRect();
  const echelle = rectCanvas.width / canvas.width; // 960 = résolution interne

  overlay.style.left = (rectCanvas.left - rectParent.left + 10 * echelle) + 'px';
  overlay.style.top = (rectCanvas.top - rectParent.top + (HUD_TOP + RANGEE2_Y) * echelle) + 'px';
  overlay.style.transform = 'scale(' + echelle + ')'; // suit le zoom/plein écran du canvas
}</code></pre>
<p>Un <code>ResizeObserver</code> sur le canvas rappelle cette fonction à chaque redimensionnement (plein écran compris), pour que les champs restent alignés au pixel près. Et comme ces éléments HTML ne disparaissent pas tout seuls, la démo définit une fonction <code>destroy()</code> — un quatrième hook optionnel, au même titre que <code>init</code>/<code>update</code>/<code>draw</code> — que DraftBox appelle automatiquement à l'arrêt du jeu pour retirer proprement l'overlay et désactiver le <code>Stage</code> CreateJS.</p>

<h2>Taper son propre programme</h2>
<p>Les six figures et les boutons Tracer/Aller passent tous par le même interpréteur ; rien n'empêche de lui donner directement un programme complet. La démo ajoute donc un vrai <code>&lt;input type="text"&gt;</code> pour ça, avec une liste déroulante d'exemples à charger dedans avant de cliquer <strong>Exécuter</strong> (ou Entrée) :</p>
<pre><code>function chargerProgrammePerso(texte) {
  let programme;
  try {
    programme = walk(parse(tokenize(texte)));
  } catch (e) {
    erreurMessage = e.message; // affiché dans le panneau au lieu de planter
    return;
  }
  file = programme;
  // ... réinitialise la tortue et lance l'exécution comme un motif normal
}</code></pre>
<p>Une erreur de syntaxe (crochet manquant, commande inconnue…) s'affiche simplement dans le panneau au lieu de faire planter la démo — essayez par exemple <code>REPETE 3 [ AV 2 TD 144 ]</code>, un triangle qui ne se referme jamais tout à fait puisque 3 × 144° ne fait pas 360°.</p>

<h2>Essayer la démo</h2>
<p>La démo enchaîne toute seule six figures classiques — carré, triangle, hexagone, étoile, fleur et spirale. Une fois lancée dans la <strong>Scène</strong>, tout se pilote depuis le panneau en bas du canvas :</p>
<ul>
  <li><strong>Carré / Triangle / Hexagone / Étoile / Fleur / Spirale</strong> — lance directement ce motif</li>
  <li><strong>X, Y + Tracer</strong> — trace un trait jusqu'à ces coordonnées, même si le crayon est actuellement levé</li>
  <li><strong>X, Y + Aller</strong> — déplace la tortue jusqu'à ces coordonnées sans rien dessiner, même si le crayon est actuellement baissé</li>
  <li><strong>Clic sur le dessin</strong> — même destination à la souris, mais respecte l'état actuel du crayon</li>
  <li><strong>Liste déroulante + champ Programme + Exécuter</strong> — tape ou charge un programme Logo complet et lance-le</li>
  <li><strong>Crayon</strong> — lève ou baisse le crayon</li>
  <li><strong>Effacer</strong> — efface le dessin et recentre la tortue</li>
  <li><strong>⏸ / ▶</strong> — met en pause ou relance le motif (ou le programme personnalisé) en cours</li>
  <li><strong>1 à 6 / ESPACE</strong> — les mêmes raccourcis clavier restent disponibles</li>
</ul>

<div style="text-align:center;margin:24px 0;">
  <button class="demo-play-btn" data-demo="9" style="padding:12px 28px;font-size:16px;font-weight:bold;background:linear-gradient(135deg,#e94560,#c23152);color:white;border:none;border-radius:8px;cursor:pointer;">▶ Exécuter la démo</button>
</div>

<div class="note">
  <strong>Pour aller plus loin :</strong> le code complet de la démo (les 8 commandes, la gestion des couleurs, <code>ORIGINE</code>, <code>VIDEECRAN</code>…) est visible dans l'éditeur de code une fois la démo lancée — copiez-le et modifiez les motifs dans <code>MOTIFS</code> pour créer les vôtres.
</div>
`;

const sprites = `
<h1>Sprites &amp; Images</h1>
<p>Les sprites sont des images en pixel art que vous créez dans l'éditeur de sprites. Ils sont disponibles dans votre code via l'objet <code>sprites</code>.</p>

<h2>Utiliser les Sprites</h2>
<p>Chaque sprite sauvegardé dans l'éditeur devient un <strong>élément canvas</strong> accessible par son nom.</p>

<pre><code>// Dessiner le sprite à sa taille d'origine
ctx.drawImage(sprites.joueur, x, y);

// Dessiner le sprite redimensionné
ctx.drawImage(sprites.joueur, x, y, largeur, hauteur);

// Dessiner le sprite retourné
ctx.save();
ctx.scale(-1, 1);
ctx.drawImage(sprites.joueur, -x - largeur, y, largeur, hauteur);
ctx.restore();</code></pre>

<h2>Créer des Sprites</h2>
<ol>
  <li>Allez dans l'onglet <strong>Éditeur de Sprites</strong>.</li>
  <li>Dessinez votre pixel art avec les outils de pinceau.</li>
  <li>Tapez un nom dans le champ de nom du sprite (ex. : <code>joueur</code>).</li>
  <li>Cliquez sur <strong>Sauvegarder</strong>. Votre sprite apparaît dans la liste.</li>
  <li>Dans votre code, utilisez <code>sprites.joueur</code> pour y accéder.</li>
</ol>

<h2>Animation Simple</h2>
<p>Créez plusieurs sprites (ex. : <code>joueur_run1</code>, <code>joueur_run2</code>) et alternez entre eux.</p>

<pre><code>let indexFrame = 0;
let timerFrame = 0;

function update(dt) {
  timerFrame += dt;
  if (timerFrame > 0.15) {
    timerFrame = 0;
    indexFrame = (indexFrame + 1) % 2;
  }
}

function draw(ctx) {
  const frame = indexFrame === 0 ? 'joueur_run1' : 'joueur_run2';
  ctx.drawImage(sprites[frame], joueur.x, joueur.y, 32, 32);
}</code></pre>

<h2>Charger des Images Externes</h2>
<p>Vous pouvez aussi charger des images depuis des URLs avec des objets <code>Image</code>.</p>

<pre><code>const img = new Image();
img.src = 'https://exemple.com/sprite.png';
// Attendre le chargement, puis l'utiliser dans draw() :
// ctx.drawImage(img, x, y);</code></pre>
`;

const input = `
<h1>Gestion des Entrées</h1>
<p>DraftBox fournit l'état du clavier et de la souris via les objets <code>keys</code> et <code>mouse</code>.</p>

<h2>Clavier</h2>
<p>L'objet <code>keys</code> associe des <strong>codes de touches</strong> à des valeurs booléennes. <code>true</code> signifie que la touche est actuellement enfoncée.</p>

<pre><code>function update(dt) {
  // Flèches directionnelles
  if (keys.ArrowLeft)  joueur.x -= vitesse * dt;
  if (keys.ArrowRight) joueur.x += vitesse * dt;
  if (keys.ArrowUp)    joueur.y -= vitesse * dt;
  if (keys.ArrowDown)  joueur.y += vitesse * dt;

  // WASD
  if (keys.KeyW) joueur.y -= vitesse * dt;
  if (keys.KeyA) joueur.x -= vitesse * dt;
  if (keys.KeyS) joueur.y += vitesse * dt;
  if (keys.KeyD) joueur.x += vitesse * dt;

  // Espace, Entrée, Shift
  if (keys.Space)  tirer();
  if (keys.Enter)  demarrerJeu();
  if (keys.ShiftLeft) courir();
}</code></pre>

<h2>Souris</h2>
<p>L'objet <code>mouse</code> fournit la position du curseur et l'état des boutons.</p>

<pre><code>function draw(ctx) {
  // Afficher la position du curseur
  ctx.fillStyle = 'white';
  ctx.fillText(mouse.x + ', ' + mouse.y, mouse.x + 10, mouse.y - 10);

  // Dessiner un réticule à la position de la souris
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2);
  ctx.fill();

  // Tirer au clic
  if (mouse.left) {
    // mouse.x, mouse.y correspond à l'endroit où le joueur a cliqué
  }
}</code></pre>

<h2>Codes de Touches Courants</h2>
<ul>
  <li><strong>Lettres :</strong> <code>KeyA</code> à <code>KeyZ</code></li>
  <li><strong>Chiffres :</strong> <code>Digit0</code> à <code>Digit9</code></li>
  <li><strong>Flèches :</strong> <code>ArrowUp</code>, <code>ArrowDown</code>, <code>ArrowLeft</code>, <code>ArrowRight</code></li>
  <li><strong>Autres :</strong> <code>Space</code>, <code>Enter</code>, <code>ShiftLeft</code>, <code>ShiftRight</code>, <code>ControlLeft</code>, <code>Escape</code></li>
</ul>
`;

const collision = `
<h1>Détection de Collisions</h1>
<p>La détection de collisions est essentielle pour les jeux. DraftBox fournit une fonction <code>rectCollide</code> pour les collisions axis-aligned bounding box (AABB).</p>

<h2>Collision Rectangle (AABB)</h2>
<pre><code>const joueur = { x: 100, y: 100, w: 32, h: 32 };
const ennemi  = { x: 120, y: 110, w: 30, h: 30 };

function update(dt) {
  if (rectCollide(joueur, ennemi)) {
    // Collision détectée !
    joueur.pdv -= 1;
  }
}

// rectCollide vérifie si deux rectangles se chevauchent.
// Chaque rectangle nécessite : { x, y, w, h }
</code></pre>

<h2>Test AABB Manuel</h2>
<pre><code>function aabb(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}</code></pre>

<h2>Collision Circulaire</h2>
<pre><code>function collisionCercle(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < a.rayon + b.rayon;
}

// Utilisation :
const joueur = { x: 100, y: 100, rayon: 16 };
const piece   = { x: 120, y: 110, rayon: 8 };
if (collisionCercle(joueur, piece)) collecterPiece();</code></pre>

<h2>Point dans un Rectangle</h2>
<pre><code>function pointDansRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w &&
         py >= rect.y && py <= rect.y + rect.h;
}

// Vérifier si la souris est sur un bouton
if (pointDansRect(mouse.x, mouse.y, bouton)) {
  // Effet de survol
}</code></pre>

<h2>Réponse aux Collisions</h2>
<p>Quand des objets entrent en collision, vous pouvez généralement :</p>
<ul>
  <li><strong>Éjection</strong> — déplacer le joueur pour qu'il ne se chevauche plus</li>
  <li><strong>Dégâts</strong> — réduire les PDV, détruire l'objet</li>
  <li><strong>Rebond</strong> — inverser la vitesse</li>
  <li><strong>Collecte</strong> — ramasser l'objet</li>
</ul>

<pre><code>function ejecter(joueur, mur) {
  const chevX = Math.min(joueur.x + joueur.w, mur.x + mur.w) -
                   Math.max(joueur.x, mur.x);
  const chevY = Math.min(joueur.y + joueur.h, mur.y + mur.h) -
                   Math.max(joueur.y, mur.y);

  if (chevX < chevY) {
    if (joueur.x < mur.x) joueur.x = mur.x - joueur.w;
    else joueur.x = mur.x + mur.w;
  } else {
    if (joueur.y < mur.y) joueur.y = mur.y - joueur.h;
    else joueur.y = mur.y + mur.h;
  }
}</code></pre>
`;

const physics = `
<h1>Physique Simple</h1>
<p>Ajoutez de la physique de base à vos jeux — gravité, vitesse et rebonds.</p>

<h2>Vitesse et Déplacement</h2>
<pre><code>let joueur = {
  x: 400, y: 300,
  vx: 0, vy: 0,
  w: 32, h: 32
};

function update(dt) {
  // Appliquer la gravité
  joueur.vy += 800 * dt; // 800 px/s²

  // Mettre à jour la position
  joueur.x += joueur.vx * dt;
  joueur.y += joueur.vy * dt;

  // Collision avec le sol
  if (joueur.y + joueur.h > canvas.height) {
    joueur.y = canvas.height - joueur.h;
    joueur.vy = 0;
  }

  // Saut
  if (keys.Space && joueur.vy === 0) {
    joueur.vy = -400; // Vitesse de saut
  }
}</code></pre>

<h2>Frottement</h2>
<pre><code>function update(dt) {
  // Déplacement horizontal
  if (keys.ArrowLeft)  joueur.vx = -200;
  else if (keys.ArrowRight) joueur.vx = 200;
  else joueur.vx *= 0.9; // Frottement (ralentit)

  joueur.x += joueur.vx * dt;
}</code></pre>

<h2>Rebond</h2>
<pre><code>function update(dt) {
  balle.vy += 500 * dt;
  balle.y += balle.vy * dt;

  if (balle.y + balle.rayon > canvas.height) {
    balle.y = canvas.height - balle.rayon;
    balle.vy *= -0.7; // Rebond avec perte d'énergie
  }
}</code></pre>

<h2>Physique de Plateforme</h2>
<pre><code>let joueur = {
  x: 100, y: 300, w: 28, h: 32,
  vx: 0, vy: 0,
  auSol: false,
  compteurSaut: 0
};

function update(dt) {
  // Horizontal
  if (keys.ArrowLeft)  joueur.vx = -250;
  else if (keys.ArrowRight) joueur.vx = 250;
  else joueur.vx *= 0.85;

  // Gravité
  joueur.vy += 900 * dt;
  if (joueur.vy > 600) joueur.vy = 600;

  // Saut
  if (keys.Space && joueur.auSol) {
    joueur.vy = -400;
    joueur.auSol = false;
  }

  // Appliquer la vitesse
  joueur.x += joueur.vx * dt;
  joueur.y += joueur.vy * dt;

  // Sol
  if (joueur.y + joueur.h > canvas.height) {
    joueur.y = canvas.height - joueur.h;
    joueur.vy = 0;
    joueur.auSol = true;
  }
}</code></pre>
`;

const audio = `
<h1>Audio &amp; Son</h1>
<p>Utilisez la fonction <code>audio(nom)</code> pour jouer des sons. DraftBox utilise l'API Web Audio pour la lecture audio.</p>

<h2>Jouer des Sons</h2>
<pre><code>function update(dt) {
  if (keys.Space) {
    audio('saut'); // Joue le fichier son nommé 'saut'
    joueur.vy = -400;
  }
}

// Quand on collecte une pièce :
function collecterPiece() {
  audio('piece');
  score++;
}</code></pre>

<h2>Formats Supportés</h2>
<p>Les navigateurs supportent ces formats audio :</p>
<ul>
  <li><strong>MP3</strong> (.mp3) — largement supporté</li>
  <li><strong>OGG</strong> (.ogg) — format ouvert, bonne qualité</li>
  <li><strong>WAV</strong> (.wav) — non compressé, fichiers volumineux</li>
  <li><strong>M4A/AAC</strong> (.m4a) — bonne compression</li>
</ul>

<h2>Générer des Sons Programmétiquement</h2>
<p>Vous pouvez créer des sons simples directement avec l'API Web Audio :</p>

<pre><code>function bip(freq = 440, duree = 0.1) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = freq;
  osc.type = 'square';
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duree);
  osc.start();
  osc.stop(audioCtx.currentTime + duree);
}</code></pre>

<div class="note">
  <strong>Note :</strong> Les navigateurs modernes nécessitent une interaction utilisateur (clic/appui touche) avant de pouvoir jouer de l'audio. Le premier clic dans votre jeu débloquera le système audio.
</div>
`;

const gameState = `
<h1>Gestion de l'État du Jeu</h1>
<p>La plupart des jeux ont différents écrans : menus, gameplay, game over, etc. Gérez cela avec une machine à états simple.</p>

<h2>Machine à États</h2>
<pre><code>const ETAT = {
  MENU: 'menu',
  EN_JEU: 'enJeu',
  FIN_DE_PARTIE: 'finDePartie'
};

let etat = ETAT.MENU;

function update(dt) {
  switch (etat) {
    case ETAT.MENU:
      if (keys.Enter) etat = ETAT.EN_JEU;
      break;

    case ETAT.EN_JEU:
      // Logique normale du jeu
      if (joueur.pdv <= 0) etat = ETAT.FIN_DE_PARTIE;
      break;

    case ETAT.FIN_DE_PARTIE:
      if (keys.Enter) {
        reinitialiserJeu();
        etat = ETAT.MENU;
      }
      break;
  }
}

function draw(ctx) {
  switch (etat) {
    case ETAT.MENU:
      dessinerMenu(ctx);
      break;
    case ETAT.EN_JEU:
      dessinerJeu(ctx);
      break;
    case ETAT.FIN_DE_PARTIE:
      dessinerFinDePartie(ctx);
      break;
  }
}</code></pre>

<h2>Niveaux</h2>
<pre><code>let niveau = 1;
let maxNiveau = 10;

function niveauSuivant() {
  niveau++;
  if (niveau > maxNiveau) {
    etat = ETAT.VICTOIRE;
  } else {
    initialiserNiveau(niveau);
  }
}</code></pre>

<h2>Persistance du Score</h2>
<pre><code>// Sauvegarder le meilleur score
function sauvegarderMeilleurScore(score) {
  localStorage.setItem('meilleurScore', score);
}

// Charger le meilleur score
function chargerMeilleurScore() {
  return parseInt(localStorage.getItem('meilleurScore')) || 0;
}</code></pre>
`;

const tilemaps = `
<h1>Tilemaps</h1>
<p>Les tilemaps vous permettent de créer des niveaux avec une grille de tuiles. Chaque tuile a un type (mur, sol, etc.).</p>

<h2>Tilemap Simple</h2>
<pre><code>const TAILLE_TUILE = 32;
const carte = [
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
  for (let ligne = 0; ligne < carte.length; ligne++) {
    for (let col = 0; col < carte[ligne].length; col++) {
      const tuile = carte[ligne][col];
      if (tuile === 1) {
        ctx.fillStyle = '#16213e';
        ctx.fillRect(col * TAILLE_TUILE, ligne * TAILLE_TUILE, TAILLE_TUILE, TAILLE_TUILE);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.strokeRect(col * TAILLE_TUILE, ligne * TAILLE_TUILE, TAILLE_TUILE, TAILLE_TUILE);
      } else {
        ctx.fillStyle = '#0f0f23';
        ctx.fillRect(col * TAILLE_TUILE, ligne * TAILLE_TUILE, TAILLE_TUILE, TAILLE_TUILE);
      }
    }
  }
}

// Collision avec les tuiles
function getTuile(x, y) {
  const col = Math.floor(x / TAILLE_TUILE);
  const ligne = Math.floor(y / TAILLE_TUILE);
  if (ligne < 0 || ligne >= carte.length || col < 0 || col >= carte[0].length) return 1;
  return carte[ligne][col];
}

function peutBouger(x, y, w, h) {
  return getTuile(x, y) === 0 &&
         getTuile(x + w - 1, y) === 0 &&
         getTuile(x, y + h - 1) === 0 &&
         getTuile(x + w - 1, y + h - 1) === 0;
}</code></pre>
`;

const animation = `
<h1>Animation</h1>
<p>Créez des animations image par image en alternant les sprites ou en utilisant des effets de transformation.</p>

<h2>Animation de Sprite (Alternance d'Images)</h2>
<pre><code>let frameAnim = 0;
let timerAnim = 0;
const nbFrames = 4; // joueur_walk1, joueur_walk2, etc.

function update(dt) {
  timerAnim += dt;
  if (timerAnim >= 0.12) {
    timerAnim -= 0.12;
    frameAnim = (frameAnim + 1) % nbFrames;
  }
}

function draw(ctx) {
  const nom = 'joueur_walk' + (frameAnim + 1);
  ctx.drawImage(sprites[nom], joueur.x, joueur.y, 32, 32);
}</code></pre>

<h2>Interpolation (Tweening)</h2>
<pre><code>function lerp(a, b, t) {
  return a + (b - a) * t;
}

let camera = { x: 0, y: 0 };
function update(dt) {
  camera.x = lerp(camera.x, joueur.x - 400, 0.05);
  camera.y = lerp(camera.y, joueur.y - 250, 0.05);
}

function draw(ctx) {
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  ctx.restore();
}</code></pre>

<h2>Opacité / Effets de Fondu</h2>
<pre><code>let alphaFondu = 0;
let enFondu = false;

function demarrerFondu() { enFondu = true; alphaFondu = 0; }

function update(dt) {
  if (enFondu) {
    alphaFondu += dt * 0.5;
    if (alphaFondu >= 1) enFondu = false;
  }
}

function draw(ctx) {
  if (enFondu) {
    ctx.fillStyle = 'rgba(0, 0, 0, ' + alphaFondu + ')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}</code></pre>

<h2>Retournement de Sprite (Direction)</h2>
<pre><code>let regardeADroite = true;

function draw(ctx) {
  ctx.save();
  if (regardeADroite) {
    ctx.drawImage(sprites.joueur, joueur.x, joueur.y, 32, 32);
  } else {
    ctx.translate(joueur.x + 32, joueur.y);
    ctx.scale(-1, 1);
    ctx.drawImage(sprites.joueur, 0, 0, 32, 32);
  }
  ctx.restore();
}</code></pre>
`;

const particles = `
<h1>Effets de Particules</h1>
<p>Les systèmes de particules créent des effets visuels comme des explosions, de la fumée, de la pluie et des étincelles.</p>

<h2>Système de Particules Simple</h2>
<pre><code>let particules = [];

function genererParticules(x, y, couleur, nombre = 20) {
  for (let i = 0; i < nombre; i++) {
    const angle = rand(0, Math.PI * 2);
    const vitesse = rand(50, 200);
    particules.push({
      x, y,
      vx: Math.cos(angle) * vitesse,
      vy: Math.sin(angle) * vitesse,
      vie: rand(0.3, 1.0),
      vieMax: rand(0.3, 1.0),
      couleur,
      taille: rand(2, 6)
    });
  }
}

function update(dt) {
  for (let i = particules.length - 1; i >= 0; i--) {
    const p = particules[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 200 * dt;
    p.vie -= dt;
    if (p.vie <= 0) particules.splice(i, 1);
  }
}

function draw(ctx) {
  for (const p of particules) {
    const alpha = clamp(p.vie / p.vieMax, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.couleur;
    ctx.fillRect(p.x - p.taille/2, p.y - p.taille/2, p.taille, p.taille);
  }
  ctx.globalAlpha = 1;
}</code></pre>

<h2>Effet d'Explosion</h2>
<pre><code>function exploser(x, y) {
  genererParticules(x, y, '#ff6b6b', 30);
  genererParticules(x, y, '#ffd700', 20);
  genererParticules(x, y, '#ff9a3c', 15);
}</code></pre>

<h2>Effet de Pluie</h2>
<pre><code>let pluie = [];

function init() {
  for (let i = 0; i < 100; i++) {
    pluie.push({
      x: rand(0, canvas.width),
      y: rand(0, canvas.height),
      vitesse: rand(200, 500),
      longueur: rand(10, 25)
    });
  }
}

function update(dt) {
  for (const goutte of pluie) {
    goutte.y += goutte.vitesse * dt;
    if (goutte.y > canvas.height) {
      goutte.y = -goutte.longueur;
      goutte.x = rand(0, canvas.width);
    }
  }
}

function draw(ctx) {
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  for (const goutte of pluie) {
    ctx.beginPath();
    ctx.moveTo(goutte.x, goutte.y);
    ctx.lineTo(goutte.x - 2, goutte.y - goutte.longueur);
    ctx.stroke();
  }
}</code></pre>
`;

const math = `
<h1>Utilitaires Mathématiques</h1>
<p>DraftBox fournit les helpers <code>rand()</code> et <code>clamp()</code>. Voici d'autres fonctions mathématiques utiles pour le développement de jeux.</p>

<h2>Fonctions Intégrées</h2>
<pre><code>// Flottant aléatoire entre min et max
rand(0, 100);   // ex. : 42.7
rand(-1, 1);    // ex. : -0.35

// Limiter une valeur entre min et max
clamp(150, 0, 100); // 100
clamp(-50, 0, 100); // 0
clamp(50, 0, 100);  // 50</code></pre>

<h2>Distance &amp; Direction</h2>
<pre><code>function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function angle(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function seDeplacerVers(pos, cible, vitesse, dt) {
  const dx = cible.x - pos.x;
  const dy = cible.y - pos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;
  pos.x += (dx / dist) * vitesse * dt;
  pos.y += (dy / dist) * vitesse * dt;
}</code></pre>

<h2>Entier Aléatoire</h2>
<pre><code>function randEntier(min, max) {
  return Math.floor(rand(min, max + 1));
}

function choisirAleatoire(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}</code></pre>

<h2>Fonctions d'Accélération (Easing)</h2>
<pre><code>function acceleration(t) { return t * t; }
function deceleration(t) { return t * (2 - t); }
function accelerationDeceleration(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

let t = 0;
function update(dt) {
  t = Math.min(1, t + dt * 0.5);
  joueur.x = lerp(100, 500, deceleration(t));
}</code></pre>

<h2>Secousse d'Écran</h2>
<pre><code>intensiteSecousse = 0;

function secouer(intensite = 5) {
  intensiteSecousse = intensite;
}

function draw(ctx) {
  ctx.save();
  if (intensiteSecousse > 0) {
    ctx.translate(
      rand(-intensiteSecousse, intensiteSecousse),
      rand(-intensiteSecousse, intensiteSecousse)
    );
    intensiteSecousse *= 0.9;
    if (intensiteSecousse < 0.5) intensiteSecousse = 0;
  }
  ctx.restore();
}</code></pre>
`;

const patterns = `
<h1>Patterns de Jeu</h1>
<p>Patterns et exemples courants de développement de jeux à utiliser comme point de départ.</p>

<h2>Pool d'Objets</h2>
<p>Réutilisez les objets au lieu de les créer/détruire pour éviter les pauses de ramasse-miettes (garbage collector).</p>
<pre><code>const balles = [];
const TAILLE_POOL = 50;
for (let i = 0; i < TAILLE_POOL; i++) {
  balles.push({ x: 0, y: 0, vx: 0, vy: 0, actif: false });
}

function tirerBalle(x, y, angle) {
  for (const b of balles) {
    if (!b.actif) {
      b.x = x; b.y = y;
      b.vx = Math.cos(angle) * 400;
      b.vy = Math.sin(angle) * 400;
      b.actif = true;
      break;
    }
  }
}</code></pre>

<h2>Entité Composant (Simple)</h2>
<pre><code>function creerEntite(x, y) {
  return {
    x, y, w: 16, h: 16,
    vx: 0, vy: 0,
    pdv: 1,
    vivant: true,
    type: 'ennemi',
    update(dt) { },
    draw(ctx) { }
  };
}

const ennemis = [];
for (let i = 0; i < 10; i++) {
  const e = creerEntite(rand(100, 800), rand(100, 400));
  e.update = function(dt) {
    this.x += this.vx * dt;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
  };
  e.draw = function(ctx) {
    ctx.fillStyle = '#e94560';
    ctx.fillRect(this.x, this.y, this.w, this.h);
  };
  ennemis.push(e);
}</code></pre>

<h2>Apparition par Vagues</h2>
<pre><code>let vague = 1;
let ennemisDansVague = 0;
let timerApparition = 0;

function update(dt) {
  if (ennemisDansVague <= 0 && ennemis.length === 0) {
    demarrerVague(++vague);
  }

  timerApparition -= dt;
  if (timerApparition <= 0 && ennemisDansVague > 0) {
    apparaitreEnnemi();
    ennemisDansVague--;
    timerApparition = 1.0 / vague;
  }
}

function demarrerVague(n) {
  ennemisDansVague = n * 5;
  timerApparition = 0;
}</code></pre>

<h2>Camera qui Suit le Joueur</h2>
<pre><code>const camera = { x: 0, y: 0 };
const LARGEUR_MONDE = 2000;
const HAUTEUR_MONDE = 2000;

function update(dt) {
  camera.x = lerp(camera.x, joueur.x - canvas.width/2, 0.1);
  camera.y = lerp(camera.y, joueur.y - canvas.height/2, 0.1);

  camera.x = clamp(camera.x, 0, LARGEUR_MONDE - canvas.width);
  camera.y = clamp(camera.y, 0, HAUTEUR_MONDE - canvas.height);
}

function draw(ctx) {
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  ctx.restore();

  ctx.fillStyle = '#fff';
  ctx.font = '18px monospace';
  ctx.fillText('PDV : ' + joueur.pdv, 16, 32);
}</code></pre>

<h2>Système de Menu</h2>
<pre><code>const elementsMenu = ['Jouer', 'Options', 'Crédits'];
let indexSelection = 0;

function update(dt) {
  if (keys.ArrowUp) { indexSelection = Math.max(0, indexSelection - 1); keys.ArrowUp = false; }
  if (keys.ArrowDown) { indexSelection = Math.min(elementsMenu.length - 1, indexSelection + 1); keys.ArrowDown = false; }
  if (keys.Enter) { selectionnerElement(indexSelection); }
}

function draw(ctx) {
  ctx.fillStyle = '#0f0f23';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#e94560';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('MON JEU', canvas.width/2, 100);

  ctx.font = '22px monospace';
  elementsMenu.forEach((item, i) => {
    ctx.fillStyle = i === indexSelection ? '#ffd700' : '#8892b0';
    ctx.fillText((i === indexSelection ? '> ' : '  ') + item, canvas.width/2, 200 + i * 40);
  });
  ctx.textAlign = 'left';
}</code></pre>
`;

const apiRef = `
<h1>Référence API DraftBox</h1>
<p>Référence complète de toutes les API disponibles dans votre code de jeu.</p>

<h2>Cycle de Vie du Jeu</h2>
<table>
  <tr><th>Fonction</th><th>Description</th></tr>
  <tr><td><code>init()</code></td><td>Appelée une fois au démarrage du jeu.</td></tr>
  <tr><td><code>update(dt)</code></td><td>Appelée à chaque image. <code>dt</code> = temps écoulé en secondes (limité à 0.05).</td></tr>
  <tr><td><code>draw(ctx)</code></td><td>Appelée à chaque image après <code>update()</code>. Reçoit le contexte Canvas 2D.</td></tr>
</table>

<h2>Entrées</h2>
<table>
  <tr><th>Propriété</th><th>Description</th></tr>
  <tr><td><code>keys</code></td><td>Objet avec des booléens pour chaque code de touche. Ex. : <code>keys.Space</code>, <code>keys.ArrowLeft</code>, <code>keys.KeyW</code></td></tr>
  <tr><td><code>mouse.x</code></td><td>Position X de la souris en coordonnées canvas.</td></tr>
  <tr><td><code>mouse.y</code></td><td>Position Y de la souris en coordonnées canvas.</td></tr>
  <tr><td><code>mouse.left</code></td><td>Booléen — le bouton gauche de la souris est-il enfoncé ?</td></tr>
</table>

<h2>Graphismes</h2>
<table>
  <tr><th>Propriété</th><th>Description</th></tr>
  <tr><td><code>canvas</code></td><td>L'élément <code>&lt;canvas&gt;</code> du jeu (960×540). Utilisez <code>canvas.width</code>, <code>canvas.height</code> pour les dimensions.</td></tr>
  <tr><td><code>sprites[nom]</code></td><td>Un élément canvas pour chaque sprite sauvegardé dans l'éditeur. Utilisez avec <code>ctx.drawImage(sprites.nom, x, y)</code>.</td></tr>
</table>

<h2>Utilitaires</h2>
<table>
  <tr><th>Fonction</th><th>Description</th></tr>
  <tr><td><code>rand(min, max)</code></td><td>Retourne un flottant aléatoire entre min et max (inclus).</td></tr>
  <tr><td><code>clamp(valeur, min, max)</code></td><td>Limite la valeur à l'intervalle [min, max].</td></tr>
  <tr><td><code>rectCollide(a, b)</code></td><td>Test de collision AABB. Les deux objets doivent avoir <code>{x, y, w, h}</code>. Retourne un booléen.</td></tr>
  <tr><td><code>audio(nom)</code></td><td>Joue un fichier audio par nom/chemin.</td></tr>
</table>

<h2>Contexte Canvas 2D (ctx)</h2>
<p>Le paramètre <code>ctx</code> dans <code>draw(ctx)</code> est un <a href="https://developer.mozilla.org/fr/docs/Web/API/CanvasRenderingContext2D" target="_blank">CanvasRenderingContext2D</a> standard. Méthodes clés :</p>

<table>
  <tr><th>Méthode</th><th>Description</th></tr>
  <tr><td><code>fillStyle</code></td><td>Définir la couleur de remplissage (chaîne : 'red', '#e94560', 'rgba(...)')</td></tr>
  <tr><td><code>fillRect(x, y, w, h)</code></td><td>Dessiner un rectangle rempli</td></tr>
  <tr><td><code>strokeRect(x, y, w, h)</code></td><td>Dessiner un rectangle contour</td></tr>
  <tr><td><code>fillText(texte, x, y)</code></td><td>Dessiner du texte rempli</td></tr>
  <tr><td><code>drawImage(img, x, y, w, h)</code></td><td>Dessiner une image/sprite</td></tr>
  <tr><td><code>beginPath()</code></td><td>Commencer un nouveau chemin pour des formes personnalisées</td></tr>
  <tr><td><code>arc(x, y, r, angleDebut, angleFin)</code></td><td>Ajouter un arc/cercle au chemin</td></tr>
  <tr><td><code>moveTo(x, y)</code></td><td>Déplacer le curseur du chemin</td></tr>
  <tr><td><code>lineTo(x, y)</code></td><td>Dessiner une ligne vers (x, y)</td></tr>
  <tr><td><code>stroke()</code></td><td>Tracer le chemin actuel</td></tr>
  <tr><td><code>fill()</code></td><td>Remplir le chemin actuel</td></tr>
  <tr><td><code>save() / restore()</code></td><td>Sauvegarder/restaurer l'état des transformations et styles</td></tr>
  <tr><td><code>translate(x, y)</code></td><td>Déplacer l'origine</td></tr>
  <tr><td><code>rotate(angle)</code></td><td>Rotation (en radians)</td></tr>
  <tr><td><code>scale(x, y)</code></td><td>Échelle du canvas</td></tr>
  <tr><td><code>globalAlpha</code></td><td>Définir la transparence (0.0 à 1.0)</td></tr>
  <tr><td><code>font</code></td><td>Définir le style de police (<code>'20px monospace'</code>, <code>'bold 24px Arial'</code>)</td></tr>
  <tr><td><code>textAlign</code></td><td>Alignement du texte : 'left', 'center', 'right'</td></tr>
</table>

<h2>Taille du Canvas</h2>
<p>Le canvas de jeu fait <strong>960 × 540</strong> pixels (ratio 16:9). Utilisez toujours <code>canvas.width</code> et <code>canvas.height</code> pour un code adaptable.</p>

<pre><code>const cx = canvas.width / 2;
const cy = canvas.height / 2;</code></pre>

<div class="note">
  <strong>Tout le JavaScript standard est disponible.</strong> Vous pouvez utiliser des tableaux, des objets, des fonctions mathématiques, des boucles, des conditionnels, etc. Le jeu s'exécute dans le contexte de la page principale.</div>
`;

const demos = `
<div style="text-align:center;padding:20px 0;background:linear-gradient(135deg,#1a3a2e,#2d5a47);border-radius:16px;margin-bottom:24px;border:2px solid var(--accent);">
  <span style="font-size:48px;display:block;margin-bottom:8px;">🎮</span>
  <h1 style="margin-bottom:8px;">Démos de Jeux Rétro</h1>
  <p style="font-size:15px;max-width:500px;margin:0 auto;">Chargez un jeu rétro, le code apparaît dans l'éditeur et le jeu se lance tout seul. Prêt à jouer ?</p>
</div>

<div class="demo-grid">
${Demos.map((demo, i) => `
<div class="demo-card">
  <div class="demo-card-content">
    <div class="demo-card-emoji">${['🕹️','🐍','👾','🧱','☄️','🏃','🎲','🎯','🚀','🐢'][i % 10]}</div>
    <h3>${demo.name}</h3>
    <p>${demo.desc}</p>
    <button class="demo-play-btn" data-demo="${i}">▶ Jouer à ${demo.name}</button>
  </div>
</div>
`).join('')}
</div>
`;

export const sections = [
  { id: 'getting-started', title: 'Bienvenue', content: gettingStarted },
  { id: 'download', title: '📲 Télécharger l\'App', content: download },
  { id: 'game-loop', title: 'Boucle de Jeu', content: gameLoop },
  { id: 'canvas-basics', title: 'Canvas 2D — Les Bases', content: canvasBasics },
  { id: 'canvas-3d', title: 'Canvas 3D — Les Bases', content: canvas3DBasics },
  { id: 'turtle-logo', title: '🐢 Tortue Logo', content: turtleLogo },
  { id: 'sprites', title: 'Sprites & Images', content: sprites },
  { id: 'input', title: 'Gestion des Entrées', content: input },
  { id: 'collision', title: 'Détection de Collisions', content: collision },
  { id: 'physics', title: 'Physique Simple', content: physics },
  { id: 'audio', title: 'Audio & Son', content: audio },
  { id: 'game-state', title: 'État du Jeu', content: gameState },
  { id: 'tilemaps', title: 'Tilemaps', content: tilemaps },
  { id: 'animation', title: 'Animation', content: animation },
  { id: 'particles', title: 'Particules', content: particles },
  { id: 'math', title: 'Utilitaires Mathématiques', content: math },
  { id: 'patterns', title: 'Patterns de Jeu', content: patterns },
  { id: 'api-ref', title: 'Référence API', content: apiRef },
  { id: 'demos', title: '🎮 Démos de Jeux Rétro', content: demos },
];
