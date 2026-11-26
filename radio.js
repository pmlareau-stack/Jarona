// La radio de Flowery et la musique d'Undertale
// Quand on clique une musique, le lecteur YouTube officiel s'ouvre et la joue.
// Les musiques restent sur les chaînes officielles : on ne copie jamais les fichiers sur le site.
// Chaque boîte « .musique » a son lecteur. Avec data-liste, les chansons suivantes de la liste jouent toutes seules.
// Un seul lecteur joue à la fois : en ouvrir un ferme les autres.
(function () {
  var boites = Array.prototype.slice.call(document.querySelectorAll(".musique"));
  if (!boites.length) return;

  var radios = boites.map(function (boite) {
    var ecran = boite.querySelector(".ecran-musique");
    return {
      boite: boite,
      ecran: ecran,
      accueil: ecran ? Array.prototype.slice.call(ecran.childNodes).map(function (n) { return n.cloneNode(true); }) : [],
      enCours: boite.querySelector(".en-cours"),
      boutons: Array.prototype.slice.call(boite.querySelectorAll(".pistes button")),
      prefixe: boite.getAttribute("data-prefixe") || "",
      liste: boite.getAttribute("data-liste") || "",
    };
  });

  function arreter(radio) {
    if (!radio.ecran || !radio.ecran.querySelector("iframe")) return;
    radio.ecran.replaceChildren.apply(radio.ecran, radio.accueil.map(function (n) { return n.cloneNode(true); }));
    radio.boutons.forEach(function (b) {
      b.setAttribute("aria-pressed", "false");
    });
    if (radio.enCours) radio.enCours.textContent = "";
  }

  function jouer(radio, bouton) {
    radios.forEach(function (autre) {
      if (autre !== radio) arreter(autre);
    });

    var video = bouton.getAttribute("data-video");
    var adresse = "https://www.youtube-nocookie.com/embed/" + video + "?autoplay=1&rel=0&playsinline=1";
    if (radio.liste) adresse += "&list=" + encodeURIComponent(radio.liste);

    var lecteur = document.createElement("iframe");
    lecteur.src = adresse;
    lecteur.title = bouton.textContent.trim();
    lecteur.allow = "autoplay; encrypted-media; picture-in-picture";
    lecteur.allowFullscreen = true;
    lecteur.referrerPolicy = "strict-origin-when-cross-origin";

    radio.ecran.replaceChildren(lecteur);

    radio.boutons.forEach(function (b) {
      b.setAttribute("aria-pressed", b === bouton ? "true" : "false");
    });
    if (radio.enCours) radio.enCours.textContent = radio.prefixe + " " + bouton.textContent.trim();
  }

  radios.forEach(function (radio) {
    if (!radio.ecran) return;
    radio.boutons.forEach(function (bouton) {
      bouton.addEventListener("click", function () {
        jouer(radio, bouton);
      });
    });
  });
})();
