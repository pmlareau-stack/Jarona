// La boîte à musique de Flowery
// Quand on clique une musique, le lecteur YouTube officiel s'ouvre et la joue.
// Les musiques restent sur la chaîne de Toby Fox : on ne copie jamais les fichiers sur le site.
(function () {
  var boite = document.getElementById("musique");
  if (!boite) return;

  var ecran = boite.querySelector(".ecran-musique");
  var enCours = boite.querySelector(".en-cours");
  var boutons = boite.querySelectorAll(".pistes button");
  var prefixe = boite.getAttribute("data-prefixe") || "";

  function jouer(bouton) {
    var video = bouton.getAttribute("data-video");

    var lecteur = document.createElement("iframe");
    lecteur.src = "https://www.youtube-nocookie.com/embed/" + video + "?autoplay=1&rel=0&playsinline=1";
    lecteur.title = bouton.textContent.trim();
    lecteur.allow = "autoplay; encrypted-media; picture-in-picture";
    lecteur.allowFullscreen = true;
    lecteur.referrerPolicy = "strict-origin-when-cross-origin";

    ecran.replaceChildren(lecteur);

    boutons.forEach(function (b) {
      b.setAttribute("aria-pressed", b === bouton ? "true" : "false");
    });
    enCours.textContent = prefixe + " " + bouton.textContent.trim();
  }

  boutons.forEach(function (bouton) {
    bouton.addEventListener("click", function () {
      jouer(bouton);
    });
  });
})();
