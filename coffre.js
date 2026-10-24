// Le coffre : garde le code secret de Fakefile sur cet appareil et parle aux adresses /api/...
// Seul quelqu'un qui connaît le code peut ajouter ou retirer des dessins et des idées.
window.Jarona = (function () {
  var CLE = "jarona-code";
  var fr = document.documentElement.lang.indexOf("fr") === 0;

  var mots = fr
    ? {
        titre: "🔒 Code secret",
        explication: "* Seul Fakefile peut ajouter des choses ici. Écris le code secret.",
        champ: "Code secret",
        ok: "Entrer",
        annuler: "Annuler",
        mauvais: "* Ce n'est pas le bon code.",
        pasConfigure: "* Le code n'est pas encore prêt. Demande à ton père.",
        reseau: "* Oups, la connexion ne marche pas. Réessaie.",
      }
    : {
        titre: "🔒 Secret code",
        explication: "* Only Fakefile can add things here. Type the secret code.",
        champ: "Secret code",
        ok: "Enter",
        annuler: "Cancel",
        mauvais: "* That's not the right code.",
        pasConfigure: "* The code isn't ready yet. Ask your dad.",
        reseau: "* Oops, the connection isn't working. Try again.",
      };

  function code() {
    try {
      return localStorage.getItem(CLE) || "";
    } catch (e) {
      return "";
    }
  }

  function garder(valeur) {
    try {
      localStorage.setItem(CLE, valeur);
    } catch (e) {}
  }

  function oublier() {
    try {
      localStorage.removeItem(CLE);
    } catch (e) {}
  }

  // Appelle une adresse /api/... avec le code ; un code refusé est oublié
  function api(url, options) {
    options = options || {};
    var entetes = Object.assign({}, options.headers, { "x-code": code() });
    return fetch(url, Object.assign({}, options, { headers: entetes })).then(function (r) {
      if (r.status === 401) oublier();
      return r;
    });
  }

  // Construit la petite fenêtre du code (une seule fois)
  var fenetre;
  function construireFenetre() {
    fenetre = document.createElement("dialog");
    fenetre.className = "dialogue-boite";

    var form = document.createElement("form");
    var h2 = document.createElement("h2");
    h2.textContent = mots.titre;
    var p = document.createElement("p");
    p.textContent = mots.explication;

    var label = document.createElement("label");
    label.textContent = mots.champ;
    var champ = document.createElement("input");
    champ.type = "password";
    champ.name = "code";
    champ.required = true;
    champ.autocomplete = "current-password";
    label.appendChild(champ);

    var erreur = document.createElement("p");
    erreur.className = "erreur";
    erreur.setAttribute("aria-live", "polite");

    var boutons = document.createElement("div");
    boutons.className = "boutons";
    var annuler = document.createElement("button");
    annuler.type = "button";
    annuler.className = "bouton-petit";
    annuler.textContent = mots.annuler;
    var ok = document.createElement("button");
    ok.type = "submit";
    ok.className = "bouton";
    ok.textContent = mots.ok;
    boutons.append(annuler, ok);

    form.append(h2, p, label, erreur, boutons);
    fenetre.appendChild(form);
    document.body.appendChild(fenetre);

    fenetre.champ = champ;
    fenetre.erreur = erreur;
    fenetre.form = form;
    fenetre.annuler = annuler;
    fenetre.ok = ok;
  }

  // Renvoie une promesse : true si le code est connu (déjà gardé ou bien entré)
  function demanderCode() {
    if (code()) return Promise.resolve(true);
    if (!fenetre) construireFenetre();

    return new Promise(function (resoudre) {
      fenetre.champ.value = "";
      fenetre.erreur.textContent = "";

      function fermer(resultat) {
        fenetre.form.onsubmit = null;
        fenetre.annuler.onclick = null;
        fenetre.onclose = null;
        if (fenetre.open) fenetre.close();
        resoudre(resultat);
      }

      fenetre.annuler.onclick = function () {
        fermer(false);
      };
      fenetre.onclose = function () {
        resoudre(!!code());
      };
      fenetre.form.onsubmit = function (e) {
        e.preventDefault();
        var valeur = fenetre.champ.value.trim();
        if (!valeur) return;
        fenetre.ok.disabled = true;
        fetch("/api/code", { method: "POST", headers: { "x-code": valeur } })
          .then(function (r) {
            if (r.ok) {
              garder(valeur);
              fermer(true);
            } else {
              fenetre.erreur.textContent = r.status === 503 ? mots.pasConfigure : mots.mauvais;
            }
          })
          .catch(function () {
            fenetre.erreur.textContent = mots.reseau;
          })
          .finally(function () {
            fenetre.ok.disabled = false;
          });
      };

      fenetre.showModal();
      fenetre.champ.focus();
    });
  }

  return { fr: fr, code: code, oublier: oublier, api: api, demanderCode: demanderCode };
})();
