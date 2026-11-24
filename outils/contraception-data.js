/* ═══════════════════════════════════════════════════════════════════════════
   CONTRACEPTION — catalogue partagé (24/11/2026)
   Source unique pour : questionnaire de consultation, questionnaire de suivi,
   générateur. Le questionnaire de préparation visio (côté cliente) reprend la
   même logique avec ses propres formulations.

   Sources : livre « Troubles hormonaux : reprenez le pouvoir ! » (pp. 270-312 :
   effets de la pilule, tableau « effets secondaires → causes fonctionnelles »
   p. 290, « Depuis que vous prenez la pilule… » pp. 296-299, alternatives
   pp. 300-305, arrêt pp. 306-312) ; liste des marques : ANSM / HAS / Vidal.
   Les éléments marqués [hors livre] viennent des notices ou de l'ANSM, pas du livre.

   Règle de la praticienne : on n'incite JAMAIS une cliente à arrêter sa
   contraception et on ne donne jamais d'avis sur son choix. Les textes « à dire »
   expliquent le fonctionnement et ce que la méthode peut produire.
   ═══════════════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  /* ── Méthodes : label = texte du menu déroulant (commence par Pilule / Patch / Anneau / DIU / Implant…
        pour rester reconnu par les règles du générateur et le CRM). ── */
  var METHODES = [
    { id: 'aucune', groupe: 'aucune', label: 'Aucune', marques: [],
      dire: "Aucune contraception : le cycle, lui, peut se lire tel qu'il est. Si une grossesse n'est pas souhaitée, pensez à demander quelle méthode de protection est utilisée." },

    /* ── Pilules œstroprogestatives ── */
    { id: 'pilule_comb_2g', groupe: 'combinee', label: 'Pilule œstroprogestative — 2e génération (lévonorgestrel)',
      marques: ['Minidril', 'Ludéal', 'Adépal', 'Trinordiol', 'Optidril', 'Leeloo', 'Lovavulo', 'Optilova', 'Daily', 'Asterluna', 'Lolistrel', 'Seasonique', 'Qiade'],
      progestatif: 'lévonorgestrel (2e génération)',
      dire: "Cette pilule apporte deux hormones de synthèse : un œstrogène, l'éthinylœstradiol, et un progestatif, le lévonorgestrel. Elles disent au cerveau que l'ovulation n'est pas nécessaire, et les ovaires sont mis au repos. Ce que la femme voit chaque mois n'est pas de vraies règles mais un saignement de privation, au moment de la pause. Ces hormones ne sont pas bio-identiques et sollicitent beaucoup le foie, ce qui consomme vitamines B, magnésium, zinc et sélénium. Le risque de caillot est plus faible qu'avec les 3e et 4e générations." },
    { id: 'pilule_comb_3g', groupe: 'combinee', label: 'Pilule œstroprogestative — 3e génération (désogestrel, gestodène, norgestimate)',
      marques: ['Mercilon', 'Cycleane', 'Varnoline', 'Harmonet', 'Méliane', 'Minesse', 'Moneva', 'Phaeva', 'Carlin', 'Optinesse', 'Minulet', 'Triminulet', 'Melodia', 'Cilest', 'Effiprev', 'Tricilest', 'Triafemi'],
      progestatif: 'désogestrel, gestodène ou norgestimate (3e génération)',
      dire: "Même principe que toute pilule combinée : un œstrogène de synthèse plus un progestatif, ovulation bloquée, saignements de privation et non de vraies règles. Ces pilules de 3e génération exposent davantage au risque de caillots (phlébite, embolie, AVC) que celles de 2e génération. Elles sont moins dosées en œstrogène, mais cela ne change rien au travail demandé au foie." },
    { id: 'pilule_comb_4g', groupe: 'combinee', label: 'Pilule œstroprogestative — 4e génération et autres progestatifs (drospirénone, chlormadinone, diénogest, cyprotérone, nomégestrol)',
      marques: ['Jasmine', 'Jasminelle', 'Convuline', 'Bélanette', 'Drospibel', 'Belara', 'Valette', 'Zoély', 'Drovelis', 'Diane 35', 'Holgyème', 'Evepar', 'Minerva'],
      progestatif: 'drospirénone, chlormadinone, diénogest, cyprotérone ou nomégestrol',
      dire: "Même principe que toute pilule combinée. Avec la drospirénone, comme avec le désogestrel, le risque de caillots est nettement augmenté. Certains progestatifs (cyprotérone dans Diane 35® et ses génériques, chlormadinone) ont un effet anti-androgène : ils calment l'acné et la pilosité en bloquant les récepteurs, sans traiter leur cause, qui peut revenir à l'arrêt. Diane 35® et génériques ne sont autorisées que pour l'hirsutisme, en dernier recours (ANSM)." },
    { id: 'pilule_comb_autre', groupe: 'combinee', label: 'Pilule œstroprogestative — marque ou génération non précisée',
      marques: [],
      progestatif: 'à préciser',
      dire: "Pilule combinée : œstrogène de synthèse plus progestatif, ovulation bloquée, saignements de privation. Notez la marque exacte pour connaître le progestatif et la génération." },

    /* ── Pilules progestatives ── */
    { id: 'pilule_prog_deso', groupe: 'progestative', label: 'Pilule progestative microdosée — désogestrel 75 µg',
      marques: ['Cérazette', 'Optimizette', 'Antigone', 'Elfasette'],
      progestatif: 'désogestrel 75 µg (3e génération)',
      dire: "Pas d'œstrogène : un progestatif seul. Cette pilule épaissit la glaire et rend la muqueuse de l'utérus impropre à l'implantation, mais elle ne bloque l'ovulation que partiellement : une ovulation peut avoir lieu, mais de moins bonne qualité, avec peu de progestérone derrière. Les vraies règles ne sont pas toujours conservées, et environ un tiers des femmes ont des petits saignements (spotting) fréquents et imprévisibles. Le livre rappelle que c'est un cancérogène possible classé 2B par le CIRC. L'ANSM signale aussi un risque de méningiome avec le désogestrel." },
    { id: 'pilule_prog_levo', groupe: 'progestative', label: 'Pilule progestative microdosée — lévonorgestrel 30 µg',
      marques: ['Microval'],
      progestatif: 'lévonorgestrel 30 µg (2e génération)',
      dire: "Progestatif seul, sans œstrogène. Elle doit être prise à heure très régulière : un décalage de plus de 3 heures compromet son efficacité. Elle bloque l'ovulation de façon partielle : l'efficacité repose surtout sur la glaire épaissie et la muqueuse utérine modifiée. Les règles ne sont pas toujours conservées, avec des spottings fréquents chez environ un tiers des femmes." },
    { id: 'pilule_prog_drospi', groupe: 'progestative', label: 'Pilule progestative — drospirénone 4 mg',
      marques: ['Slinda'],
      progestatif: 'drospirénone 4 mg (4e génération)',
      dire: "Progestatif seul, sans œstrogène, avec un effet anti-androgène en plus (utile contre l'acné, mais l'acné peut tout de même s'aggraver chez certaines femmes). Elle bloque l'ovulation de façon partielle. Comme les autres pilules progestatives, elle est classée cancérogène possible (2B) par le CIRC d'après le livre." },
    { id: 'pilule_macro', groupe: 'macro', label: 'Pilule macroprogestative (progestatif fortement dosé : Lutényl, Colprone, Lutéran…)',
      marques: ['Lutényl', 'Colprone', 'Lutéran'],
      progestatif: 'nomégestrol, médrogestone, chlormadinone…',
      dire: "Progestatifs fortement dosés, qui bloquent totalement l'ovulation et mettent les ovaires au repos. Ils n'ont pas d'autorisation de mise sur le marché comme contraceptifs : ils sont prescrits pour une hyperœstrogénie, un syndrome prémenstruel, un fibrome ou une endométriose. Le cycle est à l'arrêt. Le livre signale que l'acétate de nomégestrol (Lutényl®), l'acétate de chlormadinone et la cyprotérone augmentent fortement le risque de méningiome." },

    /* ── Hors pilule : patch, anneau, implant, injection ── */
    { id: 'patch', groupe: 'patch_anneau', label: 'Patch contraceptif (Evra)',
      marques: ['Evra'],
      progestatif: 'norelgestromine + éthinylœstradiol',
      dire: "Le patch apporte les mêmes deux hormones que la pilule combinée, mais à travers la peau. La voie d'administration change, pas le principe : l'ovulation est bloquée, les saignements sont de privation, et les problèmes rencontrés sont relativement similaires à ceux de la pilule combinée." },
    { id: 'anneau', groupe: 'patch_anneau', label: 'Anneau vaginal (NuvaRing, Ornibel)',
      marques: ['NuvaRing', 'Ornibel'],
      progestatif: 'étonogestrel + éthinylœstradiol',
      dire: "L'anneau libère les mêmes deux hormones que la pilule combinée, par voie vaginale. L'ovulation est bloquée, les saignements sont de privation, et les problèmes rencontrés sont relativement similaires à ceux de la pilule combinée." },
    { id: 'implant', groupe: 'implant', label: 'Implant contraceptif (Nexplanon)',
      marques: ['Nexplanon'],
      progestatif: 'étonogestrel (3e génération)',
      dire: "L'implant contient un progestatif de 3e génération, sans œstrogène de synthèse. Il bloque l'ovulation, épaissit la glaire et modifie la muqueuse utérine. Il agit 3 ans, 2 ans en cas d'obésité, et la libération de l'hormone est deux fois plus importante la première année que la troisième. Il peut augmenter le taux d'insuline, ce qui peut induire une prise de poids, et des états dépressifs, voire suicidaires, ont été rapportés. Après la pose, des saignements peuvent durer entre 3 semaines et 6 mois." },
    { id: 'injection', groupe: 'injection', label: 'Injection contraceptive (Depo-Provera) [hors livre]',
      marques: ['Depo-Provera'],
      progestatif: 'médroxyprogestérone',
      dire: "Progestatif injecté tous les 3 mois : il bloque l'ovulation. Les règles disparaissent souvent. Le retour de l'ovulation peut prendre plusieurs mois après la dernière injection. Ce point n'est pas traité dans le livre ; en parler au médecin pour tout le reste." },

    /* ── DIU ── */
    { id: 'diu_horm', groupe: 'diu_hormonal', label: 'DIU hormonal / stérilet hormonal (Mirena, Donasert, Kyleena, Jaydess)',
      marques: ['Mirena', 'Donasert', 'Kyleena', 'Jaydess'],
      progestatif: 'lévonorgestrel (2e génération)',
      dire: "Le stérilet hormonal libère du lévonorgestrel dans l'utérus. Il épaissit la glaire et modifie la muqueuse, mais une fraction du progestatif passe dans le sang : 85 % des femmes n'ovulent pas la première année après la pose. Au-delà, l'anovulation tombe à 15 %, donc la grande majorité ovule ensuite, mais pas toujours avec la même qualité. Parmi les effets fréquents de la notice : maux de tête, acné, pilosité, vulvovaginite, dépression, nervosité, baisse de libido, prise de poids. Durée : Mirena 8 ans, Donasert 6 ans, Kyleena 5 ans, Jaydess 3 ans (ANSM, pour la contraception)." },
    { id: 'diu_cuivre', groupe: 'diu_cuivre', label: 'DIU cuivre / stérilet au cuivre (Mona Lisa, TT380, NT380, UT380, Gynelle, Ballerine…)',
      marques: ['Mona Lisa', 'TT380', 'NT380', 'UT380', 'Gynelle', 'Ballerine', 'Multiload'],
      progestatif: 'aucun hormone',
      dire: "Le stérilet au cuivre est non hormonal : son effet contraceptif est surtout dû au cuivre, qui est spermicide. Il préserve l'ovulation et peut être une bonne alternative à la contraception hormonale, même chez une femme qui n'a jamais eu d'enfant. En revanche il augmente souvent l'abondance des règles et parfois la douleur : il est déconseillé en cas de règles abondantes ou douloureuses et d'endométriose, qu'il faut d'abord prendre en charge (déséquilibre œstro-progestéronique). Durée habituelle : 5 ans." },

    /* ── Urgence, barrière, observation, stérilisation ── */
    { id: 'urgence', groupe: 'urgence', label: "Contraception d'urgence récente (Norlevo, Ellaone)",
      marques: ['Norlevo', 'Ellaone', 'Lévonorgestrel 1,5 mg'],
      progestatif: 'lévonorgestrel ou ulipristal',
      dire: "Prise ponctuelle après un rapport non protégé. Elle retarde l'ovulation et peut décaler le prochain cycle de quelques jours. Elle ne remplace pas une contraception régulière." },
    { id: 'preservatif', groupe: 'barriere', label: 'Préservatif masculin ou féminin',
      marques: [],
      dire: "Le préservatif est le seul moyen de contraception qui protège des infections sexuellement transmissibles. Il a aussi l'avantage d'engager l'homme dans la contraception du couple. Sa fiabilité dépend beaucoup de sa pose." },
    { id: 'barriere_autre', groupe: 'barriere', label: 'Diaphragme, cape cervicale ou spermicides [hors livre]',
      marques: [],
      dire: "Méthodes de barrière sans hormone, sans effet sur l'ovulation ni sur le cycle." },
    { id: 'moc', groupe: 'moc', label: "Méthode d'observation du cycle (symptothermie, glaire, température)",
      marques: [],
      dire: "La femme observe chaque jour sa glaire, sa température et la position de son col pour repérer ses périodes fertiles. Ces méthodes sont fiables à condition d'être bien formée par une monitrice spécialisée. À ne pas confondre avec la méthode Ogino, dite « du calendrier », qui n'a rien de physiologique et dont la fiabilité est très mauvaise. Elles préservent l'ovulation et aident à concevoir." },
    { id: 'sterilisation', groupe: 'sterilisation', label: 'Stérilisation (ligature des trompes ou vasectomie du partenaire)',
      marques: [],
      dire: "Contraception définitive. Elle n'a aucun impact hormonal : les ovaires continuent de fonctionner normalement et le cycle reste physiologique." },
    { id: 'autre', groupe: 'autre', label: 'Autre',
      marques: [],
      dire: "Notez le nom exact de la méthode dans le champ « marque » pour que le protocole en tienne compte." }
  ];

  /* ── Regroupements d'affichage du menu ── */
  var GROUPES_SELECT = [
    { titre: 'Aucune', ids: ['aucune'] },
    { titre: 'Pilules œstroprogestatives (combinées)', ids: ['pilule_comb_2g', 'pilule_comb_3g', 'pilule_comb_4g', 'pilule_comb_autre'] },
    { titre: 'Pilules progestatives (sans œstrogène)', ids: ['pilule_prog_deso', 'pilule_prog_levo', 'pilule_prog_drospi', 'pilule_macro'] },
    { titre: 'Patch, anneau, implant, injection', ids: ['patch', 'anneau', 'implant', 'injection'] },
    { titre: 'Stérilets (DIU)', ids: ['diu_horm', 'diu_cuivre'] },
    { titre: 'Autres moyens', ids: ['urgence', 'preservatif', 'barriere_autre', 'moc', 'sterilisation', 'autre'] }
  ];

  /* ── Symptômes à explorer, par famille de méthode.
        t   = ce que décrit la cliente (devient une case à cocher et un signe de détection)
        why = « pourquoi » à expliquer à la cliente (cause fonctionnelle) ── */
  var SYMPTOMES_COMBINEE = [
    { t: "Baisse de libido, perte de confiance en soi ou difficulté à prendre des décisions depuis la pilule",
      why: "La pilule met les ovaires au repos : ils fabriquent moins de testostérone, et la pilule fait en plus monter la SHBG, la protéine qui la lie. La testostérone libre, la seule active, s'effondre. Cet effet est surtout marqué avec un progestatif anti-androgénique. (pp. 282, 297)" },
    { t: "Acné, peau grasse ou pilosité apparues ou aggravées sous pilule",
      why: "Certains progestatifs ont un fort index androgénique et augmentent l'imprégnation en hormones masculines. L'acné et les poils en sont la partie visible. (pp. 282, 297)" },
    { t: "Chute de cheveux depuis la pilule",
      why: "Elle peut venir d'une imprégnation androgénique accrue ou d'une thyroïde ralentie par la pilule : le tableau p. 290 retient ces deux pistes. Une pilule anti-androgénique peut aussi rendre les récepteurs plus sensibles, et la chute apparaît après l'arrêt." },
    { t: "Prise de poids, digestion plus lente, frilosité ou fatigue depuis la pilule",
      why: "La pilule altère la fonction thyroïdienne de plusieurs façons : moins d'iode absorbé, déficit en sélénium et en zinc (T4 mal convertie en T3), augmentation du cadmium, protéine de transport des hormones thyroïdiennes qui monte. La prise de poids sous pilule s'explique, mais elle n'est pas physiologique. (pp. 283-284, 297)" },
    { t: "Fatigue profonde, essoufflement ou énergie qui s'effondre depuis la pilule",
      why: "Les déficits en CoQ10 de la pilule peuvent altérer le fonctionnement des mitochondries, les centrales énergétiques des cellules. Une hypothyroïdie induite par la pilule peut s'y ajouter. (p. 297)" },
    { t: "Tensions musculaires, crampes, réveils nocturnes ou plus de sensibilité au stress depuis la pilule",
      why: "La pilule épuise le magnésium, indispensable à la gestion du stress. Les femmes qui en prennent sont donc plus vulnérables au stress. (pp. 280, 298)" },
    { t: "Impatience, irritabilité, agressivité ou difficulté à lâcher prise depuis la pilule",
      why: "La pilule semble épuiser la sérotonine : les vitamines B6, B9, B12 et le zinc, nécessaires à sa fabrication, sont diminués. La sérotonine est le neurotransmetteur du lâcher prise. (pp. 280, 298)" },
    { t: "Envies de sucre ou compulsions alimentaires, surtout en fin de journée, depuis la pilule",
      why: "Un déficit en sérotonine favorise les compulsions alimentaires de fin de journée, ce qui peut contribuer à la prise de poids induite par la pilule. (p. 280)" },
    { t: "Seins douloureux ou tendus, chevilles gonflées ou rétention d'eau sous pilule",
      why: "Ce sont des signes d'hyperœstrogénie : l'éthinylœstradiol est un œstrogène de synthèse très puissant, et la détox des œstrogènes est parfois insuffisante. (pp. 290, 298)" },
    { t: "Saignements ou spotting en dehors de la semaine de pause",
      why: "Des saignements entre les « règles » traduisent probablement une hyperœstrogénie : la pilule n'est peut-être pas adaptée, à voir avec le médecin. (pp. 290, 298)" },
    { t: "Maux de tête ou migraines depuis la pilule",
      why: "Les maux de tête peuvent venir d'une hypothyroïdie ou d'une surcharge hépatique. Des maux de tête inhabituels ou des jambes lourdes demandent aussi un avis médical (risque de caillot). (pp. 290, 296)" },
    { t: "Nausées, sensation d'être barbouillée ou envie de vomir sous pilule",
      why: "Le foie est surchargé : il doit éliminer l'éthinylœstradiol, hormone de synthèse puissante, en plus des siennes. Les voies biliaires peuvent aussi être en cause. (pp. 276-279, 290, 298)" },
    { t: "Mycoses, démangeaisons vulvaires, infections vaginales ou cystites à répétition",
      why: "La pilule déséquilibre le microbiote vaginal. Prendre soin du microbiote intestinal aide aussi. (pp. 290, 298)" },
    { t: "Ventre qui gonfle ou prise de ventre depuis la pilule",
      why: "La pilule augmente probablement l'insuline : le ventre est la zone de stockage préférée quand l'insuline est élevée. (p. 299)" },
    { t: "Épuisement, confusion, forte vulnérabilité au stress, allergies ou inflammation depuis la pilule",
      why: "La pilule semble fatiguer les surrénales : elle augmente le transporteur du cortisol, donc le cortisol libre baisse. Le fonctionnement des surrénales et de la thyroïde étant liés, l'un entraîne l'autre. (pp. 284, 299)" },
    { t: "Cholestérol ou triglycérides qui ont augmenté depuis la pilule",
      why: "Le tableau p. 290 retient deux pistes : la surcharge hépatique et l'insulinorésistance. (p. 290)" },
    { t: "Taches sombres sur le visage (masque de grossesse) depuis la pilule",
      why: "Le tableau p. 290 les relie à la thyroïde et à la fatigue surrénalienne, à vérifier. (p. 290)" },
    { t: "Mémoire ou concentration qui flanchent depuis la pilule",
      why: "La pilule fait perdre du zinc et fait monter le cuivre. Ce déséquilibre cuivre/zinc est connu pour altérer les fonctions cognitives : l'excès de cuivre est toxique pour les neurones. (p. 280)" }
  ];

  var SYMPTOMES = {
    combinee: SYMPTOMES_COMBINEE,
    patch_anneau: SYMPTOMES_COMBINEE,
    progestative: [
      { t: "Règles absentes, spotting fréquent ou saignements imprévisibles sous pilule progestative",
        why: "Ces pilules n'inhibent pas complètement l'axe cerveau-ovaires : l'ovulation peut avoir lieu, de mauvaise qualité, avec peu de progestérone. Environ un tiers des femmes ont des spottings fréquents. (p. 301)" },
      { t: "Prise de poids depuis la pilule progestative",
        why: "Effet secondaire fréquent des pilules progestatives. Avant d'attribuer la prise de poids à la pilule seule, il faut explorer la thyroïde et l'insuline. (p. 301)" },
      { t: "Baisse de libido depuis la pilule progestative",
        why: "Effet secondaire fréquent. Les pilules à progestatif anti-androgénique font baisser l'imprégnation androgénique. (pp. 282, 301)" },
      { t: "Maux de tête depuis la pilule progestative",
        why: "Effet secondaire fréquent. Des maux de tête inhabituels ou avec troubles de la vue doivent faire consulter. (p. 301)" },
      { t: "Douleurs mammaires depuis la pilule progestative",
        why: "Effet secondaire fréquent de ces pilules, qui peut signer un climat œstrogénique relatif. (p. 301)" },
      { t: "Acné apparue ou aggravée sous pilule progestative",
        why: "Certains progestatifs sont proandrogéniques et peuvent aggraver l'acné. Slinda® a pourtant une double action anti-androgène, ce qui n'empêche pas l'acné chez certaines. (pp. 282, 301)" }
    ],
    macro: [
      { t: "Règles disparues ou très diminuées sous macroprogestatif",
        why: "Ces progestatifs fortement dosés bloquent totalement l'ovulation et mettent les ovaires au repos : le cycle n'existe plus. (p. 301)" },
      { t: "Prise de poids, baisse de libido ou maux de tête depuis le macroprogestatif",
        why: "Effets secondaires fréquents des progestatifs. (p. 301)" },
      { t: "Humeur déprimée, anxiété ou fatigue depuis le macroprogestatif",
        why: "Un progestatif fort bloque le cycle sans apporter d'œstrogène : à rapprocher de la thyroïde et des surrénales, déjà impactées par les pilules." }
    ],
    diu_hormonal: [
      { t: "Maux de tête depuis la pose du stérilet hormonal",
        why: "Effet secondaire fréquent de la notice. (pp. 302-303)" },
      { t: "Acné, peau grasse, pilosité ou chute de cheveux depuis la pose du stérilet hormonal",
        why: "Une partie du progestatif passe dans le sang : le livre écarte l'idée qu'un effet « local » seulement pourrait expliquer acné et chute de cheveux. (pp. 302-303)" },
      { t: "Prise de poids depuis la pose du stérilet hormonal",
        why: "Effet secondaire fréquent de la notice. (p. 302)" },
      { t: "Baisse de libido depuis la pose du stérilet hormonal",
        why: "Effet secondaire fréquent de la notice, lié à la baisse d'imprégnation androgénique. (pp. 282, 302)" },
      { t: "Nervosité, anxiété ou vertiges depuis la pose du stérilet hormonal",
        why: "Plusieurs femmes dans le monde ont signalé anxiété, vertiges et dépression, souvent minimisés. À prendre au sérieux. (pp. 302-303)" },
      { t: "Humeur sombre ou dépressive depuis la pose du stérilet hormonal",
        why: "Une dépression a été rapportée avec ces stérilets. En cas d'idées noires : avis médical sans attendre. (pp. 302-303)" },
      { t: "Mycoses ou vulvovaginites depuis la pose du stérilet hormonal",
        why: "Parmi les effets fréquents de la notice. (p. 302)" },
      { t: "Saignements irréguliers ou règles disparues depuis la pose du stérilet hormonal",
        why: "L'ovulation, elle, peut revenir : l'absence de règles ne dit rien sur l'ovulation. 85 % des femmes n'ovulent pas la première année, mais la grande majorité ovule ensuite. (p. 302)" }
    ],
    diu_cuivre: [
      { t: "Règles plus abondantes qu'avant la pose du stérilet au cuivre",
        why: "Le stérilet au cuivre augmente souvent l'abondance des règles. Si elles étaient déjà abondantes, il y a probablement un déséquilibre œstro-progestéronique à prendre en charge. (p. 304)" },
      { t: "Règles plus longues ou plus douloureuses depuis la pose du stérilet au cuivre",
        why: "Il augmente parfois la douleur associée aux règles. Des règles douloureuses signalent qu'il y a probablement un déséquilibre à corriger, voire une endométriose. (pp. 290, 304)" },
      { t: "Fatigue, essoufflement ou vertiges depuis la pose du stérilet au cuivre",
        why: "Des règles plus abondantes font perdre du fer : la fatigue peut venir d'une carence en fer, à vérifier (ferritine)." },
      { t: "Saignements entre les règles depuis la pose du stérilet au cuivre",
        why: "À signaler au médecin : à distinguer d'un déséquilibre œstro-progestéronique ou d'un problème de position du dispositif." }
    ],
    implant: [
      { t: "Prise de poids depuis la pose de l'implant",
        why: "L'implant peut augmenter le taux d'insuline, ce qui peut induire une prise de poids. (p. 303)" },
      { t: "Fringales, coups de barre après les repas ou envies de sucre depuis l'implant",
        why: "Signes d'une insuline élevée, que l'implant peut majorer. (p. 303)" },
      { t: "Humeur sombre, dépressive ou anxieuse depuis l'implant",
        why: "Des déprimes, voire des dépressions suicidaires, ont été rapportées avec l'implant. En cas d'idées noires : avis médical sans attendre. (p. 303)" },
      { t: "Saignements irréguliers ou prolongés depuis l'implant",
        why: "Après la pose, des saignements peuvent durer entre 3 semaines et 6 mois. Au-delà, à signaler au médecin. (p. 303)" },
      { t: "Acné, chute de cheveux ou baisse de libido depuis l'implant",
        why: "Une partie du progestatif passe dans le sang et modifie l'imprégnation androgénique. (pp. 282, 303)" },
      { t: "Maux de tête depuis l'implant",
        why: "À signaler au médecin, surtout s'ils sont inhabituels ou associés à une tension élevée. (p. 303)" }
    ],
    injection: [
      { t: "Règles absentes ou saignements irréguliers depuis les injections [hors livre]",
        why: "Le progestatif injecté bloque l'ovulation de façon durable : le cycle n'existe plus tant qu'il agit." },
      { t: "Prise de poids, baisse d'humeur ou de libido depuis les injections [hors livre]",
        why: "Effets secondaires décrits des progestatifs. À rapprocher de la thyroïde et de l'insuline." }
    ]
  };

  /* Depuis l'arrêt : ce que la pilule masquait (pp. 306-311). */
  var SYMPTOMES_ARRET = [
    { t: "Depuis l'arrêt : acné ou peau grasse apparue ou revenue",
      why: "La pilule réduisait les hormones masculines : à l'arrêt, elles remontent. Ce qui revient montre ce que la pilule masquait. (pp. 306-310)" },
    { t: "Depuis l'arrêt : chute de cheveux",
      why: "Un changement hormonal peut faire passer davantage de cheveux en phase de chute, deux à quatre mois après l'arrêt. Elle est en général temporaire, mais peut révéler une imprégnation androgénique ou une thyroïde à explorer." },
    { t: "Depuis l'arrêt : cycles absents, très longs ou irréguliers",
      why: "Si les cycles étaient irréguliers avant la pilule et que la cause n'a pas été prise en charge, ils sont certainement toujours perturbés : un retard de règles est toujours un retard d'ovulation. (p. 307)" },
    { t: "Depuis l'arrêt : règles revenues mais douloureuses ou abondantes",
      why: "Des règles douloureuses ou abondantes signalent un déséquilibre œstro-progestéronique ou une endométriose : la pilule les masquait. (pp. 290, 309)" },
    { t: "Depuis l'arrêt : syndrome prémenstruel marqué",
      why: "Le cycle naturel reprend le dessus : ce qui était masqué par la pilule réapparaît, signe d'un déséquilibre œstro-progestéronique d'origine. (p. 309)" },
    { t: "Depuis l'arrêt : glaire cervicale absente ou toujours épaisse",
      why: "Les modifications du col induites par le progestatif peuvent persister au-delà de la prise : la glaire continue de barrer la route aux spermatozoïdes. (p. 308)" },
    { t: "Depuis l'arrêt : aucune ovulation repérée (ni glaire filante, ni température)",
      why: "Un cycle ovulatoire n'est pas forcément fertile, et le retour des règles ne prouve pas l'ovulation : il faut observer pour savoir où l'on en est. (p. 308)" },
    { t: "Depuis l'arrêt : prise ou perte de poids, fatigue ou frilosité",
      why: "À l'arrêt, les problèmes thyroïdiens peuvent se résorber, mais cela peut prendre plus ou moins de temps. (p. 284)" }
  ];

  /* « Où en est la cliente ? » (pp. 306-311) */
  var PROJETS = [
    { k: 'cycles', l: "Arrêter pour retrouver ses cycles",
      dire: "Pour bénéficier de l'Ovulation Power, ovuler ne suffit pas : il faut bien ovuler. Ce n'est pas compatible avec un contraceptif hormonal, dont l'arrêt est donc indispensable. Arrêtez la pilule dès que la réflexion est mûre : un sevrage progressif n'a pas de sens, la pilule ne crée pas d'addiction. Pas besoin d'attendre la fin de la plaquette. L'ovulation peut revenir dès le premier cycle : si une grossesse n'est pas souhaitée, prévoir une contraception non hormonale dès l'arrêt. (pp. 306-308)" },
    { k: 'situer', l: "Arrêter pour voir où elle en est (cycles, règles, acné)",
      dire: "Sous contraception hormonale, il est impossible de savoir où l'on en est : cycles, règles, acné sont des indicateurs précieux, et les dosages hormonaux ne sont pas interprétables. L'arrêt est nécessaire à l'enquête fonctionnelle. Mais si les symptômes d'origine reviennent, il vaut mieux avoir pris le temps d'optimiser le terrain avant d'arrêter (idéalement 3 mois). (p. 309)" },
    { k: 'bebe', l: "Arrêter pour concevoir un enfant",
      dire: "C'est le meilleur moment pour prendre soin de soi. Le retour du cycle ne veut pas dire retour de la fertilité : la première ovulation peut être de mauvaise qualité. Il est déconseillé d'essayer tout de suite : arrêter la pilule au moins 3 mois, idéalement 6 mois, avant d'essayer, pour remonter les carences (B6, B9, B12, magnésium, zinc, sélénium, antioxydants) et faire les analyses. Pour la B9, privilégier la forme méthylée (5-MTHF) : certaines femmes ne peuvent pas utiliser l'acide folique. Vérifier aussi la thyroïde. (pp. 308-312)" },
    { k: 'autre', l: "Passer à une contraception non hormonale",
      dire: "Préservatif, stérilet au cuivre (qui augmente les règles et la douleur : déconseillé si règles abondantes, douloureuses ou endométriose), méthodes d'observation du cycle (formation par une monitrice indispensable). (pp. 300-305)" },
    { k: 'indecise', l: "Elle s'interroge, rien n'est décidé",
      dire: "La femme informée doit pouvoir choisir librement : intérêt d'un cycle physiologique, effets et risques de sa méthode, alternatives. Pas d'avis sur son choix. Si elle choisit de garder sa contraception, on soutient son terrain (carences, foie, antioxydants). (p. 312)" }
  ];

  /* Alertes : avis médical, jamais de conseil d'arrêt. */
  var ALERTES = [
    "Maux de tête inhabituels, jambes lourdes, douleur au mollet : sous pilule, ils peuvent signaler un risque de caillot (phlébite, embolie pulmonaire, AVC, infarctus). Avis médical avant tout accompagnement. (p. 296)",
    "Tabac associé à une pilule œstroprogestative : à ne jamais associer, car il augmente fortement le risque de complications thromboemboliques (p. 291). À signaler au médecin.",
    "Humeur sombre, idées noires sous implant ou stérilet hormonal : avis médical sans attendre. (pp. 302-303)",
    "Maux de tête inhabituels, troubles de la vue sous macroprogestatif (Lutényl, Colprone, Lutéran), cyprotérone ou désogestrel : risque de méningiome signalé par l'ANSM, avis médical. (p. 301)",
    "Antécédents de phlébite, hypertension, migraine, diabète, cancer hormono-dépendant ou insuffisance hépatique : à réévaluer avec le médecin à chaque renouvellement. (p. 291)"
  ];

  /* ── Fonctions utilitaires ── */
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function byId(id) { for (var i = 0; i < METHODES.length; i++) if (METHODES[i].id === id) return METHODES[i]; return null; }
  function parLabel(label) {
    var l = String(label || '');
    for (var i = 0; i < METHODES.length; i++) if (METHODES[i].label === l) return METHODES[i];
    return null;
  }
  /* Retrouve la méthode d'après une marque saisie (« Minidril », « mirena », « Cerazette »…). */
  function parMarque(nom) {
    var n = norm(nom);
    if (!n) return null;
    for (var i = 0; i < METHODES.length; i++) {
      var m = METHODES[i];
      for (var j = 0; j < m.marques.length; j++) {
        if (norm(m.marques[j]) === n) return { methode: m, marque: m.marques[j] };
      }
    }
    for (var i2 = 0; i2 < METHODES.length; i2++) {
      var m2 = METHODES[i2];
      for (var j2 = 0; j2 < m2.marques.length; j2++) {
        var nb = norm(m2.marques[j2]);
        if (nb && (n.indexOf(nb) === 0 || nb.indexOf(n) === 0) && n.length >= 4) return { methode: m2, marque: m2.marques[j2] };
      }
    }
    return null;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function reEsc(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /* Remplit un <select> avec les groupes de méthodes (conserve la 1re option vide déjà présente). */
  function fillSelect(sel, opts) {
    if (!sel) return;
    opts = opts || {};
    var html = '<option value="">— —</option>';
    GROUPES_SELECT.forEach(function (g) {
      var inner = g.ids.map(function (id) {
        var m = byId(id);
        var attr = id === 'aucune' && opts.funnelAucune ? ' data-funnel="pilule-aucune"' : '';
        return '<option' + attr + '>' + esc(m.label) + '</option>';
      }).join('');
      if (g.ids.length === 1) html += inner; else html += '<optgroup label="' + esc(g.titre) + '">' + inner + '</optgroup>';
    });
    sel.innerHTML = html;
  }
  function fillDatalist(dl) {
    if (!dl) return;
    var out = [];
    METHODES.forEach(function (m) { m.marques.forEach(function (b) { out.push('<option value="' + esc(b) + '">'); }); });
    dl.innerHTML = out.join('');
  }

  /* Signes pour la détection de spécialité (un signe = un symptôme distinct). */
  function specSigns() {
    var seen = {}, out = [];
    function add(arr) {
      arr.forEach(function (s) {
        if (seen[s.t]) return; seen[s.t] = 1;
        out.push({ label: s.t.replace(/ \[hors livre\]$/, ''), patterns: [new RegExp(reEsc(s.t))] });
      });
    }
    Object.keys(SYMPTOMES).forEach(function (k) { add(SYMPTOMES[k]); });
    add(SYMPTOMES_ARRET);
    return out;
  }

  /* Rend les cases à cocher d'une liste de symptômes (même structure que les autres check-items). */
  function itemsHtml(list) {
    return list.map(function (s) {
      return '<div class="check-item"><div class="ci-top"><div class="cb">✓</div> <span>' + esc(s.t) + '</span></div>' +
        '<span class="ci-why">' + esc(s.why) + '</span></div>';
    }).join('');
  }

  /* Famille de symptômes pour une méthode ('' si aucune liste). */
  function familleSymptomes(m) { return m && SYMPTOMES[m.groupe] ? m.groupe : ''; }

  root.CONTRA = {
    methodes: METHODES, groupesSelect: GROUPES_SELECT, symptomes: SYMPTOMES, symptomesArret: SYMPTOMES_ARRET,
    projets: PROJETS, alertes: ALERTES,
    byId: byId, parLabel: parLabel, parMarque: parMarque,
    fillSelect: fillSelect, fillDatalist: fillDatalist, specSigns: specSigns, itemsHtml: itemsHtml,
    familleSymptomes: familleSymptomes, norm: norm
  };
})(typeof window !== 'undefined' ? window : this);
