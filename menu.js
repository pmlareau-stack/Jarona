// Le menu de l'accueil : le cœur rouge suit le joueur, comme dans un jeu.
// Flèches du clavier pour bouger le cœur, Entrée (ou Z) pour choisir.
// La souris et le doigt bougent aussi le cœur.
(function () {
  var menu = document.querySelector(".menu-joueur");
  if (!menu) return;

  var choix = Array.prototype.slice.call(menu.querySelectorAll("li"));
  var liens = choix.map(function (li) {
    return li.querySelector("a");
  });
  var actuel = 0;

  function choisir(index, avecFocus) {
    actuel = (index + choix.length) % choix.length;
    choix.forEach(function (li, i) {
      li.classList.toggle("choisi", i === actuel);
    });
    if (avecFocus) liens[actuel].focus({ preventScroll: true });
  }

  choix.forEach(function (li, i) {
    li.addEventListener("mouseenter", function () {
      choisir(i);
    });
    li.addEventListener("pointerdown", function () {
      choisir(i);
    });
    liens[i].addEventListener("focus", function () {
      choisir(i);
    });
  });

  // Quand le menu n'est pas à l'écran, les flèches font défiler la page comme d'habitude
  function menuALEcran() {
    var r = menu.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  document.addEventListener("keydown", function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var dansMenu = menu.contains(e.target);
    var surLaPage = e.target === document.body || e.target === document.documentElement;
    if (!dansMenu && !(surLaPage && menuALEcran())) return;

    var cle = e.key;
    if (cle === "ArrowDown" || cle === "ArrowRight") {
      e.preventDefault();
      choisir(actuel + 1, true);
    } else if (cle === "ArrowUp" || cle === "ArrowLeft") {
      e.preventDefault();
      choisir(actuel - 1, true);
    } else if (cle === "z" || cle === "Z" || (cle === "Enter" && !dansMenu)) {
      // Dans le menu, Entrée ouvre déjà le lien tout seul
      e.preventDefault();
      liens[actuel].click();
    }
  });

  choisir(0);
})();
