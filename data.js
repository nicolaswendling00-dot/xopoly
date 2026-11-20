// Contenu du jeu. {moi} = joueur dont c'est le tour, {toi} = l'autre.
// Accords selon le genre choisi à l'accueil (1 = {moi}, 2 = {toi}) :
//   {il1} il/elle, {le1} le/la, {lui1} lui/elle (après une préposition), {e1} rien/e,
//   {1:masculin|féminin} au choix, {3:masculin|féminin} pour vous deux (féminin si deux femmes).
// Niveaux : 0 doux, 1 coquin, 2 brûlant. Au niveau 2, un lieu donne { H, F } : H quand le visiteur est l'homme, F quand c'est la femme. Les durées ("une minute"...) sont lues dans le texte pour le minuteur.

const GROUPES = {
  A: { nom: 'Les Préliminaires', couleur: '#f7a8c4' },
  B: { nom: 'Les Massages', couleur: '#5ad1e6' },
  C: { nom: 'Les Eaux chaudes', couleur: '#ff4fa3' },
  D: { nom: 'Le Déshabillage', couleur: '#ff8a3d' },
  E: { nom: 'Les Lieux publics', couleur: '#ff3b3b' },
  F: { nom: 'Les Voyages', couleur: '#ffd23f' },
  G: { nom: 'Les Jeux de rôle', couleur: '#3ddc84' },
  H: { nom: 'Le Septième ciel', couleur: '#3b7bff' },
  acc: { nom: 'Les Accessoires', couleur: '#e9e4dc' },
  amb: { nom: 'Les Ambiances', couleur: '#c9a35b' },
};

// gages[n] : ce que le visiteur ({moi}) offre au propriétaire ({toi}) s'il paie en nature.
const CASES = [
  { type: 'depart', nom: 'Départ' },
  { type: 'lieu', g: 'A', nom: 'Le Canapé', prix: 60, gages: [
    '{moi} se blottit contre {toi} et lui caresse les cheveux pendant une minute.',
    '{moi} s’assoit à califourchon sur {toi} et l’embrasse dans le cou pendant une minute, sans toucher sa bouche.',
    { H: '{moi} attire {toi} à califourchon sur lui et frotte son gland contre son clitoris pendant une minute, sans entrer.',
      F: '{moi} s’assoit nue à califourchon sur {toi} et frotte son clitoris contre son sexe pendant une minute, sans le laisser entrer.' }] },
  { type: 'gage', nom: 'Gage' },
  { type: 'lieu', g: 'A', nom: 'La Cuisine', prix: 60, gages: [
    '{moi} donne à manger à {toi} à la main la prochaine chose qu’{il2} grignotera.',
    '{moi} dépose un peu de chocolat ou de miel dans son propre cou, et {toi} vient le retirer avec les lèvres.',
    { H: '{moi} dépose du miel ou du chocolat sur le clitoris de {toi} et le lèche jusqu’à ce qu’il n’en reste rien.',
      F: '{moi} dépose du miel ou du chocolat sur le gland de {toi} et le lèche jusqu’à ce qu’il n’en reste rien.' }] },
  { type: 'taxe', nom: 'Strip-tease fiscal', montant: 200, alt: '{moi} retire un vêtement, au choix de {toi}.' },
  { type: 'acc', g: 'acc', nom: 'Le Bandeau', prix: 200, gages: [
    '{toi} bande les yeux de {moi} et lui donne trois baisers. {moi} doit deviner où.',
    '{moi} a les yeux bandés pendant une minute, et {toi} {le1} caresse où {il2} veut.',
    { H: '{toi} a les yeux bandés. {moi} alterne la langue et les doigts sur son clitoris, sans prévenir, pendant deux minutes.',
      F: '{toi} a les yeux bandés. {moi} alterne la bouche et la main sur son sexe, sans prévenir, pendant deux minutes.' }] },
  { type: 'lieu', g: 'B', nom: 'L’Huile tiède', prix: 100, gages: [
    '{moi} masse les mains de {toi} avec de l’huile ou de la crème pendant une minute.',
    '{moi} masse le dos nu de {toi} avec de l’huile tiède pendant deux minutes.',
    { H: '{moi} masse le sexe de {toi} avec de l’huile pendant deux minutes, en évitant soigneusement le clitoris.',
      F: '{moi} masse le sexe de {toi} avec de l’huile pendant deux minutes, de la base au gland, très lentement.' }] },
  { type: 'tentation', nom: 'Tentation' },
  { type: 'lieu', g: 'B', nom: 'Les Pierres chaudes', prix: 100, gages: [
    '{moi} réchauffe ses mains et les pose sur le ventre de {toi} pendant trente secondes.',
    '{moi} masse les fesses de {toi} pendant une minute.',
    { H: '{moi} glisse deux doigts en {toi}, recourbés vers son point G, et le masse pendant une minute.',
      F: '{moi} masse les testicules de {toi} d’une main et le caresse de l’autre pendant une minute.' }] },
  { type: 'lieu', g: 'B', nom: 'La Table de massage', prix: 120, gages: [
    '{toi} s’allonge, et {moi} lui masse la nuque et le crâne pendant une minute.',
    '{toi} s’allonge sur le ventre en sous-vêtements, et {moi} {le2} masse pendant deux minutes.',
    { H: '{toi} s’allonge nue. {moi} masse tout son corps, puis finit par un cunnilingus d’une minute.',
      F: '{toi} s’allonge nu. {moi} masse tout son corps, puis finit par une fellation d’une minute.' }] },
  { type: 'menottes', nom: 'Abstinence' },
  { type: 'lieu', g: 'C', nom: 'La Douche', prix: 140, gages: [
    '{moi} promet à {toi} une douche à deux ce soir, et lui savonnera tout le corps.',
    '{moi} retire le haut de {toi} avec les dents, ou essaie pendant une minute.',
    { H: 'Sous la douche ou au lit, {moi} s’agenouille et fait un cunnilingus à {toi} pendant deux minutes.',
      F: 'Sous la douche ou au lit, {moi} s’agenouille et fait une fellation à {toi} pendant deux minutes.' }] },
  { type: 'amb', g: 'amb', nom: 'Les Bougies', prix: 150, gages: [
    '{moi} baisse la lumière et embrasse {toi} pendant trente secondes.',
    '{moi} masse {toi}, torse nu, à la lueur d’une bougie ou d’un écran, pendant une minute.',
    { H: 'Lumière tamisée : {moi} fait l’amour à {toi} pendant trois minutes, sans un mot.',
      F: 'Lumière tamisée : {moi} fait l’amour à {toi} pendant trois minutes, sans un mot.' }] },
  { type: 'lieu', g: 'C', nom: 'La Baignoire', prix: 140, gages: [
    '{moi} promet à {toi} un bain moussant à deux dans les prochains jours.',
    '{moi} lave le dos de {toi}, pour de vrai ou avec les mains seules, pendant une minute, en descendant de plus en plus bas.',
    { H: '{moi} ne touche que le clitoris de {toi}, du bout d’un doigt mouillé, pendant deux minutes.',
      F: '{moi} ne touche que le gland de {toi}, du bout des doigts mouillés, pendant deux minutes.' }] },
  { type: 'lieu', g: 'C', nom: 'Le Jacuzzi', prix: 160, gages: [
    '{moi} masse les épaules de {toi} pendant deux minutes.',
    '{moi} masse les cuisses de {toi} pendant deux minutes, en remontant un peu plus à chaque passage.',
    { H: '{moi} fait un cunnilingus à {toi} pendant deux minutes, en alternant la langue à plat et la pointe.',
      F: '{moi} fait une fellation à {toi} pendant deux minutes, en le regardant dans les yeux.' }] },
  { type: 'acc', g: 'acc', nom: 'La Plume', prix: 200, gages: [
    '{moi} effleure le visage et le cou de {toi} du bout des doigts pendant une minute.',
    '{moi} effleure tout le corps de {toi} avec une plume ou le bout des doigts pendant une minute. {toi} n’a pas le droit de bouger.',
    { H: '{moi} effleure le clitoris de {toi} du bout de la langue, à peine, pendant une minute.',
      F: '{moi} effleure le gland de {toi} du bout de la langue, à peine, pendant une minute.' }] },
  { type: 'lieu', g: 'D', nom: 'La Cabine d’essayage', prix: 180, gages: [
    '{moi} fait un défilé d’une minute pour {toi}, dans la tenue de son choix.',
    '{moi} se change devant {toi} sans se cacher, et {toi} choisit la tenue.',
    { H: '{moi} se déshabille et se masturbe devant {toi} pendant une minute, sans la quitter des yeux.',
      F: '{moi} se déshabille et caresse son clitoris devant {toi} pendant une minute, sans le quitter des yeux.' }] },
  { type: 'gage', nom: 'Gage' },
  { type: 'lieu', g: 'D', nom: 'Le Vestiaire', prix: 180, gages: [
    '{moi} retire ses chaussettes avec une lenteur de {1:professionnel|professionnelle}.',
    '{moi} échange un vêtement avec {toi} et le porte jusqu’à la fin de la partie.',
    { H: '{moi} reste nu jusqu’à son prochain tour, et {toi} peut le toucher où elle veut, quand elle veut.',
      F: '{moi} reste nue jusqu’à son prochain tour, et {toi} peut la toucher où il veut, quand il veut.' }] },
  { type: 'lieu', g: 'D', nom: 'Le Boudoir', prix: 200, gages: [
    '{moi} s’assoit sur les genoux de {toi} et lui chuchote un compliment osé.',
    '{moi} danse lascivement sur les genoux de {toi} pendant une minute. {toi} n’a pas le droit de toucher.',
    { H: '{toi} s’assoit au bord du lit. {moi}, à genoux, embrasse l’intérieur de ses cuisses puis lèche son clitoris pendant une minute.',
      F: '{moi} caresse le sexe de {toi} entre ses seins pendant une minute.' }] },
  { type: 'pause', nom: 'Pause câline', txt: '{toi} prend {moi} dans ses bras pendant trente secondes. Aucun paiement ici.' },
  { type: 'lieu', g: 'E', nom: 'L’Ascenseur', prix: 220, gages: [
    '{moi} plaque doucement {toi} contre un mur et l’embrasse pendant trente secondes.',
    '{moi} plaque {toi} contre un mur et l’embrasse pendant une minute, les mains sous ses vêtements.',
    { H: 'Debout contre un mur, {moi} entre en {toi} pour trois allers-retours seulement, puis se retire.',
      F: 'Debout contre un mur, {moi} guide {toi} en elle pour trois allers-retours seulement, puis l’arrête.' }] },
  { type: 'tentation', nom: 'Tentation' },
  { type: 'lieu', g: 'E', nom: 'Le Cinéma', prix: 220, gages: [
    '{moi} murmure à l’oreille de {toi} ce qu’{il1} avait envie de lui faire la dernière fois que vous étiez dehors.',
    '{moi} glisse une main sous les vêtements de {toi} pendant une minute, comme au fond d’une salle obscure, sans un bruit.',
    { H: '{moi} glisse la main dans la culotte de {toi} et caresse son clitoris pendant deux minutes, sans un bruit.',
      F: '{moi} glisse la main dans le caleçon de {toi} et le caresse lentement pendant deux minutes, sans un bruit.' }] },
  { type: 'lieu', g: 'E', nom: 'La Banquette arrière', prix: 240, gages: [
    '{moi} embrasse {toi} comme deux ados à l’arrière d’une voiture pendant trente secondes.',
    '{moi} et {toi} se pelotent pendant une minute, sans rien enlever.',
    { H: '{moi} laisse {toi} s’asseoir sur lui et frotter son clitoris contre son gland pendant une minute. Il n’a pas le droit d’entrer.',
      F: '{moi} s’assoit sur {toi} et frotte son clitoris contre son gland pendant une minute. Il n’a pas le droit d’entrer.' }] },
  { type: 'acc', g: 'acc', nom: 'Le Jouet', prix: 200, gages: [
    '{moi} choisit un objet de la pièce et invente une façon coquine de s’en servir sur {toi}.',
    '{moi} fait glisser un objet doux de la pièce sur le corps de {toi} pendant une minute.',
    { H: '{moi} pose un sextoy ou ses doigts sur le clitoris de {toi} pendant deux minutes, et s’arrête juste avant qu’elle jouisse.',
      F: '{moi} caresse {toi} avec un sextoy ou sa main pendant deux minutes, et s’arrête juste avant qu’il jouisse.' }] },
  { type: 'lieu', g: 'F', nom: 'Le Train de nuit', prix: 260, gages: [
    '{moi} raconte un voyage où {il1} a eu terriblement envie de {toi}.',
    '{moi} se colle contre {toi}, dos contre ventre, et ondule doucement pendant une minute.',
    { H: 'En cuillère, {moi} derrière {toi} : il entre très lentement et ne fait que dix va-et-vient, sans un bruit.',
      F: 'En cuillère, {toi} derrière {moi} : elle le laisse entrer pour dix va-et-vient seulement, sans un bruit.' }] },
  { type: 'lieu', g: 'F', nom: 'La Chambre d’hôtel', prix: 260, gages: [
    '{moi} raconte à {toi} son fantasme d’hôtel parfait, avec les détails.',
    '{moi} se met à genoux devant {toi} et lui demande ce qu’{il2} désire. Une demande coquine à exaucer.',
    { H: '{moi} fait l’amour à {toi} dans la position qu’elle choisit, pendant trois minutes.',
      F: '{moi} fait l’amour à {toi} dans la position qu’il choisit, pendant trois minutes.' }] },
  { type: 'amb', g: 'amb', nom: 'Le Champagne', prix: 150, gages: [
    '{moi} trinque avec {toi} et lui dit pourquoi {il1} {le2} désire ce soir.',
    '{moi} prend une gorgée et la fait passer à {toi} dans un baiser.',
    { H: '{moi} verse quelques gouttes sur le ventre de {toi} et les suit avec la langue jusqu’à son clitoris.',
      F: '{moi} verse quelques gouttes sur le sexe de {toi} et les lèche jusqu’à la dernière.' }] },
  { type: 'lieu', g: 'F', nom: 'La Suite nuptiale', prix: 280, gages: [
    '{moi} prend {toi} par la main et l’emmène jusqu’au lit pour un baiser de trente secondes.',
    '{moi} déshabille entièrement {toi}, lentement, en embrassant chaque centimètre découvert.',
    { H: 'En missionnaire, les yeux dans les yeux, {moi} fait l’amour à {toi} très lentement pendant deux minutes.',
      F: '{moi} chevauche {toi} pendant deux minutes, au rythme qu’il lui demande.' }] },
  { type: 'allez', nom: 'File en Abstinence' },
  { type: 'lieu', g: 'G', nom: 'Le Cabinet médical', prix: 300, gages: [
    '{moi} joue {1:le docteur|la docteure} et ausculte {toi}, l’oreille contre son cœur, pendant trente secondes.',
    '{moi} joue {1:le docteur|la docteure} : examen complet de {toi}, en sous-vêtements, pendant une minute.',
    { H: 'Le docteur {moi} examine {toi} : deux doigts en elle, le pouce sur le clitoris, pendant une minute.',
      F: 'La docteure {moi} examine {toi} : elle le prend en bouche pour vérifier ses réflexes, pendant une minute.' }] },
  { type: 'lieu', g: 'G', nom: 'Le Bureau du patron', prix: 300, gages: [
    '{moi} appelle {toi} « {2:patron|patronne} » jusqu’à son prochain tour.',
    '{toi} est {2:le patron|la patronne}. {moi} doit obtenir une augmentation par la séduction, en une minute.',
    { H: '{moi} se glisse sous le bureau et fait un cunnilingus à {toi} pendant deux minutes.',
      F: '{moi} se glisse sous le bureau et fait une fellation à {toi} pendant deux minutes.' }] },
  { type: 'gage', nom: 'Gage' },
  { type: 'lieu', g: 'G', nom: 'La Salle de sport', prix: 320, gages: [
    '{moi} fait dix squats devant {toi}, en {le2} regardant dans les yeux.',
    '{toi} est {2:le coach|la coach}. {moi} fait ses étirements en sous-vêtements pendant une minute, sous son regard.',
    { H: 'Séance de pompes au-dessus de {toi} : à chaque pompe, {moi} entre en elle. Dix pompes.',
      F: 'Séance de squats au-dessus de {toi} : à chaque squat, {moi} descend sur son sexe. Dix squats.' }] },
  { type: 'acc', g: 'acc', nom: 'Le Glaçon', prix: 200, gages: [
    '{moi} passe un glaçon sur la nuque de {toi}, puis réchauffe avec les lèvres.',
    '{moi} fait glisser un glaçon du cou au nombril de {toi}, puis réchauffe avec la bouche.',
    { H: '{moi} garde un glaçon en bouche, puis fait un cunnilingus à {toi} pendant une minute.',
      F: '{moi} garde un glaçon en bouche, puis fait une fellation à {toi} pendant une minute.' }] },
  { type: 'tentation', nom: 'Tentation' },
  { type: 'lieu', g: 'H', nom: 'L’Alcôve', prix: 350, gages: [
    '{moi} s’allonge contre {toi}, peau contre peau, pendant une minute.',
    '{moi} embrasse tout le corps de {toi}, sauf son sexe, pendant deux minutes.',
    { H: '{moi} lèche {toi} de bas en haut, très lentement, sans jamais toucher le clitoris, pendant deux minutes.',
      F: '{moi} lèche les testicules et la verge de {toi}, sans jamais prendre le gland en bouche, pendant deux minutes.' }] },
  { type: 'taxe', nom: 'Taxe sur la lingerie', montant: 100, alt: '{moi} offre à {toi} un baiser à l’endroit de son choix.' },
  { type: 'lieu', g: 'H', nom: 'Le Septième ciel', prix: 400, gages: [
    '{moi} offre à {toi} le plus long baiser de la soirée, une minute entière.',
    '{moi} caresse {toi} partout pendant deux minutes, les yeux dans les yeux.',
    { H: '{moi} fait jouir {toi} avec la langue, les doigts ou son sexe, comme elle le préfère.',
      F: '{moi} fait jouir {toi} avec la bouche, les mains ou son sexe, comme il le préfère.' }] },
];

// Gages piochés sur les cases Gage.
const GAGES = [
  // doux
  { n: 0, txt: '{moi} embrasse {toi} pendant dix secondes, sans s’arrêter.' },
  { n: 0, txt: '{moi} dit à {toi} trois choses qu’{il1} trouve irrésistibles chez {lui2}.' },
  { n: 0, txt: '{toi} embrasse {moi} dans le cou, lentement, cinq fois.' },
  { n: 0, txt: '{moi} retire ses chaussettes, ou un bijou, au choix.' },
  { n: 0, txt: '{moi} masse les pieds de {toi} pendant une minute.' },
  { n: 0, txt: '{moi} mordille l’oreille de {toi}, tout doucement.' },
  { n: 0, txt: '{toi} raconte le moment où {moi} lui a fait le plus d’effet.' },
  { n: 0, txt: '{moi} danse un slow avec {toi}, sans musique, pendant une minute.' },
  { n: 0, txt: '{moi} trace un mot du bout du doigt dans le dos de {toi}. Trois essais pour deviner.' },
  { n: 0, txt: '{toi} choisit un endroit de son corps, et {moi} y dépose dix baisers.' },
  { n: 0, txt: 'Jusqu’au prochain tour de {moi}, vous restez main dans la main.' },
  { n: 0, txt: '{moi} regarde {toi} dans les yeux pendant trente secondes. Le premier qui rit doit un baiser à l’autre.' },
  // coquin
  { n: 1, txt: '{moi} retire un vêtement, au choix de {toi}.' },
  { n: 1, txt: '{toi} bande les yeux de {moi} et l’embrasse à trois endroits. {moi} doit deviner où.' },
  { n: 1, txt: '{moi} décrit à voix basse ce qu’{il1} fera à {toi} après la partie.' },
  { n: 1, txt: '{moi} embrasse {toi} de la clavicule jusqu’au nombril, lentement.' },
  { n: 1, txt: '{toi} passe un glaçon, ou ses doigts froids, le long du dos de {moi}.' },
  { n: 1, txt: '{moi} fait un strip-tease d’une minute pour {toi}. Au moins un vêtement doit tomber.' },
  { n: 1, txt: '{toi} garde les mains dans le dos pendant une minute, et {moi} l’allume sans jamais l’embrasser sur la bouche.' },
  { n: 1, txt: '{moi} avoue un fantasme qu’{il1} n’a jamais confié à {toi}.' },
  { n: 1, txt: '{moi} laisse un suçon à {toi}, à un endroit que personne d’autre ne verra.' },
  { n: 1, txt: '{moi} s’assoit sur les genoux de {toi} et se laisse caresser pendant une minute sans bouger.' },
  { n: 1, txt: '{toi} choisit un mot. Jusqu’à la fin de la partie, chaque fois que {moi} le prononce, {il1} retire un vêtement.' },
  { n: 1, txt: '{moi} enlève le haut de {toi} uniquement avec les dents.' },
  { n: 1, txt: '{moi} mime avec les mains ce qu’{il1} préfère que {toi} lui fasse.' },
  { n: 1, txt: '{moi} caresse {toi} par-dessus ses sous-vêtements pendant une minute.' },
  // brûlant. pour : 'H' si la carte ne se pioche que quand l'homme joue, 'F' pour la femme, rien pour les deux.
  { n: 2, txt: '{moi} finit la partie entièrement nu{e1}.' },
  { n: 2, txt: 'Soixante-neuf pendant une minute. Personne n’a le droit de s’arrêter en premier.' },
  { n: 2, txt: '{moi} et {toi} se caressent mutuellement le sexe pendant deux minutes, sans s’embrasser.' },
  { n: 2, txt: '{toi} choisit une position. Vous faites l’amour ainsi pendant une minute, puis la partie reprend comme si de rien n’était.' },
  { n: 2, txt: '{moi} décrit en détail, à l’oreille de {toi}, comment {il1} va {le2} faire jouir ce soir.' },
  { n: 2, txt: '{moi} se masturbe devant {toi} pendant une minute. {toi} regarde sans toucher.' },
  { n: 2, txt: 'Jusqu’au prochain tour de {moi}, chaque baiser se donne entre les cuisses.' },
  { n: 2, pour: 'H', txt: '{moi} fait un cunnilingus à {toi} pendant une minute.' },
  { n: 2, pour: 'H', txt: '{moi} ne joue qu’avec le clitoris de {toi} : un doigt ou la langue, rien d’autre, pendant deux minutes.' },
  { n: 2, pour: 'H', txt: '{moi} frotte son gland contre le clitoris de {toi} pendant une minute, sans entrer.' },
  { n: 2, pour: 'H', txt: '{moi} entre en {toi} pour trois allers-retours seulement, puis se retire. Pas un de plus.' },
  { n: 2, pour: 'H', txt: '{moi} n’entre que le gland en {toi} et reste ainsi trente secondes, sans bouger.' },
  { n: 2, pour: 'H', txt: 'Clitoris interdit : {moi} caresse et lèche tout le reste du sexe de {toi} pendant deux minutes.' },
  { n: 2, pour: 'H', txt: '{moi} prend {toi} en levrette pour dix va-et-vient, ni plus ni moins.' },
  { n: 2, pour: 'H', txt: '{moi} lèche les tétons de {toi} pendant qu’un doigt caresse son clitoris, pendant une minute.' },
  { n: 2, pour: 'H', txt: '{moi} glisse deux doigts en {toi} et cherche son point G pendant une minute.' },
  { n: 2, pour: 'H', txt: '{toi} se caresse le clitoris pendant une minute, et {moi} ne peut l’aider qu’avec la bouche, sur ses seins.' },
  { n: 2, pour: 'H', txt: '{moi} souffle doucement sur le sexe de {toi}, puis le lèche une seule fois, de bas en haut. Trois fois de suite.' },
  { n: 2, pour: 'F', txt: '{moi} fait une fellation à {toi} pendant une minute.' },
  { n: 2, pour: 'F', txt: '{moi} ne joue qu’avec le gland de {toi} : les lèvres ou la langue, rien d’autre, pendant deux minutes.' },
  { n: 2, pour: 'F', txt: '{moi} frotte son clitoris contre le gland de {toi} pendant une minute, sans le laisser entrer.' },
  { n: 2, pour: 'F', txt: '{moi} s’assoit sur {toi} et le laisse entrer pour trois allers-retours seulement, puis se relève. Pas un de plus.' },
  { n: 2, pour: 'F', txt: '{moi} ne laisse entrer que le gland de {toi} et reste ainsi trente secondes, sans bouger.' },
  { n: 2, pour: 'F', txt: '{moi} lèche les testicules de {toi} tout en le caressant doucement, pendant une minute.' },
  { n: 2, pour: 'F', txt: '{moi} chevauche {toi} pour dix va-et-vient, ni plus ni moins, puis se relève.' },
  { n: 2, pour: 'F', txt: '{moi} caresse le sexe de {toi} entre ses seins pendant une minute.' },
  { n: 2, pour: 'F', txt: '{moi} prend {toi} en bouche aussi loin qu’elle le peut, cinq fois, très lentement.' },
  { n: 2, pour: 'F', txt: 'Gland interdit : {moi} caresse et lèche tout le reste du sexe de {toi} pendant deux minutes.' },
  { n: 2, pour: 'F', txt: '{moi} se caresse le clitoris contre la cuisse de {toi} pendant une minute, en le regardant dans les yeux.' },
];

// Cartes Tentation, adressées au joueur dont c'est le tour. fx : argent, vers (case), recule, menottes, deLautre, libere
const TENTATIONS = [
  { txt: 'Rends-toi au Jacuzzi. Si tu passes par le Départ, encaisse 200.', fx: { vers: 14 } },
  { txt: 'Direction le Septième ciel, sans détour.', fx: { vers: 39 } },
  { txt: 'Retour au Départ. Encaisse 200 et un baiser de {toi}.', fx: { vers: 0 } },
  { txt: 'Tu as été {1:surpris|surprise} en train de rougir. Recule de trois cases.', fx: { recule: 3 } },
  { txt: 'Pensées bien trop coquines : file en Abstinence, sans passer par le Départ.', fx: { menottes: true } },
  { txt: '{toi} te trouve irrésistible ce soir et te verse 50 frissons. Puis te le prouve par un baiser.', fx: { deLautre: 50 } },
  { txt: 'Tu reçois un pourboire de 150 frissons pour ta tenue.', fx: { argent: 150 } },
  { txt: 'Lingerie hors de prix. Paie 100 frissons à la banque.', fx: { argent: -100 } },
  { txt: 'Carte Joker : garde-la pour sortir de l’Abstinence gratuitement.', fx: { libere: true } },
  { txt: 'Anniversaire de votre premier baiser. {toi} te paie 30 frissons, et tu choisis où tu veux être {1:embrassé|embrassée}.', fx: { deLautre: 30 } },
  { txt: 'Hôtel réservé à la dernière minute. Paie 60 frissons à la banque et rends-toi à la Chambre d’hôtel.', fx: { argent: -60, vers: 27 } },
  { txt: 'Billet de dernière minute : file au Train de nuit.', fx: { vers: 26 } },
  { txt: 'Massage gagné à la tombola : {toi} te masse le dos pendant une minute, et tu encaisses 40 frissons.', fx: { argent: 40 } },
  { txt: 'Nuit torride en vue : {toi} te verse 20 frissons et te promet une faveur au lit.', fx: { deLautre: 20 } },
];
