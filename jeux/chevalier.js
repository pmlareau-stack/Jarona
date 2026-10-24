// Kris contre le Chevalier : Kris ferme les fontaines noires du labyrinthe
// pendant que le Roaring Knight le poursuit. L'épée des coins rend le Chevalier faible quelques secondes.
// Tout est dessiné ici, en pixels faits maison : aucune image ni aucun son copié d'un jeu.
(function () {
  var fr = document.documentElement.lang.indexOf("fr") === 0;
  var mots = fr
    ? {
        debut1: "* Ferme toutes les fontaines noires !",
        debut2: "Touche ici ou appuie sur Entrée",
        pret: "PRÊT !",
        gagne: "* Les fontaines sont fermées !",
        fin1: "* Le Chevalier t'a eu...",
        fin2: "Score : {s}",
        nouveau: "★ Nouveau record ! ★",
        rejouer: "Touche ici pour rejouer",
        score: "Score {s}",
        record: "★ {s}",
        niveau: "Niveau {s}",
      }
    : {
        debut1: "* Close all the dark fountains!",
        debut2: "Tap here or press Enter",
        pret: "READY!",
        gagne: "* The fountains are closed!",
        fin1: "* The Knight got you...",
        fin2: "Score: {s}",
        nouveau: "★ New record! ★",
        rejouer: "Tap here to play again",
        score: "Score {s}",
        record: "★ {s}",
        niveau: "Level {s}",
      };

  // ---------- Le labyrinthe ----------
  // # mur   . fontaine noire   o épée   - porte de la maison du Chevalier   (espace) couloir vide
  var CARTE = [
    "############################",
    "#............##............#",
    "#.####.#####.##.#####.####.#",
    "#o####.#####.##.#####.####o#",
    "#.####.#####.##.#####.####.#",
    "#..........................#",
    "#.####.##.########.##.####.#",
    "#.####.##.########.##.####.#",
    "#......##....##....##......#",
    "######.##### ## #####.######",
    "     #.##### ## #####.#     ",
    "     #.##          ##.#     ",
    "     #.## ###--### ##.#     ",
    "######.## #      # ##.######",
    "      .   #      #   .      ",
    "######.## #      # ##.######",
    "     #.## ######## ##.#     ",
    "     #.##          ##.#     ",
    "     #.## ######## ##.#     ",
    "######.## ######## ##.######",
    "#............##............#",
    "#.####.#####.##.#####.####.#",
    "#.####.#####.##.#####.####.#",
    "#o..##.......  .......##..o#",
    "###.##.##.########.##.##.###",
    "###.##.##.########.##.##.###",
    "#......##....##....##......#",
    "#.##########.##.##########.#",
    "#.##########.##.##########.#",
    "#..........................#",
    "############################",
  ];

  var T = 16; // taille d'une case (en points de jeu)
  var COLS = 28;
  var RANGS = CARTE.length;
  var W = COLS * T;
  var H = RANGS * T;
  var RANG_TUNNEL = 14;
  var DEPART_KRIS = { col: 13, rang: 23 };
  var DEVANT_PORTE = { col: 13, rang: 11 };
  var COIN_REPLI = { col: 25, rang: -3 };
  var CLE_RECORD = "jarona-chevalier-record";

  var HAUT = { x: 0, y: -1 };
  var BAS = { x: 0, y: 1 };
  var GAUCHE = { x: -1, y: 0 };
  var DROITE = { x: 1, y: 0 };
  var IMMOBILE = { x: 0, y: 0 };
  var DIRECTIONS = [HAUT, GAUCHE, BAS, DROITE];
  var PAR_NOM = { haut: HAUT, bas: BAS, gauche: GAUCHE, droite: DROITE };

  // Le Chevalier se replie dans son coin, puis chasse Kris, plusieurs fois (en secondes)
  var CYCLE = [["repli", 7], ["chasse", 20], ["repli", 7], ["chasse", 20], ["repli", 5], ["chasse", Infinity]];

  // ---------- Les dessins en pixels ----------
  var KRIS_A = [
    "...HHHH...",
    ".HHHHHHHH.",
    "HHHHHHHHHH",
    "HHHHHHHHHH",
    "HHSSSSSSHH",
    ".HSSSSSSH.",
    "..SSSSSS..",
    ".GGGGGGGG.",
    "GGYYYYYYGG",
    "SGGGGGGGGS",
    ".GGGGGGGG.",
    ".BB....BB.",
  ];
  var KRIS_B = KRIS_A.slice(0, 11).concat(["..BB..BB.."]);
  var COULEURS_KRIS = { H: "#6b3a1f", S: "#f4cfa8", G: "#3a9b5c", Y: "#f5d547", B: "#2b2d4a" };

  // Le Roaring Knight : une silhouette noire pleine de pointes, une grande lame et l'épée vers le bas
  var CHEVALIER = [
    "....K..K.K.....",
    ".....KKK.KK....",
    "..K..KKKKK..K..",
    "...KKKKKKKKKK..",
    "....KEKKEKK....",
    ".....KKKKKK....",
    "KKKKKKKKKKKKKK.",
    ".KKKKKKKKKKKKKK",
    "...KKKKKKKKK...",
    "..KK.KKKKK.KK..",
    ".KK...KKK...K..",
    "K.....KKK......",
    ".......K.......",
    ".......K.......",
    ".......K.......",
  ];
  var YEUX = CHEVALIER.map(function (ligne) {
    return ligne.replace(/[^E]/g, ".");
  });

  var FONTAINE = [".K.", "KKK", "KKK"];
  var EPEE = ["..W..", "..W..", "..W..", "..W..", "..W..", "GGGGG", "..R..", "..R..", "..G.."];
  var COULEURS_EPEE = { W: "#e8ecff", G: "#ffd23c", R: "#b8432f" };

  // ---------- La page ----------
  var canevas = document.getElementById("labyrinthe");
  var ctx = canevas.getContext("2d");
  var elVies = document.getElementById("vies");
  var elScore = document.getElementById("score");
  var elRecord = document.getElementById("record");
  var elNiveau = document.getElementById("niveau");

  var sprites = {};
  var fondMurs = null;
  var echelle = 1;

  // ---------- L'état du jeu ----------
  var etat = "attente"; // attente, pret, jeu, mort, gagne, fin
  var minuterieEtat = 0;
  var score = 0;
  var vies = 3;
  var niveau = 1;
  var record = lireRecord();
  var nouveauRecord = false;
  var fontaines = new Set();
  var epees = new Set();
  var kris;
  var chevalier;
  var indexCycle = 0;
  var minuterieCycle = 0;
  var minuteriePeur = 0;
  var bulles = [];
  var horloge = 0;

  function lireRecord() {
    try {
      return Number(localStorage.getItem(CLE_RECORD)) || 0;
    } catch (e) {
      return 0;
    }
  }

  function garderRecord(valeur) {
    try {
      localStorage.setItem(CLE_RECORD, String(valeur));
    } catch (e) {}
  }

  // ---------- Les cases ----------
  function tuile(col, rang) {
    if (rang < 0 || rang >= RANGS) return "#";
    if (col < 0 || col >= COLS) return rang === RANG_TUNNEL ? " " : "#";
    return CARTE[rang][col];
  }

  function enrouler(col) {
    return ((col % COLS) + COLS) % COLS;
  }

  function peutAller(col, rang, dir) {
    if (dir.x === 0 && dir.y === 0) return false;
    var nc = col + dir.x;
    if (rang === RANG_TUNNEL) nc = enrouler(nc);
    var t = tuile(nc, rang + dir.y);
    return t !== "#" && t !== "-";
  }

  function contraire(a, b) {
    return a.x === -b.x && a.y === -b.y && (a.x !== 0 || a.y !== 0);
  }

  // Les cases où Kris peut aller (pour dessiner les murs seulement autour des couloirs)
  var accessible = (function () {
    var vu = CARTE.map(function (ligne) {
      return ligne.split("").map(function () {
        return false;
      });
    });
    var file = [[DEPART_KRIS.col, DEPART_KRIS.rang]];
    vu[DEPART_KRIS.rang][DEPART_KRIS.col] = true;
    while (file.length) {
      var c = file.shift();
      DIRECTIONS.forEach(function (d) {
        var nc = c[0] + d.x;
        var nr = c[1] + d.y;
        if (nr === RANG_TUNNEL) nc = enrouler(nc);
        if (nr < 0 || nr >= RANGS || nc < 0 || nc >= COLS || vu[nr][nc]) return;
        if (CARTE[nr][nc] === "#") return;
        vu[nr][nc] = true;
        file.push([nc, nr]);
      });
    }
    return vu;
  })();

  // ---------- Les vitesses (en cases par seconde) ----------
  function vitesseKris() {
    return Math.min(8, 7 + 0.2 * (niveau - 1));
  }

  function vitesseChevalier() {
    var c = chevalier;
    if (c.mode === "yeux") return 14;
    if (c.mode === "peur") return vitesseKris() * 0.5;
    var v = vitesseKris() * Math.min(1.08, 0.98 + 0.04 * (niveau - 1));
    if (c.rang === RANG_TUNNEL && (c.col <= 5 || c.col >= 22)) v *= 0.5;
    return v;
  }

  function dureePeur() {
    return Math.max(3, 7 - (niveau - 1));
  }

  // ---------- Mise en place ----------
  function remplirLabyrinthe() {
    fontaines.clear();
    epees.clear();
    for (var r = 0; r < RANGS; r++) {
      for (var c = 0; c < COLS; c++) {
        if (CARTE[r][c] === ".") fontaines.add(c + "," + r);
        if (CARTE[r][c] === "o") epees.add(c + "," + r);
      }
    }
  }

  function placerPersonnages() {
    kris = { col: DEPART_KRIS.col, rang: DEPART_KRIS.rang, p: 0, dir: GAUCHE, suivante: GAUCHE, pas: 0 };
    chevalier = { col: DEVANT_PORTE.col, rang: DEVANT_PORTE.rang, p: 0, dir: GAUCHE, mode: "repli", minuterie: 0 };
    indexCycle = 0;
    minuterieCycle = CYCLE[0][1];
    minuteriePeur = 0;
    bulles = [];
  }

  function commencer() {
    score = 0;
    vies = 3;
    niveau = 1;
    nouveauRecord = false;
    remplirLabyrinthe();
    placerPersonnages();
    etat = "pret";
    minuterieEtat = 1.5;
    majHud();
  }

  function majHud() {
    var coeurs = "";
    for (var i = 0; i < 3; i++) coeurs += i < vies ? "❤" : "♡";
    elVies.textContent = coeurs;
    elScore.textContent = mots.score.replace("{s}", score);
    elRecord.textContent = mots.record.replace("{s}", record);
    elNiveau.textContent = mots.niveau.replace("{s}", niveau);
  }

  // ---------- Kris ----------
  function avancerKris(dt) {
    var k = kris;
    if (k.dir.x === 0 && k.dir.y === 0) {
      if (peutAller(k.col, k.rang, k.suivante)) k.dir = k.suivante;
      else return;
    } else if (contraire(k.suivante, k.dir)) {
      k.col = enrouler(k.col + k.dir.x);
      k.rang += k.dir.y;
      k.p = 1 - k.p;
      k.dir = k.suivante;
    } else if (k.suivante !== k.dir && k.p < 0.3 && peutAller(k.col, k.rang, k.suivante)) {
      // Un virage demandé juste après le croisement compte quand même (plus facile pour les enfants)
      k.dir = k.suivante;
      k.p = 0;
    }

    k.p += vitesseKris() * dt;
    k.pas += dt;
    while (k.p >= 1) {
      k.p -= 1;
      k.col = enrouler(k.col + k.dir.x);
      k.rang += k.dir.y;
      arriveeKris();
      if (etat !== "jeu") return;
      if (peutAller(k.col, k.rang, k.suivante)) {
        k.dir = k.suivante;
      } else if (!peutAller(k.col, k.rang, k.dir)) {
        k.dir = IMMOBILE;
        k.p = 0;
        return;
      }
    }
  }

  function arriveeKris() {
    var cle = kris.col + "," + kris.rang;
    if (fontaines.delete(cle)) score += 10;
    if (epees.delete(cle)) {
      score += 50;
      commencerPeur();
    }
    if (fontaines.size === 0 && epees.size === 0) {
      etat = "gagne";
      minuterieEtat = 2;
    }
    majHud();
  }

  // ---------- Le Chevalier ----------
  function modeDuCycle() {
    return CYCLE[indexCycle][0];
  }

  function demiTour(c) {
    c.col = enrouler(c.col + c.dir.x);
    c.rang += c.dir.y;
    c.p = 1 - c.p;
    c.dir = { x: -c.dir.x, y: -c.dir.y };
  }

  function commencerPeur() {
    if (chevalier.mode === "repli" || chevalier.mode === "chasse") {
      demiTour(chevalier);
      chevalier.mode = "peur";
    }
    minuteriePeur = dureePeur();
  }

  function choisirDirection(c) {
    var options = DIRECTIONS.filter(function (d) {
      return !contraire(d, c.dir) && peutAller(c.col, c.rang, d);
    });
    if (!options.length) return { x: -c.dir.x, y: -c.dir.y };
    if (c.mode === "peur") return options[Math.floor(Math.random() * options.length)];

    var cible = COIN_REPLI;
    if (c.mode === "yeux") cible = DEVANT_PORTE;
    if (c.mode === "chasse") cible = { col: kris.col, rang: kris.rang };

    var meilleure = options[0];
    var meilleureDistance = Infinity;
    options.forEach(function (d) {
      var dx = c.col + d.x - cible.col;
      var dy = c.rang + d.y - cible.rang;
      var distance = dx * dx + dy * dy;
      if (distance < meilleureDistance) {
        meilleureDistance = distance;
        meilleure = d;
      }
    });
    return meilleure;
  }

  function avancerChevalier(dt) {
    var c = chevalier;
    if (c.mode === "maison") {
      c.minuterie -= dt;
      if (c.minuterie <= 0) {
        c.mode = modeDuCycle();
        c.col = DEVANT_PORTE.col;
        c.rang = DEVANT_PORTE.rang;
        c.p = 0;
        c.dir = GAUCHE;
      }
      return;
    }

    c.p += vitesseChevalier() * dt;
    while (c.p >= 1) {
      c.p -= 1;
      c.col = enrouler(c.col + c.dir.x);
      c.rang += c.dir.y;
      if (c.mode === "yeux" && c.col === DEVANT_PORTE.col && c.rang === DEVANT_PORTE.rang) {
        c.mode = "maison";
        c.minuterie = 2;
        c.p = 0;
        return;
      }
      c.dir = choisirDirection(c);
    }
  }

  function avancerCycle(dt) {
    if (minuteriePeur > 0) {
      minuteriePeur -= dt;
      if (minuteriePeur <= 0 && chevalier.mode === "peur") chevalier.mode = modeDuCycle();
      return;
    }
    minuterieCycle -= dt;
    if (minuterieCycle <= 0 && indexCycle < CYCLE.length - 1) {
      indexCycle += 1;
      minuterieCycle = CYCLE[indexCycle][1];
      if (chevalier.mode === "repli" || chevalier.mode === "chasse") {
        chevalier.mode = modeDuCycle();
        demiTour(chevalier);
      }
    }
  }

  // ---------- Positions à l'écran ----------
  function position(e) {
    return { x: (e.col + 0.5 + e.dir.x * e.p) * T, y: (e.rang + 0.5 + e.dir.y * e.p) * T };
  }

  function verifierContact() {
    if (chevalier.mode === "maison" || chevalier.mode === "yeux") return;
    var a = position(kris);
    var b = position(chevalier);
    if (Math.hypot(a.x - b.x, a.y - b.y) > T * 0.6) return;
    if (chevalier.mode === "peur") {
      chevalier.mode = "yeux";
      score += 200;
      bulles.push({ texte: "200", x: b.x, y: b.y, temps: 1 });
      majHud();
    } else {
      etat = "mort";
      minuterieEtat = 1.5;
    }
  }

  // ---------- La boucle du jeu ----------
  function avancer(dt) {
    horloge += dt;
    bulles.forEach(function (b) {
      b.temps -= dt;
      b.y -= 12 * dt;
    });
    bulles = bulles.filter(function (b) {
      return b.temps > 0;
    });

    if (etat === "jeu") {
      avancerCycle(dt);
      avancerKris(dt);
      if (etat !== "jeu") return;
      verifierContact();
      if (etat !== "jeu") return;
      avancerChevalier(dt);
      verifierContact();
      return;
    }

    if (etat === "pret" || etat === "mort" || etat === "gagne") {
      minuterieEtat -= dt;
      if (minuterieEtat > 0) return;
      if (etat === "pret") {
        etat = "jeu";
      } else if (etat === "mort") {
        vies -= 1;
        majHud();
        if (vies <= 0) {
          finir();
        } else {
          placerPersonnages();
          etat = "pret";
          minuterieEtat = 1.5;
        }
      } else {
        niveau += 1;
        remplirLabyrinthe();
        placerPersonnages();
        etat = "pret";
        minuterieEtat = 1.5;
        majHud();
      }
    }
  }

  function finir() {
    etat = "fin";
    if (score > record) {
      record = score;
      nouveauRecord = true;
      garderRecord(record);
    }
    majHud();
  }

  // ---------- Les dessins ----------
  // Prépare un dessin en pixels nets (avec un contour au besoin), à la taille de l'écran
  function preparerSprite(grille, couleurs, cellule, contour) {
    var c = Math.max(1, Math.round(cellule * echelle));
    var colonnes = grille[0].length;
    var rangees = grille.length;
    var toile = document.createElement("canvas");
    toile.width = (colonnes + 2) * c;
    toile.height = (rangees + 2) * c;
    var t = toile.getContext("2d");
    function plein(r, col) {
      return r >= 0 && r < rangees && col >= 0 && col < colonnes && grille[r][col] !== ".";
    }
    if (contour) {
      t.fillStyle = contour;
      for (var r = 0; r < rangees; r++) {
        for (var col = 0; col < colonnes; col++) {
          if (!plein(r, col)) continue;
          DIRECTIONS.forEach(function (d) {
            if (!plein(r + d.y, col + d.x)) t.fillRect((col + d.x + 1) * c, (r + d.y + 1) * c, c, c);
          });
        }
      }
    }
    for (var r2 = 0; r2 < rangees; r2++) {
      for (var col2 = 0; col2 < colonnes; col2++) {
        var lettre = grille[r2][col2];
        if (lettre === ".") continue;
        t.fillStyle = couleurs[lettre];
        t.fillRect((col2 + 1) * c, (r2 + 1) * c, c, c);
      }
    }
    return toile;
  }

  function preparerSprites() {
    sprites.krisA = preparerSprite(KRIS_A, COULEURS_KRIS, 1.4);
    sprites.krisB = preparerSprite(KRIS_B, COULEURS_KRIS, 1.4);
    sprites.chevalier = preparerSprite(CHEVALIER, { K: "#000000", E: "#ffffff" }, 1.3, "#6f6699");
    sprites.peur = preparerSprite(CHEVALIER, { K: "#2340ff", E: "#ffffff" }, 1.3, "#ffffff");
    sprites.peurFin = preparerSprite(CHEVALIER, { K: "#ffffff", E: "#ff2a3c" }, 1.3, "#2340ff");
    sprites.yeux = preparerSprite(YEUX, { E: "#ffffff" }, 1.3);
    sprites.fontaine = preparerSprite(FONTAINE, { K: "#0a0612" }, 1.6, "#e8e8ff");
    sprites.epee = preparerSprite(EPEE, COULEURS_EPEE, 1.3);
    sprites.epeeKris = preparerSprite(EPEE, COULEURS_EPEE, 1.1);
  }

  // Dessine les murs une fois, dans une image de fond
  function preparerMurs() {
    fondMurs = document.createElement("canvas");
    fondMurs.width = canevas.width;
    fondMurs.height = canevas.height;
    var m = fondMurs.getContext("2d");
    m.setTransform(echelle, 0, 0, echelle, 0, 0);
    m.fillStyle = "#05030d";
    m.fillRect(0, 0, W, H);

    function prochesCouloir(c, r) {
      for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
          var nr = r + dy;
          var nc = c + dx;
          if (nr >= 0 && nr < RANGS && nc >= 0 && nc < COLS && accessible[nr][nc]) return true;
        }
      }
      return false;
    }

    for (var r = 0; r < RANGS; r++) {
      for (var c = 0; c < COLS; c++) {
        if (CARTE[r][c] !== "#" || !prochesCouloir(c, r)) continue;
        m.fillStyle = "#1a0d3d";
        m.fillRect(c * T, r * T, T, T);
      }
    }

    m.strokeStyle = "#8a5cff";
    m.lineWidth = 2;
    m.beginPath();
    for (var r2 = 0; r2 < RANGS; r2++) {
      for (var c2 = 0; c2 < COLS; c2++) {
        if (CARTE[r2][c2] !== "#") continue;
        var x = c2 * T;
        var y = r2 * T;
        if (r2 > 0 && accessible[r2 - 1][c2] && CARTE[r2 - 1][c2] !== "-") {
          m.moveTo(x, y + 1);
          m.lineTo(x + T, y + 1);
        }
        if (r2 < RANGS - 1 && accessible[r2 + 1][c2] && CARTE[r2 + 1][c2] !== "-") {
          m.moveTo(x, y + T - 1);
          m.lineTo(x + T, y + T - 1);
        }
        if (c2 > 0 && accessible[r2][c2 - 1]) {
          m.moveTo(x + 1, y);
          m.lineTo(x + 1, y + T);
        }
        if (c2 < COLS - 1 && accessible[r2][c2 + 1]) {
          m.moveTo(x + T - 1, y);
          m.lineTo(x + T - 1, y + T);
        }
      }
    }
    m.stroke();

    // La porte de la maison du Chevalier
    m.fillStyle = "#ff9ccc";
    for (var c3 = 0; c3 < COLS; c3++) {
      if (CARTE[12][c3] === "-") m.fillRect(c3 * T, 12 * T + T / 2 - 1.5, T, 3);
    }
  }

  function poser(sprite, x, y) {
    ctx.drawImage(sprite, Math.round(x * echelle - sprite.width / 2), Math.round(y * echelle - sprite.height / 2));
  }

  function ecrire(lignes, voile) {
    ctx.save();
    ctx.setTransform(echelle, 0, 0, echelle, 0, 0);
    if (voile) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.fillRect(0, 0, W, H);
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    lignes.forEach(function (ligne, i) {
      ctx.fillStyle = ligne.couleur || "#ffffff";
      ctx.font = (ligne.taille || 20) + 'px "Pixelify Sans", monospace';
      var y = ligne.y || H / 2 + (i - (lignes.length - 1) / 2) * 36;
      ctx.fillText(ligne.texte, W / 2, y);
    });
    ctx.restore();
  }

  function dessiner() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (fondMurs) ctx.drawImage(fondMurs, 0, 0);

    fontaines.forEach(function (cle) {
      var p = cle.split(",");
      poser(sprites.fontaine, (Number(p[0]) + 0.5) * T, (Number(p[1]) + 0.5) * T);
    });
    if (Math.floor(horloge * 4) % 2 === 0 || etat !== "jeu") {
      epees.forEach(function (cle) {
        var p = cle.split(",");
        poser(sprites.epee, (Number(p[0]) + 0.5) * T, (Number(p[1]) + 0.5) * T);
      });
    }

    if (etat !== "attente") {
      // Le Chevalier
      if (etat !== "gagne") {
        var c = position(chevalier);
        var flotte = Math.sin(horloge * 6) * 0.8;
        var dessin = sprites.chevalier;
        if (chevalier.mode === "peur") {
          var clignote = minuteriePeur < 2 && Math.floor(horloge * 6) % 2 === 0;
          dessin = clignote ? sprites.peurFin : sprites.peur;
        }
        if (chevalier.mode === "yeux") dessin = sprites.yeux;
        if (chevalier.mode === "maison") {
          ctx.globalAlpha = 0.5;
          poser(sprites.chevalier, 14 * T, 14.5 * T + flotte);
          ctx.globalAlpha = 1;
        } else {
          poser(dessin, c.x, c.y + flotte);
        }
      }

      // Kris
      var k = position(kris);
      var bouge = etat === "jeu" && (kris.dir.x !== 0 || kris.dir.y !== 0);
      var image = bouge && Math.floor(kris.pas * 7) % 2 === 1 ? sprites.krisB : sprites.krisA;
      if (etat === "mort") ctx.globalAlpha = Math.max(0, minuterieEtat / 1.5);
      poser(image, k.x, k.y);
      if (minuteriePeur > 0 && etat === "jeu") poser(sprites.epeeKris, k.x + T * 0.7, k.y);
      ctx.globalAlpha = 1;
    }

    bulles.forEach(function (b) {
      ecrire([{ texte: b.texte, couleur: "#ffd23c", taille: 14, y: b.y }]);
    });

    if (etat === "attente") {
      ecrire([{ texte: mots.debut1 }, { texte: mots.debut2, couleur: "#ffd23c", taille: 18 }], true);
    } else if (etat === "pret") {
      ecrire([{ texte: mots.pret, couleur: "#ffd23c", y: 17.5 * T }]);
    } else if (etat === "gagne") {
      ecrire([{ texte: mots.gagne, couleur: "#ffd23c" }], true);
    } else if (etat === "fin") {
      var lignes = [{ texte: mots.fin1 }, { texte: mots.fin2.replace("{s}", score) }];
      if (nouveauRecord) lignes.push({ texte: mots.nouveau, couleur: "#ffd23c" });
      lignes.push({ texte: mots.rejouer, couleur: "#ffd23c", taille: 18 });
      ecrire(lignes, true);
    }
  }

  // Le canevas suit sa taille à l'écran, net même sur les écrans très fins
  function ajuster() {
    var largeur = canevas.getBoundingClientRect().width || W;
    var ratio = window.devicePixelRatio || 1;
    canevas.width = Math.round(largeur * ratio);
    canevas.height = Math.round(((largeur * H) / W) * ratio);
    echelle = canevas.width / W;
    preparerSprites();
    preparerMurs();
    dessiner();
  }

  // ---------- Les commandes ----------
  function diriger(dir) {
    if (etat === "attente" || etat === "fin") {
      commencer();
      return;
    }
    if (kris) kris.suivante = dir;
  }

  window.addEventListener("keydown", function (e) {
    var cle = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if ((cle === "Enter" || cle === " ") && (etat === "attente" || etat === "fin")) {
      e.preventDefault();
      commencer();
      return;
    }
    var dir = {
      ArrowUp: HAUT,
      w: HAUT,
      ArrowDown: BAS,
      s: BAS,
      ArrowLeft: GAUCHE,
      a: GAUCHE,
      ArrowRight: DROITE,
      d: DROITE,
    }[cle];
    if (dir && etat !== "attente" && etat !== "fin") {
      e.preventDefault();
      kris.suivante = dir;
    }
  });

  // Glisser le doigt sur le jeu
  var depart = null;
  canevas.addEventListener("pointerdown", function (e) {
    if (etat === "attente" || etat === "fin") {
      commencer();
      return;
    }
    depart = { x: e.clientX, y: e.clientY };
    canevas.setPointerCapture(e.pointerId);
  });
  canevas.addEventListener("pointermove", function (e) {
    if (!depart || !kris) return;
    var dx = e.clientX - depart.x;
    var dy = e.clientY - depart.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    kris.suivante = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? DROITE : GAUCHE) : dy > 0 ? BAS : HAUT;
    depart = { x: e.clientX, y: e.clientY };
  });
  ["pointerup", "pointercancel"].forEach(function (nom) {
    canevas.addEventListener(nom, function () {
      depart = null;
    });
  });

  // Les flèches à l'écran (cellulaire et tablette)
  document.querySelectorAll("[data-dir]").forEach(function (bouton) {
    bouton.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      diriger(PAR_NOM[bouton.getAttribute("data-dir")]);
    });
  });

  var avant = performance.now();
  function boucle(maintenant) {
    var dt = Math.min(0.05, (maintenant - avant) / 1000);
    avant = maintenant;
    avancer(dt);
    dessiner();
    requestAnimationFrame(boucle);
  }

  // Pour vérifier le jeu (lecture seulement) : JaronaChevalier.etat() dans la console
  window.JaronaChevalier = {
    etat: function () {
      return {
        etat: etat,
        vies: vies,
        score: score,
        niveau: niveau,
        fontaines: fontaines.size,
        epees: epees.size,
        kris: { col: kris.col, rang: kris.rang, p: kris.p, dir: kris.dir },
        chevalier: { col: chevalier.col, rang: chevalier.rang, p: chevalier.p, dir: chevalier.dir, mode: chevalier.mode },
      };
    },
  };

  remplirLabyrinthe();
  placerPersonnages();
  majHud();
  window.addEventListener("resize", ajuster);
  ajuster();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(dessiner);
  requestAnimationFrame(boucle);
})();
