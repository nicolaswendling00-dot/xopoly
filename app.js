const $ = (s) => document.querySelector(s);
const CLE = 'xopoly-v2';
const N = CASES.length; // 40
const B = 760;          // taille du plateau en px, avant la caméra
const ARGENT_DEPART = 1500, SALAIRE = 200, BONUS_GAGE = 50, AMENDE_FUITE = 150, CAUTION = 50;
const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
const attendre = (ms) => new Promise((r) => setTimeout(r, reduit ? 0 : ms));
const hasard = (n) => Math.floor(Math.random() * n);
let S = null;
let occupe = false;

/* ---------- État ---------- */
const sauver = () => localStorage.setItem(CLE, JSON.stringify(S));
const moi = () => S.joueurs[S.tour];
const toi = () => S.joueurs[1 - S.tour];
const avec = (txt, a, b) => txt.replaceAll('{moi}', a).replaceAll('{toi}', b);
const fmt = (txt) => avec(txt, moi().nom, toi().nom);
const majuscule = (t) => t[0].toUpperCase() + t.slice(1);
const DUREES =[[/trois minutes/, 180], [/deux minutes/, 120], [/une minute/, 60], [/trente secondes/, 30], [/dix secondes/, 10]];
const dureeDe = (t) => DUREES.find(([r]) => r.test(t))?.[1];

function melange(t) {
  for (let i = t.length - 1; i > 0; i--) { const j = hasard(i + 1); [t[i], t[j]] = [t[j], t[i]]; }
  return t;
}
function pioche(nom, liste) {
  if (!S.paquets[nom]?.length) S.paquets[nom] = melange(liste.map((_, i) => i));
  return liste[S.paquets[nom].pop()];
}
const gagesDuNiveau = (n) => GAGES.filter((g) => g.n === n || g.n === n - 1);
const piocheGage = () => pioche('gage' + S.niveau, gagesDuNiveau(S.niveau));

const possedes = (j, type) => CASES.filter((c, i) => c.type === type && S.proprios[i] === j).length;
const groupeComplet = (j, g) => CASES.every((c, i) => c.g !== g || S.proprios[i] === j);
const loyerBase = (c) => Math.round(c.prix * 0.2 / 5) * 5;
function loyerDe(i) {
  const c = CASES[i], p = S.proprios[i];
  if (c.type === 'acc') return 25 * 2 ** (possedes(p, 'acc') - 1);
  if (c.type === 'amb') return S.des * (possedes(p, 'amb') === 2 ? 10 : 4);
  return loyerBase(c) * (groupeComplet(p, c.g) ? 2 : 1);
}
const patrimoine = (j) => S.joueurs[j].argent + Object.entries(S.proprios).reduce((s, [i, p]) => s + (p === j ? CASES[i].prix : 0), 0);

/* ---------- Plateau ---------- */
// Case 0 en bas à droite, on tourne dans le sens des aiguilles d'une montre.
function coord(i) {
  if (i <= 10) return [10, 10 - i];
  if (i <= 20) return [20 - i, 0];
  if (i <= 30) return [0, i - 20];
  return [i - 30, 10];
}
const cote = (i) => Math.floor(i / 10) % 4;
const cases = [];
const pions = [];
const TYPES = { acc: 'Accessoire', amb: 'Ambiance' };

function construirePlateau() {
  const p = $('#plateau');
  p.querySelectorAll('.case, .pion').forEach((e) => e.remove());
  cases.length = pions.length = 0;
  CASES.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'case ' + c.type + (i % 10 === 0 ? ' coin' : '');
    const [r, col] = coord(i);
    b.style.gridArea = `${r + 1} / ${col + 1}`;
    b.style.setProperty('--r', cote(i) * 90 + 'deg');
    b.setAttribute('aria-label', c.nom + (c.prix ? `, ${c.prix} frissons` : ''));
    const sous = { depart: `Touche ${SALAIRE} en passant`, menottes: 'Ou simple visite', allez: 'Sans passer par le Départ', pause: 'Un câlin, gratuit' }[c.type];
    b.innerHTML = `<span class="in">` +
      (c.g ? `<span class="bande" style="background:${GROUPES[c.g].couleur}"></span>` : '') +
      `<span class="nom">${c.nom}</span>` +
      (TYPES[c.type] ? `<span class="type">${TYPES[c.type]}</span>` : '') +
      (sous ? `<span class="type">${sous}</span>` : '') +
      (c.prix ? `<span class="px">${c.prix}</span>` : '') +
      (c.montant ? `<span class="px">Paie ${c.montant}</span>` : '') + `</span>`;
    b.onclick = () => !occupe && detailCase(i);
    p.append(b); cases.push(b);
  });
  S.joueurs.forEach((j, k) => {
    const d = document.createElement('div');
    d.className = 'pion';
    d.innerHTML = `<div class="sol"></div><div class="debout">${svgPion(k)}</div>`;
    p.append(d); pions.push(d);
  });
  placerPions();
  Object.entries(S.proprios).forEach(([i, j]) => marquer(+i, j, false));
  remplirPiles();
}

function svgPion(k) {
  const c = k ? '#f4c04a' : '#ff4f7b', o = k ? '#a97a16' : '#b0234a';
  return `<svg viewBox="0 0 36 54" aria-hidden="true">
    <ellipse cx="18" cy="49" rx="16" ry="5" fill="${o}"/>
    <path d="M3 48 Q3 42 9 40 L12 26 Q8 24 9 21 L27 21 Q28 24 24 26 L27 40 Q33 42 33 48 Z" fill="${c}"/>
    <path d="M18 21 L27 21 Q28 24 24 26 L27 40 Q33 42 33 48 L18 48 Z" fill="${o}" opacity=".45"/>
    <circle cx="18" cy="12" r="10" fill="${c}"/>
    <path d="M18 2 A10 10 0 0 1 18 22 Z" fill="${o}" opacity=".45"/>
    <circle cx="14" cy="8" r="3" fill="#fff" opacity=".7"/></svg>`;
}

function remplirPiles() {
  [['#pileGage', 'Gage'], ['#pileTentation', 'Tentation']].forEach(([s, mot]) => {
    $(s).innerHTML = Array.from({ length: 7 }, (_, k) => `<div class="lame" style="transform:translateZ(${k * 2.5}px)">${mot}</div>`).join('');
  });
}

// Pion posé vers le bord extérieur de la case, pour laisser lire son nom.
function posPion(k, i) {
  const c = cases[i];
  const s = cote(i);
  const ext = [[0, 1], [-1, 0], [0, -1], [1, 0]][s];
  const tan = [[-1, 0], [0, -1], [1, 0], [0, 1]][s];
  const recul = i % 10 === 0 ? 18 : 26;
  const dec = k ? 12 : -12;
  return [c.offsetLeft + c.offsetWidth / 2 + ext[0] * recul + tan[0] * dec, c.offsetTop + c.offsetHeight / 2 + ext[1] * recul + tan[1] * dec];
}
const poser = (el, x, y, z = 0) => `translate3d(${x}px,${y}px,${z}px)`;
function placerPions() {
  pions.forEach((el, k) => { const [x, y] = posPion(k, S.joueurs[k].pos); el.style.transform = poser(el, x, y); el._xy = [x, y]; });
}

async function sauter(k, i, duree = 260, dernier = false) {
  const el = pions[k];
  const [x, y] = posPion(k, i), [x0, y0] = el._xy;
  const fin = poser(el, x, y);
  if (!reduit) {
    const im = [{ transform: poser(el, x0, y0) }, { transform: poser(el, (x0 + x) / 2, (y0 + y) / 2, dernier ? 70 : 42), offset: .45 }, { transform: fin }];
    await el.animate(im, { duration: dernier ? duree * 1.6 : duree, easing: 'cubic-bezier(.3,.6,.4,1)' }).finished;
  }
  el.style.transform = fin; el._xy = [x, y];
}

/* ---------- Caméra ---------- */
const cam = { rz: 0, mode: 'vue', i: 0 };
function camera(mode, i = moi().pos) {
  cam.mode = mode; cam.i = i;
  const p = $('#plateau'), sc = $('#scene');
  const W = sc.clientWidth, H = sc.clientHeight;
  let cible = -90 * cote(i);
  while (cible - cam.rz > 180) cible -= 360;
  while (cam.rz - cible > 180) cible += 360;
  cam.rz = cible;
  let zoom, tilt, cx = 0, cy = 0, ty = 0;
  if (mode === 'vue') {
    zoom = Math.min(W / (B * 0.97), H / (B * 0.9));
    tilt = 34;
  } else {
    zoom = Math.min(1.3, Math.max(W, 340) / 300);
    tilt = 52;
    ty = H * 0.2;
    const c = cases[i];
    const fx = c.offsetLeft + c.offsetWidth / 2, fy = c.offsetTop + c.offsetHeight / 2;
    cx = (B / 2 - fx) * 0.82; cy = (B / 2 - fy) * 0.82;
  }
  p.style.setProperty('--rz', cam.rz + 'deg');
  p.style.setProperty('--zoom', zoom);
  p.style.setProperty('--tilt', tilt + 'deg');
  p.style.setProperty('--cx', cx + 'px');
  p.style.setProperty('--cy', cy + 'px');
  p.style.setProperty('--ty', ty + 'px');
}
addEventListener('resize', () => { if (S && cases.length) { placerPions(); camera(cam.mode, cam.i); } });

async function avancer(n) {
  const j = moi();
  const pas = n < 0 ? -1 : 1;
  for (let s = 0; s < Math.abs(n); s++) {
    j.pos = (j.pos + pas + N) % N;
    camera('zoom', j.pos);
    await sauter(S.tour, j.pos, 260, s === Math.abs(n) - 1);
    if (j.pos === 0 && pas > 0) { crediter(S.tour, SALAIRE); dire(`${j.nom} passe par le Départ : +${SALAIRE}.`); }
  }
  cases[j.pos].classList.remove('flash'); void cases[j.pos].offsetWidth; cases[j.pos].classList.add('flash');
}
const allerVers = (cible) => avancer((cible - moi().pos + N) % N || N);

async function auxMenottes() {
  const j = moi();
  j.pos = 10; j.menottes = true;
  camera('zoom', 10);
  await sauter(S.tour, 10, 900, true);
  majJoueurs();
  dire(`${j.nom} est aux Menottes.`);
}

function marquer(i, k, anime = true) {
  cases[i].querySelector('.proprio')?.remove();
  const m = document.createElement('span');
  m.className = 'proprio';
  m.style.background = `var(--j${k})`;
  if (!anime) m.style.animation = 'none';
  m.textContent = S.joueurs[k].nom[0].toUpperCase();
  cases[i].querySelector('.in').append(m);
}

/* ---------- Dés ---------- */
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
// Rotation du cube qui met la face voulue vers le haut (face 1 = dessus au repos).
const ROT = { 1: [0, 0], 2: [90, 0], 3: [0, -90], 4: [0, 90], 5: [-90, 0], 6: [0, 180] };
const cubes = [...document.querySelectorAll('.cube')];
cubes.forEach((c, k) => {
  for (let f = 1; f <= 6; f++) {
    c.insertAdjacentHTML('beforeend', `<div class="f f${f}">${Array.from({ length: 9 }, (_, n) => `<i class="${PIPS[f].includes(n) ? 'on' : ''}"></i>`).join('')}</div>`);
  }
  c._r = ROT[k ? 3 : 5];
  c.style.transform = `rotateX(${c._r[0]}deg) rotateY(${c._r[1]}deg)`;
});

async function lancerDes() {
  const v = [1 + hasard(6), 1 + hasard(6)];
  await Promise.all(cubes.map(async (c, k) => {
    const [rx, ry] = ROT[v[k]];
    const tours = 2 + hasard(2);
    const fin = [rx + 360 * tours * (k ? -1 : 1), ry + 360 * (tours + 1)];
    const de = c.parentElement;
    if (!reduit) {
      de.animate([
        { transform: 'translateZ(32px) translate(0,0)' },
        { transform: `translateZ(260px) translate(${k ? 20 : -20}px,-60px)`, offset: .38 },
        { transform: 'translateZ(32px) translate(0,0)', offset: .72 },
        { transform: 'translateZ(60px)', offset: .84 },
        { transform: 'translateZ(32px)' },
      ], { duration: 1150 + k * 90, easing: 'ease-out' });
      await c.animate([{ transform: `rotateX(${c._r[0]}deg) rotateY(${c._r[1]}deg)` }, { transform: `rotateX(${fin[0]}deg) rotateY(${fin[1]}deg)` }],
        { duration: 1150 + k * 90, easing: 'cubic-bezier(.2,.7,.25,1)' }).finished;
    }
    c._r = [rx, ry];
    c.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  }));
  return v;
}

/* ---------- Argent ---------- */
function crediter(k, m) { S.joueurs[k].argent += m; majJoueurs(k, m); }
function payer(k, m, vers = null) { crediter(k, -m); if (vers !== null) crediter(vers, m); }

function majJoueurs(k = null, delta = 0) {
  document.querySelectorAll('.joueur').forEach((el, i) => {
    const j = S.joueurs[i];
    el.classList.toggle('actif', i === S.tour);
    el.querySelector('.nom').textContent = j.nom + (j.menottes ? ', menotté' : '');
    const b = el.querySelector('.argent b');
    const cible = j.argent, depart = +b.dataset.v || 0;
    b.dataset.v = cible;
    if (reduit || depart === cible) b.textContent = cible;
    else {
      const t0 = performance.now();
      const tick = (t) => { const p = Math.min(1, (t - t0) / 700); b.textContent = Math.round(depart + (cible - depart) * (1 - (1 - p) ** 3)); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }
    if (i === k && delta) {
      const d = document.createElement('span');
      d.className = 'delta ' + (delta > 0 ? 'plus' : 'moins');
      d.textContent = (delta > 0 ? '+' : '−') + Math.abs(delta);
      el.querySelector('.argent').append(d);
      setTimeout(() => d.remove(), 1300);
    }
    el.querySelector('.lieux').innerHTML = Object.entries(S.proprios).filter(([, p]) => p === i)
      .sort((a, b) => a[0] - b[0]).map(([c]) => `<i style="background:${GROUPES[CASES[c].g].couleur}"></i>`).join('');
  });
}

function majTour() {
  document.documentElement.style.setProperty('--vif', `var(--j${S.tour})`);
  majJoueurs();
  $('#btnLancer').textContent = `${moi().nom}, lance les dés`;
}
const dire = (t) => { $('#journal').textContent = t; };

/* ---------- Feuilles et cartes ---------- */
function acte(i, avecGage = true) {
  const c = CASES[i], p = S.proprios[i], gr = GROUPES[c.g];
  const lignes = c.type === 'acc' ? [['Avec 1 accessoire', 25], ['Avec 2', 50], ['Avec 3', 100], ['Avec les 4', 200]]
    : c.type === 'amb' ? [['Avec 1 ambiance', '4 × les dés'], ['Avec les 2', '10 × les dés']]
    : [['Loyer', loyerBase(c)], ['Avec tout le groupe', loyerBase(c) * 2]];
  const nature = avecGage ? `<p class="nature"><em>Ou en nature</em>${majuscule(avec(c.gages[S.niveau], 'le visiteur', 'le propriétaire'))}</p>` : '';
  return `<div class="acte"><div class="acte-tete" style="background:${gr.couleur}"><strong>${c.nom}</strong><span>${gr.nom}, prix ${c.prix}</span></div>
    <div class="acte-corps">${lignes.map(([a, b]) => `<p class="ligne"><span>${a}</span><b>${b}</b></p>`).join('')}
    ${p !== undefined ? `<p class="proprietaire">Appartient à ${S.joueurs[p].nom}</p>` : ''}${nature}</div></div>`;
}

function ouvrir({ titre, texte, sous, carte, html: extra, nature, minuteur, boutons }) {
  return new Promise((resoudre) => {
    const calque = $('#calque');
    calque.innerHTML = '<div class="voile"></div>';
    const f = document.createElement('div');
    f.className = 'feuille'; f.setAttribute('role', 'dialog'); f.setAttribute('aria-modal', 'true');
    let html = '';
    if (carte) {
      html += `<div class="carte-scene"><div class="carte ${carte.toLowerCase()}"><div class="dos">${carte}</div><div class="face"><span class="type">${carte}</span><p>${texte}</p></div></div></div>`;
      f.setAttribute('aria-label', carte + ' : ' + texte);
    } else {
      if (titre) html += `<h2>${titre}</h2>`;
      html += (sous ? `<p class="sous">${sous}</p>` : '') + (extra || '') + (texte ? `<p>${texte}</p>` : '');
      f.setAttribute('aria-label', titre || 'Carte');
    }
    if (nature) html += `<div class="gage-nature"><b>En nature</b>${nature}</div>`;
    minuteur = minuteur || dureeDe((carte ? texte : '') + (nature || ''));
    if (minuteur) html += `<div class="minuteur"><button class="btn second" type="button">Minuteur</button><div class="piste"><i></i></div><output>${hms(minuteur)}</output></div>`;
    if (carte || nature) html += `<p class="stop">Mot d’arrêt : ${S.stop}. Il arrête tout, sans discussion.</p>`;
    html += '<div class="actions"></div>';
    f.innerHTML = html;
    boutons.forEach((b, k) => {
      const el = document.createElement('button');
      el.className = 'btn ' + (k === 0 ? 'principal' : 'second');
      el.textContent = b.label; el.disabled = !!b.off;
      el.onclick = () => { arreterMinuteur(); calque.classList.add('sort'); setTimeout(() => { calque.hidden = true; calque.classList.remove('sort'); resoudre(b.v); }, reduit ? 0 : 280); };
      f.querySelector('.actions').append(el);
    });
    if (minuteur) brancherMinuteur(f.querySelector('.minuteur'), minuteur);
    calque.append(f); calque.hidden = false;
    if (carte) setTimeout(() => f.querySelector('.carte').classList.add('retournee'), reduit ? 0 : 420);
    setTimeout(() => f.querySelector('.actions .btn')?.focus({ preventScroll: true }), reduit ? 0 : 400);
  });
}

const hms = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
let minuterie = null;
function arreterMinuteur() { clearInterval(minuterie); minuterie = null; }
function brancherMinuteur(el, total) {
  const bouton = el.querySelector('button'), barre = el.querySelector('.piste i'), out = el.querySelector('output');
  bouton.onclick = () => {
    arreterMinuteur();
    const t0 = Date.now();
    bouton.textContent = 'Relancer';
    barre.getAnimations().forEach((a) => a.cancel());
    barre.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: total * 1000, fill: 'forwards' });
    minuterie = setInterval(() => {
      const reste = Math.max(0, total - Math.floor((Date.now() - t0) / 1000));
      out.textContent = hms(reste);
      if (!reste) { arreterMinuteur(); out.textContent = 'Fini'; navigator.vibrate?.([200, 100, 200]); }
    }, 250);
  };
}

function detailCase(i) {
  const c = CASES[i];
  if (c.prix) return ouvrir({ html: acte(i), boutons: [{ label: 'Fermer' }] });
  const sous = {
    depart: `Chaque passage rapporte ${SALAIRE} frissons.`,
    gage: `On pioche un gage. Le faire rapporte ${BONUS_GAGE}, s’y dérober coûte ${AMENDE_FUITE} à verser à l’autre.`,
    tentation: 'Une carte qui déplace, enrichit ou ruine. Parfois avec un petit supplément.',
    taxe: `Payer ${c.montant} frissons à la banque, ou payer en nature.`,
    menottes: `En visite, rien ne se passe. Menotté, on sort en payant ${CAUTION} ou en faisant un gage.`,
    pause: 'Un câlin, et rien d’autre.',
    allez: 'Direction les Menottes, sans passer par le Départ.',
  }[c.type];
  ouvrir({ titre: c.nom, sous, boutons: [{ label: 'Fermer' }] });
}

async function animerPioche(sel) {
  camera('vue');
  await attendre(900);
  const lame = $(sel).lastElementChild;
  if (!reduit) {
    const base = lame.style.transform;
    await lame.animate([
      { transform: base },
      { transform: `${base} translateZ(150px) translateY(-30px) rotateZ(14deg) rotateX(-25deg)`, opacity: 1, offset: .65 },
      { transform: `${base} translateZ(320px) translateY(-60px) rotateZ(24deg) rotateX(-60deg)`, opacity: 0 },
    ], { duration: 750, easing: 'cubic-bezier(.3,.6,.3,1)' }).finished;
  }
}

/* ---------- Tour de jeu ---------- */
async function lancer() {
  if (occupe || S.fini) return;
  occupe = true; $('#btnLancer').disabled = true;
  let doubles = 0;
  for (;;) {
    const j = moi();
    if (j.menottes) await sortirMenottes();
    camera('vue');
    const [a, b] = await lancerDes();
    S.des = a + b;
    const double = a === b;
    if (double) doubles++;
    if (doubles === 3) { dire(`Trois doubles de suite, ${j.nom} est trop pressé.`); await attendre(500); await auxMenottes(); break; }
    dire(`${j.nom} fait ${a} et ${b}.` + (double ? ' Double, rejoue après.' : ''));
    await attendre(250);
    camera('zoom', j.pos);
    await attendre(650);
    await avancer(a + b);
    await attendre(300);
    await resoudre();
    if (S.joueurs.some((x) => x.argent < 0) || !double || j.menottes) break;
    sauver(); majJoueurs();
    dire(`Double : ${j.nom} rejoue.`);
    await attendre(700);
  }
  if (!verifierFin()) { S.tour = 1 - S.tour; sauver(); majTour(); camera('vue'); }
  occupe = false; $('#btnLancer').disabled = false;
}

async function sortirMenottes() {
  const j = moi();
  camera('zoom', 10);
  const v = await ouvrir({
    titre: `${j.nom} est menotté`, sous: 'Pour sortir et jouer ce tour :',
    boutons: [
      ...(j.libere ? [{ label: 'Utiliser la carte Coffre fort', v: 'carte' }] : []),
      { label: `Payer la caution, ${CAUTION} frissons`, v: 'payer' },
      { label: 'Faire un gage', v: 'gage' },
    ],
  });
  if (v === 'carte') j.libere--;
  if (v === 'payer') payer(S.tour, CAUTION);
  if (v === 'gage') await tirerGage(false);
  j.menottes = false; majJoueurs(); sauver();
}

async function tirerGage(recompense = true) {
  await animerPioche('#pileGage');
  const g = piocheGage();
  const v = await ouvrir({
    carte: 'Gage', texte: fmt(g.txt),
    boutons: [
      { label: recompense ? `C’est fait, +${BONUS_GAGE}` : 'C’est fait', v: 'ok' },
      { label: `Je me défile, ${AMENDE_FUITE} à ${toi().nom}`, v: 'fuite' },
    ],
  });
  if (v === 'ok' && recompense) crediter(S.tour, BONUS_GAGE);
  if (v === 'fuite') { payer(S.tour, AMENDE_FUITE, 1 - S.tour); dire(`${moi().nom} se défile et paie ${AMENDE_FUITE}.`); }
}

async function resoudre() {
  const j = moi(), c = CASES[j.pos];
  if (c.prix) return resoudrePropriete(j.pos);
  switch (c.type) {
    case 'gage': return tirerGage();
    case 'tentation': return tirerTentation();
    case 'taxe': {
      const v = await ouvrir({ titre: c.nom, sous: `Paie ${c.montant} frissons à la banque, ou :`, texte: fmt(c.alt),
        boutons: [{ label: 'Payer en nature', v: 'nature' }, { label: `Payer ${c.montant}`, v: 'payer' }] });
      if (v === 'payer') payer(S.tour, c.montant);
      return;
    }
    case 'pause': return ouvrir({ titre: c.nom, texte: fmt(c.txt), minuteur: 30, boutons: [{ label: 'Avec plaisir' }] });
    case 'allez':
      await ouvrir({ titre: 'Outrage à la pudeur', sous: `${j.nom} part aux Menottes, sans passer par le Départ.`, boutons: [{ label: 'Tendre les poignets' }] });
      return auxMenottes();
    case 'menottes': return dire(`${j.nom} rend visite aux Menottes.`);
    default: return dire(`${j.nom} est sur le Départ.`);
  }
}

async function resoudrePropriete(i) {
  const c = CASES[i], p = S.proprios[i], j = moi();
  if (p === undefined) {
    const peut = j.argent >= c.prix;
    const v = await ouvrir({
      html: acte(i),
      boutons: [{ label: peut ? `Acheter pour ${c.prix}` : `Pas assez de frissons (${c.prix})`, v: 'achat', off: !peut }, { label: 'Ne pas acheter', v: 'non' }],
    });
    if (v === 'achat') { S.proprios[i] = S.tour; payer(S.tour, c.prix); marquer(i, S.tour); majJoueurs(); dire(`${j.nom} achète ${c.nom}.`); }
    return;
  }
  if (p === S.tour) return dire(`${j.nom} est chez lui ou chez elle, ${c.nom}.`);
  const loyer = loyerDe(i);
  const v = await ouvrir({
    titre: `Chez ${toi().nom}`, sous: `${c.nom}. Loyer : ${loyer} frissons. Ou bien :`,
    nature: fmt(c.gages[S.niveau]),
    boutons: [{ label: 'Payé en nature', v: 'nature' }, { label: `Payer ${loyer}`, v: 'payer' }],
  });
  if (v === 'payer') payer(S.tour, loyer, p);
  else dire(`${j.nom} a payé en nature.`);
}

async function tirerTentation() {
  await animerPioche('#pileTentation');
  const t = pioche('tentation', TENTATIONS);
  await ouvrir({ carte: 'Tentation', texte: fmt(t.txt), boutons: [{ label: 'D’accord' }] });
  const fx = t.fx;
  if (fx.argent) crediter(S.tour, fx.argent);
  if (fx.deLautre) payer(1 - S.tour, fx.deLautre, S.tour);
  if (fx.libere) { moi().libere++; majJoueurs(); }
  if (fx.menottes) return auxMenottes();
  if (fx.recule || fx.vers !== undefined) {
    camera('zoom'); await attendre(800);
    await (fx.recule ? avancer(-fx.recule) : allerVers(fx.vers));
    await attendre(300);
    return resoudre();
  }
}

/* ---------- Fin ---------- */
function verifierFin() {
  const ruine = S.joueurs.findIndex((j) => j.argent < 0);
  if (ruine < 0) return false;
  terminer(1 - ruine, `${S.joueurs[ruine].nom} n’a plus un frisson.`);
  return true;
}
function terminer(g, raison) {
  S.fini = { g, raison, gage: pioche('gagefin', gagesDuNiveau(Math.min(2, S.niveau + 1))).txt };
  sauver(); afficherFin();
}
function afficherFin() {
  const g = S.joueurs[S.fini.g], p = S.joueurs[1 - S.fini.g];
  document.documentElement.style.setProperty('--vif', `var(--j${S.fini.g})`);
  $('#finTitre').textContent = `${g.nom} gagne`;
  $('#finTexte').textContent = `${S.fini.raison} ${p.nom} est à sa merci pour le reste de la soirée. Premier ordre :`;
  $('#finCarte').textContent = avec(S.fini.gage, p.nom, g.nom);
  montrer('fin');
}

/* ---------- Écrans ---------- */
function montrer(id) {
  ['accueil', 'jeu', 'fin'].forEach((e) => { $('#' + e).hidden = e !== id; });
  if (reduit || id === 'jeu') return;
  [...$('#' + id).children].forEach((c, k) => c.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: k * 70, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
}

function demarrer() {
  montrer('jeu');
  construirePlateau();
  majTour();
  // Entrée : le plateau arrive de haut, vu de face, puis se couche.
  const p = $('#plateau');
  p.style.transition = 'none';
  p.style.setProperty('--tilt', '0deg'); p.style.setProperty('--zoom', .2);
  p.style.setProperty('--rz', '-30deg');
  void p.offsetWidth;
  p.style.transition = '';
  cam.rz = -30;
  requestAnimationFrame(() => camera('vue'));
  dire('Touchez une case pour lire son titre de propriété.');
}

$('#formNouvelle').onsubmit = (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const propre = (v) => v.replace(/[<>&"]/g, '').trim();
  const noms = [propre(f.get('j1')) || 'Joueur 1', propre(f.get('j2')) || 'Joueur 2'];
  S = {
    joueurs: noms.map((nom) => ({ nom, argent: ARGENT_DEPART, pos: 0, menottes: false, libere: 0 })),
    tour: hasard(2), proprios: {}, niveau: +f.get('niveau'), stop: propre(f.get('stop')) || 'Ananas', paquets: {}, fini: null, des: 7,
  };
  sauver(); demarrer();
};
$('#btnLancer').onclick = lancer;
$('#btnRejouer').onclick = () => { localStorage.removeItem(CLE); location.reload(); };
$('#reprendre').onclick = () => (S.fini ? afficherFin() : demarrer());
$('#btnMenu').onclick = async () => {
  if (occupe) return;
  const v = await ouvrir({
    titre: 'Menu', sous: `Mot d’arrêt : ${S.stop}. Intensité : ${['douce', 'coquine', 'brûlante'][S.niveau]}.`,
    boutons: [{ label: 'Continuer la partie' }, { label: 'Finir, le plus riche gagne', v: 'fin' }, { label: 'Abandonner et revenir à l’accueil', v: 'quitter' }],
  });
  if (v === 'fin') { const g = patrimoine(0) >= patrimoine(1) ? 0 : 1; terminer(g, `${S.joueurs[g].nom} a le plus gros patrimoine, ${patrimoine(g)} frissons.`); }
  if (v === 'quitter') { localStorage.removeItem(CLE); location.reload(); }
};

// shortcut: l'état n'est sauvé qu'en fin de tour, un rechargement en plein tour fait rejouer ce tour ; suffisant pour un jeu de salon.
try { S = JSON.parse(localStorage.getItem(CLE)); } catch { S = null; }
if (S) $('#reprendre').hidden = false;
montrer('accueil');

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
