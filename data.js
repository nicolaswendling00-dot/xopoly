// Contenu du jeu. {moi} = joueur dont c'est le tour, {toi} = l'autre.
// Niveaux : 0 doux, 1 coquin, 2 brûlant.

const GROUPES = {
  A: { nom: 'Les Préliminaires', couleur: '#d9a0a8' },
  B: { nom: 'Les Eaux chaudes', couleur: '#3fb6a8' },
  C: { nom: 'Les Lieux publics', couleur: '#e0663a' },
  D: { nom: 'Les Interdits', couleur: '#c8143a' },
};

// gages[n] : ce que le visiteur fait pour le propriétaire s'il paie en nature, au niveau n
const CASES = [
  { type: 'depart', nom: 'Départ', court: 'Départ' },
  { type: 'lieu', g: 'A', nom: 'Le Canapé', court: 'Canapé', prix: 60, loyer: 20, gages: [
    '{moi} se blottit contre {toi} et lui caresse les cheveux pendant une minute.',
    '{moi} s’assoit à califourchon sur {toi} et l’embrasse dans le cou pendant une minute, sans toucher la bouche.',
    '{moi} s’allonge sur {toi} et ondule lentement contre son corps pendant une minute, sans retirer un vêtement.'] },
  { type: 'gage', nom: 'Gage', court: 'Gage' },
  { type: 'lieu', g: 'A', nom: 'La Cuisine', court: 'Cuisine', prix: 70, loyer: 25, gages: [
    '{moi} donne à manger à {toi} à la main, la prochaine chose qu’il ou elle grignotera.',
    '{moi} dépose un peu de chocolat ou de miel sur son propre cou, {toi} vient le retirer avec les lèvres.',
    '{toi} choisit une partie du corps de {moi}, y dépose quelque chose de sucré et le déguste lentement.'] },
  { type: 'taxe', nom: 'Strip-tease fiscal', court: 'Strip taxe', montant: 100 },
  { type: 'menottes', nom: 'Menottes', court: 'Menottes' },
  { type: 'lieu', g: 'B', nom: 'La Douche', court: 'Douche', prix: 100, loyer: 35, gages: [
    '{moi} promet à {toi} une douche à deux ce soir, et la lui savonne entièrement.',
    '{moi} retire le haut de {toi} avec les dents, ou au moins essaie pendant une minute.',
    'Prochaine douche : {toi} décide de tout, {moi} n’a le droit d’utiliser que sa bouche pour laver.'] },
  { type: 'tentation', nom: 'Tentation', court: 'Tentation' },
  { type: 'lieu', g: 'B', nom: 'Le Jacuzzi', court: 'Jacuzzi', prix: 110, loyer: 40, gages: [
    '{moi} masse les épaules de {toi} pendant deux minutes, avec de l’huile si vous en avez.',
    '{moi} masse les cuisses de {toi} pendant deux minutes, en remontant un peu plus à chaque passage.',
    '{moi} masse {toi} partout où {toi} le demande pendant deux minutes, sans rien refuser.'], minuteur: 120 },
  { type: 'lieu', g: 'B', nom: 'Le Sauna', court: 'Sauna', prix: 120, loyer: 45, gages: [
    '{moi} retire un vêtement, au choix de {toi}.',
    '{moi} retire deux vêtements, très lentement, en regardant {toi} dans les yeux.',
    '{moi} reste en sous-vêtements jusqu’à la fin de la partie.'] },
  { type: 'pause', nom: 'Pause câline', court: 'Câlin' },
  { type: 'lieu', g: 'C', nom: 'La Cabine d’essayage', court: 'Cabine', prix: 140, loyer: 55, gages: [
    '{moi} fait un défilé d’une minute pour {toi}, avec la tenue de son choix.',
    '{moi} se change devant {toi} sans se cacher, {toi} choisit la tenue.',
    '{moi} enlève ses sous-vêtements et les donne à {toi}, qui les garde jusqu’à la fin de la partie.'] },
  { type: 'gage', nom: 'Gage', court: 'Gage' },
  { type: 'lieu', g: 'C', nom: 'L’Ascenseur', court: 'Ascenseur', prix: 150, loyer: 60, gages: [
    '{moi} plaque doucement {toi} contre un mur et l’embrasse pendant trente secondes.',
    '{moi} plaque {toi} contre un mur, lui tient les poignets au dessus de la tête et l’embrasse pendant une minute.',
    '{toi} plaque {moi} contre un mur, face au mur, et fait ce qu’il ou elle veut avec ses mains pendant une minute.'], minuteur: 60 },
  { type: 'lieu', g: 'C', nom: 'Le Cinéma', court: 'Cinéma', prix: 160, loyer: 65, gages: [
    '{moi} murmure à l’oreille de {toi} ce qu’il ou elle avait envie de lui faire la dernière fois que vous étiez dehors.',
    '{moi} glisse une main sous les vêtements de {toi} pendant une minute, comme au fond d’une salle obscure, sans un bruit.',
    '{toi} a les yeux bandés. {moi} l’embrasse partout où il ou elle le décide pendant deux minutes.'], minuteur: 60 },
  { type: 'allez', nom: 'Va aux menottes', court: 'Arrêté' },
  { type: 'lieu', g: 'D', nom: 'La Chambre d’hôtel', court: 'Hôtel', prix: 200, loyer: 85, gages: [
    '{moi} raconte à {toi} le fantasme d’hôtel parfait, avec les détails.',
    '{moi} se met à genoux devant {toi} et lui demande poliment ce qu’il ou elle désire. Une demande à exaucer.',
    '{moi} devient le service d’étage de {toi} pour trois minutes : obéissance totale, dans les limites que vous avez fixées.'], minuteur: 180 },
  { type: 'tentation', nom: 'Tentation', court: 'Tentation' },
  { type: 'lieu', g: 'D', nom: 'Le Donjon', court: 'Donjon', prix: 220, loyer: 100, gages: [
    '{toi} attache les poignets de {moi} avec un foulard pendant les deux prochains tours.',
    '{moi} reçoit cinq fessées de {toi}, et doit dire merci après chacune.',
    '{moi} a les mains attachées et les yeux bandés. {toi} a carte blanche pendant trois minutes.'], minuteur: 180 },
  { type: 'gage', nom: 'Gage', court: 'Gage' },
];

// Gages piochés. a : qui agit ('moi' ou 'toi'), t : minuteur en secondes.
const GAGES = [
  // doux
  { n: 0, txt: '{moi} embrasse {toi} pendant dix secondes, sans s’arrêter.' },
  { n: 0, txt: '{moi} dit à {toi} trois choses qu’il ou elle trouve irrésistibles chez lui ou chez elle.' },
  { n: 0, txt: '{toi} embrasse {moi} dans le cou, lentement, cinq fois.' },
  { n: 0, txt: '{moi} retire ses chaussettes, ou un bijou, au choix.' },
  { n: 0, txt: '{moi} masse les pieds de {toi} pendant une minute.', t: 60 },
  { n: 0, txt: '{moi} mordille l’oreille de {toi}, tout doucement.' },
  { n: 0, txt: '{toi} raconte le moment où {moi} lui a fait le plus d’effet.' },
  { n: 0, txt: '{moi} danse un slow avec {toi}, sans musique, pendant une minute.', t: 60 },
  { n: 0, txt: '{moi} trace un mot du bout du doigt dans le dos de {toi}. Trois essais pour deviner.' },
  { n: 0, txt: '{toi} choisit un endroit de son corps, {moi} y dépose dix baisers.' },
  { n: 0, txt: 'Jusqu’au prochain tour de {moi}, vous restez main dans la main.' },
  { n: 0, txt: '{moi} regarde {toi} dans les yeux pendant trente secondes. Le premier qui rit paie 20 à l’autre.', t: 30 },
  // coquin
  { n: 1, txt: '{moi} retire un vêtement, au choix de {toi}.' },
  { n: 1, txt: '{toi} bande les yeux de {moi} et l’embrasse à trois endroits. {moi} doit deviner où.' },
  { n: 1, txt: '{moi} décrit à voix basse ce qu’il ou elle fera à {toi} après la partie.' },
  { n: 1, txt: '{moi} embrasse {toi} de la clavicule jusqu’au nombril, lentement.' },
  { n: 1, txt: '{toi} passe un glaçon, ou ses doigts froids, le long du dos de {moi}.' },
  { n: 1, txt: '{moi} fait un strip-tease d’une minute pour {toi}. Au moins un vêtement doit tomber.', t: 60 },
  { n: 1, txt: '{toi} a les mains dans le dos pendant une minute. {moi} l’allume, mais sans le moindre baiser sur la bouche.', t: 60 },
  { n: 1, txt: '{moi} avoue un fantasme qu’il ou elle n’a jamais dit à {toi}.' },
  { n: 1, txt: '{toi} donne trois petites fessées à {moi}, de la force de son choix.' },
  { n: 1, txt: '{moi} laisse un suçon à {toi}, à un endroit que personne d’autre ne verra.' },
  { n: 1, txt: '{moi} s’assoit sur les genoux de {toi} et se laisse caresser pendant une minute sans bouger.', t: 60 },
  { n: 1, txt: '{toi} choisit un mot. Jusqu’à la fin de la partie, chaque fois que {moi} le dit, il ou elle retire un vêtement.' },
  { n: 1, txt: '{moi} enlève le haut de {toi}, uniquement avec les dents.' },
  { n: 1, txt: '{moi} mime avec les mains ce qu’il ou elle préfère que {toi} lui fasse.' },
  // brûlant
  { n: 2, txt: '{toi} attache les poignets de {moi} avec une ceinture ou un foulard pendant les deux prochains tours.' },
  { n: 2, txt: '{moi} est à genoux devant {toi} jusqu’à son prochain tour.' },
  { n: 2, txt: '{toi} a carte blanche sur le corps de {moi} pendant deux minutes. {moi} n’a pas le droit de toucher.', t: 120 },
  { n: 2, txt: '{moi} finit la partie sans aucun sous-vêtement.' },
  { n: 2, txt: '{toi} donne dix fessées à {moi}. {moi} les compte à voix haute.' },
  { n: 2, txt: '{moi} se caresse devant {toi} pendant une minute. {toi} regarde, sans toucher.', t: 60 },
  { n: 2, txt: '{moi} a les yeux bandés jusqu’à son prochain tour. {toi} joue pour lui ou elle, et en profite.' },
  { n: 2, txt: '{toi} ordonne, {moi} obéit : trois ordres, dans les limites que vous avez fixées.' },
  { n: 2, txt: '{moi} embrasse {toi} partout sauf là où il ou elle en a le plus envie, pendant deux minutes.', t: 120 },
  { n: 2, txt: '{toi} tient {moi} par les cheveux et l’embrasse comme il ou elle l’entend.' },
  { n: 2, txt: '{moi} n’a pas le droit de jouir avant la fin de la partie, quoi que fasse {toi}.' },
  { n: 2, txt: '{moi} choisit un jouet, un accessoire ou un objet de la pièce. {toi} décide de quoi en faire pendant deux minutes.', t: 120 },
];

// Cartes Tentation : un effet de jeu, parfois avec un gage.
// fx : argent (+/-), vers (case), recule, menottes, deLautre (l'autre paie), libere (carte sortie des menottes)
const TENTATIONS = [
  { txt: 'Rendez vous au Jacuzzi. Si tu passes par le Départ, encaisse 150.', fx: { vers: 8 } },
  { txt: 'Direction le Donjon, sans détour.', fx: { vers: 18 } },
  { txt: 'Retour au Départ. Encaisse 150 et un baiser de {toi}.', fx: { vers: 0 } },
  { txt: 'Tu as été vu en train de rougir. Recule de trois cases.', fx: { recule: 3 } },
  { txt: 'Attentat à la pudeur. Va directement aux Menottes.', fx: { menottes: true } },
  { txt: '{toi} te trouve irrésistible ce soir et te verse 50 frissons. Puis te le prouve avec un baiser.', fx: { deLautre: 50 } },
  { txt: 'Tu reçois un pourboire de 100 frissons pour ta tenue.', fx: { argent: 100 } },
  { txt: 'Lingerie hors de prix. Paie 80 frissons à la banque.', fx: { argent: -80 } },
  { txt: 'Carte Coffre fort : garde la pour sortir des Menottes gratuitement.', fx: { libere: true } },
  { txt: 'Anniversaire de vos premiers baisers. {toi} te paie 30, et tu choisis où tu veux être embrassé.', fx: { deLautre: 30 } },
  { txt: 'Hôtel réservé en dernière minute. Paie 60 à la banque, rendez vous à la Chambre d’hôtel.', fx: { argent: -60, vers: 16 } },
  { txt: 'Massage gagné à la tombola : {toi} te masse le dos pendant une minute, et tu encaisses 40.', fx: { argent: 40 }, t: 60 },
];

const TAXE_ALTERNATIVE = '{moi} retire un vêtement, au choix de {toi}, au lieu de payer.';
const PAUSE_TXT = '{toi} prend {moi} dans ses bras pendant trente secondes. Aucun paiement ici.';
