// Contenu du jeu. {moi} = joueur dont c'est le tour, {toi} = l'autre.
// Niveaux : 0 doux, 1 coquin, 2 brûlant. Les durées ("une minute"...) sont lues dans le texte pour le minuteur.

const GROUPES = {
  A: { nom: 'Les Préliminaires', couleur: '#f7a8c4' },
  B: { nom: 'Les Massages', couleur: '#5ad1e6' },
  C: { nom: 'Les Eaux chaudes', couleur: '#ff4fa3' },
  D: { nom: 'Le Déshabillage', couleur: '#ff8a3d' },
  E: { nom: 'Les Lieux publics', couleur: '#ff3b3b' },
  F: { nom: 'Les Voyages', couleur: '#ffd23f' },
  G: { nom: 'Les Jeux de rôle', couleur: '#3ddc84' },
  H: { nom: 'Les Interdits', couleur: '#3b7bff' },
  acc: { nom: 'Les Accessoires', couleur: '#e9e4dc' },
  amb: { nom: 'Les Ambiances', couleur: '#c9a35b' },
};

// gages[n] : ce que le visiteur ({moi}) offre au propriétaire ({toi}) s'il paie en nature.
const CASES = [
  { type: 'depart', nom: 'Départ' },
  { type: 'lieu', g: 'A', nom: 'Le Canapé', prix: 60, gages: [
    '{moi} se blottit contre {toi} et lui caresse les cheveux pendant une minute.',
    '{moi} s’assoit à califourchon sur {toi} et l’embrasse dans le cou pendant une minute, sans toucher la bouche.',
    '{moi} s’allonge sur {toi} et ondule lentement contre son corps pendant une minute.'] },
  { type: 'gage', nom: 'Gage' },
  { type: 'lieu', g: 'A', nom: 'La Cuisine', prix: 60, gages: [
    '{moi} donne à manger à {toi} à la main, la prochaine chose qu’il ou elle grignotera.',
    '{moi} dépose un peu de chocolat ou de miel sur son propre cou, {toi} vient le retirer avec les lèvres.',
    '{toi} choisit une partie du corps de {moi}, y dépose quelque chose de sucré et le déguste lentement.'] },
  { type: 'taxe', nom: 'Strip-tease fiscal', montant: 200, alt: '{moi} retire un vêtement, au choix de {toi}.' },
  { type: 'acc', g: 'acc', nom: 'Le Bandeau', prix: 200, gages: [
    '{toi} bande les yeux de {moi} et lui donne trois baisers. {moi} devine où.',
    '{moi} a les yeux bandés pendant une minute, et {toi} le ou la caresse où il ou elle veut.',
    '{moi} garde les yeux bandés jusqu’à son prochain tour, et {toi} en profite.'] },
  { type: 'lieu', g: 'B', nom: 'L’Huile tiède', prix: 100, gages: [
    '{moi} masse les mains de {toi} avec de l’huile ou de la crème pendant une minute.',
    '{moi} masse le dos nu de {toi} avec de l’huile tiède pendant deux minutes.',
    '{moi} masse {toi}, entièrement nu, pendant trois minutes, en s’attardant où il ou elle veut.'] },
  { type: 'tentation', nom: 'Tentation' },
  { type: 'lieu', g: 'B', nom: 'Les Pierres chaudes', prix: 100, gages: [
    '{moi} réchauffe ses mains et les pose sur le ventre de {toi} pendant trente secondes.',
    '{moi} masse les fesses de {toi} pendant une minute.',
    '{moi} masse l’intérieur des cuisses de {toi} pendant deux minutes, sans jamais aller plus haut.'] },
  { type: 'lieu', g: 'B', nom: 'La Table de massage', prix: 120, gages: [
    '{toi} s’allonge, {moi} lui masse la nuque et le crâne pendant une minute.',
    '{toi} s’allonge sur le ventre en sous-vêtements, {moi} le ou la masse pendant deux minutes.',
    '{toi} s’allonge nu. {moi} offre un massage qui finit comme {toi} le souhaite, pendant trois minutes.'] },
  { type: 'menottes', nom: 'Menottes' },
  { type: 'lieu', g: 'C', nom: 'La Douche', prix: 140, gages: [
    '{moi} promet à {toi} une douche à deux ce soir, et la lui savonne entièrement.',
    '{moi} retire le haut de {toi} avec les dents, ou au moins essaie pendant une minute.',
    'Prochaine douche : {toi} décide de tout, {moi} n’a le droit d’utiliser que sa bouche pour laver.'] },
  { type: 'amb', g: 'amb', nom: 'Les Bougies', prix: 150, gages: [
    '{moi} baisse la lumière et embrasse {toi} pendant trente secondes.',
    '{moi} masse {toi}, torse nu, à la lueur d’une bougie ou d’un écran, pendant une minute.',
    '{toi} fait couler un peu d’huile tiède sur {moi} et l’étale lentement, partout où il ou elle veut.'] },
  { type: 'lieu', g: 'C', nom: 'La Baignoire', prix: 140, gages: [
    '{moi} promet à {toi} un bain moussant à deux dans les prochains jours.',
    '{moi} lave le dos de {toi}, pour de vrai ou avec les mains seules, pendant une minute, en descendant de plus en plus bas.',
    '{moi} rejoint {toi} sous l’eau, maintenant ou après la partie, et s’occupe de tout son corps.'] },
  { type: 'lieu', g: 'C', nom: 'Le Jacuzzi', prix: 160, gages: [
    '{moi} masse les épaules de {toi} pendant deux minutes, avec de l’huile si vous en avez.',
    '{moi} masse les cuisses de {toi} pendant deux minutes, en remontant un peu plus à chaque passage.',
    '{moi} masse {toi} partout où {toi} le demande pendant deux minutes, sans rien refuser.'] },
  { type: 'acc', g: 'acc', nom: 'La Plume', prix: 200, gages: [
    '{toi} effleure le visage et le cou de {moi} du bout des doigts pendant une minute.',
    '{toi} effleure tout le corps de {moi} avec une plume ou le bout des doigts pendant une minute. Interdit de bouger.',
    '{moi} s’allonge, mains au dessus de la tête. {toi} l’effleure partout pendant deux minutes.'] },
  { type: 'lieu', g: 'D', nom: 'La Cabine d’essayage', prix: 180, gages: [
    '{moi} fait un défilé d’une minute pour {toi}, avec la tenue de son choix.',
    '{moi} se change devant {toi} sans se cacher, {toi} choisit la tenue.',
    '{moi} enlève ses sous-vêtements et les donne à {toi}, qui les garde jusqu’à la fin de la partie.'] },
  { type: 'gage', nom: 'Gage' },
  { type: 'lieu', g: 'D', nom: 'Le Vestiaire', prix: 180, gages: [
    '{moi} retire ses chaussettes avec une lenteur de professionnel.',
    '{moi} échange un vêtement avec {toi} et le porte jusqu’à la fin de la partie.',
    '{moi} se met en sous-vêtements et défile pour {toi} pendant une minute.'] },
  { type: 'lieu', g: 'D', nom: 'Le Boudoir', prix: 200, gages: [
    '{moi} s’assoit sur les genoux de {toi} et lui chuchote un compliment osé.',
    '{moi} fait une danse lascive d’une minute sur les genoux de {toi}, qui n’a pas le droit de toucher.',
    '{moi} danse pour {toi} pendant deux minutes et finit entièrement nu.'] },
  { type: 'pause', nom: 'Pause câline', txt: '{toi} prend {moi} dans ses bras pendant trente secondes. Aucun paiement ici.' },
  { type: 'lieu', g: 'E', nom: 'L’Ascenseur', prix: 220, gages: [
    '{moi} plaque doucement {toi} contre un mur et l’embrasse pendant trente secondes.',
    '{moi} plaque {toi} contre un mur, lui tient les poignets au dessus de la tête et l’embrasse pendant une minute.',
    '{toi} plaque {moi} contre un mur, face au mur, et fait ce qu’il ou elle veut avec ses mains pendant une minute.'] },
  { type: 'tentation', nom: 'Tentation' },
  { type: 'lieu', g: 'E', nom: 'Le Cinéma', prix: 220, gages: [
    '{moi} murmure à l’oreille de {toi} ce qu’il ou elle avait envie de lui faire la dernière fois que vous étiez dehors.',
    '{moi} glisse une main sous les vêtements de {toi} pendant une minute, comme au fond d’une salle obscure, sans un bruit.',
    '{toi} a les yeux bandés. {moi} l’embrasse partout où il ou elle le décide pendant deux minutes.'] },
  { type: 'lieu', g: 'E', nom: 'La Banquette arrière', prix: 240, gages: [
    '{moi} embrasse {toi} comme deux ados à l’arrière d’une voiture pendant trente secondes.',
    '{moi} et {toi} se pelotent pendant une minute, sans rien enlever.',
    '{moi} glisse la main dans le pantalon de {toi} pendant une minute, comme si on pouvait vous surprendre.'] },
  { type: 'acc', g: 'acc', nom: 'Le Foulard', prix: 200, gages: [
    '{toi} noue un foulard au poignet de {moi}. Jusqu’à son prochain tour, il suffit de le tirer pour réclamer un baiser.',
    '{toi} attache les mains de {moi} dans son dos jusqu’à son prochain tour.',
    '{toi} attache {moi} au lit ou à une chaise pendant trois minutes, et fait ce qu’il ou elle veut.'] },
  { type: 'lieu', g: 'F', nom: 'Le Train de nuit', prix: 260, gages: [
    '{moi} raconte un voyage où il ou elle a eu terriblement envie de {toi}.',
    '{moi} se colle contre {toi}, dos contre ventre, et ondule doucement pendant une minute.',
    '{toi} se colle derrière {moi} et fait ce qu’il ou elle veut avec ses mains pendant deux minutes, sans un bruit.'] },
  { type: 'lieu', g: 'F', nom: 'La Chambre d’hôtel', prix: 260, gages: [
    '{moi} raconte à {toi} le fantasme d’hôtel parfait, avec les détails.',
    '{moi} se met à genoux devant {toi} et lui demande ce qu’il ou elle désire. Une demande à exaucer.',
    '{moi} devient le service d’étage de {toi} pendant trois minutes : obéissance totale, dans les limites que vous avez fixées.'] },
  { type: 'amb', g: 'amb', nom: 'Le Champagne', prix: 150, gages: [
    '{moi} trinque avec {toi} et lui dit pourquoi il ou elle le désire ce soir.',
    '{moi} prend une gorgée et la fait passer à {toi} dans un baiser.',
    '{toi} verse quelques gouttes sur le corps de {moi} et les boit là où elles coulent.'] },
  { type: 'lieu', g: 'F', nom: 'La Suite nuptiale', prix: 280, gages: [
    '{moi} prend {toi} par la main et l’emmène jusqu’au lit pour un baiser de trente secondes.',
    '{moi} déshabille {toi} entièrement, lentement, en embrassant chaque centimètre découvert.',
    '{moi} fait à {toi} ce qu’il ou elle préfère au lit, pendant deux minutes.'] },
  { type: 'allez', nom: 'Va aux Menottes' },
  { type: 'lieu', g: 'G', nom: 'Le Cabinet médical', prix: 300, gages: [
    '{moi} joue le docteur et ausculte {toi}, l’oreille contre son cœur, pendant trente secondes.',
    '{moi} joue le docteur : examen complet de {toi} en sous-vêtements pendant une minute.',
    '{toi} est le docteur. {moi}, patient nu, se laisse examiner partout pendant deux minutes.'] },
  { type: 'lieu', g: 'G', nom: 'Le Bureau du patron', prix: 300, gages: [
    '{moi} appelle {toi} « patron » ou « patronne » jusqu’à son prochain tour.',
    '{toi} est le patron. {moi} doit obtenir une augmentation par la séduction, en une minute.',
    '{moi} se glisse sous le bureau. {toi} décide de ce qui s’y passe pendant deux minutes.'] },
  { type: 'gage', nom: 'Gage' },
  { type: 'lieu', g: 'G', nom: 'La Salle d’interrogatoire', prix: 320, gages: [
    '{toi} pose trois questions coquines, {moi} répond avec une franchise totale.',
    '{moi} garde les mains dans le dos. {toi} l’interroge sur ses fantasmes et le ou la caresse à chaque réponse, pendant deux minutes.',
    '{moi} est attaché à une chaise. {toi} l’interroge et punit chaque mensonge d’une fessée, pendant deux minutes.'] },
  { type: 'acc', g: 'acc', nom: 'Le Glaçon', prix: 200, gages: [
    '{toi} passe un glaçon sur la nuque de {moi}, puis réchauffe avec les lèvres.',
    '{toi} fait glisser un glaçon du cou au nombril de {moi}, puis réchauffe avec la bouche.',
    '{moi} garde un glaçon dans la bouche et s’en sert sur {toi} là où il ou elle le demande, pendant une minute.'] },
  { type: 'tentation', nom: 'Tentation' },
  { type: 'lieu', g: 'H', nom: 'La Chambre rouge', prix: 350, gages: [
    '{moi} choisit une couleur. {toi} embrasse tout ce qui, sur {moi}, porte cette couleur.',
    '{toi} donne cinq fessées à {moi}, qui les compte à voix haute.',
    '{toi} attache {moi}, lui bande les yeux et alterne caresses et fessées pendant trois minutes.'] },
  { type: 'taxe', nom: 'Taxe sur la lingerie', montant: 100, alt: '{moi} offre à {toi} un baiser à l’endroit de son choix.' },
  { type: 'lieu', g: 'H', nom: 'Le Donjon', prix: 400, gages: [
    '{toi} attache les poignets de {moi} avec un foulard pendant les deux prochains tours.',
    '{moi} reçoit cinq fessées de {toi}, et dit merci après chacune.',
    '{moi} a les mains attachées et les yeux bandés. {toi} a carte blanche pendant trois minutes.'] },
];

// Gages piochés sur les cases Gage.
const GAGES = [
  // doux
  { n: 0, txt: '{moi} embrasse {toi} pendant dix secondes, sans s’arrêter.' },
  { n: 0, txt: '{moi} dit à {toi} trois choses qu’il ou elle trouve irrésistibles chez lui ou chez elle.' },
  { n: 0, txt: '{toi} embrasse {moi} dans le cou, lentement, cinq fois.' },
  { n: 0, txt: '{moi} retire ses chaussettes, ou un bijou, au choix.' },
  { n: 0, txt: '{moi} masse les pieds de {toi} pendant une minute.' },
  { n: 0, txt: '{moi} mordille l’oreille de {toi}, tout doucement.' },
  { n: 0, txt: '{toi} raconte le moment où {moi} lui a fait le plus d’effet.' },
  { n: 0, txt: '{moi} danse un slow avec {toi}, sans musique, pendant une minute.' },
  { n: 0, txt: '{moi} trace un mot du bout du doigt dans le dos de {toi}. Trois essais pour deviner.' },
  { n: 0, txt: '{toi} choisit un endroit de son corps, {moi} y dépose dix baisers.' },
  { n: 0, txt: 'Jusqu’au prochain tour de {moi}, vous restez main dans la main.' },
  { n: 0, txt: '{moi} regarde {toi} dans les yeux pendant trente secondes. Le premier qui rit paie 20 à l’autre.' },
  // coquin
  { n: 1, txt: '{moi} retire un vêtement, au choix de {toi}.' },
  { n: 1, txt: '{toi} bande les yeux de {moi} et l’embrasse à trois endroits. {moi} doit deviner où.' },
  { n: 1, txt: '{moi} décrit à voix basse ce qu’il ou elle fera à {toi} après la partie.' },
  { n: 1, txt: '{moi} embrasse {toi} de la clavicule jusqu’au nombril, lentement.' },
  { n: 1, txt: '{toi} passe un glaçon, ou ses doigts froids, le long du dos de {moi}.' },
  { n: 1, txt: '{moi} fait un strip-tease d’une minute pour {toi}. Au moins un vêtement doit tomber.' },
  { n: 1, txt: '{toi} garde les mains dans le dos pendant une minute. {moi} l’allume, sans le moindre baiser sur la bouche.' },
  { n: 1, txt: '{moi} avoue un fantasme qu’il ou elle n’a jamais dit à {toi}.' },
  { n: 1, txt: '{toi} donne trois petites fessées à {moi}, de la force de son choix.' },
  { n: 1, txt: '{moi} laisse un suçon à {toi}, à un endroit que personne d’autre ne verra.' },
  { n: 1, txt: '{moi} s’assoit sur les genoux de {toi} et se laisse caresser pendant une minute sans bouger.' },
  { n: 1, txt: '{toi} choisit un mot. Jusqu’à la fin de la partie, chaque fois que {moi} le dit, il ou elle retire un vêtement.' },
  { n: 1, txt: '{moi} enlève le haut de {toi}, uniquement avec les dents.' },
  { n: 1, txt: '{moi} mime avec les mains ce qu’il ou elle préfère que {toi} lui fasse.' },
  // brûlant
  { n: 2, txt: '{toi} attache les poignets de {moi} avec une ceinture ou un foulard pendant les deux prochains tours.' },
  { n: 2, txt: '{moi} reste à genoux devant {toi} jusqu’à son prochain tour.' },
  { n: 2, txt: '{toi} a carte blanche sur le corps de {moi} pendant deux minutes. {moi} n’a pas le droit de toucher.' },
  { n: 2, txt: '{moi} finit la partie sans aucun sous-vêtement.' },
  { n: 2, txt: '{toi} donne dix fessées à {moi}. {moi} les compte à voix haute.' },
  { n: 2, txt: '{moi} se caresse devant {toi} pendant une minute. {toi} regarde, sans toucher.' },
  { n: 2, txt: '{moi} a les yeux bandés jusqu’à son prochain tour. {toi} en profite comme il ou elle l’entend.' },
  { n: 2, txt: '{toi} ordonne, {moi} obéit : trois ordres, dans les limites que vous avez fixées.' },
  { n: 2, txt: '{moi} embrasse {toi} partout sauf là où il ou elle en a le plus envie, pendant deux minutes.' },
  { n: 2, txt: '{toi} tient {moi} par les cheveux et l’embrasse comme il ou elle l’entend.' },
  { n: 2, txt: '{moi} n’a pas le droit de jouir avant la fin de la partie, quoi que fasse {toi}.' },
  { n: 2, txt: '{moi} choisit un jouet, un accessoire ou un objet de la pièce. {toi} décide de quoi en faire pendant deux minutes.' },
];

// Cartes Tentation. fx : argent, vers (case), recule, menottes, deLautre, libere
const TENTATIONS = [
  { txt: 'Rendez vous au Jacuzzi. Si tu passes par le Départ, encaisse 200.', fx: { vers: 14 } },
  { txt: 'Direction le Donjon, sans détour.', fx: { vers: 39 } },
  { txt: 'Retour au Départ. Encaisse 200 et un baiser de {toi}.', fx: { vers: 0 } },
  { txt: 'Tu as été vu en train de rougir. Recule de trois cases.', fx: { recule: 3 } },
  { txt: 'Attentat à la pudeur. Va directement aux Menottes.', fx: { menottes: true } },
  { txt: '{toi} te trouve irrésistible ce soir et te verse 50 frissons. Puis te le prouve avec un baiser.', fx: { deLautre: 50 } },
  { txt: 'Tu reçois un pourboire de 150 frissons pour ta tenue.', fx: { argent: 150 } },
  { txt: 'Lingerie hors de prix. Paie 100 frissons à la banque.', fx: { argent: -100 } },
  { txt: 'Carte Coffre fort : garde la pour sortir des Menottes gratuitement.', fx: { libere: true } },
  { txt: 'Anniversaire de vos premiers baisers. {toi} te paie 30, et tu choisis où tu veux être embrassé.', fx: { deLautre: 30 } },
  { txt: 'Hôtel réservé en dernière minute. Paie 60 à la banque et rends toi à la Chambre d’hôtel.', fx: { argent: -60, vers: 27 } },
  { txt: 'Billet de dernière minute : file au Train de nuit.', fx: { vers: 26 } },
  { txt: 'Massage gagné à la tombola : {toi} te masse le dos pendant une minute, et tu encaisses 40.', fx: { argent: 40 } },
];
