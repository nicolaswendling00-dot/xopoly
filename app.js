const $ = (s) => document.querySelector(s);
const CLE = 'xopoly-v1';
const ARGENT_DEPART = 1000, SALAIRE = 150, BONUS_GAGE = 30, AMENDE_FUITE = 100, CAUTION = 50;
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

function melange(t) {
  for (let i = t.length - 1; i > 0; i--) { const j = hasard(i + 1); [t[i], t[j]] = [t[j], t[i]]; }
  return t;
}
// Pioche sans répétition tant que le paquet n'est pas épuisé.
function pioche(nom, liste) {
  if (!S.paquets[nom]?.length) S.paquets[nom] = melange(liste.map((_, i) => i));
  return liste[S.paquets[nom].pop()];
}
// Un niveau mélange ses gages avec ceux du niveau juste en dessous.
const gagesDuNiveau = (n) => GAGES.filter((g) => g.n === n || g.n === n - 1);
const piocheGage = () => pioche('gage' + S.niveau, gagesDuNiveau(S.niveau));

const groupeComplet = (j, g) => CASES.every((c, i) => c.g !== g || S.proprios[i] === j);
const loyerDe = (i) => CASES[i].loyer * (groupeComplet(S.proprios[i], CASES[i].g) ? 2 : 1);
const patrimoine = (j) => S.joueurs[j].argent + Object.entries(S.proprios).reduce((s, [i, p]) => s + (p === j ? CASES[i].prix : 0), 0);

/* ---------- Plateau ---------- */
// Case 0 en bas à droite, sens des aiguilles d'une montre vu de dessus.
function coord(i) {
  if (i <= 5) return [5, 5 - i];
  if (i <= 9) return [5 - (i - 5), 0];
  if (i <= 15) return [0, i - 10];
  return [i - 15, 5];
}
const cases = [];
const pions = [];

function construirePlateau() {
  const p = $('#plateau');
  p.querySelectorAll('.case, .pion').forEach((e) => e.remove());
  cases.length = pions.length = 0;
  CASES.forEach((c, i) => {
    const b = document.createElement('button');
    const coin = i % 5 === 0;
    b.className = 'case ' + c.type + (coin ? ' coin' : '');
    const [r, col] = coord(i);
    b.style.gridArea = `${r + 1} / ${col + 1}`;
    b.setAttribute('aria-label', c.nom + (c.prix ? `, ${c.prix} frissons` : ''));
    b.innerHTML = (c.g ? `<span class="bande" style="background:${GROUPES[c.g].couleur}"></span>` : '') +
      `<span class="court">${c.court}</span>` + (c.prix ? `<span class="px">${c.prix}</span>` : '');
    b.onclick = () => !occupe && detailCase(i);
    p.append(b); cases.push(b);
  });
  S.joueurs.forEach((j, k) => {
    const d = document.createElement('div');
    d.className = 'pion'; d.dataset.j = k; d.textContent = j.nom[0].toUpperCase();
    p.append(d); pions.push(d);
  });
  placerPions();
  Object.entries(S.proprios).forEach(([i, j]) => marquer(+i, j, false));
}

function posPion(k, i) {
  const c = cases[i];
  // Pions dans le bas de la case pour laisser lire son nom.
  const x = c.offsetLeft + c.offsetWidth / 2 - 11 + (k ? 9 : -9);
  const y = c.offsetTop + c.offsetHeight - 22 - 3 + (k ? 0 : -4);
  return [x, y];
}
function placerPions() {
  pions.forEach((el, k) => { const [x, y] = posPion(k, S.joueurs[k].pos); el.style.transform = `translate(${x}px,${y}px)`; el._xy = [x, y]; });
}
addEventListener('resize', () => S && cases.length && placerPions());

async function sauter(k, i, duree = 230, dernier = false) {
  const el = pions[k];
  const [x, y] = posPion(k, i), [x0, y0] = el._xy;
  const fin = `translate(${x}px,${y}px)`;
  if (!reduit) {
    const im = [
      { transform: `translate(${x0}px,${y0}px)` },
      { transform: `translate(${(x0 + x) / 2}px,${(y0 + y) / 2 - 16}px) scale(1.25)`, offset: .5 },
      { transform: fin },
    ];
    if (dernier) im.splice(2, 0, { transform: `translate(${x}px,${y}px) scale(1.2,.8)`, offset: .82 });
    await el.animate(im, { duration: dernier ? duree * 1.5 : duree, easing: 'ease-in-out' }).finished;
  }
  el.style.transform = fin; el._xy = [x, y];
}

async function avancer(n) {
  const j = moi();
  const pas = n < 0 ? -1 : 1;
  pions.forEach((p, k) => p.classList.toggle('actif', k === S.tour));
  for (let s = 0; s < Math.abs(n); s++) {
    j.pos = (j.pos + pas + 20) % 20;
    await sauter(S.tour, j.pos, 230, s === Math.abs(n) - 1);
    if (j.pos === 0 && pas > 0) { crediter(S.tour, SALAIRE); dire(`${j.nom} passe par le Départ : +${SALAIRE}.`); }
  }
  cases[j.pos].classList.remove('flash'); void cases[j.pos].offsetWidth; cases[j.pos].classList.add('flash');
}
const allerVers = (cible) => avancer((cible - moi().pos + 20) % 20 || 20);

async function auxMenottes() {
  const j = moi();
  j.pos = 5; j.menottes = true;
  await sauter(S.tour, 5, 700, true);
  dire(`${j.nom} est aux Menottes.`);
}

function marquer(i, k, anime = true) {
  cases[i].querySelector('.proprio')?.remove();
  const m = document.createElement('span');
  m.className = 'proprio';
  m.style.background = `var(--j${k})`;
  if (!anime) m.style.animation = 'none';
  m.textContent = S.joueurs[k].nom[0].toUpperCase();
  cases[i].append(m);
}

/* ---------- Dés ---------- */
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const ROT = { 1: [0, 0], 2: [90, 0], 3: [0, -90], 4: [0, 90], 5: [-90, 0], 6: [0, 180] };
const cubes = [...document.querySelectorAll('.cube')];
cubes.forEach((c) => {
  for (let f = 1; f <= 6; f++) {
    c.insertAdjacentHTML('beforeend', `<div class="f f${f}">${Array.from({ length: 9 }, (_, k) => `<i class="${PIPS[f].includes(k) ? 'on' : ''}"></i>`).join('')}</div>`);
  }
  c._r = [-20, 20];
});

async function lancerDes() {
  const v = [1 + hasard(6), 1 + hasard(6)];
  await Promise.all(cubes.map(async (c, k) => {
    const [rx, ry] = ROT[v[k]];
    const tours = 2 + hasard(2);
    const fin = [rx + 360 * tours * (k ? -1 : 1) - 12, ry + 360 * tours + 14];
    const de = c.parentElement;
    if (!reduit) {
      de.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-46px) scale(1.15)', offset: .35 }, { transform: 'translateY(0)', offset: .75 }, { transform: 'translateY(-6px)', offset: .88 }, { transform: 'translateY(0)' }], { duration: 950, easing: 'ease-out' });
      await c.animate([{ transform: `rotateX(${c._r[0]}deg) rotateY(${c._r[1]}deg)` }, { transform: `rotateX(${fin[0]}deg) rotateY(${fin[1]}deg)` }], { duration: 950 + k * 120, easing: 'cubic-bezier(.15,.75,.25,1)' }).finished;
    }
    c._r = [((fin[0] % 360) + 360) % 360, ((fin[1] % 360) + 360) % 360];
    c.style.transform = `rotateX(${c._r[0]}deg) rotateY(${c._r[1]}deg)`;
  }));
  return v;
}

/* ---------- Argent ---------- */
function crediter(k, m) {
  S.joueurs[k].argent += m;
  majJoueurs(k, m);
}
function payer(k, m, vers = null) {
  crediter(k, -m);
  if (vers !== null) crediter(vers, m);
}

function majJoueurs(k = null, delta = 0) {
  document.querySelectorAll('.joueur').forEach((el, i) => {
    const j = S.joueurs[i];
    el.classList.toggle('actif', i === S.tour);
    el.querySelector('.nom').textContent = j.nom + (j.menottes ? ' (menotté)' : '');
    const b = el.querySelector('.argent b');
    const cible = j.argent, depart = +b.dataset.v || 0;
    b.dataset.v = cible;
    if (reduit || depart === cible) b.textContent = cible;
    else {
      const t0 = performance.now();
      const tick = (t) => { const p = Math.min(1, (t - t0) / 600); b.textContent = Math.round(depart + (cible - depart) * (1 - (1 - p) ** 3)); if (p < 1) requestAnimationFrame(tick); };
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
      .sort((a, b) => a[0] - b[0]).map(([c]) => `<i style="background:${GROUPES[CASES[c].g].couleur}" title="${CASES[c].nom}"></i>`).join('');
  });
}

function majTour() {
  const j = moi();
  document.documentElement.style.setProperty('--vif', `var(--j${S.tour})`);
  $('#aQui').innerHTML = `À <b>${j.nom}</b> de jouer`;
  pions.forEach((p, k) => p.classList.toggle('actif', k === S.tour));
  majJoueurs();
}
const dire = (t) => { $('#journal').textContent = t; };

/* ---------- Feuilles et cartes ---------- */
function ouvrir({ titre, texte, sous, carte, nature, minuteur, boutons }) {
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
      html += `<h2>${titre}</h2>` + (sous ? `<p class="sous">${sous}</p>` : '') + (texte ? `<p>${texte}</p>` : '');
      f.setAttribute('aria-label', titre);
    }
    if (nature) html += `<div class="gage-nature"><b>En nature</b>${nature}</div>`;
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
    if (carte) setTimeout(() => f.querySelector('.carte').classList.add('retournee'), reduit ? 0 : 450);
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
  const p = S.proprios[i];
  let sous = '', nature = null;
  if (c.type === 'lieu') {
    sous = `${GROUPES[c.g].nom}. Prix ${c.prix}, loyer ${c.loyer} (le double avec tout le groupe).` +
      (p !== undefined ? ` Appartient à ${S.joueurs[p].nom}.` : ' Libre.');
    nature = c.gages[S.niveau].replaceAll('{moi}', 'le visiteur').replaceAll('{toi}', 'le propriétaire');
  } else sous = {
    depart: `Chaque passage rapporte ${SALAIRE} frissons.`,
    gage: `On pioche un gage. Le faire rapporte ${BONUS_GAGE}, s’y dérober coûte ${AMENDE_FUITE} à verser à l’autre.`,
    tentation: 'Une carte qui déplace, enrichit ou ruine. Parfois avec un petit supplément.',
    taxe: `Payer ${c.montant} frissons, ou retirer un vêtement.`,
    menottes: `En visite, rien ne se passe. Prisonnier, on sort en payant ${CAUTION} ou en faisant un gage.`,
    pause: 'Un câlin, et rien d’autre.',
    allez: 'Direction les Menottes, sans passer par le Départ.',
  }[c.type];
  ouvrir({ titre: c.nom, sous, nature, boutons: [{ label: 'Fermer' }] });
}

/* ---------- Tour de jeu ---------- */
async function lancer() {
  if (occupe || S.fini) return;
  occupe = true; $('#btnLancer').disabled = true;
  const j = moi();
  if (j.menottes) await sortirMenottes();
  const [a, b] = await lancerDes();
  dire(`${j.nom} fait ${a + b}.`);
  await attendre(150);
  await avancer(a + b);
  await attendre(250);
  await resoudre();
  if (!verifierFin()) { S.tour = 1 - S.tour; sauver(); majTour(); }
  occupe = false; $('#btnLancer').disabled = false;
}

async function sortirMenottes() {
  const j = moi();
  const v = await ouvrir({
    titre: `${j.nom}, tu es menotté`, sous: 'Pour sortir et jouer ce tour :',
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
  const g = piocheGage();
  const v = await ouvrir({
    carte: 'Gage', texte: fmt(g.txt), minuteur: g.t,
    boutons: [
      { label: recompense ? `C’est fait, +${BONUS_GAGE}` : 'C’est fait', v: 'ok' },
      { label: `Je me défile, ${AMENDE_FUITE} à ${toi().nom}`, v: 'fuite' },
    ],
  });
  if (v === 'ok' && recompense) crediter(S.tour, BONUS_GAGE);
  if (v === 'fuite') { payer(S.tour, AMENDE_FUITE, 1 - S.tour); dire(`${moi().nom} se défile et paie ${AMENDE_FUITE}.`); }
}

async function resoudre() {
  const j = moi(), i = j.pos, c = CASES[i];
  switch (c.type) {
    case 'lieu': return resoudreLieu(i);
    case 'gage': return tirerGage();
    case 'tentation': return tirerTentation();
    case 'taxe': {
      const v = await ouvrir({ titre: c.nom, sous: `Paie ${c.montant} frissons à la banque, ou :`, texte: fmt(TAXE_ALTERNATIVE),
        boutons: [{ label: 'Retirer un vêtement', v: 'nature' }, { label: `Payer ${c.montant}`, v: 'payer' }] });
      if (v === 'payer') payer(S.tour, c.montant);
      return;
    }
    case 'pause':
      return ouvrir({ titre: c.nom, texte: fmt(PAUSE_TXT), minuteur: 30, boutons: [{ label: 'Avec plaisir' }] });
    case 'allez':
      await ouvrir({ titre: 'Outrage à la pudeur', sous: `${j.nom} part aux Menottes, sans passer par le Départ.`, boutons: [{ label: 'Tendre les poignets' }] });
      return auxMenottes();
    case 'menottes': return dire(`${j.nom} rend visite aux Menottes.`);
    default: return dire(`${j.nom} est sur le Départ.`);
  }
}

async function resoudreLieu(i) {
  const c = CASES[i], p = S.proprios[i], j = moi();
  const nature = fmt(c.gages[S.niveau]);
  if (p === undefined) {
    const peut = j.argent >= c.prix;
    const v = await ouvrir({
      titre: c.nom,
      sous: `${GROUPES[c.g].nom}. Loyer ${c.loyer}, doublé avec tout le groupe. Ou ce gage, payé en nature par l’autre :`,
      nature: c.gages[S.niveau].replaceAll('{moi}', toi().nom).replaceAll('{toi}', j.nom),
      boutons: [{ label: peut ? `Acheter pour ${c.prix}` : `Pas assez de frissons (${c.prix})`, v: 'achat', off: !peut }, { label: 'Ne pas acheter', v: 'non' }],
    });
    if (v === 'achat') { S.proprios[i] = S.tour; payer(S.tour, c.prix); marquer(i, S.tour); majJoueurs(); dire(`${j.nom} achète ${c.nom}.`); }
    return;
  }
  if (p === S.tour) return dire(`${j.nom} est chez lui ou chez elle, à ${c.nom}.`);
  const loyer = loyerDe(i);
  const v = await ouvrir({
    titre: `${c.nom}, chez ${toi().nom}`, sous: `Loyer : ${loyer} frissons${loyer > c.loyer ? ', groupe complet' : ''}. Ou bien :`,
    nature, minuteur: c.minuteur,
    boutons: [{ label: 'Payé en nature', v: 'nature' }, { label: `Payer ${loyer}`, v: 'payer' }],
  });
  if (v === 'payer') payer(S.tour, loyer, p);
  else dire(`${j.nom} a payé en nature.`);
}

async function tirerTentation() {
  const t = pioche('tentation', TENTATIONS);
  await ouvrir({ carte: 'Tentation', texte: fmt(t.txt), minuteur: t.t, boutons: [{ label: 'D’accord' }] });
  const fx = t.fx;
  if (fx.argent) crediter(S.tour, fx.argent);
  if (fx.deLautre) payer(1 - S.tour, fx.deLautre, S.tour);
  if (fx.libere) { moi().libere++; majJoueurs(); }
  if (fx.menottes) return auxMenottes();
  if (fx.recule) { await avancer(-fx.recule); await attendre(250); return resoudre(); }
  if (fx.vers !== undefined) { await allerVers(fx.vers); await attendre(250); return resoudre(); }
}

/* ---------- Fin ---------- */
function verifierFin() {
  const ruine = S.joueurs.findIndex((j) => j.argent < 0);
  if (ruine < 0) return false;
  terminer(1 - ruine, `${S.joueurs[ruine].nom} est ruiné de frissons.`);
  return true;
}
function terminer(g, raison) {
  S.fini = { g, raison, gage: pioche('gage2', gagesDuNiveau(Math.min(2, S.niveau + 1))).txt };
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
  const el = $('#' + id);
  if (!reduit) [...el.children].forEach((c, k) => c.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: k * 70, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
}

function demarrer() {
  montrer('jeu');
  construirePlateau();
  cubes.forEach((c) => { c.style.transform = `rotateX(${c._r[0]}deg) rotateY(${c._r[1]}deg)`; });
  majTour();
  dire('Lancez les dés pour commencer.');
}

$('#formNouvelle').onsubmit = (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const propre = (v) => v.replace(/[<>&"]/g, '').trim();
  const noms = [propre(f.get('j1')) || 'Joueur 1', propre(f.get('j2')) || 'Joueur 2'];
  S = {
    joueurs: noms.map((nom) => ({ nom, argent: ARGENT_DEPART, pos: 0, menottes: false, libere: 0 })),
    tour: hasard(2), proprios: {}, niveau: +f.get('niveau'), stop: propre(f.get('stop')) || 'Ananas', paquets: {}, fini: null,
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
