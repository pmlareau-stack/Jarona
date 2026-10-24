// Mes idées : le blogue de Fakefile
(function () {
  var J = window.Jarona;
  var langue = J.fr ? "fr-CA" : "en-CA";
  var BROUILLON = "jarona-brouillon-idee";
  var mots = J.fr
    ? {
        vide: "* Pas encore d'idée. La première arrive bientôt !",
        chargement: "* Chargement…",
        erreurListe: "* Les idées ne veulent pas s'afficher. Réessaie plus tard.",
        retirer: "🗑 Retirer",
        confirmer: "Retirer cette idée du site ?",
        envoi: "* Sauvegarde…",
        merci: "* Ton idée est sur le site !",
        echec: "* Oups, l'idée n'est pas sauvegardée. Réessaie.",
        manque: "* Il faut un titre et un texte.",
      }
    : {
        vide: "* No ideas yet. The first one is coming soon!",
        chargement: "* Loading…",
        erreurListe: "* The ideas won't show up. Try again later.",
        retirer: "🗑 Remove",
        confirmer: "Remove this idea from the site?",
        envoi: "* Saving…",
        merci: "* Your idea is on the site!",
        echec: "* Oops, the idea wasn't saved. Try again.",
        manque: "* You need a title and some text.",
      };

  var liste = document.getElementById("liste-idees");
  var etat = document.getElementById("etat");
  var boutonEcrire = document.getElementById("ecrire");
  var boutonVerrou = document.getElementById("verrouiller");
  var fenetre = document.getElementById("dialogue-idee");
  var form = document.getElementById("form-idee");
  var erreur = document.getElementById("erreur-idee");
  var sauver = document.getElementById("sauver-idee");

  function majVerrou() {
    var ouvert = !!J.code();
    boutonVerrou.hidden = !ouvert;
    liste.querySelectorAll(".effacer").forEach(function (b) {
      b.hidden = !ouvert;
    });
  }

  function afficher(idees) {
    liste.replaceChildren();
    etat.textContent = idees.length ? "" : mots.vide;
    idees.forEach(function (idee) {
      var article = document.createElement("article");
      article.className = "idee";

      var h2 = document.createElement("h2");
      h2.textContent = idee.titre;
      var date = document.createElement("p");
      date.className = "date";
      date.textContent = new Date(idee.date).toLocaleDateString(langue, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      var texte = document.createElement("p");
      texte.className = "texte-idee";
      texte.textContent = idee.texte;

      var effacer = document.createElement("button");
      effacer.type = "button";
      effacer.className = "effacer bouton-petit";
      effacer.textContent = mots.retirer;
      effacer.addEventListener("click", function () {
        if (!confirm(mots.confirmer)) return;
        J.api("/api/idees?id=" + encodeURIComponent(idee.id), { method: "DELETE" }).then(function (r) {
          if (r.ok) charger();
          majVerrou();
        });
      });

      article.append(h2, date, texte, effacer);
      liste.appendChild(article);
    });
    majVerrou();
  }

  function charger(message) {
    etat.textContent = mots.chargement;
    fetch("/api/idees", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(function (d) {
        afficher(d.idees);
        if (message) etat.textContent = message;
      })
      .catch(function () {
        etat.textContent = mots.erreurListe;
      });
  }

  // Le brouillon reste sur l'appareil : rien n'est perdu si la fenêtre se ferme
  function lireBrouillon() {
    try {
      return JSON.parse(localStorage.getItem(BROUILLON) || "{}");
    } catch (e) {
      return {};
    }
  }

  function garderBrouillon() {
    try {
      localStorage.setItem(BROUILLON, JSON.stringify({ titre: form.titre.value, texte: form.texte.value }));
    } catch (e) {}
  }

  function effacerBrouillon() {
    try {
      localStorage.removeItem(BROUILLON);
    } catch (e) {}
  }

  form.addEventListener("input", garderBrouillon);

  boutonEcrire.addEventListener("click", function () {
    J.demanderCode().then(function (ok) {
      majVerrou();
      if (!ok) return;
      var brouillon = lireBrouillon();
      form.titre.value = brouillon.titre || "";
      form.texte.value = brouillon.texte || "";
      erreur.textContent = "";
      fenetre.showModal();
    });
  });

  document.getElementById("annuler-idee").addEventListener("click", function () {
    fenetre.close();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var titre = form.titre.value.trim();
    var texte = form.texte.value.trim();
    if (!titre || !texte) {
      erreur.textContent = mots.manque;
      return;
    }
    sauver.disabled = true;
    erreur.textContent = mots.envoi;
    J.api("/api/idees", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ titre: titre, texte: texte }),
    })
      .then(function (r) {
        if (!r.ok) throw new Error();
        effacerBrouillon();
        fenetre.close();
        charger(mots.merci);
      })
      .catch(function () {
        erreur.textContent = mots.echec;
        majVerrou();
      })
      .finally(function () {
        sauver.disabled = false;
      });
  });

  boutonVerrou.addEventListener("click", function () {
    J.oublier();
    majVerrou();
  });

  charger();
})();
