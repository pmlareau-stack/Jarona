// Esquive les pétales : le cœur rouge doit éviter les pétales de Flowery.
// Tout est dessiné ici, en code : aucune image du jeu Deltarune.
(function () {
  var fr = document.documentElement.lang.indexOf("fr") === 0;
  var langue = fr ? "fr-CA" : "en-CA";
  var mots = fr
    ? {
        debut1: "* Évite les pétales de Flowery !",
        debut2: "Touche ici ou appuie sur Entrée",
        fin: "* Tu as tenu {s} secondes !",
        nouveau: "★ Nouveau record ! ★",
        rejouer: "Touche ici pour rejouer",
        temps: "⏱ {s} s",
        record: "★ Record {s} s",
      }
    : {
        debut1: "* Dodge Flowery's petals!",
        debut2: "Tap here or press Enter",
        fin: "* You lasted {s} seconds!",
        nouveau: "★ New record! ★",
        rejouer: "Tap here to play again",
        temps: "⏱ {s} s",
        record: "★ Best {s} s",
      };

  var L = 480; // taille de l'arène (en points de jeu)
  var VIES_MAX = 5;
  var CLE_RECORD = "jarona-petales-record";

  var canevas = document.getElementById("arene");
  var ctx = canevas.getContext("2d");
  var elVies = document.getElementById("vies");
  var elTemps = document.getElementById("temps");
  var elRecord = document.getElementById("record");

  var etat = "attente"; // attente, jeu, fin
  var coeur, cible, petales, vies, invincible, temps, prochain, nouveauRecord;
  var touches = {};
  var record = lireRecord();

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

  function secondes(valeur) {
    return valeur.toLocaleString(langue, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  function majHud() {
    var coeurs = "";
    for (var i = 0; i < VIES_MAX; i++) coeurs += i < vies ? "❤" : "♡";
    elVies.textContent = "HP " + coeurs;
    elTemps.textContent = mots.temps.replace("{s}", secondes(temps));
    elRecord.textContent = mots.record.replace("{s}", secondes(record));
  }

  function reinitialiser() {
    coeur = { x: L / 2, y: L * 0.78, r: 11 };
    cible = null;
    petales = [];
    vies = VIES_MAX;
    invincible = 0;
    temps = 0;
    prochain = 0.5;
    nouveauRecord = false;
    majHud();
  }

  function commencer() {
    reinitialiser();
    etat = "jeu";
  }

  // Un nouveau pétale tombe du haut ; plus le temps passe, plus il y en a et plus ils vont vite
  function nouveauPetale() {
    var penche = temps > 15 && Math.random() < 0.3;
    petales.push({
      x0: 12 + Math.random() * (L - 24),
      y: -16,
      vy: Math.min(360, 110 + Math.random() * 70 + temps * 2.2),
      vx: penche ? (Math.random() - 0.5) * 120 : 0,
      ampleur: 15 + Math.random() * 35,
      phase: Math.random() * Math.PI * 2,
      vitesseBalance: 1.5 + Math.random() * 1.5,
      angle: Math.random() * Math.PI,
      tourne: (Math.random() - 0.5) * 4,
      age: 0,
      x: 0,
    });
  }

  function avancer(dt) {
    if (etat !== "jeu") return;
    temps += dt;

    // Le cœur bouge avec les flèches…
    var dx = 0;
    var dy = 0;
    if (touches.ArrowLeft || touches.a) dx -= 1;
    if (touches.ArrowRight || touches.d) dx += 1;
    if (touches.ArrowUp || touches.w) dy -= 1;
    if (touches.ArrowDown || touches.s) dy += 1;
    coeur.x += dx * 240 * dt;
    coeur.y += dy * 240 * dt;

    // …ou suit le doigt
    if (cible) {
      var ex = cible.x - coeur.x;
      var ey = cible.y - coeur.y;
      var dist = Math.hypot(ex, ey);
      var pas = Math.min(dist, 480 * dt);
      if (dist > 0.5) {
        coeur.x += (ex / dist) * pas;
        coeur.y += (ey / dist) * pas;
      }
    }

    var bord = coeur.r + 6;
    coeur.x = Math.max(bord, Math.min(L - bord, coeur.x));
    coeur.y = Math.max(bord, Math.min(L - bord, coeur.y));

    prochain -= dt;
    if (prochain <= 0) {
      nouveauPetale();
      prochain = Math.max(0.16, 0.65 - temps * 0.012);
    }

    invincible = Math.max(0, invincible - dt);

    for (var i = petales.length - 1; i >= 0; i--) {
      var p = petales[i];
      p.age += dt;
      p.y += p.vy * dt;
      p.x = p.x0 + Math.sin(p.phase + p.age * p.vitesseBalance) * p.ampleur + p.vx * p.age;
      p.angle += p.tourne * dt;
      if (p.y > L + 20) {
        petales.splice(i, 1);
        continue;
      }
      if (invincible === 0 && Math.hypot(p.x - coeur.x, p.y - coeur.y) < coeur.r + 6) {
        vies -= 1;
        invincible = 1.2;
        petales.splice(i, 1);
        if (vies <= 0) finir();
      }
    }
    majHud();
  }

  function finir() {
    etat = "fin";
    cible = null;
    if (temps > record) {
      record = temps;
      nouveauRecord = true;
      garderRecord(record);
    }
    majHud();
  }

  function dessinerCoeur(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.9);
    ctx.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.6, y - s * 1.1, x, y - s * 0.35);
    ctx.bezierCurveTo(x + s * 0.6, y - s * 1.1, x + s * 1.4, y - s * 0.1, x, y + s * 0.9);
    ctx.fill();
  }

  function dessinerPetale(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 11, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#ffe3f1";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ff8cc6";
    ctx.stroke();
    ctx.restore();
  }

  function ecrire(lignes) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, L, L);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    lignes.forEach(function (ligne, i) {
      ctx.fillStyle = ligne.couleur || "#ffffff";
      ctx.font = (ligne.taille || 22) + 'px "Pixelify Sans", monospace';
      ctx.fillText(ligne.texte, L / 2, L / 2 + (i - (lignes.length - 1) / 2) * 40);
    });
  }

  function dessiner() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, L, L);

    petales.forEach(dessinerPetale);

    // Le cœur clignote quand il vient d'être touché
    var visible = invincible === 0 || Math.floor(invincible * 10) % 2 === 0;
    if (visible) {
      ctx.fillStyle = "#ff2a3c";
      dessinerCoeur(coeur.x, coeur.y, coeur.r);
    }

    if (etat === "attente") {
      ecrire([{ texte: mots.debut1 }, { texte: mots.debut2, couleur: "#ffd23c", taille: 20 }]);
    } else if (etat === "fin") {
      var lignes = [{ texte: mots.fin.replace("{s}", secondes(temps)) }];
      if (nouveauRecord) lignes.push({ texte: mots.nouveau, couleur: "#ffd23c" });
      lignes.push({ texte: mots.rejouer, couleur: "#ffd23c", taille: 20 });
      ecrire(lignes);
    }
  }

  // Le canevas suit sa taille à l'écran, net même sur les écrans très fins
  function ajuster() {
    var largeur = canevas.getBoundingClientRect().width || L;
    var ratio = window.devicePixelRatio || 1;
    canevas.width = Math.round(largeur * ratio);
    canevas.height = Math.round(largeur * ratio);
    ctx.setTransform(canevas.width / L, 0, 0, canevas.height / L, 0, 0);
    dessiner();
  }

  function positionJeu(e) {
    var rect = canevas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * L,
      y: ((e.clientY - rect.top) / rect.height) * L,
    };
  }

  canevas.addEventListener("pointerdown", function (e) {
    if (etat !== "jeu") {
      commencer();
      return;
    }
    canevas.setPointerCapture(e.pointerId);
    cible = positionJeu(e);
  });

  canevas.addEventListener("pointermove", function (e) {
    if (etat === "jeu" && (e.buttons || e.pointerType === "touch")) cible = positionJeu(e);
  });

  canevas.addEventListener("pointerup", function () {
    cible = null;
  });

  canevas.addEventListener("pointercancel", function () {
    cible = null;
  });

  window.addEventListener("keydown", function (e) {
    var cle = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if ((cle === "Enter" || cle === " ") && etat !== "jeu") {
      e.preventDefault();
      commencer();
      return;
    }
    if (etat === "jeu" && /^(Arrow(Left|Right|Up|Down)|[wasd])$/.test(cle)) {
      e.preventDefault();
      touches[cle] = true;
    }
  });

  window.addEventListener("keyup", function (e) {
    var cle = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    touches[cle] = false;
  });

  var avant = performance.now();
  function boucle(maintenant) {
    var dt = Math.min(0.05, (maintenant - avant) / 1000);
    avant = maintenant;
    avancer(dt);
    dessiner();
    requestAnimationFrame(boucle);
  }

  reinitialiser();
  window.addEventListener("resize", ajuster);
  ajuster();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(dessiner);
  requestAnimationFrame(boucle);
})();
