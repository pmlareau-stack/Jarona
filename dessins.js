// Mes dessins : la galerie + le trombone pour en ajouter
(function () {
  var J = window.Jarona;
  var mots = J.fr
    ? {
        vide: "* Pas encore de dessin. Bientôt !",
        chargement: "* Chargement…",
        erreurListe: "* Les dessins ne veulent pas s'afficher. Réessaie plus tard.",
        sansTitre: "Dessin de Fakefile",
        retirer: "🗑 Retirer",
        confirmer: "Retirer ce dessin du site ?",
        envoi: "* Envoi du dessin…",
        merci: "* Ton dessin est sur le site !",
        format: "* Cette image ne marche pas. Essaie une photo JPG ou PNG.",
        echec: "* Oups, le dessin n'est pas parti. Réessaie.",
        choisir: "* Choisis d'abord un dessin.",
      }
    : {
        vide: "* No drawings yet. Coming soon!",
        chargement: "* Loading…",
        erreurListe: "* The drawings won't show up. Try again later.",
        sansTitre: "Drawing by Fakefile",
        retirer: "🗑 Remove",
        confirmer: "Remove this drawing from the site?",
        envoi: "* Sending the drawing…",
        merci: "* Your drawing is on the site!",
        format: "* This picture doesn't work. Try a JPG or PNG photo.",
        echec: "* Oops, the drawing didn't go through. Try again.",
        choisir: "* Pick a drawing first.",
      };

  var galerie = document.getElementById("galerie");
  var etat = document.getElementById("etat");
  var boutonAjouter = document.getElementById("ajouter");
  var boutonVerrou = document.getElementById("verrouiller");
  var fenetre = document.getElementById("dialogue-dessin");
  var form = document.getElementById("form-dessin");
  var apercu = document.getElementById("apercu");
  var erreur = document.getElementById("erreur-dessin");
  var sauver = document.getElementById("sauver-dessin");
  var image = null;

  function majVerrou() {
    var ouvert = !!J.code();
    boutonVerrou.hidden = !ouvert;
    galerie.querySelectorAll(".effacer").forEach(function (b) {
      b.hidden = !ouvert;
    });
  }

  function afficher(dessins) {
    galerie.replaceChildren();
    etat.textContent = dessins.length ? "" : mots.vide;
    dessins.forEach(function (d) {
      var li = document.createElement("li");
      li.className = "carte-dessin";

      var lien = document.createElement("a");
      lien.href = d.image;
      lien.target = "_blank";
      lien.rel = "noopener";
      var img = document.createElement("img");
      img.src = d.image;
      img.alt = d.titre || mots.sansTitre;
      img.loading = "lazy";
      lien.appendChild(img);
      li.appendChild(lien);

      if (d.titre) {
        var titre = document.createElement("p");
        titre.className = "legende";
        titre.textContent = d.titre;
        li.appendChild(titre);
      }

      var effacer = document.createElement("button");
      effacer.type = "button";
      effacer.className = "effacer bouton-petit";
      effacer.textContent = mots.retirer;
      effacer.addEventListener("click", function () {
        if (!confirm(mots.confirmer)) return;
        J.api("/api/dessins?id=" + encodeURIComponent(d.id), { method: "DELETE" }).then(function (r) {
          if (r.ok) charger();
          majVerrou();
        });
      });
      li.appendChild(effacer);

      galerie.appendChild(li);
    });
    majVerrou();
  }

  function charger(message) {
    etat.textContent = mots.chargement;
    fetch("/api/dessins", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(function (d) {
        afficher(d.dessins);
        if (message) etat.textContent = message;
      })
      .catch(function () {
        etat.textContent = mots.erreurListe;
      });
  }

  // Redessine l'image dans un canevas : elle devient plus légère (1600 px au plus)
  // et perd les informations cachées de la photo, comme l'endroit où elle a été prise.
  function preparer(fichier) {
    return createImageBitmap(fichier, { imageOrientation: "from-image" }).then(function (bitmap) {
      var echelle = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
      var canevas = document.createElement("canvas");
      canevas.width = Math.round(bitmap.width * echelle);
      canevas.height = Math.round(bitmap.height * echelle);
      var ctx = canevas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canevas.width, canevas.height);
      ctx.drawImage(bitmap, 0, 0, canevas.width, canevas.height);
      return new Promise(function (ok) {
        canevas.toBlob(ok, "image/webp", 0.85);
      }).then(function (blob) {
        if (blob && blob.type === "image/webp") return blob;
        return new Promise(function (ok) {
          canevas.toBlob(ok, "image/jpeg", 0.88);
        });
      });
    });
  }

  form.fichier.addEventListener("change", function () {
    erreur.textContent = "";
    image = null;
    apercu.hidden = true;
    var fichier = form.fichier.files[0];
    if (!fichier) return;
    preparer(fichier)
      .then(function (blob) {
        image = blob;
        apercu.src = URL.createObjectURL(blob);
        apercu.hidden = false;
      })
      .catch(function () {
        erreur.textContent = mots.format;
      });
  });

  boutonAjouter.addEventListener("click", function () {
    J.demanderCode().then(function (ok) {
      majVerrou();
      if (!ok) return;
      form.reset();
      image = null;
      apercu.hidden = true;
      erreur.textContent = "";
      fenetre.showModal();
    });
  });

  document.getElementById("annuler-dessin").addEventListener("click", function () {
    fenetre.close();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!image) {
      erreur.textContent = mots.choisir;
      return;
    }
    sauver.disabled = true;
    erreur.textContent = mots.envoi;
    J.api("/api/dessins", {
      method: "POST",
      headers: { "content-type": image.type, "x-titre": encodeURIComponent(form.titre.value.trim()) },
      body: image,
    })
      .then(function (r) {
        if (!r.ok) throw new Error();
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
